# Damasker/gamasjer — 18 färgvarianter i alla fem butiker (2026-08-31)

Axel skickade en rar med 21 leverantörsbilder. Produkten hade **3 färger**
(Gul, Neongrön, Orange) och bara Orange hade variantbild. Nu: **18 färger,
alla med egen variantbild**, i SE/NO/DK/FI/UK.

SKU-bas `TEMU-601101617191068-<suffix>`. Priser och cogs ärvda från de
befintliga varianterna per butik (SE 389 / NO 309 / DK 279 / FI 41,90 / UK 20,99).

## Suffixschemat (identiskt i alla butiker)
GU gul · NG neongrön · OR orange *(fanns)* · SV svart · GR grå · MB marinblå ·
BL blå · LB ljusblå · RD röd · LI lila · RA rosa · BR brun · VI vit · OL olivgrön ·
KG kamouflage grön · KS kamouflage svart · BN blå/neongrön · CN cerise/neongrön

## Bildarbetet
Fyra leverantörsbilder hade kinesisk text (户外徒步雪套 + svart badge): lila, brun,
svart och marinblå. Texten togs bort med KIE (nano-banana-edit) — **bara
borttagning, ingen ny text**, enligt metoden i `temu/cogs/README.md`-syskonet
`temu/bildskord/grilloverdrag-sv/README.md`. De rensade PNG:erna ligger här.

Sex av de 21 bilderna användes inte: dubbletter av gul och grå (platta
varianter av färger som redan hade bättre bild) samt en blå i plastpåse.
⚠️ Olivgrön (OL) har som enda färg bara en bild i plastpåse — den är godkänd
men sämre än övriga. Byt om en ren bild dyker upp.

## Kör igen
```bash
node temu/damasker/damask-rulla.mjs <se|no|dk|fi|uk>          # torrkörning
node temu/damasker/damask-rulla.mjs <se|no|dk|fi|uk> --skarp
node temu/damasker/damask-kolla.mjs                            # verifiering
```
Skriptet hoppar över färger som redan finns, så det går att köra om utan att
skapa dubbletter.
