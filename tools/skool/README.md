# Skool-läsaren: Evolve-kursen härifrån, utan klick

Läser Axels Evolve-kurs på Skool (gruppen `evolve-8484`) med kontot i miljön:
`SKOOL_EMAIL` + `SKOOL_PASSWORD`. Läs-bart: loggar in, läser klassrummet, skriver
inget på Skool. Byggt 2026-10-01 när iterationsplaybooken skulle in i repot.

Kräver Chromium + Playwright. I claude.ai-containern finns Playwright globalt
(`/opt/node-tools/node_modules/playwright`), så skripten faller tillbaka dit när
`import('playwright')` inte hittar paketet. Lokalt: `npm i -g playwright` eller
kör från en mapp med playwright i `node_modules`.

```bash
node tools/skool/login.mjs                       # loggar in, sparar sessionen i tools/skool/.state/ (gitignorerad)
node tools/skool/klassrum.mjs                    # kursträdet → tools/skool/.state/kurs-<id>.json + utskrift
node tools/skool/klassrum.mjs 9917539c           # ett kurs-id (Copywriting)
node tools/skool/lektioner.mjs lista.txt         # rader "<kurs-id> <lektions-id> <kortnamn>" → .state/lektioner/<kortnamn>.md
```

Kurs- och lektions-id:n står i `docs/os/evolve/KURSTRAD.md`. Lektionstexten ligger i
Skools `__NEXT_DATA__` som ProseMirror-JSON (`[v2][...]`); `lektioner.mjs` gör om den
till markdown. Lektioner som bara är video får en tom text, och videorna (Skools egna,
`videoId`) hämtas inte. Lektionernas länkade Google-dokument är ofta öppna:
`https://docs.google.com/document/d/<id>/export?format=txt` och
`https://docs.google.com/spreadsheets/d/<id>/export?format=xlsx`.

⚠️ Kursmaterialet är Axels köpta kurs. Det som sparas i repot är strukturerade
anteckningar (`docs/os/evolve/`), inte hela lektionsdumpar.
