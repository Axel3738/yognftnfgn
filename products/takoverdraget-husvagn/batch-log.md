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

---

## Batch #2 — 2026-09-16 (`/cs`, på Axels begäran)

**Trigger:** Axel bad om nya briefer för Taköverdraget och la till ett nytt krav:
*"jag vill att du gör dom så att dom inte nämner bäverbutiken så jag kan ladda
upp dom på min andra butik också"*. Han bad sedan uttryckligen om **många**
briefer, både bild och video ("Vi behöver månngggaaaaaaaa både bilder men mycket
videos också"). Rondens `rundaAntal` för budget 8 000 kr/dag är 8 — batchen
skrevs i stället till **24** på hans begäran.

**Underlag:** livstidsdata ur Meta 2026-09-16 — 29 185 kr spend, 123 köp,
ROAS 4,87, intäkt 142 190 kr. AOV 1 156 kr → **break-even-CPA 709 kr**
(break-even-ROAS 1,63 ur kampanjnamnet). Grind 300 kr / 3 köp. Rangordning på
vinstbidrag enligt `docs/os/ANALYSMETOD.md`. Budgettaket höjt 4 000 → 8 000 kr/dag.

**Tre fynd som styr batchen (full tabell i `dna.md`):**

1. **CS-vinkeln bär i båda formaten** — CS_2_1 (statisk) CPA 161, CS_2_H1
   (video) CPA 163. CS = 48 % av vinsten på 34 % av spenden, 3,17 kr vinst per
   spendkrona mot SP:s 1,09. Därför är 5 av 24 briefer CS.
2. **Formatfyndet från 2026-09-14 är struket.** Utan `SP_2_H1` är video-CPA
   206 kr mot statiskens 195 — gapet var en enda annons, inte ett format.
   Batchen är därför jämnt delad 12 video / 12 bild i stället för viktad mot
   statiskt.
3. **CTR är frikopplat från vinst.** SP_2_1 har CTR 8,67 % och CPA 238;
   CS_2_1 har 2,48 % och CPA 161. Ingen brief i batchen är byggd för att jaga
   klick.

⚠️ **`SP_2_H1` går med förlust och står kvar ACTIVE** — CPA 814 mot break-even
709, vinstbidrag −626 kr, 16,7 % av kampanjens spend. `/cs` pausar aldrig
annonser (bara trappan i `/rond-auto` får det), så den är flaggad till Axel
i stället.

**Butiksneutralitet:** varje brief bär ett `Brand-neutral rules`-block. Inget
butiksnamn, ingen URL, ingen logga — och **ingen fri frakt, Klarna, öppet köp,
leveranstid eller returer**, eftersom det är butikspolicy och skiljer sig mellan
butikerna. Priset står som utbytbar plats. Konsekvens bakåt: batch #1:s `CS_6_1`
och `BOF_2_1` bygger på just de raderna och kan inte återanvändas i den andra
butiken.

**Recensioner:** 0 review-bilder. Omkontrollerat live 2026-09-16 — fortfarande
exakt 10 recensioner, samma som 2026-09-14, alla seedade inom 11 sekunder.
Aggregatet (5,0 av 5 på 10 recensioner) används ordagrant i `TR_2_1`.

### Briefer i denna batch — 24 st (12 video, 12 statiska varav 3 BOF)

| Annons | Format | Hypotes | Källa |
|---|---|---|---|
| Takoverdrag_CS_7_H1 | Video | Prisankaret som öppning i stället för avslut — siffran kvalificerar tittaren i sekund 0 | CS_2_1 + CS_2_H1, kampanjens två bästa |
| Takoverdrag_CS_8_H1 | Video | Priset ankrat mot reparationskostnaden i stället för mot jämförpriset, utan påhittad kronsiffra | Backlog + sidans egen rad om taket |
| Takoverdrag_CS_9_H1 | Video | Samma prisankare omräknat till kronor och yta (340 kr, 19,5 m²) — byter tidsram/ram för att göra siffran slående | Copy-reglerna + CS-vinkeln |
| Takoverdrag_GT_7_H1 | Video | Presentvinkelns mekanism med EN isolerad ändring: mottagaren syns i bild | Backlog + GT_2_H1 |
| Takoverdrag_GT_8_H1 | Video | Samma presentvinkel klippt till 12 s — isolerad längdvariabel | GT_2_H1 |
| Takoverdrag_RI_2_H1 | Video | Första frosten är en äkta deadline och gör påhittad lagerbrist onödig | Backlog + sidans 210D-rad |
| Takoverdrag_RI_3_H1 | Video | Den blinda ytan: taket är det enda ägaren aldrig ser på sin egen vagn | Sidans egen rad |
| Takoverdrag_PD_6_H1 | Video | "Hanteras av en person" bevisas genom att INTE klippa — oklippt realtidstagning | PD-vinkelns CTR-styrka + sidans rad |
| Takoverdrag_PD_7_H1 | Video | Passformen som bevis: vattnet rinner av i stället för att bli stående kring takluckorna | Sidans egen rad |
| Takoverdrag_CO_3_H1 | Video | Fienden är helöverdraget, inte att göra ingenting. CO_1_H1 fick bara 31 kr — otestad, körs om | CO_1_H1 + sidans jämförelse |
| Takoverdrag_UG_2_H1 | Video | Ägaren i jag-form, en tagning. UG_1_H1 fick bara 63 kr — otestad, körs om | UG_1_H1 |
| Takoverdrag_OB_1_H1 | Video | Invändningen "det blåser av" besvaras med rem och dragsko, visat i blåst | Sidans egen rad. Nytt koncept-ID |
| Takoverdrag_CS_10_1 | Statisk | Prisankaret i KRONOR (340 kr). A-halvan av ett rent A/B | CS_2_1 |
| Takoverdrag_CS_11_1 | Statisk | Prisankaret i PROCENT (23 %), allt annat identiskt med CS_10_1. B-halvan | CS_2_1 |
| Takoverdrag_GT_9_1 | Statisk | Presentvinkeln som bild. GT_6_1 fick bara 87 kr — obesvarad, körs om | GT_2_H1 + GT_6_1 |
| Takoverdrag_PD_8_1 | Statisk | Måtten som rubrik: 6,5 × 3 m och 210D är siffror man kan peka på | Sidans mått |
| Takoverdrag_PD_9_1 | Statisk | Problemet först, produkten sen: stående vatten kring takluckorna | Sidans egen rad |
| Takoverdrag_CO_4_1 | Statisk | Samma konflikt som CO_3_H1 som bild — direkt formatjämförelse på ett par | CO_3_H1 |
| Takoverdrag_LI_2_1 | Statisk | Listicle på enbart belagda sidfakta, noll adjektiv. LI_1_1 fick 36 kr | LI_1_1 + produktsidan |
| Takoverdrag_RI_4_1 | Statisk | Kostnaden av att inte agera, i en bild | Sidans egen rad |
| Takoverdrag_TR_2_1 | Statisk | Ärlig aggregerad proof: 5,0 av 5 på 10 recensioner. Tio är ett litet tal — ärligheten är vinkeln | Produktsidans aggregat |
| Takoverdrag_BOF_4_1 | Statisk | BOF: bara siffran. 1 129 kr, 340 kr billigare, 19,5 m² | CS-vinkeln |
| Takoverdrag_BOF_5_1 | Statisk | BOF-invändning: räcker en presenning? 210D mot presenning som spricker i frost. BOF_3_1 fick 7 kr | BOF_3_1 + sidans rad |
| Takoverdrag_BOF_6_1 | Statisk | BOF-invändning: klarar jag det själv? Bara taket, inte hela vagnen | Sidans egen rad |

**Feedbackloop på batch #1:** ingen av de 18 annonserna är bedömbar ännu.
Högsta spend `PD_4_H1` 490 kr / 1 köp — över spendgrinden, under köpgrinden.
Alla hypoteser från batch #1 står kvar obesvarade och läses av i nästa `/cs`.

**Backlog-items använda i denna batch:** alla tre.
Presentvinkeln med mottagaren i bild → `GT_7_H1`.
Prisankaret mot reparationskostnaden → `CS_8_H1` (utan kronsiffra, som backloggen
kräver).
Säsongsväxlingen som deadline → `RI_2_H1`.

**Modellpolicy:** följd. Fyra sonnet-subagenter skrev all svensk copy och körde
tre-frågorstestet rad för rad; huvudsessionen gjorde analysen, hypoteserna,
namngivningen och briefstrukturen.

**Nästa lediga AD-ID:** CS 12, GT 10, PD 10, SP 6, CO 5, LI 3, RI 5, TR 3,
UG 3, OB 2, BOF 7.
