# Meta App Review — så får StonePNL Juicys Facebook-inloggning

> **Kort svar: det är inte kod som saknas.** Inloggningen, Metas båda
> callbacks och granskarsidan är byggda (build `meta-granskning-v85`). Kvar
> står Business Verification, ifyllda fält i Meta-appen, en skärminspelning
> och App Review för `ads_read` i **Advanced Access**. Räkna med 2–6 veckor.
>
> Axels mål 2026-09-12: *"Juicy har en jättebra Facebook-koppling där man
> bara loggar in. Sluta inte jobba förrän vi har en likadan."*

## Varför det inte fungerar i dag

`ads_read` i **Standard Access** (det appen har utan granskning) fungerar
**bara mot annonskonton som appens egna roll-innehavare äger**. Det är inte
en bugg — det är regeln. För att läsa en främmande handlares annonskonto
krävs **Advanced Access**, vilket kräver App Review, vilket kräver ett
verifierat Business Manager.

Det finns **två oberoende grindar**:

| Grind | Vad | Hur den öppnas |
|---|---|---|
| 1. Behörigheten | `ads_read` i Advanced Access | Business Verification → App Review med video |
| 2. Marketing API Access Tier | Limited → Full | Limited kommer med verifierat BM + Live-app. Full öppnas **automatiskt** vid ≥ 500 anrop på 15 dagar med < 15 % fel — ingen ansökan |

Grind 2 kräver alltså ingen partnerstatus och inget "Meta Business
Partner"-märke. Den öppnas av att appen används.

> ⚠ **Källorna är inte förstahandslästa.** Sessionens proxy blockerade
> `developers.facebook.com` (403 på CONNECT), så researchen bygger på
> sökmotorutdrag och tredjepartskällor, inte på Metas egna sidor i sin
> helhet. Stämmer ett fält inte i dashboarden: lita på dashboarden, inte på
> den här filen, och rätta filen efteråt.

## Det som redan är byggt (och varför Meta kräver det)

| Finns | Adress | Varför |
|---|---|---|
| Inloggningen | `/meta/start` → `/meta/callback` | Hela OAuth-rundan i eget fönster (Meta vägrar iframe) |
| Dataradering | `/meta/deletion` | **Obligatorisk** för Live-läge. POST med `signed_request` → raderar och svarar `{url, confirmation_code}`. GET = statussidan |
| Avauktorisering | `/meta/deauth` | Personen tar bort appen på Facebook → kopplingen rensas |
| Granskarsidan | `/meta/granska?key=…` | Granskaren har ingen Shopify-butik. Kör samma OAuth utanför Shopify, sparar inget, återkallar nyckeln |
| Integritetspolicy | `/privacy` | Har ett engelskt Facebook/Meta-avsnitt: vad `ads_read` läser, vad som lagras, hur man raderar |

**Innan ansökan skickas** (annars pekar den på en adress utan koden):

1. Deploya grenen och bekräfta att `/healthz` svarar `meta-granskning-v85`.
2. Sätt `META_REVIEW_KEY` (lång slumpsträng) på Railway-tjänsten
   `pnl-app-store`. Utan den svarar `/meta/granska` **404**.
3. Sätt `SUPPORT_EMAIL` på samma tjänst.
4. **`META_APP_ID` + `META_APP_SECRET` + `TOKEN_ENCRYPTION_KEY` måste finnas
   på App Store-tjänsten.** Mätt 2026-09-12: de gjorde det INTE, och
   `/meta/granska` svarade "Not configured". Utan dem finns knappen "Logga in
   med Facebook" inte ens i App Store-versionen. Prompt 8b kopierar dem från
   en av butikstjänsterna. `TOKEN_ENCRYPTION_KEY` måste vara exakt samma
   sträng på alla sex — de delar databas.
5. Rökprova utan att vara inloggad:
   - `GET /privacy` → 200, och Meta-avsnittet syns.
   - `GET /meta/deletion` → statussidan (inte 404).
   - `POST /meta/deauth` med skräp i `signed_request` → **400**, inte 500.

## Cowork gör klicken — prompt 8 till 13

Allt som är rent klickande ligger som färdiga Cowork-prompter i
`docs/cowork-prompts.md` (avsnittet "Meta-godkännandet"). Kör dem i ordning.

Tre saker kan Cowork **inte** göra, och de är Axels:
registreringsbevis och kontoutdrag, appikonen 1024 × 1024 px, och
skärminspelningen + skapandet av testkontot (Facebook kräver telefon).

Stegen nedan är samma sak i klartext, för den som hellre klickar själv.

## Axels steg, i ordning

### Del 1 — Verifiera företaget (börja här, det tar längst tid)

Business Verification måste vara **godkänd innan** App Review går att skicka
in. Det är den vanligaste orsaken till att projekt står stilla i veckor.

1. Gå till `business.facebook.com`.
2. Klicka kugghjulet **Inställningar** nere till vänster.
3. Klicka **Företagsinfo**.
4. Klicka **Starta verifiering**.
5. Fyll i företagsnamn och adress **exakt** som på registreringsbeviset.
6. Ladda upp registreringsbevis från Bolagsverket.
7. Ladda upp ett färskt företagskontoutdrag eller en faktura.
8. Klicka **Skicka in**.

Namn och adress måste matcha dokumenten tecken för tecken — minsta avvikelse
ger avslag och ny väntetid.

### Del 2 — Fyll i Meta-appen

1. `developers.facebook.com/apps` → öppna **StonePNL**.
2. **Appinställningar → Grundläggande**:
   - Sekretesspolicyns URL: `https://pnl-app-store-production.up.railway.app/privacy`
   - Appikon 1024 × 1024 px
   - Kategori: **Business**
   - Kontakt-e-post: en adress som faktiskt läses (alla besked går dit)
   - **Radering av användardata** → välj *Callback-webbadress* →
     `https://pnl-app-store-production.up.railway.app/meta/deletion`
   - **Spara ändringar**
3. **Appinställningar → Avancerat**:
   - Callback-URL för avauktorisering:
     `https://pnl-app-store-production.up.railway.app/meta/deauth`
   - **Spara ändringar**
4. **Facebook-inloggning → Inställningar**:
   - Giltiga OAuth-omdirigerings-URI:er ska innehålla
     `https://pnl-app-store-production.up.railway.app/meta/callback`
     (och motsvarande adress för varje annan tjänst som ska kunna logga in)
   - **Spara ändringar**

### Del 3 — Testkontot

Metas granskare får **aldrig** era egna konton.

1. Skapa ett nytt Facebook-konto som bara används till granskningen.
2. `business.facebook.com` → **Inställningar → Personer** → **Lägg till**.
3. Bjud in testkontots e-postadress.
4. Ge det tillgång till **ett annonskonto som har data i sig**.
5. Skriv ner e-post och lösenord — de ska med i ansökan.

### Del 4 — Skärminspelningen

Videon är granskarens **enda** referens. Han utforskar inte appen själv.

1. Logga ut från Facebook i webbläsaren.
2. Starta inspelning: synlig muspekare, inget ljud, engelskt gränssnitt,
   max 1440 px bredd.
3. Öppna `https://pnl-app-store-production.up.railway.app/meta/granska?key=<META_REVIEW_KEY>`.
4. Klicka **Continue with Facebook**.
5. Logga in med testkontot.
6. **Visa hela samtyckesrutan där `ads_read` beviljas** och klicka Continue.
7. Visa listan med annonskonton som kommer upp.
8. Öppna StonePNL i Shopify och visa nettovinsten med annonskostnaden i.
9. Stoppa och spara.

**De vanligaste avslagsorsakerna, alla undvikbara:** inspelningen börjar
redan inloggad; samtyckesrutan syns inte; granskaren kan inte återskapa
flödet med sitt eget testkonto; låg upplösning eller dold pekare; icke-
engelskt gränssnitt utan undertexter; motiveringen beskriver något annat än
videon visar. En generisk produktdemo som aldrig visar samtyckesrutan är den
enskilt vanligaste orsaken.

### Del 5 — Skicka in

1. **App Review → Permissions and Features**.
2. Sök `ads_read` → **Request Advanced Access**.
3. Klistra in texten nedan i motiveringsrutan.
4. Ladda upp videon.
5. Fyll i testkontots e-post och lösenord under testinloggning.
6. **Submit for Review**.

### Del 6 — Efter godkännandet

1. Öppna appen på `developers.facebook.com`.
2. Dra reglaget högst upp från **Utveckling** till **Live**.
3. Bekräfta.

Då fungerar "Logga in med Facebook" för utomstående handlare — precis som
hos Juicy.

## Ansökningstexten (klistra in som den är)

```
## How StonePNL uses ads_read

StonePNL is a profit dashboard for Shopify merchants. It shows a merchant their own net profit
per product and per day: sales, minus cost of goods, minus shipping, duty and transaction fees,
minus what they spent on advertising.

Advertising cost is the only number StonePNL cannot get from Shopify. That is what ads_read is for.

Who uses the permission: the Shopify merchant who installed StonePNL, for their own ad account
only. Nobody else.

Exactly where it is used in the flow: in the app the merchant opens Settings and clicks "Log in
with Facebook". A Facebook login window opens, the merchant grants ads_read, and the app lists the
ad accounts that user can see. The merchant picks one ad account and saves. From then on, once a
day, the app requests the daily insights of that single ad account.

Exactly what data is requested: GET /v21.0/act_<selected_ad_account_id>/insights with the fields
spend, impressions and clicks, broken down by day (time_increment=1). We also call
GET /me/adaccounts once, to render the account picker so the merchant can choose the right account.
Nothing else is read — no creatives, no audiences, no user profiles, no customer data.

What we store: the daily spend amount, its currency, and the selected ad account id, per merchant
shop. The access token is stored encrypted at rest (AES-256-GCM). We store no ad content and no
data about any person other than the merchant who connected the account.

Why ads_read is the minimum permission for this step: StonePNL is read-only by design. It never
creates, edits, pauses or deletes anything in an ad account, and it never sends events, conversions
or purchase signals back to Meta. ads_management would grant write access we neither want nor use,
so we are not requesting it.

No sharing, no profiling: the ad spend is shown only to the merchant who connected the account,
inside their own Shopify admin. It is never sold, never shared with third parties, never combined
across merchants, and never used to build audiences, profiles or targeting of any kind. Each
merchant's data is isolated. Disconnecting in Settings, uninstalling the app, or sending a data
deletion request removes the token and every ad spend figure fetched with it.

## What the screen recording shows

The recording starts logged out of Facebook and shows, in one unbroken flow:
1. The StonePNL reviewer test page opened in a browser.
2. Clicking "Continue with Facebook".
3. Signing in with the test credentials supplied below.
4. The Facebook consent dialog where ads_read is granted, shown in full.
5. The app listing the ad accounts returned by /me/adaccounts, with name and currency — the account
   picker the merchant uses.
6. The StonePNL dashboard inside Shopify, where the daily ad spend read with ads_read is subtracted
   from sales to produce net profit per product and per day.

## Instructions for the reviewer

StonePNL runs embedded inside Shopify admin, which a reviewer cannot reach without a Shopify store.
We therefore built a dedicated page that runs the exact same OAuth flow outside Shopify:

https://pnl-app-store-production.up.railway.app/meta/granska?key=<META_REVIEW_KEY>

Open that URL, press "Continue with Facebook", sign in with the test credentials below, and grant
ads_read. The page then lists the ad accounts the permission gives access to, which is exactly how
the permission is used in the product. The page writes nothing to any merchant account and revokes
the token as soon as the list has been shown.

Test credentials: <TEST_EMAIL> / <TEST_PASSWORD> (a dedicated test account with access to one ad
account).

Privacy policy:            https://pnl-app-store-production.up.railway.app/privacy
Data deletion callback:    https://pnl-app-store-production.up.railway.app/meta/deletion
Deauthorize callback:      https://pnl-app-store-production.up.railway.app/meta/deauth
```

Byt ut `<META_REVIEW_KEY>`, `<TEST_EMAIL>` och `<TEST_PASSWORD>` mot de
riktiga värdena. **Nyckeln och lösenordet får aldrig committas hit.**

## Tidslinje

| När | Vad |
|---|---|
| Dag 0 | Business Verification skickas in. Samma dag: fälten i Meta-appen, miljövariablerna, videon |
| Dag 1–5 (kan bli 10+) | Business Verification granskas |
| Dagen den godkänns | App Review för `ads_read` skickas in |
| +2 till +20 dagar | App Review. Varje avslag nollställer klockan |
| Direkt efter | Appen till Live. Inloggningen fungerar för alla handlare |
| Av sig själv | Limited → Full Access i Marketing API vid ≥ 500 anrop/15 dagar, < 15 % fel |
| Varje år | Data Use Checkup — missas den stängs API-åtkomsten av |

**Realistiskt: 2–6 veckor.** Inte dagar.

## Efter godkännandet — nästa nivå

Med `config_id` (**Facebook Login for Business**) och en
Business Integration System User-token slipper handlaren logga in igen var
tredje månad. `meta-login.server.ts` har redan `configId`-stödet, men
tokenvakten och kontolistningen måste anpassas till den token-typen.

**Lägg det aldrig i samma inlämning som `ads_read`** — det kräver troligen
en egen granskningsrunda, och en blandad ansökan avslås i sin helhet.
