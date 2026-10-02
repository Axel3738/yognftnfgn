#!/usr/bin/env node
// kor.mjs — veckorapporten till redigerarna: en post per person, måndag.
//
//   node redigerarrapport/kor.mjs                      torrt: posterna som filer i output/<vecka>/
//   node redigerarrapport/kor.mjs --discord            rutinen: privat kanal per redigerare + minnet
//   node redigerarrapport/kor.mjs --vecka 2026-W39     en viss ISO-vecka (standard: senaste hela)
//   --redigerare carl   bara en person
//   --utan-fetch        läs agent-loggen ur cachen (nätet borta)
//   --cache             hubbarna ur output/hubbar.json i stället för Notion
//   --utan-kommentarer  hoppa Jerzee-steget i Notion (snabbare)
//   --igen              posta även om veckan redan är postad för personen
//
// Kedjan: kallor.mjs (etiketterna ur båda loggarna) → veckansRader → hubbar.mjs
// (alla hubbar, rader med Ansvarig) → namn.mjs (kontots namn → hubbradens) →
// koppla() (person, via, orsak) → post.mjs (texten) → discord.mjs.
//
// Regler: redigerarrapport/PLAN.md. Hellre okopplad än fel person: en rad med
// två Ansvariga ger ingen. Produktägaren i commission/produkter.json används
// BARA för de fyra skalningsprodukterna (products.json scaling: true) — deras
// hubbar är arkiverade (404 sedan 2026-09-30) och det är så commission betalar
// Josh och Annabelle; posten säger då "ads on a product you own".

import { readFileSync, writeFileSync, mkdirSync, existsSync, appendFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { lasKallor, veckansRader, veckaFor, plusDagar, gallande, annonsnyckel } from './kallor.mjs';
import { hamtaHubbar, lasCache, skrivCache } from './hubbar.mjs';
import { kallnamn, matchaRad, byggRadindex, lasSpeglingar, lasNoPrefix, urLogg, skalaMarknad, marknadUrKampanj, delaNamn, KONTO_MARKNAD } from './namn.mjs';
import { RANG } from '../matstrumpor/etikett.mjs';
import { byggPost, valjAction, hogstaEtikett, kontrollera } from './post.mjs';
import { hittaEllerSkapaPrivatKanal, postaTillKanal, kanalnamn } from './discord.mjs';
import { normalisera, annonsnamn } from '../commission/koppling.mjs';
import { serUtSomSvenska } from '../tools/lib/engelska.mjs';

const HAR = dirname(fileURLToPath(import.meta.url));
export const ROT = dirname(HAR);
export const KONFIGFIL = join(HAR, 'konfig.json');
export const UTMAPP = join(HAR, 'output');
export const DATAMAPP = join(HAR, 'data');

const lasJson = (p) => JSON.parse(readFileSync(p, 'utf8'));
const lasJsonl = (p) => (existsSync(p) ? readFileSync(p, 'utf8').split('\n').filter(Boolean).map((r) => JSON.parse(r)) : []);

export function idagSE(nu = new Date()) {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Stockholm', year: 'numeric', month: '2-digit', day: '2-digit' }).format(nu);
}

/** Senaste HELA ISO-veckan: veckan som dagen sju dygn bakåt låg i. */
export function senasteHelaVeckan(idag = idagSE()) {
  return veckaFor(plusDagar(idag, -7));
}

// ─── personerna ─────────────────────────────────────────────────────────

/** team.json → redigerarna + uppslag Notion-id → person. Bara role editor
 *  får en post; Axel och Anna står i team.json men är inte redigerare. */
export function lasPersoner(team) {
  const personer = new Map();
  const notionTill = new Map();
  for (const u of team?.users ?? []) {
    const p = { id: u.id, namn: u.name, fornamn: String(u.name ?? u.id).split(/\s+/)[0], roll: u.role, discordUserId: u.discordUserId || null, discordUsername: u.discordUsername || null, notionUserId: u.notionUserId || null };
    personer.set(u.id, p);
    if (u.notionUserId) notionTill.set(u.notionUserId, p);
    for (const a of u.notionUserIdAlias ?? []) notionTill.set(a, p);
  }
  return { personer, notionTill, redigerare: [...personer.values()].filter((p) => p.roll === 'editor') };
}

/** Produktägarreserven: annonsprefix → person, bara skalningsprodukterna. */
export function produktagareKarta({ products, produkter, notionTill, prefixTillProdukt }) {
  const ut = new Map();
  const lista = Array.isArray(products?.products) ? products.products : Array.isArray(products) ? products : Object.values(products ?? {});
  for (const p of lista) {
    if (!p?.scaling || !p.creative_prefix) continue;
    const produktnamn = prefixTillProdukt?.[p.creative_prefix];
    const post = (produkter?.produkter ?? []).find((x) => x.namn === produktnamn);
    const person = post ? notionTill.get(post.ansvarig) : null;
    if (person) ut.set(p.creative_prefix.toLowerCase(), person);
  }
  return ut;
}

// ─── kopplingen ─────────────────────────────────────────────────────────

/**
 * Vem gjorde annonsen? Returnerar { person, via, orsak, kandidat }.
 *  via: 'hubb' (rad med exakt EN Ansvarig) · 'bas' (kontots namn utan
 *  variant, alla H-varianter i hubben har SAMMA Ansvarig) · 'produkt'
 *  (skalningsprodukt, commission/produkter.json) · null med orsak.
 */
export function koppla(rad, { idx, namnOpt, notionTill, produktagare = new Map() }) {
  const namnet = kallnamn(rad.annons, { konto: rad.konto, kampanj: rad.kampanj, ...namnOpt });
  const { kandidater } = namnet;
  const extra = { namnvia: namnet.via ?? null, marknad: namnet.marknad ?? null, svenskt: svensktNamn(rad.annons, kandidater, namnOpt) };
  const m = matchaRad(kandidater, idx);
  if (m) {
    const ids = [...new Set(m.rad.ansvariga ?? [])];
    if (ids.length === 1) {
      const person = notionTill.get(ids[0]);
      return person ? { person, via: 'hubb', kandidat: m.kandidat, hubbrad: m.rad.namn, ...extra } : { person: null, via: null, orsak: `okänt Notion-id ${ids[0]}`, kandidat: m.kandidat, ...extra };
    }
    if (ids.length > 1) return { person: null, via: null, orsak: 'två personer på hubbraden', kandidat: m.kandidat, ...extra };
    // Raden finns men saknar Ansvarig: det ÄR svaret (bildannonserna ur
    // /bildannonser har egna rader utan människa). Ingen basregel här — den
    // hade gett videoredigeraren bildannonsens utfall (mätt W39: 42 "bas"-
    // kopplingar till Carl innan spärren).
    return { person: null, via: null, orsak: 'rad utan Ansvarig', kandidat: m.kandidat, hubbrad: m.rad.namn, ...extra };
  }
  const bas = basKoppling(kandidater, idx, notionTill);
  if (bas) return { ...bas, ...extra };
  const prefix = String(rad.annons ?? '').toLowerCase();
  for (const [pre, person] of produktagare) if (prefix.startsWith(pre)) return { person, via: 'produkt', orsak: null, kandidat: rad.annons, ...extra };
  return { person: null, via: null, orsak: 'ingen hubbrad', kandidat: kandidater[0] ?? null, ...extra };
}

/** Det svenska namnet MED varianten kvar: första kandidaten utan marknadskod
 *  och utan spegel-/NO-prefix som bär samma variant (H1, H2, 1 …) som kontots
 *  namn. Takovertrekk_NO_SP_4_H1 → Takoverdrag_SP_4_H1, CaraShellRoof_SP_104_H1
 *  → Takoverdrag_SP_4_H1, Sotarset_PD_1_H2 → Sotarset_PD_1_H2. Varianten är
 *  ett eget klipp och får aldrig slås ihop med sina syskon. */
export function svensktNamn(annons, kandidater, namnOpt = {}) {
  const egen = delaNamn(annonsnamn(annons));
  const frammande = new Set([...Object.keys(namnOpt.speglingar ?? {}), ...(namnOpt.noPrefix instanceof Map ? [...namnOpt.noPrefix.keys()] : [])].map((p) => String(p).toLowerCase()));
  for (const k of kandidater ?? []) {
    if (skalaMarknad(k).marknad) continue;
    const d = delaNamn(k);
    if (frammande.has(String(d.prefix).toLowerCase())) continue;
    if (egen.koncept && (d.variant ?? null) !== (egen.variant ?? null)) continue;
    return k;
  }
  return skalaMarknad(annons).bas ?? annons;
}

/** Samma klipp i flera marknader (Bäver SE, Bäver NO, CaraShells spegel, US …)
 *  är EN rad i posten: gruppnyckeln är det svenska namnet med varianten. */
export function gruppnyckel(rad, kopp) {
  return normalisera(annonsnamn(kopp?.svenskt ?? rad.annons));
}

/** Marknadsetiketten för en rad: ur namnet, kontot, kampanjen, annars SE.
 *  CaraShells spegel av en Bäver-annons märks "SE mirror". */
export function marknadFor(rad, kopp) {
  const m = skalaMarknad(rad.annons).marknad ?? KONTO_MARKNAD[String(rad.konto)] ?? marknadUrKampanj(rad.kampanj) ?? kopp?.marknad ?? 'SE';
  return kopp?.namnvia === 'spegel' && m === 'SE' ? 'SE mirror' : m;
}

export const AR_FELSPRAK = (namn) => /_FELSPRAK$/i.test(String(namn ?? ''));

/** Grupperna för en person: Map grupp → { rader:[{rad, marknad}], rep } där rep
 *  är raden med högsta etikett (vid lika: störst andel). */
export function grupperaFor(personId, rader, kopplat) {
  const ut = new Map();
  for (const r of rader) {
    const kopp = kopplat.get(annonsnyckel(r));
    if (kopp?.person?.id !== personId || AR_FELSPRAK(r.annons)) continue;
    const g = gruppnyckel(r, kopp);
    const post = ut.get(g) ?? { grupp: g, namn: kopp?.svenskt ?? r.annons, rader: [], via: kopp.via };
    post.rader.push({ rad: r, marknad: marknadFor(r, kopp) });
    ut.set(g, post);
  }
  for (const post of ut.values()) {
    post.rader.sort((a, b) => (RANG[b.rad.etikett] ?? -1) - (RANG[a.rad.etikett] ?? -1) || (b.rad.andel ?? 0) - (a.rad.andel ?? 0));
    post.rep = post.rader[0].rad;
    // En rad per marknad: högsta etiketten vinner (samma namn kan ligga i två
    // kampanjer i samma konto). Ordningen: SE först, sedan som de kom.
    const perMarknad = new Map();
    for (const x of post.rader) if (!perMarknad.has(x.marknad)) perMarknad.set(x.marknad, { marknad: x.marknad, etikett: x.rad.etikett, andel: x.rad.andel ?? null });
    post.marknader = [...perMarknad.values()].sort((a, b) => (a.marknad === 'SE' ? -1 : 0) - (b.marknad === 'SE' ? -1 : 0));
  }
  return ut;
}

/** Kontot säger Solcellslampa_PD_3 utan rad, hubben har _H3/_H4 — när ALLA
 *  varianter bär samma enda Ansvarig är det hennes. En variant utan Ansvarig
 *  (en bildannons) gör det tvetydigt ⇒ ingen (hellre okopplad). */
export function basKoppling(kandidater, idx, notionTill) {
  for (const k of kandidater ?? []) {
    const bas = normalisera(annonsnamn(k));
    if (!bas) continue;
    const varianter = [];
    for (const [nyckel, rader] of idx.exakt) if (nyckel.startsWith(`${bas}_`) && /^_?[A-Z]?\d+$/.test(nyckel.slice(bas.length + 1))) varianter.push(...rader);
    if (varianter.some((r) => !(r.ansvariga ?? []).length)) continue;
    const ids = new Set(varianter.flatMap((r) => r.ansvariga ?? []));
    if (varianter.length && ids.size === 1) {
      const person = notionTill.get([...ids][0]);
      if (person) return { person, via: 'bas', orsak: null, kandidat: k, hubbrad: varianter[0].namn };
    }
  }
  return null;
}

// ─── per redigerare ──────────────────────────────────────────────────────

/** Kampanjens topp i veckan (högst andel bland bedömbara med hook_rate) — referensen i posten. */
export function toppPerKampanj(rader) {
  const ut = new Map();
  for (const r of rader) {
    if (!r.bedombar || r.hook_rate === null || r.hook_rate === undefined) continue;
    const nyckel = `${r.konto}|${r.kampanj}`;
    const nu = ut.get(nyckel);
    if (!nu || (r.andel ?? 0) > (nu.andel ?? 0)) ut.set(nyckel, { annons: r.annons, hook_rate: r.hook_rate, hold_rate: r.hold_rate, andel: r.andel });
  }
  return ut;
}

export const AR_ITERATION = (namn) => /_i\d+p\d+|\bITER\b/i.test(String(namn ?? ''));

/** Hit rate per person över N veckor bakåt från veckans slut: gällande etikett
 *  per annons, INGEN_LEVERANS ur nämnaren (SVAR.md punkt 3). */
export function hitrateFor(personId, alla, kopplat, { till, veckor = 5 }) {
  const fran = plusDagar(till, -(veckor * 7 - 1));
  const egna = alla.filter((r) => r.fonster_slut && r.fonster_slut >= fran && r.fonster_slut <= till);
  const gallandeRader = [...gallande(egna).values()];
  const grupper = grupperaFor(personId, gallandeRader, kopplat);
  const alla_g = [...grupper.values()];
  const levererade = alla_g.filter((g) => g.rep.etikett !== 'INGEN_LEVERANS');
  const traff = levererade.filter((g) => g.rep.etikett === 'BREAKTHROUGH' || g.rep.etikett === 'SPEND_WINNER');
  return { traff: traff.length, levererade: levererade.length, alla: alla_g.length, iter: traff.filter((g) => AR_ITERATION(g.grupp)).length };
}

// ─── huvud ───────────────────────────────────────────────────────────────

export function tolkaArgv(argv) {
  const a = { vecka: null, discord: false, utanFetch: false, cache: false, utanKommentarer: false, redigerare: null, igen: false };
  for (let i = 0; i < argv.length; i++) {
    const x = argv[i];
    if (x === '--vecka') a.vecka = argv[++i];
    else if (x === '--discord') a.discord = true;
    else if (x === '--torr') a.discord = false;
    else if (x === '--utan-fetch') a.utanFetch = true;
    else if (x === '--cache') a.cache = true;
    else if (x === '--utan-kommentarer') a.utanKommentarer = true;
    else if (x === '--redigerare') a.redigerare = argv[++i];
    else if (x === '--igen') a.igen = true;
    else throw new Error(`Okänd flagga: ${x}`);
  }
  return a;
}

export async function kor(argv = process.argv.slice(2), { skriv = console.log, env = process.env } = {}) {
  const arg = tolkaArgv(argv);
  const konfig = lasJson(KONFIGFIL);
  const vecka = arg.vecka ?? senasteHelaVeckan();
  const team = lasJson(join(ROT, 'dashboard', 'data', 'team.json'));
  const { notionTill, redigerare } = lasPersoner(team);
  const produkter = lasJson(join(ROT, 'commission', 'produkter.json'));
  const products = lasJson(join(ROT, 'products', 'products.json'));
  const produktagare = produktagareKarta({ products, produkter, notionTill, prefixTillProdukt: konfig.produktagare ?? {} });

  // 1. etiketterna
  const kallor = lasKallor({ hamta: !arg.utanFetch });
  for (const v of kallor.varningar) skriv(`⚠️ ${v}`);
  const veckan = veckansRader(kallor.rader, { vecka, unga: kallor.unga });
  skriv(`Vecka ${veckan.vecka} (${veckan.fran}..${veckan.till}): ${veckan.forsta.length} annonser med första veckan slut, ${veckan.uppgraderingar.length} uppgraderingar, unga: ${veckan.unga ? veckan.unga.length : `går inte att läsa (${veckan.unga_orsak})`}`);
  skriv(`Källor: Matstrumpor ${kallor.kallor.matstrumpor.rader} rader · agent ${kallor.kallor.agent.rader} rader (${kallor.kallor.agent.fran}, ${kallor.kallor.agent.ms} ms)`);

  // 2. hubbarna
  let hubbres;
  if (arg.cache) { hubbres = lasCache(); skriv(`Hubbar ur cachen (${hubbres.skrivet}): ${hubbres.hubbar.length}`); }
  else { hubbres = await hamtaHubbar({ kommentarer: !arg.utanKommentarer, env, logg: () => {} }); skrivCache(hubbres); skriv(`Hubbar: ${hubbres.hubbar.length} lästa, ${hubbres.hoppade.length} hoppade, ${hubbres.fel.length} fel, ${hubbres.sek} s`); }
  const idx = byggRadindex(hubbres.hubbar.map((h) => ({ namn: h.titel, rader: h.rader })));

  // 3. namnlösaren
  const register = lasJson(join(ROT, 'factory', 'produkter', 'register.json'));
  const yamlMapp = join(ROT, 'factory', 'produkter');
  const yamls = Object.fromEntries(readdirSync(yamlMapp).filter((f) => f.endsWith('.yaml')).map((f) => [f.replace(/\.yaml$/, ''), readFileSync(join(yamlMapp, f), 'utf8')]));
  const namnOpt = {
    speglingar: lasSpeglingar({ register, produkter: yamls }),
    noPrefix: lasNoPrefix(lasJson(join(HAR, 'no-prefix.json'))),
    ...urLogg(lasJsonl(join(ROT, 'matstrumpor', 'logg.jsonl'))),
  };

  // 4. kopplingen — för veckans rader och för hit rate-fönstret
  const hitFran = plusDagar(veckan.till, -(Number(konfig.hitrate_veckor ?? 5) * 7 - 1));
  const relevanta = kallor.rader.filter((r) => r.fonster_slut && r.fonster_slut >= hitFran && r.fonster_slut <= veckan.till);
  const kopplat = new Map();
  for (const r of relevanta) kopplat.set(annonsnyckel(r), koppla(r, { idx, namnOpt, notionTill, produktagare }));

  const veckansAlla = [...veckan.forsta, ...veckan.uppgraderingar];
  const bedombara = veckansAlla.filter((r) => r.bedombar);
  const kopplade = bedombara.filter((r) => kopplat.get(annonsnyckel(r))?.person);
  const topp = toppPerKampanj(veckan.rader ?? veckansAlla);

  // 5. posterna
  const actionsFil = join(DATAMAPP, 'actions.jsonl');
  const posterFil = join(DATAMAPP, 'poster.jsonl');
  const actions = lasJsonl(actionsFil);
  const poster = lasJsonl(posterFil);
  mkdirSync(join(UTMAPP, veckan.vecka), { recursive: true });
  mkdirSync(DATAMAPP, { recursive: true });

  const utfall = [];
  let discordFel = 0;
  for (const p of redigerare) {
    if (arg.redigerare && p.id !== arg.redigerare) continue;
    const grupper = [...grupperaFor(p.id, veckansAlla, kopplat).values()];
    const egna = grupper.flatMap((g) => g.rader.map((x) => x.rad));
    const unga = (veckan.unga ?? []).filter((u) => kopplat.get(annonsnyckel(u))?.person?.id === p.id);
    if (!grupper.length && !unga.length) { utfall.push({ id: p.id, post: false, orsak: 'inga annonser denna vecka' }); continue; }
    const annonser = grupper.map((g) => {
      const r = g.rep;
      return {
        annons: g.namn, etikett: r.etikett, vecka: r.vecka ?? 1, uppgradering_fran: r.uppgradering_fran ?? null,
        andel: r.andel, hook_rate: r.hook_rate, hold_rate: r.hold_rate, bedombar: r.bedombar,
        utford_som_briefad: r.utford_som_briefad === true ? true : r.utford_som_briefad === false ? false : null,
        via: g.via, marknader: g.marknader,
        topp: topp.get(`${r.konto}|${r.kampanj}`) ?? null,
      };
    });
    const hogsta = hogstaEtikett(annonser);
    const gjorda = actions.filter((a) => a.redigerare === p.id && a.etikett === hogsta).map((a) => a.index);
    const action = hogsta ? valjAction(hogsta, gjorda) : null;
    const forra = actions.filter((a) => a.redigerare === p.id && a.vecka < veckan.vecka).sort((a, b) => a.vecka.localeCompare(b.vecka)).at(-1);
    const forraAction = forra ? { text_en: forra.text_en, gjord: null } : null;
    const hitrate = hitrateFor(p.id, relevanta, kopplat, { till: veckan.till, veckor: Number(konfig.hitrate_veckor ?? 5) });

    let text = byggPost({ redigerare: p, vecka: { iso: veckan.vecka, fran: veckan.fran, till: veckan.till }, annonser, unga: unga.map((u) => ({ annons: u.annons, d0: u.d0 })), hitrate, action, forraAction });
    const viaProdukt = annonser.filter((a) => a.via === 'produkt').length;
    if (viaProdukt) text = text.replace('\n\nBest first:', `\n\n(${viaProdukt === annonser.length ? 'These are' : `${viaProdukt} of these are`} ads on a product you own in the test center, so the cut may be someone else's.)\n\nBest first:`);
    kontrollera(text);
    if (serUtSomSvenska(text.replace(/[A-Za-zåäöÅÄÖ0-9_]+_[A-Za-z0-9_]+/g, ''))) skriv(`⚠️ ${p.id}: posten ser svensk ut för engelskspärren — läs den innan den postas`);
    const fil = join(UTMAPP, veckan.vecka, `${p.id}.md`);
    writeFileSync(fil, `${text}\n`);
    const rad = { id: p.id, post: true, fil, annonser: egna.length, klipp: grupper.length, bedombara: egna.filter((r) => r.bedombar).length, ingen_leverans: grupper.filter((g) => g.rep.etikett === 'INGEN_LEVERANS').length, unga: unga.length, via: raknaVia(annonser), hogsta, action: action ? `${hogsta} #${action.index}` : null, hitrate, discord: null };

    if (arg.discord) {
      const redan = poster.find((x) => x.vecka === veckan.vecka && x.redigerare === p.id);
      if (redan && !arg.igen) rad.discord = `redan postad ${redan.skrivet} (--igen för att posta om)`;
      else if (!p.discordUserId) rad.discord = 'inget Discord-id i team.json — bara filen';
      else {
        try {
          const kanal = await hittaEllerSkapaPrivatKanal(konfig.guild, kanalnamn(konfig.kanal_prefix, p.fornamn), { medlemIds: [p.discordUserId, ...(konfig.axel_discord ?? []).map((a) => a.id)], env });
          const idn = await postaTillKanal(kanal.id, text, { mentions: [p.discordUserId], env });
          appendFileSync(posterFil, `${JSON.stringify({ vecka: veckan.vecka, redigerare: p.id, kanal: kanal.id, kanalnamn: kanal.namn, skapad: kanal.skapad, meddelanden: idn, skrivet: new Date().toISOString() })}\n`);
          if (action) appendFileSync(actionsFil, `${JSON.stringify({ vecka: veckan.vecka, redigerare: p.id, etikett: hogsta, index: action.index, text_en: action.text_en, skrivet: new Date().toISOString() })}\n`);
          rad.discord = `postad i #${kanal.namn}${kanal.skapad ? ' (kanalen skapad)' : ''}, ${idn.length} meddelande(n)`;
        } catch (fel) {
          discordFel++;
          rad.discord = `MISSLYCKADES: ${fel.message}`;
        }
      }
    }
    utfall.push(rad);
  }

  // 6. sammanfattningen
  skriv('');
  for (const u of utfall) {
    if (!u.post) { skriv(`${u.id}: ingen post (${u.orsak})`); continue; }
    skriv(`${u.id}: ${u.klipp} klipp i ${u.annonser} annonser (${u.bedombara} bedömbara, ${u.ingen_leverans} klipp utan leverans, ${u.unga} unga) · via ${u.via} · högsta ${u.hogsta ?? '-'} · action ${u.action ?? '-'} · hit rate ${u.hitrate.traff}/${u.hitrate.levererade}${u.discord ? ` · Discord: ${u.discord}` : ''}`);
    skriv(`   ${u.fil}`);
  }
  const okopplade = bedombara.filter((r) => !kopplat.get(annonsnyckel(r))?.person);
  const orsaker = {};
  for (const r of okopplade) orsaker[kopplat.get(annonsnyckel(r))?.orsak ?? 'okänd'] = (orsaker[kopplat.get(annonsnyckel(r))?.orsak ?? 'okänd'] ?? 0) + 1;
  const tackning = bedombara.length ? Math.round((kopplade.length / bedombara.length) * 100) : null;
  skriv('');
  skriv(`Täckning: ${kopplade.length} av ${bedombara.length} bedömbara annonser i veckan fick en person${tackning === null ? '' : ` (${tackning} %)`}${tackning !== null && tackning < 80 ? ' — UNDER 80 %: det är kopplingen som ska lagas, inte posten' : ''}`);
  if (okopplade.length) {
    skriv(`Okopplade: ${Object.entries(orsaker).map(([o, n]) => `${o} ${n}`).join(', ')}`);
    for (const r of okopplade.slice(0, 40)) skriv(`   ${r.verksamhet} ${r.annons} (${r.etikett}) — ${kopplat.get(annonsnyckel(r))?.orsak}`);
    if (okopplade.length > 40) skriv(`   … och ${okopplade.length - 40} till`);
  }
  if (discordFel) { skriv(`\n${discordFel} post(er) gick inte att skicka till Discord — filerna finns, minnet är inte skrivet för dem.`); process.exitCode = 4; }
  return { vecka: veckan.vecka, utfall, tackning, bedombara: bedombara.length, kopplade: kopplade.length };
}

function raknaVia(annonser) {
  const c = {};
  for (const a of annonser) c[a.via ?? 'ingen'] = (c[a.via ?? 'ingen'] ?? 0) + 1;
  return Object.entries(c).map(([k, v]) => `${k} ${v}`).join(' ');
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  kor().catch((fel) => { console.error(`FEL: ${fel.message}`); process.exit(1); });
}
