# Norska produktrecensioner → Judge.me

Kör `/no-recensioner` (`.claude/commands/no-recensioner.md`). Den här filen är
bara lägesrapporten.

## Läget 2026-08-30

`JUDGEME_NO_API_TOKEN` inlagd och verifierad. Norska butiken hade redan 315
recensioner sedan tidigare körningar, så dubblettspärren gjorde jobbet:

| Produkt | Norskt handle | Läge |
|---|---|---|
| IBC-tanktrekk | `ibc-tanktrekk-1000-l-stopper-alger-uv` | ✅ 10 importerade 2026-08-30 |
| Kranbeskyttelse Frost 420D | `kranbeskyttelse-frost-420d-beskytter-utekranen-i-vinter` | ⏭️ hade redan 10 — hoppades över |
| Sykkelshorts Herre | `sykkelshorts-herre-polstret-med-kompresjon` | ⏭️ hade redan 16 (**8 dubbletter**) |
| Kjempefotball | `kjempefotball-60-cm-oppblasbar-for-hage-basseng` | ⏭️ hade redan 16 (**8 dubbletter**) |
| Overvåkingskamera | `overvakingskamera-tradlost-dobbeltlinse-ptz-med-ai-sporing` | ⏭️ hade redan 10 — hoppades över |
| Gamasjer Tur | `gamasjer-tur-holder-sno-vaete-grus-ute` | ❌ källarket saknar betyg |

De fyra överhoppade har recensioner med andra namn än våra CSV:er (Eirik Hansen,
Silje, Kjetil, Nora …) — en tidigare körning översatte och importerade dem redan.
CSV:erna i `output/` för dem är alltså överflödiga, men lämnas kvar som facit.

**IBC-arkets tio recensioner har alla titeln "Bra produkt".** Så står det i
källarket och så importerades de. Vill Axel ha varierade titlar ändras de i
arket, inte här.

## 🔴 Kvar att åtgärda

1. **Sykkelshorts och Kjempefotball har varje recension i dubbel upplaga**
   (8 unika × 2 = 16 vardera). Någon körde importen två gånger innan
   dubblettspärren fanns. De 8 extra per produkt kan raderas via Judge.me:s
   API — men det är en irreversibel radering, så den görs bara på Axels ok.
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
