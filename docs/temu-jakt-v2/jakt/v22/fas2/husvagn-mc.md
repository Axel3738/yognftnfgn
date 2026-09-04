# Kluster `husvagn-mc` — husvagn, husbil, släp, MC, moped, ATV (FAS 2, 2026-09-04)

**Resultat: Tier A 0 · Tier B 1 koncept med 2 listningar · Tier C 3 · ELIM 64.**
69 råkandidater ur 40 Temu-sökfraser + 9 hyllsökningar. En listning (`601099609840730`) stod
redan i `kanda-goods-id.txt` och är märkt `already_known: true`.

## Datavarning — läs innan du tolkar gate 3 och gate 5

Två källor var nere. **Båda är tekniska fel, aldrig kommersiella** (V2.1 statusmodell):

1. **WebSearch-budgeten var slut** (200/200 för sessionen) efter fyra hyllsökningar. Resten av
   sökandet gjordes via Seznam (`curl`), exakt som `DATAVAGAR.md` föreskriver. Seznam hittar
   Temu-listningar utmärkt men **indexerar inte svensk detaljhandel på produktnivå** — testat med
   `site:jula.se`, `site:biltema.se` och fyra svenska produktfraser, alla gav toppsidor eller skräp.
2. **Kedjorna svarar inte på direktanrop.** biltema.se ger Akamai `Access Denied` (403) på varje
   produktväg, jula.se 403, rusta.com 404. Clas Ohlson svarade (0 träffar på "husvagn").
   Mojeek 403, Brave 429, Ecosia 403, Startpage JS-utmaning, Yahoo 500 — ingen ersättare finns.

**Konsekvens:** gate 3 mot Biltema/Jula/Rusta är `PENDING_VERIFICATION` på överlevarna, aldrig
`PASS`. Fackhandeln gick däremot att läsa i sin helhet (GetCamping sitemap + produktsidor), så
märkesankarna nedan är verifierade med pris och URL. Gate 5 (MATERIAL) är `BLOCKED_SOURCE` på
samtliga: temu.com/se svarar med tomt skal — verifierat i dag på `g-601101311828193`, där `<title>`
blev Temus startsida i stället för produktnamnet.

---

## (a) Objektuniversumet jag jobbade från

Byggt ur uppdragets lista, utökat med ägarnas egna höstchecklistor
(Campingvaruhuset "Tänk på detta vid vinterförvaring", Husvagn.se "Bästa tipsen vinterförvaring")
— alltså friktionen i ägarens egna ord, inte i mina.

| Objekt (ägt, står ute sept–okt) | Vad ägaren gör med det NU | Kandidatform |
|---|---|---|
| **Husvagnen** som ställs upp för vintern | tvättas, taket rensas från löv och barr, täcks | taköverdrag, helöverdrag, frontskydd |
| — dess **tak** | löv/barr/mossa ligger kvar till april; svarta streck på sidorna | taköverdrag, teleskopborste |
| — dess **ventiler och golvgenomföringar** | möss söker sig in när det blir kallt | ventilnät, gnagarskydd, ultraljudsskrämma |
| — dess **taklucka** | löv i ramen, UV och hagel | utvändigt takluckeskydd |
| — dess **stödben** | vevas ner, ska inte sjunka i marken | stödbensplattor, pallbockar, borradapter |
| — dess **däck** | plattas av stillaståendet | däckskydd, avlastningsramper |
| — dess **batteri** | kopplas ur, ska underhållsladdas utan eluttag | solcellsladdare, underhållsladdare |
| — dess **färskvattentank** | töms, blåses ur inför frosten | tryckluftsadapter |
| — dess **markis** | rullas ut för att torka, annars mögel | stormband, markisstöd |
| — **draget och dragkroken** | skyddas | dragskydd, kulskydd, kulkopplingslås |
| — **gasoltuben** | stängs, tas ur, ska hållas torr | flasköverdrag, nivåmätare |
| **Husbilen** på uppställningsplatsen | samma som ovan + hytten | *(vindruteskydd är redan avgjort)* |
| **Släpvagnen/kärran** | används mest nu (löv, ved, flytt), står sedan ute | kapell, lastnät, rangerhjälp |
| **MC:n** som ställs av | in i garaget, batteriet ur, avgasröret pluggas | *(kapell redan fällt)*, plugg, laddare |
| **Mopeden** som pendlar i kylan | benen fryser från september | benskydd/körförkläde, styrmuffar |
| **ATV:n/fyrhjulingen** | står ute vid gård/fritidshus, används i jakten och till ved | *(kapell, box, gevärshållare avgjorda)*, sadelöverdrag, lastkorg |
| **Snöskotern** som ska fram | står på släpet till snön kommer | *(fälld på presens: säsongen börjar i december)* |
| **Hjälmen, kedjan, kapellet, batteriladdaren** | garagearbete | *(faller i gate 1: förvaras inomhus)* |

**Utökningar jag gjorde själv och som gav resultat:** husvagnstaket som egen yta (skilt från hela
vagnen), husvagnens frontskydd som egen produktkategori, gnagarskydd som höstfriktion, och
uppställningsplatsen utan eluttag som skäl till solcellsladdning.

## (b) Sökfraserna

**40 Temu-fraser** (alla `site:temu.com` via Seznam, 2026-09-04):

caravan awning storm strap tie down kit · rv roof vent cover rain vented · rv vent screen rodent
mesh camper insect · trailer cover waterproof oxford utility trailer heavy duty · atv quad seat
cover waterproof protector · propane gas bottle level indicator gauge magnetic · atv utv seat cover
oxford 600d quad · rv leveling blocks jack pad camper stabilizer · atv rear rack cargo basket carrier
steel · scooter leg cover apron windproof winter motorcycle · towing mirror extension clip on caravan
car · caravan roof top cover tarp motorhome protection · rv roof cover travel trailer camper protector
· propane tank cover gas bottle cover outdoor waterproof · solar battery maintainer trickle charger
12v · trailer tarp cover cargo straps mesh dump · atv utv cover heavy duty 210d oxford quad waterproof
· caravan hitch coupling cover jockey wheel · rv roof vent lid cover replacement camper · atv seat
cover camo quad bike waterproof cushion · caravan awning cleaning tool rv · trailer wheel chock ramp
tire flat spot storage · motorcycle scooter windshield wind deflector universal · rv gutter spout drip
awning rail · rv refrigerator vent cover winter camper fridge · rv skylight cover protector roof vent
shield · atv jerry can fuel holder mount rack universal · trailer stabilizer jack drill socket adapter
19mm · rv awning anti flap clamp stabilizer kit · trailer dolly mover wheel hand caravan · rv cover
motorhome caravan waterproof travel trailer camper oxford · caravan front cover protection stone guard
towing rv front · rv cover 20ft 24ft camper trailer waterproof anti uv · towing mirror extension
universal car caravan trailer · trailer corner steady stabilizer foot plate pad caravan · camper rv
winter storage cover protection kit · moped scooter cover waterproof outdoor storage dust · utility
trailer cargo cover waterproof tarp mesh net · rv tire wheel cover sun protection 4 pack trailer ·
atv utv rear rack bag storage waterproof cargo quad

**Åtta fraser gav noll Temu-träffar** och är i sig ett fynd — kategorin finns inte på Temu:
markisstormband, husvagnens kulkopplingsskydd/näshjul, stödbensplattor på ägarens ord,
borradapter till stödben, markisens vindstopp, husvagnsspeglar (två varianter), kärrkapell med nät.

**9 hyllsökningar (gate 3):** sätesöverdrag fyrhjuling ATV biltema jula · teleskopborste husvagn
tvättborste vattenslang biltema jula · gnagarskydd musnät husvagn ventilation vinterförvaring ·
markisstöd stormband husvagn tie down kit pris · clasohlson.com sök "husvagn" · clasohlson.com sök
"överdrag husvagn" · getcamping.se sitemap + kategorin `/ovriga-tillbehor/overdrag/` ·
getcamping.se EuroTrail-produktsidan · direktanrop biltema.se / jula.se / rusta.com (403/404).

**3 publiksökningar (gate 9):** husvagnar i trafik Trafikanalys · terränghjulingar/fyrhjulingar
Trafikanalys · Trafikverkets fyrhjulingssida.

## (c) Tratten

**LISTNINGS-TRATTEN (69 råkandidater):**

| Gate | Föll | Kvar |
|---|---|---|
| Råkandidater | — | 69 |
| 1 OBJEKT | 33 | 36 |
| 2 PRESENS | 2 | 34 |
| 3 SVENSKA HYLLAN | 12 | 22 |
| 4/5 MATERIAL | 0 (**alla `BLOCKED_SOURCE`**) | 22 |
| 6 EKONOMI | 14 | 8 |
| 7 VARIANT | 6 | 2 |
| 8 HOOK | 0 | 2 |
| 9 PUBLIK | 0 | **2** |

**KONCEPT-TRATTEN (23 formulerade koncept):**

| Steg | Föll | Kvar |
|---|---|---|
| Koncept formulerade | — | 23 |
| 1 OBJEKT (avfuktare = förbrukning, kylbox = inomhus, bilinredning) | 3 | 20 |
| 2 PRESENS (myggnät, tryckluft mot frost i november, markisens stormband) | 3 | 17 |
| 3 HYLLAN (takrengöring, uppställningsstöd, batteriunderhåll, MC-/ATV-kapell, musskrämma) | 5 | 12 |
| 4 LISTNINGSJAKT — **koncept utan listning** (ATV-sadelöverdrag, husvagnsfrontskydd, husvagnsspeglar, ventilnät i husvagnsmått) | 4 | 8 |
| 5 MATERIAL | 0 | 8 |
| 6 EKONOMI (gasol, moped-benskydd, rangerhjälp, förvaringstält, kyla) | 5 | 3 |
| 7 VARIANT (takluckeskydd i tum, MC-vindruta per modell) | 2 | 1 |
| 8 HOOK / 9 PUBLIK | 0 | **1** |

De fyra koncept som föll i steg 4 är inte döda: de har status `ALTERNATIVE_LISTING_REQUIRED`.
Konceptet håller, listningen saknas.

---

## (d) Tier B — full fältmall

### B1. Taköverdrag / skyddsöverdrag för husvagn och husbil
**Koncept-id `husvagn-takoverdrag` · listningar `601101311828193` (primär) och `601102273698057` (alternativ)**

- **PRODUCT:** *1pc of RV roof cover designed for motorhomes, travel trailers and buses, offering
  UV and sun protection, suitable for RVs measuring between **5 to 12 meters***.
  Alternativ listning: *patio outdoor RV cover, anti-sunshade, heavy duty waterproof oxford fabric
  for motorhome protection, foldable, easy to installation, RV trailer cover*.
- **TEMU URL:** https://www.temu.com/se/g-601101311828193.html ·
  alternativ https://www.temu.com/se/g-601102273698057.html
- **OBJECT / OWNER:** Husvagnens och husbilens tak respektive hela karossen. Ägaren är man 45–70 med
  småhus eller fritidshus som ställer upp ekipaget på uppställningsplats, gårdsplan eller tomt.
- **EXISTING FRICTION:** Uppställningen sker **just nu**. Taket är den enda ytan ägaren inte når:
  löv, barr och vatten ligger kvar från oktober till april, och det är därifrån de svarta och gröna
  strimmorna på sidorna kommer. Ägarens egen checklista säger ordagrant "ta bort skräp, löv och
  insekter från tak, ventiler och lister" och rekommenderar "andningsbart överdrag"
  (Campingvaruhuset, Husvagn.se). Friktionen är fotograferbar på vilken svensk uppställningsplats
  som helst den här månaden.
- **OLD WAY:** Presenning med spännband som blåser av, eller ingenting alls. Alternativet är inhyrd
  inomhusförvaring. Ren improvisation — mönster 4 i DNA:t (G ∧ D).
- **PRODUCT'S ROLE:** Träs över, spänns fast, och vagnen är klar för vintern på tio minuter. Samma
  "trä på och glöm"-mekanism som motorhöljet och sätesöverdraget, kontots två största vinster.
- **WHY THE AD DOES NOT NEED TO CREATE DEMAND:** Vagnen står redan där. Hooken är en ren ägarfråga,
  och husvagnen är omisskännlig i ett Meta-flöde — samma CPM-proxy som utombordaren och
  åkgräsklipparen.
- **TEMU MATERIAL:** `BLOCKED_SOURCE`. Bilder och leverantörsvideo går inte att se (temu.com svarar
  med tomt skal, verifierat i dag). **Indicium, inte bevis:** titeln säljer på UV- och solskydd, inte
  på fukt — det är ett titel-nytto-gap av exakt IBC-typ (leverantören vet inte vad han säljer i
  Sverige, alltså har ingen konkurrent positionerat sig heller). Den alternativa listningen har
  **99+ recensioner och 4,6/92 %**, den starkaste kommersiella signalen i hela klustret.
- **0–3 SECOND PROOF:** Ej sedd. Kategorinormen är hopvikt överdrag i påse + en hero på fordonet.
- **SWEDISH SHELF STATUS:** `PENDING_VERIFICATION`. **Ingen kedja kunde kontrolleras** (403/404).
  Clas Ohlson: 0 träffar på "husvagn". Fackhandeln är däremot helt kartlagd och har en egen
  kategori för formen, utan en enda kedja i den:
  | Produkt | Pris |
  |---|---|
  | **EuroTrail Husvagnsöverdrag** (450–800 cm, 3-lager SFS 160 g/m²) | **2 395 kr** |
  | EuroTrail Husvagns- & husbilsöverdrag | 1 599 kr |
  | Brunner Husbilsöverdrag | 2 999 kr |
  | Hindermann Frontskydd Supra Universal | 2 195 kr |
  | Hindermann Wintertime Frontskydd | 1 145 kr |
  | Hindermann Takdistans / Hörnskydd | 1 230 / 995 kr |
  Källa: https://www.getcamping.se/husvagns-husbilstillbehor/ovriga-tillbehor/overdrag/ (läst 2026-09-04).
  **Ankaret är 1 599–2 395 kr = 1,8–3,0× vårt tänkta pris** — undantagsregeln i gate 3 är uppfylld
  med marginal, förutsatt att ingen kedja visar sig ha formen.
- **TEMU PRICE:** 25 USD respektive 28 USD, ur Seznams sökutdrag 2026-09-04 (`price_source:
  seznam-snippet`). Svenskt Temu-pris okänt — kalibreringen nedan är `us-proxy`.
- **PLAUSIBLE SWEDISH PRICE:** **799 kr** (taköverdraget) / **899 kr** (helöverdraget).
- **ECONOMIC ROOM:**
  | | 601101311828193 | 601102273698057 |
  |---|---|---|
  | Temu USD | 25 | 28 |
  | SE-Temu (×6,96–8,16) | 174–204 kr | 195–228 kr |
  | Landad (×1,5) | **261–306 kr** | **292–343 kr** |
  | Svenskt pris | 799 kr | 899 kr |
  | Uppslag | **2,61–3,06×** | **2,62–3,08×** |
  | BE-CPA | **493–538 kr** | **556–607 kr** |
  Båda ligger i zonen över 500 kr, som aldrig har förlorat i kontot, och landad kostnad är långt
  under 420 kr-stoppet. Inget flerköpsskäl (en vagn, ett skydd); priset ligger långt över
  fri-fraktgränsen.
- **VARIANT FRICTION:** Titeln anger **5–12 meter**, inte fot — och den svenska fackhandeln säljer
  exakt samma parameter (EuroTrail har 450, 500, 550, 600, 650, 700, 750, 800 cm). Husvagnsägaren
  kan sin längd utantill. Det är gate 7 i sin bästa form. Variantlistan i listningen är dock oläst
  (blockerad källa), så själva SKU-uppsättningen är `UNKNOWN`.
- **≤7 WORD OWNERSHIP HOOK:** **"Står husvagnen ute i vinter?"** (5 ord).
  Alternativ: "Har du löv på husvagnstaket?" (5 ord).
- **AUDIENCE:** **283 840 husvagnar i Sverige, varav 167 496 i trafik och 116 344 avställda (2024)**
  — Husvagn & Camping 2026-01-16 med Trafikanalys som källa. Avställda husvagnar har vuxit från
  96 459 (2015) till 116 344 (2024): den avställda vagnen är inte ett undantag, den är en fjärdedel
  av beståndet och den står ute. Husbilarna kommer utöver detta (siffran är omtvistad: förra
  körningen skrev 94 000 ur Midland.se, en nyhetssammanfattning i dag angav ~300 000 registrerade —
  **jag sätter husbilssiffran till `UNKNOWN`** och låter husvagnen ensam bära gaten). PASS.
- **WINNER-STRUCTURE MATCH:** **72/100** (B1) / 64/100 (alternativ). Ägt objekt ute ✅ · presens ✅ ·
  hyllfrånvaro med ankare ✅ (kedjan overifierad) · variantparameter ägaren kan ✅ · hook ✅ · publik ✅ ·
  material okänt ❔ · prisutrymme ✅.
- **TOP 3 REASONS:** (1) Det är kluster 1 i DNA:t rakt av — problemet finns nu, saken står ute, och
  formen finns inte i någon kedja. (2) Prisutrymmet är det bästa i hela klustret: BE-CPA 493–607 kr
  mot ett synligt fackhandelsankare på 2 395 kr. (3) Varianten är husvagnens längd i meter — den enda
  parametern i hela klustret som ägaren kan utantill och som inte är i tum.
- **BIGGEST REASON IT COULD FAIL:** Att Biltema eller Jula har ett husvagnsöverdrag under 700 kr.
  Det är exakt det mönster som fällde 19 av 34 kandidater i förra husvagnskörningen, och det gick
  **inte** att kontrollera i dag. Näst största risken: 25 USD är misstänkt lite för ett skydd till en
  vagn på 5–12 meter — produkten kan vara både tunnare och mindre än titeln antyder, och materialet
  är osett.
- **CONFIDENCE:** **LOW** (hylla mot kedjorna overifierad, material och variantlista osedda,
  priset är US-proxy).

---

## (e) Lärorika Tier C-avslag

**1. Takluckeskyddet `601099609840730` — tummen är klustrets tysta fälla.**
$12, 4,9/98 %, 99+ recensioner, rätt objekt, rätt ägare, rätt månad, och ingen kedja i kategorin —
fackhandeln har den (Beisel överdrag taklucka 50×50 cm, Fiamma Thermovent). Ändå död: listningen är
**14 × 14 tum = 35,6 cm**, medan svenska husvagnar har Dometic Mini Heki **40 × 40 cm** eller
Beisel **50 × 50 cm**. Måtten möts aldrig. Samma fälla sitter i hela RV-hyllan på Temu (vent lids,
skylight covers, jack pads i tum) eftersom sortimentet är byggt för amerikanska husbilar.
Id:t stod dessutom redan i `kanda-goods-id.txt`. **Lärdom: i det här klustret ska varje mått i
listningstiteln läsas som en gate-7-fråga innan något annat görs — meter och centimeter passerar,
tum fäller.**

**2. Gnagarskyddet `606232433763454` — rätt friktion, fel bärare.**
Möss i den uppställda husvagnen är den mest omtalade höstfriktionen som finns: Folksam har en egen
sida om gnagarskador på bil, husbil och husvagn, och båda ägarguiderna varnar för gnagda kablar.
Old way är ren improvisation (stålull i hålen, fällor). Ekonomin håller till och med — 399 kr på en
landad kostnad av 73–86 kr ger 4,7×. Ändå avslag: **formen finns redan billigt** som meterrulle och
färdiga ventilnät hos Granngården, stick.se och skadedjursbutikerna, kedjorna säljer fällor och
ultraljudsskrämmor, och just den här listningen är ett **badrumsgaller**, inte en husvagnsprodukt.
Konceptet lever vidare som `ALTERNATIVE_LISTING_REQUIRED`: det som saknas är ett färdigt ventilnät i
husvagnsmått. **Lärdom: en stark friktion räcker inte — den måste bäras av en form som inte redan
ligger i en svensk hylla.**

**3. Moped-benskyddet `601102448955955` — ekonomin faller innan publiken hinner göra det.**
$34 för ett körförkläde som monteras på mopeden. Objektet är ägt, kylan finns nu, kedjorna saknar
kategorin och Tucano Urbano är ett synligt märkesankare. Men landad kostnad blir 355–416 kr, och
2,4× i båda ändarna kräver då ett pris **över 1 000 kr-taket**: vid 899 kr blir uppslaget bara
2,16–2,53×. Bakom det ligger ett andra fel — scooterpendlaren är inte man 45–70 med småhus.
**Lärdom: räkna landad kostnad före du bedömer publiken. Ett koncept som kräver ett pris över taket
för att nå 2,4× är dött oavsett hur bra de andra sju gaterna ser ut.**

---

## Vad som återstår (för nästa körning eller när blocket släpper)

1. **Fyra kedjesökningar som avgör B1:** "husvagnsöverdrag" och "taköverdrag husvagn" mot
   biltema.se, jula.se, rusta.com, clasohlson.com. Faller den där är hela klustret tomt; håller den
   är B1 en Tier A-kandidat med 799 kr och motorhöljets annonskropp.
2. **Hämta `601101311828193` och `601102273698057`** via den centrala kön: svenskt pris, betyg,
   variantlista (meter eller "universal"?) och framför allt heron — är det en hopvikt påse i studio
   eller ett överdrag på en vagn i kontext?
3. **Fyra koncept väntar på en listning** (`ALTERNATIVE_LISTING_REQUIRED`): ATV-sadelöverdrag
   (fackhandeln har det, Temu har bara bilsätesöverdrag), husvagnens frontskydd (ankare 1 145–2 195 kr,
   noll Temu-träffar), husvagnsspeglar för dragning, och ventilnät i husvagnsmått.
4. **Publiksiffran för husbil måste fastställas** — 94 000 (Midland.se, förra körningen) och
   ~300 000 (nyhetssammanfattning i dag) kan inte båda stämma. Husvagnen bär gaten ensam så länge.
