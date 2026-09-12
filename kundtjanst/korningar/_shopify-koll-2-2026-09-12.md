# Engångskoll 2: Shopify-token för Bäverbutiken — 2026-09-12

Engångskoll, ingen rutin. Inget postat i Discord, inget skrivet i Notion, ingen rapport sparad.

## (a) Steg 1 — token i skalet

```
finns=ja prefix=atkn_0 langd=69 mellanslag=0
```

## (b) Steg 2 — tre Admin API-anrop (statuskod + första 200 tecken)

```
shop.json → 401
{"errors":"[API] Invalid API key or access token (unrecognized login or wrong password)"}
orders.json?limit=1&status=any → 401
{"errors":"[API] Invalid API key or access token (unrecognized login or wrong password)"}
shopify_payments/disputes.json?limit=1 → 401
{"errors":"[API] Invalid API key or access token (unrecognized login or wrong password)"}
```

## (c) Steg 3 — stderr-rader med Shopify / scopes / 403 / 401 / Notion / SOP / ⚠️

```
  ⚠️ Shopify 4snrw0-mg.myshopify.com: Shopify 4snrw0-mg.myshopify.com avvisade token (401). Värdet är en kortlivad CLI-/app-token, inte custom-appens "Admin API access token" (shpat_…). Rätt värde: custom-appen i just 4snrw0-mg.myshopify.com → API credentials → "Admin API access token".
```

## (d) Rapportens rader Ordrar / Tvister / Tvistgrad

```
| Ordrar (30 dagar) | 0 | |
| Tvister i perioden | — (ej läsbart) | |
| Tvistgrad | — | |
```

### Hela avsnittet "## SOP-täckning i Notion"

## SOP-täckning i Notion

215 SOP-sidor lästa. Täckta: inga.
**SOP saknas för toppärenden:** Var är min order (WISMO), Aldrig levererad, Hot om bank/tvist, Okänd/dubbel debitering.


## (e) Exit-kod steg 3

```
exit=0
```
