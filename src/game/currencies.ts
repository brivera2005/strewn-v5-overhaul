/** Strewn v4 currency system: Relief Points, Research Points, Trust */

export interface CurrencyState {
  reliefPoints: number;
  researchPoints: number;
  trust: number;
}

export const INITIAL_CURRENCIES: CurrencyState = {
  reliefPoints: 100,
  researchPoints: 0,
  trust: 70,
};

export function rankFromDalys(dalys: number): number {
  return Math.min(50, Math.max(1, Math.floor(dalys / 25) + 1));
}

export function dalysForNextRank(rank: number): number {
  return rank * 25;
}

export function dalysProgress(dalys: number, rank: number): number {
  const current = (rank - 1) * 25;
  const next = rank * 25;
  if (next <= current) return 1;
  return Math.min(1, (dalys - current) / (next - current));
}

export interface TickCurrencyDelta {
  reliefPoints: number;
  researchPoints: number;
  trust: number;
}

export function computeTickCurrencyRewards(
  stabilized: number,
  reliefPerTick: number,
  deathsThisTick: number,
  streakTicks: number,
  comboMultiplier: number,
): TickCurrencyDelta {
  let rp = reliefPerTick * 2 * comboMultiplier;
  if (stabilized > 0) rp += stabilized * 15 * comboMultiplier;
  if (streakTicks >= 7) rp += 10;

  let resp = stabilized > 0 ? stabilized * 3 : 0;
  let trust = deathsThisTick > 0 ? -deathsThisTick * 3 : 0.2;
  if (streakTicks >= 10) trust += 0.5;

  return {
    reliefPoints: Math.round(rp),
    researchPoints: Math.round(resp),
    trust: Math.round(trust * 10) / 10,
  };
}

export function applyCurrencyDelta(state: CurrencyState, delta: TickCurrencyDelta): CurrencyState {
  return {
    reliefPoints: Math.max(0, state.reliefPoints + delta.reliefPoints),
    researchPoints: Math.max(0, state.researchPoints + delta.researchPoints),
    trust: Math.max(0, Math.min(100, state.trust + delta.trust)),
  };
}

export function spendResearch(state: CurrencyState, cost: number): CurrencyState | null {
  if (state.researchPoints < cost) return null;
  return { ...state, researchPoints: state.researchPoints - cost };
}

export function spendTrust(state: CurrencyState, cost: number): CurrencyState | null {
  if (state.trust < cost) return null;
  return { ...state, trust: state.trust - cost };
}
