/** Clinical Noir palette & game constants */

export const COLORS = {
  midnight: '#0A0E17',
  slate: '#141B2D',
  teal: '#00D4AA',
  coral: '#FF4D6A',
  amber: '#FFB020',
  violet: '#7B61FF',
  white: '#E8ECF4',
  dim: '#6B7A99',
  danger: '#FF2244',
  success: '#00FF88',
} as const;

export type PainVector = 'inflammatory' | 'systemic';

export const VECTORS: PainVector[] = ['inflammatory', 'systemic'];

export const VECTOR_LABELS: Record<PainVector, string> = {
  inflammatory: 'Inflammatory',
  systemic: 'Systemic',
};

export const VECTOR_DESCRIPTIONS: Record<PainVector, string> = {
  inflammatory:
    'Fever, swelling, and heat: the body fighting infection. Best matched to caregivers with strong immune response.',
  systemic:
    'Whole-body fatigue, chills, and exhaustion. Best matched to steady, resilient helpers.',
};

export const MATCH_SCORES: Record<string, Partial<Record<PainVector, number>>> = {
  sarah: { inflammatory: 85, systemic: 62 },
  mike: { inflammatory: 58, systemic: 72 },
};

export const CHARACTERS = {
  ethan: {
    id: 'ethan',
    name: 'Ethan Mitchell',
    role: 'Patient · Age 7',
    isaaId: 'US-HH-MITCHELL-DEP-001',
    age: 7,
    basePain: 44,
    initial: 'E',
    color: '#FF4D6A',
  },
  sarah: {
    id: 'sarah',
    name: 'Sarah Mitchell',
    role: 'Mother · Nurse',
    isaaId: 'US-HH-MITCHELL-001',
    age: 38,
    initialLE: 88,
    maxFraction: 0.4,
    initial: 'S',
    color: '#00D4AA',
  },
  mike: {
    id: 'mike',
    name: 'Mike Mitchell',
    role: 'Father · Engineer',
    isaaId: 'US-HH-MITCHELL-002',
    age: 40,
    initialLE: 86,
    maxFraction: 0.4,
    initial: 'M',
    color: '#7B61FF',
  },
} as const;

export const WIN_PAIN_THRESHOLD = 22;
export const LOSS_PAIN_THRESHOLD = 60;
export const LOSS_PAIN_TICKS = 5;
export const LOSS_LE_THRESHOLD = 15;

export const NORMAL_TEMP_F = 98.6;
export const FEVER_TEMP_F = 101.3;
export const BASE_PAIN = CHARACTERS.ethan.basePain;
export const WIN_TEMP_F = 100.0;

export const TICK_MS_BASE = 2000;
export const CHOICE_TICK = 3;

export const HOUSEHOLD_ID = 'US-HH-MITCHELL-001';

export const WELCOME_TEXT = {
  title: 'What is Strewn?',
  body: 'Strewn distributes pain across family and minions so no single body breaks. Loot drops. Stats stack. The loop never stops.',
  subtitle: 'Tonight you learn why the weight exists — one choice at a time.',
};

export const STORY_PARAGRAPHS = [
  '3 AM. Denver, Colorado. The house is quiet except for a small body shaking under thin blankets.',
  'The thermometer reads 101.3°F. Ethan is seven years old, burning up with a fever that won\'t break.',
  'Sarah knows about Strewn, a way to share the weight of illness with people who volunteer to help. Tonight, the volunteers are family.',
  'Mike holds Ethan\'s hand. Sarah opens the household registry on her phone. Someone has to decide how the burden gets split.',
  'Every choice writes a ledger. Every absorption costs energy. There is no perfect answer, only the one you can live with.',
];

export const PATH_CHOICE_COPY = {
  title: 'A fork in the night',
  intro: 'Ethan\'s fever holds steady. Keep sharing the burden, or step back and let his body fight.',
  strewn: {
    label: 'Keep Strewn',
    summary: 'Family keeps absorbing. Faster relief, draining energy.',
    pros: ['Fever drops faster', 'Ethan suffers less now', 'You stay in control'],
    cons: ['Life Energy drops for helpers', 'Diminishing returns on stacked channels'],
  },
  endure: {
    label: 'Let Endure',
    summary: 'Stop absorbing. Harder tonight, immunity bonus later.',
    pros: ['Helpers recover energy', 'Immunity bonus for Ethan', 'Teaches the body to fight'],
    cons: ['Fever stays high longer', 'More suffering short-term', 'Risk if pain stays high'],
  },
};

export function painToFahrenheit(pain: number): number {
  const slope = (FEVER_TEMP_F - NORMAL_TEMP_F) / BASE_PAIN;
  return NORMAL_TEMP_F + pain * slope;
}

export function formatTempF(pain: number): string {
  return `${painToFahrenheit(pain).toFixed(1)}°F`;
}

export function leColor(le: number): string {
  if (le >= 60) return COLORS.success;
  if (le >= 30) return COLORS.amber;
  return COLORS.danger;
}

export function matchLabel(score: number): string {
  if (score >= 80) return 'Excellent match';
  if (score >= 70) return 'Good match';
  if (score >= 60) return 'Fair match';
  return 'Poor match';
}

export const STATUS_COLORS: Record<string, string> = {
  stable: '#00FF88',
  strained: '#FFB020',
  critical: '#FF8800',
  dying: '#FF2244',
  dead: '#333333',
  endured: '#6B7A99',
  'strewn-active': '#00D4AA',
};

export const CREDITS_TEXT = [
  'Strewn v5: Burden Loop Overhaul',
  'Design & Development: Strewn Team',
  'Music: Procedural Web Audio Engine',
  'Built with React, TypeScript, Electron',
  'Thank you for playing.',
];
