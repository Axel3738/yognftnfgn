# Creative DNA – Motorhöljet (Bäverbutiken)

**Produkt:** Marin Motorhölje 420D – Universellt Skydd · 299 kr (jämförpris 367 kr)
**LP:** https://baverbutiken.se/products/marin-motorholje-420d-universellt-skydd
**Konto:** MagiBorsten `1867947880635861` (SEK) · Kampanj `120249435814310291` · CBO **4 000 kr/dag**
**Target-CPA (skalning):** 135 kr · **Break-even-CPA (kill):** 236 kr
**Senast uppdaterad:** 2026-08-09, femte körningen (/cs → batch #6 briefad)

---

## ⚠️ LÄS DETTA FÖRST — två saker som styr allt annat

### 1. Kontot kör tre copy-block, och inget av dem är briefat

Verifierat igen 2026-08-09: **samtliga annonser i kampanjen kör en av exakt tre primärtexter, alla
från batch #1.** Det gäller även de tre batch-#5-videorna som launchades 7 augusti. Ingen annons i
kontots historia har någonsin kört den copy som stod i dess brief.

**Rotorsaken är hittad:** texten fylls i automatiskt från ett sparat block som väljs på
**vinkelprefixet i annonsnamnet** — `PD_`, `SP_`, `SO_`. Det är en mall, inte slarv.

Två konsekvenser:

- **Rättningen är tre ändringar, inte sjutton.** Byt innehållet i de tre sparade blocken, så blir
  autoifyllningen rätt för all framtid. Se `batch-06/START-HERE.md`.
- **Copy-blockens prestanda går faktiskt att jämföra** — de har körts oförändrade över tolv
  dömbara annonser. Det som *inte* går att läsa är varje test där två annonser skulle skilja sig
  i text. Alla sådana tester i batch #2–#5 är döda.

### 2. Allt tappar effektivitet när det skalas. Utom en annons.

Nio annonser mättes om 2026-08-09 mot sina egna siffror från 2026-08-06. **Varenda en gav mindre
vinst per krona än tre dagar tidigare — utom `Motorhölje_PD_1_H3`, som tog ytterligare 2 972 kr och
låg still.**

| Annons | kr/1 000 kr 06 aug | kr/1 000 kr 09 aug | Spend tillagd |
|---|---|---|---|
| Motorhölje_PD_1_H3 | 417 | **431** | +2 972 kr |
| Motorhölje_PD_EXTRA | 1 407 | 1 376 | +11 kr |
| Motorhölje_SO_1_H2 | 1 493 | 1 278 | +35 kr |
| Motorhölje_SP_1_H1 | 1 063 | 960 | +354 kr |
| Motorhölje_SO_2 | 971 | 645 | +500 kr |
| Motorhölje_SO_1_H1 | 299 | 270 | +47 kr |
| Enginecover_SO_5_1 | 246 | 142 | +2 651 kr |
| **Enginecover_SP_5_H1** | **1 405** | **77** | +1 505 kr |
| **Enginecover_PD_6_C1** | **341** | **−242** | +4 456 kr |

**Detta är kontots bindande begränsning.** Problemet är inte att vi saknar bra creatives — vi
hittar dem hela tiden. Problemet är att de dör så fort de får pengar. Fyra gånger av fyra har en
annons som såg ut som en vinnare under 800 kr kollapsat när den pressades.

**Regel härifrån:** en hög siffra på låg spend är en hypotes, inte en vinnare. Skriv aldrig
"skala den" om en annons under 1 000 kr spend igen. Det gjordes 2026-08-06 om SP-blocket och det
blev fel — se struken lärdom nederst.

---

## Läget i siffror (livstid t.o.m. 2026-08-09)

| | Värde |
|---|---|
| Spend, hela kampanjen | 45 795 kr |
| Köp, hela kampanjen | 245 |
| Spend, dömbara annonser | 41 620 kr |
| Köp, dömbara | 236 |
| **CPA, dömbara** | **176 kr** |
| Mot break-even 236 kr | 25 % under → lönsam |
| Mot target 135 kr | 31 % över |
| Vinstbidrag, dömbara | **14 075 kr** |

**Datakvalitet:** `omni_purchase_values` reconcilierade mot `spend × ROAS` på **alla tolv** dömbara
rader denna körning (±0,1 %). Det 100×-fel som flaggades 2026-08-05 syns inte längre. Kontrollen
ska ändå köras varje gång — fältet har varit trasigt förr. `spend / köp` stämde också mot
`cost_per_omni_purchase` på alla rader.

---

## VINSTBIDRAG — den enda rankningen som gäller

`(break-even-CPA 236 − CPA) × köp`. Signifikansgrind: **≥300 kr spend OCH ≥3 köp**.
**Tolv annonser är dömbara nu**, mot nio förra körningen.

| Annons | Format | Copy-block | Spend | Sp% | Köp | CPA | **Vinstbidrag** | V% | kr/1 000 kr |
|---|---|---|---|---|---|---|---|---|---|
| Motorhölje_PD_1_H3 | video lång | PD | 19 128 | 46,0 % | 116 | 164,90 | **8 248** | 58,6 % | 431 |
| Motorhölje_SP_1_H1 | video | SP | 2 528 | 6,1 % | 21 | 120,40 | **2 428** | 17,2 % | 960 |
| Motorhölje_SO_2 | statisk | SO | 2 296 | 5,5 % | 16 | 143,50 | **1 480** | 10,5 % | 645 |
| Motorhölje_PD_EXTRA | video kort | PD | 795 | 1,9 % | 8 | 99,34 | **1 093** | 7,8 % | **1 376** |
| Enginecover_SO_5_1 | statisk | SO | 4 545 | 10,9 % | 22 | 206,59 | **647** | 4,6 % | 142 |
| Motorhölje_SO_1_H1 | video | SO | 2 045 | 4,9 % | 11 | 185,88 | **551** | 3,9 % | 270 |
| Motorhölje_SO_1_H2 | video | SO | 414 | 1,0 % | 4 | 103,61 | **530** | 3,8 % | **1 278** |
| Enginecover_PD_8_1 | statisk | PD | 642 | 1,5 % | 4 | 160,40 | **302** | 2,1 % | 471 |
| Enginecover_SP_5_H1 | video | SP | 2 192 | 5,3 % | 10 | 219,22 | **168** | 1,2 % | 77 |
| Enginecover_SO_8_1 | statisk | SO | 910 | 2,2 % | 4 | 227,44 | **34** | 0,2 % | 38 |
| Enginecover_PD_7_H1 | video | PD | 1 141 | 2,7 % | 4 | 285,36 | **−197** | −1,4 % | −173 |
| Enginecover_PD_6_C1 | statisk | PD | 4 984 | 12,0 % | 16 | 311,50 | **−1 208** | −8,6 % | −242 |

**PD_1_H3 är benchmark** — 46 % av spenden, 59 % av vinsten, 116 köp, och den enda annonsen vars
effektivitet inte sjunker med volym. Att dess CPA ligger över target betyder inte att den ska bort.

**Två annonser tjänar inte pengar:** `PD_6_C1` (pausad, korrekt) och `PD_7_H1`. PD_7_H1 ska ändå
inte pausas ännu — dess senaste 7 dygn ligger på CPA 226, alltså **under** break-even. Kill-regeln
kräver att trenden håller i sig, och den vänder uppåt.

**Två annonser är på väg åt fel håll:** `SO_5_1` (livstid 207, senaste 7 dygn **264**) och
`SO_8_1` (livstid 227, senaste 7 dygn **262**). Båda över break-even i trend, båda över 500 kr.
Kill-regeln är uppfylld. Pausa.

### För tidigt — ingen dom

`Enginecover_PD_16_H1` (683 kr, **0 köp**), `Enginecover_PD_6_1` (644 kr, 1 köp) och allt under
300 kr. PD_16_H1:s nolla är en varningssignal värd att bevaka, men den är under grinden och får
ingen klassificering. Notera dessutom att den **ärvde det gamla PD-blocket** — omskrivningen den
skulle testa kördes aldrig, så den mäter inte det vi trodde.

---

## CREATIVE-TEARDOWN

### Det naturliga experimentet, nu på fem annonser

SO-copyblocket kör oförändrat på **fem** dömbara annonser. Body, rubrik och CTA är exakt desamma —
verifierat i kontot. Enda skillnaden är själva creativen.

| Annons | Format | CPA | kr/1 000 kr |
|---|---|---|---|
| Motorhölje_SO_1_H2 | video | 103,61 | **1 278** |
| Motorhölje_SO_2 | statisk | 143,50 | 645 |
| Motorhölje_SO_1_H1 | video | 185,88 | 270 |
| Enginecover_SO_5_1 | statisk | 206,59 | 142 |
| Enginecover_SO_8_1 | statisk | 227,44 | **38** |

**34-faldig spridning med identisk text.** Ingenting annat i kontot varierar så mycket. Bilden
respektive filmen är den överlägset största variabeln — och den är fortfarande osynlig för
analysen, se luckor.

Samma sak i PD-blocket, också identisk copy: `PD_EXTRA` 1 376 → `PD_8_1` 471 → `PD_1_H3` 431 →
`PD_7_H1` −173 → `PD_6_C1` −242.

### Vinstbidrag per copy-block

| Copy-block | Spend | Köp | CPA | Vinstbidrag | kr/1 000 kr | Köp/klick | Dömbara |
|---|---|---|---|---|---|---|---|
| **SP (social proof)** | 4 721 kr | 31 | 152,3 | 2 595 kr | **550** | 4,4 % | 2 |
| SO (offer) | 10 210 kr | 57 | 179,1 | 3 242 kr | 318 | 2,1 % | 5 |
| PD (produktdemo) | 26 690 kr | 148 | 180,3 | 8 238 kr | 309 | **2,4 %** | 5 |

SP leder fortfarande, men **försprånget har halverats** — 1 145 mot 459 för tre dagar sedan, 550
mot 309 nu. Och det vilar på två annonser varav en kollapsade. Behandla SP som lovande, inte bevisat.

### Vinstbidrag per format

| Format | Spend | Vinstbidrag | kr/1 000 kr |
|---|---|---|---|
| Video, kort | 795 kr | 1 093 kr | **1 376** |
| Video, övrig | 7 180 kr | 3 707 kr | 516 |
| Video, lång | 19 128 kr | 8 248 kr | 431 |
| Statisk | 14 517 kr | 1 255 kr | **86** |

Statisk föll från 567 till 86 när `SO_5_1`, `SO_8_1` och `PD_6_C1` fick volym. **Det bekräftar
mönster 1, inte att statiskt är dåligt:** samma format spänner från −242 till 645 kr/1 000 inom
samma copy-block. Gruppmedelvärdet per format säger nästan ingenting.

### Klickkvalitet

Köp per klick, beräknat som `köp / (ctr × impressions)`. Grov proxy — `ctr` är alla klick, inte
länkklick — men den räcker för rangordning.

| Annons | CTR | Köp/klick |
|---|---|---|
| Enginecover_PD_8_1 | **1,15 %** | **5,8 %** |
| Motorhölje_SP_1_H1 | **1,67 %** | **6,3 %** |
| Motorhölje_SO_2 | **1,82 %** | **5,0 %** |
| Enginecover_PD_7_H1 | 1,67 % | 2,3 % |
| Enginecover_SO_8_1 | 2,22 % | 2,0 % |
| Enginecover_SO_5_1 | 2,39 % | 2,0 % |
| Enginecover_SP_5_H1 | 2,50 % | 2,5 % |
| Enginecover_PD_6_C1 | 2,63 % | 1,5 % |
| Motorhölje_PD_1_H3 | 3,05 % | 2,5 % |
| Motorhölje_SO_1_H2 | 4,23 % | 3,0 % |
| Motorhölje_SO_1_H1 | **4,64 %** | **1,4 %** |
| Motorhölje_PD_EXTRA | **5,39 %** | 2,3 % |

De tre lägsta CTR-annonserna konverterar 5,0–6,3 %. De tre högsta konverterar 1,4–3,0 %.
Sambandet är inte perfekt monotont — mittfältet ligger lägst av alla — men ytterkanterna är
entydiga och håller för tredje körningen i rad.

### Hook / hold

`video_play_actions / impressions` ligger på **89–95 % för samtliga videor**. På det här
måttet räknas autoplay, så det skiljer inte annonser åt och **ska inte användas som urvalskriterium**.
Tidigare körningars "hook rate 24–41 %" byggde på ett annat mått — jämför inte serierna.

Hold (p50 av plays) skiljer däremot:

| Annons | Hold p50 |
|---|---|
| Motorhölje_PD_EXTRA | **22,2 %** |
| Motorhölje_PD_1_H3 | 21,2 % |
| Enginecover_PD_7_H1 | 19,4 % |
| Enginecover_SP_5_H1 | 16,3 % |
| Enginecover_PD_16_H1 | 14,5 % |
| Motorhölje_SO_1_H1 | 14,5 % |
| Motorhölje_SO_1_H2 | 13,9 % |
| Motorhölje_SP_1_H1 | 13,3 % |

De två annonser som håller kvar publiken bäst är också de två PD-videor som klarar sig bäst.
`SP_1_H1` har sämst hold och näst bäst vinstbidrag. **Hold förutsäger inte vinst heller** — men
den korrelerar med hållbarhet, se mönster 2.

---

## Mönster

**1. Den enskilda creativen är huvudvariabeln, inte formatet och inte copyn. `BEVISAD.`**
Fem annonser med identisk text spänner 34-faldigt (38 → 1 278 kr/1 000). Spridningen inom ett
copy-block är större än mellan copy-block, och spridningen inom ett format är större än mellan
format.
→ **Instruktion:** testa *bilder* mot varandra med copyn låst. Batch #6 gör det med fyra SO-statiska
i samma adset. Sluta brief:a "samma budskap i nytt format" som en egen hypotes.

**2. Effektivitet överlever inte skala. `BEVISAD — nio av nio annonser.`**
Varje omätt annons gav mindre vinst per krona 09 aug än 06 aug, utom PD_1_H3 som låg still medan
den tog 2 972 kr till. De två som fick mest ny spend föll hårdast.
→ **Instruktion:** varje brief mäts på vinst per 1 000 kr **vid 2 000 kr och igen vid 4 000 kr**,
aldrig på första avläsningen. Och ingen får kallas vinnare under 2 000 kr spend.

**3. Billiga klick konverterar sämst. `BEVISAD — tredje körningen i rad.`**
De tre lägsta CTR-annonserna konverterar 5,0–6,3 % av klicken. De tre högsta 1,4–3,0 %.
→ **Instruktion:** CTR och CPC är inte mål. En brief som sänker CTR men höjer köp per klick är ett
framsteg. Det ska stå i varje brief så ingen "optimerar" bort det.

**4. PD-blockets klickkvalitet är fortfarande kontots svaghet. `BEVISAD, men obehandlad.`**
2,4 % köp per klick mot SP:s 4,4 %, över fem dömbara annonser och två format. Blocket bär 64 % av
den dömbara spenden.
→ **Instruktion:** omskrivningen har briefats två gånger och kört noll gånger. Batch #6 angriper
den från **bildsidan** i stället (`PD_19_1`, `PD_19_2`, `PD_20_C1`), där copy-mallen inte kan
störa.

**5. Karusell — `OTESTAD EFTER TVÅ FÖRSÖK.`**
`PD_6_C1`, `SO_9_C1`, `PD_15_C1` gick alla in som `object_type: SHARE` med en enda bild. Batch #5:s
två riktiga karuseller byggdes aldrig.
→ **Instruktion:** batch #6 gör tredje försöket. Kontrollera `child_attachments` i kontot efter
launch innan någon slutsats dras.

**6. Prisbevis i bild — `OTESTAT EFTER TVÅ FÖRSÖK.`**
`SO_8_1`/`SO_8_2` dog på identisk copy och för lite spend. `SO_14_1`/`SO_14_2` byggdes aldrig.
→ **Instruktion:** batch #6 kör `SO_17_1` mot `SO_16_1` — **samma fotografi**, enda skillnaden är
prisblocket. Kontrollen ligger redan i samma adset.

---

## VAD BUTIKSDATAN SÄGER (2026-08-05, oförändrad)

**Storlekar:** 6 - 18 hk · 20 - 30 hk · 40 - 60 hk · 60 - 90 hk · 100 - 150 hk · 175 - 250 hk.
Försäljningen koncentreras till **40 hk och uppåt**. Annonserna talar till en generisk "båtägare" —
köparen har en större och dyrare motor än så.

**Färger:** Svart står för nästan allt. **Mintgrön och Grön har sålt noll.** Svart i allt material.

**Trafiktyp:** 100 % kall prospektering. Retargeting-adset finns fortfarande inte. `PD_1_H3` ensam
har ungefär hundra fler lägg-i-varukorg än köp.

---

## Winning DNA (bevisat: ≥300 kr spend och ≥3 köp)

1. **`PD_1_H3` är kontots enda skalbara tillgång.** 116 köp, 46 % av spenden, och effektiviteten
   sjunker inte när den växer. Allt annat gör det. Skydda den.
2. **Kort, komplett demo är kontots effektivaste creative** — `PD_EXTRA` 1 376 kr/1 000 kr, bästa
   hold (22,2 %). **Men den har aldrig testats över 800 kr spend.** Behandla som skalningskandidat,
   inte som bevisad vinnare.
3. **SP-blocket konverterar klick bäst** (4,4 % mot 2,1 % och 2,4 %). Men bara två dömbara annonser
   och en av dem kollapsade — lovande, inte bevisat.
4. **Dyrare klick är bättre klick.** Mönster 3, tredje körningen.
5. **Copy-strukturen problem → mekanism → friktionssänkare → CTA** bär volymannonsen trots svag
   klickkvalitet. 116 köp och 59 % av all vinst.

## Losing DNA (bevisat)

1. **Skalning dödar allt utom PD_1_H3.** Mönster 2. Detta är den viktigaste raden i filen.
2. **PD-blockets klickkvalitet är kontots svagaste**, 2,4 % över fem annonser och två format.
   Copy-egenskap, inte format-egenskap.
3. **Overifierade claims ligger fortfarande live** — "Hundratals nöjda kunder" på fyra annonser,
   vinterdeadlinen på åtta. Fjärde körningen i rad detta står här.
4. **Att pausa ett helt adset under signifikansgrinden.** `SP Batch 5` pausades vid 718 kr och
   2 köp och tog med sig två obesvarade tester. Grinden gäller per annons.

> **Struken 2026-08-05:** "urgency utan bevis dödar CPA — SO_1_H1". SO_1_H1 kör identisk copy som
> SO_2. Copyn kan inte vara orsaken.
>
> **Struken 2026-08-06:** "säsongsfel deadline" som *prestationsförklaring*. `SO_2` kör samma
> vinterrubrik och är en av kontots bästa. Rubriken är fortfarande **förbjuden** — vi står inte
> bakom en påhittad deadline — men det finns inget dataunderlag för att den sänker resultatet.
>
> **Struken 2026-08-09:** "SP-copyn ger 1 145 kr/1 000 kr och har 11 % av spenden — skala den"
> (backlog B10, skriven 2026-08-06). `SP_5_H1` fick 1 505 kr till och gick från 1 405 till 77.
> Blocket halverades. **Rekommendationen byggde på två annonser varav en hade 687 kr spend.**
> Det var för tidigt, och analysmetodens varning om regression underviktades.

---

## Regler

**Behåll alltid**
- 299 kr / 367 kr exakt när pris visas · problem-först-öppning · dragsko runt hela kanten ·
  Handla nu-CTA · produkt i bild före sekund 4 · 420D Oxfordtyg, 6–250 hk, 30 dagars
  nöjd-kund-garanti · svart hölje i allt bildmaterial · universell passform (aldrig "formsytt")

**Testa kontrollerat (en variabel)**
- Flera **bilder** mot varandra med copyn låst — den största variabeln vi har
- Om hållbarhet vid skala är en formategenskap eller en filegenskap
- SP-blocket med fler talare, och utan talare i bild
- Riktig karusell mot enkel bild
- Prisbevis i bild mot samma bild utan pris

**Undvik**
- Enmetriks-domar: ROAS ensam, CPA ensam, hook ensam, CTR ensam
- Kill-beslut mot target-CPA. Kill mäts mot break-even 236 kr, **och trenden ska hålla i sig**
- Att kalla något en vinnare under 2 000 kr spend. Fyra gånger av fyra har det blivit fel
- Att pausa ett adset innan de enskilda annonserna passerat 300 kr och 3 köp
- Vinterreferenser · "innan lagret tar slut" · overifierade kundantal · "vattentät" · "formsytt"
- Att anta att briefad copy är den copy som körs. Verifiera i kontot varje gång

**Obevisat (hypoteser i test)**
- Att hållbarhet vid skala kommer av innehållsbredd (PD_1_H3 är lång och varierad). Hold-siffrorna
  pekar svagt åt det hållet men det är en gissning — batch #6 testar det direkt
- Karusellformatet — aldrig faktiskt kört
- Prisbevis i bild
- Storlekskvalificering — fjärde försöket i batch #6
- Retargeting — finns inte i kontot

## Kända luckor i underlaget

- **Bilderna kan inte granskas visuellt från denna miljö.** `*.fbcdn.net` blockeras av gatewayen
  (403 på CONNECT, verifierat **tre** körningar i rad). Detta är den enskilt största luckan: fem
  annonser med identisk copy spänner 34-faldigt, och orsaken är osynlig. Allt om vad bilderna
  *visar* är gissning tills någon laddar upp dem till Drive.
- **Videomanus saknas för batch #1** (`PD_1_H3`, `PD_EXTRA`, `SP_1_H1`, `SO_1_H1`, `SO_1_H2`).
  Jämförelserna bygger på verifierad body/rubrik ur kontot, inte på voiceover.
- **Inga recensioner nåbara.** Inga citat och inga kundantal får användas.
- **Köp per klick är beräknat på `ctr`, inte på länkklick.** Rangordningen håller, absolutnivåerna
  är ungefärliga.
