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

## Körordningen som kod (bevisad på TankGuard, 2026-09-08 — butik nr 2)

Varje steg nedan är ett skript i `factory/`, idempotent, noll beroenden
(utom bildrastreringen som lånar sharp ur `pipeline/node_modules`).
Kör från repo-roten, i den här ordningen:

| # | Steg | Kommando |
|---|---|---|
| 0 | **Connected** — minta token ur butikens egen app, spärr mot gammal state | `node factory/token.mjs --butik <id>` |
| 1 | Konfig: `butiker/<id>.yaml` + `produkter/<id>.yaml`, dry-run | `node factory/ops.mjs <butik> <produkt> --dry-run` |
| 2 | Logga + favicon (rund emblem ur brandingen) | `node factory/logga.mjs <butik> --ut <mapp>` |
| 3 | Språkversionerade bilder (text på platta → sharp; foto → kie rensar först) | `node factory/bildtext.mjs <in> <ut> --spec <json>` |
| 4 | Upp i Files (logga, favicon, hero, trygghet, [SV]/[NO]-bilder) | `laddaUppBild()` i `factory/filer.mjs` |
| 5 | OPS-temat ur `factory/tema/ops-tema.zip` som UNPUBLISHED | `node factory/tema-upp.mjs <butik>` |
| 6 | Produkt (DRAFT) → metafält → brand → opf-sektioner → **temats innehåll** (startsida, header/footer, inställningar, upsell, gallerifilter) → sidor → policyer → menyer → frakt → huvudmarknad → QA | `node factory/ops.mjs <butik> <produkt>` (+ `--resume`, `--igen steg`) |
| 7 | Bonusprodukten (Q4-ramverket), ACTIVE + publicerad, id:n tillbaka i filen | `node factory/bonus.mjs <produkt>` |
| 8 | Paketnivåer A/B (metaobjekt, translatable) + rabattkoder som ger exakt paketpris | `node factory/paket.mjs <produkt>` |
| 9 | Översättningsunderlag → subagent (sonnet) → `oversattning-nb.json` | `node factory/oversattning.mjs <butik> <produkt>` |
| 10 | Marknad NO + locale nb + webbnärvaro + translationsRegister på allt | `node factory/marknader.mjs <butik> <produkt>` |
| 11 | Locale-branchade custom_liquid-texter in i produktmallen | `node factory/ops.mjs … --resume --igen startsida` |
| 12 | Trippelkollen mot kundens vy (kräver `SHOPIFY_STOREFRONT_PASSWORD` under trial) | `node factory/kolla.mjs <butik> <produkt>` |
| 13 | "Store ready": recensionsfilen (sv + no, originaldatum) till VA:ns app-import, pixel, Discord-kanaler (VA:n skapar servern — boten får inte) | `node factory/ops.mjs … --resume --igen recensioner`, `factory/meta-setup.mjs`, `factory/discord.mjs --guild <id>` |

Lärdomar från bygget 2026-09-08 (API 2025-07, alla mätta):
- `pageByHandle` finns inte — sidor slås upp via `pages(query: "handle:…")`.
- En deklarerad men oanvänd GraphQL-variabel avvisas ("Variable … not used").
- Fraktmetoder med villkor (t.ex. Shopifys default "fri frakt över X") listas
  som en extra nod `<id>?source=RateRangeCondition…` och kan varken
  uppdateras eller raderas via `deliveryProfileUpdate` — de tas bort och
  ersätts (`frakt.mjs` märker dem `villkorad`).
- `MetaobjectDefinitionCreateInput` saknar `displayNameField`; storefront-
  åtkomst `PUBLIC_READ` krävs för att `shop.metaobjects` ska se posterna.
- `settings_data.json` normaliseras av Shopify (bytestorleken ändras) — verifiera
  Liquid byte för byte, JSON genom att läsa tillbaka och tolka. Schemat
  (`settings_schema.json`) laddas upp FÖRE settings_data, annars städas
  okända fält (`ms_ab_tests`) bort.
- Zip:ens `settings_schema.json` saknar A/B-fälten som `ms-head` läser —
  `tema-mall.mjs` lägger till gruppen "OPS A/B-test".
- `productSet` med `files` synkar galleriet (id eller originalSource + alt) —
  alt-texten bär [SV]/[NO]-märkningen som gallerifiltret i ms-head läser.
- Produktförhandsvisningen (`onlineStorePreviewUrl`) renderar alltid LIVE-
  temat — `preview_theme_id` ignoreras där. Utkasttemat kollas mot riktiga
  storefronten, som under trial ligger bakom lösenord (kan inte tas bort
  utan plan): `kolla.mjs` postar `SHOPIFY_STOREFRONT_PASSWORD` till `/password`.
- Judge.me-tokenen kan inte läsas via API — den är VA:ns klick (steg 7).
- **Temat väljs på ID ur state-filen, aldrig "första UNPUBLISHED"** (TankGuard
  2026-09-08: VA:n publicerade utkastet mitt i bygget, varpå Horizon blev det
  opublicerade temat och ett steg försökte patcha fel tema —
  `hamtaArbetstema(temaId)` i shopify.mjs). Admin-API:t skriver fint mot
  MAIN-temat med butikens egen app (themeFilesUpsert verifierat samma dag) —
  regeln "publicerat tema är API-låst" gällde MCP-kopplingen, inte appen.
  Under trialen skyddar lösenordssidan kunden, så små patchar går direkt
  mot live; större omtag byggs fortfarande som ny klon.
- Storefronten stryper täta anrop (429 efter ~10 sidor/minut) — `kolla.mjs`
  pausar mellan sidor och väntar 15–60 s vid 429 i stället för att rapportera
  rött. Judge.me-widgeten (Appytan renderas som `<section>`) klipps bort
  före markörskanningen: den visar sv+no-recensioner blandat med flit.
- Temats egna svenska ord i `ms-paket.liquid` ("Gratis på köpet", "värde",
  "Välj paket") och `ms-delivery-estimate` ("arbetsdagar" + svenska
  månadsnamn via Intl sv-SE) syntes på /nb i kundvyn — `tema-mall.patchaMsPaket`
  locale-branchar snippeten och nb får en statisk leveransrad.
- Judge.me knyter reviewer-NAMNET till mejladressen: samma syntetiska
  `recension-N@…` i sv- och no-CSV:n gav de norska raderna svenska namn
  (TankGuard 2026-09-08). `tools/judgeme-import.mjs --mejlsuffix` bygger nu
  adressen av CSV-filens stam + radnummer, unikt per fil. Fel rader kan inte
  raderas via v1-API:t — `PUT /reviews/<id>` med `hidden: true, curated: spam`
  döljer dem. Nya butiker får Judge.me-produkt-id:n som ger 422 i
  `/reviews?product_id=` — dubblettspärren faller tillbaka på butiksvid
  läsning filtrerad på `product_external_id`.
- **Judge.mes API kan inte sätta recensionsdatum** (mätt 2026-09-08 på
  TankGuard: `created_at` ignoreras på POST /reviews och på PUT, även som
  `review_date`). Recensioner importeras därför ENBART via appens CSV-import
  (fas 3) — `tools/judgeme-import.mjs` stoppar numera utan `--utan-datum`.
- Metasidan VA:n skapar ska ligga I företaget (Business settings → Pages →
  Add, som HeimGuard 1262406533629248). Verifiera Page ID:t mot BÅDA
  listorna `GET /<business_id>/owned_pages` och `client_pages` — en sida
  som VA:n skapat på sitt eget konto och delat in hamnar i `client_pages`
  (TankGuard 1399193996606775, 2026-09-08). `GET /<page_id>` direkt går
  inte med rutinernas token (kräver `pages_read_engagement`, kod 100) —
  det säger inget om sidan. Ett id som saknas i båda listorna är fel
  (VA:ns första id 61594435402676 samma dag) och får inte användas i
  annonser. Pixelns `last_fired_time` saknas tills WeTracked skickat
  första eventet — så syns om kopplingen lever.
- Discord: boten kan inte skapa servrar (`POST /guilds` → 20001, mätt
  2026-09-08). VA:n skapar servern och auktoriserar boten via länken
  `discord.mjs` skriver ut utan `--guild`. Skickar hon en invite-länk
  (`discord.gg/<kod>`) i stället för ett server-id: `GET /invites/<kod>`
  ger `guild.id` utan token — kolla sen i `GET /users/@me/guilds` att boten
  är inne innan `--guild` körs. Serverikonen hämtas ur Shopify Files
  (`files(query: "filename:<brand>-logga")`) — `output/loggor/` dör med
  containern.
- Storefrontens "429" på `/cart/add.js` från molnsessionen är Cloudflares
  bot-utmaning (`cf-mitigated: challenge`, "Verifying your connection…"),
  inte strypning — den går inte att vänta bort och ska inte kringgås.
  Köptestet i `kolla.mjs` rapporterar det som "kan inte köras härifrån";
  kassapriserna verifieras då via rabattkodernas definitioner i admin
  (`paket.mjs` räknar dem öre-exakt) och ett ögonköp i kundvyn.

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
6. ⚙️ Produkt som **ACTIVE** (Axels bakläxa 2026-09-08 på TankGuard:
   DRAFT ger 404 i menyn och "Exempel på produktnamn" i kundvyn —
   butiken är ändå lösenordsskyddad under trialen) → metafält →
   opf-sektioner → produktmall → startsida →
   meny → policysidor (adress från allabolag.se) → fraktzoner.
7. ⚙️ Paketen: metaobjekt `ms_paketniva` (translatable-capability PÅ från
   start!) + riktiga rabattkoder som ger exakt paketpriserna. A = originalets
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
   Kodat 2026-09-08 (TankGuard): `paket.mjs` räknar koderna ur
   `offer.paket.nivaer` (gratis_antal per nivå); kryssrutan är
   `tema.mjs → byggTillagg` (snippets/opf-tillagg, block `opf_tillagg` direkt
   efter paketblocken i produkt- OCH startsidemallen, `tillagg_kryssruta` +
   `kortnamn` i produktfilen). Den forkar inte ms-paket.js: kryssrutan
   sätter nivå 1:s data-gratis-* till bonusens FULLA pris utan kod, så
   kortet, sticky-knappen och kassan visar samma summa (489 + 199).
   Texterna locale-branchas (`liquid.tillagg.label/info` i underlaget).
   ⚠️ Ännu bara verifierad via API-tillbakaläsning — klicktestet mot
   kundens vy kräver butikslösenordet.
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
11. 🖐 Installera Judge.me + språk.
12. ⚙️ Fabriken skriver `output/<id>/judgeme-app-import.csv` i **Judge.mes
    eget mallformat** (dd/mm/yyyy, product_id + handle) — original +
    marknadernas översatta delmängder i EN fil — och 🖐 VA:n laddar upp den
    i appen: Settings → Import reviews → Import from apps → Judge.me
    format → Import. **Aldrig via API:t** (Axels regel 2026-09-08): Judge.mes
    v1-API sätter alltid importögonblicket som datum — `created_at`
    ignoreras på POST och PUT (mätt på TankGuard samma dag, 16 recensioner
    med "för 12 minuter sedan" på allihop = fejkstämpel). Originaldatumen
    hämtas ur källans `reviews_for_widget` (`reviews[].created_at`) och står
    i produktfilen (`reviews[].datum`); saknas ett datum stoppar
    `byggJudgeMeAppCsv`. Fel rader kan inte raderas via API:t — `PUT
    /reviews/<id>` med `hidden: true, curated: spam` döljer dem.
    **Flerspråkiga recensioner utan betald plan**
    (Axels beslut 2026-09-07: Judge.mes auto-översättning är paid — köps
    aldrig): fabriken översätter själv en delmängd av recensionerna till
    marknadens språk och lägger dem i samma fil som EGNA recensioner med
    lokala namn (Ola/Kari/Bjørn …) och källans datum. Blandningen sv+no i
    samma lista ser naturlig ut för en butik som säljer i båda länderna.
    Efter importen: verifiera datumen i kundvyn (widgetdatan =
    `judge.me/reviews/reviews_for_widget?shop_domain=<butik>&product_id=<id>`
    — samma källa som kunden ser, går att läsa utan lösenord).
    Widgeten läggs i temats egen **Appyta**
    (ms-app-slot) i produktmallen, stjärnbadgen som block under titeln
    (appblock-uuid är global). **Widgeten stylas ALDRIG med CSS från
    temat** (Axels beslut 2026-09-07) — utseendet ställs i Judge.me-appens
    inställningar. 🖐 Klicken där: Language **Svenska**, star color
    **#00B77F** (alltid, varje butik — `STJARNFARG` i branding.mjs).
    Judge.mes settings-API är läs-bara (skrivförsök ger 404), så de två
    fälten är klick i checklistan.

## Fas 4 — Marknader (STANDARD i varje ny OPS, Axel 2026-09-08: SE huvudspråk + marknad Norge locale nb; fler marknader läggs till på samma sätt)
13. ⚙️ Marknad Norge + locale nb (publicerad) + nb som alternateLocale på
    huvuddomänens webPresence (`webPresenceUpdate` — INTE market-varianten).
    NOK slås på i admin (API-spärrat i unified markets).
14. ⚙️ ALLT översätts via translationsRegister — trippelkolla mot /nb:
    produkt+metafält, tema-JSON-mallar (index/product), sektionsgrupper
    (header/footer), menylänkar, sidor, paket-METAOBJEKT. locales/nb.json för
    temats köpsträngar. custom_liquid är EJ översättningsbart —
    locale-brancha i Liquid. Sektionsdefaults = locale-medvetna i opf-koden.
    ⚠️ Tema-översättningar är knutna till TEMA-ID — ny temaklon = registrera
    om (nycklar/digests är stabila mellan kloner).
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
16. ⚙️ NOK-paketnivåer innan norska annonser (SEK-belopp räknar fel i NOK).
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
    när META_ACCESS_TOKEN finns — skriptet ger också företagets
    "Conversions API System User" tillgång till pixeln (`assigned_users`,
    bevisat TankGuard 2026-09-08). 🖐 WeTracked: nytt konto per butik,
    klistra in pixel-id + CAPI-token. **CAPI-tokenen kan inte skapas via
    API:t**: `POST /<systemanvändare>/access_tokens` kräver `appsecret_proof`
    (appens hemlighet finns inte i miljön — mätt 2026-09-08, kod 100). VA:n
    trycker Metas egen knapp: Events Manager → Data sources → pixeln →
    Settings → Conversions API → **Generate access token** → klistra in i
    WeTracked. Tokenen passerar aldrig chatten.

## Fas 6 — Annonser (nästa fas, ej bevisad än)
18. ⚙️ Brand-swap av Bäverbutikens vinnare (PLAN.md punkt 1).
19. ⚙️ Q4-ramverket i annonsplanen: banka creatives i förväg (dubbla antalet),
    större PO innan säsong (PLAN.md punkt 6).

## Regler som bevisats den hårda vägen
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
