import type { ArenaState, Enemy, PainType, SinkNode } from '../arena/types';
import { PAIN_COLORS } from './ecology';

export const SINK_CAPACITY = 120;
export const MAX_SINKS_BASE = 2;
export const PAIN_FLOW_RATE = 22;

export function dist(ax: number, ay: number, bx: number, by: number): number {
  const dx = bx - ax;
  const dy = by - ay;
  return Math.sqrt(dx * dx + dy * dy);
}

export function nextSinkType(state: ArenaState): PainType {
  const types: PainType[] = ['grief', 'rage', 'dread', 'hollow'];
  return types[state.sinks.length % types.length];
}

export function canPlaceSink(state: ArenaState, maxSinks: number): boolean {
  return state.sinks.length < maxSinks;
}

export function placeSink(state: ArenaState, x: number, y: number, nextId: () => number): SinkNode | null {
  if (!canPlaceSink(state, state.maxSinks)) return null;
  const node: SinkNode = {
    id: nextId(),
    x,
    y,
    painType: nextSinkType(state),
    stored: 0,
    maxStored: SINK_CAPACITY,
  };
  state.sinks.push(node);
  return node;
}

function pickSink(sinks: SinkNode[], painType: PainType, px: number, py: number): SinkNode | null {
  if (sinks.length === 0) return null;
  let best: SinkNode | null = null;
  let bestScore = -Infinity;
  for (const s of sinks) {
    const d = dist(px, py, s.x, s.y);
    const match = s.painType === painType ? 1.4 : 0.6;
    const room = 1 - s.stored / s.maxStored;
    const score = match * room * 200 - d;
    if (score > bestScore) {
      bestScore = score;
      best = s;
    }
  }
  return best;
}

export interface BezierPath {
  enemyId: number;
  sinkId: number;
  painType: PainType;
  flow: number;
  cx: number;
  cy: number;
}

export function updatePainNetwork(
  state: ArenaState,
  dt: number,
  addBurden: (amount: number, type: PainType, multiplier: number) => void,
): void {
  state.painRoutes = [];

  for (const enemy of state.enemies) {
    if (!enemy.lashed || enemy.spawnTelegraph > 0) continue;
    const sink = pickSink(state.sinks, enemy.painType, state.player.x, state.player.y);
    if (!sink) continue;

    const flow = PAIN_FLOW_RATE * dt * (0.5 + (enemy.lashIntensity ?? 1));
    const mismatch = sink.painType !== enemy.painType;
    const routerBonus = Math.max(0.4, 1 - dist(enemy.x, enemy.y, state.player.x, state.player.y) / 400);

    enemy.painBuffered = Math.max(0, (enemy.painBuffered ?? 0) - flow);
    if ((enemy.painBuffered ?? 0) <= 0) {
      enemy.lashed = false;
      continue;
    }

    const routed = flow * routerBonus;
    sink.stored = Math.min(sink.maxStored, sink.stored + routed);
    state.painRouted += routed;

    const cx = (enemy.x + state.player.x + sink.x) / 3;
    const cy = (enemy.y + state.player.y + sink.y) / 3 - 40;
    state.painRoutes.push({
      enemyId: enemy.id,
      sinkId: sink.id,
      painType: enemy.painType,
      flow: routed,
      cx,
      cy,
    });

    if (mismatch) {
      addBurden(flow * 0.35, enemy.painType, 2);
    } else {
      addBurden(flow * 0.08, enemy.painType, 1);
    }
  }

  for (const sink of state.sinks) {
    sink.stored = Math.max(0, sink.stored - 18 * dt);
  }
}

export function markLashed(enemy: Enemy, damage: number): void {
  enemy.lashed = true;
  enemy.lashIntensity = Math.min(2, (enemy.lashIntensity ?? 0) + 0.35);
  enemy.painBuffered = Math.min(80, (enemy.painBuffered ?? 0) + damage * 0.8 + 12);
  enemy.hitFlash = 0.12;
}

export function drawPainRoute(
  ctx: CanvasRenderingContext2D,
  ex: number,
  ey: number,
  px: number,
  py: number,
  sx: number,
  sy: number,
  cx: number,
  cy: number,
  color: string,
  pulse: number,
): void {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2 + pulse * 2;
  ctx.globalAlpha = 0.35 + pulse * 0.35;
  ctx.shadowColor = color;
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.moveTo(ex, ey);
  ctx.quadraticCurveTo(cx, cy, px, py);
  ctx.lineTo(sx, sy);
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;
}

export function painRouteColor(type: PainType): string {
  return PAIN_COLORS[type];
}
