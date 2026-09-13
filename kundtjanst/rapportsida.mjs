#!/usr/bin/env node
// rapportsida.mjs — kundtjänstrapporterna som EN hemsida med all historik.
//
// Rapporterna i kundtjanst/korningar/ är kvittona (Markdown, en fil per brand
// och vecka). Historiken i kundtjanst/historik/ är talen vecka för vecka. Den
// här filen bakar ihop båda till en självbärande HTML-sida som publiceras som
// artifact på claude.ai — samma mönster som redigerarnas topplista i
// commission/leaderboard.mjs. Sidan räknar ALDRIG om något: den visar
// rapportens text och historikens tal, så sidan och repot kan inte säga olika.
//
//   node kundtjanst/rapportsida.mjs               bygg kundtjanst/rapport-publicerad.html
//   node kundtjanst/rapportsida.mjs --url <länk>  spara sidans fasta länk (en gång)
//
// Publiceringen görs av rutinen med Artifact-verktyget mot SAMMA url varje
// gång (länken står i kundtjanst/rapportsida.json) — utan url blir det en ny
// sida med en ny länk, och den Axel har sparad slutar uppdateras.
//
// Ingen runtime-capability på sidan (samma regel som topplistan): datan ligger
// inbakad, så länken funkar för den som inte har ett Claude-konto.

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { KATEGORIER } from './klassificering.mjs';
import { upptackBrands } from './brands.mjs';

const ROT = dirname(dirname(fileURLToPath(import.meta.url)));
export const KORNINGAR = join(ROT, 'kundtjanst', 'korningar');
export const HISTORIK = join(ROT, 'kundtjanst', 'historik');
export const MALL = join(ROT, 'kundtjanst', 'rapport-sida.html');
export const UT = join(ROT, 'kundtjanst', 'rapport-publicerad.html');
export const URLFIL = join(ROT, 'kundtjanst', 'rapportsida.json');

const VECKA = /^(\d{4}-W\d{2})(\.en)?\.md$/;

// ------------------------------------------------------------ Markdown → HTML

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/** Fetstil och kod — resten av texten är redan HTML-escapad. */
export function inline(text) {
  return esc(text)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>');
}

/** Vilken sorts avsnitt en rubrik inleder — styr hur sidan färgar det. */
export function sektionsSlug(rubrik) {
  const r = String(rubrik);
  if (/\bAxels\b/.test(r)) return 'axel';
  if (/\bVA:n\b/.test(r)) return 'va';
  if (/ACTION/.test(r)) return 'action';
  if (/^⚠️|Could not read|Kunde inte läsas/.test(r)) return 'varning';
  return 'allman';
}

/**
 * Den delmängd av Markdown som rapport.mjs skriver: #/## rubriker, tabeller,
 * punktlistor (-, •, nästlade med indrag eller ◦), numrerade listor med
 * indragna följdrader, **fet**, `kod`. Rader som är HELT fetstil (den engelska
 * rapportens "**Numbers**") blir rubriker. Varje ## öppnar en <section> med
 * data-sektion, så sidan kan lyfta Axels och VA:ns listor.
 */
export function mdTillHtml(md) {
  const ut = [];
  let stycke = [];
  let lista = null;    // { typ: 'ul'|'ol', poster: [{ text, under: [] }] }
  let tabell = null;   // { rader: [[...]], rubrikIndex }
  let sektion = false;

  const flushStycke = () => { if (stycke.length) { ut.push(`<p>${stycke.map(inline).join(' ')}</p>`); stycke = []; } };
  const flushLista = () => {
    if (!lista) return;
    const li = lista.poster.map((p) => `<li>${inline(p.text)}${p.under.length ? `<ul>${p.under.map((u) => `<li>${inline(u)}</li>`).join('')}</ul>` : ''}</li>`).join('');
    ut.push(`<${lista.typ}>${li}</${lista.typ}>`);
    lista = null;
  };
  const flushTabell = () => {
    if (!tabell) return;
    const { rader, rubrikIndex } = tabell;
    const cell = (r, tag) => `<tr>${r.map((c) => `<${tag}>${inline(c)}</${tag}>`).join('')}</tr>`;
    const huvud = rubrikIndex !== null ? `<thead>${cell(rader[rubrikIndex], 'th')}</thead>` : '';
    const kropp = rader.filter((_, i) => i !== rubrikIndex).map((r) => cell(r, 'td')).join('');
    ut.push(`<div class="tabell"><table>${huvud}<tbody>${kropp}</tbody></table></div>`);
    tabell = null;
  };
  const flushAllt = () => { flushStycke(); flushLista(); flushTabell(); };
  const rubrik = (niva, text) => {
    flushAllt();
    if (niva === 2) {
      if (sektion) ut.push('</section>');
      ut.push(`<section data-sektion="${sektionsSlug(text)}">`);
      sektion = true;
    }
    ut.push(`<h${niva}>${inline(text)}</h${niva}>`);
  };

  for (const rad of String(md ?? '').split('\n')) {
    const trimmad = rad.trim();
    let m;
    if (!trimmad) { flushAllt(); continue; }
    if ((m = /^#\s+(.*)$/.exec(trimmad))) { rubrik(1, m[1]); continue; }
    if ((m = /^##\s+(.*)$/.exec(trimmad))) { rubrik(2, m[1]); continue; }
    if (/^\*\*[^*]+\*\*$/.test(trimmad)) { rubrik(2, trimmad.slice(2, -2)); continue; }
    if (/^\|.*\|$/.test(trimmad)) {
      flushStycke(); flushLista();
      if (/^\|[\s\-:|]+\|$/.test(trimmad)) { if (tabell) tabell.rubrikIndex = tabell.rader.length - 1; continue; }
      const celler = trimmad.slice(1, -1).split('|').map((c) => c.trim());
      if (!tabell) tabell = { rader: [], rubrikIndex: null };
      tabell.rader.push(celler);
      continue;
    }
    flushTabell();
    const indrag = rad.length - rad.trimStart().length;
    if ((m = /^(?:[-•]|◦)\s+(.*)$/.exec(trimmad))) {
      const nastlad = indrag >= 2 || trimmad.startsWith('◦');
      if (nastlad && lista?.poster.length) { lista.poster[lista.poster.length - 1].under.push(m[1]); continue; }
      flushStycke();
      if (!lista || lista.typ !== 'ul') { flushLista(); lista = { typ: 'ul', poster: [] }; }
      lista.poster.push({ text: m[1], under: [] });
      continue;
    }
    if ((m = /^\d+\.\s+(.*)$/.exec(trimmad))) {
      flushStycke();
      if (!lista || lista.typ !== 'ol') { flushLista(); lista = { typ: 'ol', poster: [] }; }
      lista.poster.push({ text: m[1], under: [] });
      continue;
    }
    if (indrag >= 2 && lista?.poster.length) { // följdrad under en listpost
      const sista = lista.poster[lista.poster.length - 1];
      sista.text += ` ${trimmad}`;
      continue;
    }
    flushLista();
    stycke.push(trimmad);
  }
  flushAllt();
  if (sektion) ut.push('</section>');
  return ut.join('\n');
}

// ------------------------------------------------------------------ Datan

function lasJsonl(fil) {
  if (!existsSync(fil)) return [];
  return readFileSync(fil, 'utf8').split('\n').filter(Boolean)
    .map((r) => { try { return JSON.parse(r); } catch { return null; } })
    .filter((r) => r && r.vecka);
}

function mappar(bas) {
  if (!existsSync(bas)) return [];
  return readdirSync(bas, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);
}

/**
 * Samlar allt sidan visar: en post per brand med rapporterna (HTML) per vecka
 * och historikens tal, rankingen per vecka, kategorinamnen. `brands` är
 * upptackBrands()-listan (bara namn och trösklar används); ett brand som har
 * körningar men ingen brandfil får sitt id som namn — aldrig tyst utelämnat.
 */
export function samlaData({ korningar = KORNINGAR, historik = HISTORIK, brands = null, nu = new Date() } = {}) {
  const kanda = new Map((brands ?? upptackBrands()).map((b) => [b.id, b]));
  const ids = new Set([
    ...mappar(korningar).filter((n) => !n.startsWith('_')),
    ...(existsSync(historik) ? readdirSync(historik).filter((f) => f.endsWith('.jsonl')).map((f) => f.slice(0, -6)) : []),
  ]);
  const veckorAlla = new Set();
  const lista = [];
  for (const id of [...ids].sort()) {
    const b = kanda.get(id);
    const veckor = {};
    const mapp = join(korningar, id);
    if (existsSync(mapp)) {
      for (const f of readdirSync(mapp)) {
        const m = VECKA.exec(f);
        if (!m) continue;
        veckor[m[1]] ??= { sv: '', en: '' };
        veckor[m[1]][m[2] ? 'en' : 'sv'] = mdTillHtml(readFileSync(join(mapp, f), 'utf8'));
        veckorAlla.add(m[1]);
      }
    }
    const rader = lasJsonl(join(historik, `${id}.jsonl`)).sort((a, c) => a.vecka.localeCompare(c.vecka));
    for (const r of rader) veckorAlla.add(r.vecka);
    lista.push({
      id,
      namn: b?.brand || b?.namn || id,
      trosklar: { obesvarad_timmar: b?.trosklar?.obesvarad_timmar ?? 48 },
      historik: rader,
      veckor,
    });
  }
  const ranking = {};
  const rankMapp = join(korningar, '_ranking');
  if (existsSync(rankMapp)) {
    for (const f of readdirSync(rankMapp)) {
      const m = VECKA.exec(f);
      if (m && !m[2]) { ranking[m[1]] = mdTillHtml(readFileSync(join(rankMapp, f), 'utf8')); veckorAlla.add(m[1]); }
    }
  }
  return {
    uppdaterad: nu.toISOString(),
    veckor: [...veckorAlla].sort(),
    brands: lista,
    ranking,
    kategorier: Object.fromEntries(KATEGORIER.map((k) => [k.id, { sv: k.sv, en: k.en }])),
  };
}

// ------------------------------------------------------------------ Sidan

/** Bakar in datan i mallen. `</script` i datan bryts så sidan inte kan gå sönder. */
export function byggSida({ mall = MALL, ut = UT, data } = {}) {
  const html = readFileSync(mall, 'utf8');
  if (!html.includes('__DATA__')) throw new Error('Mallen saknar platshållaren __DATA__.');
  const json = JSON.stringify(data ?? samlaData()).replace(/<\//g, '<\\/');
  writeFileSync(ut, html.replace('__DATA__', () => json));
  return ut;
}

export function lasUrl(fil = URLFIL) {
  if (!existsSync(fil)) return null;
  try { return JSON.parse(readFileSync(fil, 'utf8')).url ?? null; } catch { return null; }
}

export function sparaUrl(url, fil = URLFIL) {
  writeFileSync(fil, `${JSON.stringify({ url, sparad: new Date().toISOString().slice(0, 10) }, null, 2)}\n`);
}

// -------------------------------------------------------------------- CLI

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const i = args.indexOf('--url');
  if (i !== -1 && args[i + 1]) { sparaUrl(args[i + 1]); console.log(`Länk sparad i kundtjanst/rapportsida.json: ${args[i + 1]}`); }
  const data = samlaData();
  const fil = byggSida({ data });
  console.log(`Sida: ${fil.replace(`${ROT}/`, '')}`);
  console.log(`Brands: ${data.brands.map((b) => `${b.namn} (${Object.keys(b.veckor).length} rapporter, ${b.historik.length} veckor historik)`).join(', ') || 'inga'}`);
  console.log(`Veckor: ${data.veckor.join(', ') || 'inga'}`);
  const url = lasUrl();
  console.log(url
    ? `\nPublicera mot samma länk:\n  Artifact  file_path: ${fil}\n            url:       ${url}`
    : '\n⚠️ Ingen länk sparad än. Publicera med Artifact (favicon 📬) och kör sedan:\n  node kundtjanst/rapportsida.mjs --url <länken>');
}
