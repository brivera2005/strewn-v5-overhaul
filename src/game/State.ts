import type { PainVector } from './constants';
import type { LootItem } from './loot';
import type { CurrencyState } from './currencies';
import type { ActiveUpgrades } from './upgrades';
import type { ComboState, DailyObjective } from './objectives';
import type { UpgradeCard } from './upgrades';

export type AppScreen =
  | 'start'
  | 'cyoa'
  | 'story'
  | 'chapter0'
  | 'triage'
  | 'result'
  | 'settings'
  | 'credits';

export type TriageTab = 'command' | 'database' | 'minions' | 'inventory' | 'research';

export interface PlayerStats {
  resilience: number;
  insight: number;
  burdenCapacity: number;
  reliefPower: number;
  comboYield: number;
  minionSlots: number;
}

export interface OwnedLoot {
  id: string;
  acquiredTick: number;
}

export type TutorialStep =
  | 'select_sarah'
  | 'assign_inflammatory'
  | 'press_play'
  | 'assign_mike'
  | 'complete';

export type PathChoice = 'strewn' | 'endure' | null;

export type EndGameReason = 'win' | 'le_collapse' | 'pain_crisis' | null;

export type PatientStatus =
  | 'stable'
  | 'strained'
  | 'critical'
  | 'dying'
  | 'dead'
  | 'endured'
  | 'strewn-active';

export type PatientFilter =
  | 'all'
  | 'critical'
  | 'stable'
  | 'dying'
  | 'endured'
  | 'strewn-active'
  | 'dead';

export interface Allocation {
  participantId: string;
  vector: PainVector;
  weight: number;
}

export interface ParticipantState {
  id: string;
  name: string;
  role: string;
  isaaId: string;
  le: number;
  maxFraction: number;
  active: boolean;
  initial: string;
  color: string;
  assignedPatientId?: string | null;
}

export interface LedgerEntry {
  tick: number;
  category: string;
  deltaShort: number;
  humanReadable: string;
}

export interface PatientRecord {
  id: string;
  name: string;
  age: number;
  disease: string;
  painLoad: number;
  tempF: number;
  stage: 1 | 2 | 3 | 4;
  priority: 1 | 2 | 3 | null;
  status: PatientStatus;
  days: number;
  assignedNetworkSize: number;
  matchAvg: number;
  mortalityRisk: number;
  ward: string;
  highPainTicks: number;
  noAllocationTicks: number;
  dead: boolean;
  allocations: Allocation[];
  basePain: number;
  icon?: string;
}

export interface GameSettings {
  musicVolume: number;
  muted: boolean;
  pauseOnCritical: boolean;
  tickSpeedMultiplier: 1 | 0.5 | 0.25;
  smartDefaults: boolean;
}

export interface TriageStats {
  dalysSaved: number;
  deaths: number;
  stabilized: number;
  memorialCount: number;
  draftThreshold: number;
}

export interface ToastMessage {
  id: number;
  text: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export interface UndoAction {
  type: 'assign';
  patientId: string;
  helperId: string;
  previousAllocations: Allocation[];
  previousHelperAssignment: string | null | undefined;
}

export interface GameAlert {
  id: string;
  tick: number;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  patientId?: string;
}

export interface GameState {
  screen: AppScreen;
  gameMode: 'chapter0' | 'triage' | null;
  tick: number;
  paused: boolean;
  speed: 1 | 2 | 3;
  settings: GameSettings;

  patientPain: number;
  basePain: number;
  globalReliefRate: number;
  immunityBonus: number;

  participants: ParticipantState[];
  allocations: Allocation[];
  pathChoice: PathChoice;
  choiceMade: boolean;
  showPathChoice: boolean;

  cyoaNode: string;
  cyoaFlags: string[];
  playerStats: PlayerStats;
  inventory: OwnedLoot[];
  pendingLootChoices: LootItem[] | null;
  showLootPicker: boolean;

  highPainTicks: number;
  endReason: EndGameReason;
  score: number;
  chapter0Complete: boolean;

  ledger: LedgerEntry[];
  dalysSaved: number;

  selectedParticipantId: string | null;
  tutorialStep: TutorialStep | null;
  tutorialComplete: boolean;
  showHelp: boolean;
  showShortcuts: boolean;
  ripple: { x: number; y: number; id: number } | null;
  reliefFlash: number | null;

  patients: PatientRecord[];
  selectedPatientIds: string[];
  drawerPatientId: string | null;
  triageTab: TriageTab;
  patientFilter: PatientFilter;
  patientSearch: string;
  sortColumn: keyof PatientRecord | null;
  sortAsc: boolean;
  triageStats: TriageStats;
  showDeathVignette: boolean;
  participantPoolSize: number;
  hasSave: boolean;

  currencies: CurrencyState;
  directorRank: number;
  ownedUpgrades: string[];
  activeUpgrades: ActiveUpgrades;
  pendingUpgradeChoices: UpgradeCard[] | null;
  showUpgradePicker: boolean;

  researchUnlocked: string[];
  objectives: DailyObjective[];
  streakTicks: number;
  combo: ComboState;
  alerts: GameAlert[];
  toasts: ToastMessage[];
  undoStack: UndoAction[];
  recommendedAction: string | null;
  firstLaunchHints: boolean;
}

export interface TickResult {
  patientPain: number;
  globalReliefRate: number;
  leDeltas: Map<string, number>;
  absorbedByParticipant: Map<string, number>;
  ledgerEntries: LedgerEntry[];
}

export interface MultiTickResult {
  ledgerEntries: LedgerEntry[];
  deathsThisTick: string[];
  stabilizedThisTick: string[];
  leDeltas: Map<string, number>;
  reliefPerTick: number;
}

export interface SaveData {
  version: 5;
  screen: AppScreen;
  gameMode: GameState['gameMode'];
  tick: number;
  chapter0Complete: boolean;
  patients: PatientRecord[];
  participants: ParticipantState[];
  triageStats: TriageStats;
  ledger: LedgerEntry[];
  dalysSaved: number;
  participantPoolSize: number;
  paused: boolean;
  speed: GameState['speed'];
  settings: GameSettings;
  currencies: CurrencyState;
  directorRank: number;
  ownedUpgrades: string[];
  activeUpgrades: ActiveUpgrades;
  researchUnlocked: string[];
  objectives: DailyObjective[];
  streakTicks: number;
  combo: ComboState;
  cyoaNode?: string;
  cyoaFlags?: string[];
  playerStats?: PlayerStats;
  inventory?: OwnedLoot[];
  chapter0State?: Partial<GameState>;
}
