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
| Kön vid veckans början | förra snapshoten: rader med RESULTS som inte är stängda | stängd = STATUS Done, eller "Too little data" skrivet av en människa (SOP steg 1 säger "Next row" utan Done); delad på grinden 300 kr OCH 3 köp |
| Stängda rader | nu: människotext i LEARNINGS och stängd, som inte var det i snapshoten | under grinden ska texten vara "Too little data"; över grinden ska en rad börja "Guess:" — avvikelser står i feedbacken |
| Done utan lärdom | STATUS Done, LEARNINGS tom eller bara systemets sådd | "A row is Done when LEARNINGS is written" |
| Ny konceptrad | rader med `created_by` = Bruce, skapade sedan förra körningen | de sex cellerna (MEMO utan "(seeded", DESIRE, SUB AVATAR, ANGLE(S), AWARENESS, AD TYPE); fler än en ⇒ "the SOP says one per week" |
| Hubben | rader med Ansvarig = Bruce som han skapade eller sist rörde i fönstret ("worked on"); de av hans rader som gått från kö till `Approved …` sedan förra snapshoten ("went live"); kön = hans rader i `Creative strat review`/`To be Reviewed` | hubbarbete är hans vanliga jobb, det bevisar inte måndagskollen |
| Vinnare | batcher med 🏆/💸: levande = etiketten ≤ 28 dygn och en annons ACTIVE; iterationer = batcher med `foralder` = vinnaren, räknade som LIVE (annons-id i kontot) och briefade för sig | kursen: tre live inom 14 dagar; 0 live efter 14 dagar eskaleras |
| Veckans utfall | batcher vars annonser fick en etikett med datum i fönstret; `egen` = hubbens Ansvarig är Bruce | bästa först, en förlorare, resten som en rad, ingen leverans för sig; hook/hold bara på bedömbara och < 90 % |
| Hit rate | hans batcher med etikett ÷ (breakthrough + spend winner), två nämnare, iterationer av en vinnare för sig | alltid som bråk; kontots bredvid; 5–10 % nämns som referens, "not a grade" |
| Butikens namn | hans eget konceptnamn eller en människoskriven memo | mjuk påminnelse, aldrig eskalering: regeln gäller annonsen, en lärdom får nämna sajten |

**Måndagskollen** = SOP:ens två steg: minst en stängd rad med lärdom ELLER en
ny konceptrad. Hubbrader han rört räknas inte (första torrkörningen hade
annars sagt "kollen gjord" på en vecka med 0 stängda och 0 nya rader).

**Människotext** = det som står EFTER systemets slutmarkör `(end of seed)`
(`growthguide.mjs SEED_SLUT`). Bruces SOP säger "write under any text
already there", så sådden får stå kvar och hans rader under den är hans.
Ronden skriver om en sådd bara när inget står efter markören; en sådd från
före 2026-10-03 utan markör räknas som människans bara när SOP:ens egna ord
("Too little data", "Guess:") finns i den. Därför överlever Bruces Done och
hans text varje rond, medan `last_edited_by` inte gör det (boten blir sista
redigerare igen när talen uppdateras) — snapshoten är måttet, inte
tidsstämplarna.

**Hans batcher** hittas via hubben i fyra steg (`growthguide.mjs
hubbUppslag`): exakt annonsnamn → utan `_v<n>` → uppladdarens källa
(`UPPLADDAD kalla: 'Drive 022_H1.mov'` ⇒ hubbraden "022") → samma löpnummer,
vinkel och format (`…_048h1_v1` ⇒ `…_048_v1`). Mätt 2026-10-03: exakt namn
träffade 25 av 260, med alla fyra stegen får hans etiketterade batcher
AUTHOR (9 med etikett i stället för 3).

**Fönstren.** Rutinen går tisdag 03:00 CEST (09:00 Manila), efter hans måndag
15:00 Manila och efter Matstrumporkungens eventuella rond måndag 07:00.
Veckan i rubriken är måndagens ISO-vecka. Etiketterna räknas från dagen
efter förra körningens fönster till i går (första gången: sju dygn), aldrig
längre bakåt än 28 dagar — en missad tisdag tappar alltså ingen etikett, och
ingen räknas två gånger. Nya rader och hubbens aktivitet räknas från förra
körningens tidsstämpel (snapshotens `skrivet`).

**Action-itemet** väljs av läget i den här ordningen: bedömbara rader kvar i
kön → ingen ny rad → levande vinnare med färre än tre iterationer → Done utan
lärdom → hans bästa utfall i veckan → allmänt. Minnet ger nästa oanvända i
listan; är listan slut börjar den om. Hans svar läses ur NOTES på förra
veckans Log-rad och citeras i nästa feedback.

## Eskalering till Axel

Två skäl, inget annat: ingen måndagskoll två veckor i rad (räknat på
distinkta veckor före den som mäts — en `--igen` samma vecka räknas inte),
eller en levande vinnare utan en enda live iteration efter 14 dagar. Då får
Log-raden en andra kommentar med @Axel, kort och på svenska, och rapporten i
chatten säger "Till dig:". Allt annat är information, inte en uppgift.

## Säkert att köra om

Bruces egna ord fäller aldrig körningen: titlar och NOTES-svar tvättas med
`text.mjs rensa` (kronor, ROAS, CPA, köp, SEK, butiksnamn, `.se`, tankstreck)
innan de sätts in, och ett citat som ändå faller på spärren byts mot "you
answered in NOTES". Log-raden återanvänds på titeln, kommentaren hoppas när
en med samma första rad redan finns på raden (`notion.mjs harKommentar`), och
ett POST som skapar görs aldrig om på 5xx. Faller Notion mellan raden och
kommentaren skrivs inget minne; nästa körning tar vid utan dubbletter. NOTES
som inte går att läsa skiljs från NOTES som är tom.

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
- "Brief saknas" på hans egen planeringsrad: inget binder hans rad till
  kodens batchrad (den får sitt nummer först vid uppladdningen), så en sådan
  flagga hade nagrat honom om briefade koncept. Mäts inte.
- Raderade rader syns inte alls.

## Mätt 2026-10-03 (torrt, första körningen utan snapshot)

Ad Roadmap 105 rader (0 skapade av Bruce, 0 Done), hubben 86 rader med
titel (95 totalt, 9 utan), 43 hans. Kön: 77 rader med utfall, 4 bedömbara
(Sofie H1, haikuh2, d3, Nathalie 09-17). Stängda: 0. Ny rad: 0 ⇒ ingen
måndagskoll (han rörde 8 hubbrader i `Creative strat review` 2–3/10: 053,
059–062, 064, 066, 067). Hans utfall i fönstret: 047 loser, 044/045/046
ingen leverans (mini-clipsen ur hubbraderna 022–025, kopplade via
uppladdarens källa). Levande vinnare: Nathalie 09-17 (🏆, 9 dagar, 5 live
iterationer + 6 briefade) och haikuh3 (💸, 12 dagar, 0 — eskaleras om ingen
är live vid 14 dagar). Hans hit rate 0 av 2 med leverans (0 av 9), kontots 2
av 48. Action: stäng de fyra bedömbara raderna först. Ingen eskalering. Hela
texten i `output/2026-W40/feedback.md` (gitignorerad). Inget skrevs i Notion
— första skarpa körningen är rutinens, tisdag 2026-10-06.

Tre granskare (logik mot datan, regler/ton, Notion-I/O) läste bygget samma
dag; det som rättades: hans egna ord kunde fälla körningen (spärren),
måndagskollen räknades gjord av hubbarbete, text under sådden räknades inte
och hade skrivits över av ronden (slutmarkören), hans batcher saknade AUTHOR
(hubbuppslaget), briefade iterationer räknades som live, `--igen` dubblade
sviten, Spend Winner-raden lät som ett faktum, "no delivery"-itemet dömde
hooken, Axels rad bar engelska, och K5 "brief saknas" gick inte att mäta
rättvist.

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
