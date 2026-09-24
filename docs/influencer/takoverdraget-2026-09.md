# Influencers till Taköverdraget — enligt The Celebrity Code

**Byggd 2026-09-19.** Produkt: https://baverbutiken.se/products/takoverdrag-husvagn-6-5-3-m-skyddar-den-dyraste-ytan · Verksamhet: Bäverbutiken · Annonskonto: MagiBorsten `1867947880635861` · Kampanj: `120250147343350291`.
Metod: kursen The Celebrity Code (Santiago Talavera, HappyFlops), tratten 100 → 50 → 20 → 10, med tre medvetna avvikelser som står utskrivna där de görs: följargolv 8 000 i stället för 100 000, produkttolerans som egen faktor på 20 %, och Modash-kolumnen "rätt kön" = män eftersom köparna är 86 % män.
Data: `docs/source/influencer-takoverdraget-bruttolista.json` (105 profiler) och `docs/source/influencer-takoverdraget-scorecards.json` (15 scorecards, 93 skeptikerpåståenden, Modash-mall, köpardata).
Regel för varje siffra: VERIFIERAD med länk, INFERENS med skäl, eller OKÄNT. Utfallsloggen längst ned fylls på med en rad per svar.

## Fas 0 — vad vi vet innan vi letar någon (hämtat 2026-09-19)

**Produkten.** Taköverdrag för husvagn och husbil, 3 m brett och 5,5–13,5 m långt i nio storlekar, silverbelagd 210D-oxfordväv med remmar på fyra sidor och två extra spännremmar. Det täcker bara taket, inte hela vagnen, så en person får på det själv. Priset läst ur produktsidans JSON i dag: 1 129 kr för 5,5 och 6,5 m (jämförpris 1 469 kr), sedan en stege upp till 2 239 kr för 13,5 m. Alla nio varianter i lager. VERIFIERAD: https://baverbutiken.se/products/takoverdrag-husvagn-6-5-3-m-skyddar-den-dyraste-ytan.js

**Verksamheten och kontot.** Sajten är baverbutiken.se, alltså Bäverbutiken, vars annonskonto är MagiBorsten `1867947880635861` (SEK). Du lämnade kontofältet tomt ("<fyll i id>"), så jag har använt kontot ur CLAUDE.md och verifierat att produktens kampanj faktiskt ligger där. Den får inte förväxlas med MagiBorsten DK `915422744950975`, där CaraShells kopior av samma produkt ligger. Allt nedan är läst ur `1867947880635861`.

**Kampanjen jag valde och varför.** Jag sökte alla kampanjer i kontot på "tak", "husvagn" och "caravan". Två aktiva bär produkten: `Taköverdraget för Husvagn 6,5 × 3 m | BE ROAS 1.63 | Launch 2026-09-09` (id `120250147343350291`, 16 000 kr/dag, huvudkampanjen) och `Taköverdraget LISTICLE LAGERRENSNING` (id `120250252311730291`, 1 000 kr/dag, sidotest sedan 16/9). Jag byggde köpardatan på båda, men huvudkampanjen står för 97 % av köpen.

**Vem som köper.** VERIFIERAD ur Meta insights med breakdowns age + gender, lifetime till och med i dag, actions:omni_purchase. Huvudkampanjen: 70 486 kr spend, 241 köp, ROAS 4,05. Intäkten korskollad: `omni_purchase_values` 285 330 kr och spend × ROAS 285 330 kr, alltså samma tal, ingen 100×-bugg här. Snittorder 1 184 kr. Av 248 köp i båda kampanjerna är 213 män och 35 kvinnor, alltså 86 % män. Åldern är ännu tydligare: 155 köp är 65+, 75 är 55–64, 15 är 45–54, 3 är 35–44 och noll under 35. 93 % av köparna är 55 år eller äldre, 63 % är 65+. Bästa segmentet är män 65+ med CPA 223 kr och ROAS 5,36. Slutsatsen för hela sökningen: vi letar profiler vars publik är äldre män som äger husvagn eller husbil. Par är rimligt (kvinnor 65+ är tredje största gruppen), men det är mannen som trycker på köpknappen. Modash visar bara ålder upp till 45–64, så 65+ syns inte där; "rätt åldersgrupp" i Modash-betyget blir därför andelen 45–64 som närmaste mätbara proxy, och det ska sägas rakt ut i varje scorecard.

**Break-even per order.** Bäverbutiken säljer utan moms (Axels besked 2026-08-29), så inget momsavdrag. Inköp inklusive frakt är **436 kr, HÄRLEDD** ur kampanjnamnets BE ROAS 1,63 (1 129 − 1 129/1,63) enligt regeln i `docs/temu-launch-flow.md`, och samma tal står som obekräftat i `factory/produkter/takskyddet.yaml`. Det är den enda siffran du ska bekräfta mot Temu-kvittot (fråga sist i svaret). Med 2,5 % avgifter (28 kr) blir täckningsbidraget **665 kr per 6,5 m-order** före annonskostnad, alltså break-even-ROAS 1,70. Ett influencerarvode på 10 000 kr behöver då 15 ordrar för att gå jämnt upp på stories ensamma, innan annonsrätten räknats. Kostnaden för de större storlekarna är okänd, så för dem gäller bara att marginalen i kronor sannolikt är högre, inte hur mycket.

**Prisbenchmark.** VERIFIERAD 2026-09-19: Amazon.se listar no-name 210D-taköverdrag för husbil/husvagn på 444–855 kr (https://www.amazon.se/s?k=tak%C3%B6verdrag+husvagn), vidaXL takskydd 600×300 non-woven 1 176 kr på Amazon och vidaXL 900×300 för 1 339 kr på PriceRunner, medan helöverdrag ligger 2 278–3 055 kr (https://www.pricerunner.se/results?q=tak%C3%B6verdrag%20husvagn). Vi ligger alltså över importen på Amazon men i nivå med vidaXL och långt under helöverdragen. Det betyder att profilen måste bära argumentet "bara taket, en person, remmar på fyra sidor", inte priset. Prisjakt, Jula och Biltema svarade 403/404 från containern och kunde inte läsas.

**Säsongen.** Produkten är taggad Vinterförvaring och köps när vagnen ställs undan: september till november, med toppen i oktober när säsongsplatserna stängs och första frosten kommer. Att huvudkampanjen på tio dagar gjort 70 000 kr i spend med ROAS 4 är beviset att fönstret är öppet nu. Ett samarbete måste därför vara live senast vecka 42–43 (12–23 oktober); efter mitten av november är vagnarna redan täckta eller inställda och köpviljan dör tills vårens fukttest i april, som är ett mindre fönster. Kalendern nedan är byggd bakåt från det: mail ut vecka 39, svar och samtal vecka 40, produkt skickad vecka 40, tvåveckorsobservationen löper vecka 39–41 parallellt med kontakten, avtal vecka 41, tre profiler live samma vecka i vecka 42.

**Mejldomänen.** baverbutiken.se har SPF (`v=spf1 include:spf.loopia.se -all`) och MX hos Loopia, VERIFIERAD via DNS. DKIM hittade jag inte på någon av de vanliga selektorerna (default, loopia, mail, k1, s1, google), och DMARC saknas. Det ska fixas i Loopia innan mailen går, annars riskerar de skräpposten.

## Fas 1–4 — från 105 namn till nio mail

Bruttolistan blev 105 unika profiler ur åtta sökspår (husvagns- och husbilsprofiler, camping/vanlife/renovering, klubbar/tidningar/mässor/testare, byråernas mediekit, motor/fiske/jakt, kändisar med husvagn, konkurrenternas samarbeten, TikTok/poddar/pensionärsprofiler). Hela listan med källa per rad ligger i `docs/source/influencer-takoverdraget-bruttolista.json`. Följargolvet sattes till 8 000 i stället för kursens 100 000, en medveten avvikelse för en nischad nyttoprodukt där publiken ska äga det produkten skyddar.

Tre saker om läget under sökningen ska sägas rakt ut. Instagram svarade 429 på varje profilförsök, så inget Instagram-följartal i rapporten är läst ur plattformen; de kommer från press och är daterade i JSON:en. YouTube- och TikTok-tal är däremot lästa direkt ur plattformen 2026-09-19 och är de enda räckviddstal jag kallar verifierade. Byråernas mediekit, som skulle ge ålders- och könssiffror gratis, gav ingenting: ProAd, Ocast, Aller, Splay One och United Screens har inga profiler i husvagns-, husbils- eller motornischen alls; det enda publicerade åldersspannet i hela nischen är tidningen Husvagn & Campings egen annonssida ("kapitalstarka läsare mellan 40 och 69 år", https://www.husvagnochcamping.se/sidor/annons). Publikens kön och ålder per profil är därför INFERENS för samtliga tills Modash och profilernas egna insikter finns.

Sållningen (fas 2) strök redaktörer utan egna kanaler, community-konton, profiler under golvet på den plattform som gick att läsa (Husbilskanalen 6 240, AM Husbilsliv 757, Vispop 3 220, Livet i Bubblan 2 340, Man ska ha husbil 4 600), kändisarna från TV4-serien "Herngrens husbil" 2018 (Felix Herngren, Malin Berghagen, Plura med flera: kursens kändiskategori kostar 30 000–500 000 USD och är bara för etablerade varumärken, och husbilen var ett TV-jobb för åtta år sedan, inte deras liv), de stora manliga kanalerna utan husvagn i flödet (Kanalgratis, Adam Myllylä, Erik Öst, Oskar Boström, Traktor Power, Jakt är Jakt: räckvidd men produkttolerans under 6), samt två ambassadörer för Campingvaruhuset, som säljer Campmaster Takskydd Husvagn/Husbil från 1 495 kr, alltså en direkt konkurrent (Robban & Jeanette "GlampingExplorer" och Saga "Enfrihetssaga"). Ingen SR-anställd fanns bland de kvarvarande. Femton finalister gick till scorecard.

Scorecarden (fas 3) använde kursens HappyFlops Brain-faktorer med produkttoleransen som egen faktor på 20 % vikt, och två skeptiker (fas 4), en på publik och räckvidd och en på varumärke och genomförbarhet, försökte sedan motbevisa varje påstående. Skeptikerna strök fem: Peter Sandholt (Stora Husbilspodden lades ner 2023-09-29 med avsnittet "The final show", efterföljaren utan honom lades ner 2025-09-25; det finns ingen kanal att köpa), Ribecka (32 år, bor i hus i Åskloster, fordonet skänks bort, publiken är unga mammor, produkttolerans 4), Amalia Braunsthal (bor i nyköpt stuga sedan augusti 2026, ingen vagn, 169 000-siffran saknar källa, NT 2022 säger 60 000), Gurgîn Bakircioglu (bor i kollektiv i Östberga, YouTube sovande sedan januari 2024 med politiskt polariserande titlar, antikonsumtionsprofil, produkttolerans 4) och Nathalie Jonsson (Nynäs Camp är en stugby för jägare utan husvagnsplatser, följartalet från 2019). Skeptikerna räddade också två fel i underlaget: Nilla & Mickes följartal var 18 600, inte 11 100 (rankingen var från 2023), och Levamedhusbils kontaktsida ger 404 medan mejladressen på startsidan gäller. Hela granskningen med status per påstående ligger i scorecard-JSON:en.

## Topp 10 — de som får ett mail, i sändordning

Produkttoleransen avgör ordningen, inte räckvidden. Alla verifierade tal är lästa 2026-09-19 om inget annat sägs. "Viktat" är scorecardens viktade snitt över de faktorer som gick att bedöma; kommentarer och stories fick inget betyg för någon, de mäts i fas 8.

| # | Profil | Räckvidd (verifierad) | Produkttolerans | Viktat | Kontaktväg | Krok (verifierad) | Varning från skeptikerna |
|---|---|---|---|---|---|---|---|
| 1 | Nilla & Micke Trevik, Våra Husbilsresor | YouTube 18 600 (https://www.youtube.com/@VaraHusbilsresor/about) | 8 | 7,0 | info@varahusbilsresor.se (https://www.varahusbilsresor.se/samarbeta) | Egen sektion "Våra bästa prylar", byter solcellsregulator själva; sajten ber uttryckligen om tillbehörssamarbeten | Medvärdar i den nedlagda Stora Husbilspodden med Campingvaruhusets ambassadörer; kopplingen är historisk. Bor i villa i Falkenberg, Alpa 2024 på uppfarten. |
| 2 | Peter & Lotta, Levamedhusbil | YouTube 13 900 (https://www.youtube.com/@levamedhusbil/about) | 9 | 7,2 | kontakt@levamedhusbil.se (https://levamedhusbil.se/) | "Fredagstips"-serien; Peter jobbar med husbilar på verkstad; nyköpt Adria-husvagn 1976 vid sidan av Adria Sonic 2020 | Visade 2026-09-04 hagelskydd från SunOut, som även säljer vintertäcke för husbil: angränsande, kräv kategoriexklusivitet i avtalet. Peters arbetsgivare kan sälja överdrag, fråga i samtalet. |
| 3 | Cajsa Olsson, Min lilla Adria 305 | Instagram 29 700 enligt husbilhusvagn.se 2023, ej läst ur plattformen; TikTok 359 | 9 | 7,9 | Instagram-DM @min_lilla_adria_305 (ingen mejl hittad) | Köpte 45 år gammal Adria 305 för 5 000 kr och renoverade själv (https://www.hemtrevligt.se/hemmetsjournal/artiklar/fritid/20230625/cajsa-min-lilla-adria/) | 93 % kvinnliga följare enligt henne själv 2023: Modash-kolumnen "rätt kön" blir 0 poäng. Hon är med för att testa kursens tes att ägarskap och förtroende slår demografi; budgetprofil kräver att erbjudandet framställs som skydd av en investering, inte lyx. |
| 4 | Annelie & Ludwig Eliasen, Our Third Home | YouTube 8 010 (https://www.youtube.com/@ourthirdhome/about) | 8 | 7,2 | info.o3h@gmail.com (YouTube om-sida) | Nya 4x4-husbilen "Bertha" i Dethleffs monter på Elmia 11–12 sept 2026 (https://www.dethleffs.se/elmia-husvagn-och-husbil) | Dethleffs-ambassadör: fordonsmärke, inte konkurrent, men fråga om avtalet hindrar tillbehörssamarbeten. Var i Georgien 17–19/9, hemkomst okänd. Precis på golvet. |
| 5 | Marlene & Martin Jikita, Jikitas på Äventyr | YouTube 3 930 (under golvet); Instagram OKÄNT | 8 | 7,1 | marlenerinda@gmail.com / mmjikita@gmail.com | Skriver vintercampingtips för FREEDOMtravel (https://www.freedomtravel.se/en/influencers/marlene-rinda-jikita/), skapade "Influencer Corner" på Elmia | Räckvidden är overifierad och YouTube ligger under golvet; med för expertisen, och avtal kräver egna insikter. Letar ny husbil (storleken kan ändras). Blogginlägg 18/9 "Ledsen och orkeslös": skicka tidigast 28/9. |
| 6 | Annika Elgeskog, HusbilsAnnika → ÄventyrsAnnika | YouTube 16 200 (https://www.youtube.com/@HusbilsAnnika/about); Instagram 36 000 enligt Barometern 2022 | 6 | 6,2 | aelgeskog20@gmail.com (YouTube om-sida) | Video 2026-09-16 "HusbilsAnnika går i graven och ger plats åt ÄventyrsAnnika": behåller husbilen Bürstner 532-2 men reser mindre med den | Flödet byter nisch just nu; publiken är uttalat kvinnor; hon är ca 66 år; har samarbete med Zipforce (elcykelkit). Att vagnen ska stå still mer gör produkten mer relevant för henne själv, inte mindre. |
| 7 | Markku & Agneta Korpela, Freedom Living | YouTube 21 200 (https://www.youtube.com/@agnetamarkku-freedomliving706/about) | 6 | 5,8 | Instagram-DM @agneta_markku (länkad från YouTube); ingen mejl | Arrangerar egen husbilsträff för följarna; 57–58 år, bor i villavagn halva året | Övervintrar på Gran Canaria varje år, höstresan startade i augusti: sannolikt utomlands i oktober, och då är ingen vagn att täcka. Betalda partners WattCycle, NomadiQ. Skicka mailet, men avtal bara om vagnen faktiskt står i Sverige i vinter. |
| 8 | Linda & Pär, Reiselinda / Husbilsbloggarna | YouTube 7 430 (under golvet med 570; https://www.youtube.com/@Reiselinda/about) | 8 | 7,5 | lindatorm@gmail.com (https://www.reiselinda.se/husbilsbloggarna/; sidan skriver "gmail.se", som inte finns) | Driver nätverket Husbilsbloggarna med ett trettiotal skapare; heltid i husbilen sedan maj 2022 | Förbereder övervintring i Portugal (videor 30/8 och 6/9): de använder inte överdraget själva i vinter. Värdet är nätverket och att deras publik ställer av. Avtal bara om de kan visa montering före avresan. |
| 9 | Lena Johansson & Lena Ljunggren, 2Tanter1Husvagn | Podd, 32 avsnitt sedan 2026-01-17, lyssnarsiffror finns inte publikt; Instagram OKÄNT | 9 | 8,2 | SAKNAS: ingen mejl, ingen sajt | Reportage 2 juli 2026 på campingsverige.se om podden; Adria Action 2009 "Bulan", vänner i 55 år | Högst tolerans och högst viktat betyg, men noll verifierad räckvidd och ingen kontaktväg. Om de saknar Instagram passar de inte upplägget (stories) och stryks. |
| 10 | Öppen plats | | | | | | Två reserver: Fredrik & Eleonor, Husbilsvloggen (YouTube 7 840, teknik/el, egen webshop, livsstil@husbilsvloggen.se) fick ingen scorecard och ska få en innan mail; Hanna Höglund (TikTok 303 400, äger KABE Classic 660, hannahoglund.jobb@gmail.com) fick produkttolerans 5 och kontaktas inte enligt regeln, publiken är 28-åringens, inte 65-åringens. |

Nio mail passerar reglerna, inte tio. Den tionde platsen fylls först när Husbilsvloggen fått en scorecard eller när 2Tanter visat sig ha en kontaktväg; jag har hellre nio rena än tio där ett bryter mot tröskeln.

## Kalender (byggd bakåt från fönstret i fas 0)

| Vecka | Datum | Vad |
|---|---|---|
| 39 | mån 21 sept | DKIM slås på i Loopia, avsändaradressen bekräftas. Mail 1–4 och 6–8 går ut, ett i taget, förmiddag. Observationen dag 1 börjar samma dag för alla nio (även de som inte fått mail än). |
| 39 | fre 25 sept | Uppföljning (fyra arbetsdagar) till de som inte svarat: två rader. |
| 40 | mån 28 sept | Mail 5 (Jikitas) går ut. Samtal med de som svarat ja; vagnens längd; produkt beställs/skickas samma dag (leveranstid 5–10 arbetsdagar enligt butiken, så tidigast v41 hos profilen). |
| 41 | sön 4 okt | Observationens dag 14 för de första. Beslut per profil: boka (snitt ≥ 3,5 och ≥ 10 dagar med stories) eller reserv. Modash-PDF:er laddas upp och räknas. |
| 41 | mån–fre 5–9 okt | Avtal skrivs med tre profiler. Slutdatum för annonsrätten skrivs in i kalendern och som `end_time` på ad setet samma dag. Produkten monteras på deras vagn, tre egna idéer in, en väljs. |
| 42 | tis 13, tors 15, lör 17 okt | Live: tre profiler samma vecka med en till två dagars mellanrum. Samma morgon ligger 5–10 hook-varianter + 3–5 stillbilder ur videon i ett eget test-ABO (regel 11), bredvid kampanjens PD/CS/GT/SP. |
| 42–44 | 13–27 okt | Annonsrätt 14 dagar. Beslut om förlängning fre 23 okt: förläng två veckor om annonserna ligger över break-even-ROAS 1,70. |
| 44–46 | 27 okt–10 nov | Förlängning för de som fungerar. Efter 15 nov stängs fönstret; nästa är april. |

## Fas 5 — Modash-mallen (30 % av beslutet)

Kursen tittar på sju tal och säger uttryckligen att resten ska ignoreras. Engagement rate, följartillväxt och likes används inte. Paid engagement antecknas men ger inga poäng. Så här räknas varje rapport när Axel laddat upp PDF:en:

| Tal | Vikt | 10 p | 8 p | 5 p | 2 p | 0 p |
|---|---|---|---|---|---|---|
| Falska följare | 20 % | ≤ 10 % | 11–15 | 16–20 | 21–30 | > 30 |
| Real people | 15 % | ≥ 85 % | 75–84 | 65–74 | 55–64 | < 55 |
| Följer ≤ 500 konton | 15 % | ≥ 70 % | 55–69 | 40–54 | 20–39 | < 20 |
| Snittkommentarer | 20 % | ≥ 100 | 60–99 | 40–59 | 20–39 | < 20 |
| Rätt kön = **män** (köparna är 86 % män) | 10 % | ≥ 80 % | 70–79 | 60–69 | 50–59 | < 50 |
| Rätt åldersgrupp = **45–64** (proxy, se nedan) | 15 % | ≥ 50 % | 40–49 | 30–39 | 20–29 | < 20 |
| Rätt land = Sverige | 5 % | ≥ 85 % | 75–84 | 65–74 | 55–64 | < 55 |

Modash-betyg = summan av (poäng × vikt). Tre spärrar slår igenom oavsett summa: över 30 % falska ger högst 3, under 65 % i Sverige ger högst 4, under 20 kommentarer ger högst 5. Delpoängen per kolumn skrivs ut i scorecard-JSON:en så att uträkningen går att kontrollera.

Två saker ska sägas rakt ut. Modash delar bara åldern upp till 45–64, så 65+, som är 63 % av våra köpare, syns inte alls; vi använder 45–64 som närmaste mätbara proxy och kompletterar med profilens egna Instagram-insikter (fas 8), som visar 65+. Och svenska profiler ligger generellt lågt på kommentarer; kursens 60 är en hög ribba här, så en svensk nischprofil på 25–40 kommentarer är inte automatiskt dålig, men får ändå de poäng tabellen säger, för mallen ska vara samma för alla.

Slutbetyget per profil = 0,30 × Modash-betyget + 0,70 × observationsbetyget (fas 8). Scorecarden i fas 3 avgör vilka tio som får ett mail; Modash och observationen avgör vilka som får ett avtal.

## Fas 7 — upplägget

Bara stories, tre till fem frames, varav minst två video och en bild med erbjudandet. Inga inlägg, inga reels, inga långa avtal; kursen är tydlig att inlägg och reels kostar mer och säljer sämre, eftersom publiken tittar på stories, inte på flödet. Annonsrätt alltid, för det är där merparten av pengarna finns: kursens erfarenhet är att det som säljer organiskt på en story säljer ungefär lika mycket per dag i annonser med samma material. Två veckor i taget, förlängning två veckor till om det fungerar, sedan trettio dagar först när profilen är bevisad. Vill du ha trettio dagar direkt kostar det enligt kursens egen prisbild ungefär det dubbla mot två veckor (byråerna prissätter en månads rättigheter i nivå med själva storyn, två veckor till halva), och du betalar då för två veckor som materialet kanske redan dött. Rekommendationen är alltså 14 dagar, inte 30, i första avtalet.

Ett arvode som täcker både stories och annonsrätt, aldrig två poster. Arvodesnivån är INFERENS tills första samtalet: för svenska nischprofiler med 10 000–40 000 följare bör 3 000–10 000 kr för tre till fem stories plus 14 dagars annonsrätt vara rimligt, och för en profil i Ribeckas storlek 15 000–30 000 kr. Kursens egna tal (5 000–30 000 USD för high performers) gäller större marknader. Break-even i fas 0 ger måttstocken: 665 kr täckningsbidrag per order betyder att ett arvode på 6 650 kr kräver tio ordrar.

Slutdatumet för rättigheterna sätts i kalendern och i annonskontot samma dag avtalet skrivs: ad setet får `end_time` = slutdatum kl 23:59, och en kalenderpåminnelse två dagar före med frågan "förlänga eller stänga". Missade slutdatum ger straffavgifter och förstör relationen.

Brief till profilen, max fem gör och fem gör inte, plus tre egna idéer:

Gör: 1. Visa produkten inom tre sekunder, på din egen vagn. 2. Minst en frame är själva monteringen i verkligheten, remmarna som hakas i, inte en produktbild. 3. Säg varför bara taket: helöverdraget skaver mot lacken och kräver två personer. 4. Prata som du brukar, in i kameran, inget manus. 5. Sista framen är en bild med erbjudandet och länken.
Gör inte: 1. Skriv inte butikens namn i bild eller tal, länken räcker. 2. Nämn inget pris som inte står på produktsidan den dagen. 3. Inga påståenden om hur många vi sålt. 4. Ingen musik över talet. 5. Ingen annan husvagnsprodukt i samma story-sekvens.
Och sedan: "Ge oss tre egna idéer innan du filmar." Profilen vet hur hennes publik fungerar bättre än vi.

Varje story-frame märks som reklam enligt branschreglerna, se juridiken nedan.

Launch: tre profiler samma vecka med en till två dagars mellanrum. Samma dag ska fem till tio hook-varianter klippta ur profilens video plus minst tre andra format ligga redo i annonskontot. De tre andra formaten finns redan: kampanjens PD-, CS-, GT- och SP-vinklar ligger live, så det som saknas launchdagen är bara hook-varianterna och tre till fem stillbilder ur videon.

## Fas 8 — tvåveckorsobservationen (70 % av beslutet)

Observationen börjar samma dag som mailen går, inte efter svaret; annars hinner fönstret stängas. Varje dag i fjorton dagar, för varje profil som fått mail:

| Dag | Datum | Stories i dag? | Pratar in i kameran om sitt eget liv? | Svarar följarna? | Antal reklamer | Betyg 1–5 | Anteckning |
|---|---|---|---|---|---|---|---|

Betyget: 5 = pratar in i kameran utan filter och manus, vardag, familj, motgångar, humor, svarar följarna. 3 = blandat, mest snygga bilder. 1 = bara reklam och polerade bilder, eller tyst. Snitt 3,5 eller högre och minst tio dagar med stories: boka. Under 3, eller fyra dagar utan något: reserv. Kommentarerna räknas en gång: snittet över de fem senaste inläggen, kursens gräns är 60 (svenska profiler ligger lägre, se ovan).

Varje profil som säger ja ombeds om skärmdumpar av sina egna Instagram-insikter: ålder, kön, land och story-visningar de senaste 30 dagarna. Det är bättre data än Modash och gratis, och det är enda stället där 65+ syns. Vägrar hen visa dem är det ett svar i sig.

Observationen kan inte göras från den här sessionen (Instagram svarar 429). Den görs av en människa i Instagram-appen, tio minuter om dagen, och betygen skrivs in i tabellen i rapporten. Det står som en av dina uppgifter sist.

## Juridik

Reklammärkning: varje story-frame ska vara tydligt märkt som reklam från början, med ordet "Reklam" eller "Betalt samarbete" synligt i bild, inte bara Instagrams egen partnerskapsetikett och inte bara en hashtag. Det följer marknadsföringslagens krav på reklamidentifiering, och Konsumentverket har drivit ärenden mot influencers för otydlig märkning. Ansvaret delas mellan profilen och annonsören, så vi skriver kravet i avtalet.

Annonsrätt är en licens, inte ett köp: avtalet ska ange period (14 dagar från publiceringsdagen), kanaler (Meta, våra egna konton), rätt att klippa hooks och ta stillbilder ur materialet, och att rätten upphör vid slutdatumet om den inte förlängs skriftligt. Inga andra rättigheter (inga inlägg, ingen exklusivitet).

Skatt och fakturering: arvodet betalas mot faktura från en profil med F-skatt eller via byrå. Saknar hen F-skatt blir vi som utbetalare skyldiga att dra skatt och betala arbetsgivaravgifter (INFERENS, kontrollera med redovisningen innan första utbetalningen). Produkten som gåva är ingen ersättning så länge inget krävs tillbaka.

Public service: anställda på Sveriges Radio får normalt inte göra reklam, och SVT-programledare har karantän fyra veckor före första och fyra veckor efter sista sändning, repriser inräknade; undantaget för det egna yrket täcker bara deras bransch. Ingen på topp 10 är SR/SVT-anställd enligt det vi kunde läsa; Gurgîn Bakircioglu är före detta och Peter Sandholt är kommersiell radio (Bauer Media), vilket inte har samma regler men kan ha egna riktlinjer.

Butikens namn står aldrig i annonsen (Axels regel 2026-09-18): länken är metadata, men "Bäverbutiken" ska inte sägas i bild eller tal, eftersom materialet kan speglas till CaraShell.

Inga säljsiffror i utåtriktad text: mailen säger inget om hur mycket vi sålt, "slutsåld" används aldrig, och inget kundantal som inte kan beläggas.

## Budget och antal exemplar

Produkten kostar oss 436 kr per exemplar (härledd, se fas 0) plus frakt. Kursens modell är att skicka produkten till alla tio utan förväntningar, och den regeln följs: tio exemplar budgeteras, cirka 4 400 kr plus frakt. Men ett taköverdrag finns i nio längder, och ett i fel längd är värdelöst, så mailet erbjuder produkten och svaret får ge vagnens längd innan något skickas. Räkna med att fem till sju tackar nej; de erbjuds ändå produkten som gåva utan krav, och den som inte svarar på storleksfrågan får inget skickat. Arvoden för tre till fem avtal enligt nivåerna ovan: 20 000–50 000 kr totalt, betalda först när avtalet är skrivet, aldrig i förskott mot en story som inte finns.

## Fas 6 — mailen

**Avsändare: CaraShell, inte Bäverbutiken (Axels beslut 2026-09-21).** Produkten är samma, men mottagarna är husvagns- och husbilsprofiler, och Bäverbutikens `/collections/all` visar två produkter — en tratt och en koppling — medan menyn heter Bäverkoppling och Bävertratt. En profil som klickar sig vidare ser ingen husvagnsbutik. CaraShells hela sortiment är Taköverdraget och Termoskyddet, med 16 recensioner på taköverdraget mot Bäverbutikens 10 (avläst 2026-09-21). Detta följer också `factory/TRAPPAN.md`: Bäverbutiken är testbädd, creative strategy sker på OPS-butiken. Annonsrätten körs därmed i **Magiborsten DK `915422744950975`**, inte i MagiBorsten. Kostnaden för bytet är liten: CaraShells SE-kampanj har 29 489 kr spend, 78 köp och ROAS 3,48 (CPA 378 kr) mot Bäverbutikens 99 661 kr, 308 köp och ROAS 3,72 (CPA 324 kr), båda långt över break-even 1,70. Köpardatan i fas 0 gäller fortfarande: samma produkt, samma köpare.

Kursens struktur, sex meningar i brödtexten plus ämnesraden som bär den personliga kroken. Ett mail per person, mottagarens namn i Till-fältet, aldrig hemlig kopia. Avsändaradress: **hello@carashell.se** (står på carashell.se/pages/contact; domänen har MX hos Loopia och SPF). Inga säljsiffror, ingen "slutsåld", inget kundantal, inget pris. Villkor och antal dagars annonsrätt nämns inte; det tas i samtalet. Produktlänken som ges i samtalet är carashell.se/products/takskyddet.

Bolagsfakta som används (verifierade 2026-09-21 på carashell.se): CaraShell gör två produkter, taköverdrag och termoskydd för husvagn och husbil; drivs av STONEBITE ECOM AB, org.nr 559576-2401, Harestad utanför Göteborg; fri frakt inom Sverige och Norge; 14 dagars ångerrätt; Klarna; säljer även i Danmark, Finland, USA, Storbritannien, Kanada, Australien och Nya Zeeland.


Utskickssidan (Axels egen, ett klick per mejl): https://claude.ai/artifact/DCruZBzC27cnRUx3joHVeg — byggd 2026-09-21 eftersom mailen inte går att skicka härifrån: det finns inget lösenord till hello@carashell.se i environmentet och proxyn blockerar utgående SMTP (587 och 465 svarar inte, mätt samma dag). Sidan öppnar färdigt mejl via mailto och kopierar DM-texterna; den skickar ingenting själv.

**Version 5, 2026-09-21 (Axels invändning).** Fem av nio mail lutade sig på "svenskt märke" i kursens trovärdighetsmening. Axel invände att det känns oärligt när produkten fulfillas från Kina, trots att inget påstående är falskt: bolaget är svenskt, ångerrätten följer svensk lag, och fraktpolicyn anger öppet 5–10 arbetsdagar. Problemet var att meningen är svag, inte osann — "svenskt märke" är vad varje dropshippare skriver. De fem meningarna bär nu specialiseringen i stället (två produkter, båda för husvagn och husbil, sålda i nio länder). Svenskheten står kvar som faktum där den har värde för kunden: Stonebite Ecom AB utanför Göteborg, ångerrätt enligt svensk lag.

**Version 4, granskad 2026-09-21.** Version 1 underkändes av en helhetskritiker: fem av sex meningar var ordagrant identiska i alla nio mail, och Linda (Reiselinda) driver nätverket Husbilsbloggarna med ett trettiotal skapare som skulle se det direkt. Version 2 granskades av nio faktagranskare plus en helhetskritiker, som fann påhittade fakta i alla nio (bland annat sömmar på en produkt utan dokumenterade sömmar, och en video som påstods ligga i en kategori den inte bevisligen ligger i) samt att kursens femte mening, den som bokar samtalet, saknades i samtliga. Version 3 rättade det. Version 4 byter avsändare till CaraShell. Kursens sexmeningsstruktur behålls med flit trots kritikerns invändning: den är kursens metod och Axels hårda regel 6. Längsta ordagranna överlapp mellan två mail är 13 ord (var 28), median 9.

### 1. Nilla & Micke Trevik
Till: info@varahusbilsresor.se (sidan Samarbeta på varahusbilsresor.se; alternativ varahusbilsresor@gmail.com)
Ämne: Videon där ni byter solcellsregulatorn själva

Hej Nilla och Micke, jag heter Axel och driver CaraShell. Ni bytte solcellsregulatorn själva i en video, och på sajten har ni en egen kategori som heter Våra Bästa Prylar. Jag vill skicka er ett taköverdrag utan förväntningar på att ni gör något av det, eftersom det vi är ute efter är ett betalt samarbete. Det är ett överdrag som bara täcker takytan och inte hela vagnen, med justerbara remmar som hakas fast på alla fyra sidor, och jag vill att ni testar det på er egen bil först. Gillar ni det bokar vi ett kort samtal. CaraShell gör bara två saker, taköverdrag och termoskydd till husvagn och husbil, och jag hör av mig till just er eftersom ni efterfrågar tillbehörssamarbeten på sidan Samarbeta.

Axel Odhner, CaraShell, 079-340 44 07

### 2. Peter & Lotta
Till: kontakt@levamedhusbil.se (anges på startsidan och på YouTube; sidan /kontakt/ ger 404, adressen gäller ändå)
Ämne: Fredagstips varje vecka, och nu en Adria från 1976

Hej Peter och Lotta, jag heter Axel och driver CaraShell. Ni gör Fredagstips vecka efter vecka, och nu har ni dessutom tagit hem en Adria från 1976 vid sidan av Sonicen. Jag skulle vilja skicka er ett taköverdrag att behålla, utan krav på något tillbaka, eftersom vi är intresserade av ett betalt samarbete. Det är silverbelagd oxfordväv som bara läggs över takytan, inte ett helöverdrag som ska tas runt hela vagnen, och jag vill att ni provar det på er egen först. Gillar ni det tar vi ett kort samtal om fortsättningen. Vi gör bara skydd till husvagn och husbil och säljer dem i nio länder, och jag skriver till er båda eftersom Peter håller på med husbilar även utanför kanalen.

Axel Odhner, CaraShell, 079-340 44 07

### 3. Cajsa Olsson
Skickas som Instagram-DM till @min_lilla_adria_305. Ingen mejladress finns. Dela i två meddelanden om Instagram kapar längden; ämnesraden blir första raden.
Ämne: Adria 305:an du köpte för 5 000 och gjorde om själv

Hej Cajsa, jag heter Axel och driver CaraShell. Du köpte en 45 år gammal Adria 305 för 5 000 kronor och gjorde om den själv, ner till diskhon av en gammal skål. Jag vill skicka dig ett taköverdrag, utan att det ska betyda något åt något håll, för det vi hoppas på är ett betalt samarbete. Överdraget går bara över takytan och en person får det på plats själv med remmar på alla fyra sidor, och jag vill att du provar det på din vagn först. Gillar du det bokar vi ett kort samtal. CaraShell drivs av Stonebite Ecom AB utanför Göteborg och har två produkter i hela sortimentet, båda för husvagn och husbil, och jag skriver till dig eftersom den som renoverat en vagn själv vet vad arbetet är värt.

Axel Odhner, CaraShell, 079-340 44 07

### 4. Annelie & Ludwig Eliasen
Till: info.o3h@gmail.com (YouTube-kanalens om-sida). De var i Georgien 17–19/9, så svaret kan dröja.
Ämne: Grattis till Bertha

Hej Annelie och Ludwig, jag heter Axel och driver CaraShell. Grattis till Bertha, som ni visade upp på Elmia nu i september. Jag vill gärna skicka er ett taköverdrag till henne, utan krav i gengäld, eftersom vi är intresserade av ett betalt samarbete. Det täcker bara takytan, så resten av lacken får vara i fred, och jag vill att ni provar det på Bertha först. Gillar ni det bokar vi ett kort samtal. CaraShell finns i Norden och numera även i USA och Storbritannien, och jag hör av mig eftersom ni kör en ny bil på äventyrsresor i Europa.

Axel Odhner, CaraShell, 079-340 44 07

### 5. Marlene & Martin Jikita
Till: marlenerinda@gmail.com (bloggens kontakt; alternativ mmjikita@gmail.com). ⚠️ Bloggen 18/9 heter "Ledsen och orkeslös" — Axels beslut om mailet går i dag eller väntar till 28/9.
Ämne: Dina artiklar om vintercamping i FREEDOMtravel

Hej Marlene, jag heter Axel och driver CaraShell. Du skriver om vintercamping och om vad nya husbilsägare behöver tänka på i FREEDOMtravel, vid sidan av allt annat ni gör. Jag vill skicka dig och Martin ett taköverdrag att behålla oavsett vad ni tycker om det, eftersom vi är ute efter ett betalt samarbete. Det är ett överdrag som bara går över takytan, i silverbelagd oxfordväv med remmar på alla fyra sidor, och jag vill att ni provar det själva innan ni säger något om det. Gillar ni det tar vi ett kort samtal. CaraShell gör taköverdrag och termoskydd för husvagn och husbil och ingenting annat, och jag skriver till dig eftersom du är journalist och skriver om utrustning för folk som ska ut i vinterväder.

Axel Odhner, CaraShell, 079-340 44 07

### 6. Annika Elgeskog
Till: aelgeskog20@gmail.com (YouTube-kanalens om-sida)
Ämne: Över sexhundra videor sedan 2014

Hej Annika, jag heter Axel och driver CaraShell. Du har lagt ut över sexhundra videor sedan 2014, och nu byter kanalen namn till ÄventyrsAnnika medan Lilla Fina får stanna kvar. Jag skulle vilja skicka dig ett taköverdrag utan krav på något tillbaka, för det vi är ute efter är ett betalt samarbete. Överdraget täcker takytan i stället för hela vagnen, vilket gör att en person kan lägga på det själv, och jag vill att du provar det på Lilla Fina först. Gillar du det bokar vi in ett kort samtal. CaraShell gör två saker, taköverdrag och termoskydd, och dina följare handlar med Klarna och har 14 dagars ångerrätt enligt svensk lag, och jag skriver till dig eftersom din publik följt dig i över tio år och litar på vad du väljer.

Axel Odhner, CaraShell, 079-340 44 07

### 7. Markku & Agneta Korpela
Skickas som Instagram-DM till @agneta_markku (länkad från YouTube). Ingen mejladress finns. De är sannolikt utomlands i oktober.
Ämne: Träffen ni ordnar för era följare

Hej Markku och Agneta, jag heter Axel och driver CaraShell. Ni ordnar en egen husbilsträff för era följare, och det är inte många som går så långt för att faktiskt möta dem som tittar. Jag vill skicka er ett taköverdrag att ha, utan förväntningar åt något håll, eftersom vi är intresserade av ett betalt samarbete. Det är ett överdrag som bara täcker taket, med två förstärkta spännremmar utöver dem som sitter på, och jag vill att ni provar det själva först. Gillar ni det bokar vi ett kort samtal. Bakom CaraShell står Stonebite Ecom AB utanför Göteborg, vi gör bara skydd till husvagn och husbil och skickar fritt till både Sverige och Norge, så jag hör av mig eftersom era följare möter er på riktigt och ser bilen med egna ögon.

Axel Odhner, CaraShell, 079-340 44 07

### 8. Linda & Pär
Till: lindatorm@gmail.com (reiselinda.se/husbilsbloggarna skriver "gmail.se", som inte är en giltig domän)
Ämne: Hur hinner ni med Husbilsbloggarna?

Hej Linda och Pär, jag heter Axel och driver CaraShell. Ni håller ihop Husbilsbloggarna med ett trettiotal skapare samtidigt som ni bott i bilen på heltid sedan 2022, och jag undrar ärligt hur ni får tiden att räcka till. Jag vill gärna skicka er ett taköverdrag, och det kommer utan krav, för vi är intresserade av ett betalt samarbete. Det är ett överdrag för takytan som en person klarar själv, till skillnad från ett helöverdrag som kräver två, och jag vill att ni provar det när det passar er. Gillar ni det tar vi ett kort samtal. CaraShell gör två produkter, taköverdrag och termoskydd, båda för husvagn och husbil, och jag skriver till er eftersom ni hållit på sedan 2011 och vet vad som håller.

Axel Odhner, CaraShell, 079-340 44 07

### 9. Lena Johansson & Lena Ljunggren
⚠️ KONTAKTVÄG SAKNAS. Ingen mejl, ingen sajt. Sök "2tanter1husvagn" på Instagram och skicka som DM. Finns inget konto passar de inte upplägget med stories och stryks. Bulan är en Adria Action 2009 — minsta storleken är 5,5 m, så fråga längden innan något skickas.
Ämne: Ni har hållit ihop längre än de flesta husvagnar

Hej Lena och Lena, jag heter Axel och driver CaraShell. Ni startade en podd utan att ha gjort det förut, efter 55 års vänskap, och första resan med Bulan gick till Grövelsjön. Jag vill skicka er ett taköverdrag till Bulan, utan att ni behöver göra något för det, eftersom det är ett betalt samarbete vi vill åt. Det läggs bara över takytan och hakas fast med remmar på alla fyra sidor, och jag vill att ni provar det på Bulan först. Gillar ni det bokar vi ett kort samtal. CaraShell har två produkter i hela sortimentet, taköverdraget och ett termoskydd, och jag skriver till er eftersom ni pratar om campinglivet från insidan.

Axel Odhner, CaraShell, 079-340 44 07

### Byråvarianten (ingen av de nio har en byrå enligt det vi kunde läsa; mallen används om en byrå dyker upp i svaret)
Samma mail ord för ord, med profilens namn i ämnesraden ("angående <namn>: <kroken>"), plus en rad sist före signaturen: "Skicka gärna er prislista för stories och annonsrätt så att vi kan komma förberedda till samtalet."

### Uppföljning efter fyra arbetsdagar (två rader, ingen ny pitch)
Hej <namn>, jag ville bara lyfta mitt mail från i <veckodag> om taköverdraget. Säg till om ni vill ha ett skickat, så behöver jag bara vagnens längd.

### Svar på ett nej (en rad, inga argument, ingen fråga varför, ingen uppföljning)
Tack för svaret, <namn>. Vill ni ändå ha ett överdrag till vagnen skickar jag gärna ett, utan några krav.

### Svar på ett ja (nästa steg)
Vad roligt. Hur lång är vagnen, så att jag skickar rätt storlek (vi har 5,5 till 13,5 meter)? Och passar det med ett kort samtal på <två förslag>? Skicka gärna en skärmdump av dina Instagram-insikter (ålder, kön, land, story-visningar 30 dagar) innan vi ses, så pratar vi om samma siffror.
## Vad som inte gick att verifiera

Instagram-följartal för samtliga (plattformen svarade 429 eller 302 på varje försök; alla Instagram-tal i rapporten är från press och daterade). Publikens kön och ålder för samtliga (ingen plattform visar det utan Modash eller profilens egna insikter). Kommentarernas kvalitet och stories för samtliga (mäts i fas 8, av en människa i appen). Lyssnarsiffror och kontaktväg för 2Tanter1Husvagn. Our Third Homes hemkomstdatum och om Dethleffs-avtalet har exklusivitet. Om Peter (Levamedhusbil) arbetsgivare säljer överdrag. Freedom Livings och Jikitas exakta publik. Nilla & Mickes, Linda & Pärs, Peter & Lottas och Annelie & Ludwigs ålder. Skandaler och kontroverser: utan sökmotor betyder "inget hittat" inte "ren" för någon utom Gurgîn, där det hittades. Inköpspriset 436 kr (härlett, inte kvitterat). Avsändaradressen hello@carashell.se är läst av carashell.se/pages/contact men inte testad med ett skickat mail.

## Utfallslogg

En rad per svar som kommer in. Fylls på i den här filen, aldrig i chatten.

| Datum | Profil | Händelse (mail ut / svar / samtal / avtal / nej / live) | Vad hen sa | Vad det lär oss |
|---|---|---|---|---|
| 2026-09-19 | alla | Rapporten skriven, inga mail skickade | | Nio av tio mail klara; det tionde väntar på en scorecard eller en kontaktväg. |
| 2026-09-21 | alla nio | mail och DM ut | | Utskicket gjort från hello@carashell.se. |
| 2026-09-23 | Marlene Jikita | svar: ja, men vill hellre ha termoskyddet | "Taköverdraget känns lite knepigt för oss, då vår husbil inte står still så många dagar i taget." Har nu en halvintegrerad Adria. | **Taköverdraget säljer till den som ställer av.** Kör profilen året om ser hon ingen nytta och säger det rakt ut. Det stämmer med köpardatan, där 93 % är 55+. Fråga om profilen ställer av innan nästa outreach-omgång, och erbjud termoskyddet till dem som kör året om. |
| 2026-09-24 | Cajsa Olsson | svar: ja, adress lämnad | "både för att man själv lätt kan ta av och på det plus att det är en fördel att det inte täcker hela husvagnen" | Hon upprepade obedd de två argument som mailets fjärde mening leder med. Produktvinkeln är rätt formulerad och kan gå rakt in i annonscopy. ⚠️ Vagnen är en Adria 305 från 1980 och minsta överdraget är 5,5 m — längden måste bekräftas före utskick. |
| 2026-09-24 | Cajsa Olsson | vagnen är 3,05 m, vi tackade nej | "Oj min vagn är bara 305 cm. Kan det funka med ert minsta eller det blir för stort?" | Minsta överdraget är 5,5 m, alltså 2,45 m för långt. Vi sa nej själva hellre än att skicka något som hänger 1,2 m över fram och bak och fångar vind. **Produktlucka:** vagnar under 5 m täcks inte av sortimentet, och leverantörens serie börjar på 5,5 m. Cajsa har 29 700 följare i just den nischen. **Process:** fråga vagnens längd redan i första kontakten med husvagnsägare, inte efter att de tackat ja. |

