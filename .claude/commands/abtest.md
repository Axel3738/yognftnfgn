# /abtest – Läs av eller planera ett A/B-test på matstrumpor.se

Argument: `$ARGUMENTS` — test-id, eller `planera`.
Exempel:
- `/abtest buybox` — läs av testet som heter buybox
- `/abtest` — lista vilka tester som rullar och läs av alla
- `/abtest planera` — hur lång tid ett test skulle ta med butikens nuvarande trafik

⚠️ **Butik: matstrumpor.se.** Inte Bäverbutiken. Kolla att Shopify-connectorn
pekar rätt innan du hämtar något — fel butik ger siffror som ser rimliga ut men
är från fel verksamhet. Verifiera med `get-shop-info` och läs av `domain`.

## Gör följande

1. **Verifiera butiken.** `get-shop-info` → `domain` ska vara `matstrumpor.se`.
   Är den något annat: stanna och säg det, hämta ingen data.

2. **Hämta trafiken.** ShopifyQL: `FROM sessions SHOW sessions SINCE -30d UNTIL today`
   samt `FROM sales SHOW net_sales, orders SINCE -30d UNTIL today`.
   Räkna fram konverteringsgrad och besökare per dag.

3. **Om argumentet är `planera`** (eller om inget test rullar):
   kör `node theme-matstrumpor/ab/analys.mjs --planera --baslinje <konv> --trafik <besökare/dag>`
   och leverera tabellen. Säg rakt ut vilka lyft som är mätbara inom sex veckor
   och vilka som inte är det. Sluta här.

4. **Hämta ordrarna.** GraphQL mot Admin API, ordrar sedan testet startade,
   med `customAttributes` **och `discountCodes`**. Attributen heter `AB <test-id>`
   med värdet `a` eller `b`. Ordrar som även har `AB <test-id> forced` = `ja` är
   granskningsbesök och ska bort.

   ⚠️ **Stämpeln saknas på en del ordrar — använd rabattkoden som reserv.**
   Avläst 2026-09-19: tre av sju ordrar efter publiceringen saknade
   `AB sortval`, två av dem bevisligen från B (de bar B:s egna koder). Orsaken
   är köpvägar som aldrig passerar produktsidans kod (expressknappar,
   kundvagnssidan, en vagn fylld vid ett tidigare besök). `ms-ab.js` fick en
   efterstämpling 2026-09-19 som täpper till det framåt, men gamla ordrar
   måste läsas via koden:

   | Kod på ordern | Variant |
   |---|---|
   | `SUSHI-*`, `PIZZA-*`, `HAMBURGARE-*`, `DONUT-*` | A |
   | `STRUMPOR-K1F1-P*`, `STRUMPOR-K2F2-P*` | B (koderna finns bara i B) |

   Saknas både stämpel och kod går ordern inte att tillskriva — räkna den som
   okänd och **redovisa antalet okända** bredvid resultatet. Hitta aldrig på en
   variant.

5. **Skriv en JSON-fil** med formen
   `[{ "name": "#1042", "totalPrice": 399, "attributes": { "AB buybox": "b" } }]`
   och kör `node theme-matstrumpor/ab/analys.mjs --test <id> --ordrar <fil>`.
   Har du besökarantal per variant: skicka även `--besokare-a` och `--besokare-b`,
   det ger ett starkare test.

6. **Leverera rapporten rakt av.** Ändra inte beskedet. Säger verktyget
   "för få köp" är det svaret — leta inte efter ett mönster i 12 ordrar.

7. **Vid `B vinner`:** föreslå att B görs permanent, men publicera inte själv.
   Vid `fortsätt`: säg hur många köp eller besökare som fattas och ungefär hur
   många dagar det är kvar.

## Regler

- **Ingen dom under 25 köp per variant.** Verktyget vägrar, och du ska inte
  försöka runda det med resonemang.
- **Rangordna aldrig på ett enda tal.** Konvertering och snittordervärde kan
  peka åt olika håll — en variant som säljer mer sällan men i större paket kan
  vara den bättre. Redovisa båda.
- **Hitta aldrig på siffror.** Alla tal kommer ur Shopify eller ur skriptet.
- Rör inte det publicerade temat.

## DEFINITION OF DONE

- [ ] Butiken verifierad som matstrumpor.se
- [ ] Trafik och konverteringsgrad hämtade ur Shopify
- [ ] Ordrar hämtade med customAttributes, tvingade besök borträknade
- [ ] `analys.mjs` körd och rapporten levererad oförändrad
- [ ] Både konvertering och snittordervärde redovisade
- [ ] Nästa steg angivet: publicera B, fortsätt, eller lägg ner testet
