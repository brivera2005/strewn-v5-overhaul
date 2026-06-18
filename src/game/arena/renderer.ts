import {
  ARENA_H,
  ARENA_W,
  COLORS,
  PLAYER_RADIUS,
} from './constants';
import { CHARM_DEFS } from './charms';
import type { ArenaState, Enemy } from './types';
import { PAIN_COLORS } from '../burden/ecology';
import { TILE_PX, type WorldState } from '../burden/world';
import { getAtlas, drawTile, drawSheetFrame } from '../burden/assets';

function burdenColor(ratio: number): string {
  if (ratio < 0.5) return COLORS.burdenLow;
  if (ratio < 0.85) return COLORS.burdenMid;
  return COLORS.burdenHigh;
}

function renderWorldTiles(ctx: CanvasRenderingContext2D, world: WorldState, time: number): void {
  const atlas = getAtlas();
  const cols = world.cols;
  const rows = world.rows;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const tile = world.tiles[r * cols + c];
      const px = c * TILE_PX;
      const py = r * TILE_PX;

      if (atlas?.ready) {
        if (tile.kind === 'wall') {
          drawTile(ctx, atlas.tilemap, 1, 0, px, py);
        } else if (tile.kind === 'shrine') {
          drawTile(ctx, atlas.tilemap, 4, 2, px, py);
          ctx.globalAlpha = 0.5 + Math.sin(time * 3) * 0.3;
          drawTile(ctx, atlas.tilemap, 5, 2, px, py);
          ctx.globalAlpha = 1;
        } else {
          const v = tile.variant;
          drawTile(ctx, atlas.tilemap, v % 4, 4 + Math.floor(v / 4), px, py);
        }
      } else {
        ctx.fillStyle = tile.kind === 'wall' ? '#2a2440' : '#1a1628';
        ctx.fillRect(px, py, TILE_PX, TILE_PX);
      }
    }
  }
}

function renderEnemy(ctx: CanvasRenderingContext2D, enemy: Enemy, time: number): void {
  const atlas = getAtlas();
  const flash = enemy.hitFlash > 0;
  const frame = Math.floor(time * 8) % 4;

  if (enemy.spawnTelegraph > 0) {
    ctx.globalAlpha = 0.4 + Math.sin(time * 12) * 0.3;
    ctx.strokeStyle = PAIN_COLORS[enemy.painType];
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y, enemy.size + 8, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
    return;
  }

  if (atlas?.ready) {
    const sheets: Record<Enemy['type'], HTMLImageElement> = {
      wretch: atlas.enemyWretch,
      howler: atlas.enemyHowler,
      anchor: atlas.enemyAnchor,
      boss: atlas.enemyBoss,
    };
    const sheet = sheets[enemy.type];
    const fw = Math.floor(sheet.width / 4) || 32;
    const fh = sheet.height || 32;
    const scale = (enemy.size * 2.2) / fh;
    if (flash) ctx.filter = 'brightness(2)';
    drawSheetFrame(ctx, sheet, frame, fw, fh, enemy.x - fw * scale / 2, enemy.y - fh * scale / 2, scale);
    ctx.filter = 'none';
  } else {
    ctx.fillStyle = flash ? '#fff' : PAIN_COLORS[enemy.painType];
    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y, enemy.size, 0, Math.PI * 2);
    ctx.fill();
  }

  const hpRatio = enemy.hp / enemy.maxHp;
  ctx.fillStyle = '#1a1228';
  ctx.fillRect(enemy.x - 14, enemy.y - enemy.size - 10, 28, 4);
  ctx.fillStyle = hpRatio > 0.3 ? '#4ade80' : '#ef4444';
  ctx.fillRect(enemy.x - 14, enemy.y - enemy.size - 10, 28 * hpRatio, 4);
}

export function renderArena(
  ctx: CanvasRenderingContext2D,
  state: ArenaState,
  scale: number,
  offsetX: number,
  offsetY: number,
  crtScanlines = false,
): void {
  const shakeX = state.shake > 0 ? (Math.random() - 0.5) * state.shake * 14 : 0;
  const shakeY = state.shake > 0 ? (Math.random() - 0.5) * state.shake * 14 : 0;

  ctx.save();
  ctx.setTransform(scale, 0, 0, scale, offsetX + shakeX, offsetY + shakeY);

  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, ARENA_W, ARENA_H);

  renderWorldTiles(ctx, state.world, state.time);

  for (const shrine of state.world.shrines) {
    if (!shrine.discovered) {
      const pulse = 0.6 + Math.sin(state.time * 4 + shrine.id) * 0.4;
      ctx.globalAlpha = pulse;
      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.arc(shrine.x, shrine.y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  for (const s of state.structures) {
    const colors = { pain_relay: '#a78bfa', sink_tower: '#34d399', fuse_shrine: '#c77dff' };
    ctx.fillStyle = colors[s.type];
    ctx.fillRect(s.x - 10, s.y - 10, 20, 20);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.strokeRect(s.x - 10, s.y - 10, 20, 20);
  }

  if (state.altarActive) {
    const pulse = 0.5 + Math.sin(state.time * 4) * 0.3;
    const atlas = getAtlas();
    if (atlas?.ready) {
      ctx.globalAlpha = pulse;
      drawTile(ctx, atlas.tilemap, 6, 2, ARENA_W / 2 - 48, ARENA_H / 2 - 48, 3);
      ctx.globalAlpha = 1;
    } else {
      ctx.strokeStyle = COLORS.altar;
      ctx.lineWidth = 3;
      ctx.globalAlpha = pulse;
      ctx.strokeRect(ARENA_W / 2 - 60, ARENA_H / 2 - 60, 120, 120);
      ctx.globalAlpha = 1;
    }
    ctx.fillStyle = COLORS.altar;
    ctx.font = '9px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('MELD ALTAR', ARENA_W / 2, ARENA_H / 2 - 72);
  }

  const atlas = getAtlas();
  for (const pick of state.pickups) {
    if (atlas?.ready) {
      if (pick.kind === 'xp') {
        const fw = 16;
        drawSheetFrame(ctx, atlas.xpGem, Math.floor(state.time * 10) % 6, fw, 16, pick.x - 8, pick.y - 8, 1);
      } else {
        drawSheetFrame(ctx, atlas.shard, 0, atlas.shard.width, atlas.shard.height, pick.x - 8, pick.y - 8, 0.8);
      }
    } else {
      ctx.fillStyle = pick.kind === 'xp' ? COLORS.xp : COLORS.shard;
      ctx.beginPath();
      ctx.arc(pick.x, pick.y, 5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  for (const part of state.particles) {
    ctx.globalAlpha = part.life / part.maxLife;
    if (part.sprite && atlas?.ready) {
      drawSheetFrame(ctx, atlas.xpGem, 0, 16, 16, part.x - part.size, part.y - part.size, part.size / 8);
    } else {
      ctx.fillStyle = part.color;
      ctx.beginPath();
      ctx.arc(part.x, part.y, part.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  for (const p of state.projectiles) {
    ctx.fillStyle = p.color;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  for (const enemy of state.enemies) renderEnemy(ctx, enemy, state.time);

  for (const m of state.minions) {
    if (atlas?.ready) {
      const fw = Math.floor(atlas.minion.width / 4) || 32;
      drawSheetFrame(ctx, atlas.minion, Math.floor(state.time * 6) % 4, fw, atlas.minion.height, m.x - fw / 2, m.y - atlas.minion.height / 2, 0.6);
    } else {
      ctx.fillStyle = COLORS.minion;
      ctx.fillRect(m.x - 8, m.y - 8, 16, 16);
    }
    const cap = m.burdenHeld / m.capacity;
    ctx.fillStyle = '#1a1228';
    ctx.fillRect(m.x - 10, m.y + 12, 20, 3);
    ctx.fillStyle = burdenColor(cap);
    ctx.fillRect(m.x - 10, m.y + 12, 20 * cap, 3);
  }

  const burdenRatio = state.burden.current / state.burden.max;
  const atlas2 = getAtlas();
  if (atlas2?.ready) {
    const fw = Math.floor(atlas2.player.width / 4) || 32;
    const fh = atlas2.player.height || 32;
    const moving = Math.abs(state.player.vx) + Math.abs(state.player.vy) > 20;
    const frame = moving ? Math.floor(state.time * 10) % 4 : 0;
    if (state.player.invuln > 0) ctx.filter = 'brightness(2)';
    drawSheetFrame(ctx, atlas2.player, frame, fw, fh, state.player.x - fw / 2, state.player.y - fh / 2, 0.9, state.player.facing < 0);
    ctx.filter = 'none';
  } else {
    ctx.fillStyle = state.player.invuln > 0 ? '#fff' : burdenRatio > 0.85 ? COLORS.playerHurt : COLORS.player;
    ctx.beginPath();
    ctx.arc(state.player.x, state.player.y, PLAYER_RADIUS, 0, Math.PI * 2);
    ctx.fill();
  }

  if (burdenRatio > 0.7 || state.burden.overflowPulse > 0) {
    const glow = burdenRatio > 0.85 ? 10 + state.burden.overflowPulse * 12 : 6;
    ctx.strokeStyle = burdenColor(burdenRatio);
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.5 + Math.sin(state.time * 6) * 0.3;
    ctx.beginPath();
    ctx.arc(state.player.x, state.player.y, PLAYER_RADIUS + glow, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  for (const ft of state.floatingTexts) {
    ctx.globalAlpha = Math.min(1, ft.life);
    ctx.fillStyle = ft.color;
    const sz = 8 * (ft.scale ?? 1);
    ctx.font = `${sz}px "Press Start 2P", monospace`;
    ctx.textAlign = 'center';
    ctx.fillText(ft.text, ft.x, ft.y);
    ctx.globalAlpha = 1;
  }

  ctx.restore();

  if (crtScanlines) {
    ctx.save();
    ctx.globalAlpha = 0.06;
    ctx.fillStyle = '#000';
    for (let y = 0; y < ctx.canvas.height; y += 3) {
      ctx.fillRect(0, y, ctx.canvas.width, 1);
    }
    ctx.restore();
  }
}

export function renderHudBars(ctx: CanvasRenderingContext2D, state: ArenaState, canvasW: number): void {
  const pad = 16;
  const barW = 220;
  const hpRatio = state.player.hp / state.player.maxHp;
  const burdenRatio = state.burden.current / state.burden.max;
  const xpRatio = state.player.xp / state.player.xpToNext;
  const pulse = state.burden.overflowPulse > 0 ? 1 + Math.sin(state.time * 10) * 0.15 : 1;

  ctx.fillStyle = '#0d0a18';
  ctx.fillRect(pad - 4, pad - 8, barW + 8, 62);
  ctx.strokeStyle = '#2a2440';
  ctx.lineWidth = 1;
  ctx.strokeRect(pad - 4, pad - 8, barW + 8, 62);

  ctx.fillStyle = '#1a1228';
  ctx.fillRect(pad, pad, barW, 12);
  ctx.fillStyle = hpRatio > 0.3 ? '#00ff88' : '#ff2244';
  ctx.fillRect(pad, pad, barW * hpRatio, 12);
  ctx.strokeStyle = '#333';
  ctx.strokeRect(pad, pad, barW, 12);
  ctx.fillStyle = COLORS.textDim;
  ctx.font = '7px "Press Start 2P", monospace';
  ctx.textAlign = 'left';
  ctx.fillText('HP', pad, pad - 3);

  ctx.fillStyle = '#1a1228';
  ctx.fillRect(pad, pad + 18, barW, 14);
  const pain = state.burden.pain;
  const total = pain.grief + pain.rage + pain.dread + pain.hollow || 1;
  let ox = pad;
  const layers: [keyof typeof pain, string][] = [
    ['grief', PAIN_COLORS.grief],
    ['rage', PAIN_COLORS.rage],
    ['dread', PAIN_COLORS.dread],
    ['hollow', PAIN_COLORS.hollow],
  ];
  for (const [key, col] of layers) {
    const w = (pain[key] / total) * barW * burdenRatio;
    if (w > 0) {
      ctx.fillStyle = col;
      ctx.fillRect(ox, pad + 18, w, 14);
      ox += w;
    }
  }
  if (burdenRatio > 0.85) {
    ctx.strokeStyle = `rgba(255,34,68,${0.5 + Math.sin(state.time * 8) * 0.5})`;
    ctx.lineWidth = 2 * pulse;
    ctx.strokeRect(pad - 1, pad + 17, barW + 2, 16);
  }
  ctx.strokeRect(pad, pad + 18, barW, 14);
  ctx.fillText('BURDEN', pad, pad + 14);

  ctx.fillStyle = '#1a1228';
  ctx.fillRect(pad, pad + 38, barW, 8);
  ctx.fillStyle = COLORS.xp;
  ctx.fillRect(pad, pad + 38, barW * xpRatio, 8);
  ctx.strokeRect(pad, pad + 38, barW, 8);

  ctx.textAlign = 'right';
  ctx.fillStyle = COLORS.text;
  ctx.font = '8px "Press Start 2P", monospace';
  ctx.fillText(`WAVE ${state.wave}`, canvasW - pad, pad + 10);
  ctx.fillStyle = COLORS.textDim;
  ctx.fillText(`${Math.floor(state.time)}s`, canvasW - pad, pad + 26);
  ctx.fillText(`KILLS ${state.kills}`, canvasW - pad, pad + 42);
  ctx.fillText(`LV ${state.player.level}`, canvasW - pad, pad + 58);

  if (state.charms.length > 0) {
    state.charms.slice(0, 10).forEach((c, i) => {
      const def = CHARM_DEFS[c.id];
      ctx.fillStyle = def.color;
      ctx.fillRect(pad + i * 20, pad + 52, 16, 16);
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 1;
      ctx.strokeRect(pad + i * 20, pad + 52, 16, 16);
      ctx.fillStyle = '#000';
      ctx.font = '6px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(String(c.level), pad + i * 20 + 8, pad + 63);
    });
  }
}
