# Batch-logg — TackleBay, Fiskespöhållare 4-Pack

OPS-butik nr 5 (flerproduktsbutik, produkt 1 av 2). Nyckel
`tacklebay/fiskespohallare-4-pack`, brand **TackleBay**, tacklebay.se.

Annonskonto: **MagiBorsten DK `915422744950975`** (OPS Factorys gemensamma
konto, SEK). Sida `1283919631474370`. Pixel `1079980541064515`.
⚠️ Förväxla aldrig med MagiBorsten `1867947880635861` = Bäverbutiken.

Hub: **Fish rod holder** `3c3270ab-908c-80f8-824d-eed3c4aa94e1` (delad
historia med Bäverbutiken — se dna.md).

---

## Batch #0 (ÄRVD) — Bäverbutiken SE, launch 2026-08-18

Kampanj `Fiskespöhållaren | BE ROAS 1.50 | Launch 2026-08-18` (MagiBorsten
`1867947880635861`, **LÄSES bara**), prefix `Rodholder_`. Avläst 2026-09-11,
`date_preset: maximum`: **73 annonser, 20 149 kr, 85 köp, ROAS 1,84, verklig
AOV 437 kr.** Åtta batcher i källan (adsetnamnen `Batch 2`–`Batch 8`); deras
hypoteser finns bara i hubbens briefer, inte i något repo — de två som lästes
står nedan, resten `hypotes: ej loggad`.

Bara annonser över grinden (≥ 300 kr OCH ≥ 3 köp) får en dom. TackleBays
linjer: BE-CPA 173 kr / BE-ROAS 1,67 (⚠️ COGS är en gissning, se dna.md).

| Källannons | Format | Spend | Köp | CPA | ROAS | Vinstbidrag mot 173 kr | Hypotes i källans brief | Utfall |
|---|---|--:|--:|--:|--:|--:|---|---|
| `Rodholder_PD_15_H1` | video | 9 268 kr | 39 | 238 kr | 1,94 | −2 521 kr | "Skaka-testet: spöt upp och ner, skakas — invändningen 'håller den?' dödad utan ett ord" | **Höll som hook** (52,0 %, högst i kontot) och som volym (46 % av all spend). Hold 16,4 % lägst av de bedömbara. Lönsam på ROAS, inte på CPA — AOV-frågan. |
| `Rodholder_PD_6_1` | bild | 2 801 kr | 20 | 140 kr | 3,02 | **+659 kr** | "Demo-vinkeln konverterar som statisk när den får budget; isolerad variabel: format" | **Höll.** Bäst på båda linjerna. |
| `Rodholder_PD_16_H1` | video | 2 651 kr | 10 | 265 kr | 1,52 | −921 kr | ej loggad | Under BE på båda linjerna. Bäst hold av videorna (23,3 %). |
| `Rodholder_PD_11_H2` | video | 1 922 kr | 6 | 320 kr | 1,49 | −884 kr | ej loggad | Under BE på båda linjerna. |
| `Rodholder_SO_4_1` | bild | 808 kr | 3 | 269 kr | 1,44 | −289 kr | ej loggad | Preliminär (3 köp). Enda bedömbara som inte är demo. |

Övriga 68 ligger under grinden — **ingen dom.** Bland dem: `CS_3_1` 647 kr /
2 köp (CTR 4,01 %, högst i kontot — klickar men konverterar inte, för tidigt),
`SO_3_H1` 335 kr / 2 köp (hold 28,1 %, bäst hold av allt), `PD_7_1` 331 kr / 1 köp.

**Vad datan säger:** PD-vinkeln bär 91 % av köpen. Video tar volymen, den enda
statiska demon tar effektiviteten. Se dna.md mönster 1–4.

---

## Batch #1 — 2026-09-10 · ÄRVD från Bäverbutiken (`/ny-annonser`, brand-swap)

**Inte en ny batch i vanlig mening.** Kampanj
`TACKLEBAY_SE_Spöhållaren | BE-ROAS 1,67 | 2026-09-10`, 4 adsets (PD, SP, CS,
GT), 23 annonser, CBO 500 kr/dag. Plus `TACKLEBAY_NO_Spöhållaren` med 9
annonser (döms separat, `--marknad NO`).

Annonser i SE-kampanjen (avläst 2026-09-11, last_90d, alla ACTIVE):
`PD_1_H1` (86 kr) · `PROD_V04` (23) · `PD_7_1` (17) · `PROD_V02` (16) ·
`SP_1_H3` (11) · `PD_6_1` (5) · `PROD_V01` (5) · `PD_23_H1` (4) · `SP_1_H1` (2)
· `CS_3_1`, `PD_2_1`, `SP_1_H2`, `PD_15_H2`, `PD_3_H2` (1 kr var) · `GT_3_H1`,
`REA_V02`, `PROD_V05/V06/V07/V08/V10`, `GT_2_1`, `REA_V08` (0 kr).
**Totalt 177 kr, 0 köp. Bedömbara: 0.**

⚠️ Källans tre största videor (`PD_15_H1`, `PD_16_H1`, `PD_11_H2`) är inte med.
Skälet står inte i repot — `hypotes: ej loggad`. Ligger i backloggen som arbete.

### Hypoteser att pröva i första `/notionscalercs`-briefronden

1. Håller den bevisade statiska demon (`PD_6_1`, ROAS 3,02) när länken går
   till en ny butik med sju recensioner i stället för Bäverbutikens sortiment?
2. Håller skaka-testets hook (52 %) med TackleBays transport-vinkel, och går
   holden (16,4 %) att lyfta utan att tappa hooken?
3. `SP_1_H3` (hook 43 %, hold 46 % på 11 kr) — brus tills 300 kr, men första
   raden att läsa.
4. Kalendern som betald upsell i varukorgen (Q4-ramverket) — syns det i AOV?

### Utfall

*Fylls i vid första briefronden. Ingen avläsning gjord ännu.*
