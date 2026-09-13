# Engångskoll 3 — Shopify client credentials för Bäverbutiken (2026-09-13)

Engångskoll, ingen rutin. Körd i session `session_01BtX5VXm6SzWXpSmBRFpFde` (konto claude5@stonebite.org), gren `claude/kundtjanst-shopify-koll-3`, från `main`-commit `00648a7`. Inget postat i Discord, inget skrivet i Notion, ingen rapport sparad.

## (a) Miljövariabler som finns (bara namn, aldrig värden)

```
KUNDTJANST_MAIL_PASS_BAVERBUTIKEN
NOTION_TOKEN
SHOPIFY_ADMIN_TOKEN_BAVERBUTIKEN
```

Saknas av de sex efterfrågade: `SHOPIFY_CLIENT_ID_BAVERBUTIKEN`, `SHOPIFY_CLIENT_SECRET_BAVERBUTIKEN`, `SHOPIFY_SHOP_BAVERBUTIKEN`.

## (b) `node kundtjanst/run.mjs --kolla`

```

Kundtjänst — 8 brands, vad som går att läsa:

  baverbutiken   Bäverbutiken   mail ✅  ·  shopify ⚠️ saknar SHOPIFY_ADMIN_TOKEN_BAVERBUTIKEN är en Shopify CLI-token (atkn_…) som Admin API alltid avvisar — lägg in SHOPIFY_CLIENT_ID_BAVERBUTIKEN + SHOPIFY_CLIENT_SECRET_BAVERBUTIKEN från appen på dev.shopify.com (som fabriken), eller en shpat_-token från en custom app i adminpanelen  ·  notion-SOP ✅
  carashell      CaraShell      mail ❌ saknar KUNDTJANST_MAIL_PASS_CARASHELL  ·  shopify ⚠️ saknar SHOPIFY_ADMIN_TOKEN_CARASHELL (eller SHOPIFY_CLIENT_ID_CARASHELL + SHOPIFY_CLIENT_SECRET_CARASHELL)  ·  notion-SOP – (inget id i brandfilen)
  catcabin       CatCabin       mail ❌ saknar KUNDTJANST_MAIL_PASS_CATCABIN  ·  shopify ⚠️ saknar SHOPIFY_ADMIN_TOKEN_CATCABIN (eller SHOPIFY_CLIENT_ID_CATCABIN + SHOPIFY_CLIENT_SECRET_CATCABIN)  ·  notion-SOP – (inget id i brandfilen)
  drytrek        DryTrek        mail ❌ saknar KUNDTJANST_MAIL_PASS_DRYTREK  ·  shopify ⚠️ saknar SHOPIFY_SHOP_DRYTREK (eller shop i brandfilen)  ·  notion-SOP – (inget id i brandfilen)
  hemvakten      HeimGuard      mail ❌ saknar KUNDTJANST_MAIL_PASS_HEMVAKTEN  ·  shopify ⚠️ saknar SHOPIFY_ADMIN_TOKEN_HEMVAKTEN (eller SHOPIFY_CLIENT_ID_HEMVAKTEN + SHOPIFY_CLIENT_SECRET_HEMVAKTEN)  ·  notion-SOP – (inget id i brandfilen)
  kalender       AdventLane     mail ❌ saknar KUNDTJANST_MAIL_PASS_KALENDER  ·  shopify ✅ (client_credentials)  ·  notion-SOP – (inget id i brandfilen)
  tacklebay      TackleBay      mail ❌ saknar KUNDTJANST_MAIL_PASS_TACKLEBAY  ·  shopify ✅ (client_credentials)  ·  notion-SOP – (inget id i brandfilen)
  tankguard      TankGuard      mail ❌ saknar KUNDTJANST_MAIL_PASS_TANKGUARD  ·  shopify ⚠️ saknar SHOPIFY_ADMIN_TOKEN_TANKGUARD (eller SHOPIFY_CLIENT_ID_TANKGUARD + SHOPIFY_CLIENT_SECRET_TANKGUARD)  ·  notion-SOP – (inget id i brandfilen)

  delat: NOTION_TOKEN ✅ · DISCORD_BOT_TOKEN ✅ · ANTHROPIC_NYCKEL ✅

```

## (c) stderr från `node kundtjanst/run.mjs --brand baverbutiken --torr --utan-modell --verbose` (rader med Shopify / mintad / scopes / 403 / 401 / Notion / SOP / ⚠️)

```
  ⚠️ Shopify inte kopplat — ordrar och tvister okända (saknar SHOPIFY_ADMIN_TOKEN_BAVERBUTIKEN är en Shopify CLI-token (atkn_…) som Admin API alltid avvisar — lägg in SHOPIFY_CLIENT_ID_BAVERBUTIKEN + SHOPIFY_CLIENT_SECRET_BAVERBUTIKEN från appen på dev.shopify.com (som fabriken), eller en shpat_-token från en custom app i adminpanelen).
```

## (d) Ur rapporten

```
| Ordrar (30 dagar) | 0 | |
| Tvister i perioden | — (ej läsbart) | |
| Tvistgrad | — | |
```

## SOP-täckning i Notion

15 SOP-sidor lästa. Täckta: inga.
**SOP saknas för toppärenden:** Var är min order (WISMO), Aldrig levererad, Hot om bank/tvist, Okänd/dubbel debitering.

## Chargeback-varningar

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
  - mr***@gmail.com — Never delivered, 120h
  - ma***@hotmail.com — Never delivered, 118h
  - ch***@wpab.eu (#5741) — Never delivered, 111h
  - … +32 till
- **Obesvarade återbetalnings-/avbeställningskrav:** 1 (3 p)
  - ro***@gmail.com (#5241)
- **Median första svarstid (timmar):** 82 (20 p)

## (e) Exit-kod

`node kundtjanst/run.mjs --brand baverbutiken --torr --utan-modell --verbose` → exit=0
`node kundtjanst/run.mjs --kolla` → exit=0
