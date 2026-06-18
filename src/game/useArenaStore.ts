import { useCallback, useEffect, useRef, useState } from 'react';
import {
  applyLevelUpChoice,
  collectRunRemnants,
  createArenaState,
  dismissTutorial,
  getRunStats,
  setMeldSlot,
  skipAllTutorial,
  tryMeld,
  tryPlaceSink,
  updateArena,
} from './arena/engine';
import { discoverMeld, loadMeta, saveMeta } from './arena/save';
import type { CharmId, MetaSave, RunStats, Screen } from './arena/types';
import { musicEngine } from './MusicEngine';
import { ARENA_W, ARENA_H } from './arena/constants';

export function useArenaStore() {
  const [meta, setMeta] = useState<MetaSave>(() => loadMeta());
  const [screen, setScreen] = useState<Screen>('menu');
  const [runStats, setRunStats] = useState<RunStats | null>(null);
  const [lastMeld, setLastMeld] = useState<CharmId | null>(null);
  const [hudTick, setHudTick] = useState(0);

  const arenaRef = useRef(createArenaState(meta));
  const keysRef = useRef(new Set<string>());
  const canvasScaleRef = useRef({ scale: 1, offsetX: 0, offsetY: 0 });
  const rafRef = useRef(0);
  const lastTimeRef = useRef(0);
  const metaRef = useRef(meta);
  metaRef.current = meta;

  const persistMeta = useCallback((next: MetaSave) => {
    setMeta(next);
    saveMeta(next);
  }, []);

  const startRun = useCallback(() => {
    arenaRef.current = createArenaState(metaRef.current);
    keysRef.current.clear();
    setRunStats(null);
    setLastMeld(null);
    setScreen('playing');
    musicEngine.resume();
    musicEngine.crossfadeTo('combat');
  }, []);

  const endRun = useCallback((won: boolean) => {
    const state = arenaRef.current;
    if (!metaRef.current.tutorialComplete && state.tutorialSeen.size >= 3) {
      persistMeta({ ...metaRef.current, tutorialComplete: true });
    }
    const stats = getRunStats(state, metaRef.current.upgrades.remnantBonus);
    const remnants = collectRunRemnants(state, metaRef.current);
    const nextMeta: MetaSave = {
      ...metaRef.current,
      shards: metaRef.current.shards + remnants,
      totalRuns: metaRef.current.totalRuns + 1,
      bestTime: Math.max(metaRef.current.bestTime, stats.time),
      bestKills: Math.max(metaRef.current.bestKills, stats.kills),
    };
    persistMeta(nextMeta);
    setRunStats({ ...stats, remnantsEarned: remnants });
    setScreen(won ? 'victory' : 'gameover');
    musicEngine.playSting(won ? 'success_sting' : 'death_sting');
    musicEngine.crossfadeTo('menu');
  }, [persistMeta]);

  const tick = useCallback((now: number) => {
    if (screen !== 'playing') return;
    const state = arenaRef.current;
    const dt = Math.min(0.05, (now - lastTimeRef.current) / 1000 || 0.016);
    lastTimeRef.current = now;

    updateArena(state, dt, keysRef.current, metaRef.current);

    const burdenRatio = state.burden.current / state.burden.max;
    if (state.ventSfx) {
      state.ventSfx = false;
      musicEngine.playSfx('vent');
    }
    musicEngine.updateHeartbeat(burdenRatio, dt);
    if (state.bossActive && musicEngine) {
      /* boss track handled on wave start via effect below */
    }

    if (state.pendingLevelUp) {
      setScreen('levelup');
      musicEngine.playSfx('level_up');
      return;
    }
    if (state.dead) {
      endRun(false);
      return;
    }
    if (state.won) {
      endRun(true);
      return;
    }

    setHudTick((t) => t + 1);
    rafRef.current = requestAnimationFrame(tick);
  }, [screen, endRun]);

  useEffect(() => {
    if (screen === 'playing') {
      lastTimeRef.current = performance.now();
      rafRef.current = requestAnimationFrame(tick);
    }
    return () => cancelAnimationFrame(rafRef.current);
  }, [screen, tick]);

  const screenToWorld = useCallback((clientX: number, clientY: number, rect: DOMRect) => {
    const { scale, offsetX, offsetY } = canvasScaleRef.current;
    return {
      x: (clientX - rect.left - offsetX) / scale,
      y: (clientY - rect.top - offsetY) / scale,
    };
  }, []);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      keysRef.current.add(k);
      const state = arenaRef.current;

      if (screen === 'playing') {
        if (k === 'escape') {
          setScreen('paused');
          musicEngine.crossfadeTo('menu', 0.5);
        }
        if (k === 'c') {
          setScreen('codex');
          musicEngine.playSfx('ui_click');
        }
        if (k === 'q') {
          if (tryPlaceSink(state)) musicEngine.playSfx('sink');
        }
        if (k === 'e' && (state.shrineActive || state.nearShrine)) {
          const result = tryMeld(state);
          if (result) {
            const next = discoverMeld(metaRef.current, result);
            persistMeta(next);
            setLastMeld(result);
            musicEngine.playSfx('meld');
          }
        }
        if (k === '1' || k === '2') {
          const slot = k === '1' ? 0 : 1;
          if (state.charms.length > slot) {
            setMeldSlot(state, slot as 0 | 1, state.charms[slot].id);
            musicEngine.playSfx('ui_click');
          }
        }
      }

      if (screen === 'codex' && k === 'c') {
        setScreen('playing');
        musicEngine.crossfadeTo('combat');
      }
    };
    const up = (e: KeyboardEvent) => keysRef.current.delete(e.key.toLowerCase());
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, [screen, persistMeta]);

  const setCanvasTransform = useCallback((scale: number, offsetX: number, offsetY: number) => {
    canvasScaleRef.current = { scale, offsetX, offsetY };
  }, []);

  const handleMouseMove = useCallback((clientX: number, clientY: number, rect: DOMRect) => {
    const { x, y } = screenToWorld(clientX, clientY, rect);
    arenaRef.current.mouseX = Math.max(0, Math.min(ARENA_W, x));
    arenaRef.current.mouseY = Math.max(0, Math.min(ARENA_H, y));
  }, [screenToWorld]);

  const handleMouseDown = useCallback((button: number, clientX: number, clientY: number, rect: DOMRect) => {
    handleMouseMove(clientX, clientY, rect);
    if (button === 0) arenaRef.current.mouseDown = true;
    if (button === 2) arenaRef.current.mouseRightDown = true;
  }, [handleMouseMove]);

  const handleMouseUp = useCallback((button: number) => {
    if (button === 0) arenaRef.current.mouseDown = false;
    if (button === 2) arenaRef.current.mouseRightDown = false;
  }, []);

  const pickLevelUp = useCallback((id: CharmId) => {
    applyLevelUpChoice(arenaRef.current, id);
    setScreen('playing');
    musicEngine.playSfx('relief');
    musicEngine.crossfadeTo('combat');
  }, []);

  const dismissTutorialStep = useCallback(() => {
    dismissTutorial(arenaRef.current);
    setHudTick((t) => t + 1);
  }, []);

  const skipTutorial = useCallback(() => {
    skipAllTutorial(arenaRef.current);
    persistMeta({ ...metaRef.current, tutorialComplete: true });
    setHudTick((t) => t + 1);
  }, [persistMeta]);

  const dismissMeldPopup = useCallback(() => setLastMeld(null), []);

  const openShop = useCallback(() => {
    setScreen('shop');
    musicEngine.crossfadeTo('menu');
  }, []);

  const openSettings = useCallback(() => {
    setScreen('settings');
    musicEngine.crossfadeTo('menu');
  }, []);

  const backToMenu = useCallback(() => {
    setScreen('menu');
    musicEngine.crossfadeTo('menu');
  }, []);

  const resume = useCallback(() => {
    setScreen('playing');
    const boss = arenaRef.current.bossActive;
    musicEngine.crossfadeTo(boss ? 'boss' : 'combat');
  }, []);

  const closeCodex = useCallback(() => {
    setScreen('playing');
    musicEngine.crossfadeTo('combat');
  }, []);

  const buyUpgrade = useCallback((id: keyof MetaSave['upgrades'], cost: number) => {
    if (meta.shards < cost) return;
    const next = {
      ...meta,
      shards: meta.shards - cost,
      upgrades: { ...meta.upgrades, [id]: (meta.upgrades[id] as number) + 1 },
    };
    persistMeta(next);
    musicEngine.playSfx('ui_click');
  }, [meta, persistMeta]);

  const buyStartCharm = useCallback((charmId: CharmId, cost: number) => {
    if (meta.shards < cost || meta.upgrades.startCharm) return;
    const next = {
      ...meta,
      shards: meta.shards - cost,
      upgrades: { ...meta.upgrades, startCharm: charmId },
    };
    persistMeta(next);
    musicEngine.playSfx('level_up');
  }, [meta, persistMeta]);

  const setMusicVolume = useCallback((v: number) => {
    musicEngine.setMusicVolume(v);
    persistMeta({ ...meta, settings: { ...meta.settings, musicVolume: v } });
  }, [meta, persistMeta]);

  const toggleMute = useCallback(() => {
    const muted = !meta.settings.muted;
    musicEngine.setMuted(muted);
    persistMeta({ ...meta, settings: { ...meta.settings, muted } });
  }, [meta, persistMeta]);

  const toggleCrt = useCallback(() => {
    persistMeta({
      ...meta,
      settings: { ...meta.settings, crtScanlines: !meta.settings.crtScanlines },
    });
  }, [meta, persistMeta]);

  useEffect(() => {
    musicEngine.setMusicVolume(meta.settings.musicVolume);
    musicEngine.setMuted(meta.settings.muted);
    if (screen === 'menu') musicEngine.crossfadeTo('menu');
  }, []);

  useEffect(() => {
    if (screen !== 'playing') return;
    if (arenaRef.current.bossActive) musicEngine.crossfadeTo('boss');
  }, [hudTick, screen]);

  return {
    meta,
    screen,
    setScreen,
    arenaRef,
    runStats,
    lastMeld,
    startRun,
    pickLevelUp,
    openShop,
    openSettings,
    backToMenu,
    resume,
    closeCodex,
    buyUpgrade,
    buyStartCharm,
    setMusicVolume,
    toggleMute,
    toggleCrt,
    persistMeta,
    hudTick,
    dismissTutorialStep,
    skipTutorial,
    dismissMeldPopup,
    setCanvasTransform,
    handleMouseMove,
    handleMouseDown,
    handleMouseUp,
  };
}
