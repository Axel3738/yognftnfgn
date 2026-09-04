# Produktjakten — pipeline V2.1 (patch 2026-09-04)

Axels patch "PRODUCT HUNT V2.1" i drift. Det här är den normativa beskrivningen; skripten i den här
mappen följer den. Vinnar-fingeravtrycket (`docs/temu-vinnar-dna.md` avsnitt 12) är oförändrat — det
som ändrats är **ordningen**, **entiteterna**, **statusmodellen** och **hämtdisciplinen**.

## 1. Gate-ordningen

```
1 OBJEKT          koncept    ägt, utomhus/kroppsligt/universellt
2 PRESENS         koncept    friktionen finns i launchmånaden, fotograferbar
3 SVENSKA HYLLAN  koncept    ingen kedja i samma form, eller ankare ≥ 1,6× — VERIFIERAD innan Temu rörs
4 TEMU-LISTNINGSJAKT          listningar söks bara för koncept som klarat 1–3
5 MATERIAL        listning   leverantörsvideo i bruk ≤ 3 s, textfri hero
6 EKONOMI         listning   landad × 2,4 ≤ svenskt pris ≥ 300, BE-CPA ≥ 190
7 VARIANT         koncept (listning kan avvika)
8 HOOK            koncept
9 PUBLIK          koncept
```

Ingen Temu-hämtbudget på koncept som faller på 1–3. Hyllan kollas på ägarens **svenska** ord
(PriceRunner via curl, `site:jula.se` …) innan en enda Temu-sökning. V2 gjorde tvärtom och tolv av
tretton kluster fick slut på sökbudget före hyllkontrollen.

## 2. Två entiteter

| | PRODUKTKONCEPT | LISTNING |
|---|---|---|
| Vad | en fysisk produktform + ägt objekt + friktion | en Temu-goods-id |
| Id | `concept_id` (slug, t.ex. `pool-lockskydd-spabad`) | `listing_id` = goods-id |
| Gater | objekt, presens, hylla, variant, hook, publik | material, ekonomi (+ variant kan avvika) |
| Fil | `koncept.json` | `dataset.json` / `dataset.csv` (en rad per listning) |

Ett koncept har en eller många listningar. **En svag listning dödar aldrig ett starkt koncept.**
Koncept = FAIL bara om (A) gate 1–3 eller strukturen (variant/hook/publik) faller, (B) flera
listningar faller på samma strukturella sak, eller (C) felet är inbyggt i produkten (t.ex. ett
stålräcke som alltid kostar 800 kr landat). Annars: `ALTERNATIVE_LISTING_REQUIRED`.

Grupperingen listning → koncept (`koncept.py`): hyllverifieringens konceptlistor → `alt/*.json`
(kända + funna listningar) → slutdomens "dubblett av <id>" → för resten samma kluster + objekt + hook.
Nycklar som börjar med `auto:` är maskingrupperade och kan behöva slås ihop för hand.

## 3. Alternativ listning (steg 3 i patchen)

När en listning faller på MATERIAL eller EKONOMI: sök upp till 10 andra Temu-listningar av samma
fysiska produkt (`alt/instruktion.md` → `alt/<koncept>.json`), utan att röra temu.com. Jämför pris,
video, hero, säljare, betyg, sålt-tal, varianter. De funna id:na hamnar i hämtkön med prioritet strax
efter Tier A. Först när ≥ 2 listningar fallit på samma gate blir konceptet FAIL med
`failure_is_structural = true`.

## 4. Statusmodellen

| Status | Betyder |
|---|---|
| `PASS` | gaten klarad på sett/verifierat underlag |
| `FAIL` | gaten fälld på sett/verifierat underlag |
| `UNKNOWN` | inte bedömd alls |
| `BLOCKED_SOURCE` | kunde inte bedömas för att källan (Temu) var blockerad — **tekniskt, inte kommersiellt** |
| `PENDING_VERIFICATION` | bedömd provisoriskt (ur sökutdrag/minne, US-pris som proxy, "villkorat") — ska verifieras |
| `ALTERNATIVE_LISTING_REQUIRED` | konceptet håller men den granskade listningen föll på material/ekonomi |

Tekniskt fel blir aldrig kommersiellt fel: en blockerad hämtning ger `BLOCKED_SOURCE`, aldrig FAIL.
Hyllan får `PASS` bara när `verified = true` (h-filerna); annars `PENDING_VERIFICATION`.

## 5. Hämtdisciplin (Temu)

Mätt 2026-09-04: `/se` ströps efter agenternas parallella burst i natt; USA-sidan
(`temu.com/g-<id>.html`, utan landsprefix) öppnade efter 6,5 h tystnad och ströps efter ~10 anrop på
5 min. Regler i `hamta-langsam.py`:

- **Aldrig parallellt.** En förfrågan i taget, `--paus 240` (ett anrop var fjärde minut).
- **Cache:** varje lyckat svar sparas i `raw/us/<id>.json` (+ `video/us/<id>.mp4`); ett id begärs
  aldrig om så länge en icke-blockerad rå-fil finns.
- **Ingen omförsöksloop** per anrop (`temu-ld.py --en-gang`); blockerat svar ⇒ vila 10 min, fyra i
  rad ⇒ 30 min. Aldrig avbrott.
- **Prioritet:** Tier A → "närmast A" → alternativa listningar (`alt/`) → Tier B → resten.
  Koncept med `concept_status = FAIL` får ingen budget.
- Kalibrering US → SE: SE-Temu-pris ≈ USD × 6,96–8,16 (IBC 108,51/15,60; motorhöljet 71,22/8,73);
  landad ≈ SE-Temu × 1,5. Ekonomi på US-pris märks `economics_source = "us-proxy"`.

Bakgrundsprocesser överlever inte mellan sessionens turer — kön måste köras i en aktiv tur eller
som egen rutin.

## 6. Datasetfälten (V2.1)

Per listning i `dataset.json` / `dataset.csv`: `concept_id, listing_id, concept_status, listing_status,
alternate_listing_count, material_verified, economics_verified, economics_source, source_blocked,
verification_timestamp, failure_is_structural, failure_is_listing_specific, gate_status{object, presence,
shelf, material, economics, variant, hook, audience}` — utöver V2-fälten (gates{}, tier, tier_agent,
tier_reason, temu_us{}, economics_us{} …).

Per koncept i `koncept.json`: `concept_id, name, kluster, object, listing_ids, listing_count,
alternate_listing_count, alt_listings[], tier, concept_status, status_reason, gates{}, shelf_verified,
listings_fetched, material_pass, economics_pass, best_listing_id, failure_is_structural,
failure_is_listing_specific, verification_timestamp, hook, structure_match`.

## 7. Två trattar (obligatoriska i rapporten)

**KONCEPT-TRATTEN:** listningar → koncept → objekt → presens → hyllkvalificerade (verifierad PASS) →
strukturkvalificerade → slutliga konceptöverlevare (status ≠ FAIL), med statusfördelning.

**LISTNINGS-TRATTEN:** kandidatkoncept → listningar i dem → listningar hämtade → material PASS →
ekonomi PASS → bästa listning vald (material + ekonomi PASS på samma listning).

Målet är inte en produkt. Målet är ett starkt PRODUKTKONCEPT parat med en kommersiellt användbar
LISTNING.

## 8. Körordning

```
python3 konsolidera.py        # klusterfiler → dataset.json (listningar, V2-tratt)
python3 hylla-tillamp.py      # hylla/h*.json → gates.shelf (verified)
python3 material-tillamp.py   # material/*.json → gates.material
python3 ekonomi.py            # US-pris → gates.economics_us
python3 slutdom.py            # huvudsessionens tier/tier_reason
python3 konsolidera.py && python3 koncept.py   # koncept.json + de två trattarna + V2.1-fälten
python3 hamta-langsam.py --visa      # kön (prioriterad, cachad)
python3 hamta-langsam.py --paus 240  # hämta (i en aktiv tur)
```
