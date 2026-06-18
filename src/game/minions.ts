import type { ParticipantState } from './State';
import type { PainVector } from './constants';

export type MinionType = 'shade' | 'beacon' | 'anchor' | 'relay' | 'pulse';

export const MINION_TYPES: Record<
  MinionType,
  { label: string; role: string; color: string; initial: string; match: Partial<Record<PainVector, number>> }
> = {
  shade: { label: 'Shade Unit', role: 'Absorbs inflammatory load', color: '#00D4AA', initial: 'S', match: { inflammatory: 82, systemic: 55 } },
  beacon: { label: 'Beacon Drone', role: 'Systemic fatigue sink', color: '#7B61FF', initial: 'B', match: { inflammatory: 52, systemic: 78 } },
  anchor: { label: 'Anchor Node', role: 'Balanced burden carrier', color: '#FFB020', initial: 'A', match: { inflammatory: 68, systemic: 68 } },
  relay: { label: 'Relay Swarm', role: 'Fast reassignment mesh', color: '#00FF88', initial: 'R', match: { inflammatory: 60, systemic: 72 } },
  pulse: { label: 'Pulse Core', role: 'Burst relief capacitor', color: '#FF4D6A', initial: 'P', match: { inflammatory: 75, systemic: 62 } },
};

const TYPE_ORDER: MinionType[] = ['shade', 'beacon', 'anchor', 'relay', 'pulse'];

export function getMinionMatch(minionId: string, vector: PainVector): number {
  const type = minionId.split('-')[1] as MinionType | undefined;
  if (type && MINION_TYPES[type]) {
    return MINION_TYPES[type].match[vector] ?? 55;
  }
  return 55;
}

export function createMinionPool(size: number): ParticipantState[] {
  return Array.from({ length: size }, (_, i) => {
    const type = TYPE_ORDER[i % TYPE_ORDER.length];
    const def = MINION_TYPES[type];
    return {
      id: `minion-${type}-${i}`,
      name: `${def.label} #${i + 1}`,
      role: def.role,
      isaaId: `MN-${type.toUpperCase()}-${String(i + 1).padStart(4, '0')}`,
      le: 65 + Math.random() * 30,
      maxFraction: 0.35,
      active: true,
      initial: def.initial,
      color: def.color,
      assignedPatientId: null,
    };
  });
}
