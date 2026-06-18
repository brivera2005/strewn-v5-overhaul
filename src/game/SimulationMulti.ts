import { painToFahrenheit } from './constants';
import type { GameState, MultiTickResult, PatientRecord, PatientStatus } from './State';
import { computeGlobalReliefRate, computeReliefContribution } from './Simulation';

export function derivePatientStatus(p: PatientRecord): PatientStatus {
  if (p.dead) return 'dead';
  if (p.allocations.length > 0 && p.painLoad < 40) return 'strewn-active';
  if (p.painLoad > 85 || p.mortalityRisk > 80) return 'dying';
  if (p.painLoad > 65 || p.mortalityRisk > 55) return 'critical';
  if (p.painLoad > 40) return 'strained';
  return 'stable';
}

export function simulateMultiPatientTick(
  state: GameState,
  participants: GameState['participants'],
): MultiTickResult {
  const ledgerEntries: MultiTickResult['ledgerEntries'] = [];
  const deathsThisTick: string[] = [];
  const stabilizedThisTick: string[] = [];
  const leDeltas = new Map<string, number>();

  for (const patient of state.patients) {
    if (patient.dead) continue;

    const activeAllocations = patient.allocations.filter((a) => a.weight > 0);
    const globalReliefRate = computeGlobalReliefRate(activeAllocations, participants);
    const naturalDecay = 0.008 + patient.stage * 0.002;

    let painLoad =
      patient.basePain * (1 - globalReliefRate) - naturalDecay * patient.basePain + patient.stage * 0.5;
    painLoad = Math.max(5, Math.min(99, painLoad));

    patient.painLoad = painLoad;
    patient.tempF = painToFahrenheit(painLoad);
    patient.assignedNetworkSize = activeAllocations.length;
    patient.matchAvg =
      activeAllocations.length > 0
        ? activeAllocations.reduce((s, a) => {
            const p = participants.find((x) => x.id === a.participantId);
            return s + (p ? 60 + Math.random() * 30 : 50);
          }, 0) / activeAllocations.length
        : 0;

    if (activeAllocations.length === 0) {
      patient.noAllocationTicks += 1;
    } else {
      patient.noAllocationTicks = 0;
    }

    if (painLoad > 95) {
      patient.highPainTicks += 1;
    } else {
      patient.highPainTicks = 0;
    }

    patient.mortalityRisk = Math.min(
      100,
      patient.mortalityRisk +
        (painLoad > 70 ? 1.5 : 0.3) -
        globalReliefRate * 2 -
        (activeAllocations.length > 0 ? 0.8 : 0),
    );

    for (const alloc of activeAllocations) {
      const participant = participants.find((p) => p.id === alloc.participantId);
      if (!participant || !participant.active) continue;
      const contrib = computeReliefContribution(alloc, participant, activeAllocations.length);
      const absorbed = contrib * patient.basePain * 0.3;
      const deltaLE = -Math.pow(Math.max(0.1, absorbed), 1.2) * 0.04;
      leDeltas.set(participant.id, (leDeltas.get(participant.id) ?? 0) + deltaLE);
    }

    const prevStatus = patient.status;
    patient.status = derivePatientStatus(patient);

    let died = false;
    if (patient.highPainTicks >= 5 || patient.mortalityRisk >= 100) {
      died = true;
    } else if (patient.stage >= 4 && patient.noAllocationTicks >= 10) {
      died = true;
    }

    if (died) {
      patient.dead = true;
      patient.status = 'dead';
      patient.painLoad = 0;
      deathsThisTick.push(patient.id);
      ledgerEntries.push({
        tick: state.tick,
        category: 'DEATH',
        deltaShort: -1,
        humanReadable: `${patient.name} has died (${patient.disease}, ${patient.ward})`,
      });
    } else if (
      prevStatus !== 'stable' &&
      patient.status === 'stable' &&
      activeAllocations.length > 0
    ) {
      stabilizedThisTick.push(patient.id);
      ledgerEntries.push({
        tick: state.tick,
        category: 'STABILIZE',
        deltaShort: 1,
        humanReadable: `${patient.name} stabilized (${patient.disease})`,
      });
    }

    patient.days += 1;
  }

  for (const [id, delta] of leDeltas) {
    const p = participants.find((x) => x.id === id);
    if (p) p.le = Math.max(0, Math.min(100, p.le + delta));
  }

  let reliefPerTick = 0;
  for (const patient of state.patients) {
    if (patient.dead) continue;
    const activeAllocations = patient.allocations.filter((a) => a.weight > 0);
    if (activeAllocations.length > 0) {
      const rate = computeGlobalReliefRate(activeAllocations, participants);
      reliefPerTick += rate * patient.basePain * 0.1;
    }
  }

  return { ledgerEntries, deathsThisTick, stabilizedThisTick, leDeltas, reliefPerTick };
}

export function getCriticalReasons(patient: PatientRecord, availableHelpers: number): string[] {
  const reasons: string[] = [];
  if (patient.allocations.length === 0) {
    reasons.push('No volunteers assigned');
    if (availableHelpers > 0) reasons.push(`Needs ${Math.min(2, availableHelpers)} more volunteer(s)`);
  }
  if (patient.painLoad > 85) reasons.push(`Pain load critical at ${patient.painLoad.toFixed(0)}%`);
  if (patient.mortalityRisk > 70) reasons.push(`Mortality risk at ${patient.mortalityRisk.toFixed(0)}%`);
  if (patient.noAllocationTicks >= 5) reasons.push(`Unassigned for ${patient.noAllocationTicks} ticks`);
  if (patient.highPainTicks >= 3) reasons.push(`High pain for ${patient.highPainTicks} consecutive ticks`);
  return reasons.slice(0, 3);
}

export function getSuggestedAction(patient: PatientRecord, availableHelpers: number): string | null {
  if (patient.dead) return null;
  if (patient.status !== 'critical' && patient.status !== 'dying') return null;
  if (patient.allocations.length === 0 && availableHelpers > 0) {
    return `Needs ${Math.min(2, availableHelpers)} more volunteer(s)`;
  }
  if (patient.painLoad > 80 && patient.allocations.length > 0) return 'Switch to Endure';
  if (patient.mortalityRisk > 75) return 'Assign Best Available';
  return 'Increase priority to P1';
}

export function getNetworkCapacity(state: GameState): { allocated: number; total: number } {
  const allocated = state.participants.filter((p) => p.assignedPatientId).length;
  const total = state.participants.filter((p) => p.active && p.le > 15).length;
  return { allocated, total };
}

export function forecastDeaths(state: GameState, ticks = 10): number {
  let forecast = 0;
  for (const p of state.patients) {
    if (p.dead) continue;
    const ticksToDeath = Math.max(0, (100 - p.mortalityRisk) / 2);
    if (ticksToDeath <= ticks && p.status !== 'stable') forecast += 1;
  }
  return forecast;
}

export function getTriageAlerts(state: GameState): {
  critical: number;
  deaths: number;
  draftThreshold: number;
} {
  const critical = state.patients.filter(
    (p) => !p.dead && (p.status === 'critical' || p.status === 'dying'),
  ).length;
  const recentDeaths = state.ledger.filter(
    (e) => e.category === 'DEATH' && e.tick >= state.tick - 3,
  ).length;
  const activeParticipants = state.participants.filter((p) => p.active && p.le > 15).length;
  const draftThreshold = Math.min(
    100,
    Math.round((state.patients.filter((p) => !p.dead).length / Math.max(1, activeParticipants)) * 25),
  );
  return { critical, deaths: recentDeaths, draftThreshold };
}

export function buildTriageQueue(patients: PatientRecord[]): PatientRecord[] {
  return [...patients]
    .filter((p) => !p.dead && (p.status === 'dying' || p.status === 'critical' || p.status === 'strained'))
    .sort((a, b) => {
      const pri = (p: PatientRecord) => (p.priority ?? 4);
      if (pri(a) !== pri(b)) return pri(a) - pri(b);
      return b.mortalityRisk - a.mortalityRisk;
    });
}

export function optimizeCriticalAssignments(
  patients: PatientRecord[],
  participants: GameState['participants'],
): void {
  const available = participants.filter((p) => p.active && p.le > 20 && !p.assignedPatientId);
  const critical = buildTriageQueue(patients).slice(0, available.length);
  for (let i = 0; i < critical.length && i < available.length; i++) {
    const patient = critical[i];
    const helper = available[i];
    if (patient.allocations.some((a) => a.participantId === helper.id)) continue;
    patient.allocations.push({
      participantId: helper.id,
      vector: patient.painLoad > 60 ? 'inflammatory' : 'systemic',
      weight: 100,
    });
    helper.assignedPatientId = patient.id;
  }
}
