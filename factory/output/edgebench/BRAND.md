# EdgeBench — brandunderlaget

Skrivet 2026-09-12 i `/ny-ops`-körningen som byggde butiken `aphkky-ke`
(steg 0 svarade `Connected: aphkky-ke.myshopify.com ✓`, butiksnamn
"My Store 5", SEK, tomt tema Horizon). Enproduktsbutik.

Källa: `baverbutiken.se/products/balteslipmaskin-mini-3-i-1-knivslip-polerare`
(909 kr, jämförpris 1 182 kr, 10 recensioner, snitt 5,00).

---

## 1. Produkten — vad BILDEN säger (bilden är facit, inte källtexten)

Källan har **en enda produktbild** (`temu2-balteslip.webp`, 800 × 800) och en
GIF som bara är en långsam inzoomning av samma bild. Ingen inbränd text i
någon av dem — bra, för då läcker ingen svenska på /nb.

Det bilden visar, och därmed allt som får påstås:

- Svart bottenplatta i metall med fyra gummifötter.
- Motor liggande på plattan, driver ett **slipband** som går över två rullar
  med en spännfjäder.
- **Slipsten** (orange/roströd) på vänstra axeländen.
- **Polerskiva i bomull** (vit, tygskivor) på högra axeländen.
- Medföljer i bild: två insexnycklar, ~10 extra slipband, ~10 sliprondeller,
  ett block grön polerpasta, **nätadapter med EU-kontakt** och sladd, ett
  gult plastskydd.

⇒ "3-i-1" = **slipband, slipsten, polerskiva**. Det stämmer med källtextens
"slip, polering och buffert".

⇒ Maskinen går på **nätadapter**, inte batteri. Ingen creative och ingen
sida får antyda sladdlöst.

**Okänt och därför aldrig påstått:** mått, vikt, effekt i watt, varvtal,
bandets mått, om plastskyddet är ett bandskydd eller en hylsa, maxstorlek på
kniv, om adaptern har svensk stickpropp eller adapterkontakt.
Källtexten säger **7 hastigheter** och **15° bältesvinkel** — de två talen
står i källans egen beskrivning och tas med, men syns inte i bilden.

---

## 2. Vem köper

Hobbyman med en bänk i garaget, källaren eller förrådet. 30–65 år, Sverige
och Norge. Har knivar som ska vara vassa: kökskniv, jaktkniv, fiskekniv,
täljkniv, yxa. Kanske täljer, kanske bygger, kanske fixar. Har provat att
slipa för hand med bryne eller sten och tycker att resultatet blev ojämnt.

Sekundärt: den som slipar på beställning i liten skala (marknad, granne) och
den som polerar smycken eller metalldetaljer.

Språket i huvudet: "egg", "bryne", "slipvinkel", "slö", "vass", "bänken",
"polera", "slipband". Inte "verktygsmaskin" och inte "professionell".

## 3. Problemet

Kniven ligger slö i lådan. Att slipa för hand kräver att man håller samma
vinkel hela vägen, varje drag — och gör man inte det blir eggen rundad i
stället för vass. Så slipningen blir aldrig av, och man skär med en kniv som
river i stället för att skära.

## 4. Emotionen

Irritation som blir hantverksstolthet. Den som köper vill inte "ha en
maskin" — han vill kunna ta fram en kniv och veta att den biter. Vinsten är
att vinkeln sitter i maskinen i stället för i handleden.

## 5. Vilket brand de förväntar sig att lita på

Verkstad, inte prylbutik. Sakligt, tekniskt, lite kärvt. Inga utropstecken,
ingen hype, inga adjektiv utan något att peka på. Samma ton som en
bruksanvisning som faktiskt är skriven av någon som använt maskinen.

**Känsla:** teknisk, rejäl, saklig, exakt.

---

## 6. Namnet

**EdgeBench** — `edge` = eggen (det enda produkten faktiskt levererar),
`bench` = arbetsbänken den står på. Två korta engelska ord som svenskar och
norrmän läser och uttalar utan att tveka, inga å/ä/ö, fungerar oförändrat i
.se, .no, .dk och .com. Namnet bär KATEGORIN (allt som ska ha egg på en
bänk), inte just den här maskinen — nästa produkt kan vara ett bryne, ett
vinkelstöd eller en bandsats utan att brandet blir fel.

**Bortvalda och varför:**

| Namn | Varför inte |
|---|---|
| EdgeCraft | **EdgeCraft Corporation** är en riktig amerikansk slipmaskinstillverkare (Chef'sChoice). Samma kategori = kollision. |
| KeenEdge | `keenedge.com` är en marknadsföringsbyrå, och "keen" är ett ord få svenskar använder aktivt. |
| EdgeForge | "forge" läses inte säkert av en svensk, och pekar mot knivsmide snarare än slipning. |
| GritLine, BeltEdge, EdgeStation | Fungerar, men låser brandet vid bandet/korn i stället för vid eggen. |

**Domänkoll 2026-09-12** (RDAP når inte .se/.no härifrån — DNS-uppslag, och
tomt svar är "troligen ledig", aldrig "ledig"):

```
edgebench.se   ingen DNS-post  → troligen ledig
edgebench.no   ingen DNS-post  → troligen ledig
edgebench.com  DNS-träff, RDAP 200 → UPPTAGEN
```

`edgebench.com` är ett mjukvaruprojekt ("Edge Computing Benchmark"), alltså
en helt annan kategori och ingen konsumentkollision i Sverige eller Norge.
Vi köper **edgebench.se** (och reserverar edgebench.no för NO-marknaden),
precis som övriga OPS-butiker.

---

## 7. Paletten

De sex tidigare OPS-butikerna är mörkblå eller mörkgröna (HeimGuard,
TankGuard, DryTrek, TackleBay, AdventLane) eller varm kolgrå med bärnsten
(CatCabin). EdgeBench blir den första **kalla** — och accenten är den enda
färgen som ropar:

| Roll | Hex | Varför |
|---|---|---|
| mörk | `#1C2024` | gunmetall — bottenplattan och motorhuset |
| yta | `#F1F4F5` | kall stålgrå, inte crème — verkstad, inte vardagsrum |
| yta_djup | `#E1E6E9` | |
| accent | `#C8391F` | gnistan och det varma stålet. Röd är verkstadens egen signalfärg (och skiljer sig från CatCabins bärnsten `#D97B2A`) |
| god | `#1F7A5A` | bock |
| linje | `#D5DBDE` / `#B4BEC3` | |

**Typografi:** `archivo_n7` (kompakt industriell grotesk, tål versaler) +
`ibm_plex_sans_n4` (saklig brödtext i specar och villkor). Kombinationen
används inte av någon syskonbutik.

---

## 8. Loggan

Nytt motiv **`egg`**: en knivklinga sedd från sidan med eggen markerad i
accentfärgen och två gnistor vid spetsen. Motivet finns inte i någon annan
butik.

Loggfeedbacken lästes FÖRE genereringen (`logga-feedback.mjs --sammanfatta`):
**a 0, b 0, c 3** — c har vunnit tre gånger av tre, a och b har aldrig valts.
Regeln säger att en variant som aldrig väljs ska bytas mot något nytt, och
PROCESS.md skärpte den 2026-09-10: *"gör c till utgångsläge och pröva något
NYTT i a/b, inte ett nytt motiv i samma komposition."*

Därför är a och b **nya kompositioner** i `logga-generera.mjs`, inte samma
emblem och sigill med ett nytt motiv i:

- **a — bandet:** mörk disk med ett brett diagonalt accentband tvärs över
  (slipbandet), ordmärket ligger PÅ bandet och lutar med det. Rörelse, som
  Axel gillade i TackleBays horisont.
- **b — delad disk:** disken delad i två — ljus överdel med motivet stort,
  mörk underdel med ordmärket. Tvåfärgat, inget sigill.
- **c — oförändrad:** motivet stort, ordmärket litet under. Utgångsläget.

Valet loggas i `factory/LOGGA-FEEDBACK.md` efter att den som kör valt.
