# Cowork-prompt: spårningen i Bæverbutiken (baeverbutiken.dk)

⚠️ **Två steg, i ordning, med en paus emellan.** Mätt 2026-09-20: nycklarna
`SHOPIFY_CLIENT_ID_DK` + `SHOPIFY_CLIENT_SECRET_DK` i Environments hör till
en app som **inte är installerad** i den danska butiken (Shopify svarar
"app_not_installed"). Steg 0 installerar appen med rätt rättigheter. När det
är gjort kör sessionen `/sparning baeverbutiken`, som publicerar sidan
**https://baeverbutiken.dk/pages/spor**. FÖRST DÅ görs steg A–C.
Delen under linjen är prompten; kör den i två omgångar.

---

Du jobbar i Chrome i mitt inloggade Shopify-konto för butiken
**Bæverbutiken** (baeverbutiken.dk, v0xqtk-tx.myshopify.com). Rör ingenting
annat i Shopify än det som står här.

⚠️ **Datorn är en Mac. Använd Cmd, aldrig Ctrl.** ⚠️ **Kontrollera alltid
mot servern, inte mot redigeraren.** Klicka aldrig "Ignorera" på "Osparade
ändringar" utan att först ha läst vad servern har.

### Steg 0 — installera appen med rätt rättigheter (görs FÖRST, en gång)

1. Öppna **https://dev.shopify.com** med samma inloggning. Leta upp appen
   vars **Client ID** är samma som `SHOPIFY_CLIENT_ID_DK` i Environments
   (be Axel läsa upp de första tecknen om det finns flera appar). Troligen
   en app med "DK" eller "claudeprodukter" i namnet.
2. Appens **Configuration** / **Access scopes**: se till att dessa finns:
   `read_products`, `write_products`, `read_orders`, `read_fulfillments`,
   `write_fulfillments`, `write_content`. **Spara**.
3. **API access** → **Protected customer data access** → **Request access**,
   nivån "Protected customer data" (inga extra fält). Syfte: "Order
   fulfillment tracking — writes carrier scan events to orders and builds the
   store's tracking page." Spara.
4. **Install app** → välj butiken **Bæverbutiken (baeverbutiken.dk)** →
   godkänn. Öppna sedan butikens admin → **Inställningar** → **Appar och
   försäljningskanaler** och bekräfta att appen står som installerad.
5. Rapportera: appens namn, vilka rättigheter den listar, och om den står
   som installerad i baeverbutiken.dk.

**STOPPA HÄR** och rapportera. Steg A–C görs först när sidan
https://baeverbutiken.dk/pages/spor svarar och visar rubriken
"Spor din pakke" — är det 404, rapportera och gör inget mer.

### A. Fraktmejlen (tre kundnotiser)

**Inställningar** → **Notiser** → **Kundaviseringar**: **Leveransbekräftelse
/ Forsendelsesbekræftelse** (Shipping confirmation), **Leveransuppdatering**
(Shipping update), **Ute för leverans** (Out for delivery). Inte "lokal
leverans", inte "Levererad".

I varje mall, **Redigera kod**, brödtexten (HTML):

1. Varje `{{ fulfillment.tracking_url }}` byts mot exakt:

   `https://baeverbutiken.dk/pages/spor?nummer={{ fulfillment.tracking_number | upcase | replace: ' ', '' | replace: '-', '' | sha256 | slice: 0, 8 | upcase | prepend: 'BB-' }}`

2. Varje ställe där fraktbolagets nummer skrivs ut
   (`{{ fulfillment.tracking_number }}` eller slingan över
   `fulfillment.tracking_numbers`) byts numret mot exakt:

   `{{ fulfillment.tracking_number | upcase | replace: ' ', '' | replace: '-', '' | sha256 | slice: 0, 8 | upcase | prepend: 'BB-' }}`

   Etiketten intill byts till **Dit pakkenummer**. Fraktbolagets namn
   (`{{ fulfillment.tracking_company }}`) tas bort där det står.
3. Knappens text, om den säger "Spor forsendelse"/"Track your shipment":
   byt till **Spor pakken**.

Rör inga andra rader, inte ämnesraden. **Spara**, läs sedan mallen ur
serverns mall-data: `pages/spor?nummer=` och `sha256` ska finnas,
`tracking_url` INTE.

### B. Menylänken

**Onlinebutik** → **Navigering** → **Huvudmeny**: **Lägg till
menyalternativ**, Namn: `Spor pakken`, Länk: `/pages/spor`, **Lägg till**,
**Spara menyn**, sist. Samma i **Sidfotsmeny** (den meny sidfoten på
baeverbutiken.dk faktiskt visar). Kontrollera i kundens vy att **Spor
pakken** syns och landar på "Spor din pakke". Skapa aldrig en ny meny, ta
aldrig bort en rad.

### C. Testmejlet

**Leveransbekräftelse** → **Skicka testmejl**. Bara den.

### Rapportera tillbaka

1. Steg 0: appens namn, rättigheter, installerad eller inte.
2. Vilka mallar som ändrades och verifierades mot servern.
3. Menyerna, och vad du såg i kundens vy.
4. Testmejlet: gick det, till vilken adress.
5. Allt som såg konstigt ut.
