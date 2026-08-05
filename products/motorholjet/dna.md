# Creative DNA – Motorhöljet (Bäverbutiken)

**Produkt:** Marin Motorhölje 420D – Universellt Skydd · 299 kr (jämförpris 367 kr)
**LP:** https://baverbutiken.se/products/marin-motorholje-420d-universellt-skydd
**Konto:** MagiBorsten `1867947880635861` (SEK) · Kampanj `120249435814310291` · CBO 6 000 kr/dag
**Target-CPA (skalning):** 135 kr · **Break-even-CPA (kill):** 236 kr
**Senast uppdaterad:** 2026-08-05, tredje körningen (/cs → ANALYSMETOD.md + creative-teardown)

---

## Läget i siffror (livstid t.o.m. 2026-08-05)

| | Värde |
|---|---|
| Spend | 22 649 kr |
| Köp | 145 |
| **CPA** | **156 kr** |
| Mot break-even 236 kr | **34 % under** → kampanjen är lönsam |
| Mot target 135 kr | 16 % över → inte redo att skalas hårdare |
| Totalt vinstbidrag | ≈ 11 682 kr |

**Datakvalitet:** `omni_purchase_values` är trasigt i detta konto — 7 av 11 intäktsrader kom
tillbaka 100× för lågt. Räkna alltid intäkt som `spend × ROAS`, aldrig från värdefältet direkt.

---

## VINSTBIDRAG — den enda rankningen som gäller

`(break-even-CPA 236 − CPA) × köp`. Ingen annons under 300 kr spend eller 3 köp finns med:
de är **för tidiga**, inte dåliga.

| Annons | Format | Spend | Spendandel | Köp | CPA | **Vinstbidrag** | Vinstandel | kr vinst / 1 000 kr spend |
|---|---|---|---|---|---|---|---|---|
| Motorhölje_PD_1_H3 | video, lång demo | 14 566 kr | 64,3 % | 86 | 169,4 kr | **5 730 kr** | 49,0 % | 393 |
| Motorhölje_SP_1_H1 | video | 2 018 kr | 8,9 % | 17 | 118,7 kr | **1 994 kr** | 17,1 % | 988 |
| Motorhölje_SO_2 | **statisk** | 1 449 kr | 6,4 % | 13 | 111,5 kr | **1 619 kr** | 13,9 % | **1 117** |
| Motorhölje_PD_EXTRA | video, kort demo | 777 kr | 3,4 % | 8 | 97,1 kr | **1 111 kr** | 9,5 % | **1 430** |
| Motorhölje_SO_1_H1 | video | 1 933 kr | 8,5 % | 11 | 175,8 kr | **663 kr** | 5,7 % | 343 |
| Motorhölje_SO_1_H2 | video | 379 kr | 1,7 % | 4 | 94,7 kr | **565 kr** | 4,8 % | 1 491 |

**Bevakning (ingen dom än):** `Enginecover_SO_5_1` har passerat 300 kr (464 kr) men har bara
**1 köp** — den får därför ingen dom. Dess CPA är 464 kr, alltså dubbelt över break-even. **Regel:
vid 500 kr spend med fortsatt CPA över 236 kr är den ett killbeslut.** Kolla den vid nästa `/cs`.

**Läsanvisning (viktig, har gått fel två gånger):**

- **PD_1_H3 är kampanjens vinnare.** Den ger nästan hälften av all vinst. Att dess CPA ligger över
  target betyder att den inte ska skalas hårdare — **inte** att den ska pausas. Den är benchmark;
  alla andra jämförs mot den, aldrig tvärtom.
- **SO_1_H1 pausas inte.** CPA 175,6 kr ligger 60 kr under break-even, alltså tjänar varje order
  cirka 60 kr. Ett tidigare förslag att pausa den mätte mot target-CPA och var fel. Kill-beslut
  mäts **alltid** mot break-even 236 kr.
- **kr vinst per 1 000 kr spend** säger hur effektiv annonsen är; **vinstbidrag** säger hur mycket
  den faktiskt tjänar. Bägge behövs. En annons med 1 491 kr/1 000 kr på 379 kr spend är en
  **hypotes om skalbarhet**, inte ett bevis — den har aldrig testats i dyra auktioner.

---

## CREATIVE-TEARDOWN — vad i creativen som faktiskt driver vinsten

### Fyndet som ändrar allt: det finns bara tre copy-set

De sex dömbara annonserna kör tillsammans **tre** distinkta copy-set (PD, SP, SO). Flera annonser
delar copy exakt och skiljer sig bara i format. Det gör att vi för första gången kan skilja
copy-effekt från format-effekt.

**`Motorhölje_SO_2` och `Motorhölje_SO_1_H1` kör identisk body, identisk rubrik och identisk CTA.**
Enda skillnaden är att SO_2 är en statisk bild och SO_1_H1 är en video.

| | SO_2 (statisk) | SO_1_H1 (video) |
|---|---|---|
| Copy | SO-settet | **Samma SO-set** |
| CPA | 111,5 kr | 175,8 kr |
| kr vinst / 1 000 kr | **1 117** | 343 |

Samma ord. Tre gånger bättre avkastning i statiskt format. **Det var alltså aldrig copyn som var
problemet med SO_1_H1** — den slutsatsen stod i denna fil och är nu struken.

### Vinstbidrag grupperat per variabelvärde

**Per format:**

| Format | Spend | Vinstbidrag | kr vinst / 1 000 kr |
|---|---|---|---|
| Statisk | 1 449 kr | 1 619 kr | **1 117** |
| Video, kort demo | 777 kr | 1 111 kr | **1 430** |
| Video, övrigt | 4 330 kr | 3 222 kr | 744 |
| Video, lång demo | 14 566 kr | 5 730 kr | 393 |

**Per copy-set:**

| Copy-set | Spend | Vinstbidrag | kr vinst / 1 000 kr | LPV→köp |
|---|---|---|---|---|
| SP (social proof) | 2 018 kr | 1 994 kr | **988** | **6,4 %** |
| SO (offer) | 3 761 kr | 2 847 kr | 757 | 7,3 % |
| PD (produktdemo) | 15 343 kr | 6 841 kr | 446 | **2,3 %** |

PD:s låga siffra är delvis en skaleffekt — den har fått 66 % av spenden och tvingats ut i dyrare
auktioner. Men klickkvaliteten är inte en skaleffekt: se mönster 2.

### Mönster (tre bevisade, resten hypotes)

**1. Format bär mer än copy. `BEVISAD.`**
Identisk copy ger 1 117 kr/1 000 kr som statisk och 343 kr/1 000 kr som video. Statiskt format har
fått 6 % av spenden och gett 14 % av vinsten.
→ **Instruktion till nästa brief:** varje bevisad copy ska finnas som statisk. PD-copyn och
SP-copyn har aldrig körts statiskt — gör det. Testa karusell, ett format kontot aldrig kört.

**2. Klickkvalitet är en egenskap hos copyn, inte hos videon. `BEVISAD.`**
PD-copyn konverterar 2,3 % av landningssidebesöken till köp i **båda** sina annonser — två helt
olika videor, samma dåliga siffra. SP-copyn konverterar 6,4 %. Copyn avgör vem som klickar.
→ **Instruktion:** sluta optimera PD-hooken för fler klick. Kvalificera i stället bort fel klick
(motorstorlek, värde). Färre klick med bättre LPV→ATC är ett framsteg även om CTR faller.

**3. Kort demo slår lång demo. `BEVISAD.`**
`PD_EXTRA` (kort) 1 430 kr/1 000 kr mot `PD_1_H3` (lång) 393 kr/1 000 kr. Samma copy-set, samma
produkt, olika videolängd. PD_EXTRA har också kampanjens bästa hook (41,4 %) och completion (10,3 %).
→ **Instruktion:** nya videor kortas till ≤ 20 s om inte briefen uttryckligen säger annat. SP-copyn
ska läggas på PD_EXTRA:s footage (bästa CTR + bästa CVR i samma annons).

**4. Synligt prisbevis i bild — `HYPOTES, EJ BEVISAD.`**
Denna fil har tidigare påstått att SO_2 vinner för att den visar priset i bilden. **Det påståendet
var ogrundat** — bilden ligger bakom Facebooks CDN som denna miljö inte når, så ingen har sett den.
Påståendet är struket. Testas i stället kontrollerat: `SO_8_1` visar 367→299 i bild, `SO_8_2` är
identisk utan siffror.

**5. Passform är den troliga ATC-läckan — `HYPOTES.`**
Produkten säljs i sex hk-intervall och ingen annons har någonsin förklarat vilket som passar.
PD_1_H3 har 9,2 % LPV→ATC mot SP_1_H1:s 16,0 %. Testas med storleksguide, storlekskarusell och två
kvalificerande hooks.

---

## FUNNELN

| Annons | kr/utgående klick | LPV→ATC | ATC→köp | LPV→köp |
|---|---|---|---|---|
| PD_1_H3 (volymbäraren) | **6,65 kr (billigast)** | **9,2 % (sämst)** | 47,5 % | **4,4 % (sämst)** |
| SP_1_H1 | 11,22 kr (dyrast) | 16,0 % | **68,0 %** | **10,9 % (bäst)** |
| SO_1_H2 | 6,89 kr | **17,3 %** | 44,4 % | 7,7 % |
| SO_2 (statisk) | 9,87 kr | 12,9 % | 68,8 % | 8,9 % |
| SO_1_H1 | 7,52 kr | 13,7 % | 39,3 % | 5,4 % |

PD_1_H3 köper kampanjens billigaste klick och konverterar dem sämst. SP_1_H1 köper de dyraste och
konverterar dem dubbelt så bra. **Optimera mot LPV→ATC och LPV→köp, aldrig mot CTR ensamt.**

## VAD BUTIKSDATAN SÄGER (hämtad 2026-08-05)

**Storlekar:** 6 - 18 hk · 20 - 30 hk · 40 - 60 hk · 60 - 90 hk · 100 - 150 hk · 175 - 250 hk.
Försäljningen koncentreras till **40 hk och uppåt**; 6-18 rör sig knappt. Annonserna talar i dag
till en generisk "båtägare" — köparen har en större och dyrare motor än så.

**Färger:** Svart står för den stora majoriteten. **Mintgrön och Grön har sålt noll.** Färg är
alltså ingen säljvinkel. Använd svart i allt bildmaterial.

**Trafiktyp:** 100 % kall prospektering. Ingen retargeting finns. PD_1_H3 ensam har genererat
177 lägg-i-varukorg mot 86 köp — cirka 90 övergivna varukorgar som ingenting i kontot talar till.

## Så läser vi CPA

**CPA mätt på olika spendnivåer är inte jämförbara.** En annons som fått 400 kr har bara fått Metas
billigaste och varmaste visningar. En annons som fått 14 000 kr har tvingats ut i dyrare auktioner
mot kallare publik. Låg CPA på låg spend är systematiskt smickrad, inte bevisad.

Ett tidigare "effektivitetsindex" (kampanjens CPA delat med annonsens) rankade PD_1_H3 sist just
därför att den var den enda som testats i skala. **Det indexet är avskaffat.** Rangordning sker på
vinstbidrag.

## Winning DNA (bevisat: ≥300 kr spend och ≥3 köp)

1. **Statiskt format bär mer vinst per krona än video.** SO_2: 1 117 kr/1 000 kr på 6 % av spenden.
   Identisk copy i video ger 343. Formatet är kraftigt underexploaterat.
2. **Kort, komplett demo slår lång demo.** PD_EXTRA: CPA 97,08 kr · 1 430 kr/1 000 kr · hook 41,4 %
   · completion 10,3 %. Samma copy som PD_1_H3, annan video → hela skillnaden ligger i videon.
3. **Social proof-copyn ger den bästa klickkvaliteten i kontot.** SP_1_H1: LPV→köp 10,9 % och
   ATC→köp 68,0 % trots kampanjens lägsta CTR (1,65 %). Färre men varmare klick.
4. **Offer-vinkeln fungerar.** SO-settet ger 757 kr/1 000 kr och SO_1_H2 har kampanjens bästa CPA
   bland dömbara (94,67 kr). Vad i offern som gör jobbet är däremot inte utrett — se hypotes 4 ovan.
5. **Copy-strukturen problem → mekanism → friktionssänkare → CTA** bär volymannonsen (PD_1_H3,
   86 köp, 49 % av all vinst).

## Losing DNA (bevisat)

1. **Lång demo tappar effektivitet.** PD_1_H3 ger 393 kr/1 000 kr mot PD_EXTRA:s 1 430 kr. Den är
   fortfarande kampanjens största vinstkälla i absoluta tal — den ska förbättras, inte bort.
2. **Säsongsfel deadline.** "innan vintern" kördes i augusti. Används inte igen före 1 september.
3. **Overifierade claims.** "Hundratals nöjda kunder" kan inte beläggas (inga recensioner) —
   utfasat permanent.
4. **PD-copyns klickkvalitet är kontots svagaste.** 2,3 % LPV→köp i två olika videor. Detta är en
   copy-egenskap, inte en video-egenskap.

> **Struken 2026-08-05:** posten "urgency utan bevis dödar CPA — SO_1_H1" togs bort. SO_1_H1 kör
> **identisk copy** som SO_2, kontots näst mest lönsamma annons per krona. Copyn kan alltså inte
> vara orsaken. Skillnaden är formatet. Posten stod kvar i tre veckor och hade lett till att vi
> kastat en fungerande copy.

## Hook rate (p25/plays) — alla videor med >100 plays

| Annons | Hook | Hold p50 | Completion |
|---|---|---|---|
| PD_EXTRA | **41,4 %** | 22,4 % | 10,3 % |
| SP_5_H1 | 38,2 % | 18,4 % | 5,5 % |
| SO_4_H1 | 35,9 % | 23,9 % | 12,0 % |
| PD_1_H3 | 35,5 % | 22,4 % | 7,3 % |
| SP_1_H2 | 35,4 % | 19,8 % | 10,2 % |
| SO_1_H1 | 30,2 % | 14,7 % | 4,2 % |
| PD_4_H1 | 30,0 % | 16,0 % | 4,0 % |
| SP_1_H1 | 29,4 % | 14,0 % | 5,7 % |
| PD_7_H1 | 29,0 % | 15,6 % | 7,8 % |
| SO_1_H2 | 24,5 % | 14,5 % | 5,0 % |
| PD_3_H1 | 22,9 % | 13,7 % | 7,6 % |

**Data:** hook över ~35 % är tröskeln för de annonser som konverterar billigt.
**Hypotes:** completion korrelerar starkare med vinstbidrag än hook gör — PD_EXTRA har högst
completion och högst vinst per krona. **Varning:** hook och hold finns inte alls för statiska
annonser, och statiska är kontots mest lönsamma format. Hook/hold får aldrig ensamt avgöra något.

---

## Regler

**Behåll alltid**
- 299 kr / 367 kr exakt när pris visas · problem-först-öppning · "universell passform, enkel att
  sätta på/ta av" · Handla nu-CTA · produkt i bild före sekund 4 · 420D Oxfordtyg, 6–250 hk,
  30 dagars nöjd-kund-garanti · svart hölje i allt bildmaterial

**Testa kontrollerat (en variabel)**
- Bevisad copy i nytt format (statisk, karusell) — starkaste öppna hävstången
- Kvalificerande hook på PD-bodyn (mot klickkvalitet, inte mot CTR)
- Synligt prisbevis i bild vs inget (SO_8_1 mot SO_8_2)
- Kort (≤20 s) vs lång demo på samma body
- SP-copy-VO på PD_EXTRA-footage

**Undvik**
- Enmetriks-domar: ROAS ensam, CPA ensam, hook ensam. Ranka på vinstbidrag.
- Kill-beslut mot target-CPA. Kill mäts mot break-even 236 kr.
- Vinterreferenser före 1 september · overifierade kundantal
- CTR-optimering utan CVR-koll

**Obevisat (hypoteser i test)**
- Prisbevis i bild som mekanism (påståendet var ogrundat, testas nu kontrollerat)
- Passform/storleksförvirring som ATC-läcka
- Karusellformatet — aldrig kört i kontot
- Retargeting — finns inte i kontot, ~90 övergivna varukorgar obearbetade
- Försäkrings-reframe (SO_4_H1, hook 35,9 %, completion 12,0 % — bästa ledande indikatorer)
- Skeptiker-UGC (SP_5_H1, hook 38,2 %)
- Utseende/andrahandsvärde-vinkeln — ingen dömbar data än

## Ledande indikatorer när köpen är för få (använd dessa under 300 kr)

Vattentestet (PD_7_H1) såg bäst ut på ROAS men sämst på det som inte hänger på ett enda köp:
hook 29,0 % och CTR 1,62 %. Försäkringsvinkeln (SO_4_H1) hade hook 35,9 % **och kampanjens högsta
completion 12,0 %**. Skeptiker-UGC (SP_5_H1) hade näst bästa hook 38,2 %.

Rangordning på ledande indikatorer, inte på ROAS:
1. **SO_4_H1** (försäkring) — starkast stöd
2. **SP_5_H1** (skeptiker)
3. **PD_7_H1** (vattentest) — svagast

## Kända luckor i underlaget

- **Statiska annonsbilder kan inte granskas visuellt från denna miljö.** Facebooks CDN
  (`*.fbcdn.net`, `facebook.com`) blockeras av gatewayen med 403 på CONNECT. `SO_2` — kontots mest
  lönsamma statiska — har därför aldrig setts. Allt om vad dess bild *visar* är hypotes tills någon
  laddar upp den.
- **Videomanus saknas för batch #1** (`PD_1_H3`, `PD_EXTRA`, `SP_1_H1`, `SO_1_H1`, `SO_1_H2`). De
  launchades före OS:et. Copy-jämförelsen ovan bygger på annonsernas **texter** (body/rubrik/CTA)
  från kontot, vilka är verifierade — inte på voiceovern, som är okänd.
- **Inga recensioner nåbara.** Ingen reviews-app svarar, så inga citat får användas.
