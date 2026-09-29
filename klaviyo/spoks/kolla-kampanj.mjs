// Kontrollera EN eller flera kampanjfiler mot copyreglerna och konverteringen, utan att
// röra payload/ eller plan.json.
//
//   node klaviyo/spoks/kolla-kampanj.mjs klaviyo/innehall/baverbutiken/kampanjer/k23-*.json
//   node klaviyo/spoks/kolla-kampanj.mjs --brand baverbutiken --alla-nya   # alla k23+ (id ≥ 23)
//
// Skriver FEL (samma regler som konvertera.mjs --kolla: tankstreck, procent, belopp,
// leveranstid, falsk brådska, garanti, tretest, tre ämnesrader) och VARNINGAR
// (produkt som saknas i Spoks, citat utan recensionscache). Exit 1 vid fel.
// Byggt 2026-09-28 för de dagliga kampanjerna: konvertera.mjs --kolla stoppar på
// K11/K12 (rabatt black_week saknar procentlista i brandfilen), så nya filer
// kontrolleras var för sig.

import fs from 'node:fs';
import path from 'node:path';
import { ROT, skapaKonverterare, lasBrand, lasProduktIds, lasRecensioner } from './konvertera.mjs';

const arg = (n, std) => { const i = process.argv.indexOf(n); return i >= 0 ? process.argv[i + 1] : std; };
const brandId = arg('--brand', 'baverbutiken');
const brand = lasBrand(brandId);
const erbjudande = brand.erbjudande_fran === null ? null : JSON.parse(fs.readFileSync(path.join(ROT, 'mejl', 'konfig.json'), 'utf8')).erbjudande;
const K = skapaKonverterare({ brand, produktIds: lasProduktIds(brandId), recCache: lasRecensioner(brand, brandId), erbjudande });

let filer = process.argv.slice(2).filter((a) => a.endsWith('.json'));
if (process.argv.includes('--alla-nya')) {
  const mapp = path.join(ROT, 'klaviyo', 'innehall', brandId, 'kampanjer');
  filer = fs.readdirSync(mapp).filter((f) => /^k(\d+)-/.test(f) && Number(/^k(\d+)-/.exec(f)[1]) >= 23).sort().map((f) => path.join(mapp, f));
}
if (!filer.length) { console.error('Ange kampanjfiler eller --alla-nya.'); process.exit(2); }

let felTotalt = 0;
for (const f of filer) {
  let d;
  try { d = JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { console.log(`${path.basename(f)}: OGILTIG JSON (${e.message})`); felTotalt++; continue; }
  const m = { ...(d.mejl ?? d), id: (d.mejl ?? d).id ?? d.id };
  const fel = K.kontrollera(m);
  // Namnmönstret, datum, segment och de fält uppladdningen behöver.
  // Löpnumret efter koden (GT_2) är valfritt men brukligt, som i k05/k15.
  if (!/^MAIL_\d{8}_[A-Za-z]+_[A-Z]+(?:_\d+)?_[a-z0-9-]+_[a-z]+_[a-z0-9-]+_v\d+$/.test(d.namn ?? '')) fel.push(`${m.id}: namn följer inte MAIL_<datum>_<Prefix>_<KOD>[_<n>]_<publik>_<awareness>_<slug>_vN ("${d.namn}")`);
  if (!/^\d{4}-\d{2}-\d{2}T18:00:00\+02:00$/.test(d.planerad ?? '')) fel.push(`${m.id}: planerad ska vara <datum>T18:00:00+02:00 ("${d.planerad}")`);
  if (!Array.isArray(d.segment) || !d.segment.length) fel.push(`${m.id}: segment saknas`);
  if (!m.forhandstext) fel.push(`${m.id}: förhandstext saknas`);
  if (!m.memo) fel.push(`${m.id}: memo saknas`);
  for (const b of m.block ?? []) {
    if (b.typ === 'citat') fel.push(`${m.id}: citat-block används inte i de dagliga kampanjerna (ingen recensionscache i containern)`);
    if (b.typ === 'erbjudande') fel.push(`${m.id}: erbjudande-blocket (lyckohjulet) är avvecklat`);
  }
  if (/bäverbutiken/i.test(JSON.stringify(m.block ?? []) + (m.amnesrader ?? []).map((a) => a.text).join(' ') + (m.forhandstext ?? ''))) fel.push(`${m.id}: butikens namn i budskapet (hör hemma i avsändaren och sidfoten)`);
  const p = K.konverteraMejl(m);
  const varningar = p.varningar.filter((v) => !/Inga recensioner/.test(v));
  const status = fel.length ? `FEL ${fel.length}` : 'OK';
  console.log(`${path.basename(f)}: ${status}${varningar.length ? ` (${varningar.length} varningar)` : ''} · ${p.blocks.length} block · ämnesrad "${p.emailTitle}"`);
  for (const x of fel) console.log(`  FEL  ${x}`);
  for (const v of varningar) console.log(`  VARN ${v}`);
  felTotalt += fel.length;
}
process.exit(felTotalt ? 1 : 0);
