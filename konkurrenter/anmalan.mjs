// konkurrenter/anmalan.mjs — Meta-anmälan av de kopierade annonserna (Axels
// order 2026-09-29: "den går in och reportar annonsen också, och fyller i
// allting med rätt uppgifter … tio rippade annonser = tio olika reports …
// det enda jag vill göra är att bara verifiera").
//
// EN anmälan per annons, aldrig alla i samma. Varje anmälan bär exakt det
// Metas upphovsrättsformulär frågar efter (kontakt, rättighetshavare, länken
// till annonsen, vad som kopierats, var originalet finns, försäkringarna,
// underskriften) på engelska — Metas granskare sitter inte i Sverige — plus
// bevisbilden (vårt original ↔ deras annons, den kopierade texten markerad;
// Axels erfarenhet: skärmdump i anmälan ger högre träffsäkerhet).
//
// Här byggs bara paketet. Själva inskickningen sker i Axels egen webbläsare
// (Claude in Chrome) efter att han verifierat EN gång — facebook.com svarar
// 403 från containern och formuläret kräver hans inloggning. Kvittot
// (Metas referensnummer) skrivs tillbaka med --anmald. Rena funktioner.

import { tid, bevisStatus } from './klipp.mjs';
import { originalFor } from './original.mjs';

export const FORMULAR = Object.freeze({
  facebook: 'https://www.facebook.com/help/contact/1758255661104383',
  instagram: 'https://help.instagram.com/contact/372592039493026',
});

export const FORSAKRINGAR = Object.freeze([
  'I have a good faith belief that the use of the copyrighted material described above is not authorised by the copyright owner, its agent, or the law.',
  'The information in this notification is accurate.',
  'I declare, under penalty of perjury, that I am the owner, or am authorised to act on behalf of the owner, of an exclusive right that is allegedly infringed.',
]);

/** Ad Library-länken normaliserad + bibliotekets id. Ren. */
export function annonsLank(lank) {
  const s = String(lank ?? '').trim();
  const m = s.match(/[?&]id=(\d{3,})/);
  return m ? { lank: `https://www.facebook.com/ads/library/?id=${m[1]}`, libraryId: m[1] } : { lank: s || null, libraryId: null };
}

/** Vår sidas Ad Library-lista (originalet), ur konfig.anmalan.vara_sidor. Ren. */
export function varAdLibraryLank(konfig, verksamhet, land = 'SE') {
  const sida = konfig?.anmalan?.vara_sidor?.[verksamhet];
  return sida ? `https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=${encodeURIComponent(land)}&search_type=page&view_all_page_id=${sida}` : null;
}

const talEn = (n) => Number(n).toLocaleString('en-GB');
const datumEn = (iso) => (iso ? new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Stockholm' }).format(new Date(iso)) : null);

/**
 * En anmälan för EN av deras annonser. `undertecknare` = { namn, epost, telefon, adress }
 * (konfig.anmalan.undertecknare), `bevisbildUrl` = publik länk till bevisbilden om den finns,
 * `original` = original.json:s `filmer` (våra annonser i annonsbiblioteket, kor.mjs --original).
 */
export function byggAnmalan(arende, annons, konfig, { undertecknare, nr = 1, antal = 1, nu = new Date().toISOString(), bevisbild = null, bevisbildUrl = null, original = null } = {}) {
  const foretag = konfig.brev?.foretag ?? {};
  const u = undertecknare ?? konfig.anmalan?.undertecknare ?? {};
  const deras = arende.deras ?? {};
  // Klippen (Axel 2026-09-29): finns valda rutor ur våra egna klipp är DE beviset — miniatyrträffen
  // (annonsens förhandsbild) är det lånade klippet och nämns då inte alls, inte heller annonsen den pekade på.
  const s = bevisStatus(annons);
  const klipp = s.film ? annons.klipp : null;
  // Produkten: filmernas när klippen bär beviset (paren pekar på vår film), annars fyndets, annars ärendets.
  const prod = (klipp?.produkt?.url ? klipp.produkt : null) ?? annons.produkt ?? arende.var?.produkt ?? {};
  const { lank, libraryId } = annonsLank(annons.lank);
  const text = s.text ? annons.text : null;
  const bilder = s.bild || s.overifierad ? annons.bilder ?? [] : [];
  const passage = text?.passager?.[0]?.text ?? null;
  const filmer = klipp ? klipp.filmer ?? [] : [];
  const kalla = [...new Set([text ? annons.varAnnons?.namn : null, ...filmer, bilder.length ? annons.varAnnons?.namn : null].filter(Boolean))];
  const varAnnons = kalla.length ? `our ${kalla.length === 1 ? 'ad' : 'ads'} ${kalla.map((n) => `"${n}"`).join(', ')}` : 'our ad';
  const delar = [];
  if (text) delar.push(`${text.kopieradeOrd} words of our advertising copy appear verbatim in this ad; the longest identical run is ${text.langsta} consecutive words: "${passage}".`);
  if (klipp) {
    const d = klipp.datum ?? null;
    const nar = d ? (d.forsta === d.sista ? ` (published by us on ${datumEn(d.forsta)}${annons.start ? `, before this ad started running on ${datumEn(annons.start)}` : ''})` : ` (published by us between ${datumEn(d.forsta)} and ${datumEn(d.sista)}${annons.start ? `, before this ad started running on ${datumEn(annons.start)}` : ''})`) : '';
    delar.push(`The ad's video is cut from our own ad film${filmer.length === 1 ? '' : 's'}${filmer.length ? ` ${filmer.map((f) => `"${f}"`).join(', ')}` : ''}${nar}: ${klipp.antal} still frames from different scenes of the reported video (at ${(klipp.par ?? []).map((p) => tid(p.derasT)).join(', ')}) are identical to frames of our film${filmer.length === 1 ? '' : 's'} (perceptual-hash distance ${(klipp.par ?? []).map((p) => p.avstand).join(', ')}/64), and ${klipp.andel}% of the reported video's sampled frames match our films frame for frame${klipp.jamforda ? ` (compared against ${klipp.jamforda} of our films)` : ''}.`);
  }
  else if (bilder.length) delar.push(`${bilder.length} image${bilder.length === 1 ? '' : 's'} in the ad ${bilder.length === 1 ? 'is' : 'are'} our own copyrighted advertising image${bilder.length === 1 ? '' : 's'} — a still frame or photo taken from our own ad (perceptual-hash comparison: ${bilder.map((b) => `${b.grad === 'identisk' ? 'identical' : 'near-identical'}, distance ${b.avstand}/64`).join('; ')}).`);
  if (s.overifierad && annons.video) delar.push('The ad is a video that uses our material.');
  const sida = deras.sidnamn ? `the Facebook page "${deras.sidnamn}"${deras.sidaId ? ` (page ID ${deras.sidaId})` : ''}` : `the advertiser${deras.doman ? ` behind ${deras.doman}` : ''}`;
  const exp = Number(annons.exponeringar) > 0 ? ` According to the Ad Library it has reached approximately ${talEn(annons.exponeringar)} people in the EU.` : '';
  const start = annons.start && !klipp?.datum ? ` The ad has been running since ${datumEn(annons.start)}.` : '';
  // Originalen (Axel 2026-09-29: "du måste hitta annonserna inne i vårt ad library"): våra egna annonser med
  // filmerna, verifierade ruta för ruta — ledfilmen först, den går i formulärets exempelfält (EN länk).
  const originaler = klipp && original ? originalFor(klipp, original).map((o) => ({ film: o.film, lank: o.lank, arkivId: o.arkivId ?? null, start: o.start ?? null, sida: o.sida ?? null, sidaId: o.sidaId ?? null })) : [];
  const orgMening = originaler.length ? ` Our original ad${originaler.length === 1 ? ' is' : 's are'} public in Meta's Ad Library: ${originaler.map((o) => `"${o.film}" ${o.lank}`).join(', ')}.` : '';
  const contentDescription = `This advertisement, run by ${sida}, reproduces our copyrighted advertising material without authorisation. ${delar.join(' ')}${orgMening}${start}${exp} It copies ${varAnnons} for the product "${prod.titel ?? prod.handle ?? ''}", which our page ran before this ad appeared. This is report ${nr} of ${antal} concerning ads from the same advertiser; each ad is reported separately.`;
  // Ordningen är formulärets: [0] blir "example of your copyrighted work". Utan hittat original är det vår sidas lista i annonsbiblioteket — aldrig produktsidan först.
  const originalWorkUrls = [...new Set([...originaler.map((o) => o.lank), varAdLibraryLank(konfig, prod.verksamhet ?? arende.verksamhet), prod.url].filter(Boolean))];
  const sidnamn = originaler.find((o) => o.sida)?.sida ?? null;
  const originalWorkDescription = klipp
    ? `Original advertising films produced by ${foretag.namn ?? 'Stonebite Ecom AB'} for our store${prod.butik ? ` ${prod.butik}` : ''} (product: "${prod.titel ?? ''}")${filmer.length ? `: ${filmer.map((f) => `"${f}"`).join(', ')}` : ''}. The footage is our own work and we hold the copyright. ${originaler.length ? `The original ads are public in Meta's Ad Library, run by our page${sidnamn ? ` ${sidnamn}` : ''} (links below).` : 'Our ads are listed in the Ad Library and the product page is at the links below.'}`
    : `Original advertising copy, product photographs and video produced by ${foretag.namn ?? 'Stonebite Ecom AB'} for our store${prod.butik ? ` ${prod.butik}` : ''} (product: "${prod.titel ?? ''}"). The text and the images are our own work and we hold the copyright. The original ad and product page are at the links below.`;
  const brevRad = arende.brev?.skickat ? ` A cease-and-desist letter${arende.faktura?.nr ? ` with invoice ${arende.faktura.nr}` : ''} was sent to the advertiser on ${datumEn(arende.brev.skickat.nar)}.` : '';
  const additionalInfo = `Evidence screenshot (${klipp ? 'frames from our film on the left, the same frames in the reported ad on the right' : 'our original on the left, the reported ad on the right, copied passage highlighted'}): ${bevisbildUrl ?? (bevisbild ? 'attached to this report' : 'available on request')}. Internal reference: ${arende.id}, report ${nr}/${antal}, prepared ${datumEn(nu)}.${brevRad}`;
  return {
    nr, antal, arende: arende.id, verksamhet: prod.verksamhet ?? arende.verksamhet, plattform: 'facebook', formular: FORMULAR.facebook,
    lank, libraryId, annonsNr: annons.nr ?? null, exponeringar: annons.exponeringar ?? null, video: Boolean(annons.video),
    grund: s.grund, filmer, originaler, produkt: prod.titel ?? prod.handle ?? null,
    falt: {
      reporter: { fullName: u.namn ?? null, email: u.epost ?? konfig.brev?.avsandare?.mail ?? null, phone: u.telefon ?? null, address: u.adress ?? `${foretag.adress ?? ''}, Sweden`, country: 'Sweden' },
      rightsOwner: { name: foretag.namn ?? null, registrationNumber: foretag.orgnr ?? null, relationship: `${u.roll ?? 'Authorised representative'} of the rights owner ${foretag.namn ?? ''} (Swedish company, reg. no. ${foretag.orgnr ?? '?'})` },
      contentUrls: [lank].filter(Boolean),
      contentDescription,
      originalWorkDescription,
      originalWorkUrls,
      additionalInfo,
      declarations: [...FORSAKRINGAR],
      signature: u.namn ?? null,
    },
    bevisbild, bevisbildUrl,
    status: 'utkast', skapad: nu,
  };
}

/** Det som stoppar en anmälan: ingen länk till annonsen, ingen undertecknare, inget bevis. Ren. */
export function kontrolleraAnmalan(a) {
  const fel = [];
  if (!a?.lank) fel.push(`anmälan ${a?.nr ?? '?'}: annonsen saknar Ad Library-länk (fältet "lank" i annonsfilen)`);
  if (!a?.falt?.reporter?.fullName) fel.push('undertecknare saknas — konkurrenter/konfig.json → anmalan.undertecknare.namn (eller --namn)');
  if (!a?.falt?.reporter?.email) fel.push('e-post saknas — anmalan.undertecknare.epost');
  if (!a?.falt?.rightsOwner?.registrationNumber) fel.push('org.nr saknas — brev.foretag.orgnr');
  if (!a?.falt?.originalWorkUrls?.length) fel.push(`anmälan ${a?.nr ?? '?'}: ingen länk till originalet (vår annons eller vår sida i annonsbiblioteket)`);
  if (!a?.bevisbild && !a?.bevisbildUrl) fel.push(`anmälan ${a?.nr ?? '?'}: ingen bevisbild — kör utan --utan-bevisbild eller kontrollera Chromium`);
  return fel;
}

/**
 * Alla anmälningar för ett ärende: en per annons med länk och ett BEVISAT fynd
 * (bevisStatus: text, film ur våra klipp eller bild). En annons där bara det
 * lånade klippet matchar anmäls aldrig — den hoppas med orsak.
 * Returnerar { anmalningar, hoppade: [{ nr, orsak }] }. Ren.
 */
export function byggAnmalningar(arende, konfig, { undertecknare, nu, bevisbilder = {}, original = null } = {}) {
  const alla = Array.isArray(arende.bevis?.annonser) ? arende.bevis.annonser.filter((t) => t.text?.styrka || t.bilder?.length || t.klipp?.antal || t.klippStatus) : [];
  const hoppade = [];
  const annonser = alla.filter((t) => { const s = bevisStatus(t); if (!s.bevisad) { hoppade.push({ nr: t.nr, orsak: `inte bevisad med vårt eget material: ${s.orsak}` }); return false; } return true; });
  const kandidater = annonser.filter((t) => { if (!annonsLank(t.lank).lank) { hoppade.push({ nr: t.nr, orsak: 'ingen Ad Library-länk' }); return false; } return true; });
  const anmalningar = kandidater.map((t, i) => byggAnmalan(arende, t, konfig, { undertecknare, nr: i + 1, antal: kandidater.length, nu, bevisbild: bevisbilder[t.nr]?.fil ?? null, bevisbildUrl: bevisbilder[t.nr]?.url ?? null, original }));
  return { anmalningar, hoppade };
}

/** Anmälan som text — det Axel verifierar och det sessionen fyller i fält för fält. Ren. */
export function anmalanText(a) {
  const f = a.falt;
  return [
    `REPORT ${a.nr}/${a.antal} — case ${a.arende} — form: ${a.formular}`,
    '',
    `Reported ad (URL): ${a.lank}`,
    '',
    '— Contact information —',
    `Full name: ${f.reporter.fullName ?? '?'}`,
    `Email: ${f.reporter.email ?? '?'}`,
    `Phone: ${f.reporter.phone ?? '(none)'}`,
    `Mailing address: ${f.reporter.address ?? '?'}`,
    `Rights owner: ${f.rightsOwner.name ?? '?'} (reg. no. ${f.rightsOwner.registrationNumber ?? '?'})`,
    `Relationship: ${f.rightsOwner.relationship}`,
    '',
    '— Content you want to report —',
    ...f.contentUrls.map((u) => `URL: ${u}`),
    `Description: ${f.contentDescription}`,
    '',
    '— Your copyrighted work —',
    `Description: ${f.originalWorkDescription}`,
    ...f.originalWorkUrls.map((u) => `Original URL: ${u}`),
    '',
    `Additional information: ${f.additionalInfo}`,
    '',
    '— Declarations (tick all) —',
    ...f.declarations.map((d) => `[x] ${d}`),
    '',
    `Electronic signature: ${f.signature ?? '?'}`,
    `Attachment: ${a.bevisbild ?? '(none)'}${a.bevisbildUrl ? ` · ${a.bevisbildUrl}` : ''}`,
  ].join('\n');
}
