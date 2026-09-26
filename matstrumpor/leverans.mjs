// Leveranstiden mätt ur Shopify: order lagd → fraktbolagets leveransskanning
// (`fulfillments.deliveredAt`, som spårningsrutinen skriver ur 17TRACK varje
// timme). Samma mätning som klaviyo/brands/matstrumpor.json →
// leverans_p90_comment, men körbar när som helst: sidkollen jämför sidans
// löfte ("5–10 arbetsdagar") med det här talet, aldrig med minnet.
//
//   node matstrumpor/leverans.mjs [--dagar 45] [--json]
//
// ⚠️ Räkna aldrig på lage.json:s `senast` — det är rutinens kontrolltid, inte
// skanningens (lärdom 2026-09-25, gav p90 25,6 i stället för 14,9).
import { fileURLToPath } from 'node:url';

/** Kalenderdygn mellan två tidpunkter (decimal). */
export function dygn(a, b) {
  return (new Date(b) - new Date(a)) / 864e5;
}

/** Hela arbetsdagar (mån–fre) som passerar mellan två tidpunkter. */
export function arbetsdagar(a, b) {
  const d = new Date(a);
  const slut = new Date(b);
  let n = 0;
  while (d < slut) {
    d.setUTCDate(d.getUTCDate() + 1);
    const v = d.getUTCDay();
    if (v !== 0 && v !== 6) n++;
  }
  return n;
}

/** Percentil ur en STIGANDE sorterad lista (närmaste rang, som klaviyo-mätningen). */
export function percentil(sorterat, p) {
  if (!sorterat.length) return null;
  return sorterat[Math.min(sorterat.length - 1, Math.floor(p * sorterat.length))];
}

/**
 * Statistik ur rader { lagd, lev } (ISO-tider; lev = null när paketet inte är framme).
 * `loftMaxArbetsdagar` = sidans löfte (10) — andelen över löftet står i svaret.
 */
export function leveransStatistik(rader, { loftMaxArbetsdagar = 10, nu = new Date() } = {}) {
  const lev = rader.filter((r) => r.lev && r.lagd).map((r) => ({ d: dygn(r.lagd, r.lev), ab: arbetsdagar(r.lagd, r.lev) }));
  const d = lev.map((x) => x.d).sort((a, b) => a - b);
  const ab = lev.map((x) => x.ab).sort((a, b) => a - b);
  const over = lev.filter((x) => x.ab > loftMaxArbetsdagar).length;
  const ejFramme = rader.filter((r) => !r.lev && r.lagd);
  const r1 = (x) => (x == null ? null : Math.round(x * 10) / 10);
  return {
    antal: rader.length,
    levererade: lev.length,
    dygn: { p25: r1(percentil(d, 0.25)), median: r1(percentil(d, 0.5)), p75: r1(percentil(d, 0.75)), p90: r1(percentil(d, 0.9)), max: r1(d[d.length - 1] ?? null) },
    arbetsdagar: { median: percentil(ab, 0.5), p90: percentil(ab, 0.9), max: ab[ab.length - 1] ?? null },
    loft_max_arbetsdagar: loftMaxArbetsdagar,
    over_loftet: { antal: over, andel: lev.length ? Math.round((100 * over) / lev.length) : null },
    ej_framme_over_14_dygn: ejFramme.filter((r) => dygn(r.lagd, nu) > 14).length,
  };
}

/** Läser ordrarna ur Shopify (fabrikens app, sparning/butik.mjs) och mäter. */
export async function matLeverans({ dagar = 45, nu = new Date(), loftMaxArbetsdagar = 10, klient = null } = {}) {
  if (!klient) {
    const { lasButik, skapaKlient } = await import('../sparning/butik.mjs');
    klient = await skapaKlient(lasButik('matstrumpor'));
  }
  const fran = new Date(nu.getTime() - dagar * 864e5).toISOString().slice(0, 10);
  const rader = [];
  let after = null;
  for (let i = 0; i < 20; i++) {
    const d = await klient.graphql(
      `query($after: String, $q: String!) { orders(first: 50, after: $after, sortKey: CREATED_AT, reverse: true, query: $q) { pageInfo { hasNextPage endCursor } nodes { createdAt cancelledAt fulfillments { deliveredAt } } } }`,
      { after, q: `created_at:>=${fran}` }
    );
    for (const o of d.orders.nodes) {
      if (o.cancelledAt) continue;
      for (const f of o.fulfillments) rader.push({ lagd: o.createdAt, lev: f.deliveredAt ?? null });
    }
    if (!d.orders.pageInfo.hasNextPage) break;
    after = d.orders.pageInfo.endCursor;
  }
  return { ...leveransStatistik(rader, { loftMaxArbetsdagar, nu }), matt: nu.toISOString(), fonster_dagar: dagar, kalla: 'Shopify orders.fulfillments.deliveredAt' };
}

export function beskriv(s) {
  if (!s.levererade) return `Inga levererade paket i fönstret (${s.antal} ordrar).`;
  return `${s.levererade} levererade av ${s.antal} ordrar: order → framme median ${s.dygn.median} dygn, p90 ${s.dygn.p90}, max ${s.dygn.max}. ` +
    `I arbetsdagar median ${s.arbetsdagar.median}, p90 ${s.arbetsdagar.p90}. Över löftet ${s.loft_max_arbetsdagar} arbetsdagar: ${s.over_loftet.antal} st (${s.over_loftet.andel} %).` +
    (s.ej_framme_over_14_dygn ? ` Ej framme efter 14 dygn: ${s.ej_framme_over_14_dygn}.` : '');
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const arg = process.argv.slice(2);
  const i = arg.indexOf('--dagar');
  const dagar = i >= 0 ? Number(arg[i + 1]) : 45;
  const s = await matLeverans({ dagar });
  if (arg.includes('--json')) console.log(JSON.stringify(s, null, 2));
  else console.log(beskriv(s));
}
