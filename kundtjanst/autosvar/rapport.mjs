// rapport.mjs — vad en körning säger efteråt: svenskt till terminalen och
// Axel, engelskt till Discord (#customer-service i butikens server — VA:n
// läser det). Rena funktioner över körningens resultat.
//
// Discord-rapporten (Axels spec 2026-09-21): hur många ENKLA som svarades,
// vilka ARGA som fick lugnande svar (ordernummer + en rad), och VA:ns
// prioriterade lista. Tyst när inget hände — en rapport per timme som säger
// "0" är brus, inte information.

import { maskeraAdress } from '../maskera.mjs';

const HINKORD_EN = { ENKEL: 'simple', ARG: 'upset', 'SVÅR': 'for the VA', SKIP: 'skipped' };

function kort(s, n = 70) {
  const t = String(s ?? '').replace(/\s+/g, ' ').trim();
  return t.length > n ? `${t.slice(0, n - 1)}…` : t;
}

/** En rad per mejl i VA:ns lista: order, kund (maskerad), ämne, varför. */
function vaRad(r) {
  const order = r.ordernummer?.length ? `#${r.ordernummer[0]}` : 'no order no.';
  return `${order} · ${maskeraAdress(r.kund)} · "${kort(r.amne, 50)}" — ${kort(r.orsakEn ?? r.orsak, 80)}`;
}

/** Discord-texten (engelska). null när inget hände. */
export function renderaDiscord(res) {
  const rader = res.rader ?? [];
  const handlade = rader.filter((r) => r.hink !== 'SKIP');
  if (!handlade.length) return null;
  const enkla = rader.filter((r) => r.hink === 'ENKEL' && ['svar', 'utkast'].includes(r.atgard));
  const arga = rader.filter((r) => r.hink === 'ARG');
  const svara = rader.filter((r) => r.hink === 'SVÅR');
  const lage = res.torr ? 'DRY RUN — replies saved as drafts in Drafts, nothing sent' : 'live';
  const ut = [`**Auto-reply run — ${res.brand.brand}** (${res.kord.slice(0, 16).replace('T', ' ')} UTC, ${lage})`];
  ut.push(`Simple questions answered: **${enkla.length}** · Upset customers calmed: **${arga.length}** · Flagged for the VA: **${svara.length + arga.length}**`);
  if (enkla.length) {
    ut.push('', '**Answered automatically** (facts from Shopify/17TRACK):');
    for (const r of enkla) ut.push(`• ${r.ordernummer?.length ? `#${r.ordernummer[0]}` : 'no order'} · ${maskeraAdress(r.kund)} · ${r.typ} · ${r.sprak}${r.atgard === 'utkast' ? ' · draft' : ''}`);
  }
  if (arga.length) {
    ut.push('', `**Upset — calming reply sent, now in ${res.brand.svar?.va_mapp ?? 'VA-PRIO'}** (answer these within 24–72 h):`);
    for (const r of arga) ut.push(`• ${vaRad(r)}`);
  }
  if (svara.length) {
    ut.push('', '**Flagged for the VA (no auto-reply):**');
    for (const r of svara.slice(0, 15)) ut.push(`• ${vaRad(r)}`);
    if (svara.length > 15) ut.push(`• … and ${svara.length - 15} more (see the flagged messages in the inbox)`);
  }
  if (res.varningar?.length) {
    ut.push('', '**Warnings:**');
    for (const v of res.varningar.slice(0, 5)) ut.push(`• ${kort(v, 160)}`);
  }
  return ut.join('\n');
}

/** Terminalen, svenska, kort. */
export function renderaSvensk(res) {
  const rader = res.rader ?? [];
  const n = (h) => rader.filter((r) => r.hink === h).length;
  const ut = [`${res.brand.brand}: ${rader.length} mejl lästa — ENKEL ${n('ENKEL')} · ARG ${n('ARG')} · SVÅR ${n('SVÅR')} · hoppade ${n('SKIP')}${res.torr ? ' · TORR (utkast)' : ''}`];
  for (const r of rader.filter((x) => x.hink !== 'SKIP')) {
    ut.push(`  ${r.hink.padEnd(5)} ${r.atgard.padEnd(8)} ${(r.ordernummer?.[0] ? `#${r.ordernummer[0]}` : '—').padEnd(7)} ${maskeraAdress(r.kund).padEnd(24)} ${kort(r.amne, 40).padEnd(40)} ${kort(r.orsak, 60)}`);
  }
  for (const v of res.varningar ?? []) ut.push(`  ⚠️ ${v}`);
  return ut.join('\n');
}

/** Engelsk orsak för Discord — orsakerna skrivs på svenska i koden. Ren, konservativ. */
export function orsakEn(r) {
  const o = String(r.orsak ?? '');
  const tab = [
    [/tvistord/i, 'dispute/chargeback wording — VA only'],
    [/bilaga/i, 'has an attachment the bot did not read'],
    [/redan fått ett automatiskt svar/i, 'thread or customer already got one auto-reply — second email goes to the VA'],
    [/redan ett svar från oss/i, 'thread already answered by us — VA continues'],
    [/annan e-postadress/i, 'order number belongs to another email address'],
    [/ingen order hittad/i, 'no order found on order number or email'],
    [/adressbyte på en redan skickad/i, 'address change on an already shipped order'],
    [/markerat levererat|skannat det som levererat/i, 'parcel scanned as delivered but customer has not received it'],
    [/hot om bank/i, 'threatens bank/complaint/review'],
    [/aldrig ha fått/i, 'says the parcel never arrived'],
    [/trasig eller defekt/i, 'broken or defective item'],
    [/tredje mejlet/i, 'third email without a reply'],
    [/eskaleringsord/i, 'escalation wording'],
    [/argt ordval/i, 'angry wording'],
    [/versaler/i, 'writing in capitals'],
    [/utropstecken/i, 'many exclamation marks'],
    [/nästan ingen text/i, 'almost no text'],
    [/kategori (\w+)/i, (m) => `category ${m[1]} — VA`],
    [/ordrar på kundens e-post/i, 'several orders on this email and no order number'],
  ];
  const delar = o.split(/,\s*/).map((d) => {
    for (const [re, en] of tab) { const m = d.match(re); if (m) return typeof en === 'function' ? en(m) : en; }
    return null;
  }).filter(Boolean);
  return delar.length ? [...new Set(delar)].join(', ') : `${HINKORD_EN[r.hink] ?? r.hink}`;
}
