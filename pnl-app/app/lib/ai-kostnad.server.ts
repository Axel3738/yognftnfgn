/**
 * "Låt AI läsa av Juicy": en skärmbild (eller inklistrad text) av en
 * kostnadstabell → rader vi kan importera. Modellen får butikens EXAKTA
 * produkt- och varianttitlar och ska bara mappa mot dem — hittar den ingen
 * match lämnar den produkten utanför i stället för att gissa.
 *
 * Resultatet går genom samma `importCostCsv` som fil-importen: samma
 * matchning, flerpack, historik och "hoppades över"-lista. AI:n ersätter
 * bara steget "skriv om Juicys tabell till vårt format".
 *
 * Kräver ANTHROPIC_API_KEY i miljön. Saknas den finns kortet inte i UI:t.
 */

import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";

export const aiKostnadEnabled = Boolean(process.env.ANTHROPIC_API_KEY?.trim());

const Rad = z.object({
  product: z.string().describe("Exakt produkttitel ur butikens lista"),
  variant: z.string().describe("Exakt varianttitel ur butikens lista, eller tom sträng för alla varianter"),
  cost: z.number().describe("Kostnad för 1 st i butikens valuta (vara + frakt, utan tull)"),
  tiers: z.array(z.number()).describe("Totalkostnad för 2, 3, … st i samma orderrad om tabellen visar det, annars tom lista"),
  source_label: z.string().describe("Hur raden hette i källan (för granskning)"),
});
const Svar = z.object({
  rows: z.array(Rad),
  unmatched: z.array(z.string()).describe("Rader i källan som inte gick att mappa mot någon produkt i butiken"),
  currency_seen: z.string().describe("Valutan som syns i källan, eller tom sträng"),
  notes: z.string().describe("Kort anmärkning om osäkerheter, max två meningar"),
});
export type AiKostnadSvar = z.infer<typeof Svar>;

export interface Bild {
  mediaType: "image/png" | "image/jpeg" | "image/webp" | "image/gif";
  base64: string;
}

export async function lasKostnaderMedAi(input: {
  bilder: Bild[];
  text: string;
  produkter: { productTitle: string; variantTitle: string; price: number }[];
  currency: string;
}): Promise<AiKostnadSvar> {
  const client = new Anthropic();
  const katalog = input.produkter
    .map((p) => `${p.productTitle} | ${p.variantTitle === "Default Title" ? "" : p.variantTitle} | ${p.price}`)
    .join("\n");

  const content: Anthropic.ContentBlockParam[] = [
    ...input.bilder.map((b): Anthropic.ImageBlockParam => ({
      type: "image",
      source: { type: "base64", media_type: b.mediaType, data: b.base64 },
    })),
    {
      type: "text",
      text:
        `Butikens produkter (produkttitel | varianttitel | pris i ${input.currency}), en per rad:\n${katalog}\n\n` +
        (input.text.trim() ? `Inklistrad text från källan:\n${input.text.trim()}\n\n` : "") +
        "Läs av kostnadstabellen i bilden/texten (den kommer från en annan vinstapp, t.ex. Juicy). " +
        "Mappa varje rad till EXAKT en produkt- och varianttitel ur listan ovan — stavningen måste vara identisk med listan. " +
        "Gäller kostnaden alla varianter i produkten: lämna variant tom. " +
        "Kostnaden är för 1 styck; visar tabellen totalkostnad för 2, 3 … st (flerpack) lägg dem i tiers i ordning. " +
        "Är källans valuta en annan än butikens: räkna INTE om, rapportera den i currency_seen och skriv om det i notes. " +
        "Kan en rad inte mappas säkert: lägg den i unmatched i stället för att gissa.",
    },
  ];

  const res = await client.messages.parse({
    model: "claude-opus-5",
    max_tokens: 16000,
    system:
      "Du extraherar inköpskostnader ur skärmbilder och text för en Shopify-vinstapp. Du hittar aldrig på tal: " +
      "ett belopp som inte står i källan skrivs inte. Svara bara med det begärda formatet.",
    messages: [{ role: "user", content }],
    output_config: { format: zodOutputFormat(Svar) },
  });

  if (!res.parsed_output) {
    throw new Error(res.stop_reason === "refusal" ? "Modellen avböjde att läsa bilden." : "Kunde inte tolka svaret från modellen.");
  }
  return res.parsed_output;
}

/* ------------------------------------------------------------------------ */
/* Leverantörsoffert                                                         */
/* ------------------------------------------------------------------------ */

/**
 * En offert från leverantören ser inte ut som butiken: "Item 3 – car engine
 * cover 200D, 20 pcs, 8.40 USD". Därför skriver vi INTE direkt till Shopify.
 * AI:n plockar ut raderna (namn, styckpris, ev. flerpack, valuta) och får
 * föreslå en produkt ur butiken när det är uppenbart — men det är handlaren
 * som väljer produkt i UI:t och trycker "Lägg in". Priset räknas om till
 * butikens valuta med dagskursen i actionen (fx.server.ts), aldrig här.
 */
const OffertRad = z.object({
  label: z.string().describe("Radens namn i offerten, som det står"),
  unit_cost: z.number().describe("Pris för 1 st i offertens valuta (vara, plus frakt om den är per styck)"),
  tiers: z
    .array(z.object({ units: z.number().describe("Antal stycken i packet"), total: z.number().describe("TOTALpriset för hela packet") }))
    .describe(
      "Ett objekt per packstorlek offerten prissätter, med antalet det gäller — t.ex. {units:2,total:15} eller {units:50,total:320}. " +
        "Antalet skrivs som det står; hoppa aldrig över det och anta aldrig 2, 3, 4 i rad. Tom lista om offerten bara har ett styckpris.",
    ),
  currency: z.string().describe("Valutakoden som SYNS i källan ($, USD, ¥, CNY, RMB, €, kr …). Tom sträng om ingen valuta syns någonstans — gissa aldrig."),
  moq: z.number().describe("Minsta beställning (MOQ) om det står, annars 0"),
  suggested_product: z.string().describe("Exakt produkttitel ur butikens lista om raden uppenbart är den produkten, annars tom sträng"),
  suggested_variant: z.string().describe("Exakt varianttitel ur listan om raden gäller en viss variant, annars tom sträng"),
});
const OffertSvar = z.object({
  items: z.array(OffertRad),
  notes: z.string().describe("Kort anmärkning om osäkerheter (t.ex. pris per kartong, frakt separat), max två meningar"),
});
export type AiOffertSvar = z.infer<typeof OffertSvar>;

export async function lasOffertMedAi(input: {
  bilder: Bild[];
  text: string;
  produkter: { productTitle: string; variantTitle: string }[];
}): Promise<AiOffertSvar> {
  const client = new Anthropic();
  const katalog = input.produkter
    .map((p) => `${p.productTitle} | ${p.variantTitle === "Default Title" ? "" : p.variantTitle}`)
    .join("\n");

  const content: Anthropic.ContentBlockParam[] = [
    ...input.bilder.map((b): Anthropic.ImageBlockParam => ({
      type: "image",
      source: { type: "base64", media_type: b.mediaType, data: b.base64 },
    })),
    {
      type: "text",
      text:
        `Butikens produkter (produkttitel | varianttitel), en per rad:\n${katalog}\n\n` +
        (input.text.trim() ? `Inklistrad text från offerten:\n${input.text.trim()}\n\n` : "") +
        "Läs av leverantörsofferten i bilden/texten. En rad per artikel som prissätts. " +
        "unit_cost är priset för 1 st i offertens valuta; står bara ett totalpris för en kvantitet, dela med antalet och skriv det i notes. " +
        "Prissätter offerten flerpack (2-pack, 10-pack, 50-pack …) som säljs som EN orderrad: lägg antalet OCH totalpriset i tiers, i stigande antal. " +
        "Exempel: står det '1 pcs 10.00, 2 pcs 15.00' är unit_cost 10 och tiers [{units:2,total:15}] — alltså 15 för två stycken, inte 20. " +
        "Är staffningen 1/50/100 blir tiers [{units:50,…},{units:100,…}]; skriv aldrig om antalen till 2 och 3. " +
        "VALUTAN: leta efter symbol, kod eller ord i hela källan (rubrik, kolumnhuvud, fotnot). Ser du ingen valuta alls: lämna currency tom. " +
        "Skriv aldrig en valuta du inte sett — handlaren får välja den själv, och en gissning här blir fel inköpspris på varje produkt. " +
        "Är frakten angiven per styck: räkna in den i unit_cost och nämn det i notes; är den en klumpsumma: räkna INTE in den, nämn den i notes. " +
        "Räkna aldrig om valutor. Föreslå produkt/variant ur listan bara när det är uppenbart — stavningen måste vara identisk med listan; annars tom sträng.",
    },
  ];

  const res = await client.messages.parse({
    model: "claude-opus-5",
    max_tokens: 16000,
    system:
      "Du extraherar priser ur leverantörsofferter för en Shopify-vinstapp. Du hittar aldrig på tal: " +
      "ett belopp som inte står i källan skrivs inte. Svara bara med det begärda formatet.",
    messages: [{ role: "user", content }],
    output_config: { format: zodOutputFormat(OffertSvar) },
  });

  if (!res.parsed_output) {
    throw new Error(res.stop_reason === "refusal" ? "Modellen avböjde att läsa bilden." : "Kunde inte tolka svaret från modellen.");
  }
  return res.parsed_output;
}

/** Rader → CSV i vårt importformat: titel;variant;kostnad[|tier2|tier3]. */
export function tillCsv(svar: AiKostnadSvar): string {
  return svar.rows
    .map((r) => {
      const kostnad = [r.cost, ...r.tiers].map((n) => n.toFixed(2)).join("|");
      return `${r.product.replace(/;/g, ",")};${r.variant.replace(/;/g, ",")};${kostnad}`;
    })
    .join("\n");
}

/* ------------------------------------------------------------------------ */
/* En ruta för allt                                                          */
/* ------------------------------------------------------------------------ */

/**
 * Axels ask 2026-09-18: *"en liten AI-chattruta. Där klistrar man in
 * screenshoten, och så kan man bara beskriva lite om vilken produkt det är
 * och för vilken marknad. Sen trycker man enter … och så lägger den bara in."*
 *
 * Modellen får allt den behöver för att förstå en tioårings mening: butikens
 * exakta titlar, de marknader butiken har, butikens valuta och den valuta
 * handlaren brukar skriva i. Den svarar med färdiga rader som actionen
 * skriver rakt in — produkt, variant, marknad, belopp, valuta, flerpack.
 * Är något oklart ställer den EN fråga i `question` i stället för att gissa.
 */
const InmatningsRad = z.object({
  product: z.string().describe("Exakt produkttitel ur butikens lista (identisk stavning)"),
  variant: z.string().describe("Exakt varianttitel ur listan, eller tom sträng = alla varianter i produkten"),
  market: z.string().describe("Landskod (SE, NO, US …) ur marknadslistan om handlaren nämner ett land/en marknad, annars tom sträng = standard för alla marknader"),
  unit_cost: z.number().describe("Kostnad för 1 st (vara + frakt, utan tull) i `currency`"),
  currency: z.string().describe("Valutakod (SEK, USD, CNY …) som syns eller sägs. Syns ingen: använd handlarens standardvaluta som angavs"),
  tiers: z
    .array(z.object({ units: z.number(), total: z.number() }))
    .describe("Flerpack: antal och TOTALpris för packet, t.ex. {units:2,total:15} = 15 för två. Tom lista om bara styckpris"),
  source_label: z.string().describe("Hur raden hette i källan, för kvittot"),
});
const InmatningsSvar = z.object({
  rows: z.array(InmatningsRad),
  unmatched: z.array(z.string()).describe("Rader i källan som inte gick att koppla till någon produkt i butiken"),
  question: z.string().describe("EN kort fråga till handlaren om något måste avgöras innan raderna kan skrivas (t.ex. vilken produkt). Tom sträng om allt är klart"),
  notes: z.string().describe("Kort anmärkning om antaganden, max två meningar. Tom sträng om inga"),
});
export type AiInmatningSvar = z.infer<typeof InmatningsSvar>;

export async function tolkaInmatningMedAi(input: {
  bilder: Bild[];
  text: string;
  produkter: { productTitle: string; variantTitle: string; price: number }[];
  marknader: { kod: string; namn: string }[];
  currency: string;
  costCurrency: string;
  lang: "en" | "sv";
}): Promise<AiInmatningSvar> {
  const client = new Anthropic();
  const katalog = input.produkter
    .map((p) => `${p.productTitle} | ${p.variantTitle === "Default Title" ? "" : p.variantTitle} | ${p.price}`)
    .join("\n");
  const marknader = input.marknader.length
    ? input.marknader.map((m) => `${m.kod} = ${m.namn}`).join(", ")
    : "(inga kända ännu — landskoder som SE, NO, US, GB, DK, DE, AU, CA, NZ är ändå giltiga om handlaren nämner ett land)";

  const content: Anthropic.ContentBlockParam[] = [
    ...input.bilder.map((b): Anthropic.ImageBlockParam => ({
      type: "image",
      source: { type: "base64", media_type: b.mediaType, data: b.base64 },
    })),
    {
      type: "text",
      text:
        `Butikens produkter (produkttitel | varianttitel | pris i ${input.currency}), en per rad:\n${katalog}\n\n` +
        `Butikens marknader (landskod = land): ${marknader}\n` +
        `Butikens valuta: ${input.currency}. Handlarens vanliga valuta för inköpspriser: ${input.costCurrency}.\n\n` +
        (input.text.trim() ? `Handlaren skrev:\n${input.text.trim()}\n\n` : "") +
        "Uppgift: översätt bilden/texten till rader som ska SKRIVAS som inköpskostnad. " +
        "Handlaren kan ha släppt en skärmbild av en kostnadstabell (t.ex. från appen Juicy), ett foto av en leverantörsoffert, " +
        "eller bara skrivit en mening som 'motorhöljet, Norge, 140 kr' eller 'alla varianter 12 usd, 2 st 20 usd'. " +
        "Regler: (1) product och variant måste vara identiska med listan; nämns ingen variant gäller alla (tom variant). " +
        "(2) market sätts BARA om handlaren nämner ett land eller en marknad (i text eller bild); annars tom sträng. " +
        "(3) currency: det som står eller sägs; står inget alls använd handlarens vanliga valuta. Räkna aldrig om. " +
        "(4) Flerpack: 'X st för Y' är tiers [{units:X,total:Y}] — totalpriset, inte styckpriset. " +
        "(5) Är produkten omöjlig att avgöra (t.ex. bara ett pris utan namn och flera produkter i butiken): skriv INGA rader, ställ en fråga i question. " +
        "Är det bara en produkt i butiken, eller en uppenbar match, skriv raden. " +
        `(6) Skriv question och notes på ${input.lang === "sv" ? "svenska" : "engelska"}, kort.`,
    },
  ];

  const res = await client.messages.parse({
    model: "claude-opus-5",
    max_tokens: 16000,
    system:
      "Du översätter en handlares skärmbilder och vardagsmeningar till inköpskostnader för en Shopify-vinstapp. " +
      "Du hittar aldrig på tal: ett belopp som inte står eller sägs skrivs inte. Du gissar aldrig produkt när det är oklart — då frågar du. " +
      "Svara bara med det begärda formatet.",
    messages: [{ role: "user", content }],
    output_config: { format: zodOutputFormat(InmatningsSvar) },
  });

  if (!res.parsed_output) {
    throw new Error(res.stop_reason === "refusal" ? "Modellen avböjde att läsa bilden." : "Kunde inte tolka svaret från modellen.");
  }
  return res.parsed_output;
}
