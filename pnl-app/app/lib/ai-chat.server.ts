/**
 * Chattbubblan: en hjälpassistent inne i appen som svarar på enkla frågor —
 * "hur importerar jag COGS för 20 produkter?", "hur gick förra veckan?",
 * "sätt kostnaden på Motorhöljet till 89 kr".
 *
 * Tre saker den får veta: (1) hur appen fungerar (HJALP nedan — skriven av
 * oss, inte gissad), (2) butikens egna tal de senaste 30 dagarna och listan
 * på produkter (byggKontext), (3) samtalet hittills. Den hittar aldrig på
 * tal: står det inte i kontexten säger den att det inte går att se här.
 *
 * Ändringar görs ALDRIG direkt av modellen. Vill handlaren ändra en kostnad
 * returnerar modellen ett förslag (`actions`) som visas som en knapp — det är
 * klicket som skriver, via samma importCostCsv som filimporten.
 *
 * Kräver ANTHROPIC_API_KEY. Modellen är den snabbare/billigare eftersom
 * chatten är många små anrop, till skillnad från bild-läsningen.
 */

import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import type { Lang } from "./texts";

export const aiChattEnabled = Boolean(process.env.ANTHROPIC_API_KEY?.trim());

const MODELL = "claude-sonnet-5";

/* Hur appen fungerar — det modellen får svara ur. Uppdatera när UI:t ändras. */
const HJALP = `
APPEN (StonePNL) visar täckningsbidrag och nettovinst per produkt: försäljning − inköpskostnad (COGS) − annonskostnad − fasta kostnader − betalavgift − tull per order.

SIDOR (menyn till vänster):
- Vinst/Profit: panelen. Överst nettovinst för perioden, ring mot vinstmålet (klicka ringen för att sätta mål), svit av plusdagar, bästa dag. Under: KPI:er, staplar per dag, tabell per produkt. Period väljs uppe till höger.
- Kostnader/Costs: inköpspriser (COGS) per variant. Kostnaden skrivs till Shopifys eget fält "Kostnad per artikel" — den ägs av butiken, inte av appen.
- Fasta kostnader/Fixed costs: månadskostnader (Shopify-plan, appar, AI-verktyg, personal …) med förslagslista. Fördelas per dag.
- Butiker/Stores: flera butiker i en gemensam summa.
- Kundvärde (LTV): återköpsgrad, kundvärde per kohort 30/60/90/180 dagar, max-CPA. Kräver Pro-planen och ordrar med kund-ID.
- Inställningar/Settings: valuta, språk, betalavgift %, tull per order, Meta-koppling (Logga in med Facebook eller klistra in token), annonskonto, plan.

SÅ FYLLER MAN I COGS (Kostnader-sidan), snabbast först:
1. Snabbfältet "Skriv in dina kostnader här": ett fält per produkt, skriv kostnaden (vara + frakt, utan tull), Enter sparar direkt. "Sätt per variant" fäller ut ett fält per variant.
2. "Låt AI läsa av din gamla app": ta en skärmbild av kostnadstabellen i Juicy (eller annan app/kalkyl), släpp den i kortet, klicka "Läs av och skriv till Shopify". AI:n matchar produkterna; rader som inte matchar listas. Flerpack följer med. Det finns en exempelvideo i kortet.
3. "Släpp en offert från leverantören": släpp foto/skärmbild av leverantörens offert, klicka "Läs av offerten", välj produkt per rad, klicka "Lägg in". Utländsk valuta räknas om med dagens ECB-kurs.
4. Många produkter (20+): klicka "Importera från fil (avancerat)" → "Ladda ner mall". Mallen är en CSV med alla produkter och varianter: produkttitel;varianttitel;kostnad;pris. Fyll i kostnadskolumnen i Excel/Google Sheets — eller skicka mallen plus din egen prislista till ChatGPT/Claude och be den fylla i kolumnen "kostnad" — släpp sedan filen tillbaka i kortet och klicka "Skriv till Shopify". Tom varianttitel = alla varianter.
5. Tills kostnaderna finns: "Låt appen uppskatta" — välj 25/35/50 % av priset. Markeras "uppskattad" överallt.

FLERPACK / BUNDLES (kostnad per antal): Shopify har bara ETT styckpris. Appen har egna steg: totalkostnad för 2, 3, … st i samma orderrad. Sätts på produktsidan (klicka produktnamnet i tabellen på Kostnader → kortet "Kostnad per antal (flerpack)"), eller i CSV-importen som "88.34|134.22|180.19" (1|2|3 st), eller via AI-läsningen om tabellen visar packpriser. Panelen räknar orderrader med 2+ st mot stegen; exakt steg vinner, annars närmaste lägre steg + resten till marginalpriset. Snabbfältet ändrar bara styckpriset och rör inte stegen.

HISTORIK: ändrar man kostnaden på produktsidan med ett "från och med"-datum räknas äldre perioder på den gamla kostnaden. Snabbfältet och AI-läsningen skriver utan datum (gäller framåt och för perioder som hämtas om).

ANNONSKOSTNAD: Inställningar → "Logga in med Facebook" → välj annonskonto. Utan koppling är annonskostnaden 0 och panelen är gulmarkerad "Annonskostnad saknas".

JUICY → STONEPNL: Har Juicy skrivit kostnaderna i Shopifys fält finns de redan här utan klick (kortet "Kommer du från Juicy?" visar täckningen). Annars: skärmbild av Juicys kostnadstabell → AI-kortet.

PLANER: basic (5 USD/mån, 14 dagars prov) och Pro (14,99 USD/mån) som lägger till Kundvärde (LTV). Byts via Inställningar → "Ändra plan" (Shopifys sida). Uppsägning: avinstallera appen i Shopify, då slutar debiteringen.

INTEGRITET: kund-ID lagras bara som hash; inga namn, mejl eller adresser. Avinstallation raderar butikens data.
`.trim();

export interface ChattKontext {
  currency: string;
  fonster: string;
  nettoforsaljning: number;
  ordrar: number;
  cogs: number | null;
  annonskostnad: number | null;
  fastaPerManad: number;
  fastaRader: string[];
  varianterMedKostnad: number;
  varianterTotalt: number;
  uppskattningPct: number | null;
  flerpackSteg: number;
  plan: string;
  produkter: { productTitle: string; variantTitle: string; price: number; unitCost: number | null }[];
}

const Action = z.object({
  type: z.enum(["set_cost", "none"]).describe("set_cost = föreslå att skriva en kostnad; none = inget"),
  product: z.string().describe("Exakt produkttitel ur listan"),
  variant: z.string().describe("Exakt varianttitel ur listan, eller tom sträng för alla varianter"),
  cost: z.number().describe("Kostnad för 1 st i butikens valuta"),
  tiers: z.array(z.number()).describe("Totalkostnad för 2, 3, … st om handlaren angav packpriser, annars tom lista"),
  label: z.string().describe("Knapptext på handlarens språk, t.ex. 'Sätt 89 kr på Motorhöljet'"),
});
const ChattSvar = z.object({
  answer: z.string().describe("Svaret till handlaren, kort, på handlarens språk. Radbrytningar tillåtna, ingen markdown."),
  actions: z.array(Action).describe("Föreslagna ändringar som handlaren kan bekräfta med ett klick. Tom lista om inget ska ändras."),
});
export type ChattSvarT = z.infer<typeof ChattSvar>;
export type ChattAction = z.infer<typeof Action>;

export interface ChattMeddelande {
  role: "user" | "assistant";
  content: string;
}

export async function svaraChatt(input: {
  historik: ChattMeddelande[];
  kontext: ChattKontext;
  lang: Lang;
}): Promise<ChattSvarT> {
  const client = new Anthropic();
  const k = input.kontext;
  const nf = (n: number | null) => (n == null ? "saknas" : `${Math.round(n).toLocaleString("sv-SE")} ${k.currency}`);
  const katalog = k.produkter
    .slice(0, 400)
    .map((p) => `${p.productTitle} | ${p.variantTitle === "Default Title" ? "" : p.variantTitle} | pris ${p.price} | kostnad ${p.unitCost ?? "saknas"}`)
    .join("\n");

  const system =
    `Du är hjälpen inne i Shopify-appen StonePNL. Svara ${input.lang === "sv" ? "på svenska" : "in English"}, kort och konkret: ` +
    "max fem meningar om inte handlaren ber om steg — då numrerade steg, en rad per klick, med knapparnas exakta namn. " +
    "Hitta aldrig på tal eller funktioner: står det inte i hjälptexten eller butiksdatan, säg att det inte går att se här och peka på var i appen det finns. " +
    "Du ändrar aldrig något själv. Ber handlaren om en kostnadsändring: bekräfta i answer vad du föreslår och lägg ett set_cost-förslag i actions med EXAKT produkt- och varianttitel ur listan. " +
    "Är produkten tvetydig: fråga i stället för att gissa (actions tom). Ingen markdown, inga rubriker.\n\n" +
    `HJÄLPTEXT:\n${HJALP}\n\n` +
    `BUTIKENS DATA (${k.fonster}):\n` +
    `Nettoförsäljning ${nf(k.nettoforsaljning)} · Ordrar ${k.ordrar} · COGS ${nf(k.cogs)} · Annonskostnad ${nf(k.annonskostnad)} · ` +
    `Fasta kostnader ${nf(k.fastaPerManad)}/månad (${k.fastaRader.length ? k.fastaRader.join(", ") : "inga inlagda"}) · ` +
    `Varianter med kostnad ${k.varianterMedKostnad} av ${k.varianterTotalt} · ` +
    `Uppskattning ${k.uppskattningPct ? `${k.uppskattningPct} % av priset` : "av"} · Flerpacksteg ${k.flerpackSteg} · Plan ${k.plan}\n\n` +
    `PRODUKTER (produkttitel | varianttitel | pris | kostnad):\n${katalog}`;

  const res = await client.messages.parse({
    model: MODELL,
    max_tokens: 1500,
    system,
    messages: input.historik.slice(-20).map((m) => ({ role: m.role, content: m.content })),
    output_config: { format: zodOutputFormat(ChattSvar) },
  });
  if (!res.parsed_output) throw new Error("Kunde inte tolka svaret från modellen.");
  return {
    answer: res.parsed_output.answer,
    actions: res.parsed_output.actions.filter((a) => a.type === "set_cost" && a.product && Number.isFinite(a.cost) && a.cost >= 0),
  };
}

/** Ett set_cost-förslag → en CSV-rad i importformatet (samma väg som filen). */
export function actionTillCsv(a: ChattAction): string {
  const kostnad = [a.cost, ...a.tiers.filter((n) => Number.isFinite(n) && n > 0)].map((n) => n.toFixed(2)).join("|");
  return `${a.product.replace(/;/g, ",")};${a.variant.replace(/;/g, ",")};${kostnad}`;
}
