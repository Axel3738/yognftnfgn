// ugc.mjs — UGC-förslaget: villkoren, beställningen till Lovely, deadlinerna.
//
// Axels definition av klart, docs/os/CS-KLART.md punkt 20–22 (2026-09-21):
//  20. Rutinen får föreslå en UGC-video bara när ALLA tre villkor är sanna:
//      (1) produkten har en bevisad vinnare (BREAKTHROUGH eller SPEND_WINNER,
//      bedömbar), (2) produkten kommer med stor sannolikhet fortfarande
//      skalas om fyra veckor, (3) det som saknas är tro, auktoritet eller
//      tillit — det en redigerare med lagerfilm inte kan skapa. Kostnaden
//      (~3 000 kr) är sällan hindret; tiden är det: minst tre veckor från
//      beställning till färdig fil.
//  21. Förslaget är ett färdigt beställningsmeddelande till Lovely: produkt,
//      vinnaren vi bygger på, komponenterna kreatören ska träffa (avatar,
//      vinkel, mekanism, tro, brådska), manuset, vad som måste synas på
//      kameran, deadline. Flera videor ⇒ Evolve-receptet: en ordagrann kopia
//      av vinnaren, en iteration, en imitation av en viral annons.
//  22. Ledtiden räknas baklänges från säsong: Black Friday 2026-11-27 ⇒ sista
//      beställningsdag 2026-10-23 (två veckors test + tre veckors ledtid),
//      efter 2026-11-06 hinner videon inte bli live. Rutinen larmar när en
//      deadline närmar sig och inget är beställt.
//
//   node agent/ugc.mjs --kandidater [--idag YYYY-MM-DD] [--json]
//       villkor 1–3 per kampanj ur budgetloggen (etiketter, lärdomar,
//       budgetrader). Villkor 2 är en BEDÖMNING ur loggen (inte avstängd, inte
//       sänkt på 14 dagar, skalad eller lönsam), aldrig en garanti — sessionen
//       läser skälen. Villkor 3 läses ur lärdomen (komponentavvikelse tro,
//       eller hypotes/nästa som nämner tro/auktoritet/tillit).
//   node agent/ugc.mjs --deadlines [--idag YYYY-MM-DD] [--json]
//       säsongstopparna med sista beställningsdag och "för sent"-dag, och
//       larmet när ≤ 14 dagar återstår och inget UGC_BESTALLD finns.
//   node agent/ugc.mjs --bestallning <fil.json>
//       det färdiga meddelandet (engelska — Lovely läser engelska) ur en JSON
//       med alla fält; saknas ett fält vägrar skriptet.
//   node agent/ugc.mjs --forslag --kampanj <id> --annons <namn> [--idag]
//       loggar UGC_FORSLAG så samma förslag inte upprepas varje morgon.
//   node agent/ugc.mjs --bestalld --kampanj <id> --antal N --deadline YYYY-MM-DD [--idag]
//       loggar UGC_BESTALLD när beställningen gått till Lovely (larmet tystnar).
//
// Ingen rad här bär ny_budget. Ren logik testas i agent/test/ugc.test.mjs.

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { lasLogg, skrivRad } from './logg.mjs';
import { ETIKETT, ETIKETTKODER, dagarMellan } from './etikett.mjs';
import { lardomar, lasProduktkarta } from './lardom.mjs';

export const UGC_FORSLAG = 'UGC_FORSLAG';
export const UGC_BESTALLD = 'UGC_BESTALLD';
/** Tre veckor från beställning till färdig fil (punkt 20). */
export const LEDTID_DAGAR = 21;
/** Två veckors test före toppen (punkt 22). */
export const TESTTID_DAGAR = 14;
/** Larma så här många dagar före sista beställningsdag. */
export const LARM_DAGAR = 14;
/** En vinnare räknas som bevisad så här länge efter etiketten. */
export const VINNARE_DAGAR = 42;
/** Ett förslag upprepas inte inom så här många dagar. */
export const FORSLAG_TYST_DAGAR = 14;
/** Ungefärlig kostnad — sällan hindret (Axel: ~fyra sålda taköverdrag i täckningsbidrag). */
export const KOSTNAD_SEK = 3000;

/** Säsongstopparna. Toppen är dagen annonsen ska vara live med två veckors test bakom sig. Axel lägger till fler. */
export const SASONGER = Object.freeze([
  { namn: 'Black Friday 2026', topp: '2026-11-27', kalla: 'Axel 2026-09-21' },
  { namn: 'Jul 2026', topp: '2026-12-18', kalla: 'sista dag med leverans före julafton — ANTAGANDE, Axel bekräftar datumet' },
]);

const num = (x) => { if (x === null || x === undefined || x === '') return null; const n = Number(String(x).replace(/\s/g, '').replace(',', '.')); return Number.isFinite(n) ? n : null; };

export function datumPlus(iso, dagar) {
  const t = Date.parse(`${iso}T00:00:00Z`);
  return Number.isFinite(t) ? new Date(t + dagar * 86400000).toISOString().slice(0, 10) : null;
}

/** Deadlinerna för en topp: sista beställningsdag = topp − test − ledtid; för sent = topp − ledtid. */
export function deadlineFor(topp) {
  return { sista_bestallning: datumPlus(topp, -(TESTTID_DAGAR + LEDTID_DAGAR)), for_sent_efter: datumPlus(topp, -LEDTID_DAGAR) };
}

/**
 * Säsongsläget i dag (punkt 22): per topp — dagar kvar till sista
 * beställningsdag, om det redan är för sent, om något är beställt sedan
 * larmfönstret öppnade, och larmet. Ren.
 */
export function deadlines(logg, { idag, sasonger = SASONGER }) {
  const bestallda = logg.filter((r) => r.kod === UGC_BESTALLD && r.genomford === true);
  return sasonger.map((s) => {
    const d = deadlineFor(s.topp);
    const kvar = dagarMellan(idag, d.sista_bestallning);
    const forSent = String(idag) > d.for_sent_efter;
    const larmFran = datumPlus(d.sista_bestallning, -LARM_DAGAR);
    const bestalltForToppen = bestallda.filter((r) => String(r.datum) >= larmFran && String(r.datum) <= d.for_sent_efter && (!r.sasong || r.sasong === s.namn));
    const iFonster = String(idag) >= larmFran && !forSent;
    const larm = iFonster && bestalltForToppen.length === 0;
    let lage;
    if (forSent) lage = `för sent — efter ${d.for_sent_efter} hinner en UGC-video inte bli live till ${s.namn}`;
    else if (kvar !== null && kvar < 0) lage = `sista beställningsdagen passerad (${d.sista_bestallning}) — beställs den nu hinner den bli live men inte testas två veckor`;
    else lage = `${kvar} dagar kvar till sista beställningsdag ${d.sista_bestallning}`;
    return { ...s, ...d, dagar_kvar: kvar, for_sent: forSent, larm, bestallda: bestalltForToppen.length, lage };
  });
}

export function formateraDeadlines(lista) {
  const ut = ['UGC-deadlines (punkt 22 — tre veckors ledtid + två veckors test):'];
  for (const s of lista) ut.push(`  ${s.larm ? '🔴 LARM: ' : ''}${s.namn} (${s.topp}): ${s.lage}${s.bestallda ? ` — ${s.bestallda} beställning(ar) loggade` : s.larm ? ' — inget beställt' : ''}${/ANTAGANDE/.test(s.kalla ?? '') ? ' ⚠ datumet är ett antagande' : ''}`);
  return ut.join('\n');
}

/** Senaste etikettraden per annons i en kampanj. */
function etiketterFor(logg, kampanjId) {
  const ut = new Map();
  for (const r of logg) {
    if (!ETIKETTKODER.includes(r.kod) || String(r.kampanj_id) !== String(kampanjId)) continue;
    const t = ut.get(String(r.annons_id));
    if (!t || String(r.datum) >= String(t.datum)) ut.set(String(r.annons_id), r);
  }
  return ut;
}

/** Villkor 1: bevisade vinnare — BREAKTHROUGH eller SPEND_WINNER, bedömbar, etikett inom VINNARE_DAGAR, inte tjuvpausad. */
export function bevisadeVinnare(logg, kampanjId, { idag }) {
  const pausade = new Set(logg.filter((r) => r.kod === 'TJUV_PAUSAD' && r.genomford === true).map((r) => String(r.annons_id)));
  const ut = [];
  for (const e of etiketterFor(logg, kampanjId).values()) {
    if (![ETIKETT.BREAKTHROUGH, ETIKETT.SPEND_WINNER].includes(e.etikett) || !e.bedombar) continue;
    if (pausade.has(String(e.annons_id))) continue;
    const alder = dagarMellan(e.datum, idag);
    if (alder === null || alder > VINNARE_DAGAR) continue;
    ut.push(e);
  }
  return ut.sort((a, b) => (b.spend_ad ?? 0) - (a.spend_ad ?? 0));
}

/**
 * Villkor 2 — en BEDÖMNING ur loggen och dagens rad, aldrig en garanti:
 * inte avstängd, ingen sänkning/trappa på 14 dagar, och antingen skalad på
 * 28 dagar eller lönsam (≥ 20 % vinst) med budget ≥ 1 000 kr, och ingen
 * säsong som tar slut inom sex veckor (produktkartans `sasong_slut`).
 */
export function skalasOmFyraVeckor(logg, kampanjId, { idag, rad = null, karta = null }) {
  const skal = [];
  const egna = logg.filter((r) => String(r.kampanj_id) === String(kampanjId) && r.genomford === true);
  const inom = (r, dagar) => { const d = dagarMellan(r.datum, idag); return d !== null && d >= 0 && d <= dagar; };
  const senasteLiv = egna.filter((r) => ['STANG_AV', 'ATERAKTIVERA'].includes(r.kod)).sort((a, b) => (String(a.datum) < String(b.datum) ? -1 : 1)).at(-1);
  if (senasteLiv?.kod === 'STANG_AV') return { sannolikt: false, skal: ['kampanjen är avstängd'] };
  // Trappan på 14 dagar säger nej. En enstaka sänkning gör det bara om den är
  // den SENASTE budgetändringen — en kampanj som sänkts en gång och sedan
  // skalats sju gånger (IBC 2026-09-21) skalas, den sänks inte.
  const trappa = egna.filter((r) => ['ATGARDSTRAPPAN', 'TRAPPA_FORLANGNING'].includes(r.kod) && inom(r, 14));
  const andringar = egna.filter((r) => ['SKALA', 'SANK', 'HALVERA', 'MANUELL_SANK'].includes(r.kod) && inom(r, 14)).sort((a, b) => (String(a.datum) < String(b.datum) ? -1 : 1));
  const senasteAndring = andringar.at(-1) ?? null;
  const sankt = [...trappa, ...(senasteAndring && senasteAndring.kod !== 'SKALA' ? [senasteAndring] : [])];
  if (sankt.length) skal.push(`${trappa.length ? 'trappa' : 'senaste budgetändringen är en sänkning'} senaste 14 dagarna (${[...new Set(sankt.map((r) => r.kod))].join(', ')})`);
  const skalad = egna.filter((r) => r.kod === 'SKALA' && inom(r, 28)).length;
  const vinst = num(rad?.dom?.vinstProcent);
  const budget = num(rad?.budget);
  const lonsam = vinst !== null && vinst >= 20 && budget !== null && budget >= 1000;
  if (skalad) skal.push(`skalad ${skalad} gång(er) på 28 dagar`);
  if (lonsam) skal.push(`${vinst.toFixed(0)} % vinst på ${Math.round(budget)} kr/dag`);
  if (!skalad && !lonsam) skal.push(rad ? `varken skalad på 28 dagar eller lönsam ≥ 20 % med budget ≥ 1 000 kr (vinst ${vinst ?? 'okänd'} %, budget ${budget ?? 'okänd'})` : 'ingen dagsrad — vinst och budget okända');
  const slut = karta?.sasong_slut ?? null;
  const sasongKort = slut && dagarMellan(idag, slut) !== null && dagarMellan(idag, slut) < 42;
  if (sasongKort) skal.push(`säsongen slutar ${slut} — under sex veckor bort`);
  const sannolikt = !sankt.length && (skalad > 0 || lonsam) && !sasongKort;
  return { sannolikt, skal };
}

const TRO_RE = /\b(tro|tron|auktoritet|tillit|trust|belief|believe|authority|credib|trovärd|förtroende|litar)\w*/i;
/** En brist, inte bara ordet: "litar inte", "saknar tillit", "brist på auktoritet". "utan" räknas inte ("trovärdigt utan pris" är motsatsen). */
const BRIST_RE = /\b(saknas|saknar|brist|fattas|inte|ingen|inget|otillräcklig|lacks?|missing|no\b)/i;
const UGC_RE = /\b(ugc|kreatör|creator|riktigt ansikte|riktig person|real person|real face)/i;

/**
 * Villkor 3: det som saknas är tro/auktoritet/tillit — läst ur lärdomen.
 * Ja när komponenten tro avvek, eller när en mening i hypotesen/nästa
 * annonser nämner tro/tillit/auktoritet SOM EN BRIST (eller pekar på UGC).
 * "gör demot trovärdigt" är inte en brist. Utan lärdom: okänd.
 */
export function saknasTro(logg, annonsId) {
  const l = lardomar(logg).get(String(annonsId));
  if (!l) return { ja: null, skal: 'ingen lärdom skriven — skriv den först (node agent/lardom.mjs --skelett)', lardom: null };
  const avvikelse = (l.komponent_avvikelser ?? []).some((k) => /^tro$/i.test(k));
  const meningar = `${l.hypotes ?? ''}\n${(l.nasta ?? []).join('\n')}`.split(/[.;!?\n]/);
  const traff = meningar.find((m) => (TRO_RE.test(m) && BRIST_RE.test(m)) || UGC_RE.test(m));
  if (avvikelse) return { ja: true, skal: 'lärdomen: komponenten tro avvek från briefen', lardom: l.lardom_id, nasta: l.nasta ?? [] };
  if (traff) return { ja: true, skal: `lärdomen: "${traff.trim().slice(0, 90)}"`, lardom: l.lardom_id, nasta: l.nasta ?? [] };
  return { ja: false, skal: 'lärdomen pekar inte på en brist i tro/auktoritet/tillit — det som saknas går att lösa med befintligt material', lardom: l.lardom_id, nasta: l.nasta ?? [] };
}

/**
 * Kandidaterna (punkt 20): per kampanj med bevisad vinnare — de tre villkoren
 * och om förslaget ska ställas. `rader` = dagens kampanjrader ur ronden (för
 * vinst/budget), `karta` = produktkartan {campaign_id: post}.
 */
export function kandidater(logg, { idag, rader = [], karta = {}, alla = false }) {
  const kampanjer = [...new Set(logg.filter((r) => ETIKETTKODER.includes(r.kod)).map((r) => String(r.kampanj_id)))];
  const ut = [];
  for (const k of kampanjer) {
    const vinnare = bevisadeVinnare(logg, k, { idag });
    if (!vinnare.length) continue;
    const rad = rader.find((r) => String(r.id) === k) ?? null;
    const v2 = skalasOmFyraVeckor(logg, k, { idag, rad, karta: karta[k] ?? null });
    const topp = vinnare[0];
    const v3 = saknasTro(logg, topp.annons_id);
    const nyligen = logg.find((r) => r.kod === UGC_FORSLAG && String(r.kampanj_id) === k && dagarMellan(r.datum, idag) !== null && dagarMellan(r.datum, idag) < FORSLAG_TYST_DAGAR);
    const bestalld = logg.find((r) => r.kod === UGC_BESTALLD && String(r.kampanj_id) === k && r.genomford === true && dagarMellan(r.datum, idag) !== null && dagarMellan(r.datum, idag) < 60);
    const forslag = v2.sannolikt && v3.ja === true && !bestalld && (alla || !nyligen);
    ut.push({
      kampanj_id: k, kampanj_namn: topp.kampanj_namn, vinnare: vinnare.map((v) => ({ annons_id: v.annons_id, annons_namn: v.annons_namn, etikett: v.etikett, spend_ad: v.spend_ad, roas_ad: v.roas_ad, andel: v.andel, hook_text: v.hook_text, datum: v.datum })),
      villkor: { vinnare: true, skalas_om_fyra_veckor: v2, saknas_tro: v3 },
      forslag, tystat: !forslag && v2.sannolikt && v3.ja === true ? (bestalld ? `redan beställd ${bestalld.datum}` : nyligen ? `föreslagen ${nyligen.datum}, tyst i ${FORSLAG_TYST_DAGAR} dagar` : null) : null,
    });
  }
  return ut.sort((a, b) => Number(b.forslag) - Number(a.forslag) || (b.vinnare[0].spend_ad ?? 0) - (a.vinnare[0].spend_ad ?? 0));
}

export function formateraKandidater(lista, { idag }) {
  if (!lista.length) return 'UGC-kandidater: ingen kampanj har en bevisad vinnare (BREAKTHROUGH/SPEND_WINNER, bedömbar, inom 42 dagar).';
  const ut = [`UGC-kandidater ${idag} (punkt 20 — alla tre villkor måste vara sanna):`];
  for (const k of lista) {
    const namn = String(k.kampanj_namn).split('|')[0].trim();
    const v = k.vinnare[0];
    ut.push(`  ${k.forslag ? '✅ FÖRESLÅ' : k.tystat ? '⏸ ' : '❌'} ${namn} — vinnare ${v.annons_namn} (${v.etikett}, ${Math.round(v.spend_ad ?? 0)} kr, ROAS ${v.roas_ad ?? '?'})`);
    ut.push(`      1 bevisad vinnare: ja`);
    ut.push(`      2 skalas om fyra veckor: ${k.villkor.skalas_om_fyra_veckor.sannolikt ? 'sannolikt' : 'NEJ'} (bedömning: ${k.villkor.skalas_om_fyra_veckor.skal.join('; ')})`);
    ut.push(`      3 saknas tro/auktoritet/tillit: ${k.villkor.saknas_tro.ja === null ? 'OKÄND' : k.villkor.saknas_tro.ja ? 'ja' : 'NEJ'} (${k.villkor.saknas_tro.skal})`);
    if (k.tystat) ut.push(`      ${k.tystat}`);
    if (k.forslag) ut.push(`      → skriv beställningen: node agent/ugc.mjs --bestallning <fil.json> (mall i skriptets huvud), posta i --kanal uppgifter, logga --forslag`);
  }
  return ut.join('\n');
}

/** Fälten beställningen måste bära (punkt 21). */
export const BESTALLNING_FALT = Object.freeze(['produkt', 'kampanj_id', 'vinnare', 'komponenter', 'manus', 'pa_kameran', 'deadline']);
const KOMPONENT_FALT = ['avatar', 'vinkel', 'mekanism', 'tro', 'urgency'];

/** Validerar beställnings-JSON:en. Ren. */
export function validateBestallning(b) {
  const fel = [];
  for (const f of BESTALLNING_FALT) if (b?.[f] === undefined || b[f] === null || b[f] === '' || (Array.isArray(b[f]) && !b[f].length)) fel.push(`fältet "${f}" saknas`);
  if (b?.vinnare && !b.vinnare.namn) fel.push('vinnare.namn saknas (annonsen vi bygger på)');
  for (const k of KOMPONENT_FALT) if (!b?.komponenter?.[k]) fel.push(`komponenter.${k} saknas`);
  if (Array.isArray(b?.manus)) for (const [i, r] of b.manus.entries()) if (!r?.sv || !r?.en) fel.push(`manus[${i}] behöver sv och en`);
  if (b?.deadline && !/^\d{4}-\d{2}-\d{2}$/.test(String(b.deadline))) fel.push('deadline ska vara YYYY-MM-DD');
  const antal = Number(b?.antal ?? 1);
  if (antal > 1) {
    if (!b?.iteration_andring) fel.push('antal > 1: iteration_andring saknas (vad iterationen ändrar mot vinnaren)');
    if (antal > 2 && !b?.viral_referens) fel.push('antal > 2: viral_referens saknas (vilken viral annons imitationen bygger på)');
  }
  return fel;
}

/** Det färdiga meddelandet till Lovely — engelska. Ren. */
export function bestallning(b, { idag }) {
  const fel = validateBestallning(b);
  if (fel.length) throw new Error(`beställningen är inte komplett: ${fel.join('; ')}`);
  const antal = Number(b.antal ?? 1);
  const k = b.komponenter;
  const v = b.vinnare;
  const ut = [];
  ut.push(`**UGC order — ${b.produkt}** (ordered ${idag}, deadline for the finished file: ${b.deadline}${b.sasong ? ` — needed for ${b.sasong}` : ''})`);
  ut.push('');
  ut.push(`**Build on our winning ad:** ${v.namn}${v.etikett ? ` (${v.etikett}` : ''}${v.spend ? `, ${v.spend} SEK spend` : ''}${v.roas ? `, ROAS ${v.roas}` : ''}${v.etikett ? ')' : ''}${v.lank ? ` — ${v.lank}` : ''}`);
  if (v.hook) ut.push(`Its hook, word for word: "${v.hook}"`);
  ut.push('');
  ut.push('**The creator must hit these components** (from our brief and the learning behind the winner):');
  ut.push(`- Avatar (who is speaking, as whom): ${k.avatar}`);
  ut.push(`- Angle: ${k.vinkel}`);
  ut.push(`- Mechanism (how the ad makes the desire land on the product): ${k.mekanism}`);
  ut.push(`- Belief the viewer must end up with: ${k.tro}`);
  ut.push(`- Urgency: ${k.urgency}`);
  if (k.awareness) ut.push(`- Awareness level: ${k.awareness}`);
  ut.push('');
  ut.push('**Script — Swedish lines word for word (English meaning for you):**');
  ut.push('| # | Swedish (say this) | English meaning |');
  ut.push('|---|---|---|');
  b.manus.forEach((r, i) => ut.push(`| ${i + 1} | ${r.sv} | ${r.en} |`));
  ut.push('');
  ut.push('**Must be on camera:**');
  for (const p of b.pa_kameran) ut.push(`- ${p}`);
  ut.push('');
  ut.push(`**Deliverable:** ${antal} video${antal > 1 ? 's' : ''}, 9:16 vertical, raw + clean cut, no music, no burned-in text (our editor adds captions), product in frame before second 4, never name the store.`);
  if (antal > 1) {
    ut.push('');
    ut.push('**Recipe for the set (Evolve):**');
    ut.push(`1. Copy of the winner — the script above word for word.`);
    ut.push(`2. Iteration on it — ${b.iteration_andring}`);
    if (antal > 2) ut.push(`3. Imitation of a viral ad — ${b.viral_referens}`);
  }
  ut.push('');
  ut.push(`**Timeline:** order today ${idag} → product shipped to the creator → filming → one revision round → file by ${b.deadline}. Three weeks is the minimum; tell us on day one if the creator cannot make it.`);
  if (b.leverans_adress) ut.push(`Ship the product to: ${b.leverans_adress}`);
  if (b.budget_sek) ut.push(`Budget: ${b.budget_sek} SEK.`);
  return ut.join('\n');
}

async function huvud(argv) {
  const flagga = (n, s = null) => { const i = argv.indexOf(`--${n}`); return i !== -1 && argv[i + 1] !== undefined && !argv[i + 1].startsWith('--') ? argv[i + 1] : s; };
  const finns = (n) => argv.includes(`--${n}`);
  const idag = flagga('idag') ?? new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Stockholm' }).format(new Date());
  const logg = await lasLogg();

  if (finns('deadlines')) {
    const d = deadlines(logg, { idag });
    console.log(finns('json') ? JSON.stringify(d, null, 2) : formateraDeadlines(d));
    process.exitCode = d.some((s) => s.larm) ? 3 : 0;
    return;
  }
  if (finns('kandidater')) {
    const karta = lasProduktkarta();
    let rader = [];
    const utfall = flagga('utfall');
    if (utfall) { try { const u = JSON.parse(readFileSync(resolve(utfall), 'utf8')); rader = u.rader ?? u.kampanjer ?? []; } catch (e) { console.error(`⚠ kunde inte läsa --utfall: ${e.message}`); } }
    const k = kandidater(logg, { idag, rader, karta, alla: finns('alla') });
    console.log(finns('json') ? JSON.stringify(k, null, 2) : formateraKandidater(k, { idag }));
    return;
  }
  if (flagga('bestallning')) {
    const b = JSON.parse(readFileSync(resolve(flagga('bestallning')), 'utf8'));
    console.log(bestallning(b, { idag }));
    return;
  }
  if (finns('forslag') || finns('bestalld')) {
    const kampanjId = flagga('kampanj');
    if (!kampanjId) { console.error('✗ --kampanj <id> krävs'); process.exit(1); }
    const karta = lasProduktkarta();
    const k = karta[String(kampanjId)] ?? {};
    const rad = {
      datum: idag, kampanj_id: String(kampanjId), kampanj_namn: k.produkt ?? '', ad_account_id: k.ad_account_id ?? '1867947880635861',
      kod: finns('bestalld') ? UGC_BESTALLD : UGC_FORSLAG, annons_namn: flagga('annons') ?? null, antal: Number(flagga('antal') ?? 1), deadline: flagga('deadline') ?? null, sasong: flagga('sasong') ?? null,
      genomford: true, godkand_av: finns('bestalld') ? 'Axel/VA — beställning skickad till Lovely' : 'auto — UGC-förslag (CS-KLART punkt 20)',
    };
    if (finns('bestalld') && !rad.deadline) { console.error('✗ --deadline YYYY-MM-DD krävs för en beställning'); process.exit(1); }
    await skrivRad(rad);
    console.log(`${rad.kod} loggad för ${rad.kampanj_namn || kampanjId}.`);
    return;
  }
  console.error('Användning: node agent/ugc.mjs --kandidater [--utfall <rond-utfall.json>] [--alla] | --deadlines | --bestallning <fil.json> | --forslag --kampanj <id> --annons <namn> | --bestalld --kampanj <id> --antal N --deadline YYYY-MM-DD');
  process.exit(2);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  await huvud(process.argv.slice(2));
}
