import { ARENA_H, ARENA_W } from '../arena/constants';

export const CHUNK_SIZE = 32;
export const TILE_PX = 16;

export type TileKind = 'void' | 'floor' | 'wall' | 'shrine' | 'altar';

export interface WorldTile {
  kind: TileKind;
  variant: number;
}

export interface Shrine {
  id: number;
  x: number;
  y: number;
  discovered: boolean;
  reward: 'capacity' | 'heal' | 'shard';
}

export interface WorldState {
  cols: number;
  rows: number;
  tiles: WorldTile[];
  shrines: Shrine[];
  expansionWave: number;
}

function idx(c: number, r: number, cols: number): number {
  return r * cols + c;
}

function hash(x: number, y: number, seed: number): number {
  let h = seed + x * 374761393 + y * 668265263;
  h = (h ^ (h >> 13)) * 1274126177;
  return (h ^ (h >> 16)) >>> 0;
}

export function createWorld(): WorldState {
  const cols = Math.ceil(ARENA_W / TILE_PX);
  const rows = Math.ceil(ARENA_H / TILE_PX);
  const tiles: WorldTile[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const edge = c < 2 || r < 2 || c >= cols - 2 || r >= rows - 2;
      tiles.push({
        kind: edge ? 'wall' : 'floor',
        variant: hash(c, r, 42) % 4,
      });
    }
  }
  return { cols, rows, tiles, shrines: [], expansionWave: 0 };
}

export function expandWorld(world: WorldState, wave: number): void {
  if (wave <= world.expansionWave) return;
  world.expansionWave = wave;

  const pad = 1 + Math.floor(wave / 3);
  for (let r = pad; r < world.rows - pad; r++) {
    for (let c = pad; c < world.cols - pad; c++) {
      const i = idx(c, r, world.cols);
      if (world.tiles[i].kind === 'wall' && hash(c, r, wave * 97) % 5 === 0) {
        world.tiles[i] = { kind: 'floor', variant: hash(c, r, wave) % 6 };
      }
    }
  }

  if (wave % 4 === 0) {
    const cx = 4 + (hash(wave, 1, 13) % (world.cols - 8));
    const cy = 4 + (hash(wave, 2, 17) % (world.rows - 8));
    const rewards: Shrine['reward'][] = ['capacity', 'heal', 'shard'];
    world.shrines.push({
      id: wave * 100 + world.shrines.length,
      x: cx * TILE_PX + 8,
      y: cy * TILE_PX + 8,
      discovered: false,
      reward: rewards[hash(cx, cy, wave) % 3],
    });
    const ti = idx(cx, cy, world.cols);
    if (world.tiles[ti]) world.tiles[ti] = { kind: 'shrine', variant: 0 };
  }
}

export function tileAt(world: WorldState, px: number, py: number): WorldTile | null {
  const c = Math.floor(px / TILE_PX);
  const r = Math.floor(py / TILE_PX);
  if (c < 0 || r < 0 || c >= world.cols || r >= world.rows) return null;
  return world.tiles[idx(c, r, world.cols)];
}

export function floorTileVariant(c: number, r: number): number {
  return hash(c, r, 7) % 4;
}
