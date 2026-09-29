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

## COGS per marknad (`matstrumpor/cogs.json`, `cogs.mjs`)

Sverige: Shopifys Cost per item (landad, SEK) — sushi 5 par 80,23, 3 par 67,51;
donut/pizza/hamburgare **saknas i Shopify**. Big 5: Axels ark (USD per order, vara +
frakt, rad för 1 och 2 lådor). Norden: **ingen kostnad känd** — står som saknas med
orsak. `kor.mjs --ekonomi --marknad US` räknar break-even per produkt med ECB-kurs;
vinsten på stonebite.org räknar Matstrumpors Big 5-ordrar på leveranslandets kostnad
(`stonebite/kallor/vinst.mjs` → `kostnadPerLand`).

## Domänerna .no, .eu och .com — och A/B-testet i Norge (2026-09-29)

Axels besked 2026-09-29: "Jag har kopplat .no, .com och .eu-domäner", och beställningen samma
morgon: A/B-testa Norge som svenskt varumärke mot en sida som "känns väldigt norsk", och "se
skillnaden efter typ två veckor".

**Domänerna** (`bygg.mjs --steg domaner`, fältet `doman` per marknad i `konfig.json`): Norge →
**matstrumpor.no** (nb), Europa → **matstrumpor.eu** (en som standard + da, fi, de, fr, nl, es, it,
pl, pt-PT), USA/UK/AU/CA/NZ → **matstrumpor.com** (en). En egen domän hör till EN marknad i Shopify,
så .se-närvaron ligger kvar i alla marknader (`delad` i `stegPublicera`) — därför fungerar både
matstrumpor.se/nb (A) och matstrumpor.no (B) för norska kunder.

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
| Länk | matstrumpor.se/nb/…?country=NO | matstrumpor.no/…?country=NO |
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
- ⚠️ **Shop-appens tre recensioner är märkta `en`** fast de är svenska (Kent, Wide Pia, Niklas). På
  engelska sidor visas de därför på svenska utan knapp, som om de vore engelska. Kolla igen efter
  48 timmar. Rättar inte språkigenkänningen dem, är det Judge.me:s sak.
- Läses om med `scratchpad`-skriptet `judgeme5.mjs`, som räknar per språk hur många recensioner som
  visas översatta ("Visa original") och hur många som bara har knappen.

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
tar max 20 språk; vi hamnar på 12). Domäner: **matstrumpor.no** och **matstrumpor.eu** köps,
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

## Kampanjerna i kontot (byggda 2026-09-27 ~16:00 CEST, alla PAUSED) — `annonser/`

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

## Annonserna i kontot (2026-09-28/29) — 36 st, alla PAUSED

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
länk `https://matstrumpor.se/<språk>/products/<handle>?country=<LAND>`) → annonsnamn
`MATSTRUMP_<LAND>_sushi_<vinkel>_<format>_<nnn>_v<n>`. Break-even per land ur
`cogs.json` (US 1,22 · GB 1,17 … för sushi 5 par; se `--ekonomi --marknad`). Byggs
som `/matstrumpor-marknader` när Axel sagt budget per land — augustis test låg under
break-even i alla tre länder, och den frågan är hans.
