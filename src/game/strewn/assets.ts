/** Kenney sprite atlas loader for Strewn */

import { assetUrl } from '../../assetUrl';

export const TILE_SIZE = 16;

export interface SpriteAtlas {
  tilemap: HTMLImageElement;
  player: HTMLImageElement;
  enemyWretch: HTMLImageElement;
  enemyHowler: HTMLImageElement;
  enemyAnchor: HTMLImageElement;
  enemyBoss: HTMLImageElement;
  painOrb: HTMLImageElement;
  remnant: HTMLImageElement;
  sinkNode: HTMLImageElement;
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
    loadImage(assetUrl('assets/tiles/tilemap_packed.png')),
    loadImage(assetUrl('assets/sprites/player.png')),
    loadImage(assetUrl('assets/sprites/enemy_wretch.png')),
    loadImage(assetUrl('assets/sprites/enemy_howler.png')),
    loadImage(assetUrl('assets/sprites/enemy_anchor.png')),
    loadImage(assetUrl('assets/sprites/enemy_boss.png')),
    loadImage(assetUrl('assets/sprites/pain_orb.png')),
    loadImage(assetUrl('assets/sprites/remnant.png')),
    loadImage(assetUrl('assets/sprites/sink_node.png')),
  ]).then(([tilemap, player, enemyWretch, enemyHowler, enemyAnchor, enemyBoss, painOrb, remnant, sinkNode]) => {
    atlas = {
      tilemap,
      player,
      enemyWretch,
      enemyHowler,
      enemyAnchor,
      enemyBoss,
      painOrb,
      remnant,
      sinkNode,
      ready: true,
    };
    return atlas;
  });

  return loadPromise;
}

export function getAtlas(): SpriteAtlas | null {
  return atlas;
}

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
