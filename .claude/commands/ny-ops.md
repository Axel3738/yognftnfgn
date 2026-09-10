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

Kommandot körs EFTER att VA:n gjort checklistans steg 1–2 (butik på free
trial, appen kopplad via `SHOPIFY_SHOP` + `SHOPIFY_CLIENT_ID` +
`SHOPIFY_CLIENT_SECRET` + `SHOPIFY_STOREFRONT_PASSWORD` i miljön). Det bygger
sen FÄRDIGT hela butiken utan att vänta — bara hennes klick återstår.

Den som kör är oftast **VA:n (engelsktalande)** — svara henne på engelska,
korta rader. Axel svaras på svenska. Språket följer LÄSAREN. Facit: `factory/PROCESS.md`
(rutinen, reglerna) och `factory/KEDJAN.md` (koden). VA:ns klick:
`factory/VA-CHECKLIST.md`, ifylld till `factory/output/<butik>/CHECKLISTA.md`.

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
   butiken, stoppa. Saknas nycklarna: be VA:n göra steg 2, klistra aldrig
   nycklar i chatten.

   ⚠️ **Står en butiksadress i prompten är DEN facit** — inte butiks-id:t.
   Skicka den som `--doman <adressen>` (eller `onskadDoman` till `anslut`).
   Koden letar då upp vilket miljösuffix som bär adressen och använder det,
   så VA:n aldrig behöver veta vad fabriken kallar butiken. Skriv in adressen
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
   chatten, Axel väljer. VA:n: skriv STORE NAME + DOMAIN direkt i chatten
   (hon fortsätter med steg 4–5 medan bygget går).
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
6. **Översättningen** (steg 17): en subagent med `model: "sonnet"` översätter
   `output/<butik>/oversattning-sv.json` → `oversattning-nb.json` med samma
   nycklar (+ `docs/copy-regler.md`). Sen `--igen oversatt`. Regel: koden
   översätter aldrig själv; läckor i rapporten = steget förblir 🖐.
7. **VA:ns valuta- och språkklick** (checklistans steg 5): när hon skriver
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
9. **Checklistan** (steg 19): `output/<butik>/CHECKLISTA.md` skrivs av
   motorn (EN fil per butik) — arkivkopia. Värdena till VA:n skrivs rakt i
   chatten: STORE NAME, DOMAIN, STORE EMAIL (hello@domänen) + "continue at
   step 4". Skicka aldrig filen till Axel. Ändrades mallen
   (`VA-CHECKLIST.md`/`checklista.mjs`): för in det i VA:ns Google-dokument.
10. **Launch:** `node factory/ops.mjs … --launch` — produkterna ACTIVE +
    publicerade, vägrar om butiken eller NÅGON produkt är röd. Motorn skriver
    ut temanamnet (`<Brand> – CRO v1`); VA:n publicerar det (checklistans
    steg 10). Regel: fabriken rör aldrig annonskontot vid launch.
11. **"Store ready: <namn>"** från VA:n → `node factory/store-ready.mjs
    <butik-id> [--guild <discord-server-id>]`: recensionerna (API om butikens
    Judge.me-token finns i env, annars laddar hon upp
    `output/<produkt>/judgeme-app-import.csv` i appen — originaldatumen följer
    bara med appens import), pixeln i **MagiBorsten DK `915422744950975`**
    (samma konto för varje OPS-butik, kampanjnamn prefixas med brandet) och
    Discord-kanalerna. Ge henne pixel-ID:t för WeTracked. Regel: WeTracked,
    CAPI-tokenen och Meta-sidan är alltid hennes; efter importen verifieras
    datumen i kundvyn (aldrig "nyss").
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
2. **VA:ns klick först.** Valuta, hemmamarknad och språk kan inget API ändra.
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
- [ ] Steg 1–4: tema uppladdat med id i state, brandat, av-brandat
- [ ] Steg 14: källskanningen REN — ingen Matstrumpor-text i något temaläge
- [ ] Steg 6–8: produkt ACTIVE, alla opf-sektioner, varje variant CONTINUE + tracked false
- [ ] Steg 9–10: paket A/B med riktiga koder i butikens valuta, mitten förvald, bonus + korg-upsell
- [ ] Steg 12–13: startsida, huvudmeny, sidor, policyer, frakt ur konfigen
- [ ] Steg 16–17: marknad Norge + locale nb publicerad, allt registrerat, inga läckor på /nb
- [ ] Steg 18 **KUNDVYN GRÖN på riktig HTML**: brandet (inte "My Store"), loggan, egen hero, egen meny, produkt med bild och köpknapp
- [ ] Varukorgen testad av en människa med TOM korg: lådan glider in, varorna i vagnen räknade — annars "inte testad"
- [ ] Steg 19: CHECKLISTA.md skriven, värdena till VA:n i chatten
- [ ] Steg 15/store-ready: app-CSV med originaldatum överlämnad; efter importen datumen verifierade i kundvyn
- [ ] Steg 20: slutrapport med två listor — delvis klart heter delvis klart
- [ ] state + PROCESS.md uppdaterade, pushat
