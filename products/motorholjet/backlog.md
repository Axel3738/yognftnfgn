# Backlog – Motorhöljet (Bäverbutiken)

Koncept och swipes som väntar. Läggs till med `/koncept motorholjet <idé>`.
Markeras `[använd i batch #N]` när de plockas in i en batch.

## Väntar

| # | Idé | Källa | Status |
|---|-----|-------|--------|
| B4 | **2-pack / bundle.** Shopify visar att ca 16 % köper mer än ett hölje. Kräver butiksändring innan det får nämnas i annons. | Ordermönster | BLOCKER: ägarbeslut |
| B5 | **Recensioner.** Ingen reviews-app är nåbar. Så fort verifierade recensioner finns kan SP-copyn byta produktclaim mot äkta citat — och då får kundantalsraden användas, med siffra som stämmer. | DNA-lucka | Väntar |
| B6 | **Mintgrön och Grön har sålt noll.** Överväg att avpublicera dem eller sluta lagerföra. | Variantdata 2026-08-05 | Ägarbeslut |
| B8 | **Retargeting-adset saknas i kontot.** ~104 övergivna varukorgar från PD_1_H3 ensam. `SO_10_H1` är briefad men kan inte launchas utan adsetet. | Funnelanalys 2026-08-06 | Väntar på setup |
| B9 | **Bilderna kan inte granskas.** `*.fbcdn.net` blockeras av gatewayen (403, verifierat två körningar). Det naturliga experimentet visar att bilden är den största variabeln — och den är osynlig för analysen. Ladda upp de statiska annonsbilderna till Drive så kan teardownet äntligen göras. | Teardown 2026-08-06 | **Blockerar analysen** |
| B10 | **Skala SP-copyn.** Den ger 1 145 kr vinst per 1 000 kr och har 11 % av spenden. PD ger 459 och har 61 %. Om SP håller vid högre spend bör budgetfördelningen ändras, inte bara creativemixen. | Teardown 2026-08-06 | Väntar på batch #5-utfall |

## Avklarade

| # | Idé | Källa | Använd i |
|---|-----|-------|----------|
| B1 | Offer-först, prisbevis som hook | Briefsats 2026-08-02 | **I produktion** som `Enginecover_SO_3_H1`. Prisbevis-mekanismen görs om i **batch #5** som `SO_14_1`/`SO_14_2` — batch #4:s par dog på fel copy |
| B2 | Story-UGC "två motorer, samma brygga" | Briefsats 2026-08-02 | Inspelad som `Enginecover_SP_6_H1`. **batch #4** lade till `SP_10_H1` (omklipp) — ej launchad |
| B3 | Annonser som matchar lagerrensnings-LP:n | LP-bygge 2026-08-05 | **batch #5** som `SO_14_1`, `SO_14_2`, `SO_15_1`, `SO_13_C1` — alla kör nu överlager-vinkeln i copyn |
| B7 | PD-copyn har kontots sämsta klickkvalitet — skriv om bodyn, hooka inte om | Teardown 2026-08-05 | **[använd i batch #5]** som `PD_16_1`, `PD_16_H1`, `PD_17_1`. Utlöstes när `PD_6_C1` visade att formattransfern inte hjälpte (LPV→ATC 6,5 %) |

## Redo att launchas (producerade eller briefade, ligger inte i kontot)

| Annons | Status | Åtgärd |
|---|---|---|
| `Enginecover_SP_6_H1` | Inspelad, färdig ad i Drive | Kan launchas nu. Ingen annons i kontot bär denna vinkel. |
| `Enginecover_SO_3_H1` | In progress 2 | Vänta in leverans, launcha sedan. |
| `PD_1_H5`, `PD_1_H6`, `SP_9_H1`, `SP_10_H1`, `SO_11_H1` | Briefade i batch #4, ej launchade | `SP_9_H1` är omgjord som `SP_15_H1` i batch #5. Övriga ligger kvar. |
| `SO_10_H1` | Briefad, blockerad | Kräver retargeting-adset, se B8. |

> **Rättelse 2026-08-06:** batch #4 markerades som "briefad, ej launchad" i förra körningen. De 11
> bildannonserna launchades 5 aug 21:04. De 6 videorna gjordes aldrig. Kontrollera alltid kontot
> innan launchstatus skrivs.
