// Mönsterminnet — motorns gissningar, rätt eller fel (Axels beställning
// 2026-09-30: "den ska lära sig av sina misstag … hitta mönster för vad den har
// trott varje gång och som har blivit fel … och vad den har bedömt rätt, lagra
// det … men vi får inte ta konkreta förbud, för en grej som brukar funka kanske
// bara inte funkade två eller tre gånger").
//
// Varje budgetbeslut är en gissning om de närmaste dygnen:
//   höjning          → "kampanjen fortsätter gå med vinst"
//   sänkning         → "kampanjen är inte värd pengarna just nu"
//   vänta över target → "toppen håller kanske inte"
//   vänta i förlust   → "den kan vända"
// Gissningen rättas mot det som faktiskt hände dygn D+1..D+3 — ingen
// kontrafaktik, bara utfallet. Sedan letas mönster: lägen (kända VID beslutet)
// där gissningen gått fel eller rätt oftare än vanligt.
//
// Tre skydd mot förbud på slump:
//   1. Krympning: varje mönster dras mot beslutets vanliga träffsäkerhet
//      (betafördelning, fyra fall i förhand). Två–tre missar i ett läge som
//      brukar gå bra räcker inte för att kalla det ett mönster.
//   2. Glömska: äldre gissningar väger mindre (halveringstid 30 dygn). Ett
//      mönster som slutar gå fel försvinner av sig självt.
//   3. Aldrig en regel: minnet ger en varning bredvid dagens beslut och en
//      lista i rapporten. Motorn ändras bara när Axel säger ja till ett förslag.
//
// Ren räkning. Filer: agent/gissningar.jsonl (en rad per gissning, skrivs en
// gång, glöms aldrig — datan i Meta räcker bara 45 dygn bakåt) och
// agent/monster.json (dagens mönster). Skrivs av agent/facit.mjs --skriv.
import { summa, plusDagar, dagarMellan, zonFor, HOJ_KODER, SANK_KODER, HALL_KODER, MOGNAD_DAGAR, KONTON } from './facit.mjs';
import { lasBelopp, targetRoas } from './besked.mjs';

/** Gissningens version. Ändras definitionen räknas bara rader med gällande version. */
export const GISSNING_VERSION = 1;
/** Utfallet läses dygn D+1..D+3 och kräver minst två dygn med spend. */
export const UTFALL_DAGAR = 3;
/** Äldre gissningar väger mindre: halva vikten efter så många dygn. */
export const HALVERINGSTID = 30;
/** Förhandstro: så många "fall" av beslutets vanliga träffsäkerhet läggs till varje mönster. */
export const FORHAND = 4;
/** Ett mönster listas först vid så många fall och olika kampanjer (par av villkor: fler fall). */
export const MIN_FALL = 6;
export const MIN_FALL_PAR = 8;
export const MIN_KAMPANJER = 4;
/** Så mycket sämre (eller bättre) än vanligt, och säkert på 80 %-nivån. */
export const SKILLNAD = 0.15;
const Z80 = 1.2816;

export const BESLUT = Object.freeze({
  HOJ: { namn: 'höjning', tro: 'trodde att kampanjen skulle fortsätta gå med vinst', ratt: 'gick med vinst de tre dygnen efter', fel: 'gick under break-even de tre dygnen efter' },
  SANK: { namn: 'sänkning', tro: 'trodde att kampanjen inte var värd pengarna just då', ratt: 'fortsatte under break-even', fel: 'studsade över target direkt efter' },
  VANTA_HOG: { namn: 'vänta trots ROAS över target', tro: 'trodde att toppen kanske inte höll', ratt: 'föll under target', fel: 'stod kvar över target (en missad höjning)' },
  VANTA_FORLUST: { namn: 'vänta med en kampanj i förlust', tro: 'trodde att kampanjen kunde vända', ratt: 'tog sig över break-even', fel: 'stannade under break-even' },
});

/** Villkoren — allt känt när motorn bestämde sig. */
export const DRAG = Object.freeze({
  lage: 'ROAS mot break-even',
  over_target: 'dygn i rad över target',
  kop: 'köp senaste 3 dygnen',
  andring: 'motorns ändring veckan innan',
  budget: 'budget',
  trend: 'senaste dygnet',
  marknad: 'marknad',
});

export const lageFor = (q) => (!Number.isFinite(q) ? null : q < 1 ? 'under 1,0 × BE' : q < 1.3 ? '1,0–1,3 × BE' : q < 1.6 ? '1,3–1,6 × BE' : q < 2 ? '1,6–2,0 × BE' : q < 3 ? '2,0–3,0 × BE' : 'över 3,0 × BE');
export const overTargetFor = (n) => (!Number.isFinite(n) ? null : n >= 3 ? '3 eller fler' : String(n));
export const kopFor = (k) => (!Number.isFinite(k) ? null : k < 10 ? 'under 10' : k < 30 ? '10–29' : '30 eller fler');

/** Motorns egna genomförda budgetändringar dygn D−10..D−4 (samma källa i ronden och här). */
export function andringFor(logg, kampanjId, datum) {
  const fran = plusDagar(datum, -10); const till = plusDagar(datum, -4);
  let upp = false; let ner = false;
  for (const r of logg ?? []) {
    if (!r || String(r.kampanj_id) !== String(kampanjId) || r.genomford !== true || !r.datum || r.datum < fran || r.datum > till) continue;
    if (HOJ_KODER.includes(r.kod)) upp = true;
    if (SANK_KODER.includes(r.kod)) ner = true;
  }
  return upp && ner ? 'både upp och ner' : upp ? 'höjning' : ner ? 'sänkning' : 'ingen';
}

/** Senaste dygnet mot tredygnssnittet, ur en dygnsserie [{datum, spend, intakt|roas}]. */
export function trendFor(dygn, till) {
  const r = (dygn ?? []).filter((d) => d && d.datum <= till && Number(d.spend) > 0).sort((a, b) => (a.datum < b.datum ? -1 : 1)).slice(-3);
  if (r.length < 3) return null;
  const intakt = (d) => (Number.isFinite(Number(d.intakt)) ? Number(d.intakt) : Number(d.roas) * Number(d.spend));
  const s = r.reduce((x, d) => x + Number(d.spend), 0); const i = r.reduce((x, d) => x + intakt(d), 0);
  const sista = r[r.length - 1];
  if (!(s > 0) || !Number.isFinite(i)) return null;
  return intakt(sista) / Number(sista.spend) >= i / s ? 'bättre än snittet' : 'sämre än snittet';
}

/** Vilket beslut en loggrad eller dagens dom är, eller null (ingen gissning att rätta). */
export function beslutFor(kod, q, qTarget) {
  if (HOJ_KODER.includes(kod)) return 'HOJ';
  if (SANK_KODER.includes(kod)) return 'SANK';
  if (!HALL_KODER.includes(kod) || !Number.isFinite(q)) return null;
  if (q >= qTarget) return 'VANTA_HOG';
  if (q < 1) return 'VANTA_FORLUST';
  return null; // mellan break-even och target: ingen tydlig gissning
}

/** Rättar en gissning mot ROAS D+1..D+3 (i break-even-enheter). */
export function ratta(beslut, qEfter, qTarget) {
  if (!Number.isFinite(qEfter)) return null;
  if (beslut === 'HOJ') return qEfter >= 1 ? 'RATT' : 'FEL';
  if (beslut === 'SANK') return qEfter >= qTarget ? 'FEL' : qEfter < 1 ? 'RATT' : 'OKLART';
  if (beslut === 'VANTA_HOG') return qEfter >= qTarget ? 'FEL' : 'RATT';
  if (beslut === 'VANTA_FORLUST') return qEfter >= 1 ? 'RATT' : 'FEL';
  return null;
}

/** Dygn i rad (bakåt från D−1) med dags-ROAS ≥ target, ur serien. */
function overTargetUrSerie(m, datum, target) {
  let n = 0;
  for (let d = plusDagar(datum, -1); n < 10; d = plusDagar(d, -1)) {
    const v = m?.get(d);
    if (!v || !(v.spend > 0) || !(v.intakt / v.spend >= target)) break;
    n += 1;
  }
  return n;
}

/**
 * Gissningarna ur budgetloggen och dygnsserien. `serier` = { SE: Map, NO: Map }
 * (byggSerie), `until` = sista dygnet med data. Bara mogna gissningar (D+3 +
 * mognad ≤ until). En gissning per kampanj och dygn; en budgetändring vinner
 * över ett hållbeslut samma dygn.
 */
export function gissningar(logg, serier, { until }) {
  const perDygn = new Map();
  for (const r of logg ?? []) {
    if (!r?.kampanj_id || !r.datum || r.annons_id || !Number.isFinite(lasBelopp(r.roas_3d ?? null))) continue;
    const andring = HOJ_KODER.includes(r.kod) || SANK_KODER.includes(r.kod);
    if (andring && r.genomford !== true) continue;
    const k = `${r.kampanj_id}|${r.datum}`;
    if (perDygn.has(k) && !andring) continue;
    perDygn.set(k, r);
  }
  const ut = [];
  for (const r of perDygn.values()) {
    const marknad = KONTON[String(r.ad_account_id ?? '').replace(/^act_/, '')];
    const serie = serier[marknad];
    if (!serie) continue;
    const be = lasBelopp(r.break_even ?? null);
    const roas = lasBelopp(r.roas_3d);
    if (!Number.isFinite(be) || be <= 1) continue;
    const target = targetRoas(be).target;
    const q = roas / be; const qT = target / be;
    const beslut = beslutFor(r.kod, q, qT);
    if (!beslut) continue;
    if (plusDagar(r.datum, UTFALL_DAGAR + MOGNAD_DAGAR) > until) continue;
    const kid = String(r.kampanj_id);
    const efter = summa(serie, kid, plusDagar(r.datum, 1), plusDagar(r.datum, UTFALL_DAGAR));
    if (efter.dagar - efter.nolldygn < 2 || !(efter.spend > 0)) continue;
    const qEfter = efter.roas / be;
    const utfall = ratta(beslut, qEfter, qT);
    if (!utfall) continue;
    const m = serie.get(kid);
    const tolkad = /(\d+) dygn i rad över target/.exec(r.motivering ?? '');
    const dygnFore = m ? [...m.entries()].map(([datum, v]) => ({ datum, ...v })) : [];
    ut.push({
      version: GISSNING_VERSION,
      nyckel: `${beslut}|${kid}|${r.datum}`,
      datum: r.datum, kampanj_id: kid, kampanj_namn: r.kampanj_namn ?? null, marknad, beslut, kod: r.kod,
      drag: {
        lage: lageFor(q),
        over_target: overTargetFor(tolkad ? Number(tolkad[1]) : overTargetUrSerie(m, r.datum, target)),
        kop: kopFor(lasBelopp(r.kop_3d ?? null)),
        andring: andringFor(logg, kid, r.datum),
        budget: zonFor(lasBelopp(r.gammal_budget ?? null)),
        trend: trendFor(dygnFore, plusDagar(r.datum, -1)),
        marknad,
      },
      q_fore: Math.round(q * 1000) / 1000, q_efter: Math.round(qEfter * 1000) / 1000, q_target: Math.round(qT * 1000) / 1000,
      utfall,
    });
  }
  return ut.sort((a, b) => (a.datum < b.datum ? -1 : a.datum > b.datum ? 1 : 0));
}

const vikt = (datum, idag) => 0.5 ** (Math.max(0, dagarMellan(datum, idag)) / HALVERINGSTID);
const hashId = (s) => { let h = 2166136261; for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return `M${String((h >>> 0) % 10000).padStart(4, '0')}`; };

/** Statistiken för en grupp gissningar mot beslutets vanliga träffsäkerhet p0. */
function statistik(rader, p0, idag) {
  const bedomda = rader.filter((r) => r.utfall === 'RATT' || r.utfall === 'FEL');
  let wR = 0; let wF = 0;
  for (const r of bedomda) { const w = vikt(r.datum, idag); if (r.utfall === 'RATT') wR += w; else wF += w; }
  const a = FORHAND * p0 + wR; const b = FORHAND * (1 - p0) + wF;
  const andel = a / (a + b);
  const sd = Math.sqrt((andel * (1 - andel)) / (a + b + 1));
  // Senaste utfallen i tidsordning: hur många fel i rad på slutet?
  let feliRad = 0;
  for (let i = bedomda.length - 1; i >= 0 && bedomda[i].utfall === 'FEL'; i--) feliRad += 1;
  return {
    fall: bedomda.length, kampanjer: new Set(bedomda.map((r) => r.kampanj_id)).size,
    ratt: bedomda.filter((r) => r.utfall === 'RATT').length, fel: bedomda.filter((r) => r.utfall === 'FEL').length,
    andel: Math.round(andel * 1000) / 1000, lag: Math.round((andel - Z80 * sd) * 1000) / 1000, hog: Math.round((andel + Z80 * sd) * 1000) / 1000,
    fel_i_rad: feliRad, senast: bedomda.at(-1)?.datum ?? null,
  };
}

/**
 * Mönstren ur alla sparade gissningar. Per beslut: vanlig träffsäkerhet (p0),
 * och varje villkor och par av villkor som skiljer sig säkert från den.
 * `tidigare` = gårdagens monster.json (för när ett mönster först listades).
 */
export function monster(alla, { idag, tidigare = null } = {}) {
  const rader = (alla ?? []).filter((r) => r.version === GISSNING_VERSION && r.datum <= idag);
  const forst = new Map((tidigare?.monster ?? []).map((m) => [m.id, m.forst_listad]));
  const ut = { skapad: idag, version: GISSNING_VERSION, halveringstid: HALVERINGSTID, beslut: {}, monster: [] };
  for (const beslut of Object.keys(BESLUT)) {
    const egna = rader.filter((r) => r.beslut === beslut);
    const bed = egna.filter((r) => r.utfall === 'RATT' || r.utfall === 'FEL');
    if (!bed.length) continue;
    let wR = 0; let w = 0;
    for (const r of bed) { const v = vikt(r.datum, idag); w += v; if (r.utfall === 'RATT') wR += v; }
    const p0 = w > 0 ? wR / w : 0.5;
    ut.beslut[beslut] = { gissningar: egna.length, ratt: bed.filter((r) => r.utfall === 'RATT').length, fel: bed.filter((r) => r.utfall === 'FEL').length, oklara: egna.length - bed.length, andel: Math.round(p0 * 1000) / 1000 };
    const enkla = new Map();
    const kandidater = [];
    const nycklar = Object.keys(DRAG);
    const grupper = [];
    for (const d of nycklar) for (const v of new Set(egna.map((r) => r.drag[d]).filter((x) => x !== null && x !== undefined))) grupper.push({ [d]: v });
    for (let i = 0; i < nycklar.length; i++) for (let j = i + 1; j < nycklar.length; j++) {
      const par = new Set(egna.filter((r) => r.drag[nycklar[i]] != null && r.drag[nycklar[j]] != null).map((r) => `${r.drag[nycklar[i]]}\u0000${r.drag[nycklar[j]]}`));
      for (const p of par) { const [a, b] = p.split('\u0000'); grupper.push({ [nycklar[i]]: a, [nycklar[j]]: b }); }
    }
    for (const villkor of grupper) {
      const grupp = egna.filter((r) => Object.entries(villkor).every(([k, v]) => r.drag[k] === v));
      const st = statistik(grupp, p0, idag);
      const ettVillkor = Object.keys(villkor).length === 1;
      if (ettVillkor) enkla.set(JSON.stringify(villkor), st);
      if (st.fall < (ettVillkor ? MIN_FALL : MIN_FALL_PAR) || st.kampanjer < MIN_KAMPANJER) continue;
      let typ = null;
      if (st.andel <= p0 - SKILLNAD && st.hog < p0) typ = 'miss';
      else if (st.andel >= p0 + SKILLNAD && st.lag > p0) typ = 'styrka';
      else if (st.fel_i_rad >= 3 && st.andel >= p0 - 0.05) typ = 'nyligen_samre';
      if (!typ) continue;
      kandidater.push({ villkor, st, typ });
    }
    for (const k of kandidater) {
      // Ett par listas bara om det säger mer än båda sina enkla villkor.
      if (Object.keys(k.villkor).length === 2 && k.typ !== 'nyligen_samre') {
        const foraldrar = Object.entries(k.villkor).map(([d, v]) => enkla.get(JSON.stringify({ [d]: v }))).filter(Boolean);
        if (foraldrar.some((f) => (k.typ === 'miss' ? f.andel - k.st.andel : k.st.andel - f.andel) < 0.1)) continue;
      }
      const id = hashId(`${beslut}|${JSON.stringify(k.villkor)}`);
      ut.monster.push({ id, beslut, villkor: k.villkor, typ: k.typ, vanlig_andel: Math.round(p0 * 1000) / 1000, ...k.st, forst_listad: forst.get(id) ?? idag });
    }
  }
  const tyngd = (m) => Math.abs(m.andel - m.vanlig_andel) * Math.sqrt(m.fall);
  ut.monster.sort((a, b) => tyngd(b) - tyngd(a));
  return ut;
}

const villkorText = (v) => Object.entries(v).map(([k, x]) => (k === 'andring' ? (x === 'ingen' ? 'ingen ändring veckan innan' : `${x} veckan innan`) : k === 'trend' ? `senaste dygnet ${x}` : k === 'marknad' ? x : `${DRAG[k]} ${x}`)).join(' och ');
const pct = (x) => `${Math.round(x * 100)} %`;

/** En mening om ett mönster, på svenska, utan förbud. */
export function monsterText(m) {
  const b = BESLUT[m.beslut];
  const bas = `${b.namn[0].toUpperCase()}${b.namn.slice(1)} när ${villkorText(m.villkor)}: ${b.ratt} ${m.ratt} av ${m.fall} gånger (vanligtvis ${pct(m.vanlig_andel)})`;
  if (m.typ === 'miss') return `${bas}.${m.fel_i_rad >= 2 ? ` De ${m.fel_i_rad} senaste gick fel i rad.` : ''} Varning, inget förbud.`;
  if (m.typ === 'styrka') return `${bas}. Här brukar motorn ha rätt.`;
  return `${bas}, men de ${m.fel_i_rad} senaste gick fel i rad. Brukar fungera — håll ögonen på det, inget förbud.`;
}

/**
 * Noten bredvid dagens beslut: mönster som matchar dagens läge, eller null.
 * `rad` = rondens rad (roas3d, kop3d, budget, dagarOverTarget, dom), `logg` =
 * budgetloggen, `marknad` = SE/NO. Ändrar aldrig domen.
 */
export function monsterNot(minne, rad, { logg = [], idag, marknad = null } = {}) {
  if (!minne?.monster?.length || !rad?.dom) return null;
  const be = rad.dom.breakEven;
  if (!Number.isFinite(be) || !Number.isFinite(rad.roas3d)) return null;
  const qT = targetRoas(be, rad.targetRoas ?? null).target / be;
  const q = rad.roas3d / be;
  const beslut = beslutFor(rad.dom.kod, q, qT);
  if (!beslut) return null;
  const drag = {
    lage: lageFor(q), over_target: overTargetFor(rad.dagarOverTarget), kop: kopFor(rad.kop3d), andring: andringFor(logg, rad.id, idag),
    budget: zonFor(rad.budget), trend: rad.dygn ? trendFor(rad.dygn, plusDagar(idag, -1)) : null, marknad,
  };
  const traffar = minne.monster.filter((m) => m.beslut === beslut && Object.entries(m.villkor).every(([k, v]) => drag[k] === v));
  if (!traffar.length) return null;
  return { beslut, drag, monster: traffar.slice(0, 2).map((m) => m.id), text: `Mönster: ${traffar.slice(0, 2).map(monsterText).join(' · ')}` };
}

/** Rapportens avsnitt, svenska. */
export function monsterRapport(minne) {
  if (!minne) return [];
  const ut = ['## 🧠 Mönsterminnet — var motorn brukar gissa fel och rätt', ''];
  ut.push(`Varje budgetbeslut är en gissning om de närmaste dygnen. Gissningen rättas mot det som faktiskt hände dygn 1–3 efter. Ett mönster listas först när det gäller minst ${MIN_FALL} beslut på ${MIN_KAMPANJER} olika kampanjer och skiljer sig säkert från det vanliga. Äldre beslut väger mindre (halva vikten efter ${HALVERINGSTID} dygn), så ett mönster som slutar stämma försvinner av sig självt. Mönstren är varningar, aldrig förbud: motorn ändras bara när Axel säger ja.`, '');
  for (const [k, b] of Object.entries(minne.beslut ?? {})) ut.push(`- ${BESLUT[k].namn[0].toUpperCase()}${BESLUT[k].namn.slice(1)} (${BESLUT[k].tro}): rätt ${b.ratt} av ${b.ratt + b.fel} gånger${b.oklara ? `, ${b.oklara} oklara` : ''}.`);
  ut.push('');
  const sl = minne.slump ?? {};
  for (const [typ, rubrik] of [['miss', 'Återkommande missar'], ['nyligen_samre', 'Brukar fungera men gick fel de senaste gångerna'], ['styrka', 'Här har motorn oftast rätt']]) {
    const m = (minne.monster ?? []).filter((x) => x.typ === typ).slice(0, 8);
    ut.push(`### ${rubrik} (${m.length})`, '');
    if (Number.isFinite(sl[typ])) ut.push(`Av ren slump dyker i snitt ${String(sl[typ]).replace('.', ',')} sådana upp (utfallen omblandade 100 gånger).${typ === 'nyligen_samre' ? ' Den här listan är mest brus — läs den som "håll ögonen på", inte som ett fel.' : ''}`, '');
    if (!m.length) ut.push('Inga än.');
    for (const x of m) ut.push(`- **${x.id}** ${monsterText(x)} (${x.kampanjer} kampanjer, listat sedan ${x.forst_listad})`);
    ut.push('');
  }
  return ut;
}

/** En rad till rondens leverans. */
export function monsterStatus(minne) {
  if (!minne) return null;
  const n = (t) => (minne.monster ?? []).filter((m) => m.typ === t).length;
  const topp = (minne.monster ?? []).find((m) => m.typ === 'miss');
  const sl = minne.slump ?? {};
  const slump = Number.isFinite(sl.miss) ? ` (av ren slump ${String(sl.miss).replace('.', ',')})` : '';
  return `Mönsterminnet: ${n('miss')} återkommande missar${slump}, ${n('styrka')} styrkor, ${n('nyligen_samre')} som gick fel nyligen.${topp ? ` Störst: ${monsterText(topp)}` : ''}`;
}

/**
 * Slumpnivån: blanda om utfallen inom varje beslut och räkna hur många mönster
 * som dyker upp ändå. Mätt 2026-09-30 (200 omblandningar): i snitt 0,6 falska
 * missar, 0,2 falska styrkor och 1,7 falska "gick fel nyligen". Står i
 * rapporten bredvid dagens antal, så att ingen läser brus som ett mönster.
 */
export function slumpniva(alla, { idag, omblandningar = 100 } = {}) {
  const rader = (alla ?? []).filter((r) => r.version === GISSNING_VERSION);
  let a = 20260930;
  const r = () => { a = (Math.imul(a, 1664525) + 1013904223) >>> 0; return a / 4294967296; };
  const summa = { miss: 0, styrka: 0, nyligen_samre: 0 };
  for (let i = 0; i < omblandningar; i++) {
    const blandad = [];
    for (const b of Object.keys(BESLUT)) {
      const egna = rader.filter((x) => x.beslut === b);
      const u = egna.map((x) => x.utfall);
      for (let j = u.length - 1; j > 0; j--) { const k = Math.floor(r() * (j + 1)); [u[j], u[k]] = [u[k], u[j]]; }
      egna.forEach((x, j) => blandad.push({ ...x, utfall: u[j] }));
    }
    for (const m of monster(blandad, { idag }).monster) summa[m.typ] += 1;
  }
  return Object.fromEntries(Object.entries(summa).map(([k, v]) => [k, Math.round((v / omblandningar) * 10) / 10]));
}
