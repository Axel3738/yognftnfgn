// lager/xlsx.mjs — läser en .xlsx utan ett enda beroende. LÄS-BARA.
//
// Varför en egen läsare: CWD:s lagerark ("Axel stock") har en flik per dag
// (9.30updated, 9.29updated …) och Googles CSV-export per fliknamn svarar med
// FÖRSTA fliken när namnet inte finns — tyst, utan fel (mätt 2026-10-01 med
// `sheet=finnsinte`). En gissad flik ger alltså fel siffror som ser rätta ut.
// xlsx-exporten bär alla flikar med sina riktiga namn, så den läses här.
//
// En .xlsx är en zip med XML i. Zip-läsaren nedan klarar det Google skriver:
// lagrade (0) och deflate-packade (8) poster, central katalog i slutet.

import { inflateRawSync } from 'node:zlib';

/** Zip-arkivets filer → Map(namn → Buffer). */
export function lasZip(buf) {
  let eocd = -1;
  for (let i = buf.length - 22; i >= Math.max(0, buf.length - 65_557); i--) {
    if (buf.readUInt32LE(i) === 0x06054b50) { eocd = i; break; }
  }
  if (eocd < 0) throw new Error('inte en zip-fil (ingen central katalog) — är det verkligen en .xlsx?');
  const antal = buf.readUInt16LE(eocd + 10);
  let p = buf.readUInt32LE(eocd + 16);
  const filer = new Map();
  for (let n = 0; n < antal; n++) {
    if (buf.readUInt32LE(p) !== 0x02014b50) throw new Error(`trasig central katalog vid byte ${p}`);
    const metod = buf.readUInt16LE(p + 10);
    const packad = buf.readUInt32LE(p + 20);
    const namnLangd = buf.readUInt16LE(p + 28);
    const extraLangd = buf.readUInt16LE(p + 30);
    const kommentarLangd = buf.readUInt16LE(p + 32);
    const lokal = buf.readUInt32LE(p + 42);
    const namn = buf.toString('utf8', p + 46, p + 46 + namnLangd);
    const data = lokal + 30 + buf.readUInt16LE(lokal + 26) + buf.readUInt16LE(lokal + 28);
    const ra = buf.subarray(data, data + packad);
    if (metod === 0) filer.set(namn, ra);
    else if (metod === 8) filer.set(namn, inflateRawSync(ra));
    else throw new Error(`zip-metod ${metod} stöds inte (${namn})`);
    p += 46 + namnLangd + extraLangd + kommentarLangd;
  }
  return filer;
}

const ENTITETER = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };
export function avkoda(s) {
  return String(s).replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (hel, e) => {
    if (e[0] === '#') return String.fromCodePoint(e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : Number(e.slice(1)));
    return ENTITETER[e] ?? hel;
  });
}

/** All text i ett <si>/<is>-element (även uppdelad i formaterade <r>-bitar). */
function textI(xml) {
  return [...xml.matchAll(/<t(?:\s[^>]*)?>([\s\S]*?)<\/t>|<t(?:\s[^>]*)?\/>/g)].map((m) => avkoda(m[1] ?? '')).join('');
}

/** "AB12" → kolumnindex 27 (0-baserat). */
export function kolumn(ref) {
  const bokstaver = /^[A-Z]+/.exec(ref)?.[0] ?? 'A';
  let n = 0;
  for (const c of bokstaver) n = n * 26 + (c.charCodeAt(0) - 64);
  return n - 1;
}

/**
 * Hela arbetsboken → [{ namn, rader: [[cell, …], …] }] i flikordning.
 * Celler är strängar eller tal; tomma celler blir null.
 */
export function lasXlsx(buf) {
  const filer = lasZip(buf);
  const text = (n) => filer.get(n)?.toString('utf8') ?? null;
  const delade = [];
  const ss = text('xl/sharedStrings.xml');
  if (ss) for (const m of ss.matchAll(/<si>([\s\S]*?)<\/si>/g)) delade.push(textI(m[1]));

  const rels = new Map();
  for (const m of (text('xl/_rels/workbook.xml.rels') ?? '').matchAll(/<Relationship\b[^>]*>/g)) {
    const id = /\bId="([^"]+)"/.exec(m[0])?.[1];
    const mal = /\bTarget="([^"]+)"/.exec(m[0])?.[1];
    if (id && mal) rels.set(id, mal.replace(/^\/?xl\//, '').replace(/^\//, ''));
  }

  const bok = text('xl/workbook.xml');
  if (!bok) throw new Error('xl/workbook.xml saknas — inte en .xlsx');
  const flikar = [];
  for (const m of bok.matchAll(/<sheet\b[^>]*>/g)) {
    const namn = avkoda(/\bname="([^"]*)"/.exec(m[0])?.[1] ?? '');
    const rid = /\br:id="([^"]+)"/.exec(m[0])?.[1];
    const fil = rid && rels.get(rid) ? `xl/${rels.get(rid)}` : null;
    const xml = fil ? text(fil) : null;
    flikar.push({ namn, rader: xml ? lasFlik(xml, delade) : [] });
  }
  return flikar;
}

function lasFlik(xml, delade) {
  const rader = [];
  for (const rm of xml.matchAll(/<row\b([^>]*)>([\s\S]*?)<\/row>/g)) {
    const radNr = Number(/\br="(\d+)"/.exec(rm[1])?.[1] ?? rader.length + 1);
    const rad = [];
    for (const cm of rm[2].matchAll(/<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
      const attr = cm[1];
      const inne = cm[2] ?? '';
      const ref = /\br="([A-Z]+\d+)"/.exec(attr)?.[1];
      const typ = /\bt="([^"]+)"/.exec(attr)?.[1];
      const v = /<v>([\s\S]*?)<\/v>/.exec(inne)?.[1];
      let varde = null;
      if (typ === 's') varde = v !== undefined ? delade[Number(v)] ?? null : null;
      else if (typ === 'inlineStr') varde = textI(inne);
      else if (typ === 'str' || typ === 'e') varde = v !== undefined ? avkoda(v) : null;
      else if (typ === 'b') varde = v === '1';
      else if (v !== undefined) varde = Number(v);
      const k = ref ? kolumn(ref) : rad.length;
      rad[k] = varde;
    }
    for (let i = 0; i < rad.length; i++) if (rad[i] === undefined) rad[i] = null;
    rader[radNr - 1] = rad;
  }
  for (let i = 0; i < rader.length; i++) if (!rader[i]) rader[i] = [];
  return rader;
}
