#!/usr/bin/env node
// rendera.mjs — lägger det AMERIKANSKA textlagret på termoskyddets tre rena basfoton
// (kie.ai nano-banana-edit tog bort källans text 2026-09-16, resultat-kie.json).
// Samma väg som takskyddets US-runda: factory/bild-text.py via ops-bild.laggTextlager,
// brandets färger ur factory/butiker/carashell.yaml.
//   node market-expansion/ops/carashell/2026-09-16-us-termoskyddet/rendera.mjs
// Läser  bas/<källnamn>.png, textlager-us.json (engelska element per US-annons)
// Skriver us/<US-namn>.png + us/<US-namn>.png.spec.json, qa/<US-namn>.qa.png (SE | US), resultat-render.json
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { textFarger, laggTextlager } from '../../../../factory/ops-bild.mjs';
import { lasYaml } from '../../../../factory/yaml.mjs';
import { marknadsNamn } from '../../../../factory/opsmarknader.mjs';

const HAR = dirname(fileURLToPath(import.meta.url));
const ROT = join(HAR, '..', '..', '..', '..');
const us = JSON.parse(readFileSync(join(HAR, 'textlager-us.json'), 'utf8'));
const farger = textFarger(lasYaml(readFileSync(join(ROT, 'factory', 'butiker', 'carashell.yaml'), 'utf8')));
mkdirSync(join(HAR, 'us'), { recursive: true });
mkdirSync(join(HAR, 'qa'), { recursive: true });

// SE-annons → rent basfoto. CS och SP delar foto (källans CS_2_1 och SP_2_1 är samma foto med
// olika toning — den rena CS-varianten bär båda, som i SE-omgången).
const BAS = {
  CaraShellFront_CS_2_1: 'Termoskydd_CS_2_1',
  CaraShellFront_SP_2_1: 'Termoskydd_CS_2_1',
  CaraShellFront_PD_2_1: 'Termoskydd_PD_2_1',
  CaraShellFront_G_2_1: 'Termoskydd_G_2_1',
};
const KANDA = ['botten', 'citat', 'namn', 'stjarnor', 'rubrik', 'underrad', 'pris', 'jamforpris', 'rabatt', 'badge', 'etikett_vanster', 'etikett_hoger'];
const resultat = {};
for (const [seNamn, spec] of Object.entries(us).filter(([k]) => !k.startsWith('_'))) {
  const mal = marknadsNamn(seNamn, 'US');
  const el = spec.element;
  const okanda = el.filter((e) => !KANDA.includes(e.typ)).map((e) => e.typ);
  if (okanda.length) { resultat[seNamn] = { status: 'FEL', skal: `okända typer: ${okanda.join(',')}` }; continue; }
  const kvar = el.filter((e) => /\bkr\b|559|932|[åäöÅÄÖ]/.test(e.text)).map((e) => e.text);
  if (kvar.length) { resultat[seNamn] = { status: 'FEL', skal: `svenska/kr kvar: ${kvar.join(' | ')}` }; continue; }
  const bas = join(HAR, 'bas', `${BAS[seNamn]}.png`);
  const ut = join(HAR, 'us', `${mal}.png`);
  const info = laggTextlager({ bas, ut, element: el, farger });
  // QA: SE (som den ligger i OPS-kontot / källan) | US sida vid sida
  const se = join(HAR, 'se', `${seNamn}.png`);
  const qa = join(HAR, 'qa', `${mal}.qa.png`);
  spawnSync('python3', ['-c', `
from PIL import Image
a=Image.open(${JSON.stringify(se)}).convert('RGB').resize((512,512)); b=Image.open(${JSON.stringify(ut)}).convert('RGB').resize((512,512))
m=Image.new('RGB',(1034,512),'white'); m.paste(a,(0,0)); m.paste(b,(522,0)); m.save(${JSON.stringify(qa)})`]);
  resultat[seNamn] = { status: 'OK', mal, fil: `us/${mal}.png`, qa: `qa/${mal}.qa.png`, placerade: info.placerade, okanda: info.okanda_typer };
  console.log(`${seNamn} → ${mal}: ${info.placerade.join(', ')}${info.okanda_typer?.length ? ` · OKÄNDA: ${info.okanda_typer.join(', ')}` : ''}`);
}
writeFileSync(join(HAR, 'resultat-render.json'), JSON.stringify(resultat, null, 2));
const fel = Object.entries(resultat).filter(([, r]) => r.status !== 'OK');
if (fel.length) { console.error('FEL:', JSON.stringify(fel)); process.exit(1); }
