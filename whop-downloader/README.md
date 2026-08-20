# Whop Course Downloader — personlig backup

Ladda ner en Whop-kurs **du själv har köpt** för offline-tittande (t.ex. på flyget).

Verktyget använder **din egen inloggade webbläsarsession** — du loggar in precis
som vanligt i en riktig webbläsare, och skriptet hämtar bara det material du
redan har tillgång till. Inga lösenord sparas i kod, och ingen betalvägg kringgås.

> ⚠️ Endast för eget bruk. Ladda inte ner kurser du inte har köpt, och sprid
> inte innehållet vidare — det bryter mot Whops villkor och upphovsrätten.

## Hur det funkar

Whop streamar kursvideor som HLS (oftast via Mux). Den mest robusta metoden är
att **fånga videoströmmarna** medan lektionerna öppnas i din inloggade session,
och sedan ladda ner dem med `yt-dlp`. Det funkar oavsett hur Whop döper sina
knappar internt, och överlever att de ändrar sin sajt.

## Installation

```bash
cd whop-downloader
python3 -m venv .venv && source .venv/bin/activate   # valfritt men rekommenderat
pip install -r requirements.txt
python -m playwright install chromium
```

Du behöver även **ffmpeg** i PATH (yt-dlp använder det för att slå ihop HLS → mp4):

- macOS: `brew install ffmpeg`
- Ubuntu/Debian: `sudo apt install ffmpeg`
- Windows: `winget install Gyan.FFmpeg` (eller ladda från ffmpeg.org)

## Användning — tre steg

### 1. Logga in (en gång)

```bash
python whop_dl.py login
```

Ett Chromium-fönster öppnas. Logga in på whop.com som vanligt (mejl, 2FA, allt).
När du ser din kurs: gå tillbaka till terminalen och tryck **ENTER**. Sessionen
sparas i `whop_state.json` (som är gitignore:ad).

### 2. Fånga lektionerna

**Manuellt läge (rekommenderas — funkar alltid):**

```bash
python whop_dl.py capture --url "https://whop.com/DIN-KURS/..."
```

Fönstret öppnas i din inloggade session. För varje lektion:
1. Klicka på lektionen och låt videon spela ett par sekunder (så manifestet laddas).
2. Gå till terminalen och tryck **ENTER** för att spara den lektionen.
3. Upprepa. Skriv **`q` + ENTER** när du gått igenom allt.

Skriptet spelar in videoström-URL:er + lektionstext + bilagor i `manifest.json`.

**Auto-läge (bekvämt, best effort):**

```bash
python whop_dl.py capture --url "https://whop.com/DIN-KURS/..." --auto
```

Försöker klicka igenom lektionslänkarna automatiskt. Hittar den inga lektioner
eller missar några — kör manuellt läge istället (det är helt tillförlitligt).

### 3. Ladda ner

```bash
python whop_dl.py fetch
```

Läser `manifest.json` och laddar ner alla videor med `yt-dlp`, organiserat så här:

```
output/
  01-introduktion/
    video-01.mp4
    lektion.md
  02-modul-ett/
    video-01.mp4
    lektion.md
  ...
```

`--limit N` laddar bara ner de första N videorna (bra för att testa först).

## Bilagor (PDF:er m.m.)

`capture` registrerar även länkar till PDF/zip/docx i varje lektion (sparas i
`manifest.json` under `attachments`). De laddas inte ner automatiskt ännu —
öppna `manifest.json` och hämta dem manuellt, eller be om en utökning.

## Felsökning

| Problem | Lösning |
|---------|---------|
| `Playwright saknas` | `pip install -r requirements.txt && python -m playwright install chromium` |
| Ingen video fångades | Låt videon **spela** några sekunder innan du trycker ENTER; manifestet laddas först då. |
| `yt-dlp` misslyckas | Kontrollera att `ffmpeg` finns i PATH. Kör om `login` om cookies gått ut. |
| Auto-läge hittar inga lektioner | Använd manuellt läge (utan `--auto`). |
| Videon är DRM-skyddad | Vissa plattformar använder krypterad DRM (Widevine). Då går den inte att spara — det ligger utanför vad verktyget (och lagen) tillåter. Mux-standard i Whop-kurser är oftast okrypterat HLS. |

## Filer

| Fil | Vad |
|-----|-----|
| `whop_dl.py` | Hela verktyget (login / capture / fetch) |
| `requirements.txt` | Python-beroenden |
| `whop_state.json` | Din sparade session (gitignore:ad — delas aldrig) |
| `manifest.json` | Fångade lektioner + video-URL:er (gitignore:ad) |
| `output/` | Nedladdat material (gitignore:ad) |
