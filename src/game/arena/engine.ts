import {
  ARENA_H,
  ARENA_W,
  ALTAR_DURATION,
  ALTAR_INTERVAL,
  BASE_BURDEN_MAX,
  BASE_PLAYER_HP,
  BASE_PLAYER_SPEED,
  BOSS_WAVE_INTERVAL,
  BURDEN_OVERFLOW_DPS,
  COLORS,
  MINION_CAPACITY,
  MINION_COST,
  PLAYER_RADIUS,
  SHARD_DROP_CHANCE,
  WAVE_DURATION,
  XP_GEM_VALUE,
  ACCEL,
  FRICTION,
  MAX_VELOCITY_MULT,
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
import { ENEMY_PAIN, PAIN_COLORS, addPain, drainPain, emptyPainPool, miasmaSlow, wrathStormDamage, wrathStormReady } from '../burden/ecology';
import { createWorld, expandWorld } from '../burden/world';
import { STRUCTURE_CYCLE, STRUCTURE_DEFS, createStructure } from '../burden/structures';
import { TUTORIAL_STEPS } from '../burden/tutorial';

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

function addBurden(state: ArenaState, amount: number, upgrades: MetaUpgrades, painType: PainType = 'grief'): void {
  const max = effectiveBurdenMax(state, upgrades);
  state.burden.max = max;
  const before = state.burden.current;
  state.burden.current = Math.min(max, state.burden.current + amount);
  addPain(state.burden.pain, painType, amount * 0.6);

  const conduitLvl = charmLevel(state.charms, 'conduit') + charmLevel(state.charms, 'void_conduit');
  if (conduitLvl > 0 && state.minions.length > 0) {
    const route = amount * 0.08 * conduitLvl;
    for (const m of state.minions) {
      m.burdenHeld = Math.min(m.capacity, m.burdenHeld + route / state.minions.length);
    }
    state.burden.current = Math.max(0, state.burden.current - route);
    state.painRouted += route;
  }

  const relayLvl = charmLevel(state.charms, 'relay') + charmLevel(state.charms, 'ember_relay');
  if (relayLvl > 0) {
    state.burden.current = Math.max(0, state.burden.current - amount * 0.05 * relayLvl);
  }

  if (state.burden.current >= max * 0.95 && before < max * 0.95) {
    state.shake = 0.15;
    state.burden.overflowPulse = 1;
  }
  if (state.burden.current >= max * 0.5 && !state.tutorialSeen.has('pain_layers')) {
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
      level: 1, xp: 0, xpToNext: 30, invuln: 0, facing: 0,
    },
    burden: { current: 0, max: BASE_BURDEN_MAX + u.burdenCap * 25, pain: emptyPainPool(), overflowPulse: 0 },
    world: createWorld(),
    structures: [],
    buildMode: false,
    buildIndex: 0,
    enemies: [], projectiles: [], pickups: [], minions: [],
    particles: [], floatingTexts: [],
    charms,
    meldSlots: [null, null],
    wave: 1, waveTimer: 0, waveEnemiesLeft: 8,
    time: 0, kills: 0,
    altarActive: false, altarTimer: ALTAR_INTERVAL,
    bossActive: false, shake: 0, hitStop: 0, nextId: 1,
    damageTaken: 0, burdenOverflows: 0, meldsFound: 0,
    shrinesFound: 0, structuresBuilt: 0, painRouted: 0,
    pendingLevelUp: false, levelUpChoices: [],
    dead: false, won: false,
    tutorialStep: skipTutorial ? null : 'welcome',
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
    wretch: { hp: 28, speed: 70, damage: 8, burdenEmit: 12, size: 12 },
    howler: { hp: 18, speed: 110, damage: 6, burdenEmit: 18, size: 10 },
    anchor: { hp: 55, speed: 45, damage: 12, burdenEmit: 25, size: 16 },
    boss: { hp: 400, speed: 55, damage: 20, burdenEmit: 40, size: 28 },
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
    spawnTelegraph: 1.2,
  });
}

function fireProjectile(state: ArenaState, x: number, y: number, tx: number, ty: number, damage: number, color = COLORS.projectile, pierce = 0): void {
  const d = dist(x, y, tx, ty) || 1;
  const speed = 380;
  state.projectiles.push({
    id: nextId(state), x, y,
    vx: ((tx - x) / d) * speed,
    vy: ((ty - y) / d) * speed,
    damage, life: 2, color, pierce,
  });
}

function killEnemy(state: ArenaState, enemy: Enemy, meta: MetaSave): void {
  state.kills += 1;
  const idx = state.enemies.findIndex((e) => e.id === enemy.id);
  if (idx >= 0) state.enemies.splice(idx, 1);

  const burdenGain = enemy.burdenEmit * (enemy.type === 'boss' ? 2 : 1);
  addBurden(state, burdenGain, meta.upgrades, enemy.painType);
  if (state.kills === 1) triggerTutorial(state, 'first_kill');

  const emberRelay = charmLevel(state.charms, 'ember_relay');
  if (emberRelay > 0) {
    for (const e of state.enemies) {
      if (dist(enemy.x, enemy.y, e.x, e.y) < 80 + emberRelay * 20) {
        e.hp -= 8 * emberRelay;
        e.hitFlash = 0.1;
      }
    }
    spawnParticle(state, enemy.x, enemy.y, '#fb923c', 12, 160, true);
  }

  state.pickups.push({
    id: nextId(state), x: enemy.x, y: enemy.y,
    kind: 'xp', value: XP_GEM_VALUE + state.wave * 2, magnetized: false,
  });

  if (Math.random() < SHARD_DROP_CHANCE + meta.upgrades.shardBonus * 0.03) {
    state.pickups.push({
      id: nextId(state), x: enemy.x + 8, y: enemy.y,
      kind: 'shard', value: 1, magnetized: false,
    });
  }

  if (enemy.type === 'boss') {
    state.bossActive = false;
    state.won = state.wave >= 15;
    floatText(state, enemy.x, enemy.y, 'ANCHOR SHATTERED', COLORS.shard, 1.3);
    musicBossEnd(state);
  }

  spawnParticle(state, enemy.x, enemy.y, PAIN_COLORS[enemy.painType], 10, 140, true);
  floatText(state, enemy.x, enemy.y - 10, `-${Math.floor(enemy.burdenEmit)}`, PAIN_COLORS[enemy.painType]);
  state.hitStop = 0.05;
  state.shake = 0.1;
}

function musicBossEnd(_state: ArenaState): void { /* hook for audio crossfade */ }

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
}

export function tryMeld(state: ArenaState): CharmId | null {
  const [a, b] = state.meldSlots;
  if (!a || !b) return null;
  const result = findMeld(a, b);
  if (!result) return null;
  state.charms = addOrUpgradeCharm(state.charms, result);
  state.meldSlots = [null, null];
  state.meldsFound += 1;
  state.altarActive = false;
  floatText(state, state.player.x, state.player.y - 30, `MELD: ${CHARM_DEFS[result].name}`, CHARM_DEFS[result].color, 1.2);
  spawnParticle(state, state.player.x, state.player.y, CHARM_DEFS[result].color, 24, 220, true);
  state.shake = 0.25;
  state.hitStop = 0.08;
  return result;
}

export function setMeldSlot(state: ArenaState, slot: 0 | 1, charmId: CharmId | null): void {
  state.meldSlots[slot] = charmId;
}

export function deployMinion(state: ArenaState, meta: MetaSave): boolean {
  const maxSlots = 2 + meta.upgrades.minionSlots;
  if (state.minions.length >= maxSlots) return false;
  if (state.burden.current < MINION_COST) return false;
  drainBurden(state, MINION_COST);
  const chainLvl = charmLevel(state.charms, 'chain') + charmLevel(state.charms, 'chain_relay');
  state.minions.push({
    id: nextId(state), x: state.player.x, y: state.player.y,
    angle: (state.minions.length / maxSlots) * Math.PI * 2,
    hp: 50, maxHp: 50, burdenHeld: 0,
    capacity: MINION_CAPACITY + charmLevel(state.charms, 'spite_web') * 15 + chainLvl * 10,
  });
  spawnParticle(state, state.player.x, state.player.y, COLORS.minion, 10, 100, true);
  triggerTutorial(state, 'minion');
  return true;
}

export function placeStructure(state: ArenaState, _meta: MetaSave): boolean {
  const type = STRUCTURE_CYCLE[state.buildIndex % STRUCTURE_CYCLE.length];
  const def = STRUCTURE_DEFS[type];
  if (state.burden.current < def.cost) return false;
  drainBurden(state, def.cost);
  state.structures.push(createStructure(type, state.player.x, state.player.y, nextId(state)));
  state.structuresBuilt += 1;
  spawnParticle(state, state.player.x, state.player.y, def.color, 14, 90, true);
  return true;
}

export function cycleBuildMode(state: ArenaState): void {
  state.buildMode = !state.buildMode;
  if (state.buildMode) state.buildIndex = 0;
}

export function cycleBuildType(state: ArenaState): void {
  state.buildIndex = (state.buildIndex + 1) % STRUCTURE_CYCLE.length;
}

export function dismissTutorial(state: ArenaState): void {
  if (state.tutorialStep) {
    state.tutorialSeen.add(state.tutorialStep);
    const current = TUTORIAL_STEPS.find((s) => s.id === state.tutorialStep);
    const next = TUTORIAL_STEPS.find((s) => !state.tutorialSeen.has(s.id));
    state.tutorialStep = next && current ? next.id : null;
  }
}

export function skipAllTutorial(state: ArenaState): void {
  for (const s of TUTORIAL_STEPS) state.tutorialSeen.add(s.id);
  state.tutorialStep = null;
}

export function updateArena(state: ArenaState, dt: number, keys: Set<string>, meta: MetaSave): void {
  if (state.dead || state.won || state.pendingLevelUp) return;
  if (state.hitStop > 0) { state.hitStop -= dt; return; }

  const waveDt = state.firstWaveSlow && state.wave === 1 ? dt * 0.45 : dt;
  state.time += dt;
  state.burden.max = effectiveBurdenMax(state, meta.upgrades);
  if (state.burden.overflowPulse > 0) state.burden.overflowPulse -= dt * 2;

  expandWorld(state.world, state.wave);

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

  const spongeLvl = charmLevel(state.charms, 'sponge') + charmLevel(state.charms, 'grief_catalyst') + charmLevel(state.charms, 'grief_pulse');
  if (spongeLvl > 0) drainBurden(state, 3 * spongeLvl * dt);

  const voidLvl = charmLevel(state.charms, 'void') + charmLevel(state.charms, 'void_conduit') + charmLevel(state.charms, 'void_maw');
  if (voidLvl > 0) {
    const drained = drainBurden(state, 5 * voidLvl * dt);
    if (drained > 0 && state.enemies.length > 0) {
      const target = state.enemies.reduce((a, b) =>
        dist(state.player.x, state.player.y, a.x, a.y) < dist(state.player.x, state.player.y, b.x, b.y) ? a : b);
      fireProjectile(state, state.player.x, state.player.y, target.x, target.y, 6 * voidLvl, '#818cf8');
    }
  }

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
    const lashLvl = charmLevel(state.charms, 'lash') + charmLevel(state.charms, 'ember_lash');
    if (lashLvl > 0) {
      for (const e of state.enemies) {
        if (dist(state.player.x, state.player.y, e.x, e.y) < 50 + lashLvl * 12) {
          e.hp -= 18 * lashLvl * dt;
          e.hitFlash = 0.08;
        }
      }
    }
    const burnLvl = charmLevel(state.charms, 'burning_anchor');
    if (burnLvl > 0 && Math.random() < dt * 2) {
      for (const e of state.enemies) {
        if (dist(state.player.x, state.player.y, e.x, e.y) < 100) { e.hp -= 20 * burnLvl; e.hitFlash = 0.12; }
      }
      spawnParticle(state, state.player.x, state.player.y, '#f97316', 6, 90, true);
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
    floatText(state, state.player.x, state.player.y - 40, 'WRATH STORM', '#ff2244', 1.4);
  }
  if (state.wrathStormCd > 0) state.wrathStormCd -= dt;

  const wrathCharm = charmLevel(state.charms, 'wrath_storm');
  if (wrathCharm > 0 && state.wrathStormCd <= 0 && state.burden.current > state.burden.max * 0.7) {
    for (const e of state.enemies) {
      if (dist(state.player.x, state.player.y, e.x, e.y) < 100 + wrathCharm * 20) e.hp -= 25 * wrathCharm * dt;
    }
  }

  const emberLvl = charmLevel(state.charms, 'ember') + charmLevel(state.charms, 'burden_storm');
  if (emberLvl > 0) {
    const burnDmg = 4 * emberLvl * (0.5 + state.burden.current / state.burden.max);
    for (const e of state.enemies) {
      if (dist(state.player.x, state.player.y, e.x, e.y) < 55 + emberLvl * 10) e.hp -= burnDmg * dt;
    }
  }

  for (const s of state.structures) {
    if (!s.active) continue;
    if (s.type === 'sink_tower') drainBurden(state, 8 * dt);
    if (s.type === 'pain_relay' && state.minions.length > 0) {
      const xfer = 12 * dt;
      state.minions[0].burdenHeld = Math.min(state.minions[0].capacity, state.minions[0].burdenHeld + xfer);
      state.burden.current = Math.max(0, state.burden.current - xfer);
      state.painRouted += xfer;
    }
  }

  for (const shrine of state.world.shrines) {
    if (!shrine.discovered && dist(state.player.x, state.player.y, shrine.x, shrine.y) < 24) {
      shrine.discovered = true;
      state.shrinesFound += 1;
      if (shrine.reward === 'capacity') state.burden.max += 15;
      else if (shrine.reward === 'heal') state.player.hp = Math.min(state.player.maxHp, state.player.hp + 30);
      else state.pickups.push({ id: nextId(state), x: shrine.x, y: shrine.y, kind: 'shard', value: 2, magnetized: false });
      floatText(state, shrine.x, shrine.y, 'SHRINE FOUND', '#ffd700', 1.1);
      spawnParticle(state, shrine.x, shrine.y, '#ffd700', 16, 130, true);
    }
  }

  state.waveTimer += waveDt;
  state.altarTimer -= dt;
  if (state.altarTimer <= 0 && !state.altarActive) {
    state.altarActive = true;
    state.altarTimer = ALTAR_DURATION;
    floatText(state, ARENA_W / 2, 80, 'MELD ALTAR ACTIVE', COLORS.altar, 1.1);
    triggerTutorial(state, 'altar');
  }
  if (state.altarActive && state.altarTimer <= 0) {
    state.altarActive = false;
    state.altarTimer = ALTAR_INTERVAL;
  }

  if (state.waveTimer >= WAVE_DURATION || state.waveEnemiesLeft <= 0) {
    if (state.enemies.length === 0 && !state.bossActive) {
      state.wave += 1;
      state.waveTimer = 0;
      state.waveEnemiesLeft = 8 + state.wave * 3;
      state.firstWaveSlow = false;
      expandWorld(state.world, state.wave);
      if (state.wave % BOSS_WAVE_INTERVAL === 0) {
        state.bossActive = true;
        spawnEnemy(state, 'boss');
        floatText(state, ARENA_W / 2, 120, `GRIEF ANCHOR WAVE ${state.wave}`, COLORS.enemyBoss, 1.2);
      } else {
        floatText(state, ARENA_W / 2, 100, `WAVE ${state.wave}`, COLORS.text);
      }
    }
  }

  const spawnRate = (state.firstWaveSlow ? 0.35 : 0.8) + state.wave * 0.12;
  if (state.waveEnemiesLeft > 0 && state.enemies.length < 28 + state.wave * 2) {
    if (Math.random() < spawnRate * waveDt) {
      const roll = Math.random();
      const type: Enemy['type'] = roll < 0.5 ? 'wretch' : roll < 0.78 ? 'howler' : 'anchor';
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
      addBurden(state, enemy.burdenEmit * 0.3 * dt, meta.upgrades, enemy.painType);
    }
    addBurden(state, enemy.burdenEmit * 0.05 * dt, meta.upgrades, enemy.painType);
    if (enemy.hitFlash > 0) enemy.hitFlash -= dt;
  }

  if (!('_shardCd' in state)) (state as ArenaState & { _shardCd?: number })._shardCd = 0;
  const shardLvl = charmLevel(state.charms, 'shard') + charmLevel(state.charms, 'burden_storm') + charmLevel(state.charms, 'prism_storm');
  const stormLvl = charmLevel(state.charms, 'burden_storm');
  const prismLvl = charmLevel(state.charms, 'prism') + charmLevel(state.charms, 'rage_prism');
  const shardCd = (state as ArenaState & { _shardCd: number })._shardCd;
  const autoFireInterval = Math.max(0.22, 0.9 - shardLvl * 0.08 - stormLvl * 0.06);
  (state as ArenaState & { _shardCd: number })._shardCd = shardCd + dt;
  if (shardLvl > 0 && shardCd + dt >= autoFireInterval) {
    (state as ArenaState & { _shardCd: number })._shardCd = 0;
    const nearest = state.enemies.map((e) => ({ e, d: dist(state.player.x, state.player.y, e.x, e.y) })).sort((a, b) => a.d - b.d)[0];
    if (nearest && nearest.d < 340) {
      const dmg = 10 + shardLvl * 6 + state.burden.current * 0.05;
      fireProjectile(state, state.player.x, state.player.y, nearest.e.x, nearest.e.y, dmg);
      if (stormLvl > 0) fireProjectile(state, state.player.x, state.player.y, nearest.e.x + 20, nearest.e.y, dmg * 0.6, '#22d3ee', 1);
      if (prismLvl > 0 && state.burden.pain.rage > 20) {
        fireProjectile(state, state.player.x, state.player.y, nearest.e.x - 15, nearest.e.y + 10, dmg * 0.5, '#f472b6', 1);
      }
    }
  }

  for (const p of state.projectiles) {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.life -= dt;
    for (const enemy of state.enemies) {
      if (dist(p.x, p.y, enemy.x, enemy.y) < enemy.size + 4) {
        enemy.hp -= p.damage;
        enemy.hitFlash = 0.08;
        spawnParticle(state, p.x, p.y, p.color, 4, 70, true);
        floatText(state, enemy.x, enemy.y, String(Math.floor(p.damage)), p.color, 0.8);
        if (p.pierce > 0) p.pierce -= 1;
        else { p.life = 0; break; }
      }
    }
  }
  state.projectiles = state.projectiles.filter((p) => p.life > 0);

  for (const e of state.enemies.filter((en) => en.hp <= 0)) killEnemy(state, e, meta);
  state.enemies = state.enemies.filter((e) => e.hp > 0);

  for (const m of state.minions) {
    m.angle += dt * 2.2;
    const orbit = 55 + state.minions.indexOf(m) * 18;
    m.x = state.player.x + Math.cos(m.angle) * orbit;
    m.y = state.player.y + Math.sin(m.angle) * orbit;
    const spiteLvl = charmLevel(state.charms, 'spite_web');
    if (spiteLvl > 0 && state.burden.current > 0) {
      const xfer = Math.min(m.capacity - m.burdenHeld, state.burden.current * 0.15 * spiteLvl * dt);
      m.burdenHeld += xfer;
      state.burden.current -= xfer;
    }
    for (const enemy of state.enemies) {
      if (dist(m.x, m.y, enemy.x, enemy.y) < enemy.size + 10) {
        enemy.hp -= 15 * dt;
        m.burdenHeld += 2 * dt;
      }
    }
    const voidConduit = charmLevel(state.charms, 'void_conduit');
    if (voidConduit > 0 && m.burdenHeld > 5 && state.enemies[0]) {
      fireProjectile(state, m.x, m.y, state.enemies[0].x, state.enemies[0].y, 8 * voidConduit, '#a5b4fc');
      m.burdenHeld -= 3 * dt;
    }
  }

  const remainingPickups: Pickup[] = [];
  for (const pick of state.pickups) {
    const d = dist(pick.x, pick.y, state.player.x, state.player.y);
    if (d < 140) pick.magnetized = true;
    if (pick.magnetized) {
      const dd = d || 1;
      pick.x += ((state.player.x - pick.x) / dd) * 300 * dt;
      pick.y += ((state.player.y - pick.y) / dd) * 300 * dt;
    }
    if (d < PLAYER_RADIUS + 10) {
      if (pick.kind === 'xp') gainXp(state, pick.value, meta);
      spawnParticle(state, pick.x, pick.y, pick.kind === 'xp' ? COLORS.xp : COLORS.shard, 6, 100, true);
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
  if (state.time >= 900 && !state.won) state.won = true;
}

export function getRunStats(state: ArenaState, shardBonus: number): RunStats {
  const shardPickup = state.pickups.filter((p) => p.kind === 'shard').length;
  const baseShards = Math.floor(state.kills * 0.3 + state.wave * 5 + state.meldsFound * 15 + state.shrinesFound * 8);
  const shardsEarned = Math.floor(baseShards * (1 + shardBonus * 0.15)) + shardPickup;
  return {
    time: state.time, kills: state.kills, wavesCleared: state.wave - 1,
    levelsGained: state.player.level - 1, meldsFound: state.meldsFound, shardsEarned,
    damageTaken: state.damageTaken, burdenOverflows: state.burdenOverflows,
    shrinesFound: state.shrinesFound, structuresBuilt: state.structuresBuilt,
    painRouted: Math.floor(state.painRouted),
  };
}

export function collectRunShards(state: ArenaState, meta: MetaSave): number {
  return getRunStats(state, meta.upgrades.shardBonus).shardsEarned;
}

export function tryFuseShrine(state: ArenaState, structureId: number): CharmId | null {
  const shrine = state.structures.find((s) => s.id === structureId && s.type === 'fuse_shrine' && !s.fuseUsed);
  if (!shrine) return null;
  const result = tryMeld(state);
  if (result) shrine.fuseUsed = true;
  return result;
}
