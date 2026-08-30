# Norska produktrecensioner → Judge.me

Kör `/no-recensioner` (`.claude/commands/no-recensioner.md`). Den här filen är
bara lägesrapporten.

## Läget 2026-08-30 — klart

`JUDGEME_NO_API_TOKEN` inlagd och verifierad. Alla fem produkter med användbara
källark är på plats i Judge.me:

| Produkt | Synliga recensioner | Snitt |
|---|---:|---:|
| IBC-tanktrekk | 10 | 4,7★ |
| Kranbeskyttelse Frost 420D | 10 | 4,9★ |
| Sykkelshorts Herre | 8 | 5,0★ |
| Kjempefotball | 8 | 5,0★ |
| Overvåkingskamera | 10 | 5,0★ |
| Gamasjer Tur | 0 | ❌ källarket saknar betyg |

**Noll dubbletter.** Kranbeskyttelse, Sykkelshorts, Kjempefotball och
Overvåkingskamera var redan importerade av en tidigare körning — spärren
hoppade över dem. Bara IBC-tanktrekk importerades här.

**IBC-arkets tio recensioner har alla titeln "Bra produkt."** Så står det i
källarket och så importerades de. Vill Axel ha varierade titlar ändras de i
arket, inte här.

## Två saker som städades 2026-08-30

1. **Fel recensentnamn på IBC.** Första importen använde generiska adresser
   (`johan@example.com`), och Judge.me kopplade dem till främmande profiler:
   "Johan" publicerades som *klaas hum*, två andra som *Customer*. De tio
   döldes och importerades om med fullständiga namn och unika adresser.
2. **Dubbletter på Sykkelshorts och Kjempefotball.** Båda hade 16 recensioner
   där 8 var unika — importen hade körts två gånger innan spärren fanns.
   8 dubbletter per produkt döldes, ett exemplar av varje behölls.

⚠️ **Judge.me:s v1-API kan inte radera, bara dölja.** De 26 bortstädade
recensionerna ligger kvar i adminen som avpublicerade + spam-markerade och syns
inte för kunder. Vill Axel ha bort dem helt görs det i Judge.me-adminen.

## 🔴 Kvar att åtgärda

**`Damasker Vandring_REVIEW` saknar betyg på alla 10 rader** (och har tomt
`product_handle`). Kontrollerat två gånger 2026-08-30: fortfarande tomt. Utan
betyg kan Judge.me inte ta emot raden. Fyll i betygen i arket, kör om bygget —
inga betyg hittas på eller gissas här.

## Dubblettspärr

`judgeme-import.mjs` kollar om produkten redan har recensioner och hoppar över
den i så fall. Judge.me har ingen egen spärr — utan den skulle en andra körning
ge produkten allt i dubbel upplaga. Spärren slår upp Judge.me:s eget produkt-id
via `/products/-1?external_id=<shopify-id>` och filtrerar `/reviews` på det;
Shopify-id:t direkt mot `/reviews` ignoreras tyst av API:et.

## Bälteslipmaskin Mini

Har ingen REVIEWS-fil i sin Drive-mapp och är därför inte med i `sources.json`.
Dyker en upp: lägg till produkten och kör om.
