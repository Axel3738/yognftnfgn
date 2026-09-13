# FjordCover — variantväljaren i paketen, rättad 2026-09-13

Butik: **FjordCover**, `j0p8qz-kp.myshopify.com` / fjordcover.se.
Tema: **FjordCover – CRO v1** (`145386274864`, live).
Nycklar: `SHOPIFY_SHOP_j0p8qz_kp`, `SHOPIFY_CLIENT_ID_j0p8qz_kp`,
`SHOPIFY_CLIENT_SECRET_j0p8qz_kp`, `SHOPIFY_STOREFRONT_PASSWORD_j0p8qz_kp`.

⚠️ Butiken är byggd utanför den här fabriken — den har ingen
`factory/butiker/fjordcover.yaml` och ingen state-fil. Den ligger bakom
lösenord (ej lanserad vid rättningen).

## Vad som var fel

Temat körde en **gammal `ms-paket`** — versionen före Axels beslut 2026-09-10
om variantval per enhet. Kunden valde motorstorlek **en** gång i temats egen
pill-väljare, och ett 2-pack lade då 2 × samma storlek i vagnen. För ett
båtmotorskydd med nio storlekar (0–5 hk … 250–350 hk) är det fel produkt: den
som köper två skydd har sällan två likadana motorer.

Mätt i temat 2026-09-13:
- `snippets/ms-paket.liquid` 184 rader, saknade `data-egen-val` och hela
  `[data-ms-val]`-blocket.
- `assets/ms-paket.js` 16 516 byte, noll träffar på `egenVal`.
- `assets/ms-paket.css` saknade `.ms-val__knapp` m.fl.

## Vad som gjordes

`assets/ms-paket.css` och `assets/ms-paket.js` lades upp rakt av från
`factory/tema/ops-tema.zip` (basen = `factory/tema/assets/ms-paket.js`,
filerna är identiska). CSS:en är rent additiv; JS-diffen tar bara bort de fem
rader som den nya per-enhet-räkningen ersätter.

`snippets/ms-paket.liquid` gick **inte** att ta rakt av. Bas-zipen är nyare på
variantväljaren men äldre på två saker som den här butiken har, så filen är en
sammanslagning — kopian ligger som `ms-paket.liquid` här bredvid:

1. **`fastpris_valutor` behölls.** Metaobjektdefinitionen `ms_paketniva` i den
   här butiken bär `fastpris_valutor` och **inte** `rabatt_procent`. Bas-zipen
   hade bytt ut det ena mot det andra. Utan blocket skrivs SEK-beloppet rakt av
   om butiken någon gång börjar fakturera i NOK. Båda grenarna ligger nu kvar —
   procentgrenen blir 0 när fältet saknas i definitionen.
2. **De norska raderna behölls** (`Velg pakke`, `Gratis med på kjøpet`,
   `verdi`). Bas-zipen har dem hårdkodade på svenska. Marknaden Norge är
   aktiv i butiken.

`templates/product.json`: paketblocken A och B skickar nu `enhet` till
snippeten, språkstyrt — `skydd` på svenska, `deksel` på norska. Utan det hade
rullgardinerna hetat "St 1 / St 2".

## Trippelkollen (kundens riktiga vy, inloggad med butikslösenordet)

| Kontroll | Svensk sida | Norsk sida |
|---|---|---|
| `data-egen-val="1"` (A + B) | 2 ✅ | 2 ✅ |
| Rullgardiner per nivå (1/2/3) | 1, 2, 3 ✅ | 1, 2, 3 ✅ |
| Alternativ totalt (12 rutor × 9 varianter) | 108 ✅ | 108 ✅ |
| Etiketter | Skydd 1–3 ✅ | Deksel 1–3 ✅ |
| Paketpriser oförändrade | 579 / 984 / 1 390 (A), 926 / 1 303 (B) ✅ | samma ✅ |
| Språk i paketrutan | svenska ✅ | norska ✅ |

Priserna är exakt de som står i metaobjekten — rättningen rör bara väljaren,
inte pengarna.

## Att veta

- Marknaden **Norge fakturerar i SEK** (mätt med `?country=NO` 2026-09-13), så
  `fastpris_valutor` är tomt med flit just nu. Börjar butiken ta NOK måste
  fältet fyllas per nivå, annars visas svenska kronor som norska.
- Bas-zipen `factory/tema/ops-tema.zip` saknar fortfarande både
  `fastpris_valutor` och de norska raderna. Nästa butik som byggs därifrån
  ärver samma två luckor — inte rättat här, för det rör alla butiker.
