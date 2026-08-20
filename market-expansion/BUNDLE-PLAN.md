# BUNDLE-PLAN — Kaching-konfiguration för NO, UK och DK

Byggd ur katalogerna + annonsdatan i `docs/` (Mastern-kampanjen, 1,45 MSEK spend).
**Inga butiksändringar gjorda** — detta är klickunderlaget för Kaching Bundles-appen.

## Principer (direkt ur din egen annonsdata)

1. **Kit-framing slår rabattskrik.** B61 "HELA KITET INGÅR" (liten badge): ROAS 2,92.
   B66 "40 % RABATT" (40 % av bildytan): ROAS 1,74. Samma copy, samma produkt.
   → Bundlarna säljs som *paket/värde* ("2-pack – klar hele sæsonen"), inte som REA.
2. **Måttliga trappor.** 2x = −10 %, 3x = −15 %. Aldrig mer — rabattytan äter ROAS,
   och stora rabatter under ordinarie kampanj devalverar jämförpriserna.
3. **Etikett på mittensteget.** "Mest populær" / "Most popular" på 2x — standardmekaniken
   som flyttar folk från 1x utan att kannibalisera 3x.

## Marginalantagande (GRANSKAS AV AXEL)

COGS är okänd i repot (Temu-sourcing; leverantörs-SKU:er finns i metafältet `supplier_sku`).
Antagande: landad COGS 20–35 % av försäljningspris. Frakten är per order, inte per enhet —
**enhet 2 och 3 bär ingen ny fraktkostnad**, så även −15 % på 3x ger högre absolut vinst
per order än 1x. Räkneexempel (DK sandaler, antagen COGS 30 %): 1x = 289 − 87 = 202 kr
brutto. 2x @ 519 = 519 − 174 = 345 kr brutto (+71 %). Stämmer COGS-antagandet inte,
justera procenten — trappformen håller ändå.

## Kaching-konfiguration (samma för alla, per produkt)

- Deal-typ: **Quantity breaks** på produktsidan
- Tier 1: 1 st — ordinarie pris, ingen etikett
- Tier 2: 2 st — **−10 %**, etikett: NO "Mest populær" / UK "Most popular" / DK "Mest populær"
- Tier 3: 3 st — **−15 %**, etikett: NO "Best verdi" / UK "Best value" / DK "Bedste værdi"
- Rubrik ovanför trappan: NO "Kjøp flere – spar mer" / UK "Buy more – save more" / DK "Køb flere – spar mere"
- Sandalerna är undantaget: 2x-etiketten sätts till NO "2 par – mest populær" osv,
  eftersom "2 par"-vinkeln redan finns i annonsmaterialet.


## Danmark — bæverbutiken.dk (störst prioritet: nyast, annonser på väg)

| Produkt | Handle | 1x | 2x (−10 %) | 3x (−15 %) |
|---|---|---|---|---|
| Strandsandaler / Beach Sandals | `strandsandaler-til-herre-skridsikre-havesko` | 289 kr | 519 kr | 729 kr |
| Sätesöverdrag åkgräsklippare | `saedebetraek-til-havetraktor-slidstaerkt-600d-` | 449 kr | 799 kr | 1139 kr |
| Väggfäste grästrimmer | `vaegbeslag-til-graestrimmer-kraftig-vaerktoejs` | 239 kr | 429 kr | 609 kr |
| Stålborsthuvuden trimmer | `staaltraadsboerstehoveder-til-trimmer-kraftige` | 229 kr | 409 kr | 579 kr |
| Trimmerlina 2,4 mm 100 m | `trimmerline-2-4-mm-100-m-5-kantet-til-graestri` | 379 kr | 679 kr | 959 kr |
| Tältpinnar 8-pack | `teltploekker-8-pak-kraftige-jordploekker` | 109 kr | 189 kr | 269 kr |
| Mattstoppare 24-pack | `anti-slip-mattepuder-24-pak-holder-maatten-paa` | 169 kr | 299 kr | 429 kr |
| Skotvättpåse | `skovaskepose-med-lynlaas-blaa-til-sneakers` | 239 kr | 429 kr | 609 kr |
| Axelbälte trimmer | `skulderrem-til-trimmer-justerbar-nylonrem` | 429 kr | 769 kr | 1089 kr |
| Marint motorhölje | `marint-motorbetraek-420d-universel-beskyttelse` | 259 kr | 459 kr | 659 kr |

## Storbritannien — beavershop.co.uk

| Produkt | Handle | 1x | 2x (−10 %) | 3x (−15 %) |
|---|---|---|---|---|
| Strandsandaler / Beach Sandals | `mens-beach-sandals-non-slip-garden-shoes` | £29.00 | £51.99 | £73.99 |
| Sätesöverdrag åkgräsklippare | `ride-on-mower-seat-cover-heavy-duty-600d-oxfor` | £59.00 | £105.99 | £149.99 |
| Väggfäste grästrimmer | `wall-mount-for-strimmers-heavy-duty-tool-holde` | £27.99 | £49.99 | £70.99 |
| Stålborsthuvuden trimmer | `steel-wire-brush-heads-for-trimmer-heavy-duty-` | £26.99 | £48.99 | £68.99 |
| Trimmerlina 2,4 mm 100 m | `trimmer-line-2-4-mm-100-m-5-sided-for-grass-tr` | £44.99 | £80.99 | £114.99 |
| Tältpinnar 8-pack | `tent-pegs-8-pack-heavy-duty-ground-stakes` | £11.99 | £21.99 | £30.99 |
| Mattstoppare 24-pack | `anti-slip-rug-grippers-24-pack-keeps-your-rug-` | £18.99 | £33.99 | £47.99 |
| Skotvättpåse | `zip-up-shoe-wash-bag-blue-for-trainers` | £27.99 | £49.99 | £70.99 |
| Axelbälte trimmer | `trimmer-shoulder-strap-adjustable-nylon-harnes` | £59.00 | £105.99 | £149.99 |
| Marint motorhölje | `marine-motor-cover-420d-universal-protection` | £29.00 | £51.99 | £73.99 |

## Norge — Beverbutikken (⚠️ läs varningen under tabellen)

| Produkt | Handle | 1x | 2x (−10 %) | 3x (−15 %) |
|---|---|---|---|---|
| Strandsandaler / Beach Sandals | `strandtofler-for-herre-sklisikre-hagesko` | 349 kr | 619 kr | 889 kr |
| Sätesöverdrag åkgräsklippare | `seteovertrekk-for-ridegressklipper-slitesterkt` | 649 kr | 1159 kr | 1649 kr |
| Väggfäste grästrimmer | `veggfeste-for-gresstrimmer-kraftig-verktoyhold` | 359 kr | 639 kr | 909 kr |
| Stålborsthuvuden trimmer | `staltradsborstehoder-for-trimmer-kraftige-ugre` | 349 kr | 619 kr | 889 kr |
| Trimmerlina 2,4 mm 100 m | `trimmertrad-2-4-mm-100-m-5-sidet-for-gresstrim` | 579 kr | 1039 kr | 1469 kr |
| Tältpinnar 8-pack | `teltplugger-8-pack-kraftige-bakkeplugger` | 159 kr | 279 kr | 399 kr |
| Mattstoppare 24-pack | `antiskli-mattestoppere-24-pk-holder-matten-pa-` | 249 kr | 439 kr | 629 kr |
| Skotvättpåse | `skovaskepose-med-glidelas-bla-for-sneakers` | 359 kr | 639 kr | 909 kr |
| Axelbälte trimmer | `skulderbelte-for-trimmer-justerbart-nylonbelte` | 599 kr | 1069 kr | 1519 kr |
| Marint motorhölje | `marint-motortrekk-420d-universell-beskyttelse` | 299 kr | 529 kr | 759 kr |

**⚠️ Norge-varning:** NO-katalogfilen innehåller trasiga jämförpriser (t.ex. skotvättpåsen
pris 359 / jämförpris 198, trimmerlinan 579 / 486 — jämförpris UNDER pris) och det är
overifierat om de fyra annonsvinnarna manuellt omprissatts i norska butiken som i UK/DK.
**Verifiera priserna i norska admin innan du klickar in NO-bundlarna** — eller låt
Norge-revisionssessionen göra det först.

## Bevis per kandidat

| Produkt | Varför den är med |
|---|---|
| Strandsandaler / Beach Sandals | Annonsvinnare — "2 par"-vinkeln är redan producerad |
| Sätesöverdrag åkgräsklippare | Recension: "Detta är det andra jag köper — vi har två klippare" |
| Väggfäste grästrimmer | Recension: "kommer köpa fler till garaget" — flerköp bevisat |
| Stålborsthuvuden trimmer | Förbrukningsvara — slits ut, repeat är naturligt |
| Trimmerlina 2,4 mm 100 m | Förbrukningsvara — säsongsköp, 2x = hela säsongen |
| Tältpinnar 8-pack | Stort tält = 2 pack; billig AOV-höjare i camping-segmentet |
| Mattstoppare 24-pack | Flera mattor hemma — 2x täcker hela huset |
| Skotvättpåse | Recension: "kommer att köpa en till" — hushåll har många skor |
| Axelbälte trimmer | Annonsvinnare; 2x = ett per maskin/familjemedlem |
| Marint motorhölje | Annonsvinnare; båtägare med 2 motorer/reserv finns |

## Ordning att klicka in (om du tar dem en och en)

1. **DK sandaler** (annonsen är på väg — bundlen måste finnas när trafiken kommer)
2. DK sätesöverdrag, axelbälte, motorhölje (samma skäl)
3. UK topp-4 (butiken är live)
4. Resten av DK + UK
5. NO — efter prisverifiering

