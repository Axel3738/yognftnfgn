# /dashboard – Bygg och läs redigerardashboarden

Argument: `$ARGUMENTS` — valfritt datum eller period.
Exempel: `/dashboard` · `/dashboard 2026-08-01` · `/dashboard vecka` · `/dashboard 2026-07-30 till 2026-08-06`

## Gör följande

1. Kör `node dashboard/build.mjs` (lägg till `--date`, eller `--from`/`--to` om ett datum/period angetts).
2. Kör `node dashboard/cli.mjs status` med samma datum och visa outputen.
3. **Sammanfatta i klartext för managern**, i denna ordning:
   - Vad kräver hennes uppmärksamhet just nu (blockers först, sedan sena, sedan review-kön).
   - Vilka produkter ligger under creative-målet och med hur mycket.
   - Vilka redigerare som ligger efter, och om det beror på blockers eller kapacitet.
   - Vem som saknar slutrapport.
   - En rad: **vad hon ska göra härnäst**.
4. Säg var filen ligger: `dashboard/index.html` — öppnas direkt i webbläsaren.

Hitta aldrig på siffror. Allt kommer ur `dashboard/data/` och `products/products.json`.

## DEFINITION OF DONE
- [ ] Dashboarden byggd (kommandot kört, inte påstått)
- [ ] Statusoutput visad
- [ ] Sammanfattning i klartext med blockers först
- [ ] En konkret "gör detta härnäst"-rad
