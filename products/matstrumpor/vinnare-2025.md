# Förra årets Q4-vinnare (nov–dec 2025), avlästa ur kontot 2026-10-03

**Mätt:** Meta Graph API v23.0 via `META_ACCESS_TOKEN`, insights `level=ad`,
`time_range` 2025-11-01..2025-12-31, `spend > 0`, `action_attribution_windows`
7d_click + 1d_view. Köp = `omni_purchase` i **7d_click** (samma fönster som
`/matstrumporkungen`), intäkt = spend × `purchase_roas` 7d_click, aldrig
`omni_purchase_values`. Status och creative lästa samma dag via
`act_1346450049878358/ads` med filter `id IN` (50 per anrop). **Användningen vid
körningen:** `x-app-usage` skickades bara på felsvar och stod på
`call_count` 5–9, `total_cputime` 0, `total_time` 3. Kontonas
`x-business-use-case-usage` låg på högst 6 % (nya kungen, ads_management,
`total_time` 17 vid första anropet) och 1–2 % för insights. Långt under 80, så
alla steg kördes.

## ⚠️ Annonserna låg inte i "nya kungen"

- **"nya kungen" `730973156224390` har ingen spend före augusti 2026.** Kontot
  skapades 2025-11-29 20:43. Månadsserien 2025-01..2026-09 gav bara augusti 2026
  (23 771 kr) och september 2026 (109 090 kr). Insights nov–dec 2025 svarade
  `{"data":[]}`.
- **Förra julens Matstrumpor-annonser gick i SnarkLös `1346450049878358`.** Det
  är Grillklinikens konto i CLAUDE.md och i `stonebite/varumarken.json`
  (`"hela": true`). 142 av kontots 351 annonser med spend nov–dec 2025 länkar till
  `matstrumpor.se`. Resten länkar till fixkliniken.se (83), kungpressen.se (30),
  stalduk.se (27), cutitright.se (21), porfritt.se (18), skrubbvantar.se,
  bubbelgubbar.se och bondschack.se (10 var). Matstrumpor är klassat på
  landningslänken i varje creative, inte på namnet.
- **Pixeln är Matstrumpors egen:** `1785935302094082` på alla 142 annonsers
  adsets, samma som `matstrumpor/konfig.json`. **Sidan:** Matstrumpor.se
  `820358954504320` på 133 annonser (samma sida som de svenska annonserna bär i
  dag). De nio `Storie …`-annonserna (1 504 kr tillsammans) går från sidan
  `923173334213413`, och dess namn gick inte att läsa.
- **I december var hela SnarkLös Matstrumpor:** kontot spenderade 179 876,46 kr i
  december 2025. Matstrumpors 16 kampanjer spenderade lika mycket (181 919 kr
  minus 2 043 kr den 30 november).
- **Kontroll mot Shopify:** Meta räknar december 2025 till 1 550 köp och cirka
  571 000 kr i intäkt (7d_click). Shopify hade 1 613 ordrar och 589 675 kr
  (`klaviyo/evolve/ATERKOP-ANALYS-matstrumpor.md`). Attribuering är inte
  ordrar, men talen ligger så nära att ett stort konto till med Matstrumpor-annonser
  är osannolikt. Bevisat är det inte, se sist.

## Annonserna nov–dec 2025, sorterade på spend

142 annonser med spend, 106 olika inlägg, 16 kampanjer. **Summa 181 919 kr ·
1 585 köp · ROAS 3,21 · intäkt 584 592 kr** (med 1 dags visning också: 1 612 köp,
ROAS 3,26). Video 153 847 kr, bild 28 072 kr. Alla länkar är exakt
`https://matstrumpor.se/products/sushi-strumpor` utan parametrar.

**Över 1,498:** ✅ = ROAS 7d_click minst break-even 1,498 (`konfig.json`), ❌ =
under. — = ingen dom, för under 3 köp (CLAUDE.md regel 3). Alla rader nedan har
minst 300 kr.

| # | Annons (id) | Kampanj | Spend (kr) | Köp | ROAS | Intäkt (kr) | Över 1,498 | Format | Status nu | Länk |
|---|---|---|---:|---:|---:|---:|:---:|---|---|---|
| 1 | vid bästa lilla gåvan till julstrumpan (120236404201940074) | SUSHISTRUMPOR | 81 945 | 843 | 3,79 | 310 331 | ✅ | video | annons på, kampanj PAUSED | /products/sushi-strumpor |
| 2 | Vid Clean asmr typ – kopia (120237330115890074) | SUSHISTRUMPOR | 25 891 | 123 | 1,67 | 43 295 | ✅ | video | annons på, kampanj PAUSED | /products/sushi-strumpor |
| 3 | vid bästa lilla gåvan till julstrumpan (120236434568150074) | SUSHISTRUMPOR – kopia | 15 570 | 191 | 4,54 | 70 637 | ✅ | video | annons på, kampanj PAUSED | /products/sushi-strumpor |
| 4 | vid bästa lilla gåvan till julstrumpan (120236568451480074) | SUSHISTRUMPOR – kopia 2 | 9 827 | 156 | 5,99 | 58 823 | ✅ | video | annons på, kampanj PAUSED | /products/sushi-strumpor |
| 5 | bild inte den du tror – kopia (120237259351580074) | Asc bild inte den du tror | 5 463 | 26 | 1,90 | 10 373 | ✅ | bild | annons på, kampanj PAUSED | /products/sushi-strumpor |
| 6 | bild inte den du tror (120236878740550074) | TESTING TESTING | 3 305 | 39 | 4,41 | 14 563 | ✅ | bild | PAUSED, kampanj PAUSED | /products/sushi-strumpor |
| 7 | Vid Clean asmr typ (120237074889640074) | Test 3 sushistrumpor | 2 755 | 28 | 3,29 | 9 061 | ✅ | video | annons på, kampanj PAUSED | /products/sushi-strumpor |
| 8 | bild alla älskar (120236878661220074) | TESTING TESTING | 2 569 | 19 | 2,97 | 7 630 | ✅ | bild | annons på, kampanj PAUSED | /products/sushi-strumpor |
| 9 | Vid par sluta köpa – kopia (120237757152520074) | SUSHISTRUMPOR | 2 319 | 9 | 1,72 | 3 990 | ✅ | video | annons på, kampanj PAUSED | /products/sushi-strumpor |
| 10 | vid min pojkvåän (120236402599460074) | SUSHISTRUMPOR | 2 286 | 9 | 1,70 | 3 891 | ✅ | video | annons på, kampanj PAUSED | /products/sushi-strumpor |
| 11 | bild inte den du tror – kopia (120237008791430074) | SUSHISTRUMPOR | 2 221 | 23 | 3,98 | 8 847 | ✅ | bild | annons på, kampanj PAUSED | /products/sushi-strumpor |
| 12 | Bild Sushibänk (120236400583410074) | SUSHISTRUMPOR | 1 858 | 12 | 2,31 | 4 288 | ✅ | bild | annons på, kampanj PAUSED | /products/sushi-strumpor |
| 13 | vid sushi i julstrumpa (120236878506110074) | TESTING TESTING | 1 561 | 20 | 4,41 | 6 880 | ✅ | video | annons på, kampanj PAUSED | /products/sushi-strumpor |
| 14 | Test Sushi ugc sora 1 (120237335134880074) | Test Sushi ugc sora 1 | 1 182 | 6 | 1,77 | 2 094 | ✅ | video | PAUSED, kampanj PAUSED | /products/sushi-strumpor |
| 15 | Vid när du vill ge en liten present som inte floppar – kopia (120237757137500074) | SUSHISTRUMPOR | 1 172 | 2 | 0,48 | 568 | — | video | annons på, kampanj PAUSED | /products/sushi-strumpor |
| 16 | Bild jeorge lmapa – kopia (120237409241290074) | SUSHISTRUMPOR | 1 152 | 7 | 2,34 | 2 693 | ✅ | bild | annons på, kampanj PAUSED | /products/sushi-strumpor |
| 17 | Storie BOF 2 (120237582620880074) | SUSHISTRUMPOR | 1 046 | 1 | 0,38 | 399 | — | bild | annons på, kampanj PAUSED | /products/sushi-strumpor |
| 18 | bild alla älskar – kopia (120237259301130074) | SUSHISTRUMPOR | 894 | 3 | 1,23 | 1 097 | ❌ | bild | annons på, kampanj PAUSED | /products/sushi-strumpor |
| 19 | vid min dotter laga middag (120236878484380074) | TESTING TESTING | 846 | 3 | 2,12 | 1 796 | ✅ | video | PAUSED, kampanj PAUSED | /products/sushi-strumpor |
| 20 | Bild 50% rabatt (120236401168030074) | SUSHISTRUMPOR | 811 | 8 | 3,07 | 2 492 | ✅ | bild | annons på, kampanj PAUSED | /products/sushi-strumpor |
| 21 | Bild sushi i soppan (120237509587570074) | Testing kungen | 644 | 1 | 0,46 | 299 | — | bild | annons på, kampanj PAUSED | /products/sushi-strumpor |
| 22 | Vid  ser ut som strumpor – kopia (120237757120310074) | SUSHISTRUMPOR | 595 | 3 | 1,68 | 997 | ✅ | video | annons på, kampanj PAUSED | /products/sushi-strumpor |
| 23 | Det är typ den perfekta balansen (120237969795640074) | nya teestee | 547 | 5 | 3,65 | 1 995 | ✅ | video | annons på, kampanj PAUSED | /products/sushi-strumpor |
| 24 | föris – kopia (120237970500720074) | nya teestee | 519 | 0 | – | 0 | — | bild | PAUSED, kampanj PAUSED | /products/sushi-strumpor |
| 25 | vid ai julstrumpa – kopia (120236842664320074) | SUSHISTRUMPOR | 510 | 3 | 3,13 | 1 597 | ✅ | video | annons på, kampanj PAUSED | /products/sushi-strumpor |
| 26 | Vid jag slutade chansa vän sa – kopia – kopia (120237896121580074) | vid jag slutade chansa vän sa | 487 | 0 | – | 0 | — | video | annons på, kampanj PAUSED | /products/sushi-strumpor |
| 27 | Vid jag slutade chansa vän sa – kopia – kopia (120237757148380074) | SUSHISTRUMPOR | 482 | 0 | – | 0 | — | video | annons på, kampanj PAUSED | /products/sushi-strumpor |
| 28 | Test Sushi ugc sora 3 (120237348669440074) | Test Sushi ugc sora 1 | 439 | 3 | 2,50 | 1 097 | ✅ | video | annons på, kampanj PAUSED | /products/sushi-strumpor |
| 29 | Vid jag slutade chansa vän sa – kopia (120237757137490074) | SUSHISTRUMPOR | 431 | 3 | 2,31 | 997 | ✅ | video | annons på, kampanj PAUSED | /products/sushi-strumpor |
| 30 | Vid jag brukade alltid stressa – kopia (120237757145550074) | SUSHISTRUMPOR | 419 | 1 | 0,95 | 399 | — | video | annons på, kampanj PAUSED | /products/sushi-strumpor |
| 31 | Vid par sluta köpa – kopia – kopia (120237880851180074) | ASC - Par sluta köpa | 412 | 0 | – | 0 | — | video | annons på, kampanj PAUSED | /products/sushi-strumpor |
| 32 | Bild beställde sushi fick strumpor (120237508930020074) | Testing kungen | 387 | 0 | – | 0 | — | bild | annons på, kampanj PAUSED | /products/sushi-strumpor |
| 33 | Bild jeorge lmapa – kopia – kopia (120237881157830074) | ASC - Bild goerge lampa | 354 | 1 | 0,85 | 299 | — | bild | annons på, kampanj PAUSED | /products/sushi-strumpor |
| 34 | Vid den här har räddat mig fler gånger än jag kan räkna – kopia – kopia (120237757152510074) | SUSHISTRUMPOR | 349 | 0 | – | 0 | — | video | annons på, kampanj PAUSED | /products/sushi-strumpor |
| 35 | Bild pappa nyhets (120236402193850074) | SUSHISTRUMPOR | 346 | 0 | – | 0 | — | bild | annons på, kampanj PAUSED | /products/sushi-strumpor |
| 36 | Bild - små saker stora kvällar (120237894209190074) | ABO test bara bilder och kärlek | 338 | 1 | 0,88 | 299 | — | bild | annons på, kampanj PAUSED | /products/sushi-strumpor |
| 37 | bild vill ha vilka (120236878776140074) | TESTING TESTING | 319 | 0 | – | 0 | — | bild | PAUSED, kampanj PAUSED | /products/sushi-strumpor |
| | **Övriga 105 annonser under 300 kr** | | 9 668 | 36 | 1,33 | 12 864 | — | | | |
| | **Summa 142 annonser** | | **181 919** | **1 585** | **3,21** | **584 592** | | | | |

Av de 37 raderna: 22 ✅, 1 ❌ och 14 utan dom.

**Säsongens Nathalie var ett enda inlägg.** "vid bästa lilla gåvan till
julstrumpan" (inlägg `820358954504320_122093165397154794`) gick i fyra annonser i
tre kampanjer: **107 351 kr · 1 190 köp · ROAS 4,10 · 59 % av säsongens spend.**
Näst störst var "Vid Clean asmr typ – kopia" (25 891 kr, ROAS 1,67), som startade
15/12 när hela kontot började tappa.

## Hur förra årets skalning gick, vecka för vecka

**Oktober 2025: 0 kr på Matstrumpor.** Kontots 288 annonser med spend i oktober
låg alla i andra produkters kampanjer: skrubbammatta, Legease, skrub andromeda,
fixtoe, Diskfix, tork360, Silenttrim, Grilly och ASC vid problemaware 1.2. Länken
lästes bara för den sista kampanjen (fixkliniken.se), de andra är klassade på
kampanjnamnet. **November fram till den 29: 0 kr.** Den första kampanjen,
`SUSHISTRUMPOR`, skapades 2025-11-29 18:27 och startade 30/11 00:01. Shopify hade
bara 52 ordrar i november, för lådan var slut.

Veckorna börjar på onsdag eftersom serien läses från 2025-10-01 med
`time_increment=7`. Meta skickar inga rader för veckor utan spend, så veckorna
1/10–25/11 är 0 kr. Talen gäller Matstrumpors 16 kampanjer, inte hela SnarkLös.

| Vecka | Spend (kr) | Köp | ROAS |
|---|---:|---:|---:|
| 1/10–25/11 | 0 | 0 | – |
| 26/11–2/12 (spend från 30/11) | 6 994 | 114 | 6,34 |
| 3/12–9/12 | 34 793 | 531 | 5,61 |
| 10/12–16/12 | 72 007 | 679 | 3,48 |
| 17/12–23/12 | 48 210 | 211 | 1,57 |
| 24/12–30/12 | 18 169 | 43 | 0,89 |
| 31/12 | 1 747 | 7 | 1,54 |

Dag för dag, ur `time_increment=1`:

- Första dagen 30/11: 2 043 kr, 35 köp, ROAS 6,69.
- Spenden steg varje vecka fram till toppen **16/12 med 14 164 kr på en dag**.
- **30/11–18/12: 135 130 kr · 1 460 köp · ROAS 3,99.**
- **19/12–31/12: 46 789 kr · 125 köp · ROAS 0,97.** Från 19/12 låg varje dag
  under 1,498 utom 31/12 (1,54). Troligen julklappsgränsen, när paketet inte
  längre hinner fram. Orsaken är inte mätt.
- Kampanjerna fortsatte in i januari med cirka 800 kr om dagen (1–10/1: 8 781 kr,
  36 köp, ROAS 1,53).

## Vad som går att slå på igen

Det här är fakta till Axels beslut. Inget är påslaget, och sessionen slår aldrig
på något (PAUSED är ett beslut, Matstrumporkungen skalar aldrig).

**Läget i kontot (läst 2026-10-03):**
- Alla 16 kampanjer är PAUSED.
- Av de 142 annonserna står 129 själva på inne i en pausad kampanj. 6 är PAUSED,
  6 ligger i ett pausat adset, 1 är ARCHIVED (34 kr) och ingen är DELETED.
- Av de 37 annonserna med minst 300 kr står 32 på i en pausad kampanj och 5 är
  PAUSED. Ingen av dem måste laddas upp på nytt för att den saknas.

**Var de ligger avgör vägen.** Annonserna ligger i SnarkLös, inte i "nya kungen".
- **Vägen A, slå på kampanjen i SnarkLös:** pixeln och sidan är Matstrumpors,
  så köpen bokförs rätt. Men spenden hamnar i SnarkLös, som repot räknar till
  Grillkliniken: på stonebite-sajten, i commission och i StonePNL. Dessutom läser
  `/matstrumporkungen` bara "nya kungen" (`meta.mjs` vägrar andra konton), så
  ronden ser aldrig de annonserna.
- **Vägen B, samma inlägg som ny annons i "nya kungen":** sidan
  `820358954504320` är densamma, så en annons byggd på det befintliga inlägget får
  med sig likes och kommentarer. Det är samma metod som Champions-flytten
  (`konfig.json` → `axel_2026_10_02_comment`).

**Inläggen med dom ✅, för vägen B:**

| Inlägg (post-id) | Annons | Spend (kr) | Köp | ROAS | Format |
|---|---|---:|---:|---:|---|
| 820358954504320_122093165397154794 | vid bästa lilla gåvan till julstrumpan (4 annonser) | 107 351 | 1 190 | 4,10 | video |
| 820358954504320_122105621547154794 | Vid Clean asmr typ – kopia | 25 891 | 123 | 1,67 | video |
| 820358954504320_122099033259154794 | bild inte den du tror (2 annonser) | 8 769 | 65 | 2,84 | bild |
| 820358954504320_122102877231154794 | Vid Clean asmr typ | 2 755 | 28 | 3,29 | video |
| 820358954504320_122099033109154794 | bild alla älskar | 2 569 | 19 | 2,97 | bild |
| 820358954504320_122093165529154794 | vid min pojkvåän (4 annonser) | 2 440 | 11 | 1,92 | video |
| 820358954504320_122106868773154794 | bild inte den du tror – kopia | 2 221 | 23 | 3,98 | bild |
| 820358954504320_122093165457154794 | Bild Sushibänk (4 annonser) | 2 033 | 13 | 2,40 | bild |
| 820358954504320_122102877333154794 | Bild jeorge lmapa (3 annonser) | 1 752 | 11 | 2,39 | bild |
| 820358954504320_122099033193154794 | vid sushi i julstrumpa | 1 561 | 20 | 4,41 | video |
| 820358954504320_122105666703154794 | Test Sushi ugc sora 1 | 1 182 | 6 | 1,77 | video |
| 820358954504320_122093165391154794 | Bild 50% rabatt (3 annonser) | 912 | 8 | 2,73 | bild |
| 820358954504320_122099033049154794 | vid min dotter laga middag | 846 | 3 | 2,12 | video |
| 820358954504320_122108257329154794 | Vid ser ut som strumpor – kopia | 595 | 3 | 1,68 | video |
| 820358954504320_122097382335154794 | vid ai julstrumpa (2 annonser) | 590 | 5 | 4,06 | video |
| 820358954504320_122109457743154794 | Det är typ den perfekta balansen | 547 | 5 | 3,65 | video |
| 820358954504320_122105746971154794 | Test Sushi ugc sora 3 | 439 | 3 | 2,50 | video |

`Vid par sluta köpa – kopia` fick ✅ som enskild annons (1,72). Inlägget som
helhet, med sin andra annons, ligger på 1,46. `Vid jag slutade chansa vän sa – kopia`
fick ✅ (2,31) men inlägget ligger på 1,09 över två annonser. Båda står därför inte i
tabellen.

**Länken stämmer i dag.** Alla 142 länkar går till
`/products/sushi-strumpor`, samma handle som `konfig.json` → `landningssida`.
Produkten finns, läst live 2026-10-03: Sushi-Strumpor, 5 par 399 kr och 3 par
369 kr, inget jämförpris.

**Texten stämmer inte alltid med sajten i dag.** Sajtens erbjudande är "Köp 1 –
Få 1 GRATIS" (`dna.md`, avläst 2026-09-24), inte "50 %". Sedan 2026-10-03 visar
sajten dessutom förbeställning (CLAUDE.md). Evolves kongruensregel: en annons med
bättre erbjudande än sajten får inte gå.
- **"50 %", "50 % rea", "50 % julrea" eller "50 % rabatt" i texten:** Vid Clean
  asmr typ (båda), bild inte den du tror (alla tre), bild alla älskar (båda),
  Bild Sushibänk, Test Sushi ugc sora 1 och 3, Bild jeorge lmapa (båda), Storie
  BOF 2, Bild 50% rabatt och Bild pappa nyhets.
- **"Julrean/julens ingång gör dem ännu billigare", "tidig Jul Rea" eller
  "julpriset lägre än någonsin":** vid bästa lilla gåvan till julstrumpan (alla
  tre), vid ai julstrumpa, vid sushi i julstrumpa, vid min dotter laga middag,
  vid min pojkvåän och bild vill ha vilka.
- **Påståenden som inte är belagda i repot:** "Julens bestseller" (Bild
  Sushibänk) och "nu är SushiStrumpor viralt … Sveriges mest omtalade julgåva"
  (Bild pappa nyhets).
- **Utan pris eller rea i texten:** Vid par sluta köpa, Vid när du vill ge en
  liten present som inte floppar, Bild sushi i soppan, Vid ser ut som strumpor,
  Det är typ den perfekta balansen, föris, Vid jag slutade chansa vän sa, Vid
  jag brukade alltid stressa, Bild beställde sushi fick strumpor, Vid den här har
  räddat mig och Bild - små saker stora kvällar.
- **Annan sida:** de nio `Storie …`-annonserna går från `923173334213413`, inte
  Matstrumpor.se.

Texten ovan är annonstexten och rubriken. Vad som står i själva bilden eller
videon är inte granskat.

## Det jag inte kunde mäta

- **"nya kungen" hade ingen data för perioden** (skapat 2025-11-29, första spend
  augusti 2026). Listan kommer därför ur SnarkLös. Uppdraget utgick från fel konto.
- **Konton token:en inte når**, alla med `(#200) Ad account owner has NOT grant
  ads_management or ads_read permission`: **"Sushi kanske?" `1550615276530638`**,
  Norge `1418612340124566`, Finland DK `1356652809967926`, Axel Odhner
  `429285600005902`, Snark mexico, SNarklös FI och NYC Grill. Gick Matstrumpor i
  något av dem 2025 syns det inte här. Namnet "Sushi kanske?" talar för att det
  kontot hör till Matstrumpor. Att Metas decembertal ligger nära Shopifys gör ett
  stort bortfall osannolikt, men det är inte bevisat.
- **Sidan `923173334213413`:s namn:** `(#10)`, token:en saknar
  `pages_read_engagement`.
- **Produktsidans HTML i dag:** Shopify svarade 429 på sidan, så erbjudandet
  ("Köp 1 – Få 1 GRATIS") är taget ur `dna.md` (2026-09-24) och inte läst i dag.
  Priserna lästes ur `/products/sushi-strumpor.js` (200).
- **Innehållet i bilderna och videorna:** en "50 %" eller ett pris inbränt i
  bilden är inte kontrollerat, bara annonstexten.
- **Förra årets eget break-even:** markeringen ✅/❌ är mot dagens 1,498
  (AOV 462 kr, 2026-09-21), som uppdraget sa. December 2025 hade AOV 366 kr
  (Shopify) och "50 %"-erbjudandet, och det årets break-even är inte räknat.
- **Ordervärde, hook och hold per annons** är inte lästa.
- **Metod, för nästa session:** `?ids=` svarade 500 "The ids query parameter is
  deprecated in v26.0+" även mot `v23.0`-adressen (mätt, 243 avvisade anrop innan
  körningen stoppades). Vägen som fungerade är `act_<konto>/ads` med
  `filtering=[{field:"id",operator:"IN",value:[…]},{field:"effective_status",operator:"IN",value:[… "ARCHIVED","DELETED"]}]`,
  50 id:n per anrop.
