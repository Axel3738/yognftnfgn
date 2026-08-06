# Creative DNA – Motorhöljet (Bäverbutiken)

**Produkt:** Marin Motorhölje 420D – Universellt Skydd · 299 kr (jämförpris 367 kr)
**LP:** https://baverbutiken.se/products/marin-motorholje-420d-universellt-skydd
**Konto:** MagiBorsten `1867947880635861` (SEK) · Kampanj `120249435814310291` · CBO 6 000 kr/dag
**Target-CPA (skalning):** 135 kr · **Break-even-CPA (kill):** 236 kr
**Senast uppdaterad:** 2026-08-06, fjärde körningen (/cs → batch #4 launchad, creative-verifiering)

---

## ⚠️ LÄS DETTA FÖRST — kontot kör inte den copy vi briefar

Vid verifiering 2026-08-06 av alla 17 launchade batch-#4-annonser: **ingen enda kör den
briefade copyn.** Samtliga ärvde ett av tre gamla textblock från batch #1. Kontrollerat direkt
mot `ads_get_creatives` (body + title), inte gissat.

Tre konsekvenser:

1. **Förbjudna claims ligger live.** Rubriken `Skydda din motor – innan vintern` och raden
   `Beställ innan lagret tar slut 👇` kör på SO_2, SO_5_1, SO_8_1, SO_8_2, SO_9_C1. Raden
   `Hundratals nöjda kunder redan.` kör på SP_5_H1, SP_8_1, SP_8_2. Alla tre är sedan tidigare
   utfasade i denna fil.
2. **Alla isolerade variabler i batch #4 är döda.** `SO_8_1` vs `SO_8_2` skulle isolera pris i
   bild — båda kör nu identisk copy utan pris i bodyn. `PD_13_1` vs `PD_13_2` skulle isolera en
   kvalificerande rad — båda kör identisk copy. Ingen av de testerna kan avläsas.
3. **Karusellerna är inte karuseller.** `PD_6_C1`, `SO_9_C1` och `PD_15_C1` har alla
   `object_type: SHARE` med **ett enda `image_hash` och inga `child_attachments`**. De är
   enkla statiska bilder. Karusellformatet har fortfarande aldrig testats i detta konto.

**Regel härifrån:** varje `/cs` börjar med att läsa `body` och `title` på de nya annonserna och
jämföra mot briefen. Data på en annons som kör fel copy mäter inte det vi trodde.

---

## Läget i siffror (livstid t.o.m. 2026-08-06)

| | Värde |
|---|---|
| Spend, hela kampanjen | ≈ 26 900 kr |
| Köp | 174 (dömbara annonser) |
| **CPA, dömbara** | **152 kr** |
| Mot break-even 236 kr | 36 % under → lönsam |
| Mot target 135 kr | 12 % över |
| Vinstbidrag, dömbara | ≈ 14 669 kr |

**Datakvalitet:** `omni_purchase_values` är trasigt i detta konto — räkna alltid intäkt som
`spend × ROAS`. **Ny observation:** `PD_EXTRA` visar 8 köp men bara 7 lägg-i-varukorg
(ATC→köp 114 %). Attributionsbrus på små tal — använd inte ATC→köp som beslutsmetrik under
~20 köp.

---

## VINSTBIDRAG — den enda rankningen som gäller

`(break-even-CPA 236 − CPA) × köp`. Signifikansgrind: **≥300 kr spend OCH ≥3 köp**.
Nio annonser är dömbara nu, mot sex förra körningen.

| Annons | Format | Copy-set | Spend | Sp% | Köp | CPA | **Vinstbidrag** | V% | kr/1 000 kr |
|---|---|---|---|---|---|---|---|---|---|
| Motorhölje_PD_1_H3 | video lång | PD | 16 156 | 61,2 % | 97 | 166,6 | **6 737** | 45,9 % | 417 |
| Motorhölje_SP_1_H1 | video | SP | 2 174 | 8,2 % | 19 | 114,4 | **2 310** | 15,7 % | 1 063 |
| Motorhölje_SO_2 | statisk | SO | 1 796 | 6,8 % | 15 | 119,7 | **1 744** | 11,9 % | 971 |
| Motorhölje_PD_EXTRA | video kort | PD | 784 | 3,0 % | 8 | 98,1 | **1 104** | 7,5 % | **1 407** |
| Enginecover_SP_5_H1 | video | SP | 687 | 2,6 % | 7 | 98,2 | **965** | 6,6 % | **1 405** |
| Motorhölje_SO_1_H1 | video | SO | 1 998 | 7,6 % | 11 | 181,6 | **598** | 4,1 % | 299 |
| Motorhölje_SO_1_H2 | video | SO | 379 | 1,4 % | 4 | 94,7 | **565** | 3,9 % | **1 493** |
| Enginecover_SO_5_1 | statisk | SO | 1 894 | 7,2 % | 10 | 189,4 | **466** | 3,2 % | 246 |
| Enginecover_PD_6_C1 | statisk | PD | 528 | 2,0 % | 3 | 176,0 | **180** | 1,2 % | 341 |

**Ingen annons ska pausas.** Alla nio ligger under break-even 236 kr och tjänar pengar per order.
Kill-beslut mäts mot 236, aldrig mot target 135.

**PD_1_H3 är fortfarande benchmark** — 61 % av spenden, 46 % av vinsten, nu 97 köp. Att dess CPA
ligger över target betyder att den inte ska skalas hårdare, inte att den ska bort.

---

## CREATIVE-TEARDOWN

### Det naturliga experimentet: fyra annonser, identisk copy

SO-copyblocket kör oförändrat på fyra dömbara annonser. Body, rubrik och CTA är **exakt
desamma** — verifierat i kontot. Enda skillnaden är själva creativen.

| Annons | Format | CPA | kr/1 000 kr | LPV→ATC |
|---|---|---|---|---|
| Motorhölje_SO_1_H2 | video | 94,7 | **1 493** | 17,3 % |
| Motorhölje_SO_2 | statisk | 119,7 | **971** | 12,6 % |
| Motorhölje_SO_1_H1 | video | 181,6 | 299 | 14,3 % |
| Enginecover_SO_5_1 | statisk | 189,4 | 246 | 20,3 % |

**Detta rev sönder förra körningens huvudslutsats.** Då fanns bara SO_2 och SO_1_H1 i settet, och
skillnaden mellan dem tolkades som *format* (statisk slår video). Med fyra annonser syns det att
spridningen **inom** format är större än mellan format: två statiska med identisk copy skiljer
4× i avkastning (971 mot 246), och den bästa i hela settet är en video (1 493).

**Slutsatsen "format bär mer än copy" är därmed falsifierad.** Se mönster 1.

### Vinstbidrag per variabelvärde

**Per format:**

| Format | Spend | Vinstbidrag | kr/1 000 kr |
|---|---|---|---|
| Video, kort | 784 kr | 1 104 kr | **1 407** |
| Video, övrigt | 5 238 kr | 4 438 kr | 847 |
| Statisk | 4 218 kr | 2 390 kr | 567 |
| Video, lång | 16 156 kr | 6 737 kr | 417 |

Statisk låg på 1 117 kr/1 000 förra körningen och ligger på 567 nu. Hela den siffran var
**en enda annons** (SO_2). När SO_5_1 och PD_6_C1 blev dömbara halverades gruppen.

**Per copy-set:**

| Copy-set | Spend | Vinstbidrag | kr/1 000 kr | LPV→köp | Antal dömbara annonser |
|---|---|---|---|---|---|
| **SP (social proof)** | 2 861 kr | 3 275 kr | **1 145** | **11,3 %** | 2 |
| SO (offer) | 6 066 kr | 3 374 kr | 556 | 7,5 % | 4 |
| PD (produktdemo) | 17 468 kr | 8 020 kr | 459 | **4,6 %** | 3 |

### FUNNELN

| Annons | kr/utgående klick | LPV→ATC | LPV→köp | ATC→köp |
|---|---|---|---|---|
| PD_1_H3 | **6,71 (billigast klass)** | 9,4 % | **4,5 % (sämst)** | 48 % |
| SP_1_H1 | 11,09 | 17,0 % | **11,1 %** | 66 % |
| SP_5_H1 | 9,54 | **20,0 %** | **11,7 % (bäst)** | 58 % |
| SO_5_1 | 11,76 (dyrast) | **20,3 %** | 8,5 % | 42 % |
| SO_1_H2 | 6,89 | 17,3 % | 7,7 % | 44 % |
| SO_2 | 10,50 | 12,6 % | 9,9 % | 79 % |
| SO_1_H1 | 7,54 | 14,3 % | 5,2 % | 37 % |
| PD_EXTRA | 5,85 | 5,6 % | 6,3 % | 114 %* |
| PD_6_C1 | **4,71 (billigast)** | 6,5 % | 3,9 % | 60 % |

\* attributionsbrus, se datakvalitet.

**Mönstret i funneln är entydigt:** de annonser som köper de billigaste klicken (PD_1_H3 4,5 %,
PD_6_C1 3,9 %) konverterar sämst. De som köper de dyraste (SP_5_H1, SO_5_1) konverterar bäst.
Billiga klick är inte en tillgång i det här kontot.

### Hook / hold (p25 och p50 av plays)

| Annons | Hook | Hold p50 | Completion |
|---|---|---|---|
| PD_EXTRA | **41,2 %** | **22,3 %** | **10,3 %** |
| SP_5_H1 | 35,2 % | 17,0 % | 5,0 % |
| PD_1_H3 | 34,7 % | 21,8 % | 7,1 % |
| PD_7_H1 | 31,8 % | 18,5 % | 8,5 % |
| SO_1_H1 | 30,1 % | 14,6 % | 4,2 % |
| SP_1_H1 | 28,6 % | 13,6 % | 5,5 % |
| SO_1_H2 | 24,5 % | 14,5 % | 5,0 % |
| SO_4_H1 | 23,5 % | 14,9 % | 7,3 % |

**Varning:** `SO_1_H2` har settets sämsta hook (24,5 %) och settets **bästa** vinst per krona
(1 493). `SP_1_H1` har låg hook och näst bästa vinst. Hook rate förutsäger inte vinst i detta
konto. Använd den som diagnos, aldrig som urvalskriterium.

---

## Mönster

**1. Format är INTE huvudvariabeln. `FALSIFIERAD HYPOTES — tidigare felaktigt bevisad.`**
Med identisk copy och fyra annonser spänner statiska från 246 till 971 kr/1 000 kr och videor från
299 till 1 493. Spridningen inom format är större än mellan format. Den enskilda creativen — vilken
bild, vilket klipp — avgör mer än formatvalet.
→ **Instruktion:** sluta brief:a "samma copy i nytt format" som en egen hypotes. Testa i stället
flera *bilder* mot varandra med copy låst. Batch #5 gör det med tre SP-statiska.

**2. Klickkvalitet är en egenskap hos copyn. `BEVISAD — nu på fler annonser.`**
SP-copyn konverterar 11,1 % och 11,7 % i två oberoende annonser med olika talare och olika klipp.
PD-copyn ligger på 4,5 %, 6,3 % och 3,9 % i tre annonser inklusive ett helt nytt statiskt format.
Detta är kontots stabilaste mönster.
→ **Instruktion:** SP-copyn har 11 % av spenden och ger 1 145 kr/1 000 kr. Skala den. PD-bodyn
ska **skrivas om**, inte hookas om — formattransfern till statisk (PD_6_C1) sänkte LPV→ATC till
6,5 %, sämre än videon.

**3. Billiga klick konverterar sämst. `BEVISAD.`**
kr per utgående klick korrelerar negativt med LPV→köp över alla nio dömbara annonser. De två
billigaste klicken (4,71 och 6,71 kr) hör till de två sämsta konverterarna.
→ **Instruktion:** CTR och CPC är inte mål. En brief som sänker CTR men höjer LPV→ATC är ett
framsteg. Skriv det i varje brief så ingen "optimerar" bort det.

**4. Karusell — `OTESTAD, INTE MISSLYCKAD.`**
PD_6_C1 gick som enkel bild, inte karusell. Formatet är fortfarande obeprövat.
→ **Instruktion:** batch #5 bygger två riktiga karuseller. Kontrollera `child_attachments` i
kontot efter launch innan någon slutsats dras.

**5. Prisbevis i bild — `FORTFARANDE OTESTAD.`**
SO_8_1/SO_8_2-paret skulle isolera det men fick fel copy och för lite spend (117 kr respektive
3 kr). Testet görs om i batch #5.

---

## VAD BUTIKSDATAN SÄGER (2026-08-05)

**Storlekar:** 6 - 18 hk · 20 - 30 hk · 40 - 60 hk · 60 - 90 hk · 100 - 150 hk · 175 - 250 hk.
Försäljningen koncentreras till **40 hk och uppåt**. Annonserna talar i dag till en generisk
"båtägare" — köparen har en större och dyrare motor än så.

**Färger:** Svart står för den stora majoriteten. **Mintgrön och Grön har sålt noll.** Använd
svart i allt bildmaterial.

**Trafiktyp:** 100 % kall prospektering. Ingen retargeting finns. PD_1_H3 ensam har 201
lägg-i-varukorg mot 97 köp — cirka 104 övergivna varukorgar som ingenting talar till.

---

## Winning DNA (bevisat: ≥300 kr spend och ≥3 köp)

1. **SP-copyn är kontots mest värdefulla tillgång.** 1 145 kr vinst per 1 000 kr spend, LPV→köp
   11,3 % över två oberoende annonser. Den har bara 11 % av spenden.
2. **Kort, komplett demo slår lång demo.** PD_EXTRA: 1 407 kr/1 000 kr, hook 41,2 %, hold 22,3 %,
   completion 10,3 % — bäst på alla tre. Samma copy-set som PD_1_H3, annan video.
3. **Dyrare klick är bättre klick.** Se mönster 3.
4. **Copy-strukturen problem → mekanism → friktionssänkare → CTA** bär volymannonsen (97 köp,
   46 % av all vinst) trots svag klickkvalitet.
5. **Offer-vinkeln fungerar i sig** (SO-settet 556 kr/1 000 kr), men *vilken* creative som bär den
   avgör fyrfaldigt. Se det naturliga experimentet.

## Losing DNA (bevisat)

1. **PD-copyns klickkvalitet är kontots svagaste.** 4,5 % / 6,3 % / 3,9 % LPV→köp i tre annonser
   och två format. Detta är en copy-egenskap, inte en video- eller formategenskap.
2. **Lång demo tappar effektivitet.** PD_1_H3 417 kr/1 000 kr mot PD_EXTRA 1 407. Största
   vinstkällan i absoluta tal — förbättras, tas inte bort.
3. **Overifierade claims.** "Hundratals nöjda kunder" kan inte beläggas. **Ligger fortfarande
   live på tre annonser** — se varningen överst.

> **Struken 2026-08-05:** "urgency utan bevis dödar CPA — SO_1_H1". SO_1_H1 kör identisk copy som
> SO_2. Copyn kan inte vara orsaken.
>
> **Struken 2026-08-06:** "säsongsfel deadline — innan vintern kördes i augusti" som
> *prestationsförklaring*. `SO_2` kör exakt samma vinterrubrik och är kontots tredje bästa
> vinstbidragare. Vinterrubriken är fortfarande **förbjuden** — den är säsongsfel och vi står inte
> bakom den — men det finns inget dataunderlag för att den sänker resultatet. Skilj på
> varumärkesregel och bevisat mönster.

---

## Regler

**Behåll alltid**
- 299 kr / 367 kr exakt när pris visas · problem-först-öppning · dragsko runt hela kanten ·
  Handla nu-CTA · produkt i bild före sekund 4 · 420D Oxfordtyg, 6–250 hk, 30 dagars
  nöjd-kund-garanti · svart hölje i allt bildmaterial

**Testa kontrollerat (en variabel)**
- Flera **bilder** mot varandra med copyn låst — den variabel som visat sig störst
- SP-copyn i fler format och med fler talare (portabilitetstest)
- Omskriven PD-body mot nuvarande PD-body
- Riktig karusell mot enkel bild
- Prisbevis i bild vs inget, med korrekt copy denna gång

**Undvik**
- Enmetriks-domar: ROAS ensam, CPA ensam, hook ensam, CTR ensam
- Kill-beslut mot target-CPA. Kill mäts mot break-even 236 kr.
- Att dra formatslutsatser ur en enda annons per format — det gjordes 2026-08-05 och blev fel
- Vinterreferenser · "innan lagret tar slut" · overifierade kundantal
- Att anta att briefad copy är den copy som körs. Verifiera i kontot.

**Obevisat (hypoteser i test)**
- Prisbevis i bild som mekanism
- Karusellformatet — aldrig faktiskt kört
- Passform/storleksförvirring som ATC-läcka (PD_6_1 fick 28 kr, otestad)
- Retargeting — finns inte i kontot, ~104 övergivna varukorgar obearbetade
- Vad som gör SO_2:s bild 4× bättre än SO_5_1:s. **Kan inte utredas** — se luckor.

## Kända luckor i underlaget

- **Bilderna kan inte granskas visuellt från denna miljö.** `*.fbcdn.net` blockeras av gatewayen
  (403 på CONNECT, verifierat två körningar i rad). Det är nu den enskilt största luckan: det
  naturliga experimentet visar att bilden är den viktigaste variabeln, och den är osynlig för
  analysen. Allt om vad bilderna *visar* är gissning tills någon laddar upp dem.
- **Videomanus saknas för batch #1** (`PD_1_H3`, `PD_EXTRA`, `SP_1_H1`, `SO_1_H1`, `SO_1_H2`).
  Copy-jämförelserna bygger på annonsernas verifierade body/rubrik ur kontot, inte på voiceover.
- **Inga recensioner nåbara.** Inga citat får användas.
