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

/** Rader → CSV i vårt importformat: titel;variant;kostnad[|tier2|tier3]. */
export function tillCsv(svar: AiKostnadSvar): string {
  return svar.rows
    .map((r) => {
      const kostnad = [r.cost, ...r.tiers].map((n) => n.toFixed(2)).join("|");
      return `${r.product.replace(/;/g, ",")};${r.variant.replace(/;/g, ",")};${kostnad}`;
    })
    .join("\n");
}
