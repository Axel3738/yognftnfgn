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
//   node factory/logga-generera.mjs factory/butiker/<butik>.yaml [--ut <mapp>] [--variant a|b|c] [--tagline "…"] [--motiv droppe|lucka|koja|ingen]
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
//
// Har brandet ett EGET motiv (lucka, tak, koja, motor …) byts alla tre mot
// motiv-ledda kompositioner — c sedan 2026-09-11, a och b sedan 2026-09-12,
// för LOGGA-FEEDBACK.md visade att a och b aldrig valts i tre butiker i rad:
//   a — band: motivet stort på mörk disk, ordmärket på ett accentband nedtill
//   b — badge: ljus disk med mörk ring, motivet i mitten, ordmärket böjt
//   c — motivet stort, ordmärket litet under en tunn linje

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

// Ett tak under skydd: husvagnens flacka taklinje som en bred båge, ovanpå
// den överdraget som en tjockare båge i accentfärgen, och två spännband som
// hänger ner från kanten (CaraShell 2026-09-10 — loggfeedbacken sa att a och
// b aldrig valts med de gamla motiven, så butiken fick ett eget motiv i
// stället för att visa samma gissningar igen). `ram` = taklinjen och banden,
// `flik` = överdraget.
const TAK = (cx, cy, r, ram, flik) => {
  const n = (v) => Math.round(v * 10) / 10;
  const w = r * 1.9;
  const x1 = cx - w;
  const x2 = cx + w;
  const lyft = r * 0.55;
  return (
    // överdraget: tjock båge över taket
    `<path d="M${n(x1)} ${n(cy)} Q${n(cx)} ${n(cy - lyft * 2)} ${n(x2)} ${n(cy)}" fill="none" stroke="${flik}" stroke-width="${n(r * 0.42)}" stroke-linecap="round"/>` +
    // taklinjen: tunn linje strax under
    `<path d="M${n(x1 + r * 0.25)} ${n(cy + r * 0.45)} Q${n(cx)} ${n(cy - lyft * 1.1)} ${n(x2 - r * 0.25)} ${n(cy + r * 0.45)}" fill="none" stroke="${ram}" stroke-width="${n(r * 0.12)}" stroke-linecap="round"/>` +
    // två spännband som hänger ner från kanten
    `<path d="M${n(x1 + r * 0.05)} ${n(cy + r * 0.1)} L${n(x1 + r * 0.05)} ${n(cy + r * 1.05)}" stroke="${ram}" stroke-width="${n(r * 0.12)}" stroke-linecap="round"/>` +
    `<path d="M${n(x2 - r * 0.05)} ${n(cy + r * 0.1)} L${n(x2 - r * 0.05)} ${n(cy + r * 1.05)}" stroke="${ram}" stroke-width="${n(r * 0.12)}" stroke-linecap="round"/>`
  );
};

// En utekattkoja på ben (CatCabin 2026-09-11): sadeltak som skjuter ut över
// gaveln, kroppen under, en välvd ingång som LYSER i accentfärgen (ljuset i
// köksfönstret på kvällsbilden — livet i loggan) och två ben, för "står på
// ben" är produktens första egenskap. `ram` = kojans färg, `flik` = dörrens.
const KOJA = (cx, cy, r, ram, flik) => {
  const n = (v) => Math.round(v * 10) / 10;
  const p = (x, y) => `${n(cx + x * r)} ${n(cy + y * r)}`;
  // Taket som en vinkel med tjocklek: apex uppe, takfot utanför kroppen.
  const tak = `M${p(-1.2, -0.15)} L${p(0, -1.2)} L${p(1.2, -0.15)} L${p(1.2, 0.05)} L${p(0, -1.0)} L${p(-1.2, 0.05)} Z`;
  // Dörren: rak nederkant, välvd överkant.
  const dorr = `M${p(-0.31, 0.95)} L${p(-0.31, 0.45)} A${n(0.31 * r)} ${n(0.31 * r)} 0 0 1 ${p(0.31, 0.45)} L${p(0.31, 0.95)} Z`;
  return (
    `<g class="koja">` +
    `<rect x="${n(cx - 0.85 * r)}" y="${n(cy - 0.35 * r)}" width="${n(1.7 * r)}" height="${n(1.3 * r)}" fill="${ram}"/>` +
    `<path d="${tak}" fill="${ram}"/>` +
    `<path d="${dorr}" fill="${flik}"/>` +
    `<rect x="${n(cx - 0.75 * r)}" y="${n(cy + 0.95 * r)}" width="${n(0.13 * r)}" height="${n(0.32 * r)}" rx="${n(0.04 * r)}" fill="${ram}"/>` +
    `<rect x="${n(cx + 0.62 * r)}" y="${n(cy + 0.95 * r)}" width="${n(0.13 * r)}" height="${n(0.32 * r)}" rx="${n(0.04 * r)}" fill="${ram}"/>` +
    `</g>`
  );
};

// En övertäckt utombordare (FjordCover 2026-09-12): produktbildens egen
// silhuett — bred rundad kåpa upptill, insvängd midja, och foten som skjuter
// ut framåt nedtill. Över midjan sitter spännremmen i accentfärgen med sitt
// spänne, för remmen är det enda kunden gör: dra över, spänn fast.
// `ram` = skyddets färg, `flik` = remmens.
const MOTOR = (cx, cy, r, ram, flik) => {
  const n = (v) => Math.round(v * 10) / 10;
  const p = (x, y) => `${n(cx + x * r)} ${n(cy + y * r)}`;
  const kropp =
    `M${p(-0.6, -0.92)} Q${p(-0.7, -1.24)} ${p(-0.3, -1.26)} ` +
    `L${p(0.3, -1.26)} Q${p(0.7, -1.24)} ${p(0.6, -0.92)} ` +
    `L${p(0.4, -0.02)} L${p(0.34, 0.34)} ` +
    `L${p(0.78, 0.62)} L${p(0.88, 0.9)} L${p(0.5, 1.04)} ` +
    `L${p(0.02, 1.02)} Q${p(-0.2, 1.0)} ${p(-0.28, 0.78)} ` +
    `L${p(-0.4, 0.34)} L${p(-0.44, -0.02)} Z`;
  // TVÅ remmar, som på produktbilden: en över kåpan och en om midjan. Med
  // bara midjeremmen läses silhuetten som en stövel (avläst i första
  // renderingen 2026-09-12) — den övre remmen gör den till ett överdrag.
  const rem = (y, halvbredd, spanne) =>
    `<rect x="${n(cx - halvbredd * r)}" y="${n(cy + y * r)}" width="${n(2 * halvbredd * r)}" height="${n(0.15 * r)}" rx="${n(0.035 * r)}" fill="${flik}"/>` +
    (spanne
      ? `<rect x="${n(cx - 0.12 * r)}" y="${n(cy + (y - 0.07) * r)}" width="${n(0.26 * r)}" height="${n(0.29 * r)}" rx="${n(0.05 * r)}" fill="${flik}"/>` +
        `<rect x="${n(cx - 0.05 * r)}" y="${n(cy + (y + 0.01) * r)}" width="${n(0.12 * r)}" height="${n(0.15 * r)}" rx="${n(0.03 * r)}" fill="${ram}"/>`
      : '');
  return (
    `<g class="motor">` +
    `<path d="${kropp}" fill="${ram}"/>` +
    rem(-0.72, 0.66, false) +
    rem(0.06, 0.56, true) +
    `</g>`
  );
};

// Motivet ovanför ordmärket. droppe = standard (bakåtkompatibelt), lucka =
// kalenderlucka, tak = husvagnstak under överdrag, koja = utekattkoja på ben,
// motor = övertäckt utombordare, ingen = bara ordmärket.
// Väljs med --motiv eller byggLoggaSvg(..., { motiv }).
export const MOTIV = {
  droppe: (cx, cy, r, { fill }) => DROPPE(cx, cy, r, fill),
  lucka: (cx, cy, r, { ram, flik }) => LUCKA(cx, cy, r, ram, flik),
  tak: (cx, cy, r, { ram, flik }) => TAK(cx, cy, r, ram, flik),
  koja: (cx, cy, r, { ram, flik }) => KOJA(cx, cy, r, ram, flik),
  motor: (cx, cy, r, { ram, flik }) => MOTOR(cx, cy, r, ram, flik),
  ingen: () => '',
};

// Har brandet ett EGET motiv (inte standarddroppen, inte tomt)? Då bär
// faviconen motivet ensamt och variant c blir motivet stort med ordmärket
// litet under — i stället för monogrammet, som aldrig valts
// (factory/LOGGA-FEEDBACK.md, 2026-09-11).
const egetMotiv = (t) => Boolean(t?.motivNamn) && t.motivNamn !== 'droppe' && t.motivNamn !== 'ingen';
const motivFn = (t) => t?.motiv ?? MOTIV.droppe;

function font(t) {
  const f = typsnittUrHandle(t.typografi?.rubriker);
  return `font-family="${f.familj}, DejaVu Sans, sans-serif" font-weight="${f.vikt}"`;
}

// Bredd på ordmärket styr storleken: rymms inom ~74 % av diametern.
function ordStorlek(ord, maxBredd, faktor = 0.68) {
  return Math.floor(maxBredd / (ord.length * faktor));
}

// Variant a med ett EGET motiv (FjordCover 2026-09-12): motivet stort på mörk
// disk och ordmärket på ett massivt accentband tvärs över nederdelen. Den
// gamla a:n (litet motiv + spärrat ordmärke + tagline) valdes aldrig i tre
// butiker i rad — LOGGA-FEEDBACK.md säger att den ska bytas, inte visas igen.
function loggaSvgABand(brand, t) {
  const f = t.farger;
  const ord = String(brand).toUpperCase();
  const size = Math.min(112, ordStorlek(ord, 660));
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <defs><clipPath id="disk"><circle cx="512" cy="512" r="512"/></clipPath></defs>
  <circle cx="512" cy="512" r="512" fill="${f.mork}"/>
  ${motivFn(t)(512, 400, 190, { fill: f.text_pa_mork, ram: f.text_pa_mork, flik: f.accent })}
  <rect x="0" y="700" width="1024" height="176" fill="${f.accent}" clip-path="url(#disk)"/>
  <text x="512" y="792" text-anchor="middle" dominant-baseline="central" ${font(t)}
        font-size="${size}" letter-spacing="${Math.round(size * 0.1)}" fill="${f.accent_text ?? '#FFFFFF'}">${eskapa(ord)}</text>
</svg>
`;
}

// Variant b med ett eget motiv: LJUS disk med kraftig mörk ring, motivet i
// mitten och ordmärket på EN rad under, med ett accentstreck under det.
// Ersätter den gamla b:n — ordet delat på två rader — som heller aldrig valts.
//
// ⚠️ Ordmärket böjdes först längs ringen med <textPath>. librsvg (sharp)
// ritar inte textPath alls — varken med href eller xlink:href — så PNG:en
// kom ut utan brandnamn (mätt 2026-09-12 på FjordCover, två renderingar).
// Böj aldrig text i de här loggorna: det syns i webbläsaren och försvinner
// i filen som faktiskt laddas upp.
function loggaSvgBBadge(brand, t) {
  const f = t.farger;
  const ord = String(brand).toUpperCase();
  const size = Math.min(104, ordStorlek(ord, 620));
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <circle cx="512" cy="512" r="512" fill="${f.yta}"/>
  <circle cx="512" cy="512" r="474" fill="none" stroke="${f.mork}" stroke-width="26"/>
  ${motivFn(t)(512, 412, 186, { fill: f.mork, ram: f.mork, flik: f.accent })}
  <text x="512" y="${Math.round(700 + size * 0.5)}" text-anchor="middle" dominant-baseline="central" ${font(t)}
        font-size="${size}" letter-spacing="${Math.round(size * 0.12)}" fill="${f.mork}">${eskapa(ord)}</text>
  <line x1="392" y1="${Math.round(700 + size * 1.2)}" x2="632" y2="${Math.round(700 + size * 1.2)}" stroke="${f.accent}" stroke-width="12" stroke-linecap="round"/>
</svg>
`;
}

export function loggaSvgA(brand, t) {
  if (egetMotiv(t)) return loggaSvgABand(brand, t);
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
  if (egetMotiv(t)) return loggaSvgBBadge(brand, t);
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
  // Eget motiv (lucka, koja …): motivet stort i stället för monogrammet.
  const ovre = egetMotiv(t)
    ? motivFn(t)(512, 400, 150, { fill: f.text_pa_mork, ram: f.text_pa_mork, flik: f.accent })
    : `<text x="512" y="452" text-anchor="middle" dominant-baseline="central" ${font(t)}
        font-size="400" letter-spacing="-12" fill="${f.text_pa_mork}">${eskapa(monogram)}</text>`;
  // Luften mellan linjen och ordmärket skalas med grader: en smal display-
  // grotesk (Oswald) har högre versaler för samma font-size och skar rakt
  // igenom linjen på 672/744 (mätt 2026-09-12).
  const linjeY = egetMotiv(t) ? 658 : 640;
  const ordY = egetMotiv(t) ? Math.round(linjeY + 60 + size * 0.5) : 712;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <circle cx="512" cy="512" r="512" fill="${f.mork}"/>
  <circle cx="512" cy="512" r="464" fill="none" stroke="${f.text_pa_mork}" stroke-opacity="0.3" stroke-width="4"/>
  ${ovre}
  <line x1="332" y1="${linjeY}" x2="692" y2="${linjeY}" stroke="${f.text_pa_mork}" stroke-opacity="0.45" stroke-width="5" stroke-linecap="round"/>
  <text x="512" y="${ordY}" text-anchor="middle" dominant-baseline="central" ${font(t)}
        font-size="${size}" letter-spacing="${Math.round(size * 0.14)}" fill="${f.text_pa_mork}">${eskapa(ord)}</text>
</svg>
`;
}

export function faviconSvg(brand, t) {
  const f = t.farger;
  const initial = String(brand).trim().charAt(0).toUpperCase();
  // Med ett eget motiv (lucka, koja) bär faviconen motivet ensamt — annars initialen.
  const inre =
    egetMotiv(t)
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
    console.error('Användning: node factory/logga-generera.mjs factory/butiker/<butik>.yaml [--ut <mapp>] [--variant a|b|c] [--tagline "…"] [--motiv droppe|lucka|tak|koja|ingen]');
    process.exit(1);
  }
  const filer = await byggLogga(butiksfil, ut, { variant, tagline, motiv });
  for (const [namn, fil] of Object.entries(filer)) console.log(`✅ ${namn}: ${fil}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  huvud().catch((e) => { console.error(`\n❌ ${e.message}\n`); process.exit(1); });
}
