# UGC-kreatörer — castingsystem för Bäverbutiken

Det här är **inte** en kontaktlista. Vi har inga kreatörer värvade ännu. Det här är
systemet som gör att listan går att fylla i: vilka roller vi behöver, var man hittar
dem, vad de kostar, vad avtalet måste innehålla, vad de får för brief, och hur vi
avgör om de får ett andra uppdrag.

Registret (punkt 7) är enda stället där riktiga namn ska stå. Allt annat i dokumentet
är arketyper och regler.

**Relaterat:** `docs/naming-convention.md` · `docs/ad-tracker.md` · `docs/playbook.md` ·
`docs/winning-lines.md` (hook-banken)

---

## 0. Blockerare — fixa i namnkonventionen INNAN första kreatören bokas

Regel 4 i `naming-convention.md`: *"Om ett fält inte passar in i vokabulären: lägg till
det i listan här först, kör sen."* Följande saknas idag och gör UGC-data omöjlig att
skära. Ingen inspelning ska bokas innan det här är infört.

| # | Vad | Föreslaget värde | Varför |
|---|-----|------------------|--------|
| 1 | BRAND-koder för Bäverbutiken | `bever-se`, `bever-no`, `bever-fi`, `bever-uk`, `bever-dk` | Finns ingen brandkod alls idag. Fem kloner = identiska ad-namn utan detta |
| 2 | FORMAT för video | `ugcvideo`, `talkinghead`, `demo`, `voiceover`, `unboxing`, `beforeafter-video`, `splitscreen`, `slideshow` | `ugc` betyder redan **mobilfoto/static** i vokabulären. Utan nya koder går photo-UGC och video-UGC inte att skilja åt |
| 3 | HOOK-typprefix | `{hooktyp}-{slug}`, hooktyper: `pov`, `claim`, `q`, `demo`, `problem`, `callout`, `neg`, `story` | Video-hook = replik + öppningsbild på 3 sek, inte "det ögat fastnar på" i en bild |
| 4 | Kreatörs-ID som **sjunde fält, sist** | `_c{NN}` — ex. `_c07` | Utan detta går det inte att svara "vilken kreatör har lägst CPA". Gamla namn saknar index 6 → parsern faller tillbaka på null utan att brytas |
| 5 | ANGLE `trust` | riskreversering, garanti, "du får exakt vad du ser" | Playbookens högsta ROAS i skala (2,47) har ingen kod och tvingas in som `social`+hook |
| 6 | Status `🧊 chill` i ad-trackerns legend | lönsam, budgetlåst, ingen skalning, ingen creative-rotation | Ägarens uttryckliga önskemål har ingen status idag |

**Färdigt ad-namn efter tilläggen:**

```
bever-se_batskydd_pain_ugcvideo_pov-vinterforvaring_v1_c04
│        │        │    │        │                   │  └ kreatör (register nedan)
│        │        │    │        │                   └ klippversion av samma hook+kreatör
│        │        │    │        └ hooktyp-slug
│        │        │    └ videoformat
│        │        └ persuasionsvinkel
│        └ produktslug
└ butik/marknad
```

**Två definitioner som måste skrivas in samtidigt (regel 2 och 3 krockar med hur UGC produceras):**

- **Testrenhet:** samma manus + olika kreatör = **kreatörstest**. Samma kreatör + olika
  hook = **hooktest**. Allt annat = **konceptstest** och räknas inte som rent test.
- **`v{N}` vid video:** ny hookslug = **ny annons**. `v{N}` = ny klippversion av samma
  hook och samma kreatör (annan längd, annan CTA-platta, ny musik).

---

## 1. ROSTERN — 12 kreatörsarketyper

Kolumnen **Kod** (`K1`–`K12`) är arketypen. Kolumnen `c{NN}` i registret är **personen**.
En arketyp kan ha flera personer; en person kan täcka flera arketyper (det är hela
poängen med batch-planen).

Prioritet är satt på **BE-ROAS-headroom × TB × antal produkter per inspelningsdag** —
alltså hur mycket annonsbudget arketypens produkter tål, inte hur kul contentet blir.
Låg BE-ROAS = tål dyrare trafik = förtjänar UGC-budget först.

---

### K1 — "UPPFARTEN" · Bil & garage
- **Segment:** S1 (bil-delen), 15 produkter · median 529 kr · BE-ROAS 1,23–2,41
- **Look:** man 32–55. Arbetsbyxor eller slitna jeans, inte ny hoodie. Skitiga naglar.
  Talar långsamt, inte influencer-tempo.
- **Trovärdighetsmarkör:** händerna och bakgrunden. Verkstadsbänk med verkliga verktyg,
  bil som är 8+ år gammal. **Ingen ringlampa.**
- **Miljö/rekvisita:** garage, carport eller grusuppfart med eluttag. Egen bil (helst inte
  ny). Verktygslåda. Kvällsljus + arbetslampa slår dagsljus för alla LED-produkter.
- **Ett svep (1 dag, 4–6 h):** 7-i-1 Jumpstart 5000A · Inspektionskamera-endoskop ·
  Trådlös Bildammsugare · Trådlös Däckpump 150 PSI · LED Ljuslist Offroad-kit ·
  Arbetsljusramp 120W · Förlängningsnyckel 2-i-1 · Manuell Vätskepump ·
  3D Snickarvinkel · Bälteslipmaskin Mini · Stänkskärm MTB · Nano Coating Vax (b-roll) ·
  Borrbitshållare (b-roll/upsell)
- **Prioritet: 1.** Lägst BE-ROAS i katalogen bor här. Enda lätt-castade arketypen med
  den ekonomin.
- **Not:** LED Garagebelysning 14-pack (3349 kr, högst AOV) filmas **inte** här —
  installationen tar en dag. Egen timelapse-produktionsdag, se K12.

### K2 — "YRKESFÖRAREN" · Lastbil, släp & traktor
- **Segment:** tunga femtedelen av S1, 5 produkter · BE-ROAS 1,23–1,61 (katalogens mest
  skalbara)
- **Look:** yrkesförare eller lantbrukare 30–60. Varselkläder som är använda, inte nya.
- **Trovärdighetsmarkör:** att 12/24V-inkopplingen syns göras rätt i bild, och att
  fordonet uppenbart är hans jobb.
- **Miljö/rekvisita:** lastbil, släp eller traktor. Ficklampsmörker/kvällsljus för
  ljusprodukterna. Lastutrymme eller flak för nät och spännrem.
- **Ett svep:** Varningsljusramp 38" (2299) · LED Arbetslampor 90W (1799 / BE-ROAS **1,23**) ·
  Sidomarkeringsljus 20-pack · Lastnät · Självupprullande Spännrem
- **Prioritet: 1 — casta först.** Detta är den dyraste flaskhalsen och den blockerar
  exakt de produkter som tål mest budget. Att inte lösa K2 är den enskilt största
  kostnaden i hela planen.
- **Not:** samma person kan ofta vara K8 (lantbrukare med traktor + hage). Fråga alltid.

### K3 — "HOJEN" · MC & ATV
- **Segment:** S2, 9 produkter · median 369 kr · BE-ROAS 1,39–2,30
- **Look:** man 25–45. Skinnjacka eller textilställ, kortsnaggad eller skägg.
- **Trovärdighetsmarkör:** att han rör hojen rätt — sätter sig, drar av kapellet, låser
  styret utan att fumla. En MC-ovan kreatör syns på 2 sekunder.
- **Miljö/rekvisita:** uppfart, garage, parkeringsficka. **Egen motorcykel + hjälm.**
  ATV om möjligt (annars filmas sadelväskorna på MC:n och säljs som "MC/ATV").
- **Ett svep:** Styrlås & Hjälmlås Combo · MC LED-Strålkastare · Bensindunk 3L Låsbar ·
  Sadelväskor Fyrhjuling · MC-Kapell · Hjälmhållare Väggfäste · MC Sätesöverdrag Camo ·
  MC LED Blinkers 4-pack
- **Separat höstpass:** MC Handvärmare — måste filmas i kyla med synlig andedräkt,
  annars faller hela argumentet.
- **Prioritet: 2.** Säsong april–oktober. Kan inte filma sig själv under körning utan en
  andra person — budgetera för det eller skippa körklipp.

### K4 — "BÅTÄGAREN" · Båt & marint
- **Segment:** S3, 7 produkter · median 359 kr · BE-ROAS 1,41–2,90
- **Look:** man 38–60. Solbränd underarm, keps, fleece. Ingen styling.
- **Trovärdighetsmarkör:** att båten är hans. Han vet var spolklämman sitter och han
  skäller på tillverkaren av det gamla kapellet utan att bli tillsagd.
- **Miljö/rekvisita:** brygga, båtramp, uppställningsplats. **Egen båt + utombordare +
  trailer** — utan alla tre går bara 3 av 7 produkter att spela in.
- **Ett svep:** Båtskydd 420D (1049 / 1,41) · Båttrailer Vinschrem · Båtmotorskydd 420D ·
  Spolklämma för Båtmotor (kräver att motorn faktiskt körs på land) · Motorhölje
  Utombordare · Fiskespöhållare för Båt · Marin Polish (before/after-b-roll, gratis) ·
  Vattenskor + Strandtofflor (fyllnad ur S8) · Marin Motorhölje 420D (**endast** gratis
  b-roll — BE-ROAS 2,90, ska aldrig få dedikerad UGC)
- **Timing:** motorhöljen och kapell filmas vid säsongsavslut sept–okt. "Vinterförvaring"
  är den starkaste vinkeln i hela segmentet.
- **Prioritet: 2.** Svårast att casta i hela katalogen (tre rekvisita samtidigt + person
  som är bekväm på kamera). Segmentet blir **aldrig** lönsamt styckvis — heldag eller
  ingenting.

### K5 — "FISKAREN" · Vuxenfiske
- **Segment:** S4 (utrustningsdelen), 4 produkter · median 284 kr · BE-ROAS 1,73–2,20
- **Look:** man 25–45, "vanlig kille vid vattnet". Ingen proffsprofil, ingen sponsorkeps.
- **Trovärdighetsmarkör:** att han knyter, spolar och lägger tillbaka utan att tveka.
- **Miljö/rekvisita:** brygga, å-kant eller båt. Spö, rulle, tacklelåda.
- **Ett svep:** Fiskeset med Förvaringslåda · Mini Fiskespö Set (vuxenvinkel: packbart) ·
  Fiskespöhållare 4-pack · Linupprullare Aluminium
- **Prioritet: 3.** Lågt pris + hög BE-ROAS → **låg UGC-budget, maximera antal produkter
  per dag**. Bokas helst som halvdag ovanpå K4.

### K6 — "FAMILJEN" · Förälder + barn / kompisgäng
- **Segment:** S9 (icke-golf, 7 produkter) + present-/aktivitetsdelen av S4
- **Look:** **inte en talande person.** Skratt och reaktion är produkten. Förälder 30–45
  + barn 6–12, eller 3+ kompisar.
- **Trovärdighetsmarkör:** oregisserad reaktion. Ett barn som faktiskt drar upp något ur
  vattnet slår varje manus.
- **Miljö/rekvisita:** uteplats, gräsmatta, köksbord, strand. Magnetfiske kräver
  **kanal/brygga med skräpigt vatten** — hela produkten är fyndögonblicket.
  Minst 3 personer för spel-produkterna.
- **Ett svep:** Magnetfiskesats 320lb · Mini Fiskespö Set (presentvinkel) ·
  Radiostyrd Bil 1:16 · Bordtennisnät Infällbart · Bordtennistränare · Uppblåsbar
  Luftsoffa · Strandmatta med Nackstöd · Bollpannband · Klistermärken för Soptunnan
  (`meme`, ingen person i bild)
- **Rättighetsvarning:** barn i bild kräver **skriftligt samtycke från båda
  vårdnadshavarna** och egen rad i avtalet. Se punkt 4.
- **Prioritet: 3.** Billigt, roligt, men låg TB och hög BE-ROAS. Volym per dag är hela
  värdet.

### K7 — "TOMTEN" · Villaträdgård & gräs
- **Segment:** S5, 15 produkter · median 379 kr · BE-ROAS 1,42–2,60
- **Look:** man **45–60** (viktigt — trimmerselarna säljs på ryggont, inte på estetik).
  Alternativ profil: kvinna 35–50 för bevattning och solsegel.
- **Trovärdighetsmarkör:** kroppen. "Jag klipper 1400 kvm" plus att man ser honom bära
  selen med maskinens faktiska vikt i.
- **Miljö/rekvisita:** egen tomt med gräs, häck, utekran, förrådsvägg.
  **Obligatoriskt:** grästrimmer/röjsåg (4 produkter), gräsklippare eller åkgräsklippare
  (3 produkter), trädgårdsslang, utekran, en vägg att montera på.
  **IBC-tank** krävs för 2 produkter — den vanligaste bristvaran i segmentet, fråga
  explicit i castingformuläret.
- **Ett svep (2 dagar):** Sätesöverdrag Åkgräsklippare · Axelbälte Trimmer · Trimmerlina
  100 m · Dubbel Axelrem Trimmer & Röjsåg · Trimmersele · Väggfäste Grästrimmer ·
  Rengöringsborste Gräsklippare · Gräsklippartäcke 600D · Triangulärt Solsegel ·
  Slang- & Sladdhållare 5-pack · 4-Vägs Krananslutning · Hopfällbar Vattenbehållare 8L ·
  Kranskydd Frost (**höstpass**) · IBC Kranadapter Kit + IBC 4-vägs Fördelaradapter
  (kräver tank)
- **Prioritet: 1.** Näst största segmentet, hyfsad headroom, och lätt att casta —
  villaägare med trimmer finns överallt.

### K8 — "GÅRDEN" · Hage, ved & skog
- **Segment:** S6, 7 produkter · BE-ROAS 1,51–2,20 · innehåller Manuell Vedklyv (1489 kr,
  högst TB i segmentet och katalogens mest visuella produkt)
- **Look:** man eller kvinna 35–65. Overall eller arbetsjacka, arbetshandskar.
- **Trovärdighetsmarkör:** djuren och stängslet i bakgrunden. **Det här segmentet kan
  inte fejkas** — publiken är lantbrukare och hästägare och de ser direkt om tråden
  spänns fel.
- **Miljö/rekvisita:** hage, vedbacke, skogskant, ladugårdsvägg. Elstängsel/trådstängsel
  + grind, vedtrave + kubbar, motorsåg med kedja. Vedklyven kräver dessutom **stolpe
  eller vägg att montera på** och att kreatören faktiskt orkar klyva i bild.
- **Ett svep:** Manuell Vedklyv Väggmonterad · Stängselsträckare · Stängseltrådsspännare
  30-pack · Momentlås för Stängsel · Hopfällbar Såg · Handdriven Kedjeslip ·
  Automatisk Fågeldrickare 5-pack (endast b-roll, aldrig egen annons)
- **Prioritet: 1.** Inte för segmentets egen ekonomi — utan för att **samma person ofta
  löser K2**. Hittar du en lantbrukare med traktor, hage och kamerakomfort har du löst
  katalogens dyraste flaskhals och ett helt segment på en gång.
- **Regel:** betala den personen **över marknadspris** och behåll relationen. Det är den
  enskilda relation som är svårast att ersätta.

### K9 — "SKOGEN" · Camping & vandring
- **Segment:** S7, 11 produkter · median 529 kr · BE-ROAS 1,43–2,00 (näst bäst headroom
  efter S1)
- **Look:** par 25–40 eller ensam man 30–45. Otvättat hår, riktig friluftsjacka som har
  varit ute.
- **Trovärdighetsmarkör:** **att de ser kalla ut.** Sol och blå himmel säljer sämre än
  gråväder och regn i Norden. Nödregnjacka och Uteduschen kräver faktiskt väder — boka
  med flyttbart datum.
- **Miljö/rekvisita:** skog, fjällstig, sjö, tältplats. Tält, kokutrustning, bil att
  packa ur. **Övernattning krävs** för liggunderlag, hängmatta och campinglampa
  (nattklipp). Kängorna filmas i lera och rotstig, aldrig på asfalt.
- **Ett svep (1 övernattning = 2 halvdagar):** Lättviktsryggsäck · Uppblåsbar
  Liggunderlag TPU · Vandringskängor "Grepp & Stöd" · Vandringskängor "Tjock Sula" ·
  Uteduschen · LED Campinglampa Solcell · Vandringsryggsäck 1000D · 14-i-1
  Multiverktygshammare · Ultralätt Hängmatta · Första Hjälpen-Kit 260 delar ·
  Nödregnjacka · Bröstväska Herr + Cykelshorts Herr (fyllnad ur S8)
- **Prioritet: 1.** Bra headroom, hög produkttäthet per dag, och lätt att casta — det
  finns fler friluftskreatörer i Norden än något annat i den här listan.

### K10 — "GOLFAREN"
- **Segment:** golf-delen av S9, 5 produkter · BE-ROAS ~2,00
- **Look:** golfare 35–60 med egen bag. Får gärna vara medioker golfare — det är poängen
  med träningsprodukter.
- **Miljö/rekvisita:** golfklubbor, skor, bollar. **Filma i trädgården, inte på bana.**
  Nordiska klubbar kräver tillstånd för filmning, och golfnätet står ju ändå i
  trädgården — det är hela produktlöftet. Acceptera att det ser hemmagjort ut; det är UGC.
- **Ett svep (halvdag):** Golfnät 305x305 (909) · Golfskoväska · Golfbollsplockare ·
  Golfklubbsborste · (Bordtennisnät om samma trädgård)
- **Prioritet: 3.** Halvdag ovanpå K7 om villaägaren råkar golfa — fråga i formuläret.

### K11 — "HALLEN" · Skor, fötter & herrplagg
- **Segment:** S8 (inomhusdelen), 10 produkter · median 354 kr · BE-ROAS 1,40–2,40
- **Look:** man 28–45, **normalbyggd — inte modell.** Fotstorlek 43–45.
- **Trovärdighetsmarkör:** vardaglig kropp och vardagligt golv. Prisnivån 309–699 kr
  tål inte att bilden ser dyr ut. Ansikte behövs inte i halva klippen.
- **Miljö/rekvisita:** hall, vardagsrum, trapphus, gräsmatta utanför dörren. I princip
  ingen rekvisita alls.
- **Ett svep (halvdag):** Cargoshorts 3-pack · Sneakers Herr · Herrshorts 3-pack ·
  Plyschtofflor Herr (**höstpass**) · Skotvättpåse · Strandtofflor Herr · Fritidsskor
  Herr · Tofflor Ergonomiska · Sushi-Strumpor (`product`+`textheavy`, presentvinkel Q4)
- **Prioritet: 2.** Billigast segmentet att producera. Detta är fyllnaden du filar in i
  varje annan inspelningsdag där kreatören råkar ha rätt fotstorlek.

### K12 — "BORDET" · Tabletop-operatör (ingen kreatör)
- **Segment:** S10 (8 produkter) + hela "ingen UGC"-listan i punkt 4 nedan
- **Look:** ingen. Stativ ovanifrån, händer i bild, inget ansikte, ingen röst.
- **Vem:** ägaren själv eller en inhyrd redigerare med kamera. Detta är en **studiodag
  hemma**, inte ett kreatörsuppdrag.
- **Ett svep (halvdag räcker för alla åtta):** Stöttåligt iPhone-Fodral (drop-test-b-roll,
  hand-only, BE-ROAS 1,49 — värt statisk volym) · Surfplatteställ · Dörrbottenlist
  (papperslapp/rök i springan) · Anti-Slip Mattdynor 24-pack · Mobilskal Magnetiskt
  (magnetsnäpp i slowmo) · Hattgalge · Övervakningskamera PTZ (skärminspelning av appen +
  kamerans egna nattbilder) · AI Smarta Glasögon (POV + `comparison`, testa smalt)
- **Egen produktionsdag:** LED Garagebelysning 14-pack — timelapse i ägarens garage,
  mörkt→ljust, `beforeafter-video`. Högst AOV i katalogen, värd dagen.
- **Prioritet: 2.** Kostar nästan ingenting och kan göras när som helst — men den kan
  aldrig ersätta K1/K2/K7/K9. Gör den när vädret ändå förstör en utomhusdag.

---

### Prioritetssammanfattning — castingordning

| Ordning | Arketyper | Motiv |
|---|---|---|
| **Först** | **K2** (yrkesförare/traktor) | Dyraste flaskhalsen, blockerar BE-ROAS 1,23–1,61-produkterna |
| **Först** | **K8** (gården) | Löser ofta K2 samtidigt. Betala över marknadspris |
| **1** | K1, K7, K9 | Stora segment, bra headroom, castbara |
| **2** | K3, K4, K11, K12 | Säsongs- eller rekvisitastyrda; K11/K12 är billig fyllnad |
| **3** | K5, K6, K10 | Låg TB + hög BE-ROAS. Bokas som halvdagar ovanpå prio 1–2 |

### Batchning — samma person täcker flera arketyper

| Batch-roll | Arketyper | Produkter | Måste äga |
|---|---|---|---|
| A – "Uppfarten" | K1 + K3 | 29 | Bil + MC + garage/uppfart |
| B – "Sjön" | K4 + K5 | 15 | Båt + utombordare + trailer + spön |
| C – "Villan" | K7 + K10 + K6 | 27 | Villatomt + gräsklippare + trimmer + utekran + uteplats |
| D – "Skogen" | K9 | 14 | Tält + bil + tillgång till skog/fjäll |
| E – "Gården" | K2 + K8 | 12 | Hage + djur + vedbacke + motorsåg + traktor/släp |
| F – "Inne" | K11 + K12 | 15 | Ingenting — hall, vardagsrum, köksbord |

**Två inspelningsfönster per år, inte löpande.**
- **Maj-batch:** K4, K5, K6, K7, K9, K10, sommardelen av K11.
- **November-batch:** MC Handvärmare (K3), Kranskydd Frost (K7), Plyschtofflor (K11),
  vinterförvaring av båt/MC/gräsklippare (kapell och överdrag säljs på "innan snön
  kommer"), K2/K1 nattljus, K8 ved.
- Filma vinterprodukter i maj och de ser fejkade ut.

---

## 2. SOURCING — var man faktiskt hittar dem i Norden

> **Osäkerhet, läs först:** plattformar, gruppnamn och communities ändras. Allt namngivet
> nedan ska **verifieras innan det förlitas på** — särskilt att en plattform tar emot
> svenska/nordiska varumärken och att en grupp tillåter uppdragsannonser. Inga priser,
> volymer eller kontaktvägar nedan är bekräftade av mig.

### 2.1 Rangordnad efter träffsäkerhet för *vår* katalog

**Nivå 1 — egna kunder (billigast, högst trovärdighet, mest underskattat)**
Personen som redan köpt Båtskyddet **äger båten**. Det är hela castingproblemet löst.
- Post-purchase-mail 14 dagar efter leverans: "Filma 30 sek med produkten → du får
  [X] kr eller nästa produkt gratis."
- Filtrera Shopify-orderdata per produkt och maila bara köpare av rekvisitatunga
  produkter (båt, trimmer, MC, lastbil).
- Recensioner med bild = förkvalificerade kreatörer. Kontakta dem direkt.
- **Begränsning:** de är inte vana vid kamera. Räkna med råmaterial, inte färdig video,
  och ta kostnaden för redigering internt.

**Nivå 2 — rekvisita-communities (där ägarna av grejerna faktiskt är)**
Sök på **prylen**, inte på "UGC". Konkreta ingångar per arketyp:

| Arketyp | Var man letar | Sökväg / fråga |
|---|---|---|
| K1 bil | Facebook-grupper för bilvård och märkesklubbar; svenska bilcommunities (t.ex. Garaget — *verifiera aktivitet*); Blocket Motor-säljare med garagebilder | "Söker person med garage + eluttag för betald filmning, 1 dag" |
| K2 lastbil/traktor | Åkeri- och lastbilsgrupper på Facebook; branschmedier och deras annonsdelar (t.ex. ATL / Land Lantbruk för lantbruk, åkeriförbundets kanaler — *verifiera*); truck meets och lastbilsträffar under sommaren | Fråga efter **fordonet först**, kamera sen. Erbjud premium |
| K3 MC | MC-klubbar och märkesforum; SMC (Sveriges MotorCyklister) lokalavdelningar; MC-mässor och säsongspremiär-träffar i april | "Betald filmning, du behöver hoj + hjälm + 3 timmar" |
| K4 båt | **Båtklubbar direkt** — ring/maila klubbstyrelsen, inte via UGC-plattform. Båtunionens anslutna klubbar, Kryssarklubbens kretsar (*verifiera kontaktvägar*). Marinor och båtramper i sept–okt när alla tar upp båten | Anslå på klubbhusets tavla: "Betalt uppdrag, en dag, 7 produkter" |
| K5 fiske | Sportfiskeforum och lokala fiskegrupper; fiskeklubbar; hashtag-sök på svenska fiskeord | Erbjud produkt + arvode |
| K6 familj | Föräldragrupper lokalt; "aktiviteter med barn"-konton på IG/TikTok med små följarsiffror (mikro/nano) | Små konton är billigare **och** ser mer äkta ut |
| K7 trädgård | Trädgårds- och villagrupper på Facebook; odlingsforum (t.ex. Odla.nu — *verifiera*); Villaägarnas lokalföreningar; hashtags kring trädgårdsarbete | Fråga: "äger du trimmer/åkgräsklippare/IBC-tank?" |
| K8 gård | LRF:s lokalavdelningar, hästgårdar och ridklubbar, gårdsbutiker, självplock; lantbruksmässor | Räkna med skepsis mot dropship — var rak med vad det är |
| K9 friluft | Friluftsforum (t.ex. Utsidan — *verifiera*), STF-lokalkretsar, vandrings- och fjällgrupper, hashtags för friluftsliv/vandring i SE/NO/FI | Störst pool i hela listan — här kan man vara kräsen |
| K10 golf | Golfklubbars medlemsgrupper. **Filma hemma, inte på klubben** — slipp tillståndsfrågan | — |
| K11/K12 | Behövs ingen community. Vem som helst med hall och telefon | — |

**Nivå 3 — UGC-plattformar och marknadsplatser (snabbast, sämst rekvisitaträff)**
- **TikTok Creator Marketplace** och **Meta/Instagram Creator Marketplace + Collabs** —
  den senare är också vägen till partnership ads/whitelisting, se punkt 4. *Verifiera
  vad kontot har tillgång till i Business Suite.*
- Nordiska UGC-marknadsplatser finns (t.ex. Twirl i Danmark) — **verifiera att de är
  aktiva, vad de tar i avgift och om de täcker SE/NO/FI/UK** innan de används.
- Fiverr/Upwork: går att använda för K11/K12 och för **redigering**, men nordisk look
  och nordisk miljö går sällan att beställa där. Använd inte för K2/K4/K8.
- Influencerbyråer (svenska nätverk finns) — dyrast per klipp, snabbast leverans, sämst
  för rekvisitatunga arketyper. Sista utvägen.

**Nivå 4 — rekrytera som ett jobb (bäst för K2, K4, K8)**
De svåra arketyperna finns inte på UGC-plattformar. Behandla dem som en anställning:
- Annons på Blocket/Facebook Marketplace i rätt geografi: *"Betalt filmuppdrag, 1 dag.
  Du behöver traktor eller lastbil. Ingen kameravana krävs — vi regisserar."*
- Lokala Facebook-köp-och-sälj-grupper på landsbygden.
- Betala för **en heldag**, inte per video. Det är enda sättet dessa segment blir
  lönsamma.

### 2.2 Castingformulär — frågorna som faktiskt avgör

**Casta på rekvisita, inte på nisch.** Rätt fråga är inte "gillar du outdoor?" utan
"äger du båt?". Använd ett Google Forms/Tally-formulär med exakt dessa fält:

```
1.  Namn, ort, land (SE/NO/FI/DK/UK)
2.  Ålder
3.  Länk till konto eller tidigare video (valfritt — vi tar även folk utan konto)

REKVISITA — kryssa i allt du ÄGER SJÄLV och har tillgång till inom 2 veckor:
[ ] Bil (årsmodell: ____)      [ ] Garage/carport med eluttag
[ ] Lastbil / skåpbil          [ ] Släp        [ ] Traktor
[ ] Motorcykel + hjälm         [ ] Fyrhjuling/ATV
[ ] Båt (typ: ____)            [ ] Utombordare  [ ] Båttrailer
[ ] Fiskeutrustning            [ ] Brygga eller strandtillgång
[ ] Villatomt med gräsmatta    [ ] Gräsklippare  [ ] Åkgräsklippare
[ ] Grästrimmer / röjsåg       [ ] Utekran + slang   [ ] IBC-tank
[ ] Hage / stängsel + djur     [ ] Vedbacke      [ ] Motorsåg
[ ] Tält + campingutrustning   [ ] Tillgång till skog/fjäll
[ ] Golfbag + bollar           [ ] Barn i hushållet (ålder: ____)
[ ] Fotstorlek 43–45

4.  Kan du filma i regn/kyla/mörker om vi ber om det?      Ja / Nej
5.  Har du någon som kan hålla kameran?                    Ja / Nej
6.  Telefon (modell) — filmar du i 4K?
7.  Har du F-skatt eller kan du fakturera?                 Ja / Nej / Vet ej
8.  Accepterar du att materialet används i betald annonsering i SE/NO/FI/DK/UK
    i minst 12 månader?                                    Ja / Nej
9.  Vad vill du ha betalt för en halvdags filmning (3–5 produkter)?
10. Får vi filma barn i bild? (kräver båda vårdnadshavares skriftliga samtycke)
```

Fråga 8 och 10 sorterar bort de dyra missförstånden innan de kostar pengar.
Fråga 9 ger dig marknadsprisdata gratis — logga svaren i registret.

---

## 3. ERSÄTTNING

> **Det här är riktmärken för svensk marknad, inte offerter.** Vi har inga faktiska
> förhandlade priser ännu. Första omgången ska användas till att samla in verkliga
> siffror via castingformulärets fråga 9 — skriv in dem i registret och ersätt tabellen
> nedan med egen data när det finns 10+ svar. Nivåer varierar kraftigt med ort, säsong,
> följarantal och hur ovanlig rekvisitan är.

### 3.1 Prisnivåer per leveransform (riktmärken, SEK, exkl. moms)

| Leverans | Riktmärke | Vad du får | När det lönar sig |
|---|---|---|---|
| **Råklipp, oredigerat** — 3–5 tagningar på en produkt | 500–1 200 kr | Filer, du klipper själv | Nästan alltid vårt förstahandsval. Vi kontrollerar hooken i klippningen istället för att beställa den |
| **Redigerad video 15–30 s**, 1 hook | 1 200–2 500 kr | Klar fil, textad | När kreatören är bevisad (≥2 uppdrag) och redigerar bra |
| **Redigerad video + 3 hookvarianter** ur samma råmaterial | 1 800–3 500 kr | 3 annonser, ett skjut | Bästa kronan per annons när kreatören redan levererat en vinnare |
| **Halvdag på plats** (3–5 produkter, 8–10 råklipp) | 1 800–3 500 kr | Råmaterial i bulk | Standard för K1, K7, K11 |
| **Heldag på plats** (5–8 produkter, 10–14 råklipp) | 3 000–6 000 kr + resa | Råmaterial i bulk | **Enda modellen som fungerar för K4 och K8** |
| **Rekvisitapremie** för K2/K4/K8 (lastbil, traktor, båt+trailer) | +50–100 % ovanpå | Tillgång till det som inte går att hyra | Alltid. Personen är oersättlig, inte klippet |
| **Återkommande/retainer**, t.ex. 4 videor/mån | 6 000–12 000 kr/mån | Förutsägbar volym, kort ledtid | Först efter 3 uppdrag med bevisad prestanda |
| **Whitelisting / partnership ad** (vi kör annonsen från hens handle) | +30–100 % eller 500–2 000 kr/mån | Annonsen ser ut att komma från en person | Testa på en vinnare först — betala aldrig för det i förväg |
| **Förlängd nyttjanderätt** utöver 12 mån | +25–50 % av grundarvodet | Fortsatt körning | Köp hellre "perpetual" direkt om priset är rimligt |
| **Redigering internt/inköpt** (per färdig video ur råmaterial) | 300–800 kr | — | Nästan alltid billigare än att kreatören redigerar |

### 3.2 Gratis produkt vs betalning — räkna, gissa inte

**Kostnaden för en gratis produkt är inköpspriset, inte utpriset.** Läs det ur
vinstappen (PNL), aldrig ur butiken.

**Break-even i ordrar:** `videokostnad ÷ TB per order`
Vid median-TB **189 kr/order**:

| Videokostnad | Ordrar bara för att betala klippet |
|---|---|
| 500 kr (råklipp) | ~3 |
| 1 500 kr (redigerad) | ~8 |
| 2 500 kr | ~14 |
| 4 500 kr (heldag ÷ 5 produkter ≈ 900 kr/produkt) | ~5 per produkt |

Det är **innan en enda annonskrona**. En produkt på 179 kr har ~97 kr TB → 16–17 ordrar
bara för videon.

**Gratis produkt fungerar när:**
- produktens **utpris ≥ ~600 kr** (upplevt värde räcker som ersättning),
- kreatören är en **äkta användare** som ändå ville ha den,
- vi ber om **råklipp**, inte färdig produktion,
- inga omtag krävs.

**Gratis produkt fungerar inte när:**
- produkten kostar under ~400 kr — då är ersättningen för liten för att någon ska bry
  sig, och kvaliteten blir därefter,
- vi behöver rekvisita personen redan äger (K2/K4/K8) — de vill inte ha vår
  jumpstarter, de vill ha betalt för sin dag,
- vi vill ha nyttjanderätt i 5 länder i 12 månader. Rättigheter köps med pengar.

**Hybridmodellen är default:** produkten gratis **+** ett kontantarvode i nedre delen av
spannet. Behåll produkten som "din att behålla" i briefen — det sänker det upplevda
priset utan att sänka kvaliteten.

**Skatt:** produkt som ersättning är skattepliktig ersättning, och betalning till
privatperson utan F-skatt är inte ett fakturaförhållande. **Stäm av modellen med
bokföring/redovisningskonsult innan första utbetalningen** — jag kan inte avgöra det
åt dig.

### 3.3 Var kostnaden bokförs

UGC-arvoden finns idag **ingenstans** i annonssystemet — trackern har ingen
kostnadskolumn. Det gör att en produkt kan se lönsam ut trots att kreativet kostade
2 500 kr.

- Logga arvodet som **fast kostnad i PNL-appen** (den har stöd för fasta kostnader),
  fördelad på de produkter dagen täckte.
- Logga dessutom kostnaden i registret (punkt 7) per uppdrag, så kreatörens
  kostnad-per-vinnare går att räkna.
- Regel: **produktionskostnaden fördelas per produkt = dagsarvode ÷ antal produkter
  filmade den dagen.** Det är siffran som avgör om ett svep var värt det.

---

## 4. AVTAL & RÄTTIGHETER

Kort avtal, alltid skriftligt (mail med "jag godkänner" räcker som utgångspunkt, men
använd hellre ett standarddokument). **Detta är en checklista över vad som måste regleras
— inte juridisk rådgivning. Låt någon med avtalskompetens granska mallen en gång, sen
återanvänds den.**

**Måste stå i avtalet:**

1. **Nyttjanderätt — explicit "betald annonsering".** Rätt att använda materialet i
   **paid media**, inte bara organiskt. Skriv ut: Meta (Facebook/Instagram), samt
   TikTok/YouTube/Google om det kan bli aktuellt, plus egna kanaler, webbplats och
   e-post.
2. **Geografi:** **SE, NO, FI, DK, UK** — namnge alla fem. Vi driver fem butiker och
   översätter samma material.
3. **Tidsbegränsning:** 12 månader som minimum, `perpetual` (evig) om priset är rimligt.
   Skriv slutdatum i registret. **Klipp som körts efter att rättigheten löpt ut är ett
   verkligt problem** — därför finns kolumnen "Rättighet t.o.m." i registret.
4. **Bearbetningsrätt:** rätt att klippa om, korta, texta, **översätta till norska,
   finska, danska och engelska**, lägga på röst, byta musik, extrahera **stillbilder**
   ur videon och använda dem som statics.
5. **Whitelisting / partnership ads:** ska regleras separat och kräver att kreatören
   aktivt ger åtkomst via Meta (partnership ad-kod / Creator Marketplace). Skriv:
   omfattning, tidsperiod, och att åtkomsten dras tillbaka när perioden löper ut.
6. **Person- och bildrätt (GDPR):** kreatören samtycker till att ansikte och röst används
   i marknadsföring. **Barn i bild kräver skriftligt samtycke från båda vårdnadshavarna**
   — separat rad, ingen genväg.
7. **Exklusivitet:** hålls **smal**. Endast konkurrerande produkt i samma kategori, 3–6
   månader. Bred exklusivitet fördubblar priset utan att ge oss något.
8. **Musik:** kreatören får **inte** använda TikTok-/Instagram-bibliotekets musik —
   den saknar licens för betald annonsering. Leverera helst utan musik, eller med
   dokumenterat licensfri musik.
9. **Claims och Meta-policy:** inga medicinska påståenden, inga garanterade resultat,
   inga "bäst i test", ingen vilseledande före/efter. Kreatören får inte påstå
   egenskaper som inte står i briefen. (Gäller särskilt AI Smarta Glasögon — claims-risk.)
10. **Leveransspecifikation:** 9:16, minst 1080×1920, originalfiler (ej komprimerade via
    chattapp), inget vattenmärke, ingen inbränd text i nedersta 20 % (CTA-zonen), ingen
    egen logga. Råmaterial sparas i 30 dagar.
11. **Omtag:** ett kostnadsfritt omtag om briefen inte följts. Definiera "inte följts".
12. **Betalning:** faktura med F-skatt, alternativt egenanställningsföretag eller
    löneutbetalning. Ingen svart betalning. Betalningsvillkor och när produkten skickas.
13. **Ägande av råmaterial:** vi får råfilerna, kreatören får publicera den färdiga
    videon organiskt på sitt eget konto om hen vill (billig goodwill, kostar oss noll).

**Skickas alltid med:** produktens faktiska funktioner, vad som **inte** får påstås,
och en påminnelse om att materialet ska se ut som en verklig användare — inte som en
reklamfilm.

---

## 5. BRIEFMALLEN

Kopiera, fyll i hakparenteserna, skicka rakt av. Fälten är medvetet döpta så att de
mappar 1:1 mot `naming-convention.md`. Om ett fält inte går att fylla i med ett värde ur
vokabulären: **stanna och lägg till värdet i vokabulären först** (regel 4).

```markdown
# UGC-brief — [PRODUKTNAMN]

## Adminrad (fyll i innan du skickar — detta blir annonsens namn)
- Butik/marknad (BRAND): bever-se
- Produktslug (PRODUCT): [batskydd]
- Vinkel (ANGLE): [pain | benefit | social | offer | curiosity | authority | fomo | identity | trust]
- Format (FORMAT): [ugcvideo | talkinghead | demo | voiceover | unboxing | beforeafter-video | splitscreen]
- Hook (HOOK): [hooktyp]-[slug]   ex. pov-vinterforvaring
- Kreatörs-ID: c[NN]
- Färdigt ad-namn: bever-se_batskydd_pain_ugcvideo_pov-vinterforvaring_v1_c04
- Break-even ROAS för produkten (ur PNL): [1,41]
- Deadline: [YYYY-MM-DD]   ·   Arvode: [X kr] + produkten är din att behålla

## Vad vi säljer
[Produkt, pris, vad den gör i EN mening.]
Vem den är för: [målgrupp i en mening]

## Vad vi INTE får påstå
- [t.ex. inga garantier om livslängd, inga "bäst i test", inga siffror vi inte kan belägga]
- Ingen musik från TikTok/Instagram-biblioteket. Leverera utan musik.

## Miljö och rekvisita (obligatoriskt — filmar du fel plats är klippet obrukbart)
- Plats: [brygga / uppställningsplats i oktober]
- Du måste ha med: [egen båt, utombordare, det gamla slitna kapellet]
- Ljus/väder: [gråväder är BÄTTRE än sol. Ingen ringlampa.]
- Klädsel: [dina vanliga arbetskläder. Inget nytt, inget stylat.]

## Filmning — tekniskt
- Vertikalt 9:16, telefonen i högsta kvalitet, ren lins
- Håll telefonen stilla eller använd stativ. Gå gärna med den — skakigt är okej, suddigt är inte
- Spela in ljud nära munnen. Vindbrus dödar klippet
- Lämna översta och nedersta 20 % tomma — där hamnar Metas knappar
- Filma ALLT i ett svep, prata inte in i kameran mellan tagningarna

## Manus — 4 block, ca 30 sekunder
### 1. HOOK (0–3 s) — [hooktyp: pov]
Säg exakt eller nära: "[HOOKREPLIK]"
Öppningsbild: [vad som syns i första rutan — hooken är bild + replik, inte bara replik]
> Vi vill ha 3 varianter av det här blocket. Se listan längst ner.

### 2. BEVIS / PROBLEM (3–10 s)
[Vad som gör påståendet trovärdigt. Visa problemet, inte bara berätta det.]
Exempel: "[REPLIK]"

### 3. DEMO / MEKANISM (10–20 s)
[Det här är blocket som säljer. Produkten i drift, händerna i bild, hela momentet.]
Måste synas: [det exakta momentet, t.ex. att kapellet dras över och spänns fast på 20 sek]

### 4. TRUST / CTA (20–30 s)
[Riskreversering + uppmaning. Inte "köp nu", utan varför det är tryggt att prova.]
Exempel: "[REPLIK]"

## De 3 hookvarianterna vi vill ha (samma resten av klippet)
1. [hooktyp: pov]      — "[replik]"
2. [hooktyp: problem]  — "[replik]"
3. [hooktyp: q]        — "[replik]"
> Filma om block 1 tre gånger med dessa. Blocken 2–4 behöver bara filmas en gång.

## Leverans
- Ladda upp originalfilerna till [länk] senast [datum]
- Döp filerna: bever-se_[produkt]_[angle]_[format]_[hook]_v1_c[NN].mp4
- Skicka RÅMATERIALET, inte en redigerad video (om inte annat avtalats)
- Ett kostnadsfritt omtag ingår om något ovan missats

## Så här ser en dålig leverans ut (undvik)
- Ringlampa och ren studiokänsla
- Att du läser innantill
- Sol och blå himmel när vi bett om gråväder
- Att produkten bara hålls upp och beskrivs — vi vill se den GÖRA något
```

**Manusets fyra block är samma struktur som `winning-lines.md`-banken**
(🎣 HOOK → 🛡️ BEVIS → ⚙️ MEKANISM → ✅ TRUST/CTA). Skriv hookreplikerna genom att
plocka en rad ur varje hylla — och notera bank-ID:t i briefen så att lärdomen kan
återkopplas.

**Varning:** de bevisade replikerna i `winning-lines.md` kommer från Grillkliniken
(999 kr, en produkt, BOF) på SnarkLös-kontot. Det är **strukturen och
angle-rankningen** som överförs till Bäverbutiken — inte lines:en. Kopiera aldrig
grill-repliker rakt in i en båtbrief.

---

## 6. KVALITETSTRÖSKEL — får kreatören ett andra uppdrag?

Tre grindar. Kreatören måste passera dem i ordning, och **klippets dom är inte samma sak
som kreatörens dom**.

### Grind 0 — leverans (bedöms samma dag, kostar 0 kr)
Underkänd om: fel miljö · fel rekvisita · vattenmärke · musik från TikTok-biblioteket ·
oanvändbart ljud · text i CTA-zonen · redigerad när vi bad om råmaterial.
→ Ett gratis omtag. Två underkända leveranser i rad = ingen mer bokning, oavsett
prestanda.

### Grind 1 — hook rate & hold rate (48–72 h, låg spend)
Video kan dömas **innan** den hunnit få köp — det är precis vad man behöver vid låga
budgetar. Metrics som saknas i playbookens benchmarktabell och **måste läggas till**:
`3s-views / impressions` (hook rate), `ThruPlay / 3s-views` (hold rate),
genomsnittlig visningstid.

- **Vi har ingen egen video-baseline för Bäverbutiken ännu.** Sätt därför tröskeln
  **relativt**, inte absolut: kreatörens klipp ska ligga **över medianen för samma
  produkt** och **över kontots rullande median hook rate**.
- Startvärden att kalibrera mot tills 10+ videor finns: hook rate ~25–30 %,
  hold rate ~15–20 %. **Behandla dem som platshållare, inte som fakta** — ersätt med
  egen median så fort den finns och skriv in den i `playbook.md`.
- Låg hook rate = hookens fel (byt block 1, samma kreatör). Hög hook rate + låg hold
  rate = demons fel (block 3). Det avgör om nästa beställning är ett **hooktest** eller
  ett **konceptstest**.

### Grind 2 — CPA mot break-even (efter tillräcklig spend)
**ROAS läses ur PNL-appen, aldrig ur Ads Manager.** Annonskontona betalar i SEK även för
NO/FI/UK/DK-butikerna medan intäkten är i NOK/EUR/GBP/DKK — en ROAS läst rakt i Meta för
en utländsk butik är inte jämförbar med BE-ROAS.

- **Break-even CPA = produktpris ÷ BE-ROAS.**
  Ex. 329 kr ÷ 1,85 = **178 kr**. (Motsvarar TB per order, medianen 189 kr.)
- **Minsta testspend innan ett klipp får dömas på köp: 3 × break-even CPA.**
  Median: 3 × 178 ≈ **535 kr**. Under det: döm bara på Grind 1.
- **ROAS-dom kräver 8–10 × break-even CPA** i spend. Under det är siffran brus.
- Nyckeltalet som ska in i ad-trackerns resultatrad är **marginalkvoten `ROAS ÷ BE-ROAS`**,
  inte ROAS. En ROAS på 1,9 är en vinnare på en produkt och en förlust på en annan.

| Marginalkvot (ROAS ÷ BE-ROAS) | Klippets verdict | Kreatörens konsekvens |
|---|---|---|
| ≥ 1,5 | 🚀 scaling | Boka heldag. Förhandla retainer. Testa whitelisting |
| 1,2–1,5 | 🟢 live / iterera | Andra uppdrag: samma kreatör, nya hooks ur samma koncept |
| 1,0–1,2 | 🧊 chill | Behåll klippet, lås budgeten. Kreatören får uppdrag först när kön är tom |
| < 1,0 efter full spend | 💀 killed | Ett klipp bevisar ingenting. Se kreatörsdomen nedan |

### Kreatörsdomen (personen, inte klippet)
- Döm **aldrig** en kreatör på ett klipp. Minst **3 klipp över minst 2 produkter**.
- Jämför alltid mot **samma produkt** — BE-ROAS 1,23–3,11 gör kontosnitt meningslöst.
- **Andra uppdrag** ges om: Grind 0 godkänd + snitt-hook-rate över kontots median +
  minst ett klipp med marginalkvot ≥ 1,2.
- **Retainer/premium** ges om: 3+ uppdrag, minst två klipp ≥ 1,2, och kreatören äger
  rekvisita vi inte kan ersätta (K2, K4, K8) — då betalas över marknadspris oavsett
  metrics, eftersom alternativet är att segmentet inte går att filma alls.
- **Kostnad per vinnare** är det slutliga kreatörsmåttet: `total ersättning ÷ antal klipp
  med marginalkvot ≥ 1,2`. Den siffran hör hemma i registret.

### Bevisnivå — playbookens 2-testers-regel behöver ett tillägg
Med 119 produkter kommer de flesta aldrig få två rena tester. Skriv in i `playbook.md`
att en insikt ska märkas med **bevisnivå: produkt / kategori / system**.
"Kreatör c07 slår kontosnittet" är en **systeminsikt** och får bevisas på tvärs över
produkter — den behöver inte två tester på samma produkt.

---

## 7. REGISTERMALL — riktiga kreatörer fylls i här

Enda stället i repot där riktiga namn, priser och kontaktvägar ska stå.
`ID` är det som hamnar i ad-namnets sjunde fält (`_c07`) och är **personen** — inte
arketypen. En person kan täcka flera arketyper.

**Status:** 🟡 kandidat · 🔵 bokad · 🟢 aktiv/bevisad · 🧊 reserv · ⏸️ pausad · 🔴 avslutad

| ID | Namn | Arketyp(er) | Land/ort | Kanal (var hittad + länk/handle) | Rekvisita verifierad | Pris: rå / redigerad / dag | Faktura (F-skatt?) | Avtal signerat | Rättighet t.o.m. | Uppdrag | Klipp levererade | Snitt hook rate | Snitt hold rate | Bästa ROAS÷BE | Kostnad/vinnare | Senaste uppdrag | Status | Not |
|----|------|-------------|----------|----------------------------------|----------------------|---------------------------|--------------------|----------------|------------------|---------|------------------|-----------------|-----------------|---------------|-----------------|-----------------|--------|-----|
| c01 | | K1 | | | | | | | | | | | | | | | 🟡 | |
| c02 | | | | | | | | | | | | | | | | | | |

**Ifyllnadsregler:**
- `Rekvisita verifierad` = du har **sett** båten/traktorn på bild eller video. Inte
  "hen sa att hen har en".
- `Rättighet t.o.m.` fylls i vid signering. **Klipp vars rättighet löpt ut ska pausas** —
  sätt en påminnelse 30 dagar innan.
- `Snitt hook rate` / `Snitt hold rate` uppdateras när ett klipp passerat Grind 1.
- `Bästa ROAS÷BE` = marginalkvoten, alltid räknad ur PNL, aldrig ur Ads Manager.
- `Kostnad/vinnare` = total ersättning ÷ antal klipp med marginalkvot ≥ 1,2.
- **Inga påhittade rader.** Tabellen börjar tom och växer med verkliga personer.

### Kompletterande logg — inspelningsdagar

| Dag | Datum | Kreatör (ID) | Batch-roll | Produkter filmade | Råklipp | Arvode + resa | Kostnad/produkt | Våg i ad-tracker |
|-----|-------|--------------|------------|-------------------|---------|---------------|-----------------|------------------|
| | | | | | | | | |

`Kostnad/produkt` = arvode ÷ antal produkter filmade. Det är siffran som avgör om en
heldag var värd det — och den som ska in som fast kostnad i PNL-appen.

---

## 8. Startordning (första 30 dagarna)

1. **Inför vokabulärtilläggen i `naming-convention.md`** och `🧊 chill` +
   BE-ROAS-kolumnerna i `ad-tracker.md`. Inget annat får hända före detta.
2. Bygg castingformuläret (punkt 2.2) och publicera det.
3. **Maila egna kunder** som köpt rekvisitatunga produkter (nivå 1-sourcing). Billigast
   och snabbast.
4. **Rekrytera K2 och K8 som ett jobb**, inte som UGC — det är flaskhalsen som blockerar
   katalogens mest skalbara produkter.
5. Kör en K12-studiodag hemma medan castingen pågår. Den kostar nästan ingenting och ger
   material att testa volymmallen på direkt.
6. Boka K9 (skogen) som första riktiga kreatörsdag — störst kandidatpool, bra headroom,
   lägst risk att bränna pengar på ett misslyckat första svep.

---

Dokumentet är skrivet till `/home/user/yognftnfgn/docs/ugc-creators.md`.