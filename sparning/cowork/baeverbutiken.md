# Cowork-prompt: spårningen i Bæverbutiken (baeverbutiken.dk)

⚠️ **Två steg, i ordning, med en paus emellan.** Mätt 2026-09-20: nycklarna
`SHOPIFY_CLIENT_ID_DK` + `SHOPIFY_CLIENT_SECRET_DK` i Environments hör till
en app som **inte är installerad** i den danska butiken (Shopify svarar
"app_not_installed"). Steg 0 installerar appen med rätt rättigheter. När det
är gjort kör sessionen `/sparning baeverbutiken`, som publicerar sidan
**https://baeverbutiken.dk/pages/spor**. FÖRST DÅ görs steg A–C.
Delen under linjen är prompten; kör den i två omgångar.

## Utfall 2026-09-20 sen kväll

Axel installerade appen "DK claudeprodukter" själv (Coworks filter vägrade
klicket). `--kolla` grön (13 rättigheter), rundan: 1 order, 1 registrerat,
0 skanningar; sidan **https://baeverbutiken.dk/pages/spor** publicerad TOM
som första sida (`gid://shopify/Page/722777276761`), timrutin
`trig_01Xjx5pUdre9Uw3LJiBy9Nzs` på :48. ⚠️ baeverbutiken.dk omdirigerar
till `xn--bverbutiken-98a.dk` (bæverbutiken.dk) — trippelkollen läste den
adressen. Mejl + meny: `mejl/output/butiker/baeverbutiken/COWORK-PROMPT.md`
(A + B + C).

⚠️ **Avsändaradressen är kundesupport@baeverbutiken.dk** (Coworks avläsning
2026-09-20 sen kväll), inte kundeservice@ — registret rättat; verifieringsmejlet
gick dit. Axel klickar länken i den inkorgen.

## ✅ Utfall 2026-09-21 ~01:25 CEST — mallar + meny + testmejl KLARA (Cowork, nya prompten)

Avsändaren **kundesupport@baeverbutiken.dk** står som Autentiserad (Axels
klick). Tre mallar inskrivna och verifierade mot serverns mall-data:
`shipping_confirmation` 10 432 / `shipping_update` 6 228 /
`shipment_out_for_delivery` 6 236 tecken, identiska med råfilerna, `BB-` +
`sha256` i alla, ämnen `Din pakke er på vej` / `Ny info om din pakke` /
`Pakken kommer i dag`. **Spor pakken → /pages/spor** sist i Huvudmeny och
Sidfotsmeny (`footer`), sedd i kundens vy. Testmejl till
axelodhner.business@gmail.com: en knapp **Spor pakken**,
`https://baeverbutiken.dk/pages/spor?nummer=BB-6C1002DF`. Cowork råkade
öppna "Lägg till sida"-dialogen (texten hamnade i raden "Kontakt os") men
stängde utan att spara och gjorde om med tabb i stället för koordinatklick —
serverns meny var rätt efteråt. `meny_klar: true` i `mejl/butiker/baeverbutiken.json`.
**Danmark är klart.**

## ⚠️ Steg A ERSATT 2026-09-20 sen kväll — kör i stället `mejl/output/butiker/baeverbutiken/COWORK-PROMPT.md`

Axels dom på Coworks första CaraShell-körning (byten rad för rad i Shopifys
standardmall, Shop-knappen kvar): "mailen var tvääär fula, fulare än
originalet". Mejlen byggs nu som Bäverbutikens — hela mallen byts —
av `node mejl/bygg-butik.mjs baeverbutiken` (butikens logga, färger, språk,
paketprefix, utan gratisprodukt-blocket). Prompten till Cowork ligger i
`mejl/output/butiker/baeverbutiken/COWORK-PROMPT.md` och täcker A + C + menylänken B.
Steg A nedan är kvar som historik och ska INTE köras.

---

Du jobbar i Chrome i mitt inloggade Shopify-konto för butiken
**Bæverbutiken** (baeverbutiken.dk, v0xqtk-tx.myshopify.com). Rör ingenting
annat i Shopify än det som står här.

⚠️ **Datorn är en Windows-dator, inte en Mac.** ⚠️ **Kontrollera alltid
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
