import {
  ARENA_H,
  ARENA_W,
  COLORS,
  PLAYER_RADIUS,
} from './constants';
import { CHARM_DEFS } from './charms';
import type { ArenaState } from './types';

function burdenColor(ratio: number): string {
  if (ratio < 0.5) return COLORS.burdenLow;
  if (ratio < 0.85) return COLORS.burdenMid;
  return COLORS.burdenHigh;
}

export function renderArena(
  ctx: CanvasRenderingContext2D,
  state: ArenaState,
  scale: number,
  offsetX: number,
  offsetY: number,
): void {
  const shakeX = state.shake > 0 ? (Math.random() - 0.5) * state.shake * 12 : 0;
  const shakeY = state.shake > 0 ? (Math.random() - 0.5) * state.shake * 12 : 0;

  ctx.save();
  ctx.setTransform(scale, 0, 0, scale, offsetX + shakeX, offsetY + shakeY);

  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, ARENA_W, ARENA_H);

  ctx.fillStyle = COLORS.floor;
  ctx.fillRect(8, 8, ARENA_W - 16, ARENA_H - 16);

  ctx.strokeStyle = COLORS.grid;
  ctx.lineWidth = 1;
  for (let x = 0; x < ARENA_W; x += 32) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, ARENA_H);
    ctx.stroke();
  }
  for (let y = 0; y < ARENA_H; y += 32) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(ARENA_W, y);
    ctx.stroke();
  }

  if (state.altarActive) {
    const pulse = 0.5 + Math.sin(state.time * 4) * 0.3;
    ctx.strokeStyle = COLORS.altar;
    ctx.lineWidth = 3;
    ctx.globalAlpha = pulse;
    ctx.strokeRect(ARENA_W / 2 - 60, ARENA_H / 2 - 60, 120, 120);
    ctx.globalAlpha = 1;
    ctx.fillStyle = COLORS.altar;
    ctx.font = '10px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('MELD ALTAR', ARENA_W / 2, ARENA_H / 2 - 70);
  }

  for (const pick of state.pickups) {
    if (pick.kind === 'xp') {
      ctx.fillStyle = COLORS.xp;
      ctx.beginPath();
      ctx.arc(pick.x, pick.y, 5, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = COLORS.shard;
      ctx.fillRect(pick.x - 4, pick.y - 4, 8, 8);
    }
  }

  for (const part of state.particles) {
    ctx.globalAlpha = part.life / part.maxLife;
    ctx.fillStyle = part.color;
    ctx.fillRect(part.x - part.size / 2, part.y - part.size / 2, part.size, part.size);
    ctx.globalAlpha = 1;
  }

  for (const p of state.projectiles) {
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  for (const enemy of state.enemies) {
    const colors: Record<string, string> = {
      wretch: COLORS.enemyWretch,
      howler: COLORS.enemyHowler,
      anchor: COLORS.enemyAnchor,
      boss: COLORS.enemyBoss,
    };
    ctx.fillStyle = enemy.hitFlash > 0 ? '#fff' : colors[enemy.type];
    if (enemy.type === 'boss') {
      ctx.beginPath();
      ctx.moveTo(enemy.x, enemy.y - enemy.size);
      ctx.lineTo(enemy.x + enemy.size, enemy.y);
      ctx.lineTo(enemy.x, enemy.y + enemy.size);
      ctx.lineTo(enemy.x - enemy.size, enemy.y);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.arc(enemy.x, enemy.y, enemy.size, 0, Math.PI * 2);
      ctx.fill();
    }
    const hpRatio = enemy.hp / enemy.maxHp;
    ctx.fillStyle = '#333';
    ctx.fillRect(enemy.x - 14, enemy.y - enemy.size - 8, 28, 4);
    ctx.fillStyle = hpRatio > 0.3 ? '#4ade80' : '#ef4444';
    ctx.fillRect(enemy.x - 14, enemy.y - enemy.size - 8, 28 * hpRatio, 4);
  }

  for (const m of state.minions) {
    ctx.fillStyle = COLORS.minion;
    ctx.fillRect(m.x - 8, m.y - 8, 16, 16);
    const cap = m.burdenHeld / m.capacity;
    ctx.fillStyle = burdenColor(cap);
    ctx.fillRect(m.x - 8, m.y + 10, 16 * cap, 3);
  }

  const burdenRatio = state.burden.current / state.burden.max;
  const playerColor = state.player.invuln > 0 ? '#fff' : burdenRatio > 0.85 ? COLORS.playerHurt : COLORS.player;
  ctx.fillStyle = playerColor;
  ctx.beginPath();
  ctx.arc(state.player.x, state.player.y, PLAYER_RADIUS, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = burdenColor(burdenRatio);
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(state.player.x, state.player.y, PLAYER_RADIUS + 6 + burdenRatio * 8, 0, Math.PI * 2);
  ctx.stroke();

  for (const ft of state.floatingTexts) {
    ctx.globalAlpha = Math.min(1, ft.life);
    ctx.fillStyle = ft.color;
    ctx.font = '9px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(ft.text, ft.x, ft.y);
    ctx.globalAlpha = 1;
  }

  ctx.restore();
}

export function renderHudBars(
  ctx: CanvasRenderingContext2D,
  state: ArenaState,
  canvasW: number,
): void {
  const pad = 16;
  const barW = 200;
  const hpRatio = state.player.hp / state.player.maxHp;
  const burdenRatio = state.burden.current / state.burden.max;
  const xpRatio = state.player.xp / state.player.xpToNext;

  ctx.fillStyle = '#1a1228';
  ctx.fillRect(pad, pad, barW, 12);
  ctx.fillStyle = hpRatio > 0.3 ? '#00ff88' : '#ff2244';
  ctx.fillRect(pad, pad, barW * hpRatio, 12);
  ctx.strokeStyle = '#333';
  ctx.strokeRect(pad, pad, barW, 12);
  ctx.fillStyle = COLORS.textDim;
  ctx.font = '8px "Press Start 2P", monospace';
  ctx.textAlign = 'left';
  ctx.fillText('HP', pad, pad - 4);

  ctx.fillStyle = '#1a1228';
  ctx.fillRect(pad, pad + 20, barW, 12);
  ctx.fillStyle = burdenColor(burdenRatio);
  ctx.fillRect(pad, pad + 20, barW * burdenRatio, 12);
  ctx.strokeRect(pad, pad + 20, barW, 12);
  ctx.fillText('BURDEN', pad, pad + 16);

  ctx.fillStyle = '#1a1228';
  ctx.fillRect(pad, pad + 40, barW, 8);
  ctx.fillStyle = COLORS.xp;
  ctx.fillRect(pad, pad + 40, barW * xpRatio, 8);
  ctx.strokeRect(pad, pad + 40, barW, 8);

  ctx.textAlign = 'right';
  ctx.fillStyle = COLORS.text;
  ctx.fillText(`WAVE ${state.wave}`, canvasW - pad, pad + 10);
  ctx.fillStyle = COLORS.textDim;
  ctx.fillText(`${Math.floor(state.time)}s`, canvasW - pad, pad + 26);
  ctx.fillText(`KILLS ${state.kills}`, canvasW - pad, pad + 42);
  ctx.fillText(`LV ${state.player.level}`, canvasW - pad, pad + 58);

  if (state.charms.length > 0) {
    const charmY = canvasW > 600 ? pad + 70 : pad + 56;
    state.charms.slice(0, 8).forEach((c, i) => {
      const def = CHARM_DEFS[c.id];
      ctx.fillStyle = def.color;
      ctx.fillRect(pad + i * 22, charmY, 18, 18);
      ctx.fillStyle = '#000';
      ctx.font = '7px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(String(c.level), pad + i * 22 + 9, charmY + 12);
    });
  }
}
