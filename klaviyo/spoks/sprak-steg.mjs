// Skriver ut exakt det Spoks-anrop ett steg i ett flerspråkigt flöde ska ha —
// så att den som laddar upp (sessionen eller en subagent) aldrig skriver av JSON
// för hand. Läser uppdraget ur klaviyo/output/<brand>/spoks/sprak/uppdrag/<flöde>.json
// (byggt av klaviyo/spoks-sprak.mjs).
//
//   node klaviyo/spoks/sprak-steg.mjs <flöde> <index>          # step-objektet till add_flow_step
//   node klaviyo/spoks/sprak-steg.mjs <flöde> <index> --post   # postData till update_draft_campaign (bara sändsteg)
//   node klaviyo/spoks/sprak-steg.mjs <flöde> --antal          # antal steg
//   --brand <id>   standard matstrumpor

import fs from 'node:fs';
import path from 'node:path';

const HAR = path.dirname(new URL(import.meta.url).pathname);
const ROT = path.resolve(HAR, '..', '..');
const arg = (n, std) => { const i = process.argv.indexOf(n); return i >= 0 ? process.argv[i + 1] : std; };
const [flode, index] = process.argv.slice(2).filter((a, i, alla) => !a.startsWith('--') && alla[i - 1] !== '--brand');
const brand = arg('--brand', 'matstrumpor');
const fil = path.join(ROT, 'klaviyo', 'output', brand, 'spoks', 'sprak', 'uppdrag', `${flode}.json`);
if (!flode || !fs.existsSync(fil)) { console.error(`Hittar inte ${fil} — kör node klaviyo/spoks-sprak.mjs först.`); process.exit(2); }
const u = JSON.parse(fs.readFileSync(fil, 'utf8'));
if (process.argv.includes('--antal')) { console.log(u.steg.length); process.exit(0); }
const s = u.steg[Number(index)];
if (!s) { console.error(`Steg ${index} finns inte (0–${u.steg.length - 1}).`); process.exit(2); }
if (process.argv.includes('--post')) {
  if (!s.post_fil) { console.error(`Steg ${index} är ett väntesteg — inget mejl.`); process.exit(2); }
  console.log(JSON.stringify(JSON.parse(fs.readFileSync(s.post_fil, 'utf8'))));
} else {
  console.log(JSON.stringify({ type: s.type, parameters: s.parameters }));
  if (s.sprak) console.error(`(sändsteg: ${s.sprak} ${s.mejl_id})`);
}
