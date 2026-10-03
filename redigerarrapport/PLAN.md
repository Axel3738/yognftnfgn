# Veckorapporten till redigerarna — planen (2026-10-02)

**Axels beställning 2026-10-02:** varje vecka ska redigerarna förstå vilka av
sina annonser som presterar. En Discord-post per redigerare: hennes annonser
som fick mest spend, utfallet (breakthrough, spend winner, KPI winner, loser,
ingen leverans), vad det betyder, varför det kan ha blivit så utifrån briefen
och klippningen, och ETT litet action item per vecka med förberedda action
items per utfall. Chadbot är frågad och svaret är kontrollerat mot kursen
(`docs/os/evolve/SVAR.md` → "Veckorapporten till redigerarna"). Det här är
planen vi bygger efter. Inget är byggt än.

---

> **Läget 2026-10-02 kväll: byggt och torrkört, inte postat.** Koden ligger i
> den här mappen (`README.md` har delarna, körningen och vad som återstår),
> 71 tester gröna, W39 torrkörd: 21 av 59 bedömbara annonser fick en person
> (36 %, upp från 8 %). Axels beslut i avsnitt 8. **PR #351 mergad och
> rutinen byggd 2026-10-03** (trigger `trig_01McuhAA4Xm8aFA7PJPwwAGp`, fast
> session `session_01GneESZrfpo5tLCp2jnZuYM`); första posten måndag
> 2026-10-05 03:06 CEST.

## 1. Det viktigaste fyndet: kopplingen annons → redigerare är flaskhalsen

Mätt 2026-10-02 över ISO-veckorna W36–W40 (annonsens egen första vecka,
grinden ≥ 300 kr OCH ≥ 3 köp, kopplingen via `commission/koppling.mjs` mot
26 hubbar lästa med `NOTION_TOKEN`):

| Verksamhet | Etiketterade | Bedömbara (OCH) | Kopplade till en person via hubbrad |
|---|---|---|---|
| Bäverbutiken SE | 1 446 | 90 | 14 (Carl 9, Jerzee 5) |
| Bäverbutiken NO | 786 | 47 | 0 (norska namn matchar ingen svensk rad) |
| CaraShell DK + UK | 632 | 37 | 0 (spegelnamn +100 och US-kopior) |
| Matstrumpor | 96 | 5 | 0 (hubben heter "022", kontot `MATSTRUMP_…044h1`) |

Josh 18 och Annabelle 15 kopplades bara via **produktägaren** i
`commission/produkter.json`, som säger vem som äger produkttestet, inte vem
som klippte. Jasper 0 av 48. Gilz 0 av 96. Per redigerare och vecka ligger
det hubbkopplade på **0–4 annonser**. En veckorapport per person blir alltså
oftast tom i dag, hur bra motorn än är.

Tre orsaker, alla i koden:
1. `commission/notion.mjs` hittar bara hubbar vars titel slutar på "creative
   hub" plus `hubbar.json`. Nya BÄVER-hubbar (Värmesitsen, Driftbilen,
   Maskinhyllan, Sotarsetet, Solcellslampan …) lästes aldrig: 35 av 43
   okopplade SE-annonser har ingen hubbrad alls, 8 har rad utan Ansvarig.
2. Matstrumpors hubbrader bär arbetsnamn (`022`, `B_Mini-clip_UGC_05`) och
   `matstrumpor/kanda-namn.json` är en platt lista utan mappning arbetsnamn →
   kontonamn. Mappningen finns bara i prosa i `batch-log.md`.
3. NO-annonser och CaraShells speglar (`CaraShellRoof_…` = Bäver-nummer + 100,
   US-kopior) har ingen baklängesmappning till den svenska källraden.

**Därför är steg 1 i bygget kopplingen, inte rapporten.**

## 2. Reglerna (kontrollerade mot kursen, inte mot botens tal)

Tolv regler, utskrivna med källa i `docs/os/evolve/SVAR.md` → "Vad vi tar med
oss". Kort:

1. Etikett först efter annonsens EGEN kompletta vecka 1. Måndagspost på
   helveckan. Mitt-i-veckan-lansering = "label next Monday".
2. Etiketten höjs vecka 2–3, sänks aldrig; posten säger vilken vecka.
3. INGEN_LEVERANS ur nämnaren men synlig med orsak. "Adsetet svalt" är inte
   redigerarens fel; tills adsetets spend läses: "reason not measured".
4. Hit rate som bråk ("2 of 9"), iterationer märkta separat, riktmärke 5–10 %
   / 2–4 % utan betyg.
5. Inga kronor, ingen ROAS, inga köp, ingen CPA i posten. Andel i procent
   bara om Axel säger ja.
6. "Varför" i kursens ordning: spend → KPI → mjuka mått. Klippet pekas ut
   bara vid mätt avvikelse från regitabellen (`utford_som_briefad` = nej),
   annars "you cut it as briefed".
7. Hook/hold bara när annonsen är bedömbar, alltid bredvid kampanjens vinnare.
8. ETT action item per redigerare och vecka.
9. 10 % spend-andel är inte en grind. Vår grind: komplett vecka + ≥ 10 kr;
   `bedombar` som flaggan "thin data". EN definition av `bedombar` (Axel).
10. Förloraren får lika mycket text som vinnaren. Ingen jämförelse mellan
    personer i posten.
11. Koppling bara via hubbradens Ansvarig. Aldrig gissad mention.
12. Posten är underlaget till lärdomscallen, inte callen.

## 3. Posten (engelska, en per redigerare, måndag)

Mallen. Allt inom `<…>` fylls av koden; talen här är platshållare, aldrig
exempel på riktig data. Inga tankstreck, inga butiksnamn, inga kronor.

```
Weekly ad report, week <nn> (<date> to <date>), for <first name>

Best first: <ad name> took the most of its campaign among your ads this week.
Label: <label> (week <1|2|3><, up from <label>>).
<Label line, see section 4.>
Hook rate <x> %, hold <y> %. The campaign's top ad sits at <x> % / <y> %.
Cut as briefed: <yes | no: <row n> differs | not measured>.
Our best guess, not a fact: <diagnosis line, see section 5>.
What we test next: <next iteration from the playbook>.

One loser we can learn from: <ad name>. Label: <label>.
<Label line.> <Diagnosis line.> <Cut as briefed line.>

Not finished yet: <ad name> (launched <weekday>), label next Monday.
No delivery: <ad name>. Meta never showed it, so there is nothing in the
numbers to read and it does not count in your hit rate.

Your hit rate, last 5 weeks: <k> of <n> ads that got delivery (<m> of them
iterations of an existing winner). Benchmark across accounts: 5 to 10 %.

One thing for this week: <action item from the bank, section 6>. Reply here
by Thursday.

What would make the next cut easier: a clearer source list, or more hook
options in the brief?
```

Spärrar i koden: strängen får inte innehålla `SEK`, `kr`, `ROAS`, ett annat
redigerarnamn eller ett annonsnamn som inte är hennes. Ett test matar en rad
med spend 12 345 kr och kräver att "12" inte finns i posten. Svensk text
stoppas av `tools/lib/engelska.mjs`.

## 4. Etikettraderna (engelska)

| Etikett | Raden i posten |
|---|---|
| BREAKTHROUGH | Breakthrough: this ad took <share> % of its campaign in week one and the campaign grew with it. We build three iterations on it within 14 days, and your cut is now the reference every other ad in the campaign is read against. |
| SPEND_WINNER | Spend Winner: Meta found the audience and spent on it, but it did not turn that into enough purchases. That is about belief, urgency or the landing page, and it is ours to fix in the next brief, not yours in the edit. |
| KPI_WINNER | KPI Winner: it converts when it is shown, but Meta shows it little. That usually means the first 3 seconds, so we read hook rate first, then hold, before we decide what changes. |
| LOSER | Loser: this angle did not stop enough people. <Cut as briefed line.> |
| INGEN_LEVERANS | No delivery: Meta never showed this one, so there is nothing in it to read and it does not count in your hit rate. The only thing worth a second look is the first frame, because that is what Meta judged. |

Andelen (`<share> %`) skrivs bara om Axel sagt ja (beslut 1).

## 5. Diagnosen: brief eller klipp, på våra egna mått

Måtten är `matstrumpor/meta.mjs tolkaRad` (Evolves definitioner sedan
2026-10-01: hook = 3-sek-visningar ÷ visningar, hold = ThruPlay ÷ visningar).
Trösklarna är kursens där de finns, annars "ingen källa". Ordningen är
kursens: fick den spend → är den på KPI → först sedan mjuka mått.

| Mönster | Mått | Tröskel | Brief eller klipp | Raden (engelska) |
|---|---|---|---|---|
| Låg hook rate | hook_rate | under ~30 % lågt (Evolve); 53 % högt, 37 % "not that great" (kursen); brus under ~50 visningar | Klipp om bilden i sekund ett inte visar det raden talar om (hook-visual-regeln); brief om hookidén inte väcker nyfikenhet | Hook rate <x> %, under the 30 % line we use for every ad: the first 3 seconds did not stop enough people. Our best guess is <the picture in second one / the hook line itself>. |
| Bra hook, hold faller | hook_till_hold, p25–p100, snitt speltid | ~15 % hold "good" (kursen, definition oklar); ingen källa för hook_till_hold | Faller den vid ett klipp: tempo (klipp). Faller den när påståendet landar: bryggan (brief, fel 6) | The hook worked, <x> % stopped, but by a quarter of the video only <y> % were still there. On a cut it is pacing; on a claim it is the script. |
| Hook och hold bra, låg konvertering | konv_lpv, ATC (byggs) | CVR 2,34 % "solid" (kursen); ATC < 8 % = annons och sida säger olika saker (Chadbot) | Strategi, aldrig klipp: tro, brådska, funnel, erbjudande. Redigerarens enda del: bevisbilden saknas inom 2 s från påståendet | People stopped and stayed, so the cut did its job. The ad did not turn that into enough purchases, which is about belief, urgency or the landing page, and that is ours to fix. |
| Hög hook, fel publik | hook_rate hög, konv_lpv och ctr låga | ingen källa för tal | Brief (fel 4, fel 12) | A high hook rate only counts when it stops the right people. This one stopped many, but few wanted the product, and that is a brief change. |
| Låg klick trots hold | ctr_lank, p100 | 0,5 % "very low" (kursen, outbound) | Brief om CTA-beatet ligger i klippet; klipp om CTA-raden saknas eller är beskuren | They watched to the end but few clicked. If the CTA is on screen as the direction table says, the promise is too weak; if the CTA line is missing, that is the edit. |
| Avvek från regin | `utford_som_briefad`, regitabellen, de fyra stoppreglerna | ja/nej per rad | Klipp. Sägs rakt, en gång. Annonsen stängs aldrig av | The caption on row <n> says a different line than the direction table, so this week's result tells us about the caption, not the concept. Next version: the exact line, same timing. |
| Hög CPM | cpm_sek | ingen källa | Varken: publik, vinkel eller utmattning | This ad was expensive to show, which is about the audience or ad fatigue, not about the cut. Nothing for you to change here. |

`utford_som_briefad` finns på agent-grenens ETIKETT-rad men inte i
Matstrumpors logg, och 3 787 av 3 880 Bäver-rader är backfill med "okänd".
Tills fältet skrivs vid dag 7 står "not measured" i posten, aldrig en gissning.

## 6. Action item-banken: ett per vecka, ur den högsta etiketten

Byggd ur kursens hantverksregler och vår playbook (`matstrumpor/lardom.mjs`
`PLAYBOOK_PER_UTFALL`). Varje item är görbart på under en timme och mätbart
så nästa post kan börja med "did it happen?". Inom redigerarens latitude
(`docs/os/BRIEF-REGI.md`: aldrig ändra en svensk rad, hookraden eller dess
timing; bilden inom motivet får hon ändra). Iterationer som kräver nya
manusrader är briefer från oss, aldrig action items.

**INGEN_LEVERANS**
1. Show the first frame of this ad to one person for two seconds, then ask what they saw first, second and third. Reply with the three answers. *(The Art of 1 Frame, 2-second test)*
2. If the brief carries a hook you have not cut yet, cut it onto the same body and deliver it as the next H number. Only the first 3 seconds change. *(lardomar.md batch 0c; tre hookar delar en hold)*
3. Read the hook rule (emotion, curiosity gap, stakes, start in the action, understandable with sound off) and reply with one line on which of those your first 3 seconds had. *(ITERATIONS-PLAYBOOK §10)*
4. Spend 30 minutes in the Meta Ad Library on three ads in our product's category that have run the longest; post a screenshot of each first frame and one line on what physical object is in it. *(Ad Inspiration System; copy-reglerna: aldrig ett märke)*

**LOSER**
1. Play the first second with the sound off and write down the one physical object you see. If the answer is a person, text only, or nothing, propose one replacement shot from the brief's source list. *(hook-visual-regeln; fel 1 och 4)*
2. Watch seconds 3 to 8 and note the longest stretch where nothing new happens on screen. Reply with that number of seconds and the timestamp. *(Mr. Beast Retention; fel 6)*
3. Read the eight causes in the Loser playbook and reply with the one number you think fits this ad, in one sentence. *(ITERATIONS-PLAYBOOK §4)*
4. Re-cut only the first 3 seconds: same hook line, same timing, a different picture from the source list that shows the object the line talks about. Deliver as the next H number. *(fel 1; BRIEF-REGI latitude)*

**KPI_WINNER**
1. Compare this ad's hook rate with the campaign's top ad named in the post, and reply with one line on what the top ad shows in its first frame that yours does not. *(CS-KLART 11; "compare to known winners")*
2. Duplicate the sequence and cut the next unused hook from the brief onto the same body, with the hook text on screen for 3 to 5 seconds. Deliver one file. *(Ad Ideas 101: Iteration)*
3. Read the comments on this ad and reply with the three most repeated questions or objections, quoted word for word. *(manus-7)*
4. Read the KPI Winner note: a low share with a few purchases can be a loser that got lucky, and an offer ad is not expected to scale. Reply which of the two you think this is. *(ITERATIONS-PLAYBOOK §4)*

**SPEND_WINNER**
1. Read the last 30 comments on this ad and post the three most common objections word for word, with how many times each came up. *(CS-KLART 10)*
2. Open the page the ad links to and write one line: does the page make the same promise as the hook? Quote the first sentence on the page that says something different. *(fel 11; ATC-ramen)*
3. Find the timestamp of the ad's biggest claim and reply whether a proof shot (review, demo, number) is on screen within 2 seconds of it. If not, propose one from the source list. *(fel 5 och 7; "Prata inte. Peka.")*
4. Read the Spend Winner playbook: fix belief, urgency or page congruence before any new hook or format. Reply with one sentence on which of the three this ad lacks. *(ITERATIONS-PLAYBOOK §5)*

**BREAKTHROUGH**
1. Write four lines with timestamps: which shot is the hook, which is the bridge, which is the hold, which is the CTA. We use it to build the next three iterations. *(ANALYSMETOD 6b komponentkarta)*
2. Study this winning ad the way the course does: 20 to 30 minutes, then reply with one line on what you think carried it and one line on what you would not change. *(Nov 21 [29:28])*
3. Prepare the hook-swap master: duplicate the sequence and put the hook beat (0 to 3 s) on its own clip so the next three H-variants only replace that clip. Reply with the project link. *(CS-KLART 9; Video Editing Breakdown 1 3/3)*
4. Read the comments on your winner and reply with the three most repeated objections, quoted. They become the first objection-handling iteration. *(manus-7)*

Valet per vecka: första ogjorda i listan för hennes högsta etikett; gjorde
hon förra veckans item står det i posten ("Last week you …"). Svaren samlas
inte automatiskt (kursen har inget format för det).

## 7. Bygget, i ordning

1. **Kopplingen** (`redigerarrapport/koppling.mjs`, återanvänder
   `commission/koppling.mjs`): (a) hubbarna hittas som i `/notionkorning`
   (alla databaser integrationen ser, minus OPS och andra verksamheter per id),
   inte på titeln; (b) Matstrumpor: `kor.mjs --dop` skriver kontonamnet på
   hubbraden, och en tabell `matstrumpor/arkiv/namn.json` arbetsnamn →
   kontonamn fylls ur loggen (UPPLADDAD/OMDOPT) så gamla rader går att koppla;
   (c) NO och speglar: `_NO_` och `+100` löses till den svenska källraden med
   samma regel som `/ops-spegla` använder framåt. Mätning efter: andel
   bedömbara annonser med en person, per verksamhet. Målet är över 80 %.
2. **En grind.** `bedombar` = Axels beslut 2, inskrivet i `matstrumpor/konfig.json`
   och `docs/os/ANALYSMETOD.md` så båda motorerna säger samma sak.
3. **Etiketterna för Bäverbutiken och CaraShell på `main`.** `agent/` finns
   bara på grenen `claude/daily-agent-discussion-uos5df` (diverged sedan
   2026-08-20, 527 commits före, 4 407 efter): kopiera `agent/etikett.mjs`,
   `lardom.mjs`, `budgetlogg.jsonl` (utan `utdata/`) till `main` i stället
   för att merga. Rapporten läser loggarna, hämtar aldrig själv ur Meta.
4. **Motorn** `redigerarrapport/kor.mjs`: loggar → etiketter per annons med
   komplett vecka → person → en fil per redigerare
   (`redigerarrapport/output/<vecka>/<redigerare>.md`) → Discord-post med
   `<@id>` via `stonebite/kallor/discord.mjs skickaTillKanal`
   (`allowed_mentions` låst). `--torr` skriver bara filerna. Redigerare utan
   Discord-id får filen, aldrig en gissad mention.
5. **Rutinen** `/redigerarrapport`, måndag 09:00 Manila (03:00 CEST, cron
   `0 1 * * 1` UTC) så posten ligger där när de börjar dagen, efter att
   nattvakten (00:01) och kungen (07:00 CEST söndag) skrivit etiketterna.
   Fast session med repot som källa, som alla andra rutiner. ✅ Byggd
   2026-10-03 på Barkås-kontot: `trig_01McuhAA4Xm8aFA7PJPwwAGp` +
   `session_01GneESZrfpo5tLCp2jnZuYM`, sedd i `list_triggers`.
6. **Efter två veckor:** mät om redigerarna svarar på action items och
   frågan i slutet. Inget svar på två veckor ⇒ frågan ändras, inte tas bort.

## 8. Axels beslut (2026-10-02)

1. **Andel av kampanjens spend i procent till redigerarna: A, ja.** Procent
   och etikett visas. Kronor, ROAS, köp och CPA aldrig.
2. **EN grind för `bedombar`: A, 300 kr OCH 3 köp** (ANALYSMETOD). Matstrumpor
   räknade ELLER till och med 2026-10-02 och byts. Mätt W39 i SE: 22
   bedömbara med OCH, 52 med ELLER.
3. **Discord-id:n, Axels lista samma dag**, slagna upp med `members/search` i
   Bäverbutikens server `1540322130388983921` och inskrivna i
   `dashboard/data/team.json` (`discordUsername`, `discordUserId`): Josh
   `wang3729` → `930484161070899252`, Annabelle `anna_gonzales_17839` →
   `1194906296403632142`, Jerzee `jerz7108` → `540463446546841610`, Carl och
   Jasper som förut. **Gilz `gilzbrucebiazon` finns inte i servern** och
   får sedan 2026-10-03 ingen post alls (punkt 8 nedan). Posten går i
   Bäverbutikens server för alla som får en.
4. **`tools/discord-rapport.mjs` och "Spend: N SEK" i OPS-servrarnas `#ads`:**
   inte avgjort än. Rapporten här kopierar inte den raden.
5. **De olästa lektionerna: lästa 2026-10-02** (`docs/os/evolve/REDIGERARE-LEKTIONER.md`),
   ingen regel ändrad.
6. **Josh och Annabelle får ingen rapport** (Axel 2026-10-02: "dom gör andra
   uppgifter"). `konfig.json` → `utan_redigerare`. Produktägarreserven är borttagen.
7. **Första posten går måndag 2026-10-05 via rutinen**, inte som testpost.
   Rutinen finns (punkt 5 ovan).
8. **Gilz (Bruce) får ingen rapport** (Axel 2026-10-03: "Bruce jobbar bara
   på Matstrumpor. Och han är creative strat så jag tror inte denna behöver
   vara tillämpad på han"). `konfig.json` → `utan_redigerare`. I stället
   utvärderar han sig själv varje vecka enligt en enkel SOP, byggd samma dag:
   `matstrumpor/sop/BRUCE-WEEKLY-SELF-REVIEW.md` (+ PDF), med Growth Guide i
   Notion som facit. Posterna går till Carl, Jerzee och Jasper.

## 9. Olästa lektioner som kan ändra reglerna

Kräver `SKOOL_EMAIL` + `SKOOL_PASSWORD` i miljön (saknas här 2026-10-02):
"How To Get A-Players Editors & Content" (13 141 tecken), "How To See Ads
Performance + Our Columns", "How To Do Learnings - Questions", "How To Train
Editors On AI", "How To Get Viral UGC Inspo". Id:n i `docs/os/evolve/FRAGOR.md`.
Läs dem innan reglerna låses i kod.
