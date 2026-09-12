// arenden.mjs — från lösa mejl till ÄRENDEN (trådar) med riktning, svarstid
// och kategori. Rena funktioner, noll beroenden.
//
// Ett ärende = en kund + ett ämne. Kundens mejl är inkommande; allt som
// skickats från brandets egen domän (eller ligger i Skickat) är svar.
// Det viktiga talet är inte hur många mejl som kom, utan hur många ärenden
// som står OBESVARADE och hur länge — det är där chargebacks föds.

import { klassificera, KATEGORI } from './klassificering.mjs';

const TIMME = 3_600_000;

/** Domänen i en adress: "kund@gmail.com" → "gmail.com". */
export const doman = (adress) => String(adress ?? '').split('@')[1]?.toLowerCase() ?? '';

/** Är avsändaren brandet självt? Supportmailen, dess domän, eller Shopifys/Klarnas systemmejl räknas inte som kund. */
export function arEgen(adress, brand) {
  const a = String(adress ?? '').toLowerCase();
  if (!a) return false;
  if (a === String(brand.supportmail ?? '').toLowerCase()) return true;
  const egenDoman = doman(brand.supportmail);
  if (egenDoman && doman(a) === egenDoman) return true;
  return false;
}

/** Systemmejl som inte är kunder: orderaviseringar, Klarna, Shopify, DHL … Räknas aldrig som ärenden. */
export function arSystem(adress, amne = '') {
  const a = String(adress ?? '').toLowerCase();
  const d = doman(a);
  if (/^(no-?reply|noreply|donotreply|do-not-reply|mailer-daemon|postmaster|bounce|notifications?|alerts?)@/.test(a)) return true;
  if (/(^|\.)(shopify\.com|shopifyemail\.com|klarna\.(com|se|no|dk)|paypal\.com|stripe\.com|postnord\.(com|se|no|dk)|dhl\.com|bring\.com|budbee\.com|instabox\.io|judge\.me|meta\.com|facebookmail\.com|google\.com|loopia\.(se|com)|notion\.so|discord\.com)$/.test(d)) return true;
  if (/^(mail delivery|delivery status notification|undeliverable|leveransfel)/i.test(amne)) return true;
  return false;
}

/** Trådnyckel: References/In-Reply-To först (exakt), annars motpart + normaliserat ämne. */
function tradnyckel(m, motpart, kartaMessageId) {
  for (const ref of m.references ?? []) {
    const t = kartaMessageId.get(ref);
    if (t) return t;
  }
  return `${motpart}|${m.amneNyckel || '(utan ämne)'}`;
}

/**
 * Bygger ärenden. `inkorg` och `skickat` är tolkade mejl (mime.tolkaMejl).
 * `nu` är körningens tidpunkt, `trosklar.obesvarad_timmar` gränsen för larm.
 */
export function byggArenden({ inkorg = [], skickat = [], brand, nu = new Date(), trosklar = {} } = {}) {
  const obesvaradGrans = Number(trosklar.obesvarad_timmar) || 48;
  const alla = [];
  for (const m of inkorg) alla.push({ ...m, _kalla: 'inkorg' });
  for (const m of skickat) alla.push({ ...m, _kalla: 'skickat' });
  // Samma mejl kan ligga både i inkorgen (kopia) och i Skickat — dedupe på Message-ID.
  const sedda = new Set();
  const mejl = [];
  for (const m of alla) {
    if (m.messageId && sedda.has(m.messageId)) continue;
    if (m.messageId) sedda.add(m.messageId);
    mejl.push(m);
  }
  mejl.sort((a, b) => (a.datum?.getTime() ?? 0) - (b.datum?.getTime() ?? 0));

  const bortfiltrerade = { autosvar: 0, system: 0, listmejl: 0, utanAvsandare: 0 };
  const trader = new Map();
  const kartaMessageId = new Map();

  for (const m of mejl) {
    const fran = m.fran?.adress ?? '';
    if (!fran) { bortfiltrerade.utanAvsandare++; continue; }
    const utgaende = m._kalla === 'skickat' || arEgen(fran, brand);
    const motpart = utgaende ? (m.till?.[0]?.adress ?? '') : fran;
    if (!motpart) { bortfiltrerade.utanAvsandare++; continue; }
    if (!utgaende && m.autosvar) { bortfiltrerade.autosvar++; continue; }
    if (!utgaende && arSystem(fran, m.amne)) { bortfiltrerade.system++; continue; }
    if (!utgaende && m.listmejl) { bortfiltrerade.listmejl++; continue; }
    if (utgaende && arSystem(motpart)) continue; // svar till system, ointressant

    const nyckel = tradnyckel(m, motpart, kartaMessageId);
    if (m.messageId) kartaMessageId.set(m.messageId, nyckel);
    if (!trader.has(nyckel)) trader.set(nyckel, { nyckel, motpart, mejl: [] });
    trader.get(nyckel).mejl.push({ ...m, utgaende });
  }

  const arenden = [];
  for (const t of trader.values()) {
    const inkommande = t.mejl.filter((m) => !m.utgaende);
    const svar = t.mejl.filter((m) => m.utgaende);
    if (inkommande.length === 0) continue; // vi skrev, ingen kund — inget ärende
    const forsta = inkommande[0];
    const senaste = inkommande[inkommande.length - 1];
    const klass = inkommande.map((m) => ({ m, k: klassificera({ amne: m.amne, text: m.text }) }));
    // Primär kategori = högst vikt över tråden, vid lika: senaste mejlet.
    const primar = [...klass].sort((a, b) => (KATEGORI[b.k.kategori].vikt - KATEGORI[a.k.kategori].vikt) || ((b.m.datum?.getTime() ?? 0) - (a.m.datum?.getTime() ?? 0)))[0].k;
    const senasteInTid = senaste.datum?.getTime() ?? 0;
    const svarEfter = svar.find((s) => (s.datum?.getTime() ?? 0) >= senasteInTid);
    const forstaSvar = svar.find((s) => (s.datum?.getTime() ?? 0) >= (forsta.datum?.getTime() ?? 0));
    const besvarad = Boolean(svarEfter);
    const timmarObesvarad = besvarad ? 0 : Math.max(0, (nu.getTime() - senasteInTid) / TIMME);
    const svarstidTimmar = forstaSvar && forsta.datum ? Math.max(0, (forstaSvar.datum.getTime() - forsta.datum.getTime()) / TIMME) : null;
    const ordernummer = [...new Set(klass.flatMap((x) => x.k.ordernummer))];
    arenden.push({
      id: t.nyckel,
      kund: { adress: t.motpart, namn: forsta.fran?.namn ?? '' },
      amne: forsta.amne || '(utan ämne)',
      kategori: primar.kategori,
      poang: Math.max(...klass.map((x) => x.k.poang)),
      eskalering: Math.max(...klass.map((x) => x.k.eskalering)),
      sprak: primar.sprak,
      nyckelord: primar.nyckelord,
      ordernummer,
      antalInkommande: inkommande.length,
      antalSvar: svar.length,
      forstaInkommande: forsta.datum ?? null,
      senasteInkommande: senaste.datum ?? null,
      besvarad,
      timmarObesvarad: Math.round(timmarObesvarad),
      larmObesvarad: !besvarad && timmarObesvarad >= obesvaradGrans,
      svarstidTimmar: svarstidTimmar === null ? null : Math.round(svarstidTimmar * 10) / 10,
      utdrag: String(senaste.text ?? '').replace(/\s+/g, ' ').slice(0, 160),
      uids: inkommande.map((m) => m.uid).filter((u) => u !== null && u !== undefined),
    });
  }
  arenden.sort((a, b) => (b.poang - a.poang) || (b.timmarObesvarad - a.timmarObesvarad));
  return { arenden, bortfiltrerade, antalMejl: mejl.length };
}

/** Median av en lista tal (tom lista → null). */
export function median(lista) {
  const v = lista.filter((x) => Number.isFinite(x)).sort((a, b) => a - b);
  if (!v.length) return null;
  const m = Math.floor(v.length / 2);
  return v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2;
}

/** Siffrorna rapporten visar: per kategori, obesvarat, svarstid. */
export function sammanfattaArenden(arenden) {
  const perKategori = {};
  for (const a of arenden) {
    const p = perKategori[a.kategori] ?? (perKategori[a.kategori] = { id: a.kategori, antal: 0, obesvarade: 0, larm: 0, exempel: [] });
    p.antal++;
    if (!a.besvarad) p.obesvarade++;
    if (a.larmObesvarad) p.larm++;
    if (p.exempel.length < 3) p.exempel.push(a.amne);
  }
  const topp = Object.values(perKategori)
    .filter((p) => p.id !== 'spam')
    .sort((a, b) => (b.antal - a.antal) || (KATEGORI[b.id].vikt - KATEGORI[a.id].vikt));
  const kund = arenden.filter((a) => a.kategori !== 'spam');
  const svarstider = kund.map((a) => a.svarstidTimmar).filter((x) => x !== null);
  return {
    antalArenden: kund.length,
    spam: arenden.length - kund.length,
    obesvarade: kund.filter((a) => !a.besvarad).length,
    larmObesvarade: kund.filter((a) => a.larmObesvarad).length,
    besvaradeMedTid: svarstider.length,
    medianSvarstidTimmar: median(svarstider),
    perKategori,
    topp,
  };
}
