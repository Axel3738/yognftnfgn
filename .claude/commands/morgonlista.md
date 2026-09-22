# /morgonlista — VA:ns väckarklocka: dagens urgent cases i Discord, varje morgon

Argument: `$ARGUMENTS` — `--torr` (skriv listan, posta inget), `--brand <id>`
(en butik), `--discord` (posta — det rutinen gör), `--json`.

```
/morgonlista --torr                   se listan utan att posta
/morgonlista --discord                rutinen: alla butiker med brevlåda
/morgonlista --brand baverbutiken --discord
```

Uppdraget i en mening: **varje morgon före VA:ns arbetsdag postas i butikens
`#customer-service` vad hon ska ta först — mappen VA-PRIO (arga kunder som fått
lugnande svar), stjärnmärkta mejl i inkorgen och tvister med deadline inom 3
dagar — och hon taggas, så att inget brådskande kan passera.** Axels beslut
2026-09-22: "Michelle ska 100 % garanterat få till sig varje dag vilka som är de
urgent cases, så att hon alltid tar de first thing in the morning."

CONNECTORS: inga. Brevlådan via `KUNDTJANST_MAIL_PASS_<ID>` (Loopias webbmejl),
tvisterna via butikens Shopify-nycklar, Discord via `DISCORD_BOT_TOKEN`. VA:ns
Discord-id står i brandfilen (`discord.va_id`, Bäverbutiken: Mechile
`1543617780396593206`) eller i `DISCORD_VA_ID`. Saknas det postas listan utan
taggning och rapporten säger det.

## Järnreglerna

- **Läs-bara.** Listar mappar och mejl, läser tvister med GET. Flaggar inget,
  flyttar inget, svarar på inget, raderar aldrig. Skriver inga filer, pushar inget.
- **Postar ALLTID, även en tom lista.** En morgon utan inlägg ska betyda att
  rutinen inte gick — aldrig att inget brådskade. Tomt = "empty — nothing waiting".
- **Kundadresser maskeras** (`ka***@gmail.com`). Ordernumret är nyckeln.
- **Engelska i Discord** (Axels order 2026-09-05). `postaDiscord` stoppar svenska.
- **En brevlåda, en session i taget.** Rutinen får inte gå samtidigt som
  `/autosvar` mot samma butik — lägg dem minst 10 minuter isär.
- Kör aldrig `autosvar.mjs` härifrån. Det här är en läsare, inte motorn.

## Gör i ordning

1. `node kundtjanst/morgonlista.mjs $ARGUMENTS`
   stderr: inloggning per butik, `▶ <butik>: hoppad — saknar KUNDTJANST_MAIL_PASS_…`
   är en nyckel som ska in i Environments, inte ett kodfel.
2. Svara Axel kort, på svenska: per butik antalet i VA-PRIO, stjärnor och
   brådskande tvister, och om Discord-posten gick. Sist, numrerat: det som är
   HANS (nyckel som saknas, brevlåda som inte gick att läsa, VA-id som saknas).

## Rutinen

07:00 Manila-tid (Asia/Manila, UTC+8 året runt) = **23:00 UTC dagen före**,
cron `0 23 * * *`. Ingen sommartidsflytt — Manila har ingen. Fast session med
repot som källa och `main` som utgren (rutinen pushar inget, men den ska ha
CLAUDE.md och kommandofilen), `create_trigger` med `persistent_session_id`.
Prompt: `/morgonlista --discord`.

## Definition of done

- [ ] Skriptet kördes utan att kasta
- [ ] Varje butik med brevlåda redovisad (VA-PRIO / stjärnor / tvister), eller hoppad med orsak
- [ ] Discord-posten gick (`Discord: #customer-service i <server>`) och VA:n taggades
- [ ] Inget flaggat, flyttat, svarat eller raderat
- [ ] Svaret till Axel på svenska, kort, hans klick numrerade sist
