import type { CharmId, GameSettings, MetaSave, MetaUpgrades } from './types';

const SAVE_KEY = 'burden-surge-save-v6';

export const DEFAULT_UPGRADES: MetaUpgrades = {
  maxHp: 0,
  burdenCap: 0,
  moveSpeed: 0,
  shardBonus: 0,
  minionSlots: 0,
  startCharm: null,
  biomeUnlock: 0,
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

export function loadMeta(): MetaSave {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return createDefaultMeta();
    const data = JSON.parse(raw) as MetaSave;
    if (data.version !== 6) return createDefaultMeta();
    return {
      ...createDefaultMeta(),
      ...data,
      upgrades: { ...DEFAULT_UPGRADES, ...data.upgrades },
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
    id: 'shardBonus',
    name: 'Shard Magnet',
    desc: '+15% shard gain per level',
    maxLevel: 4,
    cost: (l) => 50 + l * 35,
  },
  {
    id: 'minionSlots',
    name: 'Extra Hands',
    desc: '+1 minion slot per level',
    maxLevel: 3,
    cost: (l) => 60 + l * 40,
  },
];

export const START_CHARMS: { id: CharmId; cost: number }[] = [
  { id: 'shard', cost: 80 },
  { id: 'anchor', cost: 80 },
  { id: 'ember', cost: 100 },
  { id: 'conduit', cost: 100 },
];

export function discoverMeld(meta: MetaSave, charmId: CharmId): MetaSave {
  if (meta.discoveredMelds.includes(charmId)) return meta;
  return { ...meta, discoveredMelds: [...meta.discoveredMelds, charmId] };
}
