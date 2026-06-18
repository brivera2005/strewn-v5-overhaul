import {
  ARENA_H,
  ARENA_W,
  BASE_BURDEN_MAX,
  BASE_PLAYER_HP,
  BASE_PLAYER_SPEED,
  BOSS_WAVE_INTERVAL,
  BURDEN_OVERFLOW_DPS,
  COLORS,
  PLAYER_RADIUS,
  REMNANT_DROP_CHANCE,
  RUN_DURATION,
  SHRINE_DURATION,
  SHRINE_INTERVAL,
  WAVE_DURATION,
  XP_GEM_VALUE,
  ACCEL,
  FRICTION,
  MAX_VELOCITY_MULT,
  LASH_COOLDOWN,
  VENT_COOLDOWN,
  VENT_COST,
  STRAIN_ECHO_WAVE,
} from './constants';
import {
  CHARM_DEFS,
  addOrUpgradeCharm,
  charmLevel,
  findMeld,
  pickLevelUpChoices,
} from './charms';
import type { MetaSave, MetaUpgrades, PainType } from './types';
import type { ArenaState, CharmId, Enemy, Pickup, RunStats } from './types';
import {
  ENEMY_PAIN,
  PAIN_COLORS,
  addPain,
  drainPain,
  emptyPainPool,
  miasmaSlow,
  wrathStormDamage,
  wrathStormReady,
} from '../strewn/ecology';
import { createWorld, expandWorld } from '../strewn/world';
import { TUTORIAL_STEPS } from '../strewn/tutorial';
import { markLashed, placeSink, updatePainNetwork } from '../strewn/painNetwork';

function nextId(state: ArenaState): number {
  const id = state.nextId;
  state.nextId += 1;
  return id;
}

function dist(ax: number, ay: number, bx: number, by: number): number {
  const dx = bx - ax;
  const dy = by - ay;
  return Math.sqrt(dx * dx + dy * dy);
}

function spawnParticle(
  state: ArenaState,
  x: number,
  y: number,
  color: string,
  count = 6,
  speed = 120,
  sprite = false,
): void {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const v = speed * (0.4 + Math.random() * 0.6);
    state.particles.push({
      id: nextId(state),
      x, y,
      vx: Math.cos(angle) * v,
      vy: Math.sin(angle) * v,
      life: 0.3 + Math.random() * 0.4,
      maxLife: 0.7,
      color,
      size: 2 + Math.random() * 4,
      sprite,
    });
  }
}

function floatText(state: ArenaState, x: number, y: number, text: string, color: string, scale = 1): void {
  state.floatingTexts.push({ id: nextId(state), x, y, text, life: 1.2, color, scale });
}

function effectiveBurdenMax(state: ArenaState, upgrades: MetaUpgrades): number {
  let max = BASE_BURDEN_MAX + upgrades.burdenCap * 25;
  max += charmLevel(state.charms, 'anchor') * 15;
  max += charmLevel(state.charms, 'burning_anchor') * 25;
  max += charmLevel(state.charms, 'grief_catalyst') * 20;
  max += charmLevel(state.charms, 'null_anchor') * 18;
  return max;
}

function addBurden(state: ArenaState, amount: number, upgrades: MetaUpgrades, painType: PainType = 'grief', mult = 1): void {
  const max = effectiveBurdenMax(state, upgrades);
  state.burden.max = max;
  const before = state.burden.current;
  const applied = amount * mult;
  state.burden.current = Math.min(max, state.burden.current + applied);
  addPain(state.burden.pain, painType, applied * 0.6);

  const relayLvl = charmLevel(state.charms, 'relay') + charmLevel(state.charms, 'ember_relay');
  if (relayLvl > 0) {
    state.burden.current = Math.max(0, state.burden.current - applied * 0.05 * relayLvl);
  }

  if (state.burden.current >= max * 0.95 && before < max * 0.95) {
    state.shake = 0.15;
    state.burden.overflowPulse = 1;
  }
  if (state.burden.current >= max * 0.5 && !state.tutorialSeen.has('burden_vent')) {
    triggerTutorial(state, 'burden_half');
  }
}

function drainBurden(state: ArenaState, amount: number): number {
  const drained = Math.min(state.burden.current, amount);
  state.burden.current -= drained;
  drainPain(state.burden.pain, drained * 0.5);
  return drained;
}

function triggerTutorial(state: ArenaState, trigger: string): void {
  const step = TUTORIAL_STEPS.find((s) => s.trigger === trigger && !state.tutorialSeen.has(s.id));
  if (step) state.tutorialStep = step.id;
}

export function createArenaState(meta: MetaSave, skipTutorial = meta.tutorialComplete): ArenaState {
  const u = meta.upgrades;
  const charms = u.startCharm ? [{ id: u.startCharm, level: 1 }] : [];
  return {
    player: {
      x: ARENA_W / 2, y: ARENA_H / 2, vx: 0, vy: 0,
      hp: BASE_PLAYER_HP + u.maxHp * 20,
      maxHp: BASE_PLAYER_HP + u.maxHp * 20,
      speed: BASE_PLAYER_SPEED * (1 + u.moveSpeed * 0.08),
      level: 1, xp: 0, xpToNext: 30, invuln: 0, facing: 1, aimAngle: 0,
    },
    burden: { current: 0, max: BASE_BURDEN_MAX + u.burdenCap * 25, pain: emptyPainPool(), overflowPulse: 0 },
    world: createWorld(),
    sinks: [],
    maxSinks: 2 + u.sinkSlots,
    painRoutes: [],
    strainEchoes: [],
    enemies: [], projectiles: [], pickups: [],
    particles: [], floatingTexts: [],
    charms,
    meldSlots: [null, null],
    wave: 1, waveTimer: 0, waveEnemiesLeft: 6,
    time: 0, kills: 0,
    shrineActive: false, shrineTimer: SHRINE_INTERVAL, nearShrine: false,
    lashCooldown: 0, ventCooldown: 0, ventPulse: 0,
    mouseX: ARENA_W / 2, mouseY: ARENA_H / 2,
    mouseDown: false, mouseRightDown: false,
    bossActive: false, shake: 0, hitStop: 0, nextId: 1,
    damageTaken: 0, burdenOverflows: 0, meldsFound: 0,
    shrinesFound: 0, sinksPlaced: 0, painRouted: 0,
    pendingLevelUp: false, levelUpChoices: [],
    dead: false, won: false,
    tutorialStep: skipTutorial ? null : 'move_lash',
    tutorialSeen: new Set(skipTutorial ? TUTORIAL_STEPS.map((s) => s.id) : []),
    wrathStormCd: 0,
    firstWaveSlow: true,
  };
}

function spawnEnemy(state: ArenaState, type: Enemy['type'] = 'wretch'): void {
  const edge = Math.floor(Math.random() * 4);
  let x = 0, y = 0;
  const pad = 40;
  if (edge === 0) { x = Math.random() * ARENA_W; y = -pad; }
  else if (edge === 1) { x = ARENA_W + pad; y = Math.random() * ARENA_H; }
  else if (edge === 2) { x = Math.random() * ARENA_W; y = ARENA_H + pad; }
  else { x = -pad; y = Math.random() * ARENA_H; }

  const waveScale = 1 + state.wave * 0.12;
  const configs: Record<Enemy['type'], Partial<Enemy>> = {
    wretch: { hp: 24, speed: 75, damage: 7, burdenEmit: 10, size: 12 },
    howler: { hp: 16, speed: 115, damage: 5, burdenEmit: 14, size: 10 },
    anchor: { hp: 50, speed: 42, damage: 11, burdenEmit: 20, size: 16 },
    boss: { hp: 380, speed: 50, damage: 18, burdenEmit: 35, size: 28 },
  };
  const cfg = configs[type];
  state.enemies.push({
    id: nextId(state), x, y,
    hp: (cfg.hp ?? 20) * waveScale,
    maxHp: (cfg.hp ?? 20) * waveScale,
    speed: cfg.speed ?? 70,
    damage: (cfg.damage ?? 8) * (1 + state.wave * 0.05),
    burdenEmit: (cfg.burdenEmit ?? 12) * (1 + state.wave * 0.08),
    type,
    painType: ENEMY_PAIN[type],
    hitFlash: 0,
    size: cfg.size ?? 12,
    spawnTelegraph: type === 'boss' ? 2 : 0.6,
    lashed: false,
    lashIntensity: 0,
    painBuffered: 0,
  });
}

function firePainLash(state: ArenaState, meta: MetaSave): void {
  if (state.lashCooldown > 0) return;
  const lashLvl = 1 + charmLevel(state.charms, 'lash') + charmLevel(state.charms, 'ember_lash');
  const dmg = 14 + lashLvl * 4 + state.player.level * 1.5;
  const angle = state.player.aimAngle;
  const pierce = charmLevel(state.charms, 'prism') > 0 ? 1 : 0;
  const color = PAIN_COLORS.grief;
  const speed = 480;
  state.projectiles.push({
    id: nextId(state),
    x: state.player.x + Math.cos(angle) * 18,
    y: state.player.y + Math.sin(angle) * 18,
    vx: (Math.cos(angle)) * speed,
    vy: (Math.sin(angle)) * speed,
    damage: dmg,
    life: 1.4,
    color,
    pierce,
  });
  state.lashCooldown = Math.max(0.12, LASH_COOLDOWN - lashLvl * 0.03);
  if (!state.tutorialSeen.has('move_lash')) triggerTutorial(state, 'first_lash');

  if (state.wave >= STRAIN_ECHO_WAVE) {
    state.strainEchoes.push({
      id: nextId(state),
      x: state.player.x,
      y: state.player.y,
      life: 0.35,
      angle,
    });
  }
  void meta;
}

function ventBurden(state: ArenaState, meta: MetaSave): void {
  if (state.ventCooldown > 0 || state.burden.current < VENT_COST * 0.3) return;
  const ventPower = 1 + meta.upgrades.ventPower * 0.2 + charmLevel(state.charms, 'pulse') * 0.15;
  const drained = drainBurden(state, VENT_COST * ventPower + state.burden.current * 0.25);
  const radius = 90 + drained * 0.4;
  const dmg = 25 * ventPower + drained * 0.35;
  for (const e of state.enemies) {
    if (dist(state.player.x, state.player.y, e.x, e.y) < radius + e.size) {
      e.hp -= dmg;
      e.hitFlash = 0.15;
      markLashed(e, dmg * 0.5);
    }
  }
  state.ventPulse = 1;
  state.shake = 0.35;
  state.hitStop = 0.06;
  state.ventCooldown = VENT_COOLDOWN;
  state.ventSfx = true;
  spawnParticle(state, state.player.x, state.player.y, '#ff4466', 28, 220, true);
  floatText(state, state.player.x, state.player.y - 24, `VENT -${Math.floor(drained)}`, '#ff6688', 1.1);
}

export function tryPlaceSink(state: ArenaState): boolean {
  if (state.sinks.length >= state.maxSinks) return false;
  const node = placeSink(state, state.mouseX, state.mouseY, () => nextId(state));
  if (!node) return false;
  state.sinksPlaced += 1;
  spawnParticle(state, node.x, node.y, PAIN_COLORS[node.painType], 16, 100, true);
  floatText(state, node.x, node.y - 16, `${node.painType.toUpperCase()} SINK`, PAIN_COLORS[node.painType], 0.9);
  triggerTutorial(state, 'first_sink');
  return true;
}

function killEnemy(state: ArenaState, enemy: Enemy, meta: MetaSave): void {
  state.kills += 1;
  const idx = state.enemies.findIndex((e) => e.id === enemy.id);
  if (idx >= 0) state.enemies.splice(idx, 1);

  const burdenGain = enemy.burdenEmit * (enemy.type === 'boss' ? 1.5 : 0.7);
  addBurden(state, burdenGain, meta.upgrades, enemy.painType);

  state.pickups.push({
    id: nextId(state), x: enemy.x, y: enemy.y,
    kind: 'pain_orb', value: burdenGain * 0.5, painType: enemy.painType, magnetized: false,
  });
  state.pickups.push({
    id: nextId(state), x: enemy.x + 6, y: enemy.y + 4,
    kind: 'xp', value: XP_GEM_VALUE + state.wave * 2, magnetized: false,
  });

  if (Math.random() < REMNANT_DROP_CHANCE + meta.upgrades.remnantBonus * 0.03) {
    state.pickups.push({
      id: nextId(state), x: enemy.x + 10, y: enemy.y,
      kind: 'remnant', value: 1, magnetized: false,
    });
  }

  if (enemy.type === 'boss') {
    state.bossActive = false;
    state.won = state.wave >= 20;
    floatText(state, enemy.x, enemy.y, 'PAIN ANCHOR SHATTERED', COLORS.remnant, 1.3);
  }

  spawnParticle(state, enemy.x, enemy.y, PAIN_COLORS[enemy.painType], 12, 150, true);
  floatText(state, enemy.x, enemy.y - 10, String(Math.floor(enemy.burdenEmit)), PAIN_COLORS[enemy.painType], 0.85);
  state.hitStop = 0.05;
  state.shake = 0.12;
}

function gainXp(state: ArenaState, amount: number, meta: MetaSave): void {
  state.player.xp += amount;
  while (state.player.xp >= state.player.xpToNext) {
    state.player.xp -= state.player.xpToNext;
    state.player.level += 1;
    state.player.xpToNext = Math.floor(30 + state.player.level * 18);
    state.pendingLevelUp = true;
    state.levelUpChoices = pickLevelUpChoices(state.charms, 3, meta.discoveredMelds);
    spawnParticle(state, state.player.x, state.player.y, '#5ce1ff', 20, 180, true);
    state.shake = 0.12;
  }
}

export function applyLevelUpChoice(state: ArenaState, charmId: CharmId): void {
  state.charms = addOrUpgradeCharm(state.charms, charmId);
  state.pendingLevelUp = false;
  state.levelUpChoices = [];
  if (charmId === 'grief_catalyst' || charmId === 'pulse_catalyst') {
    state.player.hp = Math.min(state.player.maxHp, state.player.hp + 25);
  }
  if (charmId === 'anchor' || charmId === 'burning_anchor') {
    state.maxSinks += 1;
  }
}

export function tryMeld(state: ArenaState): CharmId | null {
  const [a, b] = state.meldSlots;
  if (!a || !b) return null;
  const result = findMeld(a, b);
  if (!result) return null;
  state.charms = addOrUpgradeCharm(state.charms, result);
  state.meldSlots = [null, null];
  state.meldsFound += 1;
  state.shrineActive = false;
  floatText(state, state.player.x, state.player.y - 30, `MELD: ${CHARM_DEFS[result].name}`, CHARM_DEFS[result].color, 1.2);
  spawnParticle(state, state.player.x, state.player.y, CHARM_DEFS[result].color, 24, 220, true);
  state.shake = 0.25;
  state.hitStop = 0.08;
  return result;
}

export function setMeldSlot(state: ArenaState, slot: 0 | 1, charmId: CharmId | null): void {
  state.meldSlots[slot] = charmId;
}

export function dismissTutorial(state: ArenaState): void {
  if (state.tutorialStep) {
    state.tutorialSeen.add(state.tutorialStep);
    const currentIdx = TUTORIAL_STEPS.findIndex((s) => s.id === state.tutorialStep);
    const next = TUTORIAL_STEPS.slice(currentIdx + 1).find((s) => !state.tutorialSeen.has(s.id));
    state.tutorialStep = next?.id ?? null;
  }
}

export function skipAllTutorial(state: ArenaState): void {
  for (const s of TUTORIAL_STEPS) state.tutorialSeen.add(s.id);
  state.tutorialStep = null;
}

export function updateArena(state: ArenaState, dt: number, keys: Set<string>, meta: MetaSave): void {
  if (state.dead || state.won || state.pendingLevelUp) return;
  if (state.hitStop > 0) { state.hitStop -= dt; return; }

  const waveDt = state.firstWaveSlow && state.wave === 1 ? dt * 0.55 : dt;
  state.time += dt;
  state.burden.max = effectiveBurdenMax(state, meta.upgrades);
  if (state.burden.overflowPulse > 0) state.burden.overflowPulse -= dt * 2;
  if (state.ventPulse > 0) state.ventPulse -= dt * 2.5;
  if (state.lashCooldown > 0) state.lashCooldown -= dt;
  if (state.ventCooldown > 0) state.ventCooldown -= dt;

  expandWorld(state.world, state.wave);

  state.player.aimAngle = Math.atan2(
    state.mouseY - state.player.y,
    state.mouseX - state.player.x,
  );

  let mx = 0, my = 0;
  if (keys.has('w') || keys.has('arrowup')) my -= 1;
  if (keys.has('s') || keys.has('arrowdown')) my += 1;
  if (keys.has('a') || keys.has('arrowleft')) mx -= 1;
  if (keys.has('d') || keys.has('arrowright')) mx += 1;
  const len = Math.sqrt(mx * mx + my * my) || 1;
  const targetVx = (mx / len) * state.player.speed;
  const targetVy = (my / len) * state.player.speed;
  state.player.vx += (targetVx - state.player.vx) * Math.min(1, ACCEL * dt / state.player.speed);
  state.player.vy += (targetVy - state.player.vy) * Math.min(1, ACCEL * dt / state.player.speed);
  if (mx === 0 && my === 0) {
    state.player.vx *= Math.max(0, 1 - FRICTION * dt);
    state.player.vy *= Math.max(0, 1 - FRICTION * dt);
  }
  const maxV = state.player.speed * MAX_VELOCITY_MULT;
  const vlen = Math.sqrt(state.player.vx ** 2 + state.player.vy ** 2);
  if (vlen > maxV) {
    state.player.vx = (state.player.vx / vlen) * maxV;
    state.player.vy = (state.player.vy / vlen) * maxV;
  }
  state.player.x += state.player.vx * dt;
  state.player.y += state.player.vy * dt;
  if (Math.abs(state.player.vx) > 10) state.player.facing = state.player.vx > 0 ? 1 : -1;
  state.player.x = Math.max(PLAYER_RADIUS, Math.min(ARENA_W - PLAYER_RADIUS, state.player.x));
  state.player.y = Math.max(PLAYER_RADIUS, Math.min(ARENA_H - PLAYER_RADIUS, state.player.y));
  if (state.player.invuln > 0) state.player.invuln -= dt;

  if (state.mouseDown) firePainLash(state, meta);
  if (state.mouseRightDown) ventBurden(state, meta);

  const spongeLvl = charmLevel(state.charms, 'sponge') + charmLevel(state.charms, 'grief_catalyst');
  if (spongeLvl > 0) drainBurden(state, 3 * spongeLvl * dt);

  const slowFactor = miasmaSlow(state.burden.pain);
  const veilLvl = charmLevel(state.charms, 'veil') + charmLevel(state.charms, 'hollow_veil');

  if (state.burden.current >= state.burden.max) {
    const overflow = state.burden.current - state.burden.max + 1;
    state.burden.current = state.burden.max;
    const dmg = BURDEN_OVERFLOW_DPS * dt * (1 + overflow * 0.02);
    if (state.player.invuln <= 0) {
      state.player.hp -= dmg;
      state.damageTaken += dmg;
      state.burdenOverflows += 1;
    }
    const thornsLvl = charmLevel(state.charms, 'thorns') + charmLevel(state.charms, 'spite_web');
    if (thornsLvl > 0) {
      for (const e of state.enemies) {
        if (dist(state.player.x, state.player.y, e.x, e.y) < 60 + thornsLvl * 15) e.hp -= 12 * thornsLvl * dt;
      }
    }
  }

  if (wrathStormReady(state.burden.pain) && state.wrathStormCd <= 0) {
    const dmg = wrathStormDamage(state.burden.pain);
    for (const e of state.enemies) {
      if (dist(state.player.x, state.player.y, e.x, e.y) < 120) {
        e.hp -= dmg;
        e.hitFlash = 0.15;
      }
    }
    spawnParticle(state, state.player.x, state.player.y, '#ff2244', 30, 250, true);
    state.shake = 0.3;
    state.wrathStormCd = 3;
    floatText(state, state.player.x, state.player.y - 40, 'WRATH SURGE', '#ff2244', 1.4);
  }
  if (state.wrathStormCd > 0) state.wrathStormCd -= dt;

  updatePainNetwork(state, dt, (amount, type, mult) => addBurden(state, amount, meta.upgrades, type, mult));

  state.nearShrine = false;
  for (const shrine of state.world.shrines) {
    if (dist(state.player.x, state.player.y, shrine.x, shrine.y) < 28) {
      state.nearShrine = true;
      if (!shrine.discovered) {
        shrine.discovered = true;
        state.shrinesFound += 1;
        if (shrine.reward === 'capacity') state.burden.max += 15;
        else if (shrine.reward === 'heal') state.player.hp = Math.min(state.player.maxHp, state.player.hp + 30);
        else state.pickups.push({ id: nextId(state), x: shrine.x, y: shrine.y, kind: 'remnant', value: 2, magnetized: false });
        floatText(state, shrine.x, shrine.y, 'SHRINE FOUND', '#ffd700', 1.1);
        spawnParticle(state, shrine.x, shrine.y, '#ffd700', 16, 130, true);
        triggerTutorial(state, 'shrine');
      }
    }
  }

  state.shrineTimer -= dt;
  if (state.shrineTimer <= 0 && !state.shrineActive) {
    state.shrineActive = true;
    state.shrineTimer = SHRINE_DURATION;
    floatText(state, ARENA_W / 2, 80, 'MELD SHRINE OPEN', COLORS.shrine, 1.1);
  }
  if (state.shrineActive && state.shrineTimer <= 0) {
    state.shrineActive = false;
    state.shrineTimer = SHRINE_INTERVAL;
  }

  state.waveTimer += waveDt;
  if (state.waveTimer >= WAVE_DURATION || state.waveEnemiesLeft <= 0) {
    if (state.enemies.length === 0 && !state.bossActive) {
      state.wave += 1;
      state.waveTimer = 0;
      state.waveEnemiesLeft = 6 + state.wave * 2;
      state.firstWaveSlow = false;
      expandWorld(state.world, state.wave);
      if (state.wave % BOSS_WAVE_INTERVAL === 0) {
        state.bossActive = true;
        spawnEnemy(state, 'boss');
        floatText(state, ARENA_W / 2, 120, `PAIN ANCHOR WAVE ${state.wave}`, COLORS.enemyBoss, 1.2);
      } else {
        floatText(state, ARENA_W / 2, 100, `WAVE ${state.wave}`, COLORS.text);
      }
    }
  }

  const spawnRate = (state.firstWaveSlow ? 0.55 : 1.0) + state.wave * 0.1;
  if (state.waveEnemiesLeft > 0 && state.enemies.length < 22 + state.wave * 2) {
    if (Math.random() < spawnRate * waveDt) {
      const roll = Math.random();
      const type: Enemy['type'] = roll < 0.55 ? 'wretch' : roll < 0.82 ? 'howler' : 'anchor';
      spawnEnemy(state, type);
      state.waveEnemiesLeft -= 1;
    }
  }

  for (const enemy of [...state.enemies]) {
    if (enemy.spawnTelegraph > 0) {
      enemy.spawnTelegraph -= dt;
      continue;
    }
    const d = dist(enemy.x, enemy.y, state.player.x, state.player.y) || 1;
    const spd = enemy.speed * (1 - slowFactor - veilLvl * 0.04);
    enemy.x += ((state.player.x - enemy.x) / d) * spd * dt;
    enemy.y += ((state.player.y - enemy.y) / d) * spd * dt;
    if (d < PLAYER_RADIUS + enemy.size && state.player.invuln <= 0) {
      state.player.hp -= enemy.damage * dt;
      state.damageTaken += enemy.damage * dt;
      addBurden(state, enemy.burdenEmit * 0.25 * dt, meta.upgrades, enemy.painType);
    }
    addBurden(state, enemy.burdenEmit * 0.04 * dt, meta.upgrades, enemy.painType);
    if (enemy.hitFlash > 0) enemy.hitFlash -= dt;
  }

  for (const p of state.projectiles) {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.life -= dt;
    for (const enemy of state.enemies) {
      if (enemy.spawnTelegraph > 0) continue;
      if (dist(p.x, p.y, enemy.x, enemy.y) < enemy.size + 6) {
        enemy.hp -= p.damage;
        markLashed(enemy, p.damage);
        spawnParticle(state, p.x, p.y, p.color, 6, 90, true);
        floatText(state, enemy.x, enemy.y, String(Math.floor(p.damage)), p.color, 0.8);
        state.shake = 0.06;
        if (p.pierce > 0) p.pierce -= 1;
        else { p.life = 0; break; }
      }
    }
  }
  state.projectiles = state.projectiles.filter((p) => p.life > 0);

  for (const echo of state.strainEchoes) {
    echo.life -= dt;
    const ex = echo.x + Math.cos(echo.angle) * 60;
    const ey = echo.y + Math.sin(echo.angle) * 60;
    for (const enemy of state.enemies) {
      if (dist(ex, ey, enemy.x, enemy.y) < enemy.size + 8) {
        enemy.hp -= 8 * dt;
        markLashed(enemy, 4);
      }
    }
  }
  state.strainEchoes = state.strainEchoes.filter((e) => e.life > 0);

  for (const e of state.enemies.filter((en) => en.hp <= 0)) killEnemy(state, e, meta);
  state.enemies = state.enemies.filter((e) => e.hp > 0);

  const magnetRange = 120;
  const remainingPickups: Pickup[] = [];
  for (const pick of state.pickups) {
    const d = dist(pick.x, pick.y, state.player.x, state.player.y);
    if (d < magnetRange) pick.magnetized = true;
    if (pick.magnetized) {
      const dd = d || 1;
      pick.x += ((state.player.x - pick.x) / dd) * 320 * dt;
      pick.y += ((state.player.y - pick.y) / dd) * 320 * dt;
    }
    if (d < PLAYER_RADIUS + 12) {
      if (pick.kind === 'xp') gainXp(state, pick.value, meta);
      else if (pick.kind === 'pain_orb') {
        addBurden(state, pick.value, meta.upgrades, pick.painType ?? 'grief');
        if (!state.tutorialSeen.has('pain_orbs')) triggerTutorial(state, 'first_orb');
      }
      const col = pick.kind === 'xp' ? COLORS.xp : pick.kind === 'remnant' ? COLORS.remnant : PAIN_COLORS[pick.painType ?? 'grief'];
      spawnParticle(state, pick.x, pick.y, col, 6, 100, true);
      continue;
    }
    remainingPickups.push(pick);
  }
  state.pickups = remainingPickups;

  for (const part of state.particles) {
    part.x += part.vx * dt;
    part.y += part.vy * dt;
    part.vx *= 0.94;
    part.vy *= 0.94;
    part.life -= dt;
  }
  state.particles = state.particles.filter((p) => p.life > 0);

  for (const ft of state.floatingTexts) {
    ft.y -= 35 * dt;
    ft.life -= dt;
  }
  state.floatingTexts = state.floatingTexts.filter((f) => f.life > 0);

  if (state.shake > 0) state.shake -= dt;
  if (state.player.hp <= 0) state.dead = true;
  if (state.time >= RUN_DURATION && !state.won) state.won = true;
}

export function getRunStats(state: ArenaState, remnantBonus: number): RunStats {
  const remnantPickup = state.pickups.filter((p) => p.kind === 'remnant').length;
  const baseRemnants = Math.floor(state.kills * 0.35 + state.wave * 5 + state.meldsFound * 15 + state.shrinesFound * 8);
  const remnantsEarned = Math.floor(baseRemnants * (1 + remnantBonus * 0.15)) + remnantPickup;
  return {
    time: state.time, kills: state.kills, wavesCleared: state.wave - 1,
    levelsGained: state.player.level - 1, meldsFound: state.meldsFound, remnantsEarned,
    damageTaken: state.damageTaken, burdenOverflows: state.burdenOverflows,
    shrinesFound: state.shrinesFound, sinksPlaced: state.sinksPlaced,
    painRouted: Math.floor(state.painRouted),
  };
}

export function collectRunRemnants(state: ArenaState, meta: MetaSave): number {
  return getRunStats(state, meta.upgrades.remnantBonus).remnantsEarned;
}

/** @deprecated use collectRunRemnants */
export function collectRunShards(state: ArenaState, meta: MetaSave): number {
  return collectRunRemnants(state, meta);
}
