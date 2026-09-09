# Av-brandningen — källan är rensad 2026-09-09

**Läget nu:** `factory/tema/ops-tema.zip` är RENT. `npm run sjalvtest` har en
rad som kräver det, och `factory/test/avbranda.test.mjs` skannar hela zip:en
och kräver noll träffar.

Rensningen gjordes med `node factory/rensa-kalla.mjs` efter Axels rapport om
TackleBays förhandsvisning: *"Matstrumpor email popup är liksom kvar samt
cookie förfrågan, det är verkligen horribelt."* Han hade rätt, och det var
inte butikens fel — det var källans.

Vad som togs bort ur bas-temat:

| Vad | Var | Varför det var illa |
|---|---|---|
| E-postpopupen `ms-skrapkort` | sidfotens sektionsgrupp + filen | Annan firmas kampanj: byter rabattkod mot mejladress |
| Cookierutan `ms-cookies` | sidfotens sektionsgrupp | Källbutikens, inte fabrikens |
| Nyhetsbrevet | `newsletter_enable` på footer-sektionen | Deras e-postklubb, på från början |
| Klaviyo-embed | `settings_data.json` | Deras e-postverktyg, inte ens installerat i en ny butik |
| Facebook + Instagram | `settings_data.json` | Länkade till deras konton |
| Logga, brand_image, brand_description | `settings_data.json` | Deras logga syntes i headern |
| Fem bildreferenser | `templates/index.json` | `shop_images` är per butik — döda länkar i en ny butik |
| Fyra kunders recensioner | `templates/index.json` | Riktiga personer hos en annan firma |
| Deras produkt och kollektion | `templates/index.json` | `sushi-strumpor`, `collections/strumporna` |
| "Levereras presentklart" | USP-rad, marquee, annonsrad, startsida | Presentlöfte OPS-butiken inte håller |
| **"Älskad av tusentals svenskar"** | USP-rad, marquee, startsida | **Falskt.** En butik som öppnade i förrgår har inga tusentals kunder |
| "Presenten som alltid landar rätt" | recensionssektionerna | Presentbutikens copy |
| "Fri frakt i hela Sverige", "30 dagars öppet köp" | annonsrad, trust-rad, produktmall | Källans villkor — OPS har 14 dagars ångerrätt enligt lag |
| "En storlek passar de flesta", "Strl 36–44" | FAQ, produktmall | Strumpstorlekar |
| Presetnamnet | `settings_data.json` | Källbutikens namn i temaredigeraren |

**Av-brandningen finns kvar och behövs fortfarande.** HeimGuard, TankGuard,
DryTrek och TackleBay byggdes ur det SMUTSIGA temat. `factory/avbranda.mjs`
är deras väg ut, och den testas mot `factory/test/fixtur-smutsigt-tema/` —
en sparad kopia av det gamla temat. Utan den fixturen hade testerna blivit
gröna för att det inte fanns något att hitta.

**Regeln härifrån:** bygger du om bas-temat ur en butiksexport, kör
`node factory/rensa-kalla.mjs` innan det checkas in. Självtestet stoppar
annars.

---

## Historik: så såg det ut innan

## Läget efter kodrundan 2026-09-09 (KEDJAN.md, steget `avbrandning`)

Zip:en är **inte** rensad (Axels beslut "rensa källan" står kvar nedan, se
"Vad som återstår"). Men kedjan tvättar nu varje butik automatiskt, och
skanningen är en spärr som fungerar. Mätt mot zip:ens 309 textfiler:
**27 träffar före, 0 efter** — det är testet `hela bas-zip:en är skanningsren
efter av-brandningen` i `factory/test/avbranda.test.mjs`, och det faller den
dag någon lägger till ett KALLORD utan regel.

**Görs av kod nu:**

| Fynd | Var | Hur |
|---|---|---|
| Startsidan (25 fynd) | `startsida.mjs` (steget `startsida`) | `templates/index.json` byggs ur `butiker/<id>.yaml`; recensioner bara ur produktfilerna |
| `ms-skrapkort`, `ms-cookies` i footer-group | `kallskanning.avbrandaSektionsgrupp` via `avbranda.avbranda` | sektionerna tas bort, `order` rensas |
| Nyhetsbrevet (`newsletter_enable`) | samma | `KALLINSTALLNINGAR`: `newsletter_enable: false`, rubriken tom |
| Annonsraden i header-group (7 fynd) | `tema.byggHeaderGroup` + `avbrandaSektionsgrupp` | fabriken skriver egna rader (`opf_a1..3`) ur butikens villkor; källbutikens tre (`KALLANNONSER`) tas bort, fabrikens rörs aldrig |
| Footerns bolagsblock + `/pages/om-oss` | `avbranda.byggFooterblock`, `startsida.byggFooterGroup` | brand/bolag/orgnr/mejl ur yaml, ingen länk |
| `brand_description`, alla `social_*_link`, `logo`/`brand_image` (källoggan), Klaviyo-embedden, presetnamnet | `tema.rensaSettings` + `avbranda.stadaSettings` | sociala länkar töms alltid; app-embeds = enbart Judge.me; källoggan känns igen via `KALLORD` (`arKalltext`), en riktig logga lämnas i fred |
| `currency_code_enabled` | `tema.rensaSettings` | på när någon marknad har annan valuta än butikens |
| Trust-raden, leveransestimatet, FAQ, `hide_variants` i produktmallen (11 fynd) | `tema.byggProduktTemplate(befintlig, { produkt, butik, nb })` | ms_trust/ms_delivery ur yaml med norsk gren; `ms-faq-section` bort (UTGANGNA_TYPER); variantväljaren synlig vid riktiga varianter |
| Supportmejl, domän, brandnamn, `sushi-strumpor`, `collections/strumporna`, hero-citaten, presentlöftena, sockstorleks-defaults, källoggan, Facebook-id:t — i ALLA filer | `avbranda.byggRegler` (gruppen `alla`) | körs på varje temafil |
| Produktorden (`strumporna` → `varorna` …) i schema-defaults, kommentarer, fallbacks | `avbranda.byggRegler` (gruppen `liquid`) | körs BARA i `.liquid/.js/.css` — i JSON-mallarna kan de träffa butikens egen copy ("torra strumpor" är DryTreks nytta, Axel 2026-09-09) |
| `ms-head.liquid` "Matstrumpor A/B" + saknad schema-grupp | `byggRegler` + `tema.settingsSchemaMedAb` | gruppen "OPS A/B-test" läggs till en gång |
| `ms-paket.liquid`:s svenska ord | `tema.patchaMsPaket` | locale-branchas en gång |
| `collections/strumporna` träffade aldrig (escapade snedstreck) | `kallskanning.normalisera` | `\/` → `/`, `\uXXXX` → tecknet, före matchning |
| Ingen CLI | `node factory/kallskanning.mjs <butik-id> [--tema <id>]` | arbetstemat ur state (regel 1), exit 1 vid träff |
| Citatet visade början av en 7 000-teckensrad | `skannaFil` | ±80 tecken runt träffen |
| `KANDA_SMITTADE` saknade två filer | `kallskanning.mjs` | + `sections/header-group.json`, `config/settings_data.json` |

**Vad som återstår** (ingen kod rör det ännu — zip:en bär det fortfarande):

- **Kodfallbacks med villkor**: `ms-trust-row.liquid` (`assign fallback = 'truck:Fri frakt i
  Sverige|…'`), `ms-guarantee.liquid` (`default: '30 dagars öppet köp'`),
  `ms-delivery-estimate.liquid` (`default: 5/10`), `ms-cro.js` (`min = 5; max = 10`).
  De återuppstår när ett fält lämnas tomt. Kedjan fyller fälten (trust, delivery), så
  fallbacken slår inte i en fabriksbyggd butik — men den ligger kvar i filen.
  Inget KALLORD: "Fri frakt i Sverige" och "30 dagars öppet köp" är giltig copy.
- **Schema-defaults med villkor** i `ms-usp-bar`, `ms-marquee`, `blocks/ms-trust`,
  `blocks/ms-guarantee`, `ms-guarantee-section`, `blocks/ms-delivery`
  ("Fri frakt i Sverige", "30 dagars öppet köp", 5–10 dagar). Presentlöftena i samma
  strängar tas bort av reglerna; villkoren står kvar av samma skäl som ovan.
- **`sections/ms-skrapkort.liquid` och `sections/ms-cookies.liquid` som FILER** (KLUBB10,
  svensk cookietext). Sektionerna plockas ur grupperna, men filerna följer med och går
  att lägga till igen i temaeditorn.
- **Hårdkodad svenska i `ms-cro.js`/`ms-paket.js`** (tidszon, "Lägger i…", datumformat).
  Kräver egen översättningsväg — ingen textregel.
- `assets/ms-cro-nytt.css` (död fil), `ms-cro.css`:s Mochiy-fallback och mörka läge,
  `ms-tema.css`:s `#3A1F00`, `blocks/ms-bundle` `unit_word: "par"`, `ms-video` "Se dem i
  rörelse", `ms-bundle-products` rubriker, `ms-size` storlekstabellen (fotnoten skrivs om,
  tabellen inte), `password.json`/`article.json`/`list-collections.json` på engelska,
  `collection.json`/`search.json` med filter för en enproduktsbutik.
- **Sidfotens `snabblankar` → `main-menu`** och `enable_follow_on_shop` — menysteget i
  ops.mjs skriver `main-menu`; följ-på-Shop-inställningen rörs inte av någon.
- **`ms_paketniva`-definitionen** finns inte i en ny butik förrän `paket.mjs` skapat den —
  ingen textfråga, men samma symptom (tom köpruta).

**Rätt fix är fortfarande en ren bas-zip** (nedan). Tills den finns är reglerna ovan
skyddsnätet, och testet mot zip:en är beviset att nätet håller.

## De fem värsta

1. **Fyra riktiga kundrecensioner från Matstrumpor** ligger inbakade i startsidan,
   märkta "Verifierade köp", med namn: Wide Pia, Jonas, Gittan, Annika. Varje ny
   butik publicerar alltså andras recensioner som sina egna.
2. **Matstrumpors Facebook och Instagram** i footern. Kunden klickar och landar hos
   källbutiken.
3. **Klaviyos app-embed** är aktiverad — källbutikens e-postinsamling, i app-lagret
   där skanningen inte når.
4. **Villkoren är hårdkodade som FALLBACK i koden**, inte bara som defaults. Tömmer
   man fältet i temaeditorn kommer "Fri frakt i Sverige / 30 dagars öppet köp"
   tillbaka av sig själv (`ms-trust-row.liquid`, `ms-guarantee.liquid`,
   `ms-delivery-estimate.liquid`).
5. **`sections/header-group.json` var helt missad.** Aviseringsraden högst upp på
   VARJE sida säger "Levereras presentklart" och "Fri frakt i hela Sverige".

## Buggar i mina egna verktyg (funna i samma granskning)

- ✅ **Rättad 2026-09-09.** `collections/strumporna` i KALLORD kunde **aldrig** träffa:
  `templates/index.json` är minifierad JSON där snedstrecken är escapade
  (`collections\\/strumporna`). Nu normaliseras texten före matchning
  (`kallskanning.normalisera`), med test mot zip:ens riktiga fil.
- ✅ **Rättad 2026-09-09.** `avbrandaSektionsgrupp()` var **död kod** — ingen byggfil
  importerade den. Nu kör `avbranda.avbranda()` den på både `footer-group.json` och
  `header-group.json` (steget `avbrandning` i KEDJAN.md).
- ✅ **Rättad 2026-09-09.** `newsletter` i KALLSEKTIONER matchade aldrig: nyhetsbrevet är
  en INSTÄLLNING på footer-sektionen (`newsletter_enable: true`), inte en egen sektion.
  Nu `KALLINSTALLNINGAR` — inställningen slås av och rubriken töms.
- ❌ Kvar: `kundvy.mjs` letar bara efter spår av ett OBYGGT Dawn-tema, aldrig efter
  källbutikens text. (`kundvy.mjs` ägs av ett annat steg; `KALLORD` är exporterad och
  går att importera där.)

## Beslutet: rensa KÄLLAN, inte varje kopia

157 fynd i 50 filer går inte att lappa med en skanner som körs per butik —
det bevisar de tre buggarna i mina egna verktyg ovan. Varje ny mönsterregel
missar något, och felet upptäcks först när en butik står i förhandsvisning.

**Rätt fix: bygg en REN bas-zip, en gång.** Då ärver ingen butik något,
och skannern blir ett skyddsnät i stället för en huvudförsvarslinje.

Arbetet, i ordning:

1. **Startsidan** (`templates/index.json`) skrivs om till en neutral mall med
   platshållare som fabriken fyller. Sektionen `omdomen` (Matstrumpors fyra
   recensioner) tas bort helt — Judge.me sköter recensioner.
2. **Sektionsgrupperna** (`header-group.json`, `footer-group.json`) rensas:
   aviseringsraden töms, `ms-skrapkort`/`ms-cookies` bort,
   `newsletter_enable: false`, footerns bolagsblock töms.
3. **Inställningarna** (`config/settings_data.json`): `brand_description`,
   `social_*_link`, `logo`, `brand_image` töms; Klaviyo-embedden bort.
4. **Produktmallen** (`templates/product.json`): FAQ, trust-raden och
   leveransestimatet töms.
5. **Schema-defaults och kodfallbacks** i alla `ms-*`-filer: varje
   `default:`-värde med källbutikens villkor eller produktcopy töms.
   Kodfallbacksen (`ms-trust-row`, `ms-guarantee`, `ms-delivery-estimate`)
   är de farligaste — de återuppstår när ett fält lämnas tomt.
6. **Fabriken fyller platshållarna** ur butiks- och produktfilen. Det som
   inte kan fyllas ska INTE renderas.

⚠️ Den rena zip:en får aldrig innehålla en enda rad av källbutikens text.
Testet är enkelt: skanningen mot zip:en själv ska vara tom.

## Alla fynd, per fil

### `templates/index.json` — 25 fynd

🔴 **HELA startsidan är Matstrumpors. Ingen kod i factory/ skriver någonsin templates/index.json — grep på 'index.json' i factory/*.mjs ger bara träffar i kallskanning.mjs kommentarer. Filen laddas upp orö** · syns för kund
   - Bevis: `factory/ops.mjs skriver bara 'config/settings_data.json' och 'templates/product.json'. templates/index.json har order: ["hero","ms_usp","ms_marquee","produkt","berattelse","sortime`
   - Fix: KOD: bygg factory/tema.mjs → byggStartsida(produktfil) som genererar templates/index.json från produkt-yaml:en (hero-rubrik, brödtext, produkt-handle, bilder) i stället för att låta zip:ens fil ligga kvar. Tills den finns: lägg 'templates/index.json' i KANDA_SMITTADE och låt kont

🔴 **USP-baren överst på startsidan lovar Matstrumpors presentförpackning och deras kundantal.** · syns för kund
   - Bevis: `"ms_usp":{"type":"ms-usp-bar","settings":{"items":"gift:Levereras presentklart|star:Älskad av tusentals svenskar"}}`
   - Fix: KALLORD: 'levereras presentklart' och 'älskad av tusentals svenskar'. Innehållet ska komma ur produktfilens usp-lista.

🔴 **Hero-rubriken är Matstrumpors produktlöfte.** · syns för kund
   - Bevis: `"heading":"Strumpor som ser ut som mat"`
   - Fix: KALLORD: 'strumpor som ser ut som mat' (redan i KALLORD — behåll).

🔴 **Hero-brödtexten säljer en presentprodukt i matförpackning.** · syns för kund
   - Bevis: `"text":"Gåvan de skrattar åt först – och sen använder varje vecka. Levereras i en presentförpackning som ser ut som riktig mat."`
   - Fix: KALLORD: 'gåvan de skrattar åt först' och 'presentförpackning som ser ut som riktig mat'.

🔴 **Hero-knappen länkar till Matstrumpors kollektion. I en ny butik finns ingen kollektion 'strumporna' → knappen leder till 404.** · syns för kund
   - Bevis: `"button_label_1":"Handla nu","button_link_1":"shopify:\/\/collections\/strumporna"`
   - Fix: KALLORD: 'collections/strumporna' finns redan MEN matchar inte — i index.json står den JSON-escapad som 'collections\\/strumporna'. skannaFil() letar på råa rader, så träffen uteblir. Lägg till 'collections\\/strumporna' som eget KALLORD, eller normalisera bort '\\' i skannaFil()

🔴 **Hero-bilden pekar på en bildfil som bara finns i Matstrumpors mediabibliotek. I en ny butik blir hero-sektionen bildlös.** · syns för kund
   - Bevis: `"image":"shopify:\/\/shop_images\/hf_20260225_045241_92dce67d-dbb6-4a7b-a5ff-ca8ba3833899.jpg"`
   - Fix: KOD: lägg en regel i kallskanning.mjs som flaggar VARJE 'shopify:\\/\\/shop_images\\/' i templates/ och sections/*.json — filnamnen går inte att lista i förväg, men referensen i sig är alltid källbutikens.

🔴 **Marquee-bandet bär Matstrumpors fyra löften OCH deras varumärkesfärg hårdkodad i sektionens settings. Färgen når INTE branding-patchen: byggSettingsPatch() skriver bara config/settings_data.json → col** · syns för kund
   - Bevis: `"ms_marquee":{"type":"ms-marquee","settings":{"items":"Älskad av tusentals svenskar|Fri frakt i Sverige|30 dagars öppet köp|Levereras presentklart","speed":26,"background":"#dd821d`
   - Fix: KALLORD: '#dd821d' och '#fdfbf7' (Matstrumpors orange/creme — entydiga hexvärden, ingen falsklarmrisk). KOD: byggStartsida() ska sätta background/text_color ur branding.farger.accent / accent_text.

🔴 **Startsidans featured-product pekar på Matstrumpors produkthandle. I en ny butik finns ingen 'sushi-strumpor' → hela köprutan på startsidan renderas tom.** · syns för kund
   - Bevis: `"produkt":{"type":"featured-product",..."settings":{"product":"sushi-strumpor",...}}`
   - Fix: KALLORD: 'sushi-strumpor' (redan i KALLORD — behåll). KOD: byggStartsida() sätter handle ur produktfilen.

🔴 **Berättelsesektionen är ren Matstrumpor-copy med produktnamnen i klartext.** · syns för kund
   - Bevis: `"heading":"Strumpor man aldrig blandar ihop" och "<p>Alla går kort om strumpor, och udda par är vardag. De här blandar du aldrig ihop – de ser ut som sushi, pizza, hamburgare och d`
   - Fix: KALLORD: 'strumpor man aldrig blandar ihop' (finns redan) + 'sushi, pizza, hamburgare och donuts' + 'det börjar med ett skratt när lådan öppnas'.

🔴 **Sortimentssektionen visar Matstrumpors kollektion och kallar den 'Hela sortimentet' — en OPS-butik har en produkt, så sektionen blir antingen tom eller absurd.** · syns för kund
   - Bevis: `"sortiment":{"type":"featured-collection","settings":{"collection":"strumporna","products_to_show":4,"title":"Hela sortimentet",...,"show_view_all":true}}`
   - Fix: KOD: byggStartsida() ska ta bort sektionen helt för en enproduktsbutik. KALLORD: 'hela sortimentet'.

🔴 **Statement-sektionen namnger Matstrumpors produkter och länkar till deras kollektion.** · syns för kund
   - Bevis: `"heading":"Från sushi till donuts – en strumpa för allt de älskar att äta" och "button_label":"Se alla strumpor","button_link":"shopify:\/\/collections\/strumporna"`
   - Fix: KALLORD: 'från sushi till donuts' och 'se alla strumpor'.

🔴 **FYRA RIKTIGA KUNDRECENSIONER från Matstrumpor med namn och 'verifierat köp'-märkning ligger inbakade i startsidan. Varje ny butik publicerar alltså andras recensioner som sina egna verifierade köp — o** · syns för kund
   - Bevis: `"omdomen":{"type":"ms-review-slider","blocks":{"r1":{..."body":"Jättefina i rolig förpackning! Snabb leverans","name":"Wide Pia","verified":true}},"r2":{..."body":"Uppskattat och r`
   - Fix: KALLORD: 'wide pia', 'jättefina i rolig förpackning', 'uppskattat och rolig present', 'ej öppnat då de är en gåva'. KOD: bättre — lägg 'ms-review-slider' i KALLSEKTIONER så att blocken aldrig kan följa med, och låt Judge.me sköta recensionerna.

🔴 **Trygghetssektionen använder en av Matstrumpors produktbilder och deras betalsättslista.** · syns för kund
   - Bevis: `"trygghet":{"type":"image-with-text",..."settings":{"image":"shopify:\/\/shop_images\/matstrumpor_61_dorrmattan.jpg",...}} med texten "<p>Fri frakt på alla ordrar och 30 dagars öpp`
   - Fix: KALLORD: 'matstrumpor_' som prefix fångar alla fyra bildfilerna på en gång (matstrumpor_61_dorrmattan, _52_alla_fotter_soffan, _62_mormor_skrattar, _63_morfar_fatoljen). Ordet 'matstrumpor' finns redan i KALLORD och träffar dem — verifiera bara att skanningen körs på index.json, 

🔴 **Startsidans FAQ svarar på strumpfrågor: sockstorlek, presentförpackning, Matstrumpors leveranstid. Sektionstypen ms-faq-section rensas bort i produktmallen (den står i UTGANGNA_TYPER) men INTE på star** · syns för kund
   - Bevis: `"ms_faq":{"type":"ms-faq-section","blocks":{"q1":{"settings":{"q":"Passar de alla?","a":"<p>En storlek passar de flesta, ungefär strl 36–44.</p>"}},"q2":{..."a":"<p>5–10 arbetsdaga`
   - Fix: KALLORD: 'strl 36–44', 'en storlek passar de flesta', 'alla par levereras i presentförpackning'. KOD: lägg 'ms-faq-section' i KALLSEKTIONER och kör avbrandaSektionsgrupp() även på templates/index.json (funktionen fungerar på vilken fil som helst med sections+order).

🔴 **UGC-galleriet är tre av Matstrumpors AI-bilder med deras rubriker — 'Pizzafavoriten' är produktnamnet rakt av.** · syns för kund
   - Bevis: `"ugc_galleri":{"type":"multicolumn","blocks":{"g1":{"settings":{"image":"shopify:\/\/shop_images\/matstrumpor_52_alla_fotter_soffan.jpg","title":"Filmkvällen"}},"g2":{"image":"shop`
   - Fix: KALLORD: 'pizzafavoriten'. Bildfilerna fångas av 'matstrumpor' som redan står i KALLORD.

🔴 **Fyra namngivna kundomdömen från Matstrumpor ligger inbakade i startsidans omdömessektion. De följer med varje ny butik och blir påhittade recensioner för en produkt kunderna aldrig köpt. Skanningen fl** · syns för kund
   - Bevis: `"omdomen.blocks.r3.settings.body": "Ser helt fantastiskt ut. Ej öppnat då de är en gåva.", "name": "Gittan" — plus r1 "Wide Pia", r2 "Jonas", r4 "Annika", samt eyebrow "Verifierade`
   - Fix: KALLORD: 'ej öppnat då de är en gåva', 'wide pia'. Och fixa skannaFil(): den kapar vid 160 tecken och splittar på radbrytning — minifierad JSON är EN rad, så beviset syns aldrig. Låt den i stället plocka ut den matchande delsträngen med ±80 tecken kontext.

🔴 **Startsidans löpande band (ms-marquee) rullar källbutikens fyra villkor över hela skärmen. INGEN kod i factory/ rör templates/index.json — ops.mjs skriver bara om templates/product.json — så hela Matst** · syns för kund
   - Bevis: `"ms_marquee":{"type":"ms-marquee","settings":{"items":"Älskad av tusentals svenskar|Fri frakt i Sverige|30 dagars öppet köp|Levereras presentklart"`
   - Fix: Ny funktion byggIndexTemplate(butik, produkt) i factory/tema.mjs som bygger om templates/index.json ur butiks- och produktfilen, anropad från ops.mjs på samma ställe som byggProduktTemplate. Utan den är varje enskilt fynd i den här filen bara ett handgrepp som glöms bort.

🔴 **Startsidans trygghetsblock lovar både fri frakt, 30 dagars öppet köp OCH en namngiven lista betalmetoder (Klarna, kort, Apple Pay, Google Pay) som den nya butiken kanske inte har aktiverade. Returfris** · syns för kund
   - Bevis: `"heading":"Handla tryggt hos oss" … "text":"<p>Fri frakt på alla ordrar och 30 dagars öppet köp, så att du kan handla utan stress.</p><p>Betala som du vill – Klarna, kort, Apple Pa`
   - Fix: byggIndexTemplate() skriver texten ur butikens yaml. Betalmetoder ska aldrig skrivas i text — rendera {% render 'ms-payment-icons' %} som läser shop.enabled_payment_types.

🔴 **Startsidans garantiblock är källbutikens returlöfte, både i rubrik och brödtext, och står i direkt konflikt med butikens returpolicysida (14 dagars ångerrätt enligt butik-mall.yaml).** · syns för kund
   - Bevis: `"ms_guarantee":{"type":"ms-guarantee-section","settings":{"title":"30 dagars öppet köp","body":"<p>Inte nöjd? Hör av dig inom 30 dagar så löser vi det. Inget krångel, inga följdfrå`
   - Fix: byggIndexTemplate() sätter title/body ur retur.oppet_kop_dagar och retur.angerratt_dagar. Lägg 'inom 30 dagar' i VILLKORSORD.

🔴 **Startsidans FAQ lovar källbutikens leveranstid och att alla varor levereras i presentförpackning. Till skillnad från produktmallens FAQ tas den här ALDRIG bort — UTGANGNA_TYPER gäller bara templates/p** · syns för kund
   - Bevis: `"q2":{"type":"qa","settings":{"q":"Hur snabbt kommer de?","a":"<p>5–10 arbetsdagar med fri frakt inom Sverige.</p>"}} … "q3" … "a":"<p>Ja. Alla par levereras i presentförpackning.<`
   - Fix: byggIndexTemplate() ersätter ms_faq-blocken med produktens egna faq-metafält (samma källa som opf-faq).

🔴 **USP-baden överst på startsidan lovar presentklar leverans och åberopar källbutikens kundantal.** · syns för kund
   - Bevis: `"ms_usp":{"type":"ms-usp-bar","settings":{"items":"gift:Levereras presentklart|star:Älskad av tusentals svenskar"}}`
   - Fix: byggIndexTemplate() sätter items ur butikens yaml. Lägg 'älskad av tusentals svenskar' i VILLKORSORD — det är ett socialt bevis-claim som inte går att belägga i en nystartad butik.

🔴 **Fyra recensioner från Matstrumpor ligger inbakade i startsidan, en av dem med ett leveransomdöme som motsäger sidans egna 5–10 arbetsdagar, och en som beskriver produkten som en gåva.** · syns för kund
   - Bevis: `"r1" … "body":"Jättefina i rolig förpackning! Snabb leverans" — "r3" … "body":"Ser helt fantastiskt ut. Ej öppnat då de är en gåva."`
   - Fix: byggIndexTemplate() tömmer ms-review-slider-blocken helt (recensioner kommer från Judge.me, aldrig från zip:en). Ett falskt omdöme från en annan butik är både ett brutet löfte och en marknadsföringsrisk.

🟠 **En AI-disclaimer som hör till bilderna ovan. Blir en lös rad mitt på sidan när bilderna saknas — eller en falsk uppgift om butikens egna bilder inte är AI-genererade.** · syns för kund
   - Bevis: `"ugc_markning":{"type":"custom-liquid","settings":{"custom_liquid":"<p style=\"text-align:center;font-size:1.2rem;color:rgba(18,18,18,.55);margin:0\">Miljöbilderna är AI-genererade`
   - Fix: KALLORD: 'miljöbilderna är ai-genererade illustrationer'. KOD: byggStartsida() sätter raden bara när butikens bilder faktiskt är AI-genererade.

🟠 **Produktrutans etikettblock säger 'Bästsäljaren' — ett påstående ingen ny butik kan backa upp dag ett.** · syns för kund
   - Bevis: `"etikett":{"type":"text","settings":{"text":"Bästsäljaren","text_style":"uppercase"}}`
   - Fix: KOD: byggStartsida() sätter etiketten ur produktfilen, eller utelämnar blocket. Inget KALLORD — 'bästsäljaren' är ett för vanligt ord för att skanna på.

🟡 **Garantisektionen har Matstrumpors returlöfte hårdkodat i mallen i stället för att komma ur butikens fraktpolicy.** · syns för kund
   - Bevis: `"ms_guarantee":{"type":"ms-guarantee-section","settings":{"title":"30 dagars öppet köp","body":"<p>Inte nöjd? Hör av dig inom 30 dagar så löser vi det. Inget krångel, inga följdfrå`
   - Fix: KOD: byggStartsida() ska läsa antal dagar ur produkt-/butiksfilen så att sidan och returpolicyn aldrig kan säga olika. Inget KALLORD — '30 dagars öppet köp' gäller även våra butiker.


### `factory/kallskanning.mjs` — 12 fynd

🔴 **Skanningen letar bara på råa rader med toLowerCase(). templates/index.json är EN enda minifierad rad med JSON-escapade snedstreck, så alla 'shopify:\/\/collections\/strumporna'-träffar missas och hela**
   - Bevis: `skannaFil(): 'traffar.push({ ..., text: rad.trim().slice(0, 160) })' — och KALLORD innehåller 'collections/strumporna' som aldrig matchar strängen 'collections\\/strumporna' i file`
   - Fix: KOD: normalisera innehållet före matchning — const lag = rad.toLowerCase().replaceAll('\\\\/','/') — och pretty-printa JSON-filer (JSON.parse + JSON.stringify(...,2)) innan skanning så att varje träff får en egen rad och ett användbart citat.

🔴 **KANDA_SMITTADE listar tre filer. Genomgången visar sju filer med källbutiksinnehåll: templates/index.json, templates/product.json, sections/footer-group.json, sections/header-group.json, config/settin**
   - Bevis: `export const KANDA_SMITTADE = ['templates/index.json','templates/product.json','sections/footer-group.json'];`
   - Fix: KOD: utöka KANDA_SMITTADE med 'sections/header-group.json', 'config/settings_data.json', 'templates/password.json' och 'templates/list-collections.json'.

🔴 **KALLSEKTIONER saknar recensionsslidern och FAQ-sektionen — de två sektionstyper som bär källbutikens innehåll utan att någon kod rör dem på startsidan.**
   - Bevis: `export const KALLSEKTIONER = ['ms-skrapkort', 'ms-cookies', 'newsletter']; medan templates/index.json innehåller "type":"ms-review-slider" med fyra namngivna recensioner och "type"`
   - Fix: KOD: KALLSEKTIONER = ['ms-skrapkort','ms-cookies','ms-review-slider','ms-faq-section'] — och ta bort 'newsletter', den matchar ingenting (se det separata fyndet om footerns newsletter_enable). Kör avbrandaSektionsgrupp() på templates/index.json också, inte bara på sektionsgrupper

🔴 **BUGG i verktyget: 'newsletter' i KALLSEKTIONER matchar aldrig. Nyhetsbrevet är ingen egen sektion i footer-group utan en INSTÄLLNING på footer-sektionen. avbrandaSektionsgrupp() letar bara på sektion.** · syns för kund
   - Bevis: `sections/footer-group.json, sections.footer.settings: "newsletter_enable": true, "newsletter_heading": "Missa inga nyheter"  — och sektionslistan är bara ['footer','ms_cookies','ms`
   - Fix: Ta bort 'newsletter' ur KALLSEKTIONER (den ljuger) och lägg i stället en regel i avbrandaSektionsgrupp(): sätt sections.footer.settings.newsletter_enable = false och töm newsletter_heading. Lägg också till att footer-sektionens block 'foretaget' (subtext med bolagsblocket) och 'b

🔴 **Skanningen kan inte rapportera fynd i config/settings_data.json på ett användbart sätt. skannaFil() arbetar rad för rad och kapar träffen vid 160 tecken (rad 86: `text: rad.trim().slice(0, 160)`), men**
   - Bevis: `rad 86: traffar.push({ fil: namn, rad: i + 1, ord: [...new Set(ord)], text: rad.trim().slice(0, 160) });`
   - Fix: Ge JSON-filer en egen väg som pekar ut fältet, inte raden. Ny funktion i factory/kallskanning.mjs:

export function skannaJson(namn, rajson) {
  const d = typeof rajson === 'string' ? JSON.parse(String(rajson).replace(/\/\*[\s\S]*?\*\//,'').trim()) : rajson;
  const traffar = [];

🔴 **VERKTYGSDEFEKT: skannaFil() splittar på radbrytning och kapar träffen vid 160 tecken. config/settings_data.json och templates/index.json är minifierad JSON på EN rad om ~10 000 tecken — rapporten skri**
   - Bevis: `Körning av skannaTema() över hela zip:en (309 filer) ger: `❌ config/settings_data.json:1 [matstrumpor, matstrumpor.se, strumpor som ser ut som mat] {"current":{"logo_width":140,"co`
   - Fix: Byt ut radbaserad matchning mot indexbaserad: hitta varje förekomst i hela filens text (indexOf i loop), skriv ut ±80 tecken kontext runt träffen och räkna fram radnumret ur antalet \n före index. Då blir varje träff i minifierad JSON läsbar.

🔴 **VERKTYGSDEFEKT: KANDA_SMITTADE listar tre filer men saknar de två tyngsta — config/settings_data.json (brand_description, sociala länkar, logga, preset, app-embeds) och sections/header-group.json (ann**
   - Bevis: ``export const KANDA_SMITTADE = ['templates/index.json', 'templates/product.json', 'sections/footer-group.json'];` — och skarp körning över zip:en flaggar 13 rader, varav 0 från hea`
   - Fix: Lägg till 'config/settings_data.json' och 'sections/header-group.json' i KANDA_SMITTADE. Lägg samtidigt till 'header-group' i den grupp som avbrandaSektionsgrupp() körs på (kommentaren nämner den redan, men rutinen kör bara footer-group).

🔴 **VERKTYGSDEFEKT: skanningen letar bara i löptext. Den granskar aldrig `"default":`-värden i {% schema %}-blocken, där merparten av källbutikens innehåll faktiskt bor (14 sektioner/block enligt fynden o**
   - Bevis: `Skarp körning fångar 2 av 14 schema-defaults (ms-compare rad 67 och 69) — och bara för att ordet Matstrumpor råkar stå i just dem. ms-faq.liquid:8 ('strl 36–44'), ms-size.liquid:15`
   - Fix: Skriv skannaSchemaDefaults(namn, innehall): plocka ut varje {% schema %}…{% endschema %}-block, JSON.parse:a det, gå igenom alla settings/blocks rekursivt och flagga varje sträng-default som (a) matchar KALLORD, (b) matchar en ny lista MARKNADSORD ['fri frakt i sverige','leverera

🔴 **Systemfyndet bakom alla ovanstående: KALLORD innehåller bara butiksnamn, mejl och handles. Inget av villkorsfynden ovan skulle ge ett enda larm i dag — 'Fri frakt i Sverige' och '30 dagars öppet köp' **
   - Bevis: `rad 21–30: export const KALLORD = [ 'matstrumpor', 'matstrumpor.se', 'kundsupport@matstrumpor.se', 'sushi-strumpor', 'collections/strumporna', 'strumpor som ser ut som mat', 'strum`
   - Fix: Lägg till en andra lista i /Users/axelodhner/Desktop/OPS FACTORY/yognftnfgn-main/factory/kallskanning.mjs: export const VILLKORSORD = ['30 dagars öppet köp', 'öppet köp', 'arbetsdagar', 'fri frakt i sverige', 'fri frakt i hela sverige', 'fri frakt inom sverige', 'levereras presen

🔴 **Verktyget har ingen CLI. `node factory/kallskanning.mjs` skriver INGENTING och returnerar exit 0 — filen består bara av export-satser och saknar main-block. Definition of Done i /ny-ops kräver exakt d**
   - Bevis: `Körd 2026-09-09 i repo-roten: `node factory/kallskanning.mjs; echo EXIT=$?` → tom utskrift, `EXIT=0`. Filen slutar på `export function rapport(resultat) {...}` — inget `process.arg`
   - Fix: Lägg till ett main-block sist i filen som läser HELA temat och felar: `if (process.argv[1] && import.meta.url.endsWith(process.argv[1].split('/').pop())) { const filer = lasAllaTemafiler(process.argv[2] ?? '.'); const r = skannaTema(filer); console.log(rapport(r)); process.exit(r

🔴 **KALLORD-posten `collections/strumporna` kan aldrig träffa. templates/index.json är minifierad JSON där snedstreck är JSON-escapade, så texten i filen är `shopify:\/\/collections\/strumporna` — den inn** · syns för kund
   - Bevis: `Skanningen körd mot alla 309 temafiler 2026-09-09: `NEJ collections/strumporna 0` (noll träffar av sju sökord). `grep -o 'shopify:[^"]*' templates/index.json` → `shopify:\/\/collec`
   - Fix: Två ändringar i skannaFil(): (1) avskeppa escapningen före matchning — `const lag = rad.toLowerCase().replace(/\\\//g, '/')`; (2) lägg till KALLORD-strängarna `'"collection":"strumporna"'`, `'shop_images/matstrumpor'` och `'shop_images/hf_2026'`. Punkt 2 fångar dessutom hero-bild

🔴 **avbrandaSektionsgrupp() är död kod. Ingen byggfil importerar den — den anropas bara av sitt eget test. Filens egen kommentar påstår motsatsen ("Nu rensas de automatiskt av avbrandaSektionsgrupp()"), o** · syns för kund
   - Bevis: ``grep -rn kallskanning` i hela repot ger fyra träffar: två prosarader i .claude/commands/ny-ops.md, en i factory/PROCESS.md och importen i factory/test/kallskanning.test.mjs. Noll `
   - Fix: Knäpp in avbrandningen i temasteget i ops.mjs, direkt före produktmallen (rad ~164): `for (const grupp of ['sections/footer-group.json','sections/header-group.json']) { const ra = await hamtaTemafil(tema.id, grupp); const { json, borttagna } = avbrandaSektionsgrupp(ra); if (bortt


### `config/settings_data.json` — 22 fynd

🔴 **Butikens brandbeskrivning i footern är Matstrumpors säljtext. byggSettingsPatch() patchar bara cart_type, typsnitt, radier och color_schemes — brand_description rörs aldrig och renderas av footerns br** · syns för kund
   - Bevis: `"brand_description": "<p>Strumpor som ser ut som mat – gåvan de skrattar åt först och använder varje vecka.</p><p><strong>Följ oss:</strong></p>"`
   - Fix: KALLORD: 'strumpor som ser ut som mat' fångar den (finns redan) — men filen skannas bara om skanningen körs på config/. KOD: lägg brand_description i byggSettingsPatch() (factory/branding.mjs rad 154) och 'config/settings_data.json' i KANDA_SMITTADE.

🔴 **Footerns 'Följ oss'-ikoner länkar till Matstrumpors Facebook och Instagram. Kunden i den nya butiken klickar och landar på källbutikens konton.** · syns för kund
   - Bevis: `"social_facebook_link": "https://www.facebook.com/profile.php?id=61584643820493", "social_instagram_link": "https://www.instagram.com/matstrumpor.se/"`
   - Fix: KALLORD: 'instagram.com/matstrumpor.se' och 'profile.php?id=61584643820493'. KOD: byggSettingsPatch() ska nolla alla social_*_link som butiksfilen inte fyller.

🔴 **Butikens logotyp och brand_image pekar på Matstrumpors uppladdade bildfil. I den nya butiken finns filen inte → header utan logga, eller källbutikens logga om mediat följt med.** · syns för kund
   - Bevis: `"logo": "shopify://shop_images/Namnlos_design_-_2026-03-19T120925.579.png" och "brand_image": "shopify://shop_images/Namnlos_design_-_2026-03-19T120925.579.png"`
   - Fix: KALLORD: 'Namnlos_design_-_2026-03-19T120925.579'. KOD: byggSettingsPatch() ska sätta logo/brand_image ur branding.stil.logo (brandRader() läser redan fältet men ingen skriver det till temat).

🔴 **Klaviyos onsite-embed ligger kvar som aktiverat app-block. Det är källbutikens e-postinsamling — samma sorts läcka som ms-skrapkort, men i app-lagret där KALLSEKTIONER inte når.** · syns för kund
   - Bevis: `"blocks": {"klaviyo": {"type": "shopify://apps/klaviyo-email-marketing-sms/blocks/klaviyo-onsite-embed/2632fe16-c075-4321-a88b-50b567f42507", "disabled": false, "settings": {}}}`
   - Fix: KALLORD: 'klaviyo-onsite-embed'. KOD: byggSettingsPatch() ska sätta disabled: true på alla current.blocks vars type innehåller 'klaviyo'.

🔴 **Hela Matstrumpors varumärke ligger i temainställningarna: footer-texten, båda sociala länkarna, loggan, färgen, typsnittet och preset-namnet. Footerns brand_information-block renderar brand_descriptio** · syns för kund
   - Bevis: `"brand_description":"<p>Strumpor som ser ut som mat – gåvan de skrattar åt först och använder varje vecka.<\/p><p><strong>Följ oss:<\/strong><\/p>"
"social_instagram_link":"https:\`
   - Fix: Lägg 'config/settings_data.json' i KANDA_SMITTADE. KALLORD += 'strumpor som ser ut som mat', 'instagram.com/matstrumpor', 'facebook.com/profile.php?id=61584643820493', 'namnlos_design_-_2026-03-19t120925'. Skriv rensaTemainstallningar() som nollar brand_description, ALLA social_*

🔴 **current.brand_description är Matstrumpors brandtext. Dawns footer renderar den rakt av i brand_information-blocket (sections/footer.liquid:128-129: `{%- if settings.brand_description != blank -%}<div ** · syns för kund
   - Bevis: `"brand_description":"<p>Strumpor som ser ut som mat – gåvan de skrattar åt först och använder varje vecka.<\/p><p><strong>Följ oss:<\/strong><\/p>"`
   - Fix: Nolla i zip:en till "" OCH lägg till fältet i en ny scrub-funktion. Konkret kod i factory/kallskanning.mjs:

export const KALLFALT_INSTALLNINGAR = ['brand_description','brand_headline','social_facebook_link','social_instagram_link','social_twitter_link','social_pinterest_link','s

🔴 **current.social_facebook_link pekar på Matstrumpors Facebook-sida. footer-group.json har brand_information med "show_social": true, så footer.liquid:131 ritar en klickbar Facebook-ikon i varje ny OPS-b** · syns för kund
   - Bevis: `"social_facebook_link":"https:\/\/www.facebook.com\/profile.php?id=61584643820493"`
   - Fix: Ingår i KALLFALT_INSTALLNINGAR ovan. Lägg dessutom till i KALLORD som skyddsnät: 'facebook.com/profile.php?id=61584643820493'

🔴 **current.social_instagram_link pekar på Matstrumpors Instagram. Renderas som klickbar ikon i footern via samma brand_information-block (show_social: true).** · syns för kund
   - Bevis: `"social_instagram_link":"https:\/\/www.instagram.com\/matstrumpor.se\/"`
   - Fix: Ingår i KALLFALT_INSTALLNINGAR ovan. Lägg till i KALLORD: 'instagram.com/matstrumpor'

🔴 **brand_description är Matstrumpors säljtext och renderas i sidfoten på VARJE ny butik. factory/branding.mjs byggSettingsPatch() sätter bara color_schemes, typsnitt, radier och cart_type — settings.curr** · syns för kund
   - Bevis: `"brand_description":"<p>Strumpor som ser ut som mat – gåvan de skrattar åt först och använder varje vecka.</p><p><strong>Följ oss:</strong></p>" — renderas av sections/footer.liqui`
   - Fix: Lägg till 'brand_description: ""' i byggSettingsPatch() i factory/branding.mjs (eller bygg texten ur butikens branding.positionering). Lägg till KALLORD-strängen 'gåvan de skrattar åt först'.

🔴 **Källbutikens sociala konton ligger kvar och renderas som klickbara ikoner i sidfoten. Kunden i den nya butiken skickas till Matstrumpors Instagram och Facebook-sida.** · syns för kund
   - Bevis: `"social_facebook_link":"https://www.facebook.com/profile.php?id=61584643820493","social_instagram_link":"https://www.instagram.com/matstrumpor.se/" — sections/footer-group.json har`
   - Fix: Nolla alla nio social_*_link i byggSettingsPatch() (factory/branding.mjs) och sätt dem ur butikskonfigen om butiken har konton. KALLORD: 'instagram.com/matstrumpor.se', '61584643820493'.

🟠 **Judge.me-kärnblocket refererar källbutikens app-installation. Är Judge.me inte installerad i den nya butiken renderas ingenting — och recensionswidgeten på produktsidan blir tyst tom utan felmeddeland** · syns för kund
   - Bevis: `"judgeme_karna": {"type": "shopify://apps/judge-me-reviews/blocks/judgeme_core/61ccd3b1-a9f2-4160-9fe9-4fec8413e5d8", "disabled": false}`
   - Fix: KOD: kontroll.mjs ska verifiera att Judge.me är installerad i målbutiken innan temat godkänns — annars är blocken i både settings_data.json och templates/product.json döda.

🟠 **current.logo och current.brand_image pekar båda på en bildfil som bara finns i Matstrumpors Files. I en ny butik löser Shopify inte upp referensen — headern faller tillbaka på butiksnamn i text och fo** · syns för kund
   - Bevis: `"logo":"shopify:\/\/shop_images\/Namnlos_design_-_2026-03-19T120925.579.png" ... "brand_image":"shopify:\/\/shop_images\/Namnlos_design_-_2026-03-19T120925.579.png"`
   - Fix: Ingår i KALLFALT_INSTALLNINGAR ovan (logo, brand_image, favicon). Lägg till i KALLORD: 'namnlos_design_-_2026-03-19t120925.579.png' (skanningen sänker till gemener innan jämförelse).

🟠 **current.blocks är Matstrumpors app-inbäddningar: Judge.me OCH Klaviyo. Klaviyo är källbutikens e-postverktyg och hör inte hemma i en OPS-butik alls. Referenserna är dessutom döda i en ny butik (appen **
   - Bevis: `"blocks":{"judgeme_karna":{"type":"shopify:\/\/apps\/judge-me-reviews\/blocks\/judgeme_core\/61ccd3b1-a9f2-4160-9fe9-4fec8413e5d8","disabled":false,"settings":{}},"klaviyo":{"type"`
   - Fix: avbrandaInstallningar() tömmer current.blocks (koden i fynd 1 gör det). Lägg också till i KALLORD: 'klaviyo-email-marketing-sms' och 'judgeme_core/61ccd3b1'. Blocken ska sedan fyllas från den nya butikens LIVE-tema enligt PROCESS.md, inte från zip:en.

🟠 **Hela presets-blocket heter "Matstrumpor" och bär källbutikens fem färgscheman plus Mochiy-fonten. byggSettingsPatch() rör bara current — presets lämnas helt orört. Källbutikens namn står kvar i temaed**
   - Bevis: `"presets":{"Matstrumpor":{"logo_width":140,"color_schemes":{..."button":"#DD821D"...},"type_header_font":"mochiy_pop_p_one_n4","type_body_font":"mochiy_pop_p_one_n4"`
   - Fix: avbrandaInstallningar() gör `delete d.presets` (ingår i koden i fynd 1). Lägg också till 'mochiy_pop_p_one' i KALLORD — det ordet finns bara i presetet och i current, och fångar båda.

🟠 **Butikens logga och sidfotens brand-bild pekar på en bildfil som bara finns i Matstrumpors Files-bibliotek. I en ny butik löser handtaget inte upp — headern faller tillbaka på ren text och sidfotens br** · syns för kund
   - Bevis: `"logo":"shopify://shop_images/Namnlos_design_-_2026-03-19T120925.579.png" och "brand_image":"shopify://shop_images/Namnlos_design_-_2026-03-19T120925.579.png"`
   - Fix: Nolla 'logo' och 'brand_image' i byggSettingsPatch() så butiken visar shop.name tills riktig logga laddas upp. KALLORD: 'namnlos_design'.

🟠 **Hela preset-blocket heter källbutiken. Varje ny butiks temaredigerare visar en sparad temastil med namnet Matstrumpor, med källbutikens färger och typsnitt — ett klick från att lägga tillbaka allt som**
   - Bevis: `"presets":{"Matstrumpor":{"logo_width":140, ... "type_header_font":"mochiy_pop_p_one_n4" ... }} — presets-nyckeln rörs inte av byggSettingsPatch(), som bara patchar settings.curren`
   - Fix: Sätt `settings.presets = {}` i brand-steget i factory/ops.mjs (rad 129–134), direkt efter spreaden av byggSettingsPatch().

🟠 **`currency_code_enabled: false` — källbutikens val som enmarknadsbutik i SEK. Varje OPS-butik körs med SE OCH NO som standard, och både SEK och NOK skrivs "kr". En norsk kund ser alltså "499 kr" utan a** · syns för kund
   - Bevis: `config/settings_data.json, current: `"currency_code_enabled": false`. factory/butik-mall.yaml rad 20–24: marknader `- land: NO / locale: nb / valuta: NOK`, med kommentaren "STANDAR`
   - Fix: Lägg `currency_code_enabled: true` i objektet som byggSettingsPatch() returnerar i factory/branding.mjs, bredvid `cart_type: 'drawer'`. Samma motivering som cart_type: värdet får inte ärvas från vilket tema klonen råkade utgå från.

🟡 **current.logo_width och current.brand_image_width är inställda för Matstrumpors ordbild. De följer med varje ny butik och skalar den nya logotypen fel så fort någon fyller i logo-fältet.** · syns för kund
   - Bevis: `"logo_width":140 ... "brand_image_width":160`
   - Fix: Lägg in i byggSettingsPatch() i factory/branding.mjs så de sätts per butik: logo_width: 100, brand_image_width: 100 (Dawns egna default), eller ur branding.stil.

🟡 **current.type_header_font, current.type_body_font och samtliga sex color_schemes är Matstrumpors typsnitt (Mochiy Pop P One, en rundad japansk display-font) och orange palett #DD821D / #FAF7F2 / #F3EDE** · syns för kund
   - Bevis: `"type_header_font":"mochiy_pop_p_one_n4","type_body_font":"mochiy_pop_p_one_n4" ... "scheme-3":{"settings":{"background":"#DD821D",...}}`
   - Fix: Nolla i zip:en till NEUTRAL ur factory/branding.mjs: type_header_font/type_body_font = 'assistant_n4' och color_schemes = de neutrala grå (bakgrund #FFFFFF, yta #F5F5F5, accent #3A3A3A). Då syns en obrandad butik direkt i stället för att ärva Matstrumpors look, precis som NEUTRAL

🟡 **Två app-inbäddningar från källbutiken ligger kvar i temats blocks. Klaviyo ingår inte i OPS-uppsättningen (finns inte i factory/checklista.mjs) — inbäddningen är alltså en app-koppling som varken är b**
   - Bevis: `"blocks":{"judgeme_karna":{"type":"shopify://apps/judge-me-reviews/blocks/judgeme_core/61ccd3b1-a9f2-4160-9fe9-4fec8413e5d8","disabled":false},"klaviyo":{"type":"shopify://apps/kla`
   - Fix: Behåll judgeme_karna (Judge.me installeras per butik enligt checklistan och extension-UUID:t är samma i alla butiker) men ta bort klaviyo-blocket i byggSettingsPatch(). Verifiera med list-assets/temaredigeraren att Judge.me-blocket faktiskt laddar innan butiken släpps.

🟡 **Temat har ingen favicon-inställning alls, och byggSettingsPatch() sätter ingen. Varje OPS-butik körs alltså med webbläsarens default-ikon i fliken, trots att PROCESS.md säger att en favicon genereras ** · syns för kund
   - Bevis: `config/settings_data.json current saknar nyckeln `favicon` helt (samtliga 100+ nycklar genomgångna). layout/theme.liquid rad 10: `{%- if settings.favicon != blank -%}` — utan värde`
   - Fix: Ladda upp faviconen som en fil i butiken i temasteget och sätt `favicon: 'shopify://shop_images/<filnamn>'` i objektet från byggSettingsPatch() i factory/branding.mjs, på samma sätt som logotypen behöver hanteras. Det är samma patch-väg som redan används för cart_type och färgsch

🟡 **Källbutikens övriga utseendeinställningar överlever brandsteget. byggSettingsPatch() rör bara färgscheman, typsnitt, radier och cart_type — resten av Matstrumpors formgivning följer med: kantlinje på ** · syns för kund
   - Bevis: `config/settings_data.json current: `"buttons_border_thickness": 1` + `"buttons_border_opacity": 100` (varje knapp får en synlig ram), `"animations_hover_elements": "vertical-lift"``
   - Fix: Ta in fälten i brand-configen och skriv dem i byggSettingsPatch(): minst `buttons_border_opacity`, `buttons_border_thickness`, `animations_hover_elements`, `page_width` och `badge_position`. Alternativt sätt dem till neutrala värden i patchen (`buttons_border_opacity: 0`, `animat


### `templates/product.json` — 11 fynd

🔴 **Trust-raden i köprutan har Sverige och returpolicyn hårdkodade i mallen. byggProduktTemplate() rensar bara icon-with-text-block, så ms_trust följer med orörd — även till norska butiker.** · syns för kund
   - Bevis: `"ms_trust":{"type":"custom_liquid","settings":{"custom_liquid":"{% render 'ms-trust-row', items: 'truck:Fri frakt i Sverige|refresh:30 dagars öppet köp|lock:Trygg betalning' %}"}} `
   - Fix: KOD: byggProduktTemplate() ska skriva om ms_trust-blockets items ur butiksfilens marknad + fraktpolicy (samma mönster som SVENSK_SIGNAL redan använder för nb-locale). Inget KALLORD.

🔴 **Leveransestimatet i köprutan är Matstrumpors ledtid, hårdkodad i mallen och orörd av byggProduktTemplate(). Blir fel så fort en produkt har annan leverantör eller annat lager.** · syns för kund
   - Bevis: `"ms_delivery":{"type":"custom_liquid","settings":{"custom_liquid":"{% render 'ms-delivery-estimate', min_days: 5, max_days: 10, cutoff_hour: 0, text: 'Beräknad leverans' %}"}}`
   - Fix: KOD: min_days/max_days ska komma ur produktfilen (samma tal som fraktpolicyn i factory/frakt.mjs) — en butik som lovar 5–10 dagar på produktsidan och något annat i policyn är en reklamation.

🔴 **Produktmallen döljer varianterna. Det är Matstrumpors val (de säljer paket via ms-paket i stället). En OPS-produkt med riktiga varianter — färg, storlek — får en produktsida där kunden inte kan välja.** · syns för kund
   - Bevis: `main.settings: "hide_variants": true (samtidigt som block "variant_picker" ligger i block_order)`
   - Fix: KOD: byggProduktTemplate() ska sätta hide_variants: false när produktfilen har fler än en variant och inget paketerbjudande använder dem.

🔴 **Produktsidans FAQ-sektion är Matstrumpors, inte bara supportmejlet: sockstorlekar, presentförpackning som ser ut som mat, svensk fraktutfästelse och ett Köp 1 – Få 1-erbjudande som inte finns i den ny** · syns för kund
   - Bevis: `"a": "<p>En storlek passar de flesta, ungefär strl 36–44.</p>"
"a": "<p>Ja. Alla par levereras i en presentförpackning som ser ut som riktig mat — redo att ges bort utan inslagning`
   - Fix: KALLORD += 'en storlek passar de flesta', 'presentförpackning som ser ut som riktig mat', 'strl 36–44', 'köp 1 – få 1'. Bygg en rensaProduktFaq() som tömmer ms-faq-section-blocken i templates/product.json och fyller dem ur produktfilens egna frågor — hela FAQ:n måste bytas, inte 

🔴 **Ett custom_liquid-block i köprutan hårdkodar trygghetsraden med en svensk fraktutfästelse. Ligger som ren Liquid inuti JSON-mallen, så en skanning på sektionstyper missar den helt — och för en norsk O** · syns för kund
   - Bevis: `blocks.ms_trust.settings.custom_liquid: "{% render 'ms-trust-row', items: 'truck:Fri frakt i Sverige|refresh:30 dagars öppet köp|lock:Trygg betalning' %}"`
   - Fix: Skanna custom_liquid-strängar i alla templates/*.json som om de vore Liquid-filer (dagens skannaFil() läser JSON:en radvis, men index.json och product.json är enradiga — den flaggar hela raden eller inget). Byt items-strängen mot butikens egna löften ur factory/butiker/<id>.yaml 

🔴 **Hela FAQ-sektionen (6 frågor) är Matstrumpors och handlar om strumpor, skostorlek och presentförpackning. Bara supportmejlet i q6 är känt sedan tidigare — de fem andra svaren passerar skanningen helt.** · syns för kund
   - Bevis: `q1: "Passar de alla?" → "<p>En storlek passar de flesta, ungefär strl 36–44.</p>"; q3: "<p>Ja. Alla par levereras i en presentförpackning som ser ut som riktig mat — redo att ges b`
   - Fix: KALLORD: 'strl 36–44', 'en storlek passar de flesta', 'som ser ut som riktig mat', '5–10 arbetsdagar med fri frakt'. Bäst: låt fabriken skriva om HELA ms_faq_section-blocket ur produktfilens FAQ i stället för att lita på skanningen.

🔴 **Trygghetsraden direkt under köpknappen på produktsidan lovar 30 dagars öppet köp och fri frakt i Sverige. byggProduktTemplate() i factory/tema.mjs behåller blocket — den ankrar till och med den svensk** · syns för kund
   - Bevis: `rad 31: "custom_liquid": "{% render 'ms-trust-row', items: 'truck:Fri frakt i Sverige|refresh:30 dagars öppet köp|lock:Trygg betalning' %}"`
   - Fix: byggProduktTemplate() i /Users/axelodhner/Desktop/OPS FACTORY/yognftnfgn-main/factory/tema.mjs ska skriva om ms_trust-blockets custom_liquid ur butikens yaml (fraktrad + retur.oppet_kop_dagar) i stället för att lämna det orört — eller ta bort blocket helt och låta opf-garanti bär

🔴 **Leveransbeskedet på produktsidan är hårdkodat på Matstrumpors fönster 5–10 arbetsdagar. Det renderas inte som ett spann utan räknas om till ett KONKRET DATUM av <ms-delivery> i ms-cro.js. butik-mall.y** · syns för kund
   - Bevis: `rad 37: "custom_liquid": "{% render 'ms-delivery-estimate', min_days: 5, max_days: 10, cutoff_hour: 0, text: 'Beräknad leverans' %}"`
   - Fix: byggProduktTemplate() ska skriva om ms_delivery-blocket med min_days/max_days parsade ur butik.frakt.leveranstid (och produktfilens override). Lägg 'arbetsdagar' i VILLKORSORD så skanningen larmar när en siffra ligger kvar i en template.

🟠 **Produktmallens FAQ har sex Matstrumpor-svar: sockstorlek, deras Köp 1 – Få 1-erbjudande, matförpackningen och supportmejlen. Sektionen tas bort av byggProduktTemplate() eftersom 'ms-faq-section' står **
   - Bevis: `"q1":{"q":"Passar de alla?","a":"<p>En storlek passar de flesta, ungefär strl 36–44.</p>"}, "q2":{"q":"Hur fungerar Köp 1 – Få 1?","a":"<p>Välj paketet i köprutan...gratisdelarna f`
   - Fix: KALLORD: 'köp 1 – få 1' och 'strl 36–44'. KOD: dokumentera i kallskanning.mjs att skydd nr 1 är UTGANGNA_TYPER i tema.mjs — den listan och KALLSEKTIONER måste hållas ihop, annars återuppstår FAQ:n den dag någon tar bort 'ms-faq-section' ur UTGANGNA_TYPER.

🟠 **Judge.me-blocken i produktmallen bär källbutikens app-extension-referens och ligger i block_order/order. Utan Judge.me i målbutiken blir stjärnbetyget under titeln och recensionswidgeten tomma hål mit** · syns för kund
   - Bevis: `"judgeme_stjarnor":{"type":"shopify://apps/judge-me-reviews/blocks/preview_badge/61ccd3b1-a9f2-4160-9fe9-4fec8413e5d8"} och "judgeme_widget":{"type":"apps","blocks":{"w":{"type":"s`
   - Fix: KOD: byggProduktTemplate() ska plocka bort judgeme-blocken när factory/judgeme.mjs inte har kunnat verifiera installationen — i dag antas appen finnas.

🟠 **Produktmallens FAQ-sektion bär sex av källbutikens villkor: leveranstid, betalmetodslista, returfrist med Matstrumpors supportmejl, ett Köp 1 – Få 1-erbjudande som inte finns i den nya butiken, storle**
   - Bevis: `rad 110: "q": "Hur fungerar Köp 1 – Få 1?" — rad 125: "5–10 arbetsdagar med fri frakt inom Sverige." — rad 132: "Klarna, kort (Visa, Mastercard, American Express m.fl.), Apple Pay,`
   - Fix: Ta bort ms_faq_section ur zip:ens templates/product.json så den inte finns att lägga tillbaka, i stället för att lita på UTGANGNA_TYPER. Lägg 'klarna', 'paypal', 'shop pay', 'apple pay', 'google pay', 'köp 1 – få 1' i VILLKORSORD.


### `sections/header-group.json` — 7 fynd

🔴 **HELT MISSAD FIL. Sektionsgruppen skrivs aldrig av factory/, och tredje announcement-raden är Matstrumpors presentlöfte — den snurrar högst upp på VARJE sida i butiken.** · syns för kund
   - Bevis: `"a3":{"type":"announcement","settings":{"text":"Levereras presentklart","link":""}} — och grep visar att varken 'header-group' eller 'index.json' förekommer i factory/*.mjs utanför`
   - Fix: KALLORD: 'levereras presentklart'. KOD: lägg 'sections/header-group.json' i KANDA_SMITTADE och bygg announcement-blocken ur butiksfilen.

🔴 **De två andra announcement-raderna låser fast Sverige och en returpolicy i mallen. Norska OPS-butiker (kontot är MagiBorsten DK, marknaderna SE och NO) får 'Fri frakt i hela Sverige' i toppbanderollen.** · syns för kund
   - Bevis: `"a1":{"settings":{"text":"Fri frakt i hela Sverige"}},"a2":{"settings":{"text":"30 dagars öppet köp"}}`
   - Fix: KOD: announcement-texterna genereras ur butiksfilens marknad + fraktpolicy. INGET KALLORD — 'Fri frakt i hela Sverige' är korrekt copy för en svensk butik och skulle ge falsklarm.

🔴 **Aviseringsraden överst på VARJE sida bär Matstrumpors presentbutikslöfte. Ingen kod rör header-group — bara footer-group är känd som smittad.** · syns för kund
   - Bevis: `rad 25: "text": "Levereras presentklart"  (samt "Fri frakt i hela Sverige" och "30 dagars öppet köp" i samma block a1/a2/a3)`
   - Fix: Lägg 'sections/header-group.json' i KANDA_SMITTADE. KALLORD += 'levereras presentklart'. Skriv en avbrandaAviseringsrad() som byter de tre announcement-blocken mot butikens egna USP:ar ur factory/butiker/<id>.yaml.

🔴 **HELT NY SMITTAD FIL — står inte i KANDA_SMITTADE och innehåller inget varumärkesord, så nuvarande skanning ger noll träffar. Annonsraden högst upp på varje sida bär Matstrumpors tre löften: ett gåvolö** · syns för kund
   - Bevis: `"a1": {"settings": {"text": "Fri frakt i hela Sverige"}}, "a2": {"text": "30 dagars öppet köp"}, "a3": {"text": "Levereras presentklart"}`
   - Fix: Lägg 'sections/header-group.json' i KANDA_SMITTADE. Bygg en avbrandaAnnonsrad() som tömmer announcement-bar-blocken, eller sätt texterna ur butikskonfigen. KALLORD: 'levereras presentklart', 'fri frakt i hela sverige'.

🔴 **Annonseringsbaren högst upp på VARJE sida lovar 30 dagars öppet köp. Butiksmallen factory/butik-mall.yaml sätter oppet_kop_dagar: 14, och factory/policyer.mjs skriver returpolicysidan på 14 dagar. Sam** · syns för kund
   - Bevis: `rad 18: "text": "30 dagars öppet köp"  (block a2 i announcement-bar)`
   - Fix: Ny funktion i factory/kallskanning.mjs: byggAnnonseringsbar(butik) som skriver om announcement-blocken ur butiker/<id>.yaml (retur.oppet_kop_dagar, frakt.fri_globalt, frakt.leveranstid). Anropas från ops.mjs på sections/header-group.json, precis som byggProduktTemplate anropas på

🔴 **Samma annonseringsbar lovar fri frakt i HELA SVERIGE och att varan levereras presentklart. Geograficlaimet är fel på varje NO-butik (OPS-kontot kör SE och NO), och presentförpackningen är Matstrumpors** · syns för kund
   - Bevis: `rad 11: "text": "Fri frakt i hela Sverige" — rad 25: "text": "Levereras presentklart"`
   - Fix: Samma byggAnnonseringsbar(butik) som ovan. VILLKORSORD ska innehålla 'fri frakt i hela sverige', 'fri frakt i sverige', 'fri frakt inom sverige', 'levereras presentklart', 'presentförpackning'.

🟠 **Annonsraden högst upp bär Matstrumpors gåvo-copy och en fraktutfästelse som inte gäller någon annan butik. Ligger i en sektionsgrupp som ingen hittills pekat ut (bara footer-group.json är känd), och i** · syns för kund
   - Bevis: `"a3":{"type":"announcement","settings":{"text":"Levereras presentklart","link":""}} — samt a1 "Fri frakt i hela Sverige" och a2 "30 dagars öppet köp"`
   - Fix: Lägg till i KALLORD: 'levereras presentklart' och 'fri frakt i hela sverige'. Lägg till 'sections/header-group.json' i KANDA_SMITTADE. Texterna ska skrivas per butik i /ny-ops, inte ärvas.


### `sections/footer-group.json` — 5 fynd

🔴 **Footerns företagsblock länkar till /pages/om-oss. Factory skapar bara returpolicy, fraktpolicy, kopvillkor och contact (factory/policyer.mjs rad 176–178 + ops.mjs skrivSida('contact')). Länken är allt** · syns för kund
   - Bevis: `"subtext": "<p>Matstrumpor.se drivs av<br/>STONEBITE ECOM AB<br/>Org.nr 559576-2401</p><p>kundsupport@matstrumpor.se</p><p><a href=\"/pages/om-oss\">Läs mer om oss</a></p>"`
   - Fix: KALLORD: '/pages/om-oss'. KOD: bolagsblocket ska genereras (butiksnamn + org.nr + supportmejl ur butiksfilen) och länken bara sättas om sidan faktiskt skapas.

🔴 **NYHETSBREVET RENSAS INTE. KALLSEKTIONER innehåller 'newsletter', men footer-group.json har ingen sektion av den typen — nyhetsbrevet är en INSTÄLLNING på footer-sektionen. avbrandaSektionsgrupp() matc** · syns för kund
   - Bevis: `footer-sektionens settings: "newsletter_enable": true, "newsletter_heading": "Missa inga nyheter" — och avbrandaSektionsgrupp() gör 'if (KALLSEKTIONER.includes(sektion?.type))'. Se`
   - Fix: KOD: utöka avbrandaSektionsgrupp() med en inställningsregel, t.ex. KALLINSTALLNINGAR = [['footer','newsletter_enable',false]], och sätt newsletter_enable: false + rensa newsletter_heading. KALLORD: 'missa inga nyheter'.

🔴 **Footerns brand_information-block har show_social: true och renderar därmed brand_description + sociala länkar ur config/settings_data.json — som är Matstrumpors (se separat fynd på den filen).** · syns för kund
   - Bevis: `"brand":{"type":"brand_information","settings":{"show_social":true}}`
   - Fix: KOD: sätt show_social: false tills butiken har egna konton, och patcha brand_description/social_*_link i byggSettingsPatch().

🟠 **Footerns nyhetsbrevsformulär kommer INTE från en sektion av typen 'newsletter' utan från footer-sektionens egen inställning newsletter_enable: true (footer.liquid:168 `{%- if section.settings.newslett** · syns för kund
   - Bevis: `"settings":{"color_scheme":"scheme-6","newsletter_enable":true,"newsletter_heading":"Missa inga nyheter","enable_follow_on_shop":true,...}`
   - Fix: Utöka avbrandaSektionsgrupp() i factory/kallskanning.mjs med en inställningsspärr utöver typkollen:

export const KALLINSTALLNINGAR = { footer: { newsletter_enable: false } };

// i avbrandaSektionsgrupp(), inuti loopen över data.sections:
const spar = KALLINSTALLNINGAR[sektion?.

🟠 **Sidfotens kolumn "Snabblänkar" pekar på menyn `main-menu`, som fabriken aldrig skriver. Fabriken skapar bara menyn `footer`. Varje ny OPS-butik får därför en sidfotskolumn med Shopifys default-meny — ** · syns för kund
   - Bevis: `sections/footer-group.json rad 20–24: `"snabblankar": { "type": "link_list", "settings": { "heading": "Snabblänkar", "menu": "main-menu" } }`. header-group.json rad 44: `"menu": "m`
   - Fix: Skriv main-menu i samma steg som footer-menyn i ops.mjs: `await skrivMeny('main-menu', 'Huvudmeny', [{ titel: p.produkt.namn, url: `/products/${p.produkt.id}` }, ...ctx.menylankar])`. Alternativt peka om footer-blocket `snabblankar` till menyn `footer` — men då står två identiska


### `sections/ms-compare.liquid` — 2 fynd

🔴 **Jämförelsetabellens schema-defaults namnger källbutiken. Både rubriken och "vår kolumn" säger Matstrumpor — de skrivs in i sidan i samma sekund som sektionen läggs till i temaredigeraren.** · syns för kund
   - Bevis: `rad 67: { "type": "text", "id": "heading", "label": "Rubrik", "default": "Matstrumpor mot en vanlig present" },
rad 69: { "type": "text", "id": "us_label", "label": "Vår kolumn", "`
   - Fix: KALLORD += 'matstrumpor mot en vanlig present'. Ordet 'matstrumpor' finns redan i listan men skanningen tittar aldrig i sections/*.liquid — utöka KANDA_SMITTADE/skanningen till att köra skannaFil() på ALLA .liquid i sections/, snippets/ och blocks/, inte bara JSON-mallarna. Byt d

🔴 **Källbutikens BRANDNAMN står som schema-default på två fält. Läggs sektionen till i en ny butik får kunden se ordet Matstrumpor i rubriken och som kolumnrubrik. Skanningen hittar detta i dag (KALLORD '** · syns för kund
   - Bevis: `rad 67: `{ "type": "text", "id": "heading", "label": "Rubrik", "default": "Matstrumpor mot en vanlig present" }` och rad 69: `"id": "us_label", "label": "Vår kolumn", "default": "M`
   - Fix: Byt defaults till "{{ brand }} mot en vanlig lösning" respektive tom sträng, och låt factory/tema.mjs skriva in butikens brand. Skanna alltid `"default":` i alla {% schema %}-block — inte bara löptext.


### `blocks/ms-faq.liquid` — 3 fynd

🔴 **FAQ-blockets default är Matstrumpors två frågor: sockstorlek och svensk frakt. Läggs blocket till i köprutan skrivs de rakt ut.** · syns för kund
   - Bevis: `rad 8: "default": "Passar de alla?::En storlek passar de flesta, ungefär strl 36–44.|Hur snabbt kommer de?::5–10 arbetsdagar med fri frakt inom Sverige."`
   - Fix: KALLORD += 'en storlek passar de flesta'. Sätt "default": "" — ms-faq.liquid renderar redan ingenting när pairs är tomt.

🔴 **Schema-defaulten är hela Matstrumpors FAQ: skostorlek 36–44 och svensk fraktledtid. Inget varumärkesord — nuvarande skanning ger noll träffar.** · syns för kund
   - Bevis: `rad 8: `"default": "Passar de alla?::En storlek passar de flesta, ungefär strl 36–44.|Hur snabbt kommer de?::5–10 arbetsdagar med fri frakt inom Sverige."``
   - Fix: Töm defaulten (blocket ska dölja sig självt utan data). KALLORD: 'strl 36–44', 'en storlek passar de flesta'.

🟠 **FAQ-blockets default innehåller både strumpstorlekar och källbutikens leverans- och fraktlöfte, färdigt att landa på en produktsida.** · syns för kund
   - Bevis: `rad 8: "default": "Passar de alla?::En storlek passar de flesta, ungefär strl 36–44.|Hur snabbt kommer de?::5–10 arbetsdagar med fri frakt inom Sverige."`
   - Fix: Töm default till "".


### `blocks/ms-points.liquid` — 3 fynd

🔴 **Säljpunkterna i köprutan är Matstrumpors: en storlek passar alla (strumpor) och presentförpackning (deras gåvokoncept). Falskt för varje OPS-produkt.** · syns för kund
   - Bevis: `rad 10: "default": "En storlek passar alla|Levereras i presentförpackning|Premiumkvalitet som håller"`
   - Fix: KALLORD += 'en storlek passar alla', 'levereras i presentförpackning'. Sätt "default": "" — snippeten renderar tomt utan punkter.

🔴 **Säljpunkterna är strumpornas: 'En storlek passar alla' och 'Levereras i presentförpackning'. Inget varumärkesord, så skanningen är blind.** · syns för kund
   - Bevis: `rad 10: `"default": "En storlek passar alla|Levereras i presentförpackning|Premiumkvalitet som håller"``
   - Fix: Töm defaulten. KALLORD: 'en storlek passar alla', 'levereras i presentförpackning'.

🟠 **Säljpunkternas default lovar presentförpackning och 'en storlek passar alla' — källbutikens produktlöften, inte den nya butikens.** · syns för kund
   - Bevis: `rad 10: "default": "En storlek passar alla|Levereras i presentförpackning|Premiumkvalitet som håller"`
   - Fix: Töm default till "".


### `sections/ms-skrapkort.liquid` — 5 fynd

🔴 **Rabattkoden i skrapkortet är hårdkodad som Matstrumpors klubbkod. Sektionen tas visserligen bort ur footer-group av avbrandaSektionsgrupp(), men FILEN och dess preset följer med, så den går att lägga ** · syns för kund
   - Bevis: `rad 524: "default": "KLUBB10",
rad 525: "info": "Måste finnas som riktig rabattkod i Shopify — popupen skapar den inte."
rad 532: "default": "10 %"`
   - Fix: KALLORD += 'klubb10'. Bäst: radera sections/ms-skrapkort.liquid + assets-beroendet helt ur zip:en i stället för att bara plocka bort sektionen ur gruppen — annars kommer den tillbaka via preset-listan i temaredigeraren.

🔴 **Popupen delar ut en rabattkod som inte finns i den nya butikens Shopify. Kunden mejlar sin adress, får KLUBB10, klickar 'Handla med 10 % rabatt' och kassan avvisar koden. avbrandaSektionsgrupp() tar b**
   - Bevis: `rad 524: "default": "KLUBB10" — rad 531: "default": "10 %" — rad 84: Handla med {{ rabatt_fast }} rabatt`
   - Fix: Radera sections/ms-skrapkort.liquid ur ops-tema.zip helt (den ligger redan i KALLSEKTIONER — filen ska inte finnas kvar heller). Går den inte att radera: töm defaults för kod och rabatt_text så sektionen inte kan lova något. Lägg 'klubb10' i VILLKORSORD.

🟠 **Popupens platshållare och finstilt är svenska och refererar till Matstrumpors paketprislogik.** · syns för kund
   - Bevis: `rad 69: placeholder="din@mejl.se"
rad 88: Gäller inte ihop med paketpriserna.`
   - Fix: Täcks av att hela filen tas bort (se KLUBB10-fyndet). Görs inte det: KALLORD += 'din@mejl.se'.

🟠 **Källbutikens rabattkod ligger som schema-default. Sektionen städas visserligen bort av avbrandaSektionsgrupp(), men koden ligger kvar i filen och kommer tillbaka om någon lägger till sektionen manuell** · syns för kund
   - Bevis: `rad 524: `"default": "KLUBB10"`; rad 512 `"default": "Skrapa fram din välkomstrabatt"`; rad 518 `"default": "Alla vinner – guldet döljer din rabatt."``
   - Fix: KALLORD: 'klubb10'. Radera filen sections/ms-skrapkort.liquid ur bas-zipen — sektionen är redan förbjuden via KALLSEKTIONER, då ska koden inte heller följa med.

🟡 **Popupens finstilta länkar till /policies/privacy-policy, en sida fabriken aldrig skapar — policyer.mjs skriver bara returpolicy, fraktpolicy och köpvillkor. Samtidigt taggar formuläret varje mejladres** · syns för kund
   - Bevis: `sections/ms-skrapkort.liquid rad 76–78: `<a href="/policies/privacy-policy">Integritetspolicy</a>`. Rad 60: `<input type="hidden" name="contact[tags]" value="newsletter,skrapkort">`
   - Fix: Sektionen ska bort ur footer-group ändå (fix i fyndet om avbrandaSektionsgrupp). Den kvarvarande luckan är riktig och egen: lägg till `{ type: 'PRIVACY_POLICY', namn: 'Integritetspolicy', handle: 'integritetspolicy', body: integritetspolicy(p) }` i byggPolicyer() i factory/policy


### `snippets/ms-trust-row.liquid` — 3 fynd

🔴 **Källbutikens fraktlöfte är hårdkodat som kodfallback, inte bara som schema-default — och exakt samma sträng står inklistrad i templates/product.json som custom_liquid. Fel på NO-marknaden, som är stan** · syns för kund
   - Bevis: `rad 8: `assign fallback = 'truck:Fri frakt i Sverige|refresh:30 dagars öppet köp|lock:Trygg betalning'` — och templates/product.json: "custom_liquid": "{% render 'ms-trust-row', it`
   - Fix: KALLORD: 'fri frakt i sverige'. Byt fallbacken mot tom sträng så blocket döljer sig självt när butiken inte fyllt i, och låt fabriken sätta items ur butikens frakt-config (factory/frakt.mjs).

🔴 **Värsta sortens fynd: villkoren är HÅRDKODADE SOM FALLBACK I KODEN. Tömmer man inställningen i temaeditorn kommer Matstrumpors text tillbaka, eftersom `items | default: fallback` slår till på tom strän** · syns för kund
   - Bevis: `rad 8: assign fallback = 'truck:Fri frakt i Sverige|refresh:30 dagars öppet köp|lock:Trygg betalning'`
   - Fix: Ändra rad 8 till assign fallback = '' i zip:en, och låt snippeten rendera ingenting när items är tomt (villkoret rows.size > 0 finns redan). Skanningen måste dessutom täcka .liquid-filer, inte bara JSON — skannaTema() gör det redan, men KALLORD innehåller inga villkorsord.

🟠 **Trygghetsradens inbyggda fallback lovar fri frakt i SVERIGE. Den slår in så fort items är tomt — alltså på en norsk OPS-butik som inte fyllt i raden. Samma sträng som default i blocks/ms-trust.liquid ** · syns för kund
   - Bevis: `rad 8: assign fallback = 'truck:Fri frakt i Sverige|refresh:30 dagars öppet köp|lock:Trygg betalning'`
   - Fix: Detta hör INTE hemma i KALLORD (en svensk OPS-butik kan ha samma löfte). Lägg i stället en ny lista i kallskanning.mjs: export const KOLLA_POLICY = ['fri frakt i sverige','fri frakt i hela sverige','fri frakt inom sverige','30 dagars öppet köp','5–10 arbetsdagar'] — träffar där k


### `blocks/ms-size.liquid` — 2 fynd

🔴 **Hela storleksguiden är en sockguide: skostorlekar, fotlängder och en fotnot om att strumporna är stretchiga. Alla fyra fälten är schema-defaults, så blocket fylls automatiskt när det läggs till.** · syns för kund
   - Bevis: `rad 14: "default": "Passar de här mig?"
rad 15: "default": "Storlek;Fotlängd;Motsvarar"
rad 18: "default": "36–38;23–24 cm;Small|39–41;25–26 cm;Medium|42–44;27–28 cm;Large"
rad 21:`
   - Fix: KALLORD += 'strumporna är stretchiga', 'storlek;fotlängd;motsvarar', '36–38;23–24 cm'. Töm alla fyra defaults i blocks/ms-size.liquid (lämna tomma strängar) så blocket renderar ingenting förrän någon fyllt i det — snippeten returnerar redan tomt när rader saknas.

🟠 **Storleksguidens defaults är en komplett strumpstorlekstabell med fotlängder, plus en fotnot om att strumporna är stretchiga. Läggs blocket till på en kamera- eller damaskbutik är hela passformslöftet ** · syns för kund
   - Bevis: `rad 18: "default": "36–38;23–24 cm;Small|39–41;25–26 cm;Medium|42–44;27–28 cm;Large" — rad 21: "default": "Strumporna är stretchiga — hamnar du mellan två storlekar fungerar båda."`
   - Fix: Töm defaults för rader, kolumner och fotnot till "".


### `sections/ms-reviews.liquid` — 1 fynd

🔴 **Omdömessektionens rubrik-default är gåvocopy från presentbutiken. Samma sträng ligger i sections/ms-review-slider.liquid rad 64.** · syns för kund
   - Bevis: `rad 70: { "type": "text", "id": "heading", "label": "Rubrik", "default": "Presenten som alltid landar rätt" },`
   - Fix: KALLORD += 'presenten som alltid landar rätt'. Byt båda defaults (ms-reviews.liquid:70 och ms-review-slider.liquid:64) till "Vad kunderna säger" eller töm dem.


### `sections/ms-usp-bar.liquid` — 2 fynd

🔴 **USP-radens default innehåller presentbutikens två påståenden — presentklar leverans och 'älskad av tusentals svenskar' (ett socialt bevis den nya butiken inte har).** · syns för kund
   - Bevis: `rad 23: "default": "truck:Fri frakt i Sverige|refresh:30 dagars öppet köp|gift:Levereras presentklart|star:Älskad av tusentals svenskar",`
   - Fix: KALLORD += 'älskad av tusentals svenskar', 'levereras presentklart'. Byt default till butikens egna USP:ar ur butiksfilen; ta bort star-punkten helt tills butiken har recensioner.

🟠 **Sektionens schema-default är källbutikens fyra villkor. Lägger VA:n eller Axel till USP-baren på en ny sida landar Matstrumpors löften direkt i kundvyn utan att någon skrivit dem.** · syns för kund
   - Bevis: `rad 23: "default": "truck:Fri frakt i Sverige|refresh:30 dagars öppet köp|gift:Levereras presentklart|star:Älskad av tusentals svenskar"`
   - Fix: Töm default till "" i zip:en. Alla schema-defaults i temat ska vara tomma eller neutrala — de är en osynlig kanal för källbutikens innehåll.


### `sections/ms-marquee.liquid` — 3 fynd

🔴 **Det rullande bandets default är samma fyra Matstrumpor-påståenden, inklusive presentklar leverans och tusentals svenskar. Bandet är startsidans mest synliga element efter hero:n.** · syns för kund
   - Bevis: `rad 38: "default": "Älskad av tusentals svenskar|Fri frakt i Sverige|30 dagars öppet köp|Levereras presentklart",`
   - Fix: Samma KALLORD som ovan. Byt default; sätt även färgerna rad 42–43 (#dd821d / #fdfbf7 = Matstrumpors orange) till butikens egna.

🟠 **Matstrumpors accentfärg (bärnstensorange) ligger som färg-default på löpbandets bakgrund. factory/branding.mjs skriver om --ms-accent och color_schemes, men rör inte enskilda sektioners färg-defaults ** · syns för kund
   - Bevis: `rad 42–43: `{ "type": "color", "id": "background", "label": "Bakgrund", "default": "#dd821d" }, { "type": "color", "id": "text_color", "label": "Textfärg", "default": "#fdfbf7" }``
   - Fix: KALLORD: 'dd821d', 'fdfbf7'. Byt defaults till Dawns färgschema-koppling (color_scheme) i stället för hårda hexvärden.

🟠 **Samma sak för löpbandet: schema-defaulten är källbutikens villkorsrad.** · syns för kund
   - Bevis: `rad 38: "default": "Älskad av tusentals svenskar|Fri frakt i Sverige|30 dagars öppet köp|Levereras presentklart"`
   - Fix: Töm default till "".


### `snippets/ms-guarantee.liquid` — 2 fynd

🔴 **Samma fälla en gång till: garantikortets rubrik faller tillbaka på källbutikens returfrist om rubriken lämnas tom.** · syns för kund
   - Bevis: `rad 6: assign head = title | default: '30 dagars öppet köp'`
   - Fix: Ändra rad 6 till assign head = title, och rendera inte kortet alls när head är tomt.

🟠 **Garantitexten '30 dagars öppet köp' är hårdkodad på tre ställen och ärvs som ett löfte ingen i den nya butiken har tagit ställning till.** · syns för kund
   - Bevis: `snippets/ms-guarantee.liquid rad 6: assign head = title | default: '30 dagars öppet köp'
blocks/ms-guarantee.liquid rad 10/12: "default": "30 dagars öppet köp" / "<p>Inte nöjd? Hör`
   - Fix: KOLLA_POLICY (se ovan), inte KALLORD. Ersätt de tre defaults med värden ur butiksfilens returvillkor; ta bort default-strängen i snippeten helt så den kräver ett title-argument.


### `snippets/ms-paket.liquid` — 1 fynd

🔴 **Paketnivåerna hämtas ur metaobjektet ms_paketniva, som är en definition i MATSTRUMPORS Shopify-admin. En ny butik har inte definitionen, så hela paketväljaren renderar TYST ingenting — köprutan blir t** · syns för kund
   - Bevis: `rad 30: assign alla = shop.metaobjects.ms_paketniva.values
rad 33: {%- if p and p.available and alla.size > 0 -%}   (falskt → hela blocket hoppas över)`
   - Fix: Detta är ingen textsträng — det behöver en egen kontroll. Skriv kontrolleraMetaobjekt() i factory/ som via Shopify Admin API verifierar att definitionen ms_paketniva finns i den nya butiken och skapar den annars (fälten: produkt, antal, rubrik, underrubrik, bricka, fastpris, raba


### `assets/ms-cro.js, assets/ms-paket.js, sections/ms-reviews.liquid, snippets/ms-bundle-picker.liquid m.fl. (24 ms-*-filer)` — 1 fynd

🔴 **Hela konverteringslagret kringgår språkfilerna. NOLL av de 24 ms-*-filerna använder översättningsfiltret `| t` eller en `t:`-nyckel (jämför: sections/main-product.liquid har 349 t:-nycklar). Norsk mar** · syns för kund
   - Bevis: `assets/ms-cro.js:335 `'...s</strong> så packas den idag.'`; ms-cro.js:441 `'Slå på ljudet'`; ms-paket.js:229 `knapp.textContent = 'Lägger i…'`; ms-paket.js:291 `'Det gick inte att `
   - Fix: Skriv en ny kontroll i factory/kallskanning.mjs: skannaOoversattbart(filer) som flaggar varje ms-*-fil med kundtext utan `| t`. Långsiktig fix: flytta strängarna till locales/sv.json + locales/nb.json under nyckeln `ms.*` och byt till `{{ 'ms.bundle.valj_paket' | t }}`. Kortsikti


### `blocks/ms-size.liquid + snippets/ms-size-guide.liquid` — 1 fynd

🔴 **Storleksguiden är byggd för fötter. Kolumnrubriken 'Fotlängd' står både som schema-default OCH som kodfallback i snippeten, så den slår igenom även om blocket lämnas tomt. En övervakningskamera eller ** · syns för kund
   - Bevis: `blocks/ms-size.liquid:15 `"id": "kolumner", "label": "Kolumnrubriker", "default": "Storlek;Fotlängd;Motsvarar"`; rad 21 `"default": "Strumporna är stretchiga — hamnar du mellan två`
   - Fix: KALLORD: 'fotlängd', 'strumporna är stretchiga'. Byt båda defaults till tom sträng och låt snippeten dölja sig när kolumner saknas.


### `sections/ms-usp-bar.liquid + sections/ms-marquee.liquid + blocks/ms-trust.liquid` — 1 fynd

🔴 **Samma tre källbutikslöften som schema-default i tre olika sektioner. 'Levereras presentklart' gäller bara en presentprodukt; 'Fri frakt i Sverige' är fel så fort NO-marknaden är på (standard i varje O** · syns för kund
   - Bevis: `ms-usp-bar.liquid:23 `"default": "truck:Fri frakt i Sverige|refresh:30 dagars öppet köp|gift:Levereras presentklart|star:Älskad av tusentals svenskar"`; ms-marquee.liquid:38 `"defa`
   - Fix: KALLORD: 'levereras presentklart', 'älskad av tusentals svenskar', 'fri frakt i sverige'. Töm alla tre defaults och låt factory/frakt.mjs + butikskonfigen fylla dem.


### `snippets/ms-delivery-estimate.liquid` — 1 fynd

🔴 **Leveransfönstret har källbutikens siffror som default i koden, och reservtexten '5–10 arbetsdagar' skrivs ut i serverns HTML — den syns alltså även innan JavaScript hunnit räkna om, och för besökare u** · syns för kund
   - Bevis: `rad 11–12: assign mn = min_days | default: 5 / assign mx = max_days | default: 10 — rad 24: <span class="ms-delivery__date" data-ms-delivery-range>{{ mn }}–{{ mx }} arbetsdagar</sp`
   - Fix: Ta bort default-värdena (default: 5 / default: 10) och rendera hela <ms-delivery> bara när min_days och max_days är satta. Butikens riktiga siffror kommer ur butik.frakt.leveranstid.


### `factory/tema.mjs` — 1 fynd

🔴 **byggProduktTemplate() städar bort ms-faq-section men lämnar ms_trust och ms_delivery orörda — och använder ms_trust som ankarpunkt för den svenska varumärkessignalen. Resultatet är att varje fabriksby** · syns för kund
   - Bevis: `rad 379: const efterTrust = ordningMain.indexOf('ms_trust'); — UTGANGNA_TYPER (rad 313–323) innehåller 'ms-faq-section' men varken ms_trust eller ms_delivery`
   - Fix: Lägg till en omskrivning av custom_liquid-blocken i byggProduktTemplate: alla block vars custom_liquid matchar /ms-trust-row|ms-delivery-estimate/ byggs om ur butikens yaml, eller tas bort. Mönstret finns redan i samma fil — GARANTI-sektionen läser metafält i stället för att hård


### `factory/ops.mjs` — 1 fynd

🔴 **Ingen kod rör templates/index.json. ops.mjs hämtar och skriver bara templates/product.json, så hela Matstrumpors startsida — marquee, USP-bad, trygghetsblock, garanti, FAQ och recensioner — publiceras** · syns för kund
   - Bevis: `rad 164–166: const befintlig = await hamtaTemafil(tema.id, 'templates/product.json'); … await skrivTemafiler(tema.id, { 'templates/product.json': byggProduktTemplate(befintlig) });`
   - Fix: Skriv byggIndexTemplate(befintlig, butik, produkt) i factory/tema.mjs och anropa den från ops.mjs bredvid byggProduktTemplate. Utan den går varje startsidefynd bara att rätta för hand, en butik i taget — vilket är exakt det som har misslyckats hittills.


### `factory/kundvy.mjs` — 1 fynd

🔴 **Den enda kontroll som läser kundens riktiga HTML letar inte efter källbutikens text. DEFAULTSPAR innehåller bara spår av ett OBYGGT Shopify-tema (My Store, hero-apparel, burst-bild, placeholder-svg, C** · syns för kund
   - Bevis: `factory/kundvy.mjs rad 13–21: DEFAULTSPAR = sex mönster, samtliga om Shopify-defaults. byggKrav() rad 23–39 kollar brandnamn, logga, produktnamn, produktbild och köpknapp — inget o`
   - Fix: Importera KALLORD i kundvy.mjs och lägg in dem plus källbutikens claim-fraser i DEFAULTSPAR: `...KALLORD.map(o => ({ monster: new RegExp(o.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'i'), vad: `källbutikens text "${o}" renderas` }))` samt fasta mönster för `/Levereras presentklart/i`,


### `templates/password.json` — 1 fynd

🟠 **Lösenordssidan — exakt den sida Axel och VA:n ser vid förhandsvisning, och den enda sida som är publik innan launch — är på ENGELSKA och samlar in mejladresser.** · syns för kund
   - Bevis: `"heading":"Opening soon" och "text":"<p>Be the first to know when we launch.</p>" med block "email_form"`
   - Fix: KOD: skriv templates/password.json ur butiksfilen (brandnamn + svenska/norska), eller lägg filen i KANDA_SMITTADE. Sätt även show_background_image: false — inställningen är true men ingen bild är satt.


### `templates/list-collections.json` — 1 fynd

🟠 **Kollektionslistans rubrik står på engelska mitt i en svensk butik.** · syns för kund
   - Bevis: `"main":{"type":"main-list-collections","settings":{"title":"Collections","sort":"alphabetical",...}}`
   - Fix: KALLORD: går inte att skanna på (ordet är för generiskt). KOD: sätt title ur locale i byggStartsida()-familjen, eller lista filen i KANDA_SMITTADE med en fast svensk/norsk rubrik.


### `templates/article.json` — 1 fynd

🟡 **Dela-etiketten på blogginlägg står på engelska medan produktmallens motsvarighet står på svenska ('Dela'). Inkonsekvent språk i samma butik.** · syns för kund
   - Bevis: `templates/article.json: "share":{"type":"share","settings":{"share_label":"Share"}} mot templates/product.json: "share":{"type":"share","settings":{"share_label":"Dela"}}`
   - Fix: KOD: sätt share_label per locale i samma steg som password.json fixas. Blogg används sällan i en OPS — överväg att ta bort mallen helt.


### `templates/collection.json` — 1 fynd

🟡 **Kollektionsmallen är byggd för Matstrumpors sortiment: 16 produkter per sida, fyra kolumner och en horisontell filterrad. I en enproduktsbutik visas en filterrad ovanför en enda produkt.** · syns för kund
   - Bevis: `"product-grid":{"settings":{"products_per_page":16,"columns_desktop":4,"enable_filtering":true,"filter_type":"horizontal","enable_sorting":true,...}}`
   - Fix: KOD: sätt enable_filtering: false och enable_sorting: false för enproduktsbutiker (flerproduktsbutiker enligt factory/FLERPRODUKT.md behåller dem).


### `templates/search.json` — 1 fynd

🟡 **Sökmallen har samma sortiments-antaganden som kollektionsmallen — filter och sortering i en butik med en produkt.** · syns för kund
   - Bevis: `"main":{"type":"main-search","settings":{"columns_desktop":4,"enable_filtering":true,"filter_type":"horizontal","enable_sorting":true,"article_show_date":true,...}}`
   - Fix: KOD: samma patch som collection.json — enable_filtering/enable_sorting false för enproduktsbutiker.


### `blocks/ms-delivery.liquid` — 2 fynd

🟠 **Leveransbeskedet lovar 5–10 arbetsdagar räknat i SVENSK tid som default. En dansk eller norsk butik ärver både fönstret och tidszonen utan att någon valt dem.** · syns för kund
   - Bevis: `rad 12: "label": "Snabbast, arbetsdagar", … "default": 5
rad 13: "label": "Långsammast, arbetsdagar", … "default": 10
rad 16: "content": "Datumet räknas i arbetsdagar och svensk ti`
   - Fix: KOLLA_POLICY += '5–10 arbetsdagar', 'svensk tid'. Leveransfönstret ska sättas ur produktfilens leveranstid vid bygget; tidszonen i <ms-delivery> i assets/ms-cro.js behöver bli en parameter i stället för fast Europe/Stockholm.

🟠 **Leveransblockets schema-defaults är källbutikens fönster 5–10 arbetsdagar. Ett block som läggs till utan att någon rör reglagen lovar Matstrumpors leveranstid och räknar ut ett datum på den.** · syns för kund
   - Bevis: `rad 12: "label": "Snabbast, arbetsdagar" … "default": 5 — rad 13: "label": "Långsammast, arbetsdagar" … "default": 10`
   - Fix: Sätt default 0 på båda och låt snippeten rendera ingenting vid 0, så blocket kräver ett medvetet val.


### `blocks/ms-bundle.liquid` — 2 fynd

🟠 **Paketväljarens enhetsord är 'par' — sockenheten. Kunden får se "499 kr / par" på en övervakningskamera.** · syns för kund
   - Bevis: `rad 30: { "type": "text", "id": "unit_word", "label": "Ord för en enhet", "default": "par" },`
   - Fix: Byt default till "st" (samma som snippetens egen fallback på rad 40 i ms-bundle-picker.liquid). KALLORD kan inte användas här — 'par' är för kort och ger falska träffar.

🟠 **Paketväljarens enhetsord är hårdkodat till strumpor. Texten renderas som ett erbjudandepåstående i ms-bundle-picker.liquid rad 109: '{{ saving }}% billigare per par'.** · syns för kund
   - Bevis: `rad 30: { "type": "text", "id": "unit_word", "label": "Ord för en enhet", "default": "par" }`
   - Fix: Ändra default till "st" — neutralt för varje produkt — och sätt det riktiga ordet ur produktfilen vid bygget.


### `sections/ms-bundle-products.liquid` — 1 fynd

🟠 **Flerproduktspaketets rubriker förutsätter en presentbutik med ett sortiment att samla på. På en en-produktsbutik är båda meningslösa.** · syns för kund
   - Bevis: `rad 41: "default": "Spara på hela lådan"
rad 42: "default": "Ta hela samlingen"`
   - Fix: KALLORD += 'spara på hela lådan', 'ta hela samlingen'. Töm båda defaults — sektionen renderar rubrikblocket bara när heading/eyebrow är ifyllda.


### `sections/ms-video.liquid` — 1 fynd

🟠 **Videosektionens rubrik står i plural ('dem') — den är skriven för ett sortiment strumpor, inte för en produkt.** · syns för kund
   - Bevis: `rad 51: { "type": "text", "id": "heading", "label": "Rubrik", "default": "Se dem i rörelse" },`
   - Fix: KALLORD += 'se dem i rörelse'. Byt default till "Se den i användning" eller töm fältet.


### `sections/ms-cookies.liquid` — 2 fynd

🟠 **Cookierutans text, OK- och Nej tack-knappar är hårdkodade på svenska. Sektionen tas bort ur footer-group av verktyget, men filen och presetet följer med och rutan är på svenska även i en norsk eller d** · syns för kund
   - Bevis: `rad 133: "default": "Vi använder cookies för att sidan ska fungera och för att förstå vad våra besökare gillar."
rad 139: "default": "OK"   rad 145: "default": "Nej tack"`
   - Fix: Radera sections/ms-cookies.liquid ur zip:en i stället för att bara plocka bort sektionen — Shopifys egen samtyckesbanner används redan i OPS-butikerna. Alternativt: språksätt de tre defaults ur butiksfilens marknad.

🟠 **Källbutikens cookieruta med hårdkodad svensk text ligger aktiv i footer-group i varje butik som byggts, eftersom avbrandningen aldrig körs av byggkoden. Norska kunder får svenska knappar ("OK" / "Nej ** · syns för kund
   - Bevis: `sections/footer-group.json rad 60–72: `"ms_cookies": { "type": "ms-cookies", "settings": { "visible": true } }` i order. ms-cookies.liquid schema: `"default": "Vi använder cookies `
   - Fix: Beslut krävs, men båda vägarna är kod: antingen (a) behåll sektionen och gör texten marknadsstyrd — `{% if request.locale.iso_code == 'nb' %}` runt de tre strängarna, samma grepp som SVENSK_SIGNAL i tema.mjs använder — eller (b) ta bort den via avbrandaSektionsgrupp och slå på Sh


### `snippets/ms-head.liquid` — 3 fynd

🟠 **Kommentaren hänvisar till en temainställningsgrupp som INTE FINNS i bas-zipen. config/settings_schema.json har noll träffar på ms_ab, så settings.ms_ab_tests och settings.ms_ab_cookie_days är alltid t**
   - Bevis: `snippets/ms-head.liquid rad 16: `Testerna konfigureras i Temainställningar → Matstrumpor A/B, ett test per` — och `grep -c ms_ab config/settings_schema.json` → 0. Filen är stock Da`
   - Fix: Antingen: lägg tillbaka gruppen i config/settings_schema.json med namnet "A/B-tester" och id:na ms_ab_tests + ms_ab_cookie_days. Eller: ta bort A/B-motorn ur bas-zipen (ms-ab.js, ms-ab-attrs.liquid, config-blocket i ms-head). Just nu är den ett blockerande skript utan funktion.

🟡 **A/B-motorn läser två temainställningar som INTE finns i config/settings_schema.json. Kommentaren hänvisar dessutom till en inställningsgrupp som heter Matstrumpor A/B. Testerna går alltså aldrig att s**
   - Bevis: `rad 16: Testerna konfigureras i Temainställningar → Matstrumpor A/B, ett test per
rad 34: assign raw_tests = settings.ms_ab_tests | default: '' | split: ms_nl
rad 35: assign cookie`
   - Fix: KALLORD += 'matstrumpor a/b'. Lägg tillbaka inställningsgruppen i config/settings_schema.json med id ms_ab_tests (textarea) och ms_ab_cookie_days (range), och döp gruppen efter butikens brand — annars är A/B-lagret dött kod i varje OPS-butik.

🟡 **Två fel i ett. (1) Kommentaren namnger källbutiken i temakoden. (2) Den hänvisar till Temainställningar → "Matstrumpor A/B", men settings.ms_ab_tests och settings.ms_ab_cookie_days finns INTE i config**
   - Bevis: `rad 16: "Testerna konfigureras i Temainställningar → Matstrumpor A/B, ett test per"  ·  rad 34: assign raw_tests = settings.ms_ab_tests | default: '' | split: ms_nl  ·  grep på "ms`
   - Fix: Skriv om kommentaren i snippets/ms-head.liquid rad 16 till "Temainställningar → A/B-tester" (inget butiksnamn). Lägg in gruppen i config/settings_schema.json så motorn går att styra:
{ "name": "A/B-tester", "settings": [ { "type": "textarea", "id": "ms_ab_tests", "label": "Tester


### `snippets/ms-bundle-picker.liquid` — 1 fynd

🟡 **Kodkommentarerna namnger källbutikens produkter och varianter. Syns bara för den som läser koden, men det är samma smitta och gör att nästa session tror att temat hör till en sockbutik.**
   - Bevis: `rad 6: variant   Produkten har flera varianter (t.ex. Sushi-Strumpor: "3 - Par"
rad 10: quantity  Produkten har bara en variant (Pizza, Hamburgare, Donut).
(även snippets/ms-paket.`
   - Fix: KALLORD += 'sushi-strumpor' finns redan — men skanningen når aldrig snippets/. Utöka skanningen till alla .liquid (se första fyndet) och skriv om kommentarerna generiskt: "t.ex. en produkt med flera förpackningsstorlekar".


### `assets/ms-cro.js` — 6 fynd

🟠 **Tidszon, språk och valuta är hårdkodade svenska på fem ställen. OPS-butikerna byggs för både SE och NO (CLAUDE.md: annonskontot MagiBorsten DK täcker SE och NO), och på en norsk butik skriver leverans** · syns för kund
   - Bevis: `rad 18: var TZ = 'Europe/Stockholm';  ·  rad 29: var f = format || '{{amount}} kr';  ·  rad 33: kr.toLocaleString('sv-SE', {  ·  rad 62: new Intl.DateTimeFormat('sv-SE', {  ·  rad `
   - Fix: Läs språk och zon ur sidan i stället för att hårdkoda. Överst i assets/ms-cro.js:
var LOCALE = (window.Shopify && window.Shopify.locale) || document.documentElement.lang || 'sv-SE';
var TZ = document.documentElement.getAttribute('data-ms-tz') || Intl.DateTimeFormat().resolvedOpti

🟠 **Kundvänd UI-text är hårdkodad på svenska i JavaScript och kan inte översättas via temainställningar eller Shopifys Translate & Adapt. På en norsk OPS-butik står svensk text i leveransnedräkningen och ** · syns för kund
   - Bevis: `rad 329: this.cutEl.textContent = 'Beställningar efter ' + pad(this.cutoff) + ':00 packas nästa arbetsdag.'  ·  rad 334-335: 'Beställ inom <strong>' ... ' s</strong> så packas den `
   - Fix: Flytta strängarna till data-attribut på blocket så Liquid (och därmed marknadens översättning) matar dem. I ms-cro.js:
var txt = function (el, nyckel, reserv) { return el.dataset[nyckel] || reserv; };
this.cutEl.textContent = txt(this, 'textEfterBrytpunkt', 'Beställningar efter {

🟠 **Leveransdatumet räknas alltid i svensk tidszon och skrivs med svenskt datum- och valutaformat. På en norsk OPS-butik (samma annonskonto kör SE och NO) får kunden ett leveranslöfte räknat på svenska he** · syns för kund
   - Bevis: `rad 18: var TZ = 'Europe/Stockholm'; — rad 62/87: new Intl.DateTimeFormat('sv-SE', …) — rad 329: 'Beställningar efter ' + pad(this.cutoff) + ':00 packas nästa arbetsdag.'`
   - Fix: Läs TZ och locale ur {{ request.locale.iso_code }} / shop-inställningarna i ms-delivery-estimate.liquid och skicka in dem som data-attribut, i stället för att hårdkoda i JS.

🟠 **Paketsektionen för flera produkter (<ms-multibundle>, används av sections/ms-bundle-products.liquid) skickar kunden till kundvagnssidan /cart efter "Lägg alla i varukorgen". Det är exakt det beteende ** · syns för kund
   - Bevis: `assets/ms-cro.js, MsMultibundle.lagg(): `window.location.href = this.dataset.tillKassan ? rutt + 'checkout' : rutt + 'cart';`. snippets/ms-bundle-products.liquid rad 43–46 renderar`
   - Fix: Byt redirecten mot samma väg som ms-paket.js redan går: hämta `document.querySelector('cart-drawer')`, kör temats `renderContents()` med sektionssvaret och fall tillbaka på `rutt + 'cart'` bara när ingen låda finns. Koden att kopiera står i assets/ms-paket.js, kop().

🟡 **Källbutiken står i filhuvudet på fyra assets, och prisformateringens reservväg är hårdkodad till svenska kronor. Slår reservvägen in i en dansk eller brittisk butik visar paketpriserna fel valuta.** · syns för kund
   - Bevis: `assets/ms-cro.js rad 2: ms-cro.js — beteendet bakom konverteringsblocken på Matstrumpor.se
assets/ms-ab.js rad 2: ms-ab.js — A/B-testmotorn för Matstrumpor.se
assets/ms-cro.css rad`
   - Fix: KALLORD 'matstrumpor' fångar filhuvudena så snart skanningen även läser assets/*.js och assets/*.css — lägg till dem i skanningen. Byt 'sv-SE' och ' kr' mot butikens locale och shop.money_format (formatet skickas redan in via data-money-format, reservvägen behöver bara sluta giss

🟡 **Leveranstiden faller tillbaka på 5-10 arbetsdagar när blocket saknar data-min-days/data-max-days. Det är Matstrumpors dropship-ledtid (samma tal står i deras FAQ i templates/index.json: "5–10 arbetsda** · syns för kund
   - Bevis: `rad 284-285: if (isNaN(min)) min = 5;  /  if (isNaN(max)) max = 10;`
   - Fix: Göm blocket i stället för att gissa. I assets/ms-cro.js MsDelivery.connectedCallback: if (isNaN(min) || isNaN(max)) { this.hidden = true; return; } Ledtiden ska komma ur produktfilens frakt-fält, aldrig ur en default.


### `assets/ms-cro-nytt.css` — 3 fynd

🟡 **Död fil som enligt sin egen kommentar skapades av misstag i källbutiken och inte laddas av något. Följer med i varje ny butik.**
   - Bevis: `rad 1: /* OANVÄND — skapades av misstag 2026-08-21 och laddas inte av någonting.`
   - Fix: Ta bort filen ur factory/tema/ops-tema.zip. Ingen KALLORD behövs.

🟡 **En död fil som filen själv säger skapades av misstag. Den laddas inte av ms-head.liquid, men följer med i zip:en och därmed in i varje ny OPS-butiks tema, där VA:n och Axel ser den i temaeditorns kodl**
   - Bevis: `/* OANVÄND — skapades av misstag 2026-08-21 och laddas inte av någonting. Går att ta bort i temaredigeraren: Kod → assets → ms-cro-nytt.css. Den riktiga filen heter ms-cro.css. */`
   - Fix: Ta bort assets/ms-cro-nytt.css ur factory/tema/ops-tema.zip och packa om.

🟡 **Bortglömd fil från källbutiken som ingenting laddar. Följer med varje ny butik och är enligt sin egen kommentar skapad av misstag.**
   - Bevis: `rad 1–3: `/* OANVÄND — skapades av misstag 2026-08-21 och laddas inte av någonting. Går att ta bort i temaredigeraren: Kod → assets → ms-cro-nytt.css. Den riktiga filen heter ms-cr`
   - Fix: Radera assets/ms-cro-nytt.css ur factory/tema/ops-tema.zip.


### `assets/ms-tema.css` — 2 fynd

🟠 **Rad 69 blandar in Matstrumpors mörkbruna #3A1F00 i footer-rubrikernas färg. opf-brand.css (genererad av byggBrandCss) överstyr bara .product-form__submit och .ms/.ms-scope-tokens — den rör aldrig .foo** · syns för kund
   - Bevis: `color: color-mix(in srgb, rgb(var(--color-button)) 70%, #3A1F00);`
   - Fix: Byt hårdkodningen mot temats egen textfärg i assets/ms-tema.css rad 67-70:
.footer .footer-block__heading { color: rgba(var(--color-button), 1); }
.footer .footer-block__heading { color: color-mix(in srgb, rgb(var(--color-button)) 70%, rgb(var(--color-foreground))); }
Då följer n

🟠 **Källbutikens designbeslut förstorar sidfotens sociala ikoner till 44 px runda knappar i accentfärg. Kombinerat med att current.social_facebook_link och current.social_instagram_link fortfarande pekar ** · syns för kund
   - Bevis: `assets/ms-tema.css rad 72–86: kommentaren "Sociala ikoner: Dawns är 18 px gråa streck längst ner — osynliga. Här blir de orangea runda knappar under loggan, stora nog för tummen." `
   - Fix: Två saker, båda behövs. (1) Nolla länkarna i bygget: lägg `social_facebook_link: '', social_instagram_link: '', social_tiktok_link: '', social_youtube_link: ''` (och tvillingarna twitter/pinterest/tumblr/snapchat/vimeo) i byggSettingsPatch() i factory/branding.mjs. (2) Behåll CSS


### `assets/ms-cro.css` — 3 fynd

🟡 **Designtokens i konverteringslagret är Matstrumpors palett. --ms-accent (#dd821d) och de flesta ytorna överstyrs visserligen av genererade opf-brand.css, men --ms-accent-dark gör det INTE — byggBrandCs**
   - Bevis: `rad 23-24: --ms-accent: #dd821d;  /  --ms-accent-dark: #b8681322;    /* används bara för ytor, se nedan */`
   - Fix: Ta bort --ms-accent-dark ur assets/ms-cro.css (den refereras noll gånger — verifierat med grep). Ersätt de kvarvarande literalerna i tokenblocket med neutrala grå ur NEUTRAL i factory/branding.mjs, så bas-temat inte bär någon butiks accent alls.

🟡 **Typsnittsfallbacket namnger Matstrumpors font. Slår bara igenom om temats --font-body-family saknas (händer inte med Dawn), men strängen ligger kvar i varje butiks CSS och gör att en felsökning pekar **
   - Bevis: `rad 51: --ms-font: var(--font-body-family, "Mochiy Pop P One", ui-rounded, system-ui, sans-serif);`
   - Fix: Byt till neutral stack i assets/ms-cro.css rad 51: --ms-font: var(--font-body-family, system-ui, -apple-system, "Segoe UI", sans-serif); KALLORD-tillägget 'mochiy_pop_p_one' fångar settings-varianten, lägg till 'mochiy pop p one' för CSS-varianten.

🟡 **Det mörka läget sätter varmbruna ytor som är Matstrumpors palett, och opf-brand.css överstyr dem inte (den skriver .ms/.ms-scope, medan det här blocket har högre specificitet via attributväljaren). In**
   - Bevis: `rad 69-78: .ms-scope[data-ms-scheme="dark"] { --ms-ink: #f6f2ec; --ms-surface: #1c1a17; --ms-surface-2: #232019; --ms-surface-3: #2b2721; --ms-line: #3a352c; --ms-line-strong: #4d4`
   - Fix: Ta bort hela .ms-scope[data-ms-scheme="dark"]-blocket ur assets/ms-cro.css (rad 69-78). Behövs mörkt läge senare ska det genereras av byggBrandCss() per butik, inte ligga i mallen.


### `sections/ms-reviews.liquid + sections/ms-review-slider.liquid` — 1 fynd

🟠 **Rubrikdefaulten är Matstrumpors positionering — produkten är en present. En kamera eller en tankvakt är ingen present.** · syns för kund
   - Bevis: `ms-reviews.liquid:70 och ms-review-slider.liquid:64: `{ "type": "text", "id": "heading", "label": "Rubrik", "default": "Presenten som alltid landar rätt" }``
   - Fix: KALLORD: 'presenten som alltid landar rätt'. Byt default till tom sträng.


### `blocks/ms-bundle.liquid + sections/ms-bundle-products.liquid` — 1 fynd

🟠 **Paketväljarens enhetsord och samlingssektionens rubriker är skrivna för strumpor i låda. 'par' visas som enhet bredvid varje paketnivå.** · syns för kund
   - Bevis: `blocks/ms-bundle.liquid:30 `{ "type": "text", "id": "unit_word", "label": "Ord för en enhet", "default": "par" }`; ms-bundle-products.liquid:41–42 `"id": "eyebrow", "default": "Spa`
   - Fix: Byt unit_word-default till "st". KALLORD: 'spara på hela lådan', 'ta hela samlingen'.


### `sections/header-group.json + sections/footer-group.json` — 1 fynd

🟠 **Både land- och språkväljaren är avstängda på alla fyra ställen. Norsk marknad med locale nb är standard i varje OPS, så en norsk besökare som inte fångas av geo-omdirigeringen har ingen knapp alls för** · syns för kund
   - Bevis: `header-group.json, announcement-bar: "enable_country_selector": false, "enable_language_selector": false — samma två rader igen under "header", och i footer-group.json: "enable_cou`
   - Fix: Sätt enable_country_selector och enable_language_selector till true i headern (eller minst i sidfoten) när butikskonfigen har fler än en marknad i `marknader:`. Kontrollen hör hemma i factory/kontroll.mjs.


### `assets/ms-cro.css, assets/ms-cro.js, assets/ms-ab.js, snippets/ms-paket.liquid` — 1 fynd

🟡 **Källbutikens namn och mätdatum står i filhuvudena, och typsnittsfallbacken är Matstrumpors japanska display-typsnitt. Fem av de sex raderna fångas av skanningen i dag; typsnittsraden och strump-kommen**
   - Bevis: `ms-cro.css:2 `ms-cro.css — konverteringslagret för Matstrumpor.se`; ms-cro.css:51 `--ms-font: var(--font-body-family, "Mochiy Pop P One", ui-rounded, system-ui, sans-serif);`; ms-c`
   - Fix: KALLORD: 'mochiy'. Skriv om filhuvudena till 'konverteringslagret för OPS-butiker' och byt typsnittsfallbacken till `var(--font-body-family, system-ui, sans-serif)`.


### `templates/article.json, templates/list-collections.json, templates/password.json` — 1 fynd

🟡 **Engelska texter kvar i en svensk butiks mallar. Lösenordssidan är det första en besökare ser innan butiken öppnas.** · syns för kund
   - Bevis: `templates/password.json: "heading": "Opening soon" och "text": "<p>Be the first to know when we launch.</p>"; templates/article.json: "share_label": "Share"; templates/list-collect`
   - Fix: Byt till "Öppnar snart", "Var först att veta när vi öppnar.", "Dela", "Kategorier" i zip:en. (templates/product.json:XX har redan "Dela" — bara article.json missades vid källbutikens översättning.)


### `locales/ (31 språkfiler + 20 schema-filer) och config/settings_schema.json` — 1 fynd

🟡 **RENT — kontrollerat och avfärdat, så ingen behöver leta här igen. Alla 31 språkfiler har identisk nyckeluppsättning (382 nycklar), alla 20 schema-filer likaså (1143 nycklar): inga tillagda nycklar, in**
   - Bevis: `theme_info: {"theme_name": "Dawn", "theme_version": "15.4.1", "theme_author": "Shopify"}. Nyckeljämförelse över alla locales/*.json: 'ej i alla: []' för sv, nb, en.default, da och `
   - Fix: Ingen åtgärd. Skriv in i factory/kallskanning.mjs som kommentar: 'locales/ och config/settings_schema.json är orörd Dawn 15.4.1 — mätt 2026-09-09 över alla 51 filer. All smitta i språk/meta-lagret sitter i config/settings_data.json och i schema-defaults, inte i språkfilerna.'


### `sections/ms-guarantee-section.liquid` — 1 fynd

🟠 **Garantisektionens schema-defaults är källbutikens returlöfte i både rubrik och brödtext.** · syns för kund
   - Bevis: `rad 19: "default": "30 dagars öppet köp" — rad 21: "default": "<p>Inte nöjd? Hör av dig inom 30 dagar så löser vi det. Inget krångel, inga följdfrågor.</p>"`
   - Fix: Töm båda defaults till "".


### `blocks/ms-trust.liquid` — 1 fynd

🟠 **Trygghetsradens BLOCK-variant (den som läggs i köpblocket från temaeditorn) har samma villkorsdefault som sektionen.** · syns för kund
   - Bevis: `rad 8: "default": "truck:Fri frakt i Sverige|refresh:30 dagars öppet köp|lock:Trygg betalning"`
   - Fix: Töm default till "".


### `blocks/ms-guarantee.liquid` — 1 fynd

🟠 **Garantiblockets defaults lovar källbutikens returfrist två gånger.** · syns för kund
   - Bevis: `rad 10: "default": "30 dagars öppet köp" — rad 12: "default": "<p>Inte nöjd? Hör av dig inom 30 dagar så löser vi det. Inget krångel.</p>"`
   - Fix: Töm båda defaults till "".


### `assets/ms-paket.js` — 1 fynd

🟡 **Paketprisets reservformatering hårdkodar svensk valuta. Slår money_format fel visas priset som 'kr' även i en butik med annan valuta.** · syns för kund
   - Bevis: `rad 33: return (cents / 100).toLocaleString('sv-SE') + ' kr';`
   - Fix: Använd data-money-format-attributet som redan skickas in från ms-paket.liquid rad 47, och fall tillbaka på Intl.NumberFormat med butikens valutakod.

