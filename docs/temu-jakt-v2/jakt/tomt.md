# Kluster `tomt` — altan/trädäck, uppfart, grind/staket, brevlåda, sopkärl, utemöbler, flaggstång, snö

Körd 2026-09-04. **Läge:** Temu blockerade IP:n mitt i körningen (alla temu-ld.py-svar = tomt skal utan JSON-LD, även efter 5 min paus; WebFetch mot produktsidor gav samma). Koordinatorn tar Temu-hämtning + materialgaten centralt. Därför är **alla Temu-fält null**, `video_checked: false`, material = "UNKNOWN — ej hämtad", och tiers är **provisoriska** på gate 1–3 + 6–8. WebSearch-budgeten (200/session) tog slut efter 12 sökningar — resten av objektuniversumet är sökt via Temus egna söksidor (WebFetch, fungerade i 6 av ~17 anrop innan även de blockerades).

Svenska hyllan gick inte att verifiera via kedjornas sajter (Biltema 404, Jula 403, Clas Ohlson/Hornbach JS-skal, Rusta 404, Bauhaus Algolia). **Enda verifierade hyllträffen:** Granngården (curl, 447 kB) listar fyra snökäppar (Bergman Plast PP 200 cm, Millarco WorkIT PP 200 cm, Millarco bambu 180 cm 10-p, Provia bambu 180 cm). Allt annat under "hyllan" är märkt *ur minne, ej verifierad*. Amazon.de (curl) gav 28 träffar för "Mülltonnenverschluss" 10–43 USD → kategorin sopkärls-locklås finns i EU-marknaden.

## (a) Objektuniversumet

| Objekt | Ägaren behöver … | Sökt? |
|---|---|---|
| **Sopkärlet** (1,9 M hushåll, vid gatan, kommunägt) | säkra locket mot vind/fåglar/räv · laga gångjärn · dölja (skjul) · dofter · handtag/dra · sortering | lock-lås ✅, gångjärn ✅, skjul ✅, doft ✅ (bara inomhuskärl hittades), handtag ❌ (budget) |
| **Brevlådan** | låsa · reflexnummer · snöskydd · stolpe/stolpskydd | lås ✅, nummer ✅, snöskydd ✅ (bara dekor-överdrag), stolpskydd ✅ |
| **Flaggstången** (tydlig ägarklass) | ny lina · hjul/knopp · knap · vimpel · ljuddämpa smällande lina | lina/kit ✅, knap ✅, vimpel ❌, linstopp ❌ |
| **Grinden** | stänga själv · lås/magnetlås · gångjärn | fjäderstängare ✅, magnetlås ❌ (blockerad), gångjärn ❌ |
| **Uppfarten** | markera kant inför plog · parkeringsstopp · sand/salt · isskrapa | snökäppar ✅, fjädrande stolpar ✅, parkeringsstopp ✅, spridare ✅, isskrapa ✅ |
| **Snö/tak** | taksnöraka · snöskyffel på hjul · snörasskydd | takraka ✅, skyffel ✅, snörasskydd ❌ |
| **Utemöblerna** | skydd inför vintern · bänkskydd | ✅ |
| **Altanen/trätrappan** | halkskydd på vått trä · räckesskydd · belysning utan el · lövsopning | halkskydd ✅ (alu-list + tejp), belysning ❌ (blockerad), räcke ❌, lövsamlare ✅ |

## (b) Sökfraser

WebSearch (12, sedan slut): `site:temu.com trash can lid lock raccoon garbage bin` · `wheelie bin wheels replacement 240L` · `parking stop wheel stopper driveway` · `garbage can deodorizer bin odor wheelie` · `wheelie bin lid lock strap wind` · `mailbox lock post mount outdoor` · `flagpole rope halyard clip cleat` · `gate closer spring self closing latch outdoor` · `driveway marker reflective snow stake` · `roof snow rake removal tool` · `patio furniture cover waterproof winter` · `deck anti slip strips outdoor stairs wood`.
Temu-söksidor via WebFetch (fungerade): `wheelie bin accessories` · `wheelie bin lid strap` · `snow shovel` · `ice scraper car` · `mailbox post accessories` · `mailbox snow cover` · `leaf scoops grabber` · kategorisidan `flagpole-clips-5020009954551-s`. Blockerade: `gate latch`, `solar fence post light`, `deck railing solar light`, `outdoor stair nosing anti slip`, `wheelie bin`, `trash can lid strap`, `roof snow rake`, `driveway snow stakes`, `flagpole rope replacement kit`, `outdoor trash can lid lock`.

## (c) Tratten

| Gate | Kvar | Föll |
|---|---|---|
| Råkandidater (unika listningar; dubbletter av samma produkt slogs ihop i `sources`) | 27 | — |
| 1 Objekt | 26 | 1 (US-brevlådeöverdrag) |
| 2 Presens | 20 | 6 (gångjärnspinnar, knap, stolpskydd-trimmer, handspridare, takraka, snöskyffel) |
| 3 Hyllan | 8 | 12 (låsbar brevlåda, flaggstångskit, flagglina, 2× grindfjäder, snökäppar fiberglas, parkeringsstopp, isskrapa, 2× möbelskydd, halktejp, sopkärlsskjul) |
| 5 Ekonomi (titelpris) | 6 | 2 (lövsamlare 181 USD, brevlådesiffror < 199 kr) |
| 4 Material | **ej körd** (Temu-block) | — |
| 6–8 Variant/hook/publik | 6 PASS/OSÄKER | 0 |
| **Tier** | **A 0 · B 3 (samma produkt, tre listningar) · C 4 · ELIM 20** | |

## (d) Tier B — sopkärls-locklås (rem)

Tre listningar av samma produkt: `601101587576926` (rem med spänne, 80–130 cm), `601099601018284` (bungee), `605655280787928` (2-pack). Fältmallen nedan gäller alla tre; rem-med-spänne är förstahandsvalet.

- **PRODUCT:** Justerbar nylonrem med spänne som håller sopkärlets lock stängt (Temu: "Heavy Duty Trash Lock with Adjustable Strap, Windproof, Animal-Proof, No Tools").
- **TEMU URL:** https://www.temu.com/se/g-601101587576926.html (alt. …g-601099601018284, …g-605655280787928)
- **OBJECT / OWNER:** Det kommunala sopkärlet (140–370 l) som står vid tomtgränsen hos ~1,9 M småhus. Samma objekt som soptunneklistermärkena — kontots bevis på att kärlet fungerar som igenkänningsobjekt i flödet (58 % kvinnor 55+, 199 kr, vinnare).
- **EXISTING FRICTION:** Höststormar (sep–nov) blåser upp locket → regn i kärlet, blöta tunga påsar; kråkor/skator/måsar/räv drar ut matavfallspåsar och sprider dem på uppfarten.
- **OLD WAY:** Tegelsten på locket, gummisnodd/spännband från Biltema, eller inget.
- **PRODUCT'S ROLE:** Håller locket stängt tills ägaren lossar remmen på hämtdagen.
- **WHY THE AD DOES NOT NEED TO CREATE DEMAND:** Den som haft locket uppblåst eller sopor på uppfarten svarar ja på frågan direkt. ⚠️ Men: problemet är inte dagligt och fyrfackskärl (tunga lock) blåser sällan upp — presens är PASS för en *delmängd*, inte hela klassen.
- **TEMU MATERIAL:** UNKNOWN — ej hämtad (block). US-listningarnas hero visar tvättbjörn ("raccoon") — fel djur för Sverige; behöver caption/klipp utan djuret om videon bygger på det.
- **0–3 SECOND PROOF:** UNKNOWN — ej granskad.
- **SWEDISH SHELF STATUS:** OSÄKER. Ur minne: ingen av Biltema/Jula/Clas Ohlson/Rusta säljer locklås-rem för sopkärl (ej verifierad idag, 403). Amazon.de: 28 träffar → EU-kategori finns. Hyllfrånvaro-poäng 1–2.
- **TEMU PRICE:** null (ej hämtad). Söksidan visade 136,59 USD för 2-packet — orimligt, troligen valutabugg, ej litad. DE-marknad 10–20 USD.
- **PLAUSIBLE SWEDISH PRICE:** 249 kr styck / **299 kr 2-pack** (strax under fri-fraktgränsen — samma hävstång som spöhållaren 289).
- **ECONOMIC ROOM:** UNKNOWN tills Temu-pris finns. Gissning (märkt gissning): landad 60–90 kr → 2-pack 299 kr = 1,7–2,5× per styck men BE-CPA ≈ 130–180 kr — **under 190-kravet om landad > 110 kr per pack**. Flerköpsskäl: fyrfackssystem/matavfall ger 2–4 kärl per hushåll.
- **VARIANT FRICTION:** Låg — en justerbar rem. (601099530267994 passar bara 115–190 l → utesluter 240/370 l, därför tier C.)
- **≤7 WORD OWNERSHIP HOOK:** "Blåser locket upp på soptunnan?" (6 ord)
- **WINNER-STRUCTURE MATCH:** 62 (objekt ute + ägarfråga + flerköp + hyllfrånvaro trolig; minus presens-delmängd och hämtdagsbeteende).
- **TOP 3 REASONS:** (1) Objektet är bevisat i kontot och omisskännligt i bild. (2) Ägarfrågan skriver sig själv och självselekterar. (3) 2-pack under fraktgränsen + hyllfrånvaro ger annonsen prisankaret.
- **BIGGEST REASON IT COULD FAIL:** Remmen måste lossas varje hämtdag (sopbilens lyft öppnar locket med tyngden — låst lock = kärlet töms inte). Det gör produkten till ett veckovis handgrepp, och recensioner om "glömde lossa, missade hämtningen" dödar den.
- **CONFIDENCE:** LOW (material + pris + hylla ej verifierade).

## (d) Tier C (fullständig mall bara där den tillför något)

**Fjädrande rostfria reflexstolpar 4-pack — `601100230272566`.** Objekt: uppfartens kant. Friktion: plogen kör sönder gräskant/häck; vanliga käppar bryts av. Old way: bambukäppar 15 kr/st (Granngården, verifierat). Hyllan: kategorin verifierad på Granngården, men fjädrande rostfri form ej sedd hos kedjorna (ej verifierad). Hook: "Kör plogen sönder din gräskant varje vinter?" (7). Pris: null; tänkt 349 kr/4-pack. Match 48. **Varför C:** ägarpresens 1 — sättningsfönstret är sep–okt men skadan ligger i februari (samma fälla som gräsklippartäcket/kranskyddet), och bambukäppar för 15 kr är ett köpt old way som fungerar. Kan lyftas till B om Temu-priset ger ≥ 2,4× och videon visar stolpen resa sig efter påkörning inom 3 s.

**Aluminium-halklist trappsteg 8-pack — `603293367547124`.** Objekt: altantrappa/entrétrappa i trä. Friktion: vått trä + löv = halt NU (presens 2). Old way: halktejp (Axels testade butiksprodukt), sand, inget. Hyllan: OSÄKER — skruvad alu-list med halkbeläggning finns troligen bara i bygghandel (ej verifierad). Hook: "Halt på altantrappan när det regnar?" (6). Pris: null; tänkt 399 kr. Match 50. **Varför C:** 40 cm list på 90–120 cm steg = mätfriktion (räcker mitten? 2 per steg?), montering med 16 skruvar, och kategorin har redan en förlorare (tejpen) utan märkesankare att luta sig mot.

**Självlysande brevlådesiffror — `605649106764684`.** Faller på ekonomi (< 199 kr, undantagsklustret kräver kostnad ≤ 80 kr + humor). Hook fungerar ("Syns ditt husnummer i mörkret?") men payoffen ligger hos besökaren, inte ägaren.

**Locklås 30–50 gal — `601099530267994`.** Som Tier B men måttet utesluter 240/370 l-kärl.

## (e) Lärorika Tier C/ELIM-avslag

1. **Möbelskydd (`601099524098765`) — perfekt presens, ändå ELIM.** Sep–okt är exakt månaden möblerna täcks, objektet är ägt och står ute — men Biltema/Jula/Rusta/Clas har samma tyg i samma form, jämförelsehandlat, och gräsklippartäcket (samma tyg, samma hyllstatus) förlorade redan. Presens räddar inte hyllan. Lärdom: "jämförelsehandlat" i uppdraget var rätt varning.
2. **Grindfjäder (`601099534211372`) — objekt + presens + hook, men prisgolvet.** Grinden blåser upp i höstvind, "Står grinden öppen igen?" är en naturlig fråga — men Jula/Biltema har fjädern för < 150 kr och Temu-priset lär vara < 60 kr: inget utrymme att nå 300 kr. Lärdom: en bra hook på en 40-kronorsprodukt är fortfarande en 40-kronorsprodukt.
3. **Snökäppar fiberglas 50-pack (`601099763267936`) — "inför vintern" är inte "nu".** Uppdraget flaggade snökäppar som höstprodukt; sättningsfönstret stämmer, men skadan är framtida (presens 1) och Granngården har fyra SKU:er i samma form (den enda verifierade hyllträffen i klustret). Bara den fjädrande rostfria varianten överlever som C.
4. **Taksnöraka / snöskyffel på hjul / handspridare — fel månad.** Alla tre är riktiga problem, men i januari. ≥ 6 v-regeln fäller dem i september.

## Ej sökt (budget/block) — värt att köra centralt

Sopkärl: handtag/dragrem, sorteringstillbehör, snöskydd för kärlet. Brevlåda: snöskydd (riktigt, inte dekor), stolpe med reflex. Flaggstång: linstopp/ljuddämpare mot smällande lina (verkligt höstproblem, tydlig ägarklass), vimpel. Grind: magnetlås. Altan: solcellsbelysning för räcke/stolpe (mörker i säsong), räckesskydd. Snö: snörasskydd.
