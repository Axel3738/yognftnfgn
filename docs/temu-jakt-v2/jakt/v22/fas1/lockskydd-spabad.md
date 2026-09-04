# Lockskydd / cover cap för fast spabad — FAS 1, färdigställande

**Datum:** 2026-09-04 · **concept_id:** `lockskydd-skyddsoverdrag-cover-cap-for-fast-spab`
**Dom:** koncept **FAIL** · listning **BLOCKED_SOURCE** · **REJECT** · vinnar-DNA **52/100**

---

## Kortversionen

Uppdraget var att hitta en listning med användbart material. Det gick inte — och det spelar
ingen roll, för konceptet faller på något annat: **den svenska hyllan säljer redan exakt samma
sak billigare än vi kan.**

| Var | Vad | Pris | Källa |
|---|---|---|---|
| Fyndiq | Oxford-överdrag till spalock, 218×218×30 cm | **343–389 kr** | sökutdrag + kategorisidan |
| Hemson.se | Oxford Spa Cover Cap 2100×2100 mm, 30 cm kjol | **499 kr** | sidans pris-JSON |
| Amazon.se | 210D oxford, 210×210×30 cm, svart (B09CMPYBG8) | **634,49 kr** | sidans HTML |
| Spabadsbutiken / Kuben / Swiim / Spasupport / Denform | samma form, fackhandel | 1 290–1 495 kr | verifierade sidor |

Tänkt svenskt pris var 599–699 kr. Vid 599 kr säljer vi något kunden hittar för 343–499 kr.
Vid 499 kr faller multipeln till 2,10× landad kostnad — under kravet 2,4×.
Formen ligger dessutom på PriceRunner (jämförelsehandlad) och finns med svensk titel
direkt på temu.com/se. Det finns ingen prisnivå där både hyllan och ekonomin håller.

---

## Gaterna

| Gate | Dom | Varför |
|---|---|---|
| 1 Objekt | PASS | Spalocket på ett fast spabad. Står ute året om, förvaras aldrig inomhus. |
| 2 Presens | PASS | Löven faller nu. Fotograferbart i svensk trädgård i dag. |
| 3 Hyllan | **FAIL** | Kedjorna saknar formen, men Fyndiq/Hemson/Amazon.se säljer den för 343–634 kr. |
| 4 Material | BLOCKED_SOURCE | temu.com HTML strypt. Enda sedda bilden visar ett hopvikt överdrag framför ett **badkar**. |
| 5 Ekonomi | PASS (låst) | 19,39 USD → landad 202–237 kr → 2,5–3,0× vid 599 kr. Håller bara på ett pris hyllan inte tillåter. |
| 6 Variant | **FAIL** | Köparen måste mäta både lockets sida (76–92 tum) och hörnradien (R10–R25). Inget ägaren kan utantill. |
| 7 Hook | PASS | "Ligger löven på ditt spalock?" — 5 ord, ren ägarfråga. |
| 8 Publik | PASS | **160 000 spabad i Sverige** (Svenska Badbranschen, prognos 2023, ±15 %). Kravet är ≥ 100 000. |

Säsongen är rätt: sep–okt är lövfällning, och spabadet är den enda trädgårdsprodukten som
används **mer** när det blir kallt. Cirka 12 veckor kvar innan fönstret stänger. Det räddar
inte konceptet.

---

## Vad som hämtades

**28 listningar** kartlagda: 13 sedan tidigare, **15 nya i dag** (11 av dem i rätt form).
4 uteslöts som fel form (helöverdrag, lock, solfilt, pumpskydd).

**Pris/betyg/recensioner gick inte att få på en enda ny listning.** Seznam-vägen i
`DATAVAGAR.md` avsnitt 2 fungerar — jag reproducerade referensvärdet
`601099539458313 = $23, 4.8/96 %` exakt innan jag litade på metoden — men Seznams index
innehåller inga Temu-produktsidor alls i kategorin hot tub cover. 18 frågor, noll träffar.
Google, Bing, DuckDuckGo, Brave, Startpage, Ecosia, Qwant, Yandex och Mojeek gav captcha,
403 eller inga priser. **Ingen siffra är gissad.**

Materialet är fortsatt osett. Två fetch-tester 2026-09-04 09:46–09:48 UTC bekräftar
blockeringen: Googlebot-UA (samma väg som `temu-ld.py`) ger tomt skal utan JSON-LD;
Chrome-UA ger 200 och 319 KB med riktig `<title>` och `og:url`, men noll bild-URL:er och
noll pris. Enda vinsten var en fylligare kanonisk titel på `601099816288753`:
*"…black textured design with green accents, prevents leaves and debris"* — en
produktrendering, inte en scen med spalock utomhus.

**Två titlar var ändå värda att notera:**
`601099584115126` säger uttryckligen *"hot tub **hard cover** protector"* — skydd för det
styva locket, exakt rätt formulering. `601099564181407` har *"leaf protection"* i titeln.
Ingen av dem går att bedöma på bild.

---

## Varför det här inte är ett listningsfel

Regeln i V2.1 är att ett koncept faller på hyllan eller publiken, eller när ≥ 2 listningar
faller på samma strukturella sak. Här faller **hyllan** och **varianten**, och båda är
egenskaper hos produkten — inte hos någon enskild goods-id. Även en perfekt leverantörsvideo
på ett riktigt spalock i höstlöv löser inte att kunden hittar samma vara för 343–499 kr.

`failure_is_structural = true`. Lägg ingen mer hämtbudget här.

---

## Lärdomen värd att spara

Hyllverifieringen (`hylla/h4.json`) gav PASS men noterade själv i motiveringen att
"lägsta synliga pris på Pricerunner är dock 499–785 kr från okänd säljare". Den noteringen
var domen — den stod bara i fritext efter ordet "dock" i stället för i `verdict`.

**Hyllgaten måste läsa golvet, inte ankaret.** Ett ankare på 1 295 kr säger vad produkten
får kosta i fackhandeln; det säger ingenting om vad kunden faktiskt hittar när hen söker.
Nästa hyllkontroll ska alltid söka marketplace-golvet (Fyndiq, Amazon.se, Hemson,
CDON, Tradera) innan ankaret får sätta domen — och när golvet ligger under vårt tänkta
pris är gaten FAIL oavsett hur högt ankaret sitter.
