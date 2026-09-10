# Backlog — AdventLane (Adventskalender Racingbilar)

Koncept som väntar. Ett koncept får aldrig födas ur tomma intet — varje rad
pekar på sin källa: playbook-vinnare, winning line som spenderat pengar bra,
eller konkurrent-signal i `docs/swipes/`. Kan den inte det är den märkt
**gissning**.

---

## Väntar på åtgärd (inte koncept — arbete)

| Vad | Varför det ligger här | Källa |
|---|---|---|
| **Copyn i OPS-kampanjen läses ur kontot** | Bygget 2026-09-10 är inte loggat i repot. Innan någon ärvd annons dupliceras måste det stå svart på vitt om brådskan (CS), det påhittade citatet och "30 dagars öppet köp" (SP) och länken följde med. | `dna.md` "Vad AdventLane måste ändra", mätt 2026-09-11 |
| **Norska CS-annonserna: fel pris + falsk brådska** | `_NO_CS_1/2/3`, `_NO_CS_2_1` säger "579 kr → 439 kr i dag", "begrenset lager". Sidan tar SEK 499 tills NOK-paketnivåer finns (butikskonfig; kundvyn lösenordsskyddad, inte läst). Beslut om paus är Axels (PAUSED med spend är ett beslut) — rutinen rör dem inte. | kontot, läst 2026-09-11; `kalender.yaml` marknader |
| **`kalla.no_kampanjmonster` i produktfilen** | `kallannonser.mjs` faller tillbaka på `gamasj\|damask` (DryTrek) när fältet saknas och läser fel produkts norska historik. Sätt fältet (eller gör defaulten till ett stopp) före nästa `/ny-annonser` för en kalender. | `factory/kallannonser.mjs` rad 163, mätt 2026-09-11 |
| **Inköpspriset kvitteras** | 191 kr är härlett ur kampanjnamnet, inte ur Temu-kvittot. Temu-länken svarar "discontinued" — ny leverantör krävs före inköp. | `factory/produkter/adventskalender-racingbilar.yaml` |
| **Bonusprodukt (Q4-ramverket)** | `offer.bonus_produkt` tomt, paketen körs utan gratisdel. Ägarens val. | `factory/state/kalender--adventskalender-racingbilar.json` |
| **Sida och pixel i produktfilen** | `meta.page_id` / `meta.pixel_id` är tomma. Läs dem ur kampanjen och skriv in, så nästa bygge inte gissar. | produktfilen, 2026-09-11 |

---

## Koncept

| Idé | Varför den kan funka | Källa |
|---|---|---|
| **Chokladkonflikten som ren stillbild, ny bild** — samma copy som `PD_2_1`, ny visuell: kartongen bredvid ett tomt chokladomslag | `PD_2_1` är produktens bevisade vinnare (1 376 kr, ROAS 3,85, 8 köp) och det är BILDEN som skalar här. Isolerar variabeln visuell stil. | winning line: `Adventskalender_PD_2_1`, ärvd historik 2026-09-11 |
| **PD-hooken som video med ny öppning** — "Den 24 december: 24 bilar på bordet. Chokladkalendern: en tom kartong sedan den 3:e." | `PD_2_H1` har högst CVR i källan (4,92 %) men lägre CTR än bilden. Hypotes: en hook som visar slutresultatet först lyfter klicket utan att tappa konverteringen. Isolerar variabeln hook. | winning line: `Adventskalender_PD_2_H1` |
| **Recensionsvinkel (SP) på riktig text** — "Sonen längtar till varje dag" / "ett bra alternativ till godis" ordagrant ur Judge.me | Källans SP bygger på ett citat ingen sagt och 30-dagarslöfte som inte gäller. Tio riktiga femstjärniga omdömen finns. Vinkeln är oprövad (45 kr) — helt ny hypotes. | produktfilens `reviews` (10 st, 2026-09-10) + playbook social proof |
| **Presentvinkeln med leveranstid som skäl** — "Beställ före den X så ligger den under granen" | `GT_1_H1` har källans bästa hook (32 %) men CPA 297 kr. Hypotes: den saknar ett skäl att köpa nu; leveranstiden 5–10 arbetsdagar är ett SANT skäl, till skillnad från "bara idag". | `Adventskalender_GT_1_H1` (594 kr, 2 köp) + `docs/copy-regler.md` |
| **Könsneutral variant av PD** — "Ge henne/honom" → "Ge barnet" eller ingen pronomen | Brandet får inte låsas vid pojkar (`kalender.yaml` branding). Bevisad copy säger "honom". EN isolerad variabel mot originalet. | `factory/output/kalender/BRAND.md` — **gissning** tills den mäts |
| **Erbjudandet utan brådska (CS)** — "499 kr. Jämförpris 649 kr. Fri frakt." | Källans CS är falsk brådska och får inte köras. Vinkeln (pris i sek 0–3) är bevisad på HeimGuard (`CS_3`, ROAS 3,02) men inte på den här produkten. | playbook (pris tidigt) — **gissning** för den här produkten |
| **Morgonrutinen** — "Klockan sju, första december. Så här ser det ut vid vårt köksbord." | Brandets kärnscen (`BRAND.md`: köksbordet, morgonljus). Ingen källannons har den. Tre av tio recensioner nämner morgonen ("varje morgon", "längtar till varje dag"). | `BRAND.md` + recensioner — **gissning** (0 kr data) |
