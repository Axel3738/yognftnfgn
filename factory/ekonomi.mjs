// Skalningsekonomin för en OPS-produkt: break-even och target, räknade från
// grunden ur butikens egna förutsättningar. Ren matematik, noll beroenden.
//
// ⚠️ HELA POÄNGEN MED FILEN: Bäverbutikens break-even-tal får ALDRIG kopieras
// hit. Bäverbutiken säljer UTAN moms (Axels besked 2026-08-29) — OPS-butikerna
// säger `moms_i_pris: true` i sin butikskonfig. Samma pris och samma inköp ger
// därför olika break-even i de två verksamheterna, och skillnaden är stor nog
// att vända ett kill-beslut.
//
// Formlerna (allt per order):
//   brutto   = det kunden betalar = det Meta räknar som purchase value
//   netto    = brutto / (1 + moms)      (moms_i_pris: false ⇒ netto = brutto)
//   TB       = netto − varukostnad      (täckningsbidraget som ska betala annonsen)
//   break-even-CPA  = TB                (allt över TB är förlust)
//   break-even-ROAS = brutto / TB       (samma enhet som Metas purchase_roas)
//   target-CPA      = TB − målvinst,  målvinst = 25 % av NETTOintäkten
//   target-ROAS     = brutto / target-CPA
//
// Kontrollräkning mot Bäverbutikens tal (products/products.json): utan moms ger
// samma formel target = 1 / (1/break_even − 0,25), vilket återger Axels
// COGS-beräkning 2026-08-05 på alla sex produkter (motorhöljet 1,63 → 2,75 mot
// hans 2,74, väggfästet 2,00 → 4,00 mot hans 4,00). Formeln är alltså husets
// egen — det är bara momsen som skiljer verksamheterna åt.
//
// ⚠️ Vad talen INTE innehåller (ingen verifierad siffra finns i repot):
// betalväxelavgifter (Shopify Payments/Klarna), returer, tull, appkostnader.
// Varje sådan kostnad gör break-even STRÄNGARE än talet här. Kommer en
// verifierad siffra: lägg den som `ovriga_kostnader_per_order` i produktfilens
// ekonomiblock — den räknas då av från täckningsbidraget.

//   node factory/ekonomi.mjs factory/produkter/<id>.yaml [factory/butiker/<id>.yaml]
// skriver ut ekonomiblocket färdigt att klistra in i produktfilen.

import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

export const STANDARD_MOMS_PROCENT = 25;
export const STANDARD_MALMARGINAL = 0.25; // 25 % nettomarginal = husets target-nivå

const tal = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : null);
const avrunda = (v, decimaler = 2) => {
  const f = 10 ** decimaler;
  return Math.round(v * f) / f;
};

/**
 * Räknar skalningsekonomin för en produkt.
 *
 * @param {object} inpar
 * @param {number} inpar.pris               styckpriset kunden betalar (inkl. moms om butiken har moms i pris)
 * @param {number} inpar.inkopskostnad      varukostnad per styck, inkl. frakt in
 * @param {boolean} [inpar.momsIPris=true]  butikens `moms_i_pris`. Saknas den antas moms (strängast).
 * @param {number} [inpar.momsProcent=25]   butikens `moms_procent`
 * @param {number} [inpar.aov]              verklig AOV. Utelämnad ⇒ priset används
 * @param {number} [inpar.varukostnadPerOrder] varukostnad per ORDER (flerpack). Utelämnad ⇒ inkopskostnad
 * @param {number} [inpar.ovrigaKostnaderPerOrder=0] verifierade rörliga kostnader per order
 * @param {number} [inpar.malmarginal=0.25] målets nettomarginal
 * @returns {object|null} nyckeltalen, eller null när ekonomin inte går att räkna
 */
export function raknaEkonomi({
  pris,
  inkopskostnad,
  momsIPris = true,
  momsProcent = STANDARD_MOMS_PROCENT,
  aov = null,
  varukostnadPerOrder = null,
  ovrigaKostnaderPerOrder = 0,
  malmarginal = STANDARD_MALMARGINAL,
} = {}) {
  const p = tal(pris);
  const kostnad = tal(inkopskostnad);
  if (p === null || kostnad === null || p <= 0 || kostnad < 0) return null;

  const moms = momsIPris ? (tal(momsProcent) ?? STANDARD_MOMS_PROCENT) : 0;
  const brutto = tal(aov) ?? p;
  if (brutto <= 0) return null;

  // Varukostnaden per order skalar med ordervärdet när AOV är högre än
  // styckpriset — annars ser ett flerpack ut som ren vinst.
  const varukostnad = tal(varukostnadPerOrder) ?? kostnad * (brutto / p);
  const netto = brutto / (1 + moms / 100);
  const tackningsbidrag = netto - varukostnad - (tal(ovrigaKostnaderPerOrder) ?? 0);

  if (tackningsbidrag <= 0) {
    return {
      brutto: avrunda(brutto),
      netto: avrunda(netto),
      momsProcent: moms,
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

  const malvinst = netto * malmarginal;
  const targetCpa = tackningsbidrag - malvinst;

  return {
    brutto: avrunda(brutto),
    netto: avrunda(netto),
    momsProcent: moms,
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

/** Samma räkning direkt ur en sammanvävd produkt (butikskonfig + produktfil). */
export function ekonomiForProdukt(produkt) {
  const eko = produkt?.ekonomi ?? {};
  return raknaEkonomi({
    pris: eko.pris,
    inkopskostnad: eko.inkopskostnad,
    // `moms_i_pris` saknas ⇒ anta moms. Det ger en strängare break-even, och
    // fel åt det hållet dödar inga vinnare — fel åt andra hållet gör det.
    momsIPris: eko.moms_i_pris !== false,
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
  if (!raknat) return [];
  const avvikelser = [];
  const par = [
    ['break_even_roas', raknat.breakEvenRoas],
    ['break_even_cpa_sek', raknat.breakEvenCpa],
    ['target_roas', raknat.targetRoas],
    ['target_cpa_sek', raknat.targetCpa],
  ];
  for (const [falt, vantat] of par) {
    const angivet = tal(eko[falt]);
    if (angivet === null || vantat === null) continue;
    const skillnad = Math.abs(angivet - vantat) / Math.max(vantat, 1e-9);
    if (skillnad > tolerans) {
      avvikelser.push(`ekonomi.${falt} står som ${angivet} men räknas till ${vantat}`);
    }
  }
  return avvikelser;
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
    // Utan butiksfil: slå upp butiken i OPS-registret. Momsen MÅSTE komma
    // från butiken — gissas den fel flyttas break-even med tiotals procent.
    try {
      const { hittaPost } = await import('./register.mjs');
      const post = hittaPost(raProdukt?.produkt?.id);
      butik = lasYaml(readFileSync(post.butiksfil, 'utf8'));
      console.log(`(butikskonfig ur registret: ${post.butiksfil})`);
    } catch {
      console.error(
        '❌ Hittar ingen butikskonfig. Ange den som andra argument, eller lägg produkten i factory/produkter/register.json.\n' +
        '   Momsen står i butiksfilen och får inte gissas.'
      );
      process.exit(1);
    }
  }

  const produkt = sammanfoga(butik, raProdukt);
  const e = ekonomiForProdukt(produkt);
  if (!e) {
    console.error('❌ Kan inte räkna: ekonomi.pris eller ekonomi.inkopskostnad saknas.');
    process.exit(1);
  }

  const moms = e.momsProcent > 0 ? `moms ${e.momsProcent} % i priset` : 'ingen moms i priset';
  console.log(`\n${raProdukt?.produkt?.namn ?? produktfil} — skalningsekonomi (${moms})\n`);
  console.log(`  brutto (det Meta räknar)   ${e.brutto}`);
  console.log(`  netto (ex moms)            ${e.netto}`);
  console.log(`  − varukostnad per order    ${e.varukostnad}`);
  console.log(`  = täckningsbidrag          ${e.tackningsbidrag}  (${e.marginalProcent} % av netto)\n`);
  if (e.olonsam) {
    console.log('❌ Täckningsbidraget är noll eller negativt — produkten går inte att annonsera lönsamt till det priset.\n');
    process.exit(1);
  }
  console.log('Klistra in i produktfilens ekonomi-block:\n');
  console.log(`  aov_sek: ${e.brutto}`);
  console.log(`  break_even_roas: ${e.breakEvenRoas}`);
  console.log(`  break_even_cpa_sek: ${e.breakEvenCpa}`);
  console.log(`  target_roas: ${e.targetRoas ?? 0}`);
  console.log(`  target_cpa_sek: ${e.targetCpa ?? 0}`);
  const avvikelser = granskaEkonomiblock(produkt);
  if (avvikelser.length) {
    console.log('\n⚠️  Filen är inte i takt med räkningen:');
    for (const a of avvikelser) console.log(`   • ${a}`);
  }
  console.log('');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  huvud().catch((e) => {
    console.error(`❌ ${e.message}`);
    process.exit(1);
  });
}
