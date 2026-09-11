// Batch 8 — prismatris ur offerten "9" (2026-09-11).
// Arket har ett block per produkt med tre rader (Qty 1/2/3). Qty 1 är
// styckkostnaden; rad-indexen nedan är produkternas Qty1-rader i CSV:n.
// Raden under produktnamnet är ibland en svensk undertitel, inte en produkt —
// därför läses raderna explicit i stället för att gissa blockgränser.
import { readFileSync } from 'node:fs';

const FX = { SE: 9.4698, NO: 9.2989 };
const AVGIFT_USD = 2.9 / 0.856026;               // 2,9 € per ORDER — i priset, aldrig i cogs
const MED_AVGIFT = new Set(['SE']);              // NO betalar ingen sådan avgift
const nio = (x) => { const n = Math.ceil(x / 10) * 10 - 1; return n < x ? n + 10 : n; };

const RADER = [
  { rad: 4, id: 'sotarset', namn: 'Flexible Chimney Sweep Set', mal: 599 },
  { rad: 12, id: 'vedborr', namn: 'Wood Drill Bit Twist Firewood Splitting', mal: 699 },
  { rad: 16, id: 'hangrannerensare', namn: 'Gutter Cleaner MAX', mal: 499 },
  { rad: 20, id: 'tofflor', namn: 'Heavy duty inside warm slippers', mal: null },
  { rad: 24, id: 'solcellslampa', namn: 'Outdoor smart sensor lamp', mal: null },
  { rad: 28, id: 'bilborste', namn: 'Car Washer Mop Foam Wash Brush', mal: 499 },
  { rad: 32, id: 'fonsterlarm', namn: 'New 110dB Door And Window Vibration Alarm', mal: 499 },
];
const KOL = { SE: 12, NO: 22 };                  // "Total ex. tax" per land, Qty 1

const csv = readFileSync(process.argv[2] || '/tmp/b8/offert.csv', 'utf8');
const rows = [];
{ // minimal CSV-parser som klarar citerade fält med radbrytningar
  let f = '', r = [], q = false;
  for (let i = 0; i < csv.length; i++) {
    const c = csv[i];
    if (q) { if (c === '"' && csv[i + 1] === '"') { f += '"'; i++; } else if (c === '"') q = false; else f += c; }
    else if (c === '"') q = true;
    else if (c === ',') { r.push(f); f = ''; }
    else if (c === '\n') { r.push(f); rows.push(r); r = []; f = ''; }
    else if (c !== '\r') f += c;
  }
  if (f || r.length) { r.push(f); rows.push(r); }
}

const ut = [];
for (const p of RADER) {
  const rad = rows[p.rad] || [];
  const post = { id: p.id, namn: p.namn, mal: p.mal, lank: (rad[14] || '').split('?')[0], variant: rad[18] || null, land: {} };
  for (const k of ['SE', 'NO']) {
    const rå = (rad[KOL[k]] || '').trim();
    const usd = Number(rå.replace(',', '.'));
    if (!rå || !Number.isFinite(usd)) { post.land[k] = { blockerad: rå || 'saknas' }; continue; }
    const bas = MED_AVGIFT.has(k) ? usd + AVGIFT_USD : usd;
    const pris = nio(bas * 3 * FX[k]);
    post.land[k] = { usd: +usd.toFixed(2), cogs: +(usd * FX[k]).toFixed(2), pris, jamfor: nio(pris * 1.3) };
  }
  ut.push(post);
}
if (process.argv.includes('--json')) { console.log(JSON.stringify(ut, null, 1)); process.exit(0); }
for (const r of ut) {
  console.log(`\n${r.id.padEnd(18)} ${r.namn}`);
  if (r.variant) console.log(`  variant: ${r.variant}`);
  for (const k of ['SE', 'NO']) {
    const l = r.land[k];
    if (l.blockerad) { console.log(`  ${k}: ⛔ ${l.blockerad}`); continue; }
    const mal = r.mal && k === 'SE' ? `   (Axels tanke: ${r.mal} kr → ${(r.mal / l.cogs).toFixed(2)}x)` : '';
    console.log(`  ${k}: pris ${String(l.pris).padStart(5)}  jämför ${String(l.jamfor).padStart(5)}  cogs ${String(l.cogs).padStart(7)}  marginal ${(l.pris / l.cogs).toFixed(2)}x${mal}`);
  }
}
