# Skalningskungen — ombyggnaden av annonshalvan (färdig, väntar på att läggas live)

**Axels beslut 2026-09-10.** Ronden ska sluta göra briefer. I stället postar
den ett startskott i Discord-kanalen `#ops-startskott` när en produkt klarat
testet på Bäverbutiken.

> *"Istället för att göra nya briefs och såna grejer ska vi inte göra det alls.
> Vi skickar bara ett Discord-meddelande. Det är det enda som den behöver göra
> istället för att göra en massa creative strategy och göra nya
> Notion-grejsmojser och sånt."*

---

## Varför ändringen ligger här och inte på sin plats

Rutinen "Skalnings kungen" kör från grenen
**`claude/daily-agent-discussion-uos5df`**, inte från `main`. Hela
`agent/`-mappen och `rond-auto.md` finns bara där. Den här sessionen får inte
pusha till den grenen utan att Axel säger till.

Ändringen är därför **byggd och testad mot den grenen** och sparad här som en
patch, så den överlever att containern försvinner.

## Vad som ändras

| Fil | Ändring |
|---|---|
| `.claude/commands/rond-auto.md` | Steg 4b (annonsbatcherna) och 4c (Notion-svepet) borttagna — 12 534 tecken. Ersatta av ett nytt steg 4b: Startskottet. Leverans-avsnittet och Definition of done omskrivna. |
| `agent/startskott.mjs` | **Ny.** Formaterar larmet i Axels mall, bygger loggraden, postar via husets `discord-post.mjs`. Räknar aldrig själv. |
| `agent/test/startskott.test.mjs` | **Ny.** 23 tester, inget nätverk, inga skrivningar. |
| `agent/discord.json` | Kanalen `ops-startskott` inlagd som alias och id, plus språkundantaget. |
| `agent/README.md` | Avsnittet "Annons-triggern" ersatt av "Startskottet". |

**Budgethalvan är helt orörd.** Ronden fortsätter höja, sänka, stänga av och
köra åtgärdstrappan på båda kontona, precis som i dag. All matematik i
`besked.mjs`, `rond.mjs` och `logg.mjs` är oförändrad.

## Vad rutinen slutar göra

- Skriver briefer — varken förstabatcher eller 3-dagarsrundor
- Skapar Notion-hubbar eller Notion-items
- Skapar Drive-mappar eller minnesfiler i `products/<id>/`
- Kör `/forsta-batch` eller `/cs`
- Loggar `FORSTA_BATCH_KLAR` eller `CS_BATCH_KLAR`
- Kör Notion-svepet

`/bildannonser` (20:00) och `/notionkorning` (13:20) är egna rutiner och
berörs inte.

## Tröskeln

Oförändrad, och den fanns redan: **1 500 kr total spend OCH minst 20 % vinst**
(`FORSTA_BATCH_SPEND_SEK` och `FORSTA_BATCH_VINST_PROCENT` i `agent/rond.mjs`).
Bara utfallet är nytt.

## Testat

- 152 tester gröna på grenen (23 av dem nya).
- Provlarmet postat skarpt i `#ops-startskott` 2026-09-10 och tillbakaläst ur
  kanalen. Det pingade båda mottagarna.

## Så läggs den live

```bash
git checkout claude/daily-agent-discussion-uos5df
git apply factory/skalningskungen-live/andringen.patch
npm test
git add -A && git commit && git push origin claude/daily-agent-discussion-uos5df
```

Nästa körning 07:30 plockar upp den automatiskt — rutinen checkar ut grenen
själv vid varje start.

## Två saker som är lätta att göra fel efteråt

⚠️ **Loggraden får aldrig bära `ny_budget`.** `dagarSedanAndring` i
`agent/logg.mjs` räknar varje genomförd rad med det fältet som en
budgetändring, och då fryser kadensspärren kampanjen i tre dygn utan att någon
rört budgeten. `byggLoggrad` utelämnar fältet med flit.

⚠️ **`#ops-startskott` är den enda kanalen som skrivs på svenska.** Alla andra
rutinposter är engelska för att redigerarna läser samma kanaler. Den här läses
av Axel och VA:n, och mallen är Axels egen. Översätt den aldrig.
