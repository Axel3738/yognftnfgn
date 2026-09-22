// inbrand.mjs — tar bort KÄLLANS inbrända svenska text ur en videoannons och
// lägger dit MARKNADENS. Steget körs på KÄLLAN, före omdubbningen.
//
// Varför det finns
// ----------------
// `marknadsvideo.mjs` byter slutkort och röst. Mätt med OCR på resultatet
// (CaraShellRoof_DK_CO_101_H1, 2026-09-20) stod källans svenska kvar i BILDEN:
// ordcaptions i pillret nederst hela filmen igenom, "1129 KR" och "1 469 KR"
// mitt i bild vid 17–19 s, "FRI FRAKT" och "30 DAGARS ÖPPET KÖP" vid 19–22 s.
// Tre fel samtidigt: fel SPRÅK, fel PRIS (1 129 kr är svenskt, danskt är
// 819 kr.) och fel VILLKOR — "30 dagars öppet köp" är KÄLLBUTIKENS löfte, och
// butiken som annonsen går till har 14 dages fortrydelsesret.
//
// ⚠️ ORDNINGEN ÄR INTE VALFRI. `elevenlabs-omdubb.mjs` tempo-anpassar varje
// videosegment efter repliken (70–135 %), så en tid mätt i källan stämmer inte
// i den dubbade filen. Fixas pixlarna FÖRST rider de med genom omtajmningen.
//
// Tre steg, tre program:
//   1. `inbrand-mat.py`   MÄTER (OCR + röda pixlar + pillerpixlar). Dömer inget.
//   2. den här filen      DÖMER (klass, roll, marknadens text, brandspärr).
//   3. `inbrand-rita.py`  RITAR (sudda, platta, text) och muxar om videon.
// Sedan mäts resultatet EN GÅNG TILL och varje svensk rad som står kvar
// rapporteras. En video med kvarvarande svensk text blir aldrig "klar".
//
//   node pipeline/omdubb/inbrand.mjs --kalla=<mp4> --ut=<mp4> --marknad=DK \
//        --produkt=factory/produkter/takskyddet.yaml \
//        --butik=factory/butiker/carashell.yaml \
//        [--till=22.9] [--cue=<marknadens.srt>] [--pillerruta] [--fps=3]
//        [--torr] [--behall]
//
//   --till        mät bara fram till den sekunden (slutkortet klipps bort senare)
//   --cue         lägg marknadens ordcaption i pillrets ruta. BARA för videor
//                 som INTE dubbas om — omtajmningen skulle annars dra isär
//                 bild och cue.
//   --pillerruta  sudda en tight ruta i stället för ett band över hela bredden
//   --torr        skriver mätningen, planen och rapporten men renderar ingenting.
//
// Skriver <ut> och <ut>.inbrand.json (mätning före, plan, mätning efter, dom).
// Exit 0 = rent, 4 = svensk text kvar eller rad utan ersättning, 2 = fel indata.

import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { marknadFor } from '../../factory/opsmarknader.mjs';
import { lasYaml } from '../../factory/yaml.mjs';
import { sökBrand } from '../../factory/brandord.mjs';

const ROT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

/** Slutkortet tonas in FÖRE sin nominella starttid. Mätt 2026-09-20 på
 *  CaraShellRoof_CO_101_H1: `slutkortskoll.py` säger 22,91 s, men OCR läste
 *  "BÄVERBUTIKEN" redan i bildrutan 22,67 s. Marginalen håller kortets text
 *  utanför mätningen — det klipps ändå bort av `marknadsvideo.mjs`. */
export const SLUTKORTSMARGINAL = 0.4;

// --------------------------------------------------------------------------
// Vikning och svenska markörer
// --------------------------------------------------------------------------
/** Gemener, å/ä/ö/æ/ø vikta, allt utom a–z0–9 bort. Måste vika: OCR:en läser
 *  "ÖPPET KÖP" som "OPPET KOP" (mätt 2026-09-20, rapidocr). */
export function vik(s) {
  return String(s ?? '')
    .toLowerCase()
    .replace(/ø/g, 'o')
    .replace(/æ/g, 'ae')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '');
}

/**
 * Svenska markörer — ord som källspråket har och som DANSKA/NORSKA saknar.
 *
 * ⚠️ Det här är en MARKÖRLISTA, inte en språkdetektor. Den hittar det vi vet
 * att vi ska leta efter, och ingenting annat. Orden är valda 2026-09-20 mot
 * repots egna danska texter (`factory/output/carashell/oversattning-da.json`,
 * `TEMAORD` i `factory/tema.mjs`) så att MARKNADENS egen text inte larmar:
 * "och"/"og", "att"/"at", "jag"/"jeg", "kronor"/"kroner", "dagars"/"dages",
 * "öppet köp"/"åbent køb", "fri frakt"/"gratis fragt", "arbetsdagar"/"hverdage".
 * Ord som stavas lika på båda språken ("med", "som", "aldrig", "på") står
 * MEDVETET inte här — de hade gjort varje dansk rad till ett falsklarm.
 *
 * Butikens egna `markorer_sv` läggs till ovanpå (butiksfilen är facit för
 * just den butikens sidor och annonser).
 */
export const SVENSKA_MARKORER = Object.freeze([
  'och', 'att', 'jag', 'att', 'inte', 'ett', 'inte', 'mycket', 'sjalv', 'ensam',
  'kronor', 'dagars', 'oppetkop', 'angerratt', 'frifrakt', 'fraktfritt',
  'arbetsdagar', 'kop', 'kopnu', 'lagerrensning', 'slutsalt', 'vanligafragor',
  'skyddar', 'vattnet', 'taket', 'husvagn', 'husbil', 'overdrag', 'oppet',
  'pengarnatillbaka', 'garanti', 'idag', 'lager',
]);

/**
 * Hittar svenska markörer i en textrad.
 * @returns {string[]} de markörer som faktiskt stod där (ordagrant, vikta)
 */
export function svenskaTraffar(text, extra = []) {
  const platt = vik(text);
  if (!platt) return [];
  const ord = String(text ?? '').split(/[\s/\\|,;:()[\]{}"'«»…]+/).map(vik).filter(Boolean);
  const listan = [...SVENSKA_MARKORER, ...extra.map(vik)].filter(Boolean);
  const funna = new Set();
  for (const m of listan) {
    if (m.length >= 5 ? platt.includes(m) : ord.includes(m)) funna.add(m);
  }
  return [...funna];
}

// --------------------------------------------------------------------------
// Klassificering — mätbara regler, ingen gissning
// --------------------------------------------------------------------------
/** Andelsgränser mätta 2026-09-20 på CaraShellRoof_CO_101_H1 (720×1280):
 *  ordcaptions h 0,030–0,041 av bildhöjden med mitten på 0,739–0,743;
 *  pop-texter h 0,061–0,155. Gränsen 0,055 ligger mellan de två högarna. */
export const PILLER_MAX_H = 0.055;
export const PILLER_MIN_CY = 0.62;

export function klassificeraRad(rad, H) {
  const h = rad.h_andel ?? (rad.box[3] - rad.box[1]) / H;
  const cy = rad.cy_andel ?? (rad.box[1] + rad.box[3]) / 2 / H;
  if (cy >= PILLER_MIN_CY && h <= PILLER_MAX_H) {
    return { klass: 'piller', regel: `mitten ${cy.toFixed(3)} ≥ ${PILLER_MIN_CY} och radhöjd ${h.toFixed(3)} ≤ ${PILLER_MAX_H}` };
  }
  if (h > PILLER_MAX_H) {
    return { klass: 'pop', regel: `radhöjd ${h.toFixed(3)} > ${PILLER_MAX_H}` };
  }
  return { klass: 'ovrig', regel: `radhöjd ${h.toFixed(3)} ≤ ${PILLER_MAX_H} men mitten ${cy.toFixed(3)} < ${PILLER_MIN_CY} — varken pillerzon eller pop-höjd` };
}

/** Står raden still? Ett överlägg gör det; text som är FILMAD följer kameran.
 *  Mätt: "Jayco" på husvagnen drev 9 px och "PRO-TEC" 13 px, medan varje
 *  ordcaption drev 1–5 px. Gränsen 8 px ligger mellan dem. */
export const MAX_DRIFT = 8;
export const MIN_RUTOR = 2;

export function arOverlagg(rad) {
  if (rad.rutor < MIN_RUTOR) return { ja: false, regel: `bara ${rad.rutor} bildruta — för kort för att mätas` };
  if (rad.drift_px > MAX_DRIFT) return { ja: false, regel: `rutan drev ${rad.drift_px} px > ${MAX_DRIFT} — texten följer kameran, alltså filmad` };
  return { ja: true, regel: `${rad.rutor} bildrutor, drift ${rad.drift_px} px ≤ ${MAX_DRIFT}` };
}

// --------------------------------------------------------------------------
// Marknadens sanning — texterna kommer ur filerna, aldrig ur en översättning
// --------------------------------------------------------------------------
/** Delar upp slutkortets fotrad i sina tre delar.
 *  ⚠️ Kopplingen till `factory/slutkort.py`: fotraden byggs där som
 *  `frakt · garanti · leverans` med ' · ' emellan. Ändras det formatet måste
 *  den här funktionen ändras — därför felar den hellre än gissar. */
export function delaFotrad(fotrad) {
  const delar = String(fotrad ?? '').split(' · ').map((d) => d.trim()).filter(Boolean);
  if (delar.length !== 3) {
    throw new Error(`Fotraden "${fotrad}" har ${delar.length} delar, inte 3 (frakt · garanti · leverans). `
      + 'Formatet kommer ur factory/slutkort.py — rätta den här funktionen om det ändrats.');
  }
  return { frakt: delar[0], garanti: delar[1], leverans: delar[2] };
}

/** Alla priser produktfilen känner i BUTIKENS basvaluta — det är dem källans
 *  inbrända siffror ska matchas mot. Nyckeln är siffrorna, så "1 469 KR",
 *  "1469KR" och "1.469" är samma tal. */
export function kallpriser(produkt) {
  const ut = { pris: new Set(), jamforpris: new Set() };
  const lagg = (nod) => {
    if (!nod) return;
    if (nod.pris != null) ut.pris.add(String(Math.round(Number(nod.pris))));
    if (nod.jamforpris != null) ut.jamforpris.add(String(Math.round(Number(nod.jamforpris))));
  };
  lagg(produkt?.ekonomi);
  for (const v of produkt?.varianter ?? []) lagg(v);
  return { pris: [...ut.pris], jamforpris: [...ut.jamforpris] };
}

const siffror = (s) => String(s ?? '').replace(/[^0-9]/g, '');

/**
 * Vad en uppmätt rad ska bli på marknaden.
 * @returns {{roll:string, ny:string|null, regel:string}}
 */
export function mappaRad(text, marknadstext, priser) {
  const platt = vik(text);
  const sif = siffror(text);
  const fot = delaFotrad(marknadstext.fotrad);

  if (sif && priser.pris.includes(sif)) {
    return { roll: 'pris', ny: marknadstext.pris, regel: `siffrorna "${sif}" = produktfilens pris i butikens basvaluta` };
  }
  if (sif && priser.jamforpris.includes(sif)) {
    return { roll: 'jamforpris', ny: marknadstext.jamforpris, regel: `siffrorna "${sif}" = produktfilens jämförpris` };
  }
  if (/(frifrakt|fraktfritt|gratisfrakt|fraktfri|frileverans)/.test(platt)) {
    return { roll: 'frakt', ny: fot.frakt, regel: 'raden säger fri frakt → butikens egen fraktrad på marknadens språk' };
  }
  if (/(oppetkop|angerratt|returratt|bytesratt|returer|pengarnatillbaka|nojdkundgaranti)/.test(platt)) {
    return {
      roll: 'villkor',
      ny: marknadstext.badge,
      regel: 'raden säger köpvillkor → BUTIKENS EGNA villkor (aldrig källans siffra översatt)',
    };
  }
  if (/(arbetsdagar|vardagar|leveranstid|leveranspa)/.test(platt)) {
    return { roll: 'leverans', ny: fot.leverans, regel: 'raden säger leveranstid → butikens egen leveransrad' };
  }
  // SPRÅKNEUTRAL RAD. "6,5×3 m" ser likadan ut på svenska och danska — måttet
  // ÄR måttet. En sådan rad ska skrivas tillbaka OFÖRÄNDRAD, inte täckas.
  // ⚠️ Mätt 2026-09-20: CaraShellRoof_PD_107_H1 och RI_103_H1 fick en svart
  // platta över storleken, eftersom ingen regel träffade och raden därmed
  // räknades som "täckt utan ersättning". En storleksangivelse är inte text
  // att översätta.
  if (sprakneutral(text)) {
    return { roll: 'neutral', ny: text, regel: 'raden bär inga språkbärande ord (bara siffror, enheter och tecken) — skrivs tillbaka oförändrad' };
  }
  // SPECIFIKATION med en teknisk kod ("210D-VÄV"). Ordet hämtas ur BUTIKENS
  // EGEN text på marknadens språk, aldrig ur en översättning jag hittar på:
  // features-raden i oversattning-<locale>.json säger "210D Oxford-væv", så
  // "210D-VÄV" blir "210D-VÆV". Hittas ingen sådan rad blir domen okänd —
  // hellre en namngiven lucka än ett påhittat ord.
  const spec = specord(text, marknadstext);
  if (spec) return { roll: 'spec', ny: spec.ny, regel: spec.regel };

  return { roll: 'okand', ny: null, regel: 'ingen regel träffade — texten går inte att ersätta med marknadens sanning' };
}

/** Bär raden några språkbärande ord alls? Siffror, enheter (m, cm, kg, %),
 *  och skiljetecken räknas inte. "6,5×3 m" → true, "210D-VÄV" → false. */
export function sprakneutral(text) {
  const utanTal = String(text ?? '')
    .replace(/\d+([.,]\d+)?/g, ' ')
    .replace(/[×x*/·,.\-–—:;()\[\]%°"']/g, ' ');
  const ord = utanTal.split(/\s+/).map((o) => o.trim()).filter(Boolean);
  // Enhetsord som är samma på alla marknader vi kör.
  const ENHETER = new Set(['m', 'cm', 'mm', 'km', 'kg', 'g', 'l', 'ml', 'd', 'st', 'mm2', 'm2', 'm²', 'cm²']);
  return ord.length > 0 && ord.every((o) => ENHETER.has(o.toLowerCase()));
}

/**
 * Ordet ur BUTIKENS EGNA marknadstext för en rad med en teknisk kod.
 * Letar efter samma kod (t.ex. "210D") i marknadens features-rader och tar
 * det sammansatta ordet som står intill. Källa, inte gissning.
 */
export function specord(text, marknadstext) {
  const kod = /(\d{2,4}\s?[A-Za-z])\b/.exec(String(text ?? ''));
  if (!kod) return null;
  const nyckel = kod[1].replace(/\s+/g, '').toUpperCase();
  const rader = [marknadstext.features, marknadstext.fotrad, marknadstext.titel]
    .flat()
    .filter((x) => typeof x === 'string');
  for (const rad of rader) {
    const m = new RegExp(`${nyckel}\\s+([\\p{L}]+-[\\p{L}]+|[\\p{L}]+)`, 'iu').exec(rad.replace(/\s+/g, ' '));
    if (!m) continue;
    // "Oxford-væv" → vi vill ha samma form som källan: "210D-VÄV" → "210D-VÆV".
    const sista = m[1].split('-').pop();
    return {
      ny: foljVersaler(text, `${nyckel}-${sista}`),
      regel: `koden "${nyckel}" finns i butikens egen marknadstext ("${m[0].trim()}") → ordet därifrån`,
    };
  }
  return null;
}

/** Källans versaler ska följa med: "1129 KR" → "819 KR.", inte "819 kr.". */
export function foljVersaler(kalla, ny) {
  const bokstaver = String(kalla ?? '').replace(/[^\p{L}]/gu, '');
  if (!bokstaver) return ny;
  const versaler = [...bokstaver].filter((c) => c === c.toUpperCase()).length;
  return versaler / bokstaver.length >= 0.8 ? String(ny).toUpperCase() : String(ny);
}

// --------------------------------------------------------------------------
// Planen
// --------------------------------------------------------------------------
const kladd = (box, pad, W, H) => [
  Math.max(0, Math.round(box[0] - pad)), Math.max(0, Math.round(box[1] - pad)),
  Math.min(W, Math.round(box[2] + pad)), Math.min(H, Math.round(box[3] + pad)),
];

const forena = (a, b) => [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[2], b[2]), Math.max(a[3], b[3])];

/**
 * Pillerbandet: ETT band för hela filmen, som `pipeline/no-captions.py`s facit.
 *
 * y kommer ur PIXELMÄTNINGEN (pillrets platta syns oavsett språk), x ur
 * OCR-raderna i bandet. ⚠️ x går INTE att mäta i pixlar i den här källan:
 * den nedre panelen är en drönarbild med vit husvagn och mörk mark, så både
 * "vita kolumner" och "mörka kolumner" spänner hela bildbredden (mätt
 * 2026-09-20: x 0–719 på en 720 px bred bild). Hittas ingen OCR-rad i bandet
 * suddas hela bredden — hellre för mycket än en halv svensk mening kvar.
 */
export function byggPillerband(matning, { pad = 12, maxGlapp = 0.8, tolerans = 20, helBredd = true } = {}) {
  const { W, H, piller, rader } = matning;
  const band = piller?.median_box;
  const fonster = piller?.fonster ?? [];
  if (!band && !fonster.length) return null;

  // Bara STABILA rader får bestämma bandets mått. ⚠️ Mätt 2026-09-20: OCR
  // läste husvagnens märke "Jayco" i två fragment ("to", "Jay") strax under
  // pillret; utan kravet drog de bandets underkant 34 px ned i bilden.
  const iBandet = (rader ?? []).filter((r) => {
    if (!arOverlagg(r).ja) return false;
    const cy = (r.box[1] + r.box[3]) / 2;
    return band ? cy >= band[1] - tolerans && cy <= band[3] + tolerans
      : klassificeraRad(r, H).klass === 'piller';
  });

  let x = null;
  for (const r of iBandet) x = x ? forena(x, r.box) : [...r.box];
  const y0 = Math.min(band ? band[1] : Infinity, x ? x[1] : Infinity);
  const y1 = Math.max(band ? band[3] : -Infinity, x ? x[3] : -Infinity);
  let rect;
  let kalla;
  if (helBredd || !x) {
    // ETT BAND ÖVER HELA BREDDEN är Axels facit (`pipeline/no-captions.py`s
    // huvud: Beltesliper_NO_PD_3). ⚠️ Skälet är inte teknik utan hur det SER
    // ut: en suddad ruta som svävar mitt i bilden läses som ett fel, medan ett
    // band kant i kant läses som en designad remsa — och det är i den remsan
    // marknadens egen caption sedan hamnar. Tittat på bildrutan 3,0 s i
    // CaraShellRoof_CO_101_H1 2026-09-20: den fria rutan syntes mer än texten
    // den dolde.
    rect = kladd([0, y0, W, y1], pad, W, H);
    kalla = x
      ? `y ur pillermätningen (${band ? band[1] : '—'}–${band ? band[3] : '—'}) och ${iBandet.length} OCR-rader, hela bredden`
      : 'y ur pillermätningen, hela bredden (ingen OCR-rad lästes i bandet)';
  } else {
    rect = kladd([x[0], y0, x[2], y1], pad, W, H);
    kalla = `y ur pillermätningen (${band ? band.slice(1, 4).join('/') : 'saknas'}), x ur ${iBandet.length} OCR-rader i bandet`;
  }

  // Tiderna: pillerfönstren och OCR-raderna slås ihop; glapp under maxGlapp
  // fylls igen (en cue som byts mellan två mätpunkter får inte blinka fram).
  // Varje spann växer en mätruta åt båda håll — pillret tonar in och ut
  // mellan två mätpunkter, och en halv inblinkande cue är värre än en
  // sekund suddad bakgrund.
  const ruta = 1 / (matning.fps || 3);
  const slut = matning.till ?? matning.langd ?? Infinity;
  const spann = [...fonster.map((f) => [...f.t]), ...iBandet.map((r) => [...r.t])]
    .map((t) => [Math.max(0, t[0] - ruta), Math.min(slut, t[1] + ruta)])
    .filter((t) => t[1] > t[0])
    .sort((a, b) => a[0] - b[0]);
  const tider = [];
  for (const s of spann) {
    const sista = tider[tider.length - 1];
    if (sista && s[0] - sista[1] <= maxGlapp) sista[1] = Math.max(sista[1], s[1]);
    else tider.push([...s]);
  }
  return { rect, tider: tider.map((t) => [Math.round(t[0] * 1000) / 1000, Math.round(t[1] * 1000) / 1000]), kalla, rader: iBandet };
}

/** Pop-blocken: ett per rött block, med raderna översatta till marknadens text. */
export function byggPopblock(matning, marknadstext, priser, { pad = 16 } = {}) {
  const { W, H } = matning;
  return (matning.rodblock ?? []).map((b) => {
    const rader = (b.rader ?? []).map((r) => {
      const m = mappaRad(r.text, marknadstext, priser);
      return { ...r, ...m, ny: m.ny == null ? null : foljVersaler(r.text, m.ny) };
    });
    // Jämförpriset läses ofta som skräp ("149", "14C9 KR", "Teer", "TUUT" i
    // fyra bildrutor i rad, mätt 2026-09-20). Raden UNDER en prisrad i samma
    // block, som ändå har minst två siffror, är därför jämförpriset — och den
    // råa avläsningen redovisas så en människa kan säga emot.
    const prisrad = rader.findIndex((r) => r.roll === 'pris');
    if (prisrad >= 0 && marknadstext.jamforpris) {
      for (let i = prisrad + 1; i < rader.length; i++) {
        if (rader[i].roll !== 'okand') continue;
        if (siffror(rader[i].text).length < 2) continue;
        rader[i].roll = 'jamforpris';
        rader[i].ny = foljVersaler(rader[prisrad].text, marknadstext.jamforpris);
        rader[i].regel = `raden under prisraden i samma block, ≥ 2 siffror (OCR läste "${rader[i].text}")`;
        break;
      }
    }
    // Jämförpriset STRYKS ÖVER. ⚠️ Mätt 2026-09-20 genom att titta på KÄLLANS
    // bildruta 17,6 s i CaraShellRoof_CO_101_H1: "1 469 KR" bär ett tjockt
    // streck rakt igenom, "1129 KR" gör det inte. En första körning skrev
    // "1.069 KR." utan streck — då läses raden som ett ANDRA pris i stället
    // för ett överstruket förepris, och hela rabatten försvinner ur annonsen.
    // Rollen kommer ur siffermatchningen mot produktfilen, inte ur en gissning
    // om layouten.
    for (const r of rader) r.stryk = r.roll === 'jamforpris';
    let platta = [...b.box];
    for (const r of rader) platta = forena(platta, r.box);
    return { t: [...b.t], platta: kladd(platta, pad, W, H), rodruta: b.box, rader };
  });
}

// --------------------------------------------------------------------------
// Efterkontroll
// --------------------------------------------------------------------------
/**
 * Dömer den RENDERADE videon. Två frågor, båda mätta:
 *   1. står någon av källans uppmätta rader kvar?
 *   2. finns någon svensk markör kvar i en rad vi inte själva skrev?
 * En rad vi själva skrev (marknadens text) räknas aldrig som kvarvarande.
 */
export function efterdom(efter, skrivna, markorer = []) {
  const vara = new Set(skrivna.map(vik).filter(Boolean));
  const kvar = [];
  for (const r of efter.rader ?? []) {
    const platt = vik(r.text);
    if (!platt || vara.has(platt)) continue;
    if ([...vara].some((v) => v.includes(platt) || platt.includes(v))) continue;
    const traffar = svenskaTraffar(r.text, markorer);
    if (!traffar.length) continue;
    const ol = arOverlagg(r);
    // ⚠️ FILMAD TEXT ÄR ALDRIG VÅR. Mätt 2026-09-20 på CaraShellRoof_PD_3_H1
    // och GT_2_H1: OCR läste trycket på en kvinnas t-shirt ("IN THE MEADOW")
    // som "INTE MEADOW", markören "inte" slog till, och två färdiga videor
    // dömdes "SVENSK TEXT KVAR". Texten sitter på ett plagg i filmen — den
    // går varken att ta bort eller att skylla på. En rad som följer kameran
    // redovisas därför som en ANMÄRKNING, aldrig som kvarvarande svenska.
    kvar.push({ text: r.text, t: r.t, box: r.box, rutor: r.rutor, drift_px: r.drift_px,
      markorer: traffar, overlagg: ol.ja, filmad: !ol.ja, varfor: ol.regel });
  }
  return kvar;
}

// --------------------------------------------------------------------------
// Körningen
// --------------------------------------------------------------------------
const kor = (argv, { tillat = false } = {}) => {
  const r = spawnSync(argv[0], argv.slice(1), { encoding: 'utf8', maxBuffer: 1 << 28 });
  if (r.status !== 0 && !tillat) {
    throw new Error(`${argv[0]} ${argv[1] ?? ''} misslyckades (${r.status}): ${String(r.stderr ?? r.error?.message ?? '').slice(-900)}`);
  }
  return r;
};

export function mat(fil, { fps = 3, till = null, konf = 0.45 } = {}) {
  const argv = ['python3', join(ROT, 'pipeline', 'omdubb', 'inbrand-mat.py'), fil, `--fps=${fps}`, `--konf=${konf}`];
  if (till != null) argv.push(`--till=${till}`);
  const r = kor(argv);
  try {
    return JSON.parse(r.stdout);
  } catch {
    throw new Error(`inbrand-mat.py svarade inte med JSON:\n${String(r.stdout).slice(0, 400)}\n${String(r.stderr).slice(-400)}`);
  }
}

export function marknadstexter({ produkt, butik, marknad }) {
  const r = kor(['python3', join(ROT, 'factory', 'slutkort.py'),
    '--produkt', produkt, '--butik', butik, '--marknad', marknad, '--json-text']);
  return JSON.parse(r.stdout);
}

/** Ingen rad skrivs om den bär källbrandet — två spärrar, samma svar. */
export function brandspärr(texter) {
  const fynd = [];
  for (const t of texter) {
    const { träff, fynd: f } = sökBrand(t);
    if (träff) fynd.push({ text: t, fynd: f });
  }
  if (fynd.length) {
    throw new Error('BRANDORD I TEXTEN SOM SKULLE RITAS (Axels beslut 2026-09-18 — '
      + 'butikens namn och domän står aldrig i en annons):\n'
      + fynd.map((x) => `  "${x.text}" → ${x.fynd.map((y) => `${y.ord} (${y.sätt})`).join(', ')}`).join('\n'));
  }
}

/** SRT → [{t0, t1, text}] (samma enkla tolkning som elevenlabs-omdubb.mjs). */
export function lasSrt(fil) {
  const txt = readFileSync(fil, 'utf8').replace(/\r/g, '');
  const ut = [];
  for (const block of txt.trim().split(/\n\n+/)) {
    const rader = block.trim().split('\n');
    const m = /(\d+):(\d+):(\d+)[,.](\d+)\s*-->\s*(\d+):(\d+):(\d+)[,.](\d+)/.exec(rader[1] ?? '');
    if (!m) continue;
    const s = (a, b, c, d) => Number(a) * 3600 + Number(b) * 60 + Number(c) + Number(d) / 1000;
    ut.push({ t0: s(m[1], m[2], m[3], m[4]), t1: s(m[5], m[6], m[7], m[8]), text: rader.slice(2).join(' ').trim() });
  }
  return ut;
}

const args = Object.fromEntries(process.argv.slice(2).map((a) => {
  const m = /^--([^=]+)(?:=(.*))?$/.exec(a); return m ? [m[1], m[2] ?? true] : [a, true];
}));

export async function huvud() {
  for (const k of ['kalla', 'ut', 'marknad', 'produkt', 'butik']) {
    if (!args[k]) { console.error(`--${k} saknas. Läs huvudet i filen.`); process.exit(2); }
  }
  const kalla = String(args.kalla), ut = String(args.ut);
  if (!existsSync(kalla)) { console.error(`Källan finns inte: ${kalla}`); process.exit(2); }
  const marknaden = marknadFor(args.marknad);
  const fps = Number(args.fps ?? 3);
  const tillRatt = args.till != null ? Number(args.till) : null;
  const till = tillRatt != null ? Math.max(0.5, tillRatt - SLUTKORTSMARGINAL) : null;

  const produkt = lasYaml(readFileSync(String(args.produkt), 'utf8'));
  const butik = lasYaml(readFileSync(String(args.butik), 'utf8'));
  const markorer = butik?.butik?.markorer_sv ?? [];
  const priser = kallpriser(produkt);
  const { texter: mt, kallor } = marknadstexter({ produkt: String(args.produkt), butik: String(args.butik), marknad: marknaden.kod });

  console.log(`${basename(kalla)} → ${marknaden.kod} (${marknaden.sprak}, ${marknaden.valuta})`);
  console.log(`  marknadens sanning: pris ${mt.pris} · jämförpris ${mt.jamforpris} · villkor "${mt.badge}"`);
  console.log(`                      fotrad "${mt.fotrad}"`);
  console.log(`  källans priser i produktfilen: ${priser.pris.join(', ')} (jämför ${priser.jamforpris.join(', ')})`);
  if (till != null) console.log(`  mäter till ${till.toFixed(2)} s (slutkortet från ${tillRatt} s klipps bort senare, marginal ${SLUTKORTSMARGINAL} s)`);

  console.log('\nMÄTNING (OCR + röda pixlar + pillerpixlar)');
  const fore = mat(kalla, { fps, till });
  console.log(`  ${fore.W}×${fore.H}, ${fore.langd} s, ${fore.rutor} OCR-bildrutor, ${fore.rader.length} textfönster`);
  for (const r of fore.rader) {
    const k = klassificeraRad(r, fore.H);
    const o = arOverlagg(r);
    console.log(`  ${r.t[0].toFixed(2)}–${r.t[1].toFixed(2)}s ${String(r.rutor).padStart(2)}r ${JSON.stringify(r.box).padEnd(22)} `
      + `${k.klass.padEnd(6)} ${o.ja ? 'stabil ' : 'RÖRLIG '} ${JSON.stringify(r.text)}`);
  }
  console.log(`  pillerpixlar: ${fore.piller?.rutor_med_piller ?? 0}/${fore.piller?.rutor ?? 0} bildrutor, median ${JSON.stringify(fore.piller?.median_box)}`);
  for (const b of fore.rodblock ?? []) {
    console.log(`  rött block ${b.t[0].toFixed(2)}–${b.t[1].toFixed(2)}s ${JSON.stringify(b.box)} (max ${b.max_px} röda px, tröskel ${b.trosk_px})`);
    for (const r of b.rader) console.log(`      rad ${JSON.stringify(r.box)} ${JSON.stringify(r.text)} — ruta ur ${r.ruta_ur}; avläsningar ${JSON.stringify(r.texter)}`);
  }

  // ---- planen ----
  const band = byggPillerband(fore, { helBredd: !args.pillerruta });
  const block = byggPopblock(fore, mt, priser);
  const atgarder = [];
  const skrivna = [];
  const cuear = args.cue ? lasSrt(String(args.cue)) : null;

  if (band) {
    for (const t of band.tider) {
      // Bandet suddas ALLTID över hela spannet, även i --cue-läge.
      // ⚠️ Mätt 2026-09-20: läggs bara cue-rutor ut glimtar källans svenska
      // fram i luckorna MELLAN två SRT-cues (0,24 s mellan cue 1 och 2 räckte
      // för att "Jag drar taket", "takluckorna.", "1129 kronor." och
      // "30 dagars öppet köp." skulle stå kvar i var sin bildruta — och
      // efterkontrollen hittade dem).
      atgarder.push({ typ: 'sudda', rect: band.rect, t });
      for (const c of cuear ?? []) {
        if (c.t1 <= t[0] || c.t0 >= t[1] || !c.text) continue;
        atgarder.push({ typ: 'cue', rect: band.rect, sudda: false, t: [Math.max(t[0], c.t0), Math.min(t[1], c.t1)], text: c.text });
        skrivna.push(c.text);
      }
    }
  }
  const utanErsattning = [];
  for (const b of block) {
    const rader = [];
    for (const r of b.rader) {
      // stryk sätts av byggPopblock (jämförpriset stryks, priset aldrig).
      if (r.ny) { rader.push({ text: r.ny, box: r.box, stryk: Boolean(r.stryk) }); skrivna.push(r.ny); }
      else utanErsattning.push({ t: b.t, text: r.text, box: r.box, regel: r.regel });
    }
    atgarder.push({ typ: 'pop', t: b.t, platta: b.platta, rader });
  }
  brandspärr(skrivna);

  console.log('\nPLAN');
  if (band) console.log(`  pillerband ${JSON.stringify(band.rect)} — ${band.kalla}; ${band.tider.length} spann ${JSON.stringify(band.tider)}`);
  else console.log('  inget pillerband hittades (ingen ordcaption uppmätt)');
  for (const b of block) {
    console.log(`  pop ${b.t[0].toFixed(2)}–${b.t[1].toFixed(2)}s platta ${JSON.stringify(b.platta)}`);
    for (const r of b.rader) console.log(`      ${JSON.stringify(r.text)} → ${r.ny ? JSON.stringify(r.ny) : 'INGEN ERSÄTTNING'}  [${r.roll}] ${r.regel}`);
  }
  if (cuear) console.log(`  marknadens cue läggs i pillrets ruta ur ${basename(String(args.cue))} (${cuear.length} cues) — bara giltigt om videon INTE dubbas om`);
  if (utanErsattning.length) {
    console.log('  ⚠️ RADER UTAN ERSÄTTNING (de täcks, men annonsen tappar budskapet):');
    for (const r of utanErsattning) console.log(`      ${r.t[0].toFixed(2)}s ${JSON.stringify(r.text)} — ${r.regel}`);
  }

  const rapport = {
    kalla, ut, marknad: marknaden.kod, sprak: marknaden.sprak, valuta: marknaden.valuta,
    marknadstext: mt, kallor, kallpriser: priser, till, fps,
    matning_fore: fore, plan: { band, block, atgarder }, utan_ersattning: utanErsattning,
  };

  if (args.torr) {
    writeFileSync(`${ut}.inbrand.json`, `${JSON.stringify({ ...rapport, dom: 'TORR' }, null, 1)}\n`);
    console.log(`\n(torr: inget renderat. Planen ligger i ${basename(ut)}.inbrand.json)`);
    process.exit(0);
  }

  if (!atgarder.length) {
    console.log('\nIngen inbränd text att byta — källan kopieras oförändrad.');
    kor(['ffmpeg', '-y', '-hide_banner', '-loglevel', 'error', '-i', kalla, '-c', 'copy', '-movflags', '+faststart', ut]);
    writeFileSync(`${ut}.inbrand.json`, `${JSON.stringify({ ...rapport, dom: 'REN (inget mätt)' }, null, 1)}\n`);
    process.exit(0);
  }

  const tmp = `${ut}.inbrand.arbete`;
  mkdirSync(tmp, { recursive: true });
  const planfil = join(tmp, 'plan.json');
  writeFileSync(planfil, JSON.stringify({
    in: kalla, ut, W: fore.W, H: fore.H,
    produkt: String(args.produkt), butik: String(args.butik), marknad: marknaden.kod,
    atgarder,
  }, null, 1));

  console.log('\nRENDERAR');
  const r = kor(['python3', join(ROT, 'pipeline', 'omdubb', 'inbrand-rita.py'), planfil]);
  const res = JSON.parse(r.stdout);
  console.log(`  ${basename(ut)} — ${res.rorda_rutor} av ${res.rutor} bildrutor rörda, ${res.langd} s`);
  rapport.rendering = res;

  console.log('\nEFTERKONTROLL (OCR på resultatet)');
  const efter = mat(ut, { fps, till });
  const alla = efterdom(efter, skrivna, markorer);
  // FILMAD text är innehåll i filmen (tryck på ett plagg, en skylt, en
  // registreringsskylt) — den går varken att ta bort eller att skylla på, och
  // den fäller därför aldrig videon. Den redovisas som en ANMÄRKNING så en
  // människa kan säga emot. Se kommentaren i efterdom().
  const kvar = alla.filter((k) => !k.filmad);
  const filmat = alla.filter((k) => k.filmad);
  rapport.matning_efter = efter;
  rapport.kvar = kvar;
  rapport.filmat = filmat;
  for (const k of kvar) {
    console.log(`  ❌ ${k.t[0].toFixed(2)}–${k.t[1].toFixed(2)}s ${JSON.stringify(k.box)} ${JSON.stringify(k.text)} — svenska markörer: ${k.markorer.join(', ')} (${k.varfor})`);
  }
  for (const k of filmat) {
    console.log(`  ℹ️ ${k.t[0].toFixed(2)}–${k.t[1].toFixed(2)}s ${JSON.stringify(k.text)} — markör "${k.markorer.join(', ')}" men texten är FILMAD (${k.varfor}); fäller inte videon, titta om den stör`);
  }
  if (!kvar.length) console.log('  ✅ ingen svensk markör kvar i ett överlägg');

  const dom = kvar.length ? 'SVENSK TEXT KVAR' : (utanErsattning.length ? 'TÄCKT UTAN ERSÄTTNING' : 'REN');
  rapport.dom = dom;
  writeFileSync(`${ut}.inbrand.json`, `${JSON.stringify(rapport, null, 1)}\n`);
  if (!args.behall) rmSync(tmp, { recursive: true, force: true });

  console.log(`\n${kvar.length ? '❌' : (utanErsattning.length ? '⚠️' : '✅')} ${dom} — rapport i ${basename(ut)}.inbrand.json`);
  process.exit(kvar.length || utanErsattning.length ? 4 : 0);
}

if (process.argv[1]?.endsWith('inbrand.mjs')) await huvud();
