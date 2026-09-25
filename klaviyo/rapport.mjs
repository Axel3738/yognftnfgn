// Rapporten: hur gick utskicken? Kampanjer och flöden, en dom per utskick.
//
//   node klaviyo/rapport.mjs [--brand baverbutiken] [--dagar 30] [--break-even 1.6]
//
// ETT anrop per rapport med group_by, aldrig ett per kampanj: specen 2026-07-15
// ger campaign-values-reports och flow-values-reports burst 1/s, 2/min, 225/dygn.
// Scheman: CampaignValuesRequestDTO, FlowValuesRequestDTO (Timeframe | CustomTimeframe),
// svaret PostCampaignValuesResponseDTO → data.attributes.results[{ groupings, statistics }].
//
// Skriver klaviyo/logg/<brand>/utfall.jsonl (en rad per utskick och körning).
// Lärdomen skrivs av huvudsessionen i logg/<brand>/kampanjlogg.md — inte av skriptet.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { KlaviyoKlient, KlaviyoFel, nyckelFranEnv, kontrolleraKonto } from './klient.mjs';
import { hamtaMetriker, metrikId, KANDA_METRIKER } from './metriker.mjs';
import { lasBrand } from './ladda-upp.mjs';

const HAR = path.dirname(fileURLToPath(import.meta.url));

export const STATISTIK = [
  'recipients', 'delivered', 'bounce_rate', 'opens_unique', 'open_rate', 'clicks_unique', 'click_rate',
  'conversions', 'conversion_uniques', 'conversion_value', 'revenue_per_recipient',
  'unsubscribes', 'unsubscribe_rate', 'spam_complaints', 'spam_complaint_rate',
];

/**
 * Grinden. ⚠️ 500 levererade är en STARTSIFFRA som huvudsessionen satte
 * 2026-09-24 utan data — mät om när tio utskick har gått (hur stor är variansen
 * i intäkt per mottagare vid 500 mot 2 000?). 3 konverteringar är samma golv som
 * ANALYSMETOD:s "ingen dom under 3 köp".
 */
export const GRIND = { minKonverteringar: 3, minLevererade: 500 };
/** Leveranslarm: över 0,3 % spamklagomål eller 1 % avregistreringar (Googles/Yahoos gräns för klagomål är 0,3 %). */
export const LARM = { spam: 0.003, avregistrering: 0.01 };

const DAGAR_TILL_NYCKEL = { 7: 'last_7_days', 30: 'last_30_days', 90: 'last_90_days', 365: 'last_365_days' };

export function tidsram(dagar, nu = new Date()) {
  if (DAGAR_TILL_NYCKEL[dagar]) return { key: DAGAR_TILL_NYCKEL[dagar] };
  return { start: new Date(nu.getTime() - dagar * 86400000).toISOString(), end: nu.toISOString() };
}

export function rapportKropp(typ, { dagar, metrikId: konvId, nu }) {
  const kampanj = typ === 'kampanj';
  return {
    data: {
      type: kampanj ? 'campaign-values-report' : 'flow-values-report',
      attributes: {
        statistics: STATISTIK,
        timeframe: tidsram(dagar, nu),
        conversion_metric_id: konvId,
        group_by: kampanj
          ? ['campaign_id', 'campaign_message_id', 'campaign_message_name', 'send_channel']
          : ['flow_id', 'flow_name', 'flow_message_id', 'flow_message_name', 'send_channel'],
        filter: 'equals(send_channel,"email")',
      },
    },
  };
}

/** Median — benchmarken för VINNARE/FORLORARE. */
export function median(tal) {
  const t = tal.filter((x) => Number.isFinite(x)).sort((a, b) => a - b);
  if (!t.length) return null;
  const m = Math.floor(t.length / 2);
  return t.length % 2 ? t[m] : (t[m - 1] + t[m]) / 2;
}

export function passerarGrind(rad) {
  return (rad.conversions ?? 0) >= GRIND.minKonverteringar && (rad.delivered ?? 0) >= GRIND.minLevererade;
}

/**
 * Domen för ETT utskick. Ren funktion.
 *
 *  1. LARM_LEVERANS: spam > 0,3 % eller avregistreringar > 1 % — gäller oavsett grind,
 *     ett leveransproblem väntar inte på signifikans.
 *  2. FOR_TIDIGT: under 3 konverteringar eller under 500 levererade.
 *  3. Vinstbidrag = conversion_value / breakEvenRoas − 0. Break-even-ROAS är
 *     pris ÷ marginal i kronor, så intäkt ÷ break-even är marginalen i kronor på
 *     de köpen; "− 0" är utskickets rörliga kostnad (Klaviyos abonnemang är fast).
 *     Utan break-even: "okänt, break-even saknas" — aldrig en gissning.
 *  4. Etikett: intäkt per mottagare mot benchmarken = MEDIANEN av de ANDRA utskicken
 *     av samma typ (kampanj mot kampanjer, flödesmejl mot flödesmejl) som passerat grinden.
 *     ≥ median → VINNARE, under → FORLORARE, ingen benchmark → BEDOMBAR.
 *     Enkelt med flit: tio utskick räcker inte till något finare.
 *  Öppningsgraden avgör aldrig något — Apples integritetsskydd blåser upp den.
 */
export function dom(rad, { breakEvenRoas = null, benchmark = null } = {}) {
  const spam = rad.spam_complaint_rate ?? 0;
  const avreg = rad.unsubscribe_rate ?? 0;
  const vb = breakEvenRoas ? (rad.conversion_value ?? 0) / breakEvenRoas - 0 : null;
  const vinst = { vinstbidrag: vb, vinstbidrag_text: vb === null ? 'okänt, break-even saknas' : `${Math.round(vb)} kr` };
  if ((rad.delivered ?? 0) > 0 && (spam > LARM.spam || avreg > LARM.avregistrering)) {
    const orsak = [];
    if (spam > LARM.spam) orsak.push(`spamklagomål ${(spam * 100).toFixed(2)} % (gräns 0,3 %)`);
    if (avreg > LARM.avregistrering) orsak.push(`avregistreringar ${(avreg * 100).toFixed(2)} % (gräns 1 %)`);
    return { dom: 'LARM_LEVERANS', orsak: orsak.join(', '), ...vinst };
  }
  if (!passerarGrind(rad)) {
    return { dom: 'FOR_TIDIGT', orsak: `${rad.conversions ?? 0} konverteringar och ${rad.delivered ?? 0} levererade — grinden är ${GRIND.minKonverteringar} och ${GRIND.minLevererade}`, ...vinst };
  }
  if (benchmark === null || benchmark === undefined) return { dom: 'BEDOMBAR', orsak: 'ingen benchmark än (inget annat utskick av samma typ har passerat grinden)', ...vinst };
  const rpr = rad.revenue_per_recipient ?? 0;
  return rpr >= benchmark
    ? { dom: 'VINNARE', orsak: `intäkt per mottagare ${rpr.toFixed(2)} kr ≥ median ${benchmark.toFixed(2)} kr`, ...vinst }
    : { dom: 'FORLORARE', orsak: `intäkt per mottagare ${rpr.toFixed(2)} kr < median ${benchmark.toFixed(2)} kr`, ...vinst };
}

/** Rapportens results → rader, med namn ur uppslagen. */
export function tillRader(typ, resultat, namn = {}) {
  return (resultat ?? []).map((x) => {
    const g = x.groupings ?? {};
    const s = x.statistics ?? {};
    const id = typ === 'kampanj' ? g.campaign_id : g.flow_id;
    return {
      typ,
      id,
      namn: typ === 'kampanj' ? (namn[id] ?? g.campaign_message_name ?? id) : (g.flow_name ?? namn[id] ?? id),
      meddelande_id: typ === 'kampanj' ? g.campaign_message_id : g.flow_message_id,
      meddelande_namn: typ === 'kampanj' ? g.campaign_message_name ?? null : g.flow_message_name ?? null,
      ...Object.fromEntries(STATISTIK.map((k) => [k, s[k] ?? null])),
    };
  });
}

export function doma(rader, { breakEvenRoas = null } = {}) {
  // Benchmarken för en rad = medianen av de ANDRA raderna av samma typ som passerat
  // grinden. Raden själv räknas aldrig in — ensam är man inte vinnare mot sig själv.
  return rader.map((r, i) => {
    const andra = rader.filter((x, j) => j !== i && x.typ === r.typ && passerarGrind(x)).map((x) => x.revenue_per_recipient);
    const bm = median(andra);
    return { ...r, benchmark: bm, dom: dom(r, { breakEvenRoas, benchmark: bm }) };
  });
}

async function hamtaAllaResultat(klient, sokvag, kropp) {
  const ut = [];
  let svar = await klient.post(sokvag, kropp);
  for (;;) {
    ut.push(...(svar?.data?.attributes?.results ?? []));
    const nasta = svar?.links?.next;
    if (!nasta) break;
    svar = await klient.post(nasta, kropp);
  }
  return ut;
}

function rapportAnrop(loggDir, nu) {
  const fil = path.join(loggDir, 'rapportanrop.jsonl');
  const grans = nu.getTime() - 86400000;
  const rader = fs.existsSync(fil) ? fs.readFileSync(fil, 'utf8').split('\n').filter(Boolean).map((r) => { try { return JSON.parse(r); } catch { return null; } }).filter(Boolean) : [];
  return { fil, antal: rader.filter((r) => Date.parse(r.tid) >= grans).length };
}

/**
 * Hämtar båda rapporterna, dömer och skriver utfall.jsonl.
 * @returns {Promise<object[]>} raderna med dom
 */
export async function rapport({ brand, klient, dagar = 30, breakEvenRoas = null, loggDir, nu = () => new Date(), skriv = true }) {
  await kontrolleraKonto(klient, brand);
  const metriker = await hamtaMetriker(klient);
  const konvId = metrikId(metriker, KANDA_METRIKER.placed_order);
  const tak = rapportAnrop(loggDir, nu());
  if (tak.antal + 2 > 225) throw Object.assign(new Error(`Dygnstaket för rapporter (225) nås — ${tak.antal} anrop senaste dygnet enligt ${path.basename(tak.fil)}. Vänta.`), { kod: 'DYGNSTAK' });

  const kampanjer = await klient.allaSidor('/api/campaigns', { filter: "equals(messages.channel,'email')", 'fields[campaign]': 'name' });
  const kampanjNamn = Object.fromEntries(kampanjer.map((k) => [k.id, k.attributes?.name]));
  const floden = await klient.allaSidor('/api/flows', { 'page[size]': 50, 'fields[flow]': 'name' });
  const flodesNamn = Object.fromEntries(floden.map((f) => [f.id, f.attributes?.name]));

  const k = await hamtaAllaResultat(klient, '/api/campaign-values-reports', rapportKropp('kampanj', { dagar, metrikId: konvId, nu: nu() }));
  const f = await hamtaAllaResultat(klient, '/api/flow-values-reports', rapportKropp('flode', { dagar, metrikId: konvId, nu: nu() }));
  if (skriv) {
    fs.mkdirSync(loggDir, { recursive: true });
    fs.appendFileSync(tak.fil, `${JSON.stringify({ tid: nu().toISOString(), anrop: 2 })}\n`);
  }
  const hamtad = nu().toISOString();
  const period = { dagar, ...tidsram(dagar, nu()) };
  const rader = doma([...tillRader('kampanj', k, kampanjNamn), ...tillRader('flode', f, flodesNamn)], { breakEvenRoas })
    .map((r) => ({ ...r, period, hamtad }));
  if (skriv) {
    fs.mkdirSync(loggDir, { recursive: true });
    fs.appendFileSync(path.join(loggDir, 'utfall.jsonl'), rader.map((r) => JSON.stringify(r)).join('\n') + (rader.length ? '\n' : ''));
  }
  return rader;
}

const pct = (x) => (x === null || x === undefined ? '—' : `${(x * 100).toFixed(1)} %`);
const kr = (x) => (x === null || x === undefined ? '—' : `${Math.round(x)} kr`);

export function tabell(rader) {
  const rubrik = ['Typ', 'Namn', 'Lev.', 'Klick', 'Konv.', 'Intäkt', 'Kr/mott.', 'Avreg.', 'Spam', 'Vinstbidrag', 'Dom'];
  const kropp = rader.map((r) => [
    r.typ === 'kampanj' ? 'Kampanj' : 'Flöde',
    (r.meddelande_namn && r.typ === 'flode' ? `${r.namn} / ${r.meddelande_namn}` : r.namn ?? '').slice(0, 60),
    String(r.delivered ?? '—'),
    pct(r.click_rate),
    String(r.conversions ?? '—'),
    kr(r.conversion_value),
    r.revenue_per_recipient === null ? '—' : r.revenue_per_recipient.toFixed(2),
    pct(r.unsubscribe_rate),
    pct(r.spam_complaint_rate),
    r.dom.vinstbidrag_text,
    r.dom.dom,
  ]);
  const bredd = rubrik.map((h, i) => Math.max(h.length, ...kropp.map((rad) => rad[i].length)));
  const linje = (rad) => rad.map((c, i) => c.padEnd(bredd[i])).join('  ');
  return [linje(rubrik), bredd.map((b) => '-'.repeat(b)).join('  '), ...kropp.map(linje)].join('\n');
}

async function main() {
  const argv = process.argv.slice(2);
  let brandId = 'baverbutiken';
  let dagar = 30;
  let be = null;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--brand') brandId = argv[++i];
    else if (argv[i] === '--dagar') dagar = Number(argv[++i]);
    else if (argv[i] === '--break-even') be = Number(String(argv[++i]).replace(',', '.'));
    else { console.error(`Okänt argument: ${argv[i]}`); process.exit(1); }
  }
  if (!Number.isInteger(dagar) || dagar < 1) { console.error('--dagar måste vara ett heltal ≥ 1.'); process.exit(1); }
  const brand = lasBrand(brandId);
  be = be ?? brand.break_even_roas ?? null;
  const nyckel = nyckelFranEnv(brand);
  if (!nyckel) { console.error(`Nyckeln ${brand.nyckel_env.join(' eller ')} saknas — kör node klaviyo/kolla.mjs för receptet.`); process.exit(1); }
  (await import('../mejl/shopify.mjs')).kravProxy();
  const klient = new KlaviyoKlient({ nyckel: nyckel.nyckel, logg: (t) => console.error(t) });
  const loggDir = path.join(HAR, 'logg', brand.id);
  let rader;
  try {
    rader = await rapport({ brand, klient, dagar, breakEvenRoas: be, loggDir });
  } catch (e) {
    console.error(e instanceof KlaviyoFel || e.kod ? `STOPP: ${e.message}` : e.stack);
    process.exit(2);
  }
  console.log(`Klaviyo ${brand.namn}, senaste ${dagar} dagarna. Konvertering = Placed Order. Break-even-ROAS: ${be ?? 'saknas (vinstbidraget okänt)'}.`);
  console.log(`Grind: ${GRIND.minKonverteringar} konverteringar och ${GRIND.minLevererade} levererade. Öppningsgraden bär aldrig en dom.\n`);
  console.log(rader.length ? tabell(rader) : 'Inga utskick i perioden.');
  console.log(`\nSkrev ${rader.length} rader till ${path.relative(process.cwd(), path.join(loggDir, 'utfall.jsonl'))}. Lärdomen skrivs i kampanjlogg.md av huvudsessionen.`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main().catch((e) => { console.error(e.stack ?? e.message); process.exit(1); });
}
