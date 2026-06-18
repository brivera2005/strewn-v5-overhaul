import type { ActiveCharm, CharmDef, CharmId } from './types';

export const CHARM_DEFS: Record<CharmId, CharmDef> = {
  shard: {
    id: 'shard',
    name: 'Pain Shard',
    desc: 'Orbits and fires pain bolts at nearby foes.',
    color: '#5ce1ff',
    tier: 'base',
    maxLevel: 5,
  },
  anchor: {
    id: 'anchor',
    name: 'Grief Anchor',
    desc: '+15 burden capacity per level.',
    color: '#94a3b8',
    tier: 'base',
    maxLevel: 5,
  },
  conduit: {
    id: 'conduit',
    name: 'Shared Conduit',
    desc: 'Routes 8% of your burden to minions per level.',
    color: '#a78bfa',
    tier: 'base',
    maxLevel: 4,
  },
  thorns: {
    id: 'thorns',
    name: 'Thorn Echo',
    desc: 'Overflow damage pulses outward.',
    color: '#f87171',
    tier: 'base',
    maxLevel: 4,
  },
  ember: {
    id: 'ember',
    name: 'Ember Sigil',
    desc: 'Burning aura scales with held burden.',
    color: '#fb923c',
    tier: 'base',
    maxLevel: 5,
  },
  void: {
    id: 'void',
    name: 'Void Locket',
    desc: 'Drains burden slowly, deals void damage.',
    color: '#6366f1',
    tier: 'base',
    maxLevel: 4,
  },
  relay: {
    id: 'relay',
    name: 'Burden Relay',
    desc: 'Kills transfer less burden to you.',
    color: '#34d399',
    tier: 'base',
    maxLevel: 4,
  },
  sponge: {
    id: 'sponge',
    name: 'Sponge Totem',
    desc: 'Absorbs ambient suffering near you.',
    color: '#2dd4bf',
    tier: 'base',
    maxLevel: 4,
  },
  burning_anchor: {
    id: 'burning_anchor',
    name: 'Burning Anchor',
    desc: 'Capacity + fire nova on overflow.',
    color: '#f97316',
    tier: 'fused',
    maxLevel: 3,
  },
  spite_web: {
    id: 'spite_web',
    name: 'Spite Web',
    desc: 'Minions share burden + thorn burst.',
    color: '#e879f9',
    tier: 'fused',
    maxLevel: 3,
  },
  void_conduit: {
    id: 'void_conduit',
    name: 'Void Conduit',
    desc: 'Minions drain burden into void bolts.',
    color: '#818cf8',
    tier: 'fused',
    maxLevel: 3,
  },
  ember_relay: {
    id: 'ember_relay',
    name: 'Ember Relay',
    desc: 'Kill relief becomes burn damage.',
    color: '#fdba74',
    tier: 'fused',
    maxLevel: 3,
  },
  grief_catalyst: {
    id: 'grief_catalyst',
    name: 'Grief Catalyst',
    desc: 'Sponge + anchor: burst heal on meld pickup.',
    color: '#c4b5fd',
    tier: 'fused',
    maxLevel: 3,
  },
  burden_storm: {
    id: 'burden_storm',
    name: 'Burden Storm',
    desc: 'Shard + ember: orbital pain storm.',
    color: '#22d3ee',
    tier: 'fused',
    maxLevel: 3,
  },
};

export const BASE_CHARMS: CharmId[] = [
  'shard',
  'anchor',
  'conduit',
  'thorns',
  'ember',
  'void',
  'relay',
  'sponge',
];

export const MELD_RECIPES: { a: CharmId; b: CharmId; result: CharmId }[] = [
  { a: 'ember', b: 'anchor', result: 'burning_anchor' },
  { a: 'anchor', b: 'ember', result: 'burning_anchor' },
  { a: 'conduit', b: 'thorns', result: 'spite_web' },
  { a: 'thorns', b: 'conduit', result: 'spite_web' },
  { a: 'void', b: 'conduit', result: 'void_conduit' },
  { a: 'conduit', b: 'void', result: 'void_conduit' },
  { a: 'ember', b: 'relay', result: 'ember_relay' },
  { a: 'relay', b: 'ember', result: 'ember_relay' },
  { a: 'sponge', b: 'anchor', result: 'grief_catalyst' },
  { a: 'anchor', b: 'sponge', result: 'grief_catalyst' },
  { a: 'shard', b: 'ember', result: 'burden_storm' },
  { a: 'ember', b: 'shard', result: 'burden_storm' },
];

export function findMeld(a: CharmId, b: CharmId): CharmId | null {
  const recipe = MELD_RECIPES.find((r) => r.a === a && r.b === b);
  return recipe?.result ?? null;
}

export function charmLevel(charms: ActiveCharm[], id: CharmId): number {
  return charms.find((c) => c.id === id)?.level ?? 0;
}

export function addOrUpgradeCharm(charms: ActiveCharm[], id: CharmId): ActiveCharm[] {
  const def = CHARM_DEFS[id];
  const existing = charms.find((c) => c.id === id);
  if (existing) {
    if (existing.level >= def.maxLevel) return charms;
    return charms.map((c) => (c.id === id ? { ...c, level: c.level + 1 } : c));
  }
  return [...charms, { id, level: 1 }];
}

export function pickLevelUpChoices(
  owned: ActiveCharm[],
  count = 3,
  discoveredFused: CharmId[] = [],
): CharmId[] {
  const ownedIds = new Set(owned.map((c) => c.id));
  const pool: CharmId[] = BASE_CHARMS.filter((id) => {
    const lvl = charmLevel(owned, id);
    return lvl < CHARM_DEFS[id].maxLevel || !ownedIds.has(id);
  });
  for (const fused of discoveredFused) {
    const lvl = charmLevel(owned, fused);
    if (lvl < CHARM_DEFS[fused].maxLevel) pool.push(fused);
  }
  const picks: CharmId[] = [];
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  for (const id of shuffled) {
    if (picks.length >= count) break;
    if (!picks.includes(id)) picks.push(id);
  }
  while (picks.length < count) {
    const fallback = BASE_CHARMS[Math.floor(Math.random() * BASE_CHARMS.length)];
    if (!picks.includes(fallback)) picks.push(fallback);
  }
  return picks;
}
