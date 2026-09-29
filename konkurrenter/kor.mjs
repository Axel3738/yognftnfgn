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
//   node konkurrenter/kor.mjs --hamta --annonser-sida <sid-id|Ad Library-länk> [--land SE] [--utan-rackvidd]
//        Läser en Facebook-sidas ANNONSER ur annonsbiblioteket härifrån
//        (adlibrary.mjs: Chromium, räckvidd per annons) → annonsfilen →
//        samma jämförelse som --annonser <fil>. Slutar med Axels kriterier.
//   node konkurrenter/kor.mjs --hamta --annonser <fil.json>
//        Samma jämförelse på en annonsfil Axel/Cowork skrivit (annonsfall.mjs).
//   node konkurrenter/kor.mjs --rapport [--discord] [--torr] [--tvinga]
//        Fynden → ärenden (arenden.jsonl, arenden/<id>.md, skärmdumpar),
//        lage.json, granskningssidan output/sida.html, svensk rapport,
//        engelsk Discord-post när något nytt finns. Ett annonsfynd under
//        Axels tröskel (trosklar.annons) blir inget ärende utan --tvinga.
//   node konkurrenter/kor.mjs --klipp <id> [--antal 3] [--lanat <anmälan>:<bokstav>,…] [--alla]
//        Bevisrutorna ur VÅRA EGNA klipp: deras video (annonsbiblioteket) och vår
//        (Meta) laddas ner, rutor matchas, scenen med miniatyren (det lånade klippet)
//        och det Axel pekat ut kastas, 3 par ur olika scener per annons → klipp.json.
//        Två par som visar samma bild (samma AI-klipp i två av våra filmer) väljs aldrig båda.
//   node konkurrenter/kor.mjs --original <id> [--alla] [--tvinga]
//        Våra ORIGINALANNONSER i annonsbiblioteket (original.mjs): filmerna paren pekar på
//        letas upp på våra sidor och verifieras ruta för ruta → original.json. --anmal
//        lägger länken i formulärets exempelfält ("Provide an example of your work").
//   node konkurrenter/kor.mjs --anmal <id> [--bara-aktiva] [--utan-bevisbild] [--utan-cdn]
//        Meta-anmälningarna: en per kopierad annons + bevisbild + verifieringssida.
//        Finns klipp.json byggs bevisbilden ur paren, aldrig ur miniatyrträffen.
//   node konkurrenter/kor.mjs --anmal-skicka <id> [--nr n] [--ja] [--kod-fil <fil>]
//        Fyller i Metas formulär HÄRIFRÅN (anmal-skicka.mjs). Utan --ja: torrt.
//        Med --ja (Axels "kör anmälningarna"): engångskoden ur kodfilen, Submit, kvitto —
//        kvitto BARA när Meta bekräftar. Visar Meta en säkerhetskontroll (captcha,
//        mätt 2026-09-29) stannar skriptet: den görs av en människa, aldrig härifrån.
//   node konkurrenter/kor.mjs --anmal-cowork <id>
//        Cowork-prompten för de anmälningar som inte är inskickade: Cowork fyller i
//        exakt de godkända texterna i Axels Chrome, Axel gör säkerhetskontrollen.
//        → arenden/<id>/anmalan/COWORK-PROMPT.txt
//   node konkurrenter/kor.mjs --anmald <id> --nr <n> --referens <r> | --angra "<skäl>"
//        Kvittot för hand när en anmälan skickats på annat sätt; --angra tar tillbaka ett felaktigt kvitto.
//   node konkurrenter/kor.mjs --skicka <id> [--utan-meta] …
//        --utan-meta: brevet och sms:et nämner inte Meta-anmälningarna alls (Axels beslut
//        2026-09-29 för ORVO: "vi borde lugnt inte säga att vi har skickat DMCA").
//   node konkurrenter/kor.mjs --granska <id> [--forsta] [--bara-status] [--pagar nyckel,…] [--fel nyckel=text] [--notis text]
//        Axels granskningsapp (ett kort per anmälan + mejlet med fakturan + sms:et,
//        Ja/Nej som sidan sparar i data/beslut.json) → output/granska/<id>/.
//   node konkurrenter/kor.mjs --granska-svar <id> --beslut <fil> [--granskning <fil>]
//        Vad Axels svar betyder: vilka anmälningar som ska in, om mejlet ska gå.
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

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, copyFileSync, unlinkSync } from 'node:fs';
import { join, basename } from 'node:path';
import { säkerställProxy } from '../tools/meta-lib.mjs';
import { MAPP, DATAMAPP, ARENDEFIL, STATUS, lasArenden, sparaArende, nyttId, nyckelFor, hittaBefintligt, overgang, nyttArende, uppdateraFynd, sammanfatta, oppna, angraKvittoAnmalan } from './arenden.mjs';
import { hamtaProdukter, fingeravtryck, mallmeningar, hamtaEgnaAnnonser, valjProdukter, egnaDomaner, egnaSidor, textUrAnnons } from './korpus.mjs';
import { sokBing, sokAdLibrary, filtreraTraffar, arEgen, domanUr, adLibraryLank } from './sok.mjs';
import { hamtaKonkurrent } from './hamta.mjs';
import { jamforText, jamforBilder, sammanvag } from './likhet.mjs';
import { startaHashare, hashaLankar, Bildcache } from './bild.mjs';
import { byggBrev, kontrolleraBrev, valjSprak, fristText } from './brev.mjs';
import { brevPdf, foljetext, harLankbartOrd } from './brevpdf.mjs';
import { skickaBrev, byggSandpaket, registreraSkickat } from './skicka.mjs';
import { byggFaktura, kontrolleraFaktura, fakturaHtml, fakturaPdf, fakturaLitenPdf, skrivFakturaHtml, belopp, ibanGiltig } from './faktura.mjs';
import { hamtaCpm, valjCpm, cpmRad } from './cpm.mjs';
import { byggAnmalningar, kontrolleraAnmalan, anmalanText, annonsLank } from './anmalan.mjs';
import { bevisbildHtml, bevisbildPng, verifieringHtml } from './bevisbild.mjs';
import { kortAnmalan, kortMejl, byggGranskning, statusFor, smsText, attGora, sidaHtml } from './granskning.mjs';
import { tolkaAnnonsinput, byggAnnonsfynd, annonsUppfoljning } from './annonsfall.mjs';
import { hamtaAdLibrary, sidaIdUr } from './adlibrary.mjs';
import { skickaAnmalan, formularVarden, coworkPrompt } from './anmal-skicka.mjs';
import { hittaFfmpeg, hamtaFil, varVideo, videoKalla, egnaFilmer, prefixUrNamn, rutorUrVideo, hashUrBild, bildRuta, graRuta, skillnadOvre, langd, skrivRutaNr, paraRutor, lanadeKlipp, klippbyten, tagningar, tid, avstand, FPS, MAX_AVSTAND, KONTROLL_AVSTAND, SAMMA_TAGNING, FRO_AVSTAND, BOKSTAVER, RUTOR_VERSION, BIBLIOTEK_VERSION, bevisStatus, produktForPar, filmdatum } from './klipp.mjs';
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
async function hamtaAnnonser(k, fil, { kalla = 'axel-annonser', bibliotek = null } = {}) {
  const idag = flagga('idag') ?? idagSthlm();
  const nu = new Date().toISOString();
  const egna = egnaDomaner(k);
  const input = tolkaAnnonsinput(lasJson(fil) ?? (() => { throw new Error(`${fil} finns inte eller är inte JSON.`); })());
  if (input.deras.doman && arEgen(input.deras.doman, egna)) throw new Error(`${input.deras.doman} är en av våra egna domäner.`);
  const { allaProdukter, allaAnnonser, status } = await byggKorpus(k, { max: 10_000 });
  // Annonsfallet jämför mot ALLA våra annonser: ett konto som inte gick att läsa gör jämförelsen falsk (färre träffar,
  // fel produkt, kanske "under tröskeln") — då stannar vi hellre än skriver ett fynd. Mätt 2026-09-29: en timeout på
  // MagiBorsten gav 0 av 629 annonser och ORVO:s 14 IBC-kopior försvann ur fyndet.
  const trasiga = status.annonser.filter((s) => s.fel);
  if (trasiga.length && !har('tillat-trasigt-konto')) throw new Error(`våra annonser i ${trasiga.map((s) => `${s.namn} (${s.fel})`).join('; ')} gick inte att läsa — jämförelsen hade blivit falsk. Kör igen (eller --tillat-trasigt-konto för att jämföra mot det som lästes).`);
  const korning = { sok: { produkter: allaProdukter.length, annonser: allaAnnonser.length }, annonsfil: basename(fil), adLibrary: { status: 'ej_provad' }, bilder: { status: null }, fel: [], egnaAnnonser: { fel: trasiga } };
  if (bibliotek) korning.annonsbibliotek = { sida: bibliotek.deras?.sida_id ?? null, sidnamn: bibliotek.deras?.sidnamn ?? null, land: bibliotek.land ?? null, antal: bibliotek.antal ?? {}, fel: bibliotek.fel ?? [], hamtad: bibliotek.hamtad ?? null };
  let hashare = null; const cache = new Bildcache(join(OUTPUT, 'bildcache.json'));
  const derasHashar = new Map(); const egnaHashar = new Map();
  const derasBilder = input.annonser.flatMap((a) => a.bilder);
  let sida = null;
  if (input.deras.url) { sida = await hamtaKonkurrent(input.deras.url, { logg, egna }); if (!sida.ok) { korning.fel.push(`${input.deras.url}: ${sida.fel ?? sida.status}`); sida = null; } }
  const jamfor = () => byggAnnonsfynd(input, { egnaAnnonser: allaAnnonser, egnaProdukter: allaProdukter, konfig: k, derasHashar, egnaHashar, sida, nu, kalla });
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
    for (const t of fynd.bevis.annonser) console.log(`  annons ${t.nr}${t.lank ? ` (${t.lank})` : ''}: ${t.text ? `${t.text.langsta} ord i följd ur ${t.varAnnons?.namn ?? 'produkttexten'}` : 'ingen text-träff'}${t.bilder.length ? ` · ${t.bilder.length} bild(er)` : ''}${t.aktiv === false ? ' · inaktiv' : ''}${t.exponeringar ? ` · räckvidd ${t.exponeringar.toLocaleString('sv-SE').replace(/[  ]/g, ' ')}` : ''}`);
    console.log(fynd.varde?.vard ? `  Värd att jaga (Axels kriterier): ${fynd.varde.orsak}` : `  ⛔ UNDER AXELS TRÖSKEL: ${fynd.varde?.orsak} — --rapport skapar inget ärende (överstyr med --rapport --tvinga)`);
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

/**
 * Läser konkurrentens ANNONSER själv ur Metas annonsbibliotek (adlibrary.mjs,
 * Chromium härifrån): `--hamta --annonser-sida <sid-id eller Ad Library-länk>
 * [--land SE] [--utan-rackvidd]`. Skriver annonsfilen till output/ och kör
 * sedan samma jämförelse som `--annonser <fil>`.
 */
async function hamtaAnnonserSida(k, sida) {
  const idag = flagga('idag') ?? idagSthlm();
  const sidaId = sidaIdUr(sida);
  if (!sidaId) throw new Error(`"${sida}" är varken ett sid-id eller en Ad Library-länk med view_all_page_id.`);
  const land = flagga('land') ?? (k.ad_library?.lander?.[0] ?? 'SE');
  logg(`Läser annonsbiblioteket för sidan ${sidaId} (${land}) i Chromium …`);
  const bibliotek = await hamtaAdLibrary(sidaId, { land, logg, medRackvidd: !har('utan-rackvidd') });
  mkdirSync(OUTPUT, { recursive: true });
  // Landet i filnamnet utanför Sverige: den norska läsningen skrev annars över den svenska (mätt 2026-09-29).
  const fil = join(OUTPUT, `${idag}.annonser-${sidaId}${land !== 'SE' ? `-${land}` : ''}.json`);
  skrivJson(fil, bibliotek);
  const an = bibliotek.antal;
  console.log(`Annonsbiblioteket: "${bibliotek.deras.sidnamn ?? '?'}" (${sidaId}) — ${an.lasta} annonser (${an.aktiva} aktiva, ${an.inaktiva} inaktiva), räckvidd läst för ${an.rackvidd_last}${bibliotek.deras.doman ? `, domän ${bibliotek.deras.doman}` : ''} → konkurrenter/output/${basename(fil)}`);
  for (const f of bibliotek.fel) console.log(`  ⚠️ ${f}`);
  if (!bibliotek.annonser.length) { console.log('Inga annonser att jämföra.'); return; }
  return hamtaAnnonser(k, fil, { kalla: 'adlibrary', bibliotek });
}

async function hamta() {
  const k = konfig();
  if (flagga('annonser-sida')) return hamtaAnnonserSida(k, flagga('annonser-sida'));
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
  const nya = []; const uppdaterade = []; const ejVarda = [];
  const skrivningar = [];
  for (const f of data.fynd ?? []) {
    const bef = hittaBefintligt(arenden, f.nyckel);
    // Axels kriterier (trosklar.annons): en sida under tröskeln blir aldrig ett NYTT ärende — --tvinga är hans överstyrning.
    if (f.varde && f.varde.vard === false && !har('tvinga') && !(bef && bef.status !== STATUS.ATGARDAD)) { ejVarda.push(f); continue; }
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
    if (f.land) a.land = f.land; // annonsbibliotekets land (NO …) — uppföljningen läser samma land
    if (bef?.status === STATUS.ATGARDAD) a.historik.push({ nar: nu, fran: null, till: STATUS.NY, av: 'rutinen', not: `kopian är tillbaka — tidigare ärende ${bef.id}` });
    arenden.set(id, a); nya.push(a); skrivningar.push({ a, f });
  }

  // Uppföljningsläget för rapporten
  const alla = [...arenden.values()];
  const pamindKlara = alla.filter((a) => a.status === STATUS.SKICKAD && a.uppfoljning?.kvar && a.brev?.frist && Date.parse(a.brev.frist) < Date.now());
  const atgardade = alla.filter((a) => a.status === STATUS.ATGARDAD && a.uppfoljning?.nar && a.uppfoljning.nar.slice(0, 10) === datum);
  const text = rapportSv({ datum, korning: data.korning, nya, uppdaterade, oppna: oppna(arenden), sidaUrl, atgardade, pamindKlara, ejVarda });
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
  const rad = arenden.get(String(id ?? '').trim().toUpperCase());
  if (!rad) throw new Error(`Ärendet ${id} finns inte. Kända: ${[...arenden.keys()].slice(-10).join(', ') || 'inga'}.`);
  // Förhandsbilderna bor i arenden/<id>/miniatyrer.json (aldrig i loggen) — de läggs på ärendet här.
  const a = { ...rad, miniatyrer: { ...miniatyrerFor(rad.id), ...(rad.miniatyrer ?? {}) } };
  arenden.set(a.id, a);
  return { arenden, a };
}

async function brevFor(a, k, { sprak = null, paminnelse = false, mottagare = null, via = null, faktura = null, anmalanSamtidigt = false, anmalanAntal = null, utanMeta = Boolean(a.brev?.utanMeta), nu = new Date() } = {}) {
  const avs = await avsandareFor(a.verksamhet, k, { via });
  const brev = byggBrev(a, { avsandare: { brand: a.verksamhet, mail: avs.mail ?? a.brev?.fran ?? '', butikUrl: avs.butikUrl ?? '' }, foretag: k.brev.foretag, sprak, fristTimmar: k.brev.svarsfrist_timmar, paminnelse, mottagare, faktura: faktura ?? a.faktura ?? null, anmalanSamtidigt, anmalanAntal, utanMeta, nu });
  return { brev, avs };
}

/**
 * Filmannonser som bara är matchade på miniatyren (klippvalet aldrig kört).
 * Miniatyren kan vara ett lånat klipp (Axel 2026-09-29) — de får inte bära en
 * anmälan, ett brev eller en faktura förrän --klipp avgjort om filmen är vår.
 */
function overifierade(annonser) { return (annonser ?? []).filter((t) => bevisStatus(t).overifierad); }
function overifieradFel(a, annonser = a.bevis?.annonser) {
  const ov = overifierade(annonser);
  return ov.length ? `${ov.length} filmannons(er) i ${a.id} är bara matchade på miniatyren (annons ${ov.map((t) => t.nr).join(', ')}), och miniatyren kan vara ett lånat klipp — kör först: node konkurrenter/kor.mjs --klipp ${a.id} --alla` : null;
}

/**
 * Bygger (eller bygger om) fakturan för ett ärende och skriver
 * arenden/<id>/faktura-<nr>.html + .pdf. Returnerar { faktura, fel }.
 * Samma nummer så länge ingen faktura skickats; `--ny-faktura` ger nästa löpnummer.
 */
async function byggOchSkrivFaktura(a, k, { nu = new Date(), sprak = null, kopare = null, ny = false, cpmOverride = null, land = null } = {}) {
  const ov = overifieradFel(a);
  if (ov) return { faktura: null, fel: [ov] };
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
  // Den lilla PDF:en (standardtypsnitt, några kB) är bilagan — den ryms i Gmail-connectorns anrop. Chromium är reserven.
  let pdf = null; let pdfFel = null;
  try { writeFileSync(`${bas}.pdf`, fakturaLitenPdf(f, { skapad: nu })); pdf = `${bas}.pdf`; }
  catch (e) {
    logg(`  ⚠️ den lilla PDF:en: ${e.message} — Chromium i stället`);
    try { pdf = await fakturaPdf(html, `${bas}.pdf`); } catch (e2) { pdfFel = e2.message; logg(`  ⚠️ PDF: ${e2.message}`); }
  }
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

/** --anmalan-antal 7 → 7 (Axels ja i granskningsappen), annars null = alla byggda anmälningar. */
const antalFlagga = () => { const v = flagga('anmalan-antal'); const n = Number(v); return v !== null && v !== undefined && Number.isInteger(n) && n >= 0 ? n : null; };

/** --cpm 120 → 120, annars null. */
const cpmFlagga = () => { const v = flagga('cpm'); const n = Number(String(v ?? '').replace(',', '.')); return v !== null && v !== undefined && Number.isFinite(n) && n > 0 ? n : null; };

async function visaBrev() {
  const k = konfig();
  const { a } = hamtaArende(flagga('brev'));
  const { brev, avs } = await brevFor(a, k, { sprak: flagga('sprak'), paminnelse: har('paminnelse'), mottagare: flagga('till'), anmalanSamtidigt: har('med-anmalan'), anmalanAntal: antalFlagga(), utanMeta: har('utan-meta') || Boolean(a.brev?.utanMeta) });
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
  const ov = paminnelse ? null : overifieradFel(a);
  if (ov) { console.log(`⚠️ Stoppat: ${ov}`); process.exitCode = 1; return; }

  // Fakturan följer med första brevet (Axels order 2026-09-29), aldrig påminnelsen.
  let faktura = a.faktura ?? null;
  if (!paminnelse && k.faktura?.aktiv !== false && !har('utan-faktura')) {
    const r = await byggOchSkrivFaktura(a, k, { nu: new Date(nu), sprak: flagga('sprak'), kopare: flagga('kopare'), ny: har('ny-faktura'), cpmOverride: cpmFlagga(), land: flagga('land') });
    if (r.fel.length) { console.log(`Fakturan kan inte byggas: ${r.fel.join('; ')}\n(--utan-faktura skickar brevet utan faktura)`); process.exitCode = 1; return; }
    faktura = r.faktura;
  }
  // --med-anmalan: Axel har sagt både "skicka" och "kör anmälningarna" — brevet säger då att annonserna anmäls samtidigt.
  // --utan-meta (Axel 2026-09-29): brevet, sms:et och påminnelsen nämner inte Meta alls — minnet i ärendet (brev.utanMeta).
  const utanMeta = har('utan-meta') || Boolean(a.brev?.utanMeta);
  const { brev, avs } = await brevFor(a, k, { sprak: flagga('sprak'), paminnelse, mottagare: flagga('till'), via, faktura: paminnelse ? null : faktura, anmalanSamtidigt: har('med-anmalan') && !utanMeta, anmalanAntal: antalFlagga(), utanMeta });
  const fel = kontrolleraBrev(brev, { egna });
  const bilagor = paminnelse && a.faktura?.fil ? [a.faktura.fil] : [];
  const paket = byggSandpaket(a, brev, { faktura: paminnelse ? null : faktura, via, bilagor });
  const mapp = join(ARENDEMAPP, a.id); mkdirSync(mapp, { recursive: true });
  const namn = paminnelse ? 'paminnelse' : 'brev';
  // Gmail-vägen: brevet går ordagrant som PDF och mejlet bär en följetext utan en enda länk —
  // Gmail-connectorn gör om varje länk och domän till en Google-omdirigering (mätt 2026-09-29,
  // brevpdf.mjs). Loopia-vägen skickar texten orörd och behöver det inte.
  if (via === 'gmail') {
    const s = faktura?.saljare ?? a.faktura?.saljare ?? {};
    const avsandare = { namn: s.namn ?? 'Stonebite Ecom AB', adress: s.adress ?? null, mail: brev.fran ?? s.mail ?? null };
    const fristM = brev.text.match(/(?:senast|sista frist till|no later than|final deadline of) (.+?\((?:svensk tid|Swedish time)\))/);
    const frist = fristM?.[1] ?? fristText(new Date(nu), paminnelse ? (k.brev.paminnelse_timmar ?? 24) : (k.brev.svarsfrist_timmar ?? 48), brev.sprak);
    const derasNamn = [a.deras?.sidnamn, a.deras?.foretag, a.deras?.titel].find((x) => x && !harLankbartOrd(x)) ?? (brev.sprak === 'en' ? 'your business' : 'er verksamhet');
    writeFileSync(join(mapp, `${namn}.pdf`), brevPdf({ amne: brev.amne, text: brev.text, till: brev.mottagare, fran: brev.fran, avsandare, datum: nu.slice(0, 10), arende: a.id, sprak: brev.sprak, skapad: new Date(nu) }));
    paket.brevPdf = `arenden/${a.id}/${namn}.pdf`;
    paket.bilagor = [paket.brevPdf, ...paket.bilagor];
    paket.omslag = foljetext({ sprak: brev.sprak, mottagare: derasNamn, arende: a.id, fakturaNr: paminnelse ? null : faktura?.nr ?? null, belopp: !paminnelse && faktura ? belopp(faktura.brutto, faktura.valuta, faktura.sprak) : null, frist, avsandare, paminnelse });
    if (harLankbartOrd(paket.omslag)) fel.push('följetexten bär en länk eller domän — Gmail-connectorn gör om den till en Google-omdirigering');
  }
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
  const upp = { ...a, faktura: paminnelse ? a.faktura ?? null : faktura, brev: { ...(a.brev ?? {}), mottagare: brev.mottagare ?? a.brev?.mottagare ?? null, fran: brev.fran, sprak: brev.sprak, amne: brev.amne, ...(utanMeta ? { utanMeta: true } : {}), paket: { nar: nu, via, fil: `arenden/${a.id}/${namn}.json`, paminnelse, stoppad: fel.length ? fel : null, anmalanAntal: utanMeta ? 0 : har('med-anmalan') ? (antalFlagga() ?? a.anmalan?.antal ?? null) : null } } };
  sparaArende(upp, ARENDEFIL, { nu }); skrivArendefiler(upp); arenden.set(upp.id, upp);
  await byggSidaFil({ k, arenden });
  if (fel.length) { console.log('Paketet är skrivet men ska inte gå förrän stoppen ovan är lösta.'); process.exitCode = 1; return; }
  console.log(`Sändpaketet ligger i konkurrenter/arenden/${a.id}/${namn}.json (brevet i ${namn}.txt${paket.bilagor.length ? `, bilagor: ${paket.bilagor.map((b) => `konkurrenter/${b}`).join(', ')}` : ''}).${paket.omslag ? `\nMejlets text är FÖLJETEXTEN (paketets "omslag", ingen länk) — brevet går som ${paket.brevPdf}:\n\n${paket.omslag}\n` : ''}\nNästa steg: sessionen lägger det som utkast i Stonebite-Gmail (följetexten som text, bilagorna som PDF), läser tillbaka det och skickar. När det gått ut: node konkurrenter/kor.mjs --skickad ${a.id}${paminnelse ? ' --paminnelse' : ''}${brev.mottagare ? '' : ' --till <adress>'}`);
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

/**
 * --anmal <id>: Meta-anmälningarna, EN per kopierad annons (Axels order
 * 2026-09-29). Bygger bevisbilden per annons (vårt ↔ deras, PNG i Chromium),
 * lägger den publikt på butikens CDN när det går, skriver fältpaketen
 * arenden/<id>/anmalan/<nr>.json + .txt och verifieringssidan
 * verifiering.html. Skickar INGET — det gör sessionen i Axels Chrome efter
 * hans enda ok, och kvitterar med --anmald.
 */
async function anmal() {
  const k = konfig();
  const { arenden, a } = hamtaArende(flagga('anmal'));
  const nu = new Date().toISOString();
  // Ett nytt bygge skriver över rapporterna — aldrig över en anmälan som redan gått in (kvittot hade försvunnit).
  const inskickade = (a.anmalan?.rapporter ?? []).filter((r) => r.inskickad || r.referens);
  if (inskickade.length && !har('tvinga')) { console.log(`⚠️ Stoppat: ${inskickade.length} anmälning(ar) i ${a.id} är redan inskickade (nr ${inskickade.map((r) => r.nr).join(', ')}) — ett nytt bygge skulle skriva över kvittona. --tvinga bygger ändå.`); process.exitCode = 1; return; }
  const allaTraffar = (a.bevis?.annonser ?? []).filter((t) => t.text?.styrka || t.bilder?.length || t.klipp?.antal || t.klippStatus);
  // --bara-aktiva: bara annonserna som är live anmäls (Axel 2026-09-29 om ORVO:s 14 avstängda IBC-kopior: "det var så få, så strunt i dem") — de står kvar som bevis i brevet.
  const iOmfang = har('bara-aktiva') ? allaTraffar.filter((t) => t.aktiv !== false) : allaTraffar;
  const hoppadeInaktiva = allaTraffar.length - iOmfang.length;
  if (hoppadeInaktiva) logg(`  ${hoppadeInaktiva} inaktiva annons(er) anmäls inte (--bara-aktiva) — de finns kvar som bevis i ärendet`);
  const ov = overifieradFel(a, iOmfang);
  if (ov) { console.log(`⚠️ Stoppat: ${ov}`); process.exitCode = 1; return; }
  // Bara det som är BEVISAT med vårt eget material anmäls (bevisStatus) — och bara med länk. Numreringen följer den här listan.
  const tidigaHopp = [];
  const annonser = iOmfang.filter((t) => {
    const st = bevisStatus(t);
    if (!st.bevisad) { tidigaHopp.push({ nr: t.nr, orsak: `inte bevisad med vårt eget material: ${st.orsak}` }); return false; }
    if (!annonsLank(t.lank).lank) { tidigaHopp.push({ nr: t.nr, orsak: 'ingen Ad Library-länk' }); return false; }
    return true;
  });
  for (const h of tidigaHopp) logg(`  annons ${h.nr} anmäls inte: ${h.orsak}`);
  if (!annonser.length) { console.log(`${a.id} har inga bevisade annonsträffar att anmäla (typ ${a.typ}${hoppadeInaktiva ? `, ${hoppadeInaktiva} inaktiva hoppade` : ''}${tidigaHopp.length ? `, ${tidigaHopp.length} obevisade/utan länk` : ''}). Meta-anmälan gäller kopierade ANNONSER — en kopierad sajt går via brevet.`); process.exitCode = 1; return; }
  const mapp = join(ARENDEMAPP, a.id, 'anmalan'); mkdirSync(mapp, { recursive: true });
  const undertecknare = { ...(k.anmalan?.undertecknare ?? {}), ...(flagga('namn') ? { namn: flagga('namn') } : {}), ...(flagga('epost') ? { epost: flagga('epost') } : {}), ...(flagga('telefon') ? { telefon: flagga('telefon') } : {}) };

  // Klippen (Axel 2026-09-29): bär ärendet valda rutor ur våra egna klipp (--klipp) byggs kortet ur dem —
  // aldrig ur miniatyrträffen, den är det lånade klippet. Saknas rutfilerna (cache i output/) stoppar vi
  // hellre än att falla tillbaka på den gamla bilden.
  const klippfil = lasJson(join(mapp, 'klipp.json'), null);
  const dataUri = (rel) => { const f = rel ? join(DATAMAPP, rel) : null; return f && existsSync(f) ? `data:image/jpeg;base64,${readFileSync(f).toString('base64')}` : null; };
  const klippen = {}; const klippFel = [];
  for (const t of annonser) {
    if (!t.klipp?.antal) continue;
    const p = klippfil?.per?.[t.nr];
    const val = (p?.val ?? []).map((v) => ({ ...v, egenData: dataUri(v.egenFil), derasData: dataUri(v.derasFil) }));
    if (!val.length || val.some((v) => !v.egenData || !v.derasData)) { klippFel.push(`annons ${t.nr}: rutorna ur våra klipp saknas i output/klipp — kör node konkurrenter/kor.mjs --klipp ${a.id} igen`); continue; }
    klippen[t.nr] = { val, statistik: p.statistik ?? {}, uteslutna: (p.uteslutna ?? []).map((v) => ({ ...v, egenData: dataUri(v.egenFil), derasData: dataUri(v.derasFil) })), egen: p.egen ?? null };
  }
  if (klippFel.length) { console.log(`⚠️ Stoppat: ${klippFel.join('; ')}`); process.exitCode = 1; return; }
  if (Object.keys(klippen).length) logg(`  bevisbilderna byggs ur våra egna klipp för ${Object.keys(klippen).length} av ${annonser.length} annonser (klipp.json)`);
  // Originalen i annonsbiblioteket (--original): ledfilmens annons blir formulärets exempel — utan den är exemplet vår sidas lista.
  const original = lasJson(join(mapp, 'original.json'), null)?.filmer ?? null;
  const { originalFor } = await import('./original.mjs');
  // Samma regel som anmalan.mjs: ledfilmen först, annars nästa film med en hittad annons — varnas bara när ingen finns.
  const utanOriginal = annonser.filter((t) => t.klipp?.antal && !originalFor(t.klipp, original ?? {}).length).map((t) => t.nr);
  if (utanOriginal.length) logg(`  ⚠️ ${utanOriginal.length} annons(er) utan vår egen annons som exempel (${utanOriginal.join(', ')}) — exemplet blir vår sidas lista i annonsbiblioteket. Kör först: node konkurrenter/kor.mjs --original ${a.id}`);
  else if (original) logg(`  originalen: ledfilmens annons i annonsbiblioteket är exemplet i alla ${annonser.filter((t) => t.klipp?.antal).length} filmanmälningar (original.json)`);

  // Bilderna till bevisbilden: ärendets miniatyrer + det som saknas hämtas nu (Chromium behövs ändå för PNG:n).
  const miniatyrer = { ...(a.miniatyrer ?? {}) };
  const bevisbilder = {};
  if (!har('utan-bevisbild')) {
    let hashare = null;
    try {
      hashare = await startaHashare({ logg });
      const behov = [...new Set(annonser.flatMap((t) => [t.varAnnons?.bild, ...(t.bilder ?? []).flatMap((b) => [b.egen, b.deras])]).concat([a.var?.produkt?.bilder?.[0], a.var?.annons?.bild]).filter((u) => u && !miniatyrer[u]))];
      if (behov.length) { const m = await hashaLankar(behov, { hashare, cache: null, medMiniatyr: true, logg, max: 40 }); for (const [u, v] of m.hashar) if (v.miniatyr) miniatyrer[u] = v.miniatyr; }
      await hashare.stang(); hashare = null;
      const antal = annonser.length;
      for (let i = 0; i < annonser.length; i++) {
        const t = annonser[i];
        const html = bevisbildHtml(a, t, { miniatyr: (u) => miniatyrer[u] ?? null, nu, nr: i + 1, antal, klipp: klippen[t.nr] ?? null, original });
        const fil = join(mapp, `bevis-${i + 1}.png`);
        try { await bevisbildPng(html, fil, { jpg: fil.replace(/\.png$/, '.jpg') }); bevisbilder[t.nr] = { fil: fil.replace(`${DATAMAPP}/`, ''), url: null }; logg(`  bevisbild ${i + 1}/${antal}: ${basename(fil)}`); }
        catch (e) { logg(`  ⚠️ bevisbild ${i + 1}: ${e.message}`); }
      }
    } catch (e) { logg(`  ⚠️ Chromium: ${e.message} — anmälningarna byggs utan bevisbild`); if (hashare) await hashare.stang().catch(() => {}); }
    // Publik länk på butikens CDN (Metas formulär tar inte alltid bilagor).
    if (!har('utan-cdn') && k.anmalan?.cdn_butik && Object.keys(bevisbilder).length) {
      try {
        const { lasButik, skapaKlient } = await import('../sparning/butik.mjs');
        const { tillShopify } = await import('../matstrumpor/thumbnails.mjs');
        const klient = await skapaKlient(lasButik(k.anmalan.cdn_butik));
        for (const [nr, b] of Object.entries(bevisbilder)) { try { b.url = await tillShopify(klient, join(DATAMAPP, b.fil), { mime: 'image/png' }); logg(`  CDN ${nr}: ${b.url}`); } catch (e) { logg(`  ⚠️ CDN ${nr}: ${e.message}`); } }
      } catch (e) { logg(`  ⚠️ CDN: ${e.message} — bevisbilden följer bara som bilaga`); }
    }
  }
  const bygget = byggAnmalningar({ ...a, bevis: { ...a.bevis, annonser } }, k, { undertecknare, nu, bevisbilder, original });
  const { anmalningar } = bygget;
  const hoppade = [...tidigaHopp, ...bygget.hoppade];
  if (!anmalningar.length) { console.log(`Inga anmälningar byggda: ${hoppade.map((h) => `annons ${h.nr}: ${h.orsak}`).join('; ') || 'inga annonser med länk'}`); process.exitCode = 1; return; }
  const fel = anmalningar.flatMap(kontrolleraAnmalan);
  for (const an of anmalningar) { skrivJson(join(mapp, `${an.nr}.json`), an); writeFileSync(join(mapp, `${an.nr}.txt`), `${anmalanText(an)}\n`); }
  // Verifieringssidan bäddar in den lätta JPEG:en (skala 1) — PNG:en (skala 2) är Metas; tio PNG:er gav 34,6 MB.
  const bilder = Object.fromEntries(anmalningar.filter((an) => an.bevisbild && existsSync(join(DATAMAPP, an.bevisbild))).map((an) => { const jpg = join(DATAMAPP, an.bevisbild.replace(/\.png$/, '.jpg')); return [an.nr, existsSync(jpg) ? `data:image/jpeg;base64,${readFileSync(jpg).toString('base64')}` : `data:image/png;base64,${readFileSync(join(DATAMAPP, an.bevisbild)).toString('base64')}`]; }));
  // Gamla filer från ett större bygge (fler anmälningar förra gången) tas bort, så att mappen bara bär det som gäller.
  for (const f of readdirSync(mapp)) { const m = f.match(/^(?:bevis-)?(\d+)\.(?:json|txt|png)$/); if (m && Number(m[1]) > anmalningar.length) { try { unlinkSync(join(mapp, f)); logg(`  gammal fil borttagen: ${f}`); } catch { /* ok */ } } }
  writeFileSync(join(mapp, 'verifiering.html'), verifieringHtml({ arende: a, anmalningar, bilder, klippen, hoppade, uppdaterad: nu }));
  const upp = { ...a, miniatyrer, anmalan: { byggd: nu, antal: anmalningar.length, hoppade, baraAktiva: har('bara-aktiva'), hoppadeInaktiva, stoppad: fel.length ? fel : null, verifiering: `arenden/${a.id}/anmalan/verifiering.html`, rapporter: anmalningar.map((an) => ({ nr: an.nr, lank: an.lank, libraryId: an.libraryId, annonsNr: an.annonsNr, bevisbild: an.bevisbild, bevisbildUrl: an.bevisbildUrl, fil: `arenden/${a.id}/anmalan/${an.nr}.json`, status: 'utkast', referens: null, inskickad: null })) } };
  sparaArende(upp, ARENDEFIL, { nu }); skrivArendefiler(upp, { miniatyrer }); arenden.set(upp.id, upp);
  console.log(`${anmalningar.length} anmälning${anmalningar.length === 1 ? '' : 'ar'} byggd${anmalningar.length === 1 ? '' : 'a'} för ${a.id} (en per annons)${hoppade.length ? `, ${hoppade.length} hoppad(e): ${hoppade.map((h) => `annons ${h.nr} ${h.orsak}`).join(', ')}` : ''}:`);
  for (const an of anmalningar) console.log(`  ${an.nr}/${an.antal}: ${an.lank}${an.exponeringar ? ` · ${an.exponeringar} exponeringar` : ''} · bevisbild ${an.bevisbild ? (an.bevisbildUrl ? 'PNG + CDN-länk' : 'PNG (ingen CDN-länk)') : 'SAKNAS'}`);
  console.log(`Fälten: konkurrenter/arenden/${a.id}/anmalan/<nr>.json (.txt = samma i klartext) · verifieringssidan: konkurrenter/arenden/${a.id}/anmalan/verifiering.html`);
  if (fel.length) { console.log(`⚠️ Stoppat: ${[...new Set(fel)].join('; ')}`); process.exitCode = 1; return; }
  console.log(`Nästa steg: publicera verifieringssidan till Axel. Torrkör formuläret härifrån med: node konkurrenter/kor.mjs --anmal-skicka ${a.id} (allt fylls i, inget skickas). På hans "kör anmälningarna ${a.id}": node konkurrenter/kor.mjs --anmal-skicka ${a.id} --ja — en anmälan i taget, koden ur Gmail skrivs i konkurrenter/arenden/${a.id}/anmalan/kod.txt, kvittot skrivs av sig självt (för hand: --anmald ${a.id} --nr <n> --referens <r>).`);
}

/**
 * --klipp <id> [--antal 3] [--lanat <anmälan>:<bokstav>,…] [--alla]: bevisrutorna
 * ur VÅRA EGNA klipp (Axel 2026-09-29: miniatyrerna — annonsernas förhandsbilder
 * — var de lånade klippen, resten av filmerna är våra AI-klipp). Deras video
 * laddas ner ur annonsbiblioteket och vår ur Meta, rutor tas var halva sekund
 * och matchas; scenen som bär miniatyren (och det Axel pekat ut med --lanat)
 * kastas, och 3 par ur olika scener väljs per annons. Skriver
 * arenden/<id>/anmalan/klipp.json (facit, committas), rutorna i output/klipp/<id>/
 * (cache) och en sammanfattning på ärendets annonser — --anmal bygger sedan
 * bevisbilden ur paren och vägrar den gamla rutan.
 */
async function klipp() {
  const k = konfig();
  const { arenden, a } = hamtaArende(flagga('klipp'));
  const ff = hittaFfmpeg();
  if (!ff.bin) { console.log(`ffmpeg med H.264 saknas${ff.provade.length ? ` (provade utan H.264: ${ff.provade.join(', ')})` : ''} — installera: pip3 install --user imageio-ffmpeg, eller sätt FFMPEG=<sökväg>.`); process.exitCode = 1; return; }
  const nu = new Date().toISOString();
  const antal = Number(flagga('antal', 3)) || 3;
  const allaTraffar = (a.bevis?.annonser ?? []).filter((t) => t.text?.styrka || t.bilder?.length);
  const baraAktiva = har('bara-aktiva') || (!har('alla') && Boolean(a.anmalan?.baraAktiva));
  const annonser = baraAktiva ? allaTraffar.filter((t) => t.aktiv !== false) : allaTraffar;
  if (!annonser.length) { console.log(`${a.id} har inga annonsträffar att välja rutor för.`); process.exitCode = 1; return; }
  const mapp = join(ARENDEMAPP, a.id, 'anmalan'); mkdirSync(mapp, { recursive: true });
  const cache = join(OUTPUT, 'klipp', a.id); mkdirSync(cache, { recursive: true });
  const klippfil = join(mapp, 'klipp.json');
  const gammal = lasJson(klippfil, { per: {}, lanade_hashar: [] });
  const lanade = new Set(gammal.lanade_hashar ?? []);
  const lanadePar = [...(gammal.lanade_par ?? [])]; // --lanat: hela TAGNINGEN är lånad (hos dem och i vår film), inte bara rutan
  // --lanat 3:B = anmälans nummer + rutans bokstav på verifieringssidan ⇒ båda rutornas hashar utesluts i alla annonser.
  for (const del of String(flagga('lanat', '')).split(',').map((s) => s.trim()).filter(Boolean)) {
    const m = del.match(/^(\d+)\s*[:-]\s*([A-Za-z])$/);
    if (!m) { console.log(`--lanat: förstår inte "${del}" — skriv <anmälan>:<bokstav>, till exempel 3:B`); process.exitCode = 1; return; }
    const rapport = (a.anmalan?.rapporter ?? []).find((r) => String(r.nr) === m[1]);
    const annonsNr = rapport?.annonsNr ?? Number(m[1]);
    const par = gammal.per?.[annonsNr]?.val?.find((v) => v.bokstav === m[2].toUpperCase());
    if (!par) { console.log(`--lanat ${del}: ingen ruta ${m[2].toUpperCase()} för anmälan ${m[1]} (annons ${annonsNr}) i klipp.json`); process.exitCode = 1; return; }
    lanade.add(par.egenHash); lanade.add(par.derasHash);
    lanadePar.push({ annonsNr, derasT: par.derasT, filmId: par.egenFilm?.id ?? null, egenT: par.egenT, film: par.egenFilm?.namn ?? null, nar: new Date().toISOString() });
    logg(`  lånat klipp utpekat: anmälan ${m[1]} ruta ${m[2].toUpperCase()} (annons ${annonsNr}, deras ${tid(par.derasT)}) — utesluts överallt`);
  }
  // Deras videolänkar ur annonsfilen för sidan som bär flest av ärendets annonser (landet följer med av
  // sig självt — SE-filen heter .annonser-<id>.json, andra länder .annonser-<id>-NO.json); senaste vid lika.
  const sidaId = a.deras?.sidaId ?? null;
  const filer = existsSync(OUTPUT) && sidaId ? readdirSync(OUTPUT).filter((f) => new RegExp(`\\.annonser-${sidaId}(-[A-Z]{2})?\\.json$`).test(f)).sort() : [];
  const arendetsId = new Set((a.bevis?.annonser ?? []).map((t) => String(t.lank ?? '').match(/[?&]id=(\d+)/)?.[1]).filter(Boolean));
  let annonsfil = null; let flest = -1;
  for (const f of filer) {
    const d = lasJson(join(OUTPUT, f), null);
    const n = (d?.annonser ?? []).filter((x) => arendetsId.has(String(x.id))).length;
    if (d && n >= flest) { flest = n; annonsfil = d; }
  }
  const videoUrl = new Map((annonsfil?.annonser ?? []).map((x) => [String(x.id), x.videoUrl ?? null]));
  if (!annonsfil) logg(`  ⚠️ ingen annonsfil för sidan ${sidaId ?? '?'} i output/ — kör --hamta --annonser-sida ${sidaId ?? '<sid-id>'} först`);
  const { skapaKlient } = await import('../kommentarer/meta.mjs');
  const klient = skapaKlient({ token: process.env.META_ACCESS_TOKEN, logg: () => {} }); // standard-backoff: väntar vid kod 17 i stället för att kasta
  const rel = (f) => f.replace(`${DATAMAPP}/`, '');
  const hashUrDataUri = (dataUri, fil) => { try { const m = String(dataUri ?? '').match(/^data:([^;]+);base64,(.+)$/); if (!m) return null; writeFileSync(fil, Buffer.from(m[2], 'base64')); return hashUrBild(ff.bin, fil); } catch { return null; } };
  // Konto → verksamhet (konfig.verksamheter): vilken av våra sidor filmen går på.
  const kontoTill = new Map(Object.entries(k.verksamheter ?? {}).flatMap(([namn, v]) => (v.konton ?? []).map((x) => [String(x.id).replace(/^act_/, ''), namn])));

  // Biblioteket: ALLA våra filmer för produkten — annonser i våra konton med samma namnprefix som de träffade
  // (aktiva och pausade; mätt 2026-09-29: ORVO klipper ur många av våra filmer, inte bara den miniatyren pekade på).
  const prefixer = [...new Set(annonser.map((t) => prefixUrNamn(t.varAnnons?.namn)).filter(Boolean))];
  const konton = Object.values(k.verksamheter ?? {}).flatMap((v) => v.konton ?? []);
  const bibliotekFil = join(cache, 'bibliotek.json');
  let bibliotek = har('utan-bibliotek') ? null : lasJson(bibliotekFil, null);
  if (bibliotek && ((bibliotek.version ?? 1) < BIBLIOTEK_VERSION || prefixer.some((p) => !(bibliotek.prefixer ?? []).includes(p)))) bibliotek = null; // gammalt format eller ny produkt ⇒ läs om
  if (!bibliotek && !har('utan-bibliotek') && prefixer.length) {
    logg(`  biblioteket: våra filmer med prefix ${prefixer.join(', ')} i ${konton.length} konton …`);
    const b = await egnaFilmer(klient, konton, prefixer, { logg, max: Number(flagga('max-filmer', 500)) || 500 });
    bibliotek = { version: BIBLIOTEK_VERSION, byggt: nu, prefixer, filmer: b.filmer, status: b.status };
    skrivJson(bibliotekFil, bibliotek);
  }
  const poster = new Map(); // videoId eller annons:<id> → { videoId?, ider?, annonsId, namn, konto, skapad }
  for (const f of bibliotek?.filmer ?? []) poster.set(f.videoId, f);
  for (const t of annonser) { const id = t.varAnnons?.id; if (id && ![...poster.values()].some((f) => f.annonsId === id)) poster.set(`annons:${id}`, { annonsId: id, namn: t.varAnnons?.namn ?? null, ider: null }); }
  // Varje film laddas ner och hashas EN gång (cache: egen-<videoId>.mp4 + rutor-<videoId>.json, version RUTOR_VERSION).
  const filmer = []; const filmFel = [];
  for (const f of poster.values()) {
    try {
      const meta = { skapad: f.skapad ?? null, konto: f.konto ?? null, verksamhet: f.konto ? kontoTill.get(String(f.konto).replace(/^act_/, '')) ?? null : null };
      // Cachen först: finns rutor-<video>.json för något av filmens id:n behövs varken Meta eller nedladdning (131 anrop annars, mätt 2026-09-29).
      let cachad = (f.ider ?? [f.videoId]).filter(Boolean).map((id) => lasJson(join(cache, `rutor-${id}.json`), null)).find(Boolean);
      if (cachad && (cachad.version ?? 1) < RUTOR_VERSION) {
        // Äldre cache utan kontrast: bygg om rutorna ur den sparade filmen (eller bilderna) — inget nytt anrop.
        const v = cachad.version ?? 1;
        if (cachad.fil && existsSync(join(DATAMAPP, cachad.fil))) { const f2 = join(DATAMAPP, cachad.fil); cachad = { ...cachad, version: RUTOR_VERSION, rutor: v < 2 ? rutorUrVideo(ff.bin, f2) : cachad.rutor, byten: klippbyten(ff.bin, f2) }; }
        else if (cachad.kalla === 'thumbnails') cachad = { ...cachad, version: RUTOR_VERSION, rutor: v < 2 ? cachad.rutor.map((r) => ({ ...r, ...(bildRuta(ff.bin, join(DATAMAPP, r.fil)) ?? {}) })) : cachad.rutor, byten: null };
        else cachad = null;
        if (cachad) skrivJson(join(cache, `rutor-${cachad.id}.json`), cachad);
      }
      if (cachad) { if (!filmer.some((x) => x.id === cachad.id)) filmer.push({ ...cachad, ...meta, skapad: meta.skapad ?? cachad.skapad ?? null }); continue; }
      const kalla = f.ider?.length ? { namn: f.namn, skapad: f.skapad ?? null, ...(await videoKalla(klient, f.ider)) } : await varVideo(klient, f.annonsId);
      if (kalla.fel) throw new Error(kalla.fel);
      const id = kalla.videoId;
      if (filmer.some((x) => x.id === id)) continue;
      let post;
      if (kalla.kalla === 'source') {
        const fil = join(cache, `egen-${id}.mp4`);
        if (!existsSync(fil)) { const h = await hamtaFil(kalla.source, fil); logg(`  vår ${kalla.namn ?? f.namn ?? id}: film ${Math.round(h.byte / 1e5) / 10} MB`); }
        post = { version: RUTOR_VERSION, id, namn: kalla.namn ?? f.namn ?? null, annonsId: f.annonsId, fil: rel(fil), kalla: 'source', langd: kalla.langd ?? langd(ff.bin, fil), skapad: kalla.skapad ?? meta.skapad, rutor: rutorUrVideo(ff.bin, fil), byten: klippbyten(ff.bin, fil) };
      } else {
        const rutor = [];
        for (let i = 0; i < kalla.thumbnails.length; i++) {
          const fil = join(cache, `egen-${id}-thumb-${i}.jpg`);
          try { if (!existsSync(fil)) await hamtaFil(kalla.thumbnails[i], fil); const r = bildRuta(ff.bin, fil); if (r) rutor.push({ i, t: null, ...r, fil: rel(fil) }); } catch {}
        }
        logg(`  vår ${kalla.namn ?? f.namn ?? id}: Meta lämnar ingen source — ${rutor.length} thumbnails som rutor`);
        post = { version: RUTOR_VERSION, id, namn: kalla.namn ?? f.namn ?? null, annonsId: f.annonsId, fil: null, kalla: 'thumbnails', langd: kalla.langd ?? null, skapad: kalla.skapad ?? meta.skapad, rutor, byten: null };
      }
      skrivJson(join(cache, `rutor-${id}.json`), post);
      filmer.push({ ...post, ...meta, skapad: meta.skapad ?? post.skapad ?? null });
    } catch (e) { filmFel.push(`${f.namn ?? f.annonsId ?? f.videoId}: ${e.message}`); }
  }
  if (!filmer.length) { console.log(`Ingen av våra filmer gick att läsa: ${filmFel.join('; ')}`); process.exitCode = 1; return; }
  const utanDatum = filmer.filter((f) => !f.skapad).length;
  logg(`  ${filmer.length} av våra filmer i jämförelsen (${filmer.reduce((s, f) => s + f.rutor.length, 0)} rutor)${utanDatum ? ` · ${utanDatum} utan publiceringsdatum` : ''}${filmFel.length ? ` · ${filmFel.length} gick inte: ${filmFel.join('; ')}` : ''}`);
  // Utesluts överallt: miniatyrträffarna (det lånade klippet, båda sidor, ALLA annonser i körningen) + det Axel pekat ut.
  const uteslut = new Set(lanade);
  const tummar = new Map(); // nr → hasharna för DERAS förhandsbilder (fröna nedan)
  for (const t of annonser) for (const b of t.bilder ?? []) for (const [u, vem] of [[b.egen, 'egen'], [b.deras, 'deras']]) {
    const h = hashUrDataUri(a.miniatyrer?.[u], join(cache, `mini-${t.nr}-${vem}.jpg`)); if (!h) continue;
    uteslut.add(h); if (vem === 'deras') tummar.set(t.nr, [...(tummar.get(t.nr) ?? []), h]);
  }
  // Produkten per filmprefix, ur ärendets egna annonsträffar (Takoverdrag_ → Bäverbutikens taköverdrag, CaraShellRoof_ → CaraShells takskydd …).
  const prefixKarta = new Map();
  for (const t of a.bevis?.annonser ?? []) { const p = prefixUrNamn(t.varAnnons?.namn); if (p && t.produkt?.url && !prefixKarta.has(p)) prefixKarta.set(p, t.produkt); }
  // Varv 1: deras filmer + FRÖNA till de lånade klippen. Förhandsbilden är deras allra första bildruta
  // (mätt 2026-09-29: 1–7 bitar mot rutan vid 0,00 s i alla tio takskyddsannonser, men 16–23 bitar mot
  // närmaste ruta i 2-per-sekund-serien) — tät läsning (30 rutor/s) av de första sekunderna hittar tiden.
  const derasFilmer = new Map(); // nr → { fil, rutor, fron } | { fel }
  for (const t of annonser) {
    if (!t.video) continue;
    const libraryId = String(t.lank ?? '').match(/[?&]id=(\d+)/)?.[1] ?? String(t.nr);
    const url = videoUrl.get(libraryId);
    if (!url) { derasFilmer.set(t.nr, { fel: `ingen videolänk i annonsfilen — kör --hamta --annonser-sida ${sidaId} igen` }); continue; }
    const fil = join(cache, `deras-${libraryId}.mp4`);
    try {
      if (!existsSync(fil)) { const h = await hamtaFil(url, fil); logg(`  annons ${t.nr}: deras film ${Math.round(h.byte / 1e5) / 10} MB`); }
      const rutor = rutorUrVideo(ff.bin, fil);
      const scener = tagningar(rutor, klippbyten(ff.bin, fil));
      const fron = lanadePar.filter((x) => String(x.annonsNr) === String(t.nr)).map((x) => x.derasT);
      const tumm = tummar.get(t.nr) ?? [];
      if (tumm.length) {
        const tata = rutorUrVideo(ff.bin, fil, { fps: 30, maxSek: 4 });
        for (const h of tumm) { let b = null; for (const x of tata) { const d = avstand(h, x.hash); if (!b || d < b.d) b = { d, t: x.t }; } if (b && b.d <= FRO_AVSTAND) fron.push(Math.round(b.t * 100) / 100); }
      }
      derasFilmer.set(t.nr, { fil, rutor, scener, fron });
    } catch (e) { derasFilmer.set(t.nr, { fel: e.message }); }
  }
  // Varv 2: spridningen — scenen med förhandsbilden är lånad, och allt som liknar en lånad ruta (i deras annonser och i våra filmer) likaså.
  // Deras filmer: tagningarna (hårda klipp); våra: hashhoppen — klippbytena slår ihop våra AI-klipp (mätt, se klipp.mjs).
  const lan = lanadeKlipp([...derasFilmer.entries()].filter(([, d]) => d.rutor).map(([nr, d]) => ({ nr, rutor: d.rutor, fron: d.fron, scener: d.scener })), filmer.map((f) => ({ id: f.id, rutor: f.rutor })), { fronHashar: [...lanade], fronEgna: lanadePar.filter((x) => x.filmId && x.egenT !== null && x.egenT !== undefined).map((x) => ({ id: x.filmId, t: x.egenT })) });
  const fronAntal = [...derasFilmer.values()].filter((d) => d.fron?.length).length;
  logg(`  lånade klipp: frön i ${fronAntal} av ${derasFilmer.size} filmer hos dem (förhandsbilden hittad), spritt till ${lan.deras.size} av deras och ${lan.egna.size} av våra filmer — ${lan.rutor} lånade rutor efter ${lan.varv} varv`);
  const per = {}; const nya = new Map();
  for (const t of annonser) {
    const libraryId = String(t.lank ?? '').match(/[?&]id=(\d+)/)?.[1] ?? String(t.nr);
    const rad = { nr: t.nr, libraryId, lank: t.lank ?? null, start: t.start ?? null, varAnnons: t.varAnnons ?? null, fel: null, status: null };
    try {
      if (!t.video) { rad.status = 'bild'; throw new Error('bildannons — ingen film att jämföra (texten eller bildträffen bär beviset)'); }
      const df = derasFilmer.get(t.nr);
      if (!df || df.fel) throw new Error(df?.fel ?? 'deras film saknas');
      const derasFil = df.fil; const derasRutor = df.rutor;
      rad.fron = df.fron; rad.lanadeRutor = lan.deras.get(t.nr)?.size ?? 0;
      // Bara filmer publicerade FÖRE deras annons (start ur annonsbiblioteket) kan vara originalet.
      // Fler kandidater än vi behöver: varje par KONTROLLERAS i de uttagna bilderna (samma ruta som hashades,
      // skrivRutaNr), och ett par vars bilder inte är lika byts mot nästa — kortet visar aldrig två olika bilder.
      const p = paraRutor(filmer, derasRutor, { uteslut: [...uteslut], antal: antal + 5, fore: t.start ?? null, lanadeEgnaExtra: lan.egna, lanadeDerasExtra: lan.deras.get(t.nr) ?? null, derasScener: df.scener });
      const filmFor = (v) => filmer.find((f) => f.id === v.egenFilm?.id);
      const ruta = (vem, v, namn) => {
        if (vem === 'egen' && v.egenFil) return v.egenFil; // Metas thumbnail: bilden ÄR rutan
        const fil = join(cache, namn);
        skrivRutaNr(ff.bin, vem === 'egen' ? join(DATAMAPP, filmFor(v)?.fil ?? '') : derasFil, vem === 'egen' ? v.egenI : v.derasI, fil);
        return rel(fil);
      };
      const godkanda = []; const kastade = [];
      for (const v of [...p.val].sort((x, y) => (x.rang ?? 0) - (y.rang ?? 0))) {
        if (godkanda.length >= antal) break;
        try {
          const e = ruta('egen', v, `${t.nr}-kand-${v.rang}-egen.jpg`); const d = ruta('deras', v, `${t.nr}-kand-${v.rang}-deras.jpg`);
          const he = bildRuta(ff.bin, join(DATAMAPP, e)); const hd = bildRuta(ff.bin, join(DATAMAPP, d));
          const kontroll = he && hd ? avstand(he.hash, hd.hash) : null;
          if (kontroll === null || kontroll > KONTROLL_AVSTAND) { kastade.push({ ...v, kontroll, orsak: `de uttagna bilderna skiljer sig (${kontroll ?? '?'}/64, gränsen ${KONTROLL_AVSTAND})` }); continue; }
          // Samma bild som ett redan valt par? Samma AI-klipp ligger i flera av våra filmer och kan stå två gånger i deras —
          // olika scener hos dem och olika filmer hos oss, men kortet hade visat samma bild två gånger (annons 9, 2026-09-29).
          const gra = graRuta(ff.bin, join(DATAMAPP, e));
          const lik = godkanda.map((g) => ({ g, s: skillnadOvre(gra, g.gra) })).find((x) => x.s !== null && x.s < SAMMA_TAGNING);
          if (lik) { kastade.push({ ...v, kontroll, orsak: `samma bild som paret deras ${tid(lik.g.derasT)} (${lik.s}/255, gränsen ${SAMMA_TAGNING})` }); continue; }
          godkanda.push({ ...v, egenFil: e, derasFil: d, kontroll, gra });
        } catch (err) { kastade.push({ ...v, orsak: err.message }); }
      }
      godkanda.sort((x, y) => x.derasT - y.derasT);
      const flytta = (fran, till) => { if (fran === till) return fran; copyFileSync(join(DATAMAPP, fran), join(DATAMAPP, till)); return till; };
      p.val = godkanda.map(({ gra: _g, ...v }, k) => {
        const bokstav = BOKSTAVER[k] ?? String(k + 1);
        return { ...v, k, bokstav, egenFil: v.egenFil.includes('-kand-') ? flytta(v.egenFil, rel(join(cache, `${t.nr}-${bokstav}-egen.jpg`))) : v.egenFil, derasFil: flytta(v.derasFil, rel(join(cache, `${t.nr}-${bokstav}-deras.jpg`))) };
      });
      p.kastade = kastade;
      p.uteslutna = p.uteslutna.slice(0, 3).map((v, i) => { try { return { ...v, egenFil: ruta('egen', v, `${t.nr}-lanat-${i + 1}-egen.jpg`), derasFil: ruta('deras', v, `${t.nr}-lanat-${i + 1}-deras.jpg`) }; } catch { return v; } });
      if (kastade.length) logg(`  annons ${t.nr}: ${kastade.length} par kastade i bildkontrollen (${kastade.map((x) => `${tid(x.derasT)} ↔ ${x.egenFilm?.namn ?? '?'}: ${x.orsak}`).join('; ')})`);
      Object.assign(rad, {
        deras: { video: rel(derasFil), langd: langd(ff.bin, derasFil), rutor: derasRutor.length },
        egen: { jamforda: p.statistik.filmer, senare: p.statistik.filmerSenare, anvanda: [...new Set(p.val.map((v) => v.egenFilm?.namn).filter(Boolean))], perFilm: p.statistik.perFilm },
        statistik: p.statistik, val: p.val, uteslutna: p.uteslutna, kastade: p.kastade,
      });
      if (p.val.length) rad.status = 'bevisad';
      else { rad.status = 'ej_bevisad'; rad.fel = p.kastade?.length ? `inget par höll när bilderna jämfördes (${p.kastade.length} kastade)` : p.statistik.traffar ? 'alla matchande scener bär den uteslutna (lånade) rutan' : `inga rutor hos dem matchar våra filmer publicerade före ${t.start ?? 'deras annons'} (avstånd > ${MAX_AVSTAND}/64)`; }
    } catch (e) { rad.fel = e.message; rad.status ??= 'fel'; }
    per[t.nr] = rad;
    const produkt = rad.val?.length ? produktForPar(rad.val, prefixKarta, t.produkt ?? null) : null;
    const datum = rad.val?.length ? filmdatum(rad.val) : null;
    const sammanfattning = rad.val?.length
      ? { byggd: nu, antal: rad.val.length, andel: rad.statistik.andel, traffar: rad.statistik.traffar, rutor: rad.statistik.derasRutor, lanade: rad.uteslutna?.length ?? 0, filmer: rad.egen.anvanda, perFilm: Object.fromEntries(rad.egen.anvanda.map((f) => [f, rad.egen.perFilm?.[f] ?? 0])), jamforda: rad.statistik.filmer, datum, produkt: produkt ? { handle: produkt.handle, titel: produkt.titel, url: produkt.url, butik: produkt.butik ?? null, verksamhet: produkt.verksamhet ?? null } : null, par: rad.val.map((v) => ({ bokstav: v.bokstav, derasT: v.derasT, egenT: v.egenT, egenI: v.egenI, avstand: v.avstand, kontroll: v.kontroll ?? null, stod: v.stod ?? 0, film: v.egenFilm?.namn ?? null, skapad: v.egenFilm?.skapad ?? null })) }
      : null;
    const { klipp: _k, klippFel: _f, klippStatus: _s, ...utan } = t;
    nya.set(t.nr, { ...utan, klipp: sammanfattning, klippStatus: rad.status, ...(rad.fel ? { klippFel: rad.fel } : {}) });
    const bs = bevisStatus(nya.get(t.nr));
    console.log(`  annons ${t.nr}${t.aktiv === false ? ' (avstängd)' : ''} (miniatyr ← ${t.varAnnons?.namn ?? '?'}): ${rad.val?.length ? `${rad.val.length} par ur olika scener — ${rad.val.map((v) => `${v.bokstav}: deras ${tid(v.derasT)} ↔ ${v.egenFilm?.namn ?? 'vår'} ${v.egenT === null ? `ruta ${v.egenI + 1}` : tid(v.egenT)} (${v.avstand}/64, bild ${v.kontroll}/64${v.stod ? `, grannar ${v.stod}/2` : ''})`).join(', ')} · ${rad.statistik.traffar} av ${rad.statistik.derasRutor} rutor matchar våra egna klipp (${rad.statistik.andel} %) · ${rad.statistik.uteslutnaScener} lånad(e) scen(er) utesluten (${rad.statistik.lanadeRutor} rutor)` : `⚠️ ${rad.fel}`} ⇒ ${bs.bevisad ? `BEVISAD (${bs.grund})` : `EJ BEVISAD (${bs.orsak})`}`);
  }
  skrivJson(klippfil, { byggd: nu, ffmpeg: ff.bin, fps: FPS, maxAvstand: MAX_AVSTAND, arende: a.id, lanade_hashar: [...lanade], lanade_par: lanadePar, lanade_klipp: { fron: Object.fromEntries([...derasFilmer.entries()].map(([nr, d]) => [nr, d.fron ?? null])), deras: Object.fromEntries([...lan.deras.entries()].map(([nr, x]) => [nr, x.size])), egnaFilmer: lan.egna.size, rutor: lan.rutor, varv: lan.varv }, bibliotek: { prefixer, filmer: filmer.map((f) => ({ id: f.id, namn: f.namn, annonsId: f.annonsId, kalla: f.kalla, langd: f.langd, rutor: f.rutor.length, skapad: f.skapad ?? null, verksamhet: f.verksamhet ?? null })), fel: filmFel }, per: { ...(gammal.per ?? {}), ...per } });
  const upp = { ...a, bevis: { ...a.bevis, annonser: (a.bevis?.annonser ?? []).map((t) => nya.get(t.nr) ?? t) } };
  sparaArende(upp, ARENDEFIL, { nu }); skrivArendefiler(upp); arenden.set(upp.id, upp);
  const statusar = [...nya.values()].map((t) => bevisStatus(t));
  const klara = Object.values(per).filter((r) => r.val?.length).length; const ejBevisade = statusar.filter((s) => !s.bevisad).length;
  console.log(`Klippen valda för ${klara} av ${annonser.length} annonser i ${a.id} (mot ${filmer.length} av våra filmer) → konkurrenter/arenden/${a.id}/anmalan/klipp.json (rutorna i konkurrenter/output/klipp/${a.id}/). Bevisade med vårt material: ${statusar.length - ejBevisade} av ${statusar.length}${ejBevisade ? ` — ${ejBevisade} EJ bevisade (tas inte med i anmälan, brev eller faktura)` : ''}.`);
  console.log(`Nästa steg: node konkurrenter/kor.mjs --anmal ${a.id}${baraAktiva ? ' --bara-aktiva' : ''} bygger om bevisbilderna ur paren; --faktura ${a.id} räknar om fakturan på de bevisade annonserna. Pekar Axel ut en ruta som lånad: --klipp ${a.id} --lanat <anmälan>:<bokstav> och sedan --anmal igen.`);
  if (!klara && statusar.every((s) => !s.bevisad)) process.exitCode = 1;
}

/**
 * --original <id> [--alla|--bara-aktiva] [--tvinga]: våra ORIGINALANNONSER i Metas annonsbibliotek
 * (Axel 2026-09-29: "exemplet på vårt original leder bara till produktsidan … du måste hitta annonserna
 * inne i vårt ad library"). Filmerna är de paren i klipp.json pekar på; för varje: annonsens text (Meta)
 * → en fras → annonsbibliotekets sökning → träffarna på VÅRA sidor → filmen laddas ner och jämförs ruta
 * för ruta med vår (original.mjs, lika åt båda håll ≥ 60 %). Skriver arenden/<id>/anmalan/original.json;
 * --anmal lägger ledfilmens länk i formulärets exempelfält och länkarna i 500-teckensbeskrivningen.
 */
async function original() {
  const k = konfig();
  const { a } = hamtaArende(flagga('original'));
  const ff = hittaFfmpeg();
  if (!ff.bin) { console.log('ffmpeg med H.264 saknas — installera: pip3 install --user imageio-ffmpeg, eller sätt FFMPEG=<sökväg>.'); process.exitCode = 1; return; }
  const nu = new Date().toISOString();
  const mapp = join(ARENDEMAPP, a.id, 'anmalan');
  const cache = join(OUTPUT, 'klipp', a.id);
  const klippfil = lasJson(join(mapp, 'klipp.json'), null);
  if (!klippfil) { console.log(`${a.id} saknar klipp.json — kör node konkurrenter/kor.mjs --klipp ${a.id} först.`); process.exitCode = 1; return; }
  const bevisade = (a.bevis?.annonser ?? []).filter((t) => t.klipp?.antal && bevisStatus(t).bevisad);
  const baraAktiva = har('bara-aktiva') || (!har('alla') && Boolean(a.anmalan?.baraAktiva));
  const annonser = baraAktiva ? bevisade.filter((t) => t.aktiv !== false) : bevisade;
  if (!annonser.length) { console.log(`${a.id} har inga annonser bevisade med våra klipp${baraAktiva ? ' bland de aktiva' : ''} — inget original att leta upp.`); process.exitCode = 1; return; }
  // Filmerna ur PAREN (id:t, inte bara namnet — samma namn kan ligga i flera konton), annons-id:t ur biblioteket.
  const bibliotek = new Map((klippfil.bibliotek?.filmer ?? []).map((f) => [String(f.id), f]));
  const filmer = new Map();
  for (const t of annonser) for (const v of klippfil.per?.[t.nr]?.val ?? []) if (v.egenFilm?.namn && !filmer.has(v.egenFilm.namn)) filmer.set(v.egenFilm.namn, { ...(bibliotek.get(String(v.egenFilm.id)) ?? {}), ...v.egenFilm });
  const varaSidor = Object.values(k.anmalan?.vara_sidor ?? {}).map(String);
  if (!varaSidor.length) { console.log('konkurrenter/konfig.json → anmalan.vara_sidor saknas — vilka sidor som är våra går inte att avgöra.'); process.exitCode = 1; return; }
  const fil = join(mapp, 'original.json');
  const ut = { ...(lasJson(fil, { filmer: {} }).filmer ?? {}) };
  const { skapaKlient } = await import('../kommentarer/meta.mjs');
  const klient = skapaKlient({ token: process.env.META_ACCESS_TOKEN, logg: () => {} });
  const { startaWebblasare } = await import('./adlibrary.mjs');
  const { hittaOriginal } = await import('./original.mjs');
  let webb = null; let page = null;
  logg(`  ${filmer.size} av våra filmer bär paren i ${annonser.length} annons(er) — letar upp dem i annonsbiblioteket`);
  try {
    for (const [namn, f] of filmer) {
      if (ut[namn]?.lank && !har('tvinga')) { logg(`  ${namn}: redan hittad — ${ut[namn].lank}`); continue; }
      const rutor = lasJson(join(cache, `rutor-${f.id}.json`), null)?.rutor;
      if (!rutor?.length) { ut[namn] = { fel: `rutorna saknas i output/klipp/${a.id}/rutor-${f.id}.json — kör --klipp ${a.id} igen`, provad: nu }; continue; }
      if (!f.annonsId) { ut[namn] = { fel: 'annons-id saknas i klipp.json:s bibliotek', provad: nu }; continue; }
      let text = '';
      try { const ad = await klient.get(`${f.annonsId}?fields=creative{body,object_story_spec{link_data{message},video_data{message}},asset_feed_spec{bodies{text}}}`); text = textUrAnnons(ad.creative ?? {}); }
      catch (e) { ut[namn] = { fel: `annonstexten gick inte att läsa (${f.annonsId}): ${e.message}`, provad: nu }; continue; }
      if (!webb) { webb = await startaWebblasare(); page = await webb.ctx.newPage(); }
      logg(`  ${namn} (${f.verksamhet ?? '?'}, annons ${f.annonsId}):`);
      const r = await hittaOriginal(page, { film: { namn, rutor, sida: k.anmalan.vara_sidor?.[f.verksamhet] ?? null }, text, varaSidor, ffmpeg: ff.bin, mapp: join(cache, 'bibliotek-original'), logg, maxProva: 10 });
      ut[namn] = { ...r, filmId: String(f.id), annonsId: f.annonsId, verksamhet: f.verksamhet ?? null, skapad: f.skapad ?? null, provad: nu };
      logg(r.lank ? `    ✓ ${r.lank} (${r.sida ?? r.sidaId}, start ${r.start ?? '?'}, lika ${Math.round(r.andel * 100)} / ${Math.round(r.tackning * 100)} %)` : `    ✗ ${r.fel}`);
    }
  } finally { if (webb) await webb.browser.close().catch(() => {}); }
  skrivJson(fil, { byggd: nu, arende: a.id, filmer: ut });
  const { originalFor } = await import('./original.mjs');
  let utan = 0;
  console.log(`Originalen i annonsbiblioteket för ${a.id} → konkurrenter/arenden/${a.id}/anmalan/original.json:`);
  for (const t of annonser) {
    const o = originalFor(t.klipp, ut);
    if (!o.length) utan++;
    const sen = o[0]?.start && t.start && String(o[0].start).slice(0, 10) > String(t.start).slice(0, 10) ? ` ⚠️ vår annons startade ${o[0].start}, efter deras ${t.start} (filmen publicerades ändå ${String(ut[o[0].film]?.skapad ?? '?').slice(0, 10)})` : '';
    console.log(`  annons ${t.nr}: ${o.length ? `${o[0].film} → ${o[0].lank}${o.length > 1 ? ` (+${o.length - 1} till)` : ''}${sen}` : `⚠️ ingen av filmerna ${(t.klipp.filmer ?? []).join(', ')} hittades — exemplet blir vår sidas lista i annonsbiblioteket`}`);
  }
  const hittade = Object.values(ut).filter((x) => x.lank).length;
  console.log(`${hittade} av ${filmer.size} filmer hittade${utan ? ` · ${utan} annons(er) utan eget original` : ''}. Nästa steg: node konkurrenter/kor.mjs --anmal ${a.id}${baraAktiva ? ' --bara-aktiva' : ''} bygger om anmälningarna med länkarna.`);
  if (!hittade) process.exitCode = 1;
}

/** Kvittot för EN inskickad anmälan — delas av --anmald (Axels hand) och --anmal-skicka (formuläret härifrån). Kastar när anmälan saknas eller redan är kvitterad. Ren. */
function kvitteraAnmalan(a, { nr, referens = null, nu = new Date().toISOString(), av = 'axel', kvitto = null, kvittoText = null }) {
  const rapporter = a.anmalan?.rapporter ?? [];
  const r = rapporter.find((x) => x.nr === nr);
  if (!r) throw new Error(`${a.id} har ingen anmälan ${nr} — bygg dem med --anmal ${a.id} först (finns: ${rapporter.map((x) => x.nr).join(', ') || 'inga'}).`);
  if (r.status === 'inskickad') throw new Error(`Anmälan ${nr} är redan kvitterad ${r.inskickad} (referens ${r.referens ?? '—'}) — en anmälan skickas aldrig två gånger.`);
  const nya = rapporter.map((x) => (x.nr === nr ? { ...x, status: 'inskickad', referens, inskickad: nu, ...(kvitto ? { kvitto } : {}), ...(kvittoText ? { kvittoText: String(kvittoText).slice(0, 600) } : {}) } : x));
  const alla = nya.every((x) => x.status === 'inskickad');
  let upp = { ...a, anmalan: { ...a.anmalan, rapporter: nya, klar: alla ? nu : null }, historik: [...(a.historik ?? []), { nar: nu, fran: a.status, till: a.status, av, not: `Meta-anmälan ${nr}/${rapporter.length} inskickad${referens ? ` (referens ${referens})` : ''}` }] };
  if (alla) { try { upp = overgang(upp, STATUS.ESKALERAD, { av, nu, not: `alla ${rapporter.length} Meta-anmälningar inskickade` }); } catch { /* från "ny" finns ingen övergång — anmälan står ändå som klar */ } }
  return { upp, alla, kvar: nya.filter((x) => x.status !== 'inskickad').length };
}

/**
 * --anmald <id> --nr <n> --referens <r>: kvittot för EN inskickad anmälan, för hand. Alla inskickade ⇒ ärendet märks "anmält vidare".
 * --anmald <id> --nr <n> --angra "<skäl>": tar tillbaka ett kvitto som var fel (anmälan blir utkast igen).
 */
async function anmald() {
  const k = konfig();
  const { arenden, a } = hamtaArende(flagga('anmald'));
  const nr = Number(flagga('nr'));
  if (har('angra')) {
    const skal = flagga('angra');
    if (!skal || skal === true) { console.log('Ange skälet: --angra "<varför kvittot var fel>"'); process.exitCode = 1; return; }
    let upp;
    try { upp = angraKvittoAnmalan(a, { nr, skal }); } catch (e) { console.log(e.message); process.exitCode = 1; return; }
    sparaArende(upp, ARENDEFIL); skrivArendefiler(upp); arenden.set(upp.id, upp);
    await byggSidaFil({ k, arenden });
    console.log(`Anmälan ${nr} står som utkast igen (${upp.anmalan.rapporter.filter((x) => x.status === 'inskickad').length} av ${upp.anmalan.rapporter.length} inskickade). Skäl: ${skal}`);
    return;
  }
  const referens = flagga('referens') ?? null;
  const nu = flagga('nar') ?? new Date().toISOString();
  let res;
  try { res = kvitteraAnmalan(a, { nr, referens, nu, av: 'axel' }); } catch (e) { console.log(e.message); process.exitCode = 1; return; }
  sparaArende(res.upp, ARENDEFIL, { nu }); skrivArendefiler(res.upp); arenden.set(res.upp.id, res.upp);
  await byggSidaFil({ k, arenden });
  console.log(`✅ Anmälan ${nr}/${res.upp.anmalan.rapporter.length} kvitterad${referens ? ` — referens ${referens}` : ''}. ${res.alla ? `Alla inskickade; ${res.upp.id} är nu ${res.upp.status}.` : `${res.kvar} kvar.`}`);
}

/**
 * --anmal-skicka <id> [--nr n] [--ja] [--kod-fil <fil>]: fyller i Metas
 * upphovsrättsformulär HÄRIFRÅN (anmal-skicka.mjs), en anmälan i taget.
 * Utan --ja: torrt — allt ifyllt, skärmdump, ingen kod, inget skickat.
 * Med --ja (Axels "kör anmälningarna <id>"): koden begärs, sessionen skriver
 * den i kodfilen (ur Gmail), Submit, kvittot skrivs in. Aldrig två gånger.
 */
async function anmalSkicka() {
  const k = konfig();
  const { arenden, a } = hamtaArende(flagga('anmal-skicka'));
  const rapporter = a.anmalan?.rapporter ?? [];
  if (!rapporter.length) { console.log(`${a.id} har inga byggda anmälningar — kör --anmal ${a.id} först.`); process.exitCode = 1; return; }
  const ja = har('ja');
  if (ja && process.env.KONKURRENTER_INGEN_SANDNING === '1') { console.log('KONKURRENTER_INGEN_SANDNING=1 i miljön — inget skickas.'); process.exitCode = 1; return; }
  const bara = flagga('nr') ? Number(flagga('nr')) : null;
  const mapp = join(ARENDEMAPP, a.id, 'anmalan');
  const kodFil = flagga('kod-fil') ?? join(mapp, 'kod.txt');
  const ko = rapporter.filter((r) => (bara ? r.nr === bara : true));
  if (!ko.length) { console.log(`anmälan ${bara} finns inte (finns: ${rapporter.map((x) => x.nr).join(', ')})`); process.exitCode = 1; return; }
  let arende = a; let skickade = 0;
  for (const r of ko) {
    if (r.status === 'inskickad') { console.log(`anmälan ${r.nr}/${rapporter.length} är redan inskickad${r.referens ? ` (referens ${r.referens})` : ''} — hoppar, en anmälan skickas aldrig två gånger`); continue; }
    const an = lasJson(join(DATAMAPP, r.fil));
    if (!an) { console.log(`anmälan ${r.nr}: ${r.fil} saknas`); process.exitCode = 1; continue; }
    console.log(`${ja ? 'Skickar' : 'Torrkör'} anmälan ${r.nr}/${rapporter.length}: ${an.lank}`);
    let ut;
    try { ut = await skickaAnmalan(an, { ja, kodFil, logg, skarmdumpar: mapp, land: k.anmalan?.land ?? 'Sweden' }); }
    catch (e) {
      console.log(`  ❌ ${e.message}`);
      if (e.kod === 'SAKERHETSKONTROLL') console.log(`  Vägen vidare: node konkurrenter/kor.mjs --anmal-cowork ${a.id} — Cowork fyller i i Axels Chrome, Axel gör säkerhetskontrollen och klickar Submit.`);
      process.exitCode = 1; if (ja) break; continue;
    }
    if (ut.status === 'torr') { console.log(`  torrt: alla fält ifyllda — ${ut.kvar === 1 ? 'kvar är bara engångskoden (begärs först med --ja)' : ut.kvar === 0 ? 'inget obligatoriskt fält kvar' : `⚠️ ${ut.kvarText}`}${ut.skarmdump ? ` · skärmdump ${ut.skarmdump.replace(`${DATAMAPP}/`, '')}` : ''}`); if (ut.kvar > 1) process.exitCode = 1; continue; }
    console.log(`  ✅ inskickad${ut.referens ? ` — referens ${ut.referens}` : ' — inget referensnummer i kvittot (läs skärmdumpen)'}${ut.kvittoFil ? ` · ${ut.kvittoFil.replace(`${DATAMAPP}/`, '')}` : ''}`);
    try {
      const res = kvitteraAnmalan(arende, { nr: r.nr, referens: ut.referens, nu: ut.nar, av: 'sessionen', kvitto: ut.kvittoFil ? ut.kvittoFil.replace(`${DATAMAPP}/`, '') : null, kvittoText: ut.text });
      arende = res.upp; sparaArende(arende, ARENDEFIL, { nu: ut.nar }); skrivArendefiler(arende); arenden.set(arende.id, arende); skickade++;
      if (res.alla) console.log(`  Alla ${rapporter.length} anmälningar inskickade — ${arende.id} är nu ${arende.status}.`);
    } catch (e) { console.log(`  ⚠️ kvittot gick inte att skriva: ${e.message} — skriv det för hand: --anmald ${a.id} --nr ${r.nr}${ut.referens ? ` --referens ${ut.referens}` : ''}`); process.exitCode = 1; }
  }
  if (skickade) await byggSidaFil({ k, arenden });
}

/**
 * --anmal-cowork <id>: Cowork-prompten för anmälningarna som inte är inskickade
 * (Meta kräver en säkerhetskontroll som bara en människa får göra — mätt
 * 2026-09-29). Texterna är exakt formularVarden(), samma som skriptet fyller i.
 */
async function anmalCowork() {
  const k = konfig();
  const { a } = hamtaArende(flagga('anmal-cowork'));
  const rapporter = (a.anmalan?.rapporter ?? []).filter((r) => r.status !== 'inskickad');
  if (!rapporter.length) { console.log(`${a.id}: alla anmälningar är redan inskickade (eller inga är byggda).`); process.exitCode = 1; return; }
  const land = k.anmalan?.land ?? 'Sweden';
  const alla = a.anmalan?.rapporter?.length ?? rapporter.length;
  const anmalningar = [];
  for (const r of rapporter) {
    const an = lasJson(join(DATAMAPP, r.fil));
    if (!an) { console.log(`anmälan ${r.nr}: ${r.fil} saknas`); process.exitCode = 1; return; }
    const v = formularVarden(an, { land });
    if (v.fel.length) { console.log(`anmälan ${r.nr}: ${v.fel.join('; ')}`); process.exitCode = 1; return; }
    anmalningar.push({ nr: r.nr, antal: alla, formular: an.formular, v });
  }
  const text = coworkPrompt({ arende: a.id, sida: a.deras?.sidnamn ?? a.deras?.namn ?? null, anmalningar, land });
  const fil = join(ARENDEMAPP, a.id, 'anmalan', 'COWORK-PROMPT.txt');
  writeFileSync(fil, text);
  console.log(`Cowork-prompten för ${anmalningar.length} anmälning(ar) (${anmalningar.map((x) => x.nr).join(', ')}): ${fil.replace(`${DATAMAPP}/`, 'konkurrenter/')} (${text.length} tecken)`);
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
  const att = [...arenden.values()].filter((a) => [STATUS.SKICKAD, STATUS.PAMIND].includes(a.status) && (a.deras?.url || (a.typ === 'annons' && a.deras?.sidaId)));
  if (!att.length) { console.log('Inga skickade ärenden att följa upp.'); return; }
  let hashare = null;
  try { hashare = await startaHashare({ logg }); } catch (e) { logg(`  ⚠️ ${e.message}`); }
  const cache = new Bildcache(join(OUTPUT, 'bildcache.json'));
  for (const a of att) {
    let kvar; let detalj;
    if (a.typ === 'annons') {
      // Annonsfallet följs upp i annonsbiblioteket: kopian är annonserna, inte sajten (annonsfall.mjs annonsUppfoljning).
      let bib = null;
      if (a.deras?.sidaId) { try { bib = await hamtaAdLibrary(a.deras.sidaId, { land: a.land ?? 'SE', logg, medRackvidd: false }); } catch (e) { bib = { annonser: [], fel: [e.message.split('\n')[0]] }; } }
      ({ kvar, detalj } = annonsUppfoljning(a.bevis?.annonser, bib));
    } else {
      const sida = await hamtaKonkurrent(a.deras.url, { logg, egna, medKontakt: false });
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

// ------------------------------------------------------------------ granskningsappen

const GRANSKAMAPP = (id) => join(MAPP, 'output', 'granska', id);
const listaFlagga = (f) => String(flagga(f) ?? '').split(',').map((x) => x.trim()).filter(Boolean);
const felFlagga = () => { const v = flagga('fel'); const i = v ? v.indexOf('=') : -1; return i > 0 ? { [v.slice(0, i)]: v.slice(i + 1) } : {}; };

/** Fakturan som bild i A4-bredd (samma HTML som PDF:en), till granskningsappen. */
async function fakturaBild(a, fil) {
  const kalla = a.faktura?.htmlFil ? join(DATAMAPP, a.faktura.htmlFil) : null;
  if (!kalla || !existsSync(kalla)) return null;
  const html = readFileSync(kalla, 'utf8').replace('</head>', '<style>body{padding:18mm 16mm;background:#fff}</style></head>');
  try { await bevisbildPng(html, fil.replace(/\.jpg$/, '.png'), { jpg: fil, bredd: 794 }); return fil; }
  catch (e) { logg(`  ⚠️ fakturabilden: ${e.message}`); return null; }
}

/** Sms-texten när brevet har gått: ärendets sms-mall.txt + fakturan som skickades + antalet anmälningar brevet nämnde. */
function smsFor(a) {
  const mall = join(ARENDEMAPP, a.id, 'sms-mall.txt');
  if (!a.brev?.skickat || !existsSync(mall)) return null;
  const antal = a.anmalan?.antal ?? 0;
  return smsText(readFileSync(mall, 'utf8'), { faktura: a.faktura, n: a.brev?.utanMeta ? 0 : a.brev?.paket?.anmalanAntal ?? antal, antal });
}

/**
 * --granska <id> [--forsta] [--bara-status] [--pagar nyckel,…] [--fel nyckel=text] [--notis text]:
 * Axels granskningsapp → output/granska/<id>/ (index.html, data/*.json, bilder/).
 * Sessionen publicerar mappen på verifieringslänken med capabilities {artifact: {}}.
 * `--forsta` skriver också en tom data/beslut.json — BARA vid första publiceringen,
 * sedan äger sidan den filen (Axels svar). `--bara-status` skriver bara data/status.json.
 */
async function granska() {
  const k = konfig();
  const { a } = hamtaArende(flagga('granska'));
  const ut = flagga('ut') ?? GRANSKAMAPP(a.id);
  mkdirSync(join(ut, 'data'), { recursive: true });
  const sms = smsFor(a);
  if (sms) writeFileSync(join(ARENDEMAPP, a.id, 'sms.txt'), `${sms}\n`);
  skrivJson(join(ut, 'data', 'status.json'), statusFor(a, { pagar: listaFlagga('pagar'), fel: felFlagga(), notis: flagga('notis'), sms }));
  const filer = { 'data/status.json': join(ut, 'data', 'status.json') };
  if (har('bara-status')) { console.log(JSON.stringify({ ut, filer }, null, 2)); return; }

  const rapporter = a.anmalan?.rapporter ?? [];
  if (!rapporter.length) { console.log(`${a.id} har inga byggda anmälningar — kör --anmal ${a.id} först.`); process.exitCode = 1; return; }
  mkdirSync(join(ut, 'bilder'), { recursive: true });
  const kort = [];
  for (const r of rapporter) {
    const paket = lasJson(join(DATAMAPP, r.fil));
    if (!paket) { console.log(`anmälan ${r.nr}: ${r.fil} saknas`); process.exitCode = 1; return; }
    const annons = (a.bevis?.annonser ?? []).find((t) => t.nr === paket.annonsNr) ?? null;
    const kallbild = join(ARENDEMAPP, a.id, 'anmalan', `bevis-${r.nr}.jpg`);
    let bild = null;
    if (existsSync(kallbild)) { bild = `bilder/bevis-${r.nr}.jpg`; copyFileSync(kallbild, join(ut, bild)); filer[bild] = join(ut, bild); }
    kort.push(kortAnmalan(r, paket, { annons, bild, land: k.anmalan?.land ?? 'Sweden' }));
  }
  const { brev } = await brevFor(a, k, { anmalanSamtidigt: !a.brev?.utanMeta });
  const gmail = k.brev?.avsandare?.gmail_konto ?? null;
  const fran = gmail ?? brev.fran;
  const franNot = gmail && gmail !== brev.fran ? `Det Gmail-konto som är kopplat, så ditt namn syns som avsändare. Brevet ber dem svara till ${brev.fran}.` : null;
  let fbild = null;
  if (a.faktura) { const f = await fakturaBild(a, join(ut, 'bilder', 'faktura.jpg')); if (f) { fbild = 'bilder/faktura.jpg'; filer[fbild] = f; } }
  kort.push(kortMejl({ brev, faktura: a.faktura, fran, franNot, antalByggda: a.anmalan?.antal ?? rapporter.length, baraAktiva: Boolean(a.anmalan?.baraAktiva), bild: fbild }));
  if (existsSync(join(ARENDEMAPP, a.id, 'sms-mall.txt'))) kort.push({ nyckel: 'sms', typ: 'sms', version: 'sms' });
  const g = byggGranskning({ a, kort });
  skrivJson(join(ut, 'data', 'granskning.json'), g);
  filer['data/granskning.json'] = join(ut, 'data', 'granskning.json');
  writeFileSync(join(ut, 'index.html'), sidaHtml(g));
  if (har('forsta')) { skrivJson(join(ut, 'data', 'beslut.json'), { svar: {} }); filer['data/beslut.json'] = join(ut, 'data', 'beslut.json'); }
  const saknas = kort.filter((x) => x.typ === 'anmalan' && !x.bild).map((x) => x.nr);
  console.log(JSON.stringify({ ut, sida: join(ut, 'index.html'), filer, versioner: Object.fromEntries(kort.map((x) => [x.nyckel, x.version])), bilderSaknas: saknas }, null, 2));
  if (saknas.length) console.log(`⚠️ Bevisbilden saknas lokalt för anmälan ${saknas.join(', ')} — publicera utan de bilderna (de som redan är publicerade ligger kvar) eller bygg dem med --anmal.`);
}

/**
 * --granska-svar <id> --beslut <fil> [--granskning <fil>]: vad Axels svar i appen
 * betyder just nu. Sessionen läser data/beslut.json (och vid behov
 * data/granskning.json) ur artifacten och kör detta. Skriver ingenting.
 */
async function granskaSvar() {
  const { a } = hamtaArende(flagga('granska-svar'));
  const gFil = flagga('granskning') ?? join(GRANSKAMAPP(a.id), 'data', 'granskning.json');
  const granskning = lasJson(gFil);
  if (!granskning) { console.log(`${gFil} saknas — läs data/granskning.json ur artifacten (Artifact read med path) och ange --granskning <fil>.`); process.exitCode = 1; return; }
  if (granskning.arende !== a.id) { console.log(`${gFil} gäller ${granskning.arende}, inte ${a.id}.`); process.exitCode = 1; return; }
  const bFil = flagga('beslut');
  const beslut = bFil ? lasJson(bFil) : null;
  if (!beslut) { console.log('Ange --beslut <fil>: data/beslut.json ur artifacten.'); process.exitCode = 1; return; }
  const r = attGora({ granskning, beslut, status: statusFor(a) });
  const rader = [
    r.anmalningar.length ? `Skicka in till Meta: anmälan ${r.anmalningar.join(', ')} (en i taget: --anmal-skicka ${a.id} --nr <n> --ja)` : 'Inga nya anmälningar att skicka in.',
    r.mejl ? `Skicka mejlet: --skicka ${a.id} --med-anmalan --anmalan-antal ${r.mejl.antal} → Gmail → --skickad ${a.id}` : r.mejlVantar ? `Mejlet väntar: ${r.mejlVantar}` : 'Mejlet: inget att göra.',
    ...r.nej.map((n) => `Nej på ${n.nyckel}${n.not ? `: "${n.not}"` : ' (utan kommentar)'}`),
    ...(r.gamla.length ? [`Svar på äldre versioner av korten (gäller inte längre): ${r.gamla.join(', ')}`] : []),
  ];
  console.log(`${rader.join('\n')}\n${JSON.stringify(r)}`);
}

async function sidaEnbart() {
  const k = konfig();
  const f = await byggSidaFil({ k, arenden: lasArenden(ARENDEFIL, { logg }) });
  console.log(`Granskningssidan byggd: ${f}`);
}

const huvud = har('granska-svar') ? granskaSvar : har('granska') ? granska : har('kolla') ? kolla : har('fraser') ? fraser : har('hamta') ? hamta : har('rapport') ? rapport : har('brev') ? visaBrev : har('skickad') ? skickad : har('skicka') ? skicka : har('faktura') ? fakturaEnbart : har('klipp') ? klipp : har('original') ? original : har('anmal-skicka') ? anmalSkicka : har('anmal-cowork') ? anmalCowork : har('anmald') ? anmald : har('anmal') ? anmal : har('avfarda') ? avfarda : har('eskalera') ? eskalera : har('foljupp') ? foljupp : har('lista') ? lista : har('sida') ? sidaEnbart : null;
if (!huvud) { console.error('Ange --kolla, --fraser, --hamta [--annonser <fil>], --rapport, --lista, --brev <id>, --skicka <id>, --skickad <id>, --faktura <id>, --anmal <id>, --anmald <id> --nr <n> --referens <r>, --avfarda <id>, --eskalera <id>, --foljupp eller --sida.'); process.exit(1); }
huvud().catch((e) => { console.error(`✗ ${e.message}`); process.exit(e.exit ?? 1); });
