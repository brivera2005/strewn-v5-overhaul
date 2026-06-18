import type { PainPool, PainType } from '../arena/types';

export const PAIN_TYPES: PainType[] = ['grief', 'rage', 'dread', 'hollow'];

export const PAIN_COLORS: Record<PainType, string> = {
  grief: '#6b8cff',
  rage: '#ff4466',
  dread: '#9d4edd',
  hollow: '#4a5568',
};

export const PAIN_NAMES: Record<PainType, string> = {
  grief: 'Grief',
  rage: 'Rage',
  dread: 'Dread',
  hollow: 'Hollow',
};

export function emptyPainPool(): PainPool {
  return { grief: 0, rage: 0, dread: 0, hollow: 0 };
}

export function totalPain(pool: PainPool): number {
  return pool.grief + pool.rage + pool.dread + pool.hollow;
}

export function addPain(pool: PainPool, type: PainType, amount: number): void {
  pool[type] = Math.max(0, pool[type] + amount);
}

export function drainPain(pool: PainPool, amount: number): number {
  const total = totalPain(pool);
  if (total <= 0) return 0;
  const drained = Math.min(total, amount);
  const ratio = drained / total;
  for (const t of PAIN_TYPES) {
    pool[t] *= 1 - ratio;
  }
  return drained;
}

export const ENEMY_PAIN: Record<string, PainType> = {
  wretch: 'grief',
  howler: 'rage',
  anchor: 'dread',
  boss: 'hollow',
};

export function wrathStormReady(pool: PainPool, threshold = 30): boolean {
  return pool.grief >= threshold && pool.rage >= threshold;
}

export function wrathStormDamage(pool: PainPool): number {
  return Math.sqrt(pool.grief * pool.rage) * 0.4;
}

export function miasmaSlow(pool: PainPool): number {
  return Math.min(0.5, (pool.dread + pool.hollow) * 0.002);
}
