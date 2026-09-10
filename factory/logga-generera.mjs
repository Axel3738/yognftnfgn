// logga-generera.mjs — loggan och faviconen ur brand-configen: TRE varianter,
// alla runda med brandnamnet (regeln: rund logga, brandnamnet, seriöst).
// Axels krav 2026-09-08: varianterna VISAS i chatten och Axel väljer innan
// något sätts i butiken (första TankGuard-loggan underkändes). Uppladdningen
// och temainställningen görs sedan av logga.mjs.
//
// Valfritt verktyg UTANFÖR kedjan (KEDJAN.md regel 5): det enda i factory/
// som får använda sharp, och det säger tydligt ifrån när sharp saknas.
// SVG-funktionerna (loggaSvgA/B/C, faviconSvg) är ren logik och går att
// köra utan sharp.
//
//   node factory/logga-generera.mjs factory/butiker/<butik>.yaml [--ut <mapp>] [--variant a|b|c] [--tagline "…"] [--motiv droppe|lucka|ingen]
//
// Utan --variant skrivs alla tre: <id>-logga-a.png, -b.png, -c.png (1024²)
// + <id>-favicon.png (256²) + SVG-källorna. Färgerna kommer ur butikens EGEN
// branding, typsnittet ur branding.typografi.rubriker (Shopify-handle, t.ex.
// archivo_n7 → "Archivo" bold) — typsnittet måste finnas i systemet
// (ladda ner TTF från jsDelivrs spegel av google/fonts till ~/.fonts och kör
// fc-cache). Rastreringen görs av sharp (librsvg) ur pipeline/node_modules.
//
//   a — emblem: mörk disk, tunn ring, ordmärket spärrat, droppe ovanför
//   b — sigill: ljus disk med mörk ring, ordmärket i två rader (TANK / GUARD)
//   c — monogram: mörk disk, stor initialkombination, ordmärket litet under

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { join, dirname } from 'node:path';
import { lasYaml } from './yaml.mjs';
import { hamtaTokens } from './branding.mjs';

const FACTORY_ROT = dirname(fileURLToPath(import.meta.url));

// sharp bor i pipeline/node_modules — fabriken själv har noll beroenden.
export function sharpModul() {
  try {
    return createRequire(join(FACTORY_ROT, '..', 'pipeline', 'package.json'))('sharp');
  } catch {
    throw new Error(
      'sharp saknas — logga-generera.mjs kan inte rastrera PNG utan det. Kör `cd pipeline && npm install` en gång ' +
        '(rastreringen bor där, fabriken själv har noll beroenden). SVG-källorna går att bygga utan sharp: byggLoggaSvg().'
    );
  }
}

const eskapa = (s) => String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;');

// "archivo_n7" → { familj: "Archivo", vikt: 700 }
export function typsnittUrHandle(handle) {
  const m = String(handle ?? '').match(/^([a-z0-9_]+?)_n(\d)$/i);
  if (!m) return { familj: 'DejaVu Sans', vikt: 700 };
  const familj = m[1].split('_').map((d) => d.charAt(0).toUpperCase() + d.slice(1)).join(' ');
  return { familj, vikt: Number(m[2]) * 100 };
}

const DROPPE = (cx, cy, r, fill) =>
  `<path d="M${cx} ${cy - r * 1.35} C${cx + r * 0.9} ${cy - r * 0.25} ${cx + r} ${cy + r * 0.15} ${cx + r} ${cy + r * 0.35} A${r} ${r} 0 1 1 ${cx - r} ${cy + r * 0.35} C${cx - r} ${cy + r * 0.15} ${cx - r * 0.9} ${cy - r * 0.25} ${cx} ${cy - r * 1.35} Z" fill="${fill}"/>`;

// En öppnad kalenderlucka: fyrkantig ram, tonad öppning och en flik som
// svängts ut åt höger (AdventLane 2026-09-10 — droppen är TankGuards motiv,
// en kalenderbutik behöver sitt eget). `ram` = ramens färg, `flik` = flikens.
const LUCKA = (cx, cy, r, ram, flik) => {
  const x = cx - r;
  const y = cy - r;
  const s = r * 2;
  const fx = x + r * 0.34;
  const fy = y + r * 0.34;
  const iw = r * 1.32;
  const n = (v) => Math.round(v * 10) / 10;
  return (
    `<rect x="${n(x)}" y="${n(y)}" width="${n(s)}" height="${n(s)}" rx="${n(r * 0.2)}" fill="none" stroke="${ram}" stroke-width="${n(r * 0.14)}"/>` +
    `<rect x="${n(fx)}" y="${n(fy)}" width="${n(iw)}" height="${n(iw)}" rx="${n(r * 0.08)}" fill="${ram}" fill-opacity="0.22"/>` +
    `<path d="M${n(fx)} ${n(fy)} L${n(fx + iw * 0.64)} ${n(fy - iw * 0.24)} L${n(fx + iw * 0.64)} ${n(fy + iw * 0.76)} L${n(fx)} ${n(fy + iw)} Z" fill="${flik}"/>`
  );
};

// Motivet ovanför ordmärket. droppe = standard (bakåtkompatibelt), lucka =
// kalenderlucka, ingen = bara ordmärket. Väljs med --motiv eller
// byggLoggaSvg(..., { motiv }).
export const MOTIV = {
  droppe: (cx, cy, r, { fill }) => DROPPE(cx, cy, r, fill),
  lucka: (cx, cy, r, { ram, flik }) => LUCKA(cx, cy, r, ram, flik),
  ingen: () => '',
};
const motivFn = (t) => t?.motiv ?? MOTIV.droppe;

function font(t) {
  const f = typsnittUrHandle(t.typografi?.rubriker);
  return `font-family="${f.familj}, DejaVu Sans, sans-serif" font-weight="${f.vikt}"`;
}

// Bredd på ordmärket styr storleken: rymms inom ~74 % av diametern.
function ordStorlek(ord, maxBredd, faktor = 0.68) {
  return Math.floor(maxBredd / (ord.length * faktor));
}

export function loggaSvgA(brand, t) {
  const f = t.farger;
  const ord = String(brand).toUpperCase();
  const size = Math.min(140, ordStorlek(ord, 740));
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <circle cx="512" cy="512" r="512" fill="${f.mork}"/>
  <circle cx="512" cy="512" r="452" fill="none" stroke="${f.text_pa_mork}" stroke-opacity="0.35" stroke-width="6"/>
  ${motivFn(t)(512, 372, 46, { fill: f.text_pa_mork, ram: f.text_pa_mork, flik: f.accent })}
  <text x="512" y="548" text-anchor="middle" dominant-baseline="central" ${font(t)}
        font-size="${size}" letter-spacing="${Math.round(size * 0.1)}" fill="${f.text_pa_mork}">${eskapa(ord)}</text>
  <text x="512" y="660" text-anchor="middle" dominant-baseline="central" ${font(t)}
        font-size="30" letter-spacing="9" fill="${f.text_pa_mork}" fill-opacity="0.7">${eskapa(t.tagline ?? '')}</text>
</svg>
`;
}

// "TankGuard" → ["Tank", "Guard"] (kamelnotation), "Hemvakten" → ["Hemvakten"].
export function orddelar(brand) {
  const delar = String(brand).match(/[A-ZÅÄÖ][a-zåäö]+|[A-ZÅÄÖ]+(?![a-zåäö])|[a-zåäö]+/g) ?? [String(brand)];
  return delar.map((d) => d.toUpperCase());
}

export function loggaSvgB(brand, t) {
  const f = t.farger;
  const delar = orddelar(brand);
  const langsta = delar.reduce((a, b) => (b.length > a.length ? b : a), '');
  const size = Math.min(190, ordStorlek(langsta, 600, 0.7));
  const startY = delar.length === 1 ? 540 : 512 - ((delar.length - 1) * (size + 20)) / 2 + 20;
  const rader = delar
    .map((d, i) => `<text x="512" y="${startY + i * (size + 20)}" text-anchor="middle" dominant-baseline="central" ${font(t)} font-size="${size}" letter-spacing="${Math.round(size * 0.06)}" fill="${f.mork}">${eskapa(d)}</text>`)
    .join('\n  ');
  const sistaY = startY + (delar.length - 1) * (size + 20) + size * 0.62;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <circle cx="512" cy="512" r="512" fill="${f.yta}"/>
  <circle cx="512" cy="512" r="470" fill="none" stroke="${f.mork}" stroke-width="34"/>
  ${motivFn(t)(512, startY - size * 0.62 - 60, 30, { fill: f.accent, ram: f.mork, flik: f.accent })}
  ${rader}
  <line x1="392" y1="${sistaY + 34}" x2="632" y2="${sistaY + 34}" stroke="${f.accent}" stroke-width="8" stroke-linecap="round"/>
</svg>
`;
}

export function loggaSvgC(brand, t) {
  const f = t.farger;
  const ord = String(brand).toUpperCase();
  const delar = orddelar(brand);
  const monogram = delar.length >= 2 ? delar[0][0] + delar[1][0] : ord.slice(0, 2);
  const size = Math.min(110, ordStorlek(ord, 600));
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <circle cx="512" cy="512" r="512" fill="${f.mork}"/>
  <circle cx="512" cy="512" r="464" fill="none" stroke="${f.text_pa_mork}" stroke-opacity="0.3" stroke-width="4"/>
  <text x="512" y="452" text-anchor="middle" dominant-baseline="central" ${font(t)}
        font-size="400" letter-spacing="-12" fill="${f.text_pa_mork}">${eskapa(monogram)}</text>
  <line x1="332" y1="640" x2="692" y2="640" stroke="${f.text_pa_mork}" stroke-opacity="0.45" stroke-width="5" stroke-linecap="round"/>
  <text x="512" y="712" text-anchor="middle" dominant-baseline="central" ${font(t)}
        font-size="${size}" letter-spacing="${Math.round(size * 0.14)}" fill="${f.text_pa_mork}">${eskapa(ord)}</text>
</svg>
`;
}

export function faviconSvg(brand, t) {
  const f = t.farger;
  const initial = String(brand).trim().charAt(0).toUpperCase();
  // Med ett eget motiv (lucka) bär faviconen motivet ensamt — annars initialen.
  const inre =
    t.motivNamn && t.motivNamn !== 'droppe' && t.motivNamn !== 'ingen'
      ? motivFn(t)(128, 128, 78, { fill: f.text_pa_mork, ram: f.text_pa_mork, flik: f.accent })
      : `<text x="128" y="134" text-anchor="middle" dominant-baseline="central" ${font(t)}
        font-size="170" fill="${f.text_pa_mork}">${eskapa(initial)}</text>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
  <circle cx="128" cy="128" r="128" fill="${f.mork}"/>
  ${inre}
</svg>
`;
}

export const VARIANTER = { a: loggaSvgA, b: loggaSvgB, c: loggaSvgC };

// Ren logik utan sharp: SVG-källorna för varianterna + faviconen.
// → [{ namn: 'logga-a' | … | 'favicon', svg, px }]
export function byggLoggaSvg(butik, { variant = null, tagline = '', motiv = 'droppe' } = {}) {
  const brand = butik?.butik?.brand;
  if (!brand) throw new Error('Butiksfilen saknar butik.brand.');
  if (!MOTIV[motiv]) throw new Error(`Okänt motiv "${motiv}" — välj ${Object.keys(MOTIV).join(', ')}.`);
  const t = { ...hamtaTokens(butik.branding), tagline, motiv: MOTIV[motiv], motivNamn: motiv };
  return [
    ...Object.entries(VARIANTER)
      .filter(([v]) => !variant || v === variant)
      .map(([v, fn]) => ({ namn: `logga-${v}`, svg: fn(brand, t), px: 1024 })),
    { namn: 'favicon', svg: faviconSvg(brand, t), px: 256 },
  ];
}

export async function byggLogga(butiksfil, utMapp, { variant = null, tagline = '', motiv = 'droppe' } = {}) {
  const butik = lasYaml(readFileSync(butiksfil, 'utf8'));
  const id = butik?.butik?.id;
  if (!id || !butik?.butik?.brand) throw new Error('Butiksfilen saknar butik.id/butik.brand.');
  const jobb = byggLoggaSvg(butik, { variant, tagline, motiv }).map((j) => [j.namn, j.svg, j.px]);
  mkdirSync(utMapp, { recursive: true });

  const sharp = sharpModul();
  const filer = {};
  for (const [namn, svg, px] of jobb) {
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
  const butiksfil = arg.find((a) => !a.startsWith('--') && a.endsWith('.yaml'));
  const ut = arg.includes('--ut') ? arg[arg.indexOf('--ut') + 1] : join(FACTORY_ROT, 'output', 'loggor');
  const variant = arg.includes('--variant') ? arg[arg.indexOf('--variant') + 1] : null;
  const tagline = arg.includes('--tagline') ? arg[arg.indexOf('--tagline') + 1] : '';
  const motiv = arg.includes('--motiv') ? arg[arg.indexOf('--motiv') + 1] : 'droppe';
  if (!butiksfil) {
    console.error('Användning: node factory/logga-generera.mjs factory/butiker/<butik>.yaml [--ut <mapp>] [--variant a|b|c] [--tagline "…"] [--motiv droppe|lucka|ingen]');
    process.exit(1);
  }
  const filer = await byggLogga(butiksfil, ut, { variant, tagline, motiv });
  for (const [namn, fil] of Object.entries(filer)) console.log(`✅ ${namn}: ${fil}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  huvud().catch((e) => { console.error(`\n❌ ${e.message}\n`); process.exit(1); });
}
