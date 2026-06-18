import type { CharmId } from '../arena/types';
import { CHARM_DEFS } from '../arena/charms';

export interface CodexEntry {
  id: string;
  category: 'core' | 'ecology' | 'melds' | 'network' | 'meta';
  title: string;
  body: string;
  hidden?: boolean;
}

const CORE: CodexEntry[] = [
  {
    id: 'strewn',
    category: 'core',
    title: 'STREWN',
    body: 'A shattered world where every wound echoes. You are a Painweaver: the Router who shares suffering instead of hoarding it.',
  },
  {
    id: 'lash',
    category: 'core',
    title: 'Pain Lash',
    body: 'Left click fires a pain bolt. Hits mark enemies for the Pain Network and deal direct damage with satisfying hit-stop.',
  },
  {
    id: 'vent',
    category: 'core',
    title: 'Vent Burden',
    body: 'Right click releases a shockwave when you carry burden. Clears a chunk of weight and damages nearby foes. Your panic button and power fantasy.',
  },
  {
    id: 'orbs',
    category: 'core',
    title: 'Pain Orbs',
    body: 'Enemies drop visible orbs tinted by pain type. Collect on contact or via short-range vacuum magnetism.',
  },
];

const ECOLOGY: CodexEntry[] = [
  {
    id: 'grief',
    category: 'ecology',
    title: 'Grief (Blue)',
    body: 'Emitted by Wretches. Slow, heavy sorrow. Grief sinks absorb it cleanly.',
  },
  {
    id: 'rage',
    category: 'ecology',
    title: 'Rage (Red)',
    body: 'Emitted by Howlers. Fast spikes of fury. Route through rage sinks.',
  },
  {
    id: 'dread',
    category: 'ecology',
    title: 'Dread (Purple)',
    body: 'Emitted by Anchors. Dense dread that slows you when your pool is thick with it.',
  },
  {
    id: 'hollow',
    category: 'ecology',
    title: 'Hollow (Gray)',
    body: 'Emitted by bosses. Empty ache. Mismatched routing hurts twice as much.',
  },
];

const NETWORK: CodexEntry[] = [
  {
    id: 'sinks',
    category: 'network',
    title: 'Sink Nodes',
    body: 'Press Q to place a sink (max 2, upgrades add more). Each sink has a pain affinity. Pain from lashed foes flows along bezier lines through you.',
  },
  {
    id: 'router',
    category: 'network',
    title: 'You Are the Router',
    body: 'Stand between enemy clusters and your sinks to tighten routes. Efficient routing drains pain into sinks instead of your Burden Bar.',
  },
  {
    id: 'mismatch',
    category: 'network',
    title: 'Type Mismatch',
    body: 'Routing rage into a grief sink still works, but you absorb 2x burden. Match colors for clean runs.',
  },
  {
    id: 'strain_echo',
    category: 'network',
    title: 'Strain Echo',
    body: 'Unlocked wave 5+. Faint afterimages echo your lash path. Subtle aid, not orbiting minions.',
  },
];

const META: CodexEntry[] = [
  {
    id: 'remnants',
    category: 'meta',
    title: 'Remnants',
    body: 'Meta currency earned on death. Spend in the Remnant Tree for permanent upgrades between runs.',
  },
  {
    id: 'runs',
    category: 'meta',
    title: 'Run Structure',
    body: '20-minute runs with escalating waves. Boss every 5 waves. Level up: pick 1 of 3 relic upgrades.',
  },
];

export function allCodexEntries(discoveredMelds: CharmId[]): CodexEntry[] {
  const meldEntries: CodexEntry[] = Object.values(CHARM_DEFS)
    .filter((c) => c.tier === 'fused')
    .map((c) => ({
      id: c.id,
      category: 'melds' as const,
      title: discoveredMelds.includes(c.id) ? c.name : '???',
      body: discoveredMelds.includes(c.id) ? c.desc : 'Fuse two base relics at a shrine to discover this hybrid.',
      hidden: !discoveredMelds.includes(c.id),
    }));

  return [...CORE, ...ECOLOGY, ...NETWORK, ...META, ...meldEntries];
}
