# Batch-log — Termoskyddet för Husbil

## Batch #1 — 2026-09-14 (`/forsta-batch`, på Axels begäran)

**Trigger:** Axel skapade sex nya `BÄVER …`-hubbar i Notion 2026-09-14 och bad
om creative strategy för fyra av produkterna i samma vända. Termoskyddet hade
launchats 2026-09-11 och aldrig fått en riktig brief-runda.

**Underlag:** livstidsdata ur Meta 2026-09-14 — 3 682 kr spend, 23 köp,
ROAS 3,60, intäkt 13 248 kr. AOV 576 kr → **break-even-CPA 358 kr**
(break-even-ROAS 1,61 ur kampanjnamnet). Grind 300 kr / 3 köp. Budgeten höjdes
1 400 → 1 650 kr/dag samma dag.

Bara **två** annonser är bedömbara: `CS_3` (statisk, rabatt) med CPA 184 kr och
81 % av all vinst, och `SP_2` (statisk) med CPA 187 kr. Ingen video har ett enda
köp — men ingen video har heller nått 80 kr spend, så det är svält, inte en dom.
Fullständig tabell och alla verifierade produktsidesfakta står i `dna.md`.

**Tre saker som styrde hela batchen** (alla tre bryts av live-annonserna i dag):

1. Produkten har **noll recensioner** — inga stjärnor, inga citat, ingen
   volymproof i någon brief.
2. **Säsongen är fel** i vinnaren `CS_3`, som säger "inför sommaren". Det är
   september på väg in i vintern: kondens, imma, mörker och kyla är vinkeln nu.
3. **Ingen påhittad brådska.** `CS_3`:s "IDAG ENDAST" är borta i alla varianter.

**Briefer i denna batch — 17 st (6 video, 11 statiska):**

| Annons | Format | Hypotes | Källa |
|---|---|---|---|
| Termoskydd_PD_4_H1 | Video | Kondens är produktens skarpaste och mest säsongsriktiga problem. Skyddet sitter utanpå glaset — mekanismen går att visa | Sidans egen mekanikrad |
| Termoskydd_CO_1_H1 | Video | Konkurrenten är innanförgardinen, inte ingenting. Utvändigt vinner på en mekanism man kan peka på | Sidans jämförelse |
| Termoskydd_RI_1_H1 | Video | Den återkommande kostnaden: torka imma varje morgon mot två minuter en gång | Sidans egen formulering |
| Termoskydd_PR_1_H1 | Video | Integritet på rastplatsen — outnyttjad vinkel som står ordagrant på sidan | Produktsidan |
| Termoskydd_UG_1_H1 | Video | "Spänns fast utan att öppna dörrarna" blir bevis om det filmas i realtid | Luckan: ingen talande person |
| Termoskydd_SP_4_H1 | Video | Utan recensioner måste proof byggas på mätbara egenskaper — kan spec-proof ersätta social proof? | Noll-recensionsläget |
| Termoskydd_CS_4_1 | Statisk | Vinnaren utan påhittad brådska och med säsongen rättad från sommar till höst/vinter | CS_3, 81 % av vinsten |
| Termoskydd_SP_5_1 | Statisk | Obelagt citat byts mot verifierad funktionsrad | SP_2_1 (CPA 51 kr, ännu ej bedömbar) |
| Termoskydd_PD_5_1 | Statisk | Måtten är den vanligaste invändningen — visa dem mot en riktig husbil | Produktsidans mått |
| Termoskydd_LI_1_1 | Statisk | Faktatät listicle utan adjektiv, fem verifierade rader | Produktsidan |
| Termoskydd_CO_2_1 | Statisk | Utvändigt mot innanför som statisk — formatjämförelse mot CO_1_H1 | CO_1_H1 |
| Termoskydd_PR_2_1 | Statisk | Mörkläggningen som egen annons — ingen konkurrent kan signera den | Produktsidan |
| Termoskydd_CS_5_1 | Statisk | Prisankaret som ren offer-grafik — hur långt bär siffran ensam? | CS_3 |
| Termoskydd_MT_1_1 | Statisk | Mängdrabatten (2 st −15 %, förvald) förklarar varför AOV ligger över styckpriset och har aldrig testats i en annons | Produktsidans erbjudande |
| Termoskydd_BOF_1_1 | Statisk | BOF: siffran ensam till den som redan sett produkten | — |
| Termoskydd_BOF_2_1 | Statisk | BOF: riskavlastning — fri frakt, 30 dagars öppet köp, Klarna | Produktsidan |
| Termoskydd_BOF_3_1 | Statisk | BOF-invändning: "passar den min husbil?" Måtten är svaret | Produktsidan |

**Levererat:** samtliga 17 som items i **`BÄVER Termoskyddet för Husbil`**
(data source `collection://7d0270ab-908c-831e-8021-8758336851c8`), Status
`Draft`, Typ `Video`/`Image - Pending Approval`, hela briefen i sidan.
Verifierat med SQL mot collectionen: 6 video + 11 bild = 17. Sidan
`Termoskydd_PD_4_H1` öppnad och genomläst — tre-frågorstabellen (19 rader) och
shot list (8 rader) låg som riktiga Notion-tabeller.

⚠️ **Hubbens moderdatabas heter fortfarande `Hiking Gaiters creative hub`** —
Axel har återanvänt en befintlig databas. Data sourcen heter rätt
(`BÄVER Termoskyddet för Husbil`) och är den Axel pekade ut. Sök på data
source-id, inte på databasens titel, nästa gång.

**Modellpolicy:** följd. En sonnet-subagent per brief skrev all svensk copy och
körde tre-frågorstestet rad för rad.

⚠️ **Shopify MCP var nere** (token utgången). Pris och jämförpris lästes ur
produktsidans egen rådata (`"price":55900`, `"compare_at_price":93200`) och
JSON-LD. Recensionsläget lästes ur Judge.me-widgetens egna attribut
(`data-number-of-reviews='0'`).

**Nästa lediga AD-ID:** CS 6, G 4, PD 6, SP 6, CO 3, LI 2, MT 2, PR 3, RI 2,
UG 2, BOF 4.
