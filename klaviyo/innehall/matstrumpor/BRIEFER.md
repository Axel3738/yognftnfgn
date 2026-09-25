# Briefer: Matstrumpors mejl i Klaviyo, första omgången (skrivna 2026-09-25)

Huvudsessionen skrev strategin, källorna och strukturen här. Copyn skrivs av
Sonnet-subagenter (CLAUDE.md regel 6) till `kampanjer/<id>.json` och
`floden/<id>.json`, i formatet i `klaviyo/ARKITEKTUR.md`.

**Det här är en KALLSTART i ett nytt konto (UV6Rqg).** Inget mejl har skickats,
inga lärdomar finns. Evolve-regeln "inga fler nya koncept än skrivna lärdomar"
(`docs/os/CS-KLART.md` punkt 8) ger K01–K04 `klar`; K05–K14 byggs och laddas upp
som utkast med `status_plan: utkast-skrivs-om-efter-lardom` (Black Week K09–K10
är `klar`, Axels beslut). Flödena är `klar`: de är motorn, inte ett test.

## Vad datan säger (ur `klaviyo/evolve/ATERKOP-ANALYS-matstrumpor.md`, mätt 2026-09-25)

- **Julprodukt:** dec 2025 1 613 ordrar, jan 799, feb 655, mars 280, april–juli under
  10 per månad, sep 197. November 2025 bara 52: sushilådan tog slut (Axel 2026-09-24).
- **Sushin är 92 % av strumpenheterna.** 84 % av ordrarna bär två lådor (Köp 1 – Få 1).
- **Återköp:** 1,2 % av köparna, 38 av 44 köpte samma sushilåda igen, median 19 dagar,
  86 % av återköpen i december–mars. **Inget produktpar har stöd** ⇒ inga
  korsförsäljnings- eller tipsflöden per produkt.
- **Leverans:** order → levererad median 11,4 dygn, p90 14,9 ⇒ `leverans_p90_dygn` 15.
  Sista beställning fars dag **lör 24/10**, jul **tis 8/12**.
- **Samtycke:** 2 890 subscribed av 4 357 profiler i Klaviyo (Shopify: 2 892 av 4 362).
- **Recensioner:** bara sushin har (8 st, snitt 4,5; 5★ ×5). Citatblock bara där.

## Gemensamt för alla mejl

- **Fakta bara ur tre källor:** produktsidorna (`https://matstrumpor.se/products/<handle>`
  och deras `.json`), `products/matstrumpor/dna.md` och analysen ovan. Står en
  egenskap inte där får den inte skrivas. Produktfakta som är avlästa 2026-09-25:
  - **Sushi-Strumpor** (`sushi-strumpor`, 5-pack 399 kr, inget jämförpris över priset —
    **säg aldrig spara/rea om sushin**): 5 par strumpor rullade som sushibitar,
    sushilåda som ser ut som takeaway tills man öppnar den, ätpinnar av trä ingår,
    onesize 36–44. Produktsidans egna rader: "Ingen jublar åt tvättmedel. Ingen sparar en
    skämtpryl. Den roliga håller en kväll, sen hamnar den i en byrålåda. Den praktiska gör
    nytta, men pappret rivs av i tystnad. Du slipper välja: den här är rolig i kväll och på
    fötterna i morgon." "De tror att det är riktig sushi tills de inser vad det egentligen
    är. De tittar två gånger. Sen skrattar de." (får användas, men tankstrecken skrivs bort)
  - **Pizza-Strumpor** (`pizza-strumpor`, 449 kr, jämförpris 599): pizzakartong, varje
    "slice" är strumpor, 4 par färgglada strumpor.
  - **Hamburgare-Strumpor** (`hamburger-strumpor`, 299 kr, jämförpris 499): burgerbox,
    2 par strumpor vikta som en hamburgare.
  - **Donut-strumpor** (`donut-strumpor`, 299 kr, jämförpris 499): 3 par rullade som
    donuts i en färgglad box, produktsidan säger "passar perfekt till barn".
  - **Presentkort** (`presentkort`, 150 kr): riktigt Shopify-presentkort (`isGiftCard`),
    levereras digitalt via mejl, mottagaren väljer själv i butiken.
  - **Erbjudandet på sajten:** "Köp 1 – Få 1 GRATIS" och "Köp 2 – få 2" ligger på
    produktsidorna som bundle-block (rabattkoderna SUSHI-K1F1 m.fl.). Får nämnas med
    orden "köp 1, få 1" (så står det på sajten), aldrig som procent eller kronor, och
    aldrig med en mekanik copyn inte kan belägga (säg "det står på produktsidan").
- **Regler:** `docs/copy-regler.md` i sin helhet och `docs/os/EPOST-STRATEGI.md` §9.
  Inga tankstreck (— eller –). **Inga kronbelopp i copyn** (priset kommer ur
  produktblocken). **Leveranstiden står aldrig i ett mejl** (spårningssidan visar den).
  Returfönstret står i fakta-blocket ("30 dagars returrätt"), skriv det aldrig i copyn.
  Inga påhittade recensioner (bara citat-blocket), inga påhittade siffror.
  Butikens namn står i avsändare, logga och sidfot, **inte som budskapet**.
  Ingen falsk brådska: bara sista beställningsdagarna (24/10, 8/12) och Black Weeks
  datum (23–30/11) är riktiga orsaker. "Sålde slut i november förra året" är ett sant
  faktum och får stå som faktum, men copyn lovar aldrig att det tar slut i år.
- **Rösten:** en liten svensk butik som säljer en rolig present. Rak, torr humor,
  du-tilltal, korta stycken, inga utropsteckenkaskader. Ingen grundarsignatur (Axel
  är inte butikens ansikte här; kundtjänst skriver under som "Kundtjänst Matstrumpor").
  **Använd inga `grundare`- eller `rentext`-block**, inga `erbjudande`-block (finns inte).
- **Klubben (Axels beslut 2026-09-25: "det måste vara som ett medlemskap att vara med i
  Matstrumpors klubb"):** listan är ett medlemskap, **Matstrumpor-klubben**
  (`brands/matstrumpor.json` → `klubb`). Namnet står under loggan i varje mejl, och
  sidfoten säger "Du får det här för att du själv anmälde dig till Matstrumpor-klubben."
  Att vara medlem = att stå på listan. **Inga medlemsrabatter, koder, poäng, medlemsnummer
  eller "först av alla"** — det finns inte och lovas aldrig; det medlemmen får är mejlen
  (sista beställningsdagarna, kundernas ord, vad som ligger i lådan, Black Week-mejlet).
  Copyn får kalla mottagaren medlem och nämna klubben; butikens namn är ändå inte
  budskapet. Sajtens anmälningsruta säger "Gå med i Matstrumpor-klubben" / "Gå med"
  (`klaviyo/klubb-sajt.mjs`).
- **Ämnesraderna:** tre stycken, varje mot ett EGET begär (Evolve: tre varianter). Max 50
  tecken när det går. Förhandstexten fortsätter ämnesraden och upprepar den inte.
- **Tre-frågorstestet** redovisas i `tretest` för ämnesraderna, förhandstexten, varje
  rubrik och varje knapptext.
- **Segment (uppvärmningstrappan, EPOST-STRATEGI §4):** vecka 1–2 (K01–K02)
  `SEG_uppvarmning_steg1`, vecka 3–4 (K03–K04) `SEG_engagerade_60d`, vecka 5–6 (K05–K06)
  `SEG_engagerade_90d`, från vecka 7 (K07–K14, hela julsäsongen) `SEG_samtycke`.
  `exkludera` är alltid `["SEG_oengagerade_180d"]`. Motivet: 90 % av listan är
  förra julens köpare som aldrig fått ett mejl; de nås först när domänen är uppvärmd,
  och det är i november pengarna finns.
- **Sändtid:** tisdagar 18:00 svensk tid (ISO med +02:00 till 24/10, +01:00 från 25/10).
- **Taggar:** `prefix` = produkten (`Sushi`, `Pizza`, `Hamburgare`, `Donut`, `Mix`,
  `Presentkort`, `Julklapp`), `kod` = vinkeln (GT present, SP kundernas ord, PD problem,
  CS erbjudande, S säsong, OB invändning, M mejlspecifikt).
- **Avatarer** (`products/matstrumpor/dna.md`): `presentkoparen` (kvinna 30–55 som
  köper till mamma, brorsa, partner, väninna), `julstrumpefyllaren` (samma köpare i
  oktober–december), `skamtaren` (den som vill se dubbeltitten).

---

## Kampanjer

### K01, tis 29 sep: De tror att det är riktig sushi
- **Fil:** `kampanjer/k01-de-tror-att-det-ar-sushi.json` · status_plan `klar`
- **Namn:** `MAIL_20260929_Sushi_PD_1_uppvarmning_product_de-tror-att-det-ar-sushi_v1`
- **Produkt:** `sushi-strumpor` (hero + produktblock). Citat: `sushi-strumpor`, 2.
- **Memo (hypotes):** Det enda som bevisats i annonserna är avslöjandet: en riktig
  mottagare öppnar lådan, tror att det är sushi, skrattar (Nathalie, 29 köp, +3 078 kr
  vinstbidrag, 3,4 % köp per landningssidevisning, `dna.md` mönster 1). Hypotes: samma
  ögonblick i text, till dem som nyss köpt, säljer en låda till, eftersom 38 av 44
  återköpare köpte just samma sushi igen.
- **Taggar:** typ I · kalla egen-data · kalla_ref `products/matstrumpor/dna.md:56-63` +
  `klaviyo/evolve/ATERKOP-ANALYS-matstrumpor.md` · avatar presentkoparen · begar
  tillhorighet (att vara den som ger presenten alla pratar om) · awareness product ·
  urgency ingen · confidence medium · prefix Sushi · kod PD.
- **Block:** hero (avslöjandet: de tittar två gånger, sen skrattar de) → text (vad som
  händer när lådan öppnas, ur produktsidan) → punkter "Det här ligger i lådan" (5 par,
  ätpinnar, lådan, onesize 36–44) → citat (2) → produkt → fakta.
- **Tre begär i ämnesraderna:** skrattet/dubbeltitten · att ge en present som används ·
  nyfikenhet på vad som är i lådan.

### K02, tis 6 okt: Ingen jublar åt tvättmedel
- **Fil:** `kampanjer/k02-ingen-jublar-at-tvattmedel.json` · status_plan `klar`
- **Namn:** `MAIL_20261006_Sushi_PD_2_uppvarmning_problem_ingen-jublar-at-tvattmedel_v1`
- **Produkter:** hero `sushi-strumpor`; produktrad `pizza-strumpor`, `hamburger-strumpor`,
  `donut-strumpor` ("Till nästa person").
- **Memo:** Produktsidans egna motsatspar (rolig present som hamnar i byrålådan mot
  praktisk present som rivs upp i tystnad) är butikens tydligaste problemformulering och
  har aldrig testats som mejl. Hypotes: problemet "presenten som glöms" säljer bättre än
  produktbeskrivning till den som redan känner lådan.
- **Taggar:** typ N · kalla egen-data · kalla_ref `https://matstrumpor.se/products/sushi-strumpor`
  (produktsidans copy, avläst 2026-09-25) · avatar presentkoparen · begar status (att
  ge en present som varken är tråkig eller onödig) · awareness problem · urgency ingen ·
  confidence medium · prefix Sushi · kod PD.
- **Block:** hero (motsatsparet) → text (den här är rolig i kväll och på fötterna i
  morgon) → produkt (sushi) → produktrad (3, rubrik "Till nästa person") → fakta.
- **Tre begär:** slippa ge en tråkig present · slippa ge något som slängs · vara den
  som ger den som används.

### K03, tis 13 okt: Kundernas ord, ordagrant
- **Fil:** `kampanjer/k03-kundernas-ord.json` · status_plan `klar`
- **Namn:** `MAIL_20261013_Sushi_SP_1_engagerade60d_product_kundernas-ord_v1`
- **Produkt:** `sushi-strumpor`. Citat 2 (Judge.me: "Underbara strumpor, mottagaren vart
  så glad" (Kent), "Jättefina i rolig förpackning! Snabb leverans" (Wide Pia)).
- **Memo:** 8 recensioner, snitt 4,5, fem 5-stjärniga. I annonserna förlorade
  klippkompilationer med "social proof" (haiku, `dna.md` döda koncept), men de var
  AI-klipp, inte riktiga kunders ord. Hypotes: riktiga recensioner ordagrant, med
  mottagarens reaktion i kundens egna ord, konverterar till dem som ännu inte köpt.
- **Taggar:** typ I · kalla egen-data · kalla_ref `klaviyo/output/matstrumpor/recensioner.json`
  (Judge.me, 2026-09-25) · avatar presentkoparen · begar trygghet (att presenten
  landar rätt) · awareness product · urgency ingen · confidence medium · prefix Sushi · kod SP.
- **Block:** text (kort: det här skrev kunderna) → citat (2) → produkt → fakta.
  Copyn får ALDRIG skriva en recension själv, bara citat-blocket.
- **Tre begär:** veta att mottagaren blir glad · veta att det inte är en bluff · se
  bevis före köp.

### K04, tis 20 okt: Fars dag, beställ senast lördag 24 oktober
- **Fil:** `kampanjer/k04-fars-dag-bestall-senast-24-okt.json` · status_plan `klar`
- **Namn:** `MAIL_20261020_Mix_GT_1_engagerade60d_solution_fars-dag-24-okt_v1`
- **Produkter:** hero `sushi-strumpor`; produktrad `hamburger-strumpor`, `pizza-strumpor`,
  `donut-strumpor`.
- **Memo:** Fars dag 8/11 är första presentdagen. Sista beställningsdag lördag 24
  oktober är räknad med p90 15 dygn (brandfilen) och är brådskan, med riktig orsak.
  Ingen data säger vilken sort pappor får; sushin är storsäljaren och står som hero.
- **Taggar:** typ S · kalla egen-data · kalla_ref `klaviyo/brands/matstrumpor.json#kalender`
  · avatar presentkoparen (till pappa) · begar slippa-krangel (ha presenten klar i tid) ·
  awareness solution · urgency konsekvens (efter 24/10 hinner den inte fram) ·
  confidence medium · prefix Mix · kod GT.
- **Block:** hero (datumet, skrivet "24 oktober") → text (varför datumet: paketet ska
  hinna fram, INGEN leveranstid i dagar) → produkt (sushi) → produktrad (3) → fakta.
- **Tre begär:** hinna i tid · en present pappa faktiskt använder · slippa leta.

### K05, tis 27 okt: Gissa vad jag la i julstrumpan
- **Fil:** `kampanjer/k05-julstrumpan.json` · status_plan `utkast-skrivs-om-efter-lardom`
- **Namn:** `MAIL_20261027_Sushi_S_1_engagerade90d_solution_gissa-vad-jag-la-i-julstrumpan_v1`
- **Produkt:** `sushi-strumpor` (hero, produkt). Citat 2.
- **Memo:** Julstrumpan är avataren `julstrumpefyllaren` (dna.md): Nathalie "spara till
  julstrumpan", Sofie H2 "den enda sushin som hör hemma i en julstrumpa", Gilz 024
  "Gissa vad jag la i julstrumpan?" (annonshookar i kontot). Hypotes: julstrumpan gör
  lådan till en självklar julsak redan i oktober, före Black Week-bruset.
- **Taggar:** typ I · kalla egen-data · kalla_ref `products/matstrumpor/dna.md:117` ·
  avatar julstrumpefyllaren · begar njutning (dubbeltitten på julafton) · awareness
  solution · urgency sasong · confidence medium · prefix Sushi · kod S.
- **Block:** hero (julstrumpan) → text → punkter (varför den får plats: lådan, 5 par,
  ätpinnar) → produkt → citat (2) → fakta.

### K06, tis 3 nov: I november förra året tog de slut
- **Fil:** `kampanjer/k06-slut-i-november-forra-aret.json` · status_plan `utkast-skrivs-om-efter-lardom`
- **Namn:** `MAIL_20261103_Sushi_CS_1_engagerade90d_product_slut-i-november-forra-aret_v1`
- **Produkt:** `sushi-strumpor` (hero, produkt); produktrad `pizza-strumpor`,
  `hamburger-strumpor`, `donut-strumpor`.
- **Memo:** "Dom sålde slut i november förra året" är den enda brådskan i hela
  annonskontot, och den sitter i den enda annonsen över break-even med volym
  (`dna.md` mönster 2, bekräftat av Axel 2026-09-24; Shopify: 52 ordrar i nov 2025 mot
  1 613 i dec). Hypotes: faktumet, rakt berättat, får den som ändå ska köpa till jul att
  göra det nu. Copyn lovar ALDRIG att det tar slut i år, och nämner inte lagersaldo.
- **Taggar:** typ I · kalla egen-data · kalla_ref `products/matstrumpor/dna.md:64-68` ·
  avatar julstrumpefyllaren · begar kontroll (ha julklappen klar innan det är sent) ·
  awareness product · urgency konsekvens (ett sant faktum om förra året, ingen klocka) ·
  confidence medium · prefix Sushi · kod CS.
- **Block:** hero (vad som hände förra november) → text → produkt → produktrad (3) → fakta.

### K07, tis 10 nov: Två lådor, två personer
- **Fil:** `kampanjer/k07-tva-lador-tva-personer.json` · status_plan `utkast-skrivs-om-efter-lardom`
- **Namn:** `MAIL_20261110_Sushi_CS_2_samtycke_promo_tva-lador-tva-personer_v1`
- **Produkter:** hero `sushi-strumpor`; produktrad `pizza-strumpor`, `hamburger-strumpor`,
  `donut-strumpor`.
- **Memo:** 84 % av ordrarna bär två lådor, och bildannonsen med erbjudandet
  (`offer_static_d3`, Köp 2 – få 2) gav 6,7 % köp per visning (`dna.md` mönster 3).
  Hypotes: att säga rakt ut att den andra lådan är till nästa person på listan
  (mamma OCH brorsan) lyfter ordervärdet till hela listan. Erbjudandet nämns med
  sajtens egna ord "köp 1, få 1", som det står på produktsidan, utan mekanik och siffror.
- **Taggar:** typ I · kalla egen-data · kalla_ref `products/matstrumpor/dna.md:69-71` +
  `klaviyo/evolve/ATERKOP-ANALYS-matstrumpor.md` (84 %) · avatar presentkoparen ·
  begar spara-tid (två presenter i ett köp) · awareness promo · urgency ingen ·
  confidence medium · prefix Sushi · kod CS.
- **Block:** hero → punkter "Två personer på listan" (tre konkreta par: mamma och
  brorsan, kollegan och partnern, barnen och farfar) → produkt (sushi) → produktrad
  (3, "Andra sorter, samma erbjudande på produktsidan") → fakta.

### K08, tis 17 nov: Julklappsguiden, en sort per person
- **Fil:** `kampanjer/k08-julklappsguide.json` · status_plan `utkast-skrivs-om-efter-lardom`
- **Namn:** `MAIL_20261117_Mix_GT_2_samtycke_solution_julklappsguide_v1`
- **Produkter:** fyra `produkt`-block med egen text: `sushi-strumpor` (till den som
  älskar sushi eller aldrig skulle gissa), `pizza-strumpor` (4 par, till den som delar
  med sig, familjen), `hamburger-strumpor` (2 par, burgerboxen, till brorsan/pappan),
  `donut-strumpor` (3 par, till barnen, produktsidans egna ord).
- **Memo:** Bäverbutikens guide grupperar per mottagare; här är fyra sorter, en per
  person. Hypotes: en tydlig "till vem" per låda säljer fler sorter än sushin ensam
  (i dag 92 % sushi). Julens sista beställningsdag 8/12 nämns en gång.
- **Taggar:** typ N · kalla egen-data · kalla_ref produktsidorna + analysen (92 %) ·
  avatar presentkoparen · begar slippa-krangel (en lista, fyra klappar) · awareness
  solution · urgency sasong · confidence low (gissning om sorterna) · prefix Mix · kod GT.
- **Block:** hero (sushi) → text (fyra sorter, fyra personer) → produkt ×4 med text →
  text (beställ senast 8 december så hinner det till jul) → fakta.

### K09, mån 23 nov: Black Week börjar, trappan
- **Fil:** `kampanjer/k09-black-week-start.json` · status_plan `klar`
- **Namn:** `MAIL_20261123_Mix_CS_3_samtycke_promo_black-week-trappan_v1`
- **Produkter:** hero `sushi-strumpor`; produktrad alla fyra.
- **Memo:** Axels beslut 2026-09-25: samma trappa som Bäverbutiken på hela sajten,
  23–30 november, 10 % på 1 vara, 20 % på 2, 30 % på 3 eller fler, automatiskt i
  kassan utan kod. K09 öppnar veckan och förklarar trappan så den förstås på fem
  sekunder. Procenten är en rabatt Axel beslutat och får stå som procent (aldrig kronor).
- **Taggar:** typ S · kalla egen-data · kalla_ref "Axels beslut 2026-09-25 (Black Week
  10/20/30)" · avatar presentkoparen som ändå ska handla till jul · begar spara-pengar ·
  awareness promo · urgency pris · confidence high · prefix Mix · kod CS.
- **Block:** hero → punkter "Så funkar trappan" (1 vara 10 %, 2 varor 20 %, 3 eller
  fler 30 %) → produktrad (4, "Kombinera för nästa nivå") → fakta.

### K10, fre 27 nov: Black Friday, trappan gäller till måndag
- **Fil:** `kampanjer/k10-black-friday.json` · status_plan `klar`
- **Namn:** `MAIL_20261127_Mix_CS_4_samtycke_promo_black-friday-till-mandag_v1`
- **Produkter:** hero `pizza-strumpor` (egen hero, inte en upprepning av K09);
  produktrad alla fyra.
- **Memo:** Samma trappa, egna krokar: sista helgen, trappan gäller till och med måndag
  30 november. Inte en upprepning av K09.
- **Taggar:** typ S · kalla egen-data · kalla_ref samma som K09 · begar spara-pengar ·
  awareness promo · urgency pris · confidence high · prefix Mix · kod CS.
- **Block:** hero → produktrad (4) → punkter (trappan, kort) → fakta.

### K11, tis 1 dec: Beställ senast tisdag 8 december
- **Fil:** `kampanjer/k11-bestall-senast-8-dec.json` · status_plan `utkast-skrivs-om-efter-lardom`
- **Namn:** `MAIL_20261201_Julklapp_GT_3_samtycke_promo_bestall-senast-8-dec_v1`
- **Produkter:** hero `sushi-strumpor`; produktrad alla fyra.
- **Memo:** Riktig brådska: efter tisdag 8 december (23 dec minus p90 15 dygn) räknar
  vi inte med att paketet hinner fram till jul. Mejlet säger datumet rakt ut och lovar
  inget efter det. Ingen leveranstid i dagar.
- **Taggar:** typ M · kalla egen-data · kalla_ref `klaviyo/brands/matstrumpor.json#kalender`
  · begar kontroll (hinna) · awareness promo · urgency konsekvens · confidence medium ·
  prefix Julklapp · kod GT.
- **Block:** hero (datumet) → produktrad (4) → fakta.

### K12, tis 8 dec: Sista dagen i dag
- **Fil:** `kampanjer/k12-sista-dagen-idag.json` · status_plan `utkast-skrivs-om-efter-lardom`
- **Namn:** `MAIL_20261208_Julklapp_GT_4_samtycke_promo_sista-dagen-i-dag_v1`
- **Produkter:** hero `sushi-strumpor`, produktrad `pizza-strumpor`, `hamburger-strumpor`,
  `donut-strumpor`.
- **Memo:** Samma orsak som K11, sista dagen. Egna krokar (i dag, inte "snart").
- **Taggar:** som K11, kod GT, nr 4.
- **Block:** hero → produkt (sushi) → produktrad (3) → fakta.

### K13, tis 15 dec: Julklappen som kommer i mejlen
- **Fil:** `kampanjer/k13-presentkortet.json` · status_plan `utkast-skrivs-om-efter-lardom`
- **Namn:** `MAIL_20261215_Presentkort_M_1_samtycke_solution_julklappen-som-kommer-i-mejlen_v1`
- **Produkt:** `presentkort` (produktblock). Ingen produktrad med strumpor som
  "hinner fram", för de gör det inte.
- **Memo:** Efter 8/12 lovar vi ingen leverans före jul. Presentkortet är ett riktigt
  Shopify-presentkort (`isGiftCard`, avläst 2026-09-25) och levereras digitalt via
  mejl; mottagaren väljer sort själv efter jul. Hypotes: det räddar den sena köparen.
  Copyn får säga "skickas digitalt/som mejl", inte lova en tid i minuter.
- **Taggar:** typ M · kalla egen-data · kalla_ref Shopify (isGiftCard) · avatar
  presentkoparen som är sen · begar slippa-krangel · awareness solution · urgency
  konsekvens · confidence low · prefix Presentkort · kod M.
- **Block:** text (rubrik: hinner inte, men) → produkt (presentkort, knapp "Köp presentkortet") →
  text (så funkar det: mottagaren får en kod och väljer själv) → fakta.

### K14, tis 29 dec: Vem har födelsedag härnäst?
- **Fil:** `kampanjer/k14-vem-har-fodelsedag-harnast.json` · status_plan `utkast-skrivs-om-efter-lardom`
- **Namn:** `MAIL_20261229_Mix_GT_5_samtycke_solution_vem-har-fodelsedag-harnast_v1`
- **Produkter:** hero `sushi-strumpor`; produktrad alla fyra.
- **Memo:** Januari 2026 hade 799 ordrar och februari 655 (Shopify), alltså är
  eftersäsongen inte död, men orsaken (annonser? presentkort?) är okänd: GISSNING.
  Hypotes: presenten är inte bunden till jul; nästa födelsedag är alltid nära.
- **Taggar:** typ N · kalla gissning · kalla_ref null · avatar presentkoparen · begar
  slippa-krangel · awareness solution · urgency ingen · confidence low · prefix Mix · kod GT.
- **Block:** hero → text → produktrad (4) → fakta.

---

## Flöden

Underlag: `klaviyo/evolve/FLODESRESEARCH.md` (Klaviyos guider), analysen ovan och
Bäverbutikens omgång 2 (`klaviyo/innehall/baverbutiken/floden/`, facit för formen).
Alla mejl laddas upp som utkast. Inga `grundare`-, `rentext`- eller `erbjudande`-block.

### F01 Välkomst: `floden/f01-valkomst.json`, `FLOW_lista_valkomst_v2`
- Trigger `{ typ: lista, lista: "Email List" }` (Shopify-synkens lista i kontot, 2 891
  profiler). Filter `samtycke`, `ej_kopt_sedan_start`. Återinträde aldrig (alltime).
- **E1 direkt, v3 = den exklusiva medlemskänslan** (`f01-valkomst-e1`,
  `FLOW_prenumerant_E1_M_du-ar-invald-i-klubben_v3`, 2026-09-25 kväll, Axel: "det ska
  kännas som ett exklusivt medlemskap"): hero "Du är invald i klubben" (din plats är klar,
  du gick med så den är din; vad butiken säljer; mejlen går bara till medlemmar; knapp "Se
  alla lådorna" → kollektion `alla-produkter`) → **medlemskort** (blocket `medlemskort`:
  mörkt kort, "MEDLEMSKORT", förnamnet eller "Medlem", "Medlem i Matstrumpor-klubben",
  fotnot "Ingen kassapersonal frågar efter det här kortet.") → punkter "Det här får bara
  medlemmar" (sista beställningsdagen inför fars dag och jul bara till medlemmar, Black
  Week-mejlet bara för medlemmar, kundernas riktiga ord utan att leta, lådans innehåll visat
  innan köp) → produktrad "Sushi, donut och pizza" → fakta. Ingen rabattkod. Copy av Sonnet;
  huvudsessionen strök "bara här"/"bara i mejl" på två punkter (recensionerna och lådans
  innehåll syns även på produktsidan). v2 (`…_valkommen-till-klubben_v2`) var vänlig men
  slätstruken; v1 (`…_ser-ut-som-sushi-ar-strumpor_v1`) en ren produktförklaring.
  **Alla mejl** bär sedan v3 eyebrow-raden "Klubbpost. Inte för alla." under klubbnamnet och
  sidfoten "Du anmälde dig själv till Matstrumpor-klubben, och mejlen går bara till
  medlemmar." (`brands/matstrumpor.json` → `klubb.eyebrow`, `sidfot_varfor`).
- **E2 +2 dagar** (`f01-valkomst-e2`, `FLOW_prenumerant_E2_SP_det-har-skrev-kunderna_v1`):
  citat (sushi, 2) → produkt (sushi) → produktrad (pizza, hamburgare, donut) → fakta.
- **E3 +3 dagar** (`f01-valkomst-e3`, `FLOW_prenumerant_E3_M_sa-funkar-det-nar-du-handlar_v1`):
  text (så funkar det: paketnummer som börjar på MS, spårningssidan, 30 dagars retur står i
  fakta-blocket, kundsupport svarar) → fakta → knapp (kollektion `alla-produkter`).

### F02 Övergiven kassa: `floden/f02-overgiven-kassa.json`, `FLOW_checkout_overgiven_v1`
- Trigger metrik `["Checkout Started"]`. Filter `samtycke`, `ej_kopt_sedan_start`.
  Återinträde 7 dagar. Shopifys egen notis stängs av när flödet går live (Axels klick).
- **E1 +3 timmar**: text (varukorgen är kvar) → dynamisk `checkout_rader`.
- **E2 +1 dag** (kod OB): text (tre frågor innan du betalar: passar de? onesize 36–44;
  ångrar jag mig? fakta-blocket; vem svarar? kundsupport@matstrumpor.se) → dynamisk
  `checkout_rader` → fakta.
- **E3 +2 dagar**: text (sista påminnelsen, ingen nedräkning, ingen "korgen töms") →
  dynamisk `checkout_rader`.

### F03 Webbhistorik: `floden/f03-webbhistorik.json`, `FLOW_visad-produkt_webbhistorik_v1`
- Trigger metrik `["Viewed Product"]` (brandfilen väljer `R9yPAm`). Filter `samtycke`,
  `ej_kopt_sedan_start`, `ej_checkout_sedan_start`. Återinträde 14 dagar.
- **E1 +4 timmar**: text (en mening) → dynamisk `visad_produkt`.
- **E2 +1 dag**: dynamisk `visad_produkt` → fakta → produktrad (tre andra sorter).

### F04 Efter köp: `floden/f04-efter-kop.json`, `FLOW_order_efterkop_v1`
- Trigger metrik `["Fulfilled Order"]` (bär spårningsnumret). Filter `kundundantag`
  (MFL 19 § andra stycket, Axels beslut B 2026-09-25). Återinträde 30 dagar.
- **E1 +3 dagar** (`FLOW_order_E1_M_din-bestallning-ar-pa-vag_v1`): text (rubrik: din
  beställning är på väg; tryck på knappen så ser du var paketet är) → knapp "Följ ditt
  paket" med `lank: "sparning:"` → text (frågor: kundsupport@matstrumpor.se). Ingen
  leveranstid, inget erbjudande.
- **E2 +13 dagar** (dag 16, p90 15) (`FLOW_order_E2_M_kom-allt-fram_v1`): text (kom allt
  fram? saknas något, mejla) → produktrad (pizza, hamburgare, donut, rubrik "Till nästa
  person") → fakta.

### F05 Vinback: `floden/f05-vinback.json`, `FLOW_order_vinback_v1`
- Trigger metrik `["Placed Order"]`. Filter `kundundantag`, `ej_kopt_sedan_start`.
  Återinträde 90 dagar. **Väntan 90 dagar** (analysen: nästan inga återköp efter 60 d,
  men 86 % av återköpen sker december–mars, så en höstköpare får mejlet i december).
- **E1 dag 90** (`FLOW_order_E1_GT_vem-star-pa-tur_v1`): text (nästa person på listan,
  nästa tillfälle) → produktrad (alla fyra) → fakta.
- **E2 +14 dagar** (`FLOW_order_E2_SP_kundernas-ord_v1`): citat (sushi, 2) → produkt
  (sushi) → fakta. Sista mejlet i flödet.

### F06 Sunset: `floden/f06-sunset.json`, `FLOW_segment_sunset_v2`
- Trigger segment `SEG_oengagerade_180d`. Filter `samtycke`. Återinträde aldrig.
  Samma två mejl som Bäverbutikens v2 (rubrik, två meningar, stor knapp), E2 +5 dagar.
  Knappen pekar på kollektion `alla-produkter`. **v2 (2026-09-25): frågan gäller platsen i
  Matstrumpor-klubben** — E1 "Vill du vara kvar i Matstrumpor-klubben?" (knapp "Ja, håll
  mig kvar"), E2 "Det här är sista mejlet från klubben" (hör vi inget tar vi bort dig från
  klubben, knapp "Ja, ha kvar mig"). Inte "listan".

**Alla sju flödena är v2 sedan 2026-09-25 eftermiddag:** fonten Mochiy Pop P One ligger i
varje mall, och en flödesmall kopieras in i flödet när det skapas — så ett nytt flöde
krävdes för varje. F02–F05 och F07 har oförändrad copy; bara namnet bytte version.

### F07 Återköp: `floden/f07-aterkop-sushi.json`, `FLOW_order_aterkop-sushi_v1`
- Trigger metrik `["Placed Order"]` med `produkt_innehaller: ["Sushi-Strumpor"]`.
  Filter `kundundantag`, `ej_kopt_sedan_start`. Återinträde 60 dagar.
- **E1 +21 dagar** (`FLOW_order_E1_M_en-lada-till-till-nasta-person_v1`): det enda
  mönstret i datan är samma sushilåda igen (38 av 44, median 19 d): text (en låda
  till, till nästa person på listan) → produkt (sushi) → produktrad (pizza, hamburgare,
  donut, "Eller en annan sort") → fakta. Ett mejl, inte en serie.

**Inga tipsflöden per produkt:** inget produktpar och inga produktfakta som motiverar
ett tipsmejl (strumpor). Byggs när datan säger något annat.
