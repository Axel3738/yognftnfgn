// Kalendrarna från adventlane.se → bäverbutiken.se (Axels beslut 2026-09-16).
// Axel: "Det här var en hemsida som jag byggde upp för jag trodde jag skulle orka ha igång
// denna samtidigt som General Store. Men jag tänker att jag struntar i det … alla de här
// produkterna kan du bara lägga upp på bäverbutiken. Och du får rippa one to one."
//
// RIPP, inte omskrivning: bilder, copy, priser och jämförpriser tas rakt av från Adventlane.
// Ingen AI-bild genereras (Axel: "då sparar vi svin mycket tid och credits").
//
// ⛔ Importeras INTE (Axels tre länkar): racingbilar (ligger REDAN i bäverbutiken sedan
//    tidigare), smycken-adventskalender, barnens smyckeskalender ("barn/flickkalendrarna").
// ⛔ "Scented candle calendar" finns i COGS-arket men aldrig byggd på Adventlane — offerten
//    är märkt "over weight" (frakt 19,58 USD av 26,50). Byggs inte utan besked.
//
// ⚠️ ALKOHOLREGELN (Axels besked 2026-09-16): whisky-, cocktail-, öl- och spritkalendrarna
//    innehåller INGEN alkohol och ingen dryck. Det är julgranspynt — akryl- och plastflaskor
//    formade som kända sprit- och ölflaskor, med ögla för upphängning. Varje sida ska säga
//    det rakt ut. Påstå aldrig, antyd aldrig, att något går att dricka.
//
// ⚠️ TVÅ SAKER SOM INTE FÅR FÖLJA MED I RIPPEN (Adventlanes egna villkor ≠ Bäverbutikens):
//    1. "Leveranstid: 5–10 arbetsdagar · Fri frakt till alla länder" — CLAUDE.md förbjuder
//       alla hastighetslöften. Ersätts av Bäverbutikens garantiblock ("smidig leverans").
//    2. "14 dagars ångerrätt" — Bäverbutiken har 30 dagars öppet köp.
//
// COGS: Google-arket "Kalenderkungen" (149zfEDOpNuxr0Ln8c74R5521hHWZteFjM0u4a_qTTRQ),
// kolumn "Total tax exclusive" för SWEDEN vid Qty 1 (produktkostnad + frakt), × 9,4698.

export const FX_SEK = 9.4698;

export const FAKTA = {
  dinosaurie: {
    kalla: 'dinosaurie-adventskalender-24-dinosaurier', sku: 'ADVENT-DINOSAURIE',
    kategori: 'gid://shopify/TaxonomyCategory/hg-3-8',   // sätts av skapa.mjs om den finns
    pris: 399, jamfor: 529, usd: 11.95,
    offert: 'Dinosaur calendar · Temu · 4,31 + 7,64 = 11,95 USD',
    obs: '⚠️ Offerten: "There\'s only one factory making it, and the stock situation is unknown." MOQ 10.',
  },
  gor_din_egen: {
    kalla: 'gor-din-egen-adventskalender-24-askar', sku: 'ADVENT-GORDINEGEN',
    pris: 449, jamfor: 599, usd: 15.96,
    offert: 'Make your own calendar · Temu · 5,08 + 10,88 = 15,96 USD', obs: null,
  },
  pussel: {
    kalla: 'pussel-adventskalender-24-dagar-med-pusselbitar', sku: 'ADVENT-PUSSEL',
    pris: 449, jamfor: 599, usd: 14.56,
    offert: 'Pussel kalender · Temu · 4,92 + 9,64 = 14,56 USD', obs: null,
  },
  whisky: {
    kalla: 'whisky-adventskalender-24-miniatyrflaskor', sku: 'ADVENT-WHISKY',
    pris: 349, jamfor: 469, usd: 9.70,
    offert: 'Whiskey calendar · Amazon B0FYCK8SB5 · 3,08 + 6,62 = 9,70 USD',
    obs: 'ALKOHOLFRI: dekorflaskor att hänga i granen, ingen alkohol och ingen vätska.',
  },
  golf: {
    kalla: 'golf-adventskalender-24-golftillbehor', sku: 'ADVENT-GOLF',
    pris: 549, jamfor: 719, usd: 17.19,
    offert: 'Golf advent calendar · Amazon B0FRFP1JZ2 · 9,08 + 8,11 = 17,19 USD',
    obs: 'Axels gissning 2026-09-16: "den som jag tror kommer printa mest är den här golfkalendern."',
  },
  cocktail: {
    kalla: 'cocktail-adventskalender', sku: 'ADVENT-COCKTAIL',
    pris: 349, jamfor: 469, usd: 9.06,
    offert: 'Cocktail Adventskalender · Amazon B0G1ZFJ23M · 2,77 + 6,29 = 9,06 USD',
    obs: 'ALKOHOLFRI: 24 platta cocktailflaskor i akryl med ögla, ren dekoration.',
  },
  ishockey: {
    kalla: 'ishockey-adventskalender-24-luckor', sku: 'ADVENT-ISHOCKEY',
    pris: 399, jamfor: 529, usd: 12.03,
    offert: 'Ice hockey advent calendar · AliExpress 1005010277237949 · 4,77 + 7,26 = 12,03 USD',
    obs: null,
  },
  ol: {
    kalla: 'ol-adventskalender-24-olflaskor-julgranspynt', sku: 'ADVENT-OL',
    pris: 349, jamfor: 469, usd: 9.06,
    offert: 'AliExpress 1005010210428823 ("2026 Christmas Countdown Whisky Advent Calendar 2D Flat 24 Bottle") · 2,77 + 6,29 = 9,06 USD',
    obs: 'ALKOHOLFRI: 24 miniatyrflaskor i ölflaskform med guldkapsyl och ögla, julgranspynt. ⚠️ Asken är tryckt "BEER ADVENT CALENDAR 2025" — årtalet syns på produktbilden.',
  },
  sprit: {
    kalla: 'sprit-adventskalender-24-dekorflaskor', sku: 'ADVENT-SPRIT',
    pris: 349, jamfor: 469, usd: 9.76,
    offert: 'classic base liquor calendar · AliExpress 1005010210428823 · 3,69 + 6,07 = 9,76 USD',
    obs: 'ALKOHOLFRI: dekorflaskor i bar-stil, ingen alkohol och ingen vätska.',
  },
};

// cogs i SEK, avrundat till öre
export const cogs = (id) => +(FAKTA[id].usd * FX_SEK).toFixed(2);

export const EJ_IMPORTERADE = {
  'adventskalender-racingbilar': 'Axels lista — ligger dessutom redan i bäverbutiken (adventskalender-racingbilar-24-bilar-bakom-24-luckor)',
  'smycken-adventskalender-24-halsband-orhangen-ringar': 'Axels lista — "barn/flickkalendrarna"',
  'barnens-smyckeskalender-24-parlor': 'Axels lista — "barn/flickkalendrarna"',
  'Scented candle calendar (aldrig byggd på Adventlane)': 'Finns i COGS-arket, märkt "over weight" (frakt 19,58 av 26,50 USD). Ingen produktsida att rippa.',
};
