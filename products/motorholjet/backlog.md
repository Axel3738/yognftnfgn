# Backlog – Motorhöljet (Bäverbutiken)

Koncept och swipes som väntar. Läggs till med `/koncept motorholjet <idé>`.
Markeras `[använd i batch #N]` när de plockas in i en batch.

## Väntar

| # | Idé | Källa | Status |
|---|-----|-------|--------|
| B4 | **2-pack / bundle.** Shopify visar att ca 16 % köper mer än ett hölje. Kräver butiksändring innan det får nämnas i annons. | Ordermönster | BLOCKER: ägarbeslut |
| B5 | **Recensioner.** Ingen reviews-app är nåbar. Så fort verifierade recensioner finns kan SP-copyn byta produktclaim mot äkta citat — och då får kundantalsraden användas, med siffra som stämmer. | DNA-lucka | Väntar |
| B6 | **Mintgrön och Grön har sålt noll.** Överväg att avpublicera dem eller sluta lagerföra. | Variantdata 2026-08-05 | Ägarbeslut |
| B8 | **Retargeting-adset saknas i kontot.** ~100 övergivna varukorgar från `PD_1_H3` ensam. `SO_10_H1` launchades 7 aug rakt in i **kall** trafik i stället och mäter därför ingenting. `SO_19_H1` i batch #6 är blockerad tills adsetet finns. | Funnelanalys, uppdaterad 2026-08-09 | **Väntar på setup** |
| B9 | **Bilderna kan inte granskas.** `*.fbcdn.net` blockeras av gatewayen (403, verifierat **tre** körningar). Fem annonser med identisk copy spänner 34-faldigt i avkastning — orsaken sitter i bilden och är osynlig. Ladda upp de statiska annonsbilderna till Drive. | Teardown 2026-08-09 | **Blockerar analysen — tredje körningen** |
| B11 | **Rätta de tre sparade copy-blocken, inte annonserna.** Rotorsaken till att ingen briefad copy någonsin körts: texten autoifylls från ett sparat block valt på vinkelprefixet i annonsnamnet. Tre ändringar fixar hela kontot. Undanta `PD_1_H3`. | Rotorsaksanalys 2026-08-09 | **Högsta prioritet — se `batch-06/START-HERE.md`** |
| B12 | **De 11 statiska brieferna i batch #5 byggdes aldrig.** Flaskhalsen är produktion, inte briefer. Antingen byggs de eller så avskrivs de medvetet — de ska inte ligga och skava. | Kontokontroll 2026-08-09 | Ägarbeslut |
| B13 | **Skala `PD_EXTRA` försiktigt.** 1 376 kr vinst per 1 000 kr på bara 795 kr spend, kontots högsta. Enda otestade skalningskandidaten. Höj till ~1 500 kr och läs av — dumpa inte budget, fyra annonser har kollapsat exakt så. | Teardown 2026-08-09 | Väntar på beslut |

## Avklarade

| # | Idé | Källa | Använd i |
|---|-----|-------|----------|
| B1 | Offer-först, prisbevis som hook | Briefsats 2026-08-02 | I produktion som `SO_3_H1`. Prisbevis-mekanismen görs om i **batch #6** som `SO_17_1` mot `SO_16_1` — tredje försöket, de två första dog på fel copy respektive byggdes aldrig |
| B2 | Story-UGC "två motorer, samma brygga" | Briefsats 2026-08-02 | Inspelad som `SP_6_H1`, launchad 7 aug |
| B3 | Annonser som matchar lagerrensnings-LP:n | LP-bygge 2026-08-05 | SO-blocket kör överlager-vinkeln i `START-HERE.md`:s nya copy |
| B7 | PD-copyn har kontots sämsta klickkvalitet — skriv om bodyn, hooka inte om | Teardown 2026-08-05 | Briefad två gånger, **kört noll gånger**. `PD_16_H1` launchades 7 aug men ärvde det gamla blocket. **[använd i batch #6]** som `PD_19_1`, `PD_19_2`, `PD_20_C1` — angriper samma svaghet från bildsidan där copy-mallen inte kan störa |

## Struken

| # | Idé | Varför |
|---|-----|--------|
| B10 | ~~Skala SP-copyn — 1 145 kr per 1 000 kr på 11 % av spenden~~ | **Falsifierad 2026-08-09.** `SP_5_H1` fick 1 505 kr till och gick från 1 405 till **77** kr per 1 000. Blocket halverades till 550. Rekommendationen byggde på två annonser varav en hade 687 kr spend. Ersatt av B13 och av mönster 2 i `dna.md`: ingenting i detta konto överlever skala utom `PD_1_H3`. |

## Redo att launchas (producerade eller briefade, ligger inte i kontot)

| Annons | Status | Åtgärd |
|---|---|---|
| `SP_12_1`, `SP_12_2`, `SP_12_3`, `SP_14_1`, `PD_16_1`, `PD_17_1`, `SO_14_1`, `SO_14_2`, `SO_15_1`, `SO_13_C1`, `PD_18_C1` | Briefade i batch #5, **aldrig byggda** | Se B12. Batch #6 ställer samma frågor i ett upplägg som klarar copy-problemet. |
| `PD_1_H5`, `PD_1_H6`, `SO_11_H1` | Launchade 7 aug, under 100 kr var | Ingen dom. Låt ligga. |
| `SP_13_H1`, `SP_15_H1` | Launchade 7 aug, **adsetet pausat vid 718 kr / 2 köp** | Avpausa eller acceptera att båda testerna är förlorade. Grinden gäller per annons, inte per adset. |
| `SO_10_H1` | Launchad 7 aug i **kallt** adset | Mäter inte retargeting. Se B8. |

> **Rättelse 2026-08-09:** batch #5 stod som "briefad, ej launchad". Tre av fjorton launchades
> 7 aug — de tre videorna. De elva statiska byggdes aldrig. Kontrollera alltid kontot innan
> launchstatus skrivs. Detta är andra körningen i rad det behövt rättas.
