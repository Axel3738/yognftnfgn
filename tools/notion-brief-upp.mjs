#!/usr/bin/env node
// notion-brief-upp.mjs — lyfter EN brief.md till en creative hub som Notion-rad
// via REST (`NOTION_TOKEN`), utan Notion-MCP.
//
//   node tools/notion-brief-upp.mjs <brief.md> --hub <database-id> [--typ video|bild] [--idag YYYY-MM-DD] [--ersatt] [--torr]
//
//   --ersatt: raden finns redan (samma Namn) — byt ut kroppen, behåll raden
//   (id, Status, Ansvarig, kommentarer). För en brief som skrivits om.
//
// Formen är NOTION-FORMAT.md och rutinens egna rader (mätt 2026-09-22 på
// Takoverdrag_OB_3_H1 i hubben 7ec270ab…): egenskaperna Namn (title),
// Status `Draft`, Typ `Video - Pending Approval` / `Image - Pending Approval`,
// Landing page, Skapad; kroppen som heading_2 / paragraph / table /
// bulleted_list_item i briefens ordning. **Hela briefen ligger i sidan** —
// aldrig en länk till en .md-fil (Axels besked 2026-09-02).
//
// Två spärrar innan något skrivs:
//   1. Namnet får inte redan finnas i hubben. Det är regel (b) från
//      2026-09-22, tillämpad vid uppladdning: en brief som redan finns i
//      Notion är utförd, och en rad till är en dubblett. (Samma dag fick en
//      brief namnet Takoverdrag_OB_2_H1 för att lediga nummer lästes ur
//      kontot men inte ur Notion — där var OB_2 redan taget av ett annat
//      koncept.)
//   2. Kroppen läses tillbaka efter skrivning och blocken räknas mot det som
//      skickades. Stämmer det inte skrivs det ut som FEL — sidan finns då men
//      är ofullständig, och det ska ingen rapport dölja.
//
// Ren logik (markdown → Notion-block) exporteras och testas i
// tools/test/notion-brief-upp.test.mjs. Inget nät i testerna.

import { readFileSync } from 'node:fs';
import { basename, dirname } from 'node:path';
import { pathToFileURL } from 'node:url';

const V = '2022-06-28';
export const TYP = Object.freeze({ video: 'Video - Pending Approval', bild: 'Image - Pending Approval' });
/** Notion tar högst 2 000 tecken per textobjekt och 100 block per anrop. */
export const MAX_TEXT = 2000;
export const MAX_BLOCK_PER_ANROP = 100;

/** Delar en sträng i bitar om högst MAX_TEXT, på ordgräns när det går. Ren. */
export function delaText(s, max = MAX_TEXT) {
  const t = String(s ?? '');
  if (t.length <= max) return [t];
  const ut = [];
  let rest = t;
  while (rest.length > max) {
    let k = rest.lastIndexOf(' ', max);
    if (k < max * 0.5) k = max;
    ut.push(rest.slice(0, k));
    rest = rest.slice(k).replace(/^\s+/, '');
  }
  if (rest) ut.push(rest);
  return ut;
}

/** Rich text ur en rad. `**fet**` blir bold; resten ren text. Ren. */
export function richText(s) {
  const ut = [];
  // **fet** → bold, `kod` → code (annonsnamn i briefar skrivs med backticks; utan
  // det här står de bokstavligt med backticks i Notion — mätt 2026-09-22).
  const delar = String(s ?? '').split(/(\*\*[^*]+\*\*|`[^`]+`)/g).filter(Boolean);
  for (const d of delar) {
    const fet = /^\*\*[^*]+\*\*$/.test(d);
    const kod = !fet && /^`[^`]+`$/.test(d);
    const txt = fet ? d.slice(2, -2) : kod ? d.slice(1, -1) : d;
    const annotations = fet ? { bold: true } : kod ? { code: true } : null;
    for (const bit of delaText(txt)) ut.push({ type: 'text', text: { content: bit }, ...(annotations ? { annotations } : {}) });
  }
  return ut.length ? ut : [{ type: 'text', text: { content: '' } }];
}

const cell = (s) => [{ type: 'text', text: { content: delaText(String(s ?? '').trim())[0] ?? '' } }];

/**
 * Markdown-briefen → { namn, landing, block[] }. Ren.
 *
 * `# Rubrik` överst = annonsnamnet (första ordet före " —" eller " –").
 * `## Rubrik` → heading_2. `| a | b |` i följd → table (separatorraden
 * `|---|` hoppas, första raden blir kolumnhuvud). `- punkt` →
 * bulleted_list_item. `> citat` → quote. Allt annat → paragraph, en per
 * stycke; blankrad avslutar stycket. `**Make:** …` behåller "Make:" som fet.
 */
/**
 * Nyckel–värde-rad: `Nyckel:` eller `**Nyckel:**` först på raden — 1–4 ord
 * (Make, Landing page, AI content, Price in the creative, First frame
 * (thumbnail), VARIABELTAGGAR), högst 30 tecken före kolonet. En prosarad
 * med kolon längre in ("Every line concedes the point: …") är ingen nyckel.
 */
export const NYCKELRAD = /^\**(?=.{1,30}:)[A-Za-zÅÄÖåäö][A-Za-zÅÄÖåäö0-9()/&–-]*(?: [A-Za-zÅÄÖåäö0-9()/&–-]+){0,3}:\**(?:\s|$)/;

export function mdTillBlock(md) {
  const rader = String(md ?? '').replace(/\r/g, '').split('\n');
  let namn = null;
  let landing = null;
  const block = [];
  let stycke = [];
  let tabell = [];
  const stangStycke = () => {
    if (!stycke.length) return;
    const text = stycke.join(' ').replace(/\s+/g, ' ').trim();
    stycke = [];
    if (!text) return;
    for (const bit of delaText(text)) block.push({ object: 'block', type: 'paragraph', paragraph: { rich_text: richText(bit) } });
  };
  const stangTabell = () => {
    if (!tabell.length) return;
    const rows = tabell.filter((r) => !/^\|?\s*:?-{3,}/.test(r));
    tabell = [];
    if (!rows.length) return;
    const celler = rows.map((r) => r.replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim()));
    const bredd = Math.max(...celler.map((c) => c.length));
    block.push({
      object: 'block', type: 'table',
      table: {
        table_width: bredd, has_column_header: true, has_row_header: false,
        children: celler.map((c) => ({ object: 'block', type: 'table_row', table_row: { cells: Array.from({ length: bredd }, (_, i) => cell(c[i] ?? '')) } })),
      },
    });
  };
  for (const rad of rader) {
    const s = rad.replace(/\s+$/, '');
    const m1 = s.match(/^#\s+(.+)$/);
    if (m1 && namn === null) { namn = m1[1].split(/\s+[—–-]\s+/)[0].trim(); continue; }
    // Var som helst på raden: batch-04-briefernas huvud har `**Drive folder:** … **Landing page:** URL`
    // på samma rad, och bildbriefer skriver `- **Landing page:** URL` (mätt 2026-09-22: 4 av 5 briefer missades av ett ^-ankrat uttryck).
    const lp = s.match(/\**\s*Landing page\s*:?\**\s*(https?:\/\/\S+)/i);
    if (lp && !landing) landing = lp[1].replace(/[),.]+$/, '');
    if (/^\|/.test(s)) { stangStycke(); tabell.push(s); continue; }
    if (tabell.length) stangTabell();
    const m2 = s.match(/^##\s+(.+)$/);
    if (m2) { stangStycke(); block.push({ object: 'block', type: 'heading_2', heading_2: { rich_text: richText(m2[1].trim()) } }); continue; }
    const m3 = s.match(/^[-*]\s+(.+)$/);
    if (m3) { stangStycke(); block.push({ object: 'block', type: 'bulleted_list_item', bulleted_list_item: { rich_text: richText(m3[1]) } }); continue; }
    const m4 = s.match(/^>\s?(.*)$/);
    if (m4) { stangStycke(); block.push({ object: 'block', type: 'quote', quote: { rich_text: richText(m4[1]) } }); continue; }
    if (!s.trim()) { stangStycke(); continue; }
    // En nyckel–värde-rad (`**Make:** …`, `Why: …`, `Landing page: …`,
    // `AI content: voice`, `VARIABELTAGGAR: …`) börjar alltid ett eget block,
    // även utan blankrad före. Spärren och AI-raden läser Notion-texten med
    // radstart-ankrade uttryck (`^\s*why:`), och slås raderna ihop till ett
    // stycke hittas de inte — mätt 2026-09-22 på Takoverdrag_OB_4_H1: filen
    // gav ✅, samma text läst ur Notion gav tre anmärkningar. En radbruten
    // prosarad utan nyckel fortsätter som förut i samma stycke.
    if (NYCKELRAD.test(s.trim())) stangStycke();
    stycke.push(s.trim());
  }
  stangStycke(); stangTabell();
  return { namn, landing, block };
}

/** Egenskaperna för raden. Ren. Bara fält som finns i hubbens schema (mätt 2026-09-22). */
export function egenskaper({ namn, typ = 'video', landing = null, idag = null }) {
  const p = {
    Namn: { title: [{ type: 'text', text: { content: namn } }] },
    Status: { status: { name: 'Draft' } },
    Typ: { select: { name: TYP[typ] ?? TYP.video } },
  };
  if (landing) p['Landing page'] = { rich_text: [{ type: 'text', text: { content: landing } }] };
  if (idag) p.Skapad = { date: { start: idag } };
  return p;
}

/** Räknar block per typ, med tabellrader — för tillbakaläsningen. Ren. */
export function raknaBlock(block) {
  const n = {};
  for (const b of block) {
    n[b.type] = (n[b.type] ?? 0) + 1;
    if (b.type === 'table') n.table_row = (n.table_row ?? 0) + (b.table?.children?.length ?? 0);
  }
  return n;
}

// ------------------------------------------------------------------ nät

async function notion(path, { method = 'GET', body = null, token } = {}) {
  const r = await fetch(`https://api.notion.com/v1/${path}`, {
    method,
    headers: { authorization: `Bearer ${token}`, 'notion-version': V, 'content-type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const j = await r.json();
  if (j.object === 'error') throw new Error(`Notion ${method} ${path}: ${j.message}`);
  return j;
}

async function finnsRedan(hub, namn, token) {
  const j = await notion(`databases/${hub}/query`, { method: 'POST', token, body: { filter: { property: 'Namn', title: { equals: namn } }, page_size: 5 } });
  return (j.results ?? []).map((p) => p.id.replace(/-/g, ''));
}

async function allaBarn(pageId, token) {
  const alla = [];
  let cursor = null;
  do {
    const j = await notion(`blocks/${pageId}/children?page_size=100${cursor ? `&start_cursor=${cursor}` : ''}`, { token });
    alla.push(...(j.results ?? []));
    cursor = j.has_more ? j.next_cursor : null;
  } while (cursor);
  return alla;
}

async function lasTillbaka(pageId, token) {
  const alla = await allaBarn(pageId, token);
  const n = {};
  for (const b of alla) {
    n[b.type] = (n[b.type] ?? 0) + 1;
    if (b.type === 'table') {
      const k = await notion(`blocks/${b.id}/children?page_size=100`, { token });
      n.table_row = (n.table_row ?? 0) + (k.results ?? []).length;
    }
  }
  return n;
}

async function huvud() {
  const args = process.argv.slice(2);
  const fil = args.find((a) => !a.startsWith('--') && a.endsWith('.md'));
  const flagga = (n, s = null) => { const i = args.indexOf(`--${n}`); return i !== -1 && args[i + 1] !== undefined && !args[i + 1].startsWith('--') ? args[i + 1] : s; };
  const torr = args.includes('--torr');
  const ersatt = args.includes('--ersatt');
  const hub = String(flagga('hub', '')).replace(/-/g, '');
  const typ = flagga('typ', 'video');
  const idag = flagga('idag') ?? new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Stockholm' }).format(new Date());
  const token = process.env.NOTION_TOKEN;
  if (!fil || !hub) { console.error('Användning: node tools/notion-brief-upp.mjs <brief.md> --hub <database-id> [--typ video|bild] [--idag YYYY-MM-DD] [--ersatt] [--torr]'); process.exit(1); }
  if (!TYP[typ]) { console.error(`✗ --typ måste vara video eller bild, fick "${typ}"`); process.exit(1); }
  if (!token && !torr) { console.error('✗ NOTION_TOKEN saknas i miljön.'); process.exit(1); }

  const md = readFileSync(fil, 'utf8');
  const { namn, landing, block } = mdTillBlock(md);
  const namnet = namn ?? basename(dirname(fil));
  const n = raknaBlock(block);
  console.log(`Rad: ${namnet} · Typ: ${TYP[typ]} · Status: Draft · Skapad: ${idag}`);
  console.log(`Landing page: ${landing ?? '(saknas i briefen)'}`);
  console.log(`Kropp: ${block.length} block — ${Object.entries(n).map(([k, v]) => `${k} ${v}`).join(', ')}`);
  if (!block.some((b) => b.type === 'table')) console.log('⚠ ingen tabell i kroppen — en videobrief utan Swedish/English-tabell är inte komplett');

  if (torr) {
    // Läs-bara dubblettkoll även torrt, så --torr --ersatt visar vilken rad som träffas.
    if (token) {
      const d = await finnsRedan(hub, namnet, token);
      console.log(d.length ? `Finns redan i hubben: ${d.join(', ')} — ${ersatt ? 'skulle ersättas' : 'skulle vägras (exit 2) utan --ersatt'}` : 'Finns inte i hubben — skulle skapas.');
    }
    console.log('\n--torr: inget skrivet.'); return;
  }

  const dubbletter = await finnsRedan(hub, namnet, token);
  let pageId;
  if (dubbletter.length && !ersatt) {
    console.error(`\n✗ ${namnet} finns redan i hubben (${dubbletter.join(', ')}). En rad till är en dubblett — lärdomen är redan utförd. Inget skrivet. (--ersatt byter ut kroppen på den rad som finns.)`);
    process.exit(2);
  }
  if (dubbletter.length > 1) {
    console.error(`\n✗ ${namnet} finns ${dubbletter.length} gånger i hubben (${dubbletter.join(', ')}) — --ersatt vet inte vilken. Inget skrivet.`);
    process.exit(2);
  }

  if (dubbletter.length) {
    // --ersatt: samma rad (id, status, Ansvarig, kommentarer kvar), ny kropp.
    // Gamla blocken arkiveras ett i taget — Notion har ingen "töm sidan".
    pageId = dubbletter[0];
    const gamla = await allaBarn(pageId, token);
    for (const b of gamla) await notion(`blocks/${b.id}`, { method: 'DELETE', token });
    if (landing) await notion(`pages/${pageId}`, { method: 'PATCH', token, body: { properties: { 'Landing page': { rich_text: [{ type: 'text', text: { content: landing } }] } } } });
    for (let i = 0; i < block.length; i += MAX_BLOCK_PER_ANROP) {
      await notion(`blocks/${pageId}/children`, { method: 'PATCH', token, body: { children: block.slice(i, i + MAX_BLOCK_PER_ANROP) } });
    }
    console.log(`\n✓ Ersatt: ${pageId}  https://www.notion.so/${pageId} — ${gamla.length} gamla block arkiverade, ${block.length} nya. Status, Ansvarig och kommentarer orörda.`);
  } else {
    const forsta = block.slice(0, MAX_BLOCK_PER_ANROP);
    const rest = block.slice(MAX_BLOCK_PER_ANROP);
    const sida = await notion('pages', { method: 'POST', token, body: { parent: { database_id: hub }, properties: egenskaper({ namn: namnet, typ, landing, idag }), children: forsta } });
    pageId = sida.id.replace(/-/g, '');
    for (let i = 0; i < rest.length; i += MAX_BLOCK_PER_ANROP) {
      await notion(`blocks/${pageId}/children`, { method: 'PATCH', token, body: { children: rest.slice(i, i + MAX_BLOCK_PER_ANROP) } });
    }
    console.log(`\n✓ Skapad: ${pageId}  https://www.notion.so/${pageId}`);
  }

  const tillbaka = await lasTillbaka(pageId, token);
  const skillnad = Object.keys({ ...n, ...tillbaka }).filter((k) => (n[k] ?? 0) !== (tillbaka[k] ?? 0));
  if (skillnad.length) {
    console.error(`✗ FEL i tillbakaläsningen — sidan finns men är ofullständig. Skickat: ${JSON.stringify(n)} · Läst: ${JSON.stringify(tillbaka)} · skiljer: ${skillnad.join(', ')}`);
    process.exit(3);
  }
  console.log(`✓ Tillbakaläst: ${Object.entries(tillbaka).map(([k, v]) => `${k} ${v}`).join(', ')} — stämmer.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  huvud().catch((e) => { console.error(`✗ ${e.message}`); process.exit(1); });
}
