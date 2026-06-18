import type { Structure, StructureType } from '../arena/types';

export const STRUCTURE_DEFS: Record<
  StructureType,
  { name: string; desc: string; cost: number; color: string; key: string }
> = {
  pain_relay: {
    name: 'Pain Relay',
    desc: 'Routes 12% of ambient burden to nearest minion.',
    cost: 35,
    color: '#a78bfa',
    key: 'Q',
  },
  sink_tower: {
    name: 'Sink Tower',
    desc: 'Passive burden drain in a 80px radius.',
    cost: 50,
    color: '#34d399',
    key: 'R',
  },
  fuse_shrine: {
    name: 'Fuse Shrine',
    desc: 'Mini meld altar — fuse once per shrine.',
    cost: 70,
    color: '#c77dff',
    key: 'T',
  },
};

export function createStructure(type: StructureType, x: number, y: number, id: number): Structure {
  return {
    id,
    type,
    x,
    y,
    hp: 100,
    maxHp: 100,
    active: true,
    fuseUsed: false,
  };
}

export const STRUCTURE_CYCLE: StructureType[] = ['pain_relay', 'sink_tower', 'fuse_shrine'];
