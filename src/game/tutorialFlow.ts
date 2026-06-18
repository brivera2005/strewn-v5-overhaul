export interface CyoaChoice {
  label: string;
  next: string;
  flag?: string;
}

export interface CyoaNode {
  id: string;
  title: string;
  body: string;
  teaches?: string;
  choices?: CyoaChoice[];
  advance?: 'chapter0' | 'triage' | 'continue';
}

export const CYOA_NODES: Record<string, CyoaNode> = {
  awakening: {
    id: 'awakening',
    title: 'Something stirs in the dark',
    body: 'You wake to a sound you cannot name. Not a siren. Not a voice. A weight pressing on someone you love.',
    teaches: 'Strewn is not explained yet — only felt.',
    choices: [
      { label: 'Feel the weight — what is it?', next: 'the_weight' },
      { label: 'Reach for the glowing screen', next: 'the_registry' },
    ],
  },
  the_registry: {
    id: 'the_registry',
    title: 'A screen you installed months ago',
    body: 'Household Registry. You never needed it until tonight. It hums like it has been waiting.',
    teaches: 'The registry is how burden gets distributed — you will learn what that means.',
    choices: [{ label: 'What does it want from me?', next: 'the_weight' }],
  },
  the_weight: {
    id: 'the_weight',
    title: 'Pain has shape',
    body: 'Ethan burns. You feel it in your chest before you see the thermometer. Something in you knows: this weight can move.',
    teaches: 'Pain Load is the core meter — fever, suffering, mortality risk all flow from it.',
    choices: [
      { label: 'Can I split it?', next: 'channels_intro' },
      { label: 'What if I do nothing?', next: 'the_cost' },
    ],
  },
  the_cost: {
    id: 'the_cost',
    title: 'The cost of carrying alone',
    body: 'One body breaks. You have seen it — a parent who never sleeps, a child who never heals. There is another way, but it has a price.',
    teaches: 'Every absorption drains Life Energy from whoever helps.',
    choices: [{ label: 'Show me how to split it', next: 'channels_intro' }],
  },
  channels_intro: {
    id: 'channels_intro',
    title: 'Two channels, one fever',
    body: 'Fever burns in the inflammatory channel — heat, swelling, the body fighting. Exhaustion floods the systemic channel — chills, fatigue, the whole body giving up.',
    teaches: 'Inflammatory vs Systemic: assign helpers to the channel they match best.',
    choices: [{ label: 'Who can help?', next: 'your_family' }],
  },
  your_family: {
    id: 'your_family',
    title: 'Your household answers',
    body: 'Sarah knows inflammatory care — she is a nurse. Mike holds steady against systemic drain. They are not strangers. They are yours.',
    teaches: 'Family members are your first helpers with unique match scores per channel.',
    choices: [{ label: 'I am ready', next: 'time_intro' }],
  },
  time_intro: {
    id: 'time_intro',
    title: 'The night moves when you say so',
    body: 'Time does not run on its own. You press Play when you are ready. Each step, pain shifts. Each step, someone pays.',
    teaches: 'Pause/Play controls simulation ticks. Speed 1×–3× available.',
    choices: [{ label: 'Enter the Mitchell house', next: 'chapter0_bridge' }],
  },
  chapter0_bridge: {
    id: 'chapter0_bridge',
    title: 'Ethan\'s fever: 101.3°F',
    body: '3 AM. Denver. A seven-year-old burns. The tutorial walks you through one assignment at a time — select, assign, play.',
    advance: 'chapter0',
  },
  after_win: {
    id: 'after_win',
    title: 'The fever breaks',
    body: 'Ethan sleeps. Your family is drained but standing. Whatever Strewn is — it worked in one house. The registry whispers: the burden does not stop at your door.',
    teaches: 'Chapter 0 taught household relief. The real game scales outward.',
    choices: [
      { label: 'What comes next?', next: 'strewn_reveal' },
      { label: 'I need a moment', next: 'strewn_reveal' },
    ],
  },
  strewn_reveal: {
    id: 'strewn_reveal',
    title: 'What Strewn actually is',
    body: 'Strewn distributes pain across willing bodies — family first, then constructs you deploy. No one person carries it alone. Every choice writes a ledger. Every absorption costs energy.',
    teaches: 'Strewn = distributed burden strategy. Save people by sharing their pain.',
    choices: [{ label: 'How do I scale this?', next: 'minion_reveal' }],
  },
  minion_reveal: {
    id: 'minion_reveal',
    title: 'Not people. Constructs.',
    body: 'You cannot save a ward with family alone. Strewn spawns minions — Shade Units, Beacon Drones — abstract carriers with no faces, only capacity.',
    teaches: 'Minions replace volunteer NPCs. Deploy them like tools.',
    choices: [{ label: 'What else do I gain?', next: 'loot_reveal' }],
  },
  loot_reveal: {
    id: 'loot_reveal',
    title: 'What you carry matters',
    body: 'Every stabilized case can drop relics. Stats stack — Resilience, Insight, Burden Capacity, Relief Power. Combos multiply rewards. Assign. Survive. Loot. Grow.',
    teaches: 'The addictive loop: save people → earn loot → boost stats → deploy more minions.',
    advance: 'triage',
  },
};

export const CYOA_START = 'awakening';

export function getCyoaNode(id: string): CyoaNode {
  return CYOA_NODES[id] ?? CYOA_NODES.awakening;
}
