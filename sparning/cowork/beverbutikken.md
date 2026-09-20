# Cowork-prompt: spårningen i Beverbutikken (beverbutikken.no)

⚠️ **Två steg, i ordning, med en paus emellan.** Först måste appen i
Shopify få tre rättigheter (steg 0 — annars kan rutinen varken läsa ordrar
eller skriva sidan; mätt 2026-09-20: appen "Bever No produkter claude" har 6
rättigheter och saknar `read_orders`, `write_fulfillments`, `write_content`).
När det är gjort kör sessionen `/sparning beverbutikken`, som publicerar
sidan **https://beverbutikken.no/pages/spor**. FÖRST DÅ görs steg A–C.
Delen under linjen är prompten; kör den i två omgångar (steg 0 nu, A–C
när Axel fått besked att sidan är uppe).

## Läge 2026-09-20 kväll — steg 0 KLART, sidan LIVE, kör A–C

Cowork körde steg 0 (appversion `…-4` med de fyra rättigheterna, "Uppdatera
dataåtkomst" godkänd i admin). Sessionen körde `/sparning beverbutikken` och sidan
**https://beverbutikken.no/pages/spor** svarar med rubriken "Spor pakken din". Timrutinen är byggd.
Det som återstår är steg A–C nedan — hoppa över steg 0.

---

Du jobbar i Chrome i mitt inloggade Shopify-konto för butiken
**Beverbutikken** (beverbutikken.no, 1acuam-s5.myshopify.com). Rör
ingenting annat i Shopify än det som står här.

⚠️ **Datorn är en Windows-dator, inte en Mac.** ⚠️ **Kontrollera alltid
mot servern, inte mot redigeraren** (Shopify lägger tillbaka osparade utkast
efter F5). Klicka aldrig "Ignorera" på "Osparade ändringar" utan att först ha
läst vad servern har.

### Steg 0 — appens rättigheter (görs FÖRST, en gång)

1. Öppna **https://dev.shopify.com** (Shopify Dev Dashboard) med samma
   inloggning. Hitta appen **"Bever No produkter claude"** (den som är
   installerad i Beverbutikken).
2. Gå till appens **Configuration** / **Access scopes**. Lägg till exakt
   dessa fyra: `read_orders`, `read_fulfillments`, `write_fulfillments`,
   `write_content`. Ta inte bort någon som redan finns. **Spara**.
3. `read_orders` kräver **Protected customer data access**: under appens
   **API access** → **Protected customer data access** → **Request access**,
   välj nivån "Protected customer data" (grunddata, inga fält som namn/
   adress/telefon behövs — vi läser bara ordernummer och spårningsnummer).
   Fyll i syftet: "Order fulfillment tracking — writes carrier scan events
   to orders and builds the store's tracking page." Spara.
4. Öppna Beverbutikkens admin → **Inställningar** → **Appar och
   försäljningskanaler** → appen → om Shopify visar en ruta om nya
   rättigheter: **Godkänn/Uppdatera**. Annars: gå tillbaka till Dev
   Dashboard → appen → **Install app** / **Test on development store** och
   installera om den i Beverbutikken så de nya rättigheterna gäller.
5. Rapportera: vilka rättigheter appen nu listar, och om Protected customer
   data står som "Approved"/"Requested".

**STOPPA HÄR** och rapportera. Steg A–C görs först när sidan
https://beverbutikken.no/pages/spor svarar och visar rubriken
"Spor pakken din" — kontrollera det innan du fortsätter; är det 404,
rapportera och gör inget mer.

### A. Fraktmejlen (tre kundnotiser)

**Inställningar** → **Notiser** → **Kundaviseringar**. Öppna en mall i
taget: **Leveransbekräftelse / Forsendelsesbekreftelse** (Shipping
confirmation), **Leveransuppdatering** (Shipping update), **Ute för
leverans** (Out for delivery). Inte "lokal leverans", inte "Levererad".

I varje mall, **Redigera kod**, brödtexten (HTML):

1. Varje `{{ fulfillment.tracking_url }}` byts mot exakt:

   `https://beverbutikken.no/pages/spor?nummer={{ fulfillment.tracking_number | upcase | replace: ' ', '' | replace: '-', '' | sha256 | slice: 0, 8 | upcase | prepend: 'BB-' }}`

2. Varje ställe där fraktbolagets nummer skrivs ut —
   `{{ fulfillment.tracking_number }}` eller slingan
   `{% for tracking_number in fulfillment.tracking_numbers %} … {{ tracking_number }} …` —
   byts numret mot exakt:

   `{{ fulfillment.tracking_number | upcase | replace: ' ', '' | replace: '-', '' | sha256 | slice: 0, 8 | upcase | prepend: 'BB-' }}`

   Etiketten intill ("Sporingsnummer"/"Tracking number") byts till
   **Pakkenummeret ditt**. Fraktbolagets namn
   (`{{ fulfillment.tracking_company }}`) tas bort där det står.
3. Knappens text, om den säger "Spor forsendelsen"/"Track your shipment":
   byt till **Spor pakken**.

Rör inga andra rader, inte ämnesraden. **Spara**, läs sedan mallen ur
serverns mall-data: `pages/spor?nummer=` och `sha256` ska finnas,
`tracking_url` INTE.

### B. Menylänken

**Onlinebutik** → **Navigering** → **Huvudmeny**: finns ingen rad till
`/pages/spor`, **Lägg till menyalternativ**, Namn: `Spor pakken`, Länk:
`/pages/spor`, **Lägg till**, **Spara menyn**, sist i menyn. Samma i
**Sidfotsmeny** (den meny sidfoten på beverbutikken.no faktiskt visar).
Kontrollera i kundens vy att **Spor pakken** syns i huvudmeny och sidfot
och landar på "Spor pakken din". Skapa aldrig en ny meny, ta aldrig bort
en rad.

### C. Testmejlet

**Leveransbekräftelse** → **Skicka testmejl**. Bara den.

### Rapportera tillbaka

1. Steg 0: appens rättigheter efteråt, och Protected customer data-status.
2. Vilka mallar som ändrades och verifierades mot servern.
3. Menyerna, och vad du såg i kundens vy.
4. Testmejlet: gick det, till vilken adress.
5. Allt som såg konstigt ut.
