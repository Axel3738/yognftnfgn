// Validerar en produktfil för OPS Factory. Noll beroenden.
//
//   node factory/validera.mjs factory/produkter/<id>.yaml
//
// Kritiska fel → utskrift + exit 1 (systemet stoppar direkt).
// Varningar → utskrift men exit 0 (fylls i före launch).

import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { lasYaml } from './yaml.mjs';
import { ekonomiForProdukt, granskaEkonomiblock } from './ekonomi.mjs';

const KANDA_VALUTOR = ['SEK', 'NOK', 'DKK', 'EUR', 'USD', 'GBP'];

export function validera(p) {
  const fel = [];
  const varningar = [];

  const text = (v) => typeof v === 'string' && v.trim() !== '';
  const tal = (v) => typeof v === 'number' && Number.isFinite(v);
  const lista = (v) => (Array.isArray(v) ? v.filter((x) => x !== null && x !== '') : []);

  // --- Kritiska fält ---
  if (!text(p?.produkt?.namn)) fel.push('produkt.namn saknas');
  if (!text(p?.produkt?.id)) {
    fel.push('produkt.id saknas');
  } else if (!/^[a-z0-9-]+$/.test(p.produkt.id)) {
    fel.push(`produkt.id "${p.produkt.id}" får bara ha små bokstäver, siffror och bindestreck`);
  }

  if (!text(p?.brand?.namn)) fel.push('brand.namn saknas');

  const eko = p?.ekonomi ?? {};
  if (!text(eko.valuta)) {
    fel.push('ekonomi.valuta saknas');
  } else if (!KANDA_VALUTOR.includes(eko.valuta)) {
    fel.push(`ekonomi.valuta "${eko.valuta}" är okänd (tillåtna: ${KANDA_VALUTOR.join(', ')})`);
  }
  if (!tal(eko.inkopskostnad) || eko.inkopskostnad <= 0) fel.push('ekonomi.inkopskostnad saknas eller är inte över 0');
  if (!tal(eko.pris) || eko.pris <= 0) fel.push('ekonomi.pris saknas eller är inte över 0');
  if (tal(eko.pris) && tal(eko.inkopskostnad) && eko.pris > 0 && eko.pris <= eko.inkopskostnad) {
    fel.push(`ekonomi.pris (${eko.pris}) måste vara högre än inköpskostnaden (${eko.inkopskostnad})`);
  }
  if (tal(eko.jamforpris) && eko.jamforpris > 0 && tal(eko.pris) && eko.jamforpris <= eko.pris) {
    fel.push(`ekonomi.jamforpris (${eko.jamforpris}) måste vara högre än priset (${eko.pris})`);
  }

  const bilder = lista(p?.media?.bilder);
  const videor = lista(p?.media?.videor);
  if (bilder.length + videor.length === 0) fel.push('media: minst en bild eller video krävs');

  if (!text(p?.vinkel?.huvudvinkel)) fel.push('vinkel.huvudvinkel saknas');
  if (!text(p?.malgrupp?.beskrivning)) fel.push('malgrupp.beskrivning saknas');
  if (lista(p?.problem).length === 0) fel.push('problem: minst ett problem krävs');
  if (lista(p?.benefits).length === 0) fel.push('benefits: minst en benefit krävs');

  if (!text(p?.leverantor?.url)) {
    fel.push('leverantor.url saknas');
  } else if (!/^https?:\/\//.test(p.leverantor.url)) {
    fel.push('leverantor.url måste börja med http:// eller https://');
  }

  for (const [i, v] of (Array.isArray(p?.varianter) ? p.varianter : []).entries()) {
    if (!text(v?.namn)) fel.push(`varianter[${i}]: namn saknas`);
  }

  // --- Varningar (stoppar inte, men ska fyllas i före launch) ---
  if (!text(p?.vinkel?.underrubrik)) {
    varningar.push('vinkel.underrubrik är inte satt (kundens rubriktext härleds då ur huvudvinkeln)');
  }
  if (!(tal(eko.jamforpris) && eko.jamforpris > 0)) varningar.push('ekonomi.jamforpris är inte satt');
  if (lista(p?.brand?.domanideer).length === 0) varningar.push('brand.domanideer är tom');
  for (const falt of ['org_namn', 'orgnr', 'adress', 'kontakt_epost']) {
    if (!text(p?.brand?.[falt])) varningar.push(`brand.${falt} saknas (visas som [FYLL I] i köpvillkoren)`);
  }
  if (lista(p?.features).length === 0) varningar.push('features är tom');
  // Beskrivningsstrukturen (1 problem → 2 gif → 3 lösning → 4 media → 5 funktioner
  // → 6 bild → 7 garanti). Text och kritisk media måste finnas före launch;
  // bild_lifestyle är valfri — sektionen döljer sig utan den.
  const besk = p?.beskrivning ?? {};
  for (const falt of ['problem_rubrik', 'problem_text', 'losning_rubrik', 'losning_text']) {
    if (!text(besk[falt])) varningar.push(`beskrivning.${falt} saknas (krävs före launch)`);
  }
  for (const falt of ['gif_problem', 'media_losning']) {
    if (!text(p?.media?.[falt])) varningar.push(`media.${falt} saknas (kritisk media — krävs före launch)`);
  }
  if (lista(p?.reviews).length < 3) varningar.push('reviews: färre än 3 recensioner (importeras till Judge.me)');
  if (lista(p?.faq).length === 0) varningar.push('faq är tom');
  if (lista(p?.garantier).length === 0) varningar.push('garantier är tom');
  if (!text(p?.shipping?.tid)) varningar.push('shipping.tid är inte satt');
  if (!text(p?.offer?.beskrivning)) varningar.push('offer.beskrivning är inte satt');
  for (const falt of ['ad_account_id', 'page_id', 'pixel_id', 'creative_prefix']) {
    if (!text(p?.meta?.[falt])) varningar.push(`meta.${falt} är inte satt (krävs före launch)`);
  }

  // --- Nyckeltal (bara om ekonomin är hel) ---
  // Räknas alltid av factory/ekonomi.mjs, som tar hänsyn till momsen i
  // butikskonfigen. Marginalen rakt på priset (den gamla räkningen) gäller
  // bara butiker utan moms i priset och får aldrig visas för en momsbutik —
  // den gör break-even ~25 % för generös.
  let nyckeltal = null;
  if (fel.length === 0) {
    const e = ekonomiForProdukt(p);
    if (e) {
      nyckeltal = {
        marginal: e.tackningsbidrag,
        marginalProcent: e.marginalProcent,
        breakEvenRoas: e.breakEvenRoas,
        breakEvenCpa: e.breakEvenCpa,
        targetRoas: e.targetRoas,
        targetCpa: e.targetCpa,
        momsProcent: e.momsProcent,
        netto: e.netto,
        olonsam: e.olonsam,
      };
      if (e.olonsam) {
        fel.push(
          `ekonomi: täckningsbidraget är ${e.tackningsbidrag} — priset ${eko.pris} bär inte varukostnaden efter moms`
        );
      }
    }
  }

  // Ekonomiblocket i YAML:en är för människor; siffrorna blir inaktuella så
  // fort pris, inköp eller AOV rörs. Varna hellre än att låta en skalningsrunda
  // döma mot ett gammalt break-even-tal.
  for (const avvikelse of granskaEkonomiblock(p)) {
    varningar.push(`${avvikelse} — räkna om ekonomiblocket`);
  }
  if (tal(eko.pris) && !tal(eko.aov_sek)) {
    varningar.push('ekonomi.aov_sek är inte satt (styckpriset används tills butiken har ordrar)');
  }

  return { fel, varningar, nyckeltal };
}

export function valideraFil(sokvag) {
  return validera(lasYaml(readFileSync(sokvag, 'utf8')));
}

function huvud() {
  const sokvag = process.argv[2];
  if (!sokvag) {
    console.error('Användning: node factory/validera.mjs <produktfil.yaml>');
    process.exit(1);
  }

  let resultat;
  try {
    resultat = valideraFil(sokvag);
  } catch (e) {
    console.error(`❌ Kunde inte läsa filen: ${e.message}`);
    process.exit(1);
  }

  const { fel, varningar, nyckeltal } = resultat;
  console.log(`\nValidering av ${sokvag}\n`);

  if (fel.length > 0) {
    console.log(`❌ ${fel.length} kritiska fel — STOPP:`);
    for (const f of fel) console.log(`   • ${f}`);
  } else {
    console.log('✅ Alla kritiska fält är ifyllda.');
  }

  if (varningar.length > 0) {
    console.log(`\n⚠️  ${varningar.length} varningar:`);
    for (const v of varningar) console.log(`   • ${v}`);
  }

  if (nyckeltal) {
    const momsrad = nyckeltal.momsProcent > 0
      ? `moms ${nyckeltal.momsProcent} % i priset — räknat på ex-moms-intäkten ${nyckeltal.netto}`
      : 'ingen moms i priset';
    console.log(`\nNyckeltal (${momsrad}):`);
    console.log(`   Täckningsbidrag: ${nyckeltal.marginal} (${nyckeltal.marginalProcent} % av netto)`);
    console.log(`   Break-even-ROAS: ${nyckeltal.breakEvenRoas}   ← enda linjen som får döda en annons`);
    console.log(`   Break-even-CPA:  ${nyckeltal.breakEvenCpa}`);
    console.log(`   Target-ROAS:     ${nyckeltal.targetRoas ?? '—'}   (25 % nettomarginal)`);
    console.log(`   Target-CPA:      ${nyckeltal.targetCpa ?? '—'}`);
  }

  console.log('');
  process.exit(fel.length > 0 ? 1 : 0);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  huvud();
}
