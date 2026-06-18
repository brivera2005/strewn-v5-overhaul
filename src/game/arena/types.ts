import type { WorldState } from '../burden/world';

export type Screen =
  | 'menu'
  | 'playing'
  | 'paused'
  | 'levelup'
  | 'meld'
  | 'gameover'
  | 'victory'
  | 'shop'
  | 'settings'
  | 'codex';

export type PainType = 'grief' | 'rage' | 'dread' | 'hollow';

export interface PainPool {
  grief: number;
  rage: number;
  dread: number;
  hollow: number;
}

export type CharmId =
  | 'shard'
  | 'anchor'
  | 'conduit'
  | 'thorns'
  | 'ember'
  | 'void'
  | 'relay'
  | 'sponge'
  | 'lash'
  | 'veil'
  | 'null_charm'
  | 'pulse'
  | 'prism'
  | 'chain'
  | 'burning_anchor'
  | 'spite_web'
  | 'void_conduit'
  | 'ember_relay'
  | 'grief_catalyst'
  | 'burden_storm'
  | 'wrath_storm'
  | 'void_maw'
  | 'dread_lash'
  | 'hollow_veil'
  | 'rage_prism'
  | 'grief_pulse'
  | 'chain_relay'
  | 'null_anchor'
  | 'spite_chain'
  | 'ember_lash'
  | 'void_veil'
  | 'prism_storm'
  | 'pulse_catalyst'
  | 'thorn_null'
  | 'relay_prism'
  | 'sponge_veil'
  | 'shard_chain';

export interface CharmDef {
  id: CharmId;
  name: string;
  desc: string;
  color: string;
  tier: 'base' | 'fused';
  maxLevel: number;
  painAffinity?: PainType;
}

export interface ActiveCharm {
  id: CharmId;
  level: number;
}

export interface MetaUpgrades {
  maxHp: number;
  burdenCap: number;
  moveSpeed: number;
  shardBonus: number;
  minionSlots: number;
  startCharm: CharmId | null;
  biomeUnlock: number;
}

export interface MetaSave {
  version: 6;
  shards: number;
  totalRuns: number;
  bestTime: number;
  bestKills: number;
  discoveredMelds: CharmId[];
  upgrades: MetaUpgrades;
  settings: GameSettings;
  tutorialComplete: boolean;
  loreUnlocked: string[];
}

export interface GameSettings {
  musicVolume: number;
  muted: boolean;
  crtScanlines: boolean;
}

export interface RunStats {
  time: number;
  kills: number;
  wavesCleared: number;
  levelsGained: number;
  meldsFound: number;
  shardsEarned: number;
  damageTaken: number;
  burdenOverflows: number;
  shrinesFound: number;
  structuresBuilt: number;
  painRouted: number;
}

export interface Vec2 {
  x: number;
  y: number;
}

export interface Enemy {
  id: number;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  speed: number;
  damage: number;
  burdenEmit: number;
  type: 'wretch' | 'howler' | 'anchor' | 'boss';
  painType: PainType;
  hitFlash: number;
  size: number;
  spawnTelegraph: number;
}

export interface Projectile {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  damage: number;
  life: number;
  color: string;
  pierce: number;
}

export interface Pickup {
  id: number;
  x: number;
  y: number;
  kind: 'xp' | 'charm' | 'shard';
  value: number;
  charmId?: CharmId;
  magnetized: boolean;
}

export interface Minion {
  id: number;
  x: number;
  y: number;
  angle: number;
  hp: number;
  maxHp: number;
  burdenHeld: number;
  capacity: number;
}

export interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  sprite?: boolean;
}

export interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  life: number;
  color: string;
  scale?: number;
}

export type StructureType = 'pain_relay' | 'sink_tower' | 'fuse_shrine';

export interface Structure {
  id: number;
  type: StructureType;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  active: boolean;
  fuseUsed: boolean;
}

export interface ArenaState {
  player: {
    x: number;
    y: number;
    vx: number;
    vy: number;
    hp: number;
    maxHp: number;
    speed: number;
    level: number;
    xp: number;
    xpToNext: number;
    invuln: number;
    facing: number;
  };
  burden: {
    current: number;
    max: number;
    pain: PainPool;
    overflowPulse: number;
  };
  world: WorldState;
  structures: Structure[];
  buildMode: boolean;
  buildIndex: number;
  enemies: Enemy[];
  projectiles: Projectile[];
  pickups: Pickup[];
  minions: Minion[];
  particles: Particle[];
  floatingTexts: FloatingText[];
  charms: ActiveCharm[];
  meldSlots: [CharmId | null, CharmId | null];
  wave: number;
  waveTimer: number;
  waveEnemiesLeft: number;
  time: number;
  kills: number;
  altarActive: boolean;
  altarTimer: number;
  bossActive: boolean;
  shake: number;
  hitStop: number;
  nextId: number;
  damageTaken: number;
  burdenOverflows: number;
  meldsFound: number;
  shrinesFound: number;
  structuresBuilt: number;
  painRouted: number;
  pendingLevelUp: boolean;
  levelUpChoices: CharmId[];
  dead: boolean;
  won: boolean;
  tutorialStep: string | null;
  tutorialSeen: Set<string>;
  wrathStormCd: number;
  firstWaveSlow: boolean;
}
