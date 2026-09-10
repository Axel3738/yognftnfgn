// Skalningsekonomin för en OPS-produkt: break-even och target, räknade från
// grunden ur butikens egna pris och inköp. Ren matematik, noll beroenden.
//
// Ursprung: factory/ekonomi.mjs på grenen claude/skalningskungen-butik-setup-divhii.
// Ändrat här 2026-09-09: momsen får inte längre tyst avgöra linjen (se nedan).
//
// ⚠️ MOMSFRÅGAN ÄR ETT ÖPPET ÄGARBESLUT — factory/BESLUT-VANTAR.md punkt 1.
// Grenarna 09-07 → 09-09 skrev fyra olika svar (1,49 utan moms · 2,11 med ·
// 2,07 · 1,62). Skillnaden är inte kosmetisk: samma pris och samma inköp ger
// break-even-CPA 538 kr utan moms och 378 kr med. Ett kill-beslut kan alltså
// bli motsatt beroende på vilket antagande som råkade gälla.
//
// Därför räknar filen ALLTID BÅDA talen och lämnar aldrig ut ett ensamt.
//   • `utanMoms` och `medMoms` finns alltid, båda fullt räknade.
//   • Antagandet läses ur produktfilens EGET fält `ekonomi.moms_antagen`.
//   • `butik.moms_i_pris` styr butikens PRISVISNING och används ALDRIG här.
//     (Det fältet är true i varje OPS-butiksfil på main, och att låta det
//      styra break-even vore precis det tysta valet regeln finns för.)
//   • Saknas `moms_antagen` blir antagandet `obeslutat`, `breakEvenCpa` blir
//     null, och den som dömer annonser får två linjer i stället för en. En
//     annons mellan linjerna får domen "beror på momsbeslutet" — se
//     factory/skalning.mjs. Ingen gissning, ingen tyst vinnare.
//
// Formlerna (allt per order):
//   brutto   = det kunden betalar = det Meta räknar som purchase value
//   netto    = brutto / (1 + moms)      (utan moms ⇒ netto = brutto)
//   TB       = netto − varukostnad − övriga verifierade rörliga kostnader
//   break-even-CPA  = TB                (allt över TB är förlust)
//   break-even-ROAS = brutto / TB       (samma enhet som Metas purchase_roas)
//   target-CPA      = TB − målvinst,  målvinst = 25 % av NETTOintäkten
//   target-ROAS     = brutto / target-CPA
//
// Kontrollräkning: utan moms ger formeln target = 1 / (1/break_even − 0,25),
// vilket återger Axels COGS-beräkning 2026-08-05 på Bäverbutikens sex
// produkter (motorhöljet 1,63 → 2,75 mot hans 2,74; väggfästet 2,00 → 4,00).
// Formeln är alltså husets egen — det är bara momsen som är obeslutad.
//
// ⚠️ Vad talen INTE innehåller (ingen verifierad siffra finns i repot):
// betalväxelavgifter, returer, tull, appkostnader. Varje sådan kostnad gör
// break-even STRÄNGARE än talet här. Kommer en verifierad siffra: lägg den
// som `ovriga_kostnader_per_order` i produktfilens ekonomiblock.
//
//   node factory/ekonomi.mjs factory/produkter/<id>.yaml [factory/butiker/<id>.yaml]

import { readFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';

const ROT = join(dirname(fileURLToPath(import.meta.url)), '..');

export const STANDARD_MOMS_PROCENT = 25;
export const STANDARD_MALMARGINAL = 0.25; // 25 % nettomarginal = husets target-nivå

/** Texten som ska följa med varje tal ut i en rapport tills Axel beslutat. */
export const MOMS_BESLUT_TEXT =
  'Momsen i break-even är ett öppet ägarbeslut (factory/BESLUT-VANTAR.md punkt 1). '
  + 'Båda linjerna visas. Sätt ekonomi.moms_antagen i produktfilen när Axel svarat.';

const tal = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : null);
const avrunda = (v, decimaler = 2) => {
  const f = 10 ** decimaler;
  return Math.round(v * f) / f;
};

/**
 * En enda linje, räknad med EN given momssats. Intern — utåt lämnas alltid
 * båda linjerna, aldrig en.
 */
function raknaLinje({ brutto, varukostnad, momsProcent, ovriga, malmarginal }) {
  const netto = brutto / (1 + momsProcent / 100);
  const tackningsbidrag = netto - varukostnad - ovriga;

  if (tackningsbidrag <= 0) {
    return {
      brutto: avrunda(brutto),
      netto: avrunda(netto),
      momsProcent,
      varukostnad: avrunda(varukostnad),
      tackningsbidrag: avrunda(tackningsbidrag),
      marginalProcent: 0,
      breakEvenRoas: null,
      breakEvenCpa: null,
      targetRoas: null,
      targetCpa: null,
      // Utan täckningsbidrag finns ingen annonsbudget alls — produkten går
      // inte att marknadsföra lönsamt till det här priset.
      olonsam: true,
    };
  }

  const targetCpa = tackningsbidrag - netto * malmarginal;
  return {
    brutto: avrunda(brutto),
    netto: avrunda(netto),
    momsProcent,
    varukostnad: avrunda(varukostnad),
    tackningsbidrag: avrunda(tackningsbidrag),
    marginalProcent: Math.round((tackningsbidrag / netto) * 100),
    breakEvenRoas: avrunda(brutto / tackningsbidrag),
    breakEvenCpa: Math.round(tackningsbidrag),
    // Klarar produkten inte målmarginalen ens vid noll annonskostnad finns
    // ingen target — säg det rakt ut i stället för att visa ett negativt tal.
    targetRoas: targetCpa > 0 ? avrunda(brutto / targetCpa) : null,
    targetCpa: targetCpa > 0 ? Math.round(targetCpa) : null,
    olonsam: false,
  };
}

/**
 * Räknar skalningsekonomin för en produkt — BÅDA momslinjerna, alltid.
 *
 * @param {object} inpar
 * @param {number} inpar.pris                 styckpriset kunden betalar
 * @param {number} inpar.inkopskostnad        varukostnad per styck, inkl. frakt in
 * @param {boolean|null} [inpar.momsAntagen]  produktfilens `ekonomi.moms_antagen`.
 *                                            true = räkna med moms, false = utan,
 *                                            null/utelämnad = OBESLUTAT (två linjer).
 * @param {number} [inpar.momsProcent=25]     momssatsen om moms antas
 * @param {number} [inpar.aov]                verklig AOV. Utelämnad ⇒ priset används
 * @param {number} [inpar.varukostnadPerOrder] varukostnad per ORDER (flerpack)
 * @param {number} [inpar.ovrigaKostnaderPerOrder=0] verifierade rörliga kostnader
 * @param {number} [inpar.malmarginal=0.25]   målets nettomarginal
 * @returns {object|null} nyckeltalen, eller null när ekonomin inte går att räkna alls
 */
export function raknaEkonomi({
  pris,
  inkopskostnad,
  momsAntagen = null,
  momsProcent = STANDARD_MOMS_PROCENT,
  aov = null,
  varukostnadPerOrder = null,
  ovrigaKostnaderPerOrder = 0,
  malmarginal = STANDARD_MALMARGINAL,
} = {}) {
  const p = tal(pris);
  const kostnad = tal(inkopskostnad);
  if (p === null || kostnad === null || p <= 0 || kostnad < 0) return null;

  // aov 0 eller negativ = "inte satt" (mallen levererar fältet som 0), inte
  // "en order är värd noll kronor".
  const angivenAov = tal(aov) > 0 ? tal(aov) : null;
  const brutto = angivenAov ?? p;

  // Varukostnaden per order. ⚠️ Den går INTE att härleda ur ordervärdet när
  // AOV är ett flerpack: husets paket är rabatterade (−16 till −37 %) och bär
  // dessutom en gratis bonusprodukt, så antalet varor växer snabbare än
  // intäkten. En proportionell skalning underskattar då COGS systematiskt och
  // gör break-even FÖR GENERÖS — exakt åt det håll som låter förlustannonser
  // överleva. Därför gissar vi inte: saknas varukostnad_per_order när AOV
  // avviker från styckpriset vägrar vi räkna.
  const explicitVarukostnad = tal(varukostnadPerOrder);
  const enEnhetPerOrder = angivenAov === null || Math.abs(brutto - p) < 0.005;
  if (explicitVarukostnad === null && !enEnhetPerOrder) {
    return {
      osaker: true,
      antagande: 'obeslutat',
      utanMoms: null,
      medMoms: null,
      antagen: null,
      breakEvenRoas: null,
      breakEvenCpa: null,
      targetRoas: null,
      targetCpa: null,
      brutto: avrunda(brutto),
      varning:
        `ekonomi.aov_sek (${avrunda(brutto)}) skiljer sig från ekonomi.pris (${p}), så ordern innehåller `
        + 'mer än en vara — men ekonomi.varukostnad_per_order saknas. Antalet varor går inte att räkna ut '
        + 'ur ordervärdet när paketen är rabatterade. Sätt varukostnad_per_order ur paketnivåerna i offer.paket.',
    };
  }

  const varukostnad = explicitVarukostnad ?? kostnad;
  const ovriga = tal(ovrigaKostnaderPerOrder) ?? 0;
  const sats = tal(momsProcent) ?? STANDARD_MOMS_PROCENT;
  const gemensamt = { brutto, varukostnad, ovriga, malmarginal };

  const utanMoms = raknaLinje({ ...gemensamt, momsProcent: 0 });
  const medMoms = raknaLinje({ ...gemensamt, momsProcent: sats });

  // Antagandet kommer ur produktfilens eget fält, aldrig ur butikens
  // moms_i_pris och aldrig ur ett minne.
  const antagande = momsAntagen === true ? 'med_moms'
    : momsAntagen === false ? 'utan_moms'
      : 'obeslutat';
  const antagen = antagande === 'med_moms' ? medMoms
    : antagande === 'utan_moms' ? utanMoms
      : null;

  return {
    osaker: false,
    antagande,
    oppetBeslut: antagande === 'obeslutat',
    beslutstext: MOMS_BESLUT_TEXT,
    utanMoms,
    medMoms,
    antagen,
    brutto: avrunda(brutto),
    varukostnad: avrunda(varukostnad),
    olonsam: Boolean(utanMoms.olonsam && medMoms.olonsam),
    // Bekvämlighetsfälten speglar ANTAGANDET. Är det obeslutat är de null —
    // en läsare ska inte kunna råka plocka ett tal utan att se vilket
    // antagande det vilar på.
    breakEvenRoas: antagen?.breakEvenRoas ?? null,
    breakEvenCpa: antagen?.breakEvenCpa ?? null,
    targetRoas: antagen?.targetRoas ?? null,
    targetCpa: antagen?.targetCpa ?? null,
    // Spannet mellan linjerna. Det är det ärliga svaret när beslutet saknas.
    spann: {
      breakEvenCpa: [medMoms.breakEvenCpa, utanMoms.breakEvenCpa],
      breakEvenRoas: [utanMoms.breakEvenRoas, medMoms.breakEvenRoas],
      targetCpa: [medMoms.targetCpa, utanMoms.targetCpa],
    },
  };
}

/** Samma räkning direkt ur en sammanvävd produkt (butikskonfig + produktfil). */
export function ekonomiForProdukt(produkt) {
  const eko = produkt?.ekonomi ?? {};
  return raknaEkonomi({
    pris: eko.pris,
    inkopskostnad: eko.inkopskostnad,
    // ⚠️ ENDAST `moms_antagen`. `moms_i_pris` väver butik.mjs in i samma
    // objekt, men det fältet beskriver prisvisningen i butiken och får aldrig
    // avgöra en kill-linje. Läs kommentaren högst upp innan du ändrar det.
    momsAntagen: typeof eko.moms_antagen === 'boolean' ? eko.moms_antagen : null,
    momsProcent: eko.moms_procent,
    aov: eko.aov_sek,
    varukostnadPerOrder: eko.varukostnad_per_order,
    ovrigaKostnaderPerOrder: eko.ovriga_kostnader_per_order ?? 0,
  });
}

/**
 * Jämför de tal som STÅR i produktfilen med de omräknade. Finns för att
 * ekonomiblocket i YAML:en är läsbart för människor men blir inaktuellt så
 * fort pris, inköp eller AOV ändras — och ingen upptäcker det av sig själv.
 * Returnerar en lista avvikelser (tom = talen stämmer).
 */
export function granskaEkonomiblock(produkt, tolerans = 0.02) {
  const eko = produkt?.ekonomi ?? {};
  const raknat = ekonomiForProdukt(produkt);
  // "Kunde inte granska" får ALDRIG se ut som "granskat och OK" — en tyst tom
  // lista läses som ett godkännande.
  if (!raknat) return ['ekonomiblocket kunde inte granskas — ekonomi.pris eller ekonomi.inkopskostnad saknas'];
  if (raknat.osaker) return [raknat.varning];

  const avvikelser = [];

  // Utan uttryckligt antagande går talen inte att granska — men vi kan säga
  // vilken linje filens tal faktiskt motsvarar, så beslutet blir konkret.
  if (raknat.antagande === 'obeslutat') {
    const angivet = tal(eko.break_even_roas);
    const nara = (a, b) => a !== null && b !== null && Math.abs(a - b) / Math.max(b, 1e-9) <= tolerans;
    const matchar = nara(angivet, raknat.utanMoms.breakEvenRoas) ? 'UTAN moms'
      : nara(angivet, raknat.medMoms.breakEvenRoas) ? 'MED moms'
        : null;
    avvikelser.push(
      'ekonomi.moms_antagen saknas — break-even kan inte granskas mot en linje. '
      + `Utan moms: ROAS ${raknat.utanMoms.breakEvenRoas} / CPA ${raknat.utanMoms.breakEvenCpa} kr. `
      + `Med moms ${raknat.medMoms.momsProcent} %: ROAS ${raknat.medMoms.breakEvenRoas} / CPA ${raknat.medMoms.breakEvenCpa} kr.`
      + (matchar ? ` Filens break_even_roas ${angivet} motsvarar ${matchar}.` : '')
    );
    return avvikelser;
  }

  const par = [
    ['break_even_roas', raknat.antagen.breakEvenRoas],
    ['break_even_cpa_sek', raknat.antagen.breakEvenCpa],
    ['target_roas', raknat.antagen.targetRoas],
    ['target_cpa_sek', raknat.antagen.targetCpa],
  ];
  for (const [falt, vantat] of par) {
    const ravarde = eko[falt];
    const angivet = tal(ravarde);
    if (angivet === null) {
      // Ett fält som finns men inte är ett tal ("2,11" med decimalkomma ur
      // YAML:en) hoppades tidigare över tyst.
      if (ravarde !== undefined && ravarde !== null && ravarde !== '') {
        avvikelser.push(`ekonomi.${falt} är inte ett tal (${JSON.stringify(ravarde)}) — använd decimalpunkt`);
      }
      continue;
    }
    if (vantat === null) continue;
    const skillnad = Math.abs(angivet - vantat) / Math.max(vantat, 1e-9);
    if (skillnad > tolerans) {
      avvikelser.push(`ekonomi.${falt} står som ${angivet} men räknas till ${vantat} (antagande: ${raknat.antagande})`);
    }
  }
  return avvikelser;
}

/** Två rader att skriva ut i vilken rapport som helst. Båda linjerna, alltid. */
export function linjetext(ekonomi) {
  if (!ekonomi) return ['⚠️ Ekonomin går inte att räkna — pris eller inköp saknas i produktfilen.'];
  if (ekonomi.osaker) return [`⚠️ ${ekonomi.varning}`];
  const rad = (namn, l) => `  ${namn.padEnd(16)} break-even ROAS ${l.breakEvenRoas ?? '—'} · CPA ${l.breakEvenCpa ?? '—'} kr   ·   target ROAS ${l.targetRoas ?? '—'} · CPA ${l.targetCpa ?? '—'} kr`;
  const rader = [
    rad('UTAN moms:', ekonomi.utanMoms),
    rad(`MED moms ${ekonomi.medMoms.momsProcent} %:`, ekonomi.medMoms),
  ];
  if (ekonomi.antagande === 'obeslutat') {
    rader.push(`  ⚠️ ANTAGANDE SAKNAS. ${MOMS_BESLUT_TEXT}`);
  } else {
    rader.push(`  Antagande: ${ekonomi.antagande === 'med_moms' ? 'MED moms' : 'UTAN moms'} (ekonomi.moms_antagen i produktfilen) — den linjen gäller för kill-beslut.`);
  }
  return rader;
}

// ------------------------------------------------------------------- CLI

async function huvud() {
  const [produktfil, butiksfil] = process.argv.slice(2);
  if (!produktfil) {
    console.error('Användning: node factory/ekonomi.mjs <produktfil.yaml> [butiksfil.yaml]');
    process.exit(1);
  }
  // Importeras sent: register.mjs importerar den här filen, och en statisk
  // import åt andra hållet hade blivit en cykel.
  const { lasYaml } = await import('./yaml.mjs');
  const { sammanfoga } = await import('./butik.mjs');

  const raProdukt = lasYaml(readFileSync(produktfil, 'utf8'));
  let butik = butiksfil ? lasYaml(readFileSync(butiksfil, 'utf8')) : null;
  if (!butik) {
    // Utan butiksfil: slå upp butiken i registret. Butiken behövs inte för
    // momsen (den kommer ur produktfilen) men för valuta och brand.
    try {
      const { hittaPost } = await import('./register.mjs');
      const post = hittaPost(raProdukt?.produkt?.id);
      butik = lasYaml(readFileSync(join(ROT, post.butiksfil), 'utf8'));
      console.log(`(butikskonfig ur registret: ${post.butiksfil})`);
    } catch (e) {
      console.error(`❌ Hittar ingen butikskonfig: ${e.message}\n   Ange butiksfilen som andra argument.`);
      process.exit(1);
    }
  }

  const produkt = sammanfoga(butik, raProdukt);
  const e = ekonomiForProdukt(produkt);
  if (!e) {
    console.error('❌ Kan inte räkna: ekonomi.pris eller ekonomi.inkopskostnad saknas.');
    process.exit(1);
  }
  console.log(`\n${raProdukt?.produkt?.namn ?? produktfil} — skalningsekonomi\n`);
  if (e.osaker) {
    console.error(`❌ ${e.varning}\n`);
    process.exit(1);
  }

  for (const [namn, l] of [['UTAN moms', e.utanMoms], [`MED moms ${e.medMoms.momsProcent} %`, e.medMoms]]) {
    console.log(`  ${namn}`);
    console.log(`    brutto ${l.brutto} − varukostnad ${l.varukostnad} ⇒ netto ${l.netto}`);
    console.log(`    täckningsbidrag ${l.tackningsbidrag} (${l.marginalProcent} % av netto)`);
    console.log(`    break-even ROAS ${l.breakEvenRoas ?? '—'} · CPA ${l.breakEvenCpa ?? '—'} kr`);
    console.log(`    target     ROAS ${l.targetRoas ?? '—'} · CPA ${l.targetCpa ?? '—'} kr\n`);
  }
  if (e.olonsam) {
    console.log('❌ Täckningsbidraget är noll eller negativt i båda linjerna — produkten går inte att annonsera lönsamt till det priset.\n');
    process.exit(1);
  }

  if (e.antagande === 'obeslutat') {
    console.log(`⚠️  ${MOMS_BESLUT_TEXT}`);
    console.log('   Sätt `moms_antagen: true` eller `false` i produktfilens ekonomi-block när Axel svarat.\n');
  } else {
    console.log(`Antagande: ${e.antagande === 'med_moms' ? 'MED moms' : 'UTAN moms'} (ekonomi.moms_antagen). Klistra in i produktfilen:\n`);
    console.log(`  aov_sek: ${e.brutto}`);
    console.log(`  break_even_roas: ${e.breakEvenRoas}`);
    console.log(`  break_even_cpa_sek: ${e.breakEvenCpa}`);
    console.log(`  target_roas: ${e.targetRoas ?? 0}`);
    console.log(`  target_cpa_sek: ${e.targetCpa ?? 0}\n`);
  }

  const avvikelser = granskaEkonomiblock(produkt);
  if (avvikelser.length) {
    console.log('⚠️  Filen är inte i takt med räkningen:');
    for (const a of avvikelser) console.log(`   • ${a}`);
    console.log('');
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  huvud().catch((e) => {
    console.error(`❌ ${e.message}`);
    process.exit(1);
  });
}
