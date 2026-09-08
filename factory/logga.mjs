// Loggan och faviconen ur brand-configen: rund emblem (mörk cirkel +
// ordmärket i versaler, spärrat, vitt) och en cirkel med initialen.
// Samma konstruktion som HeimGuard (Axels regel: rund logga, brandnamnet,
// seriöst) — färgerna kommer ur butikens EGEN branding, aldrig förra butikens.
//
//   node factory/logga.mjs factory/butiker/<butik>.yaml [--ut <mapp>]
//
// Skriver <mapp>/<id>-logga.png (1024²) + <id>-favicon.png (256²) och
// SVG-källorna bredvid. Rastreringen görs av sharp (librsvg) som ligger i
// pipeline/node_modules — kör `cd pipeline && npm install` en gång; molnet
// saknar qlmanage. Typsnittet är systemets DejaVu Sans Bold (finns i
// containern) — loggan är ett ordmärke, inte temats typsnitt.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { join, dirname } from 'node:path';
import { lasYaml } from './yaml.mjs';
import { hamtaTokens } from './branding.mjs';

const FACTORY_ROT = dirname(fileURLToPath(import.meta.url));

function sharpModul() {
  try {
    return createRequire(join(FACTORY_ROT, '..', 'pipeline', 'package.json'))('sharp');
  } catch {
    throw new Error('sharp saknas — kör `cd pipeline && npm install` (rastreringen bor där, fabriken själv har noll beroenden).');
  }
}

const eskapa = (s) => String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;');

// Ordmärket ska rymmas i cirkeln: bredden skalas efter antalet tecken.
export function loggaSvg(brand, { mork, text }) {
  const ord = String(brand).toUpperCase();
  const storlek = Math.min(150, Math.floor(760 / (ord.length * 0.72)));
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <circle cx="512" cy="512" r="512" fill="${mork}"/>
  <text x="512" y="512" text-anchor="middle" dominant-baseline="central"
        font-family="DejaVu Sans, Liberation Sans, Arial, sans-serif" font-weight="bold"
        font-size="${storlek}" letter-spacing="${Math.round(storlek * 0.08)}" fill="${text}">${eskapa(ord)}</text>
</svg>
`;
}

export function faviconSvg(brand, { mork, text }) {
  const initial = String(brand).trim().charAt(0).toUpperCase();
  return `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
  <circle cx="128" cy="128" r="128" fill="${mork}"/>
  <text x="128" y="132" text-anchor="middle" dominant-baseline="central"
        font-family="DejaVu Sans, Liberation Sans, Arial, sans-serif" font-weight="bold"
        font-size="160" fill="${text}">${eskapa(initial)}</text>
</svg>
`;
}

export async function byggLogga(butiksfil, utMapp) {
  const butik = lasYaml(readFileSync(butiksfil, 'utf8'));
  const id = butik?.butik?.id;
  const brand = butik?.butik?.brand;
  if (!id || !brand) throw new Error('Butiksfilen saknar butik.id/butik.brand.');
  const t = hamtaTokens(butik.branding);
  const farger = { mork: t.farger.mork, text: t.farger.text_pa_mork };
  mkdirSync(utMapp, { recursive: true });

  const sharp = sharpModul();
  const filer = {};
  for (const [namn, svg, px] of [
    ['logga', loggaSvg(brand, farger), 1024],
    ['favicon', faviconSvg(brand, farger), 256],
  ]) {
    const svgFil = join(utMapp, `${id}-${namn}.svg`);
    const pngFil = join(utMapp, `${id}-${namn}.png`);
    writeFileSync(svgFil, svg);
    await sharp(Buffer.from(svg), { density: 144 }).resize(px, px).png().toFile(pngFil);
    filer[namn] = pngFil;
  }
  return filer;
}

async function huvud() {
  const arg = process.argv.slice(2);
  const butiksfil = arg.find((a) => !a.startsWith('--'));
  const ut = arg.includes('--ut') ? arg[arg.indexOf('--ut') + 1] : join(FACTORY_ROT, 'output', 'loggor');
  if (!butiksfil) {
    console.error('Användning: node factory/logga.mjs factory/butiker/<butik>.yaml [--ut <mapp>]');
    process.exit(1);
  }
  const filer = await byggLogga(butiksfil, ut);
  for (const [namn, fil] of Object.entries(filer)) console.log(`✅ ${namn}: ${fil}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  huvud().catch((e) => { console.error(`\n❌ ${e.message}\n`); process.exit(1); });
}
