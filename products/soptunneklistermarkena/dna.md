# Creative DNA — Soptunneklistermärkena

Skapad 2026-09-03 av `/rond-auto` steg 4b (`brief_runda`-behov, `rundaAntal: 4`,
14 dagar sedan senaste batchen). Produkten saknade helt minnesfiler
(`products/soptunneklistermarkena/` fanns inte, tom träff i `git log --all`)
trots att den redan haft riktig spend och batcher — körningen är alltså en
**retroaktiv upphämtning** (samma mönster som `cs.md` punkt 1b), loggad som
`CS_BATCH_KLAR` (inte `FORSTA_BATCH_KLAR` — produkten är inte ny).

Datakälla: MagiBorsten `1867947880635861`, kampanj
`120249952968210291` ("Soptunneklistermärkena | BE ROAS 1.67 | Launch
2026-08-21"), `date_preset: maximum` (livstid) + `last_3d`, fälten
`amount_spent`, `actions:omni_purchase`, `cost_per_omni_purchase`,
`purchase_roas`, `effective_status`, `impressions`, `ctr`, `cpm`, `frequency`,
`video_play_actions`, `video_p50_watched_actions` — aldrig
`omni_purchase_values`.

## Produktfakta (verifierade)

- **Klistermärken för Soptunnan – 4-pack Tecknade Motiv**
  (`klistermarken-for-soptunnan-4-pack-tecknade-motiv`), Bäverbutiken.
- **Pris 199 kr. Inget jämförpris/rabatt synligt på sidan — "Rabatt: Ingen
  rabatt synlig".** Verifierat via `WebFetch` av den publika produktsidan
  2026-09-03 (Shopify-connectorn i den här sessionen pekar på fel butik,
  se datakvalitet nedan).
- 4 motiv: gapskratt, tunga ute, leende, gråtande. Material PVC, slät
  avtorkningsbar yta, platt 2D-tryck, självhäftande baksida — inga verktyg
  behövs. Kan även användas på kylskåp, dörrar och skåpluckor.
- Leverans 5–10 arbetsdagar, Klarna (betala senare), 30 dagars
  nöjd-kund-garanti. Fri frakt över 300 kr sitewide (produkten själv
  når INTE tröskeln vid ett enda köp — nämn aldrig "fri frakt" utan villkoret).
- Break-even-ROAS **1,67×** (ur kampanjnamnet). Break-even-CPA
  199/1,67 ≈ **119 kr**.
- **BLOCKER-fynd:** en befintlig annons i kontot (`Soptunneklistermarken_CS_Bild`)
  påstår **"50% RABATT – IDAG"** och **"Endast 199 kr – snart slutsåld"** i
  själva bilden. Ingen av delarna stämmer mot landningssidan (inget
  jämförpris, ingen lagerknapphet nämnd) — ett äkta erbjudande-integritetsbrott
  (arbetsregel 7). Annonsen är redan pausad av Axel/kontot och är dessutom
  kampanjens sämsta bedömbara annons (se nedan) — **ingen ny copy i denna
  batch återanvänder det mönstret.**

## Datakvalitet

⚠️ **`mcp__Shopify__*` i den här sessionen är kopplad till fel butik**
(TwinPillow, `twinpillow.se` — verifierat med `get-shop-info`), inte
Bäverbutiken. Produktdata hämtades i stället via `WebFetch` av den publika
produktsidan (pris, USP, leveransvillkor). **Recensionerna korskördes mot
Judge.me:s REST-API direkt** (`JUDGEME_API_TOKEN` + `JUDGEME_SHOP_DOMAIN` i
miljön, filtrerat på `product_handle` klientsidan eftersom API:ts eget
`product_handle`-filter ignorerades av tjänsten) — **8 äkta recensioner
hittade och verifierade, 7×5★ + 1×4★**, alla ordagrant citerbara. Detta är en
starkare källa än sidans widget och används som facit i denna batch.

`amount_spent × purchase_roas` kontrollerad mot `cost_per_omni_purchase` för
alla annonser med köp — stämmer exakt överallt (t.ex. PD_Bild_03:
6 576,06 × 2,555977 / 62 köp ≈ 271 kr/köp, `cost_per_omni_purchase` 106,07 kr
= 6 576,06/62, konsekvent). Inget tecken på den kända
`omni_purchase_values`-buggen eftersom fältet aldrig hämtades.

**Verklig AOV per köp (räknat: ROAS × CPA) ligger på ~271 kr för
toppannonsen — högre än styckpriset 199 kr.** Sannolikt flerpack/tillägg i
kundvagnen. Break-even-ROAS (AOV-oberoende) används därför för kill-beslut,
inte enstycks-CPA:n rakt av — samma princip som Damasker Vandring.

## Siffrorna (livstid, `date_preset: maximum`, BE-ROAS 1,67)

Signifikansgrind: ≥300 kr spend OCH ≥3 köp. Av 29 annonser i kampanjen
passerar **bara två** grinden.

| Annons | Format | Spend | Andel spend | Köp | CPA | ROAS | **Vinstbidrag*** | Status |
|---|---|---|---|---|---|---|---|---|
| **Soptunneklistermarken_PD_Bild_03_sophamtningsdag** (benchmark/top spender) | bild | 6 576,06 kr | 73,5 % | **62** | 106,07 kr | **2,56** | **≈+3 489 kr** | ACTIVE |
| Soptunneklistermarken_CS_Bild | bild | 1 501,55 kr | 16,8 % | 5 | 300,31 kr | 0,89 | **≈−705 kr** | PAUSED (redan) |

*Vinstbidrag = spend × (ROAS/1,67 − 1) — ROAS-baserad, AOV-oberoende (samma
metod som Damasker Vandring, se ANALYSMETOD steg 4).

**Kampanjens totala vinstbidrag (alla 29 annonser, inkl. de under grinden):
≈+2 649 kr av 8 942,70 kr total spend (~29,6 % av spenden).** PD_Bild_03 bär
mer än 100 % av kampanjens vinst (CS_Bild och den obedömbara svansen äter upp
resten). Senaste 3 dagarna (avläst av ronden samma dag): 3 107,31 kr spend,
ROAS 2,50, 28 köp — profilen är densamma, PD_Bild_03 ensam står för
3 065,68 kr av de 3 107,31 kr.

**För tidigt (ingen dom, redovisas för mönstret):**

| Annons | Format | Spend | Köp | ROAS | Vinstbidrag | Kommentar |
|---|---|---|---|---|---|---|
| Soptunneklistermarken_PD_1 | video (UGC-applicering) | 441,49 kr | 1 | 0,56 | −293 kr | Under köpgrinden, PAUSED |
| Soptunneklistermarken_CS_1 | video | 136,43 kr | 2 | 3,49 | +149 kr | Under spendgrinden, ser bra ut men <3 köp |
| Soptunneklistermarken_PD_2 | video | 22,70 kr | 1 | 10,93 | +126 kr | Brus — enstaka köp på nästan ingen spend |
| Soptunneklistermarken_PD_Bild_08_vinter-sno | bild | 8,49 kr | 1 | 29,21 | +140 kr | Brus, samma mönster |
| Övriga 24 annonser (PD_Bild_01/02/04–07/09–13, CS_2/3, SP_1–3, SP_Bild, G_1–3, G_Bild) | bild+video | 0,17–65,19 kr vardera | 0 | – | negativt (obetydligt) | CBO-svält — bulk-bildpipelinens svans och originalvideorna (SP/G/CS) har aldrig fått en riktig chans |

## Creative-teardown (steg 6b)

**Bildgranskning gjord på riktigt** via `ads_get_ad_preview` (Meta självt,
ingen Drive-åtkomst behövdes för de bedömbara annonserna). Video-manus för
PD_1 kunde inte läsas ur någon egen brief (ingen fanns — produkten hade inget
minne) men annonsen kunde ses direkt via samma verktyg.

1. **Bevisad: rena "family shot"-lifestylebilder utan text slår
   rabattgrafik med text.** PD_Bild_03 visar sex soptunnor i rad längs ett
   vitt staket i en riktig svensk trädgård, var och en med ett annat uttryck
   (blinkande, tunga ute, chockad, gråtande) — **noll text i bilden.**
   CS_Bild är en dramatisk stockfoto-bakgrund (ljusstrålar) med stor text
   "50% RABATT – IDAG" / "Endast 199 kr – snart slutsåld" över en enda tunna.
   CPA 106 kr mot 300 kr — nästan 3× skillnad, och CS_Bild:s påstådda rabatt
   existerar inte på landningssidan (se BLOCKER ovan). **Instruktion till
   nästa batch: inga fabricerade rabatt-/lagerknapphetsclaims, låt produkten
   och sammanhanget bära budskapet.**
2. **Bevisad (samma mönster i två bilder): flera tunnor med olika uttryck
   visade TILLSAMMANS i en verklig trädgårdsmiljö säljer själva nyttan
   (att kunna skilja tunnorna åt) visuellt, utan att behöva förklara den i
   text.** PD_Bild_03 (6 tunnor) är vinnaren; PD_Bild_05_applicering-hand
   (3 tunnor, samma staket/trädgårdsmiljö, en text-rad "EASY PEEL & STICK!")
   är kontots näst mest spenderade bild (38 kr — för lite för dom, men samma
   visuella familj). **Instruktion: håll fast vid staket/trädgårdsmiljön och
   flera tunnor i bild — det är den återkommande nämnaren i allt som fått
   spend.**
3. **Hypotes (diagnos, inte dom — PD_1 har bara 1 köp):** PD_1 (UGC-video,
   en kvinna sätter en sticker på en tunna på en uteplats) har hook rate
   92 % (`video_play_actions`/`impressions` = 2015/2190) men hold rate bara
   12,5 % (`video_p50_watched_actions`/`video_play_actions` = 252/2015) —
   folk stannar för att titta men hoppar av snabbt. Kan bero på att manuset
   inte visar själva "vinsten" (flera tunnor, olika uttryck) förrän eventuellt
   för sent, eller på att videon aldrig fick en chans (441 kr totalt, PAUSED
   tidigt). Markeras som hypotes tills nästa avläsning.
4. **Observation, inte ett vinkelfel:** hela den numrerade bild-svansen
   (PD_Bild_01–13 minus _03 och _05) samt alla original-videovarianter
   (SP/G/CS förutom CS_Bild/CS_1) fick 0–65 kr vardera — klassisk
   CBO-svält av en algoritm som redan hittat en vinnare, inte ett bevis på
   att de andra vinklarna/formaten är dåliga. Samma mönster som
   `products/damasker-vandring/dna.md` och `products/kranskydd-frost-420d/`.

## Winning DNA
1. **Rent lifestyle-fotografi utan text, flera tunnor i samma bild, riktig
   svensk trädgårds-/villamiljö (vitt staket, blommor).** PD_Bild_03: 62 köp,
   CPA 106 kr, 73,5 % av spenden, bär hela kampanjens vinst.
2. **Ingen fabricerad rabatt eller lagerknapphet** — CS_Bild:s "50% RABATT"/
   "snart slutsåld" är både overifierat och kontots sämsta bedömbara annons.
3. **Produkten själv (de tecknade uttrycken) är hooken** — ingen ovanpålagd
   textrubrik behövs när scenen är rätt uppbyggd.

## Losing/rotorsaker (hypotes där ej annat sägs)
- **CS_Bild (bevisad förlorare):** fabricerat erbjudande + stockfoto-känsla
  (ljusstrålar, ensam tunna) mot ett kort som ser ut som en annons, inte ett
  hem. Redan pausad — repetera inte mönstret.
- **PD_1 (hypotes, <3 köp):** hög hook, låg hold. Möjlig orsak: visar bara
  en tunna/en person, ingen "familj av uttryck" som i vinnaren. Testa en
  video som visar samma family-shot-idé (denna batch: PD_4_H1/PD_5_H1).
- **Bulk-bildsvansen (PD_Bild_01/02/04/06/07/09/10/11/12/13) och
  originalvideorna (SP/G/G-varianter):** ingen dom möjlig, för lite spend.
  Flaggas för att INTE tolkas som "dåliga vinklar" — de har aldrig testats.

## Behåll alltid / Testa kontrollerat / Undvik / Obevisat
- **Behåll:** noll text-overlay i lifestylebilder · flera tunnor/uttryck i
  samma bild · riktig trädgårds-/villamiljö · pris exakt 199 kr, aldrig ett
  jämförpris som inte finns.
- **Testa kontrollerat:** samma family-shot-idé i videoform (rörelse,
  applicering live) · en ny mekanism (väder-/hållbarhetsdemo, denna batch
  `WI_1_H1`) · en ny men lika verklig miljö (radhus/gård i stället för
  villa+staket) för att isolera scen-variabeln, denna batch `PD_6_1`.
- **Undvik:** påhittad rabatt/lagerknapphet (CS_Bild-mönstret) · påstådda
  hållbarhetsgarantier som inte filmats på riktigt · "fri frakt" utan att
  nämna 300 kr-tröskeln (styckpriset 199 kr når den inte ensamt).
- **Obevisat:** allt i denna batch tills nästa avläsning — bara PD_Bild_03
  (och CS_Bild som förlorare) har passerat signifikansgrinden hittills.

## Luckor (fyll före nästa körning)
- Video-manus för PD_1/CS_1/CS_2/CS_3/SP_1–3/G_1–3 finns inte i något eget
  dokument — bara sedda via `ads_get_ad_preview` i denna körning. Be Axel/
  redigerarna om de ursprungliga manusen om djupare teardown behövs.
- Konkurrentbevakning (Meta Ad Library) kördes inte i denna körning —
  prioriterades bort för att hinna hela batchen. Gör vid nästa `/cs`.
- Shopify-connectorn i sessionen pekar på fel butik (TwinPillow) — priskoll
  gjordes via `WebFetch` av den publika sidan i stället. Fungerar, men är
  en omväg — flagga till Axel att kopplingen bör bytas till bäverbutiken.se.

## Namnkonvention — observerad diskrepans
Kontots faktiska prefix är **`Soptunneklistermarken`** (utan ä, utan "a" i
slutet) — skiljer sig från kampanjnamnets "Soptunneklistermärkena" och från
produktkartans "Soptunneklistermärkena". Denna batch återanvänder kontots
redan etablerade prefix för att hålla data jämförbar (`docs/naming-convention.md`:s
`ANGLE_FORMAT_HOOK`-schema används inte heller här — samma observerade
avvikelse som i alla andra produktminnen i repot, se Damasker/Kranskydd/
Övervakningskameran). Nya koncept-koder i denna batch: `PD` (fortsätter
det bevisade lifestyle-konceptet), `WI` (weather/durability, ny), `BOF_N`
(bottom-of-funnel), `RW_N` (review, ny).
