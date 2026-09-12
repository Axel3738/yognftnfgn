# Filterramverket — så sorterar en jobbannons bort fel sökande på sekunder

**Källa:** redigerarannonsen (`jobbannons-video-editor.md`, utskicket
`utskick/annons-2-surdeg.txt`). Axel bad 2026-09-12 att ramverket bakom den
skrivs ner generellt, så samma sak går att bygga för vilken roll som helst.
Första tillämpningen: `jobbannons-kundsupport.md`.

**Idén i en mening:** varje del av annonsen är ett test som mäter exakt den
egenskap vi anställer för — läser hela texten, följer instruktioner exakt,
dyker upp varje dag — och varje test är byggt så att det kostar OSS noll
sekunder att underkänna.

Det är inte en annons med ett test i slutet. Det är sex filter i rad. Varje
filter är dyrare för den sökande och billigare för oss än det förra.

---

## Trappan: sex filter i tidsordning

| # | Filter | Sorterar bort | Vad som mäts | Kostar oss |
|---|---|---|---|---|
| 0 | Självfiltret — själva texten | innan de söker | vill de ha DET HÄR jobbet, inte ett annat | 0 s, de söker aldrig |
| 1 | Ämnesraden — codeword + exakt format | 0–5 s | läste hela texten, följer format | 0 s, raderas oläst i inkorgen |
| 2 | Rad 1 — en specifik prestation | 5–30 s | kan de peka på något verkligt | ett ögonkast |
| 3 | Sex punkter, i ordning, inget annat | 1–3 min | ärlighet, omdöme, verklig erfarenhet | en genomläsning |
| 4 | Volymtestet — 3 leveranser på 24 h, obetalt | 1 dygn | följer brief, håller deadline, frågar smart | en brief + en bedömning |
| 5 | Betald provvecka | 1 vecka | det dagliga jobbet på riktigt | en veckolön |

Ungefär 90 % faller på filter 1. Det är meningen. De som är kvar har redan
bevisat den egenskap vi inte kan lära ut.

---

## Filter 0 — Självfiltret (gratis, före ansökan)

Texten säger sanningen om jobbet så rakt att fel personer slutar läsa.

- **Öppningen** sätter regeln och varnar för testet i samma andetag: *"Read
  this entire post. If you skim it, you will fail in the first five seconds."*
- **"What this job actually is"** utan smicker: *"Not creative masterpieces.
  Not a job where you get to be an artist."* Den som vill ha ett annat jobb
  går här.
- **Prioritetsordningen sägs rakt ut:** dyker upp > klarar listan > stannar >
  skicklighet. Skicklighet på plats fyra, med flit och med förklaring. Den
  som söker ändå har accepterat ordningen.
- **"Who should NOT apply":** åtta konkreta, kryssbara fakta om personen
  (jonglerar klienter, behöver kreativ frihet, saknar backup-internet, kan
  inte sex dagar, vill förhandla lön före första månaden, letar tillfälligt,
  vill bli Creative Director). Inte "vi söker driven och organiserad" — det
  påstår alla om sig själva. En kryssbar lista faller den sökande på själv,
  tyst.
- **Motiveringen** gör hårdheten trovärdig i stället för elak: *"I hired for
  this before and lost good people because they wanted a different job."*
- **Uppsidan står också:** *"What you get if you win it"* — en klient,
  dagtid, lön i tid, trappa på schema. Stränghet plus ärlig uppsida ger att
  rätt person känner lättnad och fel person känner olust. Båda reaktionerna
  är filtret.

**Bygg det för en annan roll:** skriv vad jobbet FAKTISKT är, det tråkiga
inkluderat. Skriv prioritetsordningen. Skriv 6–8 "sök inte om"-punkter som är
fakta om personen, inte adjektiv.

## Filter 1 — Ämnesraden (0–5 sekunder)

Två saker i ett:

1. **Codewordet.** Gömt mitt i brödtexten, i stycket om prioritetsordningen —
   inte i ansökningsinstruktionen. Ska stå FÖRST i ämnesraden. Instruktionen
   säger bara *"the codeword is written somewhere in this post. I'm not
   telling you where."* Den som skummade har det inte. Den som bara läste
   "How to apply" har det inte.
2. **Exakt format med fem fält:** `codeword | flest på en dag | program |
   timmar/dag | dagar/vecka | nedladdningshastighet`. Fälten är valda så att
   inkorgen blir en sorterbar tabell: kapacitet, verktyg, tillgänglighet och
   internet syns UTAN att mejlet öppnas. Sämsta raden raderas oöppnad.

*"Wrong format, missing codeword, missing a field — deleted unread. No
exceptions."* Regeln står skriven, så det finns inget att diskutera efteråt.

⚠️ **Codewordet måste vara gömt och nytt varje utskick.** Står det i
ansökningsinstruktionen (*"Type apple in the title"*) testar det bara att de
läste ansökningsstycket — det är exakt det stycke alla läser. Kodordet avslöjar
dessutom vilken annons ansökan kom från, så återanvänd aldrig. Listan över
använda kodord ligger i `jobbannons-video-editor.md`.

**Bygg det för en annan roll:** välj fem fält som (a) är en siffra eller ett
ord, (b) går att rangordna, (c) inte går att bluffa utan att det syns senare.
Hastigheten går att be om skärmdump på; "flest på en dag" ska matcha rad 1 i
mejlet.

## Filter 2 — Rad 1 (5–30 sekunder)

*"The most finished edits you have ever delivered in a single day. Who was it
for, and what were they. One or two real sentences. Generic answers are
deleted."*

Ett mejl som börjar *"Hi, I am a passionate and hardworking…"* raderas på
första raden. Ett som börjar *"14 product cutdowns for a Shopify skincare
brand, mostly 15-second UGC re-cuts"* läses vidare. Frågan är byggd så att
generiska svar och AI-svar inte går att skriva: den kräver en siffra, en
mottagare och en typ av jobb. Och siffran ska stämma med ämnesraden.

**Bygg det för en annan roll:** "flest X du levererat på en dag, åt vem, vad
för sorts X." Alltid siffra + mottagare + typ.

## Filter 3 — Sex punkter, i ordning, inget annat (1–3 minuter)

*"…these six things, in this order, and nothing else."* Ordningen och
"nothing else" är i sig test nummer två av instruktionsföljsamhet.

| Punkt | Vad den frågar | Vad den egentligen mäter |
|---|---|---|
| 1. Rad 1 | flest på en dag, åt vem | verklig kapacitet, går att falsifiera |
| 2. Setup | dator, ISP + hastighet, backup-internet, plan vid strömavbrott. *"Be specific and boring."* | kan de fysiskt dyka upp varje dag. *"I have good internet"* = underkänt, sagt i förväg |
| 3. Longevity | längsta klient eller roll, hur länge, varför det tog slut. *"Be honest."* | stannar de. Ärlighet belönas i klartext: *"a short history with an honest reason beats an inflated one"* |
| 4. Your work | 2–3 länkar, INTE en reel, *"closest to simple product ads. Your judgment is part of the test."* | omdöme: förstår de vilket jobb det är |
| 5. One honest answer | *"What would make you quit this job?"* | självkännedom + ärlighet. *"Nothing"* = underkänt, sagt i förväg |
| 6. Last line | mest använda kortkommando och vad det gör | bevis på händer på tangentbordet. Går inte att googla fram trovärdigt |

*"Do not attach a generic CV. It will not be read."* CV:t mäter inget av det
ovan. Det är där bluffen bor.

Mönstret i alla sex: **frågor som kräver en specifik, tråkig, verifierbar
detalj**, där annonsen i förväg säger vilket svar som är underkänt. Den som
svarar generiskt har inte läst. Den som ljuger avslöjas i filter 4.

**Bygg det för en annan roll:** behåll punkt 2, 3 och 5 ordagrant (de är
rolloberoende). Byt punkt 1, 4 och 6 till rollens motsvarighet: en siffra på
kapacitet, ett arbetsprov som visar omdöme, en detalj bara den som gjort
jobbet kan.

## Filter 4 — Volymtestet (24 timmar, obetalt)

Råmaterial + ett referensformat → tre färdiga ads på 24 timmar. Betyget sägs
i förväg: *"I am not grading beauty. I am grading: did you follow the brief
exactly, did you deliver on time, and did you ask smart questions instead of
guessing."*

Det är en dag av det riktiga jobbet i miniatyr, med samma "done"-definition
som annonsen redan gett: i tid, följer brief, rätt format, rena captions, inga
tekniska fel, *"not a taste judgment"*. Den som levererar något snyggt i fel
format har missförstått jobbet, och det syns nu i stället för vecka tre.

**Bygg det för en annan roll:** tre verkliga uppgifter ur rollens vardag, en
tydlig instruktion, 24 h. Bedöm bara instruktionsföljsamhet, tid och frågor.

## Filter 5 — Betald provvecka

*"Full structure, real work, real feedback. This is where the seat is won."*
Här, och först här, kostar det oss pengar. Då är fel personer borta gratis
och resten har visat en dag av jobbet.

---

## Varför det fungerar — tio principer

1. **Varje test mäter egenskapen vi anställer, inte en proxy.** Vi anställer
   "läser, följer, dyker upp". Codeword, format, ordning, setup mäter det.
   CV och reel mäter något annat och läses inte.
2. **Att underkänna kostar oss noll.** Ämnesraden avgörs i inkorgen. Rad 1
   avgörs vid ett ögonkast. Formatet gör inkorgen sorterbar.
3. **Självfiltret är gratis och osynligt.** Fel personer söker aldrig. Färre
   ansökningar, högre täthet av rätt.
4. **Specifika, tråkiga frågor dödar generiska svar.** "Åt vem", "vilken
   ISP", "varför tog det slut", "vilket kortkommando". Går inte att
   AI-generera trovärdigt, går inte att kopiera från ett annat jobb.
5. **Underkänt svar sägs i förväg.** *"I have good internet"*, *"nothing"*,
   generiska svar: annonsen säger att de raderas. Den som skriver det ändå
   har bevisat poängen.
6. **Ärlighet belönas uttryckligen.** Longevity och "what would make you
   quit" säger båda att ett ärligt svar slår ett vackert. Det ger ärliga svar.
7. **Trovärdighet i pengarna.** Lönen, utbetalningsrytmen, trappan i en
   tabell, *"never missed a payment"*. Den seriöse läser det som trygghet.
   Den som vill förhandla står på "sök inte"-listan.
8. **Bonusarna pekar på exakt de beteenden vi vill ha:** noll missade dagar
   (consistency), leverera vid surge (push), vinnare (uncapped). Månadslön i
   stället för styckpris så ingen cherry-pickar lätta jobb, och vi sizar
   listan, inte de.
9. **"Done" står definierat i annonsen.** Ingen smakbedömning, en mening vid
   retur. Det tar bort den vanligaste konflikten innan den uppstår.
10. **Stränghet med motivering, lättnad som belöning.** *"That is not a threat
    — it's a favor."* *"If that sounds like relief — keep reading."* Rätt
    person känner sig sedd, fel person känner sig avvisad. Båda är filtret.

---

## Bygg-mall: en annons för en ny roll

Fyll i, i ordning. Hoppa inte över en rad — varje tom rad är ett filter mindre.

- [ ] **Vad jobbet faktiskt är**, tråkigheten inkluderad, i 4–6 punkter.
- [ ] **Prioritetsordningen**: 4 punkter, skicklighet sist, med förklaring.
- [ ] **Tider** i den sökandes tidszon, dagar per vecka, vad som gäller vid extra.
- [ ] **Lön**: belopp, rytm, trappa i tabell, bonusar kopplade till beteenden.
- [ ] **"Done"-definitionen** i en mening. Ingen smakbedömning.
- [ ] **"Who should NOT apply"**: 6–8 kryssbara fakta.
- [ ] **Nytt codeword**, gömt i ett stycke mitt i, aldrig i ansökningsdelen.
      Skriv in det i listan i `jobbannons-video-editor.md` när annonsen går ut.
- [ ] **Ämnesradsformat**: codeword + 5 fält som är siffror eller ett ord.
- [ ] **Sex punkter i ordning**: behåll setup, longevity och "what would make
      you quit". Byt rad 1, arbetsprovet och sista raden till rollens.
- [ ] **"No CV. Nothing else."**
- [ ] **Tre steg**: ansökan → 24 h-test (3 uppgifter, betyg = brief, tid,
      frågor) → betald provvecka.
- [ ] **"What you get"**: uppsidan, ärligt.
- [ ] Sista raden: *"Show me you can follow instructions. That's the whole
      first test."*

## Så läser du inkorgen

1. Sortera på ämnesrad. Allt utan codeword först: radera oläst.
2. Fel antal fält eller fel ordning: radera oläst.
3. Öppna resten. Rad 1 generisk: radera. Rad 1 stämmer inte med ämnesraden:
   radera.
4. Sex punkter i fel ordning, saknas, eller något extra (CV): radera.
5. Kvar: läs punkt 2, 3 och 5 på ärlighet, punkt 4 och 6 på omdöme. Skicka
   filter 4 till de bästa.

Förvänta att ~90 % försvinner i steg 1–2. Klarar nästan alla ämnesraden är
codewordet för synligt eller formatet för enkelt.

## Fallgropar — det som gör att en annons INTE filtrerar

- Codeword i ansökningsinstruktionen. Testar inget.
- "Berätta kort om dig själv, vad du gör nu, dina ambitioner." Fyra generiska
  frågor ger fyra generiska svar och noll att rangordna på.
- Kravlista av adjektiv (driven, organiserad, noggrann). Alla påstår det.
- Ingen "sök inte"-lista. Då söker alla, och vi betalar sorteringen med tid.
- Vag lön eller vag framtid ("möjlighet till fler timmar"). Rätt person läser
  det som osäkerhet.
- Inget test före provveckan. Då är provveckan testet, och den kostar.
- Ingen "done"-definition. Då blir varje retur en förhandling.
