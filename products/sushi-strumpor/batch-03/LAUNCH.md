# LAUNCH — batch #3, Sushi-Strumpor (till Axel, svenska)

Konto: **nya kungen `730973156224390`**. Sida `820358954504320`. Pixel `1785935302094082`.
Rör aldrig `MATSTRUMP_SALES_20260826` (CBO:n) med de här — regel 11: nya tester i eget test-ABO.

## Kampanjen

| | |
|---|---|
| Namn | `MATSTRUMP_SALES_<launchdatum YYYYMMDD>` (t.ex. `MATSTRUMP_SALES_20260922`) |
| Typ | Sales, **ABO** (budget på adset-nivå), aldrig CBO |
| Adset | **ett adset per annons**, `broad_advplus_purchase_<nummer>` (t.ex. `broad_advplus_purchase_029`) |
| Budget | lika per adset — förslag **100 kr/dag** (Tier 1 = 8 adsets = 800 kr/dag). Din siffra. |
| Targeting | Sverige, broad, Advantage+ audience på, alla placeringar |
| Optimering | Köp (pixel `1785935302094082`, PURCHASE), 7d klick + 1d visning |
| Länk | `https://matstrumpor.se/products/sushi-strumpor`, CTA Köp nu |
| Status | Skapa PAUSED, aktivera när alla Tier 1-filer ligger inne så de startar samtidigt |

## Tier 1 — launchas först (8 adsets)

| Adset | Annons | Produktion |
|---|---|---|
| `…_029` | `MATSTRUMP_sushi_curiosity_product_029_v1` | redigerare (bild) |
| `…_030` | `MATSTRUMP_sushi_curiosity_beforeafter_030_v1` | redigerare (bild) |
| `…_031` | `MATSTRUMP_sushi_pain_lifestyle_031_v1` | redigerare (bild) |
| `…_032` | `MATSTRUMP_sushi_conflict_comparison_032_v1` | redigerare (bild) |
| `…_035` | `MATSTRUMP_sushi_offer_product_035_v1` | redigerare (bild, d3:s bas) |
| `…_037` | `MATSTRUMP_sushi_curiosity_product_037_v1` | **ingen** — produktfoto pdp_03 som det är, ingen text |
| `…_038` | `MATSTRUMP_sushi_curiosity_product_038_v1` | redigerare (bild) |
| `…_d1v2` | `MATSTRUMP_sushi_offer_static_d1_v2` | **ingen** — samma creative som `…_d1_v1` i mediebiblioteket (aldrig testad: 69 kr) |

Copy per annons står i respektive `BRIEF.md` (primärtext A, rubrik 1, beskrivning).
För d1_v2: primärtext D1 ur `reference/bogo-copy-2026-08-27.md`.

## Tier 2 — när Tier 1 nått ≥300 kr per adset (≈3 dygn) eller när filerna finns

| Adset | Annons | Produktion |
|---|---|---|
| `…_033` | `MATSTRUMP_sushi_social_textheavy_033_v1` | redigerare (bild, jul ok) |
| `…_034` | `MATSTRUMP_sushi_identity_product_034_v1` | redigerare (bild) |
| `…_036` | `MATSTRUMP_sushi_gift_product_036_v1` | redigerare (bild, jul) |
| `…_d2v2` | `MATSTRUMP_sushi_offer_static_d2_v2` | ingen — befintlig creative (64 kr, 1 köp) |
| `…_d4v2` | `MATSTRUMP_sushi_offer_static_d4_v2` | ingen — befintlig creative (202 kr) |
| `…_039` | `MATSTRUMP_sushi_curiosity_ugc_039h1_v1` | redigerare (video, VO) |
| `…_040` | `MATSTRUMP_sushi_curiosity_ugc_040h1_v1` | redigerare (samma klipp, ASMR) |
| `…_041` | `MATSTRUMP_sushi_gift_ugc_041h1_v1` | redigerare (video) |
| `…_042` | `MATSTRUMP_sushi_offer_anim_042_v1` | redigerare (motion, 7 s) |
| `…_043` | `MATSTRUMP_sushi_pain_comparison_043_v1` | redigerare (video) |

Videorna kör konstant copy: primärtext E1 (den kampanjen redan har), rubrik "Rolig i kväll.
På fötterna i morgon.", beskrivning "Köp 1 – Få 1 gratis. Fri frakt i Sverige."

## Två beslut i CBO:n som är dina (sessionen rör inte kontot)

1. **`MATSTRUMP_sushi_gift_ugc_haikuh3_v1`**: 14 309 kr, 30 köp, **ROAS 0,93** — under 1,0,
   alltså förlust oavsett COGS, på 51 % av kampanjens spend. Stabil dom (30 köp). Pausa den,
   eller sänk CBO:n tills batch #3 ger `d3` sällskap. `haikuh2_v1` (2 317 kr, ROAS 0,52) samma.
2. **`d3` ligger på frequency 2,46** — den slits. Batch #3:s Tier 1 är avlösarna.

## Avläsning

`/cs sushi-strumpor` när Tier 1 nått ≥300 kr per adset. Grinden: ≥300 kr **och** ≥3 köp per
annons innan någon döms. Kill-golv ROAS 1,0 (break-even saknas — "fuck cogsen").
Logga launchen: `node pipeline/quota.mjs log sushi-strumpor <antal> <datum>`.
