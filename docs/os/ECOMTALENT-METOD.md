# Ecomtalent-metoden — kursen redigeraren går, översatt till vårt system

Redigeraren som tränas till creative strategist / brief writer går kursen
**Ecomtalent for Brands** (plus Ecomtalent AI och veckosamtalen). Axel har
transkriberat hela kursen — tre filer, ~430 000 ord, ligger *inte* i repot. Det här
är destillatet: vad kursen lär ut, vilka ord den använder, var vårt system redan gör
samma sak, var det skiljer sig och vad vi tar in. Läs den innan du läser eller skriver
en brief tillsammans med honom. Skriven 2026-09-14 efter hans två första dokument
(strategy brief + avatarpresentation för sushistrumporna).

---

## Kursens kärna i en mening

> "Creative strategy is figuring out how to make people interested in buying your
> product by understanding what they really want."

Bilden kursen återkommer till: **Bob står på en klippa** (nuläget: problem, rädslor)
och vill över till den andra klippan (önskan, drömläget). Produkten är bron. Strategens
jobb är att ta reda på vem Bob är, vad han flyr från och vad han vill till — och först
därefter placera produkten som bro. Tidsfördelningen kursen predikar: **80 % research,
20 % redigering.** "Your research document is still your number one source for ad
ideas" — allt annat (swipes, spy-verktyg) kallas "rocket fuel".

---

## Kursens karta — stegen i ordning, och var vi redan har dem

| # | Kursens steg | Vad det producerar | Vår motsvarighet |
|---|---|---|---|
| 1 | **Onboarding form** — brand, sajt, content, differentiator, konkurrenter, kundenkäter, recensionsexport | Grunddata om brandet | `CLAUDE.md`, `products.json`, `docs/matstrumpor-dna.md` |
| 2 | **Initial research** — en ~14-sidig prompt i Claude med webbsök ger ett 34–45-sidigt "market research document": desires rankade 1–10 med 5–7 exempel på kundens exakta språk per desire, problem, 7–10 alternativa lösningar, 20–25 konkurrent-hooks, 15–20 invändningar, sofistikerings- och medvetenhetsnivå, konceptförslag | Researchdokumentet | `docs/matstrumpor-voc-presentkop-2026-08-23.md` (11 Reddit-trådar + konkurrentspaning), `matstrumpor-konkurrent-svenskhusman`, `matstrumpor-dtc-gifting-research`, `matstrumpor-q4-playbook`, `docs/swipes/` |
| 3 | **Data collection** — ad account audit (vinnare + "graveyard", transkriberade) och content audit | Vad som funkat, vad vi har att klippa i | `docs/matstrumpor-batch-log.md` (avläsning 1), `theme-matstrumpor/ugc-bilder/`, Notion-hubben |
| 4 | **Data consolidation** — allt om brandet i en mapp | En sanning | Repot |
| 5 | **"Brand AI"** — ett Claude-projekt per brand med kunskapsbasen ovan + prompter för avatar, desires, comment mining, copy, manus, review | En AI som kan brandet | **Det här repot + Claude Code.** `CLAUDE.md` är projektinstruktionen, `docs/` är kunskapsbasen |
| 6 | **Growth Guide** — Google Sheet där varje koncept loggas: batch, konceptnamn, avatar, desire, awareness level, förklaring ("what are you creating/testing and what gives you confidence that this test will improve overall performance"), typ (imitation/ideation/iteration), format (static/video/promo), resultat (working → learning → done: winning/losing), lärdom, hit rate | Planeringen + minnet | `docs/matstrumpor-backlog.md` (från 2026-09-14 i samma kolumner) + `matstrumpor-batch-log.md` |
| 7 | **Ad Ideas 101** — imitation, ideation, iteration (se nedan) | Konceptidéer | `/koncept` + källregeln (playbook-vinnare, winning line eller swipe) |
| 8 | **Copy & manus** — 14–15-sidiga prompter i Brand AI; manusprompten frågar "general, organic eller storytelling?" och levererar sex hooks, ett manus och en "strategic breakdown". Läraren: manusen är "80 % there" och justeras alltid i chatten | Orden | `docs/copy-regler.md` + subagent (regel 6), `docs/creative-strategy.md` |
| 9 | **Production** — briefen (idé, copy, "why we think it could work", footage, visuell inspiration) → redigering | Annonsen | Redigerarna, Notion, `/plan` |
| 10 | **AI ad review** — checklista byggd på vad 10–15 vinnare hade gemensamt | Grind före launch | `/granska` + tre-frågorstestet |
| 11 | **Testing** — tre varianter per koncept, ~7 dagar, CBO | Data | **Regel 11: test-ABO med lika budget.** `ANALYSMETOD` |
| 12 | **Feedback loop** — en "learning" per annons, veckovis learnings-call, hit rate | Att systemet lär sig | `/cs`, `batch-log.md`, `dna.md` |

Kursens kortare "Ad Creation Process" ur fundamentals är samma sak i sju ord:
research → brainstorming → strategy → copywriting → production → testing → iteration.

---

## Orden redigeraren kommer att använda

**Avatar.** En specifik person med namn, ålder, ansikte och historia — inte "kvinnor
24–45". Kursens avatarprompt bygger fem per brand, en i taget, med fälten: kort
beskrivning, vad hen vill, huvudproblem, de fem starkaste känslorna kring problemet,
största rädslor och hur de påverkar livet, viktiga relationer, lösningar som redan
prövats, "sound bites" om varför de misslyckades, vad hen *inte* vill göra för att lösa
det, "genie-frågan" (om en ande kunde trolla fram den perfekta lösningen — hur ser den
ut?), marknadsspecifikt. Avataren uppdateras när annonsdata visar nya mönster.

**Mass desire.** Önskan som redan finns i marknaden. "Desires are already flowing to
the market like a river and your only job as a marketer is to direct that flow towards
your product." Tio per brand, i jag-form. Varje produkt är två produkter: den fysiska
(plast och motor) och transformationen (kändishår). "People don't buy products, they
buy better versions of themselves." Visa, påstå inte — påståenden slår på "skeptic
mode".

**Awareness level** (Schwartz, *Breakthrough Advertising*). Unaware → problem aware →
solution aware → product aware → most aware. Annonsen måste bära tittaren genom varje
nivå som återstår: börjar du hos unaware ska annonsen ta hen hela vägen till offer.
Unaware är svårast och dyrast men öppnar en ny marknad. Problem aware vill ha
"det här är jag"-igenkänning. Solution aware vill veta varför vår lösning slår de
andra. Most aware vill ha offer.

**Market sophistication** 1–5, paraply-liknelsen. Nivå 1: säg vad det gör. Nivå 2:
större claim. Nivå 3: ny mekanism. Nivå 4: mekanismtrötthet, alla överdriver. Nivå 5:
ingen tror på någon längre — byt till identitet, värderingar och nisch ("det svarta
paraplyet som statement", "paraplyet för barn under åtta"). Räkna även indirekta
lösningar på samma problem.

**Imitation / ideation / iteration.** Se eget avsnitt nedan.

**Hook text.** Stor, tydlig text överst i bild från första bildrutan som ger kontext:
"I replaced two hours of cardio with 15 minutes of THIS". Komplement till bilden, inte
lip-sync-captions. Bilden stoppar tummen, texten säger varför det angår dig.
**Testregel: byt antingen budskapet (tre hook texts på samma video) eller bilden (tre
öppningar på samma text) — aldrig båda i samma test.**

**Organic / UGC / VSL / high production.** Organic ska "blend in and convert": tre
sorter (kundtestimonial, social-media-style, lifestyle), "the audience should never
feel like they're watching an ad", "the copy has to look like it's coming from the
person and not the brand", visa någon som ser uppnåelig ut för målgruppen. UGC bygger
förtroende med struktur: hook → problem → "twist the knife" → produkt → feature/benefit
→ dåligt alternativ → resultat → CTA. VSL (1–15 min) utbildar och byter övertygelser.
High production är för premiumpositionering — "mediocre high production is actually
worse than good organic content".

**Static.** Hjärnan läser en stillbild på ~13 ms, så bild + rubrik + layout måste
berätta allt samtidigt. Fem typer, valda efter kundens invändning: product-focused
("är det värt pengarna?"), transformation ("funkar det?"), lifestyle ("är det för
sådana som jag?"), problem/solution ("löser det mitt problem?"), testimonial ("kan jag
lita på er?"). Rubriken är 80 % av pengarna. Tvåsekunderstestet: visa, ta bort, fråga
vad de såg först, andra, tredje.

**Learning.** Fritext per annons: varför gick den, varför sög den, vad gör vi härnäst.
Kursens åtta frågor som ställs på varje annons:

1. Hookar de första 1–2 sekunderna *rätt* tittare — och håller den kvar?
2. Väcker annonsen nyfikenhet hos rätt målgrupp?
3. Är det här en annons kunden skulle *vilja* se?
4. Skapar copyn en tydlig bild i tittarens huvud?
5. Känns den native och äkta, inte som företagsreklam?
6. Vilka lärdomar från tidigare vinnare har vi byggt in?
7. Utbildar den kreativt om hur tittaren når sin kärndesire?
8. Berättar den en historia avataren bryr sig om, underhåller den (le, skratta, dela)
   eller lär den ut en trovärdig ny mekanism?

**Winning ad.** "An ad that can spend as much money as possible at KPI." Varningen:
"a lot of guys get excited when an ad gets 3 ROAS on $100 a day. This does not mean
your ad is great." Deras exempel på en riktig vinnare: 2,0 ROAS på 50 000 pund spend.

---

## Imitation, ideation, iteration

**Imitation** är att hitta en annons som funkar och göra vår version. Kursens
verktyg: scrolla Instagram och spara det som stoppar dig, Atria (följ brands du gillar
— *inte* direkta konkurrenter), AdSpy sorterat på shares. Kursens egen brasklapp,
ordagrant: "we haven't found that much success by doing imitations … even if you do an
amazing job, you can only be second best in that market because your competitor is
already running that ad." De är de lättaste att göra — "you can be done in 15
minutes" — och därför de mest frestande.

**Ideation** är där kursens vinnare kommer ifrån. "You need to study, bro":
researchdokumentet läses tills idéerna kommer; egna vinnarannonser plockas isär för
raden som bar (Flow: "hits the same every time" → egen static → 194 köp); Brand AI får
plocka de 15 starkaste fraserna ur recensioner och kommentarer och göra rubriker av
dem; nischord söks på TikTok/YouTube Shorts och **kommentarsfälten** läses för
övertygelser och invändningar ("comment mining"); Reddit; AnswerThePublic. Rådet:
börja med hooken — har du en stark hook byggs resten naturligt. Och skriv ner idén
inom 60 sekunder när den kommer i duschen.

**Iteration** görs på annonser som får spend: nya hooks, ny creator på samma manus,
samma koncept i nytt format (static → video → VSL). En iteration är "a net new ad
built on hypothesis", inte en småjustering. "Shifting percentage": på platå 80–90 %
nya koncept, när en vinnare dyker upp vänds det till 80 % iterationer. "Angles don't
die, they get exhausted."

Vår källregel (playbook-vinnare / winning line / swipe) är samma tanke: ett koncept
föds aldrig ur tomma intet. Kursens tillägg är att typen ska *skrivas ut* i
Growth Guide-raden, så man efter tjugo koncept kan se om man bara imiterat.

---

## Var kursen och vår metod skiljer sig — och vad som gäller

**Data.** Kursen har ingen signifikansgrind. Domen är "fick den spend?" efter ~7
dagar i en CBO-batch med 3–5 varianter, och prestation mäts mot brandets target-KPI.
Ingen spend = "the hook sucks". Spend men under KPI = exekveringen brast. Vi kräver
≥300 kr **och** ≥3 köp, rankar på vinstbidrag mot break-even och testar i ABO med lika
budget (regel 11). Skälet är precis mekanismen kursen inte ser: i CBO svälter nya
tester bredvid en etablerad vinnare — kursen läser det som "trash", vi läser det som
"ingen data". **Kursens metod används för att förklara *varför* en annons gick som den
gick, aldrig för att döma *om* den var bra.** Där kursen ändå säger samma sak som vi:
"it's not the percentage that stop, it's the percentage that stop and continue to
watch" — det är hold rate, fyndet i avläsning 1.

**Copy.** Kursen kör 15-sidiga prompter i ett Claude-projekt; vi kör
`copy-regler.md` + subagent. Samma princip (kunskapsbas + regler + flera varianter),
annan verktygslåda. Axels fem drag i `docs/briefs/017-slutversioner.md` (namngiven
person, byrålåde-skälet, extern validering, identitet före egenskap, självironi) är
vår version av kursens "the copy has to look like it's coming from the person".

**Research.** Kursens är AI-genererad på en dag. Vår VOC är handgjord ur 11 trådar och
en konkurrentspaning. Kursen själv säger att researchdokumentet är källa nummer ett
för idéer — vår är redan gjord, den ska *läsas*, inte göras om.

---

## Vad vi tar in från kursen (2026-09-14)

Backloggen har fått Growth Guide-kolumnerna (avatar, desire, awareness, typ, format).
Från och med nu sätts awareness-nivå på varje koncept innan det briefas, och hook-tester
byter budskap *eller* bild, aldrig båda. Kursens åtta learning-frågor ovan används i
creative-teardownet som kvalitativ del — de ersätter inte vinstbidragsrankningen.

Föreslaget, kräver Axels ja: en fråga efter köp i butiken — "Köpte du till dig själv
eller till någon annan?" — kursens egen enkätfråga. Det är det enda som avgör self vs
gift med riktig data i stället för med resonemang.

---

## Så mappar redigerarens två första dokument

**Strategy brief** = kursens *imitation* (social media research: två TikTok-klipp med
många views) + Organic Ads-lektionen ("should feel like organic content", ingen script,
uppnåelig person) + organic action item #3 (en tjej berättar historien enbart med
captions — det är "faceless") + hamburgerliknelsen ur "The Art of 1 Frame" och
mallsegmentet "food" → "visually delicious". Rubrikerna "Proposed Strategy / Creative
Direction / Testing Priority" är hans egna.

**Avatarpresentationen** = kursens avatarformat till namn, ålder och etikett ("Meet
Mia, 24, The Fun & Quirky Shopper"), men utan kursens tyngd: inga rädslor, inga
misslyckade lösningar, ingen genie-fråga, ingen desire, ingen awareness-nivå. "She
likes / She wants / Buying trigger / Core flow" finns inte i kursen.

Han hoppade över steg 2 (research), awareness/sophistication och Growth Guide-raden
("what gives you confidence that this test will improve performance"), och började i
steg 7 med det lättaste verktyget. Formatet han landade i är ändå rätt — det är
avataren som är fel, och den är fel *enligt kursens egen metod*: kursens eget
presentexempel (manuslektionen) skrivs ur **givarens** perspektiv — en kvinna 30–40 som
varje födelsedag kämpar med att hitta något till en krävande svärmor.

---

## Matstrumpor i kursens ram

**Avatar: givaren.** Ur VOC:n, inte ur magen. "Mia som köper åt sig själv" är i
kursens termer *unaware* (behöver inga strumpor) — den svåraste och dyraste marknaden —
och betalar Temu-pris, inte 399 kr.

**Mass desires** (VOC:ns kategorier, i jag-form): *jag vill se reaktionen när paketet
öppnas* · *jag vill träffa rätt och vara den roliga givaren, inte köpa fel* · *jag vill
att den används efteråt, inte hamnar i byrålådan* · *de har redan allt — jag vill ge
något de inte har*.

**Awareness.** Givaren är **problem aware** från oktober ("släktingarna jagar
julklappstips, hjärnan är tom") — annonsen ska ge igenkänning och presentera
strumporna som lösningen. **Solution aware** när "rolig present" eller "strumpor"
redan är valt — då är jobbet att slå Husman och SweSocks. **Most aware** är
retargeting med Köp 1 Få 1. Vändningen "ser ut som sushi → är strumpor" är en
pattern interrupt som funkar på alla nivåer, men captionen avgör vem som känner sig
träffad.

**Sophistication: nivå 4–5.** Tusentals roliga strumpmotiv, Temu, SweSocks med ~1 700
annonser. Nivå-5-svaret är identitet + nisch — det är "rolig i kväll, på fötterna i
morgon" och 019 Presentkungen. Mekanismen (nivå 3-verktyget) är lådan: ser ut som en
riktig sushibox, sedan strumpor. Offer uttrycks alltid som antal (Köp 1 Få 1), aldrig
procent.

**Ur veckosamtalen, direkt tillämpligt:** "some desires are seasonal, like gifting and
Christmas, and some are evergreen" — vi ska ha båda. Visuella produkter utan tal:
"viral sound → cut the clips to the rhythm → subtitles at the end to make it 10 %
better", varianter månadsvis. Och: "you're not marketing to yourself."
