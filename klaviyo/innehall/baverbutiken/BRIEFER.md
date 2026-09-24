# Briefer: Bäverbutikens mejl i Klaviyo, första omgången (skrivna 2026-09-24)

Huvudsessionen skrev strategin, källorna och strukturen här. Copyn skrivs av
Sonnet-subagenter (CLAUDE.md regel 6) till `kampanjer/<id>.json` och
`floden/<id>.json`, i formatet i `klaviyo/ARKITEKTUR.md`.

**Det här är en KALLSTART.** Kontot har aldrig skickat en kampanj, och det finns
inga lärdomar från mejl. Evolve-regeln "inga fler nya koncept än skrivna lärdomar"
(`docs/os/CS-KLART.md` punkt 8) betyder därför att bara K01–K04 är `klar`. K05–K14
byggs och laddas upp som utkast, med `status_plan: utkast-skrivs-om-efter-lardom`.
De skrivs om när lärdomarna från K01–K04 finns (`klaviyo/logg/baverbutiken/kampanjlogg.md`).
Flödena är `klar`, eftersom de är motorn och inte ett test av ett koncept.

## Gemensamt för alla mejl

- **Fakta bara ur två källor:** produktsidan (`https://baverbutiken.se/products/<handle>.json`
  eller sidan själv) och produktminnet som anges per brief. Står en egenskap inte där
  får den inte skrivas. Inga siffror med "kr" i copyn, eftersom priset kommer ur
  produktblocken.
- **Regler:** `docs/copy-regler.md` i sin helhet, och `klaviyo/ARKITEKTUR.md` → Järnregler 6–7.
  Inga tankstreck. Skriv "5-10 arbetsdagar" och "14 dagars ångerrätt". Butiksnamnet
  hör hemma i avsändaren och sidfoten, inte i budskapet. Ingen falsk brådska.
- **Rösten:** en liten svensk nätbutik med ett riktigt namn bakom, Axel. Rakt och
  konkret, lite torr humor, inga utropstecken-kaskader. Du-tilltal. Korta stycken.
- **Ämnesraderna:** tre stycken, och varje riktar sig mot ett EGET begär (Evolve:
  tre varianter, en variabel var). Max 50 tecken när det går. Förhandstexten
  fortsätter ämnesraden och upprepar den inte.
- **Tre-frågorstestet** redovisas i `tretest` för ämnesraderna, förhandstexten, varje
  rubrik och varje knapptext.
- **Segment:** vecka 1–2 (K01–K04) `SEG_uppvarmning_steg1`, vecka 3–4 (K05–K08)
  `SEG_engagerade_60d`, därefter `SEG_engagerade_90d`. `exkludera` är alltid
  `["SEG_oengagerade_180d"]`. Källan är Klaviyos uppvärmningstrappa, se
  `docs/os/EPOST-STRATEGI.md`.
- **Sändtid:** 18:00 svensk tid, tisdagar och torsdagar. Det är en gissning och ett
  eget test. Ingen data finns.

---

## Kampanjer

### K01, tis 29 sep: Taköverdraget inför vinterförvaringen
- **Fil:** `kampanjer/k01-takoverdrag-vinterforvaring.json`
- **Namn:** `MAIL_20260929_Takoverdrag_PD_1_uppvarmning_problem_taket-du-aldrig-kollar_v1`
- **Produkt:** `takoverdrag-husvagn-6-5-3-m-skyddar-den-dyraste-ytan`. Storsäljare nr 1:
  36 % av intäkten senaste 30 d, 471 ordrar.
- **Memo (hypotes):** Problemvinkeln "taket du aldrig kollar" bar mest spend och
  flest köp i annonserna (16 köp, CPA 226 kr). Den största invändningen i
  kommentarerna, fukt och kondens (38 %), har aldrig besvarats i någon annons. Ett
  mejl som både väcker problemet och svarar på fukten borde konvertera bättre än
  annonsen, eftersom mottagaren redan känner butiken.
- **Taggar:** typ I · kalla egen-data · kalla_ref `products/carashell/takskyddet/dna.md:56-58`
  + `products/takoverdraget-husvagn/invandningar.md:18-30` · avatar husvagnsägaren
  som ställer av vagnen för vintern · begär slippa läckor och fuktskador till våren ·
  awareness problem · urgency sasong (vinterförvaring sep–okt) · confidence medium ·
  prefix Takoverdrag · kod PD.
- **Block:** hero (problemet: det du inte ser uppifrån) → text (vad vinter gör med ett
  husvagnstak, bara det produktsidan belägger) → punkter "Men fukten då?". Svaret på
  invändningen ur produktsidans egna fakta. Står det inget där om ventilation eller
  andning: skriv inget påstående, utan säg vad produkten gör, till exempel att den
  täcker taket och inte väggarna. → produkt → citat (2) → fakta → knapp.

### K02, tor 1 okt: Båten ska upp
- **Fil:** `kampanjer/k02-baten-ska-upp.json`
- **Namn:** `MAIL_20261001_Batmotorskydd_S_1_uppvarmning_solution_baten-ska-upp_v1`
- **Produkter:** hero `batmotorskydd-420d-heltackande-for-utombordare` (storsäljare
  nr 2, 259 ordrar/30 d). Produktrad: `marin-motorholje-420d-universellt-skydd`,
  `batsitsoverdrag-210d-vadertaligt-stolsskydd`, `fiskespohallare-4-pack-kraftig-forvaring`.
  ⚠️ Använd INTE `motorholje-for-utombordare-taligt-skydd`, som har jämförpris under priset.
- **Memo:** Båtägarna köper ihop. Motorhölje, sitsöverdrag, förtöjningslina och
  spöhållare är de vanligaste paren i ordrarna (60 d). Ett säsongsmejl med en
  checklista ("det här ska på innan båten ställs undan") testar om en lista säljer
  fler produkter per order än ett enproduktsmejl, mätt som AOV mot K01.
- **Taggar:** typ S · kalla egen-data (köpta-tillsammans-paren i kartläggningen
  2026-09-24) + `products/motorholjet/dna.md:85,98` (PD_1_H3 är benchmark) ·
  avatar båtägaren som tar upp båten i oktober · begär att båten ska vara i skick
  till våren utan jobb · awareness solution · urgency sasong · confidence medium
  (båtmotorskyddet saknar egen dna.md, märk den delen som gissning) · prefix
  Batmotorskydd · kod S.
- **Block:** hero (båtmotorskyddet) → punkter "Innan båten ställs undan" (fyra saker,
  en per produkt, en rad var) → produktrad → text om spöhållaren med den bevisade
  raden "Aldrig mer trassliga fiskespön" (`products/tacklebay/fiskespohallare-4-pack/dna.md:111-122`,
  bar 85 köp; får användas ordagrant) → fakta.

### K03, tis 6 okt: Termoskyddet för husbilen, med kundernas ord
- **Fil:** `kampanjer/k03-termoskydd-kundernas-ord.json`
- **Namn:** `MAIL_20261006_Termoskydd_SP_2_uppvarmning_product_kundernas-ord_v1`
- **Produkt:** `termoskydd-husbil-211-171-cm-utvandigt-och-morklaggande`
- **Memo:** Kundomdömen i bild (`Termoskydd_SP_2_1`) gav annonsens högsta CTR, 7,04 %,
  och vittnesmålet `SP_2` hade bästa CPA (149 kr). Erbjudandevinkeln med mest köp
  bygger på falsk brådska och får inte användas. Hypotes: riktiga recensioner
  ordagrant (Judge.me) plus höstens problem, kalla nätter och imma, konverterar utan
  brådska.
- **Taggar:** typ I · kalla egen-data · kalla_ref `products/carashell/termoskyddet/dna.md:70-82`
  · avatar husbilsägaren som kör hösten ut · begär varm och torr hytt utan imma på
  morgonen · awareness product · urgency sasong · confidence medium · prefix
  Termoskydd · kod SP.
- **Block:** hero (en kundröst överst, alltså citat-block först, sedan hero) → citat (2)
  → text (vad skyddet gör, ur produktsidan) → produkt → fakta. Ingen "bara idag".

### K04, tor 8 okt: Sota innan du eldar
- **Fil:** `kampanjer/k04-sotarset-fore-eldning.json`
- **Namn:** `MAIL_20261008_Sotarset_N_1_uppvarmning_problem_sota-innan-du-eldar_v1`
- **Produkt:** `sotarset-med-bojliga-stanger-rensar-rokkanal-och-kaminror`
  (storsäljare nr 8, 91 ordrar/30 d).
- **Memo:** Nytt koncept utan produktminne. Säsongsvinkel: eldningssäsongen börjar
  och det svåråtkomliga röret. Hypotes: säsongen gör problemet aktuellt nog för att
  sälja utan bevisad vinkel. Det är en GISSNING och står som det.
- **Taggar:** typ N · kalla gissning · kalla_ref null · avatar villaägaren med kamin
  eller braskamin · begär att elda tryggt i vinter utan att ringa någon för varje
  rör · awareness problem · urgency sasong · confidence low · prefix Sotarset · kod PD.
- **Block:** hero → text (böjliga stänger, vad de når, bara ur produktsidan) → punkter
  (tre saker settet gör) → produkt → fakta.
- **Förbud:** inga påståenden om brandrisk, lagkrav eller sotningsplikt. Sotning är
  reglerat, och vi har ingen källa.

### K05, tis 13 okt: Fars dag, beställ senast 19 oktober
- **Fil:** `kampanjer/k05-fars-dag.json` · status_plan `utkast-skrivs-om-efter-lardom`
- **Namn:** `MAIL_20261013_Takoverdrag_GT_2_engagerade60d_product_farsdag-19okt_v1`
- **Produkter:** hero `takoverdrag-husvagn-6-5-3-m-skyddar-den-dyraste-ytan`,
  produktrad `balteslipmaskin-mini-3-i-1-knivslip-polerare`,
  `fiskespohallare-4-pack-kraftig-forvaring`, `overvakningskamera-tradlos-dubbellins-ptz-med-ai-sparning`.
- **Memo:** Presentvinkeln "han älskar husvagnen" (`Takoverdrag_GT_2_H1`) är den
  annons som gett mest vinstbidrag, 8 202 kr på 14 köp, CPA 107 kr. Fars dag
  (8 nov) är den första riktiga presentdagen. Sista beställningsdag 19 okt är
  räknad med p90 20 dygn (`klaviyo/brands/baverbutiken.json`), och den är brådskan,
  med riktig orsak.
- **Taggar:** typ I · kalla egen-data · kalla_ref `products/carashell/takskyddet/dna.md:56-66`
  · avatar den som letar present till en pappa med husvagn, båt eller verkstad ·
  begär en present han faktiskt använder · awareness solution · urgency konsekvens
  (hinner inte fram efter 19 okt) · confidence medium · prefix Takoverdrag · kod GT.
- **Block:** hero (presentvinkeln) → produkt → produktrad "Om han inte har husvagn" →
  text om sista beställningsdagen, med datumet skrivet ut ("19 oktober") → fakta.

### K06, tor 15 okt: Ett ljud på tomten klockan tre
- **Fil:** `kampanjer/k06-kamera-ljud-klockan-tre.json` · status_plan `utkast-skrivs-om-efter-lardom`
- **Namn:** `MAIL_20261015_Overvakningskamera_PD_2_engagerade60d_problem_ljud-klockan-tre_v1`
- **Produkt:** `overvakningskamera-tradlos-dubbellins-ptz-med-ai-sparning` (storsäljare nr 4)
- **Memo:** Problemöppningen "Ett ljud på tomten klockan tre" hade bäst hook rate,
  43,1 %, men bara 2 köp, alltså stoppar den men är inte bevisad på köp. Social proof
  i video bar 65 % av vinstbidraget. Hypotes: kroken som ämnesrad och riktiga
  recensioner som bevis ger både öppning och köp. Höstmörkret gör kroken aktuell.
- **Taggar:** typ I · kalla egen-data · kalla_ref `products/hemvakten/dna.md:122-135`
  · avatar villaägaren som hör något ute på natten · begär att veta vad som händer
  utan att gå ut · awareness problem · urgency ingen · confidence medium · prefix
  Overvakningskamera · kod PD.
- **Block:** hero (klockan tre) → text → citat (2) → punkter (vad kameran gör, bara ur
  produktsidan) → produkt → fakta.
- **Förbud:** "sista chansen" och "priset går upp" (`products/hemvakten/dna.md:146-149`).

### K07, tis 20 okt: Damaskerna, höstlov och älgjakt
- **Fil:** `kampanjer/k07-damasker-hostlov.json` · status_plan `utkast-skrivs-om-efter-lardom`
- **Namn:** `MAIL_20261020_Damasker_PD_1_engagerade60d_solution_torra-fotter_v1`
- **Produkt:** `damasker-vandring-haller-sno-vata-grus-ute`
- **Memo:** Demon av påtagningen (`Damasker_PD_1`: 56 köp, CPA 191 kr) är den enda
  bevisade vinkeln. UGC och social proof har förlorat. Mejlet bygger därför på hur
  lätt de sätts på, i steg, och inte på recensioner. Höstlov v44 och älgjakten
  (sedan 8 okt i södra Sverige) är säsongen.
- **Taggar:** typ I · kalla egen-data · kalla_ref `products/drytrek/dna.md:44-47` ·
  avatar den som går i skogen på hösten, jägaren eller vandraren · begär torra fötter
  och byxben hela dagen · awareness solution · urgency sasong · confidence medium ·
  prefix Damasker · kod PD.
- **Block:** hero → punkter "Så sätter du på dem" (tre steg, ur produktsidan) → produkt → fakta.
  Inget citat-block.

### K08, tor 22 okt: Klockan ställs om på söndag
- **Fil:** `kampanjer/k08-morkret-kommer.json` · status_plan `utkast-skrivs-om-efter-lardom`
- **Namn:** `MAIL_20261022_Solcellslampa_S_1_engagerade60d_problem_morkret-kommer_v1`
- **Produkter:** hero `solcellslampa-med-rorelsesensor-tre-huvuden-210-led`, produktrad
  `solcellslarm-2-pack-siren-och-blixt-vid-rorelse`, `baverlampa-pro`,
  `kepslampa-300-lumen-clip-on-led-pannlampa`.
- **Memo:** Vintertid söndag 25 okt: det blir mörkt en timme tidigare. Inget
  produktminne finns, så det är en GISSNING. Hypotes: en konkret händelse med datum
  gör ett ljusmejl relevant.
- **Taggar:** typ S · kalla gissning · avatar villaägaren med mörk uppfart eller
  trädgård · begär att se var man går när man kommer hem · awareness problem ·
  urgency sasong (25 okt) · confidence low · prefix Solcellslampa · kod S.
- **Block:** hero → text → produkt → produktrad "Mer ljus" → fakta.
  ⚠️ Kepslampan har jämförpris under priset i Shopify. Byggaren stoppar om copyn säger
  spara. Säg aldrig spara om den.

### K09, tis 27 okt: Adventskalendrarna, beställ i tid till 1 december
- **Fil:** `kampanjer/k09-adventskalendrar.json` · status_plan `utkast-skrivs-om-efter-lardom`
- **Namn:** `MAIL_20261027_Adventskalender_PD_2_engagerade90d_product_lucka-ett_v1`
- **Produkter:** hero `adventskalender-racingbilar-24-bilar-bakom-24-luckor`, produktrad
  `adventskalender-fiskedrag-24-drag-bakom-24-luckor`, `golf-adventskalender-24-golftillbehor`,
  `dinosaurie-adventskalender-24-dinosaurier`, `pussel-adventskalender-24-dagar-med-pusselbitar`,
  `ishockey-adventskalender-24-luckor-med-hockeyprylar`.
- **Memo:** Racingbilskalenderns bildannons `PD_2_1` (produkten rakt upp och ner: 8 köp,
  CPA 172 kr, ROAS 3,85) är benchmark. Kalendern ska finnas hemma till lucka 1.
  Senaste säkra beställningsdag är 11 nov (1 dec − 20 dygn), och det är en riktig
  brådska. Hypotes: ett urval kalendrar, en per mottagartyp, säljer fler än en enda.
- **Taggar:** typ I · kalla egen-data · kalla_ref `products/kalender/dna.md:88-89` ·
  avatar föräldern, mor- och farföräldern eller partnern som vill ha en kalender som
  inte är choklad · begär en kalender som passar just den personen · awareness product
  · urgency konsekvens (efter 11 nov hinner den inte till 1 dec) · confidence medium ·
  prefix Adventskalender · kod PD.
- **Block:** hero (racingbilarna) → text "En för varje sorts person" → produktrad (5) →
  text med datumet "11 november" → fakta.

### K10, tor 29 okt: Taköverdraget, iteration på K01
- **Fil:** `kampanjer/k10-takoverdrag-iteration.json` · status_plan `utkast-skrivs-om-efter-lardom`
- **Namn:** `MAIL_20261029_Takoverdrag_OB_4_engagerade90d_product_fukten_v1`
- **Produkt:** `takoverdrag-husvagn-6-5-3-m-skyddar-den-dyraste-ytan`
- **Memo:** Platshållare för vidarebygget på K01. Vinner K01 skrivs det här om till
  tre nya krokar på samma vinkel. Förlorar K01 byter det vinkel till erbjudandet
  (`Takoverdrag_CS_2_H1`, bästa CPA 81 kr). Utkastet skrivs med invändningen i fokus
  (OB): fukt och kondens, 38 % av kommentarerna.
- **Taggar:** typ I · kalla voc · kalla_ref `products/takoverdraget-husvagn/invandningar.md:18-30`
  · avatar som K01 · begär att inte skapa ett fuktproblem · awareness product ·
  urgency sasong · confidence medium · prefix Takoverdrag · kod OB.
- **Block:** hero (invändningen i kundens egna ord: citera kommentaren "Blåser det
  inte sönder??" eller fuktkommentaren ordagrant ur invandningar.md, som en fråga)
  → text (svaret, bara fakta ur produktsidan) → produkt → citat (2) → fakta.

### K11, mån 23 nov: Black Week börjar
- **Fil:** `kampanjer/k11-black-week-start.json` · status_plan `utkast-skrivs-om-efter-lardom`
  · **kraver_axel:** "Rabatt utöver dagens priser i Black Week är ägarens beslut
  (CLAUDE.md regel 12). Utkastet säljer på dagens priser och jämförpriser."
- **Namn:** `MAIL_20261123_Bastsaljare_CS_1_engagerade90d_promo_black-week_v1`
- **Produkter:** produktrad med storsäljarna: takoverdrag, batmotorskydd,
  ibc-tankoverdrag-1000-l-stoppar-alger-uv, overvakningskamera, balteslipmaskin,
  fiskespohallare-4-pack, termoskydd.
- **Memo:** Promo till de mest medvetna (Evolve: de mest medvetna behöver bara
  erbjudande eller brådska). Utan beslut om rabatt är mejlet en översikt över
  storsäljarna under Black Week. Datumen är 23–30 nov.
- **Taggar:** typ M · kalla egen-data (storsäljare 30 d) · awareness promo · urgency
  pris (bara om Axel beslutar en rabatt, annars ingen) · confidence low · prefix
  Bastsaljare · kod CS.
- **Block:** hero → produktrad (6–7) → fakta.

### K12, fre 27 nov: Black Friday
- **Fil:** `kampanjer/k12-black-friday.json` · samma status och kraver_axel som K11.
- **Namn:** `MAIL_20261127_Bastsaljare_CS_2_engagerade90d_promo_black-friday_v1`
- **Memo:** Samma som K11. Mejlet har egna krokar, inte en upprepning av K11.
- **Block:** hero → produktrad (4) → fakta.

### K13, tor 19 nov: Julklappar som hinner fram
- **Fil:** `kampanjer/k13-julklappsguide.json` · status_plan `utkast-skrivs-om-efter-lardom`
- **Namn:** `MAIL_20261119_Julklapp_GT_3_engagerade90d_solution_julklappar-3-dec_v1`
- **Produkter:** tre produktrader (rubriken utan pris i copyn, till exempel "Till den
  som har allt" / "Till båten och stugan" / "Till den som pysslar"):
  (1) whisky-adventskalender-24-dekorflaskor, baverlampa-pro, kepslampa-300-lumen-clip-on-led-pannlampa
  (2) fiskespohallare-4-pack-kraftig-forvaring, mini-fiskespo-set-teleskopiskt-dubbelsidigt, batsitsoverdrag-210d-vadertaligt-stolsskydd
  (3) balteslipmaskin-mini-3-i-1-knivslip-polerare, fagelmatare-med-kamera-och-solcellspanel-se-faglarna-i-appen, overvakningskamera-tradlos-dubbellins-ptz-med-ai-sparning
- **Memo:** Presentvinkeln har bevisats (GT_2_H1). Guiden testar om grupperingar per
  mottagare säljer bättre än en enskild produkt. Sista beställningsdag för jul är
  3 december (23 dec − 20 dygn), och det datumet står i mejlet.
- **Taggar:** typ I · kalla egen-data · kalla_ref `products/carashell/takskyddet/dna.md:56-66`
  · awareness solution · urgency konsekvens · confidence medium · prefix Julklapp · kod GT.

### K14, tis 1 dec: Sista dagen för julklappar är torsdag
- **Fil:** `kampanjer/k14-sista-bestallningsdag-jul.json` · status_plan `utkast-skrivs-om-efter-lardom`
- **Namn:** `MAIL_20261201_Julklapp_GT_4_engagerade90d_promo_sista-dag-3-dec_v1`
- **Produkter:** produktrad med de fyra som sålt mest i K13 (platshållare: takoverdrag,
  fiskespohallare-4-pack, balteslipmaskin, overvakningskamera).
- **Memo:** Riktig brådska: efter torsdag 3 dec hinner paketet inte fram. Mejlet säger
  det rakt ut och lovar inget efter datumet.
- **Taggar:** typ M · kalla egen-data · awareness promo · urgency konsekvens ·
  confidence medium · prefix Julklapp · kod GT.
- **Block:** hero (datumet) → produktrad → fakta.

---

## Flöden

Alla flöden: `filter` börjar med `samtycke`. Alla mejl är utkast (draft).

### F01 Välkomst: `floden/f01-valkomst.json`, `FLOW_prenumerant_valkommen_v1`
- **Trigger:** lista `LISTA_nyhetsbrev`. **Filter:** samtycke, ej_kopt_sedan_start.
  **Återinträde:** aldrig (alltime).
- **Memo:** Kontot har inga signup-formulär (mätt 2026-09-24), och sajtens två
  Shopify-formulär lovar "exklusiva rabatter" utan att någon finns. Välkomstflödet ska
  göra nya prenumeranter till köpare utan rabatt, genom storsäljarna och tryggheten
  (leverans, spårning, ångerrätt). Om en välkomstrabatt ska finnas är Axels beslut.
- **E1** (direkt): välkommen. Vem som står bakom (Axel), vad butiken säljer (prylar
  för båten, husvagnen, trädgården och huset, alltså det sortimentet faktiskt
  innehåller), sedan storsäljarna → produktrad (takoverdrag, batmotorskydd,
  overvakningskamera) → fakta. Taggar: typ M · awareness solution · confidence medium.
- **E2** (+2 dagar): "Det här köper folk just nu". Produktrad (ibc-tankoverdrag,
  balteslipmaskin, fiskespohallare-4-pack, termoskydd) → citat (takoverdrag, 2) → fakta.
- **E3** (+3 dagar): "Så funkar det när du handlar": leverans 5-10 arbetsdagar,
  spårningssidan med paketnummer BB-, 14 dagars ångerrätt, kundsupport. Svaret på
  "vågar jag handla här?" → grundare → knapp till storsäljarna (`kollektion:alla-produkter`).

### F02 Övergiven kassa: `floden/f02-overgiven-kassa.json`, `FLOW_checkout_overgiven_v1`
- **Trigger:** metrik Started Checkout / Checkout Started. **Filter:** samtycke,
  ej_kopt_sedan_start. **Återinträde:** 7 dagar.
- **Memo:** Shopify skickar redan en egen notis om övergiven kassa (`mejl/mallar.mjs:847`).
  Det här flödet ersätter den med tre steg som svarar på invändningarna. Det får gå
  live först när Shopifys notis är avstängd, annars får kunden dubbla mejl. Det är
  Axels klick.
- **E1** (1 timme): "Din varukorg är kvar". dynamisk checkout_rader → knapp till kassan. Kort.
- **E2** (+1 dag): invändningarna. När kommer det (5-10 arbetsdagar, spårningssida)?
  Kan jag ångra mig (14 dagars ångerrätt)? Vem svarar om något strular (kundsupport)?
  → dynamisk checkout_rader → fakta.
- **E3** (+2 dagar): sista påminnelsen, utan falsk brådska. Grundarens röst → dynamisk
  checkout_rader. Inget "varukorgen töms".

### F03 Webbhistorik: `floden/f03-webbhistorik.json`, `FLOW_visad-produkt_paminnelse_v1`
- **Trigger:** metrik Viewed Product. **Filter:** samtycke, ej_kopt_sedan_start,
  ej_checkout_sedan_start. **Återinträde:** 14 dagar.
- **Memo:** Den som tittat men inte gått till kassan är på nivån product. En enkel
  påminnelse om exakt produkten, och trygghet i andra mejlet.
- **E1** (4 timmar): dynamisk visad_produkt, en mening, knapp.
- **E2** (+1 dag): dynamisk visad_produkt → fakta → produktrad storsäljare (3).

### F04 Efter köp: `floden/f04-efter-kop.json`, `FLOW_order_efterkop_v1`
- **Trigger:** metrik Placed Order. **Filter:** samtycke. **Återinträde:** 30 dagar.
- **Memo:** Bara 3,3 % av köparna har köpt igen (mätt i Shopify 2026-09-24).
  Kunderna kommer från en annons för en enda nischprodukt. Flödet ska få andra köpet
  att hända inom samma nisch, med det erbjudande som redan finns: köp igen och få en
  gratisprodukt, lyckohjulet (Axels beslut 2026-09-13). Mejl 1 skickas när paketet
  rimligen har kommit fram (p90 20 dygn).
- **E1** (+20 dagar): "Kom allt fram?" Hjälp om något saknas (spårningssida,
  kundsupport) → erbjudande (lyckohjulet) → produktrad storsäljare (3).
- **E2** (+14 dagar): "Nytt för säsongen". Produktrad (4 säsongsprodukter: sotarset,
  solcellslampa med rörelsesensor, damasker, adventskalender racingbilar) → erbjudande
  → fakta.

### F05 Vinback: `floden/f05-vinback.json`, `FLOW_order_vinback_v1`
- **Trigger:** metrik Placed Order. **Filter:** samtycke, ej_kopt_sedan_start.
  **Återinträde:** 90 dagar.
- **Memo:** Median 13 dagar mellan köp 1 och 2 för de få som köper igen (skevt urval).
  Den som inte köpt på 75 dagar kommer inte av sig själv. Två mejl med det befintliga
  erbjudandet.
- **Steg:** vänta 75 dagar → **E1** "Det har hänt en del sedan sist" (nyheter och
  storsäljare, produktrad 4 → erbjudande) → vänta 10 dagar → **E2** "Hjulet väntar
  fortfarande" (erbjudande → produktrad 3 → fakta).

### F06 Sunset: `floden/f06-sunset.json`, `FLOW_segment_sunset_v1`
- **Trigger:** segment `SEG_oengagerade_180d`. **Filter:** samtycke. **Återinträde:** aldrig.
- **Memo:** Klaviyos sunset-mönster: den som inte öppnat eller klickat på 180 dagar
  trots 5 mejl får två mejl. Klickar hen inte heller då slutar vi skicka, vilket skyddar
  leveransbarheten för alla andra. Steget "sluta skicka" (märka profilen) görs i
  Klaviyo av VA:n (sop E06) tills motorn kan skapa update-profile.
- **E1** (direkt): "Vill du fortfarande ha våra mejl?" Knapp "Ja, fortsätt skicka"
  (länk till butiken, klicket räknas som engagemang) + ärlig rad om att vi annars
  slutar.
- **E2** (+5 dagar): "Det här är sista mejlet", kort och vänligt, knapp.
