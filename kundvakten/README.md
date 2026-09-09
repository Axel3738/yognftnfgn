# Kundvakten

Veckorutin för Bäverbutiken som svarar på tre frågor:

1. **Vad mailar kunderna om?** — de återkommande problemen, rankade, med trend
   mot förra veckan.
2. **Vad är på väg att bli en chargeback?** — förvarningarna, det som går att
   stoppa innan pengarna är borta.
3. **Vilka produkter drar chargebacks?** — rankade på pengar i risk, mätta mot
   kortnätverkens gränser.

**Läs-bara.** Rutinen ändrar ingenting i butiken, rör inte annonskontot och
skriver aldrig i Notion. Den räknar och rapporterar.

Fristående, **inga npm-beroenden** (inbyggda `fetch`).

## Köra

```bash
node kundvakten/run.mjs --torr          # räkna och visa, skriv ingen fil
node kundvakten/run.mjs                 # skriv rapporten till korningar/
node kundvakten/run.mjs --rutin         # som ovan + Discord-notis
node kundvakten/run.mjs --dagar 30      # annat fönster än 90 dagar
node kundvakten/run.mjs --in data.json  # räkna på sparad data i stället för API
```

Rapporten hamnar i `kundvakten/korningar/<datum>.md`, med en `.json` bredvid
som nästa körning läser för att kunna visa trendpilar.

## Vad som krävs

| Nyckel | Vad den ger | Utan den |
|---|---|---|
| `SHOPIFY_SHOP_SE` + `SHOPIFY_TOKEN_SE` | Tvister, ordrar, ordervolym | Rutinen avbryter — det finns ingen rapport att skriva |
| `MAIL_BREVLADA_URL` + `MAIL_BREVLADA_KEY` | Supportmailen | Rapporten skrivs ändå, med en varning högst upp om att mailen saknas |
| `DISCORD_WEBHOOK_URL` | Notis vid `--rutin` | Ingen notis, rapporten skrivs ändå |

⚠️ Tokenen som låg i miljön 2026-09-09 svarade **401** på alla fem marknader.
En ny Admin API-token måste skapas i butikens custom app innan rutinen kan
köra själv. Tills dess går `--in` att använda med data hämtad via Shopify-MCP:n.

## Varför mailen går via en brevlåda

Loopia-mailen går inte att läsa med IMAP härifrån. Mätt 2026-09-09 i den
container rutinerna körs i:

- `mailcluster.loopia.se:993` → timeout
- `mailcluster.loopia.se:143` → timeout
- samma host tunnlad genom agent-proxyn → tunneln stängs efter 6 sekunder

Bara HTTPS på port 443 går ut. Därför hämtas mailen över HTTPS från
`brevlada.gs` — ett Apps Script som kör hos Google, där mailen går att läsa.
Samma mönster som `tools/drive-brevlada.gs` redan använder för Drive.

Förutsättningen är att supportmailen landar i den Gmail-brevlåda som
distribuerar scriptet. Loopia vidarebefordrar dit; originalet ligger kvar.

## Filerna

| Fil | Vad |
|---|---|
| `konfig.mjs` | Alla trösklar på ett ställe |
| `shopify.mjs` | Admin GraphQL: tvister, ordrar, ordervolym |
| `mail.mjs` | Hämtar mailen från brevlådan |
| `brevlada.gs` | Apps Scriptet — installationsinstruktion står överst i filen |
| `kategorisering.mjs` | Klassar mail i ärendetyp, letar chargeback-hotord |
| `risk.mjs` | Rate per produkt, rankning, förvarningar |
| `rapport.mjs` | Bygger markdown-rapporten och Discord-texten |
| `run.mjs` | CLI:t som knyter ihop det |

`kategorisering.mjs` och `risk.mjs` är ren logik utan nätverk. Där ligger
besluten, och där ligger testerna: `node --test kundvakten/test/*.test.mjs`.

## Reglerna som sitter i koden

**Ingen dom på för lite data.** En produkt med 8 ordrar och 1 tvist har inte
12,5 % chargeback-rate — den har för lite data och märks ⚪. Golvet är 30
ordrar och står som `min_ordrar_for_dom` i `konfig.mjs`. Samma princip som
analysmetodens 300 kr spend / 3 köp.

**Ingen enmetriksdom.** Rangordningen går på **pengar i risk**, inte på rate.
En produkt med 3 % rate på 20 ordrar är ett mindre problem än en med 1,2 % på
500. Raten avgör bara färgen.

**Trösklarna är absoluta, inte relativa.** Den sämsta produkten i listan blir
inte röd bara för att den är sämst. Gränserna är kortnätverkens egna: Visa
(VDMP) och Mastercard (ECP) sätter in butiker i övervakningsprogram runt
0,9–1,0 % av transaktionerna. Gult ligger på 0,5 % eftersom betalleverantören
reagerar tidigare.

**Blandade ordrar redovisas som osäkra.** En order med tre produkter och en
tvist säger inte vilken produkt som utlöste den. Tvisten räknas mot varje
produkt i ordern, beloppet delas mellan dem, och produkten märks ¹ i tabellen.

**Status bärs av ikon och text, aldrig av färg ensam.**

**Kundadresser maskeras** i allt som skrivs till repot: `a***@gmail.com`.

**Tyst överhoppning är förbjuden.** Går mailen inte att läsa står det högst upp
i rapporten. Noll mail och "kunde inte läsa mailen" är olika saker.
