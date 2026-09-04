# Produktjakt — konsoliderad slutrapport (2026-09-04, 11:00 UTC)

**En rapport, en sanning.** Den här filen ersätter alla del- och lägesrapporter som
underlag för beslut. Den är sammanställd ur repots aktuella tillstånd på grenen
`claude/temu-winner-reverse-engineer-ntzpe8` efter att båda passen stoppats:

| Pass | Vad | Var |
|---|---|---|
| V2 + V2.1 (det här passet, 00:30–10:45 UTC) | 519 listningar i 13 kluster → 386 koncept, hyllan verifierad för 39 koncept, gate 4/5 på USA-data för 6 listningar, koncept/listning-modellen | `docs/temu-jakt-v2.md`, `docs/temu-jakt-v2/jakt/` (dataset.json, koncept.json, hylla/, material/) |
| V2.2 (parallellt pass, 09:05–10:25 UTC) | fas 1: de fyra överlevarna färdigställda; fas 2: 523 nya listningar i nio kluster; datavägar när Temu är blockerat | `docs/temu-jakt-v2/jakt/v22/RESULTAT.md`, `v22/fas1/`, `v22/fas2/`, `v22/DATAVAGAR.md` |

Metoden är oförändrad: vinnar-fingeravtrycket i `docs/temu-vinnar-dna.md` avsnitt 12,
gate-ordningen och statusmodellen i `docs/temu-jakt-v2/jakt/PIPELINE-V2.1.md`.
Ingen ny metodik, ingen ny jakt. Inga bakgrundsjobb eller schemalagda hämtningar
är igång (kontrollerat 10:57 UTC: 0 processer, 0 routines).

**Temu är blockerat** (`/se` sedan 00:58 UTC, USA-vägen sedan ~09:00 UTC; sista prov
10:29 UTC). Allt som kräver produktsidan — leverantörsvideo, galleri, SE-pris,
variantlista — står som **PENDING** där det inte redan hämtats. Pris i USD kommer ur
sökutdrag (Seznam) eller USA-sidans JSON-LD och räknas om med kalibreringen
SE-Temu ≈ USD × 6,96–8,16, landad ≈ SE-Temu × 1,5 (`economics_source: us-proxy`).

---

## Rangordnad lista

| # | Prioritet | Produkt | Bästa Temu-länk | DNA | Konfidens |
|---|---|---|---|---|---|
| 1 | **TEST NOW** | Isolerad utekattkoja i Oxford-tyg | https://www.temu.com/se/g-601101118338671.html | 79 | HIGH (material, ekonomi, hylla) · MEDIUM (publik) |
| 2 | **TEST IF MATERIAL VERIFIED** | Taköverdrag till husvagn/husbil, 5–12 m | https://www.temu.com/se/g-601101311828193.html | 72 | LOW |
| 3 | **TEST IF MATERIAL VERIFIED** | Staketstolps-reparationsbygel | https://www.temu.com/se/g-601103866118857.html | 78 | MEDIUM |
| 4 | **TEST IF MATERIAL VERIFIED** | Tändvedsklyv i gjutjärn (ring + kil) | https://www.temu.com/se/g-601099583674464.html | 72 | MEDIUM (ekonomi) · LOW (material) |
| 5–21 | **WATCH** | 17 koncept, se avsnitt 3 | | 42–82 | LOW |
| — | **REJECT** | 20 lärorika avslag (av 370+), se avsnitt 4 | | | |

Räknat strikt enligt fingeravtrycket finns **en** produkt som kan testas i dag.
De tre i prioritet 2 blir TEST NOW eller REJECT den dag leverantörsmaterialet går att se —
och det är ett tekniskt hinder (`BLOCKED_SOURCE`), inte ett kommersiellt.

---

## 1. TEST NOW

### 1. Isolerad utekattkoja i Oxford-tyg, hopfällbar

| Fält | |
|---|---|
| **Produkt** | Hopfällbar isolerad utekattkoja i Oxford-tyg med spetsigt tak, skumisolering, vattenavvisande |
| **Bästa Temu-länk** | https://www.temu.com/se/g-601101118338671.html — 10,93 USD · ★4,9 (98 %) · 71–72 recensioner · 6 bilder · video 61 s. Live på SE-sajten ("utomhusly för katter …"). Reserv: 601102077704284 (12 USD, ★4,7, 99+ rec, material oläst) |
| **Konceptdom** | **PASS.** Objekt (utekatten + trappen/altanen) ✅ · presens (regn och kyla i sep–okt, fotograferbart i dag) ✅ · hylla ✅ · variant ✅ (med villkor) · hook ✅ · publik ✅ (med villkor) |
| **Listningsdom** | **PASS.** Enda listningen i hela jakten där material och pris är sedda och godkända. Ingen av 14 alternativ slår den |
| **Materialdom** | **PASS (sedd).** Hero: riktig orange katt sover i kojan, utomhus på plank i höstlöv, textfri — exakt fingeravtryckets hero. Video 61 s: studiodemo (hopfällning, vatten pärlar av, torkas) = bevisklipp i mitten, aldrig öppning. Bevis: `docs/temu-jakt-v2/jakt/material/bevis/601101118338671_*.jpg` |
| **Ekonomidom** | **PASS** (us-proxy). Landad 114–134 kr. Vid **599 kr**: 4,48–5,25× · BE-CPA 465–485 kr · BE-ROAS 1,24–1,29 — bäst i hela `products.json`. 499 och 699 klarar också |
| **Svensk hylla** | **PASS (verifierad).** Kedjorna har bara inomhusbäddar. Ankare: Supercat 4 season 1 799, Kerbl 1 017, VEVOR 1 048, QLS 1 162, Northix 1 919. Look-alikes finns: Shein 424, Fyndiq 395/504, PriceRunner 157. Ad Library SE: 3 aktiva annonsörer, alla startade 18–29 aug |
| **Vinnar-DNA-match** | **79 / 100** |
| **Konfidens** | HIGH på material, ekonomi och hylla · MEDIUM på publiken |
| **Största risk** | Look-alike-priset 157–504 kr + tre konkurrenter igång sedan två veckor — strandtofflornas felläge. Publikbasen är mindre än vanligt (~538 000 utekatter mot 1,92 M småhus): räcker för 1 000 kr/dag, taket kommer tidigare vid skalning |
| **Exakt nästa åtgärd** | (1) `/ny-produkt utekattkoja 1000` — test-ABO enligt regel 11, **599 kr**, **EN SKU: största storleken, svart** (parametern är inte ägarkänd; en för stor koja fungerar, en för liten är oanvändbar). (2) Creativen öppnar på heron (katten i kojan) och sätter trähusankaret 1 017–1 799 kr **i bild**, inte bara i kalkylen. (3) Copyn skrivs till ägaren vid huset — trappan, altanen, höstregnet — aldrig till "kattmänniskor" (w7:s dyraste lärdom: `PD_1` "alla föräldrar" gav ROAS 0,56). (4) Mått i cm på produktsidan, aldrig storlekstabell. (5) Beställ provexemplar av den största storleken och kontrollera isoleringen innan skalning |

---

## 2. TEST IF MATERIAL VERIFIED

### 2. Taköverdrag / skyddsöverdrag till husvagn och husbil, 5–12 m

| Fält | |
|---|---|
| **Produkt** | Formsytt taköverdrag i oxford för husvagn/husbil, UV- och regnskydd, spänns fast; längd anges i **meter** |
| **Bästa Temu-länk** | https://www.temu.com/se/g-601101311828193.html — 25 USD · ★4,5 (90 %) · 46 rec (Seznam-utdrag). Alternativ (helöverdrag): 601102273698057 — 28 USD · ★4,6 (92 %) · 99+ rec |
| **Konceptdom** | **PASS.** Motorhöljets struktur punkt för punkt: dyrt fordon som står ute, uppställning pågår nu, improviserad old way (presenning som blåser av), ingen kedja i formen, fackhandelsankare långt över |
| **Listningsdom** | **PENDING_VERIFICATION.** Pris ur utdrag, SKU-lista oläst |
| **Materialdom** | **PENDING** (`BLOCKED_SOURCE`). Krav vid granskning: överdraget dras över taket på en riktig vagn, utomhus, inom 3 s; textfri hero på fordonet |
| **Ekonomidom** | **PASS** (us-proxy). Landad 261–306 kr → vid **799 kr** 2,61–3,06× · BE-CPA 493–538 kr (helöverdraget: 899 kr, 2,62–3,08×) |
| **Svensk hylla** | **PASS via ankare — verifierat.** Ingen kedja säljer tak-only-formen (Jula har helöverdrag Hamron/Kayoba). Fackhandel: Campmaster takskydd från 1 495 kr (= 1,87×), EuroTrail 1 599–2 395, Brunner 2 999, Hindermann 1 145–2 195 |
| **Vinnar-DNA-match** | **72 / 100** |
| **Konfidens** | **LOW** — material och variantlista osedda, priset är proxy |
| **Största risk** | 25 USD är misstänkt lite för ett 5–12 m tak: produkten kan vara tunnare och mindre än titeln lovar. Näst: att Biltema/Jula visar sig ha ett husvagnsöverdrag under 700 kr (mönstret som fällde 19 av 34 i husvagnsklustret) |
| **Exakt nästa åtgärd** | (1) När Temu svarar: hämta 601101311828193 och 601102273698057 (`jakt/hamta-langsam.py --burst 7 --paus 45` i en aktiv tur), dra frames 0–3,5 s, öppna heron, döm enligt `jakt/material/instruktion.md`. (2) Beställ provexemplar i vagnens längd och mät tygvikt/mått mot titeln. (3) Fyra kedjesökningar "husvagnsöverdrag"/"taköverdrag husvagn" mot Biltema/Jula/Clas/Rusta i butik. Först då: `/ny-produkt` vid 799 kr med hooken "Står husvagnen ute i vinter?" |

### 3. Staketstolps-reparationsbygel med markspett

| Fält | |
|---|---|
| **Produkt** | Stålbygel + 80 cm markspett som lagar en rutten eller lutande trästolpe utan att staketet demonteras; 2-set / 4-set |
| **Bästa Temu-länk** | https://www.temu.com/se/g-601103866118857.html — 16 USD · ★4,8 (96 %) · 89 rec (Seznam-utdrag) |
| **Konceptdom** | **PASS.** Ägd sak ute ✅ · skadan har redan inträffat (stolpen ruttnad i marklinjen, höststormen lägger sektionen på sned) ✅ · old way = improvisation (bräda och spik, eller gjuta ny) ✅ · payoff syns i en stillbild ✅ · äkta flerköp (flera stolpar) ✅ |
| **Listningsdom** | **PENDING_VERIFICATION** |
| **Materialdom** | **PENDING** (`BLOCKED_SOURCE`). Krav: spettet slås ned bredvid stolpen och staketet rätas inom 3 s |
| **Ekonomidom** | **PASS** (us-proxy). Landad 167–196 kr → vid **499 kr** (2-set) 2,55–2,99× · BE-CPA 303–332 kr; 4-set 799 kr |
| **Svensk hylla** | **PENDING_VERIFICATION med stark PASS-indikation.** Bauhaus stolptillbehör: 232 produkter, noll reparationsbyglar (kedjorna säljer stolpskor/stolpspjut för *nya* stolpar). Ad Library SE "staketstolpe": 2 annonsörer, 0 i reparationsformen. Kvar: Biltema i butik |
| **Vinnar-DNA-match** | **78 / 100** |
| **Konfidens** | MEDIUM |
| **Största risk** | Hyllan: har Biltema/Bauhaus samma bygel för 149 kr faller konceptet, formen är billig att kopiera. Näst: montering — slägga och 20–30 minuters kroppsarbete ("montering/inlärning" hos 30 % av förlorarna; PTZ-kameran klarade det för att payoffen syns direkt) |
| **Exakt nästa åtgärd** | (1) Kolla Biltema i butik/app på "stolpsko", "stolpspjut", "staketstolpe reparation". (2) När Temu svarar: hämta listningen och döm materialet. (3) Beställ 2-set som prov och laga en stolpe på riktigt — filma det: om leverantörsvideon saknas är den egna 20-minutersfilmen annonsen. Sedan `/ny-produkt` vid 499/799 kr, hook "Lutar staketstolpen efter höststormen?" |

### 4. Tändvedsklyv i gjutjärn (Kindling Cracker-typ, ring + kil)

| Fält | |
|---|---|
| **Produkt** | Gjutjärns-/stålring med kil; veden ställs i, slås med klubba — fingrarna aldrig nära eggen. Köp **3–5 kg-versionen**, aldrig 8 kg |
| **Bästa Temu-länk** | Prissatt referens: https://www.temu.com/se/g-601099583674464.html — 16,25 USD · ★4,9 · 28 rec · 1 bild (packshot, bultad ram). Strukturellt bäst: 601099561039096 (9 lbs, ett stycke, halv-ring — pris olöst). Prioritera för material: 601099702553211 (handskar ingår → hand i bild), 601099595396016 (GoPlus) |
| **Konceptdom** | **PASS.** Ägd sak (ved + klubba + huggkubb) ✅ · daglig friktion från oktober ✅ · kroppslig risk (fingrar) ✅ · improviserad old way (yxa, bildäck på kubben) ✅ · ~1,1 M vedeldade eldstäder i bruk ✅ |
| **Listningsdom** | **ALTERNATIVE_LISTING_REQUIRED.** Den enda sedda listningen har bara en packshot (och en bultad ram = montering); 24 andra listningar är kartlagda men `BLOCKED_SOURCE` |
| **Materialdom** | **PENDING** — FAIL på det enda som setts (packshot på vitt, ingen ved/klubba/hand). Krav: slaget och den kluvna stickan inom 3 s |
| **Ekonomidom** | **PASS** (us-proxy). Landad 170–199 kr → vid **599 kr** 3,0–3,5× · BE-CPA 400+. Fraktkänslighet: +50 kr spräcker 499 men inte 599; +100 kr spräcker 599. Därför 599, inte 499 |
| **Svensk hylla** | **PASS via ankare, med förbehåll.** Kindling Cracker 1 249 kr (9+ butiker, = 2,08× vid 599), King 1 799, Jula/Clas egna gjutjärnsklyvar 999. Sub-500-kopiorna Aduro 295 / Northix 419 är **ej i lager**. Kvar som verkligt hot: **setrimmer.se 288 / 365 kr i lager** (samma form). 0 aktiva svenska annonsörer på ringformen |
| **Vinnar-DNA-match** | **72 / 100** |
| **Konfidens** | MEDIUM på ekonomi · LOW på material |
| **Största risk** | Prispositionen mot setrimmer 288 kr — samma mönster som fällde klyvkonen (CDON 279). Trippeln "old way funkar ∧ jämförelsehandlad ∧ < 300" slår inte till vid 599, och setrimmers bundling 729 kr visar att svenskar betalar > 700 kr när det paketeras rätt. Spela alltid mot ankaret 1 249, aldrig mot 288 |
| **Exakt nästa åtgärd** | (1) När Temu svarar: hämta 601099702553211, 601099595396016, 601099561039096; döm materialet (slaget inom 3 s?). (2) Beställ 3–5 kg-versionen som prov, väg den, räkna frakten på riktigt. (3) Sedan `/ny-produkt` vid 599 kr med Kindling Cracker-ankaret i creativen, hook "Klyver du tändved med yxa?" |

---

## 3. WATCH

Koncept som håller strukturellt men saknar en användbar listning, ett verifierat pris
eller ligger under publikgolvet. Fält som kräver Temus produktsida står som PENDING.

| # | Produkt | Bästa Temu-länk | Koncept | Listning | Material | Ekonomi | Svensk hylla | DNA | Konf. | Största risk | Exakt nästa åtgärd |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 5 | Vinterhuv till hönsgården | https://www.temu.com/se/g-601103333430208.html · 27 USD · 99+ rec | PASS på gate 1–3, **publik under golvet** (351 167 hobbyhöns → 35–70 000 hushåll) | PENDING | PENDING | PASS (799 kr: 2,42–2,83×, BE-CPA 469) | PASS (PriceRunner 15 träffar, alla hela gårdar 2 377–15 558) | **82** | MEDIUM/LOW | Formen kan i praktiken vara "en presenning"; gårdens mått i fot | Bevaka. Testas bara om publiken kan bevisas > 100 000 eller som andra produkt mot samma köpare |
| 6 | Överdrag till hydraulisk vedklyv | https://www.temu.com/g-601099603802865.html (+601099589782206) | PASS (motorhöljets struktur, ton = ägarkänd) | ALTERNATIVE_LISTING_REQUIRED | PENDING | **FAIL på lästa priset** (SE-Temu 437–494 kr → landad 655–741) | PASS (ingen kedja, ingen marketplace) | 76 | MEDIUM | Ägare som rullar in klyven i garaget | Sök överdrag till liten el-klyv 5–7 ton (< 200 kr på Temu); först då material |
| 7 | Solpanel till åtelkameran | https://www.temu.com/se/g-601099525192346.html (pris oläst); syster 601099637786914 = 41 USD | PASS (2–5 kameror à 1 000–5 000 kr, säsong nu) | ALTERNATIVE_LISTING_REQUIRED | PENDING | FAIL på 41 USD (landad 428–502 > 420-stopp); **PASS om 18–25 USD** | PASS via ankare (Hunter 1 299 på jakt.se; Biltema saknar formen) | 71 | MEDIUM/LOW | Hela fackhandeln säljer formen | Läs priset på primären när Temu svarar; under 25 USD → material → test vid 599–799 |
| 8 | Stödhjul till grinden | https://www.temu.com/se/g-601102369829095.html · 18 USD · ★4,9 (98 %) | PASS objekt/hylla, **presens svag** (kronisk friktion, inte säsong) | PENDING | PENDING | PASS (549 kr: 2,49–2,92×, BE-CPA 329) | PASS verifierad (Biltema har fjäder/transporthjul, inte grindhjul) | 74 | LOW | Kronisk friktion = gräsklippartäckets/kranskyddets fälla | Bevaka; test bara som "andra produkt" till staketstolpsbygelns publik |
| 9 | Fruktplockare på teleskopstång | https://www.temu.com/se/g-601101790468176.html · 16 USD · ★4,9 | PASS (äppelskörd nu, stegen = rädsla) | PENDING | PENDING | PASS (499 kr: 2,55–2,99×) | PENDING (fackhandel säljer korghuvudet; hel stång ej sedd i kedja) | 66 | MEDIUM | Säsongen slut i mitten av oktober; 20 min/år → lågt upplevt värde | **Backlog augusti 2027.** Inte nu |
| 10 | Frontskydd till husvagn | ingen listning funnen (11 sökfraser) | PASS | — | — | — | PASS (Hindermann 1 145 / Supra 2 195 / Svenska Tält 1 295; ingen kedja) | — | — | Listningen saknas | Sök på Temu när sajten svarar: "caravan front cover", "towing cover" |
| 11 | Regn-/vinterhuv till hundgården | https://www.temu.com/se/g-601099679566501.html (pris oläst; syster 49 USD = FAIL) | PASS (samma form som hönsgårdshuven, kontots kärnpublik) | ALTERNATIVE_LISTING_REQUIRED | PENDING | FAIL på syster, PENDING på primär | PASS (PriceRunner 20 träffar, alla hela hundgårdar 590–11 769) | 70 | LOW | Prissatta listningar för dyra; gårdens mått | Läs primärens pris; under 25 USD → material |
| 12 | Stocklyft / vändhake med stödben | https://www.temu.com/g-601099592756087.html | PASS (kroppslig friktion nu, ny kategori) | PENDING | PENDING | UNKNOWN (4–6 kg stål, 130 cm — frakten) | PENDING (Jula har brytjärn; ingen kedja har timberjack) | 64 | LOW | Frakt + smal ägarklass + "5-i-1"-språk | Pris först; över 25 USD → REJECT |
| 13 | Solcellsventilation till vinterförvarad båt | https://www.temu.com/se/g-601099699520443.html | PASS på objekt/hylla, **presens: payoff i februari–april** (kranskyddsfällan) | PENDING | PENDING | UNKNOWN | PASS via ankare (Seatec 1 249, Marinco 2 792–3 550; Biltema saknar kategorin) | 55 | LOW | Fördröjd payoff; den marina formen saknas i alla fyra listningar | Bevaka. Kräver rund däcksventilator-form och pris < 20 USD |
| 14 | Låsbar utomhus-eldosa för sladdskarven | https://www.temu.com/se/g-601102831921599.html · 24 USD · ★4,4 (79 rec) | PASS men **latent behov** (ägaren har redan löst det med en plastpåse) | PENDING | PENDING | PASS (749 kr: 2,55–2,99×, BE-CPA 455) | PENDING (stora låsbara lådan obekräftad i kedja) | 54 | LOW | Latent behov = 55 % av förlorarna | Bevaka. Inte nu |
| 15 | Jaktparaply, spänns runt stam | https://www.temu.com/se/g-601103949421856.html | PASS | BLOCKED_SOURCE | PENDING | PENDING | PASS verifierad (Ameristep 479 enda svenska) | 68 | LOW | Stor/dyr frakt; många svenska torn har tak | Pris först när Temu svarar |
| 16 | Tornsits med spännrem, camo | https://www.temu.com/se/g-601099667428425.html (+3 dubbletter) | PASS | BLOCKED_SOURCE | PENDING | PENDING | PASS verifierad (Carinthia 559) | 60 | LOW | Ser den ut som ett 49-kronors sittunderlag vinner kedjan | Pris + hero när Temu svarar |
| 17 | Sopkärlslocklås med rem | https://www.temu.com/se/g-601101587576926.html (+2) | PASS (objektet bevisat av klistermärkena) | BLOCKED_SOURCE | PENDING | PENDING (troligen < 100 kr på Temu → 300-kronorsgränsen) | PASS verifierad (Smartaskydd 459) | 62 | LOW | Låses upp varje hämtdag; fyrfackskärl blåser sällan | Pris först; kräver flerköp (2-pack) för att nå 300 kr |
| 18 | Hängrännesats till lövblås | https://www.temu.com/se/g-601103248788835.html (+1) | PASS | BLOCKED_SOURCE | PENDING | PENDING | PASS verifierad (Stihl 745; Husqvarna 359–399 lågt sekundärankare) | 68 | LOW | Adapterpassform mot svenska batteriblåsar → returer | Läs variantlistan (munstycksmått) när Temu svarar |
| 19 | Väggstöd till stege | https://www.temu.com/se/g-601099637369908.html (+8) | PASS men negativ rymd (stegen förvaras inomhus, U-bultsmontering) | BLOCKED_SOURCE | PENDING | PENDING | PASS verifierad (Wibe 779–974, Bauhaus 1 195) | 62 | LOW | Biltemas stegtillbehör (403) kan gömma ett 300-kronorsstöd; 1 m stålfrakt | Biltema i butik först |
| 20 | Hårdbottnat baksätesskydd för hund | https://www.temu.com/se/g-601099578348331.html (+5) | PASS | BLOCKED_SOURCE | PENDING | PENDING | PASS verifierad (Kleinmetall Bridge 1 059; kedjorna har bara hängmattor) | 62 | LOW | "Universal" utan mått; skrymmande; jämförelsehandlad | Pris + mått när Temu svarar |
| 21 | Övriga V2.1-B med hylla PASS: poolvärmepumpsskydd 601103300703848 · hjulpiggar robotgräsklippare 601100183382557 · gevärshållare ATV 601099522267692 (ekonomi PASS på AUD-pris, publik < 100 000?) · husbil termoskydd 601102148404312 · styrstolpar båttrailer 601102184182476 · spatrappa 601099596495697 · kupolnät damm 601099601980879 · isolerad tyghundkoja 601105490445990 · spa-räcke 601099575291512 (ekonomi FAIL på 79,99 USD, 4 alternativ olästa) | se `koncept.json` | PASS/PENDING | BLOCKED_SOURCE | PENDING | PENDING | PASS verifierad (h1–h5) | 55–64 | LOW | per rad i `koncept.json` → `status_reason` | Hämtas i prioritetsordning när Temu svarar; ingen är testklar utan material |

---

## 4. REJECT — lärorika avslag

370+ koncept är fällda med orsak i `docs/temu-jakt-v2/jakt/koncept.json`
(`concept_status`, `status_reason`, `failure_is_structural`) och i V2.2:s klusterfiler.
Här bara de som lär oss något om filtret.

| Produkt | Temu | DNA före | Varför REJECT |
|---|---|---|---|
| Lockskydd till spabad | 601099619866532 (+601099816288753) | 78 → 52 | **Marketplace-golvet:** Fyndiq säljer identisk oxford cover cap 218×218×30 för 343–389 kr, Hemson 499, Amazon.se 634. Ekonomin var grön och en alternativ listning hade användbar hero — spelar ingen roll när det identiska billiga alternativet ligger under vårt pris. `failure_is_structural` |
| Vedställsöverdrag (cover only) | 601099615828436 (+7 alt) | 78 → 60 | Fyra priser 24,22–34,47 USD → 2,4× kräver 607–711 kr; **vidaXL 293 kr i lager** i exakt samma form — under 300-kronorsgolvet. Inget pris klarar 2,4×, 300 kr och hyllan samtidigt |
| Kikarsele / bröstväska | 601099566089885 (+5 alt) | 78 → FAIL | Fem listningar av formen 26,59–68,59 USD → landad ≥ 280, 2,4× ≥ 670 kr, mer än ankaret Blaser 999 bär. Alternativvideon sämre (sommar, compoundbåge, talking head). Felet sitter i formen |
| Manuell mossräfsa | 601103047271003 | 71 | Ekonomi grön, bredaste publiken (~2 M gräsmattor) — men **Jula Hard Head gräsmatteluftare 199 kr i 75 varuhus**, "tar bort mossa". Klyvkonsmönstret |
| Bildörrsteg till biltaket | garage-fordon | 64 | Taktältarna 289, SmartaSaker 375 säljer exakt samma steg — ankaret ligger *under* vårt pris |
| Hängrännerensare till högtryckstvätt | maskiner | 42 | Identisk 90-tumslans 270,50 kr på PriceRunner; Stihl 345, Kärcher 309 |
| Överdrag till åkgräsklipparen | maskiner | — | Bäst ekonomi i jakten (8,41 USD, 742 rec) och ändå dubbelt död: klipparen står i garaget (kontots gräsklippartäcke föll på exakt det) och hyllan har en prisstege 199 → 990 |
| Spa-räcke (som TEST-kandidat) | 601099575291512 | 72 | 79,99 USD → landad 836–980 → 2,4× kräver > 2 000 kr. Står som WATCH #21 bara för att fyra alternativ är olästa |
| Fågelskydd för solceller | hus | — | Starkaste hus-konceptet, fällt av Amazon.se i samma form |
| Skyddstak till luftvärmepumpens utedel | hus | — | Hela specialisthandeln säljer formen |
| Klyvkon till borrmaskin | 601099512512218 (+2) | 62 | CDON/Elgiganten 279 kr i samma form, *under* vårt 399; vridmoment/säkerhet i recensionerna |
| Transom saver-kil | 601100312972322 (+1) | 55 | Latent behov — hydraulikskadan syns om år (55 % av förlorarna) |
| Automatisk hönslucka | 601103331613427 (+2) | 50 | Montering + ström, förklaring, Kerbl i fackhandeln — tre flaggor |
| Hinkfälla möss | 601100216234049 | 68 | Djur-klustrets starkaste presens; Clas Ohlson 59,90 vippbräda-för-hink |
| Torkrock hund | 601105260939830 (+3) | 48 | Rusta 39,90 samma form + personlig passform |
| Kranskydd 2-pack | 601099530394801 | 55 | Redan testad (7 416 kr / 28 köp / ROAS 1,59 mot BE 1,49). Ett omtest i oktober är en annan fråga |
| Hydraulisk locklyft spabad | 601101853422243 | 62 | > 1 000 kr + skruvmontering |
| USB-värmedyna | 601099898313877 (+1) | 52 | Commodity 155 kr på PriceRunner |
| Kajaköverdrag | 601099616420647 | 60 | Lixada 380–436 i samma form; sjätte överdraget |
| Motorsågens benskydd (PPE) | maskiner | — | Perfekt fingeravtryck och 2 495-ankare — men EN ISO 11393: osäljbart utan certifiering |

---

## 5. Vad de två passen lärde (samlat)

1. **Marketplace-golvet är den verkliga hyllan.** Fyndiq 343, vidaXL 293, setrimmer 288,
   Taktältarna 289, PriceRunner 270 — fyra av sju fällda högpoängare kom från sajter som inte
   stod i gate 3:s lista. Sök alltid det *billigaste* svenska priset först; ankaret hittas
   efter golvet, aldrig i stället för det.
2. **Ett tal som fäller får aldrig stå i en kommentar.** `h4.json` hade Fyndiq-nivån i
   fritext efter ordet "dock" — domen blev PASS. Det är det enskilt dyraste felet i V2.1.
3. **Koncept ≠ listning.** Lockskyddets badkar-hero och klyvens packshot var listningsfel;
   kikarselens pris var ett formfel. Utan V2.1-modellen hade lockskyddet fällts på fel grund
   och kikarselen överlevt på fel grund.
4. **Huset är bygghandelns hemmaplan** (10 av 13 hus-koncept föll, noll verifierade PASS;
   garage/fordon 0 av 30; maskiner 0 av 23). Kontots vinnare är tillbehör till **maskiner,
   fordon och kärl som står stilla utomhus** — det är den yta som fortfarande bär.
5. **Tummen är variantfällan.** Den enda husvagnslistning som passerade gate 7 var den som
   anger meter. Svenska ägare tänker i meter, cm, hk, ton, liter — aldrig i tum eller fot.
6. **Temu-popularitet diskriminerar inte.** 2 309 recensioner (kedjeslipen) är en bevisad
   förlorare; 742 recensioner (åkgräsklipparöverdraget) är dubbelt död.
7. **Temu ger ~8 anrop per timme och blockerar sedan i ~60–80 min**, per väg (`/se`, USA).
   Bakgrundsprocesser dör när sessionens container somnar. Hämtning måste ske i korta skurar
   i aktiva turer, cachat, prioriterat — aldrig parallellt (`jakt/hamta-langsam.py --burst`).
8. **Ett fynd utanför uppdraget:** kontots eget sätesöverdrag till åkgräsklipparen ligger på
   PriceRunner för **485 kr mot vårt 649** — en `/cs satesoverdragaren`-fråga, inte en jaktfråga.

---

## 6. Underlag

| Vad | Var |
|---|---|
| Vinnar-DNA:t (metoden) | `docs/temu-vinnar-dna.md` |
| Pipeline V2.1 (gate-ordning, entiteter, statusar, hämtdisciplin) | `docs/temu-jakt-v2/jakt/PIPELINE-V2.1.md` |
| V2/V2.1-rapporten (13 kluster, trattar, tier-listor) | `docs/temu-jakt-v2.md` |
| Dataset per listning (519 rader, V2.1-fält) | `docs/temu-jakt-v2/jakt/dataset.json`, `dataset.csv` |
| Koncepttabell (386 koncept, status + orsak) | `docs/temu-jakt-v2/jakt/koncept.json` |
| Hyllverifiering | `docs/temu-jakt-v2/jakt/hylla/h1–h5.json` |
| Materialdomar + bevisbilder | `docs/temu-jakt-v2/jakt/material/` |
| V2.2 slutrapport, fas 1, fas 2, datavägar | `docs/temu-jakt-v2/jakt/v22/` |
| Kända goods-id (dubblettkontroll, 518 + 523) | `docs/temu-jakt-v2/jakt/v22/kanda-goods-id.txt`, `dataset.json` |
| Läsvänlig version | https://claude.ai/code/artifact/37593123-a46e-4d7d-b2c7-c6cf5fa44610 |

Saknat värde = PENDING/UNKNOWN, aldrig gissat. Alla siffror står i en av filerna ovan.
