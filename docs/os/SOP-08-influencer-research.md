# SOP-08: Influencer-research enligt The Celebrity Code

Färdig prompt att klistra in i en ny chatt tillsammans med kursdokumentet
(`The Celebrity Code – transkriberad`). Fyll i produktblocket överst, klistra in
allt, och låt sessionen köra hela vägen utan att stanna för godkännande.

Skriven 2026-09-19 efter första körningen (Matstrumpor, Sushi-Strumpor). Allt som
står under "Hårda regler" är köpt med riktiga misstag i den körningen. Ändra inte
dem utan att veta varför de finns.

---

## Prompten

```
Du ska hitta och kontakta influencers åt en av mina produkter, enligt metoden i det
bifogade kursdokumentet (The Celebrity Code, Santiago Talavera, HappyFlops). Läs hela
kursen först. Den är facit; när min instruktion och kursen krockar frågar du mig.

Svara på svenska, i löpande text, inte i punktlistor. Kör hela vägen utan att stanna
för godkännande mellan faserna. Fråga bara om ett beslut kräver ägaren (pris, rabatt,
ny målgrupp).

## PRODUKTEN (fyll i)

Produkt:
Pris och vad som ingår:
Sajt:
Meta-annonskonto (id + namn):
Budget totalt för 3 samarbeten:
Tak per person:
Kampanjfönster (när ska det vara live):
Annonsrätt jag vill ha:
Avsändaradress för mailen:
Mitt namn och bolag i signaturen:
Uteslut dessa (redan kontaktade eller olämpliga):

## HÅRDA REGLER (dyrköpta, bryt dem inte)

1. PRESENTTOLERANS AVGÖR, INTE BARA SIFFRORNA. Två perfekta profiler tackade nej med
   exakt samma motivering: produkten passade inte deras varumärke. Den ena hade 9,6 av
   10 i Modash. Poängsätt därför varje kandidat på två axlar: publikens kvalitet OCH
   om hennes varumärke tål just min produkt. Ligger toleransen under 6 av 10 kontaktar
   vi inte, hur bra siffrorna än är. Bevis på tolerans är: hon skämtar och skrattar åt
   sig själv, hon har gjort presenttips eller julklappstips, hon har gjort betalda
   samarbeten utanför sitt kärnämne, eller hon har en bred vardagsprofil. En strikt
   expertprofil med ett enda ämne är ett nej som ännu inte hänt.
2. HITTA ALDRIG PÅ SIFFROR. Varje påstående märks VERIFIERAD med länk eller INFERENS.
   Hellre "det går inte att verifiera" än ett tal som ser rimligt ut.
3. ETT MAIL PER PERSON. Aldrig hemlig kopia, aldrig massutskick. Mottagaren ska se sitt
   eget namn i Till-fältet. Skicka från en domän med SPF och DKIM, inte från en gratis
   mailadress, annars landar det i skräpposten och ser oseriöst ut.
4. INGA SÄLJSIFFROR I UTÅTRIKTAD TEXT. Skriv aldrig hur mycket vi sålt, aldrig
   "slutsåld", aldrig kundantal vi inte kan belägga.
5. KURSENS MAILSTRUKTUR GÄLLER ORD FÖR ORD. Se fas 6. Korta inte ner den, lägg inte
   till en vänlig inledning, ta inte bort ämnesradens personliga krok.
6. EN AFFÄR ÄR EN AFFÄR. Säg rakt ut att det är ett betalt uppdrag och inte produkt mot
   inlägg. Ett arvode som täcker både stories och annonsrätt, aldrig två separata poster.

## FAS 0: VEM KÖPER EGENTLIGEN

Hämta den verkliga köparfördelningen ur Meta-annonskontot innan du letar profiler.
Använd ads_get_ad_entities med breakdowns age och gender och fälten amount_spent,
actions:omni_purchase, purchase_roas. Fältnamnen är exakta; spend och purchases finns
inte. Kontrollera att du är i rätt annonskonto innan du läser något.
Räkna också fram break-even: pris minus moms, minus inköp och frakt, minus cirka 2,5 %
avgifter. Det talet avgör vad ett samarbete får kosta.
Leverera en tabell över köparna och en break-even-rad. Allt senare arbete utgår från den,
inte från vem jag tror köper.

## FAS 1: BRUTTOLISTA, CIRKA 100 NAMN

Kursens tratt är 100 till 50 till 20 till 10. Kör många parallella sökspår som var för
sig är smala, eftersom breda sökningar ger samma tjugo kändisar varje gång. Spår som
fungerat: prisvinnare och utmärkelser, TV-profiler utanför public service, radio på
kommersiella stationer, författare och krönikörer, komiker och humorister, handarbete,
trädgård, inredning och loppis, mat med äldre publik, mormors- och traditionsprofiler,
profiler som bevisligen gör julklappstips, konkurrentspaning på vem som gjort liknande
produkter, resor och husbil, samt byråernas egna mediekit.
Mediekit-spåret är det enda som ger riktiga ålderssiffror gratis, så prioritera det.

Källor som fungerar: proad.se/vara-profiler, ocast.com, aller.se, unitedscreens.com,
splayone.com, svensk press, Wikipedia, talarförmedlingar, bokförlag, podcastsidor.
Källor som är blockerade: Instagram svarar 429, HypeAuditor och StarNgage svarar 403.
Räkna inte med dem.

Storleksspann: 20 000 till 400 000 följare om inget annat sägs.

## FAS 2: SÅLLA TILL CIRKA 20

Dedupe på namn och handle. Stryk allt i uteslutningslistan. Stryk anställda på Sveriges
Radio, de får oftast inte göra reklam. Stryk SVT-programledare med pågående program:
karantänen är fyra veckor före första och fyra veckor efter sista sändning för
återkommande programledare, och repriser räknas. Undantaget för det egna yrket täcker
bara produkter i deras egen bransch.

## FAS 3: SCORECARD PER FINALIST

Använd kursens prompt (HappyFlops Brain) men lägg till presenttoleransen som egen
faktor med minst 20 procents vikt. Poängsätt varje profil 1 till 10 på: nationell
kännedom, omtyckthet, mänsklig koppling, kommentarernas kvalitet, stories, äkthet,
publikmatch, presenttolerans, trygghet, varumärkessäkerhet, god gärning, selektivitet
och kommersiell trovärdighet. Varje poäng ska ha ett belägg med källa.

## FAS 4: MOTARGUMENT

För varje kandidat i toppen, kör minst två skeptiker med olika lins som får i uppgift
att motbevisa, inte bekräfta: en på publik och räckvidd, en på varumärke och
genomförbarhet. De ska utgå från att påståendet är fel tills det bevisats. Den här
fasen räddade oss från två felaktiga siffror och ett felciterat samarbete förra gången.
Skriv ut vad som inte gick att verifiera, det är lika viktigt som det som gick.

## FAS 5: MODASH, 30 PROCENT AV BESLUTET

Kursen tittar på sju tal och säger uttryckligen att man ska strunta i resten.
Poängsätt varje tal 0 till 10 och väg ihop:

  Falska följare        vikt 20 %   10p ≤10 %   8p 11-15   5p 16-20   2p 21-30   0p >30
  Real people           vikt 15 %   10p ≥85 %   8p 75-84   5p 65-74   2p 55-64   0p <55
  Följer ≤500 konton    vikt 15 %   10p ≥70 %   8p 55-69   5p 40-54   2p 20-39   0p <20
  Snittkommentarer      vikt 20 %   10p ≥100    8p 60-99   5p 40-59   2p 20-39   0p <20
  Kvinnoandel           vikt 10 %   10p ≥80 %   8p 70-79   5p 60-69   2p 50-59   0p <50
  Rätt åldersgrupp      vikt 15 %   10p ≥50 %   8p 40-49   5p 30-39   2p 20-29   0p <20
  Rätt land             vikt  5 %   10p ≥85 %   8p 75-84   5p 65-74   2p 55-64   0p <55

Tre spärrar slår igenom oavsett summa: över 30 procent falska ger högst 3, under 65
procent i hemlandet ger högst 4, under 20 kommentarer ger högst 5.
Paid engagement antecknas men ger inga poäng, kursen kallar den oviktig. Engagement
rate, följartillväxt och likes står inte på listan och används inte.
Modash delar bara åldern till 45-64, så 65 och uppåt syns inte. Säg det rakt ut.
Svenska profiler ligger generellt lågt på kommentarer; kursens 60 är en hög ribba här.

Jag exporterar rapporterna som PDF och laddar upp dem. Läs dem, räkna betygen, och
visa delpoängen per kolumn så att jag kan kontrollera uträkningen.

## FAS 6: MAILEN

Kursens struktur, sju meningar, inte fler:
  1. Ämnesrad med något personligt hon åstadkommit, inte en pitch.
  2. Namn och bolag i en mening, sedan tyst om dig själv.
  3. Gratulationen eller den personliga kroken.
  4. Jag vill skicka produkten utan några förväntningar, eftersom vi är intresserade
     av ett betalt samarbete.
  5. Vad produkten är, i en mening, och att hon ska testa den först. Här ligger också
     det som skiljer produkten från andra.
  6. Gillar du den bokar vi ett kort samtal.
  7. Några fakta om bolaget som gör oss trovärdiga, och att vi tror hon passar.
Signatur med namn, bolag och telefonnummer.

Skriv inte hur många dagars annonsrätt vi vill ha i första mailet; villkoren tas i
samtalet. Har profilen en byrå skickas samma mail till byrån med profilens namn i
ämnesraden, plus en rad som ber om deras prislista för stories och annonsrätt.
Uppföljning efter fyra arbetsdagar, två rader, ingen ny pitch.

Skicka tio mail för att få tre till fem avtal. Kursen räknar med fem till sju nej.
Det finns ingen invändningshantering i kursen och du ska inte hitta på någon: ett nej
besvaras med en rad, utan argument och utan att fråga varför. Erbjud gärna produkten
ändå, som gåva utan krav, och följ aldrig upp ett nej.

## FAS 7: UPPLÄGGET

Bara stories, tre till fem frames, varav minst två video och en bild med erbjudandet.
Inga inlägg, inga reels, inga långa avtal. Kursen är tydlig: inlägg och reels kostar
mer och säljer sämre.
Annonsrätt alltid, det är där merparten av pengarna finns. Kursen rekommenderar två
veckor i taget och förlängning när det fungerar; vill jag ha trettio dagar direkt,
säg vad det kostar i förhandlingsläge.
Sätt slutdatumet för rättigheterna i kalendern och i annonskontot samma dag avtalet
skrivs. Missade slutdatum ger straffavgifter och förstör relationen.
Brief till profilen: max fem "gör" och fem "gör inte", plus be henne om tre egna idéer.
Varje story-frame ska märkas som reklam enligt branschreglerna.
Launch: tre profiler samma vecka med en till två dagars mellanrum, och samma dag ska
vi ha fem till tio hook-varianter plus minst tre andra format redo i annonskontot.

## FAS 8: TVÅVECKORSOBSERVATIONEN, 70 PROCENT AV BESLUTET

Innan något skrivs på: titta på hennes stories varje dag i fjorton dagar. Pratar hon
in i kameran om sitt eget liv, utan smink och utan manus? Vardag, familj, motgångar,
humor, eller bara reklam och snygga bilder? Svarar hon följarna? Hur många reklamer
per vecka? Ett betyg 1 till 5 per dag. Snitt 3,5 eller högre och minst tio dagar med
stories: boka. Under 3, eller fyra dagar utan något: reserv.
Räkna kommentarerna en gång: snittet över de fem senaste inläggen, kursens gräns är 60.
Be varje profil som säger ja om skärmdumpar av sina egna Instagram-insikter: ålder,
kön, land och story-visningar senaste 30 dagarna. Det är bättre data än Modash och det
kostar ingenting. Vägrar hon visa dem är det ett svar i sig.

## LEVERANS

Skriv allt till repot och committa och pusha:
- en rapport med köpardata, break-even, prisbenchmark, topp 10 med kontaktvägar,
  färdiga mail per person, kalender, juridik och en utfallslogg som fylls på
- scorecards och bruttolista som JSON under docs/source/
- en rad i utfallsloggen för varje svar som kommer in, med vad det lär oss

Avsluta med en checklista som bockar av varje fas, och skriv rakt ut vad som inte gick
att verifiera. En task är inte klar för att den är levererad.
```

---

## Vad som gick fel första gången, i korthet

| Misstag | Följd | Regeln som kom ur det |
|---|---|---|
| Presenttolerans vägde för lite | Två nej av tre bästa namn | Egen faktor, minst 20 %, spärr under 6 |
| Mailet skickades med hemlig kopia till flera | Såg ut som massutskick | Ett mail per person |
| Mailets personliga inledning ströks | Tappade kursens starkaste del | Strukturen ändras inte utan att kursen konsulteras |
| Byråstatus antogs ur en rosterlista | Profilen hade lämnat byrån | Fråga profilen direkt |
| Story-räckvidd togs ur ett mediekit från december | Modash visade hälften | Datum på varje siffra |
