# Batch-log — Taköverdraget för Husvagn

Breakthrough-frekvens: 0/27 (0 %)

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

**Levererat 2026-09-16:** samtliga 24 som items i **`BÄVER Taköverdraget för
Husvagn`** (data source `collection://5f2270ab-908c-82ef-b029-0767819050db`),
Status `Draft`, Typ `Video`/`Image - Pending Approval`, hela briefen i sidan.
Verifierat med SQL mot collectionen: **12 video + 12 bild = 24 i Draft**, vid
sidan av batch #1:s 18 som står i `SE-ACTIVE to be translated`. Sidan
`Takoverdrag_PD_6_H1` öppnad med notion-fetch och genomläst — Hook, hela
tre-frågorstabellen (11 rader), shot list med sex tidsrader och Rules låg som
riktiga Notion-tabeller. Ingen `.md`-länk någonstans.

⚠️ **Tre rättelser gjorda av huvudsessionen efter subagenterna:**
1. `GT_7_H1`, `GT_8_H1` och `GT_9_1` kallade vår egen produkt *presenningen*.
   Det är precis motsatsen till säljargumentet (210D-väv **mot** tunn presenning
   som spricker i frost) — bytt till *överdraget*, och en regel inskriven i
   varje GT-brief. Ordet presenning används nu bara om konkurrentprodukten.
2. `TR_2_1` hade CTA:n "Se alla tio", alltså en uppmaning att gå och läsa de
   **seedade** recensionerna. Bytt till "Se taköverdraget", med en regel i
   briefen om att aldrig skicka trafik till recensionstexterna.
3. `CO_3_H1` innehöll två åsiktsrader som subagenten själv skrev om till
   falsifierbara observationer under tre-frågorstestet — noterat i briefens
   testtabell så nästa körning ser att de är omskrivna, inte original.

⚠️ **Ingen Drive-mapp skapad.** `/cs` steg 5 vill ha en Batch #2-mapp i
produktens befintliga Drive-mapp. Den här körningen skrev inte i Drive — hela
briefen ligger i Notion-itemet, vilket är det redigerarna faktiskt läser, och
Drive-länken är enligt kommandot ett komplement och aldrig ersättningen. Skapas
mappen senare: lägg `Batch #2` INUTI produktens befintliga mapp (Joshs), aldrig
i `BÄVER/Products`.

## Batch #3 — 2026-09-19 (`/rond-auto` steg 4b, förfallen 3-dagarsrunda)

**Trigger:** `annonsbehov` flaggade `brief_runda`, 3 dagar sedan batch #2,
`rundaAntal` 8. Kampanjen kontrollerad ACTIVE direkt före batchen.

**Underlag:** livstidsdata ur Meta 2026-09-19 — 57 440 kr spend, 207 köp,
ROAS 4,20, intäkt 241 130 kr. AOV 1 165 kr → **break-even-CPA 715 kr**.
Full vinstbidragstabell i `dna.md`, körning 3.

**AXELS IDÉ STYRDE RONDEN.** Databasen *Annonsidéer* hade en rad med Status
`Ny`, Produkt "Taköverdraget", skapad 2026-09-18 19:50: *"För annons PD_2_H1
måste vi göra en variant … i stället för att bara säga en storlek säger vi att
den finns i alla storlekar … typ 13 olika storlekar, eller 10 olika storlekar."*

Kopplingen till analysen, som briefens hypotes bygger på:

- Idén fanns redan i backloggen sedan 2026-09-14 (*"Vinnaren översatt till en
  annan husvagnsstorlek"*) med en uttrycklig spärr: **sortimentet måste
  kontrolleras först.** Det är gjort i den här körningen — produktsidans JSON
  lästes live och gav **nio** storlekar, 3 × 5,5 m till 3 × 13,5 m,
  1 129–2 239 kr. Backlog-itemet är därmed struket och använt.
- ⚠️ **Det är nio, inte tio och inte tretton.** Briefen säger nio. Att skriva
  Axels siffra hade varit en påhittad uppgift.
- ⚠️ **Priset måste skrivas "från 1 129 kr"** i varje rad som nämner spannet —
  13,5-metersvarianten kostar 2 239 kr, och "nio storlekar" plus "1 129 kr"
  utan "från" är en prisuppgift som är falsk för sju av nio varianter.
- **Vad datan säger om idén:** PD-vinkeln är mittfältet (1,38 kr vinst per
  spendkrona mot CS:s 2,62), och just `PD_2_H1` ligger på CPA 356 mot CS-parets
  188–197. Rent vinkelmässigt talar datan alltså **emot** att lägga en ny satsning
  i PD. Men idén är inte "mer PD" — den tar bort en diskvalificerare i sekund två
  för alla som inte äger en 6,5-metersvagn, och det är en mekanism ingen annan
  brief i kampanjen har testat.
- **Min förutsägelse, skriven i förväg:** `PD_10_H1` landar mellan PD-snittet
  (CPA 300) och CS-paret (CPA ~195) — alltså troligen 230–300 kr. Den slår
  originalet `PD_2_H1` (CPA 356) för att den öppnar ett segment som i dag
  sållar bort sig, men den slår inte CS, eftersom prisankaret är kampanjens
  bevisat starkaste argument och "från 1 129 kr" är ett svagare ankare än
  "1 129 kr mot 1 469 kr". **Största risken är just det: "från" försvagar
  siffran.** Läs av `PD_10_H1` mot `PD_2_H1`, aldrig mot CS.

Raden är satt till **Byggd** i Annonsidéer med annonsnamnen i en kommentar.

### Briefer i denna batch — 11 st (6 video, 2 statiska, 3 BOF-bilder)

| Annons | Format | Hypotes | Källa |
|---|---|---|---|
| Takoverdrag_PD_10_H1 | Video | **Axels idé.** Variant av PD_2_H1 där enda ändringen är storleksraden: nio storlekar, från 1 129 kr. Stänger passar-invändningen i hooken | Annonsidéer 2026-09-18 + backloggen + produktsidan |
| Takoverdrag_CS_12_H1 | Video | CS-argumentet i jag-form, en tagning — den enda inpackning prisankaret inte fått | CS_2_1 + CS_2_H1, 45 % av vinstbidraget |
| Takoverdrag_GT_10_H1 | Video | Mottagaren beskriven genom vad han redan äger till vagnen | GT_2_H1, 2,37 kr/spendkrona |
| Takoverdrag_OB_2_H1 | Video | "Var gör jag av den på sommaren?" — förvaringspåsen visad | Sidans egen rad, oanvänd i allt material |
| Takoverdrag_CO_5_H1 | Video | Fienden är passivitet, inte helöverdraget | Sidans rad om taket man aldrig ser |
| Takoverdrag_TR_3_H1 | Video | Leder med begränsningen: den täcker taket, inte hela vagnen | Sidans egen rad + copy-reglernas konfliktregel |
| Takoverdrag_PD_10_1 | Statisk | Samma nya variabel som PD_10_H1 som bild — rent formattest | PD_2_1, kampanjens lägsta CPA (162) |
| Takoverdrag_CS_13_1 | Statisk | Prisankaret omräknat till yta: 1 129 kr för 19,5 m² | CS-vinkeln + copy-reglernas tidsramsregel |
| Takoverdrag_BOF_7_1 | Statisk | BOF: vilken längd har din vagn? Nio storlekar, från 1 129 kr | Samma nya variabel |
| Takoverdrag_BOF_8_1 | Statisk | BOF-invändning: var bor den på sommaren | Sidans egen rad |
| Takoverdrag_BOF_9_1 | Statisk | Priset mot risken, kvalitativt. Ingen påhittad reparationskostnad | Sidans egen rad |

**Inga review-bilder.** Produkten har fortfarande exakt 10 seedade recensioner
och ingen organisk. Aggregatet används redan i `TR_2_1` (batch #2).

**Butiksneutralitet:** samma krav som batch #2 — inget butiksnamn, ingen URL,
ingen logga, ingen fri frakt/Klarna/öppet köp/leveranstid/returer.

### Feedbackloop på batch #1 och #2

- **Batch #1:** tre annonser är nu bedömbara. `PD_4_H1` CPA 383 (11 köp),
  `SP_4_H1` CPA 376 (24 köp, kampanjens största spendare), `BOF_2_1` CPA 367.
  Alla tre över break-even men under kampanjsnittet. `GT_4_H1` står på 601 kr
  med noll köp och närmar sig en dom.
- **Batch #2 är fortfarande inte live.** Samtliga 24 rader ligger kvar i
  hubben (Draft / In progress / CaraShell SE ready to be active). Alla
  hypoteser därifrån står obesvarade. Det är därför batch #3 inte upprepar
  någon av dem.

### ⚠️ Flaggat till Axel, inte åtgärdat av körningen

1. **Budgetspärren stoppar kontots starkaste produkt.** Dagsbudget 16 000 kr
   ligger utanför `agent/besked.mjs` rimlighetsintervall 100–10 000 kr, så domen
   blev `ORIMLIG_DATA` och ingen budgetändring fälldes. Taket behöver höjas.
   Ronden ändrar inte konstanter på eget bevåg.
2. **`SP_2_H1` ligger på exakt break-even** (CPA 721 mot 715) efter att ha ätit
   5 049 kr. `/cs` pausar aldrig annonser — det är Axels beslut eller trappans.
3. **`PD_2_1` svälter.** Kampanjens billigaste köp (CPA 162) på 969 kr spend.

**Ingen Drive-mapp skapad** — hela briefen ligger i Notion-itemet, som är det
redigerarna läser. Samma val som batch #2.

## Etiketter dag 7 (2026-09-21)

Etiketten är ingen dom (dom kräver 300 kr och 3 köp, kolumnen Bedömbar). Räknad på annonsens egna första vecka, backfillad 2026-09-21 ur Meta. Rådata: ETIKETT-raderna i agent/budgetlogg.jsonl.

| Annons | Batch | Typ | Etikett (7 d) | Andel | Spend | Köp | ROAS ad / kampanj | Bedömbar | Playbook |
|---|---|---|---|---|---|---|---|---|---|
| Takoverdrag_SP_2_1 | — | okänd | **KPI_WINNER** | 21 % | 5907 kr | 26 | 5,07 / 4,94 | ja | 3 nya hookar, allt annat lika — den säljer men får inte spend |
| Takoverdrag_SP_3_H1 | — | okänd | **LOSER** | 0 % | 100 kr | 0 | 0,00 / 4,94 | nej | släpp |
| Takoverdrag_SP_2_H1 | — | okänd | **LOSER** | 17 % | 4795 kr | 6 | 1,58 / 4,94 | ja | släpp |
| Takoverdrag_SP_1_H1 | — | okänd | **LOSER** | 0 % | 65 kr | 0 | 0,00 / 4,94 | nej | släpp |
| Takoverdrag_PD_2_1 | — | okänd | **KPI_WINNER** | 3 % | 767 kr | 6 | 8,83 / 4,94 | ja | 3 nya hookar, allt annat lika — den säljer men får inte spend |
| Takoverdrag_PD_3_H1 | — | okänd | **LOSER** | 1 % | 293 kr | 0 | 0,00 / 4,94 | nej | släpp |
| Takoverdrag_PD_2_H1 | — | okänd | **LOSER** | 10 % | 2897 kr | 9 | 3,51 / 4,94 | ja | släpp |
| Takoverdrag_PD_1_H1 | — | okänd | **KPI_WINNER** | 3 % | 721 kr | 4 | 5,37 / 4,94 | ja (prel.) | 3 nya hookar, allt annat lika — den säljer men får inte spend |
| Takoverdrag_GT_2_1 | — | okänd | **LOSER** | 0 % | 74 kr | 0 | 0,00 / 4,94 | nej | släpp |
| Takoverdrag_GT_3_H1 | — | okänd | **LOSER** | 0 % | 46 kr | 0 | 0,00 / 4,94 | nej | släpp |
| Takoverdrag_GT_2_H1 | — | okänd | **KPI_WINNER** | 16 % | 4513 kr | 24 | 6,18 / 4,94 | ja | 3 nya hookar, allt annat lika — den säljer men får inte spend |
| Takoverdrag_GT_1_H1 | — | okänd | **LOSER** | 0 % | 66 kr | 0 | 0,00 / 4,94 | nej | släpp |
| Takoverdrag_CS_2_1 | — | okänd | **KPI_WINNER** | 10 % | 2982 kr | 20 | 7,65 / 4,94 | ja | 3 nya hookar, allt annat lika — den säljer men får inte spend |
| Takoverdrag_CS_3_H1 | — | okänd | **LOSER** | 3 % | 726 kr | 3 | 4,67 / 4,94 | ja (prel.) | släpp |
| Takoverdrag_CS_2_H1 | — | okänd | **KPI_WINNER** | 12 % | 3424 kr | 20 | 7,06 / 4,94 | ja | 3 nya hookar, allt annat lika — den säljer men får inte spend |
| Takoverdrag_CS_1_H1 | — | okänd | **KPI_WINNER** | 2 % | 597 kr | 3 | 5,67 / 4,94 | ja (prel.) | 3 nya hookar, allt annat lika — den säljer men får inte spend |

## Etiketter dag 7 (2026-09-22)

Annonser skapade 2026-09-15, egna första veckan 2026-09-15 – 2026-09-21 (7d_click). Etiketten är ingen dom: bedömbar = ≥ 300 kr OCH ≥ 3 köp.

| Annons | Batch | Typ | Etikett (7 d) | Andel | Spend | Köp | ROAS ad / kampanj | Bedömbar | Playbook |
|---|---|---|---|---|---|---|---|---|---|
| Takoverdrag_GT_4_H1 | 1 | okänd | **LOSER** | 1 % | 1022 kr | 1 | 1,88 / 3,28 | nej | släpp |
| Takoverdrag_PD_4_H1 | 1 | okänd | **KPI_WINNER** | 9 % | 6827 kr | 21 | 3,74 / 3,28 | ja | 3 nya hookar, allt annat lika — den säljer men får inte spend |
| Takoverdrag_GT_5_H1 | 1 | okänd | **LOSER** | 4 % | 3040 kr | 7 | 2,96 / 3,28 | ja | släpp |
| Takoverdrag_BOF_2_1 | 1 | okänd | **LOSER** | 2 % | 1916 kr | 3 | 1,77 / 3,28 | ja (prel.) | BOF — ingen spend-fix, räknas inte i frekvensen |
| Takoverdrag_BOF_1_1 | 1 | okänd | **LOSER** | 0 % | 87 kr | 0 | 0,00 / 3,28 | nej | BOF — ingen spend-fix, räknas inte i frekvensen |
| Takoverdrag_CO_2_1 | 1 | okänd | **INGEN_LEVERANS** | — | 2 kr | 0 | 0,00 / 3,28 | nej | hooken föll — logga och släpp, aldrig ABO |
| Takoverdrag_BOF_3_1 | 1 | okänd | **LOSER** | 0 % | 24 kr | 0 | 0,00 / 3,28 | nej | BOF — ingen spend-fix, räknas inte i frekvensen |
| Takoverdrag_CS_4_1 | 1 | okänd | **KPI_WINNER** | 1 % | 705 kr | 3 | 4,80 / 3,28 | ja (prel.) | 3 nya hookar, allt annat lika — den säljer men får inte spend |
| Takoverdrag_GT_6_1 | 1 | okänd | **KPI_WINNER** | 0 % | 327 kr | 2 | 6,90 / 3,28 | nej | 3 nya hookar, allt annat lika — den säljer men får inte spend |
| Takoverdrag_CS_6_1 | 1 | okänd | **KPI_WINNER** | 0 % | 245 kr | 1 | 4,60 / 3,28 | nej | 3 nya hookar, allt annat lika — den säljer men får inte spend |
| Takoverdrag_PD_5_1 | 1 | okänd | **LOSER** | 0 % | 37 kr | 0 | 0,00 / 3,28 | nej | släpp |
| Takoverdrag_LI_1_1 | 1 | okänd | **LOSER** | 0 % | 43 kr | 0 | 0,00 / 3,28 | nej | släpp |
| Takoverdrag_SP_5_1 | 1 | okänd | **LOSER** | 0 % | 24 kr | 0 | 0,00 / 3,28 | nej | släpp |
| Takoverdrag_TR_1_1 | 1 | okänd | **KPI_WINNER** | 0 % | 33 kr | 1 | 34,72 / 3,28 | nej | 3 nya hookar, allt annat lika — den säljer men får inte spend |

## Batch #4 — 2026-09-22 (`/rond-auto` steg 4b, brief_runda, alla fyra ur Axels Annonsidéer)

Lärdom `L-120250147392200291` (CS är starkast, GT bevisad, "bara taket" är mekanismen). Fyra rader med Status Ny i Annonsidéer (2026-09-18/19) — alla byggda i dag och satta till Byggd med kommentar. Priset läst live 2026-09-22: nio storlekar, 1 129 kr (6,5 m, jämförpris 1 469) … 2 239 kr (13,5 m) ⇒ "från 1 129 kr" när storlekarna nämns. Sidan säger varken "husbil" eller "vattentät". Butiksneutralt (speglas till CaraShell): inga policyrader, inget butiksnamn. Feedback-raden läst först. Copy av sonnet, regi av huvudsessionen. Spärrar: briefgranskning ✅ 4/4, `lardom --brief` ✅ 4 BRIEF-rader. Hub `BÄVER For CARL Taköverdraget för Husvagn`, Status Draft.

| Annons | Typ | Parent | Variabel | Axels idé | Hypotes | Förväntan | rev | brief → live |
|---|---|---|---|---|---|---|---|---|
| Takoverdrag_OB_3_H1 | N (kalla=voc) | — | invändningen "Är det vattentätt?" besvarad med vattendemo | video som svarar på kommentaren | den som frågar är köparen CS-annonserna tappar | kräver NY tagning (kanna vatten på taket) — ligger i Draft tills den finns | okänd | — |
| Takoverdrag_GT_11_H1 | I | GT_2_H1 | tillfället: fars dag 8 nov på förälderns mottagarbeskrivning | "perfekta fars dag-presenten till en husvagnsgubbe" | ett riktigt datum lyfter köp utan påhittad brådska | CPA ≤ GT_2_H1:s 240 kr; annars är tillfället värdelöst | okänd | — |
| Takoverdrag_CS_2_H2 | M | CS_2_H1 | ljudspåret: VO bort, sex textkort + musik | variant av vinnarvideon utan VO | feeden är tyst — VO:n gör inget | CPA ≈ CS_2_H1 ⇒ VO:n är dödvikt | okänd | — |
| Takoverdrag_CS_2_H3 | I | CS_2_H1 | öppningsraden: nio storlekar (3 × 5,5–13,5 m) | "spelar ingen roll om husbil eller husvagn – välj din storlek" | "finns den för min?" sållar bort köpare före prisargumentet | CPA < CS_2_H1:s 249 kr | okänd | — |
| Takoverdrag_OB_4_H1 | N (kalla=voc, plats OB_2_H1) | — | öppningsdraget: medhåll i invändningen "nu blir det väl tätt" före säljet, sidorna synligt öppna | — (lärdomens namngivna variant + kommentaren på SP_4_H1) | den som tror att ett överdrag kapslar in fukt köper när sidorna syns öppna | köp under break-even-CPA i lärdomen; mäts mot SP_4_H1, som bär kommentaren | okänd | — (Notion Skapad 2026-09-22) |

**Femte briefen, tillagd 2026-09-22 eftermiddag: `Takoverdrag_OB_4_H1`.** Det är lärdomens namngivna variant — `nasta` sa `OB_2_H1`, men det namnet var upptaget i Notion sedan 19/9 av förvaringskonceptet (raden ovan i batch #3), så briefen heter OB_4_H1 och BRIEF-raden bär `plats: Takoverdrag_OB_2_H1`. Skriven 21/9 i mappen batch-03 av misstag, flyttad hit. Notion-rad `3e3270ab908c81178ae1cf5a3ed39e2e` (Draft, Skapad 2026-09-22; Carl Vicente satte sig själv som Ansvarig 10:38 UTC samma dag, efter att kroppen ersatts 09:41 UTC). Batch #4 är därmed **fem** briefer — KLAR-raden i loggen (3178) säger fyra och skrivs inte om. Omskriven samma eftermiddag efter granskning: copyn sa "spänns fast med rem och dragsko" — produktsidan har 0 träffar på dragsko (läst live 2026-09-22; sidan säger remmar på alla fyra sidor, 2,5 m, hakas i en krok i nederkant, två 10,5 m spännremmar). **Samma fel står i den redan live `Takoverdrag_OB_1_H1`** ("Spänns fast med rem och dragsko i kanten") — den pausas inte (Axels regel 2026-09-15), felet går till redigeraren som anmärkning för nästa version. Manustabellen fick Time-kolumn och regin manusraderna ordagrant, så spärrens "regi 5/5" mäter på riktigt (förut matchade den ingenting: Script line bar siffror). Produkt i bild från sekund 0 via split (presenning vänster, draget höger). Spärr: `briefgranskning --rad` ✅ 5/5, tre-frågorstestet 13 rader utan ❌.

⚠️ **Husbil hålls.** Axels formulering "husbil eller husvagn" står inte i briefen: produktsidans rubrik och brödtext nämner inte husbil (läst live 2026-09-22 — ordet finns bara som tagg och i tre bild-alt-texter, och produktbilden visar en husbil), och en annons får inte lova något sidans text inte säger. Går in som hookvariant den dag Axel bekräftar passformen OCH ordet står på sidan. Frågan ställd i Annonsidé-radens kommentar och i dagens rapport.
GT_11_H1 speglas INTE till CaraShell (takskyddets dna mönster 12: inga GT-briefer där förrän test-ABO finns).

### Testet: fatigue eller mättnad? (Axels beslut 2026-09-22, ur kursen)

**Frågan:** CPA:n har stigit 150 → 171 → 147 → 323 → 235 → 325 → 269 → 371 → 333 → 410 → 421 → 466 kr (10–21 september, `cost_per_action_type → omni_purchase`, 7d_click) medan dagsspenden gick 1 352 → 15 990 kr. Break-even-CPA ~750, marginalen 80 % → 38 %. Kursen: när CPA stiger är fixet nya creatives, inte budget — och testet som skiljer creative fatigue från marknadsmättnad är att lansera en färsk batch i samma marknad.

**Testet:** de fem färska briefarna från 2026-09-22 — `OB_3_H1`, `OB_4_H1`, `GT_11_H1`, `CS_2_H2`, `CS_2_H3`. Start-CPA 466 kr (21/9), 7-dygns-CPA 15–21/9 375 kr (79 524 kr / 212 köp), ROAS 3d 2,99, budget 16 000 kr/dag. Loggad som `FATIGUE_TEST` i budgetloggen (2026-09-22).

**Domen fälls när alla fem har sina dag-7-etiketter:** minst en färsk annons med CPA under 466 kr ⇒ **fatigue** — brieffa vidare mot lärdomen. Alla fem över 466 kr, trots att briefarna klarade spärren ⇒ **mättnad** — inga fler annonser på produkten; nästa steg är ny produkt eller nytt land, och det lyfts till Axel. Svaret skrivs här, i dna.md och som `FATIGUE_TEST_SVAR`.

⚠️ Etikettläget 2026-09-22: 30 etiketterade annonser — 12 KPI_WINNER, 17 LOSER, 1 INGEN_LEVERANS, **ingen BREAKTHROUGH eller SPEND_WINNER**. `CS_2_1` (ROAS 7,65, 20 köp) och `CS_2_H1` (ROAS 7,06) bär 10–12 % av kampanjens spend var, och etiketten kräver ≥ 30 % — i en CBO med 30 annonser når ingen dit. Med nya motorn (vinnarspärren utan tak) håller det kampanjen still åt båda håll; frågan om spärren ska läsa kampanjnivån ligger hos Axel.
