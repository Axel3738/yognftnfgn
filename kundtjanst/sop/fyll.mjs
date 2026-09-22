// fyll.mjs — fyller tvist-SOP:ernas {{PLATSHÅLLARE}} med EN butiks värden.
//
// Varför filen finns: SOP:erna i kundtjanst/sop/ är samma text på alla butiker,
// och allt butiksspecifikt står som {{PLATSHÅLLARE}}. Det gör dem portabla —
// men också oläsliga för VA:n, som ska kunna slå upp "vilken returadress?" mitt
// i ett kundmejl. Den här filen är bryggan: den fyller BUTIK-platshållarna ur
// brandfilen och gör ÄRENDE-platshållarna till synliga tomrum ([ORDER NUMBER]),
// så texten kan publiceras i Notion utan att sluta vara portabel i repot.
//
// Ren funktion, inget nät, ingen fil skrivs. `--brand <id>` bara för handkörning:
//   node kundtjanst/sop/fyll.mjs --brand baverbutiken --fil 10-NOT-RECEIVED.md
//
// ⚠️ Ett värde som saknas i brandfilen fylls ALDRIG med en gissning. Det blir en
// synlig ⚠️ OWNER-rad med var värdet ska hämtas — samma regel som Store facts.

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { upptackBrands } from '../brands.mjs';
import { BUTIK, ARENDE, META } from '../sop-koll.mjs';
import { LOOPIA_WEBMAIL } from '../webmail.mjs';

export const HÄR = dirname(fileURLToPath(import.meta.url));

/** Domänen är inte ett eget fält i brandfilen — den läses ur något vi redan har. */
export function domanFor(b) {
  const sida = String(b?.tvister?.sparningssida ?? '').trim();
  if (sida) { try { return new URL(sida).host.replace(/^www\./, ''); } catch { /* vidare */ } }
  const policy = String(b?.tvister?.policy_url ?? '').trim();
  if (policy) { try { return new URL(policy).host.replace(/^www\./, ''); } catch { /* vidare */ } }
  const mejl = String(b?.supportmail ?? '');
  if (mejl.includes('@')) return mejl.split('@')[1];
  return '';
}

/** Ett belopp där 0 betyder "ingen gräns" — skriv ut vad det betyder, inte "0". */
function grans(varde, nollText, valuta) {
  const n = Number(varde);
  if (!Number.isFinite(n)) return null;
  if (n === 0) return nollText;
  return `${n} ${valuta}`;
}

/**
 * Butikens värden, platshållare → text. `null` betyder "saknas i brandfilen"
 * och blir en ⚠️ OWNER-markering i stället för tomrum.
 */
export function butiksvarden(b) {
  const t = b?.tvister ?? {};
  const tr = b?.trosklar ?? {};
  const valuta = b?.valuta || 'SEK';
  const txt = (v) => { const s = String(v ?? '').trim(); return s || null; };
  const tal = (v) => (Number.isFinite(Number(v)) && String(v ?? '').trim() !== '' ? String(Number(v)) : null);
  return {
    STORE_ID: b?.id ?? null,
    STORE_NAME: txt(b?.brand),
    STORE_DOMAIN: txt(domanFor(b)),
    STORE_COUNTRY: txt(b?.land),
    CURRENCY: valuta,
    SUPPORT_EMAIL: txt(b?.supportmail),
    WEBMAIL_URL: txt(b?.mail?.webmail) ?? LOOPIA_WEBMAIL,
    RETURN_ADDRESS: txt(t.returadress),
    RETURN_WINDOW_DAYS: tal(t.returfonster_dagar),
    RETURN_POSTAGE_PAID_BY: t.returfrakt_betalas_av === 'kund'
      ? 'the customer pays and arranges the return shipping — we send no return label'
      : (t.returfrakt_betalas_av === 'butik' ? 'we pay the return shipping' : null),
    POLICY_URL: txt(t.policy_url),
    BILLING_DESCRIPTOR: txt(t.billing_descriptor),
    FIGHT_THRESHOLD: grans(t.strid_lonar_sig_over, 'no threshold — we fight every dispute', valuta),
    REFUND_APPROVAL_LIMIT: grans(t.godkannande_over, 'no limit — you decide refunds yourself', valuta),
    REPLACEMENT_LIMIT: grans(t.ersattning_over, 'no limit — you decide replacements yourself', valuta),
    ESCALATION_CHANNEL: b?.discord?.kanal ? `Discord #${b.discord.kanal}` : null,
    OWNER_CONTACT: txt(t.agare_kontakt),
    UNANSWERED_HOURS: tal(tr.obesvarad_timmar ?? 48),
    UNFULFILLED_DAYS: tal(tr.ofullbordad_dagar ?? 5),
    DISPUTE_RATE_YELLOW: tal(tr.tvistgrans_gul_procent ?? 0.5),
    DISPUTE_RATE_RED: tal(tr.tvistgrans_rod_procent ?? 0.9),
    FIRST_REPLY_TARGET_HOURS: tal(t.forsta_svar_timmar ?? 24),
    // Leveranslöftet skrivs i ARBETSDAGAR (Axels order 2026-09-21). Samma
    // fönster i kalenderdagar är 7–14 och styr datumen i mejlen — men en
    // kund får aldrig kalenderformen.
    DELIVERY_PROMISE_DAYS: txt(t.leveranslofte_dagar) ?? '5–10 business',
    TRACKING_PAGE: txt(t.sparningssida),
    PARCEL_PREFIX: txt(t.paketprefix),
    STALL_ALERT_DAYS: tal(t.stillastaende_dagar ?? 10),
    LATE_ALERT_DAYS: tal(t.forsenad_dagar ?? 15),
    REFUND_DEADLINE_DAYS: tal(t.aterbetalning_dagar ?? 14),
  };
}

/** ⚠️-raden ett saknat värde blir. Texten säger var värdet hämtas. */
function saknas(namn) {
  const var_ = BUTIK[namn] ?? 'brandfilen';
  return `⚠️ OWNER: ${namn} is not set for this store (${var_}) — ask the owner, never guess it in a customer email`;
}

/** Ett ärendefält blir ett synligt tomrum VA:n fyller i. */
function tomrum(namn) {
  return `[${namn.replace(/_/g, ' ')}]`;
}

/**
 * Fyller en SOP-text för en butik.
 * @returns {{text: string, saknade: string[], okanda: string[]}}
 */
export function fyll(md, brand) {
  const v = butiksvarden(brand);
  const saknade = new Set();
  const okanda = new Set();
  const text = md.replace(/\{\{([A-Z_0-9]+)\}\}/g, (hel, namn) => {
    if (META.includes(namn)) return hel;                 // texten pratar OM platshållare
    if (namn in v) {
      if (v[namn] === null) { saknade.add(namn); return saknas(namn); }
      return v[namn];
    }
    if (namn in ARENDE) return tomrum(namn);
    // DATE_PLUS_3 / _5 / _10 — samma tomrum som {{DATE_PLUS_N}}, med talet kvar.
    const plus = namn.match(/^DATE_PLUS_(\d+)$/);
    if (plus) return `[today + ${plus[1]} days]`;
    okanda.add(namn);
    return hel;
  });
  return { text, saknade: [...saknade].sort(), okanda: [...okanda].sort() };
}

/** Brandobjektet för ett id, ur brandfilerna. */
export function brandFor(id) {
  const b = upptackBrands().find((x) => x.id === id);
  if (!b) throw new Error(`okänt brand: ${id}`);
  return b;
}

if (process.argv[1] && process.argv[1].endsWith('fyll.mjs')) {
  const arg = (f, d) => (process.argv.includes(f) ? process.argv[process.argv.indexOf(f) + 1] : d);
  const b = brandFor(arg('--brand', 'baverbutiken'));
  const fil = arg('--fil', 'START-HERE.md');
  const r = fyll(readFileSync(join(HÄR, fil), 'utf8'), b);
  process.stdout.write(r.text);
  if (r.saknade.length) console.error(`\n⚠️ saknade butiksvärden: ${r.saknade.join(', ')}`);
  if (r.okanda.length) console.error(`⚠️ okända platshållare: ${r.okanda.join(', ')}`);
}
