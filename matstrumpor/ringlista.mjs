#!/usr/bin/env node
// ringlista.mjs — Matstrumpors ringlista. Två grupper Axel ringer själv:
//
//   1. ÅTERKÖPARE: kunder med 2+ ordrar på SEPARATA DATUM (Axels ändring
//      2026-10-01 — tacksidans donut-tillägg minuter efter köpet och två ordrar
//      i samma besök är impuls, inte återköp, och räknas bort).
//   2. NYA KUNDER: ett slumpat urval av förstagångsköpare från de senaste sju
//      dagarna, med annonsen de kom från (UTM i Shopifys customerJourney).
//
// Plus en ren fil med återköparnas e-postadresser, så att de kan exkluderas
// från en annan kundundersökning som går ut per mejl.
//
//   node matstrumpor/ringlista.mjs                  Shopify → output/ringlista/ (json, md, html, epost.txt)
//   node matstrumpor/ringlista.mjs --urval 15       hur många nya kunder som lottas (standard 15)
//   node matstrumpor/ringlista.mjs --fran <fil>     ur en sparad orderfil, utan nät
//   node matstrumpor/ringlista.mjs --spara-ordrar   spara råordrarna bredvid (för --fran)
//
// Läs-bart: bara orders-frågor mot Shopify (sparning/butik.mjs, appen "Fabriken")
// och GET <annons-id>?fields=name mot Meta när META_ACCESS_TOKEN finns.
// Presentkorten efter samtalen skapas av matstrumpor/presentkort.mjs, aldrig här.
//
// ⚠️ Utdatan bär kundernas namn, telefonnummer och e-post. Den skrivs BARA i
// matstrumpor/output/ (gitignorerad) och får aldrig committas, postas i Discord
// eller läggas i Notion. Kundtjänstens regel gäller: personuppgifter maskeras
// i allt som lämnar Axels egen skärm.
//
// Det datan visade när listan byggdes (2026-09-27, 4 011 ordrar):
//   • 70 av 71 "shopify_draft_order" är Donut-strumpor 299 kr, skapade 1–5 min
//     efter en webborder (dec 2025–mars 2026) — tacksidans tillägg.
//   • Butiken sålde Fixkliniken-produkter (Skrubbmattan, FixToes …) innan
//     strumporna. En order utan strumpor/ätpinnar/presentkort räknas inte.
//   • Kassan kräver inte telefon: 800 av 4 006 ordrar bär ett nummer.
//   • UTM:erna i ordrarna bär annons-id i utm_content (mätt 2026-10-01 på 36 av
//     46 ordrar med besöksdata) — namnet slås upp i Meta.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';

const ROT = dirname(fileURLToPath(import.meta.url));
export const UTMAPP = join(ROT, 'output', 'ringlista');

/** En order hör till Matstrumpor om någon rad är strumpor, ätpinnar eller presentkort. */
export const MATSTRUMPOR_RAD = /strump|ätpinnar|presentkort/i;

/** Nya kunder lottas ur de senaste så här många dagarna. */
export const NYA_DAGAR = 7;
export const URVAL_STANDARD = 15;

export const GRUPP = {
  aterkop: { nyckel: 'aterkop', rubrik: 'Återköpare — köpt på två eller fler datum', kort: 'ÅTERKÖP' },
  ny: { nyckel: 'ny', rubrik: `Nya kunder — förstagångsköpare senaste ${NYA_DAGAR} dagarna, slumpat urval`, kort: 'NY KUND' },
};

const MANADER = ['jan', 'feb', 'mars', 'april', 'maj', 'juni', 'juli', 'aug', 'sep', 'okt', 'nov', 'dec'];

// ---------- rena funktioner ----------

/** Kalenderdatum i svensk tid, "YYYY-MM-DD". Det är DATUMET som skiljer två köptillfällen åt. */
export function dagSE(iso) {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Stockholm', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(iso));
}

/** Svenskt datum "2 dec 2025" ur en ISO-tidsstämpel, i svensk tid. */
export function svDatum(iso) {
  const [y, m, d] = dagSE(iso).split('-').map(Number);
  return `${d} ${MANADER[m - 1]} ${y}`;
}

/** Tid mellan två tidsstämplar i ord: "40 minuter", "3 dagar", "2 veckor", "3 månader". */
export function tidMellan(isoA, isoB) {
  const ord = (n, ett, flera) => `${n} ${n === 1 ? ett : flera}`;
  const min = Math.round(Math.abs(Date.parse(isoB) - Date.parse(isoA)) / 60000);
  if (min < 60) return ord(min, 'minut', 'minuter');
  const tim = Math.round(min / 60);
  if (tim < 36) return ord(tim, 'timme', 'timmar');
  const dagar = Math.round(tim / 24);
  if (dagar < 14) return ord(dagar, 'dag', 'dagar');
  if (dagar < 60) return ord(Math.round(dagar / 7), 'vecka', 'veckor');
  return ord(Math.round(dagar / 30.4), 'månad', 'månader');
}

/**
 * Telefonnummer till E.164 (+46…). Tar "070-123 45 67", "0046…", "+46…", "46…".
 * Okänt format ⇒ null (hellre tomt än ett nummer som inte går att ringa).
 */
export function normaliseraTelefon(s) {
  if (!s) return null;
  let d = String(s).replace(/[^\d+]/g, '');
  if (d.startsWith('00')) d = `+${d.slice(2)}`;
  if (/^\+\d{8,15}$/.test(d)) return d;
  if (/^0\d{6,12}$/.test(d)) return `+46${d.slice(1)}`;
  if (/^46\d{7,12}$/.test(d)) return `+${d}`;
  return null;
}

/** Visningsform: +46701234567 → "070-123 45 67"; utländska nummer visas som de är. */
export function visaTelefon(e164) {
  if (!e164) return null;
  const m = /^\+46(\d+)$/.exec(e164);
  if (!m) return e164;
  const n = `0${m[1]}`;
  if (n.length === 10) return `${n.slice(0, 3)}-${n.slice(3, 6)} ${n.slice(6, 8)} ${n.slice(8)}`;
  return n;
}

/** Första telefonnumret på kunden eller någon av ordrarna. */
export function telefonFor(ordrar) {
  for (const o of ordrar) {
    for (const rå of [o.customer?.phone, o.customer?.defaultPhoneNumber?.phoneNumber, o.customer?.defaultAddress?.phone, o.shippingAddress?.phone, o.billingAddress?.phone]) {
      const t = normaliseraTelefon(rå);
      if (t) return t;
    }
  }
  return null;
}

export const arMatstrumporOrder = (o) => (o.lineItems?.nodes ?? []).some((l) => MATSTRUMPOR_RAD.test(l.title ?? ''));
export const arTillagg = (o) => o.sourceName === 'shopify_draft_order';

/** Ordrar (sorterade) → köptillfällen: ordrar på samma kalenderdatum (svensk tid) är ett tillfälle. */
export function koptillfallen(ordrar) {
  const t = [];
  for (const o of ordrar) {
    const senaste = t.at(-1);
    if (senaste && dagSE(senaste[0].createdAt) === dagSE(o.createdAt)) senaste.push(o);
    else t.push([o]);
  }
  return t;
}

/** Strumpsorterna i en order: ["Sushi", "Donut"]. Ätpinnar och presentkortet
 *  (som följer med "Köp 2 – få 2"-paketet) är inte sorter kunden valt. */
export function sorter(o) {
  const ut = new Set();
  for (const l of o.lineItems?.nodes ?? []) {
    const m = /^(Sushi|Donut|Pizza|Hamburgare)/i.exec(String(l.title ?? '').replace(/strumpor/i, ''));
    if (m) ut.add(m[1][0].toUpperCase() + m[1].slice(1).toLowerCase());
  }
  return [...ut];
}

/** Raderna i klartext: "2× Sushi-Strumpor (5 par) + ätpinnar". */
export function produktText(o) {
  const rader = (o.lineItems?.nodes ?? []).filter((l) => !/ätpinnar/i.test(l.title ?? ''));
  const atpinnar = (o.lineItems?.nodes ?? []).some((l) => /ätpinnar/i.test(l.title ?? ''));
  const text = rader.map((l) => {
    const v = /^(\d+)\s*-\s*Par/i.exec(l.variant?.title ?? '');
    return `${l.quantity}× ${l.title}${v ? ` (${v[1]} par)` : ''}`;
  }).join(', ');
  return text + (atpinnar ? ' + ätpinnar' : '');
}

const kr = (n) => `${Math.round(Number(n)).toLocaleString('sv-SE')} kr`;
const num = (gid) => String(gid ?? '').split('/').pop();

/** Deterministisk slump: samma frö ⇒ samma urval (fröet är dagens datum). */
export function slumpa(lista, fro) {
  let h = 2166136261;
  for (const c of String(fro)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; }
  const rnd = () => { h = (h + 0x6D2B79F5) >>> 0; let t = h; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const a = [...lista];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

/** Var kunden kom ifrån, i ord, ur Shopifys customerJourneySummary + annonsnamnen ur Meta. */
export function komVia(resa, annonsnamn = new Map()) {
  const v = resa?.lastVisit ?? resa?.firstVisit;
  if (!v) return 'okänt (ingen besöksdata)';
  const utm = v.utmParameters ?? {};
  const id = /^\d{10,}$/.test(utm.content ?? '') ? utm.content : null;
  if (id) return `Facebook-annons: ${annonsnamn.get(id) ?? `annons ${id} (namnet gick inte att läsa)`}`;
  if (/facebook|instagram|^fb$|^ig$/i.test(utm.source ?? '') || /facebook|instagram/i.test(`${v.source ?? ''} ${v.referrerUrl ?? ''}`)) return `Facebook/Instagram (${utm.content || 'annons utan id'})`;
  const sida = (() => { try { return new URL(v.landingPage).pathname; } catch { return v.landingPage; } })();
  return `${v.source && v.source !== 'an unknown source' ? v.source : 'okänd källa'}${sida ? `, landade på ${sida}` : ''}`;
}

/** Frågorna. Alltid högst tre, den mest specifika först. Skrivna för att läsas högt. */
export const FRAGA = {
  vemFick: 'Vem fick strumporna, och hur reagerade den som fick dem?',
  nastanInte: 'Var det något som nästan fick dig att inte köpa?',
  beskriv: 'Om du skulle beskriva dem för en kompis, hur skulle du säga då?',
  // nya kunder — paketet har oftast inte kommit än (leverans median 11 dagar), så frågorna gäller köpet, inte produkten
  annonsen: 'Minns du vad du såg i annonsen? Vad var det som fick dig att klicka?',
  vemTill: 'Vem är strumporna till, och vad är det för tillfälle?',
  tvekade: 'Tvekade du på något innan du köpte? Vad var det i så fall?',
  settForut: 'Hade du sett oss förut, eller köpte du direkt första gången du såg annonsen?',
};

export function fragorFor(k) {
  if (k.grupp === 'ny') return [FRAGA.annonsen, FRAGA.vemTill, FRAGA.tvekade];
  const ut = [];
  const s1 = k.tillfallen[0]?.sorter ?? [];
  const s2 = k.tillfallen[1]?.sorter ?? [];
  const namnge = (arr) => (arr.length ? arr.map((s) => `${s.toLowerCase()}strumporna`).join(' och ') : 'strumporna');
  if (k.antalTillfallen >= 3) ut.push(`Du har beställt ${k.antalTillfallen} gånger hos oss. Vad är det som gör att du kommer tillbaka?`);
  else if (k.bytteProdukt) ut.push(`Första gången tog du ${namnge(s1)}, andra gången ${namnge(s2.filter((s) => !s1.includes(s)))}. Vad fick dig att byta?`);
  else ut.push(`Du beställde ${namnge(s1)} i ${k.tillfallen[0].datum.split(' ').slice(1).join(' ')} och igen ${k.mellanrum[0]} senare. Vad fick dig att beställa en gång till?`);
  ut.push(FRAGA.vemFick, FRAGA.nastanInte);
  return ut.slice(0, 3);
}

/** Manuset runt frågorna. */
export const MANUS = {
  oppning: {
    aterkop: 'Hej, det är Axel, jag driver Matstrumpor.se. Du har beställt hos oss ett par gånger och jag ringer bara för att fråga två, tre snabba saker. Har du en minut?',
    ny: 'Hej, det är Axel, jag driver Matstrumpor.se. Du beställde sushistrumpor hos oss härom dagen, och jag ringer bara för att fråga två, tre snabba saker om varför. Har du en minut?',
  },
  omNej: 'Absolut, tack ändå. Ha en fin dag!',
  omTidFinns: { aterkop: FRAGA.beskriv, ny: FRAGA.settForut },
  avslut: 'Tack, det hjälper oss jättemycket. Ha det fint!',
  regler: [
    'Inga erbjudanden och inga löften i samtalet. Presentkortet till återköparna nämns inte — det skickas efteråt, skriftligt.',
    'Skriv kundens egna ord, inte din tolkning. Ord i citat är guld för annonserna.',
    'Frågar kunden om sin order: säg att du kollar och återkommer. Lova ingen tid. De nya kundernas paket är oftast på väg (leverans median 11 dagar), spårningen finns i deras mejl.',
    'Samtalet spelas inte in. Du skriver själv medan ni pratar.',
  ],
};

/**
 * Råordrar ur Shopify → listan: återköpare (2+ datum), ett slumpat urval nya
 * kunder, återköparnas e-post. `resor` är order-id → customerJourneySummary
 * (bara de senaste dagarnas ordrar), `annonsnamn` är annons-id → namn.
 * Ren funktion: samma indata och samma `nu` ger samma lista.
 */
export function bygg(ordrar, { nu = new Date(), resor = new Map(), annonsnamn = new Map(), urval = URVAL_STANDARD } = {}) {
  const stat = { ordrar: ordrar.length, annullerade: 0, ejMatstrumpor: 0, utanKund: 0, kunder: 0, medFlerOrdrar: 0, tillagg: 0, dubbel: 0, aterkopare: 0 };
  const per = new Map();
  for (const o of ordrar) {
    if (o.cancelledAt) { stat.annullerade++; continue; }
    if (!arMatstrumporOrder(o)) { stat.ejMatstrumpor++; continue; }
    const id = o.customer?.id;
    if (!id) { stat.utanKund++; continue; }
    if (!per.has(id)) per.set(id, []);
    per.get(id).push(o);
  }
  stat.kunder = per.size;

  const kundUr = (os, grupp) => {
    const k0 = os[0].customer ?? {};
    const namn = k0.displayName || [k0.firstName, k0.lastName].filter(Boolean).join(' ') || [os[0].shippingAddress?.firstName, os[0].shippingAddress?.lastName].filter(Boolean).join(' ') || 'Namn saknas';
    const t = koptillfallen(os);
    const sorterPer = t.map((tf) => [...new Set(tf.flatMap(sorter))]);
    const kund = {
      id: num(k0.id),
      namn,
      fornamn: k0.firstName || namn.split(' ')[0],
      telefon: telefonFor(os),
      epost: (k0.email || '').trim().toLowerCase() || null,
      ort: os.at(-1).shippingAddress?.city || k0.defaultAddress?.city || null,
      grupp,
      antalOrdrar: os.length,
      antalTillfallen: t.length,
      summa: os.reduce((a, o) => a + Number(o.totalPriceSet?.shopMoney?.amount ?? 0), 0),
      ordrar: os.map((o) => ({
        id: num(o.id),
        nummer: o.name,
        datum: svDatum(o.createdAt),
        iso: o.createdAt,
        belopp: Number(o.totalPriceSet?.shopMoney?.amount ?? 0),
        produkter: produktText(o),
        tillagg: arTillagg(o),
        kod: (o.discountCodes ?? []).join(', ') || null,
      })),
      tillfallen: t.map((tf, i) => ({ datum: svDatum(tf[0].createdAt), iso: tf[0].createdAt, sorter: sorterPer[i] })),
      mellanrum: t.slice(1).map((tf, i) => tidMellan(t[i][0].createdAt, tf[0].createdAt)),
      bytteProdukt: t.length >= 2 && sorterPer.slice(1).some((arr) => arr.some((s) => !sorterPer[0].includes(s))),
      senast: svDatum(os.at(-1).createdAt),
    };
    kund.telefonVisning = visaTelefon(kund.telefon);
    return kund;
  };

  // 1. Återköparna: två eller fler kalenderdatum.
  const aterkopare = [];
  const identiska = [];
  for (const os of per.values()) {
    if (os.length < 2) continue;
    stat.medFlerOrdrar++;
    os.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    if (koptillfallen(os).length < 2) {
      if (os.some(arTillagg)) stat.tillagg++;
      else {
        stat.dubbel++;
        if (os.length === 2 && produktText(os[0]) === produktText(os[1]) && os[0].totalPriceSet?.shopMoney?.amount === os[1].totalPriceSet?.shopMoney?.amount) identiska.push(os.map((o) => o.name));
      }
      continue;
    }
    const kund = kundUr(os, 'aterkop');
    kund.fragor = fragorFor(kund);
    aterkopare.push(kund);
  }
  stat.aterkopare = aterkopare.length;
  aterkopare.sort((a, b) => Number(Boolean(b.telefon)) - Number(Boolean(a.telefon)) || b.antalTillfallen - a.antalTillfallen || b.summa - a.summa || a.namn.localeCompare(b.namn, 'sv'));

  // 2. Nya kunder: första ordern någonsin, lagd de senaste NYA_DAGAR dagarna, med telefon — lottade.
  const sedan = nu.getTime() - NYA_DAGAR * 86400000;
  const kandidater = [];
  for (const os of per.values()) {
    if (os.length !== 1) continue;
    const o = os[0];
    if (Date.parse(o.createdAt) < sedan || Date.parse(o.createdAt) > nu.getTime()) continue;
    if (Number(o.customer?.numberOfOrders ?? 1) > 1) continue; // ordrar före Fixkliniken-filtret räknas som historia
    kandidater.push(o);
  }
  kandidater.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const medTel = kandidater.filter((o) => telefonFor([o]));
  const nya = slumpa(medTel, dagSE(nu.toISOString())).slice(0, urval).map((o) => {
    const k = kundUr([o], 'ny');
    k.komVia = komVia(resor.get(num(o.id)) ?? resor.get(o.id), annonsnamn);
    k.fragor = fragorFor(k);
    return k;
  });
  nya.sort((a, b) => b.ordrar[0].iso.localeCompare(a.ordrar[0].iso));
  const nyaStat = { dagar: NYA_DAGAR, forstagangs: kandidater.length, medTelefon: medTel.length, urval: nya.length };

  // 3. E-posten: alla återköpare, med eller utan telefon, en gång var.
  const epost = [...new Set(aterkopare.map((k) => k.epost).filter(Boolean))].sort();

  return { last: nu.toISOString(), stat, nyaStat, identiska, medTelefon: aterkopare.filter((k) => k.telefon).length, utanTelefon: aterkopare.filter((k) => !k.telefon).length, aterkopare, nya, epost };
}

// ---------- utdata ----------

function kundBlock(k, i) {
  const tel = k.telefon ? `📞 **${k.telefonVisning}**` : '📞 *inget telefonnummer i Shopify*';
  const rad2 = k.grupp === 'ny'
    ? `${GRUPP.ny.kort} · kom via: ${k.komVia}`
    : `${GRUPP.aterkop.kort} · ${k.antalTillfallen} datum, ${k.antalOrdrar} ordrar · ${kr(k.summa)} totalt · mellan köpen: ${k.mellanrum.join(', ')}`;
  return [
    `### ${i}. ${k.namn}${k.ort ? ` · ${k.ort}` : ''}`,
    '',
    `${tel}${k.epost ? ` · ✉️ ${k.epost}` : ''}`,
    rad2,
    '',
    ...k.ordrar.map((o) => `- ${o.datum} · ${o.nummer}${o.tillagg ? ' (tillägg på tacksidan)' : ''} · ${o.produkter} · ${kr(o.belopp)}${o.kod ? ` · kod ${o.kod}` : ''}`),
    '',
    '**Frågor:**',
    ...k.fragor.map((f, n) => `${n + 1}. ${f}`),
    '',
    '**Anteckningar:**',
    '',
    '',
  ].join('\n');
}

function manusBlock(grupp) {
  return [
    `**Öppning:** ${MANUS.oppning[grupp]}`,
    '',
    `**Extra fråga om tid finns:** ${MANUS.omTidFinns[grupp]}`,
    '',
  ];
}

export function tillMarkdown(lista) {
  const datum = svDatum(lista.last);
  const ring = lista.aterkopare.filter((k) => k.telefon);
  const utan = lista.aterkopare.filter((k) => !k.telefon);
  const s = lista.stat;
  const ut = [
    '# Ringlista Matstrumpor.se',
    '',
    `Läst ur Shopify ${datum}. **${s.aterkopare} kunder har köpt på två eller fler datum** (av ${s.kunder.toLocaleString('sv-SE')} som köpt strumpor); **${lista.medTelefon} av dem har telefonnummer** och står i ringlistan, ${lista.utanTelefon} saknar nummer och står sist med e-post. Bortsorterade: ${s.tillagg} som bara tog donut-tillägget på tacksidan och ${s.dubbel} som la två ordrar samma dag — impuls, inte återköp.${lista.identiska.length ? ` ⚠️ Två identiska ordrar samma dag, kolla om de fått pengarna tillbaka: ${lista.identiska.map((p) => p.join('/')).join(', ')}.` : ''}`,
    '',
    `**Nya kunder:** ${lista.nyaStat.forstagangs} förstagångsköpare de senaste ${lista.nyaStat.dagar} dagarna, ${lista.nyaStat.medTelefon} med telefon, **${lista.nyaStat.urval} lottade** nedan (samma lottning hela dagen, ny i morgon).`,
    '',
    `**E-postlistan** för att exkludera återköparna ur en annan undersökning: \`aterkopare-epost.txt\` (${lista.epost.length} adresser, en per rad).`,
    '',
    '## Manus',
    '',
    `**Om nej:** ${MANUS.omNej}`,
    '',
    `**Avslut:** ${MANUS.avslut}`,
    '',
    ...MANUS.regler.map((r) => `- ${r}`),
    '',
    `## ${GRUPP.aterkop.rubrik} (${ring.length} att ringa)`,
    '',
    ...manusBlock('aterkop'),
  ];
  let i = 0;
  for (const k of ring) ut.push(kundBlock(k, ++i));
  ut.push(`## ${GRUPP.ny.rubrik} (${lista.nya.length})`, '', ...manusBlock('ny'));
  if (!lista.nya.length) ut.push('*Ingen förstagångsköpare med telefonnummer de senaste dagarna.*', '');
  for (const k of lista.nya) ut.push(kundBlock(k, ++i));
  ut.push(`## Återköpare som inte går att ringa — inget telefonnummer i Shopify (${utan.length})`, '', 'Bara e-post finns. Kassan kräver inte telefon, så numret saknas på de flesta ordrar. De får presentkortet ändå.', '');
  ut.push('| Namn | E-post | Datum | Ordrar | Totalt | Senast |', '|---|---|---:|---:|---:|---|');
  for (const k of utan) ut.push(`| ${k.namn} | ${k.epost ?? '—'} | ${k.antalTillfallen} | ${k.antalOrdrar} | ${kr(k.summa)} | ${k.senast} |`);
  ut.push('');
  return ut.join('\n');
}

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function tillHtml(lista) {
  const datum = svDatum(lista.last);
  const ring = lista.aterkopare.filter((k) => k.telefon);
  const utan = lista.aterkopare.filter((k) => !k.telefon);
  const s = lista.stat;
  let i = 0;
  const kort = (k) => `
<article class="kund" data-id="${esc(k.id)}" data-grupp="${k.grupp}">
  <header>
    <span class="nr">${++i}</span>
    <h3>${esc(k.namn)}${k.ort ? ` <small>· ${esc(k.ort)}</small>` : ''}</h3>
    <span class="tagg ${k.grupp}">${GRUPP[k.grupp].kort}</span>
  </header>
  <a class="ring" href="tel:${esc(k.telefon)}">📞 ${esc(k.telefonVisning)}</a>
  <p class="meta">${k.grupp === 'ny' ? `Kom via: <b>${esc(k.komVia)}</b>` : `${k.antalTillfallen} datum, ${k.antalOrdrar} ordrar · ${esc(kr(k.summa))} totalt · mellan köpen: ${esc(k.mellanrum.join(', '))}`}</p>
  <ul class="ordrar">${k.ordrar.map((o) => `<li>${esc(o.datum)} · ${esc(o.nummer)}${o.tillagg ? ' <i>(tillägg på tacksidan)</i>' : ''} · ${esc(o.produkter)} · ${esc(kr(o.belopp))}</li>`).join('')}</ul>
  <ol class="fragor">${k.fragor.map((f) => `<li>${esc(f)}</li>`).join('')}</ol>
  <div class="status" role="group" aria-label="Status">
    <button type="button" data-status="nadd">✅ Nådd</button>
    <button type="button" data-status="ingetsvar">📵 Inget svar</button>
    <button type="button" data-status="ringigen">🔁 Ring igen</button>
    <button type="button" data-status="">Rensa</button>
  </div>
  <label>Anteckningar — kundens egna ord<textarea rows="5" placeholder="Skriv medan ni pratar…"></textarea></label>
</article>`;
  const manus = (g) => `<div class="manus"><p><b>Öppning:</b> ${esc(MANUS.oppning[g])}</p><p><b>Extra fråga om tid finns:</b> ${esc(MANUS.omTidFinns[g])}</p></div>`;

  return `<!doctype html>
<html lang="sv">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Ringlista Matstrumpor</title>
<style>
:root { --bg:#fff; --fg:#111; --mut:#555; --kant:#ddd; --kort:#f6f6f6; --acc:#dd821d; --ok:#1a7f37; --varn:#b45309; --ny:#1d4ed8; }
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { --bg:#121212; --fg:#eee; --mut:#aaa; --kant:#333; --kort:#1c1c1c; --ny:#93c5fd; } }
:root[data-theme="dark"] { --bg:#121212; --fg:#eee; --mut:#aaa; --kant:#333; --kort:#1c1c1c; --ny:#93c5fd; }
* { box-sizing:border-box }
body { margin:0; padding:16px; background:var(--bg); color:var(--fg); font:18px/1.5 system-ui,-apple-system,Segoe UI,Roboto,sans-serif; max-width:760px; margin-inline:auto }
h1 { font-size:1.6rem; margin:.2em 0 }
h2 { font-size:1.25rem; margin:1.6em 0 .6em; border-bottom:2px solid var(--kant); padding-bottom:.2em }
h2 small, h3 small { color:var(--mut); font-weight:normal }
.intro, .manus { background:var(--kort); border:1px solid var(--kant); border-radius:12px; padding:14px 16px; margin:12px 0 }
.manus p { margin:.4em 0 } .intro ul { margin:.4em 0 0; padding-left:1.2em }
.verktyg { display:flex; flex-wrap:wrap; gap:8px; margin:12px 0; position:sticky; top:0; background:var(--bg); padding:8px 0; z-index:2 }
button, .knapp { font:inherit; font-size:1rem; padding:10px 14px; border-radius:10px; border:1px solid var(--kant); background:var(--kort); color:var(--fg); cursor:pointer }
button[aria-pressed="true"] { border-color:var(--acc); box-shadow:0 0 0 2px var(--acc) inset }
.kund { background:var(--kort); border:1px solid var(--kant); border-radius:14px; padding:16px; margin:14px 0 }
.kund header { display:flex; align-items:baseline; gap:10px; flex-wrap:wrap }
.kund h3 { margin:0; font-size:1.2rem; flex:1 }
.nr { color:var(--mut) }
.tagg { font-size:.8rem; padding:2px 8px; border-radius:999px; border:1px solid var(--kant); color:var(--mut) }
.tagg.ny { color:var(--ny); border-color:var(--ny) }
.ring { display:inline-block; margin:10px 0 4px; font-size:1.5rem; font-weight:700; color:var(--acc); text-decoration:none }
.meta { margin:.2em 0; color:var(--mut) }
.ordrar { margin:.4em 0; padding-left:1.2em; color:var(--mut); font-size:.95rem }
.fragor { margin:.8em 0; padding-left:1.4em } .fragor li { margin:.5em 0; font-size:1.1rem }
.status { display:flex; flex-wrap:wrap; gap:8px; margin:.6em 0 }
label { display:block; color:var(--mut); font-size:.95rem }
textarea { display:block; width:100%; margin-top:6px; font:inherit; font-size:1.05rem; padding:10px; border-radius:10px; border:1px solid var(--kant); background:var(--bg); color:var(--fg) }
.kund[data-st="nadd"] { border-color:var(--ok) } .kund[data-st="ingetsvar"] { opacity:.75 } .kund[data-st="ringigen"] { border-color:var(--varn) }
table { width:100%; border-collapse:collapse; font-size:.95rem } td, th { text-align:left; padding:6px 4px; border-bottom:1px solid var(--kant); vertical-align:top } th { color:var(--mut) }
.dold { display:none }
footer { color:var(--mut); font-size:.9rem; margin:2em 0 }
</style>
</head>
<body>
<h1>Ringlista Matstrumpor.se</h1>
<div class="intro">Läst ur Shopify ${esc(datum)}. <b>${ring.length} återköpare</b> (köpt på två eller fler datum) och <b>${lista.nya.length} nya kunder</b> (lottade förstagångsköpare från de senaste ${lista.nyaStat.dagar} dagarna) att ringa. ${utan.length} återköpare saknar telefonnummer och står längst ner. Bortsorterade: ${s.tillagg} som bara tog donut-tillägget på tacksidan, ${s.dubbel} som la två ordrar samma dag.${lista.identiska.length ? ` <b>⚠️ Två identiska ordrar samma dag, kolla om de fått pengarna tillbaka: ${esc(lista.identiska.map((p) => p.join('/')).join(', '))}.</b>` : ''} Anteckningarna sparas i den här webbläsaren — tryck <b>Kopiera anteckningar</b> när du är klar och klistra in dem i chatten.
  <p><b>Om nej:</b> ${esc(MANUS.omNej)} <b>Avslut:</b> ${esc(MANUS.avslut)}</p>
  <ul>${MANUS.regler.map((r) => `<li>${esc(r)}</li>`).join('')}</ul>
</div>
<div class="verktyg">
  <button type="button" data-filter="" aria-pressed="true">Alla</button>
  <button type="button" data-filter="kvar">Inte ringda</button>
  <button type="button" data-filter="nadd">Nådda</button>
  <button type="button" id="kopiera">📋 Kopiera anteckningar</button>
  <button type="button" id="ladda">⬇️ Ladda ner anteckningar</button>
</div>
<h2>${esc(GRUPP.aterkop.rubrik)} <small>(${ring.length})</small></h2>
${manus('aterkop')}
${ring.map(kort).join('')}
<h2>${esc(GRUPP.ny.rubrik)} <small>(${lista.nya.length})</small></h2>
${manus('ny')}
${lista.nya.length ? lista.nya.map(kort).join('') : '<p class="meta">Ingen förstagångsköpare med telefonnummer de senaste dagarna.</p>'}
<h2>Återköpare som inte går att ringa — inget telefonnummer i Shopify <small>(${utan.length})</small></h2>
<p class="meta">Bara e-post finns. Kassan kräver inte telefon, så numret saknas på de flesta ordrar. De får presentkortet ändå.</p>
<table><thead><tr><th>Namn</th><th>E-post</th><th>Datum</th><th>Ordrar</th><th>Totalt</th><th>Senast</th></tr></thead><tbody>
${utan.map((k) => `<tr><td>${esc(k.namn)}</td><td>${esc(k.epost ?? '—')}</td><td>${k.antalTillfallen}</td><td>${k.antalOrdrar}</td><td>${esc(kr(k.summa))}</td><td>${esc(k.senast)}</td></tr>`).join('\n')}
</tbody></table>
<footer>Byggd av <code>matstrumpor/ringlista.mjs</code>. Filen bär kunduppgifter — dela den inte.</footer>
<script>
(function () {
  var NYCKEL = 'ms-ringlista:';
  function las(id) { try { return JSON.parse(localStorage.getItem(NYCKEL + id) || '{}'); } catch (e) { return {}; } }
  function spara(id, v) { try { localStorage.setItem(NYCKEL + id, JSON.stringify(v)); } catch (e) {} }
  var kort = document.querySelectorAll('.kund');
  kort.forEach(function (k) {
    var id = k.dataset.id, st = las(id), ta = k.querySelector('textarea');
    ta.value = st.ant || '';
    k.dataset.st = st.status || '';
    k.querySelectorAll('[data-status]').forEach(function (b) {
      b.setAttribute('aria-pressed', String((st.status || '') === b.dataset.status && b.dataset.status !== ''));
      b.addEventListener('click', function () {
        var s = las(id); s.status = b.dataset.status; spara(id, s); k.dataset.st = s.status;
        k.querySelectorAll('[data-status]').forEach(function (x) { x.setAttribute('aria-pressed', String(x.dataset.status === s.status && s.status !== '')); });
        filtrera();
      });
    });
    ta.addEventListener('input', function () { var s = las(id); s.ant = ta.value; s.tid = new Date().toISOString(); spara(id, s); });
  });
  var filter = '';
  function filtrera() {
    kort.forEach(function (k) {
      var s = k.dataset.st || '';
      var visa = filter === '' || (filter === 'nadd' && s === 'nadd') || (filter === 'kvar' && s !== 'nadd' && s !== 'ingetsvar');
      k.classList.toggle('dold', !visa);
    });
  }
  document.querySelectorAll('[data-filter]').forEach(function (b) {
    b.addEventListener('click', function () {
      filter = b.dataset.filter;
      document.querySelectorAll('[data-filter]').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      filtrera();
    });
  });
  function markdown() {
    var ut = ['# Anteckningar ringlista Matstrumpor — ' + new Date().toISOString().slice(0, 10), ''];
    kort.forEach(function (k) {
      var st = las(k.dataset.id);
      if (!st.status && !(st.ant || '').trim()) return;
      var namn = k.querySelector('h3').childNodes[0].textContent.trim();
      var ordrar = Array.prototype.map.call(k.querySelectorAll('.ordrar li'), function (li) { return li.textContent.split(' · ')[1]; }).join(', ');
      var status = { nadd: 'Nådd', ingetsvar: 'Inget svar', ringigen: 'Ring igen' }[st.status] || 'Ingen status';
      ut.push('## ' + namn + ' (' + ordrar + ') — ' + k.dataset.grupp.toUpperCase() + ' — ' + status, '', (st.ant || '').trim() || '(inga anteckningar)', '');
    });
    return ut.join('\\n');
  }
  document.getElementById('kopiera').addEventListener('click', function () {
    var md = markdown();
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(md).then(function () { alert('Kopierat. Klistra in i chatten.'); }, function () { prompt('Kopiera texten:', md); });
    else prompt('Kopiera texten:', md);
  });
  document.getElementById('ladda').addEventListener('click', function () {
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([markdown()], { type: 'text/markdown' }));
    a.download = 'anteckningar-ringlista-' + new Date().toISOString().slice(0, 10) + '.md';
    document.body.appendChild(a); a.click(); a.remove();
  });
})();
</script>
</body>
</html>`;
}

// ---------- Shopify + Meta ----------

/** Alla ordrar i butiken med det ringlistan behöver. Bara läsning. */
export async function hamtaOrdrar(klient, { maxSidor = 80, logg = () => {} } = {}) {
  const alla = [];
  let after = null;
  for (let sida = 0; sida < maxSidor; sida++) {
    const d = await klient.graphql(
      `query($after: String) { orders(first: 250, after: $after, sortKey: CREATED_AT) {
        pageInfo { hasNextPage endCursor }
        nodes { id name createdAt cancelledAt displayFinancialStatus sourceName discountCodes
          totalPriceSet { shopMoney { amount } }
          customer { id displayName firstName lastName email phone numberOfOrders defaultPhoneNumber { phoneNumber } defaultAddress { phone city } }
          shippingAddress { phone city firstName lastName }
          billingAddress { phone }
          lineItems(first: 20) { nodes { title quantity variant { title } } } } } }`,
      { after }
    );
    alla.push(...d.orders.nodes);
    logg(`sida ${sida + 1}: ${alla.length} ordrar`);
    if (!d.orders.pageInfo.hasNextPage) break;
    after = d.orders.pageInfo.endCursor;
  }
  return alla;
}

/** Besöksdatan (UTM, källa, landningssida) för ordrarna sedan ett datum — en egen, liten fråga. */
export async function hamtaResor(klient, sedanIso) {
  const resor = new Map();
  let after = null;
  for (let sida = 0; sida < 10; sida++) {
    const d = await klient.graphql(
      `query($q: String!, $after: String) { orders(first: 100, query: $q, after: $after, sortKey: CREATED_AT) {
        pageInfo { hasNextPage endCursor }
        nodes { id customerJourneySummary { customerOrderIndex
          firstVisit { source referrerUrl landingPage utmParameters { source medium campaign content term } }
          lastVisit { source referrerUrl landingPage utmParameters { source medium campaign content term } } } } } }`,
      { q: `created_at:>=${sedanIso.slice(0, 10)}`, after }
    );
    for (const o of d.orders.nodes) if (o.customerJourneySummary) resor.set(num(o.id), o.customerJourneySummary);
    if (!d.orders.pageInfo.hasNextPage) break;
    after = d.orders.pageInfo.endCursor;
  }
  return resor;
}

/** Annonsnamn ur Meta för utm_content-id:na. Utan META_ACCESS_TOKEN: tom karta, id:t visas i stället. */
export async function hamtaAnnonsnamn(resor, { env = process.env, logg = () => {} } = {}) {
  const ut = new Map();
  const ids = new Set();
  for (const r of resor.values()) for (const v of [r.lastVisit, r.firstVisit]) { const c = v?.utmParameters?.content; if (/^\d{10,}$/.test(c ?? '')) ids.add(c); }
  if (!ids.size) return ut;
  if (!env.META_ACCESS_TOKEN) { logg(`META_ACCESS_TOKEN saknas — ${ids.size} annons-id visas utan namn.`); return ut; }
  const { api } = await import('../tools/meta-lib.mjs');
  for (const id of ids) {
    try { const a = await api(id, { params: { fields: 'name' } }); if (a?.name) ut.set(id, a.name); } catch (fel) { logg(`annons ${id}: ${fel.message.slice(0, 80)}`); }
  }
  return ut;
}

// ---------- CLI ----------

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const arg = process.argv.slice(2);
  const fran = arg.includes('--fran') ? arg[arg.indexOf('--fran') + 1] : null;
  const urval = arg.includes('--urval') ? Number(arg[arg.indexOf('--urval') + 1]) : URVAL_STANDARD;
  const sparaOrdrar = arg.includes('--spara-ordrar');
  const nu = new Date();
  const datum = nu.toISOString().slice(0, 10);
  mkdirSync(UTMAPP, { recursive: true });

  let ordrar;
  let resor = new Map();
  if (fran) {
    if (!existsSync(fran)) { console.error(`Hittar inte ${fran}`); process.exit(1); }
    const j = JSON.parse(readFileSync(fran, 'utf8'));
    ordrar = Array.isArray(j) ? j : j.ordrar;
    if (!Array.isArray(j) && j.resor) resor = new Map(Object.entries(j.resor));
    console.error(`Läser ${ordrar.length} ordrar${resor.size ? ` och ${resor.size} besök` : ''} ur ${fran} (inget nät).`);
  } else {
    const { lasButik, skapaKlient } = await import('../sparning/butik.mjs');
    const klient = await skapaKlient(lasButik('matstrumpor'));
    const info = await klient.kolla();
    console.error(`Butik: ${info.namn} (${info.doman}) · app ${info.app} · ${info.scopes.length} rättigheter`);
    ordrar = await hamtaOrdrar(klient, { logg: (r) => process.stderr.write(`\r${r}   `) });
    process.stderr.write('\n');
    resor = await hamtaResor(klient, new Date(nu.getTime() - NYA_DAGAR * 86400000).toISOString());
    console.error(`Besöksdata för ${resor.size} ordrar de senaste ${NYA_DAGAR} dagarna.`);
    if (sparaOrdrar) {
      const f = join(UTMAPP, `ordrar-${datum}.json`);
      writeFileSync(f, JSON.stringify({ ordrar, resor: Object.fromEntries(resor) }));
      console.error(`Råordrarna sparade i ${f} (gitignorerad).`);
    }
  }
  const annonsnamn = await hamtaAnnonsnamn(resor, { logg: (s) => console.error(`  ${s}`) });
  if (annonsnamn.size) console.error(`Annonsnamn ur Meta: ${annonsnamn.size}.`);

  const lista = bygg(ordrar, { nu, resor, annonsnamn, urval });
  writeFileSync(join(UTMAPP, 'ringlista.json'), JSON.stringify(lista, null, 2));
  writeFileSync(join(UTMAPP, 'RINGLISTA.md'), tillMarkdown(lista));
  writeFileSync(join(UTMAPP, 'ringlista.html'), tillHtml(lista));
  writeFileSync(join(UTMAPP, 'aterkopare-epost.txt'), `${lista.epost.join('\n')}\n`);

  const s = lista.stat;
  console.log(`Ordrar lästa: ${s.ordrar} · annullerade ${s.annullerade} · utan strumpor (Fixkliniken-tiden) ${s.ejMatstrumpor}`);
  console.log(`Kunder som köpt strumpor: ${s.kunder} · med 2+ ordrar: ${s.medFlerOrdrar} ⇒ återköpare på 2+ datum: ${s.aterkopare} (med telefon ${lista.medTelefon}, utan ${lista.utanTelefon}) · bortsorterade: tillägg ${s.tillagg}, dubbel samma dag ${s.dubbel}`);
  console.log(`Nya kunder senaste ${lista.nyaStat.dagar} d: ${lista.nyaStat.forstagangs} förstagångs, ${lista.nyaStat.medTelefon} med telefon, ${lista.nyaStat.urval} lottade`);
  console.log(`E-post att exkludera: ${lista.epost.length}`);
  console.log(`Skrivet i ${UTMAPP}: RINGLISTA.md, ringlista.html, ringlista.json, aterkopare-epost.txt — gitignorerade, bär kunduppgifter.`);
}
