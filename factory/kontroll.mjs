// LAUNCH-verifieringen: de tolv punkterna som måste vara gröna innan något
// går live. Ren logik utan nätverk — anropas med produktfilen plus det som
// lästs ur Shopify, så den går att testa.
//
// Tre utfall per punkt:
//   ok      — verifierat grönt
//   kritisk — STOPP, launchen avbryts
//   manuell — kan inte verifieras via API:t, Axel måste titta själv

const lista = (v) => (Array.isArray(v) ? v.filter((x) => x !== null && x !== '') : []);
const text = (v) => typeof v === 'string' && v.trim() !== '';

// Gemensamma OPS-annonskontot MagiBorsten DK — alla butiker, ändras aldrig.
const OPS_ANNONSKONTO = '915422744950975';

const OBLIGATORISKA_POLICYER = {
  REFUND_POLICY: 'returpolicy',
  SHIPPING_POLICY: 'fraktpolicy',
  TERMS_OF_SERVICE: 'köpvillkor',
  PRIVACY_POLICY: 'integritetspolicy',
};

export function kontrolleraLaunch(p, { shop = null, produkt = null, policyer = null } = {}) {
  const punkter = [];
  const ok = (namn, detalj) => punkter.push({ namn, utfall: 'ok', detalj });
  const kritisk = (namn, detalj) => punkter.push({ namn, utfall: 'kritisk', detalj });
  const manuell = (namn, detalj) => punkter.push({ namn, utfall: 'manuell', detalj });

  // 1. Produkt
  if (!produkt) {
    kritisk('produkt', 'Produkten finns inte i Shopify — kör BUILD först.');
  } else if (produkt.handle !== p.produkt.id) {
    kritisk('produkt', `Handle i butiken (${produkt.handle}) matchar inte produktfilen (${p.produkt.id}).`);
  } else {
    ok('produkt', `${produkt.title} (${produkt.handle}), status ${produkt.status}`);
  }

  // 2. Priser
  const eko = p.ekonomi ?? {};
  const butiksVarianter = produkt?.variants?.nodes ?? [];
  const felPris = butiksVarianter.filter((v) => Number(v.price) !== Number(eko.pris));
  if (butiksVarianter.length === 0) {
    kritisk('priser', 'Inga varianter lästes ur butiken.');
  } else if (felPris.length > 0) {
    kritisk(
      'priser',
      `${felPris.length} variant(er) har annat pris i butiken än i produktfilen (${eko.pris}).`
    );
  } else {
    ok('priser', `${eko.pris} ${eko.valuta} på alla varianter, jämförpris ${eko.jamforpris || '—'}`);
  }

  // 3. Varianter
  const filVarianter = lista(p.varianter);
  const forvantat = filVarianter.length || 1;
  if (butiksVarianter.length !== forvantat) {
    kritisk('varianter', `Butiken har ${butiksVarianter.length} varianter, produktfilen ${forvantat}.`);
  } else {
    ok('varianter', `${forvantat} st`);
  }

  // 4. Bilder
  const bilder = lista(p.media?.bilder);
  // Butikens media kommer i två former: rå { nodes } från API:t, eller
  // shopify.hamtaProduktViaHandle:s tolkade lista. Den senare gav "ingen
  // media uppladdad" på en produkt med tre bilder (AdventLane 2026-09-10).
  const antalMedia = Array.isArray(produkt?.media) ? produkt.media.length : (produkt?.media?.nodes?.length ?? 0);
  if (bilder.length === 0) {
    kritisk('bilder', 'Inga bilder i produktfilen.');
  } else if (produkt && antalMedia === 0) {
    kritisk('bilder', 'Produkten i butiken har ingen media uppladdad.');
  } else {
    ok('bilder', `${bilder.length} st${produkt ? `, ${antalMedia} media i butiken` : ''}`);
  }

  // 5. Copy
  const saknadCopy = [
    !text(p.vinkel?.huvudvinkel) && 'huvudvinkel',
    lista(p.problem).length === 0 && 'problem',
    lista(p.benefits).length === 0 && 'benefits',
    !text(p.offer?.beskrivning) && 'offer.beskrivning',
  ].filter(Boolean);
  if (saknadCopy.length > 0) {
    kritisk('copy', `Saknas: ${saknadCopy.join(', ')}`);
  } else {
    ok('copy', 'vinkel, problem, benefits och erbjudande finns');
  }

  // 5b. Beskrivningsstrukturen — texterna och den kritiska median för blocken
  // 1–4 (problem + gif, lösning + media). bild_lifestyle är valfri: sektionen
  // döljer sig själv, därför blockerar den aldrig.
  const besk = p.beskrivning ?? {};
  const saknadStruktur = [
    !text(besk.problem_rubrik) && 'beskrivning.problem_rubrik',
    !text(besk.problem_text) && 'beskrivning.problem_text',
    !text(besk.losning_rubrik) && 'beskrivning.losning_rubrik',
    !text(besk.losning_text) && 'beskrivning.losning_text',
    !text(p.media?.gif_problem) && 'media.gif_problem',
    !text(p.media?.media_losning) && 'media.media_losning',
  ].filter(Boolean);
  if (saknadStruktur.length > 0) {
    kritisk('beskrivning', `Saknas: ${saknadStruktur.join(', ')}`);
  } else {
    ok('beskrivning', 'problem, lösning och kritisk media (gif + demo) finns');
  }

  // 6. Reviews — importeras till Judge.me, visas aldrig av en egen sektion.
  const reviews = lista(p.reviews);
  if (reviews.length < 3) {
    kritisk('reviews', `Bara ${reviews.length} recensioner — minst 3 krävs för launch.`);
  } else {
    ok('reviews', `${reviews.length} st i Judge.me-underlaget`);
    manuell('judgeme', 'Importera underlaget och verifiera att widgeten visar recensionerna.');
  }

  // 7. Frakt
  if (!text(p.shipping?.tid)) {
    kritisk('frakt', 'shipping.tid saknas i produktfilen.');
  } else {
    ok('frakt', p.shipping.tid);
    manuell('frakt-zoner', 'Kontrollera fraktzon och pris i Shopify → Frakt och leverans.');
  }

  // 8. Guarantee
  const garantier = lista(p.garantier);
  if (garantier.length === 0) {
    kritisk('guarantee', 'Ingen garanti angiven.');
  } else {
    ok('guarantee', garantier[0]);
  }

  // 9. Tracking
  const meta = p.meta ?? {};
  const saknadTracking = ['pixel_id', 'ad_account_id', 'page_id'].filter((f) => !text(meta[f]));
  if (saknadTracking.length > 0) {
    kritisk('tracking', `meta.${saknadTracking.join(', meta.')} saknas.`);
  } else if (String(meta.ad_account_id) !== OPS_ANNONSKONTO) {
    kritisk('tracking', `meta.ad_account_id är ${meta.ad_account_id} — alla OPS-butiker kör MagiBorsten DK ${OPS_ANNONSKONTO}.`);
  } else {
    ok('tracking', `pixel ${meta.pixel_id}, konto ${meta.ad_account_id}`);
    manuell('tracking-koppling', 'Verifiera att pixeln tar emot events i Meta Events Manager.');
  }

  // 10. Theme
  manuell('theme', 'Temat måste vara valt och sektionerna inlagda i Shopify-editorn.');

  // 11. Domänstatus
  if (!shop) {
    kritisk('doman', 'Kunde inte läsa butiken — connection-check misslyckades.');
  } else if (!shop.primaryDomain?.host) {
    kritisk('doman', 'Ingen primär domän satt i butiken.');
  } else if (shop.primaryDomain.host.endsWith('.myshopify.com')) {
    kritisk('doman', `Primär domän är fortfarande ${shop.primaryDomain.host} — riktig domän saknas.`);
  } else if (text(p.launch?.doman) && shop.primaryDomain.host !== p.launch.doman) {
    kritisk('doman', `Butikens domän är ${shop.primaryDomain.host}, launch-inputen säger ${p.launch.doman}.`);
  } else if (!shop.primaryDomain.sslEnabled) {
    kritisk('doman', `SSL är inte aktivt på ${shop.primaryDomain.host}.`);
  } else {
    ok('doman', `${shop.primaryDomain.host} med SSL`);
  }

  // 12. Köpvillkor — Meta och Shopify Payments kräver dem
  if (!policyer) {
    kritisk('villkor', 'Butikens policyer kunde inte läsas.');
  } else {
    const finns = new Set(
      policyer.filter((x) => typeof x?.body === 'string' && x.body.trim() !== '').map((x) => x.type)
    );
    const saknas = Object.entries(OBLIGATORISKA_POLICYER)
      .filter(([typ]) => !finns.has(typ))
      .map(([, namn]) => namn);
    // Exempeluppgifter passerar [FYLL I]-kontrollen men får aldrig gå live.
    const PLATSHALLARE = [/\[FYLL I\]/i, /exempelbolaget/i, /556000-0000/, /exempelgatan/i, /example\.com/i];
    const smutsig = policyer.find((x) => PLATSHALLARE.some((m) => m.test(String(x.body))));
    if (saknas.length > 0) {
      kritisk('villkor', `Saknas i butiken: ${saknas.join(', ')}.`);
    } else if (smutsig) {
      kritisk('villkor', `${smutsig.type} innehåller platshållare eller exempeluppgifter.`);
    } else {
      ok('villkor', `${finns.size} policyer på plats`);
    }
  }

  // 13. Checkout
  if (shop && text(eko.valuta) && shop.currencyCode !== eko.valuta) {
    kritisk('checkout', `Butikens valuta är ${shop.currencyCode}, produktfilen säger ${eko.valuta}.`);
  } else if (shop) {
    ok('checkout', `valuta ${shop.currencyCode}`);
    manuell('checkout-betalning', 'Gör ett testköp och bekräfta att betalleverantören är aktiv.');
  }

  const kritiska = punkter.filter((x) => x.utfall === 'kritisk');
  return { punkter, kritiska, manuella: punkter.filter((x) => x.utfall === 'manuell'), gron: kritiska.length === 0 };
}
