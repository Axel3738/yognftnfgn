// Slår ihop copy-1..8.json → copy.json och granskar varje rad mot reglerna.
//   node temu/batch11/granska-copy.mjs
import { FAKTA } from './fakta.mjs';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const HÄR = path.dirname(fileURLToPath(import.meta.url));
const copy = {};
for (const n of [1, 2, 3, 4, 5, 6, 7, 8]) { const f = path.join(HÄR, `copy-${n}.json`); if (existsSync(f)) Object.assign(copy, JSON.parse(readFileSync(f, 'utf8'))); }
writeFileSync(path.join(HÄR, 'copy.json'), JSON.stringify(copy, null, 1));

const FORB = { sv: ['revolutionerande', 'ultimat', 'game-changer', 'måste-ha', 'oumbärlig', 'magisk', 'aldrig mer', 'total trygghet', 'vattentät', 'snabb leverans', 'dagars leverans', 'aldrig', 'alltid', 'minecraft', 'volkswagen', '24h', 'garanterat'],
               no: ['revolusjonerende', 'ultimat', 'game-changer', 'må-ha', 'uunnværlig', 'magisk', 'aldri mer', 'total trygghet', 'vanntett', 'rask levering', 'hurtig levering', 'aldri', 'alltid', 'minecraft', 'volkswagen', 'garantert'] };
const RAKNE = {
  varmesulor: ['2000 mAh', '41'], krukvaxthuv: ['3', '120 × 180'], bikupsjacka: ['194 × 46'], ljusslingevindor: ['10'], makitahallare: ['5'], elcykeljacka: ['2'],
  rcdrift: ['1:24', '20 km/h', '4', '5 koner'], rcoffroad: ['1:16', '20 km/h', '2,4 GHz'], vedklyvshuv: ['210D'], poolpumphuv: ['101 × 86 × 78', '210D'], takachuv: ['80 × 80 × 38'], buskjacka: ['2', '120 × 180'],
  regnkedja: ['3,8 m', '12'], rullknivslip: ['20°', '2 diamant'], highlandcow: ['24', '2026'], lovsilar: ['6'], bordsfotboll: ['6 bollar', 'Två spelare', '3+'], magnetblock: ['200', '3+'],
};
let fel = 0;
for (const [id, f] of Object.entries(FAKTA)) {
  if (f.status !== 'bygg') continue;
  const c = copy[id];
  if (!c) { console.log(`✗ ${id}: SAKNAS i copy`); fel++; continue; }
  for (const sp of ['sv', 'no']) {
    const t = c[sp]; if (!t) { console.log(`✗ ${id}.${sp}: saknas`); fel++; continue; }
    const allt = [t.titel, t.problemH, t.problemP, t.losningH, t.losningP, ...(t.bullets || []), t.seoTitel, t.seoText, ...(t.taggar || []), t.varning || ''].join(' ');
    const lag = allt.toLowerCase();
    const p = [];
    for (const w of FORB[sp]) { const re = new RegExp(`(^|[^a-zåäöæø])${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^a-zåäöæø]|$)`, 'i'); if (re.test(lag)) p.push(`förbjudet "${w}"`); }
    if (!t.bullets || t.bullets.length < 4 || t.bullets.length > 5) p.push(`bullets ${t.bullets?.length}`);
    for (const b of t.bullets || []) if (!/^<strong>.+<\/strong> [–-] .+/.test(b)) p.push(`bullet utan utfall-format: ${b.slice(0, 40)}`);
    if ((t.seoTitel || '').length > 60) p.push(`seoTitel ${t.seoTitel.length}`);
    if ((t.seoText || '').length > 155) p.push(`seoText ${t.seoText.length}`);
    if (sp === 'sv') for (const r of RAKNE[id] || []) if (!allt.includes(r)) p.push(`räkneord saknas "${r}"`);
    if (f.flerpack && sp === 'sv' && !new RegExp(`\\b${f.flerpack}\\b`).test(t.titel)) p.push(`flerpack ${f.flerpack} saknas i titeln`);
    if (f.flerpack && !new RegExp(`\\b${f.flerpack}\\b`).test((t.bullets || [])[0] || '')) p.push(`flerpack ${f.flerpack} saknas i första bulleten`);
    if (p.length) { fel += p.length; console.log(`✗ ${id}.${sp}: ${p.join(' · ')}`); } else console.log(`✔ ${id}.${sp}  "${t.titel}"`);
  }
}
console.log(`\n${fel ? fel + ' anmärkningar' : 'allt grönt'} · ${Object.keys(copy).length} produkter i copy.json`);
