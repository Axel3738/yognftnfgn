# Avatar- & ads-research — 2026-07-18

Källor: Meta-kontot SnarkLös (1346450049878358) 30 dagar (18 jun–17 jul) + ad-nivå 4–17 jul,
Meta Ad Library (SE), VOC-dokumenten (`voc-reddit-2026-07-08.md`), kontots facit
(`winning-lines.md`). **Förbehåll:** Shopify-kopplingen i denna session pekar på
Bäverbutiken.se — inte Grillkliniken — så kunddata (AOV, återköp, städer) saknas i detta pass.
Byt butik med `switch-shop` (kräver din auth) så kan den läggas till.

---

## 1. Avataren i siffror (30 dagar, ~546k spend)

### Ålder
| Ålder | Spend | Andel | ROAS | CTR |
|-------|-------|-------|------|-----|
| 18–24 | 4k | ~1 % | **0,24** | 3,96 % |
| 25–34 | 27k | 5 % | 1,29 | 3,23 % |
| 35–44 | 66k | 12 % | **1,58** | 2,86 % |
| 45–54 | 104k | 19 % | 1,53 | 2,53 % |
| 55–64 | 162k | 30 % | 1,38 | 2,66 % |
| 65+ | 183k | **34 %** | 1,49 | **3,70 %** |

**Läsning:** 64 % av pengarna går till 55+. Det är inte slöseri — 65+ har både näst högst
ROAS och högst CTR av köpande segment. Men *effektivitetstoppen* ligger 35–54 (1,53–1,58).
18–24 är död (0,24) — de klickar (3,96 %) men köper aldrig.

### Kön
| Kön | Spend | ROAS | CTR |
|-----|-------|------|-----|
| Män | 437k (80 %) | **1,53** | 2,82 % |
| Kvinnor | 98k (18 %) | 1,14 | **3,97 %** |

**Kvinnor klickar, män köper.** Kvinnors ROAS 1,14 är inte noll — det finns en
medköpare-/presentköpare-signal, men copy riktad till kvinnor ger klick utan köp
(se 191 CARLA nedan).

### Geografi
| Land | Spend | ROAS | CPM |
|------|-------|------|-----|
| SE | 444k | **1,52** | 179 kr |
| NO | 85k | 1,33 | 216 kr (+21 %) |
| US (test) | 13,5k | 0,70 | **647 kr** |
| AU/CA/GB (mikro) | ~3k | — | 470–780 kr |

Norge fungerar men under SE-nivå och med dyrare trafik. USA-testet är långt ifrån lönsamt
vid nuvarande CPM — kräver eget kreativt, USD-butik och egen funnel innan mer spend.

---

## 2. Vad som spinner just nu (ad-nivå, 4–17 jul)

| Ad | Spend | ROAS | CTR | Frekvens | Läsning |
|----|-------|------|-----|----------|---------|
| B66 LISTICLE | 22,0k | 1,72 | 2,13 % | **2,46** | Bär mest spend men frekvensen är hög — trötthet nära |
| **128 H3** | 20,5k | **2,39** | 2,41 % | 1,18 | **Nuvarande effektivitetskung i skala** |
| 177 L H3 | 13,1k | 2,12 | 2,13 % | 1,55 | Offer-formatet håller |
| 191 H6 L | 12,3k | 1,06 | 3,65 % | 1,19 | Klick utan köp |
| NO 115 H2 | 11,1k | 1,03 | 3,08 % | 1,08 | Norge under vatten på denna |
| 177 L H2 | 10,4k | 1,94 | 2,52 % | 1,59 | — |
| 193 #8 H10 | 8,1k | 1,87 | 2,53 % | 1,44 | H10 igen |
| 145 H2 | 6,6k | 0,96 | 3,63 % | 1,17 | Bekräftar gamla facit: mekanism-listicle svag |
| 193 #8 H10 (v2) | 5,9k | 1,85 | 2,39 % | 1,32 | H10 igen |
| 191 CARLA H4 | 5,3k | **0,57** | **7,01 %** | 1,13 | Extremt CTR, inga köp — clickbait-varning |
| **198 H10** | 4,6k | **2,84** | 1,86 % | 1,71 | Skalkandidat — mata den |
| 110 H1 | 4,7k | 1,49 | 2,47 % | 1,08 | Arbetshästen lunkar |
| **B71 LISTICLE** | 2,8k | **2,86** | 2,24 % | 1,95 | Skalkandidat |
| NO 117 | 2,8k | 2,00 | 1,99 % | 1,25 | Bästa NO-annonsen |

### Fem mönster
1. **128:s vinkel är het just nu.** 2,39 vid 20k/14d — "skydda investeringen/det var aldrig
   köttet" är kontots starkaste breda budskap i skrivande stund. **234/235 träffar exakt
   denna våg — priorita dem i produktionen.**
2. **H10 vinner på två olika bodies** (193 #8 och 198). När samma hook slår på flera bodies
   är den robust → identifiera H10-copyn och testa den på fler bodies (110, 128).
3. **Listicle-regeln behöver nyanseras.** Gamla facit (145/150/151) sa "listicle dör" — men
   B71 (2,86) och B66 (1,72 i skala) motsäger det. Ny regel: *ren mekanism-listicle dör
   (145 H2 = 0,96 igen), men listicle med störande hook/vinkel lever.* Uppdatera playbook.
4. **CARLA-lektionen:** kvinnoriktad avsändare gav 7 % CTR och 0,57 ROAS. Kvinnosegmentet
   ska nås via presentvinkel ("köp till honom" — trygghet, garanti, svensk butik), inte via
   kvinnlig huvudpersona i grill-copy.
5. **Norge:** översätt bevisade vinnare (128, 177, ev. B71) innan nya koncept testas där —
   NO 117 (2,00) visar att det går, men CPM +21 % kräver era starkaste kort.

---

## 3. Avataren (syntes av data + VOC)

### Primär: "Premiumgrill-Peter" — mannen som gör allt rätt
- **Man, 45–70** (tyngdpunkten i spend 55+; effektivitetstopp 35–54), Sverige, villa/radhus.
- Äger **Weber/Napoleon/kamado för 10–15k+**. Grillar varje vecka, året runt-ambition.
- **Identitet:** värd och familjeförsörjare vid grillen. Skam när köttet inte imponerar
  (088/101-datan) är starkare drivkraft än hygien.
- **Tror redan att han sköter grillen** ("bränn av det" = hans generations metod, VOC-mönster
  fire religion). Därför fungerar story/auktoritet (110/101) — de omvänder utan att anklaga.
  Anklagande hooks har bevisat 8× sämre ROAS.
- **Köper trygghet:** svenskt företag, livstidsgaranti, 30 dagar, "inte 14 utan 30" —
  049 är fortfarande kontots högsta skal-ROAS. Volvo-linjen i 234/235 är rätt spik.
- **Räknar i sekunder, inte kronor:** 60–90 sek-löftet + laziness=status (VOC) — han vill
  vara *smart lat*, inte flitig.
- **65+-delsegmentet** (34 % av spend, CTR 3,7 %): tid att titta = long-form fungerar.
  Sonen-VSL:en (6–12 min) och 233 är byggda för exakt denna grupp. Farfar/generations-
  tematiken speglar deras liv (barnbarn, arv, hantverk).

### Sekundär: "Medköparen Maria" — presentköparen
- Kvinna 45–65, klickar mer än män men konverterar sämre (1,14).
- Nås INTE via kvinnlig persona (CARLA-datan) utan via **presentlogik riktad till hennes
  trygghetsbehov**: "han slutar aldrig med stålborsten frivilligt — ge honom den här"
  + borststrån-i-maten-rädslan (hon serverar också familjen) + garanti/öppet köp.
- Säsongsfönster: fars dag, jul, grillsäsongspremiär.

### Ignorera: under 35
- 18–24 = 0,24 ROAS. 25–34 = 1,29 (under break-even-ambition). Ingen copy-anpassning,
  ingen targeting-ansträngning. Deras klick är brus.

---

## 4. Kategoriläget (Ad Library, SE)

Sökning på "grillborste" och "rengör grillen" bland aktiva annonser i Sverige returnerar
nästan uteslutande **Grillklinikens egna annonser** (~635 träffar på kärnordet).
**Ingen svensk konkurrent kör kategorins kärnbudskap på Meta i skala just nu.**

Konsekvens: sophistication-trappan i SE drivs av er själva. Största hotet är inte en
konkurrent utan **er egen utnötning** — samma avatar ser era vinklar om och om igen
(B66 frekvens 2,46 på 14 dagar). Vinkelrotationen (smak → investering → säkerhet →
story → offer) är därmed ert viktigaste vapen, och exakt det 228–235-batchen levererar.

---

## 5. Rekommenderad prioritering av 228–235 (utifrån datan)

| Prio | Brief | Motiv |
|------|-------|-------|
| 1 | **234/235 Investeringen** | Rider 128 H3:s våg (2,39 i skala just nu) |
| 2 | **233 Farfar 101 B2** | 101-familjen + 65+-segmentet = största spendgruppen |
| 3 | **Sonen-VSL (long form)** | 65+ har tid; VSL:er obeprövade i kontot = ny yta |
| 4 | 229/230 (Två vatten/Tre misstag) | Bevisade format, mellanrisk |
| 5 | 231 (Hela hyllan) | — |
| 6 | 228 (Håll min hand) | Fräck ton — testa mot 35–54, inte 65+ |

## 6. Öppet / nästa steg
- **Koppla rätt Shopify** (Grillkliniken) → AOV, återköpsgrad, kundstäder, ordertider.
- **Identifiera H10-hooken** (193/198) och testa den på 110- och 128-bodies.
- B66 närmar sig utmattning (frekvens 2,46) — ha ersättare redo (B71 skalas, 234/235 in).
- Uppdatera `playbook.md`: listicle-regeln nyanserad (se mönster 3).
