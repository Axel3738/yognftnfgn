# Strategrapporten: veckogranskningen av Bruces Growth Guide

Varje tisdag läser rutinen Growth Guide i Notion, mäter om Bruce (Gilz Bruce
Biazon, Matstrumpors creative strategist) gjorde sin måndagskoll, vad hans
koncept gav, och ger honom feedback på engelska med ETT action item — som en
Log-rad i Growth Guide plus en kommentar på raden med @Bruce. Axel pingas i
samma rad bara när något bara han kan påverka. Axels beställning 2026-10-03:
"skapa en rutin som granskar det här varje vecka … evaluerar Bruce och
rapporterar någonstans där det gör nytta ifall det behövs … nån AI-agent från
rutinen som skickar till Bruce och ger han feedback". Kommandot:
`.claude/commands/strategrapport.md`. Bruces egen SOP, som är facit för vad
som mäts: `matstrumpor/sop/BRUCE-WEEKLY-SELF-REVIEW.md`.

```bash
node matstrumpor/strategrapport/kor.mjs                 # torrt: texterna i output/<vecka>/, inget i Notion
node matstrumpor/strategrapport/kor.mjs --skarpt        # rutinen: Log-rad + kommentar + minnet i data/
node matstrumpor/strategrapport/kor.mjs --kolla         # token, id:n, antal rader
node matstrumpor/strategrapport/kor.mjs --torr --cache --utan-arkiv   # utan nät, ur output/notion.json
node --test matstrumpor/test/strategrapport.test.mjs    # 16 tester, utan nät
```

Kräver `NOTION_TOKEN` (integrationen "Bäverbutiken RUTINER" — den har
kommentarsrättigheten, mätt 2026-10-03 med en provkommentar på en tillfällig
barnsida som arkiverades). Läser Meta aldrig själv: talen kommer ur arkivet
(`products/matstrumpor/arkiv.json`, byggt ur `matstrumpor/logg.jsonl` +
mätningarna, offline). Skriver aldrig i Ad Roadmap, Ad Results eller hubben.

## Varför Notion, och varför en Log-rad

Bruce har inget Discord-id (inte med i Bäverbutikens server) och Matstrumpor
har ingen egen server. Han jobbar i Growth Guide, så feedbacken ligger där han
redan är: en rad `<vecka> Weekly review` i fliken **Log** (koden äger SYSTEM-
kolumnen, han svarar i NOTES) och en kommentar på den raden med @-omnämnande,
som ger honom en Notion-notis. Axel läser Log-fliken när han vill, får
rapporten i chatten varje tisdag och pingas med @Axel i samma rad bara vid
eskalering. Vill Axel hellre ha det i Slack `#urgent`: `SLACK_WEBHOOK_URL`
finns inte i den här miljön, så det är ett eget beslut och ett eget bygge.

## Delarna

| Fil | Gör | Återanvänder |
|---|---|---|
| `notion.mjs` | Ad Roadmap och hubben som kompakta rader med `created_by`/`last_edited_by` (det enda spåret av VEM som skrev något), Log-raden (återanvänds på titeln), kommentaren med mention, NOTES på förra veckans rad | — |
| `matt.mjs` | Mätningen (ren): kön, betade rader mot förra snapshoten, nya rader, hubbens inlämningar, vinnare och iterationer, veckans utfall, hit rate, eskalering, action-valet | `matstrumpor/etikett.mjs` RANG/hitRate/dagarMellan |
| `text.mjs` | Feedbacken till Bruce (engelska), Log-radens SYSTEM, rapporten till Axel (svenska), eskaleringskommentaren; spärren mot kronor/ROAS/köp/tankstreck/butiksnamn | `redigerarrapport/post.mjs` kontrollera, procent, datumEn, ETIKETTNAMN |
| `kor.mjs` | Kedjan: arkivet → Notion → `growthguide.mjs batcher` → mätningen → texterna → Notion → minnet | `matstrumpor/growthguide.mjs`, `redigerarrapport/kallor.mjs` veckaFor/plusDagar |
| `actions.json` | 17 action items i sju lägen (kö med bedömbara rader, ingen ny rad, vinnare utan tre iterationer, Done utan lärdom, per utfall, allmänt), var och en med källa | SOP:en, ITERATIONS-PLAYBOOK, `lardom.mjs` PLAYBOOK_PER_UTFALL |
| `konfig.json` | Strategens id:n, Axels Notion-id, integrationen, kö-statusarna, cron, grinden, 28/14-dagarsreglerna, eskaleringens trösklar | |
| `data/snapshot.json` | Ad Roadmap som den såg ut vid förra körningen — diffen mot den är måttet | committas |
| `data/historik.jsonl` | En rad per vecka: mätningen i korthet, action-itemet (så samma aldrig ges två gånger), Log-radens och kommentarernas id | committas |

## Vad som mäts, och ur vad

Kriterierna är Bruces SOP (måndag 15:00 Manila, 15 minuter) och Evolves regler
(CS-KLART.md, ITERATIONS-PLAYBOOK.md). Allt mäts, inget bedöms av en modell.

| Mått | Ur | Regel |
|---|---|---|
| Kön vid veckans början | förra snapshoten: rader med RESULTS och STATUS ≠ Done | delad på grinden 300 kr OCH 3 köp (bedömbara / "too little data") |
| Betade rader | nu: STATUS Done + människotext i LEARNINGS, som inte var det i snapshoten | under grinden ska texten vara "Too little data"; över grinden ska en rad börja "Guess:" — avvikelser står i feedbacken |
| Done utan lärdom | STATUS Done, LEARNINGS tom eller bara systemets sådd | "A row is Done when LEARNINGS is written" |
| Ny konceptrad | rader med `created_by` = Bruce, skapade sedan förra körningen | de sex cellerna (MEMO utan "(seeded", DESIRE, SUB AVATAR, ANGLE(S), AWARENESS, AD TYPE); fler än en ⇒ "the SOP says one per week" |
| Rad utan brief | hans Working-rader äldre än 7 dagar utan LINK TO BRIEF | "brief it or set it to Filming" |
| Inlämnat i hubben | hubbrader med Ansvarig = Bruce som han skapade eller sist rörde i fönstret; kön = hans rader i `Creative strat review`/`To be Reviewed` | |
| Vinnare | batcher med 🏆/💸: levande = etiketten ≤ 28 dygn och en annons ACTIVE; iterationer = batcher med `foralder` = vinnaren | kursen: tre inom 14 dagar; 0 efter 14 dagar eskaleras |
| Veckans utfall | batcher vars annonser fick en etikett med datum i de sju dygnen före körningen; `egen` = hubbens Ansvarig är Bruce | bästa först, en förlorare, resten som en rad, ingen leverans för sig; hook/hold bara på bedömbara och < 90 % |
| Hit rate | hans batcher med etikett ÷ (breakthrough + spend winner), två nämnare | alltid som bråk; kontots bredvid; 5–10 % nämns som referens, "not a grade" |
| Butikens namn | människotext i MEMO/LEARNINGS, eller titeln på hans egen rad | aldrig i en annons, en memo eller en lärdom |

**Människotext** = cellen är inte tom och börjar inte med systemets `(seeded`.
Det är hela ägarregeln i Growth Guide (`growthguide.mjs`): koden skriver om
mät- och systemkolumnerna varje rond, sår planeringscellerna en gång, och rör
aldrig det en människa skrivit. Därför överlever Bruces Done och hans text
varje rond, medan `last_edited_by` inte gör det (boten blir sista redigerare
igen när talen uppdateras) — snapshoten är måttet, inte tidsstämplarna.

**Fönstren.** Rutinen går tisdag 03:00 CEST (09:00 Manila), efter hans måndag
15:00 Manila och efter Matstrumporkungens eventuella rond måndag 07:00.
Veckan i rubriken är måndagens ISO-vecka. Etiketterna räknas i de sju dygnen
före körningen (tisdag till måndag), så en etikett skriven av kungen tisdag
07:00 kommer med nästa vecka, aldrig två gånger. Nya rader och hubbens
inlämningar räknas från förra körningens tidsstämpel (snapshotens `skrivet`).

**Action-itemet** väljs av läget i den här ordningen: bedömbara rader kvar i
kön → ingen ny rad → levande vinnare med färre än tre iterationer → Done utan
lärdom → hans bästa utfall i veckan → allmänt. Minnet ger nästa oanvända i
listan; är listan slut börjar den om. Hans svar läses ur NOTES på förra
veckans Log-rad och citeras i nästa feedback.

## Eskalering till Axel

Tre skäl, inget annat: ingen måndagskoll två veckor i rad (varken stängda
rader, ny rad eller inlämnade briefer), en levande vinnare utan en enda
iteration efter 14 dagar, eller butikens namn i en människoskriven cell. Då får
Log-raden en andra kommentar med @Axel, kort och på svenska, och rapporten i
chatten säger "Till dig:". Allt annat är information, inte en uppgift.

## Går INTE att mäta (och står därför inte i feedbacken)

- Om Bruce ÖPPNADE guiden utan att skriva — Notion har inga visningsloggar.
- Vem som satte ett värde när boten sedan skrivit om raden — ingen
  ändringshistorik i API:t (`/pages/{id}/history` svarar 400).
- Kopior av en förlorad imitation (ITERATIONS-PLAYBOOK: itereras aldrig) — en
  rad bär inte sin förälder på ett läsbart sätt förrän den har ett annonsnamn
  med `_i<n>p<förälder>`.
- NEW FOOTAGE-regeln på kodens egna rader: Filming betyder där "ingen annons
  uppe än", inte "kräver inspelning". Regeln påminns bara när HANS nya rad
  står i Filming.
- Raderade rader syns inte alls.

## Mätt 2026-10-03 (torrt, första körningen utan snapshot)

Ad Roadmap 105 rader (0 skapade av Bruce, 0 Done), hubben 86 rader med
titel (95 totalt, 9 utan), 43 hans. Kön: 77 rader med utfall, 4 bedömbara
(Sofie H1, haikuh2, d3, Nathalie 09-17). Stängda: 0. Ny rad: 0. Inlämnat
2–3/10: 8 hubbrader i `Creative strat review` (053, 059–062, 064, 066, 067).
Levande vinnare: Nathalie 09-17 (🏆, 9 dagar, 11 iterationer) och haikuh3
(💸, 12 dagar, 0 iterationer — eskaleras om ingen kommit vid 14 dagar). Hans
hit rate 0 av 1 med leverans (0 av 3), kontots 2 av 48. Action: stäng de
fyra bedömbara raderna först. Ingen eskalering. Hela texten i
`output/2026-W40/feedback.md` (gitignorerad). Inget skrevs i Notion — första
skarpa körningen är rutinens, tisdag 2026-10-06.

## Kvar

1. Rutinen byggs på Barkås-kontot efter merge (`create_session` med repot
   som källa + `create_trigger` med `persistent_session_id`, cron `0 1 * * 2`,
   prompt `/strategrapport --skarpt`), id:n skrivs i CLAUDE.md:s rutintabell
   när de setts i `list_triggers`.
2. Registrera rutinen i `stonebite/rutiner.json` EFTER första riktiga
   commiten (mönstret skrivs ur commit-rubriken `strategrapport <vecka>: …`,
   aldrig gissat).
3. Bruce bör ha ett Notion-konto som får notiser på @-omnämnanden; om han
   inte ser kommentaren (fråga honom efter första tisdagen) är reserven att
   han prenumererar på Log-databasen, eller Slack `U0BGVDLRH42`.
