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

## Launch #1 — de ärvda annonserna i OPS-kontot, 2026-09-09 → 2026-09-11

Kampanj `TANKGUARD_SE_Tanköverdraget | 2026-09-08` (`120248995235740172`,
MagiBorsten DK `915422744950975`), CBO 1 000 kr/dag, 7 adsets (RV, BOF, CO, GT,
CS, SP, PD), **40 annonser** — de brand-swappade ärvda creativesen. Aktiverad
2026-09-09 (inte av en rutin), **pausad 2026-09-11 16:02** (`updated_time`, inte
av Nattvakten — ett beslut, rörs aldrig). Avläst av `/notionscalercs` 2026-09-12
(`factory/output/tankguard/budgetrond-2026-09-12.json`, last_14d).

| Dygn | Spend | Köp | ROAS |
|---|--:|--:|--:|
| 2026-09-09 | 75 kr | 0 | – |
| 2026-09-10 | 1 540 kr | 1 | 0,32 |
| 2026-09-11 | 401 kr | 0 | – |
| **Totalt** | **2 017 kr** | **1** | **0,24** |

Break-even-CPA 334 kr (UTAN moms, registret). **Bedömbara annonser: 0** — ingen
har ≥ 300 kr OCH ≥ 3 köp. Ingen dom. Det som ändå syns, märkt hypotes:

| Annons | Status | Spend | Köp | Hook | Hold | CTR | CPC | CVR |
|---|---|--:|--:|--:|--:|--:|--:|--:|
| `GT_1_H1` | PAUSED | 629 kr | 1 | 25,8 % | 20,6 % | 2,15 % | 6,35 | 1,0 % |
| `GT_1_H2` | WITH_ISSUES | 477 kr | 0 | 37,2 % | 21,1 % | 1,50 % | 10,15 | 0 |
| `GT_1_H3` | WITH_ISSUES | 301 kr | 0 | 31,8 % | 22,6 % | 1,88 % | 9,14 | 0 |
| `BOF_2_1` (bild) | WITH_ISSUES | 125 kr | 0 | – | – | 2,14 % | 6,27 | 0 |
| `GT_3_H1` | WITH_ISSUES | 92 kr | 0 | 34,5 % | 17,3 % | 2,30 % | 4,58 | 0 |
| `PD_1_H1` (ärvd vinnare) | WITH_ISSUES | 29 kr | 0 | 20,5 % | 18,9 % | 0,77 % | 14,32 | 0 |
| övriga 34 | | 364 kr | 0 | | | | | |

Spend per vinkel: **GT 1 561 kr (77 %)** · BOF 156 · PD 107 · CS 87 · CO 45 ·
SP 44 · RV 16 kr.

**Vad datan säger (hypoteser, inte domar):**
- CBO:n gav presentvinkeln (GT) 77 % av pengarna och den ärvda vinnaren PD_1_H1
  29 kr. Det är Metas fördelning på tre dygn, inte en dom över PD.
- GT-videorna har kampanjens bästa hook rates (32–37 %) men CPC 9–10 kr och
  0 köp på 778 kr — de stoppar scrollen och tappar sedan. GT_1_H1 tog det enda
  köpet: CPA 629 kr, nästan 2 × break-even.
- **17 av 40 annonser står WITH_ISSUES** (Metas flagga, inte kampanjpausen —
  de 22 andra står CAMPAIGN_PAUSED). Vad flaggan gäller går inte att läsa ur
  insikterna; det syns i Ads Manager. Ingen av dem rörs av rutinen.
- Ingen annons i launchen har en hypotes i den här loggen: de gick upp som
  brand-swappar av `/ny-annonser`, inte som briefer. Batch #1 nedan är den
  första med hypotes och variabeltaggar per annons.

---

## Batch #1 — 2026-09-12 · första briefronden (`/notionscalercs tankguard`, körning nr 2)

**KALLSTART:** 0 bedömbara annonser i OPS-kampanjen (se launch #1 ovan), ingen
feedback-loop. Alla 7 är nya koncept / varianter av ÄRVDA vinnare. Ingen
redigerare tilldelad → 7 briefer (en dags produktion), inte kadensens 21.
Copy: A/B Fable mot Sonnet (Axel 2026-09-10), 4 fable / 3 sonnet, skriven av
subagenter via Agent-verktyget med samma systemprompt som `tools/copy-agent.mjs`.
Rader i hubben `IBC Tank Cover creative hub` (`3ce270ab-908c-8161-bed2-e22f132a6aba`),
status `Draft`. Break-even-CPA 334 kr. Priset 489 kr verifierat live 2026-09-12.

| Annons | Typ | Copy | Förälder / källa | Hook | Hypotes | Variabeltaggar | Notion |
|---|---|---|---|---|---|---|---|
| `TankGuard_PD_7_H1` | video | fable | Variant av ärvd PD_1_H1 (hook: problemet i kundens ord) | Trött på grönt, algfyllt regnvatten i tanken? | Problemet i sek 0–3 på den bevisade demofilmen slår originalöppningen (hook > 20,5 %) | vinkel=PD · hook=problem i kundens ord · format=video omklipp · proof=mekanism · offer=pris på end card | [rad](https://app.notion.com/p/TankGuard_PD_7_H1-3d8270ab908c8119a5cce4ab686a9201) |
| `TankGuard_PD_7_H2` | video | sonnet | Variant av ärvd PD_1_H1 (hook: orsaken) | Problemet är inte vattnet. Det är ljuset. | Orsaken kunden inte känner till stoppar bättre än problemet hon redan känner | vinkel=PD · hook=orsak/påstående · format=video omklipp · proof=mekanism · offer=pris på end card | [rad](https://app.notion.com/p/TankGuard_PD_7_H2-3d8270ab908c8166a479d81cf35827f6) |
| `TankGuard_CS_6_H1` | video | fable | Nytt koncept — källa: ärvd CS_1_H3 (ROAS 3,65 SE / 2,37 NO) + backlog #1 | Två IBC-tankar? Kranskyddet till utekranen på köpet. | Bonusen (2 kranskydd) säljer 2-packet utan kronrabatt i annonsen | vinkel=CS bonus · hook=fråga · format=video ny film · proof=bonusprodukten · offer=köp 2 → 2 kranskydd (aldrig paketpris) | [rad](https://app.notion.com/p/TankGuard_CS_6_H1-3d8270ab908c81528d54fdc8c983e395) |
| `TankGuard_PR_1_H1` | video | sonnet | Nytt koncept — **gissning** (säsong), backlog #4 | Presenningen blåser av vid första höststormen. | Väder/konflikt A stoppar scrollen i stormsäsong (hook > 26 %) | vinkel=PR konflikt A · hook=bild/påstående · format=video ny film · proof=mekanism+mått · offer=pris på end card · källa=gissning | [rad](https://app.notion.com/p/TankGuard_PR_1_H1-3d8270ab908c81f3831ee139c1e87630) |
| `TankGuard_SP_4_H1` | video | fable | Nytt koncept — källa: playbook #5 + HeimGuard SP; backlog #3 avblockerad | 16 recensioner på tankguard.se – här är en. | Verifierbar social proof (16, 4,81, citat ordagrant) konverterar bättre än funktionslista | vinkel=SP · hook=siffra/citat · format=video + citatkort · proof=recension verbatim · offer=pris på end card | [rad](https://app.notion.com/p/TankGuard_SP_4_H1-3d8270ab908c81139cd6cbc5342e7c53) |
| `TankGuard_UV_1_H1` | video | sonnet | Nytt koncept — källa: produktsidans andra vinkel + PD_1-raden "Solen gör plasten spröd" | Solen gör plasten spröd, år efter år. | Den osynliga kostnaden (tanken) öppnar bättre än den synliga (grönt vatten) | vinkel=UV · hook=påstående/bild · format=video ny film · proof=mekanism · offer=pris på end card | [rad](https://app.notion.com/p/TankGuard_UV_1_H1-3d8270ab908c814198a0e6ee36e923f9) |
| `TankGuard_FE_1_1` | bild | fable | Nytt koncept — källa: copy-regler (före/efter) + playbook; enda bilden | Solen gör vattnet grönt. Överdraget tar solen. | En före/efter-bild med EN rad kan konvertera där funktionsbilderna (0 köp/20) inte gjorde det | vinkel=FE · hook=bild · format=bild split · proof=före/efter · offer=489 kr i hörnet | [rad](https://app.notion.com/p/TankGuard_FE_1_1-3d8270ab908c8125a6c0f28523dd4e2f) |

**Utfall:** — (läses av nästa briefdag; kampanjen står PAUSED — står den kvar
så är nästa rond också kallstart).

**Tre-frågorstestet:** alla rader klarar visualisera + falsifiera. ❌ på
"ingen annan kan säga det" finns kvar på de ärvda, ordagrant behållna PD_1-
raderna (PROBLEM/PROOF) och på problemfrågan i `PD_7_H1`:s hook — behållna med
flit, eftersom testet isolerar hookens *position*, inte ny formulering. Står
redovisat i varje briefs avsnitt 8.

---

## Vad som väntar

Kampanjen `TANKGUARD_SE_Tanköverdraget | 2026-09-08` står PAUSED sedan
2026-09-11 16:02 med 17 annonser WITH_ISSUES. Batch #1:s briefer blir annonser
när (a) en redigerare tilldelas butiken, (b) någon läser flaggan i Ads Manager
och sätter kampanjen ACTIVE. Rutinen gör ingetdera. Den norska halvan väntar
fortfarande på NOK-nivåer.
