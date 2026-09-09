// Validerar en produktfil för OPS Factory. Noll beroenden.
//
//   node factory/validera.mjs factory/produkter/<id>.yaml
//
// Kritiska fel → utskrift + exit 1 (systemet stoppar direkt).
// Varningar → utskrift men exit 0 (fylls i före launch).

import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { lasYaml } from './yaml.mjs';

const KANDA_VALUTOR = ['SEK', 'NOK', 'DKK', 'EUR', 'USD', 'GBP'];
const HANDLE = /^[a-z0-9-]+$/;
const DATUM = /^\d{4}-\d{2}-\d{2}$/;

const text = (v) => typeof v === 'string' && v.trim() !== '';
const tal = (v) => typeof v === 'number' && Number.isFinite(v);
const lista = (v) => (Array.isArray(v) ? v.filter((x) => x !== null && x !== '') : []);
const objekt = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

// En bildrad är en URL-sträng eller { url, alt } (alt bär [SV]/[NO] för
// temats gallerifilter). Returnerar ett fel-meddelande eller null.
export function kontrolleraBildrad(b, plats) {
  if (typeof b === 'string') return null;
  if (!objekt(b)) return `${plats}: en bild är en URL-sträng eller { url, alt }`;
  if (!text(b.url)) return `${plats}: url saknas i bildobjektet`;
  if (b.alt !== undefined && b.alt !== null && typeof b.alt !== 'string') return `${plats}: alt måste vara text`;
  return null;
}

// Paketnivåerna (offer.paket.nivaer) — samma regler som paket.mjs kastar på,
// fast här, så felet syns i valideringen och inte först i steg 10.
export function kontrolleraPaket(offer, ekonomi) {
  const fel = [];
  const varningar = [];
  const paket = offer?.paket;
  if (paket === undefined || paket === null) return { fel, varningar };
  if (!objekt(paket)) return { fel: ['offer.paket måste vara ett block med test och nivaer'], varningar };
  if (paket.test !== undefined && paket.test !== null && typeof paket.test !== 'string') {
    fel.push('offer.paket.test måste vara text (A/B-test-id) eller tom');
  }
  const nivaer = lista(paket.nivaer);
  if (paket.nivaer !== undefined && paket.nivaer !== null && !Array.isArray(paket.nivaer)) {
    fel.push('offer.paket.nivaer måste vara en lista');
    return { fel, varningar };
  }
  const bonusPris = tal(offer?.bonus_produkt?.pris) ? offer.bonus_produkt.pris : 0;
  const perVariant = new Map();
  nivaer.forEach((n, i) => {
    const plats = `offer.paket.nivaer[${i}]`;
    if (!objekt(n)) {
      fel.push(`${plats}: en nivå är ett block med antal, rubrik …`);
      return;
    }
    const variant = String(n.variant ?? '').toLowerCase();
    if (!['', 'a', 'b'].includes(variant)) fel.push(`${plats}: variant "${n.variant}" — tillåtet är a, b eller tom`);
    if (!(tal(n.antal) && n.antal >= 1 && Number.isInteger(n.antal))) fel.push(`${plats}: antal måste vara ett heltal ≥ 1`);
    const harPris = tal(n.pris) && n.pris > 0;
    const harKod = text(n.kod);
    if (harPris !== harKod) fel.push(`${plats}: pris och kod hör ihop — sätt båda eller inget (ordinarie)`);
    if (harPris && tal(ekonomi?.pris) && tal(n.antal) && n.pris > n.antal * ekonomi.pris) {
      fel.push(`${plats}: paketpris ${n.pris} är högre än ${n.antal} × ordinarie ${ekonomi.pris}`);
    }
    if (n.gratis_antal !== undefined && n.gratis_antal !== null) {
      if (!(tal(n.gratis_antal) && n.gratis_antal >= 0 && Number.isInteger(n.gratis_antal))) {
        fel.push(`${plats}: gratis_antal måste vara ett heltal ≥ 0`);
      } else if (n.gratis_antal > 0 && !(bonusPris > 0)) {
        fel.push(`${plats}: gratis_antal utan offer.bonus_produkt.pris — bonusens värde krävs för rabattkoden`);
      }
    }
    if (n.forvald !== undefined && n.forvald !== null && typeof n.forvald !== 'boolean') fel.push(`${plats}: forvald är true/false`);
    if (!text(n.rubrik)) varningar.push(`${plats}: rubrik saknas (blir "<antal> st")`);
    if (!perVariant.has(variant)) perVariant.set(variant, []);
    perVariant.get(variant).push(n);
  });
  for (const [variant, rader] of perVariant) {
    const etikett = variant ? `offer.paket variant ${variant.toUpperCase()}` : 'offer.paket';
    const forvalda = rader.filter((n) => n.forvald === true);
    if (forvalda.length > 1) fel.push(`${etikett}: mer än en nivå är förvald`);
    if (forvalda.length === 1 && rader.indexOf(forvalda[0]) === 0 && rader.length > 1) {
      fel.push(`${etikett}: första nivån är förvald — regeln är mitten (nivå ${Math.ceil(rader.length / 2)})`);
    }
  }
  return { fel, varningar };
}

// Bonusprodukten (Q4-ramverket). Block utan handle = ingen bonus (steg 9
// blir manuellt). Med handle behöver bonus.mjs titel, pris och minst en
// bild — saknas de blir steg 9 manuellt ("välj bonusprodukt"), aldrig ett
// stopp för hela bygget (KEDJAN.md: steg 9 stoppar inte). Därför VARNING.
// Fel form (typer, handle-tecken) är däremot fel.
export function kontrolleraBonus(bonus) {
  const fel = [];
  const varningar = [];
  if (bonus === undefined || bonus === null) return { fel, varningar };
  if (!objekt(bonus)) return { fel: ['offer.bonus_produkt måste vara ett block'], varningar };
  const aktiv = text(bonus.handle);
  if (aktiv && !HANDLE.test(bonus.handle.trim())) {
    fel.push(`offer.bonus_produkt.handle "${bonus.handle}" får bara ha små bokstäver, siffror och bindestreck`);
  }
  if (aktiv) {
    if (!text(bonus.titel)) varningar.push('offer.bonus_produkt.titel saknas — steget bonus blir manuellt');
    if (!(tal(bonus.pris) && bonus.pris > 0)) varningar.push('offer.bonus_produkt.pris saknas eller är inte över 0 — steget bonus blir manuellt');
    if (lista(bonus.bilder).length === 0) {
      varningar.push('offer.bonus_produkt.bilder är tom — bonusen kan inte skapas som produkt (steget bonus blir manuellt)');
    }
  }
  lista(bonus.bilder).forEach((b, i) => {
    const f = kontrolleraBildrad(b, `offer.bonus_produkt.bilder[${i}]`);
    if (f) fel.push(f);
  });
  for (const falt of ['produkt_id', 'variant_id', 'kortnamn', 'sku', 'i_paket']) {
    const v = bonus[falt];
    if (v !== undefined && v !== null && typeof v !== 'string' && typeof v !== 'number') {
      fel.push(`offer.bonus_produkt.${falt} måste vara text`);
    }
  }
  if (bonus.tillagg_kryssruta !== undefined && bonus.tillagg_kryssruta !== null && typeof bonus.tillagg_kryssruta !== 'boolean') {
    fel.push('offer.bonus_produkt.tillagg_kryssruta är true/false');
  }
  if (aktiv && bonus.tillagg_kryssruta === true && !text(bonus.kortnamn)) {
    varningar.push('offer.bonus_produkt.kortnamn saknas (kryssrutan tar första delen av titeln)');
  }
  return { fel, varningar };
}

export function validera(p) {
  const fel = [];
  const varningar = [];

  // --- Kritiska fält ---
  if (!text(p?.produkt?.namn)) fel.push('produkt.namn saknas');
  if (!text(p?.produkt?.id)) {
    fel.push('produkt.id saknas');
  } else if (!HANDLE.test(p.produkt.id)) {
    fel.push(`produkt.id "${p.produkt.id}" får bara ha små bokstäver, siffror och bindestreck`);
  }
  // produkt.handle är valfritt: butikens handle när det skiljer sig från id
  // (default = id, se build-store.mjs → produktHandle).
  if (p?.produkt?.handle !== undefined && p?.produkt?.handle !== null && p?.produkt?.handle !== '') {
    if (!text(p.produkt.handle)) fel.push('produkt.handle måste vara text');
    else if (!HANDLE.test(p.produkt.handle.trim())) {
      fel.push(`produkt.handle "${p.produkt.handle}" får bara ha små bokstäver, siffror och bindestreck`);
    }
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
  bilder.forEach((b, i) => {
    const f = kontrolleraBildrad(b, `media.bilder[${i}]`);
    if (f) fel.push(f);
  });

  if (!text(p?.vinkel?.huvudvinkel)) fel.push('vinkel.huvudvinkel saknas');
  if (p?.vinkel?.usp !== undefined && p?.vinkel?.usp !== null && typeof p.vinkel.usp !== 'string') {
    fel.push('vinkel.usp måste vara text');
  }
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

  // Paketnivåer + bonusprodukt (Q4-ramverket) — fel här stoppar, precis som
  // paket.mjs/bonus.mjs skulle ha gjort i steg 9–10.
  const paketKoll = kontrolleraPaket(p?.offer, p?.ekonomi);
  const bonusKoll = kontrolleraBonus(p?.offer?.bonus_produkt);
  fel.push(...paketKoll.fel, ...bonusKoll.fel);
  varningar.push(...paketKoll.varningar, ...bonusKoll.varningar);

  // --- Varningar (stoppar inte, men ska fyllas i före launch) ---
  if (!text(p?.vinkel?.underrubrik)) {
    varningar.push('vinkel.underrubrik är inte satt (kundens rubriktext härleds då ur huvudvinkeln)');
  }
  if (!text(p?.vinkel?.usp)) {
    varningar.push('vinkel.usp är inte satt (fjärde USP-punkten och annonsraden får ingen produkt-USP)');
  } else if (p.vinkel.usp.trim().length > 30) {
    varningar.push(`vinkel.usp är ${p.vinkel.usp.trim().length} tecken — håll den kort (~25) så den ryms i USP-raden`);
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
  const reviews = lista(p?.reviews);
  if (reviews.length < 3) varningar.push('reviews: färre än 3 recensioner (importeras till Judge.me)');
  // Datumet är källans originaldatum och bär recensionens ålder i Judge.me.
  // Saknas det: VARNING, inte stopp (KEDJAN.md: datumkravet är opt-in via
  // tools/judgeme-import.mjs --krav-datum — nattrutinen får aldrig stoppas).
  // Hitta aldrig på ett datum för att tysta varningen.
  reviews.forEach((r, i) => {
    if (!objekt(r)) {
      varningar.push(`reviews[${i}]: en recension är ett block med namn, betyg, text, datum`);
      return;
    }
    if (!text(r.datum)) varningar.push(`reviews[${i}]: datum saknas (YYYY-MM-DD, källans originaldatum — importeras utan datum)`);
    else if (!DATUM.test(r.datum.trim())) varningar.push(`reviews[${i}]: datum "${r.datum}" ska vara YYYY-MM-DD`);
    if (!(tal(r.betyg) && r.betyg >= 1 && r.betyg <= 5)) varningar.push(`reviews[${i}]: betyg ska vara 1–5`);
    if (!text(r.text)) varningar.push(`reviews[${i}]: text saknas`);
  });
  if (lista(p?.faq).length === 0) varningar.push('faq är tom');
  if (lista(p?.garantier).length === 0) varningar.push('garantier är tom');
  if (!text(p?.shipping?.tid)) varningar.push('shipping.tid är inte satt');
  if (!text(p?.offer?.beskrivning)) varningar.push('offer.beskrivning är inte satt');
  for (const falt of ['ad_account_id', 'page_id', 'pixel_id', 'creative_prefix']) {
    if (!text(p?.meta?.[falt])) varningar.push(`meta.${falt} är inte satt (krävs före launch)`);
  }

  // --- Nyckeltal (bara om ekonomin är hel) ---
  let nyckeltal = null;
  if (fel.length === 0) {
    const marginal = eko.pris - eko.inkopskostnad;
    nyckeltal = {
      marginal,
      marginalProcent: Math.round((marginal / eko.pris) * 100),
      breakEvenRoas: Math.round((eko.pris / marginal) * 100) / 100,
      breakEvenCpa: Math.round(marginal),
    };
    // ⚠️ ÖPPET ÄGARBESLUT (factory/BESLUT-VANTAR.md punkt 1): räknas OPS-
    // butikernas break-even med eller utan moms? Tills Axel avgjort det
    // står talen ovan (rakt på priset, som CLAUDE.md säger för Bäverbutiken)
    // kvar som `breakEvenRoas`, och när butiken säger moms_i_pris: true
    // visas nettotalen BREDVID — aldrig i stället. Ingen kod väljer åt honom.
    if (eko.moms_i_pris === true) {
      const procent = tal(eko.moms_procent) && eko.moms_procent > 0 ? eko.moms_procent : 25;
      const netto = eko.pris / (1 + procent / 100);
      const marginalNetto = netto - eko.inkopskostnad;
      nyckeltal.medMoms = {
        momsProcent: procent,
        netto: Math.round(netto * 100) / 100,
        marginal: Math.round(marginalNetto * 100) / 100,
        breakEvenRoas: marginalNetto > 0 ? Math.round((eko.pris / marginalNetto) * 100) / 100 : null,
        breakEvenCpa: marginalNetto > 0 ? Math.round(marginalNetto) : null,
      };
      if (!(marginalNetto > 0)) {
        varningar.push(`ekonomi: priset ${eko.pris} täcker inte inköpet ${eko.inkopskostnad} när ${procent} % moms dras av`);
      }
    }
  }

  return { fel, varningar, nyckeltal };
}

// Fristående validering av en produktfil. Med butiksfil vävs de ihop först
// (butik.mjs → sammanfoga) så valuta, bolagsuppgifter och frakt kommer
// därifrån — exakt som ops.mjs gör. Utan butiksfil valideras råfilen, och
// då saknas t.ex. ekonomi.valuta med rätta.
export async function valideraFil(sokvag, butiksfil = null) {
  const rad = lasYaml(readFileSync(sokvag, 'utf8'));
  if (!butiksfil) return validera(rad);
  const { lasButik, sammanfoga } = await import('./butik.mjs');
  const b = lasButik(butiksfil);
  const r = validera(sammanfoga(b.butik, rad));
  return {
    fel: [...b.fel.map((f) => `butik: ${f}`), ...r.fel],
    varningar: [...b.varningar.map((v) => `butik: ${v}`), ...r.varningar],
    nyckeltal: r.nyckeltal,
  };
}

async function huvud() {
  const [sokvag, butiksfil] = process.argv.slice(2).filter((a) => !a.startsWith('--'));
  if (!sokvag) {
    console.error('Användning: node factory/validera.mjs <produktfil.yaml> [<butiksfil.yaml>]');
    process.exit(1);
  }

  let resultat;
  try {
    resultat = await valideraFil(sokvag, butiksfil ?? null);
  } catch (e) {
    console.error(`❌ Kunde inte läsa filen: ${e.message}`);
    process.exit(1);
  }

  const { fel, varningar, nyckeltal } = resultat;
  console.log(`\nValidering av ${sokvag}${butiksfil ? ` + ${butiksfil}` : ''}\n`);

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
    console.log('\nNyckeltal (utan moms — marginal rakt på priset):');
    console.log(`   Marginal:        ${nyckeltal.marginal} (${nyckeltal.marginalProcent} %)`);
    console.log(`   Break-even-ROAS: ${nyckeltal.breakEvenRoas}`);
    console.log(`   Break-even-CPA:  ${nyckeltal.breakEvenCpa}`);
    if (nyckeltal.medMoms) {
      const m = nyckeltal.medMoms;
      console.log(`\nMed ${m.momsProcent} % moms avdragen (butik.moms_i_pris: true — vilket tal som gäller är ett öppet ägarbeslut, BESLUT-VANTAR.md punkt 1):`);
      console.log(`   Netto:           ${m.netto}`);
      console.log(`   Marginal:        ${m.marginal}`);
      console.log(`   Break-even-ROAS: ${m.breakEvenRoas ?? '—'}`);
      console.log(`   Break-even-CPA:  ${m.breakEvenCpa ?? '—'}`);
    }
  }

  console.log('');
  process.exit(fel.length > 0 ? 1 : 0);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  huvud().catch((e) => {
    console.error(`❌ ${e.message}`);
    process.exit(1);
  });
}
