// Batch 9 — prismatris ur offert "11" (ark B, 2026-09-12).
// Arket har ett block per produkt (Qty 1/2/3); Qty 1-raden är styckkostnaden.
// Kolumnerna ligger ett steg till vänster jämfört med batch 8 (SE-total kol 11, NO kol 21).
import { readFileSync } from 'node:fs';
const FX = { SE: 9.4698, NO: 9.2989 };
const AVGIFT_USD = 2.9 / 0.856026;                 // 2,9 € per ORDER — bara SE
const MED_AVGIFT = new Set(['SE']);
const nio = (x) => { const n = Math.ceil(x / 10) * 10 - 1; return n < x ? n + 10 : n; };
// Ark A ("Leverantorsoffert-2026-09-10") — samma kolumner. Väljs med ARK=a.
export const RADER_A = [
  { rad: 8,  id: 'spakapell',      namn: 'Spa-/badtunnekapell 215×70 210D', mal: 699 },
  { rad: 12, id: 'vedstallskapell', namn: 'Vedställskapell 122×61×106 med fönster', mal: 899 },
  { rad: 16, id: 'solcellsladdare', namn: '12V 10W MPPT solcellsladdare', mal: 899 },
];
export const RADER = [
  { rad: 8,  id: 'snoblasarkapell', namn: 'Snow blower cover 120×82×60', mal: 599 },
  { rad: 12, id: 'honsgardsduk',    namn: 'Chicken coop tarp 145×109', mal: 999 },
  { rad: 20, id: 'snoflingor',      namn: 'Snöflingor garageport', mal: 349 },
  { rad: 24, id: 'vattenskal',      namn: 'Isfria vattenskålen 2,2 L', mal: 699 },
  { rad: 32, id: 'atvkapell',       namn: 'ATV-kapell 3XL', mal: 899 },
  { rad: 36, id: 'snoskyffel',      namn: 'Snöskyffel Makita (bare metal)', mal: 1799 },
  { rad: 40, id: 'kajakhallare',    namn: 'Kajakhållare 2-pack', mal: 499 },
  { rad: 44, id: 'motorlas',        namn: 'Motorlås utombordare', mal: 599 },
  { rad: 48, id: 'varmesits',       namn: 'Värmesits 45×90', mal: 599 },
  { rad: 56, id: 'taljset',         namn: 'Täljset 30 delar', mal: 899 },
  { rad: 60, id: 'varmeljus',       namn: 'LED-värmeljus 24-pack (utan fjärr)', mal: null },
  { rad: 64, id: 'blockljus',       namn: 'LED-blockljus 3-pack med fjärr', mal: null },
];
const KOL = { SE: 11, NO: 21 };
const ARK = process.env.ARK || 'b';
const csv = readFileSync(process.argv[2] || `/tmp/b9/${ARK}/offert.csv`, 'utf8');
const rows = []; { let f = '', r = [], q = false;
  for (let i = 0; i < csv.length; i++) { const c = csv[i];
    if (q) { if (c === '"' && csv[i + 1] === '"') { f += '"'; i++; } else if (c === '"') q = false; else f += c; }
    else if (c === '"') q = true; else if (c === ',') { r.push(f); f = ''; }
    else if (c === '\n') { r.push(f); rows.push(r); r = []; f = ''; } else if (c !== '\r') f += c; }
  if (f || r.length) { r.push(f); rows.push(r); } }
const ut = [];
for (const p of (ARK === 'a' ? RADER_A : RADER)) {
  const rad = rows[p.rad] || [];
  const post = { id: p.id, namn: p.namn, mal: p.mal, lank: (rad[13] || '').split('?')[0], variant: rad[16] || null, land: {} };
  for (const k of ['SE', 'NO']) {
    const rå = (rad[KOL[k]] || '').trim(); const usd = Number(rå.replace(',', '.'));
    if (!rå || !Number.isFinite(usd)) { post.land[k] = { blockerad: rå || 'saknas' }; continue; }
    const bas = MED_AVGIFT.has(k) ? usd + AVGIFT_USD : usd;
    const pris = nio(bas * 3 * FX[k]);
    post.land[k] = { usd: +usd.toFixed(2), cogs: +(usd * FX[k]).toFixed(2), pris, jamfor: nio(pris * 1.3) };
  }
  ut.push(post);
}
if (process.argv.includes('--json')) { console.log(JSON.stringify(ut, null, 1)); process.exit(0); }
for (const r of ut) { console.log(`\n${r.id.padEnd(16)} ${r.namn}${r.variant ? '  [' + r.variant.slice(0, 60) + ']' : ''}`);
  for (const k of ['SE', 'NO']) { const l = r.land[k];
    if (l.blockerad) { console.log(`  ${k}: ⛔ ${l.blockerad}`); continue; }
    const mal = r.mal && k === 'SE' ? `   (Axel: ${r.mal} → ${(r.mal / l.cogs).toFixed(2)}x)` : '';
    console.log(`  ${k}: pris ${String(l.pris).padStart(5)}  jämför ${String(l.jamfor).padStart(5)}  cogs ${String(l.cogs).padStart(7)}  ${(l.pris / l.cogs).toFixed(2)}x${mal}`); } }
