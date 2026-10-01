# LTV-mallen ur Evolve Finance modul 2

Google Sheet `1L5hl4jERkf9PRx758K6RjNHjCbZt0aqqKiJ2YEfWe9w` (länkad i lektionen), exporterad
2026-10-01. Två flikar med samma uppbyggnad: "SUBX WITH OVERHEAD" och "Copy of SUBX WITH OVERHEAD".

## Uppbyggnad (rader och kolumner)

| Cell | Innehåll | Formel |
|---|---|---|
| A1 | Kohortens månad ("FEB") | |
| B1…N1 | Månad 0 … 12 | `=B1+1` |
| A2 | "Post This Month Cohort Retention \| LTV" — LTV-multiplikatorn | B2 = 1 (100 %), C2 = 0,7, D2 = `=C2*0.5` … (flik 1 halverar varje månad, flik 2 tar ×0,7) |
| A3 | REVENUE | B3 = `=(A11*D11)*B2` (AOV × antal kunder), C3… = `=$A$13*C2` (AOV andra ordern × multiplikator) |
| A4 | MARGIN | B4 = `=B3*$C11-(B11*D11)` (intäkt × marginal − CAC × kunder), C4… = `=C3*$B$13*$D$11` (intäkt × marginal andra ordern × kunder) |
| A5 | TOTAL REVENUE FROM COHORT | kumulativt: `=(C3*$D$11)+B5` |
| A6 | TOTAL MARGIN FROM COHORT | kumulativt: `=C4+B6` — **skalningsbeslutet** |
| A10/A11 | AOV (första order) | indata (orange) |
| B10/B11 | CAC | indata, i exemplet `=22.72*1.25` |
| C10/C11 | MARGIN | `=1-E11` |
| D10/D11 | TOTAL Customers | indata |
| E10/E11 | COGS + OPEX | `=G11+H11` |
| F10/F11 | 90 DAY MAX CAC | `=E6+B11` |
| G10/G11 | COGS | indata (0,33 resp. 0,245) |
| H10/H11 | OPEX AS COGS | `=H18` |
| A12/A13 | AOV 2ND ORDER | indata (39 resp. 39,99) |
| B12/B13 | MARGIN 2ND ORDER | indata (0,75 resp. 0,76) |
| G13/H13 | EST TOPLINE REV | 10 000 000 |
| G14/H14 | OPEX | 0 |
| G15/H15 | AOV | `=A11` |
| G16/H16 | TRANSACTIONS | `=H13/H15` |
| G17/H17 | OPEX PER TRANS | `=H14/H16` |
| G18/H18 | OPEX ADDITIONAL % COGS | `=H17/H15` |

## Exemplet i flik 1

AOV 38 $, CAC 28,40 $, 2 800 kunder, varukostnad 33 %, andra ordern 39 $ med 75 % marginal:
kohortens bidrag −8 232 $ månad 0, +49 098 $ efter månad 1, +106 411 $ efter tolv månader.

## Vår motsvarighet

`ekonomi/barometrar.mjs` räknar samma sak ur Shopify i stället för en antagen multiplikator: per
kohort (första köpets månad) kronor per kund och bidrag före reklam, kumulativt per månad, mot
den månadens nCAC. Vi har ingen prenumeration, så rad 2 är nästan noll efter månad 0
(Matstrumpor 1,2 % återköp).
