# Flerproduktsbutik — vad som krävs, och den fälla som inte syns

**Frågan (Axel 2026-09-09):** vissa produkter med samma målgrupp ska dela en
OPS-butik. Första fallet: Fiskespöhållaren + Fiskekalendern.

**Svaret:** butiksbygget är billigt — ungefär en dags arbete. Annonsdatan är
det som kostar, och den kostar på ett sätt som inte syns som ett fel.

Kartlagt 2026-09-09 med tre parallella granskare över `factory/`, annonsflödet
och strategilagret.

---

## Det goda: fabriken är redan nästan där

Fabriken är inte en enproduktsmotor. Den är en **butiksmotor med ett
enproduktsomslag**:

- `butik.mjs` delar redan butik från produkt (`sammanfoga(butik, produkt)`).
- **Sju av nio steg** i `ops.mjs` rör bara butiken — bara `produkt`,
  `metafalt` och `recensioner` är produktspecifika.
- Produktsidan är redan produktneutral: alla opf-sektioner läser
  `product.metafields.opf.*` och döljer sig själva när fältet saknas.
  **En `product.json` fungerar redan för N produkter.**
- Paketnivåerna är redan produktbundna i Liquid
  (`ms-paket.liquid`: `if niva.produkt.value.id == p.id`).
- `state.mjs` nycklar redan på paret butik+produkt.
- Startsidemallen har redan en flerproduktssektion (`sortiment` =
  featured-collection) som ingen använder.

## Det som måste byggas

| # | Vad | Svårighet |
|---|---|---|
| 1 | `ops.mjs` tar flera produktfiler: dela `STEG` i `BUTIKSSTEG` (körs en gång) och `PRODUKTSTEG` (loopas) | medel |
| 2 | Ett **startsidesteg** som skriver `templates/index.json` ur konfigen | medel |
| 3 | `meny`-steget skriver även `main-menu` — en länk per produkt | lätt |
| 4 | `kontroll.mjs` blir butikskontroll + produktkontroll per produkt | medel |
| 5 | Korg-upsellen blir korgmedveten i stället för en hårdkodad handle | medel |

⚠️ **Punkt 2 är en bugg redan i dag, inte bara en flerproduktsfråga.**
Bas-zip:ens `templates/index.json` bär källbutikens värden:
`produkt.product = "sushi-strumpor"`, `sortiment.collection = "strumporna"`.
Ingen kod rör filen — varje ny OPS-butik startar med en startsida som pekar på
Matstrumpors produkt tills en människa rättar den för hand.

⚠️ **Punkt 4 är samma bakläxa som TankGuard gav 2026-09-08.** QA kan bli grön
medan produkt 2 är DRAFT eller saknar bilder, och `--launch` publicerar bara
EN produkt. En tvåproduktsbutik kan gå live med halva sortimentet i 404.

---

## Fällan: annonsdatan

Två fynd som båda gör beslut systematiskt fel utan att synas som fel.

### 1. `creative_prefix` står på BRANDET, inte produkten

I dag: `creative_prefix: "TankGuard"` respektive `"HeimGuard"`. Det håller så
länge butiken bär en produkt.

Men prefixet är det **enda** fyra system använder för att skilja produkter åt:
prefixkartan (`leveranskon.mjs`), översättningskön (`oversattningskon.mjs`),
adsetuppslaget (`notion-till-meta.mjs`) och commission (`koppling.mjs`).

**Regeln som ska gälla:** en butik = ett brand = en pixel — men **en kampanj
och ett prefix PER PRODUKT**. Brandet hör hemma i kampanjnamnet
(`FISKE_RODHOLDER_…`, `FISKE_KALENDER_…`), prefixet i produkten.

Sätts prefixet per brand får man tysta fel i fyra system samtidigt.

### 2. Den delade pixeln gör kill- och skalningsbeslut fel

Pixeln är per butik, och **Metas Purchase-event bär ingen produkt**.

Två fiskeprodukter har helt olika break-even — en spöhållare och en kalender
ligger inte i närheten av varandra i pris. När båda köpen räknas mot samma
pixel subventionerar den billiga produktens köpvolym den dyra produktens
annonser i siffrorna. CPA ser bra ut. ROAS ser bra ut.

Och `docs/os/ANALYSMETOD.md` rangordnar på vinstbidrag
`(break-even-CPA − CPA) × köp` — med ett break-even-tal som inte gäller för
hälften av köpen. Ingen kod i repot delar upp köp per produkt, så felet är
osynligt tills lönsamheten är borta.

Det är samma felmönster som fel pixel: det syns inte som ett felmeddelande,
bara som konstig data.

**Motmedel innan en flerproduktsbutik launchas:**
- Egen kampanj per produkt (aldrig gemensam) — då kan spend delas upp.
- Läs köp per produkt ur **Shopify**, inte ur pixeln, när CPA räknas.
- Skriv break-even per produkt i produktfilen, aldrig ett butiksgemensamt tal.

---

---

## Läget 2026-09-14 — vad som byggts sedan kartläggningen

Kommandot **`/ops-produkt <butik> <källänk>`** finns nu (Axels fråga: "lägg
till en produkt på en befintlig butik i stället för att bygga en ny"), med
`factory/ops-produkt.mjs` som motor. Det gör förarbetet och kapslar in
fällorna, men **löser inte pixelproblemet** — det står kvar nedan.

**Klart sedan kartläggningen:**

| Punkt ovan | Läge |
|---|---|
| 1 — `ops.mjs` tar flera produktfiler | **Byggt.** `STEG` har `niva: 'butik'` / `'produkt'`; butikssteg körs en gång, de sex produktstegen loopas per produktfil. |
| 2 — startsidesteget | **Byggt.** `startsida` skriver `templates/index.json` ur konfigen. |
| 3 — menyn per produkt | **Byggt.** `meny` skriver `main-menu` ur alla produkter i körningen. |
| Fynd 1 — `creative_prefix` på produkten | **Gjort i filerna.** Alla produktfiler bär eget prefix under `meta:`. `ops.mjs` stoppar två produkter som delar prefix. |

**Lagat 2026-09-14, båda tysta:**

- `factory/kampanj.mjs` hade `const butikId = 'drytrek'` **hårdkodat**. Varje
  butiks kampanj byggdes alltså med DryTreks brand i namnet och `drytrek.se`
  i annonslänken. Butiken härleds nu ur produktens `brand.namn`
  (`butikForProdukt`, kastar hellre än gissar), och länken använder produktens
  `handle` i stället för filnamnet — TackleBays produkt pekade fel av samma skäl.
- `factory/rutin.mjs platsFor` räknade bara på butiksdelen av nyckeln, så en
  ANDRA produkt i samma butik fick **identisk cron** och två nattvakter startade
  samma minut mot det delade OPS-kontot — precis den rate limit platserna finns
  för. Uppslaget går nu på hela nyckeln, med butiksdelen som fallback så
  enproduktsbutikernas tider står still. `minutkrockar()` pekar ut en krock.

**Kvar, och det är fortfarande fällan:**

1. **Pixeln.** Oförändrad. Ingen kod delar upp köp per produkt — sökning på
   `content_ids|product_id` i `skalning.mjs`, `budgetrond.mjs` och `ekonomi.mjs`
   ger noll träffar (2026-09-14). Motmedlet "läs köp per produkt ur Shopify"
   är inte byggt. Tills det är det: **döm aldrig en annons i en
   flerproduktsbutik på pixelns CPA** — hämta köpen ur Shopify och skriv i
   rapporten att du gjort det.
2. **Tre butiker har prefix = brandnamn:** `overvakningskameran.yaml`
   (`HeimGuard`), `tankguard.yaml` (`TankGuard`), `utekattkojan.yaml`
   (`CatCabin`). De är enproduktsbutiker i dag, så det håller — men får någon
   av dem en andra produkt måste prefixet göras produktskopat FÖRST, annars
   matchar brandprefixet båda produkternas annonser.
3. **Ett bart butiks-id kastar** så fort butiken bär två produkter
   (`register.mjs hittaPost`). Butikens tre befintliga rutiner har butiks-id i
   sin prompt och slutar då gå. De måste skrivas om till `<butik>/<produkt>`
   med `update_trigger` **innan** produkt 2 får en state-fil. Högljutt fel,
   men det inträffar på natten.
4. **Adsetnamnen saknar produkt** (`kampanj.mjs`: `{BRAND}_{MARKNAD}_{vinkel}`).
   Två produkter får identiskt namngivna adsets i var sin kampanj. Inte fel i
   dag — adsetuppslaget går på kampanjen — men det gör en manuell avläsning i
   Ads Manager förvirrande.

## Rekommendation

**Bygg fiskebutiken — men i den här ordningen:**

1. Fixa startsidesteget (punkt 2) — det är en bugg som drabbar varje butik nu.
2. Flytta `creative_prefix` till produktnivå, i alla butiker.
3. Bygg produktloopen i `ops.mjs` + menyn + QA per produkt (punkt 1, 3, 4).
4. Först därefter: två produkter i en butik, med egen kampanj per produkt.

**Alternativet om det ska gå snabbt:** bygg fiskebutiken som en huvudprodukt
plus tillbehör i stället för två jämlika produkter. Fabriken klarar det redan
(Q4-bonusen är ju en andra produkt i butiken), och pixelfällan uteblir
eftersom bara en produkt annonseras. Nackdelen är att den andra produkten
aldrig får egen annonsering med full kraft.

---

## Läget 2026-09-16 — första riktiga körningen: CaraShell fick termoskyddet

`/ops-produkt carashell <länk>` från Axel. Vad som höll och vad som fick lagas:

**Höll:** `ops-produkt.mjs` (utkast, prefixkrock, körrad med alla filer), bygget med
`--igen kollektion,startsida,meny,tema` (takskyddet kvar i meny + startsida, kollektionen
skapad, korg-upsellen pekar på produkt 2), `register.mjs skriv-in` (ett bart `carashell`
kastar nu som det ska), egen kampanj per produkt, `budgetrond` dömer mot produktfilens
egen break-even.

**Lagat samma dag:**
- `rutin.mjs` saknade CLI-flaggan `--flerprodukt` — `--tider carashell/termoskyddet
  --skriv-in` hade ärvt plats 5 (takskyddets minut). Nu plats 7 (00:57 / 14:15 / 16:15).
- `kampanj.mjs` döpte annonser med brandet, inte produktens prefix (FAS2.md 2026-09-16).
- `oversattning.mjs` byggde huvudmenyn för hand (utan Hem, Frakt & retur) — "Hem" fick
  aldrig en nyckel och stod kvar på /nb. Nu samma `huvudmenyRader` som meny-steget.
- `marknad.mjs` räknade paketnivåernas `fastpris_valutor` (NOK-tal) som svenska läckor.
- `tillagg_kryssruta: true` på produkt 1 gav röd kundvy: fullpris-kryssrutan byggs bara
  i enproduktsläget (`tema.mjs`), korg-upsellen bär samma sak. Sätt false.
- NOK-prislistan får inte produkt 2 av sig själv: `priceListFixedPricesAdd` per variant
  efter bygget (tre rader, API-GRANSER.md). Gjort för hand i sessionen.
- Norskan för produkt 2 + de omskrivna brandtexterna kräver `--igen oversatt` — körraden
  ovan tar inte med det steget, och ett grönt state hoppar över det.

**Kvar (oförändrat):** pixeln. Termoskyddet 559 kr mot takskyddet 1 129 kr = 2× — inte brus.
Läs köp per produkt ur Shopify innan någon annons i CaraShell döms.

**Hubben:** integrationen "Bäverbutiken RUTINER" ser inga SIDOR i Notion, bara
databasrader — `notion-hub.mjs --foralder` har ingen förälder att skapa under. En hub för
produkt 2 är därför Axels klick (duplicera "Carashell creative hub", döp om), sedan
`node factory/register.mjs notion carashell/termoskyddet <id>` och `/notionscalercs setup`.
