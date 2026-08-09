# Bæverbutikken DK — status

Butik: **bæverbutiken.dk** (`v0xqtk-tx.myshopify.com`), plan Basic, grundvaluta SEK.
Källa: Bäverbutiken (SE). Framework: `market-expansion/PLAYBOOK.md`. Körning startad 2026-08-09.

## ✅ Klart (verifierat mot butiken)

| Fas | Vad | Verifiering |
|---|---|---|
| 0+2 | Parametrar + 10 batchar à 14 | make-batches: 134 produkter |
| 3 | 134 produkter översatta till danska (10 agenter) | katalog: 0 saknade, 0 svenska tecken, 0 trasiga sentineler |
| 3 | catalog.dk.json byggd | 134 produkter, 282 varianter, 573 bilder |
| 4.1 | 8 kollektioner ("Forside" + 7 danska) | collectionCreate 0 fel |
| 4.2 | 134 produkter pushade via productSet | loggar: 134/134 OK, 0 fel; CONTINUE + templateSuffix INLINE |
| 5 | Marknad Danmark: DKK, fast kurs 1,0, avrundning av, priser inkl. moms | marketUpdate OK (unified markets-modellen) |
| — | Logga: svart + vit + plain + favicon (`BÆVERBUTIKKEN` + rött `.DK`) | dk/output/logo/ |
| — | 6 danska sidor skrivna (købeloven, 14 dages fortrydelsesret, 2 års reklamationsret, ODR) | 17 AXEL-flaggor för uppgifter som måste fyllas i |
| 8 | Judge.me-CSV: 219 danska recensioner | alla handles i katalogen, betygsfördelning intakt |

**Prisregel (GRANSKAS AV AXEL):** DKK = SEK × 0,65 → närmaste …9 uppåt.
Exempel: 350 SEK → 229 DKK, 199 → 139, 649 → 429. Motiv: 1 DKK ≈ 1,55 SEK; Norges 1:1
hade gjort sortimentet ~55 % dyrare i Danmark.

## ✅ Fas 4 komplett (verifierat)

- 134/134 aktiverade (ACTIVE), 142/142 kanalpublicerade (produkter + kollektioner),
  8/8 kollektionsbilder med alt-text, stickprov `publishedOnPublication: true`
- 6 sidor + 2 menyer live (huvudmeny 8 poster, sidfot 7)

## 🔄 Pågår (tema-agenter)

- Locale-filer → danska (sv.json + da.json + en.default.json)
- index.json + settings_data.json (danska kollektionsrutor, logga, enbart sanna banners)
- Övriga mallar inkl. de 4 specialmallarna, Judge.me/Kaching-block bevarade

## 🔴 FRAKT — samma fälla som UK, ännu inte löst

`draftOrderCalculate` mot Rådhuspladsen 1, København: frakt **"Standard" 299 SEK** ur den
ärvda internationella zonen. Måste åtgärdas innan lansering.

**Beslut som är Axels:** fri frakt-tröskel (förslag: fri över 299 DKK, annars 39 DKK)
eller enbart fast pris. Temats banner måste stämma med beslutet (Fas 9).

## Kvar

- Fas 7: tema — utkast `theme-export-baverbutiken-se-...` id `204226199897` (opublicerat, korrekt).
  Startsida, settings, locale-filer (sv.json + da.json + en.default.json — primärspråket är `sv`!),
  mallar med Judge.me/Kaching-block bevarade, temabilder via fileCreate, logga till Files.
- Fas 9: sanningskontroll av banners (fri frakt/Klarna) mot faktisk konfiguration.
- Fas 10 (Axel): publicera tema, importera Judge.me-CSV, Kaching-bundles, frakt, betalning,
  moms (OSS), domänkoppling, primärspråk → danska om möjligt, juridisk granskning av
  build-report-flaggorna (134 st) + 17 AXEL-flaggor i sidorna.

## Noteringar

- Butikens gamla exempelprodukt ("Sladdhållare…", 0 kr, ACTIVE) bör arkiveras av Axel.
- Källdatan har en känd inkonsekvens: anti-slip-tejpen anger 5 m/6 m/10 m på olika ställen
  (fanns redan i svenska butiken, följer med alla marknader).
- ID:n: location `111991947609`, Webbshop-publication `326577619289`, marknad `113845207385`,
  temautkast `204226199897`. Kollektioner: Forside `683019764057`, kategorier `710087803225`–`710087999833`.
