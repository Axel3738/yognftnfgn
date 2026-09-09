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
6. ⚙️ Produkt som **ACTIVE** med **`inventoryPolicy: CONTINUE`** och
   `inventoryItem.tracked: false` (Axels regel 2026-09-09 — Shopifys default
   DENY stoppar försäljningen tyst när saldot tar slut, medan annonserna
   fortsätter kosta pengar; dropshipping har inget eget lager) (Axels bakläxa 2026-09-08 på TankGuard:
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
    när META_ACCESS_TOKEN finns. 🖐 WeTracked: nytt konto per butik,
    klistra in pixel-id.

## Fas 6 — Annonser (nästa fas, ej bevisad än)
18. ⚙️ Brand-swap av Bäverbutikens vinnare (PLAN.md punkt 1).
19. ⚙️ Q4-ramverket i annonsplanen: banka creatives i förväg (dubbla antalet),
    större PO innan säsong (PLAN.md punkt 6).

## ✅ BEVISAT 2026-09-09 — flerproduktsbutik (TackleBay)

Axels beslut: fiskespöhållaren och fiskeadventskalendern delar EN butik som
två **jämlika** produkter. Det byggdes, och det som fattades i fabriken finns
nu. `factory/FLERPRODUKT.md` punkt 1–4 är avbockade.

**Kör en flerproduktsbutik så här — lista bara fler produktfiler:**

```bash
node factory/ops.mjs factory/butiker/<butik>.yaml \
     factory/produkter/<a>.yaml factory/produkter/<b>.yaml
node factory/paket.mjs factory/butiker/<butik>.yaml <a>.yaml <b>.yaml
node factory/marknad.mjs factory/butiker/<butik>.yaml
node factory/oversatt-butik.mjs factory/oversattningar/<butik>-nb.mjs
```

**Vad som är nytt i motorn**
- `ops.mjs`: varje steg har `niva` — `'butik'` körs en gång, `'produkt'` en
  gång per produkt. Eget state per nivå (`<butik>--_butik.json`), så en ny
  produkt kan läggas till i en färdig butik utan att butikens steg görs om.
- **QA körs per produkt** och `--launch` vägrar om NÅGON produkt är röd.
- Motorn **stoppar** om två produkter delar `creative_prefix`.
- `tema-upload.mjs` — steget fanns inte förut; HeimGuard fick sitt tema
  uppladdat för hand och varje ny butik stod med Shopifys standardtema.
  ⚠️ `THEME` finns inte som staged-upload-resurs i 2025-07 — använd `FILE`,
  vars `resourceUrl` themeCreate hämtar zip:en från.
- `startsida.mjs` — skriver `templates/index.json` OCH sidfotens bolagsblock
  ur konfigen. Flerprodukt ⇒ kollektionen (`sortiment`), enprodukt ⇒
  `featured-product`. Detta var buggen som gav DryTrek Matstrumpors hero.
- `meny`-steget skriver även `main-menu`, en rad per produkt.
- `kallskanning`-steget körs som **spärr efter startsidan**, så den mäter
  det som faktiskt ligger i temat.
- `paket.mjs` — metaobjektet `ms_paketniva` (translatable på från start),
  A/B-nivåer och de riktiga rabattkoderna. Mitten alltid förvald.
- `marknad.mjs` + `oversatt-butik.mjs` — marknad, locale, webPresence och
  translationsRegister.

**API-fällor mätta 2026-09-09 mot 2025-07** (alla rättade i koden):
- `pageByHandle` finns inte längre på QueryRoot → `pages(first:, query:)`.
- En query som deklarerar en variabel den inte använder avvisas (`hamtaMeny`).
- `webPresenceUpdate` tar `input:`, inte `webPresence:`.
- Tema-JSON kan bära ett `/* … */`-block överst som `JSON.parse` kvävs på.
- Mallarnas översättningsnycklar har prefixet `section.<mall>.json.`
  (**singular**). `sections.` i plural är temats schemaetiketter.
- **Menyns RADER är egna resurser** (`gid://shopify/Link/…`) — menyn själv
  exponerar bara sin titel. Översätts bara menyn får kunden en norsk sida
  med svenska menylänkar.

⚠️ **VALUTASPÄRREN — en rabattkod lagras i BUTIKENS valuta.** TackleBays åtta
koder skrevs som PHP-belopp för att trialbutiken registrerades i Filippinerna
och ingen hade bytt valuta än. Felet syns inte i adminen, bara i kassan på
riktiga ordrar. `paket.mjs` vägrar numera skriva koder när butikens valuta
skiljer sig från konfigens. **Byt valuta FÖRE paketsteget.**

⚠️ **VA:ns butik kommer med sitt eget land och språk.** TackleBay startade som
`en` primärspråk, marknad Filippinerna, valuta PHP. Primärspråk och valuta går
INTE att sätta via API:t — de är klick i checklistan, och de måste göras innan
paket och kassa stämmer.

⚠️ **YAML-läsaren tolkade en citerad listrad med kolon som ett objekt.**
Raden `- "Vi säljer det som löser något konkret: spön som inte trasslar."`
blev `{ '"Vi säljer …konkret': 'spön …"' }` och renderades som
`[object Object]` på startsidan. Rättat i `yaml.mjs` med regressionstest i
`factory/test/yaml.test.mjs`. Kolon i löptext är vanligt — buggen träffade
`benefits`, `problem` och `features` precis lika lätt.

⚠️ **Admin-tokenen lever 24 timmar — spara klientuppgifterna, inte tokenen.**
`/ny-ops` steg 1 säger att en rad `SHOPIFY_ADMIN_TOKEN_<butiks-id>` ska sparas
i `factory/.env` "så gamla butiker förblir nåbara". Mätt 2026-09-09: en token
hämtad med `client_credentials` svarar `expires_in: 86399` — den är
färskvara och räcker för dagens körning, inte för nästa vecka. Det som är
durabelt är butikens **CLIENT ID + CLIENT SECRET**, en uppsättning per butik.
Ska en gammal butik nås igen: hämta en ny token med den butikens
klientuppgifter. Raden med tokenen sparas ändå — den är gratis och gäller
resten av dygnet — men den är inte vägen tillbaka till en gammal butik.

⚠️ **Klistras en Client secret i chatten måste den bytas.** Hände 2026-09-09
på TackleBay: VA:n klistrade `SHOPIFY_SHOP` + `SHOPIFY_CLIENT_ID` +
`SHOPIFY_CLIENT_SECRET` direkt i chatten i stället för i Environment.
Bygget fungerade, men hemligheten ligger kvar i transkriptet. Rutinen är
dev.shopify.com → appen → Settings → Client secret → generera ny → lägg den
nya i Environment. Den redan hämtade tokenen fortsätter fungera tills den
går ut, så bytet stoppar inte ett pågående bygge.

⚠️ **LÄS PRODUKTBILDERNA INNAN COPYN SKRIVS — källans text kan vara fel.**
Mätt 2026-09-09 på TackleBay: Bäverbutikens beskrivning av fiskespöhållaren
säger *"monteras enkelt på vägg eller i båten"* och *"fyra hållare som håller
ordning"*. Leverantörens egna bilder visar något helt annat — en **klämma**
som låser runt spöt i två steg, med inbyggd svamp, och texten *"förhindrar
kollision eller trassel av spökroppen under transport"*. Ingen skruv, ingen
vägg. Hela produktsidan (rubriker, benefits, features, FAQ, annonsvinklar och
den norska översättningen) byggdes först på den falska premissen och fick
skrivas om. **Bilderna är facit — de kommer från leverantören, texten kan vara
skriven av någon som aldrig sett produkten.** Öppna varje produktbild och läs
den inbrända texten som ett eget steg i fas 1, före brand-steget.

⚠️ **`productSet` skapar på handle men UPPDATERAR bara på id.** Utan `id` i
inputen svarar Shopify *"Handle already in use"* så fort produkten finns —
alltså varje gång en färdig butiks copy ska skrivas om. `ops.mjs` slår därför
upp produkten först och skickar med id:t.

## Regler som bevisats den hårda vägen
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

**Huvudmisstanke — sektionen saknar `{% schema %}`.** `sections/cart-drawer.liquid`
i zip:en är en ren wrapper (`{%- render 'cart-drawer' -%}`, noll `schema`-träffar).
Dawns `cart-drawer.js` hämtar `?sections=cart-drawer` vid varje varukorgsändring —
en sektion utan schema kan inte hämtas via sektions-API:t. Samma wrapper skrivs
dessutom om av `byggKorgUpsell` i `factory/tema.mjs`.

**Andra kandidater, i tur och ordning:**
1. Det PUBLICERADE temats `settings_data.json` har inte `cart_type: 'drawer'`
   — kloner tappar inställningar precis som de tappar app-embeds.
2. `product-form.js` hittar inget `<cart-drawer>`-element vid första laddningen
   och faller tillbaka på vanlig formulär-POST.

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
