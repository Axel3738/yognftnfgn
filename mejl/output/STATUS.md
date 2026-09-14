# Mejlmallarna — byggda 2026-09-14 15:20 UTC

Rabattkod: **TACKIGEN** · minst 299 kr · 1 gratis ur /collections/din-gratisprodukt

## Gratisprodukter
- Bäverlampa Pro — 199 kr (baverlampa-pro)
- Kepslampa 300 Lumen – Clip-On LED Pannlampa — 169 kr (kepslampa-300-lumen-clip-on-led-pannlampa)
- Digital Däckdjupsmätare – LCD-Display — 169 kr (digital-dackdjupsmatare-lcd-display)
- Nano Coating Vax – Keramiskt Skydd för Bil & Båt — 199 kr (nano-coating-vax-keramiskt-skydd-for-bil-bat)
- Solcellslampa COB – Bärbar med USB-Laddning — 279 kr (solcellslampa-cob-barbar-med-usb-laddning)
- Fickkedjesåg – Bärbar Handsåg med Halkfritt Handtag — 229 kr (fickkedjesag-barbar-handsag-med-halkfritt-handtag)
- Magnetfiskesats 320lb – Neodymmagnet med 10m Rep — 279 kr (magnetfiskesats-320lb-neodymmagnet-med-10m-rep)
- Hopfällbar Såg – Industriell med Halkfritt Grepp — 279 kr (hopfallbar-sag-industriell-med-halkfritt-grepp)
- 3D Snickarvinkel – Vinkellinjal med Ritskrapa — 219 kr (3d-snickarvinkel-vinkellinjal-med-ritskrapa)
- Nödregnjacka – Lätt & Packbar Regnskydd — 199 kr (nodregnjacka-latt-packbar-regnskydd)

## Komplement (en till + tre som passar ihop)
- 204 produkter med egen lista (103 per handle, 102 per kollektion), 2 utan — de får storsäljarna
- Katalog i mallen: 105 produkter
- Fallback: IBC-tanköverdrag 1000 L (ibc-tankoverdrag-1000-l-stoppar-alger-uv), Övervakningskamera Trådlös (overvakningskamera-tradlos-dubbellins-ptz-med-ai-sparning), Båtmotorskydd 420D (batmotorskydd-420d-heltackande-for-utombordare)

## Mallar
- `orderbekraftelse.liquid` → Orderbekräftelse / Order confirmation · ämne: {% if customer.first_name != blank %}{{ customer.first_name }}, {% endif %}{{ name }} är mottagen – vi packar · 80 kB
- `fraktbekraftelse.liquid` → Leveransbekräftelse / Shipping confirmation · ämne: Ditt paket är på väg · 74 kB
- `fraktuppdatering.liquid` → Leveransuppdatering / Shipping update · ämne: Ny info om ditt paket · 6 kB
- `ute_for_leverans.liquid` → Ute för leverans / Out for delivery · ämne: Paketet kommer idag · 6 kB
- `levererad.liquid` → Levererad / Delivered · ämne: Paketet är levererat · 73 kB
- `overgiven_kassa.liquid` → Övergiven kassa / Abandoned checkout · ämne: Du glömde något i kassan · 6 kB
- `aterbetalning.liquid` → Återbetalning / Refund notification · ämne: {{ amount | money }} är återbetalat · 5 kB
- `avbruten_order.liquid` → Order annullerad / Order cancelled · ämne: Din order är avbruten · 5 kB
