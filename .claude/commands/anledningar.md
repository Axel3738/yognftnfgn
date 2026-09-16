# /anledningar – "N anledningar till att …" (listicle) för en produkt, 5 eller 7 punkter

Argument: `$ARGUMENTS` — länken till produktsidan på Bäverbutiken (eller
flera länkar: en sida per länk, i tur och ordning, enligt `/lagerrensning` →
"Flera produkter i samma kommando"), valfritt
följt av `7` (sju punkter; standard är fem). Valfritt `--butik <id>`
(standard: Bäverbutiken när länken är baverbutiken.se; annars ett OPS-id),
`--torr`, `--igen <plats>`, `--gempages`, `--brand baverbutiken` (bara om
Axel ber om det).

```
/anledningar https://baverbutiken.se/products/strandtofflor-for-herr-halkfria-tradgardsskor
/anledningar https://baverbutiken.se/products/strandtofflor-for-herr-halkfria-tradgardsskor 7
/anledningar https://baverbutiken.se/products/axelbalte-for-trimmer-justerbart-nylonbalte 7 --butik carashell
```

**Syskon till `/lagerrensning`.** Samma mall, samma motor
(`listicle/bygg.mjs --koncept anledningar [--punkter 7]`), samma leverans:
sidan läggs upp direkt i butiken som `/pages/<slug>-5-anledningar` eller
`/pages/<slug>-7-anledningar` — antalet står i adressen så båda kan ligga
uppe samtidigt. **Järnreglerna 2–7, läsbarhetstestet och stegen 0–1 och
4–8 är identiska med `/lagerrensning` — läs `.claude/commands/lagerrensning.md`
FÖRST och följ den, med `--koncept anledningar` (och `--punkter 7` när
Axel skrev 7) i varje `bygg.mjs`-anrop och utdatamappen
`listicle/output/anledningar/<handle>/`.** Här står bara det som skiljer.

## 5 eller 7? (Axels fråga 2026-09-16)

"Jag har alltid kört 5 punkter, mina vänner brukar köra 7 … det känns som
att ingen läser alla 7 … eller så kör vi 7 för folk vill läsa om vi gör ett
bra problembyggande." Ingen data i repot avgör det. Därför:

- **Standard är 5.** Sju byggs bara när Axel skriver `7`.
- **Rekommendationen är att testa båda på samma produkt:** kör kommandot
  två gånger (utan och med `7`), få två adresser, och låt två annonsgrupper
  med samma creative peka på var sin. Då svarar datan. Skriv det i
  rapporten första gången produkten får en anledningar-sida.
- Sju punkter är inte fem punkter plus två svaga. Punkt 6–7 måste bära
  eget problembyggande (se skelettet) — annars är det bättre med fem.
  Kan du inte skriva sju punkter som var och en klarar tre-frågorstestet:
  bygg fem och säg det i rapporten.

Tekniskt: motorn klonar mallens sektioner för punkt 4 och 5 till punkt 6
och 7 (bild till höger respektive vänster, ikonerna 6 och 7, nya id:n).
Copyn ska ha exakt så många punkter som körningen: motorn stoppar annars.

## De N punkterna (skelettet)

Anledningarna är produktens bevisade vinklar i fallande ordning, från
största smärtan till "varför just den här". Varje rubrik är ett påstående
("3. Den tar vikten i axlarna, inte i armarna"), aldrig ett funktionsnamn
("3. Justerbara remmar").

| Punkt | Vad anledningen bär | Källa |
|---|---|---|
| 1 | Huvudproblemet produkten löser — den vinkel som spenderat pengar bäst i DNA:t | `dna.md` Winning DNA / playbook |
| 2 | Vad det kostar att INTE ha den: per dag, per säsong, i kropp eller i pengar (bara produktsidans priser som siffror) | DNA + produktsidan |
| 3 | Mekanismen: hur den gör det (material, konstruktion, passform) | produktsidan |
| 4 | Passar de flesta / enkel att använda / tar tio sekunder (bara om produktsidan säger det) | produktsidan |
| 5 | Prislogiken + garantin: varför priset är rimligt mot alternativet, 30 dagar | produktsidan |
| 6 *(bara vid 7)* | Vad det billiga alternativet saknar — konkret, utan konkurrentnamn | DNA (mönster "billigt är dyrare") |
| 7 *(bara vid 7)* | Det man inte tänkte på: en andra användning eller en säsong till, som produktsidan faktiskt täcker | produktsidan |

Vid fem punkter tar punkt 5 hand om priset OCH garantin. Vid sju ligger
"billigt alternativ" och "andra användningen" sist — det är där läsaren som
redan är övertygad får sina sista skäl, och den som inte är det slutar läsa
utan att något gått förlorat.

**Hero-rubriken bär antalet:** "5 anledningar till att skaffa ett axelbälte
innan sommaren" / "Sju anledningar …" — motorn varnar annars. **Lyckas-
blocket** heter "Så vad gör de som redan har en?" (vad de slipper + produktens
fakta). **Ärlig-blocket** ("Jag ska vara ärlig:") tar den anledning som INTE
gäller alla — vem som inte behöver den. **Riskfritt** = 30 dagar.

## Copy — skillnader mot /lagerrensning

- Rubriken: antalet i stället för priserna. Priset får stå i punkt 5 och i
  knapparna; jämförpriset bara om produktsidan har ett.
- Formen: `listicle/mall/exempel-copy.json`, men med 5 ELLER 7 objekt i
  `punkter` — exakt det antal körningen har.
- Punktrubrikerna numreras "1." … "7." — motorn varnar om numret saknas.
- Författarraden på en obrandad sida: "Av **Anders på lagret.**"
- Inget butiksnamn, inga betyg, inga kunder, ingen procent — som förut.

## Bilderna

En bild per punkt (7 punkter = 7 bilder + `lyckas`). Rollerna: 1 problemet,
2 kostnaden/slitaget, 3 mekanismen (närbild, produktbild), 4 i bruk
(produktbild), 5 hela produkten/priset (produktbild), 6 det billiga
alternativet (kie: en sliten/tunn motsvarighet, inga loggor), 7 den andra
användningen (produktbild eller kie). Produktbilder först, kie bara där
ingen passar. Bildplanen måste ha alla platser för körningens antal —
`punkt6` och `punkt7` när det är sju.

## Rapport till Axel (kort, svenska)

Som `/lagerrensning`, plus: antal punkter, och (första gången) förslaget att
testa 5 mot 7 med två annonsgrupper. Sist:

1. Öppna `https://<butik>/pages/<slug>-<5|7>-anledningar` och läs igenom en gång.
2. Peka annonserna på den adressen — eller på båda om du testar 5 mot 7.

## DEFINITION OF DONE
- [ ] Underlag hämtat; pris (och ev. jämförpris) lästa ur butiken; inget betyg
- [ ] Antalet punkter = Axels val (5 om inget sagts); rubriken bär antalet
- [ ] Varje anledning är ett påstående med källa (DNA/produktsidan), i fallande ordning; vid 7: punkt 6–7 bär eget problembyggande
- [ ] Copy skriven av huvudsessionen; läsbarhetstest + tre-frågorstest redovisade
- [ ] Obrandad (inget butiksnamn)
- [ ] `--torr` utan ❌; skarp körning: bilder på CDN, sidan uppe i butiken och läst tillbaka utan header/footer
- [ ] Skärmdumpar tittade på (alla punkter, ikonerna 6/7 vid sju); batch-log uppdaterad om produkten har minne; committat och pushat
- [ ] Rapport + Axels klick sist, numrerade; 5-mot-7-testet föreslaget första gången
