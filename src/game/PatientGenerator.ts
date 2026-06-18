export interface RegionAnchor {
  state: string;
  abbr: string;
}

export const WARDS = [
  'ICU-A', 'ICU-B', 'Med-Surg 3', 'Med-Surg 5', 'Oncology', 'Peds-2',
  'Emergency', 'Burn Unit', 'Neuro-Wing', 'Cardiac', 'Isolation-4', 'Recovery',
];

export const DISEASE_ICONS: Record<string, string> = {
  'Influenza A': '🤧',
  Pneumonia: '🫁',
  Cellulitis: '🔴',
  Sepsis: '☠️',
  'COVID-19': '🦠',
  'Diabetic ketoacidosis': '💉',
  'Heart failure': '❤️‍🩹',
  'COPD exacerbation': '🌬️',
  'UTI sepsis': '🚽',
  Meningitis: '🧠',
  Appendicitis: '🔪',
  Pancreatitis: '🔥',
  'Lyme disease': '🦟',
  Shingles: '⚡',
  'Rheumatoid flare': '🦴',
  'Crohn flare': '🌀',
  'Migraine cluster': '🤕',
  'Sickle cell crisis': '🩸',
  'Burn trauma': '🔥',
  'Post-surgical pain': '🏥',
  'Kidney stones': '💎',
  'Gout attack': '🦶',
  'Fibromyalgia flare': '⚡',
  'MS relapse': '🧬',
  'Cancer pain': '🎗️',
  Neuropathy: '⚡',
  'Endometriosis flare': '🌸',
  'Asthma attack': '😮‍💨',
  'Anaphylaxis recovery': '🐝',
  'Fracture pain': '🦴',
};

export const DISEASES = [
  'Influenza A', 'Pneumonia', 'Cellulitis', 'Sepsis', 'COVID-19',
  'Diabetic ketoacidosis', 'Heart failure', 'COPD exacerbation', 'UTI sepsis',
  'Meningitis', 'Appendicitis', 'Pancreatitis', 'Lyme disease', 'Shingles',
  'Rheumatoid flare', 'Crohn flare', 'Migraine cluster', 'Sickle cell crisis',
  'Burn trauma', 'Post-surgical pain', 'Kidney stones', 'Gout attack',
  'Fibromyalgia flare', 'MS relapse', 'Cancer pain', 'Neuropathy',
  'Endometriosis flare', 'Asthma attack', 'Anaphylaxis recovery', 'Fracture pain',
];

export const FIRST_NAMES = [
  'James', 'Mary', 'Robert', 'Patricia', 'John', 'Jennifer', 'Michael', 'Linda',
  'David', 'Elizabeth', 'William', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica',
  'Thomas', 'Sarah', 'Christopher', 'Karen', 'Charles', 'Lisa', 'Daniel', 'Nancy',
  'Matthew', 'Betty', 'Anthony', 'Margaret', 'Mark', 'Sandra', 'Donald', 'Ashley',
  'Steven', 'Kimberly', 'Paul', 'Emily', 'Andrew', 'Donna', 'Joshua', 'Michelle',
  'Priya', 'Wei', 'Carlos', 'Olga', 'Raj', 'Yuki', 'Amara', 'Ethan',
];

export const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Wilson', 'Anderson', 'Thomas',
  'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Harris', 'Clark', 'Lewis',
  'Walker', 'Hall', 'Allen', 'Young', 'King', 'Wright', 'Scott', 'Green',
  'Patel', 'Kim', 'Chen', 'Okonkwo', 'Petrov', 'Santos', 'Nakamura', 'Mitchell',
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generatePatientId(index: number): string {
  return `CASE-${String(index + 1).padStart(4, '0')}`;
}

export function generatePatientName(index: number): string {
  return generatePatientId(index);
}

export interface GeneratedPatientSeed {
  id: string;
  name: string;
  age: number;
  disease: string;
  ward: string;
  painLoad: number;
  stage: 1 | 2 | 3 | 4;
  mortalityRisk: number;
  icon: string;
}

export function generatePatientSeed(index: number): GeneratedPatientSeed {
  const stage = (1 + Math.floor(Math.random() * 4)) as 1 | 2 | 3 | 4;
  const basePain = 20 + Math.random() * 60 + stage * 8;
  const disease = pick(DISEASES);
  return {
    id: generatePatientId(index),
    name: generatePatientName(index),
    age: 4 + Math.floor(Math.random() * 82),
    disease,
    ward: pick(WARDS),
    painLoad: Math.min(95, basePain),
    stage,
    mortalityRisk: Math.min(85, 10 + stage * 15 + Math.random() * 30),
    icon: DISEASE_ICONS[disease] ?? '🏥',
  };
}

export function generatePatientBatch(count: number): GeneratedPatientSeed[] {
  const usedNames = new Set<string>();
  const patients: GeneratedPatientSeed[] = [];
  for (let i = 0; i < count; i++) {
    let seed = generatePatientSeed(i);
    while (usedNames.has(seed.name)) {
      seed = { ...seed, id: generatePatientId(i + 1000), name: generatePatientName(i + 1000) };
    }
    usedNames.add(seed.name);
    patients.push(seed);
  }
  return patients;
}

export function getDiseaseIcon(disease: string): string {
  return DISEASE_ICONS[disease] ?? '🏥';
}
