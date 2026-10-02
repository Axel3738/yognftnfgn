// namn.mjs — kontots annonsnamn → hubbradens namn (veckorapporten till redigerarna).
//
// Problemet (mätt 2026-10-02, redigerarrapport/PLAN.md avsnitt 1): annonsen i
// kontot heter inte som raden i hubben, och då får ingen redigerare sin annons.
// 179 bedömbara annonser W36–W40, 14 hubbkopplade. Fyra fall, alla mätta i kontona:
//
//   (a) marknadskod i namnet       CaraShellRoof_NO_PD_106_H1, Takoverdrag_US_PD_4_1
//                                  (plats två — samma regel som tools/notion-fil.mjs
//                                  --utan-marknadsfiler / factory/opsmarknader.mjs),
//                                  NO_Trimmerbelt_PD_3_H1 (Bäverbutikens gamla
//                                  NO-kampanjer, koden först), Fiskespöhållare_SO_2_1_NO
//                                  (koden sist).
//   (b) CaraShells speglar         CaraShellRoof_PD_106_H1 = Bäver-källan Takoverdrag_PD_6_H1:
//                                  nummer + 100 (tools/ops-spegla.mjs SPEGEL_OFFSET), prefixet
//                                  ur register.json → spegling + factory/produkter/<id>.yaml
//                                  (creative_prefix ↔ annonsprefix). Också CaraShellFront_ ↔
//                                  Termoskydd_.
//   (c) Bäverbutikens NO-konto     Gamasjer_NO_SP_1 = Damasker_SP_1. Tabellen
//                                  redigerarrapport/no-prefix.json, byggd ur mätning
//                                  (/oversatt-tabellen + jobbfiler, /translate-no-vågorna +
//                                  batch.json, factory-yaml); okänt prefix ⇒ null, aldrig gissat.
//   (d) Matstrumpor                hubbraden heter '022', kontot MATSTRUMP_sushi_jul_ugc_044h1_v1.
//                                  Nyckeln är matstrumpor/logg.jsonl: UPPLADDAD-rader bär
//                                  kalla 'Drive 022_H1.mov' (⇒ hubbnamn 022, hook H1), OMDOPT-rader
//                                  bär fran/till (048 → 054, briefraden döptes om 2026-09-27).
//
// Ren logik: ingen I/O. Tabellerna skickas in som parsade objekt (lasSpeglingar,
// lasNoPrefix, urLogg hjälper till att läsa dem). Matchningen mot hubbraderna använder
// commission/koppling.mjs (normalisera, annonsnamn, nummer) — importerat, inte kopierat.
//
// Regel som aldrig bryts: kandidaterna är härledda ur en dokumenterad regel eller en
// loggrad. Finns ingen sådan blir listan bara namnet självt — hellre okopplad än fel person.

import { normalisera, annonsnamn, nummer, arOversattning } from '../commission/koppling.mjs';
import { MARKNADSKODER_I_NAMN } from '../factory/opsmarknader.mjs';
import { SPEGEL_OFFSET } from '../tools/ops-spegla.mjs';

/** Marknadskoder som får strykas ur ett namn. ⚠️ Aldrig DE — det är en svensk vinkel
 *  (Demo), inte Tyskland (factory/opsmarknader.mjs). */
export const MARKNADSKODER = MARKNADSKODER_I_NAMN;

/** Konton vars annonser alltid är en marknad, även när namnet inte säger det
 *  (commission/berakning.mjs UTLANDSKA_KONTON). Bara det som är entydigt: Magiborsten UK
 *  bär både Bäverbutikens UK och CaraShells US, så det kontot säger inget. */
export const KONTO_MARKNAD = Object.freeze({ '1050941584152547': 'NO' });

const arKod = (s) => MARKNADSKODER.includes(String(s ?? '').toUpperCase());
const arKoncept = (s) => /^[A-Za-z]{1,4}$/.test(String(s ?? ''));
const arNummer = (s) => /^\d+$/.test(String(s ?? ''));

/** Namnet i sina delar: prefix (allt före första _), koncept, nummer, variant.
 *  `CaraShellRoof_PD_106_H1` → { prefix: 'CaraShellRoof', koncept: 'PD', nummer: 106, variant: 'H1' }.
 *  Koncept och nummer är null när namnet inte följer mönstret — då härleds inget ur dem. */
export function delaNamn(namn) {
  const f = String(namn ?? '').split('_');
  const prefix = f[0] ?? '';
  const koncept = f.length >= 3 && arKoncept(f[1]) && arNummer(f[2]) ? f[1].toUpperCase() : null;
  const nr = koncept ? Number(f[2]) : null;
  const variant = koncept && f.length > 3 ? f.slice(3).join('_') : null;
  return { prefix, koncept, nummer: nr, variant };
}

/** Marknadskoden i namnet och namnet utan den. Tre lägen, alla mätta i kontona:
 *  plats två (CaraShellRoof_NO_PD_106_H1 — stryks bara om resten fortfarande är
 *  <prefix>_<koncept>_<nr>, så att en vinkelkod som råkar heta som ett land, t.ex.
 *  Overvakningskamera_AU_2_H1, aldrig stryks), först (NO_Trimmerbelt_PD_3_H1) och sist
 *  (Fiskespöhållare_SO_2_1_NO). Utan kod: marknad null och bas = namnet. */
export function skalaMarknad(namn) {
  const n = String(namn ?? '');
  const f = n.split('_');
  if (f.length >= 3 && arKod(f[1])) {
    const bas = [f[0], ...f.slice(2)].join('_');
    if (delaNamn(bas).koncept) return { marknad: f[1].toUpperCase(), bas, plats: 'tva' };
  }
  if (f.length >= 2 && arKod(f[0])) return { marknad: f[0].toUpperCase(), bas: f.slice(1).join('_'), plats: 'forst' };
  if (f.length >= 3 && arKod(f[f.length - 1])) return { marknad: f[f.length - 1].toUpperCase(), bas: f.slice(0, -1).join('_'), plats: 'sist' };
  return { marknad: null, bas: n, plats: null };
}

/** Marknaden ur kampanjnamnet när annonsnamnet inte bär någon: "Takovertrekk Campingvogn NO | …",
 *  "CARASHELL_NO_Takovertrekket", "1 CARASHELL_US_Taköverdrag …". Bara koden som eget ord. */
export function marknadUrKampanj(kampanj) {
  const forsta = String(kampanj ?? '').split('|')[0];
  const m = /(?:^|[\s_])(NO|US|DK|FI|UK)(?=[\s_]|$)/.exec(forsta);
  return m ? m[1] : null;
}

// ------------------------------------------------------------ (b) speglar

/** Speglingarna ur registret: `{ CaraShellRoof: 'Takoverdrag', CaraShellFront: 'Termoskydd' }`.
 *  register = parsad factory/produkter/register.json, produkter = { <id>: <yaml-text> } för
 *  posterna med `spegling` (id = nyckelns del efter '/'). Ingen YAML-tolk: prefixen läses ur
 *  raderna `creative_prefix:` (butikens annonser) och `annonsprefix:` (källan i Bäverbutiken).
 *  En post vars yaml saknar någotdera hoppas — ett gissat prefix speglar fel. */
export function lasSpeglingar({ register, produkter } = {}) {
  const ut = {};
  for (const [nyckel, post] of Object.entries(register?.poster ?? {})) {
    if (!post?.spegling) continue;
    const id = nyckel.split('/').pop();
    const yaml = String(produkter?.[id] ?? '');
    const eget = /^\s*creative_prefix:\s*"([^"]+)"/m.exec(yaml)?.[1];
    const kalla = /^\s*annonsprefix:\s*"([^"]+)"/m.exec(yaml)?.[1];
    if (eget && kalla) ut[eget] = kalla;
  }
  return ut;
}

const slaUpp = (tabell, prefix) => {
  if (!tabell || !prefix) return null;
  const vill = normalisera(prefix);
  if (tabell instanceof Map) { for (const [k, v] of tabell) if (normalisera(k) === vill) return v; return null; }
  for (const [k, v] of Object.entries(tabell)) if (normalisera(k) === vill) return v;
  return null;
};

/** Källraden bakom ett spegelnamn: CaraShellRoof_PD_106_H1 → Takoverdrag_PD_6_H1.
 *  Null när prefixet inte speglas eller numret ligger under offset (butikens egen annons). */
export function spegelKalla(namn, speglingar) {
  const d = delaNamn(namn);
  if (!d.koncept || d.nummer === null) return null;
  const kall = slaUpp(speglingar, d.prefix);
  if (!kall || d.nummer < SPEGEL_OFFSET) return null;
  return `${kall}_${d.koncept}_${d.nummer - SPEGEL_OFFSET}${d.variant ? `_${d.variant}` : ''}`;
}

// ------------------------------------------------------------ (c) NO-prefix

/** Tabellen ur redigerarrapport/no-prefix.json (hela filen eller bara `prefix`-objektet)
 *  som Map(NO-prefix → { se_prefix, alternativ }). Rader med se_prefix null ligger kvar —
 *  de ger inga kandidater, men syns i rapporten som "okänt prefix". */
export function lasNoPrefix(json) {
  const inre = json?.prefix && typeof json.prefix === 'object' ? json.prefix : json ?? {};
  const ut = new Map();
  for (const [k, v] of Object.entries(inre)) {
    if (k.startsWith('_')) continue;
    ut.set(k, { se_prefix: v?.se_prefix ?? null, alternativ: Array.isArray(v?.alternativ) ? v.alternativ : [] });
  }
  return ut;
}

/** SE-namnen bakom ett NO-namn (utan marknadskod): Gamasjer_SP_1 → ['Damasker_SP_1'].
 *  Flera SE-prefix för samma produkt (Beltesliper → Beltgrinder, Balteslipmaskin) ger flera
 *  kandidater i tabellens ordning. Samma prefix i båda kontona ger inget nytt namn.
 *  Returnerar också om prefixet FANNS i tabellen (okänt prefix ⇒ null ⇒ inga kandidater). */
export function noPrefixKalla(namn, noPrefix) {
  const d = delaNamn(namn);
  const rad = slaUpp(noPrefix, d.prefix);
  if (!rad) return { kandidater: [], kand: false };
  const rest = String(namn).slice(d.prefix.length);
  const ses = [rad.se_prefix, ...(rad.alternativ ?? [])].filter(Boolean);
  return { kandidater: ses.filter((sp) => normalisera(sp) !== normalisera(d.prefix)).map((sp) => `${sp}${rest}`), kand: true, okand: !rad.se_prefix };
}

// ------------------------------------------------------------ (d) Matstrumpor

/** Loggen (matstrumpor/logg.jsonl, parsade rader) → de två radtyper som bär namnkopplingen. */
export function urLogg(rader) {
  const uppladdade = [], omdopta = [];
  for (const r of rader ?? []) {
    if (r?.kod === 'UPPLADDAD' && r.annons) uppladdade.push({ annons: r.annons, kalla: r.kalla ?? null, annons_id: r.annons_id ?? null });
    if (r?.kod === 'OMDOPT' && r.fran && r.till) omdopta.push({ fran: r.fran, till: r.till, notion_page_id: r.notion_page_id ?? null });
  }
  return { uppladdade, omdopta };
}

/** Hubbradens arbetsnamn ur UPPLADDAD-radens kalla: 'Drive 022_H1.mov' → { namn: '022', variant: 'H1' },
 *  'Drive 024_V1.mov' → { namn: '024', variant: 'V1' }. Null när källan inte är en numrerad fil —
 *  ett namn ur en gissad fil kopplar fel person. */
export function hubbnamnUrKalla(kalla) {
  const m = /(?:^|[\s/\\])(\d{3}(?:\s?v\d+)?)(?:_([A-Za-z]\d+))?\.[A-Za-z0-9]+$/i.exec(String(kalla ?? '').trim());
  return m ? { namn: m[1], variant: m[2] ?? null } : null;
}

// ------------------------------------------------------------ kallnamn

const lika = (a, b) => normalisera(a) === normalisera(b);

/**
 * Kandidaterna att matcha mot hubbradens namn, i prioritetsordning.
 *
 * @param {string} annonsnamnKonto  annonsens namn i Meta
 * @param {object} opt
 *   konto       annonskontots id (bara för marknaden när inget annat säger den)
 *   kampanj     kampanjnamnet (dito)
 *   uppladdade  urLogg(...).uppladdade
 *   omdopta     urLogg(...).omdopta
 *   noPrefix    lasNoPrefix(...)  (Map eller objekt)
 *   speglingar  lasSpeglingar(...) ({ CaraShellRoof: 'Takoverdrag', … })
 * @returns {{ kandidater: string[], via: 'direkt'|'marknad'|'spegel'|'no-prefix'|'uppladdad'|'omdopt',
 *             marknad: string|null, steg: string[], okandNoPrefix: boolean }}
 *   via = det mest specifika steget som gav en kandidat; steg = alla steg som gav något.
 *   Ordningen: namnet självt, sedan källnamnen (spegel/NO-prefix/logg), sedan namnet utan
 *   marknadskod, sist varje namn utan variant (Takoverdrag_PD_6_H1 → Takoverdrag_PD_6).
 */
export function kallnamn(annonsnamnKonto, opt = {}) {
  const namn = annonsnamn(annonsnamnKonto);
  const steg = [];
  const direkt = [namn];
  const kalla = [];
  const utanKod = [];
  let okandNoPrefix = false;

  // (a) marknadskod
  const { marknad: kodINamn, bas } = skalaMarknad(namn);
  const marknad = kodINamn ?? marknadUrKampanj(opt.kampanj) ?? KONTO_MARKNAD[String(opt.konto ?? '')] ?? null;
  if (kodINamn && !lika(bas, namn)) { utanKod.push(bas); steg.push('marknad'); }

  // (b) spegel — på namnet utan kod (CaraShellRoof_DK_GT_105_H1 → CaraShellRoof_GT_105_H1 → Takoverdrag_GT_5_H1)
  const spegel = spegelKalla(bas, opt.speglingar);
  if (spegel) { kalla.push(spegel); steg.push('spegel'); }

  // (c) NO-prefix
  if (opt.noPrefix) {
    const no = noPrefixKalla(bas, opt.noPrefix);
    if (no.okand) okandNoPrefix = true;
    if (no.kandidater.length) { kalla.push(...no.kandidater); steg.push('no-prefix'); }
  }

  // (d) Matstrumpor: UPPLADDAD (kontonamn → Drive-filens arbetsnamn) och OMDOPT (fran ↔ till)
  for (const u of opt.uppladdade ?? []) {
    if (!lika(u.annons, namn)) continue;
    const h = hubbnamnUrKalla(u.kalla);
    if (!h) continue;
    if (h.variant) kalla.push(`${h.namn}_${h.variant}`);
    kalla.push(h.namn);
    if (!steg.includes('uppladdad')) steg.push('uppladdad');
  }
  for (const o of opt.omdopta ?? []) {
    if (lika(o.fran, namn)) { kalla.push(o.till); if (!steg.includes('omdopt')) steg.push('omdopt'); }
    else if (lika(o.till, namn)) { kalla.push(o.fran); if (!steg.includes('omdopt')) steg.push('omdopt'); }
  }

  // Sist: varje kandidat utan variant — en konceptrad utan hook/variant i hubben.
  const utanVariant = [];
  for (const k of [...direkt, ...kalla, ...utanKod]) {
    const d = delaNamn(k);
    if (d.koncept && d.nummer !== null && d.variant) utanVariant.push(`${d.prefix}_${d.koncept}_${d.nummer}`);
  }

  const sedda = new Set();
  const kandidater = [];
  for (const k of [...direkt, ...kalla, ...utanKod, ...utanVariant]) {
    const n = normalisera(k);
    if (!n || sedda.has(n)) continue;
    sedda.add(n);
    kandidater.push(k);
  }
  const via = ['omdopt', 'uppladdad', 'spegel', 'no-prefix', 'marknad'].find((s) => steg.includes(s)) ?? 'direkt';
  return { kandidater, via, marknad, steg, okandNoPrefix };
}

// ------------------------------------------------------------ matchaRad

/** Index över hubbraderna: exakt namn (normaliserat, utan briefens beskrivning) och löpnummer
 *  ('022', '235 H1' → '235'). Tar hubbar ({ namn, rader }) eller en platt radlista. */
export function byggRadindex(hubbrader) {
  const exakt = new Map(), perNummer = new Map();
  const lagg = (m, k, v) => { if (!k) return; if (!m.has(k)) m.set(k, []); m.get(k).push(v); };
  for (const x of hubbrader ?? []) {
    const rader = Array.isArray(x?.rader) ? x.rader.map((r) => ({ ...r, hubb: r.hubb ?? x.namn })) : [x];
    for (const r of rader) {
      if (!r?.namn) continue;
      lagg(exakt, normalisera(annonsnamn(r.namn)), r);
      lagg(perNummer, nummer(r.namn), r);
    }
  }
  return { exakt, perNummer };
}

/** Bland flera rader med samma namn: en med Ansvarig som inte är en översättningsrad,
 *  annars en med Ansvarig, annars den första. */
function valjRad(rader) {
  return rader.find((r) => r.ansvariga?.length && !arOversattning(r.namn))
    ?? rader.find((r) => r.ansvariga?.length)
    ?? rader[0];
}

/**
 * Första kandidaten som har en hubbrad. Exakt namn först; löpnumret ('022' → raden '022')
 * bara för kandidater som BÖRJAR med siffror, så att ett prefixnamn aldrig matchar på nummer.
 * @param {string[]} kandidater  ur kallnamn()
 * @param {Array|{exakt:Map,perNummer:Map}} hubbrader  hubbar, rader eller ett byggRadindex
 * @returns {{ rad, kandidat, steg:number, pa:'exakt'|'nummer' }|null}
 */
export function matchaRad(kandidater, hubbrader) {
  const idx = hubbrader?.exakt instanceof Map ? hubbrader : byggRadindex(hubbrader);
  for (const [i, k] of (kandidater ?? []).entries()) {
    let rader = idx.exakt.get(normalisera(annonsnamn(k)));
    let pa = 'exakt';
    if (!rader?.length) { const n = nummer(k); if (n) { rader = idx.perNummer.get(n); pa = 'nummer'; } }
    if (rader?.length) return { rad: valjRad(rader), kandidat: k, steg: i, pa };
  }
  return null;
}
