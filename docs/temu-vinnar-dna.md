# Vinnar-DNA — reverse engineering av tio Temu-vinnare (Bäverbutiken)

**Datum:** 2026-09-03. **Uppdrag:** Axels masterprompt "Reverse engineer the winning product DNA" — bygg modellen ur de bevisade vinnarna, leta INTE nya produkter än.
**Dataset:** tio Temu-listningar Axel pekat ut, matchade mot kontot MagiBorsten `1867947880635861` (Meta, livstid t.o.m. 2026-09-03, kampanj- och annonsnivå), Shopify, Drive WINNERS/LOSERS, `products/<id>/dna.md` och **59 kampanjer i samma konto som kontrollgrupp**.
**Per-produkt-analyserna** (250–450 rader vardera, med källor rad för rad) ligger i `docs/temu-vinnar-dna/analys/w1.md … w10.md` + `forlorare.md`. Det här dokumentet är syntesen.

---

## 0. Datakvalitet — läs detta först

| Källa | Status | Vad den gav |
|---|---|---|
| Meta, annonsnivå (400 annonser i de 11 vinnarkampanjerna) + kampanjnivå (alla 70 kampanjer) | Hämtat 2026-09-03 | Spend, köp, CPA, ROAS, CTR, CPM per annons → vilken vinkel/format/hook som tog pengarna |
| Shopify (`products.json`, produktsidor, ordrar för två produkter) | Hämtat 2026-09-03 | Pris, jämförpris, varianter, beskrivning, recensioner, enheter/order |
| `products/<id>/dna.md` (motorhöljet, sätesöverdragaren, strandtofflorna, axelbältet; IBC och tofflorna på grenar) | Lästa | Teardowns, falsifierade hypoteser, rotorsaker |
| Drive WINNERS/LOSERS, `_REVIEWS`, `_ADCOPY`, videor (frames) | Listat/läst där det fanns | Axels egen klassning, kontots copy, vad vinnarvideorna faktiskt visar |
| Svenska konkurrentpriser (Biltema, Jula, Clas Ohlson, Rusta, Kjell, Elgiganten, fackhandel), SCB, Brå | Hämtat med URL i analysfilerna | Prisankare, ägarbas |
| **Temu-listningarna** | **Blockerade.** curl, WebFetch och headless Chromium via proxyn ger bara `<title>`, `og:description`, `meta keywords`, huvudbilden och galleriantalet (ur URL:en). En sida svarade med captcha. | Titelstruktur, kategori, huvudbildens komposition |
| Temu-siffror: pris, referenspris, rabatt, betyg, antal recensioner, sålda, säljare, badges, frakt, video | **UNKNOWN för alla tio.** Inget är gissat. | — |

Två saker till som styr läsningen:

1. **Vinnare 9 är ingen vinnare.** Temu-listningen `601099553900496` är butikens *Tofflor Ergonomiska* (inte Strandtofflorna): ROAS 1,59 mot verifierad break-even 1,80, vinstbidrag −796 kr, pausad, slutsåld. Den analyseras som **negativ vinnare** och används som naturligt experiment mot vinnare 4 (samma butik, samma sökord, samma prisklass). Nio produkter är alltså vinnare, en är kontrollpunkt.
2. **Kontrollgruppen kan bara testa produktvariabler, inte kreativa.** Förlorarnas annonser är inte sedda. Allt som handlar om hook, format och leverantörsmaterial är bevisat *inom* vinnargruppen (400 annonser) men inte *mot* förlorarna.

---

## 1. Datasetet — nio vinnare och en kontrollpunkt

| # | Produkt | Spend | Köp | CPA | ROAS | BE-ROAS | Pris | Härledd kostnad | Uppslag | Vinnande annons | Format på vinnaren | Vinkel som vann (andel spend / köp) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Marin motorhölje 420D | ~104 900 (5 kampanjer) | ~523 | ~200 | 1,93 (huvud) | 1,63 | 299 | 116 | 2,6× | Motorhölje_PD_1_H3 (27 212 kr / 160 köp, 38 % av huvudkampanjen; enda annonsen som håller effektivitet vid skala) | lång demo-video med captions | PD |
| 2 | Fiskespöhållare | 59 100 | 307 | 193 | 2,24 | 1,50 | 289 | 96 | 3,0× | Fiskespöhållare_PD_EXTRA ×3 adset (23 029 kr / 128 köp = 39 % / 42 %) + PD_1_H1 (10 299 / 46) | **rå leverantörsvideo** (SOP-06:s "Temu-rip") | PD |
| 3 | Sätesöverdrag åkgräsklippare | 62 441 | 182 | 343 | 2,15 | 1,47 | 649 | 208 | 3,1× | Seatcover_PD_1_3_H1 (32 059 / 106 = 53 % / 59 %) | **rå leverantörsvideo + svenska captions**; samma video utan captions ROAS 1,11 | PD 83 % / 87 % |
| 4 | Strandtofflor (EVA-clog) | 41 377 | 187 | 221 | 2,10 | 1,70 | 349 | 144 | 2,4× | Beachslippers_PD_13_1 (15 350 / 85 = 40 % / 47 %) | **statisk = leverantörens listningsfoto** i svart, textfri, CPM 82–86 kr | PD 91 % / 92 % |
| 5 | Axelbälte trimmer | 50 235 | 158 | 318 | 1,91 | 1,72 | 599 | 251 | 2,4× | Axelbälte_PD_1_H1 (17 437 / 59 = 37 % / 39 %) | **äkta UGC-video**, man i garage, smärthook | PD 42 % / SO 45 % |
| 6 | Mini bandslipare 3-i-1 | 22 774 | 53 | 430 | 2,30 | 1,73 | 909 | 384 | 2,4× | Balteslipmaskin_PD_2 (spend) / PD_3 (vinst) | klippt leverantörs-B-roll + TTS + captions; statisk komposit PD_2_1 bäst per krona | PD 68 % / 72 % |
| 7 | Soptunneklistermärken | 9 563 | 73 | 131 | 2,05 | 1,67 | 199 | 80 | 2,5× | PD_Bild_03 (7 244 / 63 = 76 % / 86 %, CTR 5,55 %) | **statisk AI-bild byggd på Temu-huvudbilden**, textfri | PD 85 % / 93 % |
| 8 | PTZ-kamera dubbellins | 10 266 | 29 | 354 | 3,38 | 1,57 | 799 | 290 | 2,8× | Overvakningskamera_SP_2 (8 554 / 23 = 82 % / 79 %) | klippt leverantörs-B-roll + svensk VO + captions, förstapersons "vi bytte tre kameror mot en" | SP |
| 9 | *Ergonomiska tofflor (kontrollpunkt)* | 7 492 | 31 | 242 | 1,59 | **1,80** | 309 | 137 | 2,3× | Tofflor_SP_2 (3 245 / 17 = 70 % / 87 %) — tröttnade efter 2 500 kr | rå hemvideo | SP |
| 10 | IBC-tanköverdrag | 8 642 | 40 | 216 | 2,94 | 1,51 | 489 | 165 | 3,0× | IBC_PD_1_H1 (7 648 / 37 = 87 % / 90 %) | klippt: AI-trädgårdsscener + riktig produktfilm + captions | PD |

Kostnad = pris × (1 − 1/BE). Alla priser utan moms. Källor: `ground-truth.md`, `ads-per-kampanj.md` (Meta MCP 2026-09-03), Shopify.

**Första läsningen av tabellen, innan någon analys:**
- Vinnande vinkel är **PD (visa produkten och problemet)** i 8 av 10. De två SP-vinnarna är inte testimonial-kort utan förstapersons-demo på leverantörsbilder (kamera) respektive rå hemvideo (tofflor — och den kampanjen förlorade).
- I **8 av 10** är den vinnande creativen **leverantörens eget material** rakt av eller lätt bearbetat (rå video, video + captions, listningsfoto, B-roll + VO, AI-bild ritad på huvudbilden). Undantag: axelbältet (äkta UGC) och IBC (AI-scener + egen produktfilm).
- Prisuppslaget ligger i ett smalt band, **2,3–3,1×**. Det är BE-matematik, inte en vald variabel.
- Fyra av nio vinnare kostar **599–909 kr**. Ingen förlorare i kontot med ≥3 köp kostar över 500 kr.

---

## 2. Varje vinnare dekomponerad (kortversion — full version i analysfilerna)

Format: **Old way → friktion → ny mekanism → payoff · varför annonsen fungerar · mekanismklass (avstånd 0–5) · svenska villkor.**

**1. Marin motorhölje 420D (299 kr).** Utombordaren står oskyddad vid bryggan → sol, salt och regn bleker och åldrar en motor värd 30–150 tkr → ett 420D-hölje med dragsko träs över på 30 s → motorn ser ny ut och håller. Annonsen: en lång demo-video (PD_1_H3) med problem-först-öppning, produkt i bild före sekund 4, captions; den enda annonsen i kontot vars vinst per krona **inte** faller vid skala (dna.md mönster 2, nio av nio). Rå kort leverantörsvideo (PD_EXTRA) har kontots bästa hold (22 %) och 1 376 kr vinst per 1 000 kr men fick aldrig volym. **Bekant problem / bekant mekanism, avstånd 1.** 30 varianter (färg × hk) sålde ändå — ägaren kan sin hk utantill; svart står för nästan allt. Säsong: launch juni, mitt i. Ingen kedja säljer 420D-hölje i den formen; Biltema/Jula säljer presenningar.

**2. Fiskespöhållare (289 kr).** Spön ligger huller om buller i garaget och båten, linor trasslar → hållare på väggen → ordning på 2 minuter, synlig varje gång dörren öppnas. Annonsen: **den råa leverantörsvideon** (PD_EXTRA, tre kopior) tog 39 % av spenden och 42 % av köpen med CPA 136–210; CS-vinkeln (rea) lönsam med 42 köp / CPA 133 — enda vinnaren där rea-vinkeln bär. **Bekant problem / bekant mekanism, avstånd 1.** Lägsta kostnaden i gruppen (96 kr) ger BE-CPA 193 med marginal. Förlorarna i samma publik (magnetfiske 1,10, mini-spö 1,02, linupprullare 0,30) skapar en ny hobby, ersätter ett riktigt spö eller löser ett osynligt problem — spöhållaren löser ett synligt kaos hos den som redan äger många spön.

**3. Sätesöverdrag åkgräsklippare (649 kr).** Originalsitsen torkar, spricker, är blöt varje morgon och brännhet varje eftermiddag; alternativet är nytt säte 949–3 229 kr + skruvning → ett vadderat 600D-överdrag träs på under 60 s → torr, mjuk, snygg sits + fickor. Annonsen: rå leverantörsvideo 38 s med svenska captions — **samma video utan captions gav ROAS 1,11 mot 2,34** (renaste A/B:n i kontot); handduks-callouten ("du lägger en handduk på sätet") slog sin parade tvilling 20 köp mot 1. SP/UGC: 0–1 köp på tre batcher. **Bekant problem / bekant mekanism överförd till ny kategori (bilsäte → åkgräsklippare), avstånd 2 — "prisnivå-substitut för dyr reparation".** Ingen svensk kedja säljer det; 0 Meta-konkurrenter; ägd sak 35–100 tkr; 649 kr = 0,6–1,9 % av maskinen.

**4. Strandtofflor EVA-clog (349 kr).** Blött trädäck, svettiga skor, jord i hallen → grov sula, dräneringshål, hälrem → kliv i, stå stadigt. Mekanismen är tunn (avstånd 1, **befintlig produkt / kosmetisk variation**). Vann på: (a) leverantörens "sneaker drop"-listningsfoto i svart som annons (CPM 82–86 kr, lägst i kontot), (b) en igenkänningsfråga i copyn ("Halkar du fortfarande på blöta altanen?"), (c) Crocs-ankaret 289–600 kr ovanför och Rusta/Jula 35–50 kr under, (d) 2,14 M småhus + 634 k fritidshus i juli. Video förlorade mot statik (CPA 289 vs 210). Storleksguide lades upp 18 dagar efter launch; returer okända. Tunnaste vinnaren i kronor: ~27 kr per köp över BE.

**5. Axelbälte trimmer (599 kr).** Trimmern (3–8 kg) bärs i armarna eller i medföljande enkelrem → ont i axlar och nacke, pauser, halvgjort jobb → dubbelsele med ryggplatta och höftkrok → "trimma längre utan att det gör ont". Annonsen: **äkta UGC-video** (verklig man i garage, smärthook "Ont i axlarna efter en dag i trädgården?") 37 % / 39 %; statisk hel produkt mot fotobakgrund bäst vinst per krona (619 kr/1 000). Mekanismförklaring (PD_3_H1, PD_10_1), prisankare överst i bild (CTR 0,94 %) och social proof (0 bedömbara) förlorade. **Bekant problem / förbättrad mekanism, avstånd 1 — en distributionsvinst:** Husqvarna säljer samma arkitektur för 819 kr i fackhandel som villaägaren aldrig besöker. Priset höjdes 509 → 599 utan synlig CVR-förlust. Frekvens 3,09 efter 37 tkr: publiken (0,9–1,5 M trimmrar, uppskattning) är ändlig.

**6. Mini bandslipare 3-i-1 (909 kr).** Slöa knivar, bryne i lådan, bänkslip som bränner eggen → motordrivet band i fast 15° + sten + polertrissa på en A4-fot → vass egg "på 10 sekunder", tre maskiner i en. Annonsen: klippt kinesisk B-roll + svensk TTS + captions; nyfikenhetshook ("Gillar du verktyg, kolla") CPA 306 mot claimhook 526 (preliminärt). CTR 2,9–3,7 % (näst högst) men **CVR 0,6–1,3 % mot motorhöljets 2,6 %** — mekanismen köper klicket billigt, 909 kr köper CPA:n; BE-CPA 525 räddar ekonomin. **Bekant problem / förbättrad mekanism + miniatyrisering av proffsmekanism, avstånd 3.** Ingen kedja säljer mini-bandslip; annonsen väljer själv ankare (Work Sharp 2 199 / Tormek 4 100, inte Jula-bänkslip 499). Gåvovinkel 0 köp på 790 kr (i augusti).

**7. Soptunneklistermärken (199 kr).** Inget problem. Grått kommunalt kärl i uppfarten → fyra tecknade ansikten → kärlet får personlighet på 10 s, synligt för hela gatan på tömningsdagen. Annonsen: **statisk AI-bild utan text** (kärlrad med ansikten, ritad på Temu-huvudbilden) 76 % / 86 %, CTR 5,55 % — högst i kontot. Alla annonser med ord (rea, "föräldrar", "trist?") förlorade. **"Latent want / ny objektkategori", avstånd 4** (konventionell lösning = ingenting). Köpare 55+ (84 % av spend, 89 % av köp), 58 % kvinnor — inte småbarnsföräldrarna copyn skrevs för. Marginalen bärs av 1,17 enheter/order + frakt; +2 180 kr på ROAS-basis. Badshorts med skämttryck (humor, förlorare 1,29) skiljer: personlig, storlek, säsong, social risk.

**8. PTZ-kamera dubbellins (799 kr).** Ljud på tomten kl 03, fasta kameror med döda vinklar, falsklarm på katten, abonnemang → två linser i ett hus, 355°, AI-personfilter, auto-spårning, ingen prenumeration → "tre kameror förut, nu en". Annonsen: förstapersons-vittnesmål på leverantörs-B-roll 82 % / 79 %; äkta app-skärminspelning som hook (CS_3) 4 köp på 553 kr. **Bekant problem / förbättrad mekanism, avstånd 2 — den synliga hårdvaruskillnaden (två linser) bär hela prisargumentet:** 799 kr är inte billigast i kategorin (Tapo C500 679 kr) men billigast för den synliga specen (Kjell/Elgiganten dubbellins 1 290–2 490 kr). **61 % köper 2–3 st** (1,70 enheter/order, AOV 1 180 kr) — det är därför ROAS är 3,38. Hög komplexitet (fäste, kabel, app, wifi) neutraliserad av garanti + pris.

**9. Ergonomiska tofflor (309 kr) — kontrollpunkten.** Trötta fötter på kvällen → tjock EVA-sula med vågformad innersula → "som att gå på moln". Effekten märks först på kvällen, syns inte i bild, ingen rädsla, ingen ägd sak, ingen könskodning. Identisk kopia på BilligaBoden 229 kr, ErgonomiKliniken 199 kr med 648 aktiva Meta-annonser. Vinnaren (rå hemvideo) tröttnade efter 2 500 kr (marginell CPA 373). **Befintlig produkt / kosmetisk variation, avstånd 1.** Mot vinnare 4 skiljer exakt: konkurrent i flödet, look-alike-pris, mekanism synlig i stillbild, rädsla-komponent, könskodning, säsong, recensioner vid launch.

**10. IBC-tanköverdrag (489 kr).** Regnvattentanken står i solen, vattnet blir grönt, plasten spröd, presenningen blåser av → formsytt 210D-skal med blixtlås, lucka över locket och fönster vid kranen → klart vatten, tanken nås utan att ta av skalet, tomten ser ordnad ut. Annonsen: "Har du en IBC-tank i trädgården? Titta på det här." + alggrön burk mot klar burk; 87 % / 90 %, ROAS 3,08, CPM 122 (billigast). Statik med bara lösningen: 0 köp. **Bekant problem / förbättrad mekanism, avstånd 1–2.** Dyrast i Sverige (Tankcenter 119, Magasin 10 336) — spelade ingen roll: ingen konkurrent annonserar, och alger är "svenska kategorins standardclaim" som Temu-titeln inte ens nämner. Mot förlorarna i samma Oxford-familj: Gräsklippartäcket (klipparen står i förrådet = gratis substitut, osynlig långsam skada, 1 bild) och Kranskyddet (skadan ligger i november, launch i augusti — över BE, pausad).

---

## 3. Normaliserad vinnarmatris

1 = ja, 0 = nej, ½ = delvis. Kolumn 9 är kontrollpunkten. **Kontrollgrupp** = andel av de 20 formella förlorarna med samma egenskap (`forlorare.md`). Prediktiv relevans sätts i avsnitt 7 efter motsägelse- och orsakstest.

| Variabel | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | *9* | 10 | Vinnare (av 9) | Förlorare (av 20) | Relevans |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **A. Leverantörens material fungerar som annons** (rå video/foto räckte, ± captions) | ½ | 1 | 1 | 1 | 0 | 1 | 1 | 1 | 1 | 0 | 6½ | ej mätbart | HÖGT PREDIKTIV (bara inom vinnarna) |
| **B. Problemet/önskan finns hos ägaren i annonsögonblicket** (inte framtida, inte osynligt) | 1 | 1 | 1 | ½ | 1 | ½ | ½ | 1 | 0 | 1 | 7½ | 45 % (11/20 latent) | **REQUIRED-nära** |
| **C. Fäster på/används med en sak kunden redan äger** | 1 | 1 | 1 | ½ (altanen) | 1 | ½ (knivar) | 1 (kärlet) | 1 (huset) | 0 | 1 | 8 | 60 % | SUPPORTING ensam |
| C2. …och den saken står **utomhus/synlig** eller används **kroppsligt** | 1 | 1 | 1 | 1 | 1 | 0 | 1 | 1 | 0 | 1 | 8 | ~35 % (uppskattning ur (o)+(b)) | HÖGT PREDIKTIV |
| D. Den ägda sakens värde ≥ 10× produktpriset | 1 | ½ | 1 | 1 (altan) | 1 | 0 | 1 (villa) | 1 | 0 | ½ (tank 500–1 600) | 7 | 45 % | SUPPORTING |
| **E. Ingen svensk kedja (Biltema/Jula/Clas/Rusta) säljer samma form** | 1 | 1 | 1 | 0 (EVA-clog 35 kr) | 0 (Jula 349, Clas 499) | 1 | 1 | 0 (Tapo) | 0 | 1 | 6 | 10 % (18/20 jämförelsehandlade) | HÖGT PREDIKTIV |
| F. 0–1 svenska Meta-annonsörer i kategorin | 1 | UNKNOWN | 1 | 1 | UNKNOWN | 1 | 1 | 0 | 0 (648) | 1 | 6 av 7 kända | okänt | HÖGT PREDIKTIV (mätt i 7) |
| G. Old way = ingenting eller improvisation (inte en köpt produkt som fungerar) | 1 | 1 | 1 | 0 | 1 | 0 | 1 | 0 | 0 | 1 | 6 | 20 % (16/20 = köpt) | SUPPORTING; stark i kombination |
| H. Hook formulerbar som ja/nej-fråga om ägd sak på ≤ 7 ord | 1 | 1 | 1 | 1 | 1 | ½ | 0 | 1 | 0 | 1 | 7½ | ej mätt | HÖGT PREDIKTIV (bevis: 3, 5, 10) |
| I. Förstås i stillbild utan text | ½ | 1 | 1 | 1 | ½ | 1 | 1 | ½ | 0 | ½ | 7 | 50 % (b) | SUPPORTING |
| J. Mekanismavstånd 0–5 | 1 | 1 | 2 | 1 | 1 | 3 | 4 | 2 | 1 | 1–2 | median 1 | BP/BL 70 % | **INCIDENTAL** |
| K. Kräver montering/app/inlärning | 0 | 0 | 0 | 0 | 0 | ½ | 0 | 1 | 0 | 0 | 1½ | 30 % | NEGATIV (negativ rymd) |
| L. Variantaxlar kunden måste välja utan att kunna parametern | 0 (hk vet han) | 0 | ½ ("universell") | 1 (12 storlekar) | 0 | 0 | 0 | 0 | 1 | 0 | 2½ | 45 % | NEGATIV-svag |
| M. Pris ≥ 500 kr | 0 | 0 | 1 | 0 | 1 | 1 | 0 | 1 | 0 | 0 | 4 | **0 %** | ASYMMETRISK GRÄNS |
| N. Uppslag pris/kostnad 2,3–3,1× | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 9 | 100 % (2,0–3,0) | INCIDENTAL (BE-matematik) |
| O. Naturligt flerköp (skäl att äga 2+) | 0 | 0 | 0 | ½ (1,2 par) | 0 | 0 | ½ (1,17) | 1 (1,70) | ½ | 0 | 2½ | ej mätt | SUPPORTING (räddar ROAS i 7, 8) |
| P. Man 45–70, småhus/fritidshus | 1 | 1 | 1 | 1 | 1 | 1 | ½ (55+, 58 % kv) | 1 | 0 | 1 | 8½ | 45 % (11/20 = annan) | HÖGT PREDIKTIV, hotad av Cykelshorts/Damasker |
| Q. Launch inom säsong | 1 | 1 | 1 | 1 (sent) | 1 (sent) | – | – | – | 0 | 1 | 6 av 6 säsongsbundna | 75 % (5/20 fel säsong) | REQUIRED för säsongsvaror |
| R. Estetisk bonus (ser snyggare ut) | 1 | ½ | 1 | 0 | 0 | 0 | 1 | 0 | 0 | 1 | 4½ | ej mätt | WEAK |
| S. Kroppslig smärta/obehag i problemet | 0 | 0 | 1 | ½ | 1 | 0 | 0 | 0 | ½ | 0 | 2½ | ej mätt | WEAK (bevisat i 3, 5 — men 5/9 saknar det) |
| T. Rädsla/förlust (skada på dyr sak, inbrott) | 1 | 0 | ½ | ½ (halka) | 0 | 0 | 0 | 1 | 0 | 1 | 4 | ej mätt | SUPPORTING |
| U. Temu-titeln nämner nyttan vi säljer på | 1 | ½ | 0 | ½ | 1 | 0 (kniv saknas) | 0 | 1 | 0 | 0 (alger saknas) | 4 | ej mätt | INCIDENTAL — gapet är vår marginal |
| V. Galleribilder på Temu | 5 | 5 | 5 | 5 | 5 | 5 | 5 | 5 | 5 | 5 | — | — | INCIDENTAL (ingen varians) |
| W. Huvudbild: katalog (K) / studio-drop (S) / i kontext (C) | K+text | K | K | S | K | K | C | C+text | S | K+mek | — | — | INCIDENTAL ensam; se A |
| X. Temu: pris, betyg, recensioner, sålda, säljare | UNKNOWN ×10 | | | | | | | | | | — | — | UNKNOWN |

---

## 4. Mönster i tre ordningar

**Första ordningen (syns direkt):** man 45–70 i småhus; tillbehör till något som står ute (båt, klippare, tank, kärl, hus) eller bärs på kroppen; Oxford-tyg i tre av nio; PD-vinkel i åtta av tio; leverantörsmaterial som annons i sex–sju av nio; inga svenska kedjor i samma form i sex av nio; launch i säsong i alla säsongsbundna.

**Andra ordningen (olika produkter, samma psykologiska effekt):**
- *"Jag har den redan, och den ser ut så där just nu."* Motorn vid bryggan, sitsen som spruckit, tanken som grönskar, spöna i garaget, tunnan i uppfarten, axeln efter trimningen. Annonsen behöver inte skapa problemet — den behöver bara **peka på ägaren** ("Har du en IBC-tank i trädgården?"). Det är därför ja/nej-frågor på ≤ 7 ord bär tre av vinnarna och därför CPM ligger på 82–127 kr: Meta hittar ägarna på objektet i bild.
- *"Det där finns alltså — och ingen säljer det här."* Sätesöverdrag för åkgräsklippare, dubbelsele för villaägare, mini-bandslip, dubbellins under tusenlappen, ansikten på kärl, IBC-skal med lucka. Kategorin är ny **i det svenska flödet**, inte mekanismen. Annonsen får sätta prisankaret själv (Husqvarna 819, Kjell 1 290–2 490, "nytt säte tusenlappar", Work Sharp 2 199).
- *"Det syns att den gör det."* Alla vinnare utom kameran och tofflorna kan visas färdiga i en stillbild eller en 20-sekunders demo utan förklaring. Varje annons som *förklarade* (mekanismvideo, POV-kort, curiosity, listicle) förlorade i sitt konto.

**Tredje ordningen (samma kommersiella struktur bakom olika vinnare) — högsta prioritet:**

> **Vinnarna är Temu-listningar vars eget material redan är en färdig svensk Meta-annons, riktade mot en ägare som redan lever med problemet, i en kategori som svensk handel inte har hyllat.**

Tre komponenter, alla observerbara **innan köp**:
1. **Materialöverförbarhet.** Leverantörens video/foto visar produkten i bruk på ≤ 3 s, utan inbränd utländsk text, och samma fysiska produkt som listningen. I 7 av 9 vinnare var det den vinnande annonsen (med svenska captions som enda bearbetning). Kontrollpunkten: motsatsen — leverantörsvideon till klistermärkena visade **en annan produkt** (30 cm lösdelar) och floppade (ROAS 0,56); tofflor 9 har förvanskat tryck "ADEVNUTRES" inbränt i produkten.
2. **Ägarpresens.** Kunden äger objektet, objektet står ute/används kroppsligt, och skadan/kaoset/smärtan är inträffad vid annonstillfället. Kontrollgruppen: 55 % av förlorarna kräver att annonsen skapar behovet; 0 av 9 vinnare launchades utanför säsong; gräsklippartäcket och kranskyddet (samma tyg, samma ägare) föll på att problemet låg i förrådet respektive i november.
3. **Hyllfrånvaro + prisutrymme.** Ingen svensk kedja säljer formen, 0–1 Meta-annonsörer, och priset kan sättas till ≥ 2,4× kostnad **och** ≥ 300 kr så att BE-CPA ≥ 190 kr. Ingen förlorare med ≥ 3 köp ligger över 500 kr; 4 av 9 vinnare gör det. Där en kedja *finns* (tofflor, sele, kamera) vann vi bara med ett synligt ankare 1,6–3× högre (Crocs, Husqvarna, Kjell dubbellins).

---

## 5. Interaktioner — variabelkluster rankade

| Rang | Kluster | Vinnare som uppfyller | Förlorare som uppfyller | Varför kombinationen är stark | Styrka | Säkerhet |
|---|---|---|---|---|---|---|
| 1 | **B ∧ C2 ∧ E** — problemet finns nu · ägd sak ute/kroppslig · ingen kedja säljer formen | 1, 2, 3, 6, 7, 10 (6/9); 5 och 8 faller på E, 4 på E | 0–1/20 (Kranskydd är närmast: B=0 i augusti) | Annonsen slipper skapa behov, slipper slåss om pris, och Meta hittar publiken på objektet. Alla tre lyfter CVR, ingen bara CTR. | Mycket hög | Hög — kontrollgruppen bekräftar B, C2 och E var för sig |
| 2 | **A ∧ H** — leverantörsmaterialet duger som annons · hooken är en ägarfråga på ≤ 7 ord | 2, 3, 4, 10 (+1, 8 delvis) | ej mätbart | Produktionskostnad ≈ 0, tid till launch ≈ 0, och captions/frågan gör resten. Sätesöverdraget bevisar det isolerat: captions = 2,34 mot 1,11. | Hög | Medel — bara vinnargruppen |
| 3 | **M ∧ N ∧ O** — pris > 500 · uppslag ≥ 2,4× · skäl till flerköp | 8 (alla tre), 3, 5, 6 (två) | 0/20 | Ger BE-CPA 350–525 kr, vilket är det enda som gör en 0,6–1,3 % CVR (bandslip) eller 4 installationssteg (kamera) lönsamma. Kamerans 1,70 enheter/order är hela skillnaden mellan ROAS 2 och 3,4. | Hög för ekonomin | Hög (Meta + Shopify) |
| 4 | **G ∧ D** — old way är improvisation · ägd sak ≥ 10× priset | 1, 2, 3, 5, 10 | 3/20 (Golfborste, Lastnät, Kranskydd-lovande) | "Presenning som blåser av", "handduk på sätet", "spön mot väggen", "bär i armarna" — kunden har redan erkänt problemet genom att improvisera; priset jämförs mot maskinen, inte mot en hylla. | Medel-hög | Medel |
| 5 | **P ∧ Q** — man 45–70 småhus · launch i säsong | 1–6, 8, 10 | 5/20 (fel säsong) + 11/20 (annan publik) | Kontots hela publik och algoritmens inlärning ligger här; CPM 82–127 mot 140–220 utanför. | Medel | Medel — Cykelshorts/Damasker (P=0, ACTIVE, över BE) kan fälla P |
| 6 | **Undantagsklustret: ¬B ∧ (pris ≤ 199 ∧ 0 varianter ∧ universellt objekt ∧ humor)** | 7 | Badshorts (humor men personlig, storlek, säsong) | När problemet saknas måste friktionen vara noll och objektet finnas hos alla. | Låg räckvidd | En produkt |

Klustren 1–3 är inte oberoende: de beskriver samma tredje-ordningens struktur från tre håll (efterfrågan, kreativ, ekonomi). En ny kandidat som klarar alla tre liknar 6 av 9 vinnare. Klarar den bara ett, liknar den kontrollgruppen.

---

## 6. Negativ rymd — vad vinnarna konsekvent inte har

Mätt mot kontrollgruppen (≥ 30 % av förlorarna, ≤ 1 vinnare) och mot 400 vinnarannonser.

**Produktnivå (kontrollgruppen):**
- **Latent behov** — annonsen måste först övertyga om att problemet finns: 55 % av förlorarna, 1/9 vinnare (klistermärkena, som kompenserar med noll friktion).
- **Annan målgrupp än man 45+ med hus/båt/trädgård:** 55 % av förlorarna, 0/9 vinnare (kontrollpunkten är unisex).
- **Montering, installation, inlärning:** 30 % av förlorarna, 1/9 (kameran — neutraliserad av 799 kr och rädsla).
- **Köpt old way som fungerar ∧ jämförelsehandlad ∧ < 300 kr:** 30 % av förlorarna (golfborste, kran, mattdynor, stänkskärm, kedjeslip, mobilskal), 0/9 vinnare.
- **Fel/tidig/sen säsong vid launch:** 25 % av förlorarna, 0/9 vinnare.
- **Personlig passform/mode** (shorts, kängor, badshorts, sneakers): 0/9 vinnare utom tofflorna, som är gruppens tunnaste (4) och kontrollpunkten (9).
- **Förbrukningsvara, kit, "N-i-1 verktyg", lek/spel för barnfamilj:** 0/9.
- **Pris under 199 kr:** 0/9. Pris över 1 000 kr: 0/9 (AI-glasögonen, 1 869 kr, är kontots tydligaste förlorare).
- **Objektet förvaras inomhus när det inte används** (gräsklippare i förråd, cykel i garage): 0/9 — alla vinnares objekt står ute, bärs eller används varje gång.

**Kreativ nivå (400 annonser i vinnarkampanjerna — bevisat inom gruppen):**
- Social proof/testimonial-kort: 0 bedömbara vinnare i 1, 3, 4, 5, 6, 10.
- Gåvovinkel: 0 köp i 6 (790 kr), 7 (26 kr), 10 (35 kr) — alla i augusti.
- Mekanismförklaring, POV-kort, curiosity-hook, listicle: förlorare i 3, 5, 6, 8.
- Video utan captions: ROAS 1,11 (3). Produkt först vid sekund 9: ROAS 0,56 (7).
- Prisankare överst i statisk bild: CTR 0,94 % (5). Falsk rabatt/knapphet: lönsam kortsiktigt (6, 8) men förbjuden.
- Hög CTR som urvalskriterium: SP-videor med 5,7–8,5 % CTR gav 1 köp på 1 685 kr (3); tre lägsta CTR-annonserna konverterar bäst (1, tre körningar i rad).
- Leverantörsvideo som visar en annan fysisk produkt än listningen (7): ROAS 0,56.

---

## 7. Motsägelsetest och klassning

| Variabel | Motsägande vinnare | Vad undantaget lär | Klass |
|---|---|---|---|
| B. Problemet finns nu | Klistermärkena (inget problem) | Ett *want* kan ersätta ett *need* om friktionen är noll, objektet universellt och priset 199 kr — men det ger kontots tunnaste vinst i kronor. | **HÖGT PREDIKTIV** (inte REQUIRED) |
| C2. Ägd sak ute/kroppslig | Bandslipen (knivar inomhus) | Ersätts av kluster 3 (909 kr, BE-CPA 525). | HÖGT PREDIKTIV |
| E. Ingen kedja säljer formen | Strandtofflor (Rusta 35 kr), Axelbälte (Jula 349), Kamera (Tapo 679) | Fungerar ändå när ett **märkesankare 1,6–3× högre** finns synligt (Crocs, Husqvarna, Kjell) och vår produkt ser ut som ankaret, inte som lågprisvaran. Utan ankare (tofflor 9: look-alike 229 kr) faller det. | HÖGT PREDIKTIV, villkorad |
| A. Leverantörsmaterial som annons | Axelbältet (äkta UGC vann), IBC (AI + egen film) | Kroppslig payoff (smärta bort) och osynlig payoff (klart vatten om veckor) kan inte visas av en katalogbild — där krävs en människa eller en konstruerad före/efter. | HÖGT PREDIKTIV för synliga payoffs; SUPPORTING annars |
| P. Man 45–70 | Klistermärkena (58 % kvinnor 55+), Cykelshorts/Damasker (lovande, annan publik) | Kärnan är "äger hus/tomt och är 55+", inte kön. Två aktiva lovande kan sänka P till SUPPORTING inom veckor. | HÖGT PREDIKTIV, bevakas |
| M. Pris > 500 kr säkert | Motorhölje (299), Spöhållare (289), Klistermärken (199) — tre av de fyra största vinnarna ligger under 300 kr | Under 300 kr fungerar bara med kostnad ≤ 100 kr (BE-CPA ≥ 190) **och** leverantörsmaterial som annons (noll produktionskostnad). | ASYMMETRISK: > 500 kr = säkert; < 300 kr = bara med kluster 2 |
| L. Storleksrisk | Motorhöljet (30 varianter, största vinnaren) | Varianter är ofarliga när ägaren **kan parametern utantill** (hk). Farliga när han måste mäta eller gissa (skostorlek 36–47, "passar de flesta"). Rätt variabel: *ägarkunskap om parametern*, inte antal varianter. | NEGATIV-svag → omdefinierad |
| J. Mekanismnyhet | 7 av 9 ligger på avstånd 1–2; det enda 4:et (klistermärken) är gruppens tunnaste | Nyheten som bär är **kategorinyhet i svenskt flöde**, inte mekanism. Förklaringskrävande mekanismer (avstånd ≥ 3) sänker CVR (bandslip). | **INCIDENTAL** som prediktor; ≥ 3 = varning |
| I. Förstås i stillbild | Sätesöverdrag (video 83 %), Motorhölje (video), IBC (statik 0 köp) | Statik vinner när payoffen är produkten själv (tofflor, klistermärken, sele); video när payoffen är en handling (trä på, blixtlås, spön upp). Båda är "visa, förklara inte". | SUPPORTING |
| S. Kroppslig smärta | 5/9 saknar det | Bevisat starkt där det finns (3, 5) men inte nödvändigt. | WEAK-SUPPORTING |
| R. Estetisk bonus | 4/9 | Nämns i recensionsspråk (3, 10) men ingen annons vann på det. | WEAK |
| U. Titelkvalitet | 3 och 10 (0 nyttoclaims, maskinöversatt) är två av de bästa | Titeln är brus; ordet kunden använder ("axelbälte", "sätesöverdrag") är det som räknas, och det kom från Axels sökning, inte listningen. | INCIDENTAL |
| V/W. Galleri, huvudbildstil | 5 bilder i alla tio; stilen varierar K/S/C utan mönster | Ingen information. | INCIDENTAL |
| X. Temu-siffror | UNKNOWN | Kan inte klassas. Både vinnare och förlorare valdes på Temu med samma ögon — popularitetssignaler på Temu diskriminerar därför sannolikt svagt. Ska mätas i nästa fas för att kunna testas. | UNKNOWN |

---

## 8. Orsakstest — varför skulle variabeln ge bättre utfall i Axels system?

| Variabel | Kedjan till systemet | Håller? |
|---|---|---|
| B. Problemet finns nu | → Igenkänningsfråga som hook → högre köp/klick (dna mönster 3: låg CTR, hög CVR) → CPA under BE utan agitation → skalar utan att copyn behöver bytas. | Ja — mätt i 3, 5, 10 |
| C2. Ägd sak ute/kroppslig | → Objektet i bild ger Meta en targeting-signal (CPM 82–127) → bred kall prospektering fungerar från batch 1 (5: Advantage+ broad) → ingen retargeting behövs. | Ja — CPM-mönstret är entydigt |
| E/F. Hyllfrånvaro | → Annonsen sätter ankaret → jämförpris tolereras (5: 509→599 utan CVR-fall) → uppslag 2,4–3,1× → BE-ROAS 1,5–1,7 → CPA-utrymme. | Ja |
| A. Materialöverförbarhet | → Batch 1 innehåller vinnaren från dag 1 (2, 3, 4, 6, 8) → ingen briefkvot förbrukas på att hitta den → redigerarna gör captions, inte manus → kvoten (mål nr 1) går till varianter av en bevisad kropp. | Ja — men bara bevisat inom vinnarna |
| M/N/O. Prisutrymme + flerköp | → BE-CPA 350–525 → tål 4 installationssteg eller CVR 0,6 % → produkter som kontot annars inte kan bära. | Ja — Shopify-ordrar bekräftar |
| P. Man 45–70 småhus | → Kontots pixel och lookalikes är byggda på honom → ny produkt ärver inlärningen. | Plausibelt, inte isolerat mätt |
| Q. Säsong | → Problemet är färskt (grön tank i augusti) → B uppfylls. Q är en förutsättning för B, ingen egen variabel. | Ja, via B |
| J. Mekanismnyhet | Ingen kedja: nyhet kräver förklaring → förklaring förlorar i kontot (3, 5, 6, 8). | Nej → nedgraderad |
| U. Titel | Ingen kedja. | Nej → INCIDENTAL |
| Oxford-tyg / "skydd" | Gräsklippartäcket och Kranskyddet har båda → ingen kedja utöver B och C2. | Nej → INCIDENTAL |

---

## 9. Latenta variabler — nya, definierade så att de går att mäta

1. **Materialöverförbarhet (0–3).** 0 = bara katalogbilder med inbränd utländsk text; 1 = textfri hero i studio; 2 = video som visar produkten i bruk inom 3 s; 3 = video i bruk + hero i kontext + samma fysiska produkt i video och listning. Mät: öppna listningens video, klocka sekunden då produkten används, kolla inbränd text. Vinnarna: 2, 3, 4, 6, 8 ≥ 2; 7 = 1 (heron räckte som referens); 5 = 1 (räckte inte — UGC krävdes).
2. **Ägarpresens (0–2).** 0 = skadan ligger i framtiden eller inomhus (frost, klippare i förråd); 1 = problemet finns men syns inte (trötta fötter, slö kniv); 2 = problemet syns/känns hos ägaren i launchmånaden (grönt vatten, sprucken sits, spön i kaos, öm axel). Mät: kan du fotografera problemet i en svensk trädgård i launchmånaden?
3. **Hyllfrånvaro (0–2).** 0 = Biltema/Jula/Clas Ohlson/Rusta säljer samma form; 1 = säljs bara i fackhandel/marketplace; 2 = ingen svensk kanal utom Amazon/Fyndiq. Plus: antal svenska Meta-annonsörer i Ad Library (0–1 = grönt). Mät: fyra sajtsökningar + Ad Library, 10 minuter.
4. **Ägarkunskap om varianten (0–2).** 0 = kunden måste mäta/gissa (skostorlek, "passar de flesta"); 1 = kunden vet ungefär; 2 = kunden kan parametern utantill (hk, tankvolym) eller det finns en variant. Ersätter "antal varianter".
5. **Hävstång mot ägd sak.** Ägd saks värde / produktpris. ≥ 10× i 7 av 9. Under 3× (IBC 1–3×, knivar) måste kluster 3 kompensera.
6. **Ägarfråge-hooken.** Kan problemet skrivas som en ja/nej-fråga på ≤ 7 ord som bara ägaren svarar ja på? ("Har du en IBC-tank i trädgården?" "Ont i axlarna efter en dag i trädgården?") Mät: skriv den. Går det inte → produkten kräver agitation → varning.
7. **Flerköpsskäl (0/1).** Finns ett fysiskt skäl att äga 2–3 (flera ställen, flera personer, förbrukning)? Kamera 1,70 enheter/order avgjorde ROAS.
8. **Titel-nytto-gap.** Antal nyttoord i Temu-titeln jämfört med de svenska kategorisidornas rubrik. Stort gap (IBC: 0 mot "alger" överallt) = leverantören vet inte vad han säljer = ingen konkurrent har heller positionerat = vår marginal. Svag variabel, men gratis att mäta.
9. **Publik-CPM-proxy.** Objekt som är ovanliga och omisskännliga i ett Meta-flöde (gallerkub, utombordare, åkgräsklippare, röjsåg) ger CPM 100–127; generiska objekt (tofflor, skor) 140–220. Mät: är objektet unikt nog att Metas modeller kan hitta ägaren på bilden?

---

## 10. Implikationer för det befintliga systemet (inget ändrat — bara vad datan säger)

Axels system så som det står i repot: SOP-06 (produkttest, 300 kr/3 köp-grinden, 2 extra ads), `docs/temu-launch-flow.md` (4 vinklar × 3 videor + 1 bild, BE-ROAS i kampanjnamnet, 1 000 kr/dag), ANALYSMETOD (vinstbidrag, kill mot BE), CS OS v2 (klassning), CLAUDE.md regel 11 (test-ABO), kvoten. Ingen skriven produktvals-matris finns i repot ("What product is next?"-kriterierna ligger fortfarande i Loom) — implikationerna nedan gäller därför de regler som finns skrivna.

**Starkt validerade:**
- Vinstbidrag och kill mot BE, inte mot target: sätesöverdraget (ROAS 2,15, CPA 336 mot target 300) och motorhöljet är kontots största vinster och hade dödats av en target-dom.
- "Ingen dom under 300 kr / 3 köp": 12 syskonbilder till klistermärkena, CS/SP/GT för IBC — alla svältade, inga förlorare.
- "CTR är inte mål" (mönster 3): tredje körningen i rad + SP-videor med 8,5 % CTR och 0 köp.
- BE-ROAS i kampanjnamnet: det enda som gjorde kontrollgruppen läsbar. 18 kampanjer saknar det.
- 2-extra-ads-regeln (rå leverantörsvideo + textfri bild): **det var vinnaren i 2, 3, 4 och motorhöljets effektivaste annons.** Regeln är underviktad — den står som "extra", datan säger "först".

**Överviktade:**
- 4-vinkelsstrukturen (CS/G/PD/SP × 3 videor). G: 0 köp i tre kampanjer. SP-kort: 0 bedömbara i sex kampanjer. CS: lönsam bara med sann rabatt (2) och annars på falsk knapphet (6, 8). Sex av tolv launchvideor per produkt går till vinklar som aldrig vunnit.
- "Problemlösare" som kategori: 70 % av förlorarna löser också ett bekant problem med en bekant mekanism.
- Mekanismnyhet: bär inget; avstånd ≥ 3 sänker CVR.

**Underviktade / saknas helt:**
- Materialöverförbarhet som **urvalskriterium** (inte bara som extra ad).
- Ägarpresens + säsong vid launch som **stoppregel** (Kranskydd i augusti, Plyschtofflor i augusti, Gräsklippartäcket när klipparen används).
- Hyllkontroll (fyra kedjor + Ad Library) före köp av test-creatives.
- Ägarkunskap om varianten i stället för "antal varianter".
- Flerköp: bundle-planer är BLOCKER i tre backlogs (4, 5, 9) medan kameran bevisar effekten.
- Demografi 55+: klistermärkena (89 % av köpen 55+) och tofflorna (80 %) — all copy skrevs för föräldrar/yngre. En 55+-lins på varje brief.
- BE-konsistens: batch-sheet ger lägre BE än kampanjnamnet för tre produkter; axelbältets BE är räknat på 509 kr; tofflor 9:s ground-truth-BE saknade skatten.

**Interaktioner mellan befintliga regler:**
- Regel 11 (test-ABO) bryts av Temu-flödets CBO (klistermärken, IBC, kamera): vinkeldatan från de senaste launcherna är därför **oläsbar** — det som ser ut som "G förlorar" är ofta "G svalt".
- 2 000 kr-regeln (dna: "kalla inget vinnare under 2 000 kr") + marginell CPA mellan snapshots ≥ 3 dygn: tofflor 9 såg ut som vinnare vid 2 500 kr och var det inte.

**Trösklar som är olinjära:**
- Pris: > 500 kr har aldrig förlorat; 300–500 är blandat; < 300 vinner bara med kostnad ≤ 100 kr och gratis material.
- Spend: en annons är inte bedömd förrän 2 000 kr och två snapshots.
- CTR: icke-monoton — ytterkanterna säger mest, mitten inget.
- Varianter: 1 eller ägarkänd parameter = ofarligt; 12 storlekar = returrisk okänd (aldrig mätt i repot).

**Antaganden som datan motsäger:**
- "Social proof är en standardvinkel" — aldrig passerat grinden som testimonial-kort.
- "Gåva" i augusti — 0/3.
- "Video slår bild" — tofflor, klistermärken, sele (per krona) och bandslip (per krona) säger tvärtom när payoffen är produkten själv.
- "Vinnarlistan" — vinnare 9 ligger under BE.

---

## 11. Temu-marknadssignaler — vad som gick att läsa och vad det säger

| Signal | Mätbar nu? | Utfall i datasetet | Bedömning |
|---|---|---|---|
| Pris, referenspris, rabatt | Nej (blockerat) | UNKNOWN | UNKNOWN — samla vid nästa jakt |
| Betyg, antal recensioner, sålda, velocitet | Nej | UNKNOWN | UNKNOWN. Obs: förlorarna valdes också från Temu — signalerna diskriminerar troligen svagt |
| Säljare, badges | Nej | UNKNOWN | UNKNOWN |
| Titelstruktur | Ja | 10–26 ord; 3 och 10 helt utan nyttoclaims; 6 saknar ordet kniv; synonymstapling i 3, 6, 10 | Brus. Ordet kunden använder kommer från Axels sökord, inte titeln |
| Kategori (meta keywords) | Ja (7 av 10) | Patio/lawn & garden ×2, men's shoes ×2, elverktyg, home decor, smart home | Ingen kategori dominerar; "tillbehör till ägt objekt" går tvärs över kategorier |
| Antal galleribilder | Ja | 5 i alla tio | Noll information |
| Huvudbildens typ | Ja | Katalog 6, studio-drop 2, i kontext 2 | Ensam inget; **"duger som annons"** (4, 7) är det som räknas |
| Video på listningen | Nej (blockerat) — men Drive visar att leverantörsvideo fanns för 2, 3, 6, 8 | Vinnaren i fyra kampanjer | **Den viktigaste Temu-signalen — och den enda som behöver en mänsklig blick (30 s per listning)** |
| Inbränd utländsk text/logga på produkten | Ja (bild) | 9 ("ADEVNUTRES"), 1 ("Outboard Motor Cover") | Hygienfaktor; fällde inte 1, bidrog i 9 |

---

## 12. Vinnarfingeravtryck — filtret för 10 000 listningar

Ordningen är eliminationsordning: varje steg tar bort flest kandidater billigast. Siffrorna i parentes är hur många av de nio vinnarna som klarar steget.

```
STEG 0  OBJEKTET   Produkten fäster på / används med något som ägaren redan har,
                    och det står utomhus, används kroppsligt eller är universellt.
                    Objekt: båt, utombordare, åkgräsklippare, trimmer/röjsåg, IBC-tank,
                    hus/tomt, kärl, spön, knivar/verktyg …                        (9/9)
        ELIMINERA   mode, personlig passform, kit, förbrukning, lek, "N-i-1",
                    allt som ägaren förvarar inomhus när det inte används.

STEG 1  PRESENS    Problemet/önskan syns eller känns hos ägaren i launchmånaden.
                    Test: kan det fotograferas i en svensk trädgård den månaden?   (8/9; 7 = want)
        ELIMINERA   framtida skada (frost), osynlig långsam skada, "märks på kvällen".

STEG 2  HYLLAN     Biltema/Jula/Clas Ohlson/Rusta säljer INTE samma form,
                    Ad Library SE visar 0–1 annonsörer.                             (6/9)
        UNDANTAG    tillåtet om ett synligt märkesankare ≥ 1,6× vårt pris finns
                    och vår produkt ser ut som ankaret (Crocs, Husqvarna, Kjell).  (+3/9)

STEG 3  MATERIALET Listningens video visar produkten i bruk inom 3 s, utan inbränd
                    utländsk text, samma fysiska produkt som listningen;
                    eller heron är textfri och kan stå som annons.                 (7/9)
        UNDANTAG    kroppslig eller fördröjd payoff → kräver UGC/före-efter (5, 10).

STEG 4  PRISET     Tänkt svenskt pris ≥ 2,4 × landad kostnad, och
                    ≥ 300 kr (BE-CPA ≥ 190) — eller > 500 kr, som aldrig förlorat.  (9/9; 7 = 199 med kostnad 80)
        ELIMINERA   < 250 kr med kostnad > 100 kr; > 1 000 kr.

STEG 5  VARIANTEN  En variant, eller en parameter ägaren kan utantill (hk, liter).  (7/9)
        VARNING     skostorlek, "passar de flesta" utan mått.

STEG 6  HOOKEN     Skriv ägarfrågan på ≤ 7 ord. Går det inte → agitation krävs →
                    ned en klass.                                                   (7/9)

STEG 7  PUBLIKEN   Ägaren är 45–70 med småhus/fritidshus. Objektet är omisskännligt
                    i flödet (CPM-proxy).                                           (8/9)

BONUS   flerköpsskäl (kamera) · estetisk bonus · titel-nytto-gap · säsong ≥ 6 v kvar.
IGNORERA mekanismnyhet · titelkvalitet · antal galleribilder · Temu-kategori · material.
SAMLA   Temu-pris/betyg/sålda/säljare vid varje kandidat — för att kunna testa dem nästa gång.
```

Vinnare 9 (kontrollpunkten) faller i steg 0 (ingen ägd sak, personlig passform), steg 1 (märks på kvällen), steg 2 (BilligaBoden 229, 648 annonser) och steg 5. Filtret hade stoppat den.

---

## A–M. Slutleverans

**A. STÖRSTA UPPTÄCKTEN.** Vinnarna är inte produkter med bättre mekanism. De är Temu-listningar vars eget material redan är en färdig Meta-annons (7 av 9), riktade mot en ägare som redan lever med problemet i launchmånaden (8 av 9), i en form som svensk handel inte har hyllat (6 av 9, resten med ett märkesankare 1,6–3× högre). Produktjakten är i praktiken **materialjakt + ägarjakt**, inte mekanismjakt.

**B. TOPPVARIABLER, rankade.** (1) Ägarpresens — problemet finns nu, hos någon som äger objektet, och objektet står ute eller används kroppsligt. (2) Hyllfrånvaro + 0–1 annonsörer, eller ett synligt märkesankare ≥ 1,6×. (3) Materialöverförbarhet — leverantörens video/foto duger som annons med captions. (4) Prisutrymme: ≥ 2,4× kostnad och ≥ 300 kr; > 500 kr har aldrig förlorat. (5) Ägarfråge-hook på ≤ 7 ord. (6) Man 45–70, småhus/fritidshus. (7) Launch inom säsong (förutsättning för 1). (8) Ägarkänd variantparameter. (9) Old way = improvisation. (10) Flerköpsskäl.

**C. STARKASTE INTERAKTIONER.** Ägarpresens ∧ ägd sak ute ∧ hyllfrånvaro (6/9 vinnare, ≤ 1/20 förlorare). Leverantörsmaterial ∧ ägarfråga (batch 1 innehåller vinnaren från dag 1). Pris > 500 ∧ uppslag ≥ 2,4× ∧ flerköp (tål komplexitet och låg CVR). Improvisation som old way ∧ ägd sak ≥ 10× priset.

**D. LATENTA VARIABLER.** Materialöverförbarhet (0–3), ägarpresens (0–2), hyllfrånvaro (0–2 + Ad Library), ägarkunskap om varianten (0–2), hävstång mot ägd sak, ägarfråge-hooken, flerköpsskäl, titel-nytto-gap, publik-CPM-proxy. Definitioner och mätsätt i avsnitt 9.

**E. TEMU-SIGNALER.** Alla numeriska signaler UNKNOWN (blockerat) — och sannolikt svaga diskriminatorer eftersom förlorarna valdes med samma signaler. Det som bär är listningens **video** (produkt i bruk ≤ 3 s, samma produkt, ingen inbränd text) och en textfri hero i kontext. Titel, kategori, galleriantal och material är brus.

**F. META-VINNARSTRUKTUR.** Objektet i bild sekund 0 → ägarfråga eller problem-callout (handduken, presenningen, "tre kameror förut") → produkten i bruk före sekund 4 → svenska captions → pris/garanti sist. PD-vinkel 8/10. Statik när payoffen är produkten själv, video när payoffen är en handling. Aldrig förklaring, aldrig testimonial-kort, aldrig gåva i augusti, aldrig video utan captions. Vinnaren håller marginell CPA vid skala; allt annat i kampanjen faller (motorhöljet 9 av 9, tofflor 9 efter 2 500 kr).

**G. MEKANISMMÖNSTER.** Median-avstånd 1 från den konventionella lösningen. Bekant problem, bekant eller lätt förbättrad mekanism, **överförd till ett nytt objekt eller en ny distributionskanal**. Kategorinyhet i svenskt flöde ersätter mekanismnyhet. Avstånd ≥ 3 (bandslip) kostar CVR; avstånd 4 (klistermärken) fungerar bara som want med noll friktion.

**H. NEGATIV RYMD.** Latent behov (55 % av förlorarna). Annan publik än 45+ med hus. Montering/app/inlärning. Köpt fungerande old way ∧ jämförelsehandlad ∧ < 300 kr. Fel säsong. Personlig passform/mode. Kit, förbrukning, lek, N-i-1. < 199 kr eller > 1 000 kr. Objekt som förvaras inomhus. Kreativt: testimonial-kort, gåva, mekanismförklaring, curiosity, video utan captions, produkt efter sekund 3, prisankare överst, leverantörsvideo av fel produkt.

**I. MOTSÄGELSER.** Klistermärkena (inget problem → want + noll friktion + 199 kr). Kameran (jämförelsehandlad, app, 4 steg → synlig hårdvaruskillnad + 40–60 % under märket + flerköp). Axelbältet (leverantörsmaterial räckte inte → kroppslig payoff kräver människa). Motorhöljet (30 varianter → ägarkänd parameter). Bandslipen (909 kr, lägst CVR → BE-CPA 525 räddar). Strandtofflorna (kosmetisk variation, 35-kronors alternativ → leverantörsfoto + Crocs-ankare + säsong + 2 M småhus, men bara 27 kr per köp över BE). Vinnare 9 (ligger under BE — "vinnarlistan" innehåller en förlorare).

**J. MATRISIMPLIKATIONER.** Validerat: vinstbidrag, BE-kill, 300/3-grinden, CTR-regeln, BE i kampanjnamn, 2-extra-ads. Överviktat: G- och SP-vinklarna, "problemlösare", mekanismnyhet. Saknas: materialöverförbarhet som urvalskriterium, ägarpresens + säsong som stoppregel, hyllkontroll, ägarkunskap om variant, flerköp, 55+-lins. Olinjärt: pris (> 500 säkert), spend (2 000 kr), CTR (ytterkanter), varianter. Motsagt: SP som standardvinkel, gåva i augusti, "video slår bild", vinnare 9. Regel 11 bryts av Temu-flödets CBO — vinkeldatan från nya launcher är oläsbar.

**K. FINGERAVTRYCK.** Ägd sak ute/kroppslig · problemet finns nu · ingen svensk kedja (eller ankare ≥ 1,6×) · leverantörsvideo i bruk ≤ 3 s · pris ≥ 2,4× kostnad och ≥ 300 kr (> 500 säkert) · en variant eller ägarkänd parameter · ägarfråga ≤ 7 ord · man 45–70 småhus. Full eliminationsordning i avsnitt 12.

**L. SÄKERHET.** *Hårda data:* alla Meta- och Shopify-siffror; vinnande annons/format/vinkel per kampanj; captions-A/B:n; handduks-partestet; flerköpsandelen; kontrollgruppens frekvenser för latent behov, publik, montering, pris, säsong. *Läsning:* huvudbildernas komposition, vad videorna visar (frames), att vinnarbilderna bygger på leverantörsmaterial (bildjämförelse, inte loggat). *Hypotes:* köparprofil utöver de två kampanjer med demografi (7, 9), ägarbaser (uppskattningar), säsongsfönster, att kluster 1–3 håller på nya produkter, att Temu-signaler diskriminerar svagt. *Blint:* Temu-siffror; förlorarnas creatives; returer.

**M. JAKTIMPLIKATIONER (nästa fas — inte utförd).** Sök Temu på **objektet**, inte på produkten: det svenska 45–70-hushållets utomhusägodelar (båt/utombordare, brygga, åkgräsklippare, trimmer/röjsåg, motorsåg, IBC/regnvatten, husvagn/släp, MC, pool/spabad, vedförråd, jakt, altan) och "skydd / ordning / komfort / tillbehör för X". För varje kandidat, i ordning: (1) klarar STEG 0–1 (ägt, ute, problemet syns i launchmånaden)? (2) fyra kedjesökningar + Ad Library; (3) öppna listningens video: produkt i bruk ≤ 3 s, ingen inbränd text, samma produkt; (4) landad kostnad × 2,4 ≥ 300 kr; (5) variantparametern ägarkänd; (6) skriv ägarfrågan på ≤ 7 ord; (7) notera flerköpsskäl och ankare. Samla Temu-pris/betyg/sålda/säljare per kandidat så att de kan testas mot utfallet. Hoppa över allt som kräver att annonsen skapar behovet, allt personligt (passform, mode), allt inomhus, allt under 199 kr eller över 1 000 kr, och allt vars leverantörsvideo visar en annan produkt än listningen. Launch bara när ≥ 6 veckor av säsongen återstår, och lägg den råa leverantörsvideon + den textfria heron **först** i batchen, i ett ABO enligt regel 11 — inte som "extra".
