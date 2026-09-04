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

**Två av åtta gater gick bara att köra delvis.** Temu blockerade containerns IP
från ~00:58 UTC 2026-09-04 (tomt JS-skal utan JSON-LD på `/se` och alla andra
landssajter). Klockan 07:21 UTC svarade **USA-sidan** (`temu.com/g-<id>.html`,
utan landsprefix) med JSON-LD — pris i USD, betyg, galleri och ibland video —
i knappt tio anrop innan även den ströps. Kontroll på IBC-överdraget: galleriet
är identiskt mellan SE och US, men **US-sidan utelämnar videon som SE-sidan
har**. USA-datan är alltså en proxy: heron gäller, "ingen video" gäller inte,
och priset måste räknas om (kalibrering nedan). En långsam hämtning (ett anrop
var fjärde minut) går i bakgrunden för resten av A/B-listan.

| Gate | Läge | Vad som saknas |
|---|---|---|
| 1 OBJEKTET | ✅ körd på alla 519 | — |
| 2 PRESENS | ✅ körd på alla 519 | — |
| 3 HYLLAN | ✅ körd; **verifierad** med kedje-/fackhandelssök för 39 koncept (64 listningar) i `jakt/hylla/h1–h5.json`; övriga "ur sökutdrag/minne" | Biltema svarar 403 överallt — deras hylla är läst ur sökutdrag, aldrig ur sajten |
| **4 MATERIALET** | ⚠️ **körd på 6 av 519** (via USA-sidan) | 2 videor sedda (kikarselen, utekattkojan), 4 bara hero. För alla övriga: `BLOCKED_SOURCE` |
| **5 EKONOMI** | ⚠️ **körd på 6 av 519** (USA-pris × kalibrering, `economics_source = us-proxy`) | Landad kostnad, multipel, BE-CPA för resten: UNKNOWN. Kalibrering SE/US: IBC 108,51 kr / 15,60 USD = 6,96; motorhöljet 71,22 kr / 8,73 USD = 8,16 kr per USD |
| 6 VARIANT | ✅ körd på slug-titel/sökträff | SKU-listan (bildbeskrivningarna) ej läst |
| 7 HOOK | ✅ | — |
| 8 PUBLIK | ✅ | — |

**Läget efter V2.1 (avsnittet nedan):** ett koncept har en listning som klarar
material + ekonomi — **utekattkojan** (hero: riktig katt i kojan i höstlöv;
10,93 USD → 4,5–5,3× vid 599 kr; Supercat 1 799 som ankare). Den står som
**A (villkorad: publik)** eftersom köparen skev mot kvinna medan fingeravtrycket
säger man 45–70. De fem tidigare villkorade A föll var och en på *sin listning*
(badkar-hero, packshot, USA-pris) — enligt V2.1 är det `ALTERNATIVE_LISTING_REQUIRED`,
inte FAIL: 12 alternativa listningar är funna och ligger i hämtkön. Spa-räcket
är det enda där felet troligen sitter i produkten (stål, 80 USD), men det avgörs
först när ≥ 2 listningar fallit på samma sak.

Det som **inte** är UNKNOWN är själva jakten: 96 ägda objekt kartlagda, 519
listningar hittade, 374 avslagna med orsak, och en hylla som är verifierad på
riktigt för de koncept som överlevde.

---

<!-- V21:START -->
## V2.1 — koncept skilt från listning (patch 2026-09-04 08:53 UTC)

Axels patch V2.1 är i drift: hyllan verifieras **före** Temu-jakten, PRODUKTKONCEPT och LISTNING är två entiteter, statusmodellen är `PASS / FAIL / UNKNOWN / BLOCKED_SOURCE / PENDING_VERIFICATION / ALTERNATIVE_LISTING_REQUIRED`, och ett tekniskt fel (blockerad källa) blir aldrig ett kommersiellt. Hela pipelinen: `jakt/PIPELINE-V2.1.md`. Koncepttabellen: `jakt/koncept.json`.

### Koncept-tratten

```
listningar                                                                   519
koncept                                                                      386
objekt PASS                                                                  291
presens PASS                                                                 255
hyllkvalificerade (verifierad PASS)                                           26
hylla PENDING_VERIFICATION                                                    83
strukturkvalificerade (variant/hook/publik ej FAIL, ej strukturellt fällda)   25
slutliga konceptöverlevare (status ≠ FAIL)                                    25
```

Statusfördelning bland koncepten: FAIL 361, PENDING_VERIFICATION 14, BLOCKED_SOURCE 6, ALTERNATIVE_LISTING_REQUIRED 4, PASS 1.

### Listnings-tratten

```
kandidatkoncept (≠ FAIL)                                  25
listningar i dem                                          61
listningar hämtade (Temu-data)                             5
material PASS                                              3
ekonomi PASS                                               4
bästa listning vald (material + ekonomi PASS)              1
koncept ALTERNATIVE_LISTING_REQUIRED                       4
koncept BLOCKED_SOURCE                                     6
```

Målet är ett starkt koncept parat med en användbar listning. Hittills har **1** koncept en sådan listning.

### Konceptöverlevare (status ≠ FAIL)

| Tier | Koncept | Status | Listn. | Alt. | Hämtade | Hylla | Vad som fattas |
|---|---|---|---|---|---|---|---|
| A | Isolerad utekattkoja i Oxford-tyg, vinter (`isolerad-utekattkoja-i-oxford-`) | `PASS` | 6 | 0 | 1 | PASS | — |
| B (närmast A) | Vedställsöverdrag (bara överdrag, 4–8 ft, spännen) (`vedstallsoverdrag-bara-overdra`) | `ALTERNATIVE_LISTING_REQUIRED` | 3 | 7 | 1 | PASS | annan listning: 7 funna, 0 hämtade — gate 4 PASS på heron (överdraget på ett vedställ, röd text i nederkanten beskärbar), video |
| B (närmast A) | Lockskydd/skyddsöverdrag (cover cap) för fast spabad, över d (`lockskydd-skyddsoverdrag-cover`) | `ALTERNATIVE_LISTING_REQUIRED` | 4 | 10 | 1 | PASS | annan listning: 10 funna, 0 hämtade — gate 5 PASS på US-pris (19,39 USD → landad 202–237 → 2,5–3,0× vid 599); gate 4 FAIL på det |
| B (närmast A) | Tändvedsklyv i gjutjärn (Kindling Cracker-typ) (`tandvedsklyv-i-gjutjarn-kindli`) | `ALTERNATIVE_LISTING_REQUIRED` | 2 | 10 | 1 | PASS | annan listning: 10 funna, 0 hämtade — gate 5 PASS på US-pris (16,25 USD → landad 170–200 → 3,0× vid 599; frakt på gjutjärn kan ä |
| B | Jaktparaply för torn/pass, 58", camo, spänns runt stam (`jaktparaply-for-torn-pass-58-c`) | `BLOCKED_SOURCE` | 1 | 0 | 0 | PASS | Temu-hämtning (material + pris) |
| B | Hängrännerensar-sats till lövblås (universal, teleskoprör 11 (`hangrannerensar-sats-till-lovb`) | `PENDING_VERIFICATION` | 2 | 0 | 0 | PASS | variant/SKU-lista, Temu-hämtning |
| B | Skydd/vinteröverdrag för poolvärmepump (`skydd-vinteroverdrag-for-poolv`) | `PENDING_VERIFICATION` | 1 | 0 | 0 | PASS | variant/SKU-lista, publikstorlek, Temu-hämtning |
| B | Väggstöd/avståndsstöd till stege (`vaggstod-avstandsstod-till-ste`) | `BLOCKED_SOURCE` | 9 | 0 | 0 | PASS | Temu-hämtning (material + pris) |
| B | Sopkärlslocklås med rem (mot vind/djur) (`sopkarlslocklas-med-rem-mot-vi`) | `BLOCKED_SOURCE` | 3 | 0 | 0 | PASS | Temu-hämtning (material + pris) |
| B | Utvändigt termoskydd/vindruteskydd för husbil (`utvandigt-termoskydd-vindrutes`) | `PENDING_VERIFICATION` | 1 | 0 | 0 | PASS | variant/SKU-lista, publikstorlek, Temu-hämtning |
| B | Gevärshållare/vapenhållare för ATV (`gevarshallare-vapenhallare-for`) | `PENDING_VERIFICATION` | 1 | 0 | 0 | PASS | publikstorlek, Temu-hämtning |
| B | Hårdbottnad baksätesförlängare / hundplattform för bil (`hardbottnad-baksatesforlangare`) | `PENDING_VERIFICATION` | 6 | 0 | 0 | PASS | variant/SKU-lista, Temu-hämtning |
| B | Tornsits/sittdyna med spännremmar för jakttorn, camo, vadder (`tornsits-sittdyna-med-spannrem`) | `BLOCKED_SOURCE` | 4 | 0 | 0 | PASS | Temu-hämtning (material + pris) |
| B | Hjulpiggar/antislip-piggar till robotgräsklippare (`hjulpiggar-antislip-piggar-til`) | `PENDING_VERIFICATION` | 3 | 0 | 0 | PASS | variant/SKU-lista, Temu-hämtning |
| B | Kupolnät/lövnät för trädgårdsdamm med dragkedja (`kupolnat-lovnat-for-tradgardsd`) | `PENDING_VERIFICATION` | 1 | 0 | 0 | PENDING_VERIFICATION | hylla verifierad, variant/SKU-lista, publikstorlek, Temu-hämtning |
| B | Spatrappa universal (plast, 2 steg) (`spatrappa-universal-plast-2-st`) | `BLOCKED_SOURCE` | 2 | 0 | 0 | PASS | Temu-hämtning (material + pris) |
| B | Hopfällbar isolerad hundkoja (`hopfallbar-isolerad-hundkoja`) | `PENDING_VERIFICATION` | 1 | 0 | 0 | PASS | variant/SKU-lista, Temu-hämtning |
| B | 2pcs 17 inch Gutter Ladder Safety Rest, non-slip gutter guar (`auto:hus-takrannan-anliggande-`) | `PENDING_VERIFICATION` | 1 | 0 | 0 | PENDING_VERIFICATION | hylla verifierad, Temu-hämtning |
| B | Styrstolpar/guide posts till båttrailer (`styrstolpar-guide-posts-till-b`) | `BLOCKED_SOURCE` | 2 | 0 | 0 | PASS | Temu-hämtning (material + pris) |
| B | hunden efter höstpromenaden + hallen/bilen (`auto:djur-hunden-efter-hostpro`) | `PENDING_VERIFICATION` | 3 | 0 | 0 | PENDING_VERIFICATION | hylla verifierad, variant/SKU-lista, Temu-hämtning |
| C | Spa-räcke/handledare för spabad (`spa-racke-handledare-for-spaba`) | `ALTERNATIVE_LISTING_REQUIRED` | 1 | 4 | 1 | PASS | annan listning: 4 funna, 0 hämtade — spa-räcke: 79,99 USD → SE-Temu 557–653 → landad 836–980 kr → 2,4× kräver 2 006–2 352 kr; i |
| C | 1pc Solar House Number Light, LED doorplate, IP55, auto on/o (`auto:hus-husets-fasad-grind-un`) | `PENDING_VERIFICATION` | 1 | 0 | 0 | PENDING_VERIFICATION | hylla verifierad, variant/SKU-lista, Temu-hämtning |
| C | hård förvaringsbox bak för ATV (`auto:mc-hard-forvaringsbox-bak`) | `PENDING_VERIFICATION` | 1 | 0 | 0 | PENDING_VERIFICATION | hylla verifierad, Temu-hämtning |
| C | handskydd/vindskydd för styre (PVC), MC/scooter (`auto:mc-handskydd-vindskydd-fo`) | `PENDING_VERIFICATION` | 1 | 0 | 0 | PENDING_VERIFICATION | hylla verifierad, variant/SKU-lista, publikstorlek, Temu-hämtning |
| C | kapell för promenadscooter/elrullstol (420D Oxford, reflex,  (`auto:mc-kapell-for-promenadsco`) | `PENDING_VERIFICATION` | 1 | 0 | 0 | PENDING_VERIFICATION | hylla verifierad, variant/SKU-lista, publikstorlek, Temu-hämtning |

Koncept med `FAIL`: 361 — alla med orsak i `koncept.json` (`status_reason`, `failure_is_structural`). 141 av dem föll på en hylla som bara är läst ur sökutdrag/minne (`shelf_verified = false`) — det är nästa verifieringskö enligt den nya ordningen.

<!-- V21:END -->

**Första strukturella avslaget via alternativa listningar (08:53 UTC):**
kikarselen. Fem listningar av samma form (bröstväska med lock + sele +
regnskydd) kostar 26,59 / 28,49 / 30,85 / 47,32 / 68,59 USD på Temu US — alla
ger landad ≥ 280 kr och 2,4× ≥ 670 kr, mer än ankaret Blaser 999 bär. Den
alternativa videon (601099581347239) var dessutom sämre: sommar, compoundbåge,
talking head. Felet sitter i formen, inte i listningen → `FAIL`,
`failure_is_structural = true`. Det är exakt det V2.1-regeln A är till för.

## 1. Objektuniversumet

Tretton kluster, 96 ägda objekt, varje objekt med vad ägaren behöver göra med
det (skydda / fästa / rengöra / organisera / förvara / säkra / underhålla / nå /
transportera / förbättra / bekvämare) och om friktionen finns i september–oktober.
Hela tabellen: `jakt/objektuniversum.md` avsnitt 1. Klustren:

| Kluster | Objekt (urval) | Rå | A | B | C | ELIM |
|---|---|---|---|---|---|---|
| bat | båt under presenning, utombordare på trailer, båttrailer, kajak, brygga | 31 | 0 | 2 | 11 | 18 |
| grasklippare | robotgräsklippare, åkgräsklippare, lövblås + hängränna | 28 | 0 | 5 | 1 | 22 |
| handmaskiner | motorsåg, röjsåg, trimmer, lövblås, ved + borrmaskin | 18 | 0 | 0 | 9 | 9 |
| vatten | IBC-tank, regntunna, utekran, stuprör, damm, dammpump | 34 | 0 | 1 | 12 | 21 |
| husvagn | husvagnen uppställd, husbilen ute, släpvagnen, dragkroken | 34 | 0 | 1 | 3 | 30 |
| mc | MC avställd, moped, ATV, snöskoter | 27 | 0 | 1 | 5 | 21 |
| pool | fast spabad (lock, insteg, vatten), poolvärmepump, pool som stängs | 40 | 0 | 6 | 8 | 26 |
| ved | vedstället, presenningen, braskaminen, eldstaden | 22 | 0 | 3 | 6 | 13 |
| jakt | handkikaren, jakttornet, geväret, åtelkameran, jakthunden | 43 | 0 | 7 | 17 | 19 |
| tomt | sopkärlet, brevlådan, flaggstången, grinden, uppfarten, altanen | 27 | 0 | 3 | 4 | 20 |
| hus | takränna, stuprör, stege, luftvärmepump, garageport, fönster | 52 | 0 | 10 | 1 | 41 |
| garage | elbil + laddbox, takbox, däck, dragkrok, garaget | 33 | 0 | 0 | 4 | 29 |
| djur | hund (bil, koja, torkning), höns, häst, utekatt, fåglar, skadedjur | 130 | 0 | 16 | 9 | 105 |
| **Summa** | | **519** | **0** | **55** | **90** | **374** |

(B = 4 "närmast A" + 23 huvudlistningar i 17 koncept + 28 dubblettlistningar.
Talen är ur `dataset.json` efter hyllverifiering, gate 4+5 på USA-data och slutdom.)

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
→ EFTER MATERIAL        180   (gaten körd på 5 + 4 tidigare; resten passerar som UNKNOWN)
→ EFTER EKONOMI         154   (−26 på titelpris/US-pris; landad kostnad UNKNOWN för resten)
→ EFTER VARIANT         125   (−29: USA-mått, mått ägaren måste ta, SKU per modell)
→ EFTER HOOK            125   (0 fällda — hooken är aldrig flaskhalsen)
→ EFTER PUBLIK          120   (−5: ägarklass < 100 000 eller fel köpare)
→ FINAL TIER A            0   (fem villkorade A prövade mot gate 4+5 på USA-data — ingen håller)
```

Trattens "EFTER MATERIAL" och "EFTER EKONOMI" är alltså **inte** riktiga
avsmalningar — de släpper igenom UNKNOWN. Räknar man strikt (bara PASS går
vidare) stannar tratten på 0 efter material — och där gate 4+5 faktiskt kördes
(avsnitt 3) blev utfallet också 0.

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

## 3. Gate 4 + 5 på USA-data — de fem villkorade A, och varför ingen håller

Hämtat 07:22–07:27 UTC via `temu.com/g-<id>.html` (rådata i
`jakt/material/us-raw/`, bilder i `jakt/material/bevis/`, domarna i
`jakt/material/a-kandidater.json`). Ekonomin räknas på USA-priset med
kalibreringen SE-Temu-pris = USD × 6,96–8,16 (två kända vinnare), landad =
SE-Temu × 1,5, krav ≥ 2,4× och BE-CPA ≥ 190 (`jakt/ekonomi.py`).

| | Lockskydd spabad | Kikarsele | Spa-räcke | Vedställsöverdrag | Tändvedsklyv |
|---|---|---|---|---|---|
| Goods-id | 601099619866532 | 601099566089885 | 601099575291512 | 601099615828436 | 601099583674464 |
| **Temu US-pris** | 19,39 USD | 26,59 USD | 79,99 USD | 34,47 USD (8 ft) | 16,25 USD |
| Betyg (US) | ★4,7 (204) | ★4,7 (303) | ★4,5 (118) | ★4,4 (10) | ★4,9 (28) |
| Galleri / video (US) | 1 bild / nej | 3 bilder / **ja, 37 s** | 2 bilder / nej | 1 bild / nej | 1 bild / nej |
| SE-Temu-pris (est.) | 135–158 kr | 185–217 kr | 557–653 kr | 240–281 kr | 113–133 kr |
| Landad (est.) | 202–237 kr | 278–326 kr | 836–980 kr | 360–422 kr | 170–200 kr |
| 2,4× kräver | 485–569 kr | 667–782 kr | 2 006–2 352 kr | 864–1 013 kr | 408–480 kr |
| Pris hyllan tillåter | 699–799 (ankare 1 295) | ≤ 624 (ankare 999) | ≤ 999 (VEVOR 860) | 349–399 (ankare 549) | 499–599 (Jula 999) |
| **Gate 5 EKONOMI** | ✅ PASS 2,5–3,0× vid 599 | ❌ FAIL 1,9–2,2× vid 624 | ❌ FAIL 0,9–1,1× | ❌ FAIL 0,8–1,0× (4 ft okänt) | ✅ PASS 3,0× vid 599 (frakt gjutjärn ej räknad) |
| **Hero** | hopvikt överdrag framför ett **badkar** i djungel — fel objekt, ej i bruk, textfri | packshot vit bakgrund, textfri, märke broderat | rendering: räcket monterat på spabad + cutout; sol/snö-ikoner beskärbara | rendering: överdraget på fullt vedställ, "NOTE: Cover Only" i nederkanten beskärbar | packshot vit bakgrund, ensam, ingen ved/klubba/hand |
| **0–3 s** | ingen video | 0–1 s logotypkort "NEW VIEW HUNTING"; 1–3,5 s riktig jägare i höstskog öppnar väskan, tar upp kikaren, lyfter den | ingen video | ingen video | ingen video |
| Resten av videon | — | från 5 s: compoundbåge i trädstand (bågjakt förbjuden i Sverige), Canon-kamerarigg i bild, en vertikal unboxing; ~10 användbara sekunder | — | — | — |
| **Gate 4 MATERIAL** | ❌ FAIL på det som syns (SE-video okänd) | ✅ PASS villkorat: rå + captions KANSKE (1–6 s + 14–20 s, tight beskuren) | ✅ PASS på heron (rendering) | ✅ PASS på heron (beskuren) | ❌ FAIL på det som syns (SE-video okänd) |
| **Slutdom** | **B (närmast A)** | **B (närmast A)** | **C** (ekonomi) | **B (närmast A)** | **B (närmast A)** |
| Vad som flippar den till A | en leverantörsvideo med skyddet på ett riktigt spalock (SE-sidan eller dubbletterna 601099524126091 / 601099527353718) | SE-Temu-pris ≤ ~150 kr (då 549–599 kr = 2,4× och ankaret 999 = 1,7×) | inget — prisstrukturen saknar en nivå under 2 000 kr | 4 ft-varianten ≤ ~110 kr på Temu SE | en video som visar slaget och stickan inom 3 s |

**Vad de fem säger om filtret:**

1. **USA-priset ändrade rangordningen.** Hyllan tillät 699–799 kr för
   lockskyddet och 349–399 för vedställsöverdraget — men bara lockskyddet får
   plats med 2,4× ovanpå landad kostnad. Priset hyllan *tillåter* och priset
   kalkylen *kräver* är två olika tal, och båda måste stämma.
2. **Två av fem heros visar fel sak.** Lockskyddet framför ett badkar och
   klyven som packshot: det spelar ingen roll hur bra strukturen är om
   leverantören inte fotograferat produkten i bruk. Det är gate 4:s hela poäng —
   och den går inte att köra på titeln.
3. **Kikarselens video är den enda som visar en riktig ägare** — och den har
   ett logotypkort först, en amerikansk bågjägare efter fem sekunder och en
   kamerarigg i bild. "Rå + captions" är möjligt men inte gratis.

## 4. TIER B — 21 koncept, en meningsfull osäkerhet kvar

Osäkerheten står i klartext. De fyra "B (närmast A)" ur avsnitt 3 står
först; sedan 17 koncept (23 huvudlistningar — hängrännesatsen och hjulpiggarna
har flera) + 28 dubbletter med `tier = "B (dubblett)"` i `dataset.json`.

| # | Koncept | Goods-id | Gate 4 / 5 (USA-data) | Vad som fattas |
|---|---|---|---|---|
| A→B | Lockskydd spabad | 601099619866532 | ekonomi ✅ · material ❌ (badkar) | video på ett riktigt spalock |
| A→B | Kikarsele | 601099566089885 | material ✅ villkorat · ekonomi ❌ (1,9–2,2×) | SE-pris ≤ ~150 kr |
| A→B | Vedställsöverdrag | 601099615828436 | hero ✅ · ekonomi ❌ (8 ft) | 4 ft-pris ≤ ~110 kr |
| A→B | Tändvedsklyv | 601099583674464 | ekonomi ✅ · material ❌ (packshot) | video med slaget inom 3 s |

| # | Koncept | Goods-id | Kluster | Hylla | Den kvarvarande osäkerheten |
|---|---|---|---|---|---|
| B1→A | Utekattkoja, isolerad Oxford | 601101118338671 | djur | ✅ PASS (Supercat 1 799, Kerbl 1 017; Shein 424 närmast) | **Uppgraderad 08:46 UTC:** hero = riktig katt i kojan utomhus i höstlöv (textfri); video = studiodemo (bevisklipp); 10,93 USD → 4,5–5,3× vid 599. Kvar: **publiken** (köparen skev mot kvinna) och SKU-listan (färger + troligen två storlekar) |
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
| Spa-räcke | 601099575291512 | 79,99 USD → landad 836–980 kr → 2,4× kräver > 2 000 kr | Taket på 1 000 kr slår före hyllan; ett starkt ankare (Folkpool 2 995) räddar inte en produkt som kostar 900 kr landad |
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
7. **Temu stryper efter ~10 anrop på 5 minuter — per väg.** `/se` föll efter
   agenternas burst i natt; USA-vägen öppnade efter 6,5 timmars tystnad och
   föll efter tio anrop. Hämtningen måste vara långsam från början (ett anrop
   per några minuter), aldrig parallell, aldrig med omförsöksloop.

---

## 7. Nästa steg (pågår)

1. **Långsam hämtning:** `jakt/hamta-langsam.py --paus 120` tar kön i
   V2.1-ordning — alternativa listningar för de fem "annan listning krävs"
   (34 st) → Tier B (50) → resten — ett anrop i taget, cachat, aldrig samma
   id två gånger. USA-sidan öppnade igen 08:46 UTC. Kön dör när sessionen
   somnar; den körs i aktiva turer och fortsätter vid varje väckning.
2. När den gått igenom: materialgaten (`jakt/material/instruktion.md`) på de
   B-listningar som fick video, `jakt/ekonomi.py` på alla med pris, sedan
   `slutdom.py` + `konsolidera.py` — och den här filen + artefakten uppdateras.
3. När `/se` svarar igen: `jakt/hamta-ko.py --paus 60` för SE-pris och SE-video
   på de fyra "B (närmast A)" — det är de fyra siffror/videor som avgör om
   någon blir A.
4. När Meta-data kommer på en testad kandidat: fyll utfallet i `dataset.json`
   och jämför mot `structure_match`. Det är hela poängen med datasetet.

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
| `hamta-ko.py`, `hamta-langsam.py`, `konsolidera.py`, `hylla-tillamp.py`, `material-tillamp.py`, `ekonomi.py`, `slutdom.py` | Hämtkön (snabb / långsam USA-väg), sammanslagningen, hyll- och materialverdikten in i datasetet, gate 5 på USA-pris, huvudsessionens slutdom |
| `material/a-kandidater.json`, `material/b-kandidater.json`, `material/us-raw/`, `material/bevis/` | Gate 4-domarna (de fem villkorade A + utekattkojan), rådatan från USA-sidan, hero + 0–3-sekundersbilder |
| **`PIPELINE-V2.1.md`** | Den normativa pipelinen efter patchen: gate-ordning, koncept/listning, statusmodell, hämtdisciplin, fält, trattar, körordning |
| **`koncept.json`** | Ett objekt per PRODUKTKONCEPT (386): listningar, konceptstatus, gater, alternativa listningar, bästa listning, strukturellt/listningsspecifikt fel |
| `koncept.py`, `rapport-v21.py` | Bygger konceptlagret + de två trattarna ur `dataset.json`; genererar V2.1-avsnittet i rapport och artefakt |
| `alt/<koncept>.json` | Alternativa Temu-listningar (upp till 10) för koncept som fällts på en listning — 36 funna för fem koncept |

Fält per kandidat: `goods_id, url_se, title, temu_price_sek, rating, review_count,
review_dates, category_path, image_count, hero_url, video_url, video_checked,
object, owner_owns, friction, old_way, variants, swedish_equivalent{},
brand_anchor{}, gates{object, presence, shelf, material, economics, variant, hook,
audience}, negative_space_flags[], eliminated_at, structure_match,
category_novelty, tier, tier_agent, tier_reason, biggest_risk, confidence, sources,
temu_us{price_usd, rating, review_count, images, video_url}, gates.economics_us{}` —
plus V2.1: `concept_id, listing_id, concept_status, listing_status,
alternate_listing_count, material_verified, economics_verified, economics_source,
source_blocked, verification_timestamp, failure_is_structural,
failure_is_listing_specific, gate_status{}`.
Saknat värde = `null`/`"UNKNOWN"`, aldrig en gissning.
