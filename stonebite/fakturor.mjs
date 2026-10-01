// fakturor.mjs — de anställdas fakturor, uppladdade på sajten.
//
// Axel 2026-10-01: "ett ställe där alla anställda kan ladda upp sina fakturor
// … jag kommer att be Claude samla in hela septembers månads fakturor … och
// sedan skicka dem till min redovisningsbyrå". Och: "ladda upp alla sina
// fakturor någonsin … jag råkat slarva bort alla".
//
// Filerna ligger på volymen (`<STONEBITE_DATA>/fakturor/<person>/…`), aldrig i
// repot, och registret är en jsonl bredvid — en rad per uppladdning, senaste
// raden per id vinner (samma mönster som insatserna och kalendern). Den som
// laddar upp ser bara sina egna; ägare och chef ser allas. Claude hämtar dem
// med API-nyckeln (`STONEBITE_API_NYCKEL`) via `stonebite/fakturor-hamta.mjs`.
//
// Ingen bildbehandling, ingen OCR: filen sparas som den kom. Det enda som
// kontrolleras är typen (pdf/bild), storleken och månaden.

import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { dirname, join, extname, basename } from 'node:path';
import { randomBytes } from 'node:crypto';
import { datamapp } from '../bonus/kor.mjs';

export const FAKTURAREGISTER = join(datamapp(), 'fakturor.jsonl');
export const FAKTURAMAPP = join(datamapp(), 'fakturor');
export const MAX_BYTES = 15 * 1024 * 1024;
export const TYPER = Object.freeze({
  '.pdf': 'application/pdf',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.heic': 'image/heic',
});

/** "2026-09" eller null. */
export function giltigManad(m) {
  const s = String(m ?? '').trim();
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(s)) return null;
  const ar = Number(s.slice(0, 4));
  return ar >= 2020 && ar <= 2100 ? s : null;
}

/** Ett person-id som är ofarligt som mappnamn. */
export function sakerPersonNyckel(id) {
  const s = String(id ?? '').trim().toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '');
  return s.slice(0, 60) || null;
}

/** Originalnamnet, rensat så det kan stå i en Content-Disposition. */
export function sakertFilnamn(namn) {
  const bas = basename(String(namn ?? 'faktura')).replace(/[\\/:*?"<>|\u0000-\u001f]+/g, '_').trim();
  return (bas || 'faktura').slice(0, 120);
}

/**
 * Tolkar en multipart/form-data-kropp. Inga beroenden: boundary ur
 * content-type, delarna splittas på "--boundary", huvudet läses rad för rad.
 * Returnerar { falt: {namn: text}, filer: [{ falt, filnamn, typ, data }] }.
 */
export function tolkaMultipart(kropp, contentType) {
  const m = /boundary=(?:"([^"]+)"|([^;]+))/i.exec(String(contentType ?? ''));
  const boundary = (m?.[1] ?? m?.[2] ?? '').trim();
  if (!boundary) throw new Error('Formuläret saknar boundary.');
  const buf = Buffer.isBuffer(kropp) ? kropp : Buffer.from(kropp);
  const avgr = Buffer.from(`--${boundary}`);
  const falt = {};
  const filer = [];
  let pos = buf.indexOf(avgr);
  while (pos !== -1) {
    pos += avgr.length;
    if (buf[pos] === 0x2d && buf[pos + 1] === 0x2d) break; // "--" = slutet
    if (buf[pos] === 0x0d) pos += 2; else if (buf[pos] === 0x0a) pos += 1;
    const huvudSlut = buf.indexOf('\r\n\r\n', pos);
    if (huvudSlut === -1) break;
    const huvud = buf.subarray(pos, huvudSlut).toString('utf8');
    const start = huvudSlut + 4;
    let nasta = buf.indexOf(avgr, start);
    if (nasta === -1) break;
    let slut = nasta;
    if (buf[slut - 1] === 0x0a) slut -= 1;
    if (buf[slut - 1] === 0x0d) slut -= 1;
    const data = buf.subarray(start, slut);
    const namn = /name="([^"]*)"/i.exec(huvud)?.[1] ?? '';
    const filnamn = /filename="([^"]*)"/i.exec(huvud)?.[1];
    const typ = /content-type:\s*([^\r\n]+)/i.exec(huvud)?.[1]?.trim() ?? '';
    if (filnamn !== undefined) {
      if (filnamn) filer.push({ falt: namn, filnamn, typ, data: Buffer.from(data) });
    } else {
      falt[namn] = data.toString('utf8');
    }
    pos = nasta;
  }
  return { falt, filer };
}

/** Senaste raden per id, utan de borttagna om `medBorttagna` inte sägs. */
export function lasFakturor(fil = FAKTURAREGISTER, { medBorttagna = false } = {}) {
  const senaste = new Map();
  if (!existsSync(fil)) return [];
  for (const rad of readFileSync(fil, 'utf8').split('\n')) {
    if (!rad.trim()) continue;
    try {
      const r = JSON.parse(rad);
      if (r?.id) senaste.set(r.id, r);
    } catch { /* trasig rad hoppas över */ }
  }
  return [...senaste.values()]
    .filter((r) => medBorttagna || !r.borttagen)
    .sort((a, b) => String(b.uppladdad).localeCompare(String(a.uppladdad)));
}

/**
 * Sparar en faktura: filen på volymen, raden i registret. Kastar med ett
 * begripligt fel på fel typ, för stor fil eller ogiltig månad — sidan visar
 * felet, ingenting halvskrivs.
 */
export function sparaFaktura({ personId, personNamn, kontoId, manad, filnamn, data, anteckning = '', nu = new Date() }, { register = FAKTURAREGISTER, mapp = FAKTURAMAPP } = {}) {
  const person = sakerPersonNyckel(personId ?? kontoId);
  if (!person) throw new Error('Kontot saknar id.');
  const m = giltigManad(manad);
  if (!m) throw new Error('Välj vilken månad fakturan gäller (ÅÅÅÅ-MM).');
  if (!data || !data.length) throw new Error('Ingen fil valdes.');
  if (data.length > MAX_BYTES) throw new Error(`Filen är för stor (max ${Math.round(MAX_BYTES / 1024 / 1024)} MB).`);
  const ext = extname(String(filnamn ?? '')).toLowerCase();
  if (!TYPER[ext]) throw new Error('Bara PDF eller bild (PNG, JPG, WEBP, HEIC).');
  const id = `${nu.toISOString().slice(0, 10)}-${randomBytes(5).toString('hex')}`;
  const relativ = join(person, `${m}-${id}${ext}`);
  const sokvag = join(mapp, relativ);
  mkdirSync(dirname(sokvag), { recursive: true });
  writeFileSync(sokvag, data);
  const rad = {
    id,
    personId: personId ? String(personId) : null,
    kontoId: kontoId ? String(kontoId) : null,
    personNyckel: person,
    personNamn: String(personNamn ?? '').slice(0, 120),
    manad: m,
    fil: relativ.split('\\').join('/'),
    namn: sakertFilnamn(filnamn),
    typ: TYPER[ext],
    storlek: data.length,
    anteckning: String(anteckning ?? '').slice(0, 300),
    uppladdad: nu.toISOString(),
    borttagen: false,
  };
  mkdirSync(dirname(register), { recursive: true });
  appendFileSync(register, `${JSON.stringify(rad)}\n`);
  return rad;
}

/** Markerar en faktura som borttagen (filen ligger kvar på volymen). */
export function taBortFaktura(id, { av = null, nu = new Date() } = {}, register = FAKTURAREGISTER) {
  const rad = lasFakturor(register).find((r) => r.id === id);
  if (!rad) throw new Error('Fakturan finns inte.');
  const ny = { ...rad, borttagen: true, borttagenAv: av, borttagenTid: nu.toISOString() };
  appendFileSync(register, `${JSON.stringify(ny)}\n`);
  return ny;
}

/** Fakturans sökväg på disk — bara inom fakturamappen, annars null. */
export function fakturaSokvag(rad, mapp = FAKTURAMAPP) {
  if (!rad?.fil) return null;
  const sokvag = join(mapp, rad.fil);
  if (!sokvag.startsWith(mapp)) return null;
  if (!existsSync(sokvag) || !statSync(sokvag).isFile()) return null;
  return sokvag;
}

/** Är fakturan uppladdarens egen? Kontot vinner; person-id är reserv. */
export function arEgen(rad, anvandare) {
  if (!rad || !anvandare) return false;
  if (rad.kontoId && anvandare.id && String(rad.kontoId) === String(anvandare.id)) return true;
  if (rad.personId && anvandare.personId && String(rad.personId) === String(anvandare.personId)) return true;
  return false;
}

/** Grupperar per person: { nyckel, namn, fakturor[], senaste, manader[] }. */
export function perPerson(rader) {
  const grupper = new Map();
  for (const r of rader) {
    const g = grupper.get(r.personNyckel) ?? { nyckel: r.personNyckel, namn: r.personNamn || r.personNyckel, fakturor: [], manader: new Set() };
    g.fakturor.push(r);
    g.manader.add(r.manad);
    if (r.personNamn) g.namn = r.personNamn;
    grupper.set(r.personNyckel, g);
  }
  return [...grupper.values()]
    .map((g) => ({ ...g, senaste: g.fakturor[0], manader: [...g.manader].sort().reverse() }))
    .sort((a, b) => a.namn.localeCompare(b.namn, 'sv'));
}

/** Månaderna som har minst en faktura, nyast först. */
export function manaderMedFakturor(rader) {
  return [...new Set(rader.map((r) => r.manad))].sort().reverse();
}

// ---------------------------------------------------------------- zip

const CRC_TABELL = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABELL[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function dosTid(d) {
  const tid = ((d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1)) & 0xffff;
  const datum = (((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate()) & 0xffff;
  return { tid, datum };
}

/**
 * En zip utan komprimering (metoden "store") — fakturorna är redan PDF/JPEG
 * och komprimeras inte nämnvärt. Inga beroenden; formatet är det enkla med
 * lokala huvuden + central katalog + slutpost. `filer` = [{ namn, data, tid }].
 */
export function byggZip(filer) {
  const lokala = [];
  const katalog = [];
  let offset = 0;
  for (const f of filer) {
    const namn = Buffer.from(f.namn, 'utf8');
    const data = Buffer.isBuffer(f.data) ? f.data : Buffer.from(f.data);
    const crc = crc32(data);
    const { tid, datum } = dosTid(f.tid instanceof Date ? f.tid : new Date());
    const lokal = Buffer.alloc(30);
    lokal.writeUInt32LE(0x04034b50, 0);
    lokal.writeUInt16LE(20, 4);        // version
    lokal.writeUInt16LE(0x0800, 6);    // flaggor: utf-8-namn
    lokal.writeUInt16LE(0, 8);         // store
    lokal.writeUInt16LE(tid, 10);
    lokal.writeUInt16LE(datum, 12);
    lokal.writeUInt32LE(crc, 14);
    lokal.writeUInt32LE(data.length, 18);
    lokal.writeUInt32LE(data.length, 22);
    lokal.writeUInt16LE(namn.length, 26);
    lokal.writeUInt16LE(0, 28);
    lokala.push(lokal, namn, data);

    const c = Buffer.alloc(46);
    c.writeUInt32LE(0x02014b50, 0);
    c.writeUInt16LE(20, 4);
    c.writeUInt16LE(20, 6);
    c.writeUInt16LE(0x0800, 8);
    c.writeUInt16LE(0, 10);
    c.writeUInt16LE(tid, 12);
    c.writeUInt16LE(datum, 14);
    c.writeUInt32LE(crc, 16);
    c.writeUInt32LE(data.length, 20);
    c.writeUInt32LE(data.length, 24);
    c.writeUInt16LE(namn.length, 28);
    c.writeUInt16LE(0, 30);
    c.writeUInt16LE(0, 32);
    c.writeUInt16LE(0, 34);
    c.writeUInt16LE(0, 36);
    c.writeUInt32LE(0, 38);
    c.writeUInt32LE(offset, 42);
    katalog.push(c, namn);
    offset += lokal.length + namn.length + data.length;
  }
  const katalogBuf = Buffer.concat(katalog);
  const slut = Buffer.alloc(22);
  slut.writeUInt32LE(0x06054b50, 0);
  slut.writeUInt16LE(0, 4);
  slut.writeUInt16LE(0, 6);
  slut.writeUInt16LE(filer.length, 8);
  slut.writeUInt16LE(filer.length, 10);
  slut.writeUInt32LE(katalogBuf.length, 12);
  slut.writeUInt32LE(offset, 16);
  slut.writeUInt16LE(0, 20);
  return Buffer.concat([...lokala, katalogBuf, slut]);
}

/** Filnamnet en faktura får i zippen/nedladdningen: person + månad + original. */
export function nedladdningsnamn(rad) {
  const ext = extname(rad.namn || '') || extname(rad.fil || '') || '';
  const bas = sakertFilnamn(rad.namn || '').replace(/\.[^.]+$/, '');
  return `${rad.manad} ${rad.personNamn || rad.personNyckel} - ${bas}${ext}`.replace(/\s+/g, ' ');
}
