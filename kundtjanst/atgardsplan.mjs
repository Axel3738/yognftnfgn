// atgardsplan.mjs — från siffror till VAD VA:N SKA GÖRA. Ren funktion över
// körningens resultat, noll beroenden, noll nätanrop.
//
// Rapporten sa tidigare bara VAD som var fel ("37 obesvarade > 48 h"). Den
// sa aldrig vad man GÖR åt det. Det här är den delen: varje regel tittar på
// ett mätt tal, och när talet passerar sin gräns skrivs en åtgärd med
// konkreta steg. Ingen åtgärd föds ur tomma intet — varje bär `matt`, talen
// den grundas på, så den går att ifrågasätta.
//
// ⚠️ TEXTEN ÄR ENGELSK. VA:n läser den (CLAUDE.md: språket följer läsaren).
// Koden och kommentarerna är svenska som resten av repot.
//
// Tre hinkar, i den ordning de ska göras:
//   NU      — pengar eller förtroende brinner i dag (deadline, hot, dubbeldrag)
//   VECKAN  — backloggen och vanorna som skapar nästa veckas brand
//   PROCESS — det som minskar ANTALET ärenden, inte svarstiden på dem

import { KATEGORI } from './klassificering.mjs';

/** Hinkarna, i prioritetsordning. */
export const HINKAR = Object.freeze([
  { id: 'nu', sv: 'Gör i dag', en: 'Do today' },
  { id: 'veckan', sv: 'Gör den här veckan', en: 'Do this week' },
  { id: 'process', sv: 'Bygg bort problemet', en: 'Fix the root cause' },
]);

const antal = (r, id) => r.arenden?.filter((a) => a.kategori === id).length ?? 0;
const obesvarade = (r, id) => r.arenden?.filter((a) => a.kategori === id && !a.besvarad).length ?? 0;
const signal = (r, id) => r.risk?.signaler?.find((s) => s.id === id) ?? null;
const tvistlista = (r) => (r.tvister?.tillganglig ? r.tvister.lista ?? [] : []);
const oppen = (x) => ['needs_response', 'under_review'].includes(x.status);
const kr = (n, valuta = 'SEK') => `${Math.round(n).toLocaleString('en-US')} ${valuta}`;

/**
 * Ordernumren i en kategori som en EGEN mening — aldrig inklistrade mitt i en
 * annan, då blir "…they do not recognise. #1050 This is…" oläsbart.
 * Tom sträng när inget ordernummer nämndes, så meningen bara uteblir.
 */
function ordrar(r, id, max = 8) {
  const nr = [...new Set((r.arenden ?? []).filter((a) => a.kategori === id).flatMap((a) => a.ordernummer))];
  if (!nr.length) return '';
  const visade = nr.slice(0, max).map((n) => `#${n}`).join(', ');
  return `Orders: ${nr.length > max ? `${visade} and ${nr.length - max} more` : visade}. `;
}

/** Pengarna som ligger i öppna tvister just nu — hjältesiffran. */
export function pengarIRisk(r) {
  const lista = tvistlista(r).filter(oppen);
  const valuta = lista.find((x) => x.valuta)?.valuta ?? r.brand?.valuta ?? 'SEK';
  return { belopp: lista.reduce((s, x) => s + (Number(x.belopp) || 0), 0), antal: lista.length, valuta };
}

/**
 * Hela planen. `r` är run.mjs:s resultatobjekt.
 * Returnerar en lista åtgärder, sorterade: hink först, sedan prio (lägst = först).
 */
export function byggAtgardsplan(r, { nu = new Date() } = {}) {
  const t = r.brand?.trosklar ?? {};
  const grans = t.obesvarad_timmar ?? 48;
  const dagar = r.risk?.underlag?.dagar ?? t.ordrar_dagar ?? 30;
  const s = r.sammanfattning ?? {};
  const ut = [];
  const lagg = (hink, prio, id, titel, varfor, steg, effekt, matt, agare = 'VA') =>
    ut.push({ hink, prio, id, titel, varfor, steg, effekt, matt, agare });

  // ---------------------------------------------------------------- NU
  // 1. Öppna tvister med deadline. Missad deadline = förlorad tvist, alltid.
  const oppnaTvister = tvistlista(r).filter(oppen);
  if (oppnaTvister.length) {
    const pengar = pengarIRisk(r);
    const sorterade = [...oppnaTvister].sort((a, b) => String(a.evidensSenast ?? '9999').localeCompare(String(b.evidensSenast ?? '9999')));
    const forst = sorterade[0];
    const chargebacks = oppnaTvister.filter((x) => x.typ !== 'inquiry').length;
    lagg('nu', 1, 'tvister',
      `Respond to ${oppnaTvister.length} open dispute${oppnaTvister.length === 1 ? '' : 's'} before the deadline`,
      `${pengar.belopp > 0 ? `${kr(pengar.belopp, pengar.valuta)} is on the line. ` : ''}${chargebacks} of them are real chargebacks, the rest are bank inquiries. The earliest evidence deadline is ${forst.evidensSenast ?? 'unknown'}${forst.ordernamn ? ` (order ${forst.ordernamn})` : ''}. A dispute you do not answer is lost automatically — you lose the goods, the money and the fee.`,
      [
        'Shopify admin → Orders → filter "Disputed" → open the oldest deadline first.',
        'For every dispute attach: tracking number + carrier scan showing delivery, the order confirmation, and the full email thread with the customer.',
        'If the parcel genuinely never arrived: do NOT fight it. Accept the dispute and refund — fighting a lost case costs the fee on top.',
        'Write the outcome in the order timeline so the next person sees what was sent.',
      ],
      'Every dispute answered with tracking evidence is a dispute that can be won instead of auto-lost.',
      { oppna: oppnaTvister.length, chargebacks, belopp: pengar.belopp, valuta: pengar.valuta, deadline: forst.evidensSenast ?? null });
  }

  // 2. Kunder som hotar med bank. Billigare att lösa än att förlora tvisten.
  const hot = antal(r, 'chargeback_hot');
  if (hot > 0) {
    lagg('nu', 2, 'hot',
      `Reply to ${hot} customer${hot === 1 ? '' : 's'} threatening to go to the bank`,
      `${hot} customer${hot === 1 ? ' has' : 's have'} written that they will contact their bank, Klarna or ARN. ${ordrar(r, 'chargeback_hot')}A chargeback costs the order value plus the dispute fee, and it hurts the account's dispute rate. Refunding today is cheaper than losing the case in three weeks.`,
      [
        'Reply within 24 hours, in the customer\'s own language.',
        'Offer one of two things immediately and let them pick: full refund now, or a replacement shipped with tracking today.',
        'Never ask them to "wait a few more days" — that is the sentence that turns a threat into a real chargeback.',
        'When they accept, write it in the order notes so the case is documented if the bank still contacts us.',
      ],
      'Solving it here stops it before it reaches the card network and keeps the dispute rate down.',
      { antal: hot });
  }

  // 3. Dubbeldrag. Kortnätverkens vanligaste "unauthorized"-orsak.
  const dubbel = antal(r, 'okand_debitering');
  if (dubbel > 0) {
    lagg('nu', 3, 'dubbel',
      `Check ${dubbel} report${dubbel === 1 ? '' : 's'} of an unknown or double charge today`,
      `${dubbel} customer${dubbel === 1 ? ' says' : 's say'} they were charged twice or for something they do not recognise. ${ordrar(r, 'okand_debitering')}This is the number one "unauthorized transaction" chargeback reason and banks side with the customer almost every time.`,
      [
        'Search the customer email in Shopify → Orders. Two orders with the same items minutes apart = a real double charge.',
        'Refund the duplicate the same day, then email the customer telling them it is done and when the money lands (3–5 banking days).',
        'If there is only one order: send them the order confirmation and the exact text that appears on their statement, so they recognise it.',
      ],
      'A refunded duplicate never becomes a chargeback. An unanswered one almost always does.',
      { antal: dubbel });
  }

  // ------------------------------------------------------------ VECKAN
  // 4. Backloggen. Den enskilt största chargeback-motorn.
  if ((s.larmObesvarade ?? 0) > 0) {
    const farliga = (r.arenden ?? []).filter((a) => a.larmObesvarad && (KATEGORI[a.kategori]?.vikt ?? 0) >= 2).length;
    const aldst = Math.max(0, ...(r.arenden ?? []).filter((a) => a.larmObesvarad).map((a) => a.timmarObesvarad || 0));
    lagg('veckan', 1, 'backlogg',
      `Clear the backlog: ${s.larmObesvarade} tickets have waited more than ${grans} h`,
      `${s.obesvarade ?? 0} of ${s.antalArenden ?? 0} tickets are unanswered, ${s.larmObesvarade} of them past ${grans} h and the oldest has waited ${Math.round(aldst)} h. ${farliga} of them are in chargeback-prone categories (never delivered, unknown charge, threats). Silence is what turns a support ticket into a dispute.`,
      [
        `Work the list on the dashboard top-down — it is already sorted with the dangerous ones first (${farliga} of them).`,
        'Every ticket gets a reply today, even if the answer is "I am checking this, you will hear from me tomorrow" — a holding reply stops the clock.',
        'Anything older than 14 days: refund or reship without asking. The goodwill is worth less than the dispute fee.',
        'Mark a ticket done only when the customer has been answered, not when you have read it.',
      ],
      `Getting these to zero removes the biggest single driver of the ${r.risk?.poang ?? 0}/100 risk score.`,
      { obesvarade: s.obesvarade ?? 0, larm: s.larmObesvarade, farliga, aldstTimmar: Math.round(aldst) });
  }

  // 5. Svarstiden som vana — inte som enstaka uppryckning.
  const median = s.medianSvarstidTimmar;
  if (median !== null && median !== undefined && median > 24) {
    lagg('veckan', 2, 'svarstid',
      `Set two fixed inbox slots a day — median first reply is ${median} h`,
      `Half of all customers wait more than ${median} h for a first answer. Customers who wait more than 24 h start looking for the bank instead of the reply button. This is a routine problem, not a workload problem: ${s.antalArenden ?? 0} tickets over ${dagar} days is a few per day.`,
      [
        'Slot 1: first thing in the morning Manila time — that is before Swedish customers wake up, so they have an answer waiting.',
        'Slot 2: end of the Manila day, to catch everything that came in overnight from Sweden.',
        'In each slot: answer everything new, then the oldest unanswered. Never leave the slot with a ticket untouched.',
        'Target to hit every day: first reply under 24 h, no exceptions.',
      ],
      'First reply under 24 h is the cheapest chargeback prevention that exists — no refunds, no shipping cost.',
      { medianTimmar: median, arenden: s.antalArenden ?? 0, dagar });
  }

  // 6. Aldrig levererad — "item not received" är största tvistorsaken globalt.
  const ejLev = antal(r, 'ej_levererad');
  if (ejLev > 0) {
    lagg('veckan', 3, 'ej_levererad',
      `Resolve ${ejLev} "never arrived" ticket${ejLev === 1 ? '' : 's'} with a hard rule`,
      `${ejLev} customer${ejLev === 1 ? ' says the parcel' : 's say their parcels'} never arrived (${obesvarade(r, 'ej_levererad')} still unanswered). ${ordrar(r, 'ej_levererad')}"Item not received" is the most common chargeback reason in e-commerce, and the clock is already running on every one of these.`,
      [
        'Open the tracking for each order. Three outcomes, three answers — decide in the same reply, never "we will look into it".',
        'Tracking moving: send the link and the expected delivery date. Done.',
        'Tracking stuck more than 7 days, or says delivered but customer has not got it: reship with tracking, or refund. Customer chooses.',
        'No tracking at all on the order: refund immediately — that case cannot be won in a dispute.',
      ],
      'Each one resolved here is one less chargeback in 2–6 weeks, when the bank case would have landed.',
      { antal: ejLev, obesvarade: obesvarade(r, 'ej_levererad') });
  }

  // 7. Öppna inquiries — förvarningen. Svarar man blir det aldrig en chargeback.
  const inq = tvistlista(r).filter((x) => x.typ === 'inquiry' && oppen(x)).length;
  if (inq > 0) {
    lagg('veckan', 4, 'inquiries',
      `Answer ${inq} open bank inquiry${inq === 1 ? '' : 'ies'} — they become chargebacks if ignored`,
      `An inquiry is the bank asking us for the order details before the customer files a real dispute. It is the cheapest possible stage to win: no fee, no lost goods. ${inq} ${inq === 1 ? 'is' : 'are'} open right now.`,
      [
        'Shopify admin → Orders → Disputes → open each inquiry.',
        'Submit the same evidence pack as a chargeback: tracking + delivery scan + order confirmation + email thread.',
        'Also email the customer directly — most inquiries come from people who simply did not recognise the charge.',
      ],
      'An inquiry answered with evidence usually closes without ever becoming a chargeback or costing a fee.',
      { antal: inq });
  }

  // 8. Återbetalningskrav — lagstadgade 14 dagar.
  const pengarVantar = signal(r, 'pengar_vantar');
  if (pengarVantar?.varde > 0) {
    lagg('veckan', 5, 'aterbetalning',
      `Confirm ${pengarVantar.varde} pending refund/cancellation request${pengarVantar.varde === 1 ? '' : 's'} in writing`,
      `${pengarVantar.varde} customer${pengarVantar.varde === 1 ? ' is' : 's are'} waiting for a refund or cancellation to be confirmed. Under EU distance-selling rules the money has to be back within 14 days, and an unconfirmed refund is a guaranteed dispute.`,
      [
        'Process the refund in Shopify, or if it cannot be refunded yet, reply with the exact date it will be.',
        'Always send a written confirmation — the customer needs something to point at while they wait for the bank transfer.',
        'If the order already shipped: send the return address and tell them the refund follows on arrival.',
      ],
      'A written confirmation stops the customer from asking the bank to do it instead.',
      { antal: pengarVantar.varde });
  }

  // 9. Betalda ordrar som aldrig skickats — problemet ligger inte i inkorgen.
  const ofull = signal(r, 'ofullbordade');
  if (ofull?.varde > 0) {
    lagg('veckan', 6, 'ofullbordade',
      `Ship or refund ${ofull.varde} paid order${ofull.varde === 1 ? '' : 's'} that never left`,
      `${ofull.varde} order${ofull.varde === 1 ? ' has' : 's have'} been paid but unfulfilled for more than ${t.ofullbordad_dagar ?? 5} days. These customers have not written yet — they will, and by then they are angry. This is where "never arrived" tickets are born.`,
      [
        'Shopify → Orders → filter Unfulfilled, sort oldest first.',
        'Ship today with tracking, or refund and tell the customer why.',
        'Either way: email the customer first, before they have to ask. A proactive email here prevents the ticket entirely.',
      ],
      'Fixing these prevents next week\'s "where is my order" and "never arrived" tickets.',
      { antal: ofull.varde }, 'VA + Axel');
  }

  // 10. Skickat utan spårning — gör tvister omöjliga att vinna.
  const utanSpar = signal(r, 'utan_sparning');
  if (utanSpar?.varde > 0) {
    lagg('veckan', 7, 'sparning',
      `Add tracking numbers to ${utanSpar.varde} fulfilled order${utanSpar.varde === 1 ? '' : 's'}`,
      `${utanSpar.varde} order${utanSpar.varde === 1 ? ' was' : 's were'} marked as shipped without a tracking number. Without tracking a dispute cannot be won — there is no proof the parcel ever moved, so the bank refunds the customer automatically.`,
      [
        'Find the tracking number from the carrier and add it to the fulfillment in Shopify.',
        'If the number cannot be found: treat the order as untracked — refund on the first complaint instead of fighting it.',
        'Going forward: never mark an order fulfilled before the tracking number exists.',
      ],
      'Tracking is the single piece of evidence that decides "item not received" disputes.',
      { antal: utanSpar.varde }, 'VA + Axel');
  }

  // ----------------------------------------------------------- PROCESS
  // 11. Toppkategorin — volymen, inte enskilda mejl.
  const topp = (s.topp ?? []).filter((p) => p.id !== 'ovrigt')[0];
  if (topp && (s.antalArenden ?? 0) > 0) {
    const andel = Math.round((topp.antal / s.antalArenden) * 100);
    const namn = KATEGORI[topp.id]?.en ?? topp.id;
    const wismo = topp.id === 'var_ar_ordern' || topp.id === 'ej_levererad';
    lagg('process', 1, `topp_${topp.id}`,
      `${namn} is ${andel}% of all tickets — remove the reason, not the ticket`,
      `${topp.antal} of ${s.antalArenden} tickets are "${namn}". Answering them faster does not reduce them; only changing what the customer sees before they write does.${wismo ? ' Shipping-time questions are the classic case: the customer writes because the store never told them when to expect the parcel.' : ''}`,
      wismo ? [
        'Put the real delivery window in three places: the product page, the cart, and the order confirmation email. Use the honest number, not the optimistic one.',
        'Send a proactive email on day 7 after the order: "your parcel is on its way, here is the tracking, expected <date>". Most WISMO tickets are written on days 7–14.',
        'Make the tracking link impossible to miss in the shipping confirmation — big button, not a line of text.',
        'Measure it here next week: this number should drop, and that is the proof it worked.',
      ] : [
        `Read the last 10 "${namn}" tickets and write down the one sentence the customer keeps repeating.`,
        'Fix that sentence at the source: product page, product images, size guide, or the confirmation email — whichever created the expectation.',
        'Write a saved reply for the ones that still come in, so the answer takes 30 seconds instead of 5 minutes.',
        'Measure it here next week: the count should drop.',
      ],
      `Cutting this category in half removes roughly ${Math.round(topp.antal / 2)} ticket${Math.round(topp.antal / 2) === 1 ? '' : 's'} every ${dagar} days — permanently, not just faster.`,
      { kategori: topp.id, antal: topp.antal, andel }, 'VA + Axel');
  }

  // 12. Sparade svar för de kategorier som återkommer.
  const kandidater = (s.topp ?? []).filter((p) => p.id !== 'ovrigt' && p.antal >= 2).slice(0, 5);
  if (kandidater.length >= 2) {
    lagg('process', 2, 'mallar',
      `Write ${kandidater.length} saved replies — they cover ${Math.round((kandidater.reduce((x, p) => x + p.antal, 0) / (s.antalArenden || 1)) * 100)}% of everything that comes in`,
      `The same ${kandidater.length} questions come back every week: ${kandidater.map((p) => `${KATEGORI[p.id]?.en ?? p.id} (${p.antal})`).join(', ')}. Writing each answer from scratch is what makes the median reply time ${median ?? '—'} h.`,
      [
        'Write one saved reply per category, in Swedish and English, and keep them where you answer from (Roundcube → Settings → Responses).',
        'Each reply has three slots you fill in: order number, what we are doing, and by when. Never send one without the "by when".',
        'A saved reply is a starting point, not a robot — always add the customer\'s name and their specific order.',
        'Add each one to the Notion SOP database so the next person answers the same way.',
      ],
      'Cuts the time per ticket to under a minute for the most common cases, which is what makes a 24 h first reply realistic.',
      { kategorier: kandidater.map((p) => p.id), tackning: kandidater.reduce((x, p) => x + p.antal, 0) });
  }

  // 13. SOP-luckorna, mätt mot VA:ns riktiga Notion-databas.
  if (r.sop && !r.sop.fel && r.sop.saknas?.length) {
    const namn = r.sop.saknas.map((id) => KATEGORI[id]?.en ?? id);
    lagg('process', 3, 'sop',
      `Write ${namn.length} missing SOP${namn.length === 1 ? '' : 's'}: ${namn.join(', ')}`,
      `${r.sop.antalSop} SOPs exist in Notion, but these categories show up in the tickets without one. No SOP means every person answers differently, and nobody can take over the inbox.`,
      [
        'One page per category in the Notion support database, same structure as the existing ones.',
        'Each page answers three things: how to check it in Shopify, what we offer the customer, and when to escalate to Axel.',
        'Link the saved reply from the SOP page so they never drift apart.',
      ],
      'An SOP is what makes the inbox transferable — and what keeps the answer consistent when volume doubles.',
      { saknas: r.sop.saknas, antalSop: r.sop.antalSop });
  }

  // 14. Tvistgraden mot kortnätverkens gränser — Axels tal, inte VA:ns.
  const grad = r.risk?.tvistgrad;
  if (grad !== null && grad !== undefined && grad >= (t.tvistgrans_gul_procent ?? 0.5)) {
    const rod = grad >= (t.tvistgrans_rod_procent ?? 0.9);
    lagg('process', 4, 'tvistgrad',
      `Dispute rate is ${String(grad).replace('.', ',')}% — ${rod ? 'above' : 'approaching'} the card networks' limit`,
      `${r.risk.underlag?.chargebacks ?? 0} chargebacks on ${r.risk.underlag?.ordrar ?? 0} orders over ${dagar} days. Visa acts from 0.9% and Mastercard from 1.0%; ${rod ? 'we are over that line, which puts the payment account itself at risk (monitoring programs, held payouts, higher fees).' : 'we are in the warning band below it.'}`,
      [
        'Track this number every week here — it is the one metric that can shut the store down, not just cost money.',
        'The three levers, in order of effect: answer within 24 h, ship with tracking, refund fast when in doubt.',
        'Refunding a doubtful order costs the order value. A chargeback costs the order value plus the fee plus the ratio.',
      ],
      rod ? 'Getting back under 0.9% protects the payment account, not just the margin.' : 'Staying under 0.5% keeps us out of the monitoring programs entirely.',
      { tvistgrad: grad, chargebacks: r.risk.underlag?.chargebacks ?? 0, ordrar: r.risk.underlag?.ordrar ?? 0 }, 'Axel');
  }

  return ut.sort((a, b) => (HINKAR.findIndex((h) => h.id === a.hink) - HINKAR.findIndex((h) => h.id === b.hink)) || (a.prio - b.prio));
}

/** Planen grupperad per hink — det sidan renderar. */
export function planPerHink(plan) {
  return HINKAR.map((h) => ({ ...h, atgarder: plan.filter((a) => a.hink === h.id) })).filter((h) => h.atgarder.length);
}
