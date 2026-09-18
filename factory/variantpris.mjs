// Pris PER VARIANT — i butikens valuta och i varje marknadsvaluta.
//
// Bakgrund (CaraShell 2026-09-18): takskyddet fick nio storlekar 2026-09-17
// och alla nio låg på samma pris (1 129 kr) tills leverantörens offerter kom.
// Med Axels riktiga stege kostar 13,5 m nästan dubbelt så mycket som 5,5 m,
// och då räcker inte `ekonomi.pris` — varken i butikens valuta eller i
// prislistorna. Fabriken skrev tidigare SAMMA pris på varenda variant på tre
// ställen (build-store, prislista, de två QA-kollarna), så en enda glömd plats
// hade sålt det längsta överdraget till det kortastes pris.
//
// Formatet i produktfilen (allt är valfritt — utan det gäller ekonomi-blocket
// precis som förut):
//
//   ekonomi:
//     pris: 1129            # referenspriset: annonser, break-even, paketbasen
//     jamforpris: 1469
//     marknadspriser:
//       - valuta: EUR
//         pris: 126.90
//         jamforpris: 165.90
//   varianter:
//     - namn: "7,5 × 3 m"
//       pris: 1289
//       jamforpris: 1679
//       marknadspriser:
//         - valuta: EUR
//           pris: 144.90
//           jamforpris: 188.90
//
// JÄRNREGELN: har EN variant eget pris måste ALLA ha det — och då måste varje
// variant också ha en rad i varje marknadsvaluta. En halvfylld stege är värre
// än ingen stege: den ser rätt ut och säljer den dyraste storleken till den
// billigastes pris i precis ett land. `granskaVariantpriser` är spärren.
//
// Paketrutan klarar redan olika pris per variant: rabattkoderna är procent och
// temats JS summerar de VALDA varianternas priser (factory/tema/assets/
// ms-paket.js → ordinarieFor), så ett 2-pack med två olika storlekar visar
// summan av de två — inte styckpris × 2. Noll beroenden.

const lista = (v) => (Array.isArray(v) ? v.filter((x) => x !== null && x !== undefined) : []);
const text = (v) => (typeof v === 'string' && v.trim() !== '' ? v.trim() : null);
const tal = (v) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
};

/** Variantnamnen i produktfilens ordning. Utan varianter: Shopifys default. */
export function variantNamn(produkt) {
  const v = lista(produkt?.varianter).map((x) => text(x?.namn)).filter(Boolean);
  return v.length > 0 ? v : ['Default Title'];
}

/** Marknadspriset för en valuta ur ett ekonomi- eller variantblock. */
function radFor(block, valuta) {
  const v = String(valuta ?? '').toUpperCase();
  return lista(block?.marknadspriser).find((m) => String(m?.valuta ?? '').toUpperCase() === v) ?? null;
}

/**
 * Priset för varje variant, i butikens valuta (valuta = null) eller i en
 * marknadsvaluta. Faller tillbaka på ekonomi-blocket för varianter utan eget
 * pris — så en produkt utan stege beter sig exakt som före 2026-09-18.
 *
 * → [{ namn, pris, jamforpris, eget }]   (eget = variantens egen rad, inte fallbacken)
 */
export function variantPriser(produkt, valuta = null) {
  const eko = produkt?.ekonomi ?? {};
  const basRad = valuta ? radFor(eko, valuta) : eko;
  const basPris = tal(basRad?.pris);
  const basJamfor = tal(basRad?.jamforpris);
  const varianter = lista(produkt?.varianter);
  if (varianter.length === 0) {
    return [{ namn: 'Default Title', pris: basPris, jamforpris: basJamfor, eget: false }];
  }
  return varianter.map((v) => {
    const egenRad = valuta ? radFor(v, valuta) : v;
    const pris = tal(egenRad?.pris);
    const jamforpris = tal(egenRad?.jamforpris);
    return {
      namn: text(v?.namn) ?? 'Default Title',
      pris: pris ?? basPris,
      jamforpris: pris ? jamforpris : jamforpris ?? basJamfor,
      eget: pris !== null,
    };
  });
}

/** Samma sak som uppslagstabell: variantnamn → { pris, jamforpris }. */
export function prisKarta(produkt, valuta = null) {
  return new Map(variantPriser(produkt, valuta).map((r) => [r.namn, { pris: r.pris, jamforpris: r.jamforpris }]));
}

/** Priset för ETT variantnamn. Okänt namn ⇒ ekonomi-blockets pris. */
export function prisForVariant(produkt, namn, valuta = null) {
  const karta = prisKarta(produkt, valuta);
  if (karta.has(namn)) return karta.get(namn);
  const eko = produkt?.ekonomi ?? {};
  const bas = valuta ? radFor(eko, valuta) : eko;
  return { pris: tal(bas?.pris), jamforpris: tal(bas?.jamforpris) };
}

/** Sant när produkten har en riktig prisstege (minst en variant med eget pris). */
export function harPrisstege(produkt, valuta = null) {
  return variantPriser(produkt, valuta).some((r) => r.eget);
}

/**
 * Spärren. Returnerar en lista fel (tom = allt håller):
 *   - halv stege i butikens valuta (någon variant har pris, någon saknar),
 *   - stege i butikens valuta men ingen stege i en marknadsvaluta,
 *   - jämförpris som inte är över priset,
 *   - två varianter med samma namn.
 * Valutorna tas ur ekonomi.marknadspriser om inget annat skickas in.
 */
export function granskaVariantpriser(produkt, valutor = null) {
  const id = text(produkt?.produkt?.id) ?? '?';
  const fel = [];
  const varianter = lista(produkt?.varianter);
  if (varianter.length === 0) return fel;

  const namn = varianter.map((v) => text(v?.namn) ?? '');
  const sedda = new Set();
  for (const n of namn) {
    if (sedda.has(n)) fel.push(`${id}: två varianter heter "${n}" — variantnamnet är nyckeln till priset`);
    sedda.add(n);
  }

  const valutalista =
    valutor ??
    lista(produkt?.ekonomi?.marknadspriser).map((m) => String(m?.valuta ?? '').toUpperCase()).filter(Boolean);

  const kollaNivå = (valuta) => {
    const rader = variantPriser(produkt, valuta);
    const medEget = rader.filter((r) => r.eget);
    const etikett = valuta ?? (text(produkt?.ekonomi?.valuta) ?? 'butiksvalutan');
    if (medEget.length === 0) return false;
    if (medEget.length !== rader.length) {
      const utan = rader.filter((r) => !r.eget).map((r) => r.namn);
      fel.push(
        `${id}: ${medEget.length} av ${rader.length} varianter har eget ${etikett}-pris — ${utan.join(', ')} saknar och skulle sälja till referenspriset`
      );
    }
    for (const r of rader) {
      if (!r.pris) fel.push(`${id}: varianten "${r.namn}" saknar pris i ${etikett}`);
      else if (r.jamforpris && r.jamforpris <= r.pris)
        fel.push(`${id}: "${r.namn}" har jämförpris ${r.jamforpris} som inte är över priset ${r.pris} (${etikett})`);
    }
    return true;
  };

  const stegeIButiken = kollaNivå(null);
  for (const valuta of valutalista) {
    const stege = kollaNivå(valuta);
    if (stegeIButiken && !stege) {
      fel.push(
        `${id}: varianterna har egna priser i butiksvalutan men INTE i ${valuta} — alla nio storlekar skulle kosta lika mycket i den marknaden`
      );
    }
  }
  return fel;
}

/** En rad per variant, för utskrift i planer och rapporter. */
export function prisrader(produkt, valuta = null) {
  return variantPriser(produkt, valuta).map(
    (r) => `${r.namn}: ${r.pris ?? '—'}${r.jamforpris ? ` / ${r.jamforpris}` : ''}${valuta ? ` ${valuta}` : ''}`
  );
}
