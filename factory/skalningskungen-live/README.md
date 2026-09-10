# Skalningskungen — ombyggnaden av annonshalvan

✅ **LIVE sedan 2026-09-10.** Pushad till `claude/daily-agent-discussion-uos5df`
(commit `9a0303f` + `a1c83dd`). Nästa körning 07:30 plockar upp den själv.
Filerna här är en kopia så arbetet överlever att containern försvinner.

**Läget vid avläsningen 2026-09-10:** fyra produkter ligger över tröskeln och
får ett startskott i morgon — Damasker Vandring, Adventskalendern Racingbilar,
Taköverdraget för Husvagn och Isolerade Utekattkojan.


**Axels beslut 2026-09-10.** Ronden ska sluta göra briefer. I stället postar
den ett startskott i Discord-kanalen `#ops-startskott` när en produkt klarat
testet på Bäverbutiken.

> *"Istället för att göra nya briefs och såna grejer ska vi inte göra det alls.
> Vi skickar bara ett Discord-meddelande. Det är det enda som den behöver göra
> istället för att göra en massa creative strategy och göra nya
> Notion-grejsmojser och sånt."*

---

## Varför en kopia ligger här

Rutinen "Skalnings kungen" kör från grenen
**`claude/daily-agent-discussion-uos5df`**, inte från `main`. Hela
`agent/`-mappen och `rond-auto.md` finns bara där. En session som bara läser
`main` ser därför ingenting av det här — och har två gånger dragit slutsatsen
att rutinen inte finns.

Kopian och patchen ligger kvar som facit och som räddning om grenen skulle
tappas bort.

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

## Buggen som fångades innan den hann göra skada

Första versionen byggde larmet på `annonsbehov`s `forsta_batch`. Det ger bara
utslag för produkter som **aldrig** haft en batch — den som redan fått en
hamnar för alltid i `brief_runda`. Larmet hade därför bara utlösts för
splitternya produkter, medan de bevisade produkterna aldrig larmats alls.

Mätt i budgetloggen 2026-09-10: **45 SE-kampanjer, 14 med batch** — bland dem
Fiskespöhållaren, Båtmotorskyddet 420D och MC-Kapellet.

Fixen är `startskottsbehov()` i `agent/startskott.mjs`, som läser tröskeln
direkt ur `rond.mjs`. `annonsbehov` är fortfarande helt orörd.

## Testat

- 167 tester gröna på grenen (38 av dem nya).
- Provlarmet postat skarpt i `#ops-startskott` 2026-09-10 och tillbakaläst ur
  kanalen. Det pingade båda mottagarna.
- Beslutsmotorn körd read-only mot färsk Meta-data samma dag: fyra produkter
  ligger över tröskeln.

## Tre saker som är lätta att göra fel efteråt

⚠️ **Loggraden får aldrig bära `ny_budget`.** `dagarSedanAndring` i
`agent/logg.mjs` räknar varje genomförd rad med det fältet som en
budgetändring, och då fryser kadensspärren kampanjen i tre dygn utan att någon
rört budgeten. `byggLoggrad` utelämnar fältet med flit.

⚠️ **`#ops-startskott` är den enda kanalen som skrivs på svenska.** Alla andra
rutinposter är engelska för att redigerarna läser samma kanaler. Den här läses
av Axel och VA:n, och mallen är Axels egen. Översätt den aldrig.

⚠️ **Bygg aldrig larmet på `annonsbehov`.** Se avsnittet om buggen ovan.
Listan ska komma ur `startskottsbehov`, som mäter mot tröskeln direkt.
