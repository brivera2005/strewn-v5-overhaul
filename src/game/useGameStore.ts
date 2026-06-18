import {
  CHOICE_TICK,
  TICK_MS_BASE,
  VECTOR_LABELS,
  MATCH_SCORES,
  type PainVector,
} from './constants';
import {
  applyTickResult,
  checkEndConditions,
  computeScore,
  simulateTick,
} from './Simulation';
import {
  createInitialState,
  initOverworldMode,
  persistState,
  musicEngine,
  optimizeCriticalAssignments,
  simulateMultiPatientTick,
} from './gameState';
import { loadGame } from './saveGame';
import type { GameState, TutorialStep, UndoAction, OverworldTutorialStep } from './State';
import type { UpgradeCard } from './upgrades';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  applyCurrencyDelta,
  computeTickCurrencyRewards,
  rankFromDalys,
} from './currencies';
import {
  applyUpgradeEffect,
  pickRandomUpgrades,
} from './upgrades';
import {
  getComboMultiplier,
  updateCombo,
  updateObjectives,
} from './objectives';
import { RESEARCH_NODES } from './research';
import { spendResearch } from './currencies';
import { CYOA_START } from './tutorialFlow';
import {
  applyLootStats,
  DEFAULT_PLAYER_STATS,
  LOOT_TABLE,
  pickRandomLoot,
  rollLootDrop,
} from './loot';
import type { LootItem } from './loot';
import { unlockZoneForRank } from './overworldMap';

let toastIdCounter = 0;

function addToast(state: GameState, text: string, type: GameState['toasts'][0]['type'] = 'info'): GameState {
  toastIdCounter += 1;
  const toasts = [...state.toasts, { id: toastIdCounter, text, type }].slice(-5);
  return { ...state, toasts };
}

function addAlert(state: GameState, message: string, severity: GameState['alerts'][0]['severity'], patientId?: string): GameState {
  const alert = {
    id: `alert-${state.tick}-${Date.now()}`,
    tick: state.tick,
    severity,
    message,
    patientId,
  };
  return { ...state, alerts: [alert, ...state.alerts].slice(0, 20) };
}

function effectivePlayerStats(state: GameState) {
  const items = state.inventory
    .map((o) => LOOT_TABLE.find((l) => l.id === o.id))
    .filter(Boolean) as LootItem[];
  return applyLootStats(state.playerStats, items);
}

export function useGameStore() {
  const [state, setState] = useState<GameState>(() => {
    const s = createInitialState();
    return { ...s, hasSave: !!loadGame() };
  });
  const tickTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const rippleIdRef = useRef(0);
  const highlightRef = useRef<string | null>(null);
  const [highlightPatientId, setHighlightPatientId] = useState<string | null>(null);

  const dismissToast = useCallback((id: number) => {
    setState((s) => ({ ...s, toasts: s.toasts.filter((t) => t.id !== id) }));
  }, []);

  useEffect(() => {
    musicEngine.setMuted(state.settings.muted);
    musicEngine.setMusicVolume(state.settings.musicVolume);
  }, [state.settings.muted, state.settings.musicVolume]);

  useEffect(() => {
    if (state.screen === 'start' || state.screen === 'cyoa') {
      musicEngine.resume();
      musicEngine.crossfadeTo('title_theme');
    } else if (state.screen === 'triage' || state.screen === 'overworld') {
      musicEngine.resume();
      const critical = state.patients.filter((p) => !p.dead && (p.status === 'critical' || p.status === 'dying')).length;
      musicEngine.crossfadeTo(critical > 3 ? 'crisis_theme' : 'gameplay_ambient');
    } else if (state.screen === 'chapter0') {
      musicEngine.resume();
      musicEngine.crossfadeTo('gameplay_ambient');
    }
  }, [state.screen, state.patients]);

  const triggerRipple = useCallback((event?: React.MouseEvent) => {
    if (event) {
      rippleIdRef.current += 1;
      setState((s) => ({
        ...s,
        ripple: { x: event.clientX, y: event.clientY, id: rippleIdRef.current },
      }));
      setTimeout(() => {
        setState((s) => (s.ripple?.id === rippleIdRef.current ? { ...s, ripple: null } : s));
      }, 600);
    }
  }, []);

  const playClick = useCallback(() => {
    musicEngine.playSfx('ui_click');
  }, []);

  const undoLast = useCallback(() => {
    setState((s) => {
      const last = s.undoStack[s.undoStack.length - 1];
      if (!last || last.type !== 'assign') return s;
      const undoStack = s.undoStack.slice(0, -1);
      const patients = s.patients.map((p) =>
        p.id === last.patientId ? { ...p, allocations: last.previousAllocations } : p,
      );
      const participants = s.participants.map((p) =>
        p.id === last.helperId ? { ...p, assignedPatientId: last.previousHelperAssignment ?? null } : p,
      );
      const helper = s.participants.find((p) => p.id === last.helperId);
      const patient = s.patients.find((p) => p.id === last.patientId);
      const next = addToast(
        { ...s, patients, participants, undoStack },
        `Undid assignment${helper && patient ? `: ${helper.name.split(' ')[0]} from ${patient.name.split(' ')[0]}` : ''}`,
        'info',
      );
      persistState(next);
      return next;
    });
  }, []);

  const startNewGame = useCallback(
    (e?: React.MouseEvent) => {
      triggerRipple(e);
      playClick();
      setState(() => ({
        ...createInitialState(),
        screen: 'cyoa',
        cyoaNode: CYOA_START,
        hasSave: false,
      }));
    },
    [triggerRipple, playClick],
  );

  const continueGame = useCallback(
    (e?: React.MouseEvent) => {
      triggerRipple(e);
      playClick();
      const saved = loadGame();
      if (!saved) return;
      setState({
        ...createInitialState(),
        ...saved,
        screen: saved.screen === 'chapter0' || saved.screen === 'cyoa' || saved.screen === 'story'
          ? 'overworld'
          : saved.screen === 'triage'
            ? 'overworld'
            : saved.screen,
        hasSave: true,
        settings: { ...createInitialState().settings, ...saved.settings },
        activeUpgrades: saved.activeUpgrades ?? createInitialState().activeUpgrades,
        currencies: saved.currencies ?? createInitialState().currencies,
        objectives: saved.objectives?.length ? saved.objectives : createInitialState().objectives,
        cyoaNode: saved.cyoaNode ?? CYOA_START,
        cyoaFlags: saved.cyoaFlags ?? [],
        playerStats: saved.playerStats ?? { ...DEFAULT_PLAYER_STATS },
        inventory: saved.inventory ?? [],
        overworld: saved.overworld ?? createInitialState().overworld,
        showDeathVignette: false,
        ripple: null,
        toasts: [],
        alerts: [],
        undoStack: [],
        drawerPatientId: null,
        showShortcuts: false,
        showUpgradePicker: false,
        pendingUpgradeChoices: null,
        showLootPicker: false,
        pendingLootChoices: null,
      });
    },
    [triggerRipple, playClick],
  );

  const openSettings = useCallback(() => setState((s) => ({ ...s, screen: 'settings' })), []);
  const openCredits = useCallback(() => setState((s) => ({ ...s, screen: 'credits' })), []);
  const backToStart = useCallback(() => setState((s) => ({ ...s, screen: 'start' })), []);

  const cyoaChoose = useCallback(
    (nextId: string, flag?: string) => {
      playClick();
      setState((s) => ({
        ...s,
        cyoaNode: nextId,
        cyoaFlags: flag && !s.cyoaFlags.includes(flag) ? [...s.cyoaFlags, flag] : s.cyoaFlags,
      }));
    },
    [playClick],
  );

  const cyoaAdvance = useCallback(
    (target: 'chapter0' | 'triage' | 'overworld' | 'continue') => {
      playClick();
      setState((s) => {
        if (target === 'chapter0') {
          return {
            ...s,
            screen: 'chapter0',
            gameMode: 'chapter0',
            tutorialStep: 'select_sarah',
            paused: true,
            tick: 0,
          };
        }
        if (target === 'overworld' || target === 'triage') {
          const world = initOverworldMode({ ...s, chapter0Complete: target === 'triage' ? true : s.chapter0Complete });
          persistState(world);
          return { ...world, hasSave: true };
        }
        return s;
      });
    },
    [playClick],
  );

  const advanceTutorial = useCallback((completed: TutorialStep) => {
    const next: Record<TutorialStep, TutorialStep | null> = {
      select_sarah: 'assign_inflammatory',
      assign_inflammatory: 'press_play',
      press_play: 'assign_mike',
      assign_mike: 'complete',
      complete: null,
    };
    setState((s) => {
      const nextStep = next[completed];
      return {
        ...s,
        tutorialStep: nextStep,
        tutorialComplete: nextStep === 'complete' || nextStep === null,
      };
    });
  }, []);

  const selectParticipant = useCallback(
    (id: string, e?: React.MouseEvent) => {
      triggerRipple(e);
      playClick();
      setState((s) => {
        if (s.tutorialStep === 'select_sarah' && id !== 'sarah') return s;
        const newState = { ...s, selectedParticipantId: id };
        if (s.tutorialStep === 'select_sarah' && id === 'sarah') {
          setTimeout(() => advanceTutorial('select_sarah'), 300);
        }
        return newState;
      });
    },
    [triggerRipple, playClick, advanceTutorial],
  );

  const assignToVector = useCallback(
    (vector: PainVector, e?: React.MouseEvent) => {
      triggerRipple(e);
      musicEngine.playSfx('assign');
      setState((s) => {
        const pid = s.selectedParticipantId;
        if (!pid) return s;

        if (s.tutorialStep === 'assign_inflammatory') {
          if (pid !== 'sarah' || vector !== 'inflammatory') return s;
        }
        if (s.tutorialStep === 'assign_mike') {
          if (pid !== 'mike' || vector !== 'systemic') return s;
        }

        const helper = s.participants.find((p) => p.id === pid);
        const existing = s.allocations.findIndex((a) => a.participantId === pid);
        const newAlloc = { participantId: pid, vector, weight: 100 };
        const allocations = [...s.allocations];
        if (existing >= 0) allocations[existing] = newAlloc;
        else allocations.push(newAlloc);

        let next = addToast(
          { ...s, allocations, selectedParticipantId: null },
          `Assigned ${helper?.name.split(' ')[0] ?? 'helper'} to ${VECTOR_LABELS[vector]}`,
          'success',
        );

        if (s.tutorialStep === 'assign_inflammatory' && pid === 'sarah' && vector === 'inflammatory') {
          setTimeout(() => advanceTutorial('assign_inflammatory'), 300);
        }
        if (s.tutorialStep === 'assign_mike' && pid === 'mike' && vector === 'systemic') {
          setTimeout(() => advanceTutorial('assign_mike'), 300);
        }

        return next;
      });
    },
    [triggerRipple, advanceTutorial],
  );

  const togglePause = useCallback(
    (e?: React.MouseEvent) => {
      triggerRipple(e);
      playClick();
      setState((s) => {
        if (s.tutorialStep === 'press_play' && s.paused) {
          setTimeout(() => advanceTutorial('press_play'), 300);
        }
        return { ...s, paused: !s.paused };
      });
    },
    [triggerRipple, playClick, advanceTutorial],
  );

  const setSpeed = useCallback((speed: 1 | 2 | 3) => {
    setState((s) => ({ ...s, speed: speed as GameState['speed'] }));
  }, []);

  const setMusicVolume = useCallback((v: number) => {
    setState((s) => ({ ...s, settings: { ...s.settings, musicVolume: v } }));
  }, []);

  const setSetting = useCallback(
    (key: 'pauseOnCritical' | 'tickSpeedMultiplier' | 'smartDefaults', value: boolean | 1 | 0.5 | 0.25) => {
      setState((s) => ({ ...s, settings: { ...s.settings, [key]: value } }));
    },
    [],
  );

  const toggleMute = useCallback(() => {
    setState((s) => ({ ...s, settings: { ...s.settings, muted: !s.settings.muted } }));
  }, []);

  const choosePath = useCallback(
    (path: 'strewn' | 'endure', e?: React.MouseEvent) => {
      triggerRipple(e);
      playClick();
      setState((s) => ({
        ...s,
        pathChoice: path,
        choiceMade: true,
        showPathChoice: false,
        immunityBonus: path === 'endure' ? 0.08 : 0,
      }));
    },
    [triggerRipple, playClick],
  );

  const toggleHelp = useCallback(() => {
    setState((s) => ({ ...s, showHelp: !s.showHelp, showShortcuts: false }));
  }, []);

  const toggleShortcuts = useCallback(() => {
    setState((s) => ({ ...s, showShortcuts: !s.showShortcuts, showHelp: false }));
  }, []);

  const restart = useCallback(() => {
    setState({ ...createInitialState(), hasSave: !!loadGame() });
  }, []);

  const pickUpgrade = useCallback((card: UpgradeCard) => {
    setState((s) => {
      let next: GameState = {
        ...s,
        ownedUpgrades: [...s.ownedUpgrades, card.id],
        activeUpgrades: applyUpgradeEffect(s.activeUpgrades, card),
        showUpgradePicker: false,
        pendingUpgradeChoices: null,
      };
      if (card.effect.type === 'rp_bonus') {
        next.currencies = { ...next.currencies, reliefPoints: next.currencies.reliefPoints + card.effect.value };
      }
      if (card.effect.type === 'trust_bonus') {
        next.currencies = { ...next.currencies, trust: Math.min(100, next.currencies.trust + card.effect.value) };
      }
      if (card.effect.type === 'volunteer_pool') {
        next.participantPoolSize += card.effect.value;
      }
      next = addToast(next, `Unlocked: ${card.name}`, 'success');
      persistState(next);
      return next;
    });
  }, []);

  const pickLoot = useCallback((item: LootItem) => {
    setState((s) => {
      const next = addToast(
        {
          ...s,
          inventory: [...s.inventory, { id: item.id, acquiredTick: s.tick }],
          showLootPicker: false,
          pendingLootChoices: null,
        },
        `Acquired: ${item.name}`,
        'success',
      );
      musicEngine.playSfx('level_up');
      persistState(next);
      return next;
    });
  }, []);

  const unlockResearch = useCallback((nodeId: string) => {
    setState((s) => {
      const node = RESEARCH_NODES.find((n) => n.id === nodeId);
      if (!node || s.researchUnlocked.includes(nodeId)) return s;
      const spent = spendResearch(s.currencies, node.cost);
      if (!spent) return addToast(s, 'Not enough Research Points', 'warning');
      let next: GameState = {
        ...s,
        currencies: spent,
        researchUnlocked: [...s.researchUnlocked, nodeId],
      };
      if (node.id === 'vol-drive') next.participantPoolSize += 5;
      if (node.id === 'pr-campaign') next.currencies = { ...next.currencies, trust: Math.min(100, next.currencies.trust + 10) };
      next = addToast(next, `Research unlocked: ${node.name} - ${node.benefit}`, 'success');
      musicEngine.playSfx('research_unlock');
      persistState(next);
      return next;
    });
  }, []);

  const runChapter0Tick = useCallback(() => {
    setState((s) => {
      if (s.screen !== 'chapter0' || s.paused || s.endReason) return s;
      if (s.showPathChoice) return s;

      const draft = structuredClone(s) as GameState;
      draft.tick += 1;
      musicEngine.playSfx('tick');

      const stats = effectivePlayerStats(draft);
      const result = simulateTick(draft);
      applyTickResult(draft, result);

      if (draft.tick === CHOICE_TICK && !draft.choiceMade) {
        draft.showPathChoice = true;
        draft.paused = true;
      }

      const endReason = checkEndConditions(draft);
      if (endReason) {
        draft.endReason = endReason;
        draft.score = computeScore(draft);
        if (endReason === 'win') {
          draft.chapter0Complete = true;
          draft.screen = 'cyoa';
          draft.cyoaNode = 'after_win';
          draft.paused = true;
          persistState(draft);
          return draft;
        }
        draft.screen = 'result';
        draft.paused = true;
      }

      void stats;
      return draft;
    });
  }, []);

  const runTriageTick = useCallback(() => {
    setState((s) => {
      if (s.screen !== 'triage' && s.screen !== 'overworld' || s.paused) return s;

      const draft = structuredClone(s) as GameState;
      draft.tick += 1;
      musicEngine.playSfx('tick');

      const stats = effectivePlayerStats(draft);
      const reliefBonus = stats.reliefPower + draft.activeUpgrades.reliefTransferBonus;

      const result = simulateMultiPatientTick(draft, draft.participants);
      let hadDeath = false;

      for (const entry of result.ledgerEntries) {
        draft.ledger.unshift(entry);
        if (entry.category === 'STABILIZE') {
          draft.triageStats.stabilized += 1;
          draft.triageStats.dalysSaved += 5;
          draft.dalysSaved += 5;
          musicEngine.playSfx('relief');
          musicEngine.playSting('success_sting');
          draft.reliefFlash = Date.now();
          draft.objectives = updateObjectives(draft.objectives, { type: 'stabilize' });

          const drops = rollLootDrop(draft.streakTicks, draft.directorRank);
          if (drops.length > 0 && !draft.showLootPicker) {
            draft.pendingLootChoices = pickRandomLoot(
              draft.inventory.map((i) => i.id),
              Math.min(3, drops.length),
            );
            draft.showLootPicker = draft.pendingLootChoices.length > 0;
          }
        }
        if (entry.category === 'DEATH') {
          draft.triageStats.deaths += 1;
          draft.triageStats.memorialCount += 1;
          hadDeath = true;
          draft.showDeathVignette = true;
          draft.streakTicks = 0;
          musicEngine.playSting('death_sting');
          setTimeout(() => setState((x) => ({ ...x, showDeathVignette: false })), 1500);
        }
      }

      if (!hadDeath) draft.streakTicks += 1;

      const comboMult = getComboMultiplier(draft.combo, Date.now(), draft.activeUpgrades.comboDurationBonus);
      const comboBoost = 1 + stats.comboYield;
      const currencyDelta = computeTickCurrencyRewards(
        result.stabilizedThisTick.length,
        (result.reliefPerTick + draft.activeUpgrades.tickReliefBonus) * (1 + reliefBonus),
        result.deathsThisTick.length,
        draft.streakTicks,
        comboMult * comboBoost,
      );
      draft.currencies = applyCurrencyDelta(draft.currencies, currencyDelta);
      draft.objectives = updateObjectives(draft.objectives, { type: 'trust', value: draft.currencies.trust });

      let draftMut = draft as GameState;
      const newRank = rankFromDalys(draftMut.dalysSaved);
      if (newRank > draftMut.directorRank) {
        draftMut.directorRank = newRank;
        draftMut.pendingUpgradeChoices = pickRandomUpgrades(draftMut.ownedUpgrades, 3);
        draftMut.showUpgradePicker = true;
        musicEngine.playSfx('level_up');
        draftMut = addAlert(draftMut, `Rank up! Director Rank ${newRank}`, 'info');
      }

      if (draftMut.activeUpgrades.autoRestVolunteers) {
        draftMut.participants = draftMut.participants.map((p) =>
          p.le < 30 ? { ...p, le: Math.min(100, p.le + 5) } : p,
        );
      }

      if (draftMut.tick % 10 === 0 && draftMut.participantPoolSize < 30) {
        draftMut.participantPoolSize = Math.min(30, draftMut.participantPoolSize + 1);
      }

      if (draftMut.settings.pauseOnCritical) {
        const newlyDying = draftMut.patients.some(
          (p) => !p.dead && p.status === 'dying' && result.deathsThisTick.length === 0,
        );
        if (newlyDying && !hadDeath) {
          draftMut.paused = true;
          draftMut = addAlert(draftMut, 'Patient entering dying state - simulation paused', 'critical');
        }
      }

      persistState(draftMut);
      return draftMut;
    });
  }, []);

  const runTick = state.screen === 'triage' || state.screen === 'overworld' ? runTriageTick : runChapter0Tick;

  useEffect(() => {
    if (tickTimerRef.current) {
      clearInterval(tickTimerRef.current);
      tickTimerRef.current = null;
    }

    const isPlaying =
      (state.screen === 'chapter0' || state.screen === 'triage' || state.screen === 'overworld') &&
      !state.paused &&
      !state.endReason &&
      !state.showPathChoice &&
      !state.showUpgradePicker &&
      !state.showLootPicker &&
      !state.overworld.showCommandMenu;

    if (isPlaying) {
      const ms = (TICK_MS_BASE / state.speed) / state.settings.tickSpeedMultiplier;
      tickTimerRef.current = setInterval(runTick, ms);
    }

    return () => {
      if (tickTimerRef.current) clearInterval(tickTimerRef.current);
    };
  }, [
    state.screen,
    state.paused,
    state.speed,
    state.settings.tickSpeedMultiplier,
    state.endReason,
    state.showPathChoice,
    state.showUpgradePicker,
    state.showLootPicker,
    state.overworld.showCommandMenu,
    runTick,
  ]);

  const selectPatient = useCallback((id: string, ctrlKey: boolean) => {
    setState((s) => {
      let selected = [...s.selectedPatientIds];
      if (ctrlKey) {
        if (selected.includes(id)) selected = selected.filter((x) => x !== id);
        else selected.push(id);
      } else {
        selected = [id];
      }
      return { ...s, selectedPatientIds: selected, firstLaunchHints: false };
    });
    highlightRef.current = id;
    setHighlightPatientId(id);
    const row = document.getElementById(`patient-row-${id}`);
    row?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, []);

  const openDrawer = useCallback((id: string) => {
    setState((s) => ({ ...s, drawerPatientId: id, selectedPatientIds: [id] }));
  }, []);

  const closeDrawer = useCallback(() => {
    setState((s) => ({ ...s, drawerPatientId: null }));
  }, []);

  const setPatientPriority = useCallback((id: string, priority: 1 | 2 | 3 | null) => {
    setState((s) => {
      const next = {
        ...s,
        patients: s.patients.map((p) => (p.id === id ? { ...p, priority } : p)),
      };
      persistState(next);
      return next;
    });
  }, []);

  const setPatientFilter = useCallback((filter: GameState['patientFilter']) => {
    setState((s) => ({ ...s, patientFilter: filter }));
  }, []);

  const setPatientSearch = useCallback((q: string) => {
    setState((s) => ({ ...s, patientSearch: q }));
  }, []);

  const sortPatients = useCallback((col: keyof GameState['patients'][0]) => {
    setState((s) => ({
      ...s,
      sortColumn: col,
      sortAsc: s.sortColumn === col ? !s.sortAsc : true,
    }));
  }, []);

  const setTriageTab = useCallback((tab: GameState['triageTab']) => {
    setState((s) => ({ ...s, triageTab: tab }));
  }, []);

  const optimizeTriage = useCallback(() => {
    musicEngine.playSfx('assign');
    setState((s) => {
      const draft = structuredClone(s) as GameState;
      optimizeCriticalAssignments(draft.patients, draft.participants);
      persistState(draft);
      return addToast(draft, 'Optimized critical patients first', 'success');
    });
  }, []);

  const assignHelperToPatient = useCallback(
    (patientId: string, helperId: string, vector: PainVector) => {
      musicEngine.playSfx('assign');
      setState((s) => {
        const patient = s.patients.find((p) => p.id === patientId);
        const helper = s.participants.find((p) => p.id === helperId);
        if (!patient || patient.dead) return s;

        const stats = effectivePlayerStats(s);
        const undoAction: UndoAction = {
          type: 'assign',
          patientId,
          helperId,
          previousAllocations: [...patient.allocations],
          previousHelperAssignment: helper?.assignedPatientId,
        };

        const patients = s.patients.map((p) => {
          if (p.id !== patientId || p.dead) return p;
          const filtered = p.allocations.filter((a) => a.participantId !== helperId);
          const bonus = 1 + s.activeUpgrades.matchQualityBonus + stats.reliefPower + stats.insight * 0.002;
          return {
            ...p,
            allocations: [...filtered, { participantId: helperId, vector, weight: 100 * bonus }],
            matchAvg: Math.min(99, p.matchAvg + 5 * bonus),
          };
        });
        const participants = s.participants.map((p) =>
          p.id === helperId ? { ...p, assignedPatientId: patientId } : p,
        );
        const combo = updateCombo(s.combo, Date.now(), s.activeUpgrades.comboDurationBonus);
        let next: GameState = {
          ...s,
          patients,
          participants,
          combo,
          objectives: updateObjectives(s.objectives, { type: 'assign' }),
          undoStack: [...s.undoStack, undoAction].slice(-10),
        };
        const reliefPct = Math.round((1 + stats.reliefPower) * 12);
        next = addToast(
          next,
          `Assigned ${helper?.name.split(' ')[0] ?? 'helper'} to ${VECTOR_LABELS[vector]} +${reliefPct}% relief`,
          'success',
        );
        next.reliefFlash = Date.now();
        persistState(next);
        return next;
      });
    },
    [],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === '?' && state.screen === 'triage') {
        e.preventDefault();
        toggleShortcuts();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && state.screen === 'triage') {
        e.preventDefault();
        undoLast();
      }
      if (e.key === ' ' && (state.screen === 'triage' || state.screen === 'chapter0')) {
        e.preventDefault();
        togglePause();
      }
      if (e.key === 'Escape') {
        setState((s) => ({
          ...s,
          drawerPatientId: null,
          showShortcuts: false,
          showHelp: false,
          overworld: { ...s.overworld, showCommandMenu: false },
          screen: s.overworld.showCommandMenu ? 'overworld' : s.screen,
        }));
      }
      if (e.key === 'o' && state.screen === 'triage') optimizeTriage();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [state.screen, toggleShortcuts, undoLast, togglePause, optimizeTriage]);

  const bulkAssignBest = useCallback(() => {
    setState((s) => {
      const draft = structuredClone(s) as GameState;
      const selected = draft.patients.filter((p) => s.selectedPatientIds.includes(p.id) && !p.dead);
      const available = draft.participants.filter((p) => p.active && p.le > 20 && !p.assignedPatientId);
      for (let i = 0; i < selected.length && i < available.length; i++) {
        const patient = selected[i];
        const helper = available[i];
        patient.allocations.push({
          participantId: helper.id,
          vector: patient.painLoad > 55 ? 'inflammatory' : 'systemic',
          weight: 100,
        });
        helper.assignedPatientId = patient.id;
      }
      persistState(draft);
      return addToast(draft, `Bulk assigned ${Math.min(selected.length, available.length)} patient(s)`, 'success');
    });
  }, []);

  const bulkEndure = useCallback(() => {
    setState((s) => {
      const patients = s.patients.map((p) =>
        s.selectedPatientIds.includes(p.id) && !p.dead
          ? { ...p, status: 'endured' as const, allocations: [] }
          : p,
      );
      const next = addToast({ ...s, patients }, 'Marked selected patients for Endure', 'info');
      persistState(next);
      return next;
    });
  }, []);

  const bulkSetPriority = useCallback((priority: 1 | 2 | 3) => {
    setState((s) => {
      const patients = s.patients.map((p) =>
        s.selectedPatientIds.includes(p.id) ? { ...p, priority } : p,
      );
      const next = addToast({ ...s, patients }, `Set P${priority} on ${s.selectedPatientIds.length} patient(s)`, 'info');
      persistState(next);
      return next;
    });
  }, []);

  const jumpToPatient = useCallback((patientId?: string) => {
    if (!patientId) return;
    selectPatient(patientId, false);
    openDrawer(patientId);
    setTriageTab('database');
  }, [selectPatient, openDrawer, setTriageTab]);

  const moveOverworldPlayer = useCallback((x: number, y: number, facing: GameState['overworld']['facing']) => {
    setState((s) => ({
      ...s,
      overworld: { ...s.overworld, playerX: x, playerY: y, facing },
    }));
  }, []);

  const changeZone = useCallback((zoneId: string, x: number, y: number) => {
    setState((s) => {
      const next = {
        ...s,
        overworld: { ...s.overworld, zoneId, playerX: x, playerY: y },
      };
      persistState(next);
      return next;
    });
    musicEngine.playSfx('ui_click');
  }, []);

  const toggleCommandMenu = useCallback(() => {
    setState((s) => ({
      ...s,
      overworld: { ...s.overworld, showCommandMenu: !s.overworld.showCommandMenu },
    }));
    playClick();
  }, [playClick]);

  const closeCommandMenu = useCallback(() => {
    setState((s) => ({
      ...s,
      screen: 'overworld',
      overworld: { ...s.overworld, showCommandMenu: false },
    }));
  }, []);

  const advanceOverworldTutorial = useCallback((step: OverworldTutorialStep) => {
    setState((s) => ({
      ...s,
      overworld: { ...s.overworld, tutorialStep: step },
      tutorialComplete: step === 'done',
      chapter0Complete: step === 'done' ? true : s.chapter0Complete,
    }));
  }, []);

  const showOverworldToast = useCallback((text: string) => {
    setState((s) => addToast(s, text, 'info'));
  }, []);

  const resolveEncounter = useCallback(
    (patientId: string, action: 'share' | 'minion' | 'endure' | 'relic'): { daly: number; loot?: LootItem } => {
      let result: { daly: number; loot?: LootItem } = { daly: 0 };
      setState((s) => {
        if (patientId === 'tutorial-ethan') {
          musicEngine.playSfx('assign');
          musicEngine.playSfx('relief');
          const next = addToast(
            {
              ...s,
              patientPain: Math.max(20, s.patientPain - 18),
              chapter0Complete: true,
              dalysSaved: s.dalysSaved + 5,
              triageStats: { ...s.triageStats, stabilized: s.triageStats.stabilized + 1, dalysSaved: s.triageStats.dalysSaved + 5 },
              streakTicks: s.streakTicks + 1,
              combo: updateCombo(s.combo, Date.now(), s.activeUpgrades.comboDurationBonus),
            },
            'Ethan\'s fever eases. +5 DALY',
            'success',
          );
          result = { daly: 5 };
          persistState(next);
          return next;
        }

        const patient = s.patients.find((p) => p.id === patientId);
        if (!patient || patient.dead) return s;

        const vector: PainVector = patient.painLoad > 55 ? 'inflammatory' : 'systemic';
        let draft = structuredClone(s) as GameState;

        if (action === 'share') {
          const family = draft.participants.filter((p) => p.active && !p.id.startsWith('minion-') && !p.assignedPatientId);
          const best = family.sort((a, b) => {
            const ma = MATCH_SCORES[a.id]?.[vector] ?? 50;
            const mb = MATCH_SCORES[b.id]?.[vector] ?? 50;
            return mb - ma;
          })[0];
          if (best) {
            const stats = effectivePlayerStats(draft);
            const bonus = 1 + draft.activeUpgrades.matchQualityBonus + stats.reliefPower;
            draft.patients = draft.patients.map((p) =>
              p.id === patientId
                ? {
                    ...p,
                    allocations: [...p.allocations.filter((a) => a.participantId !== best.id), { participantId: best.id, vector, weight: 100 * bonus }],
                    painLoad: Math.max(8, p.painLoad - 18 * bonus),
                    matchAvg: Math.min(99, p.matchAvg + 5),
                  }
                : p,
            );
            draft.participants = draft.participants.map((p) =>
              p.id === best.id ? { ...p, assignedPatientId: patientId, le: Math.max(5, p.le - 8) } : p,
            );
          }
        } else if (action === 'minion') {
          const minion = draft.participants.find((p) => p.id.startsWith('minion-') && p.active && !p.assignedPatientId && p.le > 15);
          if (minion) {
            draft.patients = draft.patients.map((p) =>
              p.id === patientId
                ? {
                    ...p,
                    allocations: [...p.allocations, { participantId: minion.id, vector, weight: 85 }],
                    painLoad: Math.max(8, p.painLoad - 14),
                  }
                : p,
            );
            draft.participants = draft.participants.map((p) =>
              p.id === minion.id ? { ...p, assignedPatientId: patientId } : p,
            );
          }
        } else if (action === 'endure') {
          draft.patients = draft.patients.map((p) =>
            p.id === patientId ? { ...p, status: 'endured' as const, allocations: [] } : p,
          );
        } else if (action === 'relic' && draft.inventory.length > 0) {
          const relicId = draft.inventory[draft.inventory.length - 1].id;
          draft.patients = draft.patients.map((p) =>
            p.id === patientId ? { ...p, painLoad: Math.max(5, p.painLoad - 25) } : p,
          );
          draft.inventory = draft.inventory.slice(0, -1);
          void relicId;
        }

        const updated = draft.patients.find((p) => p.id === patientId)!;
        const stabilized = updated.painLoad < 25 && updated.status !== 'endured' && updated.status !== 'dead';
        if (stabilized && updated.status !== 'stable') {
          draft.patients = draft.patients.map((p) =>
            p.id === patientId ? { ...p, status: 'stable' as const, painLoad: Math.max(5, p.painLoad - 5) } : p,
          );
          draft.triageStats = { ...draft.triageStats, stabilized: draft.triageStats.stabilized + 1, dalysSaved: draft.triageStats.dalysSaved + 5 };
          draft.dalysSaved += 5;
          draft.streakTicks += 1;
          draft.combo = updateCombo(draft.combo, Date.now(), draft.activeUpgrades.comboDurationBonus);
          draft.objectives = updateObjectives(draft.objectives, { type: 'stabilize' });
          musicEngine.playSfx('relief');
          musicEngine.playSting('success_sting');

          const drops = rollLootDrop(draft.streakTicks, draft.directorRank);
          let loot: LootItem | undefined;
          if (drops.length > 0) {
            loot = drops[0];
            draft.inventory = [...draft.inventory, { id: loot.id, acquiredTick: draft.tick }];
          }

          const newRank = rankFromDalys(draft.dalysSaved);
          if (newRank > draft.directorRank) {
            draft.directorRank = newRank;
            draft.pendingUpgradeChoices = pickRandomUpgrades(draft.ownedUpgrades, 3);
            draft.showUpgradePicker = true;
          }
          draft.overworld = {
            ...draft.overworld,
            unlockedZones: unlockZoneForRank(draft.directorRank),
          };
          result = { daly: 5, loot };
          draft = addToast(draft, `Stabilized ${patient.name.split(' ')[0]}! +5 DALY`, 'success');
        } else {
          draft = addToast(draft, `Relief applied to ${patient.name.split(' ')[0]}`, 'success');
          musicEngine.playSfx('assign');
        }

        persistState(draft);
        return draft;
      });
      return result;
    },
    [],
  );

  const getAllocationForVector = useCallback(
    (vector: PainVector) => state.allocations.filter((a) => a.vector === vector && a.weight > 0),
    [state.allocations],
  );

  const getParticipantAllocation = useCallback(
    (id: string) => state.allocations.find((a) => a.participantId === id),
    [state.allocations],
  );

  const recommendedPatientId = state.firstLaunchHints
    ? state.patients.find((p) => !p.dead && (p.status === 'critical' || p.status === 'dying'))?.id ?? null
    : null;

  const familyMembers = state.participants.filter((p) => !p.id.startsWith('minion-'));
  const minionMembers = state.participants.filter((p) => p.id.startsWith('minion-'));

  return {
    state,
    highlightPatientId,
    recommendedPatientId,
    familyMembers,
    minionMembers,
    startNewGame,
    continueGame,
    openSettings,
    openCredits,
    backToStart,
    cyoaChoose,
    cyoaAdvance,
    selectParticipant,
    assignToVector,
    togglePause,
    setSpeed,
    setMusicVolume,
    setSetting,
    toggleMute,
    choosePath,
    toggleHelp,
    toggleShortcuts,
    restart,
    selectPatient,
    openDrawer,
    closeDrawer,
    setPatientPriority,
    setPatientFilter,
    setPatientSearch,
    sortPatients,
    setTriageTab,
    optimizeTriage,
    assignHelperToPatient,
    bulkAssignBest,
    bulkEndure,
    bulkSetPriority,
    undoLast,
    dismissToast,
    pickUpgrade,
    pickLoot,
    unlockResearch,
    jumpToPatient,
    getAllocationForVector,
    getParticipantAllocation,
    moveOverworldPlayer,
    changeZone,
    toggleCommandMenu,
    closeCommandMenu,
    advanceOverworldTutorial,
    showOverworldToast,
    resolveEncounter,
  };
}

export type GameStore = ReturnType<typeof useGameStore>;
