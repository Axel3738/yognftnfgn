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

export function huvudmenyRader(butik, produkter, { kontaktUrl = '/pages/contact' } = {}) {
  const lista = (Array.isArray(produkter) ? produkter : [produkter]).filter(Boolean);
  if (lista.length === 0) throw new Error('huvudmenyRader: inga produkter.');
  const b = butik?.butik ?? butik ?? {};

  const kollektion = [];
  if (arNischbutik(b, lista)) {
    const handle = String(b.kollektion?.handle ?? 'sortimentet').trim();
    if (handle === 'all') throw new Error('Huvudmenyn får aldrig peka på /collections/all.');
    kollektion.push({ titel: String(b.kollektion?.titel ?? 'Sortimentet'), url: `/collections/${handle}` });
  }

  const frakt = byggPolicyer(lista[0]).find((x) => x.type === 'SHIPPING_POLICY');

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
