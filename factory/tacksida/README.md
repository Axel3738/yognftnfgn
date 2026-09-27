# Tacksidan — erbjudandet efter köp (OPS Factory)

Axels beställning 2026-09-26: lägg in Fönstertermomattan och Husbilskalendern
som upsell på **CaraShells tacksida**, gör det till "det mest oemotståndliga
erbjudandet någonsin" med bra rabatt (kundens köp är redan betalt — allt
efteråt är ren vinst), researcha först, fråga Evolve-boten utan att avslöja
brandet, och bygg in det i butiken.

Det här är mappen. Allt som skrevs in i butiken går att köra om (idempotent),
och allt Axel behöver klicka står längst ner.

---

## Vad som är byggt (läget 2026-09-26)

| Del | Var | Läge |
|---|---|---|
| Två tilläggsprodukter i CaraShell | `produkter.json` → `produkter.mjs` → `produkter.lage.json` | ✅ live: `/products/fonstertermomatta-2-pack` 539 kr, `/products/adventskalender-retrobussar` 379 kr — **utan jämförpris** (se punkt 7 nedan). ACTIVE, Online Store + Shop, egen lättmall `product.tillagg`, titel + beskrivning + SEO på nb/en/fi/da. Inte i Sortimentet eller menyn. |
| Två rabattkoder | `erbjudande.json` → `rabatter.mjs` → `rabatter.lage.json` | ✅ live: **TACKMATTA** 34,88 % ⇒ 351 kr (spar 188) · **TACKKALENDER** 36,94 % ⇒ 239 kr (spar 140). Låsta till exakt sin produkt, en gång per kund, kombineras med produktrabatter (paketkoderna gäller andra produkter), inget slutdatum. |
| Erbjudandekortet (checkout UI extension) | `app/extensions/tacksida-erbjudande/` | ✅ **deployad och releasad 2026-09-26 16:08 UTC** i den egna appen "CaraShell Tacksida" (28,8 kB). Två mål: tacksidan (`purchase.thank-you.block.render`) och orderstatussidan (`customer-account.order-status.block.render`). Syns för kunden först när blocket lagts in i kassaredigeraren (Axels klick 3–4). |
| Deploy | `deploy.sh <butik> [--torr]` | ✅ körd skarpt 2026-09-26 (se "Deployen" nedan). Skriptet hämtar appens riktiga konfig först och vägrar deploya om scopes saknas i den. |
| Mätning | `rapport.mjs [--dagar 14] [--json]` | ✅ körd: 384 kandidatordrar, 0 tillägg (kortet syns inte förrän det lagts in). Ingen dom under 200 kandidatordrar. |
| Evolve-frågorna | `EVOLVE-FRAGOR.md` / `EVOLVE-SVAR.md` | ✅ åtta frågor på engelska utan brand, klara att klistra in. |
| Researchen | `RESEARCH.md` | Sammanfattningen av sex researchspår (plattform, one-click, appar, erbjudandedesign, svensk lag, CLI) med källor. |

Kassan är **testad live** med exakt den länk kortet bygger (Chromium mot
carashell.se, 2026-09-26): rabatten läggs på av sig själv, e-post och
leveransadress är förifyllda, fri frakt, alla betalsätt (kort, Shop Pay,
PayPal, Klarna, Apple/Google Pay). Med `/nb/` i länken och norsk adress blev
kassan norsk och priset i NOK. Skärmdumpar togs i sessionen (inte committade).

---

## Varför det ser ut så här (besluten, med källorna i RESEARCH.md)

**1. Tacksidan + orderstatussidan, inte Shopifys one-click-sida.**
Shopifys one-click "post-purchase"-sida (den mellan betalningen och tacksidan)
är fel verktyg för CaraShell av fyra skäl som alla är Shopifys egna regler:
den visas **inte** för Klarna, Apple Pay, Google Pay (CaraShell senaste 14
dygnen: Klarna 45 % av ordrarna, **74 % i Sverige**; wallets 7 %), **inte** för
ordrar i annan valuta än butikens (NO/DK/FI/US ≈ 40 % av ordrarna), en egen
custom app får bara använda den på **Plus** (CaraShell är Grow), och funktionen
är fortfarande beta med ansökan. Kvar hade blivit svenska kortkunder — kanske
var femte order. Tacksidan och orderstatussidan når **alla** kunder, på alla
planer, och kunden ser tacksidan/orderstatussidan i snitt 2,2 gånger per order
(ReConvert-data). Priset: köpet blir en **ny order** (kassan igen, förifylld,
en klickväg med Shop Pay/Klarna) och ett **eget paket** — dropshipping
skickar per order. Räkna med det i marginalen.

**2. Rabatt ≈ 35 %, som kronor på kortet, inte procent.**
Researchen är entydig på en punkt: **relevans slår rabattdjup** (AfterSells
2026-data: erbjudanden utan rabatt konverterar 17,9 %, djupare rabatt höjer
bara gradvis; Zipify: 15 % slog 20 % med 7,4 procentenheter; leverantörerna
rekommenderar 10–20 % som start). Axels argument är ett **marginalargument**,
inte ett konverteringsargument — och det håller: köpet är betalt. Kortet
visar därför "Du sparar 188 kr" (fast belopp uppfattas som mer värt än procent
— Firestones splittest: 6 $ av slog 15 % av, 13,6 % mot 10,3 %), och nivån
ligger där båda produkterna fortfarande bär en andra frakt.

Marginalen räknad på **ANTAGEN** inköpskostnad (Temu-sheetsen ligger i Drive
och gick inte att läsa härifrån; repots mönster är inköp ≈ 38–45 % av priset,
`docs/temu-launch-flow.md`: 13,65 € ≈ 152 kr vid 399 kr). **Axel byter mot
riktiga tal.** Frakten för det extra paketet är inte med.

| Rabatt | Fönstertermomatta (539 kr) | marginal vid inköp 205 / 243 kr | Adventskalender (379 kr) | marginal vid inköp 144 / 171 kr |
|---|---|---|---|---|
| 0 % | 539 | 334 / 296 | 379 | 235 / 208 |
| 20 % | 431 | 226 / 188 | 303 | 159 / 132 |
| **≈ 35 % (valt)** | **351** | **146 / 108** | **239** | **95 / 68** |
| 50 % | 270 | 65 / 27 | 190 | 46 / 19 |

⚠️ **Procenten är udda med flit.** Shopify lagrar rabattprocent med två
decimaler och **trunkerar** rabattbeloppet till hela ören (mätt i kassan:
35,25 % på 539 kr gav 189,99 → 349,01 kr; 34,30 % på 379 gav 249,01 kr). Bara
procent där `(pris × procent × 100) mod 10000 < 50` ger jämna kronor. För
539 kr: 31,54 (369) · 33,21 (360) · **34,88 (351)** · 36,55 (342) · 38,59 (331)
· 40,26 (322). För 379 kr: 30,08 (265) · 32,19 (257) · 33,51 (252) · **36,94
(239)** · 40,37 (226). Kunden ser aldrig procenten — kortet säger kronor och
kassan säger "Totala besparingar 188,00 kr". `rabatter.mjs` stoppar en procent
som inte ger målpriset.

**3. Två kort, mattan först.** Komplementet först (fönstermattan hör till
samma husvagn som taket/rutan kunden just köpte skydd åt), julkalendern som
andra kort (Q4-gåva, dör efter 24 dec — ta bort `produkt_2` i inställningarna
i januari). Ett starkt erbjudande + ett till, aldrig tre (AfterSell: "three
pages in a row is a gauntlet").

**4. Ingen timer, inget "bara i dag".** Inget kontrollerat test visar att en
nedräkning på en post-purchase-sida höjer konverteringen, och en timer som
återställs när kunden öppnar orderstatussidan igen är precis det som får
kunder att sluta lita på butiken. Kortet säger i stället "Erbjudandet gäller i
samband med din beställning", visas alltid på tacksidan och **gömmer sig på
orderstatussidan 48 h efter köpet** (Storage API, `giltig_timmar`). Koden i
sig har inget slutdatum — inget löfte som kan brytas. (Svensk marknadsföringslag:
ett "engångserbjudande" som inte är det är vilseledande.)

**7. Inget överstruket pris förrän det är lagligt (prisinformationslagen 7 a §).**
Ett överstruket pris, "ordinarie pris", "du sparar", "erbjudande" eller "rabatt"
är en annonserad prissänkning, och då måste referenspriset vara det **lägsta
pris butiken tillämpat de senaste 30 dagarna** (för en produkt yngre än 30
dagar: lägsta priset under den tiden). De två produkterna är nya i CaraShell
2026-09-26 — de har aldrig kostat 539/379 kr där — så ett överstruket 539 hade
varit exakt det KO förelade tio bolag 22 MSEK för i maj 2025. Därför: **kortet
visar ett villkorat pris** ("351 kr för dig som just beställt"), inget
överstruket, inget "du sparar", och ordet "erbjudande" står inte i copyn
(EU-guidningen undantar kopplade/villkorade priser från 30-dagarsregeln;
Konsumentverket kräver ändå att det inte ser ut som en prissänkning). **De två
produkterna fick heller inget jämförpris** (källans 709/499 står kvar som
`kalla_jamforpris` i specen) — samma regel. Inställningen
**`visa_ordinarie_pris`** i kassaredigeraren slår på överstruket pris + "Du
sparar 188 kr" — tidigast 2026-10-26, och bara om produkterna legat till
listpris hela tiden. Det är Axels beslut. ⚠️ Samma regel gäller
jämförpriserna på ALLA produkter i alla butiker (1 129/1 469 osv.) — det är
inte den här sessionens sak, men det står i `RESEARCH.md` punkt 4.

**5. Priset på kortet är kassans pris.** Kortet hämtar produkten via Storefront
API i kundens land och språk (`@inContext`), räknar rabatten exakt som Shopify
(trunkering) och visar ordinarie pris överstruket + erbjudandepris + "Du sparar
X". Aldrig ett pris kassan inte ger — samma regel som `ms-paket`.

**6. Copyn öppnar med kunden, inte med produkten.** "Ett erbjudande till dig
som just beställt" — inte "Vänta! Din order är inte klar" (ger ångerköp och
supportmejl). Aldrig "levereras tillsammans" (det stämmer inte: ny order = eget
paket) — kortet säger "går till samma adress". Fem språk i
`app/extensions/tacksida-erbjudande/locales/`.

---

## Hur det hänger ihop tekniskt

```
Kunden betalar → tacksidan renderar blocket (vår extension i Fabriken-appen)
  → shopify.query (Storefront, land+språk) hämtar de två produkterna
  → kortet: bild, titel, ordinarie pris, erbjudandepris (trunkerad %), "Du sparar"
  → knappen = cart-permalink:
      https://carashell.se[/nb]/cart/<variant>:1?discount=TACKMATTA
        &checkout[email]=…&checkout[shipping_address][…]=…
        &attributes[kalla]=tacksida&attributes[plats]=tack&attributes[efter_order]=#1234
  → ny kassa, förifylld, rabatten pålagd → ny order märkt kalla=tacksida
Orderstatussidan: samma kort, gömt efter giltig_timmar (Storage API).
```

- **Marknad och språk:** `standard_sprak` (sv) får inget prefix, andra språk får
  `/nb`, `/en`, `/fi`, `/da`. Marknader med egen domän står i `marknadsdomaner`
  (`us=https://carashell.com|en`). Landet i den förifyllda adressen styr
  marknaden i kassan (testat: NO-adress ⇒ NOK).
- **Inställningarna** (kassaredigeraren, blocket "Tacksidan: erbjudande efter
  köp"): `produkt_1`, `kod_1`, `procent_1`, `produkt_2`, `kod_2`, `procent_2`,
  `giltig_timmar`, `marknadsdomaner`, `standard_sprak`. Tomt fält = standard i
  `src/Erbjudande.jsx` (CaraShells). Procenten där MÅSTE vara kodens —
  `rabatter.mjs` skriver ut raden.
- **Mätning:** attributet `kalla=tacksida` på den nya ordern är facit
  (`rapport.mjs`), koden är reserv. Take-rate = tilläggsordrar / övriga ordrar.
  Riktmärken ur researchen: tacksides-erbjudanden ≈ 1,7 % i snitt, one-click
  ≈ 4,7 %, optimerade 8–16 %. Läs ingenting under 200 kandidatordrar (≈ en
  vecka för CaraShell), ±2 procentenheter kräver ≈ 460.
- **Fasta marknadspriser saknas** på de två produkterna (takskyddet och
  termoskyddet har prislistor i NOK/USD/EUR/DKK). Kunden ser Shopifys
  kursomräkning (t.ex. 371 NOK för kalendern). Procentrabatten blir rätt i
  varje valuta. Vill Axel ha fasta priser: `factory/prislista.mjs`-vägen.
- **Kalibrering av rundningen** står i `erbjudande.json`; testet
  `test/tacksida.test.mjs` låser den (12 tester, körs i `npm test`).
- **Inställningarna** har också `visa_ordinarie_pris` (av) — punkt 7 ovan.

## Ny butik

1. Källprodukterna in i `produkter.json` (kopiera formen), `butik` = butikens
   id. `node factory/tacksida/produkter.mjs --torr`, sedan skarpt.
2. `erbjudande.json`: koder + procent ur listan ovan (eller räkna med regeln).
   `node factory/tacksida/rabatter.mjs --torr`, sedan skarpt.
3. `SHOPIFY_APP_AUTOMATION_TOKEN_<BUTIK>` (token är per app ⇒ ett namn per
   butik; delad `SHOPIFY_APP_AUTOMATION_TOKEN` är reserv) och, för en egen
   app utan scopes, `TACKSIDA_CLIENT_ID_<BUTIK>` →
   `bash factory/tacksida/deploy.sh <butik>`.
4. Blocket in i kassaredigeraren (klicken nedan), inställningarna ur
   `rabatter.mjs`-raden. `standard_sprak` och `marknadsdomaner` efter butiken.
5. `rapport.mjs --butik <id>` efter en vecka.

## ⛔ Spårningssidan: AV sedan 2026-09-26 ~16:35 UTC (Axels beslut)

Axel, när han såg korten live: "Jag tycker inte vi ska ha dem där. Jag tycker
vi ska ha dem på tacksidan." `sparning/butiker.json` → `carashell.tillagg:
false`, sidan ompublicerad utan rutan samma minut. Motorn finns kvar och slås
på med `true`. Avsnittet nedan beskriver hur det såg ut medan det låg uppe.

**Vägen till tacksidan utan jobb-Gmailen: en EGEN app i Axels org.** Cowork-
prompten `cowork/2-egen-app.txt` skapar appen "CaraShell Tacksida" i
organisationen Carashell (235001191, den Axels konto ser), installerar den i
butiken och genererar token; Axel lägger `TACKSIDA_CLIENT_ID_CARASHELL` +
`SHOPIFY_APP_AUTOMATION_TOKEN_CARASHELL` i Environments (Axels fråga
2026-09-26: per-butiksnamn, eftersom token är per app — skriptet läser
`_<BUTIK>` först, det delade namnet som reserv), och `deploy.sh` deployar dit
i stället för till Factory-appen. Extensionen behöver inga scopes (Storefront
via `api_access`), och scopes-spärren i skriptet hoppas för den egna appen.
Axel skapar appen själv 2026-09-26 kväll (utan Cowork). ⚠️ Oprövat om `shopify app config link` fungerar med en
automation-token — se raden under "Vad som INTE är gjort".

## Så såg det ut på spårningssidan 2026-09-26 12:40–16:35 UTC (avstängt nu)

Kassans app gick inte att deploya (token i jobb-Gmailens org, se nedan), så
erbjudandet lades där vi kommer åt utan app: **under paketet på
https://carashell.se/pages/spara** (`sparning/tillagg.mjs`, `sida.mjs`
`visaTillagg`, registret `sparning/butiker.json` → `carashell.tillagg: true`).
Samma facit som kassan — produkter, koder och procent läses ur den här
mappen, aldrig kopieras. Två kort under paketet: bild, kortnamn, en mening,
"351 kr för dig som beställt hos oss", knapp "Lägg till för 351 kr" → förifylld
varukorg med koden (`attributes[kalla]=tacksida`, `plats=sparningssida`, så
`rapport.mjs` räknar dem). Priset hämtas i kundens webbläsare ur
`/products/<handle>.js` i kundens valuta (mätt live: SEK 351 kr på .se, US$36.47
på .com) och räknas som Shopify trunkerar. Fyra språk (sv/nb/en/fi) via
`sparning/sprak/*.json`. Inget överstruket pris, ingen procent (PIL 7 a §).
Rutinen `/sparning carashell` (:24 varje timme) bygger om sidan — blocket
ligger kvar bara om koden finns på `main`. Tacksidan i kassan är fortfarande
nästa steg när token finns: den ser varenda köpare, spårningssidan bara de
som kollar paketet.

## ✅ Deployen — GJORD 2026-09-26

Körd av sessionen 2026-09-26 ~18:08 CEST mot den **egna appen** (inte
jobb-Gmailens Factory): `TACKSIDA_CLIENT_ID_CARASHELL` (`34817e…`) +
`SHOPIFY_APP_AUTOMATION_TOKEN_CARASHELL` i Environments.
`deploy.sh carashell --torr` först: `config link` fungerade med
automation-token (frågan nedan är alltså besvarad — ja), tomlen länkad till
**"CaraShell Tacksida"** i org **Carashell** (235001191), `scopes = ""`,
bygget 28,8 kB. Sedan skarpt: CLI:n skrev **"New version released to
users. carashell-tacksida-2 — tacksida 2026-09-26T16:08Z"**
(dev.shopify.com/dashboard/235001191/apps/428458639361/versions/1145109184513).
Kvar: blocket in i kassaredigeraren (Axels klick 3–4) — inget API gör det.

## Vad som INTE är gjort, och varför

- ~~**Deployen.**~~ Gjord 2026-09-26, se ovan. Historiken: Shopify CLI behöver ett App Automation Token från Dev
  Dashboard (`SHOPIFY_APP_AUTOMATION_TOKEN`); det kan bara skapas av en
  inloggad människa. Allt annat är klart: `deploy.sh` kör hela vägen så fort
  rätt token finns.
  ⚠️ **Första försöket 2026-09-26 06:14 UTC stoppade på 403 "You are not a
  member of the requested organization".** Token fanns (69 tecken, `atkn_…`),
  Identity godtog den (token exchange 200), men App Management-API:t nekade
  uppslaget av appen `ca709d…`. **Token är per APP, och det finns en app som
  heter "Factory" i varje butiks egen Dev Dashboard-organisation** — den
  rätta här är organisationen **Carashell**, appen **Factory** (handle
  `factory-60`, client id `ca709d…`, 154 scopes; avläst 2026-09-26 med
  `currentAppInstallation { app { title handle developerName } }`). En token
  skapad på en annan butiks "Factory" ser exakt ut som den rätta och ger
  precis det här felet. Kontrollera client id i appens Settings mot
  `SHOPIFY_CLIENT_ID_yitrbk_m3` innan den läggs in.
  **Coworks mätning 2026-09-26 (prompten `cowork/1-automation-token.txt`):**
  inloggad som `axelodhner.business@gmail.com` finns appen INTE i någon
  organisation — "Utveckla appar" i CaraShells admin öppnar en tom, nyskapad
  org "Carashell" (235001191), och de fyra org:ar kontot ser (Carashell,
  Matstrumpor.se, Bäverbutiken.se, Grillkliniken) bär åtta appar, ingen med
  `ca709dfb`. Förklaringen står i fabrikens egen checklista: VA:n skapar
  butiken OCH appen från **jobb-Gmailen** (`VA-CHECKLIST.md` rad 101), och
  butiken förs sedan över till Axel — men appen stannar i skaparens Dev
  Dashboard-organisation. Token måste alltså genereras inloggad med
  jobb-Gmailen. Cowork får inte skriva in token i Environments; Axel klistrar.
  ⚠️ CLI-fälla i samma körning: `SHOPIFY_FLAG_APP_CONFIG` får inte vara satt
  när `config link --client-id --file-name` körs (CLI:n läser den som
  `--config` och vägrar). `deploy.sh` kör länkningen med `env -u`.
  ⚠️ Oprövat: om `config link` alls fungerar med en automation-token.
  Shopifys CI-guide kör länkningen lokalt med inloggad användare och bara
  `deploy` med token. Ger rätt token samma 403 är det den vägen som fattas —
  då är alternativet att tomlen hämtas i en inloggad CLI på Axels dator
  och committas.
- **Blocket på sidan.** Det finns inget API som lägger in ett extension-block
  på tacksidan — kassaredigeraren är enda vägen (Shopify-staff, feb 2026).
- **One-click i samma order** för svenska kortkunder. Kräver en publik
  App Store-app (AfterSell från 34,99 $/mån, Kaching Post Purchase från
  4,99 $/mån, Zipify OCU) och når ändå bara kort/Shop Pay-ordrar i SEK.
  Kan läggas ovanpå senare — tacksidan är basen oavsett.
- **Evolve-svaren.** Axel klistrar in frågorna; svaren skrivs i
  `EVOLVE-SVAR.md` och erbjudandet justeras därefter.
- **Riktiga inköpspriser** för de två produkterna (Drive-sheeten). Tabellen
  ovan är ett antagande tills Axel ger talen.

## Observationer vid sidan av (inte åtgärdade)

- **Ångerfunktionen (DAL 2 kap 10 a §, i kraft 2026-06-19):** varje avtal via
  webb ska ha en tydligt märkt knapp "ångra avtalet här" tillgänglig under
  hela ångerfristen. Shopify har ingen egen — säger att returer/avbokningar
  "help meet" kravet. Gäller alla butiker, inte bara upsellen. `RESEARCH.md`
  punkt 4.

- Kassan har kryssrutan "Skicka mig nyheter och erbjudanden via e-post"
  **förbockad** (sågs i testkassan 2026-09-26). Förbockat marknadsföringssamtycke
  är inte giltigt samtycke i Sverige (MFL 19 §/GDPR) — Klaviyo-arbetet bygger
  på `subscribed`. Inställningen ligger i Shopify admin → Inställningar →
  Kassa → Marknadsföringsalternativ; inte den här sessionens sak att röra.
- Två testkassor (test-tacksida@example.com) skapades under mätningen och
  ligger som övergivna kassor i admin. Inget köptes.

## Axels klick (i ordning)

1. ✅ ~~**App Automation Token**~~ — gjort 2026-09-26 med den egna appen
   "CaraShell Tacksida" (klick 1–2 behövs inte längre).
   Historiken: **App Automation Token — på RÄTT app.** Dev Dashboard (dev.shopify.com)
   → byt organisation uppe till vänster till **Carashell** → **Apps** →
   appen **Factory** → **Settings**. Kontrollera att **Client ID börjar på
   `ca709d`** (annars är det en annan butiks Factory-app). Sedan **App
   Automation Token** → **Generate**. Kopiera.
2. **Byt värdet i Environments** på claude.ai: variabeln
   `SHOPIFY_APP_AUTOMATION_TOKEN` finns redan (samma miljö som
   `SHOPIFY_CLIENT_ID_yitrbk_m3`) — klistra in den nya token i stället för
   den gamla. Skriv "deploya tacksidan" i chatten — sessionen kör
   `deploy.sh` och rapporterar.
3. **Lägg in blocket på tacksidan.** Shopify admin (CaraShell) →
   **Inställningar** → **Kassa** → knappen **Anpassa** → sidväljaren uppe till
   vänster → **Tacksida** → i vänsterspalten **Lägg till appblock** → välj
   **Tacksidan: erbjudande efter köp** → dra det direkt under
   orderbekräftelsen → fyll i fälten med raden `rabatter.mjs` skrev
   (`produkt_1=fonstertermomatta-2-pack kod_1=TACKMATTA procent_1=34.88`,
   `produkt_2=adventskalender-retrobussar kod_2=TACKKALENDER procent_2=36.94`)
   → **Spara**.
4. **Samma sak på Orderstatus** (sidväljaren → **Orderstatus** → samma block,
   samma fält → Spara).
5. **Evolve-frågorna:** öppna `factory/tacksida/EVOLVE-FRAGOR.md`, klistra in
   en fråga i taget i Evolve-botens chatt, klistra tillbaka svaren i chatten
   här.
6. **Inköpspriserna** för de två produkterna (Temu-sheeten) — då räknas
   marginaltabellen om med riktiga tal.
