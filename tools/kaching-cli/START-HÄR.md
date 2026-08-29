# Kaching Bundles via CLI — startguide

Det här verktyget skapar och ändrar Kaching Bundles programmatiskt, utan att någon
klickar i appens admin. Det är skarpt testat och fungerar.

## Varför din Claude sa att det var omöjligt

Analysen den gjorde var **helt korrekt** — men den undersökte bara en av två vägar.

Det den kom fram till, och som stämmer:

- Konfigurationen ligger i Kachings app-reserverade `$app`-namespace. Ingen annan app
  kan skriva där. **Sant.**
- Rabatten skapas av en Shopify Function som ägs av Kaching. `discountAutomaticAppCreate`
  kräver ett functionId man själv äger. **Sant.**

Slutsatsen "alltså går det inte" gäller bara om man försöker gå via **Shopifys** API.
Men det finns en andra väg: **Kachings egen app har ett eget backend-API**, och det går
att prata med. Din Claude var själv inne på det i sista stycket ("om Kaching har ett
privat backend-API bakom sin app-session") men stannade där.

## Så fungerar lösningen i stället

Kaching-appen i Shopify-adminen är en iframe som laddas från `bundles.kachingappz.app`.
Den pratar med sitt eget REST-API på `https://bundles.kachingappz.app/frontend_api/`.

Auth sköter sig själv: Shopifys App Bridge stoppar automatiskt in en färsk session-token
i varje `fetch()` som körs **inne i den iframen**. Så om man kör sin kod därifrån behöver
man aldrig hantera tokens alls.

Verktyget gör exakt det: startar en riktig Chrome via Playwright, öppnar Kaching-appen i
Shopify-adminen, och kör anropen inifrån appens iframe.

Man går alltså **inte** runt någon spärr. Man använder samma API som appens eget
gränssnitt använder, med samma inloggning, på sin egen butik.

## Uppsättning (engångs, cirka 5 minuter)

1. Installera Node.js 20 eller nyare: https://nodejs.org
2. Öppna en terminal i den här mappen och kör:

   npm install

3. Fyll i din butik i `stores.json`. `handle` är det som står i admin-URL:en:
   `https://admin.shopify.com/store/DET-HÄR/...` — det är oftast inte domännamnet.
4. Logga in en gång:

   node kaching.mjs login

   Ett Chrome-fönster öppnas. Logga in i Shopify-adminen som vanligt, med 2FA om det
   frågas. Fönstret stänger sig självt när det är klart. Sessionen sparas lokalt i
   mappen `profile/` och håller i veckor.

   Ingen annan än du rör den inloggningen. Claude skriver aldrig in ditt lösenord.
5. Kontrollera:

   node kaching.mjs status
   node kaching.mjs blocks --store <ditt-namn>

   Nu ska dina befintliga bundles listas.

## Vanligaste kommandona

    node kaching.mjs blocks --store <namn>                       lista alla bundles
    node kaching.mjs get    --store <namn> --id <uuid>           hela objektet som JSON
    node kaching.mjs create --store <namn> --file payloads/x.json  skapa (publicerar direkt)
    node kaching.mjs update --store <namn> --id <uuid> --file x.json
    node kaching.mjs delete --store <namn> --id <uuid>

Arbetssättet som fungerar bäst: bygg först en bundle för hand i Kaching så den ser ut
som du vill, kör sedan `get` för att hämta ut den som JSON, och använd den filen som mall
för alla kommande. Då slipper du gissa fält.

`payloads/exempel-tresteg.json` är en riktig, fungerande trestegsbundle att utgå från.

## Verifiera resultatet

    node preview.mjs <namn> <uuid> bild.png

visar Kachings egen förhandsvisning, och

    node theme-preview.mjs <namn> /products/<handle> <themeId> bild.png

renderar den **riktiga** produktsidan — funkar även om butiken är lösenordsskyddad,
eftersom den går via temaredigerarens förhandsvisning med din vanliga inloggning.

## Att känna till

- **`api-map.json` är den viktigaste filen.** Där ligger alla endpoints och alla fällor.
  Läs den, och låt din Claude läsa den.
- Det finns **ingen POST-route**. Appen genererar själv ett UUID i webbläsaren och gör
  `PUT /deal_blocks/<uuid>`, vilket både skapar och publicerar. Det var den detaljen som
  var svårast att hitta.
- **`spacing` är en multiplikator, inte pixlar.** 1 är tajt och snyggt, 8 blir enormt.
- **`discountType` måste vara `specific`, `percentage` eller `amount`.** Allt annat, till
  exempel `default`, gör att raden visar fullpris gånger antalet och att `discountValue`
  ignoreras helt tyst. Det har orsakat riktiga prisfel i skarpa butiker.
- `specific` betyder **totalpris för hela antalet**, inte styckpris.
- Det överstrukna priset kommer från produktens `compare_at_price` gånger antalet. Vill du
  att det ska se ut på ett visst sätt måste produktens jämförpris stämma.
- **`automaticDiscountNodes` är alltid tom**, även när allt fungerar. Kaching kör cart
  transform, inte rabattnoder. Använd den inte som kontroll.
- Shop-metafältet går inte att läsa via Admin API från ett annat appkonto (ger `null`) —
  precis som din Claude såg. Men det går att läsa via **Storefront API** med butikens egen
  publika token, som står i klartext i `kaching-bundles-config` på varje produktsida.
- API:t är odokumenterat. Kaching kan ändra det utan förvarning. Verifiera därför alltid
  efter varje skrivning — `create` gör det automatiskt och jämför mot det du skickade.
- Håll anropsvolymen mänsklig. Det här är din egen butik och din egen betalda app, men
  spamma inte deras backend.

## Svar på frågan din Claude lämnade öppen

`manual-deal-block-id` i temablocket accepterar **antingen** UUID:t **eller** nanoId:t.
Widgetens kod matchar på båda: `dealBlocks.findIndex(e => e.id === W || e.nanoId === W)`.
Så du kan använda vilket som av dem.
