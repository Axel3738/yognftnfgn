#!/usr/bin/env node
// run.mjs — veckorutinen för kundtjänst: läser supportmejlen (Loopia/IMAP)
// och Shopify per brand, hittar de återkommande toppärendena, mäter
// chargeback-signalerna, rankar brandsen och skriver rapporten.
//
//   node kundtjanst/run.mjs                         alla aktiva brands, 7 dagar
//   node kundtjanst/run.mjs --brand tacklebay       ett brand (eller a,b,c)
//   node kundtjanst/run.mjs --dagar 14              längre period
//   node kundtjanst/run.mjs --torr                  läs och räkna, skriv ingen fil, posta inget, ingen modell
//   node kundtjanst/run.mjs --discord               posta engelska rapporten i brandets Discord-server
//   node kundtjanst/run.mjs --notion                skapa rapportsidan i brandets Notion-databas
//   node kundtjanst/run.mjs --json                  maskinläsbart på stdout
//   node kundtjanst/run.mjs --fixtur <mapp>         läs .eml/JSON ur en mapp i stället för nätet (tester, demo)
//   node kundtjanst/run.mjs --jobb <fil.json>       mejlen ur en JSON-fil (sessionen byggde den med Gmail-connectorn) — se nedan
//   node kundtjanst/run.mjs --utan-modell           ingen LLM ens om ANTHROPIC_NYCKEL finns
//   node kundtjanst/run.mjs --kolla                 bara: vilka brands, vilka nycklar saknas (inget läses)
//
// ⚠️ NÄTET I CLAUDE.AI (mätt 2026-09-12): containern släpper bara HTTPS genom
// sin proxy. IMAP 993 mot Loopia, Gmail och Office 365 bryts under
// TLS-handskakningen — se kundtjanst/imap.mjs SPARRAD_PORT. Rutinen på
// claude.ai läser därför mejlen på ett av två andra sätt:
//   • --jobb <fil.json>: sessionen hämtar mejlen med Gmail-connectorn (Loopia
//     vidarebefordrar hello@<brand> dit) och skriver JSON:
//     { "<brandId>": { "inkorg": [ { id, threadId, from, to, subject, date, text } ], "skickat": [ … ] } }
//     Samma form för alla brands; "skickat" = svaren från supportadressen.
//   • kör run.mjs där nätet är öppet (Claude Code lokalt, en cron, Railway) —
//     då går IMAP direkt.
//
// ⚠️ LÄS-BARA mot mejlen och Shopify. Markerar inget som läst, flyttar inget,
// svarar på inget, ändrar ingen order. Skriver: kundtjanst/korningar/ och
// kundtjanst/historik/ i repot, en Discord-post och en Notion-sida (opt-in).
//
// Kundernas mejladresser maskeras överallt där de skrivs ner (ka***@gmail.com):
// rapporten ska gå att committa och posta utan att sprida personuppgifter.
// Ordernumret är nyckeln VA:n söker på.

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { upptackBrands, korkonfig, valjBrands, brandUrEgenfil, STANDARD_TROSKLAR } from './brands.mjs';
import { lasYaml } from '../factory/yaml.mjs';
import { ImapKlient, hamtaMapp } from './imap.mjs';
import { WebmailKlient, hamtaMappViaWebmail } from './webmail.mjs';
import { tolkaMejl, tolkaAdress, normaliseraAmne, taBortCitat, htmlTillText, tolkaRubriker, tolkaDatum, delaRubrikOchKropp } from './mime.mjs';
import { byggArenden, sammanfattaArenden } from './arenden.mjs';
import { ShopifyLasare, kopplaOrdrar, normaliseraOrder, normaliseraTvist } from './shopify.mjs';
import { bedomRisk, rankaBrands, aterkommande } from './chargeback.mjs';
import { hamtaSopTitlar, sopTackning, skapaRapportsida } from './notion.mjs';
import { klassificeraOvrigt, sammanfattaToppen } from './llm.mjs';
import { renderaSvensk, renderaEngelsk, renderaRanking, renderaRankingEngelsk, isoVecka } from './rapport.mjs';
import { anthropicNyckel } from '../tools/lib/anthropic-nyckel.mjs';
import { granskaSprak, stoppText } from '../tools/lib/engelska.mjs';

const ROT = dirname(dirname(fileURLToPath(import.meta.url)));
export const KORNINGAR = join(ROT, 'kundtjanst', 'korningar');
export const HISTORIK = join(ROT, 'kundtjanst', 'historik');
const DAG = 86_400_000;

// ------------------------------------------------------------------ hjälpare

/** ka***@gmail.com — nog för att känna igen, inte nog för att sprida. */
export function maskeraAdress(adress) {
  const s = String(adress ?? '');
  const i = s.indexOf('@');
  if (i === -1) return s ? `${s.slice(0, 2)}***` : '';
  return `${s.slice(0, Math.min(2, i))}***@${s.slice(i + 1)}`;
}

/** Maskerar adresser i en text (rapporter, detaljer). */
export function maskeraText(text) {
  return String(text ?? '').replace(/[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g, (a) => maskeraAdress(a));
}

function lasHistorik(brandId) {
  const fil = join(HISTORIK, `${brandId}.jsonl`);
  if (!existsSync(fil)) return [];
  return readFileSync(fil, 'utf8').split('\n').filter(Boolean).map((r) => { try { return JSON.parse(r); } catch { return null; } }).filter(Boolean);
}

function skrivHistorik(brandId, rader) {
  mkdirSync(HISTORIK, { recursive: true });
  writeFileSync(join(HISTORIK, `${brandId}.jsonl`), rader.map((r) => JSON.stringify(r)).join('\n') + '\n');
}

/** Läser .eml-filer ur en mapp (fixtur/demo). */
function lasEmlMapp(mapp) {
  if (!existsSync(mapp)) return [];
  return readdirSync(mapp).filter((f) => f.endsWith('.eml')).sort().map((f, i) => tolkaMejl(readFileSync(join(mapp, f), 'latin1'), { uid: i + 1, mapp }));
}

const lasJson = (fil, standard) => (existsSync(fil) ? JSON.parse(readFileSync(fil, 'utf8')) : standard);

/**
 * En rad ur en jobbfil (Gmail-connectorn, eller vad som helst som ger
 * from/to/subject/date/text) → samma form som mime.tolkaMejl ger. Ren.
 * Gmail har trådid i stället för References: den läggs som en referens så
 * arenden.mjs trådar ihop meddelandena. `html` används om `text` saknas.
 */
export function mejlUrJobb(rad, { uid = null, mapp = null } = {}) {
  const r = rad ?? {};
  const fran = tolkaAdress(r.from ?? r.fran ?? '');
  const till = String(r.to ?? r.till ?? '').split(',').map(tolkaAdress).filter((a) => a.adress);
  const amne = String(r.subject ?? r.amne ?? '').trim();
  const d = r.date ?? r.datum ?? r.internalDate ?? null;
  const datum = d ? new Date(/^\d{13}$/.test(String(d)) ? Number(d) : d) : null;
  const helText = String(r.text ?? r.body ?? (r.html ? htmlTillText(r.html) : '') ?? r.snippet ?? '').trim();
  const egetId = String(r.messageId ?? r.id ?? '').trim();
  const messageId = egetId ? (egetId.match(/<[^>]+>/)?.[0] ?? `<jobb-${egetId}>`) : '';
  const references = [...new Set([
    ...(`${r.references ?? ''} ${r.inReplyTo ?? ''}`.match(/<[^>]+>/g) ?? []),
    ...(r.threadId ? [`<jobb-trad-${String(r.threadId).trim()}>`] : []),
  ])];
  return {
    uid, mapp, messageId, references, fran, till, amne,
    amneNyckel: normaliseraAmne(amne),
    datum: datum && !Number.isNaN(datum.getTime()) ? datum : null,
    text: taBortCitat(helText),
    helText,
    autosvar: r.autoReply === true || /^(auto-?reply|autosvar|out of office|frånvaro|automatic reply|automatiskt svar)/i.test(amne),
    listmejl: Boolean(r.listmejl ?? r.listUnsubscribe),
  };
}

/** Jobbfilen → { inkorg, skickat } för ett brand. Saknas brandet: null. */
export function jobbForBrand(jobb, brandId) {
  const j = jobb?.[brandId];
  if (!j) return null;
  const mapp = (lista, namn) => (Array.isArray(lista) ? lista : []).map((r, i) => mejlUrJobb(r, { uid: i + 1, mapp: namn }));
  return { inkorg: mapp(j.inkorg ?? j.inbox, 'jobb:inkorg'), skickat: mapp(j.skickat ?? j.sent, 'jobb:skickat') };
}

// ------------------------------------------------------------------ brevlådan

/** Datum ur ett råmejls Date-rubrik — det webbmejlen använder för att veta när den kan sluta bläddra. */
export function datumUrRa(ra) {
  const { rubrikblock } = delaRubrikOchKropp(String(ra ?? '').slice(0, 20_000));
  return tolkaDatum(tolkaRubriker(rubrikblock).get('date'));
}

async function lasViaImap(konfig, period, logg) {
  const klient = new ImapKlient({ host: konfig.mail.host, port: konfig.mail.port, user: konfig.mail.user, pass: konfig.mail.pass, logg });
  try {
    await klient.anslut();
    await klient.loggaIn();
    const inb = await hamtaMapp(klient, konfig.mail.inkorg, period.fran);
    const ut = await hamtaMapp(klient, konfig.mail.skickat, period.fran);
    return {
      ok: true,
      inkorg: inb.mejl.map((m) => tolkaMejl(m.ra, { uid: m.uid, mapp: inb.mapp })),
      skickat: ut.mejl.map((m) => tolkaMejl(m.ra, { uid: m.uid, mapp: ut.mapp })),
      skickatMapp: ut.mapp,
      kalla: `${konfig.mail.user} via IMAP (${inb.mapp}: ${inb.antal}, ${ut.mapp ?? 'ingen skickat-mapp'}: ${ut.antal})`,
    };
  } catch (e) {
    return { ok: false, fel: e.message, kod: e.kod ?? null };
  } finally {
    await klient.stang();
  }
}

async function lasViaWebmail(konfig, period, logg) {
  const klient = new WebmailKlient({ url: konfig.mail.webmail, user: konfig.mail.user, pass: konfig.mail.pass, logg });
  try {
    await klient.loggaIn();
    const inb = await hamtaMappViaWebmail(klient, konfig.mail.inkorg, period.fran, { datumUr: datumUrRa });
    const ut = await hamtaMappViaWebmail(klient, konfig.mail.skickat, period.fran, { datumUr: datumUrRa });
    return {
      ok: true,
      inkorg: inb.mejl.map((m) => tolkaMejl(m.ra, { uid: m.uid, mapp: inb.mapp })),
      skickat: ut.mejl.map((m) => tolkaMejl(m.ra, { uid: m.uid, mapp: ut.mapp })),
      skickatMapp: ut.mapp,
      kalla: `${konfig.mail.user} via webbmejlen (${inb.mapp}: ${inb.antal}, ${ut.mapp ?? 'ingen skickat-mapp'}: ${ut.antal})`,
    };
  } catch (e) {
    return { ok: false, fel: e.message, kod: e.kod ?? null };
  } finally {
    await klient.loggaUt();
  }
}

// ------------------------------------------------------------------ ett brand

/**
 * Hela flödet för ett brand. Ren nog att testa: `kallor` kan ersätta nätet.
 * Returnerar resultatobjektet rapport.mjs läser, eller { hoppad, orsak }.
 */
export async function korBrand(brand, {
  nu = new Date(), dagar = 7, torr = false, utanModell = false, fixtur = null, jobb = null, env = process.env, logg = () => {}, historik = null,
} = {}) {
  const konfig = korkonfig(brand, env);
  const vecka = isoVecka(nu);
  const period = { fran: new Date(nu.getTime() - dagar * DAG), till: nu };
  const varningar = [];
  const kallor = [];
  let inkorg = [];
  let skickat = [];
  let ordrar = [];
  let tvister = null;
  let sopTitlar = null;

  // 1. Mejlen
  if (fixtur) {
    inkorg = lasEmlMapp(join(fixtur, brand.id, 'inkorg'));
    skickat = lasEmlMapp(join(fixtur, brand.id, 'skickat'));
    kallor.push(`fixtur ${brand.id} (${inkorg.length} in, ${skickat.length} ut)`);
  } else if (jobb) {
    const j = jobbForBrand(jobb, brand.id);
    if (!j) return { brand: konfig, vecka, hoppad: true, orsak: `jobbfilen saknar brandet "${brand.id}" — nyckeln på toppnivån ska vara brand-id:t` };
    inkorg = j.inkorg;
    skickat = j.skickat;
    kallor.push(`jobbfil ${brand.id} (${inkorg.length} in, ${skickat.length} ut)`);
    if (!skickat.length) varningar.push('Jobbfilen har inga skickade svar ("skickat" tom) — obesvarat och svarstid räknas bara på svar som ligger bland de inkommande. Hämta även from:<supportmailen> i Gmail-sökningen.');
  } else if (!konfig.mail.konfigurerad) {
    return { brand: konfig, vecka, hoppad: true, orsak: `mejlen kan inte läsas — saknar ${konfig.mail.saknas.join(', ')}` };
  } else {
    // Två vägar in i brevlådan, samma form ut: IMAP där nätet tillåter det,
    // annars webbmejlen över HTTPS (claude.ai). 'auto' provar IMAP och byter
    // bara när det är nätet som spärrar — fel lösenord ska inte provas två gånger.
    const via = konfig.mail.via;
    let last = null;
    if (via === 'imap' || via === 'auto') {
      const r = await lasViaImap(konfig, period, logg);
      if (r.ok) last = r;
      else if (via === 'imap' || r.kod !== 'PROXY_SPARRAR_PORTEN') return { brand: konfig, vecka, hoppad: true, orsak: `IMAP ${konfig.mail.host}: ${r.fel}`, kod: r.kod ?? null };
      else logg(`IMAP spärrat av nätet — byter till webbmejlen ${konfig.mail.webmail}`);
    }
    if (!last) {
      const r = await lasViaWebmail(konfig, period, logg);
      if (!r.ok) return { brand: konfig, vecka, hoppad: true, orsak: `Webbmejl ${konfig.mail.webmail}: ${r.fel}`, kod: r.kod ?? null };
      last = r;
    }
    inkorg = last.inkorg;
    skickat = last.skickat;
    kallor.push(last.kalla);
    if (!last.skickatMapp) varningar.push(`Ingen Skickat-mapp hittades (provade ${konfig.mail.skickat.join(', ')}) — svarstider och "obesvarat" räknas då bara på svar som ligger i inkorgen. Sätt mail.skickat i brandfilen; node kundtjanst/setup.mjs --mappar ${brand.id} listar namnen.`);
  }
  // Bara mejl i perioden (IMAP SINCE går på dag, tolkat datum är exakt).
  const iPeriod = (m) => !m.datum || m.datum.getTime() >= period.fran.getTime() - DAG;
  inkorg = inkorg.filter(iPeriod);
  skickat = skickat.filter(iPeriod);

  // 2. Ärenden
  const byggt = byggArenden({ inkorg, skickat, brand: konfig, nu, trosklar: konfig.trosklar });
  let arenden = byggt.arenden;
  let modell = { anvand: false, andrade: 0, fel: null };
  if (!torr && !utanModell && anthropicNyckel(env)) {
    const r = await klassificeraOvrigt(arenden, { nyckel: anthropicNyckel(env) });
    arenden = r.arenden;
    modell = { anvand: true, andrade: r.andrade, fel: r.fel };
    if (r.fel) varningar.push(`Modellen kunde inte klassificera "övrigt": ${r.fel}`);
  }

  // 3. Shopify
  const ordrarSedan = new Date(nu.getTime() - (konfig.trosklar.ordrar_dagar ?? 30) * DAG);
  if (fixtur) {
    ordrar = lasJson(join(fixtur, brand.id, 'ordrar.json'), []).map(normaliseraOrder);
    const tv = lasJson(join(fixtur, brand.id, 'tvister.json'), null);
    tvister = tv ? { tillganglig: true, lista: tv.map((d) => normaliseraTvist(d, ordrar)), orsak: null } : { tillganglig: false, lista: [], orsak: 'ingen tvister.json i fixturen' };
    if (ordrar.length) kallor.push(`ordrar.json (${ordrar.length})`);
  } else if (konfig.shopify.konfigurerad) {
    const shopify = new ShopifyLasare({ shop: konfig.shopify.shop, adminToken: konfig.shopify.adminToken, clientId: konfig.shopify.clientId, clientSecret: konfig.shopify.clientSecret, butikId: brand.id, logg });
    try {
      ordrar = await shopify.hamtaOrdrar(ordrarSedan);
      // Samma fönster som ordrarna — tvistgraden är tvister/ordrar över samma dagar.
      tvister = await shopify.hamtaTvister(ordrarSedan, ordrar);
      kallor.push(`${konfig.shopify.shop} (${ordrar.length} ordrar${tvister.tillganglig ? `, ${tvister.lista.length} tvister` : ''})`);
      if (!tvister.tillganglig) varningar.push(tvister.orsak);
    } catch (e) {
      varningar.push(`Shopify ${konfig.shopify.shop}: ${e.message}`);
      tvister = { tillganglig: false, lista: [], orsak: e.message };
    }
  } else {
    tvister = { tillganglig: false, lista: [], orsak: `Shopify inte kopplat (saknar ${konfig.shopify.saknas.join(', ')})` };
    varningar.push(`Shopify inte kopplat — ordrar och tvister okända (saknar ${konfig.shopify.saknas.join(', ')}).`);
  }
  arenden = kopplaOrdrar(arenden, ordrar);

  // 4. Risk + sammanfattning
  const sammanfattning = sammanfattaArenden(arenden);
  const risk = bedomRisk({ arenden, ordrar, tvister, trosklar: konfig.trosklar, nu });

  // 5. Notion-SOP:erna
  let sop = null;
  const sopDb = konfig.notion?.sop_database_id;
  if (fixtur) {
    sopTitlar = lasJson(join(fixtur, brand.id, 'sop.json'), null);
  } else if (sopDb && env.NOTION_TOKEN) {
    try { sopTitlar = await hamtaSopTitlar(sopDb, { token: env.NOTION_TOKEN }); } catch (e) { sop = { fel: `SOP-databasen gick inte att läsa: ${e.message}` }; }
  } else if (sopDb) {
    sop = { fel: 'NOTION_TOKEN saknas — SOP-täckningen inte mätt.' };
  }
  if (sopTitlar) {
    const t = sopTackning(sopTitlar, sammanfattning.topp.slice(0, 5).map((p) => p.id));
    sop = { antalSop: sopTitlar.length, ...t };
  }

  // 6. Historik + återkommande
  const hist = historik ?? lasHistorik(brand.id);
  const tidigare = hist.filter((h) => h.vecka !== vecka);
  const forra = tidigare.length ? tidigare[tidigare.length - 1] : null;
  const denna = {
    vecka, datum: nu.toISOString().slice(0, 10), dagar,
    antalArenden: sammanfattning.antalArenden, obesvarade: sammanfattning.obesvarade, larmObesvarade: sammanfattning.larmObesvarade,
    medianSvarstidTimmar: sammanfattning.medianSvarstidTimmar, riskPoang: risk.poang, tvister: tvister?.tillganglig ? (risk.underlag.chargebacks ?? tvister.lista.length) : null, forfragningar: tvister?.tillganglig ? (risk.underlag.forfragningar ?? 0) : null, tvistgrad: risk.tvistgrad, ordrar: ordrar.length,
    perKategori: Object.fromEntries(sammanfattning.topp.map((p) => [p.id, p.antal])),
    topp: sammanfattning.topp.slice(0, 3).map((p) => p.id),
  };
  const ak = aterkommande([...tidigare, denna]);

  // 7. Meningarna (valfritt, modell)
  let sammanfattningar = {};
  if (!torr && !utanModell && anthropicNyckel(env)) sammanfattningar = await sammanfattaToppen(sammanfattning.topp, arenden, { nyckel: anthropicNyckel(env) });

  return {
    brand: konfig, vecka, kord: nu, period, dagar, kallor, varningar, hoppad: false,
    arenden, sammanfattning, risk, ordrar: { antal: ordrar.length }, tvister, sop, aterkommande: ak, forra, historikrad: denna, historikVeckor: tidigare.length + 1, modell, sammanfattningar,
    bortfiltrerade: byggt.bortfiltrerade,
  };
}

/** Skriver rapporten till repot och uppdaterar historiken (idempotent per vecka). */
export function sparaResultat(r) {
  const mapp = join(KORNINGAR, r.brand.id);
  mkdirSync(mapp, { recursive: true });
  writeFileSync(join(mapp, `${r.vecka}.md`), maskeraText(renderaSvensk(r)) + '\n');
  writeFileSync(join(mapp, `${r.vecka}.en.md`), maskeraText(renderaEngelsk(r)) + '\n');
  const hist = lasHistorik(r.brand.id).filter((h) => h.vecka !== r.vecka);
  hist.push(r.historikrad);
  skrivHistorik(r.brand.id, hist);
  return { rapport: join(mapp, `${r.vecka}.md`), engelsk: join(mapp, `${r.vecka}.en.md`) };
}

/** Postar i Discord: brandets server (bot) eller webhook. Returnerar en rad för loggen. */
export async function postaDiscord(r, { text, kanal = null, server = null, env = process.env } = {}) {
  const sprak = await granskaSprak(text);
  if (sprak.stoppad) throw new Error(stoppText(sprak.orsak));
  const kanalnamn = String(kanal || r?.brand?.discord?.kanal || 'customer-service').replace(/^#/, '');
  const webhook = env[`DISCORD_WEBHOOK_URL_${String(r?.brand?.id ?? '').toUpperCase().replace(/[^A-Z0-9]+/g, '_')}`];
  if (env.DISCORD_BOT_TOKEN) {
    const { hamtaGuilds, hittaEllerSkapaKanal, skickaMeddelande } = await import('../factory/discord.mjs');
    const { valjButiksServer } = await import('../tools/discord-rapport.mjs');
    const onskad = server || r?.brand?.discord?.server || r?.brand?.brand;
    const guilds = await hamtaGuilds();
    const vald = valjButiksServer(guilds, onskad);
    if (!vald) throw new Error(`Boten sitter inte i servern "${onskad}" (den sitter i: ${guilds.map((g) => g.name).join(', ') || 'ingen'}). Sätt discord.server i brandfilen.`);
    const k = await hittaEllerSkapaKanal(vald.id, kanalnamn);
    await skickaMeddelande(k.id, sprak.text);
    return `Discord: #${k.name} i ${vald.name}${k.skapad ? ' (kanalen skapades)' : ''}`;
  }
  const url = webhook || env.DISCORD_WEBHOOK_URL;
  if (!url) throw new Error('Ingen Discord-auth (DISCORD_BOT_TOKEN eller DISCORD_WEBHOOK_URL).');
  const svar = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: sprak.text.slice(0, 2000), username: 'Kundtjänst' }) });
  if (!svar.ok) throw new Error(`Discord-webhooken svarade ${svar.status}`);
  return 'Discord: webhook';
}

// ------------------------------------------------------------------ CLI

function flagga(args, n, standard = null) {
  const i = args.indexOf(`--${n}`);
  return i !== -1 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : standard;
}

export async function huvud(argv = process.argv.slice(2), env = process.env) {
  const finns = (n) => argv.includes(`--${n}`);
  const torr = finns('torr');
  const fixtur = flagga(argv, 'fixtur') ? resolve(flagga(argv, 'fixtur')) : null;
  let jobb = null;
  if (flagga(argv, 'jobb')) {
    const fil = resolve(flagga(argv, 'jobb'));
    if (!existsSync(fil)) { console.error(`✗ Jobbfilen ${fil} finns inte.`); process.exit(1); }
    try { jobb = JSON.parse(readFileSync(fil, 'utf8')); } catch (e) { console.error(`✗ Jobbfilen går inte att läsa som JSON: ${e.message}`); process.exit(1); }
    if (!jobb || typeof jobb !== 'object' || Array.isArray(jobb)) { console.error('✗ Jobbfilen ska vara ett objekt { "<brandId>": { "inkorg": [...], "skickat": [...] } }.'); process.exit(1); }
  }
  const dagar = Number(flagga(argv, 'dagar', 7)) || 7;
  const datumArg = flagga(argv, 'datum');
  const nu = datumArg ? new Date(`${datumArg}T12:00:00Z`) : new Date();
  const logg = finns('verbose') ? (m) => console.error(`  ${m}`) : () => {};

  // Brandsen: fixturens egna, eller repots.
  let alla;
  if (fixtur) {
    alla = readdirSync(fixtur, { withFileTypes: true }).filter((d) => d.isDirectory() && existsSync(join(fixtur, d.name, 'brand.yaml')))
      .map((d) => brandUrEgenfil(lasYaml(readFileSync(join(fixtur, d.name, 'brand.yaml'), 'utf8')), d.name));
  } else {
    alla = upptackBrands();
  }
  const brands = valjBrands(alla, flagga(argv, 'brand') ?? (finns('alla') ? '--alla' : '--alla'));
  if (!brands.length) { console.error('✗ Inga brands hittade. Lägg en fil i kundtjanst/brands/ eller bygg en butik i factory/butiker/.'); process.exit(1); }

  if (finns('kolla')) {
    console.log(`\nKundtjänst — ${brands.length} brands, vad som går att läsa:\n`);
    for (const b of brands) {
      const k = korkonfig(b, env);
      console.log(`  ${b.id.padEnd(14)} ${b.brand.padEnd(14)} mail ${k.mail.konfigurerad ? '✅' : `❌ saknar ${k.mail.saknas.join(', ')}`}  ·  shopify ${k.shopify.konfigurerad ? `✅ (${k.shopify.vag})` : `⚠️ saknar ${k.shopify.saknas.join(', ')}`}  ·  notion-SOP ${k.notion?.sop_database_id ? (env.NOTION_TOKEN ? '✅' : '⚠️ NOTION_TOKEN saknas') : '– (inget id i brandfilen)'}`);
    }
    console.log(`\n  delat: NOTION_TOKEN ${env.NOTION_TOKEN ? '✅' : '❌'} · DISCORD_BOT_TOKEN ${env.DISCORD_BOT_TOKEN ? '✅' : env.DISCORD_WEBHOOK_URL ? '✅ (webhook)' : '❌'} · ANTHROPIC_NYCKEL ${anthropicNyckel(env) ? '✅' : '– (regler räcker, modellen är extra)'}\n`);
    return { brands, kolla: true };
  }

  console.error(`Kundtjänst vecka ${isoVecka(nu)} — ${brands.length} brand(s), ${dagar} dagar${torr ? ' — TORR (inget skrivs, inget postas)' : ''}${fixtur ? ` — fixtur ${fixtur}` : ''}${jobb ? ` — jobbfil (${Object.keys(jobb).join(', ')})` : ''}`);
  const resultat = [];
  for (const b of brands) {
    console.error(`\n▶ ${b.brand} (${b.id})`);
    let r;
    try {
      r = await korBrand(b, { nu, dagar, torr, utanModell: finns('utan-modell'), fixtur, jobb, env, logg });
    } catch (e) {
      r = { brand: korkonfig(b, env), vecka: isoVecka(nu), hoppad: true, orsak: e.message };
    }
    if (r.hoppad) { console.error(`  ⚠️ hoppad: ${r.orsak}`); resultat.push(r); continue; }
    const s = r.sammanfattning;
    console.error(`  ${s.antalArenden} ärenden · ${s.larmObesvarade} obesvarade > gräns · risk ${r.risk.niva.emoji} ${r.risk.poang}/100 · topp: ${s.topp.slice(0, 3).map((p) => `${p.id} ${p.antal}`).join(', ') || '—'}`);
    for (const v of r.varningar) console.error(`  ⚠️ ${v}`);
    if (!torr) {
      const filer = sparaResultat(r);
      r.filer = filer;
      console.error(`  skrivet: ${filer.rapport.replace(ROT + '/', '')}`);
      if (finns('discord')) {
        try { console.error(`  ${await postaDiscord(r, { text: maskeraText(renderaEngelsk(r, { kort: true })), env })}`); }
        catch (e) { r.varningar.push(`Discord: ${e.message}`); console.error(`  ⚠️ Discord: ${e.message}`); }
      }
      if (finns('notion')) {
        const db = r.brand.notion?.rapport_database_id;
        if (!db) console.error('  ⚠️ Notion: inget notion.rapport_database_id i brandfilen — ingen sida skapad.');
        else if (!env.NOTION_TOKEN) console.error('  ⚠️ Notion: NOTION_TOKEN saknas — ingen sida skapad.');
        else {
          try { const sida = await skapaRapportsida(db, `${r.brand.brand} — customer service week ${r.vecka}`, maskeraText(renderaEngelsk(r)), { token: env.NOTION_TOKEN }); console.error(`  Notion: ${sida.url}`); r.notionSida = sida.url; }
          catch (e) { r.varningar.push(`Notion: ${e.message}`); console.error(`  ⚠️ Notion: ${e.message}`); }
        }
      }
    }
    resultat.push(r);
  }

  const rankade = rankaBrands(resultat);
  const vecka = isoVecka(nu);
  const rankingSv = renderaRanking(rankade, vecka);
  if (!torr && rankade.some((r) => !r.hoppad)) {
    mkdirSync(join(KORNINGAR, '_ranking'), { recursive: true });
    writeFileSync(join(KORNINGAR, '_ranking', `${vecka}.md`), rankingSv + '\n');
    if (finns('discord') && rankade.filter((r) => !r.hoppad).length > 1) {
      try { console.error(`\n${await postaDiscord(null, { text: renderaRankingEngelsk(rankade, vecka), server: env.KUNDTJANST_RANKING_SERVER || 'Bäverbutiken', kanal: env.KUNDTJANST_RANKING_KANAL || 'customer-service-ranking', env })} (ranking)`); }
      catch (e) { console.error(`  ⚠️ Discord-ranking: ${e.message}`); }
    }
  }

  if (finns('json')) {
    console.log(JSON.stringify(rankade.map((r) => (r.hoppad ? { brand: r.brand.id, hoppad: true, orsak: r.orsak } : {
      plats: r.plats, brand: r.brand.id, vecka: r.vecka, risk: { poang: r.risk.poang, niva: r.risk.niva.id, tvistgrad: r.risk.tvistgrad, signaler: r.risk.signaler.map((s) => ({ id: s.id, varde: s.varde, poang: s.poang })) },
      sammanfattning: { ...r.sammanfattning, perKategori: undefined }, topp: r.sammanfattning.topp.map((p) => ({ id: p.id, antal: p.antal, obesvarade: p.obesvarade })), aterkommande: r.aterkommande, atgarder: r.risk.atgarder, varningar: r.varningar, sop: r.sop, filer: r.filer ?? null,
    })), null, 2));
  } else {
    console.log('');
    for (const r of rankade) if (!r.hoppad) console.log(maskeraText(renderaSvensk(r)) + '\n');
    console.log(rankingSv);
    const hoppade = rankade.filter((r) => r.hoppad);
    if (hoppade.length) {
      console.log('## Brands som inte kunde läsas\n');
      for (const r of hoppade) console.log(`- **${r.brand.brand}**: ${r.orsak}`);
      console.log('\nKör `node kundtjanst/setup.mjs` för exakt vilka nycklar som ska in i Environments.');
    }
  }
  const lasta = rankade.filter((r) => !r.hoppad).length;
  if (!lasta) { console.error('\n✗ Inget brand kunde läsas — körningen är inte grön.'); process.exitCode = 1; }
  return { resultat: rankade };
}

if (process.argv[1] && process.argv[1].endsWith('run.mjs')) {
  // Nodes inbyggda fetch läser inte HTTPS_PROXY av sig själv i alla versioner.
  // Samma grepp som tools/notify-discord.mjs: starta om under flaggan, så
  // webbmejlen, Shopify, Notion och Discord når ut genom sessionens proxy.
  if (process.env.HTTPS_PROXY && process.env.NODE_USE_ENV_PROXY !== '1') {
    const { spawnSync } = await import('node:child_process');
    const r = spawnSync(process.execPath, process.argv.slice(1), { stdio: 'inherit', env: { ...process.env, NODE_USE_ENV_PROXY: '1' } });
    process.exit(r.status ?? 1);
  }
  huvud().catch((e) => { console.error(`✗ ${e.message}`); process.exit(1); });
}
