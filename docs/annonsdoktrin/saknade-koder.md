# Vokabulär — saknade koder, slutgiltig lista

Ersätter avsnittet "Vokabulärer (fältvärden)" i `docs/naming-convention.md`.

## Domen först

Ingenting har raderats. `docs/naming-convention.md` har **en enda commit** i historiken och har aldrig ändrats. Koderna saknas alltså inte för att de försvunnit — de har **aldrig lagts in**, trots att regel 4 kräver att listan uppdateras *först*. Sedan dess har fyra dokumentvågor (`winning-lines.md`, `bof-concepts.md`, `pipeline/`, hela `docs/annonsdoktrin/` + `ugc-creators.md`) hunnit använda ett åttiotal koder som inte står i listan.

Två fakta styr allt nedan:

1. **Ingen parser finns.** `grep` på `split('_')` / `parseAdName` / `ad_name` ger noll träffar; `pnl-app/app/lib/meta.server.ts:39-43` hämtar på `level=account`. Ingen kod läser någonsin ett annonsnamn. Därför upptäcks en saknad kod aldrig som ett fel — den syns bara som data ingen kan gruppera. Varje fält du lägger till **nu** är gratis och dyrt om ett halvår.
2. **Ingen annons är live.** Regel 3 ("döp aldrig om en annons som fått data") blockerar ingenting. Alla felkodade namn i repot kan rättas till noll kostnad. Det tar bort argumentet "vi måste införa `problem` eftersom den redan används".

Sammanlagt föreslogs ~100 koder i förarbetet. **11 går in i annonsnamnet**, plus 1 modifierare, 1 valfritt fält och 2 kampanjbehållare. Resten är dubbletter, fältförväxlingar, trackerkolumner eller behov som inte finns.

---

## 1. AKUT — kod används skarpt utan att vara definierad

Det här är buggar i datan här och nu, inte önskemål.

| Kod | Var | Svensk betydelse | Vad som går sönder utan den |
|---|---|---|---|
| `GRILL` | `pipeline/waves/wave-01.mjs:9,20,31,42,54,65`, `docs/ad-tracker.md:26-33`, `README.md:35`, `bof-concepts.md`, `winning-lines.md:83-87` | Grillkliniken (grillkliniken.se) | **Samtliga 14 annonsnamn i repot** använder en brandkod som inte står i BRAND-listan. Det är regel 4 bruten i kod. Det enda ostridiga regelbrottet i hela materialet |
| `problem` (som ANGLE) | `wave-01.mjs:65` — `GRILL_mastern_problem_beforeafter_serentut_v1` | Avslöjandevinkel: "ditt galler ser rent ut, det är det inte" | Odefinierad angle i ett skarpt namn. **Ska INTE införas — annonsen ska döpas om till `pain`.** Se rättning R1 |
| `trust` (kodad fel) | `wave-01.mjs:54`, `winning-lines.md:87` — `GRILL_mastern_social_product_trust_v1` | Trygghet/riskreversering mot säljaren | Vinkeln är kodad som `social` + hook `trust`. Kontots högsta ROAS i skala (2,47, `playbook.md:34`) ligger alltså gömd i det enda fält som inte går att gruppera. Ny kod krävs — se ANGLE |
| `swipe`, `clearskin`, `texttung` | `pipeline/swipe.mjs:49`, `swipe2.mjs:44` | Filnamnen `swipe_clearskin_GRILL_mastern_v1.png` och `swipe_texttung_GRILL_mastern_v1.png` | **Två färdiga PNG-filer följer inte konventionen alls.** Genom den utlovade parsern blir `angle=GRILL`, `format=mastern`, `hook=v1`. `texttung` är dessutom ordagrann svensk översättning av `textheavy` som redan finns. **Inga nya koder — filerna döps om.** Se R3 |
| `ENGINE`, `RETARGET` | `granskning-meta-mekanik.md:52,72` — `BAV_SALES_ENGINE`, `BAV_SALES_RETARGET` | Evergreen-behållaren resp. retargetingbehållaren | Står **i datumets position** i kampanjnamnet. Startdatumet trängs undan. Kräver ett fjärde kampanjfält — se avsnitt 3 |
| `bav-` / `bever-` / `bav` / `BAV` | fyra filer, fyra stavningar | Bäverbutiken | Bäverbutiken har **ingen brandkod alls** i listan, och fyra konkurrerande stavningar i doktrinen. Fem butiker med samma sortiment producerar identiska annonsnamn tills detta avgörs. Se konfliktdom K1 |
| `💡` | `ad-tracker.md:22,26-33` | Idé, ej byggd — väntar på go | Används **sju gånger** utan att stå i legenden på rad 7. Ren utelämning |
| `🔴 pensionerad` | `ad-tracker.md:27`, `bof-concepts.md:44` | Vinkeln är mättad/förbrukad, får inte köras igen | Används i trackern, saknas i conviction-legenden på `bof-concepts.md:58` |

---

## 2. BRAND — 6 nya koder

Nivå: kampanj **och** annons. Versaler.

| Kod | Svensk betydelse | Varför den saknas / vad som går sönder | Typ |
|---|---|---|---|
| `GRILL` | Grillkliniken, grillkliniken.se. Ad account SnarkLös (SEK) | Används i 14 skarpa namn utan att stå i listan | **AKUT** |
| `BAV-SE` | Bäverbutiken Sverige — intäkt i SEK | Utan marknadskod i namnet får fem butiker med samma sortiment **identiska annonsnamn**. All per-marknadsanalys omöjlig | NYTT BEHOV |
| `BAV-NO` | Bäverbutiken Norge — intäkt i NOK | Samma. Dessutom: spend i SEK, intäkt i NOK — utan koden kan ROAS aldrig läsas rätt | NYTT BEHOV |
| `BAV-FI` | Bäverbutiken Finland — intäkt i EUR | Samma | NYTT BEHOV |
| `BAV-DK` | Bäverbutiken Danmark — intäkt i DKK | Samma | NYTT BEHOV |
| `BAV-UK` | Bäverbutiken Storbritannien — intäkt i GBP | Samma | NYTT BEHOV |

**Följdregel som måste skrivas in:** regel 1 ("bara små bokstäver") motsägs av vokabulären själv — `MAGI`, `SNARK`, `MATSTRUMP`, `GRILL` är versaler. Regel 1 skrivs om till: **BRAND är versaler, alla övriga fält gemener.**

**Ej infört, medvetet:** `bav-nordic` / `pool-marknad` för den pooade flermarknadskampanjen. En pooad nordisk kampanj körs från en butik och bokförs mot ett dataset; behållaren (`ENGINE`) beskriver poolningen. Om ni faktiskt bygger en kampanj som spänner över butiker: det är ett nytt beslut, inte en kod.

---

## 3. Kampanjnivå — nytt fjärde fält

Nytt mönster: `{BRAND}_{OBJECTIVE}_{YYYYMMDD}_{CONTAINER}`

Fältet läggs **sist** så gamla kampanjnamn inte bryts. Inga kampanjnamn finns skarpt, så det kostar noll.

| Kod | Svensk betydelse | Vad som går sönder utan den | Typ |
|---|---|---|---|
| `ENGINE` | Den pooade evergreen-behållaren: Advantage+-säljkampanj med hela chill-sortimentet i ett adset. Poolar konverteringar så kontot lämnar learning | Skrivs idag i datumfältet. Utan eget fält går kampanjstartdatum förlorat, och `BAV-SE_SALES_20260901` går inte att skilja från motorn | **AKUT** |
| `RETARGET` | Snäv retargetingbehållare med köparexkludering | Samma. **Villkorad** — `granskning-meta-mekanik.md:70` rekommenderar att den slås ihop med ENGINE. Inför den bara om ni faktiskt kör två behållare | NYTT BEHOV |

**OBJECTIVE får inga nya koder.** `SALES` är den enda som används, och Advantage+-växeln (som `granskning-meta-mekanik.md:58` kallar materialets starkaste strukturidé) bärs av `CONTAINER`, inte av en `SALES-ADV`-kod. Att splittra OBJECTIVE hade gett två koder för samma sak.

---

## 4. PRODUCT — 1 kod och en regel som helt saknas

`naming-convention.md:36` har fältet i mönstret men avsnittet "Vokabulärer" **hoppar över det helt.** Med 119 produkter × 5 marknader driftar slugarna garanterat.

Lösningen är **inte** en lista på 119 värden — en kontrollerad vokabulär med 119 poster är ett register, inte en vokabulär. Det som saknas är en regel:

> **Produktslug = Shopify-handle, gemener, å/ä → a, ö → o, inga `_`, och den översätts ALDRIG mellan marknader.**

Sista ledet är det som gör master-ID överflödigt: samma klipp i fem butiker ger fem namn som är identiska utom BRAND. Nyckeln "samma creative" blir "allt efter första fältet" — härledbar gratis.

| Kod | Svensk betydelse | Vad som går sönder utan den | Typ |
|---|---|---|---|
| `sortiment` | Annonsen gäller inget enskilt artikelnummer — katalog/DPA eller pooad marknadskampanj | En pooad NO/FI/DK/UK-kampanj (enligt `granskning-meta-mekanik.md:24` den **enda körbara** utlandsstrukturen) går bokstavligen inte att döpa idag | NYTT BEHOV |
| `{slug}-2p`, `-3p`, `-kit` | Multipack- eller paketvariant som egen produktslug | Appen räknar BE-ROAS på **variantnivå** (`schema.prisma:97,104-106`: frakt per enhet sjunker vid flerpack). Ett 2-pack och en enstyck får idag identiska namn och deras data slås ihop — vilket är exakt den jämförelse som avgör om bundlestrategin fungerar | NYTT BEHOV |

---

## 5. ANGLE — 1 ny kod, och en befintlig ska smalnas av

| Kod | Svensk betydelse | Vad som går sönder utan den | Typ |
|---|---|---|---|
| `trust` | Riskreversering mot **säljaren**, inte produkten: garanti, öppet köp, anti-scam, "du får exakt vad du ser, vi skickar direkt" | Invändningen den bemöter (*"är det här en dropship-bluff, kommer varan fram, är den skräp"*) är varken expertis (`authority`) eller social proof (`social`). Vinkeln är kontots högsta ROAS i skala (2,47) och tvingas idag ner i det fria HOOK-fältet, där den aldrig kan grupperas | **AKUT** (felkodad i två filer) |

**Priset som måste betalas samtidigt:** `authority` definieras idag som *"Expert, testvinnare, **garanti**"*. **Garantin flyttar till `trust`.** Utan den avsmalningen har du två koder för samma sak och vokabulären har blivit sämre, inte bättre. En ny kod ska alltid ta något från en granne.

**`problem` införs INTE.** Enda användningen är `wave-01.mjs:65`, en 💡-annons som aldrig körts. `pain` täcker den. Döp om annonsen (R1) — då är `problem` borta ur repot helt, och hooktypen `problem` (som avslås nedan) kan aldrig kollidera med den.

---

## 6. FORMAT — 3 nya koder + 1 modifierare

| Kod | Svensk betydelse | Vad som går sönder utan den | Typ |
|---|---|---|---|
| `talkinghead` | Person talar till kameran. Ansikte + röst, ingen produktdemo | Vokabulären har **noll rörliga format**. Utan koden går ingen UGC-video att döpa | NYTT BEHOV |
| `demo` | Produkten i användning — händer/bord i bild, **inget ansikte**. Täcker även det doktrinen kallar `tabletop` | Motsvarar arketyp K12 "BORDET" och segment S10, alltså 8+ produkter som ska filmas utan kreatörsansikte | NYTT BEHOV |
| `unboxing` | Paket → produkt. Leverans och förväntan som egen dramaturgi | Egen komposition som inget befintligt format beskriver | NYTT BEHOV |

| Modifierare | Svensk betydelse | Vad som går sönder utan den |
|---|---|---|
| `vid-` | **Prefix inom FORMAT-fältet = rörligt.** `vid-ugc`, `vid-beforeafter`, `vid-comparison`, `vid-product`, `vid-lifestyle`, `vid-collage`, `vid-demo`, `vid-talkinghead`. Strippa `vid-` → kompositionen. Sök `vid-` → allt rörligt | Ersätter tio föreslagna videokoder med tre koder och en regel. Med de tio koderna splittras frågan *"slår före/efter jämförelse?"* på fyra separata koder och blir obesvarbar. Med prefixet är den kvar |

**Följdregel:** all FORMAT-matchning ska vara **exakt**, aldrig `startsWith` — men prefixmodellen har inte det problem som `beforeafter-video` hade (prefixat av `beforeafter`).

---

## 7. HOOK — inga nya koder. Ny definition och en slugkanon.

De åtta föreslagna hooktyperna (`pov`, `claim`, `q`, `demo`, `problem`, `callout`, `neg`, `story`) **avslås samlat**:

1. **Fem av åtta dubblerar ANGLE.** `problem` = `pain`. `callout` = `identity`. `q` och `neg` = `curiosity`. `story` = `authority` (playbooken rankar dem redan som *en* vinkel: "Auktoritet/story"). Att koda samma sak i två kolumner är precis vad en icke-teknisk operatör blandar ihop.
2. **`demo` skulle finnas i två fält samtidigt** (FORMAT och HOOK), och `problem` i tre.
3. **Sampelstorleken finns inte.** Taket är 3 nya annonser/vecka ≈ 150/år, fördelade på 6 butiker × N produkter × 9 vinklar × 11 format. Lägg till 8 hooktyper och varje cell är tom. Kontrollerade värden är värdefulla för att de är **få nog att fylla**.

**Det som faktiskt saknas är två regler:**

| Vad | Svensk betydelse | Vad som går sönder utan den |
|---|---|---|
| Ny definition | HOOK = *"det som fångar under de första 3 sekunderna — replik eller öppningsbild. Kort slug, 1–2 ord."* | Nuvarande definition ("det ögat fastnar på i en **bild**") gäller inte video alls |
| **Slugkanon** | En fast lista tvärgående hookteman som gäller över hela katalogen: `vinterforvaring`, `dodbatteri`, `rost`, `ryggont`, `present`, `saker`, `tid`, `sista-chansen`. Ny slug skrivs in i listan **innan** den används. **Slugen översätts aldrig** | 119 produkter × 5 marknader × 3 hookvarianter = upp mot 1 800 unika slugar med n=1 var. Fältet är då matematiskt garanterat att aldrig nå signifikans — och `playbook.md:39` har rubriken "Vinnande hooks", en ranking driven av just det fält som inte går att gruppera. `winterstorage` på båtkapell och `vinterforvaring` på gräsklippartäcke är samma hook i två stavningar och kan aldrig slås ihop |

---

## 8. Sjunde fält — kreatör (nytt, valfritt)

| Kod | Svensk betydelse | Vad som går sönder utan den | Typ |
|---|---|---|---|
| `_c{NN}` | **Personen framför kameran**, ur registret i `ugc-creators.md:665`. Valfritt fält, **sist**, efter `v{N}`. Utelämnas helt för statics | Utan den kan frågan "vilken kreatör har lägst CPA?" aldrig besvaras — och kreatörstest kontra hooktest går inte att skilja åt maskinellt | NYTT BEHOV |

**Regeln som måste skrivas in samtidigt:** adressera alltid **per index**, aldrig "sista segmentet = version". `v{N}` är inte längre sist. Gamla namn får `null` på index 6.

---

## 9. AUDIENCE, PLACEMENT, OPTIMIZATION — inga nya koder

Detta är den största nedskärningen och den viktigaste. Ad set-nivån får **noll** nya koder.

| Föreslaget | Dom | Motivering |
|---|---|---|
| `test` / `engine` som adsettyp | **Avslås** | Doktrinen binder själv testadsettet till ATC och vinnaradsettet till purchase (`granskning-meta-mekanik.md:41,104`). `broad_advplus_atc` **är** testadsettet; `broad_advplus_purchase` **är** vinnaradsettet. Koden finns redan — skriv ner kopplingen som en regel |
| `b500`/`b1000`/`b2000`/`b4000`/`b0` | **Avslås** | Budget ändras var 14:e dag. Ett namn som kodar budget är osant inom en månad och får inte rättas (regel 3). Fasta kronbelopp är dessutom fel modell: 500 kr/dag är över T2 för ett mobilskal (BE-CPA 43 kr) och under T0 för en jumpstart (665 kr). Budgeten hör hemma i produktradens kolumn `kr/dag` |
| `hv` / `costcap` | **Avslås som namnkod, godkänns som trackerkolumn** | Budstrategin *byts* vid övergången T2 → S1. Samma staleness-problem |
| `pool-marknad` | **Avslås** | En pooad marknadskampanj är bred targeting. `broad` beskriver den korrekt; poolningen är en egenskap hos `ENGINE` |
| `ic` / `retarget-ic` | **Avslås** | Ingen regel i doktrinen använder Initiate Checkout som optimeringshändelse. Vid ~50 ordrar/vecka är en IC-publik några hundra personer |
| ThruPlay / videooptimering | **Avslås** | Grind 1 *mäter* hook rate och hold rate — man behöver inte optimera för videovisningar för att läsa 3s-views. Gör man det köper man skräptrafik som förstör testet. Tydligaste påhittade behovet i förarbetet |
| Nio intressekoder för nio katalogsegment | **Avslås** | `granskning-meta-mekanik.md:78`: med Advantage+ är AUDIENCE en **seed**, inte ett filter. Att bygga ut ett fält som håller på att sluta betyda något är fel riktning |
| `ig` / `fb` / `manuell` / `exkl-an` i PLACEMENT | **Avslås tills vidare** | Alla adsets körs `advplus`. Inför när ni faktiskt kör manuella placeringar — inte innan |

**Två noter som ska in i `naming-convention.md` istället för koder:**

- **AUDIENCE är en seed, inte ett filter**, så länge Advantage+ Audience är på. Fältet beskriver i stigande grad något som inte existerar.
- **`LAL1-purchasers` märks "avrådd"**: vid ~2 600 köpare/år är en lookalike brus (`granskning-meta-mekanik.md:78,80`).
- **`advplus` betyder Advantage+ *placeringar*** i PLACEMENT-fältet — inte Advantage+ kampanjtyp, som bärs av `CONTAINER`. Skriv ut skillnaden, annars betyder koden två saker.
- **Advantage+ creative enhancements ska dokumenteras som avstängda** (`granskning-meta-mekanik.md:117`). Annars modifierar Meta creativet per visning och ingen kod i hela vokabulären betyder något.

---

## 10. Statuskoder och legender — utanför namnet, men saknas

Detta hör hemma i `ad-tracker.md`, inte i annonsnamnet.

| Kod | Svensk betydelse | Vad som går sönder utan den | Typ |
|---|---|---|---|
| `💡` | Idé, ej byggd — väntar på go | Används sju gånger utan att stå i legenden | **AKUT** |
| `🔴 pensionerad` | Vinkeln är mättad, får inte köras igen | Används i trackern, saknas i conviction-legenden | **AKUT** |
| Verdict `EJ LEVERERAD` | Meta gav aldrig annonsen leverans nog för en dom. **Skild från `killed`** — creativet är obevisat och får köras igen i ett annat adset | Enligt `granskning-meta-mekanik.md:98` det statistiskt vanligaste utfallet (60–70 % av allt producerat material). Det vanligaste utfallet i hela systemet har ingen kod, och ser idag ut exakt som ett misslyckande | NYTT BEHOV |
| `Läge` = `SÄSONG` | Pausad av kalendern, inte av prestanda (chill-villkor C6) | Utan den dödas vinterprodukter i juni för att de ser döda ut. Trettonde värdet i en lista som redan har tolv | NYTT BEHOV |
| Kolumn `Budstrategi`: `hv` / `costcap` | Högsta volym kontra kostnadstak 0,85 × BE-CPA | Utan kolumnen går **inga två annonsrader att jämföra** — granskarens ord | NYTT BEHOV |
| Kolumn `Testtyp`: `kreatörstest` / `hooktest` / `konceptstest` | Samma manus olika kreatör / samma kreatör olika hook / allt annat. Konceptstest får **inte** generera en playbook-rad | Utan den drar man playbook-slutsatser ur orena tester | NYTT BEHOV |
| Kolumn `Bevisnivå`: `produkt` / `kategori` / `system` | På vilken nivå en insikt är bevisad | Playbookens 2-testersregel skalar aldrig till 119 produkter utan den | NYTT BEHOV |
| Kolumner `Hook rate` + `Hold rate` | `3s-views ÷ impressions` respektive `ThruPlay ÷ 3s-views` | **Grind 1 är okörbar utan dem** — en UGC-video kan inte dömas innan den fått köp, vilket är precis vad låga budgetar kräver |NYTT BEHOV |
| Kolumn `Adset-namn` i annonsblocket | Blocket har `Konto / kampanj` men inte adset | Läggs den till får man audience, placement **och** optimeringshändelse gratis — den föreslagna kolumnen `Optimeringshändelse` blir därmed överflödig | NYTT BEHOV |
| Kolumn `Dödsorsak`: `dod-cpa` · `dod-ejlevererad` · `dod-frekvens` · `dod-avslag` · `dod-rattighet` · `dod-sasong` | Varför annonsen dödades | Kyrkogårdens premiss är "vi upprepar inte misstag". Fritext går inte att räkna på, och det är frekvensen av en dödsorsak som avgör vad man ska sluta göra | NYTT BEHOV |

**`🧊 chill` införs INTE i annonslegenden.** Chill är ett tillstånd hos en **produkt**, inte hos en annons, och finns redan som `CHILL` i `Läge`-listan. Skriv `Läge` som text, inte emoji — då upplöses krocken med `🧊 reserv` i kreatörsregistret av sig själv. Två hem för ett ord är hur en legend dör.

---

## 11. Konfliktdomar — vilken stavning som gäller

| # | Konflikt | **Dom** | Motivering |
|---|---|---|---|
| **K1** | `bever-se` (`ugc-creators.md:24,34,519,525,576`, `namnkonvention-luckor.md:54`) vs `bav-se` (`volym-och-skalning.md:74,94-96`) vs `bav` (`katalogsegment.md:145`) vs `BAV` (`granskning-meta-mekanik.md:52,72`) | **`BAV-SE` / `BAV-NO` / `BAV-FI` / `BAV-DK` / `BAV-UK`** | (a) Repots egen translitterering är diakrit → basvokal (`batskydd`, `vinterforvaring`), alltså ä→a, inte ä→e. (b) BRAND är versaler i *varje* befintlig kod och i de enda kampanjnamn som redan skrivits. (c) Marknaden hör ihop med butiken — en butik *är* brand+marknad, de förekommer alltid tillsammans, vilket är precis när bindestreck inom fält är rätt. **Kostnad:** `ugc-creators.md` (5 ställen inkl. briefmallen), `namnkonvention-luckor.md:54`, `volym-och-skalning.md:74,94-96`, `katalogsegment.md:145` måste redigeras. Gör det i ett svep |
| **K2** | Kreatörskod: `_c{NN}` sist (`ugc-creators.md:27,34,668`, `namnkonvention-luckor.md:52`) vs `-c{A-F}` inuti HOOK (`volym-och-skalning.md:83-85`, `katalogsegment.md:145`) | **`_c{NN}` sist vinner** | `cA–cF` är batch-**roller** (cA Uppfarten, cB Sjön …), inte personer — samma bokstav är olika människa i olika inspelningsfönster, så koden kan aldrig besvara "vilken kreatör har lägst CPA", som är hela motivet. Värre: med kreatörskoden inuti hooken skiljer sig två rader i ett kreatörstest **i hook-kolumnen**, och testet blir omöjligt att upptäcka. Batch-rollen flyttas till kolumn i inspelningsdagsloggen (`ugc-creators.md:690`), där den redan finns — ingenting förloras |
| **K3** | Tio videoformat (`ugcvideo`, `beforeafter-video`, `splitscreen`, `slideshow` …) vs färre koder | **3 koder + prefixet `vid-`** | `beforeafter-video`, `splitscreen` och `slideshow` är inte nya kompositioner — de är `beforeafter`, `comparison` och `collage` i rörlig form. Tio koder splittrar varje kompositionsfråga på flera värden |
| **K4** | `v{N}` vid ny råfilm: "ny klippversion" (`ugc-creators.md:48-49`) vs "ny annons med nytt `v{N}`" (`volym-och-skalning.md:90`) | **Ny råfilm = ny annons, `v1`.** `v{N}` = ny klippversion av **samma** råmaterial (annan längd, CTA-platta, musik), samma hook + samma kreatör | Volym-dokumentets formulering är självmotsägande — en ny annons har inget "nytt" v att bumpa |
| **K5** | `ugc` betyder mobilfoto/static (`naming-convention.md:66`), citatkort (`winning-lines.md:86`) och video (`katalogsegment.md:145`) | **`ugc` = static, mobilfoto-estetik. Video är `vid-ugc`.** Exemplet på `katalogsegment.md:145` stryks — det är fel på tre sätt samtidigt | |
| **K6** | `S1–S4` = skalningsnivå (`volym-och-skalning.md:22`) vs `S1–S10` = katalogsegment (`katalogsegment.md:13`) vs `S1–S3` = social proof-lines (`winning-lines.md:64`) | **Prefixregel: `SEG1–SEG10` för katalogsegment, `NIV-T0…NIV-S4` för skalningsnivåer, bank-ID:n (H/S/B/M/C) endast inom `winning-lines.md`** | Samma sak gäller `C1–C8` (chill-villkor / trust-lines / granskningsavsnitt) och `B1–B5`. Ingen saknad kod — en saknad namnrymd |
| **K7** | `textheavy` vs `texttung` | **`textheavy`.** `texttung` är en oregistrerad översättning av en kod som finns | |
| **K8** | `MER` (appen) vs `ROAS` (annonssystemet) | **`ROAS`.** Ett ord för försäljning ÷ spend | Trackern, playbooken och `winning-lines.md` använder redan `ROAS`. Appens `MER` är samma tal |

---

## 12. Föreslaget men INTE infört — och varför

**Dubbletter av kod som redan finns:**

| Föreslaget | Täcks redan av |
|---|---|
| `problem` (ANGLE), `smak`, `igenkänning`, `mekanism`, `USP`, `säkerhet`, `riskreversering`, `investering`, `story` | `pain` / `benefit` / `curiosity` / `authority` / `trust` **+ HOOK-slugen.** Åtta "vinklar" ur `winning-lines.md` är i själva verket *repliker*. HOOK är fritt just för att absorbera dem — `..._curiosity_textheavy_smak_v1` kodar smakvinkeln perfekt |
| `swipe`, `clearskin` | `textheavy` + `v{N}`. "Swipe" är *härkomst* (byggd efter förlaga), inte format; `clearskin` är en layoutvariant = versionsbump |
| `splitscreen`, `beforeafter-video`, `slideshow`, `ugcvideo` | `vid-comparison`, `vid-beforeafter`, `vid-collage`, `vid-ugc` |
| `tabletop` | `demo` (produkten i användning, inget ansikte) |
| `voiceover` | Ljudegenskap, inte visuellt format. Står i briefen som prosa |
| `recut` | Materialets ursprung, inte dess form. Kolumn `Källa` |
| `📚 katalog`, `🪦 död`, `⏸️ håll`, `🔻 sänk`, `⛔ aldrig-egen` | `KATALOG` / `DÖD` / `HÅLL` / `SÄNK` finns redan i `Läge`-listan. Definiera `KATALOG` som permanent ("får aldrig egen creative") så är "aldrig-egen" utagerad |
| `🕳️ ej-levererad` som status | Verdict `EJ LEVERERAD` — ett hem räcker |
| `⏳ ej-dömbar` | Härleds ur kolumnen `Egen spend / BE-CPA`: under 3 → inte dömbar. Ingen människa ska sätta den för hand |
| `⌛ rättighet-slut` | Kolumnen `Rättighet t.o.m.` (datum) + `⏸️` |
| `TOF` / `MOF` / `BOF` | AUDIENCE: `broad` = prospecting, `retarget-atc` = BOF |
| `original`, `textad-{xx}`, `dubbad-{xx}`, `omklippt` | `v{N}` + kolumn. Lokaliseringsvarianter är versioner, inte fältvärden |
| `pnl` / `meta` (talets källa) | Källan är determinerad av måttet: vinst ur PNL, leverans ur Meta. En kolumn som aldrig kan variera kodar ingenting |

**Skulle bryta eller urvattna den positionella parsern:** budget-, budstrategi- och lägeskoder i namnet (namn är oföränderliga, dessa tal ändras var 14:e dag — ett namn som ljuger är värre än inget namn) · `-c{A-F}` inuti HOOK · kreatörsfältet före `v{N}` · `beforeafter-video` som egen kod (prefixkrock med `beforeafter`).

**Påhittade behov — inget i repot kräver dem:**

- `agare`, `drift`, `assistent`, `jasper`, `kreator-c{NN}`, `pipeline`, `leverantor`. `grep` ger **noll träffar** på Jasper, mamman eller assistenten i hela repot. Vem som drev idén täcks av `Tro`-fältet. Behåll på sin höjd **en** valfri kolumn `Källa` med tre värden: `pipeline` / `kreator` / `leverantor` — det är den enda skillnaden som ändrar kostnad per vinnare.
- `m{NNN}` master-ID. Behovet är verkligt (samma klipp i fem marknader ska räknas som *ett* test), men fältet är onödigt: med regeln "slugs översätts aldrig" är master-nyckeln "allt efter första fältet". Löst gratis.
- `🚪 marknadsentré`. Inträffar fyra gånger i företagets livstid. En anteckning, inte en kod.
- `🔒 låst-tom-{ÅÅÅÅ-MM-DD}`. En "kod" som innehåller ett datum är ett datum. Kolumn: `Budget låst t.o.m.`
- Sju produktionsstatusar (`📄 brief`, `📦 produkt-skickad`, `🎬 inspelat`, `↩️ omtag`, `✂️ hos-jasper`, `✅ klar`, `🕒 i-kö`) för ett flöde med **noll bokade kreatörer och noll producerade videor**. Behövs ett produktionsbräde är det en egen tabell med egen legend, och den börjar på tre värden.
- `seed`, `position` (top/bottom), `badge`/`footer`, `dry`/`skarp`, `ratio`, `kvalitet`. Renderingsparametrar, redan i `_manifest.json` och vågfilen. Annan seed = annan bild = `v{N}`-bump.
- Fyra erbjudandetyper (rabatt / gåva-på-köpet / bundle / prishöjning). `offer` finns; vilket erbjudande det är står i HOOK-slugen. Playbooken säger dessutom att rabatt inte finns bland vinnarna.
- `SALES-ADV` / `SALES-MAN` / `SALES-KAT`. Advantage+-växeln bärs av `CONTAINER`.

---

## 13. Saknas, men är inte en kod — blockerare som måste noteras

Dessa går inte att lösa med ett fältvärde, och de blockerar allt ovan.

1. **Ingen nyckel binder annonsen till intäkten.** Ordet `utm` har **noll träffar i hela repot**, och `shopify-data.server.ts` hämtar ingen orderattribution. Doktrinens mest upprepade regel — *"läs vinst ur PNL, aldrig ur Ads Manager"* — är därmed inte "ej implementerad" utan **oimplementerbar**. Krävs: `utm_source=meta` · `utm_medium=paid` · `utm_campaign={kampanjnamn}` · `utm_content={annonsnamn}` · `utm_term={adsetnamn}`, genererade **ur namnet**, aldrig handskrivna.
2. **PRODUCT-slugen har ingen mappning till appen.** Appen identifierar produkter med `productGid`/`variantGid`; annonsen bär en handskriven slug. BE-CPA per produkt bor alltså på ena sidan och annonsen på andra, utan bro. `Egen spend / BE-CPA` kan aldrig räknas maskinellt för 119 produkter.
3. **Ingen rad har ett Meta-ID.** Trackern nycklar på annonsnamnet, Meta på `ad_id`. Namnet är varken unikt eller stabilt (Ads Manager lägger på " - Copy" vid duplicering). Lägg `ad_id` som kolumn innan parsern byggs.
4. **Frekvens finns inte på någon nivå.** `granskning-meta-mekanik.md:124-128` gör frekvens 7d ≥ 2,0 på adsetnivå till systemets **enda** mättnadströskel, och `:186` säger att frekvens och CPM är brusfria medan ROAS inte är det. Doktrinens primära beslutssignal saknas i trackern.
5. **Mätfönster och attributionsinställning stämplas inte per rad.** `granskning-meta-mekanik.md:174-186` kallar attributionsmognaden *"det farligaste enskilda felet i hela materialet"* — ett nyss avslutat fönster underrapporterar 10–25 % och skulle flytta hela katalogen till chill på sex veckor. Fixen (jämför dag −21..−14 mot −14..−7) är oefterlevbar utan ett fönsterfält.
6. **Ekonomisk regim stämplas inte.** När post-purchase-upsell går live stiger BE-CPA från 178 till 195–212 kr. En annons som dömdes `killed` i mars mot 178 hade varit `scaling` i juni mot 212 — och kyrkogården minns bara domen, aldrig talet den dömdes mot. Lägg `becpa-{tal}` på varje resultatrad.
7. **`run.mjs:32` skriver samma filnamn för dry och skarp** (`${ad.name}.png` i båda fallen). En förhandsgranskning och en skarp static går inte att skilja åt på disk. Riktig bugg, inte en namnfråga.
8. **`pnl.server.ts`: två namn per tal.** `breakEvenMer` och `breakEvenRoas` har identiska uttryck (rad 319-320); `grossContribution` och `grossProfit` likaså (rad 279, 283). Slå ihop.

---

## 14. Rättningar i befintligt material (kostar noll — inget är live)

| # | Från | Till | Var |
|---|---|---|---|
| R1 | `GRILL_mastern_problem_beforeafter_serentut_v1` | `GRILL_mastern_pain_beforeafter_serentut_v1` | `pipeline/waves/wave-01.mjs:65`. Därmed är `problem` borta ur repot helt |
| R2 | `GRILL_mastern_social_product_trust_v1` | `GRILL_mastern_trust_product_rustafynd_v1` | `wave-01.mjs:54`, `winning-lines.md:87`. Vinkeln flyttar till sitt eget fält, hooken speglar rubriken ("Inte ett Rusta-fynd. Ett riktigt redskap.") |
| R3 | `swipe_clearskin_GRILL_mastern_v1.png`, `swipe_texttung_GRILL_mastern_v1.png` | `GRILL_mastern_offer_textheavy_hejda_v1.png` / `_v2.png` | `swipe.mjs:49`, `swipe2.mjs:44` |
| R4 | Samma koncept heter `..._pain_comparison_ruinsgrill_v1` i `ad-tracker.md:26` och `..._pain_comparison_investering_v1` i `wave-01.mjs:31` | Ett namn per koncept | Driften har redan börjat drifta |
| R5 | `bav_batskydd_pain_ugc_winterstorage-cB_v1` | Stryk exemplet | `katalogsegment.md:145` — brand utan marknad, kreatörskod i hook, `ugc` (static) för en video |
| R6 | "`authority`-format" | Skriv om meningen | `katalogsegment.md:181` — fältförväxling i prosa, ingen ny kod |
| R7 | `bever-` (5 ställen), `bav-` (4), `bav` (1), `BAV` (2) | `BAV-{XX}` | `ugc-creators.md`, `namnkonvention-luckor.md:54`, `volym-och-skalning.md:74,94-96`, `katalogsegment.md:145`, `granskning-meta-mekanik.md:52,72` |

---

## 15. Slutformatet efter alla tillägg

```
Campaign  {BRAND}_{OBJECTIVE}_{YYYYMMDD}_{CONTAINER}
Ad set    {AUDIENCE}_{PLACEMENT}_{OPTIMIZATION}
Ad        {BRAND}_{PRODUCT}_{ANGLE}_{FORMAT}_{HOOK}_v{N}[_c{NN}]
```

**Verkligt exempel — Båtskydd 420D ur Bäverbutikens katalog** (1 049 kr, segment SEG3 Båt & Marint, BE-ROAS 1,41 — lägst headroomkrav i segmentet; `katalogsegment.md` anger säsongsavslut sept–okt och "vinterförvaring" som seg­mentets starkaste vinkel):

```
Campaign  BAV-SE_SALES_20260901_ENGINE
Ad set    broad_advplus_purchase
Ad        BAV-SE_batskydd_trust_vid-ugc_vinterforvaring_v1_c04
```

```
BAV-SE_batskydd_trust_vid-ugc_vinterforvaring_v1_c04
│      │        │     │       │                │   └ kreatör — personen framför kameran, valfritt,
│      │        │     │       │                │      SIST, null för statics
│      │        │     │       │                └ klippversion av samma råfilm, hook och kreatör
│      │        │     │       └ hook — ur slugkanonen, 1–2 ord, översätts ALDRIG
│      │        │     └ format — vid- = rörligt, ugc = kompositionen
│      │        └ angle — garantin/anti-scam bor här nu, inte i authority
│      └ produktslug — Shopify-handle, å/ä→a, ö→o, översätts ALDRIG
└ butik + marknad, VERSALER
```

Samma klipp i Norge blir `BAV-NO_batskydd_trust_vid-ugc_vinterforvaring_v1_c04` — identiskt utom första fältet. Det är därför inget master-ID behövs: nyckeln "samma creative" är allt efter `_`.

Statisk annons för Grillkliniken, samma vokabulär, kreatörsfältet utelämnat:

```
GRILL_mastern_trust_product_rustafynd_v1
```

**Räkning:** 11 nya koder i namnet (6 BRAND, 1 ANGLE, 3 FORMAT, 1 PRODUCT) + modifieraren `vid-` + det valfria fältet `_c{NN}` + 2 kampanjbehållare, mot ~100 föreslagna. Allt annat är dubbletter, fältförväxlingar, trackerkolumner eller behov som inte finns.

**Ordning att göra det i:** (1) BRAND-koderna och stavningsrättningen i de fem filerna — de blockerar alla fem butikerna. (2) `trust` + avsmalna `authority` + rätta R1 och R2. (3) FORMAT och `vid-` **innan första kreatören briefas**. (4) Kreatörsfältet — gör det medan ingen parser finns, det blir dyrt sen. (5) Trackerkolumnerna. Punkt 1–3 måste vara klara innan någon annons döps.