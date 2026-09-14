# Batch-log — Adventskalender Racingbilar

## Batch #1 — 2026-09-10 (`/forsta-batch`, automatisk körning via `/rond-auto` steg 4b)

**Trigger:** `agent/rond.mjs`-behovet `forsta_batch` — kampanjen hade passerat
1 500 kr (1 991,70 kr) och låg på ~36 % vinstmarginal (ROAS 3,587 mot
break-even 1,62) enligt morgonens `/rond-auto`-körning 2026-09-10, utan att
någonsin ha fått en riktig brief-runda. Produkten saknade helt minnesfiler
och egen Notion-hub — byggt från grunden i denna körning.

Kampanjstatus verifierad ACTIVE direkt innan batchen skrevs
(`effective_status: ACTIVE`, campaign `120250134672020291`).

**Full FAS 0–10-analys:** se `dna.md` i den här mappen + Google Doc i
Drive-batchmappen ("Adventskalender Racingbilar — Batch #1 analys
(FAS 0–10)").

**Datakvalitet i korthet:** kampanjen är bara ~2 dygn gammal. Bara 1 av 16
launchade annonser (`PD_2_1`) är bedömbar (≥300 kr + ≥3 köp) — ROAS 4,646 på
7 köp, vinstbidrag +1 122 kr. Två annonser till (`GT_1_H1`, `PD_2_H1`) har
2 köp vardera — preliminärt, ingen dom (ANALYSMETOD 2c). Se `dna.md` för
fulla tabeller.

**Kvalitetsflaggor hittade på redan LIVE-annonser (rörs inte av detta flöde,
flaggade till Axel):**
- `GT_2_1`: fel åldersgräns ("under 2 years" i stället för produktsidans
  3 år) + stavfelet "smail" i stället för "small".
- `SP_2_1`: ett recensionscitat ("Bästa kalendern vi köpt – han sprang ut ur
  sängen...") som INTE finns i de 10 verifierade recensionerna — ser
  påhittat ut.
- `CS_2_1`: påhittad brådska ("BEGRÄNSAT LAGER – SLUT INNAN JUL"). **Denna
  ÅTGÄRDADES i batchen** via `CS_4_1` (samma äkta rabatt, ingen påhittad
  brådska) — samma mönster som Båtmotorskyddets `CS_2_1`→`CS_4_1`-fix.

**Levererat: 20 briefer** — 9 video (3 variationer på vinnaren PD_2_1 + 6 nya
videokoncept) + 11 statiska (6 nya koncept + 3 BOF-bilder + 2 recensionsbilder
med riktiga citat).

| Annons | Format | Koncept | Hypotes / källa |
|---|---|---|---|
| Adventskalender_PD_4_H1 | Video | Nära iteration av vinnaren (PD_2_1, ROAS 4,65) | Samma hook som VO, döra-för-dörra-demo. Källa: kontots enda bedömbara vinnare. |
| Adventskalender_PD_5_H1 | Video | Formatöverföring (samma vinnande bild som video) | Isolerar om stillbilden bär resultatet, eller om rörelse hjälper. Källa: samma vinnare. |
| Adventskalender_PD_6_H1 | Video | Ny vinkel (pris/värde), samma visuella koncept | Isolerar om den vinnande BILDEN bär ett annat budskap. Källa: samma vinnare. |
| Adventskalender_AU_1_H1 | Video | Auktoritet/kvalitet-demo (NY vinkel) | Adresserar "är det här Temu-skräp"-invändningen, obehandlad av launch-batchens 4 vinklar. |
| Adventskalender_UG_1_H1 | Video | UGC talande förälder (NYTT format) | Inget av de 16 launchade annonserna använder talking-head. |
| Adventskalender_FM_1_H1 | Video | Familjeritual (lånad mekanism) | Båtmotorskyddets FM_1_H1 (kontots bästa hook/hold, 42,8 %/60,3 %) transfererad hit. |
| Adventskalender_CO_1_H1 | Video | Jämförelse split-screen (NY vinkel) | Starkaste visualiseringen av "håller vs försvinner"-claimet hittills. |
| Adventskalender_TR_1_H1 | Video | Aggregerad social proof-VO (NY, korrigerande) | Använder de 10 riktiga recensionerna — kontrast till SP_2_1:s misstänkt påhittade citat. |
| Adventskalender_RI_1_H1 | Video | Ärlig leveranstids-risk (NY, korrigerande) | Ersätter behovet av påhittad brådska med en verklig, verifierbar leveranstidsram. |
| Adventskalender_PD_7_1 | Statisk | Demo/feature-collage | Billig statisk variant av den bevisade PD-vinkeln. |
| Adventskalender_CO_2_1 | Statisk | Jämförelse (choklad i soporna vs bilarna kvar) | Statisk version av CO_1_H1. |
| Adventskalender_TR_2_1 | Statisk | Aggregerat betyg (10 av 10, 5 stjärnor) | Verifierad siffra ur recensionsfilen. |
| Adventskalender_LI_1_1 | Statisk | Listicle, 5 verifierade fakta | Inga adjektiv, bara specs. |
| Adventskalender_CS_4_1 | Statisk | Ärligt erbjudande (ersätter CS_2_1) | Samma äkta 23 %-rabatt, ingen påhittad brådska. |
| Adventskalender_RI_1_1 | Statisk | Risk/kostnad av att vänta (ärlig leveranstid) | Statisk version av RI_1_H1. |
| Adventskalender_BF_1_1 | BOF-statisk | Pris/erbjudande | Axels BOF-serie. |
| Adventskalender_BF_2_1 | BOF-statisk | Garanti/Klarna (ingen fri frakt-claim) | 30 dagars öppet köp, verifierat mot produktsidan. |
| Adventskalender_BF_3_1 | BOF-statisk | Invändning (åldersgräns 3+) omvänd till målgruppsklarhet | Verifierad säkerhetsfakta, korrekt 3 år (till skillnad från GT_2_1). |
| Adventskalender_RV_1_1 | Recensionsbild | Verbatim citat (Anna) | Drive-CSV, verifierat 2026-09-10. |
| Adventskalender_RV_2_1 | Recensionsbild | Verbatim citat (Johan) | Drive-CSV, verifierat 2026-09-10. |

**Naming:** upptagna AD-ID:n avlästa direkt ur Meta (ad-nivå, hela kampanjen)
innan numrering. Befintliga koder/ID: `PD_1(H1)`, `PD_2(_1,H1)`, `PD_3(H1)`,
`GT_1(H1)`, `GT_2(_1,H1)`, `GT_3(H1)`, `CS_1(H1)`, `CS_2(_1,H1)`, `CS_3(H1)`,
`SP_1(H1)`, `SP_2(_1,H1)`, `SP_3(H1)` — alla launch-batchens (2026-09-07/08).
Nya: `PD_4`–`PD_7` (bumpat under befintlig PD-kod), `CS_4` (bumpat),
samt helt nya koder `AU_1`, `UG_1`, `FM_1`, `CO_1`–`CO_2`, `TR_1`–`TR_2`,
`RI_1`, `LI_1`, `BF_1`–`BF_3`, `RV_1`–`RV_2`.

**Videoandel i kärnbatchen (FAS7+8+9, 15 poster):** 9 video / 6 statisk = 60 %,
under den formella 2/3-regeln men samma dokumenterade avvikelse som
Båtmotorskyddets batch #1 (60 %) — FAS9 är per definition rena statiska
koncept (demo/jämförelse/testimonial/listicle/offer/risk), så strukturen kan
inte nå 67 % utan att bryta FAS-specen. BOF (3) + recension (2) räknas
utanför kärnbatchen per Axels egen regel.

**Leverans:**
- Notion: ny hub **"Racing Car Advent Calendar creative hub"**
  (id `3d7270ab-908c-81b2-ad69-cf7404a62c4e`, data source
  `c19270ab-908c-834c-bf90-874ce69e0381`, duplicerad från Creative hub MALL).
  20 items skapade, Status Draft, Typ Video/Image - Pending Approval, hela
  briefen inklistrad i sidan (verifierat: hämtade `Adventskalender_PD_4_H1`
  med notion-fetch och läste tillbaka Make/Format/Why/Hook/tre-frågorstest/
  shot list/Rules — allt fanns).
- Drive: Josh's befintliga produktmapp " Adventskalender Racingbilar"
  (`1OHOLPsPIHqnY7-4n5tR3MUGeRAn2LJvE`) → ny mapp **"Batch #1"**
  (`1j0QAGfifgu0or1PvspIPfujgBHy7A9Lt`) med analysdokumentet "Adventskalender
  Racingbilar — Batch #1 analys (FAS 0–10)".
- Modellpolicy-avvikelse: inget Agent/Task-verktyg med `model`-parameter var
  tillgängligt i denna körning (verifierat via ToolSearch). Huvudsessionen
  skrev all copy själv och körde tre-frågorstestet (docs/copy-regler.md)
  explicit per rad i varje brief — samma dokumenterade avvikelse som övriga
  produkter i kontot.
- `products/adventskalender-racingbilar/dna.md` och `backlog.md` skrivna i
  samma körning. `agent/produktkarta.json` uppdaterad med hub-id + Drive-id.
  `agent/budgetlogg.jsonl` fick en rad `FORSTA_BATCH_KLAR` för kampanjen.
  Allt committat och pushat av huvudsessionen till
  `claude/daily-agent-discussion-uos5df`.

⚠️ **Shopify MCP var nere** ("requires re-authorization (token expired)")
under hela körningen. Löst genom att läsa produktens publika storefront-JSON
(`baverbutiken.se/products/<handle>.json`) direkt — pris/jämförpris
dubbelkollat den vägen i stället. Ingen data hittades på gissning.

---

## Batch #2 — 2026-09-14 (`/cs`, på Axels begäran efter att han skapat nya hubbar)

**Trigger:** Axel skapade sex nya `BÄVER …`-hubbar i Notion och bad om creative
strategy för fyra produkter i samma vända. Adventskalendern var en av dem.
Samma morgon startade han om kampanjen för hand efter att ronden stängt av den.

**Underlag:** livstidsdata ur Meta 2026-09-14 — 7 505 kr spend, 24 köp,
ROAS 1,88, intäkt 14 100 kr. AOV 588 kr → **break-even-CPA 363 kr**
(break-even-ROAS 1,62 ur kampanjnamnet). Grind 300 kr / 3 köp.

| Annons | Spend | Andel | Köp | CPA | ROAS | Vinstbidrag |
|---|---|---|---|---|---|---|
| PD_2_1 (statisk) | 1 906 kr | 25 % | 9 | 212 kr | 3,04 | **1 359 kr (72 %)** |
| PD_2_H1 (video) | 4 239 kr | 56 % | 11 | 385 kr | 1,41 | −246 kr |
| GT_1_H1 (video) | 1 012 kr | 13 % | 3 | 337 kr | 1,82 | 76 kr |

**Detta är exakt fallet som spendtjuvsspärren finns för.** `PD_2_H1` åt 56 % av
spenden under break-even medan den statiska tvillingen `PD_2_1` bar hela
vinsten. Den gamla regeln letade bara efter en spendtjuv med noll köp och
missade därför den här — `PD_2_H1` har 11 köp. `agent/spendtjuv.mjs` fångar den
nu. Se rättelseraden i `agent/budgetlogg.jsonl` 2026-09-14.

**Briefer i denna batch — 11 st (4 video, 7 statiska):**

| Annons | Format | Hypotes | Källa |
|---|---|---|---|
| Adventskalender_PD_9_1 | Statisk | Vinnaren itererad med samma chokladkonflikt men ny komposition: bilarna uppradade så att man ser att de är 24 | PD_2_1, kampanjens vinnare |
| Adventskalender_CS_5_1 | Statisk | Prisankare utan påhittad brådska — ersätter CS_2_1:s "BEGRÄNSAT LAGER – SLUT INNAN JUL" | CS_2_1, brådskan borttagen |
| Adventskalender_PD_9_H1 | Video | Videon tappade helscenen. Bygg den på den vinnande stillbildens komposition i stället för på handnärbilder | PD_2_1 + PD_2_H1:s utfall |
| Adventskalender_CO_3_H1 | Video | Konflikten visuell: chokladkalendern tom och i soporna den 24:e, bilarna kvar på hyllan | Vinnarvinkeln, visualiserad |
| Adventskalender_FM_2_H1 | Video | Familjeritualen dag 1 → dag 24, mekanismen är tid | Båtmotorskyddets FM_1_H1, kontots bästa hook/hold |
| Adventskalender_UG_2_H1 | Video | UGC med en förälder — inget launchmaterial har en talande person | Luckan i kontot |
| Adventskalender_BF_4_1 | Statisk | BOF: priset ensamt | — |
| Adventskalender_BF_5_1 | Statisk | BOF: fri frakt, öppet köp, Klarna — nu belagt på sidan | Produktsidan |
| Adventskalender_BF_6_1 | Statisk | BOF: åldersgränsen 3 år som målgruppsklarhet — rättar samtidigt GT_2_1 som anger fel ålder | Produktsidan |
| Adventskalender_RV_3_1 | Statisk | Saras recension stödjer vinnarvinkeln oberoende — hon kallar den själv ett alternativ till godis | Verifierad recension |
| Adventskalender_RV_4_1 | Statisk | Emmas recension pekar på den dagliga upprepningen, samma mekanism som familjeritualen | Verifierad recension |

**Levererat:** samtliga 11 som items i **`BÄVER Adventskalendern Racingbilar`**
(data source `collection://efe270ab-908c-83ef-aa11-87c98e87f5b0`), Status
`Draft`, Typ `Video`/`Image - Pending Approval`, hela briefen i sidan.
Verifierat med SQL mot collectionen: 4 video + 7 bild = 11, alla `Draft`.

⚠️ **Produkten har nu TVÅ hubbar.** Batch #1 (20 briefer) ligger i hubben från
2026-09-10 (data source `c19270ab-908c-834c-bf90-874ce69e0381`); batch #2 i
`BÄVER Adventskalendern Racingbilar`, som Axel själv skapade 2026-09-14 och
uttryckligen pekade ut. Skapa aldrig en tredje.

**Modellpolicy:** följd denna gång — en sonnet-subagent per brief skrev copyn
och körde tre-frågorstestet per rad. (Avvikelsen i batch #1 berodde på att
Agent-verktyget saknades i den körningen.)
