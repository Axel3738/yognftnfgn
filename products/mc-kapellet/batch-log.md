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
