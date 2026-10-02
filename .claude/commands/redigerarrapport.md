# /redigerarrapport — veckorapporten till redigerarna (måndag, en post per person)

Argument: `$ARGUMENTS` — normalt `--discord` (rutinen). Utan flagga = torrt:
läser, bygger posterna och skriver dem till `redigerarrapport/output/<vecka>/`,
postar inget och skriver inget minne. `--vecka 2026-W40` väljer veckan
(standard: senaste hela ISO-veckan). `--redigerare carl` bygger bara en.
`--utan-fetch` hoppar `git fetch` av agent-grenen (bara när nätet är borta).

```
/redigerarrapport --discord        rutinen (måndag 03:00 CEST = 09:00 Manila)
/redigerarrapport                  provkör: posterna som filer, inget postas
/redigerarrapport --vecka 2026-W39 en gången vecka
```

Uppdraget i en mening: **varje måndag får varje redigerare ett eget
Discord-meddelande, i en privat kanal, om vilka av hennes annonser som gick
bäst förra veckan, vilket utfall de fick (breakthrough, spend winner, KPI
winner, loser, ingen leverans), varför det kan ha blivit så utifrån briefen
och klippet, och ETT litet action item att göra till torsdag.** Axels
beställning 2026-10-02. Planen, reglerna och mallen: `redigerarrapport/PLAN.md`
och `docs/os/evolve/SVAR.md` → "Veckorapporten till redigerarna".

⛔ **Posten bär aldrig kronor, ROAS, köp eller CPA** (järnregeln 2026-09-02,
och med köp och ROAS går spenden att räkna ut baklänges). `post.mjs
kontrollera()` kastar om det smiter in. Andel av kampanjen i procent är
tillåten (Axels beslut A 2026-10-02).

⛔ **Läs-bara mot allt utom Discord.** Rapporten hämtar aldrig själv ur Meta
och skriver aldrig i Notion: etiketterna kommer ur `matstrumpor/logg.jsonl`
(Matstrumporkungen) och `agent/budgetlogg.jsonl` på grenen
`claude/daily-agent-discussion-uos5df` (nattvakten), hubbraderna ur Notion
via `NOTION_TOKEN`. En annons utan hubbrad med Ansvarig rapporteras till
ingen — hellre okopplad än fel person.

⛔ **Förlusten är konceptets.** Klippet pekas ut bara när `utford_som_briefad`
är mätt till nej. Ingen jämförelse mellan redigerare i en post.

CONNECTORS: inga krävs. Notion via `NOTION_TOKEN`, Discord via
`DISCORD_BOT_TOKEN`. Engelska tvingas av `tools/lib/engelska.mjs`.

## Gör i ordning

0. `git pull --rebase origin main`
   Minnet (`redigerarrapport/data/*.jsonl`) ligger i repot. Misslyckas pullen:
   `git rebase --abort`, skriv det i svaret, kör ändå.

1. `node redigerarrapport/kor.mjs $ARGUMENTS`
   Skriptet gör allt: etiketterna ur de två loggarna (fetch av agent-grenen
   först) → annonser vars första vecka slutade i veckan + uppgraderingar →
   hubbraderna (alla hubbar, alla rader med Ansvarig; Jerzee via kommentar) →
   namnlösaren (marknadskod, speglar, NO-prefix, Matstrumpors arbetsnamn) →
   en post per redigerare (`post.mjs`) → fil i `output/<vecka>/<id>.md` →
   med `--discord`: privat kanal `ad-report-<förnamn>` i Bäverbutikens
   server (skapas första gången), post med `<@id>`, minnet skrivs
   (`data/actions.jsonl`, `data/poster.jsonl`).
   Exit 4 = Discord misslyckades för någon: posten står som fil, minnet för
   den personen är INTE skrivet, så den kommer igen nästa måndag. Skriv
   orsaken i svaret (oftast: boten saknar "Manage Channels", eller
   redigeraren är inte med i servern).
   Täckningen står sist i utskriften: bedömbara annonser i veckan, hur många
   som fick en person, och vilka som blev okopplade med orsak. **Under 80 %
   kopplade ⇒ skriv det överst i svaret** — då är det kopplingen som ska
   lagas, inte posten.

2. Committa minnet när det ändrats:
   `git add redigerarrapport/data && git commit -m "redigerarrapport <vecka>: <n> poster" && git push origin main`
   `output/` är gitignorerad och committas aldrig.

3. Svaret till Axel, kort, på svenska: antal poster, per redigerare antal
   annonser (bedömbara / unga / ingen leverans), vilka action items som gavs,
   täckningen, och det som inte gick. Ingen post citeras i sin helhet; länk
   till kanalen räcker. Inga kronor här heller — Axel ser dem i Ads Manager.

## Definition of done

- [ ] `git pull --rebase` kördes före skriptet.
- [ ] Etiketterna lästes ur BÅDA loggarna (fetch av agent-grenen lyckades,
      eller `--utan-fetch` står i svaret med orsak).
- [ ] Hubbarna hittades dynamiskt; antalet står i utskriften och är inte lägre
      än förra körningen utan förklaring.
- [ ] En post per redigerare med minst en etiketterad, ung eller svulten
      annons; redigerare utan annonser får ingen post, och det står i svaret.
- [ ] Varje post klarade `kontrollera()` (inga kronor/ROAS/köp/tankstreck).
- [ ] Med `--discord`: varje post postad i rätt privat kanal med `<@id>`,
      meddelande-id i `data/poster.jsonl`; den som inte gick står med orsak.
- [ ] Action item per redigerare skrivet i `data/actions.jsonl`, aldrig samma
      index två veckor i rad för samma person.
- [ ] Täckningen (kopplade ÷ bedömbara) står i svaret, med de okopplade och
      varför.
- [ ] Minnet committat och pushat till `main`.
