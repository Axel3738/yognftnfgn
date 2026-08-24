# Creative DNA — Fiskespöhållaren 4-Pack

**Körning #3** (`/cs`, 2026-08-24; körning #1 = /forsta-batch 2026-08-21, körning #2 = /cs samma dag utan delta). Datafönster 2026-08-18 → 2026-08-24 (~6 dygn).
Full analys: `docs/briefs/rodholder-batch2-2026-08-21/RAPPORT.md`.

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

## Winning DNA (alla domar PRELIMINÄRA — 2,5 dygn, 1d_view_7d_click)

| Mönster | Bevisläge | Data |
|---|---|---|
| **Rå leverantörsdemo, produkt i bild <1 s, ingen text/polish** | Bevisad inom batchen (3 annonser, 6–9 köp vardera) — preliminär tills nästa avläsning | PD_EXTRA ×3: 2 586 kr, 23 köp, CPA 63–145, 87,5 % av bedömbart vinstbidrag |
| **Trassel-copyn**: "Trassliga fiskespön i båten – igen? / Den här lilla klämman löser det på 1 sekund / ✅×3 / Beställ ditt 4-pack" | Bevisad (23 köp bakom exakt denna text) | Återanvänd verbatim där det går |
| **Engelskt tal/text i råklipp är inget hinder för svensk publik** | Ägarinput (Axel 2026-08-21: "videon på engelska går bäst") + PD_EXTRA-datan | Kräv aldrig omdubbning av råklipp; svensk copy bär budskapet i primärtexten |
| **VoC Reddit 2026-08-24 (9 trådar, ~148 röster — se `docs/voc-reddit-fiskespohallaren-2026-08-24.md`):** (1) fulhacks-fienden är verklig i skala — gummiband/kardborre "glider runt", PVC-rör, piprensare, vax [bevisad-i-VoC, stödjer PD_18]; (2) transportögonblicket (bil/bagagelucka) väger tyngre än förvaring i kundens egen problembild [bevisad-i-VoC, stödjer PD_17]; (3) skumgummit är den sanna differentieringen — köpt hållare underkändes för att den saknade skum och släppte greppet [enstaka röst, produktverifierad] | Extraktion enligt docs/os/VOC-MINING.md | Nya koncept pekar på VoC-kategori + citat; spontanfiske-vinkeln ("riggat i bilen, fiska efter jobbet") är obeprövad kandidat |
| **VoC: "hårsnoddar" är fulhacket kunderna faktiskt använder** | ÄKTA VoC — Axels research bland fiskande vänner 2026-08-21: "man strular alltid med hårsnoddar och sånt för att hålla ihop spöna, det är så jävla jobbigt" | Konflikttyp A (fulhacket som fiende). Första riktiga kundspråket för produkten — testas i PD_18. Använd ordet "hårsnodd", inte "gummiband", i copy |
| **Proof-demo (skaka-testet, PD_15_H1) håller kvar 3× fler och konverterar** | Preliminär-stark (22 köp, enda batch #3-annonsen med riktig budget) | Hold 23,5 % vs råklippens 5,9–6,4 %; CPA 160,53 vs benchmark 140,30. Fler proof-demos i batch #4 (PD_23 Skummet) |
| Offer/urgency-vinkeln (CS_1_H1) är marginellt billigast: 89 kr/köp | Data ja — men claimen "40 % RABATT" är OSANN och annonsen byts ändå (integritetsbeslut, ej databeslut). Freq 1,56 = högst i kampanjen | Sann offer-framing (SO_3/CS_3) måste få budget för att testa om effekten är vinkeln eller lögnen |
| Hold är låg för råklipp men CVR hög → retention är inte flaskhalsen för demo-formatet | Hypotes — men PD_15 visar att hold GÅR att 3×-a med proof | Kort demo räcker; proof lyfter |
| Regression är verklig: höga kvoter på låg spend landar lägre | BEVISAD (PD_1_H1: 60,58 → 180,94; PD_EXTRA c: 62,64 → 117,39) | Skalningskandidater testas, aldrig döms, på första avläsningen |

## Losing DNA

| Mönster | Bevisläge | Rotorsak |
|---|---|---|
| **CBO för test** | BEVISAD — fjärde gången i kontot (jfr motorhöljets mönster 5) | 17/24 creatives fick <100 kr → oläsbar data. Nya tester ALLTID i separat ABO, lika budget (Axels regel 2026-08-12) |
| **Osanna offers** | Faktafel, inte performance | "40 % RABATT" utan rabatt på LP; "149 kr" efter prishöjning till 289. 5 annonser pausade 2026-08-21 (3× ZZ_GAMMAL + SO_1_H3 våg 1 som missats + SO_2_1 våg 2 vars BILD fortfarande sa 149 kr fast bodyn rättats) |
| AI-genererade människor i statics (SP_2_1:s "kund", GT_2_1:s produktformer) | Hypotes + hook-visual-regeln | Citat "Verifierad kund, 52 år" kan inte beläggas — testimonials kräver riktig recensionstext |

## Obevisat (CBO-svält — inte motbevisat)

Social proof (SP), gift (GT), samtliga statics, pris-i-copy (SO 289-versionerna). Testas innan någon döms. (Väggmonterings-vinkeln UTGICK 2026-08-24 — fel produktförståelse, se Rotorsaker.)

## Behåll alltid / Testa kontrollerat / Undvik

- **Behåll:** produkten i användning inom 1 sekund; trassel-smärtan i första raden; 289 kr utan trick; "passar alla spön"-invändningskrossen; fri frakt ENDAST med "över 300 kr".
- **Testa kontrollerat:** captions på råklipp (på/av); situationshook "när det hugger" vs förvaringshook; värde-framing 72 kr/hållare; trasselhärvan som hook-objekt; kardborre-proceduren som fiende; spontanfiske-vinkeln.
- **Undvik:** procent-rabatter tills jämförpriset är fixat; AI-människor; story-hooks utan filmbart objekt i sekund 1; att lägga nya tester i skalnings-CBO:n.

## Rotorsaker värda att minnas

1. Kontots copy kan vara rättad medan **bilden/videon fortfarande bär gammalt pris** — SO_2_1 våg 2 hade rätt body och fel bild. Granska alltid själva creativen, inte bara texten.
2. Kampanjen döptes med BE-ROAS i namnet — bra mönster, men product sheet-raden saknar COGS, så talet går inte att verifiera oberoende.
3. Recensioner finns (7 st) men texterna ligger i en JS-app → VoC-luckan blockerar testimonial-konceptet, inte datan.
