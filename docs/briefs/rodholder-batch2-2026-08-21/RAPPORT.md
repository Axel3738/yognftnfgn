# Fiskespöhållaren 4-Pack — /forsta-batch, 2026-08-21

Kampanj: `Fiskespöhållaren | BE ROAS 1.50 | Launch 2026-08-18` (id `120249850522830291`, MagiBorsten `1867947880635861`).
Produkt: **Fiskespöhållare 4-Pack – Kraftig Förvaring**, 289 kr, `fiskespohallare-4-pack-kraftig-forvaring` (bekräftad av Axel 2026-08-21).
Datafönster: 2026-08-18 19:38 → 2026-08-21 (~2,5 dygn). Batch #2-briefer: se mapparna bredvid denna fil.

---

## Executive summary

- **Produkten är en tidig vinnare.** 3 705 kr spend → 33 köp, CPA 112 kr mot break-even 285 kr, ROAS 3,93 mot break-even 1,50. Shopify bekräftar (37 ordrar, 17 918 kr sedan 17/8). Vinstbidrag ~5 900 kr på 2,5 dygn.
- **Det som vinner är den råa produktdemon.** Tre olika obehandlade leverantörsklipp (PD_EXTRA) tog 70 % av spenden och levererade 23 av 33 köp (CPA 63–145 kr). Polerade koncept fick aldrig chansen — kampanjen är en CBO, och Meta svalt 17 av 24 creatives under 100 kr. Samma mönster som dödade motorhöljets tester (Axels ABO-regel 2026-08-12 finns av exakt detta skäl).
- **Tre offer-fel hittades och åtgärdades/flaggades:** (1) fem annonser med gamla priset 149 kr var fortfarande AKTIVA — **pausade av mig 2026-08-21**, (2) Shopifys jämförpris är 148,75 kr, dvs. *lägre* än priset 289 kr — sidan visar en prishöjning i stället för en rabatt (**ägarbeslut krävs**), (3) CS-konceptets "40 % RABATT – IDAG ENDAST" backas inte av landningssidan — claimen är osann och konverterar ändå inte bättre än demon utan rabatt.
- **Batch #2 = 15 creatives** (7 video, 6 statics, 2 med BLOCKER) i ett **separat test-ABO med lika budget per annons**. Kvoten är 14/cykel — planen täcker den.

## Datakvalitet (ANALYSMETOD steg 1)

| Kontroll | Utfall |
|---|---|
| `amount_spent × purchase_roas` vs `omni_purchase_values` | ✅ Stämmer inom ±0,5 % på samtliga 7 rader med köp — **inga 100×-fel i denna kampanj** |
| `amount_spent / omni_purchase` vs `cost_per_omni_purchase` | ✅ Stämmer |
| Meta 33 köp vs Shopify 37 ordrar (produktrad, 17–21/8) | ✅ Rimligt — Shopify inkluderar organiskt/direkt |
| AOV | Meta 441 kr (14 552 kr / 33 köp), Shopify 427 kr. **427 kr används** (konvention: Shopify) → BE-CPA 285 kr |
| Attributionsvarning | 1d_view_7d_click + bara 2,5 dygns data → alla domar är **preliminära** (2c-regeln) |

## FAS 0 — Vad som faktiskt verifierades

| Källa | Status | Detalj |
|---|---|---|
| Meta kampanj/adset/ad-data | ✅ Fullt | Hela kampanjen, alla fält ur ANALYSMETOD steg 0, sorterad på spend |
| Ad-copy (bodies, titles) | ✅ Fullt | Alla 31 creatives lästa verbatim |
| Statiska bilder | ✅ Granskade visuellt | PD_2_1, CS_2_1, SP_2_1, SO_2_1, GT_2_1 nedladdade i full storlek + granskade |
| Video | ⚠️ Delvis | Kan inte öppnas. Original-manus finns INTE i repot (batchen briefades utanför det). Endast thumbnails (64 px). **Behöver: H1/H2/H3-manusen för PD/CS/SP/SO/GT** |
| Landningssida | ✅ | 289 kr, överstruket 148,75 kr (bakvänt), 7 recensioner, fri frakt-banner >300 kr |
| Shopify-försäljning | ✅ | Korsvaliderad per produkt (analytics-query) |
| Recensioner | ⚠️ Antal, inte innehåll | 7 st finns men texterna laddas via JS-app — **behöver texterna klistrade** för testimonial-briefen |
| Product sheet (Supplier Quotation) | ⚠️ Rad finns, tom | Ingen COGS, ingen footage-länk, "Ads to do" tom |
| Drive-produktmapp | ❌ | Ingen träff på SKU/namn — inte delad med connectorn |
| Meta Ad Library (SE, "fiskespöhållare") | ✅ | ~26 träffar, mest våra egna. Konkurrens: Deravio (väggställ), Peter Roempke, 3D-printad modulär hållare |

## FAS 1 — Kampanjöversikt

| | |
|---|---|
| Struktur | **CBO 4 000 kr/dag**, Highest volume, OUTCOME_SALES, AUCTION. 5 koncept-adsets (PD/CS/SP/SO/GT), attribution 1d_view_7d_click |
| Spend / köp / intäkt | 3 705,10 kr / 33 / 14 551,60 kr |
| CPA / ROAS | 112,28 kr / 3,93 (BE: 285 kr / 1,50) |
| CPM / CTR / frequency | 142,87 kr / 4,21 % / ~1,1–1,2 |
| Funnel | 25 933 visn. → 717 LPV → 62 ATC → 43 IC → 33 köp. LPV→köp 4,6 % |
| Spend per adset | PD 2 881 kr (78 %) · CS 729 kr (20 %) · SO 51 · GT 27 · SP 17 |

**Var läcker funneln?** Ingenstans allvarligt. LP:n stänger 4,6 % av besökarna trots Temu-estetisk hero-bild och det bakvända jämförpriset — kreativet är trafikmotorn och priset är lågt nog att bära. Den verkliga läckan är **strukturell**: CBO:n gav 17 av 24 creatives under 100 kr — vi *vet* inte om SP/GT/SO-vinklarna fungerar, för de fick aldrig leverans. Notera: kampanjen spenderar ~1 500 kr/dag av 4 000-budgeten — Meta hittar inte volym i denna auktion ännu.

## FAS 2 — Klassificering

Signifikansgrind: **bedömbar = ≥300 kr spend OCH ≥3 köp.** Vinstbidrag = (285 − CPA) × köp.

### Bedömbara (4 st)

| Annons (ad-id-suffix) | Spend | Andel | Köp | CPA | ROAS | CTR | Hold* | Vinstbidrag | Andel vinst |
|---|---|---|---|---|---|---|---|---|---|
| PD_EXTRA (…099190291, klipp C) | 563,77 | 15,2 % | 9 | 62,64 | 6,84 | 5,03 % | 7,4 % | **2 001 kr** | 44 % |
| PD_EXTRA (…844270291, klipp A) — *top spender, benchmark* | 1 158,43 | 31,3 % | 8 | 144,80 | 3,24 | 4,06 % | 5,9 % | **1 122 kr** | 25 % |
| PD_EXTRA (…564380291, klipp B) | 863,92 | 23,3 % | 6 | 143,99 | 2,70 | 4,44 % | 6,9 % | **846 kr** | 19 % |
| CS_1_H1 (…603660291) | 575,31 | 15,5 % | 4 | 143,80 | 2,63 | 4,02 % | 8,8 % | **565 kr** | 12 % |

*Hold = p50-tittningar/plays. Summa bedömbart vinstbidrag: **4 534 kr på 2,5 dygn.**

**Klassificering:** PD_EXTRA-konceptet (rå leverantörsdemo, 3 klipp) = **bevisad vinnare, preliminär** (23 köp men 2,5 dygn — måste överleva nästa avläsning). CS_1_H1 = **lovande med asterisk** — CPA:n är fin men claimen "40 % RABATT" är osann (se FAS 4).

### För tidigt (ingen dom — under 300 kr eller under 3 köp)

| Annons | Spend | Köp | Notering |
|---|---|---|---|
| PD_1_H1 | 242,30 | 4 | **Lovande:** CPA 60,58, ROAS 8,71 — men under spend-grinden. Låt den ligga kvar. |
| CS_1_H3 (våg 2) | 71,58 | 1 | — |
| CS_1_H2 | 49,02 | 0 | — |
| PD_1_H2, PD_1_H3, PD_2_1, CS_2_1, CS_1_H3(våg 1), SP_1_H1–H3 ×2, SP_2_1, SO_1_H3(ny) ×2, SO_1_H1(ny), SO_1_H2(ny), SO_2_1(ny), GT_1_H1–H3 ×2, GT_2_1, SP_2_1(våg 2) | 0,03–28,50 | 0 | CBO-svälta — ingen data, ingen dom |

### Pausade av mig (offer-integritet, INTE performance)

| Annons | Skäl |
|---|---|
| ZZ_GAMMAL_SO_1_H1 / _H2 / SO_2_1 "(fel pris)" | Döpta "fel pris" men stod AKTIVA. Copy: "4-pack för **149 kr**" |
| Fiskespöhållare_SO_1_H3 (…596710291, våg 1) | Missades vid omdöpningen — samma 149 kr-copy, stod aktiv |
| Fiskespöhållare_SO_2_1 (…850670291, våg 2) | Bodyn rättades till 289 kr men **bilden har "4-PACK – 149 KR" inbränt** (samma bildfil som gamla) — verifierat visuellt + samma image-URL |

**20/80:** tre råklipp + en rabattvideo (4 av 26 aktiva annonser) står för 85 % av spenden och 100 % av det bedömbara vinstbidraget. Största "budgetläckan" är inte en dålig annons — det är att 17 creatives aldrig testades.

## FAS 3 — Djupanalys: vinnarna

**Top spender-benchmark: PD_EXTRA (klipp A), CPA 144,80.** Alla jämförs mot den.

### PD_EXTRA-copyn (identisk på alla tre, 23 köp bakom sig)

| Rad | Mekanism |
|---|---|
| "Trassliga fiskespön i båten – igen? 🎣" | Smärta + plats + "igen" = igenkänning av återkommande irritation. Visualiserbar, falsifierbar. |
| "Den här lilla klämman löser det på 1 sekund." | Mekanism + tidslöfte. "Lilla" avdramatiserar priset. "1 sekund" är pekbart (demon visar det). |
| "✅ Håller ihopfällda spön säkert stängda" | Use-case 1 konkret. |
| "✅ Inga fler trassliga linor" | Konsekvensen borttagen. |
| "✅ Passar alla spön" | Invändningskross (fel storlek). |
| "Beställ ditt 4-pack idag och slipp trasslet för gott. 👇" | CTA + kvantitet. Ingen rabatt behövs. |

**Video:** rå Temu-demo — produkten i användning från bildruta 1, ingen text, originalmusik. Hold är låg (5,9–7,4 %) men **CVR är hög** (köp/LPV 3,4–7,5 %): klippet behöver inte hålla kvar folk, det behöver bara visa klämman knäppas fast en gång. Attention = produkten i rörelse; Persuasion = copyns trassel-smärta; Conversion = lågt pris + LP.

**Klipp C (CPA 62,64) vs klipp A (144,80):** samma copy, samma koncept — skillnaden är själva råklippet. Vilket klipp som visar vad kan jag inte se (video otillgänglig) — **därför testar batch #2 fler råklipp som isolerad variabel** i ABO där de får rättvis budget.

### CS_1_H1 (4 köp, CPA 143,80)

Urgency/rea-mekanik: "⏰ IDAG ENDAST – 40% RABATT … Vi rensar lagret … Få kvar i lager". Presterar **exakt som** demo-annonserna (143,80 vs 143,99/144,80) — rabattlöftet tillför alltså ingen mätbar edge, och claimen är osann (ingen rabatt finns på sidan). Slutsatsen är playbookens: **håll priset**. Vinkeln ersätts i batch #2 av sann värde-framing (72 kr/hållare).

## FAS 4 — Förlorarna

Inga bedömbara förlorare — inget kill-beslut går att fatta (inget bedömbart ligger över BE-CPA 285 kr). Det som faktiskt gick fel:

| Element | Vinnare | "Förlorare" | Trolig påverkan | Nästa test |
|---|---|---|---|---|
| Struktur | — | **CBO för test** | 17/24 creatives <100 kr = oläsbar data. Tredje gången i kontot (motorhöljets DNA mönster 5) | Batch #2 i separat test-ABO, lika budget (regel 11) |
| Offer-sanning | Demo utan rabatt (23 köp) | "40 % RABATT" (osann), "149 kr" (fel pris) | Juridisk risk + bait-and-switch vid köp; ingen CPA-edge | Sann värde-framing; jämförpris-beslut hos Axel |
| Statics | — | Alla 5 statics <26 kr spend | Ingen dom möjlig | 6 nya statics i ABO |
| SP-statiken | — | AI-genererad "kund" + citat "Verifierad kund, 52 år" som inte kan beläggas | Trust-risk; bryter hook-visual-regeln (AI-människor) | Testimonial-static med RIKTIG recensionstext (BLOCKER tills texterna finns) |

Pausa/iterera/stryk: **inget** pausas på performance. De 5 felpris-annonserna är pausade på offer-integritet. Allt annat får leva tills ABO-datan ger riktiga domar.

## FAS 5 — Creative DNA

Skrivet till `products/fiskespohallaren/dna.md` (körning #1). Kärnan:

- **Winning (preliminär):** rå produktdemo <1 s + trassel-copy + inget pris-trick. Problem/lösning-vinkeln bär 87,5 % av bedömbart vinstbidrag.
- **Losing (strukturellt):** CBO-test; osanna offers; AI-människor i statics.
- **Obevisat:** SP/GT/SO/väggmontering/statics över lag — CBO-svälta, inte motbevisade.

## FAS 6 — Kund- & konkurrentresearch

**Kundspråk:** Direktcitat saknas (recensionstexter otillgängliga — lucka). Mönster ur det som bevisligen köper (hypotes, ej VoC): "trassliga spön", "klämman", "i båten", "igen". LP-språket för systerprodukten ("Ett spö i handen, ett mellan knäna, ett på durken … det är alltid när det hugger") är vårt eget men känns igen av målgruppen — används som hypotes i V3.

**Konkurrenter (Ad Library SE):** svagt fält (~26 träffar, mest vi själva). Direkta: Deravio ("Väggmonterat fiskespöställ", kör SE från EUR-konto), Peter Roempke ("Fiskespöhållare"), 3D-printad modulär hållare (Petter Jönsson). Indirekta: spöfodral/spöställ i fiskebutiker. Ingen kör gift-vinkel, ingen kör rå demo i skala.

**3 lånade mekanismer (inte kopior):** (1) väggmonterings-framingen ur Deravios "ställ" — vi äger redan bilden (CS_2_1:s garagevägg) men har aldrig satt copy på den → V6; (2) modularitets-/antal-logiken ur 3D-print-annonsen → listicle-statiken "4 hållare, 4 platser"; (3) trust-mekaniken ur egna playbooken (049 "du får exakt vad du ser") → garantin i offer-statiken i stället för rabatt.

## FAS 7–9 — Batch #2: 15 creatives

Fullständiga, självständiga briefer i `video-ads-briefs/` och `image-ads-briefs/` (engelska, med Swedish/English-tabeller). Sammanfattning:

| # | Annonsnamn | Typ | Hypotes (isolerad variabel) | Källa |
|---|---|---|---|---|
| 1 | `Rodholder_PD_3_H1` | Video | Fler råklipp = fler vinnare (variabel: själva klippet) | PD_EXTRA 23 köp |
| 2 | `Rodholder_PD_4_H1` | Video | Brända captions på vinnarklippet höjer hold utan att sänka CVR (variabel: captions på/av) | PD_EXTRA + video-pipelinens tes |
| 3 | `Rodholder_PD_5_H1` | Video | Situationshook "när det hugger" slår förvaringshook (variabel: hooken) | PD-copyn + LP-språket |
| 4 | `Rodholder_PD_8_H1` | Video | Äcklig trasselhärva i sek 1 stoppar scrollen hårdare än produktdemo (variabel: hook-objekt) | Hook-visual-regeln + 088-mönstret |
| 5 | `Rodholder_SO_3_H1` | Video | Sann värde-framing (72 kr/hållare) ersätter osann rabatt utan CPA-tapp (variabel: offer-framing) | CS_1_H1 4 köp + playbook "håll priset" |
| 6 | `Rodholder_PD_9_H1` | Video | Före/efter garagevägg öppnar förvarings-segmentet (variabel: use-case 2) | Deravio-signal + CS_2_1-bilden |
| 7 | `Rodholder_GT_3_H1` | Video | **Märkt gissning** — gift-vinkeln obevisad, ingen källa med data. Tier 3. | (ingen — gissning) |
| 8 | `Rodholder_PD_6_1` | Static | Demo-static i b020-stil får köp när den får budget | b020 ROAS 2,53 + PD-vinnaren |
| 9 | `Rodholder_PD_7_1` | Static | Utan/Med-jämförelse (trassel vs ordning) | 088/before-after-mönstret |
| 10 | `Rodholder_SP_3_1` | Static | **BLOCKER: kräver riktig recensionstext.** Testimonial med äkta citat + riktigt foto | SP-copyns tes; 050-mönstret |
| 11 | `Rodholder_SO_4_1` | Static | Listicle "4 hållare, 4 platser" | Konkurrentsignal modularitet |
| 12 | `Rodholder_CS_3_1` | Static | Sann offer-static (289 kr / 72 kr per hållare) | CS_1_H1 + copy-regeln små sanna påståenden |
| 13 | `Rodholder_PD_10_1` | Static | Risk/skydda-vinkeln ("ditt dyraste spö") | 128 "skydda investeringen"-mönstret |
| 14 | `Rodholder_PD_3_H2` | Video | Hook-variant av #1 (samma klipp, annan första-sekund) | Hook-second-regeln |
| 15 | `Rodholder_PD_8_H2` | Video | Hook-variant av #4 | Hook-second-regeln |

Namngivning: engelskt produktnamn `Rodholder`; upptagna AD-ID:n avlästa i kontot (PD 1–2+EXTRA, CS 1–2, SP 1–2, SO 1–2, GT 1–2) — nya börjar på 3, inga återanvänds.

## FAS 10 — Testplan

**Struktur (regel 11):** NYTT separat test-ABO — kampanj `MAGI_SALES_20260822_rodholder-test`, ett adset per annons-grupp med **lika budget, 100 kr/dag per annons**, broad, Advantage+ placeringar, purchase. **Inte** in i den befintliga CBO:n (den fortsätter skala vinnarna ostört). ⚠️ Vid upload: sätt `adStatus` OCH `adsetStatus` explicit (PAUSED tills godkänd) — se CLAUDE.md-varningen om batch-skripten.

- **Tier 1 (launch direkt):** #1, #2, #3, #8, #9, #12, #14 — närmast bevisad data.
- **Tier 2 (launch samtidigt, nya vinklar):** #4, #5, #6, #11, #13, #15.
- **Tier 3 (väntar):** #7 (gift — gissning, ev. mot fars dag/jul), #10 (BLOCKER: recensionstext).
- **Domregler:** ingen dom <300 kr/3 köp. Kill när ROAS < 1,50 (CPA > 285 kr) efter ≥500 kr och trenden håller. Target 2,40 (178 kr) styr endast skalning. Vinnare flyttas till skalnings-CBO:n först efter ≥3 dygn + ≥5 köp.
- **Kvot:** 14 creatives/cykel (körning visad nedan) — planen = 15. ✅

**"Gör innan spend"-listan:**
1. **Ägarbeslut (frågan sist i leveransen):** jämförpriset 148,75 kr i Shopify — ta bort eller sätt sant referenspris. Tills dess: inga rabatt-claims i någon annons, och CS_1_H1/H2/H3 (aktiva, "40 % RABATT") bör bytas ut så fort ersättarna är live.
2. Verifiera att de nya SO-videorna (289 kr) inte har 149 kr inbränt i bild — jag kunde bara verifiera copyn, inte videoinnehållet.
3. Klistra in recensionstexterna (7 st) → låser upp #10 och ger VoC.
4. Fyll i product sheet-raden: COGS (bekräfta BE 1,50), footage-länk, "Ads to do".
5. Skicka H1/H2/H3-manusen från originalbatchen (eller Drive-mappen) så teardownet kan göras per video.

## Lärdomar

1. **Kvalitetskontrollen hittade riktiga pengar-läckor:** 5 aktiva annonser med fel pris och en osann rabatt-claim — i en kampanj som ser perfekt ut i siffrorna. Siffror utan creative-granskning hade missat allt.
2. **CBO-för-test bekräftad som strukturfel för fjärde gången** i kontot. ABO-regeln är inte byråkrati.
3. **Rå slår polerad tills motsatsen bevisats** — tre obehandlade Temu-klipp bär hela produkten. Batch #2 testar polish som isolerad variabel i stället för att anta den.
4. **Denna produkts marginal tål CPA 285 kr men betalar 112 kr** — headroom×2,5. Rätt drag är fler creatives + budgetutnyttjande (kampanjen når inte ens sin 4 000-budget), inte optimering.

## ANALYSMETOD-checklistan

- [x] Hela kampanjen hämtad, sorterad på spend
- [x] Datakvalitetskontroll körd (spend × ROAS vs values), inga trasiga rader
- [x] Signifikansgrind: "för tidigt"-högen utpekad och utesluten ur rankingen
- [x] Vinstbidragstabellen visad, sorterad på vinst
- [x] Break-even (1,50 / 285 kr) för kill, target (2,40 / 178 kr) för skalning
- [x] Top spendern (PD_EXTRA klipp A) behandlad som benchmark
- [x] Metrik-diagnos per bedömbar annons (hold/CTR/CVR/CPM/frequency)
- [x] Creative-teardown per bedömbar annons — statics granskade visuellt; videomanus SAKNAS i repot (flaggat, begärt)
- [x] Variabeltabellen (se FAS 5 / dna.md)
- [x] ≥3 mönster utpekade, märkta bevisad/hypotes, översatta till briefinstruktioner
- [x] Data skild från hypotes, antal köp bakom varje dom
