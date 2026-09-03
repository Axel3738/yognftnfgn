# Batch-log — Gravstenspennan

## Upphämtning (retroaktiv, 2026-08-29 → 2026-09-03) — före batch #1

Ingen brief/hypotes loggades i förväg för de befintliga 17 annonserna (produkten
launchades innan produktminnessystemet fanns). Rekonstruerat 2026-09-03 ur
Meta-data + Notion-testcenter-sidan ("Gravstenspenna", Product test center SE
BÄVER).

| Annons | Format | Koncept | Spend | Köp | ROAS | hypotes |
|---|---|---|---|---|---|---|
| Gravsten_CS_1 | Video | Clearance Sale | 779,15 kr | 5 | 2,64 | ej loggad (retroaktiv rekonstruktion) |
| Gravsten_CS_2 | Video | Clearance Sale | 1 667,62 kr | 6 | 1,31 | ej loggad (retroaktiv rekonstruktion) |
| Gravsten_CS_3 | Video | Clearance Sale | 1 055,79 kr | 2 | 0,91 | ej loggad (retroaktiv rekonstruktion) |
| Gravsten_CS_2_1 | Statisk | Clearance Sale | 477,77 kr | 4 | 3,64 | ej loggad (retroaktiv rekonstruktion) |
| Gravsten_PD_1 | Video | Demo | 406,75 kr | 0 | — | ej loggad (retroaktiv rekonstruktion) |
| Gravsten_PD_2/2_1/3 | Video | Demo | 169,23 kr (summa) | 0 | — | ej loggad (retroaktiv rekonstruktion) |
| Gravsten_SP_1/2/2_1/3 | Video | Social Proof | 135,98 kr (summa) | 0 | — | ej loggad (retroaktiv rekonstruktion) |
| Gravsten_G_1/2/2_1/3 | Video | Gift | 32,48 kr (summa) | 1 (brus) | — | ej loggad (retroaktiv rekonstruktion) |

**Utfall (verklig data, 2026-09-03):** Clearance Sale-konceptet driver 84 % av
spenden och 17 av 18 köp, blandad ROAS 1,75 (över break-even 1,60) men med stor
spridning mellan varianter (0,91–3,64). Demo, Social Proof och Gift har fått
minimal budget av algoritmen och är i praktiken otestade (0 köp på
respektive <600 kr).

## Batch #1 — 2026-09-03 (`/forsta-batch`-flödet, loggad som `CS_BATCH_KLAR`)

**Trigger:** `agent/rond.mjs` behov `ersatt` — "material pausat senaste veckan —
ersätt det som stängts av", grundat i kod `TRAPPA_STEG_1` (2026-08-31).
**Verifierat mot Meta 2026-09-03: ingen annons i kampanjen är PAUSED — alla 17
är ACTIVE.** Den loggade trappkoden beskrev själv att inget stängdes av
("ingen dominant annons att pausa"). Se `dna.md` FAS 1b för fullständig
motivering. Tolkat pragmatiskt: ersätter de facto-svaga varianterna
(`CS_2`, `CS_3`) och ger de otestade koncepten (`SP`, `G`) en riktig chans,
i stället för att röra Meta-status som ingen instruktion tillät ändå.

**Levererat:** 7 briefer — 3 video (nya hook-varianter: Clearance Sale, Demo,
Social Proof) + 1 statisk (Gift) + 3 BOF-statiska (pris/offer,
garanti/Klarna, invändning färg/mängd). **0 recensionsbilder** — 0 verifierade
Judge.me-recensioner för produkten (API-kontrollerat 2026-09-03), så serien
utgår helt denna batch.

Full FAS 0–6b-analys: se `dna.md`.

**Briefer i denna batch:**

| Annons | Format | Koncept | Hypotes / källa |
|---|---|---|---|
| Gravsten_CS_4_H1 | Video | Clearance Sale, ny hook | Ersätter de svaga `CS_2`/`CS_3`-hookarna. Återanvänder `CS_1`:s vinnande visuella idé (riktig gravsten i närbild) och rättar 40→50 % rabattfelet. Källa: kontots egna data + produktsidan. |
| Gravsten_PD_4_H1 | Video | Demo, ny hook | Nuvarande PD-hookar öppnar på ett text-kort, inte ett fysiskt objekt (CTR 0,72–1,79 %, lägst i kampanjen). Öppnar i stället på pennspetsen i den graverade skåran. Källa: `docs/hook-visual-rule-2026-08-04.md` + produktsidans egna fakta (fin spets, 6 nyanser, väderbeständig). |
| Gravsten_SP_4_H1 | Video | Social Proof → trygghet/garanti | SP är i praktiken otestat (136 kr, 0 köp), inte bevisat svagt — ges en riktig budget. Bytte bort testcenter-manusets overifierade kundcitat mot 30 dagars öppet köp + Klarna (verifierade fakta). Källa: produktsidan. |
| Gravsten_G_4_1 | Statisk | Gift | G är i praktiken otestat (32 kr). Behöll testcenter-manusets äkta idé (anhörig som sköter graven) men tog bort den overifierade "tårar i ögonen"-anekdoten. Källa: testcenter-manus (delvis) + produktsidan. |
| Gravsten_BF_1_1 | BOF-statisk | Pris/erbjudande | Rättar 40→50 % till korrekt rabatt. Källa: produktsidan (269/538 kr). |
| Gravsten_BF_2_1 | BOF-statisk | Garanti/trygghet | 30 dagars öppet köp + Klarna. Källa: produktsidan. |
| Gravsten_BF_3_1 | BOF-statisk | Invändning (färg/mängd) | 6 nyanser + 20 ml. Källa: produktsidan. |

**Naming:** upptagna ID:n avlästa innan numrering — CS_1/2/2_1/3, PD_1/2/2_1/3,
SP_1/2/2_1/3, G_1/2/2_1/3. Nya: CS_4_H1, PD_4_H1, SP_4_H1 (bumpat till nästa
lediga nummer inom respektive koncept, `_H1` för video), G_4_1 (statisk),
BF_1_1–BF_3_1 (ny BOF-serie för produkten).

**Videoandel:** 3 av 4 i kärnbatchen (CS, PD, SP video; G statisk) = 75 %,
över 2/3-kravet. BOF-serien räknas utanför kärnbatchen.

**Leverans:**
- Notion: ny hub **"Gravstenspenna creative hub"**
  (databas-id `3d0270ab-908c-81ca-bd04-c2acadd0b2e9`, data source
  `collection://fea270ab-908c-83f2-b390-874797ca5497`), duplicerad från
  "Creative hub MALL" (`3cc270ab-908c-8005-a50e-db6b1b179794`). Verifierad
  synlig i teamspacet Bäverbutiken via en teamspace-avgränsad
  `notion-search` (dök upp bland övriga kända hubbar). 7 items skapade,
  Status Draft, Typ Video/Image - Pending Approval, hela briefen inklistrad
  i varje sida (verifierat genom att öppna `Gravsten_CS_4_H1` och läsa
  tillbaka innehållet).
- Drive: ny mapp **Batch #1**
  (`https://drive.google.com/drive/folders/1hfq4bHJpCmhz7KUp-UFb2752kxJpM434`)
  skapad INUTI produktens befintliga mapp "Gravstenspenna"
  (`1xnqjyv-JSa2l9eMziNf_XgQZSidhU9tY`, ägd av joshnaelga146, ligger i
  `LAUNCHED`-mappen under `BÄVER/Products`) — INGEN ny produktmapp skapad.
  Batchmappen är tom (redigerarna fyller den när de klipper).
- Ingen Meta-status ändrad. Ingen budget rörd (kampanjen är i "Låt vara"-läge,
  7,9 % vinst, ronden gjorde redan sitt budgetbesked idag).

**Källor som INTE användes ordagrant (flaggade i dna.md):** testcenter-sidans
Social Proof- och Gift-manus innehåller overifierbara kundcitat/anekdoter.
Behölls INTE som riktiga citat. Sidan själv rördes inte (den är Axels/Joshs,
inte briefens att redigera).

**Copy/manus:** Agent-verktyget (subagent, regel 6) är inte tillgängligt i
den här sessionens verktygslista — samma begränsning som tidigare
batchagenter rapporterat idag. All copy ovan skrevs därför direkt av
huvudsessionen, med `docs/copy-regler.md` och tre-frågorstestet tillämpat
rad för rad (redovisat i varje brief). Avvikelse från regel 6 noterad
öppet, inte dold.
