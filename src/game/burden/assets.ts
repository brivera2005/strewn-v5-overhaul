/** Kenney sprite atlas loader — tilemap_packed + character sheets */

export const TILE_SIZE = 16;
export const TILE_STRIDE = 17; // 16px tile + 1px gap in separate tiles; packed uses 16

export interface SpriteAtlas {
  tilemap: HTMLImageElement;
  player: HTMLImageElement;
  enemyWretch: HTMLImageElement;
  enemyHowler: HTMLImageElement;
  enemyAnchor: HTMLImageElement;
  enemyBoss: HTMLImageElement;
  minion: HTMLImageElement;
  xpGem: HTMLImageElement;
  shard: HTMLImageElement;
  ready: boolean;
}

let atlas: SpriteAtlas | null = null;
let loadPromise: Promise<SpriteAtlas> | null = null;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load ${src}`));
    img.src = src;
  });
}

export function loadAssets(): Promise<SpriteAtlas> {
  if (atlas?.ready) return Promise.resolve(atlas);
  if (loadPromise) return loadPromise;

  loadPromise = Promise.all([
    loadImage('/assets/tiles/tilemap_packed.png'),
    loadImage('/assets/sprites/player.png'),
    loadImage('/assets/sprites/enemy_wretch.png'),
    loadImage('/assets/sprites/enemy_howler.png'),
    loadImage('/assets/sprites/enemy_anchor.png'),
    loadImage('/assets/sprites/enemy_boss.png'),
    loadImage('/assets/sprites/minion.png'),
    loadImage('/assets/sprites/xp_gem.png'),
    loadImage('/assets/sprites/shard.png'),
  ]).then(([tilemap, player, enemyWretch, enemyHowler, enemyAnchor, enemyBoss, minion, xpGem, shard]) => {
    atlas = {
      tilemap,
      player,
      enemyWretch,
      enemyHowler,
      enemyAnchor,
      enemyBoss,
      minion,
      xpGem,
      shard,
      ready: true,
    };
    return atlas;
  });

  return loadPromise;
}

export function getAtlas(): SpriteAtlas | null {
  return atlas;
}

/** Draw a tile from tilemap_packed (16×16 grid, no gap) */
export function drawTile(
  ctx: CanvasRenderingContext2D,
  atlasImg: HTMLImageElement,
  col: number,
  row: number,
  dx: number,
  dy: number,
  scale = 1,
): void {
  const s = TILE_SIZE * scale;
  ctx.drawImage(
    atlasImg,
    col * TILE_SIZE,
    row * TILE_SIZE,
    TILE_SIZE,
    TILE_SIZE,
    dx,
    dy,
    s,
    s,
  );
}

/** Draw animated frame from horizontal sprite sheet */
export function drawSheetFrame(
  ctx: CanvasRenderingContext2D,
  sheet: HTMLImageElement,
  frame: number,
  frameW: number,
  frameH: number,
  dx: number,
  dy: number,
  scale = 1,
  flipX = false,
): void {
  const frames = Math.max(1, Math.floor(sheet.width / frameW));
  const f = frame % frames;
  ctx.save();
  if (flipX) {
    ctx.translate(dx + frameW * scale, dy);
    ctx.scale(-1, 1);
    ctx.drawImage(sheet, f * frameW, 0, frameW, frameH, 0, 0, frameW * scale, frameH * scale);
  } else {
    ctx.drawImage(sheet, f * frameW, 0, frameW, frameH, dx, dy, frameW * scale, frameH * scale);
  }
  ctx.restore();
}
