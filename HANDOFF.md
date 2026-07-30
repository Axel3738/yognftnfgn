# Grillkliniken — Listicle A/B test (elistic batch)

Ad account: `act_1346450049878358` (SnarkLös) · Page `735544842985326` · Pixel `776922878287560`
Product: Elektrisk grillborste · All entities created **PAUSED**.

## Test design
Each of 7 UGC concepts is tested against **two landing destinations**, one ad set per destination
(14 ad sets total), with all 10 hooks per ad set → **140 ads**.

- **base** side → product page `grillkliniken.se/products/elektrisk-grillborste`
- **list** side → the concept's listicle page (below)

## Ad sets (base / listicle)

| Concept | Ad name prefix | BASE ad set | LIST ad set | Listicle URL |
|--------|----------------|-------------|-------------|--------------|
| 194 | `194 #9`  | 120248184765640074 | 120248184780920074 | /pages/112 |
| 206 | `206 #21` | 120248184795160074 | 120248184808190074 | landing-page-blank-jul-5-10-55-52 |
| 211 | `211 #26` | 120248184822630074 | 120248184835240074 | /pages/137 |
| 214 | `214 #29` | 120248184849320074 | 120248184858380074 | landing-page-blank-jun-23-22-43-04 |
| 215 | `215 #30` | 120248184869360074 | 120248184880040074 | /pages/112 |
| 219 | `219 #34` | 120248184890520074 | 120248184899980074 | /pages/112 |
| 220 | `220`     | 120248184911000074 | 120248184917660074 | /pages/149 |

Each ad set holds hooks H1–H10 (ad names `<prefix> H<n>`).

## Status
- 194 / 206 / 211 / 214: base + listicle complete (built earlier this session).
- 215 / 219 / 220: base + listicle completed in this pass.
- Standard Enhancements opted OUT on every creative. CTA = SHOP_NOW.
- Note: 219 listicle H9 was recreated once to correct a link (originally pointed at the product page).

All 140 ads are PAUSED — ready to review and launch.

---

# Batch 2 — VSL concepts (199, 235, 236, 237, 238, 240)

Same account/campaign (`act_1346450049878358`, campaign `120242897371730074`, CBO,
OFFSITE_CONVERSIONS, SE 18–65, pixel `776922878287560`). 12 new ad sets (base + listicle
per concept), naming `<concept> BASE` / `<concept> LISTICLE`. All ads PAUSED.

| Concept | Listicle | LISTICLE URL | BASE adset | LIST adset | Hooks |
|--------|----------|--------------|-----------|-----------|-------|
| 199 #14 | #5 | /pages/landing-page-blank-jul-2-16-42-31 | 120248277953030074 | 120248277953870074 | H1–H10 (10) |
| 235 | 110 | /pages/110 | 120248277954980074 | 120248277956400074 | H2,H3 (2)* |
| 236 | 136 | /pages/136 | 120248277958240074 | 120248277959310074 | H1–H3 (3) |
| 237 | 114 | /pages/113 | 120248277961190074 | 120248277962380074 | H1–H4 (4) |
| 238 | #7 | /pages/landing-page-blank-jul-2-20-04-17 | 120248277963690074 | 120248277965610074 | H1–H5 (5) |
| 240 | #4 | /pages/landing-page-blank-jul-2-08-13-08 | 120248277967470074 | 120248277969830074 | V1,V2H2,V2H3 (3)** |

Total batch 2: 27 videos × 2 sides = **54 ads**.

\* 235: only H2 and H3 were uploaded/processed — **H1 and H4 were missing** from the ad account.
\** 240: only VERSION 1, V2 HOOK 2, V2 HOOK 3 were available — **V2 HOOK 1 was missing**.
Re-run those hooks once the videos finish processing.

Note: the sheet's "114" row maps to the URL `/pages/113` — used as given.

---

# Batch 3 — Master campaign ("Mastern")

Same account/page/pixel. Loaded into the **master campaign** `120242897371730074`
("Mastern", CBO, OFFSITE_CONVERSIONS, SE 18–65, pixel `776922878287560`).
10 concepts, each tested **base + listicle** → 20 new ad sets, **68 ads**, all PAUSED.
Naming `<concept> BASE` / `<concept> LISTICLE`, hooks `<prefix> H<n>`.

| Concept | Listicle | LISTICLE URL | BASE adset | LIST adset |
|--------|----------|--------------|-----------|-----------|
| 234 | 110 | /pages/110 | 120248436130740074 | 120248436135540074 |
| 239 | 30-dagars (Erik) | /pages/vi-testade-i-30-dagar | 120248436142770074 | 120248436146670074 |
| 241 | 149 | /pages/149 | 120248436149490074 | 120248436152700074 |
| 242 | review | /pages/landing-page-blank-jul-5-10-55-52 | 120248436154880074 | 120248436157180074 |
| 243 | 110 | /pages/110 | 120248436162640074 | 120248436166210074 |
| 244 | 149 | /pages/149 | 120248436169390074 | 120248436174190074 |
| S1 | 110 | /pages/110 | 120248436176550074 | 120248436180820074 |
| S3 | 110 | /pages/110 | 120248436183260074 | 120248436184950074 |
| s4 | 112 | /pages/112 | 120248436188710074 | 120248436191440074 |
| s7 | 149 | /pages/149 | 120248436195090074 | 120248436198780074 |

Every creative carries a video thumbnail (`image_url`), Standard Enhancements OPT_OUT,
CTA = SHOP_NOW. All 68 ads PAUSED — ready to review and launch.

## Still outstanding (from batch 2)
- **235**: hooks H1 and H4 never built — videos still not in the ad-account library.
- **240**: V2 HOOK 1 never built — video still not in the library.
Re-run those three once they finish processing in Meta.
