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
| Erbjudandekortet (checkout UI extension) | `app/extensions/tacksida-erbjudande/` | ✅ byggd och kompilerad lokalt (`shopify app build`, 28 kB). Två mål: tacksidan (`purchase.thank-you.block.render`) och orderstatussidan (`customer-account.order-status.block.render`). **Inte deployad** — kräver App Automation Token (Axels klick 1). |
| Deploy | `deploy.sh <butik> [--torr]` | Väntar på token. Skriptet hämtar appens riktiga konfig först och vägrar deploya om scopes saknas i den. |
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
3. `SHOPIFY_APP_AUTOMATION_TOKEN` för den butikens Fabriken-app →
   `bash factory/tacksida/deploy.sh <butik>`.
4. Blocket in i kassaredigeraren (klicken nedan), inställningarna ur
   `rabatter.mjs`-raden. `standard_sprak` och `marknadsdomaner` efter butiken.
5. `rapport.mjs --butik <id>` efter en vecka.

## Vad som INTE är gjort, och varför

- **Deployen.** Shopify CLI behöver ett App Automation Token från Dev
  Dashboard (`SHOPIFY_APP_AUTOMATION_TOKEN`); det finns inget i miljön och kan
  bara skapas av en inloggad människa. Allt annat är klart: `deploy.sh` kör
  hela vägen så fort variabeln finns.
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

1. **App Automation Token.** Dev Dashboard (dev.shopify.com) → appen
   **Factory (Carashell)** → **Settings** → **App Automation Token** →
   **Generate**. Kopiera.
2. **Lägg in den i Environments** på claude.ai som
   `SHOPIFY_APP_AUTOMATION_TOKEN` (samma miljö som `SHOPIFY_CLIENT_ID_yitrbk_m3`).
   Skriv "deploya tacksidan" i chatten — sessionen kör `deploy.sh` och
   rapporterar.
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
