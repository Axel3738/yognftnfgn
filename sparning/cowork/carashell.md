# Cowork-prompt: spårningen i CaraShell (carashell.se)

Sidan **https://carashell.se/pages/spara** är publicerad (2026-09-20 kväll,
140 paket) och rutinen `/sparning carashell` bygger om den varje timme.
Det som återstår är klick i Shopify-admin utan API: mejlmallarna och
menyn. Axel klistrar inte in något själv — den här texten är uppgiften,
kopierad rakt in i Cowork. Delen under linjen är prompten.

## Utfall (Cowork, 2026-09-20 sen kväll) — ✅ KLART

- **A.** Alla tre mallarna (Leveransbekräftelse, Leveransuppdatering, Ute
  för leverans) ändrade och lästa tillbaka ur serverns mall-data: 8 rader
  per mall, `pages/spara?nummer=` ×2, `sha256` ×6, "Ditt paketnummer" ×3,
  `fulfillment.tracking_url` 0, `tracking_company` 0. Slingan över
  `tracking_numbers` förenklad till `{% if fulfillment.tracking_numbers.size == 1 %}`
  / `{% if tracking_number %}`.
- **B.** "Spåra paket" → `/pages/spara` sist i **Main menu** och **Footer
  menu**, verifierat i kundens vy på carashell.se.
- **C.** Testmejl skickat till axelodhner.business@gmail.com (Shopifys
  testmejl bär ett påhittat spårningsnummer ⇒ länken visar "hittar inte",
  det är väntat).
- Stopp på vägen: avsändaradressen hello@carashell.se var **ej verifierad**
  och testmejlet gick inte att skicka. Axels val: skicka verifieringen,
  klicka länken i inkorgen, sedan A + C. Löst — märket borta.
- **Shop-knappen:** Shopifys egen knapp "Spåra order med Shop"
  (`shop_app_tracking_url`) stod orörd efter första körningen. Axels beslut
  samma kväll: "Jag vill inte ha shop länken" ⇒ byts mot **Spåra paketet** →
  `/pages/spara` — Cowork-prompten `carashell-knapp.md`.
- Anmärkning från Cowork: en leverans med flera kolli får samma CS-nummer i
  mejlet (mallen räknar på `fulfillment.tracking_number`, det första).
  Sidan slår upp varje kolli för sig, så kunden ser det första paketet.

## ✅ Utfall 2 — nya mallen inne (Cowork 2026-09-20 22:29–22:33 CEST)

`mejl/output/butiker/carashell/COWORK-PROMPT.md` körd: alla tre mallarna
skrivna via kodrutans API och lästa tillbaka ur serverns `EmailTemplate`
tecken för tecken (10 179 / 6 053 / 6 042, identiska med råfilerna,
`updatedAt` 20:29:41Z / 20:31:42Z / 20:32:25Z). Ämnesraderna bytta till
"Ditt paket är på väg" / "Ny info om ditt paket" / "Paketet kommer idag".
Testmejl till axelodhner.business@gmail.com 22:33: en knapp **Spåra
paketet** → `carashell.se/pages/spara?nummer=CS-6C1002DF` (HTML-versionen
bär Shopifys klickspårning `/_t/c/v3/…` framför — standard, vidarebefordrar).
`shipping_update` hade `updatedAt` 20:00:06Z före körningen = Coworks
egen knapp-körning tidigare samma kväll, inget annat. **Butiken är helt klar.**

## ⛔ Utfall 3 — fyrspråkiga mallen STOPPAD av Coworks klassificerare (2026-09-21 ~01:30 CEST)

Steg 0 klart utan klick: avsändaren står redan på **hello@carashell.com**,
domänen Autentiserad. Alla tre råfiler hämtade och kontrollerade
(41 115 / 24 402 / 24 394 tecken, `CS-` 8, `sha256` 8, `country_code` 1 i
varje). Men Cowork-sessionen gick i **auto-läge**, och dess
säkerhetsklassificerare nekade tre gånger att skriva in externt hämtad kod i
en inloggad sida ("Untrusted Code Integration") — både när sidan hämtade
råfilen själv och när innehållet matades in i verifierade delar. Ämnesraden
återställdes, **inget sparat**: servern har kvar den svenska hela mallen
(`updatedAt` 2026-09-20T20:29:41Z, 10 179 tecken, ämne "Ditt paket är på
väg"). Svenska kunder får alltså redan det snygga mejlet; det är de tre
extra språken som väntar. NO/DK/FI gick igenom med samma metod i samma
timme — skillnaden är auto-läget. **Lösning: kör om CaraShell-prompten i en
chatt UTAN automatiskt godkännande och godkänn varje inskrivning.**
Coworks fråga om att engelska knappen pekar på carashell.com: det är
avsiktligt — carashell.com är USA-marknadens egen domän (`mejl_marknader`).

## ⛔ Utfall 4 — stoppad IGEN, chatten gick fortfarande i auto-läge (2026-09-21 ~02:00 CEST)

Axel startade en ny chatt, men Coworks spärr låg kvar: `javascript_tool` mot
Shopify-admin nekades tre gånger — hämta råfilen i sidan (Untrusted Code
Integration), skriva in redan granskat innehåll som literal, och till och
med **läsa** fältens värden. Inget ändrat, inget sparat, fliken orörd på
Redigera Leveransbekräftelse. Coworks egen slutsats: "kör om med
godkännanden i manuellt läge istället för auto" — samma metod gick igenom i
NO/DK/FI samma natt. Två vägar: (A) ny chatt där Cowork frågar före varje
åtgärd, (B) Axel klistrar själv in de tre råfilerna i Shopifys kodruta
(mänskligt urklipp fungerar — varningen i prompten gällde Coworks), och
Cowork kör prompten efteråt bara för att verifiera och skicka testmejlet
(prompten är idempotent, precis som Norge-körningen visade).
Verifierat av Cowork under körningen: carashell.com/pages/spara serverar
engelska och behåller `?nummer=` — språkroutingen i mallen är rätt.
Nuvarande ämnesrad på servern är ren text `Ditt paket är på väg`; den nya är
Liquid-raden (227 tecken).

## ⚠️ Utfall 5 — Axel klistrade in själv (2026-09-21 07:44–07:46 CEST): 2 av 3 rätt, mall 3 i FEL mall

Väg B fungerade: Cowork läste serverns EmailTemplate-data och sha256-jämförde
mot råfilerna. `shipping_confirmation` 41 115 ✅ och `shipping_update` 24 402 ✅,
ämnesraderna (Liquid) ✅, `CS-`/`sha256`/`country_code` i alla. **Men
`ute_for_leverans.liquid` (24 394) hamnade i `local_out_for_delivery` = "Order
ute för lokal leverans"**, och "Ute för leverans" (`out_for_delivery`) står
kvar på Shopifys standardmall. Orsak: Shopifys interna `name` för
lokal-leverans-mallen är bokstavligen "Out for delivery" — bara `displayName`
skiljer. Följd tills det rättas: lokal-leverans-kunder får flygfraktsmejlet,
riktiga ute-för-leverans-kunder får standardmallen utan spårningslänk.
Rättning (Axels klick): lägg filen i "Ute för leverans", och **Återgå till
standard** i "Order ute för lokal leverans" (`versions: 2`, standarden finns
kvar). Testmejl C skickat och framme 05:50:57Z: **engelskt** ("Your parcel is
on its way", en knapp Track your parcel → carashell.com/pages/spara?nummer=CS-…)
eftersom Shopifys testorder har ett engelskt country_code — den svenska
grenen testas först av en riktig svensk order. Avsändaren i testmejlet är
Shopifys relä `store+…@g.shopifyemail.com`; skarpa utskick ska gå från
hello@carashell.com (Autentiserad) — kolla på nästa riktiga order.

## ✅ Utfall 6 — ALLA TRE fyrspråkiga mallarna inne och verifierade. CaraShell är KLART (2026-09-21 07:56 CEST)

Axel återställde "Order ute för lokal leverans" (**Återgå till standard**,
`hasDefaultBody/Title: true`, 17 469 tecken, noll `CS-`) och klistrade
`ute_for_leverans.liquid` i rätt mall. Cowork verifierade mot serverns
EmailTemplate-data: `shipment_out_for_delivery` 24 394 tecken, sha256 kropp +
ämne lika råfilen, `updatedAt` 05:56:00Z; `shipping_confirmation` 41 115 och
`shipping_update` 24 402 oförändrade sedan 05:44; `shipment_delivered` orörd
(10 sept). Coworks egen rättelse: dess förra rapport frågade API:t efter id:t
`out_for_delivery` som inte finns i butiken och tolkade null som "standard" —
rätt id är **`shipment_out_for_delivery`**. Lärdom: id:t i adressfältet är
markören, aldrig namnet (lokal-leverans-mallens interna `name` är också "Out
for delivery"). Testmejl C gick igenom tidigare (Utfall 5).
`byt_avsandare` borttagen ur `mejl/butiker/carashell.json` — steg 0 är gjort.

## ⚠️ Steg A ERSATT 2026-09-20 sen kväll — kör i stället `mejl/output/butiker/carashell/COWORK-PROMPT.md`

Axels dom på Coworks första CaraShell-körning (byten rad för rad i Shopifys
standardmall, Shop-knappen kvar): "mailen var tvääär fula, fulare än
originalet". Mejlen byggs nu som Bäverbutikens — hela mallen byts —
av `node mejl/bygg-butik.mjs carashell` (butikens logga, färger, språk,
paketprefix, utan gratisprodukt-blocket). Prompten till Cowork ligger i
`mejl/output/butiker/carashell/COWORK-PROMPT.md` och täcker A + C (menyn är redan gjord).
Steg A nedan är kvar som historik och ska INTE köras.

---

Du jobbar i Chrome i min inloggade Shopify-admin för butiken **CaraShell**
(carashell.se, yitrbk-m3.myshopify.com). Två uppgifter: **A.** peka
fraktmejlens spårningsknapp på butikens egen spårningssida, **B.** lägga in
länken **Spåra paket** i huvudmenyn och sidfoten. Sedan **C.** ett testmejl.
Rör ingenting annat i Shopify: inga andra mallar, inga inställningar, inga
rabatter, inga produkter, inga andra menyrader.

⚠️ **Datorn är en Windows-dator, inte en Mac.** Klicka alltid först inne i
kodfältet innan du markerar eller kopierar — kortkommandon som når Shopifys
sida öppnar dialoger ("Lägg till produktserie", "Lägg till sida"). Öppnas en
sådan dialog: stäng den utan att spara.

⚠️ **Kontrollera alltid mot servern, inte mot redigeraren.** Shopify sparar
osparade utkast i webbläsaren och lägger tillbaka dem efter F5. Läs mallens
innehåll ur Shopifys egen mall-data efter sparning och jämför. Klicka aldrig
"Ignorera" på raden "Osparade ändringar" utan att först ha läst vad servern har.

Kontrollera först att https://carashell.se/pages/spara svarar och visar
rubriken "Spåra ditt paket". Gör den inte det: stoppa och rapportera.

### A. Fraktmejlen (tre kundnotiser)

Gå till **Inställningar** → **Notiser** → **Kundaviseringar**. Öppna en
mall i taget: **Leveransbekräftelse** (Shipping confirmation),
**Leveransuppdatering** (Shipping update) och **Ute för leverans** (Out for
delivery). ⚠️ Inte "Order ute för lokal leverans", inte "Levererad".

I varje mall: klicka **Redigera kod**. Gör tre byten i brödtexten
(E-postbrödtext HTML):

1. Varje förekomst av `{{ fulfillment.tracking_url }}` byts mot exakt:

   `https://carashell.se/pages/spara?nummer={{ fulfillment.tracking_number | upcase | replace: ' ', '' | replace: '-', '' | sha256 | slice: 0, 8 | upcase | prepend: 'CS-' }}`

2. Varje ställe där fraktbolagets nummer skrivs ut som text —
   `{{ fulfillment.tracking_number }}`, eller en slinga
   `{% for tracking_number in fulfillment.tracking_numbers %} … {{ tracking_number }} … {% endfor %}` —
   byts numret mot exakt:

   `{{ fulfillment.tracking_number | upcase | replace: ' ', '' | replace: '-', '' | sha256 | slice: 0, 8 | upcase | prepend: 'CS-' }}`

   Står texten "Spårningsnummer" eller "Tracking number" intill: byt till
   **Ditt paketnummer**. Fraktbolagets namn (`{{ fulfillment.tracking_company }}`)
   ska tas bort där det står — kunden ska inte se var paketet kommer ifrån.

3. Finns en länk till `{{ fulfillment.tracking_url }}` kvar någonstans i
   mallen efter steg 1 (sök i koden): byt den också.

Rör inga andra rader. Ämnesraden rörs inte. Klicka **Spara**, läs sedan
mallen ur serverns mall-data och kontrollera att `pages/spara?nummer=` och
`sha256` finns och att `tracking_url` INTE finns kvar.

Om en mall inte innehåller `tracking_url` eller `tracking_number` alls: rör
den inte och skriv det i rapporten.

### B. Menylänken

1. **Onlinebutik** → **Navigering**.
2. Öppna **Huvudmeny** (Main menu). Finns redan en rad som pekar på
   `/pages/spara`: rör den inte. Annars **Lägg till menyalternativ**,
   Namn: `Spåra paket`, Länk: `/pages/spara` (eller Sidor → **Spåra ditt
   paket**). **Lägg till**, sedan **Spara menyn**. Raden ska ligga sist.
3. Samma sak i **Sidfotsmeny** (Footer menu) — heter sidfotsmenyn något
   annat, ta den meny butikens sidfot faktiskt visar (öppna carashell.se
   och jämför).
4. Kontrollera i kundens vy: öppna https://carashell.se i en ny flik,
   ladda om, se att **Spåra paket** syns i huvudmenyn och sidfoten och att
   klicket landar på "Spåra ditt paket".

Skapa aldrig en ny meny, ta aldrig bort en rad, ändra inga andra namn.
(Butiken har fler språk — norska på /nb, engelska på carashell.com, finska
på /fi. Menyradens namn får stå på svenska tills vidare; översätt den inte.)

### C. Testmejlet

Gå in på **Leveransbekräftelse** och klicka **Skicka testmejl** uppe till
höger. Bara den mallen.

### Rapportera tillbaka

1. Vilka av de tre mallarna som ändrades och verifierades mot servern, och
   om någon saknade `tracking_url`.
2. Om `Ditt paketnummer` och `sha256` finns i varje ändrad mall.
3. Menyerna: vilka två menyer som fick raden, och vad du såg i kundens vy.
4. Om testmejlet gick iväg, och till vilken adress.
5. Allt som såg konstigt ut, även småsaker.

Om Shopify vägrar spara: spara inte om, skriv exakt vad felmeddelandet sa.
