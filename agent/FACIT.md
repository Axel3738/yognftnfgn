# Facit — återkopplingen till Skalnings kungen

Axels beställning 2026-09-30: *"en feedbackloop som kollar om det var bra
eller dåligt att vi skalade och stängde av och gör vissa grejer på vissa sätt,
så att vi i framtiden lär oss vart det är okej att skala mer och vart vi kan
spara in mer pengar."*

Facit dömer varje budgetbeslut i efterhand, samlar domarna i hinkar (budget,
ROAS-läge, trappsteg, fart, marknad, produkt) och föreslår en regeländring
först när datan bär den. **Facit ändrar aldrig ett beslut, en budget, en regel
eller budgetloggen.** Förslagen är Axels beslut: `JA N` eller `NEJ N`.

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
| Efter, lång | D+1..(sista steget)+7 | Det som räknas i hinkarna |
| Mognad | +3 dygn | Sena köp ska hinna in innan fönstret döms |

Höjningar åt samma håll med högst 3 dygns mellanrum är EN episod (snabbspåret:
68 av 96 höjningar följdes av en ny inom 3 dygn). Utfallen:

- **LANSERINGSFAS** — ett dygn utan spend i före-fönstret. Ingen baslinje.
- **STÖRD** — en annan ändring i före-fönstret, eller en handändring som kapar
  efter-fönstret under 3 dygn.
- **UNG** — ingen egen historik veckan innan, eller för få orörda dygn hos
  andra kampanjer. Orsaken står på raden.
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

| Värld | Spridning mellan kampanjer | Trötthet/dygn | Avkastning vid mer spend |
|---|---|---|---|
| A. Bara slump | ingen | ingen | konstant |
| B. Standard | 0,35 | −0,6 % | avtagande (0,8) |
| C. Olika, inte trötta | 0,35 | ingen | konstant |
| D. Stor spridning | 0,5 | −1 % | kraftigt avtagande (0,7) |
| E. Vandrande | 0,2 + slumpvandring 6 %/dygn | ingen | avtagande (0,8) |

Version 2 (en regression över ALLA kampanjdygn med spendens flytt som
förklaring) föll: den blandade ihop motorns egen reaktion med kampanjens
utveckling. I värld B såg höjningar ut att tjäna 1 300–1 800 kr per beslut
för mycket och sänkningar 1 600–2 100 kr för lite (60–100 % av de flyttade
kronorna), så att sänkningar som sparade pengar dömdes FEL.

Version 3 i hela kedjan (`kor`), sex frön per värld, kort fönster:

| Värld | Höjningar: fel av flyttat | Sänkningar: fel av flyttat | RÄTT stämmer | FEL stämmer |
|---|---|---|---|---|
| A | −6 % | +19 % | 35/36 | 43/43 |
| B | +18 % | +7 % | 35/37 | 39/40 |
| C | +9 % | −16 % | 29/29 | 28/28 |
| D | +7 % | −10 % | 36/37 | 41/43 |
| E | +12 % | +3 % | 34/38 | 45/46 |

Andra modeller prövades i provbänken (samma världar, fast fönster) och föll på
sämsta fallet. En tvåstegsmodell som även krymper den egna nivån mot kontots
snitt passade riktig data bäst på placebon, men såg höjningar 32–63 % för
ljusa i simuleringen. En log-linjär regression (`ln y = a + b·ln q + c·ln qh`)
gav sänkningar 31 % fel i värld B, och med antal köp som extra förklaring upp
till 88 %. Version 3 hade minst fel i sämsta fallet: 19 % av de flyttade
kronorna i hela kedjan.

**Det betyder för förslagen:** mätaren kan se höjningar upp till cirka 20 %
för ljusa. Ett förslag om att skala mer kräver därför marginal-ROAS minst
1,25 × break-even — då är den sanna marginalen fortfarande över break-even.

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
   sänkningar. Den skalas därför med 1,5 respektive 1,9, och då hamnade 88 %
   av felen inom 80 %-intervallet.

## Mätaren — placebo varje morgon

Mätaren prövas på dygn där ingen rörde budgeten, en kampanj i taget med
kampanjen själv borttagen ur kontrollen. Felet är intäkten mätaren hittar på:
`(ROAS efter − förutsagd ROAS) × spend före`. En rak mätare hamnar nära noll.
Den redovisas totalt och per läge (under BE, BE–1,5 × BE, över 1,5 × BE).

Version 2:s placebo (motorns hålldygn utan ändring D−3..D+3) var skev i sig:
kravet att inget ändrades efteråt väljer ut dygn på utfallet. I simuleringen
var det sanna värdet på de dygnen −67 000 kr, inte 0.

Mätt 2026-09-30 på riktig data: −3 420 kr totalt på 81 dygn (21 kampanjer),
godkänd. Per läge: +31 790 kr i mittläget (inte godkänd — mätaren ser
mittlägets kampanjer för mörka) och −31 676 kr över 1,5 × BE (godkänd, men
intervallet är brett). **Ett förslag om höjningar kräver att mätaren är
godkänd i toppläget, inte bara totalt** — annars kan lägena ta ut varandra.

## Hinkarna

Per familj (höjningar, sänkningar, tjuvpauser, dina egna) och dimension:
budget före, ROAS/BE vid beslutet, ROAS ÷ target (trappsteget), fart, första
steget, hela ändringen, kedja, marknad, regelverk, produkt. Per hink: mätta av
alla, olika kampanjer, rätt/fel/för jämna, Σ Δvinst med 80 %-intervall
(kampanjer dras om + modellens osäkerhet), median, Σ utan den största
kampanjen, den största kampanjens andel, samlad marginal-ROAS mot break-even.

Hållbesluten (motorn lät kampanjen vara) mäts utan kontrafaktik: stod den kvar
över target, föll den under break-even, och nettot `intäkt ÷ break-even −
spend` på unika kampanjdygn (överlappande fönster räknas en gång).

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
| R3 | `SNABB_SKALNING_ROAS` | Höjningar dagen efter förra höjningen |
| R4 | `TAK_UTAN_VINNARE` | Höjningar över 4 000 kr/dag (motorns och dina) |
| R6 | `LIVSTIDS_MAX_BACKDAGAR` | Väntan i förlust: tog de sig upp, vad kostade det? |
| R7 | `TEST_TROSKEL_SEK` | Samma, för testtröskeln |
| R8 | `NARA_GRANS_PP` | Korsar omhämtade siffror gränsen? |

Villkoren för R1, R3 och R4 (alla måste hålla samtidigt):

- minst 8 mätta beslut på 5 olika kampanjer (R4: 5 och 3)
- 80 %-intervallet på ena sidan om noll, med modellens osäkerhet inräknad
- samma tecken utan den största kampanjen, utan varje kampanj i tur och
  ordning, och i det korta fönstret
- ingen kampanj bär mer än 40 % av summan
- att skala mer kräver marginal-ROAS ≥ 1,25 × break-even
- mätaren godkänd totalt och i toppläget

För alla förslag: bara beslut under det nuvarande regelverket (`REGELVERK` i
`agent/facit.mjs`; dina egna ändringar räknas alltid), stått 7 morgnar i rad,
aldrig på en dag då ett konto saknades.

Svarar Axel `JA N`: sessionen ändrar konstanten i `agent/besked.mjs`, lägger
en rad i `REGELVERK` med dagens datum (så att nya beslut mäts för sig), och
kör testerna. `NEJ N`: ingenting ändras.

## Första körningen, 2026-09-30

Datan: SE 739 dygnsrader och 121 budgetändringar (33 för hand), NO 335 och 36,
45 dygn bakåt.

- **Höjningar:** 6 av 31 mätta. 16 var i lanseringsfas, 5 störda, 3 utan egen
  historik. De 6: 0 rätt, 2 fel, 4 för jämna, −13 277 kr mot att låta budgeten
  stå (80 %: −32 872 till +5 833 kr). För få för en slutsats.
- **Sänkningar:** 7 av 23 mätta, 1 rätt, 6 för jämna, +910 kr.
- **Sågtanden:** 20 av 29 höjningar (69 %) vändes av motorn själv inom 7 dygn,
  median 4 dygn. Norge 9 av 11, Sverige 11 av 18. Motorn höjer på toppar som
  inte håller.
- **Väntan:** över target stod 3 av 16 väntedygn kvar över target. Mellan
  break-even och target netto +45 776 kr på 118 unika dygn.
- **Revideringen:** 1 av 36 rader nära en zongräns korsade den vid
  omhämtningen, median omhämtad ÷ loggad ROAS 0,999. Kandidat för
  `NARA_GRANS_PP` från 3 till 0 (dag 1 av 7).

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
  de fem världarna fångar. Placebon varje morgon är vakten.

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
gällande version, så en rättad metod blandas aldrig med frysta rader från en
gammal.
