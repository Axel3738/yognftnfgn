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
