# Creative DNA – Tofflor Ergonomiska (Bäverbutiken)

Produkt: Tofflor Ergonomiska – Tjocksulade för Inne & Ute · **309 kr** (jämförpris 400 kr = spara 91 kr) · [produktsida](https://baverbutiken.se/products/tofflor-ergonomiska-tjocksulade-for-inne-ute)
Ad account: MagiBorsten `1867947880635861` · Kampanj: `Ergonomiska Tofflorna` `120249742782850291` (start 2026-08-13, 1 000 kr/dag)
Skapad: **2026-08-19** (`/forsta-batch`, körning nr 1). Full rapport: `rapport-forsta-batch-2026-08-19.md`.

**Läsanvisning:** `DATA` = uppmätt i kontot. `HYPOTES` = tolkning, ej bevisad.
Ingen dom under 300 kr spend eller 3 köp.

---

## ⚠️ Break-even är INTE verifierad för denna produkt

COGS saknas i product sheetet (kostnadskolumnerna är tomma). Nivåerna nedan är en
**proxy lånad från strandtofflorna** (närmaste produkt: Temu-sko, liknande prisklass):

| | Proxy-värde | Källa |
|---|---|---|
| AOV | **388 kr** | Shopify analytics, 28 ordrar sedan 2026-08-01 — VERKLIG |
| Break-even-ROAS | 1,70 | ⚠️ PROXY (strandtofflorna) |
| Break-even-CPA | 228 kr | AOV / 1,70 |
| Target-ROAS (25 %) | 2,97 | ⚠️ PROXY |
| Target-CPA | 131 kr | AOV / 2,97 |

**Fråga ställd till Axel 2026-08-19:** riktig COGS (inköp + frakt) för produkten.
När svaret kommer: räkna om, uppdatera products.json och denna fil. Kill-beslut
tagna mot proxyn ska omprövas om riktig break-even avviker >15 %.

---

## MÄTNING 2026-08-19 — launchbatchen (batch #1), dag 6

Livstid 13–19 aug: **5 641 kr spend · 26 köp · CPA 217 kr · ROAS 1,79** (intäkt 10 073 kr).
Korsvalidering Shopify: 28 ordrar / 12 360 kr brutto sedan 1 aug — konsistent (organiskt+direkt förklarar diffen).

**Datakvalitet (steg 1):** `amount_spent × purchase_roas` ≈ `omni_purchase_values` på
samtliga 5 rader med köp (t.ex. SP_2: 2 500,03 × 2,2989 = 5 747,5 ≈ 5 747,40). Inga
100×-buggar denna gång. `cost_per_omni_purchase` stämmer mot spend/köp överallt.

**Struktur:** 4 ABO-adset (PD / SP / CS / G), optimering köp. SP-adsetet tog **80 % av
spenden** — Metas dom. CS-adsetet (rea-vinkel) är pausat sedan tidigare. Funnel-stegen
LPV→ATC→IC går inte att hämta via MCP-verktyget (fälten finns inte) — lucka, ingen gissning.

### Bedömbara (≥300 kr OCH ≥3 köp) — vinstbidrag `(228 − CPA) × köp` mot PROXY-break-even

| Annons | Spend | Andel | Köp | CPA | ROAS | CTR | CPM | Hold p50 | **Vinstbidrag** | Andel vinst |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| **Tofflor_SP_2** (rå UGC-unboxning) | 2 500 kr | 44 % | **15** | **167 kr** | 2,30 | 2,46 % | 139 kr | **14,9 %** | **920 kr** | **80 %** |
| Tofflor_SP_1 (polerad b-roll) | 1 595 kr | 28 % | 8 | 199 kr | 2,01 | 1,72 % | 137 kr | 11,7 % | 228 kr | 20 % |

Känslighet: vid BE-ROAS 1,50 → 1 385 / 476 kr; vid 2,00 → 410 / **−44** kr. SP_2 är
lönsam i hela intervallet; SP_1 vippar till förlust först vid BE-ROAS 2,0.
**SP_2 är benchmark.** Dom = preliminär (6 dagar, 15 köp) — ska överleva nästa körning.

### För tidigt — ingen dom (urval)

| Annons | Spend | Köp | Notering |
|---|---:|---:|---|
| Tofflor_SP_3 (fötter kliver i, "Titta vad som händer") | 267 kr | 1 | Högst CTR bland spenders (2,59 %). Nära grinden. |
| Tofflor_SP_2_1 (AI-statisk, recensionscitat) | 157 kr | 1 | ⚠️ Se "Får inte återanvändas". |
| Tofflor_PD_2_1 (AI-statisk "ONDA FÖTTER?") | 14 kr | 1 | ROAS 22,7 = brus. CTR 4,65 % på 86 visn. |
| Tofflor_PD_2 · PD_3 · PD_Statisk · PD_EXTRA · G_1–G_3 · CS_1–CS_3 | 1–134 kr | 0 | Ingen leverans / adset pausat. |

### Kill (mot proxy-break-even 228 kr, ≥500 kr spend)

| Annons | Spend | Köp | Beslut |
|---|---:|---:|---|
| **Tofflor_PD_1** (unboxning av FRAKTPÅSEN, "Komforten hemma") | 565 kr | **0** | **Pausa.** 565 kr utan ett enda köp överskrider varje rimlig break-even. Hold 5,4 % = sämst bland videor med data. |

---

## Creative-teardown (steg 6b) — vad som orsakade utfallet

Alla granskade visuellt (previews ur kontot). Videomanus från launchen finns INTE i
repot (batchen skapades 2026-08-13 utan att minnet pushades) — teardown bygger på
previews + captions i bild, inte på gissad transkribering.

- **SP_2 (vinnaren):** rå mobilvideo i hemmiljö. Tofflorna på ett soffbord, prislapp
  kvar, caption "Det här är tofflorna". Den orangea vågformade innersulan är synlig i
  första rutan. Ser ut som en kompis som visar ett fynd — inte som en annons.
- **SP_1 (tvåan):** leverantörens polerade studio-b-roll, makro på skon (den kinesiska
  texten "Reality Summer Adevnutres New Day" syns tryckt på skon). Snyggare, säljer sämre:
  lägre CTR (1,72 vs 2,46 %), lägre hold (11,7 vs 14,9 %), CPA +32 kr.
- **SP_3:** fötter kliver ner i tofflorna på trägolv, "Titta vad som händer" — sulan
  demonstreras. Högst CTR bland alla med >100 visningar. För tidigt att döma.
- **PD_1 (kill):** första sekunderna visar en förpackningspåse på ett grått studiobord.
  Produkten skyms tills påsen öppnats. 565 kr, 0 köp.
- **PD_2_1 (AI-statisk):** rubrik "ONDA FÖTTER? INTE LÄNGRE." — CTR 4,65 % på minimal
  leverans. Pain-rubriken är kampanjens starkaste CTR-signal. `HYPOTES`.
- **SP_2_1 (AI-statisk):** recensionskort "Bästa tofflorna jag någonsin ägt! – Verifierad
  kund, 42 år" ★★★★★. **Recensionen är påhittad** — produkten har inga verifierade
  recensioner. Se stopplistan.

### Variabeltabell — vinstbidrag per variabelvärde (proxy-BE 228 kr)

| Variabelvärde | Annonser | Spend | Vinstbidrag | Slutsats |
|---|---:|---:|---:|---|
| Video, produkt synlig sek 1 (SP_2, SP_1) | 2 bedömbara | 4 095 kr | 1 148 kr | All vinst bor här |
| Video, emballage/paket först (PD_1) | 1 (kill) | 565 kr | < 0 | Enda killen |
| Rå hemmiljö-UGC (SP_2) | 1 | 2 500 kr | 920 kr | Slår studio |
| Polerad leverantörsstudio (SP_1, PD_1–3) | 4 | 2 231 kr | ~180 kr netto | Fungerar, men sämre per krona |
| Statics (alla) | 4 | 195 kr | — | Ingen leverans — odömt, inte dött |

### Mönster (märkta enligt ANALYSMETOD)

1. **Produkten i bild inom 1 sekund; aldrig emballage först.** `HYPOTES (stark)` —
   SP_2+SP_1 (23 köp) mot PD_1 (0 köp på 565 kr). Fler variabler skiljer, men
   riktningen är entydig. → Briefinstruktion: första rutan = tofflorna eller sulan,
   förbud mot pås/kartong i hook-shotet.
2. **Rå hemmiljö slår polerad studio.** `DATA-stött, preliminär` — SP_2 vs SP_1 är
   två bedömbara (15 resp. 8 köp): CPA 167 vs 199, hold 14,9 vs 11,7 %. Skiljer sig
   dock på fler än en variabel (miljö + kamerastil + captionton). → Briefinstruktion:
   batch #2 isolerar variabeln (SP_4-serien = rå stil, SP_6-serien = polerad).
3. **Den orangea innersulan är den visuella kroken.** `HYPOTES` — alla tre högsta
   CTR-annonserna (SP_3 2,59 %, SP_2 2,46 %, PD_2_1 4,65 %) visar sulan tydligt;
   PD_1/PD_3 utan tydlig sula ligger på 2,17/0,75 % och 0 köp. → Briefinstruktion:
   orange sula i första rutan eller som bildens största form.
4. **Pain-copy ("onda fötter") ger klick.** `HYPOTES` — PD_2_1:s CTR 4,65 % är
   kampanjens högsta bland annonser med >80 visningar, men 1 köp = ingen dom.
   → Testas kontrollerat som hook-variant (SP_4_H2) och statisk (PD_10_1).

---

## WINNING DNA (preliminär — 6 dagars data)

- **UGC-realism i hemmiljö** (SP_2): "kompis visar fynd"-energi, prislapp kvar, vardagsbord.
- **Sulan som hjälte:** orange vågsula synlig tidigt = högre CTR över tre annonser.
- **Caption-kort i vit ruta, en kort rad i taget** — bevisat räcker utan voiceover.
- **Social proof-vinkeln (SP-adsetet)** tog 80 % av spenden och 24 av 26 köp.

## LOSING DNA (preliminär)

- **Emballage före produkt** (PD_1): 565 kr, 0 köp. Kill.
- **Rea/urgency-vinkeln (CS-adsetet):** pausad efter 397 kr utan köp — "Lagret krymper"
  hann aldrig bevisa sig; vinkeln är odömd men nedprioriterad.
- **Påhittade recensioner** (SP_2_1): compliance-risk och mot repo-reglerna, oavsett resultat.

## FÅR INTE ÅTERANVÄNDAS

- `Tofflor_SP_2_1` (annons-id `120249742829060291`): påhittat kundcitat + betyg.
  Får inte skalas eller kopieras. Konceptet (lugn hembild + textkort) är OK — bevis-raden
  ska bytas till garantin eller den sanna lagerfaktan.
- Skoprintens engelska ("Reality Summer Adevnutres New Day", "OK guranni") är felstavad
  kinesisk-engelska **på själva produkten**. Syns i närbilder. Beskär eller vinkla bort
  den i statics; nämn den aldrig i copy.

## ÄNNU OBEVISAT

- Statics över huvud taget (195 kr totalt, ingen leverans i ABO-strukturen).
- G-adsetet (gåva/generisk?) — 46 kr totalt.
- Pain vs komfort som huvudvinkel — isoleras i batch #2 (SP_4_H1 vs H2 vs H3).
- Dam-specifik vinkel (konkurrenten kör "hålfotsstöd för dam" separat).

---

## REGLER FÖR NÄSTA BATCH

1. **Nya tester i separat test-ABO, lika budget per annons, max 2–3 annonser per adset**
   (Axels regel 2026-08-12 + strandtofflornas leveransmönster: 1 vinnare per adset tar 94 %).
2. Rangordna på vinstbidrag mot break-even — som är en PROXY tills Axel gett COGS.
3. Produkten/sulan i bild sekund 1. Aldrig emballage.
4. Priset hämtas från produktsidan vid varje körning: **309 kr / jämförpris 400 kr /
   spara 91 kr**. Inga andra siffror, inga procentsatser.
5. Inga påhittade recensioner eller betyg. Social proof = verifierbar fakta
   (28 ordrar första veckan, lagret översålt) eller garantin.
6. Inga medicinska påståenden (inga diagnoser). LP-språket är taket:
   "avlastar leder och rygg", "som att gå på moln".
7. Video 12–25 s, captions ord-för-ord på svenska, funkar utan ljud.
8. Namngivning batch #2+: `Ergoslippers_<KONCEPT>_<ADID>_<VARIANT>`. Upptagna ID:n
   (batch #1, utan prefix): PD 1–3 + EXTRA + Statisk (+PD_2_1) · SP 1–3 (+SP_2_1) ·
   CS 1–3 (+CS_2_1) · G 1–3 (+G_2_1). Nya börjar på 4 (SO börjar på 1).
