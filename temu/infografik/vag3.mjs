#!/usr/bin/env node
// Våg 3 + båtmotorskydd: Temu-galleriets infografiker med skarp vektortext på
// marknadens språk (sharp-metoden — aldrig AI-textbyte). Källbilder: Axels
// zip-uppladdningar 2026-08-21, /tmp/fix/galleri/<produkt>/.
//
//   node temu/infografik/vag3.mjs <sv|no|da|fi|en> [utmapp] [källmapp]
//
// Bygger: <ut>/<lang>-batmotor-tabell.jpg, <lang>-mc-matt.jpg,
// <lang>-dorrlist-matt.jpg, <lang>-kranskydd-matt.jpg, <lang>-plysch-memory.jpg
// UK behöver inte genereras — engelska originalen används rakt av.

import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import path from 'path';

const HAR = path.dirname(fileURLToPath(import.meta.url));
const ROT = path.resolve(HAR, '..', '..');
const sharp = createRequire(path.join(ROT, 'pipeline', 'x.js'))('sharp');

const SPRAK = {
  sv: {
    tabellRubrik: 'Storleksguide – utombordarskydd',
    kol: ['Motor', 'Omkrets', 'Höjd'],
    hk: 'hk',
    tabellNot1: 'Omkrets mäts runt motorkåpan.',
    tabellNot2: 'Måtten är cirka och kan avvika något.',
    mattskiss: 'MÅTTSKISS',
    kranRubrik: 'Större och tjockare',
    kranSub1: 'Ca 1–2 tum större än andra kranskydd –',
    kranSub2: 'täcker hela kranen ända in till väggen',
    memory: 'Memoryskum',
    memorySub: 'Mjuk innersula som formar sig efter foten.',
    mjuk: 'Mjuk',
    plata: 'Platåsula',
  },
  no: {
    tabellRubrik: 'Størrelsesguide – motortrekk',
    kol: ['Motor', 'Omkrets', 'Høyde'],
    hk: 'hk',
    tabellNot1: 'Omkretsen måles rundt motordekselet.',
    tabellNot2: 'Målene er cirka.',
    mattskiss: 'MÅLSKISSE',
    kranRubrik: 'Større og tykkere',
    kranSub1: 'Ca. 1–2 tommer større enn andre kranbeskyttere –',
    kranSub2: 'dekker hele kranen helt inn til veggen',
    memory: 'Memoryskum',
    memorySub: 'Myk innersåle som former seg etter foten.',
    mjuk: 'Myk',
    plata: 'Platåsåle',
  },
  da: {
    tabellRubrik: 'Størrelsesguide – motorcover',
    kol: ['Motor', 'Omkreds', 'Højde'],
    hk: 'hk',
    tabellNot1: 'Omkredsen måles rundt motorhjelmen.',
    tabellNot2: 'Målene er cirka.',
    mattskiss: 'MÅLSKITSE',
    kranRubrik: 'Større og tykkere',
    kranSub1: 'Ca. 1–2 tommer større end andre hanebeskyttere –',
    kranSub2: 'dækker hele hanen helt ind til væggen',
    memory: 'Memoryskum',
    memorySub: 'Blød indersål der former sig efter foden.',
    mjuk: 'Blød',
    plata: 'Platåsål',
  },
  en: {
    tabellRubrik: 'Size guide – outboard motor cover',
    kol: ['Motor', 'Perimeter', 'Height'],
    hk: 'HP',
    tabellNot1: 'Perimeter is measured around the cowling.',
    tabellNot2: 'Measurements are approximate.',
    mattskiss: 'DIMENSIONS',
    kranRubrik: 'Bigger and thicker',
    kranSub1: 'About 1–2 inches larger than other tap covers –',
    kranSub2: 'covers the whole tap right up to the wall',
    memory: 'Memory Foam',
    memorySub: 'Soft insole that moulds to your foot.',
    mjuk: 'Soft',
    plata: 'Platform sole',
  },
  fi: {
    tabellRubrik: 'Kokotaulukko – moottorisuoja',
    kol: ['Moottori', 'Ympärys', 'Korkeus'],
    hk: 'hv',
    tabellNot1: 'Ympärys mitataan moottorikotelon ympäri.',
    tabellNot2: 'Mitat ovat likimääräisiä.',
    mattskiss: 'MITTAKUVA',
    kranRubrik: 'Suurempi ja paksumpi',
    kranSub1: 'Noin 1–2 tuumaa suurempi kuin muut hanasuojat –',
    kranSub2: 'peittää koko hanan seinään asti',
    memory: 'Memory-vaahto',
    memorySub: 'Pehmeä pohjallinen, joka muotoutuu jalan mukaan.',
    mjuk: 'Pehmeä',
    plata: 'Korotettu pohja',
  },
};

const TABELL = [
  ['6–15', '140 cm', '115 cm'],
  ['15–20', '150 cm', '130 cm'],
  ['20–30', '165 cm', '142 cm'],
  ['30–60', '180 cm', '149 cm'],
  ['60–100', '200 cm', '175 cm'],
  ['100–150', '226 cm', '195 cm'],
  ['175–225', '248 cm', '200 cm'],
];

const [lang, utmapp = '/tmp/fix', kallmapp = '/tmp/fix/galleri'] = process.argv.slice(2);
const T = SPRAK[lang];
if (!T) {
  console.error('Användning: node temu/infografik/vag3.mjs <sv|no|da|fi|en> [utmapp] [källmapp]');
  process.exit(1);
}
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const F = 'Liberation Sans';

// ---------- 1) Båtmotorskydd: storlekstabell (helt ombyggd, 1080×1080) ----------
async function batTabell() {
  const foto = await sharp(path.join(kallmapp, 'batmotorskydd', 'galleri-02.jpg'))
    .extract({ left: 665, top: 730, width: 340, height: 850 })
    .resize(300, 750)
    .toBuffer();
  const RAD = 82, TOPP = 200;
  const rader = TABELL.map((r, i) => {
    const y = TOPP + (i + 1) * RAD;
    return `<rect x="40" y="${y}" width="620" height="${RAD}" fill="${i % 2 ? '#f4f4f4' : '#ffffff'}" stroke="#d8d8d8"/>
      <text x="180" y="${y + 52}" text-anchor="middle" font-family="${F}" font-weight="bold" font-size="34" fill="#222">${r[0]} ${T.hk}</text>
      <text x="430" y="${y + 52}" text-anchor="middle" font-family="${F}" font-size="34" fill="#222">${r[1]}</text>
      <text x="580" y="${y + 52}" text-anchor="middle" font-family="${F}" font-size="34" fill="#222">${r[2]}</text>`;
  }).join('');
  const svg = `<svg width="1080" height="1080" xmlns="http://www.w3.org/2000/svg">
    <rect width="1080" height="1080" fill="#ffffff"/>
    <rect x="40" y="55" width="1000" height="90" rx="14" fill="#f08a00"/>
    <text x="540" y="117" text-anchor="middle" font-family="${F}" font-weight="bold" font-size="46" fill="#ffffff">${esc(T.tabellRubrik)}</text>
    <rect x="40" y="${TOPP}" width="620" height="${RAD}" fill="#2b2b2b"/>
    <text x="180" y="${TOPP + 52}" text-anchor="middle" font-family="${F}" font-weight="bold" font-size="32" fill="#fff">${esc(T.kol[0])}</text>
    <text x="430" y="${TOPP + 52}" text-anchor="middle" font-family="${F}" font-weight="bold" font-size="32" fill="#fff">${esc(T.kol[1])}</text>
    <text x="580" y="${TOPP + 52}" text-anchor="middle" font-family="${F}" font-weight="bold" font-size="32" fill="#fff">${esc(T.kol[2])}</text>
    ${rader}
    <text x="40" y="${TOPP + 8 * RAD + 62}" font-family="${F}" font-size="27" fill="#777">${esc(T.tabellNot1)}</text>
    <text x="40" y="${TOPP + 8 * RAD + 100}" font-family="${F}" font-size="27" fill="#777">${esc(T.tabellNot2)}</text>
  </svg>`;
  return sharp(Buffer.from(svg))
    .composite([{ input: foto, left: 730, top: 200 }])
    .jpeg({ quality: 92 });
}

// ---------- 2) MC-kapell: måttskiss (patch på originalet, 800×800) ----------
async function mcMatt() {
  const rot = (cx, cy, vinkel, w, h, fyll, text, storlek, farg) =>
    `<g transform="translate(${cx},${cy}) rotate(${vinkel})">
       <rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" fill="${fyll}" filter="url(#mjuk)"/>
       <text x="0" y="${storlek / 3}" text-anchor="middle" font-family="${F}" font-weight="bold" font-size="${storlek}" fill="${farg}">${esc(text)}</text>
     </g>`;
  const svg = `<svg width="800" height="800" xmlns="http://www.w3.org/2000/svg">
    <defs><filter id="mjuk" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="4"/></filter></defs>
    <rect x="80" y="40" width="640" height="70" rx="10" fill="#1a72c8"/>
    <text x="400" y="90" text-anchor="middle" font-family="${F}" font-weight="bold" font-size="46" fill="#ffffff">${esc(T.mattskiss)}</text>
    ${rot(517, 219, 16, 280, 60, '#dceefa', '218 cm', 34, '#333')}
    ${rot(56, 408, -73, 280, 56, '#dceefa', '118,5 cm', 32, '#333')}
  </svg>`;
  return sharp(path.join(kallmapp, 'mckapell', 'galleri-02.jpg'))
    .composite([{ input: Buffer.from(svg) }])
    .jpeg({ quality: 92 });
}

// ---------- 3) Dörrlist: måttbild (patch, 800×800; siffror är språkneutrala) ----------
async function dorrMatt() {
  const svg = `<svg width="800" height="800" xmlns="http://www.w3.org/2000/svg">
    <defs><filter id="mjuk" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="5"/></filter></defs>
    <g transform="translate(170,332) rotate(-75)">
      <rect x="-250" y="-46" width="500" height="92" fill="#f6f4f1" filter="url(#mjuk)"/>
      <text x="0" y="17" text-anchor="middle" font-family="${F}" font-weight="bold" font-size="48" fill="#d92b2b">94 cm</text>
    </g>
    <g transform="translate(247,495) rotate(-15)">
      <rect x="-95" y="-46" width="190" height="92" rx="26" fill="#d92b2b"/>
      <text x="0" y="16" text-anchor="middle" font-family="${F}" font-weight="bold" font-size="46" fill="#ffffff">2 cm</text>
    </g>
    <rect x="655" y="480" width="140" height="90" fill="#f7f5f2"/>
    <text x="725" y="537" text-anchor="middle" font-family="${F}" font-weight="bold" font-size="40" fill="#d92b2b">3 cm</text>
    <rect x="270" y="630" width="260" height="56" fill="#f7f5f2"/>
    <text x="400" y="670" text-anchor="middle" font-family="${F}" font-weight="bold" font-size="40" fill="#d92b2b">8 cm</text>
  </svg>`;
  return sharp(path.join(kallmapp, 'dorrlist', 'galleri-03.jpg'))
    .composite([{ input: Buffer.from(svg) }])
    .jpeg({ quality: 92 });
}

// ---------- 4) Kranskydd: storleksbild (patch, 1600×1600) ----------
async function kranMatt() {
  const svg = `<svg width="1600" height="1600" xmlns="http://www.w3.org/2000/svg">
    <rect x="60" y="30" width="1480" height="250" fill="#fffffd"/>
    <text x="800" y="140" text-anchor="middle" font-family="${F}" font-weight="bold" font-size="110" fill="#f18902">${esc(T.kranRubrik)}</text>
    <text x="800" y="212" text-anchor="middle" font-family="${F}" font-size="44" fill="#555">${esc(T.kranSub1)}</text>
    <text x="800" y="266" text-anchor="middle" font-family="${F}" font-size="44" fill="#555">${esc(T.kranSub2)}</text>
    <rect x="120" y="580" width="140" height="290" fill="#fffffd"/>
    <g transform="translate(195,725) rotate(-90)">
      <text x="0" y="18" text-anchor="middle" font-family="${F}" font-weight="bold" font-size="52" fill="#333">14 cm</text>
    </g>
    <rect x="730" y="1085" width="300" height="125" fill="#fffffd"/>
    <text x="880" y="1165" text-anchor="middle" font-family="${F}" font-weight="bold" font-size="54" fill="#333">22 cm</text>
    <rect x="120" y="1290" width="140" height="270" fill="#fffffd"/>
    <g transform="translate(195,1420) rotate(-90)">
      <text x="0" y="18" text-anchor="middle" font-family="${F}" font-weight="bold" font-size="52" fill="#333">2 cm</text>
    </g>
  </svg>`;
  return sharp(path.join(kallmapp, 'kranskydd', 'galleri-03.jpg'))
    .composite([{ input: Buffer.from(svg) }])
    .jpeg({ quality: 92 });
}

// ---------- 5) Plyschtofflor: memoryskum (patch, 1001×1001) ----------
async function plyschMemory() {
  const svg = `<svg width="1001" height="1001" xmlns="http://www.w3.org/2000/svg">
    <rect x="10" y="25" width="450" height="115" fill="#fbfbfb"/>
    <text x="25" y="90" font-family="${F}" font-weight="bold" font-size="56" fill="#333">${esc(T.memory)}</text>
    <text x="25" y="130" font-family="${F}" font-size="21" fill="#666">${esc(T.memorySub)}</text>
    <rect x="745" y="635" width="95" height="30" fill="#f0f0f1"/>
    <text x="790" y="657" text-anchor="middle" font-family="${F}" font-size="20" fill="#555">${esc(T.mjuk)}</text>
    <rect x="835" y="635" width="120" height="30" fill="#f0f0f1"/>
    <text x="893" y="657" text-anchor="middle" font-family="${F}" font-size="20" fill="#555">${esc(T.plata)}</text>
  </svg>`;
  return sharp(path.join(kallmapp, 'plyschtofflor', 'galleri-02.jpg'))
    .composite([{ input: Buffer.from(svg) }])
    .jpeg({ quality: 92 });
}

const jobb = [
  ['batmotor-tabell', batTabell],
  ['mc-matt', mcMatt],
  ['dorrlist-matt', dorrMatt],
  ['kranskydd-matt', kranMatt],
  ['plysch-memory', plyschMemory],
];
for (const [namn, fn] of jobb) {
  const ut = path.join(utmapp, `${lang}-${namn}.jpg`);
  await (await fn()).toFile(ut);
  console.log(ut);
}
