# TankGuard — batch-logg

OPS-butik nr 2, byggd på Bäverbutikens IBC-tanköverdrag. Ingen egen annons har
körts ännu. Det som står här är **ärvd historik**: de brand-swappade annonserna
bär med sig sitt bevisade DNA från källbutiken, och utan den här filen skulle
butikens första analysrunda se ett dussin annonser utan en enda hypotes.

Källa: Meta Graph 2026-09-08, `date_preset: maximum`, båda källkontona.
Rådata: `factory/output/tankguard/kallannonser.json`.

---

## Batch #0 (ärvd) — Bäverbutiken SE, launch 2026-08-28

Kampanj `IBC-Tanköverdraget | BE ROAS 1.51 | Launch 2026-08-28`
(`120250001079150291`, MagiBorsten `1867947880635861`), ACTIVE, 2 300 kr/dag.
34 annonser, alla ACTIVE. **19 569 kr spend, 86 köp, CPA 228 kr.**

Bara annonser över signifikansgrinden (300 kr spend eller 3 köp) får en dom.
Källbutikens break-even-CPA vid 489 kr och 155 kr inköp är 334 kr.

| Annons | Format | Spend | Köp | ROAS | CPA | Vinstbidrag `(334 − CPA) × köp` |
|---|---|--:|--:|--:|--:|--:|
| `PD_1_H1` | video | 16 997 | 77 | 2,92 | 221 | **+8 701 kr** |
| `CS_1_H3` | video | 589 | 3 | 3,65 | 196 | +414 kr |
| `PD_Extra` | video | 423 | 4 | 4,62 | 106 | +912 kr |
| `PD_2_1` | bild | 362 | 0 | – | – | −362 kr |
| `PD_1_H2` | video | 310 | 0 | – | – | −310 kr |

De övriga 29 annonserna ligger under 300 kr och 3 köp. **Ingen dom på dem** —
de har inte fått chansen, inte misslyckats.

**Vad datan säger:**
- `PD_1_H1` är hela kampanjen: 87 % av spenden och 90 % av köpen. Den är
  benchmark, inte en kandidat att döma småannonser mot.
- PD-vinkeln (produktdemo) bär både vinnaren och den effektivaste annonsen
  (`PD_Extra`, CPA 106 kr på 4 köp — låg volym, men samma riktning).
- Video slår bild rakt av: alla fyra annonser med köp är video. Ingen av de 20
  bildannonserna har ett enda köp, och den dyraste (`PD_2_1`, 362 kr) har noll.
- `CS_1_H3` (23 %-rabattvinkeln) håller högst ROAS av allt som fått volym.

---

## Batch #0 (ärvd) — Bäverbutiken NO, launch 2026-08-29

Kampanj `IBC-tanktrekk NO | BE-ROAS 1,63 | 2026-08-29`
(`120251996323340233`, Magiborsten NO `1050941584152547`), ACTIVE, 1 000 kr/dag.
33 annonser, alla ACTIVE. **10 058 kr spend, 41 köp, CPA 245 kr.**
Break-even-CPA vid 439 kr och samma inköp: 284 kr.

| Annons | Format | Spend | Köp | ROAS | CPA | Vinstbidrag `(284 − CPA) × köp` |
|---|---|--:|--:|--:|--:|--:|
| `CS_1_H3` | video | 4 614 | 20 | 2,37 | 231 | **+1 060 kr** |
| `PD_1_H2` | video | 3 945 | 18 | 2,44 | 219 | **+1 170 kr** |
| `PD_1_H1` | video | 807 | 1 | 0,95 | 807 | −523 kr |

Övriga 30 under grinden — ingen dom.

**Vad NO-datan säger, och varför den inte är en kopia av SE:**
- Ordningen kastas om. `PD_1_H1` är den svenska vinnaren men den norska
  förloraren (ROAS 0,95 på 807 kr). `CS_1_H3` och `PD_1_H2`, som knappt fick
  spend i Sverige, bär hela Norge.
- Två annonser delar volymen nästan jämnt i stället för en som tar allt. Det är
  en friskare fördelning än SE:s 87 %-koncentration.
- Samma mönster som SE på formatet: alla tre som fått volym är video, ingen
  bildannons har köp.

⚠️ **Ta inte med den svenska rangordningen in i den norska kampanjen.** Samma
koncept, samma produkt, motsatt utfall på topplaceringen — det är exakt den sorts
antagande som gör att en bevisad vinnare svälter ihjäl på fel marknad.

---

## Vad som väntar

Ingen TankGuard-annons är byggd. Kampanjskalet
`TANKGUARD_Tanköverdraget SE | BE-ROAS 1,62 | 2026-09-08`
(`120248995235740172`) står PAUSED i Magiborsten DK med fyra tomma adsets.

Blockeraren är `factory/butiker/tankguard.yaml` — utan den finns varken
produktlänk, eget pris eller egna villkor, och break-even går inte att räkna om.
Hela läget: `factory/output/tankguard/kallannonser.md`.
