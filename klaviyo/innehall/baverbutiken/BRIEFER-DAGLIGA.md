# Briefer: dagliga kampanjer i Spoks, omgång 1 (skrivna 2026-09-28)

Axels order 2026-09-28: kampanjer **varje dag**, produkter skräddarsydda för kunderna,
rea-mejl för den pågående rean (butiken visar "Rea" med ordinarie pris och reapris på
produkterna, ingen rabattkod, inget slutdatum) och **minst tio fars dag-kampanjer**.
Fars dag är söndag 8 november; sista beställningsdag **måndag 19 oktober**
(brandfilens `kalender`, p90 20 dygn). K05 (13/10) och K15 (16/10) finns redan, så tio
nya här ger tolv fars dag-mejl.

Huvudsessionen skrev strategin här. Copyn skrivs av Sonnet-subagenter till
`kampanjer/<id>.json` i exakt samma format som `k05-fars-dag.json` och
`k15-fars-dag-sista-helgen.json` (se `klaviyo/ARKITEKTUR.md` → Innehållsformatet).
Konverteraren `klaviyo/spoks/konvertera.mjs` gör Spoks-block, uppladdningen sker via
Spoks-MCP:n i sessionen, och **Axel väljer publik och schemalägger i appen** (MCP:n kan
inte sätta mottagare eller datum).

## Så skräddarsys mejlen: åtta köpargrupper som Spoks-segment

Alla segment kräver samtycke (`emailMarketingConsent` = subscribed) och minst ett köp av
en produkt i gruppen (`orderedProducts` med produktens Spoks-id). Skapade av sessionen
2026-09-28; id:n och storlekar i `klaviyo/spoks/README.md`.

| Segment i Spoks | Vem | Exempel på produkter |
|---|---|---|
| Köpare båt | båtägaren | motorhölje, båtmotorskydd, sitsöverdrag, förtöjningslina, motorlås, båthuv |
| Köpare husvagn & husbil | vagnen/husbilen | taköverdrag, termoskydd, tak-AC-huv, cykelhållarskydd |
| Köpare trädgård & tomt | villan, tomten, kaminen, klipparen | IBC, kranskydd, sotarset, sätesöverdrag, axelbälte, vedklyvar, huvar |
| Köpare verkstad & garage | garaget och verktygen | bälteslip, rullknivslip, täljset, makita-hållare, maskinhylla |
| Köpare fiske & friluft | spöna, skogen, stigen | fiskespöhållare, mini-spö, damasker, ryggsäckar, kepslampa |
| Köpare hem & säkerhet | huset och tomtens kant | kamera, larm, solcellslampa, värmeprodukter, tofflor |
| Köpare MC & fordon | hojen, fyrhjulingen, bilen | MC-kapell, styrlås, handvärmare, LED-belysning |
| Köpare kalendrar & lek | present- och kalenderköparen | adventskalendrar, byggblock, RC-bilar, spel |

Breda utskick följer uppvärmningen (`docs/os/EPOST-STRATEGI.md` §4 och
`klaviyo/spoks/README.md` → Uppvärmningen): vecka 40–41 **Warmup tier 1**, vecka 42–43
**Warmup tier 2**, vecka 44 tier 3, sedan All subscribed. Skräddarsydda utskick går till
sitt köparsegment oavsett vecka. Ingen person ska få mer än ett mejl per dag, så ett
skräddarsytt mejl ligger aldrig samma dag som ett brett.

## Gemensamt för alla mejl (utöver BRIEFER.md → Gemensamt)

- **Fakta bara ur `produkter-fakta.json`** (produkttexterna ur butiken, en post per handle)
  och produktminnet som anges per brief. Står en egenskap inte där skrivs den inte.
- **Inga siffror med kr, inga procent, inga tankstreck, ingen leveranstid** (konverteraren
  stoppar dem). Priserna kommer ur Spoks produktblock, som visar reapriset och det
  överstrukna ordinarie priset precis som butiken.
- **Rea-mejlen** får använda orden "rea", "reapris" och "ordinarie pris", eftersom det
  är butikens egna ord på produktsidorna. Aldrig ett slutdatum, aldrig "tillfälligt",
  aldrig "bara i dag", för rean har inget slutdatum. Brådskan i fars dag-mejlen är
  däremot äkta: 19 oktober är sista beställningsdagen, och den får skrivas ut.
- **Fars dag-vinkeln till våra egna kunder** (mest män som handlar till sig själva):
  två läsare i samma mejl. Den som ska köpa en present till en pappa, och pappan själv
  som kan skicka mejlet vidare som önskelista. Skriv aldrig "din pappa" som om läsaren
  vore barnet, skriv "pappan i huset", "han" eller "önskelistan".
- **Skräddarsydda mejl** utgår från det kunden redan köpt ("Du har motorhöljet.
  Det här är nästa steg."), utan att påstå något om kundens order utöver produktgruppen.
- Tre ämnesrader med var sitt begär, förhandstext som fortsätter ämnesraden,
  `tretest` på ämnesrader, förhandstext, rubriker och knappar. `status_plan: klar`.
- `namn` följer mönstret `MAIL_<YYYYMMDD>_<Prefix>_<KOD>_<publik>_<awareness>_<slug>_v1`.
- `planerad` är 18:00 svensk tid (`T18:00:00+02:00`). `segment` bär Spoks-segmentets
  namn som Axel ska välja, `exkludera` är `[]` (Spoks har inget SEG_oengagerade).

## Kalendern 29/9 till 21/10 (nya rader i fetstil; K-raderna finns redan i Spoks)

| Dag | Kampanj | Publik | Vinkel |
|---|---|---|---|
| tis 29/9 | K01 v2 | Warmup tier 1 | schemalagd |
| **ons 30/9** | **K23 Rea 1: bästsäljarna** | Warmup tier 1 | reapris på de sex flest köpta |
| tor 1/10 | K02 | Warmup tier 1 | båten ska upp |
| **fre 2/10** | **K24 Båtköpare: nästa steg** | Köpare båt | motorhölje → båtmotorskydd, belagt återköp |
| **lör 3/10** | **K25 Trädgård: frosten** | Köpare trädgård & tomt | kranskydd, IBC, krukväxthuv, regntunnehuv |
| **sön 4/10** | **K26 Fars dag 1: listan** | Warmup tier 1 | fem veckor kvar, tre pappor, sex presenter |
| **mån 5/10** | **K27 Husvagnsköpare: resten av bilen** | Köpare husvagn & husbil | tak-AC-huv, cykelhållarskydd, husbilskalendern |
| tis 6/10 | K03 | Warmup tier 1 | termoskyddet |
| **ons 7/10** | **K28 Fars dag 2: verkstadspappan** | Warmup tier 1 | bälteslip, rullknivslip, täljset, makita-hållare |
| tor 8/10 | K04 | Warmup tier 1 | sotarset |
| **fre 9/10** | **K29 Rea 2: presenterna på rea** | Warmup tier 1 | sex presenter med ordinarie pris överstruket |
| **lör 10/10** | **K30 Fars dag 3: vedpappan** | Köpare trädgård & tomt | tändvedsklyv, vedklyvborr, manuell vedklyv, vedklyvshuv |
| **sön 11/10** | **K31 Fars dag 4: fiskepappan** | Warmup tier 1 | fiskespöhållaren, mini-spöt, fiskesetet, linupprullaren |
| **mån 12/10** | **K32 Fars dag 5: prylpappan** | Köpare verkstad & garage | fågelmataren med kamera, jumpstart, inspektionskamera |
| tis 13/10 | K05 | Warmup tier 2 | fars dag, taköverdraget |
| **ons 14/10** | **K33 Fars dag 6: pappan som fryser** | Warmup tier 2 | värmesits, värmesulor, läktarponcho, handvärmare |
| tor 15/10 | K06 | Warmup tier 2 | kameran |
| fre 16/10 | K15 | Warmup tier 2 | sista helgen |
| **lör 17/10** | **K34 Fars dag 7: båtpappan** | Köpare båt | motorlås, båtmotorskydd, spolklamma, båthuv |
| **sön 18/10** | **K35 Fars dag 8: i morgon är sista dagen** | Warmup tier 2 | sex presenter, deadline i morgon |
| **mån 19/10** | **K36 Fars dag 9: sista dagen i dag** | Warmup tier 2 | fyra presenter, kort |
| tis 20/10 | K07 | Warmup tier 2 | damaskerna |
| **ons 21/10** | **K37 MC-köpare: hojen ställs undan** | Köpare MC & fordon | MC-kapell, styrlås, sätesöverdrag, bensindunk |

Fars dag-mejlen är K26, K28, K29 (rea + fars dag), K30, K31, K32, K33, K34, K35, K36 plus
K05 och K15 = tolv. Omgång 2 (23/10 till 8/11) skrivs när de här är uppladdade.

---

## K23, ons 30 sep: Rea 1, bästsäljarna
- **Fil:** `kampanjer/k23-rea-bastsaljarna.json` · **Namn:** `MAIL_20260930_Rea_CS_1_tier1_promo_bastsaljarna-reapris_v1`
- **Produkter (butikens kollektion Bästsäljare, mätt 2026-09-28):** `satesoverdrag-for-akgrasklippare-slittaligt-600d-oxford`, `axelbalte-for-trimmer-justerbart-nylonbalte`, `strandtofflor-for-herr-halkfria-tradgardsskor`, `marin-motorholje-420d-universellt-skydd`, `vaggfaste-for-grastrimmer-kraftig-verktygshallare`, `fiskespohallare-4-pack-kraftig-forvaring`.
- **Memo:** Butiken visar reapris och ordinarie pris på varje produkt. Mejlet säger det rakt ut och visar de sex flest köpta med priserna ur produktblocken. Hypotes: kunder som redan handlat öppnar ett rea-mejl på det de känner igen; mätt mot K01 på klick per mottagare.
- **Taggar:** typ M · kalla egen-data · kalla_ref `kollektionen bestsaljare 2026-09-28` · avatar kunden som handlat en gång och sett rea-etiketterna · begär köpa det han ändå tänkt köpa medan reapriset står · awareness promo · urgency pris · confidence medium · prefix Rea · kod CS.
- **Block:** hero (rubrik om rean, ingen produktbild, knapp `kollektion:bestsaljare`) → text (vad rea betyder hos oss: ordinarie priset står överstruket på produktsidan, inget kodkrångel, priset i kassan är det du ser) → produktrad (tre) → produktrad (tre) → fakta. Inga procent, inga belopp, inget slutdatum.

## K24, fre 2 okt: Båtköpare, nästa steg
- **Fil:** `kampanjer/k24-batkopare-nasta-steg.json` · **Namn:** `MAIL_20261002_Batmotorskydd_S_2_kopare-bat_solution_motorholje-till-batmotorskydd_v1`
- **Publik:** Köpare båt. **Produkter:** hero `batmotorskydd-420d-heltackande-for-utombordare`, produktrad `motorlas-i-rostfritt-stal-laser-utombordarens-fastskruvar`, `marin-fortojningslina-elastisk-uv-talig`, `spolklamma-for-batmotor-testvattenklamma`.
- **Memo:** Det enda belagda återköpsparet i butiken: Marin Motorhölje → Båtmotorskydd, 12 av 21 återköpare, median 28 dagar (`klaviyo/evolve/ATERKOP-ANALYS.md`). F07 gör det i flödet 21 dagar efter köpet; det här mejlet tar alla som köpt motorhölje tidigare än så. Hypotes: "motorhöljet täcker huven, det här täcker hela riggen" konverterar bättre än ett allmänt båtmejl.
- **Taggar:** typ I · kalla egen-data · kalla_ref `klaviyo/evolve/ATERKOP-ANALYS.md:121` + `products/motorholjet/dna.md` · avatar båtägaren som köpte motorhöljet i somras · begär att motorn står torr hela vintern utan att han behöver tänka på den · awareness solution · urgency sasong · confidence high · prefix Batmotorskydd · kod S.
- **Block:** hero → text (skillnaden mellan motorhöljet och heltäckande skyddet, bara ur produkttexterna, utan att påstå vad kunden äger utöver "du har handlat båtprylar hos oss") → produkt (båtmotorskyddet) → produktrad "Mer för båten" (tre) → fakta. ⚠️ Motsäg inte produktsidan: F07 v2 rättades för att den påstod fel om riggen; skriv bara vad produkttexten säger.

## K25, lör 3 okt: Trädgård, frosten
- **Fil:** `kampanjer/k25-tradgard-frosten.json` · **Namn:** `MAIL_20261003_Kranskydd_S_1_kopare-tradgard_problem_utekranen-fryser-forst_v1`
- **Publik:** Köpare trädgård & tomt. **Produkter:** hero `kranskydd-frost-420d-skyddar-utekranen-i-vinter`, produktrad `ibc-tankoverdrag-1000-l-stoppar-alger-uv`, `krukvaxthuv-3-pack-skydd-mot-vind-regn-och-frost`, `regntunnehuv-200-l-i-svart-210d-dras-over-tunnan`.
- **Memo:** Första frostnatten kommer i oktober i stora delar av landet. Mejlet går till dem som redan köpt till tomten, en månad före K16 (som går brett 3/11). Hypotes: problemöppningen "det som fryser först" (utekranen) säljer hela raden av skydd; mätt på klick per produkt.
- **Taggar:** typ S · kalla gissning · kalla_ref null · avatar villaägaren som redan köpt något till tomten · begär att inget spricker i vinter · awareness problem · urgency sasong · confidence low · prefix Kranskydd · kod S.
- **Block:** hero → punkter "Tre saker frosten tar först" (kranen, tunnan, krukorna; bara det produkttexterna belägger, inga påståenden om skador vi inte kan visa) → produkt → produktrad (tre) → fakta. **Förbud:** inga påståenden om försäkring eller skadekostnader.

## K26, sön 4 okt: Fars dag 1, listan
- **Fil:** `kampanjer/k26-fars-dag-listan.json` · **Namn:** `MAIL_20261004_Farsdag_GT_4_tier1_solution_fem-veckor-tre-pappor_v1`
- **Publik:** Warmup tier 1. **Produkter:** tre produktrader om två: båt `motorlas-i-rostfritt-stal-laser-utombordarens-fastskruvar` + `batmotorskydd-420d-heltackande-for-utombordare`; verkstad `balteslipmaskin-mini-3-i-1-knivslip-polerare` + `taljset-30-delar-6-knivar-och-6-jarn`; kamin `sotarset-med-bojliga-stanger-rensar-rokkanal-och-kaminror` + `tandvedsklyv-i-gjutjarn-klyv-utan-yxa-i-handen`.
- **Memo:** Första fars dag-mejlet, fem veckor före. Presentvinkeln är bevisad (`Takoverdrag_GT_2_H1`, 8 202 kr vinstbidrag). Hypotes: en lista sorterad på vad pappan sysslar med (båt, verkstad, kamin) ger fler klick än ett enproduktsmejl, mätt mot K05.
- **Taggar:** typ I · kalla egen-data · kalla_ref `products/carashell/takskyddet/dna.md:56-66` · avatar den som redan nu vill ha fars dag ur vägen, och pappan som skickar vidare önskelistan · begär en present som används, beställd i tid · awareness solution · urgency konsekvens (19 oktober) · confidence medium · prefix Farsdag · kod GT.
- **Block:** hero (ingen produktbild, knapp `kollektion:alla-produkter` "Se hela listan") → text (två läsare: köparen och önskelistan) → produktrad "Om han har båt" → produktrad "Om han har verkstad" → produktrad "Om han har kamin" → text (beställ senast 19 oktober, fars dag 8 november) → fakta.

## K27, mån 5 okt: Husvagnsköpare, resten av bilen
- **Fil:** `kampanjer/k27-husvagn-resten.json` · **Namn:** `MAIL_20261005_Husbil_S_1_kopare-husvagn_solution_resten-av-bilen_v1`
- **Publik:** Köpare husvagn & husbil. **Produkter:** hero `husbilens-tak-ac-huv-80-80-38-cm-skydd-mellan-resorna`, produktrad `husbilens-cykelhallarskydd-2-cyklar-smutsen-stannar-utanpa`, `husbilskalendern-24-luckor-retrobussar-och-campingprylar`, `fonstertermomatta-2-pack-70-80-cm-isolering-mot-kyla-och-sol`.
- **Memo:** De som köpt taköverdraget eller termoskyddet har redan bestämt sig för att skydda fordonet över vintern. Hypotes: tillbehören till resten (AC-aggregatet på taket, cykelhållaren, rutorna) säljer till just dem; K03 dagen efter är termoskyddet brett, så termoskyddet nämns inte här.
- **Taggar:** typ S · kalla egen-data · kalla_ref `products/carashell/takskyddet/dna.md` (skyddsvinkeln) · avatar husbils- eller husvagnsägaren som redan skyddat taket eller rutan · begär att hela fordonet står skyddat, inte bara taket · awareness solution · urgency sasong · confidence medium · prefix Husbil · kod S.
- **Block:** hero → text (det som står kvar oskyddat när taket är täckt: AC-huven på taket, cyklarna bak) → produkt (AC-huven) → produktrad (tre) → fakta.

## K28, ons 7 okt: Fars dag 2, verkstadspappan
- **Fil:** `kampanjer/k28-fars-dag-verkstad.json` · **Namn:** `MAIL_20261007_Balteslip_GT_5_tier1_product_kniven-som-legat-slo_v1`
- **Publik:** Warmup tier 1. **Produkter:** hero `balteslipmaskin-mini-3-i-1-knivslip-polerare`, produktrad `rullknivslipen-i-tra-20-vinkeln-ar-redan-bestamd`, `taljset-30-delar-6-knivar-och-6-jarn`, `makita-hallare-5-pack-verktygen-samlade-pa-vaggen`.
- **Memo:** Bälteslipen är en av butikens storsäljare och en klassisk present till den som slipar själv. Hypotes: den konkreta bilden "kniven som legat slö sedan midsommar" slår "presenttips" som rubrik. ⚠️ Kornstorlek och kitets innehåll är okänt (`kommentarer/leads.md` 2026-09-27) och får inte påstås.
- **Taggar:** typ I · kalla voc · kalla_ref `kommentarer/leads.md` (Beltgrinder, frågorna om förbrukning) · avatar den som ska ge en present till pappan med verkstad · begär en present han använder redan första helgen · awareness product · urgency konsekvens (19 oktober) · confidence medium · prefix Balteslip · kod GT.
- **Block:** hero → text (vad maskinen gör, ur produkttexten) → produkt → produktrad "Tre till för verkstaden" → text (19 oktober) → fakta.

## K29, fre 9 okt: Rea 2, presenterna på rea
- **Fil:** `kampanjer/k29-rea-presenterna.json` · **Namn:** `MAIL_20261009_Rea_CS_2_tier1_promo_presenterna-pa-rea_v1`
- **Publik:** Warmup tier 1. **Produkter (alla med ordinarie pris överstruket i butiken):** `balteslipmaskin-mini-3-i-1-knivslip-polerare`, `taljset-30-delar-6-knivar-och-6-jarn`, `motorlas-i-rostfritt-stal-laser-utombordarens-fastskruvar`, `fagelmatare-med-kamera-och-solcellspanel-se-faglarna-i-appen`, `varmesits-45-90-cm-4-varmezoner-usb-driven`, `kamadohuv-80-102-cm-skydd-med-forvaringspase`.
- **Memo:** Rea och fars dag i samma mejl: sex presenter som står med reapris just nu. Hypotes: reapriset gör presentköpet lättare att motivera fem veckor i förväg; mätt mot K26 på köp per mottagare.
- **Taggar:** typ M · kalla egen-data · kalla_ref `produktsidornas reapris 2026-09-28` · avatar den som vill köpa presenten nu när den är billigare · begär köpa presenten till reapris och vara klar · awareness promo · urgency pris + konsekvens (19 oktober) · confidence medium · prefix Rea · kod CS.
- **Block:** hero (utan produktbild, knapp `kollektion:alla-produkter`) → text (reapris på presenterna, ordinarie priset står överstruket, beställ senast 19 oktober) → produktrad (tre) → produktrad (tre) → fakta.

## K30, lör 10 okt: Fars dag 3, vedpappan
- **Fil:** `kampanjer/k30-fars-dag-ved.json` · **Namn:** `MAIL_20261010_Tandvedsklyv_GT_6_kopare-tradgard_product_vinterns-ved_v1`
- **Publik:** Köpare trädgård & tomt. **Produkter:** hero `tandvedsklyv-i-gjutjarn-klyv-utan-yxa-i-handen`, produktrad `vedklyvborr-till-borrmaskin-kon-o32-mm-3-skaft`, `manuell-vedklyv-vaggmonterad-gjutjarn`, `vedklyvshuv-i-svart-210d-haller-fukt-och-smuts-borta`.
- **Memo:** Vedsäsongen börjar. Till dem som redan köpt till tomten, som önskelista eller present. Hypotes: en produktfamilj (klyva, klyva mer, skydda klyven) säljer som helhet.
- **Taggar:** typ N · kalla gissning · kalla_ref null · avatar pappan med kamin och vedbod, och den som ger honom presenten · begär att tändveden är klar utan yxa i handen · awareness product · urgency konsekvens (19 oktober) · confidence low · prefix Tandvedsklyv · kod GT.
- **Block:** hero → text (hur tändvedsklyven används, ur produkttexten) → produkt → produktrad (tre) → text (19 oktober) → fakta. **Förbud:** inga påståenden om säkerhet eller olyckor.

## K31, sön 11 okt: Fars dag 4, fiskepappan
- **Fil:** `kampanjer/k31-fars-dag-fiske.json` · **Namn:** `MAIL_20261011_Rodholder_GT_7_tier1_product_fyra-spon-pa-vaggen_v1`
- **Publik:** Warmup tier 1. **Produkter:** hero `fiskespohallare-4-pack-kraftig-forvaring`, produktrad `mini-fiskespo-set-teleskopiskt-dubbelsidigt`, `fiskeset-med-forvaringslada-komplett-fiskeredskapsset`, `linupprullare-aluminium-snabbt-linbyte-pa-rullen`.
- **Memo:** Spöhållaren är bästsäljare och raden "Aldrig mer trassliga fiskespön" bar 85 köp (`products/tacklebay/fiskespohallare-4-pack/dna.md:111-122`, får användas ordagrant). Hypotes: den bevisade raden som ämnesrad i ett presentmejl.
- **Taggar:** typ I · kalla winning-line · kalla_ref `products/tacklebay/fiskespohallare-4-pack/dna.md:111-122` · avatar den som ger present till pappan som fiskar · begär att spöna hänger på plats i stället för att trassla i garaget · awareness product · urgency konsekvens (19 oktober) · confidence high · prefix Rodholder · kod GT.
- **Block:** hero → text → produkt → produktrad "Mer för fiskaren" → text (19 oktober) → fakta.

## K32, mån 12 okt: Fars dag 5, prylpappan
- **Fil:** `kampanjer/k32-fars-dag-prylar.json` · **Namn:** `MAIL_20261012_Fagelmatare_GT_8_kopare-verkstad_product_faglarna-i-mobilen_v1`
- **Publik:** Köpare verkstad & garage. **Produkter:** hero `fagelmatare-med-kamera-och-solcellspanel-se-faglarna-i-appen`, produktrad `7-i-1-jumpstart-5000a-med-luftkompressor-12v-batteribooster`, `1080p-inspektionskamera-endoskop-ip67-for-bil-ror-motor`, `solcellsladdare-10-w-mppt-underhallsladdare-for-12-v`.
- **Memo:** Verkstadsköparna gillar prylar med en funktion man kan visa upp. Hypotes: fågelmataren med kamera är presenten som pappan aldrig köper själv men pratar om i veckor; mätt på klick på hero mot raden.
- **Taggar:** typ N · kalla gissning · kalla_ref null · avatar den som ger present till pappan som redan har verktygen · begär en present som blir ett samtalsämne · awareness product · urgency konsekvens (19 oktober) · confidence low · prefix Fagelmatare · kod GT.
- **Block:** hero → text (vad kameran och appen gör, bara ur produkttexten) → produkt → produktrad "För garaget" → text (19 oktober) → fakta. ⚠️ Solcellsprodukterna möter "var kommer solen ifrån" (`kommentarer/leads.md` 2026-09-26): skriv var panelen sitter enligt produkttexten, lova inget om laddning i mörker.

## K33, ons 14 okt: Fars dag 6, pappan som fryser
- **Fil:** `kampanjer/k33-fars-dag-fryser.json` · **Namn:** `MAIL_20261014_Varmesits_GT_9_tier2_problem_pappan-som-fryser_v1`
- **Publik:** Warmup tier 2. **Produkter:** hero `varmesits-45-90-cm-4-varmezoner-usb-driven`, produktrad `varmesulor-med-fjarrkontroll-varma-fotter-pa-passet`, `laktarponcho-med-varme-tre-varmelagen-via-usb`, `mc-handvarmare-vindtata-greppoverdrag`.
- **Memo:** Höstens läktare, pass och båtbryggor. Hypotes: en problemöppning om kylan (läktaren i oktober) slår en produktöppning, mätt mot K28 på öppning per mottagare.
- **Taggar:** typ N · kalla gissning · kalla_ref null · avatar den som ger present till pappan som står på läktaren eller i passet · begär att han slipper frysa i vinter · awareness problem · urgency konsekvens (19 oktober) · confidence low · prefix Varmesits · kod GT.
- **Block:** hero → text → produkt → produktrad "Tre till mot kylan" → text (19 oktober) → fakta. Bara produkttexternas fakta om värmelägen, batteri och USB.

## K34, lör 17 okt: Fars dag 7, båtpappan
- **Fil:** `kampanjer/k34-fars-dag-bat.json` · **Namn:** `MAIL_20261017_Motorlas_GT_10_kopare-bat_product_motorn-han-laser-fast_v1`
- **Publik:** Köpare båt. **Produkter:** hero `motorlas-i-rostfritt-stal-laser-utombordarens-fastskruvar`, produktrad `batmotorskydd-420d-heltackande-for-utombordare`, `spolklamma-for-batmotor-testvattenklamma`, `bathuv-for-trailerbat-17-19-fot-600-310-cm-i-600d-vav`.
- **Memo:** Båtköparna får sin egen fars dag-lista två dagar före sista beställningsdagen, som önskelista att skicka vidare. Hypotes: motorlåset är presenten båtägaren vill ha men inte köper själv.
- **Taggar:** typ S · kalla egen-data · kalla_ref `klaviyo/evolve/ATERKOP-ANALYS.md:161` (båtköpare stannar i båtkategorin) · avatar båtägaren som skickar vidare önskelistan, och den som köper åt honom · begär att motorn sitter kvar och står skyddad · awareness product · urgency konsekvens (19 oktober) · confidence medium · prefix Motorlas · kod GT.
- **Block:** hero → text → produkt → produktrad "Mer för båten" → text (beställ senast måndag 19 oktober) → fakta.

## K35, sön 18 okt: Fars dag 8, i morgon är sista dagen
- **Fil:** `kampanjer/k35-fars-dag-i-morgon.json` · **Namn:** `MAIL_20261018_Farsdag_GT_11_tier2_promo_i-morgon-sista-dagen_v1`
- **Publik:** Warmup tier 2. **Produkter:** produktrad `balteslipmaskin-mini-3-i-1-knivslip-polerare`, `fiskespohallare-4-pack-kraftig-forvaring`, `overvakningskamera-tradlos-dubbellins-ptz-med-ai-sparning`; produktrad `motorlas-i-rostfritt-stal-laser-utombordarens-fastskruvar`, `taljset-30-delar-6-knivar-och-6-jarn`, `takoverdrag-husvagn-6-5-3-m-skyddar-den-dyraste-ytan`.
- **Memo:** Äkta brådska: måndag 19 oktober är sista beställningsdagen för fars dag. Söndagsmejlet fångar den som sköt upp det. Hypotes: samma sex presenter som setts tidigare, nu med deadline i ämnesraden.
- **Taggar:** typ S · kalla egen-data · kalla_ref `klaviyo/brands/baverbutiken.json` (kalender) · avatar den som fortfarande inte beställt · begär hinna · awareness promo · urgency konsekvens · confidence medium · prefix Farsdag · kod GT.
- **Block:** hero (utan produktbild, knapp `kollektion:alla-produkter`) → text (i morgon måndag är sista dagen, fars dag 8 november; efter det kan vi inte lova att paketet är framme) → produktrad (tre) → produktrad (tre) → fakta. Inga ord som "sista chansen" eller "bara i dag" (konverteraren stoppar dem); skriv "sista dagen" med datumet.

## K36, mån 19 okt: Fars dag 9, sista dagen i dag
- **Fil:** `kampanjer/k36-fars-dag-i-dag.json` · **Namn:** `MAIL_20261019_Farsdag_GT_12_tier2_promo_sista-dagen-i-dag_v1`
- **Publik:** Warmup tier 2. **Produkter:** en produktrad om fyra: `balteslipmaskin-mini-3-i-1-knivslip-polerare`, `fiskespohallare-4-pack-kraftig-forvaring`, `motorlas-i-rostfritt-stal-laser-utombordarens-fastskruvar`, `varmesits-45-90-cm-4-varmezoner-usb-driven`.
- **Memo:** Sista dagen. Kort mejl, en rubrik, fyra produkter, en mening om dagen. Hypotes: det kortaste mejlet i serien får högst klick per öppning.
- **Taggar:** typ S · kalla egen-data · kalla_ref `klaviyo/brands/baverbutiken.json` (kalender) · avatar den som beställer sista dagen · begär hinna · awareness promo · urgency konsekvens · confidence medium · prefix Farsdag · kod GT.
- **Block:** hero (rubrik "I dag är sista dagen att beställa till fars dag" eller bättre, utan produktbild, knapp `kollektion:alla-produkter`) → produktrad (fyra) → text (en mening: beställer du i morgon räknar vi inte med att det hinner fram till 8 november) → fakta.

## K37, ons 21 okt: MC-köpare, hojen ställs undan
- **Fil:** `kampanjer/k37-mc-hojen-stalls-undan.json` · **Namn:** `MAIL_20261021_MCkapell_S_1_kopare-mc_solution_hojen-stalls-undan_v1`
- **Publik:** Köpare MC & fordon. **Produkter:** hero `mc-kapell-220-120-regn-damm-uv`, produktrad `styrlas-hjalmlas-combo-stoldskydd-i-aluminium`, `mc-satesoverdrag-camo-ventilerande-skydd`, `bensindunk-3l-lasbar-reservtank-for-mc`.
- **Memo:** Säsongen är slut för de flesta hojar i slutet av oktober. Till dem som redan köpt MC- eller fordonsprylar. Hypotes: "ställs undan"-vinkeln, som K17 kör brett 10/11, funkar tre veckor tidigare till rätt grupp.
- **Taggar:** typ S · kalla egen-data · kalla_ref `KALENDER-2026.md` (K17) · avatar hojägaren som ställer undan för vintern · begär att hojen står torr och låst till våren · awareness solution · urgency sasong · confidence medium · prefix MCkapell · kod S.
- **Block:** hero → punkter "Innan hojen ställs undan" (tre saker, en per produkt, bara produkttexternas fakta) → produkt → produktrad (tre) → fakta.
