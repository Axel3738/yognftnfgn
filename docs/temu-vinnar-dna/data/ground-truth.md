> **Rättelse 2026-09-03 (efter analysen):** rad 9 nedan gissade att Temu-listning 601099553900496 kunde vara en andra leverantör för Strandtofflorna och angav "BE ≈ 1,5". Bildjämförelsen i `../analys/w9.md` visar att listningen är butikens *Tofflor Ergonomiska* (kampanj "Ergonomiska Tofflorna"), och den verifierade break-even-ROAS är **1,80** (COGS 10,9 USD + 2,9 EUR). Kampanjen ligger under break-even. Siffrorna i tabellen är oförändrade Meta-/Shopify-data.

# Ground truth — hämtat 2026-09-03 (Meta MCP + Shopify MCP + Drive)

## Meta, konto MagiBorsten 1867947880635861, date_preset=maximum, kampanjnivå
Fält: amount_spent (SEK) · omni_purchase · cost_per_omni_purchase · purchase_roas · status

### De 10 vinnarna (Temu-länkarna) — kampanjer i kontot
| # | Temu-produkt | Kampanj(er) | Spend | Köp | CPA | ROAS | Status | Shopify-pris | BE-ROAS (kampanjnamn / products.json) |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Marin motorhölje 420D (g-606445101752663) | Motorhöljet 72 234,87 kr / 363 köp / CPA 198,99 / ROAS 1,93 (PAUSED) + Motorhöljet Lagerrensingsrea 20 822 / 96 / 216,90 / 1,71 + ABO-test 08-12 3 857 / 19 / 203 / 1,90 + CBO 08-20 1 537 / 8 / 192 / 1,81 + Båtmotorskyddet 420D BE 1.62 Launch 08-29 6 479 / 37 / 175,11 / 3,50 (ACTIVE) | ~104 900 | ~523 | ~200 | ~1,9–3,5 | delvis aktiv | 299 kr (jämförpris 367), 30 varianter (färg × hk-storlek), SKU TEMU-606445101752663 | 1,63 (products.json) / 1,62 (kampanj) |
| 2 | Fiskespöhållare 7 st (g-605991496175497) | Fiskespöhållaren BE ROAS 1.50 Launch 2026-08-18 | 59 100,30 | 307 | 192,51 | 2,24 | ACTIVE | 289 kr "Fiskespöhållare 4-Pack" SKU TEMU-601104615671651 (annan Temu-listning än länken; länken = 7-pack) | 1,50 |
| 3 | Gräsklipparstolsöverdrag Oxford (g-601101433025443) | Sätesöverdragaren 60 205,70 / 179 / 336,34 / 2,15 (PAUSED) + kopia 2 235 / 3 | 62 441 | 182 | ~343 | 2,15 | PAUSED | 649 kr, 4 färgvarianter, SKU MOWER-SEAT-* | 1,47 |
| 4 | Herr EVA-sandaler hålkantade (g-601099677938468) | Strandtofflorna 38 785,07 / 180 / 215,47 / 2,10 (PAUSED) + brynis lagris 2 592 / 7 | 41 377 | 187 | ~221 | 2,10 | PAUSED | 349 kr, 36 varianter (storlek × färg) | 1,70 |
| 5 | Axelbälte trimmer (g-601101171339794) | Axelbältet 47 090,04 / 152 / 309,80 / 1,91 (PAUSED) + brynis lagris 2 124 / 5 + ugc axel 1 021 / 1 | 50 235 | 158 | ~318 | 1,91 | PAUSED | 599 kr (höjt från 509 2026-08-05), 1 variant, SKU TEMU-601101171339794 | 1,72 (products.json 299 kr BE-CPA) |
| 6 | 3-i-1 mini bandslipare (g-601102681234291) | Bälteslipmaskinen BE ROAS 1.73 Launch 2026-08-21 | 22 774,19 | 53 | 429,70 | 2,30 | ACTIVE | 909 kr, 1 variant, SKU TEMU-601102681234291 | 1,73 |
| 7 | Soptunneklistermärken 4-pack (g-601102867393554) | Soptunneklistermärkena BE ROAS 1.67 Launch 2026-08-21 | 9 562,97 | 73 | 131,00 | 2,05 | ACTIVE | 199 kr, 1 variant, SKU TEMU-601102867393554 | 1,67 |
| 8 | Trådlös PTZ dubbellins kamera (g-601100938731214) | Övervakningskameran BE ROAS 1.57 Launch 2026-08-21 | 10 265,57 | 29 | 353,99 | 3,38 | ACTIVE | 799 kr, 1 variant, SKU TEMU-601100938731214 | 1,57 |
| 9 | Herrskor slippers rutigt EVA (g-601099553900496) | Trolig kampanj: "Ergonomiska Tofflorna" 7 491,62 / 31 / 241,67 / 1,59 (PAUSED) — Shopify "Tofflor Ergonomiska – Tjocksulade" 309 kr, SKU TEMU-601100379316292 (ANNAN Temu-listning). Kopplingen länk↔kampanj är OSÄKER — kan också vara en andra leverantör för Strandtofflorna. | 7 492 | 31 | 242 | 1,59 | PAUSED | 309 kr, 14 varianter | (Shopify-pris 309 / batch #1 kostnad 10,9 USD → BE ≈ 1,5) |
| 10 | IBC-tanköverdrag 1000 L (g-601099590911868) | IBC-Tanköverdraget BE ROAS 1.51 Launch 2026-08-28 | 8 641,73 | 40 | 216,04 | 2,94 | ACTIVE | 489 kr, 1 variant, SKU TEMU-601099590911868 | 1,51 |

Alla priser utan moms (Bäverbutiken säljer utan moms — CLAUDE.md).
BE-ROAS = pris / (pris − inköpskostnad) → inköpskostnad ≈ pris × (1 − 1/BE).

### Förlorare/övriga i samma konto (för negativ rymd och motsägelsetest) — spend / köp / CPA / ROAS
- Ergonomiska Tofflorna 7 492 / 31 / 242 / 1,59
- Kranskydd Frost 420D (BE 1.49) 7 416 / 28 / 265 / 1,59 — PAUSED (över BE men pausad)
- MC-Kapellet (BE 1.49) 7 034 / 36 / 195 / 2,20 — ACTIVE (lovande)
- Cykelshorts Herr (BE 1.68) 6 994 / 41 / 171 / 2,18 — ACTIVE (lovande)
- Skoreparationslapparna 6 664 / 42 / 159 / 1,74 — PAUSED (ligger i Drive WINNERS)
- Damasker Vandring (BE 1.60) 5 821 / 29 / 201 / 2,76 — ACTIVE (lovande)
- Surfplattestället (BE 1.67) 5 505 / 21 / 262 / 1,59 — PAUSED (under BE)
- Gravstenspennan (BE 1.60) 5 376 / 19 / 283 / 1,46 — ACTIVE (under BE)
- Plyschtofflorna Herr (BE 1.49) 5 363 / 15 / 358 / 1,46 — PAUSED
- AI Smarta Glasögon 4 471 / 2 / 2 236 / 0,84 — PAUSED (LOSER)
- Cargoshortsen 4 324 / 8 / 540 / 1,63 — PAUSED
- Väggfästet 3 762 / 9 / 418 / 1,64 — PAUSED (BE 2,00 → förlust)
- Gräsklippartäcket 3 537 / 11 / 322 / 1,29 — PAUSED (LOSER — obs: samma "skydd i Oxford"-typ som vinnare 1, 3, 10!)
- Badshorts med Skämttryck (BE 1.62) 3 533 / 10 / 353 / 1,29 — PAUSED (LOSER)
- Magnetfiskesatsen (BE 1.65) 3 111 / 10 / 311 / 1,10 — PAUSED (LOSER)
- Golfklubbsborsten 2 940 / 10 / 294 / 1,31 — PAUSED (LOSER)
- Jättefotbollen (BE 1.61) 2 697 / 4 / 674 / 0,66 — PAUSED (LOSER)
- Bordtennisnätet Infällbart (BE 1.80) 2 644 / 2 / 1 322 / 0,23 — ACTIVE (LOSER-signal)
- Ståltrådsborsthuvuden 2 490 / 7 / 356 / 0,96 — LOSER
- Skotvättpåsen 2 425 / 8 / 303 / 1,48 — LOSER
- Krananslutningen 2 261 / 7 / 323 / 1,13 — LOSER
- Lastnätet 2 249 / 6 / 375 / 1,11 — LOSER
- Magnethyllan (BE 1.62) 2 189 / 2 / 1 095 / 0,68 — LOSER
- Lättviktsryggsäcken 2 112 / 1 / 2 112 / 0,35 — LOSER
- Luffarschacket i Trä (BE 1.59) 2 088 / 2 / 1 044 / 0,36 — LOSER
- Sömnadskitet 104 Delar (BE 1.60) 2 081 / 4 / 520 / 0,74 — LOSER
- Vandringskängor Herr (BE 1.60) 2 026 / 5 / 405 / 1,61 — PAUSED
- Golfskoväskan (BE 1.79) 1 933 / 4 / 483 / 1,09 — LOSER
- Uteduschen 1 930 / 2 / 965 / 0,60 — LOSER
- Liggunderlaget 1 829 / 0 — LOSER
- Kasta & Fånga-settet (BE 1.61) 1 747 / 1 / 0,66 — ACTIVE, svag
- Första Hjälpen-Kitet (BE 1.78) 1 705 / 5 / 341 / 1,30 — LOSER
- Medicinasken i Fickformat (BE 1.60) 1 710 / 1 / 0,29 — ACTIVE, svag
- Herrshortsen 1 651 / 2 / 826 / 0,56 — LOSER
- Mattdynorna 1 569 / 4 / 392 / 0,76 — LOSER
- Bollpannbandet (BE 2.03) 1 534 / 2 / 767 / 0,35 — LOSER
- Stänkskärmen 1 487 / 4 / 372 / 1,10 — LOSER
- Trädgårdssäcken 1 487 / 2 / 743 / 1,06 — LOSER
- 14-i-1 Verktyget (BE 1.63) 1 483 / 2 / 742 / 0,54 — LOSER
- Kedjeslipen 1 407 / 4 / 352 / 0,99 — LOSER
- Förtöjningslinan 1 368 / 2 / 684 / 0,93 — LOSER
- Dörrbottenlisten 1 210 / 1 / 0,45 — LOSER
- Mobilskalet (BE 1.79) 1 091 / 4 / 273 / 1,17 — LOSER
- Hopfällbara Sågen (BE 1.79) 1 001 / 2 / 500 / 0,80 — LOSER
- Linupprullare Aluminium (BE 1.83) 989 / 1 / 0,30 — LOSER
- Mini Fiskespöset (BE 1.67) 839 / 2 / 420 / 1,02 — LOSER
- Magnetplattorna i Storformat (BE 1.63) 800 / 1 — ny 09-03
- Motocentric Bakväskan 37 L (BE 1.63) 557 / 1 / 1,77 — ny 09-03
- Sneakers Herr (BE 1.19) 1 kr — aldrig körd
- Kamouflagetejpen — ingen spend

Drive `Products/LAUNCHED/WINNERS/`: Bälteslipmaskin · Båtmotorskydd 420D · IBC-tanköverdrag · Smiley face trash can stickers · Fiskespöhållare_pausad · Skoreparationslappar · Marin Motorhölje 420D · Övervakningskamera · TURNT OFF (mapp)
Drive `LOSERS/`: 34 mappar — 14 i 1 verktyg, Badshorts, Bollpannband, Dörrbottenlist, Första hjälpen, Golfskoväska, Gräsklippartäcke, Hopfällbar såg, Jättefotboll, Linupprullare, Magnetfiskesats, Mini fiskespö, Mobilskal, Sneakers, Sovdyna TPU, Ståltrådshuvud, Stänkskärm MTB, Surfplatteställ, Båtlina, Golfklubbsborste, 4-vägs kran, Lättviktsryggsäck, Shoe wash bag, Wall mount trimmer, Lastnät, Kedjeslip, Herrshorts, Anti-slip mattdynor, Cargo shorts, AI-glasögon, Trädgårdssäck, Uteduschen, Vandringssneakers.

## Batch-sheet #1 (COGS, USD, CWD quote 2026-08-01) — exempel
Uteduschen 509 kr / 20,4 USD · Golfskoväska 309 / 11 · Magnetfiskesats 239 / 8,1 · Golfbollsplockare 309 / 11,2 · Tofflor Ergonomiska 309 / 10,9 · Fritidsskor 309 / 11,3 · Mobilskal 219 / 6,8
(Supplier Quotation Sheet har tomma kostnadskolumner för alla 10 vinnarna.)
