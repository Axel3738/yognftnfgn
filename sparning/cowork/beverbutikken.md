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

## Utfall 2026-09-20 sen kväll (Cowork körde den GAMLA A–C-prompten)

- **A** gjord enligt den gamla metoden (byten i Shopifys standardmall):
  `sha256` 5/5/4, `tracking_url` 0, `shop_app_tracking_url` 0, två knappar
  "Vis bestillingen din" + "Spor pakken", "Pakkenummeret ditt: BB-…". Byts
  helt av `mejl/output/butiker/beverbutikken/COWORK-PROMPT.md` (samma dom
  som CaraShell: lappad standardmall är ful).
- **B** klar: "Spor pakken" sist i **Hovedmeny** (`main-menu`) och
  **Bunntekstmeny** (`footer`), sett i kundens vy. `meny_klar: true` i
  `mejl/butiker/beverbutikken.json`.
- **C** testmejl skickat till axelodhner.business@gmail.com.
- Coworks anmärkningar (gäller den gamla mallen, försvinner med den nya):
  samma BB-nummer upprepat per kolli i flernummersslingan, knappen
  ovillkorlig även utan spårningsnummer, brödtexten "Spor forsendelsen din"
  kvar. Den nya mallen har `{% if fulfillment.tracking_number %}` runt
  knappen och orderstatussidan som reserv.

## ✅ Utfall 2026-09-20 sen kväll — de NYA mallarna ligger på servern, testmejl OK

Axel trodde Norge-fliken gått förlorad, men Cowork hade hunnit klart:
körningen av `mejl/output/butiker/beverbutikken/COWORK-PROMPT.md` fann
alla tre mallarna **redan identiska med råfilerna** på servern
(EmailTemplate-API, `bodyHtml` + `updatedAt`, inte redigeraren):

| Mall | Shopify-id | Tecken | updatedAt (UTC) |
|---|---|---|---|
| Leveransbekräftelse | `shipping_confirmation` | 10 436 | 2026-09-20 20:46:18 |
| Leveransuppdatering | `shipping_update` | 6 240 | 20:55:19 |
| Ute för leverans | `shipment_out_for_delivery` | 6 243 | 20:58:24 |

Ämnesraderna rätt, `BB-` + `sha256` i alla tre, inget sparat om. Ingen gul
avsändarbanner. Testmejl till axelodhner.business@gmail.com: en enda knapp
**Spor pakken** → `https://beverbutikken.no/pages/spor?nummer=BB-6C1002DF`.
Knappen går via Shopifys klickspårning (`/_t/c/v3/…`) före sidan — Shopifys
standard för alla notiser, inget i mallen.

⚠️ **Avsändaradressen är Beverbutikken@gmail.com.** Shopify tar inte
Gmail-domäner som anpassad avsändare, så mejlen går från
`store+95795249527@shopifyemail.com` medan sidfoten hänvisar till
kundesupport@beverbutikken.no. Axel bytte samma kväll till **support@beverbutikken.no** och
verifierade den (inte kundesupport@ som BESLUT.md sa). Registret och
mallarnas sidfot uppdaterade — mallarna körs om av Cowork (10 426 / 6 230 /
6 233 tecken).

## ⚠️ Steg A ERSATT 2026-09-20 sen kväll — kör i stället `mejl/output/butiker/beverbutikken/COWORK-PROMPT.md`

Axels dom på Coworks första CaraShell-körning (byten rad för rad i Shopifys
standardmall, Shop-knappen kvar): "mailen var tvääär fula, fulare än
originalet". Mejlen byggs nu som Bäverbutikens — hela mallen byts —
av `node mejl/bygg-butik.mjs beverbutikken` (butikens logga, färger, språk,
paketprefix, utan gratisprodukt-blocket). Prompten till Cowork ligger i
`mejl/output/butiker/beverbutikken/COWORK-PROMPT.md` och täcker A + C + menylänken B.
Steg A nedan är kvar som historik och ska INTE köras.

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
