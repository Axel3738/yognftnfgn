// zip.mjs — minimal zip-skrivare och zip-läsare. Noll beroenden (node:zlib).
//
// GemPages export-filen (.gempages) är en vanlig zip med tre poster:
//   manifest.json, pages_info.zip (→ pages_info.json), 1_<sid-id>.zip (→ 1_<sid-id>.json)
// — alltså zip i zip. Vi skriver samma form som GemPages själv (deflate,
// datum 1980-00-00, inga extra-fält), så importen ser en fil den känner igen.
//
//   skrivZip([{ namn, data: Buffer|string }]) → Buffer
//   lasZip(buffer) → Map<namn, Buffer>
//
// Formatet (PKWARE APPNOTE): lokalt filhuvud + data per post, sedan central
// katalog och "end of central directory". Inga zip64-poster — filerna är
// kilobyte, inte gigabyte.

import { deflateRawSync, inflateRawSync } from 'node:zlib';

const SIG_LOKAL = 0x04034b50;
const SIG_CENTRAL = 0x02014b50;
const SIG_SLUT = 0x06054b50;
const METOD_DEFLATE = 8;
const VERSION = 20;

// CRC-32 (IEEE 802.3) — tabellen byggs en gång.
const CRC_TABELL = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

export function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i += 1) c = CRC_TABELL[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

const tillBuffer = (data) => (Buffer.isBuffer(data) ? data : Buffer.from(String(data), 'utf8'));

/** Skriver en zip med posterna i given ordning. Alla poster deflateras. */
export function skrivZip(poster) {
  if (!Array.isArray(poster) || poster.length === 0) throw new Error('skrivZip: inga poster.');
  const lokala = [];
  const centrala = [];
  let offset = 0;
  for (const post of poster) {
    if (!post?.namn) throw new Error('skrivZip: en post saknar namn.');
    const namn = Buffer.from(post.namn, 'utf8');
    const data = tillBuffer(post.data ?? '');
    const packad = deflateRawSync(data);
    const crc = crc32(data);

    const lokal = Buffer.alloc(30);
    lokal.writeUInt32LE(SIG_LOKAL, 0);
    lokal.writeUInt16LE(VERSION, 4);   // version needed
    lokal.writeUInt16LE(0, 6);         // flaggor
    lokal.writeUInt16LE(METOD_DEFLATE, 8);
    lokal.writeUInt16LE(0, 10);        // tid (1980-00-00 00:00, som GemPages)
    lokal.writeUInt16LE(0, 12);        // datum
    lokal.writeUInt32LE(crc, 14);
    lokal.writeUInt32LE(packad.length, 18);
    lokal.writeUInt32LE(data.length, 22);
    lokal.writeUInt16LE(namn.length, 26);
    lokal.writeUInt16LE(0, 28);        // extra-fält
    lokala.push(lokal, namn, packad);

    const central = Buffer.alloc(46);
    central.writeUInt32LE(SIG_CENTRAL, 0);
    central.writeUInt16LE(VERSION, 4); // version made by
    central.writeUInt16LE(VERSION, 6); // version needed
    central.writeUInt16LE(0, 8);
    central.writeUInt16LE(METOD_DEFLATE, 10);
    central.writeUInt16LE(0, 12);
    central.writeUInt16LE(0, 14);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(packad.length, 20);
    central.writeUInt32LE(data.length, 24);
    central.writeUInt16LE(namn.length, 28);
    central.writeUInt16LE(0, 30);      // extra
    central.writeUInt16LE(0, 32);      // kommentar
    central.writeUInt16LE(0, 34);      // disk
    central.writeUInt16LE(0, 36);      // interna attribut
    central.writeUInt32LE(0, 38);      // externa attribut
    central.writeUInt32LE(offset, 42); // offset till lokalt huvud
    centrala.push(central, namn);

    offset += lokal.length + namn.length + packad.length;
  }
  const katalog = Buffer.concat(centrala);
  const slut = Buffer.alloc(22);
  slut.writeUInt32LE(SIG_SLUT, 0);
  slut.writeUInt16LE(0, 4);
  slut.writeUInt16LE(0, 6);
  slut.writeUInt16LE(poster.length, 8);
  slut.writeUInt16LE(poster.length, 10);
  slut.writeUInt32LE(katalog.length, 12);
  slut.writeUInt32LE(offset, 16);
  slut.writeUInt16LE(0, 20);
  return Buffer.concat([...lokala, katalog, slut]);
}

/** Läser en zip till Map<namn, Buffer>. Klarar lagrade (0) och deflaterade (8) poster. */
export function lasZip(buffer) {
  const buf = tillBuffer(buffer);
  // Hitta "end of central directory" bakifrån (kommentaren kan vara upp till 64 KiB).
  let slut = -1;
  for (let i = buf.length - 22; i >= Math.max(0, buf.length - 22 - 0xffff); i -= 1) {
    if (buf.readUInt32LE(i) === SIG_SLUT) { slut = i; break; }
  }
  if (slut < 0) throw new Error('lasZip: ingen zip-katalog hittades — är det verkligen en zip?');
  const antal = buf.readUInt16LE(slut + 10);
  let p = buf.readUInt32LE(slut + 16);
  const ut = new Map();
  for (let n = 0; n < antal; n += 1) {
    if (buf.readUInt32LE(p) !== SIG_CENTRAL) throw new Error(`lasZip: trasig katalogpost ${n}.`);
    const metod = buf.readUInt16LE(p + 10);
    const crc = buf.readUInt32LE(p + 16);
    const packadLangd = buf.readUInt32LE(p + 20);
    const langd = buf.readUInt32LE(p + 24);
    const namnLangd = buf.readUInt16LE(p + 28);
    const extraLangd = buf.readUInt16LE(p + 30);
    const kommentarLangd = buf.readUInt16LE(p + 32);
    const lokalOffset = buf.readUInt32LE(p + 42);
    const namn = buf.subarray(p + 46, p + 46 + namnLangd).toString('utf8');
    p += 46 + namnLangd + extraLangd + kommentarLangd;

    if (buf.readUInt32LE(lokalOffset) !== SIG_LOKAL) throw new Error(`lasZip: trasigt lokalt huvud för ${namn}.`);
    const lNamn = buf.readUInt16LE(lokalOffset + 26);
    const lExtra = buf.readUInt16LE(lokalOffset + 28);
    const start = lokalOffset + 30 + lNamn + lExtra;
    const rå = buf.subarray(start, start + packadLangd);
    let data;
    if (metod === METOD_DEFLATE) data = inflateRawSync(rå);
    else if (metod === 0) data = Buffer.from(rå);
    else throw new Error(`lasZip: ${namn} använder komprimering ${metod} — bara 0 och 8 stöds.`);
    if (data.length !== langd) throw new Error(`lasZip: ${namn} är ${data.length} byte, katalogen säger ${langd}.`);
    if (crc32(data) !== crc) throw new Error(`lasZip: CRC stämmer inte för ${namn}.`);
    ut.set(namn, data);
  }
  return ut;
}
