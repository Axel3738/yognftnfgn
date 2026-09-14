# Produktjakt 2026-09-13 (vecka 37, söndag) — V3, dag 3

## Steg 0 — lärde FÖRE sökningen

### 0A. Axels svar (7 nya på gårdagens batch, 5 obesvarade) → 42 svar totalt: 29 ja / 7 kanske / 6 nej

| Dom | Produkt (09-12) | Orsak | Läsning |
|---|---|---|---|
| ja | Båthuven 600D trailerbåt 17–19 fot · Kamadohuven 600D · Kajakhuven formsydd | — | tre skyddsformer på nya objekt — H01/H04 lever i klicken |
| ja | Minikedjesågen för Makita-batteri | — | **första ja på en H12-rad** (maskinen på ägarens batteri) — trots piratrisk i heron |
| ja | Värmesulorna · Värmehandskarna för älgpasset | — | kroppsligt i säsongsjobbet (E_VADER_SASONG) — samma som Värmesitsen 09-11 |
| ja | Uppvärmda fågelbadet | — | H09 djur/vatten ute — tredje ja i raden (vattenskål, hönstak, fågelbad) |
| (obesvarade) | Krukväxthuven 3-pack · Bikupans vinterjacka · Maskinhyllan · Ljusslingevindorna · Makita-hållaren | — | de fem LÅG-raderna. Obesvarat ≠ nej — men alla fem hade golv under oss eller lågt upplevt värde. Läsning: **Axel hoppar över det som inte ser ut som sitt pris**; H11-raderna (ordning/flerköp) fick ingen reaktion alls. |

Inga nej i dag → ingen orsakstyp att skriva. `vikter.json`: 0 stopp, 29 lyft (bevisnivå 2). `koncept.json`: 255 koncept, 7 svar inlästa.

### 0A′. Butiken: Axel la in 16 nya produkter 09-12 (katalog-live 207 aktiva, +15 mot i går)

13 är forskningsprodukter från 09-10/09-11-batcherna, alla utan kampanj i kontot än. **Axels pris mot vårt förslag:**

| Butiken (pris) | Vårt förslag | Koncept |
|---|---|---|
| Kapell Till Snöslunga 459 | 599 | K0224 |
| Hönsgårdsduk 145 × 109 459 | 999 | K0205 |
| ATV-Kapell 3XL 579 | 899 | K0234 |
| Kajakhållare 2-pack 599 | 499 | K0239 |
| Motorlås rostfritt 909 | — (lins D) | K0236 |
| Snöflingor 25-pack 249 | 349 | K0237 |
| Snöskyffel utan batteri 2 349 | 1 799 | K0238 |
| Solcellsladdare 10 W 559 | — (09-10) | K0173 |
| Spabadskapell 210D 619 | — (lockskydd kanske 09-10) | K0053 |
| Täljset 30 delar 869 | 899 | K0243 |
| Uppvärmd Vattenskål 2,2 L 849 | 699 | K0232 |
| Vedställskapell 529 | — (09-10) | K0135 |
| Värmesits 45 × 90 599 | 599 | K0240 |
| Blockljus 3-pack 479 · Värmeljus 24-pack · (LED Campinglampa, MC-kapell = gamla) | — | ej våra |

Gjort: `facit/launch-koppling.json` (butikstitel → product_id) och 13 taggrader i `facit/historik-taggar.json` så att kampanjerna klassas samma morgon de dyker upp; `koncept.json` bär `butik` (titel, pris, datum) per koncept. Prisavvikelserna (hönsgårdsduk −54 %, snöslunga −23 %, ATV −36 %, vattenskål +21 %, snöskyffel +31 %) är facit på vår prissättning — läses av när Meta-utfallet finns.

### 0B. Metas facit (snapshot `facit/snapshots/2026-09-13.json`: 19 REAL WINNER · 21 REAL LOSER · 34 INSUFFICIENT · 2 UNTESTED; inga nya kampanjer, inga okopplade)

| Launch | 09-11 → 09-12 → 09-13 spend | köp | ROAS nu / BE | Lutning senaste dygnet | Bekräftad? |
|---|---|---|---|---|---|
| Taköverdraget husvagn (V1) | 2 663 → 7 300 → **15 166** | 15 → 47 → **71** | 5,35 / 1,63 | +7 866 kr, +24 köp — CPA 328 | prel. HIGH — snapshot 09-11 + 09-14 ger bekräftelsen |
| Termoskyddet husbil (Axels, 09-11) | — → 1 511 → **3 417** | 11 → **19** | 3,22 / 1,61 | +1 906 kr, +8 köp | prel. HIGH |
| Adventskalendern racingbilar (V3) | 3 308 → 5 189 → **7 398** | 16 → 20 → **24** | 1,91 / 1,62 | +2 209 kr, +4 köp — CPA 552, ROAS faller (3,06 → 2,33 → 1,91) | prel. — **närmar sig BE** |
| Isolerade Utekattkojan (V2) | 2 890 → 4 152 → **6 237** | 9 → 13 → **13** | 1,73 / 1,62 | **+2 085 kr, 0 köp** — ROAS 2,46 → 2,60 → 1,73 | prel. — **ett dygn utan köp; nästa snapshot avgör** |
| Stegstödet 2-pack | 1 974 → 1 976 | 2 → 3 | 0,97 | stillastående (pausad/strypt) | EARLY_SIGNAL negativ |
| Solcellslarmet 2-pack | 1 494 → 1 991 | 1 → 1 | 0,39 | +497 kr, 0 köp | TOO_EARLY negativ |
| Staketstolpslagaren 2-pack | 1 875 → 1 875 | 1 | 0,91 | stillastående | TOO_EARLY negativ |

Läsning: **skalningen skiljer vinnarna åt.** Taköverdraget och termoskyddet håller ROAS när spenden dubblas; kojan och kalendern tappar när Axel skalar (kojan noll köp på 2 085 kr). Det är samma mönster som H06/H03 varnar för (look-alikes under vårt pris + tunn hyllfrånvaro): kojan kostar 789 mot kopior 157–504. Ingen dom i dag — två snapshots ≥ 3 dygn (09-11 + 09-14) krävs. Skrivs som **bevakning** i LEARNING_STATE-raden.

### 0C. LEARNING_STATE.md (omskriven 2026-09-13, läst)

Inga nya klasser (19/21/34/2), signalerna oförändrade; vinstbidragen: taköverdraget 34 631 kr (näst största i kontot efter spöklämman på 34 025 — på fyra dagar), termoskyddet 3 423, kalendern 1 305 (från 2 282), kojan 435 (från 2 520). Hypoteser: H01/H02/H04 stärkta i klicken (tre ja på skyddsformer + båthuven 1 399 kr); H12 första ja; H09 tredje ja; H11 noll reaktion (fem obesvarade). Motbevisade: 8 (oförändrat). Prediktion vs verklighet: 4 dömda launcher, alla REAL_WINNER prel. — men två av dem har negativ lutning i dag.

### 0D. Säsong (`korningar/2026-09-13/SASONG.md`)

NOW: första frost Norrland 0,7 v / Svealand 4,6 / Götaland 5,1 · poolstängning 2,4 v · älgjakt syd 3,6 v · uppställning husvagn + båtupptagning 3,9 v · MC-avställning 4,6 v · lövfällning 4,6 v · vedsäsong 4,6 v · robotindockning 6,0 v · vintermatning fåglar 6,0 v · första snö Norrland 6,0 v / Svealand 9,9 v · fars dag 8,0 v · utedjurens fönster stänger 9,0 v · 1 december 10,3 v · isläggning 10,4 v. EARLY parkerat: snölast 18,4 v, isfiske, sportlov.

## Linserna i dag (efter gårdagens "i morgon": exploration under minimum → en H10-lins; H09 med hästhinken; inga hållare där kedjan säljer styckvis)

| Lins | Struktur | Slot | Hypotes |
|---|---|---|---|
| K | "Visste inte att det fanns" — ny form på ägt objekt | exploration | H10 |
| L | Djur och vatten ute när det fryser (häst, damm, höns, katt) | säsong | H09 (+H08) |
| M | Q4-gåva med hårt datum (barnbarnets kalender nytt tema, hobbylådan till mannen) | säsong | H05 |
| N | Formsydd form på NYA maskinobjekt (poolvärmepump, vedklyv, promenadscooter, jordfräs) — max 4 rader | exploitation | H01/H02/H04 |

## Steg 1–4 — fyra linser, 13 kandidater → 13 klarade grindarna → batch 11

| Lins | Sökt | Levererat | Strukna (skäl) |
|---|---|---|---|
| K (H10, ny form) | 15 fraser, 13 golvsökningar, 8 sidhämtningar | 3: Regnkedjan 3,8 m, Snösmältmattan för trappan, Trädansiktet | utrullbar stuprörsförlängare / fruktplockare / takraka / rännborste / laddkabellås = kedjeform (Granngården, Clas, Biltema, Mekonomen) · skorstensballong / postlådelarm / fönstermatare = ingen AliExpress-listning · sopkärlsrem = Fyndiq-golv + BE-CPA < 190 · garageportsdekor = levererad 09-11 |
| L (H09, djur + vatten) | 24 fraser, 12 svenska källor | 3: Dammvärmaren 500 W, Ekorrsäkra fröautomaten, Automatiska hönsluckan | **hästens hinkvärmare: 8 fraser, ingen listning — svenska systemet är 24 V (Isobar/Willab 1 299–1 349), 230 V i hagen avråds → raden parkeras tills en 24 V-listning finns** · elvattenkopp (tryckvatten + montering, Granngården 16 modeller) · hönsvatten uppvärmt (bara 20 W-basen) · kattlucka (Jula/Clas samma form) · igelkott (inget < 20 USD) · kaninflaska / vinterholk / dammluftpump (inga listningar, solcell död i vinter) |
| M (H05, Q4-gåva) | 16 fraser | 4: Highland Cow-kalendern (17,33 USD — backloggens < 20-villkor uppfyllt), Husbilskalendern 24 retrobussar, Rullknivslipen i trä, Ädelstenskalendern | golfkalender (Fyndiq 315 / CDON 649 samma form) · flugbindningsset utan städ (ser ut som 150 kr) · knivbyggsats (bara skal) · fågelholksbyggsats (Vivara-golv, lågt upplevt värde) · 3D-träpussel (Luffarschackets struktur, REAL LOSER) · 2D-akrylkalendrar traktor/grävmaskin (platta hängen) · byggklossar (Magnetplattor INSUFFICIENT, LEGO 349 golv) |
| N (H01/H02/H04, maskinobjekt) | 6 fraser, 13 produktsidor, 12 heron | 3: Poolvärmepumpens vinterhuv, Vedklyvshuven 210D, Promenadscooterns regnkapell | kompostkvarn (packshots, objekt inne) · golfbil (B2B-ägare) · hydrofor (US-form, svenska pumpar i pumphus) · sandfilterpumphuv (billigt objekt) · terrassvärmarhuv (felträff) · jordfräs/sopmaskin (ej sökta, formtak) · elcykel (kedjeform) |

Grindarna släppte alla 13 (LIVE_VERIFIED, BE-CPA ≥ 190, ingen K0). `rank.py` fyllde 3 exploitation / 3 exploration / 5 säsong = 11; **utanför batch på plats:** Ekorrsäkra fröautomaten (Vivara 249,90 under oss, LÅG) och Husbilskalendern 24 retrobussar (ingen svensk aktör, MEDEL — står först i kön om Axel vill ha fler kalendrar). Exploitation under minimum (3 < 5) — inte utfyllt; skyddsformer 3 av 11.

## Batchen (sida v18, ark `Leverantorsoffert-2026-09-13.xlsx`, prisfälten tomma)

| # | Produkt | Slot | Objekt · form · arketyp | Pris · BE-CPA | Säsong | Ankare / golv | Konf. | Största risken |
|---|---|---|---|---|---|---|---|---|
| 1 | Vedklyvshuven 210D (K0256) | exploit | NYTT vedklyven 3–8 tkr · överdrag · B | 499 · 269–311 | vedsäsong 4,6 v | Jula/Clas hade formen och tog bort den — lucka / — | MEDEL | sydd för 12-tons klyv; bästa heron i dag (klyv under skärmtak i regn) |
| 2 | Promenadscooterns regnkapell (K0257) | exploit | NYTT elskotern 10–30 tkr, ägare 70+ · överdrag · B | 599 · 308–361 | höstregn 3,9 v | promenadskoter.se 895–1 095, Blimo 999 (1,67×) / 999 | MEDEL | ägarantal ej mätt |
| 3 | Poolvärmepumpens vinterhuv (K0258) | exploit ASYM | NYTT poolvärmepumpen 15–40 tkr · överdrag · B | 599 · 261–323 | poolstängning 2,4 v | poolklubben 645/695 (1,16×) / 645 | MEDEL | ankare tunt; 129 000 pooler (Svenska Badbranschen 2023); inbränd text i heron |
| 4 | Trädansiktet — gubben i trädet (K0259) | explore | NYTT trädet på tomten · dekor · H | 349 · 207–232 | evergreen | Relaxdays 349,90 (1,0×) / 349,90 | LÅG | renaste H10-testet (klistermärkenas struktur); lågt upplevt värde |
| 5 | Regnkedjan 3,8 m, 12 koppar (K0260) | explore | NYTT stupröret · annat · H | 899 · 195–323 | lövfällning 4,6 v | Gecko koppar 2 150 (2,4×) / plåt-look-alikes 369–489 | MEDEL | look-alikes; landad 576–704 |
| 6 | Snösmältmattan för trappan (K0261) | explore ASYM | NYTT trappan och entrén · annat · H | 1 299 · 746–846 | första snö 6,0 v | Safestep 2 000 (1,54×) / Ebeco utgången hos Clas | MEDEL | **230 V utan verifierad CE — kräver Axels ok**; flerköp (en per steg) |
| 7 | Dammvärmaren 500 W med termostat (K0262) | säsong | trädgårdsdammen · annat · E | 899 · 575–634 | isläggning 10,4 v | IceFree Thermo 1 645 (1,83×) / Pondteam 735 utan termostat | MEDEL | heron visar US-kontakt |
| 8 | Automatiska hönsluckan med ljussensor (K0263) | säsong | hönsen · annat · E | 1 299 · 403–566 | utedjur 9,0 v / mörkret 25 okt | kedjan 1 499–2 120 (1,63×) / 1 499 | MEDEL | montering (förlorarsignal), BE-ROAS 2,68 |
| 9 | Rullknivslipen i trä (K0264) | säsong | NYTT mannen vid skärbrädan · annat · G | 799 · 461–522 | fars dag 8,0 v | HORL 2 1 995 (2,5×) / CDON 343–419 | MEDEL | objekt inomhus (förlorarsignal objekt_ute = nej) |
| 10 | Highland Cow-kalendern 3D, 24 figurer (K0265) | säsong ASYM | barnbarnet 3–8 år · kalenderlåda · G | 499 · 223–273 | 1 december 10,3 v | LEGO/lekia 349–599 / ingen svensk aktör | MEDEL | 24 figurer i heron kräver beskärning; racingbilarnas ROAS faller (1,91) |
| 11 | Ädelstenskalendern, 24 grävblock (K0266) | säsong ASYM | NYTT barnbarnet 6–10 år · kalenderlåda · G | 349 · 250–268 | 1 december 10,3 v | 349 / Amazon.se ~260 samma form | LÅG | lucka 0 |

Alla 11 LIVE_VERIFIED i dag (produktsida öppnad, hero nedladdad och sedd, pris ur sökträffen, UTC-stämpel i `v3/kandidater-*.json`). K0 mot `v3/katalog-live.txt` (207 aktiva), `koncept.py sok`, kontot — ingen dubblett. Ägarantal "ej mätt" på NYTT-objekten utom poolen (129 000, källa i filen).

## Parkerade (`backlog.json`)

Hästens hinkvärmare — söks bara som **24 V**-system (svenska hagar) · Husbilskalendern 24 retrobussar + Ekorrsäkra fröautomaten — utanför batch på plats, först i kön i morgon · igelkottshus (inget < 20 USD, tredje gången) · utekattens värmeplatta (stängd för AliExpress).

## Metodfynd i dag

1. **Axel svarar inte på LÅG-rader.** Fem obesvarade i går = exakt de fem med golv under oss eller lågt upplevt värde. Obesvarat är en signal: **leverera hellre 8 MEDEL än 12 med LÅG-svans.**
2. **Skalning skiljer vinnare från vinnare.** Kojan (0 köp på +2 085 kr) och kalendern (ROAS 3,06 → 1,91) tappar när spenden dubblas; taköverdraget och termoskyddet håller. Hypotesen: hyllfrånvaro + märkesankare bär skalning, look-alikes under vårt pris gör inte det (H06 får sitt första motbevis om kojan faller under BE 09-14).
3. **Axel prissätter annorlunda än modellen** (13 launcher: −54 % till +31 % mot förslaget). När kampanjerna dyker upp jämförs hans pris mot vårt — det är facit på K7.
4. **SAK-nyckeln igen:** "Barnbarnet — adventskalendern" hade slagit ihop Highland Cow med Dinosaurierna (K0126). Objektfältet skrevs om före `v3_till_fynd.py`. Regeln i agentprompten (unikt före tankstrecket) räcker inte när objektraden i `objekt.json` själv har tankstreck — `koncept._sak` bör ta med formen och temat, inte bara objektet.
5. **Hästen är ett 24 V-objekt.** Svenska hagar kör lågspänning (Isobar/Willab); 230 V-listningar är fel form. Skrivet på objektraden.

## Tio kontrollfrågor (MASTERPROMPT §9)

1. Kattkojan: H09-linsen sökte utekatten — kojor K0 (launchad), kattlucka = kedjeform. Ja.
2. Taköverdraget: H04 aktiv; ingen > 1 000-rad i dag utom snösmältmattan/hönsluckan (1 299, inte skydd) — inget pris-tak dödade något. Ja.
3. Adventskalendern: två kalendrar levererade (Highland Cow 17,33 USD klarade grinden i dag), STOPPORD släppt. Ja.
4. Verktygen: inga verktygsrader utan hypotes (rullknivslipen är G_Q4_GAVA med ankare 2,5×). Ja.
5. Verktyg levererat: ett, som gåva med datum och ankare. Ja.
6. Deadline per rad: 10 av 11 NOW (2,4–10,4 v), trädansiktet evergreen (märkt). Ja.
7. Ankare per rad: 9 mätta med URL i kandidatfilerna; vedklyvshuven "lucka" (kedjan tog bort formen), trädansiktet 1,0×. Ja.
8. Hero per rad: alla 11 sedda; tre anmärkta (US-kontakt, inbränd text, beskärning). Ja.
9. K0 på SAK: katalog-live 09-13 (207 aktiva, +16 nya lästa), koncept.py sok, kontot. Ja.
10. Taggar + per_kriterium + koncept-id per rad (K0256–K0266); vikter/LEARNING_STATE omräknade FÖRE sökningen; LEARNING_STATE-raden skriven. Ja.

## Definition of done

- [x] 0A 7 nya svar inlästa (inga nej i dag); 5 obesvarade lästa som signal
- [x] 0B Metas facit hämtat (`facit/snapshots/2026-09-13.json`), utfall.json + koncept.json uppdaterade; 13 butikslaunches kopplade + taggade (kampanjer ej i kontot än)
- [x] 0C LEARNING_STATE.md omskriven och läst; prediktion vs verklighet + lutning kommenterad; hypoteser.json oförändrad (inget nytt bevis med två snapshots)
- [x] 0D SASONG.md skriven; bara NOW-fönster jagade
- [x] Discovery ägare → objekt → friktion, 4 linser (K/L/M/N), 3/3/5 — exploitation under minimum, inte utfyllt
- [x] Varje rad LIVE_VERIFIED i dag med UTC-stämpel, hero sedd
- [x] Svenska golvet läst med URL per rad (två "lucka/ej mätt", utskrivet)
- [x] Materialklass per rad
- [x] Ekonomi som intervall, BE-CPA ≥ 190 på varje rad
- [x] Batch 11, per slot enligt rank.py, ingen utfyllnad
- [x] Ark byggt (prisfälten tomma) + sida publicerad mot samma URL, v18, downloads + db
- [x] koncept.json bär K0256–K0266
- [x] LEARNING_STATE-raden + STATUS.md + RUTIN-KVITTO.md; committat och pushat
- [x] Discord-rapport skickad
