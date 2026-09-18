#!/usr/bin/env node
// ops-spegla.mjs — Speglingen: Bäverbutikens creative hub → EN OPS-butik.
//
// Axels beslut 2026-09-18: Taköverdraget och Termoskyddet briefas bara i
// Bäverbutikens teamspace. CaraShells egna briefronder är pausade. Varje rad
// i Bäverbutikens hub som gått hela vägen (live SE, översatt till NO) speglas
// hit — exakt som `/ops-oversatt`, fast i stället för att översätta laddas
// den SVENSKA filen upp live i butikens SE-kampanj och Bäverbutikens redan
// renderade NORSKA version i NO-kampanjen. Raden kopieras till butikens hub
// i "SE-ACTIVE to be translated", så butikens US-rutin gör engelskan.
//
// Två nya steg i KÄLLHUBBEN (Bäverbutikens) bär läget, namngivna efter brandet
// (`factory/register.mjs speglingsstatusar`):
//   "<Brand> SE ready to be active"  ← Bäverbutikens /oversatt NO sätter den när Norge är uppe
//   "<Brand> EN ready to be active"  ← speglingen sätter den när SE (+ NO) är live här
//   Approved                          ← speglingen sätter den när US-annonsen finns i Magiborsten UK
//
//   node tools/ops-spegla.mjs <nyckel> [--fran "<status>[,<status>]"] [--ut <mapp>] [--json]   kön (läser bara)
//   node tools/ops-spegla.mjs <nyckel> --kor --ut <mapp> [--torr] [--fran …] [--json]           speglar
//   node tools/ops-spegla.mjs --kallor                                                          alla speglingar (för /oversatt)
//
//   --fran   läs andra statusar i källhubben än "<Brand> SE ready to be active" —
//            efterjustering av rader som redan var NO-klara innan steget fanns
//            ("Translation in review", "Approved"). ALDRIG "SE-ACTIVE to be
//            translated": de raderna väntar på Bäverbutikens NO-rutin, och en
//            statusflytt härifrån hade gömt dem för den.
//   --ut     mappen för nedladdade filer (SE ur Notion, NO ur Bäverbutikens
//            NO-annons i Meta). Krävs för --kor. Media committas aldrig.
//
// Namnregeln: källans nummer + 100. Takoverdrag_BOF_3_1 → CaraShellRoof_BOF_103_1.
// Butikens egna briefer numrerar under 100, så namnen krockar aldrig, och
// datan går fortfarande att skära per koncept (docs/naming-convention.md).
//
// Spärrar (aldrig valfria):
//   • Priset. Creativen bär Bäverbutikens pris (briefens "Price exactly …",
//     annars Bäverbutikens produktsida). Avviker det > 20 % från butikens
//     eget pris laddas inget upp — kommentar på källraden, status orörd.
//     Samma regel för NO mot butikens NO-pris.
//   • Brandet. Nämner copyn eller briefen Bäverbutiken ("bäver", "beaver")
//     stoppas raden — en OPS-butik säger aldrig vilken butik den är.
//   • Kontot. Bara OPS-kontot skrivs till (ops-till-meta.mjs kastar på allt
//     annat). Bäverbutikens konton LÄSES bara.
//   • Dubblett. Finns spegelnamnet redan i kontot laddas det inte upp igen —
//     raden får bara sin hubbkopia och sitt statusbyte.
//
// Kräver env NOTION_TOKEN + META_ACCESS_TOKEN. Noll npm-beroenden.

import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
import {
  annonsdel, tolkaNamn, valjMalkampanj, dubblettKarta, dubblett, arvdLank, hamtaPris, typAv, adsetNamn, hittaAdset,
} from './ops-leveranskon.mjs';
import { marknadFor, marknadsNamn, marknadslank } from '../factory/opsmarknader.mjs';
import { hittaFält, byggEgenskaper, delaBlock } from './notion-brief.mjs';

const ROT = join(dirname(fileURLToPath(import.meta.url)), '..');
const NOTION_API = 'https://api.notion.com/v1';
const TYP_RE = /pending approval/i;
/** Bäverbutikens SE-konto — LÄSES bara (copyn på källannonsen). */
export const KALLKONTO_SE = '1867947880635861';
/** Källans nummer + 100 = spegelns nummer. */
export const SPEGEL_OFFSET = 100;
/** Prisregeln, samma tolerans som /notionkorning och /ops-leverans. */
export const TOLERANS = 0.2;
/** Statusen spegelraden får i butikens hub — US-rutinen läser den. */
export const SPEGEL_STATUS = 'SE-ACTIVE to be translated';
export const SLUTSTATUS = 'Approved';
/** Statusen som ALDRIG får läsas som källa: den är Bäverbutikens NO-kö. */
export const FORBJUDEN_KALLSTATUS = 'SE-ACTIVE to be translated';

// ------------------------------------------------------------ ren logik
// Allt nedan är utan nät och testas i tools/test/ops-spegla.test.mjs.

/** Spegelnamnet: butikens prefix + koncept + (nummer + 100) + variant. Null när
 *  namnet inte går att läsa — ett gissat namn är ett namn ingen hittar igen. */
export function spegelnamn(kallnamn, annonsprefix, offset = SPEGEL_OFFSET) {
  const t = tolkaNamn(annonsdel(kallnamn));
  const p = String(annonsprefix ?? '').trim();
  if (!p || !t.koncept || !Number.isInteger(t.nummer)) return null;
  return `${p}_${t.koncept}_${t.nummer + offset}${t.variant ? `_${t.variant}` : ''}`;
}

/** Källans nummer ur ett spegelnamn (≥ offset), annars null. */
export function ursprungsnummer(namn, offset = SPEGEL_OFFSET) {
  const t = tolkaNamn(annonsdel(namn));
  return Number.isInteger(t.nummer) && t.nummer >= offset ? t.nummer - offset : null;
}

/** Annons-id ur en Ads Manager-länk (`selected_ad_ids=…`), annars null. */
export function adIdUrUrl(url) {
  const m = /selected_ad_ids=(\d+)/.exec(String(url ?? ''));
  return m ? m[1] : null;
}

/** Kontot ur samma länk (`act=…`), annars null. */
export function kontoUrUrl(url) {
  const m = /[?&]act=(\d+)/.exec(String(url ?? ''));
  return m ? m[1] : null;
}

/** Orden som avslöjar Bäverbutiken i en text. Tom lista = rent. Hellre ett
 *  falskt stopp (en människa tittar) än en annons som säger fel butik.
 *  Länkar räknas inte: briefen bär "Landing page: https://baverbutiken.se/…"
 *  och det är metadata, inte annonstext. */
export function brandtraff(...texter) {
  const ut = new Set();
  for (const t of texter) {
    const utanLankar = String(t ?? '').replace(/https?:\/\/\S+/gi, ' ');
    // bäver/baver (svenska), bever (norska: Beverbutikken, beverbutikken.no),
    // beaver (engelska). NO-copyn namnger butiken lika gärna som den svenska
    // — den går live i butikens NO-kampanj och måste stoppas där också.
    for (const m of utanLankar.matchAll(/b[äae]ver\w*|beaver\w*/gi)) ut.add(m[0]);
  }
  return [...ut];
}

/** Priset briefen föreskriver ("Price exactly 1 129 kr", "Pris exakt 559 kr"), annars null. */
export function prisUrBrief(text) {
  const m = /pri(?:ce|s)\s+(?:exactly|exakt)\s*:?\s*([\d][\d\s  .,]*?)\s*(?:kr|sek)\b/i.exec(String(text ?? ''));
  if (!m) return null;
  const tal = Number(m[1].replace(/[\s  .]/g, '').replace(',', '.'));
  return Number.isFinite(tal) && tal > 0 ? tal : null;
}

/** Prisregeln: creativens pris mot butikens. Okänt pris är ALDRIG ok. */
export function prisParitet(kalla, mal, tolerans = TOLERANS) {
  if (!Number.isFinite(kalla) || kalla <= 0 || !Number.isFinite(mal) || mal <= 0) {
    return { ok: false, okand: true, avvikelse: null, skal: `priset går inte att jämföra (creativen ${Number.isFinite(kalla) ? kalla : 'okänt'}, butiken ${Number.isFinite(mal) ? mal : 'okänt'})` };
  }
  const avvikelse = Math.abs(kalla - mal) / mal;
  const ok = avvikelse <= tolerans;
  return { ok, okand: false, avvikelse, skal: ok ? null : `creativen säger ${kalla}, butiken ${mal} (${Math.round(avvikelse * 100)} % avvikelse, gräns ${Math.round(tolerans * 100)} %)` };
}

/** Copyn ur en creative-spec (bild eller video). Null utan primary text. */
export function copyUrSpec(spec) {
  const d = spec?.link_data ?? spec?.video_data ?? null;
  if (!d) return null;
  const message = String(d.message ?? '').trim();
  const rubrik = String(d.name ?? d.title ?? '').trim();
  if (!message) return null;
  return { message, rubrik: rubrik || message.split('\n')[0].slice(0, 40), beskrivning: String(d.description ?? d.link_description ?? '').trim(), lank: d.link ?? d.call_to_action?.value?.link ?? null };
}

/** Källannonsen med exakt det namnet: ACTIVE först, sedan nyast. Null utan träff. */
export function valjKallannons(annonser, namn) {
  const n = String(namn ?? '').trim().toLowerCase();
  const traffar = (annonser ?? []).filter((a) => String(a.name ?? '').trim().toLowerCase() === n);
  if (!traffar.length) return null;
  const rang = (a) => (a.effective_status === 'ACTIVE' ? 0 : a.effective_status === 'PAUSED' ? 1 : 2);
  return [...traffar].sort((a, b) => rang(a) - rang(b) || String(b.created_time ?? '').localeCompare(String(a.created_time ?? '')))[0];
}

/** Den svenska filen bland radens: 4:5 först (feed), annars första som inte är
 *  NO. Bara NO-filer ⇒ null — en norsk fil är aldrig en svensk leverans. */
export function valjSeFil(filer = []) {
  const kand = filer.filter((f) => !/_no[_.]/i.test(basename(String(f))));
  return kand.find((f) => /4x5|4-5|1080x1350/i.test(basename(f))) ?? kand[0] ?? null;
}

const rikText = (lista = []) => (Array.isArray(lista) ? lista : [])
  .map((r) => {
    const content = String(r.plain_text ?? r.text?.content ?? '').slice(0, 2000);
    const url = r.href ?? r.text?.link?.url ?? null;
    const a = r.annotations ?? {};
    return {
      type: 'text',
      text: { content, ...(url ? { link: { url } } : {}) },
      annotations: { bold: !!a.bold, italic: !!a.italic, strikethrough: !!a.strikethrough, underline: !!a.underline, code: !!a.code, color: a.color ?? 'default' },
    };
  })
  .filter((r) => r.text.content !== '');

const TEXTBLOCK = new Set(['paragraph', 'heading_1', 'heading_2', 'heading_3', 'bulleted_list_item', 'numbered_list_item', 'quote', 'toggle', 'to_do', 'callout']);

/**
 * Ren funktion: gör om lästa Notion-block till block som går att POSTa i en
 * ny sida. Text, rubriker, listor, citat, callouts, avdelare, kod och
 * tabeller (radernas `barn` fästs av hämtaren). Media kopieras ALDRIG —
 * Notions fil-URL:er är signerade och dör; filerna laddas upp separat.
 * Nästlade block under text kopieras inte. Returnerar { block, hoppade }.
 */
export function kopieraBlock(block = []) {
  const ut = [];
  const hoppade = {};
  const hoppa = (typ) => { hoppade[typ] = (hoppade[typ] ?? 0) + 1; };
  for (const b of block) {
    const typ = b?.type;
    if (!typ) continue;
    if (TEXTBLOCK.has(typ)) {
      const inre = { rich_text: rikText(b[typ]?.rich_text) };
      if (b[typ]?.color && b[typ].color !== 'default') inre.color = b[typ].color;
      if (typ === 'to_do') inre.checked = !!b[typ]?.checked;
      if (typ === 'callout' && b[typ]?.icon?.type === 'emoji') inre.icon = { type: 'emoji', emoji: b[typ].icon.emoji };
      ut.push({ object: 'block', type: typ, [typ]: inre });
      if (b.has_children && typ !== 'toggle') hoppa('nästlade');
      if (b.has_children && typ === 'toggle') hoppa('nästlade');
      continue;
    }
    if (typ === 'divider') { ut.push({ object: 'block', type: 'divider', divider: {} }); continue; }
    if (typ === 'code') {
      ut.push({ object: 'block', type: 'code', code: { rich_text: rikText(b.code?.rich_text), language: b.code?.language ?? 'plain text' } });
      continue;
    }
    if (typ === 'table') {
      const rader = (b.barn ?? []).filter((r) => r?.type === 'table_row');
      if (!rader.length) { hoppa('table (tom)'); continue; }
      const bredd = Number(b.table?.table_width) || Math.max(...rader.map((r) => (r.table_row?.cells ?? []).length));
      ut.push({
        object: 'block',
        type: 'table',
        table: {
          table_width: bredd,
          has_column_header: !!b.table?.has_column_header,
          has_row_header: !!b.table?.has_row_header,
          children: rader.slice(0, 100).map((r) => ({
            object: 'block',
            type: 'table_row',
            table_row: { cells: Array.from({ length: bredd }, (_, i) => rikText((r.table_row?.cells ?? [])[i] ?? [])) },
          })),
        },
      });
      continue;
    }
    hoppa(typ);
  }
  return { block: ut, hoppade: Object.entries(hoppade).map(([typ, antal]) => ({ typ, antal })) };
}

/** Kalloutet överst i spegelraden — säger var briefen kommer ifrån och att
 *  butiken aldrig nämns i annonsen. Engelska: redigerarna läser hubben. */
export function kalloutBlock({ kallNamn, kallUrl, brand, datum }) {
  const text = `Mirrored ${datum} from Bäverbutiken's hub (${kallNamn}). SE and NO creatives are the source files — already live in ${brand}'s campaigns. Only the English version is produced here. The ad must never name the store.`;
  const rich = [{ type: 'text', text: { content: text } }];
  if (kallUrl) rich.push({ type: 'text', text: { content: ' Source row', link: { url: kallUrl } } });
  return { object: 'block', type: 'callout', callout: { rich_text: rich, icon: { type: 'emoji', emoji: '🪞' }, color: 'gray_background' } };
}

/** Plain text ur lästa block (tabellceller med), för pris- och brandskanning. */
export function textUrBlock(block = []) {
  const rader = [];
  for (const b of block) {
    const typ = b?.type;
    if (!typ) continue;
    if (b[typ]?.rich_text) rader.push(b[typ].rich_text.map((r) => r.plain_text ?? '').join(''));
    if (typ === 'table') for (const r of b.barn ?? []) rader.push((r.table_row?.cells ?? []).map((c) => c.map((x) => x.plain_text ?? '').join('')).join(' | '));
  }
  return rader.join('\n');
}

/**
 * Är källradens status ett slutläge som speglingen aldrig flyttar bakåt?
 * `Approved` och EN-steget självt. Gäller efterjusteringen (`--fran`), där
 * rader som blev klara innan stegen fanns läses ur sina gamla statusar.
 */
export function arSlutstatus(status, statusar = {}) {
  const s = String(status ?? '').trim().toLowerCase();
  return s === SLUTSTATUS.toLowerCase() || s === String(statusar.en ?? '').trim().toLowerCase();
}

/** Ren dom per rad: får SE laddas upp? får NO? Skälen står i klartext. */
export function bedom(rad) {
  const se = { ok: true, skal: [] };
  if (!rad.spegel) se.skal.push('spegelnamn kan inte bildas ur namnet');
  if (rad.brand?.length) se.skal.push(`nämner Bäverbutiken: ${rad.brand.join(', ')}`);
  if (!rad.paritet_se?.ok) se.skal.push(`pris SE: ${rad.paritet_se?.skal ?? 'okänt'}`);
  if (!rad.kampanj_se) se.skal.push('ingen SE-kampanj i butiken');
  if (!rad.finns_i_meta?.SE) {
    // Utan --ut har ingen fil HÄMTATS än — det är inte samma sak som att raden
    // saknar fil. En läsning av kön får aldrig se ut som ett fel på raden.
    if (!rad.fil) se.skal.push(rad.fil_fel ? `filen gick inte att hämta — ${rad.fil_fel}` : rad.hamtat === false ? 'filen hämtas vid körning (--ut)' : 'ingen svensk fil');
    if (!rad.copy_se) se.skal.push('ingen copy — källannonsen finns inte i Bäverbutikens konto');
  }
  se.ok = se.skal.length === 0;

  const no = { ok: true, skal: [] };
  if (!se.ok) no.skal.push('SE stoppad');
  if (!rad.no) no.skal.push('ingen NO-version på källraden (Translated url saknas)');
  else {
    if (rad.no.fel) no.skal.push(rad.no.fel);
    if (!rad.no.copy) no.skal.push('NO-annonsen saknar copy');
    if (!rad.finns_i_meta?.NO && !rad.no.fil) no.skal.push('NO-filen gick inte att hämta');
    if (!rad.paritet_no?.ok) no.skal.push(`pris NO: ${rad.paritet_no?.skal ?? 'okänt'}`);
  }
  if (!rad.kampanj_no) no.skal.push('ingen NO-kampanj i butiken');
  no.ok = no.skal.length === 0;
  return { se, no };
}

/** Discord-jobbet ur ett körresultat. Ren, engelska rader. */
export function byggDiscordJobb(resultat) {
  const gjort = [];
  const varningar = [];
  const action = [];
  for (const r of resultat.rader ?? []) {
    if (r.utfall === 'speglad') {
      const delar = [`SE ad ${r.se?.ad_id ?? '?'} live in ${r.se?.kampanj ?? '?'}${r.se?.adset ? ` (adset ${r.se.adset})` : ''}`];
      if (r.no?.ad_id) delar.push(`NO ad ${r.no.ad_id} live in ${r.no.kampanj ?? '?'}`);
      else if (r.no?.skal) varningar.push(`${r.spegel}: NO not mirrored — ${r.no.skal} (the NO routine will translate it)`);
      gjort.push(`${r.namn} → ${r.spegel}: ${delar.join(', ')}${r.hubb?.url ? ` — row in hub` : ''}`);
    } else if (r.utfall === 'hoppad') {
      varningar.push(`${r.namn}: skipped — ${r.skal}`);
      // Brand- och prisstopp kräver ett beslut; saknad fil eller kampanj löser sig själv.
      if (/nämner|pris SE|pris NO|price/i.test(r.skal)) action.push(`${r.namn}: ${r.skal} — decide whether the editor should make a store version`);
    } else if (r.utfall === 'fel') {
      varningar.push(`${r.namn}: FAILED — ${r.skal}`);
      action.push(`${r.namn} failed: ${r.skal}`);
    }
  }
  for (const r of resultat.approved ?? []) gjort.push(`${r.namn}: 🇺🇸 English version ${r.us_ad_id} is live — source row set to Approved`);
  if (resultat.saknade_statusar?.length) action.push(`Add these Status options in the Bäverbutiken hub "${resultat.kalla_hub_namn}": ${resultat.saknade_statusar.map((s) => `"${s}"`).join(', ')} — until then nothing can be mirrored`);
  for (const v of resultat.varningar ?? []) varningar.push(v);
  return {
    brand: resultat.brand, datum: resultat.datum, lage: 'spegla',
    gjort, varningar, action_axel: action,
    nasta_korning: 'tomorrow 16:20 + slot',
  };
}

// ------------------------------------------------------------ nät: Notion

let sist = 0;
async function notion(sokvag, { method = 'GET', body = null } = {}) {
  const token = process.env.NOTION_TOKEN;
  if (!token) throw new Error('NOTION_TOKEN saknas i miljön.');
  const vanta = 350 - (Date.now() - sist);
  if (vanta > 0) await new Promise((r) => setTimeout(r, vanta));
  sist = Date.now();
  for (let forsok = 0; ; forsok++) {
    let res;
    try {
      res = await fetch(`${NOTION_API}/${sokvag}`, {
        method,
        headers: { authorization: `Bearer ${token}`, 'notion-version': '2022-06-28', 'content-type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
      });
    } catch (e) {
      // Nätfel ("fetch failed") — mätt 2026-09-18 i torrkörningen: fem rader
      // föll på Notion-frågan direkt efter två långa uppladdarkörningar.
      // Tre nya försök med paus; sedan felet i klartext.
      if (forsok < 3) { await new Promise((r) => setTimeout(r, 3000 * (forsok + 1))); continue; }
      throw new Error(`Notion nåddes inte (${sokvag}): ${e.cause?.message ?? e.message}`);
    }
    const json = await res.json().catch(() => ({}));
    if (res.ok) return json;
    if ((res.status === 429 || res.status >= 500) && forsok < 3) { await new Promise((r) => setTimeout(r, 2000 * (forsok + 1))); continue; }
    if (res.status === 404) throw new Error(`Notion 404 på ${sokvag} — integrationen är inte inbjuden (••• → Connections), eller sidan ligger i papperskorgen.`);
    throw new Error(`Notion ${res.status}: ${json.message || res.statusText}`);
  }
}

const ren = (id) => String(id ?? '').replace(/-/g, '');
const varde = (p) => {
  if (!p) return '';
  if (p.type === 'title') return p.title.map((t) => t.plain_text).join('');
  if (p.type === 'rich_text') return p.rich_text.map((t) => t.plain_text).join('');
  if (p.type === 'status') return p.status?.name ?? '';
  if (p.type === 'select') return p.select?.name ?? '';
  if (p.type === 'url') return p.url ?? '';
  return '';
};

async function hamtaSchema(databaseId) {
  const d = await notion(`databases/${ren(databaseId)}`);
  const titel = (d.title ?? []).map((t) => t.plain_text ?? '').join('') || '(namnlös)';
  const falt = hittaFält(d.properties ?? {});
  const statusdef = falt.status ? d.properties[falt.status] : null;
  const statusalternativ = (statusdef?.[statusdef.type]?.options ?? []).map((o) => o.name);
  return { id: d.id, titel, url: d.url ?? null, in_trash: !!(d.in_trash || d.archived), properties: d.properties ?? {}, falt, statusalternativ };
}

/** Annonsraderna i EN status i en hub (Typ ~ pending approval). */
async function raderIStatus(hub, status) {
  if (!hub.falt.status) return [];
  const ut = [];
  let cursor;
  do {
    const body = { page_size: 100, filter: { property: hub.falt.status, [hub.properties[hub.falt.status].type]: { equals: status } } };
    if (cursor) body.start_cursor = cursor;
    const r = await notion(`databases/${ren(hub.id)}/query`, { method: 'POST', body });
    for (const s of r.results ?? []) {
      const p = s.properties ?? {};
      const typ = hub.falt.typ ? varde(p[hub.falt.typ]) : '';
      if (!TYP_RE.test(typ)) continue;
      const titel = hub.falt.titel ? varde(p[hub.falt.titel]) : '';
      if (!titel || /^Skärmavbild/i.test(titel)) continue;
      const filer = Object.values(p).filter((v) => v.type === 'files').flatMap((v) => (v.files ?? []).map((f) => f.name ?? ''));
      const translated = Object.entries(p).find(([n, v]) => /translated/i.test(n) && v.type === 'url')?.[1]?.url ?? null;
      const landning = Object.entries(p).filter(([n, v]) => /landing/i.test(n) && (v.type === 'rich_text' || v.type === 'url')).map(([, v]) => varde(v).match(/https?:\/\/[^\s)\]]+/)?.[0]).find(Boolean) ?? null;
      ut.push({ id: s.id, url: s.url, namn: titel, typ_notion: typ, typ: typAv(typ), status, filer, translated_url: translated, landning, skapad: s.created_time });
    }
    cursor = r.has_more ? r.next_cursor : null;
  } while (cursor);
  return ut;
}

/** Toppnivåblocken i en sida; tabellernas rader fästs som `barn`. */
async function hamtaBlock(pageId) {
  const las = async (blockId) => {
    const ut = [];
    let cursor;
    do {
      const r = await notion(`blocks/${ren(blockId)}/children?page_size=100${cursor ? `&start_cursor=${cursor}` : ''}`);
      ut.push(...(r.results ?? []));
      cursor = r.has_more ? r.next_cursor : null;
    } while (cursor);
    return ut;
  };
  const block = await las(pageId);
  for (const b of block) if (b.type === 'table' && b.has_children) b.barn = await las(b.id);
  return block;
}

async function finnsRad(hub, namn) {
  if (!hub.falt.titel) return null;
  const r = await notion(`databases/${ren(hub.id)}/query`, { method: 'POST', body: { page_size: 5, filter: { property: hub.falt.titel, title: { equals: namn } } } });
  const t = (r.results ?? []).find((s) => varde(s.properties?.[hub.falt.titel]).trim().toLowerCase() === namn.trim().toLowerCase());
  return t ? { page_id: t.id, url: t.url } : null;
}

async function kommentera(pageId, text) {
  await notion('comments', { method: 'POST', body: { parent: { page_id: pageId }, rich_text: [{ text: { content: String(text).slice(0, 2000) } }] } });
}

/** Står redan en kommentar som börjar med `marke` på raden? Kräver rätten
 *  "Read comments" på integrationen; utan den svarar API:t 403 och vi
 *  skriver hellre en kommentar för mycket än tiger. */
async function harKommentar(pageId, marke) {
  try {
    const r = await notion(`comments?block_id=${ren(pageId)}&page_size=100`);
    const m = String(marke).slice(0, 120);
    return (r.results ?? []).some((k) => (k.rich_text ?? []).map((t) => t.plain_text ?? '').join('').includes(m));
  } catch { return false; }
}

/** Statusbyte med tillbakaläsning. Kommentaren skrivs alltid FÖRE (anropa kommentera först). */
async function sattStatus(pageId, hub, status) {
  const typ = hub.properties[hub.falt.status].type;
  await notion(`pages/${ren(pageId)}`, { method: 'PATCH', body: { properties: { [hub.falt.status]: { [typ]: { name: status } } } } });
  const efter = await notion(`pages/${ren(pageId)}`);
  const blev = varde(efter.properties?.[hub.falt.status]);
  if (blev !== status) throw new Error(`statusen blev "${blev}", inte "${status}"`);
  return blev;
}

/** RESERVVÄGEN för den svenska filen: tools/notion-fil.mjs utan sidmedia (bilaga
 *  eller Drive-länk). Sidmediat hoppas över med flit: Bäverbutikens /oversatt NO
 *  lägger den NORSKA filen överst i sidan, och för en videorad utan bilaga hade
 *  den annars blivit "den svenska filen" (granskningsfynd 2026-09-18 — den norska
 *  videon hade gått live som svensk annons). Huvudvägen är Meta: se hamtaMetaVersion. */
function hamtaSeFil(pageId, mapp) {
  if (!existsSync(mapp)) mkdirSync(mapp, { recursive: true });
  const r = spawnSync(process.execPath, [join(ROT, 'tools', 'notion-fil.mjs'), ren(pageId), '--ut', mapp, '--utan-sidmedia'], { encoding: 'utf8', env: process.env, timeout: 10 * 60 * 1000 });
  const rader = String(r.stdout ?? '').trim().split('\n').filter(Boolean);
  if (r.status !== 0) return { fil: null, fil_alla: [], fel: String(r.stderr ?? '').trim() || `notion-fil.mjs avslutade med ${r.status}` };
  return { fil: valjSeFil(rader), fil_alla: rader, fel: null };
}

// ------------------------------------------------------------ nät: Meta

/** Bäverbutikens NO-annons ur `Translated url`: copy + mediefil. */
async function hamtaNoVersion(translatedUrl, opt = {}) {
  const adId = adIdUrUrl(translatedUrl);
  const konto = kontoUrUrl(translatedUrl);
  if (!adId || !konto) return null;
  return hamtaMetaVersion({ adId, konto, ...opt });
}

/**
 * En live annons i ett av Bäverbutikens konton (LÄSES bara): copy ur specen
 * och själva mediefilen — bilden via image_hash → adimages, videon via
 * video_id → source. Det är den enda källan som garanterat är exakt det som
 * spenderar i Sverige/Norge: Notion-sidan bär både den svenska bilagan och
 * den norska filen överst i kroppen, och de går inte att skilja på namn.
 */
async function hamtaMetaVersion({ adId, konto, ut = null, filnamn = 'fil', logg } = {}) {
  const { api } = await import('./meta-lib.mjs');
  const no = { ad_id: adId, konto, namn: null, status: null, kampanj: null, copy: null, media: null, fil: null, fel: null, lank: null };
  try {
    const a = await api(adId, { params: { fields: 'id,name,effective_status,campaign{name},creative{object_story_spec}' } });
    no.namn = a.name ?? null;
    no.status = a.effective_status ?? null;
    no.kampanj = a.campaign?.name ?? null;
    const spec = a.creative?.object_story_spec ?? null;
    no.copy = copyUrSpec(spec);
    no.lank = no.copy?.lank ?? null;
    const d = spec?.link_data ?? spec?.video_data ?? {};
    if (d.video_id) no.media = { typ: 'video', id: String(d.video_id) };
    else if (d.image_hash) no.media = { typ: 'bild', hash: String(d.image_hash) };
    else { no.fel = 'NO-annonsen har varken video_id eller image_hash'; return no; }
    if (!ut) return no;
    let url;
    if (no.media.typ === 'video') {
      const v = await api(no.media.id, { params: { fields: 'source' } });
      url = v.source ?? null;
    } else {
      const im = await api(`act_${konto}/adimages`, { params: { hashes: [no.media.hash], fields: 'url' } });
      url = im.data?.[0]?.url ?? null;
    }
    if (!url) { no.fel = `Meta gav ingen fil-URL för NO-${no.media.typ}en`; return no; }
    if (!existsSync(ut)) mkdirSync(ut, { recursive: true });
    let res = null;
    for (let forsok = 0; forsok < 3 && !res; forsok++) {
      try { res = await fetch(url); } catch (e) { if (forsok === 2) { no.fel = `NO-filen gick inte att hämta: ${e.cause?.message ?? e.message}`; return no; } await new Promise((r) => setTimeout(r, 3000 * (forsok + 1))); }
    }
    if (!res.ok) { no.fel = `NO-filen svarade ${res.status}`; return no; }
    const mal = join(ut, `${filnamn}${no.media.typ === 'video' ? '.mp4' : '.jpg'}`);
    writeFileSync(mal, Buffer.from(await res.arrayBuffer()));
    no.fil = mal;
    logg?.(`  hämtad ur Meta: ${no.namn} → ${mal}`);
  } catch (e) {
    no.fel = e.message;
  }
  return no;
}

/** Butikens kampanj för EN marknad i OPS-kontot (samma val som leveranskön). */
async function malkampanj({ butik, m, kampanjer, butikens, logg }) {
  const { kampanjUtfall, alla } = await import('./meta-lib.mjs');
  const { valjKampanjer } = await import('../factory/budgetrond.mjs');
  const { filtreraPaMarknad } = await import('../factory/skalning.mjs');
  let kampanjbaser = [];
  try {
    const { kampanjbasFor } = await import('../factory/kampanj.mjs');
    if (butik.produkt) kampanjbaser = [kampanjbasFor({ brand: butik.post.brand, marknad: m, produkt: butik.produkt })];
  } catch { /* basen är bara en extra väg att hitta en tom kampanj */ }
  const val = valjKampanjer(kampanjer, butik.prefix, butikens, kampanjbaser);
  const per = filtreraPaMarknad(val.butikens.map((k) => ({ ...k, campaign_name: k.name })), m);
  const kandidater = [];
  for (const k of per.behall) {
    if (k.status === 'ACTIVE') { kandidater.push({ ...k, utfall: 'ACTIVE', spend: null }); continue; }
    const u = await kampanjUtfall(k.id);
    kandidater.push({ ...k, utfall: u.utfall, spend: u.spend ?? null });
  }
  const { kampanj, skal, varning } = valjMalkampanj(kandidater, m);
  if (!kampanj) { logg(`Kampanj (${m}): INGEN — ${skal}`); return { kampanj: null, skal, varning, adsets: [], lank: null }; }
  const adsets = await alla(`${kampanj.id}/adsets`, { fields: 'id,name,status' }, 50);
  const annonser = await alla(`${kampanj.id}/ads`, { fields: 'id,name,status,created_time,creative{object_story_spec}' }, 50);
  const arv = arvdLank(annonser);
  logg(`Kampanj (${m}): ${kampanj.namn} [${kampanj.status}] · ${adsets.length} adsets · länk ${arv?.lank ?? '(ingen att ärva)'}`);
  return { kampanj, skal: null, varning, adsets, lank: arv?.lank ?? null };
}

// ------------------------------------------------------------ kön

export async function byggSpegelko({ nyckel, fran = null, ut = null, logg = (...a) => console.error(...a) }) {
  const { laddaButik, sakerstallKonto, annonskontoFor, OPS_ANNONSKONTO, tillhorButiken, speglingFor, svenskDatum, utmapp } = await import('../factory/register.mjs');
  const butik = laddaButik(nyckel);
  const baskonto = sakerstallKonto(butik.post);
  if (baskonto !== OPS_ANNONSKONTO) throw new Error(`STOPP: ${butik.post.nyckel} pekar på konto ${baskonto}, inte OPS-kontot ${OPS_ANNONSKONTO}.`);
  const spegling = speglingFor(butik.post);
  if (!spegling) throw new Error(`${butik.post.nyckel} har ingen spegling — skriv in Bäverbutikens hub: node factory/register.mjs spegling ${butik.post.nyckel} <hub-id|url> <namn>`);
  if (!butik.prefix) throw new Error(`${butik.post.nyckel}: ${butik.prefixfel}`);
  if (!butik.post.annonsprefix) throw new Error(`${butik.post.nyckel}: annonsprefix saknas i registret — spegelnamn kan inte bildas.`);
  const hubId = butik.post.notion?.database_id;
  if (!hubId) throw new Error(`${butik.post.nyckel}: butikens egen hub är inte inskriven (register.mjs notion …).`);
  const varningar = [];
  const datum = svenskDatum();
  const konto = OPS_ANNONSKONTO;
  const annonsmarknader = butik.post.annonsmarknader ?? ['NO'];
  const kallstatusar = String(fran ?? spegling.status_se).split(',').map((s) => s.trim()).filter(Boolean);
  for (const s of kallstatusar) {
    if (s.toLowerCase() === FORBJUDEN_KALLSTATUS.toLowerCase()) throw new Error(`"${s}" är Bäverbutikens NO-kö och får aldrig speglas — de raderna väntar på /oversatt NO.`);
  }
  logg(`Butik: ${butik.post.brand} (${butik.post.nyckel}) · konto ${konto} · prefix ${butik.post.annonsprefix} · datum ${datum}`);

  // 1. Hubbarna.
  const kalla = await hamtaSchema(spegling.kalla_hub);
  if (kalla.in_trash) throw new Error(`Källhubben ${kalla.titel} (${kalla.id}) ligger i papperskorgen.`);
  const hub = await hamtaSchema(hubId);
  if (hub.in_trash) throw new Error(`Butikens hub ${hub.titel} (${hub.id}) ligger i papperskorgen.`);
  const saknade_statusar = [spegling.status_se, spegling.status_en].filter((s) => !kalla.statusalternativ.includes(s));
  logg(`Källhub: ${kalla.titel} (${kalla.id}) · butikens hub: ${hub.titel} (${hub.id})`);
  if (saknade_statusar.length) {
    varningar.push(`källhubben saknar statusalternativen ${saknade_statusar.map((s) => `"${s}"`).join(' och ')} — Axels klick i Notion (API:t kan inte skapa status-alternativ)`);
    logg(`  ⚠️  ${varningar.at(-1)}`);
  }
  if (!hub.statusalternativ.includes(SPEGEL_STATUS)) varningar.push(`butikens hub saknar statusen "${SPEGEL_STATUS}"`);

  // 2. Källraderna.
  const raa = [];
  for (const s of kallstatusar) {
    if (!kalla.statusalternativ.includes(s)) { logg(`  "${s}": finns inte som status i källhubben — 0 rader`); continue; }
    const r = await raderIStatus(kalla, s);
    logg(`  ${r.length} rad(er) i "${s}"`);
    raa.push(...r);
  }
  const enRader = kalla.statusalternativ.includes(spegling.status_en) ? await raderIStatus(kalla, spegling.status_en) : [];
  logg(`  ${enRader.length} rad(er) i "${spegling.status_en}" (väntar på US)`);

  // 3. Kontona. OPS: allt (dubblett + kampanjval). UK: bara namnen (US-koll).
  //    Bäverbutikens SE-konto: bara källprefixens annonser (copyn), läses.
  const { alla } = await import('./meta-lib.mjs');
  logg(`Läser OPS-kontot ${konto} …`);
  const opsAnnonser = await alla(`act_${konto}/ads`, { fields: 'id,name,status,effective_status,created_time,campaign{id,name,status},adset{id,name,status}' });
  const kampanjer = await alla(`act_${konto}/campaigns`, { fields: 'id,name,status,effective_status,daily_budget' });
  const kartaOps = dubblettKarta(opsAnnonser);
  const butikens = opsAnnonser
    .filter((a) => tillhorButiken(a.name, butik.prefix) || tillhorButiken(a.campaign?.name, butik.prefix))
    .map((a) => ({ campaign_id: a.campaign?.id, ad_name: a.name, campaign_name: a.campaign?.name }));
  let kartaUk = new Map();
  const usKonto = annonsmarknader.includes('US') ? annonskontoFor(butik.post, 'US') : null;
  if (usKonto) {
    logg(`Läser US-kontot ${usKonto} (${marknadFor('US').kontonamn}) …`);
    kartaUk = dubblettKarta(await alla(`act_${usKonto}/ads`, { fields: 'id,name,effective_status' }));
  }
  const kallprefix = [...new Set([...raa, ...enRader].map((r) => tolkaNamn(annonsdel(r.namn)).prefix).filter(Boolean))];
  const kallannonser = [];
  for (const p of kallprefix) {
    logg(`Läser Bäverbutikens konto ${KALLKONTO_SE} för "${p}_" …`);
    kallannonser.push(...await alla(`act_${KALLKONTO_SE}/ads`, { fields: 'id,name,effective_status,created_time,campaign{id,name},creative{object_story_spec}', filtering: [{ field: 'name', operator: 'CONTAIN', value: `${p}_` }] }, 50));
  }
  logg(`  ${kallannonser.length} källannonser hittade`);

  // 4. Butikens kampanjer SE + NO, priser.
  const se = await malkampanj({ butik, m: 'SE', kampanjer, butikens, logg });
  const no = annonsmarknader.includes('NO') ? await malkampanj({ butik, m: 'NO', kampanjer, butikens, logg }) : { kampanj: null, skal: 'NO står inte i annonsmarknader', adsets: [], lank: null };
  if (se.varning) varningar.push(`SE-kampanj: ${se.varning}`);
  if (no.varning) varningar.push(`NO-kampanj: ${no.varning}`);
  const handle = butik.produkt?.produkt?.handle || butik.produkt?.produkt?.id || butik.post.id;
  const lank_se = se.lank ?? marknadslank(butik.butik, { handle, kod: 'SE' });
  let lank_no = no.lank;
  if (!lank_no) { try { lank_no = marknadslank(butik.butik, { handle, kod: 'NO' }); } catch { lank_no = null; } }
  const pris_se = await hamtaPris(lank_se, butik.post.valuta ?? 'SEK');
  if (!pris_se.pris_butik) varningar.push(`butikens SE-pris: ${pris_se.skal}`);
  else logg(`Pris SE ur butiken: ${pris_se.pris_butik.pris} ${pris_se.pris_butik.valuta} via ${pris_se.pris_butik.kalla}`);
  const pris_no = lank_no ? await hamtaPris(lank_no, marknadFor('NO').valuta, 'NO', butik.post.valuta ?? 'SEK') : { pris_butik: null, skal: 'ingen NO-länk' };
  if (!pris_no.pris_butik || pris_no.pris_butik.basvaluta) varningar.push(`butikens NO-pris: ${pris_no.skal ?? 'okänt'}`);
  else logg(`Pris NO ur butiken: ${pris_no.pris_butik.pris} ${pris_no.pris_butik.valuta} via ${pris_no.pris_butik.kalla}`);
  const prisCache = new Map();
  const prisFor = async (lank, valuta, land, bas) => {
    if (!lank) return { pris_butik: null, skal: 'ingen länk' };
    const k = `${lank}|${valuta}|${land ?? ''}`;
    if (!prisCache.has(k)) prisCache.set(k, await hamtaPris(lank, valuta, land, bas));
    return prisCache.get(k);
  };

  // 5. Raderna.
  const rader = [];
  for (const r of raa) {
    const namn = annonsdel(r.namn);
    const spegel = spegelnamn(namn, butik.post.annonsprefix);
    const spegel_no = spegel ? marknadsNamn(spegel, 'NO') : null;
    const spegel_us = spegel ? marknadsNamn(spegel, 'US') : null;
    const dSe = spegel ? dubblett(spegel, kartaOps) : { finns_i_meta: false, ad_id: null };
    const dNo = spegel_no ? dubblett(spegel_no, kartaOps) : { finns_i_meta: false, ad_id: null };
    const dUs = spegel_us && usKonto ? dubblett(spegel_us, kartaUk) : { finns_i_meta: false, ad_id: null };
    const kall = valjKallannons(kallannonser, namn);
    const copy_se = kall ? copyUrSpec(kall.creative?.object_story_spec) : null;
    const block = await hamtaBlock(r.id);
    const brieftext = textUrBlock(block);
    const pris_brief = prisUrBrief(brieftext);
    let pris_kalla = pris_brief;
    let pris_kalla_fran = pris_brief ? 'briefen' : null;
    if (!pris_kalla && r.landning) {
      const p = await prisFor(r.landning, 'SEK');
      if (p.pris_butik) { pris_kalla = p.pris_butik.pris; pris_kalla_fran = p.pris_butik.kalla; }
    }
    const radmapp = ut ? join(ut, namn.replace(/[^\w åäöÅÄÖ.-]/g, '_')) : null;
    const noV = r.translated_url ? await hamtaNoVersion(r.translated_url, { ut: radmapp, filnamn: spegel_no ?? `${namn}_NO`, logg }) : null;
    // Källans NO-pris: NO-annonsens länk går till beverbutikken.no, vars
    // egen valuta ÄR NOK — produkt-JSON:en läses rakt av (utan ?country=,
    // som bara finns på flerspråkiga butiker). Mätt 2026-09-18: 1 189 NOK
    // mot CaraShells 1 106 NOK — 7 %, innanför regeln.
    let pris_kalla_no = null;
    if (noV?.lank) {
      const p = await prisFor(noV.lank, marknadFor('NO').valuta, null, marknadFor('NO').valuta);
      if (p.pris_butik && !p.pris_butik.basvaluta) pris_kalla_no = p.pris_butik.pris;
    }
    const rad = {
      namn, spegel, spegel_no, spegel_us, page_id: r.id, url: r.url, typ: r.typ, typ_notion: r.typ_notion, status: r.status,
      filer: r.filer, landning: r.landning, skapad: r.skapad,
      kall_ad: kall ? { id: kall.id, status: kall.effective_status, kampanj: kall.campaign?.name ?? null } : null,
      copy_se,
      no: noV,
      brand: brandtraff(brieftext, copy_se?.message, copy_se?.rubrik, copy_se?.beskrivning, noV?.copy?.message, noV?.copy?.rubrik, noV?.copy?.beskrivning),
      pris_kalla, pris_kalla_fran, pris_kalla_no,
      paritet_se: prisParitet(pris_kalla, pris_se.pris_butik?.pris),
      paritet_no: noV ? prisParitet(pris_kalla_no, pris_no.pris_butik && !pris_no.pris_butik.basvaluta ? pris_no.pris_butik.pris : null) : null,
      finns_i_meta: { SE: dSe.finns_i_meta, NO: dNo.finns_i_meta, US: dUs.finns_i_meta },
      ad_ids: { SE: dSe.ad_id, NO: dNo.ad_id, US: dUs.ad_id },
      kampanj_se: se.kampanj ? { id: se.kampanj.id, namn: se.kampanj.namn, bas: se.kampanj.bas } : null,
      kampanj_no: no.kampanj ? { id: no.kampanj.id, namn: no.kampanj.namn, bas: no.kampanj.bas } : null,
      adset_se: se.kampanj ? hittaAdset(se.adsets, adsetNamn(se.kampanj.bas, tolkaNamn(namn).koncept), tolkaNamn(namn).koncept) : null,
      block: block.length, fil: null, fil_kalla: null, fil_alla: [], fil_fel: null, hamtat: Boolean(ut),
    };
    // Filen hämtas ÄVEN när SE-annonsen redan finns: hubbraden ska bära den,
    // och en omkörning efter ett Notion-fel skapar raden då utan svensk fil.
    if (ut) {
      // Den svenska filen: FÖRST ur Bäverbutikens live SE-annons i Meta (exakt
      // det som spenderar), sedan Notion-bilagan/Drive som reserv — aldrig
      // sidans mediablock, där ligger den norska versionen.
      const seV = kall ? await hamtaMetaVersion({ adId: kall.id, konto: KALLKONTO_SE, ut: radmapp, filnamn: spegel ?? namn, logg }) : null;
      if (seV?.fil) {
        Object.assign(rad, { fil: seV.fil, fil_kalla: `Meta-annons ${kall.id}`, fil_alla: [seV.fil] });
      } else {
        const h = hamtaSeFil(r.id, radmapp);
        const skalMeta = seV?.fel ? `Meta: ${seV.fel}` : (kall ? 'Meta gav ingen fil' : 'ingen källannons i Meta');
        Object.assign(rad, h.fel || !h.fil
          ? { fil_fel: `${skalMeta}; Notion: ${h.fel ?? 'bara NO-filer eller inget att hämta'}` }
          : { fil: h.fil, fil_kalla: 'Notion-bilaga/Drive (reserv)', fil_alla: h.fil_alla });
        if (rad.fil_fel) logg(`  ✗ ${namn}: ${rad.fil_fel}`); else logg(`  SE hämtad ur Notion (reserv): ${h.fil}`);
      }
    }
    rad.bedomning = bedom(rad);
    rad._block = block;   // används av --kor, skrivs aldrig ut
    rader.push(rad);
  }

  const klara_en = enRader.map((r) => {
    const namn = annonsdel(r.namn);
    const spegel = spegelnamn(namn, butik.post.annonsprefix);
    const spegel_us = spegel ? marknadsNamn(spegel, 'US') : null;
    const d = spegel_us && usKonto ? dubblett(spegel_us, kartaUk) : { finns_i_meta: false, ad_id: null };
    return { namn, spegel, spegel_us, page_id: r.id, url: r.url, us_uppe: d.finns_i_meta, us_ad_id: d.ad_id, klar_for_approved: d.finns_i_meta };
  });

  return {
    brand: butik.post.brand, nyckel: butik.post.nyckel, konto, us_konto: usKonto, datum, annonsmarknader,
    kalla_hub: { id: kalla.id, titel: kalla.titel, url: kalla.url }, hub: { id: hub.id, titel: hub.titel, url: hub.url },
    statusar: { se: spegling.status_se, en: spegling.status_en, spegel: SPEGEL_STATUS, slut: SLUTSTATUS }, kallstatusar, saknade_statusar,
    kampanj_se: se.kampanj ? { ...se.kampanj, adsets: se.adsets.map((a) => ({ id: a.id, name: a.name, status: a.status })) } : null, kampanj_se_skal: se.skal,
    kampanj_no: no.kampanj ? { ...no.kampanj, adsets: no.adsets.map((a) => ({ id: a.id, name: a.name, status: a.status })) } : null, kampanj_no_skal: no.skal,
    lank_se, lank_no, pris_se: pris_se.pris_butik, pris_no: pris_no.pris_butik && !pris_no.pris_butik.basvaluta ? pris_no.pris_butik : null,
    rader, klara_en, varningar, utmapp: utmapp(butik.post), hamtad: new Date().toISOString(),
    _hubbar: { kalla, hub },   // scheman för --kor, skrivs aldrig ut
  };
}

/** Kön utan interna fält (för --json). */
export function utanInternt(ko) {
  const { _hubbar, ...rest } = ko;
  return { ...rest, rader: (ko.rader ?? []).map(({ _block, ...r }) => r) };
}

// ------------------------------------------------------------ körningen

function korUppladdning({ nyckel, marknad, kampanjId, namn, fil, copy, torr }) {
  const args = [join(ROT, 'tools', 'ops-till-meta.mjs'), nyckel, '--marknad', marknad, '--kampanj', String(kampanjId), '--namn', namn, '--fil', fil, '--primar', copy.message, '--rubrik', copy.rubrik];
  if (copy.beskrivning) args.push('--beskrivning', copy.beskrivning);
  if (torr) args.push('--torr');
  args.push('--json');
  // 45 min: meta-libs backoff-kedja vid rate limit är ~27,5 min, och en dödad
  // uppladdning kan lämna en annons PAUSED som nästa körning läser som "finns redan".
  const r = spawnSync(process.execPath, args, { encoding: 'utf8', env: process.env, timeout: 45 * 60 * 1000, maxBuffer: 64 * 1024 * 1024 });
  const sista = String(r.stdout ?? '').trim().split('\n').filter(Boolean).at(-1) ?? '';
  let json = null;
  try { json = JSON.parse(sista); } catch { /* inget JSON — felet står i stderr */ }
  if (r.status !== 0 || !json?.ok) {
    return { ok: false, fel: json?.fel ?? String(r.stderr ?? '').trim().split('\n').filter(Boolean).at(-1) ?? `ops-till-meta avslutade med ${r.status}`, logg: String(r.stderr ?? '') };
  }
  return { ok: true, ...json, logg: String(r.stderr ?? '') };
}

export async function korSpegling({ ko, torr = false, logg = (...a) => console.error(...a) }) {
  const { laddaUppTillRad } = await import('./notion-fil-upp.mjs');
  const { kalla, hub } = ko._hubbar;
  const resultat = {
    brand: ko.brand, nyckel: ko.nyckel, datum: ko.datum, torr, kalla_hub: ko.kalla_hub.id, kalla_hub_namn: ko.kalla_hub.titel,
    saknade_statusar: ko.saknade_statusar, rader: [], approved: [], varningar: [...ko.varningar],
  };
  if (ko.saknade_statusar.includes(ko.statusar.en)) {
    logg(`⛔ "${ko.statusar.en}" finns inte i källhubben — ingen rad kan flyttas dit, så inget speglas förrän Axel lagt till steget.${torr ? ' (torr: planen visas ändå)' : ''}`);
    if (!torr) return resultat;
  }

  for (const rad of ko.rader) {
    const ut = { namn: rad.namn, spegel: rad.spegel, page_id: rad.page_id, utfall: null, skal: null, se: null, no: null, hubb: null };
    resultat.rader.push(ut);
    if (!rad.bedomning.se.ok) {
      ut.utfall = 'hoppad';
      ut.skal = rad.bedomning.se.skal.join('; ');
      logg(`↷ ${rad.namn}: ${ut.skal}`);
      // Brand- och prisstopp är redigerarens/Axels sak: kommentar på källraden,
      // status orörd. Rutinen går varje dag och raden står kvar tills någon
      // gör om creativen — samma kommentar en gång, inte en ny varje dygn.
      if (!torr && (rad.brand.length || !rad.paritet_se.ok)) {
        const marke = `⛔ Not mirrored to ${ko.brand}: ${ut.skal}`;
        try {
          if (await harKommentar(rad.page_id, marke)) logg('  (stopp-kommentaren står redan på raden — skriver ingen ny)');
          else await kommentera(rad.page_id, `${marke}. The store version must not name Bäverbutiken and must carry ${ko.brand}'s price (${ko.pris_se?.pris ?? '?'} ${ko.pris_se?.valuta ?? 'SEK'}).`);
        } catch (e) { ut.skal += ` (kommentaren misslyckades: ${e.message})`; }
      }
      continue;
    }
    try {
      // 1. SE live (eller redan uppe).
      if (rad.finns_i_meta.SE) {
        ut.se = { ad_id: rad.ad_ids.SE, kampanj: rad.kampanj_se.namn, adset: null, fanns: true };
        logg(`= ${rad.spegel}: finns redan i kontot (${rad.ad_ids.SE}) — laddas inte upp`);
      } else {
        logg(`↑ ${rad.namn} → ${rad.spegel} (SE${torr ? ', torr' : ''}) …`);
        const r = korUppladdning({ nyckel: ko.nyckel, marknad: 'SE', kampanjId: rad.kampanj_se.id, namn: rad.spegel, fil: rad.fil, copy: rad.copy_se, torr });
        if (!r.ok) throw new Error(`SE-uppladdningen misslyckades: ${r.fel}`);
        ut.se = { ad_id: r.annons?.id ?? (torr ? 'TORR' : null), kampanj: r.kampanj?.namn ?? rad.kampanj_se.namn, adset: r.adset?.namn ?? null, status: r.annons?.status ?? null, fanns: false };
        logg(`  ${torr ? 'skulle gå' : 'gick'} live: ad ${ut.se.ad_id} i "${ut.se.kampanj}" (adset ${ut.se.adset ?? '?'})`);
      }
      // 2. NO live ur Bäverbutikens NO-version (0 krediter).
      if (rad.finns_i_meta.NO) {
        ut.no = { ad_id: rad.ad_ids.NO, kampanj: rad.kampanj_no?.namn ?? null, fanns: true };
      } else if (rad.bedomning.no.ok) {
        logg(`↑ ${rad.spegel_no} (NO${torr ? ', torr' : ''}) …`);
        const r = korUppladdning({ nyckel: ko.nyckel, marknad: 'NO', kampanjId: rad.kampanj_no.id, namn: rad.spegel_no, fil: rad.no.fil, copy: rad.no.copy, torr });
        if (!r.ok) { ut.no = { ad_id: null, skal: `NO-uppladdningen misslyckades: ${r.fel}` }; logg(`  ✗ ${ut.no.skal}`); }
        else { ut.no = { ad_id: r.annons?.id ?? (torr ? 'TORR' : null), kampanj: r.kampanj?.namn ?? rad.kampanj_no.namn, adset: r.adset?.namn ?? null, fanns: false }; logg(`  ${torr ? 'skulle gå' : 'gick'} live: ad ${ut.no.ad_id} i "${ut.no.kampanj}"`); }
      } else {
        ut.no = { ad_id: null, skal: rad.bedomning.no.skal.join('; ') };
        logg(`  NO speglas inte: ${ut.no.skal}`);
      }
      // 3. Raden i butikens hub — US-rutinen läser den.
      const finns = await finnsRad(hub, rad.spegel);
      if (finns) {
        ut.hubb = { ...finns, fanns: true };
        logg(`= raden ${rad.spegel} finns redan i ${hub.titel}`);
      } else if (torr) {
        ut.hubb = { page_id: null, url: null, torr: true };
        logg(`○ skulle skapa raden ${rad.spegel} i ${hub.titel} (${rad.block} block kopieras, SE${rad.no?.fil ? ' + NO' : ''}-fil bifogas)`);
      } else if (rad.finns_i_meta.SE && !rad.fil) {
        // Annonsen finns i kontot men hubbraden saknas OCH ingen fil gick att
        // hämta. Det kan vara en avbruten körning — eller att namnet krockar
        // med en av butikens EGNA annonser (docs/naming-convention.md regel 0).
        // Att skapa en rad utan fil ger US-rutinen ingenting att översätta.
        throw new Error(`"${rad.spegel}" finns i kontot (${rad.ad_ids.SE}) men har varken hubbrad eller fil. Kontrollera att annonsen är spegeln och inte butikens egen — ingen rad skapas.`);
      } else {
        const kopia = kopieraBlock(rad._block);
        const block = [kalloutBlock({ kallNamn: ko.kalla_hub.titel, kallUrl: rad.url, brand: ko.brand, datum: ko.datum }), ...kopia.block];
        const { properties, fel } = byggEgenskaper(hub.properties, { namn: rad.spegel, typ: rad.typ, status: SPEGEL_STATUS, landning: ko.lank_se, datum: ko.datum });
        if (fel.length) throw new Error(`hubbraden kan inte byggas: ${fel.join(' ')}`);
        const omg = delaBlock(block);
        const sida = await notion('pages', { method: 'POST', body: { parent: { database_id: ren(hub.id) }, properties, children: omg[0] ?? [] } });
        for (let i = 1; i < omg.length; i++) await notion(`blocks/${ren(sida.id)}/children`, { method: 'PATCH', body: { children: omg[i] } });
        ut.hubb = { page_id: sida.id, url: sida.url ?? null, fanns: false, block: block.length, hoppade: kopia.hoppade };
        logg(`+ rad skapad i ${hub.titel}: ${sida.url}`);
        // SE-filen först och NO bara om den satt: US-rutinen tar radens fil
        // och översätter den. Sitter bara den norska blir den engelska
        // annonsen gjord på norska — värre än ingen fil alls.
        let seSitter = false;
        if (rad.fil) {
          try { await laddaUppTillRad({ pageId: sida.id, fil: rad.fil, logg: () => {} }); seSitter = true; logg(`  bifogad: ${basename(rad.fil)}`); }
          catch (e) { resultat.varningar.push(`${rad.spegel}: den svenska filen ${basename(rad.fil)} kunde inte bifogas — ${e.message}`); logg(`  ⚠ ${basename(rad.fil)}: ${e.message}`); }
        }
        ut.hubb.se_fil = seSitter;
        if (rad.no?.fil && ut.no?.ad_id) {
          if (!seSitter) { resultat.varningar.push(`${rad.spegel}: NO-filen bifogades INTE — den svenska saknas, och en rad med bara norsk fil hade översatts till engelska av US-rutinen. Bifoga den svenska för hand.`); logg('  ⚠ NO-filen hoppas över: den svenska sitter inte'); }
          else {
            try { await laddaUppTillRad({ pageId: sida.id, fil: rad.no.fil, logg: () => {} }); logg(`  bifogad: ${basename(rad.no.fil)}`); }
            catch (e) { resultat.varningar.push(`${rad.spegel}: ${basename(rad.no.fil)} kunde inte bifogas — ${e.message}`); logg(`  ⚠ ${basename(rad.no.fil)}: ${e.message}`); }
          }
        }
        await kommentera(sida.id, `Mirrored from Bäverbutiken row ${rad.namn}. SE ad ${ut.se.ad_id} live in ${ut.se.kampanj}${ut.se.adset ? ` (adset ${ut.se.adset})` : ''}.${ut.no?.ad_id ? ` NO ad ${ut.no.ad_id} live in ${ut.no.kampanj}.` : ' NO not mirrored — the NO routine translates it.'} Next: English version via the US routine.`);
      }
      // 4. Källraden → "<Brand> EN ready to be active". En rad som redan är
      //    Approved rörs ALDRIG: `--fran "…,Approved"` är efterjusteringen av
      //    rader som blev klara innan stegen fanns, och att flytta dem bakåt
      //    hade tagit bort dem ur slutläget (samma regel som /ops-oversatt:
      //    "Statusen rörs inte — raden är redan Approved").
      if (!torr) {
        await kommentera(rad.page_id, `✅ Mirrored to ${ko.brand} as ${rad.spegel}: SE ad ${ut.se.ad_id} live in ${ut.se.kampanj}${ut.se.adset ? ` (adset ${ut.se.adset})` : ''}.${ut.no?.ad_id ? ` NO ad ${ut.no.ad_id} live in ${ut.no.kampanj}.` : ` NO not mirrored: ${ut.no?.skal ?? '?'}.`}${ut.hubb?.url ? ` Hub row: ${ut.hubb.url}.` : ''} English version follows via ${ko.brand}'s US routine.`);
        if (arSlutstatus(rad.status, ko.statusar)) {
          ut.status_rord = false;
          logg(`  källraden står i "${rad.status}" — statusen rörs inte`);
        } else {
          await sattStatus(rad.page_id, kalla, ko.statusar.en);
          ut.status_rord = true;
          logg(`  källraden → "${ko.statusar.en}"`);
        }
      }
      ut.utfall = 'speglad';
    } catch (e) {
      ut.utfall = 'fel';
      ut.skal = e.message;
      logg(`✗ ${rad.namn}: ${e.message}`);
    }
  }

  // 5. Steg två: US finns ⇒ källraden Approved.
  for (const r of ko.klara_en) {
    if (!r.klar_for_approved) continue;
    try {
      if (!torr) {
        await kommentera(r.page_id, `🇺🇸 English version ${r.spegel_us} is live in ${marknadFor('US').kontonamn} (ad ${r.us_ad_id}). All markets carry this ad — set to ${SLUTSTATUS}.`);
        await sattStatus(r.page_id, kalla, SLUTSTATUS);
      }
      resultat.approved.push({ namn: r.namn, spegel: r.spegel, page_id: r.page_id, us_ad_id: r.us_ad_id, torr });
      logg(`✓ ${r.namn}: US uppe (${r.us_ad_id}) → ${torr ? 'skulle bli' : ''} ${SLUTSTATUS}`);
    } catch (e) {
      resultat.varningar.push(`${r.namn}: kunde inte sättas till ${SLUTSTATUS} — ${e.message}`);
    }
  }
  return resultat;
}

// ------------------------------------------------------------ utskrift

export function tabell(ko) {
  const ut = [];
  ut.push(`=== Speglingen · ${ko.brand} (${ko.nyckel}) · ${ko.datum} ===`);
  ut.push(`Källhub: ${ko.kalla_hub.titel} (${ko.kalla_hub.id}) · status ${ko.kallstatusar.map((s) => `"${s}"`).join(', ')}`);
  ut.push(`Butikens hub: ${ko.hub.titel} (${ko.hub.id}) · spegelrader får "${ko.statusar.spegel}"`);
  ut.push(`Kampanj SE: ${ko.kampanj_se ? `${ko.kampanj_se.namn} [${ko.kampanj_se.status}]` : `⚠️  INGEN — ${ko.kampanj_se_skal}`}`);
  ut.push(`Kampanj NO: ${ko.kampanj_no ? `${ko.kampanj_no.namn} [${ko.kampanj_no.status}]` : `⚠️  INGEN — ${ko.kampanj_no_skal}`}`);
  ut.push(`Pris SE: ${ko.pris_se ? `${ko.pris_se.pris} ${ko.pris_se.valuta}` : '⚠️  okänt'} · Pris NO: ${ko.pris_no ? `${ko.pris_no.pris} ${ko.pris_no.valuta}` : '⚠️  okänt'}`);
  if (ko.saknade_statusar.length) ut.push(`⛔ Källhubben saknar statusalternativen: ${ko.saknade_statusar.map((s) => `"${s}"`).join(', ')} — Axels klick`);
  ut.push('');
  if (!ko.rader.length) ut.push('Inga rader att spegla.');
  for (const r of ko.rader) {
    const b = r.bedomning;
    ut.push(`• ${r.namn} → ${r.spegel ?? '⚠️ inget spegelnamn'}  [${r.typ}]  ${b.se.ok ? '✅ SE' : `⛔ SE: ${b.se.skal.join('; ')}`}${r.finns_i_meta.SE ? ' (finns redan)' : ''}`);
    ut.push(`    copy:     ${r.copy_se ? `"${r.copy_se.rubrik}" ur ${r.kall_ad?.kampanj ?? '?'}` : '⚠️  ingen källannons'}${r.brand.length ? `  ⛔ brand: ${r.brand.join(', ')}` : ''}`);
    ut.push(`    pris:     creativen ${r.pris_kalla ?? '?'} (${r.pris_kalla_fran ?? 'okänt'}) · butiken ${ko.pris_se?.pris ?? '?'} → ${r.paritet_se.ok ? 'ok' : r.paritet_se.skal}`);
    ut.push(`    fil:      ${r.fil ? `${r.fil} (${r.fil_kalla})` : r.fil_fel ? `✗ ${r.fil_fel}` : `(hämtas med --ut: ur Meta-annons ${r.kall_ad?.id ?? '?'}${r.filer.length ? `, reserv bilaga ${r.filer.join(', ')}` : ''})`}`);
    ut.push(`    NO:       ${r.no ? `${r.no.namn ?? r.no.ad_id} [${r.no.status ?? '?'}] ${r.no.fil ? `→ ${r.no.fil}` : r.no.fel ? `✗ ${r.no.fel}` : '(hämtas med --ut)'} · pris ${r.pris_kalla_no ?? '?'} vs ${ko.pris_no?.pris ?? '?'} → ${b.no.ok ? '✅' : `⛔ ${b.no.skal.join('; ')}`}` : '— ingen NO-version på källraden'}`);
    ut.push(`    notion:   ${r.url}`);
  }
  if (ko.klara_en.length) {
    ut.push('');
    ut.push(`Väntar på US (${ko.klara_en.length}):`);
    for (const r of ko.klara_en) ut.push(`  · ${r.namn} → ${r.spegel_us ?? '?'}: ${r.us_uppe ? `✅ uppe (${r.us_ad_id}) → Approved` : 'inte uppe än'}`);
  }
  if (ko.varningar.length) {
    ut.push('');
    ut.push(`Varningar (${ko.varningar.length}):`);
    for (const v of ko.varningar) ut.push(`  ⚠️  ${v}`);
  }
  return ut.join('\n');
}

// ------------------------------------------------------------ CLI

async function huvud() {
  const args = process.argv.slice(2);
  const flagga = (n, s = null) => { const i = args.indexOf(`--${n}`); return i !== -1 && args[i + 1] !== undefined && !args[i + 1].startsWith('--') ? args[i + 1] : s; };
  const finns = (n) => args.includes(`--${n}`);
  const do_ = (m) => { console.error(`✗ ${m}`); process.exit(1); };

  if (finns('kallor')) {
    const { lasRegister, speglingFor } = await import('../factory/register.mjs');
    const lista = lasRegister().produkter.filter((p) => speglingFor(p)).map((p) => ({ nyckel: p.nyckel, brand: p.brand, kalla_hub: p.spegling.kalla_hub, kalla_namn: p.spegling.kalla_namn, status_se: p.spegling.status_se, status_en: p.spegling.status_en, egen_hub: p.notion?.database_id ?? null }));
    if (finns('json')) { console.log(JSON.stringify(lista, null, 2)); return; }
    if (!lista.length) { console.log('Inga speglingar i registret.'); return; }
    console.log('Speglingar (källhub i Bäverbutiken → OPS-butik). /oversatt NO sätter status_se i stället för Approved på de här hubbarna:');
    for (const s of lista) console.log(`  ${s.kalla_hub}  ${s.kalla_namn || '(namnlös)'}  →  ${s.nyckel} (${s.brand})  ·  "${s.status_se}"  →  "${s.status_en}"`);
    return;
  }

  const flaggvarden = new Set(['fran', 'ut'].map((n) => flagga(n)).filter(Boolean));
  const nyckel = args.find((a) => !a.startsWith('--') && !flaggvarden.has(a));
  if (!nyckel) do_('Ange <nyckel>. Exempel: node tools/ops-spegla.mjs carashell/takskyddet --ut factory/output/carashell/takskyddet/spegla-2026-09-18');
  if (!process.env.NOTION_TOKEN) do_('NOTION_TOKEN saknas i miljön — hubbarna går inte att läsa.');
  if (!process.env.META_ACCESS_TOKEN) do_('META_ACCESS_TOKEN saknas i miljön — kontona går inte att läsa.');
  const { säkerställProxy } = await import('./meta-lib.mjs');
  säkerställProxy();
  const ut = flagga('ut');
  if (finns('kor') && !ut) do_('--kor kräver --ut <mapp> (filerna måste hämtas för att laddas upp).');

  const ko = await byggSpegelko({ nyckel, fran: flagga('fran'), ut });
  if (!finns('kor')) {
    if (finns('json')) console.log(JSON.stringify(utanInternt(ko), null, 2));
    else console.log(tabell(ko));
    return;
  }
  console.error(tabell(ko));
  console.error('');
  const torr = finns('torr');
  const resultat = await korSpegling({ ko, torr });
  const jobb = byggDiscordJobb(resultat);
  const mapp = ko.utmapp;
  if (!existsSync(mapp)) mkdirSync(mapp, { recursive: true });
  const bas = join(mapp, `spegla-${ko.datum}${torr ? '-torr' : ''}`);
  writeFileSync(`${bas}.json`, `${JSON.stringify({ ...resultat, ko: utanInternt(ko) }, null, 2)}\n`);
  writeFileSync(`${bas}.discord.json`, `${JSON.stringify(jobb, null, 2)}\n`);
  console.error(`\nResultat: ${bas}.json · Discord-jobb: ${bas}.discord.json`);
  const speglade = resultat.rader.filter((r) => r.utfall === 'speglad').length;
  console.error(`${torr ? 'TORR: ' : ''}${speglade} speglad(e) · ${resultat.rader.filter((r) => r.utfall === 'hoppad').length} hoppad(e) · ${resultat.rader.filter((r) => r.utfall === 'fel').length} fel · ${resultat.approved.length} → ${SLUTSTATUS}`);
  if (finns('json')) console.log(JSON.stringify({ ...resultat, ko: undefined }, null, 2));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  huvud().catch((e) => { console.error(`✗ ${e.message}`); process.exit(1); });
}
