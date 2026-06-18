/**
 * Generates assets/icon.png (256×256) and assets/icon.ico (16, 32, 48, 256)
 * from a 32×32 pixel-art grid matching assets/icon.svg.
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';
import pngToIco from 'png-to-ico';

const __dirname = dirname(fileURLToPath(import.meta.url));
const assetsDir = join(__dirname, '..', 'assets');

const COLORS = {
  '.': [0x0a, 0x0e, 0x17, 0xff],
  T: [0x00, 0xd4, 0xaa, 0xff],
  t: [0x00, 0xd4, 0xaa, 0xb3],
  G: [0x00, 0xd4, 0xaa, 0x73],
  g: [0x00, 0xd4, 0xaa, 0x40],
  V: [0x7b, 0x61, 0xff, 0xff],
  v: [0x7b, 0x61, 0xff, 0xe6],
  C: [0xff, 0x4d, 0x6a, 0xff],
  c: [0xff, 0x4d, 0x6a, 0xcc],
  p: [0xff, 0x4d, 0x6a, 0x99],
};

const GRID = [
  '................................',
  '..C.c..............c.C..........',
  '.C......................C.......',
  '...............................C',
  '....V................V.........',
  '...c.V..v..........v.V.c........',
  '.......T........................',
  '..C....T..G........G..T....C....',
  '.......G..v........v..G.........',
  '....v...G..v......v..G...v......',
  '.p....V...G........G...V....p...',
  '.....T.....G......G.....T.......',
  'C.........T..G..G..T.........C.',
  '...........T..GG..T.............',
  'C...........TGTGT...........C..',
  '.............TGT...............',
  'C...........TGTGT...........C..',
  '...........T..GG..T.............',
  'C.........T..G..G..T.........C.',
  '.....T.....G......G.....T.......',
  '.p....V...G........G...V....p...',
  '....v...G..v......v..G...v......',
  '.......G..v........v..G.........',
  '..C....T..G........G..T....C....',
  '.......T........................',
  '...c.V..v..........v.V.c........',
  '....V................V.........',
  '.C......................C.......',
  '..C.c..............c.C..........',
  '...............................',
  '................................',
  '................................',
];

function gridToRgba(size) {
  const src = 32;
  const data = Buffer.alloc(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const sx = Math.floor((x / size) * src);
      const sy = Math.floor((y / size) * src);
      const ch = GRID[sy]?.[sx] ?? '.';
      const rgba = COLORS[ch] ?? COLORS['.'];
      const i = (y * size + x) * 4;
      data[i] = rgba[0];
      data[i + 1] = rgba[1];
      data[i + 2] = rgba[2];
      data[i + 3] = rgba[3];
    }
  }
  return data;
}

function renderPng(size) {
  const png = new PNG({ width: size, height: size });
  png.data = gridToRgba(size);
  return PNG.sync.write(png);
}

mkdirSync(assetsDir, { recursive: true });

const png256 = renderPng(256);
writeFileSync(join(assetsDir, 'icon.png'), png256);
console.log('Wrote assets/icon.png (256×256)');

const sizes = [16, 32, 48, 256];
const pngBuffers = sizes.map((s) => renderPng(s));
const ico = await pngToIco(pngBuffers);
writeFileSync(join(assetsDir, 'icon.ico'), ico);
console.log(`Wrote assets/icon.ico (${sizes.join(', ')} px)`);
