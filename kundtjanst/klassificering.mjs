// klassificering.mjs — vilket ärende ett mejl är, och hur nära en chargeback
// det ligger. Rena regler, noll beroenden, samma svar varje gång.
//
// Varför regler och inte en modell i första hand: rapporten ska gå att lita
// på vecka för vecka. En kategori som byter namn för att en modell "kände"
// annorlunda gör trenden oläslig. Modellen (llm.mjs) får bara det som
// reglerna INTE känner igen (`ovrigt`), och bara när ANTHROPIC_NYCKEL finns.
//
// Språk: svenska, norska, danska, engelska (och lite finska) — brandsen
// säljer i SE/NO/DK och kunderna skriver på sitt eget språk.
//
// Chargeback-vikten per kategori är hämtad från vad kortnätverken faktiskt
// bokför tvister som: "item not received", "not as described", "unauthorized"
// och "credit not processed" är de fyra stora. En kund som HOTAR med banken
// är redan på väg dit.

export const KATEGORIER = Object.freeze([
  { id: 'chargeback_hot',   sv: 'Hot om bank/tvist',           en: 'Threatens bank / dispute',        vikt: 3, atgard_en: 'Reply within 24h and offer a refund or reship BEFORE the bank is involved — a dispute costs the fee plus the order.' },
  { id: 'okand_debitering', sv: 'Okänd/dubbel debitering',     en: 'Unknown or double charge',        vikt: 3, atgard_en: 'Check the order in Shopify the same day; refund duplicates immediately. This is the #1 "unauthorized" chargeback reason.' },
  { id: 'ej_levererad',     sv: 'Aldrig levererad',            en: 'Never delivered',                 vikt: 3, atgard_en: 'Send tracking or reship. "Item not received" is the most common chargeback reason.' },
  { id: 'fel_vara',         sv: 'Fel vara / inte som beskrivet', en: 'Wrong item / not as described', vikt: 3, atgard_en: 'Offer return + refund or partial refund fast. "Not as described" disputes are almost always lost.' },
  { id: 'var_ar_ordern',    sv: 'Var är min order (WISMO)',    en: 'Where is my order (WISMO)',       vikt: 2, atgard_en: 'Send tracking proactively at fulfillment; add a shipping-time banner on the product page if this is a top ticket.' },
  { id: 'skadad_defekt',    sv: 'Skadad / defekt',             en: 'Damaged / defective',             vikt: 2, atgard_en: 'Ask for a photo, then replace or refund. Track the SKU — recurring = supplier problem.' },
  { id: 'aterbetalning',    sv: 'Vill ha pengar tillbaka',     en: 'Wants a refund',                  vikt: 2, atgard_en: 'Process within 14 days by law. Slow refunds turn into "credit not processed" disputes.' },
  { id: 'avbestallning',    sv: 'Avbeställning',               en: 'Cancellation',                    vikt: 2, atgard_en: 'Cancel and refund the same day if not shipped. If shipped, explain the return flow in the first reply.' },
  { id: 'retur_angerratt',  sv: 'Retur / ångerrätt',           en: 'Return / right of withdrawal',    vikt: 1, atgard_en: 'Send the return address and steps in one reply. Every extra round-trip is a risk.' },
  { id: 'faktura_klarna',   sv: 'Faktura / Klarna',            en: 'Invoice / Klarna',                vikt: 1, atgard_en: 'Point to Klarna support for payment plans; confirm the order status on our side.' },
  { id: 'produktfraga',     sv: 'Produktfråga (före köp)',     en: 'Product question (pre-sale)',     vikt: 0, atgard_en: 'Answer fast — a pre-sale question is a sale waiting. Add the answer to the product page FAQ.' },
  { id: 'rabatt_kod',       sv: 'Rabattkod / erbjudande',      en: 'Discount code / offer',           vikt: 0, atgard_en: 'Reply with the current code or say there is none. Never invent a code.' },
  { id: 'spam',             sv: 'Spam / marknadsföring',       en: 'Spam / marketing',                vikt: 0, atgard_en: 'Ignore.' },
  { id: 'ovrigt',           sv: 'Övrigt',                      en: 'Other',                           vikt: 0, atgard_en: 'Read manually; if the same "other" comes back three weeks in a row it needs its own category.' },
]);

export const KATEGORI = Object.fromEntries(KATEGORIER.map((k) => [k.id, k]));

// Ordlistorna: gemener, utan diakritik-känslighet (texten normaliseras
// nedan så att "åäö" behålls men "é" → "e"). Ett uttryck = en regex-bit.
const REGLER = [
  ['chargeback_hot', [
    'chargeback', 'charge back', 'bestrid', 'bestrider', 'reklamationsnämnd', 'arn\\b', 'konsumentverket', 'konsumentombud',
    'forbrukerråd', 'forbrukerklage', 'forbrugerombud', 'polisanmäl', 'politianmeld', 'polisen', 'politiet', 'bedrägeri', 'bedrageri', 'svindel',
    '\\bscam', 'fraud', 'advokat', 'lawyer', 'min bank', 'mitt kort', 'kortföretag', 'kortselskap', 'banken', 'my bank', 'my card', 'dispute',
    'anmäla er', 'anmäler er', 'anmelde dere', 'kronofogd', 'inkasso', 'trustpilot', 'recension på', 'varna andra', 'advare andre',
  ]],
  ['okand_debitering', [
    'dubbel', 'dubbelt', 'dobbelt', 'två gånger', 'to ganger', 'to gange', 'twice', 'charged twice', 'dragit', 'dragits', 'trukket', 'trekt',
    'debiterad', 'debiterat', 'belastet', 'okänd', 'ukjent', 'ukendt', 'unauthorized', 'unauthorised', 'har inte beställt', 'har ikke bestilt', 'have not ordered',
    'aldrig beställt', 'aldri bestilt', 'not ordered', 'inte känner igen', 'kjenner ikke igjen', 'fel belopp', 'feil beløp', 'wrong amount', 'för mycket pengar',
  ]],
  ['ej_levererad', [
    // "inte fått" ensamt är WISMO ("inte fått någon spårning") — här krävs att det är varan/paketet som saknas.
    'aldrig kommit', 'aldrig kom', 'kom aldrig', 'har inte kommit', 'inte kommit fram', 'inte fått (paketet|varan|leveransen|min beställning|min order|ordern|något paket|det|den)',
    'aldrig fått (paketet|varan|leveransen|min beställning|min order|ordern|det|den)', 'har inte mottagit', 'ej mottagit', 'ikke mottatt', 'ikke fått (pakken|varen|noe|bestillingen|ordren)',
    'aldri kommet', 'ikke kommet', 'ikke modtaget', 'aldrig modtaget', 'not received', 'never arrived', 'never received', 'haven.t received', 'has not arrived', 'hasn.t arrived',
    'försvunn', 'forsvunn', 'borttappad', 'lost (package|parcel|in the mail|in transit)', '(package|parcel) (is |was |got )?lost', 'tappat bort', 'fått tillbaka till avsändaren',
    'returnerad till avsändaren', 'returned to sender', 'levererad men', 'levert men', 'delivered but', 'inget paket', 'ingen pakke', 'no package',
  ]],
  ['fel_vara', [
    'fel vara', 'fel produkt', 'fel storlek', 'fel färg', 'fel modell', 'fel artikel', 'feil vare', 'feil produkt', 'feil størrelse', 'feil farge', 'forkert vare', 'forkert størrelse',
    'wrong item', 'wrong size', 'wrong product', 'wrong colour', 'wrong color', 'inte som på bild', 'ikke som på bild', 'not as described', 'not as pictured',
    'ser inte ut som', 'ser ikke ut som', 'looks nothing like', 'passar inte', 'passer ikke', 'does not fit', 'doesn.t fit', 'saknas i paketet', 'mangler i pakken',
    'missing from', 'bara en av', 'fick bara', 'fikk bare', 'only received', 'stämmer inte', 'stemmer ikke', 'kvalitet', 'kvalitet', 'billig plast', 'usel',
  ]],
  ['var_ar_ordern', [
    'var är min', 'var är ordern', 'var är paketet', 'var är beställningen', 'hvor er', 'hvor blir', 'where is my', 'where.s my', 'när kommer', 'når kommer', 'hvornår kommer', 'when will',
    'spårning', 'sporing', 'sporingsnummer', 'tracking', 'track', 'leveransstatus', 'leveringsstatus', 'status på min', 'status on my', 'kollinummer', 'pakkesporing',
    'har inte fått någon bekräftelse', 'ingen bekräftelse', 'ingen bekreftelse', 'no confirmation', 'orderbekräftelse', 'ordrebekreftelse', 'leveranstid', 'leveringstid', 'delivery time',
    'skickat', 'skickats', 'sendt', 'shipped', 'dröjer', 'tar så lång tid', 'tar lang tid', 'taking so long', 'väntat i', 'ventet i', 'waited', 'inte fått något paket',
  ]],
  ['skadad_defekt', [
    'trasig', 'trasigt', 'sönder', 'skadad', 'skadat', 'skadet', 'ødelagt', 'i stykker', 'defekt', 'funkar inte', 'fungerar inte', 'fungerer ikke', 'virker ikke', 'går inte att',
    'broken', 'damaged', 'defective', 'not working', 'doesn.t work', 'does not work', 'stopped working', 'slutat fungera', 'sluttet å fungere', 'laddar inte', 'lader ikke', 'won.t charge',
    'reklamation', 'reklamera', 'reklamere', 'garanti', 'warranty', 'spricka', 'sprucken', 'sprukket', 'läcker', 'lekker', 'leaks', 'lukt', 'stinker',
  ]],
  ['aterbetalning', [
    'återbetal', 'aterbetal', 'pengarna tillbaka', 'pengar tillbaka', 'pengene tilbake', 'pengene tilbage', 'refund', 'refusjon', 'refundering', 'tilbakebetal', 'tilbagebetal',
    'money back', 'kreditera', 'kreditere', 'ersättning', 'erstatning', 'kompensation', 'compensation', 'återbäring',
  ]],
  ['avbestallning', [
    'avbeställ', 'avbryt', 'avbryta', 'annuller', 'annullera', 'kansellere', 'kanseller', 'cancel', 'ångra köpet', 'ångra beställningen', 'angre kjøpet', 'fortryde',
    'vill inte ha', 'vil ikke ha', 'don.t want', 'do not want', 'beställde av misstag', 'bestilte ved en feil', 'by mistake', 'ta bort min order', 'ta bort beställningen',
  ]],
  ['retur_angerratt', [
    'retur', 'returnera', 'returnere', 'returnering', 'return', 'skicka tillbaka', 'sende tilbake', 'sende tilbage', 'send back', 'ångerrätt', 'angrerett', 'fortrydelsesret',
    'ångra', 'angre', 'byta', 'bytte', 'exchange', 'returadress', 'returadresse', 'return address', 'öppet köp', 'åpent kjøp', 'returfrakt', 'returetikett', 'return label',
  ]],
  ['faktura_klarna', [
    'klarna', 'faktura', 'invoice', 'påminnelse', 'purring', 'rykker', 'delbetal', 'avbetal', 'betalningsplan', 'payment plan', 'förfallo', 'forfall', 'due date', 'kvitto', 'kvittering', 'receipt',
  ]],
  ['produktfraga', [
    'passar den', 'passer den', 'fungerar den', 'fungerer den', 'does it fit', 'will it fit', 'does it work with', 'kompatibel', 'compatible', 'mått', 'mål på', 'dimensions', 'measurements',
    'storlek', 'størrelse', 'size guide', 'hur stor', 'hvor stor', 'how big', 'hur många', 'hvor mange', 'how many', 'material', 'vattentät', 'vanntett', 'waterproof',
    'finns den i', 'finnes den i', 'available in', 'lagerstatus', 'i lager', 'på lager', 'in stock', 'instruktion', 'manual', 'bruksanvisning', 'hur monterar', 'hvordan montere', 'how to install',
    'funkar den till', 'passar till', 'passer til', 'levererar ni till', 'leverer dere til', 'do you ship to', 'skickar ni till',
  ]],
  ['rabatt_kod', [
    'rabattkod', 'rabatkode', 'discount code', 'promo code', 'kampanjkod', 'kupong', 'coupon', 'erbjudande', 'tilbud', 'offer', 'rabatt', 'discount', 'kod fungerar inte', 'koden fungerar inte', 'code doesn.t work',
  ]],
  ['spam', [
    'unsubscribe', 'avregistrera', 'newsletter', 'nyhetsbrev', 'seo', 'backlink', 'guest post', 'increase your sales', 'we are a digital agency', 'grow your business', 'web design services', 'sponsored post',
  ]],
];

const KOMPILERADE = REGLER.map(([id, ord]) => [id, ord.map((o) => new RegExp(`(^|[^a-zåäöøæ])${o}`, 'i'))]);

// Eskaleringsmarkörer: höjer chargeback-poängen oavsett kategori. En kund som
// skriver "tredje gången" eller "ingen svarar" är på väg mot banken.
const ESKALERING = [
  'andra gången', 'tredje gången', 'fjärde gången', 'andre gang', 'tredje gang', 'anden gang', 'second time', 'third time', 'igen och igen',
  'ingen svarar', 'ingen har svarat', 'inget svar', 'ikke fått svar', 'ingen svarer', 'no reply', 'no answer', 'no one answers', 'nobody answers', 'not answering', 'ignorerar', 'ignorerer', 'ignoring',
  'sista gången', 'siste gang', 'last time', 'omedelbart', 'umiddelbart', 'immediately', 'inom 24', 'within 24', 'inom 48', 'senast', 'senest', 'deadline', 'oacceptabelt', 'uakseptabelt', 'unacceptable',
  'skandal', 'skandale', 'ripped off', 'lurad', 'lurade', 'lurt', 'snydt', 'bluff', 'fake', 'oseriös', 'useriøs', 'oseriøs',
].map((o) => new RegExp(`(^|[^a-zåäöøæ])${o}`, 'i'));

/** Normaliserar text för matchning: gemener, é → e, kollapsade blanksteg. Behåller åäöøæ. */
export function normalisera(text) {
  return String(text ?? '')
    .toLowerCase()
    .replace(/[éèêë]/g, 'e').replace(/[áàâ]/g, 'a').replace(/[úùû]/g, 'u').replace(/[íìî]/g, 'i').replace(/[óòô]/g, 'o')
    .replace(/[‘’‚]/g, "'").replace(/[“”]/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Ordernummer i texten: "#1234", "order 1234", "ordernummer: 1234", "beställning 1234", Shopify-namn "#1001". Fyrsiffriga+. */
export function hittaOrdernummer(text) {
  const s = String(text ?? '');
  const ut = new Set();
  for (const m of s.matchAll(/#\s?(\d{3,7})\b/g)) ut.add(m[1]);
  for (const m of s.matchAll(/\b(?:order(?:nummer|nr|number|id)?|ordre(?:nummer|nr)?|beställning(?:snummer|snr)?|bestilling(?:snummer|snr)?|orderbekräftelse)\s*[:#.]?\s*(\d{3,7})\b/gi)) ut.add(m[1]);
  return [...ut];
}

/** Språkgissning ur några funktionsord — bara för rapporten, styr inget. */
export function gissaSprak(text) {
  const s = ` ${normalisera(text)} `;
  // Ord som skiljer språken åt — inte de gemensamma (er, min, har, det).
  const poang = {
    sv: (s.match(/ (och|inte|jag|är|beställning|beställde|hej|inget|ingen|också|pengarna|varan) /g) || []).length,
    no: (s.match(/ (og|ikke|jeg|bestilling|bestilte|hei|noe|ikkje|pakken|ordre|varen) /g) || []).length,
    da: (s.match(/ (og|ikke|jeg|bestilling|bestilte|hej|noget|pakken|ordre|varen|af) /g) || []).length,
    en: (s.match(/ (and|not|the|my|order|is|have|with|hi|hello|please|you) /g) || []).length,
    fi: (s.match(/ (ja|ei|minä|on|tilaus|hei|olen|kiitos|paketti) /g) || []).length,
  };
  // "hej" är svenska OCH danska, "hei" norska; ø/æ utesluter svenska.
  if (/[øæ]/.test(s)) { poang.no += 2; poang.da += 2; poang.sv = 0; }
  if (/ hei /.test(s)) poang.no += 1;
  if (/ hej /.test(s) && poang.no === 0) poang.da += 0; // hej räknas redan i sv och da
  const basta = Object.entries(poang).sort((a, b) => b[1] - a[1])[0];
  return basta[1] > 0 ? basta[0] : 'okänt';
}

/**
 * Klassificerar ett mejl. Alla kategorier som träffar samlas; den PRIMÄRA är
 * den med högst vikt, och vid lika vikt den med flest träffar. Ämnesraden
 * räknas dubbelt — det är där kunden själv sätter rubriken.
 *
 * Returnerar { kategori, alla: [{ id, traffar }], poang, eskalering,
 *              ordernummer, sprak, nyckelord }.
 */
export function klassificera({ amne = '', text = '' } = {}) {
  const a = normalisera(amne);
  const t = normalisera(text);
  const traffar = [];
  for (const [id, regler] of KOMPILERADE) {
    let n = 0;
    const ord = [];
    for (const re of regler) {
      const iAmne = re.test(a);
      const iText = re.test(t);
      if (iAmne) n += 2;
      if (iText) n += 1;
      if (iAmne || iText) ord.push(re.source.replace(/^\(\^\|\[\^a-zåäöøæ\]\)/, ''));
    }
    if (n > 0) traffar.push({ id, traffar: n, ord });
  }
  // Spam bara om inget kundärende matchar — "unsubscribe" i en signatur ska inte gömma en reklamation.
  const kund = traffar.filter((x) => x.id !== 'spam');
  const kandidater = kund.length ? kund : traffar;
  kandidater.sort((x, y) => (KATEGORI[y.id].vikt - KATEGORI[x.id].vikt) || (y.traffar - x.traffar));
  // Produktfrågor och rabatter är före-köp: en text som också nämner leverans/retur är ett kundärende, inte en fråga.
  const primar = kandidater[0]?.id ?? 'ovrigt';
  const eskalering = ESKALERING.filter((re) => re.test(a) || re.test(t)).length;
  const vikt = KATEGORI[primar].vikt;
  // Poäng 0–5: kategorins vikt + 1 per eskaleringsmarkör (max 2).
  const poang = Math.min(5, vikt + Math.min(2, eskalering));
  return {
    kategori: primar,
    alla: kandidater.map(({ id, traffar: n }) => ({ id, traffar: n })),
    poang,
    eskalering,
    ordernummer: hittaOrdernummer(`${amne}\n${text}`),
    sprak: gissaSprak(`${amne} ${text}`),
    nyckelord: kandidater[0]?.ord?.slice(0, 5) ?? [],
  };
}
