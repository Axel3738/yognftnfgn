#!/usr/bin/env node
// rendera.mjs — lägger det AMERIKANSKA textlagret på takskyddets fyra basfoton.
// Samma väg som NO-versionerna 2026-09-15 (factory/bild-text.py via
// ops-bild.laggTextlager, brandets färger ur factory/butiker/carashell.yaml).
//   node market-expansion/ops/carashell/2026-09-16-us/rendera.mjs
// Läser  bas/<SE-namn>.png (rena foton ur de gamla Meta-creatives:en),
//        se-texter.json (facit för typ + ordning), textlager-us.json (engelska)
// Skriver us/<US-namn>.png + us/<US-namn>.png.spec.json, resultat-render.json
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { textFarger, laggTextlager } from '../../../../factory/ops-bild.mjs';
import { lasYaml } from '../../../../factory/yaml.mjs';
import { marknadsNamn } from '../../../../factory/opsmarknader.mjs';

const HAR = dirname(fileURLToPath(import.meta.url));
const ROT = join(HAR, '..', '..', '..', '..');
const se = JSON.parse(readFileSync(join(HAR, 'se-texter.json'), 'utf8'));
const us = JSON.parse(readFileSync(join(HAR, 'textlager-us.json'), 'utf8'));
const farger = textFarger(lasYaml(readFileSync(join(ROT, 'factory', 'butiker', 'carashell.yaml'), 'utf8')));
mkdirSync(join(HAR, 'us'), { recursive: true });

const resultat = {};
for (const namn of Object.keys(se).filter((k) => !k.startsWith('_'))) {
  const mal = marknadsNamn(namn, 'US');
  const seEl = se[namn].element;
  const usEl = us[namn]?.element;
  if (!usEl) { resultat[namn] = { status: 'FEL', skal: 'saknas i textlager-us.json' }; continue; }
  const seTyper = seEl.map((e) => e.typ).join(',');
  const usTyper = usEl.map((e) => e.typ).join(',');
  if (seTyper !== usTyper) { resultat[namn] = { status: 'FEL', skal: `typordning: SE ${seTyper} ≠ US ${usTyper}` }; continue; }
  const kvarSvenska = usEl.filter((e) => /\bkr\b|1 129|1 469|23 %|[åäöÅÄÖ]/.test(e.text)).map((e) => e.text);
  if (kvarSvenska.length) { resultat[namn] = { status: 'FEL', skal: `svenska/kr kvar: ${kvarSvenska.join(' | ')}` }; continue; }
  const ut = join(HAR, 'us', `${mal}.png`);
  const info = laggTextlager({ bas: join(HAR, 'bas', `${namn}.png`), ut, element: usEl, farger });
  resultat[namn] = { status: 'OK', mal, fil: `us/${mal}.png`, placerade: info.placerade, okanda: info.okanda_typer };
  console.log(`${namn} → ${mal}: ${info.placerade.join(', ')}${info.okanda_typer?.length ? ` · OKÄNDA: ${info.okanda_typer.join(', ')}` : ''}`);
}
writeFileSync(join(HAR, 'resultat-render.json'), JSON.stringify(resultat, null, 2));
const fel = Object.entries(resultat).filter(([, r]) => r.status !== 'OK');
if (fel.length) { console.error('FEL:', JSON.stringify(fel)); process.exit(1); }
