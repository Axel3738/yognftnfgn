// berakna.mjs — alla siffror och all formatering. Rena funktioner, inga I/O.
//
// Två regler styr den här filen:
//
//   • Hitta aldrig på ett tal. Saknas datan returneras null, och vyn skriver
//     "ingen data" med orsaken. Ett påhittat noll ser ut som ett svar.
//   • Rangordna annonser på VINSTBIDRAG, aldrig på ROAS eller CPA ensamt
//     (docs/os/ANALYSMETOD.md). Enmetriks-domar är förbjudna.
//
// Valutor summeras aldrig ihop: allt som summerar gör det per valuta och
// lämnar tillbaka en rad per valuta.

export const DAG = 86_400_000;

/**
 * Ett tal, eller null. Number(null) är 0 och Number('') är 0 — den fällan gör
 * att en SAKNAD ROAS räknas som noll och ger ett falskt negativt vinstbidrag.
 * Allt som ska räknas går därför genom den här först.
 */
function num(v) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

// ------------------------------------------------------------ formatering

const SV = 'sv-SE';

/** 124500 → "124 500". Tomt tal → "–". */
export function tal(v, decimaler = 0) {
  if (v === null || v === undefined || Number.isNaN(Number(v))) return '–';
  return Number(v).toLocaleString(SV, { minimumFractionDigits: decimaler, maximumFractionDigits: decimaler });
}

/** 124500, 'SEK' → "124 500 kr". USD → "$124,500" i svensk gruppering. */
export function pengar(v, valuta = 'SEK', decimaler = 0) {
  if (v === null || v === undefined || Number.isNaN(Number(v))) return '–';
  const n = tal(v, decimaler);
  const kod = String(valuta || 'SEK').toUpperCase();
  if (kod === 'SEK') return `${n} kr`;
  if (kod === 'USD') return `$${n}`;
  if (kod === 'EUR') return `${n} €`;
  if (kod === 'NOK') return `${n} nkr`;
  if (kod === 'DKK') return `${n} dkr`;
  if (kod === 'GBP') return `£${n}`;
  return `${n} ${kod}`;
}

/** Stora tal kort: 1 240 000 kr → "1,2 mkr". Används bara i hjältesiffran. */
export function pengarKort(v, valuta = 'SEK') {
  if (v === null || v === undefined || Number.isNaN(Number(v))) return '–';
  const n = Number(v);
  const kod = String(valuta || 'SEK').toUpperCase();
  const enhet = kod === 'SEK' ? 'kr' : kod === 'USD' ? '$' : kod;
  const skriv = (x, s) => `${x.toLocaleString(SV, { maximumFractionDigits: 1 })} ${s}`;
  if (Math.abs(n) >= 1_000_000) return kod === 'USD' ? `$${skriv(n / 1e6, 'mn')}` : skriv(n / 1e6, `m${enhet}`);
  if (Math.abs(n) >= 10_000) return kod === 'USD' ? `$${skriv(n / 1e3, 'k')}` : skriv(Math.round(n / 1e3), `t${enhet}`);
  return pengar(n, kod);
}

export function procent(v, decimaler = 0) {
  if (v === null || v === undefined || Number.isNaN(Number(v))) return '–';
  return `${Number(v).toLocaleString(SV, { minimumFractionDigits: decimaler, maximumFractionDigits: decimaler })} %`;
}

/** ISO-datum → "21 sep". Med år om det inte är i år. */
export function datum(iso, { nu = new Date() } = {}) {
  const d = iso instanceof Date ? iso : new Date(iso);
  if (Number.isNaN(d.getTime())) return '–';
  const visaAr = d.getFullYear() !== nu.getFullYear();
  return d.toLocaleDateString(SV, { day: 'numeric', month: 'short', ...(visaAr ? { year: 'numeric' } : {}) });
}

/** "för 5 minuter sedan", "i dag 08:12", "i går", "3 dagar sedan". */
export function sedan(iso, { nu = Date.now() } = {}) {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return 'okänt';
  const m = Math.round((nu - t) / 60_000);
  if (m < 1) return 'just nu';
  if (m < 60) return `${m} min sedan`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} ${h === 1 ? 'timme' : 'timmar'} sedan`;
  const d = Math.round(h / 24);
  if (d === 1) return 'i går';
  if (d < 30) return `${d} dagar sedan`;
  return datum(iso, { nu: new Date(nu) });
}

/** YYYY-MM-DD i svensk tid (dashboardens dygn är Axels dygn, inte UTC:s). */
export function dagnyckel(d = new Date(), tidszon = 'Europe/Stockholm') {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: tidszon, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
}

/** De N senaste dagnycklarna, äldst först, inklusive i dag. */
export function sistaDagarna(antal, { nu = new Date(), tidszon = 'Europe/Stockholm' } = {}) {
  const ut = [];
  for (let i = antal - 1; i >= 0; i--) ut.push(dagnyckel(new Date(nu.getTime() - i * DAG), tidszon));
  return ut;
}

// --------------------------------------------------------------- jämförelse

/**
 * Förändring mot ett jämförelsetal.
 * → { andel, riktning: 'upp'|'ner'|'stilla', text } eller null när jämförelsen
 * saknas. Noll som utgångspunkt ger ingen procent — "oändligt bättre" är inget svar.
 */
export function forandring(nu, forr) {
  if (nu === null || nu === undefined || forr === null || forr === undefined) return null;
  const a = Number(nu);
  const b = Number(forr);
  if (Number.isNaN(a) || Number.isNaN(b)) return null;
  if (b === 0) return a === 0 ? { andel: 0, riktning: 'stilla', text: 'oförändrat' } : { andel: null, riktning: a > 0 ? 'upp' : 'ner', text: 'nytt' };
  const andel = ((a - b) / Math.abs(b)) * 100;
  const riktning = Math.abs(andel) < 0.5 ? 'stilla' : andel > 0 ? 'upp' : 'ner';
  return { andel, riktning, text: `${andel > 0 ? '+' : ''}${andel.toLocaleString(SV, { maximumFractionDigits: 0 })} %` };
}

export function summa(rader, falt) {
  return rader.reduce((s, r) => s + (Number(r?.[falt]) || 0), 0);
}

/** Summerar per valuta. → [{ valuta, varde }] sorterat på störst först. */
export function summaPerValuta(rader, falt, valutafalt = 'valuta') {
  const karta = new Map();
  for (const r of rader ?? []) {
    const v = String(r?.[valutafalt] ?? 'SEK').toUpperCase();
    karta.set(v, (karta.get(v) ?? 0) + (Number(r?.[falt]) || 0));
  }
  return [...karta.entries()].map(([valuta, varde]) => ({ valuta, varde })).sort((a, b) => b.varde - a.varde);
}

// ------------------------------------------------------------- annonsdomen

/**
 * Vinstbidrag enligt ANALYSMETOD: (break-even-CPA − CPA) × köp.
 * Saknas break-even eller köp finns ingen dom — då returneras null, och vyn
 * skriver ut varför i stället för att gissa.
 */
export function vinstbidrag({ spend, kop, breakEvenCpa }) {
  const k = num(kop);
  const s = num(spend);
  const be = num(breakEvenCpa);
  if (k === null || s === null || be === null || be <= 0 || k <= 0) return null;
  return (be - s / k) * k;
}

/**
 * Samma vinstbidrag, uttryckt i ROAS: spend × (ROAS / break-even-ROAS − 1).
 *
 * Det ÄR analysmetodens formel, bara omskriven — härledningen:
 *   bidrag = (break-even-CPA − CPA) × köp
 *          = break-even-CPA × köp − spend
 *          = (AOV × köp) / break-even-ROAS − spend      [break-even-CPA = AOV / BE-ROAS]
 *          = (spend × ROAS) / break-even-ROAS − spend   [AOV × köp = intäkt = spend × ROAS]
 *          = spend × (ROAS / break-even-ROAS − 1)
 *
 * Fördelen: kampanjens EGEN AOV används (den ligger i dess ROAS), i stället för
 * produktens snitt-AOV. Break-even-ROAS står dessutom i kampanjnamnet i kontot,
 * så domen går att ställa utan att gissa.
 */
export function vinstbidragRoas({ spend, roas, breakEvenRoas }) {
  const s = num(spend);
  const r = num(roas);
  const be = num(breakEvenRoas);
  if (s === null || r === null || be === null || be <= 0 || s <= 0) return null;
  return s * (r / be - 1);
}

/** "Takskyddet | BE ROAS 1.63 | Launch 2026-08-04" → 1.63. Annars null. */
export function breakEvenUrNamn(namn) {
  const m = /BE[\s-]*ROAS[\s:-]*([0-9]+[.,][0-9]+|[0-9]+)/i.exec(String(namn ?? ''));
  if (!m) return null;
  const v = Number(String(m[1]).replace(',', '.'));
  return Number.isFinite(v) && v > 0 ? v : null;
}

export function cpa({ spend, kop }) {
  const k = num(kop);
  const s = num(spend);
  if (k === null || s === null || k <= 0) return null;
  return s / k;
}

/**
 * Räcker datan för en dom? CLAUDE.md regel 3: ingen dom under 300 kr spend
 * eller 3 köp. Svaret bär orsaken, så vyn kan skriva ut den.
 */
export function bedombar({ spend, kop }, { minSpend = 300, minKop = 3 } = {}) {
  const s = Number(spend) || 0;
  const k = Number(kop) || 0;
  if (s < minSpend && k < minKop) return { ok: false, orsak: `bara ${Math.round(s)} kr spend och ${k} köp — för lite för en dom` };
  if (s < minSpend) return { ok: false, orsak: `bara ${Math.round(s)} kr spend — för lite för en dom` };
  if (k < minKop) return { ok: false, orsak: `bara ${k} köp — för få för en dom` };
  return { ok: true, orsak: null };
}

/**
 * Domen mot break-even (aldrig mot target — CLAUDE.md regel 4).
 * → { lage: 'over'|'under'|'okant', text, ton }
 */
export function motBreakEven({ roas, breakEvenRoas }) {
  const r = num(roas);
  const be = num(breakEvenRoas);
  if (r === null || be === null || be <= 0) return { lage: 'okant', text: 'ingen break-even inlagd', ton: 'neutral' };
  if (r >= be) return { lage: 'over', text: `över break-even (${be.toLocaleString(SV, { maximumFractionDigits: 2 })})`, ton: 'bra' };
  return { lage: 'under', text: `under break-even (${be.toLocaleString(SV, { maximumFractionDigits: 2 })})`, ton: 'daligt' };
}

// ------------------------------------------------------------- sparkline

/**
 * Serie → SVG-path. Enfärgad enskild serie (ingen legend behövs), 2px linje
 * ritas av vyn. Tomma värden hoppas över så en lucka inte blir en nolldipp.
 */
export function sparkline(varden, { bredd = 120, hojd = 32, marginal = 3 } = {}) {
  const punkter = (varden ?? []).map((v) => (v === null || v === undefined || Number.isNaN(Number(v)) ? null : Number(v)));
  const riktiga = punkter.filter((v) => v !== null);
  if (riktiga.length < 2) return null;
  const min = Math.min(...riktiga);
  const max = Math.max(...riktiga);
  const spann = max - min || Math.abs(max) || 1;
  const innerH = hojd - marginal * 2;
  const steg = punkter.length > 1 ? (bredd - marginal * 2) / (punkter.length - 1) : 0;
  const xy = punkter.map((v, i) => (v === null ? null : [
    +(marginal + i * steg).toFixed(2),
    +(marginal + innerH - ((v - min) / spann) * innerH).toFixed(2),
  ]));
  let d = '';
  let ny = true;
  for (const p of xy) {
    if (!p) { ny = true; continue; }
    d += `${ny ? 'M' : 'L'}${p[0]} ${p[1]}`;
    ny = false;
    d += ' ';
  }
  const sista = [...xy].reverse().find(Boolean);
  return { d: d.trim(), bredd, hojd, sistaPunkt: sista, min, max };
}

/** Staplar med gemensam baslinje. → [{ etikett, varde, andel }] */
export function staplar(rader, { falt = 'varde', etikett = 'etikett' } = {}) {
  const max = Math.max(0, ...rader.map((r) => Number(r?.[falt]) || 0));
  return rader.map((r) => ({
    etikett: r?.[etikett],
    varde: Number(r?.[falt]) || 0,
    andel: max > 0 ? ((Number(r?.[falt]) || 0) / max) * 100 : 0,
    rad: r,
  }));
}
