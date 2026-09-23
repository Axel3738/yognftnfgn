// Prismatris batch 11–13. SE = nio((landat + 2,9 €) × 3 × 9,4698), NO = nio(landat × 3 × 9,2989),
// jämför = nio(pris × 1,3), cogs = landat × kurs. Kurser låsta i temu/cogs/README.md.
//   node temu/batch11/priser.mjs          # tabell
//   node temu/batch11/priser.mjs --json   # för skapa.mjs
import { FAKTA } from './fakta.mjs';
const FX = { SE: 9.4698, NO: 9.2989 };
const AVGIFT_USD = 2.9 / 0.856026;
const nio = (x) => { const n = Math.ceil(x / 10) * 10 - 1; return n < x ? n + 10 : n; };
export const PRIS = Object.entries(FAKTA).map(([id, f]) => {
  const se = f.landat.se, no = f.landat.no;
  const prisSE = nio((se + AVGIFT_USD) * 3 * FX.SE), prisNO = nio(no * 3 * FX.NO);
  return { id, land: {
    SE: { usd: se, pris: prisSE, jamfor: nio(prisSE * 1.3), cogs: +(se * FX.SE).toFixed(2) },
    NO: { usd: no, pris: prisNO, jamfor: nio(prisNO * 1.3), cogs: +(no * FX.NO).toFixed(2) },
  } };
});
const direkt = process.argv[1] && import.meta.url.endsWith(process.argv[1].split('/').pop());
if (direkt && process.argv.includes('--json')) console.log(JSON.stringify(PRIS));
else if (direkt) {
  console.log('id                  status  SE usd   SE pris/jämför  cogs     NO usd   NO pris/jämför  cogs');
  for (const p of PRIS) { const f = FAKTA[p.id], s = p.land.SE, n = p.land.NO;
    console.log(`${p.id.padEnd(19)} ${f.status.padEnd(6)} ${String(s.usd).padStart(6)}  ${String(s.pris).padStart(5)} / ${String(s.jamfor).padStart(5)}   ${String(s.cogs).padStart(7)}  ${String(n.usd).padStart(6)}  ${String(n.pris).padStart(5)} / ${String(n.jamfor).padStart(5)}   ${String(n.cogs).padStart(7)}`); }
}
