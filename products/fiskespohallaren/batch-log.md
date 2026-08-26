# Batch-logg — Fiskespöhållaren 4-Pack

## Batch #1 — originallaunchen (2026-08-18, +våg 2 2026-08-19)

**Struktur:** CBO 4 000 kr/dag (`Fiskespöhållaren | BE ROAS 1.50 | Launch 2026-08-18`, id 120249850522830291), 5 koncept-adsets: PD (demo), CS (rea-urgency), SP (social proof), SO (pris-offer), GT (gåva). 21 creatives våg 1 + 5 genuint nya våg 2 (2 extra PD_EXTRA-råklipp + 3 H3-omtag; SO-omuppladdningarna med rättat pris räknas som revisioner). Loggat i kvoten: 21 (18/8) + 5 (19/8). Briefades utanför repot — H1/H2/H3-manusen saknas här (begärda).

**Hypoteser (rekonstruerade — batchen briefades innan produktminnet fanns):**
- PD: rå demo säljer utan polish → **UTFALL: JA, preliminärt.** 23 köp, CPA 63–145.
- CS: urgency/rabatt driver köp → **Oklart:** CPA 143,80 (4 köp) = demo-nivå; claimen dessutom osann → ersätts.
- SP/SO/GT: ingen data — CBO-svälta (<100 kr styck).

**Avläsning 2026-08-21 (~2,5 dygn):** 3 705 kr, 33 köp, CPA 112,28, ROAS 3,93, CTR 4,21 %, CPM 143. Funnel 25 933 → 717 LPV → 62 ATC → 33 köp. Shopify: 37 ordrar/17 918 kr sedan 17/8. Full analys: `docs/briefs/rodholder-batch2-2026-08-21/RAPPORT.md`.

**Avläsning #2, 2026-08-21 ~06:15 UTC (`/cs`):** delta sedan morgonens avläsning: +4,77 kr spend, 0 nya köp, budget oförändrad 4 000 kr/dag, alla 5 felpris-pauser står kvar. Inga domar ändrade — PD_1_H1 fortfarande under spend-grinden (242,54 kr). Marginal-CPA-grinden (2b: ≥3 dygn, ≥5 köp) öppnar tidigast 2026-08-24. Ingen ny batch byggd: batch #2 (15 briefer ≥ kvoten 14) är levererad men ej launchad — nästa riktiga `/cs` körs efter launch + ≥3 dygns data.

**Åtgärder 2026-08-21 (denna session):**
- Pausade 5 felpris-annonser (149 kr mot sidans 289 kr): 120249850587690291, 120249850594370291, 120249850597910291, 120249850596710291, 120249856850670291. Den sista hade rättad body men "4-PACK – 149 KR" inbränt i bilden.
- Registrerade produkten i products.json (BE 1,50/285 kr, target 2,40/178 kr, budget 4 000 kr/dag → kvot 14/cykel).
- Flaggade jämförpriset 148,75 kr (bakvänt) → Axel beslutade "ta bort det" samma dag; compareAtPrice satt till null via Shopify API (pris 289 kr orört, verifierat). CS-annonserna med "40 % RABATT" (CS_1_H1/H2/H3) kör vidare tills batch #2-ersättarna är live — claimen saknar nu helt stöd på sidan, byt så fort Rodholder_CS_3_1/SO_3_H1 är producerade.

**Notion-hub skapad av Axel 2026-08-21:** "Fish rod holder" (database `3c3270ab-908c-80f8-824d-eed3c4aa94e1`, collection `3c3270ab-908c-8356-ad6c-87ff779e647d`) — registrerad i products.json med `scaling: true` (hub + 4 000 kr/dag = redigerarflödet). Batch #2-brieferna laddas upp dit via `/notion`.

## Batch #2 — briefad 2026-08-21 (EJ launchad ännu)

15 creatives (7 video, 6 statics, 2 hook-varianter), briefer i `docs/briefs/rodholder-batch2-2026-08-21/`. Launchas i **nytt separat test-ABO** (lika budget ~100 kr/dag/annons), INTE i skalnings-CBO:n.

| Annons | Hypotes | Status |
|---|---|---|
| Rodholder_PD_3_H1/H2 | Fler råklipp = fler vinnare (variabel: klippet + hooken) | Redo |
| Rodholder_PD_4_H1 | Captions på vinnarklipp höjer hold utan CVR-tapp | Redo |
| Rodholder_PD_5_H1 | Situationshook "när det hugger" slår förvaringshook | Redo |
| Rodholder_PD_8_H1/H2 | Trasselhärva som hook-objekt stoppar scrollen hårdare | Redo |
| Rodholder_SO_3_H1 | Sann värde-framing (72 kr/st) ersätter osann rabatt | Redo |
| Rodholder_PD_9_H1 | Före/efter garagevägg öppnar förvaringssegmentet | Redo |
| Rodholder_GT_3_H1 | Gift-vinkeln (MÄRKT GISSNING — ingen datakälla) | Tier 3 |
| Rodholder_PD_6_1 | Demo-static (b020-stil) | Redo |
| Rodholder_PD_7_1 | Utan/Med-jämförelse | Redo |
| Rodholder_SP_3_1 | Testimonial med RIKTIG recension | **BLOCKER: recensionstext** |
| Rodholder_SO_4_1 | Listicle "4 hållare, 4 platser" | Redo |
| Rodholder_CS_3_1 | Sann offer-static 289 kr/72 kr per st | Redo |
| Rodholder_PD_10_1 | Risk/skydda ditt dyraste spö | Redo |
| Rodholder_PD_18_H1/H2 | "Hårsnodden" — ÄKTA VoC (Axels kompisresearch): folk strular med hårsnoddar som fulhack; visa deras eget hack + klämman som ersättare. Syskon till PD_8, isolerad variabel: fienden (hårsnodd vs trasselboll). Tillagd 2026-08-24 på Axels order | Redo — ägarprioriterad |

**Notion-uppladdning 2026-08-21 (`/notion`):** alla 15 annonser uppladdade till Fish rod holder-hubben som items i Draft + `Video - Pending Approval`, hela briefen inklistrad i varje item. SP_3_1-itemet är märkt ⛔ BLOCKED (väntar på riktig recensionstext), GT_3_H1 märkt Tier 3.

**Drive-mapp skapad 2026-08-21 (Axels go):** `BÄVER/TEMU-601104615671651 Fiskespöhållare/Batch #2 briefs (2026-08-21)/` (mapp-id `1tzWG2if8SsFI2TpAIAz-cfVF7OD20nrM`) med undermappar `video-ads-briefs` (README + 7 brief-docs) och `image-ads-briefs` (README + 6 brief-docs) — alla som Google Docs. Alla 15 Notion-items har Drive-länken överst ("Brief in Drive (use this)"). Mappnamnet följer SOP-06 (SKU + referensnamn). Reference-asset-BILDERNA ligger i `image-ads-briefs.zip` (levererad i chatten) + repot — inte i Drive; README:erna pekar på produktsidan för produktsanning. Brief-källan i repot: `docs/briefs/rodholder-batch2-2026-08-21/`.

**Utfall:** fylls i vid nästa `/cs`-avläsning (tidigast 3 dygn efter launch, ≥5 köp för marginal-CPA — 2b-grinden).

## Batch #3 — "DEMO GRIND", briefad 2026-08-21 på Axels direkta order (EJ launchad ännu)

**Ägarinput (Axel, 2026-08-21):** "den basic ass-videon går bäst — den som är på engelska. Jättetydlig produkt som bara visar hur den fungerar. Mer sådana." Beslut: en hel batch av rena, textfria produktdemos, byggd utan ny performance-data (medvetet — ägarbeslut går före vänta-på-data). Noterat i DNA: engelskt tal/text i råklipp är inget hinder för svensk publik.

**14 ads = 7 demo-koncept × 2 hooks.** ALLA kör vinnarcopyn ordagrant som primärtext — enda variabeln är vad videon visar. Ingen ny svensk copy skrevs (ergo ingen subagent — återanvändning av bevisad copy). Briefer: `docs/briefs/rodholder-batch3-2026-08-21/` + Drive "Batch #3 briefs – DEMO GRIND" (`1CjQoPbDwiqWcVxyXo5zgo82jZg5yItXC`) + 14 Notion-items (Draft, Video - Pending Approval).

| Annons | Demo-moment | Variabeltaggar (gemensamt: vinkel=problem/lösning, format=rå demo, proof=demo, offer=ingen, text=ingen, talare=ingen) |
|---|---|---|
| Rodholder_PD_11_H1/H2 | "Klicket" — macro-klick 2–3 vinklar | hook=klick vs lyft |
| Rodholder_PD_12_H1/H2 | "En hand" — enhandsstängning, 1 sekund | vinkel=bekvämlighet; hook=stängning vs upptagen hand |
| Rodholder_PD_13_H1/H2 | "Alla fyra" — fyra spön i rad, rytm | proof=antal; hook=klick 1 vs färdig rad |
| Rodholder_PD_14_H1/H2 | "Skruven" — väggmontering, två skruvar | vinkel=förvaring; hook=skruv vs klick-i |
| Rodholder_PD_15_H1/H2 | "Skaka-testet" — upp-och-ner, håller | proof=stresstest; hook=flip vs macro |
| Rodholder_PD_16_H1/H2 | "Passar alla" — tunt + grovt spö, samma klämma | vinkel=invändningskross; hook=tunn vs grov |
| Rodholder_PD_17_H1/H2 | "Bagageluckan" — transport utan trassel | vinkel=transport; hook=lucka vs lyft |

**Utfall:** fylls i av nästa `/cs` efter launch. OBS: launcha i test-ABO:t (regel 11), aldrig i skalnings-CBO:n. Batch #2 + #3 = 29 briefer totalt i kö → täcker kvoten (14/cykel) för cykel 2 OCH 3.

## Avläsning #3, 2026-08-24 (`/cs` — körning #3)

**Stort läge:** Batch #2+#3 launchades 22–24/8 (27 ads loggade i kvoten) — **i skalnings-CBO:n, INTE i separat test-ABO. Regel 11 bröts vid launchen** (femte gången i kontot). ~20 av 27 Rodholder-ads svälter under 100 kr. Namnavvikelser vid launch: `Rodholder_PD_8_H2_H1/H2` och `PD_3_H2_H1/H2` (dubbla hooksuffix).

**Datakvalitet:** `spend × ROAS` = `omni_purchase_values` på samtliga rader ✓. Kampanj ~22 200 kr, 163 köp, CPA ~136.

**Vinstbidragstabell (livstid 6 dygn, BE-CPA 285, bedömbara ≥300 kr & ≥3 köp), sorterad på vinst:**

| Annons | Spend | Köp | CPA | ROAS | Vinstbidrag | Marginal-CPA sedan 21/8 (2b ✓) |
|---|---|---|---|---|---|---|
| PD_EXTRA a (benchmark, 26,5 % spendandel) | 5 892,50 | 42 | 140,30 | 3,11 | **6 077 kr** | 139 |
| PD_EXTRA c | 3 286,86 | 28 | 117,39 | 3,53 | **4 693 kr** | 143 |
| CS_1_H1 ⚠️ osann claim | 2 186,56 | 22 | 99,39 | 4,29 | **4 083 kr** | **89** (freq 1,56 — högst) |
| PD_EXTRA b | 3 090,08 | 21 | 147,15 | 2,84 | **2 895 kr** | 148 |
| **Rodholder_PD_15_H1 (Skaka-testet, batch #3)** | 3 531,72 | 22 | 160,53 | 2,94 | **2 738 kr** | 161 (allt inom fönstret) |
| PD_1_H1 | 3 256,83 | 18 | 180,94 | 2,71 | 1 873 kr | 215 |

För tidigt men lovande: CS_1_H3 ny video 251 kr/6 köp (spend under grind), CS_2_1 326 kr/2 köp, PD_16_H1 172 kr/1 köp. Övriga <100 kr — CBO-svält, ingen dom. Inga kill-kandidater (allt bedömbart under BE 285).

**Metrik-diagnos:** PD_15_H1 hold 23,5 % (3× råklippens 5,9–6,4 %) men CTR 2,59 % (< PD_EXTRA 3,4–3,6) — proofen håller kvar, hooken stoppar mindre. PD_1_H1: marginal 215, håller på att tappa mot benchmark. CS_1_H1 freq 1,56 = första mättnadssignalen i kampanjen.

**Hypotesutfall (batch #1–#3):**
- PD rå demo → **HÖLL** igen (91 köp över 3 klipp).
- Regressionsregeln → **HÖLL** (PD_1_H1 60,58→180,94; PD_EXTRA c 62,64→117,39).
- PD_15 skaka-test-proof → **HÖLL, preliminär-stark** (22 köp; hold 3×).
- PD_4 captions-på-vinnarklipp, PD_5 hugget, PD_8 trasselboll, PD_18 hårsnodd, PD_16/17, statics → ingen dom (CBO-svält eller nyss launchade).
- PD_9 Garageväggen → **UTGICK** (fel produktförståelse, pausad i Meta 2026-08-24, 11,92 kr spend). PD_14 Skruven → UTGICK före launch.
- CS_1_H1 (osann rabatt) → marginellt billigast (89 kr) men byts av integritetsskäl; sann offer-framing (SO_3/CS_3) måste få budget för att skilja vinkel från lögn.

**PRODUKTKORRIGERING (ägarens ord, 2026-08-24):** klämmorna fäster inte spön i någonting — de klämmer ihop det delade spöts två halvor till ett prydligt paket vid transport. Alla vägg-formuleringar rättade i briefer + Notion; PD_9_H1 pausad. ⚠️ Shopify-LP:n säger fortfarande "Monteras enkelt på vägg eller i båten" — butiksändring, Axels beslut väntar.

## Batch #4 — "IHOP-PAKETET", briefad 2026-08-24 (VoC-driven + korrigerat produktjobb)

14 creatives (6 videokoncept × 2 hooks + 2 statics), alla pekar på VoC-kategori + citat (docs/voc-reddit-fiskespohallaren-2026-08-24.md). Launchas i separat test-ABO — INTE i CBO:n.

| Annons | Hypotes (VoC-källa) | Variabeltaggar (gemensamt: format=demo-video/statics, offer=ingen, talare=ingen) |
|---|---|---|
| Rodholder_PD_19_H1/H2 | Kardborre-proceduren som fiende — visa deras omständliga metod vs ett klick (VoC kat 3, bevisad) | vinkel=ersätt-fulhacket typ A; hook=procedur vs fråga; proof=jämförelse |
| Rodholder_PD_20_H1/H2 | Kylväske-kaoset i bagaget — delarna flänger runt bland packningen (VoC kat 1, bevisad) | vinkel=transportkaos; hook=bagagelucka vs fråga; proof=demo |
| Rodholder_PD_21_H1/H2 | Ren textfri demo av RÄTTA jobbet: dela spöt, kläm ihop halvorna, bär som ETT paket (vinnarformeln + korrigering) | vinkel=problem/lösning; hook=ihopklämning vs bär-i-en-hand; text=ingen |
| Rodholder_PD_22_H1/H2 | Spontanfisket — hopklämt och redo i bilen, isär på en sekund vid vattnet (VoC kat 5) | vinkel=alltid-redo; hook=paket-i-bagage vs efter-jobbet; proof=demo |
| Rodholder_PD_23_H1/H2 | Skummet — band/snoddar glider, skumgummit greppar (VoC kat 3+7; PD_15 visade att proof håller kvar) | vinkel=differentiering/proof; hook=glid vs grepp; proof=stresstest |
| Rodholder_SO_5_1 | Rättad listicle "hela resan" utan vägg (VoC kat 1/4) | vinkel=värde-bredd; format=collage-static |
| Rodholder_PD_24_1 | Före/efter: spretande halvor vs hopklämt paket (VoC kat 4) | vinkel=kontrast; format=split-static |

**Utfall (avläsning #4):** endast PD_23_H1 (109 kr, 1 köp) och PD_21_H1/H2 fick delivery — resten under 15 kr. Ingen dom. Batch #4-adsetet ("PD Batch 4") har 815 kr / 5 köp / CPA 163 / ROAS 2,45 — lovande men under grinden per annons.

## Avläsning #4, 2026-08-26 (`/cs` — körning #4)

**Ägarinstruktion:** "kolla på alla metrics tillsammans och inte bara t.ex. CPA eller ROAS — då missar du halva bilden." Analysen kördes därför på hela tratten (impressions → hook → hold → CTR → LPV → ATC → IC → köp) plus dagstrend, inte bara slutmetriken. Det var avgörande: livstidssiffrorna ser friska ut och döljer att kampanjen tappat lönsamheten de senaste tre dygnen.

**Datakvalitet:** `amount_spent × purchase_roas` = `omni_purchase_values` på samtliga rader ✓ (max avvikelse 0,01 %). Kampanj livstid 43 619 kr, ~243 köp.

**Strukturfynd:** teamet har byggt 15 adsets, ett per batch (`PD`, `PD Batch 2–7`, `CS`, `CS Batch 2–3`, `SO`, `SO Batch 2`, `GT`, `GT Batch 2`, `SP`). ⚠️ **Budgettypen gick INTE att verifiera** — Meta-MCP:t returnerar varken `daily_budget` eller `lifetime_budget` på adset-nivå här, och inget adset visade egen budget. Det är förenligt med att budgeten fortfarande ligger på kampanjnivå (CBO), vilket i så fall betyder att regel 11 fortfarande bryts trots att strukturen ser rätt ut — men **det är en observation, inget konstaterande**. Spendfördelningen stöder misstanken: batch 4–7-adsetsen får 94–815 kr medan batch 1 tar 24 811 kr. Axel eller den som byggde adsetsen får bekräfta i Ads Manager. Adsetens livstid:

| Adset | Spend | Köp | CPA | ROAS |
|---|---|---|---|---|
| CS (urgency) | 5 217 | 43 | **121** | **3,47** |
| PD (batch 1) | 24 811 | 141 | 176 | 2,48 |
| PD Batch 2 | 9 041 | 41 | 221 | 2,06 |
| SO Batch 2 | 834 | 4 | 209 | 1,80 |
| PD Batch 4 | 815 | 5 | 163 | 2,45 |
| PD Batch 3 | 2 061 | 6 | 344 | 1,38 ⚠️ under BE |

**⛔ DAGSTRENDEN — viktigaste fyndet i hela produktens historia:**

| Dag | Spend | Köp | CPA | ROAS | CPM | CTR | Freq | ATC/klick | Köp/klick | Vinst/dag |
|---|---|---|---|---|---|---|---|---|---|---|
| 19/8 | 821 | 10 | 82 | 4,86 | 160 | 4,57 % | 1,30 | 8,2 % | 5,49 % | +2 029 |
| 20/8 | 2 897 | 23 | 126 | 3,64 | 139 | 4,13 % | 1,39 | 7,3 % | 3,57 % | +3 658 |
| 21/8 | 4 351 | 43 | 101 | 4,02 | 127 | 4,04 % | 1,35 | 7,6 % | 4,56 % | **+7 904** |
| 22/8 | 4 804 | 33 | 146 | 3,19 | 119 | 2,88 % | 1,30 | 7,4 % | 4,35 % | +4 601 |
| 23/8 | 9 506 | 54 | 176 | 2,55 | 121 | 2,79 % | 1,40 | 6,1 % | 3,56 % | +5 884 |
| 24/8 | 6 878 | 30 | 229 | 1,85 | 110 | 2,60 % | 1,44 | 5,4 % | 2,69 % | +1 672 |
| 25/8 | 8 595 | 32 | 269 | 1,60 | 116 | 2,69 % | 1,46 | 5,0 % | 2,27 % | +525 |
| 26/8 | 5 829 | 18 | **324** | **1,32** | 127 | 2,38 % | 1,45 | 4,6 % | 2,46 % | **−699** |

Senaste 3 dygnen: 21 302 kr spend → 1 498 kr vinst (**0,07 kr per spendkrona**).
19–21/8: 8 069 kr spend → 13 591 kr vinst (**1,68 kr per spendkrona**).
**Kampanjen tjänade mer pengar på 4 350 kr/dag än den gör på 8 600 kr/dag.**

**Diagnos — det är INTE creative fatigue:** frekvensen är låg och platt (1,30 → 1,45) och CPM har *sjunkit* (160 → 127). Vore det utmattning skulle båda stiga. Tappet ligger i kvalificeringen: CTR nästan halverad (4,57 → 2,38 %), ATC/klick halverad (8,2 → 4,6 %), köp/klick halverad (5,49 → 2,46 %). Meta måste hitta dubbelt så många människor per dygn och de nya är sämre kvalificerade. Attributionsfördröjning gör 25–26/8 något värre än verkligheten, men 24/8 (ROAS 1,85 mot 4,02 den 21/8) ligger utanför det fönstret. **Slutsats: skalningsutspädning, inte trötta creatives.**

**Vinstbidragstabell (livstid, BE-CPA 285 kr, bedömbara ≥300 kr & ≥3 köp), med hela tratten:**

| Annons | Spend | Köp | CPA | ROAS | Vinstbidrag | Andel vinst | hook | hold | ATC/LPV | köp/klick | freq |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PD_EXTRA a (benchmark) | 8 914 | 51 | 175 | 2,47 | **5 621** | 22,3 % | 94 % | 6,4 % | 9,5 % | 3,12 % | 1,26 |
| CS_1_H1 ⚠️ osann claim | 3 899 | 31 | 126 | 3,41 | **4 936** | 19,5 % | 94 % | 8,0 % | 9,3 % | 4,49 % | 1,76 |
| PD_EXTRA c | 3 952 | 30 | 132 | 3,14 | **4 598** | 18,2 % | 95 % | 7,7 % | 8,0 % | 3,65 % | 1,15 |
| PD_EXTRA b | 5 612 | 29 | 194 | 2,12 | 2 653 | 10,5 % | 94 % | 7,3 % | 6,2 % | 2,55 % | 1,26 |
| PD_1_H1 | 6 173 | 30 | 206 | 2,32 | 2 377 | 9,4 % | 96 % | 7,2 % | 8,1 % | 3,74 % | 1,36 |
| PD_15_H1 (Skaka) | 8 338 | 36 | 232 | 2,00 | 1 922 | 7,6 % | 95 % | **25,0 %** | 6,2 % | 2,60 % | 1,44 |
| **CS_1_H3** ⚠️ osann claim | 387 | 8 | **48** | 8,98 | 1 893 | 7,5 % | 94 % | 7,0 % | **19,4 %** | **10,39 %** | 1,49 |
| PD_16_H1 (Passar alla) | 599 | 5 | 120 | 3,34 | 826 | 3,3 % | 93 % | 16,2 % | 10,7 % | 6,33 % | 1,40 |
| PD_6_1 (static) | 649 | 4 | 162 | 2,32 | 491 | 1,9 % | – | – | 13,2 % | 7,27 % | 1,43 |
| CS_2_1 | 727 | 3 | 242 | 1,35 | 128 | 0,5 % | – | – | 10,1 % | 2,91 % | 1,96 |
| PD_11_H2 (Klicket, pausad) | 1 902 | 6 | 317 | 1,50 | **−192** | −0,8 % | 94 % | 17,6 % | 6,9 % | 2,46 % | 1,20 |

⚠️ **CS_2_1 är ett exempel på varför enmetriks-domar är förbjudna:** CPA 242 ligger *under* break-even 285 och ser godkänd ut — men ROAS 1,35 ligger *under* break-even 1,50. Dess köpare handlar för 327 kr i snitt mot kampanjens 427. ROAS-tröskeln gäller i första hand (ANALYSMETOD steg 3) → annonsen går med förlust trots godkänd CPA.

**Creative-teardown — variabeltabell (vinst per spendkrona):**

| Variabelvärde | Ads | Spend | Vinstbidrag | Vinst/spendkrona |
|---|---|---|---|---|
| Offer = urgency (CS) | 3 | 5 013 | 6 957 | **1,39 kr** |
| Offer = pris syns | 1 | 649 | 491 | 0,76 kr |
| Offer = ingen | 7 | 35 489 | 17 806 | 0,50 kr |
| Hold LÅG (<10 %) | 6 | 28 936 | 22 079 | **0,76 kr** |
| Hold HÖG (>15 %) | 3 | 10 838 | 2 557 | **0,24 kr** |
| Koncept: UGC-hand UTE | 1 | 387 | 1 893 | **4,90 kr** |
| Koncept: invändningskross | 1 | 599 | 826 | 1,38 kr |
| Koncept: UGC-hand INNE | 1 | 3 899 | 4 936 | 1,27 kr |
| Koncept: rå leverantörsdemo | 4 | 24 651 | 15 249 | 0,62 kr |
| Koncept: static | 2 | 1 376 | 619 | 0,45 kr |
| Koncept: proof/stresstest | 1 | 8 338 | 1 922 | 0,23 kr |
| Koncept: macro-klick | 1 | 1 902 | −192 | −0,10 kr |

**Tre mönster, översatta till briefinstruktioner:**

1. **HÖG HOLD SÄLJER INTE — det är produktens viktigaste motbevis (BEVISAD, 3 annonser mot 6).** Hög hold ger 0,24 kr vinst per spendkrona, låg hold 0,76 kr. PD_15_H1 håller kvar 25 % (4× kontots snitt) och konverterar sämst av alla stora (2,60 % köp/klick). PD_11_H2 med 17,6 % hold är kontots enda förlustannons. Rotorsak (hypotes): macro-demo av klicket är *tillfredsställande att titta på* men skapar inget köpbehov — tittaren stannar för hantverket, inte för problemet. **Undantaget bevisar regeln:** PD_16_H1 har både hög hold (16,2 %) och hög konvertering (6,33 %) — den besvarar en invändning i stället för att fascinera. → **Briefinstruktion: sluta optimera för hold. Ingen ny brief får ha "håll kvar tittaren" som mål. Varje demo måste besvara en tveksamhet, inte visa ett hantverk.** Detta upphäver delvis avläsning #3:s slutsats att PD_15:s proof-mönster "HÖLL" — det höll på hold, men hold var fel mål.

2. **MILJÖN I BILDEN ÄR DEN STARKASTE ENSKILDA VARIABELN (preliminär — 8 köp).** CS_1_H1 och CS_1_H3 har **identisk primärtext, headline, CTA och erbjudande** — enda skillnaden är videon. H1 är filmad inomhus mot en grå soffa: 4,49 % köp/klick, ATC/LPV 9,3 %. H3 är filmad ute i riktig fiskemiljö (grönt landskap, riktigt rött spö, mikrofon i bild): **10,39 % köp/klick, ATC/LPV 19,4 %, CPA 48 kr**. Det är 2,3× konvertering på samma ord. → **Briefinstruktion: varje ny video filmas på plats där fisket sker — vid vattnet, vid bilen, i båten. Studio, soffa och neutral bakgrund är förbjudna. Kontexten är inte dekor, den är kvalificeringen.**

3. **INVÄNDNINGSKROSS KONVERTERAR, PRODUKTVISNING GÖR DET INTE (BEVISAD).** De tre högsta köp/klick-talen i kontot är CS_1_H3 (10,39 %), PD_6_1 (7,27 %, static med pris) och PD_16_H1 (6,33 %, "passar tunt OCH grovt spö"). Alla tre svarar på en fråga köparen faktiskt har. De rena demo-klippen ligger på 2,5–3,7 %. → **Briefinstruktion: varje brief måste namnge den invändning den krossar, högst upp. Saknas invändningen får briefen inte produceras.**

**Hypotesutfall (batch #2–#4):**
- PD_15 skaka-test-proof → **FÖLL vid andra avläsningen.** Höll på hold (25 %), föll på vinst (0,23 kr/spendkrona, näst sämst). Avläsning #3:s "preliminär-stark" var ett hold-mätfel — 2c-regeln räddade oss från att skriva in den som BEVISAD.
- PD_11 "Klicket" → **FÖLL.** Enda förlustannonsen (−192 kr), pausad av teamet. Macro-fascination utan problem.
- PD_16 "Passar alla" → **HÖLL, preliminärt** (5 köp). Bästa CVR bland batch #3.
- PD_6_1 demo-static → **HÖLL, preliminärt** (4 köp). Högst ATC/LPV av alla PD.
- CS_1_H3 → **NY VINNARE, preliminärt** (8 köp). Se mönster 2.
- Regressionsregeln → **HÖLL igen** (PD_EXTRA a: 130 → 325 kr när spenden fördubblades).
- PD_4, PD_5, PD_8, PD_18, PD_17, PD_12, PD_13, statics, hela batch #4 → ingen dom (svält, <300 kr).

**Två nya annonsserier som teamet byggt utan brief (2026-08-25):** `Rodholder_PROD_V01–V10` (adset "PD Batch 7 – PROD-bilder", 109 kr) och `Rodholder_REA_V01–V10` (adset "CS Batch 3 – REA-bilder", 94 kr). Granskade visuellt: **identiska bilder och rubriker, enda skillnaden är foten** — PROD har "4-pack 289 kr – 30 dagars nöjd-kund-garanti", REA har CTA-pillret "Vi säljer ut lagret" + "4-pack 289 kr – så långt lagret räcker". Det är ett välbyggt isolerat test (trygghet vs brist) och budskapen använder det **korrigerade** produktjobbet ("Håller spöhalvorna hopklämda", "Ett paket i stället för två lösa delar"). Två anmärkningar: (a) namnen följer inte `docs/naming-convention.md`, (b) REA-foten är ett **obelagt lagerpåstående** — Shopify-connectorn kunde inte nås för att verifiera lagerstatus, så påståendet får varken bekräftas eller köras vidare utan Axels besked.

## Batch #5 — "KVALIFICERA, INTE FASCINERA", briefad 2026-08-26

14 creatives. Hela batchen bygger på de tre mönstren ovan: filmad på plats (mönster 2), varje brief namnger sin invändning (mönster 3), ingen brief optimerar för hold (mönster 1).

| Annons | Invändning som krossas / hypotes | Källa | Variabeltaggar |
|---|---|---|---|
| PD_26_H1/H2 "Vid vattnet" | Replikerar CS_1_H3-formeln med SANN copy — miljön är variabeln | CS_1_H3 (4,90 kr/spendkrona) | vinkel=problem/lösning; miljö=utomhus vatten; proof=demo; offer=ingen |
| PD_27_H1/H2 "Bagageluckan på riktigt" | "Får det plats i min bil?" | VoC kat 1 (~35 röster) + mönster 2 | vinkel=transport; miljö=utomhus bil; proof=demo |
| PD_28_H1/H2 "Spinnspö till havsspö" | "Passar det mitt spö?" | PD_16 (bevisad, 6,33 % CVR) | vinkel=invändningskross; proof=jämförelse |
| PD_29_H1/H2 "Skummet mot lacken" | "Skadar den spöet?" | VoC kat 2 (~25 röster) | vinkel=invändningskross; proof=macro-material |
| PD_30_H1/H2 "Linan och kroken" | "Vad gör jag med tafsen och betet?" | VoC kat 2 | vinkel=invändningskross; proof=demo |
| CS_4_1 | Ärlig anti-urgency: fast pris året runt — ersätter CS_1:s osanna rabatt | CS-adsetet 1,39 kr/spendkrona utan lögnen | format=static; offer=pris; vinkel=trovärdighet |
| SO_6_1 | "Är det värt 289 kr?" → 72 kr per klämma | backlog + PD_6_1-mönstret | format=static; offer=pris |
| SO_7_1 | "Tänk om den inte funkar för mig?" → 30 dagars garanti | PROD-serien (obeprövad, saknar dom) | format=static; proof=garanti |
| PD_31_1 | Före/efter: spretande halvor vs hopklämt paket i bagageluckan | VoC kat 1 + PD_6_1 | format=split-static; vinkel=kontrast |

**Copy:** all svensk copy skriven av sonnet-subagent enligt regel 6, mot `docs/copy-regler.md`, tre-frågorstestet redovisat per rad i varje brief. Ny gemensam primärtext ersätter CS_1:s osanna rabattext (den innehöll "40 % RABATT", "IDAG ENDAST", "Få kvar i lager" och "Fri frakt över 300kr" — inget av det håller).

**Levererat 2026-08-26:**
- Repo: `docs/briefs/rodholder-batch5-2026-08-26/` (README + 9 briefer + zip)
- Drive: `Batch #5 briefs – QUALIFY NOT FASCINATE (2026-08-26)` (mapp `1MJ5uolp_ApMIIjWOZhnS39BZATSPtZf2`) med `video-ads-briefs` (`1yeNK_IxWNIQ-DkOkt0yBS8q_GFmr5elU`) och `image-ads-briefs` (`1zalxy5esePFyLBwv1Au_cr9Xls1N6VFz`) — 10 Google Docs
- Notion: 14 items i Fish rod holder-hubben, Draft + `Video - Pending Approval`, brief inklistrad + Drive-länk överst

⚠️ **Notion-hubben har fått en ny typ `Image - Pending Approval`** (fanns inte vid batch #4). Batch #5:s fyra statics lades ändå som `Video - Pending Approval` för att följa `docs/os/NOTION-FORMAT.md` och vara konsekvent med batch #2–#4 — hade jag bytt hade statics fallit ur `/dashboard`-filtreringen som filtrerar på inkludering. **Frågan om hubben ska börja använda bildtypen är Axels** — byts den måste NOTION-FORMAT.md och dashboardfiltret ändras samtidigt, annars försvinner alla bildannonser ur mätningen tyst.

**Utfall:** fylls i av nästa `/cs`.
