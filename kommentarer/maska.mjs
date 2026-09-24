// kommentarer/maska.mjs — inga namn, adresser eller nummer ur en kommentar
// lämnar Meta. Ren.
//
// Meta returnerar inte `from` (vem som skrev), men namnen står ändå i texten:
// ett svar börjar med den man svarar ("Ulla Tönnerfors Ett heltäckande …",
// mätt 2026-09-24). `message_tags` bär offset, längd och namn för varje taggad
// person — de byts mot "@…". Offseten räknas i UTF-16, samma som JS-strängar.
// Går en offset inte att använda maskeras taggens namn som text i stället.
// Instagram-handtag (@namn), e-post, telefon, gatuadresser, postnummer och
// signaturer ("Mvh Kalle Svensson") maskeras också. Ordernummer lämnas — VA:n behöver dem.

/** Byt taggade personer mot "@…" med hjälp av message_tags. Ren. */
export function maskaTaggar(text, taggar = []) {
  let t = String(text ?? '');
  const personer = (taggar ?? []).filter((x) => x && x.type !== 'page');
  // Giltiga spann, sammanslagna om de överlappar — annars blir texten "@…nde".
  const spann = personer
    .filter((x) => Number.isInteger(x.offset) && Number.isInteger(x.length) && x.offset >= 0 && x.length > 0 && x.offset + x.length <= t.length
      && (!x.name || t.slice(x.offset, x.offset + x.length) === x.name))
    .map((x) => [x.offset, x.offset + x.length])
    .sort((a, b) => a[0] - b[0]);
  const ihop = [];
  for (const [a, b] of spann) {
    if (ihop.length && a <= ihop.at(-1)[1]) ihop.at(-1)[1] = Math.max(ihop.at(-1)[1], b);
    else ihop.push([a, b]);
  }
  for (const [a, b] of ihop.reverse()) t = `${t.slice(0, a)}@…${t.slice(b)}`;
  // Taggar vars offset inte stämde: maskera namnet där det står.
  for (const x of personer) {
    if (!x.name || String(x.name).length < 2) continue;
    t = t.split(String(x.name)).join('@…');
  }
  return t;
}

const L = '\\p{L}';
const EPOST = new RegExp(`([${L}\\d._%+-]{1,2})[${L}\\d._%+-]*@([${L}\\d.-]+\\.[${L}]{2,})`, 'gu');
const TELEFON = /(?<![\p{L}\d#])(?:\+?\d[\d\s()./-]{7,}\d)(?![\p{L}\d])/gu;
const IGHANDTAG = /(?<![\p{L}\d.*])@[A-Za-z0-9._]{2,30}/g;
const GATA = /(?<!\p{L})\p{Lu}\p{L}+(gatan|gata|vägen|väg|gränd|stigen|allén|allé|torget|backe|backen|plan|leden|veien|vei|gate|gaten|vej|vejen|katu|tie)\s+\d+\s?[A-Za-z]?\b/gu;
const POSTNR = /(?<!\d)\d{3}\s?\d{2}(?=\s+\p{Lu}\p{L}+)/gu;
const SIGNATUR = /(mvh\.?|med vänlig hälsning|vänliga hälsningar|hälsningar|hälsn\.?|hilsen|mvh|regards|best regards|cheers|terveisin)([,:\s]+)\p{Lu}\p{L}+(?:[\s-]\p{Lu}\p{L}+)?/giu;

/** Maskera e-post (ka***@gmail.com), telefon, adress, postnummer, IG-handtag och signaturnamn. Ren. */
export function maskaKontakt(text) {
  return String(text ?? '')
    .replace(EPOST, '$1***@$2')
    .replace(TELEFON, (m) => (m.replace(/\D/g, '').length >= 8 ? '[telefon]' : m))
    .replace(GATA, '[adress]')
    .replace(POSTNR, '[postnr]')
    .replace(SIGNATUR, '$1$2[namn]')
    .replace(IGHANDTAG, '@…');
}

/** Hela maskningen + städning av blanksteg. Ren. */
export function maska(text, taggar) {
  return maskaKontakt(maskaTaggar(text, taggar)).replace(/\s+/g, ' ').trim();
}
