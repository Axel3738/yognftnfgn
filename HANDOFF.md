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
