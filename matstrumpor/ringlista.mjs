#!/usr/bin/env node
// ringlista.mjs — Matstrumpors ringlista: kunderna som köpt 2+ gånger, med
// telefonnummer, vad de köpt och 1–3 frågor per kund. Axels beställning
// 2026-09-27: "en lista med alla kunder som köpt 2 gånger eller fler … en
// ringlista … några frågor jag kan ställa varje kund".
//
//   node matstrumpor/ringlista.mjs                  Shopify → output/ringlista/ (json, md, html)
//   node matstrumpor/ringlista.mjs --fran <fil>     ur en sparad orderfil, utan nät
//   node matstrumpor/ringlista.mjs --spara-ordrar   spara råordrarna bredvid (för --fran)
//
// Läs-bart: bara orders-frågor mot Shopify (sparning/butik.mjs, appen "Fabriken").
//
// ⚠️ Utdatan bär kundernas namn, telefonnummer och e-post. Den skrivs BARA i
// matstrumpor/output/ (gitignorerad) och får aldrig committas, postas i Discord
// eller läggas i Notion. Kundtjänstens regel gäller: personuppgifter maskeras
// i allt som lämnar Axels egen skärm.
//
// Tre saker datan visade när listan byggdes (2026-09-27, 4 011 ordrar):
//   1. 70 av 71 "shopify_draft_order" är Donut-strumpor 299 kr, skapade 1–5 min
//      efter en webborder (dec 2025–mars 2026) — tacksidans tillägg, inte ett
//      återköp. De räknas som SAMMA köptillfälle (grupp "tillagg").
//   2. Butiken sålde Fixkliniken-produkter (Skrubbmattan, FixToes …) innan
//      strumporna. En order utan strumpor/ätpinnar/presentkort räknas inte.
//   3. Kassan kräver inte telefon: 800 av 4 006 ordrar bär ett nummer. Kunder
//      utan nummer står i en egen sektion med e-post — de går inte att ringa.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';

const ROT = dirname(fileURLToPath(import.meta.url));
export const UTMAPP = join(ROT, 'output', 'ringlista');

/** En order hör till Matstrumpor om någon rad är strumpor, ätpinnar eller presentkort. */
export const MATSTRUMPOR_RAD = /strump|ätpinnar|presentkort/i;

/** Ordrar inom så här många minuter efter föregående räknas som samma köptillfälle. */
export const SAMMA_TILLFALLE_MIN = 60;

export const GRUPP = {
  aterkop: { nyckel: 'aterkop', rubrik: 'Kom tillbaka och köpte igen', kort: 'ÅTERKÖP' },
  dubbel: { nyckel: 'dubbel', rubrik: 'Två beställningar i samma besök', kort: 'DUBBEL' },
  tillagg: { nyckel: 'tillagg', rubrik: 'Tog donut-tillägget direkt efter köpet', kort: 'TILLÄGG' },
};
const GRUPPORDNING = ['aterkop', 'dubbel', 'tillagg'];

const MANADER = ['jan', 'feb', 'mars', 'april', 'maj', 'juni', 'juli', 'aug', 'sep', 'okt', 'nov', 'dec'];

// ---------- rena funktioner ----------

/** Svenskt datum "2 dec 2025" ur en ISO-tidsstämpel, i svensk tid. */
export function svDatum(iso) {
  const d = new Date(iso);
  const delar = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Stockholm', year: 'numeric', month: 'numeric', day: 'numeric' }).formatToParts(d);
  const v = (t) => delar.find((p) => p.type === t)?.value;
  return `${Number(v('day'))} ${MANADER[Number(v('month')) - 1]} ${v('year')}`;
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

/** Ordrar (sorterade) → köptillfällen: en order inom SAMMA_TILLFALLE_MIN efter föregående hör till samma tillfälle. */
export function koptillfallen(ordrar) {
  const t = [];
  for (const o of ordrar) {
    const senaste = t.at(-1);
    if (senaste && Date.parse(o.createdAt) - Date.parse(senaste.at(-1).createdAt) <= SAMMA_TILLFALLE_MIN * 60000) senaste.push(o);
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

/**
 * Råordrar ur Shopify → kunderna med 2+ Matstrumpor-ordrar, grupperade och med frågor.
 * Ren funktion: samma indata ger samma lista.
 */
export function bygg(ordrar, { nu = new Date() } = {}) {
  const stat = { ordrar: ordrar.length, annullerade: 0, ejMatstrumpor: 0, utanKund: 0, kunder: 0, medFler: 0 };
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

  const kunder = [];
  for (const [id, os] of per) {
    if (os.length < 2) continue;
    os.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    const t = koptillfallen(os);
    const k0 = os[0].customer ?? {};
    const namn = k0.displayName || [k0.firstName, k0.lastName].filter(Boolean).join(' ') || [os[0].shippingAddress?.firstName, os[0].shippingAddress?.lastName].filter(Boolean).join(' ') || 'Namn saknas';
    const grupp = t.length >= 2 ? 'aterkop' : os.some(arTillagg) ? 'tillagg' : 'dubbel';
    const sorterPerTillfalle = t.map((tf) => [...new Set(tf.flatMap(sorter))]);
    const bytteProdukt = t.length >= 2 && sorterPerTillfalle.slice(1).some((arr) => arr.some((s) => !sorterPerTillfalle[0].includes(s)));
    const identiskDubbel = grupp === 'dubbel' && os.length === 2 && produktText(os[0]) === produktText(os[1]) && os[0].totalPriceSet?.shopMoney?.amount === os[1].totalPriceSet?.shopMoney?.amount;
    const kund = {
      id: String(id).split('/').pop(),
      namn,
      fornamn: k0.firstName || namn.split(' ')[0],
      telefon: telefonFor(os),
      epost: k0.email || null,
      ort: os.at(-1).shippingAddress?.city || k0.defaultAddress?.city || null,
      grupp,
      antalOrdrar: os.length,
      antalTillfallen: t.length,
      summa: os.reduce((a, o) => a + Number(o.totalPriceSet?.shopMoney?.amount ?? 0), 0),
      ordrar: os.map((o) => ({
        nummer: o.name,
        datum: svDatum(o.createdAt),
        iso: o.createdAt,
        belopp: Number(o.totalPriceSet?.shopMoney?.amount ?? 0),
        produkter: produktText(o),
        tillagg: arTillagg(o),
        kod: (o.discountCodes ?? []).join(', ') || null,
      })),
      tillfallen: t.map((tf) => ({ datum: svDatum(tf[0].createdAt), iso: tf[0].createdAt, sorter: [...new Set(tf.flatMap(sorter))] })),
      mellanrum: t.slice(1).map((tf, i) => tidMellan(t[i][0].createdAt, tf[0].createdAt)),
      bytteProdukt,
      identiskDubbel,
      senast: svDatum(os.at(-1).createdAt),
    };
    kund.telefonVisning = visaTelefon(kund.telefon);
    kund.fragor = fragorFor(kund);
    kunder.push(kund);
  }
  stat.medFler = kunder.length;

  kunder.sort((a, b) =>
    GRUPPORDNING.indexOf(a.grupp) - GRUPPORDNING.indexOf(b.grupp)
    || Number(Boolean(b.telefon)) - Number(Boolean(a.telefon))
    || b.antalTillfallen - a.antalTillfallen
    || b.summa - a.summa
    || a.namn.localeCompare(b.namn, 'sv'));

  const perGrupp = Object.fromEntries(GRUPPORDNING.map((g) => [g, { alla: kunder.filter((k) => k.grupp === g).length, medTelefon: kunder.filter((k) => k.grupp === g && k.telefon).length }]));
  return { last: nu.toISOString(), stat, perGrupp, medTelefon: kunder.filter((k) => k.telefon).length, utanTelefon: kunder.filter((k) => !k.telefon).length, kunder };
}

/** Frågorna. Alltid högst tre, den mest specifika först. Skrivna för att läsas högt. */
export const FRAGA = {
  vemFick: 'Vem fick strumporna, och hur reagerade den som fick dem?',
  nastanInte: 'Var det något som nästan fick dig att inte köpa?',
  beskriv: 'Om du skulle beskriva dem för en kompis, hur skulle du säga då?',
};

export function fragorFor(k) {
  const ut = [];
  const s1 = k.tillfallen[0]?.sorter ?? [];
  const s2 = k.tillfallen[1]?.sorter ?? [];
  const namnge = (arr) => (arr.length ? arr.map((s) => `${s.toLowerCase()}strumporna`).join(' och ') : 'strumporna');
  if (k.grupp === 'aterkop') {
    if (k.antalTillfallen >= 3) ut.push(`Du har beställt ${k.antalTillfallen} gånger hos oss. Vad är det som gör att du kommer tillbaka?`);
    else if (k.bytteProdukt) ut.push(`Första gången tog du ${namnge(s1)}, andra gången ${namnge(s2.filter((s) => !s1.includes(s)))}. Vad fick dig att byta?`);
    else ut.push(`Du beställde ${namnge(s1)} i ${k.tillfallen[0].datum.split(' ').slice(1).join(' ')} och igen ${k.mellanrum[0]} senare. Vad fick dig att beställa en gång till?`);
    ut.push(FRAGA.vemFick, FRAGA.nastanInte);
  } else if (k.grupp === 'tillagg') {
    ut.push('Direkt efter att du beställt sushistrumporna lade du till donut-strumporna också. Vad fick dig att ta dem?', FRAGA.vemFick, FRAGA.nastanInte);
  } else {
    ut.push(`Du la två beställningar med några minuters mellanrum den ${k.ordrar[0].datum}. Var det meningen, eller var det något i kassan som strulade?`, FRAGA.vemFick, FRAGA.nastanInte);
  }
  return ut.slice(0, 3);
}

/** Manuset runt frågorna — samma för alla samtal. */
export const MANUS = {
  oppning: 'Hej, det är Axel, jag driver Matstrumpor.se. Du har beställt hos oss ett par gånger och jag ringer bara för att fråga två, tre snabba saker. Har du en minut?',
  omNej: 'Absolut, tack ändå. Ha en fin dag!',
  omTidFinns: FRAGA.beskriv,
  avslut: 'Tack, det hjälper oss jättemycket. Ha det fint!',
  regler: [
    'Inga erbjudanden och inga löften i samtalet. Bara lyssna.',
    'Skriv kundens egna ord, inte din tolkning. Ord i citat är guld för annonserna.',
    'Frågar kunden om sin order: säg att du kollar och återkommer. Lova ingen tid.',
    'Samtalet spelas inte in. Du skriver själv medan ni pratar.',
  ],
};

// ---------- utdata ----------

function kundBlock(k, i) {
  const tel = k.telefon ? `📞 **${k.telefonVisning}**` : '📞 *inget telefonnummer i Shopify*';
  const rader = [
    `### ${i}. ${k.namn}${k.ort ? ` · ${k.ort}` : ''}`,
    '',
    `${tel}${k.epost ? ` · ✉️ ${k.epost}` : ''}`,
    `${GRUPP[k.grupp].kort} · ${k.antalOrdrar} ordrar · ${kr(k.summa)} totalt${k.mellanrum.length ? ` · mellan köpen: ${k.mellanrum.join(', ')}` : ''}${k.identiskDubbel ? ' · ⚠️ två identiska ordrar — dubbelköp?' : ''}`,
    '',
    ...k.ordrar.map((o) => `- ${o.datum} · ${o.nummer}${o.tillagg ? ' (tillägg på tacksidan)' : ''} · ${o.produkter} · ${kr(o.belopp)}${o.kod ? ` · kod ${o.kod}` : ''}`),
    '',
    '**Frågor:**',
    ...k.fragor.map((f, n) => `${n + 1}. ${f}`),
    '',
    '**Anteckningar:**',
    '',
    '',
  ];
  return rader.join('\n');
}

export function tillMarkdown(lista) {
  const datum = svDatum(lista.last);
  const ring = lista.kunder.filter((k) => k.telefon);
  const utan = lista.kunder.filter((k) => !k.telefon);
  const ut = [
    `# Ringlista Matstrumpor.se — kunder som köpt 2+ gånger`,
    '',
    `Läst ur Shopify ${datum}. ${lista.stat.kunder.toLocaleString('sv-SE')} kunder har köpt strumpor; **${lista.stat.medFler} har 2 eller fler ordrar**, och **${lista.medTelefon} av dem har ett telefonnummer** — de står i ringlistan. ${lista.utanTelefon} saknar nummer och står sist med e-post.`,
    '',
    '| Grupp | Vad det betyder | Alla | Med telefon |',
    '|---|---|---:|---:|',
    ...GRUPPORDNING.map((g) => `| ${GRUPP[g].rubrik} | ${g === 'aterkop' ? 'Två eller fler köptillfällen, mer än en timme emellan' : g === 'tillagg' ? 'Webborder + donut-strumporna som tillägg på tacksidan minuter senare (draft order i Shopify)' : 'Två webbordrar inom en timme'} | ${lista.perGrupp[g].alla} | ${lista.perGrupp[g].medTelefon} |`),
    '',
    '## Manus (samma för alla)',
    '',
    `**Öppning:** ${MANUS.oppning}`,
    '',
    `**Om nej:** ${MANUS.omNej}`,
    '',
    `**Extra fråga om tid finns:** ${MANUS.omTidFinns}`,
    '',
    `**Avslut:** ${MANUS.avslut}`,
    '',
    ...MANUS.regler.map((r) => `- ${r}`),
    '',
    `## Ringlistan (${ring.length} kunder)`,
    '',
  ];
  let i = 0;
  for (const g of GRUPPORDNING) {
    const k = ring.filter((x) => x.grupp === g);
    if (!k.length) continue;
    ut.push(`## ${GRUPP[g].rubrik} (${k.length})`, '');
    for (const kund of k) ut.push(kundBlock(kund, ++i));
  }
  ut.push(`## Kan inte ringas — inget telefonnummer i Shopify (${utan.length})`, '', 'Bara e-post finns. Kassan kräver inte telefon, så numret saknas på de flesta ordrar.', '');
  ut.push('| Namn | E-post | Grupp | Ordrar | Totalt | Senast |', '|---|---|---|---:|---:|---|');
  for (const k of utan) ut.push(`| ${k.namn} | ${k.epost ?? '—'} | ${GRUPP[k.grupp].kort} | ${k.antalOrdrar} | ${kr(k.summa)} | ${k.senast} |`);
  ut.push('');
  return ut.join('\n');
}

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function tillHtml(lista) {
  const datum = svDatum(lista.last);
  const ring = lista.kunder.filter((k) => k.telefon);
  const utan = lista.kunder.filter((k) => !k.telefon);
  let i = 0;
  const kort = (k) => `
<article class="kund" data-id="${esc(k.id)}" data-grupp="${k.grupp}">
  <header>
    <span class="nr">${++i}</span>
    <h3>${esc(k.namn)}${k.ort ? ` <small>· ${esc(k.ort)}</small>` : ''}</h3>
    <span class="tagg ${k.grupp}">${GRUPP[k.grupp].kort}</span>
  </header>
  <a class="ring" href="tel:${esc(k.telefon)}">📞 ${esc(k.telefonVisning)}</a>
  <p class="meta">${k.antalOrdrar} ordrar · ${esc(kr(k.summa))} totalt${k.mellanrum.length ? ` · mellan köpen: ${esc(k.mellanrum.join(', '))}` : ''}${k.identiskDubbel ? ' · <b>⚠️ två identiska ordrar — dubbelköp?</b>' : ''}</p>
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

  const sektioner = GRUPPORDNING.map((g) => {
    const k = ring.filter((x) => x.grupp === g);
    return k.length ? `<h2>${esc(GRUPP[g].rubrik)} <small>(${k.length})</small></h2>${k.map(kort).join('')}` : '';
  }).join('');

  return `<!doctype html>
<html lang="sv">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Ringlista Matstrumpor</title>
<style>
:root { --bg:#fff; --fg:#111; --mut:#555; --kant:#ddd; --kort:#f6f6f6; --acc:#dd821d; --ok:#1a7f37; --varn:#b45309; }
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { --bg:#121212; --fg:#eee; --mut:#aaa; --kant:#333; --kort:#1c1c1c; } }
:root[data-theme="dark"] { --bg:#121212; --fg:#eee; --mut:#aaa; --kant:#333; --kort:#1c1c1c; }
* { box-sizing:border-box }
body { margin:0; padding:16px; background:var(--bg); color:var(--fg); font:18px/1.5 system-ui,-apple-system,Segoe UI,Roboto,sans-serif; max-width:760px; margin-inline:auto }
h1 { font-size:1.6rem; margin:.2em 0 }
h2 { font-size:1.25rem; margin:1.6em 0 .6em; border-bottom:2px solid var(--kant); padding-bottom:.2em }
h2 small, h3 small { color:var(--mut); font-weight:normal }
.intro, .manus { background:var(--kort); border:1px solid var(--kant); border-radius:12px; padding:14px 16px; margin:12px 0 }
.manus p { margin:.4em 0 } .manus ul { margin:.4em 0 0; padding-left:1.2em }
.verktyg { display:flex; flex-wrap:wrap; gap:8px; margin:12px 0; position:sticky; top:0; background:var(--bg); padding:8px 0; z-index:2 }
button, .knapp { font:inherit; font-size:1rem; padding:10px 14px; border-radius:10px; border:1px solid var(--kant); background:var(--kort); color:var(--fg); cursor:pointer }
button[aria-pressed="true"] { border-color:var(--acc); box-shadow:0 0 0 2px var(--acc) inset }
.kund { background:var(--kort); border:1px solid var(--kant); border-radius:14px; padding:16px; margin:14px 0 }
.kund header { display:flex; align-items:baseline; gap:10px; flex-wrap:wrap }
.kund h3 { margin:0; font-size:1.2rem; flex:1 }
.nr { color:var(--mut) }
.tagg { font-size:.8rem; padding:2px 8px; border-radius:999px; border:1px solid var(--kant); color:var(--mut) }
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
<div class="intro">Kunder som köpt 2+ gånger. Läst ur Shopify ${esc(datum)}. <b>${ring.length} går att ringa</b>, ${utan.length} saknar telefonnummer (står längst ner). Anteckningarna sparas i den här webbläsaren — tryck <b>Kopiera anteckningar</b> när du är klar och klistra in dem i chatten, så skrivs sammanfattningen.</div>
<div class="manus">
  <p><b>Öppning:</b> ${esc(MANUS.oppning)}</p>
  <p><b>Om nej:</b> ${esc(MANUS.omNej)}</p>
  <p><b>Extra fråga om tid finns:</b> ${esc(MANUS.omTidFinns)}</p>
  <p><b>Avslut:</b> ${esc(MANUS.avslut)}</p>
  <ul>${MANUS.regler.map((r) => `<li>${esc(r)}</li>`).join('')}</ul>
</div>
<div class="verktyg">
  <button type="button" data-filter="" aria-pressed="true">Alla</button>
  <button type="button" data-filter="kvar">Inte ringda</button>
  <button type="button" data-filter="nadd">Nådda</button>
  <button type="button" id="kopiera">📋 Kopiera anteckningar</button>
  <button type="button" id="ladda">⬇️ Ladda ner anteckningar</button>
</div>
${sektioner}
<h2>Kan inte ringas — inget telefonnummer i Shopify <small>(${utan.length})</small></h2>
<p class="meta">Bara e-post finns. Kassan kräver inte telefon, så numret saknas på de flesta ordrar.</p>
<table><thead><tr><th>Namn</th><th>E-post</th><th>Grupp</th><th>Ordrar</th><th>Totalt</th><th>Senast</th></tr></thead><tbody>
${utan.map((k) => `<tr><td>${esc(k.namn)}</td><td>${esc(k.epost ?? '—')}</td><td>${GRUPP[k.grupp].kort}</td><td>${k.antalOrdrar}</td><td>${esc(kr(k.summa))}</td><td>${esc(k.senast)}</td></tr>`).join('\n')}
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

// ---------- Shopify ----------

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
          customer { id displayName firstName lastName email phone defaultPhoneNumber { phoneNumber } defaultAddress { phone city } }
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

// ---------- CLI ----------

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const arg = process.argv.slice(2);
  const fran = arg.includes('--fran') ? arg[arg.indexOf('--fran') + 1] : null;
  const sparaOrdrar = arg.includes('--spara-ordrar');
  const nu = new Date();
  const datum = nu.toISOString().slice(0, 10);
  mkdirSync(UTMAPP, { recursive: true });

  let ordrar;
  if (fran) {
    if (!existsSync(fran)) { console.error(`Hittar inte ${fran}`); process.exit(1); }
    ordrar = JSON.parse(readFileSync(fran, 'utf8'));
    console.error(`Läser ${ordrar.length} ordrar ur ${fran} (inget nät).`);
  } else {
    const { lasButik, skapaKlient } = await import('../sparning/butik.mjs');
    const butik = lasButik('matstrumpor');
    const klient = await skapaKlient(butik);
    const info = await klient.kolla();
    console.error(`Butik: ${info.namn} (${info.doman}) · app ${info.app} · ${info.scopes.length} rättigheter`);
    ordrar = await hamtaOrdrar(klient, { logg: (r) => process.stderr.write(`\r${r}   `) });
    process.stderr.write('\n');
    if (sparaOrdrar) {
      const f = join(UTMAPP, `ordrar-${datum}.json`);
      writeFileSync(f, JSON.stringify(ordrar));
      console.error(`Råordrarna sparade i ${f} (gitignorerad).`);
    }
  }

  const lista = bygg(ordrar, { nu });
  writeFileSync(join(UTMAPP, 'ringlista.json'), JSON.stringify(lista, null, 2));
  writeFileSync(join(UTMAPP, 'RINGLISTA.md'), tillMarkdown(lista));
  writeFileSync(join(UTMAPP, 'ringlista.html'), tillHtml(lista));

  const s = lista.stat;
  console.log(`Ordrar lästa: ${s.ordrar} · annullerade ${s.annullerade} · utan strumpor (Fixkliniken-tiden) ${s.ejMatstrumpor} · utan kund ${s.utanKund}`);
  console.log(`Kunder som köpt strumpor: ${s.kunder} · med 2+ ordrar: ${s.medFler} · med telefon: ${lista.medTelefon} · utan telefon: ${lista.utanTelefon}`);
  for (const g of GRUPPORDNING) console.log(`  ${GRUPP[g].rubrik}: ${lista.perGrupp[g].alla} (med telefon ${lista.perGrupp[g].medTelefon})`);
  console.log(`Skrivet: ${join(UTMAPP, 'RINGLISTA.md')}, ringlista.html, ringlista.json — gitignorerade, bär kunduppgifter.`);
}
