# Batch-logg — MC-Kapellet

## Batch #0 — originaladsen (launch 2026-08-27, före OS:et)
16 annonser i kampanjen (`PD`, `SP`, `CS`, `G`-serier), en gemensam CBO-kampanj
(1 000 kr/dag). Utfall t.o.m. 2026-09-02 (livstid, `maximum`): 5 020,09 kr
spend, 24 köp, ROAS 2,01 mot break-even 1,49 — kampanjen har klarat testet
och stod 2026-09-02 på 26,8 % vinst av omsättningen de senaste 3 dygnen
(ROAS 2,48, `agent/budgetlogg.jsonl` UPPSKJUTEN_GRANS-rad samma dag).

Tre annonser har passerat signifikansgrinden (≥300 kr + ≥3 köp):
`MC-Kapell_PD_1` (2 434,39 kr, 12 köp, CPA 202,87 kr, vinstbidrag ≈950 kr),
`MC-Kapell_PD_3` (872,12 kr, 6 köp, CPA 145,35 kr, vinstbidrag ≈820 kr),
`MC-Kapell_CS_2_1` (403,55 kr, 4 köp, CPA 100,89 kr, vinstbidrag ≈725 kr).
Se `dna.md` för full FAS 0–10-analys.

## Batch #1 — 2026-09-02 (`/forsta-batch`, automatisk körning via `/rond-auto`)

**Trigger:** `agent/rond.mjs` flaggade produkten som `forsta_batch`-behov —
kampanjen hade passerat 1 500 kr spend och låg på minst 20 % vinst
(26,8 % vid mätning 2026-09-02) utan att ha fått en riktig creative-batch
sedan launch.

**Levererat:** 17 creatives — 6 video + 6 statiska + 3 BOF-statiska +
2 review-statiska (Axels utökade batchkrav 2026-09-02).

| Ad-namn | Koncept | Format | Hypotes (kort) | Källa |
|---|---|---|---|---|
| `MC-Kapell_PD_4_H1` | Demo | Video | Rain-proof payoff tillagd på vinnande PD_1-format, produkten kvar i bild | vinnare PD_1 (nära iteration) |
| `MC-Kapell_PD_5_H1` | Demo | Video | Ny POV-vinkel på PD_3:s sätta-på-mekanism | vinnare PD_3 (hook-iteration) |
| `MC-Kapell_CO_1_H1` | Jämförelse | Video | Ny mekanism: skyddad vs. oskyddad efter en säsong | LP:s egen text ("matt lack, rost på kromet") |
| `MC-Kapell_RI_1_H1` | Risk/kostnad | Video | Ny mekanism: kostnad-av-att-strunta-i-det, inga påhittade siffror | LP:s egen text |
| `MC-Kapell_DE_1_H1` | Funktionsdemo | Video | Samma regn-bevis som förloraren PD_2, men med motorcykeln kvar i bild — isolerar kontext-variabeln | dna.md-hypotes (PD_2-teardown) |
| `MC-Kapell_ID_1_H1` | Identitet | Video | Ny mekanism: pendlare utan garageplats | ny vinkel, gissning märkt |
| `MC-Kapell_LI_1_1` | Listicle | Static | 5-punkts checklista rakt ur LP:s funktionslista | LP:s funktionslista |
| `MC-Kapell_CO_2_1` | Jämförelse | Static | Format-transfer av CO_1_H1 | samma källa som CO_1_H1 |
| `MC-Kapell_SP_4_1` | Social proof | Static | Nytt citat (Linda Berg), skiljer sig från review-serien | Judge.me, verifierad 2026-09-02 |
| `MC-Kapell_PD_6_1` | Mått/demo | Static | Storleksdiagram 218×118,5 cm, adresserar "passar den?"-tvekan | LP:s måttbild |
| `MC-Kapell_DE_2_1` | Funktionsdemo | Static | Kollage av tre verifierade funktioner | LP:s funktionslista |
| `MC-Kapell_RI_2_1` | Risk/kostnad | Static | Format-transfer av RI_1_H1, fact-first | LP:s egen text |
| `MC-Kapell_OF_1_1` | BOF pris/erbjudande | Static | Äkta 40 %-rabatt, ersätter CS_2_1:s overifierbara brådska | Shopify-pris, verifierad 2026-09-02 |
| `MC-Kapell_GA_1_1` | BOF garanti/frakt | Static | 30 dagars öppet köp + fri frakt | LP:s garantitext |
| `MC-Kapell_OB_1_1` | BOF invändning | Static | "Passar den min MC?" löst med mått + garanti | LP:s mått + garanti |
| `MC-Kapell_RE_1_1` | Review | Static | Riktigt citat (Johan Nilsson) | Judge.me, verifierad 2026-09-02 |
| `MC-Kapell_RE_2_1` | Review | Static | Riktigt citat (Andreas Holm) | Judge.me, verifierad 2026-09-02 |

**Ingen ny brief återanvänder CS_2_1:s overifierbara "snart slutsåld/idag
endast"-rad** eller Drive-mappens opublicerade "Tusentals motorcykelägare"-rad
(se dna.md, punkt 5 och "Undvik"). BOF-priset (`OF_1_1`) bär i stället den
verifierbara 349/582 kr-rabatten.

**Launchplan:** Batch #1 launchas i ett eget test-ABO med lika budget per
annons (regel 11 i CLAUDE.md) — INTE i kampanjens befintliga CBO, som redan
koncentrerat 48 % av spenden till `PD_1` och skulle svälta de nya idéerna.

**Modellpolicy-avvikelse:** inget Agent/Task-verktyg med `model`-parameter var
tillgängligt i denna körning (verifierat via verktygssökning) för att spawna
en separat sonnet/haiku-subagent. All copy i denna batch är därför skriven av
huvudsessionen själv, i linje med samma dokumenterade avvikelse för
Kranskydd Frost 420D, Surveillance Camera, Fish rod holder NO och
IBC-Tanköverdraget. Tre-frågorstestet (`docs/copy-regler.md`) är kört rad för
rad i varje brief, direkt i Notion-itemet.

**Leverans:**
- Drive-batchmapp: `Motorcycle cover/Batch #1/` i Joshs befintliga
  produktmapp (id `1hwYK5Qa-Dh4iltlfr4FLyndvlCEHmqI7`), ny undermapp
  `Batch #1` (id `1eLTdYa_SQV6yXVXy_MWb8pcgE3vhXdo1`)
- Notion: ny hub "Motorcycle Cover creative hub" duplicerad från
  "Creative hub MALL", 17 items skapade med Status "Draft", Typ
  "Video - Pending Approval" / "Image - Pending Approval". Hela briefen
  (hook, tre-frågorstest, shot list, regler) ligger i varje item, inte bara
  en länk.
- Loggrad `FORSTA_BATCH_KLAR` skriven i `agent/budgetlogg.jsonl`

**Öppna luckor (se `dna.md`):** ingen extern konkurrentsignal hittad i Meta
Ad Library (bara egna ads), video-primärtext för de fyra äldsta creativen
gick inte att hämta (utanför `ads_get_creatives`-listningen), ingen
`target_cpa_sek` satt.

## Feedbackloop 2026-09-05 (`/cs`, steg 4b i nattronden) — utfall av Batch #1

**Rättelse av instruktionen som startade den här körningen:** uppgiften
antog att en/flera annonser i kampanjen pausats som "spendtjuv" i
åtgärdstrappan senaste veckan. `agent/budgetlogg.jsonl` innehåller ingen
`TRAPPA_FORLANGNING`-rad för `120249990507280291` — enda trappsteget var
`TRAPPA_STEG_1` (2026-08-30), som uttryckligen loggar att ingen annons
pausades. Verifierat direkt mot kontot 2026-09-05: alla ~28 annonser har
`effective_status` ACTIVE. Ingen annons har pausats. Den här batchen är
alltså en vanlig `/cs`-feedbackloop, inte en ersättningsbatch.

**Vad hände med Batch #1:** 11 av 17 briefade annonser (alla statiska/BOF/
review) är live i kontot med data. De 6 videobrieferna (`PD_4_H1`, `PD_5_H1`,
`CO_1_H1`, `RI_1_H1`, `DE_1_H1`, `ID_1_H1`) syns inte i kontot — antingen
inte producerade än eller väntar i Notion. Mekanismen som satte de 11
statiska annonserna live är inte verifierad i loggen.

**Utfall per bedömbar annons (signifikansgrind 300 kr + 3 köp), livstid
`maximum` 2026-09-05:**

| Annons | Spend | Köp | CPA | ROAS | Vinstbidrag (BE-CPA 292 kr) | Hypotes i Batch #1 | Utfall |
|---|---|---|---|---|---|---|---|
| `MC-Kapell_PD_1` | 4 074,64 kr | 19 | 214,45 kr | 2,23 | ≈1 473 kr | Vinnare, benchmark | Höll — fortsatt bäst i kronor, växte från 12→19 köp |
| `MC-Kapell_PD_3` | 1 691,90 kr | 7 | 241,70 kr | 1,59 | ≈352 kr | Vinnare | Höll, växte från 6→7 köp, men ROAS 1,59 ligger nära break-even 1,49 — svagare marginal än PD_1/CS_2_1 |
| `MC-Kapell_CS_2_1` | 1 060,06 kr | 11 | 96,37 kr | 4,08 | ≈2 152 kr | Preliminär vinnare (4 köp i Batch #1, "preliminär" per ANALYSMETOD 2c) | **Bekräftad i andra körningen** — växte 4→11 köp, nu kampanjens bästa CPA. Flyttad till bevisad Winning DNA. |

**"För tidigt"-högen, ingen dom:** `PD_2` (576,86 kr, 1 köp, oförändrat),
`SP_1` (283,63 kr, 1 köp), `MC-Kapell_OF_1_1` (Batch #1-brief, 167,46 kr,
1 köp, ROAS 2,08 — positiv tidig signal för sant erbjudande utan brådska).
Alla övriga Batch #1-annonser i kontot har <170 kr spend, ingen köp — för
lite data för någon slutsats.

**Creative-teardown, 3 mönster (kravet i ANALYSMETOD steg 6b):**
1. **Bevisad (n=2 vinnare + n=1 förlorare):** motorcykel + kapell synliga
   tillsammans, tidigt i klippet, avgör mer än hook/hold-metrik — hook rate
   94–97 % och hold 5,7–8,1 % är i praktiken identiska mellan PD_1/PD_3
   (vinnare) och PD_2 (förlorare). → Instruktion: varje video öppnar med
   motorcykeln synlig, oavsett hook-stil.
2. **Hypotes (n=2, samma mekanism i två format):** en djärv, faktabaserad
   prisrubrik (CS_2_1 statisk) kan vara lika stark som en UGC-demo (PD_1/
   PD_3 video) — CS_2_1:s vinstbidrag per spenderad krona slår båda
   videovinnarna. → Instruktion: testa samma offer-mekanism i videoformat
   (`CS_5_H1`) och isolera rubrikstilen från brådskan i statiskt format
   (`CS_4_1`).
3. **Hypotes (n=1, för tidigt):** ett sant erbjudande utan påhittad brådska
   (`OF_1_1`) presterar minst lika bra som CS_2_1:s overifierbara variant —
   för tidigt för en dom, men stödjer att fortsätta bort från falsk brådska.
   → Instruktion: fler sanna offer-varianter (`OF_2_1`), aldrig återgå till
   overifierbar text.

**dna.md uppdaterad:** break-even-CPA omräknad till 292 kr (från 434,83 kr
viktad AOV / 1,49), CS_2_1 flyttad från "preliminär"/"obevisat" till bevisad
Winning DNA, hold-rate-fyndet stärkt, falsk trappan-premiss dokumenterad,
privat Notion-hub flaggad.

## Batch #2 — 2026-09-05 (`/cs`, automatisk körning via nattronden steg 4b)

**Levererat:** 9 creatives — 3 video + 1 statisk (rundan, `rundaAntal`=4) +
3 BOF-statiska + 2 review-statiska (oanvända riktiga Judge.me-citat).
Veckokvot (2 annonser/vecka, 1 nytt koncept) klart överträffad.

| Ad-namn | Koncept | Format | Hypotes (kort) | Variabeltaggar |
|---|---|---|---|---|
| `MC-Kapell_PD_7_H1` | Pain/risk | Video | Problem-först-öppning på PD_1/PD_3:s bevisade mekanism (mc synlig från sek 0, overifierad brådska undviks) | angle=pain/risk, hook=statement, format=ugc, proof=none, offer=price-endcard |
| `MC-Kapell_CS_5_H1` | Offer | Video | CS_2_1:s prismekanism överförd till video, uttalat pris, ingen falsk brådska | angle=offer, hook=price, format=ugc, proof=none |
| `MC-Kapell_ID_2_H1` | Identitet | Video | Konkretiserad pendlarscen (gatuparkering, ingen carport) på samma bevisade mc-i-bild-mönster | angle=identity, hook=question, format=ugc |
| `MC-Kapell_CS_4_1` | Offer (isolerat test) | Static | Samma djärva layout som CS_2_1 men enbart sanna påståenden — isolerar "bold typografi" från "falsk brådska" | angle=offer, format=product(studio), offer=genuine 40% |
| `MC-Kapell_OF_2_1` | BOF pris/erbjudande | Static | Ny visuell version (genomstruket pris) av det sanna 40%-erbjudandet | angle=offer, format=comparison |
| `MC-Kapell_GA_2_1` | BOF garanti/frakt | Static | Ikon-strip-layout, GA_1_1 fick aldrig nog data (8 kr spend) | angle=authority/guarantee, format=collage |
| `MC-Kapell_OB_2_1` | BOF invändning | Static | Ny invändning: håller den i blåst? — löst med resårkant-faktat | angle=objection, format=product detail |
| `MC-Kapell_RE_3_1` | Review | Static | Riktigt citat (Anna Larsson), oanvänt i tidigare batcher | angle=social proof, proof=recension |
| `MC-Kapell_RE_4_1` | Review | Static | Riktigt citat (Mikael Andersson), oanvänt i tidigare batcher | angle=social proof, proof=recension |

**Modellpolicy-avvikelse:** inget Agent/Task-verktyg med `model`-parameter
tillgängligt i denna körning (verifierat via verktygssökning) för att spawna
en separat sonnet/haiku-subagent. All copy i denna batch är därför skriven
av huvudsessionen själv, i linje med samma dokumenterade avvikelse för
Kranskydd Frost 420D, Övervakningskameran, Fish rod holder NO,
IBC-Tanköverdraget, MC-Kapellet Batch #1, Båtmotorskyddet 420D och Damasker
Vandring. Tre-frågorstestet (`docs/copy-regler.md`) är kört rad för rad i
varje brief, direkt i Notion-itemet.

**Leverans:**
- Drive: ny mapp `Batch #2` skapad i den befintliga produktmappen
  "Motorcycle cover" (`1hwYK5Qa-Dh4iltlfr4FLyndvlCEHmqI7`), id
  `1pTOKKvatcJdGYq6GhC6D5CxrgLKMIgBd`.
- Notion: 9 items skapade i den befintliga hubben "Motorcycle Cover creative
  hub" (`3cf270ab-908c-81c1-bfd2-d78f9a45b3d8`), Status `Draft`, Typ
  `Video - Pending Approval` / `Image - Pending Approval`. Hela briefen
  (hook, tre-frågorstest, shot list/layout, regler, variabeltaggar) ligger i
  varje item — verifierat med `notion-fetch` på `MC-Kapell_PD_7_H1`.
  ⚠️ Hubben har tomt `<ancestor-path>` — ligger privat, inte synlig i
  teamspacet Bäverbutiken. Flaggat för Axel i dna.md, inte åtgärdat.

**Öppna luckor:** se `dna.md` "Öppna luckor att täcka i nästa körning".

## Feedbackloop 2026-09-08 (`/cs`, `/rond-auto`) — utfall av Batch #1 och #2, Batch #3 briefad

**Kampanjstatus:** ACTIVE, verifierat direkt mot kontot innan något gjordes.

**Notion-statuskontroll (obligatorisk innan ny batch byggdes):** samtliga 9
videobriefer från Batch #1 (`PD_4_H1`, `PD_5_H1`, `CO_1_H1`, `RI_1_H1`,
`DE_1_H1`, `ID_1_H1`) OCH Batch #2 (`PD_7_H1`, `CS_5_H1`, `ID_2_H1`) står
fortfarande i status `Creative strat review` — ingen har rört sig sedan de
skapades. Samtliga 17 statiska/BOF/review-items från Batch #1 och #2 står
`Approved` men syns ännu inte i Meta-kontot (Batch #2:s bilder är godkända
men inte uppladdade av `/notionkorning` ännu). Batch #3:s nya koncept är
därför medvetet valda för att INTE upprepa något av de 9 väntande
videokoncepten.

**Utfall per bedömbar annons (signifikansgrind 300 kr + 3 köp), livstid
`maximum` 2026-09-08:**

| Annons | Spend | Köp | CPA | ROAS | Vinstbidrag (annonsens egen AOV/1,49) | Föregående dom | Utfall |
|---|---|---|---|---|---|---|---|
| `MC-Kapell_PD_1` | 5 782,15 kr | 28 | 206,51 kr | 2,24 | ≈2 908 kr | Vinnare, benchmark | Höll — fortsatt starkast i kronor, växte 19→28 köp |
| `MC-Kapell_CS_2_1` | 1 938,91 kr | 17 | 114,05 kr | 3,69 | ≈2 863 kr | Bekräftad vinnare | Höll, växte 11→17 köp, bästa CPA i kampanjen |
| `MC-Kapell_PD_3` | 2 267,10 kr | 8 | 283,39 kr | **1,34** | **≈ −229 kr** | Vinnare (svagare marginal, ROAS 1,59) | **Vände till förlust.** ROAS föll under break-even 1,49 mellan förra och denna avläsning trots +1 köp — spenden växte snabbare än intäkten (CPM 129 kr mot PD_1:s 106 kr, lägre egen-AOV 379,54 kr mot PD_1:s 462,42 kr). Se teardown nedan. |

Break-even-CPA räknas här **per annons på dess egen AOV** (värde/köp ÷ 1,49),
inte på en gemensam blandad AOV — annonsernas AOV skiljer sig äkta (349–462
kr), och en gemensam siffra dolde PD_3:s vändning till förlust i förra
avläsningen. PD_2 (708,46 kr, 1 köp) och SP_1 (316,62 kr, 1 köp) ligger
fortfarande i "för tidigt"-högen, oförändrat. Datakvalitet OK: `amount_spent
× purchase_roas` matchar `omni_purchase_values` på alla sex kontrollerade
rader inom öret.

**Creative-teardown, nytt fynd utöver de tre tidigare bevisade mönstren:**
4. **Ny hypotes (n=1, allvarlig men inte bevisad):** samma bevisade mekanism
   (motorcykel + kapell synliga, verklig miljö) kan ändå tappa marginal när
   spenden skalas på EN specifik klippning — PD_3:s CPM steg och egen-AOV
   sjönk samtidigt som spenden växte, vilket kan vara kreativ utmattning på
   just den filmen snarare än att mekanismen slutat fungera (PD_1, samma
   mekanism men annan klippning, håller fortfarande ROAS 2,24). →
   Instruktion: `PD_8_H1` testar en helt ny inspelning av exakt samma
   bevisade mekanism i ny miljö/modell, isolerat för att skilja
   "utmattad film" från "mekanism funkar inte längre."

**Batch #3 — 2026-09-08 (`/cs`, automatisk körning via `/rond-auto`):**
9 creatives — 3 video + 1 statisk (rundan, rundaAntal=4) + 3 BOF-statiska +
2 review-statiska (nya, oanvända Judge.me-citat).

| Ad-namn | Koncept | Format | Hypotes (kort) | Variabeltaggar |
|---|---|---|---|---|
| `MC-Kapell_PD_8_H1` | Fatigue-test | Video | Ny inspelning av PD_1/PD_3:s bevisade mekanism i ny miljö — isolerar om PD_3:s vändning till förlust beror på filmutmattning | angle=proof, hook=demo, format=ugc, proof=visual-realism |
| `MC-Kapell_FT_1_H1` | Fit/compatibility | Video | Visar kapellet på två olika fordon (motorcykel + elcykel/moped) på kamera — bevisar produktsidans eget påstående "passar de flesta motorcyklar och elcyklar" | angle=objection-fit, hook=demo, format=ugc |
| `MC-Kapell_DE_3_H1` | Installationstid | Video | Tidtagen installationsdemo (stoppur i bild) på produktsidans "cirka en minut"-påstående | angle=convenience, hook=timed-proof, format=ugc |
| `MC-Kapell_UV_1_1` | Material/UV | Static | Enfunktionsbild (vattenavvisande material + UV) i stället för DE_2_1:s trefunktionskollage | angle=feature-deepdive, format=macro |
| `MC-Kapell_OF_3_1` | BOF pris/erbjudande | Static | Rabatt + fri frakt staplade som ett kombinerat värde, ny layout mot OF_1_1/OF_2_1 | angle=offer, format=value-stack |
| `MC-Kapell_GA_3_1` | BOF garanti/frakt | Static | Klarna-delbetalning + öppet köp, oanvänd riktig produktsidefakta | angle=trust, format=payment |
| `MC-Kapell_OB_3_1` | BOF invändning | Static | "Passar den min moped/elcykel?" löst med produktsidans egna ord + mått | angle=objection, format=size-chart |
| `MC-Kapell_RE_5_1` | Review | Static | Riktigt citat (Emma Karlsson), oanvänt i tidigare batcher | angle=social proof, proof=recension |
| `MC-Kapell_RE_6_1` | Review | Static | Riktigt citat (Sara Johansson), oanvänt i tidigare batcher | angle=social proof, proof=recension |

**Riktiga recensioner hämtade direkt från produktsidan** (baverbutiken.se,
10 recensioner, samtliga 5 stjärnor, kontrollerat 2026-09-08). Tidigare
använda: Johan Nilsson, Andreas Holm, Linda Berg (Batch #1), Anna Larsson,
Mikael Andersson (Batch #2). Oanvända och tillgängliga för nästa batch:
Peter Svensson, Daniel Lindström, Maria Eriksson.

**Modellpolicy-avvikelse:** inget Agent/Task-verktyg med `model`-parameter
tillgängligt i denna körning (verifierat via verktygssökning), i linje med
samma dokumenterade avvikelse för samtliga tidigare batcher i det här
repot. All copy skriven av huvudsessionen. Tre-frågorstestet
(`docs/copy-regler.md`) kört rad för rad i varje brief, direkt i
Notion-itemet. Två rader (`GA_3_1`:s Klarna/öppet köp-rader) klarar inte
"kan ingen annan säga det"-testet fullt ut — Klarna och 30 dagars öppet köp
är standard hos i princip alla svenska e-handlare. De skickades ändå
eftersom de är sanna och garanti-vinkeln är obeprövad för produkten, men
flaggas explicit i briefen som informationsrader, inte som
differentieringspåståenden.

**Leverans:**
- Drive: ny mapp `Batch #3` i den befintliga produktmappen "Motorcycle
  cover" (`1hwYK5Qa-Dh4iltlfr4FLyndvlCEHmqI7`), id
  `1srhKWBtM3XdQI8P-QPExF65xj9C42pxC` — 9 brief-filer uppladdade.
- Notion: 9 items skapade i den befintliga hubben "Motorcycle Cover creative
  hub" (`3cf270ab-908c-81c1-bfd2-d78f9a45b3d8`), Status `Draft`, Typ
  `Video - Pending Approval` / `Image - Pending Approval`. Hela briefen
  ligger i varje item — verifierat med `notion-fetch` på `MC-Kapell_PD_8_H1`.
  Hubben ligger fortfarande privat (tomt `<ancestor-path>` mot teamspacet).

**Öppna luckor:** samtliga 9 väntande videobriefer (Batch #1 + #2) behöver
antingen produceras eller flyttas framåt i Notion — nästa körning ska läsa
statuskolumnen igen innan fler videokoncept läggs till, annars växer kön av
obearbetade briefer utan att någon ny data kommer in. PD_3:s vändning till
förlust bör läsas av igen om 3+ dygn (signifikansgrind för marginal-CPA,
ANALYSMETOD 2b) innan den skrivs in som bevisad Losing DNA.

---

## Batch #4 — 2026-09-15 (`/rond-auto` steg 4b, `brief_runda`, `rundaAntal: 4` + 3 BOF)

**Kampanjstatus före batchen:** ACTIVE. Budgeten skalades samma morgon
500 → 600 kr/dag (ROAS 2,90 på 3 dagar mot break-even 1,49).
**Hubben skrevs in i `agent/produktkarta.json` samma dag** — den saknades där
helt, vilket är skälet till att tidigare brief-rundor inte haft en anvisad
plats: "Motorcycle Cover creative hub"
(`collection://632270ab-908c-8307-a318-873192ba664a`), inte arkiverad.

### Feedbackloop — livstid avläst 2026-09-15 (`date_preset: maximum`)

Kampanjen: 16 376,26 kr spend, 76 köp, ROAS 2,01. Break-even-CPA räknas **per
annons på dess egen AOV** (`(intäkt/köp)/1,49`) — regeln från 2026-09-08 gäller
fortfarande och är fortfarande det som avgör domen:

| Annons | Format | Spend | Köp | CPA | ROAS | Egen AOV | Egen BE-CPA | **Vinstbidrag** |
|---|---|---|---|---|---|---|---|---|
| `MC-Kapell_PD_1` (top spender = benchmark) | video | 7 872 | 39 | 202 | 2,30 | 464 | 311 | **4 251 kr** |
| `MC-Kapell_CS_2_1` | statisk | 3 089 | 23 | 134 | 3,07 | 413 | 277 | **3 289 kr** |
| `MC-Kapell_PD_3` | video | 2 540 | 8 | 318 | 1,20 | 379 | 254 | **−512 kr** |

**`PD_3` har vänt till negativt vinstbidrag.** Den var 2026-09-08 på gränsen
(ROAS 1,34); nu ligger den på 1,20 mot break-even 1,49. Det är den enda
bedömbara förloraren i kampanjen och batchens första uppgift är att ersätta den.

Under domgränsen, ingen dom: `PD_2` (732 kr, 1 köp, ROAS 0,48 — samma
varningstecken som i batch #1, fortfarande utan tillräckligt med köp),
`OF_1_1` (392 kr, 2 köp).

**`CS_2_1` är fortfarande produktens effektivaste annons (CPA 134 kr) OCH den
som bär den overifierbara brådskan.** Det isolerade testet från batch #2
(`CS_4_1`) har aldrig fått mätbar spend — CBO:n har svält det. Batchen kör
testet igen som `CS_7_1`, för frågan är fortfarande obesvarad och den är värd
pengar: om det är den djärva typografin och inte lögnen som säljer kan
kampanjens bästa format användas utan risk.

### ⚠️ Recensionsfyndet — inga review-bilder i den här batchen

Judge.me lästes om 2026-09-15 med produktens egna id (2107144758). **Samtliga
10 recensioner har `source: "wizard"` och `verified: "not-yet"`** — seedade,
inte kundröster. Noll organiska recensioner finns.

Review-bilder kan därför inte byggas, samma regel som för Övervakningskameran.
Batchen har 0 review-bilder i stället för 2. ⚠️ Konsekvens bakåt: `RE_1_1`,
`RE_2_1`, `RE_3_1`, `RE_4_1` och `SP_4_1` från batch #1–#3 bygger alla på
wizard-citat och namnen (Johan Nilsson, Andreas Holm, Anna Larsson, Mikael
Andersson, Linda Berg) kommer ur samma seedade uppsättning. De rörs inte, men
Axel bör känna till det.

### Batchen — 7 briefer (3 video + 1 statisk i rundan, 3 BOF-bilder)

| Annons | Format | Hypotes | Isolerad variabel |
|---|---|---|---|
| `MC-Kapell_PD_9_H1` | video | PD_1:s mekanism med ny öppning som visar kostnaden av att låta bli (blekt sadel i sekund 0) — ersätter PD_3 | öppningen |
| `MC-Kapell_CS_6_H1` | video | CS_2_1:s prismekanism i rörlig bild, uttalat pris, noll brådska | falsk brådska borttagen |
| `MC-Kapell_OB_3_H1` | video | Invändningen "blåser den inte av?" löst i bild med resårkanten | ny vinkel, bevisad struktur |
| `MC-Kapell_CS_7_1` | statisk | CS_2_1:s exakta typografi, enbart sanna påståenden — **batchens viktigaste test** | djärv layout isolerad från falsk brådska |
| `MC-Kapell_OF_4_1` | statisk, BOF | 349 kr / ord. 582 kr / spara 233 kr, genomstruket jämförpris | — |
| `MC-Kapell_GA_4_1` | statisk, BOF | garanti och frakt | — |
| `MC-Kapell_OB_4_1` | statisk, BOF | "passar den min hoj?" löst med 218×118 cm som storleksgrafik | — |

**Modellpolicy följd:** all svensk copy skriven av en sonnet-subagent via
Agent-verktyget (till skillnad från batch #1, där verktyget saknades).
Tre-frågorstestet redovisas rad för rad i varje brief.

> ⚠️ **Namnkrock 2026-09-15:** flera av batchens föreslagna AD-ID:n var redan
> upptagna av rader som låg i hubben (inte i Meta-kontot — där fanns de inte).
> Raderna ovan bär de omdöpta, lediga namnen. **Lärdom:** läs av upptagna AD-ID:n
> i BÅDE annonskontot och Notion-hubben innan du numrerar — hubben innehåller
> briefer som aldrig nått kontot, och de äger sitt nummer ändå.

---

## Feedbackloop + batch #4 — 2026-09-18 (`/rond-auto` steg 4b, brief-runda)

**Läget i kampanjen (livstid, avläst 2026-09-18 ur MagiBorsten 1867947880635861):**
18 255 kr spend · 85 köp · livstids-ROAS 2,05 mot break-even 1,49. Dagsbudget 700 kr (oförändrad — VANTA_KADENS).

**Datakvalitet:** `amount_spent × purchase_roas` summerat per annons stämmer mot
kampanjens egen intäkt inom avrundning; annonsurvalet täcker 92 % av kampanjens
spend. `omni_purchase_values` användes INTE (känd bugg, CLAUDE.md). Inga trasiga rader.

**Signifikansgrind (ANALYSMETOD steg 2c):** 3 annonser bedömbara — oförändrat läge sedan batch #3. För tidigt, ingen dom: PD_2 (778 kr/1 köp), OF_1_1 (402 kr/2 köp), SP_3 (380 kr/1 köp), SP_1 (332 kr/1 köp).

**Vinstbidrag — rangordnat på vinst, inte på ROAS eller CPA.**
Break-even-CPA räknas per annons på dess EGEN AOV (`intäkt/köp ÷ break-even-ROAS`),
aldrig på en blandad siffra:

| Annons | Status | Spend | Spend% | Köp | CPA | BE-CPA | ROAS | **Vinstbidrag** |
|---|---|---|---|---|---|---|---|---|
| MC-Kapell_PD_1 (top spender = benchmark) | ACTIVE | 8 812 | 53 % | 47 | 187 | 313 | 2,49 | **+5 889 kr (72 %)** |
| MC-Kapell_CS_2_1 (statisk, bäst CPA) | ACTIVE | 3 368 | 20 % | 23 | 146 | 277 | 2,82 | +3 003 kr |
| MC-Kapell_PD_3 | ACTIVE | 2 699 | 16 % | 8 | 337 | 255 | 1,12 | **−661 kr** |

Summa vinstbidrag i urvalet: **+8 230 kr**.

**Mönster (data skild från hypotes):**
1. **BEVISAD — PD_1 bär produkten ensam.** 53 % av spenden, 72 % av vinsten,
   CPA 187 mot break-even-CPA 313. Instruktion: `PD_10_H1` matar den med färsk
   film och samma resultat-först-struktur.
2. **BEVISAD — PD_3 har slitits ut och går nu back.** Samma mekanik som PD_1
   men ROAS 1,12 mot break-even 1,49, alltså −661 kr. Det är rotorsaken till att
   vinnaren måste matas INNAN den slits ut. Kopiera inte PD_3:s film.
3. **BEVISAD — det feta prisformatet ger kampanjens bästa CPA.** CS_2_1: 146 kr.
   Dess urgency-rad ("IDAG ENDAST / Snart slutsåld") går däremot inte att belägga.
   Instruktion: `CS_8_H1` och `PD_11_1` behåller layouten och stryker lögnen —
   40 %-talet är sant och får stå kvar.
4. **HYPOTES — vintervinkeln är otestad.** Både PD_1 och PD_3 visar en hoj som
   fortfarande används. `OB_5_H1` talar till den som ställer undan den.

**Priset avläst live 2026-09-18** ur butikens produkt-JSON: 349 kr, jämförpris 582 kr → spara 233 kr = 40 %. Måttet på sidan: 218 × 118,5 cm.

### Batch #4 — 7 (3 video + 1 statisk i rundan, 3 BOF-bilder, 0 review-bilder) briefer, alla i Notion som Draft

| Annons | Format | Hypotes | Isolerad variabel |
|---|---|---|---|
| `MC-Kapell_PD_10_H1` | video | PD_1:s struktur med färsk film och ny hook, innan vinnaren slits ut som PD_3 | materialet |
| `MC-Kapell_CS_8_H1` | video | CS_2_1:s feta prislayout i rörlig form, utan urgency-raden | formatet |
| `MC-Kapell_OB_5_H1` | video | vintervinkeln: hojen står stilla oktober–april | vinkeln |
| `MC-Kapell_PD_11_1` | statisk | CS_2_1:s layout med ärlig rubrik, ingen urgency alls | rubriken |
| `MC-Kapell_BOF_1_1` | statisk, BOF | 349 kr mot 582 kr, spara 233 kr | — |
| `MC-Kapell_BOF_2_1` | statisk, BOF | fri frakt, 5–10 arbetsdagar, 30 dagars öppet köp | — |
| `MC-Kapell_BOF_3_1` | statisk, BOF | passformsinvändningen löst med måttet 218 × 118,5 cm | — |

**Inga review-bilder.** 10 recensioner, noll organiska — regeln i den här filen
gäller.

**Modellpolicy följd (CLAUDE.md regel 6):** all svensk copy skriven av en
sonnet-subagent som fick DNA, hypotes, hook, formatkrav och `docs/copy-regler.md`.
Strategi, analys, namngivning och briefstruktur gjordes av huvudsessionen.
Tre-frågorstestet står i varje brief, rad för rad.

**Rättat av huvudsessionen efter subagenten:**
- Två briefer påstod "fri frakt över 300 kr"; ändrat till produktsidans egen
  "Fri frakt inom Sverige".
- `PD_10_H1`:s `Why` sa att PD_3 fallit till ROAS 1,34 — det talet är från
  2026-09-08. Rättat till dagens: livstids-ROAS 1,12 och −661 kr vinstbidrag.
