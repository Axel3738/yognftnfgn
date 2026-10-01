# Creative DNA — Matstrumpor (Sushi-Strumpor)

**Skapad 2026-09-21. Uppdaterad 2026-09-30, rond 4** (rond 2 var 2026-09-24,
den första riktiga `/matstrumporkungen`-ronden). Allt nedan är avläst ur kontot "nya kungen"
`730973156224390` (token, 7d_click), Shopify och Notion. Ingen siffra är
hämtad ur en tidigare chatt, och ingen är uppskattad. Talen per annons står
i `lardomar.md`; det här är vad vi lärt oss om produkten.

Uppladdaren: `/matstrumpor`. Ronden: `/matstrumporkungen`. Facit för tal:
`matstrumpor/konfig.json`.

---

## Produkten

| | |
|---|---|
| Butik | https://matstrumpor.se (Shopify `1r46tp-qx`) |
| Huvudprodukt | Sushi-Strumpor — **5-pack 399 kr** (inget jämförpris), 3-pack 369 kr (avläst live 2026-09-24) |
| Erbjudanden på sidan | **"Köp 1 – Få 1 GRATIS"** och **"Köp 2 – få 2 gratis"** (bundle-blocket på produktsidan, avläst 2026-09-24). Inga andra siffror i copy |
| Övriga | Pizza 449 kr, Hamburgare 299 kr, Donut 299 kr, presentkort 150 kr |
| AOV | **462,10 kr** (110 betalda ordrar / 30 dagar, mätt 2026-09-21) |
| Ordern | 90 av 110 ordrar bär **exakt 2 strumpprodukter**. Ätpinnar ligger på 246 av raderna |
| Kostnad | 120,92 kr för 2 par + 2,9 EUR tull = **153,62 kr** (Axels siffra + ECB-kurs 11,275) |
| Break-even-ROAS | **1,498** · break-even-CPA **308,48 kr** (Axel 2026-09-21: Matstrumpor säljer UTAN moms) |

⚠️ **Kostnaden saknar tre poster:** fraktkostnaden till kund, betalväxelns
avgift och svinn/returer. Break-even ovan är alltså i bästa fall.

---

## Marknader (byggda 2026-09-27 — `matstrumpor/marknader/README.md` är facit)

Butiken säljer sedan 2026-09-27 i **åtta länder från samma Shopify-butik** med
Sverige som primär marknad (Axels beslut samma dag: Markets, inte en ny butik).
Förra försöket, augusti 2026, var en egen engelsk butik **sushisock.com** med
annonser ur samma konto "nya kungen": US 6 193 kr / 9 köp / ROAS 0,76, UK 5 845
kr / 11 / 1,07, AU 9 656 kr / 20 / 0,97 — alla under break-even, alla pausade.
Landningssidan var `sushisock.com/products/sushi-socks`, 155 engelska annonser
(`MATSTRUMP_US_/AU_sushi_ugc_…`). Lärdomen som bär: engelskan såldes utan
svensk "sålde slut i november"-bevisning och utan Köp 1 – Få 1 i bild — samma
creative som Sverige, bara översatt.

| Marknad | Länder | Språk | Valuta | Pris | Adress för annonser |
|---|---|---|---|---|---|
| Norge | NO | nb | NOK (omräknat) | 5 par ≈ SEK-priset | `matstrumpor.se/nb/products/sushi-strumpor?country=NO` |
| Europa | DK, FI | da, fi | EUR, DKK lokal | omräknat | `/da/…?country=DK`, `/fi/…?country=FI` |
| Engelska | US, GB, AU, CA, NZ | en | USD fast, övriga omräknade | 5 par **$59.00**, 3 par $45.99, donut/burger $33.99, pizza $49.99 (Axels sushisock-priser) | `/en/…?country=US` osv. |

**Break-even per land** (`node matstrumpor/kor.mjs --ekonomi --marknad US`,
ECB-kurs vid körning, landad kostnad ur `matstrumpor/cogs.json` = Axels ark för
Big 5): sushi 5 par US **1,22**, 3 par 1,23, donut 1,37, pizza 1,24, hamburgare
1,36. Norden: **ingen kostnad känd** — räkna aldrig på Sveriges 153,62 kr utan
att säga det. Fri frakt till alla åtta länder (sessionens beslut, precedens
sushisock/CaraShell/Bäverbutiken NO-DK-FI).

**Annonserna utomlands är inte byggda.** Planen: Norge först (Axels ord 2026-09-27:
"börja med att testa Norge osv och Norden"), samma konto "nya kungen" (SEK) med
en kampanj per land `MATSTRUMP_<LAND>_SALES`, geo = landet, länken ovan,
annonsnamn `MATSTRUMP_<LAND>_sushi_<vinkel>_<format>_<nnn>_v<n>`, SE-vinnarna
översatta med `pipeline/translate-batch.mjs --marknad <M>` (HeyGen). Budget per
land är Axels; inget annonskonto rörs innan dess.

---

## Läget i kontot (14 dagar till 2026-09-26, läst 2026-09-27 — rond 3)

Kampanjen `MATSTRUMP_SALES_20260826`, CBO, **10 000 kr/dag sedan 23/9**
(Axel: 1 000 → 2 000 → 10 000). 107 annonser, 87 med spend:
**44 071 kr · 207 köp · ROAS 2,03** — över break-even 1,498 för första
gången sedan systemet byggdes (rond 2: 18 208 kr / 58 köp / ROAS 1,456).
Sedan höjningen (24–26/9): 29 750 kr / 154 köp / ROAS 2,20 — budgeten går åt
och ROAS höll. Senaste 7 dygnen: 37 090 kr / 189 köp, varav **Nathalie
32 605 kr (88 %)**.

**Sex bedömbara annonser, rangordnade på vinstbidrag (utan moms):**

| Vinstbidrag 14 d | Annons | Spend | Köp | CPA | ROAS |
|---|---|---|---|---|---|
| **+16 069 kr** | `09-17 Nathalie captions musik` ★ benchmark | 32 703 kr | 173 | 189 kr | 2,23 |
| +1 843 kr | `MATSTRUMP_sushi_offer_static_d3_v1` | 2 552 kr | 11 | 232 kr | 2,58 |
| 0 kr | `MATSTRUMP_sushi_gift_ugc_s001h1_v2` | 325 kr | 0 | — | — |
| −409 kr | `MATSTRUMP_sushi_gift_ugc_haikuh2_v1` | 3 805 kr | 12 | 317 kr | 1,34 |
| −617 kr | `MATSTRUMP_sushi_gift_ugc_haikuh3_v1` | 1 949 kr | 5 | 390 kr | 1,02 |
| **−1 001 kr** | `MATSTRUMP_sushi_gift_ugc_012v2_v1` | 1 467 kr | 2 | 734 kr | 0,48 |

Rond 2 hade samma sex; ordningen i botten bytte plats för att fönstret
flyttade (haikuh3 −3 184 → −617: dess dyra dagar föll ur). De andra 101 ligger
under 300 kr och döms inte.

**Etiketter (första veckan per annons): 1 breakthrough av 85 = 1 %** —
oförändrat, inga nya att sätta i rond 3. 22 annonser är för unga: batch #1
(Gilz 044–047, 11 st från 21/9, 1–10 kr var), Axels två **Katarina**-videor
från 24/9 (`09-17 UGC`-adsetet, 85–89 kr var, 1 köp) och Gilz nio mini-clips
048–052 från 25/9 (0–17 kr var). Alla tre grupperna etiketteras 30/9–1/10.

### Fem mönster som datan bär (2026-09-24)

1. **En riktig kreatör med en riktig mottagare slår allt annat.** Nathalie
   (verklig kvinna i eget kök, vännen öppnar paketet och skrattar) gör
   3,4 % köp per landningssidevisning; klippkompilationerna (haiku) 1,1 %,
   AI-bildspelet (012v2) 1,1 %, AI-personen (s001) 3,2 % men under
   break-even. Skillnaden är tro, inte hook: haikuh3 håller publiken
   77 % av klippet och konverterar ändå sämst.
2. **Knapphet med ett faktum bakom finns bara i vinnaren.** "Dom sålde slut i
   november förra året" är den enda brådskan i hela kontot, och den sitter i
   den enda annonsen över break-even med volym. Bygg vidare på den
   (**bekräftad av Axel 2026-09-24**: sushilådan tog slut i november 2025 —
   får användas i copy).
3. **Bild + erbjudande är den billigaste vinsten.** `offer_static_d3`
   (Köp 2 – få 2, sex lådor) gör 6,7 % köp/LPV och +1 204 kr; tio andra
   statics fick aldrig leverans. Jul-bildadsetet står tomt.
4. **CBO:n svälter allt nytt.** `nya20` (20 videor, 2/9) fick **2 kr på 14
   dagar**, `alla17` 587 kr, jul-adsetet 24 kr på tre dygn. 70 av 85
   etiketter är svält, inte dom. Ladda upp färre åt gången; en jul-annons som
   ska läsas behöver en minimispend (Axel sa nej 24/9). Mätt igen 27/9 med
   10 000 kr/dag: Nathalie tar 88 % av sjudygnsspenden, de 22 nya ligger på
   0–89 kr var — mer budget gav henne mer, inte de nya.
5. **Ordervärdet skiljer sig kraftigt mellan annonser** (374–798 kr).
   Erbjudandebilden drar tvåbox-köpare (623 kr); Nathalie drar
   ettbox-köpare (417 kr) men många. Break-even-CPA räknas därför på
   annonsens EGET ordervärde i `matstrumpor/ekonomi.mjs`.

⚠️ **Nathalies hook rate (0,2 %) och hold rate är inte läsbara** — 139
videostarter på 63 047 visningar rimmar inte med 1 124 klick. Sofie i samma
adset visar 86–98 %. Troligen räknar Meta `video_play_actions` annorlunda
för Axels uppladdning (DCO-varianter). Bedöm henne på klick/LPV/köp.

✅ **Kommentarerna läses sedan 2026-09-27** via `META_ACCESS_TOKEN_MATSTRUMPOR`
(Axels egen app, sidan ligger i en annan Business Manager än `META_ACCESS_TOKEN`).
Första läsningen: 4 kommentarer på Nathalie på 32 703 kr — "Material?", en
skeptiker om leveranstid/"kina skräp", en tagg, ett skämt. Inget kluster.
Publiken kommenterar nästan inte; invändningarna får läsas ur köpdatan.

⚠️ **Namnkrocken 2026-09-24/25 (rättad 27/9):** rond 2:s briefer fick 048–053,
och dagen efter gav namnmotorn uppladdaren 048–052 IGEN åt Gilz mini-clips
(den läste inte hubbens Draft-rader). Nio annonser live med rond 2:s nummer;
brieferna omdöpta till **054–058** (053 orörd). `--namn` läser nu logg + fil +
kontot ur senaste avläsningen + hubben live och skriver unionen tillbaka.

---

## Vinklar och format i kontot

**Vinklar som körts:** `gift` (dominerar), `offer`, `curiosity`, `identity`,
`social`, `pain`, `conflict`, `fomo`, `vandning`, `anvandning`, `pris`,
`skamt`, `position`, **`jul`** (sedan 21/9). **Format:** `ugc`, `static`,
`product`, `beforeafter`, `comparison`, `lifestyle`, `textheavy`, `anim`.

`gift` har fått nästan all spend och bär nu en breakthrough. Alla andra
vinklar dog av svält, inte av data — de är oprövade, inte motbevisade.

**`jul` är routingnyckeln:** julmaterial hamnar i jul-adseten. Sedan
21/9 körs 8 julvideor (Gilz 044/046/047) i `jul_video` — 24 kr på tre dygn,
inget läsbart. Rond 2 skickar dit Nathalies julversion (`051`) och en
julbild (`052`) till det tomma `jul_bilder`.

---

## Avatarer (skrivna 2026-09-24, max 4 — var och en med källa)

Ingen kundintervju, ingen kommentarsläsning (nekad) — källorna är kontots
egna hookar, Shopify-ordrarna och vad kreatörerna säger i bild. Håll dem som
arbetshypoteser tills kommentarerna går att läsa.

| Slug | Vem | Källa | Vad som funkar |
|---|---|---|---|
| `presentkoparen` | Kvinna 30–55 som köper till mamma, brorsa, partner eller väninna. Vill vara den som ger "den smarta presenten" | Alla vinnande hookar tilltalar henne: "Jag gav min mamma…", "Min brorsa kommer ALDRIG gissa…", Nathalie "när du ger bort dom här … du visste ju deras favoriträtt". 90/110 ordrar = 2 lådor (en att ge, en till?) | Riktig mottagare som öppnar; "du blir personen som ger de bästa presenterna" |
| `julstrumpefyllaren` | Samma köpare i oktober–december: letar små, roliga saker till julstrumpan och kalendern | Nathalie "spara till julstrumpan", Sofie H2 "den enda sushin som hör hemma i en julstrumpa", Gilz 024 "Gissa vad jag la i julstrumpan?", 036 fick mest av bildbatchen | Knapphet ("sålde slut i november"), julstrumpan i bild |
| `skamtaren` | Den som vill lura någon — kollegan på fikat, barnen, partnern — och se dubbeltitten | haikuh3 "Folk tror alltid att det är riktig sushi när de öppnar lådan", Sofie H1 "jag trodde helt seriöst att det här var riktig sushi", 012v2 "bluffpizzan" | Ätpinnarna, någon som försöker äta strumpan. Oprövad som egen vinkel (rond 2 testar den: `053`) |
| *(fjärde saknas)* | — | Ingen källa än. Skriv inte en påhittad | — |

---

## Döda koncept (rör inte utan ny data)

- **AI-genererade personer** som avsändare (`s001h1_v2`, hela `s`-serien):
  under break-even trots kontots bästa hook rate. Hook-visual-regeln gäller.
- **Listicle "tre skäl" med adjektiv** (`haikuh3`/`h2`): håller publiken,
  konverterar inte. Använd bara delar (hooken) i nya versioner.
- **AI-bildspel utan människa och utan erbjudande** (`012v2`): −1 244 kr.

---

## Nästa steg (i ordning, vinst snabbast först)

⚠️ **Nya vinklar hämtas ur `mekanismer.md` (2026-10-01):** fem mekanismer
mot marknadssofistikeringen (locket, duka fram den, favoriträtten,
byrålådetestet, fem sorter), med hookar som klarat tre-frågorstestet,
anti-positioneringar och skeptikerns dom. En rond som behöver sin "1 av 5
nya" vinkel tar den därifrån, i den ordning filen anger.

0. **Rond 4 (2026-09-30): nya annonser får ingen leverans för att de hamnar i fel adset.**
   `09-17 UGC` (Nathalies) bär 85 % av spenden och 316 av 353 köp på 14 d;
   `nya16` + `jul_video` fick 5 618 kr på 45 annonser, batch #1 35 kr på 11.
   Katarina, uppladdad i `09-17 UGC`, fick ~290 kr per annons på sex dygn.
   Förslaget till Axel: nya videor i `09-17 UGC`. Sex nya briefer (059–064)
   bygger på Nathalie-kroppen och Axels egna kommentarer på miniklippen.
   056 och 057 (levererade 27–29/9) fastnade i `Creative strat review` —
   kön läser nu den statusen också.

1. **Rond 2 (2026-09-24): sex briefer, omdöpta 27/9** — fyra iterationer på
   Nathalie (`054`–`057`, hette 048–051), en julbild (`058`, hette 052), en ny
   vinkel skämtet (`053`). Ligger i Draft i hubben; läs av dag 7 efter live.
2. **Rond 3 (2026-09-27): 0 nya etiketter ⇒ 0 lärdomar ⇒ 0 briefer** (taket
   är antalet lärdomar sedan förra ronden). Ronden gick åt till namnkrocken,
   kommentarerna och tipsen. Nästa rond 30/9 etiketterar batch #1 (11) och
   Katarina (2); 1/10 mini-clipsen (9) — då finns lärdomar att brieffa ur.
3. **Axels beslut 2026-09-24 på rondens förslag:** pausa haikuh3/012v2/haikuh2 —
   **nej** ("håller lowkey inte med", inget skäl); minimispend på `jul_video` —
   **nej** ("inte bra"); "sålde slut i november" — **bekräftat**; råfilen —
   redigerarna har den. Kommentarerna: löst 27/9 med egen app (se ovan).
   Rond 3 föreslår samma tre pausningar igen med nya tal — bara haikuh2 får
   fortfarande spend (2 283 kr / 7 d, ROAS 1,005); de andra två har Meta
   strypt av sig själv (62 resp. 155 kr / 7 d).
4. **"Köp 1 – få 1" mot "Köp 2 – få 2"** som isolerad variabel i två bilder,
   när en rond har lärdomar att peka på.
5. **Katarina** (Axels två videor 24/9, `09-17 UGC`) är den första nya
   kreatören efter Nathalie — 85–89 kr var på tre dygn, ett köp. Etikett 30/9.
6. **Norge** (2026-09-27): butiken är klar på /nb med NOK och fri frakt, och
   Axel satte budgeten **1 000 kr/dag** samma dag. Kampanjen `MATSTRUMP_NO_SALES`
   och de fyra UGC-videorna (Nathalie, Katarina ×2, Sofie H1) är förberedda i
   `matstrumpor/marknader/norge/` men **inget är byggt i kontot**: token:en får
   inte skriva i nya kungen och HeyGen saknar api-krediter (båda mätta samma
   dag, båda Axels klick). Körordningen står i `norge/README.md`. Break-even i
   Norge går inte att räkna förrän den nordiska landade kostnaden finns i
   `matstrumpor/cogs.json` (frågan till leverantören:
   `matstrumpor/marknader/LEVERANTOR-FRAGA.md`).
