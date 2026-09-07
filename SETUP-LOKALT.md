# Köra produktbatchen på din egen dator

**Varför:** Temu blockerar molnet. Din egen dator är inte blockerad. Kör du flödet
lokalt slipper du hela mellanledet — ingen Cowork-prompt, inga zip-filer, ingen
väntan. Du skriver ett kommando och allt händer.

**Windows eller Mac spelar ingen roll** — båda funkar lika bra. Nedan står Windows
först (det du kör på nu). Mac-varianten ligger längst ner.

Du gör det här **en gång**. Sen är det bara kommandot varje gång.

---

# WINDOWS

## Steg 1 — öppna PowerShell

Tryck på **Windows-tangenten**, skriv `powershell`, tryck **Enter**.
Ett blått eller svart fönster öppnas. Där klistrar du in rutorna nedan.

Klistra in = högerklicka i fönstret (eller Ctrl + V), sen Enter.

## Steg 2 — installera verktygen

Klistra in en ruta i taget. Vissa frågar om du godkänner licensvillkor — svara ja.

```powershell
winget install --id Git.Git -e --accept-package-agreements --accept-source-agreements
```

```powershell
winget install --id OpenJS.NodeJS.LTS -e --accept-package-agreements --accept-source-agreements
```

```powershell
winget install --id Gyan.FFmpeg -e --accept-package-agreements --accept-source-agreements
```

```powershell
winget install --id Google.Chrome -e --accept-package-agreements --accept-source-agreements
```

Står det *"already installed"* på någon — bra, då har du den redan.

> ⚠️ **STÄNG PowerShell-fönstret och öppna ett nytt** när alla fyra är klara.
> Annars hittar Windows inte de nya programmen. Det här steget glöms bort mest
> av alla — gör det.

## Steg 3 — hämta repot

I det **nya** fönstret, klistra in:

```powershell
$r = Get-ChildItem $HOME -Recurse -Directory -Filter yognftnfgn -Depth 4 -ErrorAction SilentlyContinue | Select-Object -First 1
if (-not $r) { Set-Location $HOME; git clone https://github.com/Axel3738/yognftnfgn.git; $r = "$HOME\yognftnfgn" }
Set-Location $r
git fetch origin
git checkout claude/tem-shopify-product-import-cn7mjt
git pull
Write-Host "KLART - repot ligger i $(Get-Location)"
```

Sista raden ska säga **KLART - repot ligger i C:\Users\...\yognftnfgn**.

## Steg 4 — installera repots egna delar

```powershell
Set-Location temu; npm install; Set-Location kaching-cli; npm install; Set-Location ../..
```

## Steg 5 — lägg in nycklarna till butikerna

```powershell
Copy-Item temu\env.exempel .env; notepad .env
```

Anteckningar öppnas med 16 tomma rader. Fyll i värdet efter varje `=`
(inga citattecken, inga mellanslag runt `=`). Spara med **Ctrl + S**, stäng.

**Var hittar du värdena?**
- **Snabbast:** samma ställe där du la in dem när vi kopplade butikerna —
  miljöns inställningar på claude.ai/code. Kopiera rakt av.
- **Annars:** ur Shopify-admin, klickvägen står i `temu/TOKENS.md`.

> Filen `.env` stannar på din dator. Den hamnar aldrig på GitHub
> (den står i `.gitignore`) och ska aldrig klistras in i en chatt.

## Steg 6 — kolla att allt sitter

```powershell
node temu\kolla-lokalt.mjs
```

Du får en lista. **✅ = klart. ❌ = pilen under raden säger exakt vad du ska göra.**
Fixa varje ❌ och kör raden igen tills allt är grönt.

Viktigast är sista raden:

```
✅  Temu släpper igenom den här datorn (47 bild-URL:er i provsidan)
```

Står det så kan din dator skörda bilder — och då är hela poängen uppnådd.

## Steg 7 — kör batchen

```powershell
claude
```

Hittas inte `claude`, installera den först:
```powershell
npm install -g @anthropic-ai/claude-code
```

Sen skriver du:

```
/produktbatch <länken till offert-arket> <batchnummer>
```

Vill du bara se vad som finns i en offert utan att köra hela batchen:

```powershell
node temu\offert.mjs "<länken till arket>"
```

Den listar produkterna uppdelade i *med quote* och *utan quote*. Ingen
Google-inloggning behövs.

**Ett Chrome-fönster öppnas under bildskörden.** Låt det vara. Dyker en captcha
upp löser du den i fönstret, sen fortsätter det av sig självt.

## Om något strular på Windows

| Det står | Gör så här |
|---|---|
| `winget: inte igenkänt` | Uppdatera "Programinstalleraren" i Microsoft Store |
| `git`/`node`/`npm` *inte igenkänt* | Du glömde stänga och öppna PowerShell efter steg 2 |
| `körning av skript är inaktiverad` | Kör: `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` och svara J |
| Ett ❌ i kollen | Pilen under raden säger exakt vad. Kör kollen igen efteråt |
| Temu-raden är ❌ | Datorn är blockerad — då måste skörden köras någon annanstans |

---

# MAC

Samma sak, andra kommandon.

**Steg 1.** Klicka på förstoringsglaset 🔍 uppe till höger, skriv `terminal`, Enter.

**Steg 2.** Verktygen:

```bash
command -v brew >/dev/null || /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
[ -x /opt/homebrew/bin/brew ] && eval "$(/opt/homebrew/bin/brew shellenv)" && echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
brew install node ffmpeg
brew install --cask google-chrome
```

**Steg 3.** Repot:

```bash
REPO=$(find ~ -maxdepth 5 -type d -name yognftnfgn -not -path "*/node_modules/*" 2>/dev/null | head -1)
[ -z "$REPO" ] && { cd ~ && git clone https://github.com/Axel3738/yognftnfgn.git && REPO=~/yognftnfgn; }
cd "$REPO" && git fetch origin -q && git checkout -q claude/tem-shopify-product-import-cn7mjt && git pull -q && echo "KLART — repot ligger i $PWD"
```

**Steg 4.** `cd temu && npm install && cd kaching-cli && npm install && cd ../..`

**Steg 5.** `cp temu/env.exempel .env && open -e .env` — fyll i, spara med ⌘S.

**Steg 6.** `node temu/kolla-lokalt.mjs`

**Steg 7.** `claude`, sen `/produktbatch <länk> <nummer>`

Strular det: `command not found: brew` → kör raden i steg 2 igen.
`Permission denied` → skriv `sudo ` före raden.
