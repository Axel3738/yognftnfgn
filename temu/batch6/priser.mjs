import { lasOffert, renUrl } from '/home/user/yognftnfgn/temu/offert.mjs';
import { readFileSync } from 'node:fs';
const FX = { SE: 9.4698, NO: 9.2989, DK: 6.3960, FI: 0.856026, UK: 0.73331 };
const AVGIFT_USD = 2.9 / 0.856026;          // 2,9 € per ORDER, ingår i priset men aldrig i cogs
const MED_AVGIFT = new Set(['SE', 'DK', 'FI']);
const nio = (x) => { const n = Math.ceil(x / 10) * 10 - 1; return n < x ? n + 10 : n; };
const eur = (x) => Math.ceil(x) - 0.1 < x ? Math.floor(x) + 1 + 0.9 : Math.floor(x) + 0.9;
const gbp = (x) => Math.floor(x) + 0.99 < x ? Math.floor(x) + 1 + 0.99 : Math.floor(x) + 0.99;
const rund = { SE: nio, NO: nio, DK: nio, FI: eur, UK: gbp };

const p = lasOffert(readFileSync('/tmp/fix/b6/offert.csv', 'utf8')).filter((x) => x.harQuote);
const ut = [];
for (const x of p) {
  const rad = { namn: x.namn, temu: renUrl(x.temu), variant: x.variant, notering: x.notering, land: {} };
  for (const k of ['SE', 'NO', 'DK', 'FI', 'UK']) {
    const usd = x.land[k].total;
    if (usd == null) { rad.land[k] = null; continue; }
    const bas = MED_AVGIFT.has(k) ? usd + AVGIFT_USD : usd;
    const pris = rund[k](bas * 3 * FX[k]);
    rad.land[k] = { usd, cogs: +(usd * FX[k]).toFixed(2), pris, jamfor: rund[k](pris * 1.3) };
  }
  ut.push(rad);
}
console.log(JSON.stringify(ut, null, 1));
console.log('\n%s', '='.repeat(96));
for (const r of ut) {
  console.log(`\n${r.namn}`);
  for (const k of ['SE','NO','DK','FI','UK']) {
    const l = r.land[k]; if (!l) { console.log(`  ${k}: —`); continue; }
    console.log(`  ${k}: pris ${String(l.pris).padStart(7)}  jämför ${String(l.jamfor).padStart(7)}  cogs ${String(l.cogs).padStart(7)}  (marginal ${(l.pris/l.cogs).toFixed(2)}x)`);
  }
}
