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
 * (konfig.anmalan.undertecknare), `bevisbildUrl` = publik länk till bevisbilden om den finns.
 */
export function byggAnmalan(arende, annons, konfig, { undertecknare, nr = 1, antal = 1, nu = new Date().toISOString(), bevisbild = null, bevisbildUrl = null } = {}) {
  const foretag = konfig.brev?.foretag ?? {};
  const u = undertecknare ?? konfig.anmalan?.undertecknare ?? {};
  const deras = arende.deras ?? {};
  // Produkten PER ANNONS när fyndet bär den (en sida kan kopiera flera av våra produkter — ORVO: takskydd + IBC), annars ärendets.
  const prod = annons.produkt ?? arende.var?.produkt ?? {};
  const { lank, libraryId } = annonsLank(annons.lank);
  const text = annons.text?.styrka ? annons.text : null;
  const bilder = annons.bilder ?? [];
  const passage = text?.passager?.[0]?.text ?? null;
  const delar = [];
  if (text) delar.push(`${text.kopieradeOrd} words of our advertising copy appear verbatim in this ad; the longest identical run is ${text.langsta} consecutive words: "${passage}".`);
  if (bilder.length) delar.push(`${bilder.length} image${bilder.length === 1 ? '' : 's'} in the ad ${bilder.length === 1 ? 'is' : 'are'} our own copyrighted product photograph${bilder.length === 1 ? '' : 's'} (perceptual-hash comparison: ${bilder.map((b) => `${b.grad === 'identisk' ? 'identical' : 'near-identical'}, distance ${b.avstand}/64`).join('; ')}).`);
  if (annons.video) delar.push('The ad is a video that uses our material.');
  const sida = deras.sidnamn ? `the Facebook page "${deras.sidnamn}"${deras.sidaId ? ` (page ID ${deras.sidaId})` : ''}` : `the advertiser${deras.doman ? ` behind ${deras.doman}` : ''}`;
  const exp = Number(annons.exponeringar) > 0 ? ` According to the Ad Library it has reached approximately ${talEn(annons.exponeringar)} people in the EU.` : '';
  const start = annons.start ? ` The ad has been running since ${datumEn(annons.start)}.` : '';
  const varAnnons = annons.varAnnons?.namn ? `our ad "${annons.varAnnons.namn}"` : 'our ad';
  const contentDescription = `This advertisement, run by ${sida}, reproduces our copyrighted advertising material without authorisation. ${delar.join(' ')}${start}${exp} It copies ${varAnnons} for the product "${prod.titel ?? prod.handle ?? ''}", which our page has been running since before this ad appeared. This is report ${nr} of ${antal} concerning ads from the same advertiser; each ad is reported separately.`;
  const originalWorkUrls = [prod.url, varAdLibraryLank(konfig, prod.verksamhet ?? arende.verksamhet)].filter(Boolean);
  const originalWorkDescription = `Original advertising copy, product photographs and video produced by ${foretag.namn ?? 'Stonebite Ecom AB'} for our store${prod.butik ? ` ${prod.butik}` : ''} (product: "${prod.titel ?? ''}"). The text and the images are our own work and we hold the copyright. The original ad and product page are at the links below.`;
  const brevRad = arende.brev?.skickat ? ` A cease-and-desist letter${arende.faktura?.nr ? ` with invoice ${arende.faktura.nr}` : ''} was sent to the advertiser on ${datumEn(arende.brev.skickat.nar)}.` : '';
  const additionalInfo = `Evidence screenshot (our original on the left, the reported ad on the right, copied passage highlighted): ${bevisbildUrl ?? (bevisbild ? 'attached to this report' : 'available on request')}. Internal reference: ${arende.id}, report ${nr}/${antal}, prepared ${datumEn(nu)}.${brevRad}`;
  return {
    nr, antal, arende: arende.id, verksamhet: arende.verksamhet, plattform: 'facebook', formular: FORMULAR.facebook,
    lank, libraryId, annonsNr: annons.nr ?? null, exponeringar: annons.exponeringar ?? null, video: Boolean(annons.video),
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
  if (!a?.falt?.originalWorkUrls?.length) fel.push(`anmälan ${a?.nr ?? '?'}: ingen länk till originalet (produktsidan eller vår sida i annonsbiblioteket)`);
  if (!a?.bevisbild && !a?.bevisbildUrl) fel.push(`anmälan ${a?.nr ?? '?'}: ingen bevisbild — kör utan --utan-bevisbild eller kontrollera Chromium`);
  return fel;
}

/**
 * Alla anmälningar för ett ärende: en per annons med länk och träff (text eller bild).
 * Returnerar { anmalningar, hoppade: [{ nr, orsak }] }. Ren.
 */
export function byggAnmalningar(arende, konfig, { undertecknare, nu, bevisbilder = {} } = {}) {
  const annonser = Array.isArray(arende.bevis?.annonser) ? arende.bevis.annonser.filter((t) => t.text?.styrka || t.bilder?.length) : [];
  const hoppade = [];
  const kandidater = annonser.filter((t) => { if (!annonsLank(t.lank).lank) { hoppade.push({ nr: t.nr, orsak: 'ingen Ad Library-länk' }); return false; } return true; });
  const anmalningar = kandidater.map((t, i) => byggAnmalan(arende, t, konfig, { undertecknare, nr: i + 1, antal: kandidater.length, nu, bevisbild: bevisbilder[t.nr]?.fil ?? null, bevisbildUrl: bevisbilder[t.nr]?.url ?? null }));
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
