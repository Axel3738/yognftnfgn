# Creative DNA — TackleBay, Adventskalender Fiskedrag (24 drag)

Skapad 2026-09-11 av `/notionscalercs setup tacklebay/adventskalender-fiskedrag`
(körning nr 1 — setup). Nyckel `tacklebay/adventskalender-fiskedrag`.

## Läget: INGEN DATA, INGEN RUTIN

- **Inga annonser.** Ingen kampanj med `TackleBayKalender` i OPS-kontot
  (`factory/budgetrond.mjs … --torr` 2026-09-11: 0 av 16 kampanjer).
- **Ingen ärvd historik.** Källprodukten på Bäverbutiken har inget annonsprefix
  (`kalla.annonsprefix` tomt i `factory/produkter/tacklebay-fiskekalendern.yaml`)
  — `--arv` hoppas över med det skälet.
- **Ingen creative hub.** Ingen databas i Notion med kalendern som produkt är
  synlig för integrationen (2026-09-11: 9 databaser synliga, ingen med
  "advent"/"lure"/"fiskedrag" utom AdventLanes racingkalender). Sökning på
  "TackleBay" ger noll sidor, så det finns heller ingen föräldersida att skapa
  hubben under via `tools/notion-hub.mjs`.
- **Axels beslut 2026-09-10:** "kalendern har vi inte ens några annonser för —
  skippa den." Produkten ligger kvar i butiken och som betald upsell i
  spöhållarens varukorg (Q4-ramverket).

**Därför byggdes ingen nattvakt för kalendern i setup 2026-09-11.** En rutin
utan kampanj, utan hub och utan arv hade gjort ingenting varje natt och
producerat sju briefer ur tomma intet varje onsdag och söndag.

## Om Axel vill annonsera kalendern (säsong: fram till 24 december)

Det som krävs, i ordning: (1) en sida i TackleBays teamspace i Notion delad
med integrationen **Bäverbutiken RUTINER**, så hubben kan skapas
(`node tools/notion-hub.mjs --foralder <sida> --butik tacklebay`); (2) första
batchen via `/ny-annonser tacklebay/adventskalender-fiskedrag` — utan arv blir
det `/ny-produkt`-läge: alla koncept märkta gissning tills 300 kr / 3 köp;
(3) `/notionscalercs setup tacklebay/adventskalender-fiskedrag` igen.

## Vinklar ur produktfilen (obeprövade, ingen data)

Presentproblemet ("den som redan har allt i lådan"), "24 morgnar, inte en",
"Alternativet är strumpor. Igen." Köparen är gåvogivaren, inte fiskaren.
Källa: källsidans egen ingress. Ekonomi (gissad COGS 40 %): pris 469 kr,
jämförpris 619 kr, TB 281 kr, BE-ROAS 1,67, BE-CPA 281 kr, utan moms.
