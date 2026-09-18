// chargeback.mjs — chargeback-risken för ett brand, som tal och som
// åtgärdslista. Ren funktion över ärenden + ordrar + tvister. Noll beroenden.
//
// Poängen är 0–100 och byggs av SIGNALER som var och en har ett tak, så en
// enda signal aldrig kan färga hela brandet röd. Varje signal säger vad den
// mätte och vilka ordrar/kunder den handlar om — talet är aldrig ett omdöme
// utan spårbar väg tillbaka till mejlen.
//
// Varför just de här signalerna: kortnätverkens fyra stora tvistorsaker är
// "item not received", "not as described", "unauthorized/duplicate" och
// "credit not processed". Alla fyra går att se i mejlen VECKOR innan de blir
// tvister — om någon tittar. Tvistgraden (tvister / ordrar) är det tal Visa
// och Mastercard själva mäter: Visa varnar från 0,9 %, Mastercard från 1 %.
// Vår gula gräns ligger under det med flit.

import { KATEGORI } from './klassificering.mjs';

const DAG = 86_400_000;

export const NIVAER = Object.freeze([
  { id: 'lag', min: 0, sv: 'Låg', en: 'Low', emoji: '🟢' },
  { id: 'forhojd', min: 25, sv: 'Förhöjd', en: 'Elevated', emoji: '🟡' },
  { id: 'hog', min: 50, sv: 'Hög', en: 'High', emoji: '🔴' },
]);

export function niva(poang) {
  return [...NIVAER].reverse().find((n) => poang >= n.min) ?? NIVAER[0];
}

const tak = (n, per, max) => Math.min(max, n * per);
const ordernamn = (a) => (a.ordernummer?.length ? ` (#${a.ordernummer.join(', #')})` : '');
const kund = (a) => `${a.kund?.adress ?? '?'}${ordernamn(a)}`;

/**
 * Ordrarna som betyder något för risken. `ordrar` i shopify.mjs:s form.
 * Returnerar { antal, betaldaOfullbordade[], utanSparning[], aterbetalda, avbrutna }.
 */
export function granskaOrdrar(ordrar = [], { nu = new Date(), ofullbordadDagar = 5 } = {}) {
  const gr = nu.getTime() - ofullbordadDagar * DAG;
  const betaldaOfullbordade = [];
  const utanSparning = [];
  let aterbetalda = 0;
  let avbrutna = 0;
  for (const o of ordrar) {
    if (o.avbruten) { avbrutna++; continue; }
    if (o.aterbetald) aterbetalda++;
    const betald = ['paid', 'partially_paid', 'partially_refunded'].includes(o.betald);
    const skickad = o.fulfillment === 'fulfilled' || o.fulfillment === 'partial';
    if (betald && !skickad && !o.aterbetald && o.skapad && o.skapad.getTime() < gr) betaldaOfullbordade.push(o);
    if (skickad && !o.sparning) utanSparning.push(o);
  }
  return { antal: ordrar.length, betaldaOfullbordade, utanSparning, aterbetalda, avbrutna };
}

/**
 * Hela bedömningen. `tvister` = { tillganglig, lista: [{ typ, orsak, status, belopp, ordernamn, initierad }] }.
 * Returnerar { poang, niva, signaler, atgarder, tvistgrad, underlag }.
 */
export function bedomRisk({ arenden = [], ordrar = [], tvister = null, trosklar = {}, nu = new Date() } = {}) {
  const t = {
    ofullbordad_dagar: 5, tvistgrans_gul_procent: 0.5, tvistgrans_rod_procent: 0.9, obesvarad_timmar: 48, ...trosklar,
  };
  const kundarenden = arenden.filter((a) => a.kategori !== 'spam');
  const per = (id) => kundarenden.filter((a) => a.kategori === id);
  const o = granskaOrdrar(ordrar, { nu, ofullbordadDagar: t.ofullbordad_dagar });
  const signaler = [];
  const lagg = (id, sv, en, varde, poang, detaljer = [], atgard_en = null) => signaler.push({ id, sv, en, varde, poang: Math.round(poang), detaljer, atgard_en });

  // 1. Riktiga tvister ur Shopify Payments, i SAMMA fönster som ordrarna
  //    (ordrar_dagar, normalt 30) — annars blir graden fel. Mätt 2026-09-13 på
  //    Bäverbutiken: 11 tvister på 7 dagar mot 1 739 ordrar på 30 gav 0,63 %,
  //    fast samma takt över 30 dagar är ~2,7 %. Bara CHARGEBACKS räknas i
  //    tvistgraden — det är dem Visa (0,9 %) och Mastercard (1 %) mäter.
  //    Inquiries (bankens förfrågningar) är förvarningen: obesvarade blir de
  //    chargebacks, så de får en egen signal och en egen åtgärd.
  let tvistgrad = null;
  let antalChargebacks = null;
  let antalForfragningar = null;
  const dagar = t.ordrar_dagar ?? 30;
  const oppenStatus = (x) => ['needs_response', 'under_review'].includes(x.status);
  const rad = (x) => `${x.ordernamn ?? x.orderId ?? '?'}: ${x.typ} · ${x.orsak} · ${x.status}${x.evidensSenast ? ` · evidence due ${x.evidensSenast}` : ''}`;
  if (tvister?.tillganglig) {
    const lista = tvister.lista ?? [];
    const chargebacks = lista.filter((x) => x.typ !== 'inquiry');
    const forfragningar = lista.filter((x) => x.typ === 'inquiry');
    antalChargebacks = chargebacks.length;
    antalForfragningar = forfragningar.length;
    const oppnaCb = chargebacks.filter(oppenStatus);
    const oppnaInq = forfragningar.filter(oppenStatus);
    const senast = (l) => l.map((x) => x.evidensSenast).filter(Boolean).sort()[0];
    let p = tak(chargebacks.length, 15, 40);
    if (o.antal > 0) {
      tvistgrad = Math.round((chargebacks.length / o.antal) * 10000) / 100;
      if (tvistgrad >= t.tvistgrans_rod_procent) p += 30;
      else if (tvistgrad >= t.tvistgrans_gul_procent) p += 15;
    }
    lagg('tvister', `Chargebacks (${dagar} dagar)`, `Chargebacks (last ${dagar} days)`, chargebacks.length, p, chargebacks.map(rad),
      oppnaCb.length ? `Answer the ${oppnaCb.length} open chargeback(s) in Shopify → Orders → Disputes before the evidence deadline${senast(oppnaCb) ? ` (earliest ${senast(oppnaCb)})` : ''}. Include tracking + delivery proof.` : null);
    lagg('forfragningar', `Förfrågningar från banken (inquiries, ${dagar} dagar)`, `Bank inquiries (retrieval requests, last ${dagar} days)`, forfragningar.length, tak(forfragningar.length, 5, 15), forfragningar.map(rad),
      oppnaInq.length ? `Answer the ${oppnaInq.length} open inquiry(ies) in Shopify → Orders → Disputes${senast(oppnaInq) ? ` before ${senast(oppnaInq)}` : ''} with tracking + the customer email thread — an unanswered inquiry becomes a chargeback.` : null);
  } else {
    lagg('tvister', `Chargebacks (${dagar} dagar)`, `Chargebacks (last ${dagar} days)`, null, 0, [tvister?.orsak ?? 'Shopify inte kopplat — tvister okända'], null);
  }

  // 2–5. Mejlsignalerna, var och en spårbar till kund + ordernummer.
  const hot = per('chargeback_hot');
  lagg('hot', 'Kunder som hotar med bank/tvist', 'Customers threatening bank / dispute', hot.length, tak(hot.length, 12, 36), hot.map(kund), hot.length ? KATEGORI.chargeback_hot.atgard_en : null);
  const okand = per('okand_debitering');
  lagg('okand_debitering', 'Okänd eller dubbel debitering', 'Unknown or double charge', okand.length, tak(okand.length, 10, 30), okand.map(kund), okand.length ? KATEGORI.okand_debitering.atgard_en : null);
  const ejLev = per('ej_levererad');
  lagg('ej_levererad', 'Säger sig aldrig fått varan', 'Says item never arrived', ejLev.length, tak(ejLev.length, 8, 24), ejLev.map(kund), ejLev.length ? KATEGORI.ej_levererad.atgard_en : null);
  const felVara = per('fel_vara');
  lagg('fel_vara', 'Fel vara / inte som beskrivet', 'Wrong item / not as described', felVara.length, tak(felVara.length, 6, 18), felVara.map(kund), felVara.length ? KATEGORI.fel_vara.atgard_en : null);

  // 6. Obesvarat — tyngre när ärendet i sig är chargeback-nära.
  const obesvarade = kundarenden.filter((a) => a.larmObesvarad);
  const obesvaratPoang = obesvarade.reduce((s, a) => s + (KATEGORI[a.kategori].vikt >= 2 ? 8 : 5), 0);
  lagg('obesvarade', `Obesvarade ärenden > ${t.obesvarad_timmar} h`, `Unanswered tickets > ${t.obesvarad_timmar}h`, obesvarade.length, Math.min(25, obesvaratPoang),
    obesvarade.map((a) => `${kund(a)} — ${KATEGORI[a.kategori].en}, ${a.timmarObesvarad}h`),
    obesvarade.length ? `Reply to every unanswered ticket today, chargeback-prone ones first (never delivered, unknown charge, threats).` : null);

  // 7–8. Ordersignalerna.
  lagg('ofullbordade', `Betalda ordrar utan fulfillment > ${t.ofullbordad_dagar} dagar`, `Paid orders unfulfilled > ${t.ofullbordad_dagar} days`, ordrar.length ? o.betaldaOfullbordade.length : null,
    tak(o.betaldaOfullbordade.length, 4, 20), o.betaldaOfullbordade.map((x) => `${x.namn} · ${x.email} · ${x.skapad?.toISOString().slice(0, 10)}`),
    o.betaldaOfullbordade.length ? 'Ship or refund these orders now and email the customer today — silence after payment is how "item not received" starts.' : null);
  lagg('utan_sparning', 'Skickade ordrar utan spårningsnummer', 'Fulfilled orders without tracking', ordrar.length ? o.utanSparning.length : null,
    tak(o.utanSparning.length, 2, 10), o.utanSparning.slice(0, 15).map((x) => `${x.namn} · ${x.email}`),
    o.utanSparning.length ? 'Add tracking numbers on every fulfillment — without tracking a dispute cannot be won.' : null);

  // 9. Återbetalning/avbeställning som väntar.
  const pengar = [...per('aterbetalning'), ...per('avbestallning')].filter((a) => !a.besvarad);
  lagg('pengar_vantar', 'Obesvarade återbetalnings-/avbeställningskrav', 'Unanswered refund / cancellation requests', pengar.length, tak(pengar.length, 3, 12), pengar.map(kund),
    pengar.length ? 'Confirm the refund or cancellation in writing today; the money must be back within 14 days.' : null);

  // 10. Svarstiden i stort.
  const svarstider = kundarenden.map((a) => a.svarstidTimmar).filter((x) => x !== null).sort((a, b) => a - b);
  const medianSvar = svarstider.length ? svarstider[Math.floor(svarstider.length / 2)] : null;
  lagg('svarstid', 'Median första svarstid (timmar)', 'Median first response time (hours)', medianSvar, medianSvar === null ? 0 : medianSvar > 48 ? 20 : medianSvar > 24 ? 10 : 0, [],
    medianSvar !== null && medianSvar > 24 ? 'Get first response under 24h. Set a daily fixed inbox time for the VA (morning Manila time = before Swedish customers wake up).' : null);

  const poang = Math.min(100, signaler.reduce((s, x) => s + x.poang, 0));
  const atgarder = signaler.filter((s) => s.atgard_en && s.poang > 0).sort((a, b) => b.poang - a.poang).map((s) => ({ signal: s.id, poang: s.poang, en: s.atgard_en, antal: s.varde }));
  return {
    poang,
    niva: niva(poang),
    signaler,
    atgarder,
    tvistgrad,
    underlag: { arenden: kundarenden.length, ordrar: o.antal, tvisterTillgangliga: Boolean(tvister?.tillganglig), chargebacks: antalChargebacks, forfragningar: antalForfragningar, dagar, aterbetalda: o.aterbetalda, avbrutna: o.avbrutna },
  };
}

/** Brands rankade på risk — högst först. Brands utan data hamnar sist, markerade. */
export function rankaBrands(resultat = []) {
  const med = resultat.filter((r) => r.risk && !r.hoppad);
  const utan = resultat.filter((r) => !r.risk || r.hoppad);
  med.sort((a, b) => (b.risk.poang - a.risk.poang) || ((b.sammanfattning?.antalArenden ?? 0) - (a.sammanfattning?.antalArenden ?? 0)));
  return [...med.map((r, i) => ({ plats: i + 1, ...r })), ...utan.map((r) => ({ plats: null, ...r }))];
}

/**
 * Återkommande problem över veckor. `historik` = [{ vecka, topp: [kategori-id …] }]
 * i tidsordning, inklusive innevarande vecka sist. En kategori är återkommande
 * när den legat topp 3 i minst `minst` av de senaste `fonster` veckorna.
 */
export function aterkommande(historik = [], { fonster = 4, minst = 3 } = {}) {
  const senaste = historik.slice(-fonster);
  // Färre veckor än gränsen: inget KAN vara återkommande än. Första veckorna
  // ska säga "för lite historik", inte stämpla allt som återkommande.
  if (senaste.length < minst) return [];
  const rakning = {};
  for (const v of senaste) for (const id of (v.topp ?? []).slice(0, 3)) rakning[id] = (rakning[id] ?? 0) + 1;
  return Object.entries(rakning)
    .filter(([, n]) => n >= minst)
    .sort((a, b) => b[1] - a[1])
    .map(([id, veckor]) => ({ id, veckor, av: senaste.length }));
}
