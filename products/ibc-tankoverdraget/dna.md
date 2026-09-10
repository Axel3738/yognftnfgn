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

## Winning DNA (uppdaterad 2026-09-10, batch #4)

1. **BEVISAD (4 avläsningar i rad, 2026-09-01 → 2026-09-10, stabil under
   4× spend-skalning 3 455 → 18 729 kr):** produktdemo utan pris, utan
   urgency, med EN konkret faktabaserad detalj (210D Oxford-tyg) är kontots
   bärande vinnare. PD_1_H1: 83 köp, CPA 225,65 kr (mot break-even 323,84 kr).
2. **Struktur (bevisad):** smärtfråga → mekanism kopplad till en verifierbar
   spec → tre ✅-punkter → en enda CTA. Denna struktur är nu även den som
   CS_5_H1/GT_5_H1 byggs på, i stället för produktens egna vinklar.
3. **Konkret > vagt (bevisad).** "210D Oxford-tyg" och "blixtlås på 2 minuter"
   är fakta man kan peka på (copy-regler.md, tre-frågorstestet).
4. **HYPOTES, ny 2026-09-10 (n=1 men stort utslag):** PD_Extra har ORDAGRANT
   samma copy som PD_1_H1 men en betydligt kortare/annorlunda klippt video
   (2,97 MB mot 29,4 MB) och ger CPA 129,45 kr mot 225,65 kr — bästa CPA i
   hela kontot. Går inte att avgöra om det är klipplängden eller den nya
   makro-textur-öppningen (i stället för den breda "smutsig tank"-bilden) som
   driver skillnaden — batch #4 isolerar dem var för sig (PD_6_H1 = kort
   klippning, PD_6_H2 = makro-öppning i full längd). Inte bevisad förrän
   nästa avläsning.

## Losing/rotorsaker (uppdaterad 2026-09-10)

- **CS (rea)** — hypotesen "CS är svagare än PD" höll INTE (motbevisad
  2026-09-07, bekräftad igen 2026-09-10): CS_1_H3 är lönsam (CPA 205,36 kr,
  ROAS 3,49) trots påhittad brådska i copyn. **Compliance-fynd, bevisat på TVÅ
  assets nu:** både video CS_1_H3 och statisk CS_2_1 innehåller påhittade
  urgency-rader ("IDAG ENDAST", "ENDAST FÅ KVAR I LAGER") som bryter mot
  CLAUDE.md regel 3 — ingen av dem rörd (utanför Meta-skrivmandat), flaggat
  till Axel. Ny copy (CS_4_H1/CS_4_1, CS_5_H1/CS_5_1) bygger på det riktiga
  priset utan någon påhittad brådska.
- **SP (social proof)** — fortfarande svält (SP_3_H1: 11,13 kr). Konceptet är
  fullt användbart, aldrig fått en riktig chans.
- **GT (gåva)** — fortfarande INTE en förlorare efter 4 batcher, bara aldrig
  testad på riktig budget (GT_1: 12–15 kr, GT_3_H1: 4,10 kr, GT_4_H1: 0,34 kr).
  Batch #4 ger den en femte, mer konkret chans (GT_5_H1).
- **PRODUKTIONSFLASKHALS (dominerande rotorsak, 4 batcher i rad):** varken
  batch #1:s, #2:s eller #3:s videobriefer har fått mer än enstaka kronor
  spend. Batch #3:s två viktigaste briefer (PD_5_H1, PD_5_H2) finns inte alls
  i kontot. Detta är inte längre en tillfällighet — det är produktens
  huvudsakliga hinder för att lära sig något nytt.

## Behåll alltid / Testa kontrollerat / Undvik / Obevisat (uppdaterad 2026-09-10)

- **Behåll:** PD-vinkelns struktur (fråga → mekanism → 3×✅ → CTA) · 210D
  Oxford-tyg som återkommande, konkret bevisfaktum · inget pris/urgency i
  PD-annonser.
- **Testa kontrollerat:** klipplängd isolerad från öppningsbild (PD_6_H1 vs
  PD_6_H2, batch #4) · ren rea utan påhittad brådska (CS_5_H1/CS_5_1) · gåva
  med konkret mottagarscenario (GT_5_H1) · nya BOF-vinklar (investering/
  UV-åldrande, skugga-invändning, garanti+frakt-kombo).
- **Undvik:** all påhittad brådska/lagerknapphet (bevisat på två assets nu,
  aldrig i ny copy) · att döma CS/SP/GT mot PD på nuvarande data (extremt
  ojämn budget, produktionsflaskhals — inte vinkelsvaghet).
- **Obevisat:** GT och SP efter 4 batcher — flaskhalsen, inte vinkeln, är
  förklaringen. PD_Extra-hypotesen (klipplängd/öppningsbild) — n=1, väntar på
  batch #4:s isolerade test.

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

---

## Uppdatering 2026-09-10 (`/cs`-körning, batch #4, rond-auto, 3 dygn sedan förra batchen)

**Källa:** MagiBorsten `1867947880635861`, kampanj `120250001079150291`
("IBC-Tanköverdraget | BE ROAS 1.51 | Launch 2026-08-28", `effective_status`
kontrollerad ACTIVE före körning), ad-nivå, `date_preset: maximum`, hämtat
2026-09-10. `amount_spent × purchase_roas` verifierad mot `omni_purchase_values`
på alla rader med köp (PD_1_H1, PD_Extra, CS_1_H3, SP_1_H3, CS_1_H2, PD_4_H2) —
matchar exakt, ingen trasig rad. Pris verifierat direkt mot Shopifys publika
produkt-JSON 2026-09-10: 489 kr / 636 kr (23 %), oförändrat sedan launch.
Break-even-CPA = 489 / 1,51 = **323,84 kr** (oförändrad).

**PD_1_H1 fortsätter skalas.** 18 729,23 kr / 83 köp (upp från 13 753 kr / 66
köp 2026-09-07). CPA 225,65 kr (upp från 208,38 kr, väntat vid skalning — se
ANALYSMETOD steg 5), ROAS 2,88 — fortsatt klart över break-even.

**Nytt: PD_Extra är nu bedömbar för första gången.** 906,14 kr, 7 köp, CPA
**129,45 kr — bästa CPA i hela kontot bland bedömbara annonser**, ROAS 3,78.

**Vinstbidragstabell (bedömbara annonser, ≥300 kr + ≥3 köp):**

| Annons | Spend | Andel spend | Köp | CPA | ROAS | Vinstbidrag | Andel vinst |
|---|---|---|---|---|---|---|---|
| **PD_1_H1** (benchmark) | 18 729,23 kr | 84,7 % | 83 | 225,65 kr | 2,88 | **+8 149,77 kr** | 82,6 % |
| PD_Extra | 906,14 kr | 4,1 % | 7 | 129,45 kr | 3,78 | +1 360,73 kr | 13,8 % |
| CS_1_H3 | 616,09 kr | 2,8 % | 3 | 205,36 kr | 3,49 | +355,44 kr | 3,6 % |

Totalt bedömbart vinstbidrag: 9 865,94 kr på 20 251,46 kr spend (93 av 96 köp
i kampanjen — resterande 3 köp sitter på SP_1_H3/CS_1_H2/PD_4_H2, alla under
signifikansgränsen). Alla övriga 33 annonser i kontot ligger under 300 kr
spend — ren svält, ingen dom.

**Creative-teardown (steg 6b) — det viktigaste fyndet denna körning:**
`ads_get_creatives` visar att **PD_Extra har ORDAGRANT samma `body`/`title`
som PD_1_H1** — identisk copy, olika `video_id`. Filstorleken i Drive skiljer
sig kraftigt (PD_Extra 2,97 MB mot PD_1_H1 29,4 MB — grovt en tiondel), vilket
pekar mot en betydligt kortare klippning snarare än bara en annan bildruta.
Thumbnails (granskade visuellt, nedladdade och öppnade): PD_1_H1 öppnar brett
på den nakna, algfyllda tanken (problem-etablering); PD_Extra öppnar tight på
tygets/blixtlåsets textur (makro-crop). Hold rate (p50-visning) skiljer sig
kraftigt: PD_1_H1 8,3 %, PD_Extra 21,4 % — men denna siffra är **inte** ett
rent kreativt bevis, eftersom en kortare video mekaniskt når 50 %-milstolpen
snabbare (samma varning som ANALYSMETOD steg 6 ger om hook/hold ensamt).
CPA-skillnaden (129 mot 226 kr) är däremot en ren affärssiffra, opåverkad av
den mekaniska artefakten, och den är det starkaste beviset i hela denna
körning.

**Mönster identifierade denna körning:**

1. **Bevisad (fjärde avläsningen i rad, samma annons, stabil under kraftig
   skalning):** PD:s struktur (smärtfråga → konkret materialfakta → 3×✅ →
   CTA, inget pris) håller CPA under break-even trots att spend nu
   fyrdubblats sedan launch (3 455 → 7 980 → 13 753 → 18 729 kr). → Fortsätt
   near-iterationer på detta manus.
2. **Ny hypotes (n=1, men stort utslag — 1,7× bättre CPA):** samma copy i en
   markant kortare, tightare klippning ger bättre CPA. Går inte att skilja
   från "annan öppningsbild" på nuvarande data — denna batch isolerar dem var
   för sig (PD_6_H1 = kort klippning, samma manus; PD_6_H2 = full längd, ny
   makro-öppning). → Instruktion: bygg ALDRIG en fri blandning av längd och
   bild i samma test igen.
3. **Bevisad (upprepat compliance-fynd, nu på TVÅ separata assets):**
   påhittad brådska ("IDAG ENDAST", "Lagret krymper snabbt") som flaggades på
   video CS_1_H3 2026-09-07 finns även på den statiska CS_2_1
   ("ENDAST FÅ KVAR I LAGER") — båda är legacy-launchannonser, ingen av dem
   rörd av denna körning (utanför mandatet att skriva i Meta), men flaggat
   till Axel igen. → Ny copy denna batch (CS_5_H1/CS_5_1) bygger vidare på
   CS_1_H3:s bevisade lönsamhet utan någon påhittad brådska.
4. **Produktionsflaskhals, fjärde gången i rad:** batch #3:s två viktigaste
   briefer (PD_5_H1, PD_5_H2 — near-iterationerna som skulle testa mönster 1)
   syns INTE ALLS i kontot — inte ens 0-spend-rader, de är aldrig skapade.
   CS_4_H1/CS_4_1/GT_4_H1 finns men med 0,34–4,07 kr spend. → Denna batch
   byggs på nya AD-ID (PD_6/CS_5/BOF_7–9/RV_5–6) i stället för att vänta,
   enligt Axels stående princip "hellre några för mycket" — men detta är nu
   det mest akuta enskilda problemet för produkten: ingen ny hypotes sedan
   PD_1_H1/PD_Extra/CS_1_H3 har fått en riktig chans på fyra körningar.

**Recensioner — 2 nya lästa ordagrant ur Judge.me JSON-LD 2026-09-10** (samma
metod som 2026-09-07, server-renderad, inte AI-sammanfattning): **Magnus**
(5★, "Bra material och känns stabilt. Lätt att montera på tanken.") och
**Peter** (5★, "Ett enkelt och praktiskt överdrag. Jag är väldigt nöjd med
köpet.") — använda i RV_5_1/RV_6_1. Karin, Daniel, Emma, Anders återstår.

**Batch #4 (2026-09-10):** 6 briefer i rundan (4 video: PD_6_H1 kort
klippning/isolerar längd, PD_6_H2 makro-öppning/isolerar bild, CS_5_H1 ren rea
utan påhittad brådska, GT_5_H1 konkret gåva-koncept; 2 statiska: PD_6_1
format-transfer, CS_5_1 format-transfer) + 3 BOF (investering/UV-åldrande,
skugga-invändning, riskfri-kombo garanti+frakt) + 2 review-bilder (Magnus,
Peter — verbatim). Se `batch-log.md` för fullständig lista och variabeltaggar.
