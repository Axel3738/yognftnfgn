# Creative DNA — IBC-Tanköverdraget

Skapad 2026-09-01 av `/forsta-batch` (körning nr 1, automatisk rutinkörning via
`agent/rond.mjs`-behovet `forsta_batch`). Datakälla: MagiBorsten `1867947880635861`,
kampanj `120250001079150291` ("IBC-Tanköverdraget | BE ROAS 1.51 | Launch
2026-08-28"), livstid 2026-08-28 → 2026-09-01 (hämtat `date_preset: maximum`).

> **RÄTTELSE 2026-09-01 (samma dag, efter Axels invändning).** Den första
> versionen av den här filen innehöll tre falska larm — fel produktsida, fel
> pris och "0 recensioner". Alla tre var fel. Orsak: Shopify-tokenen var
> utgången, så körningen sökte i butiken i stället och tog fel träff.
> Bäverbutiken har **tre** IBC-produkter, och körningen läste kranadaptern
> (419/524 kr) som om den vore kampanjens landningssida. Det var den inte.
> Rättat mot butiken direkt (`baverbutiken.se/search?q=IBC` + produktsidan)
> 2026-09-01. **Lärdom, gäller alla produkter: en produktsida får aldrig
> identifieras genom att söka i butiken och ta första träffen. Utan
> Shopify-åtkomst är produktidentiteten OVERIFIERAD — skriv det, larma inte.**

## Produktfakta (verifierade mot produktsidan 2026-09-01)

- **IBC-tanköverdrag 1000 L – Stoppar Alger & UV**
  (`ibc-tankoverdrag-1000-l-stoppar-alger-uv`), baverbutiken.se.
  Sidan matchar annonserna: överdrag som blockerar ljus och UV, 210D
  Oxford-tyg, blixtlås, öppning upptill för locket, mått 120 × 100 × 116 cm.
- **Pris: 489 kr rea, 636 kr ordinarie (23 % rabatt).** Detta är BEKRÄFTAT
  mot produktsidan — och det är exakt vad CS-annonserna redan säger. Det
  finns inget prisglapp.
- **10 recensioner ligger live**, alla positiva. Social proof är alltså
  tillåten — men "hundratals trädgårdsägare" (SP_1_H1/H2/H3, SP_2_1) är
  fortfarande en överdrift av 10 recensioner och bör skrivas om till något
  som faktiskt går att belägga. Det är en copy-fråga, inte ett larm.
- Break-even-ROAS **1,51×** (ur kampanjnamnet).
  Break-even-CPA = 489 / 1,51 = **323,84 kr**.
- ⚠️ Två andra IBC-produkter finns i butiken och ska INTE förväxlas med den
  här: `ibc-tank-kranadapter-kit-...` (419/524 kr) och
  `ibc-tank-4-vags-fordelaradapter-...` (379/474 kr). Det var den första av
  dem som orsakade rättelsen ovan.

## Datakvalitet

`amount_spent × purchase_roas` användes genomgående (aldrig `omni_purchase_values`,
per CLAUDE.md-varningen). Kampanjsumman (4 188,02 kr, 22 köp) är hämtad direkt på
kampanjnivå — inte summerad manuellt ur adsen (16 annonser, vissa <1 kr spend).
Shopify-admin (lager, order, varianter) kunde INTE nås — token utgången både i
batchkörningen och i rättelsen. Pris, recensioner och produktidentitet är
verifierade mot den publika produktsidan, vilket räcker för copy men inte för
lager- eller ordersiffror.

## Siffrorna (bedömbara annonser, ≥300 kr + ≥3 köp; BE-ROAS 1,51, BE-CPA 323,84 kr)

| Annons | Format | Vinkel | Spend | Andel spend | Köp | CPA | ROAS | **Vinstbidrag*** |
|---|---|---|---|---|---|---|---|---|
| **IBC_PD_1_H1** (benchmark/top spender) | video | produktdemo, inget pris | 3 455,17 kr | 76,3 % | **20** | 172,76 kr | **3,88** | **+3 021 kr** |

*Vinstbidrag = (break-even-CPA − CPA) × köp = (323,84 − 172,76) × 20 = 3 021,60 kr.
Detta är i praktiken hela kampanjens vinst — PD_1_H1 bär allt.
(Första versionen räknade med fel pris, 419 kr, och underskattade därför
vinstbidraget till 2 354 kr.)

**För tidigt (ingen dom, redovisas för mönstret):**

| Annons | Format | Vinkel | Spend | Köp | ROAS | Kommentar |
|---|---|---|---|---|---|---|
| IBC_PD_Extra | video | produktdemo | 57,44 kr | 1 | 8,99 | Bästa hold rate i hela settet (50/27/20 %) men brus på 1 köp |
| IBC_CS_1_H2 | video | rea, korrekt pris | 51,84 kr | 1 | 9,46 | För lite spend för en dom |
| IBC_CS_1_H3 | video | rea, korrekt pris | 275,99 kr | 0 | – | Nära 300 kr-gränsen, 0 köp, svagast hold (14/7/4 %) — lutar mot förlorare |
| IBC_PD_2_1 | statisk | produktdemo | 253,20 kr | 0 | – | Samma copy som vinnaren, aldrig fått nog spend |
| IBC_SP_1_H1/H2/H3, SP_2_1 | video+statisk | social proof | 140,54 kr totalt | 0 | – | Svält — aldrig faktiskt testat |
| IBC_GT_1_H1/H2/H3, GT_2_1 | video+statisk | gåva/present | 34,68 kr totalt | 0 | – | Ren svält, 0,8 % av spenden — aldrig faktiskt testat |

## Winning DNA

1. **Produktdemo utan pris, utan urgency, med EN konkret faktabaserad detalj**
   (210D Oxford-tyg) är den bevisade vinnaren. 20 köp, CPA 172,76 kr, tar 76 %
   av spenden, billigast CPM i hela settet (123,83 kr).
2. **Struktur:** smärtfråga → mekanism kopplad till en verifierbar spec →
   tre ✅-punkter → en enda CTA.
3. **Konkret > vagt.** "210D Oxford-tyg" och "blixtlås på 2 minuter" är fakta
   man kan peka på (copy-regler.md, tre-frågorstestet) — det är sannolikt
   därför CTR (4,05 %) ligger klart över resten av kontot trots låg
   fullvisningsgrad (bara 21,7 % ser 25 % av videon). Hypotes: hooken/texten
   säljer, inte fullvisningen — oprövat men grunden för denna batchs
   near-iteration (se batch-log).

## Losing/rotorsaker (hypotes, delvis konfunderat av budgetsvält)

- **CS (rea/urgency)** — priset i copyn är korrekt (489/636 kr, verifierat).
  CS fick näst mest spend av de svaga vinklarna (327,83 kr) och gav 1 köp.
  Lutar mot svagare än PD, men har inte fått nog spend för en ren dom.
- **SP (social proof)** — svält (140,54 kr). Konceptet är fullt användbart:
  10 riktiga recensioner finns live. Det som ska bytas är påståendets storlek
  ("hundratals" → något som matchar 10 recensioner), inte vinkeln.
- **GT (gåva)** — INTE en förlorare, bara aldrig testad (34,68 kr totalt).
  Denna batch ger den en riktig chans (se IBC_GT_3_H1).

## Behåll alltid / Testa kontrollerat / Undvik / Obevisat

- **Behåll:** PD-vinkelns struktur (fråga → mekanism → 3×✅ → CTA) · 210D
  Oxford-tyg som återkommande, konkret bevisfaktum.
- **Testa kontrollerat:** fact-first hook i stället för pain-first hook
  (IBC_PD_3_H1) · samma vinnande manus som statisk bild (IBC_PD_3_1) ·
  gåva-vinkeln med riktig budget för första gången (IBC_GT_3_H1) · en helt ny
  before/after-jämförelsevisual (IBC_CO_1_1) · SP med en belagd
  recensionsformulering i stället för "hundratals".
- **Undvik:** aggregerade kundsiffror som inte matchar de 10 recensioner som
  faktiskt finns · att döma CS/SP mot PD på nuvarande data (ojämn budget).
- **Obevisat:** allt utom PD_1_H1 — bara en (1) annons har passerat
  signifikansgränsen i denna körning.

## Luckor (fyll före nästa körning)

- Shopify-adminåtkomst (lager, order, varianter): token utgången. Pris och
  recensioner är verifierade mot den publika produktsidan; lager- och
  ordersiffror är det inte.
- Videoinnehåll: analysen bygger på Marketing API:ns copy/caption-fält, inte
  en bildruta-för-bildruta-granskning — video kunde inte öppnas i denna
  session.
- Konkurrenter: bara 1 träff i Meta Ad Library på "IBC tank cover" (Sverige),
  ingen läsbar brödtext — inget användbart swipe-material hittades.

---

## Uppdatering 2026-09-04 (`/cs`-körning, batch #2, automatisk rond-4b, fokus "mata vinnaren")

**Källa:** MagiBorsten `1867947880635861`, kampanj `120250001079150291`, ad-nivå,
`date_preset: maximum`, hämtat 2026-09-04. `amount_spent × purchase_roas`
verifierad mot `omni_purchase_values` på alla rader — matchar exakt (t.ex.
PD_1_H1: 7 980,48 × 3,07734 = 24 558,65 kr = fältets värde). Ingen trasig rad.
Kampanjsumman (9 176,92 kr, 43 köp) matchar summan av alla 18 ads exakt.

**Vinnaren skalas kraftigt.** PD_1_H1 gick från 3 455 kr/20 köp (2026-09-01)
till **7 980,48 kr / 39 köp** på tre dagar — nästan en fördubbling. Den bär nu
**87 % av kampanjens spend och 91 % av köpen (39/43)**. CPA har stigit något
(172,76 → 204,63 kr) i takt med skalningen, väntat enligt ANALYSMETOD.md steg 5
("räkna med regression") — men ligger fortfarande klart under break-even
(323,84 kr) och ROAS (3,08) är stabilt över break-even (1,51).

**Vinstbidragstabell (bedömbara annonser, ≥300 kr + ≥3 köp):**

| Annons | Spend | Andel spend | Köp | CPA | ROAS | Vinstbidrag |
|---|---|---|---|---|---|---|
| **PD_1_H1** (benchmark) | 7 980,48 kr | 87,0 % | 39 | 204,63 kr | 3,08 | **+4 649 kr** |

Ingen annan annons är bedömbar. CS_1_H3 har passerat 300 kr spend (373,74 kr)
men bara 2 köp — under 3-köpsgränsen, kvar i "för tidigt". Alla övriga
(PD_2_1, PD_1_H2/H3, SP_1_H1/H2/H3, SP_2_1, CS_2_1, PD_Extra, CS_1_H2, GT_1_*,
GT_2_1, CO_1_1, PD_3_1) ligger under 300 kr — ren svält, ingen dom.

**Batch #1-uppföljning (feedbackloop):** `IBC_PD_3_H1` och `IBC_GT_3_H1`
(video, briefade 2026-09-01) syns INTE i kontot — redigerarna har inte
producerat dem än. `IBC_PD_3_1` och `IBC_CO_1_1` (statiska) är live men har
fått 3,53 kr respektive 23,56 kr — för lite för någon dom. Ingen av batch #1:s
fyra briefer har alltså gett läsbar data ännu. Ingen hypotes kan bekräftas
eller motbevisas denna körning.

**Produktfakta kompletterade (verifierade mot produktsidan 2026-09-04):**
fri frakt över 300 kr (alltid uppfyllt vid 489 kr), 30 dagars öppet köp med
pengarna tillbaka, Klarna "Få först, betala sen", mått 120×100×116 cm
(standard 1000 L IBC-tank). De 10 recensionerna är nu lästa rad för rad —
7 av 10 är 5 stjärnor, 3 är 4 stjärnor (inte "alla positiva" rakt av som
tidigare skrivning antydde, men samtliga är positiva i sak).

**Winning DNA, tillägg:** vinnarens exakta manus (hook: "Trött på grönt,
algfyllt regnvatten?", struktur fråga→mekanism→3×✅→CTA, inget pris i bild)
är nu extraherat ordagrant ur `ads_get_creatives` och används som bas för
batch #2:s near-iterations i stället för att omskrivas fritt.

**Batch #2 (2026-09-04):** 6 briefer i rundan (4 video: PD_4_H1 fact-first
hook, PD_4_H2 creator-on-camera format, PD_4_H3 12–15s pacing-cut, SP_3_H1
belagd recension; 2 statiska: CS_3_1 rea+fakta, PD_4_1 format-transfer) +
3 BOF (pris, garanti, storleksinvändning) + 2 review-bilder (Maria, Lena —
verbatim). Se `batch-log.md` för fullständig lista och hypoteser.

---

## Uppdatering 2026-09-07 (`/cs`-körning, batch #3, rond-auto, fokus "mata vinnaren")

**Källa:** MagiBorsten `1867947880635861`, kampanj `120250001079150291`, ad-nivå,
`date_preset: maximum`, hämtat 2026-09-07 06:00 UTC. `amount_spent × purchase_roas`
verifierad mot `omni_purchase_values` på alla rader med köp (PD_1_H1, CS_1_H3,
PD_Extra, CS_1_H2) — matchar exakt, ingen trasig rad.

**Vinnaren fortsätter skalas.** PD_1_H1 gick från 7 980 kr/39 köp (2026-09-04) till
**13 753,23 kr / 66 köp** — nästan en fördubbling igen på tre dagar. Bär nu 88,4 %
av kampanjens spend och 95,7 % av de bedömbara köpen. CPA 208,38 kr (upp något från
204,63 kr, väntat vid skalning), ROAS 3,11 — stabilt klart över break-even (1,51/
323,84 kr).

**Nytt: CS_1_H3 är nu bedömbar och lönsam.** 522,99 kr spend, 3 köp, CPA 174,33 kr,
ROAS 4,11, vinstbidrag +448,53 kr. Batch #1/#2:s hypotes "CS lutar mot svagare än
PD" höll INTE — CS är lönsam på den lilla spend den fått. Viktigt fynd vid
creative-teardown: CS_1_H3:s live-copy innehåller påhittad brådska ("IDAG ENDAST",
"lagret krymper snabbt", "många har redan beställt") som inte går att verifiera och
bryter mot regeln om aldrig påhittad urgency. Det riktiga, verifierade priset
(489/636 kr, 23 %) är sannolikt det som konverterar — inte de påhittade raderna.
Ny copy i denna batch (CS_4_H1/CS_4_1) behåller det riktiga priset och tar bort
allt påhittat.

**Vinstbidragstabell (bedömbara annonser, ≥300 kr + ≥3 köp):**

| Annons | Spend | Andel spend | Köp | CPA | ROAS | Vinstbidrag |
|---|---|---|---|---|---|---|
| **PD_1_H1** (benchmark) | 13 753,23 kr | 88,4 % | 66 | 208,38 kr | 3,11 | **+7 620,43 kr** |
| CS_1_H3 | 522,99 kr | 3,4 % | 3 | 174,33 kr | 4,11 | +448,53 kr |

Alla övriga (PD_2_1, PD_1_H2/H3, PD_Extra, CO_1_1, CS_2_1, SP_1_H1/H2/H3, PD_4_1,
BOF_1_1, PD_1_H3, GT_1_H1/H2/H3, CS_3_1, BOF_3_1, SP_2_1, PD_3_1, PD_3_H1, RV_1_1,
RV_2_1, GT_3_H1, BOF_2_1, GT_2_1) ligger under 300 kr spend — ren svält, ingen dom.

**Feedbackloop, batch #1 och #2 (viktigt observandum):** tre batcher i rad
(2026-09-01, -04, -07) och redigerarna har fortfarande inte producerat merparten
av de briefade videorna. `IBC_PD_4_H1`, `IBC_PD_4_H2`, `IBC_PD_4_H3` och
`IBC_SP_3_H1` (batch #2:s fyra videobriefer, 2026-09-04) **finns inte alls i
kontot** tre dagar senare. `IBC_PD_3_H1` och `IBC_GT_3_H1` (batch #1:s video,
2026-09-01) finns i kontot som creatives men har bara 6,01 respektive 4,10 kr
spend — praktiskt taget aldrig lanserade på riktig budget. De statiska brieferna
klarar sig marginellt bättre men ligger också under signifikansgränsen
(PD_3_1: 9,22 kr, CO_1_1: 103,61 kr, PD_4_1: 87,59 kr, CS_3_1: 14,19 kr). Detta
betyder att kontot i praktiken fortfarande bara skalar de TVÅ annonserna från
själva launchen (PD_1_H1, CS_1_H3) — tre batcher av nytt creative-arbete har inte
hunnit generera läsbar data. Detta är ett produktionsflaskhalse-fynd, inte ett
skäl att ändra briefprocessen (se `batch-log.md` för samma observandum, oförändrat
tredje gången).

**Creative-teardown, mönster identifierade denna körning:**

1. **Bevisad (samma annons, tre avläsningar, stabil under kraftig skalning):**
   pain-hook + konkret verifierbar materialfakta (210D Oxford-tyg, 2 minuter,
   öppning upptill) håller CPA under break-even trots att spend nästan
   fördubblats tre körningar i rad (3 455 → 7 980 → 13 753 kr). → Instruktion:
   fortsätt bygga near-iterationer som isolerar EN variabel i taget på detta
   manus (PD_5_H1, PD_5_H2 denna batch).
2. **Hypotes (3 köp, för tidigt för "bevisad"):** ett verifierat, äkta
   prisfaktum (489/636 kr, 23 %) konverterar även utan påhittad brådska —
   CS_1_H3 är lönsam TROTS fabricerade urgency-rader, vilket pekar mot att det
   är prisfaktumet, inte urgencyn, som gör jobbet. → Instruktion: bygg CS-copy
   på PD:s bevisade struktur med det riktiga priset, ta bort all påhittad
   brådska (CS_4_H1/CS_4_1 denna batch).
3. **Compliance-fynd (inte ett vinst-mönster men måste åtgärdas):** CS_1_H3:s
   LIVE-annons i kontot innehåller påhittade urgency-påståenden ("idag endast",
   krympande lager, "många har redan beställt") som aldrig kunde verifieras mot
   någon källa. Detta bryter mot CLAUDE.md regel 3 och copy-reglerna. → Ingen
   ändring gjord i den live-annonsen (utanför denna körnings mandat att skriva i
   Meta), men flaggat till Axel och till nästa batch: skriv aldrig fler rader
   med opreciserad brådska.
4. **Obevisat, inte motbevisat:** GT (gåva) och SP (social proof) har fortfarande
   inte fått någon riktig chans — GT totalt 34,68+4,10+6,01 kr, SP totalt under
   250 kr — efter tre batcher. Produktionsflaskhalsen (se ovan), inte vinkeln,
   är den sannolika förklaringen. → Instruktion: ge GT en ny, konkretare
   inramning (GT_4_H1, gåva till nyinflyttad tankägare i stället för generisk
   "gåva") i stället för att skriva av GT som förlorare.

**Produktfakta kompletterade (verifierade direkt mot produktsidans HTML,
Judge.me server-rendered JSON-LD, 2026-09-07 — inte AI-summering av sidan):**
"På och av med dragkedja — ingen kamp med presenning och gummiband" och
"Presenningen som skulle skydda blåser av vid första höststormen" är sidans
EGNA formuleringar, återanvända ordagrant i denna batchs BOF-serie. Frakt:
"5–10 Arbetsdagar Fri Frakt inom Sverige" (produktsidans egen sales-point-rad,
utan angiven lägsta ordersumma — skiljer sig från den generella "över 300 kr"
som stod i tidigare CLAUDE.md-kontext; produktsidans egen text användes som
facit i BOF_6_1).

**Recensioner — alla 10 lästa ordagrant ur Judge.me:s server-renderade JSON-LD
(inte via sidans AI-sammanfattning, som visade sig trunkera citaten mitt i
meningen och räknade fel antal stjärnor per recension):** Karin (4★), Daniel
(4★), Emma (4★), Magnus (5★), Sofia (5★), Peter (5★), Lena (5★, använd batch
#2), Johan (5★), Maria (5★, använd batch #2), Anders (5★). 7×5★/3×4★ bekräftat.
Sofia och Johan använda i denna batch (RV_3_1, RV_4_1) — Karin, Daniel, Emma,
Magnus, Peter, Anders återstår för framtida batcher.

**Batch #3 (2026-09-07):** 6 briefer i rundan (4 video: PD_5_H1 visuell/
spec-först hook, PD_5_H2 +4:e proof-punkt, CS_4_H1 rea utan påhittad brådska,
GT_4_H1 konkret gåva-koncept; 2 statiska: CS_4_1 format-transfer, PD_5_1
format-transfer) + 3 BOF (installation, cost-of-inaction/storm, frakt) + 2
review-bilder (Sofia, Johan — verbatim). Se `batch-log.md` för fullständig
lista, variabeltaggar och leverans-detaljer.
