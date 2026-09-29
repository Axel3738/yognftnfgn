#!/usr/bin/env node
// konkurrenter/kor.mjs — Konkurrentdödaren, motorn bakom /konkurrentdodaren.
//
//   node konkurrenter/kor.mjs --kolla
//        Nycklar, butiker, konton, Chromium, Ad Library — vad som går att läsa.
//   node konkurrenter/kor.mjs --fraser [--max N] [--verksamhet X] [--produkt handle]
//        Väljer dagens produkter (annonserade först, sedan rotation) och skriver
//        fingeravtrycken att söka på → output/<datum>.fraser.json. Sessionen
//        söker fraserna (WebSearch) och skriver output/<datum>.kandidater.json.
//   node konkurrenter/kor.mjs --hamta [--kandidater <fil>] [--bing] [--url <adress> [--produkt handle]] [--utan-bilder]
//        Läser kandidaterna (sessionens fil, Bing om --bing, Ad Library när
//        token:en får), hämtar varje sida, jämför text och bilder mot vårt,
//        tar skärmdump på träffarna → output/<datum>.json. Rör INTE minnet.
//   node konkurrenter/kor.mjs --rapport [--discord] [--torr]
//        Fynden → ärenden (arenden.jsonl, arenden/<id>.md, skärmdumpar),
//        lage.json, granskningssidan output/sida.html, svensk rapport,
//        engelsk Discord-post när något nytt finns.
//   node konkurrenter/kor.mjs --lista
//   node konkurrenter/kor.mjs --brev <id> [--sprak sv|en] [--paminnelse]
//   node konkurrenter/kor.mjs --skicka <id> [--ja] [--till adress] [--sprak sv|en] [--utkast] [--paminnelse]
//   node konkurrenter/kor.mjs --avfarda <id> "skäl"
//   node konkurrenter/kor.mjs --eskalera <id> ["not"]
//   node konkurrenter/kor.mjs --foljupp [--torr]
//   node konkurrenter/kor.mjs --sida
//
// ⛔ Rutinen skickar ALDRIG ett brev själv. `--skicka … --ja` skrivs av Axel.
// Exit: 0 klart · 1 fel · 3 Discord stoppad (svensk text) · 4 Discord misslyckades.

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, copyFileSync } from 'node:fs';
import { join, basename } from 'node:path';
import { säkerställProxy } from '../tools/meta-lib.mjs';
import { MAPP, DATAMAPP, ARENDEFIL, STATUS, lasArenden, sparaArende, nyttId, nyckelFor, hittaBefintligt, overgang, nyttArende, uppdateraFynd, sammanfatta, oppna } from './arenden.mjs';
import { hamtaProdukter, fingeravtryck, mallmeningar, hamtaEgnaAnnonser, valjProdukter, egnaDomaner, egnaSidor } from './korpus.mjs';
import { sokBing, sokAdLibrary, filtreraTraffar, arEgen, domanUr, adLibraryLank } from './sok.mjs';
import { hamtaKonkurrent } from './hamta.mjs';
import { jamforText, jamforBilder, sammanvag } from './likhet.mjs';
import { startaHashare, hashaLankar, Bildcache } from './bild.mjs';
import { byggBrev, kontrolleraBrev, valjSprak } from './brev.mjs';
import { skickaBrev, byggSandpaket, registreraSkickat } from './skicka.mjs';
import { byggFaktura, kontrolleraFaktura, fakturaHtml, fakturaPdf, skrivFakturaHtml, belopp, ibanGiltig } from './faktura.mjs';
import { hamtaCpm, valjCpm, cpmRad } from './cpm.mjs';
import { tolkaAnnonsinput, byggAnnonsfynd } from './annonsfall.mjs';
import { rapportSv, rapportEn, kallrader, arendeMd, KANAL_INTRO } from './rapport.mjs';
import { byggSida } from './sida.mjs';

säkerställProxy();

const args = process.argv.slice(2);
const har = (f) => args.includes(`--${f}`);
const flagga = (f, s = null) => { const i = args.indexOf(`--${f}`); return i !== -1 && args[i + 1] !== undefined && !String(args[i + 1]).startsWith('--') ? args[i + 1] : s; };
const logg = (s) => console.error(s);
const OUTPUT = join(DATAMAPP, 'output');
const ARENDEMAPP = join(DATAMAPP, 'arenden');
const LAGEFIL = join(DATAMAPP, 'lage.json');
const SIDAFIL = join(DATAMAPP, 'sida.json');

export const idagSthlm = (d = new Date()) => new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Stockholm' }).format(d);
const lasJson = (fil, reserv = null) => (existsSync(fil) ? JSON.parse(readFileSync(fil, 'utf8')) : reserv);
const skrivJson = (fil, data) => { mkdirSync(join(fil, '..'), { recursive: true }); writeFileSync(fil, JSON.stringify(data, null, 2)); };
const slug = (s) => String(s ?? '').toLowerCase().replace(/[åä]/g, 'a').replace(/ö/g, 'o').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'x';
const antalOrd = (t) => String(t ?? '').split(/\s+/).filter(Boolean).length;

function konfig() { return JSON.parse(readFileSync(join(MAPP, 'konfig.json'), 'utf8')); }
function lasLage() { return lasJson(LAGEFIL, { senast_korning: null, kollade: {} }); }

/**
 * Avsändaren. Standard (Axels beslut 2026-09-29): bolagets Stonebite-mejl via
 * Gmail-connectorn i sessionen (konfig → brev.avsandare). Reserv `--via loopia`:
 * verksamhetens supportbrevlåda (kundtjanst/brands, kräver KUNDTJANST_MAIL_PASS_<ID>).
 */
async function avsandareFor(verksamhet, k, { via = null } = {}) {
  const v = k.verksamheter[verksamhet];
  const valdVia = String(via ?? k.brev.avsandare?.via ?? 'gmail').toLowerCase();
  if (valdVia !== 'loopia') {
    const mail = k.brev.avsandare?.mail ?? null;
    return { via: 'gmail', brand: null, namn: verksamhet, mail, butikUrl: v?.butiker?.[0] ?? null, konfigurerad: Boolean(mail), saknas: mail ? [] : ['brev.avsandare.mail i konkurrenter/konfig.json'] };
  }
  if (!v) return { via: 'loopia', brand: null, mail: null, butikUrl: null, saknas: [`okänd verksamhet ${verksamhet}`] };
  const { upptackBrands, korkonfig } = await import('../kundtjanst/brands.mjs');
  const brand = upptackBrands().find((b) => b.id === v.avsandare);
  const kk = brand ? korkonfig(brand) : null;
  return { via: 'loopia', brand: v.avsandare, namn: verksamhet, mail: kk?.mail?.user ?? null, butikUrl: v.butiker?.[0] ?? null, konfigurerad: Boolean(kk?.mail?.konfigurerad), saknas: kk ? kk.mail.saknas : [`ingen brandfil för ${v.avsandare}`] };
}

// ------------------------------------------------------------------ korpus

async function byggKorpus(k, { bara = null, produktFilter = null, max = null, lage = lasLage(), medAnnonser = true }) {
  const ut = []; const status = { butiker: [], annonser: [] };
  const allaProdukter = []; const allaAnnonser = [];
  for (const [namn, v] of Object.entries(k.verksamheter)) {
    if (bara && bara.toLowerCase() !== namn.toLowerCase()) continue;
    let produkter = [];
    for (const butik of v.butiker ?? []) {
      try { const p = await hamtaProdukter(butik, { logg }); produkter.push(...p); status.butiker.push({ butik, produkter: p.length }); }
      catch (e) { status.butiker.push({ butik, fel: e.message }); logg(`  ⚠️ ${butik}: ${e.message}`); }
    }
    let annonser = [];
    if (medAnnonser && process.env.META_ACCESS_TOKEN && (v.konton ?? []).length) {
      const r = await hamtaEgnaAnnonser(v.konton, { logg });
      annonser = r.annonser; status.annonser.push(...r.status.map((s) => ({ ...s, verksamhet: namn })));
    }
    const annonserade = new Set(annonser.map((a) => a.handle).filter(Boolean));
    let valda = produktFilter
      ? produkter.filter((p) => p.handle === produktFilter.toLowerCase())
      : valjProdukter({ produkter, annonserade, bevaka: k.bevaka?.[namn] ?? [], lage, max: max ?? k.sok.max_produkter_per_korning, kollaOmDagar: k.sok.kolla_om_dagar });
    const undvik = [namn, ...(v.butiker ?? []).map((b) => domanUr(b)), ...(k.generiska_fraser ?? [])].filter(Boolean);
    const boilerplate = mallmeningar(produkter);
    for (const p of valda) {
      ut.push({ verksamhet: namn, ...p, annonser: annonser.filter((a) => a.handle === p.handle).slice(0, 6), fraser: fingeravtryck(p.text, { minOrd: k.sok.min_ord, maxOrd: k.sok.max_ord, antal: k.sok.fraser_per_produkt, undvik, boilerplate }), ordITexten: antalOrd(p.text) });
    }
    logg(`  ${namn}: ${produkter.length} produkter, ${annonser.length} aktiva annonser, ${valda.length} valda`);
    allaProdukter.push(...produkter.map((p) => ({ verksamhet: namn, ...p })));
    allaAnnonser.push(...annonser.map((a) => ({ verksamhet: namn, ...a })));
  }
  return { produkter: ut, status, allaProdukter, allaAnnonser };
}

/**
 * Ärende ur konkurrentens ANNONSER (Axels fall 2026-09-29): `--annonser <fil>`
 * med deras annonstexter/länkar/bilder (formatet i annonsfall.mjs). Jämförs mot
 * ALLA våra annonser och produkttexter, bilderna hashas, deras sida läses för
 * kontaktuppgifter. Skriver output/<datum>.json som en vanlig hämtning.
 */
async function hamtaAnnonser(k, fil) {
  const idag = flagga('idag') ?? idagSthlm();
  const nu = new Date().toISOString();
  const egna = egnaDomaner(k);
  const input = tolkaAnnonsinput(lasJson(fil) ?? (() => { throw new Error(`${fil} finns inte eller är inte JSON.`); })());
  if (input.deras.doman && arEgen(input.deras.doman, egna)) throw new Error(`${input.deras.doman} är en av våra egna domäner.`);
  const { allaProdukter, allaAnnonser, status } = await byggKorpus(k, { max: 10_000 });
  const korning = { sok: { produkter: allaProdukter.length, annonser: allaAnnonser.length }, annonsfil: basename(fil), adLibrary: { status: 'ej_provad' }, bilder: { status: null }, fel: [], egnaAnnonser: { fel: status.annonser.filter((s) => s.fel) } };
  let hashare = null; const cache = new Bildcache(join(OUTPUT, 'bildcache.json'));
  const derasHashar = new Map(); const egnaHashar = new Map();
  const derasBilder = input.annonser.flatMap((a) => a.bilder);
  let sida = null;
  if (input.deras.url) { sida = await hamtaKonkurrent(input.deras.url, { logg, egna }); if (!sida.ok) { korning.fel.push(`${input.deras.url}: ${sida.fel ?? sida.status}`); sida = null; } }
  const jamfor = () => byggAnnonsfynd(input, { egnaAnnonser: allaAnnonser, egnaProdukter: allaProdukter, konfig: k, derasHashar, egnaHashar, sida, nu, kalla: 'axel-annonser' });
  // Första passet på text ensam pekar ut vilka av våra produkter/annonser som är
  // träffade — deras bilder hashas i sin helhet, våra i ordningen: träffade
  // produkters bilder, träffade annonsers bilder, ALLA våra annonsbilder (en
  // kopierad annons behöver inte ha kopierad text), aldrig hela produktkatalogen.
  const forsta = jamfor();
  if (derasBilder.length && !har('utan-bilder')) {
    try {
      hashare = await startaHashare({ logg }); korning.bilder = { status: 'ok', hashade: 0 };
      const t0 = Date.now();
      const d = await hashaLankar(derasBilder, { hashare, cache, logg, max: 60 }); for (const [u, v] of d.hashar) derasHashar.set(u, v);
      const traffade = forsta?.bevis.annonser ?? [];
      const egnaLankar = [...new Set([
        ...(forsta?.var.produkt?.bilder ?? []),
        ...traffade.flatMap((t) => allaProdukter.find((p) => p.handle === t.varAnnons?.id)?.bilder ?? []),
        ...traffade.map((t) => allaAnnonser.find((x) => x.id === t.varAnnons?.id)?.bild).filter(Boolean),
        ...allaAnnonser.map((a) => a.bild).filter(Boolean),
      ])];
      const e = await hashaLankar(egnaLankar, { hashare, cache, logg, max: 1500 }); for (const [u, v] of e.hashar) egnaHashar.set(u, v);
      korning.bilder.hashade = d.hashar.size + e.hashar.size; korning.bilder.ms = Date.now() - t0;
      logg(`  ${korning.bilder.hashade} bilder hashade (${derasHashar.size} deras, ${egnaHashar.size} våra) på ${Math.round(korning.bilder.ms / 1000)} s`);
    } catch (e) { korning.bilder = { status: 'saknas', orsak: e.message }; logg(`  ⚠️ ${e.message}`); }
  } else korning.bilder = { status: 'av', orsak: derasBilder.length ? '--utan-bilder' : 'inga bilder i annonsfilen' };
  const fynd = derasHashar.size ? jamfor() : forsta;
  const miniatyrer = {};
  if (fynd && hashare) {
    const behov = [...new Set([fynd.var.annons?.bild, fynd.var.produkt?.bilder?.[0], ...fynd.bevis.bilder.flatMap((b) => [b.egen, b.deras])].filter(Boolean))].slice(0, 12);
    const m = await hashaLankar(behov, { hashare, cache: null, medMiniatyr: true, logg });
    for (const [u, v] of m.hashar) if (v.miniatyr) miniatyrer[u] = v.miniatyr;
    fynd.miniatyrer = miniatyrer;
  }
  cache.spara();
  if (hashare) await hashare.stang();
  const ut = { datum: idag, hamtad: nu, korning, produkter: [], kandidater: [{ url: input.deras.url, doman: input.deras.doman, kallor: ['axel-annonser'], produkter: [] }], fynd: fynd ? [fynd] : [], underTroskeln: fynd ? [] : [{ url: input.deras.url, doman: input.deras.doman, produkt: 'annonser', tackning: 0, langsta: 0, bilder: 0 }] };
  skrivJson(join(OUTPUT, `${idag}.json`), ut);
  if (fynd) {
    console.log(`Klart: ${input.annonser.length} annonser lästa → ${fynd.styrka.toUpperCase()}: ${fynd.skal.join('; ')} → konkurrenter/output/${idag}.json`);
    for (const t of fynd.bevis.annonser) console.log(`  annons ${t.nr}${t.lank ? ` (${t.lank})` : ''}: ${t.text ? `${t.text.langsta} ord i följd ur ${t.varAnnons?.namn ?? 'produkttexten'}` : 'ingen text-träff'}${t.bilder.length ? ` · ${t.bilder.length} bild(er)` : ''}`);
  } else console.log(`Klart: ${input.annonser.length} annonser lästa, ingen över tröskeln — jämför texterna själv; deras bilder kan behöva skärmdumpar (bilder i filen).`);
  if (korning.bilder.status !== 'ok') console.log(`  Bilder: ${korning.bilder.orsak ?? korning.bilder.status}`);
}

async function fraser() {
  const k = konfig();
  const idag = flagga('idag') ?? idagSthlm();
  const { produkter, status } = await byggKorpus(k, { bara: flagga('verksamhet'), produktFilter: flagga('produkt'), max: flagga('max') ? Number(flagga('max')) : null });
  const al = process.env.META_ACCESS_TOKEN ? await sokAdLibrary(produkter[0]?.titel ?? 'taköverdrag', { lander: k.ad_library.lander, egnaSidor: egnaSidor() }) : { status: 'saknar_token' };
  const ut = {
    datum: idag, skapad: new Date().toISOString(),
    produkter: produkter.map((p) => ({ verksamhet: p.verksamhet, butik: p.butik, handle: p.handle, titel: p.titel, url: p.url, prioriterad: p.prioriterad, ordITexten: p.ordITexten, fraser: p.fraser, annonser: p.annonser.length })),
    utanFraser: produkter.filter((p) => !p.fraser.length).map((p) => ({ handle: p.handle, orsak: p.ordITexten < 40 ? `för lite text att söka på (${p.ordITexten} ord)` : `ingen sökbar mening (${p.ordITexten} ord, men alla meningar bär siffror, butiksnamn eller mall)` })),
    adLibrary: { status: al.status, fel: al.fel ?? null },
    status,
  };
  skrivJson(join(OUTPUT, `${idag}.fraser.json`), ut);
  if (har('json')) { console.log(JSON.stringify(ut, null, 2)); return; }
  console.log(`Fraser att söka (${ut.produkter.reduce((s, p) => s + p.fraser.length, 0)} st, ${ut.produkter.length} produkter) → konkurrenter/output/${idag}.fraser.json`);
  for (const p of ut.produkter) {
    console.log(`\n${p.verksamhet} · ${p.handle}${p.prioriterad ? ' (annonseras)' : ''}`);
    for (const f of p.fraser) console.log(`  "${f}"`);
    if (!p.fraser.length) console.log(`  (${p.ordITexten < 40 ? 'för lite text' : 'ingen sökbar mening'}: ${p.ordITexten} ord)`);
  }
  console.log(`\nAd Library: ${al.status}${al.fel ? ` — ${al.fel}` : ''}`);
  console.log(`\nSkriv kandidaterna till konkurrenter/output/${idag}.kandidater.json som {"kandidater":[{"fras":"…","url":"…","titel":"…"}]} och kör --hamta.`);
}

// ------------------------------------------------------------------ hämta + jämför

function jamforMotProdukt(p, kand, { k, derasHashar, egnaHashar }) {
  const text = kand.text && p.text ? jamforText(p.text, kand.text, { trosklar: k.trosklar.text, generiska: k.generiska_fraser }) : null;
  let annons = null; let annonsRad = null;
  for (const a of p.annonser ?? []) {
    if (!a.text || antalOrd(a.text) < 6 || !kand.text) continue;
    const j = jamforText(a.text, kand.text, { trosklar: { ...k.trosklar.text, min_passage: 6, trolig_langsta: 7 }, generiska: k.generiska_fraser });
    if (!annons || j.langsta > annons.langsta) { annons = j; annonsRad = a; }
  }
  const egna = (p.bilder ?? []).map((u) => ({ url: u, hash: egnaHashar.get(u)?.hash })).filter((x) => x.hash);
  const deras = (kand.bilder ?? []).map((u) => ({ url: u, hash: derasHashar.get(u)?.hash })).filter((x) => x.hash);
  const bilder = jamforBilder(egna, deras, k.trosklar.bild);
  const v = sammanvag({ text, annons, bilder });
  return { text, annons: annons?.styrka ? annons : null, annonsRad: annons?.styrka ? annonsRad : null, bilder, ...v };
}

async function hamta() {
  const k = konfig();
  if (flagga('annonser')) return hamtaAnnonser(k, flagga('annonser'));
  const idag = flagga('idag') ?? idagSthlm();
  const nu = new Date().toISOString();
  const egna = egnaDomaner(k);
  const lage = lasLage();
  const fraserFil = join(OUTPUT, `${idag}.fraser.json`);
  const korning = { sok: { produkter: 0 }, bing: { fraser: 0, traffar: 0, kandidater: 0, fel: [] }, adLibrary: { status: null }, bilder: { status: null }, fel: [], egnaAnnonser: { fel: [] } };

  // Korpus: samma urval som --fraser (samma dag ⇒ samma produkter), eller bara en produkt/en länk.
  const bara = flagga('verksamhet'); const produktFilter = flagga('produkt');
  const { produkter, status } = await byggKorpus(k, { bara, produktFilter, max: har('url') && !produktFilter ? 10_000 : (flagga('max') ? Number(flagga('max')) : null), lage });
  korning.sok.produkter = produkter.length;
  korning.sok.fraser = produkter.reduce((s, p) => s + p.fraser.length, 0);
  korning.egnaAnnonser.fel = status.annonser.filter((s) => s.fel);

  // Kandidaterna: sessionens fil (WebSearch), Bing (opt-in, ger skräp från containrar — mätt 2026-09-27), en egen länk (--url), Ad Library.
  const kandidater = []; // { url, fras, kalla, produkter: [p] }
  const laggTill = (url, { fras = null, kalla, produkt = null, titel = null }) => {
    const d = domanUr(url);
    if (!d) return;
    if (arEgen(d, egna)) return;
    let rad = kandidater.find((x) => x.url.replace(/[?#].*$/, '') === url.replace(/[?#].*$/, ''));
    if (!rad) { rad = { url, doman: d, fraser: [], kallor: new Set(), produkter: new Map(), titel }; kandidater.push(rad); }
    if (fras) rad.fraser.push(fras);
    rad.kallor.add(kalla);
    const mal = produkt ? [produkt] : produkter.filter((p) => p.fraser.includes(fras));
    for (const p of mal) rad.produkter.set(`${p.butik}|${p.handle}`, p);
  };

  const kandFil = flagga('kandidater') ?? (existsSync(join(OUTPUT, `${idag}.kandidater.json`)) ? join(OUTPUT, `${idag}.kandidater.json`) : null);
  if (kandFil) {
    const kf = lasJson(kandFil, { kandidater: [] });
    const rader = Array.isArray(kf) ? kf : (kf.kandidater ?? []);
    for (const r of rader) {
      if (!r?.url) continue;
      const p = r.handle ? produkter.find((x) => x.handle === String(r.handle).toLowerCase() && (!r.butik || x.butik === r.butik)) : null;
      laggTill(r.url, { fras: r.fras ?? null, kalla: 'websearch', produkt: p, titel: r.titel ?? null });
    }
    korning.websearch = { fil: basename(kandFil), rader: rader.length, orsak: kf.orsak ?? null };
    logg(`  kandidater ur ${basename(kandFil)}: ${rader.length} rader`);
  }
  if (har('bing')) {
    for (const p of produkter) for (const fras of p.fraser) {
      korning.bing.fraser++;
      const s = await sokBing(fras, { antal: k.sok.traffar_per_fras });
      if (s.fel) { korning.bing.fel.push(`${fras}: ${s.fel}`); continue; }
      const f = filtreraTraffar(s.traffar, { egna, ignorera: k.ignorera_domaner });
      korning.bing.traffar += s.traffar.length;
      for (const t of f.kvar.slice(0, k.sok.max_kandidater_per_produkt)) laggTill(t.url, { fras, kalla: 'bing', produkt: p, titel: t.titel });
      await new Promise((r) => setTimeout(r, k.sok.paus_ms));
    }
  }
  if (har('url')) {
    const u = flagga('url');
    if (!u) throw new Error('--url kräver en adress.');
    const p = produktFilter ? produkter.find((x) => x.handle === produktFilter.toLowerCase()) : null;
    if (produktFilter && !p) throw new Error(`Produkten ${produktFilter} finns inte i butikerna.`);
    if (arEgen(domanUr(u), egna)) throw new Error(`${u} är en av våra egna adresser.`);
    // Ingen produkt angiven ⇒ jämför mot ALLA (bästa träffen vinner)
    const d = domanUr(u);
    if (d) { const rad = { url: u, doman: d, fraser: [], kallor: new Set(['axel']), produkter: new Map(), titel: null }; if (p) rad.produkter.set(`${p.butik}|${p.handle}`, p); else for (const x of produkter) rad.produkter.set(`${x.butik}|${x.handle}`, x); kandidater.push(rad); }
  }

  // Ad Library (annonser, inte sidor): en sökterm per produkt (titeln utan mått).
  const adFynd = [];
  if (process.env.META_ACCESS_TOKEN && !har('url')) {
    const egnaSid = egnaSidor();
    let status = null; let termer = 0; let antal = 0;
    for (const p of produkter) {
      const term = p.titel.replace(/[–—-].*$/, '').replace(/\d[\d,.×x ]*\s*(cm|m|mm|l|kg|st|pack|-pack)?/gi, '').replace(/\s+/g, ' ').trim().split(' ').slice(0, 4).join(' ');
      if (!term) continue;
      const r = await sokAdLibrary(term, { lander: k.ad_library.lander, egnaSidor: egnaSid });
      status = r.status; termer++;
      if (r.status !== 'ok') { korning.adLibrary = { status: r.status, fel: r.fel, hjalp: r.hjalp }; break; }
      antal += r.annonser.length;
      for (const a of r.annonser) {
        const text = [...a.texter, ...a.rubriker].join('\n');
        if (antalOrd(text) < 6) continue;
        const j = jamforMotProdukt(p, { text, bilder: [] }, { k, derasHashar: new Map(), egnaHashar: new Map() });
        if (!j.styrka) continue;
        adFynd.push({ produkt: p, annons: a, jamforelse: j, term });
      }
      await new Promise((r) => setTimeout(r, 400));
    }
    if (status === 'ok') korning.adLibrary = { status: 'ok', termer, annonser: antal };
    if (!status) korning.adLibrary = { status: 'inga_termer' };
  } else if (!process.env.META_ACCESS_TOKEN) korning.adLibrary = { status: 'saknar_token' };

  logg(`  ${kandidater.length} kandidatsidor att läsa`);

  // Chromium för bilder + skärmdumpar (frivilligt: utan den jämförs bara text).
  let hashare = null; const cache = new Bildcache(join(OUTPUT, 'bildcache.json'));
  if (!har('utan-bilder')) {
    try { hashare = await startaHashare({ logg }); korning.bilder = { status: 'ok', hashade: 0 }; }
    catch (e) { korning.bilder = { status: 'saknas', orsak: e.message }; logg(`  ⚠️ ${e.message}`); }
  } else korning.bilder = { status: 'av', orsak: '--utan-bilder' };

  const fynd = []; const underTroskeln = []; const egnaHashar = new Map();
  const hashaEgna = async (p) => {
    if (!hashare) return;
    const r = await hashaLankar((p.bilder ?? []).slice(0, 12), { hashare, cache, logg });
    for (const [u, v] of r.hashar) egnaHashar.set(u, v);
    korning.bilder.hashade += r.hashar.size;
  };

  for (const kand of kandidater) {
    const sida = await hamtaKonkurrent(kand.url, { logg, egna });
    if (!sida.ok) { korning.fel.push(`${kand.url}: ${sida.fel ?? `HTTP ${sida.status}`}`); continue; }
    korning.bing.kandidater++;
    if (arEgen(sida.doman, egna)) continue;
    let derasHashar = new Map();
    if (hashare) { const r = await hashaLankar(sida.bilder.slice(0, 24), { hashare, cache, logg }); derasHashar = r.hashar; korning.bilder.hashade += r.hashar.size; }
    let basta = null;
    for (const p of kand.produkter.values()) {
      await hashaEgna(p);
      const j = jamforMotProdukt(p, sida, { k, derasHashar, egnaHashar });
      const poang = (j.styrka === 'stark' ? 2 : j.styrka === 'trolig' ? 1 : 0) * 1000 + (j.text?.langsta ?? 0) + (j.annons?.langsta ?? 0) + j.bilder.length * 10 + Math.round((j.text?.tackning ?? 0) * 100);
      if (!basta || poang > basta.poang) basta = { p, j, poang };
    }
    if (!basta) continue;
    const { p, j } = basta;
    if (!j.styrka) { underTroskeln.push({ url: kand.url, doman: sida.doman, produkt: p.handle, tackning: j.text?.tackning ?? 0, langsta: j.text?.langsta ?? 0, bilder: j.bilder.length }); continue; }
    // Skärmdump + miniatyrer för just den här träffen.
    let skarmdump = null; const miniatyrer = {};
    if (hashare) {
      const fil = join(OUTPUT, 'skarmdumpar', idag, `${slug(sida.doman)}-${slug(p.handle)}.jpg`);
      const sd = await hashare.skarmdump(sida.slutUrl || kand.url, fil);
      if (sd.fil) skarmdump = { fil: fil.replace(`${DATAMAPP}/`, ''), nar: sd.nar, titel: sd.titel };
      const behov = [...new Set([p.bilder?.[0], ...j.bilder.flatMap((b) => [b.egen, b.deras]), sida.bilder?.[0]].filter(Boolean))].slice(0, 12);
      const m = await hashaLankar(behov, { hashare, cache: null, medMiniatyr: true, logg });
      for (const [u, v] of m.hashar) if (v.miniatyr) miniatyrer[u] = v.miniatyr;
    }
    fynd.push({
      nyckel: nyckelFor({ typ: 'webb', doman: sida.doman, handle: p.handle }),
      verksamhet: p.verksamhet, typ: 'webb', kalla: [...kand.kallor].join('+'),
      var: { produkt: { handle: p.handle, titel: p.titel, url: p.url, butik: p.butik, bilder: (p.bilder ?? []).slice(0, 12), pris: p.pris }, annons: j.annonsRad ? { id: j.annonsRad.id, namn: j.annonsRad.namn, bild: j.annonsRad.bild } : null },
      deras: { url: kand.url, slutUrl: sida.slutUrl, doman: sida.doman, titel: sida.titel, lang: sida.lang, plattform: sida.plattform, epost: sida.epost, orgnr: sida.orgnr, kontakt: sida.kontakt, mottagare: sida.mottagare, bilder: sida.bilder.slice(0, 6), produkt: sida.produkt ? { titel: sida.produkt.titel, pris: sida.produkt.pris, saljare: sida.produkt.saljare } : null },
      bevis: { text: j.text, annons: j.annons, bilder: j.bilder, skarmdump, derasText: String(sida.text ?? '').slice(0, 6000), nar: nu },
      styrka: j.styrka, skal: j.skal, skalEn: j.skalEn, miniatyrer,
    });
    logg(`  ✔ ${sida.doman} ← ${p.handle}: ${j.styrka} (${j.skal.join('; ')})`);
  }

  // Ad Library-fynden: motpartens webbplats ur länkdomänen, om den finns.
  for (const f of adFynd) {
    const doman = f.annons.domaner[0] ?? null;
    let sida = null;
    if (doman && !arEgen(doman, egna)) sida = await hamtaKonkurrent(`https://${doman}`, { logg, egna, maxKontaktsidor: 4 });
    fynd.push({
      nyckel: nyckelFor({ typ: 'annons', sidaId: f.annons.sidaId, handle: f.produkt.handle }),
      verksamhet: f.produkt.verksamhet, typ: 'annons', kalla: 'adlibrary',
      var: { produkt: { handle: f.produkt.handle, titel: f.produkt.titel, url: f.produkt.url, butik: f.produkt.butik, bilder: (f.produkt.bilder ?? []).slice(0, 6) }, annons: f.jamforelse.annonsRad ? { id: f.jamforelse.annonsRad.id, namn: f.jamforelse.annonsRad.namn } : null },
      deras: { url: doman ? `https://${doman}` : null, snapshot: f.annons.snapshot, sidaId: f.annons.sidaId, sidnamn: f.annons.sidnamn, domaner: f.annons.domaner, start: f.annons.start, lang: sida?.lang ?? null, plattform: sida?.plattform ?? null, epost: sida?.epost ?? [], orgnr: sida?.orgnr ?? [], kontakt: sida?.kontakt ?? { epost: [], kallor: [] }, mottagare: sida?.mottagare ?? null, doman },
      bevis: { text: f.jamforelse.text, annons: f.jamforelse.annons, bilder: [], derasText: [...f.annons.texter, ...f.annons.rubriker].join('\n').slice(0, 6000), nar: nu, term: f.term, adLibraryLank: adLibraryLank(f.term, k.ad_library.lander[0]) },
      styrka: f.jamforelse.styrka, skal: f.jamforelse.skal, skalEn: f.jamforelse.skalEn, miniatyrer: {},
    });
  }

  cache.spara();
  if (hashare) await hashare.stang();
  const ut = { datum: idag, hamtad: nu, korning, produkter: produkter.map((p) => ({ verksamhet: p.verksamhet, butik: p.butik, handle: p.handle, fraser: p.fraser })), kandidater: kandidater.map((c) => ({ url: c.url, doman: c.doman, kallor: [...c.kallor], produkter: [...c.produkter.keys()] })), fynd, underTroskeln };
  skrivJson(join(OUTPUT, `${idag}.json`), ut);
  console.log(`Klart: ${kandidater.length} kandidater lästa, ${fynd.length} fynd över tröskeln (${fynd.filter((f) => f.styrka === 'stark').length} starka), ${underTroskeln.length} under. → konkurrenter/output/${idag}.json`);
  for (const f of fynd) console.log(`  ${f.styrka.toUpperCase()} ${f.var.produkt.handle} ← ${f.deras.doman ?? f.deras.sidnamn}: ${f.skal.join('; ')}`);
  if (korning.adLibrary?.status === 'saknar_behorighet') console.log('  Ad Library: saknar behörighet (Axels verifiering hos Meta).');
  if (korning.bilder?.status !== 'ok') console.log(`  Bilder ej jämförda: ${korning.bilder?.orsak ?? ''}`);
}

// ------------------------------------------------------------------ rapport

function senasteOutput() {
  if (!existsSync(OUTPUT)) return null;
  const f = readdirSync(OUTPUT).filter((x) => /^\d{4}-\d{2}-\d{2}\.json$/.test(x)).sort().at(-1);
  return f ? f.slice(0, 10) : null;
}

function miniatyrerFor(id) { return lasJson(join(ARENDEMAPP, id, 'miniatyrer.json'), {}); }

function skrivArendefiler(a, { miniatyrer = null, skarmdumpKalla = null } = {}) {
  mkdirSync(join(ARENDEMAPP, a.id), { recursive: true });
  writeFileSync(join(ARENDEMAPP, `${a.id}.md`), arendeMd(a));
  if (miniatyrer && Object.keys(miniatyrer).length) {
    const gamla = miniatyrerFor(a.id);
    skrivJson(join(ARENDEMAPP, a.id, 'miniatyrer.json'), { ...gamla, ...miniatyrer });
  }
  if (skarmdumpKalla && existsSync(skarmdumpKalla)) copyFileSync(skarmdumpKalla, join(ARENDEMAPP, a.id, 'skarmdump.jpg'));
}

async function byggSidaFil({ k, arenden, korning = {}, datum = null }) {
  const alla = [...arenden.values()];
  const brevCache = new Map();
  const brevtext = (a) => {
    if (brevCache.has(a.id)) return brevCache.get(a.id);
    let b = null;
    try { b = byggBrev(a, { avsandare: { brand: a.verksamhet, mail: a.brev?.fran ?? '', butikUrl: k.verksamheter[a.verksamhet]?.butiker?.[0] ?? '' }, foretag: k.brev.foretag, fristTimmar: k.brev.svarsfrist_timmar, mottagare: a.brev?.mottagare ?? null }); } catch { b = null; }
    brevCache.set(a.id, b); return b;
  };
  const mini = new Map();
  for (const a of alla) { const m = miniatyrerFor(a.id); for (const [u, d] of Object.entries(m)) mini.set(u, d); }
  const skarmdump = (a) => { const f = join(ARENDEMAPP, a.id, 'skarmdump.jpg'); return existsSync(f) ? `data:image/jpeg;base64,${readFileSync(f).toString('base64')}` : null; };
  const html = byggSida({ arenden: alla, datum, korning, kallrader: kallrader(korning), miniatyr: (u) => mini.get(u) ?? null, skarmdump, brevtext });
  mkdirSync(OUTPUT, { recursive: true });
  writeFileSync(join(OUTPUT, 'sida.html'), html);
  return join(OUTPUT, 'sida.html');
}

async function rapport() {
  const k = konfig();
  const datum = flagga('idag') ?? senasteOutput();
  if (!datum) throw new Error('konkurrenter/output/ har ingen hämtning — kör --hamta först.');
  const data = lasJson(join(OUTPUT, `${datum}.json`));
  if (!data) throw new Error(`konkurrenter/output/${datum}.json saknas — kör --hamta först.`);
  const torr = har('torr');
  const nu = new Date().toISOString();
  const arenden = lasArenden(ARENDEFIL, { logg });
  const sidaUrl = lasJson(SIDAFIL, {})?.url ?? null;
  const nya = []; const uppdaterade = [];
  const skrivningar = [];
  for (const f of data.fynd ?? []) {
    const bef = hittaBefintligt(arenden, f.nyckel);
    const avs = await avsandareFor(f.verksamhet, k);
    const sprakBrev = byggBrev({ ...f, id: 'KD-?', skapad: nu }, { avsandare: { brand: f.verksamhet, mail: avs.mail ?? '', butikUrl: avs.butikUrl ?? '' }, foretag: k.brev.foretag, fristTimmar: k.brev.svarsfrist_timmar });
    const brev = { sprak: sprakBrev.sprak, mottagare: f.deras.mottagare ?? null, fran: avs.mail ?? null, brand: avs.brand, skickat: null };
    if (bef && bef.status !== STATUS.ATGARDAD) {
      const upp = uppdateraFynd(bef, { deras: f.deras, bevis: f.bevis, styrka: f.styrka, skal: f.skal, skalEn: f.skalEn, nu });
      if (!upp.brev?.mottagare && brev.mottagare) upp.brev = { ...upp.brev, mottagare: brev.mottagare };
      arenden.set(upp.id, upp); uppdaterade.push(upp); skrivningar.push({ a: upp, f });
      continue;
    }
    const id = nyttId(arenden, new Date(nu));
    const a = nyttArende({ id, nyckel: f.nyckel, verksamhet: f.verksamhet, typ: f.typ, var: f.var, deras: f.deras, bevis: f.bevis, styrka: f.styrka, skal: f.skal, skalEn: f.skalEn, brev, nu });
    a.kalla = f.kalla;
    if (bef?.status === STATUS.ATGARDAD) a.historik.push({ nar: nu, fran: null, till: STATUS.NY, av: 'rutinen', not: `kopian är tillbaka — tidigare ärende ${bef.id}` });
    arenden.set(id, a); nya.push(a); skrivningar.push({ a, f });
  }

  // Uppföljningsläget för rapporten
  const alla = [...arenden.values()];
  const pamindKlara = alla.filter((a) => a.status === STATUS.SKICKAD && a.uppfoljning?.kvar && a.brev?.frist && Date.parse(a.brev.frist) < Date.now());
  const atgardade = alla.filter((a) => a.status === STATUS.ATGARDAD && a.uppfoljning?.nar && a.uppfoljning.nar.slice(0, 10) === datum);
  const text = rapportSv({ datum, korning: data.korning, nya, uppdaterade, oppna: oppna(arenden), sidaUrl, atgardade, pamindKlara });
  console.log(text);
  if (torr) { console.log('\n(--torr: inget skrivet, inget postat)'); return; }

  // Minnet: ärenden, filer, läge, sida.
  for (const { a, f } of skrivningar) {
    sparaArende(a, ARENDEFIL, { nu });
    skrivArendefiler(a, { miniatyrer: f.miniatyrer ?? null, skarmdumpKalla: f.bevis?.skarmdump?.fil ? join(DATAMAPP, f.bevis.skarmdump.fil) : null });
  }
  const lage = lasLage();
  for (const p of data.produkter ?? []) lage.kollade[`${p.butik}|${p.handle}`] = nu;
  lage.senast_korning = nu; lage.senaste_datum = datum;
  lage.ad_library = data.korning?.adLibrary?.status ?? null;
  skrivJson(LAGEFIL, lage);
  const sidaFil = await byggSidaFil({ k, arenden, korning: data.korning, datum });
  console.log(`\nGranskningssidan: ${sidaFil}${sidaUrl ? ` → publicera om på ${sidaUrl}` : ' → publicera som artifact och spara länken i konkurrenter/sida.json {"url": "…"}'}`);

  if (har('discord')) {
    const postatFil = join(OUTPUT, `${datum}.postat.json`);
    const postat = lasJson(postatFil, {});
    const perV = new Map();
    for (const a of nya) { if (!perV.has(a.verksamhet)) perV.set(a.verksamhet, []); perV.get(a.verksamhet).push(a); }
    for (const a of pamindKlara) { if (!perV.has(a.verksamhet)) perV.set(a.verksamhet, []); }
    let exit = 0;
    for (const [v, lista] of perV) {
      if (postat[v]) continue;
      if (k.discord.hoppa?.[v]) { logg(`  Discord ${v}: hoppas — ${k.discord.hoppa[v]}`); continue; }
      const en = rapportEn({ datum, nya: lista, pamindKlara: pamindKlara.filter((a) => a.verksamhet === v), sidaUrl });
      if (!en) continue;
      try { const r = await postaDiscord(v, en, k); postat[v] = { nar: nu, ...r }; skrivJson(postatFil, postat); logg(`  Discord ${v}: postat i #${r.kanal}`); }
      catch (e) { logg(`  ⚠️ Discord ${v}: ${e.message}`); exit = e.exit ?? 4; }
    }
    if (exit) process.exitCode = exit;
  }
}

let guildsCache = null;
async function postaDiscord(verksamhet, text, k) {
  const { hamtaGuilds, hittaEllerSkapaKanal } = await import('../factory/discord.mjs');
  const { skickaTillKanal } = await import('../stonebite/kallor/discord.mjs');
  const { valjButiksServer } = await import('../tools/discord-rapport.mjs');
  const { delaDiscord } = await import('../kundtjanst/run.mjs');
  const { granskaSprak, stoppText } = await import('../tools/lib/engelska.mjs');
  const sprak = await granskaSprak(text);
  if (sprak.stoppad) { const e = new Error(stoppText(sprak.orsak)); e.exit = 3; throw e; }
  guildsCache ??= hamtaGuilds();
  const guilds = await guildsCache;
  const onskad = k.discord.servrar?.[verksamhet] ?? verksamhet;
  const server = valjButiksServer(guilds, onskad);
  if (!server) throw new Error(`ingen entydig Discord-server för ${verksamhet} (sökte "${onskad}") — lägg en rad i konkurrenter/konfig.json → discord.servrar`);
  const kanal = await hittaEllerSkapaKanal(server.id, k.discord.kanal);
  if (kanal.skapad) await skickaTillKanal(kanal.id, KANAL_INTRO, { mentions: [] });
  let forsta = null;
  for (const del of delaDiscord(sprak.text, 1900)) { const m = await skickaTillKanal(kanal.id, del, { mentions: k.discord.pinga ?? [] }); forsta ??= m; }
  return { server: server.name, kanal: kanal.name, meddelande: forsta?.id ?? null };
}

// ------------------------------------------------------------------ Axels verb

function hamtaArende(id) {
  const arenden = lasArenden(ARENDEFIL, { logg });
  const a = arenden.get(String(id ?? '').trim().toUpperCase());
  if (!a) throw new Error(`Ärendet ${id} finns inte. Kända: ${[...arenden.keys()].slice(-10).join(', ') || 'inga'}.`);
  return { arenden, a };
}

async function brevFor(a, k, { sprak = null, paminnelse = false, mottagare = null, via = null, faktura = null } = {}) {
  const avs = await avsandareFor(a.verksamhet, k, { via });
  const brev = byggBrev(a, { avsandare: { brand: a.verksamhet, mail: avs.mail ?? a.brev?.fran ?? '', butikUrl: avs.butikUrl ?? '' }, foretag: k.brev.foretag, sprak, fristTimmar: k.brev.svarsfrist_timmar, paminnelse, mottagare, faktura: faktura ?? a.faktura ?? null });
  return { brev, avs };
}

/**
 * Bygger (eller bygger om) fakturan för ett ärende och skriver
 * arenden/<id>/faktura-<nr>.html + .pdf. Returnerar { faktura, fel }.
 * Samma nummer så länge ingen faktura skickats; `--ny-faktura` ger nästa löpnummer.
 */
async function byggOchSkrivFaktura(a, k, { nu = new Date(), sprak = null, kopare = null, ny = false, cpmOverride = null, land = null } = {}) {
  const sprakF = valjSprak({ lang: a.deras?.lang, doman: a.deras?.doman, tvinga: sprak });
  const befintlig = a.faktura && !ny ? a.faktura : null;
  const lopnr = befintlig ? (befintlig.lopnr ?? 1) : (a.faktura?.lopnr ?? 0) + 1;
  // CPM:en behövs bara när någon annons har exponeringar (Axels avläsning ur annonsbiblioteket).
  let cpm = null;
  const behoverCpm = (k.faktura?.berakning ?? 'exponeringar') === 'exponeringar' && (a.bevis?.annonser ?? []).some((t) => Number(t.exponeringar) > 0);
  if (behoverCpm) {
    let matt = null;
    if (cpmOverride === null && k.faktura?.cpm?.lage !== 'reserv' && process.env.META_ACCESS_TOKEN) {
      matt = await hamtaCpm(k.verksamheter[a.verksamhet]?.konton ?? [], { preset: k.faktura?.cpm?.period ?? 'last_30d', logg });
      logg(`  ${cpmRad(a.verksamhet, matt, k.faktura?.cpm?.reserv_sek?.[a.verksamhet] ?? null)}`);
    }
    cpm = valjCpm({ override: cpmOverride, matt, konfig: k, verksamhet: a.verksamhet });
    if (cpm) logg(`  Fakturan räknar med CPM ${cpm.sek} kr (${cpm.kalla === 'axel' ? '--cpm' : cpm.kalla === 'matt' ? `mätt ur Meta, ${cpm.period}` : `reserven i konfig från ${cpm.matt ?? '?'}`})`);
  }
  const f = byggFaktura(a, k, { nu, lopnr, sprak: sprakF, kopare: kopare ?? befintlig?.kopare ?? null, cpm, land });
  const fel = kontrolleraFaktura(f);
  if (fel.length) return { faktura: null, fel };
  const html = fakturaHtml(f);
  const bas = join(ARENDEMAPP, a.id, `faktura-${f.nr}`);
  skrivFakturaHtml(html, `${bas}.html`);
  let pdf = null; let pdfFel = null;
  try { pdf = await fakturaPdf(html, `${bas}.pdf`); } catch (e) { pdfFel = e.message; logg(`  ⚠️ PDF: ${e.message}`); }
  return { faktura: { ...f, lopnr, fil: pdf ? pdf.replace(`${DATAMAPP}/`, '') : null, htmlFil: `${bas}.html`.replace(`${DATAMAPP}/`, ''), pdfFel, skapad: nu.toISOString() }, fel: [] };
}

/** Fakturans grund som en rad till Axel. */
function fakturaGrundRad(f) {
  const exp = f.rader.filter((r) => r.grund === 'exponeringar');
  const schablon = f.rader.filter((r) => r.grund === 'schablon');
  const delar = [];
  if (exp.length) delar.push(`${exp.length} annons(er) på exponeringar: ${f.exponeringar.toLocaleString('sv-SE').replace(/[  ]/g, ' ')} × CPM ${f.cpm?.sek ?? '?'} kr`);
  if (schablon.length) delar.push(`${schablon.length} rad(er) på schablontaxa`);
  delar.push(f.omvand ? 'omvänd betalningsskyldighet (utländsk köpare)' : `moms ${f.momsProcent} %`);
  return delar.join(' · ');
}

/** --cpm 120 → 120, annars null. */
const cpmFlagga = () => { const v = flagga('cpm'); const n = Number(String(v ?? '').replace(',', '.')); return v !== null && v !== undefined && Number.isFinite(n) && n > 0 ? n : null; };

async function visaBrev() {
  const k = konfig();
  const { a } = hamtaArende(flagga('brev'));
  const { brev, avs } = await brevFor(a, k, { sprak: flagga('sprak'), paminnelse: har('paminnelse'), mottagare: flagga('till') });
  console.log(`Från: ${brev.fran || '(ingen avsändare — ' + (avs.saknas ?? []).join(', ') + ')'}\nTill: ${brev.mottagare ?? '(ingen mottagare hittad — ange --till)'}\nÄmne: ${brev.amne}\n\n${brev.text}`);
  const fel = kontrolleraBrev(brev, { egna: egnaDomaner(k) });
  if (fel.length) console.log(`\n⚠️ Skulle stoppas: ${fel.join('; ')}`);
}

/**
 * --skicka <id>: bygger brevet + fakturan och lägger SÄNDPAKETET i
 * arenden/<id>/ (brev.txt, brev.json, faktura-<nr>.pdf). Skickar inget själv
 * på Gmail-vägen — sessionen lägger paketet som utkast i Stonebite-Gmail (eller
 * skickar därifrån på Axels ord) och kvitterar med --skickad. `--via loopia --ja`
 * är reservvägen som skickar från butikens kundtjänstbrevlåda direkt.
 */
async function skicka() {
  const k = konfig();
  const id = flagga('skicka');
  const { arenden, a } = hamtaArende(id);
  const paminnelse = har('paminnelse');
  const via = String(flagga('via') ?? k.brev.avsandare?.via ?? 'gmail').toLowerCase();
  const nu = new Date().toISOString();
  const egna = egnaDomaner(k);
  if (!paminnelse && a.status !== STATUS.NY) { console.log(`Ärendet är ${a.status} — första brevet går bara från "ny"${a.brev?.skickat ? ` (skickat ${a.brev.skickat.nar} till ${a.brev.skickat.till})` : ''}.`); process.exitCode = 1; return; }
  if (paminnelse && a.status !== STATUS.SKICKAD) { console.log(`Påminnelsen går bara efter ett skickat brev — ärendet är ${a.status}.`); process.exitCode = 1; return; }

  // Fakturan följer med första brevet (Axels order 2026-09-29), aldrig påminnelsen.
  let faktura = a.faktura ?? null;
  if (!paminnelse && k.faktura?.aktiv !== false && !har('utan-faktura')) {
    const r = await byggOchSkrivFaktura(a, k, { nu: new Date(nu), sprak: flagga('sprak'), kopare: flagga('kopare'), ny: har('ny-faktura'), cpmOverride: cpmFlagga(), land: flagga('land') });
    if (r.fel.length) { console.log(`Fakturan kan inte byggas: ${r.fel.join('; ')}\n(--utan-faktura skickar brevet utan faktura)`); process.exitCode = 1; return; }
    faktura = r.faktura;
  }
  const { brev, avs } = await brevFor(a, k, { sprak: flagga('sprak'), paminnelse, mottagare: flagga('till'), via, faktura: paminnelse ? null : faktura });
  const fel = kontrolleraBrev(brev, { egna });
  const bilagor = paminnelse && a.faktura?.fil ? [a.faktura.fil] : [];
  const paket = byggSandpaket(a, brev, { faktura: paminnelse ? null : faktura, via, bilagor });
  const mapp = join(ARENDEMAPP, a.id); mkdirSync(mapp, { recursive: true });
  const namn = paminnelse ? 'paminnelse' : 'brev';
  writeFileSync(join(mapp, `${namn}.txt`), `Till: ${brev.mottagare ?? ''}\nFrån: ${brev.fran ?? ''}\nÄmne: ${brev.amne}\n\n${brev.text}\n`);
  skrivJson(join(mapp, `${namn}.json`), paket);
  console.log(`Från: ${brev.fran || '?'}\nTill: ${brev.mottagare ?? '(ingen adress hittad — ange --till)'}\nÄmne: ${brev.amne}\n\n${brev.text}\n`);
  if (faktura && !paminnelse) console.log(`Faktura ${faktura.nr}: ${belopp(faktura.brutto, faktura.valuta, faktura.sprak)} (${fakturaGrundRad(faktura)}), förfaller ${faktura.forfaller} — ${faktura.fil ? `konkurrenter/${faktura.fil}` : `PDF gick inte att göra (${faktura.pdfFel ?? '?'}); HTML: konkurrenter/${faktura.htmlFil}`}`);
  if (fel.length) console.log(`⚠️ Brevet stoppas: ${fel.join('; ')}`);

  if (via === 'loopia') {
    const r = await skickaBrev(a, { ...brev }, { brand: avs.brand, ja: har('ja'), utkast: har('utkast'), paminnelse, egna, logg });
    if (!r.skickat && !r.utkast) { console.log(`Inget skickat: ${r.orsak}`); if (!har('ja') && !r.fel?.length) console.log('Kör igen med --ja för att skicka via Loopia (eller --utkast för Drafts).'); if (r.fel?.length) process.exitCode = 1; return; }
    if (r.utkast) { const upp = { ...a, faktura, historik: [...(a.historik ?? []), { nar: nu, fran: a.status, till: a.status, av: 'axel', not: `utkast sparat i Drafts (uid ${r.kvitto.utkastUid ?? '?'}) till ${brev.mottagare}` }] }; sparaArende(upp, ARENDEFIL, { nu }); skrivArendefiler(upp); console.log(`Utkast sparat i ${avs.brand}s Drafts (uid ${r.kvitto.utkastUid ?? '?'}). Inget skickat.`); return; }
    const upp = registreraSkickat({ ...a, faktura }, { till: brev.mottagare, fran: r.kvitto.fran ?? brev.fran, nar: nu, via: 'loopia', paminnelse, fristTimmar: k.brev.svarsfrist_timmar, sprak: brev.sprak, amne: brev.amne });
    sparaArende(upp, ARENDEFIL, { nu }); skrivArendefiler(upp); arenden.set(upp.id, upp);
    await byggSidaFil({ k, arenden });
    console.log(`✅ ${paminnelse ? 'Påminnelsen' : 'Brevet'} skickat via Loopia till ${brev.mottagare}. Frist: ${upp.brev.frist}. Ärendet ${upp.id} är nu ${upp.status}.`);
    return;
  }

  // Gmail-vägen: paketet ligger klart, statusen rörs inte förrän --skickad.
  const upp = { ...a, faktura: paminnelse ? a.faktura ?? null : faktura, brev: { ...(a.brev ?? {}), mottagare: brev.mottagare ?? a.brev?.mottagare ?? null, fran: brev.fran, sprak: brev.sprak, amne: brev.amne, paket: { nar: nu, via, fil: `arenden/${a.id}/${namn}.json`, paminnelse, stoppad: fel.length ? fel : null } } };
  sparaArende(upp, ARENDEFIL, { nu }); skrivArendefiler(upp); arenden.set(upp.id, upp);
  await byggSidaFil({ k, arenden });
  if (fel.length) { console.log('Paketet är skrivet men ska inte gå förrän stoppen ovan är lösta.'); process.exitCode = 1; return; }
  console.log(`Sändpaketet ligger i konkurrenter/arenden/${a.id}/${namn}.json (brevet i ${namn}.txt${paket.bilagor.length ? `, bilagor: ${paket.bilagor.map((b) => `konkurrenter/${b}`).join(', ')}` : ''}).\nNästa steg: sessionen lägger det som utkast i Stonebite-Gmail. När det gått ut: node konkurrenter/kor.mjs --skickad ${a.id}${paminnelse ? ' --paminnelse' : ''}${brev.mottagare ? '' : ' --till <adress>'}`);
}

/** --skickad <id>: kvittot när brevet gått ut via Gmail (Axel eller sessionen). Flyttar ärendet till skickad/pamind. */
async function skickad() {
  const k = konfig();
  const { arenden, a } = hamtaArende(flagga('skickad'));
  const paminnelse = har('paminnelse');
  const upp = registreraSkickat(a, { till: flagga('till'), fran: a.brev?.fran ?? k.brev.avsandare?.mail ?? null, nar: flagga('nar') ?? new Date().toISOString(), via: flagga('via') ?? 'gmail', meddelande: flagga('meddelande'), paminnelse, fristTimmar: k.brev.svarsfrist_timmar });
  sparaArende(upp, ARENDEFIL); skrivArendefiler(upp); arenden.set(upp.id, upp);
  await byggSidaFil({ k, arenden });
  console.log(`✅ ${upp.id} är nu ${upp.status}: ${paminnelse ? 'påminnelsen' : 'brevet'}${upp.faktura?.nr && !paminnelse ? ` + faktura ${upp.faktura.nr}` : ''} gick till ${upp.brev.mottagare} via ${upp.brev[paminnelse ? 'paminnelse' : 'skickat'].via}. Frist: ${upp.brev.frist}. Uppföljningen läser om deras sida från nästa körning.`);
}

/** --faktura <id>: bygg (om) fakturan utan brev — för att titta på den eller efter ändrad taxa. */
async function fakturaEnbart() {
  const k = konfig();
  const { a } = hamtaArende(flagga('faktura'));
  if (a.brev?.skickat) { console.log(`Fakturan ${a.faktura?.nr ?? ''} har redan gått ut med brevet ${a.brev.skickat.nar} — bygg inte om den. (--ny-faktura ger ett nytt nummer om en ny ska ställas ut.)`); if (!har('ny-faktura')) { process.exitCode = 1; return; } }
  const r = await byggOchSkrivFaktura(a, k, { sprak: flagga('sprak'), kopare: flagga('kopare'), ny: har('ny-faktura'), cpmOverride: cpmFlagga(), land: flagga('land') });
  if (r.fel.length) { console.log(`Fakturan kan inte byggas: ${r.fel.join('; ')}`); process.exitCode = 1; return; }
  const upp = { ...a, faktura: r.faktura };
  sparaArende(upp, ARENDEFIL); skrivArendefiler(upp);
  console.log(`Faktura ${r.faktura.nr} på ${belopp(r.faktura.brutto, r.faktura.valuta, r.faktura.sprak)} (${fakturaGrundRad(r.faktura)}; förfaller ${r.faktura.forfaller}):`);
  for (const rad of r.faktura.rader) console.log(`  ${rad.beskrivning}: ${rad.antal} × ${belopp(rad.apris, r.faktura.valuta, r.faktura.sprak)}`);
  console.log(r.faktura.fil ? `PDF: konkurrenter/${r.faktura.fil}` : `PDF gick inte att göra (${r.faktura.pdfFel}); HTML: konkurrenter/${r.faktura.htmlFil}`);
}

async function avfarda() {
  const k = konfig();
  const { arenden, a } = hamtaArende(flagga('avfarda'));
  const skal = args.slice(args.indexOf('--avfarda') + 2).filter((x) => !x.startsWith('--')).join(' ').trim() || 'ingen kopia (Axels bedömning)';
  const upp = overgang(a, STATUS.AVFARDAD, { av: 'axel', not: skal });
  sparaArende(upp, ARENDEFIL); skrivArendefiler(upp); arenden.set(upp.id, upp);
  await byggSidaFil({ k, arenden });
  console.log(`${upp.id} avfärdat: ${skal}. Dyker inte upp igen.`);
}

async function eskalera() {
  const k = konfig();
  const { arenden, a } = hamtaArende(flagga('eskalera'));
  const not = args.slice(args.indexOf('--eskalera') + 2).filter((x) => !x.startsWith('--')).join(' ').trim() || 'anmält vidare (Meta/Shopify/ombud)';
  const upp = overgang(a, STATUS.ESKALERAD, { av: 'axel', not });
  sparaArende(upp, ARENDEFIL); skrivArendefiler(upp); arenden.set(upp.id, upp);
  await byggSidaFil({ k, arenden });
  console.log(`${upp.id} eskalerat: ${not}.`);
}

async function foljupp() {
  const k = konfig();
  const torr = har('torr');
  const arenden = lasArenden(ARENDEFIL, { logg });
  const egna = egnaDomaner(k);
  const nu = new Date().toISOString();
  const att = [...arenden.values()].filter((a) => [STATUS.SKICKAD, STATUS.PAMIND].includes(a.status) && a.deras?.url);
  if (!att.length) { console.log('Inga skickade ärenden att följa upp.'); return; }
  let hashare = null;
  try { hashare = await startaHashare({ logg }); } catch (e) { logg(`  ⚠️ ${e.message}`); }
  const cache = new Bildcache(join(OUTPUT, 'bildcache.json'));
  for (const a of att) {
    const sida = await hamtaKonkurrent(a.deras.url, { logg, egna, medKontakt: false });
    let kvar; let detalj;
    if (!sida.ok && [404, 410].includes(sida.status)) { kvar = false; detalj = `sidan svarar ${sida.status}`; }
    else if (!sida.ok) { kvar = null; detalj = `gick inte att läsa: ${sida.fel ?? sida.status}`; }
    else {
      const p = { text: null, bilder: a.var?.produkt?.bilder ?? [], annonser: [] };
      try { const j = await (await fetch(`${a.var.produkt.url}.json`, { signal: AbortSignal.timeout(20000) })).json(); p.text = (await import('./korpus.mjs')).textUrHtml(j?.product?.body_html); } catch { p.text = null; }
      let derasHashar = new Map(); const egnaHashar = new Map();
      if (hashare) {
        const r1 = await hashaLankar(p.bilder.slice(0, 12), { hashare, cache, logg }); for (const [u, v] of r1.hashar) egnaHashar.set(u, v);
        const r2 = await hashaLankar(sida.bilder.slice(0, 24), { hashare, cache, logg }); derasHashar = r2.hashar;
      }
      const j = jamforMotProdukt(p, sida, { k, derasHashar, egnaHashar });
      kvar = Boolean(j.styrka); detalj = kvar ? j.skal.join('; ') : `text ${j.text?.langsta ?? 0} ord i följd, ${j.bilder.length} bilder — under tröskeln`;
    }
    const fristPasserad = a.brev?.frist ? Date.parse(a.brev.frist) < Date.now() : false;
    let upp = { ...a, uppfoljning: { nar: nu, kvar, detalj, fristPasserad } };
    if (kvar === false) upp = overgang(upp, STATUS.ATGARDAD, { av: 'rutinen', nu, not: `kopian borta vid uppföljning: ${detalj}` });
    console.log(`${a.id} · ${a.deras.doman ?? a.deras.sidnamn}: ${kvar === null ? 'OKÄNT' : kvar ? 'KVAR' : 'BORTA'} — ${detalj}${fristPasserad && kvar ? ' · fristen har gått ut' : ''}`);
    if (!torr) { sparaArende(upp, ARENDEFIL, { nu }); skrivArendefiler(upp); arenden.set(upp.id, upp); }
  }
  cache.spara();
  if (hashare) await hashare.stang();
  if (!torr) await byggSidaFil({ k, arenden });
}

async function lista() {
  const arenden = lasArenden(ARENDEFIL, { logg });
  if (!arenden.size) { console.log('Inga ärenden ännu.'); return; }
  for (const a of [...arenden.values()].sort((x, y) => String(x.id).localeCompare(String(y.id)))) console.log(sammanfatta(a));
}

async function kolla() {
  const k = konfig();
  const rader = [];
  rader.push(`META_ACCESS_TOKEN: ${process.env.META_ACCESS_TOKEN ? 'finns' : 'SAKNAS — egna annonser läses inte'} · META_ACCESS_TOKEN_ADLIBRARY (den verifierade personens användartoken för Ad Library): ${process.env.META_ACCESS_TOKEN_ADLIBRARY ? 'finns' : 'saknas — Ad Library provas med META_ACCESS_TOKEN'}`);
  rader.push(`DISCORD_BOT_TOKEN: ${process.env.DISCORD_BOT_TOKEN ? 'finns' : 'saknas — ingen Discord-post'}`);
  rader.push(`Avsändare: ${k.brev.avsandare?.mail ?? '?'} via ${k.brev.avsandare?.via ?? 'gmail'} — brevet läggs som utkast i Stonebite-Gmail av sessionen (Gmail-connectorn måste vara kopplad på claude.ai). Reserv: --via loopia från butikens kundtjänstbrevlåda.`);
  const fk = k.faktura ?? {};
  const ibanRad = fk.iban ? (ibanGiltig(fk.iban) ? `IBAN ${fk.iban} (kontrollsiffran stämmer)` : `⚠️ IBAN ${fk.iban} KLARAR INTE kontrollsiffran — en siffra är fel`) : (fk.bankgiro ? `bankgiro ${fk.bankgiro}` : '⚠️ BANKGIRO/IBAN SAKNAS i konfig.json: ingen faktura kan byggas förrän Axel fyllt i det');
  rader.push(`Faktura: ${fk.aktiv === false ? 'AV' : `på — ${fk.berakning === 'exponeringar' ? 'exponeringar × vår CPM per annons, schablon när exponeringar saknas' : 'schablontaxa'} (annons ${fk.taxa?.annons ?? '?'} / video ${fk.taxa?.video ?? '?'} / bild ${fk.taxa?.bild ?? '?'} / produkttext ${fk.taxa?.produkttext ?? '?'} ${fk.valuta ?? 'SEK'}), ${fk.betalvillkor_dagar ?? 10} dagar, moms ${fk.moms_procent ?? 0} % i Sverige / ${fk.moms_utland_procent ?? 0} % utomlands (omvänd)`} — ${ibanRad}`);
  for (const [namn, v] of Object.entries(k.verksamheter)) {
    const avs = await avsandareFor(namn, k, { via: 'loopia' });
    rader.push(`${namn}: reservbrevlåda (Loopia) ${avs.mail ?? '?'} — ${avs.konfigurerad ? 'finns i miljön' : `saknas (${(avs.saknas ?? []).join(', ')}) — behövs bara för --via loopia`}`);
    if (process.env.META_ACCESS_TOKEN && (v.konton ?? []).length) {
      const m = await hamtaCpm(v.konton, { preset: fk.cpm?.period ?? 'last_30d', logg: () => {} });
      rader.push(`  ${cpmRad(namn, m, fk.cpm?.reserv_sek?.[namn] ?? null)}`);
    }
    for (const b of v.butiker ?? []) {
      try { const p = await hamtaProdukter(b, { maxSidor: 1 }); rader.push(`  ${b}: ${p.length} produkter läsbara`); } catch (e) { rader.push(`  ${b}: ${e.message}`); }
    }
  }
  if (process.env.META_ACCESS_TOKEN) {
    const al = await sokAdLibrary('taköverdrag', { lander: k.ad_library.lander, egnaSidor: egnaSidor() });
    rader.push(`Ad Library: ${al.status}${al.fel ? ` — ${al.fel}` : ''}`);
    if (al.hjalp) rader.push(al.hjalp.split('\n').map((r) => `  ${r}`).join('\n'));
  }
  try { const h = await startaHashare({ logg: () => {} }); await h.stang(); rader.push('Chromium: finns — bilder jämförs och skärmdumpar tas'); } catch (e) { rader.push(`Chromium: ${e.message}`); }
  const s = await sokBing('baverbutiken', { antal: 3 });
  rader.push(`Bing: ${s.fel ?? `${s.traffar.length} träffar (${s.traffar.map((t) => t.doman).join(', ')})`}${s.traffar.length && !s.traffar.some((t) => /baverbutiken/.test(t.doman ?? '')) ? ' — ⚠️ träffarna är skräp (Bing svarar en container med slumpsidor, mätt 2026-09-27): sök med sessionens WebSearch i stället' : ''}`);
  rader.push(`Egna domäner: ${egnaDomaner(k).length} st`);
  rader.push(`Ärenden: ${lasArenden(ARENDEFIL).size} · granskningssidan: ${lasJson(SIDAFIL, {})?.url ?? 'inte publicerad ännu'}`);
  console.log(rader.join('\n'));
}

async function sidaEnbart() {
  const k = konfig();
  const f = await byggSidaFil({ k, arenden: lasArenden(ARENDEFIL, { logg }) });
  console.log(`Granskningssidan byggd: ${f}`);
}

const huvud = har('kolla') ? kolla : har('fraser') ? fraser : har('hamta') ? hamta : har('rapport') ? rapport : har('brev') ? visaBrev : har('skickad') ? skickad : har('skicka') ? skicka : har('faktura') ? fakturaEnbart : har('avfarda') ? avfarda : har('eskalera') ? eskalera : har('foljupp') ? foljupp : har('lista') ? lista : har('sida') ? sidaEnbart : null;
if (!huvud) { console.error('Ange --kolla, --fraser, --hamta [--annonser <fil>], --rapport, --lista, --brev <id>, --skicka <id>, --skickad <id>, --faktura <id>, --avfarda <id>, --eskalera <id>, --foljupp eller --sida.'); process.exit(1); }
huvud().catch((e) => { console.error(`✗ ${e.message}`); process.exit(e.exit ?? 1); });
