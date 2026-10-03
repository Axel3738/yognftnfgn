#!/usr/bin/env node
// Lägger en SOP-markdown som en egen Notion-sida under Growth Guide-sidan, så att
// Axel kan ge Bruce en länk i stället för en fil (beställning 2026-10-03: två guider,
// "3:2:2" och "så använder du Growth Guide", som länkar). Markdownen i repot är
// källan; Notion-sidan är visningen och skrivs om från filen varje körning.
//
//   node matstrumpor/sop/notion.mjs <fil.md>              # torrt: blocken + vad som skulle hända
//   node matstrumpor/sop/notion.mjs <fil.md> --skarpt     # skapa, eller ersätt innehållet i sidan med samma titel
//   node matstrumpor/sop/notion.mjs <fil.md> --skarpt --ikon 🧪   # ikon på en NY sida (standard 📘)
//
// Samma lilla markdown som bygg.mjs (PDF:en): rubriker, listor, fetstil, `kod`,
// citat, stycken, ---. Dessutom länkar: [text](https://…) och nakna https://-adresser.
// Första H1 blir sidans titel, inte ett block; ## blir heading_2, ### och #### heading_3.
//
// Återanvänder: finns redan en barnsida (child_page) med samma titel under
// Growth Guide-sidan arkiveras dess block och de nya läggs in (ingen dubblett).
// Två sidor med samma titel: stopp, inget rörs. Inget annat på Growth Guide-
// sidan rörs: inga databaser, inga rader, inga andra block.
//
// Kräver NOTION_TOKEN. Sidans id läses ur matstrumpor/growthguide.json → sida_id.
// Notion-klienten är samma mönster som growthguide.mjs notion() (kopierat, inte
// importerat: den modulen kör sin main vid import av en annan väg). Skillnaden:
// ett anrop som SKAPAR något görs aldrig om på 5xx; en omkörning av skriptet är
// i stället säker, för sidan hittas på titeln och innehållet ersätts.
import { readFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';

const HAR = dirname(fileURLToPath(import.meta.url));
const GG_FIL = join(HAR, '..', 'growthguide.json');
const NOTION = 'https://api.notion.com/v1';
const VERSION = '2022-06-28';
const MAX_TECKEN = 1900; // Notion tar 2 000 tecken per rich_text; marginal för emoji (två UTF-16-enheter)
const MAX_BLOCK_PER_ANROP = 100;

// ---------------------------------------------------------------- markdown → block (ren)

const LANK = String.raw`https?:\/\/[^\s<>()]*[^\s<>().,;:!?"']`;
const INLINE = new RegExp(String.raw`\*\*(.+?)\*\*|` + '`([^`]+)`' + String.raw`|\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)|(` + LANK + ')', 'g');

/** En textbit, delad i bitar om högst MAX_TECKEN kodpunkter. */
function bitar(text, ann, url) {
  const tecken = Array.from(text);
  const ut = [];
  for (let i = 0; i < tecken.length; i += MAX_TECKEN) {
    const del = tecken.slice(i, i + MAX_TECKEN).join('');
    const r = { type: 'text', text: { content: del, ...(url ? { link: { url } } : {}) } };
    if (ann && Object.keys(ann).length) r.annotations = { ...ann };
    ut.push(r);
  }
  return ut;
}

/** Inline-markdown → Notions rich_text: **fet**, `kod`, [text](url), nakna länkar. Ren. */
export function richText(s, ann = {}) {
  const ut = [];
  let i = 0;
  const re = new RegExp(INLINE.source, 'g');
  let m;
  while ((m = re.exec(s))) {
    if (m.index > i) ut.push(...bitar(s.slice(i, m.index), ann));
    if (m[1] !== undefined) ut.push(...richText(m[1], { ...ann, bold: true }));
    else if (m[2] !== undefined) ut.push(...bitar(m[2], { ...ann, code: true }));
    else if (m[3] !== undefined) ut.push(...bitar(m[3], ann, m[4]));
    else ut.push(...bitar(m[5], ann, m[5]));
    i = re.lastIndex;
  }
  if (i < s.length) ut.push(...bitar(s.slice(i), ann));
  return ut;
}

const textBlock = (typ, text) => ({ object: 'block', type: typ, [typ]: { rich_text: richText(text) } });

/** Markdown (det lilla bygg.mjs klarar, plus länkar) → { titel, block }. Ren. */
export function tillBlock(md) {
  const rader = md.replace(/\r/g, '').split('\n');
  const block = [];
  let titel = null;
  let stycke = [];
  const stangStycke = () => { if (stycke.length) { block.push(textBlock('paragraph', stycke.join('\n'))); stycke = []; } };
  for (const rad of rader) {
    const h = rad.match(/^(#{1,4})\s+(.*)$/);
    if (h) {
      stangStycke();
      if (h[1].length === 1 && titel === null) { titel = h[2].trim(); continue; }
      block.push(textBlock(`heading_${Math.min(h[1].length, 3)}`, h[2].trim()));
      continue;
    }
    const li = rad.match(/^\s*(?:[-*]|(\d+)[.)])\s+(.*)$/);
    if (li) { stangStycke(); block.push(textBlock(li[1] ? 'numbered_list_item' : 'bulleted_list_item', li[2].trim())); continue; }
    if (/^\s*>\s?/.test(rad)) { stangStycke(); block.push(textBlock('quote', rad.replace(/^\s*>\s?/, '').trim())); continue; }
    if (/^\s*---+\s*$/.test(rad)) { stangStycke(); block.push({ object: 'block', type: 'divider', divider: {} }); continue; }
    if (!rad.trim()) { stangStycke(); continue; }
    stycke.push(rad.trim());
  }
  stangStycke();
  return { titel, block };
}

/** Blockets text som Notion läser tillbaka den (plain_text), eller vår egen. Ren. */
export function blockText(b) {
  const rt = b?.[b.type]?.rich_text ?? [];
  return rt.map((t) => t.plain_text ?? t.text?.content ?? '').join('');
}

const kort = (s, n = 90) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);
const sidUrl = (id) => `https://www.notion.so/${String(id).replace(/-/g, '')}`;

// ---------------------------------------------------------------- Notion I/O

const sov = (ms) => new Promise((k) => setTimeout(k, ms));

async function notion(path, { method = 'GET', body, skapar = false } = {}) {
  const tok = process.env.NOTION_TOKEN;
  if (!tok) throw new Error('NOTION_TOKEN saknas i miljön');
  for (let forsok = 0; forsok < 6; forsok++) {
    const r = await fetch(`${NOTION}${path}`, { method, headers: { Authorization: `Bearer ${tok}`, 'Notion-Version': VERSION, 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
    if (r.status === 429) { await sov(1500 * (forsok + 1)); continue; }
    if (r.status >= 500) {
      if (skapar) throw new Error(`Notion ${r.status} ${method} ${path}: inte omgjort (kan ha skapats). Kör skriptet igen, sidan hittas på titeln och innehållet ersätts.`);
      await sov(1500 * (forsok + 1));
      continue;
    }
    const j = await r.json();
    if (!r.ok) throw new Error(`Notion ${r.status} ${method} ${path}: ${j.message || JSON.stringify(j).slice(0, 300)}`);
    return j;
  }
  throw new Error(`Notion svarade inte på sex försök: ${path}`);
}

async function barn(id) {
  const ut = [];
  let cursor;
  do {
    const q = await notion(`/blocks/${id}/children?page_size=100${cursor ? `&start_cursor=${cursor}` : ''}`);
    ut.push(...(q.results ?? []));
    cursor = q.has_more ? q.next_cursor : undefined;
  } while (cursor);
  return ut;
}

async function laggTill(sidId, block) {
  for (let i = 0; i < block.length; i += MAX_BLOCK_PER_ANROP) {
    await notion(`/blocks/${sidId}/children`, { method: 'PATCH', skapar: true, body: { children: block.slice(i, i + MAX_BLOCK_PER_ANROP) } });
  }
}

// ---------------------------------------------------------------- main

async function main() {
  const arg = process.argv.slice(2);
  const fil = arg.find((a, i) => !a.startsWith('--') && arg[i - 1] !== '--ikon');
  const skarpt = arg.includes('--skarpt');
  const ikon = arg.includes('--ikon') ? arg[arg.indexOf('--ikon') + 1] : '📘';
  if (!fil) { console.error('Användning: node matstrumpor/sop/notion.mjs <fil.md> [--skarpt] [--ikon 🧪]'); process.exit(2); }

  const { titel, block } = tillBlock(readFileSync(fil, 'utf8'));
  if (!titel) { console.error(`${fil}: ingen H1 (# rubrik), den blir sidans titel.`); process.exit(2); }
  const sidaId = JSON.parse(readFileSync(GG_FIL, 'utf8')).sida_id;
  if (!sidaId) { console.error(`${GG_FIL}: sida_id saknas.`); process.exit(2); }

  console.log(`Titel: ${titel}`);
  console.log(`Förälder: Growth Guide ${sidUrl(sidaId)}`);
  console.log(`Block: ${block.length}`);
  for (const b of block) console.log(`  ${b.type.padEnd(20)} ${kort(blockText(b).replace(/\n/g, ' ⏎ '))}`);

  if (!process.env.NOTION_TOKEN) {
    console.error('NOTION_TOKEN saknas: kan inte läsa vad som redan finns under Growth Guide.');
    process.exit(skarpt ? 1 : 0);
  }

  const samma = (await barn(sidaId)).filter((b) => b.type === 'child_page' && b.child_page?.title === titel);
  if (samma.length > 1) {
    console.error(`Stopp: ${samma.length} sidor heter "${titel}" under Growth Guide (${samma.map((b) => sidUrl(b.id)).join(', ')}). Rör inget. Ta bort dubbletten för hand först.`);
    process.exit(1);
  }
  const finns = samma[0] ?? null;

  if (!skarpt) {
    if (finns) {
      const gamla = await barn(finns.id);
      console.log(`\nTORRT. Skulle ERSÄTTA innehållet i ${sidUrl(finns.id)}: arkivera ${gamla.length} block, lägga in ${block.length}.`);
    } else {
      console.log(`\nTORRT. Skulle SKAPA en ny sida "${titel}" ${ikon} under Growth Guide med ${block.length} block.`);
    }
    console.log('Kör med --skarpt för att skriva.');
    return;
  }

  let sidId;
  if (finns) {
    sidId = finns.id;
    const gamla = await barn(sidId);
    for (const g of gamla) await notion(`/blocks/${g.id}`, { method: 'PATCH', body: { archived: true } });
    console.log(`Arkiverade ${gamla.length} gamla block i ${sidUrl(sidId)}.`);
    await laggTill(sidId, block);
  } else {
    const ny = await notion('/pages', {
      method: 'POST',
      skapar: true,
      body: {
        parent: { page_id: sidaId },
        icon: { type: 'emoji', emoji: ikon },
        properties: { title: { title: [{ type: 'text', text: { content: titel } }] } },
        children: block.slice(0, MAX_BLOCK_PER_ANROP),
      },
    });
    sidId = ny.id;
    console.log(`Skapade sidan ${sidUrl(sidId)}.`);
    await laggTill(sidId, block.slice(MAX_BLOCK_PER_ANROP));
  }

  // Tillbakaläsning: samma antal block, samma typ och samma text i samma ordning.
  const tillbaka = (await barn(sidId)).filter((b) => !b.archived);
  const fel = [];
  if (tillbaka.length !== block.length) fel.push(`antal block: skickade ${block.length}, läste ${tillbaka.length}`);
  for (let i = 0; i < Math.min(tillbaka.length, block.length); i++) {
    const a = block[i], b = tillbaka[i];
    if (a.type !== b.type) fel.push(`block ${i + 1}: typ ${a.type} ≠ ${b.type}`);
    else if (blockText(a) !== blockText(b)) fel.push(`block ${i + 1}: texten skiljer ("${kort(blockText(b), 60)}")`);
  }
  if (fel.length) {
    console.error(`FEL vid tillbakaläsningen av ${sidUrl(sidId)}:\n  ${fel.join('\n  ')}`);
    process.exit(1);
  }
  console.log(`Tillbakaläst: ${tillbaka.length} av ${block.length} block, typ och text lika.`);
  console.log(`URL: ${sidUrl(sidId)}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => { console.error(e.message || e); process.exit(1); });
}
