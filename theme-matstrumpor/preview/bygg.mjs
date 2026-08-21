/* Bygger förhandsvisningen av produktsidan.
   Läser temats riktiga CSS och JS, så förhandsvisningen aldrig kan glida
   isär från det som faktiskt körs i butiken.

   node theme-matstrumpor/preview/bygg.mjs [sökväg till imgs.json]        */

import fs from 'node:fs';
import path from 'node:path';

const HERE = path.dirname(new URL(import.meta.url).pathname);
const THEME = path.resolve(HERE, '..');

const imgsPath = process.argv[2] || path.join(HERE, 'imgs.json');
if (!fs.existsSync(imgsPath)) {
  console.error(`Hittar inte ${imgsPath}.`);
  console.error('Se preview/README.md för hur bilderna hämtas och kodas.');
  process.exit(1);
}

const css = fs.readFileSync(path.join(THEME, 'assets/ms-cro.css'), 'utf8');
const js = fs.readFileSync(path.join(THEME, 'assets/ms-cro.js'), 'utf8');
const imgs = JSON.parse(fs.readFileSync(imgsPath, 'utf8'));

const out = fs.readFileSync(path.join(HERE, 'mall.html'), 'utf8')
  .replace('/*__MSCSS__*/', css)
  .replace('/*__MSJS__*/', js)
  .replace(/__IMG_HERO__/g, imgs.hero)
  .replace(/__IMG_B__/g, imgs.b)
  .replace(/__IMG_C__/g, imgs.c);

const dest = path.join(HERE, 'forhandsvisning.html');
fs.writeFileSync(dest, out);
console.log(`Byggd: ${dest} (${Math.round(out.length / 1024)} KB)`);
