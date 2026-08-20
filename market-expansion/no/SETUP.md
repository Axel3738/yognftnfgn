# beverbutikken.no — uppsättning & import

## Innehåll i det här paketet

| Fil | Vad |
|-----|-----|
| `output/shopify-import.csv` | Hela norska katalogen, redo för Shopify-produktimport (status **draft**) |
| `output/catalog.no.json` | Samma katalog i API-format (används när jag pushar direkt via API) |
| `output/build-report.md` | Kontrollsummor + alla `[JURIDISK GRANSKNING]`-flaggor från översättningen |
| `content/collections.no.json` | 8 norska kollektioner + huvudmeny & sidfotsmeny |
| `content/pages/*.html` | Om oss, FAQ, Kontakt, Fraktinformasjon, Retur & angrerett, Kjøpsvilkår |
| `content/pages/personvern-NOTAT.md` | Instruktion för personvernerklæring (genereras i Shopify, inte översätts) |
| `batches/`, `translations/` | Käll- och översättningsdata per batch (spårbarhet/omkörning) |

## Fasta regler som använts (grovjobb — slipas av Axel)

- **Pris:** NOK = samma tal som SEK (1:1). SEK/NOK ligger nära paritet och källpriserna
  slutar redan på 9. Vill du ha annan faktor: ändra i `build/build-catalog.mjs` och kör om.
- **SKU:** `BEVER-<KAT>-<NNN>[-<V>]` — KAT ∈ HAGE/BIL/CAMP/LAND/MARIN/KJT/DIV/SERV.
  Temu-SKU:n bevaras som `supplier_sku` i JSON (läggs som metafält vid API-push).
- **Vendor:** `Beverbutikken` på allt. Bäver-produkterna heter Beverkobling/Beverlampe/Bevertrakt.
- **Status:** allt importeras som DRAFT. Aktivering sker efter ditt godkännande.
- **Lager:** negativa saldon klampade till 0, policy deny.
- **Bilder:** källbutikens CDN-URL:er återanvänds (Shopify kopierar filerna vid import).

## Två vägar in i butiken

**A. Direkt via API (rekommenderas — jag gör allt):** koppla sessionens
Shopify-anslutning till beverbutikken.no (jag kör `switch-shop`, du godkänner
auktoriseringen). Därefter skapar jag produkter, kollektioner, menyer och sidor
programmatiskt och lägger supplier-SKU som metafält.

**B. CSV-import (om du hellre klickar själv):** Shopify admin → Products → Import →
`output/shopify-import.csv`. Kollektioner/menyer/sidor får därefter skapas för hand
eller via väg A.

## Butiksinställningar som ska sättas (gör jag via API där det går)

1. **Marknad:** Norge primär, valuta NOK, språk norsk (bokmål).
2. **Frakt:** en zon (Norge). Priser enligt ditt beslut — förslag: fast 79 NOK, fritt över 999 NOK.
   (Källans "alltid fri frakt" i villkoren motsade fraktpolicyn — inte vidareförd.)
3. **Skatt/moms:** priser inkl. 25 % mva. **VOEC-registrering krävs** för sändningar < 3000 NOK
   från utlandet — ditt ansvar, `[JURIDISK GRANSKNING]`. Utan VOEC måste frakt-/prislöften skrivas om.
4. **Betalning:** Shopify Payments + ev. Klarna/Vipps — aktiveras av dig (identitetsverifiering).
5. **E-postmallar:** norska texter (orderbekräftelse m.m.) — utkast tas fram efter att butiken kopplats.
6. **Domän:** beverbutikken.no kopplas i Settings → Domains. Supportmail kundesupport@beverbutikken.no.
7. **Tema:** beslut krävs (rättighetsfrågan för trevligtradgard-exporten är öppen) —
   tills vidare rekommenderas gratis-temat Horizon i norsk version.

## Nästa steg (i ordning)

1. Du: bekräfta att beverbutikken.no-butiken finns och godkänn Shopify-kopplingen när jag växlar.
2. Jag: pushar katalog (draft) + kollektioner + menyer + sidor, konfigurerar marknad/frakt/moms-grund.
3. Du: stickprovsgranskar ~10 produkter + policysidorna, beslutar fraktpriser, aktiverar betalning.
4. Jag: QA-svep av hela kundresan, felrapport, lanseringschecklistan gås igenom.
5. Du: juridisk slutgranskning (VOEC, angrerett, prisinfo) + uttryckligt GO → aktivering.
