export type Screen =
  | 'menu'
  | 'playing'
  | 'paused'
  | 'levelup'
  | 'meld'
  | 'gameover'
  | 'victory'
  | 'shop'
  | 'settings';

export type CharmId =
  | 'shard'
  | 'anchor'
  | 'conduit'
  | 'thorns'
  | 'ember'
  | 'void'
  | 'relay'
  | 'sponge'
  | 'burning_anchor'
  | 'spite_web'
  | 'void_conduit'
  | 'ember_relay'
  | 'grief_catalyst'
  | 'burden_storm';

export interface CharmDef {
  id: CharmId;
  name: string;
  desc: string;
  color: string;
  tier: 'base' | 'fused';
  maxLevel: number;
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
}

export interface GameSettings {
  musicVolume: number;
  muted: boolean;
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
  hitFlash: number;
  size: number;
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
}

export interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  life: number;
  color: string;
}

export interface ArenaState {
  player: {
    x: number;
    y: number;
    hp: number;
    maxHp: number;
    speed: number;
    level: number;
    xp: number;
    xpToNext: number;
    invuln: number;
  };
  burden: {
    current: number;
    max: number;
  };
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
  pendingLevelUp: boolean;
  levelUpChoices: CharmId[];
  dead: boolean;
  won: boolean;
}
