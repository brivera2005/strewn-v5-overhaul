import type { PlayerStats } from './State';

export type LootRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface LootItem {
  id: string;
  name: string;
  description: string;
  rarity: LootRarity;
  slot: 'relic' | 'charm' | 'core';
  stats: Partial<PlayerStats>;
}

export const LOOT_TABLE: LootItem[] = [
  { id: 'burden-ring', name: 'Burden Ring', description: '+8 Burden Capacity', rarity: 'common', slot: 'relic', stats: { burdenCapacity: 8 } },
  { id: 'insight-lens', name: 'Insight Lens', description: '+6 Insight', rarity: 'common', slot: 'charm', stats: { insight: 6 } },
  { id: 'steadfast-band', name: 'Steadfast Band', description: '+10 Resilience', rarity: 'common', slot: 'relic', stats: { resilience: 10 } },
  { id: 'channel-amp', name: 'Channel Amplifier', description: '+5% Relief Power', rarity: 'rare', slot: 'core', stats: { reliefPower: 0.05 } },
  { id: 'minion-hive', name: 'Minion Hive', description: '+3 Minion Slots', rarity: 'rare', slot: 'core', stats: { minionSlots: 3 } },
  { id: 'combo-weave', name: 'Combo Weave', description: '+12% Combo Yield', rarity: 'rare', slot: 'charm', stats: { comboYield: 0.12 } },
  { id: 'void-anchor', name: 'Void Anchor', description: '+15 Burden, +8 Resilience', rarity: 'epic', slot: 'relic', stats: { burdenCapacity: 15, resilience: 8 } },
  { id: 'pulse-reactor', name: 'Pulse Reactor', description: '+10% Relief, +5 Insight', rarity: 'epic', slot: 'core', stats: { reliefPower: 0.1, insight: 5 } },
  { id: 'crown-of-strewn', name: 'Crown of Strewn', description: '+20 all core stats', rarity: 'legendary', slot: 'relic', stats: { resilience: 20, insight: 20, burdenCapacity: 20 } },
  { id: 'echo-shard', name: 'Echo Shard', description: '+4 Insight', rarity: 'common', slot: 'charm', stats: { insight: 4 } },
  { id: 'iron-veil', name: 'Iron Veil', description: '+7 Resilience', rarity: 'common', slot: 'relic', stats: { resilience: 7 } },
  { id: 'swarm-nexus', name: 'Swarm Nexus', description: '+5 Minion Slots', rarity: 'epic', slot: 'core', stats: { minionSlots: 5 } },
];

export const RARITY_COLORS: Record<LootRarity, string> = {
  common: '#6b7a99',
  rare: '#7b61ff',
  epic: '#ffb020',
  legendary: '#ff4d6a',
};

export const DEFAULT_PLAYER_STATS: PlayerStats = {
  resilience: 50,
  insight: 50,
  burdenCapacity: 50,
  reliefPower: 0,
  comboYield: 0,
  minionSlots: 0,
};

export function applyLootStats(base: PlayerStats, items: LootItem[]): PlayerStats {
  const next = { ...base };
  for (const item of items) {
    if (item.stats.resilience) next.resilience += item.stats.resilience;
    if (item.stats.insight) next.insight += item.stats.insight;
    if (item.stats.burdenCapacity) next.burdenCapacity += item.stats.burdenCapacity;
    if (item.stats.reliefPower) next.reliefPower += item.stats.reliefPower;
    if (item.stats.comboYield) next.comboYield += item.stats.comboYield;
    if (item.stats.minionSlots) next.minionSlots += item.stats.minionSlots;
  }
  return next;
}

export function pickRandomLoot(owned: string[], count = 1): LootItem[] {
  const pool = LOOT_TABLE.filter((l) => !owned.includes(l.id));
  const picks: LootItem[] = [];
  const scratch = [...pool];
  while (picks.length < count && scratch.length > 0) {
    const idx = Math.floor(Math.random() * scratch.length);
    picks.push(scratch[idx]);
    scratch.splice(idx, 1);
  }
  return picks;
}

export function rollLootDrop(streak: number, rank: number): LootItem[] {
  const chance = Math.min(0.45, 0.08 + streak * 0.01 + rank * 0.02);
  if (Math.random() > chance) return [];
  return pickRandomLoot([], 1);
}
