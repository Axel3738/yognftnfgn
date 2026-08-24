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

**Utfall:** fylls i av nästa `/cs`.
