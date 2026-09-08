# Datavägar när temu.com är blockerat (mätt 2026-09-04 09:15–09:40 UTC)

Containerns IP är strypt mot **temu.com HTML** — både `/se/g-<id>.html` och USA-vägen
`temu.com/g-<id>.html` svarar med tomt skal (`blocked: true`, bara `<title>Temu</title>`).
`temu-ld.py` ger därför inget. **Det är ett tekniskt fel, aldrig ett kommersiellt:**
status blir `BLOCKED_SOURCE`, aldrig `FAIL` (V2.1 statusmodell).

Det här fungerar ändå. Använd i den här ordningen.

## 1. HITTA listningar — WebSearch (Google)

```
WebSearch: site:temu.com <engelska produktord>
```
Ger goods-id (siffrorna efter `g-` i URL:en) + engelsk titel. Titeln bär ofta hela speccen:
material (600D/Oxford/420D), mått, "cover only", antal i pack, årstid. Kör 8–15 fraser per kluster.
Blanda [OBJEKT] + cover / protector / holder / mount / bracket / organizer / storage /
winter / waterproof / anti-slip / heavy duty.

## 2. PRIS, BETYG, RECENSIONER — Seznam (fungerar, Google visar inte pris)

```bash
curl -sS -A "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" \
  "https://search.seznam.cz/?q=site%3Atemu.com+<sokord+med+plus>" -o s.html
grep -oE 'g-60[0-9]{13}' s.html | sort -u
```
eller `WebFetch` på samma URL med prompten "list every temu.com product URL, goods id, title,
and any price / rating / review count / sold number in the snippet".

Utdragen ger **pris i USD**, **betyg** (t.ex. "4.8 / 96%"), **antal recensioner** ("99+") och
lagerstatus. Skriv av EXAKT och märk `source: "seznam-snippet"`. Hitta aldrig på ett tal.
Verifierat: 601099539458313 = $23, 4.8/96% (99+); 601104628431264 = $44, 4.6/92%.

## 2b. PRIS — Temus EGNA sökresultatsidor via WebFetch (mätt 2026-09-04 10:0x UTC)

Produktsidorna är blockerade, men **sökresultatsidorna är serverrenderade och visar pris.**
Två former, båda via `WebFetch` (containerns curl får ett skal utan priser — använd WebFetch):

```
WebFetch https://www.temu.com/search_result.html?search_key=<sokord+med+%20>
WebFetch https://www.temu.com/<slug>-<id>-s.html        (t.ex. 8ft-firewood-rack-cover-5040226697568-s.html)
```
Prompt: "list every product with its exact full title and price in USD".

Ger **titel + pris i USD + rabattsats**, 14–36 rader per sida. Ger **inte** goods_id — priset går
alltså inte att koppla till en specifik listning, så märk `price_source: "temu-sok-sida"` och
konfidens MEDIUM. `-s.html`-sidorna finns bara förgenererade (påhittad slug ⇒ 404); hitta dem via
WebSearch. `-s.html`-sidans JSON-LD innehåller dessutom ibland en **VideoObject med
`contentURL` till leverantörsvideon** på `goods-vod.kwcdn.com` — enda vägen till gate 5-material
just nu.

⚠️ **Stryps efter ~2 lyckade anrop.** Sedan svarar sidan med bara ordet "Temu". Vila och kom
tillbaka; kör aldrig flera parallellt. Mätt: 2 lyckade av 8 försök på 12 minuter.

⚠️ Seznam (avsnitt 2) hade **noll** täckning på cover-only-listningar i vedkategorin — inte ens
originalet vars pris vi känner. Är Seznam tom för ett kluster betyder det inte att priset är
ohämtbart; testa den här vägen innan du skriver UNKNOWN.

## 3. SVENSK TITEL — WebFetch på temu.com

`WebFetch https://www.temu.com/se/g-<id>.html` ger `<title>` (svensk produkttitel) även när
sidan i övrigt är blockerad. Inget pris, inga bilder. Använd bara för att bekräfta att
listningen finns på SE-sajten och vad den heter på svenska.

## 4. BILDER — `img.kwcdn.com` är ÖPPET

CDN:et svarar 200 (verifierat 1200×1200 JPEG). Men **URL:erna går bara att få ur listningens
JSON-LD**, som är blockerad. Alltså: bilder finns bara för de tio id:n som redan ligger i
`material/us-raw/`. Bing/Google bildsök ger Temu-loggor, inte produktheros — testat, fungerar inte.

**Konsekvens: GATE 4 (MATERIAL) går INTE att verifiera på nya listningar just nu.**
Sätt `material: BLOCKED_SOURCE` och skriv vad titeln antyder — aldrig FAIL, aldrig PASS.

## 5. SVENSKA HYLLAN (gate 3) — fungerar fullt ut

```
WebSearch: <svenskt produktord> biltema / jula / clas ohlson / rusta
WebFetch:  https://www.pricerunner.se/search?q=<svenskt+ord>
```
Sök på **ägarens svenska ord**, inte på en översättning av Temu-titeln.
Sidorna svarar ofta 403 — sökutdraget räcker, märk "ur sökutdrag".
Skilj SAMMA KATEGORI (ok) från SAMMA FORM/SPEC (fäller). Notera märkesankare + pris + URL.

## 6. EKONOMIN — kalibreringen är mätt, använd den

```
SE-Temu-pris  ≈ USD × 6,96–8,16      (IBC 108,51/15,60 ; motorhölje 71,22/8,73)
landad kostnad ≈ SE-Temu-pris × 1,5
krav:  svenskt pris ≥ 2,4 × landad   OCH  ≥ 300 kr   (> 500 kr har aldrig förlorat)
       BE-CPA = pris − landad ≥ 190 kr
stopp: landad > 420 kr  (då kräver 2,4× > 1 000 kr = över taket)
```
Räkna alltid intervallet (låg 6,96 / hög 8,16) och redovisa båda ändarna.
Bäverbutiken säljer UTAN moms — dra aldrig av 25 %.

## 7. Statusar (V2.1 — oförändrade)

`PASS` · `FAIL` · `UNKNOWN` · `BLOCKED_SOURCE` (källan nere) ·
`PENDING_VERIFICATION` (provisorisk, t.ex. US-pris som proxy) · `ALTERNATIVE_LISTING_REQUIRED`
(konceptet håller, listningen föll på material/ekonomi).

**En svag listning dödar aldrig ett starkt koncept.** Koncept blir FAIL bara om gate 1–3 eller
strukturen faller, om ≥ 2 listningar faller på samma sak, eller om felet är inbyggt i produkten.
