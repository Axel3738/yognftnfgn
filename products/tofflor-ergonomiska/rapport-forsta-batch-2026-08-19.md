# /forsta-batch — Tofflor Ergonomiska · Slutrapport 2026-08-19

## Executive summary

Launchbatchen (13 aug, 21 annonser, 4 ABO-adset) har på 6 dagar spenderat **5 641 kr och
tagit 26 köp (CPA 217 kr, ROAS 1,79)**. Två annonser är bedömbara och båda tjänar pengar
mot alla rimliga break-even-nivåer: **Tofflor_SP_2** (rå UGC-hemvideo, 15 köp, CPA 167 kr,
ROAS 2,30 — benchmark) och **Tofflor_SP_1** (polerad leverantörsvideo, 8 köp, CPA 199 kr,
ROAS 2,01). En annons ska pausas: **Tofflor_PD_1** (565 kr, 0 köp — hooken visar
fraktpåsen i stället för produkten). En annons får aldrig återanvändas: **Tofflor_SP_2_1**
(påhittad recension i bild).

Produktens visuella krok är den **orangea vågformade innersulan** — de tre högsta
CTR-annonserna visar den tydligt. Batch #2 (14 briefer, levererade med denna rapport)
isolerar hook-variabeln på vinnarens body, räddar det polerade footaget med omklipp,
och testar statics i korrekt struktur (separat test-ABO, 2–3 annonser per adset).

**Enda ägarfrågan:** produktens COGS saknas i product sheetet → break-even är en proxy
(strandtofflornas 1,70). Se frågan sist i leveransen.

---

## FAS 0 — Tillgångskontroll (vad som faktiskt verifierades)

| Källa | Status | Notering |
|---|---|---|
| Meta Ads-data (kampanj/adset/annons) | ✅ Hämtad | Hela kampanjen, sorterad på spend, `maximum`-period |
| Statiska bilder | ✅ Visuellt granskade | SP_2_1, PD_2_1, PD_Statisk via ad-preview |
| Video | ⚠️ Delvis | Previews (första rutan + captions) granskade för SP_2, SP_1, SP_3, PD_1, CS_3. **Manus saknas i repot** — launchbatchen pushade aldrig sitt minne. Ingen transkribering gjord på gissning. |
| Landningssida | ✅ Via Shopify Admin | Direktfetch blockerad av nätverkspolicyn; Shopify Admin API = samma sanning. Pris 309 kr, jämförpris 400 kr, 30 dagars garanti, Klarna — verifierat |
| Shopify-försäljning | ✅ Korsvaliderad | 28 ordrar / 12 360 kr sedan 1 aug vs Metas 26 köp — konsistent |
| Recensioner | ❌ Saknas | Produkten har inga verifierade recensioner. Lucka — inget kundspråk därifrån |
| Meta Ad Library (SE) | ✅ Sökt | "ergonomiska tofflor" + konkurrentsidan ErgonomiKliniken (648 aktiva annonser) |
| Product sheet (COGS) | ❌ Tomt | Kostnadskolumnerna är tomma för hela sheetet → break-even = PROXY |
| Funnel LPV→ATC→IC | ❌ Ej åtkomlig | Fälten finns inte i MCP-verktyget (`landing_page_view` m.fl. okända) |

## FAS 1 — Kampanjöversikt

- **Kampanj:** Ergonomiska Tofflorna `120249742782850291` · OUTCOME_SALES · start 2026-08-13 19:03
- **Budget:** 1 000 kr/dag (kampanjnivå) · 4 ABO-adset: PD (demo), SP (social proof),
  CS (rea — PAUSAD), G (gåva/generisk) · opt. OFFSITE_CONVERSIONS
- **Totalt dag 1–6:** 5 641 kr · 36 366 visningar · CPM ~141 kr · 26 köp · CPA 217 kr · ROAS 1,79
- **Spendfördelning:** SP 4 520 kr (80 %) · PD 678 kr · CS 397 kr · G 46 kr. Meta har
  redan valt vinkel: social proof-adsetet.
- **Var läcker funneln?** Med proxy-BE 228 kr ligger kampanjsnittet (217 kr) precis under
  break-even — men det är PD_1:s 565 bortkastade kronor som drar upp snittet. De två
  bedömbara ligger 167/199 kr. Kreativet är flaskhalsen (hold 5–15 % vid p50), inte LP:n:
  konverteringen per klick är 2,6–3,4 % på vinnarna, i nivå med kontots andra produkter.
  LPV/ATC-stegen går inte att läsa ut (se FAS 0) — ingen slutsats om kassan.

## FAS 2 — Klassificering (samtliga 21 annonser)

Signifikansgrind: ≥300 kr spend OCH ≥3 köp. Se `dna.md` för fullständiga tabeller.

| Klass | Annonser |
|---|---|
| **Bevisad vinnare (preliminär)** | Tofflor_SP_2 — 2 500 kr · 15 köp · CPA 167 · ROAS 2,30 · CTR 2,46 % · hold 14,9 % |
| **Lovande** | Tofflor_SP_1 — 1 595 kr · 8 köp · CPA 199 · ROAS 2,01 · CTR 1,72 % · hold 11,7 % |
| **Osäkra (för lite data)** | SP_3 (267 kr/1 köp, CTR 2,59 %) · SP_2_1 (157/1) · CS_3 (134/0) · ZZ_GAMMAL_CS_3 (100/0) · CS_1 (77/0) · PD_2 (37/0) · G_3 (36/0) · PD_3 (34/0) · CS_2 (26/0) · PD_Statisk (25/0) · ZZ_CS_2_1 (22/0) · ZZ_CS_2 (17/0) · PD_2_1 (14/1, ROAS 22,7 = brus) · CS_2_1 (11/0) · ZZ_CS_1 (10/0) · G_1 (5/0) · PD_EXTRA (4/0) · G_2 (4/0) · G_2_1 (1/0) |
| **Förlorare** | Tofflor_PD_1 — 565 kr · 0 köp → pausas |

**20 %-frågan:** SP_2 ensam driver 58 % av köpen och 80 % av vinstbidraget.
**Största budgetläckan:** PD_1 (10 % av all spend, noll köp).

## FAS 3 — Djupanalys av toppannonserna

**SP_2 (benchmark).** Rå mobilvideo: tofflorna på ett soffbord i ett riktigt hem,
prislapp kvar, vit caption-ruta "Det här är tofflorna". Attention: hemmiljön + den
orangea sulan ger native-känsla (hook rate ~94 % av visningar startar video, hold 14,9 %
vid p50 — bäst i kampanjen). Persuasion: "kompis visar fynd"-trovärdighet; headline i
Ad Library: "Skönaste stegen du tar hemma" / "Fötter som äntligen får vila". Conversion:
CTR 2,46 %, 3,4 % köp/klick. `DATA` = siffrorna; `HYPOTES` = trovärdigheten sitter i
råheten (testas i batch #2 där SP_4-serien behåller råheten och SP_6-serien inte gör det).
Manus rad-för-rad går inte att göra — se FAS 0-luckan.

**SP_1.** Leverantörens polerade makro-b-roll (skoprint "Reality Summer…" syns).
Fungerar (8 köp, över proxy-BE) men tappar mot SP_2 på alla attention-mått. `HYPOTES`:
footaget är inte problemet — öppningsrutan är; den visar produktdetalj utan kontext.
Omklippet SP_6_H1 (sulan trycks ihop i sek 1) testar exakt det.

**Hook-formler ur batch #1:** (1) "Det här är X" + produkt på vardagsyta, (2) "Titta vad
som händer" + demo-rörelse, (3) pain-fråga i versaler ("ONDA FÖTTER?"). Alla tre återanvänds
kontrollerat i batch #2.

## FAS 4 — Förlorarna

| Element | Vinnaren (SP_2) | Förloraren (PD_1) | Trolig påverkan | Nästa test |
|---|---|---|---|---|
| Första rutan | Produkt + orange sula | Fraktpåse på studiobord | Hela skillnaden — hold 14,9 vs 5,4 % | Regel: produkt sek 1 (alla batch #2) |
| Miljö | Riktigt hem | Grå studio | Native-känsla vs annons-känsla | SP_4 vs SP_6-serierna |
| Caption | "Det här är tofflorna" (konkret) | "Komforten hemma" (abstrakt) | Konkret > begrepp (hook-visual-regeln) | Alla hooks i batch #2 klarar visualiserings-testet |

Beslut: **pausa PD_1**. CS-adsetet är redan pausat (397 kr, 0 köp — rea-vinkeln odömd,
nedprioriterad). G-adsetet lämnas (46 kr — ofarligt, odömt). Ingen annan åtgärd: allt
annat är under grinden.

## FAS 5 — Creative DNA

Skriven till `products/tofflor-ergonomiska/dna.md` (Winning/Losing DNA, Behåll alltid /
Testa kontrollerat / Undvik / Obevisat, mönster 1–4, stopplista). Kärnan:
**behåll** produkt-i-bild-sek-1, rå hemmiljö, orange sulan som största form, 309 kr;
**testa kontrollerat** pain vs komfort vs social proof (hook-isolerat), rå vs polerad,
statics i eget adset; **undvik** emballage-hooks, påhittade recensioner, rea-vinkel,
medicinska löften.

## FAS 6 — Kund- & konkurrentresearch

**Kundspråk:** inga recensioner finns (lucka — inget direktcitat tillgängligt).
Mönster ur LP + Ad Library (märkta `HYPOTES`): "trötta fötter", "det märks på kvällen",
"som att gå på moln", "sköna steg hemma". Konkurrentens frågeformuleringar visar att
målgruppen svarar på vardagsspråk om ostadighet och stela muskler — inte på "ergonomi"
som begrepp.

**Direkta konkurrenter:** ErgonomiKliniken (648 aktiva annonser i SE) — kör
"Stötdämpande Tofflor" oavbrutet sedan juni 2025 (>14 månaders runtime = bevisad vinnare),
plus "Sandaler med hålfotsstöd för dam" och stabilitetsvinkeln "Känner du dig ostadig när
du är ute och går?". **Indirekta:** vanliga toffel-/sneakerannonsörer (våra egna
strandtofflor konkurrerar inte — annan säsong/yta).

**3 lånade mekanismer (extraherade, inte kopierade):**
1. Kategorinamnet "stötdämpande tofflor" i stället för "ergonomiska" — konkret, filmbart,
   redan marknadsvaliderat i 14 månader → används i copy-territoriet för batch #2.
2. Fråge-hooks på vardagssvenska om kroppen (utan diagnos) → SP_4_H2, PD_10_1.
3. Segmenterade varianter (dam-specifik annons) → backloggen (väntar på grundvinkeln).

## FAS 7 — Variationer på vinnarna (3 per vinnare)

**SP_2:** SP_4_H1 (nära iteration — sul-makro-hook), SP_5_1 (format transfer — statisk
stillbild + garanti), SP_4_H2 (ny persuasion — pain). Bonus: SP_4_H3 (sann social proof).
**SP_1:** SP_6_H1 (nära iteration — omklipp, sulan först), PD_7_1 (format transfer —
sulan mot kameran som statisk), SP_6_H2 (ny persuasion — trygga steg/halkfritt).

## FAS 8 — Nya videokoncept (3, olika persuasion-mekanismer)

PD_4_H1 (mekanism-demo: "gå på moln"-testet), SO_1_H1 (ärlig social proof-story:
28 ordrar första veckan, översålt lager), SP_6_H2 (identity/trygghet — räknas hit
mekanismmässigt). Inspelningsklara manus i briefarna.

## FAS 9 — Nya statiska koncept (6)

PD_7_1 (demo/sula), PD_8_1 (jämförelse), SO_2_1 (social proof-fakta — ersätter
testimonial eftersom riktiga citat saknas; riktig testimonial är BLOCKER tills
recensioner finns), PD_9_1 (listicle), SO_3_1 (offer 309/400/spara 91), PD_10_1
(risk/cost-of-inaction).

## FAS 10 — Testplan

**Struktur vid launch (regel 11):** NY separat test-ABO-kampanj (inte skalnings-CBO),
2–3 annonser per adset, lika budget per annons, allt PAUSED tills Axel trycker på knappen.

| Tier | Annonser | Budget/dag | Kill-regel |
|---|---|---|---|
| 1 — vinnariterationer | SP_4_H1/H2/H3 · SP_6_H1/H2 · SP_5_1 | 100 kr/annons | CPA > 228 kr (proxy-BE) efter ≥500 kr → pausa. Under 300 kr/3 köp: ingen dom |
| 2 — nya koncept | PD_4_H1 · SO_1_H1 · PD_7_1 · PD_8_1 | 100 kr/annons | Samma |
| 3 — bredd/statics | SO_2_1 · PD_9_1 · SO_3_1 · PD_10_1 | 50–100 kr/annons | Samma |

I befintliga kampanjen: pausa PD_1 nu; låt SP_2/SP_1 löpa orörda (benchmark);
SP_3 får löpa till dom (behöver ~2 köp till).

**Kvot:** proxy-target 131 kr → 5 creatives per 3-dagarscykel. Batch #2 = 14 ≥ 5 ✅
(täcker ~3 cykler). Kvot-utskrift i leveransmeddelandet.

**Gör innan spend:**
1. Axel: bekräfta COGS/break-even (ägarfrågan).
2. Pausa Tofflor_PD_1.
3. Kontrollera att `adStatus`+`adsetStatus` sätts explicit om vågsystemet används.
4. Redigerarna behöver rå-footage: vinnarens stil kräver mobilfilmning i hemmiljö
   (shot list i briefarna) — leverantörsklipp räcker inte för SP_4-serien.

## Lärdomar

1. Launchbatcher som skapas utanför repot lämnar inga manus efter sig — teardown blir
   halvblind. Batch #2:s briefer ligger i repot; det här får inte hända igen.
2. ABO-strukturen från SOP-06 fungerar som signalgenerator (SP-adsetet vann på 6 dagar)
   men 21 annonser på 1 000 kr/dag ger 16 annonser utan dom — batch #2 kör 2–3 per adset.
3. Payhittade recensioner dök upp i en AI-statisk. Stoppregeln står nu i DNA:t och i
   varje README.
4. Kontots namnkonvention bröts i batch #1 (inget produktprefix) — batch #2 rättar det.
