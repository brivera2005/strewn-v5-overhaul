export interface TutorialStep {
  id: string;
  title: string;
  body: string;
  trigger: 'start' | 'first_lash' | 'burden_half' | 'first_orb' | 'first_sink' | 'shrine';
  skippable: boolean;
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'move_lash',
    title: 'Painweaver Awakens',
    body: 'WASD to move. Aim with your mouse and LEFT CLICK to fire Pain Lash. Every hit marks an enemy for routing.',
    trigger: 'start',
    skippable: true,
  },
  {
    id: 'pain_orbs',
    title: 'Pain Orbs',
    body: 'Slain foes drop glowing Pain Orbs. Walk over them or let them magnetize at short range. They fill your Burden Bar.',
    trigger: 'first_orb',
    skippable: true,
  },
  {
    id: 'burden_vent',
    title: 'Vent the Weight',
    body: 'When the Burden Bar rises, the screen tints red. RIGHT CLICK to vent a shockwave: damage nearby foes and shed burden instantly.',
    trigger: 'burden_half',
    skippable: true,
  },
  {
    id: 'pain_network',
    title: 'Pain Network',
    body: 'Press Q to place a Sink Node (max 2). Lashed enemies bleed pain along visible paths through YOU to your sinks. Match sink color to pain type or pay double burden.',
    trigger: 'first_sink',
    skippable: true,
  },
  {
    id: 'meld_shrine',
    title: 'Meld Shrines',
    body: 'Find shrines on the map. Press E to open melding. Slot relics with 1 and 2, then fuse hybrids. Press C anytime for the full Codex.',
    trigger: 'shrine',
    skippable: true,
  },
];

export function getTutorialStep(id: string): TutorialStep | undefined {
  return TUTORIAL_STEPS.find((s) => s.id === id);
}
