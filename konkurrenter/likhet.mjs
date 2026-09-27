// konkurrenter/likhet.mjs — hur lika är två texter, och exakt vilka meningar
// är kopierade? Rena funktioner, inga anrop, inga filer. Det är det här Axel
// dömer på: passagerna skrivs ut ordagrant på granskningssidan.
//
// Två mått för text (båda räknas på ORD, inte tecken):
//   • tackning — andelen av VÅRA 5-ords-sekvenser som återfinns hos dem.
//     Vår text är originalet, så täckningen räknas åt det hållet: en lång
//     konkurrentsida med en kopierad stycke ger ändå hög täckning.
//   • passager — de längsta ordagranna sviterna (≥ min_passage ord), utan
//     överlapp. Längsta sviten är det mest talande enskilda talet: åtta ord i
//     följd händer inte av en slump, femton är ett stycke.
// Generiska fraser ("fri frakt", "14 dagars ångerrätt") räknas aldrig som en
// passage — alla butiker skriver dem.
//
// För bilder: Hamming-avstånd mellan dHash-värden (bild.mjs räknar hasharna).

const ENTITETER = { nbsp: ' ', amp: '&', quot: '"', apos: "'", lt: '<', gt: '>', hellip: '…', ndash: '-', mdash: '-', shy: '' };

/** Text → gemener, utan HTML, med typografiska tecken normaliserade. Ren. */
export function normalisera(text) {
  return String(text ?? '')
    .replace(/<br\s*\/?>|<\/p>|<\/li>|<\/h[1-6]>|<\/div>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&([a-z]+);/gi, (m, n) => (n.toLowerCase() in ENTITETER ? ENTITETER[n.toLowerCase()] : m))
    .replace(/[‘’‚′`´]/g, "'")
    .replace(/[“”„″«»]/g, '"')
    .replace(/[–—−]/g, '-')
    .replace(/ /g, ' ')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/** Orden i en text: bokstäver och siffror, minst två tecken. Ren. */
export function ord(text) {
  return normalisera(text)
    .replace(/[^\p{L}\p{N}\s'-]/gu, ' ')
    .split(/\s+/)
    .map((w) => w.replace(/^['-]+|['-]+$/g, ''))
    .filter((w) => w.length >= 2);
}

/** Alla n-ords-sekvenser i en ordlista, som mängd. Ren. */
export function shingles(tokens, n = 5) {
  const s = new Set();
  for (let i = 0; i + n <= tokens.length; i++) s.add(tokens.slice(i, i + n).join(' '));
  return s;
}

/** Andelen av `egna`s sekvenser som finns i `deras` (0–1). Ren. */
export function tackning(egna, deras, n = 5) {
  const a = shingles(egna, n);
  if (!a.size) return 0;
  const b = shingles(deras, n);
  let traffar = 0;
  for (const x of a) if (b.has(x)) traffar++;
  return traffar / a.size;
}

/**
 * De längsta ordagranna sviterna som finns i båda ordlistorna, ≥ minOrd ord,
 * utan överlapp (varken i vår text eller i deras). Längst först.
 * Dynamisk programmering rad för rad — två Int32Array, inte en n×m-tabell —
 * så 2 000 × 2 000 ord går på tiotals millisekunder.
 * @returns {Array<{ ord: number, text: string, egenStart: number, derasStart: number }>}
 */
export function gemensammaPassager(egna, deras, { minOrd = 8, max = 10 } = {}) {
  const n = egna.length; const m = deras.length;
  if (!n || !m || minOrd < 2) return [];
  let forra = new Int32Array(m + 1);
  let nu = new Int32Array(m + 1);
  const kandidater = [];
  for (let i = 1; i <= n; i++) {
    nu[0] = 0;
    for (let j = 1; j <= m; j++) {
      if (egna[i - 1] === deras[j - 1]) {
        const l = forra[j - 1] + 1;
        nu[j] = l;
        if (l >= minOrd) kandidater.push({ egenSlut: i, derasSlut: j, langd: l });
      } else nu[j] = 0;
    }
    [forra, nu] = [nu, forra];
  }
  // Längst först; kortare kandidater som är prefix av en längre svit överlappar
  // den och faller bort.
  kandidater.sort((a, b) => b.langd - a.langd || a.egenSlut - b.egenSlut);
  const tagna = [];
  const valda = [];
  for (const k of kandidater) {
    const eStart = k.egenSlut - k.langd; const dStart = k.derasSlut - k.langd;
    const krock = tagna.some((t) => (eStart < t.eSlut && k.egenSlut > t.eStart) || (dStart < t.dSlut && k.derasSlut > t.dStart));
    if (krock) continue;
    tagna.push({ eStart, eSlut: k.egenSlut, dStart, dSlut: k.derasSlut });
    valda.push({ ord: k.langd, text: egna.slice(eStart, k.egenSlut).join(' '), egenStart: eStart, derasStart: dStart });
    if (valda.length >= max) break;
  }
  return valda;
}

/** Är passagen bara en generisk fras alla butiker skriver? Ren. */
export function arGenerisk(passageText, generiska = []) {
  const p = normalisera(passageText);
  const antalOrd = p.split(' ').filter(Boolean).length;
  if (antalOrd > 12) return false;
  return generiska.some((g) => { const gn = normalisera(g); return gn && p.includes(gn); });
}

export const TEXTTROSKLAR = Object.freeze({ min_passage: 8, stark_tackning: 0.3, stark_langsta: 15, trolig_tackning: 0.12, trolig_langsta: 9 });

/**
 * Jämför vår text mot deras. Returnerar måtten och en styrka:
 * 'stark' (kopierat stycke eller stor del av texten), 'trolig' (en mening
 * eller mer ordagrant), eller null (inget att gå på).
 */
export function jamforText(egenText, derasText, { trosklar = TEXTTROSKLAR, generiska = [], n = 5 } = {}) {
  const t = { ...TEXTTROSKLAR, ...trosklar };
  const a = ord(egenText); const b = ord(derasText);
  const passager = gemensammaPassager(a, b, { minOrd: t.min_passage }).filter((p) => !arGenerisk(p.text, generiska));
  const tack = tackning(a, b, n);
  const langsta = passager[0]?.ord ?? 0;
  const kopieradeOrd = passager.reduce((s, p) => s + p.ord, 0);
  const styrka = (langsta >= t.stark_langsta || tack >= t.stark_tackning) ? 'stark'
    : (langsta >= t.trolig_langsta || tack >= t.trolig_tackning) ? 'trolig' : null;
  return { tackning: Math.round(tack * 1000) / 1000, langsta, kopieradeOrd, passager, ordEgna: a.length, ordDeras: b.length, styrka };
}

/** Hamming-avstånd mellan två 64-bitars hex-hashar (0–64). Ren. */
export function hamming(a, b) {
  if (!/^[0-9a-f]{16}$/i.test(a ?? '') || !/^[0-9a-f]{16}$/i.test(b ?? '')) return 64;
  let x = BigInt(`0x${a}`) ^ BigInt(`0x${b}`);
  let c = 0;
  while (x) { c += Number(x & 1n); x >>= 1n; }
  return c;
}

export const BILDTROSKLAR = Object.freeze({ identisk: 6, lik: 12 });

/**
 * Parar ihop våra bilder med deras: varje bild används högst en gång, närmast
 * först. Bara par inom `lik`-gränsen returneras, med grad 'identisk' | 'lik'.
 * @param {Array<{url:string, hash:string}>} egna
 * @param {Array<{url:string, hash:string}>} deras
 */
export function jamforBilder(egna, deras, trosklar = BILDTROSKLAR) {
  const t = { ...BILDTROSKLAR, ...trosklar };
  const par = [];
  for (const e of egna) for (const d of deras) {
    if (!e?.hash || !d?.hash) continue;
    const avstand = hamming(e.hash, d.hash);
    if (avstand <= t.lik) par.push({ egen: e.url, deras: d.url, avstand, grad: avstand <= t.identisk ? 'identisk' : 'lik' });
  }
  par.sort((a, b) => a.avstand - b.avstand);
  const anvE = new Set(); const anvD = new Set(); const ut = [];
  for (const p of par) {
    if (anvE.has(p.egen) || anvD.has(p.deras)) continue;
    anvE.add(p.egen); anvD.add(p.deras); ut.push(p);
  }
  return ut;
}

/**
 * Väger ihop text och bilder till ärendets styrka + skälen i klartext (sv + en).
 * @param {{ text?: ReturnType<typeof jamforText>|null, annons?: ReturnType<typeof jamforText>|null, bilder?: ReturnType<typeof jamforBilder> }} d
 */
export function sammanvag({ text = null, annons = null, bilder = [] } = {}) {
  const identiska = bilder.filter((b) => b.grad === 'identisk').length;
  const lika = bilder.length - identiska;
  const skal = []; const skalEn = [];
  const basta = [text, annons].filter(Boolean).sort((a, b) => (b.langsta - a.langsta) || (b.tackning - a.tackning))[0] ?? null;
  if (text?.styrka) {
    skal.push(`${text.kopieradeOrd} ord ordagrann text från vår produktsida (längsta sviten ${text.langsta} ord, ${Math.round(text.tackning * 100)} % av våra formuleringar)`);
    skalEn.push(`${text.kopieradeOrd} words copied verbatim from our product page (longest run ${text.langsta} words, ${Math.round(text.tackning * 100)} % of our phrasing)`);
  }
  if (annons?.styrka) {
    skal.push(`vår annonstext återges ordagrant (längsta sviten ${annons.langsta} ord)`);
    skalEn.push(`our ad copy reproduced verbatim (longest run ${annons.langsta} words)`);
  }
  if (identiska) { skal.push(`${identiska} ${identiska === 1 ? 'bild identisk' : 'bilder identiska'} med våra produktbilder`); skalEn.push(`${identiska} image${identiska === 1 ? '' : 's'} identical to our product photos`); }
  if (lika) { skal.push(`${lika} ${lika === 1 ? 'bild mycket lik' : 'bilder mycket lika'} våra (beskuren eller färgjusterad)`); skalEn.push(`${lika} image${lika === 1 ? '' : 's'} near-identical to ours (cropped or recolored)`); }
  const textStark = basta?.styrka === 'stark';
  const textTrolig = basta?.styrka === 'trolig';
  let styrka = null;
  if (textStark || identiska >= 2 || (identiska >= 1 && textTrolig)) styrka = 'stark';
  else if (textTrolig || identiska >= 1 || lika >= 2) styrka = 'trolig';
  return { styrka, skal, skalEn, identiska, lika };
}
