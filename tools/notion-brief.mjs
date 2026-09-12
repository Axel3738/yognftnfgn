#!/usr/bin/env node
// notion-brief.mjs — skapar brief-rader i en creative hub i Notion via REST.
// Byggstenen som gör att en RUTIN (utan Notion-MCP) kan leverera briefer till
// redigerarna. Reglerna är docs/os/NOTION-FORMAT.md + Axels besked 2026-09-10:
//
//   • ETT item per annons. Namn = annonsnamnet exakt (naming-convention).
//   • Status `Draft`. Typ = `Video - Pending Approval` (video) resp.
//     `Image - Pending Approval` (bild).
//   • Hela briefen som sidinnehåll (children-block), inte som bilaga.
//   • Aldrig dubbletter: finns raden redan hoppas den över och rapporteras.
//
//   node tools/notion-brief.mjs --hubbar
//       listar alla databaser token ser: titel, id, om Namn/Status/Typ finns,
//       Status-typ, och om Typ har "Video - Pending Approval".
//   node tools/notion-brief.mjs --hub <database_id> --namn <annonsnamn> --typ video|bild --brief <fil.md> [--status Draft] [--torr] [--json]
//   node tools/notion-brief.mjs --hub <database_id> --manifest <fil.json> [--torr] [--json]
//       manifestet är [{namn, typ, brief}] där brief är sökvägen till .md-filen
//       (relativt manifestets mapp, annars relativt cwd).
//
// --torr visar exakt vad som skulle skapas utan att skriva något.
// --json skriver ett resultat-JSON sist på stdout: [{namn, page_id, url, skapad, fel}].
//   Loggen går då till stderr så att stdout är ren JSON.
//
// Schemat läses ALLTID ur databasen först (GET /v1/databases/{id}). I hubbar som
// skapats via API:t är Status av typ `select` i stället för `status` — värdet
// byggs efter typen ({status:{name}} resp {select:{name}}).
//
// Notion-gränser som hanteras: max 100 block per anrop (första 100 i POST
// /v1/pages, resten i PATCH /v1/blocks/{id}/children i omgångar), max 2000
// tecken per rich_text-element, max 100 rader per tabell.
//
// Kräver env NOTION_TOKEN (integrationen inbjuden till hubben, ••• → Connections).
// 404 betyder "inte inbjuden", inte "databasen saknas".

import { readFileSync, existsSync } from 'node:fs';
import { dirname, resolve, isAbsolute } from 'node:path';

const API = 'https://api.notion.com/v1';

/** Typ-taggen per creative-typ. Axels besked 2026-09-10: bild får sin egen tag
 *  (NOTION-FORMAT.md:s äldre "alltid Video" gäller inte längre). */
export const TYP_TAG = {
  video: 'Video - Pending Approval',
  bild: 'Image - Pending Approval',
};

export const MAX_BLOCK_PER_ANROP = 100;
export const MAX_BLOCK_TOTALT_PER_ANROP = 1000;   // inkl. nästlade (tabellrader)
export const MAX_TECKEN = 2000;
export const MAX_TABELLRADER = 100;

// ------------------------------------------------------------------ Notion-anrop

// Notion stryper till ~3 anrop/s. Det är normalt, inte en hängning.
let sist = 0;
async function notion(sökväg, { method = 'GET', body = null } = {}) {
  const token = process.env.NOTION_TOKEN;
  if (!token) {
    const e = new Error('NOTION_TOKEN saknas i miljön. Lägg in den i sessionens Environment.');
    e.saknarToken = true;
    throw e;
  }
  const vänta = 350 - (Date.now() - sist);
  if (vänta > 0) await new Promise((r) => setTimeout(r, vänta));
  sist = Date.now();
  const res = await fetch(`${API}/${sökväg}`, {
    method,
    headers: {
      authorization: `Bearer ${token}`,
      'notion-version': '2022-06-28',
      'content-type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const e = new Error(`Notion ${res.status}: ${json.message || res.statusText}`);
    e.status = res.status;
    throw e;
  }
  return json;
}

// ------------------------------------------------------------------ text-hjälpare

/** Delar en sträng i bitar om högst `max` tecken. Bryter helst vid blanksteg
 *  så inga ord klyvs — men aldrig så att en bit blir tom. */
export function delaText(text, max = MAX_TECKEN) {
  const ut = [];
  let rest = String(text ?? '');
  while (rest.length > max) {
    let klipp = rest.lastIndexOf(' ', max);
    if (klipp < max * 0.5) klipp = max;         // inget rimligt blanksteg — klipp hårt
    ut.push(rest.slice(0, klipp));
    rest = rest.slice(klipp).replace(/^ /, '');
  }
  if (rest.length || !ut.length) ut.push(rest);
  return ut.filter((b, i) => b.length || i === 0);
}

/** Inline-markdown → Notion rich_text. Stöder **fet**, *kursiv*, `kod` och
 *  [länk](url). Varje element hålls under 2000 tecken. */
export function richText(text, extraAnnot = {}) {
  const ut = [];
  const s = String(text ?? '');
  const re = /\*\*(.+?)\*\*|`([^`\n]+)`|\[([^\]\n]+)\]\((https?:\/\/[^)\s]+)\)|(?<![\w*])\*([^*\n]+?)\*(?![\w*])/g;
  let pos = 0;
  const lägg = (innehåll, annot = {}, link = null) => {
    if (!innehåll) return;
    for (const bit of delaText(innehåll)) {
      const el = { type: 'text', text: { content: bit } };
      if (link) el.text.link = { url: link };
      const a = { ...extraAnnot, ...annot };
      if (Object.keys(a).length) el.annotations = a;
      ut.push(el);
    }
  };
  for (const m of s.matchAll(re)) {
    lägg(s.slice(pos, m.index));
    if (m[1] !== undefined) lägg(m[1], { bold: true });
    else if (m[2] !== undefined) lägg(m[2], { code: true });
    else if (m[3] !== undefined) lägg(m[3], {}, m[4]);
    else if (m[5] !== undefined) lägg(m[5], { italic: true });
    pos = m.index + m[0].length;
  }
  lägg(s.slice(pos));
  return ut;
}

const KODSPRÅK = new Set(['javascript', 'typescript', 'json', 'bash', 'shell', 'python', 'html', 'css', 'yaml', 'markdown', 'sql', 'plain text']);
const kodspråk = (s) => {
  const n = String(s || '').trim().toLowerCase();
  if (n === 'js') return 'javascript';
  if (n === 'ts') return 'typescript';
  if (n === 'sh' || n === 'zsh') return 'shell';
  if (n === 'yml') return 'yaml';
  if (n === 'md') return 'markdown';
  return KODSPRÅK.has(n) ? n : 'plain text';
};

// ------------------------------------------------------------------ markdown → block

const ÄR_TABELLSEP = (rad) => /^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)*\|?\s*$/.test(rad);
const tabellCeller = (rad) => {
  let s = rad.trim();
  if (s.startsWith('|')) s = s.slice(1);
  if (s.endsWith('|')) s = s.slice(0, -1);
  return s.split(/(?<!\\)\|/).map((c) => c.replace(/\\\|/g, '|').trim());
};

function tabellBlock(rader) {
  const ut = [];
  const bredd = Math.max(...rader.map((r) => r.length));
  const cell = (r) => ({
    type: 'table_row',
    table_row: { cells: Array.from({ length: bredd }, (_, i) => richText(r[i] ?? '')) },
  });
  // Max 100 rader per tabell: huvudraden upprepas i varje del så att varje del
  // går att läsa för sig.
  const huvud = rader[0];
  const kropp = rader.slice(1);
  const perDel = MAX_TABELLRADER - 1;
  for (let i = 0; i < Math.max(1, kropp.length); i += perDel) {
    const del = [huvud, ...kropp.slice(i, i + perDel)];
    ut.push({
      type: 'table',
      table: { table_width: bredd, has_column_header: true, has_row_header: false, children: del.map(cell) },
    });
    if (!kropp.length) break;
  }
  return ut;
}

/** Ren funktion: markdown → lista av Notion-block (utan id:n, redo för
 *  POST /pages children eller PATCH /blocks/{id}/children).
 *
 *  Stöder: rubriker (#/##/###, djupare → heading_3), stycken, punktlistor
 *  (-/*), numrerade listor, citat (>), kodblock (```), tabeller, --- → divider,
 *  fet/kursiv/kod/länk inline. Tomma rader hoppas över. Rader som fortsätter en
 *  listpunkt eller ett stycke (utan tom rad emellan) slås ihop med det.
 *  Citatrader behåller sina radbrytningar — copy-cardet ska klistras in exakt. */
export function tillBlock(markdown) {
  const rader = String(markdown ?? '').replace(/\r\n?/g, '\n').split('\n');
  const ut = [];
  let i = 0;
  let sista = null;                   // { typ, text } för fortsättningsrader

  const stäng = () => { sista = null; };
  const lägg = (typ, text) => {
    ut.push({ type: typ, [typ]: { rich_text: richText(text) } });
    sista = { typ, index: ut.length - 1, text };
  };
  const förläng = (text, sep) => {
    sista.text += sep + text;
    ut[sista.index][sista.typ].rich_text = richText(sista.text);
  };

  while (i < rader.length) {
    const rå = rader[i];
    const rad = rå.trim();

    if (!rad) { stäng(); i++; continue; }

    // Kodblock
    if (rad.startsWith('```')) {
      const språk = kodspråk(rad.slice(3));
      const kod = [];
      i++;
      while (i < rader.length && !rader[i].trim().startsWith('```')) kod.push(rader[i++]);
      i++;                                          // hoppa över avslutande ```
      ut.push({
        type: 'code',
        code: {
          rich_text: delaText(kod.join('\n')).map((c) => ({ type: 'text', text: { content: c } })),
          language: språk,
        },
      });
      stäng();
      continue;
    }

    // Horisontell linje
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(rad)) { ut.push({ type: 'divider', divider: {} }); stäng(); i++; continue; }

    // Rubrik
    const h = rad.match(/^(#{1,6})\s+(.+?)\s*#*$/);
    if (h) {
      const nivå = Math.min(h[1].length, 3);
      ut.push({ type: `heading_${nivå}`, [`heading_${nivå}`]: { rich_text: richText(h[2]) } });
      stäng();
      i++;
      continue;
    }

    // Tabell: sammanhängande rader som börjar med |
    if (rad.startsWith('|')) {
      const tab = [];
      while (i < rader.length && rader[i].trim().startsWith('|')) {
        const r = rader[i].trim();
        if (!ÄR_TABELLSEP(r)) tab.push(tabellCeller(r));
        i++;
      }
      if (tab.length) ut.push(...tabellBlock(tab));
      stäng();
      continue;
    }

    // Citat — radbrytningarna bevaras (primärtexten i copy-cardet är radvis)
    if (rad.startsWith('>')) {
      const text = rad.replace(/^>\s?/, '');
      if (sista?.typ === 'quote') förläng(text, '\n');
      else lägg('quote', text);
      i++;
      continue;
    }

    // Punktlista
    const p = rad.match(/^[-*+]\s+(.*)$/);
    if (p) { lägg('bulleted_list_item', p[1]); i++; continue; }

    // Numrerad lista
    const n = rad.match(/^\d+[.)]\s+(.*)$/);
    if (n) { lägg('numbered_list_item', n[1]); i++; continue; }

    // Fortsättningsrad (listpunkt/stycke/citat utan tom rad emellan)
    if (sista) { förläng(rad, sista.typ === 'quote' ? '\n' : ' '); i++; continue; }

    // Stycke
    lägg('paragraph', rad);
    i++;
  }
  return ut;
}

/** Delar blocklistan i omgångar som ryms i ett Notion-anrop: högst `max`
 *  toppnivåblock och högst `maxTotalt` block inklusive nästlade (tabellrader). */
export function delaBlock(block, { max = MAX_BLOCK_PER_ANROP, maxTotalt = MAX_BLOCK_TOTALT_PER_ANROP } = {}) {
  const vikt = (b) => 1 + (b[b.type]?.children?.length ?? 0);
  const ut = [];
  let nu = [];
  let summa = 0;
  for (const b of block) {
    const v = vikt(b);
    if (nu.length && (nu.length >= max || summa + v > maxTotalt)) { ut.push(nu); nu = []; summa = 0; }
    nu.push(b);
    summa += v;
  }
  if (nu.length) ut.push(nu);
  return ut;
}

// ------------------------------------------------------------------ properties

/** Hittar hubbens fält ur databasens schema (samma uppslag som notion-kalla.mjs). */
export function hittaFält(schema = {}) {
  const poster = Object.entries(schema);
  const titel = poster.find(([, v]) => v.type === 'title')?.[0] ?? null;
  const status =
    poster.find(([n, v]) => n === 'Status' && (v.type === 'status' || v.type === 'select'))?.[0]
    ?? poster.find(([, v]) => v.type === 'status')?.[0] ?? null;
  const typ =
    poster.find(([n, v]) => n === 'Typ' && (v.type === 'select' || v.type === 'multi_select'))?.[0]
    ?? poster.find(([n, v]) => /^(typ|type|tag)$/i.test(n) && (v.type === 'select' || v.type === 'multi_select'))?.[0] ?? null;
  const landning = poster.find(([n, v]) => /landing/i.test(n) && (v.type === 'rich_text' || v.type === 'url'))?.[0] ?? null;
  const skapad = poster.find(([n, v]) => /^(skapad|created)$/i.test(n) && v.type === 'date')?.[0] ?? null;
  return { titel, status, typ, landning, skapad };
}

const alternativ = (def) => (def?.[def.type]?.options ?? []).map((o) => o.name);

/** Ren funktion: bygger sidans properties efter hubbens schema.
 *  Status byggs som {status:{name}} eller {select:{name}} beroende på typ.
 *  Returnerar { properties, fel, varningar } — `fel` är saker som gör att
 *  anropet skulle misslyckas (t.ex. status-alternativ som inte finns). */
export function byggEgenskaper(schema, { namn, typ, status = 'Draft', landning = null, datum = null }) {
  const fält = hittaFält(schema);
  const fel = [];
  const varningar = [];
  const properties = {};

  if (!namn || !String(namn).trim()) fel.push('Namn saknas.');
  if (!fält.titel) fel.push('Hubben har inget title-fält (Namn).');
  else properties[fält.titel] = { title: [{ type: 'text', text: { content: String(namn).trim() } }] };

  if (!fält.status) varningar.push('Hubben har inget Status-fält — raden skapas utan status.');
  else {
    const def = schema[fält.status];
    const val = alternativ(def);
    if (def.type === 'status') {
      // status-typen kan inte skapa nya alternativ på fri hand → hårt fel
      if (val.length && !val.includes(status)) fel.push(`Status "${status}" finns inte i hubben (${val.join(' | ')}).`);
      properties[fält.status] = { status: { name: status } };
    } else {
      if (val.length && !val.includes(status)) varningar.push(`Status "${status}" finns inte som alternativ — Notion skapar det.`);
      properties[fält.status] = { select: { name: status } };
    }
  }

  const tag = TYP_TAG[typ];
  if (!tag) fel.push(`Okänd typ "${typ}" — ange video eller bild.`);
  else if (!fält.typ) varningar.push('Hubben har inget Typ-fält — raden skapas utan typ.');
  else {
    const def = schema[fält.typ];
    const val = alternativ(def);
    if (val.length && !val.includes(tag)) varningar.push(`Typ "${tag}" finns inte som alternativ — Notion skapar det.`);
    properties[fält.typ] = def.type === 'multi_select' ? { multi_select: [{ name: tag }] } : { select: { name: tag } };
  }

  if (landning && fält.landning) {
    properties[fält.landning] = schema[fält.landning].type === 'url'
      ? { url: landning }
      : { rich_text: [{ type: 'text', text: { content: landning.slice(0, MAX_TECKEN) } }] };
  }
  if (datum && fält.skapad) properties[fält.skapad] = { date: { start: datum } };

  return { properties, fel, varningar, fält };
}

/** Landningssidan ur briefen ("Landing page: https://…" eller "Destination: …"). */
export function landningUrBrief(markdown) {
  const m = String(markdown ?? '').match(/(?:landing page|destination)\W{0,6}(https?:\/\/[^\s)\]|*]+)/i);
  return m ? m[1] : null;
}

// ------------------------------------------------------------------ dubbletter

/** Ren funktion: hittar en befintlig rad med samma namn i ett query-svar.
 *  Jämför trimmat och skiftlägesokänsligt — `enginecover_pd_21_h1` och
 *  `Enginecover_PD_21_H1` är samma annons, inte två. Arkiverade rader räknas inte. */
export function hittaDubblett(resultat, namn) {
  const mål = String(namn ?? '').trim().toLowerCase();
  for (const sida of resultat ?? []) {
    if (sida.archived) continue;
    const titel = Object.values(sida.properties ?? {}).find((p) => p.type === 'title');
    const text = (titel?.title ?? []).map((t) => t.plain_text ?? t.text?.content ?? '').join('').trim().toLowerCase();
    if (text && text === mål) return { id: sida.id, url: sida.url ?? null };
  }
  return null;
}

// ------------------------------------------------------------------ manifest

/** Ren funktion: tolkar ett manifest [{namn, typ, brief}] och löser
 *  brief-sökvägarna relativt `basmapp` (manifestets mapp). Kastar på fel. */
export function lasManifest(json, basmapp = process.cwd()) {
  const data = typeof json === 'string' ? JSON.parse(json) : json;
  const lista = Array.isArray(data) ? data : data?.rader ?? data?.briefer;
  if (!Array.isArray(lista)) throw new Error('Manifestet ska vara en lista [{namn, typ, brief}].');
  const sedda = new Set();
  return lista.map((r, i) => {
    const namn = String(r?.namn ?? r?.name ?? '').trim();
    const typ = String(r?.typ ?? r?.type ?? '').trim().toLowerCase().replace(/^image$/, 'bild');
    const brief = String(r?.brief ?? r?.fil ?? '').trim();
    if (!namn) throw new Error(`Rad ${i + 1}: namn saknas.`);
    if (!TYP_TAG[typ]) throw new Error(`Rad ${i + 1} (${namn}): typ ska vara video eller bild, inte "${r?.typ}".`);
    if (!brief) throw new Error(`Rad ${i + 1} (${namn}): brief-sökväg saknas.`);
    if (sedda.has(namn.toLowerCase())) throw new Error(`Rad ${i + 1}: "${namn}" står två gånger i manifestet.`);
    sedda.add(namn.toLowerCase());
    const sökväg = isAbsolute(brief) ? brief : resolve(basmapp, brief);
    return { namn, typ, brief: sökväg, status: r?.status ? String(r.status) : undefined };
  });
}

// ------------------------------------------------------------------ hubblista

/** Ren funktion: sammanfattar en databas ur ett search-svar. */
export function beskrivHub(db) {
  const titel = (db.title ?? []).map((t) => t.plain_text ?? '').join('');
  const fält = hittaFält(db.properties ?? {});
  const typDef = fält.typ ? db.properties[fält.typ] : null;
  return {
    id: db.id,
    titel,
    url: db.url ?? null,
    harNamn: !!fält.titel,
    harStatus: !!fält.status,
    statusTyp: fält.status ? db.properties[fält.status].type : null,
    harTyp: !!fält.typ,
    harVideoTag: !!typDef && alternativ(typDef).includes(TYP_TAG.video),
    harBildTag: !!typDef && alternativ(typDef).includes(TYP_TAG.bild),
  };
}

async function allaDatabaser() {
  const ut = [];
  let cursor;
  do {
    const r = await notion('search', {
      method: 'POST',
      body: { filter: { value: 'database', property: 'object' }, page_size: 100, ...(cursor ? { start_cursor: cursor } : {}) },
    });
    ut.push(...(r.results ?? []));
    cursor = r.has_more ? r.next_cursor : null;
  } while (cursor);
  return ut;
}

// ------------------------------------------------------------------ skapande

async function sökDubblett(hubId, titelFält, namn) {
  const r = await notion(`databases/${hubId}/query`, {
    method: 'POST',
    body: { filter: { property: titelFält, title: { equals: namn } }, page_size: 100 },
  });
  return hittaDubblett(r.results, namn);
}

/** Skapar EN rad: dubblettkoll → POST pages (första 100 block) → PATCH resten
 *  → läs tillbaka. Returnerar {namn, page_id, url, skapad, fel, finnsRedan}. */
export async function skapaRad(hubId, schema, rad, { torr = false, logg = console.log } = {}) {
  const ut = { namn: rad.namn, page_id: null, url: null, skapad: false, fel: null };
  try {
    if (!existsSync(rad.brief)) throw new Error(`Brief-filen finns inte: ${rad.brief}`);
    const markdown = readFileSync(rad.brief, 'utf8');
    const block = tillBlock(markdown);
    if (!block.length) throw new Error(`Briefen är tom: ${rad.brief}`);
    const omgångar = delaBlock(block);
    // Svensk dag, inte UTC — 00:30 svensk tid är fortfarande gårdagen i UTC
    // (DryTrek 2026-09-12: "Skapad" stod på fel datum).
    const datum = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Stockholm', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
    const { properties, fel, varningar, fält } = byggEgenskaper(schema, {
      namn: rad.namn, typ: rad.typ, status: rad.status ?? 'Draft',
      landning: rad.landning ?? landningUrBrief(markdown), datum,
    });
    for (const v of varningar) logg(`  ⚠️ ${v}`);
    if (fel.length) throw new Error(fel.join(' '));

    const hubRen = String(hubId).replace(/-/g, '');
    const dubblett = fält.titel ? await sökDubblett(hubRen, fält.titel, rad.namn).catch((e) => {
      if (e.saknarToken && torr) return null;   // torr utan token: ingen dubblettkoll
      throw e;
    }) : null;
    if (dubblett) {
      ut.finnsRedan = true;
      ut.page_id = dubblett.id;
      ut.url = dubblett.url;
      logg(`  ↷ ${rad.namn}: finns redan — hoppar över (${dubblett.url ?? dubblett.id})`);
      return ut;
    }

    const beskrivning = `${block.length} block i ${omgångar.length} anrop · ${TYP_TAG[rad.typ]} · ${rad.status ?? 'Draft'}`;
    if (torr) {
      logg(`  ○ ${rad.namn}: skulle skapas — ${beskrivning}`);
      logg(`    properties: ${JSON.stringify(properties)}`);
      logg(`    block: ${block.slice(0, 6).map((b) => b.type).join(', ')}${block.length > 6 ? ', …' : ''}`);
      ut.torr = true;
      ut.block = block.length;
      ut.anrop = omgångar.length;
      return ut;
    }

    const sida = await notion('pages', {
      method: 'POST',
      body: { parent: { database_id: hubRen }, properties, children: omgångar[0] },
    });
    ut.page_id = sida.id;
    for (let i = 1; i < omgångar.length; i++) {
      await notion(`blocks/${sida.id.replace(/-/g, '')}/children`, { method: 'PATCH', body: { children: omgångar[i] } });
    }
    // Läs tillbaka — ett POST som svarar 200 men inte skrev det man tror har hänt förr.
    const efter = await notion(`pages/${sida.id.replace(/-/g, '')}`);
    const titel = Object.values(efter.properties ?? {}).find((p) => p.type === 'title');
    const namnTillbaka = (titel?.title ?? []).map((t) => t.plain_text).join('');
    ut.url = efter.url ?? null;
    ut.skapad = true;
    if (namnTillbaka !== rad.namn) ut.varning = `Namnet lästes tillbaka som "${namnTillbaka}".`;
    logg(`  ✅ ${namnTillbaka || rad.namn} — ${ut.url} (${beskrivning})`);
    return ut;
  } catch (e) {
    ut.fel = e.status === 404
      ? `${e.message} — integrationen är troligen inte inbjuden till hubben (••• → Connections).`
      : e.message;
    logg(`  ❌ ${rad.namn}: ${ut.fel}`);
    return ut;
  }
}

// ------------------------------------------------------------------ CLI

async function main() {
  const args = process.argv.slice(2);
  const flagga = (n, s = null) => {
    const i = args.indexOf(`--${n}`);
    return i !== -1 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : s;
  };
  const finns = (n) => args.includes(`--${n}`);
  const json = finns('json');
  const torr = finns('torr');
  const logg = (...a) => (json ? console.error : console.log)(...a);
  const dö = (m) => { console.error(`✗ ${m}`); process.exit(1); };

  if (finns('hubbar')) {
    const dbs = await allaDatabaser();
    const lista = dbs.map(beskrivHub);
    if (json) { console.log(JSON.stringify(lista, null, 2)); return; }
    console.log(`${lista.length} databas(er) synliga för token:\n`);
    for (const h of lista) {
      const ok = h.harNamn && h.harStatus && h.harTyp;
      console.log(`  ${ok ? '✓' : '·'} ${h.titel || '(utan titel)'}`);
      console.log(`      id: ${h.id}`);
      console.log(`      Namn: ${h.harNamn ? 'ja' : 'NEJ'} · Status: ${h.harStatus ? h.statusTyp : 'NEJ'} · Typ: ${h.harTyp ? 'ja' : 'NEJ'} · Video-tag: ${h.harVideoTag ? 'ja' : 'nej'} · Bild-tag: ${h.harBildTag ? 'ja' : 'nej'}`);
    }
    console.log('\n✓ = har Namn, Status och Typ (kan ta emot briefer).');
    return;
  }

  const hub = flagga('hub');
  if (!hub) dö('Ange --hub <database_id> (hitta rätt med --hubbar), eller --hubbar.');

  let rader;
  const manifest = flagga('manifest');
  if (manifest) {
    if (!existsSync(manifest)) dö(`Manifestet finns inte: ${manifest}`);
    try { rader = lasManifest(readFileSync(manifest, 'utf8'), dirname(resolve(manifest))); }
    catch (e) { dö(e.message); }
  } else {
    const namn = flagga('namn');
    const typ = String(flagga('typ') ?? '').toLowerCase().replace(/^image$/, 'bild');
    const brief = flagga('brief');
    if (!namn || !typ || !brief) dö('Ange --namn <annonsnamn> --typ video|bild --brief <fil.md> (eller --manifest <fil.json>).');
    if (!TYP_TAG[typ]) dö(`--typ ska vara video eller bild, inte "${typ}".`);
    rader = [{ namn: namn.trim(), typ, brief: resolve(brief) }];
  }
  const status = flagga('status');
  if (status) for (const r of rader) r.status = r.status ?? status;

  // Schemat läses ALLTID ur databasen — aldrig antaget. Undantag: --torr utan
  // token visar blocken mot ett antaget standardschema och säger det.
  let schema;
  let hubTitel = hub;
  try {
    const db = await notion(`databases/${hub.replace(/-/g, '')}`);
    schema = db.properties ?? {};
    hubTitel = (db.title ?? []).map((t) => t.plain_text).join('') || hub;
  } catch (e) {
    if (e.saknarToken && torr) {
      logg('⚠️ NOTION_TOKEN saknas — --torr visar planen mot ett ANTAGET schema (Namn/Status[status]/Typ[select]).');
      schema = {
        Namn: { type: 'title', title: {} },
        Status: { type: 'status', status: { options: [{ name: 'Draft' }] } },
        Typ: { type: 'select', select: { options: Object.values(TYP_TAG).map((name) => ({ name })) } },
      };
    } else {
      dö(e.status === 404
        ? `${e.message} — integrationen är inte inbjuden till hubben ${hub} (••• → Connections), eller id:t är fel.`
        : e.message);
    }
  }

  logg(`Hub: ${hubTitel}${torr ? '  (--torr: inget skrivs)' : ''}`);
  logg(`${rader.length} brief(er):\n`);
  const resultat = [];
  for (const r of rader) resultat.push(await skapaRad(hub, schema, r, { torr, logg }));

  const skapade = resultat.filter((r) => r.skapad).length;
  const hoppade = resultat.filter((r) => r.finnsRedan).length;
  const fel = resultat.filter((r) => r.fel).length;
  logg(`\n${torr ? 'Skulle skapa' : 'Skapade'}: ${torr ? resultat.filter((r) => r.torr).length : skapade} · finns redan: ${hoppade} · fel: ${fel}`);
  if (json) console.log(JSON.stringify(resultat, null, 2));
  process.exit(fel ? 1 : 0);
}

if (process.argv[1] && process.argv[1].endsWith('notion-brief.mjs')) {
  main().catch((e) => { console.error(`✗ ${e.message}`); process.exit(1); });
}
