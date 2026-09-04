# Batch-log — Kasta & Fånga-settet

## Upphämtning (retroaktiv, 2026-09-02 → 2026-09-04) — före batch #1

Ingen brief/hypotes loggades i förväg för de befintliga 15 annonserna
(produkten launchades 2026-09-02, innan detta produktminnessystemet byggdes
för denna produkt). Rekonstruerat 2026-09-04 ur Meta-data + Notion-
testcentersidan ("5.1 Kasta & Fånga-set", Product test center SE BÄVER).

| Annons | Format | Koncept | Spend | Köp | CTR | hypotes |
|---|---|---|---|---|---|---|
| Kastafanga_G_1 | Video | Gift | 605,62 kr | 0 | 2,56 % | ej loggad (retroaktiv rekonstruktion) |
| Kastafanga_G_2_1 | Statisk | Gift | 524,05 kr | 1 | 5,98 % | ej loggad (retroaktiv rekonstruktion) |
| Kastafanga_PD_1/2/2_1/3 | Video/statisk | Problem/Demo | 318,81 kr (summa) | 0 | 1,93–2,67 % | ej loggad (retroaktiv rekonstruktion) |
| Kastafanga_CS_1/2/2_1/3 | Video/statisk | Fejkad brådska | 257,67 kr (summa) | 0 | 0,93–2,67 % | ej loggad (retroaktiv rekonstruktion) |
| Kastafanga_SP_1/2/2_1/3 | Video/statisk | Fejkad social proof | 160,80 kr (summa) | 0 | 0–3,26 % | ej loggad (retroaktiv rekonstruktion) |

**Utfall (verklig data, livstid 2026-09-02 → 2026-09-04):** 1 998,93 kr
spend totalt, 1 köp, blandad ROAS 0,58 — under break-even 1,61.
Rondens huvudflöde stängde av kampanjen samma morgon (trappan,
potentialkollen föll: en vinnande annons fanns men ingen spendtjuv nådde
40 % av spenden med noll köp, alltså "ingen potential").

## Batch #1 — 2026-09-04 (`/forsta-batch`-flödet, loggad som `CS_BATCH_KLAR`)

**Trigger:** rondens behov `ersatt` — "material pausat senaste veckan —
ersätt det som stängts av". Kampanjen var redan PAUSED av rondens
huvudflöde tidigare samma dag (se dna.md). Ingen Meta-status ändrad av den
här körningen.

**Levererat:** 17 briefer — 6 nya videokoncept (olika persuasionsmekanismer:
identitet/stolthet, pain-solve, autencitet/UGC-testimonial, mekanik-
konflikt, äkta socialt bevis via format, ärligt värde/enkelhet utan fejkad
brådska) + 6 statiska (demo, jämförelse, testimonial, listicle, offer,
risk/cost-of-inaction — FAS 9:s fasta lista) + 3 BOF-statiska (pris/
erbjudande, garanti/frakt, invändning) + 2 recensionsbilder (riktiga,
verbatim citat).

Full FAS 0–6b-analys: se `dna.md`.

**Briefer i denna batch:**

| Annons | Format | Typ | Hypotes / källa |
|---|---|---|---|
| ThrowCatch_SO_1_H1 | Video | Gift, snabbare payoff | Fixar `G_1`s låga hold rate (12,8 %) genom att visa produkten/betalvinjetten inom 2 sekunder i stället för att bygga upp. Källa: kontots egen data. |
| ThrowCatch_PD_1_H1 | Video | Screen-time pain-solve, snabbare payoff | Samma fix på PD-konceptet (25,5 % hold rate). Källa: kontots egen data. |
| ThrowCatch_SP_1_H1 | Video | Äkta UGC-testimonial (talking head) | Ersätter SP-konceptets fabricerade "tusentals familjer"-påstående med en riktig presentör som bara säger sin egen upplevelse. Källa: copy-regler + ny idé (ingen tidigare video av denna typ fanns). |
| ThrowCatch_PD_2_H1 | Video | Mekanik-konflikt (aldrig tappa bollen) | Ny vinkel byggd direkt på det enda verifierade mekaniska faktumet (84 cm lina) i stället för emotionell inramning. Källa: produktsidans egna fakta. |
| ThrowCatch_SO_2_H1 | Video | UGC/POV format-transfer av Gift-budskapet | Samma bevisade budskap, rå handhållen stil i stället för polerad b-roll — ren formattest. Källa: kontots egen data (G-konceptet). |
| ThrowCatch_PD_3_H1 | Video | Snabb multi-miljö-montage, ärligt värde | Ersätter CS-konceptets fejkade brådska med samma "skynda dig"-känsla byggd på tempo, inte en lögn. Källa: copy-regler + produktsidans "redo på 30 sekunder". |
| ThrowCatch_PD_4_1 | Statisk (demo) | 3-stegs uppackningsdemo | FAS 9-krav (demo). Ingen ren "hur funkar det"-bild finns i kontot. Källa: produktsidans fakta. |
| ThrowCatch_PD_5_1 | Statisk (jämförelse) | Split-bild: tappad boll vs fångad boll | FAS 9-krav (jämförelse). Billig statisk version av mekanik-konflikten i PD_2_H1. Källa: produktsidans fakta. |
| ThrowCatch_SP_2_1 | Statisk (testimonial) | Format-transfer av `G_2_1` med RIKTIGT citat | Ersätter kontots enda tidigare "testimonial"-försök (`SP_2_1`, fabricerad recension) med ett verbatim citat ur den äkta recensionsfilen. Källa: `Kasta & Fånga-set_REVIEW` (Drive). |
| ThrowCatch_PD_6_1 | Statisk (listicle) | 4 verifierade produktfakta | FAS 9-krav (listicle). Källa: produktsidans fakta. |
| ThrowCatch_SO_3_1 | Statisk (offer) | Ärligt pris, ingen fejkad brådska | Direkt ersättning av `CS_2_1` (fejkad brådska, kampanjens näst sämsta annons) — samma riktiga rabatt (23 %), ärligt berättad. Källa: produktsidans pris + copy-regler. |
| ThrowCatch_PD_7_1 | Statisk (risk/cost-of-inaction) | "Ännu en sommar framför mobilen?" | FAS 9-krav. Vidareutveckling av PD-konceptets skärmtidsvinkel som en kostnad-av-att-inte-agera-ram. Källa: kontots PD-koncept. |
| ThrowCatch_SO_4_1 | BOF-statisk | Pris/erbjudande (retarget) | Källa: produktsidans pris. |
| ThrowCatch_SO_5_1 | BOF-statisk | Garanti/frakt | Källa: produktsidans garantitext (30 dagars öppet köp, fri frakt). |
| ThrowCatch_SP_3_1 | BOF-statisk | Invändning (hållbarhet) | Inga materialspecifikationer finns i vår data — löst invändningen med den verifierade garantin i stället för att hitta på materialfakta. Källa: produktsidans garantitext. |
| ThrowCatch_SP_4_1 | Recensionsbild | Linda Berg, verbatim | Källa: `Kasta & Fånga-set_REVIEW` (Drive-fil, 8 äkta recensioner). |
| ThrowCatch_SP_5_1 | Recensionsbild | Daniel Persson, verbatim | Källa: samma. |

**Naming:** engelskt produktnamn `ThrowCatch` (ett ord). Upptagna
`Kastafanga_*`-namn i kontot följer INTE `/forsta-batch`-namnkonventionen
(inget AD ID-löpnummer, koncept G/CS/SP/PD i stället för PD/SP/SO) — ny
sekvens startad rent: PD 1–7, SP 1–5, SO 1–5, ingen kollision med
befintliga namn.

**Videoandel:** 6 av 12 i kärnbatchen (video+statisk exkl. BOF/recension)
= 50 %. **Under 2/3-kravet** — flaggat öppet: FAS 8/9 anger fasta antal
(6 video + 6 statisk, varav statisk-listan är låst till sex specifika typer
av `forsta-batch.md`), vilket ger exakt 50/50 i kärnan innan BOF/recension
läggs på. Nästa brief-runda bör vikta mer mot video — `rond-auto.md` 4b
säger "minst två tredjedelar av varje batch är video".

**Leverans:**
- Notion: ny hub **"Throw and catch set creative hub"**
  (databas-id `3d1270ab-908c-8180-bad7-d625976be83a`, data source
  `collection://d66270ab-908c-82fd-8040-07dc00c4fc84`), duplicerad från
  "Creative hub MALL" (`3cc270ab-908c-8005-a50e-db6b1b179794`). Placering
  verifierad genom mönsterjämförelse mot en känd, tidigare bekräftad hub
  ("Belt grinder creative hub") — identisk tom `<ancestor-path>` i båda,
  samma mönster som är dokumenterat verifierat 2026-08-30. 17 items
  skapade, Status Draft, Typ Video/Image - Pending Approval, hela briefen
  inklistrad i varje sida (verifierat genom att öppna
  `ThrowCatch_SO_1_H1` och läsa tillbaka fullständigt innehåll).
- Drive: ny mapp **Batch #1**
  (`https://drive.google.com/drive/folders/1BotXInKJ4XoBb3MVvD4_sTYOYFMAYvb3`)
  skapad INUTI produktens befintliga mapp "Kasta & Fånga-set"
  (`1YUVklEJDjq7kR3Pjkhq9uZU68sRa29iy`, ägd av joshnaelga146) — INGEN ny
  produktmapp skapad. 17 undermappar skapade, en per annons, tomma
  (redigerarna fyller dem).
- Ingen Meta-status eller budget rörd. Kampanjen förblir PAUSED — det var
  rondens huvudflödes beslut tidigare samma dag, inte den här körningens
  att ändra.

**Kritiska QC-fynd (redovisade i dna.md):** `Kastafanga_CS_2_1` använder
påhittad brådska ("Lagret nästan slut", "idag endast"). `Kastafanga_SP_2_1`
använder en FABRICERAD recension ("Verifierad kund, 34 år" — citatet finns
inte bland produktens 8 riktiga recensioner). Ingen av dessa rördes i
kontot (ingen Meta-ändring gjordes), men flaggas här och i dna.md så att
nästa runda vet att inte upprepa mönstret.

**Copy/manus:** Agent-verktyget (subagent, regel 6) var inte tillgängligt
i den här sessionens verktygslista trots sökning (`ToolSearch`) — samma
begränsning som andra batchagenter rapporterat samma vecka. All copy ovan
skrevs därför direkt av huvudsessionen, med `docs/copy-regler.md` och
tre-frågorstestet tillämpat rad för rad (redovisat i varje brief i
Notion). Avvikelse från regel 6 noterad öppet, inte dold.
