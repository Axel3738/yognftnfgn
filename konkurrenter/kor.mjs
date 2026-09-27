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
import { byggBrev, kontrolleraBrev } from './brev.mjs';
import { skickaBrev } from './skicka.mjs';
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

/** Avsändaruppgifterna för en verksamhet: brandets supportadress ur kundtjänstens brandfiler. */
async function avsandareFor(verksamhet, k) {
  const v = k.verksamheter[verksamhet];
  if (!v) return { brand: null, mail: null, butikUrl: null, saknas: `okänd verksamhet ${verksamhet}` };
  const { upptackBrands, korkonfig } = await import('../kundtjanst/brands.mjs');
  const brand = upptackBrands().find((b) => b.id === v.avsandare);
  const kk = brand ? korkonfig(brand) : null;
  return { brand: v.avsandare, namn: verksamhet, mail: kk?.mail?.user ?? null, butikUrl: v.butiker?.[0] ?? null, konfigurerad: Boolean(kk?.mail?.konfigurerad), saknas: kk ? kk.mail.saknas : [`ingen brandfil för ${v.avsandare}`] };
}

// ------------------------------------------------------------------ korpus

async function byggKorpus(k, { bara = null, produktFilter = null, max = null, lage = lasLage(), medAnnonser = true }) {
  const ut = []; const status = { butiker: [], annonser: [] };
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
  }
  return { produkter: ut, status };
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

async function brevFor(a, k, { sprak = null, paminnelse = false, mottagare = null } = {}) {
  const avs = await avsandareFor(a.verksamhet, k);
  const brev = byggBrev(a, { avsandare: { brand: a.verksamhet, mail: avs.mail ?? a.brev?.fran ?? '', butikUrl: avs.butikUrl ?? '' }, foretag: k.brev.foretag, sprak, fristTimmar: k.brev.svarsfrist_timmar, paminnelse, mottagare });
  return { brev, avs };
}

async function visaBrev() {
  const k = konfig();
  const { a } = hamtaArende(flagga('brev'));
  const { brev, avs } = await brevFor(a, k, { sprak: flagga('sprak'), paminnelse: har('paminnelse'), mottagare: flagga('till') });
  console.log(`Från: ${brev.fran || '(ingen avsändare — ' + (avs.saknas ?? []).join(', ') + ')'}\nTill: ${brev.mottagare ?? '(ingen mottagare hittad — ange --till)'}\nÄmne: ${brev.amne}\n\n${brev.text}`);
  const fel = kontrolleraBrev(brev, { egna: egnaDomaner(k) });
  if (fel.length) console.log(`\n⚠️ Skulle stoppas: ${fel.join('; ')}`);
}

async function skicka() {
  const k = konfig();
  const id = flagga('skicka');
  const { arenden, a } = hamtaArende(id);
  const paminnelse = har('paminnelse');
  const { brev, avs } = await brevFor(a, k, { sprak: flagga('sprak'), paminnelse, mottagare: flagga('till') });
  const nu = new Date().toISOString();
  console.log(`Från: ${brev.fran || '?'}\nTill: ${brev.mottagare ?? '?'}\nÄmne: ${brev.amne}\n\n${brev.text}\n`);
  const r = await skickaBrev(a, brev, { brand: avs.brand, ja: har('ja'), utkast: har('utkast'), paminnelse, egna: egnaDomaner(k), logg });
  if (!r.skickat && !r.utkast) {
    console.log(`Inget skickat: ${r.orsak}`);
    if (!har('ja') && !r.fel?.length) console.log(`Kör igen med --ja för att skicka (eller --utkast för att lägga det i Drafts först).`);
    if (r.fel?.length) process.exitCode = 1;
    return;
  }
  if (r.utkast) {
    const upp = { ...a, historik: [...(a.historik ?? []), { nar: nu, fran: a.status, till: a.status, av: 'axel', not: `utkast sparat i Drafts (uid ${r.kvitto.utkastUid ?? '?'}) till ${brev.mottagare}` }] };
    sparaArende(upp, ARENDEFIL, { nu }); skrivArendefiler(upp);
    console.log(`Utkast sparat i ${avs.brand}s Drafts (uid ${r.kvitto.utkastUid ?? '?'}). Inget skickat.`);
    return;
  }
  const frist = new Date(Date.parse(nu) + (paminnelse ? 24 : k.brev.svarsfrist_timmar) * 3_600_000).toISOString();
  const upp = paminnelse
    ? overgang(a, STATUS.PAMIND, { av: 'axel', nu, not: `påminnelse skickad till ${brev.mottagare}`, extra: { brev: { ...a.brev, paminnelse: r.kvitto, frist } } })
    : overgang(a, STATUS.SKICKAD, { av: 'axel', nu, not: `brev skickat till ${brev.mottagare}`, extra: { brev: { ...a.brev, mottagare: brev.mottagare, fran: r.kvitto.fran ?? brev.fran, sprak: brev.sprak, skickat: r.kvitto, frist } } });
  sparaArende(upp, ARENDEFIL, { nu }); skrivArendefiler(upp);
  arenden.set(upp.id, upp);
  await byggSidaFil({ k, arenden });
  console.log(`✅ ${paminnelse ? 'Påminnelsen' : 'Brevet'} skickat till ${brev.mottagare} från ${r.kvitto.fran ?? brev.fran}. Frist: ${frist}. Ärendet ${upp.id} är nu ${upp.status}.`);
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
  rader.push(`META_ACCESS_TOKEN: ${process.env.META_ACCESS_TOKEN ? 'finns' : 'SAKNAS — egna annonser och Ad Library läses inte'}`);
  rader.push(`DISCORD_BOT_TOKEN: ${process.env.DISCORD_BOT_TOKEN ? 'finns' : 'saknas — ingen Discord-post'}`);
  for (const [namn, v] of Object.entries(k.verksamheter)) {
    const avs = await avsandareFor(namn, k);
    rader.push(`${namn}: avsändare ${avs.mail ?? '?'} — ${avs.konfigurerad ? 'brevlådan finns i miljön' : `brevlådan SAKNAS (${(avs.saknas ?? []).join(', ')}) — brev kan visas men inte skickas härifrån`}`);
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

const huvud = har('kolla') ? kolla : har('fraser') ? fraser : har('hamta') ? hamta : har('rapport') ? rapport : har('brev') ? visaBrev : har('skicka') ? skicka : har('avfarda') ? avfarda : har('eskalera') ? eskalera : har('foljupp') ? foljupp : har('lista') ? lista : har('sida') ? sidaEnbart : null;
if (!huvud) { console.error('Ange --kolla, --fraser, --hamta, --rapport, --lista, --brev <id>, --skicka <id>, --avfarda <id>, --eskalera <id>, --foljupp eller --sida.'); process.exit(1); }
huvud().catch((e) => { console.error(`✗ ${e.message}`); process.exit(e.exit ?? 1); });
