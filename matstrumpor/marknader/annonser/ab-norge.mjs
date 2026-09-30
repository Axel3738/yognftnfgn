// ab-norge.mjs — A/B-testet i Norge: svenskt varumärke (A) mot norsk sida (B). Läs-bart.
//
//   node matstrumpor/marknader/annonser/ab-norge.mjs                      # från första dagen med spend till i går
//   node matstrumpor/marknader/annonser/ab-norge.mjs --fran 2026-10-01 --till 2026-10-14
//
// Axels beställning 2026-09-29: "vi testar med att det är ett svenskt varumärke, och sen ser vi skillnaden
// efter typ två veckor". A = MATSTRUMP_NO_SALES (matstrumpor.com/nb sedan 2026-09-29 kväll, förut
// matstrumpor.se/nb; brödtexten slutar "Et svensk merke."),
// B = MATSTRUMP_NOB_SALES (matstrumpor.no, norska B-sidan, utan raden). Samma videor, rubriker, pris och
// budget — skillnaden är varumärkesraden i annonsen och sidan kunden landar på.
//
// Två källor, var för sig: Meta (spend, visningar, klick, sidvisningar, köp, ROAS per kampanj, 7 dagars klick)
// och Shopify (ordrar till Norge, delade på landningssidan: matstrumpor.no ⇒ B, matstrumpor.com/nb eller .se/nb ⇒ A,
// allt annat ⇒ okänd). Talen blandas aldrig: Metas köp är pixelns, Shopifys ordrar är butikens.
//
// ⚠️ Norge saknar landad kostnad (matstrumpor/cogs.json → norden, mätt 2026-09-27), så break-even och
// vinstbidrag kan inte räknas. Men produkten, priset och kostnaden är desamma i A och B — med lika spend är
// försäljning per krona (ROAS) och kostnad per köp (CPA) därför samma rangordning som vinstbidraget. Domen
// säger det rakt ut och fäller ingen dom under 300 kr spend eller 3 köp per variant (CLAUDE.md regel 3).

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';

const ROT = dirname(fileURLToPath(import.meta.url));
export const MIN_SPEND = 300;
export const MIN_KOP = 3;
export const P_GRANS = 0.05;

/** Ren: en Shopify-order → 'A', 'B' eller null. utm_campaign (kampanjens id) vinner, sedan
 *  landningssidan i sista besöket, sedan första. Kassasidor och direkttrafik ger null. */
export function klassaOrder(order, { kampanjA, kampanjB } = {}) {
  const besok = [order?.customerJourneySummary?.lastVisit, order?.customerJourneySummary?.firstVisit].filter(Boolean);
  for (const b of besok) {
    const utm = b.utmParameters?.campaign;
    if (utm && kampanjA && utm === kampanjA) return 'A';
    if (utm && kampanjB && utm === kampanjB) return 'B';
  }
  for (const b of besok) {
    let u;
    try { u = new URL(b.landingPage); } catch { continue; }
    const host = u.hostname.replace(/^www\./, '');
    if (u.pathname.includes('/checkouts/')) continue;
    if (host === 'matstrumpor.no') return 'B';
    // A landade på matstrumpor.se/nb till 2026-09-29 och på matstrumpor.com/nb sedan dess (Axel: allt utland via .com).
    if ((host === 'matstrumpor.se' || host === 'matstrumpor.com') && /^\/nb(\/|$)/.test(u.pathname)) return 'A';
  }
  return null;
}

/** Ren: tvåsidigt p-värde för skillnaden mellan två andelar (z-test, normalapproximation). */
export function pVarde(xA, nA, xB, nB) {
  if (!(nA > 0 && nB > 0)) return null;
  const p = (xA + xB) / (nA + nB);
  const se = Math.sqrt(p * (1 - p) * (1 / nA + 1 / nB));
  if (!(se > 0)) return null;
  const z = Math.abs(xA / nA - xB / nB) / se;
  return 2 * (1 - normalFordelning(z));
}

// Abramowitz–Stegun 26.2.17, fel < 7,5e-8.
function normalFordelning(z) {
  const t = 1 / (1 + 0.2316419 * z);
  const d = 0.3989422804014327 * Math.exp(-z * z / 2);
  const s = t * (0.31938153 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
  return 1 - d * s;
}

/** Ren: Metas tal för A och B (tolkaRad-form) → domen. */
export function jamfor(A, B) {
  const nog = (v) => (v.spend_sek ?? 0) >= MIN_SPEND && (v.kop ?? 0) >= MIN_KOP;
  const saknas = [['A', A], ['B', B]].filter(([, v]) => !nog(v)).map(([n, v]) => `${n}: ${fmt(v.spend_sek)} kr, ${v.kop ?? 0} köp`);
  if (saknas.length) return { lage: 'for_lite', text: `För lite data för en dom (kräver minst ${MIN_SPEND} kr och ${MIN_KOP} köp per variant) — ${saknas.join(' · ')}.` };
  // Konvertering från sidvisning till köp: det sidan (A:s svenska mot B:s norska) påverkar.
  const nA = A.lpv ?? A.klick, nB = B.lpv ?? B.klick;
  const p = pVarde(A.kop, nA, B.kop, nB);
  const ledare = (B.roas ?? 0) > (A.roas ?? 0) ? 'B' : (A.roas ?? 0) > (B.roas ?? 0) ? 'A' : null;
  const namn = { A: 'A (svenskt varumärke, .se/nb)', B: 'B (norsk sida, .no)' };
  if (p === null) return { lage: 'okand', p, ledare, text: 'Sidvisningar eller klick saknas i Metas svar — skillnaden går inte att pröva.' };
  if (p >= P_GRANS) return { lage: 'ingen_saker', p, ledare, text: `Ingen säker skillnad än (p = ${p.toFixed(2)}).${ledare ? ` ${namn[ledare]} leder på ROAS, men det kan vara slumpen — låt båda gå vidare.` : ''}` };
  return { lage: 'saker', p, ledare, text: `${ledare ? `${namn[ledare]} vinner` : 'Skillnaden är säker men ROAS är lika'} (p = ${p.toFixed(3)}). Samma produkt, pris och kostnad i båda, så högre ROAS vid lika spend är högre vinstbidrag.` };
}

const fmt = (n) => (n === null || n === undefined ? '—' : Number(n).toLocaleString('sv-SE', { maximumFractionDigits: 2 }));
const pct = (a, b) => (a !== null && a !== undefined && b ? `${((a / b) * 100).toLocaleString('sv-SE', { maximumFractionDigits: 2 })} %` : '—');

/** Ren: rapporten på svenska. */
export function rapport({ fran, till, A, B, ordrar, dom }) {
  const rad = (namn, v) => `| ${namn} | ${fmt(v.spend_sek)} kr | ${fmt(v.impressions)} | ${pct(v.klick, v.impressions)} | ${fmt(v.lpv)} | ${fmt(v.kop)} | ${pct(v.kop, v.lpv ?? v.klick)} | ${fmt(v.roas)} | ${v.cpa_sek === null ? '—' : fmt(v.cpa_sek) + ' kr'} |`;
  const o = (k) => ordrar[k] ?? { antal: 0, sek: 0, nok: 0 };
  return [
    `# A/B-testet i Norge ${fran} – ${till}`,
    '',
    '## Meta (7 dagars klick)',
    '| Variant | Spend | Visningar | CTR | Sidvisningar | Köp | Köp per sidvisning | ROAS | CPA |',
    '|---|---|---|---|---|---|---|---|---|',
    rad('A · svenskt varumärke (.se/nb)', A),
    rad('B · norsk sida (.no)', B),
    '',
    '## Shopify (ordrar till Norge, delade på landningssidan)',
    `- A (.se/nb): ${o('A').antal} ordrar · ${fmt(o('A').nok)} NOK (${fmt(o('A').sek)} kr i butikens valuta)`,
    `- B (.no): ${o('B').antal} ordrar · ${fmt(o('B').nok)} NOK (${fmt(o('B').sek)} kr)`,
    `- Okänd (direkt, kassalänk, annan sida): ${o('okand').antal} ordrar`,
    '',
    '## Dom',
    dom.text,
    '',
    '⚠️ Norges landade kostnad saknas (matstrumpor/cogs.json), så ingen break-even och inget vinstbidrag i kronor. Jämförelsen håller ändå: allt utom varumärkesraden och sidan är lika i A och B.',
  ].join('\n');
}

/** Ren: Metas split-test (ad_studies, typ SPLIT_TEST) med A och B, 50/50, som delar publiken så att ingen
 *  norrman ser båda. start/slut i svensk tid (00:00 startdagen, 23:59 sista dagen). */
export function splitTest({ kampanjA, kampanjB, start, dagar = 14 }) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(start ?? '')) throw new Error('--start YYYY-MM-DD krävs');
  const t0 = Date.parse(`${start}T00:00:00+02:00`) / 1000;
  const t1 = t0 + dagar * 86400 - 60;
  return {
    name: `Matstrumpor Norge: svenskt varumärke (A) mot norsk sida (B) ${start}`,
    description: 'A = MATSTRUMP_NO_SALES (matstrumpor.com/nb, "Et svensk merke."), B = MATSTRUMP_NOB_SALES (matstrumpor.no). matstrumpor/marknader/annonser/ab-norge.mjs',
    type: 'SPLIT_TEST',
    start_time: t0,
    end_time: t1,
    cells: [
      { name: 'A svenskt varumärke', treatment_percentage: 50, campaigns: [kampanjA] },
      { name: 'B norsk sida', treatment_percentage: 50, campaigns: [kampanjB] },
    ],
  };
}

// ---- Nät -------------------------------------------------------------------

async function huvud() {
  const arg = process.argv.slice(2);
  const val = (f) => (arg.includes(f) ? arg[arg.indexOf(f) + 1] : null);
  if (arg.includes('--splittest')) return skapaSplitTest(arg, val);
  const { api } = await import('../../../tools/meta-lib.mjs');
  const { tolkaRad, idagSE, plusDagar } = await import('../../meta.mjs');
  const { lasButik, skapaKlient } = await import('../../../sparning/butik.mjs');
  const lage = JSON.parse(readFileSync(join(ROT, 'lage.json'), 'utf8'));
  const id = (kod) => lage.kampanjer.find((k) => k.kod === kod)?.kampanj?.id;
  const kampanjA = id('NO'), kampanjB = id('NOB');
  if (!kampanjA || !kampanjB) throw new Error('lage.json saknar NO eller NOB — kör bygg.mjs för båda först');

  const igar = plusDagar(idagSE(), -1);
  let fran = val('--fran');
  const till = val('--till') ?? igar;
  if (!fran) {
    // Första dagen någon av dem hade spend (Meta har inga siffror för i dag).
    const dagar = [];
    for (const k of [kampanjA, kampanjB]) {
      const r = await api(`${k}/insights`, { params: { fields: 'spend', time_increment: 1, date_preset: 'last_90d' } });
      for (const d of r.data ?? []) if (Number(d.spend) > 0) dagar.push(d.date_start);
    }
    if (!dagar.length) { console.log('Ingen av kampanjerna har kört än (båda PAUSED eller utan spend) — inget att jämföra.'); return; }
    fran = dagar.sort()[0];
  }
  const meta = async (k) => {
    const r = await api(`${k}/insights`, { params: { fields: 'spend,impressions,inline_link_clicks,actions,purchase_roas', time_range: { since: fran, until: till }, action_attribution_windows: ['7d_click'] } });
    return tolkaRad(r.data?.[0] ?? {});
  };
  const A = await meta(kampanjA), B = await meta(kampanjB);

  const konfig = JSON.parse(readFileSync(join(ROT, '..', 'konfig.json'), 'utf8'));
  const k = await skapaKlient(lasButik(konfig.butik));
  const ordrar = { A: { antal: 0, sek: 0, nok: 0 }, B: { antal: 0, sek: 0, nok: 0 }, okand: { antal: 0, sek: 0, nok: 0 } };
  let efter = null;
  for (;;) {
    const d = await k.graphql(`query($q: String!, $efter: String) { orders(first: 100, after: $efter, query: $q) { pageInfo { hasNextPage endCursor } nodes { shippingAddress { countryCodeV2 } totalPriceSet { presentmentMoney { amount currencyCode } shopMoney { amount } } customerJourneySummary { firstVisit { landingPage utmParameters { campaign } } lastVisit { landingPage utmParameters { campaign } } } } } }`,
      { q: `created_at:>=${fran} created_at:<=${till}T23:59:59`, efter });
    for (const o of d.orders.nodes) {
      if (o.shippingAddress?.countryCodeV2 !== 'NO') continue;
      const v = ordrar[klassaOrder(o, { kampanjA, kampanjB }) ?? 'okand'];
      v.antal++;
      v.sek += Number(o.totalPriceSet.shopMoney.amount);
      if (o.totalPriceSet.presentmentMoney.currencyCode === 'NOK') v.nok += Number(o.totalPriceSet.presentmentMoney.amount);
    }
    if (!d.orders.pageInfo.hasNextPage) break;
    efter = d.orders.pageInfo.endCursor;
  }
  console.log(rapport({ fran, till, A, B, ordrar, dom: jamfor(A, B) }));
}

// Skapar BARA testet — slår aldrig på kampanjerna (det är Axels beslut, bygg.mjs --aktivera och hans ord).
// Oprövat skarpt 2026-09-29: token:en läser {business}/ad_studies (tom lista). Svarar Meta med fel, gör Axel
// testet i Ads Manager: Kampanjer → markera MATSTRUMP_NO_SALES och MATSTRUMP_NOB_SALES → "A/B-test".
async function skapaSplitTest(arg, val) {
  const { api } = await import('../../../tools/meta-lib.mjs');
  const lage = JSON.parse(readFileSync(join(ROT, 'lage.json'), 'utf8'));
  const id = (kod) => lage.kampanjer.find((k) => k.kod === kod)?.kampanj?.id;
  const M = JSON.parse(readFileSync(join(ROT, 'marknader.json'), 'utf8'));
  const konto = await api(`act_${M.konto}`, { params: { fields: 'business{id,name}' } });
  const test = splitTest({ kampanjA: id('NO'), kampanjB: id('NOB'), start: val('--start'), dagar: Number(val('--dagar') ?? 14) });
  console.log(`Business ${konto.business?.name} (${konto.business?.id}):\n${JSON.stringify(test, null, 1)}`);
  if (!arg.includes('--skarpt')) { console.log('torrt — --skarpt skapar testet (kampanjerna rörs inte)'); return; }
  const r = await api(`${konto.business.id}/ad_studies`, { form: { ...test, cells: JSON.stringify(test.cells) } });
  const las = await api(r.id, { params: { fields: 'id,name,type,start_time,end_time,cells{name,treatment_percentage}' } });
  console.log(`✅ split-testet skapat och tillbakaläst: ${JSON.stringify(las)}`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  huvud().catch((e) => { console.error(`\n❌ ${e.message}`); process.exit(1); });
}
