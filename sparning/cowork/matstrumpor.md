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

_(fylls i när Coworks rapport kommer: teckenantal mot servern, menyn i
header + sidfot, testmejlet, avvikelser — sedan `meny_klar: true` i
`mejl/butiker/matstrumpor.json` och prompten byggs om)_
