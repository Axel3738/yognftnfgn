#!/usr/bin/env node
// kommentarer/kor.mjs — kommentarsgranskningen, motorn bakom /kommentarer.
//
//   node kommentarer/kor.mjs --hamta [--timmar 72] [--idag ÅÅÅÅ-MM-DD]
//        Läser nya kommentarer på alla annonser i alla konton → klassar →
//        skriver kommentarer/output/<datum>.json. Rör INTE minnet (lage.json,
//        loggen) — dör sessionen före rapporten hämtas samma kommentarer igen.
//   node kommentarer/kor.mjs --rapport [--discord] [--torr] [--idag …]
//        Läser senaste output/<datum>.json + sessionens <datum>.dom.json →
//        kontrollerar domen → skriver kommentarer/rapporter/<datum>.md,
//        kommentarer/leads.md, loggen och lage.json → postar i Discord.
//        --torr: visar allt, skriver och postar inget. Omkörning efter exit 3/4
//        postar bara det som inte postats och skriver aldrig minnet två gånger.
//   node kommentarer/kor.mjs --lista <prefix> [--dagar 30] [--json]
//        Loggens kommentarer för en produkt (alla annonser, inte bara top spendern).
//   node kommentarer/kor.mjs --kolla
//        Nycklar, konton och sidor: vad som går att läsa, utan att hämta kommentarer.
//
// Läs-bart mot Meta: svarar, döljer och raderar aldrig en kommentar.
// Exit: 0 klart · 1 fel · 3 Discord stoppad (svensk text) · 4 Discord misslyckades.

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { säkerställProxy } from '../tools/meta-lib.mjs';
import { skapaKlient, hamtaAnnonser, hamtaKommentarer, hamtaIgKommentarer } from './meta.mjs';
import { lasOpsButiker, lasProduktmappar, tolkaAnnonsnamn, verksamhetFor } from './koppla.mjs';
import { byggRad, sammanstall, kontrolleraDom, brandnyckel } from './samla.mjs';
import { lasLage, sparaLage, rensaSedda, sedanUnix, skrivLogg, lasLogg, MAPP } from './lage.mjs';
import { rapportSv, rapportEn, leadsSektion, KANAL_INTRO } from './rapport.mjs';

const args = process.argv.slice(2);
const har = (f) => args.includes(`--${f}`);
const flagga = (f, s = null) => { const i = args.indexOf(`--${f}`); return i !== -1 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : s; };
const logg = (s) => console.error(s);

export const idagSthlm = (d = new Date()) => new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Stockholm' }).format(d);
const lasJson = (fil, reserv = null) => (existsSync(fil) ? JSON.parse(readFileSync(fil, 'utf8')) : reserv);

function konfig() { return JSON.parse(readFileSync(join(MAPP, 'konfig.json'), 'utf8')); }

/** Konton att läsa: de fasta + de valfria vars sidtoken-nyckel finns i miljön. */
function kontonAttLasa(k, env = process.env) {
  const valfria = (k.konton_valfria ?? []).map((x) => ({ ...x, valfri: true, saknarNyckel: x.sidtoken_env && !env[x.sidtoken_env] ? x.sidtoken_env : null }));
  return [...k.konton, ...valfria];
}

/**
 * Får fönstret flyttas fram efter den här hämtningen? Bara när allt som går att
 * läsa lästes (en sida utan sidtoken är permanent och stoppar inte), och bara
 * när hämtningen började där förra slutade — `--timmar 24` efter tre dagars
 * uppehåll får aldrig hoppa över två dygn. Ren.
 * @returns {{ ja: boolean, orsak: string|null }}
 */
export function farFlytta({ lasning, sedan }, lage) {
  const kontoFel = (lasning.konton ?? []).filter((k) => k.fel && !k.valfri);
  if (kontoFel.length) return { ja: false, orsak: `konto kunde inte läsas: ${kontoFel.map((k) => k.namn).join(', ')}` };
  const tillfalliga = [...(lasning.sidor ?? []), ...(lasning.instagram ? [lasning.instagram] : [])].filter((x) => x.fel && !x.permanent);
  if (tillfalliga.length) return { ja: false, orsak: `inlägg kunde inte läsas: ${tillfalliga.map((x) => x.namn ?? x.id).join(', ')}` };
  if (lage.senast_hamtat && Date.parse(sedan) > Date.parse(lage.senast_hamtat)) return { ja: false, orsak: `fönstret (${sedan.slice(0, 16)}) började efter förra hämtningen (${lage.senast_hamtat.slice(0, 16)}) — luckan hämtas nästa gång` };
  return { ja: true, orsak: null };
}

async function hamta() {
  const k = konfig();
  const idag = flagga('idag') ?? idagSthlm();
  const nu = new Date();
  const lage = lasLage();
  const maxTimmar = (k.fonster.max_dagar ?? 7) * 24;
  let sedan = flagga('timmar')
    ? Math.floor((nu.getTime() - Number(flagga('timmar')) * 3_600_000) / 1000)
    : sedanUnix(lage, nu.getTime(), { forstaTimmar: k.fonster.forsta_korning_timmar, overlappTimmar: k.fonster.overlapp_timmar });
  const golv = Math.floor((nu.getTime() - maxTimmar * 3_600_000) / 1000);
  if (sedan < golv) { logg(`⚠️ Fönstret är längre än ${maxTimmar} h — läser bara de senaste ${maxTimmar} h.`); sedan = golv; }
  const klient = skapaKlient({ token: process.env.META_ACCESS_TOKEN });
  const ops = lasOpsButiker();
  const produktmappar = lasProduktmappar(k);

  const kontoStatus = [];
  const allaAnnonser = [];
  const inlagg = new Map();           // FB-inlägg → [annonser]
  const media = new Map();            // IG-media → { post, sida }
  const annonsPerMedia = new Map();   // IG-media → [annonser]
  const extraKlienter = [];
  for (const konto of kontonAttLasa(k)) {
    if (konto.saknarNyckel) { kontoStatus.push({ id: konto.id, namn: konto.namn, valfri: true, fel: `${konto.saknarNyckel} saknas i miljön — sidan (kommentarerna) nås inte utan den` }); continue; }
    try {
      const annonser = await hamtaAnnonser(klient, konto.id, { dagar: k.fonster.annonser_spend_dagar, idag });
      for (const a of annonser) {
        a.konto = konto.id;
        const namn = tolkaAnnonsnamn(a.name);
        const v = verksamhetFor({ lank: a.lank, sida: a.post?.split('_')[0], kampanj: a.kampanj, kontoId: konto.id, annonsnamn: a.name }, { konfig: k, ops });
        allaAnnonser.push({ name: a.name, verksamhet: v.verksamhet, prefix: namn.prefix, vinkel: namn.vinkel, status: a.status });
        if (a.post) {
          if (!inlagg.has(a.post)) inlagg.set(a.post, []);
          inlagg.get(a.post).push(a);
        }
        if (a.ig) {
          if (!media.has(a.ig)) media.set(a.ig, { post: a.post, sida: a.post?.split('_')[0] ?? null });
          if (!annonsPerMedia.has(a.ig)) annonsPerMedia.set(a.ig, []);
          annonsPerMedia.get(a.ig).push(a);
        }
      }
      kontoStatus.push({ id: konto.id, namn: konto.namn, valfri: Boolean(konto.valfri), annonser: annonser.length, inlagg: new Set(annonser.map((a) => a.post).filter(Boolean)).size });
      logg(`  ${konto.namn}: ${annonser.length} annonser`);
      if (konto.sidtoken_env) extraKlienter.push(skapaKlient({ token: process.env[konto.sidtoken_env] }));
    } catch (e) {
      kontoStatus.push({ id: konto.id, namn: konto.namn, valfri: Boolean(konto.valfri), fel: e.meta?.message ?? e.message });
      logg(`  ⚠️ ${konto.namn}: ${e.message}`);
    }
  }
  if (!kontoStatus.some((x) => !x.fel)) throw new Error(`inget annonskonto gick att läsa (${kontoStatus.map((x) => `${x.namn}: ${x.fel}`).join(' · ')}) — ingen rapport, fönstret står kvar.`);

  const fb = await hamtaKommentarer(klient, inlagg, { sedanUnix: sedan, logg, extraKlienter });
  for (const s of fb.sidor) s.namn ??= k.sidnamn?.[s.id] ?? null;
  const ig = await hamtaIgKommentarer(klient, media, { sedanUnix: sedan, logg });
  const kommentarer = [...fb.kommentarer, ...ig.kommentarer];
  const sedda = new Set(Object.keys(lage.sedda));
  const hamtad = nu.toISOString();
  const nya = [];
  const redan = new Set();
  for (const kom of kommentarer) {
    if (sedda.has(kom.id) || redan.has(kom.id)) continue;
    redan.add(kom.id);
    const kalla = kom.kanal === 'instagram'
      ? (annonsPerMedia.get(kom.igMedia) ?? [])
      : (kom.poster ?? [kom.post]).flatMap((p) => inlagg.get(p) ?? []);
    const annonser = [...new Map(kalla.map((a) => [a.id, a])).values()];
    nya.push(byggRad(kom, { annonser, konfig: k, ops, produktmappar, hamtad }));
  }
  const nyaIds = new Set(nya.map((r) => r.id));
  const trendFran = new Date(Date.parse(`${idag}T00:00:00Z`) - k.fonster.trend_dagar * 86_400_000).toISOString().slice(0, 10);
  const trend = [...lasLogg(trendFran).filter((r) => !nyaIds.has(r.id)), ...nya];
  const ut = {
    datum: idag,
    hamtad,
    sedan: new Date(sedan * 1000).toISOString(),
    lasning: { konton: kontoStatus, sidor: fb.sidor, instagram: ig.status },
    antal: { annonser: allaAnnonser.length, inlagg: inlagg.size, ig_media: media.size, kommentarer_i_fonstret: kommentarer.length, nya: nya.length },
    sammanstallning: sammanstall({ nya, trend, annonser: allaAnnonser, konfig: k }),
  };
  ut.flytta = farFlytta(ut, lage);
  mkdirSync(join(MAPP, 'output'), { recursive: true });
  const fil = join(MAPP, 'output', `${idag}.json`);
  writeFileSync(fil, `${JSON.stringify(ut, null, 1)}\n`);
  logg(`\n${nya.length} nya kommentarer (${kommentarer.length} i fönstret, varav Instagram ${ig.kommentarer.length}) på ${inlagg.size} inlägg + ${media.size} IG-media. Skrivet: ${fil}`);
  for (const v of Object.values(ut.sammanstallning)) logg(`  ${v.verksamhet}: ${v.nya} nya · 🔴 ${v.allvarliga.length} · 🔵 ${v.fragor.length} obesvarade frågor`);
  for (const s of [...fb.sidor, ig.status].filter((x) => x.fel)) logg(`  ⚠️ ${s.namn ?? s.id}: ${s.fel}`);
  if (!ut.flytta.ja) logg(`  ⚠️ Fönstret flyttas inte efter rapporten: ${ut.flytta.orsak}`);
  console.log(fil);
}

async function postaDiscord(v, text, { va }) {
  const { hamtaGuilds, hittaEllerSkapaKanal } = await import('../factory/discord.mjs');
  const { skickaTillKanal } = await import('../stonebite/kallor/discord.mjs');
  const { valjButiksServer } = await import('../tools/discord-rapport.mjs');
  const { delaDiscord } = await import('../kundtjanst/run.mjs');
  const { granskaSprak, stoppText } = await import('../tools/lib/engelska.mjs');
  const k = konfig();
  const sprak = await granskaSprak(text);
  if (sprak.stoppad) { const e = new Error(stoppText(sprak.orsak)); e.exit = 3; throw e; }
  const guilds = await hamtaGuilds();
  // Ingen reserv: en verksamhet utan egen server (och utan rad i konfig.discord.servrar)
  // får ett fel, aldrig en annan verksamhets server.
  const onskad = k.discord.servrar?.[v.verksamhet] ?? v.verksamhet;
  const server = valjButiksServer(guilds, onskad);
  if (!server) throw new Error(`ingen entydig Discord-server för ${v.verksamhet} (sökte "${onskad}") — lägg en rad i kommentarer/konfig.json → discord.servrar`);
  const kanal = await hittaEllerSkapaKanal(server.id, k.discord.kanal);
  if (kanal.skapad) await skickaTillKanal(kanal.id, KANAL_INTRO, { mentions: [] });
  let forsta = null;
  for (const del of delaDiscord(sprak.text, 1900)) {
    const m = await skickaTillKanal(kanal.id, del, { mentions: va });
    forsta ??= m;
  }
  return { server: server.name, kanal: kanal.name, skapad: kanal.skapad, meddelande: forsta?.id ?? null, oversatt: sprak.oversatt };
}

/** Senaste hämtningen i output/ (inte en dom). Ett --hamta före midnatt och --rapport efter hittar samma fil. */
function senasteOutput() {
  const dir = join(MAPP, 'output');
  if (!existsSync(dir)) return null;
  const f = readdirSync(dir).filter((x) => /^\d{4}-\d{2}-\d{2}\.json$/.test(x)).sort().at(-1);
  return f ? f.slice(0, 10) : null;
}

const LEADS_HUVUD = '# Leads ur annonskommentarerna\n\nSkrivs av `/kommentarer` (nyaste överst). Varje lead pekar på kommentarer i `kommentarer/logg/` — kundens egna ord är källan (`kalla=voc`). `/cs` läser raderna för sin produkts prefix och bockar av dem den använder: `- [x] … status: använd i batch #N`.\n\n';

async function rapport() {
  const k = konfig();
  const datum = flagga('idag') ?? senasteOutput();
  if (!datum) throw new Error('kommentarer/output/ har ingen hämtning — kör --hamta först.');
  const torr = har('torr');
  const data = lasJson(join(MAPP, 'output', `${datum}.json`));
  if (!data) throw new Error(`kommentarer/output/${datum}.json saknas — kör --hamta först.`);
  const domFil = join(MAPP, 'output', `${datum}.dom.json`);
  const radDom = lasJson(domFil);
  // Dubbletter bort på id — en fil från en äldre version kunde bära samma kommentar två gånger.
  const nya = [...new Map(Object.values(data.sammanstallning).flatMap((v) => v.rader).map((r) => [r.id, r])).values()];
  for (const v of Object.values(data.sammanstallning)) v.rader = [...new Map(v.rader.map((r) => [r.id, r])).values()];
  const nyaIds = new Set(nya.map((r) => r.id));
  const trendFran = new Date(Date.parse(`${datum}T00:00:00Z`) - k.fonster.trend_dagar * 86_400_000).toISOString().slice(0, 10);
  const verkPerId = new Map([...lasLogg(trendFran), ...nya].map((r) => [r.id, r.verksamhet]));
  let dom = null;
  if (radDom) {
    const kontroll = kontrolleraDom(radDom, { kandaIds: new Set(verkPerId.keys()), nyaIds, verkPerId, hamtad: data.hamtad, verksamheter: new Set(Object.keys(data.sammanstallning)), raderPerId: new Map(nya.map((r) => [r.id, r])), maxSvar: k.rapport?.max_svarsforslag ?? 6 });
    if (kontroll.fel.length) {
      logg(`✗ Domen har ${kontroll.fel.length} fel — rätta ${domFil} och kör igen:`);
      for (const f of kontroll.fel) logg(`  - ${f}`);
      process.exit(1);
    }
    dom = kontroll.dom;
  } else {
    logg(`⚠️ ${domFil} saknas — rapporten skrivs utan sessionens leads och åtgärder.`);
  }

  const sv = rapportSv(data, dom);
  const personer = lasJson(join(MAPP, '..', 'bonus', 'personer.json'), { personer: [] });
  const { mottagareFor } = await import('../stonebite/larm.mjs');
  const engelska = Object.values(data.sammanstallning).map((v) => {
    const va = mottagareFor(personer.personer ?? personer, brandnyckel(v.verksamhet)).map((p) => String(p.discord.id));
    return { v, va, text: rapportEn(v, { datum, dom, va }) };
  });

  if (torr) {
    console.log(sv);
    for (const e of engelska) console.log(`\n----- Discord: ${e.v.verksamhet} -----\n${e.text}`);
    logg('\n(torr — inget skrivet, inget postat)');
    return;
  }

  // Omkörning (efter exit 3/4) ska aldrig ge dubbletter: det som postats står i
  // output/<datum>.postat.json, och minnet skrivs bara en gång per hämtning.
  const postatFil = join(MAPP, 'output', `${datum}.postat.json`);
  const postatForut = lasJson(postatFil, {});
  const lage = lasLage();
  const redanSkriven = (lage.korningar ?? []).some((x) => x.hamtad === data.hamtad);

  mkdirSync(join(MAPP, 'rapporter'), { recursive: true });
  const rapportFil = join(MAPP, 'rapporter', `${datum}.md`);
  const postat = [];
  let stoppad = false;
  let misslyckad = false;
  if (har('discord')) {
    for (const e of engelska) {
      if (!e.v.nya) continue;
      const hoppa = konfig().discord.hoppa?.[e.v.verksamhet];
      if (hoppa) { postat.push(`${e.v.verksamhet}: postas inte — ${hoppa}`); continue; }
      if (postatForut[e.v.verksamhet]?.hamtad === data.hamtad) { postat.push(`${e.v.verksamhet}: redan postat (${postatForut[e.v.verksamhet].rad})`); continue; }
      try {
        const r = await postaDiscord(e.v, e.text, { va: e.va });
        const rad = `#${r.kanal} i ${r.server}${r.skapad ? ' (kanalen skapad nu)' : ''}${r.oversatt ? ' (översatt automatiskt)' : ''}`;
        postatForut[e.v.verksamhet] = { hamtad: data.hamtad, rad, meddelande: r.meddelande };
        writeFileSync(postatFil, `${JSON.stringify(postatForut, null, 1)}\n`);
        postat.push(`${e.v.verksamhet}: ${rad}`);
        logg(`  Discord ✓ ${e.v.verksamhet}: ${rad}`);
      } catch (err) {
        if (err.exit === 3) stoppad = true; else misslyckad = true;
        postat.push(`${e.v.verksamhet}: MISSLYCKADES — ${err.message.split('\n')[0]}`);
        logg(`  ✗ Discord ${e.v.verksamhet}: ${err.message}`);
      }
    }
  }
  const flyttRad = data.flytta && !data.flytta.ja ? `\n⚠️ Fönstret flyttades inte: ${data.flytta.orsak}\n` : '';
  writeFileSync(rapportFil, `${sv}${flyttRad}${postat.length ? `\n---\nDiscord: ${postat.join(' · ')}\n` : ''}`);

  if (redanSkriven) {
    logg('Minnet (logg, leads, lage) var redan skrivet för den här hämtningen — skrivs inte igen.');
  } else {
    const leads = leadsSektion(datum, dom?.leads ?? []);
    if (leads) {
      const fil = join(MAPP, 'leads.md');
      const gammalt = existsSync(fil) ? readFileSync(fil, 'utf8') : '';
      const i = gammalt.indexOf('\n## ');
      const kropp = i === -1 ? '' : gammalt.slice(i + 1);
      writeFileSync(fil, `${LEADS_HUVUD}${leads}\n${kropp}`.replace(/\n{3,}/g, '\n\n'));
    }
    // Minnet sist: först när rapporten finns räknas kommentarerna som rapporterade.
    skrivLogg(nya);
    for (const r of nya) lage.sedda[r.id] = datum;
    lage.sedda = rensaSedda(lage.sedda, datum, k.fonster.minne_dagar);
    if (!data.flytta || data.flytta.ja) lage.senast_hamtat = data.hamtad;
    lage.korningar = [...(lage.korningar ?? []), { datum, hamtad: data.hamtad, nya: nya.length, allvarliga: nya.filter((r) => r.niva === 'allvarligt').length, leads: dom?.leads?.length ?? 0, fonster_flyttat: !data.flytta || data.flytta.ja }].slice(-60);
    sparaLage(lage);
    logg(`Skrivet: ${rapportFil}${leads ? ', kommentarer/leads.md' : ''}, loggen (${nya.length} rader), lage.json`);
  }
  console.log(rapportFil);
  // 3 (svensk text stoppad) vinner över 4 — den kräver att sessionen skriver om, inte bara väntar.
  if (stoppad) process.exit(3);
  if (misslyckad) process.exit(4);
}

/** Loggens kommentarer för ett prefix — det /cs och invändningsmatrisen kan läsa i stället för bara top spendern. */
function lista() {
  const prefix = flagga('lista');
  if (!prefix) throw new Error('Ge --lista <prefix>, t.ex. --lista Takoverdrag');
  const dagar = Number(flagga('dagar', 30));
  const idag = flagga('idag') ?? idagSthlm();
  const fran = new Date(Date.parse(`${idag}T00:00:00Z`) - dagar * 86_400_000).toISOString().slice(0, 10);
  const norm = (x) => String(x ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const rader = lasLogg(fran).filter((r) => norm(r.prefix) === norm(prefix)).sort((a, b) => String(b.tid).localeCompare(String(a.tid)));
  if (har('json')) { console.log(JSON.stringify(rader, null, 1)); return; }
  const per = new Map();
  for (const r of rader) { const n = `${r.niva}/${r.kategori}`; per.set(n, [...(per.get(n) ?? []), r]); }
  console.log(`${prefix}: ${rader.length} kommentarer senaste ${dagar} dagarna (loggen börjar ${lasLogg('2000-01-01').map((r) => r.tid).sort()[0]?.slice(0, 10) ?? '—'})`);
  for (const [n, rr] of [...per].sort((a, b) => b[1].length - a[1].length)) {
    console.log(`\n${n} — ${rr.length}`);
    for (const r of rr.slice(0, 5)) console.log(`  ${r.tid.slice(0, 10)} ${r.likes ? `${r.likes}👍 ` : ''}${r.annons}: ${r.text.slice(0, 140)}`);
  }
}

async function kolla() {
  const k = konfig();
  const klient = skapaKlient({ token: process.env.META_ACCESS_TOKEN });
  const perms = await klient.get('me/permissions');
  const har = (perms.data ?? []).filter((p) => p.status === 'granted').map((p) => p.permission);
  console.log(`META_ACCESS_TOKEN: ${har.includes('pages_read_engagement') ? '✓' : '✗'} pages_read_engagement, ${har.includes('ads_read') ? '✓' : '✗'} ads_read`);
  for (const konto of kontonAttLasa(k)) {
    if (konto.saknarNyckel) { console.log(`  ${konto.namn}: ⚠️ ${konto.saknarNyckel} saknas`); continue; }
    try { const a = await klient.get(`act_${konto.id}?fields=name`); console.log(`  ${konto.namn}: ✓ ${a.name}`); } catch (e) { console.log(`  ${konto.namn}: ✗ ${e.meta?.message ?? e.message}`); }
  }
  console.log(`DISCORD_BOT_TOKEN: ${process.env.DISCORD_BOT_TOKEN ? '✓' : '✗ saknas (rapporten skrivs, men postas inte)'}`);
  console.log(`ANTHROPIC_NYCKEL: ${process.env.ANTHROPIC_NYCKEL || process.env.ANTHROPIC_API_KEY ? '✓' : '– saknas (svensk text i Discord stoppas i stället för att översättas)'}`);
}

if (process.argv[1] && /kommentarer[\\/]kor\.mjs$/.test(process.argv[1])) {
  säkerställProxy();
  const jobb = har('hamta') ? hamta : har('rapport') ? rapport : har('kolla') ? kolla : har('lista') ? lista : null;
  if (!jobb) { console.error('Ge --hamta, --rapport, --lista <prefix> eller --kolla. Se huvudet i kommentarer/kor.mjs.'); process.exit(1); }
  Promise.resolve().then(jobb).catch((e) => { console.error(`✗ ${e.message}`); process.exit(e.exit ?? 1); });
}
