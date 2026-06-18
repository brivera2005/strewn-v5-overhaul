import type { PatientRecord } from './State';

export const TILE_SIZE = 32;

export type TileType = 'grass' | 'path' | 'wall' | 'water' | 'floor' | 'door' | 'bed' | 'tree';

export interface ZoneTransition {
  x: number;
  y: number;
  targetZone: string;
  targetX: number;
  targetY: number;
  label: string;
  requiresUnlock?: string;
}

export interface MapNpc {
  id: string;
  name: string;
  x: number;
  y: number;
  color: string;
  sprite: 'person' | 'patient' | 'family' | 'minion';
  patientId?: string;
  dialogue: string[];
  isTutorial?: boolean;
  wander?: boolean;
}

export interface ZoneDefinition {
  id: string;
  name: string;
  width: number;
  height: number;
  tiles: TileType[][];
  npcs: MapNpc[];
  transitions: ZoneTransition[];
  spawn: { x: number; y: number };
  bgColor: string;
}

const W = (cols: number, rows: number, fill: TileType): TileType[][] =>
  Array.from({ length: rows }, () => Array.from({ length: cols }, () => fill));

function border(w: number, h: number, inner: TileType, edge: TileType = 'wall'): TileType[][] {
  const grid = W(w, h, inner);
  for (let x = 0; x < w; x++) {
    grid[0][x] = edge;
    grid[h - 1][x] = edge;
  }
  for (let y = 0; y < h; y++) {
    grid[y][0] = edge;
    grid[y][w - 1] = edge;
  }
  return grid;
}

function homeTiles(): TileType[][] {
  const g = border(16, 12, 'floor');
  for (let x = 2; x < 14; x++) g[10][x] = 'path';
  for (let y = 3; y < 9; y++) g[y][7] = 'path';
  g[5][4] = 'bed';
  g[5][5] = 'bed';
  g[8][10] = 'door';
  g[8][11] = 'door';
  return g;
}

function streetTiles(): TileType[][] {
  const g = border(20, 14, 'grass');
  for (let x = 1; x < 19; x++) {
    g[6][x] = 'path';
    g[7][x] = 'path';
  }
  for (let y = 1; y < 13; y++) {
    g[y][9] = 'path';
    g[y][10] = 'path';
  }
  g[3][5] = 'tree';
  g[3][14] = 'tree';
  g[10][4] = 'tree';
  g[11][15] = 'tree';
  g[7][1] = 'door';
  g[7][18] = 'door';
  return g;
}

function wardTiles(): TileType[][] {
  const g = border(18, 14, 'floor');
  for (let x = 2; x < 16; x++) {
    g[3][x] = 'path';
    g[10][x] = 'path';
  }
  for (let y = 2; y < 12; y++) {
    g[y][5] = 'path';
    g[y][12] = 'path';
  }
  g[2][8] = 'bed';
  g[2][9] = 'bed';
  g[2][10] = 'bed';
  g[5][8] = 'bed';
  g[5][9] = 'bed';
  g[8][8] = 'bed';
  g[8][9] = 'bed';
  g[8][10] = 'bed';
  g[11][8] = 'door';
  return g;
}

export const ZONES: Record<string, ZoneDefinition> = {
  home: {
    id: 'home',
    name: 'Mitchell Home',
    width: 16,
    height: 12,
    tiles: homeTiles(),
    bgColor: '#1a2438',
    spawn: { x: 7, y: 9 },
    npcs: [
      {
        id: 'npc-sarah',
        name: 'Sarah',
        x: 4,
        y: 6,
        color: '#00D4AA',
        sprite: 'family',
        dialogue: [
          'Sarah looks exhausted but steady.',
          'I know inflammatory care. Point me at the fever channel.',
        ],
        isTutorial: true,
      },
      {
        id: 'npc-ethan',
        name: 'Ethan',
        x: 5,
        y: 4,
        color: '#FF4D6A',
        sprite: 'patient',
        patientId: 'tutorial-ethan',
        dialogue: [
          'Ethan shivers under thin blankets.',
          'It hurts everywhere. The fever won\'t break.',
        ],
        isTutorial: true,
      },
      {
        id: 'npc-mike',
        name: 'Mike',
        x: 9,
        y: 6,
        color: '#7B61FF',
        sprite: 'family',
        dialogue: [
          'Mike grips the chair arm.',
          'Tell me where to stand. I can take systemic drain.',
        ],
      },
    ],
    transitions: [
      { x: 10, y: 8, targetZone: 'streets', targetX: 2, targetY: 7, label: 'Leave home' },
    ],
  },
  streets: {
    id: 'streets',
    name: 'Denver Streets',
    width: 20,
    height: 14,
    tiles: streetTiles(),
    bgColor: '#0f1a12',
    spawn: { x: 2, y: 7 },
    npcs: [],
    transitions: [
      { x: 1, y: 7, targetZone: 'home', targetX: 9, targetY: 8, label: 'Go home' },
      {
        x: 18,
        y: 7,
        targetZone: 'ward',
        targetX: 8,
        targetY: 11,
        label: 'Enter hospital',
        requiresUnlock: 'ward',
      },
    ],
  },
  ward: {
    id: 'ward',
    name: 'Hospital Ward',
    width: 18,
    height: 14,
    tiles: wardTiles(),
    bgColor: '#141b2d',
    spawn: { x: 8, y: 11 },
    npcs: [],
    transitions: [
      { x: 8, y: 11, targetZone: 'streets', targetX: 17, targetY: 7, label: 'Exit to streets' },
    ],
  },
};

export const DEFAULT_OVERWORLD = {
  zoneId: 'home',
  playerX: 7,
  playerY: 9,
  facing: 'up' as const,
  tutorialStep: 'walk_sarah' as const,
  unlockedZones: ['home', 'streets'],
  showCommandMenu: false,
};

export function isWalkable(tile: TileType): boolean {
  return tile !== 'wall' && tile !== 'water' && tile !== 'tree';
}

export function getZone(id: string): ZoneDefinition {
  return ZONES[id] ?? ZONES.home;
}

export function npcAtPosition(zone: ZoneDefinition, x: number, y: number, extraNpcs: MapNpc[] = []): MapNpc | null {
  const all = [...zone.npcs, ...extraNpcs];
  return all.find((n) => n.x === x && n.y === y) ?? null;
}

export function transitionAt(zone: ZoneDefinition, x: number, y: number): ZoneTransition | null {
  return zone.transitions.find((t) => t.x === x && t.y === y) ?? null;
}

export function patientDialogue(patient: PatientRecord): string[] {
  const pain = Math.round(patient.painLoad);
  const statusLine =
    patient.status === 'critical' || patient.status === 'dying'
      ? 'They are barely holding on.'
      : patient.status === 'strained'
        ? 'Pain radiates with every breath.'
        : 'They wince but manage a nod.';
  return [
    `${patient.name} · ${patient.disease}`,
    `${statusLine} Pain load: ${pain}. Ward ${patient.ward}.`,
  ];
}

export function spawnWandererNpcs(patients: PatientRecord[], zoneId: string): MapNpc[] {
  const hurt = patients.filter(
    (p) => !p.dead && p.status !== 'stable' && p.status !== 'endured' && p.status !== 'strewn-active',
  );
  const zone = getZone(zoneId);
  const walkable: { x: number; y: number }[] = [];
  for (let y = 1; y < zone.height - 1; y++) {
    for (let x = 1; x < zone.width - 1; x++) {
      if (!isWalkable(zone.tiles[y][x])) continue;
      if (zone.npcs.some((n) => n.x === x && n.y === y)) continue;
      if (x === zone.spawn.x && y === zone.spawn.y) continue;
      walkable.push({ x, y });
    }
  }
  return hurt.slice(0, 6).map((p, i) => {
    const spot = walkable[(i * 7 + p.id.length) % Math.max(1, walkable.length)] ?? { x: 3, y: 3 };
    return {
      id: `wander-${p.id}`,
      name: p.name.split(' ')[0],
      x: spot.x,
      y: spot.y,
      color: p.status === 'dying' ? '#ff2244' : p.status === 'critical' ? '#ffb020' : '#ff4d6a',
      sprite: 'patient' as const,
      patientId: p.id,
      dialogue: patientDialogue(p),
      wander: true,
    };
  });
}

export function unlockZoneForRank(rank: number): string[] {
  const zones = ['home', 'streets'];
  if (rank >= 2) zones.push('ward');
  return zones;
}
