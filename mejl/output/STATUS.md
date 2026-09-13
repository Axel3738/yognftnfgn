# Mejlmallarna — byggda 2026-09-13 06:50 UTC

Rabattkod: **TACKIGEN** · minst 299 kr · 1 gratis ur /collections/din-gratisprodukt

## Gratisprodukter
- Bäverlampa Pro — 199 kr (baverlampa-pro)
- Bävertratt - Tanka snabbt utan spill — 149 kr (bavertratt-tanka-utan-spill)
- Kepslampa 300 Lumen – Clip-On LED Pannlampa — 169 kr (kepslampa-300-lumen-clip-on-led-pannlampa)
- Digital Däckdjupsmätare – LCD-Display — 169 kr (digital-dackdjupsmatare-lcd-display)

## Komplement (en till + tre som passar ihop)
- 205 produkter med egen lista (103 per handle, 102 per kollektion), 2 utan — de får storsäljarna
- Katalog i mallen: 146 produkter
- Fallback: Marin Motorhölje 420D (marin-motorholje-420d-universellt-skydd), Fiskespöhållare 4-Pack (fiskespohallare-4-pack-kraftig-forvaring), Strandtofflor för Herr (strandtofflor-for-herr-halkfria-tradgardsskor)

## Mallar
- `orderbekraftelse.liquid` → Orderbekräftelse / Order confirmation · ämne: {% if customer.first_name != blank %}{{ customer.first_name }}, {% endif %}{{ name }} är mottagen – vi packar · 84 kB
- `fraktbekraftelse.liquid` → Leveransbekräftelse / Shipping confirmation · ämne: Ditt paket är på väg · 77 kB
- `fraktuppdatering.liquid` → Leveransuppdatering / Shipping update · ämne: Ny info om ditt paket · 7 kB
- `ute_for_leverans.liquid` → Ute för leverans / Out for delivery · ämne: Paketet kommer idag · 7 kB
- `levererad.liquid` → Levererad / Delivered · ämne: Paketet är levererat · 76 kB
- `overgiven_kassa.liquid` → Övergiven kassa / Abandoned checkout · ämne: Du glömde något i kassan · 7 kB
- `aterbetalning.liquid` → Återbetalning / Refund notification · ämne: {{ amount | money }} är återbetalat · 7 kB
- `avbruten_order.liquid` → Order annullerad / Order cancelled · ämne: Din order är avbruten · 7 kB
