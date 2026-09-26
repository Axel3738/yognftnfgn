// forklaring.mjs — teknisk text in, svenska ut.
//
// Ett API-fel som "403 {\"errors\":\"[API] This action requires merchant
// approval for read_orders scope.\"}" säger ingenting för den som ska fatta
// beslutet. Här översätts de fel vi faktiskt har mätt till en mening som
// säger VAD som är fel och VEM som fixar det.
//
// Okänd text skickas vidare i korthet — aldrig gömd. Ett fel vi inte känner
// igen ska synas som ett fel, inte som tystnad.

const FELREGLER = [
  {
    // kallor/shopify.mjs har redan provat ALLA appar som pekar på butiken och
    // skrivit en mening som säger vilka, och vad som fixar det — den behålls.
    test: /^Shopify-appen bakom .* får inte läsa ordrar/,
    text: (ra) => ra.split(/\. /)[0].replace(/\.$/, '') + '.',
    atgard: (ra) => `Axel: ${ra.split(/\. /).slice(1).join('. ').trim()}`,
  },
  {
    test: /merchant approval for read_orders/i,
    text: 'Shopify-appen får inte läsa ordrar än. Någon måste slå på "Protected customer data access" för appen.',
    atgard: 'Axel: dev.shopify.com → appen → API access → begär kunddata.',
  },
  {
    test: /app_not_installed|inte installerad/i,
    text: 'Appen är inte installerad i den butiken, så det finns ingen nyckel att läsa med.',
    atgard: 'Axel: installera fabrikens app i butiken, eller ta bort butiken ur listan.',
  },
  {
    test: /Unavailable Shop|402/,
    text: 'Butiken är pausad eller stängd hos Shopify (ingen betald plan).',
    atgard: '',
  },
  {
    test: /nycklarna saknas/i,
    text: 'Inloggningsuppgifterna till butiken finns inte i miljön.',
    atgard: 'Axel: lägg in SHOPIFY_SHOP/CLIENT_ID/CLIENT_SECRET för butiken i Environments.',
  },
  {
    test: /META_ACCESS_TOKEN saknas/i,
    text: 'Nyckeln till Meta saknas, så inga annonssiffror kunde hämtas.',
    atgard: 'Axel: lägg in META_ACCESS_TOKEN i Environments.',
  },
  {
    test: /User request limit|\(#17\)/i,
    text: 'Meta strypte anropen (för många på kort tid). Det löser sig av sig självt till nästa hämtning.',
    atgard: '',
  },
  {
    test: /read_shopify_payments_disputes/i,
    text: 'Appen får inte läsa tvister. Tvistsiffrorna saknas därför — de är inte noll.',
    atgard: '',
  },
  {
    test: /401|avvisade token/i,
    text: 'Butiken avvisade nyckeln. Den hör troligen till en annan butik.',
    atgard: '',
  },
  {
    test: /kördes med --utan-nat/i,
    text: 'Hämtningen kördes utan nätet, så den här källan hoppades över med flit.',
    atgard: '',
  },
];

/** → { text, atgard } på svenska. Okänt fel kortas men göms aldrig. */
export function forklaraFel(ra) {
  const text = String(ra ?? '').trim();
  if (!text) return { text: 'Okänt fel.', atgard: '' };
  for (const r of FELREGLER) {
    if (!r.test.test(text)) continue;
    return {
      text: typeof r.text === 'function' ? r.text(text) : r.text,
      atgard: typeof r.atgard === 'function' ? r.atgard(text) : r.atgard,
    };
  }
  return { text: text.length > 160 ? `${text.slice(0, 157)}…` : text, atgard: '' };
}

/** Källans id → vad den faktiskt är. */
const KALLNAMN = {
  'repo:redigerare': 'Redigerarnas topplista',
  'repo:kundtjanst': 'Kundtjänstens veckorapport',
  'repo:leverans': 'Paketspårningen',
  'repo:nattvakten': 'Nattvaktens beslutslogg',
  shopify: 'Butikerna (Shopify)',
  'shopify:tvister': 'Tvisterna (Shopify, varje timme)',
  meta: 'Annonserna (Meta)',
  rutiner: 'Rutinvakten (git-loggen)',
  discord: 'Eskaleringskanalerna (Discord)',
  bonus: 'Bonusen (Judge.me + Notion)',
  autosvar: 'Autosvaret (kundtjänstbotens logg)',
  valuta: 'Växelkurserna (ECB)',
  'shopify:vinst': 'Vinstunderlaget (varukostnad + avgifter, Shopify)',
};

export function kallnamn(id) {
  return KALLNAMN[id] ?? id;
}

/** Ärendekategorierna ur kundtjänstrapporten, på svenska. */
const KATEGORIER = {
  var_ar_ordern: 'Var är min order?',
  ej_levererad: 'Aldrig levererad',
  retur_angerratt: 'Retur och ångerrätt',
  skadad_defekt: 'Skadad eller trasig vara',
  produktfraga: 'Fråga om produkten',
  faktura_klarna: 'Faktura och Klarna',
  avbestallning: 'Vill avbeställa',
  fel_vara: 'Fick fel vara',
  okand_debitering: 'Känner inte igen debiteringen',
  aterbetalning: 'Vill ha pengarna tillbaka',
  chargeback_hot: 'Hotar att gå till banken',
  ovrigt: 'Övrigt',
  adressandring: 'Vill ändra adressen',
  rabattkod: 'Rabattkod',
  spam: 'Skräppost',
};

export function kategorinamn(id, engelska = '') {
  return KATEGORIER[id] ?? engelska ?? id;
}

/** Tvisttypen i klartext, på läsarens språk. */
export function tvisttyp(typ, sprak = 'sv') {
  const t = String(typ ?? '').toLowerCase();
  if (t === 'inquiry') return sprak === 'en' ? 'bank inquiry' : 'förfrågan från banken';
  if (t === 'chargeback') return sprak === 'en' ? 'chargeback — the money is taken' : 'chargeback — pengarna är tagna';
  return t || (sprak === 'en' ? 'dispute' : 'tvist');
}

/**
 * Nattvaktens motivering är byggd för loggen, inte för en skärm. Första
 * meningen bär beslutet; resten är sifferunderlaget.
 */
export function kortMotivering(text, max = 130) {
  const rent = String(text ?? '').replace(/\s+/g, ' ').trim();
  if (!rent) return '';
  const punkt = rent.indexOf('. ');
  const forsta = punkt > 20 ? rent.slice(0, punkt + 1) : rent;
  return forsta.length > max ? `${forsta.slice(0, max - 1)}…` : forsta;
}

/** Åtgärdens namn i loggen → vad den betyder. */
const ATGARDER = {
  PAUSA: 'Stängde av',
  SANK: 'Sänkte budgeten',
  HOJ: 'Höjde budgeten',
  SNABB: 'Höjde snabbt',
  RATTELSE: 'Rättade sig själv',
  BEHALL: 'Lät stå',
  STARTA: 'Startade',
};

export function atgardsnamn(a) {
  return ATGARDER[String(a ?? '').toUpperCase()] ?? a;
}
