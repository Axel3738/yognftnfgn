# Batch-log — Adventskalender Racingbilar

Breakthrough-frekvens: 1/33 (3 %) (etikett.mjs --frekvens 2026-09-25)

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

---

## Batch #3 — 2026-09-17 (`/cs`, rond-auto steg 4b, behov `brief_runda`, fokus "ersätt det som pausats i trappan")

**Underlag:** livstidsdata ur Meta 2026-09-17 — 9 232 kr spend, 28 köp,
ROAS 1,78, intäkt 16 445 kr. AOV 587 kr → **break-even-CPA 363 kr**
(BE-ROAS 1,62 ur kampanjnamnet). Grind 300 kr OCH 3 köp.

| Annons | Status | Spend | Andel | Köp | CPA | ROAS | Vinstbidrag |
|---|---|---|---|---|---|---|---|
| PD_2_H1 (video) | PAUSED | 4 243 kr | 46,0 % | 11 | 386 kr | 1,40 | **−250 kr** |
| PD_2_1 (statisk) | PAUSED | 2 973 kr | 32,2 % | 10 | 297 kr | 2,12 | **+657 kr** |
| GT_1_H1 (video) | ACTIVE | 1 115 kr | 12,1 % | 4 | 279 kr | 2,10 | +337 kr |

**Feedbackloop på batch #2:** ingen av de elva är bedömbar. `BF_6_1` är live
med 117 kr och 1 köp, `RV_3_1` 56 kr, `RV_4_1` 31 kr, `PD_9_1` 27 kr — resten
under 20 kr. Hela batch #2:s hypoteser står kvar obesvarade, inklusive
`PD_9_H1` (videon på stillbildens komposition), som är det test den här
batchen ställer om.

**Det som avgjorde batchens innehåll:** de två annonser som bar 78 % av
spenden är avstängda sedan 2026-09-14, båda av spendtjuvsspärren. Det var rätt
för `PD_2_H1` men fel för `PD_2_1`, som över hela livstiden är kampanjens
enda riktiga vinnare (+657 kr). Kampanjen kör nu i praktiken bara på
`GT_1_H1`. Batch #3 bygger därför om chokladkonflikten i båda formaten.
Se `dna.md` 2026-09-17 för hela resonemanget och den metodiska lärdomen.

**Briefer i denna batch — 9 st (3 video, 6 statiska):**

| Annons | Format | Hypotes | Källa |
|---|---|---|---|
| Adventskalender_PD_10_1 | Statisk | Chokladkonflikten återuppbyggd med nya rader på samma helscen — ersätter den pausade vinnaren | PD_2_1 |
| Adventskalender_PD_10_H1 | Video 20–25 s | Samma konflikt som video, men filmad på STILLBILDENS komposition i stället för täta handnärbilder. Avgör om det var formatet eller regin som sänkte PD_2_H1 | PD_2_1 + PD_2_H1 |
| Adventskalender_CO_3_H1 | Video 20–25 s | Konflikten som direkt jämförelse i split-screen: 24 chokladbitar mot 24 bilar, och vad som står kvar den 25:e | Chokladkonflikten, ny mekanism |
| Adventskalender_FM_2_H1 | Video 20–25 s | Morgonritualen som mekanism, dag 1 → dag 24, samma hand och samma bord | Daniels recension nämner exakt detta |
| Adventskalender_BF_7_1 | Statisk | BOF: bara siffran. 499 kr, var 649 kr, 23 % | Produktsidan |
| Adventskalender_BF_8_1 | Statisk | BOF-riskavlastning: 30 dagars öppet köp, Klarna. INGEN fraktclaim — produktsidan har ingen | Produktsidan |
| Adventskalender_BF_9_1 | Statisk | BOF-invändning: åldern, ärligt. 3 år och uppåt, innehåller små delar | Produktsidan |
| Adventskalender_RV_5_1 | Statisk | Recensionsbild, Eriks rad handlar om hans DOTTER — vidgar målgruppen bortom "sonen" | Verifierad recension, ordagrant |
| Adventskalender_RV_6_1 | Statisk | Recensionsbild, Daniels rad namnger morgonritualen | Verifierad recension, ordagrant |

**Backlog:** konkurrentsignalen Familjebutiken Calimero ("gör årets
adventskalender lite ROLIGARE", kalendern som tillägg i stället för
ersättning) ligger kvar oanvänd — den motsäger produktens bevisade
ersättningsvinkel och plockas inte förrän konflikten slutar fungera.

**De tre kvalitetsflaggorna på LIVE-annonser står kvar oåtgärdade**
(`CS_2_1` påhittad brådska, `GT_2_1` fel åldersgräns "under 2 years" + stavfel
"smail", `SP_2_1` recensionscitat som inte finns bland de 10 verifierade).
Ronden rör aldrig en live annons i efterhand — men varje ny brief i den här
batchen bär en regel som förbjuder samma fel, och `BF_9_1` säger åldersgränsen
rätt i klartext.

**Levererat:** samtliga 9 som items i **`BÄVER Adventskalendern Racingbilar`**
(data source `collection://efe270ab-908c-83ef-aa11-87c98e87f5b0`), Status
`Draft`, Typ `Video`/`Image - Pending Approval`, hela briefen i sidan.
Verifierat med SQL mot collectionen: 3 video + 6 bild = 9 i Draft (hubben var
tom före körningen).

**Ingen Drive-mapp skapad.** Hela briefen ligger i Notion-itemet. Skapas mappen
senare: `Batch #3` INUTI produktens befintliga mapp (Joshs,
`1OHOLPsPIHqnY7-4n5tR3MUGeRAn2LJvE`), aldrig i `BÄVER/Products`.

**Modellpolicy:** följd. En sonnet-subagent skrev all svensk copy och körde
tre-frågorstestet rad för rad; huvudsessionen gjorde analysen, hypoteserna,
namngivningen och briefstrukturen.

**Nästa lediga AD-ID:** PD 11, CS 6, GT 4, SP 4, CO 4, AU 2, UG 2, FM 3, TR 3,
RI 2, LI 2, BF 10, RV 7.

---

## Batch #4 — 2026-09-20 (`/cs`, rond-auto steg 4b, behov `brief_runda`, fokus "ersätt det som pausats i trappan")

**Underlag:** livstid 2026-09-20 — 10 791 kr, 35 köp, ROAS 1,91, intäkt
20 637 kr. AOV 590 kr → break-even-CPA 364 kr. Kampanjen ACTIVE, 500 kr/dag.
Full analys i `dna.md` 2026-09-20.

**Feedback-rad i hubben:** ingen rad med Typ `Feedback` i
`BÄVER Adventskalendern Racingbilar` (SQL 2026-09-20). **Annonsidéer:** inga
rader för Adventskalendern.

**Feedbackloop batch #3:** inget bedömbart; PD_10_H1 levererad (Creative strat
review). Namnkrocken CO_3_H1/FM_2_H1 mellan batch #2 och #3 noterad i dna.md.

**Briefer i denna batch — 9 st (3 video + 1 statisk = `rundaAntal 4`, + 3 BOF + 2 recension):**

| Annons | Format | Variabeltaggar | Hypotes | Källa |
|---|---|---|---|---|
| Adventskalender_UG_3_H1 | Video 20–25 s | Angle: konflikt · Format: UGC talking head · Talare: förälder · Scenario: kväll, raden av bilar på hyllan | Bär UGC-formatet eller personen? Andra föräldern, nytt scenario | UG_2_H1 (2 köp, ROAS 4,05) |
| Adventskalender_PD_11_H1 | Video 20–25 s | Angle: demo · Hook: 24 olika bilar · Format: stillbildens komposition, push-in | Isolerar hooken på den komposition som bär (PD_9_H1) | PD_2_1 + PD_9_H1 |
| Adventskalender_GT_4_H1 | Video 20–25 s | Angle: gåva · Hook: recensionsrad ordagrant · Proof: Peter/Sofia | Near-iteration av enda lönsamma aktiva annonsen; bara hooken byts | GT_1_H1 |
| Adventskalender_CO_4_1 | Statisk | Split: 24 dec tom chokladkalender / 24 bilar kvar | Konflikten som bild i vinnarens helscen-stil | Chokladkonflikten |
| Adventskalender_BF_10_1 | BOF | 24 luckor, 24 olika bilar | Antalet som hela bilden | Produktsidan |
| Adventskalender_BF_11_1 | BOF | 5,0 av 5 på 10 recensioner | Verifierat aggregat | Judge.me 2026-09-20 |
| Adventskalender_BF_12_1 | BOF | Hjulen rullar på riktigt, från 3 år | Egenskap + ärlig ålder | Produktsidan |
| Adventskalender_RV_7_1 | Recension | Peter, 5★, ordagrant | — | Judge.me 2026-09-20 |
| Adventskalender_RV_8_1 | Recension | Sofia, 5★, ordagrant | — | Judge.me 2026-09-20 |

**Naming:** upptagna ID avlästa i kontot 2026-09-20: PD ≤ 10, GT ≤ 3, CS ≤ 5,
SP ≤ 3, UG ≤ 2, CO ≤ 3, FM ≤ 2, BF ≤ 9, RV ≤ 6. Nya: UG 3, PD 11, GT 4,
CO 4, BF 10–12, RV 7–8.

**Backlog:** "Andra formatet på UGC-vinkeln" plockad → `[använd i batch #4]`
(UG_3_H1). Calimero-ramningen ligger kvar.

**Levererat:** samtliga 9 som items i **`BÄVER Adventskalendern Racingbilar`**
(`collection://efe270ab-908c-83ef-aa11-87c98e87f5b0`), Status `Draft`, Typ
`Video`/`Image - Pending Approval`. Verifiering i rondens rapport 2026-09-20.
Ingen Drive-mapp skapad.

**Modellpolicy:** följd.

**Nästa lediga AD-ID (läs ändå av kontot först):** PD 12, CS 6, GT 5, SP 4,
CO 5, AU 2, UG 4, FM 3, TR 3, RI 2, LI 2, BF 13, RV 9.

## Etiketter dag 7 (2026-09-21)

Etiketten är ingen dom (dom kräver 300 kr och 3 köp, kolumnen Bedömbar). Räknad på annonsens egna första vecka, backfillad 2026-09-21 ur Meta. Rådata: ETIKETT-raderna i agent/budgetlogg.jsonl.

| Annons | Batch | Typ | Etikett (7 d) | Andel | Spend | Köp | ROAS ad / kampanj | Bedömbar | Playbook |
|---|---|---|---|---|---|---|---|---|---|
| Adventskalender_PD_2_1 | — | okänd | **BREAKTHROUGH** ⚠ nära 30 % | 31 % | 2542 kr | 10 | 2,48 / 1,77 | ja | 80 % vidarebygg på denna: I1 tre hookar → I2 problemdel → I3 in media res |
| Adventskalender_PD_2_H1 | — | okänd | **SPEND_WINNER** | 51 % | 4243 kr | 11 | 1,40 / 1,77 | ja | KPI-fix: LP-byte, proof, kostnad-av-att-vänta — utförandet, inte idén |
| Adventskalender_SP_2_H1 | — | okänd | **INGEN_LEVERANS** | — | 3 kr | 0 | 0,00 / 1,77 | nej | hooken föll — logga och släpp, aldrig ABO |
| Adventskalender_SP_2_1 | — | okänd | **LOSER** | 1 % | 44 kr | 0 | 0,00 / 1,77 | nej | släpp |
| Adventskalender_PD_3_H1 | — | okänd | **LOSER** | 0 % | 31 kr | 0 | 0,00 / 1,77 | nej | släpp |
| Adventskalender_SP_1_H1 | — | okänd | **LOSER** | 0 % | 12 kr | 0 | 0,00 / 1,77 | nej | släpp |
| Adventskalender_SP_3_H1 | — | okänd | **INGEN_LEVERANS** | — | 2 kr | 0 | 0,00 / 1,77 | nej | hooken föll — logga och släpp, aldrig ABO |
| Adventskalender_CS_1_H1 | — | okänd | **INGEN_LEVERANS** | — | 9 kr | 0 | 0,00 / 1,77 | nej | hooken föll — logga och släpp, aldrig ABO |
| Adventskalender_CS_2_1 | — | okänd | **KPI_WINNER** | 1 % | 85 kr | 1 | 5,89 / 1,77 | nej | 3 nya hookar, allt annat lika — den säljer men får inte spend |
| Adventskalender_PD_1_H1 | — | okänd | **LOSER** | 1 % | 58 kr | 0 | 0,00 / 1,77 | nej | släpp |
| Adventskalender_GT_3_H1 | — | okänd | **LOSER** | 0 % | 21 kr | 0 | 0,00 / 1,77 | nej | släpp |
| Adventskalender_GT_2_H1 | — | okänd | **LOSER** | 1 % | 47 kr | 0 | 0,00 / 1,77 | nej | släpp |
| Adventskalender_GT_2_1 | — | okänd | **LOSER** | 1 % | 62 kr | 0 | 0,00 / 1,77 | nej | släpp |
| Adventskalender_GT_1_H1 | — | okänd | **LOSER** | 13 % | 1086 kr | 3 | 1,70 / 1,77 | ja (prel.) | släpp |
| Adventskalender_CS_3_H1 | — | okänd | **LOSER** | 0 % | 11 kr | 0 | 0,00 / 1,77 | nej | släpp |
| Adventskalender_CS_2_H1 | — | okänd | **INGEN_LEVERANS** | — | 4 kr | 0 | 0,00 / 1,77 | nej | hooken föll — logga och släpp, aldrig ABO |

## Etiketter dag 7 (2026-09-22)

Annonser skapade 2026-09-15, egna första veckan 2026-09-15 – 2026-09-21 (7d_click). Etiketten är ingen dom: bedömbar = ≥ 300 kr OCH ≥ 3 köp.

| Annons | Batch | Typ | Etikett (7 d) | Andel | Spend | Köp | ROAS ad / kampanj | Bedömbar | Playbook |
|---|---|---|---|---|---|---|---|---|---|
| Adventskalender_RV_4_1 | 2 | okänd | **LOSER** | 1 % | 37 kr | 0 | 0,00 / 1,83 | nej | släpp |
| Adventskalender_RV_3_1 | 2 | okänd | **KPI_WINNER** | 3 % | 101 kr | 1 | 4,93 / 1,83 | nej | 3 nya hookar, allt annat lika — den säljer men får inte spend |
| Adventskalender_PD_9_1 | 2 | okänd | **LOSER** | 1 % | 44 kr | 0 | 0,00 / 1,83 | nej | släpp |
| Adventskalender_CS_5_1 | 2 | okänd | **INGEN_LEVERANS** | — | 8 kr | 0 | 0,00 / 1,83 | nej | hooken föll — logga och släpp, aldrig ABO |
| Adventskalender_BF_6_1 | 2 | okänd | **KPI_WINNER** | 6 % | 227 kr | 1 | 3,74 / 1,83 | nej | 3 nya hookar, allt annat lika — den säljer men får inte spend |
| Adventskalender_BF_5_1 | 2 | okänd | **LOSER** | 0 % | 16 kr | 0 | 0,00 / 1,83 | nej | släpp |
| Adventskalender_BF_4_1 | 2 | okänd | **LOSER** | 2 % | 80 kr | 0 | 0,00 / 1,83 | nej | släpp |

## Etiketter dag 7 (2026-09-25) — Adventskalendern Racingbilar

Etiketten är ingen dom (`bedombar` står bredvid). Annonsens egna första vecka, 7d_click. Källa: `agent/utdata/etiketter-backfill-2026-09-25.md`.

| Annons | Batch | Typ | Etikett (7 d) | Andel | Spend | Köp | ROAS ad / kampanj | Bedömbar | Playbook |
|---|---|---|---|---|---|---|---|---|---|
| Adventskalender_UG_2_H1 | 2 | okänd | **KPI_WINNER** | 18 % | 560 kr | 2 | 2,41 / 1,65 | nej | 3 nya hookar, allt annat lika — den säljer men får inte spend |
| Adventskalender_PD_9_H1 | 2 | okänd | **KPI_WINNER** | 18 % | 485 kr | 1 | 1,75 / 1,19 | nej | 3 nya hookar, allt annat lika — den säljer men får inte spend |
| Adventskalender_FM_2_H1 | 2 | okänd | **LOSER** | 3 % | 83 kr | 0 | 0,00 / 1,19 | nej | släpp |
| Adventskalender_CO_3_H1 | 2 | okänd | **LOSER** | 2 % | 67 kr | 0 | 0,00 / 1,65 | nej | släpp |
| Adventskalender_PD_10_1 | 3 | okänd | **LOSER** | 1 % | 22 kr | 0 | 0,00 / 1,19 | nej | släpp |
| Adventskalender_BF_9_1 | 3 | okänd | **LOSER** | 0 % | 11 kr | 0 | 0,00 / 1,19 | nej | släpp |
| Adventskalender_BF_8_1 | 3 | okänd | **INGEN_LEVERANS** | — | 9 kr | 0 | 0,00 / 1,19 | nej | hooken föll — logga och släpp, aldrig ABO |
| Adventskalender_BF_7_1 | 3 | okänd | **INGEN_LEVERANS** | — | 3 kr | 0 | 0,00 / 1,19 | nej | hooken föll — logga och släpp, aldrig ABO |
| Adventskalender_RV_6_1 | 3 | okänd | **INGEN_LEVERANS** | — | 1 kr | 0 | 0,00 / 1,19 | nej | hooken föll — logga och släpp, aldrig ABO |
| Adventskalender_RV_5_1 | 3 | okänd | **INGEN_LEVERANS** | — | 1 kr | 0 | 0,00 / 1,19 | nej | hooken föll — logga och släpp, aldrig ABO |

