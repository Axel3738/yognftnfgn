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

const DAG = 86_400_000;
export const ORDERFONSTER_DAGAR = 120;

/** Spårningssidans länk med bävernumret — kunden slipper skriva. */
export function sparningslank(svar, nummer) {
  const sida = String(svar?.sparningssida ?? '').trim().replace(/\/+$/, '');
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
export async function hamtaFakta({ mejl, klass, konfig, shopify = null, hamta17 = null, sprak = 'sv', nu = new Date(), logg = () => {} } = {}) {
  const ut = { order: null, sandning: null, sparning: null, lank: null, fonster: null, sparr: null, kalla: [] };
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

  // 2. Sändningen (senaste med spårningsnummer, annars senaste)
  const s = [...(ut.order.sandningar ?? [])].sort((a, b) => (b.skickad?.getTime() ?? 0) - (a.skickad?.getTime() ?? 0));
  ut.sandning = s.find((x) => x.nummer) ?? s[0] ?? null;
  if (ut.sandning?.skickad) ut.fonster = leveransfonster(ut.sandning.skickad, konfig?.svar?.leverans_dagar);
  if (ut.sandning?.nummer) ut.lank = sparningslank(konfig?.svar, ut.sandning.nummer) ?? ut.sandning.lank ?? null;

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
          ut.sparning = { status17: t.status17, levererad: t.status17 === 'Delivered' || t.status === 'DELIVERED', senaste: senasteSkanning(post, sprak, { nu: nu.getTime() }) };
          ut.kalla.push(`17TRACK ${t.status17 ?? 'okänd status'}`);
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
    ut.sparning = { status17: null, levererad: true, senaste: null };
    ut.kalla.push('Shopify: levererad');
  }
  return ut;
}
