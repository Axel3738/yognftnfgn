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
  `app/routes/healthz.tsx` (`"ltv-v67"` när detta skrevs — räkna uppåt) vid
  varje push, vänta ~90 s, curla `/healthz` på tjänsterna och bekräfta att nya
  markören svarar. Kolla igen vid ~150 s. Railway missar ibland webhooken —
  en tom commit (`git commit --allow-empty`) triggar om.
- Miljövariabler per tjänst: DATABASE_URL, PORT, SCOPES, SHOPIFY_API_KEY,
  SHOPIFY_API_SECRET, SHOPIFY_APP_URL, TOKEN_ENCRYPTION_KEY. Valfria för
  Logga in med Facebook: META_APP_ID + META_APP_SECRET (båda eller ingen —
  env-valideringen vägrar starta med bara den ena), META_LOGIN_CONFIG_ID.
  Bara App Store-tjänsten: PLAN_GATE=1 (Pro-grinden för LTV), APP_HANDLE,
  valfri PRO_PLAN_NAMES.
  Hemligheter får ALDRIG in i repot eller chatten — bara env.
- **Sessionsmiljön når inte alltid Railway eller Meta.** Mätt 2026-09-07: proxyn
  svarade 403 på både `*.up.railway.app` och `graph.facebook.com` — deploy-
  verifieringen ovan gick inte att göra härifrån, och inget Meta-anrop gick att
  prova skarpt. Säg det då rakt ut i stället för att skriva "verifierat".
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
- `app/lib/meta-login.server.ts` + `app/routes/meta.start.tsx` +
  `meta.callback.tsx` — **Logga in med Facebook** (OAuth i eget fönster,
  engångsrad `MetaLoginState` + cookie, long-lived token, kontolista via
  `/me/adaccounts`). Hela flödet står i `docs/meta-token.md`.
  `meta-login-sida.server.ts` är fönstrets HTML (resursrutter, ingen Polaris).
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

### Gruppsumman visade gamla säljsiffror mot färska kostnader (aug 2026)
Axel läste av dagens vinst i gemensamma vyn, såg för lite plus och var nära
att fatta ett felbeslut på siffran. Orsak: **asymmetrisk färskhet.**
Annonskostnaden hämtades synkront medan säljraderna bara uppdaterades i
BAKGRUNDEN — färska fulla kostnader mot timgamla ofullständiga intäkter, och
det nya syntes först vid en omladdning ingen visste behövdes. Regeln
"panelen får aldrig vänta synkront på ett externt API" gäller fortfarande för
den EGNA butiken, men i gruppsumman måste båda sidor av kalkylen komma från
samma tidpunkt: hellre två sekunder än ett tal som ljuger. Nu hämtas
medlemmarnas tre senaste dagar synkront (pagineringsvägen, alla parallellt)
och spend via getSpend med `syncFresh`.
En adversariell granskning (3 linser × verifierare) hittade 17 verkliga fel i
den första fixen. De som satt kvar och nu är åtgärdade:
- **Tyst för HÖG vinst:** gruppen hårdkodade `spendReliable: true` och
  ignorerade getSpends `error`/`currencyMismatch` ⇒ saknade spend-dagar
  räknades som noll annonskostnad. Butiken utesluts och namnges nu.
- **Minutspärren inverterade:** när `farUppdateraMeta` sa nej föll koden ner i
  den SYNKRONA grenen — spärren gjorde anropet blockerande i stället för att
  hoppa över det. Nej betyder nu "servera cachen".
- **Ingen backoff:** en död nyckel (401) gav ett nytt dömt API-anrop på varje
  laddning, och `force` kringgick spärren. 5 min paus per butik, som force
  inte får förbi (`senasteFel`/`senasteMetaFel`).
- **Inga timeouts:** allt på gruppens awaitade väg (Shopify, Meta, ECB) saknade
  gräns ⇒ ett hängt svar = panel som aldrig laddar. AbortSignal.timeout 8–20 s.
- **En butiks undantag dödade hela summan** (Promise.all) ⇒ allSettled.
- **Självomladdningen dog efter 6 s:** `refreshing` betydde "jag startade en",
  inte "en pågår" ⇒ bulk-exporten på 30 s hann aldrig synas. In-flight-set i
  daily.server (`bakgrundPagar`/`markeraPagaende`).
- **Lång lucka + död nyckel** sa "hämtas just nu" i evighet ⇒ nyckeln sonderas
  synkront med luckans sista dagar innan resten lovas bort till bakgrunden.
- **UTC vs butikstid** i gruppens färskhetsgrind ⇒ `dayInTz(m.timezone)`.
- **FX:** provisorisk kurs (hämtad före ECB:s publicering ~16 CET) hämtas om en
  gång dagen efter; nödfallscachen fick 5 min felpaus så ett avbrott inte ger
  två timeout-försök per butik och laddning.
Diagnosrutten `/diag-grupp` är BORTTAGEN (oautentiserad, kunde trigga externa
API-anrop) — återskapa mönstret ur git-historiken vid behov och ta bort igen.

### Nycklarna som gick ut i tysthet — Norge och Finland visade 0 kr (aug 2026)
Symptom: gemensamma vyn visade 0 kr försäljning för NO och FI bredvid full
annonskostnad, alltså ren förlust, medan butikerna sålde som vanligt. Axel var
nära att fatta beslut på siffran. TVÅ fel i lager:
1. **Nollor skrevs som sanning.** `runOrdersPaginated` hade `if (!conn) break`
   — ett GraphQL-fel gav tom lista, noll ordrar skrevs som dagsrader, och
   `refreshShopDaily` rapporterade SUCCÉ. En butik som inte fick fråga såg
   exakt ut som en butik utan försäljning. Bulk-vägen kastade redan fel; det
   var bara den paginerade (dagens siffror, gruppens uppdatering) som teg.
   Regel: **en misslyckad datahämtning får aldrig skriva ett värde.**
2. **Offline-nycklarna gick ut.** Med `expiringOfflineAccessTokens` är
   nycklarna färskvara (~1 dygn), men biblioteket förnyar dem BARA i
   `authenticate.admin` — när någon öppnar just den butikens panel.
   Gruppsummeringen läser nycklarna direkt ur Session-tabellen och kringgår
   den vägen, så butiker ingen besökt dog tyst. NO gick ut 05:16, FI 04:27.
   SE/UK/DK har eviga grandfathered-nycklar (`expires` null) och märkte inget.
**Nyckelinsikt om topologin:** varje butik har sin EGEN app-registrering, så
en nyckel kan bara förnyas med den registreringens client_id/secret. Sveriges
tjänst får `invalid_request: This request requires an active refresh_token` på
Norges nyckel — bara Norges egen tjänst kan förnya den. Verifierat i skarpt
läge: samma anrop misslyckades från SE och lyckades från NO.
Fixen: `giltigToken()` i daily.server förnyar före användning och efter 401,
och `token-keeper.server.ts` (startad i entry.server, alltså i ALLA sex
tjänsterna) förnyar var 15:e minut de nycklar som går ut inom 3 timmar. Varje
tjänst lagar sin egen butik; delad databas gör resultatet synligt för alla.
Butiker vars nyckel inte går att förnya utesluts och namnges i gruppsumman i
stället för att räknas som noll.
Om det händer igen: öppna appen i den butikens Shopify-admin en gång — det ger
en ny nyckel via OAuth, och vakten håller den vid liv därefter.

### App Store (StonePNL)
- client_id 8200cbe4502be19ac6ebe75ac65e3ad2, distribution public, managed
  pricing $9.99/30 dagar med **1 dags** gratis trial (Axel rättade: inte 7).
  Managed pricing ⇒ inga Billing API-anrop i den tjänsten.
- PCD-deklaration: reason "Analysverktyg", INGA kundfält. Utkast är ok tills
  listningen granskas.
- Inskickad 2026-08-17, anmärkning 4.5.5 (Meta-koppling) löst med
  skärminspelning, **GODKÄND OCH LIVE 2026-09-05.** Nästa steg enligt Axels
  beslut: Facebook-inloggningen för Meta-kopplingen (se backlog).
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

## Så kommunicerar du med Axel — OBLIGATORISKT SVARSFORMAT

Axel har grov dyslexi. Långa svar gör att han inte kan jobba.
Varje svar till honom följer detta, utan undantag:

1. Första raden: "Du ska göra N saker." eller "Du behöver inte göra något."
2. Numrera varje sak med fet rubrik på max 4 ord.
3. Under rubriken: en mening per rad, max 10 ord, ett klick per mening.
4. Avdelare mellan sakerna. Max 3 saker per svar.
5. Sista raden: "Sen är du klar. Jag har gjort resten."
6. Skriv ALDRIG: vad du gjorde, varför, teknik, filnamn, historik,
   villkorssatser ("om X, gör Y" — välj åt honom), varningar, "men"/"dock".
7. Fel: en mening om felet, en om vad han gör. Inget mer.
8. Fråga: bara en åt gången, med 2–3 svarsalternativ.
9. Fetstil bara på knappnamn han ska leta efter. Hela svaret ska
   rymmas på en mobilskärm. Alltid svenska.

## (äldre anteckningar om kommunikation)

- Ett enkelt steg i taget: "öppna X, klicka Y, skicka en skärmbild". Han har
  uttryckligen bett om det ("beskriv det extremt enkelt") och blir frustrerad
  av långa instruktioner och många parallella spår.
- Han verifierar med skärmbilder — be om dem, läs dem noga.
- Gör allt som går att göra åt honom automatiskt; be honom bara om det som
  kräver hans inloggningar (Railway-variabler, dev dashboard, appgodkännanden).
- Rapportera vad som är KLART och verifierat, inte vad som "borde" funka.

## Kvarvarande backlog

**Välkomstguide (onboarding) — Axels beslut 2026-09-08: VÄNTA, bygg inte
utan att han säger till.** Underlag: Juicys onboarding (7 skärmbilder Axel
skickade 2026-09-08): fem steg med progressbar, "kvitto"-panel till vänster
som fylls i efter hand, ordrar importeras i bakgrunden under tiden, konfetti
vid 100 %. Stegen: (1) "Vad för dig hit?" (följ vinsten / attribution /
annonskostnader / LTV / produktanalys), (2) "Var hörde du om oss?" + värvnings-
kod, (3) annonsplattformar + attribution ja/senare, (4) Anslut Meta (läs-
behörighet, hoppa över möjligt), (5) lagermodell (dropshipping / eget lager /
3PL / print on demand). Vår skiss när det blir aktuellt: 4 steg — mål,
varifrån (ger egen CAC), koppla Meta (finns redan), kostnader (Juicy-
skärmbild / offert / snabbfält / uppskattning) — och starta `refreshDaily` i
bakgrunden vid första inloggningen. Ny handlare landar i dag på en tom panel.

**Axels riktning 2026-09-07 (ordagrant i andemening): "det enda jag vill greja
på i det här kontot är appen StonePNL" — inte Bäverbutikens OS.** Hans lista,
i hans ordning:

1. **Facebook-inloggning** — BYGGD 2026-09-07 (build meta-login-v64), inte
   verifierad skarpt. Se avsnittet "Logga in med Facebook" nedan för vad som
   återstår hos Axel (Meta-appen + Railway-variabler) och vad som är oprövat.
2. **Växelkursen — KLART 2026-09-07 (build fx-per-dag-v66), oprövat skarpt.**
   Axels ord: "dubbelkolla automatisk live växelkurs och gör så att den
   uppdateras dagligen så man ser sina faktiska marginaler i alla marknader."
   Granskningen bekräftade felet: annonskostnaden räknades redan per DAG
   (`meta.server.ts`, `fetchRates`), men **gruppsumman använde EN kurs —
   dagens — för hela perioden**, så en 30-dagarsvy flyttade sig varje gång
   kronan rörde sig. Nu: `dailyRates()` i `fx.server.ts` (intervall från
   Frankfurter, cache per valutapar, 1 h omkoll när dagens kurs saknas,
   nödfall 7 dagar) + `convertTotalsPerDay()` i `group.server.ts` —
   försäljning, ordrar/tull och annonskostnad exakt per dag, avgifter följer
   försäljningen, fasta med medelkurs, **COGS med försäljningsvägd kurs**
   (motorn får produktmixen aggregerad; felet är promille). Stängda dagar
   ändras aldrig; i dag/helg får senast publicerade kurs. Kursdatumet visas
   under grupptabellen (`fxNote`). 20 tester med mockad fetch. Kvar: byt
   `meta.server.ts` `fetchRates` mot `dailyRates` (samma format, egen cache).
   Oprövat: Frankfurter nåddes inte från sessionen (proxy 403) — om
   intervall-svaret glesas ut över 90 dagar tar `rateOn` ändå närmaste
   tidigare kurs.
3. **Juicy → StonePNL COGS-flytt:** "alla som använder Juicy sedan tidigare
   ska på max 3 knapptryck få in sina nuvarande COGS i vår app utan manuella
   grejer." **Scenario A BYGGT 2026-09-08 (ltv-v67):** kortet "Kommer du från
   Juicy?" överst på Kostnader (≥ 90 % täckning ⇒ "Dina inköpspriser är redan
   här" + **Ser rätt ut**; annars pekar det på dropzonen). Scenario B (Juicys
   egen exportfil som indata) väntar fortfarande: **be Axel om en riktig
   Juicy-export** innan något byggs; gissa inte kolumnerna
   (`docs/juicy-import.md`).
4. **Betalt tillägg, +5 USD/mån: LTV-prognos** — **BYGGT 2026-09-08 (build
   ltv-v67), oprövat skarpt.** Se avsnittet "LTV-tillägget" nedan. Axels
   svar på designfrågorna: Pro-plan $14.99 (managed pricing kan inte sälja
   "+5"), insamling för alla butiker, täckningsbidrag vid 90 dagar.
- **App Store-granskning 4.5.5:** granskaren kunde inte testa Meta-kopplingen
  utan konto. Lösning: skärminspelning som visar koppling → import → att
  siffran matchar Meta Ads Manager. Länken klistras i "Proof of resolution".
 (när detta skrevs)

- Flerpacks-COGS (Juicy-stil) finns sedan v59 och är INLAGT i alla fem
  butiker 2026-09-05 ur alla offerter (se avsnittet nedan). 26 produkter har
  bara svensk offert — NO/FI/DK/UK saknar stegpris för dem
  (`scratch/saknas-offert.json`); be leverantören om landskolumnerna.
- Plyschtofflorna finns inte i FI- och DK-butiken — COGS-rader väntar där.
- Marina motorhöljet: offert bara för största storleken (250–350 hk, svart) —
  alla 30 varianter har värsta-falls-kostnad; verklig marginal något bättre.
- "Inside comfy slippers": ingen offert (MOQ 3000) — ingen COGS.
- Danmarks Railway-domän okänd — hälsokontrollen kan inte verifiera DK.
- Exakta betalväxel-avgifter (feeRate är schablon).
- Grillkliniken: Axel vill klona hela upplägget till en annan butik.
- App Store-granskningssvaret: åtgärda när mejlet kommer.

### AI-rutan ger VAL, inte frågor (2026-09-18, build valj-prisspalt-v96)

Axel: rutan *"funkade aaaaasbra när jag la in UK-costs"*, men på den
amerikanska prislistan *"bara varnar den och håller på och bökar"*. Den
skärmbilden (Taköverdrag, leverantörskalkyl) har en antalskolumn (1/2/3 per
storlek), en storlekskolumn och **tre namnlösa prisspalter**. AI:n gjorde
precis som den var tillsagd — ställde en öppen fråga — och det är en
återvändsgränd för någon som inte är utvecklare.

**Regeln nu: en öppen fråga utan knappar är ett misslyckande.** Går källan
att läsa på flera sätt lämnar `tolkaInmatningMedAi` i stället `choices`:
2–4 KOMPLETTA alternativ, ett per prisspalt, där vart och ett bär hela sin
uppsättning rader. Actionen skriver då ingenting utan returnerar dem med en
sifferförhandsvisning ur källans egna tal; UI:t visar ett kort per
alternativ med en knapp. Klicket postar `smart-apply` med just det
alternativets rader.

**Skrivningen är utbruten till `skrivInmatningsrader()`** (modulnivå i
`app.costs.tsx`) och delas av båda vägarna — annars hade "direkt" och "efter
val" kunnat bete sig olika. Den cachar kursen per valuta, läser den GAMLA
kostnaden före skrivningen (katalogen för standard, `lasMarknadskostnad` per
marknad) och kvittot visar därför `210,45 → 140,00`. Samma fetcher används
för båda intents, så alternativkorten byts mot kvittot av sig själva.

**Grinden står på `choices`, aldrig på `rows`.** Prompten säger "fyll aldrig
både `rows` och `choices`", men schemat har båda som obligatoriska listor och
en modell kan fylla dem ändå. Villkorade grinden på att `rows` var tom
skrevs en godtyckligt vald prisspalt tyst medan alternativen kastades. Nu
gäller: finns det alternativ visas alternativ — modellens egen läsning blir
då ett alternativ till (etiketten `smart.modelPick`), aldrig en skrivning.
Rubriken faller tillbaka på `smart.pickQuestion`, för UI:t ritar bara
knapparnas banner när `question` har text.

Tre saker till som annars ljuger för handlaren: det som inte gick att koppla
(`unmatched`) postas med i `smart-apply` och läggs först i `skipped` — annars
försvann varningen i samma sekund som kvittot ersatte alternativen, och en
överhoppad storlek behöll tyst sin gamla kostnad. Rader där Shopify nekade
`setUnitCost` på samtliga varianter hamnar bland de överhoppade i stället för
på kvittot. Och `var X → nu Y` visas bara när alla träffade varianter stod på
samma gamla kostnad.
Skärmbilden töms bara när något faktiskt skrevs — annars hade den försvunnit
medan man fortfarande valde.

### Räkna först, fråga sen: summaspalten (2026-09-18, build summaspalt-v97)

Alternativkorten löste återvändsgränden men skapade en ny: Axel fick tre
kort — *"det var jävligt svårt att förstå vilken vikt jag ska välja i såna
fall"* — och kunde omöjligt veta vilken namnlös prisspalt som var hans
inköpspris. **Ett val handlaren inte kan göra är lika illa som en fråga han
inte kan svara på.**

Talen avslöjade sig själva. I hans amerikanska prislista gällde
`spalt1 + spalt2 = spalt3` i **alla nio cellerna, exakt** — alltså vara,
frakt och totalen. `app/lib/prisspalter.ts` (`hittaSummaspalt`, 11 tester)
räknar efter det innan alternativen visas: hittas en spalt som är de andra
ihopräknade skrivs den rakt in, utan fråga, med en mening på kvittot om vad
som hände (`smart.sumUsed`, med källans egna tal som kvitto). Hittas ingen
sådan relation ligger alternativen kvar.

Kraven som gör att den inte gissar: minst tre spalter (med två går det inte
att peka ut summan), identisk raduppsättning och identiska packstorlekar i
alla spalter, varje delbelopp > 0, minst två olika rader och tre celler
kontrollerade, och exakt en spalt som passar. Marginalen är
`max(0,03, 0,05 %)` — den finns för avrundning i källan, inte för gissningar.

⚠️ **`A + B = C` bevisar ingenting i sig.** En tabell med spalterna 1 st |
2 st | 3 st uppfyller `k + 2k = 3k` i varje cell — skrivs då "summan" som
styckpris blir kostnaden tre gånger för hög. Därför avvisas spalter vars
delar är **proportionella mot varandra** (samma kvot på varje rad). En äkta
uppdelning i vara och frakt varierar: i Axels lista 1,83 / 1,65 / 1,62.
Testet `antalskolumner (1 st / 2 st / 3 st) får ALDRIG tolkas som en summa`
finns för att den fällan aldrig ska byggas tillbaka.

Och en spärr till: en prislista med **kostnad | påslag | utpris** uppfyller
också identiteten. Därför skrivs inget tyst om summan når variantens
försäljningspris i Shopify (`rimligaKostnader` i `app.costs.tsx`, kursen
omräknad först) — då ligger korten kvar. Kvittots mening säger bara det som
faktiskt bevisades: en spalt var de andra ihopräknade. **Skriv aldrig
"frakten är inräknad"** — spalterna var namnlösa, delen kan lika gärna vara
tull eller påslag.

Modellen ska därför lämna **ett alternativ per spalt även när den tror sig
veta** (regel 6b i prompten). Räknar den ihop spalterna själv får
`hittaSummaspalt` bara ett alternativ att titta på, och hela kontrollen
uteblir tyst.

**Förhandsvisningen klipptes till tre rader.** Ett alternativ med nio
storlekar såg därför ut som om sex tappats bort, samtidigt som knappen sa
"9 kostnader" — Axel: *"Jag tror inte den fångade alla olika varianter."*
Taket ligger nu på tolv rader (`…och N till`): hela storlekslistan syns, och
knappen under kortet ryms fortfarande på en mobilskärm. Klipp aldrig en
lista som samtidigt räknas upp i en knapptext.

**Två promptregler till, ur just den här tabellen:**
- *Antalskolumn:* en smal kolumn med 1, 2, 3 som upprepas per storlek är
  ANTAL. Rad 1 ger `unit_cost`, rad 2 och 3 blir `tiers` på SAMMA produktrad
  — aldrig tre separata rader.
- *Nästan-matchande varianter:* matchar alla källrader utom en, och exakt en
  butiksvariant blir över, paras de två ihop (källans `5*3m` mot butikens
  `5,5 × 3 m`) och det skrivs i `notes`. Bara när det är exakt en kvar på
  varje sida.

⚠ `variantTraffar` matchar fortfarande EXAKT (normaliserat) — närmatchningen
görs av modellen, som måste svara med butikens stavning. Svarar den med
källans stavning hoppas raden över och hamnar i "gick inte att koppla".

### En ruta för allt på Kostnader (2026-09-18, build en-ruta-v94)

Axel, argt och rätt: *"det fortsätter att se ut som ett jetflygplan när man
ska lägga in koden … jag vill bara att en tioåring ska kunna göra det … det
bästa hade nästan varit en liten AI-chattruta: klistra in screenshoten,
beskriv produkt och marknad, tryck enter, så lägger den in."*

**Byggt exakt så.** Kostnader-sidan har nu EN ruta överst, "Lägg in
kostnader": DropZone (valfri) + ett textfält + Enter. `tolkaInmatningMedAi`
(`lib/ai-kostnad.server.ts`) får katalogen, marknaderna (kod = namn),
butikens valuta och handlarens kostnadsvaluta, och svarar med färdiga rader
{product, variant, market, unit_cost, currency, tiers}. Actionen `smart`
matchar titlarna (`normTitel`/`variantTraffar`, nu exporterade ur
`cost-import.server.ts`), räknar om valutan med `fx.rate()` och SKRIVER
direkt: marknad → `skrivMarknadskostnad`; standard → `setUnitCost` +
standardsteg. Kvittot listar varje rad ("✓ Motorhölje — Norge — 140 SEK
(12,9 USD) · 2 st …") med "Ta bort kostnad" som ångrar raden. Är produkten
oklar skriver AI:n inget och `question` visas som banner.
**Allt annat** (marknadsväljaren, Juicy-kortet, AI-läs-gamla-appen,
offertkortet, uppskattningen, snabbfältet, filimporten) ligger under
"Fler sätt att lägga in kostnader", stängt som standard (öppet när
`ANTHROPIC_API_KEY` saknas — då finns ingen ruta). Tabellen längst ner är
kvar. Chattens `HJALP` har rutan som punkt 0.

⚠ AI:n skriver utan bekräftelse — det var asken. Kvittots "Ta bort" är
ångra-knappen. Oprövat i drift: kontrollera att `/healthz` svarar
`en-ruta-v94` och prova rutan med en mening på en testprodukt.

### Valuta på kostnader, break-even på flerpacksmixen, avgifter per marknad (2026-09-18, build valuta-breakeven-v92)

Axels ask, i två röstmeddelanden: *"automatisk valutaväxling"*, *"automatisk
break even roas uträknare utefter vad för bundles som säljs"* — den ändras
varje dag efter vilka paket kunderna väljer — och *"dubbelkolla så att alla
avgifter är inräknade … valutaväxlingsavgifterna … blir ganska dyra genom
Shopify Payments"* på butiker som säljer till USA, Kanada, NZ, UK, Australien.

**Valuta på kostnadsfälten.** Rullistan "Kostnaderna är i" i snabbfältet
(och en Select i produktsidans formulär). Valet sparas i
`ShopSettings.costCurrency`; fälten VISAR sparade kostnader omräknade till
invalutan (kronor ÷ kurs) och räknar om till butikens valuta med `fx.rate()`
(ECB) när det sparas. **Ingen kurs → ingen skrivning** (502) — ett
dollarbelopp sparat som kronor är tiofalt fel. Offertkortet hade redan sin
egen omräkning och rörs inte.

**Break-even ROAS på den faktiska mixen.** `lib/breakeven.server.ts`
(6 tester): `radUtfall(qty)` = omsättning, kostnad via `tierCost`, TB efter
tull (EN gång per order) och avgift; `mixBreakEven()` viktar raderna efter
`ProductRow.lines` (orderrader per antal) från `readDaily` de senaste 90
dagarna. Utan försäljning: styckantagande, `antagen = true`, märkt i UI:t.
Kostnader-tabellen visar mix-BE med mixen som undertext; produktsidan har
kortet "Break-even ROAS per packstorlek" (en rad per storlek + mixraden).
Under ett marknadsfilter på Kostnader räknas mixen på det landets ordrar och
med det landets avgift. Klientsäker text i `breakeven-text.ts` — modulen
heter `.server` för att den drar in `pnl.server`; **importera aldrig
`breakeven.server` från en komponent** (bygget stoppar: "Server-only module
referenced by client" — hände 2026-09-18).

**Avgifter per marknad.** `ShopSettings.marketFees` =
`{ "US": { feeRate, fxFeeRate } }` (andelar). Inställningar → "Kostnader per
order" → "Avgifter per marknad": kortavgift % och valutaväxling % per känd
marknad; tomt = standardavgiften, ingen växling. `readDaily` returnerar
`salesByMarket` (omsättning per land ur uppdelningen; dagar utan uppdelning
under `""`), och `compute()` räknar `fees = Σ omsättning_m × feeRateFor(m)`
+ resten på standard. Break-even och max-CPA använder den blandade satsen
(`effFeeRate`). Gruppsumman går samma väg. Migration
`20260918090000_valuta_och_avgifter`.

**Faktiska avgifter ur ordrarna (v93, samma dag).** Axel: *"jag vet ju inte
avgifterna … på vissa är det fett mycket, och sen tar de en avgift med
banken"*. Orderfrågorna (paginering + bulk) läser nu
`transactions(first: 20) { status kind fees { amount { amount } type rateName } }`
och summerar avgifterna på lyckade transaktioner per order →
`SalesDay.fees`, `DailyPnl.fees` (null = okänt), `MarknadsDel.fees`.
`compute()` räknar dagar med känd avgift rakt av och bara resten med satsen
(`Totals.feesKnownDays`, `Totals.effFeeRate`). Panelen skriver raden
"Betalavgifter X (Y %) — faktiska belopp …". `uppmattaAvgifter(shop)` ger
den faktiska satsen per marknad (90 dagar); Kostnader-sidans TB/BE använder
den när underlag finns, och Inställningar visar den bredvid fälten — de
manuella satserna är nu bara reserv. Migration
`20260918120000_faktiska_avgifter`.
⚠ Nekar Shopify `fees` (fältet kräver read_orders; är det mer får vi se)
faller hämtningen tillbaka utan avgifter (`arAvgiftNekad`) och loggar
"Transaktionsavgifterna nekades" — läs loggen efter deploy. Äldre dagsrader
har `fees = null` tills de exporteras om (bara färska dagar hämtas om av
sig själva; 90-dagarsvyn blir helt faktisk först när raderna skrivits om).

⚠ **Oprövat i drift**, som allt i marknadsbygget. Kontrollera efter deploy
att `/healthz` svarar `faktiska-avgifter-v93`, att panelen visar raden
"Betalavgifter … faktiska" för dagens datum, och att Kostnader-tabellens
BE ROAS-kolumn visar en mixrad under talet för en produkt med ordrar.

### Marknader — kostnad, annonser och vinst per land (2026-09-17, build marknader-v88)

Axels ask, i röstmeddelandeform: samma Shopify-butik säljer till Sverige,
Norge och USA med *"väldigt varierande cogs"*; han vill sätta kostnad per
marknad, se hur varje marknad gått, filtrera vinsthjulet på land, och märka
i Inställningar vilka kampanjer (i vilka annonskonton) som hör till vilken
marknad. *"Fixa allt det där."* Allt nedan är byggt; inget är prövat i drift.

**Vad en marknad ÄR:** ISO-landskoden i orderns leveransadress
(`shippingAddress.countryCodeV2`, reserv `billingAddress`). **Inte Shopify
Markets** — att läsa dem kräver scopen `read_markets`, och en ny scope
tvingar varje installerad butik genom en omauktorisering (se varningen i
`shopify.app.toml`). Landet följer med `read_orders`. Hjälparna bor i
`lib/marknad.ts` (klientsäker): `marknadskod`, `marknadsnamn`
(Intl.DisplayNames), `sorteraMarknader`, `hemlandAv`.

⚠ **Osäkert tills det mätts:** om Shopify räknar `countryCodeV2` som ett
skyddat kundfält nekas HELA orderfrågan för butiker utan rätt PCD-nivå.
Därför har `doFetchOrderData` en reserv: nekas adressfältet (`arAdressNekad`)
hämtas ordrarna om utan land, `marketsByDay` blir null och ingen uppdelning
skrivs. Panelen fungerar då som förut, marknadsvyn säger "X dagar gick inte
att dela per marknad" (`daysWithoutMarkets`). **Läs loggarna efter deploy:**
raden "Leveransadressen nekades för …" betyder att reserven slog till.

**Datamodellen — allt har default `""` = standard/alla, så befintliga
butiker ser exakt samma siffror tills de själva lägger in något:**
- `DailyPnl.markets Json?` — samma dag uppdelad per land:
  `{ "SE": {orders, …, products:[…]}, "NO": {…} }`. Totalraden är facit;
  det här är bara en uppdelning. Null = skriven före v88.
- `CostChange.market`, `CostTier.market` (unik nyckel nu med `market`).
- `DailySpend.market` (unik nyckel `(shop, day, account, market)`).
- `MetaAdAccount.campaignMarkets Json?` — `{ "<kampanj-id>": "NO" }`.
- Migration `20260917150000_marknader`.

**Räknevägen:**
- `readDaily(shop, from, to, { market, perMarknad })`. Med `market`: bara
  den marknadens del; dagar utan uppdelning räknas som **ohämtade** och
  exporteras om (en gång — sedan bär de uppdelningen för alltid). Spärr: en
  rad hämtad för < 1 h sedan som ändå saknar uppdelning markeras INTE
  saknad, annars hade en butik med nekat adressfält exporterat om 90 dagar
  på varje sidladdning. Med `perMarknad` (utan filter): produktmixen delas
  per marknad så motorn kan räkna rätt kostnad per rad; panelen och
  gruppsumman sätter den, chatten får den gamla listan.
- `pnl.server`: `ProductRow.market`; `resolveChange` föredrar radens
  marknad **oavsett datum**, sedan standard; `tiersFor` tar marknadens steg
  om några finns, annars standardens — **aldrig blandat**.
  `slaIhopMarknader` slår ihop resultatraderna per variant för tabellen
  (COGS summeras, kostnad/styck räknas om). 9 tester i `test/marknad.test.mjs`.
- `meta.server`: minst en märkt kampanj ⇒ kampanjnivå mot Meta och en
  DailySpend-rad per (dag, marknad); omärkta kampanjer på `""`. Dagens
  rader skrivs om i sin helhet (radera + createMany i en transaktion) så en
  kampanj som flyttats till en annan marknad inte räknas två gånger.
  `getSpend(…, { market })` filtrerar på raderna.
- Panelen: `?market=NO`. Under filter måste minst en kampanj vara märkt
  landet, annars är annonskostnaden noll utan att något är fel —
  `spendReliable` sätts false och bannern
  `dashboard.market.noCampaigns` visas. Gruppsumman döljs under filter.

**UI:t:** Kostnader har kortet "Marknad" överst (väljare + fält för ny
landskod); allt som sparas med en marknad vald går till CostChange/CostTier
med `market`, **aldrig till Shopify** (`lib/marknadskostnad.server.ts`).
Ärvda kostnader märks `*`. Produktsidan har "Marknad" i formuläret för ny
post och för flerpacksteg, plus en marknadskolumn i tabellerna.
Inställningar → kontot → "Välj kampanjer" har en Select "Marknad" per
kampanj (visas även i läget "alla kampanjer") och ett fält för att lägga
till en landskod som inte sålt än.

⚠ **Kundvärdet (LTV) och chatten räknar bara på standardkostnaden** —
`costTier.findMany({ where: { shop, market: "" } })`. Ett norskt
tvåpackspris i den listan hade prissatt svenska ordrar.

⚠ **CSV-mallen exporterar fortfarande standardkostnaden** även när en
marknad är vald på sidan; importen skriver däremot till vald marknad. Att
exportera marknadens kostnader i mallen är kvar att göra.

### Flera annonskonton per butik (2026-09-17, build flera-annonskonton-v87)

Axels ask, med skärmbild av Inställningar: *"Jag vill kunna göra så att man
kan koppla mer än ett ad account … för jag kör ads från flera olika ad
accounts till samma butik."* Det är normalläget för en dropshippare som
testar mycket: ett konto blir avstängt, ett nytt öppnas, ett tredje delas
med en partner. Före det här bygget räknades bara ETT konto — resten av
annonskostnaden saknades, och vinsten såg för hög ut.

**Datamodellen:** ny tabell `MetaAdAccount` (`shop` + `accountId` som
primärnyckel) med namn, valuta och **kampanjfilter per konto**. Filtret
MÅSTE ligga per konto: kampanj-ID:n är kontospecifika, så ett delat filter
hade betytt "inga kampanjer alls" i alla konton utom ett.
`DailySpend` fick kolumnen `account`, och unikheten flyttades från
`(shop, day)` till `(shop, day, account)`.

⚠ **Utan kontot i unikheten skriver konto B över konto A:s dag** och halva
annonskostnaden försvinner utan att något ser trasigt ut. Det är hela
poängen med migrationen `20260917090000_flera_annonskonton` — den droppar
det gamla indexet FÖRST och skapar det nya sedan.

**Token ligger kvar på `ShopSettings`.** En Facebook-inloggning ger EN
nyckel som når alla konton personen har tillgång till; kontona är bara en
lista över vilka av dem som ska räknas för butiken.

⚠ **`ShopSettings.metaAdAccountId`, `spendCurrency`, `campaignMode` och
`campaignIds` är LEGACY.** De skrivs som en spegel av det första kontot
(`speglaForstaKontot`) för att `/meta/callback`-spärren jämför mot dem.
**Läs aldrig annonskostnad ur dem** — en butik med tre konton har tre rader
i `MetaAdAccount`, och spegeln ser ut som om den hade ett.

**Räknevägen:** `getSpend(shop, konton[], …)` går igenom ett konto i taget,
med egen cache, egen valutaomräkning och eget filter, och summerar sedan per
dag (`lib/spend-summa.ts`, 6 tester). Ett konto som krånglar stoppar inte de
andra — men dagen det saknas på **döljs helt**: att servera de övriga
kontonas kostnad som om den vore hela dagens är en för låg annonskostnad,
och därmed en för hög vinst.

**UI:t:** Inställningar visar ett kort per kopplat konto (namn, valuta,
kampanjfilter, "Ta bort") och en plain-knapp **"+ Lägg till ett annonskonto
till"** som fäller ut väljaren med de konton som inte redan är kopplade.
Konto läggs till i samma sekund det väljs — ingen Spara-knapp längst ner.

⚠ **Oprövat i drift.** Typecheck, `npm run build` och 24 tester är gröna,
men migrationen har inte körts mot en riktig databas i den här sessionen
(ingen Postgres gick att starta i containern) och ingen butik har kopplat
två konton skarpt. Kontrollera efter deploy att `/healthz` svarar
`flera-annonskonton-v87` och att en butiks annonskostnad är oförändrad
innan ett andra konto läggs till.

⚠ **Under själva deployen** kan de sex tjänsterna ligga på var sin sida av
migrationen i ett par minuter. En gammal instans som skriver `DailySpend`
efter att det gamla unika indexet droppats får ett fel på sin
annonshämtning tills den rullat över. Inget data går förlorat — dagen
hämtas om vid nästa laddning.

### LTV-tillägget (2026-09-08, build ltv-v67) — kundvärde, Pro-plan, tips

Byggt efter `docs/ltv-tillagg.md` (designen) på Axels uppdrag samma dag
("glöm inte forecasta LTV, recurring customer rate, tips man kan testa för
att öka sin LTV, tips på metrics som lackar"). Allt nedan är **oprövat
skarpt** — proxyn nådde varken Shopify, Meta eller Railway från sessionen.

**Datalagret**
- `KundOrder` (shop, orderId, kundHash, dag, netto, tb): en rad per order.
  `kundHash` = HMAC-SHA256(sha256(TOKEN_ENCRYPTION_KEY + ":kundhash:v1"),
  shop + ":" + kund-GID) i `crypto.server.ts` — aldrig vändbar, butiken i
  meddelandet, **nyckeln får aldrig roteras**. Null = gästorder eller nyckel
  saknas. Klartext-ID lagras eller loggas aldrig.
- `customer { id }` läggs i orderfrågorna (paginerad + bulk) **bara när
  butikens offline-session har `read_customers`** (`harKundScope` läser
  `Session.scope`). Utan scopen är frågan identisk med förut — en
  ACCESS_DENIED på kundfältet hade annars dödat panelen för alla butiker.
- `refreshDaily` skriver KundOrder-raderna EFTER dagsraderna ur samma
  hämtning (`kundorder.server.ts`: `tillKundOrderRader`/`skrivKundOrdrar`,
  idempotent upsert i batcher om 200). tb per order = netto − COGS (flerpack
  via `tierCost`) − tull per order − avgift × totalpris; **null om någon rad
  saknar inköpspris**.
- Bakfyllnad (`kundorder-backfill.server.ts`): startas av LTV-sidan när
  historiken är tunn, i bakgrunden, fönster om 30 dagar bakåt (400 dagar),
  via `giltigToken` + `adminFromToken` + `refreshDaily`. Stannar efter två
  tomma fönster i rad (utan `read_all_orders` svarar Shopify tomt bortom 60
  dagar). Status på `ShopSettings.kundOrderBackfillAt/-Error`; felet
  `scope:read_customers` betyder att behörigheten saknas.
- Webhooks: `customers/redact` raderar per hash + `orders_to_redact`
  (numeriska id ⇒ `gid://shopify/Order/<id>`), `customers/data_request`
  loggas hashat, `shop/redact` tar `kundOrder`. `/privacy` omskriven (kund-ID
  som pseudonym; datum 2026-09-08). Scopes i `shopify.app.toml` och
  env-hinten: `read_customers` (och `read_all_orders` först när Shopify
  godkänt ansökan — se "Gjort via Cowork" nedan).

**Räknemotorn** `ltv.server.ts` (ren, 11 tester i `test/ltv.test.mjs`,
`npm test`, Node ≥ 22.6): kohort = första köpmånad; horisonter 30/60/90/180;
per kohort N, AOV1, TB1, R(h) med **Wilson 95 %**, n(h), AOVr(h), LTV(h) och
LTVtb(h). Mogen kohort = kohortmånadens sista dag + h ≤ i dag. Pool per h ur
mogna kohorter med N ≥ 50, viktad med N; **ok först vid ≥ 2 kohorter, ≥ 300
kunder, ≥ 30 återköpsordrar** (`ltv-konstanter.ts`). Prognos för omogna
kohorter = eget AOV1 + poolens återköpsdel, märkt `est`. maxCPA(h) =
LTVtb(h) − målmarginal × LTV(h), med spann; konfidens good/low/hidden
(≤ 40 % / ≤ 80 % / mer). Gästordrar räknas i `guestShare`, aldrig i kohorter.

**Grinden** `plan.server.ts`: **inga Billing API-anrop.** Rå
`currentAppInstallation { activeSubscriptions { name status } }`, "pro" om en
ACTIVE-prenumeration heter något med "pro" (eller står i `PRO_PLAN_NAMES`).
Cache `ShopSettings.plan/planCheckedAt`, omkoll högst var 10:e minut,
tvingad bara via **Jag har uppgraderat — läs om** (`?refresh=1`). Grinden är
**AV tills `PLAN_GATE=1`** sätts på en tjänst — sätt den BARA på App
Store-tjänsten. Utan den är alla butiker "pro" (egna butiker ska aldrig se en
betalvägg). Uppgraderingsknappen öppnar
`admin.shopify.com/store/<butik>/charges/<APP_HANDLE|stonepnl>/pricing_plans`
i toppfönstret. ⚠ Oprövat: vad StonePNL:s registrering faktiskt svarar i
`activeSubscriptions` under App Pricing — råsvaret loggas
("Planavläsning för …"). Svarar den tomt trots aktiv plan är Partner API
nästa väg (designdokumentet avsnitt 1).

**Sidan** `app.ltv.tsx` (nav "Kundvärde (LTV)"): datakvalitetsrad, tre tal
med spann (LTV(h), max-CPA(h) mot första-orderns max-CPA, CPA per ny kund
senaste 30 dagarna = Σ DailySpend.spend / kunder med första order i
fönstret), verdikt-banner, tipskort, kurva 30/60/90/180 (omsättning + TB,
inline-HTML, ikon+text — aldrig färg ensam), mognadsmätare per horisont,
kohorttabell (kursivt + "prognos"/"est." för lånade värden, "N för litet"
under 50), horisontval sparas i `ShopSettings.ltvHorizon`. Standard-planen
ser mognadsmätaren + återköpsgraden + upgradeknapp; plan "okand" (API-fel)
visar låst vy med orsaken. Alla texter i BÅDA ordböckerna (`ltv.*`, `tips.*`,
`juicy.*`, `nav.ltv`).

**Tips när en metrik lackar** `tips.server.ts`: 20 regler ur
`docs/ltv-tips-research.md` (benchmarks med källa per regel; hitta aldrig på
trösklar). Regel utan underlag hoppas över; max ett tips per metrik, max tre
totalt, critical > warning > info > good. Visas på LTV-sidan (återköp, LTV,
CPA, AOV) och i panelen (bruttomarginal, MER, fasta kostnaders andel,
återbetalningsandel). Källan står under varje tips.

**Vanliga månadskostnader** (`kostnadsforslag.ts`, sidan Fasta kostnader):
förslagslista per kategori (Shopify-plan, AI, verktyg, marknadsföring, appar,
hosting, ekonomi, personal) som förifyller formuläret; USD/EUR räknas om med
dagskursen (`fx.rate`), butikens Shopify-plan markeras "din plan"
(`shop { plan { displayName } }`), rader som redan finns får ✓, och bannern
"Har du glömt …?" listar tomma kategorier. Belopp märkta `*` är listpriser ur
minnet per 2026-09-08 — proxyn nådde inte prissidorna; källbelagda poster
står i `docs/kostnadsforslag.json`. Axels ord: "en grej som ger förslag på
vanliga månadskostnader man har såsom Claude-planer, ChatGPT, Shopify-
prenumeration, anställda snitt varje månad."

Företagsadmin (vänrabatt, SNI, byrån): `docs/foretag-admin.md`. Färdiga
Cowork-prompter för Axels klick (planer, scopes, Railway, SNI, granskning +
stresstest): `docs/cowork-prompts.md`. Juicy-övergången utan att bli
avstängd: `docs/tillvaxt-juicy.md`.

**Kostnader utan fil (build cogs-quick-v69)** — Axel testade sidan som
handlare: "Bruh det här är ju piss jobbigt. Det ska ske automatiskt." Nu:
(1) **Uppskattad COGS** — ett klick väljer 25/35/50 % av priset
(`ShopSettings.cogsEstimatePct`); varianter utan inköpspris får det värdet i
panelen, alltid märkt "uppskattad" (banner + KPI-undertext), aldrig i
gruppsumman (`group.server.ts` rör inte uppskattningen — en lucka att täppa
om den behövs). (2) **Snabbfältet**: en rad per produkt, skriv kostnaden,
Enter/blur skriver till Shopify (`intent=set-cost`, alla varianter i
produkten; "Sätt per variant" fäller ut ett fält per variant). Ingen
CostChange-historik från snabbfältet — den finns på produktsidan. (3) Mallen
och filimporten ligger hopfällda under "Importera från fil (avancerat)".
Det som fortfarande saknas för "automatiskt" byggdes i nästa steg (nedan).

**AI läser av Juicy (build ai-cogs-v70)** — Axels ord: "vadå, vi kan inte ha
en AI som bara läser av Juicy-appen?" Kortet **Låt AI läsa av din gamla app**
på Kostnader: handlaren släpper skärmbilder av Juicys kostnadstabell (och/
eller klistrar in text), klickar en knapp, och `ai-kostnad.server.ts` skickar
bilderna + butikens EXAKTA produkt- och varianttitlar till Claude
(`@anthropic-ai/sdk`, `messages.parse` med zod-schema). Modellen får bara
mappa mot titlarna i listan; osäkra rader hamnar i `unmatched` och visas
under kortet i stället för att gissas. Svaret blir CSV i vårt format
(`tillCsv`) och går genom **samma `importCostCsv`** som filimporten — samma
matchning, flerpack (tiers), CostChange-historik och "hoppades över". Annan
valuta räknas inte om utan rapporteras i `notes`.
- **Kräver `ANTHROPIC_API_KEY`** på tjänsten; saknas den finns kortet inte
  (`aiKostnadEnabled` i loadern). Ingen annan konfiguration.
- Bilderna base64-kodas i webbläsaren (FileReader) och skickas i actionen
  `intent=ai-import` — de sparas aldrig, varken på disk eller i databasen.
- Max 16 000 utdata-tokens; en tabell med några hundra rader ryms. Fel från
  modellen (avböjd bild, otolkbart svar) visas som text i kortet.
- ⚠ Oprövat skarpt (ingen nyckel i sessionen, proxyn nådde inte API:t):
  typecheck/build/test gröna. Första riktiga körningen: kontrollera att
  produkttitlarna matchar (stavning identisk) och att "hoppades över"-listan
  är tom eller begriplig.
- 2026-09-08 kväll: Axel lade `ANTHROPIC_API_KEY` på **App Store-tjänsten**
  (bara den). Kortet finns alltså för externa handlare + stonepnl-test, inte
  på de fem egna butikernas tjänster (de har redan COGS sedan 2026-09-05).
  Flerpack följer med: AI:n skriver `tiers` → CSV `a|b|c` → `CostTier`.

**Kampanjfilter för annonskostnaden (build kampanjfilter-v78)** — Axels ord
2026-09-10: "man ska kunna välja om man vill ignorera vissa kampanjers spend i
ett ad account, eller exkludera vissa. Först flippar man en switch: vill du
exkludera eller inkludera?" Bakgrunden är OPS-butikerna: alla ligger i ETT
annonskonto (MagiBorsten DK), så varje butiks panel räknade in de andras
annonskostnad.
- **Datamodellen:** `ShopSettings.campaignMode` ("all" | "include" |
  "exclude", NOT NULL DEFAULT 'all') + `campaignIds` (kommaseparerade
  kampanj-ID:n, null = inget filter). Ingen ny tabell — därför inget nytt att
  komma ihåg i `shop/redact`. Migration `20260910120000_kampanjfilter`.
  **Standard är oförändrat beteende:** ingen befintlig butik ser sin
  annonskostnad ändras av deployen.
- **Hämtningen** (`meta.server.ts`): utan filter är anropet exakt som förut
  (`level=account`, en rad per dag). Med filter blir det `level=campaign` +
  Metas `filtering`-parameter (`campaign.id` IN/NOT_IN) och `refreshSpend`
  summerar per dag. Svaret kontrolleras ändå **rad för rad** mot samma
  ID-lista: en rad utan `campaign_id` kastar ett fel i stället för att tyst
  skriva hela kontots kostnad som butikens. Kampanjnivå ger dagar × kampanjer
  rader, så spannet delas i månadsbitar och varje bit paginerar (40 sidor ×
  500). **Nås sidtaket kastas ett fel** i stället för att returnera halva
  svaret — en tyst trunkering hade skrivit för låg annonskostnad och för hög
  vinst utan att någon såg det. Token går numera i Authorization-headern,
  inte i adressen. Kampanjer som sparats i filtret men försvunnit ur listan
  (arkiverade) visas ändå med sitt ID, annars går valet inte att ångra.
- **Filtret följer med i ALLA tre anropsställen** — panelen, jämförelse-
  perioden och gruppsumman (`...kampanjFilter(settings)`). Missar man ett
  skriver två vägar olika värden i samma `DailySpend`-rad, och siffran hoppar
  beroende på vilken sida som laddades sist.
- **Cachen:** `DailySpend` har ingen kampanjdimension, så raderna är räknade
  på det filter som gällde när de skrevs. Därför raderas butikens rader när
  filtret ändras (samma regel som vid kontobyte) och hämtas om per fönster.
  `app.ltv.tsx` och `app.chat.tsx` läser `DailySpend` direkt förbi `getSpend`
  — de blir automatiskt rätt, men visar tunn spend tills panelen öppnats en
  gång efter en filterändring.
- **Kontobyte och bortkoppling nollställer filtret** (`META_TOMT`, intent
  `meta-account`, Spara): ID:n från ett annat konto matchar ingenting och
  hade tystat hela annonskostnaden.
- **UI:t** ligger i Meta-kortet i Inställningar: en sammanfattningsrad,
  "Välj kampanjer" som fäller ut en `ChoiceList` (alla / bara valda / alla
  utom valda) och kryssrutor per kampanj med spend senaste 30 dagarna.
  Listan hämtas **på klick** (`intent=meta-campaigns`), inte i loadern — två
  Graph-anrop ska inte ligga på varje sidladdning för alla som aldrig rör
  filtret. Spenden skrivs ut med **annonskontots** valuta, aldrig butikens.
  "Bara valda" utan kryss sparas som "all" (en tyst nolla vore värsta
  lögnen), och knappen är låst med "Välj minst en kampanj".
- ⚠ Oprövat skarpt (proxyn når inte Meta härifrån): typecheck, build och de
  11 testerna gröna. Första skarpa körningen: kryssa ett filter i
  stonepnl-test, ladda om panelen och jämför annonskostnaden mot Ads Manager
  med samma kampanjurval.

**Butikernas riktiga namn i gruppsumman (build butiksnamn-v82)** — Axels ord
2026-09-10 om tabellen med tio rader: "det här blir extremt rörigt, kan vi
köra butikens faktiska namn i stället för myshopify-länken?"
- `ShopSettings.shopName` cachar `shop { name }`. Hämtas av
  `fyllButiksnamn()` i `daily.server.ts` med butikens EGEN sparade nyckel —
  ett litet anrop per butik, en enda gång, och namnet ändras i praktiken
  aldrig. Misslyckas det visas handtaget som förut: namnet är kosmetik och
  får aldrig stoppa en summa.
- Fylls i två lägen: gruppsumman (`group.server.ts`, före summeringen) och
  Butiker-sidan. Gruppsummans rader, "inte med i summan"-listan och
  noteringarna bär `name`.
- **Kloner heter ofta samma sak på fem marknader.** Ett namn som förekommer
  mer än en gång i gruppen får handtaget efter sig ("Bäverbutiken (4snrw0-mg)")
  — annars byttes ett oläsligt handtag mot två identiska rader.
- Migration `20260910180000_butiksnamn`.

**Chattbubblan "Fråga StonePNL" (build chat-v73)** — Axels ord: "en AI-
chattbubbla som svarar på simpla frågor, med vår API. Typ 'hur importerar
jag COGS om jag har 20+ produkter' → 'du har förmodligen ett sheet, skicka
ditt + vår mall till Claude och be den fylla i, importera sen'." Knapp `?`
nere till höger på alla sidor (`app/components/ChatBubble.tsx`, renderas i
`app.tsx` när `aiChattEnabled`). Server: resursrutten `app/routes/app.chat.tsx`
(POST, `intent=ask|apply`) + `app/lib/ai-chat.server.ts`.
- **Kunskapen är skriven, inte gissad:** `HJALP` i `ai-chat.server.ts` beskriver
  varje sida, alla fem sätten att fylla i COGS, flerpack, planer, integritet.
  **Ändras UI:t: uppdatera HJALP i samma commit** — annars svarar bubblan
  om knappar som inte finns.
- Kontext per fråga (`byggKontext`): senaste 30 dagarna ur `DailyPnl`
  (nettoförsäljning, ordrar, COGS via `rowCost` + CostTier — null om någon
  rad saknar kostnad), `DailySpend`, fasta kostnader, täckning, uppskattning,
  antal flerpacksteg, plan, och hela katalogen med pris + kostnad. Inga nya
  Shopify-anrop utöver katalogcachen.
- **Modellen ändrar aldrig något.** Ber handlaren om en kostnadsändring
  returnerar den `actions: [{type:"set_cost", product, variant, cost, tiers,
  label}]` som visas som knapp; klicket kör `intent=apply` →
  `actionTillCsv` → **samma `importCostCsv`** som filen (matchning, flerpack).
  Tvetydig produkt ⇒ modellen ska fråga, inte gissa.
- Modell för chatten är den snabbare Sonnet-klassen (många små anrop);
  bildläsningen kör den större. Historik max 20 meddelanden, bor i
  webbläsaren, sparas aldrig på servern. Svar på butikens språk, ingen
  markdown. ⚠ Oprövat skarpt (ingen nyckel i sessionen) — typecheck/build
  gröna.

**Offert från leverantören (build quote-v71)** — Axels ord: "droppa en bild
på en quote man fått från sin leverantör, klicka vilken produkt den hör
till, så läggs COGS:en in." Kortet **Släpp en offert från leverantören**
(samma `aiEnabled`-villkor). Två steg, med flit: (1) `intent=quote-read` →
`lasOffertMedAi` plockar ut raderna (namn, styckpris, flerpack, valuta, MOQ,
ev. förslag på produkt/variant ur butikens lista) — **inget skrivs**; actionen
räknar om till butikens valuta med `fx.rate()` (ECB i dag) och skickar kursen
med. (2) Handlaren väljer produkt (förvalt om AI:n var säker) och ev. variant
i `OffertRad`, kan ändra beloppet, och klickar **Lägg in** →
`intent=quote-apply`: `setUnitCost` per inventoryItem + `CostTier` ersätts
för varianterna om offerten hade packpriser. Utan kurs (Frankfurter nere,
okänd valuta) visas en röd rad och fältet fylls för hand. Offerter mappas
aldrig automatiskt — leverantörens namn ("Item 3 – engine cover 200D")
liknar inte butikens titlar, och ett fel här är ett fel i varje vinstsiffra.

**Offertens valuta och synliga packpriser (build offert-valuta-v79)** — Axel
2026-09-10: "av någon anledning tror den alltid att priset är i SEK, men
offerter från leverantörerna kommer oftast i USD" + "vi behöver se tydligare
hur kostnader för bundles fungerar, att den faktiskt vet att 1 st kostar 10
och 2 st kostar 15 — inte 20".
- **Valutan gissas aldrig till butikens.** Förut föll `quote-read` tillbaka på
  `settings.currency` när AI:n inte såg någon valuta — en dollaroffert lästes
  som kronor och varje inköpspris blev tiofalt fel. Nu räknar servern INTE om
  något: den returnerar råpriserna i offertens valuta plus en **kurstabell**
  (USD, CNY, EUR, GBP, den upptäckta valutan, butikens) mot butikens valuta.
  Kortet har en **rullista "Valuta i offerten"**, förvald till den AI:n såg
  och annars **USD** — aldrig SEK. Omräkningen sker i klienten, så ett
  valutabyte räknar om alla rader direkt utan en ny (betald) AI-läsning.
  Hjälptexten säger antingen "Offerten visar USD" eller "Ingen valuta syntes".
- **Packpriser bär sitt antal.** AI:n returnerar `{units, total}`-par i
  stället för en positionslista. En offert staffar ofta 1/50/100, och den
  gamla listan hade lagt 50-packets pris på `units: 2`. `quote-apply` tar
  emot `"antal:totalpris"` och skriver `CostTier` med det angivna antalet.
  ⚠ CSV-importen (`a|b|c`) är fortfarande positionell 2, 3, 4 — det formatet
  är dokumenterat utåt och rörs inte.
- **Flerpacket syns nu i listan**: både offertraderna och snabbfältet på
  Kostnader skriver ut "1 st 10,00 USD · 2 st 15,00 USD totalt (7,50/st)",
  med en rad som förklarar att packpriset är TOTALT för antalet i samma
  orderrad. Skiljer sig stegen mellan varianterna hänvisas till produktsidan
  i stället för att visa ett tal som bara gäller en variant.
- **Granskningen (build offert-valuta-v81) rättade fem saker till:** en
  valutasymbol ("$", "¥", "RMB") tvättades bort till tom sträng och kortet
  påstod att ingen valuta syntes — nu översätts symbolen till en kod; en ny
  avläsning återanvände förra offertens rader (belopp och produktval låg
  kvar) — svaret bär nu ett `readId` som monterar om raderna; "Lägg in"
  låste sig för alltid efter första klicket även om valutan ändrats — den
  jämför nu mot vad som faktiskt sparades; en rad med packpriser som inte
  gick att räkna om (ingen kurs) kunde sparas ändå och lämnade gamla
  CostTier-rader kvar bredvid ett nytt styckpris — knappen låses nu med
  skälet utskrivet; och ett svar utan valutalista eller antal (halv deploy)
  kunde rendera ordet "undefined" för handlaren.
- **Andra granskningsronden (build offert-granskad-v83)** — fyra fel till,
  alla bekräftade av tre oberoende granskare:
  1. **CSV-mallen tappade antalet.** Kostnadscellen exporterade bara
     totalpriserna, och importen läste dem positionellt som 2, 3, 4 st. Ett
     50-pack som gick ut och in genom mallen blev ett tvåpack — en order med
     2 st fick 50-packets kostnad. Mallen skriver nu `88.34|2:134.22|50:2900`
     och `parseLine` tolkar `antal:total` (positionellt kvar som fallback
     för äldre filer). Mall-texten (tpl6) uppdaterad i båda ordböckerna.
  2. **En valuta för hela offerten.** `detected` togs från första raden som
     hade en, och radens egen valuta kastades. Två skärmbilder i samma
     läsning (varan i USD, frakten i CNY) räknade rad fyra med rad ettas
     kurs. Nu bär varje rad sin egen valuta, kortets rullista är bara
     fallback, och en avvikande rad märks ut.
  3. **Två steg med samma antal.** `CostTier` har unique(shop, variant,
     units); dubbletter från AI:n sprack `createMany` EFTER att `deleteMany`
     tömt variantens steg. Nu dedupliceras antalen och radera+skriv ligger i
     samma transaktion, med felet fångat.
  4. **Oläsbar valutaangivelse påstods vara ingen.** Kunde `tolkaValuta` inte
     tolka strängen sa kortet "ingen valuta syntes". Råsträngen följer nu med
     och texten blir "Offerten visar '元' — välj valuta".

**Hero-kortet i panelen (build hero-v68)** — Axels ord: "dashboarden borde se
lite mer levande ut, man vill ha en dopaminkick." Överst i panelen: den stora
nettovinsten räknas upp (`AnimatedNumber`, respekterar
prefers-reduced-motion), ring mot vinstmålet (`ShopSettings.monthlyGoal`, per
30 dagar, skalas till periodens längd, sätts i kortet med intent `set-goal`),
svit av dagar på plus (`vinstPerDag`, samma fördelning som staplarna), bästa
dag, och konfetti EN gång per dag och butik (sessionStorage) när målet nås
eller periodens sista dag är bäst. Sanningen först: saknas annonskostnad är
kortet gult med "Annonskostnad saknas" och ingen konfetti. KPI-talen får en
kort pop-animation (`.pnl-pop`).

**Läst i Partner Dashboard 2026-09-08 (via Cowork, skarpt):** den publika
planen heter **basic** ($10/månad, 1 dags trial — inte "Standard $9.99"),
privata planer: **shopify-test** ($0) och **friends-50** ("Friends 50%",
$4.99/månad, 0 dagars trial, 1 butik: stonepnl-test.myshopify.com, "Free for
partners and developers" på). Privata planer KRÄVER minst en butik under
*Stores with plan access*; fakturanamn och handle kan inte ändras efteråt.
Vägen: Distribution → Redigera (English) → Pricing details → Manage.

**Gjort via Cowork senare samma dag (2026-09-08, skarpt):**
- **basic**: prov 1 → **14 dagar**. **friends-50**: prov 0 → **14 dagar** (Cowork, senare samma kväll). **Pro** skapad: handle `pro`, 14,99 USD/
  månad, 14 dagars prov, "Free for partners and developers" på, display name
  "Pro" + fyra feature-rader (fältet tar max 40 tecken). Grinden matchar
  namnet ("pro" som eget ord).
- Dev Dashboard har **ingen Configuration-sida** längre — scopes släpps som
  en ny **version**. **stonepnl-4** är aktiv med `read_customers` tillagd.
  `read_all_orders` nekades ("ogiltig omfattning") tills ansökan godkänts —
  därför står den INTE i `shopify.app.toml`/env-hinten just nu. Raden i toml
  måste alltid vara identisk med aktiva versionen (annars omauktoriserings-
  loop). ⚠ `npx shopify app deploy` skriver över versionen med toml-raden.
- Protected customer data nivå 1 var **redan godkänd 2026-09-05** (inga
  customer fields, reason Analytics) och rördes inte. **Read all orders**
  ansökt 2026-09-08, upp till 7 arbetsdagar, besked via mejl → då: ny version
  med scopen + `SCOPES` på Railway + toml/env-hint (prompt 4b i
  `docs/cowork-prompts.md`).

**Axel måste göra (i ordning):**
1. Railway → alla sex tjänster → `SCOPES` =
   `read_products,read_orders,read_inventory,read_reports,write_inventory,read_customers`
   (UTAN read_all_orders tills godkänt) och `ANTHROPIC_API_KEY` (AI-läsaren
   på Kostnader). Prompt 4 i `docs/cowork-prompts.md`.
2. Railway → **bara App Store-tjänsten** (pnl-app-store-production):
   `PLAN_GATE=1` och `APP_HANDLE=<handle ur listningen>`.
3. Öppna appen i varje egen butik en gång (godkänn scopes) och gå till
   **Kundvärde (LTV)** — bakfyllnaden startar då. Kolla loggraden
   "Planavläsning för …" på App Store-tjänsten första gången en betalande
   butik öppnar sidan, och skriv in utfallet här.
4. När Shopify mejlar att Read all orders är godkänt: prompt 4b.

### Basic sänkt till 5 USD/mån (2026-09-10)
Axels beslut. Priset lever i Dev Dashboard (managed pricing) — koden sätter
det inte. Klickprompten ligger i `docs/cowork-prompts.md` avsnitt 7; utfallet
(gick priset att ändra i befintlig plan, eller skapades en ny? vad hände med
befintliga prenumeranter?) ska skrivas in här när Cowork kört.
Koden uppdaterad samma dag på de ställen som VISAR priset för handlaren:
`ai-chat.server.ts` (chattens PLANER-rad), `kostnadsforslag.ts`
(förslaget "StonePNL Basic" i fasta kostnader, 9.99 → 5, namnet rättat från
"Standard" till dashboardens "Basic"), `shopify.server.ts` (billing-blocket
5 USD / 14 dagars prov — dött under managed pricing, lever bara om någon
sätter BILLING_ENABLED=1 på en custom-distribution). Docs: `app-store.md`,
`foretag-admin.md`, `tillvaxt-juicy.md`, `testprotokoll-van.md`.
Privatplanen `friends-50` låg på 4,99 USD och blev meningslös när publika
priset blev 5 — **sänks till 2,49 USD** (halva priset, som plannamnet
"Friends 50%" redan lovar). Axel skickar butiksadresserna (`x.myshopify.com`)
för de vänner som ska få planen; de skrivs in under *Stores with plan access*
i Dev Dashboard — en privat plan kräver minst en butik där.
⚠ Plannamnen i `texts.ts` säger fortfarande "Standard" i LTV-kortet medan
dashboarden säger "Basic" — rätta när planstrukturen är låst.

### De egna butikerna låstes ute av read_customers (2026-09-08, build scope-fix-v76)
Axel: "appen funkar bara inte efter cowork gjorde massa skit". Orsak: SCOPES
med `read_customers` sattes på ALLA sex Railway-tjänsterna (steg 1 i listan
ovan). Scopen kräver godkänd Protected Customer Data, som bara StonePNL:s
registrering har. De fem egna butikerna har varsin egen registrering: Shopify
gav dem nya nycklar UTAN scopen (SE/NO/FI fick dessutom utgående nycklar i
stället för sina eviga), biblioteket såg fortfarande skillnad mot
konfigurationen och skickade butiken till ny auktorisering vid varje
sidladdning. Fix i `shopify.server.ts`: `scopesForService()` tar bort
`read_customers`/`read_all_orders` för alla registreringar utom StonePNL
(client_id-jämförelse). SCOPES-variabeln får därmed vara likadan överallt.
Konsekvens: kundvärdet (LTV) finns bara i App Store-appen — de egna
butikerna saknar scopen tills deras registreringar får PCD-godkännande.
Regel: **scopes som kräver godkännande läggs aldrig på de egna butikernas
tjänster.** Diagnostiserat med tillfällig `/debug-scope` (env-scopes mot
Session.scope per butik), borttagen i v76.

### Meta-kopplingen för ALLA handlare (2026-09-12, build meta-granskning-v85)
Axels mål 2026-09-12: "Juicy har en jättebra Facebook-koppling där man bara
loggar in. Sluta inte jobba förrän vi har en likadan." **Koden var redan
byggd** (meta-login-v64 nedan) — det som saknades är att Meta-appen inte får
låta utomstående logga in förrän den är godkänd. Det som byggts nu är exakt
det Meta kräver av OSS innan ansökan kan skickas:
- **`/meta/deletion`** — Data Deletion Request Callback. Obligatorisk för
  Live-läge. Tar `signed_request`, kopplar bort butikerna som hör till
  Facebook-användaren, raderar nyckeln OCH annonskostnaden som hämtats med
  den, svarar `{url, confirmation_code}`. GET på samma adress är statussidan
  Meta visar. Kvittot (`MetaDeletion`) sparar bara en **hash** av användar-
  id:t — det ska bevisa raderingen, inte återinföra den.
- **`/meta/deauth`** — Deauthorize Callback. Personen tog bort appen på
  Facebook: kopplingen rensas så panelen inte visar en kopplad butik som
  tyst slutat få annonskostnad. Annonsdatan rörs inte (det är "sluta dela",
  inte "radera").
- **Signaturen är hela skyddet** på båda (`meta-signed.server.ts`,
  7 tester): HMAC-SHA256 över nyttolasten SOM TEXT, timing-säker jämförelse,
  fel algoritm och trasiga format avvisas. Rutterna är oautentiserade med
  flit — Facebook ringer dem.
- **`/meta/granska`** — testsidan för Metas granskare. `ads_read` fungerar
  bara för roll-innehavare tills appen godkänts, och godkännandet kräver att
  en granskare kan köra flödet. En granskare har ingen Shopify-butik, så
  sidan kör samma OAuth utanför Shopify och visar vad behörigheten ger:
  annonskontonas namn och valuta. Finns bara när `META_REVIEW_KEY` är satt
  och kräver nyckeln i adressen (fel nyckel = 404, ingen ingång att prova
  sig fram till). **Skriver aldrig till en butik**, och nyckeln återkallas
  mot Meta innan sidan svarar. `MetaLoginState.syfte = "granskning"` styr
  grenen i `/meta/callback`.
- **`/privacy`** har nu ett Facebook/Meta-avsnitt på engelska: exakt vad
  `ads_read` läser (kostnad, visningar, klick per dag), vad som lagras, att
  inget skapas eller ändras i annonskontot, och hur en person raderar det.
  Supportadressen kommer från `SUPPORT_EMAIL` i miljön.
- ⚠ **META_APP_ID och META_APP_SECRET finns inte på NÅGON Railway-tjänst**
  (mätt 2026-09-12 via Cowork, alla sex + Shared Variables). Knappen "Logga
  in med Facebook" har därför aldrig varit synlig i drift — `metaLoginConfig()`
  är null utan dem och hela kortet döljs. Texten nedan om att variablerna
  "sätts på alla sex tjänster" beskrev avsikten, inte verkligheten. Värdena
  hämtas i Meta-appen (Appinställningar → Grundläggande) och måste in innan
  något av Meta-arbetet går att prova skarpt.
- ⚠ **Det finns ingen Meta-app som heter "StonePNL"** (Axels kontroll
  2026-09-13). Utvecklarkontot har **exakt en app**, med ett annat namn.
  Skriv aldrig "öppna appen StonePNL" i en instruktion — den finns inte, och
  Axel fastnar på steget. Appens namn saknar betydelse för koden: `META_APP_ID`
  och `META_APP_SECRET` kommer från vilken app som helst där han är
  administratör, så länge det är samma app som bär Facebook-inloggningens
  omdirigerings-URI. Namnet är däremot det handlaren ser i inloggningsrutan,
  så visningsnamnet döps om till StonePNL i samma vända (påverkar varken
  App-ID, App-hemligheten eller redan utfärdade tokens).
  ⚠ Är det samma app som gav Bäverbutikens handinklistrade `META_ACCESS_TOKEN`:
  rör inte **Kräv apphemlighet**. Slås den på slutar de anropen fungera direkt.
- **Kvar, och det är inte kod:** Business Verification av Business Manager
  (juridiska dokument, görs FÖRE ansökan), Meta-appen till Live, Marketing
  API-produkten tillagd, och App Review för `ads_read` i Advanced Access med
  skärminspelning. **Hela ansökan, Axels klick i ordning och den färdiga
  engelska motiveringstexten står i `docs/meta-app-review.md`** — läs den
  filen innan något rörs i Meta-dashboarden. **Klicken är färdiga
  Cowork-prompter (8–13) i `docs/cowork-prompts.md`** — Axel ska inte
  klicka själv i Meta-dashboarden, bara ladda upp dokument, ikon och video.
- **Två grindar, inte en:** (1) `ads_read` i Advanced Access via App Review,
  (2) Marketing API Access Tier. Den andra öppnas AUTOMATISKT från Limited
  till Full vid ≥ 500 anrop på 15 dagar med < 15 % fel — ingen ansökan,
  ingen partnerstatus. Business Verification måste vara godkänd INNAN App
  Review går att skicka in; det är den vanligaste orsaken till veckors
  väntan. Realistiskt 2–6 veckor totalt.
- **Miljövariabler som måste sättas före inlämning:** `META_REVIEW_KEY`
  (annars 404 på granskarsidan och granskaren kommer ingenstans) och
  `SUPPORT_EMAIL` (visas i integritetspolicyn).
- ⚠ Researchen bakom filen är INTE förstahandsläst: proxyn blockerade
  `developers.facebook.com`. Stämmer ett fältnamn inte i dashboarden —
  lita på dashboarden och rätta dokumentet.

### Logga in med Facebook för Meta-kopplingen (2026-09-07, build meta-login-v64)
Axels beslut 2026-08-31 (bygg efter App Store-godkännandet) — byggt två dagar
efter godkännandet. Handlaren klickar **Logga in med Facebook** i Inställningar,
godkänner `ads_read` i ett eget fönster, och väljer sedan annonskonto i en
rullista. Den inklistrade token-vägen finns kvar under en hopfällbar rubrik.
- **Varför eget fönster + engångsrad:** appen kör i Shopifys iframe och Meta
  vägrar rendera dialogen där. Fönstret är top-level utan Shopify-session, så
  butiken bevisas i en autentiserad action (`intent=meta-login-url`) som
  skapar en `MetaLoginState`-rad (10 min). `/meta/start` sätter en nonce-
  cookie (Path=/meta, SameSite=Lax — cookien skickas med när Meta skickar
  tillbaka fönstret top-level) och `/meta/callback` kräver att rad OCH cookie
  stämmer, förbrukar raden och byter koden mot en long-lived token
  (kod → kortlivad → `fb_exchange_token`). Bägge rutterna är resursrutter
  (ingen default-export) — annars hade Remix packat in svaret i root-layouten.
- **Fönstret öppnas SYNKRONT i klickhanteraren** (`window.open("", …)`) och får
  adressen först när actionen svarat — annars stoppar webbläsaren popupen.
  Adressen sätts absolut (`about:blank` saknar bas-URL).
- **Settings laddar om sig** via `postMessage` från klar-sidan och via
  pollning på `popup.closed`. Kontolistan hämtas i loadern (`/me/adaccounts`,
  8 s timeout) — misslyckas den visas textfältet med skälet.
- **Annonskontot rörs inte av inloggningen.** En ny butik har inget val
  (checklistan säger "välj annonskonto"), en befintlig behåller sitt.
  `metaAdAccountId` sparas utan `act_`-prefix (`kontoId()`).
- **Cachad spend rensas bara vid KONTOBYTE** — tidigare rensade Spara alltid,
  även vid språkbyte (90 dagar Meta-rader kastades i onödan).
- **Utgång:** `metaTokenExpiresAt` = det TIDIGASTE av `expires_in` (~60 dagar)
  och Metas `debug_token` (`expires_at` + `data_access_expires_at`, ~90 dagar
  från senaste inloggning — flyttas BARA av en ny tur genom dialogen, inte av
  förnyelsen). Panelen varnar från 14 dagar (`VARNA_DAGAR`) och visar rött
  efteråt. Tokenvakten förnyar via `fb_exchange_token` när < 30 dagar
  återstår (atomisk stämpel `metaTokenRefreshAttemptAt`, en gång per dygn),
  men eftersom dataåtkomsten inte flyttas **måste handlaren ändå logga in
  igen senast var ~90:e dag** — varningen säger "logga in igen", inte
  "förnyas automatiskt". Inklistrade tokens får också en utgång via
  `debug_token` när de kommer från samma Meta-app; annars okänd (null).
  **Oprövat här:** att `fb_exchange_token` ger ny 60-dagarstoken för en
  long-lived token, och exakt vad `debug_token` svarar — läs loggraden
  "Meta-token för … förnyades" och Settings' utgångsdatum efter första
  skarpa inloggningen.
- **Kontroller i callbacken innan något sparas:** `ads_read` måste vara
  `granted` i `/me/permissions` (dialogen låter användaren bocka ur
  "Annonser"; `auth_type=rerequest` gör att frågan ställs igen); har butiken
  redan ett konto måste den nya inloggningen se det (annars rörs inget); har
  den inget och listan är tom sparas inget. Exakt ETT konto ⇒ väljs direkt,
  fönstret säger "Klart". Flera ⇒ rullistan i Settings, som sparar vid val
  (`intent=meta-account`) — Spara-knappen längst ner behövs inte för det.
- **Meta-appen för externa handlare (StonePNL):** utvecklingsläge räcker för
  alla med roll i appen. Live-läge kräver Privacy Policy-URL (finns:
  `/privacy`), Data Deletion-URL/callback, Business Verification och App
  Review med Advanced Access på `ads_read`. Utan det visar dialogen "appen är
  inte tillgänglig" för utomstående och skickar aldrig tillbaka — Settings
  säger då "Inget svar kom från Facebook" och pekar på token-vägen.
  Håll "Require App Secret" AV på Meta-appen (anropen skickar ingen
  `appsecret_proof`, och de inklistrade tokensen kommer från en annan app).
  `META_LOGIN_CONFIG_ID` bara för Facebook Login for Business — välj då
  konfigurationstypen "User access token" med `ads_read`.
- **Graph-versionen** är EN konstant, `GRAPH_VERSION` i `meta-login.ts`
  (används av både `meta.server.ts` och inloggningen). v21.0 dras in kring
  2027-01 — bumpa i tid, annars stannar spend och inloggning i alla tjänster.
- **Env:** `META_APP_ID` + `META_APP_SECRET` (samma Meta-app på alla sex
  tjänster), valfri `META_LOGIN_CONFIG_ID` för Facebook Login for Business
  (`config_id` + `override_default_response_type=true` i stället för `scope`).
  Redirect-URI per tjänst = `<SHOPIFY_APP_URL>/meta/callback`; alla måste
  ligga i Meta-appens "Giltiga OAuth-omdirigerings-URI:er" (listan står i
  `docs/meta-token.md`). Utan env-variablerna finns knappen inte alls.
- **Oprövat i skarpt läge** (proxyn nådde varken Meta eller Railway
  2026-09-07): hela OAuth-rundan, kontolistan, förnyelsen. Verifierat:
  `tsc` rent (även den gamla Badge-felet i panelen fixat), `remix vite:build`
  grönt, 30 assert-tester på de rena delarna (dialog-URL, cookie, kontoId,
  dagarKvar, HTML-escape). Första skarpa körningen: kolla att fönstret öppnas
  från iframen, att `/meta/callback` får cookien, och att rullistan visar
  MagiBorsten. Externa handlare (StonePNL) kräver Advanced Access på
  `ads_read` (Meta App Review) — tills dess är väg 2 deras väg.
- **Skydd mot vidarebefordrad länk:** `/meta/start` kräver att navigeringen
  kommer från appen själv (`Sec-Fetch-Site: same-origin`, annars Referer från
  vår origin) och att länken öppnas inom 120 s — annars kunde vem som helst
  med en StonePNL-butik skapa en länk, skicka den till en annan annonsör och
  få DENNES annonskonton kopplade till sin butik. Klar-sidan namnger dessutom
  butiken. Popup-sidorna har strikt CSP med nonce (de visar text från Meta).
- **Bortkoppling och avinstallation återkallar** inloggnings-token hos Meta
  (`DELETE /me/permissions`, best effort) och nollar fälten (`META_TOMT`);
  vakten förnyar bara butiker som fortfarande har en Session-rad.
- **Settings pollar `/app/meta-status`** (bara DB) var 2,5 s medan fönstret
  är öppet, i högst 5 min — inte hela loadern (den ringer Meta för
  kontolistan). Klart = `metaTokenSavedAt` ändrat sedan klicket.
- **Meta-appens inställningar:** "Use Strict Mode for Redirect URIs" på; slå
  av "Client OAuth Login"/implicit flow om FLB tillåter (appen använder bara
  kod-flödet). **Avvecklas en Railway-tjänst: ta bort dess redirect-URI ur
  Meta-appen samma dag** — `*.up.railway.app`-namn kan tas över av andra.
  Sätt META_APP_ID/SECRET på en tjänst först när dess callback-URI är
  registrerad (Danmark väntar på sin domän).
- **Återkallelse gäller hela Facebook-användaren, inte butiken**
  (`DELETE /me/permissions`). Axel är samma person på fem butiker — därför
  sparas `metaUserId`, och token återkallas bara när ingen ANNAN butik har
  samma användare (`farAterkallas`). Annars nollas bara raden.
- **`app/uninstalled` är bara prenumererad för StonePNL** (via toml). De fem
  custom-tjänsterna får ingen webhook vid avinstallation — där ligger
  Session-raden och Meta-token kvar tills `shop/redact` (om det finns) eller
  tills Axel klickar **Koppla bort Meta** innan han avinstallerar. Vaktens
  "bara installerade butiker"-filter är därför bara skarpt på StonePNL.
- **Gruppsumman** namnger butiker vars inloggning går ut inom 14 dagar
  (`notes`) och skiljer "inloggningen har gått ut" från andra spend-fel —
  åtgärden är alltid DEN butikens Inställningar.
- **Backoffen** i `meta.server.ts` är nycklad på butik + tokenavtryck + konto
  och glöms (`glomMetaFel`) när en ny token eller ett nytt konto sparas —
  annars sa panelen "kunde inte hämtas" i fem minuter efter en lyckad
  inloggning. Den minns också OM felet var 190 (`utgangen`).
- **Död token är inte en hicka** (andra granskningsrundan, 22 agenter):
  panelen visade röd "inloggningen har gått ut" ovanför gröna KPI:er, för
  `getSpend` serverade den frusna dagsraden utan fel. Nu tar `getSpend`
  `tokenExpired` från anroparen (utgången passerad) och minns 190: inget nytt
  anrop, dagen som fortfarande rör sig hålls utanför svaret (→ "för hög —
  annonsdata saknas") och `errorCode: "expired"` sätts. Backoff-grenen
  (nås av gruppsumman) flaggar ALLTID — förut summerades en butik med
  stillastående annonskostnad tyst. Gruppsumman utesluter också "token utan
  valt konto" (`accountNotChosen`). Avinstallation raderar `DailySpend`
  (annars serverades förra kontots dagar under nästa konto). Callbacken
  kräver kontolistan när ett konto redan är sparat — kan den inte hämtas
  sparas inget. Fönster-fallbacklänken har `rel="opener"` (annars når
  klar-sidans postMessage aldrig Settings).
- **Deploy-branch:** pnl-app bygger från `claude/bäverbutiken-settkopplingen-
  nba21z`, INTE från `main` (root-CLAUDE.md:s "bara main gäller" handlar om
  Bäverbutikens rutiner). En push till fel gren gör att healthz-markören
  aldrig dyker upp. Sex containrar kör `prisma migrate deploy` samtidigt;
  Prismas advisory-lock har 10 s timeout — en enstaka "Timed out trying to
  acquire a postgres advisory lock" vid deploy är en omstart, inte en
  rollback (`PRISMA_SCHEMA_ENGINE_ADVISORY_LOCK_TIMEOUT=60000` som variabel
  tar bort problemet). Håll Meta-migrationer till nullbara tillägg.
- **Första skarpa kontrollen** (trippelkollen): Chrome + Safari, popup OCH
  länk-fallbacken, desktop-admin OCH Shopify-appen i mobilen. Ett falskt 403
  från `/meta/start` syns i loggen som `sec-fetch-site=(saknas)` — skriv in
  utfallet här med datum och webbläsarversion.
- `shop/redact` raderar `MetaLoginState`. Diagnosrutten `debug-costs.tsx`
  (oautentiserad, nyckel i git-historiken) togs bort i samma build — den
  publika ytan är nu `/healthz`, `/auth/*`, `/webhooks`, `/privacy` och
  `/meta/*`.

### Flerpacks-COGS — kostnad per antal (2026-09-05, build bundle-v59)
Axel visade Juicys "Enheter / Total kostnad"-tabell (1 st 88,34 · 2 st 134,22
· 3 st 180,19) och ville ha samma. Så funkar det nu:
- Tabellen `CostTier` (shop, variantGid, units ≥ 2, totalCost). Antal 1 är
  fortfarande Shopifys unitCost — Shopify har bara ETT styckpris, appen äger
  stegen. `shop/redact` raderar tabellen.
- Dagsraderna (`DailyPnl.products[].lines`) sparar nu antal orderrader per
  antal i raden: `{"1":40,"2":6,"3":1}`. Äldre dagsrader saknar fältet och
  räknas som styckköp tills de hämtas om (fyll på genom att ladda om panelen
  för intervallet, eller vänta på bakgrundsuppdateringen).
- `pnl.server.ts`: `tierCost(qty, unitCost, tiers)` — exakt steg vinner,
  annars närmaste lägre steg + resten till marginalpriset (skillnad mot steget
  före; bara styckpris ⇒ styck × antal). `rowCost` summerar över `lines`.
- UI: produktsidan (`app.costs.$id.tsx`) har kortet "Kostnad per antal
  (flerpack)" — antal, totalkostnad, variant/alla. CSV-importen tar
  `88.34|134.22|180.19` i kostnadskolumnen (1|2|3 st, totalt för antalet);
  mallen exporterar samma form så filen går att skicka runt utan att tappa
  stegen. En rad UTAN `|` rör inte befintliga steg.
- Importlogiken ligger i `app/lib/cost-import.server.ts` (delad). 2026-09-05
  kördes den för alla fem butiker via en TILLFÄLLIG nyckelskyddad POST-rutt
  (`debug-import.tsx`, borttagen i v61) med butikernas sparade offline-
  nycklar — 213/121/127/127/134 varianter (SE/NO/FI/UK/DK), noll överhoppade.
  Underlaget: `scratch/quotes.json` (alla offertfiler tolkade: full1–5,
  prislistan 0820, Axel_quote) + handmappning offertnamn → svensk titel i
  `scratch/bygg-flerpack.py`; övriga butiker matchas via produktbildernas
  filnamn (identiska mellan klonerna, 160–170 av ~170 träffar).
  `Magnetplattor 46/60 delar` är två varianter med varsitt styckpris, inte
  ett flerpack. Lövblås och husdjurskudde finns inte i butiken.
- Äldre dagsrader saknar `lines` och räknas per styck tills de hämtas om.
  Senaste 30 dagarna hämtades om för alla butiker 2026-09-05 (tillfällig
  rutt `debug-flerpack.tsx`, borttagen i v63; utfall i `scratch/flp-*.json`):
  flerpacken sänker redovisad COGS med ~20 000 kr/30 dagar totalt
  (SE 13 282 kr av 237 060 = 5,6 %; NO 5 667 NOK = 7,7 %; FI/DK/UK små).
  22 % av orderraderna i SE har 2+ stycken. Största posten: Fiskespöhållare
  4-pack (7 671 kr i SE, 2 476 NOK i NO).

### Motorhöljen: kostnad per hk-storlek (2026-09-04)
Leverantörsofferten `Axel_quote.xlsx` ger motorhöljet per hk-storlek och land
(USD, 1 st). Tidigare låg 160,75 kr (största storleken) på alla varianter i
alla butiker — fel för allt utom 250–350 hk i SE. Rätt kostnader ligger i
scratch-filerna `cogs-motorholjen-{sverige,norge,finland,danmark,uk}.csv`
(Axel släpper dem i respektive butiks Kostnader-sida). Mappning butiksvariant →
leverantörsstorlek: 6-18→6~15, 20-30→20~30, 40-60→30~60, 60-90→60~100,
100-150→100~150, 175-250→175~225. `Båtmotorskydd 420D – Heltäckande` (9 hk-
varianter) finns bara i SE. Båtskyddets tre storlekar i offerten är inte
inlagda — SE-produkten har en variant och vi vet inte vilken storlek den är.

CSV-importen matchar sedan v58 varianter på städad form (alla streck = "-",
mellanslag runt "-" och "/" ignoreras) och en rad kan träffa ett enskilt
alternativ: variantkolumnen `6 - 18 hk` träffar `Svart / 6 - 18 hk`,
`Blå / 6 - 18 hk` osv. Storleksprislistor behöver alltså inte upprepas per färg.
