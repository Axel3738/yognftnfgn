# Beslutslogg

## Från Axel (2026-08-06)
- **Källbutik:** Bäverbutiken.se (bekräftat).
- **Målbutik/marknad:** beverkobling.no — Norge, norska (bokmål), NOK. Separat butik.
- **Arbetssätt:** Claude gör allt grovjobb nu; Axel slipar efteråt.

## Arbetsantaganden (defaults valda av Claude — ändringsbara, säg bara till)
| # | Antagande | Motiv |
|---|-----------|-------|
| 1 | Sortiment = alla 133 aktiva produkter + fraktskydds-upsellen. Drafts/arkiverade/app-produkter utelämnas. | "Hela upplägget"; skräp följer inte med |
| 2 | Legacy-produkterna Bäverkoppling/Beverlampe/Bevertrakt INGÅR (norska brandet heter ju Beverkobling) | Namnmatchning med nya butiken |
| 3 | Pris NOK = SEK 1:1 | Nära paritet, bevarar 9-slut och marginal |
| 4 | SKU: `BEVER-<KAT>-<NNN>[-V]`, Temu-id bevaras som supplier_sku | Egen struktur + inköpsspårbarhet |
| 5 | Vendor = "Beverkobling" på allt | Enhetligt varumärke |
| 6 | Allt importeras som DRAFT | Inget publiceras utan GO |
| 7 | Frakt: "priser inkl. mva., ingen toll" i kundtexterna — förutsätter VOEC | Källans "exkl. moms + kund betalar tull" är dålig konvertering och tveksam prisinfo i Norge |
| 8 | Retur: 14 dagers angrerett + 30 dagers åpent kjøp | Norsk lag (minimum) + källans löfte |
| 9 | Supportmail: kundesupport@beverkobling.no | Städar bort de tre olika adresserna i källan |
| 10 | "Alltid fri frakt"-löftet vidareförs INTE automatiskt | Motsade källans egen fraktpolicy; beslut om fraktpriser krävs |

## Öppna beslut som väntar på Axel
- Finns beverkobling.no som Shopify-butik? Koppling/auktorisering krävs för API-push.
- Fraktpriser för Norge (förslag: 79 NOK, fritt över 999 NOK).
- VOEC-registrering (blockerar "ingen toll"-löftena).
- Temaval (rättighetsfrågan för trevligtradgard-exporten är öppen).
- Betalmetoder (Shopify Payments/Klarna/Vipps) — aktiveras av Axel.
- Juridisk enhet för kjøpsvilkår/personvern (Stonebite Ecom AB? org.nr.).
