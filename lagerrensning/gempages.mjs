// gempages.mjs — ren logik för att göra en ny lagerrensningssida ur mallen.
//
// Mallen är GemPages-exporten av "Motorhölje – Lagerrensning (listicle)"
// (lagerrensning/mall/sida.json, orörd). Platskartan (mall/platser.json) säger
// vilka element som byts. Den här modulen rör aldrig nätet — den läser mall +
// copy + bildlista och svarar med en färdig sida och en .gempages-zip.
//
// Tre saker om formatet, alla MÄTTA 2026-09-16 på exporten (testerna bevisar dem):
//
// 1. Varje sektions `component` är en JSON-STRÄNG serialiserad av Go
//    (encoding/json): nycklar i bytesordning, inga mellanslag, och `<`, `>`,
//    `&` skrivna som \u003c \u003e \u0026. `goJson()` skriver exakt så — alla
//    tio sektioner i mallen går runt tecken för tecken.
// 2. `checksum` = sha256( themePageID + component ). Ändrar man en text utan
//    att räkna om den kan importen mycket väl avvisa sektionen.
// 3. Id:n är 18-siffriga heltal. JavaScript tappar precision över 2^53, så
//    filen läses med `lasJson` (som taggar stora tal som strängar) och skrivs
//    med `skrivJson` (som tar bort taggen). Läs den ALDRIG med JSON.parse rakt av.

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { createHash, randomInt } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { skrivZip, lasZip } from './zip.mjs';

const HAR = dirname(fileURLToPath(import.meta.url));
export const MALL_MAPP = join(HAR, 'mall');
export const MALL_FIL = join(MALL_MAPP, 'sida.json');
export const PLATSER_FIL = join(MALL_MAPP, 'platser.json');
export const MANIFEST_FIL = join(MALL_MAPP, 'manifest.json');
export const BRAND_MAPP = join(HAR, 'brand');

// ------------------------------------------------------------ brand

// Sidan är OBRANDAD som standard (Axels beslut 2026-09-16: "jag hade verkligen
// uppskattat om listiclen är obrandad så att den funkar om en annan sida skulle
// publicera den också och köra samma produkt"). Mallen bär Bäverbutiken på tre
// ställen — författarraden, sidfotens logga och kontaktraden — och alla tre
// styrs av en brandprofil. Utan profil: "Anders på lagret", loggan och strecket
// döljs, kontaktraden blir bara "OBS: Detta är reklam." Med `--brand
// baverbutiken` (lagerrensning/brand/baverbutiken.json) blir sidan exakt som
// mallen igen. Lagerbilden i ärlig-blocket visar anonyma kartonger (tittad
// 2026-09-16) och behöver inte bytas.

export const OBRANDAD = Object.freeze({ id: null, namn: null, forfattare: 'Anders på lagret', support: null, doman: null, logga: null });

/** Brandprofilerna som finns: filnamnen i lagerrensning/brand/ utan .json. */
export function kandaBrand() {
  if (!existsSync(BRAND_MAPP)) return [];
  return readdirSync(BRAND_MAPP).filter((f) => f.endsWith('.json')).map((f) => f.slice(0, -5)).sort();
}

/** null/undefined → obrandad; "baverbutiken" → brand/baverbutiken.json; ett objekt → kontrollerat som det är. */
export function brandProfil(brand) {
  if (!brand) return { ...OBRANDAD };
  // En redan upplöst obrandad profil (t.ex. från bygg.mjs) går igenom oförändrad.
  if (typeof brand === 'object' && brand.namn == null && brand.id == null && brand.forfattare === OBRANDAD.forfattare && !brand.logga && !brand.support && !brand.doman) return { ...OBRANDAD };
  let p = brand;
  if (typeof brand === 'string') {
    const fil = join(BRAND_MAPP, `${brand}.json`);
    if (!/^[a-z0-9-]+$/.test(brand) || !existsSync(fil)) throw new Error(`Okänt brand "${brand}" — profiler: ${kandaBrand().join(', ') || 'inga'} (lagerrensning/brand/<id>.json).`);
    p = { id: brand, ...JSON.parse(readFileSync(fil, 'utf8')) };
  }
  if (!p.namn) throw new Error('Brandprofilen saknar "namn".');
  if (p.logga && !(p.logga.src && p.logga.width > 0 && p.logga.height > 0)) throw new Error(`Brandprofilen ${p.id ?? p.namn}: loggan behöver src, width och height.`);
  return {
    id: p.id ?? null, namn: String(p.namn), forfattare: p.forfattare ? String(p.forfattare) : `Anders från ${p.namn}`,
    support: p.support ? String(p.support) : null, doman: p.doman ? String(p.doman) : null,
    logga: p.logga ? { src: p.logga.src, width: p.logga.width, height: p.logga.height } : null,
  };
}

/** Ord som avslöjar ett brand i copyn: namnet (även utan å/ä/ö) och domänen. */
export function brandOrd(b) {
  const ut = new Set();
  for (const s of [b?.namn, b?.doman]) {
    if (!s) continue;
    const l = String(s).toLowerCase();
    ut.add(l);
    ut.add(l.replace(/å|ä/g, 'a').replace(/ö/g, 'o'));
  }
  return [...ut];
}

/** Författarraden i hero: samma HTML som mallen bär. */
export function forfattarHtml(b) {
  return `<p>Av <strong>${htmlAv(b.forfattare)}.</strong></p>`;
}

/** Sidfotens kontaktrad: mejl + domän + reklammärkning, eller bara märkningen när sidan är obrandad. */
export function sidfotHtml(b) {
  const rader = [];
  if (b.support) rader.push(`<a href="mailto:${htmlAv(b.support)}">${htmlAv(b.support)}</a>`);
  if (b.doman) rader.push(htmlAv(b.doman));
  rader.push('OBS: Detta är reklam.');
  return `<p>${rader.length > 1 ? '<br>' : ''}${rader.join('<br>')}</p>`;
}

// ------------------------------------------------------------ stora tal

const TAGG = '__stort_tal__:';

/** Taggar heltal med ≥16 siffror UTANFÖR strängar som "__stort_tal__:NNN" så JSON.parse inte rundar dem. */
export function taggaStoraTal(text) {
  const s = String(text);
  let ut = '';
  let i = 0;
  let iStrang = false;
  while (i < s.length) {
    const c = s[i];
    if (iStrang) {
      ut += c;
      if (c === '\\') { ut += s[i + 1] ?? ''; i += 2; continue; }
      if (c === '"') iStrang = false;
      i += 1;
      continue;
    }
    if (c === '"') { iStrang = true; ut += c; i += 1; continue; }
    if (c === '-' || (c >= '0' && c <= '9')) {
      const m = /^-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/.exec(s.slice(i, i + 64));
      if (m) {
        const tok = m[0];
        ut += /^-?\d{16,}$/.test(tok) ? `"${TAGG}${tok}"` : tok;
        i += tok.length;
        continue;
      }
    }
    ut += c;
    i += 1;
  }
  return ut;
}

export function avtaggaStoraTal(text) {
  return String(text).replace(/"__stort_tal__:(-?\d+)"/g, '$1');
}

export const lasJson = (text) => JSON.parse(taggaStoraTal(text));
export const skrivJson = (obj, indrag) => avtaggaStoraTal(JSON.stringify(obj, null, indrag));
export const arStortTal = (v) => typeof v === 'string' && v.startsWith(TAGG);
/** Siffrorna i ett (ev. taggat) tal, som sträng. */
export const talText = (v) => (arStortTal(v) ? v.slice(TAGG.length) : String(v));
export const somStortTal = (siffror) => `${TAGG}${siffror}`;

// ------------------------------------------------------------ Go-JSON + checksum

function goStrang(s) {
  return JSON.stringify(String(s)).replace(new RegExp('[<>&' + String.fromCharCode(0x2028, 0x2029) + ']', 'g'), (c) => `\\u${c.charCodeAt(0).toString(16).padStart(4, '0')}`);
}

/** Serialiserar som Go:s encoding/json: sorterade nycklar, kompakt, HTML-tecken escapade. */
export function goJson(v) {
  if (v === null || v === undefined) return 'null';
  if (typeof v === 'string') return goStrang(v);
  if (typeof v === 'number') return Number.isFinite(v) ? String(v) : 'null';
  if (typeof v === 'boolean') return v ? 'true' : 'false';
  if (Array.isArray(v)) return `[${v.map(goJson).join(',')}]`;
  const nycklar = Object.keys(v).sort();
  return `{${nycklar.map((k) => `${goStrang(k)}:${goJson(v[k])}`).join(',')}}`;
}

export function checksum(themePageID, component) {
  return createHash('sha256').update(talText(themePageID) + String(component)).digest('hex');
}

// ------------------------------------------------------------ mall + platser

export function lasMall({ mallFil = MALL_FIL, platserFil = PLATSER_FIL, manifestFil = MANIFEST_FIL } = {}) {
  const mall = lasJson(readFileSync(mallFil, 'utf8'));
  const platser = JSON.parse(readFileSync(platserFil, 'utf8'));
  const manifest = readFileSync(manifestFil, 'utf8');
  return { mall, platser, manifest };
}

/** Alla element (objekt med tag + uid) i ett komponentträd, i dokumentordning. */
export function allaElement(o, acc = []) {
  if (Array.isArray(o)) { for (const x of o) allaElement(x, acc); return acc; }
  if (!o || typeof o !== 'object') return acc;
  if (o.tag && o.uid) acc.push(o);
  for (const v of Object.values(o)) if (v && typeof v === 'object') allaElement(v, acc);
  return acc;
}

const MANADER = ['januari', 'februari', 'mars', 'april', 'maj', 'juni', 'juli', 'augusti', 'september', 'oktober', 'november', 'december'];

/** "2026-09-16" → "16 september 2026". */
export function svensktDatum(iso) {
  const [y, m, d] = String(iso).slice(0, 10).split('-').map(Number);
  if (!y || !m || !d) throw new Error(`Ogiltigt datum "${iso}" — skriv YYYY-MM-DD.`);
  return `${d} ${MANADER[m - 1]} ${y}`;
}

export const idag = () => new Date().toISOString().slice(0, 10);

// ------------------------------------------------------------ text ↔ html

/** Escapar HTML och gör **fet** till <strong>. Det är ALL formatering copyn får bära. */
export function htmlAv(text) {
  return String(text ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
}

/** Stycken ur en sträng (tom rad emellan) eller en lista. */
export function styckenAv(v) {
  const lista = Array.isArray(v) ? v : String(v ?? '').split(/\n{2,}/);
  return lista.map((s) => String(s ?? '').trim()).filter(Boolean);
}

/** Textens HTML enligt platsens form. */
export function renderaText(form, varde) {
  switch (form) {
    case 'ren':
      return htmlAv(styckenAv(varde).join(' '));
    case 'p':
    case 'p-flera':
      return styckenAv(varde).map((s) => `<p>${htmlAv(s)}</p>`).join('<p>&nbsp;</p>');
    case 'knapp':
      return `<p>${htmlAv(styckenAv(varde).join(' '))}</p>`;
    case 'sammanfattning': {
      const st = styckenAv(varde).map((s) => s.replace(/^\**\s*Sammanfattning:\s*\**\s*/i, ''));
      if (st.length === 0) return '';
      const [a, ...rest] = st;
      const b = rest.join(' ');
      if (!b) return `<p><span style="color:#000000;"><strong>Sammanfattning:</strong> ${htmlAv(a)}</span></p>`;
      return `<p><span style="color:#000000;"><strong>Sammanfattning:</strong> ${htmlAv(a)}&nbsp;</span><br><span style="color:#000000;">${htmlAv(b)}</span></p>`;
    }
    default:
      throw new Error(`Okänd textform "${form}" i platskartan.`);
  }
}

const avHtml = (s) =>
  String(s ?? '')
    .replace(/<strong>([\s\S]*?)<\/strong>/g, '**$1**')
    .replace(/<br\s*\/?>/g, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&amp;/g, '&')
    .trim();

/** Baklänges: mallens HTML → copyns form. Används för exempelfilen och rundturstestet. */
export function textUrHtml(form, html) {
  const h = String(html ?? '');
  if (form === 'sammanfattning') {
    const spans = [...h.matchAll(/<span[^>]*>([\s\S]*?)<\/span>/g)].map((m) => avHtml(m[1]).replace(/^\*\*Sammanfattning:\*\*\s*/, ''));
    return spans.length ? spans : [avHtml(h)];
  }
  if (form === 'p' || form === 'p-flera') {
    const st = h.split(/<p>&nbsp;<\/p>/).map(avHtml).filter(Boolean);
    return st.length > 1 ? st : st[0] ?? '';
  }
  return avHtml(h);
}

// ------------------------------------------------------------ copy-objektet

/** "punkt3.text" → copy.punkter[2].text, "hero.rubrik" → copy.hero.rubrik. */
export function lasCopy(copy, nyckel) {
  const [del, falt] = String(nyckel).split('.');
  const p = /^punkt(\d+)$/.exec(del);
  if (p) return copy?.punkter?.[Number(p[1]) - 1]?.[falt];
  return copy?.[del]?.[falt];
}

export function sattCopy(copy, nyckel, varde) {
  const [del, falt] = String(nyckel).split('.');
  const p = /^punkt(\d+)$/.exec(del);
  if (p) {
    copy.punkter = copy.punkter ?? [];
    const i = Number(p[1]) - 1;
    copy.punkter[i] = copy.punkter[i] ?? {};
    copy.punkter[i][falt] = varde;
  } else {
    copy[del] = copy[del] ?? {};
    copy[del][falt] = varde;
  }
  return copy;
}

/** Copyn som mallen bär i dag — facit-formen som subagenten får som exempel. */
export function copyUrMall(mall, platser) {
  const copy = {};
  const perCid = new Map(mall.pageSections.map((s) => [s.cid, JSON.parse(s.component)]));
  for (const [nyckel, plats] of Object.entries(platser.text)) {
    const el = allaElement(perCid.get(plats.cid)).find((e) => e.uid === plats.uid);
    if (!el) throw new Error(`Platskartan: ${plats.uid} finns inte i ${plats.cid}.`);
    sattCopy(copy, nyckel, textUrHtml(plats.form, el.settings?.text));
  }
  return copy;
}

// ------------------------------------------------------------ granskning

export const FORBJUDNA_FRASER = ['innan lagret tar slut', 'innan det tar slut', 'sista chansen'];

/** Alla priser i en text: "299 kr", "1 129 kr", "367:-" → [299, 1129, 367]. */
export function priserI(text) {
  const ut = [];
  for (const m of String(text ?? '').matchAll(/(\d[\d   ]*(?:[.,]\d{1,2})?)\s?(?:kr\b|:-)/gi)) {
    const n = Number(m[1].replace(/[   ]/g, '').replace(',', '.'));
    if (Number.isFinite(n)) ut.push(n);
  }
  return ut;
}

/**
 * Fel stoppar bygget; varningar visas. Priser, procent, HTML, förbjudna fraser —
 * och brandnamn: en obrandad sida får inte nämna någon känd butik i copyn
 * (skriv "vi"/"hos oss"), en brandad får nämna sitt eget brand.
 *
 *   granskaCopy(copy, produkt, platser, { brand: null | 'baverbutiken' | profil, forbjudnaBrand: [profiler] })
 */
export function granskaCopy(copy, produkt, platser, { brand = null, forbjudnaBrand = null } = {}) {
  const fel = [];
  const varningar = [];
  const tillatna = [produkt.pris, produkt.jamforpris].filter((x) => x != null && Number.isFinite(Number(x))).map(Number);
  const nyckelText = (v) => (Array.isArray(v) ? v.join('\n') : String(v ?? ''));
  const b = brandProfil(brand);
  const egnaOrd = new Set(brandOrd(b));
  const stoppord = (forbjudnaBrand ?? kandaBrand().map((id) => brandProfil(id)))
    .flatMap((p) => brandOrd(p).map((ord) => ({ ord, namn: p.namn, id: p.id })))
    .filter((x) => !egnaOrd.has(x.ord));

  for (const [nyckel, plats] of Object.entries(platser.text)) {
    const v = lasCopy(copy, nyckel);
    const tom = v == null || (typeof v === 'string' && !v.trim()) || (Array.isArray(v) && styckenAv(v).length === 0);
    if (tom) { fel.push(`${nyckel}: saknas i copyn`); continue; }
    const text = nyckelText(v);
    if (/<[a-z/!]/i.test(text)) fel.push(`${nyckel}: innehåller HTML — skriv **fet** i stället för taggar`);
    const traff = stoppord.find((x) => text.toLowerCase().includes(x.ord));
    if (traff) fel.push(`${nyckel}: nämner "${traff.namn}" — sidan är ${b.namn ? `brandad som ${b.namn}` : 'obrandad och ska funka i vilken butik som helst'}; skriv "vi"/"hos oss"${traff.id && !b.namn ? ` (eller bygg med --brand ${traff.id})` : ''}`);
    for (const p of priserI(text)) {
      if (!tillatna.includes(p)) fel.push(`${nyckel}: priset ${p} kr finns inte på produktsidan (tillåtet: ${tillatna.map((t) => `${t} kr`).join(' / ') || 'inget'})`);
    }
    if (/\d\s?%/.test(text)) fel.push(`${nyckel}: procentsats — sidan lovar "ingen påhittad jätterabatt", skriv kronor`);
    for (const f of FORBJUDNA_FRASER) if (text.toLowerCase().includes(f)) fel.push(`${nyckel}: "${f}" är förbjuden — skriv "så länge lagret räcker"`);
    if (plats.form === 'ren' && text.length > 180) varningar.push(`${nyckel}: rubriken är ${text.length} tecken — lång för en rubrik`);
    if ((plats.form === 'p' || plats.form === 'p-flera') && text.length < 120) varningar.push(`${nyckel}: bara ${text.length} tecken — mallens stycken är 400–900`);
  }

  if (!Array.isArray(copy?.punkter) || copy.punkter.length !== 5) fel.push(`punkter: ska vara exakt 5, är ${Array.isArray(copy?.punkter) ? copy.punkter.length : 0}`);
  const rubrik = String(copy?.hero?.rubrik ?? '');
  const rubrikPriser = priserI(rubrik);
  if (produkt.pris != null && !rubrikPriser.includes(Number(produkt.pris))) varningar.push(`hero.rubrik nämner inte priset ${produkt.prisText ?? produkt.pris}`);
  if (produkt.jamforpris != null && !rubrikPriser.includes(Number(produkt.jamforpris))) varningar.push(`hero.rubrik nämner inte jämförpriset ${produkt.jamforprisText ?? produkt.jamforpris}`);

  const tf = copy?.tre_fragor;
  if (!Array.isArray(tf) || tf.length === 0) varningar.push('tre_fragor saknas — tre-frågorstestet ska redovisas (docs/copy-regler.md)');
  else {
    const nej = tf.filter((t) => [t?.visualisera, t?.falsifiera, t?.ingen_annan_kan_saga].some((x) => String(x ?? '').trim().startsWith('❌')));
    if (nej.length) varningar.push(`${nej.length} rad(er) med ❌ i tre-frågorstestet: ${nej.map((t) => `"${t.rad}"`).join(', ')}`);
  }
  return { fel, varningar };
}

// ------------------------------------------------------------ bygget

function sattBild(el, { src, width, height }) {
  const st = el.settings ?? (el.settings = {});
  st.image = { ...(st.image ?? {}), src, width, height };
  if (st.srcSet && typeof st.srcSet === 'object') {
    for (const k of Object.keys(st.srcSet)) st.srcSet[k] = { ...(st.srcSet[k] ?? {}), src, width, height };
  }
}

/** Visar/döljer ett element på alla tre skärmstorlekar — GemPages egen mekanism (`advanced.d`), samma som mobil-/desktopbilderna använder. */
function visaElement(el, synlig) {
  el.advanced = el.advanced ?? {};
  el.advanced.d = { desktop: !!synlig, mobile: !!synlig, tablet: !!synlig };
}

/** Nytt 18-siffrigt id i samma stil som GemPages egna. */
export function nyttId() {
  let s = '63';
  while (s.length < 18) s += String(randomInt(0, 10));
  return somStortTal(s);
}

/** Byter alla id:n på sidan (sida, sektioner, meta) och håller referenserna ihop. */
export function bytIdn(sida, { nytt = nyttId } = {}) {
  const karta = new Map();
  const byt = (v) => {
    const k = talText(v);
    if (!karta.has(k)) karta.set(k, nytt());
    return karta.get(k);
  };
  sida.id = byt(sida.id);
  for (const s of sida.pageSections ?? []) { s.id = byt(s.id); s.themePageID = sida.id; }
  for (const m of sida.meta ?? []) { m.id = byt(m.id); m.themePageID = sida.id; }
  sida.sectionPosition = (sida.sectionPosition ?? []).map((p) => talText(byt(p)));
  return sida;
}

/**
 * Sidan för en ny produkt. Rör inte mallen (klonar). Kastar på allt som
 * saknas — hellre stopp än en sida med motorhöljets text kvar i ett hörn.
 *
 *   byggSida({ mall, platser, produkt: { url, kortTitel, slug }, copy, bilder: { punkt1: { src, width, height } … },
 *              datum: 'YYYY-MM-DD', brand: null | 'baverbutiken' | profil, nyaIdn: false, nu: ISO-tid })
 *   → { sida, rapport }
 *
 * `brand` utelämnat = obrandad sida (standard). Knapparna pekar på produkt.url —
 * för en annan butik skickar anroparen den butikens produktlänk som url.
 */
export function byggSida({ mall, platser, produkt, copy, bilder = {}, datum = idag(), brand = null, nyaIdn = false, nu = new Date().toISOString() }) {
  if (!produkt?.url || !produkt?.kortTitel || !produkt?.slug) throw new Error('byggSida: produkten behöver url, kortTitel och slug.');
  const b = brandProfil(brand);
  const sida = structuredClone(mall);
  const rapport = { texter: [], bilder: [], lankar: 0, namn: null, handle: null, brand: { id: b.id, namn: b.namn, forfattare: b.forfattare, logga: !!b.logga } };
  const alla = (sida.pageSections ?? []).map((s) => ({ s, c: JSON.parse(s.component) }));
  const perCid = new Map(alla.map(({ s, c }) => [s.cid, c]));
  const element = (cid, uid, tag = null) => {
    const c = perCid.get(cid);
    if (!c) throw new Error(`Platskartan pekar på sektion ${cid} som inte finns i mallen.`);
    const tr = allaElement(c).filter((e) => e.uid === uid && (!tag || e.tag === tag));
    if (tr.length === 0) throw new Error(`Elementet ${uid}${tag ? ` (${tag})` : ''} finns inte i sektion ${cid}.`);
    return tr;
  };

  // Texterna.
  for (const [nyckel, plats] of Object.entries(platser.text)) {
    const varde = lasCopy(copy, nyckel);
    if (varde == null || styckenAv(varde).length === 0) throw new Error(`Copyn saknar "${nyckel}".`);
    const html = renderaText(plats.form, varde);
    for (const el of element(plats.cid, plats.uid)) {
      el.settings = el.settings ?? {};
      el.settings.text = html;
      if (plats.form === 'knapp') el.settings.label = html;
    }
    rapport.texter.push({ nyckel, tecken: html.length });
  }

  // Datumraden.
  const d = platser.fasta?.['hero.datum'];
  if (d) for (const el of element(d.cid, d.uid)) el.settings.text = `<p>Senast uppdaterad ${svensktDatum(datum)}.</p>`;

  // Brandet: författarraden, sidfotens kontaktrad, loggan + strecket bredvid.
  const f = platser.fasta?.['hero.forfattare'];
  if (!f) throw new Error('Platskartan saknar fasta["hero.forfattare"].');
  for (const el of element(f.cid, f.uid)) el.settings.text = forfattarHtml(b);
  const k = platser.fasta?.['sidfot.text'];
  if (!k) throw new Error('Platskartan saknar fasta["sidfot.text"].');
  for (const el of element(k.cid, k.uid)) el.settings.text = sidfotHtml(b);
  const logga = platser.bilder?.sidfot;
  if (!logga) throw new Error('Platskartan saknar bilder.sidfot (loggan).');
  for (const uid of logga.uids) for (const el of element(logga.cid, uid, 'Image')) {
    if (b.logga) sattBild(el, b.logga);
    visaElement(el, !!b.logga);
  }
  const streck = platser.fasta?.['sidfot.streck'];
  if (streck) for (const el of element(streck.cid, streck.uid)) visaElement(el, !!b.logga);

  // Alla knappar → produktsidan.
  for (const uid of platser.knappar ?? []) {
    const tr = alla.flatMap(({ c }) => allaElement(c).filter((e) => e.uid === uid && e.tag === 'Button'));
    if (tr.length === 0) throw new Error(`Knappen ${uid} finns inte i mallen.`);
    for (const el of tr) {
      el.settings = el.settings ?? {};
      el.settings.btnLink = { ...(el.settings.btnLink ?? {}), link: produkt.url };
      rapport.lankar += 1;
    }
  }

  // Bilderna: bara de platser som fått en bild. Bredd/höjd följer med — GemPages
  // använder dem för layouten innan bilden laddats.
  for (const [plats, bild] of Object.entries(bilder)) {
    const p = platser.bilder?.[plats];
    if (!p) throw new Error(`Okänd bildplats "${plats}". Platser: ${Object.keys(platser.bilder ?? {}).join(', ')}.`);
    if (!bild?.src) continue;
    if (!(bild.width > 0 && bild.height > 0)) throw new Error(`Bilden för ${plats} saknar bredd/höjd.`);
    for (const uid of p.uids) for (const el of element(p.cid, uid, 'Image')) sattBild(el, bild);
    rapport.bilder.push({ plats, src: bild.src, width: bild.width, height: bild.height, kalla: bild.kalla ?? null });
  }

  // Nya id:n FÖRE checksummorna — de räknas på themePageID.
  if (nyaIdn) bytIdn(sida);

  // Serialisera om ALLA sektioner Go-stil och räkna om checksummorna.
  for (const { s, c } of alla) {
    s.component = goJson(c);
    s.checksum = checksum(s.themePageID, s.component);
    s.updatedAt = nu;
  }

  sida.name = `${produkt.kortTitel} – Lagerrensning (listicle)`;
  sida.handle = `${produkt.slug}-lagerrensning`;
  for (const m of sida.meta ?? []) {
    if (m.key === 'global-meta-title') m.value = sida.name;
    if (/^capture_page/.test(String(m.key))) m.value = null;
  }
  rapport.namn = sida.name;
  rapport.handle = sida.handle;
  return { sida, rapport };
}

/** Räknar om varje sektions checksumma och svarar med de som inte stämmer. */
export function granskaChecksummor(sida) {
  return (sida.pageSections ?? [])
    .filter((s) => checksum(s.themePageID, s.component) !== s.checksum)
    .map((s) => ({ cid: s.cid, checksum: s.checksum }));
}

/** Sidans texter, länkar och bilder — det --kolla skriver ut. */
export function lasAvSida(sida) {
  const perCid = new Map((sida.pageSections ?? []).map((s) => [s.cid, JSON.parse(s.component)]));
  const ordning = (sida.sectionPosition ?? []).map((p) => (sida.pageSections ?? []).find((s) => talText(s.id) === talText(p))?.cid).filter(Boolean);
  const ut = [];
  for (const cid of ordning) {
    for (const el of allaElement(perCid.get(cid))) {
      const st = el.settings ?? {};
      const d = el.advanced?.d;
      // dold = gömd på ALLA skärmar (loggan/strecket på en obrandad sida). Mobil-/desktopbilderna är synliga någonstans.
      const dold = !!d && ['desktop', 'mobile', 'tablet'].every((k) => d[k] === false);
      if (el.tag === 'Heading' || el.tag === 'Text') ut.push({ cid, uid: el.uid, tag: el.tag, text: avHtml(st.text), dold });
      else if (el.tag === 'Button') ut.push({ cid, uid: el.uid, tag: el.tag, text: avHtml(st.text), link: st.btnLink?.link ?? null, dold });
      else if (el.tag === 'Image') ut.push({ cid, uid: el.uid, tag: el.tag, src: st.image?.src ?? null, width: st.image?.width ?? null, height: st.image?.height ?? null, dold });
    }
  }
  return ut;
}

// ------------------------------------------------------------ .gempages-filen

/** Zippar sidan till GemPages egen form: manifest.json + pages_info.zip + 1_<id>.zip. */
export function tillGempages(sida, manifest) {
  const id = talText(sida.id);
  const inre = skrivZip([{ namn: `1_${id}.json`, data: skrivJson(sida) }]);
  const info = skrivZip([{ namn: 'pages_info.json', data: skrivJson([{ id: sida.id, name: sida.name, type: sida.type }]) }]);
  return skrivZip([
    { namn: `1_${id}.zip`, data: inre },
    { namn: 'manifest.json', data: typeof manifest === 'string' ? manifest : JSON.stringify(manifest) },
    { namn: 'pages_info.zip', data: info },
  ]);
}

/** Läser en .gempages → { manifest, info, sidor }. */
export function urGempages(buffer) {
  const yttre = lasZip(buffer);
  const manifestFil = yttre.get('manifest.json');
  if (!manifestFil) throw new Error('Filen saknar manifest.json — är det en .gempages-export?');
  const manifest = JSON.parse(manifestFil.toString('utf8'));
  const infoZip = yttre.get('pages_info.zip');
  const info = infoZip ? lasJson(lasZip(infoZip).get('pages_info.json')?.toString('utf8') ?? '[]') : [];
  const sidor = [];
  for (const [namn, data] of yttre) {
    if (!/^\d+_\d+\.zip$/.test(namn)) continue;
    for (const [n2, d2] of lasZip(data)) if (n2.endsWith('.json')) sidor.push(lasJson(d2.toString('utf8')));
  }
  return { manifest, info, sidor };
}
