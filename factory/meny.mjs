// meny.mjs — huvudmenyn kunden ser i headern. Ren logik, ingen nätverkstrafik;
// ops.mjs (steget `meny`) skriver raderna med shopify.skrivMeny('main-menu', rader).
//
//   huvudmenyRader(butik, produkter) → [{ titel, url }]
//
// Varför (Axels bakläxa 2026-09-09 på DryTrek): fabriken skrev bara
// footer-menyn, så `main-menu` var kvar på Dawns Home / Catalog / Contact.
// "Catalog" går till /collections/all, som är TOM i en enproduktsbutik.
//
// Raderna: Hem / [kollektionen, flerprodukt eller nischbutik] / en rad per
// produkt / Frakt & retur / Kontakt. Aldrig /collections/all. Sidhandles
// kommer ur policyer.mjs (fraktpolicyn) och kollektionen ur butik.yaml —
// inget butiksspecifikt här (KEDJAN.md regel 7). Nischbutik = butik.mjs
// arNischbutik (kollektion.alltid), AdventLane 2026-09-10.

import { byggPolicyer } from './policyer.mjs';
import { arNischbutik } from './butik.mjs';

// Kortnamnet före tankstrecket: "Damasker – håller benen torra" → "Damasker".
// Bindestreck INNE i ord lämnas ("DryTrek-damasker" är ett namn).
export function kortnamn(namn) {
  const s = String(namn ?? '').trim();
  const del = s.split(/\s+[–—-]\s+|\s*[–—]\s*/)[0];
  return (del || s).trim();
}

const produktobjekt = (p) => p?.produkt ?? p ?? {};

// Vad produkten heter i menyn: menynamn ur produktfilen vinner, annars
// kortnamnet ur produktnamnet.
export function menytitel(p) {
  const pr = produktobjekt(p);
  const uttryckligt = String(pr.menynamn ?? '').trim();
  return uttryckligt || kortnamn(pr.namn);
}

// Produktens adress i butiken: handle om det finns, annars id (= handle i
// fabrikens konfig).
export function produkturl(p) {
  const pr = produktobjekt(p);
  const handle = String(pr.handle ?? pr.id ?? '').trim();
  if (!handle) throw new Error(`Produkten "${pr.namn ?? '?'}" saknar handle/id — ingen menyrad går att bygga.`);
  return `/products/${handle}`;
}

/**
 * Vilka produkter som får en EGEN rad i menyn.
 *
 * Axels regel 2026-09-11, när AdventLane gick från en kalender till tolv:
 * "Alla behöver inte vara uppe i menyn men sålänge alla finns på kategorin."
 * En meny med tolv produktrader är ingen meny, den är en andra katalog — och
 * kollektionsraden står redan där och leder till allihop.
 *
 * Regeln: nämner NÅGON produktfil `produkt.i_meny` (true eller false) gäller
 * flaggorna — och bara de som står true. Nämner ingen den behålls det gamla
 * beteendet (alla med), annars hade en befintlig butiks meny tömts tyst vid
 * nästa körning.
 *
 * Att false räknas som ett uttryckligt val är hela poängen: en butik som
 * vill ha NOLL produktrader (kollektionsraden räcker) måste kunna säga det.
 * Hade bara true räknats vore tolv false:ar samma sak som ingen flagga alls.
 */
export function menyprodukter(produkter) {
  const lista = (Array.isArray(produkter) ? produkter : [produkter]).filter(Boolean);
  const uttryckligt = lista.some((p) => typeof produktobjekt(p).i_meny === 'boolean');
  return uttryckligt ? lista.filter((p) => produktobjekt(p).i_meny === true) : lista;
}

export function huvudmenyRader(butik, produkter, { kontaktUrl = '/pages/contact' } = {}) {
  const alla = (Array.isArray(produkter) ? produkter : [produkter]).filter(Boolean);
  if (alla.length === 0) throw new Error('huvudmenyRader: inga produkter.');
  const lista = menyprodukter(alla);
  const b = butik?.butik ?? butik ?? {};

  // Kollektionsraden avgörs av HELA sortimentet, inte av menyurvalet: en
  // butik med tolv kalendrar där två står i menyn är fortfarande en
  // nischbutik, och utan raden vore de tio andra oåtkomliga från menyn.
  const kollektion = [];
  if (arNischbutik(b, alla)) {
    const handle = String(b.kollektion?.handle ?? 'sortimentet').trim();
    if (handle === 'all') throw new Error('Huvudmenyn får aldrig peka på /collections/all.');
    kollektion.push({ titel: String(b.kollektion?.titel ?? 'Sortimentet'), url: `/collections/${handle}` });
  }

  const frakt = byggPolicyer(alla[0]).find((x) => x.type === 'SHIPPING_POLICY');

  const rader = [
    { titel: 'Hem', url: '/' },
    ...kollektion,
    ...lista.map((p) => ({ titel: menytitel(p), url: produkturl(p) })),
    ...(frakt ? [{ titel: 'Frakt & retur', url: `/pages/${frakt.handle}` }] : []),
    { titel: 'Kontakt', url: kontaktUrl },
  ].filter((r) => r.titel && r.url);

  const dubbla = rader.filter((r, i) => rader.findIndex((x) => x.url === r.url) !== i);
  if (dubbla.length > 0) throw new Error(`Huvudmenyn har dubbla adresser: ${dubbla.map((r) => r.url).join(', ')}`);
  return rader;
}
