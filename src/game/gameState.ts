import {
  CHARACTERS,
  painToFahrenheit,
} from './constants';
import type { GameState, PatientRecord, PatientStatus, SaveData, TutorialStep } from './State';
import {
  applyTickResult,
  checkEndConditions,
  computeScore,
  createInitialParticipants,
  simulateTick,
} from './Simulation';
import { generatePatientBatch } from './PatientGenerator';
import { simulateMultiPatientTick, optimizeCriticalAssignments } from './SimulationMulti';
import { saveGame, loadGame, hasSaveGame } from './saveGame';
import { musicEngine } from './MusicEngine';
import { INITIAL_CURRENCIES, rankFromDalys } from './currencies';
import { DEFAULT_ACTIVE_UPGRADES } from './upgrades';
import { createDailyObjectives } from './objectives';
import { createMinionPool } from './minions';
import { CYOA_START } from './tutorialFlow';
import { applyLootStats, DEFAULT_PLAYER_STATS, LOOT_TABLE } from './loot';

export function createTriagePatients(count: number): PatientRecord[] {
  const seeds = generatePatientBatch(count);
  return seeds.map((s) => ({
    id: s.id,
    name: s.name,
    age: s.age,
    disease: s.disease,
    painLoad: s.painLoad,
    tempF: painToFahrenheit(s.painLoad),
    stage: s.stage,
    priority: null,
    status: (s.painLoad > 65 ? 'critical' : s.painLoad > 40 ? 'strained' : 'stable') as PatientStatus,
    days: 0,
    assignedNetworkSize: 0,
    matchAvg: 0,
    mortalityRisk: s.mortalityRisk,
    ward: s.ward,
    highPainTicks: 0,
    noAllocationTicks: 0,
    dead: false,
    allocations: [],
    basePain: s.painLoad,
    icon: s.icon,
  }));
}

export function computeEffectiveStats(state: GameState) {
  const items = state.inventory
    .map((o) => LOOT_TABLE.find((l) => l.id === o.id))
    .filter((x): x is (typeof LOOT_TABLE)[number] => !!x);
  return applyLootStats(state.playerStats, items);
}

export function createInitialState(): GameState {
  return {
    screen: 'start',
    gameMode: null,
    tick: 0,
    paused: true,
    speed: 1,
    settings: {
      musicVolume: 0.35,
      muted: false,
      pauseOnCritical: true,
      tickSpeedMultiplier: 1,
      smartDefaults: true,
    },

    patientPain: CHARACTERS.ethan.basePain,
    basePain: CHARACTERS.ethan.basePain,
    globalReliefRate: 0,
    immunityBonus: 0,

    participants: createInitialParticipants(),
    allocations: [],
    pathChoice: null,
    choiceMade: false,
    showPathChoice: false,

    cyoaNode: CYOA_START,
    cyoaFlags: [],
    playerStats: { ...DEFAULT_PLAYER_STATS },
    inventory: [],
    pendingLootChoices: null,
    showLootPicker: false,

    highPainTicks: 0,
    endReason: null,
    score: 0,
    chapter0Complete: false,

    ledger: [],
    dalysSaved: 0,

    selectedParticipantId: null,
    tutorialStep: null,
    tutorialComplete: false,
    showHelp: false,
    showShortcuts: false,
    ripple: null,
    reliefFlash: null,

    patients: [],
    selectedPatientIds: [],
    drawerPatientId: null,
    triageTab: 'command',
    patientFilter: 'all',
    patientSearch: '',
    sortColumn: 'mortalityRisk',
    sortAsc: false,
    triageStats: { dalysSaved: 0, deaths: 0, stabilized: 0, memorialCount: 0, draftThreshold: 0 },
    showDeathVignette: false,
    participantPoolSize: 8,
    hasSave: hasSaveGame(),

    currencies: { ...INITIAL_CURRENCIES },
    directorRank: 1,
    ownedUpgrades: [],
    activeUpgrades: { ...DEFAULT_ACTIVE_UPGRADES, diseaseInsights: [] },
    pendingUpgradeChoices: null,
    showUpgradePicker: false,

    researchUnlocked: [],
    objectives: createDailyObjectives(),
    streakTicks: 0,
    combo: { count: 0, multiplier: 1, lastAssignTime: 0 },
    alerts: [],
    toasts: [],
    undoStack: [],
    recommendedAction: 'optimize-critical',
    firstLaunchHints: true,
  };
}

export function initTriageMode(state: GameState): GameState {
  const count = 20 + Math.floor(Math.random() * 8);
  const minionCount = Math.max(6, state.participantPoolSize + state.playerStats.minionSlots);
  const family = createInitialParticipants();
  const minions = createMinionPool(minionCount + state.activeUpgrades.networkCapacityBonus);
  return {
    ...state,
    screen: 'triage',
    gameMode: 'triage',
    tick: state.tick || 1,
    paused: true,
    patients: createTriagePatients(count),
    participants: [...family, ...minions],
    selectedPatientIds: [],
    drawerPatientId: null,
    triageTab: 'command',
    objectives: state.objectives.length ? state.objectives : createDailyObjectives(),
    directorRank: rankFromDalys(state.dalysSaved),
    triageStats: {
      dalysSaved: state.dalysSaved,
      deaths: 0,
      stabilized: 0,
      memorialCount: 0,
      draftThreshold: 50,
    },
    recommendedAction: 'optimize-critical',
  };
}

export function persistState(state: GameState): void {
  if (state.screen === 'start' || state.screen === 'credits') return;
  const data: SaveData = {
    version: 5,
    screen: state.screen,
    gameMode: state.gameMode,
    tick: state.tick,
    chapter0Complete: state.chapter0Complete,
    patients: state.patients,
    participants: state.participants,
    triageStats: state.triageStats,
    ledger: state.ledger.slice(0, 50),
    dalysSaved: state.dalysSaved,
    participantPoolSize: state.participantPoolSize,
    paused: state.paused,
    speed: state.speed,
    settings: state.settings,
    currencies: state.currencies,
    directorRank: state.directorRank,
    ownedUpgrades: state.ownedUpgrades,
    activeUpgrades: state.activeUpgrades,
    researchUnlocked: state.researchUnlocked,
    objectives: state.objectives,
    streakTicks: state.streakTicks,
    combo: state.combo,
    cyoaNode: state.cyoaNode,
    cyoaFlags: state.cyoaFlags,
    playerStats: state.playerStats,
    inventory: state.inventory,
  };
  saveGame(data);
}

export { musicEngine };
export type { TutorialStep, GameState, SaveData };
export {
  applyTickResult,
  checkEndConditions,
  computeScore,
  createInitialParticipants,
  simulateTick,
  loadGame,
  optimizeCriticalAssignments,
  simulateMultiPatientTick,
};
