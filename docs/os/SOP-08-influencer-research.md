# SOP-08: Influencer-research enligt The Celebrity Code

Färdig prompt att klistra in i en ny chatt tillsammans med kursdokumentet
(`The Celebrity Code – transkriberad`). Den behöver bara två saker av Axel: en
produktlänk och ett annonskonto-id. Allt annat tar sessionen själv reda på.

Skriven 2026-09-19 efter första körningen (Matstrumpor, Sushi-Strumpor) och skriven
om samma dag för Bäverbutikens taköverdrag. Allt under "Hårda regler" är köpt med
riktiga misstag. Ändra dem inte utan att veta varför de finns.

Den viktigaste lärdomen: **produkttoleransen avgör om det blir ett ja, publikens
siffror avgör vad ett ja är värt.** Vilken tolerans som är rätt beror helt på
produkten. En skämtprodukt behöver någon som tål att vara fånig. En dyr
nyttoprodukt behöver motsatsen: någon vars publik redan pratar utrustning.

---

## Prompten (klar att klistra in, gäller taköverdraget)

```
Du ska hitta och kontakta influencers åt en av mina produkter, enligt metoden i det
bifogade kursdokumentet (The Celebrity Code, Santiago Talavera, HappyFlops). Läs hela
kursen först. Den är facit; när min instruktion och kursen krockar frågar du mig.

Svara på svenska, i löpande text, inte i punktlistor. Kör hela vägen utan att stanna
för godkännande mellan faserna. Fråga bara om ett beslut kräver ägaren, alltså pris,
rabatt eller ny målgrupp. Allt annat tar du reda på själv.

PRODUKT: https://baverbutiken.se/products/takoverdrag-husvagn-6-5-3-m-skyddar-den-dyraste-ytan
ANNONSKONTO: <fyll i id>

## FAS 0: TA REDA PÅ ALLT SJÄLV INNAN DU LETAR NÅGON

Du får en länk och ett kontonummer. Resten listar du ut.

1. Läs produktsidan. Lägg till .js efter produktens adress så får du ren JSON med
   titel, alla varianter, priser, jämförpriser, lagerstatus och hela beskrivningen.
   Sidan är sanningen om pris och innehåll, aldrig en äldre brief eller annons.
2. Avgör vilken av mina verksamheter sajten tillhör och KONTROLLERA att annonskontot
   jag angett hör till just den. Jag driver tre verksamheter med separata konton och
   fel konto kostar riktiga pengar. Stämmer det inte: stanna och säg till.
3. Leta själv upp den aktiva kampanjen för den här produkten i kontot. Jag vet inte
   vad den heter. Sök bland aktiva kampanjer och annonser efter produktnamnet, och
   visa mig vad du valt och varför innan du bygger något på det.
4. Hämta den verkliga köparfördelningen: kön och ålder på dem som faktiskt köpt.
   Använd ads_get_ad_entities med breakdowns age och gender. Fältnamnen är exakta:
   amount_spent, actions:omni_purchase, cost_per_omni_purchase, purchase_roas. Det
   heter inte spend eller purchases. Fältet omni_purchase_values är buggigt, korskolla
   alltid intäkt mot amount_spent gånger purchase_roas.
   Finns det ingen köpdata än: säg det rakt ut och härled målgruppen ur produkten i
   stället, tydligt märkt som antagande.
5. Räkna fram break-even: pris minus moms om moms tas ut, minus inköp och frakt, minus
   cirka 2,5 procent avgifter. Saknas inköpspriset är det den enda siffran du får
   fråga mig om. Gissa aldrig.
6. Härled säsongen ur produkten. När på året köps den, och när måste samarbetet
   därför vara live? Säg det innan du föreslår en kalender.

Leverera fas 0 som en kort text: vad produkten är, vad den kostar, vem som köper,
break-even per order, och vilket fönster vi har. Allt därefter utgår från den texten.

## HÅRDA REGLER (dyrköpta, bryt dem inte)

1. PRODUKTTOLERANSEN AVGÖR, INTE BARA SIFFRORNA. Förra gången tackade två profiler
   nej med exakt samma motivering: produkten passade inte deras varumärke. Den ena
   hade 9,6 av 10 i Modash. Fråga därför om varje kandidat: kan den här produkten
   ligga i hennes flöde utan att någon höjer på ögonbrynen? Poängsätt det 0 till 10
   som en egen faktor med minst 20 procents vikt, och kontakta ingen under 6.
   Vad som är hög tolerans beror på produkten. För en dyr nyttoprodukt är det någon
   vars publik redan pratar om just den utrustningen, som visar sitt eget slit och
   sina egna misstag, och som redan rekommenderat prylar i samma prisklass. En bred
   livsstilsprofil utan ämnet i flödet är låg tolerans här, även om hon har enorm
   räckvidd. Det är precis tvärtom mot en skämtprodukt.
2. ÄGARSKAP SLÅR RÄCKVIDD I EN NISCH. Här ska publiken äga det produkten skyddar.
   Femtontusen följare som alla har husvagn är värt mer än tvåhundratusen som tycker
   camping verkar mysigt. Kursen säger att man börjar vid hundratusen följare, och det
   gäller breda konsumentprodukter. För en nischad nyttoprodukt sänker vi golvet till
   åttatusen, och du ska skriva ut att det är en medveten avvikelse från kursen.
3. HITTA ALDRIG PÅ SIFFROR. Varje påstående märks VERIFIERAD med länk eller INFERENS.
   Hellre "det går inte att verifiera" än ett tal som ser rimligt ut.
4. ETT MAIL PER PERSON. Aldrig hemlig kopia, aldrig massutskick. Mottagaren ska se sitt
   eget namn i Till-fältet. Skicka från en domän med SPF och DKIM, aldrig från en
   gratis mailadress, annars landar det i skräpposten och ser oseriöst ut.
5. INGA SÄLJSIFFROR I UTÅTRIKTAD TEXT. Skriv aldrig hur mycket vi sålt, aldrig
   "slutsåld", aldrig kundantal vi inte kan belägga.
6. KURSENS MAILSTRUKTUR GÄLLER ORD FÖR ORD. Se fas 6. Korta inte ner den, lägg inte
   till en vänlig inledning, ta inte bort ämnesradens personliga krok.
7. EN AFFÄR ÄR EN AFFÄR. Säg rakt ut att det är ett betalt uppdrag och inte produkt mot
   inlägg. Ett arvode som täcker både stories och annonsrätt, aldrig två poster.
8. PRISET HÄMTAS FRÅN PRODUKTSIDAN VID VARJE KÖRNING, aldrig ur en äldre text.

## FAS 1: BRUTTOLISTA, CIRKA 100 NAMN

Kursens tratt är 100 till 50 till 20 till 10. Kör många parallella sökspår som var
för sig är smala; breda sökningar ger samma tjugo kändisar varje gång.

Härled spåren ur produkten, inte ur en mall. För en husvagnsprodukt betyder det
ungefär: husvagns- och husbilsprofiler, campingfamiljer och campingpar, vinter- och
vinterförvaringsinnehåll, vanlife och fordonsrenovering, bilsport- och släpvagnsfolk,
friluftsliv och fiske med fordon, resor i Sverige och Norden, Caravan Club och andra
klubbar, husvagnsmässor och branschprofiler, YouTube- och bloggprofiler som testar
utrustning, samt de konkurrerande varumärkenas egna samarbeten. Lägg också ett spår
på byråernas mediekit, det är det enda som ger riktiga ålders- och könssiffror gratis.

Tänk på att den här publiken till stor del är par och att män kan vara en lika stor
köpargrupp som kvinnor. Låt fas 0 avgöra det, inte en förutfattad mening.

Källor som fungerar: proad.se/vara-profiler, ocast.com, aller.se, unitedscreens.com,
splayone.com, svensk press, Wikipedia, talarförmedlingar, bokförlag, podcastsidor,
klubbtidningar och mässornas utställarlistor.
Källor som är blockerade: Instagram svarar 429, HypeAuditor och StarNgage svarar 403.
Räkna inte med dem.

## FAS 2: SÅLLA TILL CIRKA 20

Dedupe på namn och handle. Stryk anställda på Sveriges Radio, de får oftast inte göra
reklam. Stryk SVT-programledare med pågående program: karantänen är fyra veckor före
första och fyra veckor efter sista sändning för återkommande programledare, och
repriser räknas. Undantaget för det egna yrket täcker bara deras egen bransch.
Stryk profiler som redan har ett pågående samarbete med en direkt konkurrent.

## FAS 3: SCORECARD PER FINALIST

Använd kursens prompt (HappyFlops Brain) men lägg till produkttoleransen som egen
faktor. Poängsätt 1 till 10 på: nationell eller nischad kännedom, omtyckthet, mänsklig
koppling, kommentarernas kvalitet, stories, äkthet, publikmatch, produkttolerans,
trygghet, varumärkessäkerhet, god gärning, selektivitet och kommersiell trovärdighet.
Varje poäng ska ha ett belägg med källa.

## FAS 4: MOTARGUMENT

För varje kandidat i toppen, kör minst två skeptiker med olika lins som ska motbevisa,
inte bekräfta: en på publik och räckvidd, en på varumärke och genomförbarhet. De utgår
från att påståendet är fel tills det bevisats. Den fasen räddade oss från två felaktiga
siffror och ett felciterat samarbete förra gången. Skriv ut vad som inte gick att
verifiera; det är lika viktigt som det som gick.

## FAS 5: MODASH, 30 PROCENT AV BESLUTET

Kursen tittar på sju tal och säger uttryckligen att man ska strunta i resten.
Poängsätt varje tal 0 till 10 och väg ihop:

  Falska följare        vikt 20 %   10p ≤10 %   8p 11-15   5p 16-20   2p 21-30   0p >30
  Real people           vikt 15 %   10p ≥85 %   8p 75-84   5p 65-74   2p 55-64   0p <55
  Följer ≤500 konton    vikt 15 %   10p ≥70 %   8p 55-69   5p 40-54   2p 20-39   0p <20
  Snittkommentarer      vikt 20 %   10p ≥100    8p 60-99   5p 40-59   2p 20-39   0p <20
  Rätt kön              vikt 10 %   10p ≥80 %   8p 70-79   5p 60-69   2p 50-59   0p <50
  Rätt åldersgrupp      vikt 15 %   10p ≥50 %   8p 40-49   5p 30-39   2p 20-29   0p <20
  Rätt land             vikt  5 %   10p ≥85 %   8p 75-84   5p 65-74   2p 55-64   0p <55

"Rätt kön" och "rätt åldersgrupp" definieras av köpardatan i fas 0, inte av en
förutfattad mening. Är köparna jämnt fördelade mellan kvinnor och män ersätts
könskolumnen med hur väl profilens fördelning speglar köparnas.
Tre spärrar slår igenom oavsett summa: över 30 procent falska ger högst 3, under 65
procent i Sverige ger högst 4, under 20 kommentarer ger högst 5.
Paid engagement antecknas men ger inga poäng, kursen kallar den oviktig. Engagement
rate, följartillväxt och likes står inte på listan och används inte.
Modash delar bara åldern till 45-64, så 65 och uppåt syns inte. Säg det rakt ut.
Svenska profiler ligger generellt lågt på kommentarer; kursens 60 är en hög ribba här.

Jag exporterar rapporterna som PDF och laddar upp dem. Läs dem, räkna betygen och visa
delpoängen per kolumn så att jag kan kontrollera uträkningen.

## FAS 6: MAILEN

Kursens struktur, sju meningar, inte fler:
  1. Ämnesrad med något personligt hen åstadkommit, inte en pitch.
  2. Namn och bolag i en mening, sedan tyst om dig själv.
  3. Den personliga kroken eller gratulationen.
  4. Jag vill skicka produkten utan några förväntningar, eftersom vi är intresserade
     av ett betalt samarbete.
  5. Vad produkten är, i en mening, och att hen ska testa den först. Här ligger också
     det som skiljer produkten från andra.
  6. Gillar du den bokar vi ett kort samtal.
  7. Några fakta om bolaget som gör oss trovärdiga, och att vi tror hen passar.
Signatur med namn, bolag och telefonnummer.

Skriv inte hur många dagars annonsrätt vi vill ha i första mailet; villkoren tas i
samtalet. Har profilen en byrå skickas samma mail till byrån med profilens namn i
ämnesraden, plus en rad som ber om deras prislista för stories och annonsrätt.
Uppföljning efter fyra arbetsdagar, två rader, ingen ny pitch.

Skicka tio mail för att få tre till fem avtal. Kursen räknar med fem till sju nej.
Det finns ingen invändningshantering i kursen och du ska inte hitta på någon: ett nej
besvaras med en rad, utan argument och utan att fråga varför. Erbjud gärna produkten
ändå som gåva utan krav, och följ aldrig upp ett nej.

En dyrare produkt gör provet tyngre att ge bort. Räkna med det i budgeten och föreslå
hur många exemplar som ska skickas ut innan mailen går iväg.

## FAS 7: UPPLÄGGET

Bara stories, tre till fem frames, varav minst två video och en bild med erbjudandet.
Inga inlägg, inga reels, inga långa avtal. Kursen är tydlig: inlägg och reels kostar
mer och säljer sämre.
Annonsrätt alltid, det är där merparten av pengarna finns. Kursen rekommenderar två
veckor i taget med förlängning när det fungerar. Vill jag ha trettio dagar direkt, säg
vad det kostar i förhandlingsläge.
Sätt slutdatumet för rättigheterna i kalendern och i annonskontot samma dag avtalet
skrivs. Missade slutdatum ger straffavgifter och förstör relationen.
Brief till profilen: max fem "gör" och fem "gör inte", plus be hen om tre egna idéer.
För en nyttoprodukt ska minst en frame visa monteringen i verkligheten, på hens egen
utrustning, inte en produktbild.
Varje story-frame märks som reklam enligt branschreglerna.
Launch: tre profiler samma vecka med en till två dagars mellanrum, och samma dag ska
fem till tio hook-varianter plus minst tre andra format ligga redo i annonskontot.

## FAS 8: TVÅVECKORSOBSERVATIONEN, 70 PROCENT AV BESLUTET

Innan något skrivs på: titta på hens stories varje dag i fjorton dagar. Pratar hen in
i kameran om sitt eget liv, utan filter och utan manus? Vardag, familj, motgångar,
humor, eller bara reklam och snygga bilder? Svarar hen följarna? Hur många reklamer
per vecka? Ett betyg 1 till 5 per dag. Snitt 3,5 eller högre och minst tio dagar med
stories: boka. Under 3, eller fyra dagar utan något: reserv.
Räkna kommentarerna en gång: snittet över de fem senaste inläggen, kursens gräns är 60.
Be varje profil som säger ja om skärmdumpar av sina egna Instagram-insikter: ålder,
kön, land och story-visningar senaste 30 dagarna. Det är bättre data än Modash och
gratis. Vägrar hen visa dem är det ett svar i sig.

## LEVERANS

Skriv allt till repot och committa och pusha:
- en rapport med köpardata, break-even, prisbenchmark, topp 10 med kontaktvägar,
  färdiga mail per person, kalender, juridik och en utfallslogg som fylls på
- scorecards och bruttolista som JSON under docs/source/
- en rad i utfallsloggen för varje svar som kommer in, med vad det lär oss

Rör inte pipeline/, video/ eller dashboard/ för det här arbetet, de tillhör andra
flöden. Avsluta med en checklista som bockar av varje fas, och skriv rakt ut vad som
inte gick att verifiera. En task är inte klar för att den är levererad.
```

---

## Vad som gick fel första gången, i korthet

| Misstag | Följd | Regeln som kom ur det |
|---|---|---|
| Produkttolerans vägde för lite | Två nej av de tre bästa namnen | Egen faktor, minst 20 %, spärr under 6 |
| Mailet skickades med hemlig kopia till flera | Såg ut som massutskick | Ett mail per person |
| Mailets personliga inledning ströks | Tappade kursens starkaste del | Strukturen ändras inte utan att kursen konsulteras |
| Byråstatus antogs ur en rosterlista | Profilen hade lämnat byrån | Fråga profilen direkt |
| Story-räckvidd togs ur ett mediekit från december | Modash visade hälften | Datum på varje siffra |
| Ingen läste köpardatan först | Nära att jaga fel åldersgrupp | Fas 0 före allt annat |
