# Kaching Bundles via CLI

Kaching-bundles går att skapa och ändra programmatiskt. Verktyget ligger i
`tools/kaching-cli/` och är skarpt testat av Axel. Läs `tools/kaching-cli/START-HÄR.md`
och `tools/kaching-cli/api-map.json` innan du rör något.

## Varför tidigare sessioner sa att det var omöjligt

De undersökte bara Shopifys API, och hade rätt så långt: konfigen ligger i Kachings
app-reserverade `$app`-namespace och rabatten skapas av en Shopify Function som Kaching
äger. **Ingen annan app kan skriva där.**

Vägen som fungerar är en annan: Kaching-appen i Shopify-adminen är en iframe från
`bundles.kachingappz.app`, och den pratar med sitt eget REST-API på
`https://bundles.kachingappz.app/frontend_api/`. Körs anropen inifrån den iframen stoppar
Shopifys App Bridge själv in en färsk session-token i varje `fetch()`. Verktyget startar
en riktig Chrome via Playwright, öppnar appen i adminen och kör anropen därifrån.
Samma API som appens eget gränssnitt, samma inloggning, egen butik.

## Var det går att köra

**Bara på Axels egen dator.** Två oberoende skäl, båda verifierade 2026-08-28:

1. Playwright-Chromium når inte ut i den här molnsandlådan alls
   (`ERR_CONNECTION_RESET` mot varje adress, även `example.com`) — inte specifikt
   för Shopify, browsern har ingen nätverksväg.
2. `node kaching.mjs login` kräver en synlig webbläsare där en människa loggar in med
   2FA. Sessionen sparas i `profile/`, som enligt verktygets egen `DELA-INTE.txt`
   aldrig får delas vidare — den innehåller en levande Shopify-adminsession.

`bundles.kachingappz.app` och `admin.shopify.com` är däremot **inte** blockerade av
nätverkspolicyn (`admin.shopify.com` ger 403 mot `curl` för att Cloudflare stoppar
bottrafik, inte för att egress-policyn nekar — proxyns `recentRelayFailures` är tom).

**Arbetsdelningen blir därför:** Claude bygger och granskar payloaderna här,
Axel kör `create`/`update` på sin dator.

## Fällor som kostar riktiga pengar

Ingen av dem ger felmeddelande. De går igenom tyst och visar fel pris för kunden.

| Fälla | Konsekvens |
|---|---|
| `discountType` är något annat än `specific`, `percentage` eller `amount` | Raden visar **fullpris × antal** och `discountValue` ignoreras helt tyst |
| `specific` tolkas som styckpris | `specific` är **totalpris för hela antalet**. Styckpris där gör bundlen absurt billig |
| `preselectedDealBarId` matchar ingen rad | Ingen rad blir förvald i widgeten |
| `spacing` behandlas som pixlar | Det är en **multiplikator**. 1 är tajt och snyggt, 8 blir enormt |
| Fel `compare_at_price` i Shopify | Det överstrukna priset är produktens jämförpris × antalet — blir fel utan att bundlen är fel |
| `automaticDiscountNodes` används som kontroll | Den är **alltid tom**, även när allt fungerar. Kaching kör cart transform |
| App-embed av i temat | Ingenting renderas. Kolla `GET /onboarding` → `appEmbed.active` |

## Kör alltid validatorn först

```bash
node tools/kaching-cli/validate-payload.mjs <payload.json>
```

Kräver ingen inloggning och rör inget nätverk. Den fångar alla fällor i tabellen ovan
plus kvarglömda platshållare och ogiltiga produkt-GID:n. Exit-kod 1 = skriv inte
payloaden till en skarp butik.

## Arbetsgången som fungerar

1. Bygg **en** bundle för hand i Kaching tills den ser ut som den ska.
2. `node kaching.mjs get --store <namn> --id <uuid>` → hämta ut den som JSON.
3. Använd den filen som mall för alla kommande, i stället för att gissa fält.
4. Validera → `create` (som gör read-back och rapporterar avvikelser automatiskt).
5. Verifiera visuellt med `theme-preview.mjs`.

## Regler

- **Fråga alltid Axel om priser, rubriker och antal nivåer.** Hitta aldrig på dem.
- Ändra aldrig produktpriser i Shopify utan att fråga först.
- API:t är odokumenterat och kan ändras utan förvarning — verifiera efter varje skrivning.
- Två verksamheter i repot: kontrollera vilken butik `--store` pekar på innan du kör.
