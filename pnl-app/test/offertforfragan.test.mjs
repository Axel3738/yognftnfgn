// Offertförfrågan till leverantören och läsningen av svaret. Körs med `npm test`.
//
// Det farliga här är tyst fel: ett pris på fel variant, ett antal som läses
// som pris, ett styckpris som läses som totalpris, ett land som stängs av ett
// chattord, eller en kostnad i yuan som sparas som dollar. Varje test nedan
// låser en sådan väg — de flesta är reproduktioner ur granskningen 2026-09-27:
// 22 fel i den första, "toleranta" versionen och 17 i den andra. Efter den
// andra byttes princip: ett pris sparas bara när det är bevisat entydigt,
// och valutan gissas aldrig.
import { test } from "node:test";
import assert from "node:assert/strict";

const {
  numeriskId,
  hemmamarknad,
  offertLuckor,
  valjOffertrader,
  byggOffertmeddelande,
  tolkaOffertsvar,
  tolkaBelopp,
  valutaI,
  valutorI,
  offertTillRader,
  OFFERT_MARKOR,
} = await import("../app/lib/offertforfragan.ts");

const gid = (n) => `gid://shopify/ProductVariant/${n}`;
const variant = (n, over = {}) => ({
  variantGid: gid(n),
  productTitle: "Taköverdrag Husvagn & Husbil 5,5–13,5 m",
  variantTitle: `${n} × 3 m`,
  sku: "",
  handle: "takskyddet",
  standardCost: null,
  perMarknad: {},
  oms90: 1000,
  ...over,
});
const landsnamn = (k) => ({ US: "United States", AU: "Australia", SE: "Sweden", GB: "United Kingdom" })[k] ?? k;

/** Mallens första rad — den bär valutan. */
const MARKOR = (valuta = "USD") => `StonePNL quote request · CaraShell · 2026-09-27 · ${valuta}`;
/** Ett svar med markörrad (USD) och de givna raderna. */
const svara = (rader, opts = {}) => tolkaOffertsvar([MARKOR(), ...rader].join("\n"), opts);
/** Ett svar med EN variant och EN landsrad — det mesta nedan prövar raden. */
const enRad = (landsrad, extra = []) => svara(["ID: 111111", ...extra, landsrad]);
const priser = (svar) => svar.rader[0]?.priser;

// ------------------------------------------------------------------
// Urvalet och meddelandet
// ------------------------------------------------------------------

test("numeriskId plockar id:t ur ett gid", () => {
  assert.equal(numeriskId("gid://shopify/ProductVariant/51234567890123"), "51234567890123");
  assert.equal(numeriskId(""), "");
});

test("hemmamarknad: valutans land, annars den enda marknaden, annars ingen", () => {
  assert.equal(hemmamarknad("SE", ["SE", "US"]), "SE");
  assert.equal(hemmamarknad("SE", []), "SE");
  assert.equal(hemmamarknad("", ["FI"]), "FI");
  assert.equal(hemmamarknad("SE", ["US", "AU"]), "");
  assert.equal(hemmamarknad("", ["US", "AU"]), "");
});

test("offertLuckor: hemmamarknaden täcks av standarden, ett annat land gör det inte", () => {
  const luckor = offertLuckor({
    varianter: [
      variant(1, { standardCost: 440 }), // SE täckt av standard, US saknas
      variant(2, { standardCost: 440, perMarknad: { US: 600 } }), // allt täckt
      variant(3), // ingenting alls
      variant(4, { standardCost: 0 }), // nolla = saknas
      variant(5, { standardCost: 0, fri: true }), // kvitterad gåva = täckt hemma
    ],
    aktiva: ["SE", "US"],
    hemma: "SE",
    shop: "yitrbk-m3.myshopify.com",
  });
  const per = Object.fromEntries(luckor.map((l) => [l.id, l]));
  assert.deepEqual(per["1"].saknas, ["US"]);
  assert.equal(per["1"].helt, false);
  assert.equal(per["2"], undefined);
  assert.deepEqual(per["3"].saknas, ["SE", "US"]);
  assert.equal(per["3"].helt, true);
  assert.deepEqual(per["4"].saknas, ["SE", "US"]);
  assert.equal(per["4"].helt, true);
  assert.deepEqual(per["5"].saknas, ["US"]);
  assert.equal(per["1"].url, "https://yitrbk-m3.myshopify.com/products/takskyddet?variant=1");
});

test("offertLuckor: en variant med egen kostnad i varje aktivt land är täckt även utan standard", () => {
  const luckor = offertLuckor({
    varianter: [variant(1, { perMarknad: { SE: 400, US: 600 } })],
    aktiva: ["SE", "US"],
    hemma: "SE",
    shop: "",
  });
  assert.equal(luckor.length, 0);
});

test("offertLuckor: butik utan marknader ger en ALL-rad bara när standarden saknas", () => {
  const luckor = offertLuckor({ varianter: [variant(1), variant(2, { standardCost: 50 })], aktiva: [], hemma: "", shop: "" });
  assert.equal(luckor.length, 1);
  assert.deepEqual(luckor[0].saknas, [""]);
});

test("valjOffertrader: 'saknas' tar bara helt saknade, osålda bara på begäran", () => {
  const luckor = offertLuckor({
    varianter: [variant(1, { standardCost: 440 }), variant(2), variant(3, { oms90: 0 })],
    aktiva: ["SE", "US"],
    hemma: "SE",
    shop: "",
  });
  assert.deepEqual(valjOffertrader(luckor, { lage: "saknas", osalda: false }).map((v) => v.id), ["2"]);
  assert.deepEqual(valjOffertrader(luckor, { lage: "alla", osalda: false }).map((v) => v.id).sort(), ["1", "2"]);
  assert.deepEqual(valjOffertrader(luckor, { lage: "alla", osalda: true }).map((v) => v.id).sort(), ["1", "2", "3"]);
});

const exempelLuckor = () =>
  offertLuckor({
    varianter: [variant(111111, { oms90: 5000 }), variant(222222, { standardCost: 500, oms90: 3000 })],
    aktiva: ["SE", "US", "AU"],
    hemma: "SE",
    shop: "yitrbk-m3.myshopify.com",
  });
const mall = (valuta = "USD") =>
  byggOffertmeddelande({ butik: "CaraShell", datum: "2026-09-27", valuta, varianter: exempelLuckor(), landsnamn });

test("byggOffertmeddelande: markör med valuta, ETT svar, totalpris, ID-rad och valutan vid varje lucka", () => {
  const text = mall();
  assert.ok(text.startsWith(`${OFFERT_MARKOR} · CaraShell · 2026-09-27 · USD`));
  assert.match(text, /ONE single message/);
  assert.match(text, /TOTAL price/);
  assert.match(text, /not "\+ shipping" and not "each"/);
  assert.match(text, /Do not group countries/);
  assert.match(text, /write X instead of the prices/);
  assert.match(text, /^ID: 111111$/m);
  assert.match(text, /^ID: 222222$/m);
  assert.match(text, /^US \(United States\): 1 pc = ___ USD \| 2 pcs = ___ USD \| 3 pcs = ___ USD$/m);
  // 111111 saknar allt (SE, US, AU); 222222 har standard ⇒ bara US och AU
  const block2 = text.split("ID: 222222")[1];
  assert.doesNotMatch(block2.split("-----")[0], /^SE /m);
  assert.match(block2, /^AU \(Australia\):/m);
  assert.match(text, /2 products, 3 countries/);
  assert.doesNotMatch(text, /undefined|null/);
});

/** Leverantören fyller i mallen: varje ___ på en prisrad, i tur och ordning. */
const fyllI = (text, varden) =>
  text
    .split("\n")
    .map((rad) => {
      if (!/\bpcs? = ___/.test(rad)) return rad;
      let i = 0;
      return rad.replace(/___/g, () => String(varden[i++ % varden.length]));
    })
    .join("\n");

test("hela varvet: ifylld mall läses tillbaka till rätt variant, land, antal och valuta", () => {
  const svar = tolkaOffertsvar(fyllI(mall(), ["45", "80", "110"]));
  assert.equal(svar.kand, true);
  assert.equal(svar.valuta, "USD");
  assert.equal(svar.rader.length, 5);
  const us = svar.rader.find((r) => r.id === "111111" && r.market === "US");
  assert.deepEqual(us.priser, { 1: 45, 2: 80, 3: 110 });
  assert.equal(us.valuta, "USD");
  assert.equal(svar.ofyllda.length, 0);
  assert.equal(svar.olasbara.length, 0);
  assert.equal(svar.valutakonflikt, null);
});

test("hela varvet i CNY: leverantören byter USD mot CNY vid priserna", () => {
  // bara på landsraderna — markören och reglerna står kvar som appen skrev dem
  const ifylld = fyllI(mall(), ["300", "560", "800"])
    .split("\n")
    .map((r) => (/^[A-Z]{2} \(/.test(r) ? r.replace(/ USD/g, " CNY") : r))
    .join("\n");
  const svar = tolkaOffertsvar(ifylld);
  const us = svar.rader.find((r) => r.id === "111111" && r.market === "US");
  assert.equal(us.valuta, "CNY");
  assert.equal(svar.valutakonflikt, null);
});

test("hela meddelandet sök-ersatt USD → CNY läses i CNY; bara reglerna ändrade = konflikt", () => {
  const allt = fyllI(mall(), ["300", "560", "800"]).replace(/USD/g, "CNY");
  const svar = tolkaOffertsvar(allt);
  assert.equal(svar.valutakonflikt, null);
  assert.equal(svar.valuta, "CNY");
  assert.ok(svar.rader.every((r) => r.valuta === "CNY"));
  // granskning 3: regel 4 ändrad till RMB, priserna utan valuta → läses INTE som USD
  const regel4 = fyllI(mall(), ["300", "560", "800"])
    .replace("4. All prices in USD.", "4. All prices in RMB.")
    .split("\n")
    .map((r) => (/^[A-Z]{2} \(/.test(r) ? r.replace(/ USD/g, "") : r))
    .join("\n");
  assert.ok(tolkaOffertsvar(regel4).valutakonflikt);
  // markören ändrad till CNY men USD kvar vid priserna → konflikt
  assert.ok(tolkaOffertsvar(fyllI(mall(), ["300", "560", "800"]).replace("2026-09-27 · USD", "2026-09-27 · CNY")).valutakonflikt);
});

test("ofyllda rader räknas men skrivs inte", () => {
  const svar = tolkaOffertsvar(mall());
  assert.equal(svar.kand, true);
  assert.equal(svar.rader.length, 0);
  assert.equal(svar.ofyllda.length, 5);
});

// ------------------------------------------------------------------
// Belopp och valuta
// ------------------------------------------------------------------

test("tolkaBelopp: exakt ett tal, med tusental bara om tre siffror följer", () => {
  assert.equal(tolkaBelopp("45"), 45);
  assert.equal(tolkaBelopp("45.50"), 45.5);
  assert.equal(tolkaBelopp("45,50"), 45.5);
  assert.equal(tolkaBelopp("45,5"), 45.5);
  assert.equal(tolkaBelopp("1,234.50"), 1234.5);
  assert.equal(tolkaBelopp("1.234,50"), 1234.5);
  assert.equal(tolkaBelopp("1 234,50"), 1234.5);
  assert.equal(tolkaBelopp("1,234"), 1234);
  assert.equal(tolkaBelopp("1.234"), 1234);
  // Granskningen: "110 7-12 days" blev 1107, "45 2 sets" blev 452
  assert.equal(tolkaBelopp("110 7-12 days"), null);
  assert.equal(tolkaBelopp("45 2"), null);
  assert.equal(tolkaBelopp("30+15"), null);
  assert.equal(tolkaBelopp("abc"), null);
});

test("valutorI känner igen tecken, koder och kinesiska ord — och A$, C$ är inte USD", () => {
  assert.deepEqual(valutorI("$45"), ["USD"]);
  assert.deepEqual(valutorI("45usd"), ["USD"]);
  assert.deepEqual(valutorI("美元45"), ["USD"]);
  assert.deepEqual(valutorI("¥300"), ["CNY"]);
  assert.deepEqual(valutorI("300 RMB"), ["CNY"]);
  assert.deepEqual(valutorI("300 人民币"), ["CNY"]);
  assert.deepEqual(valutorI("45元"), ["CNY"]);
  assert.deepEqual(valutorI("€12"), ["EUR"]);
  assert.deepEqual(valutorI("A$60"), ["AUD"]);
  assert.deepEqual(valutorI("AU$60"), ["AUD"]);
  assert.deepEqual(valutorI("C$60"), ["CAD"]);
  assert.deepEqual(valutorI("45"), []);
  assert.equal(valutaI("45 USD"), "USD");
});

// ------------------------------------------------------------------
// Rader som leverantörer faktiskt skriver
// ------------------------------------------------------------------

test("antalet läses ALDRIG som pris: pair, pack, unit, bindestreck, pil, mellanslag, 1x45", () => {
  const fall = [
    "US: 1 pair = 12 | 2 pairs = 20 | 3 pairs = 27",
    "US: 1 pack = 12 | 2 packs = 20 | 3 packs = 27",
    "US: 1 unit = 12 | 2 units = 20 | 3 units = 27",
    "US (United States): 1 pc - 12 | 2 pcs - 20 | 3 pcs - 27",
    "US: 1 pc → 12 | 2 pcs → 20 | 3 pcs → 27",
    "US: 1 pc $12 | 2 pcs $20 | 3 pcs $27",
    "US: 1pc 12usd | 2pcs 20usd | 3pcs 27usd",
    "US: 1 pc 12, 2 pcs 20, 3 pcs 27",
    "US: 1x12 / 2x20 / 3x27",
    "US: 1 pc — 12 | 2 pcs — 20 | 3 pcs — 27",
  ];
  for (const rad of fall) {
    const svar = enRad(rad);
    assert.deepEqual(priser(svar), { 1: 12, 2: 20, 3: 27 }, rad);
  }
});

test("etikettlösa priser: exakt tre tal läses i ordning, annars inte", () => {
  assert.deepEqual(priser(enRad("US: 45 / 80 / 110")), { 1: 45, 2: 80, 3: 110 });
  assert.deepEqual(priser(enRad("SE — 45 / 80 / 110")), { 1: 45, 2: 80, 3: 110 });
  const tva = enRad("US: 45 / 85");
  assert.equal(tva.rader.length, 0);
  assert.equal(tva.olasbara.length, 1);
});

test("vara + frakt, 'each', '/pc' och två valutor i samma värde läses inte — det syns", () => {
  const fall = [
    ["US: 1 pc = 30+15 | 2 pcs = 55+20 | 3 pcs = 80+25", "summa"],
    ["US: 1 pc = 30 + 15 = 45 | 2 pcs = 55 + 20 = 75 | 3 pcs = 80 + 25 = 105", "summa"],
    ["US: 1 pc = 45 | 2 pcs = 45 each | 3 pcs = 45 each", "styckpris"],
    ["US: 1 pc = 45 | 2 pcs = 45/pc | 3 pcs = 45/pc", "styckpris"],
    ["US: 1 pc = 45 USD (≈320 RMB) | 2 pcs = 80 USD | 3 pcs = 110 USD", "otydligt"],
    ["US: 1 pc = ¥300 ($42) | 2 pcs = ¥560 | 3 pcs = ¥800", "otydligt"],
    ["US: 1 pc = 45 | 2 pcs = 80 | 3 pcs = 110 7-12 days", "otydligt"],
    ["US: 45-50 / 80-90 / 110-120", "otydligt"],
  ];
  for (const [rad, orsak] of fall) {
    const svar = enRad(rad);
    assert.equal(svar.rader.length, 0, rad);
    assert.equal(svar.olasbara.length, 1, rad);
    assert.equal(svar.olasbara[0].orsak, orsak, rad);
  }
});

test("X, 'can't ship' och X i varje lucka betyder att landet inte går", () => {
  for (const rad of ["US: X", "US (United States): X | X | X", "US: can't ship", "UK (United Kingdom): 1 pc = X | 2 pcs = X | 3 pcs = X"]) {
    const svar = enRad(rad);
    assert.equal(svar.rader.length, 1, rad);
    assert.equal(svar.rader[0].ejLeverans, true, rad);
  }
});

test("ett chattord blir aldrig ett pris eller ett stängt land", () => {
  const svar = svara(["ID: 111111", "US: 1 pc = 40 | 2 pcs = 70 | 3 pcs = 99", "Hi dear, next week price change", "Hi, we can ship all"]);
  assert.equal(svar.rader.length, 1);
  assert.equal(svar.rader[0].market, "US");
  assert.equal(svar.rader[0].ejLeverans, false);
  assert.equal(svar.olasbara.length, 0);
});

test("en rad utanför mallen avslutar blocket: priser efter den får inte föregående variant", () => {
  // Granskning 2: "No problem, 1 pc = 45 …" och en ny produkt i fritext
  // mellan två block gav priserna till varianten ovanför.
  for (const mellan of ["No problem, here is the next one", "2) Tofflor — XXL", "Next product:", "Slippers XXL"]) {
    const svar = svara(["ID: 111111", "SE: 1 pc = 40 | 2 pcs = 70 | 3 pcs = 99", mellan, "US: 1 pc = 19 | 2 pcs = 34 | 3 pcs = 48"]);
    assert.deepEqual(svar.rader.map((r) => r.market), ["SE"], mellan);
    assert.equal(svar.utanId.length, 1, mellan);
  }
  const pris = svara(["ID: 111111", "No problem, 1 pc = 45 | 2 pcs = 80 | 3 pcs = 110"]);
  assert.equal(pris.rader.length, 0);
  assert.equal(pris.olastaRader.length, 1);
});

test("egen numrering tas bort och raden läses: '1. SE: …'", () => {
  const svar = svara(["ID: 111111", "1. SE: 1 pc = 40 | 2 pcs = 70 | 3 pcs = 99", "2. US: 1 pc = 55 | 2 pcs = 95 | 3 pcs = 130"]);
  assert.deepEqual(svar.rader.map((r) => r.market), ["SE", "US"]);
  assert.deepEqual(svar.rader[0].priser, { 1: 40, 2: 70, 3: 99 });
});

test("UK blir GB, USA blir US, och engelska landsnamn känns igen för väntade länder", () => {
  const svar = svara(
    [
      "ID: 111111",
      "UK: 1 pc = 40 | 2 pcs = 70 | 3 pcs = 99",
      "USA: 1 pc = 41 | 2 pcs = 71 | 3 pcs = 100",
      "Australia: 1 pc = 42 | 2 pcs = 72 | 3 pcs = 101",
    ],
    { lander: ["GB", "US", "AU"] },
  );
  assert.deepEqual(svar.rader.map((r) => r.market).sort(), ["AU", "GB", "US"]);
});

test("delvis ifylld rad: det ifyllda läses, det tomma sägs", () => {
  const svar = enRad("SE: 1 pc = 40 USD | 2 pcs = ___ USD | 3 pcs = ___ USD");
  assert.deepEqual(priser(svar), { 1: 40 });
  assert.deepEqual(svar.rader[0].tomma, [2, 3]);
});

// ------------------------------------------------------------------
// ID-raderna och blocken
// ------------------------------------------------------------------

test("priser efter en ny rubrik utan läsbar ID-rad får ALDRIG föregående variant", () => {
  const text = [
    "#1 Tofflor — M",
    "ID: 51234567890123",
    "US: 1 pc = 12 | 2 pcs = 20 | 3 pcs = 27",
    "----------------------------------------",
    "#2 Tofflor — XXL",
    "(ID-raden bortklippt)",
    "US: 1 pc = 19 | 2 pcs = 34 | 3 pcs = 48",
  ].join("\n");
  const svar = tolkaOffertsvar(text);
  assert.equal(svar.rader.length, 1);
  assert.deepEqual(svar.rader[0].priser, { 1: 12, 2: 20, 3: 27 });
  assert.equal(svar.utanId.length, 1);
});

test("ID-raden läses med kinesiskt kolon, fetstil, kursiv, mellanslag och WhatsApp-prefix", () => {
  for (const idRad of [
    "ID：51234567890124",
    "*ID: 51234567890124*",
    "_ID: 51234567890124_",
    "ID: 5123 4567 8901 24",
    "[27/09/2026, 10:32] Lily Supplier: ID: 51234567890124",
    "#2 Tofflor — XXL ID: 51234567890124",
  ]) {
    const svar = svara(["#2 Tofflor — XXL", idRad, "US: 1 pc = 19 | 2 pcs = 34 | 3 pcs = 48"]);
    assert.equal(svar.rader.length, 1, idRad);
    assert.equal(svar.rader[0].id, "51234567890124", idRad);
  }
});

test("e-postsvar med citattecken läses, och det citerade originalet stör inte", () => {
  const citerat = [
    "Here are the prices!",
    "> StonePNL quote request · CaraShell · 2026-09-27 · USD",
    "> ID: 111111",
    "> US (United States): 1 pc = 45 USD | 2 pcs = 80 USD | 3 pcs = 110 USD",
  ].join("\n");
  const svar = tolkaOffertsvar(citerat);
  assert.deepEqual(priser(svar), { 1: 45, 2: 80, 3: 110 });

  const ovanpa = [
    "ID: 111111",
    "US: 1 pc = 45 | 2 pcs = 80 | 3 pcs = 110",
    "",
    "-----Original Message-----",
    MARKOR(),
    "ID: 111111",
    "US (United States): 1 pc = ___ USD | 2 pcs = ___ USD | 3 pcs = ___ USD",
  ].join("\n");
  const svar2 = tolkaOffertsvar(ovanpa);
  assert.equal(svar2.rader.length, 1);
  assert.equal(svar2.ofyllda.length, 0);
  // markören står under svaret men gäller ändå
  assert.equal(svar2.rader[0].valuta, "USD");
});

test("samma variant och land två gånger: lika = en rad, olika = ingen av dem", () => {
  const lika = svara(["ID: 111111", "US: 1 pc = 40 | 2 pcs = 70 | 3 pcs = 99", "US: 1 pc = 40 | 2 pcs = 70 | 3 pcs = 99"]);
  assert.equal(lika.rader.length, 1);
  assert.equal(lika.dubbletter.length, 0);
  const olika = svara(["ID: 111111", "AU (Australia): 1 pc = 58 | 2 pcs = 100 | 3 pcs = 140", "AU: 1 pc = 41 | 2 pcs = 72 | 3 pcs = 99"]);
  assert.equal(olika.rader.length, 0);
  assert.deepEqual(olika.dubbletter, [{ id: "111111", market: "AU" }]);
  // "AU sea shipping: …" följer inte mallen, men är ett andra bud för AU
  const sjo = svara(["ID: 111111", "AU (Australia): 1 pc = 58 | 2 pcs = 100 | 3 pcs = 140", "AU sea shipping: 1 pc = 41 | 2 pcs = 72 | 3 pcs = 99"]);
  assert.equal(sjo.rader.length, 0);
  assert.deepEqual(sjo.dubbletter, [{ id: "111111", market: "AU" }]);
});

// ------------------------------------------------------------------
// Valutakonflikter
// ------------------------------------------------------------------

test("fritext som nämner en annan valuta än priserna: INGET skrivs", () => {
  const fall = [
    ["Hi, all price below is RMB.", "ID: 111111", "US: 1 pc = 300 | 2 pcs = 560 | 3 pcs = 800"],
    ["Currency: 人民币", "ID: 111111", "US: 1 pc = 300 | 2 pcs = 560 | 3 pcs = 800"],
    ["Currency：RMB", "ID: 111111", "US: 1 pc = 300 | 2 pcs = 560 | 3 pcs = 800"],
    ["#1 Tofflor (price in renminbi)", "ID: 111111", "US: 1 pc = 300 | 2 pcs = 560 | 3 pcs = 800"],
    // granskning 2: valutan i parentesen efter landet
    ["ID: 111111", "US (RMB): 1 pc = 300 | 2 pcs = 560 | 3 pcs = 800", "SE: 1 pc = 40 | 2 pcs = 70 | 3 pcs = 99"],
    // olika valutor på olika rader
    ["ID: 111111", "US: 1 pc = 300 CNY | 2 pcs = 560 CNY | 3 pcs = 800 CNY", "SE: 1 pc = 40 USD | 2 pcs = 70 USD | 3 pcs = 99 USD"],
  ];
  for (const rader of fall) {
    const svar = svara(rader);
    assert.ok(svar.valutakonflikt, rader.join(" / "));
    const { rader: skrivna, problem } = offertTillRader(svar, katalog, { hemma: "SE", fria: new Set() });
    assert.equal(skrivna.length, 0, rader[0]);
    assert.equal(problem[0].kod, "valutakonflikt", rader[0]);
  }
});

test("valutan gissas aldrig: utan markörrad och utan valuta vid priset sparas inget", () => {
  const svar = tolkaOffertsvar(["ID: 111111", "US: 1 pc = 300 | 2 pcs = 560 | 3 pcs = 800"].join("\n"));
  assert.equal(svar.kand, true);
  assert.equal(svar.rader[0].valuta, "");
  const { rader, problem } = offertTillRader(svar, katalog, { hemma: "", fria: new Set() });
  assert.equal(rader.length, 0);
  assert.deepEqual(problem.map((p) => p.kod), ["ingenValuta"]);
  // valutan vid priset räcker
  const med = tolkaOffertsvar(["ID: 111111", "US: 1 pc = 300 CNY | 2 pcs = 560 CNY | 3 pcs = 800 CNY"].join("\n"));
  assert.equal(med.rader[0].valuta, "CNY");
  // ...och i parentesen efter landet
  const paren = tolkaOffertsvar(["ID: 111111", "US (RMB): 1 pc = 300 | 2 pcs = 560 | 3 pcs = 800"].join("\n"));
  assert.equal(paren.rader[0].valuta, "CNY");
});

test("två markörrader med olika valutor är en konflikt", () => {
  const svar = tolkaOffertsvar([MARKOR("USD"), MARKOR("EUR"), "ID: 111111", "US: 1 pc = 45 | 2 pcs = 80 | 3 pcs = 110"].join("\n"));
  assert.ok(svar.valutakonflikt);
});

// ------------------------------------------------------------------
// Svar → rader att skriva
// ------------------------------------------------------------------

const katalog = [
  { variantGid: gid(111111), productTitle: "Taköverdrag", variantTitle: "5,5 × 3 m", unitCost: null },
  { variantGid: gid(222222), productTitle: "Taköverdrag", variantTitle: "6,5 × 3 m", unitCost: 500 },
];

test("offertTillRader: 1 st blir kostnad, 2 och 3 st blir flerpack, och standarden fylls från hemmalandet", () => {
  const svar = svara([
    "ID: 111111",
    "SE: 1 pc = 40 | 2 pcs = 70 | 3 pcs = 99",
    "US: 1 pc = 55 | 2 pcs = 95 | 3 pcs = 130",
    "ID: 222222",
    "US: 1 pc = 60 | 2 pcs = 100 | 3 pcs = 140",
  ]);
  const { rader, problem } = offertTillRader(svar, katalog, { hemma: "SE", fria: new Set(), tillatna: new Set(["SE", "US"]) });
  assert.equal(problem.length, 0);
  const us1 = rader.find((r) => r.variant_gid === gid(111111) && r.market === "US");
  assert.equal(us1.unit_cost, 55);
  assert.deepEqual(us1.tiers, [{ units: 2, total: 95 }, { units: 3, total: 130 }]);
  const std = rader.find((r) => r.variant_gid === gid(111111) && r.market === "");
  assert.equal(std.unit_cost, 40);
  assert.equal(rader.filter((r) => r.variant_gid === gid(222222) && r.market === "").length, 0);
  assert.equal(rader.length, 4);
});

test("offertTillRader: platta eller nästan platta totaler är styckpriser — stegen sparas inte", () => {
  for (const [rad, ett] of [["NO: 1 pc = 30 | 2 pcs = 30 | 3 pcs = 30", 30], ["GB: 1 pc = 40 | 2 pcs = 41 | 3 pcs = 42", 40]]) {
    const svar = enRad(rad);
    const { rader, problem } = offertTillRader(svar, katalog, { hemma: "", fria: new Set() });
    // granskning 3: ett land utan egna steg ärvde standardens — nu antal × styckpriset
    assert.deepEqual(rader[0].tiers, [{ units: 2, total: 2 * ett }, { units: 3, total: 3 * ett }], rad);
    assert.deepEqual(problem.filter((p) => p.kod === "stegBilligare").map((p) => p.antal), [2, 3], rad);
    assert.ok(problem.some((p) => p.kod === "linjart"), rad);
  }
  // standardraden (ALL) får inga påhittade steg — utan steg räknas den linjärt ändå
  const all = offertTillRader(enRad("ALL: 1 pc = 30 | 2 pcs = 30 | 3 pcs = 30"), katalog, { hemma: "", fria: new Set() });
  assert.deepEqual(all.rader[0].tiers, []);
});

test("offertTillRader: okänt ID, X, saknat styckpris och ett flerpack billigare än en styck", () => {
  const svar = svara([
    "ID: 999999",
    "US: 1 pc = 40 | 2 pcs = 70 | 3 pcs = 99",
    "ID: 111111",
    "AU: X",
    "US: 2 pcs = 70 | 3 pcs = 99",
    "SE: 1 pc = 40 | 2 pcs = 35 | 3 pcs = 99",
  ]);
  const { rader, problem } = offertTillRader(svar, katalog, { hemma: "SE", fria: new Set() });
  const koder = problem.map((p) => p.kod).sort();
  assert.deepEqual(koder, ["ejLeverans", "okantId", "saknarEtt", "stegBilligare"]);
  const se = rader.find((r) => r.market === "SE");
  assert.deepEqual(se.tiers, [{ units: 3, total: 99 }]);
  assert.equal(rader.some((r) => r.market === "US" || r.market === "AU"), false);
});

test("offertTillRader: ett land utanför butikens marknader skrivs aldrig (EU, SO, TO)", () => {
  const svar = svara(
    [
      "ID: 111111",
      "EU (SE, DK, FI): 1 pc = 38 | 2 pcs = 70 | 3 pcs = 100",
      "So 1 pc = 45 | 2 pcs = 80 | 3 pcs = 110 for all other countries",
      "To US: 1 pc = 45 | 2 pcs = 80 | 3 pcs = 110",
    ],
    { lander: ["SE", "US"] },
  );
  const { rader, problem } = offertTillRader(svar, katalog, { hemma: "SE", fria: new Set(), tillatna: new Set(["SE", "US"]) });
  assert.equal(rader.length, 0);
  // EU läses men är ingen marknad; "So …" och "To US: …" är inga landsrader
  assert.deepEqual(problem.filter((p) => p.kod === "okantLand").map((p) => p.market), ["EU"]);
  assert.deepEqual(problem.filter((p) => p.kod !== "okantLand").map((p) => p.kod), ["olastRad", "olastRad"]);
});

test("offertTillRader: utan hemmapris sägs det att standarden fortfarande saknas", () => {
  const svar = enRad("US: 1 pc = 55 | 2 pcs = 95 | 3 pcs = 130");
  const { rader, problem } = offertTillRader(svar, katalog, { hemma: "SE", fria: new Set() });
  assert.equal(rader.length, 1);
  assert.deepEqual(problem.map((p) => p.kod), ["ingenStandard"]);
});

test("offertTillRader: ALL-raden blir standardkostnaden — men bara i en butik utan marknader", () => {
  const svar = enRad("ALL: 1 pc = 12 | 2 pcs = 20 | 3 pcs = 27");
  const { rader, problem } = offertTillRader(svar, katalog, { hemma: "", fria: new Set(), tillatna: new Set() });
  assert.equal(problem.length, 0);
  assert.equal(rader.length, 1);
  assert.equal(rader[0].market, "");
  // granskning 2: med marknader hade "ALL: 12" blivit kostnaden i USA också
  const medMarknader = offertTillRader(svar, katalog, { hemma: "SE", fria: new Set(), tillatna: new Set(["SE", "US"]) });
  assert.equal(medMarknader.rader.length, 0);
  assert.deepEqual(medMarknader.problem.map((p) => p.kod), ["okantLand"]);
});

test("offertTillRader: DDP samlas per land — 'no DDP' är inte DDP", () => {
  const svar = enRad("US: 1 pc = 55 | 2 pcs = 95 | 3 pcs = 130 DDP");
  assert.deepEqual(offertTillRader(svar, katalog, { hemma: "US", fria: new Set() }).ddp, ["US"]);
  assert.deepEqual(offertTillRader(enRad("US (DDP): 1 pc = 55 | 2 pcs = 95 | 3 pcs = 130"), katalog, { hemma: "US", fria: new Set() }).ddp, ["US"]);
  for (const rad of [
    "US: 1 pc = 55 | 2 pcs = 95 | 3 pcs = 130 no DDP",
    "US: 1 pc = 55 | 2 pcs = 95 | 3 pcs = 130 DDP not included",
    "US: 1 pc = 55 | 2 pcs = 95 | 3 pcs = 130 (DDP: no)",
    "US (not DDP): 1 pc = 55 | 2 pcs = 95 | 3 pcs = 130",
  ]) {
    const svar2 = enRad(rad);
    assert.deepEqual(svar2.rader[0]?.priser, { 1: 55, 2: 95, 3: 130 }, rad);
    assert.deepEqual(offertTillRader(svar2, katalog, { hemma: "US", fria: new Set() }).ddp, [], rad);
  }
});

test("offertTillRader: olästa rader, dubbletter och delvis ifyllda syns som problem", () => {
  const svar = svara([
    "ID: 111111",
    "US: 1 pc = 30+15 | 2 pcs = 55+20 | 3 pcs = 80+25",
    "AU: 1 pc = 58 | 2 pcs = 100 | 3 pcs = 140",
    "AU: 1 pc = 41 | 2 pcs = 72 | 3 pcs = 99",
    "SE: 1 pc = 40 | 2 pcs = ___ | 3 pcs = ___",
  ]);
  const { rader, problem } = offertTillRader(svar, katalog, { hemma: "SE", fria: new Set() });
  // SE saknar flerpack: räknas som antal × styckpriset, och det sägs
  assert.deepEqual(problem.map((p) => p.kod).sort(), ["dubblett", "linjart", "olasbar"]);
  assert.deepEqual(rader.map((r) => r.market).sort(), ["", "SE"]);
});

test("en prisrad utan läsbart land tappas inte tyst", () => {
  const svar = svara(["ID: 111111", "美国：1 pc = 45 | 2 pcs = 80 | 3 pcs = 110"]);
  assert.equal(svar.rader.length, 0);
  assert.equal(svar.olastaRader.length, 1);
  const { problem } = offertTillRader(svar, katalog, { hemma: "", fria: new Set() });
  assert.deepEqual(problem.map((p) => p.kod), ["olastRad"]);
});

test("fullbreddssiffror, markdown-tabell och Windows-radslut läses", () => {
  assert.deepEqual(priser(enRad("US (United States): 1 pc = ４５ USD | 2 pcs = ８０ USD | 3 pcs = １１０ USD")), { 1: 45, 2: 80, 3: 110 });
  assert.deepEqual(priser(enRad("| US | 45 | 80 | 110 |")), { 1: 45, 2: 80, 3: 110 });
  const crlf = tolkaOffertsvar(`${MARKOR()}\r\nID: 111111\r\nUS: 1 pc = 45 | 2 pcs = 80 | 3 pcs = 110\r\n`);
  assert.deepEqual(crlf.rader[0].priser, { 1: 45, 2: 80, 3: 110 });
});

test("en rad med tre tal efter en ID-rad men utan land flaggas", () => {
  const svar = svara(["ID: 111111", "美国 45 / 80 / 110"]);
  assert.equal(svar.rader.length, 0);
  assert.equal(svar.olastaRader.length, 1);
});

// ------------------------------------------------------------------
// Granskning 2: vägar som fortfarande sparade fel eller tappade tyst
// ------------------------------------------------------------------

test("räknesätt, intervall och inringade siffror blir aldrig ett pris", () => {
  // "2*40" blev 240, "3~4" blev 34 och "①4" blev 14 när tecknen städades bort
  for (const rad of [
    "US: 1 pc = 2*40 | 2 pcs = 80 | 3 pcs = 110",
    "US: 1 pc = 3~4 | 2 pcs = 80 | 3 pcs = 110",
    "US: 1 pc = ①4 | 2 pcs = 80 | 3 pcs = 110",
    "US: 1 pc = 4² | 2 pcs = 80 | 3 pcs = 110",
    "US: 1 pc = 3 × 38 | 2 pcs = 80 | 3 pcs = 110",
  ]) {
    const svar = enRad(rad);
    assert.equal(svar.rader.length, 0, rad);
    assert.equal(svar.olasbara.length, 1, rad);
  }
  // fetstil och överstrykning runt ett helt pris är fortfarande bara form
  assert.deepEqual(priser(enRad("US: 1 pc = **45** | 2 pcs = *80* | 3 pcs = `110`")), { 1: 45, 2: 80, 3: 110 });
});

test("en landsrad ger alltid något: N/A, sold out och tom rad tappas inte", () => {
  for (const rad of ["US: N/A | N/A | N/A", "US: sold out", "US: out of stock", "US: 1 pc = n/a | 2 pcs = n/a | 3 pcs = n/a", "US: cannot ship to US"]) {
    const svar = enRad(rad);
    assert.equal(svar.rader.length, 1, rad);
    assert.equal(svar.rader[0].ejLeverans, true, rad);
  }
  const tom = enRad("US:");
  assert.deepEqual(tom.ofyllda, [{ id: "111111", market: "US" }]);
  const skrap = enRad("US: please contact us");
  assert.equal(skrap.olasbara.length, 1);
});

test("en märkt rad med en omärkt bit läses inte: villkoret får inte försvinna tyst", () => {
  for (const rad of [
    "US: 1 pc = 45 | 2 pcs = 80 | 3 pcs = 110 | remote area 60",
    "US: 1 pc = 45 | 2 pcs = 80 | 3 pcs = 110 | by sea",
  ]) {
    const svar = enRad(rad);
    assert.equal(svar.rader.length, 0, rad);
    assert.equal(svar.olasbara.length, 1, rad);
  }
});

test("mallens egna rader hoppas över, men en leverantörs numrerade prisrad läses", () => {
  const svar = tolkaOffertsvar(fyllI(mall(), ["45", "80", "110"]));
  assert.equal(svar.olastaRader.length, 0);
  assert.equal(svar.utanId.length, 0);
  assert.equal(svar.valutakonflikt, null);
});

test("ett ALL-svar till en butik utan marknader läses som standardkostnad", () => {
  const svar = svara(["ID: 111111", "ALL (all countries): 1 pc = 12 | 2 pcs = 20 | 3 pcs = 27"]);
  assert.equal(svar.rader[0].market, "");
});

// ------------------------------------------------------------------
// Granskning 3
// ------------------------------------------------------------------

test("räknesätt med mellanslag blir aldrig ett tusental: '2 * 140' är inte 2140", () => {
  for (const rad of [
    "US: 1 pc = 150 CNY | 2 pcs = 2 * 140 CNY | 3 pcs = 3 * 130 CNY",
    "US: 1 pc = 1 * 150 CNY | 2 pcs = 280 CNY | 3 pcs = 390 CNY",
    "US: 1 pc = 150 | 2 pcs = 280 | 3 pcs = 110 ~ 210",
    "US: 150 / 2 * 140 / 3 * 130",
    "US: 1 pc = ~~45~~ 40 | 2 pcs = 80 | 3 pcs = 110",
  ]) {
    const svar = enRad(rad);
    assert.equal(svar.rader.length, 0, rad);
    assert.equal(svar.olasbara.length, 1, rad);
  }
});

test("en valuta i en oläsbar rad räknas: den andra radens pris sparas inte som USD", () => {
  const svar = svara(["ID: 111111", "SE: 300 RMB / 560 RMB / 800 RMB, 10-15 days", "US: 320 / 600 / 850"]);
  assert.ok(svar.valutakonflikt);
});

test("appens egna namn är inga valutor: 'EUR 42', 'Euro plug', '£25', 'Stor nok', butiken 'Euro Deals'", () => {
  for (const [butik, titel, vt] of [
    ["CaraShell", "Running Shoe", "EUR 42 / Black"],
    ["Euro Deals", "Cover", "XL"],
    ["CaraShell", "Gift card", "£25"],
    ["CaraShell", "Adapter Euro plug", ""],
    ["Bäverbutikken", "Pute", "Stor nok til to"],
    ["CaraShell", "Sängöverdrag Eurosäng", ""],
  ]) {
    const luckor = offertLuckor({
      varianter: [variant(333333, { productTitle: titel, variantTitle: vt, oms90: 10 })],
      aktiva: ["SE", "US"],
      hemma: "SE",
      shop: "",
    });
    const text = fyllI(byggOffertmeddelande({ butik, datum: "2026-09-27", valuta: "USD", varianter: luckor, landsnamn }), ["30", "55", "80"]);
    const svar = tolkaOffertsvar(text, { lander: ["SE", "US"], egenText: [butik, titel, vt] });
    assert.equal(svar.valutakonflikt, null, `${butik} / ${titel} / ${vt}`);
    assert.equal(svar.rader.length, 2, `${butik} / ${titel} / ${vt}`);
  }
});

test("alla ISO-valutor kortet kan erbjuda läses tillbaka: PLN, CHF, JPY, CZK, TRY, INR", () => {
  for (const valuta of ["PLN", "CHF", "JPY", "CZK", "TRY", "INR", "SEK", "GBP"]) {
    const svar = tolkaOffertsvar(fyllI(mall(valuta), ["120", "220", "310"]));
    assert.equal(svar.valutakonflikt, null, valuta);
    assert.equal(svar.rader.length, 5, valuta);
    assert.ok(svar.rader.every((r) => r.valuta === valuta), valuta);
  }
  // versalord i fritext är inga valutor
  assert.deepEqual(valutorI("AMD RYZEN TOP QUALITY"), []);
  assert.deepEqual(valutorI("ALL 3 SIZES"), []);
});

test("parentesen bär bara landets namn, valuta och DDP — villkor och oklar DDP läses inte", () => {
  const kat = [{ variantGid: gid(111111), productTitle: "A", variantTitle: "M", unitCost: 200 }];
  // granskning 3: "DDP not include" lästes som DDP — handlaren ombads nolla tullen
  for (const p of ["DDP not include", "remote area +15 USD", "sea shipping, MOQ 50", "DDP, no DDP"]) {
    const svar = enRad(`US (${p}): 1 pc = 45 USD | 2 pcs = 80 USD | 3 pcs = 110 USD`);
    assert.equal(svar.rader.length, 0, p);
    assert.deepEqual(offertTillRader(svar, kat, { hemma: "SE", fria: new Set() }).ddp, [], p);
  }
  // tydlig nekning läses — som INTE DDP
  for (const p of ["not including DDP", "not incl. DDP", "no DDP"]) {
    const svar = enRad(`US (${p}): 1 pc = 45 USD | 2 pcs = 80 USD | 3 pcs = 110 USD`);
    assert.equal(svar.rader.length, 1, p);
    assert.deepEqual(offertTillRader(svar, kat, { hemma: "SE", fria: new Set() }).ddp, [], p);
  }
  for (const p of ["United States", "USA", "United States, DDP", "USD", "DDP included"]) {
    const svar = enRad(`US (${p}): 1 pc = 45 | 2 pcs = 80 | 3 pcs = 110`);
    assert.equal(svar.rader.length, 1, p);
  }
  // "Myanmar (Burma)" skrivs utan egen parentes, och läses tillbaka
  const luckor = offertLuckor({ varianter: [variant(444444)], aktiva: ["MM", "CC"], hemma: "", shop: "" });
  const text = fyllI(
    byggOffertmeddelande({ butik: "A", datum: "2026-09-27", valuta: "USD", varianter: luckor, landsnamn: (k) => new Intl.DisplayNames(["en"], { type: "region" }).of(k) }),
    ["30", "55", "80"],
  );
  assert.doesNotMatch(text, /\(Myanmar \(/);
  assert.equal(tolkaOffertsvar(text, { lander: ["MM", "CC"] }).rader.length, 2);
});

test("ett fritt e-postsvar ovanför den citerade mallen: AI-rutan får läsa det", () => {
  const citerad = fyllI(mall(), ["___"]).split("\n").map((r) => `> ${r}`);
  const svar = tolkaOffertsvar(
    ["Hi Axel,", "Taköverdrag 5,5 × 3 m: US 45/80/110, SE 40/70/99", "Best regards, Lily", "", "-----Original Message-----", ...citerad].join("\n"),
  );
  assert.equal(svar.kand, false);
  assert.equal(svar.rader.length, 0);
  // e-posthuvuden är inga priser
  const huvud = tolkaOffertsvar(["Sent: Saturday, September 27, 2026 10:32 AM", "Tel: +86 138 1234 5678", ...citerad].join("\n"));
  assert.equal(huvud.olastaRader.length, 0);
  assert.equal(huvud.kand, true);
});

test("ett ID-block utan landsrad sägs: 'same as above', 'sold out', två ID-rader i rad", () => {
  for (const block of [
    ["ID: 222222 — same price as ID 111111"],
    ["ID: 222222", "Sorry, this size is sold out"],
    ["ID: 222222"],
  ]) {
    const svar = svara(["ID: 111111", "US: 1 pc = 45 | 2 pcs = 80 | 3 pcs = 110", ...block, "----------"]);
    assert.deepEqual(svar.obesvarade.map((b) => b.id), ["222222"], block.join(" / "));
    const { problem } = offertTillRader(svar, katalog, { hemma: "", fria: new Set() });
    assert.ok(problem.some((p) => p.kod === "obesvarad"), block.join(" / "));
  }
  // en rubrik med priser tappas inte
  const rubrik = svara(["#2 Tofflor — XXL: US 1 pc = 19 | 2 pcs = 34 | 3 pcs = 48"]);
  assert.equal(rubrik.olastaRader.length, 1);
});

test("DDP utanför landsraderna sägs; DDP på ALL-raden följer med", () => {
  const svar = svara(["Hi dear, all prices are DDP", "ID: 111111", "US: 1 pc = 45 | 2 pcs = 80 | 3 pcs = 110"]);
  assert.equal(svar.ddpFritext.length, 1);
  assert.ok(offertTillRader(svar, katalog, { hemma: "", fria: new Set() }).problem.some((p) => p.kod === "ddpFritext"));
  const regel8 = fyllI(mall(), ["45", "80", "110"]).replace(
    "write DDP at the end of that line.",
    "write DDP at the end of that line. -> all our prices are DDP",
  );
  assert.equal(tolkaOffertsvar(regel8).ddpFritext.length, 1);
  const all = enRad("ALL: 1 pc = 30 USD | 2 pcs = 50 USD | 3 pcs = 70 USD DDP");
  assert.deepEqual(offertTillRader(all, katalog, { hemma: "", fria: new Set(), tillatna: new Set() }).ddp, ["ALL"]);
});

test("ALL tas emot när butiken bara har hemmamarknaden (första ordern kom efter förfrågan)", () => {
  const svar = enRad("ALL: 1 pc = 10 USD | 2 pcs = 15 USD | 3 pcs = 20 USD");
  assert.equal(offertTillRader(svar, katalog, { hemma: "SE", fria: new Set(), tillatna: new Set(["SE"]) }).rader.length, 1);
  assert.equal(offertTillRader(svar, katalog, { hemma: "SE", fria: new Set(), tillatna: new Set(["SE", "US"]) }).rader.length, 0);
});

test("en SKU eller länk med 'ID' tar aldrig över blocket", () => {
  for (const sku of ["BL-ID 20001", "ID10023", "ID#55012", "id:77777", "RFID-ID20001"]) {
    const luckor = offertLuckor({ varianter: [variant(51234567890123, { sku, handle: "cover-id12345" })], aktiva: ["SE", "US"], hemma: "SE", shop: "x.myshopify.com" });
    const text = fyllI(byggOffertmeddelande({ butik: "A", datum: "2026-09-27", valuta: "USD", varianter: luckor, landsnamn }), ["10", "15", "20"]);
    const svar = tolkaOffertsvar(text);
    assert.deepEqual([...new Set(svar.rader.map((r) => r.id))], ["51234567890123"], sku);
    assert.equal(svar.rader.length, 2, sku);
  }
});

test("X i en lucka på en ifylld rad sägs, och landet får linjära steg i stället för standardens", () => {
  const svar = svara(["ID: 111111", "SE (Sweden): 1 pc = 10 | 2 pcs = 15 | 3 pcs = 20", "US (United States): 1 pc = 25 | 2 pcs = X | 3 pcs = X"]);
  const { rader, problem } = offertTillRader(svar, katalog, { hemma: "SE", fria: new Set() });
  const us = rader.find((r) => r.market === "US");
  assert.deepEqual(us.tiers, [{ units: 2, total: 50 }, { units: 3, total: 75 }]);
  assert.ok(problem.some((p) => p.kod === "linjart" && p.market === "US"));
});

test("en gåva (såld för 0) räknas som såld", () => {
  const luckor = offertLuckor({ varianter: [variant(1, { oms90: 0, enheter90: 4 }), variant(2, { oms90: 0 })], aktiva: ["SE"], hemma: "SE", shop: "" });
  assert.deepEqual(valjOffertrader(luckor, { lage: "saknas", osalda: false }).map((v) => v.id), ["1"]);
});

test("en rad som råkar stå i regel 3:s exempel är leverantörens, inte mallens", () => {
  // "US:" + "2 pcs = 30 USD" fogas ihop till en landsrad — och den saknar 1 st
  const svar = svara(["ID: 111111", "US:", "2 pcs = 30 USD"]);
  assert.deepEqual(priser(svar), { 2: 30 });
  assert.deepEqual(offertTillRader(svar, katalog, { hemma: "", fria: new Set() }).problem.map((p) => p.kod), ["saknarEtt"]);
});

// ------------------------------------------------------------------
// Granskning 4 (kontroll av granskning 3)
// ------------------------------------------------------------------

const egenFor = (vs) => vs.flatMap((v) => [v.productTitle, v.variantTitle, `${v.productTitle} — ${v.variantTitle}`]);

test("korta variantnamn ('US', 'EU', '1 Pc') suddar aldrig ut leverantörens egen text", () => {
  const katalogNamn = egenFor([
    { productTitle: "Hair Dryer", variantTitle: "US" },
    { productTitle: "Hair Dryer", variantTitle: "EU" },
    { productTitle: "Bundle", variantTitle: "1 Pc" },
    { productTitle: "Bundle", variantTitle: "2 Pcs" },
  ]);
  const text = fyllI(mall("SEK"), ["12", "20", "27"]);
  const usd = tolkaOffertsvar(`${text}\nSorry, all prices above are in USD`, { lander: ["SE", "US", "AU"], egenText: katalogNamn });
  assert.ok(usd.valutakonflikt);
  const eur = tolkaOffertsvar(`${fyllI(mall(), ["12", "20", "27"])}\nNote: all prices above are in EUR`, { egenText: katalogNamn });
  assert.ok(eur.valutakonflikt);
  const ovrigt = tolkaOffertsvar(`${fyllI(mall(), ["12", "20", "27"])}\nOther countries: 1 pc = 15, 2 pcs = 25, 3 pcs = 34`, { egenText: katalogNamn });
  assert.equal(ovrigt.olastaRader.length, 1);
});

test("antal:pris ('1:35 2:60 3:85') är inga klockslag — ett andra bud tappas inte", () => {
  const svar = svara(["ID: 111111", "AU (Australia): 1 pc = 41 | 2 pcs = 70 | 3 pcs = 99", "AU by sea: 1:35 2:60 3:85"]);
  assert.equal(svar.rader.length, 0);
  assert.deepEqual(svar.dubbletter, [{ id: "111111", market: "AU" }]);
});

test("enheter som råkar vara ISO-koder ('2 KGS', '3 PEN') stoppar inte svaret", () => {
  const svar = tolkaOffertsvar(`${fyllI(mall(), ["12", "20", "27"])}\nPacking weight 2 KGS per box\nPEN 3 colors available`);
  assert.equal(svar.valutakonflikt, null);
  assert.equal(svar.rader.length, 5);
});

test("ALL avgörs av förfrågans marknader, inte av årets", () => {
  const svar = enRad("ALL: 1 pc = 4 USD | 2 pcs = 7 USD | 3 pcs = 10 USD");
  const r = offertTillRader(svar, katalog, { hemma: "", fria: new Set(), tillatna: new Set(["DE", "FI"]), aktiva: new Set() });
  assert.equal(r.rader.length, 1);
  assert.equal(r.rader[0].market, "");
});

test("mall i en ISO-valuta: '___ PLN' är ofylld och 'X PLN' är X, även i ett citerat original", () => {
  const citerad = mall("PLN").split("\n").map((r) => `> ${r}`);
  const svar = tolkaOffertsvar(
    ["ID: 111111", "US: 1 pc = 45 PLN | 2 pcs = 80 PLN | 3 pcs = 110 PLN", "AU: X PLN", "", ...citerad].join("\n"),
  );
  assert.equal(svar.dubbletter.length, 0);
  assert.deepEqual(svar.rader.find((r) => r.market === "US").priser, { 1: 45, 2: 80, 3: 110 });
  assert.equal(svar.rader.find((r) => r.market === "AU").ejLeverans, true);
  const delvis = enRad("US: 1 pc = 45 PLN | 2 pcs = 80 PLN | 3 pcs = ___ PLN");
  assert.deepEqual(priser(delvis), { 1: 45, 2: 80 });
});

test("namn som städningen ändrar (™, hårt mellanslag, fetstil) känns ändå igen som appens", () => {
  for (const titel of ["Euro™ Plug", "Euro Plug", "**Euro** Plug", "Adapter（Euro）"]) {
    const luckor = offertLuckor({ varianter: [variant(555555, { productTitle: titel, variantTitle: "" })], aktiva: ["SE", "US"], hemma: "SE", shop: "" });
    const text = fyllI(byggOffertmeddelande({ butik: "A", datum: "2026-09-27", valuta: "USD", varianter: luckor, landsnamn }), ["30", "55", "80"]);
    const svar = tolkaOffertsvar(text, { egenText: [titel] });
    assert.equal(svar.valutakonflikt, null, titel);
    assert.equal(svar.rader.length, 2, titel);
  }
});

test("hårt radbruten e-post (72 tecken) läses: bruten länk och brutna landsrader", () => {
  const bryt = (rad, bredd = 72) => {
    const ut = [];
    let kvar = rad;
    while (kvar.length > bredd) {
      let i = kvar.lastIndexOf(" ", bredd);
      if (i <= 0) i = kvar.indexOf(" ", bredd);
      if (i <= 0) break;
      ut.push(kvar.slice(0, i));
      kvar = kvar.slice(i + 1);
    }
    ut.push(kvar);
    return ut;
  };
  const luckor = offertLuckor({
    varianter: [variant(51234567890123, { handle: "a-very-long-product-handle-for-the-roof-cover-caravan" })],
    aktiva: ["SE", "US", "GB"],
    hemma: "SE",
    shop: "yitrbk-m3.myshopify.com",
  });
  const fylld = fyllI(byggOffertmeddelande({ butik: "CaraShell", datum: "2026-09-27", valuta: "USD", varianter: luckor, landsnamn }), ["1045.50", "1980.25", "2890.75"]);
  const brutet = fylld.split("\n").flatMap((r) => bryt(r)).map((r) => `> ${r}`).join("\n");
  const svar = tolkaOffertsvar(brutet, { lander: ["SE", "US", "GB"] });
  assert.equal(svar.kand, true);
  assert.equal(svar.rader.length, 3);
  assert.deepEqual(svar.rader[0].priser, { 1: 1045.5, 2: 1980.25, 3: 2890.75 });
  assert.equal(svar.utanId.length + svar.obesvarade.length + svar.olastaRader.length, 0);
});

// ------------------------------------------------------------------
// Granskning 5 (kontroll av granskning 4)
// ------------------------------------------------------------------

test("butikens egen valuta läses även när koden är ett ord i fritext (PEN, MAD, GEL, AMD, KGS)", () => {
  for (const valuta of ["PEN", "MAD", "GEL", "AMD", "KGS", "DOP", "BOB"]) {
    const svar = tolkaOffertsvar(fyllI(mall(valuta), ["45", "80", "110"]));
    assert.equal(svar.valuta, valuta, valuta);
    assert.equal(svar.rader.length, 5, valuta);
    assert.ok(svar.rader.every((r) => r.valuta === valuta), valuta);
    assert.equal(tolkaOffertsvar(mall(valuta)).ofyllda.length, 5, valuta);
  }
});

test("en ISO-valuta i rubriken tappar inte sina versaler: 'CHF 180' i rubriken är en konflikt", () => {
  const namn = ["Taköverdrag Husvagn & Husbil 5,5–13,5 m", "111111 × 3 m", "Taköverdrag Husvagn & Husbil 5,5–13,5 m — 111111 × 3 m"];
  const text = fyllI(mall(), ["180", "330", "480"])
    .replace("#1 Taköverdrag Husvagn & Husbil 5,5–13,5 m — 111111 × 3 m", "#1 Taköverdrag Husvagn & Husbil 5,5–13,5 m — 111111 × 3 m (CHF 180 for 1 pc)")
    .split("\n")
    .map((r) => (/^[A-Z]{2} \(/.test(r) ? r.replace(/ USD/g, "") : r))
    .join("\n");
  assert.ok(tolkaOffertsvar(text, { egenText: namn }).valutakonflikt);
});

test("'To AU: 60 USD' och 'From 3 pcs …' är leverantörens priser, inte e-posthuvuden", () => {
  for (const rad of ["To AU: 60 / 105 / 150 USD", "To US please add 8 USD shipping per piece.", "From 01/10 the US price is 48 USD", "Date: 60/105/150 USD for AU"]) {
    const svar = svara(["ID: 111111", "SE (Sweden): 1 pc = 40 USD | 2 pcs = 70 USD | 3 pcs = 99 USD", rad], { lander: ["SE", "US", "AU"] });
    assert.equal(svar.olastaRader.length, 1, rad);
  }
  for (const rad of ["From: Lily <lily@supplier.cn>", "Sent: Saturday, September 27, 2026 10:32 AM", "Date: 2026-09-27", "On Sat, 27 Sep 2026 at 10:32, Lily wrote:"]) {
    assert.equal(svara([rad]).olastaRader.length, 0, rad);
  }
});

test("stående layout: 'US:' följt av en antalsrad per rad läses som EN landsrad", () => {
  const svar = svara(["ID: 111111", "US:", "1 pc = 45 USD", "2 pcs = 80 USD", "3 pcs = 110 USD"], { lander: ["SE", "US"] });
  assert.deepEqual(priser(svar), { 1: 45, 2: 80, 3: 110 });
  assert.equal(svar.olastaRader.length, 0);
});
