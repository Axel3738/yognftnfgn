# Creative DNA — Fiskespöhållaren 4-Pack

**Körning #4** (`/cs`, 2026-08-26). Datafönster 2026-08-18 → 2026-08-26 (8 dygn, 43 619 kr, ~243 köp).
Tidigare: körning #1 = /forsta-batch 2026-08-21, #2 = /cs samma dag (utan delta), #3 = /cs 2026-08-24.
Full analys per körning i `products/fiskespohallaren/batch-log.md`.

## ⛔ LÄS DETTA FÖRST (körning #4, 2026-08-26)

**Kampanjen är i skalningskris, inte creative-kris.** Dagsvinsten har gått från
+7 904 kr (21/8, spend 4 351 kr) till −699 kr (26/8, spend 5 829 kr). Senaste tre
dygnen gav 0,07 kr vinst per spendkrona mot 1,68 kr under de tre första.
Frekvensen är låg och platt (1,30 → 1,45) och CPM har *sjunkit* (160 → 127) —
alltså **inte** utmattning. Det som halverats är kvalificeringen: CTR 4,57 → 2,38 %,
ATC/klick 8,2 → 4,6 %, köp/klick 5,49 → 2,46 %. Dagsbudgeten fördubblades
(~4 300 → ~8 600 kr) och Meta tvingas bredare i publiken.
**Ny creative löser inte detta ensam — budgettakten är ägarbeslut (frågan ställd 2026-08-26).**

**Det gäller alltså inte att hitta bättre annonser, utan annonser som KVALIFICERAR
en bredare publik.** Hela batch #5 är byggd på den premissen.

## Ekonomin (låst för denna produkt)

| | Värde | Källa |
|---|---|---|
| Pris | 289 kr (4-pack, 72,25 kr/st) | Shopify, verifierat 2026-08-21 |
| AOV | 427 kr (Shopify) / 441 kr (Meta) | analytics 17–21/8 — folk köper >1 pack |
| Break-even-ROAS / CPA | **1,50 / 285 kr** | Axels kampanjnamn "BE ROAS 1.50". COGS-rad i product sheet TOM — obekräftad mot kalkyl |
| Target (25 %) | 2,40 / 178 kr | härledd: BE/(1−0,25×BE) |

✅ **LÖST 2026-08-21:** det bakvända jämförpriset (148,75 kr) togs bort på Axels beslut — sidan visar nu enbart 289 kr. Eftersom inget referenspris finns gäller fortsatt: **inga rabatt-claims i någon annons** utan nytt ägarbeslut. Förbjudna tal i copy: 149 kr, 148,75 kr, "40 %".

## Läget efter körning #3 (2026-08-24)

~22 200 kr spend → 163 köp, CPA ~136, allt väl under BE 285. Kampanjen spenderar nu nära full budget. Batch #2+#3 launchades 22–24/8 — **i skalnings-CBO:n, mot regel 11** (femte gången i kontot): ~20 av 27 Rodholder-ads svälter under 100 kr. Undantaget PD_15_H1 fick 3 532 kr och levererar. PD_1_H1 bekräftar regressionsregeln: CPA 60,58 på 242 kr → 180,94 livstid (marginal 215).

⛔ **PRODUKTJOBBET KORRIGERAT AV ÄGAREN 2026-08-24 (viktigaste rotorsaken):** klämmorna fäster INTE spön i väggar/båtar — de klämmer ihop det delade spöts två halvor till ETT prydligt paket vid transport. Alla vägg-koncept utgick (PD_9 pausad i Meta, PD_14 aldrig launchad, briefer märkta WITHDRAWN). ✅ **LP-BESLUT 2026-08-24 (Axel):** LP-texten byts **framåt**, inget retroaktivt. Ny text KLAR (skriven via sonnet-subagent, tre-frågorstestad) i `products/fiskespohallaren/lp-text-2026-08-24.md` — blockerad av Shopify-connectorn som stod på **fel butik (Matstrumpor.se)** och nu kräver återauktorisering mot bäverbutiken.se. Byt så fort kopplingen fungerar; verifiera butik med `get-shop-info` först. Framtida copy: säg "delbara spön", inte "passar alla spön".

## De tre lagarna (körning #4 — väger tyngre än allt nedanför)

**1. Hög hold säljer INTE. Sluta optimera för det.** (BEVISAD — 3 annonser mot 6)
Hög hold (>15 %) ger **0,24 kr vinst per spendkrona**, låg hold (<10 %) ger **0,76 kr**.
`PD_15_H1` "Skaka-testet" håller kvar 25 % av tittarna — 4× kontots snitt — och
konverterar sämst av alla stora annonser (2,60 % köp/klick, CPA 232).
`PD_11_H2` "Klicket" har 17,6 % hold och är kontots **enda förlustannons** (−192 kr).
Rotorsak (hypotes): macro-demo av klickmekanismen är *tillfredsställande att titta på*
men skapar inget köpbehov — tittaren stannar för hantverket, inte för sitt problem.
Undantaget som bevisar regeln: `PD_16_H1` har hög hold OCH hög konvertering (6,33 %) —
den **besvarar en invändning** i stället för att fascinera.
⚠️ Detta upphäver körning #3:s slutsats att PD_15:s proof-mönster "HÖLL". Det höll på
hold; hold var fel mål. 2c-regeln (preliminär tills nästa körning) räddade oss från
att skriva in det som BEVISAT.

**2. Miljön i bilden är den starkaste enskilda variabeln.** (preliminär — 8 köp)
`CS_1_H1` och `CS_1_H3` har **identisk primärtext, headline, CTA och erbjudande**.
Enda skillnaden är videon:

| | Miljö | köp/klick | ATC/LPV | CPA |
|---|---|---|---|---|
| CS_1_H1 | inomhus, grå soffa | 4,49 % | 9,3 % | 126 kr |
| **CS_1_H3** | **ute i fiskemiljö**, riktigt rött spö, mikrofon i bild | **10,39 %** | **19,4 %** | **48 kr** |

2,3× konvertering på exakt samma ord. Vinst per spendkrona: **4,90 kr** — högst i kontot.
→ **Varje ny video filmas där fisket sker.** Vid vattnet, vid bilen, i båten.
Studio, soffa och neutral bakgrund är förbjudna. Kontexten är inte dekor — den är
kvalificeringen, och kvalificering är exakt vad som saknas när Meta går bredare.

**3. Invändningskross konverterar; produktvisning gör det inte.** (BEVISAD)
De tre högsta köp/klick i kontot — CS_1_H3 (10,39 %), PD_6_1 (7,27 %), PD_16_H1 (6,33 %) —
svarar alla på en fråga köparen faktiskt har. Rena demo-klipp ligger på 2,5–3,7 %.
→ **Varje brief måste namnge den invändning den krossar, högst upp. Ingen invändning = ingen produktion.**

## Winning DNA (alla domar PRELIMINÄRA — 2,5 dygn, 1d_view_7d_click)

| Mönster | Bevisläge | Data |
|---|---|---|
| **Rå leverantörsdemo, produkt i bild <1 s, ingen text/polish** | Bevisad inom batchen (3 annonser, 6–9 köp vardera) — preliminär tills nästa avläsning | PD_EXTRA ×3: 2 586 kr, 23 köp, CPA 63–145, 87,5 % av bedömbart vinstbidrag |
| **Trassel-copyn**: "Trassliga fiskespön i båten – igen? / Den här lilla klämman löser det på 1 sekund / ✅×3 / Beställ ditt 4-pack" | Bevisad (23 köp bakom exakt denna text) | Återanvänd verbatim där det går |
| **Engelskt tal/text i råklipp är inget hinder för svensk publik** | Ägarinput (Axel 2026-08-21: "videon på engelska går bäst") + PD_EXTRA-datan | Kräv aldrig omdubbning av råklipp; svensk copy bär budskapet i primärtexten |
| **VoC Reddit 2026-08-24 (9 trådar, ~148 röster — se `docs/voc-reddit-fiskespohallaren-2026-08-24.md`):** (1) fulhacks-fienden är verklig i skala — gummiband/kardborre "glider runt", PVC-rör, piprensare, vax [bevisad-i-VoC, stödjer PD_18]; (2) transportögonblicket (bil/bagagelucka) väger tyngre än förvaring i kundens egen problembild [bevisad-i-VoC, stödjer PD_17]; (3) skumgummit är den sanna differentieringen — köpt hållare underkändes för att den saknade skum och släppte greppet [enstaka röst, produktverifierad] | Extraktion enligt docs/os/VOC-MINING.md | Nya koncept pekar på VoC-kategori + citat; spontanfiske-vinkeln ("riggat i bilen, fiska efter jobbet") är obeprövad kandidat |
| **VoC: "hårsnoddar" är fulhacket kunderna faktiskt använder** | ÄKTA VoC — Axels research bland fiskande vänner 2026-08-21: "man strular alltid med hårsnoddar och sånt för att hålla ihop spöna, det är så jävla jobbigt" | Konflikttyp A (fulhacket som fiende). Första riktiga kundspråket för produkten — testas i PD_18. Använd ordet "hårsnodd", inte "gummiband", i copy |
| ~~Proof-demo (skaka-testet, PD_15_H1) håller kvar 3× fler och konverterar~~ | ⛔ **MOTBEVISAD 2026-08-26** — flyttad till Losing DNA | Höll på hold (25,0 %), föll på vinst: 0,23 kr/spendkrona, näst sämst i kontot. CPA 232 mot benchmark 175. Se lag 1 |
| Offer/urgency-vinkeln (CS_1_H1) är marginellt billigast: 89 kr/köp | Data ja — men claimen "40 % RABATT" är OSANN och annonsen byts ändå (integritetsbeslut, ej databeslut). Freq 1,56 = högst i kampanjen | Sann offer-framing (SO_3/CS_3) måste få budget för att testa om effekten är vinkeln eller lögnen |
| Hold är låg för råklipp men CVR hög → retention är inte flaskhalsen för demo-formatet | Hypotes — men PD_15 visar att hold GÅR att 3×-a med proof | Kort demo räcker; proof lyfter |
| Regression är verklig: höga kvoter på låg spend landar lägre | BEVISAD (PD_1_H1: 60,58 → 180,94; PD_EXTRA c: 62,64 → 117,39) | Skalningskandidater testas, aldrig döms, på första avläsningen |

## Losing DNA

| Mönster | Bevisläge | Rotorsak |
|---|---|---|
| **CBO för test** | BEVISAD — fjärde gången i kontot (jfr motorhöljets mönster 5) | 17/24 creatives fick <100 kr → oläsbar data. Nya tester ALLTID i separat ABO, lika budget (Axels regel 2026-08-12) |
| **Osanna offers** | Faktafel, inte performance | "40 % RABATT" utan rabatt på LP; "149 kr" efter prishöjning till 289. 5 annonser pausade 2026-08-21 (3× ZZ_GAMMAL + SO_1_H3 våg 1 som missats + SO_2_1 våg 2 vars BILD fortfarande sa 149 kr fast bodyn rättats) |
| AI-genererade människor i statics (SP_2_1:s "kund", GT_2_1:s produktformer) | Hypotes + hook-visual-regeln | Citat "Verifierad kund, 52 år" kan inte beläggas — testimonials kräver riktig recensionstext |
| **Macro-fascination utan problem (PD_11 "Klicket", PD_15 "Skaka-testet")** | **BEVISAD 2026-08-26** (2 annonser, 42 köp) | Hög hold, låg konvertering. PD_11 = kontots enda förlustannons (−192 kr). Se lag 1. Bygg aldrig en brief vars mål är "håll kvar tittaren" |
| **Inomhus-/studiomiljö i UGC-video** | Preliminär (1 par, identisk copy) | CS_1_H1 (soffa) 4,49 % köp/klick mot CS_1_H3 (ute) 10,39 %. Se lag 2 |
| **Att skala dagsbudgeten snabbare än creativen kvalificerar** | **BEVISAD 2026-08-26** (8 dagars dagsdata) | Budget ~4 300 → ~8 600 kr/dag gav CPA 101 → 324 kr med *sjunkande* CPM och platt frekvens. Skalning utan kvalificerande creative späder ut publiken |

## Obevisat (CBO-svält — inte motbevisat)

Social proof (SP), gift (GT), samtliga statics, pris-i-copy (SO 289-versionerna). Testas innan någon döms. (Väggmonterings-vinkeln UTGICK 2026-08-24 — fel produktförståelse, se Rotorsaker.)

## Behåll alltid / Testa kontrollerat / Undvik

- **Behåll:** produkten i användning inom 1 sekund; trassel-smärtan i första raden; 289 kr utan trick; invändningskrossen (nu "passar delbara spön", inte "alla spön").
- **Testa kontrollerat:** miljön (ute vid vattnet/bilen vs neutral bakgrund) — högst prioritet efter lag 2; invändningskrossare på VoC-invändningar (skador, plats i bilen, linan/kroken); ärlig anti-urgency ("fast pris året runt") som ersättare för CS_1:s lögn; värde-framing 72 kr/klämma; PROD-vs-REA-testet (trygghet vs brist) när det fått budget.
- **Undvik:** procent-rabatter och alla bristpåståenden som inte kan verifieras mot Shopify; AI-människor; **allt som optimerar för hold i stället för invändning (lag 1)**; studio-/soffmiljö i video (lag 2); att skala dagsbudgeten innan CTR och köp/klick stabiliserats.
- ⛔ **"Fri frakt över 300 kr" får INTE användas på denna produkt.** Priset är 289 kr — tröskeln nås inte vid ett pack, så formuleringen antyder en förmån köparen inte får. Den ligger kvar i den gamla CS_1-copyn och ska bort med den.

## Rotorsaker värda att minnas

1. Kontots copy kan vara rättad medan **bilden/videon fortfarande bär gammalt pris** — SO_2_1 våg 2 hade rätt body och fel bild. Granska alltid själva creativen, inte bara texten.
2. Kampanjen döptes med BE-ROAS i namnet — bra mönster, men product sheet-raden saknar COGS, så talet går inte att verifiera oberoende.
3. Recensioner finns (7 st) men texterna ligger i en JS-app → VoC-luckan blockerar testimonial-konceptet, inte datan.
4. **En metrik som ser ut som en vinst kan vara ett mätfel om målet är fel.** Körning #3 skrev in PD_15:s 25 % hold som ett genombrott. Hold var aldrig målet — vinstbidrag var det. Kontrollera alltid att den metrik du firar sitter ihop med pengarna innan den blir DNA. (Detta är samma familj av fel som ROAS-domen och CPA-domen som gav upphov till ANALYSMETOD.md.)
5. **Livstidssiffror döljer akuta lägen.** Kampanjens livstids-CPA (176 kr) såg frisk ut hela vägen medan de tre senaste dygnen gick mot noll i vinst. Kör alltid `time_increment: "1"` på kampanjnivå — dagsserien är det enda som visar en trend i tid.
6. **CS_2_1 visar varför båda break-even-linjerna måste läsas:** CPA 242 (under BE 285 ✓) men ROAS 1,35 (under BE 1,50 ✗). Dess köpare handlar för 327 kr mot kampanjens 427 kr. ROAS-tröskeln gäller i första hand — den driver inte när AOV rör sig.
