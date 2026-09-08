// Judge.me-underlag ur produktfilen.
//
// Recensionerna på sidan ägs av Judge.me (appblock i temat), inte av en egen
// sektion. Fabriken skriver därför ett importunderlag i husets CSV-format —
// samma kolumner som tools/judgeme-import.mjs redan läser:
//
//   title,body,rating,review_date,reviewer_name,reviewer_email,product_id,product_handle,reply,picture_urls
//
// Fält som produktfilen inte har (mejl, bilder) lämnas TOMMA — aldrig
// påhittade. product_handle skrivs med men importverktyget kopplar medvetet
// via --product-id (ett fel handle importerar tyst mot ingenting).
//
// ⚠️ DATUMEN FÖLJER BARA MED APPENS EGEN CSV-IMPORT. Judge.mes v1-API sätter
// alltid importögonblicket som datum — created_at ignoreras på både POST och
// PUT (mätt på TankGuard 2026-09-08: 16 recensioner med "för 12 minuter
// sedan" på allihop, Axels bakläxa). Därför bygger fabriken en fil i
// Judge.mes mallformat (byggJudgeMeAppCsv) som VA:n laddar upp i appen:
// Settings → Import reviews → Import from apps → Judge.me format → Import.
// Källans originaldatum är obligatoriska — en recension utan datum stoppar.

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

// Judge.mes egen importmall (help-artikel 8415368, läst 2026-09-08): title,
// body, rating, review_date (dd/mm/yyyy), reviewer_name, reviewer_email,
// product_url, picture_urls + avancerade product_id/product_handle. Reviewen
// kopplas på product_id ELLER product_handle — vi skickar båda.
export const JUDGEME_APP_KOLUMNER = [
  'title',
  'body',
  'rating',
  'review_date',
  'reviewer_name',
  'reviewer_email',
  'product_url',
  'picture_urls',
  'product_id',
  'product_handle',
];

// "2026-08-10" eller "2026-08-10T08:00:00.000Z" → "10/08/2026" (appens format).
// Något annat än ett riktigt datum ger null — det får aldrig gissas.
export function judgeMeDatum(datum) {
  const m = String(datum ?? '').trim().match(/^(\d{4})-(\d{2})-(\d{2})(?:[T ]|$)/);
  if (!m) return null;
  const [, ar, man, dag] = m;
  const d = new Date(Date.UTC(Number(ar), Number(man) - 1, Number(dag)));
  if (Number.isNaN(d.getTime()) || d.getUTCMonth() !== Number(man) - 1) return null;
  return `${dag}/${man}/${ar}`;
}

const betygAv = (r) => Math.max(1, Math.min(5, Number(r.betyg) || 5));

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
    rader.push(
      [cell(oversattning[`recension.${i}.titel`] ?? ''), cell(text), cell(betygAv(r)), cell(r.datum ?? ''), cell(namn), cell(''), cell(''), cell(p.produkt?.id ?? ''), cell(''), cell('')].join(',')
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
    rader.push(
      [
        cell(r.titel ?? ''),
        cell(r.text ?? ''),
        cell(betygAv(r)),
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

// Filen VA:n laddar upp i Judge.me-appen: originalen + marknadernas
// översatta delmängder i EN fil, datum i appens dd/mm/yyyy, kopplade på
// butikens produkt-id + handle. Saknar en recension datum kastas — det är
// ett skrapfel i produktfilen som ska lagas, inte importeras runt.
export function byggJudgeMeAppCsv(p, { produktId = '', produktUrl = '', oversattningar = {} } = {}) {
  const recensioner = lista(p.reviews);
  if (recensioner.length === 0) return null;
  const handle = p.produkt?.id ?? '';
  const rader = [JUDGEME_APP_KOLUMNER.join(',')];
  const rad = (titel, text, betyg, datum, namn, vem) => {
    const d = judgeMeDatum(datum);
    if (!d) throw new Error(`Recensionen "${vem}" saknar originaldatum (datum: YYYY-MM-DD i produktfilen) — hämta det ur källans reviews_for_widget. Aldrig påhittat, aldrig utan.`);
    rader.push([cell(titel ?? ''), cell(text ?? ''), cell(betyg), cell(d), cell(namn ?? ''), cell(''), cell(produktUrl), cell(''), cell(produktId), cell(handle)].join(','));
  };
  for (const r of recensioner) rad(r.titel, r.text, betygAv(r), r.datum, r.namn, r.namn ?? '?');
  for (const [locale, o] of Object.entries(oversattningar)) {
    for (let i = 0; i < recensioner.length; i++) {
      const text = o?.[`recension.${i}.text`];
      const namn = o?.[`recension.${i}.namn`];
      if (!text || !namn) continue;
      rad(o[`recension.${i}.titel`] ?? recensioner[i].titel, text, betygAv(recensioner[i]), recensioner[i].datum, namn, `${namn} (${locale})`);
    }
  }
  return `${rader.join('\n')}\n`;
}
