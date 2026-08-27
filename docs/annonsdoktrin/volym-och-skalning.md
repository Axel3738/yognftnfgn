A efter 7 dagar               → EJ LEVERERAD (ingen dom)

CHILL — ETT villkor räcker
  C1 ROAS < skalgräns men ≥ 1,15×BE     C2 Frekvens 7d ≥ 2,0
  C3 CPM +20 % på 14 d mot 30d-index    C4 Creative-budget < 450 kr/v
  C5 Andel ≥ p_max                      C6 Utanför säsong
  C7 Leveranstid > 14 d                 C8 Kassa-/leverantörstak slår i
  HÅRT: BE_sann ≥ 3,0 → permanent chill, aldrig egen annons

CHILL = flytta till ENGINE · frys creatives · budget ±10 %/mån · läs var 28:e dag
  Golv 0,5 × BE-CPA/dag ENDAST om omstart inom 30 d OCH ROAS ≥ BE_sann. Annars 0.

I STÄLLET FÖR ATT SKALA — i turordning
  1. Post-purchase-upsell   +78 % netto vid 10 % attach, +156 % vid 20 %
  2. Pris +15 %             BE_sann −17 %, tål 27 % CVR-fall
  3. NO / UK                BE_sann −20 % / −27 %. Entrébiljett 700–1 200 kr/dag i 4 v
  4. Bundle                 max 5 % rabatt (brytpunkt 9,7 %)
  5. Katalog/DPA            inom retargetingtaket
  6. Låt den finansiera testandet

RÖR INTE (minsta läsbara ROAS-rörelse = 3,10/√n, n = köp per 14 d)
  T0 ±78 %  T1 ±54 %  T2 ±38 %  S1 ±31 %  S2 ±25 %  S3 ±20 %  S4 ±16 %

ALLTID
  Läs ROAS på dag −21 till −7. Aldrig ett fönster som slutar idag.
  Läs BE-ROAS på 90 dagar. Läs vinst ur PNL, aldrig ur Ads Manager.
  Läs frekvens, CPM, hook rate och ATC i Meta — PNL kan inte se dem.
  En budgetändring per produkt per 14 dagar.
```

## 8.2 Trappan i kronor — de tre exempelprodukterna

Scenario B, Sverige. Klipp ut och tejpa.

| Nivå | Mobilskal 219 kr<br>BE_sann **5,14** | Median 329 kr<br>BE_sann **3,56** | Jumpstart 1 599 kr<br>BE_sann **2,41** |
|---|---|---|---|
| **BE-CPA_sann** | **43 kr** | **92 kr** | **665 kr** |
| T0 | 43 | 92 | 665 |
| T1 | 85 | 185 | 1 329 |
| T2 | 170 | 369 | 2 659 |
| S1 | 256 | 554 | 3 988 |
| S2 | 383 | 831 | 5 982 |
| S3 | 639 | 1 385 | 9 971 |
| S4 | 1 023 | 2 215 | 15 953 |
| **Skalgräns vid 8 000 kr/dag konto** | ROAS 6,43 | ROAS 4,45 | ROAS 3,01 |
| **Eget adset kräver kontospend** | 860 kr/d | 1 840 kr/d | **13 300 kr/d** |
| **Dom** | **Permanent chill.** BE ≥ 3,0 | **Gränsfall.** Kräver upsell, prishöjning eller NO/UK | **Körbar.** Högprisspåret tills kontot > 13 300 kr/d |

## 8.3 Tre tal som avgör om butiken går ihop

Räkna dessa en gång i månaden. De besvarar frågan som inget tidigare dokument ställde: *har butiken vinst att skala med?*

| | Formel | Vid 6 000 kr/dag, kontosnitt m = 0,50 |
|---|---|---|
| **Netto före fast** | S_total × m | 3 000 kr/dag |
| **Netto efter creative** | × 0,80 | 2 400 kr/dag |
| **Netto efter fast** | − F | 2 400 − 1 600 = **+800 kr/dag = 24 000 kr/mån** |

**Minsta livskraftiga kontospend:** `S_min = F ÷ (0,80 × m)`.

| Kontosnitt m | ROAS motsvarar (median) | **S_min** |
|---|---|---|
| 0,30 | 4,63 | **6 667 kr/dag** |
| 0,50 | 5,34 | **4 000 kr/dag** |
| 0,70 | 6,05 | **2 857 kr/dag** |

**Målbilden för 50 000 kr/mån verklig vinst** vid kontosnitt m = 0,50: `(50 000/30 + 1 600) ÷ (0,50 × 0,80)` = **8 333 kr/dag i annonsspend**, ~750 000 kr/mån i omsättning och **~85 000–150 000 kr i fri kassa** enligt §4.2. Det är målet. Skriv upp det och mät avståndet varje månad.

## 8.4 Tillägg till `naming-convention.md` — in innan första annonsen

Regel 4 i det dokumentet kräver att vokabulären uppdateras först. Allt nedan är bakåtkompatibelt med den positionella parsern (regel 1 tillåter `-` inom ett fält).

**BRAND — ny kod med marknadssuffix:**
`bav-se` · `bav-no` · `bav-fi` · `bav-uk` · `bav-dk`

**ANGLE — nionde kod:**
`trust` (riskreversering, garanti, anti-scam, "du får exakt vad du ser"). Playbookens högsta ROAS i skala (ad 049, 2,47) är den vinkeln och den har idag ingen kod — den tvingas in som `social` + hook `trust` i `winning-lines.md`. Rätta det innan UGC-manusen ärver felkodningen.

**FORMAT — nya koder för rörligt (`ugc` är upptaget av mobilfoto-statics):**
`ugcvideo` · `talkinghead` · `demo` · `unboxing` · `voiceover` · `beforeafter-video` · `splitscreen` · `slideshow` · `recut` (omklippt leverantörsmaterial) · `tabletop` (hand/ovanifrån, inget ansikte)

**HOOK — typprefix inom fältet, plus kreatörskod som suffix:**
`{hooktyp}-{slug}-c{A–F}`
Hooktyper: `pov` · `claim` · `q` · `demo` · `problem` · `callout` · `neg` · `story`
Kreatörskoder enligt batchplanens roller: `cA` Uppfarten · `cB` Sjön · `cC` Villan · `cD` Skogen · `cE` Gården · `cF` Inne

**Versionering — entydig definition för video:**
- Ny hookslug → **ny annons**
- Nytt klipp av samma råfilm, samma hook → **bumpa `v{N}`**
- Ny råfilm → **ny annons med nytt `v{N}`**

**Exempel:**
```
bav-se_jumpstart5000a_pain_ugcvideo_problem-dodbatteri-cA_v1
bav-no_jumpstart5000a_pain_ugcvideo_problem-dodbatteri-cA_v1
bav-se_batskydd_trust_beforeafter-video_demo-winterstorage-cB_v2
```

**AUDIENCE-fältet:** lägg en not om att Advantage+ Audience gör målgruppen till en *seed*, inte ett filter. Trackerns segmentering på det fältet beskriver i stigande grad något som inte finns.

## 8.5 Tillägg till `ad-tracker.md`

**Överst i filen, före allt annat:**
```
Attributionsfönster: 7d klick + 1d visning   ← byt aldrig utan att räkna om alla trösklar
Alla ROAS-avläsningar: dag −21 till −7. Aldrig ett fönster som slutar idag.
Vinst läses ur PNL. Leverans (frekvens, CPM, hook rate, ATC) läses i Meta.
```

**Ny produktrad, en per aktiv produkt, utöver annonsraderna:**
```
| Produkt | Marknad | Pris | BE_app | BE_sann | BE-CPA_sann | Nivå | kr/dag | Andel % |
| ROAS(14d moget) | ROAS/BE_sann | m | Creative-budget/v | Enheter/v | Frekv 7d | Läge |
```
`Läge` ∈ **T0 · T1 · T2 · S1 · S2 · S3 · S4 · HÅLL · SÄNK · CHILL · KATALOG · DÖD**

**Nya kolumner i annonsraderna:** `Optimeringshändelse` (atc/purchase) · `Budstrategi` (hv/costcap) · `Kreatör` (cA–cF) · `Egen spend / BE-CPA` · `Hook rate` · `Ratio`. Utan de två första går inga två rader att jämföra.

**Nytt verdict:** `EJ LEVERERAD` (§6.1).

**Ny statuskod i legenden:** `🧊 chill` = lönsam, budgetlåst, ligger i ENGINE, ingen creative-rotation.

**Bevisnivå på insikter i `playbook.md`:** playbookens 2-testers-regel skalar inte till 119 produkter — de flesta produkter kommer aldrig få två rena tester. Lägg till en nivåmärkning på varje insikt: **produkt** / **kategori** (fiske, båt, MC, trädgård) / **system**. En insikt får flytta in i playbooken när den bevisats i två oberoende tester **på sin egen nivå**.

**UGC-testregeln** (regel 2 i namnkonventionen, "en variabel i taget", går inte att följa för video):
- Samma manus, olika kreatör = **kreatörstest**
- Samma kreatör, olika hook = **hooktest**
- Allt annat = **konceptstest** — räknas inte som rent test och får inte generera en playbook-rad

**UGC-arvoden bokförs i `FixedCost` i vinstappen**, inte ingenstans. Annars ser en produkt lönsam ut trots att kreativet kostade 6 000 kr.

## 8.6 Vad som fortfarande är antaget — och vad som falsifierar det

Rangordnat efter hur mycket svaret ändras om talet är fel.

| # | Antagande | Värde | Effekt om fel | Falsifiering | Tid |
|---|---|---|---|---|---|
| **1** | **Momsscenariot** | B | Skillnaden mellan B och C är 27 % på varje BE-CPA i dokumentet. Under C blir medianprodukten körbar; under B är den det inte | Fråga bokföringen: redovisas utgående moms, och dras de 27,50 av som ingående? | 10 min |
| **2** | **Returgrad 6 %** | r = 0,06 | Kvadratisk effekt. Vid r = 3 % går medianens BE_sann från 3,56 till 3,17; vid 10 % till 4,26 | 90 dagars refunds ur Shopify, delat på bruttoordrar. **Gör detta i vecka 1** | 20 min |
| **3** | **Fasta kostnader 1 600 kr/dag** | F | Styr skalgränsen och koncentrationstaket helt. Vid F = 800 sjunker skalgränsen från 1,25 till 1,13 × BE vid 8 000 kr/dag | `fixedMonthlyTotal` med riktig ägarlön | 20 min |
| **4** | **Träffkvot h = 20 %** | 1 av 5 | Styr UGC-grinden direkt. Vid h = 10 % fördubblas C_v och UGC betalar sig aldrig på medianprodukter; vid h = 33 % öppnar grinden redan på T1 | Efter 20 avlästa creatives: hur många nådde skalgränsen? | 20 min |
| **5** | **ATC:köp-kvot 4:1** | | Styr ATC-learningnivån (T1). Vid 6:1 klaras den redan vid T0; vid 2,5:1 krävs T2 | Ads Manager, 30 dagar, ATC ÷ köp | 5 min |
| **6** | **Leveransfördelning 60/25/15** | | Styr testadsettets budget (3 × BE-CPA) och taket på 3 nya/vecka. Vid 45/30/25 kan testadsettet köras på 2 × BE-CPA | Ads Manager: spendandel per annons i ett adset med 3 creatives, 7 dagar | 5 min |
| **7** | **COGS är USD/CNY-denominerad** | ej modellerat | +10 % USD höjer COGS på **alla 119 produkter i alla 5 marknader samtidigt**. Median: BE_app 1,85 → 1,975 (+6,8 %), BE_sann 3,56 → 3,97 | Kontrollera inköpsvalutan hos agenten. Bygg in en 10 %-buffert i COGS-fältet | 30 min |
| **8** | **Utbetalningsfördröjning L = 5 dagar** | | WC-multipeln skalar linjärt. Vid L = 7 stiger medianens multipel från 12,6 till 18,0 och kassataket sjunker 30 % | Shopify Payments payout-schema | 5 min |
| **9** | **Nordiskt prospecting-ROAS-tak ~3,5** | | Styr `BE_sann ≥ 3,0`-gränsen i §6.5. Är taket 4,5 blir gränsen 3,9 och fler produkter körbara | Efter 6 månader: högsta 90-dagars-ROAS någon produkt hållit i skala | 6 mån |
| **10** | **`fx.server.ts` använder dagens kurs på historisk spend** | kod | Vid `NODFALL_TTL` serveras en upp till 7 dagar gammal kurs. Under en volatil vecka är det ett par procents fel rakt in i varje utlands-ROAS, tyst | Läs koden, byt till kursen på spenddagen | 1 h |

---

## Den korta versionen

**Tre saker, om du bara läser tre rader:**

1. **Räkna om break-even innan du gör något annat.** `1/BE_sann = 1/BE_app − 0,26` för Sverige. Medianprodukten går från 1,85 till 3,56. Halva katalogen är inte annonserbar på det talet — och det är inte ett modellfel, det är momsen, tullen och returerna som ingen räknat med. Varje regel i det här dokumentet är uttryckt i multiplar av BE-CPA, så systemet fungerar oavsett vilket momsscenario som visar sig gälla. Bara kronbeloppen ändras.

2. **Bygg post-purchase-upsell innan du höjer en enda budget.** +78 % netto vid 10 % attach, +156 % vid 20 %. Noll extra annonskronor, noll extra tull, noll extra rörelsekapital, noll extra risk. Ingen skalningsåtgärd i det här dokumentet kommer i närheten, och tullen på 27,50 kr per order äter idag 97 % av dagsvinsten vid 4 000 kr/dag.

3. **Tre nya annonser i veckan, aldrig fler — och bara om produkten har råd.** Taket är läsbarhet, inte budget: en fjärde annons i testadsettet får under 5 % av leveransen och blir aldrig avläst. Och `creative-budget = 0,20 × 7 × dagsbudget × m` betyder att du förtjänar creative-volym genom marginal, inte genom spend. Det är därför batchplanen ska filma 5–6 produkter per fönster, inte 106.