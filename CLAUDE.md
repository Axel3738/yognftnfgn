# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Språk

Allt i repot är på svenska — kod, kommentarer, commit-meddelanden, CLI-utskrift och
dokumentation. Skriv nytt på svenska. Undantaget är `basePrompt` i pipeline-vågorna,
som är på engelska för att bildmodellen ska förstå dem.

## Två fristående Node-projekt

Ingen monorepo-verktygskedja, inget rotpaket. `dashboard/` och `pipeline/` är två
separata ESM-projekt (`.mjs` överallt) med varsin `package.json`. Kör alltid
kommandon från respektive katalog.

| | `dashboard/` | `pipeline/` |
|---|---|---|
| Vad | Redigerarpanel: mäter ledtider/revisionsgrad ur Notion, bygger en HTML-fil, postar i Slack | Genererar bildannonser (Higgsfield-bas + skarp textoverlay) |
| Beroenden | **Noll** — bara Node-stdlib | `sharp`, `@higgsfield/client` |
| Kräver | `NOTION_TOKEN`, valfritt `SLACK_BOT_TOKEN` / `SLACK_WEBHOOK_URL` | `HF_API_KEY`, `HF_SECRET` |

`docs/` är levande arbetsdokument (namnkonvention, ad-tracker, punchline-bank), inte
API-dokumentation — men `docs/naming-convention.md` är normativ: annonsnamnen i
`pipeline/waves/*.mjs` måste följa den, annars går datan inte att skära per variabel.

## Kommandon

```bash
# dashboard/
node test.mjs                                    # hela sviten (27 tester, tyngdpunkt på tidsmatematiken)
node cli.mjs check-notion                        # felsök token + vilka hubbar integrationen släpps in i
node cli.mjs ingest notion-all                   # hämta alla rader + kommentarer från alla hubbar
node cli.mjs build                               # → dist/dashboard.html
node cli.mjs stats                               # samma siffror i terminalen
node cli.mjs seed --force && node cli.mjs build  # demodata när man vill se panelen med full historik
node cli.mjs purge-demo                          # rensa demoraderna igen
node cli.mjs slack digest --dry-run              # skriver ut Block Kit-JSON utan att posta

# pipeline/
npm install
npm run dry                                      # förhandsgranska layout utan Higgsfield (charcoal-bakgrund)
node run.mjs --wave=01 --only=authority --limit=2 # skarpt, filtrerat på namn
```

`test.mjs` har ingen filtrering per test — kör hela sviten, den tar under en sekund.
Alla ingest-kommandon och Slack-kommandon tar `--dry-run`.

## Dashboardens arkitektur

Kedjan är enkelriktad och varje steg är utbytbart:

```
Notion / CSV / manuell logg
   → src/ingest/*        händelser
   → data/events.jsonl   append-only JSONL, enda sanningen
   → store.foldTasks()   händelser → tasks
   → metrics.mjs         ren funktion, ingen I/O
   → render.mjs          en självständig HTML-fil (inga CDN:er, funkar offline)
```

Fyra beslut som styr all kod och som är dyra att bryta mot:

**1. Allt härleds ur händelseloggen.** `metrics.mjs` vet aldrig var datan kom ifrån.
Ny datakälla = ny fil i `src/ingest/` som producerar händelser av typerna i
`EVENT_TYPES`. Rör inte metrics för att stödja en källa.

**2. Ingest är idempotent.** `mergeEvents` dedupar på `task_id|type|round`. Pollern
får köras hur ofta som helst. `ingest notion-all` går ett steg längre och *bygger om*
alla händelser med `source` `notion-import`/`notion-comment` från grunden vid varje
körning — annars lever en felklassad eller borttagen kommentar kvar för alltid.
Händelser från CSV, pollern och `log` rörs inte.

**3. Notion har ingen statushistorik.** Det är hela problemets kärna.
`Godkänd datum` är ifyllt på 2 av 199 rader. Därför finns händelsetypen `observed`:
den sätter en tasks tillstånd *utan tidpunkt*, räknas aldrig som en leverans och ger
aldrig en ledtid. **Hitta aldrig på tidsstämplar för att fylla ett tomt fält.**
De enda äkta tiderna i Notion är `createdTime` och kommentarernas `datetime` —
`src/ingest/notion-comments.mjs` är därför den enda källan till riktiga ledtider,
med den inbyggda skevheten att alla inte kommenterar (täckningsgraden räknas per
person och visas bredvid siffrorna).

**4. Alla tider räknas i arbetstid, inte kalendertid.** `src/time.mjs` är
tyngdpunkten i testsviten: fönster ur `config.json` (09–18, mån–fre, lunch,
Europe/Stockholm), DST hanterad via två-passräkning i `instantFromWall`. Använd
`businessMinutes()` — aldrig rå tidsdifferens.

Trösklarna i `config.json` är **absoluta, inte relativa**: den sämsta i gruppen blir
inte röd för att den är sämst. Annars är alltid någon röd och panelen blir ett
mobbningsverktyg. `includeTypes` avgör vad som ens räknas som en annons (allt annat i
hubbarna är dokumentation och stödsidor); `statusMap`/`STATE_BY_STATUS` speglar
Notions statusnamn *inklusive stavfelen* — de är medvetna.

Att lägga till en hub: en rad under rätt `workspaces[].hubs` i `config.json`. Fliken i
panelen dyker upp av sig själv. Tomma teamspaces får ingen flik.

## Pipelinens arkitektur

Två steg, för att bildmodeller är dåliga på text: Higgsfield Soul genererar en
fotorealistisk bas med medvetet mörk tomyta (`higgsfield.mjs`) → `compose.mjs` lägger
rubrik/badge/footer som SVG-vektortext ovanpå via `sharp`. Lines:en blir pixelperfekta.

En ny annons = ett objekt i `waves/wave-XX.mjs` med `name` (enligt namnkonventionen),
`basePrompt` (engelska, lämna mörk tomyta där texten ska ligga) och `overlay`.
Färger, typsnitt och canvas ändras på ett ställe: `brand.mjs`. Output hamnar i
`output/wave-XX/` (gitignorerad) med ett `_manifest.json`.

**Katalogen har två parallella stilar — blanda inte ihop dem.** Vågsystemet ovan är
det generella; vid sidan av det ligger fyra fristående engångsskript som varken går
via `run.mjs` eller läser `brand.mjs`, utan hårdkodar egen canvas, egen palett och en
egen `wrap()`-hjälpare var:

| Skript | Vad | Status |
|---|---|---|
| `b020-format.mjs` | Kontots bäst presterande static-format (ROAS 2,53). Egen CLI: `--left/--right/--headline/--footer/--pill/--out` | Värt att utgå från för nya varianter |
| `swipe.mjs`, `swipe2.mjs` | Två layoutförsök för prishöjningsannonsen, hårdkodad copy | Engångs |
| `grab.mjs` | Hämtar källbilder från Shopify-CDN till `assets/` + kontaktkarta | Hjälpskript |

`compose.mjs` är den enda filen som importerar `brand.mjs`. En ändring i brandkittet
slår alltså **inte** igenom i de fyra skripten ovan.

## Drift och gotchas

- **`dashboard/data/events.jsonl` är gitignorerad men ändå spårad i git.** GitHub
  Actions-workflowet (`.github/workflows/redigerarpanel.yml`) `git add -f`:ar den
  varje timme så att ledtiderna byggs upp över tid — utan det börjar mätningen om
  vid varje körning. Ta inte bort den ur spårningen, och räkna med att `git pull`
  ofta drar in "Uppdatera händelselogg"-commits.
- Workflowet kör `check-notion → ingest notion-all → build → stats → commit →
  Pages`. Publiceringssteget får misslyckas (`continue-on-error`); ingest får inte.
- `NOTION_TOKEN` ligger som GitHub-secret. Lokalt i `dashboard/.env` (gitignorerad) —
  `export $(cat .env | xargs)` gäller bara i det terminalfönstret, vilket är den
  vanligaste orsaken till att `check-notion` säger att token saknas.
- Notion-anropen stryps till ~3/s och backar av vid 429. Ett par hundra sidor tar
  några minuter — det är normalt, inte en hängning.
- `data/editors.json` mappar Notion-användar-id → namn/roll/slack-id/tidszon.
  Saknas någon dyker "Okänd" upp i panelen; `ingest notion-all` skriver ut vilka.
- **`swipe.mjs` och `swipe2.mjs` importerar `axios` utan att det står i
  `pipeline/package.json`.** Det funkar bara för att `@higgsfield/client` drar in det
  transitivt och npm hoistar det. Deklarera det explicit om du rör de filerna, annars
  går de sönder den dag Higgsfield-klienten byter HTTP-bibliotek.
- Färgordningen i `render.mjs` (`SERIES`, `PIPELINE`) är en färgblindhetsmekanism,
  inte dekoration — rotera den inte. Status bärs alltid av ikon **och** text, aldrig
  färg ensam, och varje diagram har en tabellvy.
