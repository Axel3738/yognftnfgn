# NO-videobatch 2026-09-03 — status

Rutin: `/translate-no` (`.claude/skills/translate-no/SKILL.md`). Källa: Drive-mappen
LAUNCHED (`1-vbYhYgTEv7zYptW5rGmgKAITmAz4l1X`).

## Inventering (Fas 0)

22 produktmappar i LAUNCHED (exkl. WINNERS/LOSERS/MAKE TO NORWAY). Live-koll i
Meta (`act_1050941584152547`, 24 kampanjer totalt) + rekursiv listning av
MAKE TO NORWAY (inkl. undermappen WINNERS) visade att **19 av 22** redan var
täckta — antingen en `NO <namn>`-mapp (7 st: Bälteslipmaskin, Cykelshorts,
Damasker, IBC, Jättefotboll, Kranskydd, Övervakningskamera) eller en kampanj i
kontot (10 st, launchade 2026-09-02 av en tidigare körning som inte loggades i
den här filen: Sysett/Magnethylle/Kryss og Bolle/Kamuflasjeteip/Plysjtøfler/
MC-Trekk/Kast & Fang/Gravsteinspenn/Båtmotortrekk/Badeshorts).

**3 kandidater** kvar, bokstavsordning: Bordtennisnät Infällbart, Medicinask i
Fickformat, Smiley face trash can stickers.

## Resultat

| Produkt | Läge | Orsak |
|---|---|---|
| Bordtennisnät Infällbart | ⚠️ Överhoppad | Norsk sida finns (`bordtennisnett-uttrekkbart-…`), men INGEN Norge-kostnad i något av batch-sheet #1–#5.1 — sheeten har bara en annan produkt ("Bordtennistränare – Pingis Utan Bord"), inte denna. Problemmeddelande skickat till #problems-no. |
| Medicinask i Fickformat | ✅ Launchad ACTIVE | Se nedan. |
| Smiley face trash can stickers | ⚠️ Överhoppad | Finns inte på beverbutikken.no (167 produkter kontrollerade, ingen träff). Problemmeddelande skickat till #problems-no. |

Ingen kö till i morgon — de tre kandidaterna är nu antingen klara eller
blockerade på ett faktiskt Axel-beslut (butikssida saknas / COGS saknas).

### Medicinask i Fickformat → Medisinboks NO

⚠️ **Produkten hade INGA annonsvideor i Drive-mappen** — bara 4 bildannonser
(CS/G/PD/SP `_2_1.png`) + 4 ADCOPY-docs. Hela Fas 1/2 (proofread, HeyGen,
captions) utgick därför — noll HeyGen-krediter förbrukade (kvot oförändrad
22 731 → 22 731). Fas 3.2 (bildannonser) + Fas 3 (launch) kördes komplett med
en ny, dedikerad `no-image-launch.mjs` (samma struktur/enhancements som
video+bild-flödet, men utan videoberoendet).

- **Pris:** 219 kr (var 285 kr = 23,2 % rabatt). CS-bilden claimar "24 % RABATT"
  → jämförpriset höjt till 289 kr i Shopify NO (`tools/shopify-fix-compareat.mjs
  --market NO`) per prispolicyn, så claimen stämmer (24,2 % verklig rabatt).
- **COGS:** batch-sheet #5.1, "Pocket pill box, 7 compartments", NORWAY-blockets
  Total ex. tax Qty 1 = 7,92 EUR × 10,80 NOK/EUR (ECB-dagskurs) = 85,54 NOK.
  BE-ROAS = 219/(219−85,54) = **1,64**.
- **Bilder:** Kie AI (`google/nano-banana-edit`) rensade svensk text ur CS/PD/SP
  (G hade ingen text, kopierades orörd). Norsk text målad deterministiskt med
  PIL (`compose-no.py`). Alla 4 QA-godkända — inget svenskt kvar.
- **Copy:** norsk adcopy + bildtext skriven av sonnet-subagent ur de svenska
  ADCOPY-docsen, tre-frågorstestet redovisat (de flesta rader 1-2/3 — ren
  lokalisering av redan godkänd svensk copy, inga nya rader). Ingen fri frakt
  nämnd (219 kr < 300 kr-gränsen). "30 dagers åpent kjøp" bekräftat OK-claim.
- **Levererat:** 4 png i chatten. Drive: MAKE TO NORWAY → "NO Medicinask i
  Fickformat" (skapad via Google-Drive-connectorn — **fanns tillgänglig i den
  här rutinkörningen**, se anteckning nedan) — 4 png + 4 adcopy-txt uppladdade
  via `drive-push.mjs`.
- **Launchad ACTIVE:** kampanj-ID 120252062027980233, "Medisinboks NO |
  BE-ROAS 1,64 | 2026-09-03", CBO 1000 kr/dag. 4 adsets (CS/G/PD/SP), 1
  bildannons vardera, alla ACTIVE. API-verifierat: kampanj ACTIVE, alla 4
  adsets ACTIVE, alla 4 annonser ACTIVE, alla länkar → beverbutikken.no.

⚠️ **Anteckning till CLAUDE.md-varningen om rutiners MCP-verktyg:** den här
körningen (Routine, `/translate-no`) HADE `mcp__Google-Drive__*`-verktyg
tillgängliga (använde `create_file` för att skapa NO-mappen). Alltså minst en
konfiguration av rutinen ärver Drive-connectorn — avviker från nattrutinens
("Ad upload and structure") observerade `allowed_tools` utan `mcp__*`. Två
olika rutiner, inte nödvändigtvis samma beteende.

⚠️ **Nytt verktyg skapat:** `pipeline/no-image-launch.mjs` — samma
struktur/enhancements som `no-video-launch.mjs`+`no-image-ads.mjs` men för
produkter helt utan video. Konfig: `pipeline/waves/no-<produkt>-image.config.mjs`
(se `no-medicinask-image.config.mjs`).

## Efterarbete 2026-09-03 (Axels beslut, huvudsessionen)

- **Medisinboks NO (120252062027980233) PAUSAD** på Axels beslut: produkten har inga
  annonsvideor (varken i Drive eller i SE-kontot), och en kampanj med bara 4 bilder
  ska inte ligga uppe. Ny regel i `/translate-no` Fas 0: inga videor = ingen launch.
- **Drive-leveransen för de tio produkterna från 2026-09-02 är gjord.** Körningen
  09-02 skapade inga NO-mappar utan bad Axel göra det (fel — regeln är nu att
  rutinen skapar mapparna själv via Drive-connectorn). Mapparna skapades av
  huvudsessionen och fylldes ur Meta-kampanjerna med `pipeline/no-drive-fran-meta.py`
  (videor via kontots advideos-kant matchade på titel, bilder via adimages, adcopy
  ur object_story_spec — inget renderades om, 0 krediter). Resultat i MAKE TO NORWAY:
  NO Badshorts 19 filer (12 mp4 + 3 png + 4 txt) · NO Båtmotorskydd 20 ·
  NO Gravstenspenna 20 · NO Kamouflagetejp 20 · NO Kasta & Fånga-set 19 (11 mp4) ·
  NO Luffarschack 20 · NO Magnethylla 20 · NO Motorcycle cover 20 ·
  NO Plyschtofflor 20 · NO Sömnadskit 15 (9 mp4 + 3 png + 3 txt). Inga fel.
- Tidsbudget 4 h + parallell körning inskrivet i rutinen efter 18-timmarskörningen.

## Smiley face trash can stickers → Klistremerker til Søppeldunken (Axels order i chatten 2026-09-03)

Norska sidan publicerades 08:21 (efter nattens koll) — Axel skickade länken och bad
rutinen köra produkten direkt.

- **Källa:** Drive-mappen i LAUNCHED: 12 videor (CS/G/PD/SP × 3, `…_CS_2 .mp4` felnamnad
  i Drive) + 4 bildannonser (utan `_2_1`-suffix) + 4 ADCOPY-docs + REVIEW-sheet (rörs inte).
- **Pris:** 199 kr (var 259 kr = 23 %). CS-bilden claimar "50 % RABATT" → jämförpriset höjt
  259→398 kr i Shopify NO per prispolicyn (`tools/shopify-fix-compareat.mjs --market NO`).
  Josh's README i Drive säger "never write a % discount" för NYA annonser — den befintliga
  CS-bilden har ändå 50 %, så den lokaliserades oförändrad enligt prispolicyn.
- **COGS: SAKNAS.** Produkten finns inte i något av batch-sheet #1–#5.1 (alla fem lästa i
  sin helhet via Drive-connectorn, 0 träffar på sticker/klisterm/soptunn/tecknade/cartoon).
  `products/soptunneklistermarkena/` som README pekar på finns inte i main eller någon gren.
  → Ingen BE-ROAS, **ingen launch** än. Axel tillfrågad i chatten (tre gånger).
- **Videor:** proofread 12/12 → SRT-lokalisering (sonnet-subagent): dagslöften → lagerurgency,
  "norske/svenske familier" → generaliserat, søppelbøtte/-kasse/søpla → søppeldunk (butikens
  namn), prisuttal normaliserat (hundre og nittini), förvanskade rader (CS_3 b1, G_2 b8) lagade.
  `verify-srt.py` grön (12/12, timecodes identiska). Apply → render → download 12/12.
  Captions `pipeline/no-captions.py`, standardband (textscan: alla 12 y≈1396–1488), exit 0 ×12.
  **36 QA-bilder lästa + slutkortssvep 12/12: inget svenskt, ingen svensk domän/pris.**
  Kvot 22 731 → 22 265 (466 krediter, ~5,7 videominuter).
- **Bilder:** Kie-rensning i två omgångar — första prompten tog bort de tecknade ansiktena
  (= produkten); omkörning med "keep the cartoon faces" för CS/PD/SP. PIL-komposition
  (`stickers/compose-no.py`), 4/4 QA-godkända.
- **Levererat:** 12 mp4 + 4 png i chatten. Drive: MAKE TO NORWAY → "NO Smiley face trash can
  stickers" (`1VUJCD-biIIuLrGxCv-FNSojwpzTUovs9`, skapad via Drive-connectorn): 4 png +
  4 adcopy-txt uppladdade, 12 mp4 uppladdas via drive-push.
- **Launch:** vågkonfig `pipeline/waves/no-stickers-video.config.mjs` klar med `__BEROAS__`
  som platshållare. Körs så fort Norge-kostnaden finns.
