# Backlog – Motorhöljet (Bäverbutiken)

Koncept och swipes som väntar. Läggs till med `/koncept motorholjet <idé>`.
Markeras `[använd i batch #N]` när de plockas in i en batch.

## Väntar

| # | Idé | Källa | Status |
|---|-----|-------|--------|
| B15 | **Sänk dagsbudgeten tills CPA är under break-even.** Senaste 3 dygn: CPA 291 kr mot break-even 236. 4 000 kr/dag på den nivån kostar ungefär 800 kr i förlorat täckningsbidrag per dag. | Analys 2026-08-12 | **ÄGARBESLUT — brådskande** |
| B16 | **Launcha i ABO med lika budget per annons, inte i CBO:n.** Tre batcher har svultit ihjäl bredvid `PD_1_H3` (42 % av spenden). Batch #5:s trevägstest fick 5,70 / 5,52 / 159,76 kr. | Mönster 5, 2026-08-12 | **Blockerar allt lärande** |
| B8 | **Retargeting-adset saknas.** Nu den mest lönsamma öppningen som finns: kall trafik kostar 291 kr per order, den varma publiken har redan läst sidan. `SO_10_H1` launchades 7 aug rakt in i kall trafik och mäter ingenting. | Funnelanalys, uppdaterad 2026-08-12 | **Väntar på setup** |
| B9 | **Bilderna kan inte granskas.** `*.fbcdn.net` blockeras av gatewayen (403, verifierat **fyra** körningar). Creativen spänner från −334 till 1 721 kr/1 000 med identisk copy — orsaken är osynlig. Ladda upp annonsbilderna till Drive. | Teardown 2026-08-12 | **Blockerar analysen — fjärde körningen** |
| B11 | **Rätta de tre sparade copy-blocken.** Rotorsaken till att ingen briefad copy körts: autoifyllning från block valt på vinkelprefixet i annonsnamnet. Tre ändringar räcker. Förbjudna claims ligger live på bland annat `SO_4_H1`, kontots bästa annons. | Rotorsaksanalys 2026-08-09 | **Fortfarande ogjord** |
| B14 | **Videomanusen för `SO_4_H1` och `SP_1_H1` saknas.** Batch #1 och #3 briefades utanför OS:et och videorna går inte att titta på härifrån. Därför är `SO_21`- och `SP_19`-flottorna rekonstruktioner, inte kontrollerade iterationer. | Teardown 2026-08-12 | **Ny — behöver manusen** |
| B4 | **2-pack / bundle.** Ca 16 % köper mer än ett hölje. Kräver butiksändring innan det får nämnas i annons. | Ordermönster | BLOCKER: ägarbeslut |
| B5 | **Recensioner.** Ingen reviews-app nåbar. Med verifierade recensioner kan SP-copyn byta produktclaim mot äkta citat. | DNA-lucka | Väntar |
| B6 | **Mintgrön och Grön har sålt noll.** Överväg att avpublicera. | Variantdata 2026-08-05 | Ägarbeslut |
| B12 | **Batch #6:s 18 briefer är inte byggda**, och batch #5:s två karuseller byggdes aldrig. Flaskhalsen är produktion, inte briefer. Antingen byggs de eller så avskrivs de medvetet. | Kontokontroll 2026-08-12 | Ägarbeslut |
| B13 | **Skala `SO_4_H1` försiktigt.** 1 721 kr vinst per 1 000 kr, 11,9 % köp per klick, **0,8 % av spenden**. Höj till ca 1 500 kr och läs av — fem annonser har kollapsat när de fick pengar. Byt copyn först, den kör vinterrubriken. | Teardown 2026-08-12 | Väntar på beslut. Ersätter det gamla B13 om PD_EXTRA |

## Avklarade

| # | Idé | Källa | Använd i |
|---|-----|-------|----------|
| B1 | Offer-först, prisbevis som hook | Briefsats 2026-08-02 | I produktion som `SO_3_H1`. Prisbevis i bild är fortfarande otestat efter tre försök — `SO_17_1` i batch #6 väntar |
| B2 | Story-UGC "två motorer, samma brygga" | Briefsats 2026-08-02 | Inspelad som `SP_6_H1`, launchad 7 aug |
| B3 | Annonser som matchar lagerrensnings-LP:n | LP-bygge 2026-08-05 | SO-blockets nya copy i `batch-06/START-HERE.md` |
| B7 | PD-copyn har kontots sämsta klickkvalitet — skriv om bodyn | Teardown 2026-08-05 | Briefad tre gånger, kört noll gånger. **[använd i batch #7]** som `PD_24_2` och `PD_24_3` — angriper nu **invändningar** i stället, eftersom både omskrivning och storlekskvalificering fallerat |

## Struken

| # | Idé | Varför |
|---|-----|--------|
| B10 | ~~Skala SP-copyn~~ | **Falsifierad 2026-08-09.** `SP_5_H1` gick från 1 405 till −75 kr/1 000 och är nu pausad. |
| B17 | ~~Storlekskvalificering i bild~~ | **Falsifierad 2026-08-12.** `PD_6_1` blev dömbar: 2 470 kr, 7 köp, CPA 353, **−331 kr/1 000**. Fyra försök, första domen, negativ. `PD_19_1` och `PD_20_C1` i batch #6 bygger på samma idé — bygg dem efter batch #7:s invändningsannonser, inte före. |

## Redo att launchas (briefade, ligger inte i kontot)

| Annons | Status | Åtgärd |
|---|---|---|
| Batch #6:s 18 briefer | Levererade 9 aug, **inga byggda** | Se B12 och B16 |
| `SO_13_C1`, `PD_18_C1` | Briefade i batch #5, **aldrig byggda** | Karusellen otestad efter tre försök |
| `SP_13_H1`, `SP_15_H1` | Launchade 7 aug, **adsetet pausat vid 718 kr / 2 köp** | Avpausa eller acceptera att båda testerna är förlorade |
| `SO_10_H1` | Launchad 7 aug i **kallt** adset, 240 kr, 0 köp | Mäter inte retargeting. Se B8 |

> **Rättelse 2026-08-12:** `SO_5_1` stod som pausningskandidat efter förra körningen. Den pausades
> inte och gjorde sedan 7 köp till CPA 188 — under break-even. Kill-beslut på tre dygns trend
> håller inte. Regeln är nu skriven i `dna.md`.
