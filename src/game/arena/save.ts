import type { CharmId, GameSettings, MetaSave, MetaUpgrades } from './types';

const SAVE_KEY = 'strewn-save-v7';

export const DEFAULT_UPGRADES: MetaUpgrades = {
  maxHp: 0,
  burdenCap: 0,
  moveSpeed: 0,
  remnantBonus: 0,
  sinkSlots: 0,
  startCharm: null,
  ventPower: 0,
};

export const DEFAULT_SETTINGS: GameSettings = {
  musicVolume: 0.4,
  muted: false,
  crtScanlines: false,
};

export function createDefaultMeta(): MetaSave {
  return {
    version: 6,
    shards: 0,
    totalRuns: 0,
    bestTime: 0,
    bestKills: 0,
    discoveredMelds: [],
    upgrades: { ...DEFAULT_UPGRADES },
    settings: { ...DEFAULT_SETTINGS },
    tutorialComplete: false,
    loreUnlocked: [],
  };
}

function migrateUpgrades(raw: Record<string, unknown>): MetaUpgrades {
  return {
    maxHp: Number(raw.maxHp ?? 0),
    burdenCap: Number(raw.burdenCap ?? 0),
    moveSpeed: Number(raw.moveSpeed ?? 0),
    remnantBonus: Number(raw.remnantBonus ?? raw.shardBonus ?? 0),
    sinkSlots: Number(raw.sinkSlots ?? raw.minionSlots ?? 0),
    startCharm: (raw.startCharm as MetaUpgrades['startCharm']) ?? null,
    ventPower: Number(raw.ventPower ?? 0),
  };
}

export function loadMeta(): MetaSave {
  try {
    const raw = localStorage.getItem(SAVE_KEY) ?? localStorage.getItem('burden-surge-save-v6');
    if (!raw) return createDefaultMeta();
    const data = JSON.parse(raw) as MetaSave & { upgrades?: Record<string, unknown> };
    return {
      ...createDefaultMeta(),
      ...data,
      upgrades: migrateUpgrades(data.upgrades ?? {}),
      settings: { ...DEFAULT_SETTINGS, ...data.settings },
      tutorialComplete: data.tutorialComplete ?? false,
      loreUnlocked: data.loreUnlocked ?? [],
    };
  } catch {
    return createDefaultMeta();
  }
}

export function saveMeta(data: MetaSave): void {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch {
    /* storage unavailable */
  }
}

export interface ShopItem {
  id: keyof MetaUpgrades;
  name: string;
  desc: string;
  maxLevel: number;
  cost: (level: number) => number;
}

export const SHOP_ITEMS: ShopItem[] = [
  {
    id: 'maxHp',
    name: 'Iron Will',
    desc: '+20 max HP per level',
    maxLevel: 5,
    cost: (l) => 30 + l * 25,
  },
  {
    id: 'burdenCap',
    name: 'Wide Vessel',
    desc: '+25 burden capacity per level',
    maxLevel: 5,
    cost: (l) => 35 + l * 30,
  },
  {
    id: 'moveSpeed',
    name: 'Swift Feet',
    desc: '+8% move speed per level',
    maxLevel: 4,
    cost: (l) => 40 + l * 20,
  },
  {
    id: 'remnantBonus',
    name: 'Remnant Magnet',
    desc: '+15% remnant gain per level',
    maxLevel: 4,
    cost: (l) => 50 + l * 35,
  },
  {
    id: 'sinkSlots',
    name: 'Extra Sinks',
    desc: '+1 sink node slot per level',
    maxLevel: 3,
    cost: (l) => 60 + l * 40,
  },
  {
    id: 'ventPower',
    name: 'Deep Vent',
    desc: '+20% vent shockwave power per level',
    maxLevel: 4,
    cost: (l) => 55 + l * 30,
  },
];

export const START_CHARMS: { id: CharmId; cost: number }[] = [
  { id: 'lash', cost: 80 },
  { id: 'anchor', cost: 80 },
  { id: 'ember', cost: 100 },
  { id: 'relay', cost: 100 },
];

export function discoverMeld(meta: MetaSave, charmId: CharmId): MetaSave {
  if (meta.discoveredMelds.includes(charmId)) return meta;
  return { ...meta, discoveredMelds: [...meta.discoveredMelds, charmId] };
}
