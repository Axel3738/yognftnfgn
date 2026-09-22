// lardom.mjs — lärdomen per etiketterad annons, och det som byggs på den.
//
// Axels definition av klart för creative strategy (docs/os/CS-KLART.md,
// 2026-09-21): ingen annons är klar förrän lärdomen är skriven (punkt 5), varje
// brief pekar på en lärdom (6), antalet briefer överstiger aldrig antalet
// lärdomar (8), iterationsnumret räknas per koncept (14, 18), rapporten säger
// hur många lärdomar som skrevs och hur många briefer som byggde på en (16).
//
// Två nya loggkoder i agent/budgetlogg.jsonl (append-only, aldrig ny_budget):
//   LARDOM — en per etiketterad annons: lardom_id, utfall, utford_som_briefad,
//            komponent_avvikelser, hypotes, nasta (annonsnamn), fil.
//   BRIEF  — en per brief som skapas i Notion: lardom, typ, parent, koncept,
//            iteration_nr (räknat ur loggen, aldrig ur huvudet), taggarna.
//
//   node agent/lardom.mjs --skelett [--konto SE|NO|alla] [--kampanj <id>] [--idag YYYY-MM-DD] [--ut <fil.md>] [--bara-bedombara] [--utan-turordning]
//       Skriver ett skelett per ETIKETT-rad som saknar LARDOM-rad: datan är
//       ifylld ur etikettraden och briefens taggar; sessionen fyller
//       "Utfört", hypotesen (märkt gissning) och "Nästa annonser".
//   node agent/lardom.mjs --skriv <fil.md> [--torr] [--idag YYYY-MM-DD]
//       Validerar varje lärdomsblock (alla fält, gissning, nästa annonser),
//       lägger in blocket i products/<id>/lardomar.md och skriver LARDOM-raden.
//       Ett block med fel stoppar HELA filen — rätta och kör om.
//   node agent/lardom.mjs --brief <manifest.json> --kampanj <id> [--torr] [--idag YYYY-MM-DD]
//       Läser taggraden i varje brief i manifestet, räknar iterationsnumret
//       per koncept ur loggen, kräver lardom=L-… på varje brief och skriver
//       BRIEF-rader. Stoppar på brief utan lärdom (punkt 6).
//   node agent/lardom.mjs --status [--idag YYYY-MM-DD] [--json]
//       Räkningen till rapporten: etiketterade utan lärdom, lärdomar skrivna
//       i dag, briefer i dag och hur många som pekar på en lärdom, brieftaket
//       per kampanj (punkt 8), koncept vid taket (punkt 18), mixen (punkt 7).
//
// Ren logik exporteras och testas i agent/test/lardom.test.mjs. Inget nät.

import { readFileSync, writeFileSync, existsSync, mkdirSync, appendFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, resolve, isAbsolute } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { lasLogg, skrivRad } from './logg.mjs';
import { ETIKETT, ETIKETTKODER, dagarMellan, breakthroughFrekvens, formateraFrekvenser } from './etikett.mjs';

const HÄR = dirname(fileURLToPath(import.meta.url));
const ROT = join(HÄR, '..');

export const LARDOM_KOD = 'LARDOM';
export const BRIEF_KOD = 'BRIEF';
/** Lärdomens id: L-<annons_id>. Briefen pekar på det (lardom=L-…). */
export const lardomId = (annonsId) => `L-${String(annonsId).replace(/^L-/, '')}`;

/** Komponenterna som verifieras mot briefen (CS-KLART punkt 2). Ordningen är Axels. */
export const KOMPONENTER = Object.freeze(['avatar', 'vinkel', 'medvetandenivå', 'mekanism', 'tro', 'positionering', 'brådska']);
/** Taggnyckel per komponent i VARIABELTAGGAR-raden (engelska alias accepteras). */
const KOMPONENT_TAGG = { avatar: ['avatar'], vinkel: ['vinkel', 'angle'], medvetandenivå: ['awareness', 'medvetandenivå', 'medvetandeniva'], mekanism: ['mekanism', 'mechanism'], tro: ['tro', 'belief'], positionering: ['positionering', 'positioning'], brådska: ['urgency', 'brådska', 'bradska'] };
/** Källor som räknas som research (punkt 12, 18): idén kom ur data, inte ur en format-kopia. */
export const RESEARCH_KALLOR = Object.freeze(['voc', 'swipe', 'egen-data', 'playbook', 'winning-line', 'feedback', 'kommentarer']);
/** En breakthrough räknas som levande så här länge efter etiketten (punkt 7, 9). */
export const LEVANDE_DAGAR = 28;
/** Punkt 9: tre iterationer inom 14 dagar. */
export const VIDAREBYGG_DAGAR = 14;
export const VIDAREBYGG_ITERATIONER = 3;
/**
 * Punkt 18: taket — tre iterationer med lärdom, sedan släpp om forskningen är svag.
 *
 * ⚠️ **Trean är ett VAL, inte en naturlag** (Axels beslut 2026-09-21). Två
 * röster i källmaterialet säger emot varandra: Shaun säger "three strikes and
 * release", Spencer säger att man nästan alltid kan göra mer på ett koncept
 * som bär. Vi följer Shaun som utgångsläge eftersom en siffra går att köra
 * utan att någon bedömer varje gång — men bara som utgångsläge.
 *
 * **Den som vill köra ett fjärde varv får göra det, med skriven motivering i
 * lärdomen.** Motiveringen ska säga vad som talar för att konceptet inte är
 * uttömt: att forskningen bakom är stark, att iterationerna rört sig uppåt,
 * eller att den senaste ändringen aldrig fick spend. Ingen motivering ⇒ släpp.
 *
 * Koda ALDRIG in Spencers hållning som en andra regel parallellt med den här.
 * Två motstridiga regler i samma motor betyder att den som läser koden får
 * välja själv, och då är det ingen regel alls.
 */
export const TAK_ITERATIONER = 3;
/** Punkt 7: mixen. */
export const MIX = Object.freeze({ medBreakthrough: { vidarebyggen: 0.8, nya: 0.2 }, utanVinnare: { vidarebyggen: 0.2, nya: 0.8 } });

// ------------------------------------------------------------------ hjälpare

/** Tal ur ett fält — null för tomt/saknat, aldrig 0 (0 är ett riktigt värde, "okänd" är ett annat). */
const num = (x) => { if (x === null || x === undefined || x === '') return null; const n = typeof x === 'number' ? x : Number(String(x).replace(/\s/g, '').replace(',', '.')); return Number.isFinite(n) ? n : null; };
const pct = (x, d = 0) => (x === null || x === undefined ? 'okänd' : `${(x * 100).toFixed(d).replace('.', ',')} %`);
/** "7 739 kr" med vanligt mellanslag (toLocaleString ger ett smalt fast mellanslag som inte går att söka på). */
const kr = (x) => (x === null || x === undefined ? 'okänd' : `${String(Math.round(x)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} kr`);
const dec = (x) => (x === null || x === undefined ? 'okänd' : Number(x).toFixed(2).replace('.', ','));
const slug = (s) => String(s ?? '').toLowerCase().replace(/å/g, 'a').replace(/ä/g, 'a').replace(/ö/g, 'o').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/** Taggraden i en brief (VARIABELTAGGAR: / Variables:) → { nyckel: värde } med små bokstäver. */
export function taggarUrBrief(text) {
  const rad = String(text ?? '').split('\n').find((r) => /VARIABELTAGGAR\s*:/i.test(r) || /^\s*(?:\*\*)?variables(?:\*\*)?\s*:/i.test(r));
  if (!rad) return null;
  const rest = rad.replace(/\*\*/g, '').replace(/^.*?(?:VARIABELTAGGAR|variables)\s*:\s*/i, '');
  const ut = {};
  for (const del of rest.split(/\s*[·|]\s*/)) {
    const m = del.match(/^\s*([^=:]+?)\s*[=:]\s*(.+?)\s*$/);
    if (!m) continue;
    ut[m[1].trim().toLowerCase()] = m[2].replace(/`/g, '').trim();
  }
  return ut;
}

/** Värdet för en komponent ur taggarna, via alias. */
export function komponentVarde(taggar, komponent) {
  for (const k of KOMPONENT_TAGG[komponent] ?? [komponent]) if (taggar?.[k]) return taggar[k];
  return null;
}

/** Produktens minnesmapp för en kampanj: produktkartans `minne`, annars products/<slug>/ om den finns. */
export function minnesmapp(kampanj, { rot = ROT } = {}) {
  if (kampanj?.minne) return String(kampanj.minne).replace(/\/$/, '');
  const s = slug(kampanj?.produkt ?? kampanj?.kampanj_namn?.split('|')[0]);
  if (s && existsSync(join(rot, 'products', s))) return `products/${s}`;
  return null;
}

/**
 * En BEFINTLIG minnesmapp som troligen hör till produkten, när sluggen inte
 * träffar rakt av (Axels bugg 2026-09-21).
 *
 * Bakgrund: `--skriv` föll tidigare tillbaka på `products/<slug av
 * kampanjnamnet>` och SKAPADE mappen. Taköverdragets lärdom hamnade därför i
 * `products/takoverdraget-for-husvagn-6-5-3-m/` medan produktens minne ligger i
 * `products/takoverdraget-husvagn/`. Mätt samma dag: 86 kampanjer i
 * produktkartan saknar `minne`, och sluggen träffar en befintlig mapp i bara 3
 * av dem — resten hade splittrat produktminnet i nya tomma mappar, tyst.
 *
 * Returnerar mappnamnet (utan `products/`) eller null. Ren läsning, ingen
 * skrivning: den GISSAR aldrig åt anroparen, den pekar bara ut kandidaten så
 * att en människa kan skriva in `minne` i produktkartan.
 */
export function narmasteMinnesmapp(produktnamn, { rot = ROT } = {}) {
  const s = slug(produktnamn);
  if (!s) return null;
  let mappar = [];
  try { mappar = readdirSync(join(rot, 'products')).filter((f) => statSync(join(rot, 'products', f)).isDirectory()); } catch { return null; }
  if (mappar.includes(s)) return s;
  // Marknadssuffix först: "overvakningskameran-no" → "overvakningskameran".
  const utanMarknad = s.replace(/-(no|dk|fi|uk|us|se)$/, '');
  if (utanMarknad !== s && mappar.includes(utanMarknad)) return utanMarknad;
  // Sedan ordmängd: alla mappens ord ska finnas i kampanjnamnet. "Taköverdraget
  // för Husvagn 6,5 × 3 m" → takoverdraget + husvagn finns båda, alltså
  // products/takoverdraget-husvagn. Minst TVÅ ord krävs — ett ensamt ord
  // matchar för lätt och skulle koppla ihop olika produkter.
  const ord = new Set(s.split('-').filter(Boolean));
  const kandidater = mappar.filter((m) => {
    const mo = m.split('-').filter(Boolean);
    return mo.length >= 2 && mo.every((o) => ord.has(o));
  });
  if (!kandidater.length) return null;
  return kandidater.sort((a, b) => b.split('-').length - a.split('-').length || b.length - a.length)[0];
}

/** Läser produktkartan → { campaign_id: post }. */
export function lasProduktkarta(fil = join(HÄR, 'produktkarta.json')) {
  if (!existsSync(fil)) return {};
  const k = JSON.parse(readFileSync(fil, 'utf8'));
  const ut = {};
  for (const p of k.kampanjer ?? []) if (p?.campaign_id) ut[String(p.campaign_id)] = p;
  return ut;
}

/** Hittar briefen för ett annonsnamn i produktens mapp: valfri undermapp som heter som annonsen och bär brief.md (batch-NN/video-ads-briefs/<namn>/brief.md, briefs/video-ads/<namn>/brief.md). */
export function hittaBrief(mapp, annonsNamn, { rot = ROT } = {}) {
  if (!mapp) return null;
  const bas = join(rot, mapp);
  if (!existsSync(bas)) return null;
  const stack = [bas];
  while (stack.length) {
    const d = stack.pop();
    let poster = [];
    try { poster = readdirSync(d); } catch { continue; }
    for (const p of poster) {
      const full = join(d, p);
      let st; try { st = statSync(full); } catch { continue; }
      if (st.isDirectory()) { if (!/^(node_modules|\.git)$/.test(p)) stack.push(full); continue; }
      if (p === 'brief.md' && d.endsWith(`/${annonsNamn}`)) return full;
    }
  }
  return null;
}

// ------------------------------------------------------------------ loggläsning

/** Senaste LARDOM-raden per annons. */
export function lardomar(logg) {
  const ut = new Map();
  for (const r of logg) if (r.kod === LARDOM_KOD && r.annons_id) ut.set(String(r.annons_id), r);
  return ut;
}

/** Senaste etikettraden per annons (ETIKETT / ETIKETT_UPPGRADERAD). */
export function etiketter(logg) {
  const ut = new Map();
  for (const r of logg) {
    if (!ETIKETTKODER.includes(r.kod) || !r.annons_id) continue;
    const t = ut.get(String(r.annons_id));
    if (!t || String(r.datum) >= String(t.datum)) ut.set(String(r.annons_id), r);
  }
  return ut;
}

/**
 * Etiketterade annonser utan lärdom (punkt 5) — det som INTE är klart.
 *
 * Turordningen är Axels beslut 2026-09-21, i stället för ett briefgolv första
 * veckan: **kampanjer med en levande breakthrough först, i fallande ordning på
 * spend.** Skälet är att varje breakthrough utan lärdom blockerar upp till tre
 * vidarebyggen på en annons som redan bevisat sig — det är den dyraste
 * blockeringen i kön. Mätt samma dag: 2 378 etiketter saknade lärdom, men bara
 * 184 var bedömbara, och 9 svenska kampanjer bar en levande breakthrough.
 *
 * Inom en kampanj: breakthrough först, sedan bedömbara, sedan spend. Ett golv
 * på antal briefer avvisades — "ett golv skulle ge briefer som inte pekar på
 * någonting, och det är precis vad regeln finns för att stoppa".
 */
export function oskrivna(logg, { kampanjId = null, adAccountId = null, baraBedombara = false, idag = null, turordning = true } = {}) {
  const skrivna = lardomar(logg);
  const ut = [];
  for (const e of etiketter(logg).values()) {
    if (kampanjId && String(e.kampanj_id) !== String(kampanjId)) continue;
    if (adAccountId && String(e.ad_account_id) !== String(adAccountId)) continue;
    if (baraBedombara && !e.bedombar) continue;
    if (skrivna.has(String(e.annons_id))) continue;
    ut.push(e);
  }
  if (!turordning) return ut.sort((a, b) => (b.spend_ad ?? 0) - (a.spend_ad ?? 0));

  // Kampanjens plats i kön: har den en levande breakthrough, och hur mycket
  // spend bär dess oskrivna etiketter tillsammans?
  const perKampanj = new Map();
  for (const e of ut) {
    const k = String(e.kampanj_id);
    if (!perKampanj.has(k)) perKampanj.set(k, { bt: false, spend: 0 });
    const p = perKampanj.get(k);
    p.spend += e.spend_ad ?? 0;
    if (e.etikett === ETIKETT.BREAKTHROUGH && (!idag || (dagarMellan(e.datum, idag) ?? 1e9) <= LEVANDE_DAGAR)) p.bt = true;
  }
  const rang = (e) => (e.etikett === ETIKETT.BREAKTHROUGH ? 0 : e.bedombar ? 1 : 2);
  return ut.sort((a, b) => {
    const ka = perKampanj.get(String(a.kampanj_id)), kb = perKampanj.get(String(b.kampanj_id));
    if (ka.bt !== kb.bt) return ka.bt ? -1 : 1;              // breakthrough-kampanjer först
    if (ka.spend !== kb.spend) return kb.spend - ka.spend;    // sedan störst spend
    if (String(a.kampanj_id) !== String(b.kampanj_id)) return String(a.kampanj_id) < String(b.kampanj_id) ? -1 : 1;
    const ra = rang(a), rb = rang(b);
    if (ra !== rb) return ra - rb;                            // inom kampanjen: bt, bedömbar, resten
    return (b.spend_ad ?? 0) - (a.spend_ad ?? 0);
  });
}

/** BRIEF-rader för en kampanj. */
export function briefer(logg, kampanjId = null) {
  return logg.filter((r) => r.kod === BRIEF_KOD && (!kampanjId || String(r.kampanj_id) === String(kampanjId)));
}

/** Iterationsnumret för nästa brief på ett koncept: 1 + antal tidigare BRIEF-rader med samma koncept (punkt 14). */
export function nastaIteration(logg, kampanjId, koncept) {
  if (!koncept) return null;
  const k = String(koncept).toLowerCase();
  return 1 + briefer(logg, kampanjId).filter((r) => String(r.koncept ?? '').toLowerCase() === k).length;
}

/** Senaste *_KLAR-datumet för en kampanj (batchklockan). */
function senasteKlar(logg, kampanjId) {
  let d = null;
  for (const r of logg) {
    if (String(r.kampanj_id) !== String(kampanjId) || r.genomford !== true) continue;
    if (!['FORSTA_BATCH_KLAR', 'CS_BATCH_KLAR', 'VIDAREBYGG_KLAR'].includes(r.kod)) continue;
    if (d === null || String(r.datum) > d) d = String(r.datum);
  }
  return d;
}

/**
 * Brieftaket (punkt 8): antalet briefer i en runda får aldrig överstiga
 * antalet lärdomar skrivna sedan förra batchen (inklusive i dag). Inga nya
 * lärdomar ⇒ 0 briefer, och orsaken säger hur många etiketterade som väntar.
 */
/**
 * Annonsnamnet ur en rad i en lärdoms "Nästa annonser" — första backtickade
 * ordet. Raden ser ut så här: "`Takoverdrag_OB_2_H1` — typ N, …". Ren.
 * `SLÄPP`-rader bär inget namn och ger null.
 */
export function namnUrNasta(rad) {
  const t = String(rad ?? '');
  // En SLÄPP-rad NAMNGER ofta annonsen den släpper ("SLÄPP `IBC_SP_2_1` — …").
  // Den ska aldrig ge en fri briefplats — den säger motsatsen.
  if (/\bSL[ÄA]PP\b/i.test(t)) return null;
  const m = t.match(/`([A-Za-zÅÄÖåäö0-9][A-Za-zÅÄÖåäö0-9_-]*_[A-Za-z]+_\d+[A-Za-z0-9_]*)`/);
  return m ? m[1] : null;
}

/**
 * Brieftaket (punkt 8) och de annonser som ligger UTANFÖR det.
 *
 * `tak` = antal lärdomar skrivna sedan förra batchen. Det är kvoten för
 * briefer som ingen lärdom bett om.
 *
 * `namngivna` = annonser som en lärdom uttryckligen listat under "Nästa
 * annonser" och som ännu inte fått en BRIEF-rad. **De är gratis mot taket**
 * (Axels beslut 2026-09-21). Skälet: varje lärdom MÅSTE redan sluta med
 * namngivna nästa annonser — det är spärren i `validera()`. Namnet är alltså
 * redan ett tänkt beslut, och en hook-swap eller en 20 %-uppsnabbning som
 * lärdomen föreskrivit ska inte behöva konkurrera om kvoten med ett helt nytt
 * koncept. Taket finns för att stoppa produktion UTAN tanke bakom, inte
 * produktion som en lärdom bett om.
 *
 * `tak_totalt` = summan, och det är den rondens `rundaAntal` ska mätas mot.
 */
export function brieftak(logg, kampanjId, { idag = null, befintliga = [] } = {}) {
  const sedan = senasteKlar(logg, kampanjId);
  const nya = logg.filter((r) => r.kod === LARDOM_KOD && String(r.kampanj_id) === String(kampanjId) && (!sedan || String(r.datum) >= sedan) && (!idag || String(r.datum) <= String(idag)));
  const vantar = oskrivna(logg, { kampanjId }).length;
  const redanBriefade = new Set(briefer(logg, kampanjId).map((r) => String(r.annons_namn ?? '').toLowerCase()));
  // Regel (b), Axels tillägg 2026-09-22: en namngiven annons som REDAN finns —
  // som brief i loggen, som rad i Notion eller som annons i kontot — ger ingen
  // plats. Lärdomen är då redan utförd, och en plats till hade byggt en
  // dubblett. `befintliga` fylls av anroparen ur kontot/Notion; den här filen
  // gör aldrig I/O.
  const finns = new Set([...redanBriefade, ...befintliga.map((n) => String(n ?? '').toLowerCase())]);
  const namngivna = [];
  const struket = [];
  for (const r of nya) {
    for (const rad of r.nasta ?? []) {
      const n = namnUrNasta(rad);
      if (!n || namngivna.includes(n)) continue;
      if (finns.has(n.toLowerCase())) { if (!struket.includes(n)) struket.push(n); continue; }
      namngivna.push(n);
    }
  }
  return { tak: nya.length, tak_totalt: nya.length + namngivna.length, namngivna, struket, lardomar: nya.map((r) => r.lardom_id), sedan, etiketterade_utan_lardom: vantar };
}

/**
 * Regel (a), Axels tillägg 2026-09-22: **en brief som tar en namngiven plats
 * måste heta det namnet.**
 *
 * Buggen den rättar, mätt på rondens egen körning 2026-09-22: Taköverdragets
 * lärdom namngav `Takoverdrag_OB_2_H1`, `SP_6_1` och `CS_14_1`. Taket vidgades
 * från 1 till 4 på de namnen — och sedan briefades fyra HELT ANDRA annonser
 * (`OB_3_H1`, `GT_11_H1`, `CS_2_H2`, `CS_2_H3`). Undantaget blev en större
 * kvot i stället för en riktad, och `OB_3_H1` blev en dubblett av en brief som
 * redan låg i Notion.
 *
 * Domen: högst `tak` briefer får bära namn som ingen lärdom bett om. Varje
 * brief därutöver måste finnas i `namngivna`. Ren funktion.
 */
export function provaBriefkvot(logg, kampanjId, namn = [], { idag = null, befintliga = [] } = {}) {
  const tak = brieftak(logg, kampanjId, { idag, befintliga });
  const kvar = new Set(tak.namngivna.map((n) => n.toLowerCase()));
  const fria = [];
  const riktade = [];
  for (const n of namn) {
    const l = String(n ?? '').toLowerCase();
    if (kvar.has(l)) { kvar.delete(l); riktade.push(n); continue; }
    fria.push(n);
  }
  const fel = [];
  if (fria.length > tak.tak) {
    fel.push(`${fria.length} briefer bär namn som ingen lärdom bett om, men taket är ${tak.tak} (en per lärdom sedan förra batchen). Övertaliga: ${fria.slice(tak.tak).join(', ')}. Döp om dem till namnen lärdomen gav (${tak.namngivna.join(', ') || 'inga kvar'}) eller skriv fler lärdomar först.`);
  }
  for (const n of tak.struket) {
    if (namn.some((x) => String(x).toLowerCase() === n.toLowerCase())) {
      fel.push(`${n} finns redan som brief, i Notion eller i kontot — lärdomen är utförd. Briefa den inte igen.`);
    }
  }
  return { ok: fel.length === 0, fel, tak: tak.tak, tak_totalt: tak.tak_totalt, fria, riktade, namngivna: tak.namngivna, struket: tak.struket };
}

/** Levande breakthroughs (punkt 7, 9): etikett BREAKTHROUGH inom LEVANDE_DAGAR, inte pausad som tjuv. */
export function levandeBreakthroughs(logg, kampanjId, { idag }) {
  const pausade = new Set(logg.filter((r) => r.kod === 'TJUV_PAUSAD' && r.genomford === true).map((r) => String(r.annons_id)));
  const ut = [];
  for (const e of etiketter(logg).values()) {
    if (String(e.kampanj_id) !== String(kampanjId) || e.etikett !== ETIKETT.BREAKTHROUGH) continue;
    if (pausade.has(String(e.annons_id))) continue;
    const alder = idag ? dagarMellan(e.datum, idag) : 0;
    if (alder === null || alder > LEVANDE_DAGAR) continue;
    ut.push({ ...e, alder });
  }
  return ut;
}

/**
 * Spärr 1 för motorns höjda tak (Axels beslut 2026-09-21): har kampanjen en
 * etiketterad BREAKTHROUGH eller SPEND_WINNER inom `dagar` dygn?
 *
 * Bredare än `levandeBreakthroughs` med flit — taket ska öppnas av en bevisad
 * vinnare, och en SPEND_WINNER är bevisad: Meta gav den spenden. Tjuvpausade
 * annonser räknas inte (de är avstängda, inte vinnare), och en etikett som
 * saknar datum räknas aldrig — hellre stängt tak än ett tak öppnat på okänd
 * ålder. Ren funktion: loggen in, ja/nej ut.
 */
export function harLevandeVinnare(logg, kampanjId, { idag, dagar = LEVANDE_DAGAR } = {}) {
  const pausade = new Set(logg.filter((r) => r.kod === 'TJUV_PAUSAD' && r.genomford === true).map((r) => String(r.annons_id)));
  for (const e of etiketter(logg).values()) {
    if (String(e.kampanj_id) !== String(kampanjId)) continue;
    if (e.etikett !== ETIKETT.BREAKTHROUGH && e.etikett !== ETIKETT.SPEND_WINNER) continue;
    if (pausade.has(String(e.annons_id))) continue;
    const alder = idag ? dagarMellan(e.datum, idag) : null;
    if (alder === null || alder > dagar) continue;
    return true;
  }
  return false;
}

/** Mixen ur etiketterna (punkt 7). */
export function mix(logg, kampanjId, { idag }) {
  const bt = levandeBreakthroughs(logg, kampanjId, { idag });
  return bt.length ? { ...MIX.medBreakthrough, skal: `levande breakthrough: ${bt.map((b) => b.annons_namn).join(', ')}`, breakthroughs: bt } : { ...MIX.utanVinnare, skal: 'ingen levande breakthrough', breakthroughs: [] };
}

/**
 * Vidarebygg-behoven (punkt 9): varje levande breakthrough som inte fått tre
 * iterationer (BRIEF-rader med parent = annonsen) inom 14 dagar från etiketten.
 */
export function vidarebyggBehov(logg, kampanjId, { idag }) {
  const ut = [];
  for (const b of levandeBreakthroughs(logg, kampanjId, { idag })) {
    const iterationer = briefer(logg, kampanjId).filter((r) => String(r.parent ?? '').toLowerCase() === String(b.annons_namn).toLowerCase());
    const kvar = Math.max(0, VIDAREBYGG_ITERATIONER - iterationer.length);
    const deadline = datumPlus(b.datum, VIDAREBYGG_DAGAR);
    const forsent = idag && String(idag) > deadline;
    if (kvar === 0) continue;
    ut.push({ annons_id: b.annons_id, annons_namn: b.annons_namn, etikett_datum: b.datum, deadline, iterationer: iterationer.length, kvar, forsent, lardom: lardomId(b.annons_id), har_lardom: lardomar(logg).has(String(b.annons_id)) });
  }
  return ut;
}

/**
 * Konceptets läge mot taket (punkt 18): iterationer, hur många som har lärdom,
 * om någon slår originalet, forskningens styrka, och rekommendationen.
 */
export function konceptStatus(logg, kampanjId, koncept) {
  const k = String(koncept ?? '').toLowerCase();
  const rader = briefer(logg, kampanjId).filter((r) => String(r.koncept ?? '').toLowerCase() === k);
  const original = rader.find((r) => String(r.typ).toUpperCase() === 'N' || String(r.typ).toUpperCase() === 'IM') ?? rader[0] ?? null;
  const iterationer = rader.filter((r) => r !== original);
  const etik = etiketter(logg);
  const perNamn = new Map([...etik.values()].map((e) => [String(e.annons_namn).toLowerCase(), e]));
  const lard = lardomar(logg);
  const medLardom = iterationer.filter((r) => { const e = perNamn.get(String(r.annons_namn).toLowerCase()); return e && lard.has(String(e.annons_id)); }).length;
  const origE = original ? perNamn.get(String(original.annons_namn).toLowerCase()) : null;
  const slar = iterationer.some((r) => { const e = perNamn.get(String(r.annons_namn).toLowerCase()); if (!e) return false; if (e.etikett === ETIKETT.BREAKTHROUGH) return true; return origE && num(e.roas_ad) !== null && num(origE.roas_ad) !== null && num(e.roas_ad) > num(origE.roas_ad) && (e.andel ?? 0) >= (origE.andel ?? 0); });
  const kalla = String(original?.kalla ?? '').toLowerCase();
  const forskning = !kalla ? 'okänd' : RESEARCH_KALLOR.includes(kalla) ? 'stark' : 'svag';
  let rekommendation;
  if (iterationer.length < TAK_ITERATIONER) rekommendation = `iterera (${iterationer.length} av ${TAK_ITERATIONER}, ${medLardom} med lärdom)`;
  else if (medLardom < iterationer.length) rekommendation = `skriv lärdomarna först (${medLardom} av ${iterationer.length} har lärdom) — ingen ny iteration utan dem`;
  else if (slar) rekommendation = 'en iteration slår originalet — bygg vidare på den (nytt koncept-namn om löftet bytts)';
  else if (forskning === 'stark') rekommendation = `fler försök tillåtna (stark forskning: ${kalla}) — iteration ${iterationer.length + 1} räknad`;
  else rekommendation = `SLÄPP — ${iterationer.length} iterationer med lärdom, ingen slår originalet, forskningen ${forskning}${kalla ? ` (${kalla})` : ''}`;
  return { koncept, original: original?.annons_namn ?? null, iterationer: iterationer.length, med_lardom: medLardom, slar_original: slar, forskning, kalla: kalla || null, rekommendation };
}

function datumPlus(iso, dagar) {
  const t = Date.parse(`${iso}T00:00:00Z`);
  return Number.isFinite(t) ? new Date(t + dagar * 86400000).toISOString().slice(0, 10) : null;
}

// ------------------------------------------------------------------ skelettet

/** Diagnosordningen per utfall (punkt 9–12) — står i skelettet så sessionen läser rätt sak först. */
export function diagnos(etikett, { bof = false } = {}) {
  if (bof) return 'BOF — räknas inte i frekvensen; lärdomen handlar om invändningen den svarar på.';
  switch (etikett) {
    case ETIKETT.BREAKTHROUGH: return 'Breakthrough: tre iterationer inom 14 dagar, börja i manuslistan (nya hookar → längre problemdel → in media res). Aldrig en ren kopia av top spendern.';
    case ETIKETT.SPEND_WINNER: return 'Spend winner: läs FÖRST kommentarerna på annonsen (node tools/annonskommentarer.mjs --annons <id>) — vad invänder publiken mot? Sedan konverteringsgraden, sedan manuset. Saknas tro, brådska, insats eller funnel-kongruens? Lägg bara till den delen, bygg inte om hela annonsen.';
    case ETIKETT.KPI_WINNER: return 'KPI winner: läs hook rate, sedan hold rate, sedan förbi hooken. Den säljer men får inte spend — får den ingen spend på sju dagar är den en förlorare.';
    case ETIKETT.LOSER: return 'Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).';
    case ETIKETT.INGEN_LEVERANS: return 'Ingen leverans: hooken föll för Meta — logga och släpp, aldrig ABO.';
    default: return 'Ingen data — skriv vad som saknas.';
  }
}

/** Ett skelett för EN etiketterad annons. Datan ifylld, luckorna märkta [FYLL I]. */
export function skelett(e, { brief = null, taggar = null, briefFil = null } = {}) {
  const t = taggar ?? (brief ? taggarUrBrief(brief) : null);
  const spendK = num(e.spend_kampanj);
  const spendA = num(e.spend_ad);
  const kop = num(e.kop) ?? 0;
  const roas = num(e.roas_ad);
  const cpa = spendA !== null && kop > 0 ? spendA / kop : null;
  const cvr = num(e.cvr);
  const lpv = num(e.lpv);
  const klick = num(e.klick);
  const cvrText = cvr !== null ? `${pct(cvr, 1)} (${kop} köp / ${lpv ?? klick} ${lpv !== null ? 'LPV' : 'klick'})` : (e.backfill ? 'okänd — backfillad före 2026-09-21 (inga klick i fönstret hämtade)' : 'okänd — hämta inline_link_clicks/landing_page_view i etikettjobbet');
  const hookar = [];
  if (e.hook_text) hookar.push(`- Bild/text: "${e.hook_text}" (källa: ${e.hook_kalla ?? 'brief'})`);
  if (e.hook_vo) hookar.push(`- VO: "${e.hook_vo}"`);
  if (!hookar.length) hookar.push('- [FYLL I: hooken ordagrant ur briefen eller den live annonsen — bild/text och VO var för sig; "ingen text" om bilden saknar text]');
  const komp = KOMPONENTER.map((k) => `| ${k[0].toUpperCase() + k.slice(1)} | ${komponentVarde(t, k) ?? (t ? '— (taggen saknas i briefen)' : '— (brief saknas i repot)')} | [FYLL I: ur den live annonsen] | [ja/nej/okänd] |`);
  const id = lardomId(e.annons_id);
  const konceptRad = t?.koncept ? `**Koncept:** ${t.koncept} · **Typ:** ${t.typ ?? '—'} · **Parent:** ${t.parent ?? '—'} · **Iteration:** ${t.iteration ?? '—'} · **Källa:** ${t.kalla ?? t.source ?? '—'}` : `**Koncept/typ/parent/källa:** ${briefFil ? 'taggarna saknas i briefen' : 'brief saknas i repot — läs annonsen'}`;
  return [
    `### Lärdom ${id} — ${e.annons_namn} (${e.etikett}, etikett ${e.datum})`,
    '',
    '| Fält | Värde |',
    '|---|---|',
    `| Batch | ${e.batch ?? 'okänd'} |`,
    `| Utfall | ${e.etikett}${e.osaker_breakthrough ? ' (osäker — kan ha varit breakthrough)' : ''}${e.bof ? ' · BOF' : ''} |`,
    `| Fönster | ${e.d0} – ${e.d6} (annonsens första vecka, 7d_click) |`,
    `| Spend annons / kampanj | ${kr(spendA)} / ${kr(spendK)}${e.andel !== null && e.andel !== undefined ? ` (${pct(e.andel)})` : ''} |`,
    `| Köp | ${kop} |`,
    `| ROAS / CPA | ${dec(roas)} / ${cpa !== null ? kr(cpa) : 'ingen (0 köp)'} — kampanjens ROAS ${dec(e.roas_kampanj)} |`,
    `| Konverteringsgrad | ${cvrText} |`,
    `| Hook rate / hold rate | ${pct(num(e.hook_rate))} / ${pct(num(e.hold_rate))} |`,
    `| Bedömbar | ${e.bedombar ? 'ja' : 'nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom)'} |`,
    '',
    konceptRad,
    briefFil ? `**Brief:** \`${briefFil}\`` : '',
    '',
    '**Hookar (ordagrant, med hook rate / hold rate ovan):**',
    ...hookar,
    '',
    '**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):',
    '| Komponent | Planerat | Utfört | Stämmer |',
    '|---|---|---|---|',
    ...komp,
    `**Utförandet föll:** [ja/nej/okänd] · utford_som_briefad: ${e.utford_som_briefad ?? 'okänd'}`,
    '',
    `**Diagnos:** ${diagnos(e.etikett, { bof: e.bof })}`,
    '',
    '**Hypotes (gissning):** [FYLL I: varför blev utfallet som det blev — en mening, märkt gissning, aldrig fakta]',
    '',
    '**Nästa annonser:**',
    '- [FYLL I: `<Prefix>_<K>_<n>_<variant>` — typ N/IM/I, parent, vad som ändras — eller `SLÄPP` med skälet]',
    '',
  ].filter((r) => r !== null).join('\n');
}

// ------------------------------------------------------------------ validering

/** Delar en markdown-fil i lärdomsblock (### Lärdom L-… — …). */
export function delaBlock(text) {
  const rader = String(text ?? '').replace(/\r\n?/g, '\n').split('\n');
  const block = [];
  let nu = null;
  for (const r of rader) {
    if (/^###\s+Lärdom\s+L-/i.test(r)) { if (nu) block.push(nu); nu = { rubrik: r, rader: [r] }; continue; }
    if (nu) nu.rader.push(r);
  }
  if (nu) block.push(nu);
  return block.map((b) => ({ ...b, text: b.rader.join('\n') }));
}

const falt = (text, namn) => { const m = new RegExp(`^\\|\\s*${namn}\\s*\\|\\s*(.*?)\\s*\\|\\s*$`, 'im').exec(text); return m ? m[1].trim() : null; };

/**
 * Validerar ETT lärdomsblock mot CS-KLART punkt 1–4. Ren.
 * Returnerar { ok, fel: [], lardom: { lardom_id, annons_id, annons_namn, utfall, batch, utford, komponenter, hypotes, nasta } }.
 */
export function validera(text) {
  const fel = [];
  const F = (t) => fel.push(t);
  const rub = /^###\s+Lärdom\s+(L-\d+)\s+—\s+(\S+)\s+\((\w+)[^)]*\)/i.exec(String(text ?? '').split('\n')[0] ?? '');
  if (!rub) F('rubriken ska vara "### Lärdom L-<annons_id> — <annonsnamn> (<UTFALL>, etikett <datum>)"');
  const lardom_id = rub?.[1] ?? null;
  const annons_namn = rub?.[2] ?? null;
  const utfall = rub?.[3]?.toUpperCase() ?? null;
  for (const [namn, rubrik] of [['Batch', 'batchnummer'], ['Utfall', 'utfallet'], ['Spend annons / kampanj', 'annonsens och kampanjens spend i samma fönster'], ['ROAS / CPA', 'ROAS eller CPA'], ['Konverteringsgrad', 'konverteringsgraden'], ['Hook rate / hold rate', 'hook rate och hold rate']]) {
    const v = falt(text, namn.replace(/[/]/g, '\\/'));
    if (!v) F(`fältet "${namn}" saknas (${rubrik})`);
    else if (/\[FYLL I/i.test(v)) F(`fältet "${namn}" är inte ifyllt`);
  }
  if (/\[FYLL I/i.test(String(text).split('**Hookar')[1]?.split('**Planerat')[0] ?? '')) F('hookarna är inte ifyllda (ordagrant, bild/text och VO)');
  if (!/\*\*Hookar/i.test(text)) F('avsnittet "Hookar (ordagrant …)" saknas');
  // Komponenterna — alla sju, planerat och utfört ifyllda, stämmer ja/nej/okänd.
  const komponenter = {};
  for (const k of KOMPONENTER) {
    const re = new RegExp(`^\\|\\s*${k}\\s*\\|\\s*(.*?)\\s*\\|\\s*(.*?)\\s*\\|\\s*(.*?)\\s*\\|\\s*$`, 'im');
    const m = re.exec(text);
    if (!m) { F(`komponentraden "${k}" saknas i "Planerat mot utfört"`); continue; }
    const [, planerat, utfort, stammer] = m;
    if (!planerat || /\[FYLL I/i.test(planerat)) F(`komponent "${k}": planerat är tomt`);
    if (!utfort || /\[FYLL I/i.test(utfort)) F(`komponent "${k}": utfört är tomt — läs den live annonsen`);
    if (!/^(ja|nej|okänd)$/i.test(stammer.trim())) F(`komponent "${k}": "Stämmer" ska vara ja, nej eller okänd (står "${stammer.trim()}")`);
    komponenter[k] = { planerat, utfort, stammer: stammer.trim().toLowerCase() };
  }
  const utfM = /\*\*Utförandet föll:\*\*\s*(ja|nej|okänd)/i.exec(text);
  if (!utfM) F('"Utförandet föll:" ska vara ja, nej eller okänd');
  const avvikelser = Object.entries(komponenter).filter(([, v]) => v.stammer === 'nej').map(([k]) => k);
  if (utfM && utfM[1].toLowerCase() === 'nej' && avvikelser.length) F(`"Utförandet föll: nej" men komponenter avviker (${avvikelser.join(', ')}) — då föll utförandet`);
  // Hypotesen — märkt gissning.
  const hyp = /\*\*Hypotes\s*\((gissning)\)\s*:\*\*\s*(.+)/i.exec(text);
  if (!hyp) F('"**Hypotes (gissning):**" saknas — hypotesen ska vara uttryckligen märkt gissning');
  else if (/\[FYLL I/i.test(hyp[2]) || hyp[2].trim().length < 15) F('hypotesen är inte skriven');
  else if (/\b(bevisar|bevisat|är fakta|definitivt|garanterat)\b/i.test(hyp[2])) F('hypotesen skrivs som fakta ("bevisar"/"definitivt") — den är en gissning');
  // Nästa annonser — minst en konkret rad, eller SLÄPP med skäl.
  const nastaSekt = String(text).split(/\*\*Nästa annonser:\*\*/i)[1];
  const nasta = [];
  if (nastaSekt === undefined) F('"**Nästa annonser:**" saknas — en lärdom utan nästa annonser är en dagbok');
  else {
    for (const r of nastaSekt.split('\n')) {
      const m = /^\s*[-*]\s+(.+)$/.exec(r);
      if (!m || /\[FYLL I/i.test(m[1])) continue;
      nasta.push(m[1].trim());
    }
    if (!nasta.length) F('"Nästa annonser" är tom — minst en konkret annons (namn + typ + vad som ändras) eller SLÄPP med skäl');
    for (const n of nasta) {
      const slapp = /^`?SLÄPP`?/i.test(n);
      const namnOk = /`?[A-Za-zÅÄÖåäö0-9]+(?:_[A-Za-zÅÄÖåäö0-9]+)*_[A-Z]{1,4}_\d+(?:_[A-Za-z0-9]+)?`?/.test(n);
      if (!slapp && !namnOk) F(`nästa annons "${n.slice(0, 60)}" har inget annonsnamn (<Prefix>_<K>_<n>[_<variant>]) — konkret, inte "testa fler hookar"`);
      if (slapp && !/\S{3,}.*\S{3,}/.test(n.replace(/^`?SLÄPP`?/i, ''))) F('SLÄPP utan skäl');
    }
  }
  const utford = /utford_som_briefad:\s*(ja|nej|okänd)/i.exec(text)?.[1]?.toLowerCase() ?? 'okänd';
  return {
    ok: fel.length === 0, fel,
    lardom: { lardom_id, annons_id: lardom_id ? lardom_id.slice(2) : null, annons_namn, utfall, batch: falt(text, 'Batch'), utford, komponenter, avvikelser, hypotes: hyp?.[2]?.trim() ?? null, nasta, utforandet_foll: utfM?.[1]?.toLowerCase() ?? null },
  };
}

/** LARDOM-raden ur ett validerat block + etikettraden. Aldrig ny_budget. */
export function lardomRad(v, e, { idag, fil }) {
  return {
    datum: idag, kampanj_id: String(e.kampanj_id), kampanj_namn: String(e.kampanj_namn ?? ''), ad_account_id: String(e.ad_account_id ?? ''),
    kod: LARDOM_KOD, annons_id: String(e.annons_id), annons_namn: e.annons_namn, lardom_id: v.lardom_id, batch: e.batch ?? null, utfall: v.utfall,
    utford_som_briefad: v.utford, utforandet_foll: v.utforandet_foll, komponent_avvikelser: v.avvikelser, hypotes: v.hypotes, nasta: v.nasta, fil,
    genomford: true, godkand_av: 'auto — lärdom per etiketterad annons, Axels definition av klart 2026-09-21',
  };
}

// ------------------------------------------------------------------ briefer (punkt 6, 13, 14)

/** Taggarna som varje brief ska bära (punkt 13) + lardom (punkt 6). */
export const BRIEF_TAGGAR = Object.freeze(['typ', 'avatar', 'awareness', 'begar', 'mekanism', 'tro', 'urgency', 'hook-mekanik', 'lardom']);
const TAGG_ALIAS = { type: 'typ', desire: 'begar', begär: 'begar', mechanism: 'mekanism', belief: 'tro', 'hook-mechanic': 'hook-mekanik', hookmekanik: 'hook-mekanik', learning: 'lardom', lärdom: 'lardom', concept: 'koncept', source: 'kalla', källa: 'kalla', medvetandenivå: 'awareness', brådska: 'urgency' };

/** Normaliserar taggnycklarna till de svenska. */
export function normaliseraTaggar(t) {
  const ut = {};
  for (const [k, v] of Object.entries(t ?? {})) ut[TAGG_ALIAS[k] ?? k] = v;
  if (ut.typ) ut.typ = ({ ny: 'N', new: 'N', imiterad: 'IM', imitation: 'IM', imitated: 'IM', iteration: 'I', messaging: 'M', statisk: 'S', static: 'S' })[String(ut.typ).toLowerCase()] ?? String(ut.typ).toUpperCase();
  return ut;
}

/**
 * BRIEF-raden för en brief: kräver lardom=L-… som finns i loggen (punkt 6),
 * typ + parent för I/IM, räknar iterationsnumret ur loggen (punkt 14) och
 * jämför med briefens egen siffra. Ren. Returnerar { ok, fel, varningar, rad }.
 */
export function briefRad(brief, { logg, kampanj, idag, batch = null }) {
  const fel = [];
  const varningar = [];
  const t = normaliseraTaggar(taggarUrBrief(brief.text));
  if (!Object.keys(t).length) fel.push('ingen taggrad (VARIABELTAGGAR: / Variables:)');
  for (const k of BRIEF_TAGGAR) if (!t[k]) fel.push(`taggen ${k}= saknas`);
  const lard = lardomar(logg);
  const lardomIds = new Set([...lard.values()].map((r) => String(r.lardom_id)));
  if (t.lardom) {
    const ids = String(t.lardom).split(/\s*[,+]\s*/).map((x) => x.trim());
    for (const id of ids) if (!/^L-\d+$/.test(id)) fel.push(`lardom=${id} är inget lärdoms-id (L-<annons_id>)`); else if (!lardomIds.has(id)) fel.push(`lardom=${id} finns inte i loggen — skriv lärdomen först (node agent/lardom.mjs --skriv), annars skrivs briefen inte`);
  }
  const typ = t.typ ?? null;
  if (typ && !['N', 'IM', 'I', 'M', 'S'].includes(typ)) fel.push(`typ=${typ} — ska vara N (ny), IM (imiterad), I (iteration), M (messaging) eller S (statisk validering)`);
  const parent = t.parent && !/^(none|ingen|—|-)$/i.test(t.parent) ? t.parent : null;
  if (['I', 'IM', 'M'].includes(typ) && !parent) fel.push(`typ=${typ} utan parent=`);
  if (typ === 'N' && parent) fel.push('typ=N med parent — en ny vinkel har ingen förälder (samma löfte med nya ord är en iteration, punkt 19)');
  const koncept = t.koncept ?? (parent ? rotKoncept(logg, kampanj.id, parent) : null) ?? null;
  if (!koncept) varningar.push('koncept= saknas och kunde inte härledas ur parent — iterationsnumret räknas per koncept, sätt koncept=');
  const iter = koncept ? nastaIteration(logg, kampanj.id, koncept) : null;
  if (iter !== null && t.iteration && num(t.iteration) !== iter) varningar.push(`briefen säger iteration=${t.iteration}, loggen räknar ${iter} på konceptet "${koncept}" — loggen vinner`);
  // Punkt 19: ny vinkel = annan avatar, annat begär eller annan känslomässig ingång.
  if (typ === 'N') {
    const lika = briefer(logg, kampanj.id).find((r) => r.avatar && r.begar && String(r.avatar).toLowerCase() === String(t.avatar ?? '').toLowerCase() && String(r.begar).toLowerCase() === String(t.begar ?? '').toLowerCase() && String(r.mekanism ?? '').toLowerCase() === String(t.mekanism ?? '').toLowerCase());
    if (lika) varningar.push(`typ=N men samma avatar, begär och mekanism som ${lika.annons_namn} — samma löfte med nya ord är en iteration (punkt 19); sätt typ=I och parent=${lika.annons_namn}`);
  }
  const rad = {
    datum: idag, kampanj_id: String(kampanj.id), kampanj_namn: String(kampanj.namn ?? ''), ad_account_id: String(kampanj.ad_account_id ?? ''),
    kod: BRIEF_KOD, annons_namn: brief.namn, format: brief.typ ?? null, batch, typ, parent, koncept, iteration_nr: iter, lardom: t.lardom ?? null,
    avatar: t.avatar ?? null, awareness: t.awareness ?? null, begar: t.begar ?? null, mekanism: t.mekanism ?? null, tro: t.tro ?? null, urgency: t.urgency ?? null, 'hook-mekanik': t['hook-mekanik'] ?? null, kalla: t.kalla ?? null,
    notion_url: brief.url ?? null, genomford: true, godkand_av: 'auto — brief loggad, Axels definition av klart 2026-09-21',
  };
  return { ok: fel.length === 0, fel, varningar, rad };
}

/** Konceptet bakom en förälder: BRIEF-raden med det annonsnamnet, annars null. */
function rotKoncept(logg, kampanjId, parent) {
  const r = briefer(logg, kampanjId).find((x) => String(x.annons_namn).toLowerCase() === String(parent).toLowerCase());
  return r?.koncept ?? null;
}

// ------------------------------------------------------------------ status (punkt 15, 16)

/** Räkningen till rapporten. Ren. */
export function status(logg, { idag, karta = {} }) {
  const idagRader = (kod) => logg.filter((r) => r.kod === kod && String(r.datum) === String(idag));
  const lardomarIdag = idagRader(LARDOM_KOD);
  const brieferIdag = idagRader(BRIEF_KOD);
  const paLardom = brieferIdag.filter((r) => r.lardom);
  const utan = oskrivna(logg);
  const perKampanj = new Map();
  for (const e of utan) { const k = String(e.kampanj_id); perKampanj.set(k, (perKampanj.get(k) ?? { namn: e.kampanj_namn, antal: 0, bedombara: 0 })); perKampanj.get(k).antal += 1; if (e.bedombar) perKampanj.get(k).bedombara += 1; }
  const kampanjer = [...new Set(logg.filter((r) => ETIKETTKODER.includes(r.kod)).map((r) => String(r.kampanj_id)))];
  const tak = {};
  const mixar = {};
  const vidare = [];
  const koncept = [];
  for (const k of kampanjer) {
    tak[k] = brieftak(logg, k, { idag });
    mixar[k] = mix(logg, k, { idag });
    vidare.push(...vidarebyggBehov(logg, k, { idag }).map((v) => ({ kampanj_id: k, ...v })));
    for (const c of new Set(briefer(logg, k).map((r) => r.koncept).filter(Boolean))) koncept.push({ kampanj_id: k, ...konceptStatus(logg, k, c) });
  }
  return {
    idag,
    lardomar_idag: lardomarIdag.length,
    briefer_idag: brieferIdag.length,
    briefer_pa_lardom: paLardom.length,
    etiketterade_utan_lardom: utan.length,
    etiketterade_utan_lardom_bedombara: utan.filter((e) => e.bedombar).length,
    per_kampanj: [...perKampanj.entries()].map(([id, v]) => ({ kampanj_id: id, ...v })).sort((a, b) => b.bedombara - a.bedombara || b.antal - a.antal),
    brieftak: tak, mix: mixar, vidarebygg: vidare, koncept_vid_taket: koncept.filter((c) => c.iterationer >= TAK_ITERATIONER),
    frekvens: breakthroughFrekvens(logg),
  };
}

/** Rapportraderna (svenska; rond-auto översätter till engelska i Discord). */
export function formateraStatus(s) {
  const ut = [];
  ut.push(`Lärdomar skrivna i dag: ${s.lardomar_idag}. Etiketterade annonser utan lärdom: ${s.etiketterade_utan_lardom} (varav bedömbara ${s.etiketterade_utan_lardom_bedombara}).`);
  ut.push(`Briefer i dag: ${s.briefer_idag}, varav på en lärdom: ${s.briefer_pa_lardom}${s.briefer_idag && s.briefer_pa_lardom < s.briefer_idag ? ' ⚠ briefer utan lärdom får inte skrivas (punkt 6)' : ''}.`);
  for (const p of s.per_kampanj.slice(0, 12)) ut.push(`  utan lärdom: ${String(p.namn).split('|')[0].trim()} — ${p.antal} (bedömbara ${p.bedombara})`);
  if (s.vidarebygg.length) { ut.push('Vidarebygg (punkt 9):'); for (const v of s.vidarebygg) ut.push(`  ${v.annons_namn}: ${v.iterationer} av ${VIDAREBYGG_ITERATIONER} iterationer, ${v.kvar} kvar, deadline ${v.deadline}${v.forsent ? ' ⚠ FÖRSENAD' : ''}${v.har_lardom ? '' : ' ⚠ saknar lärdom'}`); }
  if (s.koncept_vid_taket.length) { ut.push('Koncept vid taket (punkt 18):'); for (const c of s.koncept_vid_taket) ut.push(`  ${c.koncept}: ${c.iterationer} iterationer (${c.med_lardom} med lärdom), forskning ${c.forskning} → ${c.rekommendation}`); }
  ut.push(formateraFrekvenser(s.frekvens));
  return ut.join('\n');
}

// ------------------------------------------------------------------ CLI

async function huvud(argv) {
  const flagga = (n, s = null) => { const i = argv.indexOf(`--${n}`); return i !== -1 && argv[i + 1] !== undefined && !argv[i + 1].startsWith('--') ? argv[i + 1] : s; };
  const finns = (n) => argv.includes(`--${n}`);
  const idag = flagga('idag') ?? new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Stockholm' }).format(new Date());
  const torr = finns('torr');
  const logg = await lasLogg();
  const karta = lasProduktkarta();

  if (finns('status')) {
    const s = status(logg, { idag, karta });
    console.log(finns('json') ? JSON.stringify(s, null, 2) : formateraStatus(s));
    return;
  }

  if (finns('skelett')) {
    const konto = String(flagga('konto', 'alla')).toUpperCase();
    const kontoId = { SE: '1867947880635861', NO: '1050941584152547' }[konto] ?? null;
    const lista = oskrivna(logg, { kampanjId: flagga('kampanj'), adAccountId: kontoId, baraBedombara: finns('bara-bedombara'), idag, turordning: !finns('utan-turordning') });
    const ut = [`# Lärdomar att skriva — ${idag}`, '', `${lista.length} etiketterade annonser utan lärdom${kontoId ? ` (${konto})` : ''}. Fyll varje [FYLL I], spara, kör \`node agent/lardom.mjs --skriv <fil>\`. En annons är inte klar förrän raden LARDOM finns.`, ''];
    let perK = null;
    for (const e of lista) {
      const k = karta[String(e.kampanj_id)] ?? { produkt: String(e.kampanj_namn).split('|')[0].trim(), campaign_id: e.kampanj_id };
      if (perK !== String(e.kampanj_id)) { perK = String(e.kampanj_id); ut.push(`## ${k.produkt} (${e.kampanj_id})`, ''); }
      const mapp = minnesmapp(k);
      const bf = hittaBrief(mapp, e.annons_namn);
      const brief = bf ? readFileSync(bf, 'utf8') : null;
      ut.push(skelett(e, { brief, briefFil: bf ? bf.replace(`${ROT}/`, '') : null }));
    }
    const fil = flagga('ut') ?? join(HÄR, 'utdata', `lardom-skelett-${idag}${kontoId ? `-${konto.toLowerCase()}` : ''}.md`);
    mkdirSync(dirname(fil), { recursive: true });
    writeFileSync(fil, `${ut.join('\n')}\n`);
    console.log(`${lista.length} skelett skrivna till ${fil.replace(`${ROT}/`, '')}`);
    return;
  }

  if (flagga('skriv')) {
    const fil = resolve(flagga('skriv'));
    const block = delaBlock(readFileSync(fil, 'utf8'));
    if (!block.length) { console.error('✗ inga lärdomsblock ("### Lärdom L-…") i filen'); process.exit(1); }
    const etik = etiketter(logg);
    const skrivna = lardomar(logg);
    const resultat = [];
    let fel = 0;
    for (const b of block) {
      const v = validera(b.text);
      const e = v.lardom.annons_id ? etik.get(String(v.lardom.annons_id)) : null;
      if (!e) v.fel.push(`ingen ETIKETT-rad för annons ${v.lardom.annons_id ?? '?'} — lärdomen hör till en etiketterad annons`);
      else if (e.annons_namn !== v.lardom.annons_namn) v.fel.push(`annonsnamnet i rubriken (${v.lardom.annons_namn}) matchar inte etikettraden (${e.annons_namn})`);
      if (v.lardom.annons_id && skrivna.has(String(v.lardom.annons_id))) v.fel.push(`lärdomen ${v.lardom.lardom_id} finns redan (${skrivna.get(String(v.lardom.annons_id)).datum}) — en lärdom skrivs en gång`);
      if (v.fel.length) { fel += 1; console.log(`❌ ${b.rubrik}`); for (const f of v.fel) console.log(`   🔴 ${f}`); continue; }
      resultat.push({ v, e, b });
      console.log(`✅ ${b.rubrik}`);
    }
    if (fel) { console.log(`\n❌ ${fel} av ${block.length} block har fel — inget skrivet. Rätta och kör om.`); process.exit(1); }
    if (torr) { console.log(`\n--torr: ${resultat.length} lärdomar validerade, inget skrivet.`); return; }
    for (const { v, e, b } of resultat) {
      const k = karta[String(e.kampanj_id)] ?? { produkt: String(e.kampanj_namn).split('|')[0].trim(), campaign_id: e.kampanj_id };
      // Splittra ALDRIG produktminnet i en ny mapp när en befintlig troligen
      // hör till produkten (Axels bugg 2026-09-21). En helt ny produkt får en
      // ny mapp — det är rätt. En produkt som redan har minne får inte det.
      let mapp = minnesmapp(k);
      if (!mapp) {
        const nara = narmasteMinnesmapp(k.produkt);
        if (nara) {
          console.error(`\n✗ ${e.annons_namn}: kampanjen "${k.produkt}" saknar \`minne\` i agent/produktkarta.json, och sluggen pekar på en NY mapp fast produktminnet redan finns i products/${nara}/.`);
          console.error('  Inget skrivet. Lägg in raden i produktkartan och kör om:');
          console.error(`    "campaign_id": "${e.kampanj_id}", "minne": "products/${nara}"`);
          process.exit(1);
        }
        mapp = `products/${slug(k.produkt)}`;
      }
      const mål = join(ROT, mapp, 'lardomar.md');
      mkdirSync(dirname(mål), { recursive: true });
      if (!existsSync(mål)) writeFileSync(mål, `# Lärdomar — ${k.produkt}\n\nEn per etiketterad annons (docs/os/CS-KLART.md punkt 1–5). Skrivs av \`node agent/lardom.mjs --skriv\`; varje brief pekar på ett id här (\`lardom=L-…\`).\n\n`);
      appendFileSync(mål, `${b.text.trim()}\n\n`);
      await skrivRad(lardomRad(v.lardom, e, { idag, fil: `${mapp}/lardomar.md` }));
      console.log(`   → ${mapp}/lardomar.md + LARDOM-rad (${v.lardom.lardom_id})`);
    }
    console.log(`\n${resultat.length} lärdomar skrivna. Committa products/ + agent/budgetlogg.jsonl.`);
    return;
  }

  if (flagga('brief')) {
    const manifestFil = resolve(flagga('brief'));
    const kampanjId = flagga('kampanj');
    if (!kampanjId) { console.error('✗ --kampanj <id> krävs'); process.exit(1); }
    const k = karta[String(kampanjId)];
    if (!k) { console.error(`✗ kampanjen ${kampanjId} finns inte i produktkartan`); process.exit(1); }
    const poster = JSON.parse(readFileSync(manifestFil, 'utf8'));
    const lista = Array.isArray(poster) ? poster : poster?.rader ?? [];
    const kampanj = { id: String(kampanjId), namn: k.produkt, ad_account_id: k.ad_account_id ?? '1867947880635861' };
    const batch = flagga('batch') ? Number(flagga('batch')) : null;

    // Briefkvoten prövas FÖRE första raden skrivs (Axels tillägg 2026-09-22).
    // --befintliga tar annonsnamn som redan finns i kontot eller i Notion,
    // kommaseparerat eller som en JSON-lista i en fil.
    const befRå = flagga('befintliga');
    let befintliga = [];
    if (befRå) {
      befintliga = existsSync(befRå)
        ? (JSON.parse(readFileSync(befRå, 'utf8')) ?? []).map((x) => (typeof x === 'string' ? x : x?.namn)).filter(Boolean)
        : befRå.split(',').map((x) => x.trim()).filter(Boolean);
    }
    const kvot = provaBriefkvot(logg, kampanjId, lista.map((p) => p.namn), { idag, befintliga });
    console.log(`Briefkvot: ${kvot.tak} fri(a) plats(er) + ${kvot.namngivna.length} namngivna i lärdomarna${kvot.namngivna.length ? ` (${kvot.namngivna.join(', ')})` : ''}${kvot.struket.length ? ` · struket för att de redan finns: ${kvot.struket.join(', ')}` : ''}`);
    if (!kvot.ok) {
      for (const f of kvot.fel) console.error(`   🔴 ${f}`);
      console.error('\n❌ Inget skrivet. Rätta manifestet och kör om.');
      process.exit(1);
    }

    const rader = [];
    let fel = 0;
    const loggNu = [...logg];
    for (const p of lista) {
      const bf = isAbsolute(p.brief) ? p.brief : resolve(dirname(manifestFil), p.brief);
      const text = readFileSync(bf, 'utf8');
      const r = briefRad({ namn: p.namn, typ: p.typ, text, url: p.url ?? null }, { logg: loggNu, kampanj, idag, batch });
      console.log(`${r.ok ? '✅' : '❌'} ${p.namn}${r.rad.koncept ? ` · koncept ${r.rad.koncept} · iteration ${r.rad.iteration_nr}` : ''}${r.rad.lardom ? ` · ${r.rad.lardom}` : ''}`);
      for (const f of r.fel) console.log(`   🔴 ${f}`);
      for (const w of r.varningar) console.log(`   ⚠️  ${w}`);
      if (!r.ok) { fel += 1; continue; }
      rader.push(r.rad);
      loggNu.push(r.rad); // så nästa brief på samma koncept får nästa nummer
    }
    if (fel) { console.log(`\n❌ ${fel} av ${lista.length} briefer stoppade — skriv lärdomen eller rätta taggarna; skapa ingen Notion-rad för dem.`); process.exit(1); }
    if (torr) { console.log(`\n--torr: ${rader.length} BRIEF-rader validerade, inget skrivet.`); return; }
    for (const r of rader) await skrivRad(r);
    console.log(`\n${rader.length} BRIEF-rader skrivna.`);
    return;
  }

  console.error('Användning: node agent/lardom.mjs --skelett [--konto SE|NO|alla] [--kampanj <id>] [--bara-bedombara] | --skriv <fil.md> [--torr] | --brief <manifest.json> --kampanj <id> [--batch N] [--torr] | --status [--json]');
  process.exit(2);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  await huvud(process.argv.slice(2));
}
