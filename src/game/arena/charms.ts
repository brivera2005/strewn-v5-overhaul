import type { ActiveCharm, CharmDef, CharmId } from './types';

export const CHARM_DEFS: Record<CharmId, CharmDef> = {
  shard: {
    id: 'shard', name: 'Pain Shard', desc: 'Bonus lash damage and faster fire rate.',
    color: '#5ce1ff', tier: 'base', maxLevel: 5, painAffinity: 'grief',
  },
  anchor: {
    id: 'anchor', name: 'Grief Anchor', desc: '+15 burden capacity per level.',
    color: '#94a3b8', tier: 'base', maxLevel: 5, painAffinity: 'grief',
  },
  conduit: {
    id: 'conduit', name: 'Shared Conduit', desc: 'Boosts pain routing efficiency through sinks.',
    color: '#a78bfa', tier: 'base', maxLevel: 4,
  },
  thorns: {
    id: 'thorns', name: 'Thorn Echo', desc: 'Overflow damage pulses outward.',
    color: '#f87171', tier: 'base', maxLevel: 4, painAffinity: 'rage',
  },
  ember: {
    id: 'ember', name: 'Ember Sigil', desc: 'Burning aura scales with held burden.',
    color: '#fb923c', tier: 'base', maxLevel: 5, painAffinity: 'rage',
  },
  void: {
    id: 'void', name: 'Void Locket', desc: 'Drains burden slowly, deals void damage.',
    color: '#6366f1', tier: 'base', maxLevel: 4, painAffinity: 'hollow',
  },
  relay: {
    id: 'relay', name: 'Burden Relay', desc: 'Kills transfer less burden to you.',
    color: '#34d399', tier: 'base', maxLevel: 4,
  },
  sponge: {
    id: 'sponge', name: 'Sponge Totem', desc: 'Absorbs ambient suffering near you.',
    color: '#2dd4bf', tier: 'base', maxLevel: 4, painAffinity: 'grief',
  },
  lash: {
    id: 'lash', name: 'Rage Lash', desc: 'Melee whip on overflow — damages nearby foes.',
    color: '#ff4466', tier: 'base', maxLevel: 4, painAffinity: 'rage',
  },
  veil: {
    id: 'veil', name: 'Dread Veil', desc: 'Slows enemies when dread layer is high.',
    color: '#9d4edd', tier: 'base', maxLevel: 4, painAffinity: 'dread',
  },
  null_charm: {
    id: 'null_charm', name: 'Null Charm', desc: 'Converts hollow pain into shield ticks.',
    color: '#64748b', tier: 'base', maxLevel: 4, painAffinity: 'hollow',
  },
  pulse: {
    id: 'pulse', name: 'Grief Pulse', desc: 'Periodic heal when grief dominates pool.',
    color: '#6b8cff', tier: 'base', maxLevel: 4, painAffinity: 'grief',
  },
  prism: {
    id: 'prism', name: 'Pain Prism', desc: 'Splits projectiles when rage is high.',
    color: '#f472b6', tier: 'base', maxLevel: 4, painAffinity: 'rage',
  },
  chain: {
    id: 'chain', name: 'Chain Link', desc: 'Links sinks for shared drain capacity.',
    color: '#fcd34d', tier: 'base', maxLevel: 4,
  },
  burning_anchor: {
    id: 'burning_anchor', name: 'Burning Anchor', desc: 'Capacity + fire nova on overflow.',
    color: '#f97316', tier: 'fused', maxLevel: 3,
  },
  spite_web: {
    id: 'spite_web', name: 'Spite Web', desc: 'Minions share burden + thorn burst.',
    color: '#e879f9', tier: 'fused', maxLevel: 3,
  },
  void_conduit: {
    id: 'void_conduit', name: 'Void Conduit', desc: 'Minions drain burden into void bolts.',
    color: '#818cf8', tier: 'fused', maxLevel: 3,
  },
  ember_relay: {
    id: 'ember_relay', name: 'Ember Relay', desc: 'Kill relief becomes burn splash.',
    color: '#fdba74', tier: 'fused', maxLevel: 3,
  },
  grief_catalyst: {
    id: 'grief_catalyst', name: 'Grief Catalyst', desc: 'Sponge + anchor: burst heal on meld.',
    color: '#c4b5fd', tier: 'fused', maxLevel: 3,
  },
  burden_storm: {
    id: 'burden_storm', name: 'Burden Storm', desc: 'Shard + ember: orbital pain storm.',
    color: '#22d3ee', tier: 'fused', maxLevel: 3,
  },
  wrath_storm: {
    id: 'wrath_storm', name: 'Wrath Storm', desc: 'Grief + rage: devastating nova pulse.',
    color: '#ff2244', tier: 'fused', maxLevel: 3,
  },
  void_maw: {
    id: 'void_maw', name: 'Void Maw', desc: 'Dread + hollow: gravity well damages foes.',
    color: '#4c1d95', tier: 'fused', maxLevel: 3,
  },
  dread_lash: {
    id: 'dread_lash', name: 'Dread Lash', desc: 'Veil + lash: fear strikes chain enemies.',
    color: '#c026d3', tier: 'fused', maxLevel: 3,
  },
  hollow_veil: {
    id: 'hollow_veil', name: 'Hollow Veil', desc: 'Null + veil: enemies miss more often.',
    color: '#475569', tier: 'fused', maxLevel: 3,
  },
  rage_prism: {
    id: 'rage_prism', name: 'Rage Prism', desc: 'Prism + ember: triple split bolts.',
    color: '#fb7185', tier: 'fused', maxLevel: 3,
  },
  grief_pulse: {
    id: 'grief_pulse', name: 'Grief Pulse', desc: 'Pulse + sponge: AoE heal on drain.',
    color: '#93c5fd', tier: 'fused', maxLevel: 3,
  },
  chain_relay: {
    id: 'chain_relay', name: 'Chain Relay', desc: 'Chain + relay: kill burden → minions.',
    color: '#fde047', tier: 'fused', maxLevel: 3,
  },
  null_anchor: {
    id: 'null_anchor', name: 'Null Anchor', desc: 'Null + anchor: hollow converts to capacity.',
    color: '#94a3b8', tier: 'fused', maxLevel: 3,
  },
  spite_chain: {
    id: 'spite_chain', name: 'Spite Chain', desc: 'Chain + thorns: linked thorn burst.',
    color: '#f0abfc', tier: 'fused', maxLevel: 3,
  },
  ember_lash: {
    id: 'ember_lash', name: 'Ember Lash', desc: 'Lash + ember: burning whip trails.',
    color: '#ea580c', tier: 'fused', maxLevel: 3,
  },
  void_veil: {
    id: 'void_veil', name: 'Void Veil', desc: 'Void + veil: dread void zones.',
    color: '#7c3aed', tier: 'fused', maxLevel: 3,
  },
  prism_storm: {
    id: 'prism_storm', name: 'Prism Storm', desc: 'Prism + shard: rainbow bolt barrage.',
    color: '#e879f9', tier: 'fused', maxLevel: 3,
  },
  pulse_catalyst: {
    id: 'pulse_catalyst', name: 'Pulse Catalyst', desc: 'Pulse + grief catalyst: mega heal.',
    color: '#818cf8', tier: 'fused', maxLevel: 3,
  },
  thorn_null: {
    id: 'thorn_null', name: 'Thorn Null', desc: 'Thorns + null: overflow → enemy slow.',
    color: '#b91c1c', tier: 'fused', maxLevel: 3,
  },
  relay_prism: {
    id: 'relay_prism', name: 'Relay Prism', desc: 'Relay + prism: kill chains projectiles.',
    color: '#a3e635', tier: 'fused', maxLevel: 3,
  },
  sponge_veil: {
    id: 'sponge_veil', name: 'Sponge Veil', desc: 'Sponge + veil: dread absorption aura.',
    color: '#5eead4', tier: 'fused', maxLevel: 3,
  },
  shard_chain: {
    id: 'shard_chain', name: 'Shard Chain', desc: 'Shard + chain: minion pain bolts.',
    color: '#67e8f9', tier: 'fused', maxLevel: 3,
  },
};

export const BASE_CHARMS: CharmId[] = [
  'shard', 'anchor', 'conduit', 'thorns', 'ember', 'void', 'relay', 'sponge',
  'lash', 'veil', 'null_charm', 'pulse', 'prism', 'chain',
];

function pair(a: CharmId, b: CharmId, result: CharmId): { a: CharmId; b: CharmId; result: CharmId }[] {
  if (a === b) return [{ a, b, result }];
  return [{ a, b, result }, { b, a, result }];
}

export const MELD_RECIPES: { a: CharmId; b: CharmId; result: CharmId }[] = [
  ...pair('ember', 'anchor', 'burning_anchor'),
  ...pair('conduit', 'thorns', 'spite_web'),
  ...pair('void', 'conduit', 'void_conduit'),
  ...pair('ember', 'relay', 'ember_relay'),
  ...pair('sponge', 'anchor', 'grief_catalyst'),
  ...pair('shard', 'ember', 'burden_storm'),
  ...pair('pulse', 'lash', 'wrath_storm'),
  ...pair('veil', 'null_charm', 'void_maw'),
  ...pair('veil', 'lash', 'dread_lash'),
  ...pair('null_charm', 'veil', 'hollow_veil'),
  ...pair('prism', 'ember', 'rage_prism'),
  ...pair('pulse', 'sponge', 'grief_pulse'),
  ...pair('chain', 'relay', 'chain_relay'),
  ...pair('null_charm', 'anchor', 'null_anchor'),
  ...pair('chain', 'thorns', 'spite_chain'),
  ...pair('lash', 'ember', 'ember_lash'),
  ...pair('void', 'veil', 'void_veil'),
  ...pair('prism', 'shard', 'prism_storm'),
  ...pair('pulse', 'grief_catalyst', 'pulse_catalyst'),
  ...pair('thorns', 'null_charm', 'thorn_null'),
  ...pair('relay', 'prism', 'relay_prism'),
  ...pair('sponge', 'veil', 'sponge_veil'),
  ...pair('shard', 'chain', 'shard_chain'),
];

export const FUSED_CHARMS: CharmId[] = [...new Set(MELD_RECIPES.map((r) => r.result))];

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
  const pool: CharmId[] = BASE_CHARMS.filter((id) => {
    const lvl = charmLevel(owned, id);
    return lvl < CHARM_DEFS[id].maxLevel;
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
