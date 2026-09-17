# Sushi-Strumpor — `/forsta-batch`, körning 1, 2026-09-17

Butik matstrumpor.se (`1r46tp-qx`) · konto **nya kungen `730973156224390`** · fjolåret i SnarkLös `1346450049878358`.
Axels ramar för rundan: ingen COGS ("fuck cogsen"), **max 5 videor**, mest bildannonser, båda kontona.

## Executive summary

1. **Skalningskampanjen förlorar pengar på sin största annons.** `haikuh3_v1` tar 51 % av spenden (14 309 kr, 30 köp) på ROAS 0,93 — under 1,0, förlust oavsett COGS. Bilden `offer_static_d3_v1` (CPA 252, ROAS 2,06) får 13 % och slits (freq 2,46). CBO:n har valt fel.
2. **Fjolårets julvinnare finns i SnarkLös**, inte "i ett konto kopplingen inte ser" som minnet sa: 369 195 kr, 2 506 köp, ROAS 2,51. Toppannonsen (händer + låda + vändningen ×5): 107 369 kr, 1 210 köp, CPA 89 kr.
3. **Bild slår video i dagens konto, och produktmakro-statics var bäst per krona även i fjol.** Därför: batch #3 = 10 statics + 3 retest + 5 faceless vändningsvideor, i eget test-ABO.
4. **Break-even saknas.** Ingen vinstbidragstabell går att räkna; rangordningen görs på bruttobidrag (intäkt − spend) med ROAS 1,0 som golv. Riktigt break-even ligger över 1,0 — allt under är säkert förlust, allt över är osäkert.

## Datakvalitet (steg 1)

| Kontroll | Resultat |
|---|---|
| `omni_purchase_values` mot spend × ROAS, nya kungen | 0 % avvikelse på alla rader med köp — fältet är friskt |
| Samma kontroll, SnarkLös | 0 % avvikelse på alla 58 bedömbara |
| Perioder | nya kungen 2026-08-01 → 09-17 (kontot tomt före 25/8); SnarkLös 2025-11-01 → 2026-09-17 (sushikampanjerna, alla PAUSED sedan april) |
| Prisnivå | 2025/26: 299 kr + 50 % rea. Nu: 399 kr + Köp 1 Få 1. **CPA jämförs bara inom period.** |
| Video-hook rate | 94–97 % överallt (autoplay) — oanvändbar. Hold = p50/plays används. |
| Pizza i sushikampanjen | `012v2_v1` (1 626 kr, 4 köp) är pizzastrumpor — särredovisad |

## FAS 0 — vad som faktiskt nåddes

| Källa | Nådd | Kommentar |
|---|---|---|
| Meta, nya kungen (ad-nivå, creatives, insights) | ✅ | 236 annonser aug→, 88 i SE-kampanjerna |
| Meta, SnarkLös sushikampanjer | ✅ | 315 annonser, copy + thumbnails |
| Statiska bilder, visuellt granskade | ✅ | d3, inte-den-du-tror, julbilden AHD, rullande band, fiskbil, d3-serien |
| Videofiler | ❌ | Kan inte öppnas. Thumbnails granskade; manus finns bara för fjolårets vinnare (`reference/julvinnaren-2025.md`). Manus för haiku/fable/opus/sonnet-videorna ligger i Drive-mappar kopplingen inte når |
| Landningssida + erbjudande | ✅ | 399 kr, Köp 1 Få 1 / Köp 2 Få 2 verifierat i HTML 2026-09-17 |
| Shopify-försäljning | ✅ (ur minnet) | Kundanalys nov 2025–mar 2026 på grenen (3 407 ordrar, förnamnsproxy) |
| Notion "Matstrumpor creative hub" | ✅ | 72 rader; 017–028 + B_Mini-clip 01–05 i produktion |
| Recensioner | ❌ | Inga på produktsidan |
| Meta Ad Library | – | Ej kört i dag; researchen 2026-07-24 och 08-23 finns i minnet |
| Break-even / COGS | ❌ | Saknas — Axels beslut att hoppa över |

## FAS 1 — kampanjöversikt (nya kungen, SE)

`MATSTRUMP_SALES_20260826`: CBO 1 000 kr/dag, 5 adsets, Advantage+, purchase. Lifetime 25 834 kr, 65 köp, ROAS 1,20, CPA 397. Plus `_20260825` (ABO, pausad efter en dag): 2 293 kr, 4 köp.
SE-kampanjerna totalt: **28 134 kr, 69 köp, intäkt 32 558 kr, CPA 408, ROAS 1,16, AOV 472.**
US/UK/AU (utanför uppdraget): 21 694 kr, 40 köp, ROAS 0,94.
Var tratten läcker vet vi från avläsning 1 (28/8): ViewContent → AddToCart 7,4 % är svagaste ledet; pixeln räknade då dubbelt så många köp som Meta attribuerade.

## FAS 2 — klassificering (bedömbara ≥300 kr & ≥3 köp)

| Annons | Spend | Andel | Köp | CPA | ROAS | Bruttobidrag | CTR | Freq | Hold | Klass |
|---|---|---|---|---|---|---|---|---|---|---|
| `…_offer_static_d3_v1` | 3 783 | 13 % | 15 | 252 | 2,06 | **+3 997** | 1,49 | 2,46 | – | Bevisad vinnare (prel., enda bilden) |
| `…_gift_ugc_s001h1_v2` | 1 906 | 7 % | 9 | 212 | 2,52 | +2 902 | 1,92 | 1,79 | 18 % | Lovande |
| `…_gift_ugc_012v2_v1` (pizza) | 1 626 | 6 % | 4 | 407 | 0,95 | −80 | 2,51 | 1,46 | 26 % | Osäker |
| `…_gift_ugc_haikuh3_v1` | **14 309** | **51 %** | 30 | 477 | **0,93** | −1 072 | 2,09 | 1,30 | 12 % | **Förlorare under golvet** |
| `…_gift_ugc_haikuh2_v1` | 2 317 | 8 % | 3 | 772 | 0,52 | −1 120 | 1,92 | 1,13 | 6 % | Förlorare (prel.) |
| 83 övriga | 4 193 | 15 % | 8 | – | – | – | – | – | – | För tidigt |

Bruttobidrag = intäkt − spend, före COGS. De 20 % som driver resultatet: d3 + s001h1_v2 (+6 899 kr på 20 % av spenden). Största budgetläckan: haikuh3 (51 % av spenden, negativ).

Fjolåret (SnarkLös), tio största: se `batch-log.md` Batch #0. Hela tabellen (58 bedömbara) i `batch-log.md` och rådata i sessionens scratch.

## FAS 3–4 — teardown (steg 6b)

**`d3` (vinnare):** fyra staplade lådor, pale-blue bakgrund, rubrik "SUSHISTRUMPOR / Ser ut som takeaway. Är 20 par strumpor.", röd pill "KÖP 2 – FÅ 2 GRATIS". Ögat träffar badgen, sen lådorna. Ingen människa, produkten 60 % av ytan, tre textnivåer, läsbar i mobil. Erbjudandet syns i bilden. Lägst CTR av de bedömbara (1,49) men bäst CPA — den säljer på konvertering, inte klick.
**`haikuh3` (förlorare):** första rutan = händer, låda, strumpa på fot + caption "Jag gav min mamma den ultimata oväntade presenten men sen fattade jag…" — en story-hook som lovar en berättelse. Hold 12 %. Copy E1 (bra). Diagnos: hooken köper billiga visningar (CPM 165, lägst) som inte konverterar; Meta skalar den för CPM:en, inte för köpen.
**`s001h1_v2` (lovande):** kvinna med lådan i ansiktshöjd, grundarberättelse, lugnt. Hold 18 % (bäst av de fyra). Batch #1:s "kontroll" — låg intensitet — går bäst. Hypotesen "hög intensitet slår låg" är inte bekräftad.
**`haikuh2`:** negation-hook "Köp inte sushistrumpor förrän du har sett det här" på två lådor i gräs. Hold 6 %. Lovar en varning, levererar produkt.
**Fjolårets vinnare `bästa lilla gåvan`:** två lådor i ruta 1, ätpinnar lyfter en bit, rullen vecklas ut — fem gånger på 26 s. VO i givarens jag-form, julbadge hela vägen. Mekaniken är vändningen, upprepad. Inte ansiktet, inte storyn.
**Fjolårets statics:** `inte den du tror` (produktmakro, rad, 50 %-badge, CPA 102) och `julbilden AHD` (samma recept, CPA 138) mot `Fiskbil` (man i foodtruck, liten produkt, CPA 273).

### Variabeltabellen (bedömbara, grupperade)

| Variabelvärde | Antal | Spend | Köp | CPA | ROAS | Slutsats |
|---|---|---|---|---|---|---|
| Video: händer + låda + vändningsloop (SnarkLös) | 5 | 141 355 | 1 377 | 103 | 3,58 | **Bevisad** — bästa gruppen någonsin |
| Video: talking head med ansikte (SnarkLös) | 7 | 104 081 | 586 | 178 | 2,04 | Bevisad lönsam, sämre än loopen |
| Video: negativ hook ("anledningar att inte", "reverse") | 4 | 7 474 | 30 | 249 | 1,55 | Bevisad svag |
| Bild: produktmakro + vändningsrad + offerbadge (SnarkLös) | 3 | 6 779 | 57 | 119 | 3,04 | **Bevisad** |
| Bild: AI-scen (SnarkLös) | 4 | 9 949 | 57 | 175 | 2,13 | Lönsam; Fiskbil (person) drar ner: 273 |
| Video: story-hook utan vändning (nya kungen haikuh3) | 1 | 14 309 | 30 | 477 | 0,93 | Förlorare, 30 köp |
| Bild: makro + rad + badge (nya kungen d3) | 1 | 3 783 | 15 | 252 | 2,06 | Vinnare, preliminär (en annons) |

### Tre mönster → instruktioner i batch #3

1. **Bevisad:** vändningsloopen med produkten i ruta 1 → 039/040 öppnar på lådan, första reveal före sek 2, fem reveals.
2. **Bevisad:** produktmakro + en vändningsrad + offer som antal i badge → varje static bär "KÖP 1 – FÅ 1 GRATIS", produkt ≥ 50 % av ytan, ingen människa.
3. **Bevisad (fjolåret) / hypotes (nu):** säsongskroken multiplicerar → 033 och 036 bär jul från nu; utbytbart badge-lager på alla statics.
4. **Hypotes:** offer synligt i creativen lyfter konvertering → 037 (textfri kontroll) mot 029.

## FAS 5 — Creative DNA

Skriven till `products/sushi-strumpor/dna.md` (Winning/Losing DNA, hypoteser H1–H7, förbjudet, pågående hos redigerarna).

## FAS 6 — kund- och konkurrentresearch

Ur minnet (ingen ny research i dag): köparen är 50+ (69 %), kvinna (59 %), givare; VOC:ns tre kärndesires = reaktionsögonblicket, träffsäkra givaren, används efteråt. Konkurrenter: Svensk Husman (positiv/låg, rea), SweSocks (mottagarreaktion, ~621 hundannonser), Ristal (retrospektiv brist). Lånade mekanismer: reaktionen i bild (SweSocks) → 041; kategoriomdefiniering via kontrast (Ristal) → 032; vinnaren omskinnad per högtid (Lindner) → 036 + backlog.

## FAS 7 — variationer på vinnaren (d3)

| Typ | Annons |
|---|---|
| Nära iteration | 035 — samma bild, rubrik mot pappan/farfar ("alla syskonens klappar klara") |
| Format transfer | 042 — d3 som 7 s motion static |
| Ny persuasion-vinkel | 033 — samma layoutfamilj med verklig siffra (2 576 lådor) |

## FAS 8–9 — nya koncept

5 videor (039 vändningsloop VO · 040 samma klipp ASMR · 041 överlämningen · 042 motion static · 043 byrålådan) och 10 statics (029 enlådan · 030 utrullad · 031 rolig+används · 032 anti-presentkort · 033 beviset · 034 extra lax · 035 fyra lådor · 036 julstrumpan · 037 textfri kontroll · 038 OBS-etiketten). Alla briefer: `batch-03/image-ads/*/BRIEF.md`, `batch-03/video-ads/*/BRIEF.md`. Copy: sonnet-subagenter, tre-frågorstestet grönt på varje levererad rad; huvudsessionen strök "de flesta", "2 576 köpte" (fel enhet), "burna i månader", "samma pris", "varje dag" (obelagda).

## FAS 10 — testplan

Struktur, tiers och retesterna (d1/d2/d4) står i `batch-03/LAUNCH.md`. Kvot: `node pipeline/quota.mjs` → 2 creatives per 3-dagarscykel (1 000 kr/dag, target-CPA-platshållare 397) — batch #3:s 18 annonser täcker 9 cykler. Kill: ROAS < 1,0 efter ≥500 kr (golvet; riktigt break-even okänt). Ingen dom under 300 kr / 3 köp.

**Gör innan spend:** (1) Axel: pausa/sänk haikuh3 + haikuh2 i CBO:n eller låt ligga — ägarbeslut; (2) redigerarna bygger Tier 1 (7 statics, 037 kräver noll produktion); (3) test-ABO skapas PAUSED, aktiveras när Tier 1 är inne.

## Lärdomar till minnet

- Minnet på grenen hade fel om var fjolårets data ligger. En "finns inte"-mätning ska namnge vilka konton som söktes — SnarkLös söktes aldrig på "sushi".
- CLAUDE.md:s "Matstrumpor.se `730973156224390` UNSETTLED" är inaktuellt sedan 2026-08-24 — rättat i denna körning.
- `products/` är inte längre bara Bäverbutikens: OPS-butikerna ligger där, nu även sushi-strumpor. Grenens "docs/matstrumpor-*" var en nödlösning.

## ANALYSMETOD-checklistan

- [x] Hela kampanjen hämtad, sorterad på spend (båda kontona)
- [x] Datakvalitetskontroll körd — inga trasiga rader
- [x] Signifikansgrind: 83 annonser i "för tidigt", uteslutna
- [x] Rangordningstabell visad — på bruttobidrag, inte ROAS/CPA ensamt (vinstbidrag omöjligt: break-even saknas, sagt rakt ut)
- [x] Kill-golv ROAS 1,0 använt (break-even saknas); target-CPA bara som kvotplatshållare
- [x] Top spendern (haikuh3) behandlad som benchmark — och den ligger under golvet med 30 köp
- [x] Metrik-diagnos per bedömbar annons (CTR/CPM/freq/hold)
- [x] Creative-teardown per bedömbar annons; bilder visuellt granskade; videomanus läst där det finns (fjolårets vinnare), saknade listade
- [x] Variabeltabell visad
- [x] ≥3 mönster utpekade, märkta bevisad/hypotes, översatta till briefinstruktioner
- [x] Data skild från hypotes, antal köp bakom varje dom
