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

## Läget 2026-09-27 ~14:45 CEST — publicerat, läst som kund i alla åtta länder

`bygg.mjs --steg publicera --skarpt` publicerade nb, da, fi, en och band dem till båda
webbnärvarorna (matstrumpor.se + myshopify) och till marknaderna. Översättningarna lästa
tillbaka ur Shopify (`--steg kontroll`): **nb 150, da 150, fi 159, en 155 — 0 saknas, 0
avviker.** Kundvyn (`kundvy.mjs`, POST /localization per land, riktig HTML):

| Land | Adress | lang | Valuta | Pris 5 par | Paketrubrik | Judge.me |
|---|---|---|---|---|---|---|
| SE | / | sv | SEK | 399 kr | Köp 1 – Få 1 GRATIS | sv |
| NO | /nb | nb | NOK | 391,00 kr | Kjøp 1 – Få 1 GRATIS | nb |
| DK | /da | da | DKK | 270,00 kr | Køb 1 – Få 1 GRATIS | da |
| FI | /fi | fi | EUR | €36,95 | Osta 1 – Saat 1 ILMAISEKSI | fi |
| US | /en | en | USD | **$59.00** (fast) | Buy 1 – Get 1 FREE | en |
| GB | /en | en | GBP | £46.00 | Buy 1 – Get 1 FREE | en |
| AU | /en | en | AUD | $86.00 | Buy 1 – Get 1 FREE | en |
| CA | /en | en | CAD | $86.00 | Buy 1 – Get 1 FREE | en |
| NZ | /en | en | NZD | $107.00 | Buy 1 – Get 1 FREE | en |

Start- och produktsidan: inga svenska läckor på något språk. Judge.me-widgeten följer
locale av sig själv (`"locale":"nb"` osv. i sidan) — inget klick behövdes.

### Läget 2026-09-27 kväll — Europa skarpt efter Axels "ok", läst som kund i 19 länder

Axels ok på listan kom ~17:30 CEST ("ok men vart kan jag se priserna?"). `bygg.mjs --steg
marknader,sprak,frakt,prislista --skarpt` lade 27 länder i Europa (29 med DK, FI), aktiverade
de sju språken, skrev fraktzonen "Europa (EU + Island, Liechtenstein, Schweiz)" fri frakt,
tömde och tog bort "EU (Europeiska Unionen)" (299 kr), döpte om Norden till "Norden (Norge)"
och släppte CH ur "Internationell"; prislistorna: **NOK 449/349/299/399/299/49 (ny), EUR
44,90/34,90/29,90/39,90/29,90/4,90 (ny), USD 69/54,99/39,99/59,99/39,99/6,99 (uppdaterad)**.
Valutor i kassan nu: AUD, CAD, CHF, CZK, DKK, EUR, GBP, HUF, ISK, NOK, NZD, PLN, RON, SEK, USD.
⚠️ **Shopify vägrar locale `pt` ("Locale is invalid") — portugisiskan heter `pt-PT`** i
shopLocaleEnable/translationsRegister och i `request.locale.iso_code`, men URL-mappen är `/pt`
(hreflang `pt`, mätt). Konfig, underlag (`underlag-pt-PT.json`), temagrenar (`when 'pt-PT'`)
och kundvyn följer det; annonslänken är `/pt/…?country=PT`. Registrering + tillbakaläsning:
**de 157, fr 157, nl 159, es 159, it 159, pl 158, pt-PT 159 — 0 saknas, 0 avviker.** Temat
byggdes om från originalen med alla elva språk (9 filer, tillbakalästa). Publicerat och bundet
till båda webbnärvarorna. Kundvyn (POST /localization per land):

| Land | Adress | lang | Valuta | Pris 5 par | Paketrubrik |
|---|---|---|---|---|---|
| NO | /nb | nb | NOK | 449,00 kr (fast) | Kjøp 1 – Få 1 GRATIS |
| DK | /da | da | DKK | 343,00 kr | Køb 1 – Få 1 GRATIS |
| FI | /fi | fi | EUR | €44,90 (fast) | Osta 1 – Saat 1 ILMAISEKSI |
| DE, AT | /de | de | EUR | €44,90 | Kauf 1 – Bekomm 1 GRATIS |
| CH | /de | de | CHF | CHF 44.00 | Kauf 1 – Bekomm 1 GRATIS |
| FR, LU | /fr | fr | EUR | €44,90 | Achetez-en 1 – Recevez-en 1 GRATUIT |
| NL, BE | /nl | nl | EUR | €44,90 | Koop 1 – Krijg 1 GRATIS |
| ES | /es | es | EUR | €44,90 | Compra 1 – Llévate 1 GRATIS |
| IT | /it | it | EUR | €44,90 | Compri 1 – Ricevi 1 GRATIS |
| PL | /pl | pl | PLN | 201,00 zł | Kup 1 – Otrzymaj 1 GRATIS |
| PT | /pt | pt-PT | EUR | €44,90 | Compre 1 – Receba 1 GRÁTIS |
| US | /en | en | USD | $69.00 (fast) | Buy 1 – Get 1 FREE |
| GB / AU / CA / NZ | /en | en | GBP / AUD / CAD / NZD | £54 / A$101 / C$100 / NZ$125 | Buy 1 – Get 1 FREE |

Inga svenska läckor på start- eller produktsidan i något av de elva språken. ⚠️ Länder i
Europa-marknaden utan eget språk (CZ, HU, RO, GR, IE …) får sidan på den locale kunden kommer
in på — annonserna länkar alltid med språk och `?country=`. Judge.me visar `en` för pt-PT
(widgeten känner inte `pt-PT`; alla andra språk följer locale). **Spårningssidan** får de sju
språken via `sparning/sprak/{de,fr,nl,es,it,pl,pt}.json` + `sprak_extra` i
`sparning/butiker.json` — byggs av `/sparning matstrumpor` från `main`, så den visar svenska
för dem tills grenen är mergad (samma läge som nb/da/fi/en hade tidigare i dag).

Kundvyn kollar paketrubriken ur `output/underlag-<locale>.json` (`paket.sushi-2.rubrik`) —
den fasta listan med fem språk missade alla Europa-språken första gången.

⚠️ **Spårningssidan `/pages/spara` visar svenska på alla språk tills rutinen byggt om den.**
Sidan skrivs av `/sparning matstrumpor` varje timme (:56) ur `sparning/butiker.json`, där
`sprak_extra: ["nb","da","fi","en"]` nu står — men rutinen klonar `main`, så den bygger den
flerspråkiga sidan först när den här grenen är mergad. `kundvy.mjs` mäter språkpaketet i sidan
(inte svenskan i källkoden, som alltid står kvar där) och säger det rakt ut tills dess.
Spårningens egna tester (167) bevisar att de fyra språkpaketen är fullständiga.

## Filerna

| Fil | Vad |
|---|---|
| `konfig.json` | Facit: marknader, länder, språk, valutor, fasta priser, fraktzoner, historiken (sushisock), översättningens sanningar, temapatchens filer |
| `underlag.mjs` | Läser ALLA kundsynliga texter ur Shopify → `output/underlag-sv.json` (+ `.resurser.json`). 187 texter, 56 542 tecken 2026-09-27 |
| `granska.mjs` | Mekanisk kontroll av en översättning: nycklar, HTML, Liquid, förbjudna ord, marknadens sanning, siffror, svenska kvar. `exit 1` = registreras aldrig |
| `bygg.mjs` | Stegen: `definition, marknader, sprak, frakt, prislista, oversattningar, tema, publicera, kontroll`. Torrt är standard, `--skarpt` skriver, `--lage` läser, `--locale xx` begränsar. `kontroll` läser tillbaka varje översättning ur Shopify och jämför med filen (skriver aldrig) |
| `temapatch.mjs` | Locale-grenar i temats ms-*.liquid, custom_liquid-blocken i product.json/index.json och ms-cro.js (pris + datum i kundens språk/valuta) |
| `sammanfoga.mjs` | Delarna `<locale>-A1…E.json` → `output/underlag-<locale>.json`: nyckelkontroll, granskning, hårda blanksteg tillbaka |
| `kundvy.mjs` | Läser butiken som kund i varje land (POST /localization): lang, land, valuta, pris, paketnivå, läckor |
| `output/underlag-<locale>.json` | Översättningarna (sonnet-subagenter mot REGLER, granskade adversariellt) — committade, det är minnet (`matstrumpor/.gitignore` undantar dem från `output/`) |
| `PROMPT-granskning.md` | Uppdraget till en fristående session som granskar hela utlandsbygget innan Axel slår på något: Meta, video och röst, språket med en infödd granskare per språk, sajten och korgen som kund, mejlen och byggarens påståenden. Läs-bart. Axels beställning 2026-09-30: "Om du skriver en prompt för en annan session att granska dig". Rapporten hamnar i `granskning/` |

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

### Så gick översättningen (2026-09-27)

Sju delar per språk: **A1** produkter/kollektioner, **A2** tema + paketnivåer + menyer,
**A3** mallarnas hårdkodade rader, **B** frakt-/retur-/om-oss-sidorna + Shopifys retur- och
användarvillkor, **C** sidan Integritetspolicy, **D** Shopifys integritetspolicy (Liquid-villkor),
**E** det Shopify skapade medan vi översatte (fraktsättens namn i de nya zonerna, sidan
"Dina integritetsval" — samma text byte för byte som CaraShells, så den översättningen
återanvändes ur `factory/output/carashell/oversattning-<locale>.json`). En sonnet-översättare
per del, en granskare per del som ska HITTA fel, sedan rättning för hand i delfilerna och
`sammanfoga.mjs` → `output/underlag-<locale>.json`. Tre översättare dog i API-timeouts när
de skrev 15–20 kB i ett anrop — omstartade med ordern att skriva en policytext per anrop.

**Det granskarna hittade som ändrade texten** (exempel, alla språk fick 5–15 rättningar):
"favoritparet i lådan" är BYRÅlådan, inte presentlådan (en/da hade "in the box"/"i boksen");
"36–44" utan "EU" är en okänd skala i USA; "Most free" är inte engelska ("Most freebies");
"orderbekræftelse" är inte danska (ordre); "For ærligt" betyder *för* ärligt på danska;
"Jos peruutat tilauksen" läses som avbeställd order (finska); "med mindre" ≠ "medmindre";
danskans villkorssida heter "Brugsvilkår" så integritetspolicyn ska hänvisa dit, inte till
"handelsbetingelser"; norskan ska säga nettsted/innsyn/sletting/standardkontraktsklausuler;
den svenska integritetspolicyns "hur du interagerar med oss" hade smalnat till "hur du
använder tjänsterna". Ordval som är identiska med svenskan och rätt på målspråket
("Om oss", "gratis", "Pris", "Egenskap" på bokmål/danska; "Share", "Collections",
"Free shipping" som redan är engelska i källan) står i `OK_IDENTISKT` i `granska.mjs`.

**Beslut i översättningen (Axel ändrar med ett ord):**
- Fraktpolicyns "1-2 dagars spårbar frakt med Postnord" från det svenska lagret gäller bara
  Sverige — utomlands står "spårbar frakt med Postnord" utan dagar (ingen ny siffra hittas på).
- Rubriken "LEVERANSBEKRÄFTELSE" avser mejlet när ordern skickas ⇒ "Shipping confirmation"/
  "Forsendelsesbekreftelse"/"Lähetysvahvistus" — "delivery confirmation" betyder framme.
- "Mest gratis"-brickan: nb/da samma ord, fi "Eniten ilmaista", en "Most freebies".
- Sidtitlar = menylänkarnas titlar på varje språk (länk och sida säger samma sak).

**Tre Shopify-beteenden som mättes och som koden nu tål:**
1. `translationsRegister` svarade `INTERNAL_SERVER_ERROR` ("Looks like something went wrong on
   our end") på alla sex produkter i en körning och gick igenom fem minuter senare — `bygg.mjs`
   gör ett nytt försök, fortsätter per resurs och listar det som inte gick (`⚠️ … GICK INTE`).
2. En **batchläsning** av `translatableResourcesByIds` (31 resurser) gav DANSKA värden för
   `translations(locale: "en")` på temats resurser, medan samma resurs läst ensam gav rätt
   engelska — reproducerat två gånger samma eftermiddag. `--steg kontroll` läser därför om
   varje avvikande resurs ensam efter en paus innan något kallas avvikelse (`ℹ️`-raderna visar
   när det hände), och `oversattningar`-steget registrerar hellre om än litar på läsningen.
3. Ett `<p> </p>` med vanligt blanksteg kollapsar i webbläsaren där svenskans `<p>&nbsp;</p>`
   ger en blankrad — alla översättare normaliserade U+00A0 tyst; `sammanfoga.mjs` sätter dem
   tillbaka segment för segment.
4. **`themeFilesUpsert` är INTE atomär.** Första skarpa temaskrivningen (11 filer) fick
   `userErrors` för EN fil (ett `{% case %}` inne i en `{{ }}`-utmatning: "Variable … was not
   properly terminated") — och de tio andra filerna var ändå skrivna, mätt med nästa torrkörning
   ("redan patchad"). Skriv därför aldrig en temafil utan att originalen ligger sparade:
   `--steg tema --skarpt` lägger dem i `output/tema-original/<tidsstämpel>/` innan något skrivs
   (2026-09-27-12-30 är den riktiga uppsättningen före patchen). Liquid-taggar får stå i ett
   HTML-attribut (`aria-label="{% case %}…"`) men aldrig inuti `{{ … }}` — då en variabel som
   tilldelas på raden före (`valj_paket` i `ms-bundle-picker.liquid`).

## Priserna: minst +20 % mot Sverige (Axel 2026-09-30, `paslag.mjs`)

Axel: "Jag undrar varför du bara har lagt på 15 % i worldwide … vi borde lowkey lägga på 20 % … om det
går att göra ett snyggt pris av det". Påslaget mättes först mot Sveriges pris i dagens kurs
(exchangerate-api, 1 SEK = 0,960 NOK / 0,0882 EUR / 0,100 USD). Resultatet var att bara Norges 5-par låg nära
15 % (+17 %), och resten av Norge låg mellan −8 och +4 %. Europas 5-par låg på +27 %, och resten mellan +1 och +13 %.
USA låg mellan +34 och +73 %.

- **Regeln** (`konfig.json` → `paslag_min: 0.2`): varje fast pris i en utlandsmarknad ska vara minst
  Sveriges pris + 20 % i dagens kurs. Ett pris under golvet höjs till närmaste snygga pris ovanför. Snyggt betyder
  kronor som slutar på 9, euro och dollar på ,90, yen på 80 och Taiwan-dollar på 90. Ett pris över golvet
  sänks aldrig, eftersom Axel ville höja och $69 är hans eget USA-beslut.
- **Höjt och sett som kund 2026-09-30:**

| Produkt | Norge | Europa | USA |
|---|---|---|---|
| Sushi 5 par | 449 → **469 kr** | 44,90 € (+27 %, kvar) | $69 (kvar) |
| Sushi 3 par | 349 → **429 kr** | 34,90 → **39,90 €** | $54.99 (kvar) |
| Donut | 299 → **349 kr** | 29,90 → **31,90 €** | $39.99 (kvar) |
| Pizza | 399 → **519 kr** | 39,90 → **47,90 €** | $59.99 (kvar) |
| Hamburgare | 299 → **349 kr** | 29,90 → **31,90 €** | $39.99 (kvar) |
| Ätpinnar (gåvan) | 49 → **59 kr** | 4,90 → **5,90 €** | $6.99 (kvar) |

  De lokala valutorna i Europa (DKK, CHF, PLN …) räknas om av Shopify från euron och följde med. Kontrollen
  som kund visade DK 305/244/366 kr, CH 31/47 CHF och PL 178 zł. Gåvans "verdi" i Norge räknas ur ätpinnarnas
  pris och blev 118/236 kr. Sverige är orört (399/369 kr).
- **Köra:** `node matstrumpor/marknader/paslag.mjs` (torrt, visar påslaget per produkt), `--skriv` (in i
  `konfig.json`), sedan `bygg.mjs --steg prislista --skarpt`. Kursen rör sig, så räkna om när en ny marknad
  läggs till, aldrig i efterhand på en marknad som säljer.
- **Leverantörens quotes per marknad tas först när marknaden har fått försäljning** (Axel samma dag). Därför
  är frågorna i `LEVERANTOR-FRAGA.md` och `LEVERANTOR-FRAGA-JP-TW.md` parkerade.

## COGS per marknad (`matstrumpor/cogs.json`, `cogs.mjs`)

Sverige: Shopifys Cost per item (landad, SEK) — sushi 5 par 80,23, 3 par 67,51;
donut/pizza/hamburgare **saknas i Shopify**. Big 5: Axels ark (USD per order, vara +
frakt, rad för 1 och 2 lådor). Norden: **ingen kostnad känd** — står som saknas med
orsak. ⚠️ **Europa (DE, AT, CH, FR, BE, LU, NL, ES, IT, PL, PT), Japan och Taiwan har inget
kostnadsblock alls** — 13 av de 21 länder som har en kampanj (granskningen G-F08, 2026-09-30).
Break-even går inte att räkna där förrän leverantörens pris per land finns (Axel: först när
marknaden har sålt). `kor.mjs --ekonomi --marknad US` räknar break-even per produkt med ECB-kurs;
vinsten på stonebite.org räknar Matstrumpors Big 5-ordrar på leveranslandets kostnad
(`stonebite/kallor/vinst.mjs` → `kostnadPerLand`).

## Domänerna .no, .eu och .com — och A/B-testet i Norge (2026-09-29)

Axels besked 2026-09-29: "Jag har kopplat .no, .com och .eu-domäner", och beställningen samma
morgon: A/B-testa Norge som svenskt varumärke mot en sida som "känns väldigt norsk", och "se
skillnaden efter typ två veckor".

**Domänerna** (`bygg.mjs --steg domaner`, fältet `doman` per marknad i `konfig.json`): Norge →
**matstrumpor.no** (nb), Europa → **matstrumpor.eu** (en som standard + da, fi, de, fr, nl, es, it,
pl, pt-PT), USA/UK/AU/CA/NZ → **matstrumpor.com** (en). **Sedan 2026-09-29 kväll delas .com med
Norge och Europa och bär alla utlandsspråk** (avsnittet nedan). .se-närvaron ligger kvar i alla
marknader (`delad` i `stegPublicera`), så gamla .se/<språk>-länkar fungerar. A-sidan är
matstrumpor.com/nb och B-sidan matstrumpor.no.

### Allt utland via matstrumpor.com (Axel 2026-09-29 kväll)

Axel: "Varför gav du mig 2 olika domäner nu igen? Och varför är alla dessa .se domäner??? Ska inte
alla vara via .com domänen?" Annonserna byggdes 27–28/9, före domänerna, och länkade därför till
matstrumpor.se/<språk>. Förhandsgranskningslistan blandade dessutom .se med .eu och .com.

- **Shopify:** .com-närvaron bär nu alla utlandsspråk. Engelska ligger i roten, och övriga språk har
  mapparna /nb, /da, /fi, /de, /fr, /nl, /es, /it, /pl och /pt-pt. Närvaron ligger i Norge, Europa
  och USA-marknaden. Språken står hos ägaren (USA-radens `doman` i `konfig.json`), och delningen
  styrs av `ocksa_domaner` hos Norge och Europa. Den gjordes med `bygg.mjs --steg domaner --skarpt`
  och lästes tillbaka. .no (B-sidan), .eu och .se/<språk> fungerar kvar.
- **Mätt som kund 2026-09-29 kväll:** alla tolv språk och 19 länder på .com svarade 200 med rätt
  språk, land, valuta, pris och loggan "Matstrumpor". /nb, /da och /fi gav 404 respektive
  myshopify-omdirigering i första läsningen, direkt efter bytet. Minuten efter var de rätt, alltså
  Shopifys uppdatering. Utan `?country=` läser containern från USA, så .com/de hamnar på engelska
  härifrån. En tysk besökare hamnar i Europa-marknaden, precis som på .se.
- ⚠️ **"En egen domän kan bara ligga i EN marknad" stämmer inte här.** Anteckningen kommer från
  CaraShell 2026-09-17, där en nyskapad GB-marknad fick `RESOURCE_NOT_FOUND`. Samma kväll lade
  sessionen först .com i Europa som prov: `userErrors` var tomt, .com låg kvar i USA-marknaden, och
  provet återställdes exakt. Därefter gjordes delningen på riktigt. Orsaken till CaraShells fel är
  inte utredd.
- **Annonserna:** alla utlandskampanjer länkar till matstrumpor.com (`annonser/marknader.json` →
  `lank`, `doman`, PT med `sprakmapp: pt-pt`). Undantaget är NOB, som går till .no. `lankOk` kräver
  domänen, språkmappen och landet. `lankSkillnad` gör att `--byt-text` också byter länken i PAUSED
  annonser. Testet "marknader.json: … allt utland går via matstrumpor.com utom B-sidan" stoppar en
  ny .se-länk. `ab-norge.mjs` räknar både .com/nb och .se/nb som A.

**Temat per domän: `domantema.mjs` (v4 sedan 2026-09-29)**, en patch i MAIN som bara slår på
de egna domänerna och de icke-svenska språken. Den svenska sidan på .se renderas byte för byte som
förut (testat).
- **.no, .eu och .com:** loggan utan ".SE" (`domantema/matstrumpor-logga-utan-se.png`) och
  butiksnamnet "Matstrumpor" i stället för "Matstrumpor.se" i titel, meta och sidfot.
  Kortutdragets descriptor `SP Matstrumpor.se` skyddas och byts aldrig.
- **Alla språk utom svenska:** presentkortets bild på kundens språk (`presentkort-<locale>.png`),
  ritad av `domantema/presentkort/rita.py` utan belopp och utan giltighetstid. Giltighetstiden
  togs bort 2026-09-29, för tre månader är olagligt i USA, Kanada, Australien, Tyskland och Österrike.
  Temat läser varje fils egen `image_url`, eftersom Shopifys CDN väljer version på `?v=` och en
  extra parameter inte tömmer cachen.
- **Bara .no (variant B):** ingen språk- eller landsväljare och ingen världskollage (`.ms-varlden`).
  Judge.me-rutan är dold och ersatt av elva norska omdömen ur metafältet `matstrumpor.omdomen_nb`
  (`domantema/omdomen-nb.json`, båda 3-stjärniga kvar, snitt 4,4; `--omdomen --skarpt`).
  FAQ:ns mejlmening blir en länk till kontaktsidan.
- Kör: `node matstrumpor/marknader/domantema.mjs [--tema <gid>] [--fran <gid>] [--skarpt]`.
  Prova alltid i en kopia av MAIN först, med `?preview_theme_id=`. Förhandsvisningen kräver kakor,
  så använd scratchpadens `prov.mjs` eller en webbläsare.
- ⛔ **B påstår aldrig att butiken är norsk.** Sidan säger ingenting om ursprunget, och
  bolagsuppgifterna (STONEBITE ECOM AB, org.nr, Göteborg) står kvar i sidfoten
  (ehandelsloven § 8, markedsføringsloven §§ 7–8).

**A/B-testet: två kampanjer i nya kungen, alla PAUSED, 500 + 500 kr/dag.** Axels 1 000 kr/dag
delas i två. Det är sessionens förslag, och Axel har fått det sagt.

| | A | B |
|---|---|---|
| Kampanj | `MATSTRUMP_NO_SALES` `120251749551520023` | `MATSTRUMP_NOB_SALES` `120251777339520023` |
| Länk | matstrumpor.com/nb/…?country=NO (förut .se/nb, till 2026-09-29 kväll) | matstrumpor.no/…?country=NO |
| Brödtextens sista rad | "Et svensk merke." | (ingen) |
| Annonser | 001–008 | samma 001–008, samma video- och bild-id |

B:s annonser härleds ur A:s med `annonser/nob.mjs`. Allt är lika utom varumärkesraden och sidan
kunden landar på, så testet mäter bara en sak. **Varje ny NO-annons:** kör
`node matstrumpor/marknader/annonser/nob.mjs` och sedan `bygg.mjs --marknad NOB --skarpt`.

**Avläsningen:** `node matstrumpor/marknader/annonser/ab-norge.mjs [--fran <datum>] [--till <datum>]`.
Den är läs-bar och visar Metas tal per kampanj (spend, visningar, CTR, sidvisningar, köp, köp per
sidvisning, ROAS, CPA, 7 dagars klick). Den visar också Shopifys ordrar till Norge, delade på
landningssidan (matstrumpor.no ⇒ B, .se/nb ⇒ A). Domen kräver minst 300 kr och 3 köp per variant.
Den säger "säker skillnad" först vid p < 0,05 på köp per sidvisning.
⚠️ Norges landade kostnad saknas (`cogs.json` → `norden`), så varken break-even eller vinstbidrag
går att räkna. Jämförelsen håller ändå, eftersom produkt, pris och kostnad är lika i A och B.
⚠️ Våra annonser bär inga UTM-taggar (mätt 2026-09-29, `creative.url_tags` tom). Delningen i
Shopify bygger alltså på landningssidan. Order som bara har en kassalänk räknas som okända.
⚠️ De två kampanjerna riktar sig till samma publik (Norge, brett) och möts i samma auktion. Metas
eget split-test (`ad_studies`) delar publiken rent men låser start- och slutdatum. Det väljer Axel
när han slår på kampanjerna. Testet byggs med
`ab-norge.mjs --splittest --start <YYYY-MM-DD> [--dagar 14] [--skarpt]`. Det är torrt som standard
och skapar bara testet, aldrig påslagningen. Skapandet är oprövat skarpt. Svarar Meta med fel gör
Axel det i Ads Manager: markera båda kampanjerna och välj "A/B-test".

**Rättad text i en pausad annons:** ändra `<KOD>.json` och kör
`bygg.mjs --marknad <KOD> --skarpt --byt-text`. Samma video eller bild behålls, bara creativen byts,
och texten läses tillbaka. En annons som går rörs aldrig. Första användningen var FR och PL
2026-09-29: erbjudanderaden följer nu sidans rättade paketrubriker ("1 acheté – 1 offert",
"otrzymaj").

### Sett från riktiga länder: `geokoll.mjs` (2026-10-01)

Containern går ut på nätet från USA, så `?country=` och `POST /localization` simulerar bara landet.
Vad Shopify gör med en riktig besökare syns bara från landet. `node matstrumpor/marknader/geokoll.mjs`
mäter det med Globalpings prober (gratis, ingen nyckel, 250 mätningar i timmen per IP).
`--annonser` tar varje kampanjlänk från varje land i kampanjens geo, och `<url> --land NO,SE --folj`
mäter vilken adress som helst.

**Mätt 2026-10-01 17:20–17:45 CEST, som Facebook-appens webbläsare:**

- **matstrumpor.no från Norge:** 200, nb, NO, NOK, utan omdirigering. Det gäller roten,
  produktsidan och NOB-länken. Från Sverige ger .no 302 → matstrumpor.se.
- **matstrumpor.se från Sverige:** 200, sv, SE, SEK.
- **12 av 14 kampanjlänkar rätt från sina länder:** NO, NOB, DK, FI, US, WW (GB, CA, NZ), NL, ES,
  IT, PL, PT och JP.
- ✅ **DE och FR landade på engelska — rättat samma kväll** (se nedan). En produktsida i en
  språkmapp på .com utan `?country=` får 302 till den engelska produktsidan när Shopify placerar
  besökaren i en annan marknad än USA.
  - Mätt från DE, AT, CH, FR, BE, ES och NO. Det händer även när Facebooks `fbclid` sitter på
    länken.
  - Landet och valutan blir rätt, men språket blir fel.
  - Startsidan `/de` och `/de/pages/spara` stannar på tyska.
  - Med `?country=` stannar sidan i mappen. Från AT och CH med `?country=DE` blir sidan tysk, men
    landet blir DE.
  - DE- och FR-kampanjerna har flera länder och fick därför ingen `?country=` (2026-09-29). Då
    antogs att "Shopify väljer land efter IP", och det var aldrig mätt.
  - Produkten har inga översatta handles, så det är inte orsaken. Varför Shopify gör så är inte
    utrett.
- 🟡 **En norrman utanför .no:** på matstrumpor.se får hen svensk text med NOK, och på
  matstrumpor.com/ engelska med NOK.
- **Mejlens spårningsknapp** `.com/<mapp>/pages/spara?nummer=` stannar på språket. Mätt på de,
  nb, ja och da.

⚠️ **Shopify geolokaliserar inte en förfrågan som ser ut som en bot.** Med Globalpings egen
User-Agent fick prober i DE, GB och FR landet US och dollar på .com, utan omdirigering. Det var fel
bild åt andra hållet. Med en webbläsares User-Agent, Accept-Language och Accept fick samma prober
sitt eget land. geokoll skickar därför Facebook-appens UA, och `--bot` visar botens svar.
⚠️ 429 är Shopifys botskydd mot datacenter-IP, inte ett fel på sajten. Mät med två eller tre prober.
Prober hos vanliga nätoperatörer svarar bäst.
⚠️ Globalping och Shopify kan placera en prob i olika länder. "Luxembourg" hos WEDOS blev CZ hos
Shopify, och geokoll ger då ⚪ i stället för en dom.

**Rättningen, Axels val A 2026-10-01 kväll** (frågan: A landet i länken nu, B starta som det är,
C vänta med DE och FR):

- DE-kampanjens länk bär `?country=DE` och FR:s `?country=FR` (`annonser/marknader.json`).
- Alla 16 annonser fick ny creative med `bygg.mjs --marknad DE|FR --skarpt --byt-text`, lästa
  tillbaka 18:2x CEST. Statusen rördes inte: annonserna står ACTIVE i en kampanj som är PAUSED
  till starten 00:01. `--byt-text` byter sedan dess också i en sådan förberedd annons, men aldrig
  i en som går.
- Mätt efteråt med `geokoll.mjs --annonser --bara DE,FR`: 6 av 6 rätt. Sidan är tysk med euro i
  DE, AT och CH, och fransk med euro i FR, BE och LU, utan omdirigering.
- Priset för att ha en länk till tre länder: Shopify tror att österrikare och schweizare är i
  Tyskland, och belgare och luxemburgare i Frankrike.
  - Fraktrutan säger Deutschland respektive France.
  - Kassan förväljer det landet, så kunden väljer sitt eget där.
  - En schweizare ser euro, inte franc.
- Den rena lösningen är ett adset per land med egen länk. Den är inte byggd.
- `schemalagg.mjs` torrt efteråt: 14 av 15 skulle startas. Taiwan stoppas som förut.

**Regeln för nya länkar sitter i koden:** `lankOk` (`annonser/bygg.mjs`) godkänner en länk till en
språkmapp bara om den bär `?country=` med ett av kampanjens länder. `farAktiveras` och
`schemalagg.mjs` startar alltså aldrig en sådan länk utan land. Regeln är mätt på .com, och
.se/<mapp> delar samma uppbyggnad men är inte mätt. Ingen kampanj länkar dit.

Hela sajtgranskningen i alla marknader står i `PROMPT-granskning-sajt.md`.

## Presentkortets egen sidmall (`presentkort.mjs`, 2026-09-29)

Presentkortet delade `templates/product.json` med strumporna. Det visade därför "Passar strl
36–44", "Fri frakt", "30 dagars öppet köp", "Beräknad leverans 5–10 arbetsdagar", fars dag-raden
och sex strumpfrågor. Valörväljaren visade "150,00 kr" på euro-sidorna.

Nu har presentkortet egen mall, `templates/product.presentkort.json`, med `templateSuffix:
presentkort`. Mallen byggs ur strumpornas mall och har bara titel, pris och köpknappen med
gåvoformuläret. Den har inga egna texter och behöver därför inga översättningar.
`node matstrumpor/marknader/presentkort.mjs --skarpt`, och `--utan-koppling` för att först prova
med `?view=presentkort`. Sidan lästes som kund 2026-09-29 på alla tolv språk plus .no, .eu och
.com: inget strumpblock kvar i `<main>`.

⚠️ Utanför Sverige är priset Shopifys omräkning av 150 kr (146,85 NOK, €13,49, $15.29, 58,98 zł).
Ett jämnt pris per marknad är Axels beslut.

## Språkrättningar efter infödda granskare (2026-09-29)

| Språk | Rättat |
|---|---|
| FR | paketrubrikerna "1 acheté – 1 OFFERT" och "2 achetés – 2 OFFERTS", brickan "Le plus généreux" |
| ES | brickan "Más cajas gratis" |
| IT | brickan "Più omaggi" |
| NL | "Het zijn sokken." |
| PL | "To skarpetki." och liten bokstav i "otrzymaj" |
| PT | "serve do 36 ao 44" (även direkt i temats `product.json`) och presentkortet "Cartão de oferta", som ersatte det brasilianska "Cartão-presente" |

Ändringarna ligger i `output/underlag-<locale>.json`. De registrerades med
`bygg.mjs --steg oversattningar --locale <l> --skarpt` (157–159 texter per språk) och lästes
tillbaka som kund.

## QA som kund på alla tolv språk (2026-09-29 eftermiddag)

Fyra agenter läste sajten som kund, var och en i sin språkgrupp: Norden, engelska, de/fr/nl och
es/it/pl/pt. De läste på .se, .eu, .com och .no, och tog 289 fynd totalt (fynden ligger i sessionens
scratchpad, inte i repot). Det här rättades:

| Fynd | Rättning | Var |
|---|---|---|
| "Ångra köp" i sidfoten ledde till **Bäverbutikens** kundkonto (`shopify.com/101303222621`) | menyposten pekar på Matstrumpors (`97675084115`), alla 8 poster och deras översättningar kvar | Shopify-menyn, live |
| Spårningssidan: "…2–4 **dagar**" på alla språk | butikens väntetid går genom översättningen | `sparning/sida.mjs` + `sparning/sprak/*.json` (bygger om efter merge till `main`) |
| Sidfoten och JSON-LD visade loggan "MATSTRUMPOR.SE" på .com/.eu/.no | layoutens v5 byter filnamnet i hela sidan på egen domän | `domantema.mjs` |
| Köpknappen: "Lägger i…" och två svenska felrader på varje språk | ordlista per språk i `ms-paket.js` | `temapatch.mjs` → `patchaPaketJs` |
| Sortvalets aria-etikett "Sort i låda 1" | språkgren | `temapatch.mjs` |
| Finska presentkortet: namnfältet hade e-postfältets etikett (fel i Dawns `fi.json`) | "Vastaanottajan nimi (valinnainen)" | `domantema.mjs` → `patchaFiLocale` |
| Ätpinnarnas sida visade strumpstorlekarna 36–44 och strumpornas FAQ | egen mall `product.tillbehor.json` | `presentkort.mjs --profil atpinnar` |
| Presentkortets leverantör "matstrumpor" med liten bokstav | "Matstrumpor" | `presentkort.mjs` |
| FR/PL: länkbeskrivningen i annons 001–007 | ny creative per annons, alla PAUSED | `annonser/bygg.mjs --byt-text` |

**Temabygget kan nu uppdatera översättningar i redan patchade filer.** Förut byggde
`bygg.mjs --steg tema` om en fil bara när den var exakt "originalet + fyrspråkspatchen" från
2026-09-27. En ändrad översättning nådde därför aldrig temat. Nu godtas också:

- nuvarande underlag;
- varje committad version av `output/underlag-*.json`, läst med `git show`.

Den version som ger exakt live-filen bevisar att filen är vår. Då byggs den om från originalet i
`output/tema-original/`.

JSON-mallarna (`product.json`, `index.json`) rörs också av `domantema` och Trustpilot-sektionen. De
byggs därför aldrig om. `patchaMallJson` byter bara sin egen gren på plats, från en gammal
översättning till den nya. `ms-paket.js` bär sin ordlista som en rad som byts varje körning.

Rättat på vägen: saknades en översättning blev ersättningen i `patchaFil` strängen `null`. Live-temat
mättes rent.

**Står kvar med flit:**

- ~~Judge.me-rutan är svensk på alla språk.~~ Axel slog på flerspråk och automatisk översättning
  själv samma kväll. Mätningen står under "Judge.me på tolv språk" nedan.
- Trustpilot-rutorna, som en annan session byggde på Axels beställning, visar de riktiga svenska
  omdömena, även på .no.
- Landväljarens namn på /nb är svenska. Shopify har inga bokmålsnamn.
- ~~Integritetspolicyns adress.~~ Den är rättad. Mätt som kund 2026-09-29 kväll på .se och .eu/de:
  Stenkolsgatan står där och Sjöhed 160 syns inte. Policyn är autoManaged, så adressbytet i Shopify
  rättade alla språk på en gång.
- `hreflang` på .eu/.com/.no pekar på .se. Shopify skriver dem själv.
- Kvar som ägarbeslut:
  - presentkortets omräknade pris;
  - rabattkodernas svenska namn (HAMBURGARE-K1F1).

### Momsraden borta (Axels svar 2026-09-29 kväll)

Frågan var att fraktpolicyn säger "exklusive moms, tull kan tillkomma" medan produktsidan sa "inkl.
moms". Axels svar: "ta bort inkl. moms / Skriv inget / C", och "Jag fixar Judge.me till alla språk".

- **Borta på alla värdar och alla tolv språk:** "Skatter ingår." under priset, och "Skatter ingår.
  Rabatter och fraktkostnad beräknas i kassan." under totalsumman i varukorgen och sidolådan
  ("Taxes included.", "Inkl. Steuern." …). Dawn skriver raden för att butikens priser är satta
  inklusive skatt.
- **Ingen text i stället** ("Skriv inget"). Korgens hela rad går, också meningen om rabatter och
  frakt, för den sitter ihop med momsen i samma översättning och frakten är fri. Elementet står kvar
  tomt, så avståndet till kassaknappen är som förut.
- **Fraktpolicyn står som den står** (C). Butikens skatteinställning rörs inte. Judge.me gör Axel.
- Patchen: `domantema.mjs` → `patchaProduktMoms` (`main-product`, `featured-product`) och
  `patchaKorgMoms` (`main-cart-footer`, `cart-drawer`, `quick-order-list`). Den är exakt och
  idempotent, och markören är `ms-domantema: ingen momsrad`. Den andra sessionens Trustpilot-rad i
  sidolådan rörs inte, och det testas.
- **Mätt:** PROV först, sedan MAIN, båda tillbakalästa. Sedan läst som kund med en vara i korgen på
  .se (sv, en, nb, fi, pt), .com, .no och .eu (de, fr, nl, es, it, da, pl, pt-pt): 0 momsrader.
  Sidolådan är sedd i Chromium på sv och de. Totalsumman, Trustpilot-raden och kassaknappen står som
  förut.
- ⚠️ På .eu är portugisiskan `/pt-pt/`. `/pt/` skickar till engelska startsidan. Annonsernas länk
  är `matstrumpor.se/pt/…`, och den visar portugisiska (mätt samma kväll).

### Loggan "Matstrumpor" i alla länder utom Sverige (Axel 2026-09-29 kväll)

Axels fråga: "om loggan bara är Matstrumpor … eller om det är Matstrumpor.se i varje marknad. För vi
borde bara ha Matstrumpor." Svaret var nej: 12 av 13 utlandskampanjer länkar till
`matstrumpor.se/<språk>`, och där stod MATSTRUMPOR.SE. Bara de egna domänerna (.no/.eu/.com) hade
loggan utan .SE.

- **Villkoret är kundens land, inte adressen:** `localization.country.iso_code != 'SE'` eller egen
  domän. Då får kunden loggan utan .SE i sidhuvudet, sidfoten och JSON-LD. Butiksnamnet blir
  "Matstrumpor" i titeln, i `og:site_name` och i löptexten, där till exempel leverantörsraden stod
  "MATSTRUMPOR.SE". Marknaden Sverige har bara SE, så Sverige ritas exakt som förut.
- `domantema.mjs`: layouten v6, `patchaMetaTags` v2 och `patchaHeader` v2. Äldre versioner
  uppgraderas på plats, och en okänd version stoppar. Testerna bevisar att v1–v5 blir samma fil som
  en ny patch.
- **Mätt som kund i 24 länk/land-par:** Sverige MATSTRUMPOR.SE och alla andra "Matstrumpor". Språk,
  land, valuta och pris var rätt i alla par. Sidhuvudet är sett i Chromium på de och sv.
  "matstrumpor.se" står kvar i supportadressen kundsupport@matstrumpor.se. Det är den riktiga
  brevlådan, och kortets descriptor `SP Matstrumpor.se` skyddas som förut.
- ⚠️ **Kassan visar MATSTRUMPOR.SE i alla länder**, och flikens titel är "Checkout - Matstrumpor.se".
  Det mättes som tysk kund samma kväll. Kassan har EN logga för hela butiken. En logga per marknad
  kräver Shopify Plus (Checkout and Accounts Configuration API). Namnet i kassan och i Shopifys mejl
  är butikens namn, alltså Settings → General. Det här är en fråga till Axel.
  - API:t går inte heller. `checkoutBranding` svarar ACCESS_DENIED: "the shop must be on a Plus plan
    or a Development store plan" (planen är "Shopify", mätt 2026-09-29). Den publicerade profilen är
    "Kopia av FixKliniken-konfiguration" `gid://shopify/CheckoutProfile/6876528979`.
  - Axel frågade samma kväll: "The logo tho in the german checkout?". Därför laddade sessionen upp
    loggan utan .SE till Filer som **`matstrumpor-kassa-logga.png`** (`gid://shopify/MediaImage/62475343495507`).
    Den har samma format som den nuvarande kassaloggan, 1920 × 1080 med transparens och samma
    inramning, så storleken i kassan blir densamma. Bytet gjordes med Cowork-prompten
    `cowork/2-slutklick.txt`, eftersom Axel ville ha loggan fixad i en Cowork-prompt i slutet och
    inte som klick under arbetet. Det gäller alla länder, också Sverige.
  - ✅ **Klart 2026-09-29 kväll.** Cowork gick via Inställningar → Kassa → "Redigera" (inte
    "Anpassa") på den aktiva konfigurationen → kugghjulet → Logotyp, och valde den befintliga filen.
    Bredden 130 px och justeringen Vänster står kvar, och Shopify svarade "Ändringar sparade".
    Sessionen läste tillbaka kassan som tysk kund (.com/de, de-DE) och som svensk kund (.se, sv-SE).
    Båda visar `matstrumpor-kassa-logga` med alt-texten "Matstrumpor".

### Judge.me på tolv språk (mätt 2026-09-29 kväll, efter Axels inställning)

- **Rutans egna texter är översatta på alla tolv språk.** Mätt i Chromium på produktsidan:
  - Kundrecensioner, Kundeanmeldelser (nb, da), Asiakasarvostelut, Customer Reviews;
  - Kundenbewertungen, Avis Clients, Klantbeoordelingen, Reseñas de Clientes, Recensioni Clienti;
  - Recenzje klientów, Avaliações de Clientes.
- **Recensionerna själva är inte översatta än.** Inställningen står rätt i sidans `jdgmSettings`:
  `widget_translate_review_content_enabled: true` och `widget_translate_review_content_method:
  automatic`. Men produktens data (`metafield_updated_at` 13:23 UTC) bär översättningar bara till
  `sv`. Recensionerna visas därför på svenska under "Recensioner på andra språk", med knappen
  "Översätt recensionen till …". Judge.me skriver att språkigenkänningen tar upp till 48 timmar efter
  att inställningen slagits på, och Shopifys språk upp till 24 timmar. Inställningen kräver planen
  Awesome. [Judge.me: Translating reviews](https://judge.me/help/en/articles/11379816-translating-reviews-in-the-review-widget)
- ⚠️ **Shop-appens sju recensioner är märkta `en`** fast de är svenska: Kent, Wide Pia, Niklas, Jonas,
  Gittan, Fredrik och Annika. Det står i fältet `language` i Judge.me:s widgetdata, med `source: shop-app`
  (läst 2026-10-01). Judge.me:s egna fyra recensioner är märkta `sv`. Språkigenkänningen hade inte
  rättat dem efter 48 timmar. Följderna, mätta som kund 2026-10-01:
  - **På engelska sidan (USA, UK, Kanada, Nya Zeeland) är de fem första recensionerna svenska och
    oöversatta.** Judge.me tror att de redan är på engelska och visar dem utan knapp.
  - På svenska sidan står "Visa original (engelska)" under svensk text.
  - I Chrome översätter webbläsarens egen översättare dem "från engelska" till rotvälska, till exempel
    "Kul Förpackning, Tierarzt" på tyska. Det syns från sida 2 under "Recensioner på andra språk", för
    sida 1 är Judge.me:s egna tre. Utan webbläsarens översättare blir Judge.me:s översättning rätt.
  - Rättas i Judge.me, en recension i taget: Reviews → "⋯" på recensionen → Review details →
    "Detected review language" → Swedish → Save
    ([Sorting reviews by language](https://judge.me/help/en/articles/10506442-sorting-reviews-by-language)).
  - ✅ **Rättat 2026-10-01 kväll av Cowork** (`cowork/5-judgeme-texter.txt` del B): alla sju på
    sushistrumporna står nu som Swedish. I adminen heter fältet "Upptäckt recensionsspråk". Widgetdatan
    visar 0 recensioner märkta engelska på sushistrumporna. **Engelska sidan läst som kund efteråt:** de
    svenska recensionerna översätts till engelska ("Show original (Swedish)"), och ingen svensk text står
    överst längre. ⚠️ **Svenska sidan visade samma kväll fortfarande den gamla märkningen** på Kent, Wide
    Pia och Niklas: "Visa original (engelska)" under svensk text. Det ser ut som Judge.me:s cache av
    produktens data, för widgetdatan är redan rätt. Kolla igen nästa dag.
  - ⚠️ **Kvar 2026-10-02 11:20 CEST (check-in-rutinen), och nu är orsaken mätt.** Den svenska sidan ritas
    inte ur Judge.me:s data just då, utan ur den **kopia Judge.me sparar i produktens metafält i Shopify**:
    `judgeme.review_widget_data` (sidans första recensioner, JSON) och `judgeme.review_widget_ssr_html`
    (alla elva, HTML). Kopian skrevs senast **2026-09-30 06:05–06:09 UTC**, alltså före Coworks rättning,
    och bär Kent, Wide Pia och Niklas som `en`; HTML:en har sju `en` och fyra `sv`. Judge.me:s widget-API
    sa samtidigt `sv` på alla elva. Svenska sidan gjorde inget anrop till Judge.me (api 0), engelska sidan
    tre: bara huvudspråket visar kopian. **Engelska sidan var rätt**, tre synliga, alla "Show original
    (Swedish)". Att ändra språket skrev inte om kopian, och det gjorde inte heller Coworks textändringar
    samma dag. Judge.me:s support ombeds synka om båda produkterna (`cowork/8-judgeme-kopian.txt` del D).
    En session skriver aldrig i Judge.me:s metafält själv: det är Judge.me:s data, och deras nästa synk
    skriver över det. `judgeme-koll.mjs` jämför sedan samma dag kopian med Judge.me per recension, allra
    sist i utskriften ("Kopian i Shopify").
  - ⚠️ **En åttonde Shop-app-recension var också märkt engelska:** Irénes på **ätpinnarna**
    (`sushipinnar-i-akta-tra`, **olistad** i Shopify, så kunden når sidan bara via länk). Texten är
    "jättefina strumpor och rolig som julklapp". Cowork såg den men lät den vara, eftersom den inte stod i
    prompten. **Fortfarande `en` 2026-10-02**; den ändras på samma sätt som del B, i
    `cowork/8-judgeme-kopian.txt` del C.
  - 📧 **Judge.me:s support ombedd 2026-10-02 15:21 CEST, i stället för del C och D** (Coworks körning
    fastnade i del C, och Axel ville inte göra mer). Mejlet gick från kundsupport@matstrumpor.se till
    support@judge.me, adressen ur Judge.me:s hjälpsida
    ([How to contact our support team](https://judge.me/help/en/articles/15203152-how-to-contact-our-support-team)),
    med ämnet "Re-sync review widget metafields + one review language (1r46tp-qx.myshopify.com)". Mejlet
    ber om två saker. Den ena är att kopian i metafälten skrivs om för sushistrumporna (10286130889043)
    och ätpinnarna (10408204468563). Den andra är att Irénes recension märks som svensk. Det ligger i
    Skickat. Svaret landar i Matstrumpors inkorg. Autosvaret räknar judge.me som systemavsändare
    (`kundtjanst/arenden.mjs` → `arSystem`) och svarar därför inte på det. Kontrollen är
    `judgeme-koll.mjs` ("Kopian i Shopify" och språkmärkningen). Del C och D i prompten är reserven om
    supporten inte gör det.
  - **Nya recensioner från Shop-appen kan komma in märkta engelska igen.** `judgeme-koll.mjs` listar sist
    varje recension märkt engelska, på alla produkter kunden kan nå, också olistade (produkterna läses
    ur Shopify, annars ur `products.json`). `--bara-markning` kör bara den delen.
- Läses om med **`node matstrumpor/marknader/judgeme-koll.mjs`**: alla fjorton språk, antalet i rutan
  ("11 recenzji"), språkmärkningen sist. `--visa` visar varje recension, och `--med-webblasare` visar
  vad en Chrome-kund ser.
- **Mätt igen 2026-10-01 ~10:30 CEST (~36 timmar efter inställningen):** fortfarande 0 översatta recensioner
  på de, nb, fr, ja och zh-TW, bara knappen "Översätt …". Rubrikerna är rätt på de, nb, fr och en, men
  japanska och kinesiska sidan visar "Kundrecensioner" och "Recensioner på andra språk" på svenska —
  texterna ligger i `cowork/4-judgeme-australien.txt` (B2). Läs om efter 48 timmar.
  ⚠️ Talet "0 översatta" var fel, se nedan: skriptet läste recensionerna innan de syntes på skärmen.
- **2026-10-01 eftermiddag, efter Coworks körning och Axels klick:**
  - **Japanska och kinesiska är på.** Judge.me:s språklista gjordes innan Japan och Taiwan lades till
    (2026-09-30) och visade bara elva språk. Axel tryckte **Inställningar → Språk → "Uppdatera lista"**,
    och listan bär nu Japanese och Chinese (Traditional). Judge.me hämtar annars nya Shopify-språk själv
    inom upp till 24 timmar. Läst som kund samma eftermiddag: カスタマーレビュー · レビューを書く ·
    他の言語のレビュー · märket 11件のレビュー, och 客戶評論 · 寫評論 · 其他語言的評論 · märket 11 條評論.
  - **Datumet är dd/mm/yyyy** (Cowork, Inställningar → Språk; ett enda format för alla språk, Judge.me har
    inget format per språk). Förut stod 09/28/2026 överallt, även på svenska.
  - **Antalet i rutan:** böjningen var fel på finska ("11 arvostelut", ska vara "11 arvostelua") och polska
    ("11 recenzje", ska vara "11 recenzji"). Det är Review Widget-fältet "Review word (plural)" per språk
    (Inställningar → Widgetar → Review Widget → Text → "Currently editing in"), i
    `cowork/5-judgeme-texter.txt`. **Finskan och polskan är rättade 2026-10-01** av Cowork och lästa som
    kund: "11 arvostelua" och "11 recenzji". Polskan krävde tre försök. Judge.me-panelen blev tom och
    laddade om sig när Cowork valde Polska, tills Chrome startats om. Polskans "recenzji" blir fel igen
    vid 22–24 recensioner (då "recenzje").
- ✅ **Recensionerna översätts när kunden rullar fram dem: 14 av 14 språk, mätt 2026-10-01 16:15 CEST**
  (48 timmar efter inställningen, `judgeme-koll.mjs`, webbläsarens översättare av). De recensioner
  som syns först står på sidans språk, med knappen "Visa original (svenska)" på samma språk. Exempel:
  "Much appreciated Christmas gift for sushi-loving daughter!", "Bardzo ceniony prezent świąteczny dla
  kochającej sushi córki!", 寿司好きの娘に大好評のクリスマスプレゼント！ Kunden klickar inget.
  - Så fungerar det. Judge.me översätter en recension först när den syns på skärmen. Widgeten visar
    "Översätter..." och hämtar översättningen från `api.judge.me/api/review_translations`, ett anrop
    per recension, ~1–3 s. Om översättningen redan finns i produktens metafält tar den den därifrån.
    Judge.me använder också webbläsarens egen översättare där den finns ("a combination of the Chrome
    Translation API and AI-powered translation", Judge.me:s hjälpsida).
  - ⚠️ **Två mätningar 2026-10-01 sa "0 översatta" och var fel**: 10:30 CEST och check-in-rutinen 16:00
    CEST. Båda skripten rullade förbi rutan och läste recensionerna innan de syntes. Då visar Judge.me
    bara knappen "Översätt …", även för en översättning som redan finns. `judgeme-koll.mjs` stannar
    därför tre sekunder vid varje recension. Med 1,2 s gjorde Judge.me inget anrop alls på en- och
    sv-sidan.
  - Kvar är Shop-appens språkmärkning (ovan). Den gör att engelska sidan visar svenska recensioner.
  - **Går inte att ändra:** "Sort reviews by" är en dold skärmläsartext (syns inte för kunden), "5 stars:
    6 (55%)" ligger i ett dolt SEO-block som widgeten ersätter, och "Anonym" är namnet Judge.me lämnar ut på
    butikens språk för en anonym recensent (en fråga till Judge.me:s support om det ska rättas).
    Källorna: [Using multi-language widgets](https://judge.me/help/en/articles/8389840-using-multi-language-widgets-to-match-your-store-languages)
    och [Judge.me supported languages](https://judge.me/help/en/articles/8420621-judge-me-supported-languages).

### Facebook-sidan "Matstrumpor" på utlandsannonserna (Axel 2026-09-29 kväll)

Axel: "jag har ett Facebook-page också … 1285064981363590", och "Den heter endast 'Matstrumpor'".

- Sidan ligger i samma Business Manager som kontot (Matstrumpor.se `3354502211392342`). Token:ens
  användare "API LONG TERM" har ADVERTISE på den (mätt med `me/accounts`).
- Förut visades annonserna som **Matstrumpor.se** på Facebook och **matstrumpor.se** på Instagram
  (mätt i Metas förhandsvisning). Sidan Matstrumpor har inget eget Instagram-konto. Därför skapade
  sessionen sidans page-backed Instagram-identitet `17841423405715219`, så att Instagram också säger
  "Matstrumpor". Då finns ingen profil att klicka på. Vill Axel ha det riktiga kontot matstrumpor.se
  byts `instagram_user_id` tillbaka till `17841479011543544` i `annonser/marknader.json`, och sedan
  körs `--byt-text` igen.
- `bygg.mjs --byt-text` byter nu också sida och Instagram (`identitetSkillnad`), bara i PAUSED
  annonser, med ny creative och tillbakaläsning. De svenska annonserna och sidan Matstrumpor.se rörs
  aldrig härifrån.
- ✅ **Alla 104 utlandsannonser bytta 2026-09-29 kväll.** Bytet tog två omgångar. Den första, som
  bara bytte sidan, stoppades efter 72 annonser när länken också skulle till .com. Den andra
  omgången bytte 64 länkar och 32 sidor + Instagram + länk, och NOB:s 8 var redan rätt. Allt är
  PAUSED och Meta bromsade (kod 17) i omgångar om upp till 300 s.
- En egen avläsning av hela kontot efteråt gav **104 av 104 rätt**: sidan `1285064981363590`,
  Instagram `17841423405715219`, länken enligt `marknader.json` både i länken och i knappen, och
  PAUSED. Nio stod i Metas granskning efter ändringen. Förhandsvisningen av DE 008 (bild) visar
  "Matstrumpor" med den nya profilbilden på Facebook och Instagram.
- **Profilbilden** var tom (`is_silhouette: true`, 0 följare), så alla 104 annonser visades med en grå
  gubbe, också på Instagram, där identiteten lånar sidans bild. Sessionen satte loggan utan ".SE"
  (`domantema/matstrumpor-logga-utan-se.png`) på en vit kvadrat 1600 × 1600, där allt ryms i Facebooks
  cirkel. Den laddades upp med `POST /1285064981363590/picture` och sidtoken (`{"success":true}`) och
  lästes tillbaka som 720 × 720 utan silhuett 2026-09-29 kväll. Omslagsbild saknas fortfarande. Den
  syns inte i annonserna.

### En kampanj per marknad — WW utan dubbletter (Axel 2026-09-29 kväll)

Axel: "vi borde köra en kampanj per marknad tycker jag faktiskt, en kampanj per marknad borde bli
bäst". Så var det redan byggt: NO (A/B: NO + NOB), DK, FI, US, DE, FR, NL, ES, IT, PL, PT. Undantaget
var WW, som också bar NO, DK, FI och US. De länderna låg alltså i två kampanjer samtidigt, och WW hade
bjudit mot dem. Sessionen har ändrat WW-adsetet `120251749614670023` (PAUSED) så att det bara bär de
engelska länderna utan egen kampanj: **GB, AU, CA och NZ**. Resten av inriktningen är orörd (18–65,
Advantage+, platstyperna). Den är tillbakaläst och står i `marknader.json` → `WW.geo_beslut`.
Kampanjen heter fortfarande `MATSTRUMP_WW_SALES`, för annonsnamnen bär `WW`.

### Fraktrutan visar kundens land och flagga (Axel 2026-09-30)

Axel: "istället för att vi har den här widgeten … jag vill att den ändras utifrån vilket land kunden
sitter i så att det står Free shipping to Norway, Japan etc … magnetchess har gjort detta väldigt
snyggt". Rutan är lastbilspunkten i trust-raden under köpknappen (`snippets/ms-trust-row.liquid`,
produktsidan och ätpinnarnas mall). Förut stod "Fri frakt i Sverige" på svenska och bara "Free
shipping"/"Kostenloser Versand" utan land på de andra språken.

- **Nu:** kundens flagga i stället för lastbilen, och texten med landet: "Free shipping to the United
  States", "Kostenloser Versand in die Schweiz", "Livraison gratuite au Luxembourg", "Darmowa dostawa do
  Polski". Svenska kunder ser samma text som förut, "Fri frakt i Sverige", med den svenska flaggan.
- **Motorn:** `domantema.mjs` → `FRAKT_SPRAK` (grammatiken per språk: hemlandets fasta fras, artikel och
  preposition per land där språket kräver det) och `fraktLandSnippet` → `snippets/ms-frakt-land.liquid`,
  som skrivs om varje körning ur `konfig.json`:s länder. Ett nytt land i en marknad får alltså flaggan och
  landet av sig självt; ett land vi inte säljer till får frasen utan land och lastbilen. Landnamnet är
  Shopifys eget på kundens språk (`localization.country.name`), flaggan Shopifys egen (`country |
  image_url`, 4:3), 1,25em hög så att texterna står i linje med ikonerna bredvid.
- **Mätt som kund 2026-09-30 i 22 länder** (23 prov: SE, NO A och B, DK, FI, US, GB, AU, CA, NZ, DE, AT,
  CH, FR, BE, LU, NL, ES, IT, PL, PT, IE, CZ), och samma kväll i Japan och Taiwan (「日本全国送料無料」 /
  「全台免運費」, se Japan och Taiwan), alltså 24: rätt flagga och rätt land överallt, provtemat först och sedan MAIN.
  `test/domantema.test.mjs` kör snippeten i en liten Liquid-tolk för alla 13 språk × 38 länder och
  jämför med `fraktText`.
- Magnetchess gick inte att läsa härifrån (magnetchess.com svarar 502/503 mot containern). Deras .se
  visar bara "Free shipping on all orders". Utseendet är därför vårt eget.

### Trust Badges-appen bara på svenska (hittat 2026-09-30)

Appen Ultimate Trust Badges ritar en rad under köpknappen: "Betala säkert med Klarna." och logorna
Mastercard, Visa, Apple Pay, Klarna, Google Pay och **Swish**. Texten är appens egen och finns bara på
svenska. Mätt som kund: raden syntes på svenska sidor **och på .com:s engelska sidor**, alltså i USA, UK,
Australien, Kanada och Nya Zeeland (appen känner bara igen sökvägar utan språkmapp, så /nb /da /de …
slapp den). Den döljs nu på alla språk utom svenska (`domantema.mjs` → `CSS_UTB` i
`snippets/ms-head.liquid`, `display: none` bakom `request.locale.iso_code != 'sv'`). Trust-radens
"Secure payment" står kvar. Tillbakaläst live: SE visar raden, US/GB/AU har den dold (höjd 0).

### Granskningens första fynd: korgen och Taiwans mejlknapp (2026-09-30 kväll)

En fristående session granskade hela utlandsbygget (`PROMPT-granskning.md`). Två fel var
bekräftade redan i sajtdelen och är rättade samma kväll, före rapporten:

- **Korgen blev engelsk.** Paketväljarens reservväg (`assets/ms-paket.js`, `laddaOm()`) laddade
  om till `/discount/<kod>?redirect=/cart`. En ren `/cart` landar på domänens huvudspråk, alltså
  engelska på matstrumpor.com för en tysk, polsk eller japansk kund. Reservvägen tas när lådan
  inte kan ritas eller när rabattkoden inte fastnade. Den vanliga vägen ritar lådan på kundens
  språk (mätt: "Dein Warenkorb", koden `SUSHI-K2F2` tillämplig). Nu bär omdirigeringen rutten
  (`rutt + 'cart'`, `/de/cart`), och Shopify följer den (mätt på /de, /zh-tw, /ja, /pt-pt).
  Rättat i `temapatch.mjs` → `patchaPaketKorg` (körs av `bygg.mjs --steg tema`, skrivet och
  tillbakaläst, och butiken skickar ut det: `rutt+"cart"` i den minifierade filen), och i fabrikens
  källa `factory/tema/assets/ms-paket.js` (+ kopian i `factory/tema/ops-tema.zip`, som ett test
  kräver ska vara byte-identisk). Det var det enda stället i temats 406 filer med en korg utan
  språkmapp (`ms-ab.js` postar `/cart/update.js`, som bara är JSON). **CaraShell bar samma fel**
  (live-filen var exakt fabrikens källa före rättningen): där hade en norsk eller dansk kund på
  carashell.se/nb eller /da landat i en svensk korg. Samma fil skrevs in i CaraShells publicerade
  tema samma kväll, tillbakaläst och utskickad som giltig JS (`node --check` på den minifierade filen).
- **Taiwans mejlknapp gav 404.** Fraktmejlens knapp räknades som `matstrumpor.se/<mapp>`, och .se
  bär zh-TW på `/zh`. Nu går alla tretton språkens knappar till matstrumpor.com, med adresser ur
  Shopifys egna `rootUrls` (`mejl/README.md` → "Matstrumpor på tolv språk").
- ⚠️ `bygg.mjs --steg tema` säger sedan samma dag att `snippets/ms-paket.liquid` inte är
  "originalet + våra patchar". Filen bär en annan sessions pakettest (`fast_variant`,
  `matstrumpor/erbjudanden/paket-test.mjs`), så steget rör den inte längre. Nya texter i
  paketväljaren når därför inte den filen förrän originalet i `output/tema-original/` följer med.
- ⚠️ Chromium från containern fick Cloudflares kontroll ("Verifying your connection", 429) samma
  kväll, medan granskaren körde. Korgen återskapades därför med samma anrop som knappen gör
  (curl med kakor): `/discount/<kod>?redirect=…`, `POST /de/cart/add.js` med `sections_url`, och `/de/cart.js`.

## Japan och Taiwan (Axel 2026-09-30)

Axel: "Jag hade också viljat testa Japan och Taiwan. Och i Japan speciellt kan vi trycka på att det är ett
svenskt varumärke", sedan val **B** ("som i Europa") och "Det är 5 - 10 arbetsdagar japan osv".

- **Två egna marknader i Shopify** (`konfig.json`): Japan (JPY, japanska `ja`) och Taiwan (TWD,
  traditionell kinesiska `zh-TW`), fri frakt i zonen "Japan och Taiwan", 5–10 arbetsdagar. Adresserna är
  `matstrumpor.com/ja` och `matstrumpor.com/zh-tw` (.com delas med Japan och Taiwan, `--steg domaner`).
  ⚠️ Planen "Shopify" gav två marknader till utan fel — README:ns gamla "Grow-planen ger inte fler
  marknader" stämde inte.
- **Priserna "som i Europa"** (`paslag.mjs` → `prisSomI`): närmaste snygga pris till Europas pris i
  dagens kurs, aldrig under golvet Sverige + 20 %. Japan ¥7 980 / 7 080 / donut 5 680 / pizza 8 580 /
  burger 5 680 / ätpinnar 1 080; Taiwan NT$1 690 / 1 490 / 1 190 / 1 790 / 1 190 / 209.
- **Översättningen** (207 texter per språk): sonnet-översättare per del (A–D) mot `REGLER.md` +
  `oversattning/REGLER-ASIEN.md`, en skeptisk infödd granskare per del (C och D parvis), alla fynd
  inlagda. De viktigaste fynden: Klarna finns inte i Japan eller Taiwan och är borttaget där (regel 13;
  texten sedan bygget, och sidfotens betalikoner sedan 2026-09-30 kväll — de visade Klarna, BLIK, iDEAL,
  Twint … för japanska och taiwanesiska kunder tills `domantema.mjs` → `BETAL_ASIEN` begränsade dem till
  kort, PayPal, Apple Pay, Google Pay och Shop Pay),
  två betydelsefel i japanska integritetspolicyn (klagorätten hos tillsynsmyndigheten, "verkställa
  överträdelser"), åldersgränsen "16 歲以下" (= 16 och yngre) i kinesiskan, 雙數 (läses "jämnt tal") →
  組合, 真正木頭筷子 → 實木筷子. `granska.mjs` kontrollerar skriften (förenklade tecken, kana i
  kinesiska, belopp, Sverige i fraktrad, スウェーデン製).
- **Svenskt varumärke i Japan** (Axels ord): hjältetexten börjar med 「スウェーデン発のブランド。」 och
  första stycket på Om oss säger det; annonsernas brödtext slutar med 「スウェーデン発のブランドです。」
  och en av rubrikerna bär vinkeln; Nathalie säger i videon att sushilådan sålde slut i Sverige.
  Aldrig スウェーデン製. Taiwan får samma rad som alla andra: 「來自瑞典的品牌。」.
- **Talet fyra säger vi aldrig i reklam** (四 = 死 på både japanska och kinesiska; regel 14):
  bildannonsen säger 「2つ買うともう2つ無料、合計20足」 / 「買二送二，共 20 雙襪子」 i stället för "fyra
  lådor", och `kolla-srt.mjs`, `kolla-egna.mjs` och `d3/annons.mjs` stoppar ett 四.
- **Temat:** `bygg.mjs --steg tema` byggde om tio filer med ja/zh-TW-grenar. ⚠️ Trust-raden bär sedan
  i dag både temapatchens språkgrenar och fraktrutans flagga (`domantema.mjs`), så steget kände inte
  igen filen ("någon har ändrat filen"). Det bygger nu `domantema(temapatch(original))` och jämför
  med det.
- **Läst som kund 2026-09-30** (Chromium, `?country=JP` / `?country=TW`): japanska/kinesiska, JPY/TWD,
  5足 ¥7,980 · 3足 ¥7,080 / 5雙 $1,690 · 3雙 $1,490, fraktrutan 「日本全国送料無料」 / 「全台免運費」
  med flaggan, 30日間返品OK / 30 天內可退貨. Kvar på svenska: Judge.me-recensionerna och rutan "Var
  först med att skriva en recension" (Judge.me känner igen nya språk inom ~24–48 h, se nedan) och
  collaget "Nu i hela världen" (en annan sessions sektion, grenen `claude/friendly-maxwell-cwfglq` —
  rubriken får ja/zh-TW av `domantema.mjs` tills collageverktyget är på `main`).
- **Spårningssidan, fraktmejlen, Trustpilot:** `sparning/sprak/ja.json` + `zh.json` (209 fraser),
  `sprak_extra` + `mejl_sprak` i `sparning/butiker.json` (med `spoks: false` — Spoks-mejlen går på
  engelska till Japan och Taiwan tills innehållet är översatt), tidszon Asia/Tokyo / Asia/Taipei och
  datumspann med månaden först (10月7日–14日). Fraktmejlen registrerade på ja och zh-TW (39 av 39
  lästa tillbaka). Trustpilot-raden på båda språken: japanska etiketten är Trustpilots egen
  (「ほぼ満足」), Taiwan får 「很好」 ur `ETIKETT_EGEN` eftersom Trustpilot saknar kinesiska, och båda
  skriver betyget med decimalpunkt. ✅ **Spårningssidan läst som kund 2026-09-30 15:00 CEST** efter
  rutinens första körning från `main`: allt på japanska och kinesiska utom sidans rubrik, som stod kvar
  på svenska ("Spåra ditt paket"). Sidans titel (`Page 183508730195`, nyckeln `title`) hade översättning
  på de elva andra språken men inte på ja/zh-TW, eftersom den ligger utanför underlaget. Den är nu
  registrerad med samma text som menyraden på språket (「配送状況を確認」 / 「追蹤包裹」), tillbakaläst.
  Läst om som kund: inga svenska rader. Ett nytt språk behöver samma rad.
- **Annonserna, åtta per marknad** (`annonser/JP.json`, `TW.json`; copy av sonnet mot copy-reglerna +
  `REGLER-ASIEN.md`, granskad av infödda): 001–003 Nathalie, Sofie H1 och Sofie H2 genom HeyGen i
  läget `precision` (`heygen/JP.json`, `TW.json`, SRT:erna i `heygen/srt/JP|TW/`), 004 012v2 med
  japansk/kinesisk bildtext, 005–007 röstvideorna haikuh3, haikuh2 och s001h1 med ElevenLabs
  (`egna/JP|TW/*.json`) och 008 bildannonsen D3 (`egna/d3/texter/JP|TW.json`). Katarina är inte med.
  Verktygen för skriften (Noto Sans CJK, kinsoku, tecken per sekund, bigram-lyssning) står i
  `heygen/README.md` → "Japanska och kinesiska". Den japanska granskaren fällde 17 rader i röstvideorna
  första gången; undertexten säger nu samma sak som rubriken som syns samtidigt (その一、…).
  ⚠️ **Rösten i 005–007 mättes replik för replik** (`pipeline/seglyssna.py`): röstkollen och
  helfilslyssningen var gröna, men 靴下 hördes som "ガックザ" och 襪子 som 蛙子 ("groda"). Japanskan
  läser nu uttalsfältet `las` (de svåra orden i hiragana), och Taiwan har den infödda rösten Anna Su
  med `eleven_turbo_v2_5`. Siffrorna står i `egna/README.md` → Språkkoder.
- ✅ **Japan uppladdat 2026-09-30, allt PAUSED:** kampanjen `MATSTRUMP_JP_SALES` 120251797899280023
  (CBO, platshållarbudget 1 000 kr/dag), adsetet `MATSTRUMP_JP_ugc` 120251797901800023 (JP, pixelns
  köp, 7 dagars klick) och 8 annonser, tillbakalästa: sidan Matstrumpor, Instagram-identiteten,
  länken `matstrumpor.com/ja/…?country=JP` och sista raden 「スウェーデン発のブランドです。」 i alla
  åtta. ⛔ Inget aktiveras förrän Axel granskat annonserna.
- ⛔ **Taiwan kräver verifierad annonsör (mätt 2026-09-30).** Taiwans bedrägerilag: varje annons som
  visas i Taiwan måste bära en verifierad förmånstagare och betalare. Utan kategorin svarade Meta 400
  "Värde för regionalt reglerade kategorier krävs … TAIWAN_UNIVERSAL", med kategorin 400 "Annonsör
  saknas: ange verifierad annonsör". Kampanjen `MATSTRUMP_TW_SALES` 120251796778420023 står PAUSED och
  tom, och de åtta annonsfilerna är klara. Vägen: `cowork/3-taiwan-verifiering.txt` (bolaget STONEBITE
  ECOM AB som förmånstagare och betalare, aldrig Axel som person; dokumentet laddar Axel upp själv),
  Meta granskar cirka två dagar, sedan `annonser/bygg.mjs --marknad TW --skarpt`. Verktyget skickar
  `regional_regulated_categories` ur `marknader.json` och identiteterna när id:na står där, och stoppar
  bara sin egen marknad med orsak. Inget publikt API listar id:na (facebook-java-business-sdk
  issue 493): vägrar Meta även efter verifieringen skapas adsetet `MATSTRUMP_TW_ugc` för hand i Ads
  Manager med förmånstagare och betalare valda, och `bygg.mjs` lägger annonserna i det och skriver ut
  id:na.

### Taiwans tull-ID — stopp för lanseringen (Axel 2026-10-01)

Axel: "vi borde inte launcha taiwan heller än pga en annan anledning och det är detta med att man behöver
ha ett speciellt spårningsnummer pga kina som kudnerna får fylla i i kassan". `marknader.json` →
`TW.lansering_stopp`, och `farAktiveras` (bygg.mjs + schemalagg.mjs) vägrar varje marknad med fältet.
Raden tas bort på Axels ord, när kassan tar emot uppgiften.

Utrett samma dag (läsning; källorna och citaten i `TAIWAN-TULL.md`):

- **Kravet är Taiwans tull, och det gäller alla avsändarländer.** Ett expresspaket till en privatperson
  deklareras på mottagarens namn och mobilnummer, och kunden ska vara registrerad i tullens app
  **EZ WAY 易利委** med sitt ID-nummer (身分證字號, eller 統一證號 för den som bor i Taiwan utan
  medborgarskap). **Sedan 2026-03-01 måste kunden dessutom godkänna varje paket i appen** (預先確認委任,
  「申報相符」) innan tullen tar emot deklarationen. Annars förs paketet inte in och kan skickas tillbaka
  inom sju arbetsdagar (空運快遞貨物通關辦法 art. 17 och 17-1; 關務署 pressmeddelanden 2025-12-19 och
  2026-02-24). Tullen har bett ombuden att inte fråga en registrerad kund efter ID-numret: namn + det
  registrerade mobilnumret räcker (關務署 FAQ). "Pga Kina" stämmer i praktiken: över 90 % av Taiwans små
  expresspaket kommer från Kina och Hongkong, och Matstrumpors paket går med YunExpress från Kina
  (523 av 525 paket i `sparning/butiker/matstrumpor/lage.json`).
- **Tullfritt:** tullvärde högst NT$2 000 och högst sex tullfria paket per person och halvår. Den enkla
  lådan (NT$1 690) ryms; "Köp 2 – få 2" (NT$3 380) blir tullpliktig för kunden om frakten inte är DDP.
  Axels regel "alltid noll moms och tull, det hanterar jag själv" gäller.
- **Shopify:** det finns ett eget kassafält för Taiwan, **"National ID Number"** (värdet hamnar i
  `order.localizedFields` som `SHIPPING_CREDENTIAL_TW`), men det är early access och slås bara på av
  Shopify Support — och då kommer fälten för Spanien (NIF/DNI) och Portugal (NIF) med i samma veva.
  Butiken har planen "Shopify", inte Plus, så egna fält i kassans informationssteg går inte. Andra
  vägar utan Plus: ett fält bara för Taiwan i varukorgen (cart attribute, som "AB paket" redan är),
  kassans text på zh-TW, ett kort på tacksidan, ett block i orderbekräftelsen eller obligatorisk telefon
  (gäller då hela butiken). Fraktbolaget behöver namnet och mobilnumret på etiketten.
- **Butiken säljer redan till Taiwan:** marknaden Taiwan är ACTIVE med fri frakt, och telefon är frivillig
  i kassan (24 av de 250 senaste ordrarna har nummer). 0 av 4 233 ordrar har gått till Taiwan eller
  Japan (läst 2026-10-01).
- **Japan har inget sådant krav.** Inget ID och ingen app för privatpersoners paket, och strumporna
  (6115.9x) ryms i den tullfria gränsen på 10 000 yen även med "Köp 2 – få 2" (¥15 960 × 0,6). ⚠️ Men
  leverantören har aldrig bekräftat att den skickar till Japan eller Taiwan, vad det kostar eller hur
  lång tid det tar (`LEVERANTOR-FRAGA-JP-TW.md`, parkerad på Axels ord 2026-09-30 tills en marknad sålt).

## Hela Europa + worldwide — Axels mål 2026-09-27 kväll (`/goal`)

Axels order: "vi ska ha hela Europa redo … worldwide redo för att lansera sushistrumporna",
"lite dyrare priser worldwide", USA "60 eller 70 dollar" för köp 1 – få 1, UGC = Nathalie och
Sofie (aldrig Katarina), "transkribera alla annonser", och det enda som får bli kvar för honom
är en liten Cowork-prompt. **Listan han skulle bekräfta** (skickad i chatten ~16:30 CEST):

| Marknad | Länder | Språk | Valuta | Fasta priser (5 par / 3 par / donut / pizza / burger / ätpinnar) |
|---|---|---|---|---|
| Norge | NO | nb | NOK | 449 / 349 / 299 / 399 / 299 / 49 |
| Europa (utökad) | EU 27 utom SE + IS, LI, CH = 29 länder | da, fi + **de, fr, nl, es, it, pl, pt** (en för resten) | EUR + lokala valutor | €44.90 / 34.90 / 29.90 / 39.90 / 29.90 / 4.90 |
| Engelska världen | US, GB, CA, AU, NZ | en | USD + lokala | $69 / 54.99 / 39.99 / 59.99 / 39.99 / 6.99 |

Shopifys Grow-plan ger inte fler marknader, därför en Europa-marknad med många språk (Shopify
tar max 20 språk; vi hamnar på 12). ⚠️ **Det stämde inte (mätt 2026-09-30):** butikens plan heter
"Shopify", och `marketCreate` skapade Japan och Taiwan som egna marknader utan fel (se "Japan och
Taiwan" nedan). Språken är 14 sedan dess. Domäner: **matstrumpor.no** och **matstrumpor.eu** köps,
**matstrumpor.com** finns — kopplas med `cowork/1-domaner.txt`, sedan `webPresenceCreate` +
`marketUpdate` per marknad. Frakt: ny zon "Europa" fri frakt (29 länder), "EU"-zonen (299 kr)
blir tom och tas bort, "Norden" döps om och behåller NO, "Internationell" behåller resten.

Allt ovan ligger i `konfig.json` och körs med `bygg.mjs --steg marknader,sprak,frakt,prislista
--skarpt` när Axel bekräftat listan (torrkört 2026-09-27 ~17:00 CEST, planen stämmer).

### Översättningarna till de sju språken — KLARA och granskade (2026-09-27 kväll)

`output/underlag-{de,fr,nl,es,it,pl,pt}.json`, 196 texter per språk, skrivna av 28
sonnet-agenter (fyra delar per språk: A = meny/startsida/produkter/FAQ/tema, B = sidor och
policyer, C = integritetspolicy-sidan, D = Shopifys PRIVACY_POLICY med Liquid) mot
`oversattning/REGLER.md` + `REGLER-EUROPA.md`, och **varje del granskad av en skeptisk
sonnet-granskare** (`GRANSKARE.md`, domarna i sessionens scratchpad `*.dom.json`; C och D
granskades parvis så att sidan och policyn använder samma juridiska termer). Rättningar som
granskarna fällde och som är inlagda: pl könsneutralt (inga `otrzymałeś`/`zadowolony`),
`liquid.ms-paket.par` → `pary`; de `Box` i berättelsen, `Datenschutzerklärung` i alla fyra
delar, `erheben`/`Übermittlung`, tyska citattecken „…“; fr `et` (inte `ou`), `stockage en
nuage`, `discriminerons`, `carte de paiement`; es `¿Les quedan bien a todos?`, `Según dónde
vivas`, `autoridades de control`; it `titolare del trattamento` för Shopify (D hade
`responsabile` = biträde), `carte di pagamento`, `Diritto alla cancellazione`; nl `mogelijke`,
`procedures op tegenspraak`, `klantenservice`, `regelgevende`. Titlarna i menyn (A) och på
sidorna (B/C) är likriktade per språk (`titelkoll` gav 0 konflikter). ⚠️ Två avsiktliga
avvikelser som varje granskare flaggade och som INTE är fel: fraktpolicyns "1–2 dagars
Postnord från svenska lagret" är struket i alla marknadsspråk (gäller bara Sverige; de redan
publicerade en/nb/da gör likadant), och presentkortets optionvärde `150,00 kr` står kvar
oöversatt i alla språk (Shopifys egen valör). **Shopifys opt-out-formulär ("Dina
integritetsval") bär sin kundtext i `data-*`-attribut** — de är översatta i alla elva språk;
nb/da hade svenska knappar live till 2026-09-27 kväll (omregistrerade, tillbakalästa, sedda som
kund: `Meld deg av` / `Afmeld dig`). Registreringen av de sju nya språken (`bygg.mjs --steg
sprak,oversattningar,kontroll,tema,publicera`) väntar bara på Axels ok på listan.

Kampanjkonfig för DE (DE+AT+CH), FR (FR+BE+LU), NL, ES, IT, PL, PT ligger i
`annonser/marknader.json` (platshållarbudget, PAUSED) med copy i `annonser/<KOD>.json` (alla
elva marknadskoder skrivna, tre-frågorstestet ✅), HeyGen-manifest per språk i `heygen/`.
**Alla svenska videoannonser är transkriberade lokalt** (faster-whisper `medium`): 69 av 86
videor fick SRT i `transkript/` (11 av dem är nästan tysta — musik/text, ska aldrig dubbas),
17 lämnade Meta inte ut (`source` saknas — id:n i `transkript/README.md`). HeyGen behövs
inte för transkriptet, bara för dubbningen, och den står still på API-krediterna.

## Start fredag 2026-10-02 00:01 — 14 kampanjer, 13 000 kr/dag (Axels ord 2026-10-01)

Axel: "ska vi skriva en ny prompt för att granska eller kan inte du bara schemalägga alla kampanjer
annars eller? Till 00:01 2 oktober elller?", sedan "Varför skulle vi inte schemalägga alla och japan.
Eller är det problem med japan?" (sessionens svar: inget problem med Japan, budgeten var bara aldrig
given). Han valde alltså bort sin egen granskning; granskningen 2026-09-30 hade läst alla 112 annonser
och fynden var rättade. `budget_beslut` i `marknader.json` bär hans ord för alla fjorton.

- **Med:** NO + NOB (500 + 500), DK, FI, US, WW (GB, CA, NZ), DE, FR, NL, ES, IT, PL, PT och JP, 1 000
  kr/dag var — 13 000 kr/dag, ≈ 91 000 kr/vecka.
- **De 16 Europaländerna utan eget språk** (Irland, Malta, Tjeckien, Ungern, Rumänien, Bulgarien,
  Kroatien, Slovakien, Slovenien, Litauen, Lettland, Estland, Grekland, Cypern, Island, Liechtenstein):
  ingen kampanj. Axel valde 2026-10-01 C, att vänta en vecka med de 14 ("Vi kan säkert lägga till fler
  sen"), före A, en egen engelsk kampanj för tolv av dem, och B, Irland + Malta i WW. Sajten visar dem
  engelska och landets valuta (mätt: HUF, RON). Grekland, Cypern och Island har dyrare frakt enligt
  leverantören.
- **Står kvar avstängt:** Norges annons 007 i A och B (`hall_av`: avslöjandet hörs "sukker", se
  `egna/README.md` → Granskningen 2026-09-30) — de andra sju går; Australien (se nedan, ⚠️ Australien);
  hela Taiwan (`lansering_stopp`, se "Taiwans tull-ID").
- **Två steg, eftersom Meta inte låter en starttid flyttas:** ett försök att sätta adsetets `start_time`
  till 00:01 svarade 400 "Det går inte att redigera starttiden om annonsuppsättningen redan har
  startats" — fast adseten aldrig levererat (de skapades med starttid = skapelsetid). Därför
  `annonser/schemalagg.mjs`:
  1. **Förbered** (2026-10-01 eftermiddag): adsetets länder synkas mot `geo`, annonserna (utom
     `hall_av`) och adsetet slås på, kampanjen står kvar PAUSED. Inget levereras och inget kostar,
     men Meta börjar granska annonserna (effektiv status `IN_PROCESS` under `CAMPAIGN_PAUSED`).
  2. **Starta** 00:01: `schemalagg.mjs --start 2026-10-02T00:01:00+02:00 --alla --skarpt --starta` slår
     bara på kampanjerna och läser tillbaka allt. Verktyget vägrar före starttiden − 2 minuter och efter
     starttiden + 6 timmar, och en kampanj vars adset inte är förberett. Väckningen är send_later
     `trig_01NVdXzi1vLMKY8id9FxzT9N` (22:01 UTC) in i sessionen som byggde det.
- Spärrarna är `bygg.mjs`:s (`farAktiveras`: lanseringsstopp, ⛔/platshållare i budgetbeslutet, fel
  länk) plus dagsbudgeten, som måste vara exakt `marknader.json`:s — en budget ändras aldrig i
  förbigående. Läget efter varje steg står i `annonser/schemalagt.json`.
- ⚠️ Förberedelsen tog över en timme: Meta strypte anropen (kod 17/613, upp till 2 minuters väntan per
  anrop) medan en utredning samtidigt provade `validate_only` mot samma konto. Kör inte tunga
  Meta-utredningar parallellt med en skarp körning.
- ✅ **Utfallet: igång fre 2/10 00:03–00:20, 14 av 15, tillbakaläst** (`annonser/schemalagt.json` →
  `starta`, skrivet 22:20:48 UTC). NO, NOB, DK, FI, US, WW, DE, FR och NL startade 00:03–00:07. Mitt
  i ES svarade Meta kod 17 i cirka 13 minuter, och verktygets egen väntan (30 s, sedan upp till 5 min)
  tog det utan omkörning. ES, IT, PL, PT och JP startade därför cirka 00:20. Varje kampanj var
  ACTIVE/ACTIVE med `marknader.json`:s budget, sammanlagt 13 000 kr/dag. Adseten var ACTIVE med rätt
  länder (WW: GB, CA, NZ). 110 annonser var på och Norges två 007 PAUSED. Meta visade inga problem på
  adseten. DE- och FR-annonserna med `?country=` var redan granskade (ACTIVE). TW rördes inte (inget
  adset, `lansering_stopp`). ⚠️ Mitt under strypningen visade kontots `x-business-use-case-usage`
  (ads_management, development_access) 3 % och 0 minuters väntan, och en läsning svarade 200. Koden 17
  kom alltså inte från kontots eget tak. Orsaken är inte fastställd.
- ✅ **Första dygnets felkoll, fre 2/10 13:05–13:20 CEST** (Axel strax före 13: "kampanjerna spenderar
  just nu fitt mycket pengar och kag hopas inte vi har massa fel"). Läs-bart, inget ändrat. **Inget fel
  som kostar pengar hittades.**
  - **Meta** (`/{kampanj}`, `/insights?date_preset=today`, `/ads`, `/adsets`): 14 kampanjer och 110
    annonser ACTIVE, ingen avvisad, inga `issues_info`, ingen `ad_review_feedback`, adseten på rätt länder
    (WW = GB + CA + NZ, DE = DE + AT + CH, FR = FR + BE + LU), TW PAUSED utan adset, Norges två 007 PAUSED.
    Spend kl 13:14: **16 768 kr, 36 köp, 22 473 kr** (Metas attribuering) = 129 % av de 13 000 kr/dag,
    varje kampanj 110–155 % av sin egen dagsbudget (13:05 var det 16 618 kr, alltså fortfarande cirka
    1 000 kr i timmen). 00:00–07:40 gick 8 906 kr (mätt i StonePNL-avsnittet nedan). Det är inget fel:
    Meta får dra upp till 75 % över dagsbudgeten en enskild dag men högst sju dagsbudgetar på en
    kalendervecka ([Jon Loomer om Metas budgetregel](https://www.jonloomer.com/updates-to-meta-ads-budgeting/)).
    Taket i dag är alltså cirka 22 750 kr för de 14. ⚠️ Kampanjerna startade en fredag, så veckotaket
    (söndag–lördag) håller inte tillbaka fredag och lördag; utjämningen märks först från söndag. Hela kontot
    13:13, med den svenska kampanjen (10 000 kr/dag, 4 617 kr, 16 köp): 21 367 kr, 52 köp, 32 060 kr.
  - **Shopify** (ordrar sedan 00:00 CEST, läst 13:08): **41 utlandsordrar, 25 528 kr**, i 14 länder: PT 10, JP 5,
    FI 5, US 3, ES 3, PL 3, CH 2, FR 2, DK 2, IT 2, CA, LU, BE och NL en var. Alla `PAID`, i landets valuta
    och språk, landningssidan i rätt språkmapp. Metas köp per kampanj är lika med Shopifys ordrar per land i
    PT, FI, US, PL, DK, IT, NL och WW (CA); JP, ES, DE (CH) och FR (FR + BE + LU) har en eller två fler
    ordrar i Shopify än i Meta. **Pixeln räknar alltså rätt.** **Norge: 0 ordrar** (NO 583 kr, NOB 592 kr;
    A hade 39 landningssidvisningar och 0 i varukorgen, B 25 och 2 till kassan). Sidan och kassan fungerar
    där (nedan), så det är för tidigt att kalla det ett fel.
  - **Länkarna:** 14 unika i de aktiva annonserna, en per kampanj. `geokoll.mjs --annonser` från riktiga
    datorer i varje land (13:10): **19 av 20 rätt** (200, sidans språk, landet i kampanjens geo, valutan,
    giltigt certifikat). US gav 429 (Shopifys botskydd mot proben), men tre riktiga US-ordrar kom samma dag.
  - **Köpflödet som kund, alla 14 kampanjer** (WW:s länk som brittisk kund med `?country=GB`;
    `granskning/kontroll-2026-10-01/prova.mjs` med
    landslistan utökad, mobil, 4 Mbit/s, CPU 4×, pixeln blockerad, aldrig betalt, 13:10–13:20): paketet K2F2
    → lådan öppnas inom 3–6,5 s → kassan på landets språk med paketets belopp och `SUSHI-K2F2` pålagd.
    **14 av 14 rätt:** NO A och B 938 NOK (`nb-no`), DK 686 DKK, FI/DE/FR/NL/ES/IT/PT 89,80 €, US $138.00,
    GB £108.00 (United Kingdom förvalt), PL 402,00 zł, JP ￥15,960. Inga 429, inga sidfel; konsolens
    `ERR_FAILED` är den blockerade pixeln. Beloppsregexen saknade £ och zł, så GB och PL lästes ur
    kassans text; `prova.mjs` bär sedan samma dag båda och alla annonslänkar
    (`node prova.mjs k "NO:F:B,NOB:F:B,DK:F:B,…"`, 15 s mellan körningarna i stället för 22 gick utan 429).
    Kassans dolda rubrik säger butiksnamnet "Matstrumpor.se" (syns inte, loggan är MATSTRUMPOR), samma i
    alla länder.
  - **Kanten som syns i ordrarna** är den kända från S-025: ändrar kunden antalet lådor i korgen följer
    ätpinnarna inte med. #5291 och #5295 (PT) fick tre lådor och två par, #5307 (ES) en låda och tre par
    gratis. Frågan A/B om att bygga om det ligger hos Axel.
  - Annonsvakten och akutlarmet går varje timme över kontot och hade 0 nya larm för Matstrumpor under
    dagen.

## StonePNL: vinsten per land (2026-10-02)

Axel skickade fredag morgon en skärmdump av StonePNL:s marknadsvy för Matstrumpor. Den hade fyra
noteringar, och alla fyra stämde:

- **"9,184 SEK of ad spend is on campaigns without a market"**: ingen kampanj i "nya kungen" hade
  något land i StonePNL. Det är en slutsats ur mätningen, inte avläst i appen: kl 07:40 hade kontot
  spenderat 9 650 kr sedan midnatt, varav 8 906 kr i de 14 nya kampanjerna och 744 kr i den svenska.
  9 184 kr är mer än de 14 nya ensamma, så även den svenska kampanjen låg utan land. StonePNL lägger
  hela kontots kostnad på "inget land" tills minst en kampanj är märkt (`harMarknader` i
  `meta.server.ts`), så inget land fick sin egen annonskostnad.
- **Nio länder "counted on the store's standard cost"**: StonePNL räknar varje land på Shopifys
  svenska kostnad (Cost per item) tills landet har en egen. Axels Big5-ark (`../cogs.json` → `big5`)
  fanns i repot men aldrig i StonePNL.
- **"cost missing on 6–13 % of sales"**: donut-, pizza- och hamburgarstrumporna saknar Cost per item i
  Shopify (läst 2026-10-02: tomt på alla tre, och på ätpinnarna). Sushistrumporna har 80,23 och 67,51 kr.
- **"Default duty used for …"**: standardtullen ligger på alla länder, också USA och Kanada, där
  arket säger dörr till dörr utan tullrad.

**Rättningen är `cowork/6-stonepnl.txt`** (StonePNL har inget API härifrån; allt ligger i appens egen
databas på Railway):

1. Tolv kampanjer får sitt land (SE, NO ×2, DK, FI, US, NL, ES, IT, PL, PT, JP).
2. Big5-priserna klistras in som ett leverantörssvar i StonePNL:s offertruta,
   `stonepnl/offertsvar-big5.txt`. Texten är byggd med StonePNL:s EGEN mall (`byggOffertmeddelande`
   ur `pnl-app/app/lib/offertforfragan.ts` på grenen `claude/bäverbutiken-settkopplingen-nba21z`,
   commit 297a078a) och provläst med appens egen läsare (`tolkaOffertsvar` + `offertTillRader`): 25
   rader (5 varianter × US, CA, GB, NZ, AU) i USD, inget pris stoppas, och Shopifys standardkostnad
   rörs inte. Variant-id:n är lästa ur Shopify samma morgon. Sushins 2 och 3 lådor räknas linjärt
   (arket har bara en låda), vilket överskattar kostnaden något.
3. Tullen 0 för USA och Kanada (och GB, NZ, AU om de står i listan).

⚠️ **DE-, FR- och WW-kampanjerna lämnas utan land med flit.** StonePNL tar ETT land per kampanj, och
Meta sprider deras spend jämnt. Mätt fredag morgon i Meta (`breakdowns=country`, sedan midnatt): DE
gav CH 302, DE 198 och AT 105 kr. FR gav FR 276, BE 219 och LU 46 kr. WW gav NZ 383, GB 307 och CA
293 kr. Vilket land man än valde hade hälften eller mer av kostnaden hamnat i fel land. Utan land står
de kvar i raden "without a market", och den raden är sann. Den rena lösningen är att StonePNL delar
kostnaden efter Metas egen landuppdelning. Det är en ändring i appen, och frågan ligger hos Axel.

**Priserna för resten av länderna kommer från leverantören, via StonePNL.** Länken "Ask your supplier
for these countries' prices →" i marknadsvyn bygger ett meddelande med varje såld variant och varje
land som saknar egen kostnad (läget "Also countries that use your standard cost"). Axel skickar det,
och leverantörens svar klistras in i samma ruta. Då fylls kostnaderna i av sig själva, också Sveriges
för donut, pizza och hamburgare. Parkeringen i `LEVERANTOR-FRAGA-JP-TW.md` ("vänta tills vi får
försäljning") är därmed hävd: fredag morgon hade JP, CH, PT, DK, ES och FR redan sålt.

✅ **Körd av Cowork fredag förmiddag** (Axels rapport): kortet säger "12 campaigns have a market"
(NO, NL, IT och PL fick läggas till med "Add a country code" först). Offertrutan gav "10 costs added
from the quote", och alla rader under "Not added" var de väntade: sushins 2 och 3 lådor räknas
linjärt, inget pris för 3 lådor, GB/NZ/AU är inga marknader i butiken, och standardkostnaden är tom.
Tullen är 0 för US och CA och står kvar efter omladdning. Marknadsvyn: "2,242 SEK of ad spend is on
campaigns without a market" i dag (DE, FR och WW). På 30 dagar är det 5 781 kr, och då ingår augustis
pausade kampanjer. DE, FR och WW visar "No spend last 30 days" eftersom 30-dagarsfönstret inte räknar
med i dag. **"cost missing" stod kvar för US (6 %) och CA (10 %), och det var ätpinnarna.** Mätt i
ordrarna: ätpinnarna är exakt 6,0 % av USA:s försäljning och 9,8 % av Kanadas. Deras Cost per item var
TOMT, inte 0, och StonePNL räknar tomt som saknat. Axel har sagt att de kostar 0 (`../cogs.json`), så
fältet sattes till 0 samma förmiddag via API (`inventoryItemUpdate`, tillbakaläst). Samma sak låg bakom
10–13 % i de andra länderna.

## Sajtgranskningen 2026-10-01: rättningarna (2026-10-02, `sajtfix.mjs`)

Axels order: "rätta allt rött och gult" i `granskning/SAJT-2026-10-01.md`. Temadelen sitter i
`sajtfix.mjs`, med 21 tester och butikens originalfiler i `sajtfix/original/` så att allt går att backa.
Den provades i en färsk kopia av MAIN, "PROV sajtfix 2026-10-02" `208247456083`, och lades sedan i
MAIN `207180890451`. Varje fil lästes tillbaka. Mätt som kund i Chromium på strypt mobilnät (PageSpeeds
profil och 4 Mbit/s, CPU ×4) och från riktiga länder med Globalping.

| Fynd | Läget | Hur |
|---|---|---|
| 🔴 S-001 köpknappen före paketväljaren | ✅ rättat | Knappen bär `data-ms-las` i HTML:en, och CSS stänger klick från första stund. Skriptet direkt efter knappen sätter `disabled`, och `ms-paket.js` låser upp när köplyssnaren sitter. Reserven låser upp vid DOMContentLoaded. Aldrig `disabled` i HTML:en: Dawn läser just det attributet ur den hämtade sektionen vid variantbyte. Varje kortgrupp har eget radionamn, och en dold väljare markerar aldrig ett kort. Mätt med v2 i 8 körningar (4 i kopian, 4 live, SE/DE/JP/DK, snabb och vanlig kund): knappen blev aldrig klickbar före paketväljaren (högst 3 ms, mätintervallet), korgen rätt (8 varor, koden, 798 kr / 89,80 € / ¥15 960 / 686 kr) och kassan lika med korgen i de 4 live. "Köp 2 – få 2" står kvar när skriptet släpps i SE, DE och JP. ⚠️ Låsets första version satt bara i ett skript efter knappen. Live på strypt nät kom HTML:en i bitar, och knappen syntes klickbar en kort stund innan skriptet kommit fram. Därför v2. |
| 🔴 S-002 / S-003, 🟡 S-012 / S-013 / S-014 / S-016, 🟡 S-006 | ✅ rättat i temat | `snippets/ms-flytt.liquid`, först i `<head>`, skickar utlandsbesökare på matstrumpor.se, matstrumpor.eu och myshopify-adressen till matstrumpor.com. Språkmappen behålls om länken hade en. Annars väljs webbläsarens språk, sedan landets. Landet sätts med `?country=` och är besökarens riktiga, ur Shopifys `server-timing` (`country;desc="DE"`), också där Shopify ger Europa-marknaden landet Sverige. Stannar: svenskar (server-timing SE, mätt från Sverige), svenska webbläsare utomlands, botar, `?country=` i adressen, korgen, kontot, temaredigeraren och den som själv valt Sverige från en annan av våra domäner (kakan `ms_stanna`). "Dina integritetsval" flyttas alltid, för Shopifys integritetspolicy länkar den på .se. Spoks-länkarna står kvar på .se med flit: temat ger dem besökarens RIKTIGA land, och en statisk `?country=` per språk hade gett österrikare DE. Mätt live: Spoks /nb-, /en- och /de-länkarna, myshopify-blocket, .eu och .no utanför Norge hamnar på .com i rätt språk. Svensk webbläsare, Googlebot, `?country=SE` och .com rörs inte. |
| 🟡 S-004 delningslänken | ✅ | Länken bär `?country=` utanför Sverige (`main-product.liquid` + `share.js`). |
| 🟡 S-005 juridiskt meddelande | ✅ | `juridiskt.mjs`: STONEBITE ECOM AB, org.nr 559576-2401 (Bolagsverket) och momsnumret SE559576240101 (giltigt i VIES 2026-10-02) på 14 språk, tillbakaläst. ⛔ VIES visar den gamla privatadressen, och den skrivs aldrig. Fullständigt Impressum och 特商法 (S-033) är Axels beslut. |
| 🟡 S-007 A/B-korten byts framför kunden | ✅ | `ms-ab.js` sätter synligheten medan sidan tolkas (MutationObserver), och CSS i `ms-head` gömmer fel variant så fort varianten satts på `<html>`. Mätt: variant b visar aldrig a:s kort (MAIN före rättningen: a:s kort 2,6–6,7 s). |
| 🟡 S-008 / S-009 | ✅ | Reservpriset i kundens valuta. Nätfel visas med den översatta raden, aldrig "Failed to fetch". |
| 🟡 S-010 Judge.me-märket | ✅ | Texten är dold utanför svenskan tills Judge.me ritat den (`.jdgm--done-setup`). |
| 🟡 S-011 GIF på 15,7 MB | ✅ redan borta | Filen låg i beskrivningen hos två ARKIVERADE produkter (`sushistrumpor`, `legease-…`), som svarar 404. Sushisidan laddar ingen fil över 2 MB (mätt 2026-10-02). Den tyngsta är typsnittet Mochiy Pop P One på 2,0 MB. |
| 🟡 S-015 / S-019 Shopifys mejl | ✅ | `mejl/notis-lankar.mjs`: `{{ shop.url }}` → språkets .com-adress i 806 översättningar (62 mallar × 13 språk). "(ending in …)" är japanska i fyra ja-mallar. Shopifys "下4桁"/"末四碼" är ersatta (26 översättningar), så ingen fyra står i ja/zh-TW-mejlen. |
| 🟡 S-017 / S-018 Spoks | ⏸ förberett | Belgien → franska och japanska (`ja.json`, sonnet + granskare) i repot. Flödena v2 byggs av en session med Spoks-connectorn: `klaviyo/spoks/PROMPT-matstrumpor-ja-be.md`. |
| 🟡 S-020 kassan på okänt språk | accepterat | Med en tjeckisk webbläsare öppnar kassan på `en-CZ` med svenska produktnamn, också med `/checkout?locale=en` (mätt). Det gäller bara språk butiken inte har, och ingen kampanj riktar sig dit. |
| 🟡 S-021 presentkortsbilden | ✅ | `presentkort-ja.png` och `presentkort-zh-TW.png` (rita.py med Noto Sans CJK) i Files, sedda som kund. |
| 🟡 S-022 ätpinnarnas sida | ✅ | `product.tillbehor` har strumpsidornas trust- och leveransrad (ja, zh-TW, danskans "returret"). |
| 🟡 S-023 TWD | ✅ | "NT$" i paketväljaren och på Liquid-priserna (`ms-cro.js`, bara i TWD). |
| 🟡 S-024 prisformaten | ✅ | Paketväljaren formaterar som Liquids `\| money` ur ett prov som Shopify själv formaterat i kundens valuta (`MS.pengaprov`). Mätt: €44,90, 469,00 kr, 343,00 kr, $126.00, ¥7,980, NT$1,690.00 och 201,00 zł bredvid köprutans samma. SEK "1,796 kr" krävde butikens pengaformat (`amount_no_decimals_with_space_separator`), som inte har något API: Cowork bytte alla fyra fälten 2026-10-02 med `cowork/7-sajtfix.txt` steg 1, och admin bekräftade. Mätt efteråt: Liquids prov på .se ger "1 234 568 kr", och fyrpaketets kort visar "1 796 kr". |
| 🟡 S-025 B-koden | ✅ Axels val B 2026-10-02 | "Ätpinnarna ska alltid vara gratis" (Axel). `b-koder.mjs --skarpt` gjorde `SUSHI-2FOR499` och `SUSHI-4FOR799` till belopp av **per vara**: 149,50 resp. 199,25 kr, räknat ur paketnivåerna (antal, fastpris, gåvan) och variantpriserna. Allt annat i koderna är orört och tillbakaläst. Mätt i Chromium i variant B: två lådor gav ätpinnarna 27,78 kr styck före och 0 kr efter, med lådan 249,50 kr och totalt 499 kr. Fyra lådor gav 22,25 kr före och 0 kr efter, med lådan 199,75 kr och totalt 799 kr. Kassan visar ätpinnarna som "GRATIS". Följden Axel valde: en låda utöver paketet får samma rabatt, så tre lådor med tvåpaketets kod kostar 748,50 kr i stället för 898 kr. Axel samma förmiddag: "ätpinnar ska alltid vara en gratis gåva som följer med varje enskild box". Variant B:s paket med en låda hade varken gåva eller kod. Det fick ett par ätpinnar och den nya koden `SUSHI-1FOR399`, köp en låda och få ett par gratis, upprepad för varje låda. Mätt: kortet visar 399 kr mot 449 kr, och korgen har lådan för 399 kr och ätpinnarna för 0 kr. `b-koder.mjs` kollar att alla tretton paket i butiken har lika många ätpinnar som lådor och att gåvan är gratis. Alla tretton klarar det. Originalen står i `b-koder.json`. `--aterstall --skarpt` lägger tillbaka dem, tar bort gåvan ur enlådspaketet och avslutar den nya koden utan att radera den. ~~Förut: `SUSHI-2FOR499` är "399 kr off" fördelat på strumpor och ätpinnar. Att ge ätpinnarna 0 kr kräver "amount off each item", och då blir en tredje låda 249,50 kr. Det är en rabattändring och Axels beslut.~~ |
| 🟡 S-026 polska bokstäver | ✅ | Polskan ritas i M PLUS Rounded 1c (latin-ext). Kassans typsnitt finns bara för hela butiken. Cowork bytte rubrikerna från Mochiy Pop P One till M PLUS Rounded 1c 2026-10-02 i den aktiva kassan, "Kopia av FixKliniken-konfiguration", och brödtexten stod redan på Standard. Coworks skärmdump av den polska kassan visar "Płatność" i ett och samma typsnitt. |
| 🟡 S-027 valutan på egen rad | ✅ | `nowrap` på korgens priser, sett på 390 px i DK, PL och NO. |
| 🟡 S-028 språkfel | ✅ | es "está", pt-PT i du-form (37 texter, `sajtfix/pt-tu.json`, sonnet + granskning), italienskt "9–16 ottobre". |
| 🟡 S-025 forts. korgen | ✅ 2026-10-02 eftermiddag | Ätpinnarna följer nu också när kunden ändrar antalet i korgen: avsnittet "Gåvan följer varje låda" nedan (`gava.mjs`). |
| 🟡 S-029 kommentarer i källan | ✅ | .no-blockets CSS-kommentarer borta (temat och `domantema.mjs`). Spårningssidans inbäddade skript byggs utan kommentarsrader (`sparning/sida.mjs` → `utanKommentarer`, med test); mätt live 2026-10-02 07:58 UTC efter rutinens runda: 0 träffar på CaraShell och bävernumret. ⚠️ Rättningen av S-002 lade själv in nya utvecklarkommentarer i källan på varje sida (omdirigeringsskriptet byggs ur `flyttMal`:s källtext, och kommentarerna inne i funktionen följde med). Sedan samma förmiddag byggs skriptet utan dem (`sajtfix.mjs` → `utanKommentarer`, test som jämför skriptets svar med modulens fall för fall), skrivet till MAIN och läst som kund: inga kommentarer, och .se, .eu och svensk webbläsare beter sig som förut. De fem `//`-rader som står kvar i sidkällan kommer från appar och Shopify. Temats skriptfiler (`ms-cro.js`, `ms-ab.js`, `share.js`) bär kvar sina `ms-sajtfix`-kommentarer: de nämner ingen butik och är patcharnas markörer. |

## Gåvan följer varje låda — också när kunden ändrar antalet (2026-10-02, `gava.mjs`)

Axels ord samma dag: "ätpinnar ska alltid vara en gratis gåva som följer med varje enskild box", och
sedan "JAg har redan asvarat A Och B" (S-025 val B, `b-koder.mjs`) och "du får fixa resten". Paketen
gav redan ett par per låda (b-koder.mjs, förmiddagen). Det här avsnittet är korgen efteråt.

**Felet, mätt i Shopifys egen prisräkning och i ordrarna (627 ordrar med lådor 3/8–2/10):**
- Köp-X-få-Y-paketkoderna (variant A, hela utlandet, donut/pizza/hamburgare) var "köp 1, få 3 av
  sorten + ätpinnar" (K2F2: köp 2, få 6), EN gång per order. Shopify ger de billigaste varorna gratis
  först, och ger en användning bara när hela "få"-mängden finns.
- Samma paket två gånger: 4 lådor + 4 par kostade **1 646 kr** i stället för 798 (ätpinnarna åt upp den
  gratis lådan; Storefront-cart med `SUSHI-K1F1`).
- Två olika paket: bara en kod räknas, och den andra sortens ätpinnar åt upp den gratis lådan.
  #5214 betalade **1 746 kr** för 2 sushi + 2 pizza, #5302 **2 094 kr** för tre tvåpaket.
  32 av 627 ordrar hade flera sorter.
- Ändrat antal: en tredje låda fick inga ätpinnar (69 av 627 ordrar hade inte lika många par som lådor).
  Ätpinnarna borttagna: hela paketrabatten försvann (#5255 i USA och #5056 i Sverige betalade två lådor fullt).
- Variant B: `SUSHI-2FOR499`/`-4FOR799` har en minsta summa. Färre lådor än paketet ⇒ ingen kod, och
  ätpinnarna kostade 50 kr.

**Shopifys regler, mätta med dolda testkoder i Storefront-API:ts cart (samma räkning som kassan, prov 3–5;
koderna avslutades efter varje prov, aldrig raderade):**
1. Köp-X-få-Y: "köp"-varorna är de dyraste som finns kvar, "få"-varorna de billigaste, och en användning
   gäller bara med HELA "få"-mängden. Därför går köp 1 få 1 + ett par per låda att ge med EN kod bara för
   jämnt antal: "köp 1, få 3 av alla sorter + ätpinnar, utan gräns". Udda antal kräver en kod per antal.
2. Flera koder som inte kombineras: Shopify väljer själv den som ger lägst pris, ordningen spelar ingen
   roll, och kassan visar bara koden som används (skärmdump av kassan).
3. **Högst fem koder räknas.** En sjätte kod i vagnen räknas inte alls (vännens kod som sjätte gav inget
   avdrag; som första gav den 50 kr).
4. `/cart/update.js` tar `updates`, `discount` (kommalista, ersätter koderna) och `sections` i ett och
   samma anrop, och svaret bär lådan exakt som vagnen blev. En separat hämtning direkt efter en skrivning
   kunde visa vagnen från före den. Lådan ritas tom via produktsidans adress (`/products/…?sections=`),
   rätt via roten.
5. Shopify delar en variant på flera rader när en rabatt bara gäller en del av den (1 låda + 2 par = en
   gratis och en betald rad), och `updates` med variant-id ändrar bara den första raden ⇒ radnycklar.

**Det som gjordes:**
- **Koderna, 12:39 UTC** (`gava.mjs --koder --skarpt`, originalen i `gava/koder.json` först): de åtta
  köp-X-få-Y-paketkoderna (`SUSHI/DONUT/PIZZA/HAMBURGARE-K1F1/K2F2`) är "köp 1, få 3 av alla fyra sorter
  + ätpinnar, utan gräns" och heter som förut. Titeln i admin säger det. Nya hjälpkoder för udda antal:
  `PAKET-1`, `PAKET-3`, `PAKET-5` (köp 1/2/3, få 1/4/7, en gång per order). Alla kombineras med vännens
  kod som förut. Ingen av dem ger mer än det sidan redan lovar, om någon skriver in den själv.
- **Temat, 13:11 UTC i MAIN `207180890451`**, provat först i kopian "PROV gåvan 2026-10-02" `208271376723`
  (`gava.mjs --tema`, butikens filer i `gava/original/`):
  - `assets/ms-gava.js` (+ `snippets/ms-gava.liquid`, renderad sist i `ms-head`): efter varje ändring i
    korgen blir ätpinnarna lika många som lådorna, och koderna som hör ihop ligger i vagnen: en
    paketkod + `PAKET-1/3/5`, eller B-nivåernas tre. Vännens kod och andra koder först, aldrig fler än fem.
    Sorterna, gåvan och koderna läses ur metaobjekten (Paketnivå), inte ur koden.
  - `ms-paket.js` `kop()`: synken körs efter koden och före lådan, så lådan visar slutpriset direkt.
  - `cart-drawer.liquid` och `main-cart-items.liquid`: gåvoraden är låst — inget plus/minus, ingen papperskorg.
- **Mätt efteråt, live:** `gava/prisprov.mjs` 21 av 21 fall ✅ (SE, DE, US, JP, NO, variant B 1–4 lådor,
  blandade sorter). `gava.mjs --kundvy` i Chromium som kund, varje steg läst ur vagnen OCH lådan:
  variant A 2 → plus 3 → plus 4 → minus 3 → minus 2 → minus 1 → papperskorg (399 / 798 / 798 / 798 /
  399 / 399 / 0 kr, ätpinnarna 2-3-4-3-2-1-0), samma paket två gånger 798 kr, variant B 1 → 4 → 3
  (399 / 499 / 748,50 / 799 / 748,50), Tyskland €44,90 → €89,80, korgsidan plus 798 kr, sushi + pizza 898 kr.
  `b-koder.mjs`: alla tretton paket ger fortfarande gåvan gratis.

**Följderna — sessionens beslut åt Axel ("du får fixa resten"), alla till kundens fördel eller lika:**
- Köp 1 få 1 gäller nu varje antal: 3 lådor betalar 2 (som förut), 6 lådor betalar 3 (förut 4).
  ⚠️ 7 och 9 eller fler udda lådor: en låda för mycket (`PAKET-7` hade tagit vännens plats bland fem koder).
  Ingen order de senaste 60 dygnen hade fler än sex lådor.
- Blandade sorter: EN köp 1 få 1 över alla sorter, de billigaste lådorna gratis. 2 sushi + 2 pizza =
  898 kr (pizzorna betalas). Förut 1 746 kr; per sort hade varit 848 kr, men två koder som inte kombineras
  kan inte ge det.
- Variant B: korgen har alltid priset för antalet lådor — 1 = 399, 2 = 499, 3 = 748,50, 4 = 799 kr. Den
  som ökar från två till fyra lådor i korgen betalar alltså 799 kr, inte 998.
- ⚠️ En vagn som ändras FÖRBI temat (rena API-anrop) med färre ätpinnar än lådor kan få fler gratis lådor
  än paketet. Det gick redan förut (4 lådor utan ätpinnar med `SUSHI-K1F1` = 399 kr). Temat låser gåvoraden
  och synkar vagnen på varje sida.

**Backa:** `node matstrumpor/marknader/gava.mjs --aterstall --skarpt` lägger tillbaka koderna ur
`gava/koder.json`, avslutar `PAKET-1/3/5` (raderar aldrig) och tar bort temats ändringar (torrt först
utan `--skarpt`). Prova en ändring: `--kopia`, sedan `--tema <gid> --skarpt` och `--kundvy --tema <gid>`.
⛔ En ny köp-X-få-Y-paketkod måste ha samma form ("köp 1, få 3 av alla sorter + ätpinnar, utan gräns") —
`gava.mjs` torrt visar avvikelsen. 18 tester i `test/gava.test.mjs` (modellen mot Shopifys priser,
synken i en vm, patcharna fram och tillbaka).

## Kampanjerna i kontot — läget 2026-09-30 kväll: 15 kampanjer, 112 annonser, alla PAUSED

Läst ur kontot med `annonser/bygg.mjs --lage` (id:n och annonserna i `annonser/lage.json`, länkarna
i `annonser/marknader.json`). Sida `1285064981363590` "Matstrumpor" och Instagram-identiteten
`17841423405715219` på alla 112, länken går till matstrumpor.com utom B-sidan.

| Kod | Kampanj | Id | Länder | Språk | kr/dag | Annonser | Länk |
|---|---|---|---|---|---|---|---|
| NO | `MATSTRUMP_NO_SALES` | 120251749551520023 | NO | nb | 500 (A/B) | 8 | .com/nb |
| NOB | `MATSTRUMP_NOB_SALES` | 120251777339520023 | NO | nb | 500 (A/B) | 8 | matstrumpor.no |
| DK | `MATSTRUMP_DK_SALES` | 120251749599180023 | DK | da | 1 000 | 8 | .com/da |
| FI | `MATSTRUMP_FI_SALES` | 120251749604200023 | FI | fi | 1 000 | 8 | .com/fi |
| US | `MATSTRUMP_US_SALES` | 120251749609010023 | US | en | 1 000 | 8 | .com |
| WW | `MATSTRUMP_WW_SALES` | 120251749612350023 | GB, AU, CA, NZ | en | 1 000 | 8 | .com |
| DE | `MATSTRUMP_DE_SALES` | 120251750242530023 | DE, AT, CH | de | 1 000 | 8 | .com/de |
| FR | `MATSTRUMP_FR_SALES` | 120251750244370023 | FR, BE, LU | fr | 1 000 | 8 | .com/fr |
| NL | `MATSTRUMP_NL_SALES` | 120251750246440023 | NL | nl | 1 000 | 8 | .com/nl |
| ES | `MATSTRUMP_ES_SALES` | 120251750248310023 | ES | es | 1 000 | 8 | .com/es |
| IT | `MATSTRUMP_IT_SALES` | 120251750250830023 | IT | it | 1 000 | 8 | .com/it |
| PL | `MATSTRUMP_PL_SALES` | 120251750321130023 | PL | pl | 1 000 | 8 | .com/pl |
| PT | `MATSTRUMP_PT_SALES` | 120251750324340023 | PT | pt-PT | 1 000 | 8 | .com/pt-pt |
| JP | `MATSTRUMP_JP_SALES` | 120251797899280023 | JP | ja | 1 000 (platshållare) | 8 | .com/ja |
| TW | `MATSTRUMP_TW_SALES` | 120251796778420023 | TW | zh-TW | 1 000 (platshållare) | **0** | .com/zh-tw |

- **Budgeten:** Axels 1 000 kr/dag per kampanj (2026-09-27 kväll) gäller NO–PT; Norge delas 500 + 500 i
  A/B-testet. JP och TW bär en platshållare som `--aktivera` vägrar tills Axel sagt en budget.
- **TW är tom med flit:** åtta annonsfiler är klara i `annonser/TW.json`, men Meta vägrar adsetet tills
  bolaget är verifierad annonsör i Taiwan (se Japan och Taiwan).
- **En kampanj per språk, inte per land** (Axel 2026-09-29: "en kampanj per marknad borde bli bäst").
  Länder med samma språk delar kampanj (DE + AT + CH, FR + BE + LU, GB + AU + CA + NZ), och inget land
  ligger i två kampanjer. Shopifys marknad Europa bär 29 länder, och 13 av dem har en kampanj. De 16 utan
  kampanj (IE, GR, CZ, HU, RO, BG, HR, SK, SI, LT, LV, EE, MT, CY, IS, LI) kan handla i butiken men får
  inga annonser: deras språk är inte översatt. Irland och Malta (engelska) och Liechtenstein (tyska)
  skulle kunna läggas i WW respektive DE utan ny översättning.
- ⚠️ **Tre gamla kampanjer från augusti ligger kvar i samma konto** (granskningen G-F07):
  `MATSTRUMP_SALES AU` 120251251965440023, `MATSTRUMP_SALES UK` 120251251897940023 och
  `MATSTRUMP_SALES_US_20260828` 120251241772530023. Kampanjerna är PAUSED, men deras adsets och 155 annonser
  står ACTIVE och länkar till sushisock.com (den gamla engelska butiken, sidan `1229557150250240`). Ett
  klick "slå på allt" på kampanjnivå startar alltså 3 000 kr/dag till en annan butik, i länder som US och
  WW redan bär. Rör dem aldrig härifrån. Arkiveringen är Axels klick i Ads Manager.
- ⚠️ **Flerlandskampanjernas länkar saknar `?country=`** (DE, FR, WW: ett adset bär flera länder). Från
  containern (amerikansk IP) svarar `/de/…` utan land med 429/engelska, med `?country=DE` tyska och
  `localization=DE` (mätt 2026-09-30 kväll, granskningen G-D02, sänkt till 🔵 vid dess andra prövning).
  Shopifys marknad Europa bär `de` och `fr` på matstrumpor.com, så en tysk IP bör stanna på tyska — men
  det går inte att mäta härifrån. Pröva länken via en tysk/fransk VPN innan DE/FR slås på.
- ⚠️ **Australien kräver verifierad annonsör och betalare** (granskningen G-A01, `issues_info` på
  WW-adsetet `120251749614670023`: SOFT_ERROR 3858810). Samma sorts krav som Taiwan. Om Meta då stoppar
  bara AU eller hela adsetet går inte att läsa ur API:t, och det prövas aldrig genom att slå på.
  **Utrett 2026-10-01 och löst för UK/Kanada/NZ:** felet heter på engelska "Universal regulation Ads
  Targeting Regulated Countries (Australia) without verified Identities … Verified advertiser and payer
  required" — inte finansregeln. Metas Verifieringar i kontot har bara raden "Australien (annonser för
  finansiella tjänster)" (Cowork, `cowork/4-judgeme-australien.txt`), och den är fel väg; kontots allmänna
  "Standardannonsör och standardbetalare" gäller alla regioner, även de svenska kampanjerna, och rörs inte.
  API:t tar emot kategorin `AUSTRALIA_UNIVERSAL` (bara prövat med `execution_options: ["validate_only"]`,
  som inte kontrollerar identiteterna); nyckelparet är troligen `universal_beneficiary`/`universal_payer`
  (det finns inga `australia_universal_*`). Bara WW bar felet, och de tre gamla AU-adseten från augusti
  (sushisock.com) bär det inte, så kravet syns på adset som skapats eller ändrats efter början av
  september. **Australien togs ur WW 2026-10-01** (förberedelsen till starten, `marknader.json` →
  `WW.geo = GB, CA, NZ` och `geo_vantar.AU`), och felet försvann samma minut: 0 av 37 adset i kontot bär
  `issues_info` (läst ~11:30 UTC). Australien läggs tillbaka när Meta godkänt STONEBITE ECOM AB, som
  Taiwan väntar på — Taiwan-check-in:en `trig_013nZKYRvQ3P52ANsT5QuZFd` bär steget.

## Kampanjerna i kontot — historik: bygget 2026-09-27 ~16:00 CEST (ersatt av tabellen ovan)

Axels order: "Nu har api tillgång också. Bygg upp alla kampanjer. Bygg upp worldwide kampanj.
Förbered usa kampanj med alla nya ads vi inte hade innan och UGC heygennad. Katarina får vi
inte köra i andra marknader så heygenna inte dom." `annonser/bygg.mjs --alla --skarpt`
skapade i nya kungen (CBO, OUTCOME_SALES, lowest cost, ett adset var — spegel av SE-adsetet
`09-17 UGC` med marknadens länder):

| Kod | Kampanj | Id | Länder | Språk | Budget |
|---|---|---|---|---|---|
| NO | `MATSTRUMP_NO_SALES` | 120251749551520023 | NO | nb | **1 000 kr/dag — Axels** |
| DK | `MATSTRUMP_DK_SALES` | 120251749599180023 | DK | da | 1 000 kr/dag — Axels (kväll; var platshållare) |
| FI | `MATSTRUMP_FI_SALES` | 120251749604200023 | FI | fi | 1 000 kr/dag — Axels (kväll; var platshållare) |
| US | `MATSTRUMP_US_SALES` | 120251749609010023 | US | en | 1 000 kr/dag — Axels (kväll; var platshållare) |
| WW | `MATSTRUMP_WW_SALES` | 120251749612350023 | NO, DK, FI, US, GB, AU, CA, NZ | en | 1 000 kr/dag — Axels (kväll; var platshållare) |
| DE | `MATSTRUMP_DE_SALES` | 120251750242530023 | DE, AT, CH | de | 1 000 kr/dag — Axels (kväll) |
| FR | `MATSTRUMP_FR_SALES` | 120251750244370023 | FR, BE, LU | fr | 1 000 kr/dag — Axels (kväll) |
| NL | `MATSTRUMP_NL_SALES` | 120251750246440023 | NL | nl | 1 000 kr/dag — Axels (kväll) |
| ES | `MATSTRUMP_ES_SALES` | 120251750248310023 | ES | es | 1 000 kr/dag — Axels (kväll) |
| IT | `MATSTRUMP_IT_SALES` | 120251750250830023 | IT | it | 1 000 kr/dag — Axels (kväll) |
| PL | `MATSTRUMP_PL_SALES` | 120251750321130023 | PL | pl | 1 000 kr/dag — Axels (kväll) |
| PT | `MATSTRUMP_PT_SALES` | 120251750324340023 | PT | pt (`/pt/`) | 1 000 kr/dag — Axels (kväll) |

Worldwide länkar till `/en/products/sushi-strumpor` utan `?country=` — Shopify väljer marknad
efter kundens IP, så en dansk ser engelska + DKK. Sverige ingår inte (egen kampanj). **Annonserna
ligger i sedan 2026-09-28/29 — 36 st, 3 per kampanj, alla PAUSED** (se "Annonserna i kontot"
nedan). **Axels budgetbeslut 2026-09-27
kväll: alla kampanjer 1 000 kr/dag** ("Worldwide kanske vi kan börja på 1000kr per dag. Sen
respektive kampanjer 1000kr per dag också") — men ⛔ **ingen kampanj aktiveras förrän Axel
granskat annonserna** ("jag vill inte att du aktiverar kampanjerna i meta för ens jag har
granskat alla"); `--aktivera` körs aldrig utan hans ord. Sista raden i varje marknads brödtext
är sedan samma kväll "svenskt varumärke"-raden (`A Swedish brand.` / `Eine schwedische Marke.`
…, Axels beslut: "Svenskt varumärke? … Jag tycker definitivt vi gör så!" — CaraShell-principen),
utan butiksnamnet, så regeln "butikens namn står aldrig i en annons" håller. Läget i kontot:
`annonser/lage.json`, `bygg.mjs --lage`. Metas rate limit slog till mitt i bygget (kod 17,
backoff 30/60/120 s …) — bygget tar en kvart för sju kampanjer, inte en minut.

## Annonserna i kontot — historik: de första 36 (2026-09-28/29), alla PAUSED

(Läget nu: åtta per kampanj, 001–008, se tabellen ovan.)

Varje kampanj har tre annonser med Axels egen UGC, gjord i HeyGens **dyraste läge (`precision`)**
på kampanjens språk (WW bär de engelska): `MATSTRUMP_<KOD>_sushi_gift_ugc_001_v1` (Nathalie),
`…_gift_ugc_002_v1` (Sofie H1), `…_jul_ugc_003_v1` (Sofie H2). Katarina ingår aldrig. Id:n i
`annonser/lage.json` (tillbakaläst ur kontot) och `annonser/videor.json` (vilken fil varje annons
bär, sha256). NO och NL laddades först upp med speed-renderingar och fick precision-videon
inbytt i samma annons (`bygg.mjs --byt-video`: ny creative, tillbakaläst, fortfarande PAUSED).

**QA, alla 33 videor (11 språk × 3):** röstkollen grön på alla; Whisper hör marknadens språk i
alla 33 (sannolikhet 0,93–1,0), 77–100 % av textens ord hörs, rösten ligger inom 21 % av
källans tonhöjd. Svenska inbrända texter suddade bara i sin ruta medan de syns (`--rutor`) och
marknadens text inbränd. Texterna som renderades: `heygen/srt/<KOD>/`. Kostnad: ungefär 49 USD
för 32 precision-sessioner + 31 renderingar (13 148 → 10 218 API-enheter, 60 enheter = 1 USD;
den 33:e, norska Nathalie, var provet). Hela flödet: `heygen/README.md`.

⛔ **Inget är påslaget.** Axel granskar annonserna först; `--aktivera` vägrar så länge
budgetbeslutet i `marknader.json` bär "tills Axel granskat".

### Den fjärde annonsen: 012v2, egen video utan röst (2026-09-29) — 12 st, alla PAUSED

`MATSTRUMP_<KOD>_sushi_gift_anim_004_v1` finns i alla tolv kampanjer (WW bär den engelska). Den
svenska `MATSTRUMP_sushi_gift_ugc_012v2_v1` (2 073 kr, 5 köp, under break-even i Sverige) består
av sju AI-bilder med orange textrutor och ingen röst. Allt byggdes med egna verktyg, aldrig
HeyGen (Axels order 2026-09-28):

- Samma sju rutor ritas med marknadens text (`egna/rendera-012v2.py`).
- Texten är skriven av sonnet och dömd av en skeptisk infödd granskare. NO, FI, IT och PT
  underkändes i tredje rundan på en rad var, och granskarens eget förslag lades in.
- Loggan "MATSTRUMPOR.SE" är bortmålad ur sista scenen (`pipeline/logga.py`). De sju första
  laddades upp med loggan och fick videon utbytt i samma annons.

Allt är tillbakaläst PAUSED. Detaljerna står i `egna/README.md`. Röstvideorna haikuh3, haikuh2
och s001h1 blev annons 005–007 med ElevenLabs-röst i en egen session
(`egna/PROMPT-elevenlabs.md`, PR #266).

### Annons 008: bildannonsen D3 "Köp 2 – få 2" (2026-09-29) — 13 st, alla PAUSED

`MATSTRUMP_<KOD>_sushi_offer_static_008_v1` finns i alla tolv kampanjer och i B-kampanjen i
Norge. WW bär den engelska. Bilden visar sex lådor i en pyramid med ordmärket, en underrad och
det röda pillret "Köp 2 – få 2 gratis" på marknadens språk. Texten ritas som skarp text ovanpå
den textfria basen (`egna/d3/rita.py` på `egna/d3/bas.png`). Bildmodellen ritar aldrig text.

- Texterna skrevs av sonnet mot copy-reglerna och granskades av infödda granskare per språk. De
  ligger i `egna/d3/texter/<KOD>.json`, med tre-frågorstestet.
- Granskningen fällde bland annat rad 1, som beskrev "fyra lådor på bordet" fast bilden visar sex.
  Nu säger raden vad kunden får: "Du får fyra lådor".
- `egna/d3/annons.mjs` ritar bilderna och lägger in annonsen i `annonser/<KOD>.json`. Den stoppar
  om sista raden inte är kampanjens varumärkesrad, om butiken, en domän eller ett pris står i
  texten, och om tre-frågorstestet har ett ❌.
- Bilderna i `annonser/klar/*_d3.jpg` är gitignorerade (de ritas om med `annons.mjs --skriv`).
  Deras hash står i `videor.json`.

⚠️ **HeyGen-nyckeln sitter på kontot `subscriptions@stonebite.org`** (Axel Odhner, mätt
`GET /v1/user/me` 2026-09-27 kväll): `billing_type: wallet`, **saldo 0,10 USD, ingen
prenumeration på det kontot**. Det är därför API:t svarar "Insufficient credit … requires 'api'
credits" fast `remaining_quota` visar `plan_credit: 2000` — planens krediter ligger inte i
API-plånboken. Axel fyller på plånboken på det kontot (app.heygen.com → Settings → API/Billing)
eller lägger en API-nyckel från kontot som bär prenumerationen i `HEYGEN_API_KEY`.
✅ **Löst 2026-09-28:** Axel fyllde på plånboken (243 USD vid start, 170 USD kvar efter alla 33).

## Norge först — Axels budget 1 000 kr/dag (2026-09-27), förberett men stoppat på HeyGen

Axels svar 2026-09-27: "1000kr per dag" för Norge, och regeln "alla UGC-videor översätts med
den dyraste versionen på HeyGen; annars kör vi bara våra egna HeyGen" (egna avatarvideor
görs om direkt på norska, översätts inte). Allt ligger i **`norge/`** — `README.md` där är
körordningen. Gjort: de fyra UGC-källvideorna hämtade ur kontot (Nathalie = vinnaren, Katarina
×2, Sofie H1; `kallor.json`), HeyGen-batchen skapad (`norge.json`, marknad NO, "Norwegian
Bokmål (Norway)"), norsk annonstext från sonnet mot copy-reglerna (`annonser.json`), och
`upp.mjs` som bygger `MATSTRUMP_NO_SALES` (CBO 1 000 kr/dag, OUTCOME_SALES, lowest cost) +
adsetet `MATSTRUMP_NO_ugc` (Norge, 18–65, Advantage+ audience, köp via pixeln, 7d klick —
speglar SE-adsetet `09-17 UGC`) + annonserna, allt PAUSED, med `--aktivera` som slår på
bara det körningen själv skapat.

⛔ **Stoppat, mätt 2026-09-27 ~15:00 CEST:**
1. **Meta:** `META_ACCESS_TOKEN` läser nya kungen men får inte skriva — `Permissions error
   … kontaktar du en administratör för att få behörighet med rollen Annonsör eller högre …
   ads_management`. Systemanvändaren "API LONG TERM" (Business Manager SnarkLös) har bara
   läsrätt på Matstrumpors konto. Axels klick: Business Manager → Matstrumpors konto "nya
   kungen" → ge SnarkLös/systemanvändaren **Hantera kampanjer** (Annonsör). Alternativet är
   Adsmanager-MCP:n i en session Axel startar (samma väg som `/matstrumpor`).
2. **HeyGen:** alla fyra proofread-sessionerna föll på `Insufficient credit. This operation
   requires 'api' credits` — medan `/v2/user/remaining_quota` sa `api: 6` före och efter.
   Samma mönster som 2026-08-29 (47 sessioner). API-krediterna köps på app.heygen.com
   (Settings → Subscriptions & API). Sessionerna återskapas av sig själva vid nästa
   `proofread`-körning.

✅ **Båda lösta:** token:en skriver i nya kungen sedan 2026-09-27 ~15:30 CEST, och HeyGen-
plånboken fylldes på 2026-09-28. Norges tre annonser ligger PAUSED (se "Annonserna i kontot").

## Annonserna i 20–30 länder — planen (inte byggd)

Kontot är det svenska "nya kungen" (SEK) — så gjordes US/UK/AU i augusti, och det
fungerade tekniskt (pixeln är butikens, köpen bokförs rätt). "Norge" `1418612340124566`
och "Finland DK" `1356652809967926` saknar betalmetod och nås inte av token.

Rutinen som saknas är `/ops-oversatt` för Matstrumpor: SE-vinnarna i hubben →
`pipeline/translate-batch.mjs --marknad <M>` (HeyGen för video, `translate-images` för
bild) → en kampanj per land i nya kungen (`MATSTRUMP_<LAND>_SALES`, geo = landet,
länk `https://matstrumpor.com/<språk>/products/<handle>?country=<LAND>`) → annonsnamn
`MATSTRUMP_<LAND>_sushi_<vinkel>_<format>_<nnn>_v<n>`. Break-even per land ur
`cogs.json` via `kor.mjs --ekonomi --marknad <LAND>` (talen rör sig med kursen och priserna:
US 1,22 · GB 1,17 när planen skrevs 2026-09-27, 1,182 / 1,137 vid granskningen 2026-09-30;
citera aldrig ett gammalt tal). Byggs
som `/matstrumpor-marknader` när Axel sagt budget per land — augustis test låg under
break-even i alla tre länder, och den frågan är hans.

## Produktbeskrivningen på tretton språk (2026-10-02)

Den svenska beskrivningen på `sushi-strumpor` byttes 2026-10-02 (Fables copy i Axels struktur
Problem → gif → Lösning → gif → Funktioner → bild → Garanti, utan statistikmeningar;
`matstrumpor/produktsida.mjs`). Samma dag fick de tretton språken den nya texten plus de tolv
nycklar som tillkommit sedan 09-30 (paketkorten `paket.sushi-paket-1/2/4.*`, `policy.LEGAL_NOTICE.body`,
`sida.enkat.title`) och startsidans rubrik med `<em>`. Flödet: `underlag.mjs` → källan
`output/delar/2026-10-02-sv.json` (14 nycklar) → en sonnet-översättare per språk → en skeptisk
infödd granskare per språk som rättade direkt i `output/delar/2026-10-02-<locale>.json` (3–6
rättningar per språk: kalkeringar, fel genus, "agarrar" i Spanien, "afhaalbak" → "afhaalbakje",
citatet omskrivet så det låter som en kund) → `merge-delar.py` (scratchpad) in i
`output/underlag-<locale>.json` med `granska.mjs` 0 fel → `bygg.mjs --steg oversattningar --skarpt`
(170–181 texter per språk) → `--steg kontroll`: **13 av 13 "ligger som i filen, 0 saknas, 0 avviker"**.
Läst som kund via curl: en och nb visar de nya rubrikerna; de och ja fick Shopifys "Verifying your
connection" (botspärren efter många anrop), API-tillbakaläsningen är facit där.

Kvar: en läcka per språk, paketresursen `466474533203` `gratis_text` "Äkta ätpinnar i trä (1 par)"
(ett paketkort som `underlag.mjs` inte tar med; syns inte på kortet för 1 låda). Och ja/zh-TW bär
storleksradens cm-omräkning med tankstreck enligt `REGLER-ASIEN.md` punkt 7, med flit.
