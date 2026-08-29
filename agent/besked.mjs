// Beslutsmotorn för /rond. Ren räkning — inga API-anrop, ingen I/O, inget Claude.
// Allt som avgör om en budget höjs, sänks eller lämnas ifred bor HÄR, i kod,
// så att svaret blir detsamma varje gång och går att testa.
//
// Reglerna kommer från Bäverpanelen (Axels driftpanel) plus de grindar som
// docs/os/ANALYSMETOD.md och CLAUDE.md regel 3-4 kräver.

export const GOLV_SEK = 500;
export const TAK_SEK = 4000;
export const STEG_SEK = 50;

// Grindar innan någon dom alls får fällas (CLAUDE.md regel 3).
export const MIN_SPEND_FOR_DOM = 300;
export const MIN_KOP_FOR_DOM = 3;

// Testprodukt får ligga ifred tills den passerat den här spenden (Bäverpanelen, regel 3).
export const TEST_TROSKEL_SEK = 1500;

// Meta ska hinna lära sig mellan ändringar (Bäverpanelen, regel 1).
export const MIN_DAGAR_MELLAN_ANDRINGAR = 3;

// Snabbspåret (Axels beslut 2026-08-29): en produkt i skalningszonen med
// ROAS ≥ 3 får höjas 20 % redan dagen efter förra ändringen, inte var tredje
// dag. Gäller BARA höjningar — sänkningar och avstängningar väntar alltid
// sina tre dagar, eftersom färska minus-siffror revideras uppåt i efterhand.
export const SNABB_SKALNING_ROAS = 3.0;
export const SNABB_MIN_DAGAR = 1;

// Drift på golvet som går back så här många dygn i rad stängs av (Bäverpanelen, regel 3b).
export const BACK_DAGAR_FOR_AVSTANGNING = 7;

// Zongränser i procent vinst av omsättningen (Bäverpanelen, regel 4).
export const ZON_SANK_UNDER = 16;
export const ZON_SKALA_OVER = 25;

// Så nära en zongräns är beslutet inte att lita på: ROAS för de senaste dygnen
// revideras uppåt i efterhand när köp attribueras (7 dagars klickfönster).
// products/axelbaltet/batch-log.md har ett fall där en för tidig avläsning var
// 3,08x fel. Inom den här marginalen flaggas raden i stället för att bara köras.
export const NARA_GRANS_PP = 3;

/**
 * Plockar break-even-ROAS ur kampanjnamnet. Axels namnkonvention är
 * "Produkten | BE ROAS 1.49 | Launch 2026-08-27". "TBC" betyder att talet
 * inte är satt ännu — då får ingen dom fällas.
 * @returns {{be: number|null, kalla: string}}
 */
export function lasBreakEven(kampanjnamn) {
  const namn = String(kampanjnamn || '');
  if (/BE\s*ROAS\s*TBC/i.test(namn)) {
    return { be: null, kalla: 'kampanjnamnet säger TBC' };
  }
  const träff = namn.match(/BE\s*ROAS\s*([0-9]+[.,][0-9]+|[0-9]+)/i);
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
 * Ny budget avrundad till jämna 50 kr UTAN att bryta mot 20-procentsregeln.
 * Panelens Math.round gör det: 605 kr -> 750 kr är +24 %. Vi avrundar därför
 * höjningar nedåt och sänkningar uppåt, så steget aldrig blir större än 20 %.
 */
export function nyBudget(riktning, budget) {
  if (!Number.isFinite(budget) || budget <= 0) return null;
  if (riktning === 'upp') {
    const rå = budget * 1.2;
    return Math.min(TAK_SEK, Math.floor(rå / STEG_SEK) * STEG_SEK);
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

/**
 * Fäller dagens dom för EN kampanj.
 *
 * @param {object} rad
 * @param {string}  rad.namn              Kampanjnamnet (break-even läses härifrån)
 * @param {'test'|'drift'} rad.lage       Ny produkt vi testar, eller en som gått bra
 * @param {number|null} rad.breakEven     Override; annars läses den ur namnet
 * @param {number|null} rad.roas3d        ROAS senaste 3 dagarna
 * @param {number|null} rad.spend3d       Spend senaste 3 dagarna
 * @param {number|null} rad.kop3d         Antal köp senaste 3 dagarna
 * @param {number|null} rad.spendTotal    Spend sedan start
 * @param {number|null} rad.budget        Nuvarande dagsbudget
 * @param {number|null} rad.dagarSedanAndring  Från budgetloggen. null = aldrig ändrad av oss
 * @param {number|null} rad.backDagarIRad Antal dygn i rad under break-even
 * @returns {{kod: string, rubrik: string, motivering: string, nyBudget: number|null,
 *           zon: string|null, vinstProcent: number|null, breakEven: number|null,
 *           breakEvenKalla: string, kraverGodkannande: boolean}}
 */
export function besked(rad) {
  const lage = rad.lage === 'drift' ? 'drift' : 'test';
  const ur = lasBreakEven(rad.namn);
  const breakEven = Number.isFinite(rad.breakEven) && rad.breakEven > 1 ? rad.breakEven : ur.be;
  const breakEvenKalla = Number.isFinite(rad.breakEven) && rad.breakEven > 1
    ? (rad.breakEvenKalla || 'produktkarta.json')
    : ur.kalla;

  const svar = (kod, rubrik, motivering, extra = {}) => ({
    kod,
    rubrik,
    motivering,
    nyBudget: null,
    zon: null,
    vinstProcent: null,
    breakEven,
    breakEvenKalla,
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
  if (Number.isFinite(spend3d) && spend3d >= 3 * MIN_SPEND_FOR_DOM
      && (!Number.isFinite(kop3d) || kop3d < MIN_KOP_FOR_DOM)
      && !underTesttroskel) {
    return svar('STOR_SPEND_UTAN_KOP', 'Bränner pengar utan köp — larm',
      `${kr(spend3d)} på 3 dagar men ${Number.isFinite(kop3d) ? kop3d : 'okänt antal'} köp. Det är inte "för lite data" längre — något är fel (produktsidan, priset, lagret?). En människa måste titta.`);
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
  if (Number.isFinite(dagar) && dagar < minDagar) {
    return svar('VANTA_KADENS', 'Vänta — ändrad för nyligen',
      `Budgeten ändrades för ${dagar} ${dagar === 1 ? 'dag' : 'dagar'} sedan. Nästa ändring tidigast efter ${minDagar} ${minDagar === 1 ? 'dag' : 'dagar'}.`,
      { vinstProcent: vinst });
  }

  const avstand = avstandTillGrans(vinst);
  const naraGrans = avstand !== null && avstand < NARA_GRANS_PP;
  const gransText = naraGrans
    ? ` ⚠ Ligger ${avstand.toFixed(1).replace('.', ',')} procentenheter från en zongräns — ROAS för de senaste dygnen kan fortfarande revideras uppåt. Kolla i Ads Manager innan du kör den här.`
    : '';
  const bas = `${pct(vinst)} vinst av omsättningen (ROAS ${rad.roas3d.toFixed(2).replace('.', ',')} mot break-even ${breakEven.toFixed(2).replace('.', ',')}).`;

  // 5. Förlust.
  if (vinst < 0) {
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
      return svar('ATGARDSTRAPPAN', 'Gå åtgärdstrappan',
        `${bas} Passerad ${kr(TEST_TROSKEL_SEK)} utan att gå plus. Stäng INTE av produkten direkt: först den enskilda annonsen som ätit budgeten, vänta ett dygn, sen annonsgruppen, sist hela produkten.${gransText}`,
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

  // 7. 16-25 %: låt vara. Det här är läget vi vill ha de flesta produkter i.
  if (vinst < ZON_SKALA_OVER) {
    return svar('LAT_VARA', 'Låt vara',
      `${bas} Mellan ${ZON_SANK_UNDER} och ${ZON_SKALA_OVER} % rör vi ingenting. Nästa koll om ${MIN_DAGAR_MELLAN_ANDRINGAR} dagar.`,
      { zon: 'hold', vinstProcent: vinst });
  }

  // 8. Över 25 %: skala.
  if (rad.budget >= TAK_SEK) {
    return svar('LAT_VARA', 'Låt vara — taket nått',
      `${bas} Går bra, men ${kr(TAK_SEK)} per dag är taket. Vi skalar inte högre.`,
      { zon: 'hold', vinstProcent: vinst });
  }
  const upp = nyBudget('upp', rad.budget);
  if (upp <= rad.budget) {
    return svar('LAT_VARA', 'Låt vara — taket nått',
      `${bas} En höjning på 20 % skulle passera taket ${kr(TAK_SEK)}.`,
      { zon: 'hold', vinstProcent: vinst });
  }
  const nastaKoll = snabbspar
    ? 'Snabbspår: ROAS över 3 — kan höjas igen redan imorgon.'
    : `Nästa koll om ${MIN_DAGAR_MELLAN_ANDRINGAR} dagar.`;
  return svar('SKALA', 'Skala upp 20 %',
    `${bas} Ändra från ${kr(rad.budget)} till ${kr(upp)} per dag. ${nastaKoll}${gransText}`,
    { zon: 'up', vinstProcent: vinst, nyBudget: upp, kraverGodkannande: true, naraGrans });
}
