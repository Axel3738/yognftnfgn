# Köra produktbatchen på din egen dator

**Varför:** Temu blockerar molnet. Din Mac är inte blockerad. Kör du flödet
lokalt slipper du hela mellanledet — ingen Cowork-prompt, inga zip-filer, ingen
väntan. Du skriver ett kommando och allt händer: bilderna skördas, copyn skrivs,
produkterna läggs upp i alla fem butiker.

Du gör det här **en gång**. Sen är det bara kommandot varje gång.

---

## Steg 1 — öppna Terminal

Tryck **⌘ + mellanslag**, skriv `terminal`, tryck **Enter**.
Ett svart fönster öppnas. Där klistrar du in raderna nedan, en i taget,
och trycker Enter efter varje.

---

## Steg 2 — hitta repot på din dator

Klistra in:

```bash
REPO=$(find ~ -maxdepth 5 -type d -name yognftnfgn -not -path "*/node_modules/*" 2>/dev/null | head -1)
if [ -n "$REPO" ]; then cd "$REPO" && echo "Hittade repot: $PWD"; else echo "Inte nedladdat än — kör raden i rutan under."; fi
git fetch origin && git checkout claude/tem-shopify-product-import-cn7mjt && git pull
```

Står det **"Hittade repot: …"** — bra, du är inne. Hoppa till steg 3.

Står det **"Inte nedladdat än"**, kör den här i stället:

```bash
cd ~ && git clone https://github.com/Axel3738/yognftnfgn.git && cd yognftnfgn && git checkout claude/tem-shopify-product-import-cn7mjt && pwd
```

> Repot är publikt, så det går att ladda ner utan inloggning.
>
> `git checkout claude/…` hämtar grenen där allt det nya ligger. Är den redan
> hopslagen i `main` säger den bara att grenen inte finns — kör då `git checkout main`.

---

## Steg 3 — installera det som behövs

**3a.** Först Homebrew (verktyget som installerar allt annat). Klistra in:

```bash
command -v brew >/dev/null || /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

Den kan fråga efter ditt Mac-lösenord. **Bokstäverna syns inte när du skriver** —
det är meningen. Skriv och tryck Enter.

**3b.** Sen den här raden — den gör så att `brew` hittas i fortsättningen
(behövs på nyare Mac-datorer, och skadar inget på äldre):

```bash
[ -x /opt/homebrew/bin/brew ] && eval "$(/opt/homebrew/bin/brew shellenv)" && echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
```

**3c.** Sen resten. Klistra in allt på en gång:

```bash
brew install node ffmpeg
brew install --cask google-chrome
cd temu && npm install && cd kaching-cli && npm install && cd ../..
```

Det tar några minuter. Rader som rullar förbi är normalt.
Har du redan Chrome står det "already installed" — det är inget fel.

---

## Steg 4 — lägg in nycklarna till butikerna

Klistra in:

```bash
cp temu/env.exempel .env && open -e .env
```

Nu öppnas en textfil med 16 tomma rader. Fyll i värdet efter varje `=`.

**Var hittar du värdena?**

- **Snabbaste vägen:** samma ställe där du la in dem när vi kopplade butikerna —
  miljöns inställningar på claude.ai/code. Kopiera rakt av.
- **Annars:** ur Shopify-admin. Klickvägen står i `temu/TOKENS.md` — tre
  uppgifter per butik, och de går att läsa av när som helst.

Spara med **⌘ + S** och stäng fönstret.

> Filen `.env` ligger bara på din dator. Den hamnar aldrig på GitHub
> (den står i `.gitignore`) och ska aldrig klistras in i en chatt.

---

## Steg 5 — kolla att allt sitter

Klistra in:

```bash
node temu/kolla-lokalt.mjs
```

Du får en lista. **✅ = klart. ❌ = pilen under raden säger exakt vad du ska
göra.** Fixa varje ❌ och kör raden igen tills allt är grönt.

Raden som spelar störst roll är den sista:

```
✅  Temu släpper igenom den här datorn (47 bild-URL:er i provsidan)
```

Står det så kan din dator skörda bilder — och då är hela poängen uppnådd.

---

## Steg 6 — kör batchen

Öppna Claude Code i repot:

```bash
claude
```

Skriv sedan:

```
/produktbatch <länken till offert-spreadsheetet> <batchnummer>
```

Till exempel:

```
/produktbatch https://docs.google.com/spreadsheets/d/1zGcVdw... 6
```

Claude kör hela flödet: läser offerten, hoppar över produkter utan quote,
skördar bilderna från Temu, räknar priser, skriver copy på fem språk och lägger upp
produkterna i alla fem butiker.

Vill du se vad som finns i en offert innan du kör hela batchen:

```bash
node temu/offert.mjs "<länken till arket>"
```

Den listar produkterna uppdelade i *med quote* och *utan quote*. Ingen
Google-inloggning behövs — arket läses direkt via länken.

**Ett Chrome-fönster öppnas under skörden.** Låt det vara. Dyker en captcha upp
löser du den i fönstret, sen fortsätter det av sig självt.

---

## Om något strular

| Det står | Gör så här |
|---|---|
| `command not found: brew` | Kör raden i steg 3 igen — den installerar brew först |
| `command not found: claude` | `npm install -g @anthropic-ai/claude-code` |
| `Permission denied` | Skriv `sudo ` före raden och ange din Mac-inloggning |
| Ett ❌ i kollen | Pilen under raden säger exakt vad. Kör kollen igen efteråt |
| Temu-raden är ❌ | Din dator är blockerad. Då måste skörden köras någon annanstans |

Kör alltid `node temu/kolla-lokalt.mjs` igen efter att du fixat något.
