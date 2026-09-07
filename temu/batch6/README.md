# Batch 6 — offert "Claude_products_filled 1" (2026-09-07)

Offert: https://docs.google.com/spreadsheets/d/1zGcVdwHVdvTD3t894FdFw--9fL8B5v5oMH5kK2XWM-I

**12 produkter i arket, 8 med quote.** Axel: *"strunta i alla produkter som inte
fått quote där i än."* Läs uppdelningen med `node temu/offert.mjs <länk>`.

## Utan quote — skapas inte
Vinterhuv hönsgård · Regn-/vinteröverdrag hundgård · Jaktparaply (MOQ 300) ·
Hängrännesats lövblås. De tre första har CWD-noteringen *"could not be found"*.

## Med quote

| Produkt | SE | NO | DK | FI | UK | Läge |
|---|---|---|---|---|---|---|
| Isolerad utekattkoja | 789 | 809 | 609 | 89,90 | 52,99 | ✅ |
| Staketstolpslagare 2-pack | 1029 | 1179 | 779 | 129,90 | 68,99 | ✅ |
| Tändvedsklyv gjutjärn | 529 | 509 | 409 | 59,90 | 31,99 | ✅ |
| Taköverdrag husvagn | 1129 | 1189 | 819 | 126,90 | 76,99 | ✅ |
| Solpanel åtelkamera | 1749 | 1719 | 1259 | 167,90 | 118,99 | ✅ |
| Stödhjul till grind | 259 | 179 | 199 | 27,90 | 11,99 | ⛔ se nedan |
| Fiskekalender | 469 | 399 | 349 | 48,90 | 26,99 | ⛔ se nedan |
| Racingkalender | 499 | 439 | 369 | 52,90 | 29,99 | ✅ |

Jämförpris = pris × 1,3. COGS = offertens landspris (qty 1) × låst FX, utan
2,9 €-avgiften. Marginal 3,0–5,1×. Räknas om med `node temu/batch6/priser.mjs`.

## Två produkter väntar på Axels besked

- **Stödhjul till grind:** offerten beskriver *"1-inch white PP guide wheel,
  material PP"* (19 g) medan Temu-sidans huvudbild visar ett **stort stödhjul i
  metall med gummidäck och klamma**. Två olika produkter — fel val ger returer.
- **Fiskekalender:** offertens länk går till **fiskehornan.se**, en konkurrents
  produktsida, inte Temu. Deras bilder används inte. Leverantörens egen bild
  (arkets `image10`) finns men har en kinesisk vattenstämpel tvärs över.

## Bilderna — molnet kom åt Temu ändå

Den dokumenterade blockeringen gäller **desktop-UA**. Med **mobil-UA** svarar
Temu med huvudbilden i sidan (`img.kwcdn.com/product/open/…-goods.jpeg`):
`node temu/batch6/hamta-bilder.mjs` hämtade 5 av 8 den vägen. Racingkalenderns
bild låg i offertlänkens `top_gallery_url`-parameter. Galleriet i övrigt kräver
fortfarande riktig skörd på Axels dator — det här räcker till huvudbild.

Offertarket bär dessutom **inbäddade leverantörsbilder** (xlsx-export →
`xl/media/`), kopplade till rad via `xl/drawings/drawing1.xml`. Därifrån kom
tändvedsklyvens bild, som rensades från kinesisk text med
`node temu/batch6/vedklyv-rensa.mjs` (beskärning + övermålning, ingen AI).

## Låsta räkneord (mot offert och leverantörsbild)
- Staketstolpslagare: **2-pack**, 80 cm per bygel (40 cm spett + 40 cm bygel),
  8 skruvar, 6 bultar, 6 muttrar, 1 skiftnyckel, 1 insexnyckel
- Tändvedsklyv: höjd 27 cm, ytterring 13,7 cm, innerring 12,5 cm, fot 14,5 cm, 0,72 kg
- Taköverdrag: 210D, **6,5 × 3 m** (offerten prissatt på den storleken), svart/silver
- Racingkalender: **24 luckor, 24 bilar**
- Utekattkoja: färgerna grå / gräsgrön / svart — **ingen kamouflage** (CWD-notering)
- Solpanel: CWD säger att bildens modell inte finns, men en grön version gör det.
  Inga watt-/spänningssiffror finns belagda → **inga specsiffror i copyn**.
