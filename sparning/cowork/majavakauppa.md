# Cowork-prompt: spårningen i Majavakauppa (majavakauppa.fi)

⚠️ **Två steg, i ordning, med en paus emellan.** Mätt 2026-09-20: appen
"FI claudeprodukter" har 6 rättigheter och saknar `read_orders`,
`write_fulfillments`, `write_content`. Steg 0 lägger till dem. När det är
gjort kör sessionen `/sparning majavakauppa`, som publicerar sidan
**https://majavakauppa.fi/pages/seuranta**. FÖRST DÅ görs steg A–C.
Delen under linjen är prompten; kör den i två omgångar.

⚠️ Butikens supportadress är okänd i repot (2026-09-20). Rutinen läser den
ur Shopifys "Butikens kontaktmejl" (Inställningar → Butiksuppgifter). Be
Cowork rapportera vilken adress som står där i steg 0.

## Läge 2026-09-20 kväll — steg 0 KLART, sidan LIVE, kör A–C

Cowork körde steg 0 (appversion `…-4` med de fyra rättigheterna, "Uppdatera
dataåtkomst" godkänd i admin). Sessionen körde `/sparning majavakauppa` och sidan
**https://majavakauppa.fi/pages/seuranta** svarar med rubriken "Seuraa pakettiasi". Timrutinen är byggd.
Det som återstår är steg A–C nedan — hoppa över steg 0.

## Utfall 2026-09-20 sen kväll (Cowork körde den GAMLA A–C-prompten)

- **A STOPPAD:** Shopify visar bannern "Innan du kan redigera aviseringar
  måste du granska och verifiera din avsändares e-postadress" — fälten
  utgråade på alla tre mallarna. Cowork rörde inget (kontoinställning
  utanför uppdraget). Mallarna är Shopifys engelska standard. Steget
  "Skicka verifiering" står nu i `mejl/output/butiker/majavakauppa/COWORK-PROMPT.md`;
  länken landar i asiakastuki@majavakauppa.fi och är Axels klick.
- **B** klar: "Seuraa pakettia" sist i **Main menu** och **Footer menu**
  (`footer`), sett i kundens vy (header SEURAA PAKETTIA, sidfot, klick
  landar på "Seuraa pakettiasi"). `meny_klar: true` i
  `mejl/butiker/majavakauppa.json`. En felklickad etikett på "Ota yhteyttä"
  återställdes med "Ignorera" efter att serverns meny lästs (orörd).
- **C** inte skickat (mallen orörd).
- Shopifys lista pekade "Leveransbekräftelse" på "Faktura för orderutkast";
  rätt väg är URL:en `email_templates/shipping_confirmation/edit`.

## ✅ Utfall 2026-09-21 ~01:30 CEST — tre mallar + testmejl KLARA (Cowork, nya prompten)

Domänen Autentiserad, ingen banner. Tre mallar via CodeMirror-API:t
(`window.__cmView`-vägen), sparade och lästa tillbaka från servern:
`shipping_confirmation` 10 601 / `shipping_update` 6 235 /
`shipment_out_for_delivery` 6 243 tecken, exakt matchning, `BB-` + `sha256`
i alla, ämnen `Pakettisi on matkalla` / `Uutta tietoa paketistasi` /
`Paketti saapuu tänään`. Testmejl framme: en knapp **Seuraa pakettia** →
`https://majavakauppa.fi/pages/seuranta?nummer=BB-6C1002DF`. Menyn var
redan klar.

⚠️ **Avsändaradressen är `asiakaspalvelu@majavakauppa.fi`** enligt den här
körningen — inte `asiakastuki@` som den tidigare Cowork-körningen läste och
som står i `sparning/butiker.json` + mallarnas sidfot. **Axels svar 2026-09-21: B = asiakaspalvelu@.** Registret och
mallarnas sidfot ombyggda med den adressen; Cowork kör prompten en gång till
(mallarna är idempotenta, samma metod).

## ✅ Utfall 2026-09-21 07:31–07:44 CEST — asiakaspalvelu@-mallarna inne, testmejl OK. Finland är KLART.

Cowork körde prompten igen efter adressbytet: tre mallar via kodrutans API,
verifierade mot serverns mall-data — 10 607 / 6 241 / 6 249 tecken,
identiska med råfilerna, ämnesraderna redan rätt, `BB-` + `sha256` i alla.
Testmejl framme 07:44: en knapp **Seuraa pakettia** →
`https://majavakauppa.fi/pages/seuranta?nummer=BB-6C1002DF`, sidfoten
`asiakaspalvelu@majavakauppa.fi`. Ett testmejl, inte tre (två felklick i
Skicka-dialogen gav inget utskick, kontrollerat i inkorgen).

## ⚠️ Steg A ERSATT 2026-09-20 sen kväll — kör i stället `mejl/output/butiker/majavakauppa/COWORK-PROMPT.md`

Axels dom på Coworks första CaraShell-körning (byten rad för rad i Shopifys
standardmall, Shop-knappen kvar): "mailen var tvääär fula, fulare än
originalet". Mejlen byggs nu som Bäverbutikens — hela mallen byts —
av `node mejl/bygg-butik.mjs majavakauppa` (butikens logga, färger, språk,
paketprefix, utan gratisprodukt-blocket). Prompten till Cowork ligger i
`mejl/output/butiker/majavakauppa/COWORK-PROMPT.md` och täcker A + C + menylänken B.
Steg A nedan är kvar som historik och ska INTE köras.

---

Du jobbar i Chrome i mitt inloggade Shopify-konto för butiken
**Majavakauppa** (majavakauppa.fi, q0uthu-xq.myshopify.com). Rör ingenting
annat i Shopify än det som står här.

⚠️ **Datorn är en Windows-dator, inte en Mac.** ⚠️ **Kontrollera alltid
mot servern, inte mot redigeraren.** Klicka aldrig "Ignorera" på "Osparade
ändringar" utan att först ha läst vad servern har.

### Steg 0 — appens rättigheter (görs FÖRST, en gång)

1. Öppna **https://dev.shopify.com** med samma inloggning. Hitta appen
   **"FI claudeprodukter"** (installerad i Majavakauppa).
2. **Configuration** / **Access scopes**: lägg till `read_orders`,
   `read_fulfillments`, `write_fulfillments`, `write_content`. Ta inte bort
   någon som finns. **Spara**.
3. **API access** → **Protected customer data access** → **Request access**,
   nivån "Protected customer data" (inga extra fält). Syfte: "Order
   fulfillment tracking — writes carrier scan events to orders and builds the
   store's tracking page." Spara.
4. Majavakauppas admin → **Inställningar** → **Appar och
   försäljningskanaler** → appen → godkänn de nya rättigheterna om Shopify
   frågar; annars installera om appen från Dev Dashboard (**Install app**).
5. Läs också **Inställningar** → **Butiksuppgifter** → kontaktmejlen för
   kunder, och skriv den i rapporten.
6. Rapportera: rättigheterna appen nu listar, Protected customer
   data-status, och kontaktmejlen.

**STOPPA HÄR** och rapportera. Steg A–C görs först när sidan
https://majavakauppa.fi/pages/seuranta svarar och visar rubriken
"Seuraa pakettiasi" — är det 404, rapportera och gör inget mer.

### A. Fraktmejlen (tre kundnotiser)

**Inställningar** → **Notiser** → **Kundaviseringar**: **Leveransbekräftelse
/ Toimitusvahvistus** (Shipping confirmation), **Leveransuppdatering**
(Shipping update), **Ute för leverans** (Out for delivery). Inte "lokal
leverans", inte "Levererad".

I varje mall, **Redigera kod**, brödtexten (HTML):

1. Varje `{{ fulfillment.tracking_url }}` byts mot exakt:

   `https://majavakauppa.fi/pages/seuranta?nummer={{ fulfillment.tracking_number | upcase | replace: ' ', '' | replace: '-', '' | sha256 | slice: 0, 8 | upcase | prepend: 'BB-' }}`

2. Varje ställe där fraktbolagets nummer skrivs ut
   (`{{ fulfillment.tracking_number }}` eller slingan över
   `fulfillment.tracking_numbers`) byts numret mot exakt:

   `{{ fulfillment.tracking_number | upcase | replace: ' ', '' | replace: '-', '' | sha256 | slice: 0, 8 | upcase | prepend: 'BB-' }}`

   Etiketten intill byts till **Pakettinumerosi**. Fraktbolagets namn
   (`{{ fulfillment.tracking_company }}`) tas bort där det står.
3. Knappens text, om den säger "Seuraa lähetystä"/"Track your shipment":
   byt till **Seuraa pakettia**.

Rör inga andra rader, inte ämnesraden. **Spara**, läs sedan mallen ur
serverns mall-data: `pages/seuranta?nummer=` och `sha256` ska finnas,
`tracking_url` INTE.

### B. Menylänken

**Onlinebutik** → **Navigering** → **Huvudmeny**: **Lägg till
menyalternativ**, Namn: `Seuraa pakettia`, Länk: `/pages/seuranta`, **Lägg
till**, **Spara menyn**, sist. Samma i **Sidfotsmeny** (den meny sidfoten
på majavakauppa.fi faktiskt visar). Kontrollera i kundens vy att **Seuraa
pakettia** syns och landar på "Seuraa pakettiasi". Skapa aldrig en ny meny,
ta aldrig bort en rad.

### C. Testmejlet

**Leveransbekräftelse** → **Skicka testmejl**. Bara den.

### Rapportera tillbaka

1. Steg 0: rättigheter, Protected customer data-status, kontaktmejlen.
2. Vilka mallar som ändrades och verifierades mot servern.
3. Menyerna, och vad du såg i kundens vy.
4. Testmejlet: gick det, till vilken adress.
5. Allt som såg konstigt ut.
