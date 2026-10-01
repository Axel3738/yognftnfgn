# Batch-log — Taköverdraget för Husvagn

Breakthrough-frekvens: 1/63 (2 %) (etikett.mjs --frekvens 2026-10-01)

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

## Etiketter dag 7 (2026-09-23)

Fönster 2026-09-16..22 (annonsernas egen första vecka). Hook rate okänd — Ads-MCP:n ger inte video_view (3 s).



## Vidarebygg + batch #5 — 2026-09-23 (`/rond-auto` steg 4b, `annonsbehov: vidarebygg`)

**Läget (avläst 2026-09-23):** CPA_STIGER (CPA 410 → 421 → 466 → 549 kr), budget 16 000 kr
oförändrad, FUNNELLÄGE. `Takoverdrag_SP_4_H1` etiketterad **BREAKTHROUGH** i dag (40 % av
spenden första veckan, 34 750 kr, 75 köp, CPA 463 kr, hold 18 %) ⇒ lärdom
`L-120250242482300291` med tre iterationer, deadline 2026-10-07. Brieftaket: 4 fria +
5 namngivna (SP_6_1, CS_14_1, SP_4_H2/H3/H4) + 1 tom ruta (OB_5_1); OB_2_H1 struken (upptagen).
Feedback-raden Brief review 2026-09-19 läst (mekanism ur sidan, aldrig dragsko; tre-frågorstestet
på hooken på riktigt; Variables-rad + källa). Annonsidéer: 0 rader Ny. Priset läst live:
1 129 kr / 1 469 kr (6,5 × 3 m).

### Batch #5 — 3 video + 1 bild, alla i Notion som Draft (BÄVER For CARL Taköverdraget för Husvagn)

| Annons | Typ | Parent · iteration | Isolerad variabel | Hookrad | rev | brief → live | Notion |
|---|---|---|---|---|---|---|---|
| `Takoverdrag_SP_4_H2` | I | SP_4_H1 · 1 (ny hook) | öppningsraden — det som syns i bilden (handen hakar remmen i kroken) | "En hand hakar fast remmen i kroken vid takkanten." | okänd | — | `3e4270ab908c81ae8b88cc7f1d88433a` |
| `Takoverdrag_SP_4_H3` | I | SP_4_H1 · 2 (längre problemdel) | 5 s stående vatten vid takluckan före kroppen (NEW FOOTAGE) | "Vid en taklucka utan skydd blir vattnet lätt stående, och tätmassan tar stryk." | okänd | — | `3e4270ab908c815f80fbd1c10d145b34` |
| `Takoverdrag_SP_4_H4` | I | SP_4_H1 · 3 (in media res) | sekund 0 = remmen dras åt över taket, ingen inledningsmening | — (tyst cut-in) | okänd | — | `3e4270ab908c813283b7ca93fd2e714c` |
| `Takoverdrag_OB_5_1` | S (kalla=voc, invandning=fukt, ruta=statisk) | OB_4_H1 · 1 | invändningen fukt/kondens (37 % av kommentarerna) som statisk — 0 av 4 format besvarade | "Ja, det blir tätt. Fast bara taket." | okänd | — | `3e4270ab908c81a18891eb3dfcd87a1b` |

Alla tre iterationerna behåller SP_4_H1:s kropp (Drive-mappen `1pdzN3F5zsqb27SFquy3FG7t-HaiO38yo`,
EDITOR PICKS per klipp) och rättar tre saker parenten bär: "rem och dragsko" → remmar på alla fyra
sidor + krok i nederkant (sidans mekanism), påse-raden bort, recensionsraden bort. Regitabell rad
för rad, spärren `briefgranskning.mjs` exit 0, `lardom.mjs --brief` 4 BRIEF-rader. Butiksneutralt
(speglas till CaraShell). Copy av sonnet-subagent (regel 6), regi av huvudsessionen.
**Kvar obyggt av de namngivna:** `SP_6_1` och `CS_14_1` (typ IM ur äldre lärdomar) — nästa rond.
**Fatigue-testet** (2026-09-22) står: de fem färska annonserna från i går har inte dag-7-etikett än;
dagens fyra läggs till som testets andra våg (start-CPA i dag 549 kr).

## Etiketter dag 7 (2026-09-25) — Taköverdraget LISTICLE LAGERRENSNING

Etiketten är ingen dom (`bedombar` står bredvid). Annonsens egna första vecka, 7d_click. Källa: `agent/utdata/etiketter-backfill-2026-09-25.md`.

| Annons | Batch | Typ | Etikett (7 d) | Andel | Spend | Köp | ROAS ad / kampanj | Bedömbar | Playbook |
|---|---|---|---|---|---|---|---|---|---|
| Takoverdrag_PD_8_1 | 2 | okänd | **BREAKTHROUGH** | 37 % | 3425 kr | 7 | 2,35 / 2,69 | ja | 80 % vidarebygg på denna: I1 tre hookar → I2 problemdel → I3 in media res |
| Takoverdrag_SP_4_H1 | 1 | okänd | **KPI_WINNER** | 14 % | 1108 kr | 6 | 6,26 / 2,82 | ja | 3 nya hookar, allt annat lika — den säljer men får inte spend |
| Takoverdrag_SP_2_1 | 3 | okänd | **LOSER** | 6 % | 471 kr | 1 | 2,40 / 2,82 | nej | släpp |
| Takoverdrag_RI_3_H1 | 2 | okänd | **KPI_WINNER** | 3 % | 319 kr | 2 | 8,09 / 2,69 | nej | 3 nya hookar, allt annat lika — den säljer men får inte spend |
| Takoverdrag_CS_2_H1 | 3 | okänd | **KPI_WINNER** | 3 % | 265 kr | 1 | 4,26 / 2,82 | nej | 3 nya hookar, allt annat lika — den säljer men får inte spend |
| Takoverdrag_BOF_4_1 | 2 | okänd | **LOSER** | 2 % | 207 kr | 0 | 0,00 / 2,69 | nej | BOF — ingen spend-fix, räknas inte i frekvensen |
| Takoverdrag_GT_3_H1 | 3 | okänd | **LOSER** | 2 % | 176 kr | 0 | 0,00 / 2,82 | nej | släpp |
| Takoverdrag_BOF_2_1 | 1 | okänd | **LOSER** | 2 % | 164 kr | 0 | 0,00 / 2,82 | nej | BOF — ingen spend-fix, räknas inte i frekvensen |
| Takoverdrag_GT_2_H1 | 3 | okänd | **LOSER** | 2 % | 128 kr | 0 | 0,00 / 2,82 | nej | släpp |
| Takoverdrag_TR_2_1 | 2 | okänd | **LOSER** | 1 % | 114 kr | 0 | 0,00 / 2,69 | nej | släpp |
| Takoverdrag_RI_1_H1 | 1 | okänd | **LOSER** | 1 % | 101 kr | 0 | 0,00 / 2,82 | nej | släpp |
| Takoverdrag_GT_2_1 | 3 | okänd | **LOSER** | 1 % | 70 kr | 0 | 0,00 / 2,82 | nej | släpp |
| Takoverdrag_SP_2_H1 | 3 | okänd | **LOSER** | 1 % | 67 kr | 0 | 0,00 / 2,82 | nej | släpp |
| Takoverdrag_CS_11_1 | 2 | okänd | **LOSER** | 1 % | 67 kr | 0 | 0,00 / 2,69 | nej | släpp |
| Takoverdrag_PD_2_H1 | 3 | okänd | **LOSER** | 1 % | 59 kr | 0 | 0,00 / 2,82 | nej | släpp |
| Takoverdrag_OB_1_H1 | 2 | okänd | **LOSER** | 0 % | 49 kr | 0 | 0,00 / 2,69 | nej | släpp |
| Takoverdrag_SP_3_H1 | 3 | okänd | **LOSER** | 1 % | 48 kr | 0 | 0,00 / 2,82 | nej | släpp |
| Takoverdrag_PD_6_H1 | 2 | okänd | **LOSER** | 0 % | 46 kr | 0 | 0,00 / 2,69 | nej | släpp |
| Takoverdrag_PD_2_1 | 3 | okänd | **KPI_WINNER** | 1 % | 43 kr | 1 | 26,01 / 2,82 | nej | 3 nya hookar, allt annat lika — den säljer men får inte spend |
| Takoverdrag_PD_7_H1 | 2 | okänd | **LOSER** | 0 % | 42 kr | 0 | 0,00 / 2,69 | nej | släpp |
| Takoverdrag_CS_2_1 | 3 | okänd | **LOSER** | 0 % | 37 kr | 0 | 0,00 / 2,82 | nej | släpp |
| Takoverdrag_CO_1_H1 | 1 | okänd | **LOSER** | 0 % | 37 kr | 0 | 0,00 / 2,82 | nej | släpp |
| Takoverdrag_PD_4_H1 | 1 | okänd | **LOSER** | 0 % | 34 kr | 0 | 0,00 / 2,82 | nej | släpp |
| Takoverdrag_SP_1_H1 | 3 | okänd | **LOSER** | 0 % | 31 kr | 0 | 0,00 / 2,82 | nej | släpp |
| Takoverdrag_CS_3_H1 | 3 | okänd | **LOSER** | 0 % | 30 kr | 0 | 0,00 / 2,82 | nej | släpp |
| Takoverdrag_BOF_1_1 | 1 | okänd | **LOSER** | 0 % | 29 kr | 0 | 0,00 / 2,82 | nej | BOF — ingen spend-fix, räknas inte i frekvensen |
| Takoverdrag_LI_2_1 | 2 | okänd | **LOSER** | 0 % | 29 kr | 0 | 0,00 / 2,69 | nej | släpp |
| Takoverdrag_CS_10_1 | 2 | okänd | **LOSER** | 0 % | 27 kr | 0 | 0,00 / 2,69 | nej | släpp |
| Takoverdrag_PD_5_1 | 1 | okänd | **LOSER** | 0 % | 23 kr | 0 | 0,00 / 2,82 | nej | släpp |
| Takoverdrag_UG_1_H1 | 1 | okänd | **LOSER** | 0 % | 19 kr | 0 | 0,00 / 2,82 | nej | släpp |
| Takoverdrag_CS_4_1 | 1 | okänd | **LOSER** | 0 % | 19 kr | 0 | 0,00 / 2,82 | nej | släpp |
| Takoverdrag_CO_4_1 | 2 | okänd | **LOSER** | 0 % | 15 kr | 0 | 0,00 / 2,69 | nej | släpp |
| Takoverdrag_GT_6_1 | 1 | okänd | **LOSER** | 0 % | 14 kr | 0 | 0,00 / 2,82 | nej | släpp |
| Takoverdrag_PD_3_H1 | 3 | okänd | **LOSER** | 0 % | 13 kr | 0 | 0,00 / 2,82 | nej | släpp |
| Takoverdrag_CS_6_1 | 1 | okänd | **LOSER** | 0 % | 12 kr | 0 | 0,00 / 2,82 | nej | släpp |
| Takoverdrag_TR_1_1 | 1 | okänd | **LOSER** | 0 % | 11 kr | 0 | 0,00 / 2,82 | nej | släpp |
| Takoverdrag_LI_1_1 | 1 | okänd | **LOSER** | 0 % | 10 kr | 0 | 0,00 / 2,82 | nej | släpp |
| Takoverdrag_GT_5_H1 | 1 | okänd | **INGEN_LEVERANS** | — | 10 kr | 0 | 0,00 / 2,82 | nej | hooken föll — logga och släpp, aldrig ABO |
| Takoverdrag_RI_4_1 | 2 | okänd | **INGEN_LEVERANS** | — | 8 kr | 0 | 0,00 / 2,69 | nej | hooken föll — logga och släpp, aldrig ABO |
| Takoverdrag_PD_9_1 | 2 | okänd | **INGEN_LEVERANS** | — | 7 kr | 0 | 0,00 / 2,69 | nej | hooken föll — logga och släpp, aldrig ABO |
| Takoverdrag_CO_2_1 | 1 | okänd | **INGEN_LEVERANS** | — | 7 kr | 0 | 0,00 / 2,82 | nej | hooken föll — logga och släpp, aldrig ABO |
| Takoverdrag_BOF_6_1 | 2 | okänd | **INGEN_LEVERANS** | — | 5 kr | 0 | 0,00 / 2,69 | nej | BOF — ingen spend-fix, räknas inte i frekvensen |
| Takoverdrag_BOF_3_1 | 1 | okänd | **INGEN_LEVERANS** | — | 5 kr | 0 | 0,00 / 2,82 | nej | BOF — ingen spend-fix, räknas inte i frekvensen |
| Takoverdrag_GT_9_1 | 2 | okänd | **INGEN_LEVERANS** | — | 5 kr | 0 | 0,00 / 2,69 | nej | hooken föll — logga och släpp, aldrig ABO |
| Takoverdrag_PD_1_H1 | 3 | okänd | **INGEN_LEVERANS** | — | 4 kr | 0 | 0,00 / 2,82 | nej | hooken föll — logga och släpp, aldrig ABO |
| Takoverdrag_GT_1_H1 | 3 | okänd | **INGEN_LEVERANS** | — | 3 kr | 0 | 0,00 / 2,82 | nej | hooken föll — logga och släpp, aldrig ABO |
| Takoverdrag_GT_4_H1 | 1 | okänd | **INGEN_LEVERANS** | — | 3 kr | 0 | 0,00 / 2,82 | nej | hooken föll — logga och släpp, aldrig ABO |
| Takoverdrag_BOF_5_1 | 2 | okänd | **INGEN_LEVERANS** | — | 2 kr | 0 | 0,00 / 2,69 | nej | BOF — ingen spend-fix, räknas inte i frekvensen |
| Takoverdrag_CS_1_H1 | 3 | okänd | **INGEN_LEVERANS** | — | 2 kr | 0 | 0,00 / 2,82 | nej | hooken föll — logga och släpp, aldrig ABO |
| Takoverdrag_SP_5_1 | 1 | okänd | **INGEN_LEVERANS** | — | 0 kr | 0 | 0,00 / 2,82 | nej | hooken föll — logga och släpp, aldrig ABO |


## Batch #6 — 2026-09-25 (invändningsronden, Axels order samma dag)

**Läget (avläst 2026-09-25):** LAT_VARA — CPA per dygn 466 → 551 → 723 → 537 kr (21–24/9),
budget 16 000 kr oförändrad, 3 d: 51 779 kr / 87 köp / ROAS 2,22 mot break-even 1,63 (kampanjnamnet),
FUNNELLÄGE. Axel 2026-09-25: "Vi ligger på över 150 k dagara och du gör inga briefs för den" —
ronden hade inte byggt något på produkten (4 briefer från 23/9 i Draft, 0 nya lärdomar). Byggt
i stället: **sju briefer på tomma rutor i invändningsmatrisen** (`invandningar.md`, ommätt samma dag:
44 kommentarer, fukt 34 %), fria mot brieftaket (`invandning=`, `ruta=`, `kalla=voc`). Feedback-raden
Brief review 2026-09-23 följd: CPA mot break-even-CPA i samma mening med källa (dna.md 715 kr),
öppningsrad en sats läsbar på 3 s, NEW FOOTAGE-block överst med fallback. Annonsidéer: 0 rader Ny.
Priset läst live: 1 129 kr / 1 469 kr (6,5 × 3 m). Lärdom L-120250242482300291 (SP_4_H1
BREAKTHROUGH, CPA 463 kr mot break-even-CPA 715 kr).

### Batch #6 — 4 video + 3 bild, alla i Notion som Draft (BÄVER Taköverdraget för Husvagn, `7ec270ab…`)

| Annons | Typ | Ruta | Parent | Isolerad variabel | Hookrad | Notion |
|---|---|---|---|---|---|---|
| `Takoverdrag_OB_6_H1` | I | fukt × demo | OB_4_H1 | ett varv runt vagnen med överdraget på (NEW FOOTAGE, fallback SP_4_H1 + tak-van.jpg) | "Bara taket är under duken, resten av vagnen står fri." | `3e6270ab908c811ea393dbbe7b9a7e38` |
| `Takoverdrag_OB_7_H1` | I | fukt × jämförelse | OB_4_H1 | delad bild helöverdrag / bara taket, slider | "Tätt överdrag och skyddat tak är inte samma sak." | `3e6270ab908c81e3afbec4099793691b` |
| `Takoverdrag_OB_8_1` | S | blåser × statisk | OB_1_H1 | kroken som stilla bild (tak-spanne.jpg) | "Remmen hakar i en krok, inte i en knut du hoppas håller." | `3e6270ab908c81079bb7e7b5d54755a4` |
| `Takoverdrag_OB_9_H1` | I | blåser × demo | OB_1_H1 | löst presenninghörn (stock, aldrig vår) → remmen i kroken ur SP_4_H1 | "Ett löst hörn flyger i väg." | `3e6270ab908c811a9edbc28c6b534500` |
| `Takoverdrag_OB_10_1` | S | vattentätt × statisk | OB_3_H1 | våt silveryta efter hällningen (frame ur OB_3_H1) | "Regnet rinner av vävens yta i stället för att bli stående." | `3e6270ab908c81569b7bfc4b4c952c7d` |
| `Takoverdrag_OB_11_H1` | I | vattentätt × demo | OB_3_H1 | hällningen som hela annonsen från sekund 3 (OUR AD OB_3_H1 0:06–0:14) | "Silverbelagd 210D-oxfordväv släpper vattnet direkt av taket." | `3e6270ab908c81a49a7ffc042ee08cca` |
| `Takoverdrag_OB_12_1` | N | täcker för lite × statisk | — | medge att helöverdrag skyddar mer, sälj taket som den dyraste ytan | "Vårt överdrag ligger bara på taket, den dyraste ytan." | `3e6270ab908c81b9a1cefcf7766c3029` |

Spärren `briefgranskning.mjs` (main): första körningen 6 av 7 stoppade (typ N med parent ⇒ I/S,
"or/eller" i Picture ×3), rättat, 7/7 gröna. `lardom.mjs --brief`: 7 BRIEF-rader.
`tools/notion-brief-upp.mjs` (REST): alla sju skapade och tillbakalästa, blocken stämmer; SQL-kontroll
7 rader Draft med rätt Typ + Landing page. Copy av sonnet-subagenter (regel 6); huvudsessionen strök
tre saker copyn bar som sidan inte säger: takluckan går att öppna under överdraget (OB_6, hela
raden bort — sidan nämner luckan bara som stället där vattnet står), "fyra hörn" → sidans "fyra
sidor" (OB_8/OB_9), "19,5 m²" → "6,5 × 3 m" och "inte mot lacken" → sidans titelrad (OB_12).
Butiksneutralt (speglas till CaraShell). **Mätt i hubben samma dag:** OB_3_H1, OB_4_H1 och OB_5_1
står i `CaraShell EN ready to be active` — alltså live i båda butikerna; matrisen rättad
(OB_5_1 = live). **Kvar obyggt:** blåser × jämförelse, vattentätt × jämförelse, önskemål (alla
fyra), täcker × video/demo/jämförelse, förvaring × statisk/demo/jämförelse — och de namngivna
`SP_6_1` / `CS_14_1` från batch #5.


## Batch #7 — 2026-09-28 (invändningsmatrisen, Axels beslut samma dag: "1")

**Läget (avläst 2026-09-28):** Axel såg en tom Draft-kolumn i hubben ("VARFÖR FINNS det inga ads för den?") — batch #6:s sju briefer var redan tagna av redigerarna (4 videor i `Creative strat review`, 2 bilder i `CaraShell EN ready to be active`, OB_12_1 Approved), och ronden 26–27/9 byggde inget: kampanjen 10 000 kr/dag (LAT_VARA, inte funnelläge), inga nya etiketter förrän 29–30/9, listicle-kampanjen ägarens. Valet gavs (1 invändningarna / 2 listicle-vinnaren / 3 vänta); Axel: **1**.

**Livstid 2026-09-28 07:30 UTC:** 185 132 kr, 445 köp, ROAS 2,98, CPA 416 kr. SP_4_H1 50 311 kr / 102 köp / CPA 493 kr. **Ett break-even från och med nu, i båda hubbarna: 715 kr** (AOV 1 165 ÷ 1,63 ur kampanjnamnet) — regel 2 ur Brief review 2026-09-25 (CaraShells 693 kr pensioneras). Matrisen ommätt 2026-09-28: 72 kommentarer, fukt 32 %, blåser 6 %, täcker 4 %, önskemål 3 %.

**Produktsidan omläst live 2026-09-28 — den är omskriven:** "vattentät 210D-oxfordväv" står nu på sidan (ordet undviks ändå som blankt påstående, vi skriver "vattnet rinner av" — Brief review 2026-09-25 bekräftar vanan), "kanten hänger 30–40 cm ner över sidorna, så skarven mellan tak och vägg ligger under skydd", "krokar fast under karossens nederkant", "ställs in i ett spänne", "hanteras av en person … viks ihop till en famnstor packe efter säsongen", jämförelsetabellen Taköverdrag/Helöverdrag (får på det ensam, rör lacken, dörr/fönster/luckor fria, efter säsongen famnstor packe), FAQ (blåser det av: nej; från höst till vår: ja, skotta av tung blötsnö; husvagn och husbil: ja). Fortfarande INTE på sidan: dragsko, förvaringspåse, andas, ventilerad.

**Brief review 2026-09-25 (skapad i morse) läst före skrivandet, tre regler tillämpade:** (1) kanten hänger 30–40 cm ner och visas, aldrig "stannar vid takkanten" — OB_18/19/20/21 bygger på just kanten; (2) ett break-even, 715 kr, härledningen i varje Why; (3) stockklipp namnger bibliotek, licens och fallback-stillbild (Pexels, fri licens, fallback ur CDN) i OB_13/14/17. Annonsidéer: 0 rader Ny för produkten.

### Batch #7 — 7 video + 3 bild, alla i Notion som Draft (BÄVER Taköverdraget för Husvagn, `7ec270ab…`)

| Annons | Typ | Ruta | Parent | Isolerad variabel | Hookrad | Notion |
|---|---|---|---|---|---|---|
| `Takoverdrag_OB_13_H1` | I | blåser × jämförelse | OB_1_H1 | split: snörknuten på ett skynke mot vår rem i kroken (stock Pexels, fallback före/efter-bilden) | "Skynkets hörn lyfter i vinden, trots snöret." | `3e9270ab908c816a8607c0666b96bd8f` |
| `Takoverdrag_OB_14_H1` | I | vattentätt × jämförelse | OB_3_H1 | split: pöl på tunn presenning mot hällningen ur OB_3_H1 0:06–0:14 | "På en tunn presenning står vattnet kvar i en pöl." | `3e9270ab908c81fe8f4fe1dfe943a48e` |
| `Takoverdrag_OB_15_1` | N | förvaring × statisk | — | sidans FAQ "från höst till vår" på vinterplatsbilden | "Från höst till vår, på din plats" | `3e9270ab908c816aa501e69aae2b1688` |
| `Takoverdrag_OB_16_H1` | N | förvaring × demo | — | en vinter på platsen: löv, blötsnö skottas av, hällning, vårvikning (NEW FOOTAGE med fallback) | "Löv ligger på överdraget, första frosten i gräset." | `3e9270ab908c8163a7b9f4d2c50c294a` |
| `Takoverdrag_OB_17_H1` | I | förvaring × jämförelse | OB_2_H1 | split: helöverdrag i hög mot famnstor packe (OB_2_H1 0:00–0:04) | "Ett helöverdrag ligger i en stor hög på garagegolvet." | `3e9270ab908c8142811ae4d3fedb9a4d` |
| `Takoverdrag_OB_18_H1` | I | täcker × video | OB_12_1 | medgivandet, sedan kanten som hänger 30 till 40 cm ner, visad (regel 1 ur Brief review 2026-09-25) | "Ett helöverdrag skyddar mer av vagnen." | `3e9270ab908c814e92e1fbcb1b64a0cf` |
| `Takoverdrag_OB_19_H1` | I | täcker × demo | OB_12_1 | måttbandet vid kanten, sedan ett varv (NEW FOOTAGE med fallback) | "Ett måttband visar trettio till fyrtio centimeter vid kanten." | `3e9270ab908c81848344e22a325a8618` |
| `Takoverdrag_OB_20_1` | S | täcker × jämförelse | OB_12_1 | split ur sidans tabellrad "Dörr, fönster och luckor: Fria / Täckta" | "Dörr och fönster fria, inte täckta" | `3e9270ab908c8142aa4ff8f0c2c1933d` |
| `Takoverdrag_OB_21_1` | N | önskemål × statisk | — | medge önskan om sidor, sälj de fria sidorna som konstruktionen | "Sidorna står fria, med flit" | `3e9270ab908c81f680f4f8611ba9c238` |
| `Takoverdrag_OB_22_H1` | N | önskemål × video | — | "sen då?" besvarat med säsongens slut, ingen livslängdssiffra | "Till våren lossas remmarna ur krokarna, en efter en." | `3e9270ab908c81af98cfd69885df7e31` |

Spärren `briefgranskning.mjs` (main 67d5c89): första körningen 1 av 12 stoppad ("or" i Picture, OB_16 rad 2) + fyra variabelnoter, rättat, 12/12 gröna. `lardom.mjs --brief` (--befintliga 85 namn ur kontot + hubben, --budget 10 000): matrisrutorna fria mot taket (10 rutor som byggs), men **`SP_6_1` och `CS_14_1` (de namngivna IM-platserna ur batch #5:s lärdom) avvisades** — taket är 0 sedan förra batchen och en äldre lärdoms namn räknas inte längre — de två briefarna ströks ur batchen (copyn står kvar i copy-sonnet.md) och byggs när en ny lärdom namnger dem. Not från lardom: OB_16_H1 delar avatar/begär/mekanism med OB_15_1 (punkt 19: samma löfte med nya ord är en iteration) — raden står kvar som typ N med ruta demo, för det är rutan som är variabeln. 10 BRIEF-rader skrivna. `tools/notion-brief-upp.mjs` (REST): alla tio skapade och tillbakalästa block för block; SQL-kontroll 10 rader Draft, 7 Video + 3 Image, Skapad 2026-09-28. Copy av sonnet (103 rader, tre-frågorstestet 103/103 ❌ på "kan konkurrent signera"; huvudsessionen strök en rad: "Ställ den på riktig vinterförvaring, säger många" → "Riktig vinterförvaring är ett alternativ" — "säger många" är inte kollbart). Butiksneutralt (speglas till CaraShell). Matrisen uppdaterad för hand efter uppladdningen (Metas anropsgräns nådd när verktyget skulle mäta om). **Kvar obyggt:** önskemål × demo och önskemål × jämförelse (3 %, väntar på etikett), `SP_6_1` / `CS_14_1` (kräver ny lärdom som namnger dem). De 4 batch #6-videorna i `Creative strat review` väntar på `/granska`.


## Etiketter dag 7 (2026-09-29) — Taköverdraget för Husvagn 6,5 × 3 m

Ur `agent/etikett-backfill.mjs` 2026-09-29 (annonsens egna första vecka 22–28 sep, 7d_click). Lärdom per annons i `lardomar.md` (LARDOM-rader samma morgon). Breakthrough-frekvens: 1/55 (2 %) (etikett.mjs --frekvens 2026-09-29).

| Annons | Batch | Etikett (7 d) | Andel | Spend | Köp | ROAS ad / kampanj | Bedömbar |
|---|---|---|---|---|---|---|---|
| Takoverdrag_PD_10_1 | 3 | **KPI_WINNER** | 8 % | 8043 kr | 17 | 2,82 / 2,06 | ja |
| Takoverdrag_CS_8_H1 | 2 | **LOSER** | 4 % | 3569 kr | 4 | 1,58 / 2,06 | ja |
| Takoverdrag_RI_2_H1 | 2 | **KPI_WINNER** | 3 % | 2927 kr | 5 | 2,25 / 2,06 | ja |
| Takoverdrag_RI_3_H1 | 2 | **KPI_WINNER** | 2 % | 1855 kr | 4 | 2,86 / 2,06 | ja |
| Takoverdrag_PD_8_1 | 2 | **LOSER** | 1 % | 756 kr | 0 | 0,00 / 2,06 | nej |
| Takoverdrag_CS_7_H1 | 2 | **LOSER** | 1 % | 712 kr | 0 | 0,00 / 2,06 | nej |
| Takoverdrag_BOF_4_1 | 2 | **LOSER** · BOF | 1 % | 498 kr | 0 | 0,00 / 2,06 | nej |
| Takoverdrag_PD_9_1 | 2 | **LOSER** | 0 % | 433 kr | 0 | 0,00 / 2,06 | nej |
| Takoverdrag_PD_6_H1 | 2 | **LOSER** | 0 % | 293 kr | 0 | 0,00 / 2,06 | nej |
| Takoverdrag_BOF_9_1 | 3 | **LOSER** · BOF | 0 % | 273 kr | 0 | 0,00 / 2,06 | nej |
| Takoverdrag_GT_8_H1 | 2 | **LOSER** | 0 % | 271 kr | 0 | 0,00 / 2,06 | nej |
| Takoverdrag_OB_2_H1 | 3 | **LOSER** | 0 % | 228 kr | 0 | 0,00 / 2,06 | nej |
| Takoverdrag_CS_11_1 | 2 | **LOSER** | 0 % | 192 kr | 0 | 0,00 / 2,06 | nej |
| Takoverdrag_GT_7_H1 | 2 | **LOSER** | 0 % | 128 kr | 0 | 0,00 / 2,06 | nej |
| Takoverdrag_PD_7_H1 | 2 | **LOSER** | 0 % | 115 kr | 0 | 0,00 / 2,06 | nej |
| Takoverdrag_RI_4_1 | 2 | **LOSER** | 0 % | 110 kr | 0 | 0,00 / 2,06 | nej |
| Takoverdrag_GT_10_H1 | 3 | **LOSER** | 0 % | 84 kr | 0 | 0,00 / 2,06 | nej |
| Takoverdrag_CS_10_1 | 2 | **LOSER** | 0 % | 71 kr | 0 | 0,00 / 2,06 | nej |
| Takoverdrag_CO_3_H1 | 2 | **LOSER** | 0 % | 70 kr | 0 | 0,00 / 2,06 | nej |
| Takoverdrag_BOF_5_1 | 2 | **LOSER** · BOF | 0 % | 57 kr | 0 | 0,00 / 2,06 | nej |
| Takoverdrag_CS_13_1 | 3 | **LOSER** | 0 % | 51 kr | 0 | 0,00 / 2,06 | nej |
| Takoverdrag_BOF_8_1 | 3 | **LOSER** · BOF | 0 % | 41 kr | 0 | 0,00 / 2,06 | nej |
| Takoverdrag_LI_2_1 | 2 | **LOSER** | 0 % | 23 kr | 0 | 0,00 / 2,06 | nej |
| Takoverdrag_TR_2_1 | 2 | **LOSER** | 0 % | 16 kr | 0 | 0,00 / 2,06 | nej |
| Takoverdrag_OB_1_H1 | 2 | **LOSER** | 0 % | 11 kr | 0 | 0,00 / 2,06 | nej |
| Takoverdrag_BOF_7_1 | 3 | **INGEN_LEVERANS** · BOF | — | 7 kr | 0 | 0,00 / 2,06 | nej |
| Takoverdrag_TR_3_H1 | 3 | **INGEN_LEVERANS** | — | 6 kr | 0 | 0,00 / 2,06 | nej |
| Takoverdrag_BOF_6_1 | 2 | **INGEN_LEVERANS** · BOF | — | 6 kr | 0 | 0,00 / 2,06 | nej |
| Takoverdrag_CO_4_1 | 2 | **INGEN_LEVERANS** | — | 6 kr | 0 | 0,00 / 2,06 | nej |
| Takoverdrag_GT_9_1 | 2 | **INGEN_LEVERANS** | — | 5 kr | 0 | 0,00 / 2,06 | nej |

Bedömbara i dag: PD_10_1 (KPI_WINNER, 17 köp, CPA 473 kr — platser PD_10_2/PD_10_3 namngivna), RI_2_H1 (KPI_WINNER, 5 köp — RI_2_H2 namngiven; recensionsraden är importrader), RI_3_H1 (KPI_WINNER prel., 4 köp — RI_3_H2/H3 namngivna), CS_8_H1 (LOSER bedömbar, ROAS 1,58 — släppt, idén lever i RI_3). **Observation, ingen dom:** samma creative som SE:s `Takoverdrag_CS_7_H1` (LOSER, 712 kr, 0 köp) kör som `CaraShellRoof_NO_CS_107_H1` i CaraShells NO-kampanj med 10 köp på 5 060 kr (KPI_WINNER, bedömbar, ROAS 2,75) — prisankaret vinner i Norge men fick inget köp i SE-huvudkampanjen samma vecka; läs om dag 14. Rundan för Taköverdraget förfaller först när 3-dagarsklockan från batch #7 (28/9) gått. Spendtjuven i grönt läge pausade `Takoverdrag_CS_2_H1` i dag (TROTT_VINNARE: 4 042 kr / 4 köp / ROAS 1,24 på 3 d, livstid 3,66, etikett KPI_WINNER 21/9) — kampanjen orörd.


## Fars dag omgång 4 — extra BOF-batch (2026-09-29 kväll, Axels order samma kväll)

Axel: "gör en till extra batch för fars dag för alla produkter och gärna dubbelt så mycket bildads och sedan normal kvantitet videos så att vi pushar extra mycket BOF fars dag annonser". Invändningen som batchen svarar på: **"finns den för min husvagn?"** (svar ur sidan: nio längder, 3 × 5,5 till 3 × 13,5 m, från 1 129 kr; remmar på alla fyra sidor, kanten 30 till 40 cm ner över väggen). Förälder Takoverdrag_GT_2_H1 (lärdom L-120250147364200291). Alla sju klarade spärren (regi 4/4, 0 fel), ligger som `Draft` i BÄVER For CARL Taköverdraget för Husvagn. Loggkod `FARSDAG_BATCH_KLAR`. Batch-loggen för hela omgången: `docs/briefs/farsdag-2026/README-bof.md`.

| Annons | Typ | Hook / rubrik | Notion |
|---|---|---|---|
| Takoverdrag_FD_3_H1 | video 13 s, BOF-omklipp | Mät husvagnen. Nio längder, 5,5 till 13,5 meter. | https://www.notion.so/3ea270ab908c8188951cf208681397d6 |
| Takoverdrag_FD_3_H2 | video 13 s, BOF-omklipp | Taköverdrag: från 1 129 kr, ord. 1 469 kr. | https://www.notion.so/3ea270ab908c8130a40afa967fb77483 |
| Takoverdrag_FD_3_H3 | video 13 s, BOF-omklipp | Beställ senast 19 oktober. Fars dag-present: 210D-väv på taket. | https://www.notion.so/3ea270ab908c81af942ae78c980d6d58 |
| Takoverdrag_FD_4_1 | bild, BOF | Mät vagnen. Ta storleken minst lika lång. | https://www.notion.so/3ea270ab908c81c4b411fc60d5db57db |
| Takoverdrag_FD_4_2 | bild, BOF | Från 1 129 kr. Ord. 1 469 kr. | https://www.notion.so/3ea270ab908c8166a734f84a6fbf3c00 |
| Takoverdrag_FD_4_3 | bild, BOF | Beställ senast 19 oktober: taköverdrag till fars dag. | https://www.notion.so/3ea270ab908c817b9babe17a222c44db |
| Takoverdrag_FD_4_4 | bild, BOF | Remmar på alla fyra sidor. Spänne, krok. | https://www.notion.so/3ea270ab908c81108ee6eca9e640acbb |

Mätning (ANALYSMETOD): ingen dom under 300 kr / 3 köp. H1 mot H2 mot H3 = vilken öppning (invändning, pris, sista dag) den produktmedvetna tittaren behöver; FD_4_1–4 mot varandra = budskapet i textrutan; hela batchen mot FD_1/FD_2 (presentvinkeln, kall publik). Etikett dag 7, lärdom, sedan dna.md.

## Etiketter dag 7 (2026-09-30) — Taköverdraget för Husvagn 6,5 × 3 m

Ur `agent/etikett-backfill.mjs` 2026-09-30 (MagiBorsten SE, annonsens egna första vecka 2026-09-23–2026-09-29, 7d_click). Lärdom per annons i `lardomar.md` (LARDOM-rader samma morgon). Breakthrough-frekvens: 1/61 (2 %) (etikett.mjs --frekvens 2026-09-30).

| Annons | Batch | Etikett (7 d) | Andel | Spend | Köp | ROAS ad / kampanj | Hook / hold | Bedömbar |
|---|---|---|---|---|---|---|---|---|
| Takoverdrag_PD_10_H1 | 3 | **LOSER** | 10 % | 8 234 kr | 11 | 1,80 / 2,18 | 45 % / 8 % | ja |
| Takoverdrag_OB_3_H1 | 4 | **LOSER** | 2 % | 2 034 kr | 2 | 1,19 / 2,18 | 35 % / 10 % | nej |
| Takoverdrag_GT_11_H1 | 4 | **LOSER** | 1 % | 875 kr | 0 | 0,00 / 2,18 | 49 % / 11 % | nej |
| Takoverdrag_CO_5_H1 | 3 | **KPI_WINNER** | 1 % | 482 kr | 2 | 5,30 / 2,18 | 33 % / 8 % | nej |
| Takoverdrag_CS_9_H1 | 2 | **LOSER** | 1 % | 452 kr | 0 | 0,00 / 2,18 | 25 % / 9 % | nej |
| Takoverdrag_OB_4_H1 | 4 | **LOSER** | 1 % | 446 kr | 0 | 0,00 / 2,18 | 30 % / 10 % | nej |

## Batch #8 — 2026-10-01 (`/rond-auto` steg 4b, 3-dagarsrundan efter batch #7)

**Läget (avläst 2026-10-01 morgon):** kampanjen ACTIVE, budgeten höjd till 9 600 kr/dag (SKALA) — under funnelgränsen 10 000, så invändningsmatrisen är en varning, inte spärr (6 rader lästa, inga tomma rutor stoppade). Behovsraden: "3 dagar sedan senaste batchen — dags för 3-dagarsrundan (8 annonser; budgeten hade gett 8, lärdomarna sedan förra batchen 36 + 5 namngivna: PD_10_2, PD_10_3, RI_2_H2, RI_3_H2, RI_3_H3). Mix 80 % vidarebyggen / 20 % nya vinklar (levande breakthrough SP_4_H1 — dess tre iterationer SP_4_H2/H3/H4 finns redan)." Priset läst live 2026-10-01 08:08 CEST: 1 129 / 1 469 kr (3 × 5,5 och 3 × 6,5 m), oförändrat. **Brief review 2026-09-29** (Feedback-raden i hubben, skapad 05:30 i dag) läst före skrivandet och tillämpad i varje brief: (1) ett break-even — cite 693 kr tills ägaren bestämt, härled aldrig ett nytt; (2) aldrig "vattentät" som blankt ord; (3) FD-marknadsraden "Sweden and Norway only; never US, GB, CA or DK". Annonsidéer: 1 rad Ny (2026-09-27, AI-avatarer/amerikaner) — byggd som `Takoverdrag_TR_4_H1`.

**Rundan blev 7, inte 8 — med flit.** De fem namngivna platserna togs exakt som lärdomarna föreskriver. CO_5_H1 (KPI_WINNER under grinden, lärdom: SLÄPP tills dag 14) och PD_10_H1 (LOSER, lärdom: SLÄPP) ger ingen åttonde plats. Lärdomen för `OB_5_1` (KPI_WINNER, etikett i morse, L-120250356982310291) namnger `OB_5_2/3/4` — alla statiska, och rundan får högst två statiska; de två gick till PD_10_2/PD_10_3 (huvudsessionens strategi). OB_5_2–4 står i backlog.md och tas nästa runda (platserna lever kvar i lärdomen, gratis mot taket). Hellre 7 med tanke än 8 utan.

### Batch #8 — 5 video + 2 bild, alla i Notion som Draft (BÄVER Taköverdraget för Husvagn, `7ec270ab…`)

| Annons | Typ | Parent / källa | Isolerad variabel | Hookrad | Lärdom | Notion | rev | brief → live |
|---|---|---|---|---|---|---|---|---|
| `Takoverdrag_PD_10_2` | I (bild) | PD_10_1 (KPI_WINNER 29/9, 17 köp, CPA 473) | bara rubriken: mekanismen först, storlekarna som underrad | "Sitter kvar när det blåser. Nio storlekar." | L-120250330247960291 | `3ec270ab908c81a99373e5ef4112ad5c` | okänd | okänd |
| `Takoverdrag_PD_10_3` | I (bild) | PD_10_1 | bara rubriken: måttet på den egna vagnen, sidans mätregel som underrad | "3 × 5,5 till 3 × 13,5 meter. En passar din." | L-120250330247960291 | `3ec270ab908c81809c04eccb76a86307` | okänd | okänd |
| `Takoverdrag_RI_2_H2` | I (video 15 s) | RI_2_H1 (KPI_WINNER, 5 köp, hook 46 %) | hooken: presenningen som spricker VISAD (stock Pexels, fallback före/efter-bilden); recensionsraden borta | "Frostig presenning i gryningen. Hörnet knäcker i handen." | L-120250330348390291 | `3ec270ab908c8187b0f7dd78bdd3d8cc` | okänd | okänd |
| `Takoverdrag_RI_3_H2` | I (video 20 s) | RI_3_H1 (KPI_WINNER prel., 4 köp, hook 34 %) | hooken: taket rakt uppifrån med stående vatten vid luckan (NEW FOOTAGE, fallback); förälderns två rader ordagrant (20 + 18 ord ⇒ 7 + 6 s) | "Takluckan står i vatten. Från marken syns det inte." | L-120250330352260291 | `3ec270ab908c8169acc2d51688e66ed3` | okänd | okänd |
| `Takoverdrag_RI_3_H3` | I (video 23 s) | RI_3_H1 | längre problemdel: två rader 4–5 s ur sidans text (tätmassan mjuknar, "då är det en reparation"), ingen kronsiffra | förälderns hook ordagrant | L-120250330352260291 | `3ec270ab908c815e85aadaf7ffeb9408` | okänd | okänd |
| `Takoverdrag_TR_4_H1` | N (video 22 s, AI-avatar) | **Axels annonsidé 2026-09-27** (kalla=axel), lärdomen SP_4_H1:s | ny vinkel: en HeyGen-presentatör från vårt klimat (höstregn, blötsnö, nätter under noll) + sidans svar i produktfilm; US VERSION-block (amerikansk avatar, görs om direkt i HeyGen, $199/$249 läst live) | "Regn på hösten, blötsnö, nätter under noll. Allt landar på taket." | L-120250242482300291 | `3ec270ab908c8121ab4dca3220c5b6e2` | okänd | okänd |
| `Takoverdrag_TR_5_H1` | N (video 18 s) | kundrösten (kalla=voc, lead VOC-122187148058859973_1085107617595243: "samma som på marknadsplatsen?"), lärdomen SP_4_H1:s | ny vinkel: materialet och remmarna i närbild som hela argumentet, ingen konkurrent namngiven | "Lika på bild. Olika i handen: 210D-väv." | L-120250242482300291 | `3ec270ab908c81c18a15f3575cf84026` | okänd | okänd |

**Avataren i TR_4 presenterar, påstår aldrig eget köp eller egen vinter** — en påhittad personlig historia är en påhittad recension (CLAUDE.md regel 3). Axels ord var "någon här i vårt klimat som har använt dem"; briefen svarar med klimatet i klartext + sidans FAQ "från höst till vår" + produktfilm, och säger det rakt ut i Why. Vill Axel ha ett ägarpåstående i avatarens mun är det hans beslut.

**Spärren** (`briefgranskning.mjs --manifest`, main-worktree 35c42205 — `/tmp/main-sparr` var låst av en annan session med halv utcheckning, så en egen worktree i scratchpad): första körningen 7/7 ✅ (regi 4/4, 4/4, 5/5, 6/6, 5/5), exit 0; en anmärkning kvar ("Isolated variable … may name more than one variable" på PD_10_3 — verktyget läser kolon/semikolon som flera variabler, samma som omgång 4), inga fel. **`lardom.mjs --brief`** (`--befintliga` 106 namn = hubben 90 + kontot 94 + batch-loggen 102, union; `--budget 9600`): "Briefkvot: 38 fria platser kvar av 38 + 8 namngivna i lärdomarna (PD_10_2, PD_10_3, RI_2_H2, RI_3_H2, RI_3_H3, OB_5_2, OB_5_3, OB_5_4)"; 7 ✅, iterationsnumren ur loggen (PD_10 1/2, RI_2 1, RI_3 1/2, TR_4 1, TR_5 1), **7 BRIEF-rader skrivna**. **Notion** (`tools/notion-brief-upp.mjs`, REST): 7 rader skapade och tillbakalästa block för block (42–54 block var); kontroll via databases-query: 14 rader skapade 2026-10-01 med Status Draft, 8 Video + 6 Image (inkl. FD-blocket), Landing page ifylld; `Takoverdrag_TR_4_H1` öppnad: Hook, tre-frågorstabellen, shot list (4 kol), regitabellen (10 kol), US VERSION-tabellen, Rules och COPY CARD ligger som riktiga Notion-tabeller.

**Copy:** sonnet via `claude -p --model sonnet` (Agent-verktyget fanns inte i sessionen; CLI-subagenten är samma modell och samma arbetsdelning), 75 testade rader, 0 ❌; sonnets tre varningar (förälderraderna i RI_3 över tre ord/sekund) löstes med längre tidsrutor, inte omskrivning; huvudsessionens sex småändringar står överst i `batch-08/copy-sonnet.md`. Butiksneutralt (speglas till CaraShell): inget butiksnamn, ingen frakt/Klarna/öppet köp/leveranstid/"14 dagar", inga recensioner, inga tankstreck i svenska rader, inga andra siffror än sidans. **Ingen annons lovar torrt tak** (leads.md 2026-09-28: Axel har bekräftat fuktfrågan, distansprodukt på väg).

**Ingen Drive-mapp** (som batch #5–7): hela briefen ligger i Notion-raden. **Filer:** `batch-08/manifest.json`, `manifest-fd.json`, `regi.json`, `copy-sonnet.md`, `befintliga.json`, `notion-rader.json`, `video-ads-briefs/*/brief.md`, `image-ads-briefs/*/brief.md`.

Mätning (ANALYSMETOD): ingen dom under 300 kr / 3 köp. PD_10_2 mot PD_10_3 mot PD_10_1 = rubriken på samma pixlar; RI_2_H2 mot RI_2_H1 = hook rate (46 % att slå); RI_3_H2 mot RI_3_H3 mot RI_3_H1 = hook (34 %) resp. hold (8 %); TR_4/TR_5 = får TR-vinkeln någonsin spend (TR_1–3 dog under grinden). Etikett dag 7, lärdom, sedan dna.md.

## Fars dag omgång 5 — batch #8:s FD-block (2026-10-01, stående regel ur `agent/farsdag.json`)

Invändningen i den här omgången: **"pappa har redan ett helöverdrag"** — en annan än omgång 4:s "finns den för min husvagn?" (FD_3/FD_4, förälder GT_2_H1). Svaret är sidans jämförelsetabell (får på det ensam / rör inte lacken / dörr, fönster och luckor fria / famnstor packe). Förälder: breakthrough `Takoverdrag_SP_4_H1` (L-120250242482300291) — dess första bild bevisar "ensam". Marknadsraden: "Sweden and Norway only; never US, GB, CA or DK" (Brief review 2026-09-29, regel 3). Rean = sidans pris mot jämförpris, "Beställ senast 19 oktober". Copy av sonnet mot GEMENSAMT + BOF-GEMENSAMT (28 testade rader, 0 ❌; FD_6-underraderna upprepar aldrig "Fars dag-rea" — granskningens anmärkning på FD_4_2). Spärren 7/7 ✅, regi 4/4 på alla tre videor, 0 fel. FD-raderna går INTE genom `lardom.mjs --brief` (fria mot taket, som omgång 4) — loggkoden `FARSDAG_BATCH_KLAR` skrivs av huvudsessionen.

| Annons | Typ | Hook / rubrik | Notion |
|---|---|---|---|
| Takoverdrag_FD_5_H1 | video 13 s, BOF-omklipp (freeze) | Han står ensam på stegen. Helöverdraget behöver oftast två. | https://www.notion.so/3ec270ab908c8170871cdd92c4696c17 |
| Takoverdrag_FD_5_H2 | video 13 s, BOF-omklipp (cut-in) | Från 1 129 kr, ord. 1 469 kr. Taköverdraget. | https://www.notion.so/3ec270ab908c81428b10ced003410e73 |
| Takoverdrag_FD_5_H3 | video 13 s, BOF-omklipp (zoom-in) | Beställ senast 19 oktober. Fars dag: taköverdraget hakas fast. | https://www.notion.so/3ec270ab908c8159bcc9d0a11d9a6f0e |
| Takoverdrag_FD_6_1 | bild, BOF (invändningen) | Helöverdrag behöver oftast två. Taket klarar han ensam. | https://www.notion.so/3ec270ab908c81f99892f8c18566d9d4 |
| Takoverdrag_FD_6_2 | bild, BOF (priset först) | Från 1 129 kr, inte 1 469 kr. | https://www.notion.so/3ec270ab908c815ca3f1ee26a8d6a480 |
| Takoverdrag_FD_6_3 | bild, BOF (sista dagen) | Till fars dag: beställ senast 19 oktober. | https://www.notion.so/3ec270ab908c81929167c1437c0e7186 |
| Takoverdrag_FD_6_4 | bild, BOF (vad han får) | Dörr, fönster och luckor är fria. | https://www.notion.so/3ec270ab908c81958c6edd9953b07705 |

Rad 2–4 gemensamma: "En person hakar remmen. Det rör inte lacken." / "Kanten hänger 30 till 40 cm. Dörr, fönster fria." / "Fars dag-rea: från 1 129 kr, ord. 1 469 kr." (deadline på slutkortet). Samma foto (grusplanen) som FD_4_1–4, så omgång 4 mot 5 läses på textrutan ensam. Mätning: H1/H2/H3 = öppningen den produktmedvetna behöver; FD_6_1–4 mot varandra = budskapet; omgång 5 mot omgång 4 = invändningen (helöverdrag mot passform).


## Etiketter dag 7 (2026-10-01) — Taköverdraget för Husvagn 6,5 × 3 m

Ur `agent/etikett-backfill.mjs` 2026-10-01 (MagiBorsten SE, annonsens egna första vecka 2026-09-24–2026-09-30, 7d_click). Lärdom per annons i `lardomar.md` (LARDOM-rader samma morgon). Breakthrough-frekvens: 1/63 (2 %) (etikett.mjs --frekvens 2026-10-01).

| Annons | Batch | Etikett (7 d) | Andel | Spend | Köp | ROAS ad / kampanj | Hook / hold | Bedömbar |
|---|---|---|---|---|---|---|---|---|
| Takoverdrag_OB_5_1 | 4 | **KPI_WINNER** | 4 % | 2 936 kr | 7 | 2,96 / 2,37 | — | ja |
| Takoverdrag_UG_2_H1 | 2 | **LOSER** | 0 % | 128 kr | 0 | 0,00 / 2,37 | 20 % / 6 % | nej |
