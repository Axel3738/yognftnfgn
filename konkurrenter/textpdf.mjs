// konkurrenter/textpdf.mjs — en liten PDF-skrivare för fakturan (2026-09-29).
//
// Chromiums PDF bäddar in typsnittet en gång PER SIDA: ORVO-fakturan med 24
// rader vägde 72 kB på tre sidor. Bilagan går som base64 i Gmail-connectorns
// verktygsanrop (~97 000 tecken), och där ryms den inte säkert — ett tecken fel
// i avskriften och PDF:en går sönder hos mottagaren. Här används PDF:ens
// standardtypsnitt Helvetica och Helvetica-Bold, som varje PDF-läsare har
// inbyggda (inget bäddas in), och sidornas innehåll komprimeras med zlib:
// samma faktura blir några kB.
//
// Bredderna nedan är avlästa ur Liberation Sans (Regular/Bold), som har samma
// mått som Helvetica och Arial, för WinAnsi-koderna 32–255. Tecken utanför
// WinAnsi blir "?" — fakturans texter är svenska/engelska och ryms.
// Inga npm-beroenden.

import { deflateSync } from 'node:zlib';

// Glyfbredder i tusendels em för koderna 32..255 (WinAnsiEncoding).
const BREDD = {
  vanlig: [278,278,355,556,556,889,667,191,333,333,389,584,278,333,278,278,556,556,556,556,556,556,556,556,556,556,278,278,584,584,584,556,1015,667,667,722,722,667,611,778,722,278,500,667,556,833,722,778,667,778,722,667,611,722,667,944,667,667,611,278,278,278,469,556,333,556,556,500,556,556,278,556,556,222,222,500,222,833,556,556,556,556,333,500,278,556,500,722,500,500,500,334,260,334,584,0,556,0,222,556,333,1000,556,556,333,1000,667,333,1000,0,611,0,0,222,222,333,333,350,556,1000,333,1000,500,333,944,0,500,667,278,333,556,556,556,556,260,556,333,737,370,556,584,333,737,552,400,549,333,333,333,576,537,333,333,333,365,556,834,834,834,611,667,667,667,667,667,667,1000,722,667,667,667,667,278,278,278,278,722,722,778,778,778,778,778,584,778,722,722,722,722,667,667,611,556,556,556,556,556,556,889,500,556,556,556,556,278,278,278,278,556,556,556,556,556,556,556,549,611,556,556,556,556,500,556,500],
  fet: [278,333,474,556,556,889,722,238,333,333,389,584,278,333,278,278,556,556,556,556,556,556,556,556,556,556,333,333,584,584,584,611,975,722,722,722,722,667,611,778,722,278,556,722,611,833,722,778,667,778,722,667,611,722,667,944,667,667,611,333,278,333,584,556,333,556,611,556,611,556,333,611,611,278,278,556,278,889,611,611,611,611,389,556,333,611,556,778,556,556,500,389,280,389,584,0,556,0,278,556,500,1000,556,556,333,1000,667,333,1000,0,611,0,0,278,278,500,500,350,556,1000,333,1000,556,333,944,0,500,667,278,333,556,556,556,556,280,556,333,737,370,556,584,333,737,552,400,549,333,333,333,576,556,333,333,333,365,556,834,834,834,611,722,722,722,722,722,722,1000,722,667,667,667,667,278,278,278,278,722,722,778,778,778,778,778,584,778,722,722,722,722,667,667,611,556,556,556,556,556,556,889,556,556,556,556,556,278,278,278,278,611,611,611,611,611,611,611,549,611,611,611,611,611,556,611,556],
};

// Unicode → WinAnsi för koderna 0x80–0x9F (resten av 0xA0–0xFF är Latin-1 rakt av).
const CP1252 = new Map([[0x20AC, 0x80], [0x201A, 0x82], [0x0192, 0x83], [0x201E, 0x84], [0x2026, 0x85], [0x2020, 0x86], [0x2021, 0x87], [0x02C6, 0x88], [0x2030, 0x89], [0x0160, 0x8A], [0x2039, 0x8B], [0x0152, 0x8C], [0x017D, 0x8E], [0x2018, 0x91], [0x2019, 0x92], [0x201C, 0x93], [0x201D, 0x94], [0x2022, 0x95], [0x2013, 0x96], [0x2014, 0x97], [0x02DC, 0x98], [0x2122, 0x99], [0x0161, 0x9A], [0x203A, 0x9B], [0x0153, 0x9C], [0x017E, 0x9E], [0x0178, 0x9F]]);
const SMALA_MELLANSLAG = new Set([0x2007, 0x2009, 0x200A, 0x202F]);
// Tecken som saknas i WinAnsi men har en självklar ersättning (brevets "←" blev "?", mätt 2026-09-29).
const ERSATT = new Map([[0x2190, '<-'], [0x2192, '->'], [0x2194, '<->'], [0x21D2, '=>'], [0x2212, '-'], [0x2010, '-'], [0x2011, '-'], [0x2713, 'v'], [0x2714, 'v']]);

/** Text → WinAnsi-koder. Tecken utanför WinAnsi får en ersättning ur ERSATT, annars "?". Ren. */
export function winAnsi(text) {
  const ut = [];
  for (const t of String(text ?? '')) {
    const cp = t.codePointAt(0);
    if (ERSATT.has(cp)) { for (const c of ERSATT.get(cp)) ut.push(c.charCodeAt(0)); continue; }
    if (cp === 0x09 || cp === 0x0A || cp === 0x0D) ut.push(0x20);
    else if (cp >= 0x20 && cp < 0x7F) ut.push(cp);
    else if (cp >= 0xA0 && cp <= 0xFF) ut.push(cp);
    else if (CP1252.has(cp)) ut.push(CP1252.get(cp));
    else if (SMALA_MELLANSLAG.has(cp)) ut.push(0xA0);
    else ut.push(0x3F);
  }
  return ut;
}

/** Bredden i punkter för en text i storlek `storlek`, med teckenavstånd `sparr` (pt per tecken). Ren. */
export function textbredd(text, storlek, { fet = false, sparr = 0 } = {}) {
  const b = BREDD[fet ? 'fet' : 'vanlig'];
  const koder = winAnsi(text);
  return koder.reduce((s, k) => s + (b[k - 32] ?? 556), 0) * storlek / 1000 + sparr * koder.length;
}

/**
 * Radbryter en text till rader som ryms i `bredd` punkter. Mellanslag mellan
 * siffergrupper ("3 364", "2 516 kr") bryts aldrig; ett ord som ensamt är för
 * brett (en länk) bryts där det tar slut. Ren.
 */
export function radbryt(text, bredd, storlek, { fet = false } = {}) {
  const hel = String(text ?? '').replace(/(\d) (?=\d{3}\b)/g, '$1 ').replace(/ (kr|SEK|%)\b/g, ' $1');
  const ord = hel.split(/ +/).filter((o) => o !== '');
  const rader = []; let rad = '';
  const passar = (t) => textbredd(t.replace(/ /g, ' '), storlek, { fet }) <= bredd;
  for (const o of ord) {
    const prov = rad ? `${rad} ${o}` : o;
    if (passar(prov)) { rad = prov; continue; }
    if (rad) rader.push(rad);
    if (passar(o)) { rad = o; continue; }
    // För långt ord (en länk): bryt tecken för tecken, helst efter / ? & = -
    let rest = o;
    while (!passar(rest)) {
      let n = rest.length;
      while (n > 1 && !passar(rest.slice(0, n))) n--;
      const brytbar = rest.slice(0, n).search(/[/?&=\-.][^/?&=\-.]*$/);
      const snitt = brytbar > n * 0.5 ? brytbar + 1 : n;
      rader.push(rest.slice(0, snitt)); rest = rest.slice(snitt);
    }
    rad = rest;
  }
  if (rad) rader.push(rad);
  return rader.map((r) => r.replace(/ /g, ' '));
}

const tal = (n) => Number(n.toFixed(2)).toString();
const farg = (hex) => { const h = String(hex).replace('#', ''); const v = h.length === 3 ? h.split('').map((c) => c + c).join('') : h; return [0, 2, 4].map((i) => tal(parseInt(v.slice(i, i + 2), 16) / 255)).join(' '); };
const pdfStrang = (koder) => `(${koder.map((k) => (k === 0x28 || k === 0x29 || k === 0x5C ? `\\${String.fromCharCode(k)}` : k < 0x20 || k > 0x7E ? `\\${k.toString(8).padStart(3, '0')}` : String.fromCharCode(k))).join('')})`;

/**
 * En A4-PDF med text, linjer och fyllda rutor. Koordinaterna är i punkter
 * UPPIFRÅN (y = 0 överst), som i en webbsida; omräkningen görs här.
 */
export class TextPdf {
  constructor({ bredd = 595.28, hojd = 841.89 } = {}) { this.bredd = bredd; this.hojd = hojd; this.sidor = []; this.lankar = []; this.nySida(); }
  nySida() { this.ops = []; this.sidor.push(this.ops); this.lankar.push([]); return this; }
  /** En klickbar länk (URI) över rutan x, y (överkant), b, h på den aktuella sidan. */
  lank(x, y, b, h, uri) {
    const sida = this.sidor.indexOf(this.ops);
    if (sida >= 0 && /^https?:\/\//.test(uri)) this.lankar[sida].push({ x, y, b, h, uri });
    return this;
  }
  get sida() { return this.sidor.length; }
  /** Text med baslinjen på y. `justera`: 'vanster' | 'hoger' (x är då högerkanten). */
  text(x, y, text, { storlek = 10, fet = false, farg: f = '#151a21', sparr = 0, justera = 'vanster' } = {}) {
    const koder = winAnsi(text);
    if (!koder.length) return this;
    const x0 = justera === 'hoger' ? x - textbredd(text, storlek, { fet, sparr }) + sparr : x;
    this.ops.push(`BT /${fet ? 'F2' : 'F1'} ${tal(storlek)} Tf ${farg(f)} rg ${sparr ? `${tal(sparr)} Tc ` : ''}1 0 0 1 ${tal(x0)} ${tal(this.hojd - y)} Tm ${pdfStrang(koder)} Tj${sparr ? ' 0 Tc' : ''} ET`);
    return this;
  }
  linje(x1, y1, x2, y2, { tjocklek = 1, farg: f = '#151a21' } = {}) {
    this.ops.push(`${tal(tjocklek)} w ${farg(f)} RG ${tal(x1)} ${tal(this.hojd - y1)} m ${tal(x2)} ${tal(this.hojd - y2)} l S`);
    return this;
  }
  ruta(x, y, b, h, { farg: f = '#f2f4f1' } = {}) {
    this.ops.push(`${farg(f)} rg ${tal(x)} ${tal(this.hojd - y - h)} ${tal(b)} ${tal(h)} re f`);
    return this;
  }
  /** PDF:en som Buffer. `titel` hamnar i dokumentets egenskaper. */
  bytes({ titel = '', skapad = new Date() } = {}) {
    const objekt = [];
    const nytt = (innehall) => { objekt.push(innehall); return objekt.length; };
    const katalog = nytt(null); const sidorNr = nytt(null);
    const f1 = nytt(Buffer.from('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>', 'latin1'));
    const f2 = nytt(Buffer.from('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>', 'latin1'));
    const d = skapad.toISOString().replace(/[-:T]/g, '').slice(0, 14);
    const info = nytt(Buffer.from(`<< /Title ${pdfStrang(winAnsi(titel))} /Producer (konkurrenter/textpdf.mjs) /CreationDate (D:${d}Z) >>`, 'latin1'));
    const kids = [];
    this.sidor.forEach((ops, i) => {
      const data = deflateSync(Buffer.from(ops.join('\n'), 'latin1'), { level: 9 });
      const strom = nytt(Buffer.concat([Buffer.from(`<< /Length ${data.length} /Filter /FlateDecode >>\nstream\n`, 'latin1'), data, Buffer.from('\nendstream', 'latin1')]));
      const annots = (this.lankar[i] ?? []).map((l) => nytt(Buffer.from(`<< /Type /Annot /Subtype /Link /Rect [${tal(l.x)} ${tal(this.hojd - l.y - l.h)} ${tal(l.x + l.b)} ${tal(this.hojd - l.y)}] /Border [0 0 0] /A << /S /URI /URI ${pdfStrang(winAnsi(l.uri))} >> >>`, 'latin1')));
      kids.push(nytt(Buffer.from(`<< /Type /Page /Parent ${sidorNr} 0 R /MediaBox [0 0 ${tal(this.bredd)} ${tal(this.hojd)}] /Resources << /Font << /F1 ${f1} 0 R /F2 ${f2} 0 R >> >> /Contents ${strom} 0 R${annots.length ? ` /Annots [${annots.map((n) => `${n} 0 R`).join(' ')}]` : ''} >>`, 'latin1')));
    });
    objekt[katalog - 1] = Buffer.from(`<< /Type /Catalog /Pages ${sidorNr} 0 R >>`, 'latin1');
    objekt[sidorNr - 1] = Buffer.from(`<< /Type /Pages /Kids [${kids.map((k) => `${k} 0 R`).join(' ')}] /Count ${kids.length} >>`, 'latin1');
    const delar = [Buffer.from('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n', 'latin1')];
    let pos = delar[0].length; const offset = [];
    objekt.forEach((o, i) => {
      offset.push(pos);
      const b = Buffer.concat([Buffer.from(`${i + 1} 0 obj\n`, 'latin1'), o, Buffer.from('\nendobj\n', 'latin1')]);
      delar.push(b); pos += b.length;
    });
    const xref = [`xref\n0 ${objekt.length + 1}\n0000000000 65535 f \n`, ...offset.map((o) => `${String(o).padStart(10, '0')} 00000 n \n`)].join('');
    delar.push(Buffer.from(`${xref}trailer\n<< /Size ${objekt.length + 1} /Root ${katalog} 0 R /Info ${info} 0 R >>\nstartxref\n${pos}\n%%EOF\n`, 'latin1'));
    return Buffer.concat(delar);
  }
}
