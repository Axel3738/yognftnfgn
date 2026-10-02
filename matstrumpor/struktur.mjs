// struktur.mjs — Matstrumpors annonsstruktur enligt Evolves 3:2:2.
//
// Axels beslut ROUTING C 2026-10-02 (products/matstrumpor/EVOLVE-PLAN.md beslut 2,
// kursen läst samma dag med tools/skool/ — anteckningarna i
// docs/os/evolve/ITERATIONS-PLAYBOOK.md avsnitt 11):
//
//   • EN CBO (MATSTRUMP_SALES_20260826), ett Champions-adset och testadsets.
//   • Ett koncept = ett testadset. Tre vanliga annonser per adset: samma koncept,
//     tre hookar. Varje annons bär 2 rubriker + 2 primärtexter (Ads Managers
//     "flera textalternativ" — en vanlig annons, ALDRIG ett dynamic creative-adset;
//     ordet DCT finns inte i kursen).
//   • Bild och video aldrig i samma adset.
//   • Högst 5 levererande adsets inklusive Champions (kursens FAQ: några hundra
//     dollar om dagen ⇒ 5 åt gången). Varje adset ska kunna få 3 × CPA per dag —
//     ryms färre i budgeten är det taket. Uppladdaren vägrar ett sjätte.
//
// Det här lagret är den rena kärnan uppladdaren (/matstrumpor, kon.mjs) och
// tillbakaläsningen (kor.mjs --kontroll) bygger på. Domen per adset (kungen) bor
// i dom.mjs. Inga nätanrop här — allt in som argument, allt ut som data, testat i
// test/struktur.test.mjs.

import { tolka, mediatyp } from './namn.mjs';

/** Ads effective_status som räknas som "levererar eller kommer att leverera".
 *  Ett adset utan en enda sådan annons tar ingen budget och räknas inte mot
 *  taket (kursen: Champions räknas "if it has ads inside"). */
export const LEVERERAR = new Set(['ACTIVE', 'PENDING_REVIEW', 'IN_PROCESS', 'PREAPPROVED', 'WITH_ISSUES']);

/** Adsetets egen effective_status som betyder "på" (levererar eller strax gör
 *  det). Allt annat — PAUSED, CAMPAIGN_PAUSED, ARCHIVED, DELETED — är av. Samma
 *  mängd i taket (levererar), domen (dom.mjs) och tillbakaläsningen. */
export const ADSET_PA = new Set(['ACTIVE', 'IN_PROCESS', 'WITH_ISSUES']);

/** Ett Notion-sid-id i jämförbar form: 32 hex-tecken, gemener, utan bindestreck.
 *  Tar också en hel notion.so-länk (de sista 32 hex-tecknen). Ren. */
export function sidNyckel(x) {
  // Query och fragment bort först (?pvs=4, #block-id) — annars blir det fel 32 tecken.
  const s = String(x ?? '').split(/[?#]/)[0].toLowerCase().replace(/-/g, '');
  return s.match(/[0-9a-f]{32}(?=[^0-9a-f]*$)/)?.[0] ?? s;
}

/** Reglerna ur konfigen, med kursens tal som reserv om ett fält saknas. */
export function regler(konfig) {
  const s = konfig?.meta?.struktur ?? {};
  return {
    champions: s.champions ?? null,
    champions_bild: s.champions_bild ?? null,
    max_adsets_totalt: tal(s.max_adsets_totalt, 5),
    max_annonser_per_uppladdning: tal(s.max_annonser_per_uppladdning, 6),
    annonser_per_adset: tal(s.annonser_per_adset, 3),
    rubriker_per_annons: tal(s.rubriker_per_annons, 2),
    texter_per_annons: tal(s.texter_per_annons, 2),
    cpa_multipel_per_adset: tal(s.cpa_multipel_per_adset, 3),
    test_dagar: tal(s.test_dagar, 7),
    test_max_dagar: tal(s.test_max_dagar, 14),
    tidig_dom_dagar: tal(s.tidig_dom_dagar, 3),
    majoritet_andel: tal(s.majoritet_andel, 0.5),
    flytt_andel: tal(s.flytt_andel, 0.2),
    ung_annons_dagar: tal(s.ung_annons_dagar, 7),
    svalt_dagar: tal(s.svalt_dagar, 21),
    sasong: Array.isArray(s.sasong) ? s.sasong : [],
    tak_min_andel: tal(s.tak_min_andel, 0.01),
    sedan: s.sedan ?? null,
  };
}

// ── Adsetnamnet ────────────────────────────────────────────────────────────
// MATSTRUMP_T<nnn>_<vinkel>_<video|bild>. Löpnumret är konceptets (de tre
// hookarna delar det), så adset och annonser går att para ihop ur namnen ensamma.

export const ADSET_MALL = /^MATSTRUMP_T(\d{3,})_([a-zåäö]+)_(video|bild)$/i;
// Axels beslut 2026-10-02 (kväll): VARJE UPPLADDNING är ett eget adset, med det
// som är klart just då — varianter blir inte klara samtidigt. Namnet bär datumet:
// MATSTRUMP_U<ÅÅMMDD>[b, c …]_<vinkel|mix>_<video|bild>.
export const UPPLADDNING_MALL = /^MATSTRUMP_U(\d{6})([b-z]?)_([a-zåäö]+)_(video|bild)$/i;

export function uppladdningNamn({ datum, bokstav = '', vinkel, mediatyp: typ }) {
  const d = String(datum ?? '').replace(/-/g, '');
  if (!/^\d{8}$/.test(d)) throw new Error(`Uppladdningens adsetnamn kräver datumet ÅÅÅÅ-MM-DD, fick "${datum}".`);
  if (!/^[a-zåäö]+$/i.test(String(vinkel ?? ''))) throw new Error(`Adsetnamnet kräver en vinkel (eller mix), fick "${vinkel}".`);
  if (typ !== 'video' && typ !== 'bild') throw new Error(`Adsetnamnet kräver video eller bild, fick "${typ}" — bild och video blandas aldrig.`);
  return `MATSTRUMP_U${d.slice(2)}${bokstav}_${String(vinkel).toLowerCase()}_${typ}`;
}

export function adsetNamn({ nummer, vinkel, mediatyp: typ }) {
  const n = Number(nummer);
  if (!Number.isInteger(n) || n < 1) throw new Error(`Adsetnamnet kräver konceptets löpnummer, fick "${nummer}".`);
  if (!/^[a-zåäö]+$/i.test(String(vinkel ?? ''))) throw new Error(`Adsetnamnet kräver en vinkel, fick "${vinkel}".`);
  if (typ !== 'video' && typ !== 'bild') throw new Error(`Adsetnamnet kräver video eller bild, fick "${typ}" — bild och video blandas aldrig.`);
  return `MATSTRUMP_T${String(n).padStart(3, '0')}_${String(vinkel).toLowerCase()}_${typ}`;
}

export function tolkaAdsetNamn(namn) {
  const n = String(namn ?? '').trim();
  const u = UPPLADDNING_MALL.exec(n);
  if (u) return { nummer: null, uppladdning: `U${u[1]}${u[2].toLowerCase()}`, vinkel: u[3].toLowerCase(), mediatyp: u[4].toLowerCase() };
  const m = ADSET_MALL.exec(n);
  if (!m) return null;
  return { nummer: Number(m[1]), uppladdning: null, vinkel: m[2].toLowerCase(), mediatyp: m[3].toLowerCase() };
}

/** champions | champions_bild | test | gammal. Ett testadset är ett som bär
 *  3:2:2-namnet; allt annat i kampanjen (nya16, bilder, jul_video …) är från
 *  före strukturen och döms som ett gammalt adset. */
export function rollFor(adset, konfig) {
  const r = regler(konfig);
  const id = String(adset?.id ?? '');
  if (r.champions?.id && id === String(r.champions.id)) return 'champions';
  if (r.champions_bild?.id && id === String(r.champions_bild.id)) return 'champions_bild';
  if (tolkaAdsetNamn(adset?.namn ?? adset?.name)) return 'test';
  return 'gammal';
}

/** Levererar adsetet? På i sig (ACTIVE, IN_PROCESS, WITH_ISSUES) och minst en
 *  annons som levererar. */
export function levererar(adset) {
  if (!ADSET_PA.has(String(adset?.effective_status ?? ''))) return false;
  return Number(adset?.aktiva_annonser ?? 0) > 0;
}

/** Räknas adsetet mot taket? Axels beslut A 2026-10-02: taket räknar bara
 *  adsets som faktiskt TAR pengar — taket finns för att testerna ska få budget,
 *  och ett adset Meta inte ger spend tar ingen budget från dem. Räknas: det
 *  levererar OCH (det är Champions, ELLER yngre än testtiden — ett nytt test
 *  har inte hunnit få spend, ELLER andelen av kampanjens spend senaste sju
 *  dagarna ≥ tak_min_andel, ELLER andelen är okänd). Ren. */
export function raknasMotTaket(adset, konfig, { idag = null } = {}) {
  if (!levererar(adset)) return false;
  const r = regler(konfig);
  if (rollFor(adset, konfig) === 'champions' || rollFor(adset, konfig) === 'champions_bild') return true;
  if (adset.andel_7d === null || adset.andel_7d === undefined) return true;
  if (idag && adset.skapad) {
    const dagar = Math.round((Date.parse(`${idag}T00:00:00Z`) - Date.parse(`${String(adset.skapad).slice(0, 10)}T00:00:00Z`)) / 86400000);
    if (Number.isFinite(dagar) && dagar < r.test_dagar) return true;
  }
  return Number(adset.andel_7d) >= r.tak_min_andel;
}

/** Kapaciteten: hur många adsets budgeten bär med 3 × CPA vardera. Ren. */
export function kapacitet(dagsbudgetSek, breakEvenCpaSek, konfig) {
  const r = regler(konfig);
  const budget = Number(dagsbudgetSek), cpa = Number(breakEvenCpaSek);
  const perAdset = Number.isFinite(cpa) && cpa > 0 ? Math.round(cpa * r.cpa_multipel_per_adset * 100) / 100 : null;
  if (!perAdset || !Number.isFinite(budget) || budget <= 0) return { per_adset_sek: perAdset, ryms: null, text: perAdset ? 'dagsbudgeten okänd — kapaciteten går inte att räkna' : 'break-even-CPA okänd — kapaciteten går inte att räkna' };
  const ryms = Math.floor(budget / perAdset);
  return { per_adset_sek: perAdset, ryms, text: `${Math.round(budget)} kr/dag ÷ (${r.cpa_multipel_per_adset} × ${cpa} kr) = ${ryms} adsets` };
}

/** Läget i kampanjen. struktur = { kampanj: { dagsbudget_sek }, adsets: [{ id, namn,
 *  effective_status, aktiva_annonser }] } — läst ur Meta (meta.mjs hamtaStruktur).
 *  Ren. Taket = min(max_adsets_totalt, vad budgeten bär). */
export function strukturLage(struktur, konfig, { breakEvenCpa = null } = {}) {
  const r = regler(konfig);
  const idag = struktur?.datum ?? null;
  const adsets = (struktur?.adsets ?? []).map((a) => ({ ...a, roll: rollFor(a, konfig), levererar: levererar(a), raknas: raknasMotTaket(a, konfig, { idag }) }));
  const champions = adsets.find((a) => a.roll === 'champions') ?? null;
  const lev = adsets.filter((a) => a.raknas);
  const utanSpend = adsets.filter((a) => a.levererar && !a.raknas);
  const kap = kapacitet(struktur?.kampanj?.dagsbudget_sek, breakEvenCpa, konfig);
  const tak = Math.min(r.max_adsets_totalt, kap.ryms ?? r.max_adsets_totalt);
  const varningar = [];
  if (!r.champions?.id) varningar.push('Champions-adsetet är inte utpekat i konfig.meta.struktur.champions.');
  else if (!champions) varningar.push(`Champions-adsetet ${r.champions.id} (${r.champions.namn}) finns inte i kampanjen — läs om konfigen.`);
  else if (!champions.levererar) varningar.push(`Champions-adsetet ${champions.namn} levererar inte (${champions.effective_status}, ${champions.aktiva_annonser ?? 0} aktiva annonser).`);
  if (kap.ryms === null) varningar.push(`Kapaciteten: ${kap.text} — taket blir max_adsets_totalt (${r.max_adsets_totalt}).`);
  else if (kap.ryms < r.max_adsets_totalt) varningar.push(`Budgeten bär bara ${kap.ryms} adsets à ${kap.per_adset_sek} kr/dag (${kap.text}) — taket är ${kap.ryms}, inte ${r.max_adsets_totalt}.`);
  if (utanSpend.length) varningar.push(`${utanSpend.length} adsets är på men tar under ${Math.round(r.tak_min_andel * 100)} % av spenden och räknas inte mot taket (Axels beslut A 2026-10-02): ${utanSpend.map((a) => `${a.namn} ${a.andel_7d === null || a.andel_7d === undefined ? '' : `${Math.round(a.andel_7d * 1000) / 10} %`}`).join(', ')}.`);
  const gamlaLev = lev.filter((a) => a.roll === 'gammal');
  if (gamlaLev.length) varningar.push(`${gamlaLev.length} gamla adsets (före 3:2:2) levererar och räknas mot taket: ${gamlaLev.map((a) => a.namn).join(', ')}. Kungen dömer dem per adset; Axel stänger.`);
  const lediga = Math.max(0, tak - lev.length);
  return {
    kampanj: struktur?.kampanj ?? null,
    champions: champions ? { id: champions.id, namn: champions.namn, levererar: champions.levererar } : null,
    adsets,
    levererande: lev.map((a) => ({ id: a.id, namn: a.namn, roll: a.roll, andel_7d: a.andel_7d ?? null })),
    utan_spend: utanSpend.map((a) => ({ id: a.id, namn: a.namn, roll: a.roll, andel_7d: a.andel_7d ?? null })),
    antal_levererande: lev.length,
    max_totalt: r.max_adsets_totalt,
    kapacitet: kap,
    tak,
    lediga,
    skal: lediga > 0
      ? `${lev.length} av ${tak} adsets tar spend — ${lediga} ${lediga === 1 ? 'plats' : 'platser'} för nya testadsets.`
      : `Strukturen är full: ${lev.length} adsets tar spend och taket är ${tak} — inget nytt testadset förrän ett stängts (kungens förslag, Axels klick).`,
    varningar,
  };
}

// ── Koncepten ──────────────────────────────────────────────────────────────

/** Grupperar uppladdningsklara ANNONSER (kon.mjs planera → klara) i koncept.
 *  Nyckeln är löpnumret: _065_h1, _065_h2, _065_h3 är ett koncept. grupper =
 *  [['063','066','067']] slår ihop tre löpnummer till ett koncept (en session
 *  som SETT att det är tre öppningar på samma kropp — aldrig på gissning).
 *  Ren. Status per koncept: klar | vantar_hookar | stopp. */
export function grupperaKoncept(annonser, konfig, { grupper = [] } = {}) {
  const r = regler(konfig);
  const sammanslagen = new Map();
  for (const g of grupper ?? []) {
    const nr = (g ?? []).map((x) => String(Number(x)).padStart(3, '0'));
    for (const n of nr) sammanslagen.set(n, nr[0]);
  }
  const per = new Map();
  for (const a of annonser ?? []) {
    const t = tolka(a.namn);
    if (!t || t.nummer === null || t.land) continue;
    const egen = String(t.nummer).padStart(3, '0');
    const nyckel = sammanslagen.get(egen) ?? egen;
    if (!per.has(nyckel)) per.set(nyckel, []);
    per.get(nyckel).push({ ...a, tolkat: t, mediatyp: a.mediatyp ?? mediatyp(t, konfig) });
  }
  const ut = [];
  for (const [nyckel, lista] of [...per.entries()].sort((x, y) => x[0].localeCompare(y[0]))) {
    lista.sort((x, y) => (x.tolkat.hook ?? 0) - (y.tolkat.hook ?? 0) || x.tolkat.nummer - y.tolkat.nummer || x.namn.localeCompare(y.namn));
    const typer = [...new Set(lista.map((a) => a.mediatyp))];
    const vinklar = [...new Set(lista.map((a) => a.tolkat.vinkel))];
    const skal = [];
    let status = 'klar';
    const namnen = lista.map((a) => a.namn.toLowerCase());
    if (new Set(namnen).size !== namnen.length) { status = 'stopp'; skal.push('samma annonsnamn två gånger i kön — en rad är en dubblett'); }
    if (typer.includes('okand')) { status = 'stopp'; skal.push('formatet i namnet är varken video eller bild'); }
    const vinkel = vinklar[0];
    const typ = typer.length === 1 && typer[0] !== 'okand' ? typer[0] : null;
    ut.push({
      nyckel,
      nummer: Number(nyckel),
      vinkel,
      vinklar,
      mediatyp: typ,
      adset_namn: typ ? adsetNamn({ nummer: Number(nyckel), vinkel, mediatyp: typ }) : null,
      annonser: lista,
      sammanslagen: lista.some((a) => String(a.tolkat.nummer).padStart(3, '0') !== nyckel),
      status,
      skal,
    });
  }
  return ut;
}

/** Axels beslut 2026-10-02 (kväll): en uppladdning = ett adset per mediatyp,
 *  med allt som är klart just då — oavsett koncept och antal hookar. Annonserna
 *  (med copy) sorteras på löpnummer och hook; fler än max_annonser_per_uppladdning
 *  blir nästa adset (bokstav b, c …). upptagna = adsetnamn som redan finns
 *  (kampanjen + loggen), så ett namn aldrig används två gånger. Ren. */
export function batchaUppladdning(annonser, konfig, { datum, upptagna = new Set() } = {}) {
  const r = regler(konfig);
  const max = Math.max(1, r.max_annonser_per_uppladdning);
  const ut = [];
  const tagna = new Set([...upptagna].map((x) => String(x).toLowerCase()));
  for (const typ of ['video', 'bild']) {
    const lista = (annonser ?? []).filter((a) => a.mediatyp === typ)
      .sort((x, y) => (x.tolkat?.nummer ?? 0) - (y.tolkat?.nummer ?? 0) || (x.tolkat?.hook ?? 0) - (y.tolkat?.hook ?? 0) || x.namn.localeCompare(y.namn));
    for (let i = 0; i < lista.length; i += max) {
      const del = lista.slice(i, i + max);
      const vinklar = [...new Set(del.map((a) => a.tolkat?.vinkel).filter(Boolean))];
      const vinkel = vinklar.length === 1 ? vinklar[0] : 'mix';
      let namn = null;
      for (const b of ['', ...'bcdefghijklmnopqrstuvwxyz']) {
        const n = uppladdningNamn({ datum, bokstav: b, vinkel, mediatyp: typ });
        const nyckelDel = n.replace(/_[a-zåäö]+_(video|bild)$/i, '').toLowerCase();
        if (![...tagna].some((t) => t === n.toLowerCase() || t.startsWith(`${nyckelDel}_`) && t.endsWith(`_${typ}`))) { namn = n; break; }
      }
      tagna.add(namn.toLowerCase());
      const t = tolkaAdsetNamn(namn);
      ut.push({
        nyckel: t.uppladdning,
        uppladdning: true,
        nummer: null,
        vinkel,
        vinklar,
        mediatyp: typ,
        adset_namn: namn,
        annonser: del,
        koncept_nycklar: [...new Set(del.map((a) => String(a.tolkat?.nummer ?? '').padStart(3, '0')))],
        status: 'klar',
        skal: [],
      });
    }
  }
  return ut;
}

/** Fördelar de klara koncepten på de lediga platserna, äldst löpnummer först.
 *  Resten väntar — uppladdaren VÄGRAR ett adset över taket. Ren. */
export function tilldelaPlatser(koncept, lage) {
  let kvar = Math.max(0, Number(lage?.lediga ?? 0));
  const tak = lage?.tak ?? '?';
  const lev = lage?.antal_levererande ?? '?';
  return (koncept ?? []).map((k) => {
    if (k.status !== 'klar') return k;
    if (kvar > 0) { kvar--; return k; }
    return { ...k, status: 'vantar_plats', skal: [...k.skal, `strukturen är full (${lev} levererande av taket ${tak}) — vägrar ett adset till; konceptet väntar i hubben tills kungen föreslagit ett testadset att stänga och Axel stängt det`] };
  });
}

// ── COPY CARD: 2 rubriker + 2 primärtexter ─────────────────────────────────
// Ur briefen (repots brief.md eller Notion-sidans text). Formatet sedan
// 2026-10-02 (docs/os/BRIEF-REGI.md, kungens steg 6):
//   **Primary text 1:** > …   **Primary text 2:** > …
//   **Headline 1:** `…`       **Headline 2:** `…`
//   **Description:** `…`      **CTA button:** `Handla nu`   **Destination:** https://…
// Den gamla formen (en "Primary text:" + en "Headline:") läses också — då blir
// det EN av varje, och granskaCopy säger att den andra saknas.

const ETIKETTER = /(primary\s*text(?:\s*\d)?|headline(?:\s*\d)?|description|cta(?:\s*button)?|destination)\s*:/gi;
const SLUT_PA_KORTET = /^\s*(?:#{1,4}\s|\(copy card|primary kpi|what we learn|three-question|rules\b|hook variants|kpi\b)/i;

export function lasCopyKort(text) {
  const rader = String(text ?? '').split('\n');
  // Kortets rubrik: en rad som nämner COPY CARD och följs av en etikett inom
  // några rader (titeln "… (3:2:2-briefens COPY CARD)" är inte kortet).
  const start = rader.findIndex((r, i) => /copy card/i.test(r) && rader.slice(i, i + 12).some((x) => /(primary\s*text|headline)(\s*\d)?\s*:/i.test(x)));
  if (start < 0) return null;
  const kort = [];
  for (let i = start + 1; i < rader.length; i++) {
    if (SLUT_PA_KORTET.test(rader[i]) && !/copy card/i.test(rader[i])) break;
    kort.push(rader[i]);
  }
  const ren = kort.join('\n')
    .replace(/\*\*/g, '')
    .replace(/`/g, '')
    .replace(/^[ \t]*>[ \t]?/gm, '');   // [ \t], aldrig \s: en tom ">"-rad är en styckebrytning
  const traffar = [...ren.matchAll(ETIKETTER)];
  const texter = [], rubriker = [];
  let beskrivning = null, cta = null, lank = null;
  traffar.forEach((m, i) => {
    const fran = m.index + m[0].length;
    const till = i + 1 < traffar.length ? traffar[i + 1].index : ren.length;
    const ra = ren.slice(fran, till);
    const etikett = m[1].toLowerCase().replace(/\s+/g, ' ');
    // En primärtext behåller sina rader (korta stycken, docs/copy-regler.md):
    // varje rad trimmas, en tom rad blir en styckebrytning. Allt annat blir en rad.
    const varde = etikett.startsWith('primary')
      ? ra.split('\n').map((r) => r.replace(/[ \t]+/g, ' ').trim()).join('\n').replace(/\n{3,}/g, '\n\n').trim()
      : ra.replace(/\s+/g, ' ').trim();
    if (!varde) return;
    if (etikett.startsWith('primary')) texter.push(varde);
    else if (etikett.startsWith('headline')) rubriker.push(varde);
    else if (etikett.startsWith('description')) beskrivning = varde;
    else if (etikett.startsWith('cta')) cta = varde;
    else if (etikett.startsWith('destination')) lank = varde.match(/https?:\/\/[^\s)\]]+/)?.[0] ?? null;
  });
  return { texter, rubriker, beskrivning, cta, lank };
}

/** CTA-knappen ur kortet → Metas typ. "Handla nu (Shop Now)" ⇒ SHOP_NOW. */
export function ctaTyp(cta) {
  const s = String(cta ?? '').toLowerCase();
  if (!s || /shop now|handla nu/.test(s)) return 'SHOP_NOW';
  if (/buy now|köp nu/.test(s)) return 'BUY_NOW';
  if (/learn more|läs mer/.test(s)) return 'LEARN_MORE';
  return 'SHOP_NOW';
}

/** Granskar kortet: exakt två av varje används (fler ⇒ de två första, med en
 *  anmärkning), butikens namn står aldrig i en annons (Axels beslut 2026-09-18),
 *  och länken går till butiken. Ren. */
export function granskaCopy(kort, konfig) {
  const r = regler(konfig);
  const fel = [], anm = [];
  if (!kort) return { ok: false, fel: ['briefen saknar COPY CARD'], anm, copy: null };
  const texter = kort.texter.slice(0, r.texter_per_annons);
  const rubriker = kort.rubriker.slice(0, r.rubriker_per_annons);
  if (kort.texter.length < r.texter_per_annons) fel.push(`COPY CARD har ${kort.texter.length} primärtext${kort.texter.length === 1 ? '' : 'er'} — 3:2:2 kräver ${r.texter_per_annons} ("Primary text 1:" och "Primary text 2:")`);
  if (kort.rubriker.length < r.rubriker_per_annons) fel.push(`COPY CARD har ${kort.rubriker.length} rubrik${kort.rubriker.length === 1 ? '' : 'er'} — 3:2:2 kräver ${r.rubriker_per_annons} ("Headline 1:" och "Headline 2:")`);
  if (kort.texter.length > r.texter_per_annons) anm.push(`${kort.texter.length} primärtexter i kortet — de ${r.texter_per_annons} första används`);
  if (kort.rubriker.length > r.rubriker_per_annons) anm.push(`${kort.rubriker.length} rubriker i kortet — de ${r.rubriker_per_annons} första används`);
  const dubbel = (l) => new Set(l.map((x) => x.toLowerCase())).size !== l.length;
  if (texter.length === r.texter_per_annons && dubbel(texter)) fel.push('de två primärtexterna är samma text');
  if (rubriker.length === r.rubriker_per_annons && dubbel(rubriker)) fel.push('de två rubrikerna är samma text');
  for (const t of [...texter, ...rubriker, kort.beskrivning ?? '']) {
    if (/matstrumpor/i.test(t)) { fel.push(`butikens namn står i annonsens text ("${t.slice(0, 60)}") — det gör det aldrig (Axels beslut 2026-09-18)`); break; }
  }
  const butik = new URL(konfig.butik).hostname;
  if (kort.lank && !new URL(kort.lank).hostname.endsWith(butik)) fel.push(`Destination ${kort.lank} är inte ${butik} — fel pixel bokför köpen på fel verksamhet`);
  return { ok: fel.length === 0, fel, anm, copy: { texter, rubriker, beskrivning: kort.beskrivning ?? null, cta: ctaTyp(kort.cta), lank: kort.lank ?? null } };
}

// ── Meta-specarna (Adsmanager-MCP:n) ───────────────────────────────────────

/** Argumenten till ads_create_ad_set för ett nytt testadset — mallen är
 *  Champions-adsetet, läst live (meta.mjs hamtaStruktur → champions_mall). Ingen
 *  budget och ingen budstrategi: kampanjen är CBO. Aldrig dynamic creative.
 *  Ren. Kastar hellre än gissar en målgrupp. */
export function adsetSpec({ namn, mall, kampanjId, kontoId }) {
  if (!tolkaAdsetNamn(namn)) throw new Error(`"${namn}" är inget 3:2:2-adsetnamn (${ADSET_MALL}).`);
  if (!mall?.targeting?.geo_locations) throw new Error('Mallen (Champions-adsetet) saknar targeting — kopierar aldrig en målgrupp ur luften.');
  if (!mall.optimization_goal || !mall.promoted_object?.pixel_id) throw new Error('Mallen saknar optimization_goal eller pixel i promoted_object — avbryter.');
  return {
    ad_account_id: String(kontoId),
    campaign_id: String(kampanjId),
    ad_set_name: namn,
    billing_event: mall.billing_event ?? 'IMPRESSIONS',
    optimization_goal: mall.optimization_goal,
    promoted_object: JSON.stringify(mall.promoted_object),
    targeting: JSON.stringify(mall.targeting),
    ...(mall.attribution_spec ? { attribution_spec: JSON.stringify(mall.attribution_spec) } : {}),
    ...(mall.destination_type ? { destination_type: mall.destination_type } : {}),
    is_dynamic_creative: false,
  };
}

/** Den inline-creative ads_create_ad tar (`creative`, JSON-sträng): en vanlig
 *  video- eller bildannons med den FÖRSTA texten och rubriken i
 *  object_story_spec och båda i asset_feed_spec med optimization_type
 *  DEGREES_OF_FREEDOM — Ads Managers "flera textalternativ". Ren. */
export function creativeSpec({ namn, mediatyp: typ, video_id = null, thumbnail_url = null, image_hash = null, copy, lank, sida_id, instagram_id }) {
  if (!copy || copy.texter?.length < 2 || copy.rubriker?.length < 2) throw new Error('creativeSpec kräver 2 primärtexter och 2 rubriker (granskaCopy först).');
  if (!sida_id) throw new Error('sida_id saknas (konfig.meta.sida_id).');
  if (!lank) throw new Error('länken saknas.');
  const [t1] = copy.texter, [r1] = copy.rubriker;
  const knapp = { type: copy.cta ?? 'SHOP_NOW', value: { link: lank } };
  let story;
  if (typ === 'video') {
    if (!video_id || !thumbnail_url) throw new Error('En videoannons kräver video_id och thumbnail_url (Meta kräver en miniatyr — matstrumpor/thumbnails.mjs).');
    story = { video_data: { video_id: String(video_id), image_url: thumbnail_url, message: t1, title: r1, ...(copy.beskrivning ? { link_description: copy.beskrivning } : {}), call_to_action: knapp } };
  } else if (typ === 'bild') {
    if (!image_hash) throw new Error('En bildannons kräver image_hash.');
    story = { link_data: { image_hash, link: lank, message: t1, name: r1, ...(copy.beskrivning ? { description: copy.beskrivning } : {}), call_to_action: knapp } };
  } else {
    throw new Error(`Okänd mediatyp "${typ}".`);
  }
  return {
    name: namn,
    object_story_spec: { page_id: String(sida_id), ...(instagram_id ? { instagram_user_id: String(instagram_id) } : {}), ...story },
    asset_feed_spec: {
      bodies: copy.texter.map((text) => ({ text })),
      titles: copy.rubriker.map((text) => ({ text })),
      optimization_type: 'DEGREES_OF_FREEDOM',
    },
  };
}

/** Tillbakaläsningen av ETT testadset (kor.mjs --kontroll): adset + annonser +
 *  creatives ur Meta. forvantat = planens koncept (namn, annonser, copy) eller
 *  null. Ren. Returnerar fel per punkt — ett tomt fel betyder "som planerat". */
export function kontrolleraAdset(las, konfig, { forvantat = null } = {}) {
  const r = regler(konfig);
  const fel = [], ok = [];
  const a = las?.adset ?? {};
  if (String(a.campaign_id ?? las?.kampanj_id ?? '') !== String(konfig.meta.kampanj.id)) fel.push(`adsetet ligger i kampanj ${a.campaign_id ?? 'okänd'}, inte ${konfig.meta.kampanj.id}`);
  const tn = tolkaAdsetNamn(a.name);
  if (!tn) fel.push(`adsetet heter "${a.name}" — inget 3:2:2-namn`);
  if (a.is_dynamic_creative) fel.push('adsetet är ett dynamic creative-adset — 3:2:2 är vanliga annonser');
  if (a.status && a.status !== 'ACTIVE') fel.push(`adsetet står ${a.status} — körningen skapade det och ska ha slagit på det (steg 5c)`);
  else if (a.effective_status && !ADSET_PA.has(String(a.effective_status))) fel.push(`adsetet levererar inte (${a.effective_status})`);
  if (konfig.meta.pixel_id && a.promoted_object && String(a.promoted_object.pixel_id ?? '') !== String(konfig.meta.pixel_id)) fel.push(`adsetets pixel ${a.promoted_object.pixel_id} är inte Matstrumpors ${konfig.meta.pixel_id} — köpen bokförs fel`);
  if (a.daily_budget || a.lifetime_budget) fel.push('adsetet har en egen budget — kampanjen är CBO');
  if (forvantat?.adset_namn && a.name !== forvantat.adset_namn) fel.push(`adsetet heter "${a.name}", planen sa "${forvantat.adset_namn}"`);
  const ads = las?.annonser ?? [];
  const antal = forvantat?.annonser?.length ?? (tn?.uppladdning ? null : r.annonser_per_adset);
  if (antal !== null && ads.length !== antal) fel.push(`${ads.length} annonser i adsetet — planen hade ${antal}`);
  const typer = new Set();
  for (const ad of ads) {
    const c = ad.creative ?? {};
    const oss = c.object_story_spec ?? {};
    const afs = c.asset_feed_spec ?? {};
    const typ = oss.video_data ? 'video' : oss.link_data ? 'bild' : 'okand';
    typer.add(typ);
    const bodies = (afs.bodies ?? []).map((b) => b.text);
    const titles = (afs.titles ?? []).map((b) => b.text);
    if (bodies.length !== r.texter_per_annons) fel.push(`${ad.name}: ${bodies.length} primärtexter i Meta — ska vara ${r.texter_per_annons}`);
    if (titles.length !== r.rubriker_per_annons) fel.push(`${ad.name}: ${titles.length} rubriker i Meta — ska vara ${r.rubriker_per_annons}`);
    const lank = (oss.video_data ?? oss.link_data)?.call_to_action?.value?.link ?? oss.link_data?.link ?? '';
    if (!String(lank).includes(new URL(konfig.butik).hostname)) fel.push(`${ad.name}: länken "${lank}" går inte till ${konfig.butik}`);
    if (konfig.meta.sida_id && String(oss.page_id ?? '') !== String(konfig.meta.sida_id)) fel.push(`${ad.name}: sidan ${oss.page_id} är inte ${konfig.meta.sida_id}`);
    if (ad.status && ad.status !== 'ACTIVE') fel.push(`${ad.name}: står ${ad.status} — körningen skapade den och ska ha slagit på den (steg 5c)`);
    else if (ad.effective_status && !LEVERERAR.has(String(ad.effective_status))) fel.push(`${ad.name}: levererar inte (${ad.effective_status})`);
    const plan = forvantat?.annonser?.find((p) => p.namn === ad.name) ?? null;
    if (forvantat && !plan) fel.push(`${ad.name}: finns inte i planen`);
    const copy = plan?.copy ?? forvantat?.copy ?? null;
    if (copy) {
      const lika = (x, y) => x.length === y.length && x.every((v) => y.includes(v));
      if (bodies.length && !lika(bodies, copy.texter)) fel.push(`${ad.name}: primärtexterna i Meta är inte briefens`);
      if (titles.length && !lika(titles, copy.rubriker)) fel.push(`${ad.name}: rubrikerna i Meta är inte briefens`);
    }
    if (!fel.some((f) => f.startsWith(ad.name))) ok.push(`${ad.name}: ${typ}, ${bodies.length} + ${titles.length}, ${ad.effective_status ?? ad.status ?? '?'}`);
  }
  if (forvantat?.annonser?.length) for (const p of forvantat.annonser) if (!ads.some((ad) => ad.name === p.namn)) fel.push(`${p.namn}: planens annons finns inte i adsetet`);
  if (typer.size > 1) fel.push(`bild och video i samma adset (${[...typer].join(' + ')})`);
  if (tn && typer.size === 1 && !typer.has(tn.mediatyp)) fel.push(`adsetnamnet säger ${tn.mediatyp}, annonserna är ${[...typer][0]}`);
  return { ok: fel.length === 0, fel, rader: ok };
}

const tal = (v, reserv) => (Number.isFinite(Number(v)) && v !== null && v !== '' ? Number(v) : reserv);
