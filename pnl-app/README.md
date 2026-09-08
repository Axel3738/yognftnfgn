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
  SCOPES=read_products,read_orders,read_inventory,read_reports,write_inventory,read_customers,read_all_orders
fly deploy
```

Klistra sedan in `https://<ditt-appnamn>.fly.dev` som **App URL** i Partners, och
`https://<ditt-appnamn>.fly.dev/auth/callback` som **Allowed redirection URL**.

### 4. Installera

Partners → appen → *Välj butik* → Bäverbutiken. Upprepa för nästa butik.
Varje butik får sin egen permanenta token — inget mer connector-byte.

---

## Meta-koppling (annonskostnad)

Två vägar in, samma resultat:

| | Vad krävs | När |
|---|---|---|
| **Knappen "Koppla Meta"** | Env `META_APP_ID` + `META_APP_SECRET` från en Meta-app med Facebook Login for Business och redirect-URI `https://<app-domän>/meta/callback`. Utan Meta App Review fungerar den bara för konton med roll i Meta-appen. | Egna butiker nu, externa efter review |
| **Inklistrad token** | En long-lived token från developers.facebook.com, klistras in under *Inställningar*. | Alltid |

Handlaren väljer annonskonto ur en lista; kontots valuta följer med. Står
kontot i en annan valuta än butiken räknas annonskostnaden om **dag för dag**
med ECB:s dagskurs (Frankfurter), cachad i `FxRate`. Dagar utan kurs
rapporteras som saknade — aldrig som noll. Utan Meta-koppling visas panelen
utan annonskostnad och täckningsbidraget flaggas som ofullständigt.

## Flytta hit (COGS från en annan vinstapp)

Sidan *Flytta hit* tar emot en export från Juicy, TrueProfit, BeProfit eller
ett kalkylblad: kolumnerna känns igen automatiskt (variant-ID, SKU, produkt,
variant, kostnad), tolkningen visas innan något skrivs, och kostnaderna
hamnar i Shopifys `unitCost`. Har den gamla appen redan skrivit dit står det
"Klart — inget att flytta".

## Kundvärde (LTV) — tilläggsplan

Planen *Standard + LTV* (14,99 USD/mån) låser upp sidan *Kundvärde*: kohorter
per första köpmånad, ackumulerat värde per kund månad 0–12, återköpsgrad och
en prognos byggd på butikens egna äldre kohorter. Kräver scopes
`read_customers` + `read_all_orders` och Protected Customer Data nivå 1 (bara
kund-ID hämtas). Egna butiker i `BILLING_EXEMPT_SHOPS` ser sidan utan plan.

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
npm run typecheck    # tsc --noEmit
npm test             # node --test (kräver Node ≥ 22.6 för strip-types)
```

## Struktur

| Fil | Vad |
|---|---|
| `app/lib/pnl.server.ts` | Räknemotorn — TB, BE ROAS, MER, viktade kostnadsändringar |
| `app/lib/shopify-data.server.ts` | Bulk-export + GraphQL: försäljning, produktmix, kostnader, LTV-underlag |
| `app/lib/meta.server.ts` | Annonskostnad per dag från Marketing API, Meta-inloggningen (OAuth) |
| `app/lib/fx.server.ts` | ECB-dagskurser, cache i `FxRate`, omräkning dag för dag |
| `app/lib/cost-import.server.ts` | Tolken för COGS-exporter från andra appar (ren, testad) |
| `app/lib/ltv.server.ts` | Kohorter och LTV-prognos (ren, testad) |
| `app/routes/app._index.tsx` | Panelen |
| `app/routes/app.costs.tsx` | COGS-editor + CSV-import |
| `app/routes/app.import.tsx` | Flytta hit — COGS från Juicy m.fl. i tre steg |
| `app/routes/app.ltv.tsx` | Kundvärde (LTV), låst bakom planen Standard + LTV |
| `app/routes/app.settings.tsx` | Tull, kortavgift, målmarginal, Meta-koppling och annonskonto |
| `app/routes/app.meta.connect.tsx`, `meta.callback.tsx` | Meta-inloggningen: ut ur ramen, tillbaka med token |
| `prisma/schema.prisma` | Sessioner, inställningar, kostnadsändringar, cachad adspend, växelkurser |
| `test/` | Enhetstester för tolken och LTV-motorn |
