# Batch-logg – Sushi-Strumpor (Matstrumpor.se)

Konto: nya kungen `730973156224390` · Skalningskampanj `MATSTRUMP_SALES_20260826` (`120251217860260023`)
Dömregel: ingen dom under 300 kr spend eller 3 köp. Kill-golv: ROAS 1,0 (break-even saknas).

Batch #1 och #2 är rekonstruerade ur grenen `claude/build-shrinepro-like-theme-pfalsx`
(`docs/matstrumpor-batch-log.md`) och kontot. Utfallen är riktig kontodata 2026-08-01 → 09-17.

---

## Batch #0 — Q4 2025 → Q1 2026 i SnarkLös `1346450049878358` (Axels egna, PAUSED)

**hypotes: ej loggad (retroaktiv rekonstruktion)** — OS:et fanns inte. 12 kampanjer, 315
annonser, 369 195 kr, 2 506 köp, ROAS 2,51. Pris 299 kr + 50 % rea. Fullständig tabell i
`forsta-batch-2026-09-17.md`. De tio största:

| Annons | Format | Spend | Köp | CPA | ROAS | Dom (inom perioden) |
|---|---|---|---|---|---|---|
| vid bästa lilla gåvan till julstrumpan (×3 kopior) | video, händer + vändningsloop, VO, julbadge | 107 369 | 1 210 | 89 | 4,2 | **Vinnare — kontots bästa någonsin** |
| En annan alla hjärtius – kopia | video, ansikte + låda, AHD | 42 280 | 264 | 160 | 2,22 | Vinnare |
| vid 5 anledningar – kopia | video, ansikte, negativ listicle, AHD | 33 000 | 183 | 180 | 2,03 | Lönsam, sämre än loopen |
| Vid Clean asmr typ (×2) | video, händer, ASMR, julbadge | 33 985 | 167 | 203 | 1,73 | Lönsam |
| Det är typ den perfekta balansen – kopia | video, ansikte | 15 046 | 71 | 212 | 1,70 | Lönsam |
| 2026-03-16 problemet med de flesta påskgåvor | video, påsk, ingen produkt i ruta 1 | 11 103 | 50 | 222 | 1,90 | Lönsam |
| Gamla julbilden alla hjärtans dag edition | bild, produktmakro + rad + 50 %-badge | 3 579 | 26 | 138 | 2,59 | Vinnare (bild) |
| Fiskbil | bild, AI-scen, person, liten produkt | 3 550 | 13 | 273 | 1,35 | Sämsta bilden |
| Rullande band en hel värld (×2) | bild, AI-scen, "fri frakt" | 4 541 | 31 | 146 | 2,57 | Lönsam |
| bild inte den du tror – kopia | bild, produktmakro + rad + 50 %-badge | 2 344 | 23 | 102 | 3,77 | Vinnare (bild) |

## Batch #1 — 2026-08-25, 17 UGC-videor (kampanj `_20260825`, ABO 6 × 200 kr)

Hypotes (loggad i förväg på grenen): hög intensitet slår låg; s001 = kontrollen (lugn
grundarberättelse). Primärtext E1 + rubrik "Rolig i kväll. På fötterna i morgon." konstant.
**Utfall:** kampanjen pausades 2026-08-26 och ersattes av `_20260826` (CBO). 2 293 kr, 4 köp,
ROAS 0,70 — bara `s004h4_v1` (524 kr, 2 köp) och `s001h1_v1` (377 kr, 2 köp) fick spend.
Ingen annons passerade grinden. **Kontrollen s001 gick vidare som `s001h1_v2` i CBO:n och är
i dag kampanjens näst bästa annons (9 köp, CPA 212, ROAS 2,52) — låg intensitet fungerar.**
Hypotesen "hög slår låg" är därmed **inte** bekräftad; snarare motsatt signal.

## Batch #2 — 2026-08-26 → 09-14, CBO `MATSTRUMP_SALES_20260826` (Axels egen struktur)

Innehåll: haiku/fable/opus/somnet-videor (h1–h3), slideshows 010v2/011v2/012v2/013, statics
b001–b005/c/d1–d4/f, `trodde`, `julstrumpa`, `november`, 016, 017v1/v2, 019, 020, 021.
**hypotes: ej loggad per annons (retroaktiv rekonstruktion).**

**Avläsning 2026-09-17 (första riktiga, hela livstiden):** 25 834 kr, 65 köp, ROAS 1,20.

| Annons | Spend | Köp | CPA | ROAS | Bruttobidrag | Dom |
|---|---|---|---|---|---|---|
| `…_gift_ugc_haikuh3_v1` | 14 309 | 30 | 477 | 0,93 | −1 072 | **Förlorare under golvet, 51 % av spenden** |
| `…_offer_static_d3_v1` | 3 783 | 15 | 252 | 2,06 | +3 997 | **Vinnare (preliminär: enda bilden med data), freq 2,46** |
| `…_gift_ugc_haikuh2_v1` | 2 317 | 3 | 772 | 0,52 | −1 120 | Förlorare (preliminär, 3 köp) |
| `…_gift_ugc_s001h1_v2` | 1 906 | 9 | 212 | 2,52 | +2 902 | Lovande |
| `…_gift_ugc_012v2_v1` (pizza) | 1 626 | 4 | 407 | 0,95 | −80 | Osäker, fel produkt |
| d1 / d2 / d4 (statics) | 69 / 64 / 202 | 0 / 1 / 0 | – | – | – | **Aldrig testade** — CBO:n gav dem inget. Retestas i batch #3 |
| 017v1/v2, 019, 020, 021 | 0–42 | 0 | – | – | – | Just launchade (≈14/9) |
| övriga | < 400 | ≤ 2 | – | – | – | För tidigt |

Beslut ur avläsningen (Axels att verkställa — sessionen rör inte kontot):
1. `haikuh3_v1` och `haikuh2_v1` ligger under golvet med 14 309 + 2 317 kr — pausa, eller
   sänk CBO:n tills batch #3 hunnit ge d3 sällskap. 30 köp bakom domen: stabil.
2. `d3` slits (freq 2,46): batch #3:s statics är dess avlösare.

## Batch #3 — 2026-09-17, `/forsta-batch` (denna körning) — 10 statics + 5 videor + 3 retest

Struktur: **separat test-ABO** `MATSTRUMP_SALES_<launchdatum>`, ett adset per annons, lika
budget (förslag 100 kr/dag), broad SE, Advantage+, purchase. Tier 1 launchas först.
Briefer: `products/sushi-strumpor/batch-03/`. Kvot: 2 per 3-dagarscykel → 18 annonser = 9 cykler.

| Annons | Tier | Hypotes (isolerad variabel) | Källa | Utfall |
|---|---|---|---|---|
| `MATSTRUMP_sushi_curiosity_product_029_v1` | 1 | d3:s mekanik (makro + vändningsrad + badge) fungerar på EN låda med Köp 1 Få 1 | Winning DNA 2 | — |
| `MATSTRUMP_sushi_curiosity_beforeafter_030_v1` | 1 | Vändningen som stillbild (rulle ↔ strumpa) bär utan video | H2, Winning DNA 1 | — |
| `MATSTRUMP_sushi_pain_lifestyle_031_v1` | 1 | Positionen "rolig + används" som bild (låda + strumpa på fot) | Winning DNA 3 | — |
| `MATSTRUMP_sushi_conflict_comparison_032_v1` | 1 | Anti-presentkort-konflikten (Paket D) slår ren produkt | H3 | — |
| `MATSTRUMP_sushi_social_textheavy_033_v1` | 2 | Verklig siffra (2 576 lådor förra julen) som bevis; jul tillåten | H4 | — |
| `MATSTRUMP_sushi_identity_product_034_v1` | 2 | Mottagarvana riktad till givaren ("extra lax") | H5, koncept S4 | — |
| `MATSTRUMP_sushi_offer_product_035_v1` | 1 | Nära iteration av d3: samma bild, rubrik mot pappan/farfar ("alla klappar lösta"), Köp 2 Få 2 | Winning DNA 2, H6 | — |
| `MATSTRUMP_sushi_gift_product_036_v1` | 2 | Fjolårets vinnar-VO-rad ("lilla gåvan till julstrumpan") som static; jul | Winning DNA 4 | — |
| `MATSTRUMP_sushi_curiosity_product_037_v1` | 1 | **Kontroll:** textfri produktbild, ingen badge — mäter vad textlagret ger | H1 | — |
| `MATSTRUMP_sushi_curiosity_product_038_v1` | 1 | OBS-etiketten ("INTE SUSHI") som curiosity-hook i bild | 010:s "Detta är inte sushi" | — |
| `MATSTRUMP_sushi_offer_static_d1_v2` / `d2_v2` / `d4_v2` | 1 / 2 / 2 | Retest av tre färdiga BOGO-statics som CBO:n aldrig gav spend | Batch #2 | — |
| `MATSTRUMP_sushi_curiosity_ugc_039h1_v1` | 2 | Vändningsloopen (händer, låda i ruta 1, 5 reveals) med VO, säsongsneutral — remake av fjolårets mekanik | Winning DNA 1 | — |
| `MATSTRUMP_sushi_curiosity_ugc_040h1_v1` | 2 | Samma klipp utan VO (ASMR + captions): VO vs ljud som enda variabel | Winning DNA 1 (`Clean asmr`) | — |
| `MATSTRUMP_sushi_gift_ugc_041h1_v1` | 2 | Överlämningen — lådan räcks över som takeaway, öppnas, vändning, fötter | VOC "reaktionen", BOGO-hook D4 | — |
| `MATSTRUMP_sushi_offer_anim_042_v1` | 2 | Format transfer: vinnarbilden d3 som 6 s motion static | Winning DNA 2 | — |
| `MATSTRUMP_sushi_pain_comparison_043_v1` | 2 | Byrålådan: skämtpresenter som glöms vs strumpan som används, utan tal | Winning DNA 3 | — |

**Bildannonserna 029–038 genererades av sessionen samma dag** (kie.ai nano-banana-edit med produktfoton som referens + eget textlager, `batch-03/bild-kor.mjs` + `lager.py`, manifest i `bild-manifest.json`), granskades visuellt (031, 034, 035, 030 kördes om: bara ben utan byxor, en fingertopp, sex lådor i stället för fyra, letterbox) och ligger i Notion som `To be Reviewed` med 4:5 + 1:1. Videorna 039–043 är hos redigerarna. **Revision 2026-09-17 10:45 (Axel, Notion-kommentar):** 030 hade mörk rubrik som smälte in i lådan i 1:1 — omgjord med vit text + skugga som de övriga, filerna utbytta. Lärdom: alltid vit text med skugga, aldrig mörk text över produkten.

Hook-varianter (h2/h3 på 039 och 041) är skrivna men ligger i backloggen tills h1 fått data —
Axels tak: max 5 videor i första ronden.

## Nästa avläsning

När Tier 1 nått ≥300 kr per adset (≈3 dygn på 100 kr) — `/cs sushi-strumpor`. Marginal-CPA
kräver snapshots ≥3 dygn isär och ≥5 inkrementella köp; den här avläsningen är snapshot 2
(snapshot 1 = 2026-08-28 på grenen).
