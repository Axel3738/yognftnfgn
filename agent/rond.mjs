#!/usr/bin/env node
// Dagens rond. Läser kontodata som /rond hämtat ur Meta, kör beslutsmotorn
// och skriver en rapport. Ändrar ALDRIG något i Meta — den föreslår.
//
//   node agent/rond.mjs [--data agent/kontodata.json] [--json] [--idag 2026-08-28]
//
// Exitkoder: 0 = klart · 2 = vägrade köra (fel konto eller tom data)

import { readFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { besked, breakEvenRoas, GOLV_SEK as GOLV_SEK_PLAN, kostnadSek, lasBelopp, lasBreakEven, nyBudget, surfBesked, targetRoas } from './besked.mjs';
import { backDagarIRad, dagarSedanAndring, lasLogg, raknaTrasigaRader, senasteRadMedKod } from './logg.mjs';
import { brieftak, harLevandeVinnare, mix, vidarebyggBehov } from './lardom.mjs';
import { cpaStiger, cpaText, dagarOver, klickandel, CPA_STIG_DAGAR } from './trend.mjs';

const HÄR = dirname(fileURLToPath(import.meta.url));

// Bäverbutikens konton — de enda ronden får röra, ett per marknad. Alla ligger
// under business MagiBorsten. Grillkliniken (SnarkLös 1346450049878358) och
// Matstrumpor.se är ANDRA verksamheter och får aldrig in på listan, hur likt
// ett kontonamn än ser ut. Se CLAUDE.md.
export const TILLATNA_KONTON = {
  '1867947880635861': { namn: 'MagiBorsten', marknad: 'SE' },
  '1050941584152547': { namn: 'Magiborsten NO', marknad: 'NO' },
};

// Kvar för bakåtkompatibilitet: koden och testerna som bara känner till Sverige.
export const TILLATET_KONTO = '1867947880635861';
export const TILLATET_KONTONAMN = 'MagiBorsten';

// Utanför det här spannet är ROAS-talet inte att lita på.
export const ROAS_RIMLIGT_MIN = 0;
export const ROAS_RIMLIGT_MAX = 15;

// Samma sak för dagsbudgeten. Ett tal under 100 eller över taket här är med
// all sannolikhet en felparsning (öre lästa som kronor eller tvärtom) — ingen
// dom, larm i stället. Rimlighetstaket var 10 000 till 2026-09-19 och 50 000
// till 2026-09-22; granskningen samma dag mätte att 50 000 i praktiken var
// ett tak (en SKALA 45 000 → 54 000 sköts upp tyst som "ogiltigt belopp"),
// mot Axels "inget tak" och Evolves 100k-dagar. Nu 200 000: ett öre/kronor-
// fel är ×100, så varje budget över 2 000 kr fångas fortfarande. ANTAGANDE —
// nivån är Axels att sätta.
export const BUDGET_RIMLIG_MIN = 100;
export const BUDGET_RIMLIG_MAX = 200000;

// Kontodatan får vara högst så här gammal när en plan byggs.
export const MAX_DATAALDER_TIMMAR = 20;

export function kontrolleraKonto(data) {
  const fel = [];
  const konto = String(data?.ad_account_id ?? '').replace(/^act_/, '');
  const tillaten = TILLATNA_KONTON[konto];
  if (!tillaten) {
    const lista = Object.entries(TILLATNA_KONTON)
      .map(([id, k]) => `${k.namn} ${id} (${k.marknad})`).join(', ');
    fel.push(`Fel annonskonto: "${data?.ad_account_id}". Ronden kör bara mot ${lista}.`);
  }
  const namn = String(data?.ad_account_namn ?? '');
  // Namnkollen är andra låset: ett id kan vara rätt i filen och fel i verkligheten.
  // Alla Bäverkonton heter något med "magiborsten" — SnarkLös gör det inte.
  if (namn && !namn.toLowerCase().includes('magiborsten')) {
    fel.push(`Kontonamnet är "${namn}", förväntat ett MagiBorsten-konto. Avbryter hellre än gissar.`);
  }
  if (tillaten && namn && !namn.toLowerCase().includes(tillaten.namn.toLowerCase())) {
    fel.push(`Kontonamnet "${namn}" matchar inte id ${konto} (${tillaten.namn}). Avbryter hellre än gissar.`);
  }
  if (!Array.isArray(data?.kampanjer) || data.kampanjer.length === 0) {
    fel.push('Noll kampanjer i datan. Hellre stopp än en rapport byggd på ingenting.');
  }
  if (!data?.hamtad) {
    fel.push('Datan saknar tidsstämpel (hamtad) — går inte att avgöra hur färsk den är.');
  }
  return fel;
}

/**
 * Attributionen ska vara klickbaserad (Axels beslut 2026-09-20, mätt samma dag:
 * Fiskespöhållaren visade ROAS 2,01 med visningar inräknade och 1,64 på klick —
 * 18,6 % — mot break-even 1,50). Kontodata utan `attribution: "7d_click"` ger en
 * varning, ingen avbruten rond: gamla filer och gamla körningar ska gå att läsa.
 */
export const KRAVD_ATTRIBUTION = '7d_click';
export function attributionsvarning(data) {
  const a = String(data?.attribution ?? '');
  if (a === KRAVD_ATTRIBUTION) return null;
  return a
    ? `Kontodatan är hämtad med attribution "${a}", inte "${KRAVD_ATTRIBUTION}" — ROAS kan vara uppblåst av visningsköp.`
    : `Kontodatan saknar fältet attribution — hämta med action_attribution_windows ["${KRAVD_ATTRIBUTION}"] så ROAS räknas på klick.`;
}

/**
 * Visningsköpsvarningen (Axels beslut 2026-09-21).
 *
 * Kontonivån är lugn — mätt 30 dygn 2026-08-22 → 2026-09-20 är svenska kontot
 * uppblåst 2,8 % och det norska 0,0 %. Det är SPRIDNINGEN som betyder något:
 * samma mätning gav Vandringskängor 22 %, Skoreparationslapparna 10,8 %,
 * IBC 7,5 %, Övervakningskameran 6,9 %, Båtmotorskyddet 6,0 %. Vandringskängor
 * låg på 1,61 med visningsköp och 1,32 utan, mot break-even 1,60 — domen vänder.
 *
 * Varningen fälls när visningsandelen är över VISNING_LARM_ANDEL OCH kampanjen
 * ligger i den farliga zonen kring break-even. Det är den enda zonen där felet
 * kan vända en dom; en kampanj på ROAS 4 med 20 % visningsköp byter inte
 * beslut av det.
 *
 * ⚠️ Zonen mäts på BÅDA talen, inte bara på klick-ROAS. Axels formulering
 * 2026-09-21 var "inom 15 procent från break-even", och läst på klick-ROAS
 * ensamt missar den hans eget exempel: Vandringskängor låg 17,5 % under
 * break-even på klick men 0,6 % från den med visningsköp inräknade. Det är
 * just det som gör kampanjen farlig — den SER ut att ligga på break-even i
 * Ads Manager. Därför: varning om något av talen ligger inom marginalen,
 * och alltid när de står på var sin sida om break-even.
 *
 * Ren funktion. `roas3dVisning` kommer ur kontodatan (`value`-nyckeln i Metas
 * svar) och `roas3d` ur `7d_click`. Saknas visningstalet returneras null —
 * ingen varning, aldrig en gissning.
 */
export const VISNING_LARM_ANDEL = 0.05;
export const VISNING_LARM_MARGINAL = 0.15;
export function visningsvarning(rad) {
  const klick = lasBelopp(rad?.roas3d);
  const medVisning = lasBelopp(rad?.roas3dVisning);
  const be = Number.isFinite(rad?.breakEven) && rad.breakEven > 0 ? rad.breakEven : null;
  if (!Number.isFinite(klick) || klick <= 0 || !Number.isFinite(medVisning) || medVisning <= 0 || be === null) return null;
  const andel = medVisning / klick - 1;
  if (!(andel > VISNING_LARM_ANDEL)) return null;
  const vander = medVisning >= be && klick < be;
  const avstandKlick = Math.abs(klick / be - 1);
  const avstandVisning = Math.abs(medVisning / be - 1);
  const avstand = Math.min(avstandKlick, avstandVisning);
  if (!vander && !(avstand < VISNING_LARM_MARGINAL)) return null;
  const p = (x) => `${(x * 100).toFixed(1).replace('.', ',')} %`;
  const d = (x) => x.toFixed(2).replace('.', ',');
  return {
    kampanj_id: rad.id ?? null,
    namn: rad.namn ?? null,
    andel,
    avstand,
    vander,
    text: `${rad.namn ?? 'okänd kampanj'}: ${p(andel)} av ROAS:en kommer från visningsköp. Med visningsköp ${d(medVisning)}, på bara klick ${d(klick)}, break-even ${d(be)} — närmast ${p(avstand)} ifrån.${vander ? ' ⚠ DOMEN VÄNDER: över break-even med visningsköp, under utan. Läs klicksiffran.' : ' Domen står sig åt samma håll, men marginalen är för tunn för att lita på siffran.'}`,
  };
}

/** Alla visningsköpsvarningar i en rondomgång, värst först. */
export function visningsvarningar(rader) {
  return rader
    .map((r) => visningsvarning({ ...r, breakEven: r.dom?.breakEven ?? r.breakEven }))
    .filter(Boolean)
    .sort((a, b) => (a.vander === b.vander ? b.andel - a.andel : a.vander ? -1 : 1));
}

/**
 * Break-even för en kampanj, i tur och ordning:
 * 1. räknat ur kostnadsblocket i produktkarta.json (pris och kostnad per order)
 * 2. ett fast tal i produktkarta.json
 * 3. talet i kampanjnamnet
 */
export function breakEvenForPost(post, kampanjnamn, fx) {
  if (post?.kostnad) {
    const kostnad = kostnadSek(post.kostnad, fx);
    const be = breakEvenRoas(Number(post.kostnad.pris_sek), kostnad);
    if (Number.isFinite(be)) {
      return { be, kalla: post.kostnad.kalla || 'uträknad ur produktkarta.json' };
    }
  }
  if (Number.isFinite(post?.break_even_roas) && post.break_even_roas > 1) {
    return { be: post.break_even_roas, kalla: post.break_even_kalla || 'produktkarta.json' };
  }
  const ur = lasBreakEven(kampanjnamn);
  return { be: ur.be, kalla: ur.kalla };
}

export function bedomKampanj(kampanj, { logg, idag, karta, fx }) {
  const post = karta?.[kampanj.id] ?? {};
  const budget = lasBelopp(kampanj.daily_budget);
  const spend3d = lasBelopp(kampanj.spend_3d);
  const spendTotal = lasBelopp(kampanj.spend_total);
  // Livstids-ROAS: spärren mot att stänga av en kampanj som gått plus totalt.
  const roasTotal = lasBelopp(kampanj.roas_total);
  const roas3d = lasBelopp(kampanj.roas_3d);
  // ROAS med visningsköp inräknade (`value`-nyckeln). Valfritt fält — bara
  // visningsköpsvarningen använder det, och domen räknas ALDRIG på det.
  const roas3dVisning = lasBelopp(kampanj.roas_3d_visning);
  const kop3d = lasBelopp(kampanj.kop_3d);

  const grund = {
    id: kampanj.id,
    namn: kampanj.namn,
    lage: post.lage === 'drift' ? 'drift' : 'test',
    budget,
    spend3d,
    spendTotal,
    roas3d,
    roas3dVisning,
    kop3d,
    roasTotal,
    // Briefpaus: budgeten sköts som vanligt, men produkten får inga nya
    // briefer förrän datumet passerat. Skilt från `frys_till`, som lyfter
    // bort händerna helt. Axels besked 2026-09-15 om Övervakningskameran:
    // "vi låter den köra lite och så men inga nya grejer på ett tag".
    briefPausTill: post.brief_paus_till ?? null,
  };

  // Fryst på Axels order: rörs inte alls till och med frys_till-datumet.
  // Används när siffrorna ljuger av yttre skäl (spärrat kort, prishöjning på
  // väg, retroaktivt ändrad break-even) — reglerna ska inte straffa en produkt
  // för något som inte är annonsernas fel.
  if (post.frys_till && String(idag) <= String(post.frys_till)) {
    const urNamn = lasBreakEven(kampanj.namn);
    return {
      ...grund,
      dom: {
        kod: 'FRYST', rubrik: `Fryst t.o.m. ${post.frys_till}`,
        motivering: post.frys_motivering || 'Fryst på Axels order.',
        nyBudget: null, zon: null, vinstProcent: null,
        breakEven: urNamn.be, breakEvenKalla: urNamn.kalla,
        kraverGodkannande: false, naraGrans: false,
      },
    };
  }

  if (budget !== null && (budget < BUDGET_RIMLIG_MIN || budget > BUDGET_RIMLIG_MAX)) {
    const urNamn = lasBreakEven(kampanj.namn);
    return {
      ...grund,
      dom: {
        kod: 'ORIMLIG_DATA',
        rubrik: 'Budgeten ser fel ut',
        motivering: `Dagsbudget ${budget} kr ligger utanför ${BUDGET_RIMLIG_MIN}–${BUDGET_RIMLIG_MAX} kr — troligen en felparsning (öre/kronor). Ingen dom fälls; kontrollera i Ads Manager.`,
        nyBudget: null, zon: null, vinstProcent: null,
        breakEven: urNamn.be, breakEvenKalla: urNamn.kalla,
        kraverGodkannande: false, naraGrans: false,
      },
    };
  }

  if (roas3d !== null && (roas3d < ROAS_RIMLIGT_MIN || roas3d > ROAS_RIMLIGT_MAX)) {
    return {
      ...grund,
      dom: {
        kod: 'ORIMLIG_DATA',
        rubrik: 'Siffran ser fel ut',
        motivering: `ROAS ${roas3d} ligger utanför ${ROAS_RIMLIGT_MIN}–${ROAS_RIMLIGT_MAX}. Ingen dom fälls — kontrollera i Ads Manager.`,
        nyBudget: null,
        zon: null,
        vinstProcent: null,
        breakEven: lasBreakEven(kampanj.namn).be,
        breakEvenKalla: lasBreakEven(kampanj.namn).kalla,
        kraverGodkannande: false,
      },
    };
  }

  const källa = breakEvenForPost(post, kampanj.namn, fx);

  // Hälsomåttet och de nya spärrarna (Axels beslut 2026-09-22) räknas ur
  // dygnsserien, alltid TILL OCH MED GÅRDAGEN — dagens dygn är ofullständigt
  // (Taköverdraget 22/9 visade 672 kr CPA på ett halvt dygn) och får aldrig
  // avgöra en trend. `target_roas` i produktkartan är produktens eget
  // skalningsmått; saknas det härleder besked() ett ur break-even.
  const igar = dagenFore(idag);
  const target = Number.isFinite(post.target_roas) ? post.target_roas : null;
  const cpa = cpaStiger(kampanj.dygn, { tillOchMed: igar });
  const klick = klickandel(kampanj.dygn, { n: 3, tillOchMed: igar }) ?? klickandelUrKampanj(kampanj);
  const malRoas = targetRoas(källa.be, target).target;
  const overTarget = dagarOver(kampanj.dygn, malRoas, { tillOchMed: igar });

  return {
    ...grund,
    targetRoas: target,
    cpaTrend: cpa,
    klickandel: klick,
    dagarOverTarget: overTarget,
    dom: besked({
      namn: kampanj.namn,
      lage: grund.lage,
      breakEven: källa.be,
      breakEvenKalla: källa.kalla,
      targetRoas: target,
      roas3d,
      spend3d,
      kop3d,
      spendTotal,
      roasTotal,
      budget,
      dagarSedanAndring: dagarSedanAndring(logg, kampanj.id, idag),
      senasteAndringKod: senasteRadMedKod(logg, kampanj.id, ['SKALA', 'SANK', 'HALVERA'])?.kod ?? null,
      backDagarIRad: backDagarIRad(kampanj.dygn, källa.be),
      // Spärr 1 (Axel 2026-09-21): motorn får bara skala över 4 000 kr om
      // kampanjen bär en etiketterad BREAKTHROUGH eller SPEND_WINNER inom
      // 28 dygn. Räknas HÄR, ur budgetloggen — besked.mjs är ren räkning och
      // läser aldrig en fil.
      harVinnare: harLevandeVinnare(logg, kampanj.id, { idag }),
      cpaStiger: cpa,
      klickandel: klick,
      dagarOverTarget: overTarget,
    }),
  };
}

/** Gårdagen som YYYY-MM-DD. */
export function dagenFore(idag) {
  const t = Date.parse(`${idag}T00:00:00Z`);
  return Number.isFinite(t) ? new Date(t - 86400000).toISOString().slice(0, 10) : null;
}

/**
 * Klickandelen ur kampanjfälten när dygnsserien saknar visningstal:
 * `kop_3d` (7d_click) mot `kop_3d_visning` (1d_view). Null utan visningstal.
 */
export function klickandelUrKampanj(kampanj) {
  const klick = lasBelopp(kampanj?.kop_3d);
  const visning = lasBelopp(kampanj?.kop_3d_visning);
  if (!Number.isFinite(klick) || !Number.isFinite(visning) || klick + visning <= 0) return null;
  return { andel: klick / (klick + visning), klick, visning, dygn: 3 };
}

/**
 * Surf-läget (Axels beslut 2026-09-22): samma kampanjrad, men domen fälls på
 * DAGENS fönster (spend_idag, roas_idag, kop_idag, spend_igar i kontodatan)
 * och bara för kampanjer Axel listat i agent/surf.json. Aldrig automatiskt.
 */
export function bedomSurf(kampanj, { logg, idag, karta, fx, surf }) {
  const post = karta?.[kampanj.id] ?? {};
  const källa = breakEvenForPost(post, kampanj.namn, fx);
  const igar = dagenFore(idag);
  const resetIdag = logg.some((r) => r.kampanj_id === kampanj.id && r.kod === 'SURF_RESET' && r.genomford === true && r.datum === idag);
  const rad = {
    id: kampanj.id, namn: kampanj.namn, lage: post.lage === 'drift' ? 'drift' : 'test',
    budget: lasBelopp(kampanj.daily_budget), spendIdag: lasBelopp(kampanj.spend_idag), roasIdag: lasBelopp(kampanj.roas_idag),
    kopIdag: lasBelopp(kampanj.kop_idag), spendIgar: lasBelopp(kampanj.spend_igar), surf: true,
  };
  return {
    ...rad,
    dom: surfBesked({
      ...rad, breakEven: källa.be, targetRoas: Number.isFinite(post.target_roas) ? post.target_roas : null,
      efterMidnatt: surf.efterMidnatt === true && !resetIdag,
      cpaStiger: cpaStiger(kampanj.dygn, { tillOchMed: igar }),
    }),
  };
}

/**
 * Bygger den exakta åtgärdslistan för autoläget (/rond-auto).
 *
 * Talen här är de enda som får skickas till Meta — Claude räknar aldrig om dem.
 * Budget anges i BÅDE kronor och öre eftersom Metas API tar öre
 * (1 200 kr = 120000). Skickas kronorna rakt in blir budgeten 100x för låg;
 * skickas öre där kronor väntas blir den 100x för hög.
 *
 * Försiktighetsregeln nära zongräns (ROAS revideras uppåt i efterhand):
 * ett besked som ligger inom NARA_GRANS_PP från en gräns mildras ett steg —
 * HALVERA blir SANK, och SKALA/SANK/STANG_AV/ATGARDSTRAPPAN skjuts upp till
 * nästa körning. Är signalen äkta står den kvar om tre dagar med mognare data.
 */
export function planera(rader, { logg = [], idag = null } = {}) {
  const atgarder = [];
  const uppskjutna = [];

  // Antal UPPSKJUTEN_GRANS i rad (senaste raderna) per kampanj: efter tre
  // uppskjutningar har signalen stått i 3+ dagar — attributionsargumentet är
  // förbrukat och åtgärden körs ändå.
  const uppskjutnaIRad = (id) => {
    const egna = logg
      .filter((r) => r.kampanj_id === id && r.kod !== 'NAMNBYTE')
      .sort((a, b) => (a.datum < b.datum ? 1 : -1));
    const dagar = new Set();
    for (const r of egna) {
      if (r.kod === 'UPPSKJUTEN_GRANS') dagar.add(r.datum); // unika DAGAR — två körningar samma dag är en uppskjutning
      else break;
    }
    return dagar.size;
  };

  // Redan ändrad idag (dubbelkörning, kraschad körning som hann skriva)?
  const andradIdag = (id) => idag !== null && logg.some(
    (r) => r.kampanj_id === id && r.genomford === true && r.datum === idag
      && ['SKALA', 'SANK', 'HALVERA', 'MANUELL_SANK', 'STANG_AV', 'TRAPPA_STEG_1', 'TRAPPA_STEG_2', 'TRAPPA_STEG_3'].includes(r.kod),
  );

  for (const r of rader) {
    const d = r.dom;
    if (!d.kraverGodkannande) continue;

    const grund = { kampanj_id: r.id, namn: r.namn, kod: d.kod, motivering: d.motivering };

    if (andradIdag(r.id)) {
      uppskjutna.push({ ...grund, orsak: 'redan ändrad idag — en ändring per dygn' });
      continue;
    }

    // MANUELL_SANK skjuts aldrig upp på zongränsen: −20 % är redan den mjuka
    // formen, och i den zonen kostar ett dygn under break-even mer än en testbudget.
    if (d.naraGrans && d.kod !== 'MANUELL_SANK' && uppskjutnaIRad(r.id) < 3) {
      if (d.kod === 'HALVERA') {
        const ner = nyBudget('ner', r.budget);
        if (Number.isFinite(ner) && ner < r.budget) {
          atgarder.push({
            ...grund, typ: 'budget', kod: 'SANK',
            fran_sek: r.budget, till_sek: ner, till_ore: Math.round(ner * 100),
            mildrad: 'HALVERA mildrad till SANK: beskedet ligger nära en zongräns och ROAS kan revideras uppåt. Står förlusten kvar nästa körning halveras den då.',
          });
        } else {
          uppskjutna.push({ ...grund, orsak: 'nära zongräns och redan på golvet' });
        }
      } else {
        uppskjutna.push({ ...grund, orsak: 'nära zongräns — omprövas nästa körning med mognare data' });
      }
      continue;
    }

    if (['SKALA', 'SANK', 'HALVERA', 'SURF_DUBBLA', 'SURF_SANK', 'SURF_RESET'].includes(d.kod)) {
      // Sista ledet före API:t: beloppet MÅSTE vara ett vettigt tal. Inget
      // motortak längre (Axel 2026-09-22) — bara felparsningsspärren.
      // Ett öre/kronor-fel är ×100; inget legitimt steg är mer än ×2 (trappan)
      // eller en surf-reset uppåt. Över ×10 av nuvarande budget är det
      // enhetsfelet, oavsett rimlighetstaket.
      if (!Number.isFinite(d.nyBudget) || d.nyBudget < GOLV_SEK_PLAN || d.nyBudget > BUDGET_RIMLIG_MAX
          || d.nyBudget === r.budget || (Number.isFinite(r.budget) && r.budget > 0 && d.nyBudget > r.budget * 10)) {
        uppskjutna.push({ ...grund, orsak: `ogiltigt belopp (${d.nyBudget}) — utförs inte` });
        continue;
      }
      // SURF_RESET är en nollställning, inte en höjning: går den uppåt
      // (budgeten sänkt under halva gårdagens spend) förklaras hela steget
      // för kontospärren, annars kasserades hela surfplanen (granskningen
      // 2026-09-22).
      const resetFaktor = d.kod === 'SURF_RESET' && d.nyBudget > r.budget ? d.nyBudget / r.budget : null;
      atgarder.push({
        ...grund, typ: 'budget',
        fran_sek: r.budget, till_sek: d.nyBudget, till_ore: Math.round(d.nyBudget * 100),
        ...(Number.isFinite(d.faktor) && d.faktor > 1.2 ? { faktor: d.faktor } : {}),
        ...(resetFaktor && resetFaktor > 1.2 ? { faktor: resetFaktor, reset: true } : {}),
        ...(d.raket ? { raket: true, faktor: 1.8 } : {}),
      });
    } else if (d.kod === 'MANUELL_SANK') {
      // Historisk kod (manuella zonen 2026-09-20–22) — besked() fäller den
      // inte längre, men en gammal rondfil ska gå att planera. Aldrig över
      // gamla budgeten, aldrig utanför rimlighetsspannet.
      if (!Number.isFinite(d.nyBudget) || d.nyBudget < GOLV_SEK_PLAN || d.nyBudget >= r.budget
          || d.nyBudget > BUDGET_RIMLIG_MAX) {
        uppskjutna.push({ ...grund, orsak: `ogiltigt belopp (${d.nyBudget}) — utförs inte` });
        continue;
      }
      atgarder.push({
        ...grund, typ: 'budget', larm: true,
        fran_sek: r.budget, till_sek: d.nyBudget, till_ore: Math.round(d.nyBudget * 100),
      });
    } else if (d.kod === 'STANG_AV') {
      atgarder.push({ ...grund, typ: 'paus_kampanj' });
    } else if (d.kod === 'ATGARDSTRAPPAN') {
      atgarder.push({ ...grund, typ: 'trappa' });
    }
  }

  // Kontospärren: summan av dagsbudgetarna får aldrig stiga mer än 20 % på en
  // körning — PLUS det som en dom med större faktor uttryckligen förklarar
  // (trappans ×1,5/×2, surf-lägets dubbling; förr raketens ×1,8). Utanför det
  // är en större höjning matematiskt omöjlig — slår spärren till är något
  // trasigt (enhetsfel, dubbelräkning) och HELA planen kasseras. Hellre en dag
  // utan ändringar än en trasig ändring.
  const gammalTotal = rader.reduce((s, r) => s + (Number.isFinite(r.budget) ? r.budget : 0), 0);
  let nyTotal = gammalTotal;
  let stegExtra = 0;
  for (const a of atgarder) {
    if (a.typ !== 'budget') continue;
    nyTotal += a.till_sek - a.fran_sek;
    if (Number.isFinite(a.faktor) && a.faktor > 1.2) stegExtra += Math.max(0, Math.min(a.till_sek - a.fran_sek, a.fran_sek * (a.faktor - 1)) - a.fran_sek * 0.2);
  }
  if (nyTotal > gammalTotal * 1.2 + stegExtra + 1) {
    return {
      sparrad: true,
      orsak: `Kontospärr: planen skulle höja totalbudgeten från ${Math.round(gammalTotal)} till ${Math.round(nyTotal)} kr/dag (mer än +20 % plus de förklarade trappstegens del). Det ska inte kunna hända — hela planen kasseras. Gör inga ändringar och larma Axel.`,
      atgarder: [], uppskjutna, gammalTotal, nyTotal,
    };
  }

  return { sparrad: false, orsak: null, atgarder, uppskjutna, gammalTotal, nyTotal };
}

/**
 * Annons-triggern: flaggar produkter som behöver nya annonser, ur budgetloggen.
 * Axels regel 2026-08-29: "rutinen ska leta efter produkter som inte har fått
 * sin tre dagars brief" — var tredje dag får varje produkt med en batch en ny
 * brief-runda (/cs). Produkter utan batch fångas av forsta_batch-regeln.
 * - forsta_batch: passerat 1 500 kr OCH minst 20 % vinst, ingen batch ännu.
 * - brief_runda: har en batch och senaste *_KLAR-raden är ≥3 dagar gammal.
 *   Fokus (ersätt pausat / mata vinnaren) bakas in i orsaken.
 * - ersatt/mata_vinnare: kvarvarande signaler för produkter utan batch.
 * Flaggan startar ingenting själv — rond-auto steg 4b kör rundorna.
 */
export const BRIEF_INTERVALL_DAGAR = 3;

/**
 * Är kampanjen avstängd just nu, enligt rondens eget minne?
 *
 * Den enda frågan som avgör om en produkt får briefer. Domen räcker inte:
 * dagen EFTER en avstängning får kampanjen ofta en helt annan kod (VANTA_KADENS,
 * FOR_LITE_DATA, LAT_VARA) eftersom budgeten just ändrats eller spenden dött —
 * och då släppte den gamla domkoll-spärren igenom den. Det var precis så
 * Medicinasken i Fickformat och Kasta & Fånga-settet fick 32 briefer och två
 * nya Notion-hubbar den 2026-09-04, samma morgon som ronden stängde av dem.
 *
 * Logiken är enkel: senaste genomförda raden med STANG_AV eller ATERAKTIVERA
 * vinner. Samma datum? Då vinner den som skrevs sist, för loggen är kronologisk.
 */
export function arAvstangd(logg, kampanjId) {
  let senaste = null;
  for (const rad of logg) {
    if (rad.kampanj_id !== kampanjId) continue;
    if (rad.genomford !== true) continue;
    if (rad.kod !== 'STANG_AV' && rad.kod !== 'ATERAKTIVERA') continue;
    if (senaste === null || String(rad.datum) >= String(senaste.datum)) senaste = rad;
  }
  return senaste !== null && senaste.kod === 'STANG_AV';
}

export function annonsbehov(rader, { logg = [], idag = null, marknad = 'SE' } = {}) {
  if (idag === null) return [];
  // Bara Sverige får briefer. Axels besked 2026-09-01: de norska annonserna ÄR
  // de svenska annonserna, översatta i ett eget flöde (/translate-no). Ronden
  // är inne i NO-kontot av ett enda skäl — skala upp och ner. Inga briefer,
  // inga Notion-hubbar, inget produktminne för NO.
  // Utan spärren byggde rutinen två norska hubbar (Fiskestangholder NO
  // 2026-08-31, Kranbeskyttelse Frost NO 2026-09-01) och de åt dessutom tre av
  // sex briefplatser på tre morgnar — svenska produkter fick vänta i stället.
  if (marknad !== 'SE') return [];
  const nu = Date.parse(`${idag}T00:00:00Z`);
  const inom7 = (datum) => {
    const d = (nu - Date.parse(`${datum}T00:00:00Z`)) / 86400000;
    return Number.isFinite(d) && d >= 0 && d <= 7;
  };
  const KLAR = ['FORSTA_BATCH_KLAR', 'CS_BATCH_KLAR', 'VIDAREBYGG_KLAR'];
  const behov = [];
  for (const r of rader) {
    // Fryst = händerna borta helt: datan går inte att lita på (spärrat kort,
    // prishöjning på väg). En brief skriven nu skulle bygga på fel siffror
    // eller fel pris. Gäller alla behovstyper, inte bara rundorna.
    if (r.dom?.kod === 'FRYST') continue;
    // Briefpaus: ägaren har sagt att produkten ska få köra utan nytt material
    // ett tag. Budgetronden rör den som vanligt — bara briefkön hoppar över
    // den. Läses ur `brief_paus_till` i agent/produktkarta.json.
    if (r.briefPausTill && String(idag) <= String(r.briefPausTill)) continue;
    // Aldrig briefer till en produkt som ronden samma morgon stänger av eller
    // skickar till trappan. Axels larm 2026-09-02: Kranskydd Frost 420D var
    // PAUSAD och fick ändå 9 briefer — redigerarna bygger material till en
    // kampanj som inte kör. Domen är sanningen om produkten lever.
    if (r.dom?.kod === 'STANG_AV' || r.dom?.kod === 'ATGARDSTRAPPAN') continue;
    // ...och aldrig till en kampanj som ronden redan HAR stängt av, oavsett
    // vilken kod dagens dom råkar landa på. Domen beskriver dagens siffror,
    // loggen beskriver om kampanjen kör. Bara loggen kan svara på den frågan.
    if (arAvstangd(logg, r.id)) continue;
    const egna = logg.filter((rad) => rad.kampanj_id === r.id && rad.genomford === true);
    const klarRader = egna.filter((rad) => KLAR.includes(rad.kod));
    const harBatch = klarRader.length > 0;
    // Dagar sedan senaste batch — null om ingen batch finns.
    const senasteKlar = klarRader
      .map((rad) => Date.parse(`${rad.datum}T00:00:00Z`))
      .filter(Number.isFinite)
      .sort((a, b) => b - a)[0];
    const dagarSedanBatch = Number.isFinite(senasteKlar)
      ? Math.floor((nu - senasteKlar) / 86400000)
      : null;

    const senaste7 = egna.filter((rad) => inom7(rad.datum));
    // "Pausat material" = enskilda annonser pausade medan kampanjen kör vidare
    // (trappans förlängning). STANG_AV hörde ALDRIG hemma här: en avstängd
    // kampanj ska inte ha ersättningsmaterial, den ska ha ro. Med koden kvar i
    // listan gav varje avstängning ett "ersätt"-behov morgonen efter.
    // TRAPPA_STEG_* är historik från den gamla femdagarstrappan (avskaffad
    // 2026-09-01) och läses fortfarande — TRAPPA_FORLANGNING är dagens kod.
    const pausat = senaste7.some((rad) => ['TRAPPA_FORLANGNING', 'TRAPPA_STEG_1', 'TRAPPA_STEG_2', 'TRAPPA_STEG_3'].includes(rad.kod));
    const skalningar = senaste7.filter((rad) => rad.kod === 'SKALA').length;

    // Vidarebygg (CS-KLART punkt 9): en levande breakthrough får tre iterationer
    // inom 14 dagar från etiketten — samma morgon, utan 3-dagarsklockan, rang 0.
    // Rundan ersätter dagens brief_runda för produkten. Iterationerna räknas ur
    // BRIEF-raderna (parent = annonsen), aldrig ur huvudet.
    const vidare = vidarebyggBehov(logg, r.id, { idag });
    if (vidare.length) {
      const tak = brieftak(logg, r.id, { idag });
      const m = mix(logg, r.id, { idag });
      behov.push({
        kampanj_id: r.id, namn: r.namn, typ: 'vidarebygg',
        breakthroughs: vidare, rundaAntal: Math.min(vidare.reduce((s, v) => s + v.kvar, 0), Math.max(tak.tak_totalt ?? tak.tak, 0)), brieftak: tak, mix: m,
        orsak: `${vidare.map((v) => `${v.annons_namn}: ${v.iterationer} av 3 iterationer, deadline ${v.deadline}${v.forsent ? ' (FÖRSENAD)' : ''}${v.har_lardom ? '' : ' — lärdomen saknas, skriv den först'}`).join('; ')}. Börja i manuslistan: nya hookar → längre problemdel → in media res. Aldrig en ren kopia.${tak.tak === 0 ? ` Brieftak 0 — ${tak.etiketterade_utan_lardom} etiketterade annonser utan lärdom: skriv lärdomarna först (node agent/lardom.mjs --skelett --kampanj ${r.id}).` : ''}`,
      });
      continue;
    }

    if (harBatch) {
      if (dagarSedanBatch !== null && dagarSedanBatch < BRIEF_INTERVALL_DAGAR) continue; // låt batchen landa
      const budgetAntal = rundkvot(r.budget);
      if (budgetAntal === 0) continue; // ingen budget — ingen runda
      // Punkt 8: antalet briefer överstiger aldrig antalet lärdomar vi hunnit
      // skriva sedan förra batchen. Budgeten sätter bara ett övre golv.
      const tak = brieftak(logg, r.id, { idag });
      // Taket + de annonser en lärdom uttryckligen namngett (Axel 2026-09-21):
      // en variant som lärdomen bett om konkurrerar inte om kvoten.
      const rundaAntal = Math.min(budgetAntal, tak.tak_totalt ?? tak.tak);
      const m = mix(logg, r.id, { idag });
      let fokus = '';
      if (pausat) fokus = ' Fokus: ersätt det som pausats i trappan.';
      else if (skalningar >= 2) fokus = ` Fokus: mata vinnaren — skalats ${skalningar} gånger på en vecka.`;
      behov.push({
        kampanj_id: r.id, namn: r.namn, typ: 'brief_runda',
        dagarSedanBatch, rundaAntal, budgetAntal, brieftak: tak, mix: m,
        orsak: rundaAntal === 0
          ? `${dagarSedanBatch} dagar sedan senaste batchen, men 0 lärdomar skrivna sedan dess (${tak.etiketterade_utan_lardom} etiketterade annonser utan lärdom) — inga briefer förrän lärdomarna finns (punkt 8): node agent/lardom.mjs --skelett --kampanj ${r.id}.${fokus}`
          : `${dagarSedanBatch} dagar sedan senaste batchen — dags för 3-dagarsrundan (${rundaAntal} annonser via /cs; budgeten hade gett ${budgetAntal}, lärdomarna sedan förra batchen ${tak.tak}${tak.namngivna?.length ? ` + ${tak.namngivna.length} namngivna i lärdomarna: ${tak.namngivna.join(', ')}` : ''}). Mix ${Math.round(m.vidarebyggen * 100)} % vidarebyggen / ${Math.round(m.nya * 100)} % nya vinklar (${m.skal}).${fokus}`,
      });
      continue;
    }

    // Axels regel 2026-08-31: CS-processen startar först när produkten klarar
    // testet ORDENTLIGT — passerat 1 500 kr OCH minst 20 % vinst av
    // omsättningen. Under 20 % får den chilla och prövas om nästa dag.
    //
    // Regeln hette tidigare bara "på/över break-even". Det var för trubbigt:
    // Plyschtofflorna låg 2,4 % över break-even och fick samma dom som en
    // produkt på 35 %, så en full batch på 12 briefer byggdes för en produkt
    // ronden samma morgon kallade "tunn marginal, se över priset".
    // Okänd vinst passerade också, eftersom villkoret bara var "vet inte att
    // den går back". Nu krävs ett tal, och talet ska hålla.
    const vinst = r.dom?.vinstProcent;
    if (Number.isFinite(r.spendTotal) && r.spendTotal >= FORSTA_BATCH_SPEND_SEK
        && Number.isFinite(vinst) && vinst >= FORSTA_BATCH_VINST_PROCENT) {
      behov.push({
        kampanj_id: r.id, namn: r.namn, typ: 'forsta_batch',
        vinstProcent: vinst,
        orsak: `har klarat testet (${Math.round(r.spendTotal).toLocaleString('sv-SE')} kr spenderat, ${vinst.toFixed(1).replace('.', ',')} % vinst) utan en riktig batch — dags för /forsta-batch`,
      });
      continue;
    }

    if (pausat) {
      behov.push({ kampanj_id: r.id, namn: r.namn, typ: 'ersatt', orsak: 'annonser pausades i trappan senaste veckan medan kampanjen kör vidare — ersätt materialet' });
    } else if (skalningar >= 2) {
      behov.push({ kampanj_id: r.id, namn: r.namn, typ: 'mata_vinnare', orsak: `skalats ${skalningar} gånger på en vecka — mata vinnaren med mer material innan tröttheten kommer` });
    }
  }
  // Vidarebyggen och första batchen först, sen brief-rundor (äldst först), sist övriga signaler.
  const RANG = { vidarebygg: 0, forsta_batch: 0, brief_runda: 1, ersatt: 2, mata_vinnare: 2 };
  return behov.sort((a, b) => {
    if (RANG[a.typ] !== RANG[b.typ]) return RANG[a.typ] - RANG[b.typ];
    if (a.typ === 'brief_runda' && b.typ === 'brief_runda'
        && a.dagarSedanBatch !== b.dagarSedanBatch) {
      return b.dagarSedanBatch - a.dagarSedanBatch;
    }
    return (b_spend(rader, b) - b_spend(rader, a));
  });
}

/**
 * Storleken på en 3-dagarsrunda. Axels beslut 2026-09-02: "jag tar hellre
 * några briefs för mycket, jag har ett överflöd av redigerare". Rundan är
 * därför dubbla veckokvoten, aldrig under fyra — och minst två tredjedelar
 * video (rond-auto 4b). Förr var den halva veckokvoten (1–2 annonser), vilket
 * lämnade redigerarna utan jobb.
 */
export const RUNDA_MINST = 4;
export function rundkvot(budgetSek) {
  const vecka = annonskvot(budgetSek).antal;
  return vecka === 0 ? 0 : Math.max(RUNDA_MINST, vecka * 2);
}

function b_spend(rader, behovsrad) {
  const r = rader.find((x) => x.id === behovsrad.kampanj_id);
  return Number.isFinite(r?.spendTotal) ? r.spendTotal : 0;
}

// Axels beslut 2026-08-29 (förtydligat samma dag): testtröskeln. När en
// produkt passerat den OCH ligger över break-even går den test -> skalning,
// och då startar creative-strategy-processen.
export const FORSTA_BATCH_SPEND_SEK = 1500;

/**
 * Vinstkravet för att en testprodukt ska gå vidare till en riktig creative-batch.
 * Axels besked 2026-08-31: "över 20 % i vinst så fortsätter vi med produkten,
 * annars låter vi den bara chilla". Mäts som vinst i procent av omsättningen
 * (`vinstProcent` i besked.mjs), inte som ROAS-marginal.
 */
export const FORSTA_BATCH_VINST_PROCENT = 20;

/**
 * Launchstrukturen — Axels tabell ur Bäverpanelen: hur många nya annonser en
 * produkt ska få per vecka, styrt av dagsbudgeten. Mest variationer, ungefär
 * en ny idé per tre variationer. Jasper klarar 50-70/vecka totalt; blir det
 * plats över ska den gå till FLER PRODUKTER, inte fler annonser på samma.
 */
export function annonskvot(budgetSek) {
  if (!Number.isFinite(budgetSek) || budgetSek <= 0) return { antal: 0, nyaKoncept: 0 };
  if (budgetSek < 750) return { antal: 1, nyaKoncept: 0 };
  if (budgetSek < 1500) return { antal: 2, nyaKoncept: 1 };
  if (budgetSek < 3000) return { antal: 3, nyaKoncept: 1 };
  return { antal: 4, nyaKoncept: 1 };
}

const ORDNING = [
  'STANG_AV', 'ATGARDSTRAPPAN', 'HALVERA', 'MANUELL_SANK', 'SANK', 'SURF_SANK', 'SURF_RESET', 'SKALA', 'SURF_DUBBLA',
  'CPA_STIGER', 'VISNING_AVVAKTA', 'VANTA_KONSEKVENT',
  'STOR_SPEND_UTAN_KOP', 'MANUELL_FORLUST', 'RAKNA_BACKDAGAR', 'ORIMLIG_DATA', 'SAKNAR_BREAK_EVEN',
  'SAKNAR_BUDGET', 'SAKNAR_SPEND_TOTAL', 'VANTA_KADENS', 'VANTA_TROSKEL', 'HOGZON_AVVAKTA',
  'FOR_LITE_DATA', 'FRYST', 'MANUELL', 'SURF_HALL', 'LAT_VARA',
];

/**
 * CPA-trenden överst i rapporten (Axels beslut 2026-09-22): hälsomåttet.
 * Kampanjer där CPA stigit CPA_STIG_DAGAR dygn i rad (höjning stoppad) först,
 * sedan de med två stigningar (nästa dygn avgör). Ren.
 */
export function cpaTrendRader(rader) {
  const ut = [];
  for (const r of rader) {
    const t = r.cpaTrend;
    if (!t || !Number.isFinite(t.dagar) || t.dagar < CPA_STIG_DAGAR - 1) continue;
    ut.push({ kampanj_id: r.id, namn: r.namn, dagar: t.dagar, stiger: t.stiger === true, serie: t.serie, kod: r.dom?.kod ?? null });
  }
  return ut.sort((a, b) => b.dagar - a.dagar);
}

function kr(n) {
  return n === null ? '—' : `${Math.round(n).toLocaleString('sv-SE')} kr`;
}

export function rapport(rader, meta, behov = []) {
  const sorterade = [...rader].sort(
    (a, b) => ORDNING.indexOf(a.dom.kod) - ORDNING.indexOf(b.dom.kod),
  );
  const attGora = sorterade.filter((r) => r.dom.kraverGodkannande);
  const attKolla = sorterade.filter(
    (r) => !r.dom.kraverGodkannande
      && ['STOR_SPEND_UTAN_KOP', 'MANUELL_FORLUST', 'ORIMLIG_DATA', 'SAKNAR_BREAK_EVEN', 'SAKNAR_BUDGET', 'SAKNAR_SPEND_TOTAL', 'RAKNA_BACKDAGAR', 'CPA_STIGER', 'VISNING_AVVAKTA'].includes(r.dom.kod),
  );
  const ifred = sorterade.filter((r) => !attGora.includes(r) && !attKolla.includes(r));

  const ut = [];
  ut.push(`# Dagens rond — ${meta.idag}`);
  ut.push('');
  ut.push(`${TILLATET_KONTONAMN} ${TILLATET_KONTO} · ${rader.length} aktiva kampanjer · data hämtad ${meta.hamtad}${meta.surf ? ' · 🏄 SURF-LÄGE' : ''}`);
  ut.push('');

  // CPA-trenden ÖVERST (Axel 2026-09-22): motorns hälsomått, marknadsoberoende.
  // Stigande CPA tre dygn i rad ⇒ ingen höjning oavsett ROAS; sänks inte.
  const cpa = cpaTrendRader(rader);
  const stoppade = rader.filter((r) => r.dom?.kod === 'CPA_STIGER').length;
  ut.push(`## 🩺 CPA-trend — hälsomåttet (${stoppade} stoppad${stoppade === 1 ? '' : 'e'} höjning${stoppade === 1 ? '' : 'ar'})`);
  ut.push('');
  if (!cpa.length) {
    ut.push(`Ingen kampanj har stigande kostnad per köp ${CPA_STIG_DAGAR - 1}+ dygn i rad (räknat t.o.m. gårdagen, 7d_click).`);
  } else {
    ut.push(`Stigande kostnad per köp ${CPA_STIG_DAGAR} dygn i rad stoppar varje höjning, hur bra ROAS än ser ut. Sänks inte — de går plus. Fixet är nya creatives, inte budget.`);
    ut.push('');
    for (const c of cpa) {
      ut.push(`- ${c.stiger ? '⛔' : '👀'} **${c.namn.split('|')[0].trim()}** — CPA ${cpaText(c.serie)} (${c.dagar} dygn i rad)${c.stiger ? (c.kod === 'CPA_STIGER' ? ' — höjning stoppad i dag' : ' — ingen höjning möjlig; domen avgörs av annat') : ' — ett dygn till och höjningen stoppas'}${c.kod ? ` · dom ${c.kod}` : ''}`);
    }
  }
  ut.push('');

  // Visningsköpsvarningen (Axel 2026-09-21) står FÖRE åtgärderna: den handlar
  // om ifall siffran under en dom går att lita på, inte om domen i sig.
  const visning = visningsvarningar(rader);
  if (visning.length) {
    ut.push(`## ⚠ Visningsköp nära break-even (${visning.length})`);
    ut.push('');
    ut.push('Över 5 % av ROAS:en kommer från folk som bara SÅG annonsen, och klick-ROAS ligger inom 15 % från break-even. Det är den enda zonen där attributionen kan vända en dom.');
    ut.push('');
    for (const v of visning) ut.push(`- ${v.text}`);
    ut.push('');
  }

  if (attGora.length === 0) {
    ut.push('## Inget att göra idag');
    ut.push('');
    ut.push('Ingen kampanj föll ut med ett förslag som kräver ditt godkännande.');
  } else {
    ut.push(`## Att godkänna (${attGora.length})`);
    ut.push('');
    ut.push('| Produkt | Besked | Budget idag | Föreslagen | Varför |');
    ut.push('|---|---|---|---|---|');
    for (const r of attGora) {
      const kort = r.namn.split('|')[0].trim();
      const flagga = r.dom.naraGrans ? ' ⚠' : '';
      ut.push(`| ${kort}${flagga} | **${r.dom.rubrik}** | ${kr(r.budget)} | ${kr(r.dom.nyBudget)} | ${r.dom.motivering} |`);
    }
    const nära = attGora.filter((r) => r.dom.naraGrans).length;
    if (nära > 0) {
      ut.push('');
      ut.push(`⚠ = ${nära} rad(er) ligger nära en zongräns. Kolla siffran i Ads Manager innan du godkänner just den.`);
    }
  }
  ut.push('');

  if (attKolla.length > 0) {
    ut.push(`## Behöver en titt (${attKolla.length})`);
    ut.push('');
    for (const r of attKolla) {
      ut.push(`- **${r.namn.split('|')[0].trim()}** — ${r.dom.rubrik}. ${r.dom.motivering}`);
    }
    ut.push('');
  }

  if (ifred.length > 0) {
    ut.push(`## Lämnas ifred (${ifred.length})`);
    ut.push('');
    for (const r of ifred) {
      const vinst = r.dom.vinstProcent === null
        ? ''
        : ` (${r.dom.vinstProcent.toFixed(1).replace('.', ',')} % vinst)`;
      ut.push(`- ${r.namn.split('|')[0].trim()} — ${r.dom.rubrik}${vinst}`);
    }
    ut.push('');
  }

  if (behov.length > 0) {
    ut.push(`## 🎨 Nya annonser behövs (${behov.length})`);
    ut.push('');
    for (const b of behov) {
      const kommando = b.typ === 'forsta_batch' ? '`/forsta-batch`' : b.typ === 'vidarebygg' ? '`/cs` (vidarebygg, rond-auto 4b)' : b.rundaAntal === 0 ? '`node agent/lardom.mjs --skelett` FÖRST, sedan `/cs`' : '`/cs`';
      const orsak = b.orsak.endsWith('.') ? b.orsak : `${b.orsak}.`;
      ut.push(`- **${b.namn.split('|')[0].trim()}** — ${orsak} Kommando: ${kommando}.`);
    }
    ut.push('');
    const totalVecka = rader.reduce((s2, r) => s2 + annonskvot(r.budget).antal, 0);
    ut.push(`Veckokvot totalt (launchstrukturen): ${totalVecka} annonser över ${rader.length} produkter. Jasper klarar 50–70 — plats över går till FLER produkter.`);
    ut.push('');
  }

  if (meta.varningar?.length) {
    ut.push('## Varningar');
    ut.push('');
    for (const v of meta.varningar) ut.push(`- ${v}`);
    ut.push('');
  }

  ut.push('---');
  ut.push('Ronden ändrar ingenting själv. Svara med vilka rader som ska köras.');
  return ut.join('\n');
}

async function main() {
  const argv = process.argv.slice(2);
  const flagga = (namn, fallback = null) => {
    const i = argv.indexOf(namn);
    return i >= 0 && argv[i + 1] ? argv[i + 1] : fallback;
  };

  const datafil = resolve(flagga('--data', join(HÄR, 'kontodata.json')));
  const data = JSON.parse(await readFile(datafil, 'utf8'));

  const fel = kontrolleraKonto(data);
  if (fel.length > 0) {
    console.error('RONDEN AVBRÖTS:');
    for (const f of fel) console.error(`  - ${f}`);
    process.exit(2);
  }

  // Marknaden avgör om briefkön ska byggas alls — bara SE får briefer.
  const kontoId = String(data.ad_account_id ?? '').replace(/^act_/, '');
  const marknad = TILLATNA_KONTON[kontoId]?.marknad ?? null;

  const idag = flagga('--idag', data.idag);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(idag))) {
    console.error(`RONDEN AVBRÖTS: saknar giltigt datum (fick "${idag}"). Ange --idag YYYY-MM-DD.`);
    process.exit(2);
  }

  // Gammal kontodata ger en plan byggd på gårdagen. Hellre stopp.
  const alderMs = Date.now() - Date.parse(String(data.hamtad));
  if (!Number.isFinite(alderMs)) {
    console.error(`RONDEN AVBRÖTS: "hamtad" (${data.hamtad}) går inte att tolka som tid.`);
    process.exit(2);
  }
  if (alderMs > MAX_DATAALDER_TIMMAR * 3600 * 1000 && !argv.includes('--tillat-gammal')) {
    console.error(`RONDEN AVBRÖTS: kontodatan är ${Math.round(alderMs / 3600000)} timmar gammal (max ${MAX_DATAALDER_TIMMAR}). Hämta ny, eller kör --tillat-gammal för en historisk torrkörning.`);
    process.exit(2);
  }

  let karta = {};
  let fx = null;
  try {
    const rå = JSON.parse(await readFile(join(HÄR, 'produktkarta.json'), 'utf8'));
    for (const post of rå.kampanjer ?? []) karta[post.campaign_id] = post;
    fx = rå.valutakurser ?? null;
  } catch {
    karta = {};
  }

  const logg = await lasLogg();
  const varningar = [];
  const trasiga = await raknaTrasigaRader();
  if (trasiga > 0) varningar.push(`${trasiga} trasig(a) rader i budgetloggen hoppades över.`);
  const attr = attributionsvarning(data);
  if (attr) varningar.push(attr);

  // Surf-läget (Axel 2026-09-22): bara med --surf OCH agent/surf.json aktiv —
  // aldrig av sig själv. Kampanjer utanför listan döms som vanligt.
  const surf = argv.includes('--surf') ? await lasSurf() : null;
  if (argv.includes('--surf') && !(surf?.aktiv === true && Array.isArray(surf.kampanjer) && surf.kampanjer.length > 0)) {
    console.error('RONDEN AVBRÖTS: --surf men agent/surf.json är inte aktiv (kräver aktiv: true OCH minst ett kampanj-id i kampanjer). Surf-läget startas av Axel, aldrig av motorn.');
    process.exit(2);
  }
  const surfKampanjer = new Set((surf?.kampanjer ?? []).map(String));
  const rader = data.kampanjer.map((k) => (surf && surfKampanjer.has(String(k.id))
    ? bedomSurf(k, { logg, idag, karta, fx, surf: { efterMidnatt: efterMidnatt(data, surf) } })
    : bedomKampanj(k, { logg, idag, karta, fx })));
  if (surf) varningar.push(`🏄 Surf-läge på för ${surfKampanjer.size} kampanj(er) (agent/surf.json, startat ${surf.startad ?? 'okänt'} av ${surf.av ?? 'okänd'}). Kadens var sjätte timme; midnattsreset till ${Math.round((surf.reset_andel ?? 0.5) * 100)} % av gårdagens spend.`);
  // Spärrarna (CPA-trend, klickandel, konsekvent) räknas ur dygnsserien. Saknas
  // den, eller saknar den köp/CPA, ska det synas — inte tyst falla tillbaka
  // (granskningen 2026-09-22: fail-open utan ett ord i rapporten).
  for (const v of dygnsvarningar(data.kampanjer)) varningar.push(v);

  for (const r of rader) {
    const anm = karta[r.id]?.anmarkning;
    if (anm) varningar.push(`${r.namn.split('|')[0].trim()}: ${anm}`);
  }

  const utankarta = rader.filter((r) => !karta[r.id]);
  if (utankarta.length > 0) {
    varningar.push(`${utankarta.length} kampanj(er) saknas i produktkarta.json och kördes som testprodukt: ${utankarta.map((r) => r.namn.split('|')[0].trim()).join(', ')}.`);
  }

  const meta = { idag, hamtad: data.hamtad, marknad, varningar, surf: Boolean(surf) };
  if (argv.includes('--json')) {
    const behovslista = annonsbehov(rader, { logg, idag, marknad }).map((b) => {
      const rad = rader.find((r) => r.id === b.kampanj_id);
      return { ...b, veckokvot: annonskvot(rad?.budget) };
    });
    console.log(JSON.stringify({
      meta, rader, plan: planera(rader, { logg, idag }), annonsbehov: behovslista,
      veckokvot: rader.map((r) => ({ kampanj_id: r.id, namn: r.namn, ...annonskvot(r.budget) })),
    }, null, 2));
  } else {
    console.log(rapport(rader, meta, annonsbehov(rader, { logg, idag, marknad })));
  }
}

/**
 * Varningar om dygnsserien: kampanjer utan `dygn`, eller vars dygn saknar
 * `kop`/`cpa` (CPA-trenden) eller `kop_visning` (klickandelen). Ren.
 */
export function dygnsvarningar(kampanjer) {
  const utan = [];
  const utanKop = [];
  const utanVisning = [];
  for (const k of kampanjer ?? []) {
    const namn = String(k.namn ?? k.id).split('|')[0].trim();
    const dygn = Array.isArray(k.dygn) ? k.dygn.filter((d) => d && d.datum) : [];
    if (!dygn.length) { utan.push(namn); continue; }
    if (!dygn.some((d) => d.kop !== undefined && d.kop !== null) && !dygn.some((d) => d.cpa !== undefined && d.cpa !== null)) utanKop.push(namn);
    if (!dygn.some((d) => d.kop_visning !== undefined && d.kop_visning !== null)) utanVisning.push(namn);
  }
  const ut = [];
  if (utan.length) ut.push(`⚠ ${utan.length} kampanj(er) saknar dygnsserie — CPA-trend, klickandel och "konsekvent över target" kan inte räknas, ingen höjning förrän serien finns: ${utan.join(', ')}.`);
  if (utanKop.length) ut.push(`⚠ ${utanKop.length} kampanj(er) har dygn utan kop/cpa — CPA-trenden är blind där: ${utanKop.join(', ')}. Hämta dygnsserien med actions + cost_per_action_type.`);
  if (utanVisning.length) ut.push(`⚠ ${utanVisning.length} kampanj(er) har dygn utan kop_visning — klickandelen kan inte räknas (spärren ≥ 60 % står av): ${utanVisning.join(', ')}. Hämta med action_attribution_windows ["7d_click","1d_view"].`);
  return ut;
}

/** agent/surf.json — Axels strömbrytare för surf-läget. Saknas filen är läget av. */
async function lasSurf() {
  try {
    return JSON.parse(await readFile(join(HÄR, 'surf.json'), 'utf8'));
  } catch {
    return null;
  }
}

/**
 * Första körningen efter annonskontots midnatt? Kontodatan bär `timme`
 * (annonskontots lokala timme vid hämtningen); surf.json `reset_timme` (0–23,
 * standard 0) säger vilken sextimmarskörning som är resetten: den vars timme
 * ligger inom sex timmar efter reset_timme. Saknas `timme` görs ingen reset —
 * hellre ingen reset än en på gissad tid.
 */
export function efterMidnatt(data, surf) {
  // null/undefined/'' = timmen är okänd ⇒ ingen reset. Number(null) är 0,
  // vilket hade fyrat en midnattsreset mitt på dagen (granskningen 2026-09-22).
  if (data?.timme === null || data?.timme === undefined || data?.timme === '') return false;
  const timme = Number(data.timme);
  if (!Number.isFinite(timme)) return false;
  const reset = Number.isFinite(Number(surf?.reset_timme)) ? Number(surf.reset_timme) : 0;
  const diff = ((timme - reset) % 24 + 24) % 24;
  return diff < 6;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((e) => {
    console.error(`RONDEN AVBRÖTS: ${e.message}`);
    process.exit(2);
  });
}
