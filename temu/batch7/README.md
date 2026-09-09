# Batch 7 — 6 produkter i SE + NO (2026-09-09)

Offert: [ark 1H7qeSjm…](https://docs.google.com/spreadsheets/d/1H7qeSjmba5a5OXkVKC6fHQNYH0Zp7TP7irR5MI0JUGI/edit)
6 produkter, alla med quote. **AliExpress-produkter**, inte Temu.

| Produkt | SE | NO | COGS SE/NO |
|---|---|---|---|
| Fjäderbelastat stödhjul till grinden | 1 659 | 1 739 | 520,65 / 579,40 |
| Termoskydd husbil 211 × 171 cm | 559 | 509 | 151,42 / 167,29 |
| Solcellslarm 2-pack | 769 | 719 | 224,06 / 237,68 |
| Stegstöd 2-pack | 1 189 | 1 329 | 363,45 / 441,79 |
| Infartslarm trådlöst | 489 | 429 | 127,65 / 139,67 |
| Sittkäpp hopfällbar | 949 | 949 | 283,34 / 315,31 |

Marginal 3,0–3,8× i båda butikerna. Stödhjulets och sittkäppens NO-kostnad saknas
i offerten och är härledd ur SE × landfaktor 1,1333 (`temu/cogs/README.md`).

## Bilderna — AliExpress är blockerat, till skillnad från Temu

Temu släpper igenom molnet med mobil-User-Agent. **AliExpress gör inte det**:
alla varianter (www/us/sv, mobil- och desktop-UA, cookies, redirect-följning) ger
ett 2,4 kB tomt skal. `alicdn.com` går inte heller att gissa sig till.

Därför: **en riktig produktbild per produkt**, hämtad ur offertens xlsx
(`xl/media/`, kopplad till rätt rad via `xl/drawings/drawing1.xml`).
`bilder.mjs` bboxar och centrerar dem på vit kvadrat, och klipper bort
sittkäppens kinesiska rubrik 产品信息.

De två andra galleribilderna per produkt är **AI-genererade miljö- och
detaljbilder** (Higgsfield nano_banana_pro) med den riktiga produktbilden som
`image_references`. De är märkta i alt-texten och med en rad under garantin,
enligt ärlighetsregeln i CLAUDE.md. Ligger i `ai/` och `ai2/`.
⚠️ Första försöket på infartslarmet satte **inomhusmottagaren** på en staketstolpe —
referensbilden visar både sensor och mottagare och modellen valde fel. Gjordes om
med explicit beskrivning av vilken enhet som är vilken. Granska alltid resultatet.

## Fel som fångades

- **Offertläsaren läste fel kolumner.** Det här arket har en kolumn till före
  NORWAY än batch 6:s, så Norges *fraktkostnad* lästes som totalpris och NO-priset
  hade blivit ungefär hälften. `temu/offert.mjs` hittar nu Qty-kolumnen per land i
  huvudraderna i stället för att hårdkoda. Regressionstestat mot batch 6.
- **Solcellslarmet är ett 2-pack** — stod som `1(2pcs)` i Qty-rutan. Läsaren
  flaggar det nu automatiskt.
- **Fyra fel i min egen svenska copy** hittades av den norska faktakollen:
  "båda framrutorna" → sidorutorna, "Kondensen bildas inte" (absolut löfte) →
  "får inte fäste", "Sitsen sitter 29 cm bred" → "är", och en spec inne i fetstilen.
- **13 språkfel i norskan** rättade: `et knirk` → `en knirk`, `sammenlagt` →
  `slått sammen`, `Høres forskjell` → `Du hører forskjell`, `Ingen kabel må trekkes`
  (= förbud på norska) → `Du trenger ikke trekke kabel`, m.fl.

## Kör igen
```bash
node temu/offert.mjs "<länk till arket>"        # med/utan quote
node temu/batch7/priser.mjs                     # prismatris
node temu/batch7/bilder.mjs                     # hero-bilder ur offerten
node temu/batch7/skapa.mjs <se|no> [--skarp]    # skapar, hoppar om SKU finns
node temu/batch7/berika.mjs <se|no>             # AI-bilder + beskrivning
```
