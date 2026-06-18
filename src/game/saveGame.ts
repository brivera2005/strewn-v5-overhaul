import type { SaveData } from './State';
import { DEFAULT_PLAYER_STATS } from './loot';
import { CYOA_START } from './tutorialFlow';

const SAVE_KEY_V5 = 'strewn-save-v5';
const SAVE_KEY_V4 = 'strewn-save-v4';
const SAVE_KEY_V3 = 'strewn-save-v3';

export function saveGame(data: SaveData): void {
  try {
    localStorage.setItem(SAVE_KEY_V5, JSON.stringify(data));
  } catch {
    /* storage full or unavailable */
  }
}

function migratePatient(raw: Record<string, unknown>): SaveData['patients'][0] {
  const ward = (raw.ward as string) ?? (raw.region as string) ?? 'ICU-A';
  return {
    id: (raw.id as string) ?? 'CASE-0001',
    name: (raw.name as string) ?? 'CASE-0001',
    age: (raw.age as number) ?? 30,
    disease: (raw.disease as string) ?? 'Unknown',
    painLoad: (raw.painLoad as number) ?? 40,
    tempF: (raw.tempF as number) ?? 100,
    stage: (raw.stage as 1 | 2 | 3 | 4) ?? 1,
    priority: (raw.priority as 1 | 2 | 3 | null) ?? null,
    status: (raw.status as SaveData['patients'][0]['status']) ?? 'stable',
    days: (raw.days as number) ?? 0,
    assignedNetworkSize: (raw.assignedNetworkSize as number) ?? 0,
    matchAvg: (raw.matchAvg as number) ?? 0,
    mortalityRisk: (raw.mortalityRisk as number) ?? 20,
    ward,
    highPainTicks: (raw.highPainTicks as number) ?? 0,
    noAllocationTicks: (raw.noAllocationTicks as number) ?? 0,
    dead: (raw.dead as boolean) ?? false,
    allocations: (raw.allocations as SaveData['patients'][0]['allocations']) ?? [],
    basePain: (raw.basePain as number) ?? 40,
    icon: raw.icon as string | undefined,
  };
}

function migrateV4ToV5(raw: Record<string, unknown>): SaveData | null {
  if (raw.version !== 4) return null;
  return {
    version: 5,
    screen: (raw.screen as SaveData['screen']) ?? 'triage',
    gameMode: (raw.gameMode as SaveData['gameMode']) ?? 'triage',
    tick: (raw.tick as number) ?? 1,
    chapter0Complete: (raw.chapter0Complete as boolean) ?? true,
    patients: ((raw.patients as Record<string, unknown>[]) ?? []).map(migratePatient),
    participants: (raw.participants as SaveData['participants']) ?? [],
    triageStats: (raw.triageStats as SaveData['triageStats']) ?? {
      dalysSaved: 0,
      deaths: 0,
      stabilized: 0,
      memorialCount: 0,
      draftThreshold: 50,
    },
    ledger: (raw.ledger as SaveData['ledger']) ?? [],
    dalysSaved: (raw.dalysSaved as number) ?? 0,
    participantPoolSize: (raw.participantPoolSize as number) ?? 8,
    paused: (raw.paused as boolean) ?? true,
    speed: (raw.speed as SaveData['speed']) ?? 1,
    settings: {
      musicVolume: 0.35,
      muted: false,
      pauseOnCritical: true,
      tickSpeedMultiplier: 1,
      smartDefaults: true,
      ...((raw.settings as object) ?? {}),
    },
    currencies: (raw.currencies as SaveData['currencies']) ?? { reliefPoints: 100, researchPoints: 0, trust: 70 },
    directorRank: (raw.directorRank as number) ?? 1,
    ownedUpgrades: (raw.ownedUpgrades as string[]) ?? [],
    activeUpgrades: (raw.activeUpgrades as SaveData['activeUpgrades']) ?? {
      matchQualityBonus: 0,
      reliefTransferBonus: 0,
      profilingSpeedBonus: 0,
      mortalityReduction: 0,
      autoRestVolunteers: false,
      tickReliefBonus: 0,
      comboDurationBonus: 0,
      networkCapacityBonus: 0,
      diseaseInsights: [],
    },
    researchUnlocked: (raw.researchUnlocked as string[]) ?? [],
    objectives: (raw.objectives as SaveData['objectives']) ?? [],
    streakTicks: (raw.streakTicks as number) ?? 0,
    combo: (raw.combo as SaveData['combo']) ?? { count: 0, multiplier: 1, lastAssignTime: 0 },
    cyoaNode: CYOA_START,
    cyoaFlags: [],
    playerStats: { ...DEFAULT_PLAYER_STATS },
    inventory: [],
  };
}

function migrateV3ToV5(raw: Record<string, unknown>): SaveData | null {
  const v4 = migrateV4ToV5({ ...raw, version: 4 });
  return v4;
}

export function loadGame(): SaveData | null {
  try {
    const rawV5 = localStorage.getItem(SAVE_KEY_V5);
    if (rawV5) {
      const data = JSON.parse(rawV5) as SaveData;
      if (data.version === 5) return data;
    }
    const rawV4 = localStorage.getItem(SAVE_KEY_V4);
    if (rawV4) {
      const parsed = JSON.parse(rawV4) as Record<string, unknown>;
      return migrateV4ToV5(parsed);
    }
    const rawV3 = localStorage.getItem(SAVE_KEY_V3);
    if (rawV3) {
      const parsed = JSON.parse(rawV3) as Record<string, unknown>;
      return migrateV3ToV5(parsed);
    }
    return null;
  } catch {
    return null;
  }
}

export function hasSaveGame(): boolean {
  return loadGame() !== null;
}

export function clearSaveGame(): void {
  try {
    localStorage.removeItem(SAVE_KEY_V5);
    localStorage.removeItem(SAVE_KEY_V4);
    localStorage.removeItem(SAVE_KEY_V3);
  } catch {
    /* ignore */
  }
}
