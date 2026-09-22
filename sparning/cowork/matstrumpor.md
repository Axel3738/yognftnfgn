# Cowork-prompt: spårningen i Matstrumpor (matstrumpor.se)

Uppdraget stod i `sparning/PROMPT-matstrumpor.md` (Axels beställning
2026-09-21). Butiken är den sjätte som får spårningssystemet.

## Inget steg 0 behövdes

Prompten räknade med att Axel skulle behöva skapa en Shopify-app och lägga
in nycklar. **Det behövdes inte** — mätt 2026-09-21: nycklarna
`SHOPIFY_CLIENT_ID_1r46tp_qx` + `SHOPIFY_CLIENT_SECRET_1r46tp_qx` låg redan
i Environments och hör till fabrikens app **"Fabriken"**, installerad i
matstrumpor.se med **154 rättigheter** — alla fyra som krävs
(`read_orders`, `read_fulfillments`, `write_fulfillments`, `write_content`).

Butikens myshopify-domän lästes ur startsidans eget skript
(`Shopify.shop = "1r46tp-qx.myshopify.com"`) och bekräftades av
`shop.primaryDomain`. ⚠️ `SHOPIFY_SHOP_1r46tp_qx` i Environments bär
`1r46tp_qx.myshopify.com` med **understreck** — fel domän, används inte;
registret är facit.

## Utfall 2026-09-21 — sidan live

`node sparning/kor.mjs --butik matstrumpor` (skarpt, 09:36 UTC):

- 59 ordrar på 14 dagar, 59 paket, **59 registrerade hos 17TRACK**
- **48 paket med skanningar, 640 händelser, 48 event skrivna i Shopify, 0 fel**
- **https://matstrumpor.se/pages/spara** skapad
  (`gid://shopify/Page/183508730195`), 73 kB
- Kontrollen grön (inga motsägelser mot fraktbolagets data), **0 okända
  fraser** — ordboken täckte hela butikens språkbruk direkt
- Trippelkollen grön: API, publik vy, och `YT2626400706538651` hittades i
  kundens data
- Sedd i Chromium på 390 och 1280 px, både tom sökruta och träff
  (`?nummer=MS-C56BAD8B`, levererat i Åhus): hela kedjan på svenska, orange
  knapp, ingen vågrät scroll, inga fel från sidans egen kod. Ingen upsell
  (`erbjudande: false` — lyckohjulet är bara Bäverbutikens).

Brandet är avläst live ur butikens tema: knapp/länk **#dd821d** (orange),
text **#121212**, loggan är temats egen fil (orange bokstäver runt en sushi,
transparent botten ⇒ vitt sidhuvud). Temats rubrikfont *Mochiy Pop P One*
finns inte i mejlklienter — mejlen använder närmaste rundade systemfont.

Supportadressen **kundsupport@matstrumpor.se** lästes ur Shopifys
`shop.contactEmail` och står också i butikens egen sidfot.

Timrutin: **`trig_01LSdjZgepsWf761ocrFWAAo`** på `56 * * * *`, fast session
**`session_017E57dcmd1Lf7PpJTBsoAUE`** (repot som källa, `main` som utgren),
taggar `routine:sparning` + `butik:matstrumpor`, inga connectors. Byggd
2026-09-21 11:41 CEST på `claude5@stonebite.org` EFTER att koden låg på
`main` (`04088e8`), sedd i `list_triggers` samma körning, första körning
11:56 CEST.

## Mejl + meny

`mejl/output/butiker/matstrumpor/COWORK-PROMPT.md` (A + B + C), byggd av
`node mejl/bygg-butik.mjs matstrumpor`:
fraktbekräftelse **10 305** tecken, fraktuppdatering **6 153**,
ute för leverans **6 142**. Axel kopierar råfilen `PROMPT.txt` från GitHub
och klistrar in i en ny Cowork-chatt.

⚠️ Fallgropar från de fem tidigare butikerna, redan inskrivna i prompten:
mallens id i adressfältet är markören (`shipment_out_for_delivery` är rätt,
`local_out_for_delivery` fel), avsändaren måste vara verifierad på butikens
egen domän, och Coworks klassificerare har två gånger stoppat
skript-inskrivning i auto-läge — händer det får Axel klistra in de tre
`.liquid`-filerna själv och låta Cowork bara verifiera mot servern.

## Utfall mejl + meny

**Klart 2026-09-22. Cowork behövde inte ändra någonting — allt var redan på
plats sedan 2026-09-21 17:57–18:01 UTC.** Körningen blev alltså en
verifiering, inte en inskrivning; det enda som skickades var testmejlet.

| Mall | Ämnesrad på servern | Tecken | Identisk med råfilen | `updatedAt` |
|---|---|---|---|---|
| `shipping_confirmation` | Ditt paket är på väg | 10 305 | ja | 2026-09-21 17:57 UTC |
| `shipping_update` | Ny info om ditt paket | 6 153 | ja | 2026-09-21 18:00 UTC |
| `shipment_out_for_delivery` | Paketet kommer idag | 6 142 | ja | 2026-09-21 18:01 UTC |

Jämförelsen gjordes mot serverns mall-data (GraphQL `EmailTemplate`), inte mot
redigerarens vy, och alla tre bär `MS-` + `sha256` — alltså bävernumret räknat
i Liquid. Grannmallarna är orörda (`local_out_for_delivery` och
`shipment_delivered` har båda `updatedAt: null`).

**Menyn:** raden `Spåra paket → /pages/spara` låg redan i BÅDA menyerna
(`main-menu` och `footer`), sist i listan. Verifierat oberoende av sessionen
samma dag: `curl` mot matstrumpor.se ger 4 träffar på "Spåra paket" och 4 på
`/pages/spara` (temat visar båda menyerna i sidfoten, under Snabblänkar och
Information).

**Testmejlet:** skickat från Leveransbekräftelse, framme. En knapp, **Spåra
paketet**, destination
`https://matstrumpor.se/pages/spara?nummer=MS-6C1002DF`. `href` går via
Shopifys klickspårning (`/_t/c/v3/…`) som vidarebefordrar dit — Shopifys egen
omskrivning, inget i mallen. Avsändaren `kundsupport@matstrumpor.se` är
"Autentiserad", ingen gul banner, inget verifieringssteg.

⚠️ **Lärdom: repots flagga sa fel i ett dygn.** `meny_klar` stod `false` och
avsnittet här stod tomt medan Shopify hade allt på plats — en session (eller
en tidigare Cowork-körning) gjorde jobbet utan att skriva tillbaka. Det är
repots egen regel igen: **det som inte står i en fil har inte hänt, och det
som står i en fil har inte nödvändigtvis hänt.** Kolla servern innan du ber
Axel om ett klick.

⚠️ **Observation, inte ett fel:** testmejlets produktlista ("I paketet") visar
OrtoFlex Pro, Sömnplåster, Skrubbmattan, FotRullen, Mammaband och FixToes —
inga strumpor. Det är Shopifys testdata som plockar produkter ur butiken, så
mallen är oskyldig, men butiken bär uppenbart fler produkter än sushistrumpan.
Värt att veta innan nästa annonsrond antar att Matstrumpor är en
enproduktsbutik.
