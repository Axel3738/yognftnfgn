// VA:ns checklista som Word-fil.
//
//   node factory/va-checklist-docx.mjs                       → factory/VA-CHECKLIST.docx (mastern, tomma fält)
//   node factory/va-checklist-docx.mjs factory/butiker/<id>.yaml factory/produkter/<id>.yaml
//                                                            → factory/output/<produkt-id>/CHECKLISTA.docx (ifylld)
//
// Texten är Axels mall (factory/VA-CHECKLIST.md) ordagrant — VA:n följer sin
// chef, inte påhittade regler. Det enda som läggs till är (1) de fasta värdena
// som är samma för varje butik (bolagsuppgifter, annonskonto, stjärnfärg) och
// (2) rutan med butikens egna värden. Loom-länkarna kommer ur Axels egen
// "How to OPS"-docx (2026-09-07).
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
  HeadingLevel, WidthType, BorderStyle, AlignmentType, ShadingType, ExternalHyperlink,
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
  ['Judge.me star color', STJARNFARG.replace('#', '')],
  ['Ad account (Meta)', 'MagiBorsten DK (915422744950975)'],
];

// Stegen — ordagrant ur factory/VA-CHECKLIST.md. Platshållarna STORE NAME /
// DOMAIN / STORE EMAIL / FORWARD TO byts mot butikens värden i den ifyllda kopian.
const STEG = [
  ['1. Domain (Loopia)', [
    'Log in to Loopia',
    'Buy DOMAIN – registrant must be the company, not you',
    'Domain → Email → Forwarding → create STORE EMAIL → forward to FORWARD TO',
    'Send a test email to STORE EMAIL – confirm it arrives',
  ]],
  ['2. Shopify – create the store', [
    'Go to shopify.com → Start free trial → sign up with the work Gmail',
    'Stay on the free trial – never pick a plan, never enter any card',
    '(Staff invites need a paid plan – the owner is added at hand over instead)',
  ]],
  ['3. Shopify – basics', [
    'Settings → General → Store name → STORE NAME → Save',
    'Settings → Domains → Connect existing domain → DOMAIN → follow the DNS steps → Set as primary',
    'Settings → Languages → make Swedish default (add others if needed)',
    'Settings → Notifications → Sender email → STORE EMAIL → Save → click the verification link in the inbox',
  ]],
  ['4. Shopify – connect Claude Code', [
    'Settings → Apps and sales channels → Develop apps → Allow custom app development',
    'Create app → name it "Fabriken" → Configure Admin API scopes → tick ALL scopes → Save',
    'Install app → reveal the Admin API access token → paste it into Claude Code when asked (never in chat or email)',
    'Claude cannot build anything in the store until this is done',
  ]],
  ['5. Shopify – payments', [
    'Settings → Payments → Activate Shopify Payments → fill in the company + bank details Claude gives you',
    'Same page → Klarna → tick → Save',
    'Settings → Checkout → Customize → Logo → upload the logo Claude gives you → Save',
  ]],
  ['6. Judge.me', [
    'Apps → search "Judge.me" → Install (free plan)',
    'Judge.me → Settings → Language → Swedish',
    `Judge.me → Settings → Review Widget → star color: ${STJARNFARG.replace('#', '')}`,
    'Judge.me → Settings → Integrations → copy API Token → paste it into Claude Code when asked (never in chat or email)',
  ]],
  ['7. Meta', [
    'business.facebook.com → Settings → Pages → Add → Create a new Page: STORE NAME',
    'Copy the Page ID → give to Claude Code',
    'The ad account is always the same for every OPS store: MagiBorsten DK (915422744950975) – never pick another one, never add any card',
  ]],
  ['8. Discord', [
    'Discord → + → Create server: STORE NAME',
    'Open the invite link Claude Code gives you → Authorize the bot',
  ]],
  ['9. Hand over', [
    'Tell Claude Code: "Store ready: STORE NAME" – it creates the pixel, renames the ad account, builds Discord channels and imports reviews',
    'When Claude says the theme is ready: Online Store → Themes → the theme Claude names → Publish',
    "Install the WeTracked app → paste the pixel ID Claude gives you → connect the Conversions API token (follow WeTracked's guide)",
    'The owner logs in with the work Gmail, picks the plan and adds his card',
    'Then: Settings → Users and permissions → ⋯ → Transfer ownership → the owner',
    'Owner changes the Loopia password afterwards',
  ]],
];

const HUR = [
  'The owner sends product batches about 2 times per week',
  'A batch can be 0 products or several',
  'Each product = one new store = run this checklist once',
  'You have 3 days to launch every store in a batch',
  'Start each store by writing /ny-ops + the product link in Claude Code',
  'Claude tells you exactly when each click below is needed',
];

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
const tabell = (rader, bredder, forstaKolumnFet = true) =>
  new Table({
    width: { size: bredder.reduce((a, b) => a + b, 0), type: WidthType.DXA },
    columnWidths: bredder,
    rows: rader.map(([a, b]) =>
      new TableRow({
        children: [
          cell(t(a, { bold: forstaKolumnFet }), bredder[0], 'F4F2EC'),
          cell(/^https?:\/\//.test(b) ? lank(b) : t(b), bredder[1]),
        ],
      })),
  });

// Fet markering av butikens värden i den ifyllda kopian, annars vanlig text.
function stegRad(text, varden) {
  if (!varden) return [t('☐  '), t(text)];
  const delar = text.split(/(STORE NAME|STORE EMAIL|DOMAIN|FORWARD TO)/);
  return [t('☐  '), ...delar.map((d) => (varden[d] ? t(varden[d], { bold: true }) : t(d)))];
}

export function byggDokument(varden) {
  const ifylld = Boolean(varden);
  const barn = [
    rubrik('Store Launch Checklist (manual steps)', HeadingLevel.HEADING_1),
    p(t(ifylld ? `Store: ${varden['STORE NAME']}` : 'Master copy – use for every store.', { italics: true, color: '555555' })),

    rubrik('How this job works'),
    ...HUR.map((rad) => p([t('•  '), t(rad)])),

    rubrik('Fixed values – the same for every store'),
    tabell(FASTA, [3400, 6000]),

    rubrik(ifylld ? 'This store' : 'Fill in first (Claude gives you these values for each store)'),
    tabell([
      ['STORE NAME', ifylld ? varden['STORE NAME'] : '____________________'],
      ['DOMAIN', ifylld ? varden['DOMAIN'] : '____________________  (e.g. brand.se)'],
      ['STORE EMAIL', ifylld ? varden['STORE EMAIL'] : 'hej@DOMAIN'],
      ['FORWARD TO', AGARE],
    ], [3400, 6000]),

    p(t('Do the steps in order, top to bottom. Tick each one.', { bold: true }), { spacing: { before: 240, after: 120 } }),
  ];

  STEG.forEach(([namn, rader], i) => {
    barn.push(rubrik(namn));
    const nr = i + 1;
    if (LOOM[nr]) barn.push(p([t('VIDEO: '), lank(LOOM[nr])]));
    for (const rad of rader) barn.push(p(stegRad(rad, varden)));
  });

  barn.push(p(t(' '), { spacing: { before: 240 } }));
  barn.push(p(t('Claude Code does: brand design from product + audience, theme build, product page, bundles + free-gift bonus, cart upsell, images, reviews import, Meta pixel, ad account rename, Discord channels, markets/translations, and tells you exactly when your clicks are needed.', { italics: true, color: '555555', size: 20 })));

  return new Document({
    creator: 'OPS Factory',
    title: 'Store Launch Checklist',
    styles: { default: { document: { run: { font: FONT, size: 22 } } } },
    sections: [{ properties: { page: { margin: { top: 1000, bottom: 1000, left: 1100, right: 1100 } } }, children: barn }],
  });
}

async function huvud() {
  const [butiksfil, produktfil] = process.argv.slice(2);
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
      'STORE EMAIL': butik?.butik?.supportmail ?? `hej@${doman}`,
      'FORWARD TO': AGARE,
    };
    const mapp = join(ROT, 'output', pr.produkt.id);
    mkdirSync(mapp, { recursive: true });
    ut = join(mapp, 'CHECKLISTA.docx');
  }
  const buf = await Packer.toBuffer(byggDokument(varden));
  writeFileSync(ut, buf);
  console.log(`✅ ${ut} (${buf.length} byte)`);
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  huvud().catch((e) => { console.error(`❌ ${e.message}`); process.exit(1); });
}
