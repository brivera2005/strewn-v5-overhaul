import type { CharmId } from '../arena/types';
import { CHARM_DEFS, MELD_RECIPES } from '../arena/charms';

export interface CodexEntry {
  id: string;
  category: 'core' | 'ecology' | 'melds' | 'structures' | 'meta';
  title: string;
  body: string;
}

export const CODEX_ENTRIES: CodexEntry[] = [
  {
    id: 'burden_pool',
    category: 'core',
    title: 'Burden Pool',
    body: 'Your shared pain meter. Fills from enemy proximity, kills, and ambient suffering. Overflow deals escalating damage. Expand via charms, minions, shrines, and meta upgrades.',
  },
  {
    id: 'overflow',
    category: 'core',
    title: 'Overflow',
    body: 'When burden exceeds capacity, you hemorrhage HP. Thorns, Burning Anchor, and Wrath Storm weaponize overflow. Route pain before the threshold.',
  },
  {
    id: 'minions',
    category: 'core',
    title: 'Minions',
    body: 'SPACE deploys a burden sink (costs burden). Orbits you, absorbs share via Conduit/Spite Web. Extra slots unlock in Meta Shop.',
  },
  {
    id: 'meld_altar',
    category: 'core',
    title: 'Meld Altar',
    body: 'Appears every ~90s for 12s. Slot two charms (1/2), press E to fuse. Discovered recipes appear in this Codex. Fuse Shrines (T) offer mid-run fusions.',
  },
  {
    id: 'meta_shards',
    category: 'meta',
    title: 'Meta Shards',
    body: 'Persistent currency from runs. Spend on HP, capacity, speed, shard bonus, minion slots, starting charms, and biomes.',
  },
  {
    id: 'pain_ecology',
    category: 'ecology',
    title: 'Burden Ecology',
    body: 'Four pain types layer in your pool: Grief, Rage, Dread, Hollow. Enemy types emit different flavors. Grief+Rage → Wrath Storm. Dread+Hollow → Miasma slow.',
  },
  {
    id: 'structures',
    category: 'structures',
    title: 'Burden Architecture',
    body: 'Q/R/T cycle build mode. Q: Pain Relay routes burden to minions. R: Sink Tower drains nearby pain. T: Fuse Shrine — one-time meld.',
  },
  {
    id: 'world_chunks',
    category: 'core',
    title: 'World Chunks',
    body: 'Arena expands each wave — walls crumble, new floor tiles appear. Every 4 waves, discover a shrine for capacity, heal, or shards.',
  },
];

export function meldCodexEntries(discovered: CharmId[]): CodexEntry[] {
  const fused = Object.values(CHARM_DEFS).filter((c) => c.tier === 'fused');
  return fused.map((def) => {
    const recipe = MELD_RECIPES.find((r) => r.result === def.id);
    const known = discovered.includes(def.id);
    const a = recipe ? CHARM_DEFS[recipe.a].name : '?';
    const b = recipe ? CHARM_DEFS[recipe.b].name : '?';
    return {
      id: `meld_${def.id}`,
      category: 'melds' as const,
      title: known ? def.name : '???',
      body: known
        ? `${a} + ${b} → ${def.desc}`
        : 'Undiscovered fusion. Experiment at the Meld Altar.',
    };
  });
}

export function allCodexEntries(discoveredMelds: CharmId[]): CodexEntry[] {
  return [...CODEX_ENTRIES, ...meldCodexEntries(discoveredMelds)];
}
