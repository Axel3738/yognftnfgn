#!/usr/bin/env node
// Bygger pingisens två infografiker med skarp vektortext på marknadens språk.
// Bakgrund: AI-textbyte (kie.ai) garblade svenskan ("UTDRABARLT NÄT") och ritade
// om produkten — så här gör vi som pipeline/compose.mjs: riktiga foton behålls,
// texten läggs ovanpå som vektortext med sharp. Källbilderna (engelska original
// ur Temu-galleriet) ligger bredvid som en-1.jpg / en-2.jpg.
//
//   node temu/infografik/pingis.mjs <sv|no|da|fi> [utmapp]
//
// Skriver <utmapp>/pingis-info-1-<språk>.jpg och pingis-info-2-<språk>.jpg.
// UK behöver aldrig genereras — engelska originalen används rakt av.

import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import path from 'path';

const HAR = path.dirname(fileURLToPath(import.meta.url));
const ROT = path.resolve(HAR, '..', '..');
const sharp = createRequire(path.join(ROT, 'pipeline', 'x.js'))('sharp');

const SPRAK = {
  sv: {
    rubrik: 'UTDRAGBART NÄT',
    underrubrik: 'PASSAR ALLA BORD',
    punkter: ['SPELA INNE & UTE', 'LÄMNAR INGA MÄRKEN', 'SNABBT PÅ PLATS'],
    ramRubrik: ['Infällbar', 'nätram'],
    ramText: ['Nätet dras ut', 'upp till 1,7 m'],
    basRubrik: 'Gummibas',
    basText: 'Halkfri design',
    matta: 'Halkfri matta',
    matt: 'Max 5 cm',
  },
  no: {
    rubrik: 'UTTREKKBART NETT',
    underrubrik: 'PASSER ALLE BORD',
    punkter: ['SPILL INNE & UTE', 'SETTER INGEN MERKER', 'KLART PÅ SEKUNDER'],
    ramRubrik: ['Uttrekkbar', 'nettramme'],
    ramText: ['Nettet trekkes ut', 'inntil 1,7 m'],
    basRubrik: 'Gummibase',
    basText: 'Sklisikker design',
    matta: 'Sklisikker matte',
    matt: 'Maks 5 cm',
  },
  da: {
    rubrik: 'UDTRÆKKELIGT NET',
    underrubrik: 'PASSER TIL ALLE BORDE',
    punkter: ['SPIL INDE & UDE', 'INGEN MÆRKER PÅ BORDET', 'KLAR PÅ SEKUNDER'],
    ramRubrik: ['Udtrækkelig', 'netramme'],
    ramText: ['Nettet trækkes ud', 'op til 1,7 m'],
    basRubrik: 'Gummibase',
    basText: 'Skridsikkert design',
    matta: 'Skridsikker måtte',
    matt: 'Maks 5 cm',
  },
  fi: {
    rubrik: 'LEVITETTÄVÄ VERKKO',
    underrubrik: 'SOPII KAIKILLE PÖYDILLE',
    punkter: ['PELAA SISÄLLÄ & ULKONA', 'EI JÄLKIÄ PÖYTÄÄN', 'VALMIS SEKUNNEISSA'],
    ramRubrik: ['Sisäänvedettävä', 'verkkoteline'],
    ramText: ['Verkko venyy', 'jopa 1,7 m'],
    basRubrik: 'Kumijalusta',
    basText: 'Luistamaton pohja',
    matta: 'Luistamaton matto',
    matt: 'Maks. 5 cm',
  },
};

const [lang, utmapp = '/tmp/fix'] = process.argv.slice(2);
const T = SPRAK[lang];
if (!T) {
  console.error('Användning: node temu/infografik/pingis.mjs <sv|no|da|fi> [utmapp]');
  process.exit(1);
}
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

// ---------- Bild 1: nätet i användning + checklista (1080×1080) ----------
async function bild1() {
  // Fotokortet klipps ur originalet och läggs på ny gradient — allt annat ritas.
  const foto = await sharp(path.join(HAR, 'pingis', 'en-1.jpg'))
    .extract({ left: 38, top: 287, width: 996, height: 558 })
    .toBuffer();
  const mask = Buffer.from(
    `<svg width="996" height="558"><rect x="0" y="0" width="996" height="558" rx="24" fill="#fff"/></svg>`
  );
  const fotoRundat = await sharp(foto)
    .composite([{ input: mask, blend: 'dest-in' }])
    .png()
    .toBuffer();

  const bock = (cy) =>
    `<circle cx="64" cy="${cy}" r="24" fill="none" stroke="#fff" stroke-width="5"/>
     <path d="M 52 ${cy} l 9 10 l 16 -20" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>`;

  const svg = `<svg width="1080" height="1080" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0.25" y2="1">
      <stop offset="0" stop-color="#14a0d6"/>
      <stop offset="0.45" stop-color="#1b7cb0"/>
      <stop offset="1" stop-color="#164c8a"/>
    </linearGradient>
  </defs>
  <rect width="1080" height="1080" fill="url(#bg)"/>
  <polygon points="10,8 58,8 44,60 -4,60" fill="#0d5c9e"/>
  <polygon points="66,8 100,8 86,60 52,60" fill="#3fb9e8" opacity="0.85"/>
  <text x="540" y="130" text-anchor="middle" font-family="Liberation Sans" font-weight="bold" font-style="italic" font-size="92" letter-spacing="3" fill="#ffffff">${esc(T.rubrik)}</text>
  <text x="540" y="205" text-anchor="middle" font-family="Liberation Sans" font-weight="bold" font-style="italic" font-size="50" letter-spacing="2" fill="#ffffff">${esc(T.underrubrik)}</text>
  ${bock(908)}<text x="112" y="924" font-family="Liberation Sans" font-weight="bold" font-style="italic" font-size="42" fill="#ffffff">${esc(T.punkter[0])}</text>
  ${bock(972)}<text x="112" y="988" font-family="Liberation Sans" font-weight="bold" font-style="italic" font-size="42" fill="#ffffff">${esc(T.punkter[1])}</text>
  ${bock(1036)}<text x="112" y="1052" font-family="Liberation Sans" font-weight="bold" font-style="italic" font-size="42" fill="#ffffff">${esc(T.punkter[2])}</text>
  <g stroke="#ffffff" stroke-width="5" fill="none" stroke-linecap="round">
    <rect x="740" y="948" width="250" height="16" rx="4"/>
    <line x1="762" y1="964" x2="748" y2="1050"/>
    <line x1="968" y1="964" x2="982" y2="1050"/>
    <line x1="820" y1="964" x2="814" y2="1010"/>
    <line x1="910" y1="964" x2="916" y2="1010"/>
    <rect x="845" y="900" width="40" height="48" rx="3"/>
    <line x1="845" y1="912" x2="885" y2="912"/>
    <line x1="845" y1="924" x2="885" y2="924"/>
    <line x1="845" y1="936" x2="885" y2="936"/>
    <line x1="855" y1="900" x2="855" y2="948"/>
    <line x1="865" y1="900" x2="865" y2="948"/>
    <line x1="875" y1="900" x2="875" y2="948"/>
  </g>
</svg>`;

  return sharp(Buffer.from(svg))
    .composite([{ input: fotoRundat, left: 42, top: 300 }])
    .jpeg({ quality: 92 });
}

// ---------- Bild 2: mått + gummibas (1060×1056) ----------
// Originalet behålls rakt av — engelska texten sitter på plana ytor och täcks
// med plattor i samma färg, sedan skrivs språket ovanpå.
async function bild2() {
  const SVART = '#272324';
  const ROD = '#e8323c';
  const svg = `<svg width="1060" height="1056" xmlns="http://www.w3.org/2000/svg">
  <rect x="25" y="105" width="400" height="320" fill="${SVART}"/>
  <text x="45" y="175" font-family="Liberation Sans" font-weight="bold" font-size="54" fill="#ffffff">${esc(T.ramRubrik[0])}</text>
  <text x="45" y="238" font-family="Liberation Sans" font-weight="bold" font-size="54" fill="#ffffff">${esc(T.ramRubrik[1])}</text>
  <line x1="45" y1="282" x2="190" y2="282" stroke="#ffffff" stroke-width="3"/>
  <text x="45" y="345" font-family="Liberation Sans" font-weight="bold" font-size="33" fill="#ffffff">${esc(T.ramText[0])}</text>
  <text x="45" y="398" font-family="Liberation Sans" font-weight="bold" font-size="33" fill="#ffffff">${esc(T.ramText[1])}</text>
  <rect x="640" y="695" width="415" height="100" fill="${SVART}"/>
  <text x="658" y="768" font-family="Liberation Sans" font-weight="bold" font-size="52" fill="#ffffff">${esc(T.basRubrik)}</text>
  <rect x="640" y="835" width="380" height="80" fill="${SVART}"/>
  <text x="658" y="890" font-family="Liberation Sans" font-weight="bold" font-size="34" fill="#ffffff">${esc(T.basText)}</text>
  <rect x="398" y="700" width="184" height="54" rx="27" fill="${ROD}"/>
  <text x="490" y="736" text-anchor="middle" font-family="Liberation Sans" font-weight="bold" font-size="26" fill="#ffffff">${esc(T.matta)}</text>
  <g transform="translate(212,862) rotate(-68)">
    <rect x="-120" y="-28" width="240" height="56" rx="28" fill="${ROD}"/>
    <text x="0" y="12" text-anchor="middle" font-family="Liberation Sans" font-weight="bold" font-size="34" fill="#ffffff">${esc(T.matt)}</text>
  </g>
</svg>`;

  return sharp(path.join(HAR, 'pingis', 'en-2.jpg'))
    .composite([{ input: Buffer.from(svg), left: 0, top: 0 }])
    .jpeg({ quality: 92 });
}

const ut1 = path.join(utmapp, `pingis-info-1-${lang}.jpg`);
const ut2 = path.join(utmapp, `pingis-info-2-${lang}.jpg`);
await (await bild1()).toFile(ut1);
await (await bild2()).toFile(ut2);
console.log(ut1);
console.log(ut2);
