# Sverige-viabilitet — ett extra bedömningslager (Axels beslut 2026-09-04)

Lagret läggs **ovanpå** vinnar-fingeravtrycket (`docs/temu-vinnar-dna.md` avsnitt 12) och
V2.1-pipelinen (`PIPELINE-V2.1.md`). Det ändrar inga gater och ingen ordning. Det svarar på en
fråga fingeravtrycket inte ställer: **hur stor är Sverige för just den här produkten?**

## Fälten (fylls i för varje kandidat, nuvarande och kommande)

| Fält | Vad | Regel |
|---|---|---|
| **Ägarpopulation** | ungefärligt antal svenska hushåll/personer som äger objektet och kan ha friktionen | källa när den finns (SCB, Trafikanalys, Naturvårdsverket, Jordbruksverket, branschorganisation); annars uppskattning **märkt "uppskattning"**. Aldrig en gissning utan märkning |
| **TAM-band** | `<25k` · `25k–75k` · `75k–200k` · `200k–500k` · `500k+` | hushåll, inte objekt (en ägare har ofta flera) |
| **Säsong** | månaderna friktionen finns och köpet sker | ur presens-gaten |
| **Kommersiella månader/år** | antal | < 3 = engångsfönster, 3–5 = säsongsprodukt, 6+ = halvårsprodukt, 12 = året runt |
| **Meta-igenkänning** | 1–3: känns objektet igen i flödet av rätt köpare inom en sekund? | 3 = omisskännligt (utombordare, husvagn, katt), 2 = igenkännbart för ägaren (hönsgård, jakttorn), 1 = kräver förklaring |
| **Skalningstak** | ungefärlig hållbar dagsbudget i kontot | heuristik kalibrerad på kontot: `<25k` ≤ 500 kr/dag · `25k–75k` ≤ 1 000 · `75k–200k` 1 000–2 000 · `200k–500k` 2 000–4 000 · `500k+` 4 000+. Motorhöljet (~300 000 båtar med utombordare) bar 2 000–6 000 kr/dag; klistermärkena (1,9 M småhus) skalade utan tak. Kortas av säsongslängden |
| **Sverige-klass** | **S** = stark skalningsmarknad · **A** = starkt test + rimlig skala · **B** = nisch men värd att testa · **C** = troligen för liten | se regeln nedan |

## Nisch är inte ett nej

En nischprodukt kan vara utmärkt. `B` blir aldrig `C` bara för att TAM är litet om alla fem
håller: (1) ägarigenkänningen är mycket stark, (2) problemet finns redan, (3) creativen
självselekterar publiken, (4) ekonomin är stark, (5) konkurrensen är låg — **och** publiken
räcker för lönsam Meta-leverans (tumregel: ≥ 25 000 hushåll för ett 500–1 000 kr/dag-test).
`C` sätts bara när publiken är för liten för att Meta ska hitta den till rimlig CPM, eller när
säsongsfönstret är kortare än testet.

## Konkurrens — "inga aktiva annonser" är inte automatiskt positivt

| Klass | Betyder | Krav |
|---|---|---|
| **WHITE SPACE** | ingen annonserar, men efterfrågan är bevisad oberoende av annonser | minst ett av: fackhandel/kedja säljer formen med synligt pris, sökvolym/PriceRunner-träffar, tidigare annonsör som körde en hel säsong, kontots egen vinnare i samma struktur |
| **UNKNOWN** | vi kan inte avgöra om någon lyckats annonsera den | Ad Library oläst, eller läst utan svar på varför tomt |
| **WARNING** | tomheten kan rimligen bero på svag ekonomi, svag creative-potential eller för liten efterfrågan | produkten har funnits länge på Temu/Amazon utan att någon svensk aktör tagit den; eller formen kräver förklaring; eller prisgolvet ligger nära 300 kr |

Bevisad efterfrågan med aktiva annonsörer skrivs som **KONKURRENS (n annonsörer, sedan datum)** —
det är varken white space eller varning, det är ett annat spel (strandtofflornas läge).

## Tre efterfrågor som aldrig får blandas ihop

| | Mäts med | Säger | Säger INTE |
|---|---|---|---|
| **TEMU-LISTNINGSEFTERFRÅGAN** | recensioner, betyg, "sold"-tal på listningen | att listningen säljer globalt | något om Sverige eller om Meta. 2 309 recensioner (kedjeslipen) var en bevisad förlorare |
| **UNDERLIGGANDE MARKNADSEFTERFRÅGAN** | ägarpopulation × friktionsandel; fackhandelns sortiment och priser; PriceRunner-träffar | att svenskar köper lösningen på problemet | att de köper *vår* form eller via Meta |
| **META-ANNONSPOTENTIAL** | igenkänning × presens × material × prisutrymme (fingeravtrycket) | att en annons kan hitta ägaren och sälja utan att skapa behov | något om hur många ägare som finns |

Ett lågt Temu-tal fäller aldrig en produkt. Ett högt Temu-tal räddar aldrig en produkt.

## Leveransformat per produkt (från och med batch 1)

```
PRODUKT · TEMU-LÄNK · VINNAR-DNA · SVERIGE-VIABILITET S/A/B/C · UPPSKATTAD SVENSK TAM (band + tal + källa/uppskattning)
· SÄSONGSFÖNSTER (månader, antal) · KONKURRENS / WHITE SPACE (klass + belägg)
· VARFÖR DEN KAN FUNKA · VARFÖR DEN KAN FALLA · STATUS: TEST / VERIFY / WATCH
```

Batchdisciplin: varje batch letar tillräckligt många rålistningar för ~20 kvalificerade koncept
och levererar bara de 5–10 bästa. Strukturell kvalitet före antal. Sedan stopp tills nästa
batch begärs.
