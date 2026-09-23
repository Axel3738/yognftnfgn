// fakta.mjs — det ENDA som får stå i ett automatiskt svar utöver mallens
// ord: ordern ur Shopify, sändningen, senaste skanningen ur 17TRACK och
// länken till butikens spårningssida. Hittas inget: `order: null`, och
// hinkar.beslut() lägger mejlet hos VA:n. Aldrig ett gissat datum.
//
// Två spärrar som inte diskuteras:
//   • Ordernumret kunden skrev slås upp — men orderns e-post MÅSTE vara
//     kundens (avsändaren). Annars `sparr` och inget svar. Det är så en
//     annan kunds order aldrig hamnar i ett mejl (Axels järnregel).
//   • Flera ordrar på samma adress utan ordernummer: bara om exakt EN inte
//     är levererad väljs den. Två öppna ⇒ VA:n, hellre tyst än fel paket.
//
// 17TRACK läses gratis (/gettrackinfo) och registreras ALDRIG härifrån —
// registreringen kostar kvot och görs av spårningsrutinen (sparning/kor.mjs).
// Utan TRACK17_API_KEY svarar motorn ändå: sändningsdatum + länk räcker.

import { hamta as hamta17Standard, nyckel as nyckel17 } from '../../sparning/17track.mjs';
import { tolka, bolagskod } from '../../sparning/status.mjs';
import { handelserUr } from '../../sparning/paketdata.mjs';
import { oversattFras, stadaPlats, landFor } from '../../sparning/sprak.mjs';
import { skapaOversattare } from '../../sparning/oversatt.mjs';
import { bavernummer } from '../../sparning/bavernummer.mjs';
import { sistaBiten } from '../../sparning/sistabiten.mjs';

const DAG = 86_400_000;
export const ORDERFONSTER_DAGAR = 120;

/**
 * Spårningssidans länk med bävernumret — kunden slipper skriva.
 * `svar.sparningssidor` ({ nb: …, en: … }) ger sidan på kundens språk —
 * samma adresser som fraktmejlen (sparning/butiker.json mejl_marknader).
 * CaraShell 2026-09-23: en norsk eller amerikansk kund fick annars den
 * svenska sidan. Saknas språket gäller `sparningssida`.
 */
export function sparningslank(svar, nummer, sprak = null) {
  const perSprak = sprak && svar?.sparningssidor && typeof svar.sparningssidor === 'object' ? svar.sparningssidor[sprak] : null;
  const sida = String(perSprak || svar?.sparningssida || '').trim().replace(/\/+$/, '');
  if (!sida || !nummer) return null;
  const bn = bavernummer(nummer, svar?.sparning_prefix || 'BB-');
  return `${sida}?nummer=${encodeURIComponent(bn)}`;
}

/** Leveransfönstret ur skickdagen + butikens löfte. Ren. */
export function leveransfonster(skickad, leveransDagar = [7, 14]) {
  if (!skickad) return null;
  const d = skickad instanceof Date ? skickad : new Date(skickad);
  if (Number.isNaN(d.getTime())) return null;
  const [a, b] = Array.isArray(leveransDagar) && leveransDagar.length === 2 ? leveransDagar : [7, 14];
  return { fran: new Date(d.getTime() + a * DAG), till: new Date(d.getTime() + b * DAG) };
}

/**
 * Den senaste skanningen på kundens språk. Svenska ur ordboken; nb/da/fi
 * via sparning/oversatt.mjs när meningen finns i tabellen, annars
 * fraktbolagets egen (engelska) text — hellre engelska än svenska till en
 * dansk. Engelska kunder får alltid fraktbolagets text.
 */
export function senasteSkanning(post, sprak = 'sv', { nu = Date.now() } = {}) {
  const h = handelserUr(post, { oversattFras, stadaPlats, landFor, nu })[0];
  if (!h) return null;
  let text = h.text;
  if (sprak === 'en') text = h.ra ?? h.text;
  else if (sprak !== 'sv') {
    const ov = skapaOversattare(sprak);
    const t = ov.T(h.text);
    text = ov.okanda().length ? (h.ra ?? h.text) : t;
  }
  return { tid: h.tid, text, plats: h.plats ?? null, ra: h.ra ?? null };
}

/**
 * Väljer ordern ur kundens ordrar när inget ordernummer gavs. Ren.
 * En order ⇒ den. Flera ⇒ den enda som inte är levererad. Annars null + skäl.
 */
export function valjOrder(ordrar = []) {
  const aktiva = ordrar.filter((o) => !o.avbruten);
  if (aktiva.length === 1) return { order: aktiva[0], skal: null };
  if (!aktiva.length) return { order: null, skal: 'inga ordrar på kundens e-post' };
  const ejLevererade = aktiva.filter((o) => !(o.leveransstatus === 'delivered' || o.sandningar?.some((s) => s.leveransstatus === 'delivered')));
  if (ejLevererade.length === 1) return { order: ejLevererade[0], skal: null };
  return { order: null, skal: `${aktiva.length} ordrar på kundens e-post och inget ordernummer i mejlet — VA:n avgör vilken` };
}

/**
 * Hämtar faktan för ett mejl. `shopify` är en ShopifyLasare (eller null),
 * `hamta17` 17TRACK-läsaren (injiceras i tester), `konfig` körkonfigen
 * (svar.*), `sprak` kundens språk.
 *
 * Returnerar { order, sandning, sparning, lank, fonster, sparr, kalla[] }.
 */
export async function hamtaFakta({ mejl, klass, konfig, shopify = null, hamta17 = null, sprak = 'sv', nu = new Date(), logg = () => {}, tvister = [] } = {}) {
  const ut = { order: null, sandning: null, sparning: null, lank: null, bavernummer: null, fonster: null, sparr: null, kalla: [] };
  if (!shopify) { ut.kalla.push('Shopify inte kopplat'); return ut; }
  const avsandare = String(mejl?.fran?.adress ?? '').toLowerCase();
  const nummer = klass?.ordernummer ?? [];

  // 1. Ordern
  try {
    for (const n of nummer) {
      const o = await shopify.hamtaOrderPaNamn(n);
      if (!o) continue;
      // Orderns e-post MÅSTE vara avsändarens. Saknar ordern e-post går det
      // inte att veta — och då är svaret nej, inte "förmodligen".
      if (!o.email || o.email !== avsandare) {
        ut.sparr = o.email
          ? `ordernumret #${n} i mejlet tillhör en annan e-postadress än avsändarens — inget svar, VA:n kollar`
          : `ordern #${n} saknar e-postadress i Shopify — går inte att knyta till avsändaren, VA:n kollar`;
        ut.kalla.push(`#${n}: ${o.email ? 'annan kund' : 'utan e-post'}`);
        return ut;
      }
      ut.order = o;
      ut.kalla.push(`Shopify #${n} på ordernummer`);
      break;
    }
    if (!ut.order) {
      const ordrar = await shopify.hamtaOrdrarForEmail(avsandare, new Date(nu.getTime() - ORDERFONSTER_DAGAR * DAG));
      const v = valjOrder(ordrar);
      if (v.order) { ut.order = v.order; ut.kalla.push(`Shopify ${v.order.namn} på e-post`); }
      else if (v.skal && ordrar.length) { ut.sparr = v.skal; ut.kalla.push(v.skal); return ut; }
      else ut.kalla.push('ingen order på e-post');
    }
  } catch (e) {
    ut.kalla.push(`Shopify-fel: ${e.message.slice(0, 120)}`);
    logg(`Shopify: ${e.message}`);
    return ut;
  }
  if (!ut.order) return ut;

  // 1b. En order med en tvist (öppen eller avgjord) får aldrig ett automatiskt svar.
  const tvist = (tvister ?? []).find((t) => String(t.orderId) === String(ut.order.id));
  if (tvist) {
    ut.sparr = `ordern ${ut.order.namn} har en tvist hos Shopify (${tvist.typ ?? 'tvist'}, ${tvist.status || 'status okänd'}) — inget automatiskt svar, VA:n`;
    ut.kalla.push(`tvist ${tvist.typ ?? ''} ${tvist.status ?? ''}`.trim());
    return ut;
  }

  // 2. Sändningen (senaste med spårningsnummer, annars senaste)
  const s = [...(ut.order.sandningar ?? [])].sort((a, b) => (b.skickad?.getTime() ?? 0) - (a.skickad?.getTime() ?? 0));
  ut.sandning = s.find((x) => x.nummer) ?? s[0] ?? null;
  if (ut.sandning?.skickad) ut.fonster = leveransfonster(ut.sandning.skickad, konfig?.svar?.leverans_dagar);
  if (ut.sandning?.nummer) {
    ut.lank = sparningslank(konfig?.svar, ut.sandning.nummer, sprak) ?? ut.sandning.lank ?? null;
    // Bävernumret i klartext bredvid länken (Axels feedback 2026-09-22) — bara när butiken har en spårningssida som förstår det.
    if (String(konfig?.svar?.sparningssida ?? '').trim()) ut.bavernummer = bavernummer(ut.sandning.nummer, konfig?.svar?.sparning_prefix || 'BB-');
  }

  // 3. Skanningarna (gratis läsning, aldrig registrering)
  if (ut.sandning?.nummer) {
    const las = hamta17 ?? (nyckel17() ? hamta17Standard : null);
    if (!las) ut.kalla.push('17TRACK: ingen nyckel — svaret bär bara skickdatum och länk');
    else {
      try {
        const kod = bolagskod(ut.sandning.bolag);
        const r = await las([kod ? { number: ut.sandning.nummer, carrier: kod } : { number: ut.sandning.nummer }]);
        const post = r.accepterade?.[0];
        if (post) {
          const t = tolka(post);
          // Sista biten (SOP 36/37): finns ett inhemskt bolag i misc_info är paketet i mottagarlandet.
          const sb = sistaBiten(post.track_info?.misc_info, ut.sandning.nummer);
          const sista = sb ? { namn: sb.namn, nummer: sb.nummer, lank: sb.mall ? (sb.mall.includes('{nr}') ? (sb.nummer ? sb.mall.replace('{nr}', sb.nummer) : null) : sb.mall) : null } : null;
          ut.sparning = { status17: t.status17, status: t.status, levererad: t.status17 === 'Delivered' || t.status === 'DELIVERED', senaste: senasteSkanning(post, sprak, { nu: nu.getTime() }), sista };
          ut.kalla.push(`17TRACK ${t.status17 ?? 'okänd status'}${sista ? ` · sista biten ${sista.namn}` : ''}`);
        } else {
          ut.kalla.push(`17TRACK: ${r.avvisade?.[0]?.fel ?? 'inga skanningar'}`);
        }
      } catch (e) {
        ut.kalla.push(`17TRACK-fel: ${e.message.slice(0, 100)}`);
      }
    }
  }
  // Shopifys egen leveransstatus (spårningsrutinen skriver in DELIVERED-event)
  // räcker för att veta att paketet är framme — även utan 17TRACK här.
  if (!ut.sparning && (ut.sandning?.leveransstatus === 'delivered' || ut.order.leveransstatus === 'delivered')) {
    ut.sparning = { status17: null, status: 'DELIVERED', levererad: true, senaste: null, sista: null };
    ut.kalla.push('Shopify: levererad');
  }
  ut.sparr = ut.sparr ?? staltFakta(ut, { nu, packasDagar: konfig?.svar?.packas_dagar });
  if (ut.sparr) ut.kalla.push(ut.sparr);
  return ut;
}

/**
 * Är faktan för gammal för att ett mallsvar ska vara sant? Ren. Returnerar
 * spärrtexten eller null. Första torrkörningen 2026-09-21 skrev "Beräknad
 * leverans: 2 sep–9 sep" den 21 september och "fraktbolaget visar den
 * första skanningen 2–4 dagar efter" om ett paket skickat 26 dagar tidigare.
 *   • Leveransfönstret har passerat och paketet är inte levererat ⇒ försenat — VA:n.
 *   • Skickat för mer än 5 dagar sedan utan en enda skanning ⇒ VA:n.
 *   • Inte skickad fast ordern är äldre än packtiden + 3 dagar ⇒ VA:n.
 */
export function staltFakta(fakta, { nu = new Date(), packasDagar = 2 } = {}) {
  const t = nu instanceof Date ? nu.getTime() : Number(nu);
  const dagar = (d) => Math.floor((t - d.getTime()) / DAG);
  if (fakta?.sparning?.levererad) return null;
  const s = fakta?.sandning;
  if (s?.skickad) {
    if (fakta.fonster?.till && t > fakta.fonster.till.getTime()) return `paketet är försenat — skickat för ${dagar(s.skickad)} dagar sedan och leveransfönstret har passerat — VA:n`;
    if (!fakta.sparning?.senaste && dagar(s.skickad) > 5) return `inga skanningar ${dagar(s.skickad)} dagar efter att paketet skickades — VA:n`;
    return null;
  }
  if (fakta?.order?.skapad && dagar(fakta.order.skapad) > (Number(packasDagar) || 2) + 3) return `ordern är inte skickad efter ${dagar(fakta.order.skapad)} dagar — VA:n`;
  return null;
}
