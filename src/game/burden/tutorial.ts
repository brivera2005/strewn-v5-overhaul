export interface TutorialStep {
  id: string;
  title: string;
  body: string;
  trigger: 'start' | 'burden_half' | 'first_kill' | 'overflow_near' | 'altar' | 'minion';
  skippable: boolean;
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'The Weight Returns',
    body: 'Move with WASD. Every foe bleeds suffering into your Burden Pool. When it overflows, you take damage. Survive by routing pain — not ignoring it.',
    trigger: 'start',
    skippable: true,
  },
  {
    id: 'pain_layers',
    title: 'Pain Has Color',
    body: 'Burden comes in four types: Grief (blue), Rage (red), Dread (purple), Hollow (gray). Different enemies emit different pain. Mix them at the Meld Altar for unique fusions.',
    trigger: 'burden_half',
    skippable: true,
  },
  {
    id: 'first_kill',
    title: 'Death Releases Pain',
    body: 'Killing enemies dumps a burst of burden into your pool — but also drops XP gems. Balance offense with capacity.',
    trigger: 'first_kill',
    skippable: true,
  },
  {
    id: 'minion',
    title: 'Share the Load',
    body: 'Press SPACE to deploy a Minion — a burden sink that orbits you. Costs burden to deploy, but absorbs pain over time.',
    trigger: 'minion',
    skippable: true,
  },
  {
    id: 'altar',
    title: 'Meld Altar',
    body: 'When the altar glows, press 1 and 2 to slot charms, then E to fuse. Discover 20+ recipes — silhouettes hide until found. Grief + Rage unlocks Wrath Storm!',
    trigger: 'altar',
    skippable: true,
  },
];

export function getTutorialStep(id: string): TutorialStep | undefined {
  return TUTORIAL_STEPS.find((s) => s.id === id);
}
