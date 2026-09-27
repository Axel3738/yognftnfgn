# `matstrumpor/marknader/` — Matstrumpor i flera länder, i SAMMA butik

Axels order 2026-09-27: "launcha matstrumpor med markets i alla marknader … Norge,
Danmark, Finland, USA, Australien, UK — och egentligen en rutin som duplicerar alla
ads hela tiden i 20–30+ länder, hela Europa."

## Så gjordes det förra gången (läst 2026-09-27, inte gissat)

**Inte Markets.** Den 26–28 augusti 2026 byggdes en egen engelsk Shopify-butik,
**sushisock.com** (`ud9jb9-jb.myshopify.com`, USD, land US, vendor "Sushi Sock"), med
samma fem produkter och Axels egna USD-priser (sushi 5 par $59.00, 3 par $45.99, donut
$33.99, pizza $49.99, burger $33.99, ätpinnar $5.99, "Free shipping on every order",
30-day returns). Annonserna gick från **samma svenska konto** "nya kungen"
(`730973156224390`, SEK) med Matstrumpors pixel `1785935302094082`:

| Kampanj | Land | Spend | Köp | ROAS | Status |
|---|---|---|---|---|---|
| `MATSTRUMP_SALES_US_20260828` | US | 6 193 kr | 9 | 0,76 | PAUSED |
| `MATSTRUMP_SALES UK` | GB | 5 845 kr | 11 | 1,07 | PAUSED |
| `MATSTRUMP_SALES AU` | AU | 9 656 kr | 20 | 0,97 | PAUSED |

155 engelska annonser (`MATSTRUMP_US_/AU_sushi_ugc_…`), alla med landningssidan
`https://sushisock.com/products/sushi-socks`. 21 694 kr, 40 köp, alla tre under
break-even. Pausade = beslut, aktiveras aldrig. sushisock.com finns inte i repot, inga
nycklar i miljön, och den ligger kvar live. matstrumpor.se hade före bygget **en**
marknad (Sverige), **ett** språk (sv), **en** valuta (SEK) och 4 009 av 4 011 ordrar
till Sverige — butiken har aldrig sålt utomlands.

Den här gången byggs marknaderna **i matstrumpor.se**, så en produkt, ett lager, en
kassa och en pixel bär alla länder — och annonsrutinen kan peka på
`matstrumpor.se/<språk>/products/<handle>?country=<LAND>`.

## Vad som byggdes (skarpt 2026-09-27, alla skrivningar tillbakalästa)

| | Norge | Europa | USA, UK, Australien, Kanada, Nya Zeeland |
|---|---|---|---|
| Länder | NO | DK, FI (byggd för fler) | US, GB, AU, CA, NZ |
| Språk | nb | da, fi | en |
| Basvaluta | NOK | EUR | USD |
| Lokala valutor | — | på (DKK omräknas från EUR) | på (GBP/AUD/CAD/NZD omräknas från USD) |
| Priser | Shopifys omräkning av SEK-priset | Shopifys omräkning | **fasta USD** = Axels sushisock-priser |
| Frakt | fri (ny zon "Norden") | fri (samma zon) | fri (ny zon "Engelska marknader") |
| Adress | matstrumpor.se/nb | /da, /fi | /en |

Valutorna i kassan gick från `SEK` till `AUD, CAD, DKK, EUR, GBP, NOK, NZD, SEK, USD`
utan ett klick (Shopify slår på dem själv när lokala valutor sätts via API — samma som
CaraShell 2026-09-17). Länderna flyttades UT ur zonerna "EU" och "Internationell", som
behåller 299 kr för resten av världen.

**Beslut sessionen tog (Axel ändrar med ett ord):**
- Fri frakt till alla launchländer. Precedens: sushisock.com, CaraShell, Bäverbutikens
  NO/DK/FI. 299 kr frakt på en låda för 299–449 kr är ingen marknad.
- USD-priserna är Axels egna från sushisock.com (augusti 2026) — inte en kursomräkning.
  Ingen jämförpris i USD (sushisock hade inget).
- NO/DK/FI får Shopifys omräkning av SEK-priset. Fasta x9-priser per valuta är Axels
  beslut: lägg `fasta_priser` på marknaden i `konfig.json` och kör `--steg prislista`.
- Leveranstiden 5–10 arbetsdagar på alla marknader (koncernens standardlöfte; CaraShell
  US fick den av Axel 2026-09-16). ⚠️ Inte mätt för Matstrumpor utanför Sverige.
- Löftena "framme till fars dag / jul" visas BARA på svenska — de är mätta för Sverige.

## Filerna

| Fil | Vad |
|---|---|
| `konfig.json` | Facit: marknader, länder, språk, valutor, fasta priser, fraktzoner, historiken (sushisock), översättningens sanningar, temapatchens filer |
| `underlag.mjs` | Läser ALLA kundsynliga texter ur Shopify → `output/underlag-sv.json` (+ `.resurser.json`). 187 texter, 56 542 tecken 2026-09-27 |
| `granska.mjs` | Mekanisk kontroll av en översättning: nycklar, HTML, Liquid, förbjudna ord, marknadens sanning, siffror, svenska kvar. `exit 1` = registreras aldrig |
| `bygg.mjs` | Stegen: `definition, marknader, sprak, frakt, prislista, oversattningar, tema, publicera`. Torrt är standard, `--skarpt` skriver, `--lage` läser |
| `temapatch.mjs` | Locale-grenar i temats ms-*.liquid, custom_liquid-blocken i product.json/index.json och ms-cro.js (pris + datum i kundens språk/valuta) |
| `kundvy.mjs` | Läser butiken som kund i varje land (POST /localization): lang, land, valuta, pris, paketnivå, läckor |
| `output/underlag-<locale>.json` | Översättningarna (sonnet-subagenter mot REGLER, granskade adversariellt) — committade, det är minnet |

```bash
node matstrumpor/marknader/underlag.mjs             # svenskt underlag ur Shopify
node matstrumpor/marknader/granska.mjs output/underlag-sv.json output/underlag-nb.json nb
node matstrumpor/marknader/bygg.mjs --lage          # läs läget
node matstrumpor/marknader/bygg.mjs --alla          # torrt
node matstrumpor/marknader/bygg.mjs --alla --skarpt # hela kedjan
node matstrumpor/marknader/kundvy.mjs               # kundens vy per land
node --test matstrumpor/marknader/test/*.test.mjs   # 8 tester utan nät
node matstrumpor/kor.mjs --ekonomi --marknad US     # break-even per marknad (cogs.json + ECB)
```

## Översättningen

Butiken är byggd för hand, så underlaget läses ur Shopify (inte ur yaml som
fabriken). Fyra språk, fem delar var (produkter · tema/paket/menyer · policyer ·
integritetspolicy-sidan · Shopifys integritetspolicy). En sonnet-översättare per del med
`REGLER.md` (marknadens sanning: fraktrad, leveranstid, valuta; svensk lag står kvar;
ingen ny siffra, inget nytt löfte; ordlista för produktnamnen), sedan en granskare per
del som ska HITTA fel, sedan rättning. Registreringen matchar på VÄRDE precis som
`factory/marknad.mjs` (svenska texten → översatt text), så Shopifys hashade temanycklar
aldrig gissas; det som blev kvar på svenska listas som läckor.

Det translationsRegister INTE når, och som därför patchas i temat (`temapatch.mjs`):
hårdkodade ord i `ms-paket.liquid` (Låda, gratis, värde …), trust-radens "Fri frakt i
Sverige" (både snippetens fallback och `product.json`s custom_liquid), leveransraden
("Beräknad leverans", "arbetsdagar"), storleksraden, AI-bildmarkeringen på startsidan,
"Verifierat köp", jämförelsetabellens Ja/Nej — och `ms-cro.js`, som räknade om
paketpriset med butikens "kr"-format och skrev datum på svenska oavsett marknad. Allt
med svenskan i else-grenen: saknas ett språk faller det på svenskan, aldrig på tomt.

Paketnivåerna (`ms_paketniva`, "Köp 1 – Få 1 GRATIS") var inte translatable — det slogs
på 2026-09-27 (40 texter kom in i underlaget). Rabattkoderna (SUSHI-K1F1 …) är BOGO i
procent och fungerar i alla valutor.

## COGS per marknad (`matstrumpor/cogs.json`, `cogs.mjs`)

Sverige: Shopifys Cost per item (landad, SEK) — sushi 5 par 80,23, 3 par 67,51;
donut/pizza/hamburgare **saknas i Shopify**. Big 5: Axels ark (USD per order, vara +
frakt, rad för 1 och 2 lådor). Norden: **ingen kostnad känd** — står som saknas med
orsak. `kor.mjs --ekonomi --marknad US` räknar break-even per produkt med ECB-kurs;
vinsten på stonebite.org räknar Matstrumpors Big 5-ordrar på leveranslandets kostnad
(`stonebite/kallor/vinst.mjs` → `kostnadPerLand`).

## Domänen matstrumpor.no

`matstrumpor.no` svarar NXDOMAIN (2026-09-27) — inte registrerad. Köps hos Loopia (där
.se och .com ligger), kopplas i Settings → Domains, och sedan kopplas den till marknaden
Norge med `webPresenceCreate` + `marketUpdate(webPresencesToAdd)` (receptet mättes på
CaraShell 2026-09-16, `factory/API-GRANSER.md`). Tills dess är matstrumpor.se/nb
adressen — allt fungerar utan .no.

## Annonserna i 20–30 länder — planen (inte byggd)

Kontot är det svenska "nya kungen" (SEK) — så gjordes US/UK/AU i augusti, och det
fungerade tekniskt (pixeln är butikens, köpen bokförs rätt). "Norge" `1418612340124566`
och "Finland DK" `1356652809967926` saknar betalmetod och nås inte av token.

Rutinen som saknas är `/ops-oversatt` för Matstrumpor: SE-vinnarna i hubben →
`pipeline/translate-batch.mjs --marknad <M>` (HeyGen för video, `translate-images` för
bild) → en kampanj per land i nya kungen (`MATSTRUMP_<LAND>_SALES`, geo = landet,
länk `https://matstrumpor.se/<språk>/products/<handle>?country=<LAND>`) → annonsnamn
`MATSTRUMP_<LAND>_sushi_<vinkel>_<format>_<nnn>_v<n>`. Break-even per land ur
`cogs.json` (US 1,22 · GB 1,17 … för sushi 5 par; se `--ekonomi --marknad`). Byggs
som `/matstrumpor-marknader` när Axel sagt budget per land — augustis test låg under
break-even i alla tre länder, och den frågan är hans.
