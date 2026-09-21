# ecomtalent-kursen — vad den säger om volym, "intent", iteration och BOF

**Skapad 2026-09-19.** Bakgrund: rutinen "Skalnings kungen" (`/rond-auto` på
grenen `claude/daily-agent-discussion-uos5df`, commit `925b8e8` samma morgon:
"Axels manuella zon över 4 000 kr") frågade Axel vad "intent" betyder när en
produkt ligger över 4 000 kr/dag — (a) fler retargeting-/BOF-briefer, (b) lägre
andel nya koncept och mer varianter på vinnarna, eller (c) något annat. Axel
laddade upp hela kursens transkript (for brands, AI, Weekly Calls — 2,3 MB, 88
lektioner/samtal) och bad om ett svar byggt på kursen, inte ur huvudet.

**Transkripten ligger INTE i repot** (kursmaterial). Det som ligger här är
`fynd.json`: 516 fynd med lektion, tidsstämpel och ordagrant citat (15–60 ord),
167 numeriska regler och en lektionslista med relevansmärkning. Räcker
`fynd.json` inte: be Axel ladda upp transkripten igen.

Så här gjordes analysen: transkripten delades i 28 delar vid lektionsgränser,
varje del lästes av en egen läsare som skrev fynd per tema
(`volume_vs_spend`, `iterate_vs_new`, `retargeting_bof`, `scaling_creative`,
`feedback_loop`, `testing_structure`, `other`). Tre domare (media buyer,
creative strategist, skeptiker) svarade var för sig på frågan ur fynden, en
syntes slog ihop dem, en kritiker kontrollerade varje citat mot källfilerna och
letade lektioner som inte använts. Alla citat nedan är kontrollerade med
`grep -F` mot transkripten 2026-09-19.

---

## 1. Kursens egen definition av "intent"

Ordet används fem gånger i betydelsen *hur man arbetar med annonser* — alltid om
process, aldrig om funnel-steg, målgrupper eller spendnivå:

| Var | Citat | Betyder |
|---|---|---|
| Nov 21 Spencer [36:35] | "they're just like, mindlessly testing a bunch of bullshit, right? But if you actually **put intent behind every single ad, and actually learn from every single ad**, you will just get better" | en hypotes per annons + en lärdom per annons |
| Apr 24 [1:05:05] | "this is also why **we don't just randomly spam creatives, but we try to focus on intent** because we know eventually those ads will get to the learnings phase" | varje annons görs för att den ska klara en granskning |
| Apr 24 [1:05:51] | "if every single idea that we do, genuinely, you know, we think that that can do well and we put intent behind it and we spend the time doing research" | tro + research + arbete |
| Apr 24 [1:09:50] | "we as a team **decide which of the ideas are the highest intent** and which we want to move on right away" | urvalet som sätter veckans batch |
| Mar 6 [45:03] | "**don't spam random shit** because that's not going to take you anywhere I would say try to do as many high intent as you can probably submit you know like a few as they're confident in for every brand wait for them to get launched wait to get feedback" | några få man tror på, vänta på data, besluta sedan |

Köpintention nämns en gång (Nov 21 [11:37], "high intent to go and buy") och
handlar om vad en kall hook med brådska skapar — inte om retargeting.

## 2. Volym mot spend

Kursen har **ingen formel** som ökar antalet annonser med spenden. Den är inte
mot volym — den är mot tanklös volym, och taket sätts av lärdomsloopen:

- Mar 13 [1:04:51], på frågan om bästa volym vid 1 000 dollar/dag: "you really
  don't need more than five new concepts per week. Um, and and maybe even that is
  is an overkill". *(4 000 kr/dag ≈ 400 dollar/dag ligger under den linjen.)*
- Mar 6 [19:17]–[20:05]: "if you're below like one cape or day in spend you don't
  even need that much volume … you only need more volume as you start scaling".
  Volymen får alltså växa med skalan — men utan tal.
- Apr 24 [1:10:35]: byråns egen takt per brand, oavsett budget: "three to five
  batches for each client … anywhere from nine to 15 different ads getting
  launched per week per brand".
- Apr 24 [1:04:20]: lärdomskapaciteten är taket: "picking probably like four or
  five for each brand each week to look at. And if then if we did more, if we
  did like eight ads that week, we might not get to every single one".
- Feedback Loop [2:19]: "you need to process learnings for every single ad that
  you do, okay? It is as simple as that".
- Setting Up Growth Guide [3:51]: "You're just spam testing creatives and you
  can't scale any brands with, with that"; [4:40]: "once you do 20 ad concepts
  for a brand and none of it is hitting … you're doing something fundamentally
  wrong".
- How Our Brain Works [24:22]: "you can't force creativity. But what you can
  force is how many hours you spent doing research".
- Mar 13 [30:48], per redigerare: "two a day is probably like a very healthy
  balance … quality is always going to beat quantity".
- Motvikt, Video Hooks [15:43]: "the numbers have taught us to shut up and just
  test everything. So when someone on your team comes up with an ad idea that
  sounds ridiculous, I would probably suggest testing it" — taket är kapacitet,
  inte smak. En udda idé med hypotes får plats.
- FunPunch [1:04:45]: vid stor volym launchar media buyern ett urval ("If some
  guy made 20 ads, and I think only five or six of them are worthy … I will
  launch a specific number of ads first") — sållning vid launch är kursens
  alternativ till att skära produktionen.

## 3. Iteration mot nya koncept — den glidande skalan

Dec 5 Spencer [52:17]–[53:51], svar på "how many iterations should I do":

> "it's like a shifting percentage. So if you don't have anything and that's
> winning, your main angle just died, your plateaued … You should be doing like
> 80 to 90% like net new and like 10% iteration … As soon as you find a new
> angle that is picking up traction and like you've kind of popped a new winner,
> our team completely shifts to like 80% iteration and then like 20 % net new …
> if we start to get less and less efficiency from that, we slowly start to move
> back towards like, okay, then we go to like 70% iteration, 60% iteration,
> 50 50 … the angles don't die. They just get exhausted because they people
> hear the same messaging."

Samma regel Feb 20 [24:21]: "once you do find a winning ad, that's going to
switch from testing 20% new stuff to testing 80% iterations".

Mixen styrs alltså av **om det finns en levande vinnare**, inte av spend.

Hur ett vidarebygge ser ut — en trappa:
1. **Hookbyte först.** ITERATION [9:33] "you can take this ad and then you can
   just slap different hooks on it"; Video Hooks [11:44] vinnaren blir ny
   baslinje och tre nya varianter testas mot den. Tre varianter per koncept är
   kursens fasta enhet (Feedback Loop [4:38] "we always kind of run three
   variations").
2. **Slår inget hookbyte originalet: gå djupare.** Mar 13 [39:27]: "if you just
   change the hook … and iterations are not hitting then you need to change
   your approach So you need to do like deeper learnings on that ad that's doing
   well And you need to try to find … different hypothesis of why is that
   current ad working". Shaun & Spencer [40:38]: att ändra en småsak och kalla
   det iteration "That's not an iteration". Drag ur Feb 27 [31:13]–[35:15]:
   längre problemdel, börja i mekanismen, svara på en invändning ur
   kommentarerna, text på skärm, statisk/native version, matchande
   landningssida; Apr 24 [15:52]: skriv om för den demografi som faktiskt köper.
3. **Fortsätt så länge originalet lever.** Mar 13 [38:41] "as long as the
   original ad is doing well … I would still keep iterating on it".
4. **Minst 1 av 10 är alltid ny research.** Apr 24 [1:02:45]: "let's say 10 ads
   per week, like at least try to make like one ad out of the 10, like try to do
   more research, try to find like new angles like instead of just copying
   what's working right now". IDEATION [0:52]: "most of our winning ads come
   from ideation" — golvet är ett minimum.

## 4. Retargeting och BOF

Två olika saker som lätt blandas ihop:

- **Retargeting-LAGER (egna publiker/kampanjer): nej på den här nivån.** Shaun &
  Spencer [53:04]: "if you're spending less than like a thousand even for some
  Industries $10,000 a day you're all bottom of funnel. Nobody's really truly
  prospecting until you get to like Five to ten thousand plus a day in spend …
  One campaign until you get to five or ten k a day in spend … Even then like
  we don't really care to run bomb a funnel unless it's a sale period".
- **BOF-CREATIVE i samma kampanj: ja, när annonsen har ett jobb.** Art of 1
  Frame [11:02]: produktdetalj-statics "when you're retargeting people who've
  already seen your basic ads … they just want to see the details of the
  product"; Apr 24 [24:31]: "some of their top ads are like very bomb a funnel
  just like we made too many harnesses like we're, we're selling out
  everything" (brådska/erbjudande); Feb 27 [32:51]: invändningsbesvarande
  annonser ur kommentarerna. Funnel-steget ligger i annonsen (awareness-nivå i
  hook och primärtext, Market Awareness [12:37], [21:15]), inte i
  kampanjstrukturen.
- Feb 27 [46:25]: en annons som dog snabbt "just got the bottom of the funnel
  for audience and for you to grab colder audience you need to put more emotion
  into it" — fixen är hooken, inte ett retargeting-lager.

## 5. Feedback-loopen (kursens läsregler)

- Läsfönster 5–10 dagar (Overview [27:26]), 7 dagar som avläsningspunkt (Shaun
  & Spencer [43:43]).
- Spend men under KPI = utförandet brast, inte idén: "if the ad is getting a
  shit ton of spend and it's not at KPI, that signals you, that meta things that
  … there is an audience for this ad … but your ad is just not good enough"
  (Shaun & Spencer [54:36]) → vidarebygg. Ingen spend = hooken brast → logga
  och släpp.
- Vinnare döms över tid och på kontonivå: "2.0 free rowers, 50,000 pounds spent.
  That's a winner" (FunPunch [20:24]); "if the rest of your account is
  profitable, all your bottom funnel ads are profitable … then yes, the ad is
  winning" (Feb 20 [19:33]) — samma sak som repots regel att top spendern är
  benchmark.
- Rytmen är veckovis: strategimöte + lärdomsmöte varje vecka. Nattvaktens
  briefrond ons + sön och `/briefgranskning` mån + tor ligger redan i den takten.
- Kursen håller en människa vid urval och lärdomar (Losing→Winning [33:23]:
  att låta Claude vara "creative strategist … that's not how it works") — i
  repot är `/briefgranskning` den grinden.

## 6. Vad kursen INTE säger (så ingen påstår det)

- Ingen procent eller formel som kopplar antal annonser till dagsbudget.
- Ingen spendtröskel där briefandet byter läge; SEK nämns aldrig, alla tal är
  dollar/pund (1 k/dag, 5–10 k/dag, 50 000 pund).
- "Intent" betyder aldrig retargeting, BOF eller intent-målgrupper.
- Inget universellt kill-tal, inget om 300 kr / 3 köp — det är repots regel
  (`docs/os/ANALYSMETOD.md`).
- Ingen ABO-kontra-CBO-doktrin för tester (repots regel 11 varken stöds eller
  motsägs; FunPunch [1:03:13] kör CBO med 3–5 varianter per adset).
- Inget tal för hur många vidarebygge-batcher en vinnare får — bara "så länge
  originalet lever".
- Ingen regel för en general store med många produkter i ett konto; att lägga
  glidskalan per produkt är en extrapolering.
- Inget om att ett högt produktpris kräver mer BOF (premium diskuteras bara som
  skäl för dyrare produktion, High-Production Ads [2:22]).

## 7. Svaret till rutinen (skickat av Axel 2026-09-19)

Se `SVAR-INTENT.md` i samma mapp — texten Axel klistrar in, plus de öppna
frågorna som kursen inte avgör.

## 8. Kvar att bygga (Axel kommer tillbaka med mer ur kursen)

Rutinens briefrond bor i `rond-auto.md` steg 4b (`annonskvot`/`rundkvot` i
`agent/rond.mjs`) på grenen `claude/daily-agent-discussion-uos5df`; Bäverbutikens
kvot i `pipeline/quota.mjs` + `docs/os/SOP-02-brief-quota.md`; Nattvaktens
kadens i `factory/kadens.mjs` (7/dag, hälften varianter). Ingen av dem är ändrad
av den här analysen — svaret gick till rutinen i chatten, och ändringarna görs
när Axel bestämt de öppna frågorna.
