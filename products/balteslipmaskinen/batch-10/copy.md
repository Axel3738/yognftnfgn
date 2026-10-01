# Batch #10 — copyn (2026-10-01)

⚠️ **Modellpolicy-avvikelse (CLAUDE.md regel 6):** den här körningen hade inget Agent-verktyg att spawna en sonnet-subagent med, och miljön saknar `ANTHROPIC_NYCKEL` (så `tools/copy-agent.mjs --modell sonnet` kunde inte köras heller — mätt 2026-10-01: `env` visar bara `NOTION_TOKEN`, `META_ACCESS_TOKEN`, `ELEVENLABS_API_KEY`). Huvudsessionen (Fable) skrev all svensk copy själv, samma avvikelse som batch #4 och #5 loggade, och körde tre-frågorstestet rad för rad i varje brief. Taggen `copy_model=fable-huvudsessionen` i varje brief säger det. Filen heter därför `copy.md`, inte `copy-sonnet.md`.

Alla rader utan tankstreck. Inget "10 sekunder". Inget butiksnamn, ingen policyrad. Sidans fakta: tre maskiner i en (slipband, polerhjul, knivslip), 7 hastigheter, 15 graders vinkel, knivar/trä/metall/smycken (aldrig yxor eller mejslar). Priset läst live 2026-10-01 06:06 UTC ur `baverbutiken.se/products.json`: 909 kr, jämförpris 1 182 kr.

## Rundan

| Annons | Rad | Visualisera | Falsifiera | Konkurrent kan signera | Varför den håller |
|---|---|---|---|---|---|
| PD_29_H2 hook | Hela lådan med knivar. En efter en genom bältet. | ✅ | ✅ | ❌ | knivarna och bältet är i bild; annonsens egen primärtext-öppning |
| PD_29_H2 alt | Alla knivar i lådan ska genom bältet. | ✅ | ✅ | ❌ | samma bild |
| PD_29_H2 alt | Lådan tömd på bänken. Varje kniv mot bandet. | ✅ | ✅ | ❌ | tömd låda på bänken |
| PD_29_H3 hook | Varje kniv på bänken går genom samma band. | ✅ | ✅ | ❌ | bandet är det hon pekar på |
| PD_29_H3 alt | Ett band. Varenda kniv från lådan. | ✅ | ✅ | ❌ | samma bild |
| PD_29_H3 alt | Samma band till varje kniv på bänken. | ✅ | ✅ | ❌ | samma påstående |
| PD_29 ärvda | Den skär tomaten utan att trycka. / Alla knivar. Klara. / 909 kronor. / Handla nu. | ✅ | ✅ | ❌ | förälderns egna rader, ordagrant (transkript 2026-10-01) |
| PD_29 copy card | Hela lådan med knivar, en efter en genom bältet. Sista kniven skär tomaten utan att du trycker. Bandet håller 15 graders vinkel. 7 hastigheter. 909 kr, jämförpris 1 182 kr. | ✅ | ✅ | ❌ | sidans fakta + sidans pris |
| PD_27_2 rubrik | Hela lådan vass. En kniv i taget. | ✅ | ✅ | ❌ | kniven mot bandet i fotot, lådan som omfång |
| PD_27_2 alt | Varje kniv i lådan genom samma band. | ✅ | ✅ | ❌ | bandet i fotot |
| PD_27_2 alt | Lådan tömd. Alla knivar vassa. | ✅ | ✅ | ❌ | två beats |
| PD_27_2 copy card | Hela lådan vass, en kniv i taget. Bälteslipmaskin Mini 3-i-1: knivslip och polerare. Bandet håller 15 graders vinkel, 7 hastigheter. 909 kr, jämförpris 1 182 kr. | ✅ | ✅ | ❌ | sidans fakta |
| SO_8_H1 hook | Farfars kniv. Slö, mörk och kvar i lådan. | ✅ | ✅ | ❌ | den mörka eggen är i bild; ingen slipare eller knivförsäljare kan signera en rad om kniven du redan äger |
| SO_8_H1 alt | Den gamla kniven. Mörk egg, kvar i lådan. | ✅ | ✅ | ❌ | samma bild |
| SO_8_H1 alt | Kniven han ärvde. Slö och mörk i lådan. | ✅ | ✅ | ❌ | ett tidigare utkast sa "slö i tjugo år" och ströks: talet går inte att kontrollera |
| SO_8_H1 rad 2 | Bladet mot bandet. Eggen kommer tillbaka. | ✅ | ✅ | ❌ | gnistorna i bild |
| SO_8_H1 rad 3 | Polerhjulet tar mörkret ur stålet. | ✅ | ✅ | ❌ | sidan: polerar metall; polerhjulet i bild |
| SO_8_H1 rad 4 | Samma maskin tar trä, metall och smycken. | ✅ | ✅ | ❌ | sidans användningsområden ordagrant |
| SO_8_H1 rad 5 | 7 hastigheter. 15 grader som bandet håller. | ✅ | ✅ | ❌ | sidans tal |
| SO_8_H1 rad 6 | Kniven är hans igen. | ✅ | ✅ | ❌ | den blanka eggen i bild |
| SO_8_H1 rad 7 | Länken ligger nedan. | ✅ | ✅ | ❌ | ingen deadline, inget butiksnamn |

## Fars dag-blocket (BOF, invändningen "han har redan en brynsten")

| Annons | Rad | Ord | Visualisera | Falsifiera | Konkurrent kan signera |
|---|---|---|---|---|---|
| FD_5_H1 hook | Brynstenen gör en sak. Den här gör tre. | 8 | ✅ | ✅ | ❌ |
| FD_5_H2 hook | 909 kr till fars dag. Ord. 1 182 kr. | 9 | ✅ | ✅ | ❌ (erbjudandefakta, sessionens dom) |
| FD_5_H3 hook | Beställ senast 19 oktober. Tre maskiner till fars dag. | 9 | ✅ | ✅ | ❌ |
| FD_5 rad 2 | Slipband, polerhjul och knivslip. Bandet håller 15 grader. | 8 | ✅ | ✅ | ❌ |
| FD_5 rad 3 | 7 hastigheter. Knivar, trä, metall och smycken. | 7 | ✅ | ✅ | ❌ |
| FD_5 rad 4 | Fars dag-rea: 909 kr, ord. 1 182 kr. Beställ senast 19 oktober. | 12 | ✅ | ✅ | ❌ (erbjudandefakta) |
| FD_5 skärm | Fars dag: en maskin, tre jobb · 909 kr, ord. 1 182 kr · Beställ senast 19 oktober · Bandet håller 15 grader · 7 hastigheter. Trä, metall, smycken. | ≤ 6 | ✅ | ✅ | ❌ |
| FD_6_1 | Brynstenen gör en sak. Den här gör tre. / Slipband, polerhjul och knivslip. Bandet håller 15 grader. | 8 / 8 | ✅ | ✅ | ❌ |
| FD_6_2 | Ordinarie pris överstruket. Fars dag-priset står under. / Tre maskiner i en till hans hobbybänk. | 7 / 7 | ✅ | ✅ | ❌ |
| FD_6_3 | Beställd i tid. På bänken till fars dag. / Datumet står längst ner. Tre maskiner i en. | 8 / 8 | ✅ | ✅ | ❌ |
| FD_6_4 | 7 hastigheter och 15 graders fast vinkel. / Slipband, polerhjul och knivslip. Knivar, trä, metall, smycken. | 7 / 9 | ✅ | ✅ | ❌ |
| FD copy card | Brynstenen gör en sak, den här gör tre: slipband, polerhjul och knivslip. Bandet håller 15 graders vinkel, 7 hastigheter. Fars dag-rea: 909 kr, ord. 1 182 kr. Beställ senast 19 oktober. · rubrik: Tre maskiner i en till fars dag · beskrivning: Fars dag-rea: 909 kr, ord. 1 182 kr | — | ✅ | ✅ | ❌ |

**Regel 3 ur Brief review 2026-09-29 (en statisk säger varje fakta en gång):** i FD_6_2 och FD_6_3 står talen bara i prisbandet respektive bottenraden; rubriken pekar dit ("Ordinarie pris överstruket. Fars dag-priset står under." / "Datumet står längst ner.") i stället för att upprepa 909 kr eller 19 oktober. FD_4_2 och FD_4_3 (2026-09-29) skrev talet två gånger — det var det regeln föddes ur.
