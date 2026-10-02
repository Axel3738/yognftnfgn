// dom.mjs — domen per ADSET i Matstrumpors 3:2:2 (Axels beslut ROUTING C 2026-10-02).
//
// Kursen ("How To Set Up a 3:2:2 Campaign", FAQ, läst 2026-10-02):
//   • Testa minst 3 dagar, normalt 7, aldrig över 14.
//   • "With this method we are only turning off at the ad set level not ad level."
//   • Inte mycket spend efter 7 dagar och dålig ROAS ⇒ stäng. Bra ROAS men lite
//     spend ⇒ får stå om inget annat koncept väntar i kön.
//   • Tog majoriteten av spenden de första 3 dagarna, presterar dåligt och kampanjen
//     gick ner ⇒ stäng — men skriv lärdomen, något i den fick engagemang.
//   • Vinnare: tar majoriteten av spenden vid KPI. Osäker? "Did my overall campaign
//     performance improve?" — förbättrades inte kampanjens ROAS är den ingen vinnare.
//   • Stäng aldrig av annonser som fungerar. Zooma ut, titta på snitten.
// Chadbot ur kursen (D2): flytta in i Champions först när den tagit 20–30 % av budgeten.
//
// ⛔ Domen FÖRESLÅR. Kungen skalar aldrig (Axels beslut 2026-09-21): ingen paus,
// ingen aktivering, ingen budget — raderna blir FORSLAG till Axel. Och den dömer
// aldrig en ANNONS: etiketten per annons (etikett.mjs) är lärdomen, inte ett
// stängningsbeslut.
//
// KPI = break-even-ROAS (kill mäts mot break-even, aldrig mot ett mål — CLAUDE.md
// regel 4). Under grinden 300 kr / 3 köp sägs inget om ROAS: ett adset som efter
// sju dygn ligger under grinden har SVULTIT, och det är Metas dom (regel 11).
//
// Ren logik: serierna in (meta.mjs → jobb.adsets[].serie, jobb.kampanj_serie),
// domen ut. Testad i test/dom.test.mjs.

import { regler, rollFor, tolkaAdsetNamn, ADSET_PA } from './struktur.mjs';
import { dagarMellan } from './etikett.mjs';

export const DOM = Object.freeze({
  CHAMPIONS: 'CHAMPIONS',
  AV: 'AV',
  FOR_UNG: 'FOR_UNG',
  STANG_TIDIGT: 'STANG_TIDIGT',
  VINNARE: 'VINNARE',
  FLYTTA: 'FLYTTA',
  VANTA: 'VANTA',
  LAT_STA: 'LAT_STA',
  STANG: 'STANG',
  FLYTTAD: 'FLYTTAD',
});

/** Åtgärden Axel får som förslag. null = inget att göra. */
export const ATGARD = Object.freeze({
  [DOM.STANG]: 'STANG_ADSET',
  [DOM.STANG_TIDIGT]: 'STANG_ADSET',
  [DOM.VINNARE]: 'FLYTTA_TILL_CHAMPIONS',
  [DOM.FLYTTA]: 'FLYTTA_TILL_CHAMPIONS',
});

export function plusDagar(datum, n) {
  const t = Date.parse(`${datum}T00:00:00Z`);
  if (!Number.isFinite(t)) throw new Error(`Datumet "${datum}" går inte att läsa.`);
  return new Date(t + n * 86400000).toISOString().slice(0, 10);
}

/** Summan av en dagserie [{ d, spend_sek, kop, roas }] i ett fönster. ROAS
 *  spendvägd, en dag med spend och noll köp räknas som ROAS 0; null när inget
 *  spenderades. Ren. */
export function summera(serie, since, until) {
  let spend = 0, kop = 0, varde = 0, medRoas = 0, dagar = 0;
  for (const r of serie ?? []) {
    const d = String(r.d ?? r.datum ?? '');
    if (d < since || d > until) continue;
    const s = Number(r.spend_sek) || 0;
    const k = Number(r.kop) || 0;
    spend += s;
    kop += k;
    // Meta skickar ingen purchase_roas för en dag utan köp. En sådan dag är ROAS 0
    // och ska väga in — annars blir veckans ROAS den på köpdagarna ensamma
    // (mätt 2026-10-02: nya16 visade 2,60 i stället för Metas 1,49 på samma vecka).
    const roas = r.roas !== null && r.roas !== undefined && Number.isFinite(Number(r.roas)) ? Number(r.roas) : (k === 0 ? 0 : null);
    if (roas !== null && s > 0) { varde += roas * s; medRoas += s; }
    dagar++;
  }
  return { since, until, spend_sek: r2(spend), kop, roas: medRoas > 0 ? r3(varde / medRoas) : null, dagar_med_data: dagar };
}

/** Det långa snittet för ett adset äldre än testtiden (kursen: "zoom out, look
 *  at averages") — hela serien (meta.mjs ADSET_SERIE_DAGAR). */
export const LANGT_SNITT_DAGAR = 28;

/** Ett annonsnamn utan Ads Managers kopiesuffix (" - Kopia", " – Copy", "(kopia)"),
 *  gemener — så att en vinnare som duplicerats in i Champions känns igen. Ren. */
export function normNamn(namn) {
  return String(namn ?? '').replace(/(\s*[-–]\s*(kopia|copy)(\s*\d+)?|\s*\((kopia|copy)\))+$/i, '').trim().toLowerCase();
}

/** Domen för ETT adset. Ren.
 *  adset:  { id, namn, effective_status, skapad, serie, aktiva_annonser }
 *  ctx:    { kampanjserie, idag, breakEven, grindar, konfig, koVantar, annonser, skyddade }
 *          skyddade = annonsnamn som bär > 30 % av vinsten (rangordna → benchmark) */
export function domAdset(adset, { kampanjserie = [], idag, breakEven = null, grindar, konfig, koVantar = null, annonser = [], skyddade = new Set() }) {
  const r = regler(konfig);
  const roll = rollFor(adset, konfig);
  const igar = plusDagar(idag, -1);
  const skapad = String(adset.skapad ?? '').slice(0, 10) || null;
  const dagar = skapad ? Math.max(0, dagarMellan(skapad, idag)) : null;
  const lang = dagar === null || dagar > r.test_max_dagar;
  // Ett test döms på hela testet (från starten, högst 14 dagar). Ett adset äldre
  // än testtiden (de gamla från före 3:2:2) på de senaste sju dagarna — men det
  // stängs bara om också det långa snittet ligger under break-even (kursen: "we
  // don't turn off ads that were doing well but suddenly tanked, zoom out").
  const since = lang ? plusDagar(igar, -(r.test_dagar - 1)) : skapad;
  const f = since && since <= igar ? { since, until: igar } : null;
  const a = f ? summera(adset.serie, f.since, f.until) : { spend_sek: 0, kop: 0, roas: null };
  const k = f ? summera(kampanjserie, f.since, f.until) : { spend_sek: 0, kop: 0, roas: null };
  const len = f ? dagarMellan(f.since, f.until) + 1 : 0;
  const fore = f ? summera(kampanjserie, plusDagar(f.since, -len), plusDagar(f.since, -1)) : null;
  const andel = k.spend_sek > 0 ? r3(a.spend_sek / k.spend_sek) : null;
  const forbattrad = fore && fore.spend_sek > 0 && fore.roas !== null && k.roas !== null ? k.roas > fore.roas : null;
  const harBe = breakEven !== null && breakEven !== undefined;
  const kpi = a.roas !== null && harBe ? a.roas >= breakEven : null;
  const grind = (x) => x.spend_sek >= grindar.signifikans_spend_sek || x.kop >= grindar.signifikans_kop;
  const bedombar = grind(a);
  const lt = lang && f ? summera(adset.serie, plusDagar(igar, -(LANGT_SNITT_DAGAR - 1)), igar) : null;
  const langtOk = Boolean(lt && grind(lt) && lt.roas !== null && harBe && lt.roas >= breakEven);
  const kandidat = bastaAnnons(adset.id, annonser, breakEven, { grindar, flyttAndel: r.flytt_andel });
  const benchmark = (annonser ?? []).find((x) => String(x.adset_id ?? '') === String(adset.id) && skyddade.has(x.namn)) ?? null;
  const ko = koVantar === null || koVantar === undefined ? null : Number(koVantar);

  const bas = {
    adset_id: String(adset.id), adset: adset.namn, roll, effective_status: adset.effective_status ?? null,
    skapad, dagar, fonster: f ? `${f.since}..${f.until}` : null,
    spend_sek: a.spend_sek, kop: a.kop, roas: a.roas, andel, bedombar, kpi,
    kampanj_spend_sek: k.spend_sek, kampanj_roas: k.roas, kampanj_roas_fore: fore?.roas ?? null, forbattrad,
    ...(lt ? { langt_snitt: { fonster: `${lt.since}..${lt.until}`, spend_sek: lt.spend_sek, kop: lt.kop, roas: lt.roas } } : {}),
    basta_annons: kandidat,
  };
  const ut = (dom, motivering, extra = {}) => ({ ...bas, dom, atgard: ATGARD[dom] ?? null, motivering, ...extra });
  const pct = (x) => (x === null ? 'okänd andel' : `${Math.round(x * 100)} %`);
  const roasTxt = a.roas === null ? 'ingen ROAS' : `ROAS ${a.roas}`;
  const beTxt = harBe ? `break-even ${breakEven}` : 'break-even okänt';
  const kampTxt = forbattrad === null ? 'kampanjens ROAS före testet går inte att jämföra' : `kampanjens ROAS ${fore.roas} → ${k.roas}${forbattrad ? ' (förbättrades)' : ' (förbättrades inte)'}`;
  const zoomTxt = lt ? `zoomat ut: ${LANGT_SNITT_DAGAR} dagar ${lt.spend_sek} kr, ${lt.kop} köp, ROAS ${lt.roas ?? '—'}` : '';

  if (roll === 'champions' || roll === 'champions_bild') return ut(DOM.CHAMPIONS, `Champions — ${pct(andel)} av kampanjens spend i fönstret, ${roasTxt}. Testas aldrig och stängs aldrig; vinnare flyttas hit.`);
  if (!ADSET_PA.has(String(adset.effective_status ?? ''))) return ut(DOM.AV, `${adset.effective_status ?? 'okänd status'} — avstängt är ett beslut, döms inte och aktiveras aldrig.`);
  if (dagar === null || !f) return ut(DOM.FOR_UNG, 'startade i dag — Meta har inga siffror för i dag.');
  if (dagar < r.tidig_dom_dagar) return ut(DOM.FOR_UNG, `dag ${dagar} av ${r.test_dagar} — kursen ger ett test minst ${r.tidig_dom_dagar} dagar.`);
  if (dagar < r.test_dagar) {
    if (andel !== null && andel >= r.majoritet_andel && bedombar && kpi === false && forbattrad === false) {
      return skydda(ut(DOM.STANG_TIDIGT, `dag ${dagar}: tog ${pct(andel)} av spenden men ${roasTxt} under ${beTxt}, och ${kampTxt}. Kursen: stäng — men skriv lärdomen, något i den fick engagemang; gör den mer köpdriven.`, { lardom: true }));
    }
    return ut(DOM.FOR_UNG, `dag ${dagar} av ${r.test_dagar} — ${pct(andel)} av spenden, ${roasTxt}. Domen kommer dag ${r.test_dagar}.`);
  }
  return skydda(efterTest());

  function efterTest() {
    if (!bedombar) {
      // Svält. Kursen: lite spend efter 7 dagar och dålig ROAS ⇒ stäng; bra ROAS ⇒
      // får stå om inget väntar i kön. Under grinden finns ingen ROAS-dom på
      // veckan, så "bra" betyder köp över break-even inom testet, eller ett långt
      // snitt över break-even för ett adset äldre än testtiden. Ett adset som
      // svälter fungerar inte NU — skyddet för "befintliga som fungerar" gäller inte.
      // Regel 11 (Axels beslut 2026-09-20): ingen spend på sju dygn är Metas dom
      // INGEN_LEVERANS. Ett gammalt snitt räddar inte platsen — adsetet levererar
      // inte och tar ändå en plats i taket.
      const ingenLev = Number(grindar?.ingen_leverans_spend_sek ?? 10);
      if ((Number(a.spend_sek) || 0) < ingenLev) return ut(DOM.STANG, `${a.spend_sek ?? 0} kr på ${r.test_dagar} dagar — under ${ingenLev} kr: Meta levererar inte (regel 11, INGEN_LEVERANS)${lt ? `; ${zoomTxt}, men ett gammalt snitt räddar inte platsen` : ''}.`, { svalt: true });
      if (ko === 0 && ((a.kop >= 1 && kpi === true && dagar <= r.test_max_dagar) || (lang && langtOk))) return ut(DOM.LAT_STA, `under grinden (${a.spend_sek} kr, ${a.kop} köp)${lang && langtOk ? `, men ${zoomTxt} ≥ ${beTxt}` : ''} — ingen dom; står bara för att inget koncept väntar på platsen.`);
      return ut(DOM.STANG, `${dagar} dagar, ${a.spend_sek} kr och ${a.kop} köp — under grinden ${grindar.signifikans_spend_sek} kr / ${grindar.signifikans_kop} köp${lt ? ` (${zoomTxt})` : ''}. Meta gav den ingen spend: svält är Metas dom (kursen: "not getting much spend after 7 days"). Ingen dom över idén, bara över platsen.`, { svalt: true });
    }
    if (kpi === true && andel !== null && andel >= r.flytt_andel) {
      const majoritet = andel >= r.majoritet_andel;
      const vinnare = majoritet ? forbattrad !== false : forbattrad === true;
      const mal = malFor(adset, konfig);
      // Kopian i Champions letas FÖRE kravet på en aktiv kandidat: när vinnaren
      // flyttats och originalet pausats är originalet inte längre en kandidat,
      // men flytten är gjord. Bland adsetets annonser med spend, vilken status som helst.
      const egna = (annonser ?? []).filter((x) => String(x.adset_id ?? '') === String(adset.id) && (Number(x.spend_sek) || 0) > 0);
      const kopior = mal.id ? (annonser ?? []).filter((x) => String(x.adset_id ?? '') === String(mal.id) && egna.some((e) => normNamn(e.namn) === normNamn(x.namn))) : [];
      const kopia = kopior.find((x) => (Number(x.spend_sek) || 0) > 0) ?? kopior[0] ?? null;
      if (kopia && (Number(kopia.spend_sek) || 0) > 0) {
        // Ett gammalt adset som fungerar stängs aldrig (kursen), inte ens när
        // dess vinnare redan levererar i Champions.
        if (roll === 'gammal') return ut(DOM.LAT_STA, `${kopia.namn} levererar redan i ${mal.namn} (${kopia.spend_sek} kr på 14 dagar); adsetet är från före 3:2:2 och fungerar (${roasTxt} ≥ ${beTxt}) — kursen: stäng aldrig av befintliga annonser som fungerar. Räknas mot taket.`);
        return ut(DOM.STANG, `vinnaren ${kopia.namn} levererar redan i ${mal.namn} (${kopia.spend_sek} kr på 14 dagar) — testadsetet har gjort sitt och lämnar platsen.`, { flyttad: true });
      }
      if (kopia) return ut(DOM.FLYTTAD, `vinnaren ${kopia.namn} ligger i ${mal.namn} men har inte levererat än — testadsetet står kvar tills kopian levererar.`);
      if (!kandidat) return ut(DOM.VANTA, `${pct(andel)} av kampanjens spend vid KPI (${roasTxt} ≥ ${beTxt}), men ingen enskild annons är bevisad än (aktiv, över grinden, över break-even, minst ${pct(r.flytt_andel)} av adsetets spend) — Chadbot ur kursen: flytta aldrig en annons med liten spend och hög ROAS.`);
      if (vinnare) return ut(DOM.VINNARE, `${pct(andel)} av kampanjens spend vid KPI (${roasTxt} ≥ ${beTxt}), ${kampTxt}. Vinnare enligt kursen — flytta ${kandidat.namn} till ${mal.namn}.`, { till: mal });
      return ut(DOM.FLYTTA, `${pct(andel)} av kampanjens spend vid KPI (${roasTxt} ≥ ${beTxt}) — över flyttgränsen ${pct(r.flytt_andel)}${majoritet ? ', men ' + kampTxt + ' — kursen: då är den ingen vinnare än' : ''}. Flytta ${kandidat.namn} till ${mal.namn} och se om kampanjen håller.`, { till: mal });
    }
    const fungerar = kpi === true || (lang && langtOk);
    if (fungerar) {
      const varfor = kpi === true ? `${roasTxt} ≥ ${beTxt}` : `${roasTxt} senaste ${r.test_dagar} dagarna, men ${zoomTxt} ≥ ${beTxt}`;
      // De gamla adseten (före 3:2:2) stängs aldrig när de fungerar — kursens
      // varning i versaler: "DO NOT TURN OFF YOUR EXISTING ADS IF THEY ARE
      // WORKING". Köregeln nedan gäller bara testadset.
      if (roll === 'gammal') return ut(DOM.LAT_STA, `${varfor}, ${pct(andel)} av spenden — fungerar och är från före 3:2:2: kursen säger stäng aldrig av befintliga annonser som fungerar. Räknas mot taket.`);
      if (ko !== null && ko > 0) return ut(DOM.STANG, `${varfor} men bara ${pct(andel)} av spenden efter ${dagar} dagar, och ${ko} koncept väntar på en plats — kursen: bra ROAS får stå bara när inget annat väntar.`);
      return ut(DOM.LAT_STA, `${varfor} men bara ${pct(andel)} av spenden — får stå ${ko === 0 ? 'eftersom inget koncept väntar på en plats' : 'OM inget koncept väntar på en plats (kön lästes inte)'}${dagar > r.test_max_dagar ? `; över ${r.test_max_dagar} dagar, som kursen inte rekommenderar` : ''}.`);
    }
    if (kpi === null) return ut(DOM.VANTA, `ROAS eller break-even saknas (${roasTxt}, ${beTxt}) — ingen dom hittas på.`);
    if (andel !== null && andel >= r.flytt_andel && forbattrad === true && dagar <= r.test_max_dagar) {
      return ut(DOM.VANTA, `tar ${pct(andel)} av spenden och ${kampTxt}, men ${roasTxt} under ${beTxt}. Får gå till dag ${r.test_max_dagar}, sedan stängs den om den inte når KPI.`);
    }
    return ut(DOM.STANG, `${dagar} dagar, ${pct(andel)} av spenden, ${roasTxt} under ${beTxt}${lt ? ` (${zoomTxt} — också under)` : ''}${andel !== null && andel >= r.flytt_andel ? `, ${kampTxt}. Kursen: stäng, men skriv lärdomen — den fick spend av ett skäl` : ''}.`, andel !== null && andel >= r.flytt_andel ? { lardom: true } : {});
  }

  /** Benchmarken dödas aldrig (ANALYSMETOD, kungens regel): ett adset som bär
   *  annonsen med > 30 % av vinsten får aldrig ett stängningsförslag. */
  function skydda(d) {
    if ((d.dom === DOM.STANG || d.dom === DOM.STANG_TIDIGT) && benchmark && !d.flyttad) {
      return { ...d, dom: DOM.LAT_STA, atgard: null, lardom: undefined, motivering: `bär benchmarken ${benchmark.namn} (> 30 % av vinsten) — dödas aldrig. (Utan den: ${d.motivering})` };
    }
    return d;
  }
}

/** Vart en vinnare flyttas: Champions (video) eller Champions för bild om den
 *  finns. Bild och video blandas aldrig — finns inget bild-Champions står det. */
export function malFor(adset, konfig) {
  const r = regler(konfig);
  // Testadsetet bär typen i namnet; ett gammalt adset med "bild" i namnet
  // (broad_advplus_purchase_bilder, batch03_bilder) är bild, resten video.
  const typ = adset.mediatyp ?? tolkaAdsetNamn(adset.namn)?.mediatyp ?? (/bild/i.test(String(adset.namn ?? '')) ? 'bild' : 'video');
  if (typ === 'bild') {
    if (r.champions_bild?.id) return { id: String(r.champions_bild.id), namn: r.champions_bild.namn, saknas: false };
    return { id: null, namn: 'ett Champions-adset för bild (finns inte än — Champions bär video och de blandas aldrig)', saknas: true };
  }
  return { id: r.champions?.id ? String(r.champions.id) : null, namn: r.champions?.namn ?? 'Champions', saknas: !r.champions?.id };
}

/** Annonsen i adsetet som ska flyttas till Champions. Bara en BEVISAD annons
 *  (Chadbot ur kursen D2: "don't move small-spend, high-ROAS ads … at 5-15 %
 *  spend share they haven't been validated"): den levererar (ACTIVE — en pausad
 *  annons är ett beslut), den är över grinden 300 kr / 3 köp, över break-even
 *  med köp, och den bär minst flytt_andel av adsetets spend. Bland dem vinner
 *  vinstbidraget spend × (ROAS ÷ break-even − 1), aldrig ROAS ensamt. null =
 *  ingen bevisad annons. 14-dagarstalen ur avläsningen. Ren. */
export function bastaAnnons(adsetId, annonser, breakEven, { grindar = null, flyttAndel = null } = {}) {
  if (breakEven === null || breakEven === undefined) return null;
  const egna = (annonser ?? []).filter((x) => String(x.adset_id ?? '') === String(adsetId) && (Number(x.spend_sek) || 0) > 0);
  if (!egna.length) return null;
  const adsetSpend = egna.reduce((s, x) => s + (Number(x.spend_sek) || 0), 0);
  const vb = (x) => (Number(x.spend_sek) || 0) * (Number(x.roas) / breakEven - 1);
  const kandidater = egna.filter((x) => (!x.effective_status || String(x.effective_status) === 'ACTIVE')
    && (Number(x.kop) || 0) > 0 && Number(x.roas) >= breakEven
    && (!grindar || (Number(x.spend_sek) || 0) >= grindar.signifikans_spend_sek || (Number(x.kop) || 0) >= grindar.signifikans_kop)
    && (!flyttAndel || (Number(x.spend_sek) || 0) / adsetSpend >= flyttAndel));
  if (!kandidater.length) return null;
  kandidater.sort((x, y) => vb(y) - vb(x));
  const b = kandidater[0];
  return { namn: b.namn, id: String(b.id), spend_sek: b.spend_sek ?? null, kop: b.kop ?? null, roas: b.roas ?? null, andel_av_adset: r3((Number(b.spend_sek) || 0) / adsetSpend) };
}

/** Alla adsets i en avläsning. Ren. Sorterad: åtgärder först (flytt, stäng),
 *  sedan resten; inom varje på kronor (spend i fönstret), mest först. */
export function domAdsets(jobb, konfig, { breakEven = null, koVantar = null, idag = null, skyddade = new Set() } = {}) {
  const dag = idag ?? jobb.datum;
  const rader = (jobb.adsets ?? []).map((a) => domAdset(a, { kampanjserie: jobb.kampanj_serie ?? [], idag: dag, breakEven, grindar: konfig.grindar, konfig, koVantar, annonser: jobb.annonser ?? [], skyddade }));
  const ordning = { FLYTTA_TILL_CHAMPIONS: 0, STANG_ADSET: 1 };
  rader.sort((x, y) => (ordning[x.atgard] ?? 2) - (ordning[y.atgard] ?? 2) || (y.spend_sek ?? 0) - (x.spend_sek ?? 0));
  return rader;
}

/** FORSLAG-raderna till Axel (en per åtgärd). Kronorna: för en stängning det
 *  adsetet spenderade i fönstret, för en flytt annonsens 14 dagar. Ren. */
export function forslagRader(domar, datum, { logg = [] } = {}) {
  const ut = [];
  // En flytt föreslås EN gång per annons och testadset — annars duplicerar Axel
  // samma vinnare två gånger. Stängningar påminns varje rond (samma dag aldrig två).
  // Bara FÖREGÅENDE dagars förslag räknas: en omkörning samma dag ska visa
  // flytten igen (nyaRader hindrar att den loggas två gånger).
  const flyttade = new Set((logg ?? []).filter((r) => r.kod === 'FORSLAG' && r.atgard === 'FLYTTA_TILL_CHAMPIONS' && r.datum !== datum).map((r) => `${r.adset_id}|${r.annons_id}`));
  for (const d of domar ?? []) {
    if (d.atgard === 'FLYTTA_TILL_CHAMPIONS' && flyttade.has(`${d.adset_id}|${d.basta_annons?.id ?? null}`)) { d.redan_foreslagen = true; continue; }
    if (d.atgard === 'STANG_ADSET') {
      ut.push({ kod: 'FORSLAG', datum, niva: 'adset', atgard: 'STANG_ADSET', objekt: d.adset, adset_id: d.adset_id, dom: d.dom, orsak: d.motivering, kronor: d.spend_sek, spend_sek: d.spend_sek, kop: d.kop, roas: d.roas, andel: d.andel, dagar: d.dagar, fonster: d.fonster, ...(d.lardom ? { lardom_kravs: true } : {}), beslut: 'Axel' });
    } else if (d.atgard === 'FLYTTA_TILL_CHAMPIONS') {
      ut.push({ kod: 'FORSLAG', datum, niva: 'adset', atgard: 'FLYTTA_TILL_CHAMPIONS', objekt: d.basta_annons?.namn ?? d.adset, annons_id: d.basta_annons?.id ?? null, fran_adset: d.adset, adset_id: d.adset_id, till: d.till?.namn ?? null, till_id: d.till?.id ?? null, dom: d.dom, orsak: d.motivering, kronor: d.basta_annons?.spend_sek ?? d.spend_sek, spend_sek: d.spend_sek, kop: d.kop, roas: d.roas, andel: d.andel, dagar: d.dagar, fonster: d.fonster, beslut: 'Axel' });
    }
  }
  return ut.sort((x, y) => (y.kronor ?? 0) - (x.kronor ?? 0));
}

/** ADSET_DOM-raderna: domen per adset och dag, arkivets och Growth Guidens minne. */
export function adsetDomRader(domar, datum) {
  return (domar ?? []).map((d) => ({ kod: 'ADSET_DOM', datum, adset_id: d.adset_id, adset: d.adset, roll: d.roll, dom: d.dom, atgard: d.atgard, dagar: d.dagar, fonster: d.fonster, spend_sek: d.spend_sek, kop: d.kop, roas: d.roas, andel: d.andel, kampanj_roas: d.kampanj_roas, kampanj_roas_fore: d.kampanj_roas_fore, forbattrad: d.forbattrad }));
}

/** Rader som redan finns i loggen (samma dag, samma adset, samma kod/åtgärd)
 *  skrivs aldrig igen. Ren. */
export function nyaRader(rader, logg) {
  const nyckel = (r) => `${r.kod}|${r.datum}|${r.adset_id ?? ''}|${r.atgard ?? ''}`;
  const finns = new Set((logg ?? []).filter((r) => r.kod === 'ADSET_DOM' || (r.kod === 'FORSLAG' && r.niva === 'adset')).map(nyckel));
  return (rader ?? []).filter((r) => !finns.has(nyckel(r)));
}

const r2 = (v) => Math.round(v * 100) / 100;
const r3 = (v) => Math.round(v * 1000) / 1000;
