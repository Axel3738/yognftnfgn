// prisprov.mjs — Shopifys egen prisräkning för paketen, utan att röra någon vagn eller order.
// Skapar korgar med Storefront-API:ts cartCreate (samma räkning som kassan) med den publika token som
// Shopify själv lägger i varje sida (shopify-features). Läs-bart: inga koder och inga ordrar skapas.
//
//   node matstrumpor/marknader/gava/prisprov.mjs          # alla fall, ✅/❌ mot väntat pris
//
// Facit: köp 1 få 1 per sort (de dyraste betalas när sorterna blandas) och ett gratis par ätpinnar
// per låda. Variant B (Sverige): 1 låda 399, 2 lådor 499, 3 lådor 748,50, 4 lådor 799.

const V = { s: 'gid://shopify/ProductVariant/52506473365843', d: 'gid://shopify/ProductVariant/52510025253203', p: 'gid://shopify/ProductVariant/52579705225555', c: 'gid://shopify/ProductVariant/52940241207635' };
const A = ['SUSHI-K1F1', 'PAKET-1', 'PAKET-3', 'PAKET-5'];
const B = ['SUSHI-1FOR399', 'SUSHI-2FOR499', 'SUSHI-4FOR799'];
const sov = (ms) => new Promise((r) => setTimeout(r, ms));

export async function token() {
  const html = await (await fetch('https://matstrumpor.se/?country=SE', { headers: { 'user-agent': 'Mozilla/5.0 Chrome/126', 'accept-language': 'sv-SE' } })).text();
  const m = html.match(/<script id="shopify-features" type="application\/json">([\s\S]*?)<\/script>/);
  if (!m) throw new Error('shopify-features saknas i sidan');
  return JSON.parse(m[1]).accessToken;
}

export async function korg(tok, land, rader, koder) {
  const q = `mutation($i: CartInput!) @inContext(country: ${land}) { cartCreate(input: $i) { cart { cost { totalAmount { amount currencyCode } } discountCodes { code applicable } } userErrors { message } } }`;
  for (let f = 0; f < 3; f++) {
    const r = await fetch('https://matstrumpor.se/api/2025-07/graphql.json', { method: 'POST', headers: { 'content-type': 'application/json', 'x-shopify-storefront-access-token': tok },
      body: JSON.stringify({ query: q, variables: { i: { lines: rader.filter(([, n]) => n > 0).map(([id, quantity]) => ({ merchandiseId: id, quantity })), discountCodes: koder } } }) });
    if (r.status === 429) { await sov(4000); continue; }
    const c = (await r.json()).data?.cartCreate?.cart;
    if (!c) throw new Error(`cartCreate ${r.status}`);
    return { total: Number(c.cost.totalAmount.amount), valuta: c.cost.totalAmount.currencyCode, koder: c.discountCodes.filter((d) => d.applicable).map((d) => d.code) };
  }
  throw new Error('429 tre gånger');
}

export const FALL = [
  ['SE 2 lådor + 2 par, bara paketväljarens kod (som före synken)', 'SE', [[V.s, 2], [V.c, 2]], ['SUSHI-K1F1'], 399],
  ['SE samma paket två gånger, bara paketväljarens kod', 'SE', [[V.s, 4], [V.c, 4]], ['SUSHI-K1F1'], 798],
  ['SE fyrpaketet, bara SUSHI-K2F2', 'SE', [[V.s, 4], [V.c, 4]], ['SUSHI-K2F2'], 798],
  ...[1, 2, 3, 4, 5, 6].map((n) => [`SE ${n} sushi + ${n} par, synkens koder`, 'SE', [[V.s, n], [V.c, n]], A, 399 * Math.ceil(n / 2)]),
  ['SE 3 donut + 3 par, donutens kod + hjälpkoderna', 'SE', [[V.d, 3], [V.c, 3]], ['DONUT-K1F1', 'PAKET-1', 'PAKET-3', 'PAKET-5'], 598],
  ['SE 2 sushi + 2 pizza + 4 par (pizzorna betalas)', 'SE', [[V.s, 2], [V.p, 2], [V.c, 4]], A, 898],
  ['SE 2 sushi + 1 pizza + 3 par', 'SE', [[V.s, 2], [V.p, 1], [V.c, 3]], A, 848],
  ['DE 2 + 2', 'DE', [[V.s, 2], [V.c, 2]], A, 44.9],
  ['DE 3 + 3', 'DE', [[V.s, 3], [V.c, 3]], A, 89.8],
  ['US 1 + 1', 'US', [[V.s, 1], [V.c, 1]], A, 69],
  ['JP 2 + 2', 'JP', [[V.s, 2], [V.c, 2]], A, 7980],
  ['NO 4 + 4', 'NO', [[V.s, 4], [V.c, 4]], A, null],
  ...[[1, 399], [2, 499], [3, 748.5], [4, 799]].map(([n, kr]) => [`SE variant B ${n} + ${n}, B-nivåernas tre koder`, 'SE', [[V.s, n], [V.c, n]], B, kr]),
];

if (process.argv[1] && process.argv[1].endsWith('prisprov.mjs')) {
  const tok = await token();
  let fel = 0;
  for (const [namn, land, rader, koder, vantat] of FALL) {
    try {
      const x = await korg(tok, land, rader, koder);
      const ok = vantat == null ? null : Math.abs(x.total - vantat) < 0.005;
      if (ok === false) fel++;
      console.log(`${ok === null ? 'ℹ️ ' : ok ? '✅' : '❌'} ${namn}: ${x.total} ${x.valuta}${vantat != null ? ` (väntat ${vantat})` : ''} · gäller: ${x.koder.join(', ') || 'ingen kod'}`);
    } catch (e) { fel++; console.log(`⚪ ${namn}: ${e.message}`); }
    await sov(500);
  }
  console.log(fel ? `\n❌ ${fel} fall avviker` : '\n✅ alla fall som väntat');
  process.exit(fel ? 1 : 0);
}
