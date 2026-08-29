#!/usr/bin/env node
// Bygger Kaching deal_block-payloads for en hel batch produkter ur en spec-fil.
//
//   node build-payloads.mjs spec/baverbutiken-nya.json
//
// Skriver en payload per produkt till payloads/<handle>.json, validerar varje
// fil, och skriver KOR-DETTA.md med de exakta kommandona att kora.
//
// Payloaden byggs pa payloads/exempel-tresteg.json som skelett — den ar en
// riktig, fungerande bundle med alla 67 falt. Bara det som ska skilja skrivs
// over. Att bygga en payload fran grunden ar det snabbaste sattet att tappa
// ett falt som Kaching tyst behover.

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const ROT = path.dirname(fileURLToPath(import.meta.url));
const SKELETT = path.join(ROT, 'payloads', 'exempel-tresteg.json');

// Rad-id:n maste vara unika inom blocket. Kaching anvander slumpade 4-teckens
// nanoids; vi hashar i stallet fram dem ur handle + niva sa att en omkorning
// ger identiska filer och git-diffen visar bara det som faktiskt andrats.
function barId(handle, niva) {
  const tecken = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const h = crypto.createHash('sha256').update(`${handle}#${niva}`).digest();
  return [0, 1, 2, 3].map((i) => tecken[h[i] % tecken.length]).join('');
}

const kr = (n) => `${Math.round(n)} kr`;

// En niva -> en dealBar. discountType ar alltid "percentage": det fungerar aven
// nar varianterna har olika pris, till skillnad fran "specific" som ar ett fast
// totalbelopp och darfor blir fel sa fort en variant kostar nagot annat.
function byggBar(produkt, niva, skelettBar) {
  const { antal, rabatt, titel, badge } = niva;
  const enhetligtPris = produkt.priser.length === 1 ? produkt.priser[0] : null;

  let undertext;
  if (rabatt === 0) {
    undertext = 'Ordinarie pris';
  } else if (enhetligtPris != null) {
    // Alla varianter kostar lika mycket -> exakta kronor gar att rakna ut.
    const totalt = enhetligtPris * antal * (1 - rabatt / 100);
    const sparat = enhetligtPris * antal - totalt;
    undertext = `Du sparar ${kr(sparat)} — ${kr(totalt / antal)}/st`;
  } else {
    // Varianterna kostar olika. Da skulle en kronsiffra bli fel for atminstone
    // en variant, sa vi later Kaching rakna och skriver bara procenten.
    undertext = `${rabatt} % rabatt på hela köpet`;
  }

  return {
    ...skelettBar,
    id: barId(produkt.handle, antal),
    title: titel,
    subtitle: undertext,
    label: '',
    badgeStyle: 'simple',
    badgeText: badge || '',
    quantity: antal,
    discountType: 'percentage',
    discountValue: rabatt,
  };
}

function byggPayload(produkt, stege, skelett, standard) {
  const nivaer = stege.nivaer;
  const bars = nivaer.map((niva) => byggBar(produkt, niva, skelett.dealBars[0]));
  const forvaldIndex = nivaer.findIndex((n) => n.forvald);

  return {
    ...skelett,
    id: undefined,                       // CLI:t genererar UUID:t
    blockName: `${produkt.titel.slice(0, 60)} — ${stege.namn}`,
    blockTitle: stege.rubrik,
    discountName: '',
    blockVisibility: 'selected-products',
    selectedProducts: [{ id: produkt.gid }],
    selectedCollections: [],
    excludedProducts: [],
    excludedCollections: [],
    startTimestamp: null,                // scaffold fyller i
    endTimestamp: null,
    currency: null,
    showPricesPerItem: standard.showPricesPerItem,
    showBothPrices: standard.showBothPrices,
    useProductCompareAtPrice: standard.useProductCompareAtPrice,
    spacing: standard.spacing,
    cornerRadius: standard.cornerRadius,
    dealBars: bars,
    preselectedDealBarId: bars[forvaldIndex >= 0 ? forvaldIndex : 0].id,
  };
}

// ------------------------------------------------------------------ main
const specSokvag = process.argv[2];
if (!specSokvag) {
  console.error('Anvandning: node build-payloads.mjs <spec.json>');
  process.exit(2);
}
const spec = JSON.parse(fs.readFileSync(specSokvag, 'utf8'));
const skelett = JSON.parse(fs.readFileSync(SKELETT, 'utf8'));
const utMapp = path.join(ROT, 'payloads', spec.utmapp || 'batch');
fs.mkdirSync(utMapp, { recursive: true });

const rader = [];
for (const produkt of spec.produkter) {
  const stege = spec.stegar[produkt.stege];
  if (!stege) {
    console.error(`FEL: produkten "${produkt.handle}" pekar pa stegen "${produkt.stege}" som inte finns i spec-filen.`);
    process.exit(1);
  }
  const payload = byggPayload(produkt, stege, skelett, spec.standard);
  const fil = path.join(utMapp, `${produkt.handle}.json`);
  fs.writeFileSync(fil, JSON.stringify(payload, null, 2) + '\n');
  rader.push({ produkt, stege, fil: path.relative(ROT, fil) });
  console.log(`${produkt.handle}  ->  ${path.relative(ROT, fil)}  (${stege.namn})`);
}

// KOR-DETTA.md: exakta kommandon, sa att ingen behover lista ut dem sjalv.
const md = [
  `# Kör detta — ${spec.beskrivning}`,
  '',
  `Butik: **${spec.butik}** · ${rader.length} bundles · genererad ${new Date().toISOString().slice(0, 10)}`,
  '',
  'Kör allt från mappen `tools/kaching-cli/`. Har du inte loggat in på den här datorn förut:',
  '',
  '```bash',
  'npm install',
  'node kaching.mjs login',
  `node kaching.mjs blocks --store ${spec.butik}`,
  '```',
  '',
  '## 1. Granska först (rör inget i butiken)',
  '',
  '```bash',
  `for f in ${path.relative(ROT, utMapp)}/*.json; do node validate-payload.mjs "$f" | grep -q '^FEL' && echo "FEL i $f"; done; echo "granskning klar"`,
  '```',
  '',
  '## 2. Skapa bundlarna',
  '',
  'Varje `create` läser tillbaka det den skrev och rapporterar avvikelser automatiskt.',
  'Vill du se dem som utkast först: lägg till `--draft`.',
  '',
  '```bash',
  ...rader.map((r) => `node kaching.mjs create --store ${spec.butik} --file ${r.fil}`),
  '```',
  '',
  '## Vad som byggs',
  '',
  '| Produkt | Stege | Nivåer |',
  '|---|---|---|',
  ...rader.map((r) => `| ${r.produkt.titel} | ${r.stege.namn} | ${r.stege.nivaer.map((n) => `${n.antal} st ${n.rabatt ? `−${n.rabatt} %` : 'ord.'}`).join(' · ')} |`),
  '',
].join('\n');
fs.writeFileSync(path.join(utMapp, 'KOR-DETTA.md'), md);
console.log(`\n${rader.length} payloads + KOR-DETTA.md i ${path.relative(ROT, utMapp)}/`);
