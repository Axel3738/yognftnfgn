# TackleBay — produktminne för en FLERPRODUKTSBUTIK

TackleBay har två jämlika produkter (Axels beslut 2026-09-09), och nattvakten
(`/notionscalercs`) körs per **produktnyckel**, inte per butik. Därför ligger
minnet per produkt, med samma sökväg som nyckeln i OPS-registret:

| Nyckel | Minne | Läge 2026-09-11 |
|---|---|---|
| `tacklebay/fiskespohallare-4-pack` | `products/tacklebay/fiskespohallare-4-pack/` | annonser live sedan 2026-09-10, nattvakt byggd |
| `tacklebay/adventskalender-fiskedrag` | `products/tacklebay/adventskalender-fiskedrag/` | inga annonser, ingen hub — Axel 2026-09-10: "skippa den" |

Varje mapp har `dna.md` (Creative DNA), `batch-log.md` (batcher + hypoteser +
utfall) och `backlog.md` (koncept som väntar). Läs dem innan du agerar,
uppdatera dem efter, committa och pusha.

⚠️ Läs aldrig produkternas siffror mot varandra utan att väga in att kalendern
är säsong (död efter 24 december) och spöhållaren året runt.

⚠️ `factory/budgetrond.mjs` och `factory/skalning.mjs --spara` skriver sina
underlag till `factory/output/<butik>/…-<datum>.json` — alltså **samma fil för
båda produkterna** samma dag. I dag ofarligt (bara spöhållaren har en rutin),
men byggs en nattvakt för kalendern måste sökvägen få produkt-id:t först.
