# Produktjakt V2 — fingeravtrycket i drift (2026-09-04)

Uppföljning till `docs/temu-vinnar-dna.md`. Den här filen gör ingen ny analys av
vinnarna — den **kör** fingeravtrycket (avsnitt 12 där) som en jakt: ägarjakt →
objektjakt → materialjakt, åtta gater i ordning, ett dataset med varje kandidat
och varje avslag.

Läsvänlig version (samma innehåll):
https://claude.ai/code/artifact/37593123-a46e-4d7d-b2c7-c6cf5fa44610

Allt underlag ligger i `docs/temu-jakt-v2/jakt/` — klusterfiler, hyllverdikt,
dataset (`dataset.json` + `dataset.csv`), skripten och instruktionerna som
agenterna följde. Ingen siffra i den här rapporten finns som inte också finns
i en av de filerna.

---

## 0. Läget — läs det här först

**Två av åtta gater kunde inte köras.** Temu blockerade containerns IP från
~00:58 UTC 2026-09-04 (tomt JS-skal utan JSON-LD för alla User-Agents, alla
landssajter, alla proxyvägar; senast provat 06:43 UTC, fortfarande blockerat).
Det slår ut exakt de två gater som fingeravtrycket väger tyngst:

| Gate | Läge | Vad som saknas |
|---|---|---|
| 1 OBJEKTET | ✅ körd på alla 519 | — |
| 2 PRESENS | ✅ körd på alla 519 | — |
| 3 HYLLAN | ✅ körd; **verifierad** med kedje-/fackhandelssök för 39 koncept (64 listningar) i `jakt/hylla/h1–h5.json`; övriga "ur sökutdrag/minne" | Biltema svarar 403 överallt — deras hylla är läst ur sökutdrag, aldrig ur sajten |
| **4 MATERIALET** | ❌ **ej körd** | Ingen leverantörsvideo sedd. 0–3 s, hero, inbränd text: **UNKNOWN för alla** |
| **5 EKONOMI** | ❌ **ej körd** (Temu-pris saknas för 513 av 519) | Landad kostnad, multipel, BE-CPA: UNKNOWN. Sex listningar har pris ur tidigare hämtning |
| 6 VARIANT | ✅ körd på slug-titel/sökträff | SKU-listan (bildbeskrivningarna) ej läst |
| 7 HOOK | ✅ | — |
| 8 PUBLIK | ✅ | — |

**Därför finns ingen skarp Tier A.** Fingeravtryckets regel är att materialet
ska vara sett (leverantörsvideon i bruk inom 3 s, textfri hero) innan något
kallas testklart. De fem starkaste kandidaterna redovisas som
**"Tier A (villkorad)"** — hyllan är verifierad, presens/variant/publik håller,
strukturen matchar — och blir skarp A eller faller till B/C den dag gate 4 och 5
körs. Skripten för det finns och är testade (`jakt/hamta-ko.py` → `jakt/temu-ld.py
--video`, sedan `jakt/material/instruktion.md`); det enda som saknas är att
Temu släpper IP:n.

Det som **inte** är UNKNOWN är själva jakten: 96 ägda objekt kartlagda, 519
listningar hittade, 374 avslagna med orsak, och en hylla som är verifierad på
riktigt för de koncept som överlevde.

---

## 1. Objektuniversumet

Tretton kluster, 96 ägda objekt, varje objekt med vad ägaren behöver göra med
det (skydda / fästa / rengöra / organisera / förvara / säkra / underhålla / nå /
transportera / förbättra / bekvämare) och om friktionen finns i september–oktober.
Hela tabellen: `jakt/objektuniversum.md` avsnitt 1. Klustren:

| Kluster | Objekt (urval) | Rå | A | B | C | ELIM |
|---|---|---|---|---|---|---|
| bat | båt under presenning, utombordare på trailer, båttrailer, kajak, brygga | 31 | 0 | 5 | 8 | 18 |
| grasklippare | robotgräsklippare, åkgräsklippare, lövblås + hängränna | 28 | 0 | 5 | 1 | 22 |
| handmaskiner | motorsåg, röjsåg, trimmer, lövblås, ved + borrmaskin | 18 | 0 | 0 | 9 | 9 |
| vatten | IBC-tank, regntunna, utekran, stuprör, damm, dammpump | 34 | 0 | 1 | 12 | 21 |
| husvagn | husvagnen uppställd, husbilen ute, släpvagnen, dragkroken | 34 | 0 | 1 | 3 | 30 |
| mc | MC avställd, moped, ATV, snöskoter | 27 | 0 | 1 | 5 | 21 |
| pool | fast spabad (lock, insteg, vatten), poolvärmepump, pool som stängs | 40 | 2 | 6 | 7 | 25 |
| ved | vedstället, presenningen, braskaminen, eldstaden | 22 | 2 | 1 | 6 | 13 |
| jakt | handkikaren, jakttornet, geväret, åtelkameran, jakthunden | 43 | 1 | 9 | 14 | 19 |
| tomt | sopkärlet, brevlådan, flaggstången, grinden, uppfarten, altanen | 27 | 0 | 3 | 4 | 20 |
| hus | takränna, stuprör, stege, luftvärmepump, garageport, fönster | 52 | 0 | 10 | 1 | 41 |
| garage | elbil + laddbox, takbox, däck, dragkrok, garaget | 33 | 0 | 0 | 4 | 29 |
| djur | hund (bil, koja, torkning), höns, häst, utekatt, fåglar, skadedjur | 130 | 0 | 9 | 15 | 106 |
| **Summa** | | **519** | **5** | **51** | **89** | **374** |

(B = 23 huvudlistningar i 17 koncept + 28 dubblettlistningar av samma koncept.
Talen är ur `dataset.json` efter hyllverifiering och slutdom.)

Sökfraserna — körda och **inte** körda (budget/blockering) — står per kluster i
`jakt/objektuniversum.md` avsnitt 2. Objekt som söktes men gav noll Temu-träffar,
och objekt i universumet som aldrig söktes, står i avsnitt 5 där.

---

## 2. Tratten

```
RÅA LISTNINGAR          519
→ EFTER OBJEKT          417   (−102: inomhusförvarat, ej ägt, kroppsnära/personligt, "objekt" = ett projekt)
→ EFTER PRESENS         373   (−44: sommarobjekt, skadan i nov–feb, latent behov, objektet urkopplas)
→ EFTER HYLLAN          186   (−187: största fällaren — kedjan eller fackhandeln har samma form billigare)
→ EFTER MATERIAL        182   (gaten EJ KÖRD — 4 fällda på tidigare sedda bilder; resten passerar som UNKNOWN)
→ EFTER EKONOMI         156   (−26 på titelpris/US-pris; landad kostnad UNKNOWN för resten)
→ EFTER VARIANT         127   (−29: USA-mått, mått ägaren måste ta, SKU per modell)
→ EFTER HOOK            127   (0 fällda — hooken är aldrig flaskhalsen)
→ EFTER PUBLIK          122   (−5: ägarklass < 100 000 eller fel köpare)
→ TIER A (villkorad)      5   (skarp Tier A: 0 — gate 4 och 5 ej körda)
```

Trattens "EFTER MATERIAL" och "EFTER EKONOMI" är alltså **inte** riktiga
avsmalningar — de släpper igenom UNKNOWN. Räknar man strikt (bara PASS går
vidare) stannar tratten på 0 efter material. Det är sant, och det är därför
toppgruppen heter villkorad.

Vad som fällde per gate (ur `dataset.json`, `eliminated_at`):

| Gate | Fällda | Största mönster |
|---|---|---|
| shelf | 179 | kedjan har formen (fordonsavställning, överdrag i kedjetyg, takavvattning, däck/verkstad); fackhandel som hylla i jakt |
| object | 103 | inomhusobjekt (verkstadsbänk, däckställ, slang), djur-klustrets inomhusbäddar, kit/projekt |
| presence | 49 | sommarobjekt, skada i november–februari (kranskyddsfällan), latent behov |
| economics | 20 | > 1 000 kr (plog, locklyft, helöverdrag) eller < 199 kr utan hävstång |
| variant | 16 | tum-mått, bultmontering, "passar de flesta" |
| audience | 2 | snöskoter, vattenskoter |
| material | 1 | bromsskivelås: 0–3 s är ett titelkort |
| negative_space | 1 | dödskalle-kulskydd (want) |

Fullständiga mönster med exempel: `jakt/objektuniversum.md` avsnitt 4.

---

## 3. TIER A (villkorad) — fem kandidater

Ordningen är strukturmatch (fingeravtryckets åtta punkter, material och presens
tyngst) efter hyllverifiering. **För alla fem gäller:** TEMU-MATERIAL, 0–3-SEKUNDERSBEVIS,
TEMU-PRIS och EKONOMISKT UTRYMME är **UNKNOWN** — inte gissade. Det svenska
priset nedan är det pris hyllan *tillåter*, inte ett pris kalkylen *bevisat*.

### A1. Lockskydd (cover cap) till fast spabad

| | |
|---|---|
| PRODUKT | Skyddsöverdrag som spänns över det styva isolerade spalocket, PU/Oxford |
| TEMU-URL | https://www.temu.com/se/g-601099619866532.html (dubbletter 601099524126091, 601099527353718 — välj den med bäst video) |
| OBJEKT / ÄGARE | Spalocket på ett fast utomhusspabad. Ägaren har redan spabadet — och redan bytt ett lock, eller vet vad det kostar (8 495–12 695 kr, Spabadsbutiken) |
| BEFINTLIG FRIKTION | Löv, regn, snö och UV på locket september–oktober; vinylen spricker i sömmarna, skummet suger vatten, locket blir tungt och vattensjukt |
| GAMLA SÄTTET | Ingenting, eller en presenning som blåser av / samlar vatten |
| PRODUKTENS ROLL | Skydda: ett lager över det dyra locket, fastspänt |
| VARFÖR ANNONSEN INTE BEHÖVER SKAPA BEHOV | Löven ligger på locket *nu*; varje spabadsägare ser det när han går förbi. Samma presensstruktur som motorhöljet (motorn står ute, löven faller) |
| TEMU-MATERIAL | UNKNOWN — video ej hämtad (blockerad) |
| 0–3-SEKUNDERSBEVIS | UNKNOWN |
| SVENSK HYLLSTATUS | **Verifierad PASS** (`hylla/h4.json`): Biltema/Jula/Clas/Rusta saknar formen (Julas "spaskydd" är ett tält, Hornbachs ett helöverdrag för uppblåsbart spa). Bauhaus/Bygghemma: Denform 1 495 kr. Fackhandel: Spabadsbutiken Cover Cap deLuxe 1 295 kr, Kuben 1 290 kr. ⚠️ PriceRunner visar också "Oxford Spa Cover Cap" 499 kr och Denform Lux 785 kr från ej utläst säljare — samma form finns alltså billigt online, precis som Julas 85 g/m²-täcke fanns bredvid motorhöljet |
| TEMU-PRIS | UNKNOWN |
| RIMLIGT SVENSKT PRIS | 699–799 kr (under ankaret 1 295, över marketplace-nivån 499–785 — kräver synlig spec, t.ex. 600D + spännen) |
| EKONOMISKT UTRYMME | UNKNOWN (kräver Temu-pris; ≥ 2,4× landad och ≥ 300 kr är villkoret) |
| VARIANTFRIKTION | Mått (200×200, 210×210, 230×230 cm är standard). Ägaren vet ungefär — inte utantill. Antal SKU:er ej läst. Detta är kandidatens svagaste punkt mot fingeravtrycket (punkt 5) |
| ≤ 7 ORD ÄGARHOOK | "Ligger löven på ditt spalock?" |
| STRUKTURMATCH | 78 (agentens bedömning, ej justerad — materialet okänt) |
| TRE SKÄL DEN MATCHAR VINNARNA | 1. Ägt, utomhusstående, dyrt objekt med synlig höstfriktion (motorhöljet, IBC-överdraget). 2. Hyllan är tom hos kedjorna och fackhandeln ligger 1,6–1,9× över (spöhållarens Biltema-lucka). 3. Priset hamnar i > 500-zonen där ingen vinnare förlorat |
| STÖRSTA SKÄLET DEN KAN FALLA | Passformen: ett lockskydd som inte sitter fast i höststorm ger returer, och måttvalet är en tröskel. Plus: femte överdraget i raden (kategorinovelty 70) |
| KONFIDENS | MEDIUM (hylla verifierad; material och pris osedda) |

### A2. Kikarsele / bröstväska med regnskydd (jakt)

| | |
|---|---|
| PRODUKT | Camo bröstväska med kikarsele, avståndsmätarficka och regnskydd |
| TEMU-URL | https://www.temu.com/se/g-601099566089885.html (dubblett 601099523680456 — ⚠️ visade "Ej tillgänglig för köp" på /se 01:05 UTC, kan vara skalet) |
| OBJEKT / ÄGARE | Handkikaren. Varje jägare på pass har en i nackrem; 271 000 jaktkort (siffran ur klusterrapporten `jakt.md`, källa ej verifierad) + fågelskådare |
| BEFINTLIG FRIKTION | Nackremmen skär, kikaren slår mot bröstet när man går, regn på okularen i passet |
| GAMLA SÄTTET | Nackremmen som följde med kikaren; kikaren i jackfickan |
| PRODUKTENS ROLL | Bekvämare + skydda: bär kikaren på bröstet, torr |
| VARFÖR ANNONSEN INTE BEHÖVER SKAPA BEHOV | Älgjakten pågår september–oktober; nacken gör ont i dag. Kroppslig payoff som axelbältet (kontots bevisade "bär tyngden rätt"-struktur) |
| TEMU-MATERIAL | UNKNOWN |
| 0–3-SEKUNDERSBEVIS | UNKNOWN |
| SVENSK HYLLSTATUS | **Verifierad PASS** (`hylla/h1.json`): ingen av Biltema/Jula/Clas/Rusta säljer kikarsele eller kikarväska. Fackhandel: Blaser kikarväska med sele 999 kr, Härkila Deer Stalker 1 295 kr. ⚠️ Billigaste referens är en ren resårsele: Max-On 149 kr (Hylte), Vortex 390 kr — annonsen måste sälja *väskan och regnskyddet*, inte selen |
| TEMU-PRIS | UNKNOWN |
| RIMLIGT SVENSKT PRIS | 399–499 kr (ankaret 999 tillåter det; Max-On 149 kräver att produkten syns vara en väska) |
| EKONOMISKT UTRYMME | UNKNOWN |
| VARIANTFRIKTION | En storlek, justerbara remmar (ur titel). Kikarens mått spelar ingen roll. Fingeravtryckets punkt 5 uppfylld |
| ≤ 7 ORD ÄGARHOOK | "Får du ont i nacken av kikaren?" |
| STRUKTURMATCH | 72 |
| TRE SKÄL DEN MATCHAR VINNARNA | 1. Publiken är exakt fingeravtryckets (man 45–70, jakt = fritidshus/landsbygd) och kikare + camo är omisskännligt i flödet. 2. En variant, ingen montering, ingen parameter. 3. Kroppslig friktion i dag (axelbältet), inte en framtida skada |
| STÖRSTA SKÄLET DEN KAN FALLA | Ser produkten ut som en rem i annonsen faller prisankaret till 149 kr. Och: axelbältet krävde UGC för att bevisa den kroppsliga payoffen — leverantörsvideon (osedd) kanske inte räcker |
| KONFIDENS | MEDIUM |

### A3. Spa-räcke / handledare till fast spabad

| | |
|---|---|
| PRODUKT | Stålräcke 48", basen skjuts in under spabadets kabinett, tål 100 kg |
| TEMU-URL | https://www.temu.com/se/g-601099575291512.html |
| OBJEKT / ÄGARE | Kanten/insteget på ett fast spabad (90 cm högt). Ägaren 45–70 — och hans äldre föräldrar |
| BEFINTLIG FRIKTION | Kliva i och ur i mörker, kyla och halka i oktober — inget att hålla i |
| GAMLA SÄTTET | Hålla i lockkanten eller en person; ingenting |
| PRODUKTENS ROLL | Säkra: ett handtag där det inte finns något |
| VARFÖR ANNONSEN INTE BEHÖVER SKAPA BEHOV | Halt, mörkt, kallt insteg är oktobers verklighet för varje spabadsägare. Rädsla/fall-komponent — samma drivkraft som kameran (rädsla) fast med objekt i bild |
| TEMU-MATERIAL | UNKNOWN |
| 0–3-SEKUNDERSBEVIS | UNKNOWN |
| SVENSK HYLLSTATUS | **Verifierad PASS** (`hylla/h4.json`): ingen kedja säljer spa-räcke; Bauhaus säkerhetsgrepp Denform 1 795 kr; Folkpool SPA Side LED Handrail 2 995 kr. ⚠️ VEVOR ledstång 860 kr på PriceRunner (marketplace) i samma form |
| TEMU-PRIS | UNKNOWN |
| RIMLIGT SVENSKT PRIS | 899–999 kr (ankare 1 795–2 995; VEVOR 860 sätter golvet) |
| EKONOMISKT UTRYMME | UNKNOWN — frakten på 1,2 m stål är den öppna frågan |
| VARIANTFRIKTION | En variant. Ingen montering (spabadets vikt håller basen) — måste bekräftas i videon |
| ≤ 7 ORD ÄGARHOOK | "Svårt att kliva ur spabadet?" |
| STRUKTURMATCH | 72 |
| TRE SKÄL DEN MATCHAR VINNARNA | 1. > 500 kr-zonen med ankare 2–3× över (kameran 799). 2. En variant, ägt objekt, omisskännligt i bild. 3. Presens utan förklaring: rädsla + mörker + oktober |
| STÖRSTA SKÄLET DEN KAN FALLA | Frakt/vikt äter multipeln; passar inte spabad med inbyggt trädäck; videon kan visa en husbil (RV-räcke) i stället för ett spabad |
| KONFIDENS | LOW–MEDIUM |

### A4. Vedställsöverdrag (bara överdraget, 4–8 ft, spännen)

| | |
|---|---|
| PRODUKT | PU-belagt överdrag till befintligt vedställ, fyra nylonspännen |
| TEMU-URL | https://www.temu.com/se/g-601099615828436.html (syskon med öppningsbar front 601099588053506 = B, passform) |
| OBJEKT / ÄGARE | Vedstället/vedhögen utomhus. ~1 M+ hushåll eldar med ved (uppskattning, ej verifierad) |
| BEFINTLIG FRIKTION | Veden kommer hem september–oktober; presenningen blåser av, regn och snö går ner i högen |
| GAMLA SÄTTET | Presenning + tegelstenar, eller ingenting |
| PRODUKTENS ROLL | Skydda, fastspänt |
| VARFÖR ANNONSEN INTE BEHÖVER SKAPA BEHOV | Presenningen ligger i gräset efter första höststormen — fotograferbart i varje villaträdgård i oktober. Motorhöljets struktur rakt av |
| TEMU-MATERIAL | UNKNOWN |
| 0–3-SEKUNDERSBEVIS | UNKNOWN |
| SVENSK HYLLSTATUS | **Verifierad PASS** (`hylla/h1.json`): ingen av Biltema/Jula/Rusta/Granngården/Bauhaus/Hornbach/Byggmax säljer ett fristående vedställsöverdrag — bara möbelöverdrag, presenningar eller hela ställ (Hornbach 1 459–9 809). Enda svenska ankaret är Dealproffsen 549 kr för 2 st (ord. 899) — ett rea-marknadsplatsankare, inget märke |
| TEMU-PRIS | UNKNOWN |
| RIMLIGT SVENSKT PRIS | 349–399 kr (luft finns, men ankaret är svagt) |
| EKONOMISKT UTRYMME | UNKNOWN |
| VARIANTFRIKTION | Längd 4/8 ft (1,2/2,4 m) — ägaren vet ungefär, ingen tumstock. Exakt SKU-lista ej läst |
| ≤ 7 ORD ÄGARHOOK | "Blåser presenningen av veden igen?" |
| STRUKTURMATCH | 78 |
| TRE SKÄL DEN MATCHAR VINNARNA | 1. Identisk struktur med motorhöljet: ägt utomhusobjekt + presenningen som gamla sättet + spännen som synlig skillnad. 2. Vedhögen är omisskännlig och publiken är exakt 45–70 småhus/fritidshus. 3. En parameter ägaren kan |
| STÖRSTA SKÄLET DEN KAN FALLA | Priset: hamnar Temu-priset så att 349 kr inte ger 2,4× är den under 300-kronorsgränsen. Och kategorin: överdrag nummer fem — gräsklippartäcket och kranskyddet var förlorare i samma kategori (skillnaden var presens, inte formen) |
| KONFIDENS | MEDIUM |

### A5. Tändvedsklyv i gjutjärn (Kindling Cracker-typ)

| | |
|---|---|
| PRODUKT | Gjutjärnsring med kil; veden ställs i, slås med klubba — fingrarna aldrig nära eggen |
| TEMU-URL | https://www.temu.com/se/g-601099583674464.html (enkelbladig stålvariant 601099610405543 = C) |
| OBJEKT / ÄGARE | Veden + hammaren/klubban ägaren redan har; huggkubben |
| BEFINTLIG FRIKTION | Tändved behövs varje dag från oktober; små stickor med yxa på huggkubb = fingrar i vägen, stickor som flyger, i mörker |
| GAMLA SÄTTET | Yxa/handyxa, eller köpta tändvedspåsar 60–100 kr/säck |
| PRODUKTENS ROLL | Förbättra + säkra: samma handgrepp, utan yxan |
| VARFÖR ANNONSEN INTE BEHÖVER SKAPA BEHOV | Daglig handling från oktober; rädsla (fingrar) är inbyggd i gamla sättet. Kameran visade att rädsla bär pris |
| TEMU-MATERIAL | UNKNOWN |
| 0–3-SEKUNDERSBEVIS | UNKNOWN — men *om* videon visar ett slag och en kluven sticka inom 3 s är det den mest självförklarande produkten i hela jakten |
| SVENSK HYLLSTATUS | **Verifierad PASS med förbehåll** (`hylla/h1.json`): Jula säljer Kindling Cracker Original ~999 kr och Clas Ohlson en egen gjutjärnsklyv med slägga 999 kr — *samma form, men ingen under 999*. Originalet 1 249–1 799 i 11 butiker (PriceRunner, Hylte, Bauhaus, Granngården). Ankare ≥ 1,6× mot 499–599 → PASS. ⚠️ Kopior finns online 295–419 kr. Positionen är "samma sak för halva Julas pris", inte unik |
| TEMU-PRIS | UNKNOWN |
| RIMLIGT SVENSKT PRIS | 499–599 kr |
| EKONOMISKT UTRYMME | UNKNOWN — gjutjärn väger 4–6 kg; frakten kan spräcka 1,5×-antagandet |
| VARIANTFRIKTION | En variant |
| ≤ 7 ORD ÄGARHOOK | "Klyver du tändved med yxa?" |
| STRUKTURMATCH | 68 |
| TRE SKÄL DEN MATCHAR VINNARNA | 1. Märkesankare i kedjan (Jula 999) i stället för tom hylla — spöhållarens struktur inverterad men lika stark. 2. Objektet (vedhög + huggkubb) är omisskännligt och publiken exakt. 3. Handlingen syns: en sekund, ett slag, klar |
| STÖRSTA SKÄLET DEN KAN FALLA | Vikten. Och att kunden har Jula-alternativet i handen — utan Kindling Cracker-ankaret i bild ser 599 kr dyrt ut bredvid 295-kronorskopiorna |
| KONFIDENS | MEDIUM |

**Vad de fem har gemensamt, och vad de saknar:** alla fem passerar objekt,
presens, verifierad hylla, variant och publik. Ingen av dem har ett sett material
eller ett känt Temu-pris. Två av fem är överdrag (A1, A4) — kategorin är bevisad
men inte ny. A2 och A5 är nya kategorier för kontot (kroppsburen jaktutrustning,
handverktyg). A3 är den enda i > 800-kronorszonen.

---

## 4. TIER B — 17 koncept, en meningsfull osäkerhet kvar

Osäkerheten står i klartext. 23 huvudlistningar (hängrännesatsen och
hjulpiggarna har flera) + 28 dubbletter med `tier = "B (dubblett)"` i
`dataset.json`, som pekar på huvudlistningen.

| # | Koncept | Goods-id | Kluster | Hylla | Den kvarvarande osäkerheten |
|---|---|---|---|---|---|
| B1 | Utekattkoja, isolerad Oxford | 601101118338671 | djur | ✅ PASS (Supercat 1 799, Kerbl 1 017; Shein 424 närmast) | **Publiken:** köparen skev mot kvinna — fingeravtrycket säger man 45–70. Strukturmatch 78, högst i B |
| B2 | Hängrännesats till lövblås (11 ft) | 601103248788835 / 601103296007046 | grasklippare | ✅ PASS (Stihl 745; Husqvarna 359–399 lågt sekundärankare) | **Passform:** adaptrar mot svenska batteriblåsar (Ryobi/Bosch/Husqvarna) → returer |
| B3 | Väggstöd till stege | 601099637369908 (+8 dubbletter) | hus | ✅ PASS (Wibe 779–974, Bauhaus 1 195) | **Negativ rymd:** stegen förvaras inomhus; U-bultsmontering; 1 m stålfrakt. Biltemas stegtillbehör (403) kan gömma ett 300-kronorsstöd |
| B4 | Rännstöd i plast till stegen (17") | 601100858917684 | hus | PASS ej verifierad (ingen svensk kanal hittad) | **Ekonomi:** US 2-pack $37,99 → ~900 kr för två plastbitar |
| B5 | Jaktparaply, spänns runt stam | 601103949421856 | jakt | ✅ PASS (Ameristep 479, enda svenska säljaren) | **Frakt + publik:** stort paraply; många svenska torn har redan tak |
| B6 | Tornsits med spännrem, camo | 601099667428425 (+3) | jakt | ✅ PASS (Carinthia 559) | **Hyllan i bild:** ser den ut som ett 49-kronors sittunderlag vinner kedjan |
| B7 | Sopkärlslocklås med rem | 601101587576926 (+2) | tomt | ✅ PASS (Smartaskydd 459) | **Pris + vana:** Temu-pris troligen < 100 kr; låses upp varje hämtdag. Objektet bevisat av klistermärkena |
| B8 | Gevärshållare ATV | 601099522267692 | mc | ✅ PASS (Kolpin 1 075; ingen jaktkedja) | **Publik + material:** ATV-jägare kan vara < 100 000; Temu-bilderna visar ingen ATV. Enda B med Temu-pris: 34,52 AUD ≈ 218 kr → 849 kr = 2,6× (ekonomi PASS) |
| B9 | Husbil termoskydd utvändigt | 601102148404312 | husvagn | ✅ PASS (Hindermann 1 565) | **Chassi-variant + publik:** Ducato X250/X290/Transit/Sprinter; 94 000 husbilar (strax under tröskeln); kalkylen faller om Temu > ~330 kr |
| B10 | Styrstolpar båttrailer | 601102184182476 (+1) | bat | ✅ PASS (VEVOR 850; kedjorna har bara sidorullar) | **Montering + frakt:** bultas på ramen, 1,1 m |
| B11 | Spatrappa universal | 601099596495697 (+1) | pool | ✅ PASS (Folkpool 1 290, Bauhaus 1 495) | **Frakt:** skrymmande plast, pris nära 1 000 kr |
| B12 | Poolvärmepumpsskydd | 601103300703848 | pool | ✅ PASS (Österlens 499) | **Publik + mått:** pooler med värmepump troligen < 100 000; "passar de flesta" |
| B13 | Hjulpiggar robotgräsklippare | 601100183382557 / 601099514177508 / 601101022004142 | grasklippare | ✅ PASS (Skoterdelen 539; Worx-piggar 353 på PR) | **SKU per märke/hjulmått** — en annons per märke; Temu-pris troligen < 100 kr |
| B14 | Kupolnät till trädgårdsdamm | 601099601980879 | vatten | UNCERTAIN (kupolformen finns inte i Sverige; platta nät 104 kr) | **Mått + publik:** dammens mått måste mätas; ägarklass okänd |
| B15 | Hårdbottnat baksätesskydd hund | 601099578348331 (+5) | djur | ✅ PASS (Kleinmetall Bridge 1 059; kedjorna har bara hängmattor) | **"Universal" utan mått**, skrymmande, jämförelsehandlad kategori |
| B16 | Isolerad tyghundkoja | 601105490445990 | djur | ✅ PASS (Kellfri 2 699, Trixie 2 199) | **Trovärdighet:** tyg + folie som vinterkoja åt en 30-kilos jakthund; storlek efter hund |
| B17 | Vedställsöverdrag med öppningsbar front | 601099588053506 | ved | ✅ PASS (som A4) | **Passform** mot ett specifikt USA-ställ |

(Dubbletterna hör till A1, A2, B1, B3, B6, B7, B10, B11 och B15 — se
`dataset.csv`, kolumn `tier`.)

---

## 5. TIER C — avslag som lär oss något

Bara de som säger något om filtret. Alla 89 C-rader står i `dataset.csv`.

| Koncept | Goods-id | Varför C | Lärdomen |
|---|---|---|---|
| Transom saver-kil (utombordare på trailer) | 601100312972322, 601100200308437 | Latent behov — skadan på hydrauliken syns om år | 55 % av förlorarna hade latent behov. Ett perfekt objekt (utombordare) räddar inte en osynlig payoff |
| Propellerskydd i tyg | 601099611345347 | Want, inte need: ingen inträffad skada i oktober | Kranskyddets svaghet i ny form |
| Kajaköverdrag | 601099616420647 | Lixada 380–436 kr i samma form på PriceRunner; sjätte överdraget | Marketplace-hyllan räknas som hylla när kunden googlar |
| Klyvkon till borrmaskin | 601099512512218 (+2) | CDON/Elgiganten 279 kr i samma form — **under** vårt pris 399 | Ett lågt ankare är lika dödligt som en kedja. Plus vridmoment/säkerhet i recensionerna |
| Hydraulisk locklyft spabad | 601101853422243 | > 1 000 kr + skruvmontering | Två negativa-rymd-flaggor samtidigt fäller, oavsett friktion |
| Filtertvätt spa | 601101133629438 | Fackhandel 255–269 kr | Samma lärdom som klyvkonen |
| Stormband spalock | 601099592127596 | Biltema-spännband 79 kr gör samma jobb ∧ < 300 kr | Förlorarnas tredje markör (köpt old way ∧ jämförelsehandlad ∧ < 300) |
| Pumpsäck dammpump | 601099537193860 | Nätpåse ~50 kr; pumpen känns inte igen i flödet | Objektet måste synas i bild |
| USB-värmedyna | 601099898313877 (+1) | Commodity 155 kr på PriceRunner | Woodline-look eller ingen marginal |
| Bunk-glidpads båttrailer | 601100875031411 | Svenska trailers är rulltrailers; antal pads kräver mätning | Objektet måste ägas av > 100 000 — *svenska* ägare |
| Automatisk hönslucka | 601103331613427 (+2) | Hylla PASS (Kerbl 1 313–1 899) men montering + ström, förklaring, jämförelsehandlad | Tre flaggor — kameran klarade det bara med 799 kr och rädsla |
| Ekorrbaffel fågelmatare | 606387388178611 | < 300 kr; halva publiken har mataren i ett träd | "Objektet" måste vara *det* objekt produkten fäster på |
| Uppvärmd hönsvattenautomat | 603266490408979 | Troligen > 1 000 kr; US-spänning; frost är framtid i september | Skadan i fel månad + el = förtroende |
| Kranskydd 2-pack | 601099530394801 | **Omtest, inte ny produkt** (Kranskydd Frost 420D: 7 416 kr / 28 köp / ROAS 1,59 mot BE 1,49, pausad) | Ett omtest i oktober är en annan fråga än produktjakten — dokumenterad i `temu-vinnar-dna.md` (kranskyddsfällan) |
| Hinkfälla möss | 601100216234049 | **ELIM på hyllan i h5:** Jula, Biltema, Clas säljer vippbräda-för-hink (Clas 59,90 kr) | Djur-klustrets starkaste presens föll på fem sekunders hyllkoll — sök kedjan på ägarens ord ("musfälla hink") före Temu |
| Torkrock hund | 601105260939830 (+3) | **ELIM i h5:** Rusta 39,90 kr samma form | Personlig passform + kedjeform = två förlorarmarkörer |
| Axelrem lövblås/trimmer | 601099519754003 (+1) | ELIM h2: Stihl röjsele 488, Jula 349 | Redan testad kategori (röjsågsselen) + hylla |
| Presenningsstöd båt | 601099584417825 (+2) | ELIM h3: Hjertmans 439, Biltema-form 145 | Fackhandel + kedja |
| ATV-kapell | 601099514234509 (+1) | ELIM h3: Biltema helkapell 429 | Kedjetyg |
| Spa-dammsugare | 601099612894629 | ELIM h4: 399 kr-form i kedja | — |
| Laddportskydd elbil | 601099579267397 (+2) | ELIM h4: Kjell 299, kedjor 129 | Magnet fäster inte på aluminium; hyllan full |
| Takboxhiss | 601099714039172 (+1) | ELIM h4: Biltema 299 | Kedjan har formen |
| Rännstöd/rännkrok plast | 601100198525980 (+1) | ELIM h2: Bauhaus 59,95 | Bygghandelsvara |

---

## 6. Vad jakten lärde om filtret (utöver vinnar-DNA:t)

1. **Hyllan är den största fällaren — och den kollas billigast.** 179 av 374 avslag.
   Fem sekunder på PriceRunner med ägarens *svenska* ord ("musfälla hink",
   "dragskydd", inte "kopplingsskydd") före någon Temu-sökning. Biltema svarar
   403 för maskiner — deras hylla måste läsas ur sökutdrag eller av Axel i butik.
2. **Marketplace-hyllan räknas.** VEVOR 860 (spa-räcke), Oxford cover cap 499,
   Lixada 380 (kajak), CDON 279 (klyvkon): kunden som googlar ser dem. Ankaret
   måste vara ≥ 1,6× *det* priset, inte fackhandelns.
3. **Sökbudgeten dör före hyllan.** Tolv av tretton kluster fick slut på
   WebSearch (200/session) innan kedjekontrollen. Nästa körning: hyllan först,
   Temu sist, och en fast budget per koncept.
4. **Djur-klustret är stort men fel publik.** 130 listningar, 106 avslag.
   Utekatten och hunden i bilen är de enda med rätt objekt-i-bild; köparen
   skev mot kvinna på det mesta.
5. **Presens i oktober betyder att skadan syns i oktober.** Snöblad, snökäppar,
   kranskydd, taksnöraka, frost i vattenautomaten: alla har rätt objekt och fel
   månad. Kranskyddsfällan i tjugo varianter.
6. **"Passar de flesta" är en variantfriktion, inte en variantlösning.**
   Hängrännesats-adaptrar, universal-baksätesskydd, poolvärmepumpsskydd,
   hjulpiggar per märke.

---

## 7. Nästa steg (klart att köra när Temu släpper)

1. `cd docs/temu-jakt-v2/jakt && python3 hamta-ko.py --paus 20 --max 70` —
   hämtar pris/betyg/recensioner/bilder/video för alla A/B (prioriterat), skriver
   tillbaka i klusterfilerna, stannar själv efter tre blockerade i rad.
2. Materialgaten enligt `jakt/material/instruktion.md` på A1–A5 + B1–B8:
   frames 0–3,5 s, hero, inbränd text, samma produkt, mutad, rå + captions som
   kärnannons JA/NEJ. **Först då** blir en villkorad A skarp — eller faller.
3. Ekonomi på riktiga tal: landad ≈ Temu-pris × 1,5 (kalibrerat på IBC
   108,51 → 165 och motorhöljet 71,22 → 116), ≥ 2,4×, ≥ 300 kr, BE-CPA ≥ 190.
4. `python3 konsolidera.py` → uppdaterad tratt och tiers; den här filen och
   artefakten uppdateras.
5. När Meta-data kommer på en testad kandidat: fyll `utfall` i `dataset.json`
   (fältet finns inte ännu — läggs till vid första launchen) och jämför mot
   `structure_match`. Det är hela poängen med datasetet.

---

## 8. Datasetet

`docs/temu-jakt-v2/jakt/`:

| Fil | Vad |
|---|---|
| `dataset.json` | 519 kandidater, alla fält, `funnel`, `tiers`. `tier` = slutdom; `tier_agent` = klusteragentens ursprungliga; `tier_reason` = varför |
| `dataset.csv` | Samma rader, en per listning, gate-resultat i kolumner — öppna i Excel |
| `<kluster>.json` / `.md` | Klusteragentens rådata och rapport (objektuniversum, sökfraser, tratt, kandidater) |
| `hylla/h1–h5.json` | Hyllverifieringen: kedja för kedja, fynd, priser, URL:er, sökningar |
| `objektuniversum.md` | 96 objekt, alla sökfraser (körda/ej körda), tratt per kluster, avslagsmönster, luckor |
| `instruktion.md`, `hylla/instruktion.md`, `material/instruktion.md` | Exakt vad agenterna fick — så nästa körning gör likadant |
| `temu-ld.py` | Läser en Temu-sida som Googlebot → JSON-LD (pris, betyg, bilder, video). Kräver att IP:n inte är blockerad |
| `hamta-ko.py`, `konsolidera.py`, `hylla-tillamp.py`, `slutdom.py` | Hämtkön, sammanslagningen, hyllverdikten in i datasetet, huvudsessionens slutdom |

Fält per kandidat: `goods_id, url_se, title, temu_price_sek, rating, review_count,
review_dates, category_path, image_count, hero_url, video_url, video_checked,
object, owner_owns, friction, old_way, variants, swedish_equivalent{},
brand_anchor{}, gates{object, presence, shelf, material, economics, variant, hook,
audience}, negative_space_flags[], eliminated_at, structure_match,
category_novelty, tier, tier_agent, tier_reason, biggest_risk, confidence, sources`.
Saknat värde = `null`/`"UNKNOWN"`, aldrig en gissning.
