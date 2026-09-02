# /launch <produktnamn> — launcha en Temu-produkt från Drive till Meta

Hela flödet för EN produkt ur Drive-mappen `Products/`: QA → recensioner →
Meta-uppladdning som PAUSED. Bakgrund och alla fallgropar: `docs/temu-launch-flow.md`
— läs den först. Kör alla faser klart utan att invänta godkännande mellan dem;
stanna bara vid ❌ i QA:n eller när något kräver ägarbeslut (pris, budgetändring).

**Argument:** produktnamnet som mappen heter i Drive, t.ex. `Badshorts med Skämttryck`.

## Fas 0 — Hitta materialet

1. Lista `Products/` (mapp-id `1Gga4QfZ0UfVC-q06BGGHN_fkSFN0Iygm`):
   `python3 tools/drive-ls.py <mapp-id>` — hämta produktmappens id, lista innehållet.
2. Förvänta 21 filer: 12 mp4 (4 vinklar × 3), 4 bildannonser (`_<vinkel>_2_1`),
   4 ADCOPY-docs (`_<vinkel>_ADCOPY_1`), 1 `_REVIEWS`-sheet.
   **Komplett-kravet (Axels besked 2026-09-02):** produkten launchas BARA om
   mappen har minst en video per koncept (CS, GT, PD, SP), `_REVIEWS`-sheeten
   och en ADCOPY-doc per koncept som har creatives. Saknas något av det:
   avbryt launchen för den produkten, pinga redigerarna (nattkorning.md
   steg 5) med exakt vilka filer som saknas, och skriv en rad i rapporten.
   Launcha aldrig "det som finns" — mappen plockas upp när den är komplett.
   Bildannonsen per vinkel är önskvärd men inte ett krav.
3. Ladda ner: media via `https://drive.google.com/uc?export=download&id=<id>`,
   docs via `https://docs.google.com/document/d/<id>/export?format=txt`,
   sheet via `https://docs.google.com/spreadsheets/d/<id>/export?format=csv`.
4. Hitta produkten i Shopify (SE-butiken): handle, produkt-id, pris, jämförpris,
   varianter. Connectorn om den är kopplad; annars Admin API direkt med
   `SHOPIFY_TOKEN_SE` (`shpat_`) — se "Shopify utan connector" i
   `docs/temu-launch-flow.md`. Hitta COGS i batch-sheeten: länkarna till alla
   sheets står i masterdokumentet
   `1BtFJj1A3J2ciZZS_f3lKU0cM0g5-ncWO7LFySuc3peo` (Axel 2026-09-02, läses
   publikt via `/export?format=txt`) — sök på produktens engelska namn i
   varje sheet. Total inköpskostnad SE = Total tax exclusive + 2,9 EUR.

## Fas 0.5 — Dubblettspärr (OBLIGATORISK innan launch)

Sök annonskontot efter en befintlig kampanj vars namn innehåller produktnamnet
— **oavsett status**. Finns en: launcha INTE produkten igen, notera i rapporten
att den redan är launchad (och att Drive-mappen i så fall bara inte kunnat
flyttas till LAUNCHED). Mappflytten misslyckas ibland på rättigheter, så
kampanjkontot är sanningen för vad som är launchat — aldrig mapplistan ensam.

Två undantag där en befintlig kampanj ÄR åtgärdbar:
1. **Halvbyggd** (kampanjen saknar annonser, t.ex. för att Metas uppladdning
   var otillgänglig): komplettera den med annonserna i stället för att hoppa
   över — försök uppladdningen igen.
2. **PAUSED som aldrig kommit igång** (launchad av en äldre körning, aldrig
   QA-bedömd för aktivering — och lifetime-spend är exakt 0 kr, verifierat
   mot insights INNAN status rörs): gör QA på produktens creatives och
   aktivera enligt aktiveringsreglerna i fas 3. **Har kampanjen spenderat en
   enda krona är PAUSED ett beslut** (Axels, skalningsrondens eller
   åtgärdstrappans) — rör aldrig statusen (Axels regel 2026-08-30).

## Fas 1 — QA (gratis, gör den alltid komplett)

1. Dra frames ur varje video (`imageio-ffmpeg` via pip om ffmpeg saknas), läs ALL
   inbränd text. Kolla: priser mot Shopify, rabattclaims mot jämförpriset
   (50 % kräver jämförpris = 2× priset), produktnamn.
2. Samma kontroll på de 4 bildannonserna och ADCOPY-texterna.
3. Räkna break-even-ROAS = pris / (pris − inköpskostnad i SEK). **Utan moms** —
   Bäverbutiken säljer utan moms, dra ALDRIG av 25 %.
4. **Stavfel ignoreras helt** (Axels beslut 2026-09-02): inget stoppfel, ingen
   rad i rapporten, ingen notis till redigerarna — "väverbutiken" i en video
   launchas som den är.
5. **Rabattclaim som inte stämmer är INTE ett stoppfel** (Axels policy
   2026-08-29): annonsen ändras aldrig — jämförpriset höjs så claimen stämmer.
   Kör `node tools/shopify-fix-compareat.mjs --product-id <id> --rabatt <claimad procent>`
   och rapportera ändringen.
6. **Styckpris i annonsen mot butikspriset** (Axels beslut 2026-09-02):
   - Annonsens pris lika med eller högre än butikens, eller lägre med högst
     10 %: ignoreras, launchas.
   - Annonsens pris **mycket lägre** än butikens (mer än 10 % under): den
     creativen lämnas PAUSED och **flaggas TYDLIGT** — som ⚠️-rad i
     Discord-briefen med båda priserna (`⚠️ Badshorts CS_2 visar 299 kr,
     butiken 399 kr`) och under "Väntar på Axel" med frågan sänka priset
     eller skrota annonsen. Övriga creatives i produkten launchas som vanligt.
   Fel produktnamn i en creative är fortfarande stoppfel för den creativen
   och går till redigerarna.
7. Leverera QA-tabell: ✅/❌ per creative med exakta fynd. Creative med stoppfel
   launchas inte (övriga i produkten launchas som vanligt).

## Fas 2 — Recensioner (Judge.me)

```bash
node tools/judgeme-import.mjs <reviews.csv> --product-id <shopify-produkt-id>
```
Verktyget ignorerar sheetens `product_handle` (ofta fel) och kopplar via
produkt-id:t från fas 0. Kräver env `JUDGEME_API_TOKEN` + `JUDGEME_SHOP_DOMAIN`.
Verifiera efteråt med ett GET mot `api.judge.me` att antalet stämmer.

## Fas 3 — Meta-uppladdning (MagiBorsten `1867947880635861`, SEK)

**Strukturen är Axels befintliga kontokonvention — läs en äldre launchad kampanj
i kontot som facit, aldrig en gissning. Verifierat 2026-08-29 mot ~20 launcher:**

- **CBO:** budgeten ligger på KAMPANJNIVÅ — `daily_budget` 1 000 kr/dag
  (100000 öre), bid strategy Highest volume (`LOWEST_COST_WITHOUT_CAP`).
  Adseten har ALDRIG egna budgetar.
- **Ett adset per koncept** (CS/GT/PD/SP — alla koncept som har creatives).
  Nya batcher = nya adsets, aldrig in i befintliga.
- Kampanjnamn EXAKT enligt kontots mönster:
  `<Produktnamnet i bestämd form> | BE ROAS X.XX | Launch YYYY-MM-DD`
  (t.ex. `Gravstenspennan | BE ROAS 1.60 | Launch 2026-08-29`). Okänd
  break-even skrivs `BE ROAS TBC`. Aldrig formatet "BE 1,60" — Axel söker
  på "BE ROAS".
- ⚠️ Metas API **tvångspausar kampanjen vid varje budget-/strukturändring**
  (`status_forced_to_paused`). Efter varje update på en kampanj som ska vara
  igång: sätt ACTIVE igen och verifiera med en tillbakaläsning — samma regel
  som Bäverronden lärde sig.
- Ad copy: PRIMÄRTEXT/RUBRIK/BESKRIVNING ur vinkelns ADCOPY-doc, rakt av.
- **Inga creative enhancements** — stäng av allt utom relevanta kommentarer.
- **Allt SKAPAS PAUSED på alla nivåer** (kampanj, adset, annons — sätt varje
  explicit) så att inget spenderar halvbyggt.
- Video/bild som bara heter produktnamnet (utan vinkelkod) → läggs under PD.

**Aktivering (Axels beslut 2026-08-29 — han vill inte slå på manuellt):**
när produktens ALLA annonser är uppladdade och QA:n är grön aktiveras kampanj,
adsets och annonser direkt. Undantag som förblir PAUSED och rapporteras:
enskilda creatives med stoppfel (mycket lägre pris än butiken, fel
produktnamn — aldrig stavning), och hela
produkten om break-even inte gick att räkna (saknad quote i batch-sheeten) —
en kampanj utan känd break-even får aldrig spendera.

⚠️ **En uträknad break-even är ALDRIG ett ägarbeslut** (Axels besked
2026-08-30). Finns quoten i batch-sheeten: räkna talet, skriv in det i
kampanjnamnet och aktivera. Fråga aldrig Axel om han "godkänner" en
break-even — talet följer av inköpspris och pris, det är ingen åsikt.
Bara en SAKNAD quote stoppar produkten, och då lyder raden på hans lista
"quote saknas för X", aldrig "godkänn break-even X".

## Fas 4 — Efterarbete

1. Flytta produktens Drive-mapp till `Products/LAUNCHED/` (mapp-id
   `1-vbYhYgTEv7zYptW5rGmgKAITmAz4l1X`) via Drive-connectorn — mappen ska inte
   plockas igen av nästa körning. Går flytten inte (rättigheter på mappen):
   säg det i slutrapporten så flyttar Axel den själv.
2. Rapportera: QA-utfall (inkl. jämförpris-fixar som gjordes), antal recensioner
   importerade, kampanj/adset/annons-id:n, break-even, vad som AKTIVERADES och
   vad som lämnades PAUSED med orsak.

## Definition of done
- [ ] Alla creatives nedladdade och QA:ade, tabell levererad
- [ ] Rabattclaims fixade via jämförpriset (verktyget), stoppfel exkluderade
- [ ] Recensionerna importerade mot rätt produkt-id och verifierade
- [ ] Kampanj + adsets + annonser skapade med BE-ROAS + datum i namnet
- [ ] Aktiverat enligt aktiveringsreglerna (eller PAUSED med rapporterad orsak)
- [ ] Drive-mappen flyttad till LAUNCHED (eller flaggad om rättigheter saknas)
- [ ] Slutrapport med id:n och kvarstående punkter
