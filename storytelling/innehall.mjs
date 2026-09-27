// innehall.mjs — texten och strukturen för Bäverbutikens storytelling:
// vad som läggs in i templates/index.json (startsidan), i sidfoten
// (config/settings_data.json) och på sidan /pages/om-oss.
//
// Rena funktioner utan nät, så de går att testa. Skrivs till butiken av
// storytelling/publicera.mjs. Ändra texten HÄR (eller i temaredigeraren —
// nästa körning av publicera.mjs skriver då tillbaka repots version, så
// för in ändringen här också).
//
// Fakta bakom orden (mätt 2026-09-27): butiken hette Bäverkoppling först
// (produkten "Bäverkoppling - Slipp jobbiga kabelskor", handle superkoppling,
// skapad 2026-02-13), sedan Bäverlampa Pro (2026-03-03) och Bävertratten
// (2026-04-02); samlingen "Alla produkter" bar 254 produkter; Judge.me sa
// 964 recensioner med snittet 4,86; bolaget är Stonebite Ecom AB i Göteborg.
// Meningen "efter Sveriges flitigaste byggare" (varför bäver) är berättelsens
// egen — Axel bekräftar eller byter den.

export const ARBETSTEMA = 'Story + recensioner 2026-09-27';
export const OM_OSS_HANDLE = 'om-oss';
export const OM_OSS_MALL = 'om-oss';

export const HISTORIA_TEXT_START =
  '<p>Bäverbutiken började inte som en butik. Den började i ett garage, med kablar som skulle kopplas, kabelskor som saknades och en tång som inte fungerade. Lösningen blev en liten snabbkoppling som man bara trycker fast. Vi döpte den till Bäverkopplingen, efter Sveriges flitigaste byggare.</p>' +
  '<p>I dag är Bäverbutiken en hel butik med över 200 prylar för garaget, båten, trädgården och campingen. Tänk den där järnhandeln du gillar att gå runt i, fast på nätet och bara med det som faktiskt är värt att ha. Allt vi tar in får bevisa sig först. Det som inte håller måttet åker ut.</p>';

export const HISTORIA_TEXT_OM_OSS =
  '<p>Bäverbutiken började inte som en butik. Den började i ett garage, med kablar som skulle kopplas, kabelskor som saknades och en tång som inte fungerade. Lösningen blev en liten snabbkoppling som man bara trycker fast. Vi döpte den till Bäverkopplingen, efter Sveriges flitigaste byggare.</p>' +
  '<p>Sedan kom Bävertratten, som sitter fast på dunken när du tankar gräsklipparen. Och Bäverlampan, för den som skruvar när det är mörkt. Varje gång var det samma sak: en vardagsgrej som borde finnas, men som ingen gjort ordentligt.</p>' +
  '<p>I dag är Bäverbutiken en hel butik med över 200 prylar för garaget, båten, trädgården och campingen. Tänk den där järnhandeln du gillar att gå runt i, fast på nätet och bara med det som faktiskt är värt att ha. Allt vi tar in får bevisa sig först. Det som inte håller måttet åker ut.</p>';

const TIDSLINJE = {
  steg1: { type: 'steg', settings: { produkt: 'superkoppling', etikett: 'Steg 1', titel: 'Bäverkopplingen', text: 'Snabbkopplingen som startade allt. Tryck fast kabeln, hör klicket, klart.', lank: '' } },
  steg2: { type: 'steg', settings: { produkt: 'bavertratt-tanka-utan-spill', etikett: 'Steg 2', titel: 'Bävertratten', text: 'Snäpper fast på dunken. Tanka gräsklipparen utan spill.', lank: '' } },
  steg3: { type: 'steg', settings: { produkt: 'baverlampa-pro', etikett: 'Steg 3', titel: 'Bäverlampan', text: 'Pannlampan för den som skruvar när det är mörkt.', lank: '' } },
  idag: { type: 'idag', settings: { samling: 'alla-produkter', tal_reserv: '250+', tal_ord: 'prylar', etikett: 'I dag', titel: 'En hel butik', text: 'För garaget, båten, trädgården och campingen. Och det växer.', lank: '' } },
};

const PUNKTER = {
  punkt1: { type: 'punkt', settings: { titel: 'Prylar som löser problem', text: '<p>Inga hyllvärmare. Varje sak i butiken finns för att den gör något i vardagen enklare, i garaget, på båten eller i trädgården.</p>' } },
  punkt2: { type: 'punkt', settings: { titel: 'Testat innan det får plats', text: '<p>Vi tar in mycket och behåller lite. Det kunderna gillar stannar. Det som inte håller måttet åker ut.</p>' } },
  punkt3: { type: 'punkt', settings: { titel: 'Svenskt företag i Göteborg', text: '<p>Kundtjänst på svenska, Klarna, fri frakt över 300 kr och 14 dagars ångerrätt. Frågor? Mejla <a href="mailto:kundsupport@baverbutiken.se">kundsupport@baverbutiken.se</a>.</p>' } },
};

const FORTROENDE = {
  type: 'bb-fortroende',
  blocks: {
    betyg: { type: 'betyg', settings: { ikon: 'stjarna', rad: 'recensioner från kunder', lank: '#kunderna-sager', titel_reserv: 'Recensioner', rad_reserv: 'från riktiga kunder' } },
    frakt: { type: 'punkt', settings: { ikon: 'paket', titel: 'Fri frakt', rad: 'på ordrar över 300 kr', lank: '' } },
    klarna: { type: 'punkt', settings: { ikon: 'kort', titel: 'Klarna', rad: 'få först, betala sen', lank: '' } },
    svenskt: { type: 'punkt', settings: { ikon: 'flagga', titel: 'Svenskt företag', rad: 'Göteborg · 14 dagars ångerrätt', lank: `/pages/${OM_OSS_HANDLE}` } },
  },
  block_order: ['betyg', 'frakt', 'klarna', 'svenskt'],
  settings: { bakgrund: '#f6f6f4', textfarg: '#111111', ikonbakgrund: '#dd1d1d', ikonfarg: '#ffffff' },
};

const RECENSIONER = {
  type: 'bb-recensioner',
  settings: { overrad: 'Recensioner', rubrik: 'Kunderna har ordet', ingress: '', visa_medaljer: true, bakgrund: '#ffffff', textfarg: '#111111' },
};

/** Historiesektionen på startsidan. `bild` = shopify://shop_images/<fil> eller null. */
export function historiaSektion({ bild = null } = {}) {
  return {
    type: 'bb-historia',
    blocks: { ...structuredClone(TIDSLINJE), ...structuredClone(PUNKTER) },
    block_order: [...Object.keys(TIDSLINJE), ...Object.keys(PUNKTER)],
    settings: {
      ...(bild ? { bild } : {}),
      bild_alt: 'Bäverbutikens bäver i garaget',
      overrad: 'Vår historia',
      rubrik: 'Det började med en koppling',
      text: HISTORIA_TEXT_START,
      signatur_namn: 'Axel, grundare',
      signatur_rad: 'Bäverbutiken, Göteborg',
      knapp_text: 'Läs hela historien',
      knapp_lank: `/pages/${OM_OSS_HANDLE}`,
      tidslinje_rubrik: 'Så växte butiken',
      punkter_rubrik: 'Så tänker vi',
      bakgrund: '#000000',
      textfarg: '#ffffff',
      accent: '#dd1d1d',
      kortbakgrund: '#161616',
    },
  };
}

export const NYCKLAR = { fortroende: 'bb_fortroende', historia: 'bb_historia', recensioner: 'bb_recensioner' };

const arAktiv = (s) => s && s.disabled !== true;

/**
 * Startsidan: lägger in (eller skriver om) de tre sektionerna i templates/index.json.
 * Ordningen: hero → förtroenderaden → bästsäljarna → historien → recensionerna →
 * resten som förut. Hittas ingen hero/bästsäljare läggs de före nyhetsbrevet.
 *   byggIndex(json, { bild }) → nytt objekt (originalet rörs inte)
 */
export function byggIndex(json, { bild = null } = {}) {
  if (!json || typeof json !== 'object' || !json.sections || !Array.isArray(json.order)) throw new Error('templates/index.json ser inte ut som väntat (sections + order saknas) — inget skrivs.');
  const ut = structuredClone(json);
  const egna = Object.values(NYCKLAR);
  for (const n of egna) delete ut.sections[n];
  const ordning = ut.order.filter((n) => !egna.includes(n));
  ut.sections[NYCKLAR.fortroende] = structuredClone(FORTROENDE);
  ut.sections[NYCKLAR.historia] = historiaSektion({ bild });
  ut.sections[NYCKLAR.recensioner] = structuredClone(RECENSIONER);

  const typ = (n) => ut.sections[n]?.type;
  const forstaAktiva = (t) => ordning.findIndex((n) => typ(n) === t && arAktiv(ut.sections[n]));
  const ny = [...ordning];
  const nyhetsbrev = ny.findIndex((n) => typ(n) === 'newsletter');
  const hero = forstaAktiva('slideshow');
  ny.splice(hero >= 0 ? hero + 1 : Math.max(nyhetsbrev, 0), 0, NYCKLAR.fortroende);
  const bast = ny.findIndex((n) => typ(n) === 'featured-collection' && arAktiv(ut.sections[n]));
  const plats = bast >= 0 ? bast + 1 : Math.max(ny.findIndex((n) => typ(n) === 'newsletter'), 0);
  ny.splice(plats, 0, NYCKLAR.historia, NYCKLAR.recensioner);
  ut.order = ny;
  return ut;
}

export const FOOTER_OM_NYCKEL = 'om_baverbutiken';
export const FOOTER_OM_TEXT =
  '<p>Det började med en koppling i ett garage. I dag är Bäverbutiken en hel butik med prylar för garaget, båten, trädgården och campingen, alla utvalda för att de faktiskt löser något. Svenskt företag i Göteborg.</p>' +
  `<p><a href="/pages/${OM_OSS_HANDLE}">Läs vår historia</a></p>`;
export const FOOTER_FORETAG_TEXT = '<p>Bäverbutiken drivs och ägs av<br/>STONEBITE ECOM AB<br/>Org.nr 559576-2401<br/>Stenkolsgatan 1B<br/>417 07 Göteborg</p>';
export const FOOTER_KLUBB_TITEL = 'Bäverbutikens kundklubb';

/**
 * Sidfoten i config/settings_data.json: ett block "Om Bäverbutiken" (historien i
 * kortform + länk), företagsblocket med kontorsadressen, och kolumnbredder som
 * går jämnt ut på en rad (20 + 32 + 28 + 20). Loggan ligger kvar på egen rad.
 *   byggFooter(settingsJson) → nytt objekt
 */
export function byggFooter(json) {
  const footer = json?.current?.sections?.footer;
  if (!footer || !footer.blocks || !Array.isArray(footer.block_order)) throw new Error('config/settings_data.json saknar current.sections.footer med block — temat ser inte ut som väntat, inget skrivs.');
  const ut = structuredClone(json);
  const f = ut.current.sections.footer;
  const avTyp = (t) => f.block_order.find((id) => f.blocks[id]?.type === t);
  const menyId = avTyp('menu');
  const nyhetsbrevId = avTyp('newsletter');
  const logoId = avTyp('logo_social');
  const foretagId = f.block_order.find((id) => f.blocks[id]?.type === 'custom' && /STONEBITE/i.test(f.blocks[id]?.settings?.text ?? ''));

  f.blocks[FOOTER_OM_NYCKEL] = { type: 'custom', settings: { show_footer_title: true, title: 'Om Bäverbutiken', text: FOOTER_OM_TEXT, container_width: 32 } };
  if (menyId) f.blocks[menyId].settings.container_width = 20;
  if (nyhetsbrevId) {
    f.blocks[nyhetsbrevId].settings.container_width = 28;
    if (/BODYSHAPER/i.test(f.blocks[nyhetsbrevId].settings.title ?? '')) f.blocks[nyhetsbrevId].settings.title = FOOTER_KLUBB_TITEL;
  }
  if (foretagId) {
    f.blocks[foretagId].settings.text = FOOTER_FORETAG_TEXT;
    f.blocks[foretagId].settings.container_width = 20;
  }
  const ordning = [menyId, FOOTER_OM_NYCKEL, nyhetsbrevId, foretagId, logoId].filter(Boolean);
  const ovriga = f.block_order.filter((id) => !ordning.includes(id));
  f.block_order = [...ordning, ...ovriga];
  return ut;
}

export const OM_OSS = {
  titel: 'Om Bäverbutiken',
  handle: OM_OSS_HANDLE,
  mall: OM_OSS_MALL,
  body:
    '<h2>Varför en bäver?</h2>' +
    '<p>Bävern bygger, lagar och fixar med det den har omkring sig. Den ger sig inte, och den gör det på gott humör. Det är precis den känslan vi vill att butiken ska ha: prylar för dig som hellre fixar själv än ringer någon.</p>' +
    '<h2>Vad du kan räkna med</h2>' +
    '<ul>' +
    '<li><strong>Prylar som löser ett riktigt problem.</strong> Inte saker som fyller en hylla.</li>' +
    '<li><strong>Testat innan det får plats.</strong> Vi tar in mycket och behåller lite. Det som inte håller måttet åker ut.</li>' +
    '<li><strong>Priser som går att räkna hem.</strong> Bra grejer ska inte behöva kosta som ett märke.</li>' +
    '<li><strong>Trygg handel.</strong> Klarna, fri frakt över 300 kr, 14 dagars ångerrätt och kundtjänst på svenska.</li>' +
    '</ul>' +
    '<h2>Vilka vi är</h2>' +
    '<p>Bäverbutiken drivs av Stonebite Ecom AB i Göteborg. Vi är ett litet gäng som hittar prylarna, testar dem, gör filmerna och svarar på mejlen själva.</p>' +
    '<p>Har du en fråga, en idé på en pryl som borde finnas, eller blev något inte som du tänkt? Mejla <a href="mailto:kundsupport@baverbutiken.se">kundsupport@baverbutiken.se</a>. Du kan också <a href="/pages/spara">spåra ditt paket</a> här på sidan.</p>' +
    '<p>Tack för att du handlar hos oss.<br/>Axel, grundare</p>',
};

/** Orden som måste synas i kundens vy när allt sitter — trippelkollens facit. */
export const MARKORER = {
  startsida: ['data-section-type="bb-fortroende"', 'data-section-type="bb-historia"', 'data-section-type="bb-recensioner"', 'Det började med en koppling', 'jdgm-carousel-wrapper', 'Om Bäverbutiken', 'Läs vår historia'],
  omOss: ['data-section-type="bb-historia"', 'Varför en bäver?', 'Vilka vi är', 'data-section-type="bb-recensioner"'],
};
