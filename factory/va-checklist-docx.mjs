// VA:ns checklista som Word-fil.
//
//   node factory/va-checklist-docx.mjs                       → factory/VA-CHECKLIST.docx (mastern, tomma fält)
//   node factory/va-checklist-docx.mjs factory/butiker/<id>.yaml factory/produkter/<id>.yaml
//                                                            → factory/output/<produkt-id>/CHECKLISTA.docx (ifylld)
//
// Stegen LÄSES ur factory/VA-CHECKLIST.md vid varje körning — Axels mall är
// enda källan, så Word-filen kan inte glida ifrån den. VA:n följer sin chef,
// inte påhittade regler. Det enda som läggs till är (1) tabellen med de fasta
// värdena som är samma för varje butik (bolagsuppgifter, annonskonto,
// stjärnfärg) och (2) rutan med butikens egna värden. Loom-länkarna kommer ur
// Axels egen "How to OPS"-docx (2026-09-07).
//
// Kräver npm-paketet docx — men repot har noll beroenden, så det installeras
// UTANFÖR repot och pekas ut med NODE_PATH:
//   mkdir -p /tmp/docx && (cd /tmp/docx && npm install docx)
//   NODE_PATH=/tmp/docx/node_modules node factory/va-checklist-docx.mjs

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { lasYaml } from './yaml.mjs';
import { sammanfoga } from './butik.mjs';
import { STJARNFARG } from './branding.mjs';

const require = createRequire(import.meta.url);
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, WidthType, BorderStyle, ShadingType, ExternalHyperlink,
} = require('docx');

const ROT = dirname(fileURLToPath(import.meta.url));
const AGARE = 'subscriptions@stonebite.org';
const LOOM = {
  1: 'https://www.loom.com/share/912dd62c10874ad1bdb124aa75cad03f',
  2: 'https://www.loom.com/share/64c563e6ed0a49a49164396bd94c013f',
};
const CERTIFIKAT = 'https://drive.google.com/file/d/1Ag4NxM6zQOYygrqCB1lecuBJIi-uDdAa/view?usp=sharing';

// Fasta värden — samma för varje OPS-butik. Bolaget är STONEBITE ECOM AB
// (factory/butiker/hemvakten.yaml, allabolag.se 2026-09-07). Svenskt
// momsnummer = SE + orgnr utan bindestreck + 01.
const FASTA = [
  ['Company (registrant, Shopify Payments)', 'STONEBITE ECOM AB'],
  ['Organisation number', '559576-2401'],
  ['VAT number', 'SE559576240101'],
  ['Company address', 'Sjöhed 160, 442 74 Harestad'],
  ['Registration certificate', CERTIFIKAT],
  ["FORWARD TO (owner's inbox)", AGARE],
  ['Custom app name in Shopify', 'Fabriken'],
  ['Store language', 'Swedish'],
  ['Markets', 'Sweden + Norway (every store)'],
  ['Judge.me star color', STJARNFARG.replace('#', '')],
  ['Ad account (Meta)', 'MagiBorsten DK (915422744950975)'],
];

// --- Läs Axels mall -------------------------------------------------------
// Struktur i VA-CHECKLIST.md: "## How this job works" (punkter), "Fill in
// first:" (punkter), raden "Do the steps …", sen "## N. Titel" med "VIDEO:"
// och punkter ("* text", fortsättningsrader indragna, "Note: …" indragen),
// och sist en fotnot efter "---".
export function lasMall(md) {
  const rader = md.split('\n');
  const mall = { hur: [], fyllI: [], instruktion: '', steg: [], fot: '' };
  let sektion = null;
  let iFyllI = false;
  let efterStreck = false;
  const fot = [];
  const avsluta = (p) => p.replace(/\*\*/g, '').trim();

  for (const rad of rader) {
    if (rad.startsWith('---')) { efterStreck = true; continue; }
    if (efterStreck) { if (rad.trim()) fot.push(rad.trim()); continue; }
    const rubrik = rad.match(/^## (.+)$/);
    if (rubrik) {
      const stegNr = rubrik[1].match(/^(\d+)\. /);
      sektion = stegNr ? { nr: Number(stegNr[1]), titel: rubrik[1], punkter: [] } : rubrik[1];
      if (stegNr) mall.steg.push(sektion);
      iFyllI = false;
      continue;
    }
    if (sektion === 'How this job works') {
      if (/^Fill in first:/.test(rad)) { iFyllI = true; continue; }
      if (/^Do the steps/.test(rad)) { mall.instruktion = rad.trim(); continue; }
      if (rad.startsWith('* ')) (iFyllI ? mall.fyllI : mall.hur).push(avsluta(rad.slice(2)));
      continue;
    }
    if (sektion && typeof sektion === 'object') {
      if (/^VIDEO:/.test(rad) || !rad.trim()) continue;
      if (rad.startsWith('* ')) sektion.punkter.push({ typ: 'punkt', text: avsluta(rad.slice(2)) });
      else if (/^\s+Note:/.test(rad)) sektion.punkter.push({ typ: 'notis', text: avsluta(rad) });
      else if (/^\s+/.test(rad) && sektion.punkter.length) {
        const sista = sektion.punkter[sektion.punkter.length - 1];
        sista.text = `${sista.text} ${avsluta(rad)}`;
      }
    }
  }
  mall.fot = fot.join(' ');
  return mall;
}

// --- Word-bygget -----------------------------------------------------------
const FONT = 'Arial';
const t = (text, opts = {}) => new TextRun({ text, font: FONT, size: 22, ...opts });
const p = (children, opts = {}) => new Paragraph({ spacing: { after: 80 }, ...opts, children: Array.isArray(children) ? children : [children] });
const rubrik = (text, level = HeadingLevel.HEADING_2) =>
  new Paragraph({ heading: level, spacing: { before: 280, after: 120 }, children: [t(text, { bold: true, size: level === HeadingLevel.HEADING_1 ? 32 : 26, color: '1A211B' })] });
const lank = (url) => new ExternalHyperlink({ link: url, children: [t(url, { color: '1155CC', underline: {} })] });

const KANT = { style: BorderStyle.SINGLE, size: 4, color: 'BBBBBB' };
const kanter = { top: KANT, bottom: KANT, left: KANT, right: KANT };
const cell = (children, width, skugga) =>
  new TableCell({
    width: { size: width, type: WidthType.DXA },
    borders: kanter,
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
    shading: skugga ? { type: ShadingType.CLEAR, fill: skugga, color: 'auto' } : undefined,
    children: [p(children, { spacing: { after: 0 } })],
  });
const tabell = (rader, bredder) =>
  new Table({
    width: { size: bredder.reduce((a, b) => a + b, 0), type: WidthType.DXA },
    columnWidths: bredder,
    rows: rader.map(([a, b]) =>
      new TableRow({
        children: [
          cell(t(a, { bold: true }), bredder[0], 'F4F2EC'),
          cell(/^https?:\/\//.test(b) ? lank(b) : t(b), bredder[1]),
        ],
      })),
  });

// Butikens värden fetmarkerade i den ifyllda kopian, platshållarna som de är i mastern.
function radMedVarden(text, varden) {
  if (!varden) return [t(text)];
  const delar = text.split(/(STORE NAME|STORE EMAIL|DOMAIN|FORWARD TO)/);
  return delar.map((d) => (varden[d] ? t(varden[d], { bold: true }) : t(d)));
}

export function byggDokument(mall, varden) {
  const ifylld = Boolean(varden);
  // "Fill in first"-raderna ur mallen: "STORE NAME: ____" → [fält, värde]
  const fyllI = mall.fyllI.map((rad) => {
    const [falt, ...rest] = rad.split(':');
    const mallvarde = rest.join(':').trim();
    const f = falt.trim();
    if (f === 'FORWARD TO') return [f, AGARE];
    if (ifylld && varden[f]) return [f, varden[f]];
    return [f, mallvarde];
  });

  const barn = [
    rubrik('Store Launch Checklist (manual steps)', HeadingLevel.HEADING_1),
    p(t(ifylld ? `Store: ${varden['STORE NAME']}` : 'Master copy – use for every store.', { italics: true, color: '555555' })),
    rubrik('How this job works'),
    ...mall.hur.map((rad) => p([t('•  '), t(rad)])),
    rubrik('Fixed values – the same for every store'),
    tabell(FASTA, [3400, 6000]),
    rubrik(ifylld ? 'This store' : 'Fill in first (Claude gives you these values for each store)'),
    tabell(fyllI, [3400, 6000]),
    p(t(mall.instruktion, { bold: true }), { spacing: { before: 240, after: 120 } }),
  ];

  for (const steg of mall.steg) {
    barn.push(rubrik(steg.titel));
    if (LOOM[steg.nr]) barn.push(p([t('VIDEO: '), lank(LOOM[steg.nr])]));
    for (const punkt of steg.punkter) {
      if (punkt.typ === 'notis') barn.push(p(t(punkt.text, { italics: true, color: '555555' }), { indent: { left: 420 } }));
      else barn.push(p([t('☐  '), ...radMedVarden(punkt.text, varden)]));
    }
  }

  if (mall.fot) {
    barn.push(p(t(' '), { spacing: { before: 240 } }));
    barn.push(p(t(mall.fot, { italics: true, color: '555555', size: 20 })));
  }

  return new Document({
    creator: 'OPS Factory',
    title: 'Store Launch Checklist',
    styles: { default: { document: { run: { font: FONT, size: 22 } } } },
    sections: [{ properties: { page: { margin: { top: 1000, bottom: 1000, left: 1100, right: 1100 } } }, children: barn }],
  });
}

async function huvud() {
  const [butiksfil, produktfil] = process.argv.slice(2);
  const mall = lasMall(readFileSync(join(ROT, 'VA-CHECKLIST.md'), 'utf8'));
  let varden = null;
  let ut = join(ROT, 'VA-CHECKLIST.docx');
  if (butiksfil && produktfil) {
    const butik = lasYaml(readFileSync(butiksfil, 'utf8'));
    const pr = sammanfoga(butik, lasYaml(readFileSync(produktfil, 'utf8')));
    const brand = pr?.brand?.namn ?? butik?.butik?.brand;
    const doman = pr?.brand?.domanideer?.[0] ?? 'DOMAIN';
    varden = {
      'STORE NAME': brand,
      DOMAIN: doman,
      'STORE EMAIL': butik?.butik?.supportmail ?? `hello@${doman}`,
      'FORWARD TO': AGARE,
    };
    const mapp = join(ROT, 'output', pr.produkt.id);
    mkdirSync(mapp, { recursive: true });
    ut = join(mapp, 'CHECKLISTA.docx');
  }
  const buf = await Packer.toBuffer(byggDokument(mall, varden));
  writeFileSync(ut, buf);
  console.log(`✅ ${ut} (${buf.length} byte, ${mall.steg.length} steg ur VA-CHECKLIST.md)`);
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  huvud().catch((e) => { console.error(`❌ ${e.message}`); process.exit(1); });
}
