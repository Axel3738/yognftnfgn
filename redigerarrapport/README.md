# Veckorapporten till redigerarna

Varje måndag får varje redigerare ett eget Discord-meddelande i en privat kanal:
vilka av hennes klipp som gick bäst förra veckan, utfallet (breakthrough, spend
winner, KPI winner, loser, ingen leverans), varför det kan ha blivit så, och ETT
litet action item till torsdag. Axels beställning 2026-10-02. Planen, reglerna
och mallen: `PLAN.md`; kursens svar: `docs/os/evolve/SVAR.md` → "Veckorapporten
till redigerarna"; kommandot: `.claude/commands/redigerarrapport.md`.

```bash
node redigerarrapport/kor.mjs                        # torrt: posterna som filer i output/<vecka>/
node redigerarrapport/kor.mjs --vecka 2026-W39 --cache   # en vald vecka, hubbarna ur cachen
node redigerarrapport/kor.mjs --discord              # rutinen: postar + skriver minnet i data/
node --test redigerarrapport/test/*.test.mjs         # 71 tester, utan nät
```

Kräver `NOTION_TOKEN` (hubbraderna) och `DISCORD_BOT_TOKEN` (posten). Läser
aldrig Meta själv och skriver aldrig i Notion.

## Delarna

| Fil | Gör | Återanvänder |
|---|---|---|
| `kallor.mjs` | Etiketterna ur `matstrumpor/logg.jsonl` och `agent/budgetlogg.jsonl` (grenen `claude/daily-agent-discussion-uos5df`, via `git fetch --depth 1` + `git show`, ~1 s, cachad i `output/`) till EN radform; grinden räknas om till 300 kr OCH 3 köp | `matstrumpor/etikett.mjs` RANG, `stonebite/data.mjs` kampanjTillhor |
| `hubbar.mjs` | Alla hubbar integrationen ser (39 kandidater, 26 lästa, 13 hoppade med orsak), alla rader med Ansvarig oavsett status, Jerzee via kommentar; cache `output/hubbar.json`; ~55 s utan kommentarssteget, ~5 min med | `tools/notion-kalla.mjs`, `commission/notion.mjs`, `commission/kommentarer.mjs` |
| `namn.mjs` + `no-prefix.json` | Kontots namn → hubbradens: marknadskod, CaraShells speglar (+100), 46 NO-prefix med belägg, Matstrumpors arbetsnamn ur loggens UPPLADDAD/OMDOPT | `commission/koppling.mjs`, `tools/ops-spegla.mjs`, `factory/opsmarknader.mjs` |
| `kor.mjs` | Kedjan: vecka → koppling (hubbrad med EN Ansvarig; basregeln när alla H-varianter har samma) → grupp per klipp över marknader → post → fil → Discord → minnet | allt ovan |
| `post.mjs` | Texten (engelska): bästa först, en förlorare, resten som en rad, unga, ingen leverans, hit rate som bråk, ett action item, frågan tillbaka; spärren mot kronor/ROAS/köp/tankstreck | `matstrumpor/etikett.mjs` formateraFrekvens |
| `action-items.json` | 21 action items, 4–5 per utfall, ur kursens hantverksregler och playbooken | |
| `discord.mjs` | Privat kanal `ad-report-<förnamn>` i Bäverbutikens server (@everyone nekas, redigeraren + Axels två konton + boten), post med `<@id>`, delning under 1 900 tecken | `annonsvakt/regler.mjs` delaText |
| `konfig.json` | Guild, kanalprefix, Axels id:n, grinden, cron, `utan_redigerare` (Josh och Annabelle, Axels beslut 2026-10-02) | |
| `data/actions.jsonl`, `data/poster.jsonl` | Minnet: vilket item som gavs (aldrig samma två gånger), vad som postades var | committas |

## Mätt 2026-10-02 (W39, torrt)

- 1 145 annonser med första veckan slut i veckan; 59 bedömbara; **21 fick en
  person (36 %)**. Resten: 18 utan hubbrad, 20 med hubbrad utan Ansvarig
  (bildannonserna ur `/bildannonser` har egna rader utan människa — de
  tillskrivs aldrig videoredigeraren).
- Poster: Carl 13 klipp (8 bedömbara, breakthrough), Jerzee 33 klipp (13
  bedömbara, breakthrough), Gilz 11 klipp (10 utan leverans), Jasper 3 klipp.
  Josh och Annabelle får ingen rapport (Axels beslut 2026-10-02: de gör andra
  uppgifter; `konfig.json` → `utan_redigerare`).
- Hook/hold visas inte när talet är ≥ 90 % (mätfel eller bildannons; agent-
  loggen bär 27 sådana), och `utford_som_briefad` är "okänd" på alla rader i
  dag ⇒ "Cut as briefed: not measured yet".
- Unga annonser saknar källa för Bäverbutiken/CaraShell (nattvakten skriver
  dem inte) och för Matstrumpor i en container utan `matstrumpor/output/`.

## Kvar

1. ✅ Rutinen är byggd 2026-10-03 på Barkås-kontot, efter att PR #351 mergats
   till `main`: trigger `trig_01McuhAA4Xm8aFA7PJPwwAGp`, fast session
   `session_01GneESZrfpo5tLCp2jnZuYM`, cron `0 1 * * 1` UTC, prompt
   `/redigerarrapport --discord`, sedd i `list_triggers`. Första fyrning
   måndag 2026-10-05 03:06 CEST. Vinteromställningen: `0 2 * * 1`.
2. Gilz är inte med i Bäverbutikens server (ingen post förrän han bjudits in).
   Boten behöver Manage Channels för att skapa de privata kanalerna första
   gången; misslyckas en post slutar körningen med exit 4 och filerna finns i
   `output/<vecka>/`.
3. `/matstrumporkungen` skriver hook/hold/konv_lpv i ETIKETT-raden sedan
   2026-10-02 (`matstrumpor/kor.mjs` rad()); äldre rader saknar dem.
4. Täckningen över 80 % kräver att hubbraderna bär Ansvarig — redigerarnas
   egen rutin, inte kod.
