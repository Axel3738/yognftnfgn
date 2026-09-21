#!/usr/bin/env node
// annonskommentarer.mjs — kommentarerna på top spendern, till products/<id>/kommentarer.md.
// Axels beslut 2026-09-21 (SKALNINGSKUNGEN-FORSLAG §2.12): varje /cs hämtar
// kommentarerna på produktens största annons; ett kluster med ≥ 3 om samma
// invändning blir en INVAND-variant i nästa batch (kalla=voc).
//
//   node tools/annonskommentarer.mjs --konto SE|NO --kampanj <id> [--dagar 30] [--ut products/<id>/kommentarer.md] [--json]
//   node tools/annonskommentarer.mjs --konto SE --annons <ad_id> [--ut …]
//
// Läs-bara. Rör aldrig kontot, svarar aldrig på en kommentar.
//
// Så här nås kommentarerna (mätt 2026-09-21): annonsens creative bär
// `effective_object_story_id` (= sidans inlägg). `/<post>/comments` svarar
// 190/2069032 med användartoken ("user access token not supported") — det
// krävs en SIDTOKEN, som hämtas ur `/<page_id>?fields=access_token` med samma
// META_ACCESS_TOKEN (Axel har sidrollen). Sidan är första ledet i post-id:t.
//
// Kluster = samma nyckelord (pris, frakt, storlek, kvalitet, leverans, retur,
// passform, material, fungerar, bluff) — regler, ingen modell, så en vecka går
// att jämföra med nästa. Kundnamn skrivs aldrig ut, bara texten och datumet.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname } from 'node:path';
import { pathToFileURL } from 'node:url';

const V = 'v21.0';
export const KONTON = { SE: '1867947880635861', NO: '1050941584152547' };

/** Klustren — ordningen är prioriteten när en kommentar träffar flera. */
export const KLUSTER = [
  ['pris', /\b(pris|dyrt|dyr|billig|kostar|kr\b|kronor|kroner|rabatt|erbjudande)/i],
  ['frakt/leverans', /\b(frakt|leverans|levererad|skickas|skickat|kommer den|frakten|porto|postnord|instabox|budbee)/i],
  ['storlek/passform', /\b(storlek|passar|passform|mått|måtten|längd|bredd|cm\b|stor nog|för liten|för stor)/i],
  ['kvalitet/material', /\b(kvalitet|kvalité|material|tyg|plast|hållbar|slitstark|tunn|tjock|går sönder|gick sönder)/i],
  ['fungerar det', /\b(fungerar|funkar|funka|håller den|tål|vattentät|regn|vind)/i],
  ['retur/garanti', /\b(retur|returnera|ångra|garanti|öppet köp|pengarna tillbaka)/i],
  ['förtroende/bluff', /\b(bluff|scam|fake|lurad|bedrägeri|seriös|seriöst|lita)/i],
  ['var köpa', /\b(var köper|var kan man|länk|hemsida|butik|finns den|beställa)/i],
  ['beröm', /\b(bra|toppen|kanon|nöjd|rekommenderar|älskar|perfekt|grym)\b/i],
  ['tagg/vän', /^\s*@?[A-ZÅÄÖ][a-zåäö]+\s+[A-ZÅÄÖ][a-zåäö]+\s*$/],
];

/** Klustret för en kommentartext. Ren. */
export function klustra(text) {
  const t = String(text ?? '').trim();
  if (!t) return 'tom';
  for (const [namn, re] of KLUSTER) if (re.test(t)) return namn;
  return 'övrigt';
}

/** Räknar per kluster. Ren. Returnerar [{kluster, antal, exempel: [text …]}] sorterat på antal. */
export function sammanfatta(kommentarer) {
  const per = new Map();
  for (const k of kommentarer) {
    const namn = klustra(k.message);
    if (!per.has(namn)) per.set(namn, { kluster: namn, antal: 0, exempel: [] });
    const p = per.get(namn);
    p.antal += 1;
    if (p.exempel.length < 3) p.exempel.push(String(k.message ?? '').replace(/\s+/g, ' ').trim().slice(0, 160));
  }
  return [...per.values()].sort((a, b) => b.antal - a.antal);
}

/** Markdown-sektionen för en annons. Ren. `invandningar` = kluster med ≥ 3 som inte är beröm/tagg. */
export function markdown({ idag, konto, annons, kommentarer, dagar }) {
  const s = sammanfatta(kommentarer);
  const invandningar = s.filter((k) => k.antal >= 3 && !['beröm', 'tagg/vän', 'tom', 'övrigt'].includes(k.kluster));
  const ut = [];
  ut.push(`## ${idag} — ${annons.name} (${konto}, annons ${annons.id}, senaste ${dagar} d: ${kommentarer.length} kommentarer)`);
  ut.push('');
  if (!kommentarer.length) { ut.push('Inga kommentarer i fönstret.'); ut.push(''); return { text: ut.join('\n'), invandningar }; }
  ut.push('| Kluster | Antal | Exempel |');
  ut.push('|---|---|---|');
  for (const k of s) ut.push(`| ${k.kluster} | ${k.antal} | ${k.exempel.map((e) => `"${e.replace(/\|/g, '/')}"`).join(' · ')} |`);
  ut.push('');
  if (invandningar.length) ut.push(`**INVAND-kandidater (≥ 3 om samma sak):** ${invandningar.map((k) => `${k.kluster} (${k.antal})`).join(', ')} — en variant per kluster i nästa batch, \`kalla=voc\`.`);
  else ut.push('Inget kluster når 3 — ingen INVAND-variant ur kommentarerna den här gången.');
  ut.push('');
  return { text: ut.join('\n'), invandningar };
}

async function graph(path, token) {
  const url = `https://graph.facebook.com/${V}/${path}${path.includes('?') ? '&' : '?'}access_token=${token}`;
  const r = await fetch(url);
  const j = await r.json();
  if (j.error) {
    // Mätt 2026-09-21: sidtoken ärver användartokens rättigheter, och Axels
    // token bär read_insights/ads_*/pages_show_list/business_management — inte
    // pages_read_engagement. Då svarar /comments "(#200) Missing Permissions".
    const tips = j.error.code === 200 && /comments/.test(path) ? ' — META_ACCESS_TOKEN saknar pages_read_engagement: Axel lägger till rättigheten på tokenen (Graph API Explorer / systemanvändaren i Business Settings) och genererar om den.' : '';
    throw new Error(`Meta ${path.split('?')[0]}: (${j.error.code}/${j.error.error_subcode ?? '-'}) ${j.error.message}${tips}`);
  }
  return j;
}

async function allaSidor(path, token, max = 2000) {
  const ut = [];
  let nasta = path;
  while (nasta && ut.length < max) {
    const j = nasta.startsWith('http') ? await (await fetch(nasta)).json() : await graph(nasta, token);
    if (j.error) throw new Error(`Meta: ${j.error.message}`);
    ut.push(...(j.data ?? []));
    nasta = j.paging?.next ?? null;
  }
  return ut;
}

/** Top spendern i kampanjen senaste `dagar` dygn. */
async function topSpender(kontoId, kampanjId, dagar, token) {
  const sedan = new Date(Date.now() - dagar * 86400000).toISOString().slice(0, 10);
  const idag = new Date().toISOString().slice(0, 10);
  const rader = await allaSidor(`${kampanjId}/insights?level=ad&fields=ad_id,ad_name,spend&time_range=${encodeURIComponent(JSON.stringify({ since: sedan, until: idag }))}&limit=500`, token);
  if (!rader.length) return null;
  rader.sort((a, b) => Number(b.spend) - Number(a.spend));
  return { id: rader[0].ad_id, name: rader[0].ad_name, spend: Number(rader[0].spend) };
}

async function huvud() {
  const args = process.argv.slice(2);
  const flagga = (n, s = null) => { const i = args.indexOf(`--${n}`); return i !== -1 && args[i + 1] !== undefined && !args[i + 1].startsWith('--') ? args[i + 1] : s; };
  const token = process.env.META_ACCESS_TOKEN;
  if (!token) { console.error('✗ META_ACCESS_TOKEN saknas i miljön.'); process.exit(1); }
  const konto = String(flagga('konto', 'SE')).toUpperCase();
  const kontoId = KONTON[konto] ?? konto.replace(/^act_/, '');
  const dagar = Number(flagga('dagar', 30));
  const idag = flagga('idag') ?? new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Stockholm' }).format(new Date());
  let annons = null;
  if (flagga('annons')) {
    const a = await graph(`${flagga('annons')}?fields=id,name`, token);
    annons = { id: a.id, name: a.name };
  } else if (flagga('kampanj')) {
    annons = await topSpender(kontoId, flagga('kampanj'), dagar, token);
    if (!annons) { console.error(`✗ Kampanjen ${flagga('kampanj')} har ingen spend senaste ${dagar} d.`); process.exit(1); }
  } else { console.error('✗ Ge --kampanj <id> (top spendern hämtas) eller --annons <ad_id>.'); process.exit(1); }

  const c = await graph(`${annons.id}?fields=creative{effective_object_story_id}`, token);
  const post = c.creative?.effective_object_story_id;
  if (!post) { console.error(`✗ ${annons.name}: creativen har inget inlägg (effective_object_story_id saknas) — kommentarer finns bara på inlägg.`); process.exit(1); }
  const sidaId = post.split('_')[0];
  const sida = await graph(`${sidaId}?fields=access_token,name`, token);
  if (!sida.access_token) { console.error(`✗ Sidan ${sidaId} gav ingen sidtoken — kontot saknar sidrollen.`); process.exit(1); }
  const sedanMs = Date.now() - dagar * 86400000;
  const alla = await allaSidor(`${post}/comments?fields=message,created_time,like_count&filter=stream&limit=100`, sida.access_token);
  const kommentarer = alla.filter((k) => Date.parse(k.created_time) >= sedanMs && String(k.message ?? '').trim());
  const { text, invandningar } = markdown({ idag, konto, annons, kommentarer, dagar });

  if (args.includes('--json')) console.log(JSON.stringify({ annons, post, sida: sida.name, antal: kommentarer.length, kluster: sammanfatta(kommentarer), invandningar }, null, 2));
  else console.log(text);
  const ut = flagga('ut');
  if (ut) {
    mkdirSync(dirname(ut), { recursive: true });
    const gammalt = existsSync(ut) ? readFileSync(ut, 'utf8') : '# Kommentarer på top spendern\n\nSkrivs av `tools/annonskommentarer.mjs` vid varje `/cs`. Kluster ≥ 3 om samma invändning ⇒ INVAND-variant (`kalla=voc`). Kundnamn skrivs aldrig.\n\n';
    writeFileSync(ut, `${gammalt.trimEnd()}\n\n${text}`);
    console.error(`Skrivet: ${ut}`);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  huvud().catch((e) => { console.error(`✗ ${e.message}`); process.exit(1); });
}
