// Översättningsunderlaget: ALLA kundsynliga strängar butiken bär, med stabila
// nycklar, så en subagent kan översätta dem och marknad.mjs registrera dem via
// translationsRegister — utan att någon läser Shopify för hand (KEDJAN.md
// regel 6: kedjan skriver underlag, koden översätter aldrig själv).
//
//   node factory/oversattning.mjs factory/butiker/<butik>.yaml factory/produkter/<p1>.yaml [<p2>.yaml …]
//
// Skriver factory/output/<butik>/oversattning-sv.json (källan). Subagenten
// levererar oversattning-<locale>.json med EXAKT samma nycklar; en nyckel
// som saknas i översättningen registreras inte (svenskan syns då på
// /<locale> och rapporteras som läcka av marknad.oversattAllt).
//
// FORMATET (ett platt JSON-objekt, nyckel → sträng):
//   produkt.<handle>.title | body_html | meta_title | meta_description
//   produkt.<handle>.variant.<namn>          variantvärden (aldrig "Default Title")
//   metafalt.<handle>.opf.<key>              opf-metafälten; list-/json-fält står som
//                                            JSON-STRÄNG i samma form som i Shopify
//                                            ("[\"a\",\"b\"]") — översätt inuti, behåll formen
//   bonus.<handle>.title | body_html | meta_title   bonusprodukten (offer.bonus_produkt)
//   kollektion.<handle>.title | body_html    flerproduktsbutikens kollektion
//   sida.<handle>.title | body               policysidor + kontakt
//   meny.main-menu.<i> | meny.footer.<i>     menyradernas titlar, i ordning
//   index.sections.<sid>[.blocks.<bid>].settings.<key>    startsidan (templates/index.json)
//   header.sections.… | footer.sections.…   sektionsgrupperna
//   tema.settings.brand_description          sidfotens brandtext (settings_data)
//   tema.footer.snabblankar|information|nyhetsbrev, tema.share   temats fasta rubriker
//   paket.<handle>.rubrik | underrubrik | bricka | gratis_text  paket-metaobjekten
//   recension.<handle>.<i>.titel | text      underlag för Judge.me-importen i målspråket
//                                            (INTE en Shopify-resurs — registreras inte)
//   _om, _varningar                          anteckningar; allt med `_`-prefix ignoreras
//
// Nycklarna är för människor och för att para sv ↔ <locale>. Själva
// registreringen matchar på VÄRDE (marknad.mjs), så Shopifys hashade
// temanycklar behöver aldrig gissas. Värdena ska därför vara EXAKT de strängar
// fabriken skriver in i butiken — därför byggs de ur samma byggare som
// ops.mjs använder (build-store, metafalt, policyer, startsida, tema, paket,
// bonus), aldrig ur konfigen rakt av.
//
// Byggarna importeras som namnrymder: saknar en modul en kontraktsexport blir
// det en rad i `_varningar` med modul + funktion, inte ett länkfel som stoppar
// hela underlaget. Ren logik utan nätverk.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { join, dirname } from 'node:path';
import { lasYaml } from './yaml.mjs';
import { sammanfoga, arNischbutik } from './butik.mjs';
import { byggMetafalt } from './metafalt.mjs';
import { byggPolicyer, kontaktsida } from './policyer.mjs';
import { kundUnderrubrik } from './sida.mjs';
import * as buildStore from './build-store.mjs';
import * as startsida from './startsida.mjs';
import * as tema from './tema.mjs';
import * as paket from './paket.mjs';
import * as bonus from './bonus.mjs';

const FACTORY_ROT = dirname(fileURLToPath(import.meta.url));
const lista = (v) => (Array.isArray(v) ? v.filter((x) => x !== null && x !== '') : []);
const text = (v) => (typeof v === 'string' && v.trim() !== '' ? v.trim() : null);

export const underlagsfil = (butikId, locale = 'sv') => join(FACTORY_ROT, 'output', butikId, `oversattning-${locale}.json`);

// Kontraktsanrop med tydligt fel: "<modul>.<fn> saknas (KEDJAN.md)".
function krav(modul, namn, fn) {
  if (typeof modul?.[fn] !== 'function') throw new Error(`${namn}.mjs saknar ${fn}() — kontraktet i KEDJAN.md`);
  return modul[fn];
}

// Plockar ut varje textinställning ur en JSON-mall (index/header/footer) —
// nycklarna speglar filens struktur: sections.<id>.blocks.<bid>.settings.<key>
// / sections.<id>.settings.<key>. Layoutord, länkar och filer hoppas över.
const HOPPA = new Set([
  'custom_liquid', 'image', 'product', 'collection', 'menu', 'link', 'button_link', 'button_link_1', 'button_link_2',
  'icon', 'color_scheme', 'section_color_scheme', 'background', 'text_color', 'image_height', 'image_behavior',
  'desktop_content_position', 'desktop_content_alignment', 'mobile_content_alignment', 'content_alignment',
  'content_position', 'content_layout', 'heading_size', 'text_style', 'picker_type', 'swatch_shape', 'media_size',
  'media_fit', 'media_position', 'image_zoom', 'image_ratio', 'image_shape', 'view_all_style', 'columns_mobile',
  'layout', 'height', 'desktop_layout', 'mobile_layout', 'name',
]);
const TEKNISKT_VARDE = /^(shopify:\/\/|https?:\/\/|\{\{|#[0-9a-fA-F]{3,8}$|[a-z0-9_-]+$)/;
export function malltexter(prefix, mallJson) {
  const mall = typeof mallJson === 'string' ? lasTemaJson(mallJson) : mallJson;
  const ut = {};
  const ta = (nyckel, k, v) => {
    if (typeof v !== 'string' || !v.trim() || HOPPA.has(k) || TEKNISKT_VARDE.test(v.trim())) return;
    ut[nyckel] = v;
  };
  for (const [sid, sek] of Object.entries(mall?.sections ?? {})) {
    for (const [k, v] of Object.entries(sek?.settings ?? {})) ta(`${prefix}.sections.${sid}.settings.${k}`, k, v);
    for (const [bid, block] of Object.entries(sek?.blocks ?? {})) {
      for (const [k, v] of Object.entries(block?.settings ?? {})) ta(`${prefix}.sections.${sid}.blocks.${bid}.settings.${k}`, k, v);
    }
  }
  return ut;
}

// Shopifys tema-JSON får bära ett /* … */-block överst. JSON.parse kvävs på det.
function lasTemaJson(ra) {
  return JSON.parse(String(ra).replace(/^﻿/, '').replace(/^\s*\/\*[\s\S]*?\*\//, '').trim());
}

// Produkttexterna ur samma plan som build-store skickar till Shopify.
export function produktTexter(p, plan) {
  const h = p.produkt.id;
  const ut = {};
  const input = plan?.input ?? {};
  ut[`produkt.${h}.title`] = input.title ?? p.produkt.namn;
  if (text(input.descriptionHtml)) ut[`produkt.${h}.body_html`] = input.descriptionHtml;
  if (text(input.seo?.title)) ut[`produkt.${h}.meta_title`] = input.seo.title;
  if (text(input.seo?.description)) ut[`produkt.${h}.meta_description`] = input.seo.description;
  for (const o of input.productOptions ?? []) {
    for (const v of o.values ?? []) if (v.name && v.name !== 'Default Title') ut[`produkt.${h}.variant.${v.name}`] = v.name;
  }
  return ut;
}

// Ett "pk" ur ops.mjs (p + plan + metafalt) eller en rå sammanfogad produkt.
function normaliseraPk(pk, butik) {
  const p = pk?.p ?? pk;
  const plan = pk?.plan ?? krav(buildStore, 'build-store', 'byggPlan')(p, butik);
  const metafalt = pk?.metafalt ?? byggMetafalt(p, { kundUnderrubrik });
  return { p, plan, metafalt };
}

// Underlaget som objekt — ren logik, skriver inget. `varningar` bär
// kontraktsexporter som saknades eller byggare som kastade, så den som läser
// ser vad som INTE kom med i stället för att tro att underlaget är komplett.
export function byggUnderlagObjekt(ctx, produkter = ctx?.produkter ?? []) {
  const butik = ctx?.butik;
  if (!butik?.butik?.id) throw new Error('ctx.butik saknar butik.id.');
  const varningar = [];
  const forsok = (vad, fn) => {
    try { return fn(); } catch (e) { varningar.push(`${vad}: ${e.message}`); return null; }
  };
  const pks = produkter.map((pk) => normaliseraPk(pk, butik));
  const ps = pks.map((x) => x.p);
  const ut = {};

  // Produkter, metafält, bonus, paket, recensioner.
  for (const { p, plan, metafalt } of pks) {
    const h = p.produkt.id;
    Object.assign(ut, produktTexter(p, plan));
    for (const m of metafalt) {
      if (m.type === 'url') continue;
      ut[`metafalt.${h}.opf.${m.key}`] = m.value;
    }
    const b = p.offer?.bonus_produkt;
    if (text(b?.handle) && text(b?.titel)) {
      const bh = b.handle;
      const input = forsok(`bonus ${bh}`, () => krav(bonus, 'bonus', 'byggBonusInput')(p));
      ut[`bonus.${bh}.title`] = input?.title ?? b.titel;
      const body = input?.descriptionHtml ?? (typeof bonus.byggBonusBeskrivning === 'function' ? bonus.byggBonusBeskrivning(b, lista(p.garantier)[0]) : null);
      if (text(body)) ut[`bonus.${bh}.body_html`] = body;
      if (text(input?.seo?.title)) ut[`bonus.${bh}.meta_title`] = input.seo.title;
    }
    const plan2 = forsok(`paket ${h}`, () => krav(paket, 'paket', 'byggPaketplan')(p, butik));
    const poster = plan2?.poster ?? [...(plan2?.A ?? []), ...(plan2?.B ?? [])];
    for (const post of poster) {
      if (!post?.handle) continue;
      if (text(post.rubrik)) ut[`paket.${post.handle}.rubrik`] = post.rubrik;
      if (text(post.underrubrik)) ut[`paket.${post.handle}.underrubrik`] = post.underrubrik;
      if (text(post.bricka)) ut[`paket.${post.handle}.bricka`] = post.bricka;
      const gratis = post.gratisText ?? post.gratis_text;
      if ((post.gratisAntal ?? post.gratis_antal) > 0 && text(gratis)) ut[`paket.${post.handle}.gratis_text`] = gratis;
    }
    // Recensionerna: en delmängd översätts och importeras som EGNA
    // recensioner i målspråket (PROCESS.md fas 3). Subagenten får dem här;
    // de registreras aldrig i Shopify av oversattAllt.
    lista(p.reviews).slice(0, 6).forEach((r, i) => {
      if (text(r.titel)) ut[`recension.${h}.${i}.titel`] = r.titel;
      if (text(r.text)) ut[`recension.${h}.${i}.text`] = r.text;
      // Namnet står i startsidans omdömesslider (index.json omdomen.rN.name)
      // och är översättningsbart i Shopifys ögon. Samma namn på båda språken
      // = "samma ord", ingen läcka — men bara om nyckeln finns i underlaget
      // (AdventLane 2026-09-10: sex namn rapporterades som läckor på /nb).
      if (text(r.namn)) ut[`recension.${h}.${i}.namn`] = r.namn;
    });
  }

  // Kollektionen (flerprodukt), sidor, menyer — ur samma kontext som ops.mjs.
  const kollektion = ctx.kollektion ?? (butik.butik?.kollektion ? { handle: butik.butik.kollektion.handle, titel: butik.butik.kollektion.titel, beskrivning: butik.butik.kollektion.beskrivning } : null);
  if (arNischbutik(butik, ps) && kollektion?.handle) {
    ut[`kollektion.${kollektion.handle}.title`] = kollektion.titel ?? 'Sortimentet';
    if (text(kollektion.beskrivning)) ut[`kollektion.${kollektion.handle}.body_html`] = kollektion.beskrivning;
  }
  const policyer = ctx.policyer ?? (ps[0] ? byggPolicyer(ps[0]) : []);
  for (const s of policyer) {
    ut[`sida.${s.handle}.title`] = s.namn;
    ut[`sida.${s.handle}.body`] = s.body;
  }
  ut['sida.contact.title'] = 'Kontakt';
  if (ps[0]) ut['sida.contact.body'] = kontaktsida(ctx.p ?? ps[0]);
  const huvudmeny = ctx.huvudmenylankar ?? [
    ...(arNischbutik(butik, ps) && kollektion ? [{ titel: kollektion.titel ?? 'Sortimentet' }] : []),
    ...ps.map((p) => ({ titel: p.produkt.menynamn ?? p.produkt.namn })),
    { titel: 'Kontakt' },
  ];
  huvudmeny.forEach((l, i) => { ut[`meny.main-menu.${i}`] = l.titel; });
  const sidfot = ctx.menylankar ?? [...policyer.map((x) => ({ titel: x.namn })), { titel: 'Kontakt' }];
  sidfot.forEach((l, i) => { ut[`meny.footer.${i}`] = l.titel; });

  // Startsidan, sektionsgrupperna, temainställningarna — ur byggarna.
  const index = forsok('startsida.byggStartsida', () =>
    krav(startsida, 'startsida', 'byggStartsida')(butik, ps, { hero: ctx.hero ?? '', bilder: ctx.bilder ?? {}, kollektion: kollektion?.handle ?? 'sortimentet' })
  );
  if (index) Object.assign(ut, malltexter('index', index));
  const header = forsok('tema.byggHeaderGroup', () => krav(tema, 'tema', 'byggHeaderGroup')(butik));
  if (header) Object.assign(ut, malltexter('header', header));
  // Rubriken "Företaget" sätts av byggFooterGroup — den ska med i underlaget,
  // annars läcker den på /nb (AdventLane 2026-09-10).
  const tomFooter = { sections: { footer: { type: 'footer', blocks: { foretaget: { type: 'text', settings: {} } }, settings: {} } }, order: ['footer'] };
  const footer = forsok('startsida.byggFooterGroup', () => krav(startsida, 'startsida', 'byggFooterGroup')(JSON.stringify(tomFooter), butik));
  if (footer) Object.assign(ut, malltexter('footer', footer));
  const settings = forsok('tema.rensaSettings', () => krav(tema, 'tema', 'rensaSettings')({ current: {} }, {}));
  if (text(settings?.current?.brand_description)) ut['tema.settings.brand_description'] = settings.current.brand_description;
  // Temats fasta strängar som inte kommer ur konfigen (sidfotens rubriker,
  // Dela-knappen) — kunden ser dem, så de ska med.
  ut['tema.footer.snabblankar'] = 'Snabblänkar';
  ut['tema.footer.information'] = 'Information';
  ut['tema.footer.nyhetsbrev'] = 'Missa inga nyheter';
  ut['tema.share'] = 'Dela';
  // Produktmallens sticky köpknapp (product.json ms_sticky.label ur bas-zip:en)
  // och temats ENGELSKA defaults på mallar butiken inte skriver om (article,
  // list-collections, password) + Shopifys inbyggda kollektion "Home page".
  // Matchningen sker på VÄRDE, så källtexten här måste vara exakt den som
  // står i temat — därför engelska (AdventLane 2026-09-10, 14 läckor på /nb).
  // Produktmallens trust- och leveransrad är custom_liquid och locale-branchas
  // av tema.byggProduktTemplate ur nb['liquid.trust.<i>'] / 'liquid.delivery.*'
  // — inte via translationsRegister. Utan de här nycklarna står "Fri frakt"
  // och "ångerrätt" kvar på /nb (AdventLane 2026-09-10).
  const trust = forsok('tema.trustPunkter', () => krav(tema, 'tema', 'trustPunkter')(butik)) ?? [];
  trust.forEach((rad, i) => { ut[`liquid.trust.${i}`] = String(rad).split(':').slice(1).join(':'); });
  const dagar = forsok('tema.leveransdagar', () => krav(tema, 'tema', 'leveransdagar')(ps[0]?.leveranstid ?? butik?.frakt?.leveranstid));
  ut['liquid.delivery.text'] = 'Beräknad leverans';
  if (dagar?.min && dagar?.max) ut['liquid.delivery.dagar'] = `${dagar.min}–${dagar.max} arbetsdagar`;
  ut['tema.sticky'] = 'Köp nu';
  ut['tema.default.share'] = 'Share';
  ut['tema.default.collections'] = 'Collections';
  ut['tema.default.opening_soon'] = 'Opening soon';
  ut['tema.default.password_text'] = '<p>Be the first to know when we launch.</p>';
  ut['tema.default.home_page'] = 'Home page';

  if (varningar.length > 0) ut._varningar = varningar;
  return ut;
}

// Kontraktet: skriver output/<butik>/oversattning-sv.json och returnerar objektet.
export function byggUnderlag(ctx, produkter = ctx?.produkter ?? []) {
  const ut = byggUnderlagObjekt(ctx, produkter);
  const fil = underlagsfil(ctx.butik.butik.id, 'sv');
  mkdirSync(dirname(fil), { recursive: true });
  writeFileSync(fil, `${JSON.stringify(ut, null, 2)}\n`);
  return ut;
}

export function lasUnderlag(butikId) {
  const fil = underlagsfil(butikId, 'sv');
  return existsSync(fil) ? JSON.parse(readFileSync(fil, 'utf8')) : null;
}

// Översättningen för en locale: { locale, nb: {…}, sv: {…}|null } — null om
// <locale>-filen saknas (då stannar kedjan med "manuell: översätt").
export function lasOversattning(butikId, locale) {
  const fil = underlagsfil(butikId, locale);
  if (!existsSync(fil)) return null;
  return { locale, nb: JSON.parse(readFileSync(fil, 'utf8')), sv: lasUnderlag(butikId) };
}

// Samma kontext som ops.mjs bygger (byggButiksKontext) — för CLI:er som kör
// utanför kedjan. Policyer och kontaktsida ur FÖRSTA produkten: de bär bara
// bolagsuppgifter, som är lika för alla.
export function byggMinimalKontext(butik, rader) {
  const ps = rader.map((rad) => sammanfoga(butik, rad));
  const policyer = ps[0] ? byggPolicyer(ps[0]) : [];
  const kollektionHandle = butik?.butik?.kollektion?.handle ?? 'sortimentet';
  const kollektion = { handle: kollektionHandle, titel: butik?.butik?.kollektion?.titel ?? 'Sortimentet', beskrivning: butik?.butik?.kollektion?.beskrivning ?? '' };
  return {
    butik,
    p: ps[0] ?? null,
    produkter: ps.map((p) => ({ p, plan: krav(buildStore, 'build-store', 'byggPlan')(p, butik), metafalt: byggMetafalt(p, { kundUnderrubrik }) })),
    policyer,
    kollektion,
    huvudmenylankar: [
      ...(arNischbutik(butik, ps) ? [{ titel: kollektion.titel, url: `/collections/${kollektionHandle}` }] : []),
      ...ps.map((p) => ({ titel: p.produkt.menynamn ?? p.produkt.namn, url: `/products/${p.produkt.id}` })),
      { titel: 'Kontakt', url: '/pages/contact' },
    ],
    menylankar: [...policyer.map((x) => ({ titel: x.namn, url: `/pages/${x.handle}` })), { titel: 'Kontakt', url: '/pages/contact' }],
    shop: null,
  };
}

async function huvud() {
  const filer = process.argv.slice(2).filter((a) => !a.startsWith('--'));
  const [butiksfil, ...produktfiler] = filer;
  if (!butiksfil || produktfiler.length === 0) {
    console.error('Användning: node factory/oversattning.mjs factory/butiker/<butik>.yaml factory/produkter/<p>.yaml […]');
    process.exit(1);
  }
  const butik = lasYaml(readFileSync(butiksfil, 'utf8'));
  const ctx = byggMinimalKontext(butik, produktfiler.map((f) => lasYaml(readFileSync(f, 'utf8'))));
  const ut = byggUnderlag(ctx);
  const antal = Object.keys(ut).filter((k) => !k.startsWith('_')).length;
  console.log(`✅ ${antal} strängar → ${underlagsfil(butik.butik.id, 'sv')}`);
  for (const v of ut._varningar ?? []) console.log(`⚠️  ${v}`);
  console.log('Nästa: subagent (sonnet) översätter till oversattning-<locale>.json med samma nycklar, sedan node factory/marknad.mjs <butik-id>.');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  huvud().catch((e) => { console.error(`\n❌ ${e.message}\n`); process.exit(1); });
}
