# Evolve Finance — hela kursen, på svenska

Läst 2026-10-01 i Skool (`skool.com/evolve-8484/classroom/cf68fcb8`, inloggning
`SKOOL_EMAIL`/`SKOOL_PASSWORD` i miljön). Sju lektioner: Billing (1), Cash Conversion (5),
Chargebacks (1). Läraren är **Grayson Cross** ("10 år i e-handel, 2 miljarder dollar i
omsättning, 100 miljoner dollar i månaden i prenumerations-LTV"). Lektionstexterna står
ordagrant i `kalla/finance/`, mallarna i `kalla/finance/ltv-mall.md` och `kalla/finance/melio.txt`.

Kursen är skriven för **prenumerationsbolag i USA** (kosttillskott, hudvård). Det som gäller
oss står under varje lektion. Vad vi har byggt av det: `ekonomi/README.md`.

---

## 0. Intro (Chadzone, 1:17)

Löftet: "köra annonskontot på 0,5 ROAS och ändå tjäna mer än nu", utan att "förlora pengar
månad ett och två och ta igen det sen". Tre saker: **LTV, contribution margin och
kassaflödescykeln** (när pengarna lämnar banken mot när de kommer tillbaka). Lektionerna
bygger på varandra och ska tas i ordning.

## 1. Contribution margin (4:17)

**Bidrag ≠ vinst.** Vinst = det som blir kvar efter ALLT (hyra, löner, mjukvara).
Bidrag = det som blir kvar efter de **rörliga** kostnaderna, de som växer med omsättningen.
Alla skalningsbeslut fattas på bidraget.

- Bidrag kr = intäkt − rörliga kostnader. Bidrag % = bidrag kr ÷ intäkt.
- **Rörliga kostnader** (listan folk gör fel på):
  - Varukostnad **fullt landad**: vara + förpackning + fulfillment + frakt till kunden. Inte bara råvaran.
  - Reklam.
  - Betalavgifter: Shopify Payments ~2,8 % + 0,30 $, "avrunda till 3 %".
  - Prenumerations-/appavgifter som tar procent (0,5–1 %): "1 % av en miljon = 10 000 $ i månaden. Det är en lön."
  - Team eller byrå som får procent av spenden.
- **Första ordern och återköpet har olika kostnader.** Reklamen och procentavgifter på spenden
  ligger bara på första ordern. Därför kan det vara rätt att **förlora 20 $ på första ordern
  om du tar igen 30 $ på 90 dagar**. "Det är inte copium, det är matte."
- Räkneexemplet: order 100 $, landad varukostnad 35, avgift 3,30, app 1, CAC 40, byrå 2 →
  första ordern +18,70 $ (18,7 %); återköpet +60,70 $ (60,7 %). Vid CAC 70 blir första ordern
  −12,80 $, men med ett återköp på 90 dagar +47,90 $.
- **Gör så här:** (1) bestäm vilka rörliga kostnader som ingår, (2) dela första order och
  återköp, (3) räkna bidraget för båda, (4) bestäm återbetalningsfönstret ("~3 månader").
- Vanliga fel: blanda ihop vinst och bidrag, glömma avgifterna ("död genom 3 %"), använda
  råvarukostnad i stället för landad, snitta allt så att första order och återköp blandas.

**Det här gäller oss:** varukostnaden i Shopify (Cost per item) inkluderar frakten från
leverantören (Axel 2026-09-26) — alltså redan "landad". Tull 2,8 EUR per order kommer
ovanpå (`stonebite/kostnader.json`). Redigerarnas 0,4 % av spenden är en rörlig kostnad på
första ordern. Vi har ingen prenumeration, så återköpet är litet (se modul 2).

## 2. LTV-modellen — "hur du outspendar alla" (10:51)

LTV finns för att svara på en fråga: **hur mycket kan jag spendera mer än alla konkurrenter
och ändå tjäna pengar?** Den som köper mest distribution vinner marknaden.

- **Nya kunder ur Shopify, aldrig ur Facebook.** Metas attribution "ljuger dig rakt i ansiktet".
  Spenden får komma ur Meta, men kunderna ur Shopify (filter: ny kund).
- **CAC ≠ CPA.** CAC = all reklam i perioden ÷ **nya** kunder samma period. CPA = kostnad per
  köp. "Blandar du ihop dem är modellen falsk."
- **LTV ≠ retention.** Retention är människor som stannar, LTV är kronor de ger. Räkna i kronor.
- Verktyget han rekommenderar: **Lifetimely** (billigt, kohort-LTV per månad).
- **Mallen** (`kalla/finance/ltv-mall.md`): en kohort = kunderna som köpte första gången samma
  månad. Rad 2 = "LTV-multiplikator" per månad efter (månad 0 = 100 %, månad 1 t.ex. 70 %).
  Intäkt = multiplikator × AOV. Bidrag = intäkt × marginal − CAC (bara på månad 0). Summeras
  kumulativt: **"Total margin from cohort" är skalningsbeslutet.** Orange celler = indata
  (AOV första/andra order, CAC, antal kunder, varukostnad, OpEx), grå = formler.
- Första ordern och återköpet ska ha **olika AOV och marginal** (gratisgåvor, introbundles,
  engångs-upsells på första ordern; rakbladsexemplet: handtaget på första leveransen).
- OpEx kan läggas på per order senare (10 miljoner $ omsättning, AOV 64 $, OpEx 100 000 $ → 0,64 $ per order ≈ 1 %).
- **Gör så här:** nya kunder 30/60/90 dagar ur Shopify, spend samma period, CAC = spend ÷ nya,
  kohort-LTV månad 0–12, mata in, titta på månad 0 (negativ?), återbetalning månad 1–3, bidrag efter 90 dagar.

**Det här gäller oss:** byggt som `ekonomi/barometrar.mjs` (nCAC ur Shopifys nya kunder,
kohorter per månad). Mätt: Matstrumpor har 1,2 % återköp (`klaviyo/evolve/ATERKOP-ANALYS-matstrumpor.md`),
Bäverbutiken 2,7 % på 60 dagar. **Våra butiker har nästan ingen LTV — första ordern måste bära
sig själv.** Kursens "0,5 ROAS och vinst" gäller inte oss.

## 3. Barometrarna — det du kan laga snabbt mot det som dödar dig (9:18)

Det finns saker du kan laga, saker du inte kan laga och saker som tar så lång tid att de
nästan inte går. **Laga det som är lättast i förhållande till effekten först.**

- Exemplet: AOV 64 $, CAC 74 $ = ROAS 0,86 — "kan köras hela dagen om resten av modellen är frisk".
- **Tumregel: håll ROAS runt 0,7 eller högre** som marginal för verkligheten (CPM-toppar,
  återbetalningar, trött kreativ). Gäller prenumeration med stark LTV.
- **Låg LTV är ofta lagbar:** bättre erbjudandestruktur, högre take-rate, bättre prissättning.
  Det kan vara mer lönsamt att acceptera **högre CAC om LTV ökar mer** ("CAC +10 $ men månad 3 går från 1 $ till 22 $").
- **Hög varukostnad är lagbar:** höj priset ("de flesta är underprissatta"), omförhandla
  villkor, byt tillverkare, sänk fulfillmentkostnaden. **Varukostnaden ska ligga på högst 30 %.**
  "Ligger du över det är priset för lågt, eller så bjuder leverantören dig på middag och du betalar."
- **Låg AOV är det svåra.** CPM och CPC har golv; under en viss AOV finns "inte tillräckligt kött
  på benet". Prenumeration under 29,99 $ fungerar nästan aldrig, realistiskt 39–49 $.
- Månad 3, 6 och 12 är linjerna som betyder något: kassaplanering, lagercykler, kreativ trötthet, budget.
- **Stresstesta:** CAC +20 %, LTV −20 %, varukostnad +5 procentenheter.
- **Hitta den enda spaken:** långsam återbetalning → AOV/erbjudande; dålig CAC → kreativ/landningssida; krossad marginal → pris/varukostnad.

**Det här gäller oss:** stresstestet räknas av `ekonomi/barometrar.mjs`. Varukostnaden ligger
på eller över taket (snapshoten 24/9–1/10, Cost per item ÷ netto): **Bäverbutiken 30,3 %,
CaraShell 33,4 %, Beverbutikken (NO) 32,2 %.** Varje procentenhet som förhandlas bort syns
direkt i bidraget (`leverantor/FORHANDLING.md`).

## 4. Kassaflödescykeln — "the Great Wall of Death" (9:36)

**Modellen säger lönsam månad 3, banken säger död vecka 3.** Med 100 000 kunder och negativ
månad 0–2 behöver du miljoner som flyter innan återbetalningen kommer.

- **Fuskkoden: matcha återbetalningen mot betalningstiden.** Om kunden betalar dig innan du
  måste betala dina räkningar kan du skala utan att blöda. Frågorna: när lämnar pengarna
  banken, när kommer de in, blir vi positiva innan räkningen förfaller?
- **Lager 1 — Metas månadsfaktura:** spendera nu, betala ~30 dagar efter fakturadatum.
- **Lager 2 — räkningar som inte tar kort:** Melio/Plastiq betalar leverantören med ditt kort mot
  ~2,9–2,99 % avgift. Avgiften är verklig: med 1–2 % bonus betalar du fortfarande för krediten.
- **Lager 3 — kort med lång kredit:** Amex Plum (upp till 60 dagar räntefritt + 1,5 % rabatt vid tidig betalning).
- **Lager 4 — leverantörsvillkor** (Net 30/60) minskar lagrets kassabehov.
- Allt kräver att **kohortmatten stämmer**: 5 % fel i tidig LTV svänger från vinst till stor förlust i skala.
  Bygg med kortare återbetalning än den optimistiska modellen.
- Skyddsräcken: skala aldrig skulden snabbare än du kan leverera; stresstesta (CAC +20 %, LTV månad 1–2 −10 %,
  återbetalningar +2 %, utbetalningar 7–14 dagar sena); vet alltid **datumet räkningen kommer**.
- Vanliga fel: skala för att "modellen säger månad 3" utan att titta på kassan, slarvig kohortdata,
  tro att kredit lagar ett trasigt erbjudande, glömma lagrets kassabehov.

**Det här gäller oss** (mätt 2026-10-01 via Meta API, `funding_source_details`): **alla sex
annonskonton betalas med VISA-kort**, inget med månadsfaktura (MagiBorsten *7217, nya kungen
och Magiborsten DK *9341, Magiborsten UK *4363, NO *0504, FI *9753). Melio, Plastiq och Amex Plum
är amerikanska — motsvarigheten för ett svenskt aktiebolag är bankens företagskort med lång
kredit och Metas månadsfaktura om kontot kvalificerar sig (Ads Manager → Fakturering och betalningar).
Det är Axels bankfråga, inte en kod. Vårt lager hos CWD är förbetalt: 2 051 enheter ligger
och binder pengar i Kina (`lager/rapporter/`).

## 5. Meta Billing — så betalar du fortfarande med kort (10:23)

Videon har ingen text. Google-dokumentet (`kalla/finance/melio.txt`) säger:

- Meta flyttar vissa annonsörer från kort till månadsfaktura/banköverföring (rapporterat runt
  slutet av mars/1 april 2026 för berörda konton — inte alla).
- Tre nivåer: (1) betala direkt med bank/debet — "sämsta användningen av kapital";
  (2) kort med tröskeldebitering — ~30 dagars andrum via kortets cykel; (3) **"Chad Scaling
  Workflow"**: Metas månadsfaktura (betala inom 30 dagar från fakturadatum) → betala fakturan via
  tredje part som tar kort (Melio ~2,9 %, Plastiq 2,99 %, Bill.com) → kort med lång kredit
  (Plum). Tillsammans "90–105 dagars float".
- Valet av kort görs på **villkor och nettokostnad**, inte på poäng.
- Skyddsräcken som i modul 4.

**Det här gäller oss:** vi är på nivå 2. Nivå 3 kräver att Meta erbjuder månadsfaktura och en
svensk motsvarighet till Melio/Plum. Kolla i Ads Manager om kontot har fått erbjudandet; fråga
banken om kreditdagar på företagskortet.

## 6. Chargebacks / Management Services (Loom, 28 min)

Hela texten: `kalla/finance/07-chargebacks.txt`. Det viktiga:

- **En chargeback är en brandvarnare, inte en brand.** Problemet är när processorn tycker att
  kontot ser riskabelt ut ("Your payments account is under review").
- **Chargebacks är bara dåliga i förhållande till kundens värde:** 0,4 % med 70 % sexmånaders-LTV
  kan vara sämre än 0,9 % med 410 %.
- Shopifys orsaker: fraudulent, unrecognized (deskriptorn!), duplicate, subscription canceled,
  product not received, product unacceptable, credit not processed, general.
- **Tre olika jobb:** (1) *förebyggande larm* — återbetala innan det blir en chargeback (RDR
  automatiska regler, CDRN, Ethoca); (2) *avledning* — visa banken orderdetaljer så kunden känner
  igen köpet (Visa Order Insight, Mastercard Consumer Clarity); (3) *representment* — slåss med
  bevis när chargebacken redan finns. **Att vinna i representment tar inte bort chargebacken ur
  kvoten.**
- **VAMP** = Visa Acquirer Monitoring Program: (bedrägerianmälningar + tvister) ÷ avräknade
  transaktioner. Alla typer av tvister staplas.
- Fem spakar: (1) kundtjänst som en ratt — vrid upp återbetalningarna när kvoten stiger ("Ge
  Susan återbetalningen"); (2) **sluta skaffa dåliga kunder** — exportera minst 100 chargebacks,
  leta oproportionerliga mönster (land, produkt, betalsätt, trafikkälla); "Australien 10 % av
  omsättningen men 80 % av chargebacks"; (3) riskseparera processorer/MID:ar (inte för Shopify Payments);
  (4) enkel uppsägning i kundportal; (5) påminnelse före omdebitering.
- **Operativsystemet varje vecka:** chargeback-, bedrägeri- och återbetalningsgrad, per land,
  betalsätt, produkt, erbjudande och trafikkälla. **Tagga varje chargeback med grundorsaken**
  (otydlig deskriptor, dåligt kundtjänstsvar, sen leverans, internationell frakt, aggressivt
  erbjudande, fel förväntan på produkten).

**Det här gäller oss:** vi har ingen prenumeration, så spak 4–5 gäller inte. Mätt hos oss:
inquiries 29 av 29 vunna, chargebacks 1 av 4 (`kundtjanst/sop/`). Tvistgraden finns i snapshoten
(0,11 %) men taggas inte per orsak, land eller produkt. Deskriptorn är `SP Baverbutiken.se` och
`SP Matstrumpor.se` — bra, känns igen. Det som saknas står i `ekonomi/LUCKOR.md`.

---

## Extra lektioner i andra Evolve-kurser

P&L, kundanskaffningsspårning, KPI-mål, ROAS-mål, Q4 och Dubai-mastermindet om team och system:
`OVRIGT.md`.
