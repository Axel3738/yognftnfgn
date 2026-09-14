# Batch-log — Taköverdraget för Husvagn

## Batch #1 — 2026-09-14 (`/forsta-batch`, på Axels begäran)

**Trigger:** Axel skapade sex nya `BÄVER …`-hubbar i Notion 2026-09-14 och bad
om creative strategy för fyra av produkterna i samma vända. Taköverdraget hade
launchats 2026-09-09 och aldrig fått en riktig brief-runda — alla 16 annonser i
kontot kommer från launchbatchen.

**Underlag:** livstidsdata ur Meta 2026-09-14 — 15 906 kr spend, 78 köp,
ROAS 5,65, intäkt 89 863 kr. AOV 1 152 kr → **break-even-CPA 707 kr**
(break-even-ROAS 1,63 ur kampanjnamnet). Rangordning på vinstbidrag enligt
`docs/os/ANALYSMETOD.md`, grind 300 kr / 3 köp. Kampanjen ligger på
budgettaket 4 000 kr/dag och är kontots starkaste produkt.

Fullständig tabell och alla verifierade produktsidesfakta står i `dna.md`.
Kort: `GT_2_H1` (present-vinkeln, video) är bäst med 10 357 kr vinstbidrag,
`CS_2_1` (statisk, pris) är effektivast per krona med CPA 89 kr, och
`SP_2_H1` (video) är det renaste formatfyndet i hela kontot — exakt samma copy
som `SP_2_1` (statisk) men CPA 550 kr mot 185 kr.

**Briefer i denna batch — 18 st (7 video, 11 statiska):**

| Annons | Format | Hypotes | Källa |
|---|---|---|---|
| Takoverdrag_PD_4_H1 | Video | Taket är ytan ägaren aldrig inspekterar. Öppna med den blinda fläcken, inte med produkten | Sidans egen rad om taket |
| Takoverdrag_CO_1_H1 | Video | Konkurrenten är helöverdraget, inte att göra ingenting. "Bara taket" vinner på att en person klarar det | Sidans jämförelse |
| Takoverdrag_GT_4_H1 | Video | Vinnarens mekanism med EN isolerad ändring: produkten syns i användning före sekund 4 | GT_2_H1, kampanjens vinnare |
| Takoverdrag_RI_1_H1 | Video | Kostnaden av att inte agera: tätmassan mjuknar, fukten tar sig in, då krävs reparation | Sidans egen formulering |
| Takoverdrag_UG_1_H1 | Video | "Hanteras av en person" blir bevis om det filmas i realtid av en ensam ägare | Luckan: ingen talande person i kontot |
| Takoverdrag_SP_4_H1 | Video | SP-copyn kräver läsning, inte tittande. Demo bär videon, aggregatet bara i endcard | SP_2_H1 mot SP_2_1 |
| Takoverdrag_GT_5_H1 | Video | Vinnaren klippt till 12–15 s i stället för 20–25, allt annat lika | GT_2_H1 |
| Takoverdrag_CS_4_1 | Statisk | Kampanjens effektivaste annons utan den påhittade lagerbristen — håller prisankaret utan brådska? | CS_2_1 |
| Takoverdrag_SP_5_1 | Statisk | Obelagt kundcitat byts mot sidans eget aggregat + verifierad funktionsrad | SP_2_1 |
| Takoverdrag_PD_5_1 | Statisk | Ren funktionsdemo som statisk — bär demoinnehållet i det format som annars vinner? | Formatfyndet |
| Takoverdrag_CO_2_1 | Statisk | Samma konflikt som CO_1_H1 som statisk — direkt formatjämförelse | CO_1_H1 |
| Takoverdrag_LI_1_1 | Statisk | Listicle på enbart verifierade sidfakta, inga adjektiv | Produktsidan |
| Takoverdrag_GT_6_1 | Statisk | Present-vinkeln flyttad till det format som annars vinner | GT_2_H1 + formatfyndet |
| Takoverdrag_TR_1_1 | Statisk | Aggregerad proof ärligt formulerad: 5,0 av 5 på 10 recensioner | Produktsidans aggregat |
| Takoverdrag_CS_6_1 | Statisk | Offer-grafik som leder med fri frakt i stället för rabatten | Produktsidan |
| Takoverdrag_BOF_1_1 | Statisk | BOF: den som redan sett produkten behöver siffran, inte historien | — |
| Takoverdrag_BOF_2_1 | Statisk | BOF: riskavlastning i en bild — fri frakt, öppet köp, Klarna | Produktsidan |
| Takoverdrag_BOF_3_1 | Statisk | BOF-invändning: "räcker det inte med en presenning?" 210D-väv mot presenning som spricker i frost | Produktsidan |

**Levererat:** samtliga 18 som items i **`BÄVER Taköverdraget för Husvagn`**
(data source `collection://5f2270ab-908c-82ef-b029-0767819050db`), Status
`Draft`, Typ `Video`/`Image - Pending Approval`, hela briefen i sidan.
Verifierat med SQL mot collectionen: 7 video + 11 bild = 18. Sidan
`Takoverdrag_PD_4_H1` öppnad och genomläst — shot list med alla sex tidsrader
och tre-frågorstabellen låg som riktiga Notion-tabeller.

**Modellpolicy:** följd. En sonnet-subagent per brief skrev all svensk copy och
körde tre-frågorstestet rad för rad; huvudsessionen gjorde analysen,
hypoteserna och briefstrukturen.

⚠️ **Shopify MCP var nere** (token utgången) under körningen. Pris, jämförpris
och recensionsaggregat lästes i stället ur produktens publika storefront-JSON
och sidans egen JSON-LD. Ingenting togs på gissning — se `dna.md`.

**Nästa lediga AD-ID:** CS 7, GT 7, PD 6, SP 6, CO 3, LI 2, RI 2, TR 2, UG 2,
BOF 4.
