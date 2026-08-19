# Backlog – Motorhöljet (Bäverbutiken)

Koncept och swipes som väntar. Läggs till med `/koncept motorholjet <idé>`.
Markeras `[använd i batch #N]` när de plockas in i en batch.

## Väntar

| # | Idé | Källa | Status |
|---|-----|-------|--------|
| B16 | **Launcha i ABO med lika budget per annons.** Batch #6:s femvägstest fick 735 / 452 / 303 / 24 / 5 kr — 147 gångers skillnad, bara en arm läsbar. Fjärde gången samma strukturfel dödar samma sorts test. | Mönster 5, 2026-08-19 | **Blockerar allt lärande** |
| B18 | **Pausa `Enginecover_SO_8_1`.** CPA 396,93, vinstbidrag −644 kr, och 170 kr sedan förra veckan utan ett enda nytt köp. Rekommenderat 12 och 19 augusti. | Vinstbidragstabellen | **Ägaråtgärd** |
| B13 | **Skala `SO_4_H1` vidare.** Enda annonsen som klarat en uppskalning: 434 → 1 185 kr och behöll 1 190 kr per 1 000. Höj mot 2 500 kr. **Byt copyn först** — den kör vinterrubriken. | Teardown 2026-08-19 | Väntar på beslut |
| B8 | **Retargeting-adset saknas.** Frekvensen är nu **3,21** och pölen av övergivna varukorgar växer varje vecka. `SO_19_H1` och `SO_23_1`/`SO_23_2` väntar på det. | Funnelanalys, uppdaterad 2026-08-19 | **Väntar på setup** |
| B20 | **`Enginecover_SO_5_1` visar fel jämförpris.** Ägaren bekräftade 2026-08-19 att **367 kr är rätt**. `SO_5_1` kör `337 kr` överstruket och har gjort det sedan 4 augusti. **Rör inte annonsen utan beslut** — den har 51 köp och 2 333 kr i vinstbidrag, och en creative-ändring nollställer dess inlärning. Alternativen är att bygga om bilden med 367 kr och launcha den som ny variant bredvid, eller att låta den gå. | Bildgranskning 2026-08-19 | **ÄGARÅTGÄRD** |
| B21 | **Exportera `SO_16_1`:s originalbild ur Ads Manager.** `SO_26_1`–`SO_26_4` bygger alla på den och ingen har sett den. Postbaserade creatives går inte att rendera via API:et. | Bildgranskning 2026-08-19 | **Blockerar batch #8:s bildflotta** |
| B22 | **Iterera `PD_8_1`, inte bara `SO_5_1`.** `PD_8_1` är kontots mest effektiva statiska per krona (+425 kr/1 000) och har 1,3 % av spenden. Femfärgs-lineup med utpekningslinjer och litet pris. | Bildgranskning 2026-08-19 | **[använd i batch #8]** som `SO_27_2` |
| B11 | **Rätta de tre sparade copy-blocken.** `SO_4_H1`, kontots näst mest effektiva annons, kör fortfarande `Skydda din motor – innan vintern` och `Beställ innan lagret tar slut`. Femte körningen i rad. | Rotorsaksanalys 2026-08-09 | **Fortfarande ogjord** |
| B12 | **Batch #7:s 18 briefer är obyggda**, plus två karuseller från batch #6. Karusellformatet har aldrig byggts efter fyra försök. **Prioritera `SO_21`-flottan** — fyra iterationer av kontots enda bevisade skalare. | Kontokontroll 2026-08-19 | Ägarbeslut |
| B14 | **Videomanuset för `SO_4_H1` saknas.** Batch #3 briefades utanför OS:et. Det är nu den viktigaste luckan: annonsen är den enda som bevisligen skalar och vi vet inte vad den säger. | Teardown 2026-08-12 | Behöver manuset |
| B4 | **2-pack / bundle.** Ca 16 % köper mer än ett hölje. Kräver butiksändring. | Ordermönster | BLOCKER: ägarbeslut |
| B5 | **Recensioner.** Ingen reviews-app nåbar. | DNA-lucka | Väntar |
| B6 | **Mintgrön och Grön har sålt noll.** Överväg att avpublicera. ⚠️ **Men:** bildgranskningen 19 aug visar att kontots två bäst presterande statiska (`PD_8_1` +425, `SO_5_1` +240) båda säljer på **femfärgs-lineupen**. Avpubliceras färger tappar de sitt motiv. | Variantdata 2026-08-05, omprövad 2026-08-19 | Ägarbeslut — **väg mot annonserna först** |

## Avklarade

| # | Idé | Källa | Använd i |
|---|-----|-------|----------|
| B15 | **Sänk dagsbudgeten tills CPA är under break-even** | Analys 2026-08-12 | **GJORD.** 4 000 → 2 000 kr. Tillsammans med fem pausningar tog det marginalen från 300 kr till 194 kr |
| B1 | Offer-först, prisbevis som hook | Briefsats 2026-08-02 | Prisbevis i bild fick sitt **första läsbara svar 2026-08-19: negativt**. `SO_17_1` −138 mot `SO_16_1` −37 med samma foto. **[använd i batch #8]** som `SO_26_1`–`SO_26_4`, som testar vad ytan ska bära i stället |
| B2 | Story-UGC "två motorer, samma brygga" | Briefsats 2026-08-02 | Inspelad som `SP_6_H1` |
| B3 | Annonser som matchar lagerrensnings-LP:n | LP-bygge 2026-08-05 | SO-blockets copy + listiclen `baverbutiken.se/pages/motorholje-lagerrensning` |
| B7 | PD-copyn har kontots sämsta klickkvalitet | Teardown 2026-08-05 | Briefad fyra gånger, kört noll gånger. Ligger i batch #7 som `PD_24_2`/`PD_24_3` |
| B9 | **Bilderna kan inte granskas** | Teardown, fem körningar | **LÖST 2026-08-19.** `ads_get_ad_preview` renderar bilden serverside och returnerar den som bildinnehåll — ingen fbcdn-trafik behövs. Fem dömbara statiska granskade. Fungerar för varje creative med eget `image_hash`; postbaserade kvarstår som blindfläck (se B21) |
| B19 | **Swipa Bryn-överlagerannonsen** | Manager 2026-08-13 | **[använd i batch #8]** som `SO_25_H1`–`SO_25_H3`. Framework i `swipes/Bryn-overlager-VSL.md` |

## Struken

| # | Idé | Varför |
|---|-----|--------|
| B10 | ~~Skala SP-copyn~~ | Falsifierad 2026-08-09. `SP_5_H1` gick från 1 405 till −75. |
| B17 | ~~Storlekskvalificering i bild~~ | Falsifierad 2026-08-12. `PD_6_1`: −332 kr per 1 000 på 2 472 kr. |

## Redo att launchas (briefade, ligger inte i kontot)

| Annons | Status | Åtgärd |
|---|---|---|
| Batch #7:s 18 briefer | Levererade 12 aug, **inga byggda** | Se B12. `SO_21`-flottan först |
| `SO_18_C1`, `PD_20_C1` | Briefade i batch #6, **aldrig byggda** | Karusellen otestad efter fyra försök |
| `SP_13_H1`, `SP_15_H1` | Launchade 7 aug, adsetet pausat vid 718 kr / 2 köp | Avpausa eller acceptera att testerna är förlorade |
| `SO_10_H1` | Launchad i kallt adset, 271 kr, 0 köp | Mäter inte retargeting. Se B8 |

> **Rättelse 2026-08-19:** jag läste först det nya i kontot som batch #7. Det var batch #6.
> Batch #7 är obyggd. Kontrollera annonsnamnen mot briefmappen innan launchstatus skrivs.
