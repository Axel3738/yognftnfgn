# /ny-ops – Bygg en komplett one-product-store (OPS Factory)

Argument: `$ARGUMENTS` — källänk(ar) till produkten (Bäverbutik-produktsida)
+ ev. önskat brandnamn. SE (svenska) + NO (locale nb) är ALLTID standard;
marknads-argument gäller bara YTTERLIGARE marknader.
Exempel: `/ny-ops https://bäverbutiken.se/products/lastnat`

**Flera länkar = en nischbutik med flera produkter** (Axels beslut 2026-09-09).
Produktloopen är byggd: lista bara fler produktfiler i samma körning. Brandet
bär nischen, startsidan blir kollektionen, huvudmenyn får en rad per produkt,
varje produkt får eget `creative_prefix` (motorn stoppar om två delar) och egen
break-even. **Säger prompten "nischbutik" med EN länk** (AdventLane 2026-09-10):
sätt `butik.kollektion.alltid: true` i butiksfilen — då byggs kollektionen,
kollektionsraden och kollektionsstartsidan redan nu, och nästa produkt är bara
en produktfil till. Brandtexterna får aldrig låsa brandet vid första produkten.

Kommandot körs EFTER att checklistans avsnitt 1–3 är gjorda (butik på free
trial, appen kopplad via `SHOPIFY_SHOP` + `SHOPIFY_CLIENT_ID` +
`SHOPIFY_CLIENT_SECRET` + `SHOPIFY_STOREFRONT_PASSWORD` i miljön). Det bygger
sen FÄRDIGT hela butiken utan att vänta — bara de manuella klicken återstår.

Den som kör är **Axel själv sedan 2026-09-10** (VA:n slutade) — svara honom
på **svenska**, korta rader. Anställs någon engelsktalande igen svaras hen på
engelska. Språket följer LÄSAREN. Facit: `factory/PROCESS.md` (rutinen,
reglerna) och `factory/KEDJAN.md` (koden). De manuella klicken:
`factory/VA-CHECKLIST.md`, ifylld till `factory/output/<butik>/CHECKLISTA.md`
(filnamnet ligger kvar, rollen är Axels eller nästa anställds).

**Regel: Shopify-MCP:n är FÖRBJUDEN i hela rutinen** — aldrig `get-shop-info`,
`switch-shop` eller något `mcp__*`-Shopify-verktyg. All åtkomst via token i
`factory/.env`. Rör aldrig pzjagy-mz (HeimGuard) eller Bäverbutiken.

**Innan du säger att något inte går att automatisera: läs
`factory/API-GRANSER.md`.** Varje påstående där är märkt MÄTT, OBEKRÄFTAT
eller MÄNSKLIGT. Temapublicering stod som "API-spärrad" i tre filer tills
någon provade — den fungerade. Skriv aldrig "API:t kan inte" utan en felkod
och ett datum; skriv "ingen har provat" i stället.

Gör i ordning, utan att invänta godkännande mellan stegen:

1. **Rätt butik — FÖRSTA handlingen, före allt annat.**
   Kedjans steg 0 (`node factory/token.mjs --butik <id>`, eller steg 0 i
   `ops.mjs`): token ur butikens egen app, spärrarna, och raden
   "Connected: <domän> ✓" i chatten. Inget annat läses först.
   Regel: butikens NAMN ur Shopify är facit — ett brand som redan finns i
   `factory/butiker/` eller `factory/output/` = miljön står kvar på förra
   butiken, stoppa. Saknas nycklarna: be den som kör göra checklistans
   avsnitt 3, klistra aldrig nycklar i chatten. Säger steg 0 "Connected ✓ …
   men appen har N av 16 scopes": butiken är rätt, appen får inget göra —
   ge den som kör raden steg 0 skriver ut (Configuration → Access scopes →
   Release) och bygg ingenting förrän den är inne. *(TackleBay 2026-09-10.)*

   ⚠️ **Står en butiksadress i prompten är DEN facit** — inte butiks-id:t.
   Skicka den som `--doman <adressen>` (eller `onskadDoman` till `anslut`).
   Koden letar då upp vilket miljösuffix som bär adressen och använder det,
   så den som kör aldrig behöver veta vad fabriken kallar butiken. Skriv in adressen
   som `judgeme.shop_domain` i butiksfilen — då hittar varje omkörning rätt
   av sig själv.

   ⚠️ **Utan adress läses de fyra variablerna UTAN suffix**, och de betyder
   "butiken jag bygger just nu". Alla sessioner på kontot delar samma
   Environment, så två parallella bygg slåss då om samma fyra rader.
   *(Mätt 2026-09-10: fyra dagars stopp. Miljön hade sju `SHOPIFY_SHOP*`,
   den utan suffix stod på TankGuard, och tre sessioner i rad byggde mot fel
   butik. Axels beslut samma dag: adressen är gränssnittet, inte ett id
   som två personer måste gissa lika.)*
   Får du fel butik: felet listar redan vilka `SHOPIFY_SHOP*` som finns,
   ger de fyra raderna att klistra in, och bär miljöfällorna (`MILJOFALLOR`
   i `token.mjs`). Läs det innan du ber någon röra Shopify.
2. **Hämta produktdata** ur källänken: `/products/<handle>.json`, Judge.me
   `reviews_for_widget` (originaldatum), Kaching-nivåerna ur sidans JSON-script
   → `output/<id>/kalla-kaching-paket.json`. Öppna produktbilderna och läs den
   inbrända texten — bilderna är facit, inte källtexten. Aldrig påhittade
   specs eller recensioner; noll recensioner sägs rakt ut i slutrapporten.
   Regel: aldrig MCP mot källbutiken, aldrig webbläsare (Playwright når inte ut).
3. **Brand-steget** (PROCESS.md fas 1): köpare/emotion → `branding:`-blocket,
   byggt från noll per butik. Namnregeln: helst helt engelskt namn, läsbart
   för svenskar/norrmän, aldrig å/ä/ö; domänen kollas med RDAP först. Tre
   loggvarianter (`node factory/logga-generera.mjs <butik.yaml>`) VISAS i
   chatten, och **den som kör väljer** (Axel eller den anställde — Axels
   beslut 2026-09-10). Skriv STORE NAME + DOMAIN direkt i chatten — den som
   klickar fortsätter med checklistans avsnitt 6 medan bygget går.

   **Loggfeedback-loopen (Axels beslut 2026-09-10):**
   - FÖRE genereringen: `node factory/logga-feedback.mjs --sammanfatta`.
     Den variant som vinner oftast är utgångsläget; en variant som aldrig
     valts byts mot något nytt (annat motiv, annan komposition) — visa
     aldrig samma tre gissningar en gång till. Läs kommentarerna.
   - EFTER valet: `node factory/logga-feedback.mjs <butik-id> <a|b|c>
     --motiv <motiv> --kommentar "<vad personen sa om varför>"`. Ingen
     kommentar = tom kommentar, men raden skrivs alltid. Filen
     `factory/LOGGA-FEEDBACK.md` committas med bygget.
   Regel: ett val som inte loggas gör nästa butiks loggor lika dåliga som
   den här butikens — loopen är hela poängen.
4. **Konfig:** `factory/butiker/<id>.yaml` + `factory/produkter/<id>.yaml` ur
   mallarna (en produktfil per länk), sen
   `node factory/ops.mjs factory/butiker/<id>.yaml factory/produkter/<p>.yaml … --dry-run`.
   Regel: aldrig `validera.mjs` fristående på bara produktfilen.
5. **Bygg i Shopify:** samma kommando utan `--dry-run` — kedjans steg 1–17
   (tema-upload → brand → tema → avbrandning → logga → produkt → metafält →
   lagerpolicy → bonus → paket → kollektion → startsida → sidor/policyer/
   meny/frakt/huvudmarknad → källskanning → recensioner → marknad → oversatt).
   Ett 🖐-steg stoppar inte; ett ❌ rättas och körs om med `--resume` eller
   `--igen <steg>`. Regel: tema-id:t är låst i state — aldrig "första
   UNPUBLISHED"; varje skrivning läses tillbaka av motorn.

   **Paketregeln (Axels beslut 2026-09-10, gäller varje ny OPS-butik):**
   nivåerna är alltid **1 / 2 / 4** (aldrig 1 / 2 / 3) — källans 3-pack byts
   mot 4-pack, källans procent för toppnivån behålls, mitten förvald. Har
   produkten varianter (färg, storlek …) får paketet en
   **rullgardin per enhet**, aldrig temats pill-väljare: 1-pack = 1 rullgardin,
   2-pack = 2, 4-pack = 4. Varje alternativ visar variantens bild + namn (som Kaching),
   kunden får blanda varianter, köpet lägger en rad per vald variant och
   temats variant-picker göms. Koden bor i `snippets/ms-paket.liquid`,
   `assets/ms-paket.js` och `assets/ms-paket.css` i
   `factory/tema/ops-tema.zip` — inget att bygga per butik; produktmallens
   render-anrop skickar `enhet: 'par'` (eller rätt ord för produkten), och
   `underrubrik` lämnas tom på nivåer över 1 — styckpriset räknas i temat.
   ⚠️ `factory/tema/assets/ms-paket.js` är fabriksägd, skrivs över i varje
   butik i steg 3 (`TEMAFILER`) och ett test håller zip:ens kopia
   byte-identisk — rullgardinskoden ska alltså finnas i båda.
6. **Översättningen** (steg 17): en subagent med `model: "sonnet"` översätter
   `output/<butik>/oversattning-sv.json` → `oversattning-nb.json` med samma
   nycklar (+ `docs/copy-regler.md`). Sen `--igen tema,oversatt,recensioner` —
   **tema först**, och **recensioner sist**: app-CSV:n får sina norska rader ur
   nb-filen, så en CSV byggd före översättningen bär bara svenskan (CaraShell
   2026-09-10: 11 rader före, 17 efter). Produktmallens trust-rad är
   `custom_liquid` och locale-branchas ur
   `oversattning-nb.json` när mallen SKRIVS; på första bygget fanns ingen
   nb-fil vid steg 3, så utan omkörning står "Fri frakt – Sverige & Norge" och
   "14 dagars ångerrätt" kvar på /nb *(CaraShell 2026-09-10)*. Regel: koden
   översätter aldrig själv; läckor i rapporten = steget förblir 🖐.
   Markörlistan (`markorer_sv`) får inte bära ord som stavas lika på norska
   ("taket", "fukt") — de kan aldrig skilja svenska från norska och ger bara
   falska larm.
   "Allt" i steg 16–17 betyder 13 resurstyper (produkt, varianter, meny,
   sidor, policyer, blogg, metaobjekt, metafält, fraktmetoder, tema-JSON,
   sektionsgrupper, temainställningar) — och vad kunden faktiskt ser avgörs
   av språkkollen i steg 8, inte av att raderna gick in.
7. **Valuta- och språkklicket** (checklistans avsnitt 2): när någon skriver
   "currency and language are set", kör `--igen paket,huvudmarknad`.
   Regel: rabattkoder lagras i butikens valuta — paketsteget vägrar tills
   valutan stämmer.
8. **QA** (steg 18, alltid färsk): `kontroll.mjs` + kundvyn på RIKTIG HTML
   (startsida + produktsida, sv och nb) + trippelkollen. Fristående:
   `node factory/kundvy-kor.mjs <butik-id> <produkt-id>` och
   `node factory/trippelkoll.mjs <butik-id> <produkt-id>`.
   Regel: utan HTML är kundvyn röd, aldrig grön. Varukorgen (tom korg → lådan
   glider in → räkna varorna) och mobilvyn är en människa i webbläsare —
   skriv "inte testad", aldrig "testad".
   **Avsluta alltid med språkkollen:**
   `node factory/sprakkoll.mjs <butik-id> <handle> --losenord X` läser de
   riktiga /nb-sidorna (startsida, produktsida, alla sidor och policyer) och
   larmar på varje svensk rest — svenska former som inte finns i bokmål och
   svenska priser. Shopify faller tyst tillbaka på svenskan för varje
   oöversatt sträng, så "locale nb finns" bevisar ingenting (Axels bakläxa
   2026-09-09, DryTrek). Grönt betyder "inga svenska rester", inte
   korrekturläst.
9. **Checklistan OCH leveransen i chatten** (steg 19):
    `output/<butik>/CHECKLISTA.md` skrivs av motorn (EN fil per butik) —
    arkivkopian. Sen levereras TRE saker i chatten, och ingen av dem är
    valfri. Den som klickar sitter i en webbläsare eller i en telefon och kan
    inte öppna en repo-sökväg: **en sökväg i en rapport är ingen leverans.**
    a. **Värdena:** STORE NAME, DOMAIN, STORE EMAIL (hello@domänen) och vilket
       avsnitt i checklistan hen fortsätter på.
    b. **Judge.me-filen, per produkt** — bifoga
       `output/<produkt-id>/judgeme-app-import.csv` med filverktyget (en
       bilaga per produkt, aldrig bara sökvägen). Filen bär redan
       **originalspråket OCH varje marknads översatta recensioner i EN fil**
       med originaldatum — `byggJudgeMeAppCsv` slår ihop dem, så det finns
       ingen separat norsk fil att leta efter. (`judgeme-import*.csv` utan
       `-app-` är API-formatet; det får aldrig laddas upp i appen, API:t
       skriver över datumen.) Saknar en recension datum stoppar bygget här —
       hämta datumet ur källan, hitta aldrig på det.
       *(Axels bakläxa 2026-09-10: filerna låg färdiga i
       `output/adventskalender-racingbilar/` hela tiden. Han fick dem aldrig,
       för rapporten skrev en sökväg. Därför är bilagan ett DoD-krav nu.)*
    c. **Discord-auktoriseringslänken** —
       `node factory/discord.mjs factory/butiker/<butik>.yaml` UTAN `--guild`
       skriver ut länken och avslutar med exitkod 1; det är meningen, inte ett
       fel. Klistra in länken i rapporten. Då är hela Discord-jobbet: skapa
       servern, klicka länken. Kräver `DISCORD_BOT_TOKEN` — saknas den, säg
       det rakt ut och gissa ALDRIG en länk.
    Ändrades mallen (`VA-CHECKLIST.md`/`checklista.mjs`): för in det i
    Google-dokumentet i samma session.
10. **Launch:** `node factory/ops.mjs … --launch` — produkterna ACTIVE +
    publicerade, vägrar om butiken eller NÅGON produkt är röd. Motorn skriver
    ut temanamnet (`<Brand> – CRO v1`); en människa publicerar det
    (checklistans avsnitt 5). Regel: fabriken rör aldrig annonskontot vid
    launch.
11. **"Store ready: <namn>"** → `node factory/store-ready.mjs <butik-id>
    [--guild <discord-server-id>]`: recensionerna (API om butikens
    Judge.me-token finns i env — annars är app-filen från steg 9b vägen,
    originaldatumen följer bara med appens import), pixeln i **MagiBorsten DK
    `915422744950975`** (samma konto för varje OPS-butik, kampanjnamn prefixas
    med brandet) och Discord-kanalerna. Ge pixel-ID:t för WeTracked.
    Meta-sidan och Discord-servern är ETT mänskligt steg (checklistans avsnitt
    9): båda skapas för hand, båda färdigställs härifrån. Regel: WeTracked och
    CAPI-tokenen är alltid människans; efter importen verifieras datumen i
    kundvyn (aldrig "nyss").
12. **Slutrapport + dokumentera** (steg 20): TVÅ listor ur state — "Gjort av
    mig" / "Väntar på en människa"; ett klick står aldrig i den första. Nämn
    aldrig en person som inte finns (tom standby-lista = "ingen redigerare i
    standby än"). Varje NYTT bevisat steg in i `factory/PROCESS.md` i samma
    session. Committa och pusha.

## Bygga om en butik som redan finns

En butik som byggdes med äldre kod har inte de fixarna. Bas-temat rensades vid
källan 2026-09-09 (`factory/rensa-kalla.mjs`), så en butik byggd före det kör
fortfarande källbutikens popup, cookieruta och bilder. Konfigen finns redan —
hoppa över steg 2–4 och kör kedjan.

1. **Vad som är fel, ur butikens egen state-fil.** `factory/state/<butik>--*.json`
   bär `blockerat_av_manniska` och `ofullstandigt`, och steglistan visar vad som
   ALDRIG kördes. Regel: leta efter det som saknas i steglistan, inte efter fel
   i yaml:en. En butik som ser obrandad ut saknar oftast `logga`-steget.
2. **Människans klick först.** Valuta, hemmamarknad och språk kan inget API ändra.
   Är de fel skrivs rabattkoderna i fel valuta igen — paketsteget vägrar, och
   det är meningen.
3. **Nytt tema, alltid.** `--igen tema-upload` laddar upp det RENSADE temat som
   ett nytt utkast och låser dess id i state. Patcha aldrig det gamla: det bär
   källbutikens sektionsgrupper, och en patch lämnar det som inte skrivs över.
4. **Kör hela kedjan**, inte `--resume`: gröna steg i state är gröna enligt den
   GAMLA koden.
   `node factory/ops.mjs factory/butiker/<b>.yaml factory/produkter/<p>.yaml … `
5. **QA mot riktig HTML** med butikens storefront-lösenord i
   `SHOPIFY_STOREFRONT_PASSWORD`. Utan det är kundvyn röd, aldrig grön.
6. **Säg vad som ändrades mot förra bygget** i slutrapporten, inte bara vad som
   är klart. Den som läser vet redan hur butiken såg ut.

## DEFINITION OF DONE
- [ ] Steg 0: "Connected: <domän> ✓" före första skrivningen, butiksnamnet matchar den nya butiken
- [ ] Brand-config byggd från produkt + målgrupp, inte återanvänd; namnregeln följd, domän kollad
- [ ] Loggfeedback läst före genereringen och valet loggat efter (`factory/LOGGA-FEEDBACK.md`)
- [ ] Steg 1–4: tema uppladdat med id i state, brandat, av-brandat
- [ ] Steg 14: källskanningen REN — ingen Matstrumpor-text i något temaläge
- [ ] Steg 6–8: produkt ACTIVE, alla opf-sektioner, varje variant CONTINUE + tracked false
- [ ] Steg 9–10: paket A/B med riktiga koder i butikens valuta, nivåerna 1 / 2 / 4, mitten förvald, bonus + korg-upsell
- [ ] **Har produkten varianter: kundvyn visar 1 / 2 / 4 rullgardiner med variantbilder på produktsidan** — aldrig temats pill-väljare — innan butiken rapporteras klar
- [ ] Steg 12–13: startsida, huvudmeny, sidor, policyer, frakt ur konfigen
- [ ] Steg 16–17: marknad Norge + locale nb publicerad, allt registrerat, inga läckor på /nb
- [ ] **SPRÅKKOLLEN GRÖN** (`node factory/sprakkoll.mjs <butik-id> <handle> --losenord X`, läser de riktiga /nb-sidorna): inga svenska former och inga svenska priser på startsida, produktsida, alla sidor och alla policyer — "locale nb finns" bevisar ingenting
- [ ] Steg 18 **KUNDVYN GRÖN på riktig HTML**: brandet (inte "My Store"), loggan, egen hero, egen meny, produkt med bild och köpknapp
- [ ] Varukorgen testad av en människa med TOM korg: lådan glider in, varorna i vagnen räknade — annars "inte testad"
- [ ] Steg 19: CHECKLISTA.md skriven, värdena i chatten
- [ ] **Judge.me-filen BIFOGAD i chatten, en per produkt** — sökväg räknas inte, och app-filen (inte API-formatet) är den som bär originaldatumen
- [ ] **Discord-auktoriseringslänken i rapporten** — eller "DISCORD_BOT_TOKEN saknas", aldrig tyst
- [ ] Steg 15/store-ready: app-CSV med originaldatum ÖVERLÄMNAD SOM BILAGA; efter importen datumen verifierade i kundvyn
- [ ] Steg 20: slutrapport med två listor — delvis klart heter delvis klart
- [ ] state + PROCESS.md uppdaterade, pushat
