# Majavakauppa FI — status

Butik: **Majavakauppa** (`q0uthu-xq.myshopify.com`), plan **trial**, grundvaluta SEK.
Källa: Bäverbutiken (SE). Framework: `market-expansion/PLAYBOOK.md`. Körd 2026-08-12.

> Shopify: *"Plan: trial — you'll need to upgrade before you can start selling and unlock full features"*

## ✅ Klart och verifierat mot butiken

| Fas | Vad | Verifiering |
|---|---|---|
| 0+2 | Parametrar + 10 batchar à 14 | 134 produkter |
| 3 | 134 produkter översatta till finska (10 agenter) | 0 saknade, 0 svenska ord i titlar, 93 `Default Title` intakta |
| 3 | catalog.fi.json | 134 produkter, 282 varianter, 573 bilder |
| 4 | 8 kollektioner + 134 produkter pushade | 134/134 OK, 0 fel över 5 agenter |
| 4 | Aktivering + kanalpublicering | 134 ACTIVE / 0 DRAFT, **142/142 publicerade**, stickprov `true` |
| 4 | Kollektionsbilder | 8/8 med alt-text |
| 4 | 6 sidor + 2 menyer | huvudmeny 8 poster, sidfot 7 |
| 5 | Marknad **Suomi** (EUR, fast kurs, priser inkl. moms) | 2 × 14,95 → **29,90 EUR** för Helsingforskund |
| 7 | Tema (utkast `207980495197`, live-temat Horizon orört) | se nedan |
| 8 | Judge.me-CSV | 219 recensioner, betyg 1/9/29/180, 88 finska namn |
| — | Logga svart/vit/favicon → Files | `majavakauppa-*` |
| — | **descriptionHtml teckenexakt mot katalogen** | 134/134, 1 stavfel hittat och rättat, 0 kvar |

**Prisregel (GRANSKAS AV AXEL):** EUR = SEK / 11,5 → närmaste hela euro − 0,05.
Fyra produkter har Axels egna priser som override i `build-catalog.mjs`
(29,95 / 34,95 / 59,95 / 64,95). **Övriga 130 ligger 15–17 % under den nivån** —
se avsnittet nedan.

### Tema — slutgrind (förhandsvisning, 140 kB HTML)

- Svenska ord: **0**
- Finska ankare: OSTA NYT, TOSSUT, Ostoskori, SUOSITUIMMAT, MAJAVAKERHO, PALAUTUSOIKEUS ✓
- 28 riktiga bilder, logga renderad, EUR-priser
- Locale: 551 nycklar i **en.default.json + fi.json + sv.json** (primärspråket är `en`,
  så temat läser en.default — därför alla tre)
- 14 mallar finskifierade inkl. de 4 specialmallarna; Judge.me (2 badges, 3 widgets)
  och Kaching (5 block) byte-identiska
- Banners: **"14 PÄIVÄN PALAUTUSOIKEUS"** + **"VIRHEVASTUU KULUTTAJANSUOJALAIN MUKAAN"**.
  Ingen fri frakt, ingen Klarna, inga leveranstider — allt osant är utelämnat från start.

## 🔴 Frakt — samma fälla som UK och DK, INTE löst

`draftOrderCalculate` mot Mannerheimintie 1, Helsinki: **"Standard 299 SEK"** (~27 €)
på en order om 29,90 €. Måste åtgärdas innan lansering.

**Beslut som är Axels:** förslag fri frakt över 49 €, annars 5,90 €.
Bannern måste stämma med beslutet (Fas 9).

## 🟠 Prissättning — 130 produkter under Axels nivå

Axels fyra vinnare är satta enligt hans marginalunderlag (kurs 10,9635 + uppåtrundning).
Byggregeln för övriga 130 använder SEK/11,5 med nedåtrundning → **15–17 % lägre**.
På produkter med sämre inköpspris kan det vara skillnaden mellan lönsam och förlust.
Beslut: behåll, eller räkna om hela katalogen enligt Axels formel.

## Kvar för Axel

1. **Frakt** — besluta tröskel, sätt upp FI-zonen
2. **Uppgradera från trial** — kan inte sälja annars
3. **Publicera temat** — Themes → utkastet → Publish
4. **Sätt primärspråk till `fi`** (Settings → Languages) — API:t kan inte
5. **Döp om butiken** från "My Store" (brandnamnet Majavakauppa är mitt förslag, inte godkänt)
6. **Judge.me**: importera `fi/output/judgeme-reviews-majavakauppa-fi.csv` + byt widgetspråk
7. **Kaching-bundles** — se `market-expansion/BUNDLE-PLAN.md`
8. **Tietosuojaseloste** — sidfotens `/policies/privacy-policy` är en död länk tills den fylls i
9. Betalning, moms (OSS), domän
10. **Juridisk granskning:** 134 flaggor i build-report + 31 AXEL-flaggor i sidorna
    + `asiakaspalvelu@majavakauppa.fi` måste skapas

## ✅ Variantväljare tillagd 2026-08-13 (Axels rapport: "inga varianter syns")

Rotorsak: specialmallarna `claudeprodukter/strandtofflor/snabbtrratter` saknar
`variant_picker`-block i källbutiken — Kaching Bundles-blocket är variantväljaren där,
och utan konfigurerade deals renderar det ingenting (PLAYBOOK fälla 21).
17 produkter/165 varianter påverkades trots korrekt produktdata (verifierad 0 avvikelser).

Åtgärd: `variant_picker` (knappar, etiketter på) inlagt före kvantitetsväljaren i alla
tre mallarna, upsertat till utkastet `207980495197`, 0 fel. Serversidigt verifierat i
förhandsvisningen: sandalerna visar Koko 36–47 + Väri (30 knappar), sätesöverdraget
visar 4 färger, köpknappen kvar. **OBS:** samma fel finns i LIVE-temana i DK/UK/NO —
API:t kan inte röra dem; Axel fixar i temaredigeraren (lägg till "Variant picker"-block
i de tre mallarna) eller konfigurerar Kaching-deals enligt BUNDLE-PLAN.md. När Kaching-
deals sedan läggs in i FI kan det bli dubbel väljare — ta då bort blocket igen.

## Noteringar

- **16 produkter saknar kategorikollektion** (118 av 134 fördelade). Etusivu har bara 2 produkter.
- **312 inline-bilder pekar på `img.kwcdn.com`** (Temus CDN) i 117 av 134 produkter — samma
  problem i alla fyra marknaderna. Se PLAYBOOK fälla 14.
- Källdatafel: anti-slip-tejpen anger 5 m / 6 m / 10 m på tre olika ställen, och dess
  optionsnamn är en hel produkttitel som syns som etikett i butiken.
- 4 transkriberingsfel uppstod under pushen; 3 hittade agenterna själva, 1 fångades av
  efterkontrollen. Se PLAYBOOK fällorna 16–18.
- Gammal engelsk sida `contact` (724472168797) ligger kvar oanvänd, kan raderas.
- ID:n: location `126371955037`, publication `382894899549`, marknad `120475451741`,
  temautkast `207980495197`. Kollektioner: Etusivu `720947151197`,
  kategorier `720966877533`–`720967074141`.
