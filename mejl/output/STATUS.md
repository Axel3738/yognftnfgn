# Mejlmallarna — byggda 2026-09-26 08:18 UTC

Butikskredit: **KREDIT100** · 100 kr av · minst 299 kr · en gång per kund · knappen → https://baverbutiken.se/discount/KREDIT100?redirect=%2Fcollections%2Fall

Lyckohjulet (TACKIGEN, /pages/din-gratisprodukt) är borta ur mejlen sedan 2026-09-26 (Axels beslut). Koden och sidan ligger kvar i Shopify för kunder som redan fått mejlen.

## Komplement (en till + tre som passar ihop)
- 204 produkter med egen lista (103 per handle, 102 per kollektion), 12 utan — de får storsäljarna
- Katalog i mallen: 105 produkter
- Fallback: IBC-tanköverdrag 1000 L (ibc-tankoverdrag-1000-l-stoppar-alger-uv), Övervakningskamera Trådlös (overvakningskamera-tradlos-dubbellins-ptz-med-ai-sparning), Båtmotorskydd 420D (batmotorskydd-420d-heltackande-for-utombordare)

## Mallar
- `orderbekraftelse.liquid` → Orderbekräftelse / Order confirmation · ämne: {% if customer.first_name != blank %}{{ customer.first_name }}, {% endif %}{{ name }} är mottagen – vi packar · 72 kB
- `fraktbekraftelse.liquid` → Leveransbekräftelse / Shipping confirmation · ämne: Ditt paket är på väg · 65 kB
- `fraktuppdatering.liquid` → Leveransuppdatering / Shipping update · ämne: Ny info om ditt paket · 6 kB
- `ute_for_leverans.liquid` → Ute för leverans / Out for delivery · ämne: Paketet kommer idag · 6 kB
- `levererad.liquid` → Levererad / Delivered · ämne: Paketet är levererat · 61 kB
- `overgiven_kassa.liquid` → Övergiven kassa / Abandoned checkout · ämne: Du glömde något i kassan · 6 kB
- `aterbetalning.liquid` → Återbetalning / Refund notification · ämne: {{ amount | money }} är återbetalat · 5 kB
- `avbruten_order.liquid` → Order annullerad / Order cancelled · ämne: Din order är avbruten · 5 kB
