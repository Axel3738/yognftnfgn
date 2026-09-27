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
// (2026-04-02); samlingen "Alla produkter" bar 254 produkter i admin och
// visar 240+ på sajten; Judge.me sa 964 recensioner med snittet 4,86;
// bolaget är Stonebite Ecom AB i Göteborg. Meningen "efter Sveriges
// flitigaste byggare" (varför bäver) är berättelsens egen — Axel bekräftar
// eller byter den.
//
// Axels andra order 2026-09-27 ("jag vill lowkey ha typ allt detta på min
// startsida"): hela historien ligger på startsidan — det svarta bandet med
// berättelsen och tidslinjen, det ljusa bandet "Varför en bäver?" med
// punkterna och "Vilka vi är", och recensioner från olika produkter.

export const ARBETSTEMA = 'Story v2 2026-09-27';
export const OM_OSS_HANDLE = 'om-oss';
export const OM_OSS_MALL = 'om-oss';

export const HISTORIA_TEXT =
  '<p>Bäverbutiken började inte som en butik. Den började i ett garage, med kablar som skulle kopplas, kabelskor som saknades och en tång som inte fungerade. Lösningen blev en liten snabbkoppling som man bara trycker fast. Vi döpte den till Bäverkopplingen, efter Sveriges flitigaste byggare.</p>' +
  '<p>Sedan kom Bäverlampan, för den som skruvar när det är mörkt. Och Bävertratten, som sitter fast på dunken när du tankar gräsklipparen. Varje gång var det samma sak: en vardagsgrej som borde finnas, men som ingen gjort ordentligt.</p>' +
  '<p>I dag är Bäverbutiken en hel butik med över 200 prylar för garaget, båten, trädgården och campingen. Tänk den där järnhandeln du gillar att gå runt i, fast på nätet och bara med det som faktiskt är värt att ha. Allt vi tar in får bevisa sig först. Det som inte håller måttet åker ut.</p>';
// Kvar för äldre tester och läsare: samma text på båda sidorna sedan v2.
export const HISTORIA_TEXT_START = HISTORIA_TEXT;
export const HISTORIA_TEXT_OM_OSS = HISTORIA_TEXT;

export const VARFOR_TEXT = '<p>Bävern bygger, lagar och fixar med det den har omkring sig. Den ger sig inte, och den gör det på gott humör. Det är precis den känslan vi vill att butiken ska ha: prylar för dig som hellre fixar själv än ringer någon.</p>';
export const VILKA_TEXT =
  '<p>Bäverbutiken drivs av Stonebite Ecom AB i Göteborg. Vi är ett litet gäng som hittar prylarna, testar dem, gör filmerna och svarar på mejlen själva.</p>' +
  '<p>Har du en fråga, en idé på en pryl som borde finnas, eller blev något inte som du tänkt? Mejla <a href="mailto:kundsupport@baverbutiken.se">kundsupport@baverbutiken.se</a>. Du kan också <a href="/pages/spara">spåra ditt paket</a> här på sidan. Tack för att du handlar hos oss.</p>';

const TIDSLINJE = {
  steg1: { type: 'steg', settings: { produkt: 'superkoppling', etikett: 'Steg 1', titel: 'Bäverkopplingen', text: 'Snabbkopplingen som startade allt. Tryck fast kabeln, hör klicket, klart.', lank: '' } },
  steg2: { type: 'steg', settings: { produkt: 'baverlampa-pro', etikett: 'Steg 2', titel: 'Bäverlampan', text: 'Pannlampan för den som skruvar när det är mörkt.', lank: '' } },
  steg3: { type: 'steg', settings: { produkt: 'bavertratt-tanka-utan-spill', etikett: 'Steg 3', titel: 'Bävertratten', text: 'Snäpper fast på dunken. Tanka gräsklipparen utan spill.', lank: '' } },
  idag: { type: 'idag', settings: { samling: 'alla-produkter', tal_reserv: '200+', tal_ord: 'prylar', etikett: 'I dag', titel: 'En hel butik', text: 'För garaget, båten, trädgården och campingen. Och det växer.', lank: '' } },
};

// Behålls som text för temaredigerarens block "Punkt" i Vår historia (används inte på startsidan sedan v2).
export const SA_TANKER_VI = {
  punkt1: { type: 'punkt', settings: { titel: 'Prylar som löser problem', text: '<p>Inga hyllvärmare. Varje sak i butiken finns för att den gör något i vardagen enklare, i garaget, på båten eller i trädgården.</p>' } },
  punkt2: { type: 'punkt', settings: { titel: 'Testat innan det får plats', text: '<p>Vi tar in mycket och behåller lite. Det kunderna gillar stannar. Det som inte håller måttet åker ut.</p>' } },
  punkt3: { type: 'punkt', settings: { titel: 'Svenskt företag i Göteborg', text: '<p>Kundtjänst på svenska, Klarna, fri frakt över 300 kr och 14 dagars ångerrätt.</p>' } },
};

const RAKNA_MED = {
  p1: { type: 'punkt', settings: { titel: 'Prylar som löser ett riktigt problem', text: '<p>Inte saker som fyller en hylla. Varje pryl ska göra något i vardagen enklare.</p>' } },
  p2: { type: 'punkt', settings: { titel: 'Testat innan det får plats', text: '<p>Vi tar in mycket och behåller lite. Det som inte håller måttet åker ut.</p>' } },
  p3: { type: 'punkt', settings: { titel: 'Priser som går att räkna hem', text: '<p>Bra grejer ska inte behöva kosta som ett märke.</p>' } },
  p4: { type: 'punkt', settings: { titel: 'Trygg handel', text: '<p>Klarna, fri frakt över 300 kr, 14 dagars ångerrätt och kundtjänst på svenska.</p>' } },
};

const FORTROENDE = {
  type: 'bb-fortroende',
  blocks: {
    betyg: { type: 'betyg', settings: { ikon: 'stjarna', rad: 'recensioner från kunder', lank: '#kunderna-sager', titel_reserv: 'Recensioner', rad_reserv: 'från riktiga kunder' } },
    frakt: { type: 'punkt', settings: { ikon: 'paket', titel: 'Fri frakt', rad: 'på ordrar över 300 kr', lank: '' } },
    klarna: { type: 'punkt', settings: { ikon: 'kort', titel: 'Klarna', rad: 'få först, betala sen', lank: '' } },
    svenskt: { type: 'punkt', settings: { ikon: 'flagga', titel: 'Svenskt företag', rad: 'Göteborg · 14 dagars ångerrätt', lank: '#var-historia' } },
  },
  block_order: ['betyg', 'frakt', 'klarna', 'svenskt'],
  settings: { bakgrund: '#f6f6f4', textfarg: '#111111', ikonbakgrund: '#dd1d1d', ikonfarg: '#ffffff' },
};

/** Recensionssektionen: korten ur storytelling/recensioner.json (recensioner.mjs väljer dem). */
export function recensionerSektion(recensioner = []) {
  const blocks = {}; const order = [];
  for (const r of recensioner) {
    if (!r?.handle || !r?.text) continue;
    const id = `rec_${String(r.id ?? order.length).replace(/[^0-9a-z]/gi, '')}`;
    blocks[id] = { type: 'recension', settings: { produkt: r.handle, namn: r.namn ?? 'Kund', betyg: Number(r.betyg) || 5, rubrik: r.rubrik ?? '', text: r.text, verifierad: Boolean(r.verifierad), datum: r.datum ?? '' } };
    order.push(id);
  }
  return {
    type: 'bb-recensioner',
    blocks, block_order: order,
    settings: { overrad: 'Recensioner', rubrik: 'Kunderna har ordet', ingress: '', bara_med_produkt: true, visa_karusell: false, visa_medaljer: true, bakgrund: '#ffffff', kortbakgrund: '#f6f6f4', textfarg: '#111111', accent: '#dd1d1d' },
  };
}

/** Historiesektionen (det svarta bandet). `bild` = shopify://shop_images/<fil> eller null. */
export function historiaSektion({ bild = null, overrad = 'Vår historia', knapp = true } = {}) {
  return {
    // Bara tidslinjen här: punkterna "Så tänker vi" sa samma sak som "Vad du kan
    // räkna med" i bandet under (sett i förhandsvisningen 2026-09-27).
    type: 'bb-historia',
    blocks: structuredClone(TIDSLINJE),
    block_order: Object.keys(TIDSLINJE),
    settings: {
      ...(bild ? { bild } : {}),
      bild_alt: 'Ett garage med verktyg, en tratt och en bensindunk',
      overrad,
      rubrik: 'Det började med en koppling',
      text: HISTORIA_TEXT,
      signatur_namn: 'Axel, grundare',
      signatur_rad: 'Bäverbutiken, Göteborg',
      knapp_text: knapp ? 'Mer om oss' : '',
      knapp_lank: knapp ? `/pages/${OM_OSS_HANDLE}` : '',
      tidslinje_rubrik: 'Så växte butiken',
      punkter_rubrik: '',
      bakgrund: '#000000',
      textfarg: '#ffffff',
      accent: '#dd1d1d',
      kortbakgrund: '#161616',
    },
  };
}

/** "Varför en bäver" (det ljusa bandet). `bild` = bävern. */
export function varforSektion({ bild = null, knapp = false } = {}) {
  return {
    type: 'bb-varfor',
    blocks: structuredClone(RAKNA_MED),
    block_order: Object.keys(RAKNA_MED),
    settings: {
      ...(bild ? { bild } : {}),
      bild_alt: 'Bäverbutikens bäver med kabel och skiftnyckel',
      overrad: 'Varför en bäver?',
      rubrik: 'Bävern bygger. Vi också.',
      text: VARFOR_TEXT,
      punkter_rubrik: 'Vad du kan räkna med',
      numrera: true,
      vilka_rubrik: 'Vilka vi är',
      vilka_text: VILKA_TEXT,
      knapp_text: knapp ? 'Mer om oss' : '',
      knapp_lank: knapp ? `/pages/${OM_OSS_HANDLE}` : '',
      bakgrund: '#f4efe4',
      kortbakgrund: '#ffffff',
      textfarg: '#111111',
      accent: '#dd1d1d',
    },
  };
}

export const NYCKLAR = { fortroende: 'bb_fortroende', historia: 'bb_historia', varfor: 'bb_varfor', recensioner: 'bb_recensioner' };

const arAktiv = (s) => s && s.disabled !== true;

/**
 * Startsidan: lägger in (eller skriver om) sektionerna i templates/index.json.
 * Ordningen: hero → förtroenderaden → bästsäljarna → recensionerna → historien
 * (svart) → varför en bäver (ljust) → resten som förut (kategorier, nyhetsbrev,
 * kontakt). Hittas ingen hero/bästsäljare läggs de före nyhetsbrevet.
 *   byggIndex(json, { bilder: { start, omOss }, recensioner }) → nytt objekt (originalet rörs inte)
 */
export function byggIndex(json, { bild = null, bilder = null, recensioner = [] } = {}) {
  if (!json || typeof json !== 'object' || !json.sections || !Array.isArray(json.order)) throw new Error('templates/index.json ser inte ut som väntat (sections + order saknas) — inget skrivs.');
  const b = bilder ?? { start: bild, omOss: null };
  const ut = structuredClone(json);
  const egna = Object.values(NYCKLAR);
  for (const n of egna) delete ut.sections[n];
  const ordning = ut.order.filter((n) => !egna.includes(n));
  ut.sections[NYCKLAR.fortroende] = structuredClone(FORTROENDE);
  ut.sections[NYCKLAR.recensioner] = recensionerSektion(recensioner);
  ut.sections[NYCKLAR.historia] = historiaSektion({ bild: b.start ?? null });
  ut.sections[NYCKLAR.varfor] = varforSektion({ bild: b.omOss ?? null });

  const typ = (n) => ut.sections[n]?.type;
  const forstaAktiva = (lista, t) => lista.findIndex((n) => typ(n) === t && arAktiv(ut.sections[n]));
  const ny = [...ordning];
  const hero = forstaAktiva(ny, 'slideshow');
  ny.splice(hero >= 0 ? hero + 1 : Math.max(forstaAktiva(ny, 'newsletter'), 0), 0, NYCKLAR.fortroende);
  const bast = forstaAktiva(ny, 'featured-collection');
  const plats = bast >= 0 ? bast + 1 : Math.max(forstaAktiva(ny, 'newsletter'), 0);
  ny.splice(plats, 0, NYCKLAR.recensioner, NYCKLAR.historia, NYCKLAR.varfor);
  ut.order = ny;
  return ut;
}

/** Om oss-sidans mall (templates/page.om-oss.json) — samma sektioner, utan knapparna, utan dubblerad text. */
export function byggOmOssMall({ bilder = null, recensioner = [] } = {}) {
  const b = bilder ?? { start: null, omOss: null };
  return {
    sections: {
      historia: historiaSektion({ bild: b.start ?? null, overrad: 'Om Bäverbutiken', knapp: false }),
      varfor: varforSektion({ bild: b.omOss ?? null, knapp: false }),
      fortroende: structuredClone(FORTROENDE),
      recensioner: recensionerSektion(recensioner),
    },
    order: ['historia', 'varfor', 'fortroende', 'recensioner'],
  };
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

// Sidan /pages/om-oss: mallen (ovan) ritar allt, så sidans egen kropp är kort
// och ärlig — den syns bara om någon byter mall till den vanliga.
export const OM_OSS = {
  titel: 'Om Bäverbutiken',
  handle: OM_OSS_HANDLE,
  mall: OM_OSS_MALL,
  body:
    HISTORIA_TEXT +
    '<h2>Varför en bäver?</h2>' + VARFOR_TEXT +
    '<h2>Vad du kan räkna med</h2>' +
    '<ul>' + Object.values(RAKNA_MED).map((p) => `<li><strong>${p.settings.titel}.</strong> ${p.settings.text.replace(/<\/?p>/g, '')}</li>`).join('') + '</ul>' +
    '<h2>Vilka vi är</h2>' + VILKA_TEXT +
    '<p>Axel, grundare</p>',
};

/** Orden som måste synas i kundens vy när allt sitter — trippelkollens facit. */
export const MARKORER = {
  startsida: ['data-section-type="bb-fortroende"', 'data-section-type="bb-recensioner"', 'data-section-type="bb-historia"', 'data-section-type="bb-varfor"', 'Det började med en koppling', 'Varför en bäver?', 'Vilka vi är', 'class="bb-rec__kort"', 'Om Bäverbutiken', 'Läs vår historia'],
  omOss: ['data-section-type="bb-historia"', 'data-section-type="bb-varfor"', 'Varför en bäver?', 'Vilka vi är', 'data-section-type="bb-recensioner"'],
};
