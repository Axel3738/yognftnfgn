// kolla-egna.mjs <KOD> <video> — maskinkontrollen av en lokaliserad röstvideo-fil (egna/<KOD>/<video>.json).
// Exit 1 om något FEL. VARNING stoppar inte.
import { readFileSync, existsSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { kollaSprak, sprakfamilj, heygenSprakFor } from '../../../pipeline/sprak.mjs';

const E = dirname(fileURLToPath(import.meta.url));
const [kod, video] = process.argv.slice(2).map((x, i) => (i === 0 ? x.toUpperCase() : x));
const FORBJUDET = [
  [/matstrump/i, 'butiksnamnet'], [/\w\.se\b|\b(punkt|dot|punto|ponto|kropka|point|piste) se\b/i, 'domänen'],
  [/\b(kr|kronor|kroner|sek|nok|dkk|eur|euro|euros|usd|dollar|dollars|złotych|zł|pln)\b/i, 'valuta/belopp'],
  [/[€$£%&\/]/, 'symbol'], [/[–—]/, 'tankstreck'], [/\d/, 'siffra (ska skrivas som ord)'],
  [/sverige|svensk|sweden|swedish|schwed|suède|suédois|zweed|zweeds|suecia|sueco|svezia|svedese|szwecj|szwedzk|suécia|ruotsi|scandinav|skandinav/i, 'Sverige/svensk'],
  [/\b(gratis frakt|fri frakt|free shipping|kostenlos|livraison|verzending|envío|spedizione|dostawa|envio|garanti|guarantee|garantie|garantía|garanzia|gwarancj|garantia)\b/i, 'nytt löfte'],
];
const SVENSKA = ['strumpor', 'låda', 'lådan', 'present', 'presenten', 'mamma', 'grejer', 'faktiskt', 'riktig', 'också', 'verkligen', 'sushistrumpor', 'klicka', 'länken'];
const fel = [], varn = [];
const manus = JSON.parse(readFileSync(`${E}/${video}.manus.json`, 'utf8')).filter((s) => !s.stryk);
const bild = JSON.parse(readFileSync(`${E}/bildtexter.sv.json`, 'utf8'))[video] ?? {};
const fil = `${E}/${kod}/${video}.json`;
if (!existsSync(fil)) { console.log(`❌ ${kod} ${video} FEL: filen saknas (${fil})`); process.exit(1); }
const d = JSON.parse(readFileSync(fil, 'utf8'));
const seg = d.segment ?? [];
if (seg.length !== manus.length) fel.push(`segmentantal ${seg.length}, ska vara ${manus.length}`);
const allText = [];
const kolla = (t, var_) => {
  if (!t || !String(t).trim()) { fel.push(`${var_}: tom text`); return; }
  for (const [re, vad] of FORBJUDET) { const m = re.exec(t); if (m && !(vad === 'symbol' && m[0] === '/' && false)) fel.push(`${var_}: ${vad} ("${m[0]}")`); }
  const ord = t.toLowerCase().match(/[\p{L}]+/gu) ?? [];
  // ord som också är marknadens eget (it/no "mamma", en "present") räknas inte som svenska
  const TILLATET = { US: ['present'], IT: ['mamma'], NO: ['mamma'] }[kod] ?? [];
  const kvar = ord.filter((o) => SVENSKA.includes(o) && !TILLATET.includes(o));
  if (kvar.length) fel.push(`${var_}: svenska ord kvar (${kvar.join(', ')})`);
};
for (let i = 0; i < Math.min(seg.length, manus.length); i++) {
  const s = seg[i], m = manus[i];
  if (Math.abs(s.a - m.a) > 0.001 || Math.abs(s.b - m.b) > 0.001) fel.push(`segment ${i + 1}: tiderna ${s.a}–${s.b} ≠ ${m.a}–${m.b}`);
  if (s.sv !== m.sv) fel.push(`segment ${i + 1}: sv-raden ändrad`);
  kolla(s.text, `segment ${i + 1}`);
  allText.push(s.text ?? '');
  const kvot = (s.text ?? '').length / Math.max(1, m.sv.length);
  const ordps = ((s.text ?? '').match(/[\p{L}']+/gu) ?? []).length / Math.max(0.3, m.b - m.a);
  if (kvot > 1.45) fel.push(`segment ${i + 1}: ${Math.round(kvot * 100)} % av svenskans längd — hinns inte med`);
  else if (kvot > 1.3) varn.push(`segment ${i + 1}: ${Math.round(kvot * 100)} % av svenskans längd`);
  if (ordps > 4.2) varn.push(`segment ${i + 1}: ${ordps.toFixed(1)} ord/s`);
}
const t = d.texter ?? {};
for (const [k, v] of Object.entries(bild)) {
  if (Array.isArray(v)) {
    if (!Array.isArray(t[k]) || t[k].length !== v.length) { fel.push(`texter.${k}: ska vara ${v.length} rader`); continue; }
    t[k].forEach((x, i) => { kolla(x, `texter.${k}[${i}]`); if (x.length > v[i].length * 1.4) varn.push(`texter.${k}[${i}] ${x.length} tecken mot ${v[i].length}`); allText.push(x); });
  } else {
    kolla(t[k], `texter.${k}`); if ((t[k] ?? '').length > v.length * 1.4) varn.push(`texter.${k} ${(t[k] ?? '').length} tecken mot ${v.length}`); allText.push(t[k] ?? '');
  }
}
const fam = sprakfamilj(heygenSprakFor(kod));
const sk = kollaSprak(allText.join(' '), fam);
if (sk.ok === false) fel.push(`språkkollen: ${sk.skal}`);
console.log(`${fel.length ? '❌' : '✅'} ${kod} ${video}${fel.length ? ' FEL: ' + fel.join(' | ') : ''}${varn.length ? ' · varning: ' + varn.join(' | ') : ''}`);
process.exit(fel.length ? 1 : 0);
