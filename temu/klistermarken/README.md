# Klistermärken för Soptunnan — luckan i fyra butiker (2026-09-03)

Axel frågade om produkten fanns i Norge. Den fanns **bara i Sverige** — inte i
NO, DK, FI eller UK. Nu ligger den i alla fem.

SKU `TEMU-601102867393554` (samma i alla butiker). Kategori
`gid://shopify/TaxonomyCategory/hg-3-38` (Home Decor Decals).

## Priser och inköpspris

| Butik | Pris | Jämförpris | COGS |
|---|---|---|---|
| SE | 199 SEK | 259 SEK | 47,56 (fanns) |
| NO | 199 NOK | 259 NOK | 52,93 |
| DK | 149 DKK | 199 DKK | 36,87 |
| FI | 19,90 € | 25,90 € | 5,47 |
| UK | £14,99 | £19,99 | 3,50 |

Priserna är SE-priset × landfaktorerna i `UTLANDS-LANSERING.md` (NO ×1,13,
DK ×0,74, FI ×0,097, UK ×0,074), avrundat till lokala prispunkter. Jämförpris
= pris × 1,3. COGS enligt `temu/cogs/README.md`: SE-kostnaden tillbaka till USD
med den låsta kursen, × landfaktor, × landets kurs. Marginalen landar 3,6–4,3×
kostnaden i alla fyra — över 3×-golvet.

## Defekter som rättades i SE innan produkten klonades

Källprodukten hade fel som annars hade följt med till fyra butiker till:

1. **"snabb leverans" i garantiblocket** — förbjudet enligt copy-reglerna.
   Ersatt med GARANTI4-strängen ("Smidig leverans").
2. **Bullets utan utfall i fetstil** — alla fem skrevs om enligt och?-testet.
3. **Inget jämförpris** (166 av 181 SE-produkter hade ett).
4. **Fem av sju bilder saknade alt-text.**
5. **Storleksguiden var på engelska.** Nu finns den på fem språk.
6. **Lagerspårning påslagen** — av, som på resten av katalogen.

## Storleksguiderna

`storleksguide.mjs` bygger `storlek-<land>.jpg` ur den engelska originalbilden:
textrutorna målas över med bakgrundsfärgen (#fdf8e7) och ny text ritas som skarp
SVG med DejaVu Sans. **Ingen AI** — samma princip som damaskrättningen.
Måtten är låsta mot bilden: motivet 16 × 19 cm, arket 20 × 20 cm, 4 ark per set.

## Sidofynd som rättades i samma svep

- **12 danska produkter lovade "Hurtig levering"** — bytt mot "Smidig levering".
  Svepet: `node temu/klistermarken/fartsvep.mjs` (läser alla fem butiker).
- **6 produkter hade kvarglömda platshållarkommentarer** i beskrivningen
  (`<!-- GIF 1: byt ut bilden nedan mot en animerad GIF -->`) — SE/NO/FI, samma
  två produkter i varje. Rensade med `kommentarsvep.mjs`.
  ⚠️ **TODO som därmed försvann ur butiken:** *Sätesöverdrag för Åkgräsklippare*
  och *Triangulärt Solsegel* väntar fortfarande på två GIF:ar var (problem +
  lösning/montering) i alla tre butikerna.

## Kör igen
```bash
node temu/klistermarken/rulla.mjs <no|dk|fi|uk>            # torrkörning
node temu/klistermarken/rulla.mjs <no|dk|fi|uk> --skarp    # hoppar om SKU finns
node temu/klistermarken/slutkoll.mjs                        # granskar alla fem
node temu/klistermarken/fartsvep.mjs                        # hastighetslöften
node temu/klistermarken/kommentarsvep.mjs [--skarp]         # platshållare
```
