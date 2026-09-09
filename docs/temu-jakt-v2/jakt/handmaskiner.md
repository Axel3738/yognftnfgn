# Produktjakt V2 — kluster `handmaskiner`

Datum: 2026-09-04. Agent: klusteragent handmaskiner. Facit: `docs/temu-vinnar-dna.md` avsnitt 4, 6, 7, 9, 12.

## ⚠️ Läs detta först — vad som INTE gick att verifiera i den här körningen

Tre verktyg föll bort under körningen. Allt nedan är märkt efter det.

1. **WebSearch-budgeten (200 anrop/session) var slut efter 7 sökningar.** Kluster-sökningarna för motorsåg, röjsåg, häcksax, högtryckstvätt, vedklyv-överdrag, batterimaskiner, trimmer-benskydd och hyllkontrollerna (Biltema/Jula/Clas Ohlson/Rusta) blev aldrig körda. Bing/DuckDuckGo/Brave/Yandex/Ecosia/Startpage via WebFetch gav captcha, 403/429 eller felaktiga resultat (Bing svarade med Ubisoft-, Gmail- och lotteri-sidor på svenska sökord). Kedjornas egna sajter, Prisjakt, Pricerunner och Amazon.se svarade 403/404/tomt.
   → **Alla hyllbedömningar är "ur kunskap, EJ VERIFIERAD".** Ingen märkesankare-URL eller kedjepris är hämtat.
2. **Temu stryper vår IP.** Alla `temu-ld.py`-anrop (även det tidigare bekräftat fungerande IBC-id:t 601099590911868) gav tomt skal utan JSON-LD, även med inbyggd retry 0/25/60 s. 13 klusteragenter kör mot Temu från samma IP samtidigt. På koordinatorns order (01:10 UTC) stoppades all Temu-hämtning i det här klustret; **koordinatorn kör Temu-hämtning och materialgaten centralt när blocket släppt.**
   → **Pris, betyg, recensioner, bilder och video är `null` för alla 20 (`temu_fetch_blocked: true`). Inga siffror är gissade.** Gate 4 (material) = "UNKNOWN — ej hämtad" för alla. **Alla tiers är provisoriska** (`tier_provisional: true`) och bygger på gate 1–3 + 6–8; de bästa står som **Tier B "material ej verifierad"**, aldrig Tier A.
3. Titlar kommer ur sökutdragen (engelska Temu-titlar), inte ur den svenska listningen.

Konsekvens: **0 Tier A** är ett verktygsresultat, inte ett produktresultat. De tre B-koncepten nedan behöver en ny körning av `temu-ld.py` (+ frame-granskning) och fyra hyllsökningar var innan de kan lyftas eller fällas.

---

## (a) Objektuniversumet

Objekt ägaren (man 45–70, småhus/fritidshus) redan har, som står ute eller används kroppsligt i **september–oktober**, och vad han behöver göra med det. Redan testat i kontot är struket.

| Objekt | Skydda | Fästa/förbättra | Rengöra/underhålla | Nå/transportera | Bekvämare (kropp) | Säsongsläge sep–okt |
|---|---|---|---|---|---|---|
| **Motorsåg** | svärdskydd (Biltema-hylla → FAIL), bärväska (kedjorna säljer → FAIL) | kedjespänning, stockmärkare (mät-klämma på svärdet — hittade ingen Temu-listning) | filningsguide på svärdet (~~handvevad kedjeslip förlorare~~; svärdmonterad 2-i-1-fil är annan form men kedjedelning 3/8"/.325 är parameter ägaren inte kan → OSÄKER) | timmersax/stockvändare (Jula säljer ur kunskap) | — | ✅ ved, sly, fällning |
| **Röjsåg** | klingskydd (följer med maskinen) | — | — | — | ~~axelbälte/sele — vinnare~~ | ⚠️ säsongen slutar okt |
| **Trimmer** | stänkskydd, benskydd (kroppsligt — ej sökt, budget slut) | **stödhjul på skaftet** (kandidater E–H) | linbyte (förbrukning → FAIL) | ~~väggfäste — förlorare~~ | ~~axelbälte — vinnare~~ | ⚠️ < 6 veckor kvar |
| **Häcksax** | svärdfodral (följer med) | **klippuppsamlare på svärdet** — ingen Temu-listning hittades i den enda sökningen | olja (förbrukning → FAIL) | — | — | ⚠️ sista klippet sep |
| **Lövblås** | — | **hängrännerensning via blåsen** (kandidater O–Q), uppsamlare (modellbunden → FAIL) | — | — | **axelrem** (kandidater A–D) | ✅✅ oktober |
| **Vedklyv / ved** | överdrag till hydraulklyv (ej sökt) | **klyvkon till borrmaskin** (kandidater I–L), kilar (Biltema → FAIL) | — | vedbärare/vedkärra (kedjorna → FAIL) | slippa yxan (rygg) | ✅✅ |
| **Högtryckstvätt** | frostskydd (kemikalie/förbrukning + november → FAIL på presens) | munstycken, ytrengörare, skumkanon (Kärcher-bajonett = kompatibilitet → FAIL; Biltema säljer) | hängrännelans (kompatibilitet) | slangvinda (Biltema) | — | ⚠️ "före vinter" är en annonsskapad önskan |
| **Batterimaskiner** | batteriskydd/regnskydd (inomhus) | batterihållare vägg (~~förvaring gör inte ont~~ → FAIL), adaptrar (kompatibilitet → FAIL) | — | — | — | — |
| **Hängrännor (huset)** | — | blåstillsats (O–Q) | skopa (commodity → FAIL) | slippa stegen (rädsla, som kameran) | — | ✅✅ oktober |
| **Träd på tomten** | — | — | — | repsåg för höga grenar (kit/survival → FAIL), stångsåg (hylla + > 1 000 kr → FAIL) | — | ⚠️ beskärning efter lövfällning |

Slutsats ur universumet innan sökning: de tre ställen där fingeravtrycket (ägt objekt ute · problem i presens · ingen hylla · kroppslig payoff · ingen kompatibilitetsfråga) kan uppfyllas i oktober är **veden**, **lövblåsen** och **hängrännorna**. Motorsågstillbehören faller på hyllan (Biltema har allt), trimmer/röjsåg på säsongen, högtryckstvätt och batterimaskiner på kompatibilitet.

## (b) Sökfraserna

Körda (WebSearch, `site:temu.com`), 7 st innan budgeten tog slut:
1. `leaf blower shoulder strap harness` → 7 listningar
2. `hedge trimmer clippings catcher collector` → 0 relevanta (bara häcksaxar och en skäggförkläde)
3. `grass trimmer support wheels attachment` → 8 listningar
4. `log splitter drill bit cone firewood` → 10 listningar
5. `rope chain saw high branch pruning` → 6 listningar (stångsågar, repsåg, hopfällbar)
6. `chainsaw log measuring gauge marker` → 0 relevanta på Temu (eBay/patent)
7. `leaf blower gutter cleaning attachment kit` → 8 listningar

Planerade men **ej körda** (budget slut): `string trimmer shin guards leg protection`, `log splitter cover waterproof`, `timber jack log lifter cant hook`, `chainsaw carrying bag case`, `electric pruning shears cordless garden`, `pressure washer gutter cleaner wand`, `brush cutter blade guard protection cover`, `firewood log rack cover outdoor`, `chainsaw bar mounted file guide`, `hedge trimmer blade cover sheath`, samt hyllsökningarna `<ord> biltema/jula/clas ohlson/rusta` för varje överlevare.

## (c) Tratten

| Steg | Kvar | Föll |
|---|---|---|
| Råkandidater (listningar med goods-id) | **20** | — |
| Gate 1 OBJEKT | 16 | 4 (repsågskit, hopfällbar såg, grovdammsugarkit, + stångsåg OSÄKER) |
| Gate 2 PRESENS | 12 | 4 stödhjul (säsongen slutar; vårkandidater) |
| Gate 3 HYLLAN | 10 | hängränneskopa (commodity), stångsåg (kedjorna + > 1 000 kr) — **alla hyllbedömningar ej verifierade** |
| Gate 4 MATERIAL | **UNKNOWN för samtliga** — Temu blockerade | — |
| Gate 5 EKONOMI | UNKNOWN (inga priser) | — |
| Gate 6 VARIANT | 7 | EGO-rem, MTM 30cc-kit (märkesbundna); 3-delars klyvset OSÄKER |
| Gate 7 HOOK | 7 | 0 |
| Gate 8 PUBLIK | 7 | 0 |
| **Tier A** | **0** | kräver PASS i alla åtta + egen frame-granskning — omöjligt utan Temu-data |
| **Tier B (material ej verifierad)** | **5 listningar / 2 koncept** | klyvkon I, J, L · lövblås-axelrem A, B |
| Tier C | 8 | stödhjul ×4, gutter-kit ×2, klyvset K, rem C (dublett) |
| ELIM | 7 | |

## (d) Tier B — fullständig fältmall

### B1. Klyvkon till borrmaskin ("vedklyv för borrmaskinen") — goods 601099512512218 (enkel), 601099547786201 (2-pack hex), 601099760920889 (42 mm)

- **PRODUCT:** Konformad skruv (32/42 mm) med hex- eller rundskaft som sätts i borrmaskinen; skruvas in i vedträet och spräcker det.
- **TEMU URL:** https://www.temu.com/se/g-601099512512218.html · https://www.temu.com/se/g-601099547786201.html · https://www.temu.com/se/g-601099760920889.html
- **OBJECT/OWNER:** Vedhögen på tomten (ligger ute, är i bruk nu) + borrmaskinen ägaren redan har. Man 45–70 med kamin/vedbod, villa eller fritidshus.
- **EXISTING FRICTION:** September–oktober är klyvmånaderna. Rygg, axlar, handleder efter en eftermiddag med yxan; kvistig björk som yxan studsar på. Kroppslig payoff = bevisad stark (axelbältet, sätesöverdraget).
- **OLD WAY:** Klyvyxa + huggkubbe, kilar + slägga (improvisation), eller hydraulklyv för 2 000–4 000 kr (Biltema/Jula) som ägaren inte köper för "bara några kubik".
- **PRODUCT'S ROLE:** Gör borrmaskinen till vedklyv: inga slag, ingen bock, ingen ny maskin.
- **WHY THE AD DOES NOT NEED TO CREATE DEMAND:** Veden ligger redan där och ska klyvas före vintern. Hooken är en ja/nej-fråga ägaren svarar ja på i oktober.
- **TEMU MATERIAL:** UNKNOWN — Temu blockerade fetch. Kategorins leverantörsvideor visar normalt borrmaskinen som skruvar in konen och stocken som spricker på 2–4 s, oftast utan inbränd text (ej bekräftat för dessa tre id:n).
- **0–3 SECOND PROOF:** EJ GRANSKAD (inga frames). Måste göras innan Tier A/B-beslut.
- **SWEDISH SHELF STATUS:** Ur kunskap säljer varken Biltema, Jula, Clas Ohlson eller Rusta klyvkon för borrmaskin (de säljer yxor och hydraulklyvar = samma kategori, annan form); finns på Amazon.se/Fyndiq. **EJ VERIFIERAD** — fyra sökningar återstår.
- **TEMU PRICE:** UNKNOWN (blockerad). Kategorin ligger typiskt 40–150 kr på Temu — **inte uppmätt, används inte i räkningen**.
- **PLAUSIBLE SWEDISH PRICE:** 399 kr (enkel) / 449 kr (2-pack 32+42 mm). Över 300 kr-gränsen, under 500.
- **ECONOMIC ROOM:** UNKNOWN tills Temu-pris finns. Villkor: landad ≤ 165 kr för 399 kr (2,4×), BE-CPA ≥ 234 kr.
- **VARIANT FRICTION:** Skafttyp (hex/rund/fyrkant) och 32/42 mm. Ägaren vet om han har chuck eller slagskruvdragare = "vet ungefär". Löses med **en** SKU: 42 mm rundskaft + hexadapter (eller 2-packen med hexskaft, som passar båda).
- **≤7 WORD OWNERSHIP HOOK:** "Klyver du fortfarande ved med yxa?" (6 ord)
- **WINNER-STRUCTURE MATCH:** 62/100 (objekt ute i presens ✅, kroppslig payoff ✅, ingen hylla ✅ ej verifierad, ägarfråga ✅, prisutrymme ? , material ? , variant ⚠️, säkerhet ⚠️)
- **TOP 3 REASONS:** (1) Problemet är fysiskt närvarande i oktober och syns i bild (vedhög + yxa). (2) Kategorinyhet i svenskt flöde — ingen kedja, 0 kända svenska annonsörer (Ad Library ej kollad). (3) Leverantörsvideon är sannolikt annonsen: en handling, en payoff, ingen förklaring.
- **BIGGEST REASON IT COULD FAIL:** Säkerhet/returer. Konen ger högt vridmoment; fastnar den i kvistig ved vrids borrmaskinen ur handen. Billiga skruvdragare orkar inte 42 mm → "funkar inte"-recensioner. Plus: yxan är en "köpt old way som fungerar" (30 % av förlorarna).
- **CONFIDENCE:** LOW (material, pris och hylla ej verifierade).

### B2. Axelrem till lövblåsen — goods 601099519754003 (universal, karbinhake), 601099555571658 (vadderad 70 cm)

- **PRODUCT:** Justerbar vadderad axelrem med krok som hakas i lövblåsens/trimmerns remögla.
- **TEMU URL:** https://www.temu.com/se/g-601099519754003.html · https://www.temu.com/se/g-601099555571658.html
- **OBJECT/OWNER:** Handhållen lövblås (3–5 kg med batteri) — villaägare med träd, oktober varje helg.
- **EXISTING FRICTION:** Öm arm/axel efter 30–60 min blåsning; maskinen hänger i en hand. Samma smärta som axelbältet löste för trimmern — men i oktober är det lövblåsen som hänger i handen, inte trimmern.
- **OLD WAY:** Byta hand, pausa, lägga ifrån sig. Trimmerns bärsele passar ofta inte blåsen.
- **PRODUCT'S ROLE:** Flyttar vikten till axeln.
- **WHY THE AD DOES NOT NEED TO CREATE DEMAND:** Lövblåsning är oundviklig i oktober och armen är redan öm. Kroppslig payoff bevisad i kontot.
- **TEMU MATERIAL:** UNKNOWN — blockerad. OBS: axelbältet vann med äkta UGC, inte leverantörsvideo (DNA avsnitt 7: kroppslig payoff kräver en människa). Samma gäller här — planera UGC/egen film oavsett Temu-materialet.
- **0–3 SECOND PROOF:** EJ GRANSKAD.
- **SWEDISH SHELF STATUS:** Enkel bärsele för trimmer finns i Biltema/Jula (samma form, ~60–150 kr ur kunskap — **EJ VERIFIERAD**). Undantaget som räddade axelbältet gäller igen: **Husqvarna-sele 819 kr** som synligt ankare (≥ 1,6× av 349). Ingen kedja positionerar remmen för lövblås.
- **TEMU PRICE:** UNKNOWN.
- **PLAUSIBLE SWEDISH PRICE:** 349 kr (samma nivå som axelbältet fungerade på).
- **ECONOMIC ROOM:** UNKNOWN tills Temu-pris finns; villkor landad ≤ 145 kr.
- **VARIANT FRICTION:** En variant, justerbar. **Men:** många batterilövblåsar (t.ex. flera Ryobi/Bosch-modeller) saknar remögla → "passar min?" Kräver text i annonsen: "passar alla blåsar med ögla".
- **≤7 WORD OWNERSHIP HOOK:** "Trött i armen av lövblåsen?" (5 ord)
- **WINNER-STRUCTURE MATCH:** 70/100 — det är i praktiken samma struktur som axelbälte-vinnaren, flyttad till höstobjektet.
- **TOP 3 REASONS:** (1) Bevisad payoff (smärta bort) + bevisad publik + bevisat pris i samma konto. (2) Lövblås i bild = omisskännlig CPM-proxy i oktober. (3) Flerköpsskäl: lövblås + trimmer = två maskiner.
- **BIGGEST REASON IT COULD FAIL:** Det är **inte en ny produkt** utan en höstvinkel på det axelbälte som redan säljs — och det kan avgöras billigare genom att köra en "lövblås"-hook på befintliga axelbältet i oktober i stället för att sourca en ny rem. Andra risken: remögla saknas → returer.
- **CONFIDENCE:** MEDIUM (strukturen är bevisad, listningen är inte).

## (e) Lärorika Tier C-avslag

1. **Stödhjul till trimmern (601099541368579 m.fl.)** — klarar objekt, hylla (ur kunskap), hook ("Ont i ryggen efter trimningen?") och publik, och leverantören skriver själv "reducing fatigue and pain". Faller på två saker samtidigt: **säsongen** (trimning slutar mitten av oktober = < 6 veckor efter launch) och **varianten** (skaftdiameter 26/28 mm är något ägaren måste mäta — nivå 0 i ägarkunskap, och batteritrimmers har ofta böjt/smalare skaft). Lärdom: kroppslig payoff räcker inte när kompatibiliteten är en mätning. **Lägg i vårbacklog (april 2027)** med krav på universalklämma 22–30 mm.
2. **Hängrännerensning via lövblåsen (601103248788835, 601103296007046)** — starkast på presens av alla (rännorna är fulla i oktober, stegen är farlig, payoffen är "slipp stegen" = samma rädsla som bar kameran) och ingen kedja har formen. Faller på **kompatibilitet** ("passar de flesta blåsar" + adaptersats är byggt för amerikanska runda 2,5"-pipor; europeiska batteriblåsar har platta/ovala munstycken), **montering** (rörsats) och sannolikt **pris > 1 000 kr** efter frakt av metallrör. Lärdom: när både objektet och problemet är perfekta men tillbehöret kräver att ägaren svarar på "passar min?", är det fingeravtryckets kända förlorarväg (ståltrådsborsten).
3. **Hängränneskopa (601099606869339)** — perfekt presens, perfekt publik, noll friktion — och därför en 30-kronors commodity i alla fyra kedjor. Lärdom: presens utan hyllfrånvaro är ingenting; det är kombinationen B ∧ C2 ∧ E som bär, aldrig B ensam.

## Vad nästa körning ska göra (för att lyfta eller fälla B1/B2)

1. Kör `temu-ld.py --video` på 601099512512218, 601099547786201, 601099519754003 med ≥ 15 s mellanrum när Temu släppt IP:n; dra frames; öppna hero.
2. Fyra hyllsökningar var: "vedklyv borrmaskin kon biltema/jula/clas ohlson/rusta" och "axelrem lövblås …".
3. Ad Library SE: "vedklyv borr", "klyvkon".
4. Kör de ej körda sökfraserna i (b) — särskilt häcksax-uppsamlare och motorsågens stockmärkare, som är de två obesökta objekten med hyllfrånvaro.
