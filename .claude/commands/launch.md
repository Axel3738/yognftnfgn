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

## Fas 1 — QA (gratis, gör den alltid komplett)

1. Dra frames ur varje video (`imageio-ffmpeg` via pip om ffmpeg saknas), läs ALL
   inbränd text. Kolla: **butiksnamnets stavning** ("Bäverbutiken" — väverbutiken
   har hänt), priser mot Shopify, rabattclaims mot jämförpriset (50 % kräver
   jämförpris = 2× priset), produktnamn.
2. Samma kontroll på de 4 bildannonserna och ADCOPY-texterna.
3. Räkna break-even-ROAS = pris / (pris − inköpskostnad i SEK). **Utan moms** —
   Bäverbutiken säljer utan moms, dra ALDRIG av 25 %.
4. Leverera QA-tabell: ✅/❌ per creative med exakta fynd. ❌ på pris/claims/
   stavning = creativen launchas inte förrän Axel sagt sitt.

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
- **ALLT skapas PAUSED: kampanj, adset OCH annons — sätt varje nivå explicit.**
  Ingenting får kunna spendera innan Axel tittat.
- Video/bild som bara heter produktnamnet (utan vinkelkod) → läggs under PD.

## Fas 4 — Efterarbete

1. Flytta INTE Drive-mappen till LAUNCHED — det gör Axel när han slagit på kampanjen.
2. Rapportera: QA-utfall, antal recensioner importerade, kampanj/adset/annons-id:n,
   break-even som användes, och vad som väntar på Axel.

## Definition of done
- [ ] Alla creatives nedladdade och QA:ade, tabell levererad
- [ ] Inga ❌ på pris/claims/stavning olösta (eller uttryckligen överlämnade till Axel)
- [ ] Recensionerna importerade mot rätt produkt-id och verifierade
- [ ] Kampanj + adsets + annonser skapade PAUSED med BE-ROAS + datum i namnet
- [ ] Slutrapport med id:n och kvarstående punkter
