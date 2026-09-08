# Kluster `djur` — djur hos småhusägaren (hund ute, höns, häst, utekatt, fåglar/vilt, skadedjur)

Körd 2026-09-04 01:00–01:30 UTC. **Läget som styrde körningen:** WebSearch-kvoten var slut (200/200) när
klustret startade, och Temu svarade med tomt JS-skal utan JSON-LD för alla IP-anrop från ~01:00
(bekräftat av koordinatorn 01:10). Därför:

- Listningar hittades via **Seznam** (`search.seznam.cz`, enda sökmotorn som varken blockerade eller
  ignorerade `site:`-operatorn — Bing RSS ignorerar operatorer, DDG/Brave/Startpage/Google/Yahoo/Ecosia/
  Mojeek/Qwant/searx blockerade). Naver gav 1 träff, Sogou 0.
- **Temu-fälten (pris, betyg, recensioner, video, bilder, svensk titel) är `null` i JSON:en** — inte hämtade,
  inte gissade. `video_checked: false`, material = `UNKNOWN — ej hämtad`. Koordinatorn hämtar centralt.
- Gate 1–3 och 6–8 är gjorda på slug-titeln (engelska Temu-URL:en) + svensk hyllkontroll via
  **PriceRunner** och **Granngården** (deras sök fungerar via curl). Biltema/Jula/Clas Ohlson/Rusta
  blockerar (404/Cloudflare/"Client Challenge") — där står "ej direkt verifierad". Utdragen ligger i
  `raw/djur/_pr_out.txt`.
- Tier är **provisorisk**: A/B/ELIM utifrån gate 1–3 + 6–8. Tier A kräver normalt egen frame-granskning;
  den enda A:n nedan är A *förutsatt* att materialet håller — annars B.

---

## (a) Objektuniversumet

| Objekt ägaren har | Skydda / fästa / rengöra / organisera / säkra / underhålla / nå / transportera / få bekvämare | Höstfriktion sep–okt |
|---|---|---|
| **Hunden** (jakthund, gårdshund) | bilens baksäte/bagage (lera, blöt päls), torkning efter promenad, tassar vid dörren, reflex i mörkret, hundgården/kojan inför kylan, koppel vid dörren, bad ute | blöt/lerig hund varje dag, älgjakt okt, mörkt 17:30, kalla nätter i hundgården |
| **Hönsen** (hobbyhöns, ~100 000+ hushåll) | vatten som fryser, foder som råttor tar, luckan i mörkret (räv), värpreden, sittpinne, nät mot hök, regnskydd hönsgård | frost i automaten från okt (Norrland/Svealand), råttor söker foder, luckan måste stängas i mörker |
| **Hästen** (hage, stall) | vattenkar som fryser, saltstenshållare, grindlås, hovtillbehör, täckeshängare, trailer | frost i vattenkaret, leriga hagar |
| **Utekatten** | koja/skydd på trappen inför vintern, kattlucka, vattenskål som fryser | katten sitter blöt på trappen, kalla nätter |
| **Fåglarna på tomten** | fågelmatare mot ekorre/skata, talgbollshållare, frostfritt vatten, fönstermatare | matningen startar oktober, ekorren tömmer mataren dag 1 |
| **Skadedjur** | möss in i förråd/fritidshus, sork/mullvad i gräsmattan, rådjur/hare på buskar, råttor i hönsgården | musinvasionen sep–nov, sork syns när gräset slutar växa, rådjur gnager från nov |

Uteslutet på förhand (klusterregeln): allt som kräver hälso-/veterinärförtroende (kosttillskott, medicin,
fästingmedel, tandvård, sårvård).

## (b) Sökfraserna

68 fraser, alla som `site:temu.com <fras>` mot Seznam (och Naver i omgång 1). Rådata: `raw/djur/_hits.jsonl`.

Omgång 1 (30): heated chicken waterer winter · chicken feeder rat proof treadle · automatic chicken coop door opener ·
chicken nesting box roll away eggs · chicken coop heater winter · poultry netting hawk protection chicken run ·
chicken roosting bar perch · chicken waterer heater base · dog car seat cover hammock back seat · dog drying coat robe microfiber ·
dog paw cleaner washer · dog house door flap insulated · dog led collar reflective vest night · dog leash holder wall mount ·
outdoor heated dog bed pad · dog bath tub outdoor · horse water trough heater deicer · salt lick holder horse ·
horse bucket holder stall · hay net slow feeder horse · cat flap door insulated · outdoor cat house heated winter ·
squirrel proof bird feeder · suet feeder cage bird · heated bird bath deicer · window bird feeder suction ·
mouse trap reusable no poison · deer netting shrub protection winter · vole trap garden · rat bait station outdoor

Omgång 2 (30): chicken coop water heater plate · chicken egg collecting basket · chicken run cover tarp ·
chicken coop automatic door light sensor · poultry drinker nipple bucket · chicken feeder no waste hanging · dog kennel roof cover ·
dog crate cover outdoor waterproof · dog car boot liner cargo · dog paw washer cup · dog towel drying bag · dog reflective harness light ·
dog water bowl heated outdoor · horse trailer tie ring · hoof pick holder · horse stable door guard · horse blanket rack ·
cat door for wall insulated · cat shelter outdoor insulated · bird feeder pole baffle squirrel · bird feeder weather guard dome ·
peanut feeder bird metal · bird bath heater · mole trap tunnel · rat trap heavy duty snap · rabbit fence garden tree guard ·
deer repellent shrub cover · mouse proof storage feed bin · squirrel baffle · frost free water bowl animal

Omgång 3 (8): heated water bucket horse · horse salt block holder · paddock gate latch horse · horse stall fan bucket hook ·
chicken waterer heated 3 gallon · mouse trap bucket lid flip · squirrel proof suet feeder metal · dog car back seat extender platform

**Häst gav noll relevanta Temu-träffar** i tre omgångar (bara kryddkar, termosar, filtstegar). Antingen är
Temus hästsortiment tunt i Seznams index eller så heter det något annat — kör om med koordinatorns sökväg
när WebSearch finns igen. Granngården har kategorin hyllad (saltstenshållare 2–10 kg, Isobar värmebalja 140 L).

## (c) Tratten

| Steg | Föll | Kvar |
|---|---|---|
| Råkandidater (unika goods-id, inkl. ~19 rena sökbrus) | — | **130** |
| Gate 1 OBJEKT (brus, passform, kit, inomhus, N-i-1, el-förtroende) | 55 | 75 |
| Gate 2 PRESENS (sommar: pool, flugor, insekter, grönsaksland, utekran) | 10 | 65 |
| Gate 3 HYLLAN (tassrengörare, hängmattor, el-musfällor, nät, fönstermatare, fågelmatare, burfällor …) | 30 | 35 |
| Gate 5 EKONOMI (hundgårdar, hönshus, träkojor, trampautomat — > 1 000 kr uppskattat) | 9 | 26 |
| Gate 4 MATERIAL | **ej körd** (Temu-block) | 26 |
| Gate 6–8 (variant/hook/publik) — inga hårda fall, men OSÄKER på variant i 5 av 8 koncept | 0 | 26 |
| **Överlevare = 8 produktkoncept** (26 listningar inkl. dubbletter) | | **1 A · 22 B · 4 C** (som listningar) |

De 26 överlevarna fördelar sig på koncept: utekattkoja Oxford (6 listningar), hårdbottnad baksätesförlängare (6),
hundbadrock (4), hopfällbar isolerad hundkoja (1), uppvärmd hönsvattenautomat (1), automatisk hönslucka (3),
ekorrbaffel (1 + stolpkit 1), hinkfälla möss (1), värprede (1), trampfoderautomat (1), sorkfälla (1).

---

## (d) Tier A och B — fältmall per koncept

### A (provisorisk) — Isolerad hopfällbar utekattkoja i Oxford-tyg

- **PRODUCT:** All-weather insulated outdoor cat house, waterproof, foldable, Oxford cloth, stray/outdoor cat shelter
- **TEMU URL:** https://www.temu.com/se/g-601101118338671.html (dubbletter, tier B: 601102077704284 · 601099539458313 · 601104350112825 · 601104350023541 · 601105519310315)
- **OBJECT/OWNER:** utekatten + trappen/altanen/uthuset. Ägaren har katten; kojan står ute hela vintern.
- **EXISTING FRICTION:** katten sitter blöt och kall på trappen, vill in/ut hela kvällen när nätterna går mot noll.
- **OLD WAY:** kartong med filt, öppen garageport, katten i vedboden.
- **PRODUCT'S ROLE:** ett torrt, isolerat ställe utanför dörren — synligt färdigt i en stillbild.
- **WHY THE AD DOES NOT NEED TO CREATE DEMAND:** kylan är här i oktober; varje utekattsägare har redan sett katten på trappen i regnet. Frågan "Har du en utekatt?" räcker.
- **TEMU MATERIAL:** UNKNOWN — ej hämtat (Temu-block). Måste kontrolleras: katt i bild? studio eller trädgård? inbränd text?
- **0–3 SECOND PROOF:** ej granskat.
- **SWEDISH SHELF STATUS:** PriceRunner "kattkoja utomhus": bara trä/plast 1 017–1 468 kr (Kerbl, QLS, VEVOR, Pawhut) + Shein-import 424 kr. Granngården: 0 träffar. Biltema/Jula/Rusta/Clas: ej direkt verifierade. → hyllfrånvaro ~1–2 för tygformen, med synligt ankare Kerbl 1 017 kr.
- **TEMU PRICE:** UNKNOWN (null).
- **PLAUSIBLE SWEDISH PRICE:** 499–599 kr (ankaret ger 1,7–2×).
- **ECONOMIC ROOM:** kräver Temu-pris ≤ ~160 kr för 2,4× vid 599. Ej verifierat. Flerköp: nej (möjligen 2 vid flera katter).
- **VARIANT FRICTION:** en storlek enligt slug — kontrollera `image_descriptions` vid hämtning.
- **≤7 WORD OWNERSHIP HOOK:** "Har du en utekatt?" (4 ord)
- **WINNER-STRUCTURE MATCH:** 78 (utan material och pris; ägd sak ute ✓, presens ✓, hyllfrånvaro ✓ villkorat, en variant ✓, hook ✓, publik ✓ med könsskevhet)
- **TOP 3 REASONS:** (1) exakt B ∧ C2 ∧ E-klustret: objektet står ute, problemet syns i oktober, ingen kedja har tygformen; (2) ankaret 1 000–1 500 kr finns synligt utan att vi behöver sätta det själva; (3) hooken är en ren ägarfråga på 4 ord och katt-på-trappen är omisskännlig i flödet.
- **BIGGEST REASON IT COULD FAIL:** payoffen ("katten använder den") kan inte bevisas i en katalogbild — är leverantörsvideon en tom koja i studio krävs egen film, och då är det B. Plus: köparen är oftare kvinna 45–70 än man.
- **CONFIDENCE:** MEDIUM (LOW tills material och pris är hämtade).

### B — Hinkfälla för möss (flip-lid, självåterställande)

- **PRODUCT:** Reusable auto-reset humane mouse catcher for 5-gallon buckets
- **TEMU URL:** https://www.temu.com/se/g-601100216234049.html
- **OBJECT/OWNER:** förrådet/garaget/fritidshuset + en hink ägaren redan har. Universellt objekt för hela publiken.
- **EXISTING FRICTION:** musinvasionen börjar exakt september–oktober: spillning i förrådet, gnagt i fritidshuset, ljud i väggen. Klustrets starkaste presens.
- **OLD WAY:** slagfällor (en mus, gillra om), gift (går inte med hund/katt), levandefälla som måste tömmas varje morgon.
- **PRODUCT'S ROLE:** locket på hinken tippar musen ner — fångar många utan omgillring. Synligt i 3 sekunder.
- **WHY THE AD DOES NOT NEED TO CREATE DEMAND:** alla med uthus har haft möss i oktober; "Möss i förrådet nu i höst?" pekar bara.
- **TEMU MATERIAL:** UNKNOWN. Leverantörsvideor i kategorin brukar visa fällan som tippar — kontrollera att det är samma fysiska produkt.
- **0–3 SECOND PROOF:** ej granskat.
- **SWEDISH SHELF STATUS:** PriceRunner "musfälla hink": ingen hinkfälla. Slagfällor 24–42 kr, Nyby burfälla 169, Granngården Whippomatic vippfälla (annan form). Jula "hinkfälla" ej verifierad.
- **TEMU PRICE:** UNKNOWN.
- **PLAUSIBLE SWEDISH PRICE:** 299 kr / 2-pack 449 kr (fri frakt-hävstången: förråd + garage + fritidshus).
- **ECONOMIC ROOM:** under 300 kr → fungerar bara med kluster 2 (leverantörsvideo som annons, kostnad ≤ 100 kr). Flerköp: JA, fysiskt skäl.
- **VARIANT FRICTION:** OSÄKER — byggd för amerikansk 5-gallon-hink (Ø ~30 cm); svensk 10 L-hink Ø ~27 cm. Antingen passar den inte, eller så måste vi säga exakt vilken hink.
- **≤7 WORD OWNERSHIP HOOK:** "Möss i förrådet nu i höst?" (5 ord)
- **WINNER-STRUCTURE MATCH:** 68
- **TOP 3 REASONS:** presens 2/2 i launchmånaden; störst publik i klustret (varje fritidshus); flerköp + fri frakt är konstruerbart som spöhållaren.
- **BIGGEST REASON IT COULD FAIL:** hinkpassformen. Passar den inte en vanlig svensk hink är den död.
- **CONFIDENCE:** MEDIUM

### B — Hårdbottnad baksätesförlängare för hund

- **PRODUCT:** Back seat extender for dogs, hard bottom, holds 400 lbs, waterproof
- **TEMU URL:** https://www.temu.com/se/g-601099578348331.html (dubbletter: 601101953587389 · 601102889652570 (pickup) · 606051709617623 · 606422871955299 · 601102892618171)
- **OBJECT/OWNER:** bilens baksäte + jakthund/stor hund.
- **EXISTING FRICTION:** hunden halkar ner i fotbrunnen; lera och blöt päls på sätet varje höstpromenad och under älgjakten (okt).
- **OLD WAY:** filt över sätet, hängmatta som sviktar, hunden i bagaget.
- **PRODUCT'S ROLE:** ett plant, hårt golv över hela baksätet + fotbrunnen — hunden ligger stilla, sätet skyddas.
- **WHY THE AD DOES NOT NEED TO CREATE DEMAND:** jägaren har redan lera i baksätet i oktober.
- **TEMU MATERIAL:** UNKNOWN.
- **0–3 SECOND PROOF:** ej granskat.
- **SWEDISH SHELF STATUS:** kedjorna säljer hängmattan (Teknikproffset 138, Trixie 849, Kurgo 741). Hårdbottenformen finns bara som marketplace-import PJDDP 834–1 167 kr (PriceRunner). → hyllfrånvaro 1 med ankare.
- **TEMU PRICE:** UNKNOWN (troligen 350–600 kr — hårdbotten är dyr).
- **PLAUSIBLE SWEDISH PRICE:** 699–799 kr.
- **ECONOMIC ROOM:** riskerar att hamna > 1 000 kr; skrymmande frakt. Ej verifierat.
- **VARIANT FRICTION:** OSÄKER — "universal XL, passar de flesta" utan mått.
- **≤7 WORD OWNERSHIP HOOK:** "Åker hunden i baksätet?" (4 ord)
- **WINNER-STRUCTURE MATCH:** 62
- **TOP 3 REASONS:** publiken är kontots kärna (man 45–70, kombi/SUV, jakthund); objektet är omisskännligt (hund + bil); ankare finns.
- **BIGGEST REASON IT COULD FAIL:** priset + "passar de flesta". Koordinatorn flaggade kategorin som jämförelsehandlad.
- **CONFIDENCE:** MEDIUM

### B — Ekorrbaffel till fågelmatarstolpe

- **PRODUCT:** Squirrel baffle for bird feeder pole, 16 inch
- **TEMU URL:** https://www.temu.com/se/g-606387388178611.html (stolpkit med baffel, tier C: 606361081495003)
- **OBJECT/OWNER:** fågelmatarstolpen på tomten.
- **EXISTING FRICTION:** ekorren (och skatan) tömmer mataren på ett dygn från första matningsdagen i oktober.
- **OLD WAY:** smörja stolpen, flytta mataren, ge upp.
- **PRODUCT'S ROLE:** en kupa på stolpen som ekorren inte kommer förbi — synlig payoff i 3 sekunder (ekorren glider av).
- **WHY THE AD DOES NOT NEED TO CREATE DEMAND:** ekorre-på-mataren är en universell bild för alla som matar fåglar.
- **TEMU MATERIAL:** UNKNOWN.
- **0–3 SECOND PROOF:** ej granskat.
- **SWEDISH SHELF STATUS:** PriceRunner "ekorrskydd fågelmatare": ingen baffel (bara ekorrmatare Nyby 259 och matare). Granngården: ingen. Naturbutiken ej kontrollerad.
- **TEMU PRICE:** UNKNOWN (troligen 80–150 kr).
- **PLAUSIBLE SWEDISH PRICE:** 299 kr (2-pack 449).
- **ECONOMIC ROOM:** BE-CPA ~150–190 vid 299 — bara med leverantörsmaterial som annons. Flerköp: ja (flera stolpar).
- **VARIANT FRICTION:** OSÄKER — passar stolpar upp till viss diameter; och halva Sverige hänger mataren i ett träd, inte på stolpe.
- **≤7 WORD OWNERSHIP HOOK:** "Tömmer ekorren fågelmataren?" (3 ord)
- **WINNER-STRUCTURE MATCH:** 60
- **TOP 3 REASONS:** ny kategori i svenskt flöde; hook på 3 ord; säsong börjar exakt i launchfönstret.
- **BIGGEST REASON IT COULD FAIL:** objektet (stolpen) ägs inte av alla matare-ägare.
- **CONFIDENCE:** MEDIUM

### B — Hundbadrock/torkrock i mikrofiber

- **PRODUCT:** Dog drying coat, super absorbent microfibre
- **TEMU URL:** https://www.temu.com/se/g-601105260939830.html (dubbletter: 601099574621568 · 601100302415687 · 601102028678747)
- **OBJECT/OWNER:** hunden efter höstpromenaden + hallen/bilen.
- **EXISTING FRICTION:** blöt hund som skakar av sig i hallen, blöt päls i soffa och bil — varje regndag.
- **OLD WAY:** gamla handdukar, hunden låst i hallen.
- **PRODUCT'S ROLE:** rocken på, hunden torr på 20 minuter.
- **WHY THE AD DOES NOT NEED TO CREATE DEMAND:** höstregnet gör jobbet.
- **TEMU MATERIAL:** UNKNOWN. Kroppslig payoff — riktig hund i bild krävs (jfr axelbältet: UGC vann).
- **0–3 SECOND PROOF:** ej granskat.
- **SWEDISH SHELF STATUS:** fackhandeln säljer samma form: Danish Design 319–699, Rukka 349–539, Pomppa 599–1 099, Siccaro (PriceRunner). Ankare Pomppa/Rukka ≥ 1,6× mot 349 kr — bara om vår rock ser ut som Pomppa, inte som ODAWA-importen (191 kr).
- **TEMU PRICE:** UNKNOWN.
- **PLAUSIBLE SWEDISH PRICE:** 349 kr.
- **ECONOMIC ROOM:** kräver Temu-pris ≤ 100 kr. Flerköp vid flera hundar.
- **VARIANT FRICTION:** OSÄKER — storlek efter rygglängd (S–XL): ägaren måste mäta.
- **≤7 WORD OWNERSHIP HOOK:** "Blöt hund efter varje promenad?" (5 ord)
- **WINNER-STRUCTURE MATCH:** 48
- **TOP 3 REASONS:** presens varje dag i sep–okt; billig att testa med captions; ankare finns synligt.
- **BIGGEST REASON IT COULD FAIL:** två förlorarmarkörer på en gång — personlig passform och hyllad form.
- **CONFIDENCE:** MEDIUM

### B — Hopfällbar isolerad hundkoja (Oxford + aluminiumfolie)

- **PRODUCT:** Insulated dog house, all-weather outdoor pet shelter, thermal aluminium foil lining, portable foldable
- **TEMU URL:** https://www.temu.com/se/g-601105490445990.html
- **OBJECT/OWNER:** hundgården på tomten (gårdshund/jakthund som sover ute).
- **EXISTING FRICTION:** kalla nätter från oktober; gamla kojan drar.
- **OLD WAY:** halm, filt, ta in hunden i pannrummet.
- **PRODUCT'S ROLE:** isolerad koja att ställa i hundgården — färdig i en bild.
- **WHY THE AD DOES NOT NEED TO CREATE DEMAND:** rimfrost på hundgården i oktober är bilden.
- **TEMU MATERIAL:** UNKNOWN.
- **0–3 SECOND PROOF:** ej granskat.
- **SWEDISH SHELF STATUS:** PriceRunner "hundkoja isolerad": Northix plast 1 459, Trixie 2 199, Kellfri 2 699, VEVOR 1 810 — ingen tygkoja. Ankare ≥ 1,6× mot 799 kr.
- **TEMU PRICE:** UNKNOWN.
- **PLAUSIBLE SWEDISH PRICE:** 799 kr.
- **ECONOMIC ROOM:** ej verifierat.
- **VARIANT FRICTION:** OSÄKER — storlek efter hund.
- **≤7 WORD OWNERSHIP HOOK:** "Sover hunden ute i höst?" (5 ord)
- **WINNER-STRUCTURE MATCH:** 58
- **TOP 3 REASONS:** rätt publik (man 45–70 på landet med hundgård); ankare 1 459–2 699 kr; objektet omisskännligt.
- **BIGGEST REASON IT COULD FAIL:** trovärdighet — tyg + folie som vinterkoja åt en 30-kilos jakthund kräver förklaring.
- **CONFIDENCE:** MEDIUM

### B — Automatisk hönslucka

- **PRODUCT:** Automatic chicken coop door, remote + manual, USB backup
- **TEMU URL:** https://www.temu.com/se/g-601103331613427.html (dubbletter: 601100041729214 solcell · 601100784585507 solcell/pivot)
- **OBJECT/OWNER:** hönshusets lucka.
- **EXISTING FRICTION:** mörkt 17:30 i oktober — någon måste ut och stänga luckan varje kväll, annars räven; öppna i gryningen.
- **OLD WAY:** ficklampa varje kväll; hönsen instängda till sent på morgonen.
- **PRODUCT'S ROLE:** luckan sköter sig själv.
- **WHY THE AD DOES NOT NEED TO CREATE DEMAND:** mörkret och räven är redan där, och förstärks varje vecka.
- **TEMU MATERIAL:** UNKNOWN.
- **0–3 SECOND PROOF:** ej granskat.
- **SWEDISH SHELF STATUS:** Granngården säljer Kerbl automatisk hönslucka (1 313–1 899 kr på PriceRunner). Samma funktion, annan mekanik (vertikal). Ankare ≥ 1,6× mot 799 — men kategorin är jämförelsehandlad.
- **TEMU PRICE:** UNKNOWN (troligen 250–450 kr).
- **PLAUSIBLE SWEDISH PRICE:** 799 kr.
- **ECONOMIC ROOM:** ej verifierat.
- **VARIANT FRICTION:** en SKU, men funktionsval (fjärr/timer/USB) kräver förklaring.
- **≤7 WORD OWNERSHIP HOOK:** "Vem stänger hönsluckan när det är mörkt?" (7 ord)
- **WINNER-STRUCTURE MATCH:** 50
- **TOP 3 REASONS:** presens som växer varje vecka i oktober; rädslan (räven) finns som i kameran; ankare synligt.
- **BIGGEST REASON IT COULD FAIL:** montering + förklaring + förtroende på en gång — tre negativa-rymd-markörer; kameran klarade det bara med 799 kr och rädsla.
- **CONFIDENCE:** MEDIUM (LOW för solcellsvarianterna — oktoberljus)

### B — Uppvärmd hönsvattenautomat 20 L med termostat

- **PRODUCT:** 5.28 gallon heated chicken waterer, thermostatically controlled, 8 horizontal nipples
- **TEMU URL:** https://www.temu.com/se/g-603266490408979.html
- **OBJECT/OWNER:** hönshusets vattenautomat.
- **EXISTING FRICTION:** vattnet fryser — hönsen utan vatten på morgonen, ägaren bär ljummet vatten två gånger om dagen.
- **OLD WAY:** bära vatten, byta automat, Kerbl värmeplatta under automaten.
- **PRODUCT'S ROLE:** automaten håller sig frostfri själv.
- **WHY THE AD DOES NOT NEED TO CREATE DEMAND:** från ~10 oktober i Svealand/Norrland är isen i automaten ett faktum — men i **september är skadan framtida** (doc: "framtida skada (frost)" = ELIMINERA). Gränsfall.
- **TEMU MATERIAL:** UNKNOWN.
- **0–3 SECOND PROOF:** ej granskat.
- **SWEDISH SHELF STATUS:** Granngården: Kerbl värmeplatta 15 W + Willab värmeskål 3 L (andra former). PriceRunner: ingen integrerad uppvärmd 20 L-automat; ouppvärmd 20 L 479 kr.
- **TEMU PRICE:** UNKNOWN — US-listning, troligen 400–600 kr → SE-pris > 1 000 kr.
- **PLAUSIBLE SWEDISH PRICE:** okänt; över 1 000 kr har ingen vinnare legat.
- **ECONOMIC ROOM:** sannolikt FAIL, ej verifierat.
- **VARIANT FRICTION:** en storlek, men **nätspänning/kontakt** (US 110 V?) måste kontrolleras i bilderna — fel kontakt = FAIL.
- **≤7 WORD OWNERSHIP HOOK:** "Fryser hönsens vatten på natten?" (5 ord)
- **WINNER-STRUCTURE MATCH:** 45
- **TOP 3 REASONS:** hyllfrånvaro för formen; hook; hönshus omisskännligt.
- **BIGGEST REASON IT COULD FAIL:** pris och spänning — två okända som var för sig fäller. Plus el + vatten = förtroende.
- **CONFIDENCE:** LOW

---

## (e) Lärorika Tier C-/ELIM-avslag

1. **Trampfoderautomat i galvaniserat stål (602525247862818) — C, ekonomi.** Perfekt objekt (hönsgården), perfekt presens (råttorna
   kommer i september), hook på 4 ord — men formen finns som marketplace-import (vidaXL 625–1 113, VEVOR 1 016) och en 18-kilos
   stålautomat landar över 1 000 kr. Lärdom: **vikt är en gate**. Tunga Temu-produkter klarar aldrig 2,4× under 1 000 kr.
2. **Elektroniska musfällor (601099584111541 m.fl.) — ELIM, hyllan.** Samma presens som hinkfällan, men Willab 369, Victor 399 och
   Kvitt 399 står på PriceRunner och Granngården — samma form, inget ankare 1,6×. Lärdom: när kategorin är hyllad räddar inte
   säsongen; det är **formen** som måste saknas (hinkfällan) — inte problemet.
3. **Tassrengörare (fyra listningar) — ELIM, hyllan + pris.** Koordinatorn listade den som "tassrengöring vid dörren" och presensen
   är dagligen i höst. Men PriceRunner har tio varianter 79–149 kr, och den är "köpt old way som fungerar ∧ jämförelsehandlad ∧
   < 300 kr" — 30 % av förlorarna, 0/9 vinnare. Lärdom: **problemet som finns hos alla ägare säljs redan till alla ägare.**
4. **Automatisk vattenskål på utekranen (601100832469026) — ELIM, presens.** Träffade på "frost free water bowl" men kopplas på
   slangkranen som stängs i oktober. Lärdom: kontrollera **vad produkten fäster på** — inte bara vad titeln lovar.

## Vad koordinatorn behöver göra centralt (i denna ordning)

1. `temu-ld.py` på **601101118338671** (A) och de sju B-koncepternas primär-id: 601100216234049 · 601099578348331 · 606387388178611 ·
   601105260939830 · 601105490445990 · 601103331613427 · 603266490408979 — pris, variantnamn, video.
2. Materialgaten (frames 0–3 s) på samma åtta. Kattkojan: finns en katt i bild? Hinkfällan: samma produkt i video som i listning?
3. Sen dubbletterna bara om primären håller.
