# Backlog — HeimGuard (övervakningskameran)

Koncept som väntar. Ett koncept får aldrig födas ur tomma intet — varje rad
pekar på sin källa: playbook-vinnare, winning line som spenderat pengar bra,
eller konkurrent-signal i `docs/swipes/`.

---

## Väntar på åtgärd (inte koncept — arbete)

| Vad | Varför det ligger här | Källa |
|---|---|---|
| **Norska kampanjen** | Butiken tar betalt i SEK på /nb, Bäverbutikens norska annonser är prissatta 899/1 169 NOK. Ett NOK-tal mot en SEK-sida är ett brutet löfte. Kräver NOK-paketnivåer i Shopify först. | mätt 2026-09-08 mot heimguard.se/nb |
| **Talet i `CS_2`/`CS_3` (live på HeimGuard)** | VO säger "sista chansen", "priset går upp snart", "fri frakt över trehundra kronor" — falskt på HeimGuard. Copyn rättades 2026-09-08, talet inte. `CS_11_H1` i batch #2 är ersättaren. **PAUSADE 2026-09-12 på Axels beslut** (annonsnivå, ad-id 120249005623520172 / 120249005623380172, tillbakaläst PAUSED). Får aldrig aktiveras av en rutin. | SRT-filerna, läst 2026-09-11 |
| **`RI_1_H1` och `SP_4_H1`** | Har "baverbutiken" inbränt i bild sent i filmen. Uteslutna ur batch #1. Fixas med `pipeline/no-precis.py` (byter texten i sin egen ruta), inte med en ny caption-motor. | `factory/output/overvakningskameran/brand-detektor.md` |

---

## Koncept

| Idé | Varför den kan funka | Källa |
|---|---|---|
| **[använd i batch #2 → `HeimGuard_SP_18_1`, 2026-09-11]** Bildversion av `SP_2`-vinkeln, byggd på de tio riktiga recensionerna | `SP_2` är produktens bevisade vinnare (13 338 kr, ROAS 2,89, 34 köp) men dess bildversion `SP_2_1` fick bara 295 kr. Vinkeln är bevisad, formatet är oprövat. | ärvd historik, `dna.md` mönster 3 |
| **[använd i batch #2 → `HeimGuard_FD_1_H1`, 2026-09-11, märkt gissning]** "Larmar för personen, inte för hunden" som egen vinkel | Raden klarar tre-frågorstestet rent och är den enda i materialet som en konkurrent inte kan signera — AI-persondetekteringen är produktens faktiska särdrag. | `CS_6_H1`-copyn, tre-frågorstestet 2026-09-08 |
| **[använd i batch #2 → `HeimGuard_SR_1_H1`, 2026-09-11, märkt gissning]** Seniorvinkeln (SR) — "så enkel att mamma fixar det själv" | Står som Axels egen prioriterade vinkel i produktfilen men finns inte i en enda av de 40 ärvda annonserna. Helt obruten mark. | `factory/produkter/overvakningskameran.yaml`, `meta.vinklar` |
| **[använd i batch #2 → `HeimGuard_TR_1_H1`, 2026-09-11]** Trygghetsvinkeln (TR) — "sov lugnt igen" | Samma sak: Axels uttalade huvudvinkel, saknas i det ärvda materialet. Källans SP-vinnare snuddar vid den via sömncitatet, men det citatet är borttaget. | samma |
