# Produktjakt 2026-09-12 (vecka 37) — V3, dag 2

## Steg 0 — lärde FÖRE sökningen

### 0A. Axels svar (18 nya, alla på gårdagens V3-batch) → 35 svar totalt: 22 ja / 7 kanske / 6 nej

| Dom | Produkt (09-11) | Orsak Axel | Varför-läsning (orsakstyp) |
|---|---|---|---|
| ja | Snöskoterkapellet 600D | Känns rätt · Deadline nu · Skyddar något | — |
| ja | ATV-kapellet Heavy Duty | Känns rätt · Deadline nu · Skyddar något | — |
| ja | Isfria vattenskålen 2,2 L (utekatt) | Känns rätt · Skyddar något · Deadline nu | — |
| ja | Viltsläden — rullbar dragmatta | Känns rätt | — |
| ja | Snöslungehuven 600D · Hönsgårdstaket · Takluckehuven 2-pack · Snöflingor till garageporten · Snöskyffeln Makita · Kajakhållaren 2-pack · Värmesitsen älgpass · Fågelmataren med kamera · Täljsetet · Adventskalender Dinosaurier · Motorlåset utombordare | (inga etiketter) | — |
| kanske | Hjulskydden 4-pack husvagn/släp | — | flerköp men "sett innan"-risk (däckskydd finns hos kedjan, STATUS 09-11 K4/K6) |
| kanske | Vedställsbeslaget 2-pack | — | kunden måste köpa reglar själv — lågt upplevt värde i bild (två beslag) |
| **nej** | Släpkärrekapellet 220×125 | **"Nöjd med det han har"** | **standardutrustning/sett innan** — kapellet följer ofta med kärran (samma som ramperna 09-10). Objektraden Släpkärra får anteckningen; kapell på kärra söks inte igen. Inte "överdrag är dött": han sa ja till fyra andra kapell/huvar samma dag. |
| **nej** | Värmepumpsskyddet i aluminium (1 499 kr) | — | **montering + pris**: styv låda som ska skruvas fast (montering_app = ja är HÖG förlorarsignal, 1 av 6 vann) och 1 499 kr utan att objektet syns "fara illa" i heron. Backlog-raden (snötak) stängs — inte kategorin luftvärmepump. |
| **nej** | Gårdshundens plastkoja (999 kr) | — | **kedjan har formen** (plastkojor 700–1 500 hos Granngården/Jula, hyllfrånvaro saknas) + "sett innan". Kattkojan vann för att formen (isolerad, på ben) inte fanns; plastkojan är kedjans standard. Backlog-raden gårdshund stängs; H09 (djur ute) lever — han sa ja till vattenskålen och hönstaket. |

**Signal ur svaren:** 15 av 15 icke-skyddsrader utanför överdragsfamiljen fick ja eller kanske (kajakhållare, värmesits, snöskyffel, täljset, fågelkamera, snöflingor, viltsläde, motorlås, vattenskål, dinosauriekalender) — diversifieringen efter "för mycket överdrag" träffade. Alla tre nej är skyddsformer på objekt där kedjan eller ägaren redan har lösningen.
`vikter.json`: 0 stopp, 25 lyft (klick är bevisnivå 2 — visas, styr inte). `koncept.json`: 243 koncept, 18 svar inlästa.

### 0B. Metas facit (snapshot `facit/snapshots/2026-09-12.json`, 84 kampanjer → 76 produkter: **19 REAL WINNER · 21 REAL LOSER · 34 INSUFFICIENT · 2 UNTESTED**)

| Launch | Spend | Köp | ROAS / BE | Band | Klass | Bekräftad? |
|---|---:|---:|---|---|---|---|
| Taköverdraget för Husvagn 6,5 × 3 m (V1, 09-09) | 7 300 | 47 | 7,38 / 1,63 | HIGH | REAL_WINNER | preliminär — snapshot 1 = 09-11, ≥ 3 dygn = tidigast 09-14 |
| Adventskalendern Racingbilar (V3, 09-08) | 5 189 | 20 | 2,33 / 1,62 | HIGH | REAL_WINNER | preliminär (09-14) |
| Isolerade Utekattkojan (V2, 09-09) | 4 152 | 13 | 2,60 / 1,62 | HIGH | REAL_WINNER | preliminär (09-14) |
| **Termoskyddet för Husbil 211 × 171 cm (Axels egen, 09-11, 559 kr)** | 1 511 | 11 | **4,33 / 1,61** | MEANINGFUL | **REAL_WINNER (ny)** | preliminär — första snapshot i dag |
| Stegstödet 2-pack (09-10) | 1 974 | 2 | 0,72 / 1,63 | TOO_EARLY | INSUFFICIENT, lutning negativ | — |
| Staketstolpslagaren 2-pack (09-10) | 1 875 | 1 | 0,91 / 1,66 | TOO_EARLY | INSUFFICIENT, lutning negativ | — |
| Solcellslarmet 2-pack (09-11) | 1 494 | 1 | 0,51 / 1,63 | TOO_EARLY | INSUFFICIENT, lutning negativ | — |

- Nytt i facit: **Termoskyddet** — researchen killade det 2026-09-10 på K7 (landad 522 mot WeCamp 793); Axel launchade själv och det ligger på ROAS 4,33 efter ett dygn. Skrivet som **motbevisat antagande nr 8** i `hypoteser.json` (ekonomigrinden pris ÷ landad < 2,4). Tredje gången modellens grind dödar en vinnare (taköverdraget, adventskalendern, termoskyddet).
- Två kampanjer utan produktkoppling (MagiBorsten - SE 1 716 kr, Följ bäver 750 kr) taggade i `historik-taggar.json` som *ingen produkt* — de stod som okopplade i FACIT.md; räknas inte i signalerna.
- `utfall.json` omskriven ur facit (7 launchade forskningsprodukter), `koncept.py backfyll` kört.

### 0C. LEARNING_STATE.md (omskriven 2026-09-12, läst)

- Vinnarna: objekt_ute ja 16/19 · 55+ småhus 16/19 · B_SKYDDA_DYRT **8 av 9** dömda vann · deadline uppställning **4 av 4** · ankare ≥ 1,6× **4 av 4** · prisband 500–999 **8 av 10** · form överdrag 8 av 9. Förlorarna: objekt_ute nej 16/21 · deadline ingen 19/21 · form annat **0 av 13** · montering_app ja 1 av 6.
- Hypoteser: H01 (dyr sak ute + väderhot + formsydd form) och H02 (hårt datum) får Termoskyddet som femte/femte vinnare — **stärkta**. H07 (Axels verktygslauncher förlorar): Stegstödet, Staketstolpslagaren, Solcellslarmet alla under BE men TOO_EARLY — ingen dom än. H09 (djur ute): fortfarande inget launchat test (vattenskål + hönstak fick ja i går). H11/H12 (ordning, maskinen gör jobbet): Axel ja på kajakhållare, snöskyffel Makita — inget Meta-test än.
- Prediktion vs verklighet: 4 dömda launcher — researchen rätt på 1 (kojan), fel på 3 (taköverdraget refuterat, adventskalendern killad, termoskyddet killat). **Mönstret i felen är ett och samma: en enskild grind (pris > 1 000, STOPPORD, pris ÷ landad) dödade en rad där strukturen var rätt.** Rank per profil (V3) i stället för totalpoäng är rätt svar; ekonomin får bara vara en hård grind på BE-CPA ≥ 190.

### 0D. Säsong (`korningar/2026-09-12/SASONG.md`, 43 fönster)

NOW som styrde i dag: första frost Norrland 0,9 v / Svealand 4,7 v / Götaland 5,3 v · uppställning husvagn & båtupptagning 4,0 v · höstregn 4,0 v · MC-avställning 4,7 v · lövfällning 4,7 v · vedsäsong 4,7 v · robotindockning 6,1 v · första snö Norrland 6,1 v / Svealand 9,9 v · fars dag 8,1 v · utedjurens fönster stänger 9,1 v · 1 december 10,4 v · isläggning 10,6 v. EARLY (parkerat): snölast mitt i vintern 18,6 v, isfiske 18,6 v, sportlov 23 v.

## Steg 1–4 — discovery med fyra linser (en struktur per lins, inte fem på skydd)

| Lins | Struktur | Hypotes | Sökt | Levererat | Strukna (skäl) |
|---|---|---|---|---|---|
| G | Ordning/flerköp — spöklämmans struktur | H11 | 14 fraser, 9 objekt, 13 produktsidor, 15 heron | 3 (Makita-hållaren 5-pack, Maskinhyllan, Ljusslingevindorna) | däckkrokar (Bauhaus Rawlink 90 kr mot landad 374), skidhållare (Habo 129/par), paddelhållare (119 kr), golfbaghållare (179), redskapsklämma (bara 3-dollarskrokar), Makita-batteridocka 10-pack (BE-CPA 138) — **kedjan äger hållare/krokar för vanliga objekt; luckan finns bara där kedjan säljer EN och ägaren behöver MÅNGA** |
| H | Maskinen på ägarens Makita-batteri + kroppsligt i säsongsjobbet | H12 / H02 | 14 fraser, 12 produktsidor (3 tomma), 8 heron | 3 (Minikedjesågen Makita, Värmesulorna älgpass, Värmehandskarna älgpass) | lövblås Makita (K0: Jetfläkt Makita 709 finns), högtryckstvätt Makita (ankare bara 1,4×), kaffebryggare (landad 2 300), kupévärmare (pryl < 300), värmeväst (bara Makitas egen), lövskopor (BE-CPA < 190), vedbärare (kedjeform), broddar/knäskydd (sett innan) |
| I | Djur ute i kylan + Q4-datum | H09 / H05 | 24 fraser, 9 produktsidor, 8 heron | 4 (Uppvärmda fågelbadet, Bikupans vinterjacka, Kaninburens vinterhuv, Highland Cow-kalendern) | hönsens frostvakt (Lantbutiken 259 kr = under landad), survival-kalender till mannen (CDON/Fyndiq under oss), hästens värmehink (ingen listning — ankare Willab 1 299 skrivet på objektraden), igelkottshus (25,89 USD > 20-gränsen), utekattens värmeplatta IP67 (tredje gången bara inomhusdynor), traktorkalender (2D-hängen) |
| J | Formsydd form på NYA dyra objekt inför datum + ny form | H01/H02/H04/H10 | 16 fraser, 13 produktsidor (3 tomma), 9 heron | 4 (Båthuven trailerbåt, Kamadohuven, Kajakhuven, Krukväxthuven 3-pack) | studsmatteskydd (Hemfint 395 < landad), elverkstält (bara förvaringshuv = Biltema-form), mössnät husvagn (bara AC-slangnät/US-galler), halvgarage (Jula Hamron), pizzaugnshuv (Ooni 499 → BE-CPA 240, K0115), ljusgårdslock (ingen listning), spabad annan form (osynlig under locket). Ingen H10-rad fanns som listning i dag. |

**14 kandidater → 13 klarade grindarna → batch 12** (8 exploitation / 1 exploration / 3 säsong; exploration under minimum 2 — inte utfyllt). Skyddsformer 5 av 12 = 42 %? Nej: rank.py räknar 5 skyddsformer mot taket 40 % av 15 = 6 — godkänt. Struken i grinden: **Highland Cow-kalendern** (BE-CPA-intervall 185–261, undre gränsen < 190) → `backlog.json`, söks om med listning < 20 USD.

## Batchen (sida v17, ark `Leverantorsoffert-2026-09-12.xlsx`, prisfälten tomma)

| # | Produkt | Slot | Objekt · form · arketyp | Pris · BE-CPA | Säsong | Ankare / golv | Konf. | Rank-förklaring | Största risken |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Båthuven 600D trailerbåt 17–19 fot (K0244) | exploit | båt på trailer · överdrag · B | 1 399 · 494–659 | upptagning 4,0 v | SeaSea 300D 1 699 (1,21×) / BoatLab 1 329 rea | MEDEL | vinnarlikhet 3, ekonomi 3, säsong 3, signal +1,6 (H04: objekt ≥ 100× priset) | BE-ROAS 2,4; rea-golv i 300D |
| 2 | Kamadohuven 600D (K0245) | exploit | NYTT kamadogrill · överdrag · B | 649 · 301–364 | första frost 4,7 v | Kamado Joe 979 (1,51×) / Sumo 449 slut | MEDEL | vinnarlikhet 3, säsong 3, signal +2,0 | ägarantal ej mätt; packshot-hero |
| 3 | Värmehandskarna för älgpasset (K0246) | exploit | NYTT jägarens händer · kläder · E | 999 · 291–420 | älgjakt syd 3,7 v | Jaktia 799–2 995 (2,0×) / 799 | LÅG | säsong 3, lucka 2 | storlek M–XL = måste mäta |
| 4 | Kajakhuven formsydd (K0247) | exploit | NYTT kajak på bockar · överdrag · B | 499 · 276–316 | upptagning 4,0 v | ej mätt / Amazon 371 | LÅG | creative 3 (bästa heron: kajak på bockar, droppar), säsong 3 | ankare ej mätt |
| 5 | Minikedjesågen för Makita-batteri (K0248) | explore | NYTT Makita-batterisystemet · verktyg · D | 999 · 465–562 | vedsäsong 4,7 v | Makita DUC150Z 2 395 (2,4×) / — | MEDEL | hypotesvärde 3 (H12 rent), ekonomi 3 | leverantören trycker Makita-logga (pirat) — måste beställas obrandad |
| 6 | Värmesulorna för älgpasset (K0249) | exploit ASYM | NYTT jägarens fötter · kläder · E | 899 · 234–355 | älgjakt syd 3,7 v | Thermacell 1 795 (2,0×) / Hylte 995 | MEDEL | säsong 3 | landad 544–665, Elgiganten/Jula säljer formen |
| 7 | Uppvärmda fågelbadet (K0250) | säsong | fågelbord · annat · E | 699 · 291–365 | vintermatning 6,1 v | ingen svensk uppvärmd (Vivara 0) / Amazon Feemiyo ej prisläst | MEDEL | säsong 3, efterfrågan 3 | ankare saknas, hero oanvändbar |
| 8 | Krukväxthuven 3-pack (K0251) | säsong | citrus/oliv/pelargon · huv · E | 449 · 266–300 | vintertäckning 8,4 v (frost 4,7) | Olivträdsbutiken 699 (1,56×, slutsåld) / Bauhaus 189 | LÅG | säsong 3 | fiberdukspåse — lågt upplevt värde, golv 189 |
| 9 | Bikupans vinterjacka (K0252) | säsong ASYM | bikuporna · överdrag · B | 799 · 355–436 | invintring 4,7 v | ingen svensk kupjacka / — | MEDEL | säsong 3 | ägargrupp ~15 000 biodlare; kupmått |
| 10 | Maskinhyllan för 4 elverktyg (K0253) | exploit | NYTT elverktygen i garaget · annat · A | 599 · 321–371 | evergreen | P.Lindberg 1 120 (1,87×) / Harald Nyborg 199 | LÅG | lucka 2, creative 2, signal −1,5 | kedjan har formen under oss; form annat 0 av 13 |
| 11 | Ljusslingevindorna 10-pack (K0254) | exploit | NYTT julbelysningen · annat · A | 399 · 207–242 | evergreen (nov) | — / Clas 199,90 | LÅG | vinnarlikhet 2, signal −2,0 | lågt upplevt värde, golv under oss |
| 12 | Makita-hållaren 5-pack (K0255) | exploit ASYM | NYTT Makita-maskinerna · klämma · A | 399 · 247–275 | evergreen | K-Bygg 459/4-pack (1,44×) / Bauhaus 279 | MEDEL | vinnarlikhet 2 (spöklämma: kaos → ordning, flerköp) | 70 kr/st hos Bauhaus mot våra 80 |

Alla 12 är LIVE_VERIFIED i dag (produktsida öppnad, hero nedladdad och sedd, pris ur sökträffen, UTC-stämpel i `v3/kandidater-*.json`). Ägarantal: "ej mätt" på alla NYTT-objekt. K0 på SAK mot `v3/katalog-live.txt` (192 aktiva, Shopify Admin API i dag), `koncept.py sok`, kontot 7 d — ingen dubblett (kajakhuven är syskon till Kajakhållaren K0239, annan form).

## Parkerade (`backlog.json`)

Highland Cow-kalendern (BE-CPA 185, < 20 USD krävs) · hästens värmehink (ankare Willab 1 299 mätt, ingen listning) · utekattens värmeplatta IP67 (tredje körningen utan rätt listning — sök inte igen förrän leverantörskälla utanför AliExpress finns) · igelkottshus (25,89 USD).

## Metodfynd i dag

1. **Samma SAK-nyckel slog ihop två olika produkter.** `v3_till_fynd.py` gav värmesulor och värmehandskar samma koncept-id (K0246) eftersom `_sak` klipper objektet vid "—". Rättat för hand (objektraderna omformulerade: "Jägarens fötter …" / "Jägarens händer …"), koncept.json återställt och byggt om. Regel för linserna: objektfältet ska vara unikt FÖRE tankstrecket.
2. **Kedjan äger hållare/krokar** (lins G): fem former föll på golv 89–179 kr. H11 lever bara där ägaren behöver många av något kedjan säljer styckvis.
3. **Formtaket höll utan tvång**: 5 skyddsformer av 12 (42 % av batchen, under 40 % av max 15). Linserna själva begränsade sig.
4. **Metas facit slog modellen en tredje gång** (Termoskyddet). Konsekvens: ekonomigrinden får bara vara BE-CPA ≥ 190 (rank.py), aldrig multipel eller ankarkvot — och det är redan så i V3.

## Tio kontrollfrågor (MASTERPROMPT §9)

1. Kattkojan hittas i dag via H09-linsen (objekt Utekatten, form koja) — K0 (launchad, REAL_WINNER). Ja.
2. Taköverdraget: H04 (> 1 000 kr när objektet ≥ 100× priset) är aktiv hypotes — Båthuven 1 399 kr står som dess test i dag. Ja.
3. Adventskalendern: G_Q4_GAVA/H05 söktes (lins I); Highland Cow föll på BE-CPA 185 i grinden, inte på STOPPORD. Ja.
4. Verktygen (sotset, spolaren, stabilisatorn …): inga verktygsrader utan hypotes — Minikedjesågen bär H12 med ankare 2,4× och payoff. Ja.
5. Verktyg levererat: ett, som exploration med hypotes_id och pirat-risken utskriven. Ja, medvetet.
6. Deadline per rad: 9 av 12 NOW (0,9–10,4 v), 3 evergreen (H11-rader, märkta). Ja.
7. Ankare per rad: 9 mätta med URL i kandidatfilerna, 3 "ej mätt" (kajakhuv, fågelbad, ljusslingor) — utskrivet. Ja.
8. Hero per rad: alla 12 sedda; två märkta oanvändbara (fågelbad, kamado-packshot). Ja.
9. K0 på SAK: katalog-live 09-12 + koncept.py sok + kontot 7 d. Ja.
10. Åtta taggar + per_kriterium + koncept-id per rad; vikter.json och LEARNING_STATE omräknade FÖRE sökningen; LEARNING_STATE-raden skriven. Ja.

## Definition of done

- [x] 0A Axels nya svar inlästa (18), varje nej läst med orsakstyp
- [x] 0B Metas facit hämtat (`facit/snapshots/2026-09-12.json`), utfall.json + koncept.json uppdaterade, 2 okopplade kampanjer taggade
- [x] 0C LEARNING_STATE.md omskriven och läst; prediktion vs verklighet kommenterad; hypoteser.json: motbevisat nr 8
- [x] 0D SASONG.md skriven; bara NOW-fönster jagade (EARLY parkerade)
- [x] Discovery ägare → objekt → friktion, 4 linser, 8/1/3 (exploration under minimum 2 — inte utfyllt)
- [x] Varje rad LIVE_VERIFIED i dag med UTC-stämpel, hero sedd
- [x] Svenska golvet läst med URL per rad (3 rader "ej mätt", utskrivet)
- [x] Materialklass per rad
- [x] Ekonomi som intervall, BE-CPA ≥ 190 på varje rad
- [x] Batch 12, per slot enligt rank.py, ingen utfyllnad
- [x] Ark byggt (prisfälten tomma) + sida publicerad mot samma URL, v17, downloads + db
- [x] koncept.json bär K0244–K0255 med listning, verifiering, prediktion
- [x] LEARNING_STATE-raden + STATUS.md + RUTIN-KVITTO.md; committat och pushat
- [x] Discord-rapport skickad
