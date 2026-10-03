// Konverteringen före och efter förbeställningen, totalt och per land.
// Läser Shopifys egna besöksdata (ShopifyQL, sessions) med appen Fabriken (read_reports).
// Raderna i ShopifyQL bär hel timme i UTC (mätt 2026-10-03 mot ordrarnas createdAt).
//
//   node matstrumpor/forbestallning-cvr.mjs                 # efter = från första hela timmen efter starten
//   node matstrumpor/forbestallning-cvr.mjs --start 2026-10-03T09:00:00Z
//
// Förbeställningen i paketväljaren gick live 2026-10-03 08:46 UTC (grenen
// claude/peaceful-hamilton-1cgxxf). "Före" per land = sedan utlandskampanjerna startade
// 2026-10-02 00:00 UTC, så att länderna jämförs med samma annonser igång.
import { lasButik, skapaKlient } from '../sparning/butik.mjs';

const a = process.argv.slice(2);
const START = Date.parse(a[a.indexOf('--start') + 1] || '2026-10-03T09:00:00Z');
const FORE_SLUT = START - 3600e3; // timmen då det byttes räknas till ingen sida
const NU = Math.floor(Date.now() / 3600e3) * 3600e3; // bara hela timmar
const LANDSTART = Date.parse('2026-10-02T00:00:00Z');

const k = await skapaKlient(lasButik('matstrumpor'));
const q = 'FROM sessions SHOW sessions, sessions_with_cart_additions, sessions_that_reached_checkout, sessions_that_completed_checkout GROUP BY hour, session_country SINCE -10d UNTIL today';
const d = await k.graphql('query($q:String!){ shopifyqlQuery(query: $q) { tableData { rows } parseErrors } }', { q });
const rader = d.shopifyqlQuery.tableData.rows;

const summa = (f) => rader.filter(f).reduce((s, r) => ({
  bes: s.bes + +r.sessions, korg: s.korg + +r.sessions_with_cart_additions,
  kassa: s.kassa + +r.sessions_that_reached_checkout, kop: s.kop + +r.sessions_that_completed_checkout,
}), { bes: 0, korg: 0, kassa: 0, kop: 0 });
const pct = (x, n) => (n ? (100 * x / n).toFixed(2) : '–') + ' %';
const rad = (s) => `${String(s.bes).padStart(6)} besök  i korgen ${pct(s.korg, s.bes).padStart(8)}  köp ${pct(s.kop, s.bes).padStart(8)}  (${s.kop} köp)`;
const i = (r, fr, ti) => { const t = Date.parse(r.hour); return t >= fr && t < ti; };

const timmar = (NU - START) / 3600e3;
console.log(`Efter: ${new Date(START).toISOString()} → ${new Date(NU).toISOString()} (${timmar} hela timmar)\n`);
console.log('ALLA LÄNDER');
console.log('  efter                    ', rad(summa((r) => i(r, START, NU))));
for (const dag of [1, 2, 7]) console.log(`  samma klocka ${dag} dygn före`.padEnd(27), rad(summa((r) => i(r, START - dag * 864e5, NU - dag * 864e5))));
console.log('  7 dygn före, alla timmar ', rad(summa((r) => i(r, START - 7 * 864e5, FORE_SLUT))));

console.log('\nPER LAND (före = sedan 2 okt 00 UTC)');
const lander = [...new Set(rader.map((r) => r.session_country))];
const per = lander.map((l) => ({ l, f: summa((r) => r.session_country === l && i(r, LANDSTART, FORE_SLUT)), e: summa((r) => r.session_country === l && i(r, START, NU)) }))
  .filter((p) => p.f.bes + p.e.bes >= 20).sort((x, y) => y.f.bes + y.e.bes - x.f.bes - x.e.bes);
for (const p of per) console.log(`  ${p.l.padEnd(15)} före ${rad(p.f)}\n  ${''.padEnd(15)} efter${rad(p.e)}`);
console.log('\n⚠️ Under cirka 30 köp på en sida säger skillnaden ingenting. Ett köp hit eller dit flyttar procenten mycket.');
