# Engångskoll: Shopify-token för Bäverbutiken — 2026-09-12

Torrkörning: `node kundtjanst/run.mjs --brand baverbutiken --torr --utan-modell --verbose`
(inget postat i Discord, inget skrivet i Notion, ingen rapport sparad).

## (a) Miljövariabler i containern (bara namn)

Finns:
- `NOTION_TOKEN`
- `KUNDTJANST_MAIL_PASS_BAVERBUTIKEN`
- `SHOPIFY_ADMIN_TOKEN_BAVERBUTIKEN`

Saknas:
- `SHOPIFY_SHOP_BAVERBUTIKEN`

## (b) stderr-rader med "Shopify", "scopes", "403", "401", "Notion" eller "⚠️"

```
  ⚠️ Shopify 4snrw0-mg.myshopify.com: Shopify 4snrw0-mg.myshopify.com svarade 401: {"errors":"[API] Invalid API key or access token (unrecognized login or wrong password)"}
```

Inga rader med "scopes", "403" eller "Notion" i stderr.

## (c) Ur rapportens tabell

```
| Ordrar (30 dagar) | 0 | |
| Tvister i perioden | — (ej läsbart) | |
| Tvistgrad | — | |
```

## (d) Exit-kod

`0`

## Sammanfattning

Webbmejlen lästes (46 ärenden, 37 obesvarade > gräns, risk 🔴 100/100).
Shopify-tokenet i `SHOPIFY_ADMIN_TOKEN_BAVERBUTIKEN` avvisas av
`4snrw0-mg.myshopify.com` med 401 — ogiltig nyckel eller fel butik.
Ordrar och tvister kunde därför inte läsas.
