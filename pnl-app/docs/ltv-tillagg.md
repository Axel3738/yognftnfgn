# LTV-tillägget — designbeslut innan något byggs

> **Status 2026-09-08 (build ltv-v67): BYGGT enligt det här dokumentet**, se
> avsnittet "LTV-tillägget" i `CLAUDE.md` för vad som finns, vad Axel måste
> göra (Pro-plan, scopes, PCD, `PLAN_GATE`) och vad som är oprövat skarpt.
> Axels svar på de tre frågorna längst ner: (1) Pro-plan $14.99 ("+5 USD"),
> (2) ja — insamling för alla butiker, (3) täckningsbidrag vid 90 dagar.

Skrivet 2026-09-07 som svar på Axels punkt 4 i backloggen: *"betalt tillägg,
+5 USD/mån: LTV-prognos, locked på data, riktigt nice."* Det här är ett
beslutsunderlag, ingen kod. Tre frågor längst ner måste besvaras först.

**Rekommendationen i tre rader:**
1. Sälj det som en andra plan, **Pro $14.99/30 dagar** (Standard $9.99 finns kvar) —
   managed pricing kan inte sälja ett fristående tillägg.
2. Hämta `customer.id` per order, lagra bara en nyckelhashad kund-id och
   orderns dag/belopp/TB. Kräver `read_customers` + PCD nivå 1 + ny
   deklaration + riktig hantering av `customers/redact`.
3. Prognosen är kohortbaserad (återköpsandel × antal återköp × återköps-AOV),
   i **täckningsbidrag**, och visas aldrig förrän data bär den.

Verifieringsläge: proxyn i sessionsmiljön blockerar `shopify.dev`,
`community.shopify.com` och `community.shopify.dev` (403 vid varje hämtning
2026-09-07). Faktan nedan kommer ur sökutdrag från de sidorna, inte ur
sidorna själva. Allt märkt **⚠ verifiera** ska provas på testbutiken
`stonepnl-test` innan det byggs på.

---

## 1. Betalning — hur man säljer ett tillägg under managed pricing

### Vad managed pricing kan och inte kan

Managed pricing heter sedan maj 2026 **Shopify App Pricing** (samma sak,
utbyggt). Shopify hostar planvalssidan och sköter debitering, provperiod,
proration vid byte och prisändringar.

| Modell | Stöds? | Kommentar |
|---|---|---|
| Flera planer med olika funktioner (Standard / Pro) | Ja | Publika och privata planer; planvalssidan visar funktionslistan per plan. Byte = proration automatiskt. |
| Fast månadspris + användningsbaserat pris | Ja | Inte relevant här. |
| Valfritt tillägg ovanpå en plan (+$5 "modul") | **Nej** | En butik har EN prenumeration. Modulära tillägg finns bara i Billing API:s "complex pricing models". |
| Engångsköp (`appPurchaseOneTimeCreate`) | **Nej** | Uttryckligen ostött; forumtrådar från 2026 bekräftar felet "Managed Pricing Apps cannot use the Billing API". |
| Egna Billing API-anrop (`appSubscriptionCreate` …) | **Nej** | Det var det som gav 403-sagan i augusti. Rör inte. |

### Tre vägar, en rekommendation

| | A. Pro-plan $14.99 | B. Byt till Billing API för att få äkta tillägg | C. Pro som privat plan (länk från appen) |
|---|---|---|---|
| Vad handlaren ser | Två planer på Shopifys planvalssida | Egen betalvägg i appen, +$5-ruta | Bara Standard publikt; Pro via länk i appen |
| Kod | Bara en funktionsgrind + planavläsning | Skriva om hela betalvägen, ny granskning, förlorar allt Shopify sköter | Som A |
| Risk | Låg | Hög — exakt det vi flydde ifrån | Låg, men Pro syns inte i listningen |
| Pris för handlaren | $9.99 → $14.99 | $9.99 + $5.00 | Som A |

**Rekommendation: A.** Skillnaden mot "tillägg" är bara ordval på planvalssidan:
*"Pro — everything in Standard + LTV forecast"*. Samma 1-dags provperiod på
båda planerna. C är reserv om Axel vill kunna sälja Pro selektivt.

### Hur appen vet vilken plan butiken har (utan Billing API)

Avläsning är tillåten — förbudet gäller mutationer. Primär väg, Admin
GraphQL med butikens vanliga session:

```graphql
{ currentAppInstallation {
    activeSubscriptions { id name status test currentPeriodEnd planHandle }
} }
```

Grinden: `status === "ACTIVE"` och `planHandle`/`name` matchar Pro-planen som
skapas i Partner Dashboard (läs av exakt namn/handle på testbutiken — gissa
inte). Använd en rå fråga via `admin.graphql`, **inte** bibliotekets
`billing.check()` — den filtrerar på plannamnen i `shopify.server.ts` och
på `test`-flaggan och ger tyst "ingen plan" när något inte matchar.

**⚠ verifiera:** sökutdragen från "Migrate to Shopify App Pricing" säger att
`currentAppInstallation` fortsätter svara för *Billing API*-prenumerationer
och att den kanoniska frågan för App Pricing är **Partner API:ts**
`activeSubscription(appId:, shopId:)`. En forumtråd (29294) rapporterar tom
`activeSubscriptions` trots aktiv plan. Vi vet inte vad StonePNL:s
registrering svarar förrän vi frågat. Ordning:
1. Fråga Admin GraphQL på `stonepnl-test` med aktiv Standard-plan. Svarar den
   med planen: klart, ingen ny hemlighet behövs.
2. Svarar den tomt: Partner API. Det kräver en Partner-API-token +
   organisations-id som nya miljövariabler på App Store-tjänsten (aldrig i
   repot), och `env.server.ts` ska kräva båda eller ingen, som Meta-paret.

Regler för grinden, oavsett väg:
- **Cachas på `ShopSettings`** (`plan`, `planCheckedAt`), kontrolleras högst var
  10:e minut i `app.tsx`-loadern och aldrig blockerande — regeln "panelen får
  aldrig vänta synkront på ett externt API när databasen har en användbar
  version" gäller. Undantag: knappen **"I upgraded — refresh"** på LTV-sidan
  tvingar en avläsning, annars sitter handlaren som just betalat och tittar
  på en låst sida.
- Webhooken `app_subscriptions/update` finns för Billing API; **⚠ verifiera**
  om den kommer under App Pricing. Kommer den: primär signal, cachen sekundär.
- **Egna butiker och custom-tjänster:** `billingEnabled === false` eller
  `BILLING_EXEMPT_SHOPS` ⇒ Pro utan avläsning. Bäverbutikens fem butiker ska
  aldrig se en betalvägg, precis som i dag.
- Uppgraderingsknappen öppnar Shopifys planvalssida
  (`admin.shopify.com/store/<butik>/charges/<app-handle>/pricing_plans`,
  app-handle ur Partner Dashboard) via App Bridge — inte en egen sida.
- Nedgradering Pro → Standard: LTV-sidan låses igen, **datainsamlingen
  fortsätter** (se avsnitt 2, varför).
- Den döda koden i `app.tsx`/`shopify.server.ts` (`billing.require`,
  `BillingInterval`, `STANDARD_PLAN`-konfigen) ska tas bort i samma build —
  två sanningar om betalning är en incident som väntar.

---

## 2. Data — vad LTV behöver och vad appen hämtar i dag

### Gapet

| | I dag | LTV kräver |
|---|---|---|
| Orderfält | belopp, rabatt, frakt, återbetalning, orderrader (`shopify-data.server.ts`) | + **vilken kund** som la ordern |
| Kundfält | inga (PCD-deklarationen: "inga kundfält") | `customer { id }` per order — inget annat |
| Lagring | dagssummor per butik (`DailyPnl`) | per order: kund-hash, dag, netto, TB |
| Orderhistorik | 60 dagar bakåt (bara `read_orders` i `shopify.app.toml`) | 12 månader för LTV180 — kräver `read_all_orders` |
| Scope | `read_products,read_orders,read_inventory,read_reports,write_inventory` | + `read_customers` (`Order.customer` kräver det) |

Utan kund-id går det inte att veta om order nr 2 kom från samma person som
order nr 1. Det finns ingen väg runt: e-post/telefon är PCD nivå 2 (värre),
och kundaggregaten `Customer.numberOfOrders`/`amountSpent` ger livstid till
dags dato utan tidsaxel — de kan komplettera, inte ersätta.

### Minsta tillägget

**Hämtning:** `customer { id }` läggs till i båda orderfrågorna
(`runOrdersPaginated` och `runOrdersBulk`). Parsern `parseOrderLines` ser redan
varje order en gång — där skapas raden.

**Hash:** `kundHash = HMAC-SHA256(nyckel, shop + ":" + customer.id)`, nyckel
härledd ur `TOKEN_ENCRYPTION_KEY` med egen domänsträng (samma mönster som
`crypto.server.ts`, men HMAC, inte kryptering — den ska aldrig kunna vändas).
Butiken ingår i meddelandet så samma person inte kan matchas mellan butiker.
**Nyckeln får aldrig roteras** — då är hela historiken föräldralös.
Klartext-id lagras aldrig, loggas aldrig.

**Tabell (ny):**

```
model KundOrder {
  shop      String
  orderId   String        // Shopify order-GID: idempotent upsert + orders_to_redact
  kundHash  String        // HMAC, se ovan. Null = gästorder utan kund
  dag       String        // YYYY-MM-DD i butikens tidszon
  netto     Float         // subtotal − återbetalning, som DailyPnl
  tb        Float?        // netto − COGS(rader) − tull − avgift, med kostnaden vid hämtning
  @@id([shop, orderId])
  @@index([shop, kundHash, dag])
}
```

Ingen tabell per kund; "första order" är `min(dag)` per hash och räknas vid
läsning (eller i en cache-tabell `LtvKohort` per butik + kohortmånad + horisont
som byggs om i bakgrunden — samma modell som `DailyPnl`). Volym: ~1 500
ordrar/butik/månad ⇒ ~20 000 rader/butik/år. Trivialt.

`DailyPnl` får en kolumn `firstOrders Int` (ordrar från nya kunder den dagen),
så panelen kan visa **ny/återkommande** och **CPA per ny kund** — det andra
skälet till att hämta kund-id, och det som motiverar insamling för alla.

**Insamling för alla butiker från installation, inte bara Pro.** Skäl:
- Ny/återkommande hör till basplanen — legitim användning enligt
  deklarationen.
- "Locked på data" betyder att siffran finns den dag handlaren uppgraderar.
  Börjar insamlingen först vid uppgradering väntar handlaren 2–6 månader på
  ett tal han redan betalat för.
- Pseudonymiserad rad utan namn, adress eller e-post — minsta möjliga
  behandling som ändå ger funktionen.

**Backfyllnad:** 60 dagar direkt (dagens scope). Resten kräver
`read_all_orders` (ansökan i Partner Dashboard → API access → *Read all orders*,
motivering: kohortanalys kräver 12 månaders orderhistorik). Tills det är
godkänt visar appen bara horisonter som datan bär (avsnitt 3).

### Vad det ändrar i deklaration, policy och webhooks

**PCD-deklarationen** (Partner Dashboard → API access → Protected customer data):
- Begär **nivå 1** ("protected customer data"), inga protected customer fields.
  Kund-id är nivå 1; namn/adress/telefon/e-post är nivå 2 och begärs inte.
- Reason: analytics — "att beräkna butikens lönsamhet per kundkohort
  (återköpsandel, kundvärde över tid) och skilja nya från återkommande
  kunder".
- Dataminimeringstext, ersätter dagens "inga kundfält efterfrågas":
  > Appen läser kund-ID per order och lagrar det enbart som en nyckelhashad
  > pseudonym tillsammans med orderns datum och belopp. Inga namn, adresser,
  > e-postadresser eller telefonnummer efterfrågas, lagras eller visas.
  > Pseudonymen används för att koppla ihop en kunds ordrar över tid; den kan
  > inte vändas till kund-ID utan appens serverhemlighet och delas inte.
- Retention: "raderna lever så länge appen är installerad; `shop/redact`
  raderar allt, `customers/redact` raderar kundens rader".
- **Nya scopes ⇒ befintliga handlare får en godkännandeskärm nästa gång de
  öppnar appen** (biblioteket ser scope-glappet i sessionen). Det är
  normalt, men det ska stå i release-noten.
- Både PCD-ansökan och `read_all_orders` granskas av Shopify (dagar till
  veckor). Listningen uppdateras samtidigt (ny plan, ny funktionstext).

**`/privacy`** (`app/routes/privacy.tsx`, daterad 2026-08-11): styckena "Vilken
data appen läser" och "Vad som lagras" säger i dag "läser inte
kunduppgifter" — det blir osant och måste skrivas om med texten ovan, plus
ett stycke om att handlare och kunder kan begära radering via
`customers/redact`. Datumet uppdateras.

**`app/routes/webhooks.tsx`** — i dag `break` på båda kundwebhookarna med
kommentaren "appen lagrar ingen kunddata". Det måste ändras:
- `CUSTOMERS_REDACT`: payloaden bär `customer.id` och `orders_to_redact[]`.
  HMAC:a id:t ⇒ `deleteMany` på `kundHash`, plus `deleteMany` på
  `orders_to_redact` per `orderId`. Kohortcachen för butiken invalideras.
  Det här är hela poängen med HMAC framför ren SHA: vi kan fortfarande hitta
  personens rader när Shopify ber oss, utan att kunna hitta dem själva.
- `CUSTOMERS_DATA_REQUEST`: logga begäran (butik, tidpunkt, hashat id) —
  Shopify ger 30 dagar att svara handlaren. Det vi håller är orderdatum och
  belopp som handlaren redan har i sin egen admin; svaret går via
  supportadressen. Ingen automatik behövs, men tystnad är inte ett svar.
- `SHOP_REDACT`: lägg till `kundOrder` och `ltvKohort` i transaktionen —
  `CLAUDE.md` säger redan "glöm inte nya tabeller här".
- `APP_UNINSTALLED`: raderna får ligga kvar till `shop/redact` (48 h), som
  allt annat.

**Juridiskt ordval:** en nyckelhashad kund-id är **pseudonymisering, inte
anonymisering** — raderna är fortfarande personuppgifter i GDPR:s mening,
därför radering på begäran. Kohortaggregaten (N kunder, summor) är
anonyma och får finnas kvar.

---

## 3. Prognosen — en enkel, ärlig modell för en dropshipbutik

### Varför kohorter, inte en "LTV-siffra"

En dropshipbutik har låg återköpsandel (typiskt 3–12 %) och en AOV som
sjunker vid återköp (första köpet är ofta ett paket, andra en enstaka vara).
En genomsnittlig "LTV = 480 kr" utan tidsaxel säger inget om när pengarna
kommer, och det är *när* som avgör om en högre CPA går att bära. Därför:
värde per **förvärvskohort** (kunder med första order samma kalendermånad) vid
**30/60/90/180 dagar** efter första ordern.

### Formeln

För en kohort c och horisont h dagar:

```
N_c          = antal kunder med första order i månad c
AOV1_c       = medel(netto för första ordern) i kohorten
R_c(h)       = andel av N_c som lagt ≥ 1 order till inom h dagar        (återköpsandel)
n_c(h)       = medel(antal återköpsordrar inom h dagar) bland dem som återköpt
AOVr_c(h)    = medel(netto per återköpsorder inom h dagar)              (AOV-avtagandet mäts, antas inte)

LTV_c(h)     = AOV1_c + R_c(h) × n_c(h) × AOVr_c(h)                     (i omsättning)
LTVtb_c(h)   = TB1_c  + R_c(h) × n_c(h) × TBr_c(h)                      (i täckningsbidrag — samma form, tb i stället för netto)
```

Allt i formeln är **observerat** för kohorter som är minst h dagar gamla.
Kohorttabellen innehåller därför bara fakta, aldrig prognos.

**Prognosen** gäller kohorter som är yngre än h — dem handlaren bryr sig om,
eftersom det är dem han köper annonser för just nu. Där lånas
återköpsbeteendet från butikens egna mogna kohorter:

```
Pool(h)      = alla kohorter som är ≥ h dagar gamla, viktade med N_c
R(h), n(h), AOVr(h) ur poolen
LTVprog_c(h) = AOV1_c (kohortens egen, observerad) + R(h) × n(h) × AOVr(h)
```

Kohortens eget första-ordervärde behålls: en månad med kampanjpris ska inte
få en annan månads AOV. Bara återköpsdelen är lånad — och det ska stå på
sidan.

### Break-even-CPA mot LTV i stället för första ordern

Panelen i dag (`pnl.server.ts`):

```
maxCpaAtTarget = (totalSales × (1 − targetMargin − feeRate) − cogs − tariff) / orders
```

Det är TB per order minus målmarginalen — räknat på **första ordern** och per
**order**, inte per ny kund. Nytt, per ny kund och per horisont:

```
breakEvenCPA(h) = LTVtb(h)                              ; noll vinst efter h dagar
maxCPA(h)       = LTVtb(h) − targetMargin × LTV(h)      ; samma målmarginal som i dag, på hela kundvärdet
CPA per ny kund = annonskostnad / firstOrders            ; den siffra maxCPA(h) ska jämföras mot
```

Visas sida vid sida: *"max CPA (first order): 143 kr · max CPA (90-day LTV):
171 kr · +28 kr paid back within 90 days"*. Den första raden finns kvar —
den är kassaflödesgränsen. Den andra är budgetgränsen för den som kan
vänta. Vilken horisont som styr väljs i Settings (default 90 dagar, se
fråga 3).

### Minsta data — när siffran får visas

Appens kärnregel: **visa aldrig tyst en felaktig vinst.** Tillämpat här:

| Vad | Visas när | Annars |
|---|---|---|
| En kohortrad | N_c ≥ 50 nya kunder | raden visas grå med "N too small (23)" — ingen siffra |
| Kohortens värde vid h | kohorten är ≥ h dagar gammal | cellen tom med "—" och tooltip "observed for 41 of 90 days" |
| Prognos LTVprog(h) och maxCPA(h) | ≥ 2 mogna kohorter i Pool(h) **och** Σ N ≥ 300 **och** ≥ 30 återköpsordrar i poolen | "Not enough data for 90-day LTV yet — 212 of 300 customers observed" med en mätare, inget tal |
| LTV180 | som ovan; kräver i praktiken `read_all_orders` eller 7 månaders insamling | mätaren visar vad som saknas: "needs order history beyond 60 days — pending Shopify approval" |
| Något alls | `read_customers` beviljat och ≥ 1 hämtning med kund-id | låst sida med orsaken i klartext |

Tröskelvärdena är **absoluta**, inte relativa till butiken (samma regel som
dashboardens trösklar). 30 återköpsordrar är golvet för AOVr — under det
skulle vi räkna avtagandet på en handfull köp. Räcker data för R(h) men inte
för AOVr visas återköpsandelen ensam, tydligt märkt, och ingen LTV.

### Konfidens — visas alltid, aldrig som färg ensam

- Osäkerheten sitter nästan helt i R(h) (en andel av N). **Wilson-intervall,
  95 %**, på R(h) ur poolen, propagerat rakt genom formeln:
  `LTV_låg = AOV1 + R_låg × n × AOVr`, `LTV_hög` likadant.
- Visning: `LTV90 412 kr (355–470)` och `max CPA 171 kr (148–194)`.
  Handlaren ska se spannet, inte bara mitten.
- Etikett med ikon + text (färgblindhetsregeln i `CLAUDE.md`):
  ◐ **Low confidence** när spannet är > 40 % av mittvärdet, ● **Good** annars.
  Spann > 80 % ⇒ visa inte talet, bara mätaren. Etiketten står bredvid
  siffran, aldrig bara som färg.
- **Datakvalitetsrad** ovanför allt: hämtningsstatus (som gruppsumman:
  "hämtning misslyckades" ≠ "hämtas"), andel gästordrar utan kund-id
  (räknas som engångskunder — sägs rakt ut), och att återbetalningar
  bokförs på orderns dag vid hämtning (samma approximation som panelen).
- **Prognos märks som prognos:** kursiv + "est." i kohorttabellen, och en
  mening under kurvan: "Repeat behaviour for cohorts younger than 90 days is
  borrowed from your 5 mature cohorts (1 840 customers)."

### Sidan (Pro-fliken "LTV")

1. Överst: tre tal med spann — LTV(h), max CPA(h), CPA per ny kund senaste 30
   dagarna — och verdiktet i text: *"Your CPA (156 kr) is under 90-day max CPA
   (171 kr) but over first-order max CPA (143 kr): profitable within 90 days."*
2. Kurvan LTV(h) för h = 30/60/90/180, omsättning och TB som två linjer,
   spannet som band. Färgordningen ur dashboarden, inte ny.
3. Kohorttabellen: månad · N · AOV1 · R30/60/90/180 · LTV30/…/180 · TB-LTV.
   Fakta i normal stil, prognos kursiv "est.", tomt "—" där data saknas.
4. Mätaren "data maturity" — vad som krävs för nästa horisont.

**Standard-planen** ser mätaren och återköpsandelen (ett tal) samt ny/åter-
kommande i panelen; kurvan, tabellen och LTV-CPA ligger bakom Pro. Så ser
handlaren att datan finns *innan* han betalar, och köper aldrig en tom sida.

---

## 4. Arbetsinsats i faser

| Fas | Vad | Insats | Beroende |
|---|---|---|---|
| 0. Verifiera & ansök | Läs `activeSubscriptions` på `stonepnl-test` (Admin, ev. Partner API). Axel skapar Pro-planen i Partner Dashboard och skickar tre ansökningar: PCD nivå 1, `read_customers`, `read_all_orders`. | 0,5 dag + Shopifys väntetid | Fråga 1–2 besvarade |
| 1. Datalagret | Scope i toml + env-hint, `customer { id }` i båda frågorna, HMAC-hjälpare, `KundOrder` + SQL-migration, `DailyPnl.firstOrders`, webhookarna (redact/data_request/shop_redact), `/privacy`, deklarationstext. 60-dagars backfyllnad. | 2 dagar | Fas 0 (scope måste vara beviljat för att testa skarpt) |
| 2. Räknemotorn | `ltv.server.ts` ren logik utan I/O (kohorter, pool, Wilson, trösklar), kohortcache i bakgrunden, assert-tester på syntetiska kohorter inkl. "visas inte"-fallen. | 1,5 dag | — (kan börja parallellt med fas 1) |
| 3. UI + grind | Flik "LTV" i `NavMenu`, planavläsning + cache + refresh-knapp, låst sida med uppgraderingslänk, Settings: horisont, i18n i BÅDA ordböckerna, max-CPA-raden i panelen, ny/återkommande. | 2 dagar | Fas 1–2 |
| 4. Listning & inlämning | Planer + funktionstext i listningen, `shopify app deploy` (toml), release-not om godkännandeskärmen, inlämning. | 0,5 dag + granskning | Fas 3 |
| 5. Full historik | När `read_all_orders` beviljats: 12 månaders backfyllnad via bulk-vägen, en butik i taget (en bulk-operation per butik). | 0,5 dag | Shopifys beslut |

Summa ~7 arbetsdagar kod, plus Shopifys väntetider (PCD och
`read_all_orders`: dagar till veckor). Deployverifiering per `CLAUDE.md`
(build-markör, `/healthz`) gäller varje fas — och kan inte göras från
sessionsmiljön när proxyn blockerar Railway; då sägs det rakt ut.

**Vad handlaren ser i tid:** en butik med ≥ 300 nya kunder/månad får LTV30
efter ~1 månad och LTV60 efter ~2 månader ur 60-dagarsbackfyllnaden; LTV90
och LTV180 kommer först med `read_all_orders` eller efter 4–7 månaders
insamling. Det ska stå i listningstexten, annars säljer vi en mätare.

---

## Tre frågor Axel måste svara på först

1. **Plan i stället för tillägg?** Managed pricing kan inte sälja "+$5".
   Alternativen: (a) **Pro $14.99** som andra publik plan — rekommenderat,
   (b) Pro som privat plan bara via länk i appen, (c) skriva om till
   Billing API för äkta tillägg — avråds.

2. **Får appen börja läsa kund-id?** Det betyder ansökan om `read_customers`,
   PCD nivå 1 och `read_all_orders`, ny deklaration och integritetspolicy,
   och en godkännandeskärm för alla befintliga handlare nästa gång de öppnar
   appen. Insamlingen gäller **alla** butiker från installation (så siffran
   finns när någon uppgraderar), inte bara Pro. Ja / nej / bara Pro-butiker.

3. **Vilken siffra ska styra max-CPA?** (a) LTV i **täckningsbidrag** vid
   **90 dagar** som default — rekommenderat, handlaren kan byta horisont i
   Settings; (b) 180 dagar; (c) omsättnings-LTV (som Shopify/Juicy visar, men
   det ljuger om dropship-marginaler).
