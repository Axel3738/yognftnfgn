# OPS-PROCESSEN — så byggs en butik, brick by brick

**Kadensen** (Axels upplägg 2026-09-07): Axel väljer vinnarprodukter och
skickar produktgrupper ~2 gånger i veckan — ibland noll, ibland flera.
VA:n har **3 dagar per grupp** att launcha alla gruppens butiker; varje
produkt = en egen butik = en `/ny-ops`-körning + en checklista.

**Ordningen från 2026-09-08 (Axels beslut):** VA:n gör butik + app +
koppling FÖRST (checklistans steg 1–2), sen startar `/ny-ops` och bygger
FÄRDIGT hela butiken. Domänen köps när Claude levererat namnet.

**Detta är rutinen under uppbyggnad** (Axels beslut 2026-09-07: uppdatera för
varje steg vi lyckas med — dokumentet ska så småningom bli en körbar rutin).
Varje steg är BEVISAT på Hemvakten→HeimGuard-bygget. Ordningen är den ordning
som funkade. ⚙️ = fabriken/Claude gör det · 🖐 = Axels klick (se CHECKLISTA.md
som genereras per bygge).

## Fas 1 — Grunden
1. ⚙️ Hämta produktdata från källan (Bäverbutik-sidan): namn, pris, varianter,
   bilder, beskrivningstexter, Judge.me-recensioner (`/products/<handle>.json`
   + `judge.me/reviews/reviews_for_widget`). Aldrig påhittade specs.
2. ⚙️ Brand-steget FÖRE bygget: analysera köpare/emotion → `branding:`-block i
   butiksfilen. Namnregeln (skärpt 2026-09-08): helst ett HELT engelskt namn
   som svenskar och norrmän ändå kan läsa och uttala, aldrig å/ä/ö.
   Kolla domänen med whois INNAN namnet spikas.
3. ⚙️ Skriv `butiker/<id>.yaml` + `produkter/<id>.yaml`, validera, dry-run.
4. ⚙️ Rund logga (mörk cirkel + ordmärke, qlmanage SVG→PNG) + favicon (initial).

## Fas 2 — Shopify
5. ⚙️ Ladda upp CRO-temat: zip:en ligger i repot som
   `factory/tema/ops-tema.zip` (matstrumpor-cro-v5 — samma zip HeimGuard
   byggdes från; incheckad 2026-09-08 så molnet alltid har den)
   → staged upload → themeCreate. Temat är
   strukturen — brandingen genereras alltid om (opf-brand.css + settings).
   **Steget är kod sedan 2026-09-09: `node factory/tema-upload.mjs "<Brand>
   – CRO (utkast)"`.** `ops.mjs` förutsatte att ett utkasttema redan fanns
   och sa "installera ett tema först" på en färsk butik, som bara har
   live-temat. ⚠️ `stagedUploadsCreate` har INGEN `THEME`-resurs i
   Admin-API 2025-07 — använd `FILE`, den signerade URL:en läses av
   `themeCreate` lika bra.
6. ⚙️ Produkt som **ACTIVE** med **`inventoryPolicy: CONTINUE`** och
   `inventoryItem.tracked: false` (Axels regel 2026-09-09 — Shopifys default
   DENY stoppar försäljningen tyst när saldot tar slut, medan annonserna
   fortsätter kosta pengar; dropshipping har inget eget lager)
   (Axels bakläxa 2026-09-08 på TankGuard:
   DRAFT ger 404 i menyn och "Exempel på produktnamn" i kundvyn —
   butiken är ändå lösenordsskyddad under trialen) → metafält →
   opf-sektioner → produktmall → startsida →
   meny → policysidor (adress från allabolag.se) → fraktzoner.
6b. ⚙️ **Startsidan byggs av fabriken sedan 2026-09-09:**
   `node factory/startsida.mjs <butik-id> <produkt-handle>`, med innehållet i
   `factory/startsidor/<butik-id>.json`. Bilderna måste först ligga i
   butikens FILARKIV — `node factory/filer.mjs <url> ...` — för temats
   bildinställningar pekar på `shopify://shop_images/<namn>` och produktens
   egna media går inte att välja i en sektion. Två sektioner ur basmallen
   utelämnas alltid: kollektionen (enproduktsbutik) och omdömesslidern (en
   butik utan riktiga recensioner får inte rita en).

7. ⚙️ Paketen: metaobjekt `ms_paketniva` (translatable-capability PÅ från
   start!) + riktiga rabattkoder som ger exakt paketpriserna.
   **Steget är kod sedan 2026-09-09: `node factory/paket.mjs <handle>`,
   nivåerna i `factory/paketnivaer/<handle>.json`.** Skriptet skapar
   definitionen, nivåerna OCH rabattkoderna i samma körning och vägrar en
   nivå vars fastpris är högre än ordinarie. A = originalets
   Kaching-nivåer, B = testoffer. A/B via temats ms-ab (test "paket",
   orderattribut "AB paket" mäter). **Förvald nivå är ALLTID mitten**
   (position ⌈n/2⌉), aldrig första — Axels beslut 2026-09-07, gäller varje
   OPS och båda A/B-varianterna.
8. ⚙️ Bonus-ramverket (Q4-videon, standard för VARJE OPS): en billig
   komplementprodukt (t.ex. varningsskyltar till kameran) som (a) GRATIS
   bonus i paketnivåerna — "köp mer, få mer" i stället för djupare rabatt —
   och (b) betald upsell i varukorgen. Rabattkoderna täcker bonusens värde.
   Bevisad implementation (HeimGuard v8): `tema.mjs → byggKorgUpsell` ger
   tre filer — upsell-snippet (inline-onclick, för innerHTML-omritningar),
   wrapper-sektion (replace_first på `<!-- Start blocks -->`, används av
   sektions-API:t vid varje cart-ändring) och ms-head-tillägget
   (omhämtar lådan en gång per sidladdning — layout/theme.liquid renderar
   snippeten direkt förbi wrappern, och den filen forkas inte).
   Fältet i produktfilen: `offer.bonus_produkt`.
   **Antalsregeln (Axel 2026-09-08):** gratis-antalet följer paketantalet
   — 2-pack ⇒ 2 gratis, 3-pack ⇒ 3 gratis — när bonusen har låg COGS och
   samfraktas med huvudprodukten. **Nivå 1 får en betald
   tilläggs-kryssruta** för bonusen till FULLPRIS (aldrig rabatterad —
   den håller "värde X kr"-berättelsen på paketen ärlig). Rabattkoderna
   räknas alltid om så kassapriset stämmer på öret.
   ⚠️ Ny temaklon tappar temats translationsRegister-rader — registrera om
   nb för index/product-mallarna OCH sektionsgrupperna
   (`gid://…SectionGroup/header-group?theme_id=<ny>`); nycklar och digests
   är stabila mellan kloner så v7-raderna kan spelas upp rakt av.
9. ⚙️ Bilder: inbränd engelska bort. kie.ai klarar INTE svensk text — metoden
   är kie REMOVE text → sharp lägger svensk vektortext (grid-overlay för
   koordinater). Gif kan inte fixas — redigerarjobb.
10. 🖐 **Butiken skapas av VA:n själv** från jobb-Gmailen (ny FREE TRIAL
    per butik — ingen plan, inget kort; staff-inbjudningar kräver betald
    plan, mätt 2026-09-08). Shopify-åtkomst är per butik — hon ser aldrig
    ägarens övriga butiker, och de gamla butikerna ligger på ägarens egen
    inloggning. I överlämningen loggar ägaren in med jobb-Gmailen, väljer
    plan med sitt kort och tar över ägarskapet (checklistans steg 2 + 9,
    beslut 2026-09-08). Sen: publicera tema, språk svenska, butiksnamn, domän,
    Shopify Payments + Klarna, avsändarmejl, kassalogga. Klicken är VA:ns
    (`factory/VA-CHECKLIST.md`, ifylld per butik i `output/<id>/CHECKLISTA.md`)
    — även Shopify Payments (Axels besked 2026-09-07: aktiveringen har
    aldrig krävt BankID, VA:n fyller i bolags- och bankuppgifterna).
    Claude kopplas till butiken via butikens EGEN app (en per butik —
    custom distribution låses till EN butik utanför Plus, mätt
    2026-09-08): VA:n skapar appen på dev.shopify.com, lägger
    SHOPIFY_SHOP + SHOPIFY_CLIENT_ID + SHOPIFY_CLIENT_SECRET i
    molnsessionens miljö och installerar via distributionslänken
    (checklistans steg 2) → Admin-token hämtas och
    `SHOPIFY_STORE_DOMAIN` + `SHOPIFY_ADMIN_TOKEN` skrivs i
    `factory/.env`. Rutinen startas med `/ny-ops`; frasen
    "Store ready: <namn>" utlöser slutsteget (se kommandot).

## Fas 3 — Recensioner
11. 🖐 Installera Judge.me + språk + skicka API-token.
12. ⚙️ Import via `tools/judgeme-import.mjs` (--mejlsuffix <brand>.invalid —
    API:t kräver mejl numera). **Flerspråkiga recensioner utan betald plan**
    (Axels beslut 2026-09-07: Judge.mes auto-översättning är paid — köps
    aldrig): fabriken översätter själv en delmängd av recensionerna till
    marknadens språk och importerar dem som EGNA recensioner med lokala
    namn (Ola/Kari/Bjørn …). Blandningen sv+no i samma lista ser naturlig
    ut för en butik som säljer i båda länderna. Vid stort produkt-id krävs
    `--anda` (dubblettkollen kan inte göras per produkt — verifiera själv).
    Bevisat på HeimGuard: 6 norska importerade 2026-09-07. Widgeten läggs i temats egen **Appyta**
    (ms-app-slot) i produktmallen, stjärnbadgen som block under titeln
    (appblock-uuid är global). **Widgeten stylas ALDRIG med CSS från
    temat** (Axels beslut 2026-09-07) — utseendet ställs i Judge.me-appens
    inställningar. 🖐 Klicken där: Language **Svenska**, star color
    **#00B77F** (alltid, varje butik — `STJARNFARG` i branding.mjs).
    Judge.mes settings-API är läs-bara (skrivförsök ger 404), så de två
    fälten är klick i checklistan.
    **Har den svenska källprodukten noll recensioner: läs den NORSKA
    tvillingen först** (mätt 2026-09-09, DryTrek: baverbutiken.se 0 st,
    beverbutikken.no 10 st à 4,4 på samma produkt). Recensionerna ligger
    serverrenderade i produktsidans HTML (`jdgm-rev__body`, `data-score`,
    `jdgm-rev__author`) — inget token behövs för att läsa dem. Riktningen
    blir då omvänd: de norska importeras som original, och fabriken
    översätter dem till svenska med svenska namn för huvudmarknaden.
    `judgeme-import.mjs` har ingen `--mejlsuffix`-flagga — fyll
    `reviewer_email` i CSV:n med `<namn>@<brand>.invalid` (reserverad TLD).
    ⚠️ v1-API:t skriver aldrig `created_at`: alla får importdagen som datum.

## Fas 4 — Marknader (STANDARD i varje ny OPS, Axel 2026-09-08: SE huvudspråk + marknad Norge locale nb; fler marknader läggs till på samma sätt)
13. ⚙️ Marknad Norge + locale nb (publicerad) + nb som alternateLocale på
    huvuddomänens webPresence (`webPresenceUpdate` — INTE market-varianten).
    **NOK som marknadens basvaluta går via API** (`marketUpdate` med
    `currencySettings.baseCurrency: NOK`, mätt 2026-09-09 på DryTrek — raden
    "API-spärrat i unified markets" som stod här var fel; inget klick i admin
    behövs). Priset blir Shopifys egen omräkning (389 SEK → 381 NOK den
    dagen) och FLYTER med kursen — läs det ur `/nb/products/<handle>?country=NO`
    innan någon norsk siffra skrivs i copy eller paketnivåer.
    **Steget är kod sedan 2026-09-09: `node factory/marknad.mjs
    factory/butiker/<butik>.yaml`** — det fanns inte alls, HeimGuards Norge
    gjordes för hand och lämnade ingen kod. Tre mätningar sitter i filen:
    `marketCreate` ger status DRAFT och marknaden måste aktiveras separat,
    `webPresences` måste läsas på ROTNIVÅ (fältet under `markets` svarar
    tomt även när butiken har en), och `webPresenceUpdate` tar `id` + `input`.
13b. ⚙️ Översättningarna: `node factory/oversatt.mjs <butik-id>
    <produkt-handle> --locale nb`, texterna i
    `factory/startsidor/<butik-id>.json` under språkets nyckel. Kör med
    `--torr` först — den listar vilka nycklar resursen faktiskt har, så en
    felstavad nyckel syns i stället för att tyst hoppas över.
14. ⚙️ ALLT översätts via translationsRegister — trippelkolla mot /nb:
    produkt+metafält, tema-JSON-mallar (index/product), sektionsgrupper
    (header/footer), menylänkar, sidor, paket-METAOBJEKT. locales/nb.json för
    temats köpsträngar. custom_liquid är EJ översättningsbart —
    locale-brancha i Liquid. Sektionsdefaults = locale-medvetna i opf-koden.
    ⚠️ Tema-översättningar är knutna till TEMA-ID — ny temaklon = registrera
    om (nycklar/digests är stabila mellan kloner).
    ⚠️ **Shopify faller TYST tillbaka på svenskan för varje sträng som
    saknar nb** — mitt i en annars norsk sida, utan felmeddelande. Axels
    bakläxa 2026-09-09 (DryTrek): marknaden var uppe, paketen översatta, och
    ändå stod meny, sidfot, sidor, färgnamn, fraktmetoder och hela
    produktbeskrivningen på svenska för en norsk kund. `oversatt.mjs` täckte
    4 av 13 resurstyper. Facit är därför alltid två saker:
    (a) `translatableResources` per resurstyp — PRODUCT, PRODUCT_OPTION,
    PRODUCT_OPTION_VALUE, COLLECTION, LINK, SHOP_POLICY, PAGE, BLOG,
    METAOBJECT, METAFIELD, DELIVERY_METHOD_DEFINITION, ONLINE_STORE_THEME_*
    — och varje rad med text ska ha en nb-rad (appgenererade metafält som
    Judge.me-widgetar, rabattkoder och Liquid räknas inte);
    (b) **`node factory/sprakkoll.mjs <butik> <handle> --losenord X`** —
    läser de riktiga /nb-sidorna och slår larm på svenska former som inte
    finns i bokmål ("och", "är", "känga", "färger", "ångerrätt" …) och på
    svenska priser. Butiken får inga norska annonser förrän den är tom.
    Juridiken BYTS, översätts inte: distansavtalslagen → angrerettloven.
15. ⚙️ Bilder per marknad (bevisat på HeimGuard 2026-09-07): språkversionera
    med husets metod (kie rensar text → sharp lägger vektortext, samma
    koordinater per språk). Tre lager, alla via API:
    - Metafält-bilder (opf-sektionerna): translationsRegister på METAFÄLTETS
      gid (`gid://shopify/Metafield/<id>`, key "value", värde = fil-URL).
    - Temats bildinställningar (hero, image-with-text): translationsRegister
      på JSON-mallen, värde `shopify://shop_images/<fil>` — tema-bundet,
      registrera på varje klon.
    - Produktgalleriet: språkmärk alt-texten (`[SV]`/`[NO]`, omärkt = alla
      marknader), lägg båda språkens bilder som media, och ms-head döljer
      fel språk med CSS `:has()` per locale. Dawns slider hoppar själv över
      dolda bilder (clientWidth-filtret), så pilar och räknare stämmer.
    ⚠️ Filtret bor i temat — tills nya klonen är publicerad ser LIVE-temat
    båda språkens galleribilder. Lägg median sist i bygget, publicera snabbt.
    **Sedan 2026-09-09 ligger filtret i mallen** (`ops-tema.zip` →
    `snippets/ms-head.liquid`, `<style id="ms-galleri-sprak">`), liksom
    leveransbeskedets språkval (`ms-delivery-estimate.liquid` +
    `ms-cro.js` läser `request.locale` / `data-locale`). Gjort på DryTrek:
    de tre textbilderna (`klart-*-benskydd-sv.jpg`) fick norska tvillingar
    ritade med PIL + DejaVu Sans Bold (samma typsnitt som originalen — vitt
    band, svart text, inget kie behövdes), uppladdade som `…-no.jpg`,
    inlagda i galleriet med `productCreateMedia` (alt `[NO] …`), de svenska
    ommärkta `[SV] …` med `productUpdateMedia`, och sorterade parvis med
    `productReorderMedia`. ⚠️ Reorder är ett JOBB — polla `job.done`
    innan tillbakaläsningen; första körningen lästes tillbaka för tidigt
    och såg oförändrad ordning ut.
16. ⚙️ NOK-paketnivåer innan norska annonser (SEK-belopp räknar fel i NOK).
    **Lösningen är PROCENT, inte ett översatt belopp** (mätt 2026-09-09):
    `fastpris` är number_decimal och saknar translatable capability — Shopify
    översätter bara textfält, så 661,30 stod kvar som 661,30 på /nb trots
    381 NOK styck. Därför bär `ms_paketniva` fältet `rabatt_procent`,
    rabattkoderna är procentkoder, och `snippets/ms-paket.liquid` +
    `assets/ms-paket.js` räknar avdraget ur procenten (variant × antal ×
    procent) så kortet blir rätt i varje valuta. `factory/paket.mjs` gör
    detta som standard och lägger till fältet på äldre butiker.
    Verifierat: SE 661,30 / 933,60 kr, NO 647,70 / 914,40 kr — lästa ur
    kundvyn, inte ur API:t.
17. ⚙️ Norge ska SYNAS i kundvyn (Axel 2026-09-08): svenska USP-strippen
    säger "Fri frakt – Sverige & Norge", nb-versionen "Gratis frakt i
    hele Norge". Kunden ska aldrig behöva gissa att vi postar till Norge.

## Fas 5 — Kanaler
16. 🖐+⚙️ Discord: VA:n skapar servern och godkänner boten (checklistans
    steg 8) →
    `factory/discord.mjs --guild <id> --ikon <logga>` bygger de sex kanalerna
    och plockar redigerare ur standby-listan.
17. 🖐 Meta: VA:n har **Fullständig åtkomst** i Business Manager (Axels
    beslut 2026-09-07 — hon får se betalningarna) och skapar brandets SIDA
    direkt i BM själv (API:t kan fortfarande inte skapa sidor). **Annonskontot är alltid
    detsamma: "MagiBorsten DK" 915422744950975 — ETT gemensamt konto för
    ALLA OPS-butiker, svenska som norska** (Axels beslut 2026-09-07).
    Därför: kampanjnamnen prefixas ALLTID med brandet (HEIMGUARD_…) så
    datan går att skära per butik, och kontot döps aldrig om. Förväxla
    aldrig med MagiBorsten 1867947880635861 (Bäverbutiken SE). Kortet
    ligger redan i BM. ⚙️ Pixel per butik via `factory/meta-setup.mjs`
    när META_ACCESS_TOKEN finns. 🖐 WeTracked: nytt konto per butik,
    klistra in pixel-id.

## Fas 6 — Annonser (nästa fas, ej bevisad än)
18. ⚙️ Brand-swap av Bäverbutikens vinnare (PLAN.md punkt 1).
19. ⚙️ Q4-ramverket i annonsplanen: banka creatives i förväg (dubbla antalet),
    större PO innan säsong (PLAN.md punkt 6).

## Regler som bevisats den hårda vägen

- **TEMAT GÅR ATT PUBLICERA VIA API:t.** Det här dokumentet har sagt motsatsen
  sedan HeimGuard ("Publicerat tema är API-låst", "tema-publicering är
  API-spärrad — det klicket är hennes"). Det stämmer inte. Mätt 2026-09-09 på
  DryTrek: `themePublish(id:)` svarade `role: MAIN`, noll userErrors.
  Butiken var lösenordsskyddad, så ingenting exponerades publikt.
  Konsekvens: fabriken kan ta butiken hela vägen till kundens vy själv, och
  varje bygge som lämnats "väntar på publicering" har väntat i onödan.
- **Efter publicering pekar `hamtaUtkastTema()` på FEL TEMA.** Rollerna byter
  plats: OPS-temat blir MAIN och Shopifys default-tema (Horizon) blir
  UNPUBLISHED. Startsidesteget skrev då mot Horizon och nb-registreringen
  hittade noll strängar (mätt 2026-09-09). Använd `hamtaArbetstema()`, som
  letar upp OPS-temat på NAMNET oavsett roll.
- **`shopify://shop_images/<namn>` måste byggas ur det LAGRADE filnamnet.**
  Finns namnet redan i butiken lägger Shopify på ett UUID —
  `benskydd-benskydd-08.jpg` blir `benskydd-benskydd-08_3ecbd654-….jpg`. Det
  händer garanterat i en OPS-butik, för produktbilderna laddas upp från samma
  käll-URL:er innan startsidan byggs. Mätt 2026-09-09: ALLA FEM
  startsidesbilder pekade på filer som inte fanns, och temat renderade sin
  placeholder. I kundvyn såg det ut som "Shopifys default-illustration".
- **Loggan, faviconen och huvudmenyn sattes aldrig av fabriken.**
  `settings.logo` pekade på bas-temats logga (en fil som inte finns i den nya
  butiken) så headern föll tillbaka på ren text; `settings.favicon` var osatt;
  och `main-menu` var kvar på Dawns Home / Catalog / Contact, där "Catalog"
  går till `/collections/all` — tom i en enproduktsbutik. Fabriken skrev bara
  FOOTER-menyn. Steget heter nu `factory/identitet.mjs`.
  ⚠️ `brand_image` och `logo` är TVÅ olika inställningar. Av-brandningen
  städade den första och missade den andra.
- **Butiksnamnet går INTE att sätta via API.** Testat 2026-09-09 med både
  REST (`PUT /admin/api/2025-07/shop.json` → 406) och GraphQL (`shopUpdate`
  och `shopSettingsUpdate` finns inte på Mutation). "My Store 3" i kundvyn är
  ett klick i admin, och det syns i webbläsarfliken och i alla mejl.
- **Grön konfiguration är inte en grön butik.** Fabrikens QA rapporterade
  "14 gröna, 0 fel" på en butik som hette My Store 3, saknade logga, visade
  temats placeholder som hero och stod på engelska. Varenda kontroll läste
  KONFIGURATION. Kör `factory/kundvy-kor.mjs` mot den riktiga startsidan
  innan något rapporteras som klart.
  ⚠️ Molnsessionen kan inte hämta en lösenordsskyddad butiks startsida:
  Admin-API:t lämnar inte ut storefront-lösenordet (fältet `enabled` är allt
  som finns), och Shopify svarar dessutom 429 "Verifying your connection" på
  proxyns IP. Kör kontrollen med `--losenord` eller `--fil`. Utan den är
  butiken inte kontrollerad — och då säger man det.
- **En färsk trial-butik har `en` som PRIMÄRT språk, inte svenska.** Mätt
  2026-09-09 på DryTrek: `shopLocales` svarade bara `en (primärt)`. All
  svensk text fabriken skriver hamnar därmed i `en`-slotten. Kundvyn blir
  ändå rätt — besökaren ser den svenska texten — men slotten är
  felmärkt, och `sv` får ALDRIG publiceras tom: då byter en svensk besökare
  till ett tomt språk. Byte av primärspråk är API-spärrat och står som
  VA:ns klick (checklistans steg 5). Ordningen som fungerar: bygg klart,
  låt henne byta default till svenska, publicera INTE `sv` innan dess.
- **Ett annonskonto kan bara ha EN pixel skapad via `act_<id>/adspixels`.**
  Butik nummer tre får `(#6200) A pixel already exists for this account`
  och står utan pixel (mätt 2026-09-09: HeimGuard och TankGuard hade redan
  var sin). Skapa pixeln på FÖRETAGET (`/<business_id>/adspixels`,
  MagiBorsten `1164852855167090`) och dela den till kontot med
  `/<pixel_id>/shared_accounts`. ⚠️ Bäverbutikens egen pixel
  `1554276343018184` ligger i SAMMA konto — kontrollera alltid namnet på
  pixeln du väljer, och begär `fields=name` explicit, annars svarar Graph
  bara `{ id }` och namnkollen blir meningslös.
- **Verifiera produktmallen, inte bara sektionsfilerna.** Temasteget skrev
  `templates/product.json` men verifierade bara `SEKTIONER`, och
  skrivningen kunde försvinna tyst — ett tema som just packats upp ur
  zip:en skriver över filen under tiden. Mätt 2026-09-09 på DryTrek: steget
  rapporterade ✅ medan produktsidan saknade alla opf-sektioner och bar
  Matstrumpors FAQ ("Hur fungerar Köp 1 – Få 1?") och deras "30 dagars
  öppet köp" i trust-raden. Fixat i `ops.mjs` (skriv om tills byte-kollen
  går igenom), men regeln gäller varje temaskrivning: **en skrivning utan
  tillbakaläsning är inte gjord.**
- **Trust-raden i produktmallen är hårdkodad i zip:en.** `main.blocks.ms_trust`
  bär Matstrumpors löften i klartext. Den är `custom_liquid` och därmed INTE
  översättningsbar — locale-brancha i Liquid i stället
  (`{% if request.locale.iso_code == 'nb' %}`).
- **Skriv aldrig egna nycklar i `factory/state/`.** Filens `steg`-nycklar är
  motorns steg-id:n. En handskriven `brand`-nyckel (mina anteckningar om
  brand-steget) läste `--resume` som "brandingsteget är klart" och hoppade
  över det — butiken hade nästan gått vidare utan sina egna färger
  (mätt 2026-09-09). Anteckningar hör hemma under en EGEN toppnyckel.
- **Anslutningskontrollen ska döma på butikens NAMN, inte på om det finns
  en state-fil.** `/ny-ops` steg 1 har en spärr mot gammal miljö formulerad
  som "har `SHOPIFY_SHOP`-butiken redan en state-fil under `factory/state/`".
  Den spärren räcker inte: mätt 2026-09-09 stod miljöns tre variabler kvar på
  **TankGuard** (`y1sj1i-3d.myshopify.com`), och TankGuard har ingen state-fil
  — bara HeimGuard har det. State-filstestet hade alltså släppt igenom bygget
  rakt in i förra butiken. Det som fångade det var `kontrolleraAnslutning()`,
  som svarade `name: "TankGuard"`. **Läs alltid ut butikens namn och jämför med
  produkten du bygger** innan första skrivningen; en butik som redan har ett
  brandnamn är per definition inte den nya butiken.
- **Kaching-nivåerna läses ur ett JSON-script i HTML:en, inte ur en renderad
  widget.** Kommandot säger "bundle-widgeten renderas där", men widgeten
  ritas av JS i webbläsaren — `curl` på produktsidan ger ingen tabell.
  Nivåerna ligger ändå i sidan, ordagrant, i
  `<script class="kaching-bundles-deal-block-settings" type="application/json">`:
  `dealBars[]` (antal, `discountType`, `discountValue`) plus
  `preselectedDealBarId` som säger vilken nivå som är förvald. Bevisat på
  damaskerna 2026-09-09 — noll credits, ingen webbläsare, ingen inloggning
  mot källbutiken. Spara råkonfigen i `output/<id>/kalla-kaching-paket.json`
  så nivåerna går att granska i efterhand.
- **Playwright når INTE ut på nätet i molnsessionen.** Chromium finns
  förinstallerat, men varje `page.goto()` mot en extern sajt dör på
  `ERR_CONNECTION_RESET` (agentproxyns tunnel stängs mitt i utbytet, mätt
  2026-09-09 mot baverbutiken.se, både med och utan `proxy:`-inställning).
  Lokala `file://`-sidor funkar däremot — det är så loggvarianterna
  renderas till PNG. Bygg alltså aldrig ett fabrikssteg som förutsätter
  att en publik sida kan renderas i webbläsare; läs HTML:en med `curl`
  och plocka JSON:en ur den.
- **`whois` finns inte i containern.** Domänkollen i brand-steget görs med
  RDAP: `https://rdap.org/domain/<domän>` (404 = ledig, 200 = tagen), följ
  omdirigeringen med `curl -L`. Registrets egen `rdap.iis.se` är
  proxyblockerad (502 på CONNECT). Dubbelkolla med ett DNS-uppslag —
  ingen A-post styrker att domänen är oregistrerad.
- **`ops.mjs` skapar produkten som DRAFT, inte ACTIVE.** `build-store.mjs`
  hårdkodar `status: 'DRAFT'` och ACTIVE sätts först av `publiceraProdukt()`
  under `--launch`. Regeln i fas 2 steg 6 (produkten ska vara ACTIVE under
  bygget) uppfylls alltså inte av motorn — **sessionen måste aktivera
  produkten själv** efter bygget, annars upprepas TankGuard-bakläxan med
  404 i menyn och "Exempel på produktnamn" i kundvyn.
- **Den minimala YAML-läsaren förstår inte `[]`.** `factory/yaml.mjs` läser
  `videor: []` som strängen `"[]"`, och nästa `.filter()` kraschar hela
  körningen med `((intermediate value) ?? []).filter is not a function` —
  ett fel som inte säger något om vilken fil eller rad det gäller. Skriv
  tomma listor som mallen gör: nyckeln följd av `- ""`, eller bara nyckeln
  med kommentarer under.
- **Grön konfiguration är inte en grön butik.** Fabrikens QA läser metafält,
  priser och sektioner — inte hur sidan ser ut. DryTrek rapporterades
  2026-09-09 som "14 gröna, 0 fel" medan butiken hette **My Store 3**,
  saknade logga, visade Shopifys default-illustration som hero, hade Dawns
  meny (Home/Catalog/Contact) och stod på engelska. Kör alltid
  **`factory/kundvy.mjs`** mot startsidans riktiga HTML som SISTA kontroll.
- 🔴 **BAS-TEMAT ÄR GENOMSYRAT AV MATSTRUMPOR — 157 fynd i 50 filer**
  (kartlagt 2026-09-09, hela listan i `factory/AVBRANDNING.md`). De värsta:
  fyra av deras RIKTIGA kundrecensioner ligger i startsidan märkta
  "Verifierade köp"; deras Facebook och Instagram i footern; Klaviyos
  app-embed aktiverad; och villkoren ("Fri frakt i Sverige", "30 dagars
  öppet köp") är hårdkodade som FALLBACK i koden — de återuppstår när ett
  fält lämnas tomt. `sections/header-group.json` var helt missad: den säger
  "Levereras presentklart" högst upp på varje sida.
  **Beslutet: en REN bas-zip byggs, en gång.** Tills den finns är varje ny
  butik en manuell rensning — läs AVBRANDNING.md innan du bygger.
- **Bas-zip:en bär MATSTRUMPORS TEXT i tre mallar** (mätt 2026-09-09):
  `templates/index.json` (hero, rubriker, kollektionen `strumporna`,
  produkten `sushi-strumpor`), `sections/footer-group.json` (bolagsblocket
  med `kundsupport@matstrumpor.se`) och `templates/product.json` (samma
  mejl). Kör **`factory/kallskanning.mjs`** mot hela temat innan butiken
  lämnas — rapporten ska vara tom. DryTrek nådde förhandsvisning med
  "Kilometer fyra. Fortfarande torr strumpa." som hero.
- **Bas-zip:ens startsida pekar på MATSTRUMPOR** (mätt 2026-09-09 i
  `factory/tema/ops-tema.zip`: `templates/index.json` har
  `produkt.product = "sushi-strumpor"` och `sortiment.collection =
  "strumporna"`). Ingen kod i `factory/*.mjs` rör `index.json` — startsidan
  byggs för hand av sessionen varje gång. Missas det får butiken en startsida
  som pekar på en produkt som inte finns. **Kontrollera startsidan i kundens
  vy innan "klart" sägs**, och bygg helst steget i fabriken (se
  `factory/FLERPRODUKT.md`).
- **`creative_prefix` ska vara per PRODUKT, aldrig per brand.** I dag står
  brandet där (`TankGuard`, `HeimGuard`). Det håller så länge en butik säljer
  en produkt — men prefixet är det ENDA fyra system använder för att skilja
  produkter åt (prefixkartan i `leveranskon.mjs`, översättningskön,
  adsetuppslaget i `notion-till-meta.mjs`, commission-kopplingen). Brandet
  hör hemma i kampanjnamnet, prefixet i produkten.
- **Alltid svensk lag, aldrig egna köplöften** (Axels beslut 2026-09-08:
  "30 dagars öppet köp" överallt har ruinerat folks trust). Standard är
  14 dagars ångerrätt — i policyn, i USP-strippen, i garantierna.
- **Loggan visas i chatten innan den sätts:** gör 3 varianter i
  brand-steget, välj bäst, visa bilden. Axel kan säga "ny logga" när som
  helst — bytet är ett API-anrop. (TankGuards första logga 2026-09-08
  underkändes.)
- **VA:ns master är Google-dokumentet** (https://docs.google.com/document/d/1gOfJGdyip0u6MqMuQxMLkXq39H-M4EvY/edit) —
  varje ändring i VA-CHECKLIST.md/checklista.mjs förs in där i samma
  session (Axels regel 2026-09-08). Repot är fabrikens sanning,
  dokumentet är VA:ns.
- Säg ALDRIG "klart" utan tre kontroller mot kundens riktiga vy
  (markörskanning + regressionstest + visuell mobilkontroll).
- Publicerat tema är API-låst — bygg alltid nästa version som ny klon,
  Axel publicerar. Räkna med det i stegordningen.
- **Appinbäddningar bor i settings_data.json och dör i varje klon.**
  Judge.me aktiveras som app embed (`current.blocks` → judgeme_core) — den
  raden finns bara i temat den aktiverades i. Varje ny klon utan raden =
  "Judge.me avaktiverad" igen (hände v7→v8→v9, Axel fick aktivera om två
  gånger). Regel: läs `current.blocks` ur LIVE-temats settings_data och
  kopiera in i varje ny klons settings_data INNAN den lämnas för publicering.
- API:t kan inte (custom app-token; Shopify-MCP:n är FÖRBJUDEN i /ny-ops):
  skapa/publicera teman mot live, shop-mejl, checkout-branding
  (Plus), shopPolicyUpdate (scope), Meta-sidor, byta primärspråk.

## ✅ LÖST 2026-09-09 — varukorgen redirectade i stället för att poppa upp

**Symptom (Axel, HeimGuard + TankGuard, båda LIVE och spenderar):** första
gången kunden lägger i varukorgen skickas hen till `/cart` i stället för att
lådan glider in. Gäller sannolikt varje butik byggd ur `ops-tema.zip`.

**Verifierat i zip:en 2026-09-09 (allt detta är RÄTT, felet ligger inte här):**
- `config/settings_data.json` → `cart_type: 'drawer'` ✓
- `layout/theme.liquid` rad 308-310 renderar `{% render 'cart-drawer' %}`
  när `settings.cart_type == 'drawer'` ✓
- `snippets/cart-drawer.liquid` finns och är Dawns riktiga låda ✓

### ⛔ ALLA TRE URSPRUNGLIGA MISSTANKARNA ÄR MOTBEVISADE (2026-09-09, DryTrek-sessionen)

Mätt mot de LIVE-butikernas publika HTML (bara läsning, inget lades i någon
varukorg — en add-to-cart hade skickat en AddToCart-händelse till pixeln och
smutsat ner deras annonsdata):

| Misstanke | Test | Utfall |
|---|---|---|
| Sektionen saknar `{% schema %}` och kan inte hämtas | `GET tankguard.se/?sections=cart-drawer` | **200, 4 489 tecken, innehåller `id="CartDrawer"`** — en sektion utan schema renderas alldeles utmärkt |
| Publicerade temat saknar `cart_type: 'drawer'` | söker `<cart-drawer>` i live-HTML | **finns på både tankguard.se och heimguard.se** |
| `product-form.js` hittar ingen låda och gör formulär-POST | samma HTML | elementet finns i `<body>` före `<main>`, så `this.cart` kan inte vara null — och redirect-raden `else if (!this.cart)` kan alltså inte fira |

### Var redirecten FAKTISKT bor

Kunden klickar inte Dawns köpknapp — hen klickar **paketwidgetens**. Vägen är
`assets/ms-paket.js → kop()`, och den har TVÅ egna redirects, båda via
`laddaOm()` (rad 238-242, `window.location.href = …/cart`):

1. **rad 286:** `data.sections` saknas i svaret från `/cart/add.js`.
2. **rad 282 → `kontrollera()` rad 309:** rabattkoden hittas inte i
   `/cart.js` → `discount_codes` efteråt.

**Väg 2 är den som matchar symptomet "första gången".** Ordningen i `kop()` är
rabattkod FÖRST (rad 244-247), sen `/cart/add.js`. Vid första köpet är
varukorgen TOM när koden sätts, och paketkoderna har minsta antal (2+ / 3+) —
villkoret är alltså inte uppfyllt i det ögonblicket. Är koden då inte kvar i
`discount_codes` när `kontrollera()` läser tillbaka, laddar den om till `/cart`.
Andra gången ligger varor redan i vagnen, koden fastnar, och lådan glider in.
Det förklarar varför felet bara syns på FÖRSTA köpet.

⚠️ **Hypotesen är inte körd i en riktig webbläsare.** Sista ledet — om Shopify
behåller en icke-tillämplig kod i `discount_codes` eller släpper den — går inte
att avgöra genom att läsa kod, och DryTreks front är lösenordsskyddad under
trialen. **Rör inte `ms-paket.js` förrän testet är gjort:** filen är delad, och
HeimGuard och TankGuard är live och spenderar.

**Testet som stänger frågan:** öppna en butik med tom varukorg, välj
2-paketet, lägg i varukorgen, och läs `/cart.js` i konsolen. Står koden i
`discount_codes`? Då är det väg 1 som brister, inte väg 2.

**Fixen om hypotesen håller:** lägg i varan FÖRST, sätt rabattkoden EFTER, och
hämta om sektionerna innan lådan ritas — då är minsta antal uppfyllt när koden
sätts, och lådan visar ändå rabatterat pris.

**Regel:** varukorgen ska testas på RIKTIGT i kundens vy innan en butik får
annonser — lägg i varukorgen med tom korg och se att lådan glider in.
Lägg in det i trippelkollen.

⚠️ **Molnsessionen kan INTE göra det testet själv.** Två spärrar, båda mätta
2026-09-09:
1. Playwright/Chromium finns förinstallerat men når ingen extern sajt —
   varje `page.goto()` dör på `ERR_CONNECTION_RESET` genom agentproxyn.
   `curl` fungerar, en webbläsare gör det inte. Utan webbläsare finns inget
   klick och därmed inget varukorgstest.
2. En ny butik är lösenordsskyddad under trialen, och Admin-API:t lämnar
   inte ut lösenordet (`shop.json` ger bara `password_enabled: true`).

Konsekvens: **en molnsession får aldrig skriva "varukorgen testad".** Den
skriver "varukorgen INTE testad — kräver en människa i en webbläsare", och
butiken står som delvis klar tills någon gjort klicket. Testa aldrig genom
att lägga i varukorgen på en LIVE-butik för att komma runt det — det skickar
en AddToCart till pixeln och smutsar ner annonsdatan.
**ROTORSAKEN (funnen 2026-09-09):** `assets/product-form.js` rad 11 gör
`this.cart = document.querySelector('cart-notification') || document.querySelector('cart-drawer')`
och rad 64 `} else if (!this.cart) {` → **redirect till `/cart`**. Hittar den
inget av elementen faller formuläret tillbaka på en vanlig POST. Layouten
renderar lådan bara när `settings.cart_type == 'drawer'`, och det värdet
ÄRVDES från vilket tema klonen råkade utgå från i stället för att sättas.

**FIXEN:** `byggSettingsPatch` i `factory/branding.mjs` sätter numera
`cart_type: 'drawer'` explicit i varje bygge. Brandingsteget körs på varje
butik, så värdet kan inte längre gå förlorat i en klon.

⚠️ **De butiker som redan är byggda måste rättas för hand** — brandingsteget
körs om, eller `cart_type` sätts direkt i det publicerade temats
`settings_data.json`.

**Regel:** varukorgen ska ändå testas på RIKTIGT i kundens vy innan en butik
får annonser — tom korg, lägg i varan, se att lådan glider in. Det står i
`/ny-ops` Definition of done.
