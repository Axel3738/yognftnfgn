# skool/ — transkribera en Skool-kurs så att Axel kan läsa den

Axel köper kurser på Skool och vill läsa dem i stället för att titta. Rutinen är
`/skool <klassrums-länk>` (`.claude/commands/skool.md`); det här är verktyget bakom.

> ⚠️ Endast för eget bruk. Kursinnehållet är upphovsrättsskyddat — det ligger i
> det här privata repot för att Axel ska kunna läsa det, aldrig för att spridas.

```bash
node skool/hamta.mjs "https://www.skool.com/<grupp>/classroom/<kurs-id>?md=<modul-id>"
node skool/hamta.mjs "<länk>" --ljud      # ladda även ner ljudspåren (för Whisper)
node skool/hamta.mjs "<länk>" --ut <mapp> # annan utdatamapp
```

Kräver `SKOOL_EMAIL` + `SKOOL_PASSWORD` i miljön och Playwrights Chromium
(globalt `playwright` + `/opt/pw-browsers` i claude.ai-containern). Inga
npm-beroenden i repot.

## Vad verktyget gör

1. Loggar in på skool.com i en riktig (headless) Chromium — Skools API och Mux
   svarar 403 på allt som inte har webbläsarens cookies (`aws-waf-token`) och
   rätt Referer, så alla anrop går genom sessionen.
2. Läser kursträdet ur sidans `__NEXT_DATA__` (`pageProps.course`), går till
   varje modul (`?md=<id>`) och hämtar:
   - modultexten (Skools `[v2]`-richtext → Markdown),
   - videon: `pageProps.video` ger Mux `playbackId` + signerad token; masterlistan
     `https://stream.mux.com/<playbackId>.m3u8?token=…` (Referer skool.com) har ett
     undertextspår **"English CC"** — det hämtas segment för segment och slås ihop,
   - bilagor: `POST https://api2.skool.com/files/<file_id>/download-url` (GET ger
     405) svarar med en bar signerad URL till `files.skool.com`.
3. Skriver `skool/output/<grupp>/<kurs-slug>/`:

| Fil | Vad |
|---|---|
| `kurs.json` | kursträdet + vad som hämtades per modul (längd, ordantal, bilagor, noteringar) |
| `moduler/NN-<slug>.md` | modulens egen text |
| `undertexter/NN-<slug>.vtt` / `.txt` | undertexten med tidkoder / utan |
| `bilagor/<filnamn>` | bilagorna som de är |
| `ljud/NN-<slug>.mp4` | bara med `--ljud`, gitignorerat |
| `RA-TRANSKRIPTION.md` | allt ihopsatt i kursens ordning, ostädat |
| `transkription/NN-<slug>.md` + `TRANSKRIPTION.md` | **de städade transkriptionerna** — skrivs av sessionen (steg 2–3 i kommandot), inte av verktyget |

Verktyget hittar aldrig på text. Städningen (stycken, mellanrubriker med
tidsstämplar) gör subagenter enligt kommandofilen, och kontrolleras mot källan
(ordantal 95–105 %, inga nya siffror) innan något går in i dokumentet.

## Kända fallgropar (mätt 2026-09-17, kursen "The Celebrity Code")

- `metadata.resources` är en **JSON-sträng**, inte en lista — parsas därför.
- `metadata.desc` finns bara på den valda modulen i sidans data; därför besöks
  varje modul för sig.
- `video.duration` är i **millisekunder**.
- Bakom claude.ai-proxyn litar Chromium inte på proxyns CA. Verktyget skickar
  `--ignore-certificate-errors-spki-list=<SHA-256 av CA-nyckeln>` (räknas ur
  `/root/.ccr/agent-proxy-ca.crt`) — det pekar ut exakt den nyckeln, ingen
  allmän avstängning av TLS-kontrollen.
- Mux-undertexten är automatgenererad. Jämförd mot `faster-whisper medium.en`
  på en 25-minutersvideo: 95,8 % ordlikhet, skillnaderna är småord ("alright" /
  "all right", "five" / "5"). Whisper är alltså inte bättre — kör det bara för
  videor som saknar undertext. `pypdf` för PDF-bilagor behöver `pip install cffi`
  i containern.
- En Skool-video utan CC eller en extern video (`videoLink`) rapporteras med ⚠️
  i sammanfattningen och i `kurs.json` → `noteringar`.

## Första körningen

**The Celebrity Code – English** (Lodestar, Santiago / HappyFlops), 2026-09-17:
7 moduler, 4 videor (158 min), alla fyra med undertext (18 554 ord), 1 bilaga
(PDF, 18 sidor). Läsdokumentet: Claude Doc "The Celebrity Code – hela kursen
transkriberad".
