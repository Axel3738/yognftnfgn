# /produktbatch <offertlänk> <batchnummer> — hela produktbatchflödet, dialed in 2026-08-29

Kör HELA flödet från CWD-offert till färdiga produktsidor i **Sverige och Norge**.
**Axels beslut 2026-09-07: nya produkter går INTE till DK/FI/UK.** Nämner texten
nedan fem butiker är det historik — läs det som SE + NO.
Argument: länk till offert-spreadsheetet (Google Sheets) + batchnummer (t.ex. `6.1`).
Kör klart utan att invänta godkännande mellan faser. Svara Axel kort, på svenska.

## Fas 0 — förutsättningar
1. Verifiera butiksåtkomst: `temu/api.mjs` med miljönycklarna (`SHOPIFY_*_<SE|NO>`).
   `verifiera()` per butik — fel valuta = STOPP.
2. Läs `temu/UTLANDS-LANSERING.md` (prisregler, butiksregister) och `CLAUDE.md`:s
   produktbatch- och beskrivningsstruktur-sektioner.

## Fas 0.5 — var kör jag? (avgör Fas 1)
Kör `node temu/kolla-lokalt.mjs` och läs sista raden:
- **Temu släpper igenom** (bild-URL:er hittade) → **LOKALT LÄGE**: skörda bilderna själv
  i Fas 1. Ingen Cowork-prompt behövs.
- **Tomt skal / 0 bild-URL:er** → **MOLNLÄGE**: följ Fas 1 som den står.
Är något annat ❌ i kollen: fixa det först, eller säg exakt vad som blockerar.
Uppsättningen på Axels dator: `SETUP-LOKALT.md`.

## Fas 1 — offert + bilder
1. Läs offerten med `node temu/offert.mjs <länk eller fil.csv>` — den hämtar arket
   via Google Sheets CSV-export (**ingen Drive-connector behövs**) och skriver ut
   produkterna uppdelade i *med quote* och *utan quote*. Fånga räkneord (antal delar,
   mått) — de är LÅSTA mot offerten.
   **Produkter utan ifylld quote hoppas över** och listas separat i rapporten.
   ⚠️ Arket har tre rader per produkt: **Qty 1 är styckkostnaden**, qty 2/3 är totaler.
2a. **LOKALT LÄGE:** skörda direkt, en produkt i taget:
   `cd temu/kaching-cli && node temu-bilder.mjs '<ren-URL>' <mappnamn>` (strippa
   query-parametrarna). Chrome öppnas synligt — captcha löses i fönstret. Granska varje
   mapp och rensa bort andra produkters miniatyrer innan bilderna används.
2b. **MOLNLÄGE — Axels regel 2026-08-29:** leverera Cowork-skördeprompten INNAN
   uppladdningen börjar: komplett klistra-in-bar med git-instruktioner +
   `node temu-bilder.mjs '<ren-URL>' <mappnamn>` för VARJE produkt. Committa som
   `temu/kaching-cli/BILDSKORD-BATCH<N>.md` och skicka filen till Axel.
   Zip-fallback om git strular. Produkter som inte skapas (väntar på CWD) utelämnas — säg det.

## Fas 2 — inventering + priser
1. Inventera SE och NO per SKU-mönster (`sku:TEMU-<goodsid>*`) INNAN något skapas —
   dubbletter (DK 2026-08-18) och luckor (NO 2026-08-29) har båda hänt.
   Sök även i DK/FI/UK för att upptäcka om produkten redan finns där sedan tidigare.
2. Prismatris: SE = 3 × (landad kostnad + 2,9 €), NO = 3 × landad kostnad.
   Jämförpris = pris × 1,3. Lokala prispunkter: heltal 9-slut (SEK/NOK/DKK), X,90 (EUR),
   X.99 (GBP). Landad kostnad ur offertens landskolumner — konvertera med den låsta FX-tabellen
   i utrullningsskripten. Priset dokumenteras i UTLANDS-LANSERING.md:s produkttabell.

## Fas 3 — copy
1. Svensk mastercopy skrivs av HUVUDSESSIONEN i `temu/utrullning/texter<N>.mjs`
   (T-objekt: titel, problemH/P, losningH/P, bullets, option/varden, alt). Copy-reglerna
   gäller: utfall i fetstil först, och?-testet, inga förbjudna ord, "smidig leverans",
   räkneord exakt mot offerten.
2. Norsk copy via sonnet-subagent med `docs/copy-regler.md` + föregående batchs
   texter-filer som stilfacit. Garantiblocket = exakt GARANTI4.no.
   (DA/FI/EN behövs inte längre — inga nya produkter i de butikerna.)

## Fas 4 — skapa i SE + NO
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
- **Produkter som INTE skapades får `– VÄNTA: <orsaken>` i namnet OCH en ruta överst
  på sidan, på engelska, som säger att kortet ligger på is och varför.** Redigerarna
  läser namnet, inte batchrapporten. *(2026-09-07: "5.1 Lövblåsare" saknade märkningen,
  en redigerare tog kortet och rapporterade "This product is not yet on the store".)*
- Slutkontroll: varje kort utan `Landing page` MÅSTE ha VÄNTA i namnet. Inga undantag.

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
- [ ] Fas 0.5 körd — läget (lokalt/moln) fastställt och redovisat
- [ ] Bilderna skördade (lokalt) ELLER skördeprompten levererad FÖRST och committad (moln)
- [ ] SE och NO inventerade per SKU före skapande — och EFTER (inga luckor/dubbletter)
- [ ] Priser enligt prisreglerna, dokumenterade i UTLANDS-LANSERING.md
- [ ] Copy: svensk mastercopy + norsk, räkneord mot offert, korrläst
- [ ] Produkter i SE + NO: mall, moms av, kategori, alla kanaler, slutgranskade
- [ ] Notion: item per produkt med batchnummer, Typ, Landing page + quotes-länk
- [ ] Bildpaketet (efter skörd): KIE/sharp-metoden, GIF:ar, gallerier, beskrivningsstruktur
- [ ] Allt committat + pushat (texter, skript, dokumentation, färdiga bilder)
