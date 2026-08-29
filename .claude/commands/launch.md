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
   4 ADCOPY-docs (`_<vinkel>_ADCOPY_1`), 1 `_REVIEWS`-sheet. Saknas något:
   rapportera exakt vad och fortsätt med det som finns.
3. Ladda ner: media via `https://drive.google.com/uc?export=download&id=<id>`,
   docs via `https://docs.google.com/document/d/<id>/export?format=txt`,
   sheet via `https://docs.google.com/spreadsheets/d/<id>/export?format=csv`.
4. Hitta produkten i Shopify (SE-butiken): handle, produkt-id, pris, jämförpris,
   varianter. Connectorn om den är kopplad; annars Admin API direkt med
   `SHOPIFY_TOKEN_SE` (`shpat_`) — se "Shopify utan connector" i
   `docs/temu-launch-flow.md`. Hitta COGS i batch-sheeten (länkade i
   masterdokumentet, se `docs/temu-launch-flow.md`) — sök på produktens
   engelska namn. Total inköpskostnad SE = Total tax exclusive + 2,9 EUR.

## Fas 0.5 — Dubblettspärr (OBLIGATORISK innan launch)

Sök annonskontot efter en befintlig kampanj vars namn innehåller produktnamnet
— **oavsett status**. Finns en: launcha INTE produkten igen, notera i rapporten
att den redan är launchad (och att Drive-mappen i så fall bara inte kunnat
flyttas till LAUNCHED). Mappflytten misslyckas ibland på rättigheter, så
kampanjkontot är sanningen för vad som är launchat — aldrig mapplistan ensam.

## Fas 1 — QA (gratis, gör den alltid komplett)

1. Dra frames ur varje video (`imageio-ffmpeg` via pip om ffmpeg saknas), läs ALL
   inbränd text. Kolla: **butiksnamnets stavning** ("Bäverbutiken" — väverbutiken
   har hänt), priser mot Shopify, rabattclaims mot jämförpriset (50 % kräver
   jämförpris = 2× priset), produktnamn.
2. Samma kontroll på de 4 bildannonserna och ADCOPY-texterna.
3. Räkna break-even-ROAS = pris / (pris − inköpskostnad i SEK). **Utan moms** —
   Bäverbutiken säljer utan moms, dra ALDRIG av 25 %.
4. **Rabattclaim som inte stämmer är INTE ett stoppfel** (Axels policy
   2026-08-29): annonsen ändras aldrig — jämförpriset höjs så claimen stämmer.
   Kör `node tools/shopify-fix-compareat.mjs --product-id <id> --rabatt <claimad procent>`
   och rapportera ändringen. Stavfel i inbränd text, fel produktnamn och fel
   *styckpris* är däremot fortfarande stoppfel för den creativen.
5. Leverera QA-tabell: ✅/❌ per creative med exakta fynd. Creative med stoppfel
   launchas inte (övriga i produkten launchas som vanligt).

## Fas 2 — Recensioner (Judge.me)

```bash
node tools/judgeme-import.mjs <reviews.csv> --product-id <shopify-produkt-id>
```
Verktyget ignorerar sheetens `product_handle` (ofta fel) och kopplar via
produkt-id:t från fas 0. Kräver env `JUDGEME_API_TOKEN` + `JUDGEME_SHOP_DOMAIN`.
Verifiera efteråt med ett GET mot `api.judge.me` att antalet stämmer.

## Fas 3 — Meta-uppladdning (MagiBorsten `1867947880635861`, SEK)

Följ uppladdningsprompten i masterdokumentet:

- Kampanjnamn: **måste innehålla break-even-ROAS + launchdatum**,
  t.ex. `Badshorts med Skämttryck | BE 1,61 | 2026-08-29`.
- Struktur: **ett adset per vinkel** (CS/GT/PD/SP), lika budget, totalt 1 000 kr/dag
  test. Nya batcher = nya adsets, aldrig in i befintliga.
- Ad copy: PRIMÄRTEXT/RUBRIK/BESKRIVNING ur vinkelns ADCOPY-doc, rakt av.
- **Inga creative enhancements** — stäng av allt utom relevanta kommentarer.
- **Allt SKAPAS PAUSED på alla nivåer** (kampanj, adset, annons — sätt varje
  explicit) så att inget spenderar halvbyggt.
- Video/bild som bara heter produktnamnet (utan vinkelkod) → läggs under PD.

**Aktivering (Axels beslut 2026-08-29 — han vill inte slå på manuellt):**
när produktens ALLA annonser är uppladdade och QA:n är grön aktiveras kampanj,
adsets och annonser direkt. Undantag som förblir PAUSED och rapporteras:
enskilda creatives med stoppfel (stavning, styckpris, produktnamn), och hela
produkten om break-even inte gick att räkna (saknad quote i batch-sheeten) —
en kampanj utan känd break-even får aldrig spendera.

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
