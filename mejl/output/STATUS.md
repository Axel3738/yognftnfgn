# Mejlmallarna — byggda 2026-09-13 18:53 UTC

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
- 205 produkter med egen lista (103 per handle, 102 per kollektion), 2 utan — de får storsäljarna
- Katalog i mallen: 140 produkter
- Fallback: Marin Motorhölje 420D (marin-motorholje-420d-universellt-skydd), Fiskespöhållare 4-Pack (fiskespohallare-4-pack-kraftig-forvaring), Strandtofflor för Herr (strandtofflor-for-herr-halkfria-tradgardsskor)

## Mallar
- `orderbekraftelse.liquid` → Orderbekräftelse / Order confirmation · ämne: {% if customer.first_name != blank %}{{ customer.first_name }}, {% endif %}{{ name }} är mottagen – vi packar · 86 kB
- `fraktbekraftelse.liquid` → Leveransbekräftelse / Shipping confirmation · ämne: Ditt paket är på väg · 79 kB
- `fraktuppdatering.liquid` → Leveransuppdatering / Shipping update · ämne: Ny info om ditt paket · 5 kB
- `ute_for_leverans.liquid` → Ute för leverans / Out for delivery · ämne: Paketet kommer idag · 5 kB
- `levererad.liquid` → Levererad / Delivered · ämne: Paketet är levererat · 79 kB
- `overgiven_kassa.liquid` → Övergiven kassa / Abandoned checkout · ämne: Du glömde något i kassan · 5 kB
- `aterbetalning.liquid` → Återbetalning / Refund notification · ämne: {{ amount | money }} är återbetalat · 4 kB
- `avbruten_order.liquid` → Order annullerad / Order cancelled · ämne: Din order är avbruten · 4 kB
