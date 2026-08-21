# Klistra in det här i Claude Code PÅ DIN DATOR (i den här mappen)

---

Läs START-HÄR.md och api-map.json innan du gör något. Verktyget är granskat och
butiken är redan ifylld i stores.json (baverbutiken, handle 4snrw0-mg).

Uppgiften: skapa standardstegen för HELA katalogen ur
`payloads/baverbutiken-standardstege.json` (2 st −10 %, 3 st −15 % — siffrorna är
marginalsäkrade mot leverantörsofferten, ändra dem inte utan att fråga mig).

Steg:
1. `node kaching.mjs status` — står det NOT LOGGED IN säger du till mig, så kör
   jag `node kaching.mjs login` själv. Du hanterar aldrig lösenord eller 2FA.
2. `GET /onboarding` via verktyget: kontrollera att appEmbed.active är true —
   annars renderas ingenting i butiken.
3. `node kaching.mjs blocks --store baverbutiken` — finns det redan en deal som
   täcker alla produkter: STOPPA och visa mig den i stället för att skapa en till.
4. Hämta `GET /deal_blocks/templates` (eller en handbyggd deal med `get`) och
   VERIFIERA fältvärdet för "alla produkter"-synlighet (payloaden gissar
   "all-products") och att bar 1 med percentage 0 renderar som ordinarie pris —
   inte som "0 % rabatt". Justera payloaden om verkligheten säger annat.
5. `node kaching.mjs create --store baverbutiken --file payloads/baverbutiken-standardstege.json`
6. Verifiera med `node theme-preview.mjs baverbutiken /products/bordtennisnat-infallbart-2-rack-6-bollar <themeId> stege.png`
   och visa mig bilden innan du är klar.

Regler: ändra aldrig produktpriser. Hitta aldrig på rabattnivåer. Verifiera efter
varje skrivning. Rör inte deals du inte skapat.
