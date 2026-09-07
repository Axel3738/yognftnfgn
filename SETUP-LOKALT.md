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

```powershell
winget install --id GitHub.cli -e --accept-package-agreements --accept-source-agreements
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

> **Bra att veta:** terminalen står alltid "i" en mapp — den syns före `>` på
> prompten. Alla rader nedan förutsätter att du står i repo-mappen. Ser du inte
> `yognftnfgn` i prompten: klistra in `Set-Location $HOME\yognftnfgn` först.

## Steg 4 — installera repots egna delar + Claude Code

```powershell
Push-Location temu; npm install; Pop-Location
Push-Location temu\kaching-cli; npm install; Pop-Location
npm install -g @anthropic-ai/claude-code
claude --version
```

Sista raden ska skriva ut ett versionsnummer.

## Steg 4b — tala om för git vem du är, och logga in på GitHub

Behövs för att skördebilderna ska kunna sparas till repot i slutet av en batch.

```powershell
git config --global user.name "Axel Odhner"
git config --global user.email "axel.odhner@stonebite.org"
gh auth login
```

`gh auth login` ställer några frågor — svara **GitHub.com → HTTPS → Yes → Login
with a web browser**. Den visar en kod, öppnar webbläsaren, du klistrar in koden.
Klart när `gh auth status` säger *"Logged in to github.com"*.

## Steg 5 — lägg in nycklarna till butikerna

```powershell
if (-not (Test-Path .env)) { Copy-Item temu\env.exempel .env }; notepad .env
```

Anteckningar öppnas med 16 rader att fylla i. Skriv värdet efter varje `=`
(inga citattecken, inga mellanslag runt `=`). Spara med **Ctrl + S**, stäng.
(Finns filen redan ifylld öppnas den som den är — inget skrivs över.)

**Var hittar du värdena?** Ur Shopify-admin — klickvägen står i `temu/TOKENS.md`,
tre uppgifter per butik (SE och NO räcker; DK/FI/UK får inga nya produkter).
Nycklarna du en gång la in på claude.ai/code visas maskerade där och går inte
att kopiera tillbaka, så den vägen fungerar inte.

> Filen `.env` stannar på din dator. Den hamnar aldrig på GitHub
> (den står i `.gitignore`) och ska aldrig klistras in i en chatt.

## Steg 6 — kolla att allt sitter

```powershell
node temu\kolla-lokalt.mjs
```

Du får en lista. **✅ = klart. ❌ = pilen under raden säger exakt vad du ska göra.**
Fixa varje ❌ och kör raden igen tills allt är grönt.

Viktigast är Temu-raden:

```
✅  Temu-provet gick igenom (bild-URL:er i provsidan) — kör skördaren på riktigt för att vara säker
```

Provet är en förenkling: det riktiga testet är att skörda en produkt (steg 7
gör det). Ett ❌ här betyder oftast att datorn är blockerad — då kör vi
molnläget i stället, precis som förut (Cowork-prompt + zip).

## Steg 7 — kör batchen

```powershell
claude
```

**Första gången** ställer Claude Code två-tre frågor (färgtema, inloggning).
Välj vad som helst på temat, logga in med ditt Anthropic-konto i webbläsaren.

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

**Notion-korten** görs inte lokalt (Notion-kopplingen finns bara i molnet).
Claude säger till när batchen är klar — då ber du molnsessionen göra korten.

## Nästa gång

Allt ovan är gjort en gång för alla. Nästa batch:

1. Windows-tangenten → `powershell` → Enter
2. `Set-Location $HOME\yognftnfgn; git pull`
3. `claude`
4. `/produktbatch <länk> <nummer>`

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
brew install git node ffmpeg gh
brew install --cask google-chrome
npm install -g @anthropic-ai/claude-code
```

**Steg 3.** Repot:

```bash
REPO=$(find ~ -maxdepth 5 -type d -name yognftnfgn -not -path "*/node_modules/*" 2>/dev/null | head -1)
[ -z "$REPO" ] && { cd ~ && git clone https://github.com/Axel3738/yognftnfgn.git && REPO=~/yognftnfgn; }
cd "$REPO" && git fetch origin -q && git checkout -q claude/tem-shopify-product-import-cn7mjt && git pull -q && echo "KLART — repot ligger i $PWD"
```

**Steg 4.** `(cd temu && npm install) && (cd temu/kaching-cli && npm install)`

**Steg 4b.** `git config --global user.name "Axel Odhner" && git config --global user.email "axel.odhner@stonebite.org" && gh auth login`

**Steg 5.** `[ -f .env ] || cp temu/env.exempel .env; open -e .env` — fyll i, spara med ⌘S.

**Steg 6.** `node temu/kolla-lokalt.mjs`

**Steg 7.** `claude`, sen `/produktbatch <länk> <nummer>`

Strular det: `command not found: brew` → kör raden i steg 2 igen.
`command not found: claude` → `npm install -g @anthropic-ai/claude-code`.
Använd **aldrig** `sudo` framför de här raderna — Homebrew vägrar, och npm
blir trasigt.
