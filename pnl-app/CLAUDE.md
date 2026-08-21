# PNL — vinstpanel för Bäverbutikens fem butiker

Läs den här filen INNAN du rör koden. Den är skriven av en tidigare session
och innehåller allt den visste: vad appen är, hur den deployas, varje misstag
som redan gjorts (gör dem inte igen) och vad ägaren förväntar sig.

## Vad appen är

Shopify-inbäddad vinstpanel ("PNL") i stil med appen Juicy: visar försäljning,
COGS, tull, avgifter, annonskostnad (Meta) och nettovinst per dag/period, per
butik och summerat över alla butiker. Byggd i Remix + Prisma + Polaris,
`@shopify/shopify-app-remix` v5.

Ägare: Axel Odhner (axelodhner.business@gmail.com). Skriver på svenska,
röst-till-text med stavfel — tolka välvilligt. Appen är också publicerad som
App Store-appen **StonePNL** (inskickad för granskning aug 2026).

## Butikerna (fem kloner av samma dropshipbutik)

| Marknad | myshopify-domän | Valuta | Railway-tjänst |
|---|---|---|---|
| Sverige | 4snrw0-mg | SEK | beautiful-curiosity-production-134f.up.railway.app |
| Norge | 1acuam-s5 | NOK | yognftnfgn-production-17a1.up.railway.app |
| Finland | q0uthu-xq | EUR | yognftnfgn-copy-production.up.railway.app |
| UK | 1wucum-x0 | GBP | pnl-uk-production.up.railway.app |
| Danmark | v0xqtk-tx | DKK | Railway-domän OKÄND — fråga Axel |
| (App Store/StonePNL) | testbutik: stonepnl-test | USD | pnl-app-store-production.up.railway.app |

Publika kataloger nås utan auth via `https://<domän>/products.json?limit=250`
(custom-domänen beverbutikken.no ligger bakom Cloudflare-challenge — använd
myshopify-domänen). Butikerna är ihopkopplade i en grupp i appen
(ShopSettings.groupId) för den gemensamma vyn.

## Drift

- **En kodbas, sex Railway-tjänster** (en per butik + StonePNL), alla bygger
  från branchen `claude/bäverbutiken-settkopplingen-nba21z` och delar EN
  Postgres. Push till branchen ⇒ alla sex bygger om.
- **Deployverifiering är obligatorisk**: bumpa build-markören i
  `app/routes/healthz.tsx` (`"meta-v39"` när detta skrevs — räkna uppåt) vid
  varje push, vänta ~90 s, curla `/healthz` på tjänsterna och bekräfta att nya
  markören svarar. Kolla igen vid ~150 s. Railway missar ibland webhooken —
  en tom commit (`git commit --allow-empty`) triggar om.
- Miljövariabler per tjänst: DATABASE_URL, PORT, SCOPES, SHOPIFY_API_KEY,
  SHOPIFY_API_SECRET, SHOPIFY_APP_URL, TOKEN_ENCRYPTION_KEY. Hemligheter får
  ALDRIG in i repot eller chatten — bara env.
- Migrationer skrivs för hand som SQL-filer i `prisma/migrations/` (ingen
  `prisma migrate dev` — ingen skugg-databas här). De körs vid deploy.
- Sessionscontainern kan återskapas när som helst: allt arbete som inte är
  pushat försvinner. Pusha ofta. Efter omstart: `git fetch` +
  `git reset --hard origin/claude/bäverbutiken-settkopplingen-nba21z`.
- Kör git från repo-roten (`/home/user/yognftnfgn`), inte från `pnl-app/` —
  `git add pnl-app` failar annars på pathspec.
- Axels Railway-kredit var nästan slut (inget kort inlagt) — om deployer
  plötsligt inte startar, misstänk krediten före allt annat.

## Arkitektur — snabbkarta

- `app/routes/app._index.tsx` — panelen. Loader med defer; läser dagsrader,
  jämförelseperiod, gruppsumma. Har självomladdning (pollar var 6:e sekund,
  max 10 ggr) när gruppbutiker saknas.
- `app/lib/daily.server.ts` — **dagslagret, hela snabbhetsmodellen.** En rad
  per butik och dag i tabellen DailyPnl; alla datumintervall är
  databassummeringar. `refreshShopDaily` uppdaterar ANDRA butikers dagar med
  deras egna offline-tokens ur delade Session-tabellen.
- `app/lib/shopify-data.server.ts` — orderhämtning: bulk-export för långa
  fönster (>7 dagar), vanlig paginering för korta (sekunder i stället för
  halvminut). Katalog med inköpspriser, cache i minne + DB (CatalogCache).
- `app/lib/pnl.server.ts` — ren räknemotor utan I/O. TB = försäljning − COGS −
  tull − annonser. Tull per ORDER (poängen med bundles). Kostnadsändringar
  viktas per omsättningsandel efter brytdatum.
- `app/lib/meta.server.ts` — annonskostnad per dag från Meta, cache i
  DailySpend. Serverar DB direkt; hämtar i bakgrunden (10 min-färskhet).
  Dagar utan leverans får NOLLRADER (annars jagas de för evigt).
- `app/lib/group.server.ts` — gruppsumman: alla medlemmar parallellt, FX per
  butik till betraktarens valuta, korta dataluckor fylls synkront,
  långa i bakgrunden.
- `app/lib/fx.server.ts` — ECB-kurser via api.frankfurter.dev. Historiska
  dagar räknas med DEN dagens kurs (annars ändras gårdagens vinst när kronan
  rör sig).
- `app/lib/crypto.server.ts` — AES-256-GCM för tokens i vila
  (TOKEN_ENCRYPTION_KEY, prefix `enc:v1:`, klartext-fallback för äldre rader).
- `app/lib/texts.ts` — i18n en/sv. Engelska är default; svenska valbart i
  Settings. Nya texter läggs i BÅDA ordböckerna (typen tvingar samma nycklar).
- `app/routes/app.costs.tsx` + `app.costs.mall.tsx` + `app.costs.$id.tsx` —
  COGS: nedladdningsbar CSV-mall med butikens exakta titlar, dropzon-import
  (`titel;variant;kostnad`, kostnad = vara + frakt UTAN tull, i butikens
  valuta), daterade kostnadsposter per produkt.
- `app/routes/webhooks.tsx` — shop/redact raderar ALLT butiksdata i en
  transaktion (glöm inte nya tabeller här när schema växer!).
- `app/routes/healthz.tsx` — oautentiserad; build-markör + DB-koll.

## Misstagslogg — gjorda misstag, Axels klagomål, och fixarna

### Auth-sagan: StonePNL:s blanka 403 (längsta felsökningen)
Symptom: testbutiken fick 403 "GraphQL Client: Forbidden" på ALLT, medan
exakt samma kod funkade i fem butiker. Felaktiga teorier på vägen: billing
mot managed pricing (delvis sant — appar med Shopify-hanterad prissättning får
inte anropa Billing API, BILLING_ENABLED togs bort), PCD-deklaration i utkast
(FEL — utkast är ok under utveckling, Axel rättade mig), ej vald plan, död
API-version 2025-07 (pinnades till 2026-07, hjälpte inte ensamt).
**Verklig orsak:** Shopify accepterar inte längre eviga offline-tokens för NYA
appar — de fem gamla registreringarna är grandfathered. Fixen i tre lager:
1. Uppgradera shopify-app-remix 3.4→5.0 + session-storage-prisma→10 +
   Prisma→6.19 (peer-krav).
2. Session-tabellen behöver kolumnerna `refreshToken`/`refreshTokenExpires`
   (v10 skriver dem; utan = 500 exakt vid tokenlagring).
3. `future: { expiringOfflineAccessTokens: true }` i shopifyApp() — utan den
   begär biblioteket EVIGA tokens även i v5, och Shopify nekar igen.
Felsökningen löstes med en tillfällig diagnosrutt som gjorde råa API-anrop
med DB-tokenen och visade Shopifys ofiltrerade svar. Den är borttagen —
återskapa mönstret vid behov, och ta bort den efteråt.

### Konfigurationsfällor (alla har hänt på riktigt)
- SHOPIFY_APP_URL sattes till BUTIKENS domän två gånger (NO, FI). Ska vara
  Railway-domänen. Env-valideringen fångar det numera med tydligt fel.
- Scopes hamnade i "Valfria omfattningar" i dev dashboard (FI) ⇒
  ACCESS_DENIED på ordrar. De ska vara obligatoriska.
- Redirect-URL-fältet kräver EN kommaseparerad rad; flerradsklistring ger
  "Inte en giltig HTTP-URL". Ge Axel färdiga strängar utan platshållare —
  han klistrar in ordagrant (en gång åkte literala `<domänen>` in).
- Nya app-registreringar får app_url `https://example.com` som måste bytas
  via shopify.app.toml + `npx @shopify/cli app deploy` (hände två gånger).
- Compliance-webhooks (customers/data_request, customers/redact, shop/redact)
  går INTE att ställa in i nya dev dashboard — bara via toml
  (`compliance_topics`) + CLI-deploy.
- Iframe kan inte ladda ner filer från appens routes (ingen session i
  navigationen — man får inloggningssidan som fil). Mall-nedladdningen är
  därför klient-genererad Blob.

### Prestandaresan (Axels ordval: "extremt snabb som juicy", sen "svinlaggig", sen "fortfarande laggig" × 2)
Varje klagomål ledde till ett arkitekturlager — alla behövdes:
1. Orderhämtning per sidladdning ⇒ **PnlCache per intervall** + defer +
   stale-while-revalidate.
2. Intervallnycklar ("2026-07-18:2026-08-16") flyttar sig vid midnatt ⇒ ALLA
   vyer kalla varje morgon, halvminuts export per vy ⇒ **dagsrader (DailyPnl):
   en rad per butik och dag, intervall = databassummering** (Juicys modell).
   Bara aldrig hämtade dagar exporteras; korta fönster tar pagineringsvägen.
3. Gruppsumman krävde att varje butiks panel öppnats för EXAKT samma
   intervall ⇒ läser nu dagsrader, fyller luckor själv med butikernas egna
   tokens, panelen laddar om sig själv tills alla är med. Axel ska ALDRIG
   behöva "öppna butikens panel en gång".
4. Meta anropades synkront på varje sidladdning (dagens dag räknades alltid
   som gammal) och dagar utan annonsleverans fick ingen rad (jagades för
   evigt) ⇒ DB-servering + bakgrundshämtning + nollrader.
5. Övrigt: en bulk-export åt gången per butik (Shopify-begränsning) med
   minutspärr för bakgrundsjobb; tidszon cachad på ShopSettings; katalogen
   i DB-cache (överlever omstarter).
Regel framåt: **panelen får aldrig vänta synkront på ett externt API när
databasen har en användbar version.** Servera det som finns, uppdatera i
bakgrunden.

### COGS/CSV-lärdomar
- Import matchar på exakt produkttitel (case-insensitivt). Butikerna har
  ÖVERSATTA titlar (sv/no/fi/da/en) — fyll aldrig i titlar ur minnet, hämta
  dem ur butikens katalog (products.json eller appens mall).
- Titelmatchning över språk var en saga: DK gick på likhet, finskan krävde
  handmappning, UK via engelska beskrivningar. Permanent fix: mallen har
  priset som 4:e referenskolumn.
- Substring-matchning gav fel produkt ("Dobbelt Skulderrem" fick axelbältets
  pris) — förankrad startsWith-matchning numera.
- Kostnad = vara + frakt, UTAN tull (tull per order i Settings), i BUTIKENS
  valuta. Leverantörsofferter kommer i USD — räkna om med dagskurs
  (frankfurter.dev) och visa kursen i filens kommentarrad.
- Leverantörsark har fel ibland: omkastade totalkolumner (DK/UK-tofflorna),
  komponentsummor som inte matchar totalen — räkna vara+frakt själv och
  flagga avvikelser för Axel.
- UK-kontot trodde det spenderat 11 000 pund — annonskonton betalar i SEK men
  butiken säljer i GBP. Fix: spendCurrency + omräkning per dag med dagens
  kurs, spendRaw+fxRate sparas för spårbarhet.

### FX-bannern och den "försvinnande" butiken (aug 2026)
Axel: NO + FI/DK "visar inte metaspendeln och kopplas inte ihop med de andra".
Grupp och Meta var HELA TIDEN rätt konfigurerade i databasen. Tre verkliga fel:
1. **fxOk-buggen:** `getSpend` initierade `fxOk = !needsFx` och satte den bara
   på den synkrona hämtvägen ⇒ varje icke-SEK-butik (annonskontot är SEK)
   visade "Annonskostnaden kunde inte räknas om" på VARJE cachad sidladdning,
   även när allt var väl. Fix: fxOk räknas från raderna som faktiskt serveras
   (oomräknad = fxRate null OCH spend ≠ 0 — nollrader är noll i alla valutor
   och ska inte jagas). Kursfönstret breddas 7 dagar bakåt så att "idag" kan
   konverteras innan ECB publicerat (kommer ~16 CET; helger saknas).
2. **Gruppens annonskostnad:** lästes bara ur cachade DailySpend-rader ⇒
   butiker vars panel ingen öppnat halkade efter i dagar (DK stannade 17:e,
   UK 16:e) och summan blev tyst för låg. Fix: gruppen går via getSpend med
   butikens egen Meta-nyckel, som dagsraderna redan gjorde via
   refreshShopDaily. `rate()` i fx.server fick retry + nödfallscache (7 d) —
   en frankfurter-hicka uteslöt annars hela butiker ur summan.
3. **FI:s Shopify-token var död (401)** ⇒ dagsraderna stannade 19:e och
   gruppen sa "hämtas just nu" för evigt. Fix: gruppen skiljer nu "hämtning
   pågår" från "hämtningen misslyckades — öppna butikens panel". Åtgärden för
   den döda tokenen är att öppna appen i den butikens admin (OAuth ger ny).
Felsökt via tillfälliga oautentiserade `/diag-grupp` (DB-fingeravtryck per
tjänst + per butik: grupp/Meta-status, senaste spend/PnL-dag; `?probe=1`
testar sparad Shopify-token, Meta-token och FX-anropet och visar RÅA fel).
Ta bort rutten när den inte längre behövs — mönstret finns i git-historiken.

### App Store (StonePNL)
- client_id 8200cbe4502be19ac6ebe75ac65e3ad2, distribution public, managed
  pricing $9.99/30 dagar med **1 dags** gratis trial (Axel rättade: inte 7).
  Managed pricing ⇒ inga Billing API-anrop i den tjänsten.
- PCD-deklaration: reason "Analysverktyg", INGA kundfält. Utkast är ok tills
  listningen granskas.
- Inskickad för granskning 2026-08-17. Svar kommer via mejl — Axel klistrar
  in det, fixa anmärkningarna.
- "API-hälsa"-varningen i dashboard var eftersläp från de gamla eviga
  tokensen; självläker dagar efter fixen.

## Axels regler — bryt aldrig dessa

- **"Frakt-setupen rör du fan inte"** — aldrig röra fraktinställningar i
  butikerna.
- **"Bara strunta i momsen"** — moms är utanför appens ansvar.
- Engelska är appens default; svenska ett val. Befintliga butiker kör
  svenska.
- Norge och UK: ingen EU-tull (tariffPerOrder 0 i deras Settings).
- Hemligheter (API-nycklar, tokens) aldrig i repo/chat. En Shopify
  automation-token användes en gång för CLI-deploy och beordrades raderas
  direkt efteråt — samma mönster vid behov.
- Ingen modell-ID i commits, PR:er eller kod.
- Skapa inte PR utan att Axel ber om det. Pusha bara till branchen ovan.

## Så kommunicerar du med Axel

- Ett enkelt steg i taget: "öppna X, klicka Y, skicka en skärmbild". Han har
  uttryckligen bett om det ("beskriv det extremt enkelt") och blir frustrerad
  av långa instruktioner och många parallella spår.
- Han verifierar med skärmbilder — be om dem, läs dem noga.
- Gör allt som går att göra åt honom automatiskt; be honom bara om det som
  kräver hans inloggningar (Railway-variabler, dev dashboard, appgodkännanden).
- Rapportera vad som är KLART och verifierat, inte vad som "borde" funka.

## Kvarvarande backlog (när detta skrevs)

- Bundle-/antalstrappa för COGS: leverantörsofferterna har 1/2/3-set-priser;
  appen använder bara 1-set. Axel vill ha Juicy-liknande bundle-COGS.
  Kaching-bundles nämnt som förebild.
- Plyschtofflorna finns inte i FI- och DK-butiken — COGS-rader väntar där.
- Marina motorhöljet: offert bara för största storleken (250–350 hk, svart) —
  alla 30 varianter har värsta-falls-kostnad; verklig marginal något bättre.
- "Inside comfy slippers": ingen offert (MOQ 3000) — ingen COGS.
- Danmarks Railway-domän okänd — hälsokontrollen kan inte verifiera DK.
- Exakta betalväxel-avgifter (feeRate är schablon).
- Grillkliniken: Axel vill klona hela upplägget till en annan butik.
- App Store-granskningssvaret: åtgärda när mejlet kommer.
