# Spoks Bäverbutiken: vad som är kvar (granskning 2026-09-26)

Granskningen läste alla live-flöden och alla kampanjer i Spoks (`f716ae36-68ae-4f1c-a45e-96c35d5637a0`) mot mejlreglerna och verifierade varje fynd en gång till. 31 bekräftade fynd. Källa: get_flow/get_campaign, curl mot Shopify och Judge.me:s API, 2026-09-26 10:30–12:50 CEST.

## Redan gjort 2026-09-26

- Gamla F04 `786d2580-…`: båda sändstegen av (Axels klick). F04 v2 (kredit) `bfc5beee-…` live med KREDIT100.
- F11: väntan 21 d (Axels klick). F08, F09, F10, F12 och F13 står också på 21 d och F14 på 22 d (ändrade i appen samma morgon; stäm av med Axel eller skriv in som avsiktligt).
- **K01 v2** byggd som utkast: `0c760c3e-3eec-4fc0-b40f-3ec16b37e330` (utan de overifierade citaten, storleksraden "nio längder, 5,5 till 13,5 meter", utan dubblettkortet). Gamla K01 `51c37c20-e00c-48c2-b144-089e62f62d14` är fortfarande SCHEMALAGD tis 29/9 18:00 — Axel måste avbryta den och schemalägga v2 i appen.
- **Utkasten rättade i Spoks och i `klaviyo/innehall/baverbutiken/kampanjer/`:** K02 (spöhållaren "i båten eller på väggen", förhandstexten), K03 (citat, dubblettkort, meningen om kylan), K06 (citat, dubblettkort), K08 (dubblettkort), K10 (citat, "en kund skrev", dubblettkort), K13 (whiskykalendern → Bäverlampa Pro + Tändvedsklyv, "kan vi inte lova"), K14 (knappen "Beställ senast torsdag"), K15 ("Sista helgen att beställa till fars dag"), K16 (dubblettkort), K18 (citat, knappen), K21 (omgjord med verifierade recensioner).
- **Koden** (`klaviyo/recensioner.mjs`, `mallar.mjs`, `spoks-paket.mjs`, `spoks/konvertera.mjs`): bara verifierade köp (Judge.me `verified` = `verified-purchase`/`buyer`, widgeten `verified_buyer`) blir citat; API-citat utan namn; produktfilernas recensioner kräver `verifierad: true`.
- Matstrumpors citat kontrollerade: båda är verifierade köp, inget att göra.

⚠️ **K18 får inte schemaläggas** förrän topp 3 mätts om på Shopifys ordrar de senaste 60 dagarna (veckan före 17/11).

## Kontrollen av utkasten (omläsning 2026-09-26 ~13:30 CEST)

- K02, K03, K06, K08, K10, K13, K14, K15, K16, K18, K21 och K01 v2: **OK**, alla `draft`, alla kvarvarande citat är verifierade köp (kollade mot Judge.me:s API). Gamla K01 är orörd och schemalagd MED de falska citaten.
- **F01 E2: 37 kontakter väntar** (get_flow), inte 17 som ett fynd nedan säger.
- **Repot:** payload-filerna för K03, K18 och K21 är inte omgenererade (gammal text kvar). Kör `node klaviyo/spoks/konvertera.mjs` med en färsk recensionscache innan något laddas upp ur repot. Byggs K18 om ur repot blir det två citat; sätt källfilens `antal: 1` om bara Thore K. ska stå kvar.
- K14-knappen `e7235624` saknar spårningslänk (`urlRedirect`), adressen är rätt.
- Konverteraren gör fortfarande dubblettkort (hero med produktbild + samma produkt längre ner). Nästa ombyggnad av payloads ger dem tillbaka tills koden rättas.

## KVAR i LIVE-flödena (MCP:n kan inte ändra ett live-flöde med inrullade kontakter)

Två vägar, båda prövade 2026-09-26: (1) Axel ändrar i appen (han gjorde det i F14 07:46 och F11 10:17), eller (2) sessionen bygger en rättad kopia `… v2` som inaktivt flöde via MCP och Axel slår på sändstegen + flödet och stänger av den gamlas sändsteg (så gjordes F04 v2, och Axel klarade det). Väg 2 kräver inget skrivande av Axel. Ge alltid Axel stegets namn EXAKT som `get_flow` → `parameters.name` visar, aldrig "mejl 2" (han hittade inte "mejl 2").

Stegnamn (get_flow 2026-09-26): F01 = "Axel här. Jag driver Bäverbutiken." → "Tanköverdraget, slipmaskinen och två till" → "Så funkar det när du handlar hos oss". F04 v2 och F14 har INGA stegnamn i get_flow (bara postId) — beskriv dem med ämnesraden och ordningen (första/andra kuvertet efter fördröjningen).

Tidsordning: F01 E2 går ut **mån 28/9 ca 09:03** (37 kontakter väntar), F04 v2 E1 tis 29/9 ca 10:16, K01 tis 29/9 18:00, F04 v2 E2 ca 15/10, F14 ca 18/10 18:00 (42 väntar), F07/F13 först efter nya ordrar på de produkterna, F05 tidigast 2027.

- **[kritisk] F01 E2 (live, 17 kontakter väntar i 2-dagarssteget, första utskick mån 28/9 ca 09:03 CEST): sektionerna 2b5b99c4-0a32-4942-8a18-321c5cd53683 (Karin) och 5f6f5fe5-03cd-4b47-a7b7-8bd1fd65251d (Erik) + förhandstexten, K01 (schemalagd tis 29/9 18:00 CEST): e5ceaddf-5948-4ed4-9712-c256eebdeb53, d21f9ac8-**
  - Fel: "Bra skydd för taket och lätt att använda." Karin, verifierad kund / "Jag är nöjd med överdraget. Rekommenderas." Erik, verifierad kund (F01 E2, K01, K10, K21) · "Praktiskt skydd mot sol och värme." Verifierad kund (K03) · "Lätt att sätta upp och fungerar som den ska." Emma, verifierad kund (K06) · 
  - Varför: Ingen av de citerade recensionerna kommer från en verifierad köpare. Taköverdraget: alla 10 har verified "nothing", adresser @example.com, skapade 2026-09-08 22:48:34–45 UTC (elva sekunder), och produkten publicerades i Shopify 2026-09-07 15:12 CEST, alltså 31 timmar innan. Ingen kund kan ha fått varan. Termoskyddet: "Anonymous", support@judge.me, verified "not-yet", källa wizard (import), 2026-09
  - Rättelse: 1) F01 E2 (i appen, före mån 28/9): ta bort sektionerna 2b5b99c4-0a32-4942-8a18-321c5cd53683 och 5f6f5fe5-03cd-4b47-a7b7-8bd1fd65251d. Ny förhandstext: "IBC-tanköverdraget, slipmaskinen, spöhållaren och termoskyddet." Fungerar det inte i tid kan sändsteget 328b2c5f-bf83-4a16-a20f-85daca70fefe stängas av (isEnabled: false, MCP klarar det). 2) K01 (i appen, före tis 29/9 18:00): ta bort e5ceaddf-5948-4ed4-9712-c256eebdeb53 och d21f9ac8-81e2-4224-8dbf-d395a908427d. Ersätt dem inte med andra citat på taköverdraget, eftersom alla tio är importerade. 3) Utkasten: ta bort K03 1dc1ca00-… och fa5fd926-… (mejlet börjar då med H1 "Imma inifrån, varje morgon"), K06 f13e9b44-… och d476d00a-…, K10 50cc18b

- **[kritisk] F14 E1 (live, 23 kontakter väntar, första utskick ca 18/10 kl 18:00): stjärnblocket 58a07a55-df82-4315-9837-3eb931d4f64f + textblocken 24d172b7-2f93-42b9-8724-c4a9b5180863 och ca17f58a-9e0e-4b56-a688-0301577b4d54**
  - Fel: [★](https://judge.me/product_reviews/c4e17931-2e71-4699-9fb1-e76270b97c7a/new?source=shareable-link) ×3 [★](https://se.trustpilot.com/evaluate/baverbutiken.se?stars=4) [★](https://se.trustpilot.com/evaluate/www.baverbutiken.se?stars=5) + "Alla omdömen, positiva som negativa, hjälper oss lika mycket.
  - Varför: Stjärna 1–3 går till Judge.me:s produktformulär ("Hur skulle du betygsätta denna produkt?"), som butiken själv modererar. Bara stjärna 4–5 går till Trustpilot, så bara nöjda kunder hamnar på den publika Trustpilot-sidan. Det är review gating, förbjudet enligt Trustpilots regler och vilseledande. Meningen om att alla omdömen hjälper lika mycket blir då osann. Repots version skickade alla fem stjärn
  - Rättelse: Block 58a07a55: "[★](https://se.trustpilot.com/evaluate/baverbutiken.se?stars=1) [★](https://se.trustpilot.com/evaluate/baverbutiken.se?stars=2) [★](https://se.trustpilot.com/evaluate/baverbutiken.se?stars=3) [★](https://se.trustpilot.com/evaluate/baverbutiken.se?stars=4) [★](https://se.trustpilot.com/evaluate/baverbutiken.se?stars=5)". Block 24d172b7: "Hej {{ contact.first_name | default: 'där' }}! Paketet från oss har hunnit fram vid det här laget. Klicka på en stjärna och lämna ditt betyg på Trustpilot." Hjälpraden (16284661) står kvar och tar hand om missnöjda kunder. Hinns det inte före 18/10: stäng av sändsteget 257b066d-1148-4ca1-af1e-da513357de54 (isEnabled: false, MCP klarar det).

- **[kritisk] F04 v2 E2 "Kom allt fram som det ska" (live, första utskick ca 15/10): H2 d060aa7e-8b82-49d6-9fb5-10be7334e644 ovanför den fasta produktraden 5aa18a9e-889c-4404-9c4e-c9272e625960**
  - Fel: Andra som köpte det du köpte, köpte även det här
  - Varför: Produktraden är en fast lista (selectionMode manual): Båtmotorskydd 420D, Övervakningskamera och Taköverdrag, samma för alla köpare. Den som köpt taköverdraget får taköverdraget rekommenderat som något "andra som köpte det du köpte" köpte. Återköpsanalysen har bara ett belagt par (motorhölje till båtmotorskydd). Flödet är live med 11–14 inrullade, E2 går 3 + 16 dagar efter ordern.
  - Rättelse: Block d060aa7e: "Tre prylar till att kika på". Produktraden kan stå kvar.

- **[viktig] K01 (schemalagd 29/9 18:00): textblocket c37ef1ca-fcc5-4308-a0cc-bbef36feeab6**
  - Fel: Sex och en halv gånger tre meter, gjort för en normalstor vagn.
  - Varför: Taköverdraget säljs i nio längder, 3 × 5,5 m till 3 × 13,5 m, och den förvalda varianten är 5,5 m. Mejlet låter som att det finns en storlek, så den som har en längre vagn tror att skyddet inte passar. Samma rad står fel på produktsidan ("Täcker takytan på en normalstor vagn – 6,5 × 3 m").
  - Rättelse: Block c37ef1ca, i appen före tis 29/9 18:00: "Finns i nio längder, från 5,5 till 13,5 meter, alla tre meter breda. Välj längden efter din vagn." Rätta också raden på produktsidan i Shopify (Axels klick).

- **[viktig] F01 Välkomst (live): triggern har bara samtyckesfiltret, inget "inte köpt sedan start". Gäller sändstegen 328b2c5f-bf83-4a16-a20f-85daca70fefe (E2) och 7543b93b-51c9-4c48-a10a-dd7c7537dcea (E3)**
  - Fel: Trigger-filter {emailMarketingConsent in [subscribed]} · E3: "Så funkar det när du handlar hos oss" / "Undrar du något innan du handlar …"
  - Varför: Repots F01 (klaviyo/innehall/baverbutiken/floden/f01-valkomst.json) har filtret ["samtycke","ej_kopt_sedan_start"]. Live-flödet saknar det andra. Den som handlar under serien, eller blir prenumerant via samtyckesrutan i kassan, får ändå E2 och E3 med copy för någon som inte handlat än. Samtyckesfiltret finns, så MFL-sidan är i ordning. Det saknade filtret är ett avsteg från planen, inte ett lagbro
  - Rättelse: Lägg ett stegfilter på 328b2c5f och 7543b93b: lastPurchase saknas ELLER lastPurchase < __flow_triggered__ (samma form som F02 och F03 redan använder i sina triggers). Flödet är aktivt, så det görs i appen.

- **[viktig] F02 E2 (live): products-blocket e6c40cac-bb53-4d00-9150-32f2a970e95a under raden 09c28f9f-8ad6-42c3-9cfa-9a9ef31be462**
  - Fel: "Det här ligger kvar i din varukorg" ovanför products-block {selectionMode: dynamic, dynamicCriteria: recently_viewed, dynamicProductsCount: 1}
  - Varför: Blocket visar senast visade produkt, inte kassans innehåll. Kassor med flera varor visar bara en vara, fel vara visas om kunden tittat på annat efteråt, och blocket blir tomt om Spoks saknar visningshändelser. Repots payload (f02-overgiven-kassa-e2.json) har ett abandonedCart-block här, precis som live E1 och E3.
  - Rättelse: Ersätt e6c40cac med ett abandonedCart-block som i F02 E3 (c413e6c2-8877-4325-834e-8368d4921c70): isButtonVisible false, titel, antal och pris synliga. abandonedCartButton 193cb560 står kvar.

- **[viktig] F02 E2 (live): textblocket 31c2bdb7-f6a7-46fc-9554-20b2edd46fd3 + förhandstexten, F01 E3 (live): ingressen 4e0a0d0d-980d-4205-8882-e6cdd46ef0d4 + förhandstexten, F03 E2 (live): förhandstexten**
  - Fel: F02 E2: "Hur lång tid tar det. Kan jag ångra mig. Och vem svarar om något strular. Här är svaren." / förhandstext "Leverans, ångerrätt och vem du kan fråga, kort svarat." · F01 E3: "Inga överraskningar. Så ser det ut från beställning till dörren, och vad du kan göra om något strular." / "Leverans, s
  - Varför: Efter texten följer bara rutorna "14 dagars ångerrätt" och "Spåra paketet". Leveransfrågan besvaras aldrig, och ingen genomgång "från beställning till dörren" finns. Kunden som tvekar i kassan blir påmind om frågan men får inget svar. Frågorna saknar dessutom frågetecken.
  - Rättelse: F02 E2 block 31c2bdb7: "**Hur lång tid tar det?** Du ser beräknad leverans och följer paketet hela vägen på vår spårningssida. **Kan jag ångra mig?** Ja, du har 14 dagars ångerrätt. **Vem svarar om något strular?** Vi på kundsupporten. Svara på det här mejlet eller skriv till kundsupport@baverbutiken.se." Förhandstext: "Spårning, ångerrätt och vem du kan fråga, kort svarat." F01 E3 block 4e0a0d0d: "Inga överraskningar. Du följer paketet hela vägen på vår spårningssida, du har 14 dagars ångerrätt, och du kan alltid mejla oss om något strular." Förhandstext: "Spårning, ångerrätt och vem du mejlar, kort och tydligt." F03 E2 förhandstext: "Produkten igen, och tre andra ifall det inte var den rät

- **[viktig] F04 v2 E1 (live, 11 väntar, första utskick ca 29/9): textblocket 8929af90-1b4d-4b9a-848d-d09012e088d4 ovanför knappen d41e6d8d (FÖLJ DITT PAKET)**
  - Fel: Tryck på knappen så ser du exakt var ditt paket är just nu.
  - Varför: Knappen går till https://baverbutiken.se/pages/spara utan nummer, eftersom Spoks inte kan skicka med spårningsnumret. Sidan visar bara ett sökfält ("Skriv in ditt paketnummer", "Paketnumret börjar med BB och står i ditt leveransmejl"). Löftet kommer från Klaviyo-versionen, där länken bar kundens eget nummer.
  - Rättelse: Block 8929af90: "Tryck på knappen och skriv in paketnumret från leveransmejlet, så ser du var paketet är just nu."

- **[viktig] F04 v2 (flödesinställning): reenrollEnabled true, allowReenrolmentAfter null, kombinerat med E1-blocket 99f460ce-5d52-4178-b1ca-a76158cff31f**
  - Fel: 100 kr rabatt på nästa köp
  - Varför: KREDIT100 är oncePerCustomer: true i Shopify. Varje order_created rullar in kunden på nytt i F04 v2. En kund som använder KREDIT100 på sin andra order får tre dagar senare "100 kr rabatt på nästa köp" igen, och koden nekas i kassan. Beloppen 100 och 299 kr är godkända, felet ligger i återinträdet.
  - Rättelse: Stäng av återinträdet för F04 v2 (reenrollEnabled false). Flödet är aktivt, så det görs i appen. Då får varje kund kreditmejlet en gång, vilket stämmer med "en gång per kund".

- **[viktig] F05 E2 (live, första utskick tidigast ca 2027-02-07): brödtext ebacbad5-cac6-46e0-9902-85f2cea51a4d, H1 64e2cbfd-a1e2-4ad3-8eae-248ae91b976b, H2 5d9f81e1-90dc-4c92-abf3-0a0d8103fdcb, produktrad 993557b2-413f-4a38-96bb-5cc0e97faf96, ämnesrad, förhandstext**
  - Fel: Kort och gott, det här säljer bäst just nu för den tid på året det är. / Säsongens mest köpta
  - Varför: Produktraden är fast: Sotarset, Damasker och Adventskalender Racingbilar. E2 går 120 + 14 dagar efter ordern, året runt. I februari säger mejlet då att en adventskalender säljer bäst "just nu". Inget i repot belägger att de tre är säsongens mest köpta.
  - Rättelse: Ämnesrad och H1 64e2cbfd: "Tre prylar till att kika på". Brödtext ebacbad5: "Kort och gott, här är tre prylar till att kika på." H2 5d9f81e1: ta bort. I 993557b2, byt Adventskalender Racingbilar mot Bävertratt (0772f985-3223-4cd2-8a1f-b04422bdf905). Förhandstext: "Tre prylar till att kika på, sen hör du inget mer om det här från oss."

- **[viktig] F05 E1 (live, första utskick ca 2027-01-24): brödtext 486842b6-33c1-44a6-bf04-f8f1705a5cc8, H2 9997ca85-8989-4253-8ac8-3f3ac843b49e, produktrad 76ded9ed-016c-46a5-ba98-61144c17e7ec, förhandstext**
  - Fel: Här är vad andra kunder som varit borta lika länge brukar handla när de kommer tillbaka. / Det här handlar man ofta efter ett uppehåll / förhandstext: "En liten pryl de flesta väntar för länge med, och tre till."
  - Varför: ATERKOP-ANALYS.md har bara data på dem som kom tillbaka efter mer än 30 dagar (n=69): Bävertratt 14, Marin Motorhölje 8, Taköverdrag 7, Fiskespöhållare 5, Sätesöverdrag 5. Mejlet går efter 120 dagar och säger "lika länge". Båtmotorskydd och Övervakningskamera i raden saknar stöd i det urvalet. "De flesta väntar för länge med" i förhandstexten har inget belägg.
  - Rättelse: Brödtext 486842b6: "Det är ett tag sen du handlade hos oss. Bävertratten är det vanligaste andra köpet hos kunder som kommer tillbaka efter ett uppehåll. Här är den och tre till." H2 9997ca85: "Bävertratten och tre till". I 76ded9ed, byt Båtmotorskydd 420D och Övervakningskamera mot Marin Motorhölje (d01d20c5-a2cf-40fa-894d-3149ff871b81) och Fiskespöhållare 4-Pack (d0832750-b091-43b4-9d92-e2889d5b5a0a). Förhandstext: "Bävertratten och tre prylar till."

- **[viktig] F07 E1 (live, 0 inrullade, första utskick tidigast 21 d efter en order på motorhöljet): brödtext 5eb152f1-b607-4799-8d1b-2bf64a9ceead, H1 1b3804c8-4c2f-44b9-a5ee-f434b382f638, ämnesrad**
  - Fel: Motorhöljet du köpte sitter på motorn medan båten ligger i. När båten tas upp för säsongen står motorn i stället still och oskyddad mot regn, snö och UV, ett annat läge än det höljet är gjort för.
  - Varför: Motorhöljets produktsida säger "ger ett bra skydd året runt" och "Allvädersskydd mot sol, regn och salt". Mejlet säger till köparen att höljet inte är gjort för vinterförvaring och att motorn då står "oskyddad", vilket motsäger sidan kunden köpte på.
  - Rättelse: Block 5eb152f1: "När båten tas upp för säsongen står motorn uppställd i månader i regn, snö och UV. Då gör det skillnad att skyddet går ända ner över riggen." H1 1b3804c8: "Ett skydd för när båten står på land". Ämnesrad: "Motorhöljet har du. Och när båten står på land?"

- **[viktig] F07 E2 (live, första utskick tidigast 28 d efter en order på motorhöljet): brödtext 844328cc-9937-4df0-be8b-59d5076e9e86 och H1 38b510d8-9b15-4e5b-a8b3-970cacdaf56f**
  - Fel: Innan båten ställs undan / Motorn är en sak. Här är tre till som andra båtägare tar med sig innan säsongen är slut.
  - Varför: Efter köp av motorhöljet har bara båtmotorskyddet stöd i återköpsanalysen (12 av 21). Fiskespöhållaren har 2 kunder, och båtsitsöverdrag och förtöjningslina finns inte alls. "Som andra båtägare tar med sig" är alltså påhittat socialt bevis. Flödet går året runt, så den som köper i april får "innan säsongen är slut" i maj.
  - Rättelse: Block 844328cc: "Motorn är en sak. Här är några saker till för båten." H1 38b510d8: "Mer för båten".

- **[viktig] F07 E2 (live): kolumnen 85fd2128-193c-433b-9c3b-cacaa670b542 (Fiskespöhållare) i e1c15b43-80f8-4eae-ab79-712d7dd3dc02, H2 a3b3f76e-a31f-4941-a4c6-aa0b501409d2, förhandstext, K02 (utkast, planerad tor 1/10): textblocket b1efeff9-8e9c-4241-88c1-4ac8ffacb376**
  - Fel: F07 E2: "Tre till för båten … Fiskespöhållare 4-Pack" / förhandstext "Motorn är en sak, sittdyna, förtöjning och spöhållare tre till." · K02: "Fyra kraftiga hållare håller varje spö på sin egen plats, i båten eller på väggen i garaget."
  - Varför: kommentarer/produktfakta.md: "Inte byggda för vägg eller båt. Axel 2026-09-25." Filen säger själv att den gäller före produktsidan. F07 E2 säljer ändå spöhållaren som en båtprodukt, och K02 säger uttryckligen "i båten eller på väggen". K02 lades till här eftersom det är samma fel (upptäckt vid omläsningen).
  - Rättelse: F07 E2: ta bort kolumnen 85fd2128 ur e1c15b43. H2 a3b3f76e: "Två till för båten". Förhandstext: "Motorn är en sak, sittdyna och förtöjning två till." K02 block b1efeff9: "Fyra kraftiga hållare håller varje spö på sin egen plats. Ingen mer hopplock av trassliga linor." Vill Axel ha en tredje båtprodukt i F07 får han välja vilken.

- **[liten] F01 E3 d8823fb4-fef5-4c2f-ba8c-0f059887585b (live), F02 E3 98b12d41-10e2-42d7-af75-bcf1809cab9a (live), F04 v2 E1 078252d8-9189-4212-abb7-b5ee6e7ecd97 (live, första utskick ca 29/9)**
  - Fel: "… mejla kundsupport@baverbutiken.se och jag svarar själv." (F01 E3, F02 E3) / "Känns det för långsamt? Mejla kundsupport@baverbutiken.se, jag svarar själv." (F04 v2 E1), signerat "Axel, grundare"
  - Varför: Enligt CLAUDE.md besvaras kundsupport@baverbutiken.se av VA:n och av autosvarsboten, som skickar svar skarpt sedan 2026-09-23. Ett "för långsamt"-mejl får alltså ett automatiskt svar med butikens supportsignatur, inte ett svar från Axel. Raden fanns redan i Klaviyo-versionen som Axel granskade 2025-09-25, så den är hans röst och hans beslut. Därför bara liten.
  - Rättelse: F01 E3 d8823fb4: "Undrar du något innan du handlar, mejla kundsupport@baverbutiken.se så svarar vi." F02 E3 98b12d41: "Jag skickar det här en sista gång. Har du en fråga om produkten, leveransen eller något annat, mejla kundsupport@baverbutiken.se så svarar vi. Annars stör vi dig inte mer om den här kassan." F04 v2 E1 078252d8: "Känns det för långsamt? Mejla kundsupport@baverbutiken.se, så hjälper vi dig." Signaturen kan stå kvar. Om Axel faktiskt svarar själv står raderna kvar.

- **[liten] F04 v2 E1 (live): 9736e823-3be0-4c73-b83e-823d5b45bdac och 03cfa92b-6608-4171-a903-611d9181f891**
  - Fel: Handla för minst 299 kr och dra av 100 kr. Rabatten gäller en gång per kund. / Gäller köp från 299 kr, en gång per kund. Koden KREDIT100 läggs på automatiskt eller skrivs in i kassan.
  - Varför: Samma villkor står två gånger i rad. Att koden inte kombineras med andra rabatter (combinesWithOrder/Product false) står inte, vilket spelar roll under Black Week-trappan 23/11–1/12. "Läggs på automatiskt" gäller bara via knappen.
  - Rättelse: 9736e823: "Handla för minst 299 kr så drar vi av 100 kr." 03cfa92b: "Gäller en gång per kund och går inte ihop med andra rabatter. Rabatten läggs på när du trycker på knappen, annars skriver du KREDIT100 i kassan."

- **[liten] F13 E1 (live, 0 inrullade): listpunkten 67c00686-98ae-4e56-b19d-de509cde50cf**
  - Fel: Finns i fyra färger, grå, svart, grön och ljusgrå, om du vill matcha maskinen.
  - Varför: I Shopify är bara Grå och Svart available. Grön och Ljusgrå är slutsålda. Kunden har redan köpt, och lagret kan ändras, därför bara liten.
  - Rättelse: Block 67c00686: "Finns i flera färger, om du vill matcha maskinen."

- **[liten] F07 E1 (live): priset b51c3f92-eeb8-414c-83d0-38fb74a40795 (jämförpriset inte överstruket) i kolumnblocket bd6c212d-392b-41a3-8a12-4e8677d845ff, F07 E2 (live): f6028f24-eb5f-4d08-ae92-a50cee13883c, bc0de92b-c108-4a49-b7a2-939f5e0613f6, 38ae2a13-97c7-4b99-8a00-1e4f834574d6, da4331fb-0b46-4f35-848c-a1**
  - Fel: "**579 kr** 965 kr" (F07 E1) · "**579 kr** ~~965 kr~~", "**269 kr** ~~336 kr~~", "**289 kr** ~~482 kr~~", "**319 kr** ~~350 kr~~" (F07 E2) · "**299 kr** ~~367 kr~~" (F11 E1)
  - Varför: Importen gjorde om produktblocken till fast text. Priserna stämmer med Shopify i dag, men följer inte med om ett pris ändras. I F07 E1 är jämförpriset inte överstruket, så två priser står efter varandra.
  - Rättelse: Omedelbart: b51c3f92 → "**579 kr** ~~965 kr~~". På sikt: byt text-kolumnerna mot Spoks products-block (manual, isOriginalPriceVisible true): F07 E1 6f01ed7d-90e1-45a9-bb43-f0fbbc8c2285; F07 E2 6f01ed7d plus raden 7bf6c493-5400-43da-b1d3-59bddc991db1 och 407d54bf-6cdd-4b6e-9b11-82b90ade1786 (utan spöhållaren, se fyndet ovan); F11 d01d20c5-a2cf-40fa-894d-3149ff871b81. Tills dess: kontrollera mejlen varje gång de här priserna ändras.

- **[liten] F02 Övergiven kassa (flödesinställning)**
  - Fel: reenrollEnabled: true, allowReenrolmentAfter: null
  - Varför: Repots F02 har återinträde tidigast efter 7 dagar. Utan gräns kan en ny kassa starta en ny E1 medan förra serien pågår, så kunden får dubbla påminnelser.
  - Rättelse: Sätt återinträde till tidigast efter 7 dagar (P7D). Flödet är aktivt, så det görs i appen.

- **[liten] Egen sidfotssektion i live-flödesmejlen, verifierat i F01 E2 1905efd1-3970-42f7-bd21-45f24c21d16a, F01 E3 55a076f7-73e3-4c30-ae83-ae035b7198c2, F02 E2 ce09e24e-08ac-4797-b6c4-6365c16ef6df, F02 E3 a7d62479-3ac3-4070-85e6-ecf1896d4cf1, F03 E2 056b3644-396a-48e3-acda-31f4a3c5ef8d, F04 v2 E1 973a8a6a-01**
  - Fel: Bäverbutiken.se / Frågor? Svara på mejlet eller skriv till kundsupport@baverbutiken.se
  - Varför: Workspacens globala sidfot (get_settings, postFooter.text) har redan exakt raden "Bäverbutiken.se · Frågor? Svara på mejlet eller skriv till kundsupport@baverbutiken.se" plus "Avregistrera dig". Raden står troligen två gånger längst ner. F14 saknar egen sektion. Adressen är rätt, baverkoppling.se förekommer inte.
  - Rättelse: Kontrollera först i Spoks förhandsvisning att raden syns två gånger. Ta i så fall bort den egna sektionen i varje mejl ovan och låt den globala sidfoten stå.

- **[liten] Samma produktkort två gånger i samma mejl: K10 e0b9650c-b6a0-4da8-80e3-2e4351ab4824, K16 c7b302e7-0f3d-4f5d-8637-71a3def8ce5f, K01 39c157f8-d946-4b1d-bb1d-c16cbde08f2c? nej: 39c157f8-d946-… se nedan**
  - Fel: K10: Taköverdrag-kortet i 439201cf och e0b9650c · K16: Kranskydd-kortet i c1541647 och c7b302e7 · samma mönster i K01 (6af8ce10 + 39c157f8), K03 (ccec156c + 3f29150d), K06 (9f913d53 + a9495428), K08 (c8a1844d + fa1cc2be)
  - Varför: Konverteringen gjorde om källans andra produktblock med egen knapp till ett vanligt kort utan knapp. Samma produkt visas då två gånger. Det är kosmetiskt.
  - Rättelse: K10: ta bort e0b9650c. K16: ta bort c7b302e7. K01, K03, K06 och K08: ta bort det andra kortet eller ersätt det med en länkknapp till produktsidan (t.ex. K01: "Se taköverdraget" → https://baverbutiken.se/products/takoverdrag-husvagn-6-5-3-m-skyddar-den-dyraste-ytan). K01 är schemalagd och ändras i appen, övriga är utkast.


## Utkast-fynd (för spårbarhet — åtgärdade i Spoks enligt listan ovan, utom K18:s mätning)

- **[viktig] K15 (utkast, planerad fre 16/10): ämnesrad (customizedNotification.emailTitle) + H1 9902cd98-b2cb-47a4-8916-78aa1a6fb56b**
  - Fel: Sista helgen innan fars dag
  - Varför: Fars dag är söndag 8/11/2026. Från fredag 16/10 återstår tre hela helger före fars dag. Det som är sant är att helgen 17–18/10 är den sista att beställa i tid (sista beställningsdag måndag 19/10 = 8/11 minus 20 dygn).
  - Rättelse: Ämnesrad och H1: "Sista helgen att beställa till fars dag". Förhandstexten står kvar.

- **[viktig] K13 (utkast, planerad tor 19/11): heroblocket 337b8acb-637e-4352-9a6c-cfcd7e90c917 + raden f94d7f73-96bd-4507-a6ef-1656190633e9 ("Till den som har allt")**
  - Fel: Whisky Adventskalender – 24 Dekorflaskor, som hero och första förslag i en julklappsguide som lovar "få paketet i tid till jul"
  - Varför: Enligt butikens egen K09 måste en adventskalender beställas senast 11/11 för att hinna fram till lucka 1. Beställd från ett mejl den 19/11 kommer den sannolikt efter 1/12, och som julklapp 24/12 är den överspelad.
  - Rättelse: Byt heroprodukten i 337b8acb mot Bäverlampa Pro (c14d6b41-f0f6-4da1-9171-5f47bac617c0). I f94d7f73, ta bort whiskykalendern och sätt in en annan julklapp som inte är en kalender, så att raden har tre förslag.

- **[viktig] K21 (utkast, planerad tis 15/12): brödtext 24610498-5b92-4424-8ec4-b445ced8a7ef + förhandstext**
  - Fel: Innan året är slut, här är tre produkter kunderna själva skrivit mest om. / förhandstext "Tre av årets mest omtalade produkter, i kundernas egna ord."
  - Varför: Judge.me (utan spam): sätesöverdraget 30, solseglet 26, mobilskalet 20, axelbältet 15, fiskespöhållaren, motorhöljet och strandtofflorna 13 var. Taköverdraget och bälteslipen har 10 var och 0 verifierade, och 36 produkter har exakt 10. Två av de tre produkterna är alltså inte de mest omskrivna. När de overifierade citaten tas bort (se fyndet om "verifierad kund") har dessutom bara sätesöverdraget 
  - Rättelse: Välj de tre produkterna efter antal verifierade recensioner: sätesöverdraget (10), axelbältet (6) och fiskespöhållaren (6). Hämta citaten ur verifierade 4–5-stjärniga recensioner. Brödtext 24610498: "Innan året är slut, här är vad kunder skrivit om tre av våra produkter." Förhandstext: "Tre produkter, i kundernas egna ord."

- **[viktig] K21 (utkast): citatblocket e5a2e33e-9ee3-48a8-be45-dce77b2e3cc9**
  - Fel: "Passar bra och skönt att sitta på."
Gert N., verifierad kund
  - Varför: Recensionen (2026-09-15 08:37, verifierad köpare) har is_anonymous_reviewer: true i Judge.me-widgeten och visas som "Anonym" på produktsidan. API:t lämnar ut hela namnet (Gert Niklasson), och mejlet skriver förnamn och initial till hela listan.
  - Rättelse: Block e5a2e33e: "\"Passar bra och skönt att sitta på.\"\nVerifierad kund". I koden (recensioner.mjs): läs is_anonymous_reviewer från widgeten och skriv då "Verifierad kund" utan namn.

- **[viktig] K18 (utkast, planerad tis 17/11): brödtext d886ccf5-8626-47f4-936c-1b17148334e9, H1 fdaaa397-0f44-4eef-91b5-e0b5b378177a, H2 b85065a3-0062-4ac5-bd46-c632e79b926d, ämnesrad och förhandstext**
  - Fel: De senaste två månaderna har fler kunder valt de här tre produkterna än något annat i butiken.
  - Varför: Topp 3 (motorhölje, taköverdrag, fiskespöhållare) mättes på ordrarna ca 27/7–25/9. Den 17/11 betyder "de senaste två månaderna" 18/9–17/11, en period som inte är mätt. Två av produkterna är sommarprodukter.
  - Rättelse: Mät topp 3 på Shopifys ordrar de senaste 60 dagarna veckan innan K18 schemaläggs. Byt produkterna i 54bc54f7 och c4eb35f8 om topp 3 har ändrats, och byt citaten om motorhöljet inte längre är etta. Schemalägg inte kampanjen utan den mätningen.

- **[liten] F08, F09, F10, F12, F13: fördröjningen 21 d (F08 aa04ec95-b6cf-4b5b-83ef-127a615efab4, F13 088d87a3-c6ad-453b-b305-524d0b71dfd5 lästa; F09/F10/F12 ändrade samma minut enligt get_flows), F14: fördröjningen 7212e72f-9bf7-4e2e-b5c9-4bc50e679e96 = 22 d**
  - Fel: delay 1814400000 ms (21 d) i F08–F10, F12, F13 · delay 1900800000 ms (22 d), tilHour 18:00 i F14 · README: "14 d, utom F11 båtmotorskydd 21 d" och "16 d, 18:00"
  - Varför: Stegen ändrades i appen efter aktiveringen (F08–F13 kl 08:05 UTC, F14 kl 07:47 UTC) av samma konto som gjorde Axels övriga klick. Troligen är det avsiktligt: 21 d passar bättre när triggern är order skapad, och 22 d undviker krock med F04 v2 E2. Men README (commit 20dfe3d, 08:33 UTC) säger 14 d och 16 d. Mejlen är inte fel, dokumentationen är det. F11:s 21 d är Axels bekräftade ändring och ingår i
  - Rättelse: Fråga Axel om 21 d (F08–F10, F12, F13) och 22 d (F14) gäller. Om ja: skriv in det i tabellen i klaviyo/spoks/README.md. Om nej: ändra tillbaka i appen.

- **[liten] K13 48c1e130-ad97-4c82-8bd6-0a816e79c4e3, K15 b3c08848-f08b-4a4d-b404-e4d94084dff5, K14 knappen e7235624-0b0c-4950-8f6b-e5e79bbb7ab4**
  - Fel: K13: "Efter det hinner det inte fram." · K15: "Beställer du efter måndag 19 oktober hinner paketet inte fram till fars dag den 8 november." · K14-knappen: "Beställ innan torsdag"
  - Varför: Datumen bygger på p90 (20 dygn), så en del sena beställningar hinner fram, och "hinner inte" är för absolut. K14 formulerar det rätt ("Efter det räknar vi inte med att det gör det"). K14-knappen "innan torsdag" betyder senast onsdag, medan brödtexten säger "senast torsdag 3 december". Datum och veckodagar stämmer för 2026.
  - Rättelse: K13 48c1e130: "Sista dag för att beställa och få paketet i tid till jul är torsdag 3 december. Efter det kan vi inte lova att det hinner fram." K15 b3c08848: "Beställ senast måndag 19 oktober, så hinner paketet fram till fars dag den 8 november. Efter det kan vi inte lova det." K14 e7235624: "Beställ senast torsdag".

- **[liten] K10 förhandstext + 82f9a847-e2bf-4db7-8da1-9f99f757d954**
  - Fel: Förhandstext: "Kunden skrev det under en av våra annonser." / "Det skrev en kund under en av våra annonser."
  - Varför: Citatet är en Facebook-kommentar på en annons, och inget visar att den som skrev är kund. Efter ämnesraden "Silverskikt mot sol, oxfordväv mot regn" ser det dessutom ut som att en kund skrev ämnesraden.
  - Rättelse: Förhandstext: "Någon frågade om fukt under en av våra annonser. Här är svaret." Block 82f9a847: "Det skrev någon under en av våra annonser. Rimlig fråga: blir det inte fuktigt att lägga något över taket?"

- **[liten] K18 knappen cd0d9c05-bf41-4dfe-bad1-d5706a755669, K21 knappen 5a172578-5728-4741-85a7-04bc2ae8a669**
  - Fel: K18: "Se de tre" · K21: "Läs recensionerna" (båda till https://baverbutiken.se/collections/alla-produkter)
  - Varför: Båda knapparna går till hela sortimentet (200). Där finns varken "de tre" eller några recensioner.
  - Rättelse: K18 cd0d9c05 och K21 5a172578: knapptexten "Se hela sortimentet".

- **[liten] K02 förhandstext**
  - Fel: En blank motor är det första en tjuv ser från vägen.
  - Varför: Mejlet handlar bara om väder och om vad som ska på innan båten ställs undan. Stöld nämns inte.
  - Rättelse: Förhandstext: "Regn, snö och frost jobbar på motorn hela vintern."

- **[liten] K03 brödtext 7f2232e6-688d-475d-bf1a-ba677be42eae**
  - Fel: Skyddet spänns utanpå rutan i stället för innanför, så kylan aldrig får kontakt med glaset från insidan.
  - Varför: Kylan når glaset utifrån, inte inifrån, så meningen går inte ihop fysikaliskt. "Aldrig" är dessutom ett absolut löfte.
  - Rättelse: Block 7f2232e6: "Skyddet spänns utanpå rutan i stället för innanför, så kylan stoppas redan på utsidan av glaset. Det mörklägger samtidigt hela framvagnen, och ingen ser in på rastplatsen."

- **[liten] Produktkorten i flöden och kampanjer (t.ex. F01 E2 74ee5397, F04 v2 E2 5aa18a9e, K16 c1541647)**
  - Fel: "Taköverdrag Husvagn – Skyddar Den Dyraste Ytan", "Kranskydd Frost 420D – Skyddar Utekranen i Vinter" m.fl.
  - Varför: Spoks hämtar produkttitlarna ur Shopify, och de innehåller tankstreck. Det är inte vår copy, men strecken syns i mejlen.
  - Rättelse: Ingen åtgärd i mejlen. Vill Axel slippa strecken ändras titlarna i Shopify. Det påverkar även produktsidor och annonser, så det är hans beslut.

- **[liten] Produktkortens länkar i alla flöden och kampanjer**
  - Fel: https://4snrw0-mg.myshopify.com/products/…
  - Varför: Länkarna pekar på myshopify-domänen men går med 200 vidare till rätt sida på baverbutiken.se. Enligt regel 8 är det en anmärkning, inte ett fel.
  - Rättelse: Ingen åtgärd krävs. Länkarna kommer från Spoks katalogsynk.
