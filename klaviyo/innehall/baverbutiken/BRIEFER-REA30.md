# Briefer: 30 % rea i varje dagligt mejl (skrivna 2026-09-29)

Huvudsessionen skrev strategin här. Copyn skrivs av Sonnet-subagenter till
`kampanjer/<id>.json` i samma format som förut (`klaviyo/ARKITEKTUR.md` → Innehållsformatet,
exempel `kampanjer/k25-tradgard-frosten.json` och `k31-fars-dag-fiske.json`). Den här filen
ersätter rea-delen i `BRIEFER-DAGLIGA.md` (15 % med BASTSALJARE15/FROST15/PAPPA15).

## Axels granskning 2026-09-29 (hans ord, röstmemo)

1. **Bästsäljar-mejlet är "helt jävla cooked".** Ingen anledning till rabatten, och de sex
   är inte ens bästsäljarna längre, de ligger bara på startsidan. 15 % på dem skapar ingen
   känsla av att köpa. Han vill i stället **mindre grupper, ett mejl per grupp som träffar
   hårdare**: tofflorna, gräsklippargrejerna ("vi kan ju säga att vi säljer ut dem, 25-30 %"),
   båtgrejerna (30 %), fiskegrejerna med fiskekalendern (30 %) och **en kampanj för alla
   kalendrar** (inte en per kalender).
2. **Motorhöljet/båtmotorskyddet ska ha rabatt**, och mejlet ska säga att det som brukar
   följa med också är på rea.
3. **"Fixa rea på allt. På alla kampanjer här."** Båtköparmejlet är bra, men även det ska ha rea.
4. **Kranskyddet 30 %, och problem och agitation först** innan produkten och rabatten visas.
5. **Fars dag: skriv aldrig "sista dagen 19 oktober" eller "beställ senast 19 oktober"**
   ("då tänker folk bara vilken lång frakttid"). Skriv att fars dag är 8 november och kommer
   fortare än man tror. Mejlet ska stressa redan den 29 september. **Fars dag-rabatten 30 %
   börjar med första fars dag-mejlet.**

## Beslut sessionen tog (står i svaret till Axel)

- **30 % i varje mejl 30/9 till 22/10**, även gräsklippargrejerna (Axel sa 25-30, en siffra
  överallt är tydligare). Marginalen är kontrollerad: med 30 % har ingen produkt i mejlen
  mindre än 32 % kvar (Shopifys inköpspris per variant, mätt 2026-09-29; `mc-satesoverdrag`
  saknar inköpspris).
- **Gräsklippargrejerna säljs som "säsongen är slut", inte "utförsäljning"**: varorna tar
  inte slut, så ordet utförsäljning hade varit ett påstående vi inte kan stå för.
- **En kod per anledning**, alltid 30 %, en gång per kund, bara mejlets produkter, räknad på
  dagens pris. **FARSDAG30 bärs av alla elva fars dag-mejl** och slutar måndag 19 oktober,
  alltså samma dag som den räknade sista beställningsdagen, utan att mejlen säger något om
  frakt. Fars dag-mejlen räknar ner till att REAN slutar.
- **Bästsäljarna (K23) ersätts av tofflorna** till köparna av skor och tofflor, och ett nytt
  mejl samma kväll går till gräsklippar- och trimmerköparna (K38; breddat samma eftermiddag
  till tier 1 + köparna, se K38 nedan). **Fisket (K39)** går till
  fiskeköparna måndag 5/10. **K29 blir kalendermejlet** (PAPPA15-mejlet behövs inte när
  varje fars dag-mejl har FARSDAG30); fars dag har då elva mejl.
- **Nya segment i Spoks 2026-09-29:** Köpare tofflor & skor `e79329e4-b0e0-4d1e-b1cc-cfa4060dec88`
  (237), Köpare gräsklippare & trimmer `0e7af15f-f5cf-4b7d-9395-ee0d37abaf23` (321), Köpare
  fiske `90b1bc60-237b-4d67-9fc0-880921a542e2` (390). Samma bygge som de åtta förra (samtycke +
  `purchasedProducts`).
- **De gamla koderna BASTSALJARE15, FROST15 och PAPPA15 stängs** (`rea-kod.mjs --avaktivera`).

## Koderna (alla 30 %, start 08:00 svensk tid, slut 23:59:59 svensk tid)

| Kod | Mejl | Start (UTC) | Slut (UTC) | I mejlet |
|---|---|---|---|---|
| TOFFLOR30 | K23 | 2026-09-30T06:00:00Z | 2026-10-04T21:59:59Z | till och med söndag 4 oktober |
| GRAS30 | K38 | 2026-09-30T06:00:00Z | 2026-10-04T21:59:59Z | till och med söndag 4 oktober |
| BAT30 | K02, K24 | 2026-10-01T06:00:00Z | 2026-10-04T21:59:59Z | till och med söndag 4 oktober |
| FROST30 | K25 | 2026-10-03T06:00:00Z | 2026-10-07T21:59:59Z | till och med onsdag 7 oktober |
| FARSDAG30 | K26, K28, K30, K31, K32, K05, K33, K15, K34, K35, K36 | 2026-10-04T06:00:00Z | 2026-10-19T21:59:59Z | till och med måndag 19 oktober |
| HUSVAGN30 | K27 | 2026-10-05T06:00:00Z | 2026-10-08T21:59:59Z | till och med torsdag 8 oktober |
| FISKE30 | K39 | 2026-10-05T06:00:00Z | 2026-10-08T21:59:59Z | till och med torsdag 8 oktober |
| TERMO30 | K03 | 2026-10-06T06:00:00Z | 2026-10-09T21:59:59Z | till och med fredag 9 oktober |
| SOTAR30 | K04 | 2026-10-08T06:00:00Z | 2026-10-11T21:59:59Z | till och med söndag 11 oktober |
| KALENDER30 | K29 | 2026-10-09T06:00:00Z | 2026-10-12T21:59:59Z | till och med måndag 12 oktober |
| KAMERA30 | K06 | 2026-10-15T06:00:00Z | 2026-10-18T21:59:59Z | till och med söndag 18 oktober |
| DAMASK30 | K07 | 2026-10-20T06:00:00Z | 2026-10-23T21:59:59Z | till och med fredag 23 oktober |
| MC30 | K37 | 2026-10-21T06:00:00Z | 2026-10-25T22:59:59Z | till och med söndag 25 oktober |
| LJUS30 | K08 | 2026-10-22T06:00:00Z | 2026-10-25T22:59:59Z | till och med söndag 25 oktober |

Söndag 25 oktober är vintertid (UTC+1), därför 22:59:59Z. Kampanjfilens rabatt-block:
`"rabatt": { "typ": "kod", "kod": "…", "procent": 30, "start": "…", "slut": "…", "handles": [ … ] }`
där `handles` är exakt mejlets produkter. `node klaviyo/rea-kod.mjs --brand baverbutiken --alla`
slår ihop filerna per kod.

## Regler för varje rea-mejl (utöver BRIEFER.md → Gemensamt och `docs/copy-regler.md`)

- **Anledningen först, rabatten sen.** Ämnesrad och hero-rubrik bär anledningen (problemet,
  säsongen, fars dag), aldrig bara "30 %". Axels dom på K23 var just att rabatten saknade
  anledning. Bästa formen när den ryms: anledning + erbjudande, t.ex. "Golvet blir kallt.
  30 % på tofflorna" (max 50 tecken).
- **Problem, agitation, lösning, erbjudande** i den ordningen där mejlet säljer mot ett
  problem (Axels krav för kranmejlet, och bästa formen för de andra problemmejlen också):
  hero = problemet (rubrik + två tre meningar, gärna UTAN produktbild), text = agitationen
  (vad det kostar att låta bli, bara det faktabladet stödjer), produkt = lösningen, sedan
  kodstycket och knappen.
- **Kodstycket**, ett eget `text`-block i varje mejl, i den här formen (anpassa vad koden gäller):
  "Koden KOD ger 30 % på [produkterna i mejlet / uppräkning] till och med [veckodag datum].
  Tryck på knappen så ligger koden redan i kassan, eller skriv in den själv. Rabatten dras i
  kassan, en gång per kund, på priset som står på produktsidan."
- **Knappen som lägger på koden:** `"lank": "rabatt:KOD:produkt:<hero-handle>"` (eller
  `rabatt:KOD:kollektion:<handle>`). Hero-knappen och/eller ett `knapp`-block direkt efter
  kodstycket. Knapptexten kort, t.ex. "Hämta 30 % med FROST30" eller "Skydda kranen för 30 % mindre".
- **Förhandstexten** fortsätter ämnesraden och bär koden och sista dagen när ämnesraden inte gör det.
- **Procent:** bara "30 %" (konverteraren släpper igenom mejlets egen procentsats och inget
  annat, så aldrig "100 % polyester" eller liknande). **Inga belopp i kr**, inga tankstreck
  (— –), ingen leveranstid, aldrig "bara i dag", "sista chansen", "garanti", "öppet köp",
  "30 dagars", "tusentals", "utförsäljning", butikens namn, "dragsko", "förvaringspåse",
  "elastisk", "andas", "ventilerad". Mät med `node klaviyo/spoks/kolla-kampanj.mjs <fil>`.
- **Fakta bara ur faktabladet** (`produkter-fakta.json` i sessionens scratchpad, butikens egna
  produkttexter). Står det inte där skrivs det inte. Inga påhittade kundcitat, inga
  "kunderna säger", inga siffror om försäljning.
- **Tre ämnesrader** med var sitt begär, den första är den som går ut. Tre-frågorstestet i
  `tretest` på ämnesrader, förhandstext, varje rubrik och varje knapptext, ärligt: klarar en
  rad inte testet skrivs den om, den märks aldrig `true` ändå.
- **Hej {{fornamn}},** först i hero-texten som förut.
- `segment` = Spoks-segmentets namn Axel väljer, `exkludera` = `[]`, `planerad` =
  `<datum>T18:00:00+02:00`, `status_plan` = "klar", inga `citat`- eller `erbjudande`-block.
- `namn` följer `MAIL_<YYYYMMDD>_<Prefix>_<KOD>[_n]_<publik>_<awareness>_<slug>_v<n>`;
  ett omskrivet mejl får nästa v-nummer.

## Fars dag-mejlen (elva, alla med FARSDAG30)

- Fars dag är **söndag 8 november**. Säg det och att det **kommer fortare än man tror**.
  Aldrig "om fem veckor" (Axel: "en urgency-minskare").
- **Aldrig att något måste beställas ett visst datum, aldrig "hinna fram", aldrig frakt eller
  leveranstid.** Datumet 19 oktober får bara stå som REANS sista dag, i kodstycket ("till och
  med måndag 19 oktober"), aldrig i ämnesrad eller hero i K26 till K34.
- Brådskan är rean som slutar: K15 (fre 16/10) "sista helgen med fars dag-rean", K35 (sön
  18/10) "i morgon slutar fars dag-rean", K36 (mån 19/10) "i dag är sista dagen på fars dag-rean".
- Tvåläsarregeln från BRIEFER-DAGLIGA gäller: den som köper till en pappa, och pappan själv
  som skickar mejlet vidare som önskelista. Aldrig "din pappa".
- Behåll mejlets produkter och vinkel om inget annat står nedan; byt ut raden om 19 oktober
  mot kodstycket, lägg `rabatt`-blocket, rätta ämnesrader/hero som bär deadline-språk.

## Kalendern 30/9 till 22/10 (alla 18:00)

| Dag | Mejl | Publik | Vinkel | Kod |
|---|---|---|---|---|
| ons 30/9 | **K23** Tofflor (ny) | Köpare tofflor & skor | golvet blir kallt | TOFFLOR30 |
| ons 30/9 | **K38** Gräsklipparen (ny, bred) | Gräsklipparrean 30/9 (tier 1 + köparna, utan toffelköparna) | säsongen är slut | GRAS30 |
| tor 1/10 | K02 | Warmup tier 1 | motorn står ute i sex månader + det som brukar följa med | BAT30 |
| fre 2/10 | K24 | Köpare båt | hela motorn under tak | BAT30 |
| lör 3/10 | K25 | Köpare trädgård & tomt | kranen spricker (PAS) | FROST30 |
| sön 4/10 | K26 | Warmup tier 1 | fars dag kommer fortare än man tror, rean börjar | FARSDAG30 |
| mån 5/10 | K27 | Köpare husvagn & husbil | resten av bilen | HUSVAGN30 |
| mån 5/10 | **K39** Fisket (ny) | Köpare fiske | spöna in, kalendern till december | FISKE30 |
| tis 6/10 | K03 | Warmup tier 1 | immig ruta varje morgon | TERMO30 |
| ons 7/10 | K28 | Warmup tier 1 | fars dag: verkstadspappan | FARSDAG30 |
| tor 8/10 | K04 | Warmup tier 1 | sota innan eldningen | SOTAR30 |
| fre 9/10 | **K29** Kalendrarna (ny vinkel) | Warmup tier 1 | lucka 1 öppnas 1 december | KALENDER30 |
| lör 10/10 | K30 | Köpare trädgård & tomt | fars dag: vedpappan | FARSDAG30 |
| sön 11/10 | K31 | Warmup tier 1 | fars dag: fiskepappan | FARSDAG30 |
| mån 12/10 | K32 | Köpare verkstad & garage | fars dag: prylpappan | FARSDAG30 |
| tis 13/10 | K05 | Warmup tier 2 | fars dag: taket han aldrig kollar | FARSDAG30 |
| ons 14/10 | K33 | Warmup tier 2 | fars dag: pappan som fryser | FARSDAG30 |
| tor 15/10 | K06 | Warmup tier 2 | kameran larmar på personer | KAMERA30 |
| fre 16/10 | K15 | Warmup tier 2 | sista helgen med fars dag-rean | FARSDAG30 |
| lör 17/10 | K34 | Köpare båt | fars dag: båtpappan | FARSDAG30 |
| sön 18/10 | K35 | Warmup tier 2 | i morgon slutar fars dag-rean | FARSDAG30 |
| mån 19/10 | K36 | Warmup tier 2 | i dag är sista dagen på fars dag-rean | FARSDAG30 |
| tis 20/10 | K07 | Warmup tier 2 | höstlovet, blöta stigar | DAMASK30 |
| ons 21/10 | K37 | Köpare MC & fordon | hojen ställs undan | MC30 |
| tor 22/10 | K08 | Warmup tier 2 | mörkret kommer | LJUS30 |

Två skräddarsydda mejl samma dag (5/10) går till olika köpargrupper; den som köpt i båda
grupperna får två mejl den dagen. Det är priset för mindre grupper som träffar hårdare. 30/9
är annorlunda sedan gräsklipparen blev bred (Axels fråga samma eftermiddag): segmentet
"Gräsklipparrean 30/9" tar bort köparna av tofflor och skor, så ingen får två mejl den dagen.

---

## Mejl för mejl

### K23, ons 30/9: Tofflorna (ersätter bästsäljarna)
- **Fil:** `kampanjer/k23-tofflor-golvet.json` (radera `k23-rea-bastsaljarna.json`), id `k23-tofflor-golvet`.
- **Namn:** `MAIL_20260930_Tofflor_S_1_kopare-tofflor_problem_golvet-blir-kallt_v1`
- **Publik:** Köpare tofflor & skor (har köpt skor eller tofflor av oss, oftast strandtofflorna i somras).
- **Produkter:** hero `fodrade-inomhustofflor-kamouflage-herr-40-47`, produktrad
  `plyschtofflor-herr-varma-med-tpr-sula-for-inne-ute`, `tofflor-ergonomiska-tjocksulade-for-inne-ute`,
  `strandtofflor-for-herr-halkfria-tradgardsskor`. Koden TOFFLOR30 gäller alla fyra.
- **Vinkel:** golvet i hallen är iskallt innan kaffet är klart (faktabladets egen öppning).
  Mottagaren vet redan vad våra skor är; nu kommer de fodrade. Strandtofflorna får stå som
  "för den snabba svängen ut i trädgården" om faktabladet bär det.
- **Memo:** "Skräddarsytt rea-mejl till sko- och toffelköparna (Axel 2026-09-29: mindre
  grupper, ett mejl som träffar hårdare). Hypotes: den som köpt skor av oss köper tofflor när
  kylan kommer och en kod med slutdag ger anledningen; mätt på köp per mottagare mot K02."
- **Taggar:** typ S · kalla egen-data · kalla_ref `segmentet Köpare tofflor & skor 2026-09-29` ·
  avatar den som köpt skor eller tofflor av oss · begär varma fötter i hallen i vinter ·
  awareness problem · urgency sasong + slutdag (4 oktober) · confidence medium · prefix Tofflor · kod S.

### K38, ons 30/9: Gräsklipparen, säsongen är slut (nytt)
- **Fil:** `kampanjer/k38-grasklipparen-sasongsslut.json`, id `k38-grasklipparen-sasongsslut`.
- **Namn:** `MAIL_20260930_Grasklippare_S_1_tier1-kopare-grasklippare_problem_sasongen-ar-slut_v2`
  (v1 var `…_kopare-grasklippare_…_v1`).
- **Publik:** **Gräsklipparrean 30/9** `d4f13555-2710-4f1b-ac18-aa9db74ef5b9` (2 578 vid
  skapandet): samtycke och (Warmup tier 1 eller köpt någon av de elva), utan den som köpt tofflor
  eller skor. **Ändrat 2026-09-29 eftermiddag efter Axels fråga:** "ska vi verkligen ta samma
  personer som har köpt sådana innan och sälja det samma igen, eller kan vi inte boka ut en om
  gräsklippningsgrejerna till alla?" Sessionens svar: brett, men inom uppvärmningen (tier 1 är
  vecka 40:s breda publik; All subscribed först vecka 45), med köparna kvar eftersom de har
  gräsmattan, och utan toffelköparna eftersom de får tofflorrean samma kväll (2 697 före
  undantaget, 119 undantagna, mätt med `preview_segment`: 2 697 − 119 = 2 578). Heron skrevs om
  för en publik som inte köpt av oss (v1 sa "Du har handlat till klipparen eller trimmern hos
  oss"). **Mätningen svarar på Axels fråga:** GRAS30-ordrar per mottagare hos de **318** i
  segmentet som redan köpt klippar- eller trimmergrejer mot de **2 260** som inte gjort det
  (`preview_segment` 2026-09-29; ordrarnas kunder slås upp mot köparsegmentet efter 4/10).
- **Produkter:** produkt `grasklippartacke-600d-oxford-med-dragsko`; produktrad "Gör klipparen klar för
  vintern": `rengoringsborste-for-grasklippare-uteplats-10-tum-3-taggad`,
  `grasklipparslipare-for-borrmaskin-dubbelsidig-slipsten`, `rullknivslipen-i-tra-20-vinkeln-ar-redan-bestamd`,
  `satesoverdrag-for-akgrasklippare-slittaligt-600d-oxford`, `vaggfaste-for-grastrimmer-kraftig-verktygshallare`;
  produktrad "Trimmergrejerna, också 30 %": `axelbalte-for-trimmer-justerbart-nylonbalte`,
  `trimmersele-med-ergonomiska-axelremmar-justerbar-barsele`, `dubbel-axelrem-for-trimmer-rojsag-kraftig-nylonsele`,
  `trimmerlina-2-4-mm-100-m-5-sidig-for-grastrimmer-kanttrimmer`,
  `staltradsborsthuvuden-for-trimmer-kraftiga-ogras-mossrojare`. GRAS30 gäller alla elva.
- **Vinkel (PAS):** säsongen är slut och klipparen ställs undan. Hur den står i vinter avgör
  hur den startar i vår: regn, löv och sol på en oskyddad maskin, slö kniv (faktabladen för
  täcket och sliparen bär det). Lösning: täck, slipa, häng upp trimmern. Erbjudandet: 30 %
  på allt för klipparen och trimmern till och med söndag, för att säsongen är slut. Skriv
  aldrig "utförsäljning" eller att något tar slut.
- **Memo:** "Säsongsslut-rea brett: Warmup tier 1 plus gräsklippar- och trimmerköparna, utan
  toffelköparna. Hypotes: vinterförvaringen (täcke, slipning, väggfäste) ger en äkta anledning
  i oktober för alla som har gräsmatta, och trimmergrejerna följer med på samma kod; mätt på
  GRAS30-ordrar per mottagare, köpare mot icke-köpare." (Hela texten i filen.)
- **Taggar:** typ S · kalla egen-data · avatar den som klipper sin egen gräsmatta · begär att
  klipparen startar i vår · awareness problem · urgency sasong + slutdag (4 oktober) ·
  confidence medium · prefix Grasklippare · kod S.

### K02, tor 1/10: Motorn står ute i sex månader (omskriven)
- **Fil:** behåll `kampanjer/k02-baten-ska-upp.json`. **Namn:** `MAIL_20261001_Batmotorskydd_S_1_tier1_problem_motorn-star-ute_v2`
- **Publik:** Warmup tier 1. **Produkter:** hero `batmotorskydd-420d-heltackande-for-utombordare`,
  produktrad "Det som brukar följa med, också 30 %": `marin-motorholje-420d-universellt-skydd`,
  `batsitsoverdrag-210d-vadertaligt-stolsskydd`, `fiskespohallare-4-pack-kraftig-forvaring`.
  BAT30 gäller de fyra (och K24:s produkter).
- **Vinkel:** Axel gillade rubriken, behåll "Motorn står ute i sex månader" som första
  ämnesrad. Problem (regn, snö, frost i sex månader, en blank motor syns från vägen), lösningen,
  och sen en tydlig rad om att **det som brukar följa med i samma order** (motorhöljet,
  sitsöverdraget, spöhållaren; paren kommer ur våra egna ordrar, kartläggningen 2026-09-24)
  **också är 30 % billigare med samma kod**.
- **Memo:** behåll det gamla och lägg till: "Rea 30 % med BAT30 till och med söndag 4 oktober
  (Axel 2026-09-29: rabatt på båtöverdraget och på det som brukar följa med)."
- **Taggar:** urgency `sasong + slutdag (4 oktober)`, awareness problem, resten som förut.

### K24, fre 2/10: Båtköparna, hela motorn under tak (rea tillagd)
- **Fil:** behåll `kampanjer/k24-batkopare-nasta-steg.json`. **Namn:** bumpa till `_v2`.
- **Publik:** Köpare båt. **Produkter:** som förut (hero `batmotorskydd-420d-heltackande-for-utombordare`,
  `motorlas-i-rostfritt-stal-laser-utombordarens-fastskruvar`, `marin-fortojningslina-elastisk-uv-talig`,
  `spolklamma-for-batmotor-testvattenklamma`). BAT30, samma slut som K02.
- **Vinkel:** Axel: "bra grejer här, det är bara att vi behöver fixa rea". Behåll mejlet,
  lägg kodstycket och rabattknappen, låt förhandstexten bära BAT30 och söndagen. Ta bort
  meningen i memo om att båtköparna inte får rabatt. Förtöjningslinan: skriv aldrig ordet
  "elastisk" (konverteraren stoppar det).

### K25, lör 3/10: Kranen spricker (PAS, 30 %)
- **Fil:** behåll `kampanjer/k25-tradgard-frosten.json`. **Namn:** `MAIL_20261003_Kranskydd_S_1_kopare-tradgard_problem_kranen-spricker_v2`
- **Publik:** Köpare trädgård & tomt. **Produkter:** som förut. **FROST30** (ersätter FROST15).
- **Ordning (Axels krav):** hero UTAN produktbild med problemet (första köldknäppen fryser
  vattnet i utekranen, isen spränger kran eller ledning), text med agitationen (skadan syns
  först när det tinar och läcker; det händer den natt du inte tänkt på kranen), sen produkten
  (kranskyddet som lösning), sen kodstycket + knapp, sist produktraden (tunnan, IBC, krukorna)
  som också gäller med koden, och fakta. Ämnesraden bär problemet.

### K26, sön 4/10: Fars dag kommer fortare än man tror (rean börjar)
- **Fil:** behåll `kampanjer/k26-fars-dag-listan.json`. **Namn:** `MAIL_20261004_Farsdag_GT_4_tier1_promo_farsdag-rean-borjar_v2`
- **Publik:** Warmup tier 1. **Produkter:** som förut (sex presenter, tre pappor).
- **Vinkel:** Fars dag är söndag 8 november och kommer fortare än man tror. I dag börjar fars
  dag-rean: 30 % på presenterna med FARSDAG30. Stressen ska kännas redan nu: presenten som
  köps i sista stund blir en nödlösning. Inget om beställningsdatum eller frakt. Ämnesrad 1
  bär fars dag-närheten och gärna "30 %"; exempel att slå: "Fars dag kommer fortare än du tror".

### K27, mån 5/10: Husvagnsköparna, resten av bilen (rea tillagd)
- **Fil:** behåll `kampanjer/k27-husvagn-resten.json`, bumpa namnet. **HUSVAGN30**, produkterna som
  förut. Lägg kodstycket + rabattknappen, förhandstext med koden och torsdagen.

### K39, mån 5/10: Fisket (nytt)
- **Fil:** `kampanjer/k39-fiske-kalendern.json`, id `k39-fiske-kalendern`.
- **Namn:** `MAIL_20261005_Rodholder_S_1_kopare-fiske_solution_ett-drag-om-dagen_v1`
- **Publik:** Köpare fiske (många har redan spöhållaren, så den är INTE hero).
- **Produkter:** hero `adventskalender-fiskedrag-24-drag-bakom-24-luckor`; produktrad
  `linupprullare-aluminium-snabbt-linbyte-pa-rullen`, `fiskeset-med-forvaringslada-komplett-fiskeredskapsset`,
  `mini-fiskespo-set-teleskopiskt-dubbelsidigt`, `magnetfiskesats-320lb-neodymmagnet-med-10m-rep`,
  `fiskespohallare-for-bat-2-pack-i-kraftig-nylon`, `fiskespohallare-4-pack-kraftig-forvaring`.
  FISKE30 gäller alla sju.
- **Vinkel:** Kalendern med ett drag bakom varje lucka i december (faktabladet), och vinterns
  underhåll av grejerna (ny lina på rullen, ordning i lådan). Axel: "30 % på fiskegrejer, där
  vi har fiskekalendern med". Inget om "Sveriges snabbast växande hobby" (obelagt).
- **Memo:** "Skräddarsytt rea-mejl till fiskeköparna. Hypotes: kalendern är nyheten för den
  som redan har spöhållaren, och 30 % med slutdag gör december-köpet till ett oktober-köp;
  mätt på köp per mottagare och andelen kalendrar."
- **Taggar:** typ S · kalla egen-data · avatar den som köpt fiskegrejer av oss · begär nya drag
  och ordning på grejerna · awareness solution · urgency pris + slutdag (8 oktober) ·
  confidence medium · prefix Rodholder · kod S.

### K03, tis 6/10: Immig ruta varje morgon (omskriven, utan citat)
- **Fil:** behåll `kampanjer/k03-termoskydd-kundernas-ord.json`, bumpa namnet, segment
  "Warmup tier 1", exkludera `[]`. **Ta bort citat-blocket** (ingen recensionscache, och
  kundcitat skrivs aldrig för hand). **TERMO30** på `termoskydd-husbil-211-171-cm-utvandigt-och-morklaggande`
  (+ `fonstertermomatta-2-pack-70-80-cm-isolering-mot-kyla-och-sol` som andra produkt om det passar).
  PAS: den immiga rutan varje morgon, lösningen, koden.

### K28, ons 7/10: Fars dag, verkstadspappan
- Behåll fil och vinkel. Byt raden om 19 oktober mot kodstycket (FARSDAG30), rabattknapp på
  hero, ämnesrader utan deadline. Namn bumpas.

### K04, tor 8/10: Sota innan eldningen
- Behåll fil och vinkel, segment "Warmup tier 1", exkludera `[]`. **SOTAR30** på
  `sotarset-med-bojliga-stanger-rensar-rokkanal-och-kaminror`. Kodstycke + rabattknapp.

### K29, fre 9/10: Alla kalendrarna (ny vinkel, samma Spoks-utkast)
- **Fil:** `kampanjer/k29-alla-kalendrarna.json` (radera `k29-rea-presenterna.json`), id `k29-alla-kalendrarna`.
- **Namn:** `MAIL_20261009_Adventskalender_S_1_tier1_promo_lucka-1-kalender30_v1`
- **Publik:** Warmup tier 1. **KALENDER30** på alla fjorton kalendrar:
  `adventskalender-racingbilar-24-bilar-bakom-24-luckor`, `dinosaurie-adventskalender-24-dinosaurier`,
  `pussel-adventskalender-24-dagar-med-pusselbitar`, `ishockey-adventskalender-24-luckor-med-hockeyprylar`,
  `gor-din-egen-adventskalender-24-tomma-askar-att-fylla`, `highland-cow-kalendern-3d-24-figurer-en-ny-ko-varje-dag`,
  `adelstenskalendern-24-luckor-grav-fram-en-sten-varje-dag`, `adventskalender-fiskedrag-24-drag-bakom-24-luckor`,
  `golf-adventskalender-24-golftillbehor`, `whisky-adventskalender-24-dekorflaskor`,
  `ol-adventskalender-24-olflaskor-som-julgranspynt`, `sprit-adventskalender-24-dekorflaskor`,
  `cocktail-adventskalender-24-cocktailflaskor-i-akryl`, `husbilskalendern-24-luckor-retrobussar-och-campingprylar`.
- **Vinkel:** lucka 1 öppnas 1 december, och den som köper kalendern nu slipper leta i
  november. En kalender för varje sorts mottagare (gruppera i två produktrader efter vem de
  passar, enligt faktabladen). Knappen: `rabatt:KALENDER30:kollektion:adventskalendrar`.
  Inget om leveranstid; "köp tidigt" motiveras av rean som slutar måndag 12 oktober.
- **Memo:** "Axels beställning 2026-09-29: en kampanj för alla kalendrar. Hypotes: 30 % med
  slutdag flyttar kalenderköpet från november till oktober; mätt på köp per mottagare och
  vilka kalendrar som säljer."
- **Taggar:** typ S · kalla egen-data · avatar den som köper kalender till någon · begär en
  kalender som passar just den mottagaren · awareness promo · urgency pris + slutdag (12 oktober) ·
  confidence medium · prefix Adventskalender · kod S.

### K30, K31, K32, K05, K33, K34 (fars dag 3–9)
- Behåll fil, produkter och vinkel. Byt raden om 19 oktober mot kodstycket (FARSDAG30),
  rabattknapp på hero, ämnesrader och urgency-taggar utan deadline ("Hinn beställa innan 19
  oktober" i K31 byts). K05 och K34 (sista fars dag-mejlen före slutet) får säga att rean
  slutar måndag 19 oktober i förhandstexten. K05: segment "Warmup tier 2", exkludera `[]`.

### K06, tor 15/10: Kameran larmar på personer (omskriven, utan citat)
- Behåll fil och vinkel, **ta bort citat-blocket**, segment "Warmup tier 2", exkludera `[]`.
  **KAMERA30** på `overvakningskamera-tradlos-dubbellins-ptz-med-ai-sparning`. Kodstycke + knapp.

### K15, fre 16/10: Sista helgen med fars dag-rean
- Behåll fil och produkter, segment "Warmup tier 2", exkludera `[]`. Brådskan är att rean
  slutar på måndag, aldrig beställningsdag eller frakt. Ämnesrad t.ex. "Sista helgen med fars dag-rean".

### K35, sön 18/10: I morgon slutar fars dag-rean
### K36, mån 19/10: I dag är sista dagen på fars dag-rean
- Behåll produkterna. Hela brådskan flyttas från beställning till rean. Inga ord om att hinna
  fram eller frakt.

### K07, tis 20/10: Höstlovet (rea tillagd)
- Behåll fil och vinkel, segment "Warmup tier 2", exkludera `[]`. **DAMASK30** på
  `damasker-vandring-haller-sno-vata-grus-ute`. Ta bort "100 % polyester" (bara "polyester").

### K37, ons 21/10: MC-köparna, hojen ställs undan (rea tillagd)
- Behåll fil och vinkel. **MC30** på mejlets fyra produkter.

### K08, tor 22/10: Mörkret kommer (rea tillagd)
- Behåll fil och vinkel, segment "Warmup tier 2", exkludera `[]`. **LJUS30** på mejlets fyra produkter.
