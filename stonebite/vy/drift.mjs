// vy/drift.mjs — Kundtjänst och Leverans. De två sidor VA:n lever i.
//
// ⚠️ Texterna i veckorapporternas åtgärdsplan skrivs om vid varje körning och
// har innehållit ett fel som rättades 2026-09-20 ("en obesvarad tvist förloras
// automatiskt" — falskt för inquiries, de ESKALERAR till chargeback). Därför
// visas planens rubrik och mätvärden, aldrig den sparade brödtexten: en
// dashboard ska inte sprida en gammal felformulering vidare.

import { esc, attr, kort, panel, tabell, tomt, block, status, stapel, tal, pengar, t, sprak } from './delar.mjs';
import { sidhuvud } from './layout.mjs';
import { sedan, datum, DAG } from '../berakna.mjs';
import { kategorinamn, tvisttyp, forklaraFel } from '../forklaring.mjs';
// Botens löfte till den arga kunden: "svar inom N timmar". Samma konstant som
// mallen skickar — ändras den där ska klockan på sidan följa med av sig själv.
import { ESKALERING_TIMMAR } from '../../kundtjanst/autosvar/svar.mjs';

const RISKTON = (p) => (p >= 50 ? 'kritisk' : p >= 25 ? 'varning' : 'bra');
const RISKORD = (p) => (p >= 50 ? 'hög risk' : p >= 25 ? 'medel' : 'lugnt');

/** "#5763" är ett ordernummer. Ett 14-siffrigt id är Shopifys interna — det
 *  säger ingenting för den som ska leta upp ordern, så det märks ut. */
function ordertext(order) {
  const o = String(order ?? '').trim();
  if (!o) return 'order saknas i rapporten';
  if (o.startsWith('#')) return o;
  if (/^\d{10,}$/.test(o)) return `order-id …${o.slice(-6)}`;
  return o;
}

/** "i dag", "1 dag kvar", "5 dagar kvar" — på läsarens språk och rätt böjt. */
function tidKvar(dagar) {
  if (dagar < 0) return t('passerad');
  if (dagar === 0) return t('i dag');
  if (sprak() === 'en') return `${dagar} ${dagar === 1 ? 'day' : 'days'} left`;
  return `${dagar} ${dagar === 1 ? 'dag' : 'dagar'} kvar`;
}

function dagarKvar(deadline, nu) {
  if (!deadline) return null;
  const t = new Date(deadline).getTime();
  if (Number.isNaN(t)) return null;
  return Math.ceil((t - nu.getTime()) / DAG);
}

// ------------------------------------------------------------ autosvaret
//
// Kundtjänstboten (kundtjanst/autosvar.mjs) loggar varje mejl den läst:
// ENKEL besvaras, ARG får ett lugnande svar och flaggas till VA:n, SVÅR bara
// flaggas. Här visas det Axel bad om (2026-09-22): "alla cases som AI-botten
// har svarat på, där det är arga kunder, ska komma upp som en lista på
// kundtjänst-taben". Talen är oversikt.mjs:s (snapshot.autosvar), aldrig
// omräknade. Utkast ≠ skickat — en bot som bara skriver utkast är inte igång,
// och det står i klartext.

/** Butikens namn ur snapshoten — brandet i loggen är butiks-id:t (baverbutiken …). */
export function butiksnamnFor(snapshot, id) {
  const k = String(id ?? '');
  return (snapshot?.butiker ?? []).find((b) => b.id === k)?.namn
    ?? (snapshot?.kundtjanst?.brands ?? []).find((b) => b.id === k)?.namn
    ?? k;
}

/** Vad boten faktiskt gör just nu, ur loggens tal. Ren. */
export function autosvarLage(b, nu = new Date()) {
  const a = b?.antal ?? {};
  const senast = b?.senasteKorning ? new Date(b.senasteKorning).getTime() : null;
  const stilla = senast === null || nu.getTime() - senast > DAG;
  // Fel = boten kunde inte skriva i brevlådan (utkast, flagga, flytt). Utan den
  // raden ser en bot som inte FÅR skriva (Loopia nekar Railways adress, fel
  // lösenord) exakt ut som en bot som inte HADE något att skriva.
  if ((a.fel ?? 0) > 0) return { ton: 'kritisk', ord: 'kunde inte skriva i brevlådan', skarpt: (a.svar ?? 0) > 0, stilla, fel: a.fel };
  if ((a.svar ?? 0) > 0) return { ton: stilla ? 'varning' : 'bra', ord: stilla ? 'skickar svar — men stod stilla senaste dygnet' : 'skickar svar', skarpt: true, stilla, fel: 0 };
  if ((a.utkast ?? 0) > 0) return { ton: 'varning', ord: 'bara utkast — inget skickas', skarpt: false, stilla, fel: 0 };
  return { ton: 'neutral', ord: 'inget svar skrivet', skarpt: false, stilla, fel: 0 };
}

// ------------------------------------------------------ AI-botens svar
//
// Första versionen (2026-09-22) var en tabell med bara de arga: blek, liten,
// inget att trycka på. Axel 2026-09-23, efter att Mechile svarat Micke
// Stigberg 15:28 utan att se botens svar 13:42: "jag tycker det känns
// jättesvårt att se vilka cases AI-botten har svarat på … väldigt blek text …
// inget att interagera med eller markera som hanterade eller svarade på
// eller uppföljda." Därför:
//   • ETT kort per mejl boten svarat på — ENKEL och ARG, inte bara de arga —
//     med badge, ordernumret stort, vad boten skrev och nästa steg för VA:n.
//     Texten i korten är fullfärg (--ink), aldrig --ink-3.
//   • ARG-kortet bär klockan: boten lovade svar inom ESKALERING_TIMMAR, och
//     sidan räknar ner från botens svarstid.
//   • Knappen "Markera som uppföljd" (stonebite/uppfoljning.mjs) flyttar
//     kortet till arkivet; "Ångra" tar tillbaka det. Loggen rörs aldrig.
//   • Torrkörningens utkast står i en egen hopfälld lista: kunden fick aldrig
//     dem, så det finns inget att bygga vidare på.

const TIDSZON = 'Europe/Stockholm';
const SVARAD = (r) => r?.atgard === 'svar' || r?.atgard === 'utkast';

/** SOP-sidan i Notion som varje kort att följa upp länkar till — id:t ur kundtjanst/va-sop/notion.json (publicerad 2026-09-23). */
export const SOP_UPPFOLJNING = Object.freeze({ titel: 'Following up the auto-reply — as Head of Customer Support', url: 'https://www.notion.so/3e4270ab908c8159be5ef75cd2b03b21' });

/** "23 sep. 13:42" i svensk tid, på läsarens språk. Ren. */
export function klockslag(iso) {
  const d = iso instanceof Date ? iso : new Date(iso);
  if (Number.isNaN(d.getTime())) return '–';
  const loc = sprak() === 'en' ? 'en-GB' : 'sv-SE';
  return new Intl.DateTimeFormat(loc, { timeZone: TIDSZON, day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false }).format(d).replace(',', '');
}

/** sedan() på läsarens språk: "3 timmar sedan" → "3 hours ago". Ren. */
function sedanT(iso, nu) {
  const s = sedan(iso, { nu: nu instanceof Date ? nu.getTime() : nu });
  const m = /^(\d+) (.+)$/.exec(s);
  return m ? `${m[1]} ${t(m[2])}` : t(s);
}

/**
 * Ärendena boten svarat på, ett per mejl, med VA:ns bock påhängd. `arga`
 * (rika rader) läses före `svarade`, samma nyckel räknas en gång. Ren.
 */
export function botfallFor(autosvar, { bara = null, namnFor = (id) => id, uppfoljning = null } = {}) {
  const upp = uppfoljning instanceof Map ? uppfoljning : new Map(Object.entries(uppfoljning ?? {}));
  const ut = [];
  for (const [id, b] of Object.entries(autosvar?.brands ?? {})) {
    if (bara && !bara.includes(id)) continue;
    const sedda = new Set();
    for (const r of [...(b.arga ?? []), ...(b.svarade ?? [])]) {
      if (!SVARAD(r)) continue;
      const nyckel = r.nyckel ?? `${r.uid ?? '?'}|${r.tid ?? ''}`;
      if (sedda.has(nyckel)) continue;
      sedda.add(nyckel);
      const bock = upp.get(nyckel) ?? null;
      ut.push({
        ...r, nyckel, brandId: id, butik: namnFor(id),
        uppfoljd: Boolean(bock?.uppfoljd), bock,
        // Boten lovade något eller lämnade tråden till VA:n: arga kunder, och allt boten flaggade/flyttade.
        foljsUpp: r.hink === 'ARG' || Boolean(r.flaggad) || Boolean(r.flyttad),
      });
    }
  }
  return ut;
}

/** Fyra högar: att följa upp (ARG överst, äldst först), klara (nyast först), arkivet, torrkörningens utkast. Ren. */
export function botfallGrupper(fall) {
  const nyastForst = (a, b) => String(b.tid ?? '').localeCompare(String(a.tid ?? ''));
  const skickade = fall.filter((f) => f.atgard === 'svar');
  const oppna = skickade.filter((f) => !f.uppfoljd);
  return {
    attFoljaUpp: oppna.filter((f) => f.foljsUpp).sort((a, b) => {
      const aArg = a.hink === 'ARG'; const bArg = b.hink === 'ARG';
      if (aArg !== bArg) return aArg ? -1 : 1;
      return String(a.tid ?? '').localeCompare(String(b.tid ?? ''));
    }),
    klara: oppna.filter((f) => !f.foljsUpp).sort(nyastForst),
    arkiv: skickade.filter((f) => f.uppfoljd).sort((a, b) => String(b.bock?.tid ?? '').localeCompare(String(a.bock?.tid ?? ''))),
    utkast: fall.filter((f) => f.atgard === 'utkast').sort(nyastForst),
  };
}

/** ARG: boten lovade svar inom `timmar` från sitt svar. { deadline, timmarKvar, ton, text } — ren. */
export function lovatSvar(r, { nu = new Date(), timmar = ESKALERING_TIMMAR } = {}) {
  const t0 = new Date(r?.tid).getTime();
  if (Number.isNaN(t0)) return null;
  const deadline = new Date(t0 + timmar * 3_600_000);
  const kvar = (deadline.getTime() - nu.getTime()) / 3_600_000;
  const h = Math.abs(Math.round(kvar));
  const en = sprak() === 'en';
  if (kvar < 0) return { deadline, timmarKvar: kvar, ton: 'kritisk', text: en ? `PROMISE PASSED, ${h} h ago` : `LÖFTET PASSERAT, för ${h} h sedan` };
  return { deadline, timmarKvar: kvar, ton: kvar <= 12 ? 'kritisk' : kvar <= 24 ? 'varning' : 'neutral', text: en ? `${h} h left` : `${h} h kvar` };
}

// Vad den arga kunden fick höra om sitt problem (X i kundtjanst/autosvar/svar.mjs), kort.
const X_SV = Object.freeze({
  ej_levererad: 'paketet har inte kommit fram', skadad_defekt: 'varan är trasig eller fungerar inte', fel_vara: 'fel vara',
  som_pa_bilden: 'ser inte ut som på bilden', kvalitet: 'dålig kvalitet', var_ar_ordern: 'väntat på paketet',
  aterbetalning: 'vill ha pengarna tillbaka', avbestallning: 'avbeställning', retur_angerratt: 'retur eller ångerrätt',
  okand_debitering: 'okänd debitering', chargeback_hot: 'hotar med banken', vantat: 'har väntat på svar',
  levererat_ej_mottaget: 'levererat men inte mottaget', standard: 'allmänt klagomål',
});
const FOTON_SV = Object.freeze({ vara: 'bild eller kort video på varan där felet syns', passform: 'bild på varan på plats, plus mått eller modell', leverans: 'varan, förpackningen och fraktetiketten' });
const FOTON_EN = Object.freeze({ vara: 'a photo or short video of the item showing the fault', passform: 'a photo of the item in place, plus measurements or model', leverans: 'the item, the packaging and the shipping label' });

/** Vad boten faktiskt skrev till kunden, i en mening VA:n kan bygga vidare på. Ren. */
export function botSvarText(r, { etiketter = null } = {}) {
  const en = sprak() === 'en';
  const h = ESKALERING_TIMMAR;
  if (r.hink === 'ARG') {
    const x = en ? (etiketter?.x?.[r.x] ?? String(r.x ?? 'complaint').replaceAll('_', ' ')) : (X_SV[r.x] ?? X_SV.standard);
    const delar = [en
      ? `Calming reply: "I fully understand your frustration", the problem in plain words (${x}), escalated as urgent, promised a reply within ${h} hours.`
      : `Lugnande svar: "jag förstår helt din frustration", problemet i klartext (${x}), eskalerat som brådskande, lovade svar inom ${h} timmar.`];
    if (r.opostadDagar) delar.push(en ? `Said the order has sat unshipped for ${r.opostadDagar} days.` : `Skrev att ordern legat opostad i ${r.opostadDagar} dagar.`);
    if (r.lage) delar.push(en ? 'Told the customer where the parcel is right now.' : 'Berättade var paketet är just nu.');
    if (r.foton) delar.push(en ? `Asked for photos (${FOTON_EN[r.fotonTyp] ?? FOTON_EN.leverans}).` : `Bad om bilder (${FOTON_SV[r.fotonTyp] ?? FOTON_SV.leverans}).`);
    if (r.retur) delar.push(en ? 'Sent the return instructions.' : 'Skickade returinstruktionerna.');
    if (r.behoverOrdernummer) delar.push(en ? 'Asked for the order number.' : 'Bad om ordernumret.');
    return delar.join(' ');
  }
  switch (r.typ) {
    case 'wismo': return en ? 'Answered where the parcel is: the latest scan, the tracking link and the parcel number.' : 'Svarade var paketet är: senaste skanningen, spårningslänken och paketnumret.';
    case 'levererad': return en ? 'Said the carrier marked the parcel as delivered, with the checklist (mailbox, notice, pickup point, neighbours) and "reply if you still cannot find it".' : 'Svarade att fraktbolaget markerat paketet som levererat, med checklistan (brevlådan, avi, ombud, grannar) och "svara om du ändå inte hittar det".';
    case 'foton': return en ? `Apologised ("we will look at it right away") and asked for photos (${FOTON_EN[r.fotonTyp] ?? FOTON_EN.leverans}).` : `Beklagade ("det tittar vi på direkt") och bad om bilder (${FOTON_SV[r.fotonTyp] ?? FOTON_SV.leverans}).`;
    case 'retur': return en ? 'Sent the return instructions: original packaging, order number on the parcel, the address, straight to the address and not to a pickup point, the customer pays the postage, "reply with your tracking number".' : 'Skickade returinstruktionerna: originalförpackning, ordernumret på paketet, adressen, direkt till adressen och inte till ombud, kunden betalar frakten, "svara med spårningsnumret".';
    case 'leveranstid': return en ? 'Answered with the delivery time and the packing time.' : 'Svarade med leveranstiden och packtiden.';
    case 'oppettider': return en ? 'Answered with our reply time and asked for the order number.' : 'Svarade med vår svarstid och bad om ordernumret.';
    case 'adress': return en ? 'Confirmed the new address was sent to the warehouse as a priority and that the order has not shipped yet.' : 'Bekräftade att den nya adressen skickats till lagret med prioritet och att ordern inte skickats än.';
    case 'ordernummer': return en ? 'Asked for the order number.' : 'Bad om ordernumret.';
    case 'foretag': return en ? 'Sent the company details.' : 'Skickade företagsuppgifterna.';
    default: return en ? `Replied (${r.typ ?? r.hink ?? 'unknown type'}).` : `Svarade (${r.typ ?? r.hink ?? 'okänd typ'}).`;
  }
}

/** Vad VA:n ska göra med kortet, i en mening. Ren. */
export function nastaStegText(r) {
  const en = sprak() === 'en';
  const h = ESKALERING_TIMMAR;
  if (r.hink === 'ARG') {
    return en
      ? `Write to the customer within ${h} hours of the bot's reply, as Head of Customer Support: the case was escalated to you personally. Read the bot's email first, build on it, never ask again for what the customer already sent.`
      : `Skriv till kunden inom ${h} timmar från botens svar, som Head of Customer Support: ärendet är eskalerat till dig personligen. Läs botens mejl först, bygg vidare, be aldrig om det kunden redan skickat.`;
  }
  switch (r.typ) {
    case 'foton': return en ? 'Check whether the photos have arrived. Yes: handle it as a damaged or wrong item per that SOP, as Head of Customer Support. No photos after 2 days: one friendly reminder.' : 'Kolla om bilderna kommit. Ja: hantera som skadad eller fel vara enligt den SOP:en, som Head of Customer Support. Inga bilder efter 2 dagar: en vänlig påminnelse.';
    case 'retur': return en ? 'Wait for the customer\'s tracking number, confirm when the parcel has arrived, refund per the return SOP. Do not send the instructions again.' : 'Vänta in kundens spårningsnummer, bekräfta när paketet kommit, återbetalning enligt retur-SOP:en. Skicka inte instruktionerna igen.';
    case 'levererad': return en ? 'If the customer replies that the parcel is still missing: the SOP "Package missing after tracking shows delivered", as Head of Customer Support. Otherwise nothing.' : 'Svarar kunden att paketet ändå saknas: SOP:en "Package missing after tracking shows delivered", som Head of Customer Support. Annars inget.';
    default:
      if (r.flaggad || r.flyttad) return en ? 'The bot answered and handed the thread to you: read its reply, then continue per the SOP for the problem.' : 'Boten svarade och lämnade tråden till dig: läs dess svar, fortsätt sedan enligt SOP:en för problemet.';
      return en ? 'Nothing, unless the customer writes again. If they do: continue the thread and do not repeat what the bot already said.' : 'Inget, om inte kunden skriver igen. Gör kunden det: fortsätt tråden och upprepa inte det boten redan sagt.';
  }
}

/** Ett kort. `arkiv` ritar bocken (vem, när) och Ångra i stället för nästa steg och Markera. */
function botfallKort(f, { nu, csrf, nasta, arkiv = false, etiketter = null }) {
  const arg = f.hink === 'ARG';
  const ordernr = f.ordernummer?.[0] ? String(f.ordernummer[0]) : '';
  const order = ordernr ? `#${ordernr}` : t('order saknas i mejlet');
  const lov = arg && !arkiv ? lovatSvar(f, { nu }) : null;
  const knapp = csrf ? `<form method="post" action="${arkiv ? '/app/autosvar/oppna' : '/app/autosvar/uppfoljd'}" class="botfall-form">
        <input type="hidden" name="csrf" value="${attr(csrf)}"><input type="hidden" name="nyckel" value="${attr(f.nyckel)}"><input type="hidden" name="brand" value="${attr(f.brandId)}"><input type="hidden" name="order" value="${attr(ordernr)}"><input type="hidden" name="nasta" value="${attr(nasta)}">
        <button class="knapp liten${arkiv ? ' tyst' : ''}" type="submit">${esc(t(arkiv ? 'Ångra' : 'Markera som uppföljd'))}</button>
      </form>` : '';
  const sop = !arkiv && f.foljsUpp && SOP_UPPFOLJNING.url ? `<a class="botfall-sop" href="${attr(SOP_UPPFOLJNING.url)}" target="_blank" rel="noopener">${esc(t('SOP: Följa upp AI-botens svar'))}</a>` : '';
  return `<li class="botfall${arg ? ' arg' : f.foljsUpp ? ' uppfolj' : ' klar'}${arkiv ? ' arkiv' : ''}">
    <div class="botfall-topp">
      <span class="botmarke${arg ? ' arg' : ''}">${esc(t(arg ? 'ARG KUND · AI-boten svarade' : 'AI-boten svarade'))}</span>
      <span class="botfall-tid">${esc(klockslag(f.tid))} <span class="botfall-sedan">(${esc(sedanT(f.tid, nu))})</span></span>
      <span class="botfall-butik">${esc(f.butik)}${f.sprak ? ` · ${esc(f.sprak)}` : ''}</span>
    </div>
    <div class="botfall-kropp">
      <div class="botfall-order">${esc(order)}${f.amne ? `<span class="botfall-amne">${esc(f.amne)}</span>` : ''}</div>
      <p class="botfall-rad"><b>${esc(t('Vad boten skrev'))}:</b> ${esc(botSvarText(f, { etiketter }))}</p>
      ${arkiv
    ? `<p class="botfall-rad"><b>${esc(t('Uppföljd av'))}:</b> ${esc(f.bock?.av ?? '–')} · ${esc(klockslag(f.bock?.tid))}</p>`
    : `<p class="botfall-rad"><b>${esc(t('Nästa steg för dig'))}:</b> ${esc(nastaStegText(f))} ${sop}</p>`}
    </div>
    <div class="botfall-hoger">
      ${lov ? `<span class="botfall-lofte ${lov.ton}"><span>${esc(t('Svar lovat senast'))} ${esc(klockslag(lov.deadline))}</span><b>${esc(lov.text)}</b></span>` : ''}
      ${knapp}
    </div>
  </li>`;
}

/**
 * Blocket "AI-boten har svarat": ett kort per butik med läget, sedan korten —
 * att följa upp, klara, arkivet, torrkörningens utkast. `bara` begränsar till
 * vissa butiks-id:n (varumärkets flik); `uppfoljning` är bockarna
 * (stonebite/uppfoljning.mjs, Map eller objekt); utan `csrf` ritas inga
 * knappar. Ingen logg ⇒ "har inte kört", aldrig noll.
 */
export function autosvarBlock(autosvar, { nu = new Date(), namnFor = (id) => id, bara = null, uppfoljning = null, csrf = '', nasta = '/app/kundtjanst#ai-boten' } = {}) {
  const brands = Object.entries(autosvar?.brands ?? {}).filter(([id]) => !bara || bara.includes(id));
  const titel = 'AI-boten har svarat';
  const under = 'Varje kort är ett kundmejl boten redan har svarat på. Läs botens svar innan du skriver, kunden har redan fått det. Bocka av kortet när du följt upp, så hamnar det i arkivet.';
  if (!brands.length) {
    const ingenAlls = !Object.keys(autosvar?.brands ?? {}).length;
    return block({ id: 'ai-boten', titel, under, innehall: tomt('Autosvaret har inte kört', ingenAlls ? 'Ingen logg finns — boten är inte igång för någon butik.' : 'Ingen logg finns för de här butikerna — boten är inte igång här.') });
  }
  const en = sprak() === 'en';
  const dagar = autosvar?.dagar ?? 30;
  const korten = brands.map(([id, b]) => {
    const a = b.antal ?? {};
    const lage = autosvarLage(b, nu);
    return kort({
      etikett: namnFor(id),
      varde: `${tal(a.ARG ?? 0)} <span class="mini">${esc(t('arga kunder'))}</span>`,
      text: true,
      forklaring: en
        ? `${tal(a.mejl ?? 0)} emails read in ${dagar} days · ${tal(a.svar ?? 0)} sent · ${tal(a.utkast ?? 0)} drafts · ${tal(a.tillVa ?? 0)} handed to the VA without a reply.${(a.fel ?? 0) > 0 ? ` <strong>${tal(a.fel)} write errors</strong> — see the VA list.` : ''}`
        : `${tal(a.mejl ?? 0)} mejl lästa på ${dagar} dagar · ${tal(a.svar ?? 0)} skickade · ${tal(a.utkast ?? 0)} utkast · ${tal(a.tillVa ?? 0)} till VA:n utan svar.${(a.fel ?? 0) > 0 ? ` <strong>${tal(a.fel)} skrivfel</strong> — se VA-listan.` : ''}`,
      status: status(lage.ton, lage.ord),
      fot: b.senasteKorning ? `${t('Senaste körning')} ${sedanT(b.senasteKorning, nu)}` : t('Har aldrig kört'),
    });
  }).join('');

  const g = botfallGrupper(botfallFor(autosvar, { bara, namnFor, uppfoljning }));
  const etiketter = autosvar?.etiketter ?? null;
  const lista = (rader, arkiv = false) => `<ul class="botfall-lista">${rader.map((f) => botfallKort(f, { nu, csrf, nasta, arkiv, etiketter })).join('')}</ul>`;

  // Torrkörningens utkast: kunden fick inget, så bara raden — vad, varför, att det aldrig gick ut.
  const utkastRader = g.utkast.slice(0, 30).map((r) => {
    const order = r.ordernummer?.[0] ? `#${r.ordernummer[0]}` : t('order saknas i mejlet');
    const varfor = en ? (r.orsakEn || r.orsak || r.x || '—') : (r.orsak || r.orsakEn || r.x || '—');
    const va = [r.flaggad ? t('flaggad') : null, r.flyttad ? `→ ${r.flyttad}` : null].filter(Boolean).join(' · ');
    return `<tr>
      <td class="tal"><span class="mini">${esc(sedanT(r.tid, nu))}</span></td>
      <td><span class="namn">${esc(r.butik)}</span>${r.sprak ? `<span class="bi">${esc(r.sprak)}</span>` : ''}</td>
      <td><span class="namn">${esc(order)}</span>${r.amne ? `<span class="bi">${esc(r.amne)}</span>` : ''}</td>
      <td>${esc(varfor)}${r.x ? `<span class="bi">${esc(r.x)}</span>` : ''}</td>
      <td>${status('varning', 'utkast — inte skickat')}${va ? `<span class="bi">${esc(va)}</span>` : ''}</td>
    </tr>`;
  });

  return block({
    id: 'ai-boten',
    titel,
    under,
    innehall: `<div class="kort-rad">${korten}</div>
    ${panel({
      titel: 'Att följa upp',
      under: `Boten har lovat kunden något (svar inom ${ESKALERING_TIMMAR} timmar, "det tittar vi på direkt") eller lämnat ärendet till dig. Arga kunder överst, äldst först.`,
      innehall: g.attFoljaUpp.length ? lista(g.attFoljaUpp) : tomt('Ingenting att följa upp', 'Alla botsvar som lämnats till dig är bockade, eller så har boten inte lämnat något till dig än.'),
    })}
    ${g.klara.length ? panel({
      titel: 'Boten svarade klart',
      under: 'Inget att göra om kunden inte skriver igen. Skriver kunden igen: fortsätt tråden, upprepa inte det boten redan sagt.',
      innehall: lista(g.klara),
    }) : ''}
    ${g.arkiv.length ? `<details class="botfall-arkiv"><summary>${esc(t('Uppföljda (arkiv)'))} · ${g.arkiv.length}</summary>${lista(g.arkiv, true)}</details>` : ''}
    ${g.utkast.length ? `<details class="botfall-arkiv"><summary>${esc(t('Torrkörningens utkast, kunden fick inget'))} · ${g.utkast.length}</summary>${tabell(
    [{ titel: 'När' }, { titel: 'Butik' }, { titel: 'Order' }, { titel: 'Orsak' }, { titel: 'Botens svar' }],
    utkastRader,
  )}${g.utkast.length > 30 ? `<p class="panel-fot">${esc(en ? `Showing 30 of ${g.utkast.length}.` : `Visar 30 av ${g.utkast.length}.`)}</p>` : ''}</details>` : ''}`,
  });
}

// ------------------------------------------------------------ kundtjänst

/**
 * Tvisterna sidan visar. Finns `snapshot.tvister` (lästa direkt ur Shopify i
 * varje timhämtning) är det de raderna — bara de som väntar på VÅRT svar;
 * `under review` är redan inskickade och går inte att röra. Annars
 * veckorapportens rader som förut. Ren.
 */
export function tvisterForSidan(snapshot, nu = new Date()) {
  const live = snapshot?.tvister ?? null;
  const k = snapshot?.kundtjanst ?? { brands: [] };
  const alla = live
    ? (snapshot?.oppnaTvister ?? [])
      .filter((tv) => tv.oppen !== false && !tv.besvarad && tv.deadline)
      .map((tv) => ({ ...tv, brand: butiksnamnFor(snapshot, tv.brand), kvar: dagarKvar(tv.deadline, nu) }))
    : (k.brands ?? []).flatMap((b) => (b.tvister ?? [])
      .filter((tv) => tv.deadline)
      .map((tv) => ({ ...tv, brand: b.namn, kvar: dagarKvar(tv.deadline, nu) })));
  const lasta = live ? live.butiker.filter((b) => b.status === 'ok' || b.status === 'saknas') : [];
  const olasta = live ? live.butiker.filter((b) => !lasta.includes(b)) : [];
  return {
    fran: live ? 'shopify' : 'veckorapport',
    hamtad: live?.hamtad ?? null,
    lasta,
    olasta,
    bradskande: alla.filter((tv) => tv.kvar !== null && tv.kvar >= 0 && tv.kvar <= 7).sort((a, b) => a.kvar - b.kvar),
    passerade: alla.filter((tv) => tv.kvar !== null && tv.kvar < 0),
  };
}

function tvistblock(tv, { nu, rapportAlder = null }) {
  const { bradskande, passerade } = tv;
  const passeratBelopp = passerade.reduce((s, x) => s + (Number(x.belopp) || 0), 0);
  const tvistrader = bradskande.slice(0, 12).map((x) => `<tr>
    <td>
      <span class="namn">${esc(ordertext(x.order))}</span>
      <span class="bi">${esc(x.brand)}${x.typ ? ` · ${esc(tvisttyp(x.typ, sprak()))}` : ''}</span>
    </td>
    <td class="tal">${pengar(x.belopp, x.valuta)}</td>
    <td class="tal">${esc(datum(x.deadline, { nu }))}</td>
    <td>${status(x.kvar <= 2 ? 'kritisk' : x.kvar <= 4 ? 'varning' : 'neutral', tidKvar(x.kvar))}</td>
  </tr>`);
  const kalla = tv.fran === 'shopify'
    ? `${t('Läst direkt ur Shopify')} ${t(sedan(tv.hamtad))}: ${tv.lasta.map((b) => b.namn).join(', ') || '–'}.${tv.olasta.length ? ` ${t('Gick inte att läsa')}: ${tv.olasta.map((b) => b.namn).join(', ')}.` : ''}`
    : t('Ur kundtjänstens veckorapport.');
  return `${block({
    titel: 'Tvister som brådskar',
    under: 'Sorterade efter hur lite tid som är kvar. Chargebacks är de som faktiskt förloras.',
    innehall: bradskande.length
      ? panel({
        innehall: tabell(
          [{ titel: 'Order' }, { titel: 'Belopp', tal: true }, { titel: 'Sista svarsdag', tal: true }, { titel: 'Tid kvar' }],
          tvistrader,
        ),
        fot: `En obesvarad förfrågan förloras inte på plats — den eskalerar till chargeback med ny deadline. Alla förluster hittills har varit chargebacks.${bradskande.length > 12 ? ` Visar 12 av ${bradskande.length}.` : ''} ${kalla}`,
      })
      : tomt('Inget brådskar just nu', `Ingen tvist som väntar på vårt svar har svarsdag inom sju dagar. ${kalla}`),
  })}

    ${passerade.length ? block({
      titel: 'Passerade svarsdagar',
      innehall: tomt(
        `${passerade.length} tvister har passerat sin svarsdag (${pengar(Math.round(passeratBelopp), passerade[0].valuta ?? 'SEK')} sammanlagt)`,
        `De går inte att svara på längre. Förfrågningar som inte besvarats eskalerar till chargeback med en NY svarsdag — de dyker upp igen i listan ovan.${rapportAlder !== null && rapportAlder > 2 ? ` Obs: rapporten är ${rapportAlder} dagar gammal, så läget kan ha ändrats.` : ''}`,
      ),
    }) : ''}`;
}

export function kundtjanstSida({ snapshot, nu = new Date(), csrf = '' }) {
  const autosvaret = autosvarBlock(snapshot?.autosvar, { nu, namnFor: (id) => butiksnamnFor(snapshot, id), uppfoljning: snapshot?.uppfoljning ?? null, csrf, nasta: '/app/kundtjanst#ai-boten' });
  const k = snapshot?.kundtjanst ?? { status: 'saknas', brands: [] };
  const tv = tvisterForSidan(snapshot, nu);
  if (k.status !== 'ok' || !k.brands.length) {
    return {
      titel: 'Kundtjänst',
      innehall: `${sidhuvud({ rubrik: 'Kundtjänst', under: 'Mejl, ärenden och tvister.' })}
      ${autosvaret}
      ${tv.fran === 'shopify' ? tvistblock(tv, { nu }) : ''}
      ${tomt('Ingen veckorapport än', k.orsak ?? 'Kundtjänstrutinen har inte kört klart en vecka.')}`,
    };
  }

  const rapportAlder = k.brands[0]?.kord ? Math.floor((nu.getTime() - new Date(k.brands[0].kord).getTime()) / DAG) : null;

  const brandkort = k.brands.map((b) => {
    const n = b.nyckeltal ?? {};
    return kort({
      etikett: b.namn,
      varde: `${tal(n.risk ?? null)}/100`,
      forklaring: sprak() === 'en'
        ? `${tal(n.obesvarade ?? null)} unanswered out of ${tal(n.arenden ?? null)} tickets in the last ${b.period?.dagar ?? 30} days.`
        : `${tal(n.obesvarade ?? null)} obesvarade av ${tal(n.arenden ?? null)} ärenden senaste ${b.period?.dagar ?? 30} dagarna.`,
      status: status(RISKTON(n.risk ?? 0), RISKORD(n.risk ?? 0)),
      serie: (b.historik ?? []).map((h) => h.obesvarade),
      fot: b.vecka ? `${t('Vecka')} ${b.vecka}` : '',
    });
  }).join('');

  const kategorirader = k.brands.flatMap((b) => (b.kategorier ?? []).slice(0, 5).map((c) => ({ ...c, brand: b.namn, svenska: kategorinamn(c.id, c.en) })))
    .sort((a, b) => (b.antal ?? 0) - (a.antal ?? 0))
    .slice(0, 8);
  const maxKat = Math.max(1, ...kategorirader.map((c) => c.antal ?? 0));

  return {
    titel: 'Kundtjänst',
    innehall: `${sidhuvud({
      rubrik: 'Kundtjänst',
      under: 'Vad kunderna hör av sig om, och vad som brådskar.',
      farsk: k.brands[0]?.kord ? `${esc(t('Rapport körd'))} <b>${esc(t(sedan(k.brands[0].kord)))}</b>` : '',
    })}
    <div class="kort-rad">${brandkort}</div>

    ${autosvaret}

    ${tvistblock(tv, { nu, rapportAlder: tv.fran === 'veckorapport' ? rapportAlder : null })}

    ${block({
      titel: 'Vad kunderna frågar om',
      under: 'Störst högar först. En hög som växer är något att fixa i butiken, inte bara i inkorgen.',
      innehall: kategorirader.length
        ? panel({
          innehall: tabell(
            [{ titel: 'Ärende' }, { titel: 'Brand' }, { titel: 'Antal', tal: true }, { titel: '' }, { titel: 'Obesvarade', tal: true }, { titel: 'Rutin finns' }],
            kategorirader.map((c) => `<tr>
              <td><span class="namn">${esc(c.svenska)}</span></td>
              <td><span class="mini">${esc(c.brand)}</span></td>
              <td class="tal">${tal(c.antal)}</td>
              <td style="width:110px">${stapel(((c.antal ?? 0) / maxKat) * 100)}</td>
              <td class="tal">${tal(c.obesvarade)}</td>
              <td>${c.sop === 'covered' ? status('bra', 'ja') : status('varning', 'saknas')}</td>
            </tr>`),
          ),
        })
        : tomt('Inga kategorier', 'Veckorapporten innehöll inga ärendekategorier.'),
    })}

    ${block({
      titel: 'Att göra den här veckan',
      under: 'Ur veckorapporten, i ordning. Listan är VA:ns och står på engelska — det är hennes arbetsspråk.',
      innehall: panel({
        innehall: `<ul class="lista">${k.brands.flatMap((b) => (b.plan ?? []).slice(0, 4).map((p) => `
          <li>
            <span class="tid">${esc(p.hink === 'nu' ? 'NU' : p.hink === 'vecka' ? 'Veckan' : 'Senare')}</span>
            <span>
              <span class="namn">${esc(p.titel)}</span>
              <span class="bi">${esc(b.namn)}${p.matt?.belopp ? ` · ${pengar(Math.round(p.matt.belopp), p.matt.valuta ?? 'SEK')} ${t('i potten')}` : ''}${p.agare ? ` · ${esc(p.agare)}` : ''}</span>
            </span>
          </li>`)).join('')}</ul>`,
      }),
    })}`,
  };
}

// --------------------------------------------------------------- leverans

export function leveransSida({ snapshot }) {
  const l = snapshot?.leverans ?? { status: 'saknas', butiker: [] };
  const ok = (l.butiker ?? []).filter((b) => b.status === 'ok');

  if (!ok.length) {
    return {
      titel: 'Leverans',
      innehall: `${sidhuvud({ rubrik: 'Leverans', under: 'Paket på väg till kund.' })}
      ${tomt('Ingen spårningsdata än', l.orsak ?? 'Spårningsrutinen har inte kört för någon butik.')}`,
    };
  }

  const totalt = ok.reduce((s, b) => s + b.paket, 0);
  const paVag = ok.reduce((s, b) => s + b.paVag, 0);
  const levererade = ok.reduce((s, b) => s + b.levererade, 0);
  const utan = ok.reduce((s, b) => s + b.utanSkanning, 0);
  const senaste = ok.map((b) => b.senasteKorning).filter(Boolean).sort().pop();

  return {
    titel: 'Leverans',
    innehall: `${sidhuvud({
      rubrik: 'Leverans',
      under: 'Paketen vi följer åt kunderna, butik för butik.',
      farsk: senaste ? `${esc(t('Senaste rundan'))} <b>${esc(t(sedan(senaste)))}</b>` : '',
    })}
    <div class="kort-rad">
      ${kort({
        etikett: 'Paket vi följer',
        varde: tal(totalt),
        forklaring: sprak() === 'en'
          ? `Across ${ok.length} stores. Every parcel gets its scan written into Shopify every hour.`
          : `I ${ok.length} butiker. Varje paket får sin skanning inskriven i Shopify varje timme.`,
      })}
      ${kort({ etikett: 'På väg', varde: tal(paVag), forklaring: 'Paket som rör sig men inte är framme än.' })}
      ${kort({ etikett: 'Framme', varde: tal(levererade), forklaring: 'Levererade paket. De slutar följas automatiskt.' })}
      ${kort({
        etikett: 'Utan skanning',
        varde: tal(utan),
        forklaring: 'Registrerade men fraktbolaget har inte skannat dem än. Är talet stort och stiger — kolla att kvoten hos 17TRACK räcker.',
        status: status(utan > totalt * 0.3 ? 'varning' : 'neutral', utan > totalt * 0.3 ? 'kolla kvoten' : 'normalt'),
      })}
    </div>

    ${block({
      titel: 'Per butik',
      innehall: panel({
        innehall: tabell(
          [{ titel: 'Butik' }, { titel: 'Paket', tal: true }, { titel: 'På väg', tal: true }, { titel: 'Framme', tal: true }, { titel: 'Utan skanning', tal: true }, { titel: 'Senaste rundan', tal: true }],
          ok.map((b) => `<tr>
            <td><span class="namn">${esc(b.namn)}</span>${b.url ? `<span class="bi">${esc(String(b.url).replace(/^https?:\/\//, ''))}/pages/spara</span>` : ''}</td>
            <td class="tal">${tal(b.paket)}</td>
            <td class="tal">${tal(b.paVag)}</td>
            <td class="tal">${tal(b.levererade)}</td>
            <td class="tal">${tal(b.utanSkanning)}</td>
            <td class="tal"><span class="mini">${b.senasteKorning ? esc(sedan(b.senasteKorning)) : '–'}</span></td>
          </tr>`),
        ),
        fot: 'Kunden ser samma data på butikens egen spårningssida — med ort och tid, utan land och utan ordernummer.',
      }),
    })}

    ${(l.butiker ?? []).some((b) => b.status !== 'ok') ? block({
      titel: 'Butiker utan spårning',
      innehall: panel({
        innehall: `<ul class="lista">${(l.butiker ?? []).filter((b) => b.status !== 'ok').map((b) => `
          <li><span>${status('varning', 'ingen data')}</span><span><span class="namn">${esc(b.namn)}</span><span class="bi">${esc(b.orsak ?? '')}</span></span></li>`).join('')}</ul>`,
      }),
    }) : ''}`,
  };
}
