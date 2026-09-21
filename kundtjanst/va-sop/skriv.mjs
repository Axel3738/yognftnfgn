// Skriver VA-SOP:arna i den här mappen till Notion-basen i notion.json.
//
//   node kundtjanst/va-sop/skriv.mjs --torr          visa vad som skulle hända
//   node kundtjanst/va-sop/skriv.mjs                 skarpt
//   node kundtjanst/va-sop/skriv.mjs --bara <fil>    en sida
//
// Varför filerna ligger i repot och inte bara i Notion: Notion har ingen
// historik som går att läsa i en diff, och basen ska kunna dupliceras till
// fyra brands inför Q4. Filen är källan, Notion är visningen.
//
// ⚠️ En omskriven sida får sin BRODTEXT ersatt. Bilagor (Filer och media) är
// en egenskap på raden, inte block, och rörs aldrig. Skriptet vägrar radera
// en kropp som innehåller något annat än de tomma mallrubrikerna om inte
// --ersatt-allt anges — annars kan någons riktiga arbete försvinna tyst.
//
// En sida i notion.json pekar antingen på en fil i den här mappen (`fil`)
// eller på tvisthandboken i kundtjanst/sop/ (`kalla`). Källan fylls då med
// butikens värden ur brandfilen (`fyll.mjs`) och filnamnen i texten byts mot
// Notion-sidornas titlar — handboken förblir portabel i repot, VA:n läser den
// färdigifylld i Notion.
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fyll, brandFor } from '../sop/fyll.mjs';

const HÄR = dirname(fileURLToPath(import.meta.url));
const KONF = JSON.parse(readFileSync(join(HÄR, 'notion.json'), 'utf8'));
const API = 'https://api.notion.com/v1';
const sov = (ms) => new Promise((r) => setTimeout(r, ms));

const H = () => {
  const t = process.env.NOTION_TOKEN;
  if (!t) throw new Error('NOTION_TOKEN saknas i miljön.');
  return { Authorization: `Bearer ${t}`, 'Notion-Version': '2022-06-28', 'Content-Type': 'application/json' };
};

export async function api(väg, kropp, metod = 'POST') {
  for (let i = 0; i < 6; i++) {
    const r = await fetch(`${API}/${väg}`, { method: metod, headers: H(), body: kropp ? JSON.stringify(kropp) : undefined });
    if (r.status === 429 || r.status >= 500) { await sov(1500 * (i + 1)); continue; }
    const j = await r.json();
    if (!r.ok) throw new Error(`${r.status} ${j.code}: ${j.message}`);
    return j;
  }
  throw new Error('Notion svarade inte efter sex försök: ' + väg);
}

/** **fet** → bold, rena URL:er → länkar. Notion tar max 2000 tecken per textbit. */
export function richText(s) {
  const ut = []; const re = /\*\*(.+?)\*\*|(https?:\/\/[^\s)|>]+)/g; let sist = 0; let m;
  const lägg = (text, extra = {}) => {
    for (let i = 0; i < text.length; i += 1900) {
      ut.push({ type: 'text',
        text: { content: text.slice(i, i + 1900), ...(extra.link ? { link: { url: extra.link } } : {}) },
        ...(extra.bold ? { annotations: { bold: true } } : {}) });
    }
  };
  while ((m = re.exec(s))) {
    if (m.index > sist) lägg(s.slice(sist, m.index));
    if (m[1]) lägg(m[1], { bold: true }); else lägg(m[2], { link: m[2] });
    sist = re.lastIndex;
  }
  if (sist < s.length) lägg(s.slice(sist));
  return ut.length ? ut : [{ type: 'text', text: { content: '' } }];
}

/** Rå text utan **fet** eller länkar — kodblock ska visa tecknen som de står. */
export function rentText(s) {
  const ut = [];
  for (let i = 0; i < Math.max(s.length, 1); i += 1900) ut.push({ type: 'text', text: { content: s.slice(i, i + 1900) } });
  return ut;
}

const blk = (typ, text, extra = {}) => ({ object: 'block', type: typ, [typ]: { rich_text: richText(text), ...extra } });

/** Markdown (den delmängd SOP:arna använder) → Notion-block. Ren funktion. */
export function tillBlock(md) {
  const rader = md.replace(/\r/g, '').split('\n');
  const ut = []; let i = 0;
  const ärTabell = (r) => /^\s*\|.*\|\s*$/.test(r);
  while (i < rader.length) {
    const r = rader[i];
    if (!r.trim()) { i++; continue; }
    let m;
    if ((m = /^(#{1,3})\s+(.*)$/.exec(r))) { ut.push(blk(`heading_${m[1].length}`, m[2].trim())); i++; continue; }
    if (/^---+$/.test(r.trim())) { ut.push({ object: 'block', type: 'divider', divider: {} }); i++; continue; }
    // ``` … ``` — mejlmallarna i tvisthandboken ÄR kodblock. Utan det här
    // klappar varje mall ihop till ett stycke och går inte att kopiera.
    if (/^```/.test(r.trim())) {
      i++; const rad = [];
      while (i < rader.length && !/^```/.test(rader[i].trim())) { rad.push(rader[i]); i++; }
      i++; // stängande ```
      ut.push({ object: 'block', type: 'code',
        code: { rich_text: rentText(rad.join('\n')), language: 'plain text' } });
      continue;
    }
    if (/^>\s?/.test(r)) {
      let t = r.replace(/^>\s?/, ''); i++;
      while (i < rader.length && /^>\s?/.test(rader[i])) { t += ' ' + rader[i].replace(/^>\s?/, ''); i++; }
      ut.push(blk('callout', t, { icon: { type: 'emoji', emoji: '⚠️' } })); continue;
    }
    if (ärTabell(r)) {
      const tab = []; while (i < rader.length && ärTabell(rader[i])) { tab.push(rader[i]); i++; }
      const celler = tab.filter((x) => !/^\s*\|\s*:?-{2,}/.test(x))
        .map((x) => x.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim()));
      const bredd = Math.max(...celler.map((c) => c.length));
      ut.push({ object: 'block', type: 'table',
        table: { table_width: bredd, has_column_header: true, has_row_header: false,
          children: celler.map((c) => ({ object: 'block', type: 'table_row',
            table_row: { cells: Array.from({ length: bredd }, (_, k) => richText(c[k] ?? '')) } })) } });
      continue;
    }
    if ((m = /^(\s*)([-*]|\d+[.)])\s+(.*)$/.exec(r))) {
      const typ = /^\d/.test(m[2]) ? 'numbered_list_item' : 'bulleted_list_item';
      const djup = m[1].length >= 2 ? 1 : 0;
      const b = blk(typ, m[3].trim()); i++;
      while (i < rader.length && rader[i].trim() && !/^(\s*)([-*]|\d+[.)])\s+/.test(rader[i])
             && /^\s{2,}/.test(rader[i]) && !ärTabell(rader[i])) {
        b[typ].rich_text.push(...richText(' ' + rader[i].trim())); i++;
      }
      if (djup === 1 && ut.length && /list_item$/.test(ut[ut.length - 1].type)) {
        const f = ut[ut.length - 1]; (f[f.type].children ??= []).push(b);
      } else ut.push(b);
      continue;
    }
    let t = r.trim(); i++;
    while (i < rader.length && rader[i].trim()
           && !/^(#{1,3}\s|>|\s*[-*]\s|\s*\d+[.)]\s|---)/.test(rader[i]) && !ärTabell(rader[i])) {
      t += ' ' + rader[i].trim(); i++;
    }
    ut.push(blk('paragraph', t));
  }
  return ut;
}

/** Text i ett block, så vi kan se om kroppen bara är tom mall. */
function text(b) {
  const d = b[b.type];
  return (d?.rich_text ?? []).map((x) => x.plain_text ?? x.text?.content ?? '').join('').trim();
}

/**
 * Mallrubrikerna sidorna föddes med. En kropp som bara bär dem är tom.
 * Mätt 2026-09-21 på hela basen: varje SOP-rad har exakt Notions svenska
 * standardmall i kroppen — Bakgrund / Analys / Rekommendationer /
 * Implementering med sin förklaringsrad under — och hela SOP:en som PDF i
 * egenskapen `Filer och media`. Kroppen är alltså tom på riktigt innehåll,
 * och bilagan är en egenskap som block-anropen inte rör.
 */
const MALLORD = [/^overview$/i, /^step[- ]by[- ]step/i, /^escalation$/i, /^reply templates?$/i,
  /^ai prompt template$/i, /^trigger$/i, /^owner approval$/i, /^$/,
  /^bakgrund$/i, /^analys$/i, /^rekommendationer$/i, /^implementering$/i,
  /^dokumentets sammanhang, mål och omfattning$/i,
  /^forskningsresultat, datainsikter och viktiga överväganden$/i,
  /^föreslagna lösningar, strategier och nästa steg$/i,
  /^åtgärdspunkter, tidslinje och resurskrav$/i];
const ärMall = (b) => {
  const t = text(b);
  if (!t) return true;
  if (MALLORD.some((re) => re.test(t))) return true;
  return b.type === 'divider' || (t.length < 60 && /^[A-Z][a-z ]+:?$/.test(t));
};

export async function barn(sidId) {
  const ut = []; let markör;
  do {
    const j = await api(`blocks/${sidId}/children?page_size=100${markör ? `&start_cursor=${markör}` : ''}`, null, 'GET');
    ut.push(...j.results); markör = j.has_more ? j.next_cursor : null;
  } while (markör);
  return ut;
}

async function raderaBarn(lista) {
  for (const b of lista) { await api(`blocks/${b.id}`, null, 'DELETE'); await sov(120); }
}

async function läggTill(sidId, block) {
  for (let i = 0; i < block.length; i += 90) {
    await api(`blocks/${sidId}/children`, { children: block.slice(i, i + 90) }, 'PATCH');
    await sov(250);
  }
}

async function skapaRad(dbId, titel, kategori, block) {
  const egenskaper = { Dokumentnamn: { title: [{ text: { content: titel } }] } };
  if (kategori) egenskaper.Kategori = { multi_select: [{ name: kategori }] };
  const sida = await api('pages', { parent: { database_id: dbId }, properties: egenskaper, children: block.slice(0, 90) });
  if (block.length > 90) await läggTill(sida.id, block.slice(90));
  return sida;
}

/**
 * Filnamn i tvisthandbokens text → Notion-sidans titel. Utan det skickar
 * texten VA:n till "10-NOT-RECEIVED.md", en fil hon aldrig kan öppna.
 */
export function bytFilnamnMotTitlar(md, sidor) {
  let ut = md;
  for (const s of sidor) {
    if (!s.kalla) continue;
    const fil = s.kalla.replace(/^.*\//, '');
    ut = ut.split(fil).join(`“${s.titel}”`);
  }
  // Mappen orders/ heter beslut/ i repot och finns inte alls i Notion.
  ut = ut.replace(/`orders\/`|`beslut\/`/g, 'the decision sheets the owner keeps per order');
  // Repofilerna VA:n aldrig ser, och ordet "fil" om det som i Notion är en sida.
  return ut
    .replace(/\*\*99-BACKLOG\.md\*\*|`99-BACKLOG\.md`|99-BACKLOG\.md/g, 'the open-questions list the owner keeps')
    .replace(/\*\*README\.md\*\*|`README\.md`|README\.md/g, "the owner's notes on this handbook")
    .replace(/\| Open this file \|/g, '| Open this page |')
    .replace(/\| File \| Use it for \|/g, '| Page | Use it for |');
}

/** Raden som säger att sidan skrivs av repot, så ingen redigerar den i Notion. */
export function genereradNotis(brandNamn) {
  return `> This page is generated from the dispute handbook in the repo and filled in for ${brandNamn}. `
    + 'Anything you type into it is overwritten the next time it is published — send corrections to the owner instead.';
}

/** Markdown för en sida: egen fil, eller tvisthandboken ifylld för butiken. */
export function kallText(s, sidor, brandId) {
  if (!s.kalla) return readFileSync(join(HÄR, s.fil), 'utf8');
  const rå = readFileSync(join(HÄR, s.kalla), 'utf8');
  const b = brandFor(brandId);
  const { text, saknade, okanda } = fyll(rå, b);
  if (okanda.length) console.log(`   ⚠️ okända platshållare i ${s.kalla}: ${okanda.join(', ')}`);
  if (saknade.length) console.log(`   ⚠️ butiksvärden som saknas: ${saknade.join(', ')}`);
  // Notisen läggs direkt efter H1:an, så skrivarens självigenkänning (kroppen
  // börjar med filens egen H1) fortfarande stämmer.
  const med = text.replace(/^(#\s+.+)$/m, `$1\n\n${genereradNotis(b.brand)}`);
  return bytFilnamnMotTitlar(med, sidor);
}

export async function huvud(argv = process.argv.slice(2)) {
  const torr = argv.includes('--torr');
  const ersättAllt = argv.includes('--ersatt-allt');
  const bara = argv.includes('--bara') ? argv[argv.indexOf('--bara') + 1] : null;
  const brandId = argv.includes('--brand') ? argv[argv.indexOf('--brand') + 1] : (KONF.brand ?? 'baverbutiken');
  const logg = [];
  for (const s of KONF.sidor) {
    const namn = s.fil ?? s.kalla;
    if (bara && namn !== bara && s.fil !== bara && s.kalla !== bara) continue;
    const md = kallText(s, KONF.sidor, brandId);
    const block = tillBlock(md);
    if (!s.notion_id) {
      if (torr) { console.log(`torr  NY         ${block.length.toString().padStart(3)} block  ${s.titel}`); continue; }
      const sida = await skapaRad(KONF.databas, s.titel, s.kategori, block);
      s.notion_id = sida.id;
      console.log(`✅ ny         ${sida.id}  ${block.length} block  ${s.titel}`);
      logg.push({ fil: namn, id: sida.id, url: sida.url, block: block.length, slag: 'ny' });
      continue;
    }
    const gamla = await barn(s.notion_id);
    // En kropp som börjar med EXAKT den här filens egen H1 är en sida vi själva
    // skrev förra körningen — då är det en uppdatering, inte en överskrivning av
    // någon annans arbete. Allt annat innehåll stoppar fortfarande.
    const minRubrik = (md.match(/^#\s+(.+)$/m) ?? [])[1]?.trim();
    const vårEgen = minRubrik && gamla.length && gamla[0].type === 'heading_1'
      && text(gamla[0]) === minRubrik;
    const eget = vårEgen ? [] : gamla.filter((b) => !ärMall(b));
    if (eget.length && !ersättAllt) {
      console.log(`⏭  HOPPAD    ${namn}: kroppen bär ${eget.length} block som inte är tom mall. Kör --ersatt-allt om de ska bort.`);
      console.log(`   först:     ${text(eget[0]).slice(0, 90)}`);
      logg.push({ fil: namn, id: s.notion_id, slag: 'hoppad', eget: eget.length });
      continue;
    }
    if (torr) { console.log(`torr  skriv om   ${gamla.length} block ut, ${block.length} in   ${s.titel}`); continue; }
    await raderaBarn(gamla);
    await läggTill(s.notion_id, block);
    console.log(`✅ omskriven  ${s.notion_id}  ${gamla.length} ut / ${block.length} in  ${s.titel}`);
    logg.push({ fil: namn, id: s.notion_id, block: block.length, slag: 'omskriven' });
  }
  return logg;
}

if (process.argv[1] && process.argv[1].endsWith('skriv.mjs')) {
  const logg = await huvud();
  const nya = logg.filter((x) => x.slag === 'ny');
  if (nya.length) console.log('\nNya sid-id (skriv in dem i notion.json):\n' + nya.map((x) => `  ${x.fil}  ${x.id}`).join('\n'));
}
