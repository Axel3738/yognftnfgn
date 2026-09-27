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

## Domänen matstrumpor.no

`matstrumpor.no` svarar NXDOMAIN (2026-09-27) — inte registrerad. Köps hos Loopia (där
.se och .com ligger), kopplas i Settings → Domains, och sedan kopplas den till marknaden
Norge med `webPresenceCreate` + `marketUpdate(webPresencesToAdd)` (receptet mättes på
CaraShell 2026-09-16, `factory/API-GRANSER.md`). Tills dess är matstrumpor.se/nb
adressen — allt fungerar utan .no.

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
| DK | `MATSTRUMP_DK_SALES` | 120251749599180023 | DK | da | platshållare 1 000, EJ GIVEN |
| FI | `MATSTRUMP_FI_SALES` | 120251749604200023 | FI | fi | platshållare 1 000, EJ GIVEN |
| US | `MATSTRUMP_US_SALES` | 120251749609010023 | US | en | platshållare 1 000, EJ GIVEN |
| WW | `MATSTRUMP_WW_SALES` | 120251749612350023 | NO, DK, FI, US, GB, AU, CA, NZ | en | platshållare 1 000, EJ GIVEN |

Worldwide länkar till `/en/products/sushi-strumpor` utan `?country=` — Shopify väljer marknad
efter kundens IP, så en dansk ser engelska + DKK. Sverige ingår inte (egen kampanj). **Inga
annonser ligger i än:** videorna väntar på HeyGen (nedan), och `bygg.mjs --aktivera` vägrar
allt med platshållarbudget. Läget i kontot: `annonser/lage.json`, `bygg.mjs --lage`.

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
