# Norska produktrecensioner → Judge.me

Kör `/no-recensioner` (`.claude/commands/no-recensioner.md`). Den här filen är
bara lägesrapporten.

## Läget 2026-08-30 — klart

Alla sju norska produkter har namngivna recensioner, noll dubbletter:

| Produkt | Synliga | Snitt |
|---|---:|---:|
| IBC-tanktrekk | 10 | 4,7★ |
| Kranbeskyttelse Frost 420D | 10 | 4,9★ |
| Sykkelshorts Herre | 8 | 5,0★ |
| Kjempefotball | 8 | 5,0★ |
| Overvåkingskamera | 10 | 5,0★ |
| Gamasjer Tur | 10 | 4,4★ |
| Beltesliper Mini | 10 | 5,0★ |

Gamasjer och Beltesliper stod som "Anonymous" och fick norska namn genom att
texten och betyget lästes ur Judge.me, de gamla raderna doldes och samma
recensioner lades in på nytt. Ingen text är påhittad.

Gamasjers källark saknar fortfarande betyg, men produkten behöver det inte
längre — recensionerna finns och är namngivna. Beltesliper-arket heter `_REVEW`
(felstavat) och missas av en sökning på "review"; kommandot matchar på "rev".

⚠️ **Judge.me:s v1-API kan inte radera, bara dölja.** De bortstädade raderna
ligger kvar i adminen som avpublicerade + spam-markerade och syns inte för
kunder. Ska de bort helt görs det i Judge.me-adminen.

⚠️ **En annan körning importerade tio anonyma IBC-recensioner mitt i arbetet**
(e-post `support+anonymous@judge.me`, samma innehåll som våra). De doldes.
Kör bara en recensionsrutin i taget mot samma butik.

## Dubblettspärr

`judgeme-import.mjs` kollar om produkten redan har recensioner och hoppar över
den i så fall. Judge.me har ingen egen spärr — utan den skulle en andra körning
ge produkten allt i dubbel upplaga. Spärren slår upp Judge.me:s eget produkt-id
via `/products/-1?external_id=<shopify-id>` och filtrerar `/reviews` på det;
Shopify-id:t direkt mot `/reviews` ignoreras tyst av API:et.

## Bälteslipmaskin Mini

Har ingen REVIEWS-fil i sin Drive-mapp och är därför inte med i `sources.json`.
Dyker en upp: lägg till produkten och kör om.
