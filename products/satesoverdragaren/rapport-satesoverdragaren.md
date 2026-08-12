# Sätesöverdragaren – Creative Strategy-rapport (FAS 0–10)

**Produkt:** Sätesöverdrag för Åkgräsklippare – Slittåligt 600D Oxford (baverbutiken.se)
**Kampanj:** "Sätesöverdragaren" (ID 120249122415680291) · Konto: MagiBorsten (1867947880635861)
**Analysdatum:** 2026-07-30 · Datafönster: 2026-07-20 → 2026-07-30 (~10,5 dagar)

---

## 1. Executive summary

- **Kampanjen är lönsam och skalbar på kreativ nivå.** 10 998 kr spend → 35 köp, CPA 314 kr, ROAS 2,29. Shopify bekräftar 41 ordrar / 29 335 kr netto samma period – Meta-attributionen fångar ~85 % av ordrarna, siffrorna är trovärdiga.
- **En annons driver allt:** `Seatcover_PD_1_3_H1` (38s produktdemo-video med hårdkodade svenska captions) står för 63 % av spend och **77 % av köpen** (27 st, CPA 258 kr, ROAS 2,81, hook rate 44 %). Det är kampanjens enda bevisade vinnare.
- **Största budgetläckan:** `Seatcover_PD_1_1_H1` – samma video och copy som vinnaren men **utan captions** – har bränt 1 216 kr för 1 köp (ROAS 0,53). Pausa den i dag. Isolerade skillnaden mot vinnaren är text-i-bild, vilket gör detta till kampanjens tydligaste lärdom: **svenska captions i bild är en vinnande variabel.**
- **Offer-statiken (`Seatcover_SO_1_1_H1`) är näst bäst per krona** (CPA 281, ROAS 2,77, LPV→köp 6,1 %) **men innehåller ett kritiskt bildfel:** den AI-genererade bilden skriver ut ordet **"överstruket"** som faktisk text ("811 KR ~~…~~ överstruket"). Den ska bytas ut, inte skalas. Fixad version är brief #1 i testplanen.
- **Ytterligare kvalitetsfynd:** SP-videorna är 79–146 s långa (retention kollapsar; 0 köp), och `Seatcover_SP_3_1_H1` är en AI-genererad "Verifierad kund, 54 år"-testimonial som inte kan beläggas med någon riktig recension – juridisk/policy-risk, ersätt med riktigt kundcitat. Grå-varianten är dessutom **översåld i Shopify (-12 i lager)** medan annonserna lovar "fyra färger".
- **Konkurrensläget är öppet:** Ad Library-sökningar på svenska kategoritermer hittar **inga direkta konkurrenter** som annonserar sätesöverdrag för åkgräsklippare i Sverige. Vi sätter prisankaret själva ("nytt originalsäte kostar tusenlappar") – det ankaret är vår starkaste bevisade persuasion-mekanism.
- **Leverans:** 12 produktionsklara briefer (6 video, 6 statiska) + prioriterad testplan i tre tiers. Tier 1 kan produceras utan ny inspelning.

---

## 2. Datakvalitet och begränsningar

| Källa | Status | Kommentar |
|---|---|---|
| Meta Ads MCP (kampanj/adset/annons) | ✅ Fullständig | Fältnamn verifierade före hämtning. Datumpreset "maximum". |
| Meta creatives (copy, rubrik, CTA, video-ID) | ✅ Fullständig | All copy hämtad ordagrant. |
| Videometadata (längd) | ✅ Fullständig | PD-video 38s (en 33s-variant), SP-videor 79s + 146s. |
| Statiska bilder | ✅ Nedladdade + visuellt granskade | 3 bilder granskade; 2 flaggade (se §4/§14). |
| Videoinnehåll/transkript | ❌ Ej åtkomligt via API | **Transkriberar inte på gissning.** Rad-för-rad-analys (FAS 3) körs när du klistrar in transkript för `PD_1_3` (vinnaren) samt SP-videorna. Retention + copy + previews är analyserade. |
| Hook rate | ⚠️ 3s-plays/impressions | Fältet `3_second_video_plays` fanns – äkta 3s-hook. Hold = ThruPlay/3s samt p50/3s. |
| Landningssida | ✅ Hämtad | Pris 649 kr (ord. 811 kr), 4 färger, fri frakt >300 kr, Klarna, 30 dagars garanti. |
| Shopify | ✅ Korsvaliderad | 41 ordrar 21–30 juli, netto 29 335 kr, AOV ~715 kr. Grå-varianten -12 i lager (översåld). |
| Kundrecensioner | ❌ Lucka | LP visar "20 recensioner" men texterna kräver Judge.me-token. Alla "kundcitat" i denna rapport är märkta som overifierade. |
| Meta Ad Library | ✅ 4 sökningar | Inga direkta konkurrenter i SE. Indirekta: John Deere, Lyvo (sittdynor). |
| Targeting per adset | ⚠️ Ej verifierad | Marknad Sverige antagen (SEK-konto, svensk copy, svensk LP). |
| COGS / break-even | ❌ Saknas | **Behövs för kill-regler.** Interimsregel i §14 tills COGS finns. |

**Minsta möjliga komplettering som efterfrågas:** (1) transkript för PD-videon 38s och SP-videorna, (2) Judge.me-recensionstexterna, (3) COGS per enhet.

---

## 3. Kampanjöversikt (FAS 1)

| Parameter | Värde |
|---|---|
| Kampanj / ID | Sätesöverdragaren / 120249122415680291 |
| Konto | MagiBorsten (1867947880635861), SEK |
| Körtid | 2026-07-20 13:14 → pågår (data t.o.m. 30 juli, ~10,5 dagar) |
| Objective / optimering | OUTCOME_SALES / OFFSITE_CONVERSIONS (köp), alla adsets |
| Attribution | 1d view / 7d click / 1d engaged view |
| Budget / bid | CBO 1 500 kr/dag, Highest volume (lowest cost), auktion |
| Spend | 10 997,92 kr |
| Impressions / Reach / Frekvens | 84 643 / 43 902 / 1,93 |
| CPM | 129,93 kr |
| CTR (alla) / CPC | 3,08 % / 4,22 kr |
| Länkklick / länk-CTR / kostnad per länkklick | 1 737 / 2,05 % / 6,33 kr |
| Funnel | 1 737 klick → 1 158 LPV (67 %) → 50 ATC (4,3 % av LPV) → 38 IC (76 % av ATC) → 35 köp (92 % av IC) |
| CPA / ROAS / attribuerad intäkt | 314,23 kr / 2,29 / ~25 160 kr (AOV attr. 718,84 kr) |
| Struktur | 3 adsets = koncept-uppdelning: **Seatcover PD** (produktdemo-videor), **Seatcover SP** (social proof), **Seatcover SO** (offer-statik). Annonser följer `Seatcover_{KONCEPT}_{ADID}_{VARIANT}_{HOOK}`. |
| Trafik | Kall (frekvens 1,93 på 10 dagar, inga retarget-adsets) |

**Funnel-hälsa:** Kassan läcker inte (IC→köp 92 %, ATC→köp 70 %). LPV→köp 3,0 % är godkänt för kall trafik på 649 kr AOV. Klick→LPV 67 % är normalt. **Flaskhalsen ligger före klicket** – CBO:n lägger 89 % av budgeten på PD-adsetet, och inom det på en enda annons. Det som behövs är inte LP-fixar utan fler kreativ som klarar vinnarens nivå, så kampanjen har något att skala på när vinnaren tröttnar (frekvensen stiger redan).

**Shopify-korsvalidering:** 41 ordrar (21–30 juli), brutto 31 152 kr, netto 29 335 kr, AOV ~715 kr. Meta tar 35 köp → 85 % täckning, inget som tyder på överattribution.

---

## 4. Ranking av annonser (FAS 2)

Benchmark = kampanjsnitt: CPA 314 kr · ROAS 2,29 · CTR 3,08 % · CPM 130 kr. Hook = 3s-plays/impressions. Hold = ThruPlay/3s-plays (p50/3s inom parentes). Ingen dom under ~300 kr spend eller 3 köp.

| Annons | Klass | Spend | Köp | CPA | ROAS | CTR | Hook | Hold (p50/3s) | Viktigaste observation |
|---|---|---|---|---|---|---|---|---|---|
| **Seatcover_PD_1_3_H1** (38s video, captions) | **Bevisad vinnare** | 6 965 kr | 27 | 258 kr | 2,81 | 3,25 % | 44,2 % | 35,6 % (28,7 %) | Bär hela kampanjen: 63 % av spend, 77 % av köpen. Bäst på varje delmetrik bland videorna. |
| **Seatcover_SO_1_1_H1** (offer-statik) | **Lovande** | 843 kr | 3 | 281 kr | 2,77 | 1,60 % | – | – | Bäst CVR: LPV→köp 6,1 % (dubbla vinnarens 3,2 %). Låg CTR = bilden filtrerar, copyn konverterar. **KRITISKT: "överstruket"-textbugg i bilden – får inte skalas som den är.** |
| Seatcover_PD_2_1_H1 (33s före/efter-video) | Lovande (svag) | 1 054 kr | 3 | 351 kr | 1,85 | 2,77 % | 37,6 % | 28,8 % (26,5 %) | Precis vid databröset (3 köp). CPA 12 % över snitt. Före/efter-vinkeln förtjänar en bättre exekvering, inte mer budget på denna. |
| Seatcover_PD_1_2_H1 (38s, "Ingen mer blöt rumpa"-overlay) | Osäker (lutar förlorare) | 481 kr | 1 | 481 kr | 1,35 | 2,48 % | 39,7 % | 28,0 % (22,4 %) | Overlay i sekund 1 men (till synes) utan löpande captions – hook ok, håller inte hela vägen till köp. Under 3 köp: ingen dom, men prioriteras bort. |
| **Seatcover_PD_1_1_H1** (38s, utan text) | **Förlorare** | 1 216 kr | 1 | 1 216 kr | 0,53 | 2,76 % | 36,7 % | 27,8 % (21,2 %) | **Största budgetläckan** (11 % av spend, 3 % av köpen). Samma video+copy som vinnaren minus captions. Pausa. |
| Seatcover_SP_2_1_H1 (79/146s UGC-video) | Osäker | 378 kr | 0 | – | – | 6,74 % | 63,6 % | 35,6 % (10,7 %) | Läroboksexempel på regel 9: högst CTR i kampanjen, noll köp på 46 LPV. Hook 64 % men p50 rasar (videon är 79+ s). Nyfikenhetsklick, inte köpintention. |
| Seatcover_SP_1_1_H1 (UGC-video) | Osäker (för lite data) | 21 kr | 0 | – | – | 9,23 % | 63,8 % | – | 130 visningar. Ingen dom. |
| Seatcover_PD_3_1_H1 (video) | Osäker (för lite data) | 37 kr | 0 | – | – | 2,01 % | – | – | 299 visningar. Ingen dom. CBO svälter den. |
| Seatcover_SP_3_1_H1 (testimonial-statik) | Osäker (för lite data) | 8 kr | 0 | – | – | 0 % | – | – | 19 visningar. Ingen dom på performance – **men bilden är en fabricerad AI-testimonial ("Verifierad kund, 54 år") och ska ersättas oavsett** (se §14). |

**20/80:** `PD_1_3` ensam = 77 % av resultatet. **Budgetläcka:** `PD_1_1` (1 216 kr → 1 köp).

---

## 5. Djupanalys av vinnaren (FAS 3)

### Seatcover_PD_1_3_H1
- **Format:** 38s produktdemo-video (leverantörsklipp), 1:1/4:5, hårdkodade svenska captions i vit text med svart kant (verifierat via preview-frame: "Om du klipper gräset ofta").
- **Copy (ordagrant):** *"Sätet på åkgräsklipparen är blött varje morgon och brännhett varje eftermiddag. 😩 / Vårt sätesöverdrag träs rakt över din befintliga dyna: ✅ Vattenavvisande 600D Oxford – torr stjärt även efter regn ✅ Vadderad insida som tar guppen åt dig ✅ Justerbara remmar, glider inte ens på ojämn mark ✅ På plats under 60 sekunder – inga verktyg / Passar de flesta åkgräsklippare och trädgårdstraktorer. Fyra färger. / 👉 Tryck på länken och se hur enkelt det sitter på."*
- **Rubrik:** "Torrt och skönt säte – hela säsongen" · **CTA:** Handla nu (SHOP_NOW) · **AOV:** 725 kr (högre än snittet – köper fler enheter/dyrare färger).

**Retention mot manus (data):**

| Punkt | ~Tid | Andel av starter | Andel av 3s-tittare |
|---|---|---|---|
| Start (plays) | 0s | 100 % | – |
| 3s (hook) | 3s | 46 % av starter · 44,2 % av impressions | 100 % |
| p25 | ~9,5s | 24,6 % | 53 % |
| p50 | ~19s | 13,3 % | 28,7 % |
| p75 | ~28,5s | 9,0 % | 19,4 % |
| p100 | 38s | 5,1 % | 11,1 % |
| ThruPlay (15s+) | – | 16,5 % | 35,6 % |

**Största tappet är 3s→9,5s (halva publiken).** Utan transkript kan jag inte peka på exakt vilken rad som tappar dem – det är därför transkriptet är efterfrågat. 2 751 personer såg hela videon; snitt-tittartid 8s.

**Tre nivåer (data vs hypotes):**
- **Attention (data):** Produkten fyller bildrutan från sekund 0 (gul/grå design som liknar John Deere-färger = igenkänning för målgruppen), captions gör den ljud-oberoende. Hook 44 % är högst av alla PD-varianter – och det enda som skiljer varianterna åt är text-i-bild-behandlingen. |
- **Persuasion (data + hypotes):** Copyn speglar två fysiska smärtor (blött/brännhett) som varje ägare känner igen samma morgon de ser annonsen (juli = säsong). Dryckeshållare/förvaringsficka syns i videon – "mer än skydd"-mervärde (hypotes: bidrar till p25-hold).
- **Conversion (data):** Friction-dödare i copy: "träs rakt över", "under 60 sekunder – inga verktyg", "passar de flesta". LPV→köp 3,2 %, ATC→köp 71 %.

**Återanvändbara hook-formler (från vinnarens mönster):**
1. **Väder-empati:** "[Kroppsdel/objekt] är [blött/brännhett] varje [morgon/eftermiddag]" + produkten i bild.
2. **Säsongstrigger:** "Om du klipper gräset ofta …" (villkorssats som självselekterar målgruppen på 2 sekunder).
3. **Demo-först:** visa påträdningen (0→klart) innan något säljs.

---

## 6. Analys av förlorarna (FAS 4)

**Seatcover_PD_1_1_H1 (ROAS 0,53):** Exakt samma video, copy, rubrik och CTA som vinnaren. Skillnad (verifierad via previews): ingen textbehandling i bild. Hooken är inte problemet (36,7 % vs 44,2 % – sämre men inte katastrof). Skillnaden exploderar efter klicket: LPV→köp 0,9 % vs vinnarens 3,2 %. Hypotes: utan captions säljer videon inte *argumenten* (600D, 60 sekunder, vaddering) till de ~70 % som scrollar utan ljud – klicken blir oinformerade och konverterar inte. **Beslut: pausa.**

**Seatcover_PD_1_2_H1 (ROAS 1,35):** Stor gul overlay "Ingen mer blöt rumpa" sekund 1 – bra stoppkraft (hook 39,7 %) men samma svaghet efter klicket (LPV→köp 1,1 %). En rubrik är inte en argumentation. **Beslut: pausa, men hooken "Ingen mer blöt rumpa" är värd att återanvända ovanpå vinnarens captions-format (= brief Seatcover_PD_4_H1).**

**Seatcover_SP_2_1_H1 (0 köp):** 79s garage-UGC (Husqvarna). Hook 64 %, CTR 6,7 % – och ändå noll köp på 46 LPV. p50 = 10,7 % av 3s-tittare (vs vinnarens 28,7 %): videon är dubbelt så lång som uppmärksamheten räcker. Klicken kommer från nyfikenhet på klippet, inte köpintention. **Beslut: klipp ner till 30s (Tier 2), skala inte som den är.**

| Element | Vinnare (PD_1_3) | Förlorare (PD_1_1 / SP_2_1) | Trolig påverkan | Nästa test |
|---|---|---|---|---|
| Captions i bild | Löpande svenska captions | Ingen text / bara 1s-overlay | Hook +7,5 pp, LPV→köp 3,4× | Alla nya videor levereras med inbrända captions (regel i Creative DNA) |
| Videolängd | 38s | 79–146s (SP) | p50 28,7 % vs 10,7 % | 15s-cutdown av vinnaren (PD_5_H1) |
| Klicktyp | CTR 3,25 % med CVR 3,2 % | CTR 6,7 % med CVR 0 % | Hög CTR ≠ köp (regel 9) | Kvalificerande hook i UGC-remake (SP_4_H1) |
| Prisanker i copy | Nämns ej | SO-statiken: "tusenlappar" → 649 kr | SO har högst CVR (6,1 %) | Anker + demo kombineras (PD_6_H1, SO_2_1) |

---

## 7. Winner vs loser – sammanfattning

Samma produkt, samma copy, samma CTA, samma 38 sekunder råmaterial gav ROAS 2,81 respektive 0,53. Den isolerade variabeln var **text-i-bild**. Det är kampanjens dyraste och mest värdefulla lärdom: distributionen av argumenten (captions) är viktigare än själva klippet. Sekundärt: **korta demos slår långa berättelser** i denna kategori, och **hög CTR utan CVR är en varningssignal, inte en framgång**.

---

## 8. Creative DNA (FAS 5)

**Winning DNA (data):**
- 30–40s produktdemo, produkten i bild < 1s, gul/grå colorway (traktor-igenkänning)
- Löpande svenska captions, vit text/svart kant, ljud-oberoende
- Copy-struktur: spegla 2 fysiska smärtor → "träs rakt över" → 4 ✅-USP:ar → friction-dödare → mjuk CTA ("se hur enkelt det sitter på")
- Prisanker "nytt säte = tusenlappar" (SO: högst CVR i kampanjen)
- Rubrik = slutresultat, inte produktnamn ("Torrt och skönt säte – hela säsongen")

**Losing DNA (data):**
- Video utan text-i-bild (ROAS 0,53)
- 79s+ berättande UGC utan klippning (p50 kollapsar, 0 köp)
- En overlay-rubrik som enda textbehandling (PD_1_2: 1,35)

**Regler:**
- **Behåll alltid:** captions; produkt < 1s; 649/811-priset exakt som LP; "60 sekunder, inga verktyg"; 30-dagarsgarantin i proof/offer-copy.
- **Testa kontrollerat (en variabel):** hook-formuleringen (H-ID), längd (38s vs 15s), persuasion-mekanism (demo vs anker vs proof), placering-format (4:5 vs 9:16).
- **Undvik:** textlösa videor; >45s utan retention-bevis; CTR-optimerade nyfikenhetshooks; AI-text i bild utan korrekturläsning.
- **Ännu obevisat (hypoteser att testa):** riktiga kundröster (UGC), mechanism-förklaring (varför 600D håller), regn-demo som hook, karusell/listicle-format.

---

## 9. Kundinsikter (FAS 6)

**Direktcitat (verifierade källor):**
- LP: *"Trött på ett blött, hett och sprucket säte?"* · *"Originaldynan … torkar ut, spricker och blir stenhård"* (produktsidans problemformulering)
- Annonskommentarsdata saknas i API:t.

**Mönster (härlett ur data):** Köparen svarar på *komfort nu* (blöt/het) snarare än *skydd sen* – demovinkeln slår. SO-statikens CVR indikerar att *ekonomisk rationalisering* ("rädda tusenlappar") är det som stänger köpet efter att demon väckt intresset.

**Hypotes (OVERIFIERAT – flagga):** *"Trodde jag skulle behöva byta hela sätet"* används i copy som "vanligaste kundkommentaren" och i SP_3-statiken som citat från "Verifierad kund, 54 år". Ingen av dessa kan beläggas mot riktiga recensioner (Judge.me-lucka). Tills recensionstexterna levererats behandlas allt sådant som fabricerat och får inte användas i nya annonser med "verifierad kund"-etikett.

---

## 10. Konkurrentinsikter (FAS 6)

**Direkta konkurrenter (Ad Library, SE, 4 söktermer):** Inga. Sökningarna på "sätesöverdrag åkgräsklippare", "åkgräsklippare säte", "sittdyna traktor gräsklippare", "skydda sätet överdrag" returnerar endast Bäverbutikens egna annonser. **Betydelse för vårt offer:** vi äger kategorins prisreferens i feeden. Ingen pressar oss på pris – ankaret "nytt originalsäte = tusenlappar" är oemotsagt och bör användas hårdare (PD_6, SO_2). Samtidigt: inga konkurrenter = ingen validerad demand-pool att sno; volymen måste byggas på problem-awareness.

**Indirekta:** John Deere (annonserar "Ergonomisk förarplats" på hela maskiner – vi kan positionera oss som "ergonomi för 649 kr istället för ny maskin"), Lyvo (komfort-sittdynor, "Extra Komfort När Du Sitter" – bekräftar att komfortvinkeln fungerar i SE-feeden), Haniai (generisk "24h frakt från Sverige" – leveranslöftet är en aktiv konverteringsspak i kategorin).

**3 lånade mekanismer från andra kategorier (hypoteser):**
1. **Bilstolsöverdrag:** "passar din modell"-kompatibilitetsdemo (måttguide i bild) → sänker största friktionsfrågan (passform). Testas i PD_9-statiken.
2. **Utemöbelskydd:** väder-time-lapse (regn → torrt under) → visuellt bevis istället för påstående. Testas som hook i PD_4.
3. **Arbetskläder/verktyg:** slitage-/materialtest på nära håll ("600D vs vanligt tyg") → authority-mekanism. Testas i PD_7-videon.

---

## 11. Variationer per vinnare (FAS 7) – sammanfattning

Fullständiga specar i `briefs/video-ads/`. Vinnaren `PD_1_3` itereras med **en isolerad variabel per test**:

| Ny annons | Typ | Isolerad variabel | Hypotes |
|---|---|---|---|
| `Seatcover_PD_4_H1` | Nära iteration (re-edit) | Hooken (0–3s): regn-på-sätet + "Ingen mer blöt rumpa"-caption ovanpå vinnarens captions-format | Bevisad overlay-hook + bevisade captions > vinnarens hook; mål: hook ≥ 48 % med bibehållen CPA |
| `Seatcover_PD_5_H1` | Format transfer | Längd/format: 15s cutdown, 9:16, front-loadad demo | Halva tappet ligger 3s–9,5s; kortare klipp → högre ThruPlay och lägre CPM i Reels utan CVR-tapp |
| `Seatcover_PD_6_H1` | Ny persuasion-angle | Mekanism: demo → ekonomiskt anker ("Nytt säte 2 000+ kr – det här 649 kr") | SO-statikens anker har kampanjens högsta CVR; i videoform på vinnarens klipp bör den sänka CPA under 258 kr |

## 12. Nya videokoncept (FAS 8) – sammanfattning

| Ny annons | Mekanism | Kärna |
|---|---|---|
| `Seatcover_SP_4_H1` | Proof-led UGC (ny inspelning) | Svensk ägare, 25–30s, riktig röst: "Trodde jag skulle behöva byta sätet" – **BLOCKER: får bara spelas in med riktigt kundcitat/riktig kund** |
| `Seatcover_PD_7_H1` | Mechanism-led | "Därför spricker ditt säte" – sol/regn förstör dynan; 600D-materialtest + vattenhälls-demo förklarar *varför* överdraget löser det |
| `Seatcover_SP_5_H1` | Story-led före/efter | 35s: sprucket 8-årigt säte → 60-sekunderfixen → torr morgonkörning (konceptkod SP = bedömning; närmast social proof) |

## 13. Nya bildkoncept (FAS 9) – sammanfattning

| Ny annons | Mekanism | Kärna |
|---|---|---|
| `Seatcover_SO_1_2` | Offer (ersätter buggad vinnarbild) | Exakt samma layout som SO_1_1 men korrekt genomstruket 811-pris – **variant 2 på samma AD ID så A/B:t syns i Ads Manager** |
| `Seatcover_PD_8_1` | Demo 3-steg | "Trä på. Spänn fast. Kör." – tre foton, 60-sekunderslöftet |
| `Seatcover_PD_9_1` | Jämförelse | Split: sprucket originalsäte vs täckt säte + kompatibilitetsrad "Passar de flesta åkgräsklippare" |
| `Seatcover_SP_6_1` | Testimonial | Riktigt citat ur Judge.me + "20 recensioner" – **BLOCKER tills riktig recensionstext finns** |
| `Seatcover_PD_10_1` | Listicle 4:5 | "4 skäl att skydda sätet innan hösten" |
| `Seatcover_SO_2_1` | Risk/cost-of-inaction | "Vänta en säsong till?" – sprucket säte + "ny dyna: tusenlappar / överdrag: 649 kr" |

---

## 14. Prioriterad testplan (FAS 10)

### Gör INNAN mer spend (idag)
1. **Pausa `Seatcover_PD_1_1_H1`** (ROAS 0,53, 11 % av budgeten). Pausa även `PD_1_2_H1` (lutar förlorare, hooken återvinns i PD_4).
2. **Byt ut SO-statiken:** "811 KR **överstruket**"-buggen (ordet står i bilden). Ersätts av `Seatcover_SO_1_2`. Originalfilen är märkt `DO_NOT_REUSE_` i leveransen.
3. **Pausa/ersätt `Seatcover_SP_3_1_H1`:** fabricerad AI-testimonial ("Verifierad kund, 54 år") utan verifierbar källa + AI-artefakter i textrenderingen. Policy-/förtroenderisk. (Endast 8 kr spend – inget testvärde förlorat.)
4. **Shopify: Grå-varianten är översåld (-12).** Annonser + LP lovar "fyra färger" och "5–10 dagars leverans". Justera lagersaldo eller dölj Grå tills påfyllning – annars byggs en reklamationsvåg. *(Kräver ditt beslut/butiksåtgärd → BLOCKER-flagga.)*
5. **Skicka underlag:** transkript (PD 38s + SP-videorna), Judge.me-recensionstexter, COGS.

### Bedömningsregler
- Ingen dom < 300 kr spend eller < 3 köp.
- **Break-even saknas (COGS okänd).** Interimsregel tills COGS levererats: kill vid **0 köp @ 500 kr spend** eller **CPA > 650 kr** (= säljpriset, garanterat under vatten) vid 500 kr. När COGS finns: kill vid CPA > 2× break-even @ 500 kr, per originalregeln.
- Hook-diagnos: mål ≥ 44 % (vinnarens nivå). Hold-diagnos: p50/3s ≥ 25 %. Diagnostik – beslut fattas på CPA/ROAS.

### Tier 1 – producerbart direkt utan ny inspelning (starta först)
| Prio | Annons | Format | Produktionsnivå | Primärt KPI | Varför först |
|---|---|---|---|---|---|
| 1 | `Seatcover_SO_1_2` | Statik (fix) | Enkel | CPA | Ersätter bevisat konverterande bild med kritisk bugg |
| 2 | `Seatcover_PD_4_H1` | Video re-edit | Enkel | Hook rate → CPA | Ny hook på bevisat klipp; billigaste sannolika vinsten |
| 3 | `Seatcover_PD_5_H1` | Video cutdown | Enkel | ThruPlay + CPA | Attackerar det dokumenterade 3–9,5s-tappet |
| 4 | `Seatcover_PD_8_1` | Statik | Enkel | CPA | Demo-mekanik i stillbild, komplement till SO i samma adset |
| 5 | `Seatcover_SO_2_1` | Statik | Enkel | CPA | Testar risk/cost-mekanismen som SO-datan pekar mot |
| 6 | `Seatcover_PD_10_1` | Statik (listicle) | Enkel | CTR *utan* CVR-tapp | Nytt format, gammalt budskap |

### Tier 2 – kräver design/underlag men ingen inspelning
| Annons | Blocker |
|---|---|
| `Seatcover_PD_6_H1` (anker-video) | Ingen – re-edit + ny VO/captions |
| `Seatcover_PD_9_1` (jämförelse-statik) | Behöver foto på sprucket säte (finns i PD_2-klippet – frame-grab ok) |
| `Seatcover_SP_6_1` (testimonial-statik) | **BLOCKER: riktig recensionstext (Judge.me)** |
| SP_2-cutdown (79s → 30s) | Transkript för att välja segment |

### Tier 3 – ny inspelning
| Annons | Blocker |
|---|---|
| `Seatcover_SP_4_H1` (UGC) | Kund/creator med åkgräsklippare + riktigt citat |
| `Seatcover_SP_5_H1` (story) | Sprucket säte-material + creator |
| `Seatcover_PD_7_H1` (mechanism) | Produktsample för materialtest (kan delvis göras med leverantörsklipp) |

**Budgetallokering vid teststart:** behåll `PD_1_3` + `SO_1_2` som kontroller i sina adsets; nya annonser in i respektive koncept-adset (PD/SP/SO) så CBO:n får avgöra – men flytta inte budget manuellt förrän en utmanare har ≥ 3 köp.

---

## 15. Lärdomar inför nästa analys

1. **Captions är en variabel, inte en detalj.** Kör aldrig mer en video-variant utan inbrända captions som "kontroll" – det testet är redan betalt (1 216 kr).
2. **CTR-fällan är verklig i denna kategori** (SP_2: 6,7 % CTR, 0 köp). Nästa analys ska läsa CTR ihop med LPV→köp innan något kallas lovande.
3. **En-annons-beroendet är största risken.** Frekvens 1,93 efter 10 dagar; när vinnaren tröttnar finns idag ingen back-up. Testplanens jobb är att producera 2–3 annonser som klarar CPA < 314 kr innan det händer.
4. **Namnhygien:** statiska annonser har fått `_H1`-suffix (SO_1_1_H1, SP_3_1_H1) trots att hook-ID bara ska användas för video. Nya statiska följer `_VARIANTSIFFRA` (t.ex. SO_1_2) så testerna kan avläsas direkt i Ads Manager.
5. **Data som saknades och ska finnas nästa gång:** transkript, recensionstexter, COGS/break-even, targeting-verifiering per adset.

---

*Upptagna AD ID:n vid denna analys: PD 1–3, SP 1–3, SO 1. Nya ID:n i denna leverans: PD 4–10, SP 4–6, SO 2 (+ SO_1 variant 2). Inga ID:n återanvänds.*
