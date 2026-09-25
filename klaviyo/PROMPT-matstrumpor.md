# Prompt: Klaviyo för Matstrumpor (klistra in i en NY session)

Skriven 2026-09-25 efter att Bäverbutikens Klaviyo gick live (13 flöden, K01
schemalagd). Allt nedan under strecket är prompten.

---

Bygg samma e-postmarknadsföring i Klaviyo för **Matstrumpor** (matstrumpor.se)
som vi byggde för Bäverbutiken 2026-09-24/25. Kör klart hela vägen, men allt
laddas upp som UTKAST. Inget skickas och inget slås på utan mitt ord.

## Läs först, i den här ordningen
1. `CLAUDE.md`: avsnittet `klaviyo/` och avsnittet om Matstrumpor under "Två verksamheter".
2. `klaviyo/README.md`, `klaviyo/ARKITEKTUR.md` och `klaviyo/SISTA-STEGEN.md`. Där står hela kontraktet och alla lärdomar.
3. `docs/os/EPOST-STRATEGI.md` och `docs/copy-regler.md`.
4. `klaviyo/innehall/baverbutiken/`: flöden, kampanjer, `KALENDER-2026.md` och `BRIEFER.md`. Det är facit för formen.
5. `matstrumpor/README.md`, `matstrumpor/konfig.json`, `products/matstrumpor/`, `mejl/butiker/matstrumpor.json`, `kundtjanst/brands/matstrumpor.yaml` och `sparning/butiker.json`.

## Matstrumpor är en egen verksamhet
Blanda den aldrig med Bäverbutiken. Kontot, butiken, pixeln och kunderna är separata.

| | Matstrumpor |
|---|---|
| Butik | matstrumpor.se, Shopify `1r46tp-qx.myshopify.com` |
| Shopify-nycklar | `SHOPIFY_CLIENT_ID_1r46tp_qx` / `SHOPIFY_CLIENT_SECRET_1r46tp_qx` (fabrikens app "Fabriken"). `SHOPIFY_SHOP_1r46tp_qx` har fel domän med understreck, så använd `sparning/butiker.json` som facit. |
| Brand | orange `#dd821d`, sushi-loggan, allt ur `mejl/butiker/matstrumpor.json` |
| Spårningssida | https://matstrumpor.se/pages/spara, prefix `MS-`. Sidan tar `?k=` (base64), så länktypen `sparning:` fungerar. |
| Support | kundsupport@matstrumpor.se |
| Retur | 30 dagar från mottagandet, kunden betalar returfrakten |
| Meta | kontot "nya kungen" `730973156224390`, break-even ROAS 1,498, AOV 462,10 kr |
| Discord | Ingen server. Rapporterna landar bara i chatten. |

## Steg
0. **Kontot.** Klaviyo-nyckeln heter `KLAVIYO_API_KEY_MATSTRUMPOR`. Saknas den ska du stoppa och skriva exakt hur jag skapar den: Klaviyo → Settings → API keys → Create Private API Key → Full access. Läs sedan public ID ur sajtens HTML (`klaviyo.js?company_id=`) och kontrollera att nyckeln hör till samma konto. **Använd aldrig Bäverbutikens konto QZ4jLG.** Skriv också ut vilken plan kontot har och hur många profiler det har.
1. **Gör motorn brand-parametriserad.** Den här delen gäller `sla-pa.mjs` och `schemalagg.mjs`. De hårdkodar `brands/baverbutiken.json` och `innehall/baverbutiken/` och behöver `--brand <id>`. Standard förblir baverbutiken, så Bäverbutikens kommandon beter sig exakt som förut.

   Kontrollera `produkter.mjs` och `brand.shopify.modul`. `mejl/shopify.mjs` är Bäverbutikens klient, så Matstrumpor behöver en modul som läser `1r46tp-qx` med nycklarna ovan. Återanvänd `sparning/butik.mjs` om det går.

   `npm test` ska vara grönt före och efter. Skriv tester för `--brand`.
2. **Brandfil `klaviyo/brands/matstrumpor.json`**, med samma fält som Bäverbutikens. Värdena ska mätas, inte kopieras:
   - `leverans_p90_dygn` ur `sparning/butiker/matstrumpor/lage.json`, med förklaring av hur det räknades
   - kalenderdatumen härledda ur det
   - `metrik_val` om Viewed Product finns två gånger
   - avsändaren
3. **Kontoläge.** Kör `node klaviyo/kolla.mjs --brand matstrumpor`. Ta fram listor, metriker, samtycke, hur många profiler som är `subscribed`, och om Shopify-integrationen skickar Placed Order och Fulfilled Order. Saknas något ska det skrivas ut med orsak, aldrig som noll.
4. **Produktdata.** Hämta de mest sålda produkterna 60 dagar bakåt ur Shopify och räkna återköpen, på samma sätt som `klaviyo/evolve/ATERKOP-ANALYS.md`. Sockor återköps troligen oftare än Bäverbutikens produkter, men mät det och skriv inte in en gissning. Skriv `klaviyo/evolve/ATERKOP-ANALYS-matstrumpor.md`.
5. **Innehåll i `klaviyo/innehall/matstrumpor/`:**
   - Flödena F01–F07 i samma struktur: välkomst, övergiven varukorg, webbhistorik, efterköp (triggas av Fulfilled Order och har `sparning:`-knapp), vinna tillbaka, sunset och återköp.
   - Återköpsflödet och eventuella tipsflöden per produkt ska bygga på mätningen i steg 4.
   - Kampanjer för resten av året: en i veckan på tisdagar kl 18:00, plus fars dag, Black Week och jul. Kontrollera att volymen ryms i planen.
   - Rabatt i Black Week är mitt beslut, så fråga mig med alternativ.
   - Förhandsvisning som artifact, på samma sätt som Bäverbutikens mejlsida.
6. **Copy.** All slutgiltig copy skrivs av en subagent med `model: "sonnet"`, som får `docs/copy-regler.md`, DNA:t och formatkraven. Varje rad ska klara tre-frågorstestet.
   - Inga tankstreck (— eller –).
   - **Leveranstiden står aldrig i ett mejl.**
   - Inga påhittade fakta.
   - Pris bara live ur butiken.
   - Butikens namn får stå i avsändare och sidfot. Det är mejl från butiken, inte annonser.
7. **Ladda upp som utkast.** Kör `node klaviyo/bygg.mjs --brand matstrumpor`, sedan `ladda-upp.mjs --brand matstrumpor` torrt, och sedan skarpt. Läs tillbaka resultatet ur kontot.
8. **Cowork-prompt för det API:t inte kan göra.** Lägg den i `klaviyo/SISTA-STEGEN.md` under en Matstrumpor-rubrik:
   - postadressen (Settings → Account → Contact information, renderat mejl som kontroll)
   - attributionen: bara klick, 5 dagar, utan Apples öppningar
   - avsändardomänen, och vem som har DNS för matstrumpor.se (ta reda på det med DNS-uppslag)
   - DMARC
9. **Dokumentera** i `klaviyo/README.md`, `CLAUDE.md` (Klaviyo-avsnittet) och `matstrumpor/README.md`. Committa, pusha, öppna en PR och merga till `main`.

## Järnregler från Bäverbutiken (gäller oförändrat)
- Kampanjer går bara till `subscription: "subscribed"`. Köparflöden (Placed/Fulfilled Order) har filternyckeln `kundundantag` (MFL 19 § andra stycket).
- Klienten vägrar send-jobs och live-status. `sla-pa.mjs` och `schemalagg.mjs` används **bara på mitt ord**, med `--ja`.
- Inga schemalagda rutiner för Klaviyo förrän jag säger till.
- Inget får skickas innan kontot har en postadress (MFL 20 §).
- OpenSend och anonyma mejl är förbjudna.

## Lärdomar som kostade tid (upprepa dem inte)
- Ändrad text kräver att `version` höjs i mejlet. Mallen heter `TPL_<id>_v<version>` och återanvänds annars.
- Flödesmallar är **kopior**. PATCH på flödesdefinitionen ger 400, och PATCH på flödets mall ger 404. Vid ändring: ny version, radera flödesutkastet och skapa det igen.
- flow-actions kräver hela `definition` för att byta status. PATCH på `/api/accounts` går inte.
- Bara Fulfilled Order bär spårningsnumret (`event.extra.fulfillments.0.tracking_number`). Klaviyo saknar sha256, så använd `base64_encode|urlencode` → `?k=`.
- Placed Order-fältet heter `Items`, och Ordered Product-fältet heter `Name`.
- Viewed Product kan finnas två gånger. Välj den som faktiskt får händelser och skriv valet i `metrik_val`.
- Klaviyo bearbetar max 5 segment åt gången.
- template-render fyller inte i organisationens adress, så kontrollera adressen i ett riktigt testmejl.
- Topplistan i välkomstmejlet ska komma ur försäljningsdata, aldrig ur en produkt du tycker om.

Avsluta med en checklista punkt för punkt (✅/❌). Mina egna klick står sist,
numrerade.
