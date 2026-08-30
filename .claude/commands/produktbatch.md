# /produktbatch <offertlänk> <batchnummer> — hela produktbatchflödet, dialed in 2026-08-29

Kör HELA flödet från CWD-offert till färdiga produktsidor i alla 5 Bäver-butiker.
Argument: länk till offert-spreadsheetet (Google Sheets) + batchnummer (t.ex. `6.1`).
Kör klart utan att invänta godkännande mellan faser. Svara Axel kort, på svenska.

## Fas 0 — förutsättningar
1. Verifiera butiksåtkomst: `temu/api.mjs` med miljönycklarna (`SHOPIFY_*_<SE|NO|DK|FI|UK>`).
   `verifiera()` per butik — fel valuta = STOPP.
2. Läs `temu/UTLANDS-LANSERING.md` (prisregler, butiksregister) och `CLAUDE.md`:s
   produktbatch- och beskrivningsstruktur-sektioner.

## Fas 1 — offert + skördeprompt FÖRST (Axels regel 2026-08-29)
1. Läs offertarket (Drive-connectorn). Extrahera per rad: Temu-URL, kostnader per land,
   varianter, notes. Fånga räkneord (antal delar, mått) — de är LÅSTA mot offerten.
2. **Leverera Cowork-skördeprompten INNAN uppladdningen börjar**: komplett klistra-in-bar
   med git-instruktioner + `node temu-bilder.mjs '<ren-URL>' <mappnamn>` för VARJE produkt
   (strippa query-parametrarna ur URL:erna). Committa som
   `temu/kaching-cli/BILDSKORD-BATCH<N>.md` och skicka filen till Axel.
   Zip-fallback om git strular. Produkter som inte skapas (väntar på CWD) utelämnas — säg det.

## Fas 2 — inventering + priser
1. Inventera ALLA 5 butiker per SKU-mönster (`sku:TEMU-<goodsid>*`) INNAN något skapas —
   dubbletter (DK 2026-08-18) och luckor (NO 2026-08-29) har båda hänt.
2. Prismatris: SE/DK/FI = 3 × (landad kostnad + 2,9 €), NO/UK = 3 × landad kostnad.
   Jämförpris = pris × 1,3. Lokala prispunkter: heltal 9-slut (SEK/NOK/DKK), X,90 (EUR),
   X.99 (GBP). Landad kostnad ur offertens landskolumner — konvertera med den låsta FX-tabellen
   i utrullningsskripten. Priset dokumenteras i UTLANDS-LANSERING.md:s produkttabell.

## Fas 3 — copy
1. Svensk mastercopy skrivs av HUVUDSESSIONEN i `temu/utrullning/texter<N>.mjs`
   (T-objekt: titel, problemH/P, losningH/P, bullets, option/varden, alt). Copy-reglerna
   gäller: utfall i fetstil först, och?-testet, inga förbjudna ord, "smidig leverans",
   räkneord exakt mot offerten.
2. NO/DA/FI/EN via sonnet-subagenter med `docs/copy-regler.md` + föregående batchs
   texter-filer som stilfacit. Garantiblocket = exakt GARANTI4-strängen per språk.

## Fas 4 — skapa i 5 butiker
Följ kor5-mönstret (`temu/utrullning/kor5.mjs` är facit): productCreate med
`templateSuffix: 'claudeprodukter'`, vendor per butik, status ACTIVE, kategori-GID
(taxonomin är global), productOptions vid varianter; productVariantsBulkCreate
REMOVE_STANDALONE_VARIANT med `taxable: false`, `inventoryPolicy: CONTINUE`,
`tracked: false`; publishablePublish på ALLA kanaler. Huvudbilder från offerten/Drive.
Slutgranska skarpt per butik: varianter, priser, optionsspråk, bilder-200, inga rester.

## Fas 5 — Notion
Ett item per produkt (även VÄNTA-produkter, märkta i namnet) i
**Product test center SE BÄVER** (data source `collection://d80270ab-908c-839b-9dcc-8721c5f29570`):
- Namn: `<batchnummer> <Produktnamn>` · Status: `Products` · **Typ: `Video - Pending Approval`**
  (annars filtreras kortet bort ur Pending Approval-vyn!)
- Landing page: bäverbutiken-länken · Sidinnehåll: länken till offert-spreadsheetet.

## Fas 6 — bildpaketet (när Axel levererat skörden)
1. Packa upp, bygg kontaktark (bilder + videorutor), granska VARJE produkt.
2. **Variantfacit mot butiken före alla bildval** — fel färg/antal på bild = förbjuden
   (46/60-delar-regeln). Kit-bilder med batterier används inte för batterilösa produkter.
3. Utländsk text: KIE (nano-banana-edit, `KIE_API_KEY`) får BARA ta bort text —
   **svensk text ritas alltid med sharp** (nano stavar inte svenska). Granska varje
   resultat visuellt; underkänn hallucinationer.
4. GIF:ar ur skördevideor: ffmpeg palettegen/paletteuse, 400 px, 8–12 fps, < 4 MB,
   croppa bort inbrända captions, välj textfria fönster via sekundark.
5. Gallerier: variation (rena foton, miljö, detaljer, försvenskade infografiker,
   storleksguide, video). Trimmade videor i galleriet bara om ≥8 s rent segment.
6. Beskrivningar enligt strukturen: **problem → GIF → lösning → GIF/bild →
   funktioner → bild → garanti** (bilder ersätter GIF där video saknas).
7. Slutgranskning skarpt: varje URL i beskrivningen svarar 200, alla media READY,
   rapport med samtliga produktlänkar.

## Definition of done
- [ ] Skördeprompten levererad FÖRST, committad i repot
- [ ] Alla 5 butiker inventerade per SKU före skapande — och EFTER (inga luckor/dubbletter)
- [ ] Priser enligt prisreglerna, dokumenterade i UTLANDS-LANSERING.md
- [ ] Copy: mastercopy + 4 språk, räkneord mot offert, korrläst
- [ ] Produkter i alla 5 butiker: mall, moms av, kategori, alla kanaler, slutgranskade
- [ ] Notion: item per produkt med batchnummer, Typ, Landing page + quotes-länk
- [ ] Bildpaketet (efter skörd): KIE/sharp-metoden, GIF:ar, gallerier, beskrivningsstruktur
- [ ] Allt committat + pushat (texter, skript, dokumentation, färdiga bilder)
