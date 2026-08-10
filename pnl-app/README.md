# P&L — vinstpanel som Shopify-app

Embedded Shopify-app som visar riktig vinst per dag: försäljning − COGS − tull −
transaktionsavgift − annonskostnad. Installeras per butik, ingen inloggning utöver
Shopify-admin.

Ersätter artifact-panelen. Skillnaden som betyder något: **COGS bor i Shopify**
(`InventoryItem.unitCost`), inte i en hårdkodad fil. Därför funkar appen på vilken
butik som helst utan att byggas om.

---

## Vad du behöver göra

### 1. Skapa appen i Partners (5 min)

Partners → **Appdistribution** → *Skapa app* → **Skapa app manuellt** → namn `P&L`.

Kopiera **Client ID** och **Client secret**. De ska aldrig in i repot — de sätts
som miljövariabler på hostingen i steg 3.

### 2. Hosting + databas (10 min)

Appen behöver en publik HTTPS-URL som är uppe dygnet runt, plus Postgres.

**Fly.io** (~5 USD/mån, Postgres ingår i free tier):

```bash
brew install flyctl          # eller: curl -L https://fly.io/install.sh | sh
fly auth signup
cd pnl-app
fly launch --no-deploy       # välj region arn (Stockholm)
fly postgres create --name pnl-db --region arn
fly postgres attach pnl-db   # sätter DATABASE_URL automatiskt
```

Railway funkar lika bra om du hellre klickar än skriver.

### 3. Sätt hemligheterna

```bash
fly secrets set \
  SHOPIFY_API_KEY=<client id från steg 1> \
  SHOPIFY_API_SECRET=<client secret från steg 1> \
  SHOPIFY_APP_URL=https://<ditt-appnamn>.fly.dev \
  SCOPES=read_products,read_orders,read_inventory,read_reports,write_inventory
fly deploy
```

Klistra sedan in `https://<ditt-appnamn>.fly.dev` som **App URL** i Partners, och
`https://<ditt-appnamn>.fly.dev/auth/callback` som **Allowed redirection URL**.

### 4. Installera

Partners → appen → *Välj butik* → Bäverbutiken. Upprepa för nästa butik.
Varje butik får sin egen permanenta token — inget mer connector-byte.

---

## Meta-koppling (annonskostnad)

Två lägen:

| | Vad krävs | När |
|---|---|---|
| **Dev mode** | Inget. Fungerar direkt på dina egna annonskonton. | Nu |
| **Publik** | Meta App Review på `ads_read`. Veckor. | När du ska sälja appen |

Skapa en app på developers.facebook.com → Marketing API → hämta en long-lived
token → klistra in under *Inställningar* i appen. Tills dess visas panelen utan
annonskostnad, och täckningsbidraget flaggas som ofullständigt istället för att
tyst visas för högt.

---

## COGS

Appen läser `InventoryItem.unitCost` — Shopifys inbyggda "Kostnad per artikel".

- **Fyll i:** *Kostnader*-fliken i appen, eller CSV-import, eller direkt i Shopify.
- **Datumsatta ändringar:** när en leverantörsoffert ändras lägger du in nytt pris
  med startdatum. Perioder som spänner över brytdatumet viktas efter omsättning
  per dag istället för att låtsas att den nya kostnaden gällt hela tiden.
CSV-formatet är `produkttitel;varianttitel;kostnad`. Tom varianttitel sätter samma
kostnad på alla varianter i produkten. Titlarna måste matcha Shopify exakt —
importen gissar aldrig, den hoppar över det den inte känner igen och säger vilka.

Kostnaden ska vara **vara + frakt, utan tull**. Tullen är per order och räknas
separat i inställningarna.

---

## Utveckling lokalt

```bash
npm install
npx prisma migrate dev
npm run dev          # Shopify CLI öppnar en tunnel och installerar i din dev-butik
```

## Struktur

| Fil | Vad |
|---|---|
| `app/lib/pnl.server.ts` | Räknemotorn — TB, BE ROAS, MER, viktade kostnadsändringar |
| `app/lib/shopify-data.server.ts` | ShopifyQL + GraphQL: försäljning, sessioner, produktmix, kostnader |
| `app/lib/meta.server.ts` | Annonskostnad per dag från Marketing API |
| `app/routes/app._index.tsx` | Panelen |
| `app/routes/app.costs.tsx` | COGS-editor + CSV-import |
| `app/routes/app.settings.tsx` | Tull, kortavgift, växelkurs, annonskonto |
| `prisma/schema.prisma` | Sessioner, inställningar, kostnadsändringar, cachad adspend |
