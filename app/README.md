# Grillkliniken · Live P&L

En liten hostad app som slår ihop **ALLA utgifter** till en riktig nettovinst:

```
Intäkt (Shopify)
 − Inpris / COGS (sålda varor, från kostnads-dashboarden)
 − Shopify-avgifter (betal/transaktion)
 − Meta Ads (annonskostnad)
 − Google Ads (annonskostnad)
 = Nettovinst  ·  Nettomarginal  ·  MER
```

Appen startar **även utan nycklar** – varje källa som saknar credentials körs i
`ej kopplad`-läge (0 kr) och flaggas i gränssnittet. Fyll på källorna en i taget.

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
| `GET /` | Dashboarden (period-väljare, KPI:er, "vart pengarna tar vägen") |
| `GET /api/pnl?from=YYYY-MM-DD&to=YYYY-MM-DD` | P&L som JSON (default senaste 30 dagarna) |
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
