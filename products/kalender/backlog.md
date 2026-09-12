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
| ~~`kalender.yaml` släpar efter kontot på norskt pris~~ **KLART 2026-09-12** | Shopify har 439 NOK / jämförpris 579 NOK som fast pris (prislista "Norge NOK"), verifierat som norsk kund. `kalender.yaml` → `valuta: NOK`, produktfilen → `no_pris_nok: 439`. | Axel 2026-09-12 "439 i Shopify"; Admin-API |
| **NOK-paketnivåer** | I norska vyn visar paketen SEK-räknade tal (848,30 / 798,40 kr för 2 st) bredvid 878 kr (2 × 439). Samma öppna steg som CaraShell (PROCESS.md punkt 15–16) — byggs inte av nattvakten. | mätt 2026-09-12 som norsk kund |
| ~~Kampanjstruktur (CBO vs test-ABO)~~ **AVGJORT 2026-09-12: B** | CBO:n står kvar, inget test-ABO. Bevaka om PD_2_1 / PD_2_H1 får spend efter pausen av PD_1_H1. | Axels beslut 2026-09-12 |
| **Brådskan i NO-CS-copyn** | "i dag", "begrenset lager", "før den er utsolgt" strider mot brandets ton (inga utropstecken, ingen nedräkning). Axel beslutade 2026-09-11 att inget pausas — ersätt med lugn variant i nästa NO-batch i stället. | kontot 2026-09-11; `kalender.yaml` branding |
| **`kalla.no_kampanjmonster` i produktfilen** | `kallannonser.mjs` faller tillbaka på `gamasj\|damask` (DryTrek) när fältet saknas och läser fel produkts norska historik. Sätt fältet (eller gör defaulten till ett stopp) före nästa `/ny-annonser` för en kalender. | `factory/kallannonser.mjs` rad 163, mätt 2026-09-11 |
| **Ny leverantörslänk** | COGS kvitterad 2026-09-11 (142,27 kr + 3 EUR tull/order). Men Temu-länken i produktfilen svarar "discontinued" — ny leverantör krävs före inköp. | `factory/produkter/adventskalender-racingbilar.yaml` |
| **Bonusprodukt (Q4-ramverket)** | `offer.bonus_produkt` tomt, paketen körs utan gratisdel. Ägarens val. | `factory/state/kalender--adventskalender-racingbilar.json` |
| **Sida och pixel i produktfilen** | `meta.page_id` / `meta.pixel_id` är tomma. Läs dem ur kampanjen och skriv in, så nästa bygge inte gissar. | produktfilen, 2026-09-11 |

---

## Koncept

⚠️ **Hubben bar redan 20 rader när batch #2 briefades (läst 2026-09-12):**
Bäverbutikens `/cs`-briefer för samma produkt följde med flytten (prefix
`Adventskalender_`): PD_4/5/6/7, CO_1/2, BF_1/2/3, RI_1 (+RI_1_1), RV_1/2,
TR_1/2, LI_1, UG_1, AU_1, FM_1, CS_4. Flera backlog-idéer var därmed redan
briefade av någon annan — de markeras "täckt av hubbraden" och briefas inte igen.

| Idé | Varför den kan funka | Källa | Läge |
|---|---|---|---|
| **Chokladkonflikten som ren stillbild, ny bild** — kartongen bredvid ett tomt chokladomslag | `PD_2_1` är produktens bevisade vinnare (1 376 kr, ROAS 3,85, 8 köp) och det är BILDEN som skalar här. | winning line: `Adventskalender_PD_2_1` | **täckt av hubbraden `Adventskalender_CO_2_1`** (split-bild: tom chokladkalender i soporna mot vår kartong). Sockerversionen briefad som `AdventLaneRacing_SO_1_1` [använd i batch #2] |
| **PD-hooken som video med ny öppning** — slutresultatet först | `PD_2_H1` har högst CVR i källan (4,92 %) men lägre CTR än bilden. | winning line: `Adventskalender_PD_2_H1` | **täckt av hubbraden `Adventskalender_FM_1_H1`** ("Dag 1: en bil. Dag 24: ett garage", To be Reviewed). Hook-bytet med tomt omslag först briefat som `AdventLaneRacing_PD_2_H2` [använd i batch #2] |
| **Recensionsvinkel (SP) på riktig text** | Tio riktiga femstjärniga omdömen finns. | produktfilens `reviews` + playbook social proof | **täckt av hubbraderna `RV_1_1`, `RV_2_1`, `TR_1_H1`, `TR_2_1`** (recensionskort + testimonial på verifierade citat) |
| **Presentvinkeln med leveranstid som skäl** | Leveranstiden 5–10 arbetsdagar är ett SANT skäl. | `Adventskalender_GT_1_H1` + `docs/copy-regler.md` | **täckt av hubbraderna `RI_1_H1` (In progress) + `RI_1_1`** |
| **Könsneutral variant av PD** — inget pronomen | Brandet får inte låsas vid pojkar. EN isolerad variabel mot originalet. | winning line `PD_2_H1` + `BRAND.md` | **[använd i batch #2]** → `AdventLaneRacing_PD_8_H1` |
| **Erbjudandet utan brådska (CS)** | Pris i sek 0–3 bevisat på HeimGuard, inte här. | playbook — **gissning** för produkten | **täckt av hubbraderna `CS_4_1`, `BF_1_1`, `PD_6_H1`** |
| **Morgonrutinen** — "Klockan sju, första december." | Brandets kärnscen. Tre av tio recensioner nämner morgonen. | `BRAND.md` + recensioner — **gissning** (0 kr data) | **[använd i batch #2]** → `AdventLaneRacing_MR_1_H1` |
| **Syskonbråket → 2-pack** — två barn, en lucka | Verklig AOV 632 kr mot pris 499 kr i källan: paketen säljer. Konflikten ger paketet ett skäl utan rabattpitch. ⚠️ Paketpriserna A/B-testas live (2 st 848,30 / 798,40 kr, mätt 2026-09-12) — inget paketpris i copy. | källkontots AOV (ärvd data 2026-09-11) | **[använd i batch #2]** → `AdventLaneRacing_SY_1_H1` |
| **Från farmor och farfar** — givaren i orden | GT-vinkeln (594 kr, 2 köp, hook 32 %) pekar på fel givare; mor-/farföräldrar köper adventskalendrar. | `Adventskalender_GT_1_H1` under grinden — **gissning** | **[använd i batch #2]** → `AdventLaneRacing_FF_1_1` |
| **Den 25 december** — chokladkalendern i återvinningen, bilarna på golvet | Det bevisade löftet "kvar den 24:e" flyttat en dag: nyttan blir fysisk (bilarna följer med i leken). | winning line PD + Sofia: "Bilarna blev snabbt favoriter." | **[använd i batch #2]** → `AdventLaneRacing_EF_1_1` |

### Väntar på nästa batch (inte briefade än)

| Idé | Varför | Källa |
|---|---|---|
| **Textfri produktbild** — öppnad kalender med bilar, ingen text i bild, PD-copyn i copy card | Variabeln textmängd är otestad; `PD_2_1`:s textmängd är inte läst ur kontot än (kräver bildnedladdning). | winning line `PD_2_1` — läs bilden först |
| **"Alternativ till godis" som hook** — Saras recension ordagrant | Tre av tio recensioner säger det självmant. Skiljer sig från RV/TR (som citerar andra rader). | produktfilens `reviews` — kolla RV_1/RV_2:s citat först så det inte dubbleras |
