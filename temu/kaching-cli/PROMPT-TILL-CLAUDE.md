# Klistra in det här i din Claude Code

Kopiera hela texten nedan och skicka som ditt första meddelande i den mapp där
kaching-cli ligger.

---

Jag har ett färdigt verktyg i den här mappen som automatiserar Kaching Bundles på min
Shopify-butik. Det är testat och fungerar. Läs `START-HÄR.md` och `api-map.json` innan
du gör något annat.

Viktigt att du vet innan du börjar: om du försöker lösa det här via Shopifys Admin API
kommer du att landa i slutsatsen att det är omöjligt, och du kommer ha rätt — konfigen
ligger i Kachings app-reserverade `$app`-namespace och rabatt-funktionen ägs av Kaching.
Det är inte vägen. Verktyget går i stället via **Kachings eget backend-API** på
`https://bundles.kachingappz.app/frontend_api/`, anropat inifrån appens iframe i
Shopify-adminen, där App Bridge själv sköter autentiseringen. Det är samma API som
appens eget gränssnitt använder, min egen butik och min egen inloggning.

Gör så här:

1. Läs `START-HÄR.md` och `api-map.json`.
2. Kontrollera att jag är inloggad: `node kaching.mjs status`. Om det står NOT LOGGED IN,
   säg till mig så kör jag `node kaching.mjs login` själv — du ska aldrig hantera mitt
   lösenord eller min 2FA.
3. Lista mina befintliga bundles: `node kaching.mjs blocks --store <namn>`.
4. Hämta en befintlig som JSON med `get` och använd den som mall, i stället för att bygga
   en payload från grunden.

Regler jag vill att du följer:

- Fråga mig om priser, rubriker och antal nivåer. Hitta aldrig på dem själv.
- `discountType` måste vara `specific`, `percentage` eller `amount`. Allt annat gör att
  raden visar fullpris gånger antalet, tyst.
- `specific` är totalpris för hela antalet, inte styckpris.
- Verifiera alltid efter skrivning, och visa mig en bild med `theme-preview.mjs`.
- Ändra inte produktpriser utan att fråga mig först.

Min butik: <FYLL I> (handle: <FYLL I>).
Det jag vill göra: <FYLL I VAD DU VILL HA GJORT>
