# Granskning av Matstrumpors utlandsbygge — 2026-09-30

Granskaren är en fristående session som följer `matstrumpor/marknader/PROMPT-granskning.md`. Allt är läs-bart. Inget är ändrat i Meta eller Shopify, inget är postat och inget är betalt. Mätt 2026-09-30 13:55–17:35 UTC.

**Kort:**
- **Något ACTIVE?** Nej. Alla 15 kampanjer, 14 adsets och 112 annonser är PAUSED. Det enda som är ACTIVE i kontot är Sveriges `MATSTRUMP_SALES_20260826`, och den rör vi inte.
- **Kvar som stoppar, efter andra prövningen: 1 🔴.** Metas fel på WW-adsetet: Australien kräver en verifierad annonsör och betalare.
- **Ett 🔴 till var verkligt men är redan rättat av någon annan.** Korgen och kassan blev engelska i alla Europa-språk (G-D01). Temats `ms-paket.js` byttes 17:30:35 UTC, och efter det får korgen rätt språk (prövat i DK, NL och TW). Granskningen rättade inget. Vem som bytte filen syns inte härifrån.
- **Ungefär 150 🟡**, varav de flesta är språk. Alla står i bilagan per språk.
- Tabellen nedan räknar dem per kampanj, efter den andra prövningen.

## Domen per kampanj

"Klar att slå på" betyder att inget 🔴 finns kvar. De gula bör rättas först, men de stoppar inte. Siffrorna 🟡 är språkgranskarens gula för språket, plus de gemensamma: G-B04 (004:s textrutor överlappar), G-B06 (suddlist runt undertexten) och G-D04 (fraktmejlen länkar till .se).

| Kampanj | Annonser | 🔴 | 🟡 (språk + gem.) | Klar att slå på | Ads Manager |
|---|---|---|---|---|---|
| NO (A) | 8 | 0 | 9 + 3 (lyssna på 002 #3 och 007) | ja, efter lyssning | [öppna](https://adsmanager.facebook.com/adsmanager/manage/ads?act=730973156224390&selected_campaign_ids=120251749551520023) |
| NOB (B) | 8 | 0 | 9 + 3 (samma filer som NO) | ja, efter lyssning | [öppna](https://adsmanager.facebook.com/adsmanager/manage/ads?act=730973156224390&selected_campaign_ids=120251777339520023) |
| DK | 8 | 0 | 7 + 3 (lyssna på 001 #4, täckning 0,20) | ja, efter lyssning | [öppna](https://adsmanager.facebook.com/adsmanager/manage/ads?act=730973156224390&selected_campaign_ids=120251749599180023) |
| FI | 8 | 0 | 11 + 3 (”susi” = varg i 001–003, lyssna) | ja, efter lyssning | [öppna](https://adsmanager.facebook.com/adsmanager/manage/ads?act=730973156224390&selected_campaign_ids=120251749604200023) |
| US | 8 | 0 | 10 + 3 | ja | [öppna](https://adsmanager.facebook.com/adsmanager/manage/ads?act=730973156224390&selected_campaign_ids=120251749609010023) |
| WW (GB, AU, CA, NZ) | 8 | **1** (G-A01) | 10 + 3 | **nej** | [öppna](https://adsmanager.facebook.com/adsmanager/manage/ads?act=730973156224390&selected_campaign_ids=120251749612350023) |
| DE (DE, AT, CH) | 8 | 0 | 9 + 3 | ja | [öppna](https://adsmanager.facebook.com/adsmanager/manage/ads?act=730973156224390&selected_campaign_ids=120251750242530023) |
| FR (FR, BE, LU) | 8 | 0 | 11 + 3 | ja | [öppna](https://adsmanager.facebook.com/adsmanager/manage/ads?act=730973156224390&selected_campaign_ids=120251750244370023) |
| NL | 8 | 0 | 8 + 3 | ja | [öppna](https://adsmanager.facebook.com/adsmanager/manage/ads?act=730973156224390&selected_campaign_ids=120251750246440023) |
| ES | 8 | 0 | 9 + 3 | ja | [öppna](https://adsmanager.facebook.com/adsmanager/manage/ads?act=730973156224390&selected_campaign_ids=120251750248310023) |
| IT | 8 | 0 | 11 + 3 | ja | [öppna](https://adsmanager.facebook.com/adsmanager/manage/ads?act=730973156224390&selected_campaign_ids=120251750250830023) |
| PL | 8 | 0 | 10 + 3 | ja | [öppna](https://adsmanager.facebook.com/adsmanager/manage/ads?act=730973156224390&selected_campaign_ids=120251750321130023) |
| PT | 8 | 0 | 11 + 3 | ja | [öppna](https://adsmanager.facebook.com/adsmanager/manage/ads?act=730973156224390&selected_campaign_ids=120251750324340023) |
| JP | 8 | 0 | 9 + 3 (+ 五足 hörs som 不足 i 002) | ja, efter lyssning | [öppna](https://adsmanager.facebook.com/adsmanager/manage/ads?act=730973156224390&selected_campaign_ids=120251797899280023) |
| TW | 0 | 0 | 6 + mejlknappen till 404 (G-D03) | **nej**, tom med flit | [öppna](https://adsmanager.facebook.com/adsmanager/manage/ads?act=730973156224390&selected_campaign_ids=120251796778420023) |

**Gula utanför tabellen**, eftersom de gäller hela sajten eller dokumentationen: G-D05 ("11 recensioner" på svenska i JP/TW), G-D06 (Klarna-ikonen i sidfoten i JP/TW), G-D07 (TWD skrivs "$"), G-D08 (Shopifys levererat-mejl: det japanska ämnet säger "skickats" och det kinesiska säger "din order har avbrutits") och G-F01–F08 (CLAUDE.md och README säger fel om antal, budgetar och tabeller).

⚠️ **I 12 av 14 kampanjer som kan leverera går break-even inte att räkna** (del G). Det är allt utom US och WW, eftersom 16 av 21 kampanjländer saknar varukostnad i `cogs.json`. Att en kampanj är "klar" betyder att den är tekniskt och språkligt rätt, inte att det går att döma den när datan kommer.

## De röda fynden, efter andra prövningen

Varje rött fynd har prövats en gång till av en annan agent med egna mätningar (`verifiering`, sammanfattad här).

```
G-A01 🔴  WW, adset MATSTRUMP_WW_ugc 120251749614670023 + alla 8 WW-annonser — BEKRÄFTAT
Vad:     Meta flaggar adsetet: Australien kräver verifierad annonsör och betalare. Felet sitter på ADSETET, som också bär GB, CA, NZ — om Meta stoppar bara AU eller hela adsetet går inte att mäta utan att slå på.
Bevis:   GET adsets 13:56:43 UTC och igen 17:21 UTC: issues_info error_code 3858810, SOFT_ERROR, "Annonser som omfattas av allmän reglering och riktar sig till reglerade länder (Australien) utan verifierade identiteter … måste uppge verifierad annonsör och betalare för att leverera annonser". regional_regulated_categories/identities inte satta. Ärvt på annonserna 120251773120110023 … 120251779480740023. Övriga 13 adsets: inga issues. marknader.json → WW nämner inte kravet.
Förslag: A) verifiera STONEBITE ECOM AB som annonsör + betalare för Australien (samma väg som Taiwan, cowork/3-taiwan-verifiering.txt), eller B) ta AU ur WW tills det är klart.
Vem:     Axel (verifieringen) + byggarsessionen (adsetet, marknader.json)
```

```
G-D01 🔴→✅  Alla icke-engelska språk (NO A, DK, FI, DE/AT/CH, FR/BE/LU, NL, ES, IT, PL, PT, JP) — korgen och kassan blev engelska. RÄTTAT 17:30:35 UTC av någon annan
Vad:     Köpknappen i paketväljaren skickade ibland (när sidolådan inte hann öppnas) till matstrumpor.com/cart utan språkmapp ⇒ engelsk korg och kassa en-XX med rubriken "Matstrumpor.se Checkout". Summan och erbjudandet var rätt.
Bevis:   ms-paket.js ?v=…1790763353, laddaOm(): rutt+"discount/"+kod+"?redirect="+encodeURIComponent("/cart"). curl 15:02 UTC: /da/discount/SUSHI-K1F1?redirect=%2Fcart → 302 https://matstrumpor.com/cart, lang="en". Chromium: engelsk korg i 16 av 32 körningar (del D) respektive ~6 av 18 (verifieringen), oberoende av webbläsarens språk. Ny fil ?v=…1790789435 (tiden i v = 17:30:35 UTC) skickar redirect=rutt+"cart"; efter bytet TW 17:31 → /zh-tw/cart, DK 17:33/17:34 → /da/cart + kassa da-DK, NL 17:33 nl.
Förslag: Inget att rätta. Rättningssessionen bör skriva in vem som bytte och att NOB-testets första timmar (om något slås på) inte påverkades. Kassans rubrik "Matstrumpor.se" står kvar på alla språk (🔵 nedan).
Vem:     byggarsessionen (dokumentera)
```

Samma fel står i språkbilagorna som G-C-nb-01, G-C-DA-02, G-C-fi-01, G-C-NL-01, G-C-es-01, G-C-it-01, G-C-PL-01 och G-C-PT-01. Alla är G-D01 och alla är rättade.

- **Luckkontrollen 17:38 UTC:** /fi, /pl och /ja laddar alla den nya `ms-paket.js` (0 träffar på `"/cart"`), så rättningen gäller alla språk.
- **Kassans språk efter rättningen** är bara omprövat i webbläsare i DK, NL och TW.
- **Inte omprövat:** att kassans landlista börjar med "Sweden" (G-C-fi-01).

**Sänkta eller strukna vid andra prövningen** (med bevis i avsnitten nedan):

| Kandidat | Första domen | Andra domen | Varför |
|---|---|---|---|
| G-D02, DE- och FR-länken landar på engelska | 🔴? | 🔵 | Engelskan kom av att containern står i USA plus Cloudflare. Efter `POST /localization DE` svarar `/de/…` på tyska med land DE. Med tysk eller fransk IP går det inte att mäta härifrån. |
| G-B02 / G-C-DA-01, DK 007 "sokker" hörs som "sukker" | 🔴 | **struket** | Whisper hör "sukker" även i referenserna DK 005 och 006. Med ledtråd hörs "sokker" i alla fyra repliker. Mätningen skiljer inte 007 från de andra. |
| G-B01, JP 007 靴下 hörs som "kusushita" | 🔴 | 🔵 | Felet hördes bara i en av två repliker utan ledtråd. |
| G-C-JA-01, JP 008 "EUサイズ36–44" innehåller 4 | 🔴 | 🔵 | Det står bara i brödtexten, inte i bilden. Regel 7 kräver raden och regel 14 förbjuder 4, men spärren i koden undantar 36–44 med flit. Fråga till Axel. |
| G-C-en-01, 007 "I started this brand …" (AI-röst) | 🔴 | 🔵 | Samma rad finns i den svenska annonsen `s001h1_v2`, som är ACTIVE (1 994 kr, 9 köp). Det är ett befintligt beslut. FTC-risken i USA är en fråga till Axel. |
| G-D03, Taiwans fraktmejl länkar till en svensk 404-sida | 🔴 | 🟡 | Felet är bekräftat. Alla tre zh-TW-mallarna länkar till `.se/zh-tw/pages/spara` (404); rätt är `.com/zh-tw/` (200). Blir 🔴 den dag Taiwan startar. |

## Frågor till Axel (den viktigaste först)

1. **Australien i WW (G-A01):** A) verifiera bolaget för Australien, B) ta AU ur WW tills vidare.
2. **Tre gamla augustikampanjer** `MATSTRUMP_SALES AU/UK/US` (sushisock.com) är pausade på kampanjnivå, men alla 155 annonser under dem står ACTIVE. Markerar man "allt" i Ads Manager och slår på, börjar de spendera 3 000 kr/dag till en annan butik, och GB, AU och US hamnar i två kampanjer (G-F07/G-A). Ska de arkiveras?
3. **AI-röstens jag-berättelse i 007** ("jag startade företaget", "mamma sa"). Samma rad går redan i Sverige. I USA, Storbritannien och Taiwan är ett påhittat grundarvittnesmål en större risk (FTC 16 CFR 465 i USA).
4. **Julvinkeln 003** i länder där julstrumpan inte är tradition: JP, TW, NL (Sinterklaas), DE (Nikolausstiefel), ES och PT. Italien är redan anpassat till Befana.
5. **Överstrukna priser** (t.ex. 101,60 € mot 44,90 €): EU:s Omnibusregler kräver att förpriset är det lägsta de senaste 30 dagarna. Det kan inte mätas härifrån. Flaggat i IT, ES, FI, DE/AT, PL och NO.
6. **Talet 4 i "EU 36–44"** i JP 008 och i JP/TW-sajtens paketväljare och mejl: behålla eller byta till "約23〜28cm"?
7. **Bildannonsen 008 visar sex lådor**, men erbjudandet ger fyra (G-B09).
8. **Schweiz-kassan visar raden "Taxes"** (`land-CH.json` → `kassa.momsrader`). Det är Shopifys egen skatterad, så det här är information och inget förslag om skatteinställningar.
9. **DSA-namnet** för EU är "STonebite" och ingen betalare är satt. Det levererar ändå (G-A02).
10. **Varukostnaden** saknas för 16 kampanjländer, så break-even kan inte räknas där (G).

## Pengarna (G, information, ingen dom)

- Om alla 15 slås på: **14 000 kr/dag**. Eftersom Taiwan inte kan leverera blir det 13 000 kr/dag, och utan JP- och TW-platshållarna 12 000 kr/dag. Sveriges 10 000 kr/dag kommer ovanpå.
- Break-even-ROAS för sushi 5 par: US 1,182, GB 1,137, AU 1,198, CA 1,166, NZ 1,184. Övriga 16 kampanjländer saknar varukostnad: NO, DK, FI, DE, AT, CH, FR, BE, LU, NL, ES, IT, PL, PT, JP och TW.
- Hela tabellen står i bilaga G nedan.

## Kan inte mätas härifrån (samlat)

- **Vad Shopify väljer efter kundens IP** för länkarna utan land (WW, DE, FR). Containern går ut från USA, och Cloudflare utmanar den.
- **Om Metas Australienfel** stoppar bara AU eller hela WW-adsetet. Det syns först om man slår på.
- **Domänverifieringen** i Business Manager: `owned_domains` svarar #100.
- **Ljudet med ett mänskligt öra.** All röstkontroll är Whisper. En infödd bör lyssna på FI 001–003 ("susi"), JP 002 (五足), DK 001 #4, NO/NOB 002 #3 och NO/NOB 007.
- **Läppsynken** i rörelse. Den är bedömd på stillbilder.
- **Sajten på eget språk i AT, CH, BE och LU:** den första mätningen landade på engelska. Bara DE och FR är omprövade på eget språk, så fraktrutan på tyska och franska i de fyra länderna är inte prövad.
- **Kontaktarken:** JP, FI, PL, DE och alla 008-bilder är tittade ark för ark. Övriga språk är tittade fyra i taget och täckta av OCR varje sekund.
- **Längddrift i 001–003:** `rostkoll.py` kördes inte, och det finns ingen svensk källa för UGC-videorna. För 004–007 är längden lika med källan (14,26 / 52,21 / 48,01 / 41,61 s), så där finns ingen drift.
- **Trustpilot-raden på språket:** bara JP och TW är prövade.
- **Taiwan:** kontot har 0 annonser. Ljud och bild är inte mätta, bara texterna.
- **Spoks-flödena (E2):** Spoks-verktygen finns inte i sessionen.
- **Pixeln inne i Shopifys sandlåda.** Id:t lästes ur sidans egen pixelkö.
- **Kassans frakt och marknadsföringsruta med en riktig adress.** Vi skriver aldrig in något i kassan.
- **Prishistoriken bakom de överstrukna priserna.**

## Så granskade jag

- **Insamling, fyra agenter parallellt:**
  - Del A läste kontot: 15 kampanjer, alla adsets och 402 annonser med creative, 13:56–14:09 UTC.
  - Del B tog ut media: 91 unika videor och 12 bilder hämtade ur Meta, ffmpeg-teknik, Whisper per replik, kontaktark, OCR och en bildjämförelse mot Katarina.
  - Del D och E prövade sajten och mejlen i Chromium i alla 21 kampanjländer och gjorde korgen "Köp 2 – Få 2" i varje valuta. Fraktzonerna och de tre fraktmejlen på 13 språk lästes med GraphQL `query`.
  - Del F och G prövade 42 av byggarens påståenden och räknade på pengarna.
- **Språk:** 13 språkgranskare, en per språk, läste annonsernas text ur Meta, talet, bildtexten, sajtens köptexter, spårningssidan och fraktmejlen. Varje granskare översatte också alla annonser tillbaka till svenska. De står i bilagan `2026-09-30-vad-annonserna-sager.md`.
- **Andra prövning:** varje 🔴 prövades en gång till av en fristående agent med egna mätningar, 15:00–17:35 UTC.
- **Luckor:** en sista agent läste rapporten mot checklistan i prompten.
- **Förbehåll:** agenternas egna fynd står oförändrade i bilagorna nedan. Där den andra prövningen har sänkt eller strukit ett fynd gäller tabellen ovan, inte bilagan.

---

# Bilaga: luckkontrollen

# Luckkontroll — GRANSKNING-2026-09-30.md mot PROMPT (läs-bar, 17:35–17:40 UTC)

## Definition of done
| Punkt | Läge | Var / vad saknas |
|---|---|---|
| 15 kampanjer/adsets/annonser lästa | prövad | Bilaga A, Sammanfattning |
| Strays | prövad | A "Strays: inga" + G-A05/F07 |
| Sida/IG/länk/länder/pixel/DSA/granskning/förbättringar | prövad | A "Kontrollerat utan fynd", G-A02 |
| Varje video: teknik, röst replik för replik, kontaktark | delvis | Kontaktark bara delvis med ögat (NO/DK/US/FR… urval; JP/FI/PL/DE ark för ark), resten OCR. rostkoll.py inte körd — ersatt med ffmpeg; längddrift 004–007 STÄNGD nu (se nedan). 001–003 saknar svensk källa ⇒ längddrift där omätt |
| 008 tittad i varje språk | prövad | B "008", G-B09 |
| Katarina med bild | prövad | B "Katarina" (jmf.jpg) |
| 13 språkgranskare | prövad | Bilaga C ×13 |
| Sajten 21 länder | delvis | DE/AT/CH/FR/BE/LU mättes på engelska (lang en ❌ i D-tabellen); verifieringen tog bara DE (POST /localization) och FR med curl. AT, CH, BE, LU på eget språk + fraktruta på språket inte omprövade |
| Korgen i varje valuta | prövad (summa) / delvis (språk) | Efter temabytet 17:30:35 bara DK, NL, TW omprövade i webbläsare |
| Fraktzonerna | prövad | D "Prövat och INTE fel", F #33 |
| Byggarens påståenden | prövad | F, 42 rader |
| Varje 🔴 prövad igen | prövad | Verifieringen 1–7 (språkens kassa-🔴 = G-D01) |
| Luckorna | denna fil | |
| Rapporten på main | INTE gjort | `git status`: `?? matstrumpor/marknader/granskning/` otrackad, gren claude/youthful-euler-iy6kvm |
| Svaret till Axel | INTE gjort | |

## A1–14, B1–5, C, D1–5, E1–2, F, G
Alla prövade utom: A13 (TW utan adset — kan inte mätas, står), A14 (owned_domains #100 — står), B1 rostkoll (delvis, ovan), B3 (delvis, ovan), D1 "Trustpilot-raden på språket" (bara JP/TW i F #39; land-*.json har fältet `trustpilot`, t.ex. CH "Great · 4.2 … on Trustpilot" synlig:false — ingen kolumn i D-tabellen), D5 och E2 (kan inte mätas, står).

## Osäkerhetslistan 1–7
1 TW-röst: kan inte mätas (0 TW-annonser) — står. 2 JP 001–003: delvis (Whisper + OCR; läppsynk omätt, står). 3 004 långa ord/CJK: prövad (G-B04, ark för ark DE/FI/JP). 4 Jul i JP/TW: prövad (G-B10, fråga 4). 5 s001h1: prövad (G-C-en-01 → fråga 3). 6 Köp 2–få 2 alla valutor inkl. JPY/TWD: prövad (D-tabellen). 7 Lokala valutor +20 %: prövad (D-tabellen, alla ✅).

## Snabba kontroller gjorda nu (läs-bara)
- Temat live 17:38 UTC: /fi, /pl, /ja?country=JP laddar ms-paket.js?v=18028406791073695561790789435 (t/11); filen har `redirect="+encodeURIComponent(rutt+"cart")`, 0 träffar på `encodeURIComponent("/cart")` ⇒ G-D01-rättningen gäller alla språk (samma fil), inte bara DK/NL/TW. Kassans språk i webbläsare är ändå bara omprövat i DK.
- Längddrift 004–007 (rostkolls del): egna/kalla 012v2 14,26 s, haikuh3 52,21, haikuh2 48,01, s001h1 41,61 = B:s längder 14,3/52,2/48,0/41,6 ⇒ ingen drift.

## Topp mot bilagor — vilseledande glapp
1. CH: kassan visar raden "Taxes" (land-CH.json kassa.momsrader ["Taxes"]); D-tabellen säger "SE FIL", inget fynd, inget i toppen. Känt beslut 5 säger "rapportera kassans skatterader" ⇒ bör stå som 🔵 (utan förslag om skatteinställningar).
2. G-B05 säger "lyssna på DK 001 #4 (täckning 0,20) och NO 002 #3 (0,73) först"; G-B03 NO/NOB 002 "faktiskt sukker". Toppens lyssnarlista nämner bara FI 001–003, JP 002, NO 007, och DK/NO-raderna står "ja" utan lyssningsnot.
3. G-D08 (zh-TW levererad-mejl säger "din order har avbrutits", ja-ämnet säger "skickats") och G-D05/D06/D07 samt G-F01–F08 räknas inte i kampanjtabellens 🟡 (bara B04, B06, D04 som gemensamma) och nämns inte i toppen. D08 berör JP-kunder nu.
4. G-C-fi-01 nämner också "landlistan börjar med Sweden" i kassan — inte omprövad efter rättningen, och inte nämnd i toppens G-D01.
5. Bilagorna bär kvar 🔴 på G-B01, G-B02, G-D02, G-D03, G-C-JA-01, G-C-en-01, G-C-DA-01 och de åtta kassa-🔴 per språk; toppens förbehåll (rad 108) + sänkt-tabellen täcker dem, men språkens kassa-🔴 (nb-01, DA-02, fi-01, NL-01, es-01, it-01, PL-01, PT-01) står inte med id i toppen — en rad "= G-D01" räcker.
6. "Så granskade jag": del A säger 13:56–14:09, F säger 13:56:54 och 22 kampanjer/37 adsets — konsekvent, inget fel.

# Bilaga: andra prövningen (verifiering)

# Andragranskarens dom — 2026-09-30 (egna mätningar, läs-bart; inget skrivet i Meta/Shopify, pixeln blockerad)

1. KORGEN — BEKRÄFTAT 🔴 fram till 17:30:35 UTC, sedan RÄTTAT i temat av någon annan (ingen öppen 🔴 kvar).
   Mekanism (egen läsning av ms-paket.js ?v=91396…/7251279162753265211790763353, 15:02 UTC): laddaOm() = rutt+"discount/"+kod+"?redirect="+encodeURIComponent("/cart") — hårdkodat "/cart" utan routes.root. Alla fyra paket bär kod (SUSHI-K1F1 m.fl.). curl 15:02 UTC: GET /da/discount/SUSHI-K1F1?redirect=%2Fcart → 302 https://matstrumpor.com/cart → lang="en"; /da/cart direkt → lang="da". Språket beror INTE på USA-IP: omdirigeringen är bokstavlig.
   Slumpen: laddaOm körs bara när sidolådan inte renderas (eller koden saknas i korgen); annars öppnas lådan på rätt språk. Chromium (ren kontext, köpknappen klickad, kassan öppnad via korgens knapp): engelsk korg /cart + kassa en-XX i DK 15:04 + 17:29 (en-DK), ES (en-ES), NO .com/nb (en-NO), NL (en-NL), FI (en-US-webbläsare); rätt språk i DK×4, FI, NO, IT, PL, PT, NOB, JP×3, TW — alltså ca 6 av 18 körningar, oberoende av webbläsarspråk (da-DK gav både och). JP/NOB inte sedda engelska, men samma kod gällde /ja/ (curl 17:32: /ja/discount/…?redirect=/cart → /cart), så undantaget var tur, utom NOB (roten "/" är nb).
   Rättat: ms-paket.js ?v=18028406791073695561790789435 (tid i v = 17:30:35 UTC) skickar redirect=rutt+"cart". Efter bytet: TW 17:31 → /zh-tw/cart zh-TW, DK 17:33/17:34 → /da/cart da + kassa da-DK, NL 17:33 nl. Bevis: ut/, ut2/, dk-chrome.json, ms-paket.js (gammal) + paket-da.js (ny).

2. LANDNING DE/FR — SÄNKT till 🔵.
   curl utan cookie/AL 17:19 UTC: /de/… 200 lang="de" men Shopify.country="US"; /fr/… 200 lang="fr". Med Accept-Language de-DE från containern (USA-IP): 302 → https://matstrumpor.com/products/sushi-strumpor (engelska). Samma länk + ?country=DE med de-DE: 200. Efter POST /localization DE: /de/… 200 lang="de" country="DE" oavsett Accept-Language (sv/da/en/de). Chromium-engelskan kommer alltså från att containern geolokaliseras till USA (där de/fr saknas) + Cloudflare-utmaningar (lang="en"-sidan "Verifying your connection" fångades 17:19). En kund med tysk/fransk IP kan inte mätas härifrån; risken är att länkarna saknar ?country= (bara ett land per adset går) — fråga, inte stopp.

3. WW/AUSTRALIEN — BEKRÄFTAT 🔴 (för hela WW-adsetet, inte bara AU).
   GET 17:21 UTC adset 120251749614670023 (MATSTRUMP_WW_ugc, PAUSED, geo NZ/CA/GB/AU): issues_info level AD_SET, error_code 3858810, SOFT_ERROR, "…riktar sig till reglerade länder (Australien) utan verifierade identiteter … måste uppge verifierad annonsör och betalare för att leverera annonser". regional_regulated_categories / regional_regulation_identities: inte satta (fälten kom inte tillbaka). Samma issue ärvt på annonserna (120251773122350023, …875250023, …122350023). Felet sitter på adsetet, så det stoppar leveransen för adsetet — att bara AU faller bort kan inte mätas utan att aktivera. Övriga 13 MATSTRUMP_*-adsets: inga issues. Förslag: AU ut ur WW eller verifiera annonsör/betalare.

4. LJUDET — delvis STRUKET, delvis SÄNKT. (Maskinlyssning, inte ett öra.) Metod: repliken ±1 s ur $S/B/vid med $S/bin/ffmpeg, faster-whisper medium (large-v3 finns inte lokalt), språk låst, beam 5, med/utan initial_prompt med rätt ord. lyssna.json.
   - DK 007 "sokker"→"sukker": STRUKET som fynd. Referenserna hörs också som "sukker" utan ledtråd (DK 005 "det er sukker", DK 006 "sushi-sukker", "det er sukker"); med ledtråd hörs DK 007 "sokker" i alla fyra repliker. Whisper skiljer inte o/u här — mätningen skiljer inte 007 från 005/006. Lyssna själv om tvekan.
   - JP 007 靴下→くすした: SÄNKT till 🔵. 13,3–15,9 s utan ledtråd "屑下" (kuzu-shita), med ledtråd 靴下; 24,2–26,1 s hörs 靴下 redan utan ledtråd. Svagt stöd för en replik.
   - JP 002 五足→不足: 🟡 kvarstår. Utan ledtråd "不足入り…", med ledtråd tappas ordet helt; JP 005/006 "ただの五足" hörs rätt båda gångerna.
   - FI 001–003 "sushi"→"susi": 🟡 (stöds). Även MED ledtråden "sushi": FI 001 "susipalaa", FI 002 "oikea susia", FI 003 "surssi"; sammansättningen hörs dock "sushisukkia" med ledtråd. ElevenLabs-videorna FI 005/006/007 hörs "sushiksi/sushisukkia/sushilta" utan ledtråd. Susi = varg — en finsk infödd bör lyssna; inte kampanjstopp på maskinbelägg.

5. JP 008 "EUサイズ36–44" — SÄNKT till 🔵 (regelkrock i texten, inte i koden).
   Brödtexten (A/annonser.json, ad 120251797953480023): "フリーサイズ。EUサイズ36–44（約23–28cm）にフィットします。" Bilden (hämtad via adimages hash be7a935e…): ingen storlek, inget 4-tal (rubrik 寿司ソックス / 合計20足 / 2つ買うともう2つ無料). REGLER-ASIEN regel 7: "Storleken 36–44 är EU-skalan … ja 「EUサイズ36–44（約23–28cm）」"; regel 14: "Talet fyra … Annonser, videotal och bildtexter säger det aldrig". d3/annons.mjs rad 50 undantar med flit "storleken 36–44 räknas inte" (regex kräver ensam 4:a) — regel 14:s text saknar undantaget. Fråga till infödd/Axel om 44 (yonjūyon) i presentreklam. Sidofynd 🟡: bilden visar SEX lådor, erbjudandet ger fyra (2+2, "合計20足").

6. EN 007 "I started this brand out of pure frustration" — SÄNKT till 🔵.
   US/s001h1.json segment 4,84–7,08 s: sv "Jag startade Matstrumpor ur en ilska." → en "I started this brand out of pure frustration." Samma påstående i originalet (s001h1.manus.json). Talaren: egna/README.md rad 18 "AI-personer + produktklipp, hon berättar varför hon startade företaget", kallor.json "svensk AI-kvinnoröst"; bildruta 5,5 s i kalla/s001h1.mp4 visar bara produkt + ätpinnar. Svenska MATSTRUMP_sushi_gift_ugc_s001h1_v2 är ACTIVE i Sverige (1 994 kr, 9 köp, GET 17:2x UTC) — befintligt beslut. Fråga till Axel: en AI-röst som påstår sig vara grundaren är ett påhittat vittnesmål (FTC-risk i USA); inte ett nytt fel i utlandsbygget.

7. G-D03 TAIWANS FRAKTMEJL — BEKRÄFTAT fel, SÄNKT till 🟡.
   Egen query 17:19 UTC (translatableResources EMAIL_TEMPLATE, translations(locale:"zh-TW")): EmailTemplate/126064296275, /126064361811, /126064427347 body_html → "https://matstrumpor.se/zh-tw/pages/spara?nummer={{…". webPresences: matstrumpor.se zh-TW = https://matstrumpor.se/zh/, matstrumpor.com zh-TW = /zh-tw/. curl 17:19: .se/zh-tw/pages/spara?nummer=MS-TEST utan följ 429 (hastighet), följ → 404, html lang="sv"; .se/zh/pages/spara 200; .com/zh-tw/pages/spara 200. Orsak: registrets mejl_sprak {locale zh-TW, mapp "zh-tw"} stämmer för .com men inte för .se. 🟡 eftersom TW-kampanjen är tom och inga TW-annonser går; blir 🔴 den dag TW startar.

---

# Bilaga: Del A — kontot i Meta


Mätt ur Meta Graph API v23.0 med `META_ACCESS_TOKEN`, bara GET. Klockslag (UTC): kampanjer 13:56:39, adsets 13:56:43, annonser+creatives 14:05:43, advideos 14:07:00, bilder 14:09:28, sida/pixel/konto 14:03, länkar 14:06:23–14:06:33. Rådata i `A/rå/`. Per annons: `A/annonser.json`. Maskinella kontroller: `A/analys.py` → `A/sammanstallning.json`.

## Överst: ACTIVE?

Inget i de 15 utlandskampanjerna är ACTIVE: 15 kampanjer, 14 adsets och 112 annonser har `status` PAUSED och `effective_status` PAUSED (kampanjer.json, adsets.json, ads.json 13:56–14:05 UTC).
Det enda ACTIVE i kontot är svenskt: kampanjen `MATSTRUMP_SALES_20260826` 120251217860260023 (10 000 kr/dag, SE, sidan 820358954504320). Rapporteras bara, rörs inte.

## Fynd

```
G-A01 🔴  WW, adsetet MATSTRUMP_WW_ugc 120251749614670023 + alla 8 WW-annonser
Vad:     Meta flaggar adsetet: Australien kräver verifierad annonsör och betalare. Utan dem levererar Meta inte till AU (samma sorts krav som stoppat Taiwan).
Bevis:   adsets.json 13:56:43 UTC, issues_info[0]: error_code 3858810, error_type SOFT_ERROR,
         error_summary "Annonser som omfattas av allmän reglering och riktar sig till reglerade länder (Australien) utan verifierade identiteter",
         error_message "… Information om verifierad annonsör och betalare krävs: annonsuppsättningar som riktas till ett land med FinServ-reglering måste uppge verifierad annonsör och betalare för att leverera annonser. Verifiera annonsören och betalaren eller kontrollera verifieringsstatusen."
         Samma issues_info (level AD_SET) på annonserna 120251773120110023 (001), 120251773122350023 (002), 120251773126030023 (003), 120251773875250023 (004), 120251778544770023 (005), 120251778581710023 (006), 120251778587120023 (007), 120251779480740023 (008).
         Inget annat utlandsadset har issues_info. marknader.json → WW nämner inte kravet.
Förslag: Välj STONEBITE ECOM AB som verifierad annonsör + betalare för Australien i kontot (samma väg som Taiwan, Cowork-prompten 3-taiwan-verifiering.txt), eller ta AU ur WW tills det är klart. Om SOFT_ERROR bara stoppar AU eller hela adsetet går inte att läsa ur API:t — pröva inte genom att slå på.
Vem:     Axel (verifieringen) + byggarsessionen (adsetet, marknader.json)
```

Inga fler röda i del A. Kontrollerat utan fynd, på alla 112 utlandsannonser:

- **Sida och Instagram:** `object_story_spec.page_id` = 1285064981363590 och `instagram_user_id` = 17841423405715219 på alla 112. Ingen utlandsannons bär 820358954504320. Alla 134 annonser i de tre svenska SALES-/katalogkampanjerna bär 820358954504320 + IG 17841479011543544. Ingen svensk annons bär 1285064981363590.
- **Länken:** länk och CTA-länk (SHOP_NOW) = `marknader.json → lank` på alla 112 (videoannonser har bara CTA-länk, 008 har `link_data.link` + CTA, båda lika). Alla 14 unika länkar svarade 200 utan omdirigering (curl -L från USA, 14:06 UTC, `rå/lankar.tsv`).
- **Länderna:** `geo_locations.countries` = facit i alla 14 adsets. Sverige finns inte i något. Inget land ligger i två utlandskampanjer utom NO (NO + NOB, A/B med flit). `location_types` frequently_in/home/recent i alla, som SE-mallen.
- **Ålder / Advantage+:** 18–65 och `advantage_audience: 1` i alla 14. Inga `publisher_platforms` ⇒ automatiska placeringar, som SE-mallen.
- **Pixel och optimering:** `promoted_object` {pixel_id 1785935302094082, PURCHASE}, OFFSITE_CONVERSIONS, IMPRESSIONS, 7 dagars klick, WEBSITE i alla 14. `tracking_specs.fb_pixel` = 1785935302094082 på alla 112. Bäverbutikens 1554276343018184 finns inte någonstans i kontots 402 annonser.
- **Kampanjerna:** OUTCOME_SALES, `special_ad_categories` [], LOWEST_COST_WITHOUT_CAP, CBO-budget = `budget_sek_dag` i alla 15.
- **Metas granskning:** `ad_review_feedback` saknas på alla 112. `issues_info` bara på WW (G-A01).
- **Förbättringar:** alla 112 creatives har 83 funktioner i `degrees_of_freedom_spec.creative_features_spec`, alla OPT_OUT (även text_translation, translate_voiceover, audio, music_generation, image_auto_crop, inline_comment). Alla 54 namn i repots `ENHANCEMENT_FEATURES` finns med. Ingen `asset_feed_spec`.
- **Copy:** rubrik, brödtext och länkbeskrivning ur Meta (video_data.title/message/link_description; link_data.name/message/description för 008) är tecken för tecken lika med `annonser/<KOD>.json` på alla 112 (0 diffar). Ingen träff på butiksnamn, domän, momsord, 四, スウェーデン製 eller sushisock i någon annonstext.
- **Namn och antal:** 8 annonser per kampanj, 001–008, TW 0. Videotiteln i `advideos` är filnamnet och följer numret i alla 13 marknader (001 nathalie, 002 sofie_h1, 003 sofie_h2, 004 012v2, 005 haikuh3, 006 haikuh2, 007 s001h1). Ingen titel innehåller katarina/sushigalen/sushiälskaren. video_id, image_hash och annons-id = `videor.json` på alla 112, och de 112 annons-id:na = `lage.json`.
- **NOB:** samma video_id och image_hash som NO i alla åtta nummer.
- **Taiwan:** kampanjen 120251796778420023 PAUSED, OUTCOME_SALES, 1 000 kr/dag, inget adset, inga annonser (känt beslut). Punkt 13 går därför inte att pröva.

## 🔵 Information och frågor (inga fel)

```
G-A02 🔵  DK, FI, DE, FR, NL, ES, IT, PL, PT — adseten (EU)
Vad:     DSA: dsa_beneficiary "STonebite" finns, dsa_payer returneras inte (null). Samma sak på SE-adsetet 09-17 UGC 120251591832340023, som levererar. Inget EU-adset har issues_info, så Meta har inte klagat. Namnet som visas för EU-användare i annonstransparensen är "STonebite", inte "STONEBITE ECOM AB".
Bevis:   adsets.json 13:56:43 UTC, fälten dsa_beneficiary/dsa_payer efterfrågade uttryckligen.
Förslag: Fråga till Axel om det juridiska namnet ska stå där; ingen ändring krävs för leverans enligt mätningen.
Vem:     Axel
```
```
G-A03 🔵  WW 001–008
Vad:     WW använder USA:s filer (titlarna US_*.mp4, sha256 lika med US i videor.json) men uppladdade separat med egna video_id. 008 bär samma image_hash som US (4d2b57e3…). Bildens text enligt egna/d3/texter/US.json nämner inte USA, så den passar GB/AU/CA/NZ. Medie-granskaren behöver ändå mäta WW:s egna video_id (de är andra objekt än US:s).
Bevis:   advideos 14:07 UTC; videor.json.
Vem:     mediagranskaren (del B)
```
```
G-A04 🔵  WW adset 120251749614670023
Vad:     targeting_optimization_types har lookalike = 0; alla andra utlandsadset och SE-mallen har 1. Påverkar Advantage+-utvidgningen marginellt.
Bevis:   adsets.json 13:56:43 UTC.
Vem:     byggarsessionen
```
```
G-A05 🔵  Gamla utlandskampanjer (augusti, sushisock.com)
Vad:     MATSTRUMP_SALES AU 120251251965440023, MATSTRUMP_SALES UK 120251251897940023 och MATSTRUMP_SALES_US_20260828 120251241772530023 är PAUSED på kampanjnivå men har 7 adsets och 155 annonser ACTIVE (effective CAMPAIGN_PAUSED), riktade till AU / GB / US med länk till sushisock. Slås någon av dem på igen konkurrerar de med WW och US. Inga av dem bär sidan 1285064981363590 eller .com/.no — inga strays från utlandsbygget.
Bevis:   ads.json 14:05 UTC (155 träffar på "sushisock"), adsets.json.
Förslag: Ingen åtgärd (PAUSED med spend är ett beslut). Bara information.
Vem:     Axel
```
```
G-A06 🔵  Pixeln 1785935302094082
Vad:     Pixelns namn är "MATSTRUMPIRUMPIDUMPI" och ägaren är Business Manager SnarkLös 2368966296803728, inte Matstrumpor.se 3354502211392342. Samma pixel används av den svenska kampanjen, så utland och Sverige mäts i samma pixel. Senast avfyrad 2026-09-29 23:28 UTC.
Bevis:   GET /1785935302094082?fields=name,owner_business,last_fired_time 14:03:14 UTC.
Vem:     Axel (bara information)
```
```
G-A07 🔵  008 i alla 13 marknader
Vad:     Bilden är 1080×1080 (kvadrat), placeringarna är automatiska och image_auto_crop/adapt_to_placement är avslagna. I Stories/Reels visas den som kvadrat med kant.
Bevis:   adimages 14:09:28 UTC (width/height 1080/1080 för alla 12 hashar).
Vem:     Axel / byggarsessionen
```
```
G-A08 🔵  JP 008 120251797953480023
Vad:     Brödtexten har "EUサイズ36–44" — siffran 4 som arabisk siffra i en storlek, inte 四. Språkgranskaren (del C) avgör om det är ok.
Bevis:   link_data.message ur Meta 14:05 UTC.
Vem:     språkgranskaren JP
```
```
G-A09 🔵  Erbjudandet i länkbeskrivningen
Vad:     001–007 säger "Köp 1, få 1" på språket (t.ex. WW/US "4 kinds. Buy 1, get 1. Free shipping."), 008 säger "Köp 2, få 2 gratis". Båda måste stämma med korgen i del D.
Bevis:   video_data.link_description / link_data.description ur Meta 14:05 UTC.
Vem:     del D
```
```
G-A10 🔵  Kampanjen "Ny Interaktion Kampanj med rekommenderade inställningar" 120250623088790023 (PAUSED, OUTCOME_ENGAGEMENT)
Vad:     Dess enda annons bär en tredje sida, 1181575305036323, med IG 17841437610737330 — varken Matstrumpor eller Matstrumpor.se. Inget med utlandsbygget att göra.
Bevis:   ads.json 14:05 UTC.
Vem:     Axel (bara information)
```

## Kan inte mätas härifrån

- **Domänverifieringen (punkt 14):** `GET 3354502211392342/owned_domains` svarar `(#100) Tried accessing nonexisting field (owned_domains)` (14:03:24 UTC). Business Manager Matstrumpor.se syns (id + namn), men domänlistan inte med denna token.
- **Om G-A01 stoppar bara Australien eller hela WW-adsetet:** Meta anger SOFT_ERROR utan räckvidd. Går bara att se genom att slå på, vilket granskningen inte gör.
- **Vad `dsa_payer` blir i praktiken** när fältet är null (G-A02).
- **Instagram-identiteten 17841423405715219:** API:t ger bara id (sidburen identitet, inget användarnamn).
- **Sidans namn i annonsen:** sidan 1285064981363590 heter "Matstrumpor", `verification_status` not_verified (information).
- **Hur länkarna landar som kund i respektive land** (språk, valuta): del D. HTTP-kontrollen gick från USA.
- **Innehållet i video och bild:** del B.

## Sammanfattning

**Kampanjer, adsets och annonser per kod** (budget i kr/dag, Meta mot facit):

| Kod | Kampanj | Status | Adset | Annonser (effective) | Budget |
|---|---|---|---|---|---|
| NO | 120251749551520023 | PAUSED/PAUSED | 120251749551860023 PAUSED | 8 ({'PAUSED': 8}) | 500 / facit 500 |
| NOB | 120251777339520023 | PAUSED/PAUSED | 120251777678860023 PAUSED | 8 ({'PAUSED': 8}) | 500 / facit 500 |
| DK | 120251749599180023 | PAUSED/PAUSED | 120251749600560023 PAUSED | 8 ({'PAUSED': 8}) | 1000 / facit 1000 |
| FI | 120251749604200023 | PAUSED/PAUSED | 120251749605630023 PAUSED | 8 ({'PAUSED': 8}) | 1000 / facit 1000 |
| US | 120251749609010023 | PAUSED/PAUSED | 120251749610210023 PAUSED | 8 ({'PAUSED': 8}) | 1000 / facit 1000 |
| WW | 120251749612350023 | PAUSED/PAUSED | 120251749614670023 PAUSED | 8 ({'PAUSED': 8}) | 1000 / facit 1000 |
| DE | 120251750242530023 | PAUSED/PAUSED | 120251750243010023 PAUSED | 8 ({'PAUSED': 8}) | 1000 / facit 1000 |
| FR | 120251750244370023 | PAUSED/PAUSED | 120251750244800023 PAUSED | 8 ({'PAUSED': 8}) | 1000 / facit 1000 |
| NL | 120251750246440023 | PAUSED/PAUSED | 120251750247190023 PAUSED | 8 ({'PAUSED': 8}) | 1000 / facit 1000 |
| ES | 120251750248310023 | PAUSED/PAUSED | 120251750249260023 PAUSED | 8 ({'PAUSED': 8}) | 1000 / facit 1000 |
| IT | 120251750250830023 | PAUSED/PAUSED | 120251750251380023 PAUSED | 8 ({'PAUSED': 8}) | 1000 / facit 1000 |
| PL | 120251750321130023 | PAUSED/PAUSED | 120251750322480023 PAUSED | 8 ({'PAUSED': 8}) | 1000 / facit 1000 |
| PT | 120251750324340023 | PAUSED/PAUSED | 120251750325430023 PAUSED | 8 ({'PAUSED': 8}) | 1000 / facit 1000 |
| JP | 120251797899280023 | PAUSED/PAUSED | 120251797901800023 PAUSED | 8 ({'PAUSED': 8}) | 1000 / facit 1000 |
| TW | 120251796778420023 | PAUSED/PAUSED | — (inget adset) | 0 ({}) | 1000 / facit 1000 |

**Budget om allt slås på:** 14 000 kr/dag enligt kampanjernas CBO-budget (NO 500 + NOB 500 + 12 × 1 000 + TW 1 000). TW har inget adset och kan inte spendera, så det som faktiskt kan gå är **13 000 kr/dag**. JP och TW är platshållare ("EJ GIVEN"). Utöver det kör den svenska `MATSTRUMP_SALES_20260826` redan 10 000 kr/dag.

**Strays:** inga. Utanför de 15 kampanjerna bär ingen annons sidan 1285064981363590, IG 17841423405715219 eller en .com/.no-länk. De enda adseten utanför med andra länder än SE är de tre gamla sushisock-kampanjerna (G-A05).

**Unika media för mediagranskaren:** 103 objekt = 91 video_id (13 uppladdningar × 7; NOB delar NO:s, WW har egna uppladdningar av US-filerna) + 12 bild-hashar (NOB = NO, WW = US). Full lista med titel, längd, URL och vilka annonser som bär dem: `A/media.json`. Per annons:

| Kod | Nr | Annons-id | video_id | Videotitel | image_hash |
|---|---|---|---|---|---|
| DE | 001 | 120251767700350023 | 4616870098459193 | DE_nathalie.mp4 | d962c358da75bc63129ba6dee72b4f8d (miniatyr) |
| DE | 002 | 120251767709150023 | 1859040478795202 | DE_sofie_h1.mp4 | 89e6515cfb7d15d9fc49f362403586b6 (miniatyr) |
| DE | 003 | 120251767714620023 | 1142180378156014 | DE_sofie_h2.mp4 | c9c80ac905bc9da441a59800abd1cbd5 (miniatyr) |
| DE | 004 | 120251773827160023 | 1446161554068201 | DE_012v2.mp4 | fbbc5967b17417d859748a97aeb5e2ea (miniatyr) |
| DE | 005 | 120251777200300023 | 4494047997485704 | DE_haikuh3.mp4 | b49c3d397421d0b2ec2b242cfd1cb8e0 (miniatyr) |
| DE | 006 | 120251777203700023 | 1791667862121363 | DE_haikuh2.mp4 | 79541031eb402dae182dd32aef84d99a (miniatyr) |
| DE | 007 | 120251777208060023 | 1409508078047871 | DE_s001h1.mp4 | 151985650e5bcf5650614d5c9d542bd6 (miniatyr) |
| DE | 008 | 120251779483200023 | — | — | d55de5c27b82307d7c077cf5b6df9a8b (bilden) |
| DK | 001 | 120251767917830023 | 3047374855620400 | DK_nathalie.mp4 | 2c0dae08dd13fec780b2d190451d4c91 (miniatyr) |
| DK | 002 | 120251767922010023 | 1113342661205107 | DK_sofie_h1.mp4 | 00479549950501792a10e9ecc8d03b1e (miniatyr) |
| DK | 003 | 120251767925650023 | 2864317810627841 | DK_sofie_h2.mp4 | 41a450856b544ee1d0470e59add3b645 (miniatyr) |
| DK | 004 | 120251773838480023 | 1643875113914807 | DK_012v2.mp4 | 4cb6250b8d6e80061ea34c026b574e27 (miniatyr) |
| DK | 005 | 120251777259940023 | 1108128695091925 | DK_haikuh3.mp4 | a064f88c9107cb28b36b7c6e0420d30a (miniatyr) |
| DK | 006 | 120251777272370023 | 2695569980896647 | DK_haikuh2.mp4 | 8baf70f7166d88be84f5a7bd68dbdbf7 (miniatyr) |
| DK | 007 | 120251777282560023 | 1841234493547593 | DK_s001h1.mp4 | 78ae528dde2dd0c5b29b045094487c47 (miniatyr) |
| DK | 008 | 120251779442210023 | — | — | c3d7adfb171830cb2add2c77466be94c (bilden) |
| ES | 001 | 120251773393680023 | 4583822338572537 | ES_nathalie.mp4 | 93b35d5763566c948ddf671c6e97a068 (miniatyr) |
| ES | 002 | 120251773395390023 | 1693542998403723 | ES_sofie_h1.mp4 | 0c33b3a952f0237ca03f583adc6c616b (miniatyr) |
| ES | 003 | 120251773397880023 | 1630443625408113 | ES_sofie_h2.mp4 | db4a82925562d7c0f81aa741fdc51b78 (miniatyr) |
| ES | 004 | 120251773848300023 | 1090120547057482 | ES_012v2.mp4 | a690dca4352f6f746639a464136c023f (miniatyr) |
| ES | 005 | 120251777864820023 | 3229667850554610 | ES_haikuh3.mp4 | f693a68dff8e57b183043c8a0fbd7266 (miniatyr) |
| ES | 006 | 120251777873750023 | 1405009348503600 | ES_haikuh2.mp4 | 8d17d24bb2c21b4720cfb3bcd1321d82 (miniatyr) |
| ES | 007 | 120251777883330023 | 4379842618934887 | ES_s001h1.mp4 | 197c6c734a2fb059b2cfaab43b2f89b4 (miniatyr) |
| ES | 008 | 120251779581450023 | — | — | 619ed66af6c932990675ad71984fe963 (bilden) |
| FI | 001 | 120251767830080023 | 2098868860723565 | FI_nathalie.mp4 | 7c131bce22ed5d62ebb849d2ab1717d2 (miniatyr) |
| FI | 002 | 120251767833370023 | 2233446220558765 | FI_sofie_h1.mp4 | bbfc733dae4c7748d4ec5303384a7458 (miniatyr) |
| FI | 003 | 120251767836390023 | 1643988183952386 | FI_sofie_h2.mp4 | 21dff93b6ffd05156083acf8d5173ed5 (miniatyr) |
| FI | 004 | 120251774095290023 | 959441999924625 | FI_012v2.mp4 | c06b3730ab16f06b458773214031cb13 (miniatyr) |
| FI | 005 | 120251777296300023 | 914584831510265 | FI_haikuh3.mp4 | f4fc47fc43069547e8eecc3821dff4e1 (miniatyr) |
| FI | 006 | 120251777309080023 | 1395323816146892 | FI_haikuh2.mp4 | 1909dd985af4460f1f558fe0245b85f5 (miniatyr) |
| FI | 007 | 120251777313530023 | 1803616670681419 | FI_s001h1.mp4 | 4531f2e32127170652c36b5e17e805c1 (miniatyr) |
| FI | 008 | 120251779447420023 | — | — | ff536930d55f270832e66a9b21e53ee6 (bilden) |
| FR | 001 | 120251767746410023 | 2184159435834440 | FR_nathalie.mp4 | 8786c96d7a8d7c1f10541523c0b5af05 (miniatyr) |
| FR | 002 | 120251767749360023 | 1402819248498785 | FR_sofie_h1.mp4 | b99a8b14858d1c0fac9b5e1ddce80a3f (miniatyr) |
| FR | 003 | 120251767752770023 | 2205476863733774 | FR_sofie_h2.mp4 | 7ed30a27fb6390fe2f6d3437fd321892 (miniatyr) |
| FR | 004 | 120251774200960023 | 1076914075152725 | FR_012v2.mp4 | bc62b5980c49b9f2a7d38f3dbb210731 (miniatyr) |
| FR | 005 | 120251777657810023 | 1113910017721208 | FR_haikuh3.mp4 | 9215ce5755b760b123fb2e676a1d2821 (miniatyr) |
| FR | 006 | 120251777662970023 | 1606392184269450 | FR_haikuh2.mp4 | c771d79b696d936d1114d771a0899553 (miniatyr) |
| FR | 007 | 120251777670680023 | 1777131473615759 | FR_s001h1.mp4 | 53fecfb62e78cf9e7089b31834d66acc (miniatyr) |
| FR | 008 | 120251779487060023 | — | — | 974cb1f9d14afb29a1e12a7cc4c4fecd (bilden) |
| IT | 001 | 120251773106790023 | 2166836350931069 | IT_nathalie.mp4 | b29ad0b202fc489ee81c9b5a0e5950f6 (miniatyr) |
| IT | 002 | 120251773110070023 | 1335378191823092 | IT_sofie_h1.mp4 | b2d8deadf3e7c72580b77fbd6b2315ad (miniatyr) |
| IT | 003 | 120251773115760023 | 1236060322051544 | IT_sofie_h2.mp4 | 977de1ddc89f9f8f78b5d839e21c4e77 (miniatyr) |
| IT | 004 | 120251774066780023 | 1107473718670489 | IT_012v2.mp4 | 53570a3de0247bd9b0e01c2a7fa951b4 (miniatyr) |
| IT | 005 | 120251777896720023 | 30093881330248366 | IT_haikuh3.mp4 | 7f99a7e36de813b3bce61fc7372a58c3 (miniatyr) |
| IT | 006 | 120251779095260023 | 2305243423595566 | IT_haikuh2.mp4 | bad3822bd6215a0b4ac7eb85553eeade (miniatyr) |
| IT | 007 | 120251779099030023 | 1650580750104954 | IT_s001h1.mp4 | 14b5949eb60d14ee84e3fb3a553b2a72 (miniatyr) |
| IT | 008 | 120251779586620023 | — | — | 0621da8a7146211b184d48b5ec21d708 (bilden) |
| JP | 001 | 120251797915760023 | 1074617822006935 | JP_nathalie.mp4 | a19942edbba48a9ab8cc5a8b189766cd (miniatyr) |
| JP | 002 | 120251797919120023 | 1385054607173201 | JP_sofie_h1.mp4 | d7f3e6bb0547e3e8b5ed7a42d8c68499 (miniatyr) |
| JP | 003 | 120251797926190023 | 28666843716281010 | JP_sofie_h2.mp4 | 841fe64fda3c8aa29bceab31f044cd87 (miniatyr) |
| JP | 004 | 120251797933610023 | 1431143075783398 | JP_012v2.mp4 | 5ef3286d63594e513ba55fcbc7e6cf0d (miniatyr) |
| JP | 005 | 120251797940940023 | 1646473633732218 | JP_haikuh3.mp4 | ee608669d8dd2bc6f1eb9486801e68aa (miniatyr) |
| JP | 006 | 120251797945730023 | 1972128384192079 | JP_haikuh2.mp4 | 5d74826781eb5d1f23d296b876c062e3 (miniatyr) |
| JP | 007 | 120251797952860023 | 1717510592667775 | JP_s001h1.mp4 | a91753b025e5772cddd8e54520037434 (miniatyr) |
| JP | 008 | 120251797953480023 | — | — | be7a935e5b3fdab4418ddd647d7ffe5e (bilden) |
| NL | 001 | 120251767086320023 | 1101777322405720 | NL_nathalie.mp4 | acb2adde470f700bf574d9a4970cc847 (miniatyr) |
| NL | 002 | 120251767088900023 | 1445609320827008 | NL_sofie_h1.mp4 | 9e0c33026123c16003c0ba50caf48167 (miniatyr) |
| NL | 003 | 120251767094320023 | 1464839162159763 | NL_sofie_h2.mp4 | 019ec97452eb2a3270edb54470ef97c2 (miniatyr) |
| NL | 004 | 120251773854830023 | 3195691380791247 | NL_012v2.mp4 | 66e80a994e31e01c919cf362309065e8 (miniatyr) |
| NL | 005 | 120251777685840023 | 1483363716959577 | NL_haikuh3.mp4 | 44c74ada425b162469233a0094c34b07 (miniatyr) |
| NL | 006 | 120251777695320023 | 2757888611279521 | NL_haikuh2.mp4 | 83a9364b4eb3d4d44aa68c78b71e7629 (miniatyr) |
| NL | 007 | 120251777702060023 | 950379650925502 | NL_s001h1.mp4 | 170f93a23f638097eecdf91d759cc258 (miniatyr) |
| NL | 008 | 120251779489330023 | — | — | 21df590430b73c3e556c0f8885e4942e (bilden) |
| NO | 001 | 120251766960870023 | 1846117009734048 | NO_nathalie.mp4 | 5db55541c7eed43b83205b1716331b79 (miniatyr) |
| NO | 002 | 120251766972450023 | 2981844472169745 | NO_sofie_h1.mp4 | 2527e514e958142b090a8cee9c1b9140 (miniatyr) |
| NO | 003 | 120251766982410023 | 1592573692351221 | NO_sofie_h2.mp4 | 8924fc2121777b385e71a723198565f3 (miniatyr) |
| NO | 004 | 120251774085920023 | 1087344797556773 | NO_012v2.mp4 | 5b551e314c23a221d47fe26e671089d4 (miniatyr) |
| NO | 005 | 120251777219140023 | 28501110382882892 | NO_haikuh3.mp4 | f4be227723ad42d9d4c2189da25bc5a4 (miniatyr) |
| NO | 006 | 120251777227030023 | 1802170984430652 | NO_haikuh2.mp4 | af1efa3cab3026515ce71d028e7ece74 (miniatyr) |
| NO | 007 | 120251777235560023 | 954775957670370 | NO_s001h1.mp4 | a1f0ed87eaebe2a1fe9e389365059192 (miniatyr) |
| NO | 008 | 120251779347340023 | — | — | 3798c20f0a7e4bab79cbab06afd6652f (bilden) |
| NOB | 001 | 120251777683080023 | 1846117009734048 | NO_nathalie.mp4 | 5db55541c7eed43b83205b1716331b79 (miniatyr) |
| NOB | 002 | 120251777685410023 | 2981844472169745 | NO_sofie_h1.mp4 | 2527e514e958142b090a8cee9c1b9140 (miniatyr) |
| NOB | 003 | 120251777687670023 | 1592573692351221 | NO_sofie_h2.mp4 | 8924fc2121777b385e71a723198565f3 (miniatyr) |
| NOB | 004 | 120251777690260023 | 1087344797556773 | NO_012v2.mp4 | 5b551e314c23a221d47fe26e671089d4 (miniatyr) |
| NOB | 005 | 120251779224640023 | 28501110382882892 | NO_haikuh3.mp4 | f4be227723ad42d9d4c2189da25bc5a4 (miniatyr) |
| NOB | 006 | 120251779226360023 | 1802170984430652 | NO_haikuh2.mp4 | af1efa3cab3026515ce71d028e7ece74 (miniatyr) |
| NOB | 007 | 120251779228250023 | 954775957670370 | NO_s001h1.mp4 | a1f0ed87eaebe2a1fe9e389365059192 (miniatyr) |
| NOB | 008 | 120251779354260023 | — | — | 3798c20f0a7e4bab79cbab06afd6652f (bilden) |
| PL | 001 | 120251767862200023 | 1097861192600013 | PL_nathalie.mp4 | d1b9e5a2970f7858298e2fc20e5b55f5 (miniatyr) |
| PL | 002 | 120251767864530023 | 1805604530786866 | PL_sofie_h1.mp4 | bdd30b0e5f68cc0ef9ffa8df031e6f48 (miniatyr) |
| PL | 003 | 120251767868150023 | 2129043137722042 | PL_sofie_h2.mp4 | cad3bf4e042eaf71fc5522ed854d8761 (miniatyr) |
| PL | 004 | 120251773863230023 | 2249324349193853 | PL_012v2.mp4 | e0126815198d4ad743a8a465ae3d7869 (miniatyr) |
| PL | 005 | 120251778322760023 | 1402489235400847 | PL_haikuh3.mp4 | 566d6e4346ca2b6e0ad86273ad5bc5d9 (miniatyr) |
| PL | 006 | 120251778334920023 | 1443625224319553 | PL_haikuh2.mp4 | e8f6c8c80b3711f05491f6e9bea2070c (miniatyr) |
| PL | 007 | 120251778343860023 | 1455277439792219 | PL_s001h1.mp4 | ef5799aebe4766a8c742797a54d6d37b (miniatyr) |
| PL | 008 | 120251779590650023 | — | — | fd5606eed8d4676d944dd1973c136e43 (bilden) |
| PT | 001 | 120251767996050023 | 3687580501398787 | PT_nathalie.mp4 | c00053b8def7bffcbb46312fd09c5d96 (miniatyr) |
| PT | 002 | 120251768003540023 | 1413448447613083 | PT_sofie_h1.mp4 | 46514f912b59aca6fdda880d723aceda (miniatyr) |
| PT | 003 | 120251768008570023 | 1791740828536628 | PT_sofie_h2.mp4 | 30c9609dbd00dac0a881e5d648c5234b (miniatyr) |
| PT | 004 | 120251774073780023 | 1490506119550725 | PT_012v2.mp4 | e56719efd9d7cc544049fe8ee12688ba (miniatyr) |
| PT | 005 | 120251778419300023 | 1645234010602531 | PT_haikuh3.mp4 | d5be806ae99f7297a8d9f02336ec86c4 (miniatyr) |
| PT | 006 | 120251778534510023 | 1080930361389218 | PT_haikuh2.mp4 | 1040f3df94219005c20fb11c8a3a605b (miniatyr) |
| PT | 007 | 120251778538670023 | 2171878693742136 | PT_s001h1.mp4 | 30524791da07febb5e64cad11d4ae484 (miniatyr) |
| PT | 008 | 120251779706040023 | — | — | bb037565204057010a3a024d655a776e (bilden) |
| US | 001 | 120251773130030023 | 1088021750440606 | US_nathalie.mp4 | 42add96997c597568767d99d09dd5a76 (miniatyr) |
| US | 002 | 120251773135140023 | 1045871505119274 | US_sofie_h1.mp4 | efbc5732ef29d6af37b1525bdcf8e792 (miniatyr) |
| US | 003 | 120251773138150023 | 1784676972789795 | US_sofie_h2.mp4 | c5162fa04f71876cfd8a0e878a38f96b (miniatyr) |
| US | 004 | 120251773869430023 | 3470043776506084 | US_012v2.mp4 | f6913f63255267ddfb2f721e770eef1e (miniatyr) |
| US | 005 | 120251777320540023 | 4362276057416436 | US_haikuh3.mp4 | 9d9d2bc5c9bde0f0cde65076a9c22902 (miniatyr) |
| US | 006 | 120251777326060023 | 1113657111619563 | US_haikuh2.mp4 | 1a6f4f9c28122c005b234e826e820365 (miniatyr) |
| US | 007 | 120251777332640023 | 1624610342629697 | US_s001h1.mp4 | 057d9e514ef892d05784a95fe8431a96 (miniatyr) |
| US | 008 | 120251779478380023 | — | — | 4d2b57e337383499f82613b8e571860f (bilden) |
| WW | 001 | 120251773120110023 | 1049189648102641 | US_nathalie.mp4 | 42add96997c597568767d99d09dd5a76 (miniatyr) |
| WW | 002 | 120251773122350023 | 1714947412938040 | US_sofie_h1.mp4 | efbc5732ef29d6af37b1525bdcf8e792 (miniatyr) |
| WW | 003 | 120251773126030023 | 1781494266227261 | US_sofie_h2.mp4 | c5162fa04f71876cfd8a0e878a38f96b (miniatyr) |
| WW | 004 | 120251773875250023 | 3218729808321324 | US_012v2.mp4 | f6913f63255267ddfb2f721e770eef1e (miniatyr) |
| WW | 005 | 120251778544770023 | 1571331110862692 | US_haikuh3.mp4 | 086ac74f30df257b1294abee26d04679 (miniatyr) |
| WW | 006 | 120251778581710023 | 1785398369328714 | US_haikuh2.mp4 | 4d1970ce1cd1fc197b47b42fdf5bb3e0 (miniatyr) |
| WW | 007 | 120251778587120023 | 1719852532424194 | US_s001h1.mp4 | 319c44efcb80e1c7a725d4e0a36d2e74 (miniatyr) |
| WW | 008 | 120251779480740023 | — | — | 4d2b57e337383499f82613b8e571860f (bilden) |

---

# Bilaga: Del B — videor och bilder


Mätt 2026-09-30. Annonserna lästa ur Meta 13:5x UTC (`B/meta/ads.json`, GET act_730973156224390/ads, 402 annonser, 112 utland: 14 koder × 8, TW 0). Videor och bilder hämtade 14:08 UTC ur Meta (`GET /{video_id}?fields=source,length,title` ×91, `adimages?hashes=[…]` ×12). Whisper medium 14:00–14:40 UTC, OCR (RapidOCR, 1 ruta/s) 14:40–14:50 UTC.

Allt nedan är PAUSED (alla 112 utlandsannonser `status` och `effective_status` PAUSED vid läsningen).

Viktigt om rösten: Whisper är en maskin. Ett ord som Whisper hör fel kan vara Whispers fel. De två röda fynden är därför röda bara om en människa hör samma sak. De ska prövas med örat (steg 3 i PROMPT: en andra agent eller Axel lyssnar på tidpunkterna).

## 🔴 Stoppar kampanjen (om örat bekräftar)

```
G-B01 🔴  JP 007 (MATSTRUMP_JP_sushi_gift_ugc_007_v1, 120251797952860023, video 1717510592667775)
Vad:     Produktordet 靴下 (kutsushita) hörs som "kusushita" alla tre gångerna. Slutetiketten hörs som "寿司ソツクス".
Bevis:   Whisper medium (språket låst till ja), körd 2026-09-30 ~14:10 UTC på filen ur Meta:
         13,3 s "でもくすしたはみんな足りなくなる"; 24,2 s "実はくすしただった"; 38,3 s "実はクスした寿司ソツクス".
         Manuset egna/JP/s001h1.json har uttalet くつした i fältet las på alla tre raderna.
         Kontroll: samma verktyg hör 靴下 rätt i JP 005 och JP 006 (samma ElevenLabs-väg, "でも待って、これ靴下！"), och i JP 002/003.
         Det talar för att felet ligger i ljudet och inte hos Whisper.
         Täckning segment för segment 0,83 (lägst 0,56 på #10 "実は靴下だった！"). Se B/transkript/JP-007.txt.
Förslag: Lyssna på 13,3 s, 24,2 s och 38,3 s. Hörs "kusushita": gör om de tre klippen med ett uttal som tvingar tsu (t.ex. las "くつ・した" eller katakana クツシタ) och kör seglyssna igen. Granskaren rättar inget.
Vem:     byggarsessionen (egna/dubba.mjs)
```

```
G-B02 🔴  DK 007 (MATSTRUMP_DK_sushi_gift_ugc_007_v1, 120251777282560023, video 1841234493547593)
Vad:     Produktordet "sokker" hörs som "sukker" (socker/sugar) varje gång, sex av sex. Slutetiketten hörs som "Sushi-socker".
Bevis:   Whisper medium (da låst), 2026-09-30 ~14:15 UTC: 0,0 s "sushi formet sukker"; 13,3 s "løber tør for er sukker";
         16,1 s "umage sukker er hverdag"; 22,9 s "det er sukker"; 38,5 s "Ligner sushi, men er socker."; 40,5 s "Sushi-socker."
         Kontroll: DK 005 och DK 006 (samma röstväg) hörs med "sokker"/"sushi-sokker".
         Danskans o/u i sokker/sukker ligger nära, så Whisper kan ta fel. Ett fel här ger "sushiformat socker".
Förslag: Lyssna på de sex tidpunkterna. Hörs "sukker": gör om klippen och kör seglyssna på dem.
Vem:     byggarsessionen
```

## 🟡 Bör rättas

```
G-B03 🟡  Samma ord i NO 007, NO/NOB 002, DK 002, DK 003
Vad:     "sokker" hörs som "sukker" på ett par ställen (inte alla).
Bevis:   NO 007 (120251777235560023 / NOB 120251779228250023, video 954775957670370): 38,4 s "men er sukker.", 40,5 s "Sushi-sukker."
         (tre andra "sokker" hörs rätt). NO 002 (120251766972450023 / NOB 120251777685410023, video 2981844472169745):
         0,5 s "her er det faktisk sukker, fem par sushi-sokker", 17,7 s "ikke bare sukker". DK 002 (120251767922010023) 0,6 s
         "sushi-sukker"; DK 003 (120251767925650023) 3,6 s "sushi, sukker". Whisper, 2026-09-30 ~14:10–14:35 UTC.
Förslag: Lyssna. Om det hörs: NO 002 är HeyGen (dyr att rendera om). Ta ställning till om repliken klarar sig.
Vem:     byggarsessionen / Axel
```

```
G-B04 🟡  004 (012v2) i alla 13 språk, 14 annonser inklusive NOB och WW
Vad:     Två textrutor syns samtidigt. Ruta 2 ("Den fake er sokker." / "その正体は、なんと靴下！" / "Ten fejk to skarpetki.") ligger kvar
         under ruta 3 i hela farmor-scenen, 4,0–6,x s. Vid 2,0 s överlappar ruta 1 och 2, så att ruta 1:s andra rad halvt döljs.
         Vid 8,0 s sticker en bokstavsrest ut under ruta 5, och 10,0–10,3 s står ruta 5 och 6 samtidigt.
Bevis:   Kontaktark B/ark/<video>-1.jpg för alla 13 videor, B/zoom/004_ov.jpg (svenska källan mot PL, ruta för ruta).
         Den svenska källan (egna/kalla/012v2.mp4) visar en ruta åt gången: vid 4,0 s bara "En dubbeltitt. Ett skratt.".
         Slutloggan MATSTRUMPOR.SE och "/ matstrumpor.se" från källan (12 s) är borta i alla språk.
Förslag: Låt varje ruta sluta när nästa börjar (rendera-012v2.py). Det är kostnadsfritt, ingen röst.
Vem:     byggarsessionen
```

```
G-B05 🟡  Svaga repliker i HeyGen-videorna (001–003), pipeline/seglyssna.py mot heygen/srt/<KOD>/
Vad:     Enskilda repliker där rösten inte säger det manuset säger (täckning < 0,8). Allt annat 0,85–0,99.
Bevis (seglyssna, 2026-09-30 ~14:00–14:30 UTC):
  - DK 001 (120251767917830023) #4 7,96–9,18 s: 0,20. Manus "Du kendte jo deres livret.", hört "Du kender det, der er Sliurad."
    #2 "De blev udsolgt i november." hört "I bliver udsolgt…"; #5 "spisepinde i træ" hört "speedspin i 3". Snitt 0,76.
  - NO/NOB 002 (video 2981844472169745): snitt 0,73. #3 "…to bokser til prisen av én, via lenken" hört "…til prisene en via jenken", "gave" hört "gå av".
  - NO/NOB 001 (120251766960870023): "julestrømpen" hörs "julestrumpen" (svenskklingande). Snitt 0,87.
  - FI 001 (120251767830080023) #3 16,9–22,2 s: 0,69. "Hauska avata ja käytössä vuodesta toiseen" hört "…avauta ja köyhtys vuodesta toisaajasta".
  - PT 001 (120251767996050023) #3: 0,67. "guarda-as para a meia de Natal" hört "guardas para a manhã de notal".
  - NL 001 (120251767086320023) #1 "Dit is je teken." hört "Dit is je keuken!". DE 001 (120251767700350023) #1 "Das ist dein Zeichen." hört "Das ist ein Zeichen."
  - JP 002 (120251797919120023) 5,3 s: 五足入り hört 不足入り ("brist"). JP 003 hört 5足配り. Kan vara Whisper.
Förslag: Lyssna på DK 001 #4 och NO 002 #3 först. De är längst ifrån manus.
Vem:     byggarsessionen / Axel lyssnar
```

```
G-B06 🟡  001–003 och 007, alla språk: suddade rektanglar vid undertexten
Vad:     Den svenska originaltexten är bortsuddad i en ruta som är bredare än den nya undertexten, så en suddig bred list syns runt texten.
         Inte läsbar, alltså ingen svensk text (zoomat, B/zoom/suddat.png). Det är kosmetiskt.
Bevis:   t.ex. NO 003 10,0 s ("spisepinner."), 007 38,4 s. B/komb/*.jpg.
Förslag: Ingen åtgärd krävs. Möjligen en smalare suddning vid nästa rendering.
Vem:     —
```

## 🔵 Frågor till Axel / idéer

```
G-B07 🔵  007 i alla 13 språk: "jag startade företaget"
Vad:     AI-rösten säger att hon startade företaget ("Jeg startet dette firmaet av ren frustrasjon", "I started this brand out of pure
         frustration", JP "イライラから、始めた会社なんです"), medan bilden visar flera olika AI-personer. Samma påstående finns i den
         svenska originalet ("Jag startade Matstrumpor ur en ilska"), som gått i Sverige.
Förslag: Axel avgör om grundarberättelsen är sann nog i andra länder.
```

```
G-B08 🔵  005 (haikuh3) i alla 13 språk, ~39–41 s: tryckt märke "DOIY" på strumpan
Bevis:   OCR läser "DOIY" vid 40,0 s i alla 13 videor. Syns också i den svenska källan. Det är en annan tillverkares logga på produkten i bild.
```

```
G-B09 🔵  008 i alla språk: sex lådor i bilden, erbjudandet ger fyra
Bevis:   Bilderna ur Meta (B/ark/008-1..3.jpg). Texten säger rätt: "Köp 2 – få 2", "20 par" (= 4 × 5). Inget pris, ingen butik, ingen domän, inget 四.
```

```
G-B10 🔵  003 (julvinkeln) i JP
Vad:     Julstrumpa i bild 2–3 s, och talet säger "クリスマスの靴下にぴったりな、唯一のお寿司ですよね". Julstrumpan är inte en japansk sed. Frågan är om julvinkeln passar i Japan. Den japanska språkgranskaren (del C) avgör.
```

```
G-B11 🔵  002/003 säger "två lådor för en" medan 008 säger "köp 2 – få 2"
Vad:     Talet i 002/003 (alla språk, t.ex. NO "to bokser til prisen av én", JP "一つ買うと、もう一つ無料") lovar 1+1. 008 lovar 2+2.
         Båda är samma rabatt. Del D prövar att korgen ger båda.
```

## Det som mättes och var rätt (inga fynd)

- **Teknik, alla 91 unika videor:** 720×1280 (9:16), H.264, ett AAC-ljudspår som inte är tyst (medel −16,4 till −17,6 dB, topp ≤ 0 dB).
  - Längderna: 001 27,8 s, 002 25,1 s, 003 25,7 s, 004 14,3 s, 005 52,2 s, 006 48,0 s, 007 41,6 s.
  - Metas `length` stämmer på 0,1 s.
  - Inget avhugget slut: sista 0,2 s är tyst i alla, och sista ordet slutar före filens slut.
  - Inga tysta hål över 0,8 s mitt i tal.
  - Siffrorna per video står i B/media.json → teknik.
- **Språket:** Whisper gissar själv (utan lås) marknadens språk på alla 78 röstvideor (p 0,80–1,00).
  - 004 har ingen röst, bara musik. Whispers "Thanks for watching" där är en känd hallucination på musik.
- **Delade filer:** NOB bär NO:s sju videor och NO:s bild. WW:s sju videor är byte-identiska med US:s men har egna video_id (md5 lika).
- **Titlar:** alla 91 heter `<KOD>_<nathalie|sofie_h1|sofie_h2|012v2|haikuh3|haikuh2|s001h1>.mp4` och stämmer med numret. Ingen innehåller "katarina".
- **Katarina:** hennes två svenska videor är hämtade via förhandsvisningen av de svenska annonserna 120251707777890023 och 120251707803910023 (B/katarina/).
  - Personerna i 001 (Nathalie), 002/003 (Sofie) och 007:s blonda AI-kvinnor är jämförda bild mot bild (B/katarina/jmf.jpg, ark.jpg).
  - Ingen är Katarina. Hon har kort ljust hår och vit skjorta och står i ett kök med träribbor.
- **Svensk text och loggan i bild:** ingen MATSTRUMPOR.SE, ingen domän, inget pris och ingen valuta i någon video.
  - Kontrollerat med OCR varje sekund på 84 videor (WW = US) och med ögat på kontaktarken.
  - Inga svenska ord hittade (ordlista och OCR).
- **JP:** inget 四 och ingen siffra 4 i tal, bild, undertext eller manus. Undertexterna är CJK, inga fyrkanter.
- **008:** texten ordagrant lika med egna/d3/texter/<KOD>.json i alla 12 bilder (NO=NOB, US=WW).
- **Hämtningen till egna/kalla:** `node matstrumpor/marknader/egna/hamta.mjs` lade de fyra svenska källorna i den gitignorerade mappen, för jämförelsen med 004.

## Kan inte mätas härifrån

- **Taiwan:** kontot har 0 TW-annonser vid läsningen. Ljud, bild och röst kan inte mätas. Texterna finns bara i repot.
- **Läppsynk:** HeyGens läppsynk i 001–003 går inte att mäta maskinellt härifrån. Videorna är inte tittade på i rörelse, bara som stillbilder.
- **`pipeline/rostkoll.py`:** inte körd. Den kräver ffprobe och de svenska UGC-källorna.
  - Längder, ljudspår, volym, tystnad och slut är i stället mätta direkt med ffmpeg/PyAV.
  - För 004–007 är den svenska källan hämtad och jämförd bara för 004.
- **Whisper:** är inte facit. Uttal, tonfall och om repliken "låter naturligt" kräver ett mänskligt öra, och de röda fynden ska prövas så.
- **Kontaktarken:** alla 273 ark är byggda. Granskaren har tittat på:
  - alla språk för 001–007 i sammansatta ark (B/komb/: NO/DK/US/FR, NL/ES/IT/PT, JP/PL/FI/DE, ett urval sidor per nummer),
  - JP, FI, PL och DE ark för ark,
  - alla 12 bilder för 008.
  - Sidor som inte tittats på för ögat är täckta av OCR varje sekund. OCR:en läser dåligt diakritiska tecken och CJK.

---

# Bilaga: Del D+E — sajten och mejlen


Mätt 2026-09-30 13:56–15:10 UTC från containern (nätet går ut från USA). Läs-bart: bara GraphQL `query`,
Chromium med Metas pixel blockerad (`connect.facebook.net`, `facebook.com/tr`), inget inskrivet i kassan,
ingenting betalt. Varje land: exakt annonslänk ur `annonser/marknader.json`; för WW/DE/FR (länk utan `?country=`)
sattes landet med `POST /localization` före besöket (simulering, inte kundens IP). Webbläsarspråket = marknadens språk.
Rådata: `land-<LAND>.json`, `sparning-<locale>.json`, `mejl-<locale>.json`, `frakt.json`, skärmdumpar i `bilder/`.

## Röda fynd

```
G-D01 🔴  Korgen och kassan byter till ENGELSKA för icke-engelska kunder (NO-A, DK, FI, NL, ES, IT, PL, PT – och DE/AT/FR/BE/LU/CH se G-D02)
Vad:     Efter "Köp 2 – Få 2" + "Lägg i korgen" skickar temat ibland kunden till https://matstrumpor.com/cart (utan språkmapp).
         Korgen visas då på engelska och kassan öppnas som en-XX ("Contact", "Delivery", "Pay now", "Sushi Socks",
         "Real wooden chopsticks"). Det hände i 16 av 32 körningar med fylld korg, i alla åtta icke-engelska språk som mättes
         på .com. När sidolådan i stället öppnas blir kassan rätt (DK da-DK, ES es-ES, JP ja-JP, TW zh-hant, NOB nb-NO).
         Samma kund (DK, ES) fick olika utfall i två körningar – det är en kapplöpning, inte ett land.
Bevis:   land-NO.json 2026-09-30 14:04:46 UTC: produktsidan /nb/ (Shopify.routes.root "/nb/") → efter "Legg i handlekurv"
         URL https://matstrumpor.com/cart, <html lang="en">, kassan https://matstrumpor.com/checkouts/cn/…/en-no
         (bilder/NO-korg.png, bilder/NO-kassa.png: "Contact … Email me with news and offers … Total NOK kr 938.00").
         Samma mönster: land-FI (en-FI), land-NL (en-NL), land-IT (en-IT), land-PL (en-PL), land-PT (en-PT),
         land-DK run4 14:5x UTC (en-DK; första körningen 14:0x da-DK), land-ES run4 (en-ES; första es-ES).
         Orsak i temats assets/ms-paket.js (hämtad från matstrumpor.com/cdn/shop/t/…/ms-paket.js):
         function laddaOm(){window.location.href=kod?rutt+"discount/"+encodeURIComponent(kod)+"?redirect="+encodeURIComponent("/cart"):rutt+"cart"}
         – `rutt` är språkmappen men redirect-målet är hårdkodat "/cart". laddaOm körs när sidolådan inte ritas
         eller när kontrollera() inte ser rabattkoden i cart.js i tid.
         Den lokaliserade korgen https://matstrumpor.com/nb/cart är norsk ("Handlekurven din … Estimert totalsum 938,00 NOK").
Förslag: redirect=rutt+"cart" i laddaOm (och i kontrollera-anropet). Läs om som kund i alla språk efter rättningen.
Vem:     byggarsessionen (temat, ms-paket.js). Utförs aldrig av granskaren.
```

```
G-D02 🔴? (misstänkt, måste bekräftas från EU-IP)  DE- och FR-kampanjens länk landade på ENGELSKA i Chromium
Vad:     https://matstrumpor.com/de/products/sushi-strumpor och /fr/… (annonslänkarna utan ?country=) svarade i
         Chromium med 302 till https://matstrumpor.com/products/sushi-strumpor (engelska) – även efter
         POST /localization country=DE/AT/CH/FR/BE/LU + språk de/fr och med webbläsarspråk de-DE/fr-FR.
         Priset och fraktrutan blev rätt land (€44.90, "Free shipping to Germany") men sidan, korgen och kassan engelska.
Bevis:   land-DE/AT/CH/FR/BE/LU.json (14:4x–15:0x UTC, 9 av 9 körningar html lang="en", slut_url /products/sushi-strumpor);
         probe 14:3x UTC: "302 https://matstrumpor.com/de/products/sushi-strumpor -> https://matstrumpor.com/products/sushi-strumpor"
         både utan kaka och med localization=DE. MEN: curl samma minuter gav ömsom 302 (14:36, fyra av fyra),
         ömsom 200 med <html lang="de"> (14:38–14:40, alla försök). Sidan körde dessutom Cloudflare-kontroll
         ("Just a moment…", 15:12 UTC) mot containern. Kan alltså vara Shopifys IP-styrning för en USA-IP.
Förslag: Pröva länken från en tysk och en fransk IP (eller Axels telefon via VPN) innan DE/FR slås på.
         Alternativt ge länkarna ?country= per land genom ett adset per land. Ingen ändring görs av granskaren.
Vem:     rättningssessionen + Axel (VPN-klicket)
```

```
G-D03 🔴 (Taiwan)  Fraktmejlets knapp "追蹤包裹" leder till en SVENSK 404-sida
Vad:     Alla tre zh-TW-fraktnotiserna länkar till https://matstrumpor.se/zh-tw/pages/spara?nummer=MS-…;
         den adressen svarar 404 "Sidan hittades inte" (html lang="sv"). .se-närvaron har zh-TW på /zh, inte /zh-tw
         (https://matstrumpor.se/zh/pages/spara 200; https://matstrumpor.com/zh-tw/pages/spara 200).
Bevis:   mejl-lankar.mjs 14:1x UTC (EmailTemplate/126064296275, translations(locale:"zh-TW") → href
         "https://matstrumpor.se/zh-tw/pages/spara?nummer={…}"); curl 14:21:10 UTC: 404; sparning-zh-TW.json
         se_mejllank 14:17 UTC: status 404, h1 "Sidan hittades inte".
Förslag: Mappen per språk ur webPresences för den domän mejlet pekar på (eller byt till matstrumpor.com/zh-tw).
         Kampanjen TW är tom, men en taiwanesisk order skulle få en död knapp.
Vem:     byggarsessionen (sparning/butiker.json → mejl_sprak.mapp, mejl/notis-oversattning.mjs)
```

## Gula fynd

```
G-D04 🟡  Fraktmejlen på alla 12 utlandsspråk pekar på matstrumpor.se, inte .com
Vad:     Knappen → https://matstrumpor.se/<språk>/pages/spara, loggan/hemlänken → https://matstrumpor.se,
         kontakt kundsupport@matstrumpor.se. CLAUDE.md säger "Allt utland går via matstrumpor.com … inget länkar dit".
Bevis:   mejl-lankar.mjs 14:1x UTC, alla 13 locales (nb … zh-TW). Sidorna .se/<språk>/pages/spara svarar 200 på rätt
         språk utom zh-tw (G-D03), så det är en avvikelse mot beslutet, inte ett trasigt mejl.
Förslag: Axel avgör om mejlen ska peka på .com. Vem: byggarsessionen.
```

```
G-D05 🟡  Japan och Taiwan: svenska ordet "recensioner" under produktnamnet
Vad:     Judge.me-märket visar "11 recensioner" på /ja och /zh-tw (Judge.me-inställningens locale "en").
Bevis:   land-JP.json 14:5x UTC och land-TW.json: judgeme.preview "11 recensioner"; korgens/produktens texter.
         Övriga språk: "11 anmeldelser", "11 reviews", "11 arvostelua" osv.
Förslag: Judge.me-översättning för ja/zh-TW (eller dölj räknaren där). Vem: byggarsessionen.
```

```
G-D06 🟡  Sidfotens betalikoner visar Klarna (och Bizum, BLIK, MB WAY, Twint, MobilePay …) i alla länder, även JP/TW
Vad:     Kassan i JP och TW har ingen Klarna (mätt), men sidfotens ikonrad (Shopifys payment icons) visar Klarna synligt.
Bevis:   land-JP.json/land-TW.json klarna_swish.betalikoner_sidfot: [American Express, Apple Pay, Bancontact, Bizum, BLIK,
         Google Pay, iDEAL Wero, Klarna, Maestro, Mastercard, MB WAY, MobilePay, PayPal, Shop Pay, Twint, Union Pay, Visa];
         kassa.klarna_swish JP [] , TW [] . Swish syns ingenstans.
Förslag: Kosmetiskt. Vem: byggarsessionen.
```

```
G-D07 🟡  Taiwan: priset skrivs "$1,690" – samma tecken som USD
Vad:     TWD visas med "$" utan NT: "$1,690", "$3,380", kassan "$3,380.00 … 總計 TWD".
Bevis:   land-TW.json 14:5x UTC paket.nu "$1,690"/"$3,380", pris_kopruta "$1,690.00".
Förslag: Valutaformat "NT${amount_no_decimals}" för TWD. Vem: byggarsessionen.
```

```
G-D08 🟡  Shopifys EGNA "levererad"-notiser har fel text på japanska och kinesiska
Vad:     Notisen "Ordern har levererats"/"En försändelse … har levererats" är Shopifys standardöversättning (updatedAt null):
         ja-ämnet för försändelse-levererad är "注文番号 {{ name }} が発送されました" (= "har SKICKATS", inte levererats);
         zh-TW-brödtexten börjar "您的訂單已送達 您的訂單已取消。" (= "din order har AVBRUTITS").
Bevis:   mejl-ja.json / mejl-zh-TW.json → notiser.levererad_forsandelse (EmailTemplate/126544609619), 14:1x UTC.
Förslag: Egen översättning av de två levererad-notiserna, eller låt bli om de aldrig skickas (sätts av spårningsrutinens
         DELIVERED-event?). Axel/byggaren avgör. Vem: byggarsessionen.
```

## Blå (frågor/idéer)

```
G-D09 🔵  Kassans rubrik bär butiksnamnet "Matstrumpor.se" ("Matstrumpor.se Checkout", NOB: "Matstrumpor.se Utsjekking")
Bevis:   land-NO.json / land-NO-NOB.json kassa.rader 14:0x UTC. Loggan i kassan är MATSTRUMPOR utan .SE (bilder/NO-kassa.png).
         Det är butikens namn i Shopify (Inställningar → Butiksnamn). Ingen norsk-påstående på B-sidan hittades
         (NOB-produktsidan: "Matstrumpor drives av STONEBITE ECOM AB").
```

```
G-D10 🔵  A/B-testet i Norge skiljer i mer än raden "Et svensk merke."
Bevis:   A (.com/nb, land-NO.json) visar Judge.me-rutan med SVENSKA recensioner ("Strumppaketen var så roliga …");
         B (.no, land-NO-NOB.json) visar egen recensionskarusell översatt till norska ("Sokkepakkene var så morsomme …",
         märkt "Verifisert kjøp", utan "översatt"). Testet mäter alltså även recensionsspråket. Översatta citat
         som ser ut som kundens egna ord kan vara en fråga för Axel.
```

```
G-D11 🔵  "4" i japanska och kinesiska fraktmejl
Bevis:   mejl-ja.json fraktbekraftelse: "最初の2〜4日間は…"; mejl-zh-TW.json: "前 2–4 天…". Regeln om 四 gäller annonser;
         Axel avgör om mejlen ska följa samma regel.
```

```
G-D12 🔵  Byggarens kundvy.mjs mäter matstrumpor.se, inte annonsernas .com, och läser BE som nederländska
Bevis:   kundvy.mjs BAS = 'https://matstrumpor.se'; SPRAK_PER_LAND BE:'nl' medan FR-kampanjen skickar BE till /fr.
         Den körde grönt 13:56 UTC (66 av 66 ✅) men fångar varken G-D01 eller G-D02.
```

Prövat och INTE fel:
- A/B-testets variant B ("1 låda / 2 lådor / 4 lådor", svenska, 499/799) ligger i HTML:en på alla språk men dolt.
  Tvingad med sajtens egen `?ms_ab=paket:b` (15:05 UTC, abtest-paketB.json + ab.log) visade NO/DE/US ändå de översatta
  "Köp 1–Få 1 / Köp 2–Få 2"-nivåerna. (JP/PL hann inte mätas innan Cloudflare-kontrollen.)
- Fraktzonerna: alla 21 kampanjländer har en aktiv gratis fraktsats (frakt.json), och fraktsättens namn är översatta på alla 13 språk.
- Spårningssidan på .com (13 språk) och .no: rubrik och texter på språket, påhittat nummer MS-ZZ00ZZ00 ger "hittar inte" på språket.
- Fraktnotiserna (skickad, ny info, ute för leverans): översättning finns och är på rätt språk i alla 13 locales, ingen outdated.

## Kan inte mätas härifrån
- Vad Shopify väljer efter IP för länkarna utan land (WW, DE, FR) – se G-D02; containern går ut från USA.
- Kassans marknadsföringsruta ("Email me with news and offers") var förikryssad i alla länder (bilder/kassa-samtycke-montage.png),
  men containern surfar från USA och CLAUDE.md säger att det inte speglar kundens vy.
- Pixeln i Shopifys web-pixel-sandlåda: bara main-framens fbq-kö lästes (fbq('init','1785935302094082') i alla 22 vyer);
  webPixelsConfigList innehåller ingen Meta-app (bara Spoks, Klaviyo, Judge.me, TikTok) – Meta-pixeln laddas av temat/app-skript.
  Begäran till connect.facebook.net/en_US/fbevents.js avbröts innan något id skickades.
- Kassans frakt: kräver adress, visas inte (utom TW: "已更新的運送方式：免運費").
- Spoks (E2): inga Spoks-verktyg i sessionen (ToolSearch "spoks" 0 träffar).
- Judge.me-recensionernas språk: rutan visar svenska recensioner på alla språk (känt beslut, 48 h).

## Tabell land × kontroll
| Land | Kampanj | Språk (html lang) | Valuta | Pris Köp 1–Få 1 | Golv SE+20 % | Fraktrutan | Logga | Momsrad | Pixel (fbq init) | Korg Köp 2–Få 2 | Kassans språk | Efter "Lägg i" |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| NO | NO | nb | NOK | 469 kr (konfig 469) | 459.78 ✅ | Fri frakt til Norge (no.svg) | utan .SE | nej | 1785935302094082 ✅ | ✅ 4 lådor/2 betalda/4 pinnar = 938 NOK | en-NO ❌ | matstrumpor.com/cart |
| DK | DK | da | DKK | 343 kr. (konfig omräknas) | 315.65 ✅ | Fri fragt til Danmark (dk.svg) | utan .SE | nej | 1785935302094082 ✅ | ✅ 4 lådor/2 betalda/4 pinnar = 686 DKK | en-DK ❌ | matstrumpor.com/cart |
| FI | FI | fi | EUR | 44,90 € (konfig 44.9) | 42.25 ✅ | Ilmainen toimitus Suomeen (fi.svg) | utan .SE | nej | 1785935302094082 ✅ | ✅ 4 lådor/2 betalda/4 pinnar = 89.8 EUR | en-FI ❌ | matstrumpor.com/cart |
| US | US | en | USD | $69 (konfig 69) | 47.91 ✅ | Free shipping to the United States (us.svg) | utan .SE | nej | 1785935302094082 ✅ | ✅ 4 lådor/2 betalda/4 pinnar = 138 USD | en-US | matstrumpor.com/products/sushi-strumpor?country=US |
| GB | WW | en | GBP | £53 (konfig omräknas) | 36.23 ✅ | Free shipping to the United Kingdom (gb.svg) | utan .SE | nej | 1785935302094082 ✅ | ✅ 4 lådor/2 betalda/4 pinnar = 106 GBP | en-GB | matstrumpor.com/products/sushi-strumpor |
| AU | WW | en | AUD | A$102 (konfig omräknas) | 68.56 ✅ | Free shipping to Australia (au.svg) | utan .SE | nej | 1785935302094082 ✅ | ✅ 4 lådor/2 betalda/4 pinnar = 204 AUD | en-AU | matstrumpor.com/cart |
| CA | WW | en | CAD | CA$100 (konfig omräknas) | 67.98 ✅ | Free shipping to Canada (ca.svg) | utan .SE | nej | 1785935302094082 ✅ | ✅ 4 lådor/2 betalda/4 pinnar = 200 CAD | en-CA | matstrumpor.com/products/sushi-strumpor |
| NZ | WW | en | NZD | NZ$125 (konfig omräknas) | 84.94 ✅ | Free shipping to New Zealand (nz.svg) | utan .SE | nej | 1785935302094082 ✅ | ✅ 4 lådor/2 betalda/4 pinnar = 250 NZD | en-NZ | matstrumpor.com/cart |
| DE | DE | en ❌ väntat de | EUR | €44.90 (konfig 44.9) | 42.25 ✅ | Free shipping to Germany (de.svg) | utan .SE | nej | 1785935302094082 ✅ | ✅ 4 lådor/2 betalda/4 pinnar = 89.8 EUR | en-DE ❌ | matstrumpor.com/products/sushi-strumpor |
| AT | DE | en ❌ väntat de | EUR | €44.90 (konfig 44.9) | 42.25 ✅ | Free shipping to Austria (at.svg) | utan .SE | nej | 1785935302094082 ✅ | ✅ 4 lådor/2 betalda/4 pinnar = 89.8 EUR | en-AT ❌ | matstrumpor.com/cart |
| CH | DE | en ❌ väntat de | CHF | CHF 44 (konfig omräknas) | 39.97 ✅ | Free shipping to Switzerland (ch.svg) | utan .SE | SE FIL | 1785935302094082 ✅ | ✅ 4 lådor/2 betalda/4 pinnar = 88 CHF | en-CH ❌ | matstrumpor.com/products/sushi-strumpor |
| FR | FR | en ❌ väntat fr | EUR | €44.90 (konfig 44.9) | 42.25 ✅ | Free shipping to France (fr.svg) | utan .SE | nej | 1785935302094082 ✅ | ✅ 4 lådor/2 betalda/4 pinnar = 89.8 EUR | en-FR ❌ | matstrumpor.com/products/sushi-strumpor |
| BE | FR | en ❌ väntat fr | EUR | €44.90 (konfig 44.9) | 42.25 ✅ | Free shipping to Belgium (be.svg) | utan .SE | nej | 1785935302094082 ✅ | ✅ 4 lådor/2 betalda/4 pinnar = 89.8 EUR | en-BE ❌ | matstrumpor.com/cart |
| LU | FR | en ❌ väntat fr | EUR | €44.90 (konfig 44.9) | 42.25 ✅ | Free shipping to Luxembourg (lu.svg) | utan .SE | nej | 1785935302094082 ✅ | ✅ 4 lådor/2 betalda/4 pinnar = 89.8 EUR | en-LU ❌ | matstrumpor.com/products/sushi-strumpor |
| NL | NL | nl | EUR | € 44,90 (konfig 44.9) | 42.25 ✅ | Gratis verzending naar Nederland (nl.svg) | utan .SE | nej | 1785935302094082 ✅ | ✅ 4 lådor/2 betalda/4 pinnar = 89.8 EUR | en-NL ❌ | matstrumpor.com/cart |
| ES | ES | es | EUR | 44,90 € (konfig 44.9) | 42.25 ✅ | Envío gratis a España (es.svg) | utan .SE | nej | 1785935302094082 ✅ | ✅ 4 lådor/2 betalda/4 pinnar = 89.8 EUR | en-ES ❌ | matstrumpor.com/cart |
| IT | IT | it | EUR | 44,90 € (konfig 44.9) | 42.25 ✅ | Spedizione gratuita in Italia (it.svg) | utan .SE | nej (regexträff "davvero"/"Verona" = falsklarm) | 1785935302094082 ✅ | ✅ 4 lådor/2 betalda/4 pinnar = 89.8 EUR | en-IT ❌ | matstrumpor.com/cart |
| PL | PL | pl | PLN | 200 zł (konfig omräknas) | 184.6 ✅ | Darmowa dostawa do Polski (pl.svg) | utan .SE | nej | 1785935302094082 ✅ | ✅ 4 lådor/2 betalda/4 pinnar = 400 PLN | en-PL ❌ | matstrumpor.com/cart |
| PT | PT | pt-PT | EUR | 44,90 € (konfig 44.9) | 42.25 ✅ | Envio grátis para Portugal (pt.svg) | utan .SE | nej | 1785935302094082 ✅ | ✅ 4 lådor/2 betalda/4 pinnar = 89.8 EUR | en-PT ❌ | matstrumpor.com/cart |
| JP | JP | ja | JPY | ￥7,980 (konfig 7980) | 7541.55 ✅ | 日本全国送料無料 (jp.svg) | utan .SE | nej | 1785935302094082 ✅ | ✅ 4 lådor/2 betalda/4 pinnar = 15960 JPY | ja-JP | matstrumpor.com/ja/products/sushi-strumpor?country=JP |
| TW | TW | zh-TW | TWD | $1,690 (konfig 1690) | 1525.84 ✅ | 全台免運費 (tw.svg) | utan .SE | nej | 1785935302094082 ✅ | ✅ 4 lådor/2 betalda/4 pinnar = 3380 TWD | zh-TW | matstrumpor.com/zh-tw/products/sushi-strumpor?country=TW |
| NO-NOB | NOB | nb | NOK | 469 kr (konfig 469) | 459.78 ✅ | Fri frakt til Norge (no.svg) | utan .SE | nej | 1785935302094082 ✅ | ✅ 4 lådor/2 betalda/4 pinnar = 938 NOK | nb-NO | matstrumpor.no/products/sushi-strumpor?country=NO |

Kommentar till tabellen: "Kassans språk ❌" = kassan öppnades på engelska (G-D01/G-D02). Priset per låda ligger över golvet
Sverige 399 kr + 20 % i dagens kurs (open.er-api 2026-09-30 00:02 UTC) i alla 21 länder. Korgen gav i alla 21: 4 lådor sushistrumpor
(2 betalda + 2 à 0), 4 par ätpinnar à 0, summa = paketväljarens pris, i marknadens valuta.

---

# Bilaga: Del F — byggarens påståenden


Inget ACTIVE bland de 15 utlandskampanjerna, deras 14 adsets eller 112 annonser (Meta 2026-09-30 13:56:54 UTC). Inga 🔴 i del F/G. Alla fynd nedan är dokumentationsfel eller frågor; sajten och kontot stämmer med marknader.json/konfig.json där inget annat sägs.

```
G-F01 🟡  CLAUDE.md, Japan/Taiwan-stycket
Vad:     "Kampanjerna MATSTRUMP_JP_SALES och MATSTRUMP_TW_SALES är PAUSED, med åtta annonser per marknad" — Taiwan har inga annonser i kontot.
Bevis:   Meta 2026-09-30 13:56:54 UTC: kampanj 120251796778420023 MATSTRUMP_TW_SALES PAUSED, 0 adsets, 0 annonser. README → Japan och Taiwan säger rätt ("står PAUSED och tom … de åtta annonsfilerna är klara").
Förslag: "… JP PAUSED med åtta annonser; TW PAUSED och tom (åtta annonsfiler klara i repot) tills Meta godkänt annonsören."
Vem:     byggarsessionen
```

```
G-F02 🟡  README → "Kampanjerna i kontot" + "Annonserna i kontot" (inaktuella tabeller)
Vad:     Tabellen och texten beskriver läget 27–28/9 som om det gällde nu: NO 1 000 kr/dag, WW = NO, DK, FI, US, GB, AU, CA, NZ, PT-språk "pt (/pt/)", "Worldwide länkar till /en/products/sushi-strumpor … så en dansk ser engelska + DKK", rubriken "36 st … tre annonser" och raderna NOB, JP, TW saknas.
Bevis:   Meta 13:56:54 UTC: NO daily_budget 50000 (500 kr); WW-adset 120251749614670023 countries NZ, CA, GB, AU; PT-länk https://matstrumpor.com/pt-pt/products/sushi-strumpor?country=PT; WW-länk https://matstrumpor.com/products/sushi-strumpor; 112 annonser, 8 per kampanj (TW 0). Senare avsnitt i samma README (Domänerna, "En kampanj per marknad") säger rätt, så filen motsäger sig själv.
Förslag: Byt tabellen mot den aktuella (15 rader, som i PROMPT-granskning.md) eller märk den "läget 2026-09-27, ersatt" med hänvisning till marknader.json.
Vem:     byggarsessionen
```

```
G-F03 🟡  CLAUDE.md, Matstrumpor-stycket: "platshållarbudget" för DK/FI/US/WW
Vad:     "fem kampanjer … NO (Axels 1 000 kr/dag), DK, FI, US och WW … de fyra sista med PLATSHÅLLARBUDGET 1 000 kr/dag som --aktivera vägrar tills Axel sagt en budget" — men Axel sa 1 000 kr/dag för alla samma kväll, och NO är nu 500.
Bevis:   marknader.json DK/FI/US/WW budget_beslut: "Axel 2026-09-27 kväll: '… respektive kampanjer 1000kr per dag också'"; README-tabellen "1 000 kr/dag — Axels (kväll; var platshållare)"; Meta NO daily_budget 50000.
Förslag: Stryk "PLATSHÅLLARBUDGET … tills Axel sagt en budget"; platshållare gäller bara JP och TW.
Vem:     byggarsessionen
```

```
G-F04 🔵  CLAUDE.md + README → Facebook-sidan: "104 av 104"
Vad:     Talet gäller före Japan. Nu finns 112 utlandsannonser, och alla 112 bär rätt sida, Instagram-identitet, länk (länk + knapp) och PAUSED.
Bevis:   Meta 13:56:54 UTC: 112 annonser i de 14 kampanjerna med annonser; 0 avvikelser mot marknader.json.
Förslag: "112 av 112 (2026-09-30, JP inräknat)".
Vem:     byggarsessionen
```

```
G-F05 🟡  JP och TW: Klarna-loggan i sidfoten
Vad:     CLAUDE.md/README: "Klarna finns inte i Japan eller Taiwan och är borttaget där". FAQ-texten är utan Klarna, men sidfotens betalikoner visar Klarna (och BLIK, iDEAL, Twint …) för japanska och taiwanesiska kunder.
Bevis:   curl https://matstrumpor.com/ja/products/sushi-strumpor?country=JP och /zh-tw/…?country=TW 2026-09-30 13:58:32 UTC, HTTP 200: `<title id="pi-klarna">Klarna` i ikonlistan "… Google Pay iDEAL Wero Klarna Maestro Mastercard …". Samma lista på alla språk (butikens enabled_payment_types, inte marknadens).
Förslag: Dölj betalikonerna eller Klarna-ikonen när locale är ja/zh-TW (samma mönster som CSS_UTB), eller skriv i README att bara texten är borttagen. Del D bör bekräfta i Chromium om ikonerna syns.
Vem:     byggarsessionen
```

```
G-F06 🔵  README → Fraktrutan (+ CLAUDE.md): "24 länder"
Vad:     Listan efter "Mätt som kund 2026-09-30 i 24 länder" räknar 22 länder (SE, NO, DK, FI, US, GB, AU, CA, NZ, DE, AT, CH, FR, BE, LU, NL, ES, IT, PL, PT, IE, CZ), 23 prov med NO A och B. JP och TW står inte med.
Bevis:   README rad 592–593. Mina prov 13:58 UTC: rutan rätt i US, GB, CH, LU, PL, DK, NO, NOB, JP, TW.
Förslag: Rätta talet eller komplettera listan.
Vem:     byggarsessionen
```

```
G-F07 🔵  Tre gamla augustikampanjer med ACTIVE annonser under en pausad kampanj
Vad:     MATSTRUMP_SALES AU 120251251965440023, MATSTRUMP_SALES UK 120251251897940023, MATSTRUMP_SALES_US_20260828 120251241772530023: kampanjerna PAUSED (1 000 kr/dag var), men alla adsets och 155 annonser har status ACTIVE (effective CAMPAIGN_PAUSED), länk sushisock.com, sida 1229557150250240, länder AU, GB, US — samma länder som WW och US. Ett klick på kampanjnivå (t.ex. "markera alla → på") startar 3 000 kr/dag till en annan butik och lägger GB/AU/US i två kampanjer, mot CLAUDE.md:s "inget land ligger i två kampanjer".
Bevis:   Meta 13:56:54 UTC, ads.effective_status ['CAMPAIGN_PAUSED'], creative.object_story_spec länk https://sushisock.com/products/sushi-socks (57 + 49 + 49).
Förslag: Fråga till Axel — inget rörs av granskningen. Alternativ: A) låt dem vara, B) Axel arkiverar dem i Ads Manager, C) skriv in dem i README som "finns, rör inte".
Vem:     Axel
```

```
G-F08 🟡  COGS-dokumentationen säger inte att 13 av 21 kampanjländer saknar kostnadsblock
Vad:     CLAUDE.md ("Norden saknar kostnad, donut/pizza/hamburgare saknar Cost per item") och README → COGS per marknad nämner bara Sverige, Big 5 och Norden. DE, AT, CH, FR, BE, LU, NL, ES, IT, PL, PT, JP och TW finns inte i något block. README:s plan citerar dessutom "US 1,22 · GB 1,17" som i dag är 1,182 / 1,137.
Bevis:   `node matstrumpor/kor.mjs --ekonomi --marknad <LAND>` 2026-09-30 13:59:37 UTC: "Kostnadsblock: saknas … landet DE finns inte i något kostnadsblock i cogs.json" (likadant för alla 13); US sushi 5 par break-even-ROAS 1.182, GB 1.137.
Förslag: Lägg raden "Europa (13 kampanjländer), Japan och Taiwan: inget kostnadsblock — break-even går inte att räkna" i README och CLAUDE.md; ta bort de gamla talen eller märk dem med datum och kurs.
Vem:     byggarsessionen (texten), Axel (kostnaderna)
```

## Kan inte mätas härifrån (F/G)

- Taiwans avslag ("Annonsör saknas", "TAIWAN_UNIVERSAL krävs"): att återskapa det kräver ett POST mot Meta, vilket är förbjudet.
- Historiska "läst tillbaka"-steg (72 + 64 + 32 byten, "nio stod i Metas granskning", uppladdningen 1600 × 1600): Meta visar bara nuläget. Nuläget är rätt (112 av 112, bilden 720 × 720 visas).
- Fraktrutans flagga, Trust Badges "höjd 0" och spårningssidans brödtext på ja/zh-TW: de ritas eller byts i webbläsaren (serverns HTML bär svenska `data-t`-grundtexter som JS byter). Jag läste bara serverns HTML; del D prövar i Chromium.
- Lokala valutornas belopp i README (DK 305/244/366, CH 31/47, PL 178): det står inte vilka produkter talen gäller, och Shopifys kurs rör sig. I dag visar produktsidan sushi 5 par DK 343 kr, CH 44 CHF, PL 200 zł, GB £53.
- Om WW:s och US:s videor är samma engelska innehåll: olika video_id i alla sju videoannonser (bara 008:s bild är samma). Innehållet mäts i del B.
- Judge.me, pixeln och HeyGen-plånboken: hör till andra delar, eller är förbjudna att anropa.

# Bilaga: Del F — påståendena en och en

# F. Byggarens påståenden, prövade

Mätt 2026-09-30. Meta: `act_730973156224390/{campaigns,adsets,ads}` 13:56:54 UTC (22 kampanjer, 37 adsets, 402 annonser, rådata `F/raw/meta.json`), konto/sida/WW-targeting 13:57:45 UTC. Shopify: GraphQL `query` markets/priceLists/deliveryProfiles/shopLocales 13:58:05 UTC (`F/raw/shop.json`). Publik sajt: curl 13:58:32–13:59:15 UTC (`F/sida/*.html`). Break-even 13:59:37 UTC.
C = CLAUDE.md, R = matstrumpor/marknader/README.md (commit 3b45c5d).

| # | Påstående | Källa | Mätt | Håller |
|---|---|---|---|---|
| 1 | Konto 730973156224390 heter "nya kungen", SEK | C | name "nya kungen", currency SEK, account_status 1, BM 3354502211392342 "Matstrumpor.se" | ja |
| 2 | Utlandsannonsernas sida är "Matstrumpor" 1285064981363590, i samma BM | C, R Facebook-sidan | sidans name "Matstrumpor", business 3354502211392342 | ja |
| 3 | Instagram via sidburen identitet 17841423405715219 | C, R | alla 112 utlandsannonser bär instagram_user_id 17841423405715219 | ja |
| 4 | "✅ Alla 104 utlandsannonser bär sidan, Instagram-identiteten och .com-länken (B-sidan .no)" / "104 av 104" | C, R | nu 112 utlandsannonser (JP:s 8 tillkom); 112 av 112 bär sidan, IG, länk = marknader.json i både länk och knapp, PAUSED | ja i sak, talet 104 inaktuellt (G-F04) |
| 5 | Ingen utlandsannons bär sidan Matstrumpor.se 820358954504320, ingen annan annons bär 1285064981363590 | R | 0 resp. 0 | ja |
| 6 | Profilbilden är loggan utan ".SE", inte silhuett | C, R | is_silhouette false, 720×720, bilden visar "MATSTRUMPOR" + sushi (tittad) | ja |
| 7 | Omslagsbild saknas | R | fältet cover tomt | ja |
| 8 | JP-kampanjen 120251797899280023 PAUSED, CBO platshållare 1 000 kr/dag | R Japan | PAUSED, daily_budget 100000 (SEK-öre) | ja |
| 9 | JP-adset 120251797901800023: JP, pixelns köp, 7 dagars klick | R | countries [JP], pixel 1785935302094082 PURCHASE, OFFSITE_CONVERSIONS, CLICK_THROUGH 7 d, PAUSED | ja |
| 10 | JP: 8 annonser, sista raden 「スウェーデン発のブランドです。」 i alla åtta, länk .com/ja/…?country=JP | R | 8 annonser, sista raden identisk i alla 8, länk = marknader.json | ja |
| 11 | TW-kampanjen 120251796778420023 "står PAUSED och tom" | R | PAUSED, 0 adsets, 0 annonser | ja |
| 12 | "Kampanjerna MATSTRUMP_JP_SALES och MATSTRUMP_TW_SALES är PAUSED, med åtta annonser per marknad" | C | TW har 0 annonser i kontot | **nej** (G-F01) |
| 13 | 15 kampanjer, 112 annonser, allt PAUSED (8 per kampanj, TW 0) | PROMPT/R | 15 kampanjer, 14 adsets, 112 annonser, alla status + effective_status PAUSED | ja |
| 14 | Namnen: 001–003 gift_ugc/gift_ugc/jul_ugc, 004 gift_anim, 005–007, 008 offer_static | R | exakt så i alla 14 kampanjer (005–007 heter gift_ugc) | ja |
| 15 | NOB återanvänder NO:s video/bild-id, saknar "Et svensk merke." | R Domänerna | 8 av 8 samma media-id; ingen NOB-brödtext slutar med raden | ja |
| 16 | Sista raden "svenskt varumärke" per språk | C, R | NO, DK, FI, US, WW, DE, FR, NL, ES, IT, PL, PT, JP: en rad per kampanj, rätt språk | ja |
| 17 | A/B: NO 500 + NOB 500 kr/dag | C, R | 50000 + 50000 öre | ja |
| 18 | Alla andra kampanjer 1 000 kr/dag | C, R | 100000 öre på DK…PT, JP, TW | ja |
| 19 | Tabellen "Kampanjerna i kontot": NO 1 000 kr/dag, WW = NO, DK, FI, US, GB, AU, CA, NZ, PT `/pt/`, "Worldwide länkar till /en/products/…" | R | NO 500; WW = NZ, CA, GB, AU; PT-länk /pt-pt/; WW-länk .com/products/sushi-strumpor | **nej** (G-F02) |
| 20 | "fem kampanjer … de fyra sista med PLATSHÅLLARBUDGET 1 000 kr/dag som --aktivera vägrar tills Axel sagt en budget" | C | marknader.json DK/FI/US/WW budget_beslut: Axels 1 000 kr/dag 2026-09-27 kväll; R säger samma | **nej**, motsägs av R och marknader.json (G-F03) |
| 21 | "36 annonser … 3 per kampanj i alla tolv" (rubrik "Annonserna i kontot … 36 st") | C, R | 112, 8 per kampanj | historiskt sant, inaktuellt (G-F02) |
| 22 | WW-adsetet 120251749614670023 bär bara GB, AU, CA, NZ; 18–65, Advantage+ oförändrat | R | countries NZ, CA, GB, AU; age 18–65; advantage_audience 1 | ja |
| 23 | "inget land ligger i två kampanjer" | C | sant bland de 15 nya; de tre gamla augustikampanjerna (PAUSED på kampanjnivå, adsets+annonser ACTIVE) bär AU, GB, US | ja med förbehåll (G-F07) |
| 24 | Priser: NOK 469/429/349/519/349/59 | R Priserna | Shopify prislista Norge exakt så | ja |
| 25 | Priser: EUR 44,90/39,90/31,90/47,90/31,90/5,90 | R | prislista Europa exakt så | ja |
| 26 | Priser: USD 69/54,99/39,99/59,99/39,99/6,99 | R | prislista USA exakt så | ja |
| 27 | Japan ¥7 980/7 080/5 680/8 580/5 680/1 080 | R Japan | prislista Japan exakt så; produktsidan JP visar ¥7,980 | ja |
| 28 | Taiwan NT$1 690/1 490/1 190/1 790/1 190/209 | R Japan | prislista Taiwan exakt så; produktsidan TW visar $1,690.00 | ja |
| 29 | Europa-marknaden 29 länder (EU utom SE + IS, LI, CH) | C | 29 regioner | ja |
| 30 | Egna marknader Japan (JPY, ja) och Taiwan (TWD, zh-TW) | C, R | marknaderna Japan/JPY och Taiwan/TWD aktiva; locales ja, zh-TW publicerade | ja |
| 31 | .com bär alla utlandsspråk (en i roten + nb, da, fi, de, fr, nl, es, it, pl, pt-PT; ja, zh-TW) och ligger i Norge, Europa, USA, Japan, Taiwan | R Domänerna, Japan | webPresence matstrumpor.com default en + nb,da,fi,de,fr,nl,es,it,pl,pt-PT,ja,zh-TW i alla fem utlandsmarknaderna | ja |
| 32 | .no bara Norge (nb); .eu i Europa (en + da…pt-PT) | R Domänerna | så | ja |
| 33 | Fri frakt i zonen "Japan och Taiwan"; alla kampanjländer fri frakt | R Japan, C | zoner: Japan och Taiwan 0, Europa 0, Engelska marknader 0, Norden (Norge) 0 | ja |
| 34 | Alla kampanjlänkar svarar 200 (.com/… och .no) | R | 10 av 10 prövade svarade 200 utan omdirigering till annan domän | ja |
| 35 | Fraktrutan: "Free shipping to the United States", "Kostenloser Versand in die Schweiz", "Livraison gratuite au Luxembourg", "Darmowa dostawa do Polski", 「日本全国送料無料」, 「全台免運費」 | R Fraktrutan, Japan | exakt dessa strängar i serverns HTML (US, CH, LU, PL, JP, TW); GB "Free shipping to the United Kingdom", DK "Fri fragt til Danmark", NO/NOB "Fri frakt til Norge" | ja |
| 36 | Fraktrutan "mätt som kund i 24 länder" (listan) | C, R | listan i R räknar 22 länder (23 med NO A och B) | **nej**, talet stämmer inte med listan (G-F06) |
| 37 | Trust Badges dold på alla språk utom svenska | R | CSS-regeln `ultimateTrustBadgeswidgetDiv { display: none` finns på .com/ja, saknas på .se (SE) | ja (serverns HTML; höjden 0 inte renderad) |
| 38 | Klarna finns inte i Japan och Taiwan och är borttaget där | C, R Japan | FAQ:n utan Klarna, men sidfotens betalikoner på .com/ja och .com/zh-tw bär `<title id="pi-klarna">Klarna` | **delvis** (G-F05) |
| 39 | Trustpilot-raden JP 「ほぼ満足」, TW 「很好」, decimalpunkt | R Japan | JP "ほぼ満足" + "4.2 / 5", TW "很好" | ja |
| 40 | Spårningssidans titel på ja/zh-TW 「配送状況を確認」/「追蹤包裹」 | R Japan | <title> och <h1> exakt så | ja (brödtexten byts med JS, se kan inte mätas) |
| 41 | Break-even i planavsnittet "US 1,22 · GB 1,17" (sushi 5 par) | R | i dag US 1,182, GB 1,137 (ECB 2026-09-30) | nej, inaktuellt tal (del av G-F08) |
| 42 | "Norden saknar kostnad, donut/pizza/hamburgare saknar Cost per item" (som hela listan) | C, R COGS | sant, men DE, AT, CH, FR, BE, LU, NL, ES, IT, PL, PT, JP, TW saknar också kostnad (inget block) | ofullständigt (G-F08) |

# Bilaga: Del G — pengarna


Mätt 2026-09-30 13:56:54 UTC ur Meta (`act_730973156224390/campaigns`, fältet `daily_budget`, kontots valuta SEK, belopp i öre). Break-even 13:59:37 UTC ur `node matstrumpor/kor.mjs --ekonomi --marknad <LAND>` (koden läst först: grenen `--ekonomi --marknad` läser `cogs.json`, `marknader/konfig.json` och ECB-kursen och returnerar före allt som skriver; `git status` tomt före och efter). ECB-kurs 2026-09-30: EUR 11,33 · USD 9,98 · NOK 1,04 kr.

## Vad det kostar per dag om allt slås på

| Kampanj | Id | daily_budget (Meta) | kr/dag | Status |
|---|---|---|---|---|
| NO (A) | 120251749551520023 | 50000 | 500 | PAUSED |
| NOB (B) | 120251777339520023 | 50000 | 500 | PAUSED |
| DK | 120251749599180023 | 100000 | 1 000 | PAUSED |
| FI | 120251749604200023 | 100000 | 1 000 | PAUSED |
| US | 120251749609010023 | 100000 | 1 000 | PAUSED |
| WW (GB, AU, CA, NZ) | 120251749612350023 | 100000 | 1 000 | PAUSED |
| DE (DE, AT, CH) | 120251750242530023 | 100000 | 1 000 | PAUSED |
| FR (FR, BE, LU) | 120251750244370023 | 100000 | 1 000 | PAUSED |
| NL | 120251750246440023 | 100000 | 1 000 | PAUSED |
| ES | 120251750248310023 | 100000 | 1 000 | PAUSED |
| IT | 120251750250830023 | 100000 | 1 000 | PAUSED |
| PL | 120251750321130023 | 100000 | 1 000 | PAUSED |
| PT | 120251750324340023 | 100000 | 1 000 | PAUSED |
| JP | 120251797899280023 | 100000 | 1 000 (platshållare, "EJ GIVEN") | PAUSED |
| TW | 120251796778420023 | 100000 | 1 000 (platshållare; inget adset ⇒ kan inte leverera) | PAUSED |

- **Alla 15: 14 000 kr/dag** (≈ 98 000 kr/vecka, ≈ 420 000 kr på 30 dagar).
- Det som faktiskt kan leverera (TW har inget adset): **13 000 kr/dag**.
- Bara budgetar Axel själv gett (utan JP/TW-platshållarna): **12 000 kr/dag**.
- Budgetarna i Meta = `budget_sek_dag` i `marknader.json` för alla 15 (500/500/1 000 × 13).

**Utanför de 15, i samma konto** (visas som information):
- Tre gamla augustikampanjer `MATSTRUMP_SALES AU` 120251251965440023, `MATSTRUMP_SALES UK` 120251251897940023, `MATSTRUMP_SALES_US_20260828` 120251241772530023: kampanjen PAUSED med 1 000 kr/dag var, men **alla adsets och alla 155 annonser ACTIVE under** (effective `CAMPAIGN_PAUSED`), länk sushisock.com, sidan 1229557150250240. Slås "allt" på i Ads Manager (t.ex. markera alla kampanjer) börjar de spendera direkt: +3 000 kr/dag ⇒ 17 000 kr/dag.
- Sveriges `MATSTRUMP_SALES_20260826` 120251217860260023 är ACTIVE med 10 000 kr/dag (Axels, rörs inte). Med den bär kontot 27 000 kr/dag om alla 15 slås på.

## Break-even-ROAS per kampanjland (en låda per order, utan moms, utan betalavgifter/returer — "i bästa fall" enligt verktyget)

| Kampanj | Land | Sushi 5 par | Sushi 3 par | Donut | Pizza | Hamburgare | Kostnadsblock |
|---|---|---|---|---|---|---|---|
| US | US | **1,182** (pris 69 USD = 688,54 kr, kostnad 105,78 kr) | 1,185 | 1,295 | 1,195 | 1,286 | big5 |
| WW | GB | **1,137** | 1,134 | 1,216 | 1,145 | 1,216 | big5 |
| WW | AU | **1,198** | 1,180 | 1,295 | 1,207 | 1,303 | big5 |
| WW | CA | **1,166** | 1,160 | 1,254 | 1,172 | 1,258 | big5 |
| WW | NZ | **1,184** | 1,173 | 1,282 | 1,198 | 1,286 | big5 |
| NO, NOB | NO | saknas | saknas | saknas | saknas | saknas | norden, utan kostnad |
| DK | DK | saknas | saknas | saknas | saknas | saknas | norden, utan kostnad |
| FI | FI | saknas | saknas | saknas | saknas | saknas | norden, utan kostnad |
| DE | DE, AT, CH | saknas | … | … | … | … | inget block |
| FR | FR, BE, LU | saknas | … | … | … | … | inget block |
| NL, ES, IT, PL, PT | respektive | saknas | … | … | … | … | inget block |
| JP | JP | saknas | … | … | … | … | inget block |
| TW | TW | saknas | … | … | … | … | inget block |

Jämförelse (samma verktyg): Sverige sushi 5 par 1,396, 3 par 1,374; donut/pizza/hamburgare saknar Cost per item i Shopify.
Observera: WW-länkarna saknar `?country=`, och US-marknadens fasta USD-priser gäller alla fem länderna, så break-even ovan räknar på USD-priset.

## Länder utan varukostnad i `cogs.json` (break-even går inte att räkna)

**16 av 21 kampanjländer:** NO, DK, FI (blocket `norden` finns men utan kostnad — "Axel har inte gett fraktkostnaden") och DE, AT, CH, FR, BE, LU, NL, ES, IT, PL, PT, JP, TW (finns inte i något block alls).
Bara US, GB, AU, CA och NZ har kostnad. Alltså **12 av 14 kampanjer som kan leverera (alla utom US och WW) saknar break-even**, och den enda kill-regeln repot tillåter (mot break-even, CLAUDE.md regel 4) går inte att tillämpa där.

---

# Bilaga: Del C — språket (nb)


Granskare: infödd läsning av bokmål som kund, plus norsk marknadsföringsrätt (markedsføringsloven, prisopplysningsforskriften).
Läs-bart. Inga nätanrop gjorda. Allt ur insamlad data i scratchpad (A/annonser.json läst ur Meta 2026-09-30 ~14:06 UTC,
B/transkript + B/bildtext, D/land-NO*.json 14:04–14:08 UTC, D/sparning-nb.json, D/mejl-nb.json) och repot
(annonser/NO.json, NOB.json, heygen/srt/NO/, egna/NO/, egna/d3/texter/NO.json, output/underlag-nb.json).

Sammanfattning: 🔴 1 · 🟡 9 · 🔵 3.

Copyn i Meta är ordagrant lika med repot för alla 16 annonser (`copy_diff` tom, 16/16). NOB skiljer sig bara på raden
"Et svensk merke." och länken. B-sidan påstår ingenstans att butiken är norsk (se "Mätt och rätt").

## 🔴

```
G-C-nb-01 🔴  NO (A) alla 8 annonser — korgen och kassan är på ENGELSKA efter "Legg i handlekurv" på .com/nb
Vad:     Produktsidan är norsk, men köpknappen skickar kunden till matstrumpor.com/cart (html lang "en") och kassan
         öppnas som en-NO. Kunden läser "Your cart", "Real wooden chopsticks", "Sushi Socks", "Pairs: 5 pairs",
         "Finalize order" och beloppsformatet "kr 1,174.00". B (matstrumpor.no) är norsk hela vägen:
         "Handlekurven din", "Fullfør bestilling", "1 174,00 kr". Det är D:s fynd (tabell.md: "en-NO ❌"), bekräftat
         här ur det kunden läser. Det gör också A/B-testet orent: A tappar språket i sista steget, men B gör det inte.
Bevis:   D/land-NO.json (14:04:46 UTC): efter_lagg_i = {"url":"https://matstrumpor.com/cart","html_lang":"en",
         "produktsidans_root":"/nb/"}; texter.korg_dit_kunden_hamnar börjar "Your cart", "Continue shopping";
         kassa.url ".../en-no", lang "en-NO", rader "Finalize order", "TOTAL SAVINGS", "kr 1,174.00".
         D/land-NO-NOB.json (14:07:57 UTC): kassa lang "nb-NO", "Fullfør bestilling", "1 174,00 kr".
         Den lokaliserade korgen finns och är rätt: matstrumpor.com/nb/cart → "Handlekurven din" (texter.korg_lokaliserad).
Förslag: Köpknappens/formulärets mål ska bära locale-prefixet (/nb/cart, eller routes.cart_url i temat) så att kunden stannar
         på /nb. Troligen samma för alla .com/<språk> (D:s tabell visar en-DK, en-FI, en-NL … ). Mät om A/B-testet
         först efter rättningen. Granskaren rättar inget.
Vem:     byggarsessionen (temat, domantema.mjs / ms-paket)
```

## 🟡

```
G-C-nb-02 🟡  NO + NOB 001–007 (alla videoannonser), brödtexten
Vad:     (a) "Den blir ikke liggende i esken etterpå. Den er på føttene, uke etter uke." Närmaste "den" bakåt är
         "en eske", så en norsk läsare får först "lådan blir inte liggande i lådan". Det är sokkene som menas.
         (b) "vitsegave" är ett ovanligt ord. Sajten säger "tullegave" om samma sak ("Ingen tar vare på en tullegave").
Bevis:   A/annonser.json, brodtext (lika i alla 14 videoannonser): "Svaret på begge: en eske som ser ut som ekte takeaway, …
         Den blir ikke liggende i esken etterpå. Den er på føttene, uke etter uke."; underlag-nb.json
         produkt.sushi-strumpor.body_html: "Ingen tar vare på en tullegave."
Förslag: t.ex. "De blir ikke liggende i esken. De er på føttene, uke etter uke." och samma ord som sajten (tullegave
         eller spøkegave). Ny rad av sonnet i rättningssessionen (CLAUDE.md regel 6).
Vem:     byggarsessionen
```

```
G-C-nb-03 🟡  NO + NOB 002 (Sofie H1), undertexten och talet
Vad:     "typ ti personer". "typ" som utfyllnadsord kommer från svenskan och är slang i norska. Granskaren strök
         samma ord i 007 och 005 ("'typ' → 'liksom' … svenskt lån/ungdomsslang"), men det står kvar här.
         003 säger rätt "Jeg kommer allerede på ti personer" utan "typ".
Bevis:   heygen/srt/NO/matstrumpor_sofie_h1.srt: "Og jeg kommer allerede på typ ti personer jeg kunne gitt dette til.";
         OCR 15,0 s "Og jeg kommer allerede pa typ ti" (B/bildtext/NO-002.txt); egna/NO/s001h1.json granskning-not.
Förslag: "Og jeg kommer allerede på minst ti personer …" i undertexten. Talet är HeyGen, och en omrendering kostar.
         Det räcker att byta undertexten om Axel inte vill betala.
Vem:     byggarsessionen / Axel (kostnaden)
```

```
G-C-nb-04 🟡  NO + NOB 001 och 006: stela kalker från svenskan
Vad:     001: "Gøy å pakke opp, og brukes år etter år." blandar infinitiv och passiv utan subjekt (svenskans "Rolig att
         öppna och används år efter år"). "Dette er tegnet ditt." är en direktöversättning av "Det här är ditt tecken".
         Den förstås, men låter översatt. 006: "Det er den typen gave der giveren er den smarte." är ordagrant svenska.
Bevis:   heygen/srt/NO/matstrumpor_nathalie.srt block 1 och 3; egna/NO/haikuh2.json segment 00:35.12
         ([sv: "Det är den typen av present där givaren är den smarta."]).
Förslag: t.ex. "Gøy å pakke opp – og de blir brukt år etter år." och "Det er gaven som får deg til å se smart ut."
         Undertext i 001 (HeyGen) och manus + röst i 006 (ElevenLabs, billig). Sonnet skriver om.
Vem:     byggarsessionen
```

```
G-C-nb-05 🟡  NO + NOB 007 (s001h1), första repliken
Vad:     "Skal du gi bort en gave snart, er sushiformede sokker det hyggeligste du kan gi dem." "dem" saknar
         syftning, eftersom ingen mottagare har nämnts. Svenskans original har samma svaghet.
Bevis:   egna/NO/s001h1.json 00:00.00–00:04.74; transkriptet hör samma sak (B/transkript/NO-007.txt).
Förslag: "… det hyggeligste du kan gi." eller "… det hyggeligste du kan gi noen."
Vem:     byggarsessionen
```

```
G-C-nb-06 🟡  NO + NOB 008 brödtext + produktsidan: "Onesize" och "Én størrelse" om samma sak
Vad:     Annonsen och produkttexten säger "Onesize". Varianten, FAQ:n och korgen säger "Én størrelse". Båda förstås,
         men en kund ser två ord för samma sak på samma sida.
Bevis:   A/annonser.json NO 008 brodtext "Onesize, passer str. 36–44."; underlag-nb.json "Onesize – passer 36–44"
         (body_html) mot optionvarde "Én størrelse" och ms_faq "Én størrelse passer de fleste".
Förslag: "Én størrelse, passer str. 36–44." överallt.
Vem:     byggarsessionen
```

```
G-C-nb-07 🟡  Rösten, bekräftar och nyanserar G-B03/G-B05 ur norskt öra (Whisper, inte örat)
Vad:     (a) 007 slutar på poängen "Ser ut som sushi, men er sokker. Sushisokker." Whisper hör "men er sukker. Sushi-sukker."
         Det är de två sista replikerna, alltså slutpoängen. Hörs det så säger annonsen "ser ut som sushi, men är
         socker". Då blir det 🔴 (produktordet i slutpoängen går inte fram).
         (b) 001 hörs svenskklingande: "julestrumpen" (ska vara strømpen), "utsålt" (utsolgt), "Gjør du bort disse"
         (ska vara "Gir du …"). Det är HeyGens röstklon av en svensk talare. Undertexten är rätt.
         (c) 002 (snitt 0,73): "sukker", "gå av" för "gave" och "jenken" för "lenken". "prisen av én" hörs "prisene en".
         (d) 006 "samlas du" för "samler støv" (svenskt -s-passiv?), 1 replik. Troligen Whisper.
Bevis:   B/transkript/NO-007.txt 38,4 s "Ser ut som sushi, men er sukker.", 40,5 s "Sushi-sukker." (täckning 0,86/0,0);
         NO-001.txt "legg dem i julestrumpen", "De blir utsålt"; NO-002.txt #3 0,73; NO-006.txt #10 0,83.
Förslag: Lyssna i ordning: 007 38–41 s, 002 14–25 s, 001 0–8 s. 007 är ElevenLabs och billig att göra om. Uttalet
         "sokker" kan tvingas med stavning (t.ex. "såkker") i talfältet.
Vem:     Axel / byggarsessionen lyssnar
```

```
G-C-nb-08 🟡  NO (A) produktsidan: Judge.me-rutan har engelska och amerikanska format
Vad:     Recensionerna på svenska är ett känt beslut (Judge.me översätter inom 48 h) och räknas inte. Men själva rutan
         visar "Sort reviews by" på engelska, datum "09/28/2026" (amerikanskt, norska är 28.09.2026) och betyget
         "4.4" med punkt. B-sidan visar i stället en egen, norsk ruta: "Hva kundene sier", "4,4 av 5 · 11 anmeldelser",
         "Verifisert kjøp" med recensionerna på norska.
Bevis:   D/land-NO.json texter.produktsida: "4.4", "Sort reviews by", "09/28/2026", "Strumppaketen var så roliga …";
         D/land-NO-NOB.json: "4,4 av 5 · 11 anmeldelser", "Sokkepakkene var så morsomme å gi i gave …".
Förslag: Judge.me:s widgetöversättning för nb ("Sort reviews by") och datumformat i Judge.me-inställningarna.
Vem:     byggarsessionen (Judge.me-avstämningen 1/10)
```

```
G-C-nb-09 🟡  Fraktmejlen nb: "Bestilling levert" (Shopifys egna mallar, inte våra)
Vad:     Stavfel "motatt" (ska vara mottatt) och "enda" där bokmål skriver "ennå".
Bevis:   D/mejl-nb.json levererad_order: "Har du ikke motatt bestillingen din?"; levererad_forsandelse och
         levererad_order: "Har du ikke mottatt pakken din enda?". updatedAt None, alltså Shopifys standardöversättning.
         Våra tre mallar (Pakken din er på vei / Ny info om pakken din / Pakken kommer i dag) är felfria.
Förslag: Egen nb-översättning av de två leveransmallarna via translationsRegister, som för de tre andra, eller låt
         dem vara (Shopifys text).
Vem:     byggarsessionen
```

```
G-C-nb-10 🟡  NO (A) + NOB (B) kassan: butiksnamnet "Matstrumpor.se"
Vad:     Kassans rubrik säger "Matstrumpor.se Checkout" (A) och "Matstrumpor.se Utsjekking" (B). Loggan och resten av
         sajten säger "Matstrumpor" utanför Sverige. Det är inte fel mot B-regeln, för det pekar på Sverige och inte
         på Norge. Men det är det enda .se-namnet kunden möter på B-sidan före betalningen.
Bevis:   D/land-NO.json kassa.rader[2]; D/land-NO-NOB.json kassa.rader[2].
Förslag: Butikens namn i Shopify (Settings → Store details) styr texten, och det gäller alla marknader. Det är Axels val.
Vem:     Axel
```

## 🔵

```
G-C-nb-11 🔵  NO + NOB 005, 006, 007: jag-berättelser av en AI-röst (bekräftar G-B07)
Vad:     007 "Jeg startet dette firmaet av ren frustrasjon" och 005/006 "Mamma sa det var favorittgaven hennes. Tenk, hun
         vil allerede ha flere." är förstapersonsvittnesmål från en påhittad person. Norsk markedsføringslov
         (§ 6–7 villedende handelspraksis) och Forbrukertilsynet är stränga mot påhittade omdömen och grundarhistorier.
         Sajten märker redan sina bilder "Miljøbildene er AI-genererte illustrasjoner." Annonserna gör det inte.
Förslag: Axel avgör. Alternativ: A) behåll, B) stryk "Jeg startet dette firmaet …", C) märk videorna som AI.
```

```
G-C-nb-12 🔵  Erbjudandet och förpriset i Norge
Vad:     "Kjøp 1 – Få 1 GRATIS" står som paketets fasta rubrik, med förpriset "1 056 kr" överstruket mot 469 kr.
         I Norge ska ett förpris vara ett pris som faktiskt tagits (prisopplysningsforskriften / Forbrukertilsynets
         veiledning, lägsta pris de senaste 30 dagarna vid rabatt), och "gratis" i ett permanent 2-för-1-erbjudande
         kan ses som vilseledande. Ingen språkfråga, men den gäller varje norsk kund.
Bevis:   D/land-NO.json paket: "nu": "469 kr", "forr": "1 056 kr", "Kjøp 1 – Få 1 GRATIS", "Du får 2 bokser – betaler for 1".
Förslag: Axel avgör om förpriset i NOK har tagits. Hellre en fråga än en gissning.
```

```
G-C-nb-13 🔵  A/B-testet mäter mer än raden "Et svensk merke."
Vad:     Enligt README är raden enda skillnaden. Mätt: A tappar språket i korgen och kassan (G-C-nb-01), och A visar
         Judge.me på svenska medan B visar recensionerna översatta till norska (G-C-nb-08). En skillnad i utfallet
         går då inte att lägga på raden.
Förslag: Rätta 01 och gör recensionsrutan lika innan testet startas, eller läs resultatet med den reservationen.
```

## Mätt och rätt (inga fynd)

- **B-regeln:** ingen annons och ingen text på matstrumpor.no säger "norsk", "norsk merke" eller "fra Norge".
  - Sökt i hela D/land-NO-NOB.json. "Norge" förekommer bara i "Fri frakt til Norge" och i landlistan.
  - Sidfoten säger "Matstrumpor drives av STONEBITE ECOM AB, Org.nr 559576-2401", alltså ett svenskt bolag.
  - NOB-annonserna saknar "Et svensk merke." som beslutat.
- **"Et svensk merke."** i NO: rätt ord ("merke"). Inget "laget/produsert/designet i Sverige" någonstans.
- **Förbjudet i annonserna:** inget butiksnamn, ingen domän, inget pris, ingen moms- eller tulltext.
  - Gäller rubrik, brödtext, länkbeskrivning, undertexter, bildtexter och bild 008.
  - Svenska ord i bild eller tal: inga (OCR:ens "Skriv in"/"står" på spårningssidan är norska ord).
- **Erbjudandet mot korgen:**
  - Talet i 002/003 "to bokser til prisen av én" och länkbeskrivningen "Kjøp 1, få 1" stämmer med paketet "Kjøp 1 – Få 1 GRATIS" (469 kr).
  - 008:s "Kjøp 2 – få 2 gratis, tjue par sokker" stämmer med korgen: 4 bokser, 2 betalda, 938 NOK, 4 par pinnar (D/land-NO.json korg).
- **Leveranslöften:**
  - Inga datum i annonserna. "De ble utsolgt i november (i fjor)" är samma påstående som sajtens "I fjor ble sushiboksen utsolgt i november."
  - Julstrumpan i 001/003 lovar ingen leverans till jul. Julestrømpe är en känd sed i Norge, så julvinkeln passar.
- **Format:** "469 kr", "1 056 kr", "938,00 kr", "Beregnet levering 7. oktober – 14. oktober", "5–10 virkedager". Allt är norskt format på produktsidan och i B:s kassa.
- **Tilltal:** "du" genomgående i annonser, sajt, spårning och mejl.
- **004 (012v2):** sju rutor på idiomatisk norska ("Fake-pizzaen er sokker.", "Fire sorter. Velg én hver.").
- **005/006:** hook och rubriker på bra norska ("Stopp! Ikke kjøp sushisokker før du har sett dette", "BESTILL NÅ").
  - Talet täcker manus 0,96–0,98 (bortsett från G-C-nb-07 d).
- **Spårningssidan** (.com/nb, .se/nb och .no) är norsk hela vägen. Ett påhittat nummer ger "Vi finner ikke det nummeret …" på norska (D/sparning-nb.json).
- **Våra tre fraktmejl** har rätt språk och bra norska ("Pakken din er på vei", "Ny info om pakken din", "Pakken kommer i dag").

## Kan inte mätas härifrån

- **Rösten med örat:** alla ljudfynd (G-C-nb-07) bygger på Whisper. Sokker/sukker ligger nära i norsk vokal (ɔ/ʉ).
- **Tonfall och läppsynk** i 001–003 (HeyGen) är inte bedömda. Granskaren har bara sett stillbilder och text.
- **Kassan efter adress:** fraktsats och totalsumma syns inte utan adress, och den skrivs aldrig in.
- **Hur en riktig webbläsare lägger i korgen:** D:s skript följde formuläret. Om temat öppnar en korglåda i stället för /cart i en riktig mobil är inte prövat. B stannade på produktsidan och A gick till /cart.
- **Spoks-flödena på norska** och Judge.me:s översättning efter 1/10.

---

# Bilaga: Del C — språket (da)


Granskare: infödd dansk läsare och marknadsförare, läs-bart. Granskat 2026-09-30 ur insamlad data (inga nätanrop).
Källor: `A/annonser.json` (Meta 2026-09-30), `B/transkript/DK-00*.txt`, `B/bildtext/DK-00*.txt`, `heygen/srt/DK/*.srt`,
`egna/DK/*.json`, `egna/d3/texter/DK.json`, `D/land-DK.json` (14:35 UTC), `D/sparning-da.json`, `D/mejl-da.json`,
`output/underlag-da.json` mot `underlag-sv.json`, svenska originalen i `transkript/` och `egna/*.manus.json`.

Summering: 🔴 2 · 🟡 7 · 🔵 5.
Rubrik, brödtext och länkbeskrivning i Meta är identiska med `annonser/DK.json` (`copy_diff` tomt på alla åtta).
"Et svensk mærke." står sist i brödtexten på alla åtta. Ingen butik, domän, moms- eller tulltext, inget "tillverkad i Sverige" och inget leveransdatum eller högtidslöfte finns i annonserna.

## 🔴 Stoppar

```
G-C-DA-01 🔴  DK 007 (MATSTRUMP_DK_sushi_gift_ugc_007_v1, 120251777282560023, video 1841234493547593)
Vad:     Bekräftar G-B02. Produktordet "sokker" hörs som "sukker" (socker), eller med svenskt uttal ("socker"),
         i sex av sex repliker. På danska är sokker/sukker ett minimalt par. En dansk lyssnare kan höra
         "sushiformet sukker" (sushiformat socker), och slutetiketten blir "sushisukker".
Bevis:   B/transkript/DK-007.txt (Whisper medium, da låst): 0,0 s "så er sushi formet sukker det sødeste",
         13,3 s "løber tør for er sukker", 16,1 s "umage sukker er hverdag", 22,9 s "det er sukker",
         38,5 s "Ligner sushi, men er socker.", 40,5 s "Sushi-socker." (täckning 0,0).
         Manus egna/DK/s001h1.json: "sokker" / "Sushisokker". Att Whisper skriver den SVENSKA stavningen
         "socker" två gånger tyder på att klonrösten säger ett svenskt [u] och inte ett danskt [ʌ].
         DK 005 och 006 (samma röstväg) hörs med "sokker".
Förslag: En människa lyssnar på de sex tidpunkterna. Hörs "sukker": gör om de repliker det gäller
         (fonetisk stavning i TTS eller en annan dansk röst) och kör seglyssna igen. Utförs aldrig av granskaren.
Vem:     byggarsessionen / Axel lyssnar
```

```
G-C-DA-02 🔴  DK, alla 8 annonser: korgen och kassan är på engelska
Vad:     Kunden läser produktsidan på danska. Efter "Læg i indkøbskurv" hamnar hen på /cart på ENGELSKA
         ("Your cart", "Real wooden chopsticks", "Sushi Socks", "Check out"), och kassan öppnas i en-DK
         ("Pay now", "Order summary", "FREE", "Shipping · Enter shipping address"). Kassans rubrik säger
         dessutom "Matstrumpor.se Checkout". Webbläsarens språk var da-DK. /da/cart finns och är dansk
         ("Din indkøbskurv", "Gå til betaling"), men kunden skickas inte dit.
Bevis:   D/land-DK.json, mätt 2026-09-30T14:35 UTC: efter_lagg_i.url "https://matstrumpor.com/cart",
         html_lang "en", produktsidans_root "/da/"; texter.korg_dit_kunden_hamnar "Your cart" … "Check out";
         kassa.url ".../checkouts/cn/…/en-dk", lang "en-DK", rader "Matstrumpor.se Checkout", "Pay now";
         lokaliserad_korg "/da/cart" html_lang "da".
         Summan stämmer: 686,00 DKK, 4 lådor varav 2 betalda, 4 par ätpinnar (korg.lador_strumpor 4,
         betalda_lador 2, pinnar 4). Det är språket som är fel, inte erbjudandet.
Förslag: Låt "Læg i indkøbskurv" gå till kundens locale-rot (/da/cart), så att kassan öppnas på da-DK.
         Mät samma sak på alla språk (troligen samma fel överallt, del D). Utförs aldrig av granskaren.
Vem:     byggarsessionen
```

## 🟡 Bör rättas

```
G-C-DA-03 🟡  DK 001–007 brödtext (samma text i alla sju videoannonser)
Vad:     Två meningar låter översatta och kan läsas fel.
         (1) "Ingen gemmer en sjov gave." säger "ingen sparar en rolig present". Originalet menar en
             skämtpryl (produktsidan har det rätt: "Ingen gemmer på en sjov gimmick"). Som den står talar
             meningen emot produkten, som ju ÄR en rolig present.
         (2) "Den ligger ikke i æsken bagefter." "Den" kan syfta på "en æske" i meningen före, alltså
             "lådan ligger inte i lådan". Det är oklart att det är strumporna/presenten som menas.
Bevis:   A/annonser.json, brodtext för DK 001–007: "Ingen jubler over vaskemiddel. Ingen gemmer en sjov gave. …
         Den ligger ikke i æsken bagefter. Den ligger på fødderne, uge efter uge."
         Svenska: "Ingen jublar åt tvättmedel. Ingen sparar en skämtpryl." (underlag-sv, produktsidan).
Förslag: T.ex. "Ingen gemmer på en jokegave." och "Sokkerne bliver ikke liggende i æsken. De sidder på
         fødderne, uge efter uge." Ny rad skrivs av sonnet i rättningssessionen (CLAUDE.md regel 6).
Vem:     byggarsessionen
```

```
G-C-DA-04 🟡  DK 004 (MATSTRUMP_DK_sushi_gift_anim_004_v1, 120251773838480023), bildtext 2
Vad:     "Den fake er sokker." är inte naturlig danska: "fake" används som substantiv med "den" framför.
         Norskan har samma ruta rätt ("Fake-pizzaen er sokker."). Ruta 5 saknar slutpunkt, till skillnad
         från de andra rutorna.
Bevis:   egna/DK/012v2.json: "Den fake er\nsokker.", "Bor i skuffen med\nde almindelige"; OCR i
         B/bildtext/DK-004.txt 2–4 s "Den fake er | sokker.". Jämför egna/NO/012v2.json "Fake-pizzaen\ner sokker.".
Förslag: "Fakepizzaen\ner sokker." Ruta 5 "Bor i skuffen med\nde almindelige." (om rutan rymmer punkten).
Vem:     byggarsessionen
```

```
G-C-DA-05 🟡  DK 005, 006, 007 (röstvideorna), manus och undertext
Vad:     Tre ordagranna översättningar (kalker) som en dansk inte säger:
         - "hvor giveren er den smarte" (005 39,3 s, 006 35,1 s): kalkerat på svenskans "där givaren är den smarta".
         - "uden at prøve for hårdt" (007 35,2 s): engelskans "trying too hard".
         - "Fire looks, der virkelig narrer øjet totalt." (001 13,6 s): "virkelig … totalt" upprepar samma sak.
         Allt går att förstå, men det låter maskinöversatt.
Bevis:   egna/DK/haikuh3.json, haikuh2.json, s001h1.json; heygen/srt/DK/matstrumpor_nathalie.srt. Whisper hör
         alla tre ordagrant (B/transkript/DK-001/005/006/007.txt).
Förslag: T.ex. "den slags gave, hvor det er giveren, der ser klog ud", "uden at gøre for meget ud af det",
         "Fire looks, der virkelig snyder øjet." Rättningen kostar ny röst (ElevenLabs/HeyGen). Värt det bara vid nästa rendering.
Vem:     Axel avgör om det är värt en rendering
```

```
G-C-DA-06 🟡  DK 001 (120251767917830023), repliker att lyssna på (nyanserar G-B05)
Vad:     Utöver #4 "livret" (hört "Sliurad", 0,20) hör Whisper två ställen där betydelsen skulle ändras
         om det verkligen låter så:
         #8 manus "den bruges år efter år" → hört "den bruges af og til" ("används då och då"): motsatt budskap.
         #5 "spisepinde i træ" → hört "speedspin i 3".
         "julestrømpen" hörs "julestrømken".
Bevis:   B/transkript/DK-001.txt, seglyssna mot heygen/srt/DK/matstrumpor_nathalie.srt, snitt 0,758 (lägst av DK:s videor).
Förslag: Lyssna på 7,9–9,2 s, 9,2–13,4 s och 19,9–22,2 s. Om "af og til" hörs: gör om den repliken.
Vem:     Axel / byggarsessionen lyssnar
```

```
G-C-DA-07 🟡  Sajten (produktsidan, meny/trust-raden, FAQ): "30 dages fortrydelsesret"
Vad:     "Fortrydelsesret" är den danska lagens term (forbrugeraftaleloven, 14 dagar). När den används om
         30 dagar lovar butiken en lagstadgad ångerrätt i 30 dagar. Då får den inte kräva att varan är
         oanvänd, har lapparna kvar och ligger i originalförpackningen, vilket retur-policyn gör. Kunden får
         bara stå för en eventuell värdeminskning. Svenskans "öppet köp" är ett frivilligt löfte, och den
         nyansen försvinner i översättningen. Sidan lovar också "ingen dumme spørgsmål"/"ingen opfølgende spørgsmål".
Bevis:   D/land-DK.json texter: "30 dages fortrydelsesret" (annonsrad, trustrad), "30 dages fortrydelsesret.
         Virker det ikke, sender du det bare tilbage – ingen dumme spørgsmål."; underlag-da REFUND_POLICY:
         "ubrugt, med alle mærker intakte og i originalemballagen … Varer, der sendes tilbage … uden at der først
         er anmodet om retur, accepteres ikke". Svenska: "30 dagars öppet köp".
Förslag: "30 dages returret" (vanligt i danska webbutiker) på alla ställen, så att lagtermen bara gäller de
         lagstadgade 14 dagarna. Axel avgör om villkoren ska vara så generösa som texten lovar.
Vem:     Axel (löftet) / byggarsessionen (texten)
```

```
G-C-DA-08 🟡  Sajten, paketväljaren: brickan "Mest gratis"
Vad:     "Mest gratis" är ingen dansk fras (ordagrant "mest gratis"). Samma som i svenskan, men på danska låter det fel.
Bevis:   D/land-DK.json paket[1].bricka "Mest gratis"; underlag-da paket.*-4.bricka "Mest gratis".
Förslag: "Bedste tilbud" eller "Mest for pengene".
Vem:     byggarsessionen
```

```
G-C-DA-09 🟡  Sajten, format (kosmetiskt)
Vad:     (1) Priset skrivs på två sätt på samma sida: "343,00 kr" (köprutan, korgen) och "343 kr." (paketväljaren).
         (2) Judge.me-rutan har en engelsk rad "Sort reviews by", betyget "4.4" med decimalpunkt och
             datumet "09/28/2026" i amerikanskt format. Recensionerna på svenska är ett känt beslut och räknas inte här.
Bevis:   D/land-DK.json texter.produktsida: "343,00 kr", "343 kr.", "Sort reviews by", "4.4", "09/28/2026".
Förslag: Ett prisformat i temat (dansk norm "343,00 kr." eller "343 kr."). Judge.me: widgetens språk och datum
         i appens inställningar, rörs efter Axels ok.
Vem:     byggarsessionen
```

## 🔵 Frågor och idéer

```
G-C-DA-10 🔵  DK 003 (julvinkeln) och DK 001 ("julestrømpen")
Vad:     Julstrumpan är ingen stark tradition i Danmark (klapparna ligger under granen, och ordet "julesok" är
         lika vanligt). Vinkeln fungerar som skämt men träffar inte en vana. Inget löfte om att det kommer
         fram till jul finns, så det är inget fel.
Bevis:   heygen/srt/DK/matstrumpor_sofie_h2.srt "den eneste sushi, der faktisk hører hjemme i en julestrømpe";
         nathalie.srt "gem dem til julestrømpen".
Förslag: Låt datan avgöra, 003 mot 002. Ingen ändring nu.
Vem:     Axel
```

```
G-C-DA-11 🔵  DK 007: "Jeg startede det her firma af ren frustration."
Vad:     Bekräftar B:s 🔵. En AI-röst säger att hon startade företaget, medan bilden visar flera olika AI-personer.
         Samma påstående finns i svenskan ("Jag startade Matstrumpor ur en ilska"). På danska är det ingen
         lagfråga, men det kan läsas som ett personligt vittnesmål som inte är sant.
Bevis:   egna/DK/s001h1.json segment 2; B/bildtext/DK-007.txt.
Förslag: Axel avgör om repliken får stå.
Vem:     Axel
```

```
G-C-DA-12 🔵  DK 006: omvänd psykologi i hooken
Vad:     Den talade första repliken "Tre grunde til, at du ikke skal købe sushisokker." följs bara av skäl att
         köpa. Bildrutan samtidigt ("Stop! Køb ikke sushisokker, før du har set det her") gör skämtet tydligt,
         men den som bara lyssnar kan fastna. Det är samma som i svenskan.
Bevis:   egna/DK/haikuh2.json segment 1 och texter.hook.
Förslag: Ingen ändring. Notera det om 006 presterar sämre än 005.
Vem:     Axel
```

```
G-C-DA-13 🔵  Fraktpolicyn nämner importavgift
Vad:     Policyerna ingår inte i granskningen, men den danska fraktpolicyn säger att kunden kan få betala en
         avgift vid import. Det krockar med ordern att ingen tulltext ska finnas, och med att Danmark ligger inom EU.
Bevis:   underlag-da sida.fraktpolicy.body_html: "Sendes ordren fra vores udenlandske lager, kan du også komme
         til at skulle betale et gebyr ved import."
Förslag: Axel avgör om meningen ska bort på alla språk.
Vem:     Axel
```

```
G-C-DA-14 🔵  DK 008 och videorna: "boks" och "æske"
Vad:     Bildannonsen och sajten säger "boks/bokse", videorna och brödtexten "æske/æsker". Båda är korrekt danska.
Bevis:   A/annonser.json 008 "Du får fire bokse"; 001–007 "en æske, der ligner rigtig takeaway".
Förslag: Ingen ändring krävs. Välj ett ord vid nästa omskrivning.
Vem:     byggarsessionen
```

## Stämmer, prövat
- 008: bilden och texten säger "Køb 2 – få 2 gratis", 20 par och fyra lådor. Korgen gav 4 lådor, 2 betalda, 686,00 DKK och 4 par ätpinnar ("en i hver boks" stämmer).
- 001–007: länkbeskrivningen säger "Køb 1 – Få 1 GRATIS", och paketet finns (343 kr för 2 lådor, förvalt). 002/003 säger "to æsker til prisen af én", vilket stämmer.
- 004: Whisper-raden "Mange tak fordi du så med i denne video!" är en hallucination på musik. Videon har ingen röst, och den svenska källan gav samma sorts rad ("Tack för att du har tittat!"). Det är inget fynd.
- Fraktmejlen (tre egna notiser): naturlig danska, inget leveransdatum, ingen tull. De två "levererad"-notiserna är Shopifys standardöversättning ("trackingnummer"), och de fungerar.
- Spårningssidan /da/pages/spara: dansk rubrik, och ett påhittat nummer ger "Vi kan ikke finde det nummer" på danska. Detektorns "står" är danska, inte svenska.
- "Forventet levering 7. oktober – 14. oktober" = 5–10 hverdage från 30/9. Det är inget högtidslöfte, och fars dag/jul-raderna är tomma på danska.

## Kan inte mätas härifrån
- Hur 007, 001, 002 och 003 faktiskt LÅTER. Whisper är inte facit, och sokker/sukker samt "år efter år"/"af og til" kräver ett mänskligt öra.
- Om kassan på riktigt öppnas på engelska för en kund med dansk IP. Mätt med simulerat land (?country=DK) från en amerikansk utgång, men /cart saknar locale-prefix, så det är sannolikt samma.
- Om bildrutorna i 004 syns rätt i hela sin längd. Det bygger på OCR och B:s kontaktark, och överlappen står i G-B04.
- Spoks mejlflöden på danska (inte i paketet).

---

# Bilaga: Del C — språket (fi)


Granskare: infödd finsk läsare + marknadsförare (kuluttajansuojalaki, hinnanilmoitusasetus). Läs-bart, inget nätanrop, inget rättat.
Underlag (allt insamlat 2026-09-30 av del A/B/D): `A/annonser.json` (FI 001–008, alla PAUSED), `B/transkript/FI-00*.txt`, `B/bildtext/FI-00*.txt`, `B/fynd.md`, `D/land-FI.json` (mätt 14:06 UTC), `D/sparning-fi.json`, `D/mejl-fi.json`, repots `heygen/srt/FI/*.srt`, `egna/FI/*.json`, `egna/d3/texter/FI.json`, `annonser/FI.json`, `output/underlag-fi.json` mot `underlag-sv.json` och de svenska källorna i `transkript/` och `egna/*.manus.json`.
Whisper är inte facit: där ett fynd bygger på vad som hörs står det "lyssna".

## 🔴 Stoppar kampanjen

```
G-C-fi-01 🔴  FI, köpvägen efter annonsen (alla 8 FI-annonser länkar hit)
Vad:     En finsk kund som trycker "Lisää ostoskoriin" hamnar i en ENGELSK varukorg och en ENGELSK kassa.
         Kassan heter "Matstrumpor.se Checkout" och landlistan börjar med "Sweden".
Bevis:   D/land-FI.json → efter_lagg_i: {"url":"https://matstrumpor.com/cart","html_lang":"en","produktsidans_root":"/fi/"}
         (riktig klicknavigering, D/kund.mjs rad 119–121); texter.korg_dit_kunden_hamnar: "Your cart", "Continue shopping",
         "Estimated total", "Check out"; kassa.url ".../checkouts/cn/…/en-fi", kassa.lang "en-FI", kassa.rader: "Matstrumpor.se Checkout",
         "Country/Region", "Sweden", "Australia" …, "Pay now".
         Samma sida på finska finns och fungerar: korg_lokaliserad (/fi/cart, html_lang fi): "Ostoskorisi", "Kassa".
         Samma mönster i DK, ES, IT, NL, NO(A), PL, PT, DE, AT, BE, NZ (efter_lagg_i → /cart, kassa en-XX) — gäller alltså inte bara FI.
Förslag: Låt paketväljarens "lägg i korgen" gå till språkmappens korg (Shopify.routes.root + 'cart', alltså /fi/cart), så att kassan öppnas som fi-FI.
         Läs sedan kassan som finsk kund. Del D äger mätningen; här är det språkfelet på köpvägen. Utförs aldrig av granskaren.
Vem:     byggarsessionen (temats ms-paket-js)
```

## 🟡 Bör rättas

```
G-C-fi-02 🟡  FI 001, 002, 003 (HeyGen: …_ugc_001_v1 120251767830080023, …_ugc_002_v1 120251767833370023, …_jul_ugc_003_v1 120251767836390023)
Vad:     Produktordet "sushi" hörs som "susi" (= varg) i alla tre HeyGen-videorna, och i 003 som "surssi". "Puikot" hörs som "poikot" i 003.
         Blir 🔴 om örat hör samma sak: "susisukat" betyder vargsockor. (Finländare uttalar ibland š som s, så det kan låta naturligt.)
Bevis:   B/transkript/FI-001.txt 00:09.84 "Kymmenen susipalaa"; FI-002.txt 00:00.00 "…oikea susia … viisi paria susisukkia";
         FI-003.txt 00:00.00 "…ainoa surssi, joka oikeasti kuuluu joulusukkaa", 00:04.02 "surssisukkia … syömäpoikot", 00:10.88 "poikot".
         Kontroll: samma Whisper hör "sushiksi"/"sushisukkia" rätt i ElevenLabs-videorna FI-005/006/007.
         Undertexterna i bild säger rätt ("sushipalaa", "sushisukkia", OCR i B/bildtext/FI-001..003).
Förslag: Lyssna på 001 9,8 s, 002 0–10 s, 003 0–11 s. Hörs "susi/surssi": rendera om med uttalet tvingat (t.ex. "suši"/"sušisukat" i HeyGens text). Utförs aldrig av granskaren.
Vem:     byggarsessionen / Axel lyssnar
```

```
G-C-fi-03 🟡  FI 001 (MATSTRUMP_FI_sushi_gift_ugc_001_v1, 120251767830080023)
Vad:     (a) "Hauska avata ja käytössä vuodesta toiseen" är ogrammatiskt (adjektiv + lokativ ihopkopplade med "ja") och hörs som
         "köyhtys vuodesta toisaajasta" (bekräftar G-B05). (b) Öppningen "Tässä on merkkisi" är en ordagrann kalk av "Det här är ditt tecken";
         på finska läses "merkki" lika gärna som "märke", och brödtexten slutar med "Ruotsalainen merkki" (= svenskt märke), så
         kunden kan höra "här är ditt märke". (c) "Nämä myytiin loppuun marraskuussa" i första meningen, sagt i september, kan läsas som
         i år; först slutet säger "viime vuoden marraskuussa". Svenska originalet har samma ordning.
Bevis:   heygen/srt/FI/matstrumpor_nathalie.srt rad 1 och 3; B/transkript/FI-001.txt #3 täckning 0,69.
Förslag: (a) "Hauska avata ja käytössä vuodesta toiseen" → t.ex. "Hauska avata, ja niitä käytetään vuodesta toiseen." (b) "Tämä on merkki sinulle."
         (c) "Viime vuonna nämä myytiin loppuun marraskuussa." Ny text skrivs av sonnet i rättningssessionen (CLAUDE.md regel 6).
Vem:     byggarsessionen (HeyGen-omrendering kostar; Axel avgör om repliken klarar sig)
```

```
G-C-fi-04 🟡  FI 001–007, brödtexten (samma i alla sju videoannonserna)
Vad:     Tre språkfel i en annars bra text:
         - "5 paria rullattu kuin maki" saknar kongruens → "5 paria, rullattuna kuin maki".
         - "Se ei jää laatikkoon. Se on jalassa" — "se" syftar grammatiskt på närmaste substantiv "laatikko", så det står
           "lådan stannar inte i lådan, lådan sitter på foten". Sockorna är plural: "Ne eivät jää laatikkoon. Ne ovat jalassa".
         - "sushi-noutolaatikolta" skrivs utan bindestreck på finska: "sushinoutolaatikolta" (eller "sushin noutolaatikolta").
Bevis:   A/annonser.json FI 001–007 brodtext rad 2–3; annonser/FI.json copy.message.
Förslag: Rätta de tre ställena; ny rad av sonnet i rättningssessionen. Utförs aldrig av granskaren.
Vem:     byggarsessionen
```

```
G-C-fi-05 🟡  FI 003 rubrik + sajtens paketväljare/FAQ
Vad:     "Osta 1 – Saat 1 ILMAISEKSI": versalt S mitt i meningen efter tankstrecket är fel på finska (svenskans "Få" är kalkerat).
Bevis:   A/annonser.json FI 003 rubrik "Osta 1 – Saat 1 ILMAISEKSI."; land-FI.json paket[].rubrik "Osta 1 – Saat 1 ILMAISEKSI",
         "Osta 2 – Saat 2 ILMAISEKSI"; FAQ "Miten Osta 1 – Saat 1 toimii?"; underlag-fi.json paket.*.rubrik (10 rader).
         Brödtexten i 008 skriver rätt: "Osta 2 – saat 2 ilmaiseksi".
Förslag: "Osta 1 – saat 1 ILMAISEKSI" överallt. Utförs aldrig av granskaren.
Vem:     byggarsessionen
```

```
G-C-fi-06 🟡  Sajten, produktsidans text (/fi/products/sushi-strumpor)
Vad:     "tämä on hauska tänä iltana ja jaloissasi huomenna" — "jaloissasi" betyder "i vägen för dina fötter / under fötterna".
         Rätt är "jalassasi" (på dig, på foten). Annonsrubriken säger rätt: "Jalassa huomenna."
Bevis:   D/land-FI.json texter.produktsida: "…Sinun ei tarvitse valita: tämä on hauska tänä iltana ja jaloissasi huomenna."
Förslag: "…tänä iltana ja jalassa huomenna." Utförs aldrig av granskaren.
Vem:     byggarsessionen
```

```
G-C-fi-07 🟡  Sajtens sidfot
Vad:     "Matstrumpor:tä ylläpitää" — partitiv med kolon fungerar inte på ett namn som slutar på konsonant (ska vara "Matstrumporia").
         Naturligare: "Verkkokauppaa ylläpitää STONEBITE ECOM AB".
Bevis:   land-FI.json texter.produktsida "Matstrumpor:tä ylläpitää", "STONEBITE ECOM AB"; underlag-fi.json
         temagrupp.footer-group.footer.foretaget.subtext "Matstrumpor.se:tä ylläpitää".
Förslag: "Matstrumporia ylläpitää" eller "Verkkokauppaa ylläpitää". Utförs aldrig av granskaren.
Vem:     byggarsessionen
```

```
G-C-fi-08 🟡  Sajten: Judge.me-rutan på produktsidan
Vad:     Engelska och fel format i den finska rutan: "Sort reviews by" (engelska), "11 arvostelut" (fel kasus, ska vara "11 arvostelua",
         som rubriken ovanför säger), betyget "4.4" med punkt (Trustpilot-raden på samma sida: "4,2 / 5"), datumet "09/28/2026" (amerikanskt;
         finskt är 28.9.2026). Recensionerna på svenska är ett känt beslut (punkt 8) och räknas inte här.
Bevis:   land-FI.json texter.produktsida: "4.4", "11 arvostelut", "Sort reviews by", "09/28/2026", jämför "11 arvostelua".
Förslag: Judge.me → Settings → språk/datumformat för fi. Kontrollera när Judge.me:s översättning (48 h från 29/9) är klar.
Vem:     byggarsessionen / Axel (Judge.me-panelen)
```

```
G-C-fi-09 🟡  Fraktmejlet "Pakettisi on matkalla" (fi)
Vad:     "Tilauksesi … on lähtenyt varastolta" — fel kasus; ska vara "varastosta" (från lagret).
Bevis:   D/mejl-fi.json notiser.fraktbekraftelse.brodtext; källan mejl/sprak/fi.json.
Förslag: "on lähtenyt varastosta". Utförs aldrig av granskaren.
Vem:     byggarsessionen
```

```
G-C-fi-10 🟡  Sajten: prisformatet
Vad:     Samma sida skriver pris på två sätt: "€44,90" (Normaalihinta, korgen, "arvo €11,80") och "44,90 €" (paketväljaren).
         Finskt format är "44,90 €".
Bevis:   land-FI.json texter.produktsida: "Normaalihinta", "€44,90", sedan "44,90 €", "101,60 €", "arvo €11,80"; korg_lokaliserad "€89,80 EUR".
Förslag: Valutaformatet för EUR i fi (Shopify → marknadens valutaformat / temats money-filter). Utförs aldrig av granskaren.
Vem:     byggarsessionen
```

```
G-C-fi-11 🟡  FI 008 (MATSTRUMP_FI_sushi_offer_static_008_v1, 120251779447420023), underrubriken i bild
Vad:     "Näyttää noutoruoalta. On 20 paria sukkia." — andra meningen saknar subjekt och låter avhuggen på finska.
Bevis:   B/bildtext/FI-008.txt; egna/d3/texter/FI.json underrubrik.
Förslag: "Näyttää noutoruoalta. Sisällä 20 paria sukkia." Ny rad av sonnet. Utförs aldrig av granskaren.
Vem:     byggarsessionen
```

```
G-C-fi-12 🟡  Spårningssidan /fi/pages/spara, svaret på ett okänt nummer
Vad:     "Saitko toimitusviestin juuri? Silloin paketti on tulossa tänne" läses som "då är paketet på väg hit (till dig)", inte "då kommer
         paketet snart upp på den här sidan".
Bevis:   D/sparning-fi.json com.svar_pahittat.text.
Förslag: "Silloin paketin tiedot eivät ole vielä ehtineet tälle sivulle". Utförs aldrig av granskaren.
Vem:     byggarsessionen (sparning/sprak/fi.json)
```

## 🔵 Frågor till Axel / idéer

```
G-C-fi-13 🔵  Jämförpriset i paketväljaren (Finland är EU: hinnanilmoitusasetus 6 a §, Omnibus)
Vad:     Paketet "Osta 1 – saat 1" visar 44,90 € mot överstruket 101,60 €, "Osta 2 – saat 2" 89,80 € mot 203,20 €, samtidigt som
         "Normaalihinta €44,90" står för en låda. Det överstrukna priset är mer än två gånger normalpriset. I EU ska ett överstruket
         "förra pris" vara det lägsta priset de senaste 30 dagarna, och finska KKV granskar just detta.
Bevis:   land-FI.json paket[0] nu "44,90 €", forr "101,60 €"; paket[1] nu "89,80 €", forr "203,20 €"; texter "Normaalihinta", "€44,90".
Förslag: Axel avgör om jämförpriset ska stå kvar i EU-marknaderna. Ingen ändring görs av granskaren.
```

```
G-C-fi-14 🔵  FI 003, julvinkeln
Vad:     Julstrumpan är inte en finsk sed; i Finland kommer julklapparna ur joulupukkis säck (pukinkontti) på julafton.
         001 är därför väl lokaliserad ("laita pukinkonttiin"), medan 003 bygger hela öppningen på "joulusukkaan". Det förstås,
         men känns importerat. Inget leveranslöfte till jul finns (rätt).
Bevis:   heygen/srt/FI/matstrumpor_sofie_h2.srt rad 1; B/bildtext/FI-003.txt (julstrumpa i bild 2–3 s).
Förslag: Axel avgör om 003 ska gå i Finland eller om 001/002 räcker.
```

```
G-C-fi-15 🔵  FI 007, grundarpåståendet (bekräftar G-B07)
Vad:     "Perustin tämän firman pelkästä kiukusta." = "Jag grundade det här företaget av ren ilska", i första person, sagt av AI-röst
         över flera olika AI-personer. Butiksnamnet är borttaget (rätt). Påståendet är lika starkt på finska som på svenska.
Bevis:   egna/FI/s001h1.json segment 2; B/transkript/FI-007.txt 00:04.98.
```

```
G-C-fi-16 🔵  Sajten: fasta kundcitat översatta
Vad:     Startsidans "Mitä asiakkaat sanovat" visar svenska kunders recensioner översatta till finska under rubriken "Vahvistetut ostokset"
         ("Tosi hienot hauskassa pakkauksessa! Nopea toimitus" – Wide Pia). En finsk läsare tror att en finsk kund skrivit det.
Bevis:   underlag-fi.json tema.index.omdomen.eyebrow + r1–r4.
Förslag: Axel avgör om citaten ska märkas som översatta ("käännetty ruotsista").
```

```
G-C-fi-17 🔵  Småsaker utan dom
- Presentkortets varianttext i fi-underlaget är "150,00 kr" (SEK). Om presentkortet syns för finska kunder är det en svensk rest; synligheten är inte mätt.
  Bevis: underlag-fi.json optionvarde.presentkort.name.
- Spårningssidan ligger på /fi/pages/spara (svenskt ord i adressen). Bevis: sparning-fi.json com.url.
- Kundtjänstadressen är kundsupport@matstrumpor.se på sajten, i mejlen och på spårningssidan (svenskt ord + .se). Bevis: land-FI.json, mejl-fi.json.
```

## Det som mättes och var rätt

- **Inget förbjudet i annonserna:** ingen butik eller domän i rubrik, brödtext, länkbeskrivning, tal eller bild (FI 001–008). Ingen moms- eller tulltext (`momsrader: []`, `korg_momsrader: []`).
- **"Ruotsalainen merkki." = "svenskt märke/varumärke"**, inte "tillverkad i Sverige". Rätt.
- **Erbjudandet stämmer med korgen:** "kaksi rasiaa yhden hinnalla" (002/003) och "Osta 2, saat 2 ilmaiseksi" (008): korgen gav 4 lådor, 2 betalda (89,80 €), 4 par pinnar à 0 € (`land-FI.json → korg`). "Ilmainen toimitus Suomeen" stämmer med fraktrutan.
- **Leveranstid:** 5–10 arkipäivää på sajten, inget högtidslöfte (`liquid.ms-sista-dag.*` tomma i fi). "Arvioitu toimitusaika 7. lokakuuta – 14. lokakuuta" är räknat från 30/9.
- **Tilltal:** du-form (sinä) genomgående, konsekvent i annonser, videor, sajt och mejl.
- **Svenska rester i FI-annonserna:** inga. På sajten bara de kända svenska Judge.me-recensionerna.
- **Undertexterna i 001–003 och bildtexterna i 004–007** står i bild som i repot (OCR i B/bildtext). 012v2:s sju texter är idiomatiska ("Makunsa kullakin.", "Neljä makua. Valitse omasi.").
- **Mejlen:** tre egna fraktmallar på finska, finsk ämnesrad, spårningsknapp med MS-nummer, inga leveransdatum.

## Kan inte mätas härifrån

- **Ljudet med örat:** alla fynd om uttal (G-C-fi-02, 03) bygger på Whisper. En människa måste lyssna.
- **Läppsynk och tonfall** i HeyGen-videorna 001–003: bara stillbilder och transkript finns.
- **Kassan efter adressfältet** (fraktsätt, skatterader, betalsätt på finska): del D fyllde aldrig i en adress, och kassan var engelsk (G-C-fi-01).
- **Kassan på finska (fi-FI)** är aldrig läst, eftersom köpvägen inte leder dit.
- **Judge.me:s översättningar** kan komma inom 48 h från 29/9. Läget är från 30/9 14:06 UTC.
- **Presentkortets synlighet** för finska kunder.
- **Policyerna** ingår inte i del C.

---

# Bilaga: Del C — språket (en)


Granskare: infödd engelsk läsare (amerikansk, brittisk, australisk, kanadensisk och nyzeeländsk kund) + marknadsförare med konsumentlagen i ryggen (USA: FTC Act §5 och 16 CFR 255/465; UK: CPRs/DMCC Act 2024; AU: ACL).
Läst 2026-09-30, bara insamlat material, inga nätanrop. Källor:
- Annonstexter ur Meta: `A/annonser.json`, 16 annonser (US 001–008, WW 001–008). `copy_diff` är `{}` på alla 16, så Metas text är lika med `annonser/US.json`.
- Tal: `B/transkript/US-00n.txt`, `WW-00n.txt` (Whisper medium och seglyssna). Bild: `B/bildtext/…`, `B/fynd.md`.
- Repo: `heygen/srt/US/*.srt`, `egna/US/*.json`, `egna/d3/texter/US.json`, `output/underlag-en.json`. Svenska original: `transkript/*.srt`, `egna/*.manus.json`, `egna/bildtexter.sv.json`, `output/underlag-sv.json`.
- Sajten: `D/land-{US,GB,AU,CA,NZ}.json`, `D/sparning-en.json`. Mejlen: `D/mejl-en.json`.

WW bär exakt samma texter som US, och videorna är byte-identiska med US:s (`B/fynd.md` → "WW:s sju videor är byte-identiska med US:s men har egna video_id"). Varje fynd nedan gäller därför båda, om inget annat står.

Summa: **1 🔴, 10 🟡, 4 🔵.**

---

## 🔴

```
G-C-en-01 🔴  US 007 + WW 007 (MATSTRUMP_US_sushi_gift_ugc_007_v1 120251777332640023, MATSTRUMP_WW_sushi_gift_ugc_007_v1 120251778587120023)
Vad:     En AI-kvinnoröst säger i jagform att hon grundade varumärket. Det stämmer inte: bolaget är STONEBITE ECOM AB, och
         personerna i bild är AI-genererade. I USA är det en påhittad grundarberättelse och ett vittnesmål från en person
         som inte finns. FTC:s regel om falska recensioner och vittnesmål (16 CFR Part 465, i kraft sedan oktober 2024)
         förbjuder just det, och FTC Act §5 gäller vilseledande reklam. I UK gäller CPRs och DMCC Act 2024 (vilseledande
         handling). Det är ett falskt påstående i språkets egen mening, oavsett att samma rad gått i Sverige.
Bevis:   B/transkript/US-007.txt och WW-007.txt, 00:04.84–00:07.08, hört = manus:
         "I started this brand out of pure frustration."
         Manus egna/US/s001h1.json har samma rad, sv "Jag startade Matstrumpor ur en ilska." (egna/s001h1.manus.json).
         B/bildtext/US-007.txt: "AI-personer + produktklipp". egna/README.md rad 18: "s001h1 | AI-personer + produktklipp,
         hon berättar varför hon startade företaget". B-granskaren satte 🔵 (G-B07). Granskaren här höjer till 🔴 för
         de engelskspråkiga länderna, med lagstödet ovan.
Förslag: Byt de två första replikerna mot en berättelse som inte påstår att talaren grundat bolaget, till exempel
         "I always wait until the last minute to think of gift ideas." som öppning, utan meningen om varumärket.
         Ny rad skrivs av sonnet i rättningssessionen (regel 6), och bara det segmentet dubbas om (egna/dubba.mjs
         cachar resten). Alternativt behåller Axel annonsen utanför US och WW. Utförs aldrig av granskaren.
Vem:     byggarsessionen, med Axels beslut
```

## 🟡

```
G-C-en-02 🟡  US 006 + WW 006 (…_ugc_006_v1 120251777326060023 / 120251778581710023), 00:32.12–00:35.00
Vad:     Repliken "It's sure to get a reaction and a laugh." hörs av Whisper som "…and a lot". Samma mening i 005
         ("You'll get a reaction and a laugh, for sure.") hörs rätt, så det kan vara uttalet i just detta klipp.
         Utan "laugh" tappar repliken sin poäng. Talet går också ihop utan paus här ("Three you make them so happy mom
         said it was her favorite gift guess what…"), vilket tyder på ett pressat tempo (atempo).
Bevis:   B/transkript/US-006.txt #14, täckning 0.88: manus "It's sure to get a reaction and a laugh." / hört
         "It's sure to get a reaction and a lot". WW-006.txt är identisk (samma fil). US-005.txt #16 hört "and a laugh".
Förslag: Lyssna på 32–35 s. Hörs "a lot", dubba om just det segmentet (billigt, cache). Utförs aldrig av granskaren.
Vem:     byggarsessionen / Axel lyssnar
```

```
G-C-en-03 🟡  US 004 + WW 004 (…_anim_004_v1 120251773869430023 / 120251773875250023), textruta 5
Vad:     Ruta 5 "Lives in the drawer / with the rest" läses på engelska som att presenten blir liggande glömd i en låda.
         Det är precis det sajten och brödtexten använder som det negativa ("…then lives in a drawer"). Meningen i
         originalet är att strumporna ligger bland de vanliga strumporna och ändå aldrig blandas ihop (NO-versionen:
         "Bor i skuffen med / de vanlige"). Rutan saknar också punkt, till skillnad från rutorna 1–4 och 6–7.
Bevis:   egna/US/012v2.json texter[4] "Lives in the drawer\nwith the rest". Sajten, underlag-en.json →
         produkt.sushi-strumpor.body_html: "The funny present lasts one evening, then lives in a drawer."
         egna/NO/012v2.json texter[4] "Bor i skuffen med\nde vanlige".
Förslag: Till exempel "In the sock drawer. / Never mixed up." Skrivs av sonnet (regel 6). Rendering är gratis
         (rendera-012v2.py). Utförs aldrig av granskaren.
Vem:     byggarsessionen
```

```
G-C-en-04 🟡  WW 001–008 (kampanjen WW = GB, AU, CA, NZ)
Vad:     WW kör amerikansk engelska i länder som säger annat. "takeout" heter "takeaway" i UK, AU och NZ, "Mom" heter
         "Mum" och "favorite" stavas "favourite". Det går fram, men en brittisk eller australisk kund ser direkt att
         annonsen är gjord för USA. Sajten säger dessutom "takeaway", så annons och sida säger olika ord för samma sak.
Bevis:   A/annonser.json WW 001–007 brödtext: "a box that looks like real takeout". WW 008 / bildtext WW-008:
         "Looks like takeout. It's 20 pairs of socks." Tal WW-002/003: "packaged like a real takeout box";
         WW-005/006: "after giving them to my mom", "Mom said it was her favorite gift". WW-001: "favorite food and all".
         Sajten: underlag-en.json "looks like takeaway until you open it".
Förslag: Annonstexten (brödtext, 008:s bildtext) i en brittisk variant för WW: "takeaway", "favourite". Videorna
         kostar pengar att göra om, så låt dem vara. Utförs aldrig av granskaren.
Vem:     byggarsessionen / Axel (kostnaden)
```

```
G-C-en-05 🟡  US 008 + WW 008, sajten (produktsida och FAQ)
Vad:     Storleken anges bara i EU-storlek. En amerikansk, brittisk, australisk eller kanadensisk kund vet sällan vad
         "EU 36–44" betyder, och storlek är den vanligaste orsaken till tvekan och returer för strumpor.
Bevis:   A/annonser.json US/WW 008 brödtext: "One size, fits EU 36–44." Sajten land-US.json texter.produktsida:
         "Fits EU 36–44 · stretchy fabric", FAQ "One size fits most, roughly EU sizes 36–44."
Förslag: Lägg till en ungefärlig amerikansk och brittisk storlek bredvid. Byggaren räknar om ur en storlekstabell;
         granskaren anger inga tal. Utförs aldrig av granskaren.
Vem:     byggarsessionen
```

```
G-C-en-06 🟡  US 001–007 + WW 001–007, brödtext och rubrik 003
Vad:     "joke gift" är begripligt, men den etablerade engelska termen är "gag gift", och den står på sajten.
         Annonsen och produktsidan säger alltså två olika saker för samma begrepp.
Bevis:   A/annonser.json: "No one cheers for detergent. No one keeps a joke gift." och rubrik 003 "A joke gift that
         doesn't stay a joke." Sajten: "Nobody cheers for laundry detergent. Nobody keeps a gag gift."
Förslag: "gag gift" i brödtexten. Rubriken 003 kan behålla ordleken ("A gag gift that doesn't stay a gag.").
         Skrivs av sonnet (regel 6). Utförs aldrig av granskaren.
Vem:     byggarsessionen
```

```
G-C-en-07 🟡  Sajten, produktsidan (alla fem länder)
Vad:     Mellanrubriken "Looks like sushi. Is socks." saknar subjekt. Det låter översatt ("Är strumpor.").
         Fyndet redan noterat av d3-granskaren, men raden står kvar live.
Bevis:   land-US.json texter.produktsida: "Looks like sushi. Is socks." (mätt 2026-09-30 14:21 UTC). egna/d3/texter/
         US.json → sajt_fel: "Skriv 'Looks like sushi. It's socks.'"
Förslag: "Looks like sushi. It's socks." Utförs aldrig av granskaren.
Vem:     byggarsessionen
```

```
G-C-en-08 🟡  Sajten, FAQ på produktsidan och startsidan
Vad:     "Every pair arrives in gift packaging / in a gift box" är fel: lådan rymmer fem par, inte ett. En kund kan
         vänta sig en låda per par.
Bevis:   underlag-en.json tema.index.ms_faq.q3.a "Yes. Every pair arrives in gift packaging." och
         tema.product.ms_faq_section.q3.a "Yes. Every pair arrives in a gift box that looks like real food".
Förslag: "Every box arrives…" / "Every order arrives gift-ready." Utförs aldrig av granskaren.
Vem:     byggarsessionen
```

```
G-C-en-09 🟡  Kassan och Shopifys leveransmejl, alla fem länder
Vad:     Butiksnamnet "Matstrumpor.se" syns för utlandskunden. Kassans rubrik lyder "Matstrumpor.se Checkout", och
         Shopifys standardmejl om levererad order bär {{ shop.name }}, alltså samma namn. Det är en svensk domän som
         motsäger .com och loggan "Matstrumpor" på sidan.
Bevis:   land-US.json kassa.rader[2] "Matstrumpor.se Checkout", samma i land-GB/AU/CA/NZ.json kassa.rader[2].
         mejl-en.json → levererad_forsandelse / levererad_order: "{{ shop.name }} Order {{ order_name }}".
Förslag: Axels beslut om butikens namn i Shopify (Settings → Store details), kanske en översättning av shop.name.
         Rör inte skatteinställningar. Utförs aldrig av granskaren.
Vem:     Axel / byggarsessionen
```

```
G-C-en-10 🟡  Sajten, paketväljaren i AU, CA och NZ
Vad:     Valutan skrivs på tre sätt på samma sida. Priset står "A$102", men "Regular price $102.00" och "worth $22.00"
         står utan landsprefix. En kanadensare kan läsa "$22.00" som amerikanska dollar. GB har inte felet.
Bevis:   land-AU.json texter: "Regular price", "$102.00", "A$102", "A$226", "worth $22.00". land-CA.json: "$100.00",
         "CA$100", "worth $22.00". land-NZ.json: "$125.00", "NZ$125", "worth $26.00". land-GB.json: "£53.00", "£53",
         "worth £12.00".
Förslag: Samma format överallt (money_with_currency eller samma prefix). Utförs aldrig av granskaren.
Vem:     byggarsessionen
```

```
G-C-en-11 🟡  Fraktmejlet "Your parcel is on its way" (en)
Vad:     Adressblocket skriver postnumret före orten och saknar delstat/provins: "{{ zip }} {{ city }}". I USA, Kanada
         och Australien skrivs "City, State ZIP", och en adress utan delstat ser fel ut för kunden.
Bevis:   mejl-en.json → fraktbekraftelse.brodtext: "Delivering to {{ shipping_address.name }} {{ shipping_address.address1 }}
         {{ shipping_address.address2 }} {{ shipping_address.zip }} {{ shipping_address.city }}".
Förslag: För en: "{{ city }}, {{ province_code }} {{ zip }}". Utförs aldrig av granskaren.
Vem:     byggarsessionen (mejl/notis-oversattning.mjs)
```

## 🔵

```
G-C-en-12 🔵  US 005/006 + WW 005/006: "mamma"-vittnesmålet i AI-röst
Vad:     En AI-röst berättar i jagform att hon gav strumporna till sin mamma, och att "Mom said it was her favorite gift".
         Är rösten och historien påhittade gäller samma FTC-regel som i G-C-en-01 (vittnesmål från någon som inte
         finns eller inte haft upplevelsen). Den är mindre tydlig än grundarraden, men samma risk.
Bevis:   B/transkript/US-005.txt #2 "But after giving them to my mom, I realized three things." #14 "Mom said it was
         her favorite gift." egna/README.md rad 16: "klipp + svensk AI-kvinnoröst".
Fråga:   Är historien sann (en riktig kund)? Annars behåller Axel den, eller så skrivs den om till tredje person.
```

```
G-C-en-13 🔵  Datum, klockslag och "parcel"
Vad:     Sajten visar "Estimated delivery October 7 – October 14" för GB, AU och NZ, amerikansk ordning (UK: "7–14
         October"). Månaden är utskriven, så det går inte att missförstå. Fraktmejlen säger "parcel", där en amerikan
         säger "package". Spårningssidan visar "Updated today 13:58", ett 24-timmarsklockslag utan tidszon.
Bevis:   land-GB/AU/NZ.json texter; mejl-en.json ämnen "Your parcel is on its way", "Your parcel arrives today";
         sparning-en.json texter[5].
Fråga:   Kosmetiskt. Värt det bara om en separat en-GB-locale någon gång byggs.
```

```
G-C-en-14 🔵  Presentkortets valör på engelska
Vad:     Valören är översatt till "150,00 kr", med svensk decimal och valuta.
Bevis:   underlag-en.json optionvarde.presentkort.name "150,00 kr".
Fråga:   Syns presentkortet för en utlandskund? Om ja: valören i marknadens valuta eller dölj produkten utanför SE.
         Granskaren har inte mätt om sidan är nåbar (kan inte mätas nedan).
```

```
G-C-en-15 🔵  "They sold out in November" (001)
Vad:     Första repliken säger "They sold out in November." utan årtal. I en annons som går i oktober 2026 kan det
         läsas som att de redan sålt slut i år. Slutrepliken säger rätt "November last year", och sajten säger "Last
         year, the sushi box sold out in November." Sant enligt CLAUDE.md (sushilådan tog slut i november 2025).
Bevis:   heygen/srt/US/matstrumpor_nathalie.srt: "This is your sign. They sold out in November."
Fråga:   Godtagbart som det är. Rättas bara om 001 renderas om av annat skäl.
```

---

## Bekräftat eller nyanserat från del B (räknas inte igen)

- **G-B04 (004, rutor som överlappar):** gäller också US/WW. Rutorna 2 och 3 samtidigt ger "The fake? Socks." ovanpå "Double take. Belly laugh.", två punchlines samtidigt. Det gör skämtet svårare att läsa. Instämmer i 🟡.
- **G-B07 (007, grundarraden):** höjd till 🔴 för en, se G-C-en-01.
- **G-B09 (008, sex lådor i bild):** instämmer i 🔵. Texten "You get four boxes" och "20 pairs" står rätt.
- **G-B11 (1+1 i 002/003, 2+2 i 008):** korgen ger båda i alla fem valutor. Paketväljaren "Buy 1 – Get 1 FREE / You get 2 boxes – pay for 1" finns, och korgen för 2+2 gav 4 lådor + 4 par pinnar för US $138, GB £106, AU A$204, CA CA$200 och NZ NZ$250 (land-*.json → korg). Löftet "two boxes for the price of one" håller.
- **Whisper-avvikelser i 001:** "stuff for Christmas stocking" och "gets these" (manus "stuff a", "Gift these"). Bränd undertext (OCR) visar manusets ord, och täckningen är 0,92–1,0. Troligen Whispers fel, inget fynd.
- **007 "their socks":** Whisper stavar "they're" som "their". Det låter likadant och undertexten står rätt. Inget fynd.

## Rätt, inga fynd

- Ingen svensk text i annonserna, inget butiksnamn, ingen domän och ingen moms- eller tulltext. "A Swedish brand." är rätt formulering, inte "made in Sweden".
- Tilltalet är konsekvent "you". Stavningen i annonserna är konsekvent amerikansk.
- Julvinkeln (003, 001 "Christmas stocking") fungerar i alla fem länderna. Julstrumpan är sed i USA, UK, CA, AU och NZ. Ordleken "the only sushi that actually belongs in a stocking" (socks/stocking) fungerar bättre på engelska än i originalet.
- Betydelsen i 001–003 och 005–007 stämmer med de svenska originalen (transkript/*.srt och egna/*.manus.json), rad för rad. Undantagen är G-C-en-01 och -02.
- Brödtexten stämmer med sajtens svenska ingress ("Ingen jublar åt tvättmedel. Ingen sparar en skämtpryl.").
- Fraktrutan har rätt land och flagga i alla fem länderna ("Free shipping to the United States / the United Kingdom / Australia / Canada / New Zealand"). Ingen momsrad, och loggan är "Matstrumpor".
- Spårningssidan är helt på engelska, och det påhittade numret gav "We can't find that number" på engelska, både på .com och på .se/en.
- Fraktmejlen finns och är på engelska. Inga svenska rester och inget leveranslöfte som strider mot 5–10 arbetsdagar.

## Kan inte mätas härifrån

- **Uttal och tonfall med örat:** Whisper är inte facit, särskilt G-C-en-02. HeyGens läppsynk i 001–003 går inte heller att mäta härifrån.
- **Om pizza, burger och donut går att köpa i USA-marknaden:** länkbeskrivningen "4 kinds", Nathalie ("pizza, burger, and donut ones too") och 004 ("Four kinds. Pick one each.") lovar fyra sorter. Texterna finns i underlag-en.json, men att produkterna är publicerade i marknaderna US och WW, och att 1+1 gäller dem, är inte prövat i D-datan (som bara prövar sushisidan).
- **Klarna:** sajten säger "Pay however you like – Klarna, card, Apple Pay or Google Pay" och FAQ nämner Klarna. US-kassan visade "Credit card" och "PayPal" utan Klarna-rad (land-US.json kassa). Om Klarna erbjuds i USA, UK, AU, CA och NZ är inte mätt. Stämmer det inte är raden ett falskt löfte.
- **Presentkortet:** om det är nåbart för utlandskunder (G-C-en-14).
- **WW-länken utan land:** vilket land Shopify väljer efter kundens IP.
- **Spoks-flödena på engelska.**
- **Utanför språket, för del A:** alla åtta WW-annonser bär `issues_info` 3858810 "…riktar sig till reglerade länder (Australien) utan verifierade identiteter … verifierad annonsör och betalare krävs". Det kan stoppa leveransen till AU (A/annonser.json → WW → issues_info).

---

# Bilaga: Del C — språket (de)


Granskad 2026-09-30 av en infödd granskare (läs-bar, inga nätanrop). Paket:

- `A/annonser.json` (Metas copy, `copy_diff` tom på alla åtta: Meta = `annonser/DE.json`),
- `B/transkript/DE-00*.txt` + `B/bildtext/DE-00*.txt`,
- `egna/DE/*.json`, `heygen/srt/DE/*.srt`, `egna/d3/texter/DE.json`,
- `D/land-{DE,AT,CH}.json`, `D/tmp-DE:de.html` (den tyska produktsidan), `D/sparning-de.json`, `output/underlag-de.json`, `D/mejl-de.json`, `D/kundvy.txt`.

Svenska original: `transkript/09-17_Nathalie…srt`, `Sofie_H1/H2…srt`, `egna/*.manus.json`, `egna/bildtexter.sv.json`, `output/underlag-sv.json`, `oversattning/sv-A.json`.

**Summa: 🔴 0 · 🟡 9 · 🔵 5.** Inget förbjudet hittades i annonserna:

- Ingen butik eller domän står i copyn eller i bild.
- Ingen moms- eller tulltext.
- Inget "Made in Sweden". Raden är "Eine schwedische Marke."
- Inget leveransdatum och inget löfte om att paketet kommer fram till en högtid.
- "GRATIS" stämmer med korgen: D mätte 4 lådor för 2 betalda, €89,80.
- Erbjudandet i 001–007 ("Kauf 1 – Bekomm 1", "2 Boxen zum Preis von einer") finns i paketväljaren som "Kaufe 1 – erhalte 1 GRATIS" (€44,90).
- Tilltalet är genomgående du, både i annonserna, på sajten och i mejlen.

---

## 🟡 Bör rättas

```
G-C-de-01 🟡  DE 001–007, brödtexten (samma i alla sju annonser)
Vad:     Tredje meningen är styltig. "stecken an deinen Füßen" säger man inte om strumpor. Det inledande "Sie" kan dessutom läsas som artigt tilltal (Sie) mitt i en du-text.
Bevis:   A/annonser.json → brodtext, till exempel 120251767700350023: "Sie bleiben nicht in der Box, sondern stecken an deinen Füßen, Woche für Woche."
         Svenska (sv-A.json): "Efter skrattet stannar den inte kvar i lådan. Varje vecka sitter den på dina fötter."
Förslag: Till exempel "Die Socken bleiben nicht in der Box – sie landen an deinen Füßen, Woche für Woche." Raden skrivs av sonnet i rättningssessionen. Utförs aldrig av granskaren.
Vem:     byggarsessionen
```

```
G-C-de-02 🟡  DE 001–008, länkbeskrivning och 008, jämfört med sajten
Vad:     Annonsen och sajten säger erbjudandet med olika ord. Annonsen använder den vardagliga imperativen "Kauf 1 – Bekomm 1 GRATIS" / "Kauf 2 – bekomm 2 gratis". Sajtens paketväljare och FAQ säger "Kaufe 1 – erhalte 1 GRATIS". Kunden ska känna igen erbjudandet ordagrant när hen klickar.
Bevis:   A/annonser.json → lankbeskrivning "4 Sorten. Kauf 1 – Bekomm 1 GRATIS. Kostenloser Versand."
         008: rubrik "Kauf 2, bekomm 2 gratis: vier Boxen", banner i bild "KAUF 2 – BEKOMM 2 GRATIS".
         underlag-de.json → paket.sushi-2.rubrik "Kaufe 1 – erhalte 1 GRATIS"; tema.product.ms_faq_section.q2.q "Wie funktioniert „Kaufe 1 – erhalte 1“?"
Förslag: Välj en form och använd den överallt. "Kauf 1 – erhalte 1 GRATIS" fungerar i både annons och sajt. Bilden 008 behöver då ritas om. Utförs aldrig av granskaren.
Vem:     byggarsessionen
```

```
G-C-de-03 🟡  DE 005 (haikuh3, röst + undertext) och DE 006 (haikuh2, undertext)
Vad:     "Du wirst die Person mit den besten Geschenken." är ogrammatiskt för "du blir personen som …". Det ska vara "wirst zur Person" eller "bist dann die Person". I 006 hör Whisper dessutom "mit dem besten Geschenk", medan manuset säger "mit den besten Geschenken" (täckning 0,75). Antingen läser rösten fel, eller så hör Whisper fel. Lyssna.
Bevis:   egna/DE/haikuh3.json 00:42.02 och egna/DE/haikuh2.json 00:37.82: "Du wirst die Person mit den besten Geschenken."
         B/transkript/DE-006.txt #16: hört "Du wirst die Person mit dem besten Geschenk."
Förslag: "Du wirst zur Person mit den besten Geschenken." Det kräver ny röst (ElevenLabs) och ny undertext, så det kostar pengar och ska inte göras utan Axels ok. Utförs aldrig av granskaren.
Vem:     byggarsessionen
```

```
G-C-de-04 🟡  DE 007 (s001h1), röst + undertext 00:13.26
Vad:     "Aber eins haben wir alle nie genug: Socken." är inte grammatiskt. "Genug haben" kräver "von", som i "Von einem haben wir nie genug".
Bevis:   egna/DE/s001h1.json 00:13.26; B/transkript/DE-007.txt: "Aber eins haben wir alle nie genug."
         Svenska (s001h1.manus.json): "Men en grej vi alla går kort om är strumpor."
Förslag: "Aber von einem haben wir alle nie genug: Socken." Det kräver ny röst. Utförs aldrig av granskaren.
Vem:     byggarsessionen
```

```
G-C-de-05 🟡  DE 007 (s001h1), öppningsrepliken 00:00.00
Vad:     "das Netteste, was du jemandem schenken kannst" är en ordagrann översättning av "det snällaste" och låter konstigt om en present. Ett tyskt öra väntar sig "das Schönste" eller "das Beste".
Bevis:   egna/DE/s001h1.json: "Wenn du bald ein Geschenk brauchst, sind Sushi-Socken das Netteste, was du jemandem schenken kannst."
Förslag: Ta det med om 007 ändå görs om (G-C-de-04). Annars kan det stå kvar. Utförs aldrig av granskaren.
Vem:     byggarsessionen
```

```
G-C-de-06 🟡  DE 001–004 och 008 (brödtext, undertexter, bild) + sajten
Vad:     Samma ord stavas på fyra sätt i samma kampanj: "Take-Away-Essen" (annonstexten), "Takeaway-Box" (002:s SRT), "Take-away-Box" (003:s SRT) och "Takeaway" (008:s bild och sajten). Duden skriver "Take-away" eller "Takeaway".
Bevis:   A/annonser.json brödtext; heygen/srt/DE/matstrumpor_sofie_h1.srt; heygen/srt/DE/matstrumpor_sofie_h2.srt; egna/d3/texter/DE.json underrubrik; underlag-de.json body_html.
Förslag: Använd "Takeaway" i nya texter. Brödtexten ändras i Meta. De inbrända undertexterna går att låta stå, eftersom det är kosmetiskt. Utförs aldrig av granskaren.
Vem:     byggarsessionen
```

```
G-C-de-07 🟡  Sajten, den tyska produktsidan: svensk rest i Judge.me-märket
Vad:     Omdömesmärket under produkttiteln säger "11 recensioner" på svenska i den tyska sidans HTML. Recensionernas text på svenska är ett känt beslut, men det här är gränssnittets eget ord.
Bevis:   D/tmp-DE:de.html rad 3024 (matstrumpor.com/de/products/sushi-strumpor, html lang="de"): <span class='jdgm-prev-badge__text'> 11 recensioner </span>.
         Märket bär style='display:none' i serverns HTML. Det är inte mätt om Judge.me-skriptet visar det eller skriver om texten i webbläsaren (se "kan inte mätas").
Förslag: Lägg Judge.me-märkets text per språk ("11 Bewertungen"). Kontrollera i Chromium som tysk kund. Utförs aldrig av granskaren.
Vem:     byggarsessionen
```

```
G-C-de-08 🟡  Spårningssidan /de/pages/spara, svaret vid ett okänt nummer
Vad:     "Dann ist das Paket auf dem Weg hierher." läses som att paketet fysiskt är på väg hit. Svenskan menar att paketet ännu inte hunnit in på sidan ("på väg in här").
Bevis:   D/sparning-de.json → svar_pahittat.text; sparning/sprak/de.json rad 155. Svenska: "Då är paketet på väg in här — sidan hämtar nya paket varje timme".
Förslag: "Dann ist es hier wahrscheinlich noch nicht eingetragen. Die Seite holt neue Pakete jede Stunde …" Utförs aldrig av granskaren.
Vem:     byggarsessionen
```

```
G-C-de-09 🟡  Fraktmejlet "Dein Paket ist unterwegs" (fraktbekraftelse)
Vad:     "Sobald es eingecheckt ist" är konstigt om ett paket, eftersom "einchecken" används om resenärer och bagage. Resten av mejlet är naturligt.
Bevis:   D/mejl-de.json → fraktbekraftelse.brodtext; mejl/sprak/de.json rad 26: "Du musst nichts tun: Sobald es eingecheckt ist, wird der Status aktualisiert."
Förslag: "Sobald es erfasst wurde, wird der Status aktualisiert." Byt också "im Lauf des Tages" mot "im Laufe des Tages" i ute_for_leverans, som valfri putsning. Utförs aldrig av granskaren.
Vem:     byggarsessionen
```

---

## 🔵 Frågor till Axel och idéer

```
G-C-de-10 🔵  Kampanj DE, Schweiz: "ß"
Vad:     Schweizisk standardtyska använder aldrig ß, bara "ss". Alla annonser och sajten skriver "Spaß", "Füßen", "Größe" och "Einheitsgröße". Schweizare förstår det, men det signalerar "tysk butik".
Bevis:   A/annonser.json rubrik "Spaß heute Abend. An deinen Füßen morgen."; 008 "Einheitsgröße"; underlag-de.json "Größe", "Am großzügigsten".
Förslag: Ingen åtgärd krävs. Vill Axel satsa på CH: en de-CH-variant eller en egen annonstext utan ß. Beslutet är Axels.
Vem:     Axel
```

```
G-C-de-11 🔵  Genomstrukna priser i DE och AT (konsumenträtt)
Vad:     Paketväljaren stryker €101,60 bredvid €44,90 och €203,20 bredvid €89,80. Summan är 2 × €44,90 + ätpinnarnas "Wert €11,80" (och 4 × + €23,60). Det är alltså en summa av delarna och ingen tidigare pris. I Tyskland och Österrike prövas genomstrukna priser hårt: PAngV § 11 kräver att ett genomstruket "förra pris" är det lägsta priset under 30 dagar, och UWG § 5 förbjuder vilseledande jämförpriser. Ett ostrukturerat genomstruket belopp utan förklaring är en vanlig grund för varningsbrev (Abmahnung).
Bevis:   D/tmp-DE:de.html: "Kaufe 1 – erhalte 1 GRATIS / Du bekommst 2 Boxen und zahlst nur für 1 / €101,60"; "Normaler Preis €44,90"; "Echte Essstäbchen aus Holz (2 Paar) Wert €11,80". Uträkningen är granskarens.
Förslag: Ingen dom. Frågan till Axel: A) låt stå, B) skriv "Einzelwert" eller "Gesamtwert" bredvid det överstrukna, C) ta bort det överstrukna i DE och AT. Juridisk bedömning ligger utanför granskningen.
Vem:     Axel
```

```
G-C-de-12 🔵  DE 001 och 003: julstrumpan
Vad:     Julstrumpan är en anglosaxisk tradition. I DE, AT och CH är motsvarigheten Nikolausstiefel (6 december) eller presenten under granen. "Weihnachtsstrumpf" förstås men känns importerat. Löftet är inget högtidslöfte (det nämner ingen leverans), så det är inte fel. Julvinkeln passar marknaden, och julen är den stora presentsäsongen där.
Bevis:   B/transkript/DE-001.txt: "Verschenk sie, bring sie zur Party oder ab in den Weihnachtsstrumpf."
         B/transkript/DE-003.txt: "Das hier muss wohl das einzige Sushi sein, das in einen Weihnachtsstrumpf gehört." Bilden visar en julstrumpa (B/bildtext/DE-003.txt).
Förslag: Idé för nästa tyska omgång: en rad med "Nikolausstiefel" eller "unterm Weihnachtsbaum". De befintliga videorna rörs inte.
Vem:     Axel
```

```
G-C-de-13 🔵  DE 007: "Ich hab meine Firma aus Frust gegründet."
Vad:     Bekräftar B:s fynd. En AI-röst säger i jag-form att hon grundade företaget, medan bilden visar olika AI-personer. Det står så i det svenska originalet också ("Jag startade Matstrumpor ur en ilska"). I Tyskland kan en påhittad grundarberättelse ses som vilseledande (UWG § 5) om den inte stämmer.
Bevis:   egna/DE/s001h1.json 00:04.84; B/transkript/DE-007.txt: "Ich habe meine Firma aus Frust gegründet."
Förslag: Axel avgör om berättelsen är sann nog. Annars stryks repliken i nästa version.
Vem:     Axel
```

```
G-C-de-14 🔵  DE 008: sex lådor i bild, fyra i erbjudandet
Vad:     Bekräftar B:s fynd. Texten säger rätt ("vier Boxen", "20 Paar Socken"), men bilden visar sex lådor i pyramid. En tysk kund som ser bilden först kan tro att hen får sex.
Bevis:   B/bildtext/DE-008.txt; A/annonser.json 008 brödtext "Du bekommst vier Boxen."
Förslag: Nästa bildversion bör visa fyra lådor. Beslutet är Axels.
Vem:     Axel
```

---

## Bekräftat eller nyanserat ur B (inte nya fynd)

- **001, "Das ist ein Zeichen" (hört) mot "Das ist dein Zeichen" (manus).**
  - Troligen Whisper. HeyGen-rösten brukar hänga ihop med undertexten, och undertexten säger "dein".
  - Båda formerna är begripliga.
- **002, "Wir fallen schon so 10 Leute ein" (hört) mot "Mir fallen …" (manus).**
  - "Wir fallen … ein" vore fel tyska. Täckningen var 0,94, och "mir" och "wir" ligger nära i ljudet.
  - Troligen Whisper, men lyssna på 00:14.
- **004 (012v2), texterna.**
  - Rutorna är naturliga och roliga: "Zweimal hinsehen. Einmal lachen.", "An deine darf keiner." och "Schubladen-WG mit den Normalen".
  - B:s fynd om överlappande rutor gäller också DE. OCR vid 2 s och 4 s visar "Eine dieser Pizzen ist fake" / "Zweimal hinsehen …" samtidigt som "Der Fake? Socken.".
- **006, hooken "Drei Gründe, warum du keine Sushi-Socken kaufen solltest".** Den är trogen det svenska originalet ("Tre anledningar att inte köpa sushistrumpor"), så den är inget översättningsfel.
- **Sajten (/de, lang="de").** Produktsidan, paketväljaren, FAQ:n, trust-raden, fraktrutan ("Kostenloser Versand nach Deutschland") och "Voraussichtliche Lieferung 5–10 Werktage" är naturlig tyska. Juridiklänkarna Widerrufsrecht, AGB och Impressum finns i sidfoten.
- **Fri frakt.** DE, AT och CH ligger i zonen "Europa" med en fraktsats på 0 (D/frakt.json).

---

## Kan inte mätas härifrån

- **Vilket språk annonslänken landar på.**
  - D:s Chromium landade på den engelska sidan (html lang="en", slut_url /products/… utan /de/) i land-DE, land-AT och land-CH. Det hände efter POST /localization med språket de och sedan annonslänken /de/products/… utan `?country=`.
  - Byggarens kundvy.txt och D:s egen hämtning (tmp-DE:de.html) visar /de med lang="de".
  - Språkgranskningen kan inte avgöra vilket en riktig tysk kund ser. Om det är engelska når ingen av de tyska sajttexterna ovan kunden, och då är det 🔴. Det avgörs i del D.
- **Kassans språk.** D såg en-DE, en-AT och en-CH. Tyska kassatexter har därför inte lästs.
- **Rösten med eget öra.** Allt ovan bygger på Whisper medium och manus. Uttal, betoning och om "Sushi-Socken" går fram är inte hörda av en människa.
- **Judge.me-märket "11 recensioner".** Det är inte mätt om det syns eller skrivs om efter JavaScript i en tysk webbläsare. Recensionernas översättning till tyska var inte klar vid mätningen, vilket är ett känt beslut.
- **Schweiz.** Om Swiss Post tar ut importmoms eller en avgift vid dörren trots "Kostenloser Versand" går inte att mäta härifrån. Momsen och tullen är Axels kända beslut och rapporteras inte som fel.
- **Österrike.** Inga österrikiska ordval har granskats separat ("Paket", "Box" och "Socken" är neutrala). Inget i texterna är rikstyskt på ett störande sätt.

---

# Bilaga: Del C — språket (fr)


Granskare C-FR, 2026-09-30. Läs-bart: inga nätanrop mot Meta eller Shopify, bara insamlad data i scratchpad och repot.
Läst: `A/annonser.json` (8 FR-annonser ur Meta, `copy_diff` tom på alla 8), `B/transkript/FR-00*.txt`, `B/bildtext/FR-00*.txt`,
`B/fynd.md`, `heygen/srt/FR/*`, `egna/FR/*.json`, `egna/d3/texter/FR.json`, `D/land-{FR,BE,LU}.json`, `D/tmp-FR:fr.html`
(produktsidan som fransk kund via HTTP), `D/sparning-fr.json`, `sparning/sprak/fr.json`, `output/underlag-fr.json` mot `underlag-sv.json`,
`D/mejl-fr.json`, de svenska transkripten (`transkript/09-17_Nathalie…`, `Sofie_H1…`, `Sofie_H2…`) och `egna/*.manus.json`.

**Summa: 🔴 0 · 🟡 11 · 🔵 6.**
Tilltalet är `vous` överallt (annonser, tal, sajt, mejl, spårning), och det är konsekvent. Inga butiksnamn, inga domäner och ingen moms- eller tulltext i annonserna.
Inget leverans- eller högtidslöfte, och inget "tillverkad i Sverige". Sista raden är "Une marque suédoise." Erbjudandena stämmer med korgen:
1 acheté – 1 offert (002/003 i talet "deux boîtes pour le prix d'une") och 2 achetés – 2 offerts (008). Korgen gav 4 lådor, 2 betalda och 4 par pinnar,
89,80 EUR i FR, BE och LU. Den fria frakten finns i zonen Europa, som bär FR, BE och LU.

---

## 🟡 Bör rättas

```
G-C-FR-01 🟡  FR 002 (MATSTRUMP_FR_sushi_gift_ugc_002_v1, 120251767749360023), rubriken
Vad:     "Porté demain." böjs inte efter något. Det som bärs är chaussettes (femininum plural), så en fransk läsare snubblar på
         maskulinum singular utan subjekt. Det låter som en ofullständig mening.
Bevis:   A/annonser.json → FR 002 rubrik: "Rire ce soir. Porté demain." (samma i annonser/FR.json → title_alt[0]).
Förslag: "Fou rire ce soir. Portées dès demain." eller rubriken från 001. Ny rad skrivs av sonnet i rättningssessionen. Utförs aldrig av granskaren.
Vem:     byggarsessionen
```

```
G-C-FR-02 🟡  FR 001–007, brödtextens första mening
Vad:     "La lessive n'enthousiasme personne." kan betyda både "ingen jublar över tvättmedel" och "ingen tycker om att tvätta".
         Den närmaste läsningen i franskan är sysslan (faire la lessive). Då försvinner presentbilden i originalet: tvättmedel som tråkig present.
Bevis:   A/annonser.json FR 001–007 brodtext rad 1. Originalet: "Ingen jublar åt tvättmedel" (underlag-sv.json → produkt.sushi-strumpor.body_html);
         NO: "Ingen jubler over vaskemiddel". Sajten säger det tydligare: "Personne ne s’emballe pour une lessive." (tmp-FR:fr.html).
Förslag: Ta sajtens mening ("Personne ne s’emballe pour une lessive."), eller "Personne ne saute de joie devant un baril de lessive.".
         Utförs aldrig av granskaren.
Vem:     byggarsessionen
```

```
G-C-FR-03 🟡  FR 001, 004–007 rubriken + FR 001–007 brödtextens rad 3: "à vos pieds"
Vad:     Presenten är till någon annan, men annonsen säger att strumporna sitter på KÖPARENS fötter ("vos pieds").
         "Être à vos pieds" är dessutom ett idiom för "ligga för era fötter" (underdånighet). Ordleken kan fungera,
         men den byter mottagare jämfört med originalet ("sitter på fötterna", ingen ägare).
Bevis:   Rubrik "Fou rire ce soir. À vos pieds demain."; brödtext "Elles ne restent pas dans la boîte : elles sont à vos pieds, semaine après semaine."
         (A/annonser.json FR 001, 004–007 resp. 001–007). NO-förlagan: "Den er på føttene, uke etter uke." (annonser/NO.json).
Förslag: "…elles se portent, semaine après semaine." / rubrik "Fou rire ce soir. Aux pieds dès demain." Axel/sonnet avgör om ordleken ska stå kvar.
Vem:     byggarsessionen
```

```
G-C-FR-04 🟡  FR 001 (MATSTRUMP_FR_sushi_gift_ugc_001_v1, 120251767746410023), tal och undertext 5,5–7,9 s och 0–5 s
Vad:     "Les offrir, c'est comme si vous saviez tout de la personne." är en ordagrann översättning av svenskans "som att du vet allt om personen".
         Det låter inte franskt. I talet hörs det dessutom som "toute la personne" (seglyssna 0,82), så repliken är den svagaste i videon.
         "Tout a été vendu en novembre" (två gånger) är begripligt men stelt, och en fransman säger "en rupture de stock".
Bevis:   B/transkript/FR-001.txt #3: manus "…si vous saviez tout de la personne.", hört "…si vous saviez toute la personne.", täckning 0.82.
         Svenska: "När du ger bort dem här så är det som att du vet allt om personen." (transkript/09-17_Nathalie_captions_musik.srt, block 2).
Förslag: Om 001 renderas om: "Les offrir, c'est montrer que vous la connaissez par cœur." och "En rupture de stock en novembre dernier…".
         Det är HeyGen (dyrt), så det kan också få stå kvar: betydelsen går fram. Axel avgör. Utförs aldrig av granskaren.
Vem:     byggarsessionen / Axel
```

```
G-C-FR-05 🟡  FR 004 (MATSTRUMP_FR_sushi_gift_anim_004_v1, 120251774200960023), textrutorna
Vad:     Bekräftar G-B04 för franskan. Två rutor står samtidigt, och poängen avslöjas innan den ska komma:
         vid 2 s står "Une de ces pizzas est un faux." och "Le faux ? Des chaussettes." ihop, och vid 4 s står "Deux coups d'œil. Un fou rire." ihop med "Le faux ? Des chaussettes.".
         Språket i rutorna är i övrigt rätt och naturligt.
Bevis:   B/bildtext/FR-004.txt, OCR 00:02 "Une de ces pizzas | est iin faiiy | Le faux ? | Des chaussettes." och 00:04 "Deux coups d'ceil. | Un fou rire. | Le faux? | Des chaussettes.".
Förslag: Enligt G-B04: varje ruta slutar när nästa börjar (rendera-012v2.py, kostnadsfritt). Utförs aldrig av granskaren.
Vem:     byggarsessionen
```

```
G-C-FR-06 🟡  Sajten FR/BE/LU: valutaformatet
Vad:     Beloppen skrivs "€44,90". I Frankrike, Belgien och Luxemburg skrivs "44,90 €", med tecknet efter beloppet.
         Fi/es/it/pt i samma butik visar redan "44,90 €", så det är franskans penningformat som avviker.
Bevis:   tmp-FR:fr.html: "Prix habituel €44,90", "Chaussettes pizza · €47,90", "€89,80 €203,20", "Total estimé €0,00 EUR"; D/tabell.md FR/BE/LU "€44.90" mot FI "44,90 €".
Förslag: Byt penningformatet för språket fr till "{{amount_with_comma_separator}} €" (temats/Shopifys format, ingen priskod). Utförs aldrig av granskaren.
Vem:     byggarsessionen
```

```
G-C-FR-07 🟡  Sajten FR: Judge.me-märket på produktsidan är på svenska
Vad:     Under produkttiteln står "11 recensioner", ett svenskt ord, på den franska sidan. Fördelningen står på engelska ("5 stars: 6 (55%)").
         Själva recensionerna på svenska är ett känt beslut (punkt 8, Judge.me översätter inom 48 h). Men märkets etikett är Judge.me-rutans eget gränssnitt, inte en recension.
Bevis:   tmp-FR:fr.html (hämtad 14:39 UTC, lang="fr"): "Matstrumpor / 11 recensioner / Prix habituel"; "5 stars: 6 (55%) … 1 star: 0 (0%)".
Förslag: Kontrollera vid byggarens avstämning 1/10 om märket följer med översättningen. Annars sätter man Judge.me-widgetens fr-texter. Utförs aldrig av granskaren.
Vem:     byggarsessionen
```

```
G-C-FR-08 🟡  Sajten LU (och startsidan): Klarna utlovas men finns inte i Luxemburgs kassa
Vad:     FAQ:n och startsidan lovar Klarna till alla. Kassan för Luxemburg visade bara kort och PayPal, medan FR och BE visade Klarna.
Bevis:   underlag-fr.json → tema.product.ms_faq_section.q5.a "Klarna, carte (…), Apple Pay, Google Pay, PayPal et Shop Pay." och
         tema.index.trygghet.t.text "Payez comme vous voulez – Klarna, carte, Apple Pay ou Google Pay.";
         D/land-LU.json kassa.rader: "Credit card", "PayPal", "Add discount" … (inget "Klarna"). land-FR/BE: "PayPal", "Klarna".
         OBS: kassan mättes i en engelsk session från USA-IP. Apple Pay och Google Pay syns bara på rätt enhet.
Förslag: Stäm av Klarna för LU i Shopify Payments, eller skriv FAQ-raden utan Klarna. Utförs aldrig av granskaren.
Vem:     byggarsessionen / Axel
```

```
G-C-FR-09 🟡  Mejlen: ämnesraden på "levererad försändelse" (Shopifys mall)
Vad:     "Une commande {{ name }} a été livrée" betyder "En order #… har levererats", med obestämd artikel. Det låter som att det gäller någon annans order.
         Svenskan säger "En försändelse för order X". Samma mall har "numéro de suivi:" utan mellanslag före kolon,
         och "Restez à l'affût dans la journée." i "ute för leverans" är lite konstigt ("håll utkik"), men det går att förstå.
Bevis:   D/mejl-fr.json → levererad_forsandelse.amne "Une commande {{ name }} a été livrée" (sv_amne "En försändelse för order {{ name }} har levererats");
         ute_for_leverans.brodtext "Restez à l'affût dans la journée.".
Förslag: "Un envoi de votre commande {{ name }} a été livré"; "Surveillez votre boîte aux lettres aujourd'hui.". Utförs aldrig av granskaren.
Vem:     byggarsessionen
```

```
G-C-FR-10 🟡  Spårningssidan: svaret på ett okänt nummer
Vad:     Två meningar är översättningssvenska: "Vérifiez que le numéro complet a bien été copié lors du collage" ("kopierats vid inklistringen")
         och "Le colis est alors en cours d'intégration ici". Man förstår dem, men de låter maskinöversatta.
Bevis:   D/sparning-fr.json → com.svar_pahittat.text (MS-ZZ00ZZ00, 14:40 UTC, lang fr).
Förslag: "Vérifiez que vous avez collé le numéro en entier." / "Il est peut-être en train d'être ajouté ici." (sparning/sprak/fr.json). Utförs aldrig av granskaren.
Vem:     byggarsessionen
```

```
G-C-FR-11 🟡  FR 001–007, rubrik + brödtext + länkbeskrivning: ordet "chaussettes" står ingenstans
Vad:     Texten säger "5 paires roulées comme des makis" men aldrig vad det är för par. Den som bara ser texten (flödet med ljudet av, eller
         en miniatyr) får inte veta att det är strumpor. Det är samma upplägg som i NO-förlagan, men i franskan är "paires" utan substantiv ovanligt.
Bevis:   A/annonser.json FR 001–007: rubrik "Fou rire ce soir. À vos pieds demain.", brödtext "…5 paires roulées comme des makis…", länk "4 sortes. 1 acheté – 1 offert. Livraison gratuite."
         Jämför 008: "vingt paires de chaussettes au total".
Förslag: "5 paires de chaussettes roulées comme des makis". Utförs aldrig av granskaren.
Vem:     byggarsessionen
```

## 🔵 Frågor till Axel / idéer

```
G-C-FR-12 🔵  FR 001 och 003: julstrumpan ("chaussette de Noël")
Vad:     I Frankrike läggs klapparna traditionellt vid granen, "dans les souliers". I Belgien och Luxemburg är Saint-Nicolas (6 december) med skon den stora presentdagen.
         Ordet "chaussette de Noël" förstås (anglosaxisk import), men det är inte vardag. Det är inget fel, men vinkeln är svagare än i Sverige och Norge.
Bevis:   B/transkript/FR-001.txt 2,5 s "glissez-les dans la chaussette de Noël"; FR-003.txt 0 s "…le seul sushi qui a vraiment sa place dans une chaussette de Noël."
Förslag: Inget nu. En eventuell ny FR-version kan säga "au pied du sapin" (under granen). Axel avgör.
```

```
G-C-FR-13 🔵  FR 005, 006, 007: förstapersonsvittnesmål från en AI-röst
Vad:     Bekräftar G-B07 (007 "J'ai lancé ma marque par pure frustration."). 005/006 säger dessutom "Maman dit que c'est son cadeau préféré",
         "elle en redemande déjà". Det är personliga vittnesmål från en syntetisk röst. I Frankrike räknas påhittade vittnesmål som
         vilseledande marknadsföring (pratiques commerciales trompeuses). Samma text har gått i Sverige.
Bevis:   B/transkript/FR-005.txt 32,7 s och 34,6 s; FR-006.txt 28,3 s; FR-007.txt 4,8 s.
Förslag: Axel avgör om vittnesmålen är sanna nog att stå på franska.
```

```
G-C-FR-14 🔵  Sajten FR/BE/LU: det överstrukna referenspriset
Vad:     Paketen visar €44,90 mot överstruket €101,60 (2 lådor) och €89,80 mot €203,20 (4 lådor). EU:s Omnibus (i Frankrike Code de la consommation
         L112-1-1) kräver att ett överstruket "förr"-pris är det lägsta priset de senaste 30 dagarna. Om €50,80 per låda aldrig tagits ut i EUR kan jämförpriset ifrågasättas.
Bevis:   tmp-FR:fr.html: "1 acheté – 1 OFFERT … €101,60", "2 achetés – 2 OFFERTS … €89,80 €203,20"; land-FR.json paket.forr.
Förslag: Fråga till Axel. Prishistoriken kan inte mätas härifrån.
```

```
G-C-FR-15 🔵  Sajten: ".se" i kassans rubrik och på À propos
Vad:     I kassan står "Matstrumpor.se Checkout" (butikens namn i Shopify). Sidan À propos säger "Matstrumpor.se est exploité par STONEBITE ECOM AB",
         medan sidfoten redan har "Matstrumpor est exploité par". Det står inte i annonsen, så det är inget förbjudet, men det går emot "Matstrumpor utan .se utomlands".
Bevis:   D/land-FR.json kassa.rader "Matstrumpor.se Checkout" (samma i BE och LU); underlag-fr.json → sida.om-oss.body_html sista stycket.
Förslag: Axel avgör. Butiksnamnet i Shopify gäller också Sverige.
```

```
G-C-FR-16 🔵  Repot: annonser/FR.json → copy.link_description är den gamla formen
Vad:     Toppnivåns link_description säger "Achetez-en 1 – Recevez-en 1 GRATUIT", med samma kongruensfel som d3-filens `sajt_fel` beskriver ("GRATUIT" ska vara plural vid 2).
         Meta bär den rättade raden "1 acheté – 1 offert", så kunden ser inget fel. Men nästa bygge kan läsa toppnivån.
Bevis:   matstrumpor/marknader/annonser/FR.json rad "link_description": "4 sortes. Achetez-en 1 – Recevez-en 1 GRATUIT. Livraison gratuite." mot annonsernas "4 sortes. 1 acheté – 1 offert. Livraison gratuite.".
Förslag: Byt toppnivån till annonsernas rad. Utförs aldrig av granskaren.
```

```
G-C-FR-17 🔵  FR 005 (haikuh3), 39–41 s: märket "DOIY" på strumpan
Vad:     Bekräftar G-B08 i den franska filen: OCR läser "DOIY" vid 40,0 s. Det är inget språkfel, bara en notering.
Bevis:   B/bildtext/FR-005.txt [00:40.00] "Ce genre de cadeau, | DOIY".
```

(🔵-räkningen ovan: 12–17 = 6 st.)

## Bekräftat / nyanserat ur del B

- **004 har ingen röst.** Whisper "hör" "Sous-titres réalisés para la communauté d'Amara.org" i FR-004. Det är en känd hallucination på musik (som "Thanks for watching") och inget som sägs.
- **Talet i 002, 003, 005, 006 och 007 stämmer med manus** (täckning 0,93–1,0). Avvikelserna är Whispers stavning ("10" för "dix", "sushis"), och inga ord är fel. 002 #1 "c'était de vraies sushis" är Whispers genus. Manus och undertext har "c'étaient de vrais sushis", och det hörs likadant.
- **Rubrikerna i bild** (005/006: "UN : ELLES SONT VRAIMENT UNIQUES", "DEUX : ÇA VAUT LE COUP", "TROIS : VOUS FAITES PLAISIR", knappen "COMMANDER", 007-etiketten "Chaussettes sushi") är idiomatiska och rättstavade.
- **008:** "CHAUSSETTES SUSHI / On dirait des sushis à emporter. 20 paires. / 2 ACHETÉS – 2 OFFERTS" är korrekt och naturligt, och stämmer med korgen (4 sushilådor à 5 par = 20).
  "Taille unique, du 36 au 44" stämmer med sajten ("Pointure 36–44"). Sex lådor i bild mot fyra i erbjudandet: se G-B09.
- **Sajtens franska** är i övrigt naturlig och korrekt: köprutan, paketväljaren ("Vous recevez 4 boîtes et n’en payez que 2"), fraktrutan ("Livraison gratuite en France"), leveranstiden "5–10 jours ouvrés", "30 jours pour changer d’avis" (generösare än lagens 14 dagar, så det är tillåtet) och FAQ:n.
  Inga svenska rester i köptexterna utöver G-C-FR-07 och kontaktadressen kundsupport@matstrumpor.se.
- **Fraktmejlen** (skickad, uppdatering, ute för leverans) är på franska och har vous-tilltal. Inga svenska rester.

## Kan inte mätas härifrån

- **Vilket språk kunden landar på.** Del D:s Chromium-körning (`land-FR/BE/LU.json`, 14:27 UTC) slutade på engelska sidor (`html_lang: en`, `slut_url …/products/sushi-strumpor` utan `/fr/`) och i en engelsk kassa (`en-FR`, `en-BE`, `en-LU`), fast annonslänken är `/fr/…`.
  Samtidigt ger HTTP-hämtningen av samma länk (`tmp-FR:fr.html`, 14:39 UTC) `lang="fr"`, `Shopify.locale = "fr"`, och byggarens `kundvy.txt` säger fr för FR och LU.
  Det motsägelsefulla resultatet ska prövas en gång till med en ren webbläsare utan tidigare cookie. Blir kunden verkligen omdirigerad till engelska är det 🔴 (fel språk). Därför granskades kassan inte på franska.
- **Vad Shopify väljer efter IP** för en belgisk eller luxemburgsk kund. Länken saknar `?country=` (känt beslut 3).
- **Flamländska belgare får franska** (känt beslut 3, öppen fråga till Axel sedan 2026-09-30). Språket avgörs inte här.
- **Uttal, tonfall och läppsynk** i 001–003 (HeyGen) och 005–007 (ElevenLabs): Whisper är inte facit. Om "tout de la personne" (001 #3) verkligen låter som "toute la personne" kräver ett franskt öra.
- **Judge.me efter översättningen:** läget 1/10 är inte mätt.
- **Prishistoriken** bakom jämförpriset €101,60 (G-C-FR-14).
- **Kassans betalsätt** på riktig enhet och IP (Apple Pay, Google Pay, Bancontact, Klarna i LU).

---

# Bilaga: Del C — språket (nl)


Granskare: infödd läsare av nederländska, läser som kund och som marknadsförare. Läs-bart: inget ändrat, inga nätanrop mot Meta eller Shopify.
Källor: `A/annonser.json` (Metas text, 8 NL-annonser, alla PAUSED), `B/transkript/NL-00x.txt`, `B/bildtext/NL-00x.txt`, `B/fynd.md`, repots `annonser/NL.json`, `heygen/srt/NL/`, `egna/NL/*.json`, `egna/d3/texter/NL.json`, `D/land-NL.json` (mätt 2026-09-30 14:04 UTC), `D/sparning-nl.json`, `D/mejl-nl.json`, `output/underlag-nl.json`, `sparning/sprak/nl.json`.
Egen mätning: faster-whisper medium på utsnitt ur `B/vid/950379650925502.mp4` (NL 007) och `B/vid/1101777322405720.mp4` (NL 001), 2026-09-30.

Metas copy är lika med `annonser/NL.json` på alla 8 (`copy_diff: {}`). Ingen butik, ingen domän, inget pris, ingen moms- eller tulltext och inget "tillverkad i Sverige" i någon annonstext eller bildtext. Sista raden är "Een Zweeds merk." (= "Ett svenskt varumärke"), vilket är rätt.

---

## 🔴

```
G-C-NL-01 🔴  Sajten, korgen och kassan efter "Aan winkelwagen toevoegen" (alla 8 NL-annonser landar här)
Vad:     En nederländsk kund som lägger "Koop 2 – krijg 2 GRATIS" i korgen från /nl/-sidan hamnar i en ENGELSK korg
         och en ENGELSK kassa. Kunden läser alltså "Your cart", "Real wooden chopsticks", "Sushi Socks", "Pairs: 5 pairs"
         och kassan i en-NL. Summan och erbjudandet stämmer (4 lådor, 2 betalda, €89,80, 4 par ätpinnar gratis).
Bevis:   D/land-NL.json, mätt 2026-09-30T14:04:46Z:
         - efter_lagg_i: {"url": "https://matstrumpor.com/cart", "html_lang": "en", "produktsidans_root": "/nl/"}
         - texter.korg_dit_kunden_hamnar: "Your cart", "Real wooden chopsticks", "Sushi Socks", "Pairs: 5 pairs", "Check out"
         - kassa.url ".../checkouts/cn/hWNHQpdceFXfwjmBgUAtTyDa/en-nl", kassa.lang "en-NL", raderna "Delivery", "Shipping method",
           "Real wooden chopsticks", "Sushi Socks", "5 pairs / One size"
         - Samma korg öppnad på /nl/cart är nederländsk ("Je winkelwagen", "Echte houten eetstokjes", "Sushisokken", "Afrekenen"),
           så översättningarna finns — det är vägen dit som tappar /nl/.
         Samma mönster i D/land-DK.json, land-NO.json och land-DE.json (efter_lagg_i /cart, kassa en-DK / en-NO / en-DE),
         alltså troligen hela sajten, inte bara nl.
Förslag: Pröva om med en ny agent i Chromium: lägg i korgen från https://matstrumpor.com/nl/products/sushi-strumpor?country=NL
         och läs adressen efter klicket. Stämmer det: paketväljarens JS (ms-paket) ska skicka kunden till
         `routes.cart_url` (/nl/cart) i stället för en hårdkodad /cart, så att korgen och kassan får kundens språk.
         Utförs aldrig av granskaren.
Vem:     byggarsessionen (del D, gäller alla språk)
```

## 🟡

```
G-C-NL-02 🟡  Brödtexten i 001–007 (samma text i alla sju)
Vad:     Två av tre meningar låter översatta. "Wasmiddel doet niemand juichen" är en ordagrann kalk av "Ingen jublar åt
         tvättmedel" ("doen juichen" är styltigt, nästan högtidligt). "Een grapcadeau bewaart niemand" har objektet först och
         kan läsas "ett skämtpresent räddar/sparar ingen". "5 paar gerold als maki" saknar "op" (008 och sajten säger
         "opgerold"). Sajten har redan en naturligare version av samma två meningar.
Bevis:   A/annonser.json → brodtext på MATSTRUMP_NL_*_001…007: "Wasmiddel doet niemand juichen. Een grapcadeau bewaart
         niemand. … 5 paar gerold als maki …". Sajten (underlag-nl.json → produkt.sushi-strumpor.body_html): "Niemand is
         enthousiast over wasmiddel. Niemand bewaart een grap-cadeautje." och "5 paar sokken, opgerold als sushistukjes".
         008 (egna/d3/texter/NL.json): "Opgerold als maki".
Förslag: "Van wasmiddel wordt niemand blij. Een grapcadeau bewaart niemand lang." eller sajtens två meningar ordagrant;
         "5 paar opgerold als maki". Ny rad skrivs av sonnet i rättningssessionen. Utförs aldrig av granskaren.
Vem:     byggarsessionen
```

```
G-C-NL-03 🟡  Rubrikerna i 001, 002, 004–007
Vad:     "Lol vanavond. Gedragen morgen." (002) läses som engelskt internet-"LOL", och "Gedragen morgen" har fel ordföljd
         (det heter "Morgen gedragen"). "Lachen vanavond. Aan je voeten morgen." (001, 004–007) har samma omvända ordföljd,
         som låter översatt. 003:s "Vanavond lachen, morgen dragen." är den naturliga formen.
Bevis:   A/annonser.json → rubrik: 002 "Lol vanavond. Gedragen morgen."; 001/004/005/006/007 "Lachen vanavond. Aan je voeten
         morgen."; 003 "Vanavond lachen, morgen dragen.". annonser/NL.json → title / title_alt.
Förslag: "Vanavond lachen. Morgen aan je voeten." för 001/004–007 och stryk "Lol …" (eller byt till 003:s rubrik). Utförs
         aldrig av granskaren.
Vem:     byggarsessionen
```

```
G-C-NL-04 🟡  001 (MATSTRUMP_NL_sushi_gift_ugc_001_v1, 120251767086320023), första repliken 0,1–1,1 s
Vad:     Bekräftar G-B05: öppningsordet "teken" (tecken) går inte fram. Hooken är videons första sekund.
Bevis:   Egen Whisper medium på 0–2,5 s, språket låst till nl: "Dit(0.56) je(0.54) keken,(0.84)" — alltså "Dit je keken",
         inte "Dit is je teken". B/transkript/NL-001.txt: "hört: Dit is je keuken!" (täckning 0,75). Undertexten i bild är
         rätt ("Dit is je teken.", OCR 1,0 s). Resten av videon är 0,94–1,0.
Förslag: Axel eller byggaren lyssnar på 0–1,2 s. Hörs "keuken/keken": rendera om bara den repliken. Utförs aldrig av
         granskaren.
Vem:     byggarsessionen / Axel lyssnar
```

```
G-C-NL-05 🟡  Spårningssidan /nl/pages/spara, texten när numret inte hittas
Vad:     Betydelsefel. Svenskan säger att paketet snart dyker upp PÅ SIDAN; nederländskan säger att paketet redan är på väg
         HIT (fysiskt), vilket kunden inte kan tolka.
Bevis:   sparning/sprak/nl.json rad 155: sv "Fick du leveransmejlet nyss? Då är paketet på väg in här — sidan hämtar nya
         paket varje timme …" → nl "Heb je de verzendmail net ontvangen? Dan is je pakket hier al onderweg. …".
         Live: D/sparning-nl.json → se_mejllank.svar_pahittat.text (matstrumpor.se/nl, 200, 14:12 UTC).
Förslag: "Heb je de verzendmail net ontvangen? Dan verschijnt je pakket hier binnenkort." Utförs aldrig av granskaren.
Vem:     byggarsessionen
```

```
G-C-NL-06 🟡  Fraktmejlet "Je pakket komt vandaag" (ute för leverans)
Vad:     "is onderweg voor levering" är en kalk av "out for delivery" och låter inte nederländskt.
Bevis:   D/mejl-nl.json → notiser.ute_for_leverans.brodtext: "Je bestelling {{ name }} is onderweg voor levering en komt
         vandaag bij je aan."
Förslag: "Je bestelling {{ name }} is vandaag onderweg naar je toe en wordt vandaag bezorgd." (eller "… is bij de bezorger
         en komt vandaag aan"). Utförs aldrig av granskaren.
Vem:     byggarsessionen
```

```
G-C-NL-07 🟡  Erbjudandets stavning: "Krijg" i annonserna, "krijg" på sajten
Vad:     Annonsernas länkbeskrivning skriver "Koop 1 – Krijg 1 GRATIS" (versal mitt i frasen, ordlistans form), medan
         paketväljaren, FAQ och korgen skriver "Koop 1 – krijg 1 GRATIS". Kunden ser två stavningar av samma erbjudande
         på ett klick. Versal efter tankstreck är inte nederländsk norm.
Bevis:   A/annonser.json → lankbeskrivning 001–007 "4 soorten. Koop 1 – Krijg 1 GRATIS. Gratis verzending.", 008 "Koop 2 –
         Krijg 2 GRATIS. …"; D/land-NL.json → paket[].rubrik "Koop 1 – krijg 1 GRATIS", "Koop 2 – krijg 2 GRATIS".
         REGLER-EUROPA.md ordlistan: "Koop 1 – Krijg 1 GRATIS".
Förslag: Gemen "krijg" överallt, även i ordlistan. Utförs aldrig av granskaren.
Vem:     byggarsessionen
```

```
G-C-NL-08 🟡  004 (012v2, 120251773854830023), sista rutan
Vad:     "Vier smaken. Kies er elk één." är grammatiskt men stelt ("välj en var" med "elk" på fel plats för talspråk).
Bevis:   egna/NL/012v2.json texter[6]; OCR B/bildtext/NL-004.txt 12,0 s "Vier smaken. Kies er elk éen.".
Förslag: "Vier smaken. Voor ieder één." Utförs aldrig av granskaren.
Vem:     byggarsessionen
```

```
G-C-NL-09 🟡  Produktsidan, prisformatet
Vad:     Samma sida skriver euro på två sätt: "€44,90" (pris, "waarde €11,80") och "€ 44,90" (paketväljaren). Kosmetiskt.
Bevis:   D/land-NL.json → pris_kopruta "€44,90", paket[].nu "€ 44,90", paket[].gava "… waarde €11,80".
Förslag: Ett format på hela sidan (nederländsk norm är "€ 44,90"). Utförs aldrig av granskaren.
Vem:     byggarsessionen
```

## 🔵 Frågor och idéer

```
G-C-NL-10 🔵  003 (julvinkeln, MATSTRUMP_NL_sushi_jul_ugc_003_v1) och 001
Vad:     Julstrumpan ("kerstsok") är ingen stark tradition i Nederländerna. Den stora presentkvällen är Sinterklaas
         (pakjesavond 5 december, skon vid spisen). 003 bygger hela hooken på "de enige sushi die écht in een kerstsok
         thuishoort", och 001 säger "stop ze in de kerstsok". Det är begripligt men träffar svagare än i Sverige.
Bevis:   B/bildtext/NL-003.txt 1–2 s "Dit moet toch wel de enige sushi zijn die écht in een kerstsok"; heygen/srt/NL/
         matstrumpor_nathalie.srt "stop ze in de kerstsok".
Förslag: Fråga till Axel: behålla 003 i NL, eller en Sinterklaas-variant ("in je schoen") inför december? Inget ändras nu.
Vem:     Axel
```

```
G-C-NL-11 🔵  007 och 005/006: påståenden i jagform från en AI-röst
Vad:     007: "Ik ben dit bedrijf begonnen uit frustratie." 005/006: "Mijn moeder noemde het haar favoriete cadeau."
         Rösten är syntetisk och bilden visar olika AI-personer. Samma påståenden finns i det svenska originalet
         ("Jag startade Matstrumpor ur en ilska"), så det är inte ett översättningsfel. Men i Nederländerna bedömer
         Reclame Code Commissie och ACM ett påhittat vittnesmål som vilseledande.
Bevis:   egna/NL/s001h1.json rad 2; egna/NL/haikuh3.json + haikuh2.json "Mijn moeder noemde het haar favoriete cadeau.";
         B/bildtext/NL-007.txt (granskarens iakttagelse: olika AI-personer).
Förslag: Axel avgör, samma beslut för alla länder. Inget ändras av granskaren.
Vem:     Axel
```

```
G-C-NL-12 🔵  Sajten: iDEAL nämns inte
Vad:     Kassan erbjuder "iDEAL | Wero", det betalsätt holländare letar efter först. Sajtens trygghetstext och FAQ räknar upp
         Klarna, kort, Apple Pay, Google Pay, PayPal och Shop Pay men inte iDEAL.
Bevis:   D/land-NL.json → kassa.rader "iDEAL | Wero"; underlag-nl.json → tema.index.trygghet.t.text "Betaal zoals je wilt –
         Klarna, kaart, Apple Pay of Google Pay." och tema.product.ms_faq_section.q5.a.
Förslag: Idé: nämn iDEAL i nl-versionen av de två texterna. Utförs aldrig av granskaren.
Vem:     Axel / byggarsessionen
```

```
G-C-NL-13 🔵  Kassans rubrik och presentkortet (inte sett live på NL-sidan)
Vad:     (a) Kassans skärmläsarrubrik heter "Matstrumpor.se Checkout" (butikens namn i Shopify), fast loggan utomlands är
         "Matstrumpor". (b) Presentkortets valör är översatt till "150,00 kr" — en nederländsk kund som öppnar
         presentkortet ser kronor.
Bevis:   (a) D/land-NL.json → kassa.rader "Matstrumpor.se Checkout". (b) underlag-nl.json → optionvarde.presentkort.name
         "150,00 kr". Presentkortssidan är inte öppnad som kund i NL.
Förslag: Axel avgör om det spelar roll. Presentkortet: se `marknader/presentkort.mjs` (körs aldrig av granskaren).
Vem:     Axel
```

## Bekräftat eller nyanserat ur del B

- **G-B05 (NL 001, "teken")**: bekräftat, se G-C-NL-04.
- **007 "Socken"**: Whispers helfilstranskript skrev "sushi-socken" (1,9 s) och "Socken." (15,3 s), vilket hade varit tyskt uttal av produktordet. Egen omlyssning på utsnitten 0–5 s och 13–18 s med språket låst till nl gav "sushisokken(0.80)", "Sokken.(0.93)" och "sokken?(0.95)". Produktordet går fram, och det var Whispers stavning. Inget fynd.
- **002 "Vijf paars … afhaaldoost"** (Whisper): täckningen är 0,93. Troligen Whisper. Inget fynd, men lyssna om 002 ändå öppnas för G-C-NL-04.
- **004, två textrutor samtidigt** (B:s 🟡): gäller även NL ("Een van deze pizza's is nep." + "De neppizza? Sokken." vid 2,0 s; "Twee keer kijken. Dan lachen." + "De neppizza? Sokken." vid 4,0 s). Inget nytt.
- **008, sex lådor i bild men fyra i erbjudandet** (B:s 🔵): texten säger rätt ("Je krijgt vier dozen", "twintig paar", "Het zijn 20 paar sokken"). Korgen ger 4 lådor och 2 betalda för €89,80 (D/land-NL.json → korg). Inget nytt.
- **Erbjudandet mot korgen**: "Koop 1 – krijg 1" (001–007, videon säger "twee dozen voor de prijs van één") och "Koop 2 – krijg 2" (008) stämmer med paketväljaren och korgen. "Gratis verzending" stämmer med fraktrutan "Gratis verzending naar Nederland". "4 soorten" stämmer med sortimentet (sushi, pizza, burger, donut).

## Kan inte mätas härifrån

- **Spårningssidan på .com**: https://matstrumpor.com/nl/pages/spara?country=NL svarade 503 "There was a problem loading this website" vid mätningen 14:41 UTC (D/sparning-nl.json → com). Mejlets länk på .se/nl fungerade (200, nederländska). Om .com är trasig eller bara var tillfälligt nere avgörs med en ny mätning.
- **Kassans förvalda land och frakt**: kassan listar länderna men datan visar inte om Netherlands är förvalt, och frakten syns först med adress (inget skrevs in, enligt reglerna).
- **Judge.me-recensionerna** står på svenska ("Strumppaketen var så roliga …"). Det är ett känt beslut (översätts inom 48 h från 2026-09-29).
- **Tonfall och läppsynk i 001–003** har inte bedömts med öron. Bara täckningssiffrorna och egna utsnitt ovan.
- **Det svenska originalet till 012v2:s sju bildrutor** finns inte som text i repot. Jämfört mot US-versionen (egna/US/012v2.json) och bilden. Betydelsen stämmer.
- **Shopifys egna mallar "Bestelling {{ name }} is bezorgd"** bär Shopifys standardöversättning, t.ex. "Bestel {{ order_name }}", där det borde stå "Bestelling". Det är Shopifys text och inte vår. Den nämns här bara för fullständighetens skull.

---

# Bilaga: Del C — språket (es)


Granskare C-es, 2026-09-30. Läs-bart: inga nätanrop, allt ur insamlat material.
Källor: `A/annonser.json` (Metas copy, ES 001–008, `copy_diff` tom = Meta lika med `annonser/ES.json`),
`B/transkript/ES-00*.txt`, `B/bildtext/ES-00*.txt`, `heygen/srt/ES/`, `egna/ES/*.json`, `egna/d3/texter/ES.json`,
`D/land-ES.json` (mätt 14:36 UTC), `D/sparning-es.json`, `D/mejl-es.json`, `output/underlag-es.json` mot `underlag-sv.json`,
`D/frakt.json`, `D/tabell.md`.

Summering: 🔴 1 · 🟡 9 · 🔵 6. Alla ES-annonser är PAUSED (A/annonser.json: `status`/`effective_status` PAUSED).

Kontrollerat utan fynd (grönt enligt det jag läst):
- Språket i annonser, tal och bild är spanska (Spanien) i alla åtta. Inga svenska ord, ingen butik, ingen domän, inget pris i bild. Ingen moms- eller tulltext i annonserna eller på produktsidan (`momsrader: []`, `taxnote: [""]`).
- "Una marca sueca." står som sista rad. Inget "fabricado/diseñado en Suecia".
- Erbjudandet stämmer med korgen. 002/003 säger "dos cajas por el precio de una" och länkbeskrivningen "Compra 1 – Llévate 1 GRATIS" = paketväljaren "Recibes 2 cajas – pagas 1", 44,90 €. 008 "Compra 2 – llévate 2 gratis … veinte pares" = korgen: 4 lådor, 2 betalda, 4 par pinnar, 89,80 EUR (`land-ES.json → korg`).
- "Envío gratis": ES ligger i zonen Europa med "Fri frakt" 0 kr (`D/frakt.json`). Fraktrutan säger "Envío gratis a España" med es.svg.
- Valutaformatet på produktsidan (44,90 €) och datumet ("7 de octubre – 14 de octubre") är spanska. Loggan är "Matstrumpor" utan .SE.
- Spårningssidan (`/es/pages/spara`) och de tre fraktmejlen är på spanska och säger rätt sak. Ett påhittat nummer gav "No encontramos ese número".
- Julvinkeln i 001 är lokaliserad: svenskans "spara till julstrumpan" har blivit "guárdalos para Reyes", alltså trettondagen, när man ger presenter i Spanien. Det är bra.
- Talet går fram replik för replik. seglyssna gav 0,97 / 0,99 / 0,975 på 001–003, och segmenten gav 0,994 / 1,0 / 1,0 på 005–007. Produktordet "calcetines" hörs rätt överallt.

---

## 🔴

```
G-C-es-01 🔴  ES, alla annonser: korgen och kassan är på engelska
              (efter "Agregar al carrito" på annonsens länk)
Vad:     En spansk kund som trycker på köpknappen hamnar i en engelsk korg och en engelsk kassa.
         Produktsidan är på spanska, men efter köpknappen byter sajten språk.
         Kassan visar dessutom butiksnamnet "Matstrumpor.se".
Bevis:   D/land-ES.json, mätt 2026-09-30 14:36 UTC med kund.mjs, Chromium, webbläsarspråk es-ES:
         - efter_lagg_i.url "https://matstrumpor.com/cart", html_lang "en".
         - texter.korg_dit_kunden_hamnar: "Your cart", "Real wooden chopsticks", "Sushi Socks", "Check out".
         - kassa.url ".../checkouts/cn/…/en-es", lang "en-ES", raderna "Matstrumpor.se Checkout",
           "Delivery", "Country/Region", "Pay now", "Finalize order".
         - Den spanska korgen finns (/es/cart: "Tu carrito", "Pagar pedido"), men kunden skickas inte dit.
         - D/tabell.md visar samma "en-XX ❌" i alla icke-engelska länder, alltså inte bara ES.
         - Temats JS skickar till rutt+"cart" (D/js). Varför rutten blir "/" i stället för "/es/" har jag inte utrett.
Förslag: Låt köpknappen gå till språkmappens korg (/es/cart), så att kassan öppnas på es-ES.
         Rödpröva först med en ny mätning. Fyndet är sannolikt samma som D-granskarens och ska föras som ETT fynd för alla språk.
         Utförs aldrig av granskaren.
Vem:     byggarsessionen (temat, ms-paket-JS)
```

## 🟡

```
G-C-es-02 🟡  ES 001–007, brödtexten (samma i sju annonser)
Vad:     "Nadie celebra un detergente." är en ordagrann översättning av svenskans "Ingen jublar åt tvättmedel",
         och den låter stel på spanska.
         Sajten använder den naturliga formen för samma mening.
         "No se queda en la caja después. Está en tus pies" står i singular, men det som avses är 5 par, alltså plural.
Bevis:   A/annonser.json → brodtext: "Nadie celebra un detergente. Nadie guarda un regalo de broma. … No se queda en la caja
         después. Está en tus pies, semana tras semana."
         Sajten (underlag-es.json → produkt.sushi-strumpor.body_html): "A nadie le hace ilusión un detergente."
Förslag: "A nadie le hace ilusión un detergente. Nadie guarda un regalo de broma. … Después no se quedan en la caja:
         los llevas puestos semana tras semana." Ny rad skrivs av sonnet i rättningssessionen (CLAUDE.md regel 6).
Vem:     byggarsessionen
```

```
G-C-es-03 🟡  ES 001–007, länkbeskrivningen
Vad:     "4 tipos." är oklart. Annonsen och länken gäller sushilådan, och en kund kan läsa det som att lådan har fyra sorter.
         Svenskan och videorna menar fyra olika produkter: sushi, pizza, hamburgare och donut.
         "Tipos" är också ett torrt ord för det.
Bevis:   lankbeskrivning "4 tipos. Compra 1 – Llévate 1 GRATIS. Envío gratis." (A/annonser.json, ES.json).
         Jämför 001:s tal "Cuatro diseños que engañan totalmente al ojo".
Förslag: Stryk "4 tipos." eller skriv "4 diseños.". Ny rad av sonnet.
Vem:     byggarsessionen
```

```
G-C-es-04 🟡  ES 004 (MATSTRUMP_ES_sushi_gift_anim_004_v1, 120251773848300023), ruta 4, 6,1–8,0 s
Vad:     "Lo tuyo no se presta." låter som en regel ("det egna lånar man inte ut") och säger inte
         originalets poäng, att ingen tar dina strumpor (US: "Nobody borrows yours.").
Bevis:   egna/ES/012v2.json texter[3]. OCR 7,0 s "Lo tuyo no se presta." (B/bildtext/ES-004.txt).
Förslag: "Nadie te los quita." eller "Estos no te los roban." Rendera om 012v2 för ES (gratis, ingen röst).
Vem:     byggarsessionen (egna/rendera-012v2.py)
```

```
G-C-es-05 🟡  ES 005 (…_ugc_005_v1, 120251777864820023), sista repliken 46,5–48,5 s
Vad:     Manuset säger "Pincha ya en el enlace", men Whisper hör "Pincha allá en el enlace" (täckning 0,88).
         "Pincha allá" låter konstigt. Samma replik hörs rätt i 006 med samma röstväg,
         så felet ligger troligen i ljudet och inte hos Whisper.
Bevis:   B/transkript/ES-005.txt #20: manus "Pincha ya en el enlace y míralo todo." / hört "Pincha allá en el enlace y míralo todo."
         ES-006 #18 hört "Pincha ya en el enlace".
Förslag: Lyssna på 46,5 s. Hörs "allá": gör om repliken (ElevenLabs, egna/dubba.mjs).
Vem:     byggarsessionen / Axel lyssnar
```

```
G-C-es-06 🟡  ES 007 (…_ugc_007_v1, 120251777883330023), 4,8–7,1 s
Vad:     "Monté esta empresa de pura rabia." betyder "jag startade företaget av ren ilska", och det låter aggressivt på spanska.
         Poängen i manuset är frustration över presentletandet. Se även G-C-es-13 om påståendet.
Bevis:   egna/ES/s001h1.json + B/transkript/ES-007.txt #2 (hört ordagrant).
Förslag: "Monté esto por pura frustración." (eller "harta de…"). Ny rad av sonnet, sedan ny ElevenLabs-replik.
Vem:     byggarsessionen
```

```
G-C-es-07 🟡  ES 005 + 006, talet och bildtexten
Vad:     Talspråket skaver på några ställen:
         - "la calidad-precio es una locura/brutal" (det normala är "la relación calidad-precio").
         - "Es de esos regalos donde el listo eres tú" (det normala är "en los que").
         Det går att förstå och det låter vardagligt, men en spanjor hör översättningen.
Bevis:   B/transkript/ES-005.txt #8, #17; ES-006.txt #7.
Förslag: Nästa gång videon görs om: "la relación calidad-precio es una locura", "de esos regalos en los que el listo eres tú".
         Inte värt en egen rendering.
Vem:     byggarsessionen
```

```
G-C-es-08 🟡  Sajten ES: knappar och Judge.me-rutan
Vad:     - "Agregar al carrito" är latinamerikanskt. I Spanien säger man "Añadir al carrito" / "Añadir a la cesta".
         - Judge.me-rutan har kvar engelska ("Sort reviews by"), ett amerikanskt datum ("09/28/2026") och decimalpunkt ("4.4").
           Trustpilot-raden bredvid skriver "4,2".
Bevis:   D/land-ES.json → texter.produktsida: "Agregar al carrito", "Sort reviews by", "4.4", "09/28/2026".
Förslag: Temats es-sträng för lägg-i-knappen → "Añadir al carrito". Judge.me: sätt datumformat och språk i appen.
         Att recensionerna står på svenska är ett känt beslut och räknas inte här.
Vem:     byggarsessionen
```

```
G-C-es-09 🟡  Sajten ES: köptexten och spårningssidan, små översättningsrester
Vad:     - "el papel se rasga en silencio" är en ordagrann översättning av "pappret rivs av i tystnad" och är obegripligt på spanska.
         - "Si no funciona, simplemente lo devuelves" säger "om den inte fungerar" om strumpor. Det naturliga är "si no te convence".
         - Spårningssidan skriver "Comprueba que pegaste el número", en latinamerikansk tempusform.
           I Spanien skriver man "que has pegado".
Bevis:   D/land-ES.json texter.produktsida; D/sparning-es.json svar_pahittat.text.
Förslag: "Lo práctico es útil, pero nadie lo abre con ilusión." / "Si no te convence, lo devuelves." / "Comprueba que has pegado".
Vem:     byggarsessionen (underlag-es.json, sparning/sprak/es.json)
```

```
G-C-es-10 🟡  ES 001 (…_ugc_001_v1, 120251773393680023), 5,5–9,6 s
Vad:     "Es como si lo supieras todo de esa persona. ¡Si hasta sabías su plato favorito!" blandar tempus (supieras/sabías),
         och andra meningen låter som en förebråelse.
Bevis:   heygen/srt/ES/matstrumpor_nathalie.srt #3; hört ordagrant (B/transkript/ES-001.txt).
Förslag: Lågt prio, eftersom det är en HeyGen-video och dyr att göra om. Bara vid en ny rendering: "¡Si hasta sabes cuál es su plato favorito!".
Vem:     Axel avgör
```

## 🔵 Frågor till Axel och idéer

```
G-C-es-11 🔵  ES 003 (…_jul_ugc_003_v1, 120251773397880023): julstrumpan i Spanien
Vad:     "el único sushi que cabe en un calcetín de Navidad" bygger på julstrumpan, som inte är en spansk tradition.
         I Spanien kommer presenterna vid Reyes. 001 är redan anpassad till Reyes, men 003 är det inte.
         Skämtet förstås, men det slår svagare. Inget leveranslöfte finns, så det är inte fel.
Bevis:   B/transkript/ES-003.txt #1; heygen/srt/ES/matstrumpor_sofie_h2.srt.
Förslag: Behåll, eller låt 003 få mindre budget i ES. Ska den göras om: "…que cabe en el zapato de Reyes".
Vem:     Axel
```

```
G-C-es-12 🔵  ES 001: "Se agotaron en noviembre … antes de que vuelva a pasar"
Vad:     Påståendet om att lådan tog slut gäller Sverige 2025. Det är sant och står på sajten ("El año pasado la caja de sushi se agotó
         en noviembre."), men en spanjor läser det som en brist i Spanien. Knapphetsargument granskas hårt i spansk
         konsumenträtt (Ley 3/1991, praxis sobre disponibilidad limitada).
Bevis:   B/transkript/ES-001.txt rad 1 och 8; D/land-ES.json texter.produktsida.
Förslag: Går att försvara som det står. Vill du vara helt säker: nästa version säger "el año pasado".
Vem:     Axel
```

```
G-C-es-13 🔵  ES 007: "Monté esta empresa…" sägs av en AI-röst över olika AI-personer
Vad:     Påståendet "jag startade företaget" läggs i munnen på en påhittad person. Det är samma som i det svenska originalet.
Bevis:   egna/ES/s001h1.json #2; B/bildtext/ES-007.txt (olika AI-personer).
Förslag: Axel avgör. Samma fråga gäller alla språk (B har den redan).
Vem:     Axel
```

```
G-C-es-14 🔵  Sajten ES: jämförpriset i paketväljaren
Vad:     Paketet "Compra 1 – Llévate 1" visar 44,90 € med 101,60 € överstruket, medan "Precio habitual" är €44,90 per låda.
         101,60 € = 2 × 44,90 € + pinnarnas "valor €11,80". Det överstrukna priset räknar alltså in presentens värde.
         Spansk lag (art. 20 TRLGDCU efter RDL 24/2021, Omnibus) kräver att ett överstruket "före"-pris är det lägsta priset de senaste 30 dagarna.
         Här har kombinationen aldrig sålts för 101,60 € i Spanien, och butiken öppnade 27/9.
Bevis:   D/land-ES.json → paket[0] nu "44,90 €", forr "101,60 €", gava "… valor €11,80"; texter "Precio habitual", "€44,90".
Förslag: Fråga till Axel och en jurist. Alternativet är att visa "2 al precio de 1" utan överstruket belopp i EU.
         Ingen ändring utan ägarens beslut (pris = regel 12).
Vem:     Axel
```

```
G-C-es-15 🔵  Fraktpolicyn på spanska nämner en importavgift
Vad:     "también es posible que tengas que pagar una tasa de importación". Axels regel är ingen tulltext.
         Inom EU stämmer det dessutom inte för en spansk kund. Policyerna låg utanför mitt paket,
         men meningen står i policyn som länkas i sidfoten.
Bevis:   output/underlag-es.json → sida.fraktpolicy.body_html.
Förslag: Låt policyägaren/rättningssessionen avgöra. Jag nämner det bara.
Vem:     Axel / byggarsessionen
```

```
G-C-es-16 🔵  Sajten ES: "Entrega estimada 7 de octubre – 14 de octubre" (mätt 30/9)
Vad:     12 oktober är nationell helgdag i Spanien (Fiesta Nacional). Räknat med den blir 10 arbetsdagar den 15/10, inte den 14/10.
         Det skiljer en dag och är ett uppskattat datum, inte ett löfte.
Bevis:   D/land-ES.json texter.produktsida.
Förslag: Ingen åtgärd krävs. Nämns för fullständighet.
Vem:     —
```

## Kan inte mätas härifrån

- **Ljudet med örat.** Allt om talet bygger på Whisper medium och seglyssna (B). Ingen människa har lyssnat på ES 005 vid 46,5 s (G-C-es-05).
- **ES 004:s transkript** "Subtítulos por la comunidad de Amara.org" (12,7 s) är en Whisper-hallucination på ren musik. Videon har ingen röst (B). Det är inget fynd.
- **Kassan efter adress.** Fraktsats, skatterader och betalsätt på es-ES syns först när en adress skrivits in, och det får jag inte göra.
- **Spoks mejlflöden på spanska.** Jag har inte läst dem. Utan Spoks-verktyg i paketet.
- **Judge.me:s översättning** av recensionerna. Den är ett känt beslut och tar upp till 48 h.
- **Paketet "Compra 1 – Llévate 1"** har inte prövats i korgen. Bara "Compra 2 – Llévate 2" är mätt, och det gav 4/2/4 = 89,80 €.

---

# Bilaga: Del C — språket (it)


Granskat 2026-09-30 som infödd italiensk kund och marknadsförare. Läs-bart: inga nätanrop, inga rättningar.
Källor: `A/annonser.json` (kod IT, 8 annonser, `copy_diff` tom på alla, alltså Meta = `annonser/IT.json`), `B/transkript/IT-00*.txt`, `B/bildtext/IT-00*.txt`, `B/ark/1107473718670489-1.jpg` (004, tittat), `heygen/srt/IT/*.srt`, `egna/IT/*.json`, `egna/d3/texter/IT.json`, `D/land-IT.json`, `D/sparning-it.json`, `D/mejl-it.json`, `output/underlag-it.json` mot `underlag-sv.json`, och de svenska transkripten.

Sammanfattning: **1 🔴, 11 🟡, 5 🔵.** Annonstexterna har inget falskt påstående, ingen butik eller domän, ingen moms- eller tulltext och inget leveranslöfte. Erbjudandet i annonserna stämmer med korgen (2 lådor 44,90 € resp. 4 lådor 89,80 € med ätpinnar). Det röda fyndet gäller sajten: korgen och kassan byter till engelska.

---

```
G-C-it-01 🔴  Sajten IT, korgen och kassan efter "Aggiungi al carrello" (alla 8 IT-annonser landar här)
Vad:     Kunden har läst hela produktsidan på italienska. Efter klicket på "Aggiungi al carrello" hamnar hen i en
         engelsk varukorg och sedan i en engelsk kassa. Det är fel språk i själva köpet.
Bevis:   D/land-IT.json (mätt 2026-09-30 14:06 UTC):
         efter_lagg_i.url "https://matstrumpor.com/cart", html_lang "en" (produktsidans root "/it/").
         korg_dit_kunden_hamnar: "Your cart", "Real wooden chopsticks", "Sushi Socks", "Pairs: 5 pairs", "Check out".
         kassa.url ".../checkouts/cn/.../en-it", lang "en-IT", rader "Matstrumpor.se Checkout", "Email me with news and offers",
         "Country/Region", "Sweden" först i listan, provinserna på engelska ("Florence", "Genoa", "Milan").
         Korgen på språkmappen (/it/cart) är däremot italiensk: "Il tuo carrello", "Vere bacchette di legno", "Check-out".
         Samma mönster i land-DE/ES/FR/NL/PL/PT/DK/FI/NO/AT/BE (kassa en-XX), men inte i JP, TW eller NOB, som stannar på sitt språk.
         Mätningen är gjord i D-agentens Chromium, men land-DE-enbrowser.json ger samma resultat, så det beror inte på webbläsarens språk.
Förslag: Låt paketväljarens JS skicka kunden till `{{ routes.cart_url }}` (/it/cart) i stället för /cart, så att kassan ärver
         locale it. Pröva som kund i Italien efteråt. Granskaren utför det aldrig.
Vem:     byggarsessionen
```

---

```
G-C-it-02 🟡  IT 001, 002, 003, 004, 005, 006, 007 — brödtexten (samma i sju annonser)
Vad:     "Non resta nella scatola dopo. È ai tuoi piedi, settimana dopo settimana." står i singular utan subjekt.
         Närmaste substantiv är "una scatola", så meningen läses som "lådan blir inte kvar i lådan, den är vid dina fötter".
         "dopo" sist i meningen låter översatt. "Nessuno festeggia un detersivo" är också styvt. Sajten säger "Nessuno esulta
         per il detersivo", vilket är bättre.
Bevis:   A/annonser.json, brodtext för 120251773106790023 m.fl.: "Non resta nella scatola dopo. È ai tuoi piedi, settimana dopo settimana."
Förslag: t.ex. "Non restano nella scatola: li indossi settimana dopo settimana." samt "Nessuno esulta per un detersivo."
         Den nya raden skrivs av sonnet i rättningssessionen.
Vem:     byggarsessionen
```

```
G-C-it-03 🟡  IT 001, 004, 005, 006, 007 — rubriken "Divertente stasera. Ai tuoi piedi domani."
Vad:     Adjektivet står i singular utan substantiv. "Ai tuoi piedi" är dessutom ett idiom som betyder "vid dina fötter", som i
         "il mondo ai tuoi piedi" (underkastelse, beundran), inte "på dina fötter". Rubriken går att förstå men låter översatt.
Bevis:   A/annonser.json rubrik. Sajtens version är bättre: "sono divertenti stasera e ai tuoi piedi domani" (underlag-it, body_html).
Förslag: t.ex. "Stasera fanno ridere. Domani li indossi."
Vem:     byggarsessionen
```

```
G-C-it-04 🟡  IT 001–007 — länkbeskrivningen "4 tipi. Compri 1 – Ricevi 1 GRATIS. Spedizione gratuita."
Vad:     "4 tipi" låter torrt. "4 varianti" eller "4 gusti" (som i 004:s "Quattro gusti") är naturligare. Annonsen säger dessutom
         "Compri 1 – Ricevi 1" medan sajtens paketväljare säger "Compra 1 – Ricevi 1 GRATIS". Båda är korrekt italienska
         (indikativ resp. imperativ), men erbjudandet får olika namn i annonsen och på sajten.
Bevis:   A/annonser.json lankbeskrivning; D/land-IT.json paket[0].rubrik "Compra 1 – Ricevi 1 GRATIS".
Förslag: Välj en form på båda ställena, gärna sajtens "Compra 1 – Ricevi 1 GRATIS".
Vem:     byggarsessionen
```

```
G-C-it-05 🟡  IT 001 (MATSTRUMP_IT_sushi_gift_ugc_001_v1, 120251773106790023) — undertext och tal, replik 2
Vad:     Betydelsefel. Svenskan säger "Du visste ju deras favoriträtt" (givaren känner mottagarens favoriträtt). Italienskan säger
         "Anche il tuo piatto preferito." ("Också din favoriträtt"), alltså givarens egen.
Bevis:   heygen/srt/IT/matstrumpor_nathalie.srt #2 "Anche il tuo piatto preferito."; transkript/09-17_Nathalie_captions_musik.srt #2
         "Du visste ju deras favoriträtt."
Förslag: "Anche il suo piatto preferito." eller "Conosci il suo piatto preferito." Det är HeyGen, så en omrendering kostar krediter.
         Axel avgör om det är värt det.
Vem:     byggarsessionen / Axel
```

```
G-C-it-06 🟡  IT 001 — öppningen "Questo è il tuo segno. Esauriti a novembre."
Vad:     "Questo è il tuo segno" är en ordagrann översättning av "this is your sign" och låter översatt. "Esauriti a novembre." utan verb och
         utan "lo scorso" kan läsas som att varan är slutsåld nu eller kommer att ta slut i november. Svenskan är i preteritum,
         "De såldes slut i november". Slutet av videon säger rätt "Si sono esauriti lo scorso novembre".
Bevis:   SRT #1; transkript IT-001 [00:00–00:05].
Förslag: "Ecco il segno che aspettavi. L'anno scorso sono andati esauriti a novembre."
Vem:     byggarsessionen
```

```
G-C-it-07 🟡  IT 001, 002, 003, 006 — produktord som Whisper hör fel (lyssna)
Vad:     Whisper hör tre repliker annorlunda än manus. Det kan vara Whisper, men de ska lyssnas på:
         - 001 #1: "so tutto di te" hörs "son tutto di te" ("jag är helt din"). Betydelsen byts om det verkligen låter så.
         - 002 #1 och 003 #1: "da asporto" (takeaway) hörs "da sport" / "da sporto". Det är ordet som bär hela idén med lådan.
         - 006 #8 (17,9 s): "cinque paia" hörs "cinque paglia" ("fem halm").
Bevis:   B/transkript/IT-001.txt #1, IT-002.txt #1, IT-003.txt #1, IT-006.txt #8 (seglyssna och Whisper medium, 2026-09-30).
Förslag: Lyssna på 001 ca 6 s, 002 ca 8 s, 003 ca 8 s och 006 ca 18 s. I 006 (ElevenLabs) är en omgenerering av en replik billig.
Vem:     Axel lyssnar / byggarsessionen
```

```
G-C-it-08 🟡  IT 004 (MATSTRUMP_IT_sushi_gift_anim_004_v1, 120251774066780023) — bildtexterna 4 och 5
Vad:     "Il tuo non si presta." (= "Din lånas inte ut") saknar substantiv. Det går att förstå bara tack vare namnlapparna i bilden.
         "Nel cassetto, / tra quelli normali" saknar verb och punkt, och läses som ett fragment ("I lådan, bland de vanliga").
         Rutornas överlapp (G-B04) bekräftas i IT: vid 2 s ligger "è finta" halvt under "La finta?". Vid 4 s står
         "La finta? Sono calzini." kvar under "Prima non ci crede". Vid 10 s ligger "Nel cassetto," kvar ovanför "A ognuno il suo.",
         och vid 12 s ligger "A ognuno il suo." kvar under "Quattro gusti".
Bevis:   egna/IT/012v2.json texter[3], texter[4]; B/ark/1107473718670489-1.jpg (tittat, rutorna 2,0 / 4,0 / 10,0 / 12,0 s).
Förslag: t.ex. "Il tuo paio non si presta." och "Nel cassetto, in mezzo a quelli normali." Rättelsen av överlappet står i G-B04.
Vem:     byggarsessionen
```

```
G-C-it-09 🟡  IT 007 (MATSTRUMP_IT_sushi_gift_ugc_007_v1, 120251779099030023) — "Ho aperto quest'attività per pura rabbia."
Vad:     "per pura rabbia" betyder "av ren ilska/raseri" och låter aggressivt på italienska. Svenskans "ur en ilska" har NO/US/FR
         översatt med "frustration". "per pura frustrazione" är det idiomatiska. "Gli spaiati sono la norma" är också styvt
         ("I calzini spaiati sono la norma").
Bevis:   egna/IT/s001h1.json; B/transkript/IT-007.txt #2 (hörs som manus).
Förslag: "Ho aperto quest'attività per pura frustrazione." (ElevenLabs, billig omgenerering).
Vem:     byggarsessionen
```

```
G-C-it-10 🟡  IT 008 (MATSTRUMP_IT_sushi_offer_static_008_v1, 120251779586620023) — underrubriken i bild
Vad:     "Sembra da asporto." saknar substantiv och låter halvfärdigt. Sajten säger "sembra da asporto" om scatola, med substantiv.
Bevis:   egna/d3/texter/IT.json underrubrik "Sembra da asporto. Sono 20 paia di calzini."
Förslag: "Sembra cibo da asporto. Sono 20 paia di calzini."
Vem:     byggarsessionen
```

```
G-C-it-11 🟡  Sajten IT, produktsidan — valutaformatet och Judge.me
Vad:     På samma sida står "44,90 €" (italienskt) i paketväljaren men "valore €11,80" och "€44,90" i köprutan. Korgen visar
         "€89,80 EUR". Judge.me-rutan har en engelsk etikett, "Sort reviews by", ett amerikanskt datum "09/28/2026" och
         "Anonym" (svenska). Att recensionerna är på svenska är ett känt beslut och räknas inte här.
Bevis:   D/land-IT.json texter.produktsida ("44,90 €", "valore €11,80", "€44,90", "Sort reviews by", "09/28/2026", "Anonym").
Förslag: Enhetligt "44,90 €". Judge.me-etiketterna ändras i Judge.me:s språkinställning för it.
Vem:     byggarsessionen
```

```
G-C-it-12 🟡  Spårningssidan /it/pages/spara — texten för "hittar inte"
Vad:     "Allora il pacco è in arrivo qui" läses som att paketet är på väg HIT (till kunden, eller till sidan?). Det låter översatt.
Bevis:   D/sparning-it.json svar_pahittat.text.
Förslag: "Allora il pacco comparirà qui a breve".
Vem:     byggarsessionen
```

---

```
G-C-it-13 🔵  Sajten IT — genomstruket pris och EU:s Omnibusregler (art. 17-bis Codice del consumo)
Vad:     Paketen visar "44,90 €" med "101,60 €" överstruket (resp. 89,80 / 203,20). I Italien bevakar AGCM att ett överstruket
         pris som visar en prissänkning ska vara det lägsta priset de senaste 30 dagarna. Om 101,60 € (= 2 × 50,80) aldrig har
         varit ett faktiskt pris är det en risk. Det går inte att mäta härifrån.
Bevis:   D/land-IT.json paket[].nu/forr.
Fråga:   Har 50,80 €/låda någonsin varit priset i IT? A) ja, B) nej, ta bort överstrykningen i EU, C) fråga Chadbot.
Vem:     Axel
```

```
G-C-it-14 🔵  Kassan — "Matstrumpor.se Checkout"
Vad:     Kassans rubrik bär butiksnamnet med .se för en italiensk kund (och på engelska, se G-C-it-01). Loggan är rätt, men titeln
         kommer ur butikens namn i Shopify.
Bevis:   D/land-IT.json kassa.rader[2].
Vem:     Axel (butikens namn i Shopify är hans beslut)
```

```
G-C-it-15 🔵  IT 004 — namnlappar i bilden
Vad:     Vid 7 s bär lådorna handskrivna lappar med svenska förnamn, "Lars" och "Astrid". Det är inte svensk text i egentlig mening
         och inget fel, men en italiensk kund ser nordiska namn.
Bevis:   B/ark/1107473718670489-1.jpg ruta 7,0 s.
Vem:     Axel
```

```
G-C-it-16 🔵  IT 003 — julvinkeln är översatt till Befana. Bra, men videon visar en julstrumpa.
Vad:     Italienskan säger "l'unico sushi che va nella calza della Befana" (6 januari). Det är en bra kulturell anpassning och inget
         leveranslöfte. Bilden visar en julstrumpa, och i Italien är "la calza della Befana" också en strumpa, så det håller.
         Samma sak gäller 001 ("tienili per la Befana").
Vem:     information
```

```
G-C-it-17 🔵  IT 008 — sex lådor i bild, fyra i erbjudandet
Vad:     Samma iakttagelse som B. Texten säger rätt: "quattro scatole", "20 paia". Korgen ger 4 lådor och 4 par ätpinnar för 89,80 €.
Bevis:   D/land-IT.json korg (lador_strumpor 4, betalda_lador 2, pinnar 4, total 89.8 EUR).
Vem:     Axel
```

## Prövat och rätt (inga fynd)
- Alla 8 annonser: "Un marchio svedese." sist i brödtexten. Varken "prodotto/fatto in Svezia", butiksnamn, domän, moms, tull eller leveransdatum.
- Erbjudandet: 001–007 lovar "2 scatole al prezzo di una" / "Compri 1 – Ricevi 1", vilket stämmer med paketet sushi-2 (44,90 €). 008 lovar "Compri 2 – ricevi 2, venti paia", vilket stämmer med korgen (4 lådor, 2 betalda, 89,80 €, 4 par pinnar).
- "Taglia unica, dal 36 al 44" stämmer med sajten ("Taglia 36–44").
- Tilltalet är genomgående "tu" i annonser, sajt, spårning och mejl.
- "L'anno scorso la scatola sushi è finita a novembre" och "Si sono esauriti lo scorso novembre" är sanna enligt CLAUDE.md.
- Fraktmejlen (tre egna mallar och två Shopify-standard) har ämne och brödtext på italienska. Inga svenska rester.
- Sajtens köptexter (underlag-it) är korrekta och naturliga. De tomma fars dag- och jul-raderna är rätt (bara på svenska).

## Kan inte mätas härifrån
- Uttal och tonfall. Whisper är inte facit (G-C-it-07 ska lyssnas).
- HeyGens läppsynk i 001–003. Bara stillbilder är sedda.
- 005, 006, 007 och 008 är inte tittade på med egna ögon. Bildtexten bygger på OCR och B:s iakttagelser. Av 004 är ark 1 tittat.
- Om 101,60 € har varit ett faktiskt tidigare pris (G-C-it-13).
- Hur kassan ser ut för en riktig italiensk kund i en vanlig webbläsare (G-C-it-01 är mätt i Chromium från USA med landet satt).

---

# Bilaga: Del C — språket (pl)


Granskare: infödd läsning som kund + marknadsförare. Läs-bart, inget rättat. Källor: `A/annonser.json` (Meta 2026-09-30), `B/transkript/PL-*.txt`, `B/bildtext/PL-*.txt`, `heygen/srt/PL/`, `egna/PL/`, `egna/d3/texter/PL.json`, `D/land-PL.json` (2026-09-30 14:30 UTC), `D/sparning-pl.json`, `D/mejl-pl.json`, `output/underlag-pl.json`.

Alla åtta PL-annonser är PAUSED (status, configured och effective). `copy_diff` är tom för alla åtta, alltså är Metas text lika med `annonser/PL.json`. Enda skillnaden i repot är `copy.link_description` ("Otrzymaj" med stor bokstav), och den används inte i någon annons.

Bekräftat utan fynd:
- Ingen butik eller domän står i annonstexten.
- Ingen moms- eller tulltext.
- Inget "tillverkad/designad i Sverige", bara "Szwedzka marka.".
- Tilltalet är "ty" genomgående, som REGLER-EUROPA kräver.
- Siffrorna stämmer: 5 par per låda, 4 lådor ger 20 par, storlek 36–44.
- Erbjudandena i annonsen står också på sajten: "Kup 1 – otrzymaj 1 GRATIS" (2 lådor, betala för 1, 200 zł) och "Kup 2 – otrzymaj 2 GRATIS" (4 lådor, betala för 2, 400 zł). Korgen gav K2F2 (4 lådor, 2 betalda, 4 par pinnar à 0 zł, 400 PLN).
- 001 har lokaliserats bra: "spara till julstrumpan" blev "odłóż pod choinkę", och det passar polsk jul.
- 004:s "Napisy stworzone przez społeczność Amara.org" är Whispers hallucination på musik. Videon har ingen röst.

---

```
G-C-PL-01 🔴  PL-sajten efter "Dodaj do koszyka" (landningssidan för alla 8 PL-annonser)
Vad:     Kunden lägger i på den polska produktsidan men hamnar i en ENGELSK varukorg på matstrumpor.com/cart,
         och kassan öppnas på engelska (en-PL). Hela köpets sista steg är på fel språk.
Bevis:   D/land-PL.json: "efter_lagg_i": {"url": "https://matstrumpor.com/cart", "html_lang": "en", "produktsidans_root": "/pl/"};
         "korg_dit_kunden_hamnar": "Your cart", "Real wooden chopsticks", "Sushi Socks", "Pairs: 5 pairs", "Check out";
         kassan "url": ".../checkouts/cn/.../en-pl", "lang": "en-PL", rader "Delivery", "Pay now", "Finalize order".
         Samma korg på /pl/cart är polsk ("Twój koszyk", "Realizuj zakup"), så översättningen finns. Det är omdirigeringen som tappar /pl/.
Förslag: Paketväljarens JS (ms-paket) ska skicka till korgen med språkroten (routes.cart_url / Shopify.routes.root + 'cart'),
         och kassan ska sedan läsas om som polsk kund. Del D har troligen samma fynd för flera språk. Utförs aldrig av granskaren.
Vem:     byggarsessionen
```

```
G-C-PL-02 🟡  Brödtext, alla 7 videoannonser 001–007 (samma text), rad 1
Vad:     "Nikt nie świętuje proszku do prania. Nikt nie trzyma żartobliwego prezentu." är översatt ord för ord och låter konstigt.
         "świętować proszek" (fira tvättmedel) säger ingen. "nie trzyma" betyder i första hand "håller inte i", inte "sparar inte".
         Sajten har redan en bättre version av samma rad, så annonsen och produktsidan säger olika saker.
Bevis:   A/annonser.json brodtext (t.ex. 120251767862200023). Sajten (underlag-pl.json produkt.sushi-strumpor.body_html):
         "Nikt się nie cieszy z proszku do prania. Nikt nie trzyma żartobliwego gadżetu." Svenska: "Ingen jublar åt tvättmedel. Ingen sparar en skämtpryl."
Förslag: Använd sajtens rad 1 och byt "nie trzyma" mot "nie zatrzymuje" / "nikt nie zostawia sobie". Ny rad skrivs av sonnet i rättningssessionen.
Vem:     byggarsessionen
```

```
G-C-PL-03 🟡  Brödtext 001–007, rad 2, och 008 rad 3: "Odpowiedź na oba" / "zwiniętych jak maki"
Vad:     "Odpowiedź na oba" är klumpigt ("svaret på båda" utan substantiv), och det naturliga är "Odpowiedź na jedno i drugie".
         "Zwiniętych jak maki" går att läsa som "rullade som vallmo", eftersom "maki" också är pluralis av "mak" (vallmo).
         I sushisammanhang förstår de flesta, men det tar en extra sekund.
Bevis:   A/annonser.json brodtext: "Odpowiedź na oba: pudełko, … 5 par zwiniętych jak maki, drewniane pałeczki obok."
         008: "Zwinięte jak maki, a w każdym pudełku drewniane pałeczki."
Förslag: "Odpowiedź na jedno i drugie" och "zwinięte jak rolki maki" / "jak kawałki sushi" (sajten säger "zwiniętych jak kawałki sushi").
Vem:     byggarsessionen
```

```
G-C-PL-04 🟡  Rubrik 001, 004, 005, 006, 007 och brödtextens rad 3 (001–007): "Na twoich nogach"
Vad:     "Zabawa wieczorem. Na twoich nogach jutro." Uttrycket "być na nogach" betyder "vara uppe, vara på benen",
         så rubriken läses först som "du är på benen i morgon". Strumpor sitter "na stopach".
         Sajten säger rätt: "na stopach już rano". Brödtexten har samma fel: "Jest na twoich nogach, tydzień po tygodniu."
Bevis:   A/annonser.json rubrik och brodtext; underlag-pl.json: "te są zabawne dziś wieczorem i na stopach już rano".
Förslag: T.ex. "Zabawa dziś wieczorem. Na stopach już jutro." Ny rad av sonnet.
Vem:     byggarsessionen
```

```
G-C-PL-05 🟡  005 (120251778322760023) och 006 (120251778334920023): "Raz / Dwa / Trzy" i tal och rubriker
Vad:     Uppräkningen ETT/TVÅ/TRE blev "Raz, … Dwa, … Trzy, …" och rubrikerna "RAZ: SĄ PO PROSTU WYJĄTKOWE" osv.
         "Raz" används som räkneord bara när man räknar högt. I en mening läses det som "en gång" ("Raz, są po prostu wyjątkowe"
         = "En gång är de helt enkelt unika"). Det naturliga är "Po pierwsze / Po drugie / Po trzecie", eller "1. / 2. / 3." i rubriken.
Bevis:   egna/PL/haikuh3.json och haikuh2.json, texter.rubriker ["RAZ: SĄ PO PROSTU WYJĄTKOWE","DWA: TO SIĘ OPŁACA","TRZY: SPRAWIASZ IM RADOŚĆ"];
         transkript PL-005 [00:08.32] "Raz, są po prostu wyjątkowe.", PL-006 [00:04.10] samma.
Förslag: Rubrikerna kan bytas gratis (textlagret). Talet kräver ny ElevenLabs-dubbning och är ett pengabeslut, så låt det annars stå.
Vem:     byggarsessionen / Axel (om talet)
```

```
G-C-PL-06 🟡  007 (120251778343860023), 13–17 s: frasbyggnaden i talet
Vad:     Manuset lyder "Ale jednego nam wszystkim brakuje: skarpetek. Nie do pary? To codzienność."
         Whisper hör rösten dela det som "Ale jednego nam wszystkim brakuje. / Skarpetek nie do pary? / To codzienność."
         Stämmer det, lämnas första meningen utan objekt ("men en sak saknar vi alla." …). Whisper sätter själv skiljetecken,
         så det här är en misstanke som kräver lyssning, inget bevis.
Bevis:   transkript PL-007 [00:13.36–00:15.14] "Ale jednego nam wszystkim brakuje." [00:15.26–00:16.50] "Skarpetek nie do pary?"; egna/PL/s001h1.json 13,26–17,52 s.
Förslag: Lyssna. Hörs pausen efter "brakuje", ändra inget ändå: "Skarpetek nie do pary? To codzienność." går också att förstå.
Vem:     Axel / byggarsessionen
```

```
G-C-PL-07 🟡  Produktsidan PL: Judge.me-rutans format
Vad:     Judge.me-rutan har fyra fel.
         - Grammatik: "11 recenzje" (rätt: "11 recenzji"). Samma sida visar "11 recenzji" högre upp.
         - Decimalpunkt: "4.4". Polska skriver "4,4", och Trustpilot-raden intill säger "4,2".
         - Engelsk rest: "Sort reviews by".
         - Amerikanskt datum: "09/28/2026". Polska skriver 28.09.2026.
         De svenska recensionerna är ett känt beslut, eftersom Judge.me översätter inom 48 h. De räknas inte här.
Bevis:   D/land-PL.json texter.produktsida: "4.4", "11 recenzje", "Sort reviews by", "09/28/2026".
Förslag: Kolla Judge.me:s polska språkinställningar (datumformat, översättningen av sorteringen). Rör inte recensionerna.
Vem:     byggarsessionen
```

```
G-C-PL-08 🟡  Produktsidan PL: leveransestimatets datumformat
Vad:     "Szacowana dostawa 7 października – 14 października" upprepar månaden. Det naturliga är "7–14 października"
         (eller "7 – 14 października"). Datumen stämmer med 5–10 arbetsdagar räknat från 30/9. Det är inget löfte om en högtid.
Bevis:   D/land-PL.json texter.produktsida.
Förslag: Skriv månaden en gång när båda datumen ligger i samma månad (ms-delivery-estimate).
Vem:     byggarsessionen
```

```
G-C-PL-09 🟡  Produktsidan och startsidan PL, FAQ: "Każda para jest dostarczana w opakowaniu prezentowym"
Vad:     "Varje par levereras i presentförpackning" säger på polska tydligt att varje PAR får en egen förpackning.
         Så är det inte, eftersom 5 par ligger i en låda. Den svenska källan ("Alla par levereras i presentförpackning")
         är tvetydig, men polskan säger fel sak. En kund med fem par i en låda kan känna sig lurad.
Bevis:   underlag-pl.json tema.product.ms_faq_section.q3.a och tema.index.ms_faq.q3.a: "Tak. Każda para jest dostarczana w opakowaniu prezentowym…"
Förslag: "Tak. Każde pudełko to gotowe opakowanie prezentowe, które wygląda jak prawdziwe jedzenie."
Vem:     byggarsessionen
```

```
G-C-PL-10 🟡  Sajten PL: små inkonsekvenser (kosmetiskt)
Vad:     - "Ci"/"Twoje" skrivs ibland med versal och ibland utan på samma sida. Mejlen skriver alltid med versal.
         - FAQ-rubriken säger "Kup 1 – Otrzymaj 1", men paketväljaren säger "Kup 1 – otrzymaj 1".
         - Brickan heter "Najpopularniejsze", men bundle-pickern säger "Najpopularniejszy".
         - "O nas" säger att presenten "rozśmiesza odbiorcę do łez" (får mottagaren att skratta tills tårarna kommer),
           medan svenskan säger "skratta högt". Det är en överdrift som inte står i originalet.
Bevis:   Versalerna: "Twoje miejsce w klubie czeka", "Nie podoba Ci się?" mot "a pomożemy ci", "za chwilę … dla Ciebie"
         (spårningssidan), "jedzie do Ciebie" (mejlet).
         Övrigt: underlag-pl.json tema.product.ms_faq_section.q2.q; paket.*.bricka mot liquid.ms-bundle-picker.popularast; sida.om-oss.body_html.
Förslag: Välj EN form för tilltalet (i e-handel oftast versal: Ci/Twój), stort O → litet o, samma form på brickan och "do łez" → "na głos".
Vem:     byggarsessionen
```

```
G-C-PL-11 🟡  Spårningssidan PL (matstrumpor.com/pl/pages/spara), svaret på ett okänt nummer
Vad:     "Dopiero co przyszedł e-mail z wysyłką? Wtedy paczka jest już w drodze tutaj." betyder "paketet är redan på väg hit".
         Det låter som att paketet är på väg till kunden. Meningen ska säga att paketet snart syns på sidan.
         Dessutom saknas ett kommatecken: "napisz do kundsupport@matstrumpor.se a znajdziemy" ska vara "…matstrumpor.se, a znajdziemy".
Bevis:   D/sparning-pl.json com.svar_pahittat.text.
Förslag: "…Paczka wkrótce pojawi się na tej stronie." samt kommatecknet (sparning/sprak/pl.json).
Vem:     byggarsessionen
```

```
G-C-PL-12 🔵  003 (120251767868150023), julvinkeln i Polen
Vad:     "To musi być jedyne sushi, które naprawdę pasuje do świątecznej skarpety" (julstrumpan) syns också i bild 2–3 s.
         Julstrumpan är ingen polsk sed. Julklapparna ligger "pod choinką" på julafton, och den 6 december (Mikołajki)
         läggs små presenter i skon eller under kudden. Polacker känner igen strumpan från amerikanska filmer, så skämtet
         går fram, men det känns importerat. 001 har redan lokaliserats rätt ("pod choinkę").
Bevis:   heygen/srt/PL/matstrumpor_sofie_h2.srt #1; B/bildtext/PL-003.txt (julstrumpa i bild).
Förslag: Ingen åtgärd krävs. Idé för en senare version: en Mikołajki-vinkel (6/12, "do buta") i brödtexten, inte i videon.
Vem:     Axel
```

```
G-C-PL-13 🔵  Paketväljaren PL: överstrukna priser och polska Omnibus-regeln
Vad:     Paketen visar 200 zł mot överstruket "454 zł" och 400 zł mot "908 zł".
         454 = 2 × 200 zł + pinnarnas "wartość 54,00 zł", alltså ett paketvärde, inget tidigare pris.
         I Polen (ustawa o informowaniu o cenach, art. 4 ust. 2, Omnibus) ska en prissänkning visa det lägsta priset
         de senaste 30 dagarna. UOKiK är strikt med överstrukna priser som ser ut som rabatter. Det här är en juridisk
         fråga, inte språk, och inget fel är bevisat.
Bevis:   D/land-PL.json paket: "nu": "200 zł", "forr": "454 zł"; "gava": "… wartość 54,00 zł".
Förslag: Axel avgör, eller frågar redovisningskonsulten/juristen, om det överstrukna beloppet ska märkas "wartość zestawu" i stället för att stå som ett gammalt pris.
Vem:     Axel
```

```
G-C-PL-14 🔵  005, 006, 007: AI-rösten talar i första person
Vad:     Bekräftar B:s G-B07 för polskan. 007 säger "Założyłam tę firmę z czystej frustracji." (jag grundade företaget),
         och 005/006 säger "Mama mówi, że to jej ulubiony prezent." Det är en AI-röst över AI-bilder. Samma påståenden
         finns i det svenska originalet. I EU och Polen är påhittade konsumentomdömen en otillbörlig affärsmetod
         (UOKiK har drivit sådana fall). Frågan är om en berättarröst räknas som ett omdöme.
Bevis:   egna/PL/s001h1.json 4,84 s; egna/PL/haikuh3.json 32,70 s; haikuh2.json 28,28 s; transkripten PL-005/006/007.
Förslag: Axel avgör. Säker variant: "Tę markę założono z frustracji…" / "Mamy mówią, że…". Talet kräver då ny dubbning.
Vem:     Axel
```

```
G-C-PL-15 🔵  006 (120251778334920023) ~24,7 s: "kurzołap"
Vad:     Manuset säger "To nie kolejny kurzołap." (dammsamlare), men Whisper hör "burzołap". Det kan vara Whispers fel
         eller att rösten uttalar k som b. Ordet är inte avgörande, men "burzołap" betyder ingenting.
Bevis:   transkript PL-006 [00:24.72–00:26.02] "To nie kolejny burzołap." (täckning 0,9); haikuh2.json 22,98–26,14 s.
Förslag: Lyssna. Hörs "burzołap" tydligt, ta ställning till om repliken klarar sig.
Vem:     Axel / byggarsessionen
```

```
G-C-PL-16 🔵  Kassan (polsk kund): butiksnamnet "Matstrumpor.se" och BLIK
Vad:     Kassan har två saker att titta på.
         - Rubriken läses "Matstrumpor.se Checkout". Domänen .se syns alltså för en polsk kund. Det är Shopifys butiksnamn
           (skärmläsartext eller rubrik), inte annonstext. Loggan är redan utan .SE.
         - Kassan erbjuder BLIK, Polens vanligaste sätt att betala på nätet, men sajtens texter nämner det inte.
           Både "Płać, jak chcesz – Klarna, karta, Apple Pay lub Google Pay" och FAQ:n om betalsätt saknar BLIK.
Bevis:   D/land-PL.json kassa.rader ("Matstrumpor.se Checkout", "BLIK"); underlag-pl.json tema.index.trygghet.t.text, tema.product.ms_faq_section.q5.a.
Förslag: Idé: lägg till BLIK i de två polska texterna (en rad, gratis). Butiksnamnet är Axels beslut (gäller alla länder).
Vem:     Axel
```

## Kan inte mätas härifrån

- **Uttal, tonfall och läppsynk** i 001–003 (HeyGen) och 005–007 (ElevenLabs). Jag har bara Whisper, inget eget öra. Täckningen är hög (001 0,975, 002 0,93, 003 0,965, 005 1,0, 006 0,994, 007 1,0). Whisper hör "prawdziwy sushi" i 002 (rätt: "prawdziwe"), vilket kan vara Whisper. Produktordet "skarpetki" går fram i alla transkript.
- **Korgen för "Kup 1 – otrzymaj 1"** (002/003:s "dwa pudełka w cenie jednego" och länkbeskrivningen) i PLN. Bara K2F2 lades i korgen i D/land-PL.json. Paketväljaren visar K1F1 som 2 lådor för 200 zł, men korgen är inte prövad.
- **Vilket land kassan förväljer.** Landlistan i kassan börjar med "Sweden" före den alfabetiska listan (D/land-PL.json kassa.rader). Ur texten går det inte att avgöra om det är det valda landet eller bara första alternativet. Det hör till del D.
- **Fraktmejlen som riktiga mejl.** Bara mallarnas text är läst (D/mejl-pl.json), inga renderade mejl. Mallarnas polska är naturlig: "Twoja paczka jest w drodze", "Paczka dotrze dziś", "Przez pierwsze 2–4 dni śledzenie często nic nie pokazuje." "Levererad"-mallarna är Shopifys egen polska översättning och inte granskade som copy.
- **Det svenska originalet till 012v2:s rutor (004)** finns inte som text i repot, bara i videon. Jämförelsen är gjord mot de engelska och tyska rutorna och B:s citat ("En dubbeltitt. Ett skratt."). Betydelsen stämmer: "Drugi rzut oka. I śmiech." och övriga rutor. Överlappet mellan rutorna är redan G-B04.
- **Policyerna** ingår inte, enligt uppdraget.

---

# Bilaga: Del C — språket (pt)


Granskare: infödd läsare av pt-PT + konsumentlagen (DL 57/2008 om otillbörliga affärsmetoder, DL 24/2014 om distansavtal). Läs-bart, inget ändrat.
Källor: `A/annonser.json` (Metas copy, 8 PT-annonser, copy_diff tom mot `annonser/PT.json`), `B/transkript/PT-00*.txt`, `B/bildtext/PT-00*.txt`, `heygen/srt/PT/`, `egna/PT/*.json`, `egna/d3/texter/PT.json`, `D/land-PT.json` (mätt 2026-09-30 14:31 UTC), `D/sparning-pt-PT.json`, `D/mejl-pt-PT.json`, `output/underlag-pt-PT.json`.

Sammanfattning: 1 🔴, 11 🟡, 5 🔵. Inget falskt påstående om Sverige ("Uma marca sueca" = svenskt varumärke, rätt), ingen domän eller butik i annonserna, ingen moms- eller tulltext, inga svenska rester i annonserna, erbjudandena (Compra 1–Recebe 1 / Compra 2–Recebe 2) stämmer med korgen (4 lådor, 2 betalda, 4 par pinnar, 89,80 €).

---

## 🔴

```
G-C-PT-01 🔴  PT-sajten efter "Adicionar ao carrinho" + kassan (alla 8 annonser landar här)
Vad:     Den portugisiska kunden hamnar på en ENGELSK varukorg och en ENGELSK kassa. Produktsidan är pt-PT, men
         efter "Lägg i" går sidan till /cart (html lang "en": "Your cart", "Real wooden chopsticks", "Check out",
         "Great · 4.2 out of 5") och kassan öppnas som en-PT ("Delivery", "Pay now", "Sushi Socks", "€23.60" med
         decimalpunkt, rubriken "Matstrumpor.se Checkout"). Den lokaliserade korgen /pt-pt/cart finns och är rätt
         ("O seu carrinho", "Finalizar a compra"), men kunden skickas inte dit. Fel språk i köpets sista steg.
         Bekräftar del D:s mätning (tabell.md: "en-PT ❌", "matstrumpor.com/cart") ur språkgranskarens synvinkel.
Bevis:   D/land-PT.json → efter_lagg_i {url "https://matstrumpor.com/cart", html_lang "en"}, texter.korg_dit_kunden_hamnar,
         kassa.url ".../checkouts/cn/…/en-pt", kassa.lang "en-PT", kassa.rader ("Pay now", "Finalize order", "Sushi Socks").
Förslag: Korgens länk/omdirigering ska bära språkprefixet (/pt-pt/cart), och kassan ska öppnas med kundens locale.
         Utförs aldrig av granskaren.
Vem:     byggarsessionen (samma fel i alla språk utom en, se D/tabell.md)
```

## 🟡

```
G-C-PT-02 🟡  Alla 8 PT-annonser: länkbeskrivningen, och 008:s rubrik, brödtext och bildbanner
Vad:     Tilltalet blandas. Annonserna säger "tu" ("nos teus pés", "que usas", "Recebes quatro caixas"), men
         erbjudandet står i formell imperativ: "Compre 1 – Receba 1 GRÁTIS", "Compre 2 – receba 2 grátis".
         Sajten säger "Compra 1 – Recebe 1 GRÁTIS" (tu). Kunden ser alltså två former i samma annons och en tredje
         på sidan. Roten är ordlistan i REGLER-EUROPA.md (pt-kolumnen "Compre 1 – Receba 1 GRÁTIS"), som strider mot
         regel 8 där ("europeisk portugisiska, tu-ton").
Bevis:   A/annonser.json PT 001–007 lankbeskrivning "4 tipos. Compre 1 – Receba 1 GRÁTIS. Envio grátis.";
         PT 008 rubrik "Compre 2, receba 2 grátis: quatro caixas", brodtext "Recebes quatro caixas.\nCompre 2 – receba 2 grátis…";
         B/bildtext/PT-008.txt banner "COMPRE 2 – RECEBA 2 GRÁTIS"; D/land-PT.json paket.rubrik "Compra 1 – Recebe 1 GRÁTIS".
Förslag: "Compra 1 – Recebe 1 GRÁTIS" / "Compra 2 – Recebe 2 GRÁTIS" överallt, även i bilden 008 (ny rendering) och i
         ordlistan. Utförs aldrig av granskaren.
Vem:     byggarsessionen
```

```
G-C-PT-03 🟡  Rubrik PT 001, 004, 005, 006, 007 — "Diversão à noite. Nos teus pés amanhã."
Vad:     "Diversão à noite" betyder "nöje på kvällen/nattnöje" (låter som ett nattklubbserbjudande), inte "rolig i
         kväll" om presenten. Svenska: "Rolig i kväll. På fötterna i morgon." Sajten har redan en bra form: "divertido
         hoje à noite e vai parar aos teus pés amanhã".
Bevis:   A/annonser.json PT 001 rubrik; output/underlag-pt-PT.json produkt.sushi-strumpor.body_html.
Förslag: t.ex. "Divertidas esta noite. Nos teus pés amanhã." (ny rad skrivs av sonnet i rättningssessionen).
Vem:     byggarsessionen
```

```
G-C-PT-04 🟡  Brödtext PT 001–007, rad 1–2
Vad:     Tre språkfel i samma stycke:
         (a) "Ninguém festeja um detergente da roupa" — "festejar" med sak som objekt är onaturligt; standard är
             "detergente para a roupa". Sajten säger bättre: "Ninguém se entusiasma com detergente."
         (b) "A resposta a ambas:" — "ambas" är femininum utan feminint huvudord (detergente och presente är maskulina).
             Det låter som ett grammatikfel.
         (c) "Não fica na caixa depois. Fica nos teus pés" — närmaste subjekt är "uma caixa", så det läses "lådan stannar
             inte i lådan". Strumporna är plural (meias/pares) — "Não ficam esquecidas na caixa. Ficam nos teus pés".
Bevis:   A/annonser.json PT 001 brodtext; output/underlag-pt-PT.json produkt.sushi-strumpor.body_html.
Förslag: Skriv om raderna (sonnet), t.ex. "Ninguém se entusiasma com detergente. …" / "A resposta para os dois:" / "Não
         ficam esquecidas na caixa. Ficam nos teus pés, semana após semana." Utförs aldrig av granskaren.
Vem:     byggarsessionen
```

```
G-C-PT-05 🟡  Länkbeskrivning PT 001–007 — "4 tipos."
Vad:     "4 tipos" utan substantiv är oklart ("4 typer av vad?"). Svenska "4 sorter"; 004 säger själv "Quatro sabores".
Bevis:   A/annonser.json lankbeskrivning; egna/PT/012v2.json text 7 "Quatro sabores.\nUm para cada um."
Förslag: "4 sabores." Utförs aldrig av granskaren.
Vem:     byggarsessionen
```

```
G-C-PT-06 🟡  Fraktmejlen (skickad, uppdatering, ute för leverans) + spårningssidan
Vad:     Paketnumret MS-… kallas "número de encomenda" — på pt-PT är det ORDERNUMRET. Samma mejl säger också "A tua
         encomenda {{ name }}" (ordernumret #…). Kunden har två nummer med samma namn och kommer att skriva in ordernumret
         på spårningssidan, som då svarar "Não encontramos esse número". Svenska: "paketnummer".
Bevis:   D/mejl-pt-PT.json fraktbekraftelse.brodtext "A tua encomenda {{ name }} saiu do armazém … O teu número de
         encomenda: … prepend: 'MS-'"; D/sparning-pt-PT.json texter "Escreve o teu número de encomenda", "O número de
         encomenda começa com MS".
Förslag: "O teu código de rastreio: MS-…" / "Escreve o teu código de rastreio" (mejl + sparning/sprak/pt-PT). Utförs aldrig.
Vem:     byggarsessionen
```

```
G-C-PT-07 🟡  Fraktmejlen — tilltal och två fraser
Vad:     (a) Våra tre mejl säger "tu", men Shopifys två leveransnotiser ("A sua encomenda foi entregue", "Rastreie o seu
         envio", "Fale connosco") säger "você". Samma kund får båda tonerna.
         (b) "A encomenda está a caminho do voo" = "på väg till flyget" — onaturligt; "a caminho do avião"/"a aguardar voo".
         (c) Etiketten "Entrega em {{ name }} {{ address }}" läses "leverans hos"; standard är "Morada de entrega".
Bevis:   D/mejl-pt-PT.json levererad_forsandelse/levererad_order.brodtext; fraktbekraftelse.brodtext.
Förslag: Rätta (b)(c) i vår mall; (a) antingen egna leveransnotiser i tu-form eller acceptera. Utförs aldrig.
Vem:     byggarsessionen / Axel för (a)
```

```
G-C-PT-08 🟡  Produktsidan och korgen — prisformatet
Vad:     Samma pris skrivs på två sätt: "€44,90" (Preço normal, köpruta, "valor €11,80", korgen "€89,80 EUR") och
         "44,90 €" (paketväljaren). pt-PT skriver beloppet först: "44,90 €".
Bevis:   D/land-PT.json texter.produktsida "Preço normal","€44,90", "44,90 €", "valor €11,80"; korg_lokaliserad "€89,80 EUR".
Förslag: Butikens valutaformat för EUR/pt-PT till "{{amount_with_comma_separator}} €". Utförs aldrig.
Vem:     byggarsessionen
```

```
G-C-PT-09 🟡  Produktsidan — Judge.me-rutan
Vad:     Engelska och amerikanskt datum i den portugisiska rutan: "Sort reviews by", datum "09/28/2026", betyget "4.4"
         (resten av sidan "4,2 de 5"). (Att recensionerna själva är på svenska är ett känt beslut, räknas inte.)
Bevis:   D/land-PT.json texter.produktsida "Sort reviews by", "09/28/2026", "4.4".
Förslag: Judge.me-inställningarna för pt (etikett + datumformat dd/mm/aaaa). Utförs aldrig.
Vem:     byggarsessionen
```

```
G-C-PT-10 🟡  Produktsidan — "sem perguntas estranhas"
Vad:     Ordagrann kalk av "inga konstiga frågor"; låter märkligt ("inga konstiga frågor" antyder att andra frågor ställs).
         Samma sajt säger på startsidan "Sem complicações, sem perguntas."
Bevis:   D/land-PT.json texter.produktsida "… basta devolveres o produto – sem perguntas estranhas."
Förslag: "– sem complicações." Utförs aldrig.
Vem:     byggarsessionen
```

```
G-C-PT-11 🟡  004 (MATSTRUMP_PT_sushi_gift_anim_004_v1) — textruta 5
Vad:     "Moram na gaveta\ncom as normais" saknar punkt, alla andra sex rutor har skiljetecken. Kosmetiskt.
         (Överlappningen mellan rutorna i 004 är del B:s fynd och upprepas inte.)
Bevis:   egna/PT/012v2.json texter[4]; B/bildtext/PT-004.txt 00:08.
Förslag: Lägg till punkt vid nästa rendering. Utförs aldrig.
Vem:     byggarsessionen
```

```
G-C-PT-12 🟡  Menyn, mejlknappen och spårningssidan — tre verb för samma sak
Vad:     Menyn "Seguir encomenda", mejlknappen "Rastrear encomenda", sidan "Rastreia a tua encomenda" / "RASTREIO".
         Inte fel var för sig, men kunden letar efter knappen med ett annat ord än menyn.
Bevis:   output/underlag-pt-PT.json meny.845550322003 "Seguir encomenda"; D/mejl-pt-PT.json "Rastrear encomenda";
         D/sparning-pt-PT.json "Rastreia a tua encomenda".
Förslag: Välj ett ("Seguir encomenda" enligt ordlistan) på alla tre ställena. Utförs aldrig.
Vem:     byggarsessionen
```

## 🔵

```
G-C-PT-13 🔵  007 (MATSTRUMP_PT_sushi_gift_ugc_007_v1) — "Criei esta empresa por pura frustração."
Vad:     En AI-röst över AI-personer säger "jag startade det här företaget". Samma påstående finns i svenskan (B har det
         som 🔵). I Portugal kan en påhittad grundarberättelse räknas som vilseledande enligt DL 57/2008 (art. 7, osanna
         uppgifter om näringsidkaren). Axels beslut.
Bevis:   B/transkript/PT-007.txt [00:05.08] "Criei esta empresa por pura frustração."; egna/s001h1.manus.json "Jag startade Matstrumpor ur en ilska."
Förslag: Fråga Axel; alternativ "Nasceu de pura frustração" utan jag-form. Utförs aldrig.
Vem:     Axel
```

```
G-C-PT-14 🔵  005 och 006 — "mamma"-vittnesmålet
Vad:     AI-rösten återger ett kundcitat som fakta ("A mãe disse: foi o meu preferido" / "Foi a prenda preferida da minha
         mãe") och "Três razões…". Samma i svenskan. Påhittat vittnesmål i en AI-röst kan vara samma lagfråga som G-C-PT-13.
Bevis:   B/transkript/PT-005.txt [00:32.64]; PT-006.txt [00:28.32].
Förslag: Axels beslut. Utförs aldrig.
Vem:     Axel
```

```
G-C-PT-15 🔵  001 och 003 — julstrumpan
Vad:     "guarda-as para a meia de Natal" (001) och "o único sushi que faz sentido numa meia de Natal" (003). I Portugal är
         julstrumpan ingen stark tradition (där är det "o sapatinho" vid spisen och paketen under granen på julafton).
         Skämtet går fram, men det känns importerat. Inget falskt och inget leveranslöfte.
Bevis:   B/transkript/PT-001.txt #3, PT-003.txt #1.
Förslag: Låt stå, eller mät 003 mot 002 (samma innehåll utan julvinkel) när data finns. Utförs aldrig.
Vem:     Axel
```

```
G-C-PT-16 🔵  001 — knapphets-påståendet
Vad:     "Esgotaram em novembro." som andra mening, utan "do ano passado" förrän i slutet. Sant för Sverige 2025
         (produktsidan: "No ano passado, a caixa de sushi esgotou-se em novembro"), men varken Portugal eller i år.
         Slutet ("garante as tuas … antes que aconteça outra vez") gör det tydligt. Ingen åtgärd krävs.
Bevis:   B/transkript/PT-001.txt [00:01.34], [00:22.46].
Förslag: Ingen. Utförs aldrig.
Vem:     —
```

```
G-C-PT-17 🔵  Sajten — betalsätten i texten
Vad:     "Paga como quiseres – Klarna, cartão, Apple Pay ou Google Pay." Portugisiska kunder letar efter MB WAY och
         Multibanco. MB WAY finns i sidfotens ikoner men nämns inte i texten eller FAQ:n.
Bevis:   output/underlag-pt-PT.json tema.index.trygghet.t.text; D/land-PT.json klarna_swish.betalikoner_sidfot "MB WAY".
Förslag: Idé: nämn MB WAY i pt-texten. Utförs aldrig.
Vem:     Axel
```

## Rösten — bekräftat och nyanserat (B:s ljudfynd)

- **001 #3 (täckning 0,67):** Whisper hör "levas à festa ou guardas para a manhã de notal". "leva-as"/"levas" och "guarda-as"/"guardas" låter likadant i talad pt-PT. "notal" är Natal med obetonat /a/ → [ɐ], som är korrekt lissabonuttal och som Whisper (tränad mest på brasilianska) skriver som "o". Troligen **inget fel**, men lyssna på 00:02.4–00:05.3 en gång.
- **Produktordet "meias":** Whisper skriver "maias" i 002 och 003. Så låter meias [ˈmɐjɐʃ] på pt-PT, alltså går ordet fram för en portugis. Rätt, inget fel. Brasilianskt uttal hade varit "mêias".
- **003 #2:** "sem cupares" = "cinco pares" (hela filen hör "cinco pares"). Whispers fel.
- **005 #13 (0,33):** Whisper hör "DEIXA-SE QUEM RECEBE SUPERFELIZ" i versaler, samma ljud som "deixas quem recebe super feliz". Whisper läser av texten på skärmen, inte ett röstfel.
- **006 #14:** "Teis" = "Tens" (Whisper). Inget fel.
- 004 har ingen röst ("Música de encerramento" är Whispers hallucination på musiken).

## Kan inte mätas härifrån

- Om HeyGens röst i 001–003 låter naturlig för en portugis (intonation, brasiliansk färg): kräver örat, Whisper mäter bara ord.
- Kassans texter på pt-PT: kassan öppnades bara som en-PT (G-C-PT-01), så den portugisiska kassan har inte lästs.
- Spoks-mejlen på portugisiska: inte i paketet.
- Hur Metas automatiska radbrytning eller "Se mer" kapar brödtexten i flödet: inte mätt.
- Policysidorna: ingår inte enligt uppdraget. (Underlaget visar ändå att shipping-policyn nämner "PostNord" och "taxa de importação" för Portugal, vilket bara är kontext.)

---

# Bilaga: Del C — språket (ja)


Granskare: del C, japanska. Läst 2026-09-30 som infödd kund och marknadsförare.
Allt är läs-bart. Ingenting är ändrat, i repot eller någon annanstans.

Underlag:
- Annonstexterna ur Meta: `A/annonser.json` (JP 001–008, `copy_diff` tom = Meta och `annonser/JP.json` säger samma sak).
- Talet: `B/transkript/JP-00x.txt` (Whisper medium + seglyssna).
- Bildtexten: `B/bildtext/JP-00x.txt`.
- Repots texter: `heygen/srt/JP/*.srt`, `egna/JP/*.json` (med uttalsfältet `las`), `egna/d3/texter/JP.json`.
- Sajten: `D/land-JP.json` (mätt 14:31 UTC), `D/sparning-ja.json`, `output/underlag-ja.json`.
- Mejlen: `D/mejl-ja.json`, `mejl/sprak/ja.json`.
- Svenska original: `transkript/09-17_Nathalie…`, `Sofie_H1…`, `Sofie_H2…`, `egna/*.manus.json`, `egna/bildtexter.sv.json`, `annonser/JP.json` → `svenska`, `egna/US/012v2.json` (som stöd för 012v2:s betydelse).

Transkripten är Whisper. Där ett fynd bara vilar på Whisper står det, och där krävs ett mänskligt öra innan något görs om.

Summering: **1 nytt 🔴, 9 🟡, 7 🔵.** G-B01 (靴下 i 007) är bekräftat och nyanserat nedan, men räknas inte som nytt.

---

## 🔴

```
G-C-JA-01 🔴  JP 008 (MATSTRUMP_JP_sushi_offer_static_008_v1, 120251797953480023), brödtextens fjärde rad
Vad:     Brödtexten skriver talet fyra två gånger: "EUサイズ36–44". 44 läses shi-jū-shi eller yon-jū-yon,
         och 四十四 är en känd olycksfigur, dubbelt "död". Det är den enda siffran fyra i JP:s annonser.
         Regeln (REGLER-ASIEN.md 14): "Annonser, videotal och bildtexter säger det aldrig". Den står i
         konflikt med regel 7 i samma fil, som föreskriver just "EUサイズ36–44（約23–28cm）". Därför
         har kontrollerna släppt igenom den.
         Dessutom säger EU-storlek ingenting för en japansk kund. Skor köps i centimeter, och
         "約23–28cm" är det kunden faktiskt läser.
Bevis:   Meta, object_story_spec (A/annonser.json, JP 008, brodtext rad 4):
         "フリーサイズ。EUサイズ36–44（約23–28cm）にフィットします。"
         Samma i egna/d3/texter/JP.json → message. Regelkonflikten: oversattning/REGLER-ASIEN.md rad 40–42 mot 86–89.
         Maskinkoll: sökning efter "4" eller "四" i rubrik, brödtext och länkbeskrivning för JP 001–008 ger
         träff bara i 008, två gånger.
Förslag: Byt raden mot "フリーサイズ。約23〜28cmの足にフィットします。" (ingen EU-skala, ingen fyra).
         Regel 7 får ett undantag för annonser: centimetern räcker. På sajten får EU-skalan stå kvar
         (regel 14 tillåter fakta i butikens texter), men se G-C-JA-13.
         Utförs aldrig av granskaren.
Vem:     byggarsessionen (d3/texter/JP.json + Meta-texten), efter Axels ok eftersom två regler krockar
```

### Bekräftelse av G-B01 (inte ett nytt fynd)

```
G-B01 🔴 bekräftat, med nyans  JP 007 (120251797952860023): 靴下 hörs "kusushita"
Nyans:   På japanska tonas u bort mellan tonlösa konsonanter: ku[tsu]shita uttalas nästan [kɯ̥tsɕita].
         En maskin kan därför höra "kusshita" även när uttalet är rätt. Men Whisper hör 靴下 rätt med
         samma röst i 005 och 006 ("でも待って、これ靴下"). I 007 hörs det fel alla tre gångerna, och
         dessutom "寿司ソツクス" i slutet. Det talar för ett verkligt fel.
         Uttalsfältet har REDAN くつした på alla tre raderna (egna/JP/s001h1.json → las). Att skriva om
         las med hiragana löser alltså inte felet. Pröva katakana クツシタ eller en annan take.
         Produktordet är det sista som sägs i videon ("見た目はお寿司、実は靴下。寿司ソックス。").
         Det är slutpoängen och får inte gå förlorad.
Vem:     byggarsessionen, efter att någon lyssnat vid 13,3 s, 24,2 s och 38,3 s
```

---

## 🟡

```
G-C-JA-02 🟡  JP 002 (MATSTRUMP_JP_sushi_gift_ugc_002_v1, 120251797919120023), 5,3 s (nyanserar G-B05)
Vad:     五足入り (gosoku-iri, "fem par i") hörs som 不足入り (fusoku-iri, "med brist i"). Om en kund hör
         samma sak blir antalet borta ur den enda repliken som säger vad lådan innehåller, och ordet
         betyder "brist". Då vore det ett 🔴 (produktordet går inte fram).
         Motbevis: HeyGen säger samma mening i 003 med samma röstmodell, och där hör Whisper "5足".
         Undertexten visar 五足入り rätt (OCR "五足寿" 5,0 s). Med bara Whisper som bevis räknas det som 🟡.
Bevis:   B/transkript/JP-002.txt: "[00:05.26–00:10.68] 不足入りの寿司ソックスで…";
         SRT heygen/srt/JP/matstrumpor_sofie_h1.srt: "五足入りの寿司ソックスで".
         JP 003 samma replik: "5足配りの寿司ソックス". Där är 入り hört som 配り, troligen Whispers fel.
Förslag: Lyssna på 002 vid 5,0–6,5 s. Hörs "fusoku": rendera om repliken (HeyGen precision, texten "5足入り"
         eller "ソックス5足入り"). Utförs aldrig av granskaren.
Vem:     Axel eller någon som lyssnar, sedan byggarsessionen
```

```
G-C-JA-03 🟡  JP 007 (120251797952860023), 11,1–13,1 s
Vad:     "毎回、慌てて探すはめに。" hörs "探すわめに". Rösten läser は i はめに som partikeln wa.
         På japanska blir det obegripligt ("sagasu wa me ni"). Orsaken syns i uttalsfältet: las behåller
         kanjin 探す och skriver はめに i hiragana, så talmotorn tolkar は som ämnespartikel.
Bevis:   B/transkript/JP-007.txt #4: manus "毎回、慌てて探すはめに。", hört "毎回慌てて探すわめに".
         egna/JP/s001h1.json → las "まいかい、あわてて探すはめに。"
Förslag: las "まいかい、あわててさがすハメに。" (ハメ i katakana), eller skriv om repliken:
         "毎回、慌てて探すことになるんです。" Utförs aldrig av granskaren.
Vem:     byggarsessionen (egna/dubba.mjs)
```

```
G-C-JA-04 🟡  JP 007 (120251797952860023), 31,2–34,7 s och 40,3 s
Vad:     "どんな場面にもぴったりなプチギフトです。" hörs "どんなバーメンにもぴったりなプーチギフトディエス".
         Vokalerna dras ut (ba-a-men, pu-u-chi) och です blir "dies". En japansk tittare hör en utländsk
         röst som läser. Segmentets täckning är 0,67, näst lägst i filen. Slutetiketten "寿司ソックス"
         hörs "寿司ソツクス": den lilla っ läses som ett helt ツ.
Bevis:   B/transkript/JP-007.txt #13 (0,67) och #16 (0,6).
Förslag: Lyssna. Gör om #13 och #16 i samma omgång som G-B01. Pröva las med ばめん/プチギフト i katakana
         och です utskrivet som "デス". Utförs aldrig av granskaren.
Vem:     byggarsessionen
```

```
G-C-JA-05 🟡  JP 005 (120251797940940023) 14,9 s och 8,2 s, JP 006 (120251797945730023) 10,6 s
Vad:     ボックス ("låda") hörs "ボツクス" i 005 och "ボツックス" i 006. Det är samma mönster som ソツクス i 007:
         den lilla っ uttalas som ett helt ツ. I 005 hörs dessutom ユニーク utan lång vokal, "ユニク".
         Kunden förstår ändå, men det låter maskinläst.
Bevis:   B/transkript/JP-005.txt #3 "その1とにかくユニク" och #5/#6 "ボツクスを開けると";
         JP-006.txt #4/#5 "ボツックスを開けると". las har ボックス och ユニーク (egna/JP/haikuh3.json, haikuh2.json).
Förslag: Lyssna på 005 vid 8–10 s och 14–18 s. Hörs det: pröva las "ぼっくす" i hiragana eller byt ordet mot
         "箱" (はこ). Utförs aldrig av granskaren.
Vem:     byggarsessionen
```

```
G-C-JA-06 🟡  JP 006 (120251797945730023), 0–3,5 s (kroken), och JP 005, 27,2 s
Vad:     Krokrepliken "理由は三つ" hörs "流派三つ" (ryūha, "skolbildning"). Om kunden hör samma sak faller
         kroken "köp inte … av tre skäl". I 005 hörs "履いてもらえます" som "履いてもらいます", och det
         byter betydelse från "de blir använda" till "jag låter dem ha dem på sig". Båda kan vara Whisper.
Bevis:   B/transkript/JP-006.txt #1 (0,75), manus "寿司ソックスは、買わないで。理由は三つ。";
         JP-005.txt #11 (0,71).
Förslag: Lyssna på 006 vid 0–3,5 s först, eftersom det är kroken. Utförs aldrig av granskaren.
Vem:     Axel eller någon som lyssnar
```

```
G-C-JA-07 🟡  JP 004 (MATSTRUMP_JP_sushi_gift_anim_004_v1, 120251797933610023), sista rutan 12,0–14,2 s
Vad:     Betydelsen har glidit. "寿司、ピザ、バーガー、ドーナツ／ひとり一足ずつ選ぼう。" betyder "välj ett PAR
         var". Originalet är "Four kinds. Pick one each.", alltså en SORT var. Varje låda har flera par, så
         "ett par var" är fel. Det låter också som om man köper strumpor styckvis.
         (Att "fyra sorter" har blivit en uppräkning utan tal är rätt enligt regel 14.)
         Bekräftar också G-B04 för JP: vid 4–6 s står "二度見して、思わず大笑い。" och "その正体は、なんと靴下！"
         samtidigt, och de två rutorna läses då i fel ordning (poängen före uppbyggnaden).
Bevis:   egna/JP/012v2.json → texter[6]; egna/US/012v2.json → texter[6] "Four kinds. Pick one each.";
         B/bildtext/JP-004.txt, OCR 4,0 s "二度見、| 思大笑 | の正体、| 靴下！".
Förslag: "寿司、ピザ、バーガー、ドーナツ／ひとりひとつ、好きなのを選ぼう。" Rutorna i 004 slutar när nästa
         börjar (G-B04). Utförs aldrig av granskaren.
Vem:     byggarsessionen
```

```
G-C-JA-08 🟡  JP 008 (120251797953480023), brödtextens första rad
Vad:     "届くのは、買った2ボックスと無料の2ボックスです。" Räkneordet "2ボックス" är onaturligt. En japansk
         butik skriver "2箱" eller "ボックス2つ". Raden läses som en översättning.
Bevis:   A/annonser.json, JP 008, brodtext rad 1. Samma i egna/d3/texter/JP.json → message.
Förslag: "届くのは、お支払いいただく2箱と、無料の2箱です。" Utförs aldrig av granskaren.
Vem:     byggarsessionen
```

```
G-C-JA-09 🟡  Fraktmejlet "levererad försändelse" på japanska (Shopifys standardmall, inte repots)
Vad:     Ämnesraden säger fel sak. Notisen går ut när paketet är LEVERERAT, men raden säger "注文番号 {{ name }} が
         発送されました" = "har SKICKATS". Kunden kan tro att paketet precis har lämnat lagret. I brödtexten
         blandas också 配達済み och 配送済み ("levererat" och "skickat") om vartannat.
Bevis:   D/mejl-ja.json → notiser/levererad_forsandelse/amne; sv_amne "En försändelse för order {{ name }} har levererats";
         updatedAt None, alltså Shopifys egen översättning. Den levererade ordern (levererad_order) är rätt:
         "ご注文 ({{ name }}) は配達済みです".
Förslag: Registrera en egen ja-översättning: "ご注文{{ name }}の荷物が配達されました". Mallen hör inte till repots tre,
         så det krävs ett eget beslut. Utförs aldrig av granskaren.
Vem:     byggarsessionen (mejl/notis-oversattning.mjs), efter Axels ok
```

```
G-C-JA-10 🟡  Sajten i Japan: ".se" och Klarna syns
Vad:     Kassans rubrik är "Matstrumpor.se お支払い". Butiksnamnet står alltså med .se, fast loggan utanför
         Sverige är "Matstrumpor". I sidfotens betalikoner syns Klarna (och Bancontact, Bizum, BLIK, MB WAY,
         Twint, iDEAL) för en japansk kund, fast Klarna är borttaget i Japan och inget av de andra finns där.
         En japansk kund läser ikonraden som ett löfte om betalsätt.
Bevis:   D/land-JP.json → kassa.rader[2] "Matstrumpor.se お支払い"; klarna_swish.element [{tag: title, s: Klarna,
         synlig: true}] och betalikoner_sidfot.
Förslag: Butiksnamnet i kassan och ikonraden per marknad är Shopify-inställningar. Del D avgör vad som går.
         Utförs aldrig av granskaren.
Vem:     byggarsessionen / del D
```

---

## 🔵 Frågor till Axel och idéer

```
G-C-JA-11 🔵  JP 003 (julvinkeln), svar på G-B10
Dom:     Vinkeln fungerar i Japan, men inte nu. Alla japaner känner igen クリスマスの靴下: tomten lägger presenter i
         en strumpa, och det lär sig barn. Ordvitsen "den enda sushin som passar i en julstrumpa" går alltså fram,
         och repliken låter naturlig. Men jul i Japan firas av par och barnfamiljer, och en julstrumpa till en
         vuxen är ingen sed. Julhandeln börjar i mitten av november.
         Rubriken i 003 säger "slutsåld i Sverige i november förra året", och den håller. Den står i
         annonstexten, inte i videon.
Förslag: Låt 003 vänta till omkring 15 november, eller kör 002 (samma video utan jul) fram till dess.
         Julen nämns också i 001 ("クリスマスにも"). Det är i sin ordning, eftersom den står bredvid present och fest.
```

```
G-C-JA-12 🔵  JP 007: grundarberättelsen (bekräftar G-B07)
Vad:     "イライラから、始めた会社なんです" = "Det är ett företag jag startade av ren irritation". Det sägs av en AI-röst
         medan flera olika AI-personer syns i bild. Japanska kunder läser en grundarberättelse bokstavligt, och
         sajten har en sida enligt 特定商取引法 med bolagets riktiga uppgifter. Frågan är samma som i G-B07.
```

```
G-C-JA-13 🔵  Talet fyra på sajten och i mejlen (regel 14 tillåter fakta, men Axel ska veta var det står)
Var:     Paketväljaren "ボックスが4つ届いて" och "本物の木製のお箸（4膳）", ordinarie pris "¥4,320" på ätpinnarna,
         pizzasockornas text "ソックスが4足入っています", alt-texten "4人分の足", fraktmejlet
         "最初の2〜4日間は…" och spårningssidan "2〜4日ほどかかります".
Bevis:   D/land-JP.json → paket, texter; output/underlag-ja.json → produkt.pizza-strumpor.body_html,
         bildalt.61864814117203.alt; mejl/sprak/ja.json rad 23/26; sparning/sprak/ja.json rad 218.
Fråga:   Paketnivån är ett faktum och får stå. Men fraktmejlets "2〜4日" går att skriva "数日" utan att något
         går förlorat. Ska mejlet och spårningssidan också undvika fyran?
```

```
G-C-JA-14 🔵  "ギフト仕様でお届け" (sajtens annonsrad och USP)
Vad:     På japanska betyder ギフト仕様 att butiken slår in paketet eller lägger på のし. Det svenska originalet
         säger "Levereras presentklart", alltså att lådan redan ser ut som mat. En japansk kund kan vänta sig
         presentinslagning.
Förslag: "ギフトボックス入りでお届け" eller "そのまま贈れるボックス入り".
```

```
G-C-JA-15 🔵  JP 008: sex lådor i bild, fyra i erbjudandet (bekräftar G-B09)
Vad:     I Japan är det nästan en fördel att bilden inte visar fyra lådor. Men texten säger 2+2, så sex lådor kan
         väcka frågan "var är de två andra?". Behåll bilden. Frågan gäller bara om den ska läsas som ett antal.
```

```
G-C-JA-16 🔵  Leveransfönstret på produktsidan
Vad:     "お届け予定 10月7日 – 10月14日". Japanska skriver 〜, inte ett tankstreck med mellanslag.
         Kosmetiskt: "10月7日〜10月14日".
Bevis:   D/land-JP.json → texter.produktsida.
```

```
G-C-JA-17 🔵  Tilltal och ton — inget fel, bara en notering
Vad:     Annonstexterna och sajten skriver です・ます. Videorna är en ung kvinnlig kreatör (ゲットしてね, マジで, あるある).
         Det är rätt för respektive medium och ingen inkonsekvens. スウェーデン製 finns ingenstans (sökt i ja-underlaget,
         Meta-texterna, SRT, egna/JP, d3, sajten och mejlen). "スウェーデン発のブランドです。" står sist i alla åtta
         brödtexter, och "スウェーデンのブランド" sägs i 002/003. Båda är sanna.
```

---

## Mätt och rätt (inga fynd)

- Metas text är lika med `annonser/JP.json` på alla åtta (`copy_diff` tom).
- Inget butiksnamn, ingen domän, ingen moms- eller tulltext i någon JP-annons.
- Inget 四 i rubrik, brödtext, länkbeskrivning, SRT, egna/JP, bildtext eller d3. Ingen fyra i tal (B). Enda undantaget är 36–44 (G-C-JA-01).
- Erbjudandet håller i korgen i yen:
  - Länkbeskrivningen "1つ買うともう1つ無料" (001–007): paketväljaren "1つ買うともう1つ無料 ¥7,980".
  - 008 "2つ買うともう2つ無料、合計20足": korgen 4 lådor, 2 betalda, ¥15,960, 4 par ätpinnar à ¥0. "どのボックスにも" håller.
  - "送料無料": fraktrutan "日本全国送料無料" med japansk flagga.
- Påståendet "スウェーデンで昨年11月に完売" stämmer med CLAUDE.md (sushilådan tog slut i november 2025) och med sajtens "昨年、寿司ボックスは11月に売り切れました。".
- Spårningssidan är på japanska. H1 "配送状況を確認", och ett påhittat nummer ger "その番号は見つかりませんでした". Inga svenska ord.
- Repots tre fraktmejl finns på japanska (skickat, uppdatering, ute för leverans) med です・ます. Knappen "配送状況を確認" är samma som på sidan. Den dubbla hälsningen i den avskalade texten är Liquids if/else (`med_namn`/`utan_namn` i mejl/sprak/ja.json), inget fel.
- 012v2:s "十人十色" för "No two alike" är en bra japansk idiomöversättning.

## Kan inte mätas härifrån

- **Uttalet:** alla ljudfynd (G-B01, JA-02–06) bygger på Whisper. En japansk lyssnare måste höra 002 5 s, 006 0–3 s, 007 11–14/24/31–34/38–41 s och 005 8–18 s.
- **HeyGens läppsynk** i 001–003. Videorna är inte tittade på i rörelse.
- **CJK-texten i bild** är bara bekräftad i fragment. OCR:en läser japanska dåligt, och B:s kontaktark visar att rutorna finns och att inga fyrkanter syns. Ordagrannheten mot repot bygger på repot plus OCR-fragment.
- **Kassans förvalda land:** listan i `land-JP.json` börjar med スウェーデン, men vilket land som är förvalt syns inte i datan.
- **Judge.me-rutan** är på svenska (Kundrecensioner, Verifierad, recensionerna) och engelska (Sort reviews by). Det är ett känt beslut (punkt 8) och räknas inte, men en japansk kund ser svenska mitt på produktsidan.
- **Spoks mejlflöden** till Japan går på engelska. Känt beslut, inte läst.
- **Policyerna** (inklusive 特定商取引法に基づく表記) ingår inte i uppdraget.

---

# Bilaga: Del C — språket (zh-TW)


Granskat 2026-09-30 av en läs-bar session: infödd läsare av traditionell kinesiska för Taiwan och marknadsförare.

**Underlaget:** kontot har **0 TW-annonser** (`B/fynd.md` rad 140, B/meta/ads.json 13:5x UTC). Paketet är därför repots texter:

- `annonser/TW.json` (8 annonser)
- `heygen/srt/TW/*.srt` (001–003)
- `egna/TW/*.json` (004–007)
- `egna/d3/texter/TW.json` (008)
- `output/underlag-zh-TW.json`
- `D/land-TW.json` (sajten och korgen som kund 14:32 UTC, kassan)
- `D/sparning-zh-TW.json`
- `D/mejl-zh-TW.json`

Svenska facit:

- `transkript/09-17_Nathalie…`, `Sofie_H1…` och `Sofie_H2…`
- `egna/*.manus.json` (fältet `sv` i varje segment)
- `egna/bildtexter.sv.json`
- `output/underlag-sv.json`
- `annonser/TW.json` → `svenska`

**Mekaniska kontroller som är gröna** (inga fynd):

- **Förenklade tecken:** 2 274 unika han-tecken i alla filer ovan kördes genom opencc `s2t` tecken för tecken. Bara 吃, 准 (i 核准), 群 (i 社群) och 台 (i 全台/台灣) avvek. Alla fyra är korrekt taiwanesisk skrift och en känd överkonvertering i opencc. **0 förenklade tecken.**
- **Fastlandsord:** s2twp-frasbytena var bara överkonverteringar (打開→開啟, 查看→檢視, 消息→訊息, 台→臺). Orden är taiwanesiska genomgående: 外帶 (inte 外賣), 披薩, 甜甜圈, 點選, 品質, 包裹, 結帳, 襪子, 搞怪, 欸/耶. **Inga fastlandsord hittade.**
- **四:** tecknet finns inte i någon annonstext, SRT eller bildtext för 001–008. Siffran 4 förekommer bara i 008:s storleksrad 「歐碼 36–44」, som är föreskriven i REGLER-ASIEN punkt 7. Det svenska "4 lux som verkligen lurar blicken" i Nathalie är omskrivet till 「每一款造型都以假亂真」 utan fyra. 012v2:s "Four kinds" är omskrivet till 「壽司、披薩、漢堡、甜甜圈 每人挑一種襪子」. Rätt gjort.
- **Förbjudna påståenden:** 瑞典製/瑞典設計 förekommer inte. Sista raden är 「來自瑞典的品牌。」 ("ett varumärke från Sverige"), vilket är sant.
- **Butikens namn och domän:** står inte i annonstext, tal eller bild. Sofies "på matstrumpor.se" är struket i TW, och s001h1:s "Jag startade Matstrumpor" blev 「我是…創業的」 utan namnet.
- **Moms och tull:** ingen sådan text i annonser, köptexter eller korg (`momsrader: []`).
- **Erbjudandet mot korgen:**
  - 「買一送一」 (001–007) finns som paket SUSHI-K1F1, 2 lådor för NT$1,690.
  - 「買二送二，共 20 雙襪子」 (008) stämmer mot korgen 14:32 UTC: 4 lådor à 5 par, 2 betalda, 4 par ätpinnar à 0, summa 3 380 TWD.
  - 「免運費」 stämmer mot kassan: 「免運費 免費」.
- **Leveranslöften:** inget högtidslöfte i TW. `liquid.ms-sista-dag.fars_dag`/`jul` är tomma, och sajten säger bara 「5–10 個工作天」 samt 「預計送達 10月7日 – 10月14日」.
- **Spårningssidan (.com/zh-tw):** helt på traditionell kinesiska. Ett påhittat nummer gav 「我們找不到這個號碼」. 0 svenska ord.

---

## 🔴 Stoppande

Inga. Inget falskt påstående, inget förbjudet ord, inget fel språk och inget erbjudande som korgen inte ger hittades i TW-texterna. Förbehåll: ljudet och bilden kunde inte mätas, se "Kan inte mätas".

## 🟡 Bör rättas

```
G-C-zh-TW-01 🟡  TW 001–007, brödtexten (annonser/TW.json → copy.message och alla sju annonsers message)
Vad:     Tredje raden byter perspektiv. Hela texten talar till GIVAREN (「送洗衣精…送搞怪小物…」), men sista
         meningen säger att strumporna sitter på hans/hennes egna fötter. 「它都穿在你腳上」 är dessutom lite
         klumpigt (「它」 = "den/presenten" som subjekt till 穿 låter översatt).
Bevis:   「笑完之後，它不會留在盒子裡。每週，它都穿在你腳上。」 (annonser/TW.json, message).
         Svenskan har samma glidning: "Varje vecka sitter den på dina fötter." (TW.json → svenska.message).
         Sajten löser det rätt: 「這份禮物今晚逗人發笑，明天就穿在腳上。」 (underlag-zh-TW body_html).
Förslag: T.ex. 「笑完之後，它不會被收進抽屜，而是每週都穿在對方腳上。」 Skrivs av sonnet i rättningssessionen.
Vem:     byggarsessionen
```

```
G-C-zh-TW-02 🟡  TW 005 (haikuh3) och 006 (haikuh2), avsnitt två
Vad:     Rubriken i bild och undertexten/talet säger olika saker samtidigt. Rubriken 「第二：物超所值」
         ("prisvärt") står i bild medan tal och undertext säger 「第二：超值到誇張」 ("absurt prisvärt").
         Den japanska granskarens regel (egna/README.md: "undertexten måste säga samma sak som rubriken
         som syns samtidigt") bryts. Ett och tre är lika i båda (「第一：獨一無二」, 「第三：讓對方超開心」).
Bevis:   egna/TW/haikuh3.json segment 19,84–21,88 text 「第二：超值到誇張。」 mot texter.rubriker[1]
         「第二：物超所值」. Samma i egna/TW/haikuh2.json 15,56–17,74.
Förslag: Välj en av formuleringarna för både rubrik och tal. Talet kräver ny dubbning, så det billigaste är att byta
         rubriken till 「第二：超值到誇張」.
Vem:     byggarsessionen
```

```
G-C-zh-TW-03 🟡  TW 007 (s001h1), 4,84–7,08 s
Vad:     「我是被氣到才創業的。」 betyder "Jag startade företaget för att någon/något gjorde mig arg" (被 = passiv,
         någon annan är orsaken). Nästa mening handlar om att hon själv skjuter upp presentköpen. En taiwanesisk
         lyssnare väntar sig därför en person som retade henne, och logiken hackar. Svenskans "ur en ilska" syftar på
         egen frustration.
Bevis:   egna/TW/s001h1.json segment 2 (sv: "Jag startade Matstrumpor ur en ilska.") och segment 3
         「我總是拖到最後一秒，才想到要送什麼。」.
Förslag: T.ex. 「我會創業，是因為受夠了自己。」 eller 「我創業，是因為一肚子氣。」. Kräver ny dubbning av repliken.
Vem:     byggarsessionen
```

```
G-C-zh-TW-04 🟡  Sajten, produktsidan TW (.com/zh-tw/products/sushi-strumpor?country=TW)
Vad:     Judge.me-rutan är på SVENSKA, inte på engelska som byggaren skriver ("Taiwans Judge.me-ruta är på
         engelska", PROMPT.md → Kända beslut 8). Etiketten 「11 recensioner」 står direkt under produkttiteln.
         Att själva recensionerna är svenska är ett känt beslut. Men gränssnittet är också svenskt,
         och det stämmer inte med påståendet.
Bevis:   D/land-TW.json texter.produktsida (14:32 UTC): "11 recensioner", "Kundrecensioner", "Verifierad",
         "Skriv en recension", "Senaste", "Högsta betyg", "Lägsta betyg", "Bara bilder", "Mest hjälpsamma",
         "Recensioner på andra språk", "Översätt recension till 中文（台灣）". judgeme.locale_i_settings: "en"
         men preview "11 recensioner".
Förslag: Byt rutans språk för zh-TW (eller åtminstone en) i Judge.me, och rätta README-påståendet. Del D bekräftar.
Vem:     byggarsessionen
```

```
G-C-zh-TW-05 🟡  Sajten TW, prisformatet
Vad:     Samma belopp visas i två format: 「$1,690」 i paketväljaren och 「$1,690.00」 i köprutan, i korgen och i
         gåvans värde 「價值 $418.00」. Nya Taiwan-dollar skrivs i Taiwan utan decimaler, och helst som NT$.
         Ett ensamt 「$」 kan läsas som USD av en kund som kommer från en annons.
Bevis:   D/land-TW.json: pris_kopruta "$1,690.00"; paket[0].nu "$1,690"; paket[0].gava "… 價值 $418.00";
         korg_lokaliserad "$3,380.00 TWD".
Förslag: Visa TWD utan decimaler och med prefixet NT$ (butikens valutaformat för TWD i Shopify). Kosmetiskt.
Vem:     byggarsessionen
```

```
G-C-zh-TW-06 🟡  Mejlen, Shopifys standardmallar "levererad" (EmailTemplate 126544609619 och 126543757651)
Vad:     (a) Mallen för levererad försändelse bär meningen 「您的訂單已取消。」 ("Din order har avbrutits.")
         mitt bland leveransmeningarna. Troligen är det ett översättningsfel i Shopifys egen zh-TW. Vilken
         Liquid-gren som visar meningen går inte att avgöra ur den platta texten.
         (b) Båda mallarna tilltalar med 「您」, medan butikens tre egna fraktmejl och sajten säger 「你」
         (REGLER-ASIEN 4: 你-form, 您 bara i policyer).
Bevis:   D/mejl-zh-TW.json levererad_forsandelse.brodtext: "您的訂單已送達 您的訂單已取消。追蹤您的貨件來查看配送狀態。…",
         updatedAt null (= Shopifys standard). fraktbekraftelse: 「你好，…你的訂單 … 已離開倉庫」.
Förslag: Rendera mallens förhandsvisning på zh-TW (Shopify admin, testmejl) och se vilken gren som bär meningen.
         Registrera vid behov egna zh-TW-översättningar av de två mallarna i 你-form.
Vem:     byggarsessionen
```

## 🔵 Frågor till Axel och idéer

```
G-C-zh-TW-07 🔵  TW 001 (Nathalie) och 003 (Sofie H2, julvinkeln)
Vad:     Julvinkeln bygger på julstrumpan: 「塞聖誕襪」 ("stoppa i julstrumpan") och 「唯一適合放進聖誕襪的壽司」.
         I Taiwan är julen en kommersiell högtid utan julstrumpa i hemmen. Det stora jul-presentgreppet är
         「聖誕交換禮物」 (julklappsbyte på jobbet, i skolan och bland vänner, med ett prisspann). Budskapet går fram
         men träffar inte det taiwanesiska sammanhanget. Inget är fel eller falskt.
Bevis:   heygen/srt/TW/matstrumpor_nathalie.srt block 1; matstrumpor_sofie_h2.srt block 1.
Förslag: Ett nytt test med vinkeln 「交換禮物」 (t.ex. 「今年交換禮物，就送這個」) i en ny version efter att datan
         finns. Rör inte 003 före lansering, för julvinkeln är ett testbart antagande.
Vem:     Axel
```

```
G-C-zh-TW-08 🔵  TW 007 (s001h1) — grundarberättelsen
Vad:     En AI-kvinnoröst säger i första person att hon startade företaget (「我是…創業的」, 「我總是拖到最後一秒」).
         Så är det inte i verkligheten. Svenskan har samma berättelse och går i Sverige. I Taiwan kontrollerar
         Meta just nu annonsören (TAIWAN_UNIVERSAL). Taiwans konkurrenslag (公平交易法 §21, vilseledande
         reklam) och bedrägerilagen från 2024 gör påhittade personer i reklam mer känsliga där än i Sverige.
Bevis:   egna/TW/s001h1.json segment 2–4. Byggarens egen fråga 5 i PROMPT.md.
Förslag: Välj A) kör som i Sverige, B) byt replik 2 till en neutral berättare (「很多人都跟我一樣，總是拖到最後一秒…」)
         eller C) hoppa över 007 i Taiwan.
Vem:     Axel
```

```
G-C-zh-TW-09 🔵  Sajten och mejlen — siffran 4 utanför annonserna
Vad:     Siffran 4 och tecknet 四 står på sajten och i mejl, och det är inte i annonstext. Paketnivåns 「你會拿到 4 盒」
         och 「實木筷子（4 雙）」 är tillåtna enligt REGLER-ASIEN 14 ("bara där det är ett faktum"). Tre ställen går
         däremot utöver paketnivån:
         - bildens alt-text 「沙發上有四雙腳…」 (bildalt.61864814117203, startsidan),
         - pizzasidans 「盒內有 4 雙繽紛的襪子」,
         - fraktmejlet 「前 2–4 天，追蹤資訊常常不會顯示任何動態」.
         Inget av dem är säljargument. Men alt-texten skriver just tecknet 四.
Bevis:   output/underlag-zh-TW.json (nycklarna ovan); D/mejl-zh-TW.json fraktbekraftelse.
Förslag: Skriv om alt-texten utan antal (「沙發上一家人的腳，各穿著自己的美食造型襪…」). Mejlets 「前幾天」 räcker.
Vem:     Axel (lågt värde, ingen brådska)
```

```
G-C-zh-TW-10 🔵  Kassan TW
Vad:     Kassans rubrik lyder 「Matstrumpor.se 結帳」. En taiwanesisk kund som kommer från .com/zh-tw ser en .se-adress
         som butikens namn i kassan. Det är Shopifys butiksnamn, inte en översättning.
Bevis:   D/land-TW.json kassa.rader[2] "Matstrumpor.se 結帳".
Förslag: Informationen går till Axel. Butiksnamnet ändras bara om han vill, och det påverkar alla marknader.
Vem:     Axel
```

---

## Kan inte mätas härifrån

- **Ljudet i alla åtta annonser.** Kontot har 0 TW-annonser, och videofilerna (`annonser/klar/TW_*.mp4`) ligger bara i byggarens container. Därför är följande inte hört:
  - tonerna i 襪子 (wàzi, byggaren hörde 蛙子 med klonrösten),
  - Anna Su-rösten i 005–007 (byggarens replik-för-replik-täckning var 0,78–0,85),
  - HeyGens mandarin och läppsynk i 001–003 (byggaren: nathalie 0,81, 聖誕 hördes 震盪, 筷子 hördes 蓋子).
  
  Det som står under "Vad som sägs" i tillbaka-filen är **manus och undertext, inte vad som hörs**.
- **Bilden:** undertexterna i bild, typsnittet och eventuella tomma rutor i stället för CJK-tecken, radbrytningen i 012v2:s orange rutor, svenska rester och loggan "MATSTRUMPOR.SE". Det gäller också 008:s rendering (sex lådor, textens placering). Ingen TW-video eller TW-bild har hämtats ur Meta.
- **Metas version av texterna.** Det finns ingen `object_story_spec` för TW. Texterna ovan är repots och kan skilja från det som till slut laddas upp.
- **Om 001–003 visar undertexterna i bild alls.** Captions är opt-in. SRT-blocken är långa (Sofie H1 block 1: 52 tecken på 13,4 s, Sofie H2 block 2: 68 tecken på 15,2 s). De ryms inte på två rader om de bränns in som de står. Takten är 3,9–5,4 tecken/s, alltså under TW-taket 5,5.
- **Fraktmejlens länk:** `D/sparning-zh-TW.json` visar att `matstrumpor.se/zh-tw/pages/spara?country=TW` svarar **404 med svensk sida** ("Sidan hittades inte"). Om fraktmejlets knapp för Taiwan pekar på .se syns bara i den renderade mallen, och den frågan hör till del D/E. Språkligt är .com-sidan felfri.
- **Spoks mejlflöden till Taiwan** (engelska enligt ett känt beslut) är inte lästa.
