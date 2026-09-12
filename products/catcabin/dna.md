# Creative DNA — CatCabin (utekattkojan)

Butik: catcabin.se (Shopify `ras1t2-2x`) · produkt `utekattkojan` ·
annonskonto **MagiBorsten DK `915422744950975`** (OPS Factorys gemensamma) ·
annonsprefix `CatCabin`.

Skapad **2026-09-12** av `/notionscalercs setup catcabin` (körning nr 1).
Allt under "Ärvt" är **ÄRVD** data från Bäverbutikens källkampanj — den är
riktning, aldrig budgetunderlag. CatCabins egen kampanj har ingen bedömbar
annons än.

---

## Produkten och kunden

Isolerad utekattkoja på fyra ben. Sadeltak i Oxford-tyg, flik vid ingången,
isolerade väggar, lös liggmatta, hopfällbar, tre färger. 789 kr
(jämförpris 1 039 kr).

Kunden är kattägare med utekatt och tomt — villa, radhus eller landet, 30–65 år.
Ser katten smita in under bilen när det regnar eller ligga på en kall
betongtrapp. Står i köksfönstret på kvällen och undrar var katten tog vägen.
Sekundärt: den som matar en hemlös katt i trädgården.

**Okänt och därför aldrig påstått:** mått i cm, vikt, isoleringens material,
temperaturklass, "vattentät", maxstorlek på katt.

---

## Ekonomin

| | Utan moms (gäller) | Med moms 25 % |
|---|---|---|
| Break-even ROAS | **1,62** | 2,40 |
| Break-even CPA | **487 kr** | 329 kr |
| Target ROAS | 2,72 | 4,60 |
| Target CPA | 290 kr | 171 kr |

`ekonomi.moms_antagen: false` i produktfilen — **utan moms-linjen gäller för
kill-beslut**, samma regel som Bäverbutiken och Grillkliniken.

⚠️ **Två tal är inte kvitterade:**
- `inkopskostnad: 302 kr` är **härledd** ur källkampanjens namn ("BE ROAS 1.62")
  via `pris / (pris − inköp)`, inte läst ur ett Temu-kvitto. Axel bekräftar
  innan talet får döma annonser. Öppet i `factory/BESLUT-VANTAR.md` punkt 1.
- Momsantagandet är samma öppna beslut.

---

## CatCabins egen kampanj — läget 2026-09-12

`CATCABIN_SE_Utekattkojan | BE-ROAS 1,62 | 2026-09-11` (`120249055514200172`),
CBO 1 000 kr/dag, ACTIVE. 4 adsets (PD, SP, GT, CS), 13 annonser, alla ACTIVE.

| Mätt | Värde |
|---|---|
| Spend hittills | **833 kr** — allt på 2026-09-12 |
| Visningar | 6 265 |
| Köp | **0** |
| Bedömbara annonser | **0** (grinden är 300 kr OCH 3 köp) |

Kampanjen startade 2026-09-11 17:57 men levererade **ingenting** det dygnet —
första kronan gick ut 2026-09-12. Det är inte ett fel, det är Metas normala
uppstart, men det betyder att 2026-09-11 inte finns som datadag.

**Ingen dom kan avges.** 833 kr utan köp är under en break-even-CPA
(487 kr) × 3 = 1 461 kr, alltså under nattvaktens "noll köp"-tröskel.
Håller 0 köp i sig kommer nattvakten att sänka budgeten −30 % när spenden
passerar 1 461 kr — det är regeln, inte en gissning.

**Feedback-loopen kan inte köras än: KALLSTART.** Nästa briefdag hämtar sina
koncept ur den ärvda DNA:n nedan.

---

## Ärvt — Bäverbutikens källkampanj (ÄRVD)

Källa: konto `1867947880635861` (Bäverbutiken, **LÄSES bara**), kampanj
`Isolerade Utekattkojan | BE ROAS 1.62 | Launch 2026-09-09`
(`120250147309170291`), prefix `Utekattkoja`, period maximum.
Avläst **2026-09-12** via `factory/skalning.mjs --arv`.

**Totalt: 4 535 kr spend · 13 köp · samlad ROAS 2,38 · verklig AOV 831 kr.**
Bedömbara: **1**. För tidigt: 15.

Priset är detsamma i båda butikerna (789/1 039 kr), så de ärvda talen är
direkt jämförbara — till skillnad från HeimGuard, där priset skiljer.

### Den enda annonsen som får dömas

| Annons | Spend | Köp | CPA | ROAS | Vinstbidrag | Hook 3s | Hold | CTR | CPC | CVR |
|---|---|---|---|---|---|---|---|---|---|---|
| `Utekattkoja_PD_2_H1` | 2 189 kr | 6 | 365 kr | 2,42 | **+733 kr** | 30,4 % | 36,0 % | 4,70 % | 3,39 kr | 0,93 % |

**Vinnare.** CPA 365 kr under break-even 487 kr på båda momslinjerna. Över
target (290 kr) men klart lönsam — skalas, dödas aldrig.
Den står ensam för 48 % av all ärvd spend och 46 % av köpen.

### Ärvd variabeltabell (ÄRVD — hela livstiden, dömd mot CatCabins linjer)

Vinkel:

| Vinkel | Spend | Köp | CPA | Andel av spend | Bedömbara |
|---|---|---|---|---|---|
| **PD** (problem/demo) | 3 256 kr | 9 | 362 kr | 72 % | 1 |
| SP (social proof) | 714 kr | 2 | 357 kr | 16 % | 0 |
| GT (gift/present) | 199 kr | 2 | 99 kr | 4 % | 0 |
| CS (tidsbegränsat erbjudande) | 365 kr | **0** | — | 8 % | 0 |

Format:

| Format | Spend | Köp | CPA | Bedömbara |
|---|---|---|---|---|
| Video (`_H1`) | 3 168 kr | 9 | 352 kr | 1 |
| Bild (`_1`) | 1 367 kr | 4 | 342 kr | 0 |

### Tre mönster → instruktion i batch #2

Alla tre är **HYPOTES**, inte bevisade: kravet är ≥ 2 annonser med ≥ 3 köp
vardera, och materialet har exakt **en** sådan annons. Skriv aldrig ut dem som
bevisade förrän CatCabins egen kampanj fyllt i luckan.

1. **PD-vinkeln bär produkten.** 72 % av spenden, 9 av 13 köp, och den enda
   bedömbara annonsen. Vinkeln är "katten sover under bilen igen" — problemet
   först, kojan som svar.
   → *Instruktion:* minst hälften av varje batch ligger på PD. Varianterna av
   `PD_2_H1` isolerar EN variabel i taget (hook, öppningsbild, längd).
2. **CS-vinkeln är obesvarad, inte utdömd.** 365 kr och 0 köp — under grinden
   (300 kr OCH 3 köp), alltså **ingen dom**. Det enda som är mätt är att den fick
   minst spend av de fyra vinklarna. Behandla den som oprövad.
   Axels beslut 2026-09-12 (`factory/butiker/catcabin.yaml`, `erbjudande.tidsbegransat:
   true`): CatCabin **kör** ett tidsbegränsat erbjudande, exakt som Bäverbutiken.
   Källans påståenden "bara idag", "sista chansen" och "lagret krymper" är alltså
   **sanna här** och behöver inget nytt manus.
   → *Instruktion:* CS får byggas. Men **priset måste rättas** — källans tal är
   809 / 1 059 kr, CatCabins är 789 / 1 039 kr, och det gäller både uppläst tal och
   inbränd text. Därför står fyra CS-annonser fortfarande obyggda (se `backlog.md`);
   CS-adsetet i OPS-kampanjen bär i dag bara `CS_2_1`.
   ⚠️ Spänningen mot brandriktlinjen är medveten: `branding.stil.cta` säger
   "Aldrig SISTA CHANSEN, ingen nedräkningstimer" — den gäller **sajten**.
   Annonsbeslutet är nyare och gäller annonserna.
3. **Bild står sig mot video per krona.** Bild: 1 367 kr / 4 köp (CPA 342 kr).
   Video: 3 168 kr / 9 köp (CPA 352 kr). Bild fick en fjärdedel av spenden men
   samma CPA.
   → *Instruktion:* håll bildandelen uppe i batch #2 — minst en bildvariant per
   koncept som bevisas i video. Det är ett format som är underutforskat, inte ett
   sämre format.

⚠️ **Läs inte `GT_2_1`s ROAS 9,25 som en signal.** 171 kr och 2 köp är brus.
Samma sak med `PD_3_H1` (ROAS 10,16 på 78 kr). Enmetriks-domar är förbjudna.

---

## Rotorsaker och fallgropar för nästa körning

1. **Prefixet är `CatCabin`, inte `Utekattkoja`.** Källan använder
   `Utekattkoja_` i Bäverbutiken. Samma prefix här hade kolliderat i
   prefixkartan, översättningskön, adsetuppslaget och commission-kopplingen.
   Rör det aldrig.
2. **Ingen NO-kampanj finns.** Endast `CATCABIN_SE_…` i kontot 2026-09-12.
   `/ops-oversatt` har därför inget mål förrän `/ny-annonser` byggt den.
   Källans norska kampanj heter `Isolert Utekattehus` (prefix `Utekattehus_`)
   och står i produktfilens `kalla.no_kampanjmonster` — fallbacken på DryTreks
   mönster är borttagen, så fältet MÅSTE stå kvar.
3. **Hubben skapades 2026-09-12**, inte av `/ny-annonser`. Dess `Status` är av
   Notion-typen `select`, inte `status` — API:t kan inte skapa status-kolumner.
   Husets läsare accepterar båda, så inget är trasigt, men Notions fasvy saknas
   tills någon byter typ för hand.
4. **Ingen redigerare tilldelad.** Briefronden begränsas därför till 7 per rond
   i stället för kadensens 21, så hubben inte fylls med briefer ingen gör.
5. **Leverantörslänken är overifierad.** `TEMU-5030003647894` svarar
   "discontinued". Påverkar inte creative-arbetet, men inköpskostnaden vilar på
   den.

---

## Körning nr 1 — 2026-09-12, setup (`/notionscalercs setup catcabin`)

Ingen briefrond kördes: setup bygger infrastrukturen, inte batchen.
Budgetronden kördes torrt (0 ändringar, allt "för tidigt").

Gjort: hub skapad + registrerad, rutinplats 6 låst, nattvakten byggd,
minnesfilerna skrivna ur ärvd historik.

Nästa körning är nattvaktens egen, och den blir en **kallstart** enligt ovan.
