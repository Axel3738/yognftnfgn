/**
 * Offertförfrågan till leverantören — och läsningen av hennes svar.
 *
 * Axel 2026-09-27: *"varje gång butiken säger att det är varianter utan
 * kostnader … ska den skriva ett utkast på ett meddelande som man kan kopiera
 * … där vi ber om quotes på de här produkterna. Till alla aktiva marknader …
 * ett pack, två pack, tre pack med total cost … hon ska bli instruerad att
 * skicka bara ett meddelande med svaret på just det här meddelandet … så att
 * appen fattar."*
 *
 * Tre delar, alla rena (ingen databas, inget nät) så att de går att testa och
 * köras i webbläsaren:
 *
 * 1. `offertLuckor` — vilka varianter som saknar en riktig kostnad, och för
 *    vilka av butikens aktiva marknader.
 * 2. `byggOffertmeddelande` — meddelandet på engelska (leverantören läser
 *    engelska), med en fast mall: en rad `ID: <variant-id>` per variant och en
 *    rad per land med `1 pc = ___ | 2 pcs = ___ | 3 pcs = ___`.
 * 3. `tolkaOffertsvar` + `offertTillRader` — svaret läses UTAN modell: ID-raden
 *    pekar ut varianten exakt, landskoden marknaden, antalet steget. Modellen
 *    är bara reserven när leverantören skrivit om allt (se app.costs.tsx).
 *
 * Varför ID i stället för titlar: butikens titlar är svenska ("Taköverdrag
 * Husvagn & Husbil 5,5–13,5 m · 5,5 × 3 m"), två produkter kan heta likadant,
 * och ett tecken som ändras på vägen fram och tillbaka får titelmatchningen
 * att hoppa över raden. Ett variant-id gör inte det.
 *
 * Varje pris är TOTALEN för så många stycken i samma order, vara + frakt till
 * landet — samma betydelse som appens flerpack (`CostTier.totalCost`). Tullen
 * ingår inte: den ligger per order i Inställningar. Säger leverantören att
 * tullen ingår (DDP) sparas priset ändå, men det sägs rakt ut, för annars
 * räknas tullen två gånger.
 */
import { marknadskod } from "./marknad.ts";

/** Antalen som efterfrågas: ett, två och tre stycken i samma order. */
export const OFFERT_ANTAL = [1, 2, 3] as const;

/** Första raden i meddelandet. Känns den igen är svaret vårt eget format. */
export const OFFERT_MARKOR = "StonePNL quote request";

/** Rad-etiketten för en butik utan några kända marknader: en rad, standardkostnad. */
export const ALLA_LANDER = "ALL";

/** Sista siffergruppen i ett Shopify-gid: `gid://shopify/ProductVariant/123` → `123`. */
export function numeriskId(gid: string): string {
  const m = String(gid ?? "").match(/(\d+)\s*$/);
  return m ? m[1] : "";
}

/**
 * Butikens hemmamarknad — den där Shopifys egen kostnad (standarden) gäller.
 * Valutans land om butiken säljer dit eller inte har några marknader alls;
 * annars, med EN aktiv marknad, den (en EUR-butik har inget valutaland, men
 * en finsk butik som bara säljer till Finland är hemma där). Annars inget:
 * då räknas standarden inte som kostnad för något land.
 */
export function hemmamarknad(hemland: string, aktiva: string[]): string {
  const h = marknadskod(hemland);
  if (h && (aktiva.includes(h) || !aktiva.length)) return h;
  if (aktiva.length === 1) return aktiva[0];
  return "";
}

/** En variant i butikens katalog, med det appen vet om dess kostnader. */
export interface OffertKalla {
  variantGid: string;
  productTitle: string;
  variantTitle: string;
  sku?: string | null;
  handle?: string | null;
  /** Shopifys kostnad (standarden). Null = ingen. */
  standardCost: number | null;
  /** Egen kostnad per marknad. Null/saknas = ingen egen, ärver standarden. */
  perMarknad: Record<string, number | null>;
  /** Nettoförsäljning senaste 90 dagarna. */
  oms90: number;
  /** Sålda enheter senaste 90 dagarna. En gåva säljs för 0 men skickas ändå. */
  enheter90?: number;
  /** Handlaren har sagt att varan är gratis — då är 0 en riktig kostnad. */
  fri?: boolean;
}

/** En variant som behöver en offert, och för vilka länder. */
export interface Offertvariant {
  variantGid: string;
  id: string;
  productTitle: string;
  variantTitle: string;
  sku: string;
  url: string;
  oms90: number;
  /** Sålde varianten senaste 90 dagarna (enheter eller försäljning)? */
  sald: boolean;
  /** Varianten saknar kostnad helt — varken standard eller alla länder. */
  helt: boolean;
  /**
   * Aktiva marknader utan riktig kostnad. `""` = butiken har inga marknader
   * alls och standarden saknas (raden heter då ALL i meddelandet).
   */
  saknas: string[];
}

/**
 * Vilka varianter som saknar kostnad, och var. Samma regler som resten av
 * appen: en kostnad 0 som inte kvitterats som gratis är ingen kostnad, och
 * en variant är täckt när standarden finns ELLER varje aktiv marknad har en
 * egen. Hemmamarknaden täcks av standarden; ett annat land gör det inte —
 * frakten till USA är inte frakten till Sverige.
 */
export function offertLuckor(o: {
  varianter: OffertKalla[];
  aktiva: string[];
  hemma: string;
  /** Butikens myshopify-domän, för produktlänken. Tom = ingen länk. */
  shop: string;
}): Offertvariant[] {
  const ut: Offertvariant[] = [];
  for (const v of o.varianter) {
    const riktig = (n: number | null | undefined) => n != null && Number.isFinite(n) && (n > 0 || (n === 0 && Boolean(v.fri)));
    const standardReal = riktig(v.standardCost);
    const egen = (m: string) => riktig(v.perMarknad?.[m]);
    const tackt = standardReal || (o.aktiva.length > 0 && o.aktiva.every(egen));
    const saknas = o.aktiva.length
      ? o.aktiva.filter((m) => !egen(m) && !(m === o.hemma && standardReal))
      : standardReal
        ? []
        : [""];
    if (!saknas.length) continue;
    const id = numeriskId(v.variantGid);
    const handle = String(v.handle ?? "").trim();
    ut.push({
      variantGid: v.variantGid,
      id,
      productTitle: v.productTitle,
      variantTitle: v.variantTitle === "Default Title" ? "" : v.variantTitle,
      sku: String(v.sku ?? "").trim(),
      url: handle && o.shop ? `https://${o.shop}/products/${handle}${id ? `?variant=${id}` : ""}` : "",
      oms90: Number(v.oms90) || 0,
      sald: Number(v.oms90) > 0 || Number(v.enheter90) > 0,
      helt: !tackt,
      saknas,
    });
  }
  return ut.sort((a, b) => b.oms90 - a.oms90 || a.productTitle.localeCompare(b.productTitle));
}

/**
 * Urvalet handlaren gör: bara varianter som saknar kostnad helt ("saknas"),
 * eller även länder som i dag räknas på butikens standardkostnad ("alla").
 * Osålda varianter tas bara med när handlaren ber om det — en offert på
 * sådant som aldrig säljer är brus för leverantören.
 */
export function valjOffertrader(
  luckor: Offertvariant[],
  val: { lage: "saknas" | "alla"; osalda: boolean },
): Offertvariant[] {
  return luckor.filter((v) => (val.lage === "alla" || v.helt) && (val.osalda || v.sald));
}

const antalsord = (n: number) => `${n} ${n === 1 ? "pc" : "pcs"}`;

/** Landsnamnet i mallen, utan egna parenteser: "Myanmar (Burma)" → "Myanmar / Burma". */
export const mallnamn = (namn: string) => namn.replace(/\s*\(([^()]*)\)/g, " / $1").replace(/[()]/g, "").trim();

/**
 * Mallens fasta rader (allt utom markör, block och sammanfattning). En och
 * samma källa för meddelandet och för läsningen: en rad som ser ut som
 * mallens men har ändrats ("4. All prices in RMB") är leverantörens text.
 */
function mallensRader(valuta: string, exempel: number): string[] {
  return [
    "Hi! Could you please send us your prices for the products below?",
    "HOW TO REPLY — please follow this exactly:",
    "1. Reply with ONE single message.",
    "2. Copy this whole message and write your price instead of every ___.",
    `3. Every price is the TOTAL price for that many pieces sent together in one order: product + shipping to that country. Example: "${antalsord(exempel)} = 30 ${valuta}" means ${exempel === 1 ? "one piece costs" : `${exempel} pieces cost`} 30 ${valuta} together, shipping included. Write only the total — not "+ shipping" and not "each".`,
    `4. All prices in ${valuta}. If you use another currency, write it instead of ${valuta} after each price.`,
    '5. Keep the "ID:" lines, and keep the country code at the start of each line.',
    '6. One line per country. Do not group countries (for example "EU").',
    "7. If you cannot ship a product to a country, write X instead of the prices on that line.",
    "8. If import duty/VAT is already included in the price (DDP), write DDP at the end of that line.",
  ];
}

/**
 * Meddelandet till leverantören. Engelska, en fast mall, och instruktionen
 * att svara med EN enda text där hon fyllt i siffrorna i just den här mallen.
 *
 * Valutan står på tre ställen med flit: i markörraden (överst), efter varje
 * lucka (`1 pc = ___ USD`) och i instruktionen. Klipper hon bort huvudet står
 * valutan ändå kvar bredvid varje pris — och byter hon valuta byter hon den
 * där hon skriver talet. Ett pris i yuan som läses som dollar blir sju gånger
 * för högt, och det syns inte som ett fel.
 */
export function byggOffertmeddelande(o: {
  butik: string;
  datum: string;
  valuta: string;
  varianter: Offertvariant[];
  /** Landsnamn på engelska för en kod (`US` → `United States`). */
  landsnamn: (kod: string) => string;
  antal?: readonly number[];
}): string {
  const antal = (o.antal?.length ? o.antal : OFFERT_ANTAL).filter((n) => Number.isInteger(n) && n >= 1);
  const valuta = o.valuta.trim().toUpperCase() || "USD";
  const priser = antal.map((n) => `${antalsord(n)} = ___ ${valuta}`).join(" | ");
  const lander = new Set<string>();
  const block = o.varianter.map((v, i) => {
    const rader = [
      `#${i + 1} ${v.productTitle}${v.variantTitle ? ` — ${v.variantTitle}` : ""}`,
      `ID: ${v.id}`,
      ...(v.sku ? [`SKU: ${v.sku}`] : []),
      ...(v.url ? [`Link: ${v.url}`] : []),
      ...v.saknas.map((m) => {
        lander.add(m);
        return m ? `${m} (${mallnamn(o.landsnamn(m))}): ${priser}` : `${ALLA_LANDER}: ${priser}`;
      }),
    ];
    return rader.join("\n");
  });
  const exempel = antal.find((n) => n >= 2) ?? antal[0] ?? 1;
  const [halsning, hur, ...regler] = mallensRader(valuta, exempel);
  return [
    `${OFFERT_MARKOR} · ${o.butik} · ${o.datum} · ${valuta}`,
    "",
    halsning,
    "",
    hur,
    ...regler,
    "",
    ...block.flatMap((b) => ["----------------------------------------", b]),
    "----------------------------------------",
    "",
    `${o.varianter.length} ${o.varianter.length === 1 ? "product" : "products"}, ${lander.size} ${lander.size === 1 ? "country" : "countries"}. Thank you!`,
  ].join("\n");
}

/* ------------------------------------------------------------------ */
/* Svaret                                                               */
/* ------------------------------------------------------------------ */
/*
 * Grundregeln: läs bara det som är entydigt. Ett värde är ETT tal, med högst
 * en valuta bredvid. Allt annat — "30+15", "45 each", "45 USD (≈320 RMB)",
 * "110 7-12 days", ett antal utan pris — blir ett synligt problem på
 * kvittot och sparas inte. En rad som inte blir något efter en ID-rad sägs
 * också. Granskningen 2026-09-27 hittade sju sätt att få ett tyst fel pris
 * ur den första, "toleranta" versionen; tolerans här är ett fel som syns
 * först i vinsten.
 */

/** En landsrad i svaret. */
export interface OffertSvarRad {
  /** Variant-id ur ID-raden i samma block. */
  id: string;
  /** Landskod. `""` = ALL (standardkostnaden, bara för butiker utan marknader). */
  market: string;
  /** Totalpris per antal, i `valuta`. */
  priser: Record<number, number>;
  /** Valutan priserna står i. `""` = den står ingenstans — raden skrivs inte. */
  valuta: string;
  /** Leverantören skrev DDP (inte "no DDP"): tullen ingår i priset. */
  ddp: boolean;
  /** Leverantören skrev X / "can't ship" / "sold out": skickas inte dit. */
  ejLeverans: boolean;
  /** Antal som stod kvar som ___ på en annars ifylld rad. */
  tomma: number[];
  /** Raden som den stod, för felmeddelanden. */
  rad: string;
}

export type OlasbarOrsak = "styckpris" | "summa" | "otydligt";

export interface OffertSvar {
  /**
   * Svaret följer mallen: markörraden eller en ID-rad, och minst en ifylld
   * landsrad i mallens form — eller bara ofyllda rader och inget annat.
   * Falskt när leverantören svarat i egen form (priser utan landsrad i
   * mallen): då får AI-rutan läsa det.
   */
  kand: boolean;
  /** Förfrågans valuta (markörraden och mallens regler), eller "". */
  valuta: string;
  rader: OffertSvarRad[];
  /** Landsrader utan någon ID-rad i samma block. */
  utanId: string[];
  /** Landsrader som fortfarande står med ___ (eller helt tomma). */
  ofyllda: { id: string; market: string }[];
  /** Landsrader som inte gick att läsa entydigt. */
  olasbara: { id: string; market: string; rad: string; orsak: OlasbarOrsak }[];
  /** Samma variant och land med två bud — ingen av dem skrivs. */
  dubbletter: { id: string; market: string }[];
  /**
   * Svaret läses i mer än en valuta, eller nämner en annan valuta än den
   * priserna läses i ("all price below is RMB", "US (RMB): …" bredvid en
   * rad i USD). Då skrivs INGENTING: det går inte att veta vilken som gäller.
   */
  valutakonflikt: { namnd: string[]; lastI: string[] } | null;
  /** Rader med priser som inte gick att koppla till ett land. */
  olastaRader: string[];
  /** ID-block som inte gav någon landsrad alls ("same as above", "sold out"). */
  obesvarade: { id: string; rad: string }[];
  /** Fritext som säger DDP utanför landsraderna ("all prices are DDP"). */
  ddpFritext: string[];
}

/**
 * Valutor som nämns i en text, med ordgränser. Kinesiska och vanliga
 * leverantörsord är med; "AU$", "C$" och "S$" är sina egna valutor, inte
 * dollar. "kr" är inte med — det kan vara SEK, NOK eller DKK.
 */
/* Koder avgränsas mot BOKSTÄVER (alla alfabet), inte mot ordgräns: "45usd"
   och "45USD" ska kännas igen, "BUSD", "CNYX" och "Eurosäng" ska inte. */
const kod = (k: string) => `(?<!\\p{L})${k}(?!\\p{L})`;
const VALUTAMONSTER: [RegExp, string][] = [
  [new RegExp(`(?<!\\p{L})AU\\$|(?<!\\p{L})A\\$|${kod("AUD")}`, "iu"), "AUD"],
  [new RegExp(`(?<!\\p{L})CA\\$|(?<!\\p{L})C\\$|${kod("CAD")}`, "iu"), "CAD"],
  [new RegExp(`(?<!\\p{L})NZ\\$|${kod("NZD")}`, "iu"), "NZD"],
  [new RegExp(`(?<!\\p{L})HK\\$|${kod("HKD")}|港元`, "iu"), "HKD"],
  [new RegExp(`(?<!\\p{L})S\\$|${kod("SGD")}`, "iu"), "SGD"],
  [new RegExp(`(?<!\\p{L})US\\$|${kod("USD")}|美元|(?<!\\p{L})\\$`, "iu"), "USD"],
  [new RegExp(`[¥￥]|${kod("RMB")}|${kod("CNY")}|人民币|(?<![美欧港])元|${kod("yuan")}|${kod("renminbi")}`, "iu"), "CNY"],
  [new RegExp(`€|${kod("EUR")}|${kod("euros?")}|欧元`, "iu"), "EUR"],
  [new RegExp(`£|${kod("GBP")}`, "iu"), "GBP"],
  [new RegExp(kod("SEK"), "iu"), "SEK"],
  [new RegExp(kod("NOK"), "iu"), "NOK"],
  [new RegExp(kod("DKK"), "iu"), "DKK"],
];

/**
 * Övriga ISO 4217-koder (PLN, CHF, JPY, TRY, INR …) — kortet erbjuder
 * butikens egen valuta, och regel 4 ber leverantören skriva sin. Bara i
 * VERSALER och bara intill ett tal ("45 PLN", "PLN45"), så att vanliga
 * versalord i fritext ("AMD", "TOP") inte blir valutor. "ALL" är mallens
 * landskod, inte albanska lek.
 */
/* Koder som också är vanliga ord eller enheter i en leverantörs text:
   "2 KGS", "3 PEN", "TOP 5", "1 CUP" — aldrig valutor här. */
const ISO_NEKADE = new Set(["ALL", "KGS", "PEN", "GEL", "TOP", "CUP", "MAD", "SOS", "BOB", "MOP", "BAM", "DOP", "AMD", "ANG", "LAK", "ERN", "BIF"]);
/** Alla ISO-koder — i en prisruta och på markörraden, där det bara kan vara en valuta. */
const ISO_ALLA: ReadonlySet<string> = (() => {
  try {
    const lista = (Intl as unknown as { supportedValuesOf?: (k: string) => string[] }).supportedValuesOf?.("currency") ?? [];
    return new Set(lista.filter((k) => k !== "ALL"));
  } catch {
    return new Set<string>();
  }
})();
/** ISO-koder i leverantörens fritext — utan de som också är ord och enheter. */
const ISO_KODER: ReadonlySet<string> = new Set([...ISO_ALLA].filter((k) => !ISO_NEKADE.has(k)));
const ISO_VID_TAL = /(?<=\d\s?)[A-Z]{3}(?!\p{L})|(?<!\p{L})[A-Z]{3}(?=\s?\d)/gu;

/** Är koden en valuta appen kan läsa? (Markörradens sista led.) */
export function arValutakod(k: string): boolean {
  return /^[A-Z]{3}$/.test(k) && (ISO_ALLA.has(k) || VALUTAMONSTER.some(([, v]) => v === k));
}

/**
 * Förfrågans valuta ur markörraden i en text, eller "". För AI-rutan när
 * svaret inte följer mallen: då gäller valutan förfrågan faktiskt skrevs i,
 * inte vad kortets rullista råkar visa i dag.
 */
export function markorValuta(text: string): string {
  for (const rad of String(text ?? "").split(/\r?\n/)) {
    if (!rad.includes(OFFERT_MARKOR)) continue;
    const sista = (rad.split("·").pop() ?? "").trim().toUpperCase();
    if (arValutakod(sista)) return sista;
  }
  return "";
}

/** Alla valutor som nämns i texten. */
export function valutorI(text: string): string[] {
  const t = String(text ?? "");
  const ut = VALUTAMONSTER.filter(([re]) => re.test(t)).map(([, v]) => v);
  for (const m of t.match(ISO_VID_TAL) ?? []) if (ISO_KODER.has(m) && !ut.includes(m)) ut.push(m);
  return ut;
}

/** Valutan som nämns i en text, eller "" (flera = den första i listan). */
export function valutaI(text: string): string {
  return valutorI(text)[0] ?? "";
}

/** Tar bort alla valutamarkörer ur en text. */
function utanValuta(text: string): string {
  let t = text;
  for (const [re] of VALUTAMONSTER) t = t.replace(new RegExp(re.source, "giu"), " ");
  return t.replace(ISO_VID_TAL, (m) => (ISO_KODER.has(m) ? " " : m));
}

/* I EN prisruta är en ISO-kod en valuta även utan tal intill ("___ PLN",
   "X PLN"), och även en kod som i fritext vore ett ord: butikens egen
   valuta kan vara PEN eller MAD, och då står den efter varje pris. */
const ISO_ORD = /(?<!\p{L})[A-Z]{3}(?!\p{L})/gu;
function cellValutor(cell: string): string[] {
  const ut = valutorI(cell);
  for (const m of cell.match(ISO_ORD) ?? []) if (ISO_ALLA.has(m) && !ut.includes(m)) ut.push(m);
  return ut;
}
function utanCellValuta(cell: string): string {
  return utanValuta(cell).replace(ISO_ORD, (m) => (ISO_ALLA.has(m) ? " " : m));
}

/**
 * Ett belopp, strikt: exakt ett tal. "45", "45.50", "45,50", "1,234.50",
 * "1.234,50", "1 234,50". Tusentalsavgränsare bara med exakt tre siffror
 * efter ("110 7" är två tal, inte 1107). Null när det inte är exakt ett tal.
 */
export function tolkaBelopp(ra: string): number | null {
  const v = String(ra ?? "").trim().replace(/[.,;:]+$/, "").trim();
  if (!v) return null;
  const tusen = v.match(/^(\d{1,3})((?:[ ,.'’ ]\d{3})+)(?:([.,])(\d{1,2}))?$/);
  if (tusen) {
    const sep = tusen[2][0];
    /* "45,500" är tusental; men "1.234" med ett enda punktled — europeiskt
       tusental — läses också som tusental: ingen leverantör skriver 3 decimaler. */
    if (tusen[3] && tusen[3] === sep) return null;
    const heltal = (tusen[1] + tusen[2]).replace(/[ ,.'’ ]/g, "");
    return Number(tusen[3] ? `${heltal}.${tusen[4]}` : heltal);
  }
  const enkel = v.match(/^(\d+)(?:[.,](\d{1,2}))?$/);
  if (enkel) return Number(enkel[2] ? `${enkel[1]}.${enkel[2]}` : enkel[1]);
  return null;
}

/** Ett ifyllt värde: ett pris, X, en tom lucka eller något oläsbart. */
type Varde =
  | { typ: "pris"; belopp: number; valuta: string }
  | { typ: "x" }
  | { typ: "tom" }
  | { typ: "olasbar"; orsak: OlasbarOrsak };

/** "Skickas inte dit" — som hel cell eller hel rad. */
const EJ =
  "x|-|–|—|n\\/?a|na|none|no|not available|sold out|out of stock|no stock|no shipping|" +
  "(?:cannot|can'?t|don'?t|do not|unable to|not)\\s+ship\\w*(?:\\s+(?:there|to\\s+\\w+))?|不发|不能发|缺货|无";
const X_CELL = new RegExp(`^(?:${EJ})$`, "i");
const EJ_RAD = new RegExp(`^(?:sorry,?\\s*)?(?:${EJ})[.!]*$`, "i");

function tolkaVarde(ra: string): Varde {
  const v = ra.replace(/\s+/g, " ").trim().replace(/[.,;:]+$/, "").trim();
  if (!v || /^[_\s]+$/.test(v) || /^[.?]+$/.test(v)) return { typ: "tom" };
  const utanV = utanCellValuta(v).replace(/\s+/g, " ").trim();
  /* "___ USD" (orört) och en valuta utan tal är tomma luckor, inte priser. */
  if (!utanV || /^[_\s]+$/.test(utanV)) return { typ: "tom" };
  if (X_CELL.test(utanV)) return { typ: "x" };
  const valutor = [...new Set(cellValutor(v))];
  if (valutor.length > 1) return { typ: "olasbar", orsak: "otydligt" };
  const belopp = tolkaBelopp(utanV);
  if (belopp == null) return { typ: "olasbar", orsak: /\+/.test(utanV) ? "summa" : "otydligt" };
  return { typ: "pris", belopp, valuta: valutor[0] ?? "" };
}

/** Ett styckpris i stället för ett totalpris: "45 each", "45/pc", "per piece", "单价". */
const STYCKPRIS = /\beach\b|\bper\s*(?:pc|pcs|piece|pieces|unit|pair|set)\b|\/\s*(?:pc|pcs|piece|unit|pair|set)\b|\/\s*件|单价|每件/i;
/** Två tal ihopskrivna: "30+15", "30 + 15 = 45". */
const SUMMA = /\d\s*\+\s*\d/;
/** Räknesätt och intervall mellan tal: "2*40", "3~4", "3 × 38". ("1x45" är ett antal — det sköts av ANTAL_I_BIT.) */
const RAKNESATT = /\d\s*[*×~]\s*\d/;

/** Ett antal med enhet och/eller skiljetecken först i en bit: "2 pcs = …", "1pc 45", "1x45", "3 - …". */
const ANTAL_I_BIT = /^(\d{1,3})\s*(pcs?|pieces?|piece|pairs?|packs?|units?|sets?|st|件|套|双|个|x|×)?\s*([=:>]|[-–—→]+)?\s*(.*)$/i;
/** Ett märkt antal var som helst på en rad — för att känna igen prisrader utan land. */
const MARKT_ANTAL = /\d{1,3}\s*(?:pcs?|pieces?|pairs?|packs?|units?|sets?|件|套|双|个)\s*[=:\-–—→]/i;

/** Delar en landsrads priser i bitar: | ; tab, " / ", "/" före ett tal, ", " före ett tal. */
function bitar(rest: string): string[] {
  return rest
    .split(/\s*(?:\||;|\t|\s\/\s|\/(?=\s*\d)|,\s+(?=\d))\s*/)
    .map((b) => b.trim())
    .filter(Boolean);
}

/**
 * DDP: "DDP" (eller "DDP included", "incl. DDP") betyder att tullen ingår;
 * "no DDP", "DDP not included", "not incl. DDP", "DDP: no" betyder motsatsen.
 * Står båda i samma text är det oklart. Orden tas bort ur texten efteråt —
 * det som blir kvar prövas som vanligt, så "DDP not include" (utan d) blir
 * oläsbart i stället för att läsas som DDP.
 */
const DDP_NEJ =
  /\b(?:no|not|without|excl\.?|excluding|excluded|non)[\s-]*(?:incl(?:\.|uding|uded|udes)?\s+)?DDP(?!\p{L})|(?<!\p{L})DDP\s*[:=]?\s*(?:is\s+)?(?:not\s+incl(?:\.|uded|uding|udes)?(?=\s|$|[.,;)])|excluded|excl\.?|no(?!\p{L}))/giu;
const DDP_JA = /\b(?:incl(?:\.|uding|uded|udes)?\s+)?DDP(?:\s+(?:is\s+)?incl(?:\.|uded|udes)?(?=\s|$|[.,;)]))?(?!\p{L})/giu;
function tolkaDdp(text: string): { ddp: boolean; oklart: boolean; rest: string } {
  const nej = new RegExp(DDP_NEJ.source, DDP_NEJ.flags).test(text);
  const utanNej = text.replace(new RegExp(DDP_NEJ.source, DDP_NEJ.flags), " ");
  const ja = new RegExp(DDP_JA.source, DDP_JA.flags).test(utanNej);
  const rest = utanNej.replace(new RegExp(DDP_JA.source, DDP_JA.flags), " ").replace(/[([]\s*[)\]]/g, " ");
  return { ddp: ja && !nej, oklart: ja && nej, rest };
}

/**
 * Städar det chattar lägger till: citattecken, punkter, fetstil, WhatsApp-
 * prefix, fullbreddstecken, tabellrör. Aldrig mellan två tal: "2*40",
 * "2 * 140" och "3 ~ 4" ska förbli oläsbara, inte bli 240, 2140 och 34.
 */
function tecken(ra: string): string {
  /* Inringade och upphöjda siffror (①, ²) blir en markör som gör raden
     oläsbar — NFKC hade annars gjort "①4" till 14. */
  let r = ra.replace(/[①-⓿❶-➓²³¹⁰-₟]/g, "¤");
  r = r.normalize("NFKC").replace(/ /g, " ");
  /* Ett räknesätt eller intervall mellan två tal, med eller utan mellanslag. */
  r = r.replace(/(\d)\s*[*~]+\s*(?=\d)/g, "$1 ¤ ");
  return r.replace(/[*~`]+/g, "").trim();
}
function stada(radRa: string): string {
  let r = tecken(radRa);
  /* WhatsApp: "[27/09/2026, 10:32] Lily Supplier: …" */
  r = r.replace(/^\[[^\]]{1,40}\]\s*[^:\n]{1,40}:\s*/, "");
  /* E-postcitat och punktlistor — men inte avdelare som "-----". */
  r = r.replace(/^(?:>\s*)+/, "");
  if (!/^[-_=—–]{3,}/.test(r)) r = r.replace(/^(?:[•·]|-\s|–\s)\s*/, "");
  /* Markdown-/kalkyltabell: "| US | 45 | 80 | 110 |" → "US | 45 | 80 | 110". */
  if (/^\|.*\|$/.test(r)) r = r.replace(/^\|\s*/, "").replace(/\s*\|$/, "");
  return r.trim();
}

/** För jämförelse med mallens text: raka citattecken, ett mellanslag, gemener. */
const jmf = (t: string) =>
  t
    .replace(/[“”„‟"]/g, '"')
    .replace(/[‘’‚‛']/g, "'")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

/** Mallens fasta rader per valuta, för jämförelsen. */
const mallCache = new Map<string, string[]>();
function mallFor(valuta: string): string[] {
  let r = mallCache.get(valuta);
  if (!r) {
    r = [1, 2, 3].flatMap((ex) => mallensRader(valuta, ex)).map(jmf);
    mallCache.set(valuta, r);
  }
  return r;
}

/**
 * Är raden mallens egen text, oförändrad? Hela raden eller en bit av en
 * rad (e-post bryter långa rader). En ÄNDRAD mallrad ("4. All prices in
 * RMB …", "8. … → all our prices are DDP") är leverantörens text.
 */
function arMalltext(rad: string): boolean {
  if (/^\d+ products?, \d+ countr(?:y|ies)\. Thank you!$/i.test(rad)) return true;
  const r = jmf(rad);
  const koder = [...new Set([...(rad.match(/[A-Z]{3}/g) ?? []), "USD"])];
  if (koder.some((k) => mallFor(k).includes(r))) return true;
  /* En radbruten bit: lång nog att inte vara leverantörens egen rad. Med
     siffror i ("2 pcs = 30 USD") krävs mer — ett pris får aldrig
     försvinna för att det råkar stå i regel 3:s exempel. */
  if (r.length < (/\d/.test(r) ? 40 : 20)) return false;
  return koder.some((k) => mallFor(k).some((m) => m.includes(r)));
}

/** Landsnamn på engelska → kod, för de länder anroparen väntar sig. */
const REGIONER = (() => {
  try {
    return new Intl.DisplayNames(["en"], { type: "region" });
  } catch {
    return null;
  }
})();
const ALIAS: Record<string, string[]> = {
  US: ["usa", "america", "united states of america", "us"],
  GB: ["uk", "england", "great britain", "britain", "united kingdom"],
  "": ["all", "all countries", "worldwide", "all markets"],
};
function namnkarta(lander: readonly string[]): Map<string, string> {
  const karta = new Map<string, string>();
  for (const k of lander) {
    if (!k) continue;
    const namn = REGIONER?.of(k);
    if (namn && namn !== k) karta.set(namn.toLowerCase(), k);
  }
  for (const k of ["US", "GB"]) if (lander.includes(k)) for (const a of ALIAS[k]) if (a.length > 2) karta.set(a, k);
  return karta;
}
/** Namnet som bokstäver i gemener: "Myanmar / Burma" → "myanmarburma". */
const bokstaver = (t: string) => t.toLowerCase().replace(/[^\p{L}]/gu, "");
/** Godtagbara namn på landet i parentesen efter koden. */
function namnPa(market: string): Set<string> {
  const ut = new Set<string>(ALIAS[market]?.map(bokstaver) ?? []);
  if (market) {
    ut.add(bokstaver(market));
    const n = REGIONER?.of(market);
    if (n && n !== market) ut.add(bokstaver(n));
  }
  return ut;
}

/**
 * Är raden en landsrad? Strikt: en landskod i VERSALER först (som i mallen),
 * eventuellt en parentes (en nivå inuti tillåts), och sedan kolon,
 * tabellrör, ett tankstreck eller direkt priserna. "No problem, 1 pc = …"
 * och "All colors, …" är inga landsrader. Engelska landsnamn godtas för de
 * länder anroparen väntar sig, men bara följda av kolon eller parentes.
 */
const PAREN = String.raw`\(((?:[^()]|\([^()]*\))*)\)`;
const LANDSRAD = new RegExp(String.raw`^([A-Z]{2}|USA|UK|ALL)(?:\s*${PAREN})?\s*(?:[:|]|[-–—](?=\s)|(?=\s+(?:[\d_]|X\b)))\s*(.*)$`);
function landsrad(rad: string, namn: Map<string, string>): { market: string; paren: string; rest: string } | null {
  const m = rad.match(LANDSRAD);
  if (m) {
    const k = m[1];
    const market = k === "ALL" ? "" : k === "UK" ? "GB" : k === "USA" ? "US" : marknadskod(k);
    if (k === "ALL" || market) return { market, paren: m[2] ?? "", rest: m[3] ?? "" };
  }
  const lag = rad.toLowerCase();
  const namnTraff = [...namn.keys()].sort((a, b) => b.length - a.length).find((n) => lag.startsWith(n));
  if (namnTraff) {
    const efter = rad.slice(namnTraff.length).match(new RegExp(String.raw`^\s*(?:${PAREN})?\s*[:|]\s*(.*)$`));
    if (efter) return { market: namn.get(namnTraff)!, paren: efter[1] ?? "", rest: efter[2] ?? "" };
  }
  return null;
}

/** En rad som börjar med ett märkt antal: "2 pcs = 80 USD", "3 pairs: 110". */
const ANTALSRAD = /^\d{1,3}\s*(?:pcs?|pieces?|pairs?|packs?|units?|sets?|件|套|双|个)\s*[=:\-–—→]/i;

/** Rubrik för en ny produkt: "#2 …", "No. 2", "Product 2", "Item 2". */
const RUBRIK = /^(?:#|№|no\.\s*|product\s*|item\s*)\s*\d+\b/i;
/** ID-raden: först på raden (efter städningen), eller efter en rubrik. */
const ID_FORST = /^_*ID\s*[:#=]?\s*(\d(?:[\d ]{3,}\d))(?!\d)/i;
const ID_I_RUBRIK = /(?<![A-Za-z])ID\s*[:#=]?\s*(\d(?:[\d ]{3,}\d))(?!\d)/i;

/**
 * Ser raden ut som priser? Datum och klockslag räknas inte ("Sent: 27/09/2026
 * 10:32"). Märkta antal, tal med snedstreck/rör emellan eller ett tal med
 * valuta räcker; inne i ett block också tre fristående tal.
 */
function serUtSomPriser(rad: string, iBlock: boolean): boolean {
  /* E-postens huvudrader är inga priser — bara i huvudets form ("From: Lily
     <x@y>", "Sent: Saturday, …", "On … wrote:"). "To AU: 60 USD" och
     "From 3 pcs 99 USD" är leverantörens priser. */
  const huvud =
    /^(?:from|to|cc|bcc)\s*:\s*[^:]*[@<]/i.test(rad) ||
    /^(?:sent|date)\s*:\s*(?:(?:mon|tue|wed|thu|fri|sat|sun)[a-z]*\b|\d{4}-\d{2}-\d{2}|\d{1,2}\s+[a-z]{3,9}\s+\d{4}|[a-z]{3,9}\s+\d{1,2},?\s+\d{4})/i.test(rad) ||
    /^on\s.+\swrote:?\s*$/i.test(rad);
  if (huvud && !MARKT_ANTAL.test(rad)) return false;
  /* Bara datum med fyrsiffrigt år — "45/80/110" och "12/20/27" är priser —
     och bara klockslag med AM/PM eller sekunder: "1:35 2:60 3:85" är antal:pris. */
  const t = rad
    .replace(/\b(?:\d{4}[\/.-]\d{1,2}[\/.-]\d{1,2}|\d{1,2}[\/.-]\d{1,2}[\/.-]\d{4})\b/g, " ")
    .replace(/\b\d{1,2}:\d{2}(?::\d{2})?\s*(?:am|pm)\b|\b\d{1,2}:\d{2}:\d{2}\b/gi, " ");
  if (/(?:^|\s)\d{1,2}\s*:\s*\d+(?:[.,]\d+)?\s+\d{1,2}\s*:\s*\d/.test(t)) return true;
  if (MARKT_ANTAL.test(t)) return true;
  if (/\d+(?:[.,]\d+)?\s*[\/|]\s*\d+/.test(t)) return true;
  if (valutorI(t).length && /\d/.test(utanValuta(t))) return true;
  return iBlock && (t.match(/\d+(?:[.,]\d+)?/g) ?? []).length >= 3;
}

/**
 * Läser leverantörens svar. Ingen modell: ID-raden pekar ut varianten,
 * landskoden marknaden och `N pcs = …` antalet. Tolerant mot FORMEN en chatt
 * ger (kolon, fetstil, citat, WhatsApp-prefix, tabell, landsnamn, e-post-
 * radbrytning), aldrig mot INNEHÅLLET: ett värde som inte är exakt ett tal
 * läses inte, en valuta som inte står i svaret gissas inte, och en rad som
 * inte hör till mallen avslutar blocket — priser efter den får aldrig
 * föregående variant. Ett block som inte gav något sägs.
 *
 * `egenText` = appens egen text i meddelandet (produkt- och variantnamn,
 * butikens namn). Valutor där är inte leverantörens: "EUR 42", "Euro plug".
 */
export function tolkaOffertsvar(
  text: string,
  opts: { antal?: readonly number[]; lander?: readonly string[]; egenText?: readonly string[] } = {},
): OffertSvar {
  const antal = opts.antal?.length ? opts.antal : OFFERT_ANTAL;
  const namn = namnkarta(opts.lander ?? []);
  /* Appens egna namn, städade som raderna (™, hårt mellanslag, fetstil).
     De tas BARA bort där appen skrev dem — i början av en rubrik och som
     ett helt led på markörraden — aldrig ur leverantörens egen text: en
     variant som heter "US" fick annars "USD" att försvinna ur "all prices
     are in USD". */
  const egenRen = [...new Set((opts.egenText ?? []).map((t) => tecken(String(t ?? ""))).filter((t) => t.length >= 2))].sort(
    (a, b) => b.length - a.length,
  );
  const egenJmf = egenRen.map(jmf);
  const egenSet = new Set(egenJmf);
  /* Namnen för rubrikens början: gemener med ett blanksteg, grupperade på
     de två första tecknen så att varje rubrik bara prövas mot namn som kan
     passa (en katalog kan ha tusentals namn). */
  const namnPerStart = new Map<string, string[]>();
  for (const e of egenRen) {
    const n = e.toLowerCase().replace(/\s+/g, " ");
    const k = n.slice(0, 2);
    namnPerStart.set(k, [...(namnPerStart.get(k) ?? []), n]);
  }
  /** Hur många tecken av `t` som namnet `n` täcker (blanksteg valfritt många), eller -1. */
  const prefixLangd = (t: string, n: string) => {
    let i = 0;
    for (let j = 0; j < n.length; j++) {
      if (n[j] === " ") {
        if (!/\s/.test(t[i] ?? "")) return -1;
        while (/\s/.test(t[i] ?? "")) i++;
      } else if ((t[i] ?? "").toLowerCase() === n[j]) i++;
      else return -1;
    }
    return /[\p{L}\p{N}]/u.test(t[i] ?? "") ? -1 : i;
  };
  /** Rubrikens text efter "#N": appens produktnamn först, sedan leverantörens — med sina versaler. */
  const efterNamn = (t: string) => {
    /* "#N Produkt — Variant": produkten, sedan varianten efter strecket. */
    let r = t.trim();
    for (let varv = 0; varv < 2; varv++) {
      let langd = -1;
      for (const n of namnPerStart.get(r.slice(0, 2).toLowerCase().replace(/\s+/g, " ")) ?? []) {
        langd = prefixLangd(r, n);
        if (langd >= 0) break;
      }
      if (langd < 0) break;
      r = r.slice(langd).replace(/^\s*[—–-]\s*/, "");
    }
    return r;
  };
  /** En radbruten bit av ett produktnamn: lång, utan priser, och ordagrant en del av ett namn. */
  const arEgenBit = (t: string) => {
    const r = jmf(t);
    return r.length >= 8 && !serUtSomPriser(t, true) && egenJmf.some((e) => e.includes(r));
  };

  const hel = String(text ?? "");
  const rader: OffertSvarRad[] = [];
  const utanId: string[] = [];
  const ofyllda: { id: string; market: string }[] = [];
  const olasbara: OffertSvar["olasbara"] = [];
  const olastaRader: string[] = [];
  const obesvarade: OffertSvar["obesvarade"] = [];
  const ddpFritext: string[] = [];
  /** Valutor leverantören skrivit utanför priserna. */
  const fritextValutor = new Set<string>();
  /** Valutor i appens egen text: markörraden och mallens oförändrade regler. */
  const mallValutor = new Set<string>();
  let harMarkor = false;
  const arLand = (k: string) => (opts.lander ?? []).includes(k) || (!!REGIONER && REGIONER.of(k) !== k);

  /* Blocket: ett ID och det det gav. Ett block som slutar utan en enda
     landsrad (pris, X, ofylld, oläsbar) sägs — "same as above" och
     "sold out" får inte försvinna. */
  let id = "";
  let sagId = false;
  let blockGav = false;
  let blockText: string[] = [];
  const avslutaBlock = (rad?: string) => {
    if (id && !blockGav) obesvarade.push({ id, rad: [...blockText, ...(rad ? [rad] : [])].join(" / ").slice(0, 160) });
    id = "";
    blockGav = false;
    blockText = [];
  };
  /** Fritext: valutor, DDP och priser utan land samlas; aldrig tyst. */
  const fritext = (t: string, iBlock: boolean) => {
    const leverantorens = t;
    for (const v of valutorI(leverantorens)) fritextValutor.add(v);
    if (tolkaDdp(leverantorens).ddp) ddpFritext.push(t.slice(0, 120));
    if (serUtSomPriser(leverantorens, iBlock)) {
      olastaRader.push(t);
      /* Raden sägs redan — blocket räknas inte som obesvarat för den. */
      if (iBlock && id) blockGav = true;
    }
  };

  const lasLandsrad = (market: string, paren: string, restRa: string, rad: string) => {
    if (id) blockGav = true;
    const olasbar = (orsak: OlasbarOrsak) => {
      /* Valutor på en rad som inte blev läst räknas ändå: "SE: 300 RMB …, 10-15
         days" säger vilken valuta leverantören menar på de andra raderna. */
      for (const v of valutorI(`${paren} ${restRa}`)) fritextValutor.add(v);
      if (id) olasbara.push({ id, market, rad, orsak });
      else utanId.push(rad);
    };
    const ej = () => {
      if (id) rader.push({ id, market, priser: {}, valuta: "", ddp: false, ejLeverans: true, tomma: [], rad });
      else utanId.push(rad);
    };
    const parenDdp = tolkaDdp(paren);
    const radDdp = tolkaDdp(restRa);
    if (parenDdp.oklart || radDdp.oklart) return olasbar("otydligt");
    const ddp = parenDdp.ddp || radDdp.ddp;
    const parenValutor = valutorI(parenDdp.rest);
    /* Parentesen får bara bära landets namn, valutan och DDP. "(remote area
       +15 USD)", "(MOQ 50)", "(DDP not include)" är villkor — oläsbart. */
    const parenKvar = bokstaver(utanValuta(parenDdp.rest)) + utanValuta(parenDdp.rest).replace(/[^\d]/g, "");
    /* (Ett land butiken inte väntar sig avvisas senare med sitt eget skäl.) */
    const vantat = !opts.lander?.length || !market || opts.lander.includes(market);
    if (parenKvar && vantat && !namnPa(market).has(parenKvar)) return olasbar("otydligt");
    const rest = radDdp.rest.replace(/\s+/g, " ").trim();

    /* En landsrad ger ALLTID något: ett pris, X, "inte ifylld" eller "oläsbar". */
    if (!rest || /^[_\s|/;,]+$/.test(utanValuta(rest))) {
      if (id) ofyllda.push({ id, market });
      return;
    }
    if (!/\d/.test(rest) && EJ_RAD.test(rest)) return ej();
    if (STYCKPRIS.test(rest)) return olasbar("styckpris");
    if (SUMMA.test(rest)) return olasbar("summa");
    if (RAKNESATT.test(rest) || /¤/.test(rest)) return olasbar("otydligt");

    const delar = bitar(rest);
    const markta = delar.map((b) => {
      const m = b.match(ANTAL_I_BIT);
      /* En bit är märkt med ett antal när enheten står där, eller ett
         skiljetecken följer. "45" och "45.50" är värden, inte antal. */
      if (m && (m[2] || m[3])) return { q: Number(m[1]), varde: m[4] ?? "" };
      return null;
    });
    const priser: Record<number, number> = {};
    const tomma: number[] = [];
    const radValutor = new Set<string>(parenValutor);
    let x = 0;

    if (markta.some(Boolean)) {
      /* Märkt rad: VARJE bit måste vara ett antal med ett läsbart värde.
         En bit utan antal ("remote area", "by sea") är ett villkor vi inte
         kan räkna med — hellre oläsbar än att villkoret försvinner tyst. */
      for (let i = 0; i < delar.length; i++) {
        const m = markta[i];
        if (!m || m.q < 1 || m.q > 20) return olasbar("otydligt");
        const v = tolkaVarde(m.varde);
        if (v.typ === "pris") {
          if (priser[m.q] != null && priser[m.q] !== v.belopp) return olasbar("otydligt");
          priser[m.q] = v.belopp;
          if (v.valuta) radValutor.add(v.valuta);
        } else if (v.typ === "x") {
          x++;
          tomma.push(m.q);
        } else if (v.typ === "tom") tomma.push(m.q);
        else return olasbar(v.orsak);
      }
    } else {
      /* Etikettlös rad: "45 / 80 / 110" — bara om antalet bitar är exakt
         antalet begärda steg och varje bit är exakt ett tal (eller X/tom). */
      const varden = delar.map((b) => tolkaVarde(b));
      if (varden.every((v) => v.typ === "x")) return ej();
      if (varden.every((v) => v.typ === "tom")) {
        if (id) ofyllda.push({ id, market });
        return;
      }
      if (varden.length !== antal.length || !varden.every((v) => v.typ === "pris" || v.typ === "tom" || v.typ === "x")) {
        return olasbar("otydligt");
      }
      varden.forEach((v, i) => {
        if (v.typ === "pris") {
          priser[antal[i]] = v.belopp;
          if (v.valuta) radValutor.add(v.valuta);
        } else {
          if (v.typ === "x") x++;
          tomma.push(antal[i]);
        }
      });
    }

    if (radValutor.size > 1) return olasbar("otydligt");
    if (!Object.keys(priser).length) {
      if (x) return ej();
      if (id) ofyllda.push({ id, market });
      return;
    }
    if (!id) {
      for (const v of radValutor) fritextValutor.add(v);
      utanId.push(rad);
      return;
    }
    rader.push({
      id,
      market,
      priser,
      /* Radens egen valuta. Saknas den fylls förfrågans i efteråt; står
         den ingenstans förblir den "" — den gissas aldrig. */
      valuta: [...radValutor][0] ?? "",
      ddp,
      ejLeverans: false,
      /* X eller ___ för ett antal på en annars ifylld rad: sägs som "delvis". */
      tomma: [...new Set(tomma)].filter((q) => priser[q] == null),
      rad,
    });
  };

  /* E-post bryter långa rader. En landsrad som slutar mitt i ("… | 3 pcs =",
     "… | 2 pcs = 80 USD |") eller vars fortsättning bara är "= 110 USD",
     "pcs = 110 USD", "USD" eller "DDP" fogas ihop igen. Bara landsrader —
     leverantörens fritext fogas aldrig ihop med något. */
  const ren = hel.split(/\r?\n/).map(stada);
  const arLandsradText = (r: string) => {
    const utanNr = r.replace(/^\d{1,3}[.)]\s+/, "");
    return LANDSRAD.test(utanNr) || landsrad(utanNr, namn) != null;
  };
  const fortsattning = (fore: string, nasta: string) => {
    if (!nasta || nasta.includes(OFFERT_MARKOR) || ID_FORST.test(nasta) || RUBRIK.test(nasta) || arLandsradText(nasta)) return false;
    if (/^[-_=—–]{3,}/.test(nasta)) return false;
    if (/(?:=|\||:)\s*$/.test(fore)) return true;
    if (/^(?:[=|]|pcs?\b|pieces?\b)/i.test(nasta)) return true;
    /* Stående layout: "US:" / "1 pc = 45 USD" / "2 pcs = 80 USD" / … */
    if (ANTALSRAD.test(nasta)) return true;
    const kvar = utanCellValuta(tolkaDdp(nasta).rest).replace(/[\s.,;]/g, "");
    return kvar === "" && nasta.trim().length <= 12;
  };
  const linjer: string[] = [];
  for (let i = 0; i < ren.length; i++) {
    let r = ren[i];
    if (r && arLandsradText(r)) {
      while (i + 1 < ren.length && fortsattning(r, ren[i + 1])) {
        const nasta = ren[++i];
        /* En ny antalsbit blir en egen ruta; en bruten bit fortsätter rutan. */
        r = `${r}${ANTALSRAD.test(nasta) ? " | " : " "}${nasta}`;
      }
    }
    linjer.push(r);
  }

  for (const radRa of linjer) {
    let rad = radRa;
    if (!rad) continue;
    /* En bruten länk ("Link:" på en rad, adressen på nästa) är appens text. */
    if (/^https?:\/\/\S+$/.test(rad)) continue;

    /* Markörraden: "StonePNL quote request · Butik · datum · USD". Sista
       ledet är valutan; butikens namn och datumet är appens text. */
    if (rad.includes(OFFERT_MARKOR)) {
      harMarkor = true;
      avslutaBlock();
      const led = rad.split("·").map((x) => x.trim());
      const sista = (led[led.length - 1] ?? "").toUpperCase();
      if (arValutakod(sista)) mallValutor.add(sista);
      /* Butikens namn och datumet är appens; ett led leverantören lagt till
         ("· all prices RMB") är hennes. */
      for (const del of led.slice(1, arValutakod(sista) ? -1 : undefined)) {
        if (egenSet.has(jmf(del)) || /^\d{4}-\d{2}-\d{2}$/.test(del)) continue;
        for (const v of valutorI(del)) fritextValutor.add(v);
      }
      continue;
    }
    /* Mallens egna regler och hälsning, oförändrade (även radbrutna). */
    if (arMalltext(rad)) {
      for (const v of valutorI(rad)) mallValutor.add(v);
      continue;
    }

    /* Avdelare ("-----", "-----Original Message-----"): nytt block. */
    if (/^[-_=—–\s]{4,}$/.test(rad) || /^[-_=—–]{3,}/.test(rad)) {
      avslutaBlock();
      continue;
    }
    /* SKU- och länkraden är appens egen: en SKU som "ID12345" får aldrig
       ta över blocket. */
    if (/^(?:SKU|Link)\s*:/i.test(rad)) {
      if (id) continue;
      avslutaBlock();
      continue;
    }

    const arRubrik = RUBRIK.test(rad);
    /* Egen numrering ("1. SE: …", "2) Tofflor — XXL"): bort med numret, tolka resten. */
    if (!arRubrik) rad = rad.replace(/^\d{1,3}[.)]\s+/, "");

    const idTraff = rad.match(arRubrik ? ID_I_RUBRIK : ID_FORST);
    const idSiffror = idTraff?.[1].replace(/\s/g, "") ?? "";
    if (idTraff && idSiffror.length >= 5) {
      /* Det som står före id:t är rubrik — produktnamnet är appens, resten
         leverantörens (priser, valutor, DDP där sägs). */
      const fore = rad.slice(0, idTraff.index ?? 0);
      avslutaBlock();
      if (fore.trim()) fritext(efterNamn(fore.replace(RUBRIK, " ")), false);
      id = idSiffror;
      sagId = true;
      rad = rad
        .slice((idTraff.index ?? 0) + idTraff[0].length)
        .replace(/^[\s,;|:·_*—–-]+|[\s_*]+$/g, "")
        .trim();
      if (!rad) continue;
      if (/^(?:SKU|Link)\s*:/i.test(rad)) continue;
    } else if (arRubrik) {
      /* En rubrik utan ID-rad: priser efter den får ALDRIG föregående
         variant. Står det priser eller en valuta i rubriken sägs det. */
      avslutaBlock();
      fritext(efterNamn(rad.replace(RUBRIK, " ")), false);
      continue;
    }

    const land = landsrad(rad, namn);
    if (land) {
      lasLandsrad(land.market, land.paren, land.rest, rad);
      continue;
    }

    /* "AU sea shipping: 1 pc = 41 …" — ett land med priser men utan mallens
       form. Det är ett andra bud för landet: det läses inte, och gör en
       läsbar rad för samma land till en dubblett i stället för att tyst
       vinna. Blocket fortsätter (raden hör till samma variant). */
    const losLand = rad.match(/^(USA|UK|[A-Z]{2})\b/);
    if (losLand && id && serUtSomPriser(rad, true)) {
      const k = losLand[1] === "UK" ? "GB" : losLand[1] === "USA" ? "US" : losLand[1];
      if (arLand(k)) {
        blockGav = true;
        olasbara.push({ id, market: k, rad, orsak: "otydligt" });
        for (const v of valutorI(rad)) fritextValutor.add(v);
        continue;
      }
    }

    /* En bit av ett produktnamn (radbruten rubrik): appens text, inget att
       läsa — men blocket slutar, som efter en rubrik. */
    if (arEgenBit(rad)) {
      avslutaBlock();
      continue;
    }

    /* Allt annat är fritext och avslutar blocket. */
    fritext(rad, !!id);
    avslutaBlock(rad);
  }
  avslutaBlock();

  /* Förfrågans valuta: markörraden och mallens oförändrade regler. Säger de
     olika saker har någon ändrat mallen — då är det en konflikt, inte ett val. */
  const forfragan = mallValutor.size === 1 ? [...mallValutor][0] : "";
  for (const r of rader) if (!r.valuta && !r.ejLeverans) r.valuta = forfragan;

  /* Samma variant och land två gånger: samma bud = en rad (ett citerat
     original), olika bud = ingen av dem. En läsbar och en oläsbar rad för
     samma land är också två bud. */
  const perNyckel = new Map<string, OffertSvarRad[]>();
  for (const r of rader) {
    const k = `${r.id}|${r.market}`;
    perNyckel.set(k, [...(perNyckel.get(k) ?? []), r]);
  }
  const unika: OffertSvarRad[] = [];
  const dubbletter: { id: string; market: string }[] = [];
  for (const lista of perNyckel.values()) {
    const f = lista[0];
    const lika = lista.every(
      (r) => r.ejLeverans === f.ejLeverans && r.valuta === f.valuta && r.ddp === f.ddp && JSON.stringify(r.priser) === JSON.stringify(f.priser),
    );
    if (lika && !olasbara.some((o) => o.id === f.id && o.market === f.market)) unika.push(f);
    else dubbletter.push({ id: f.id, market: f.market });
  }
  const skrivna = new Set(unika.map((r) => `${r.id}|${r.market}`));
  const ofylldaKvar = ofyllda.filter(
    (f, i, alla) =>
      !skrivna.has(`${f.id}|${f.market}`) &&
      !dubbletter.some((d) => d.id === f.id && d.market === f.market) &&
      alla.findIndex((g) => g.id === f.id && g.market === f.market) === i,
  );

  /* Valutan: alla prisrader i EN valuta, och ingen annan valuta nämnd av
     leverantören. Förfrågans egen valuta räknas inte som "nämnd" — den står
     i appens text och i e-postens citat. Ändrad mall = båda räknas. */
  const lastI = [...new Set(unika.filter((r) => !r.ejLeverans && r.valuta).map((r) => r.valuta))];
  const namnda = [...new Set([...fritextValutor, ...(mallValutor.size > 1 ? mallValutor : [])])];
  const avvikande = namnda.filter((v) => !lastI.includes(v) && v !== forfragan);
  const valutakonflikt =
    lastI.length > 1 ||
    (lastI.length > 0 && avvikande.length > 0) ||
    (mallValutor.size > 1 && unika.some((r) => !r.ejLeverans))
      ? { namnd: [...new Set([...namnda, ...lastI])], lastI }
      : null;

  /* Följer svaret mallen? Ja om minst en landsrad i mallens form blev något
     (pris, X, oläsbar, dubblett), eller om det bara finns ofyllda rader.
     Står priserna i stället i leverantörens egen form får AI-rutan läsa dem. */
  const mallsvar = unika.length > 0 || olasbara.length > 0 || dubbletter.length > 0 || utanId.length > 0;
  const egnaPriser = olastaRader.length > 0;
  const kand = (harMarkor || sagId) && (mallsvar || !egnaPriser);

  return {
    kand,
    valuta: forfragan,
    rader: unika,
    utanId,
    ofyllda: ofylldaKvar,
    olasbara,
    dubbletter,
    valutakonflikt,
    olastaRader,
    obesvarade,
    ddpFritext,
  };
}

/** En rad att skriva, i samma form som AI-rutans (`SmartRad` i app.costs.tsx). */
export interface OffertRadAttSkriva {
  variant_gid: string;
  product: string;
  variant: string;
  market: string;
  unit_cost: number;
  currency: string;
  tiers: { units: number; total: number }[];
  source_label: string;
}

/** Varför en rad inte blev skriven (eller bara delvis). Texten sätts av sidan. */
export type OffertProblem =
  | { kod: "okantId"; id: string }
  | { kod: "ejLeverans"; label: string; market: string }
  | { kod: "saknarEtt"; label: string; market: string }
  | { kod: "stegBilligare"; label: string; market: string; antal: number }
  | { kod: "ingenStandard"; label: string }
  | { kod: "utanId"; rad: string }
  | { kod: "ofylld"; label: string; market: string }
  | { kod: "delvis"; label: string; market: string; antal: number[] }
  | { kod: "olasbar"; label: string; market: string; orsak: OlasbarOrsak; rad: string }
  | { kod: "dubblett"; label: string; market: string }
  | { kod: "okantLand"; label: string; market: string }
  | { kod: "valutakonflikt"; namnd: string[]; lastI: string[] }
  | { kod: "olastRad"; rad: string }
  | { kod: "ingenValuta"; label: string; market: string }
  | { kod: "obesvarad"; label: string; rad: string }
  | { kod: "ddpFritext"; rad: string }
  | { kod: "linjart"; label: string; market: string; antal: number[] };

/**
 * Svaret → rader att skriva. Priset för 1 st blir kostnaden, 2 och 3 st blir
 * flerpackssteg (totalpris). Saknar varianten en standardkostnad fylls den
 * också i, med hemmamarknadens pris: dagar utan uppdelning per land räknas
 * annars fortfarande som "kostnad saknas".
 *
 * `tillatna` = butikens aktiva marknader. En rad för ett annat land skrivs
 * aldrig: "EU" är ingen marknad, och "To US: …" får inte bli Tonga.
 */
export function offertTillRader(
  svar: OffertSvar,
  katalog: { variantGid: string; productTitle: string; variantTitle: string; unitCost: number | null }[],
  o: {
    hemma: string;
    fria: ReadonlySet<string>;
    /** Länder som tas emot (förfrågans och alla butiken sålt till senaste året). */
    tillatna?: ReadonlySet<string>;
    /** Marknaderna förfrågan byggdes på — avgör om ALL-raden gäller. Standard: `tillatna`. */
    aktiva?: ReadonlySet<string>;
    antal?: readonly number[];
  },
): { rader: OffertRadAttSkriva[]; problem: OffertProblem[]; ddp: string[] } {
  const begarda = (o.antal?.length ? o.antal : OFFERT_ANTAL).filter((q) => q >= 2);
  const perId = new Map(katalog.map((v) => [numeriskId(v.variantGid), v]));
  const rader: OffertRadAttSkriva[] = [];
  const problem: OffertProblem[] = [];
  const ddp = new Set<string>();
  const skrivnaPerVariant = new Map<string, OffertRadAttSkriva[]>();
  const okanda = new Set<string>();

  const namn = (v: { productTitle: string; variantTitle: string }) =>
    v.variantTitle && v.variantTitle !== "Default Title" ? `${v.productTitle} · ${v.variantTitle}` : v.productTitle;
  const etikett = (id: string) => {
    const v = perId.get(id);
    return v ? namn(v) : `ID ${id}`;
  };

  /* Valutan går inte att avgöra: inget skrivs, bara skälet. */
  if (svar.valutakonflikt) {
    problem.push({ kod: "valutakonflikt", ...svar.valutakonflikt });
    return { rader, problem, ddp: [] };
  }

  for (const r of svar.rader) {
    const v = perId.get(r.id);
    if (!v) {
      if (!okanda.has(r.id)) problem.push({ kod: "okantId", id: r.id });
      okanda.add(r.id);
      continue;
    }
    const label = namn(v);
    /* "ALL" är standardkostnaden, och gäller bara en butik utan marknader
       (eller med bara hemmamarknaden — butiken som fick sin första order
       efter förfrågan). Har butiken fler marknader ska varje land ha sin
       rad: "ALL: 45" hade annars skrivit hemmapriset som USA:s kostnad. */
    const bas = o.aktiva ?? o.tillatna;
    const allaOk = !bas || bas.size === 0 || (bas.size === 1 && bas.has(o.hemma));
    if (r.market ? o.tillatna && !o.tillatna.has(r.market) : !allaOk) {
      problem.push({ kod: "okantLand", label, market: r.market || ALLA_LANDER });
      continue;
    }
    if (r.ejLeverans) {
      problem.push({ kod: "ejLeverans", label, market: r.market });
      continue;
    }
    /* Valutan gissas aldrig. Utan valuta vid priset, på raden eller på
       markörraden skrivs raden inte — 45 kan vara dollar eller yuan. */
    if (!r.valuta) {
      problem.push({ kod: "ingenValuta", label, market: r.market });
      continue;
    }
    /* 0 är inget inköpspris från en leverantör — det är ett tomt fält. */
    const ett = r.priser[1];
    if (!(ett != null && ett > 0)) {
      problem.push({ kod: "saknarEtt", label, market: r.market });
      continue;
    }
    /* Flerpacken: totalen måste stiga för varje antal, och med mer än en
       småsumma. "1 pc = 30 | 2 pcs = 30" eller "2 pcs = 31" är nästan alltid
       ett styckpris i fel fält — hellre inget steg än ett som gör varje
       flerpacksorder för billig. */
    const tiers: { units: number; total: number }[] = [];
    let forra = ett;
    for (const antal of Object.keys(r.priser).map(Number).filter((q) => q >= 2).sort((a, b) => a - b)) {
      const total = r.priser[antal];
      if (!(total > forra + 0.15 * ett)) {
        problem.push({ kod: "stegBilligare", label, market: r.market, antal });
        continue;
      }
      tiers.push({ units: antal, total });
      forra = total;
    }
    /* Ett land utan godkända flerpack skulle ärva STANDARDENS steg (Sveriges
       tvåpack på en amerikansk styckkostnad). Stegen skrivs då som antal ×
       styckpriset — det är vad utan steg betyder — och det sägs (i stället
       för "delvis", som hade sagt att inget räknas). */
    const linjar = Boolean(r.market) && !tiers.length && begarda.length > 0;
    if (r.tomma.length && !linjar) problem.push({ kod: "delvis", label, market: r.market, antal: r.tomma });
    if (linjar) {
      for (const q of begarda) tiers.push({ units: q, total: Math.round(q * ett * 100) / 100 });
      problem.push({ kod: "linjart", label, market: r.market, antal: begarda });
    }
    if (r.ddp) ddp.add(r.market || ALLA_LANDER);
    const rad: OffertRadAttSkriva = {
      variant_gid: v.variantGid,
      product: v.productTitle,
      variant: v.variantTitle,
      market: r.market,
      unit_cost: ett,
      currency: r.valuta,
      tiers,
      source_label: `${label}${r.market ? ` · ${r.market}` : ""}`,
    };
    rader.push(rad);
    const lista = skrivnaPerVariant.get(v.variantGid) ?? [];
    lista.push(rad);
    skrivnaPerVariant.set(v.variantGid, lista);
  }

  /* Standardkostnaden: saknas den (eller är en okvitterad nolla) sätts den
     till hemmamarknadens pris. Finns inget hemmapris sägs det rakt ut. */
  for (const [gid, lista] of skrivnaPerVariant) {
    const v = katalog.find((k) => k.variantGid === gid)!;
    const harStandard = v.unitCost != null && (v.unitCost > 0 || o.fria.has(gid));
    if (harStandard || lista.some((r) => r.market === "")) continue;
    const hem = o.hemma ? lista.find((r) => r.market === o.hemma) : undefined;
    if (!hem) {
      problem.push({ kod: "ingenStandard", label: namn(v) });
      continue;
    }
    rader.push({ ...hem, market: "", source_label: `${namn(v)} · standard` });
  }

  for (const f of svar.olasbara) problem.push({ kod: "olasbar", label: etikett(f.id), market: f.market, orsak: f.orsak, rad: f.rad });
  for (const d of svar.dubbletter) problem.push({ kod: "dubblett", label: etikett(d.id), market: d.market });
  for (const rad of svar.utanId) problem.push({ kod: "utanId", rad });
  for (const rad of svar.olastaRader) problem.push({ kod: "olastRad", rad });
  for (const f of svar.ofyllda) {
    if (perId.get(f.id)) problem.push({ kod: "ofylld", label: etikett(f.id), market: f.market });
  }
  for (const b of svar.obesvarade ?? []) problem.push({ kod: "obesvarad", label: etikett(b.id), rad: b.rad });
  for (const rad of svar.ddpFritext ?? []) problem.push({ kod: "ddpFritext", rad });
  return { rader, problem, ddp: [...ddp].sort() };
}
