# Engångskoll 4: Bäverbutikens EMAILSCRAPER-nycklar — 2026-09-13

Torrkörning i en ny container på kontot `claude5@stonebite.org`. Inget postat i Discord, inget skrivet i Notion, ingen rapport sparad. Inga hemliga värden i den här filen — bara variabelnamn.

## (a) Env-namn som fanns i skalet (`SHOPIFY_*_BAVERBUTIKEN*`)

```
SHOPIFY_ADMIN_TOKEN_BAVERBUTIKEN
SHOPIFY_CLIENT_ID_BAVERBUTIKEN_EMAILSCRAPER
SHOPIFY_CLIENT_SECRET_BAVERBUTIKEN_EMAILSCRAPER
```

Ingen `SHOPIFY_SHOP_BAVERBUTIKEN` — domänen kom ur brandfilen.

## (b) `node kundtjanst/run.mjs --kolla` — raden för baverbutiken

```
baverbutiken   Bäverbutiken   mail ✅  ·  shopify ✅ (client_credentials)  ·  notion-SOP ✅
```

## (c) stderr från `--brand baverbutiken --torr --utan-modell --verbose`

Rader som innehåller "Shopify", "mintad", "scopes", "403", "401", "Notion", "SOP" eller "⚠️":

```
  Shopify-token mintad för 4snrw0-mg.myshopify.com (2 scopes)
```

Det var den enda träffen. Ingen 401, ingen 403, ingen ⚠️-rad, ingen Notion/SOP-rad i loggen. Hela stderr för sammanhang:

```
Kundtjänst vecka 2026-W37 — 1 brand(s), 7 dagar — TORR (inget skrivs, inget postas)

▶ Bäverbutiken (baverbutiken)
  CONNECT-tunnel via 127.0.0.1:39995 till mailcluster.loopia.se:993
  IMAP spärrat av nätet — byter till webbmejlen https://webmail.loopia.se/
  Webbmejl: inloggad som kundsupport@baverbutiken.se (Roundcube 10703, 5 mappar kända)
  Shopify-token mintad för 4snrw0-mg.myshopify.com (2 scopes)
  46 ärenden · 37 obesvarade > gräns · risk 🔴 100/100 · topp: ovrigt 16, var_ar_ordern 13, ej_levererad 8
```

## (d) Ur rapporten (vecka 2026-W37, 7 dagar)

Tabellraderna:

```
| Ordrar (30 dagar) | 1739 | |
| Tvister i perioden | 11 | |
| Tvistgrad | 0,63 % | |
| **Chargeback-risk** | **🔴 Hög (100/100)** | — |
```

Hela avsnittet:

```
## Chargeback-varningar

- **Tvister (chargebacks) i perioden:** 11 (55 p)
  - 17587111919965: inquiry · credit_not_processed · won · evidence due 2026-09-30
  - 17680326230365: inquiry · product_not_received · won · evidence due 2026-09-29
  - #5584: chargeback · credit_not_processed · needs_response · evidence due 2026-09-23
  - 17677220675933: inquiry · product_not_received · won · evidence due 2026-09-28
  - 17666239660381: inquiry · product_not_received · needs_response · evidence due 2026-09-28
  - … +6 till
- **Kunder som hotar med bank/tvist:** 2 (24 p)
  - ma***@gmail.com (#5054)
  - ch***@gmail.com
- **Okänd eller dubbel debitering:** 2 (20 p)
  - a.***@telia.com (#6076)
  - jo***@hotmail.com
- **Säger sig aldrig fått varan:** 8 (24 p)
  - pe***@hotmail.com
  - jo***@gmail.com (#5196)
  - mr***@gmail.com
  - ma***@hotmail.com
  - ch***@wpab.eu (#5741)
  - … +3 till
- **Fel vara / inte som beskrivet:** 1 (6 p)
  - ja***@gmail.com (#5263)
- **Obesvarade ärenden > 48 h:** 37 (25 p)
  - pe***@hotmail.com — Never delivered, 157h
  - jo***@gmail.com (#5196) — Never delivered, 125h
  - mr***@gmail.com — Never delivered, 121h
  - ma***@hotmail.com — Never delivered, 118h
  - ch***@wpab.eu (#5741) — Never delivered, 111h
  - … +32 till
- **Betalda ordrar utan fulfillment > 5 dagar:** 4 (16 p)
  - #6369 · go***@hotmail.com · 2026-09-01
  - #5681 · da***@gmail.com · 2026-08-21
  - #5651 · pe***@gmail.com · 2026-08-20
  - #5603 · da***@eciab.com · 2026-08-20
- **Obesvarade återbetalnings-/avbeställningskrav:** 1 (3 p)
  - ro***@gmail.com (#5241)
- **Median första svarstid (timmar):** 82 (20 p)
```

## (e) Exit-kod

```
0
```

## Slutsats

Shopify för Bäverbutiken är kopplat med EMAILSCRAPER-nycklarna: `korkonfig` tog `SHOPIFY_CLIENT_ID/SECRET_BAVERBUTIKEN_EMAILSCRAPER`, token mintades med 2 scopes, och ordrar (1 739 på 30 dagar), tvister (11) och ofulfillade ordrar (4) lästes på riktigt. Risken 100/100 är nu räknad med Shopify-signalerna, inte som tidigare "utan Shopify". Tvistgraden 0,63 % ligger under Visas 0,9 % och Mastercards 1 %.
