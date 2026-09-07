// Judge.me-underlag ur produktfilen.
//
// Recensionerna på sidan ägs av Judge.me (appblock i temat), inte av en egen
// sektion. Fabriken skriver därför ett importunderlag i husets CSV-format —
// samma kolumner som tools/judgeme-import.mjs redan läser och skickar via
// Judge.me:s API:
//
//   title,body,rating,review_date,reviewer_name,reviewer_email,product_id,product_handle,reply,picture_urls
//
// Fält som produktfilen inte har (datum, mejl, bilder) lämnas TOMMA — aldrig
// påhittade. product_handle skrivs med men importverktyget kopplar medvetet
// via --product-id (ett fel handle importerar tyst mot ingenting).
//
// Import:  node tools/judgeme-import.mjs <fil.csv> --product-id <shopify-id> [--dry]

const lista = (v) => (Array.isArray(v) ? v.filter((x) => x !== null && x !== '') : []);

// CSV-citering: citattecken runt allt, inre citattecken dubbleras.
const cell = (v) => `"${String(v ?? '').replaceAll('"', '""')}"`;

export const JUDGEME_KOLUMNER = [
  'title',
  'body',
  'rating',
  'review_date',
  'reviewer_name',
  'reviewer_email',
  'product_id',
  'product_handle',
  'reply',
  'picture_urls',
];

export function byggJudgeMeCsv(p) {
  const recensioner = lista(p.reviews);
  if (recensioner.length === 0) return null;
  const rader = [JUDGEME_KOLUMNER.join(',')];
  for (const r of recensioner) {
    const betyg = Math.max(1, Math.min(5, Number(r.betyg) || 5));
    rader.push(
      [
        cell(r.titel ?? ''),
        cell(r.text ?? ''),
        cell(betyg),
        cell(r.datum ?? ''),
        cell(r.namn ?? ''),
        cell(''),
        cell(''),
        cell(p.produkt?.id ?? ''),
        cell(''),
        cell(''),
      ].join(',')
    );
  }
  return `${rader.join('\n')}\n`;
}
