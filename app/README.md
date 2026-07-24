# Grillkliniken · Live P&L

En hostad app i Juicy-stil (donutdiagram + kostnadslista + daglig graf) som slår
ihop **ALLA utgifter** till en riktig nettovinst:

```
Intäkt (Shopify)
 − COGS (inpris per såld vara, från kostnads-dashboarden)
 − Betalavgifter (riktiga från Shopify, annars % + kr/order)
 − Returer & refunds
 − Meta Ads (per dag)
 − Google Ads (per dag)
 − Shopify-plan (prorateras per dag)
 − Appar & verktyg m.fl. fasta kostnader (redigerbara i UI:t)
 − Emballage & pack (kr/order, redigerbart)
 = Nettovinst  ·  Nettomarginal  ·  MER
```

UI: nettovinst i mitten av donuten, kostnadslista med andel av intäkt,
intäkt/vinst per dag, periodval (idag / 7 dgr / 30 dgr / månad / eget spann)
och en inställningspanel (kugghjulet) där fasta kostnader och betalavgifts-
regler redigeras och sparas till `data/costs.json`.

Appen startar **även utan nycklar** – då visas deterministisk **demo-data**
(märkt "Demo-data") så dashboarden aldrig är tom. `?demo=0` tvingar live,
`?demo=1` tvingar demo. Fyll på källorna en i taget.

## Kör lokalt

```bash
cd app
cp .env.example .env      # fyll i nycklarna du har
npm install
npm start                 # → http://localhost:3000
```

## Endpoints

| Route | Vad |
|-------|-----|
| `GET /` | Dashboarden (donut, kostnadslista, daglig graf, KPI:er) |
| `GET /api/pnl?from=YYYY-MM-DD&to=YYYY-MM-DD&demo=auto|0|1` | P&L som JSON, inkl. breakdown + daglig serie |
| `GET/POST /api/settings` | Kostnadsinställningar (fasta kostnader, per order, betalavgift) |
| `GET /api/products` | Produktinpriser (samma data som kostnads-dashboarden) |
| `GET /api/health` | Vilka källor som är kopplade |

## Koppla in källorna

### 1. Shopify (intäkt + avgifter) — koppla GRILLKLINIKENS butik
> ⚠️ Butiken som var kopplad i Claude-sessionen var `Bäverbutiken.se`. Det här
> måste vara **Grillklinikens** butik.

Shopify Admin → **Apps → Develop apps → Create an app** → Admin API scopes
`read_orders`, `read_products` → installera → kopiera **Admin API access token**.
Sätt `SHOPIFY_STORE` (t.ex. `grillkliniken.myshopify.com`) och `SHOPIFY_ADMIN_TOKEN`.

COGS matchas mot sålda rader via **SKU** först, annars **handle**. Rader utan
träff räknas som 0 och rapporteras som `unknownCogsItems` så du ser vad som fattas.

### 2. Meta Ads (annonskostnad)
Meta Business → System user med `ads_read` → token. Sätt `META_ACCESS_TOKEN` och
`META_AD_ACCOUNT_ID` (SnarkLös = `act_1346450049878358`).

### 3. Google Ads (annonskostnad)
Det finns **ingen färdig Google Ads-koppling i Claude** – därför via API:et:
developer token (Google Ads API Center) + OAuth (`CLIENT_ID`, `CLIENT_SECRET`,
`REFRESH_TOKEN`) + `CUSTOMER_ID`. Tills det är på plats kan Google-kostnaden
lämnas på 0 eller matas som en manuell siffra.

## Deploya

Appen är en vanlig Node-server (Node ≥ 20) och kan hostas på Railway, Render,
Fly.io eller en VPS:

- Start-kommando: `npm start`
- Sätt samma miljövariabler som i `.env` i host-panelen
- Öppna porten från `PORT` (default 3000)

`.env` och `node_modules/` ligger utanför git (se repots `.gitignore`).

## Arkitektur

```
server.js            Express: statiska filer + /api/*
src/config.js        läser .env, enabled-flaggor per källa
src/cogs.js          laddar dashboard/kostnader.json, uppslag på SKU/handle
src/shopify.js       Admin GraphQL: ordrar, intäkt, avgifter, COGS-matchning
src/meta.js          Marketing API insights: spend
src/googleads.js     OAuth + GAQL: cost_micros
src/pnl.js           slår ihop allt till en period-P&L
public/index.html    dashboarden
```
