# 2. Inventering av befintlig butik — Bäverbutiken.se

Läs-inventering via Shopify Admin API, 2026-08-06. Inga ändringar gjorda.

## Grunddata

| Fält | Värde |
|------|-------|
| Butiksnamn | Bäverbutiken.se |
| Domän | baverbutiken.se |
| Plan | Shopify |
| Valuta | SEK |
| Land / tidszon | Sverige / CEST |
| Butiksmail | kundsupport@baverbutiken.se |
| Lagerplats | "sjöhed 160" (1 st) |
| Marknader | Endast **Sverige** (primär, aktiv) |
| Fraktprofiler | 1 st: "Allmän profil" (default) |

## Produktkatalog

**138 produkter totalt:** 130 ACTIVE, 5 DRAFT, 1 ARCHIVED, 2 UNLISTED.

- **Prisspann:** 49–3 349 kr. Tyngdpunkt ca 150–700 kr.
- **SKU-struktur:** i princip alla `TEMU-<id>` → sortimentet är Temu-sourcat (dropshipping).
  SKU:erna kodar leverantörens artikel-id, inte egen logik.
- **Vendors (4 st):** `Bäverbutiken` (huvuddelen), plus legacy: `Bäverkoppling.se` (4),
  `superkoppling.se` (1), `matstrumpor` (3, drafts inkl. dubblerat presentkort).
- **Varianter:** mest 1-variantsprodukter. Undantag med många varianter: Strandtofflor (36),
  Herrsandaler (18), Vattenskor (18), Sneakers (18), Marin Motorhölje (30).
- **Specialprodukter:** "Garanti för säker frakt" (35 kr, UNLISTED, fraktskydds-upsell),
  "Blanda & Spara" (Kaching Bundles-app, UNLISTED), Presentkort (draft, duplicerat).
- **Copy-stil:** svensk, problem→lösning-struktur, två generationer (äldre saklig + nyare
  med punchigare hooks i stil med annonspipelinen i det här repot).

## Kollektioner (8 st, alla manuella, sorterade på bästsäljare)

| Kollektion | Antal produkter |
|------------|-----------------|
| Startsida (frontpage) | 2 |
| Trädgård & Utomhus | 20 |
| Bil, Verktyg & Garage | 25 |
| Camping & Friluft | 28 |
| Lantbruk & Djur | 6 |
| Båt & Marin | 11 |
| Tillbehör & Övrigt | 10 |
| Fordon & Belysning | 20 |

Ingen kollektion har bild. Summan (122) < aktiva produkter (130) → vissa produkter saknar
troligen kollektion; kollektionsbilder och beskrivningar saknas genomgående.

## Navigation

- **Huvudmeny:** Startsida · Bäverkoppling (legacyprodukt) · Bävertratt (legacyprodukt) ·
  Alla produkter · Kontakta Oss — **kategorikollektionerna saknas i menyn.**
- **Sidfot:** kundsupport@**baverkoppling**.se (fel domän) · Kontakta Oss · Användarvillkor ·
  Integritetspolicy · Fraktpolicy · Retur- och återbetalningspolicy

## Sidor (9 st)

Publicerade: Kontakta, Fraktpolicy, Retur- och återbetalningspolicy, Integritetspolicy,
Användarvillkor, "Motorhölje – Lagerrensning" (listicle-landningssida).
Opublicerade utkast: Listicle Page, Advertorial Page, Landing Page (kampanjmallar).
**Saknas: Om oss och FAQ.**

## Policyer (Shopify-genererade, svenska)

- PRIVACY_POLICY (~19 000 tecken), REFUND_POLICY (~3 400), TERMS_OF_SERVICE (~27 900).
- Innehåller ej ersatta mallvariabler (`{{ last_updated }}`, `{{ shop_name }}`) →
  ser ofärdiga ut även för nuvarande marknad. `[JURIDISK GRANSKNING]` vid återanvändning.

## Tema

| Tema | Roll |
|------|------|
| **theme-export-trevligtradgard-se-wetransfer-the** | **LIVE (MAIN)** |
| Horizon | Opublicerat |
| shrine-2 (×2) | Opublicerade (Shrine = konverteringstema, betalt) |

Live-temat är en export från **trevligtradgard.se** (WeTransfer-överförd) — dvs. butiken
är redan delvis byggd på en annan butiks tema. Rättighetsläget för temat och ev. medföljande
innehåll behöver klargöras innan det återanvänds för en ny marknad.

## Observerade brister (åtgärdslista oavsett ny marknad)

1. Sidfotsmail pekar på fel domän (baverkoppling.se).
2. Huvudmenyn saknar kategorierna och innehåller två legacyprodukter.
3. Negativt lagersaldo på Cargoshorts (−4, −1) → översålda varianter; lagerspårning
   mot Temu-sortiment är inte meningsfull som den används nu.
4. Många ACTIVE produkter (hela vågen från 2026-08-01, 14 st) har 0 i lager men säljs.
5. TEMU-SKU:er exponerar sourcing i ordermail/fakturor — kosmetiskt/strategiskt problem.
6. Mallvariabler oersatta i policyer; returpolicy och fraktpolicy finns både som sidor
   och som Shopify-policyer → risk för motstridiga versioner.
7. Om oss- och FAQ-sida saknas helt.
8. Dubblerat presentkort i draft; arkiverad + draft-produkter från nedlagda brands ligger kvar.
9. Kollektioner saknar bilder/beskrivningar (påverkar SEO och kategorisidornas utseende).
10. En variant heter "Rött" där övriga är "Blå/Grön/Svart" (inkonsekvent böjning) —
    symptom på att variantnamn behöver städas generellt.
