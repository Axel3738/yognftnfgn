// Beslutsmotorn för /rond. Ren räkning — inga API-anrop, ingen I/O, inget Claude.
// Allt som avgör om en budget höjs, sänks eller lämnas ifred bor HÄR, i kod,
// så att svaret blir detsamma varje gång och går att testa.
//
// Reglerna kommer från Bäverpanelen (Axels driftpanel) plus de grindar som
// docs/os/ANALYSMETOD.md och CLAUDE.md regel 3-4 kräver.
//
// ⚠️ TVÅ BESLUT, TVÅ MÅTT (Axels beslut 2026-09-22, ur Evolve):
//   • SKALNING mäts mot TARGET-ROAS (`rad.targetRoas`). Motorn läser talet
//     ur `target_roas` på kampanjens post i agent/produktkarta.json — det är
//     den enda filen rond.mjs läser; products/products.json:s `target_roas`
//     är ägarens lista för Bäverbutikens sex produkter och speglas in i
//     kartan för hand. Saknas talet härleds det ur break-even och
//     skalningszonen, se `targetRoas()`.
//   • KILL mäts mot BREAK-EVEN (CLAUDE.md regel 4, orörd): förlust,
//     åtgärdstrappan, avstängning och halvering räknar alla på break-even.
//   Blanda dem aldrig: en kampanj under target men över break-even lämnas
//   ifred — den går plus, den skalas bara inte.

export const GOLV_SEK = 500;

// Inget tak (Axels beslut 2026-09-22, ur Evolve: "Never by spend" — spendnivå,
// frekvens och marknadsstorlek är alla förkastade som tak; ett svenskt
// varumärke gör 100k-dagar). Både det gamla TAK_SEK 10 000 och idén om
// "10 % över 15 000" är kastade. Det som gäller hela vägen upp, utan slut, är
// högzonens tre spärrar (alla tre Axels formulering 2026-09-21):
//   1. över TAK_UTAN_VINNARE måste produkten ha en etiketterad BREAKTHROUGH
//      eller SPEND_WINNER inom VINNARE_DAGAR (`rad.harVinnare`, räknas av
//      anroparen ur budgetloggen — den här filen gör aldrig I/O),
//   2. steget är max 20 % per rond (trappans ×1,5/×2 gäller inte i högzonen),
//   3. förlust kapar aldrig — två förlustmorgnar i rad ger −20 %, en ensam
//      förlustmorgon ger ingen ändring alls.
export const TAK_UTAN_VINNARE = 4000;
export const VINNARE_DAGAR = 28;
export const HOGZON_BACK_DAGAR = 2;
export const HOGZON_MAX_FAKTOR = 1.2;
export const STEG_SEK = 50;

// Grindar innan någon dom alls får fällas (CLAUDE.md regel 3).
export const MIN_SPEND_FOR_DOM = 300;
export const MIN_KOP_FOR_DOM = 3;

// Testprodukt får ligga ifred tills den passerat den här spenden (Bäverpanelen, regel 3).
export const TEST_TROSKEL_SEK = 1500;

// Meta ska hinna lära sig mellan ändringar (Bäverpanelen, regel 1).
export const MIN_DAGAR_MELLAN_ANDRINGAR = 3;

// Snabbspåret (Axels beslut 2026-08-29): en produkt i skalningszonen med
// ROAS ≥ 3 får höjas tätare än var tredje dag. Gäller BARA höjningar —
// sänkningar väntar alltid sina tre dagar, eftersom färska minus-siffror
// revideras uppåt i efterhand. Avstängning av en testprodukt som går back
// väntar däremot ALDRIG (Axel 2026-09-02).
// 1 dag = 24 timmar (Axels beslut 2026-09-22, "24", på frågan om 48 h).
// "48–72 timmar konsekvent" bärs i stället av konsekvent-spärren
// (KONSEKVENT_DAGAR: två dygn i rad över target innan en höjning) — det är
// den som hindrar 1 000 → 2 000 → 4 000 på ett dygn mellan stegen, inte kadensen.
export const SNABB_SKALNING_ROAS = 3.0;
export const SNABB_MIN_DAGAR = 1;

// Stegtrappan (Axels beslut 2026-09-22, ur kursen): steget går på AVSTÅNDET
// TILL TARGET, inte till break-even. 100 % över target → dubbla, 50 % över →
// ×1,5, annars 20 %. Raketspåret (ROAS ≥ 5 → ×1,8, Axel 2026-08-30) är
// ersatt av trappan: ×2 är "dubbla", inte "nästan dubbla".
export const TRAPPA = Object.freeze([
  { over: 2.0, faktor: 2.0, namn: 'dubbla' },
  { over: 1.5, faktor: 1.5, namn: '×1,5' },
  { over: 1.0, faktor: 1.2, namn: '20 %' },
]);

// "Alltid efter 48–72 timmar konsekvent": dags-ROAS ska ha legat på eller
// över target så här många hela dygn i rad innan trappan tar ett steg.
// Räknas av anroparen ur dygnsserien (`dagarOverTarget`); null = serien
// saknas, då avgör 3-dagarsfönstret ensamt (gamla filer ska gå att läsa).
export const KONSEKVENT_DAGAR = 2;

// Drift på golvet som går back så här många dygn i rad stängs av (Bäverpanelen, regel 3b).
export const BACK_DAGAR_FOR_AVSTANGNING = 7;

// Livstidsspärrens tak. En kampanj som tjänat pengar över hela sin livstid får
// ligga kvar på golvet så här många back-dygn i rad — sen gäller trappan igen,
// hur bra livstiden än ser ut. Axels invändning 2026-09-04: "så ska vi inte
// tänka för då torskar vi allt till slut". Max exponering: 5 × 500 kr, och i
// praktiken mindre, eftersom livstiden själv faller under break-even först.
export const LIVSTIDS_MAX_BACKDAGAR = 5;

// Zongränser i procent vinst av omsättningen (Bäverpanelen, regel 4).
// ZON_SKALA_OVER är också det härledda target-ROAS:et när produkten saknar
// ett eget: 25 % vinst av omsättningen.
export const ZON_SANK_UNDER = 16;
export const ZON_SKALA_OVER = 25;

// Så nära en zongräns är beslutet inte att lita på: ROAS för de senaste dygnen
// revideras uppåt i efterhand när köp attribueras (7 dagars klickfönster).
// products/axelbaltet/batch-log.md har ett fall där en för tidig avläsning var
// 3,08x fel. Inom den här marginalen flaggas raden i stället för att bara köras.
export const NARA_GRANS_PP = 3;

// Klickandelen (Axels beslut 2026-09-22, "Compare Attribution Settings"):
// minst så här stor andel av köpen ska vara klickbaserade innan en höjning.
// Är merparten visningsköp väntar motorn ett dygn. Räknas av anroparen ur
// dygnsserien (`rad.klickandel`); null = visningstal saknas, ingen spärr.
export const KLICK_MIN_ANDEL = 0.6;

// Surf-läget (Axels beslut 2026-09-22, för peak/Black Friday). Slås ALDRIG på
// av motorn själv — Axel startar det (agent/surf.json + --surf). Kadensen är
// var sjätte timme: dubbla när fönstret är bra, håll eller sänk när det är
// dåligt, och nollställ budgeten till ungefär halva gårdagens faktiska spend
// vid annonskontots midnatt.
export const SURF_RESET_ANDEL = 0.5;
export const SURF_DUBBLA_FAKTOR = 2.0;

/**
 * Plockar break-even-ROAS ur kampanjnamnet.
 *
 * Två skrivsätt finns i skarp drift och båda måste läsas:
 *   SE: "Produkten | BE ROAS 1.49 | Launch 2026-08-27"   (mellanslag, punkt)
 *   NO: "Kranbeskyttelse Frost NO | BE-ROAS 1,63 | ..."  (bindestreck, komma)
 * Läser parsern bara det svenska får varje norsk kampanj "saknas i
 * kampanjnamnet" och ronden vägrar döma en hel marknad.
 *
 * "TBC" betyder att talet inte är satt ännu — då får ingen dom fällas.
 * @returns {{be: number|null, kalla: string}}
 */
export function lasBreakEven(kampanjnamn) {
  const namn = String(kampanjnamn || '');
  if (/BE[\s-]*ROAS[\s-]*TBC/i.test(namn)) {
    return { be: null, kalla: 'kampanjnamnet säger TBC' };
  }
  const träff = namn.match(/BE[\s-]*ROAS[\s-]*([0-9]+[.,][0-9]+|[0-9]+)/i);
  if (!träff) return { be: null, kalla: 'saknas i kampanjnamnet' };
  const be = Number(träff[1].replace(',', '.'));
  // Kontots verkliga break-even ligger 1,3-2,0. Under 1 är matematiskt omöjligt,
  // över 10 är ett typo ("BE ROAS 149") — båda ska ge "ingen dom", inte en dom.
  if (!Number.isFinite(be) || be <= 1 || be > 10) {
    return { be: null, kalla: `orimligt tal i kampanjnamnet (${träff[1]})` };
  }
  return { be, kalla: 'kampanjnamnet' };
}

/**
 * Meta returnerar belopp som formaterad text: "1 000,00 kr (SEK)" med hårt
 * mellanslag. Plockar ut talet. Returnerar null när fältet saknas helt —
 * aldrig 0, för 0 och "vet inte" betyder helt olika saker här.
 */
export function lasBelopp(värde) {
  if (värde === null || värde === undefined || värde === '') return null;
  if (typeof värde === 'number') return Number.isFinite(värde) ? värde : null;
  const rensad = String(värde).replace(/[^0-9.,-]/g, '');
  if (rensad === '') return null;
  // Både svensk ("1 000,00") och amerikansk ("2,500.00") formatering förekommer
  // i API-svar. Regel: finns både punkt och komma är det SIST förekommande
  // tecknet decimaltecknet. Finns bara punkt och exakt tre siffror efter den
  // ("1.000") går det inte att veta om det är ett tusental — då hellre null
  // (= "vet inte", ger ingen dom) än ett tal som kan vara 1000x fel.
  const sistaPunkt = rensad.lastIndexOf('.');
  const sistaKomma = rensad.lastIndexOf(',');
  let normaliserad;
  if (sistaPunkt >= 0 && sistaKomma >= 0) {
    normaliserad = sistaKomma > sistaPunkt
      ? rensad.replace(/\./g, '').replace(',', '.')
      : rensad.replace(/,/g, '');
  } else if (sistaKomma >= 0) {
    normaliserad = rensad.split(',').length > 2
      ? rensad.replace(/,/g, '')
      : rensad.replace(',', '.');
  } else if (sistaPunkt >= 0) {
    const delar = rensad.split('.');
    if (delar.length > 2) normaliserad = rensad.replace(/\./g, '');
    else if (delar[1].length === 3) return null; // "1.000" — tvetydigt
    else normaliserad = rensad;
  } else {
    normaliserad = rensad;
  }
  const tal = Number(normaliserad);
  return Number.isFinite(tal) ? tal : null;
}

/**
 * Kostnad per order i kronor, från delarna den består av.
 * Leverantörspris och frakt betalas i USD, avgifter ofta i EUR — därför tre poster.
 */
export function kostnadSek(kostnad, fx) {
  if (!kostnad || !fx) return null;
  const usd = Number(kostnad.usd) || 0;
  const eur = Number(kostnad.eur) || 0;
  const sek = Number(kostnad.sek) || 0;
  if (usd && !Number.isFinite(fx.usd_sek)) return null;
  if (eur && !Number.isFinite(fx.eur_sek)) return null;
  const summa = usd * (fx.usd_sek ?? 0) + eur * (fx.eur_sek ?? 0) + sek;
  return summa > 0 ? summa : null;
}

/**
 * Break-even-ROAS ur försäljningspris och kostnad per order.
 *
 *   vinst = omsättning - kostnad - annonsspend
 *   vid noll vinst: annonsspend = omsättning - kostnad
 *   ROAS = omsättning / annonsspend = pris / (pris - kostnad)
 *
 * Ingen moms: Bäverbutiken säljer DDP till Sverige (Axels besked 2026-08-29).
 * Break-even räknas rakt på försäljningspriset.
 */
export function breakEvenRoas(prisSek, kostnadPerOrderSek) {
  if (!Number.isFinite(prisSek) || prisSek <= 0) return null;
  if (!Number.isFinite(kostnadPerOrderSek) || kostnadPerOrderSek < 0) return null;
  const marginal = prisSek - kostnadPerOrderSek;
  if (marginal <= 0) return null; // Produkten går inte att annonsera lönsamt alls.
  return prisSek / marginal;
}

/** Vinst i procent av omsättningen. Null när ROAS saknas eller är noll (= inga köp). */
export function vinstProcent(breakEven, roas) {
  if (!Number.isFinite(breakEven) || breakEven <= 1) return null;
  if (!Number.isFinite(roas) || roas <= 0) return null;
  return (1 / breakEven - 1 / roas) * 100;
}

/**
 * Target-ROAS för en produkt. Ett eget tal (`target`) vinner om det ligger
 * över break-even; annars härleds target ur break-even och skalningszonen —
 * den ROAS som ger ZON_SKALA_OVER procent vinst av omsättningen:
 *   vinst% = (1/BE − 1/ROAS) × 100  ⇒  ROAS = 1 / (1/BE − vinst/100)
 * Det är exakt tröskeln motorn redan skalade på, gjord uttrycklig — så en
 * produkt utan eget target beter sig som förut, och en produkt MED eget
 * target skalar mot det. `kalla` säger vilket.
 */
export function targetRoas(breakEven, target = null) {
  if (!Number.isFinite(breakEven) || breakEven <= 1) return { target: null, kalla: 'break-even saknas' };
  // Ett eget target måste ligga över sänkzonens gräns (ZON_SANK_UNDER, 16 %
  // vinst): under den sänker motorn 20 % (drift), och ett target där hade
  // gett "sänk" och "över target" samtidigt (granskningen 2026-09-22).
  // Sänk-zonen är ett tredje mått — varken kill (break-even) eller skalning
  // (target) — och den flyttas inte av ett target.
  const golvNamnare = 1 / breakEven - ZON_SANK_UNDER / 100;
  const golv = golvNamnare > 0 ? 1 / golvNamnare : Infinity;
  if (Number.isFinite(target) && target > breakEven && target >= golv) return { target, kalla: 'produktens target_roas' };
  const namnare = 1 / breakEven - ZON_SKALA_OVER / 100;
  if (namnare <= 0) return { target: null, kalla: `break-even ${breakEven} tillåter inte ${ZON_SKALA_OVER} % vinst` };
  const harledd = 1 / namnare;
  if (Number.isFinite(target)) {
    const varfor = target <= breakEven ? 'ligger under break-even' : `ligger under sänkzonens gräns ${golv.toFixed(2)} (${ZON_SANK_UNDER} % vinst)`;
    return { target: harledd, kalla: `härledd (${ZON_SKALA_OVER} % vinst) — target_roas ${target} ${varfor} och ignoreras` };
  }
  return { target: harledd, kalla: `härledd (${ZON_SKALA_OVER} % vinst av omsättningen)` };
}

/** Trappsteget ur avståndet till target: { faktor, namn, over } eller null under target. */
export function trappsteg(roas, target) {
  if (!Number.isFinite(roas) || !Number.isFinite(target) || target <= 0) return null;
  const kvot = roas / target;
  for (const steg of TRAPPA) if (kvot >= steg.over) return { ...steg, kvot };
  return null;
}

/**
 * Ny budget avrundad till jämna 50 kr UTAN att bryta mot stegets maxfaktor.
 * Panelens Math.round gör det: 605 kr -> 750 kr är +24 %. Vi avrundar därför
 * höjningar nedåt och sänkningar uppåt, så steget aldrig blir större än
 * faktorn. `tak` är valfritt (högzonens 4 000 utan vinnare); utan tak finns
 * ingen övre gräns — Axels beslut 2026-09-22.
 */
export function nyBudget(riktning, budget, { tak = null, faktor = null } = {}) {
  if (!Number.isFinite(budget) || budget <= 0) return null;
  const takNu = Number.isFinite(tak) && tak > 0 ? tak : Infinity;
  if (riktning === 'upp') {
    const f = Number.isFinite(faktor) && faktor > 1 ? faktor : 1.2;
    const rå = budget * f;
    return Math.min(takNu, Math.floor(rå / STEG_SEK) * STEG_SEK);
  }
  if (riktning === 'ner') {
    const rå = budget * 0.8;
    return Math.max(GOLV_SEK, Math.ceil(rå / STEG_SEK) * STEG_SEK);
  }
  if (riktning === 'halvera') {
    const rå = budget * 0.5;
    return Math.max(GOLV_SEK, Math.ceil(rå / STEG_SEK) * STEG_SEK);
  }
  throw new Error(`Okänd riktning "${riktning}"`);
}

function kr(n) {
  return `${Math.round(n).toLocaleString('sv-SE')} kr`;
}

/** Avstånd i procentenheter till närmaste zongräns. */
export function avstandTillGrans(vinst) {
  if (!Number.isFinite(vinst)) return null;
  return Math.min(
    Math.abs(vinst - 0),
    Math.abs(vinst - ZON_SANK_UNDER),
    Math.abs(vinst - ZON_SKALA_OVER),
  );
}

function pct(n) {
  return `${n.toFixed(1).replace('.', ',')} %`;
}

const d2 = (x) => x.toFixed(2).replace('.', ',');

/**
 * Fäller dagens dom för EN kampanj.
 *
 * @param {object} rad
 * @param {string}  rad.namn              Kampanjnamnet (break-even läses härifrån)
 * @param {'test'|'drift'} rad.lage       Ny produkt vi testar, eller en som gått bra
 * @param {number|null} rad.breakEven     Override; annars läses den ur namnet
 * @param {number|null} rad.targetRoas    Produktens eget target-ROAS (skalningsmåttet); null ⇒ härleds
 * @param {number|null} rad.roas3d        ROAS senaste 3 dagarna
 * @param {number|null} rad.spend3d       Spend senaste 3 dagarna
 * @param {number|null} rad.kop3d         Antal köp senaste 3 dagarna
 * @param {number|null} rad.spendTotal    Spend sedan start
 * @param {number|null} rad.roasTotal     ROAS sedan start. Över break-even = stängs aldrig av
 * @param {number|null} rad.budget        Nuvarande dagsbudget
 * @param {number|null} rad.dagarSedanAndring  Från budgetloggen. null = aldrig ändrad av oss
 * @param {number|null} rad.backDagarIRad Antal dygn i rad under break-even
 * @param {boolean}     rad.harVinnare    Etiketterad BREAKTHROUGH eller SPEND_WINNER
 *                                        inom VINNARE_DAGAR. Krävs för att motorn
 *                                        ska få skala över TAK_UTAN_VINNARE.
 * @param {{stiger: boolean, dagar: number, serie: Array}|null} rad.cpaStiger
 *                                        CPA-trenden ur dygnsserien (agent/trend.mjs).
 *                                        stiger = så många dygn i rad att ingen höjning görs.
 * @param {{andel: number, klick: number, visning: number}|null} rad.klickandel
 *                                        Andel klickbaserade köp senaste 3 dygnen.
 * @param {number|null} rad.dagarOverTarget Dygn i rad med dags-ROAS ≥ target.
 * @returns {{kod: string, rubrik: string, motivering: string, nyBudget: number|null,
 *           zon: string|null, vinstProcent: number|null, breakEven: number|null,
 *           breakEvenKalla: string, kraverGodkannande: boolean}}
 */
export function besked(rad) {
  const lage = rad.lage === 'drift' ? 'drift' : 'test';
  // Spärr 1 (Axel 2026-09-21): utan en levande vinnaretikett är taket 4 000.
  // `harVinnare` måste vara EXAKT true — en anropare som inte räknat fältet
  // ska inte råka skala förbi högzonen på ett undefined. Med vinnare finns
  // inget tak alls (Axel 2026-09-22).
  const harVinnare = rad.harVinnare === true;
  const takNu = harVinnare ? Infinity : TAK_UTAN_VINNARE;
  const ur = lasBreakEven(rad.namn);
  const breakEven = Number.isFinite(rad.breakEven) && rad.breakEven > 1 ? rad.breakEven : ur.be;
  const breakEvenKalla = Number.isFinite(rad.breakEven) && rad.breakEven > 1
    ? (rad.breakEvenKalla || 'produktkarta.json')
    : ur.kalla;
  const mal = targetRoas(breakEven, rad.targetRoas);

  const svar = (kod, rubrik, motivering, extra = {}) => ({
    kod,
    rubrik,
    motivering,
    nyBudget: null,
    zon: null,
    vinstProcent: null,
    breakEven,
    breakEvenKalla,
    targetRoas: mal.target,
    targetKalla: mal.kalla,
    kraverGodkannande: false,
    naraGrans: false,
    ...extra,
  });

  // 1. Utan break-even finns ingen dom att fälla. Gissa aldrig.
  if (!Number.isFinite(breakEven)) {
    return svar('SAKNAR_BREAK_EVEN', 'Break-even saknas',
      `Ingen dom går att fälla — break-even ${breakEvenKalla}. Sätt talet i kampanjnamnet först.`);
  }

  // 2. Utan känd budget vet vi inte vad vi skulle ändra.
  if (!Number.isFinite(rad.budget) || rad.budget <= 0) {
    return svar('SAKNAR_BUDGET', 'Budget saknas på kampanjen',
      'Dagsbudgeten sitter troligen på annonsgruppen (ABO). Läs och ändra den där i stället.');
  }

  // 3. Grinden ur CLAUDE.md regel 3 / ANALYSMETOD: ingen dom under 300 kr eller 3 köp.
  // Men grinden får inte bli ett evigt frikort: en kampanj som bränner stort
  // UTAN att köpa in sig över grinden är inte "för lite data" — den är trasig.
  const spend3d = rad.spend3d;
  const kop3d = rad.kop3d;
  // Testprodukter larmas dock aldrig före 1 500 kr total spend (Axels order
  // 2026-08-29, MC-Kapellet) — under testtröskeln har den inte fått sin chans.
  const underTesttroskel = lage === 'test'
    && (!Number.isFinite(rad.spendTotal) || rad.spendTotal < TEST_TROSKEL_SEK);
  // Larmet gäller kampanjer som INTE betalar för sig. Få köp räcker inte som
  // skäl: Övervåkingskamera NO larmades 2026-08-31 på 2 köp trots ROAS 2,10
  // mot break-even 1,40 — 50 % marginal beskrevs som "bränner pengar utan köp".
  // Går den plus är den inte trasig, den är tidig. Då gäller grinden nedan.
  // Axels invändning 2026-08-31.
  const betalarForSig = Number.isFinite(rad.roas3d) && rad.roas3d >= breakEven;
  if (Number.isFinite(spend3d) && spend3d >= 3 * MIN_SPEND_FOR_DOM
      && (!Number.isFinite(kop3d) || kop3d < MIN_KOP_FOR_DOM)
      && !betalarForSig
      && !underTesttroskel) {
    const kopText = Number.isFinite(kop3d) ? `${kop3d} köp` : 'okänt antal köp';
    const roasText = Number.isFinite(rad.roas3d)
      ? ` ROAS ${d2(rad.roas3d)} mot break-even ${d2(breakEven)}.`
      : '';
    // Axels order 2026-09-02: ett larm som ingen agerar på är ingen spärr.
    // Jättefotbollen fick STOR_SPEND_UTAN_KOP tre morgnar i rad (31/8, 31/8,
    // 1/9) med "en människa måste titta" och brände ~1 000 kr om dagen tills
    // Axel själv såg det. En testprodukt över 1 500 kr som bränner utan att gå
    // ihop går därför ÅTGÄRDSTRAPPAN direkt — samma morgon, oavsett kadens.
    if (lage === 'test') {
      return svar('ATGARDSTRAPPAN', 'Bränner pengar — stäng av om potential saknas',
        `${kr(spend3d)} på 3 dagar och bara ${kopText}, utan att gå ihop.${roasText} Över ${kr(TEST_TROSKEL_SEK)} sedan start. Läs annonserna: finns minst en annons med köp över break-even OCH en spendtjuv, pausa spendtjuven och ge kampanjen ETT dygn till. Annars stängs hela kampanjen av i dag.`,
        { zon: 'stop', kraverGodkannande: true });
    }
    return svar('STOR_SPEND_UTAN_KOP', 'Bränner pengar — larm',
      `${kr(spend3d)} på 3 dagar och bara ${kopText}, utan att gå ihop.${roasText} Det är inte "för lite data" längre — något är fel (produktsidan, priset, lagret?). En människa måste titta.`);
  }
  if (!Number.isFinite(spend3d) || !Number.isFinite(kop3d)
      || spend3d < MIN_SPEND_FOR_DOM || kop3d < MIN_KOP_FOR_DOM) {
    const spendText = Number.isFinite(spend3d) ? kr(spend3d) : 'okänd spend';
    const kopText = Number.isFinite(kop3d) ? `${kop3d} köp` : 'okänt antal köp';
    return svar('FOR_LITE_DATA', 'För lite data för en dom',
      `${spendText} och ${kopText} på 3 dagar. Grinden går vid ${MIN_SPEND_FOR_DOM} kr och ${MIN_KOP_FOR_DOM} köp. Rör ingenting.`);
  }

  const vinst = vinstProcent(breakEven, rad.roas3d);
  if (vinst === null) {
    return svar('FOR_LITE_DATA', 'ROAS saknas',
      'Meta returnerade ingen ROAS för perioden. Rör ingenting förrän siffran finns.');
  }

  // 4. Kadensspärren: Meta ska hinna lära sig mellan ändringar.
  // Snabbspåret gäller bara uppåt: skalningszon + ROAS ≥ 3 → 1 dag räcker.
  const dagar = rad.dagarSedanAndring;
  // Snabbspåret gäller bara höjning-efter-höjning. Dagen efter en sänkning
  // eller halvering vore en 20 %-höjning ren vingelflygning.
  const snabbspar = rad.roas3d >= SNABB_SKALNING_ROAS && vinst >= ZON_SKALA_OVER
    && rad.senasteAndringKod === 'SKALA';
  const minDagar = snabbspar ? SNABB_MIN_DAGAR : MIN_DAGAR_MELLAN_ANDRINGAR;
  // Kadensen skyddar Metas inlärning mellan BUDGETÄNDRINGAR. En testprodukt
  // som går back ska inte få bränna tre dygn till bara för att budgeten
  // rördes nyligen — förlusten går vidare till trappan/tröskeln nedan
  // (Axel 2026-09-02: "om det ser dåligt ut stänger vi av direkt").
  const forlustITest = vinst < 0 && lage === 'test';
  if (!forlustITest && Number.isFinite(dagar) && dagar < minDagar) {
    return svar('VANTA_KADENS', 'Vänta — ändrad för nyligen',
      `Budgeten ändrades för ${dagar} ${dagar === 1 ? 'dag' : 'dagar'} sedan. Nästa ändring tidigast efter ${minDagar} ${minDagar === 1 ? 'dag' : 'dagar'}.`,
      { vinstProcent: vinst });
  }

  const avstand = avstandTillGrans(vinst);
  const naraGrans = avstand !== null && avstand < NARA_GRANS_PP;
  const gransText = naraGrans
    ? ` ⚠ Ligger ${avstand.toFixed(1).replace('.', ',')} procentenheter från en zongräns — ROAS för de senaste dygnen kan fortfarande revideras uppåt. Kolla i Ads Manager innan du kör den här.`
    : '';
  const bas = `${pct(vinst)} vinst av omsättningen (ROAS ${d2(rad.roas3d)} mot break-even ${d2(breakEven)}).`;

  // 5. Förlust — KILL-BESLUTEN, alla mot BREAK-EVEN (CLAUDE.md regel 4).
  if (vinst < 0) {
    // Spärr 3 (Axel 2026-09-21): i högzonen kapas aldrig, och den gäller FÖRE
    // test/drift-uppdelningen. En budget över TAK_UTAN_VINNARE är per
    // definition ingen testbudget — antingen skalade motorn dit den på en
    // etiketterad vinnare, eller så satte Axel den för hand. Åtgärdstrappan
    // ska inte kunna stänga av en kampanj som ligger på 6 000 kr om dagen för
    // att produktkartan råkar sakna raden. Först TVÅ förlustmorgnar i rad ger
    // −20 %, aldrig en kapning, aldrig under TAK_UTAN_VINNARE i ett steg.
    // Utan tak gäller det här hela vägen upp: 16 000 kr som går back sänks
    // 20 % efter två förlustmorgnar, inte mer.
    if (rad.budget > TAK_UTAN_VINNARE) {
      const back = Number.isFinite(rad.backDagarIRad) ? rad.backDagarIRad : null;
      if (back === null || back < HOGZON_BACK_DAGAR) {
        const backText = back === null ? 'okänt antal' : String(back);
        return svar('HOGZON_AVVAKTA', 'Högzon — en förlustmorgon räcker inte',
          `${bas} Budgeten ${kr(rad.budget)} ligger i högzonen över ${kr(TAK_UTAN_VINNARE)}. ${backText} förlustmorgon i rad — vid ${HOGZON_BACK_DAGAR} sänks den 20 %. Ingen kapning, ingen paus, ingen avstängning.${gransText}`,
          { zon: 'hold', vinstProcent: vinst, harVinnare, hogzon: true });
      }
      const ner = Math.max(TAK_UTAN_VINNARE, nyBudget('ner', rad.budget));
      return svar('SANK', 'Högzon — sänk 20 % efter två förlustmorgnar',
        `${bas} ${back} förlustmorgnar i rad i högzonen. Sänk från ${kr(rad.budget)} till ${kr(ner)} per dag — 20 %, aldrig en kapning, aldrig under ${kr(TAK_UTAN_VINNARE)} i ett steg.${gransText}`,
        { zon: 'down', vinstProcent: vinst, nyBudget: ner, kraverGodkannande: true, naraGrans, harVinnare, hogzon: true });
    }
    if (lage === 'test') {
      if (!Number.isFinite(rad.spendTotal)) {
        // Okänd totalspend får aldrig tolkas som "tröskeln är passerad".
        return svar('SAKNAR_SPEND_TOTAL', 'Spend sedan start saknas',
          `${bas} Går back, men utan totalspend går det inte att veta om den passerat ${kr(TEST_TROSKEL_SEK)}-tröskeln. Rör ingenting — hämta talet.`,
          { zon: 'stop', vinstProcent: vinst });
      }
      if (rad.spendTotal < TEST_TROSKEL_SEK) {
        return svar('VANTA_TROSKEL', 'Vänta — har inte fått chansen än',
          `${bas} Den har spenderat ${kr(rad.spendTotal)} av ${kr(TEST_TROSKEL_SEK)} sedan start. Rör ingenting förrän den passerat tröskeln.`,
          { zon: 'stop', vinstProcent: vinst });
      }
      // Livstidsspärren (Axels larm 2026-09-04, skärpt samma dag). Kranskydd
      // Frost 420D hade 7 417 kr spend, 28 köp och livstids-ROAS 1,59 mot
      // break-even 1,49 — plus 4,4 % — och stängdes ändå av på en tredagarsdipp
      // till 1,35. En kampanj som tjänat pengar över hela sin livstid ska inte
      // dö på ett tredagarsfönster; färska siffror revideras uppåt.
      //
      // MEN den får inte heller leva vidare på gamla meriter — Axel samma dag:
      // "så ska vi inte tänka för då torskar vi allt till slut, men den fick ju
      // inte gå ner på 500 kr spend?". Därför två bromsar, båda på riktig data:
      //   1. Budgeten kapas direkt till golvet 500 kr. Inte 20 %, inte halvering.
      //   2. Spärren håller högst LIVSTIDS_MAX_BACKDAGAR back-dygn i rad, och
      //      bara så länge livstiden FORTFARANDE ligger över break-even. Varje
      //      förlustdygn äter på livstidsmarginalen, så spärren tar slut av sig
      //      själv — sen faller kampanjen igenom till trappan och stängs av.
      const backLivstid = Number.isFinite(rad.backDagarIRad) ? rad.backDagarIRad : 0;
      if (Number.isFinite(rad.roasTotal) && rad.roasTotal >= breakEven
          && backLivstid < LIVSTIDS_MAX_BACKDAGAR) {
        const livstid = `${bas} Men livstids-ROAS ${d2(rad.roasTotal)} ligger över break-even ${d2(breakEven)} — kampanjen har tjänat pengar totalt, så en tredagarsdipp stänger den inte i dag.`;
        const kvar = LIVSTIDS_MAX_BACKDAGAR - backLivstid;
        if (rad.budget > GOLV_SEK) {
          return svar('SANK', 'Kapa till golvet — går plus över livstiden',
            `${livstid} Kapa från ${kr(rad.budget)} till ${kr(GOLV_SEK)} per dag — hela vägen ner, inte 20 %. ${backLivstid} back-dygn i rad; efter ${LIVSTIDS_MAX_BACKDAGAR} stängs den av ändå, och faller livstids-ROAS under break-even stängs den av direkt.${gransText}`,
            { zon: 'down', vinstProcent: vinst, nyBudget: GOLV_SEK, kraverGodkannande: true, naraGrans, livstidssparr: true });
        }
        return svar('RAKNA_BACKDAGAR', 'Ligg kvar på golvet — går plus över livstiden',
          `${livstid} Ligger redan på ${kr(GOLV_SEK)}. ${backLivstid} back-dygn i rad — ${kvar} kvar innan den stängs av.`,
          { zon: 'stop', vinstProcent: vinst, livstidssparr: true });
      }
      return svar('ATGARDSTRAPPAN', 'Stäng av — om den inte har potential',
        `${bas} Passerad ${kr(TEST_TROSKEL_SEK)} utan att gå plus. Läs annonserna: finns minst en annons med köp över break-even OCH en spendtjuv utan köp, pausa spendtjuven och ge kampanjen ETT dygn till. Saknas potentialen — eller är förlängningen redan använd — stängs hela kampanjen av i dag.${gransText}`,
        { zon: 'stop', vinstProcent: vinst, kraverGodkannande: true, naraGrans });
    }
    // Drift.
    if (rad.budget <= GOLV_SEK) {
      const back = Number.isFinite(rad.backDagarIRad) ? rad.backDagarIRad : null;
      if (back !== null && back >= BACK_DAGAR_FOR_AVSTANGNING) {
        return svar('STANG_AV', 'Stäng av',
          `${bas} ${back} dygn i rad under break-even på lägsta budgeten. Gränsen är ${BACK_DAGAR_FOR_AVSTANGNING}.${gransText}`,
          { zon: 'stop', vinstProcent: vinst, kraverGodkannande: true, naraGrans });
      }
      const backText = back === null ? 'okänt antal' : String(back);
      return svar('RAKNA_BACKDAGAR', 'Ligg kvar på golvet — räkna dagar',
        `${bas} Redan på ${kr(GOLV_SEK)}. ${backText} dygn i rad under break-even hittills; vid ${BACK_DAGAR_FOR_AVSTANGNING} stängs den av.`,
        { zon: 'stop', vinstProcent: vinst });
    }
    const halv = nyBudget('halvera', rad.budget);
    return svar('HALVERA', 'Halvera',
      `${bas} Sänk från ${kr(rad.budget)} till ${kr(halv)} per dag.${gransText}`,
      { zon: 'stop', vinstProcent: vinst, nyBudget: halv, kraverGodkannande: true, naraGrans });
  }

  // 6. 0-16 %: sänk — men bara drift. En testprodukt som går PLUS rörs aldrig:
  // testbudgeten ligger kvar tills den bevisat sig eller gått back (Axels
  // beslut 2026-08-29 — en tunn plusmarginal på en ny produkt är ofta ett
  // prisproblem, inte ett budgetproblem).
  if (vinst < ZON_SANK_UNDER) {
    if (lage === 'test') {
      return svar('LAT_VARA', 'Testas — går plus, rörs inte',
        `${bas} Testprodukt på plus behåller sin testbudget. Är marginalen tunn är det priset som ska ses över, inte budgeten.`,
        { zon: 'hold', vinstProcent: vinst });
    }
    if (rad.budget <= GOLV_SEK) {
      return svar('LAT_VARA', 'Låt vara',
        `${bas} Ligger redan på ${kr(GOLV_SEK)} och går plus. Lämna den.`,
        { zon: 'down', vinstProcent: vinst });
    }
    const ner = nyBudget('ner', rad.budget);
    return svar('SANK', 'Sänk 20 %',
      `${bas} Under ${ZON_SANK_UNDER} % är det mer värt att sänka. Ändra från ${kr(rad.budget)} till ${kr(ner)} per dag. Nästa koll om ${MIN_DAGAR_MELLAN_ANDRINGAR} dagar.${gransText}`,
      { zon: 'down', vinstProcent: vinst, nyBudget: ner, kraverGodkannande: true, naraGrans });
  }

  // 7. SKALNINGSMÅTTET: target-ROAS. Under target (men över 16 % vinst) rörs
  // ingenting — det här är läget vi vill ha de flesta produkter i. Utan eget
  // target är gränsen ZON_SKALA_OVER (25 % vinst), exakt som förut.
  const target = mal.target;
  const steg = trappsteg(rad.roas3d, target);
  if (!steg) {
    const malText = Number.isFinite(target) ? ` Target ${d2(target)} (${mal.kalla}) nås inte.` : '';
    return svar('LAT_VARA', 'Låt vara',
      `${bas}${malText} Går plus men skalas inte. Nästa koll om ${MIN_DAGAR_MELLAN_ANDRINGAR} dagar.`,
      { zon: 'hold', vinstProcent: vinst });
  }

  // 8. Över target: skala — om spärrarna släpper. Ordningen är med flit:
  //    a) vinnare krävs över 4 000 (spärr 1),
  //    b) CPA-trenden (hälsomåttet, Axel 2026-09-22): stigande CPA tre dygn i
  //       rad ⇒ ingen höjning, hur bra ROAS än ser ut. Sänks inte — den går
  //       fortfarande plus. Fixet är nya creatives, inte budget.
  //    c) klickandelen ≥ 60 % (Compare Attribution Settings),
  //    d) 48–72 timmar konsekvent över target,
  //    e) steget: trappan under högzonen, max 20 % i den (spärr 2).
  const malText = `Target ${d2(target)} (${mal.kalla}), ROAS ${d2(rad.roas3d)} = ${Math.round(steg.kvot * 100)} % av target.`;
  if (rad.budget >= takNu) {
    return svar('LAT_VARA', 'Låt vara — taket utan vinnare',
      `${bas} ${malText} ${kr(TAK_UTAN_VINNARE)} per dag är taket utan vinnare. Över det krävs en etiketterad BREAKTHROUGH eller SPEND_WINNER inom ${VINNARE_DAGAR} dygn — produkten har ingen. Skriv lärdomen på nästa vinnare, så finns inget tak.`,
      { zon: 'hold', vinstProcent: vinst, harVinnare });
  }
  const cpa = rad.cpaStiger && typeof rad.cpaStiger === 'object' ? rad.cpaStiger : null;
  if (cpa?.stiger === true) {
    const serie = Array.isArray(cpa.serie) && cpa.serie.length ? ` (${cpa.serie.map((d) => (d.cpa === Infinity ? '∞' : Math.round(d.cpa))).join(' → ')} kr)` : '';
    return svar('CPA_STIGER', 'Ingen höjning — CPA stiger',
      `${bas} ${malText} Men kostnaden per köp har stigit ${cpa.dagar} dygn i rad${serie}. Hälsomåttet säger nej till höjning oavsett ROAS. Sänks inte — den går plus. Fixet är nya creatives, inte budget.${gransText}`,
      { zon: 'hold', vinstProcent: vinst, harVinnare, cpaStiger: cpa });
  }
  const klick = rad.klickandel && typeof rad.klickandel === 'object' && Number.isFinite(rad.klickandel.andel) ? rad.klickandel : null;
  if (klick && klick.andel < KLICK_MIN_ANDEL) {
    return svar('VISNING_AVVAKTA', 'Vänta ett dygn — för få klickköp',
      `${bas} ${malText} Bara ${pct(klick.andel * 100)} av köpen är klickbaserade (${klick.klick} klick, ${klick.visning} visning) — gränsen är ${pct(KLICK_MIN_ANDEL * 100)}. Merparten är visningsköp; vänta ett dygn innan någon höjning.${gransText}`,
      { zon: 'hold', vinstProcent: vinst, harVinnare, klickandel: klick });
  }
  // Fail-closed: saknas dygnsserien går det inte att veta om kampanjen legat
  // konsekvent över target — hellre en dag utan höjning än en höjning utan
  // serie (granskningen 2026-09-22). Rapporten varnar dessutom om serien.
  const konsekvent = Number.isFinite(rad.dagarOverTarget) ? rad.dagarOverTarget : null;
  if (konsekvent === null) {
    return svar('VANTA_KONSEKVENT', 'Vänta — dygnsserien saknas',
      `${bas} ${malText} Trappan kräver ${KONSEKVENT_DAGAR} hela dygn i rad över target (48–72 timmar konsekvent), men dygnsserien saknas eller bär ingen ROAS — ingen höjning förrän den finns.${gransText}`,
      { zon: 'hold', vinstProcent: vinst, harVinnare, dagarOverTarget: null });
  }
  if (konsekvent < KONSEKVENT_DAGAR) {
    return svar('VANTA_KONSEKVENT', 'Vänta — inte konsekvent över target än',
      `${bas} ${malText} Dags-ROAS har legat över target ${konsekvent} helt dygn i rad — trappan kräver ${KONSEKVENT_DAGAR} (48–72 timmar konsekvent).${gransText}`,
      { zon: 'hold', vinstProcent: vinst, harVinnare, dagarOverTarget: konsekvent });
  }
  // Spärr 2 (Axel 2026-09-21): i högzonen är steget max 20 % per rond, så
  // trappans ×1,5 och ×2 gäller bara upp till TAK_UTAN_VINNARE. Att dubbla en
  // budget som redan ligger på 4 000 kr är ett hopp på 4 000 kr per dygn.
  const hogzon = rad.budget >= TAK_UTAN_VINNARE;
  const faktor = hogzon ? Math.min(steg.faktor, HOGZON_MAX_FAKTOR) : steg.faktor;
  const upp = nyBudget('upp', rad.budget, { tak: takNu, faktor });
  if (upp <= rad.budget) {
    return svar('LAT_VARA', 'Låt vara — taket utan vinnare',
      `${bas} ${malText} En höjning skulle passera ${kr(takNu)}, taket utan vinnare.`,
      { zon: 'hold', vinstProcent: vinst, harVinnare });
  }
  const nastaKoll = snabbspar
    ? `Snabbspår: ROAS över 3 — kan höjas igen om ${SNABB_MIN_DAGAR} dagar.`
    : `Nästa koll om ${MIN_DAGAR_MELLAN_ANDRINGAR} dagar.`;
  const stegText = hogzon && steg.faktor > HOGZON_MAX_FAKTOR
    ? ` Trappan hade gett ${steg.namn}, men över ${kr(TAK_UTAN_VINNARE)} är steget alltid 20 % (högzonen).`
    : hogzon ? ` Högzon: över ${kr(TAK_UTAN_VINNARE)} är steget alltid 20 %.` : '';
  const rubrik = faktor >= 2 ? 'Skala — dubbla' : faktor >= 1.5 ? 'Skala ×1,5' : 'Skala upp 20 %';
  return svar('SKALA', rubrik,
    `${bas} ${malText} Trappsteg ${steg.namn}${konsekvent !== null ? `, ${konsekvent} dygn i rad över target` : ''}${klick ? `, ${pct(klick.andel * 100)} klickköp` : ''}${cpa ? `, CPA ${cpa.dagar} stigande dygn` : ''}. Ändra från ${kr(rad.budget)} till ${kr(upp)} per dag. ${nastaKoll}${stegText}${gransText}`,
    { zon: 'up', vinstProcent: vinst, nyBudget: upp, kraverGodkannande: true, naraGrans, harVinnare, faktor, trappsteg: steg.namn });
}

/**
 * Surf-läget (Axels beslut 2026-09-22): peak-kadensen, var sjätte timme.
 * Aldrig automatiskt — anroparen kör bara den här när Axel slagit på läget.
 *
 * @param {object} rad
 * @param {number|null} rad.budget        Nuvarande dagsbudget
 * @param {number|null} rad.spendIdag     Spend hittills i dag (annonskontots dygn)
 * @param {number|null} rad.roasIdag      ROAS hittills i dag (7d_click)
 * @param {number|null} rad.kopIdag       Köp hittills i dag
 * @param {number|null} rad.spendIgar     Gårdagens faktiska spend
 * @param {number|null} rad.breakEven
 * @param {number|null} rad.targetRoas    Eget target; annars härleds
 * @param {boolean}     rad.efterMidnatt  Första körningen efter annonskontots midnatt (ingen SURF_RESET loggad i dag)
 * @param {{stiger: boolean}|null} rad.cpaStiger  Hälsomåttet gäller här också
 */
export function surfBesked(rad) {
  const breakEven = Number.isFinite(rad.breakEven) && rad.breakEven > 1 ? rad.breakEven : lasBreakEven(rad.namn).be;
  const mal = targetRoas(breakEven, rad.targetRoas);
  const svar = (kod, rubrik, motivering, extra = {}) => ({
    kod, rubrik, motivering, nyBudget: null, zon: null, vinstProcent: null, breakEven, breakEvenKalla: 'surf',
    targetRoas: mal.target, targetKalla: mal.kalla, kraverGodkannande: false, naraGrans: false, surf: true, ...extra,
  });
  if (!Number.isFinite(breakEven)) return svar('SAKNAR_BREAK_EVEN', 'Break-even saknas', 'Ingen surf-dom utan break-even.');
  if (!Number.isFinite(rad.budget) || rad.budget <= 0) return svar('SAKNAR_BUDGET', 'Budget saknas', 'Dagsbudgeten sitter troligen på annonsgruppen.');

  // Midnattsresetten: ungefär halva gårdagens FAKTISKA spend, aldrig under golvet.
  if (rad.efterMidnatt === true) {
    if (!Number.isFinite(rad.spendIgar) || rad.spendIgar <= 0) {
      return svar('SURF_HALL', 'Surf — ingen reset utan gårdagens spend', 'Gårdagens spend saknas; budgeten lämnas tills talet finns.');
    }
    const ny = Math.max(GOLV_SEK, Math.round((rad.spendIgar * SURF_RESET_ANDEL) / STEG_SEK) * STEG_SEK);
    return svar('SURF_RESET', 'Surf — midnattsreset till halva gårdagens spend',
      `Gårdagen spenderade ${kr(rad.spendIgar)}. Budgeten sätts till ${kr(ny)} (${Math.round(SURF_RESET_ANDEL * 100)} %) vid annonskontots midnatt; dagens fönster avgör sedan var sjätte timme.`,
      { zon: ny > rad.budget ? 'up' : ny < rad.budget ? 'down' : 'hold', nyBudget: ny === rad.budget ? null : ny, kraverGodkannande: ny !== rad.budget });
  }

  const roas = rad.roasIdag;
  const kop = rad.kopIdag;
  const spend = rad.spendIdag;
  if (!Number.isFinite(spend) || spend < MIN_SPEND_FOR_DOM || !Number.isFinite(kop) || kop < MIN_KOP_FOR_DOM || !Number.isFinite(roas)) {
    return svar('SURF_HALL', 'Surf — för lite i fönstret',
      `${Number.isFinite(spend) ? kr(spend) : 'okänd spend'} och ${Number.isFinite(kop) ? `${kop} köp` : 'okänt antal köp'} hittills i dag — under grinden ${MIN_SPEND_FOR_DOM} kr / ${MIN_KOP_FOR_DOM} köp. Håll.`,
      { zon: 'hold' });
  }
  const vinst = vinstProcent(breakEven, roas);
  const bas = `Dagens fönster: ROAS ${d2(roas)} på ${kr(spend)} och ${kop} köp (break-even ${d2(breakEven)}${Number.isFinite(mal.target) ? `, target ${d2(mal.target)}` : ''}).`;
  if (roas < breakEven) {
    const ner = nyBudget('ner', rad.budget);
    return svar('SURF_SANK', 'Surf — dåligt fönster, sänk 20 %',
      `${bas} Under break-even. Sänk från ${kr(rad.budget)} till ${kr(ner)}.`,
      { zon: 'down', vinstProcent: vinst, nyBudget: ner, kraverGodkannande: ner < rad.budget });
  }
  if (rad.cpaStiger?.stiger === true) {
    return svar('CPA_STIGER', 'Surf — CPA stiger, ingen dubbling',
      `${bas} Kostnaden per köp har stigit ${rad.cpaStiger.dagar} dygn i rad — hälsomåttet säger nej till höjning. Håll.`,
      { zon: 'hold', vinstProcent: vinst });
  }
  if (Number.isFinite(mal.target) && roas >= mal.target) {
    const upp = nyBudget('upp', rad.budget, { faktor: SURF_DUBBLA_FAKTOR });
    return svar('SURF_DUBBLA', 'Surf — bra fönster, dubbla',
      `${bas} Över target. Dubbla från ${kr(rad.budget)} till ${kr(upp)}.`,
      { zon: 'up', vinstProcent: vinst, nyBudget: upp, kraverGodkannande: true, faktor: SURF_DUBBLA_FAKTOR });
  }
  return svar('SURF_HALL', 'Surf — mellan break-even och target, håll',
    `${bas} Går plus men når inte target. Håll.`,
    { zon: 'hold', vinstProcent: vinst });
}
