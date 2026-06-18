import {
  CHARACTERS,
  MATCH_SCORES,
  LOSS_LE_THRESHOLD,
  LOSS_PAIN_THRESHOLD,
  LOSS_PAIN_TICKS,
  WIN_PAIN_THRESHOLD,
  type PainVector,
} from './constants';
import { getMinionMatch } from './minions';
import type { Allocation, GameState, ParticipantState, TickResult } from './State';

const VECTOR_PENALTY: Record<PainVector, number> = {
  inflammatory: 1.1,
  systemic: 1.0,
};

function getMatchScore(participantId: string, vector: PainVector): number {
  if (participantId.startsWith('minion-')) {
    return getMinionMatch(participantId, vector);
  }
  return MATCH_SCORES[participantId]?.[vector] ?? 50;
}

export function computeReliefContribution(
  allocation: Allocation,
  participant: ParticipantState,
  vectorParticipantCount: number,
): number {
  const transferEfficiency = getMatchScore(allocation.participantId, allocation.vector) / 100;
  const weightFraction = allocation.weight / 100;
  const fractionCap = Math.min(weightFraction, participant.maxFraction);
  const diminishing = 1 / (1 + 0.35 * Math.max(0, vectorParticipantCount - 1));
  return fractionCap * transferEfficiency * diminishing;
}

export function computeGlobalReliefRate(
  allocations: Allocation[],
  participants: ParticipantState[],
): number {
  const active = allocations.filter((a) => a.weight > 0);
  if (active.length === 0) return 0;

  let product = 1;
  for (const vector of ['inflammatory', 'systemic'] as PainVector[]) {
    const onVector = active.filter((a) => a.vector === vector);
    if (onVector.length === 0) continue;
    for (const alloc of onVector) {
      const p = participants.find((x) => x.id === alloc.participantId);
      if (!p || !p.active) continue;
      const contrib = computeReliefContribution(alloc, p, onVector.length);
      product *= 1 - contrib;
    }
  }
  return 1 - product;
}

function endurePainModifier(tick: number, choiceMade: boolean, pathChoice: GameState['pathChoice']): number {
  if (!choiceMade || pathChoice !== 'endure') return 0;
  if (tick <= 4) return 8 + tick * 2;
  if (tick <= 8) return Math.max(0, 18 - (tick - 4) * 4);
  return -12;
}

export function simulateTick(state: GameState): TickResult {
  const activeParticipants = state.participants.filter((p) => p.active);
  const activeAllocations = state.allocations.filter((a) => {
    const p = activeParticipants.find((x) => x.id === a.participantId);
    return p && a.weight > 0;
  });

  const globalReliefRate = computeGlobalReliefRate(activeAllocations, state.participants);
  const endureMod = endurePainModifier(state.tick, state.choiceMade, state.pathChoice);
  const naturalDecay =
    state.pathChoice === 'endure' && state.tick > 8
      ? 0.07
      : state.pathChoice === 'endure'
        ? 0.015
        : 0.012;

  let patientPain =
    state.basePain * (1 - globalReliefRate) + endureMod - naturalDecay * state.basePain;
  patientPain = Math.max(8, Math.min(99, patientPain));

  const leDeltas = new Map<string, number>();
  const absorbedByParticipant = new Map<string, number>();
  const ledgerEntries: TickResult['ledgerEntries'] = [];

  for (const alloc of activeAllocations) {
    const participant = state.participants.find((p) => p.id === alloc.participantId);
    if (!participant || !participant.active) continue;

    const transferEfficiency = getMatchScore(alloc.participantId, alloc.vector) / 100;
    const absorbedPain =
      (alloc.weight / 100) * state.basePain * transferEfficiency * (1 - naturalDecay);

    absorbedByParticipant.set(alloc.participantId, absorbedPain);

    const vectorPenalty = VECTOR_PENALTY[alloc.vector];
    const deltaLE = -Math.pow(Math.max(0.1, absorbedPain), 1.3) * 0.05 * vectorPenalty;
    leDeltas.set(alloc.participantId, (leDeltas.get(alloc.participantId) ?? 0) + deltaLE);

    if (absorbedPain > 0.5) {
      ledgerEntries.push({
        tick: state.tick,
        category: 'LE_DRAG',
        deltaShort: deltaLE,
        humanReadable: `${participant.name.split(' ')[0]} absorbed ${absorbedPain.toFixed(1)} pain → Energy ${deltaLE.toFixed(1)}`,
      });
    }
  }

  for (const p of activeParticipants) {
    if (!absorbedByParticipant.has(p.id)) {
      leDeltas.set(p.id, (leDeltas.get(p.id) ?? 0) + 0.15);
    }
  }

  const reliefDelta = state.patientPain - patientPain;
  if (reliefDelta > 0) {
    ledgerEntries.push({
      tick: state.tick,
      category: 'RELIEF',
      deltaShort: reliefDelta,
      humanReadable: `Ethan's fever eased by ${reliefDelta.toFixed(1)} points (${(globalReliefRate * 100).toFixed(0)}% relief)`,
    });
  }

  if (state.pathChoice === 'endure' && state.tick === 8) {
    ledgerEntries.push({
      tick: state.tick,
      category: 'IMMUNITY',
      deltaShort: 0.08,
      humanReadable: 'Endure path: Immunity +0.08 banked for next illness',
    });
  }

  return {
    patientPain,
    globalReliefRate,
    leDeltas,
    absorbedByParticipant,
    ledgerEntries,
  };
}

export function applyTickResult(state: GameState, result: TickResult): void {
  state.patientPain = result.patientPain;
  state.globalReliefRate = result.globalReliefRate;

  for (const [id, delta] of result.leDeltas) {
    const p = state.participants.find((x) => x.id === id);
    if (p) {
      p.le = Math.max(0, Math.min(100, p.le + delta));
    }
  }

  for (const entry of result.ledgerEntries) {
    state.ledger.unshift(entry);
    if (entry.category === 'RELIEF') {
      state.dalysSaved += Math.max(0, entry.deltaShort * 0.8);
    }
  }

  if (state.patientPain > LOSS_PAIN_THRESHOLD) {
    state.highPainTicks += 1;
  } else {
    state.highPainTicks = 0;
  }
}

export function checkEndConditions(state: GameState): GameState['endReason'] {
  if (state.patientPain <= WIN_PAIN_THRESHOLD && state.tick >= 4) {
    return 'win';
  }
  for (const p of state.participants.filter((x) => x.active)) {
    if (p.le < LOSS_LE_THRESHOLD) return 'le_collapse';
  }
  if (state.highPainTicks >= LOSS_PAIN_TICKS) return 'pain_crisis';
  return null;
}

export function computeScore(state: GameState): number {
  const active = state.participants.filter((p) => p.active);
  const leAvg = active.reduce((s, p) => s + p.le, 0) / Math.max(1, active.length);
  const painScore = Math.max(0, 100 - state.patientPain);
  const tickBonus = Math.max(0, 30 - state.tick) * 10;
  const immunityBonus = state.immunityBonus * 200;
  const pathBonus = state.pathChoice === 'endure' ? 50 : 0;
  return Math.round(painScore + leAvg + tickBonus + immunityBonus + pathBonus + state.dalysSaved);
}

export function createInitialParticipants(): ParticipantState[] {
  return [
    {
      id: CHARACTERS.sarah.id,
      name: CHARACTERS.sarah.name,
      role: CHARACTERS.sarah.role,
      isaaId: CHARACTERS.sarah.isaaId,
      le: CHARACTERS.sarah.initialLE,
      maxFraction: CHARACTERS.sarah.maxFraction,
      active: true,
      initial: CHARACTERS.sarah.initial,
      color: CHARACTERS.sarah.color,
    },
    {
      id: CHARACTERS.mike.id,
      name: CHARACTERS.mike.name,
      role: CHARACTERS.mike.role,
      isaaId: CHARACTERS.mike.isaaId,
      le: CHARACTERS.mike.initialLE,
      maxFraction: CHARACTERS.mike.maxFraction,
      active: true,
      initial: CHARACTERS.mike.initial,
      color: CHARACTERS.mike.color,
    },
  ];
}

export function getMatchMatrix(participants: ParticipantState[]): number[][] {
  const vectors: PainVector[] = ['inflammatory', 'systemic'];
  return participants.map((p) => vectors.map((v) => getMatchScore(p.id, v)));
}

export function getMarginalWarning(
  allocations: Allocation[],
  participants: ParticipantState[],
): string | null {
  for (const vector of ['inflammatory', 'systemic'] as PainVector[]) {
    const onVector = allocations.filter((a) => a.weight > 0 && a.vector === vector);
    if (onVector.length >= 2) {
      const names = onVector
        .map((a) => participants.find((p) => p.id === a.participantId)?.name.split(' ')[0])
        .filter(Boolean)
        .join(' and ');
      const rate = computeGlobalReliefRate(allocations, participants);
      const soloRate = computeGlobalReliefRate(
        allocations.filter((a) => !onVector.slice(1).some((o) => o.participantId === a.participantId)),
        participants,
      );
      if (rate - soloRate < 0.08) {
        return `Diminishing returns: ${names} on ${vector}. Adding more helpers barely helps.`;
      }
    }
  }
  return null;
}

export function getMatchScoreFor(participantId: string, vector: PainVector): number {
  return getMatchScore(participantId, vector);
}
