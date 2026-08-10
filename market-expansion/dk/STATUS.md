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

## ✅ Fas 7 komplett — tema (utkast 204226199897, live-temat orört)

- Locale: 551 nycklar → danska i sv.json + da.json + en.default.json (temat läser sv.json
  eftersom primärspråket är sv — UK-fällan stängd by design)
- index.json: hero "TØFLER – HEAVY DUTY"/"KØB NU", 7 danska kategorirutor, Bestsellere →
  frontpage, döda svenska produktlänkar rensade
- settings_data.json: vit logga i header, svart i checkout, favicon, sanna banners
  ("14 DAGES FORTRYDELSESRET" + "2 ÅRS REKLAMATIONSRET"), STONEBITE-sidfot
- 14 mallar daniserade inkl. alla 4 specialmallar; Judge.me/Kaching-block byte-identiska
- Fas 9-rättelse: "fri fragt i Danmark" (ärvt ur svenska mallen) borttaget ur 5 produktmallar
  → "Levering: 5-10 hverdage"
- Hero-bilden kopierad till butikens Files via fileCreate

### Slutgrind (förhandsvisning, 141 kB HTML)

- Svenska ord: **0** i butiksinnehållet (enda träffen ligger i Judge.me-appens widgetkonfig)
- Danska ankare: KØB NU, TØFLER, Indkøbskurv, Bestsellere, Bæverbutikken, fortrydelsesret ✓
- 26 riktiga produktbilder, logga renderad, DKK-priser, 0 grå platshållare
- Exempelprodukten "Sladdhållare" (0 kr) borttagen ur Forside-kollektionen

## ✅ FRAKT — löst 2026-08-09 (via API, deliveryProfileUpdate)

Egen zon **"Danmark"** i Allmän profil (DK borttaget ur EU-zonen):
- **Fri fragt** vid ordervärde ≥ 400 SEK (villkoret utvärderas i SEK till VERKLIG kurs,
  inte marknadens 1:1 — därför 400, inte 299: ger kursbuffert så att löftet
  "fri fragt over 299 kr." aldrig kan brytas; idag blir frakten fri från ~273 DKK)
- **Standardlevering** 60 SEK ≈ 41 DKK under tröskeln

Grind verifierad mot Rådhuspladsen: 198 DKK-order → 40,92 DKK frakt; 297 DKK-order → 0 kr.
Banner uppdaterad i temautkastet: "FRI FRAGT / Ved køb over 299 kr." — nu SANN.
⚠️ Kvartalskoll: om SEK/DKK-kursen rör sig ±10 % bör 400-gränsen ses över.
Tröskel/pris valda enligt tidigare förslag som Axel inte invänt mot — säg till för justering.

## Kvar

- Fas 10 (Axel), i prioritetsordning:
  1. **Publicera temat** — Themes → utkastet → Publish
  3. **Judge.me**: importera dk/output/judgeme-reviews-baeverbutikken-dk.csv + byt appens
     widgetspråk till danska (widgetkonfigen är på svenska: "Köp nu", "Visningsnamn")
  4. Kaching-bundles
  5. Arkivera exempelprodukten "Sladdhållare" (ACTIVE, 0 kr — borttagen ur Forside men köpbar via URL)
  6. Primärspråk → danska om möjligt (Settings → Languages), betalning, moms (OSS), domän
  7. Juridisk granskning: 138 flaggor i build-report.md + 17 AXEL-flaggor i sidorna
     + e-postadressen kundeservice@baeverbutiken.dk måste skapas/verifieras

## Manuellt satta priser (2026-08-09, Axels beslut — annonsmatchning)

| Produkt | Före | Efter |
|---|---|---|
| Skulderrem til Trimmer | 399 / ~~449~~ | **429 / ~~489~~** |
| Sædebetræk til Havetraktor (4 var.) | 429 / ~~529~~ | **449 / ~~559~~** |
| Marint Motorbetræk 420D (30 var.) | 199 / ~~239~~ | **259 / ~~329~~** |
| Strandsandaler til Herre (36 var.) | 229 | **289** (inget jämförpris) |

Alla verifierade i mutationssvaren, 0 fel. OBS: annonsen för skulderremmen lovar
"fri fragt i dag" — osant tills DK-fraktzonen finns (Fas 10 punkt 1).

## Noteringar

- Butikens gamla exempelprodukt ("Sladdhållare…", 0 kr, ACTIVE) bör arkiveras av Axel.
- Källdatan har en känd inkonsekvens: anti-slip-tejpen anger 5 m/6 m/10 m på olika ställen
  (fanns redan i svenska butiken, följer med alla marknader).
- ID:n: location `111991947609`, Webbshop-publication `326577619289`, marknad `113845207385`,
  temautkast `204226199897`. Kollektioner: Forside `683019764057`, kategorier `710087803225`–`710087999833`.
