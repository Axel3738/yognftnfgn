# Facit — återkopplingen till Skalnings kungen

Axels beställning 2026-09-30: *"en feedbackloop som kollar om det var bra
eller dåligt att vi skalade och stängde av och gör vissa grejer på vissa sätt,
så att vi i framtiden lär oss vart det är okej att skala mer och vart vi kan
spara in mer pengar."*

Facit dömer varje budgetbeslut i efterhand, samlar domarna i hinkar (budget,
ROAS-läge, trappsteg, fart, marknad, produkt) och föreslår en regeländring
först när datan bär den. **Facit ändrar aldrig ett beslut, en budget, en regel
eller budgetloggen.** Förslagen är Axels beslut: `JA F1234` eller `NEJ F1234`.

Koden: `agent/facit.mjs` (ren räkning + CLI), `agent/hamta-facit.mjs`
(läs-bar hämtning ur Meta). Testerna: `agent/test/facit.test.mjs`.

## Frågan och måttet

Tjänade de kronor motorn lade till pengar, och förlorade de kronor den tog bort
pengar? För varje höjning eller sänkning:

```
Δvinst = (intäkt efter − kontrafaktisk intäkt) ÷ break-even − (spend efter − kontrafaktisk spend)
```

Kontrafaktiskt = vad GAMMAL budget hade gett: samma spend per dygn som före
beslutet, och den ROAS kampanjen hade fått ändå (se Kontrafaktiken). Plus
betyder att beslutet tjänade pengar mot att låta budgeten stå.

## Fönstren

| Fönster | Dygn | Varför |
|---|---|---|
| Före | D−3..D−1 | Exakt det motorn såg (dag D är delad — ändringen landar ~07:55) |
| Egen historik | D−10..D−4 | Kampanjens nivå veckan innan, minst 5 dygn med spend, 3 köp, 300 kr |
| Efter, kort | D+1..(sista steget)+3 | Det snabba svaret |
| Efter, lång | D+1..(sista steget)+7 | Det som räknas i hinkarna — kapas vid motorns nästa ändring, så i praktiken median 5 dygn (2026-09-30) |
| Mognad | +3 dygn | Sena köp ska hinna in innan fönstret döms |

Höjningar åt samma håll med högst 3 dygns mellanrum är EN episod (snabbspåret:
68 av 96 höjningar följdes av en ny inom 3 dygn). Utfallen:

- **LANSERINGSFAS** — ett dygn utan spend i före-fönstret. Ingen baslinje.
- **STÖRD** — en annan ändring i före-fönstret, eller en handändring som kapar
  efter-fönstret under 3 dygn.
- **UNG** — ingen egen historik veckan innan, eller för få orörda dygn hos
  andra kampanjer. Orsaken står på raden.
- **FLYTTADE_INTE** — spenden flyttade färre kronor än tre köp vid break-even
  (och minst 300 kr). Då kommer hela Δvinst från ROAS-nivån, inte från
  beslutet, så ingen dom.
- **AVBRUTEN** — motorn sänkte eller stängde av under fönstret. Räknas fram
  till avbrottet (version 1 lät dem falla bort och såg bara överlevarna).
- **REGISTRERAD** — avstängningar. En avstängd kampanj har ingen data efteråt,
  så facit fäller ingen dom. Raden säger om den startades om och gick plus.
- **RÄTT / FEL / OSÄKER** — RÄTT eller FEL bara när hela 80 %-intervallet
  ligger på ena sidan om noll.

Dina egna budgetändringar (allt i Metas aktivitetslogg som inte matchar en
genomförd rad i budgetloggen) mäts precis som motorns, som `AXEL_HOJ` och
`AXEL_SANK`. Motorn känns igen på raden i budgetloggen, inte på appens namn.

## Kontrafaktiken (version 3)

```
kontrafaktisk ROAS/BE = κ · qh · (q ÷ qh)^ρ        ρ = C ÷ (C + (1 + CV²) ÷ köp före)
```

- `q` = ROAS/BE före, `qh` = ROAS/BE veckan innan (kampanjens egen nivå).
- `ρ` = hur stor del av före-fönstrets avvikelse mot den egna nivån som håller
  i sig. Få köp ⇒ mer är slump ⇒ lägre ρ. `CV = 0,4` är ordervärdets spridning.
- `C` = hur mycket en avvikelse brukar hålla i sig: kovariansen mellan
  (före mot veckan innan) och (efter mot veckan innan) på andra kampanjers
  orörda dygn, på båda marknaderna (Norge ensamt hade 27 dygn på 6 kampanjer).
- `κ` = trötthet, säsong och allt som drar alla kampanjer åt samma håll, på
  marknadens egna orörda dygn när de räcker (15 dygn, 5 kampanjer).
- `κ` räknas **per historikklass**: ingen ändring veckan innan, bara
  sänkningar, bara höjningar, eller blandat. En ändring där betyder att en del
  av veckan innan var urvalsdygn för ett tidigare beslut (dåliga dygn före en
  sänkning, bra före en höjning). Utan klasserna såg höjningar efter sänkningar
  +62 % av de flyttade kronorna för bra ut i simuleringen, och sänkningar efter
  höjningar −26 %. Med klasserna: +21 % respektive −16 %. Att i stället kasta
  de besluten gjorde fyra femtedelar omätbara och gav större totalfel.
  Klassen står på varje rad (`historik`). Är en klass för tunn används det
  gemensamma κ, och det står i raden (`kappa_kalla`).
- Orörda dygn = ingen budgetändring D−3..D. Utfallet är efter-fönstret oavsett
  vad som hände sedan — kravet "ingen ändring efteråt" väljer ut dygn på
  utfallet, eftersom motorn höjer när det går bra.
- Kampanjen som bedöms räknas aldrig in i sin egen kontroll.

### Hur modellen valdes

Motorn agerar nästan alltid när ROAS är hög eller låg, så orörda dygn är få
just där besluten tas. Modellen valdes därför i en provbänk med simulerad data
där sanningen är känd: 40 kampanjer i 45 dygn, en motor som höjer på tre dygns
ROAS ≥ 1,4 × break-even och sänker under 0,85, Poisson-köp, och ett orakel som
vet den sanna intäkten vid oförändrad budget. Fem världar:

| Värld | Spridning mellan kampanjer | Trötthet/dygn | Slumpvandring/dygn | Avkastning vid mer spend |
|---|---|---|---|---|
| A. Bara slump | ingen | ingen | ingen | konstant |
| B. Standard | 0,35 | −0,6 % | 3 % | avtagande (0,8) |
| C. Olika, inte trötta | 0,35 | ingen | 3 % | konstant |
| D. Stor spridning | 0,5 | −1 % | 3 % | kraftigt avtagande (0,7) |
| E. Vandrande | 0,2 | ingen | 6 % | avtagande (0,8) |

I alla världar har dessutom varje kampanj en egen drift (spridning 0,4 %/dygn).

Version 2 (en regression över ALLA kampanjdygn med spendens flytt som
förklaring) föll: den blandade ihop motorns egen reaktion med kampanjens
utveckling. I värld B såg höjningar ut att tjäna 1 300–1 800 kr per beslut
för mycket och sänkningar 1 600–2 100 kr för lite (60–100 % av de flyttade
kronorna), så att sänkningar som sparade pengar dömdes FEL.

Den slutliga modellen (version 4, κ per historikklass) i hela kedjan (`kor`),
sex frön per värld, kort fönster, bara beslut som flyttade minst tre köp:

| Värld | Höjningar: mätta, fel av flyttat | Sänkningar: mätta, fel av flyttat | RÄTT stämmer | FEL stämmer |
|---|---|---|---|---|
| A | 20, +1 % | 140, +11 % | 9/9 | 1/1 |
| B | 70, +18 % | 136, +2 % | 15/15 | 4/5 |
| C | 61, +14 % | 92, −16 % | 16/16 | 2/2 |
| D | 70, +9 % | 145, −19 % | 14/14 | 8/10 |
| E | 109, +17 % | 97, −20 % | 19/19 | 6/6 |

Andra modeller prövades i provbänken (samma världar, fast fönster) och föll på
sämsta fallet. En tvåstegsmodell som även krymper den egna nivån mot kontots
snitt passade riktig data bäst på placebon, men såg höjningar 32–63 % för
ljusa i simuleringen. En log-linjär regression (`ln y = a + b·ln q + c·ln qh`)
gav sänkningar 31 % fel i värld B, och med antal köp som extra förklaring upp
till 88 %. Den valda modellen hade minst fel i sämsta fallet: cirka 20 % av
de flyttade kronorna i hela kedjan.

**Det betyder för förslagen:** mätaren ser höjningar upp till cirka 20 % för
ljusa, i alla fem världarna åt det hållet. Ett förslag om att skala mer kräver
därför marginal-ROAS minst 1,25 × break-even, räknat bara på beslut som
faktiskt lade till spend (en höjning där spenden föll blåser annars upp
nettokvoten).

## Osäkerheten

Tre delar ligger i varje intervall:

1. **Köpbruset** — intäktens varians som sammansatt Poisson (köp × ordervärde).
2. **Kampanjernas vandring** — hur mycket en kampanj rör sig på några dygn
   utöver bruset, mätt på placebodygnen varje morgon (2026-09-30: log-varians
   0,022 på 3 dygn, 0,062 på 7).
3. **Modellens egen osäkerhet** — kontrollkampanjerna dras om 60 gånger och κ
   och C räknas om. Den är gemensam för alla beslut samma morgon, så hinkarna
   lägger ihop den rakt, inte i kvadrat. Omdragningen fångar skattningens brus
   men inte att modellen är en förenkling: i 24 simulerade månader hade felet
   delat med omdragningens sd spridningen 1,4 för höjningar och 1,9 för
   sänkningar. Den skalas därför med 1,5 respektive 1,9. Med den slutliga
   modellen hamnade 92 % (höjningar) och 96 % (sänkningar) av felen inom
   80 %-intervallet — intervallen är alltså något för breda, åt det försiktiga
   hållet.

## Mätaren — placebo varje morgon

Mätaren prövas på dygn där ingen rörde budgeten, en kampanj i taget med
kampanjen själv borttagen ur kontrollen. Felet är intäkten mätaren hittar på:
`(ROAS efter − förutsagd ROAS) × spend före`. Prövningen görs för båda
fönstren (3 och 7 dygn) och per läge (under BE, BE–1,5, 1,5–2,0 och över
2,0 × BE).

**Godkänd** kräver minst 8 kampanjer och att medelfelet per krona bevisligen
ligger inom ±0,1 × break-even — hela 80 %-intervallet, inte bara att det
innehåller noll. Förslag om höjningar (R1, R4) kräver godkänt totalt och i
båda lägena där motorn höjer (1,5–2,0 och över 2,0 × BE), i båda fönstren.
Förslagen som inte bygger på kontrafaktiken (R2, R6, R7, R8) spärras inte.

**Ett godkänt prov bevisar inte att mätaren är rak.** Kontrollen anpassas på
samma sorts dygn, så ett fel som den redan bär syns inte här: i simuleringens
värld B låg placebon nära noll (+3 311 kr) medan mätarens sanna fel på samma
dygn var 221 kr per dygn. Ett underkänt prov bevisar däremot att mätaren inte
håller. Därför används provet som spärr, inte som bevis.

Mätt 2026-09-30 på riktig data, 7 dygn: 54 dygn, 16 kampanjer, medelfel +0,05
× break-even (80 %: −0,10 till +0,17) — **inte godkänd**. Mellanläget
BE–1,5 × BE +0,24, läget 1,5–2,0 × BE −0,19, och över 2,0 × BE finns bara 2
prov. Mätaren håller alltså inte ännu där motorn höjer, och inga förslag om
höjningar kan gå ut förrän den gör det.

## Hinkarna

Per familj (höjningar, sänkningar, tjuvpauser, dina egna) och dimension:
budget före, ROAS/BE vid beslutet, ROAS ÷ target (trappsteget), första
steget, hela ändringen, kedja, marknad, regelverk, produkt. Per hink: mätta av
alla, olika kampanjer, rätt/fel/för jämna, Σ Δvinst med 80 %-intervall
(kampanjer dras om + modellens osäkerhet), median, Σ utan den största
kampanjen, den största kampanjens andel, samlad marginal-ROAS mot break-even.

Hållbesluten (motorn lät kampanjen vara) mäts utan kontrafaktik: stod den kvar
över target nästa morgon, stod den kvar efter hela väntan, föll den under
break-even, och nettot `intäkt ÷ break-even − spend` på unika kampanjdygn
(överlappande fönster räknas en gång). Ett hålldygn som följdes av en ändring
inom 3 dygn blir `ANDRAD_<typ>` och räknas med — förut föll de bort, och då
föll just väntedygnen där toppen höll och motorn höjde (3/16 över target nästa
morgon i stället för 33/58).

Utöver det, ren räkning utan modell:

- **Sågtanden** — höjning följd av motorns egen sänkning eller avstängning inom
  7 dygn.
- **Väntans kostnad** — väntedygn över target som följdes av en höjning inom 3
  dygn, och vad den höjningen gav per dygn.
- **Revideringen** — samma tredygnsfönster hämtat i dag mot det motorn loggade.
  Underlag för `NARA_GRANS_PP`.

## Förslagen till Axel

Varje förslag pekar på exakt en konstant i `agent/besked.mjs`, med dagens
värde och ett nytt, och bygger bara på det som var KÄNT vid beslutet
(trappsteg, fart, budget, hållkod) — aldrig på kedja eller total, som beror på
vad som hände efteråt.

| Regel | Konstant | Underlag |
|---|---|---|
| R1 | `TRAPPA` (steget per trappsteg) | Höjningar per ROAS ÷ target |
| R2 | `KONSEKVENT_DAGAR` | Stod väntedygn över target kvar nästa morgon? |
| R4 | `TAK_UTAN_VINNARE` | Höjningar över 4 000 kr/dag (motorns och dina) |
| R6 | `LIVSTIDS_MAX_BACKDAGAR` | Väntan i förlust: tog de sig upp, vad kostade det? |
| R7 | `TEST_TROSKEL_SEK` | Samma, för testtröskeln |
| R8 | `NARA_GRANS_PP` | Korsar omhämtade siffror gränsen? |

Snabbspåret (`SNABB_SKALNING_ROAS`) går inte att mäta: en höjning dagen efter
en ändring har den ändringen i sitt före-fönster och blir alltid STÖRD.

Villkoren för R1 och R4 (alla måste hålla samtidigt):

- minst 8 mätta beslut på 5 olika kampanjer (R4: 5 och 3)
- 80 %-intervallet på ena sidan om noll, med modellens osäkerhet inräknad
- samma tecken utan den största kampanjen, utan varje kampanj i tur och
  ordning, och i det korta fönstret (ofta samma data — kontrollen är inte
  oberoende när motorn kapat fönstret)
- ingen kampanj bär mer än 40 % av summan
- att skala mer kräver marginal-ROAS ≥ 1,25 × break-even på de tillagda kronorna
- mätaren godkänd (se Mätaren)

R6 och R7 kräver dessutom att högst 30 % av hålldygnen ändrades inom 3 dygn —
annars är de mätta ett urval.

För alla förslag: bara beslut under det nuvarande regelverket (`REGELVERK` i
`agent/facit.mjs`; dina egna ändringar räknas alltid), stått 7 morgnar i rad,
aldrig på en dag då ett konto saknades.

Varje förslag har ett id, `F` + fyra siffror, som kommer ur förslagets innehåll
(konstant och nytt värde). Samma förslag har samma id varje morgon, hur listan
än ser ut. `--status` visar inga förslag ur en kalibrering som inte skrevs i
dag.

Svarar Axel `JA F1234`: sessionen hittar F1234 i `agent/kalibrering.json`,
kontrollerar att konstanten i `agent/besked.mjs` i dag har värdet i `fran`
(annars frågar den Axel och ändrar ingenting), ändrar konstanten, lägger en
rad i `REGELVERK` med dagens datum (så att nya beslut mäts för sig), och kör
testerna. `NEJ F1234`: ingenting ändras.

## Mönsterminnet — var motorn brukar gissa fel och rätt

Axels beställning 2026-09-30: *"lära sig av sina misstag … hitta mönster för
vad den har trott varje gång och som kanske har blivit fel … lagra det … men
vi får inte ta konkreta förbud, för en grej som brukar funka kanske bara inte
funkade två eller tre gånger."* Koden: `agent/monster.mjs`.

Varje beslut är en gissning om de närmaste dygnen, och rättas mot dygn 1–3
efter — ingen kontrafaktik, bara det som hände:

| Beslut | Motorn trodde | Rätt om | Fel om |
|---|---|---|---|
| Höjning | kampanjen fortsätter gå med vinst | ROAS ≥ break-even | ROAS under break-even |
| Sänkning | kampanjen är inte värd pengarna just nu | ROAS under break-even | ROAS ≥ target (studsade) |
| Vänta trots ROAS över target | toppen håller kanske inte | ROAS under target | ROAS ≥ target (missad höjning) |
| Vänta med en kampanj i förlust | den kan vända | ROAS ≥ break-even | ROAS under break-even |

Villkoren är bara sådant som var känt när motorn bestämde sig: ROAS mot
break-even, dygn i rad över target, köp senaste tre dygnen, motorns ändring
veckan innan, budget, senaste dygnet mot snittet, marknad. Minnet letar lägen
(ett villkor eller två) där gissningen gått fel eller rätt oftare än vanligt.

Skydden mot förbud på slump:

- **Krympning.** Varje läge dras mot beslutets vanliga träffsäkerhet (fyra fall
  i förhand). Ett läge listas först vid 6 beslut på 4 olika kampanjer (två
  villkor: 8), 15 procentenheter från det vanliga och säkert på 80 %-nivån.
  Två–tre missar i ett läge som brukar fungera räcker aldrig.
- **Glömska.** Äldre beslut väger mindre, halva vikten efter 30 dygn. Ett
  mönster som slutar stämma försvinner av sig självt.
- **Slumpnivån.** Varje morgon blandas utfallen om 100 gånger, och rapporten
  säger hur många mönster ren slump hade gett. 2026-09-30: 4 missar hittade,
  mot i snitt 0,7 av slump; 2 styrkor mot 0,2. Listan "brukar fungera men gick
  fel nyligen" (tre fel i rad) gav 1,7 av slump — den är mest brus och står
  som "håll ögonen på".
- **Aldrig en regel.** Mönstret står bredvid dagens beslut i ronden och i
  rapporten. Motorn ändras bara när Axel säger ja.

Gissningarna sparas i `agent/gissningar.jsonl` och glöms aldrig (Meta ger
bara 45 dygn bakåt). Mönstren räknas om varje morgon till `agent/monster.json`.

Första körningen 2026-09-30, 172 rättade gissningar: höjningar rätt 70 av 86,
vänta över target rätt 39 av 53, vänta i förlust rätt 9 av 19, sänkningar
2 av 4 (10 oklara). Återkommande missar:

- Höjning vid ROAS 1,6–2,0 × break-even: med vinst efteråt 11 av 18 gånger,
  mot 81 % för höjningar i stort (12 kampanjer). Med 10–29 köp: 5 av 12.
- Vänta med en kampanj i förlust när den hade under 10 köp på tre dygn: tog
  sig över break-even 2 av 11 gånger (9 kampanjer).
- Vänta trots ROAS över target med 30 köp eller fler: föll under target 4 av
  10 gånger (4 kampanjer).

## Första körningen, 2026-09-30

Datan: SE 739 dygnsrader och 121 budgetändringar (27 för hand), NO 335 och 36,
45 dygn bakåt.

- **Höjningar:** 3 av 31 mätta. 16 var i lanseringsfas, 4 utan egen historik,
  4 störda, 3 flyttade inte spenden, 1 avbröts direkt. De 3: alla för jämna
  att döma, −2 460 kr mot att låta budgeten stå (80 %: −15 198 till
  +10 278 kr). För få för en slutsats.
- **Sänkningar:** 5 av 23 mätta, alla för jämna, −642 kr.
- **Sågtanden:** 20 av 29 höjningar (69 %) vändes av motorn själv inom 7 dygn,
  median 4 dygn. Norge 9 av 11, Sverige 11 av 18. Motorn höjer på toppar som
  inte håller.
- **Väntan över target:** 33 av 58 väntedygn (57 %) stod kvar över target
  nästa morgon, och 36 av 65 följdes av en höjning inom 3 dygn.
- **Revideringen:** 1 av 36 rader nära en zongräns korsade den vid
  omhämtningen, median omhämtad ÷ loggad ROAS 0,999. Kandidat för
  `NARA_GRANS_PP` från 3 till 0 (dag 1 av 7).
- **Mätaren:** inte godkänd (se Mätaren). Inga förslag om höjningar kan gå ut
  ännu.

## Det mätaren inte klarar

- **De flesta höjningar går inte att mäta än.** Motorn höjer tidigt efter
  lansering, och ett före-fönster med ett dygn utan spend har ingen baslinje.
- **En månads data ger stora intervall.** Modellens egen osäkerhet var
  2026-09-30 ungefär halva de flyttade kronorna för höjningarna och en
  tredjedel för sänkningarna. Hinkarna blir skarpare för varje vecka.
- **Nya annonser** som laddas upp i samma kampanj under fönstret syns inte som
  störning — de påverkar ROAS utan att budgeten ändrats.
- **Beslut före 2026-09-25** fattades på siffror med visningsköp; facit räknar
  allt i 7d_click, så läget kan skilja från det motorn såg.
- **Avstängningar** döms inte. Det går inte att veta vad en avstängd kampanj
  hade gett.
- **Simuleringen är en förenkling.** Riktig data kan bete sig på sätt ingen av
  de fem världarna fångar. Placebon fångar en del av det, inte allt (se
  Mätaren).
- **Tidsgränsen** (150 s för båda kontona) gäller varje anrop mot Meta, men ett
  svar som redan är på väg avbryts vid gränsen — facit blir då DELVIS.

## Filerna och rutinen

| Fil | Vad |
|---|---|
| `agent/facit.jsonl` | En rad per beslut och fönster, skrivs en gång och rörs aldrig |
| `agent/kalibrering.json` | Hinkarna, mätaren, kandidaterna och förslagen |
| `agent/utdata/facit-<datum>.md` | Rapporten |
| `agent/utdata/cache/facit-<konto>-<datum>.json` | Hämtningen (gitignorerad) |

Rutinen `/rond-auto` kör `node agent/facit.mjs --hamta --skriv` i steg 6b,
EFTER budgetändringarna och loggens push, så att facit aldrig kan strypa eller
försena en budgetändring (egen tidsgräns 150 s för båda kontona, ett omförsök).
Steg 2 läser gårdagens kalibrering och lägger hinkens siffror bredvid varje
beslut. Facit felar öppet: saknas kalibreringen, är den äldre än tre dygn
eller trasig, räknar ronden utan den och säger det.

```bash
node agent/facit.mjs                  # torrt: rapporten till skärmen, inget skrivet
node agent/facit.mjs --hamta --skriv  # rutinen
node agent/facit.mjs --status [--en]  # raderna till leveransen (engelska: utan kronor)
node agent/facit.mjs --json           # kalibreringen som maskindata
```

Metoden har version (`METOD_VERSION`). Hinkarna räknas bara ur rader med
gällande version, och en ny version dömer om allt som fortfarande ligger i
datafönstret — en rättad metod blandas aldrig med frysta rader från en gammal.
