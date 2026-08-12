# Creative DNA – Motorhöljet (Bäverbutiken)

**Produkt:** Marin Motorhölje 420D – Universellt Skydd · 299 kr (jämförpris 367 kr)
**LP:** https://baverbutiken.se/products/marin-motorholje-420d-universellt-skydd
**Konto:** MagiBorsten `1867947880635861` (SEK) · Kampanj `120249435814310291` · CBO **4 000 kr/dag**
**Target-CPA (skalning):** 135 kr · **Break-even-CPA (kill):** 236 kr
**Senast uppdaterad:** 2026-08-12, sjätte körningen (/cs → batch #7 briefad)

---

## 🔴 LÄS DETTA FÖRST — kampanjen förlorar pengar på ny spend

| Fönster | Spend | Köp | CPA | Mot break-even 236 kr |
|---|---|---|---|---|
| Livstid | 54 788 kr | 275 | 199 kr | lönsam |
| Senaste 7 dygn | 36 186 kr | 151 | 240 kr | på gränsen |
| **Senaste 3 dygn** | **13 084 kr** | **45** | **291 kr** | **−55 kr per order** |

De tre senaste dygnen förstörde ungefär **2 400 kr** i täckningsbidrag. Frekvens **2,83** livstid,
**1,89 på tre dygn**.

**Den nya ledande hypotesen: problemet är publiken, inte creativen.** Samtliga tolv annonser som
gick att mäta om föll i effektivitet mellan 9 och 12 augusti — inklusive `PD_1_H3`, som aldrig
fallit förut. När allt sjunker samtidigt medan frekvensen stiger är det publiken som tar slut, inte
creativen som blivit sämre. **Märkt HYPOTES**, men den är starkare än alternativen och den styr
batch #7.

**Konsekvens för hur nästa batch ska läsas:** reach och frekvens vid jämförbar spend är nu en
primär mätpunkt, inte en fotnot. En creative som når nya människor till något sämre CPA är värd mer
just nu än en som konverterar bättre mot samma uttömda pool.

---

## Läget i siffror (livstid t.o.m. 2026-08-12)

| | Värde |
|---|---|
| Spend, hela kampanjen | 54 788 kr |
| Köp, hela kampanjen | 275 |
| Spend, dömbara annonser | 51 574 kr |
| Köp, dömbara | 268 |
| **CPA, dömbara** | **192 kr** |
| Vinstbidrag, dömbara | **11 675 kr** (var 14 075 kr den 9 aug) |
| Frekvens | 2,83 |

**Vinsten sjönk med 2 400 kr medan spenden växte med 9 950 kr.** Marginell CPA på den nya spenden:
**311 kr**. Det är kärnan i läget.

**Datakvalitet:** `omni_purchase_values` reconcilierade mot `spend × ROAS` på **alla femton**
dömbara rader (±0,1 %). `spend / köp` stämde mot `cost_per_omni_purchase` på alla rader. Det
100×-fel som flaggades 2026-08-05 syns inte längre — kör kontrollen ändå varje gång.

---

## VINSTBIDRAG — den enda rankningen som gäller

`(break-even-CPA 236 − CPA) × köp`. Signifikansgrind: **≥300 kr spend OCH ≥3 köp**.
**Femton annonser är dömbara nu**, mot tolv förra körningen.

| Annons | Format | Block | Spend | Sp% | Köp | CPA | **Vinstbidrag** | V% | kr/1 000 |
|---|---|---|---|---|---|---|---|---|---|
| Motorhölje_PD_1_H3 | video lång | PD | 21 666 | 42,0 % | 123 | 176,14 | **7 363** | 63,1 % | 340 |
| Motorhölje_SP_1_H1 | video | SP | 2 749 | 5,3 % | 21 | 130,92 | **2 207** | 18,9 % | 803 |
| Motorhölje_SO_2 | statisk | SO | 2 772 | 5,4 % | 18 | 154,01 | **1 476** | 12,6 % | 532 |
| Motorhölje_PD_EXTRA | video kort | PD | 803 | 1,6 % | 8 | 100,38 | **1 085** | 9,3 % | 1 351 |
| Enginecover_SO_5_1 | statisk | SO | 5 858 | 11,4 % | 29 | 202,00 | **986** | 8,4 % | 168 |
| **Enginecover_SO_4_H1** | video kort | SO | 434 | 0,8 % | 5 | **86,75** | **746** | 6,4 % | **1 721** |
| Motorhölje_SO_1_H2 | video | SO | 418 | 0,8 % | 4 | 104,46 | **526** | 4,5 % | 1 259 |
| Motorhölje_SO_1_H1 | video | SO | 2 154 | 4,2 % | 11 | 195,79 | **442** | 3,8 % | 205 |
| Enginecover_PD_8_1 | statisk | PD | 735 | 1,4 % | 4 | 183,84 | **209** | 1,8 % | 284 |
| Enginecover_SP_5_H1 | video | SP | 2 552 | 4,9 % | 10 | 255,24 | **−192** | −1,6 % | −75 |
| Enginecover_PD_7_H1 | video | PD | 1 372 | 2,7 % | 4 | 343,10 | **−428** | −3,7 % | −312 |
| Enginecover_PD_16_H1 | video | PD | 1 174 | 2,3 % | 3 | 391,26 | **−466** | −4,0 % | −397 |
| Enginecover_SO_8_1 | statisk | SO | 1 417 | 2,7 % | 4 | 354,33 | **−473** | −4,1 % | −334 |
| Enginecover_PD_6_1 | statisk | PD | 2 470 | 4,8 % | 7 | 352,92 | **−818** | −7,0 % | −331 |
| Enginecover_PD_6_C1 | statisk | PD | 4 999 | 9,7 % | 17 | 294,04 | **−987** | −8,5 % | −197 |

**`SO_4_H1` är kontots mest effektiva annons och har 0,8 % av spenden.** CPA 86,75 kr, 1 721 kr per
1 000 kr, och **11,9 % av klicken köper** — dubbelt så bra som näst bästa annons. Den har aldrig
itererats. Batch #7 gör det med fyra creatives.

**`PD_1_H3` är fortfarande benchmark** — 42 % av spenden, 63 % av vinsten, 123 köp. Men se mönster 2.

**Sex annonser förlorar pengar.** Fem är pausade (`PD_6_C1`, `PD_6_1`, `PD_7_H1`, `PD_16_H1`,
`SP_5_H1`) — alla korrekt. `SO_8_1` är fortfarande aktiv och har spenderat 508 kr sedan 9 augusti
utan ett enda nytt köp. **Pausa den.**

> **Rättelse 2026-08-12:** förra körningen rekommenderade jag att pausa **både** `SO_8_1` och
> `SO_5_1`. `SO_5_1` pausades inte — och sedan dess har den tagit 1 313 kr och gjort 7 köp, alltså
> **CPA 188 kr**, klart under break-even. Rekommendationen byggde på en 7-dygnstrend som vände.
> `SO_8_1`-delen höll; `SO_5_1`-delen var fel. Trendläsning på tre dygn räcker inte för kill.

---

## CREATIVE-TEARDOWN

### Vinstbidrag per copy-block

| Block | Spend | Köp | CPA | Vinstbidrag | kr/1 000 | Köp/klick | Dömbara |
|---|---|---|---|---|---|---|---|
| **SP (social proof)** | 5 302 kr | 31 | 171,0 | 2 014 kr | **380** | **4,3 %** | 2 |
| SO (offer) | 13 053 kr | 71 | 183,8 | 3 703 kr | 284 | 2,4 % | 6 |
| PD (produktdemo) | 33 219 kr | 166 | 200,1 | 5 957 kr | 179 | 2,2 % | 7 |

SP leder fortfarande men försprånget krymper för varje körning: 1 145 → 550 → **380**. Och det
vilar på två annonser varav en är pausad med negativt bidrag. Behandla SP som lovande, aldrig som
bevisat.

### Det naturliga experimentet — sex annonser, identisk SO-copy

| Annons | Format | CPA | kr/1 000 |
|---|---|---|---|
| Enginecover_SO_4_H1 | video kort | 86,75 | **1 721** |
| Motorhölje_SO_1_H2 | video | 104,46 | 1 259 |
| Motorhölje_SO_2 | statisk | 154,01 | 532 |
| Motorhölje_SO_1_H1 | video | 195,79 | 205 |
| Enginecover_SO_5_1 | statisk | 202,00 | 168 |
| Enginecover_SO_8_1 | statisk | 354,33 | **−334** |

**Spridningen är nu oändlig i praktiken** — från −334 till 1 721 med exakt samma ord. Samma sak i
PD-blocket: 1 351 (PD_EXTRA) ner till −397 (PD_16_H1), identisk copy.

### Klickkvalitet — mönstret är nu entydigt

Köp per klick, beräknat som `köp / (ctr × impressions)`. Grov proxy, men rangordningen håller.

| Annons | CTR | Köp/klick |
|---|---|---|
| Enginecover_PD_8_1 | **1,12 %** | **4,9 %** |
| Enginecover_SO_4_H1 | **1,42 %** | **11,9 %** |
| Motorhölje_SP_1_H1 | **1,63 %** | **5,9 %** |
| Motorhölje_SO_2 | **1,77 %** | **4,8 %** |
| Enginecover_PD_16_H1 | 1,59 % | 1,8 % |
| Enginecover_PD_7_H1 | 1,60 % | 2,0 % |
| Enginecover_SO_8_1 | 2,02 % | 1,4 % |
| Enginecover_SO_5_1 | 2,21 % | 2,2 % |
| Enginecover_SP_5_H1 | 2,58 % | 2,1 % |
| Enginecover_PD_6_C1 | 2,63 % | 1,6 % |
| Enginecover_PD_6_1 | 2,80 % | 1,1 % |
| Motorhölje_PD_1_H3 | 2,96 % | 2,4 % |
| Motorhölje_SO_1_H2 | 4,22 % | 2,9 % |
| Motorhölje_SO_1_H1 | 4,54 % | 1,4 % |
| Motorhölje_PD_EXTRA | 5,30 % | 2,3 % |

**De fyra lägsta CTR-annonserna är de fyra bästa konverterarna. Utan undantag.** 4,8–11,9 % mot
1,1–2,9 % för resten. Det här är kontots stabilaste mönster och det håller för fjärde körningen.

### Hook / hold

`video_play_actions / impressions` ligger på 89–95 % för samtliga videor. Det är autoplay och
skiljer inte annonser åt — **använd det aldrig som urvalskriterium**.

Hold (p50 av plays):

| Annons | Hold | kr/1 000 |
|---|---|---|
| Motorhölje_PD_EXTRA | **22,1 %** | 1 351 |
| Motorhölje_PD_1_H3 | 20,5 % | 340 |
| Enginecover_PD_7_H1 | 18,5 % | −312 |
| Enginecover_SP_5_H1 | 16,1 % | −75 |
| Motorhölje_SO_1_H1 | 14,2 % | 205 |
| Motorhölje_SO_1_H2 | 13,9 % | 1 259 |
| Enginecover_PD_16_H1 | 13,7 % | −397 |
| Motorhölje_SP_1_H1 | 12,9 % | 803 |
| **Enginecover_SO_4_H1** | **11,2 % (sämst)** | **1 721 (bäst)** |

**Kontots sämsta hold tillhör kontots bästa annons.** Näst sämst (`SP_1_H1`) är näst bäst i vinst.
Tredje bäst i hold (`PD_7_H1`) förlorar pengar. **Hold förutsäger inte vinst.** Använd som diagnos,
aldrig som urvalskriterium.

---

## Mönster

**1. Den enskilda creativen är huvudvariabeln. `BEVISAD.`**
Sex annonser med identisk SO-copy spänner från −334 till 1 721 kr/1 000. Spridningen inom ett
copy-block är större än mellan copy-block, och större inom ett format än mellan format.
→ **Instruktion:** testa bilder och klipp mot varandra med copyn låst, i samma adset med lika
budget. Utan lika budget mäter testet ingenting — se mönster 5.

**2. Ingenting överlever skala längre — inte ens PD_1_H3. `BEVISAD, uppdaterad.`**
Tio av tolv omätta annonser föll mellan 9 och 12 aug. `PD_1_H3` gick 417 → 431 → **340** och dess
CPA från 164,90 till 176,14. Den var förra körningens enda undantag; nu finns inget undantag kvar.
→ **Instruktion:** ingen får kallas vinnare under 2 000 kr spend. Mät vinst per 1 000 kr **vid
2 000 kr och igen vid 4 000 kr** — första avläsningen är en hypotes.

**3. Billiga klick konverterar sämst. `BEVISAD — starkast av alla mönster.`**
De fyra lägsta CTR-annonserna är de fyra bästa konverterarna, utan undantag, på femton annonser.
→ **Instruktion:** CTR och CPC är inte mål. En brief som sänker CTR men höjer köp per klick är ett
framsteg. Det står i varje brief så ingen optimerar bort det.

**4. Storlekskvalificering fungerar inte. `NYTT — första riktiga domen.`**
`PD_6_1` blev dömbar denna körning: 2 470 kr, 7 köp, CPA 353, **−331 kr/1 000**. Det var
storleksguiden. Idén har försökts fyra gånger och har nu sitt första utfall — negativt.
→ **Instruktion:** `PD_19_1` och `PD_20_C1` i batch #6 bygger på samma idé och bör byggas **efter**
batch #7:s invändningsannonser, inte före. Batch #7 angriper PD-blocket via invändningar i stället.

**5. Testerna dör på budgetfördelningen, inte på creativen. `BEVISAD — tredje gången.`**
Batch #2: 16 av 17 under 30 kr. Batch #5:s statiska: `SP_12_1` 5,70 kr mot `SP_12_3` 159,76 kr i
vad som skulle vara ett trevägstest med identisk copy. `PD_1_H3` tar 42 % av spenden och svälter
allt nytt.
→ **Instruktion:** batch #7 launchas i **ABO med lika budget per annons**, inte i CBO:n. Annars
upprepas det en fjärde gång.

**6. Publikuttömning är den nya ledande förklaringen. `HYPOTES.`**
Frekvens 2,83 livstid och 1,89 på tre dygn, samtidigt som allt faller och kampanjen passerat
break-even. Att allt faller *samtidigt* talar mot en creative-förklaring.
→ **Instruktion:** batch #7 innehåller fem creatives byggda för att nå nya människor (två nya
situationer, en ny målgrupp, två Reels-native). **Reach och frekvens vid jämförbar spend är primär
mätpunkt för dem**, inte CPA.

**7. Karusell — `OTESTAD EFTER TRE FÖRSÖK.`**
`SO_13_C1` och `PD_18_C1` briefades i batch #5 och finns inte i kontot. Batch #6 innehåller två
till, obyggda. De tre `_C1` från batch #4 gick in som enkla bilder.

---

## VAD BUTIKSDATAN SÄGER (2026-08-05, oförändrad)

**Storlekar:** 6 - 18 hk · 20 - 30 hk · 40 - 60 hk · 60 - 90 hk · 100 - 150 hk · 175 - 250 hk.
Försäljningen koncentreras till **40 hk och uppåt**.

**Färger:** Svart står för nästan allt. **Mintgrön och Grön har sålt noll.**

**Trafiktyp:** 100 % kall prospektering. Retargeting-adset finns fortfarande inte. `PD_1_H3` ensam
har långt över hundra fler lägg-i-varukorg än köp — och kall trafik kostar nu 291 kr per order.

---

## Winning DNA (bevisat: ≥300 kr spend och ≥3 köp)

1. **`SO_4_H1` är kontots effektivaste creative** — CPA 86,75, 1 721 kr/1 000, **11,9 % köp per
   klick**. Kort video, offer-vinkeln. Har 0,8 % av spenden och har aldrig itererats.
2. **`PD_1_H3` är kontots vinstmotor** — 123 köp, 63 % av vinsten. Men den har börjat tappa. Skydda
   den, skala den inte hårdare.
3. **Kort video slår lång video på effektivitet** — `PD_EXTRA` 1 351 och `SO_4_H1` 1 721 mot
   `PD_1_H3` 340. **Men de korta har aldrig fått volym**, så det kan vara samma småtalsillusion som
   fällt oss fem gånger. Batch #7 testar 10-sekunderscut i två vinklar för att ta reda på det.
4. **Dyrare klick är bättre klick.** Mönster 3, starkast av alla.
5. **SP-blocket konverterar klick bäst** (4,3 % mot 2,4 % och 2,2 %) — men på två annonser varav en
   pausad med negativt bidrag.

## Losing DNA (bevisat)

1. **Ingenting överlever skala.** Mönster 2. Viktigaste raden i filen.
2. **Testerna svälter ihjäl i CBO:n.** Mönster 5. Tre batcher förlorade på detta.
3. **PD-blockets klickkvalitet är kontots svagaste** — 2,2 % över sju dömbara annonser och två
   format. Omskrivningen har briefats tre gånger och kört noll gånger.
4. **Storlekskvalificering i bild fungerar inte.** Mönster 4.
5. **Overifierade claims ligger fortfarande live** — femte körningen i rad. Vinterrubriken kör
   bland annat på `SO_4_H1`, kontots bästa annons.
6. **Att pausa ett adset under signifikansgrinden.** `SP Batch 5` pausades vid 718 kr och 2 köp och
   tog med sig två obesvarade tester.

> **Struken 2026-08-05:** "urgency utan bevis dödar CPA — SO_1_H1". Identisk copy som SO_2.
>
> **Struken 2026-08-06:** "säsongsfel deadline" som prestationsförklaring. `SO_2` kör samma
> vinterrubrik och är lönsam. Rubriken är fortfarande **förbjuden** — men av varumärkesskäl, inte
> för att data dömt den.
>
> **Struken 2026-08-09:** "SP-copyn ska skalas" (B10). `SP_5_H1` gick från 1 405 till −75.
>
> **Struken 2026-08-12:** "PD_1_H3 är den enda annonsen som inte tappar vid skala". Den höll för
> **en** mätning. Vid nästa hade den fallit från 431 till 340. Slutsatsen drogs på två datapunkter
> och tre dagar — för tunt underlag för ett så bärande påstående.

---

## Regler

**Behåll alltid**
- 299 kr / 367 kr exakt när pris visas · problem-först-öppning · dragsko runt hela kanten ·
  Handla nu-CTA · produkt i bild före sekund 4 · 420D Oxfordtyg, 6–250 hk, 30 dagars
  nöjd-kund-garanti · svart hölje · universell passform (aldrig "formsytt")

**Testa kontrollerat (en variabel, lika budget, samma adset)**
- Iterationer på `SO_4_H1` och `SP_1_H1` — kontots två bästa, aldrig itererade
- Längd: 10 s mot 20 s, i två vinklar
- Nya situationer och målgrupper i bild — publikuttömningen
- Reels-native mot omframad annons
- Invändningar (fäste, material) mot produktdemo i PD-blocket
- Retargeting mot kall trafik

**Undvik**
- Enmetriks-domar: ROAS, CPA, hook, hold eller CTR ensamt
- Kill-beslut på tre dygns trend. `SO_5_1` skulle ha dödats på det 9 aug och gjorde 7 köp till
  CPA 188 efteråt. Kill kräver break-even-överskridande **och** att trenden håller
- Att kalla något vinnare under 2 000 kr spend. Fem gånger av fem har det blivit fel
- Att launcha nya creatives i CBO:n bredvid `PD_1_H3`. Tre batcher förlorade så
- Att pausa ett adset innan de enskilda annonserna passerat 300 kr och 3 köp
- Vinterreferenser · "innan lagret tar slut" · overifierade kundantal · "vattentät" · "formsytt" ·
  absoluta hållbarhetsclaims ("blåser aldrig av")
- Att anta att briefad copy är den copy som körs

**Obevisat (hypoteser i test)**
- Publikuttömning som huvudförklaring — mönster 6, batch #7 testar det
- Att kort slår långt när båda får volym
- Karusellformatet — aldrig kört efter tre försök
- Prisbevis i bild
- Retargeting — finns inte i kontot
- Om hooken (första 4 sek) betyder något. Tre försök har alla varit kontaminerade; batch #7 kör det
  rent i två vinklar

## Kända luckor i underlaget

- **Bilderna kan inte granskas visuellt.** `*.fbcdn.net` blockeras av gatewayen (403, verifierat
  **fyra** körningar). Creativen är kontots största variabel och den är osynlig för analysen.
- **Batch #5:s statiska går inte att copy-verifiera.** De är byggda på sidoinlägg
  (`effective_object_story_id`), så body och rubrik exponeras inte på creative-objektet. Namnen
  saknar det gamla copy-prefixet, vilket kan betyda att de byggdes rätt — obekräftat.
- **Videomanus saknas för `SO_4_H1`, `SP_1_H1`, `PD_1_H3`, `PD_EXTRA`, `SO_1_H1`, `SO_1_H2`.**
  Batch #1 och #3 briefades utanför OS:et. Därför är `SO_21`- och `SP_19`-flottorna i batch #7
  **rekonstruktioner**, inte kontrollerade iterationer.
- **Inga recensioner nåbara.** Inga citat och inga kundantal får användas.
- **Köp per klick är beräknat på `ctr`, inte länkklick.** Rangordningen håller, absolutnivåerna är
  ungefärliga.
