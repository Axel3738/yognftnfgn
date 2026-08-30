# Norska produktrecensioner → Judge.me

Kör `/no-recensioner` (`.claude/commands/no-recensioner.md`). Den här filen är
bara lägesrapporten.

## Läget 2026-08-30

| Produkt | Norskt handle | Rader | Importerad |
|---|---|---:|---|
| IBC-tanköverdrag | `ibc-tanktrekk-1000-l-stopper-alger-uv` | 10/10 | ⏳ väntar på token |
| Kranskydd Frost 420D | `kranbeskyttelse-frost-420d-beskytter-utekranen-i-vinter` | 10/10 | ⏳ väntar på token |
| Cykelshorts Herr | `sykkelshorts-herre-polstret-med-kompresjon` | 8/8 | ⏳ väntar på token |
| Jättefotboll | `kjempefotball-60-cm-oppblasbar-for-hage-basseng` | 8/8 | ⏳ väntar på token |
| Övervakningskamera Trådlös | `overvakingskamera-tradlost-dobbeltlinse-ptz-med-ai-sporing` | 10/10 | ⏳ väntar på token |
| Damasker Vandring | `gamasjer-tur-holder-sno-vaete-grus-ute` | **0/10** | ❌ källarket saknar betyg |

**46 recensioner klara.** Alla handles verifierade mot `beverbutikken.no/products.json`.

## 🔴 Två saker kräver Axel

1. **`JUDGEME_NO_API_TOKEN` saknas i environmentet.** Judge.me-tokens är per
   butik — `JUDGEME_API_TOKEN` är den svenska butikens och ger
   `Failed to authenticate` mot den norska. Hämtas i Judge.me-adminen för
   beverbutikken.no (Settings → Integrations → API token). Judge.me *är*
   installerat på butiken, så det är bara tokenen som fattas.
2. **`Damasker Vandring_REVIEW` saknar betyg på alla 10 rader** (och har tomt
   `product_handle`). Kontrollerat igen 2026-08-30: fortfarande tomt. Utan betyg
   kan Judge.me inte ta emot raden. Fyll i betygen i arket, kör om bygget —
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
