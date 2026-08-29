# Bälteslipmaskinen — första batchen (/forsta-batch, 2026-08-29)

## Executive summary
8 dagar, 13 421 kr spend, 32 köp, livstids-ROAS 2,33 mot break-even 1,73 —
produkten har klarat testet och är i skalning. Vinnaren per vinstbidrag är den
STATISKA annonsen PD_2_1 (1 899 kr, CPA 249 kr, CVR 2,3 %), inte top spendern.
Kritiskt fynd: näst bästa annonsen (CS_2_1) säljer med en **falsk 40 %-rabatt**
(verklig rabatt: 23 %) och falsk lagerknapphet — den ersätts av en ärlig version
i denna batch. CBO:n svälter 11 av 16 annonser; nya tester läggs i separat
test-ABO. Batch #2 = 6 briefer (3 bild, 3 video varav 1 nytt UGC-koncept).

## Datakvalitet (FAS 0)
| Källa | Status |
|---|---|
| Meta kampanj/annons-nivå + funnel (LPV/ATC/IC/köp) | ✅ hämtat, CPA-korskoll OK |
| omni_purchase_values | ⛔ ej använt (känt 100×-fel i kontot); intäkt = spend × ROAS |
| Statiska bilder (PD_2_1, CS_2_1) | ✅ nedladdade och visuellt granskade |
| Video (PD_1/2/3) | ❌ kan inte öppnas — **transkript för PD_2 + PD_3 behövs** |
| Landningssida + pris | ✅ storefront-JSON: 909 kr / jämförpris 1 182 kr |
| Shopify-försäljning | ❌ kopplingen pekar på fel butik (sushisock.com) |
| Recensioner | ❌ ej åtkomliga i denna körning |
| Meta Ad Library | ❌ ej åtkomlig härifrån — konkurrentsvep saknas |
| Product sheet | ❌ ej läst (Drive-mappen för produkten fanns inte — skapad nu) |

## FAS 1 — Kampanjöversikt
CBO "Bälteslipmaskinen | BE ROAS 1.73", 2 000 kr/dag, mål köp, 16 annonser i
en annonsgrupp. Livstid: 13 421 kr → 32 köp → CPA 419 kr → ROAS 2,33.
CPM 106–136 kr, CTR 2,9–3,8 % hos alla med leverans. Funnel: klick→LPV ~76–78 %
(OK), LPV→ATC 3–4 % (svag punkt), IC→köp 44–73 %. Läckan sitter mellan
landningssida och varukorg — creatives som prekvalificerar på pris/erbjudande
(PD_2_1-typ) ger dubbla CVR.

## FAS 2 — Klassificering (grind: ≥300 kr och ≥3 köp; BE-CPA 565 kr)
| Annons | Klass | Spend | Köp | CPA | ROAS | CTR | Vinstbidrag |
|---|---|---|---|---|---|---|---|
| PD_2_1 (statisk) | **Bevisad vinnare** | 1 491 | 6 | 249 | 3,88 | 3,75 % | **1 899** |
| PD_3 (video) | Bevisad vinnare | 3 160 | 8 | 395 | 2,64 | 3,00 % | 1 360 |
| PD_2 (video, top spender = benchmark) | Bevisad vinnare | 5 099 | 11 | 464 | 2,09 | 3,11 % | 1 117 |
| CS_2_1 (statisk rea) | Vinnare med regelbrott | 2 906 | 7 | 415 | 2,38 | 3,13 % | 1 049 |
| PD_1 (video) | Lovande | 1 562 | 4 | 391 | 2,27 | 3,15 % | 698 |
| CS_2 | Osäker (2 köp — ROAS 10,7 är brus) | 217 | 2 | — | — | 2,90 % | — |
| SP_2 | Osäker (1 köp) | 338 | 1 | — | — | 3,24 % | — |
| Övriga 9 (SP_1/3, CS_1/3, G-serien…) | Osäkra — CBO-svälta (<250 kr) | 0–203 | 0 | — | — | — | — |

20 % som driver allt: PD_2+PD_3+PD_2_1 = 72 % av spend, 78 % av köpen.
Största budgetläcka: ingen akut — inga bedömbara under break-even.

## FAS 3 — Vinnarna (teardown)
**PD_2_1 (bild):** ljus verkstad, gnistor mot knivblad (produkten I AKTION),
rubrik "Slöa knivar? Vässade på 10 sekunder." i ren yta. Attention = gnistorna;
Persuasion = mätbart tidslöfte; Conversion = SHOP_NOW utan pris (nyfikenhet).
**PD-videorna:** hold p100/thruplay 46–51 % = demon håller; hook-rate 13,6–15,4 %
är taket → batchens videotest angriper hooken, inte mitten. Rad-för-rad-teardown
kräver transkript (saknas — se datakvalitet).
**CS_2_1 (bild):** rea-format med kit + prisbadge 909 kr. Säljer — men på
falska "40 % / IDAG / slut i lager". Ersätts (SO_4_1), skalas inte.

## FAS 4 — Förlorare
Inga bedömbara förlorare. Problemet är strukturellt: CBO-fördelningen.
| Element | Vinnare | Svält | Trolig påverkan | Nästa test |
|---|---|---|---|---|
| Leverans | PD-serien | SP/G-serien 0–44 kr | okänd — aldrig testade | test-ABO, lika budget |

## FAS 5 — Creative DNA → `products/balteslipmaskinen/dna.md` ✅

## FAS 6 — Kund/konkurrent
❌ Luckor: inga recensioner, inget Ad Library-svep i denna körning (åtkomst
saknas). Kundspråk hämtat ur det som bevisat konverterar i kontots egen copy
("slöa knivar", "funkar som dom ska", garage/verkstad/hobbyrum). Kompletteras
vid nästa /cs när transkript + recensioner finns.

## FAS 7–9 — Batch #2 (6 annonser)
| Namn | Typ | Hypotes (isolerad variabel) |
|---|---|---|
| Beltgrinder_SO_4_1 | bild | Ärligt erbjudande behåller CS_2_1:s kraft utan lögnen |
| Beltgrinder_PD_4_1 | bild | Vinnarformatet bär mejsel-vinkeln |
| Beltgrinder_PD_5_1 | bild | Före/efter-konflikt slår aktionsbild vid samma löfte |
| Beltgrinder_PD_4_H1 | video | Bildvinnarens rubrik som hook lyfter hookrate >15,4 % |
| Beltgrinder_PD_5_H1 | video | 3-i-1-bredd rekryterar bredare än knivlöftet |
| Beltgrinder_SP_4_H1 | video | UGC-POV "kökslådetestet" (nytt koncept — märkt gissning) |

## FAS 10 — Testplan
**Tier 1 (launcha nu):** alla 6, i **separat test-ABO, lika budget per annons**
(CLAUDE.md regel 11 — aldrig i skalnings-CBO:n). Kill mot break-even-CPA 565 kr
efter ≥500 kr spend; ingen dom <300 kr/3 köp.
**Tier 2 (backlog):** karusell på 3-i-1; recensionsannons (när recensioner finns).
**Tier 3:** vinter-/julvinkel (verktygspresent).
**Gör innan spend:** 1) pausa/ersätt CS_2_1 (falsk rabatt), 2) transkribera
PD_2+PD_3, 3) product sheet-raden i nya Drive-mappen.
Kvot: launchstrukturen ger 3 annonser/vecka vid 2 000 kr/dag — batchen (6) är
medvetet dubbel som ikapp (Axels beslut). `pipeline/quota.mjs` täcker inte
produkten (saknas i products.json) — kvot styrs av launchstrukturen i ronden.

## Lärdomar
1. Vinstbidrag ≠ spend: största vinnaren låg på 11 % av budgeten.
2. Kontots farligaste annons var den näst lönsammaste — regelbrott syns inte i ROAS.
3. CBO-svält är återkommande mönster (tredje produkten) — test-ABO är lag.
