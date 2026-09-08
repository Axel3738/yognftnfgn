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

// Den översatta delmängden (PROCESS.md fas 3): recensionerna ur
// oversattning-<locale>.json (recension.N.titel/text/namn) importeras som
// EGNA recensioner med lokala namn — Judge.mes auto-översättning köps aldrig.
// Datumen är källrecensionernas egna, aldrig påhittade.
export function byggJudgeMeCsvOversatt(p, oversattning) {
  const recensioner = lista(p.reviews);
  const rader = [JUDGEME_KOLUMNER.join(',')];
  let n = 0;
  for (let i = 0; i < recensioner.length; i++) {
    const text = oversattning?.[`recension.${i}.text`];
    const namn = oversattning?.[`recension.${i}.namn`];
    if (!text || !namn) continue;
    const r = recensioner[i];
    const betyg = Math.max(1, Math.min(5, Number(r.betyg) || 5));
    rader.push(
      [cell(oversattning[`recension.${i}.titel`] ?? ''), cell(text), cell(betyg), cell(r.datum ?? ''), cell(namn), cell(''), cell(''), cell(p.produkt?.id ?? ''), cell(''), cell('')].join(',')
    );
    n++;
  }
  return n > 0 ? `${rader.join('\n')}\n` : null;
}

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
