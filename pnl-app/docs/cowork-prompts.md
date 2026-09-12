# Cowork-prompter — klick Axel inte behöver göra själv

Axel klistrar in en ruta i taget i Cowork (Claude med webbläsarstyrning).
Varje prompt är fristående. Underlag: `foretag-admin.md`, `CLAUDE.md`
("Axel måste göra"). Skrivet 2026-09-08.

## 1. Pro-planen (Partner Dashboard) — ✅ GJORD 2026-09-08

Utfall: Pro / handle `pro` / 14,99 USD per månad / **14 dagars** prov (Axel
valde 14, inte 1) / "Free for partners and developers" på. Feature-fältet tar
max 40 tecken — två rader förkortades. basic fick samtidigt 14 dagars prov.

```
Du styr min webbläsare. Jag är inloggad på partners.shopify.com.
Uppgift: skapa en ny prisplan för min app StonePNL.

1. Gå till https://partners.shopify.com och öppna Apps → StonePNL.
2. Klicka Distribution (eller "App Store listing") → Pricing (Prissättning).
   Om det står "Shopify App Pricing" / "Managed pricing": klicka "Add plan" (Lägg till plan).
3. Fyll i:
   - Plan name: Pro
   - Price: 14.99 USD per 30 days (recurring)
   - Free trial: 1 day
   - Features (en rad per punkt):
     • Everything in Standard
     • Customer lifetime value (LTV) per cohort, 30/60/90/180 days
     • LTV forecast with confidence range
     • Repeat customer rate and max CPA based on LTV
   - Visibility: Public
4. Spara planen. Ändra INTE planen "Standard" (9.99 USD).
5. Om Shopify ber om att skicka in listningen igen: klicka Submit/Skicka.
6. Ta en skärmbild av prissidan när båda planerna syns och visa mig.
Fråga mig om något fält saknas eller ser annorlunda ut — gissa inte.
```

## 2. Vänrabatt 50 % — privat plan "Friends 50%"

```
Du styr min webbläsare. Jag är inloggad på partners.shopify.com (kan omdirigera till dev.shopify.com — fortsätt där).
Uppgift: skapa en PRIVAT prisplan för min app StonePNL som bara mina vänner kan välja.

1. Öppna Apps → StonePNL → Distribution → Manage listing → Pricing.
   Syns inte Pricing: Published languages → Edit (English) → Pricing content → Manage.
2. Rulla till "Private plans" och klicka Add.
3. Fyll i: Billing = Monthly, Monthly charge = 4.99 (USD), Free trial = 0.
4. I fältet för butiker som får se planen ("Stores with plan access" eller liknande):
   skriv domänerna jag ger dig: <vännens butik>.myshopify.com  (en per rad).
5. Save. Sätt sedan Display name = "Friends 50%" och Save igen.
6. Gör samma sak en gång till med Monthly charge = 7.49 och Display name = "Friends Pro 50%"
   BARA om det redan finns en publik plan som heter Pro.
7. Ta en skärmbild av Private plans-listan och visa mig.
Ändra inget på de publika planerna. Fråga mig om ett fält saknas — gissa inte.
```

Text Axel skickar till vännen efteråt (ur `foretag-admin.md` del A):
> Öppna StonePNL i din Shopify-admin → Inställningar → "Ändra plan". Välj **Friends 50%** (4,99 USD/mån) och godkänn.

## 3. Nya behörigheter (scopes) för kundvärdet — ✅ GJORD 2026-09-08

Utfall: Dev Dashboard har ingen Configuration-sida längre — scopes släpps som
en ny **version**. stonepnl-4 är aktiv med `read_customers`. Protected
customer data nivå 1 var redan godkänd 2026-09-05 (rördes inte). "Read all
orders" är ansökt och under granskning; scopen kan inte läggas in förrän då
(prompt 4b).

```
Du styr min webbläsare. Jag är inloggad på partners.shopify.com.
Uppgift: lägg till två behörigheter på min app StonePNL.

1. Öppna Apps → StonePNL → Configuration (Konfiguration).
2. Under "Access scopes" / "Behörigheter": lägg till read_customers och read_all_orders
   som OBLIGATORISKA (inte "optional"). Behåll de som redan finns.
3. Save, sedan "Release" / "Släpp version" om knappen finns.
4. Gå till API access (API-åtkomst) → "Protected customer data access" → Request access.
   Välj nivå 1 (protected customer data, INGA customer fields). Reason: Analytics.
   Klistra in denna text i motiveringen:
   "The app reads the customer ID per order and stores it only as a keyed hash (pseudonym)
    together with the order's date and amounts, to calculate repeat rate and customer
    lifetime value per cohort. No names, addresses, e-mail addresses or phone numbers are
    requested, stored or shown. customers/redact deletes the customer's rows; shop/redact
    deletes everything."
5. På samma sida: ansök om "Read all orders" med motiveringen
   "Cohort analysis of customer lifetime value requires 12 months of order history."
6. Skärmbild av båda ansökningarna → visa mig.
Fråga mig om något ser annorlunda ut — gissa inte.
```

## 4. Railway-variabler

> Utfall 2026-09-08 av prompt 1 och 3 (Cowork): basic har 14 dagars prov, Pro
> finns (handle `pro`, 14,99 USD, 14 dagar), version **stonepnl-4** är aktiv
> med `read_customers`. `read_all_orders` nekades tills ansökan godkänts
> (skickad, upp till 7 arbetsdagar) — därför står den INTE i SCOPES nedan.

```
Du styr min webbläsare. Jag är inloggad på railway.app.
Uppgift: uppdatera miljövariabler på mina PNL-tjänster.

För VARJE tjänst i projektet (beautiful-curiosity, yognftnfgn-production, yognftnfgn-copy, pnl-uk, Danmark-tjänsten, pnl-app-store):
1. Öppna tjänsten → Variables.
2. Ändra SCOPES till exakt (utan read_all_orders):
   read_products,read_orders,read_inventory,read_reports,write_inventory,read_customers
3. Lägg till ANTHROPIC_API_KEY = <nyckeln jag ger dig> (jag klistrar in den själv i fältet om du säger till).
4. Deploy om tjänsten om Railway inte gör det själv.

BARA på tjänsten pnl-app-store (App Store-versionen):
5. Lägg till PLAN_GATE = 1
6. Lägg till APP_HANDLE = <app-handle från listningens URL, t.ex. "stonepnl">

Ta en skärmbild av variabellistan per tjänst (dölj värdet på ANTHROPIC_API_KEY) och visa mig. Ändra inga andra variabler.
```

Nyckeln hämtas på https://console.anthropic.com → **API Keys** → **Create Key**.
Den visas bara en gång — klistra in den direkt i Railway, spara den aldrig i
repot eller i en chatt.

## 4b. När "Read all orders" godkänts (mejl från Shopify)

```
Du styr min webbläsare. Jag är inloggad på dev.shopify.com (Dev Dashboard).
Uppgift: släpp en ny version av min app StonePNL med en extra behörighet.

1. Öppna appen StonePNL → Versions (Versioner) → skapa ny version från den aktiva (stonepnl-4).
2. Under Access scopes: lägg till read_all_orders. Behåll alla befintliga.
3. Släpp versionen (Release). Skärmbild av scopes-listan → visa mig.
Fråga mig om Shopify fortfarande säger "ogiltig omfattning" — gissa inte.
```

Samma dag: Railway → varje tjänst → `SCOPES` får `,read_all_orders` på slutet,
och `shopify.app.toml` + `app/env.server.ts` uppdateras i repot.

## 5. SNI-kod på verksamt.se

```
Du styr min webbläsare. Jag loggar in med BankID när du säger till.
Uppgift: lägg till SNI-koden för programvaruutgivning på mitt aktiebolag Stonebite.

1. Gå till https://www.verksamt.se → Logga in → Mina sidor.
2. Hitta "Ändra uppgifter" / "Skatteverket – ändra företagsuppgifter" (heter ibland
   "Ändra verksamhet/SNI").
3. Lägg till SNI-kod 58290 "Utgivning av annan programvara" som BI-verksamhet.
   Behåll nuvarande huvudverksamhet (e-handel) som huvudkod.
4. Verksamhetsbeskrivning, lägg till meningen:
   "Utveckling och försäljning av programvara som prenumerationstjänst (SaaS), bland annat appar för Shopify."
5. Skicka in. Kostnad ska vara 0 kr — kostar det något, STOPPA och fråga mig.
6. Skärmbild av bekräftelsen → visa mig.
Gissa aldrig — fråga mig om ett steg ser annorlunda ut.
```

## 6. Granska och stresstesta appen (Claude Code / Cowork, ny session)

```
Du är en erfaren Shopify-apputvecklare och en krävande handlare på samma gång.
Repo: axel3738/yognftnfgn, gren claude/bäverbutiken-settkopplingen-nba21z, mapp pnl-app/.
Läs pnl-app/CLAUDE.md först (hela). Appen är StonePNL, live i App Store.

Del 1 — Granska (skriv rapporten till pnl-app/docs/granskning-<datum>.md):
1. Gå igenom varje sida som en NY handlare med tom butik: vad är förvirrande, vad saknar
   förklaring, var ser siffror ut att vara sanna fast de är ofullständiga? Lista per sida.
2. Jämför funktionslistan mot Juicy, TrueProfit, BeProfit och Lifetimely (sök på webben).
   Vad har alla fyra som vi saknar? Vad har vi som ingen av dem har? Rangordna efter
   hur ofta handlare nämner det i recensioner.
3. Prestanda: hitta varje ställe där en sida väntar synkront på Shopify/Meta/Frankfurter.
   Regeln i CLAUDE.md: servera databasen, uppdatera i bakgrunden.
4. Datasanning: hitta varje ställe där ett fel kan bli en nolla eller ett saknat värde
   kan se ut som "inget hände". Regeln: en misslyckad hämtning får aldrig skriva ett värde.
5. Onboarding: räkna klick från installation till första sanna vinstsiffra. Föreslå hur
   det halveras.
Varje fynd: fil, rad, vad som händer, vad handlaren ser, förslag. Inga stilsynpunkter.

Del 2 — Stresstesta (på testbutiken stonepnl-test, aldrig på riktiga butiker):
6. Skapa 300 testordrar över 90 dagar med Shopify Admin API (blandat: 1–4 rader,
   återbetalningar, avbrutna, gästkassa och återkommande kunder). Använd butikens
   testläge (Bogus gateway).
7. Öppna panelen på 7/30/90 dagar och mät laddtid med ett vanligt stoppur i
   webbläsarens nätverksflik. Något över 3 s på cachad vy är ett fynd.
8. Ta bort Meta-token → panelen måste flagga saknad annonskostnad, aldrig visa grönt.
9. Sätt SCOPES utan read_customers på testtjänsten → panelen ska fungera exakt som förut
   och LTV-sidan ska förklara varför den är tom.
10. Kör 3 samtidiga sidladdningar av 90-dagarsvyn → ingen "already in progress"-krasch.
11. Kör npm run typecheck, bygget och npm test. Allt ska vara grönt.
Rapportera alla fynd i samma fil, sorterade: det som ger fel siffra först, sedan det som
kostar tid, sedan det som är förvirrande. Ändra ingen kod i den här sessionen — bara
rapporten. Svara Axel enligt svarsformatet i CLAUDE.md.
```

## 7. Sänk basic-planen till 5 USD/mån

Priset ligger i Dev Dashboard (managed pricing), inte i koden. Koden är redan
uppdaterad på alla ställen som visar priset för handlaren (2026-09-10).

```
Du styr min webbläsare. Jag är inloggad på partners.shopify.com
(kan omdirigera till dev.shopify.com — fortsätt där).
Uppgift: sänk priset på den publika planen "basic" i min app StonePNL
från 10 USD till 5 USD per månad.

1. Öppna Apps → StonePNL → Distribution → Manage listing → Pricing.
   Syns inte Pricing: Published languages → Edit (English) → Pricing content → Manage.
2. Leta upp den publika planen med handle "basic" (10 USD/månad, 14 dagars prov).
3. Försök redigera planen: sätt Monthly charge / Price = 5.00 USD.
   Behåll 14 dagars prov och alla feature-rader oförändrade.
4. Går priset INTE att ändra på en befintlig plan (fältet är låst eller Shopify
   säger att planen har prenumeranter):
   a. Skapa i stället en NY publik plan: pris 5.00 USD per månad, 14 dagars prov,
      samma feature-rader som basic, display name "Basic".
   b. Dölj/pensionera den gamla basic-planen på det sätt Shopify erbjuder
      (t.ex. "Hide from new merchants", "Archive" eller ta bort den från
      listningen) så att nya handlare bara ser 5-dollarsplanen.
   c. Ta INTE bort den gamla planen om Shopify varnar att befintliga
      prenumeranter påverkas — fråga mig först.
5. Rör INTE planerna "pro" (14,99 USD), "shopify-test" (0 USD) eller
   "friends-50" (4,99 USD).
6. Om Shopify kräver att listningen skickas in på nytt: klicka Submit/Skicka.
7. Ta en skärmbild av prissidan när alla planer syns, och berätta för mig:
   - gick priset att ändra i befintlig plan, eller skapades en ny plan?
   - står det något om befintliga prenumeranter (behåller de gamla priset)?
   - hur många aktiva prenumeranter appen har, om siffran syns någonstans.
Fråga mig om ett fält saknas eller ser annorlunda ut — gissa inte.
```

**Efter att Cowork är klar:** skriv in utfallet i `CLAUDE.md` (avsnittet om
planerna) — särskilt om priset gick att ändra i befintlig plan eller om en ny
plan skapades, och vad som hände med befintliga prenumeranter.

---

# Meta-godkännandet (ads_read) — prompt 8 till 12

Bakgrunden och hela ansökan står i `docs/meta-app-review.md`. Kör prompterna
i ordning. **8 och 9 kan köras samma minut; 10 måste vara godkänd innan 12
går att skicka in.**

Tre saker kan Cowork INTE göra, och de är Axels:
- ladda upp registreringsbevis och kontoutdrag (dokument bara han har),
- ladda upp appikonen 1024 × 1024 px,
- spela in skärminspelningen och skapa testkontot (Facebook kräver telefon).

## 8. Railway: nyckeln som gör granskarsidan synlig

```
Du styr min webbläsare. Jag är inloggad på railway.app.
Uppgift: lägg till två miljövariabler på EN tjänst.

1. Öppna projektet och klicka på tjänsten pnl-app-store.
2. Klicka Variables.
3. Klicka New Variable. Namn: META_REVIEW_KEY
   Värde: generera själv en slumpmässig sträng på 40 tecken, bara a-z, A-Z och 0-9.
   Klicka Add.
4. Klicka New Variable. Namn: SUPPORT_EMAIL
   Klicka i värdefältet och STANNA. Säg till mig: "Skriv supportadressen." Jag skriver den själv.
   Klicka Add när jag sagt klar.
5. Vänta tills Railway visar en ny deploy som Active (ca 2 minuter).
6. Öppna i en ny flik:
   https://pnl-app-store-production.up.railway.app/healthz
   Läs upp vad som står efter "build". Det ska stå meta-granskning-v86 eller senare.
7. Öppna i en ny flik:
   https://pnl-app-store-production.up.railway.app/meta/granska?key=NYCKELN
   där NYCKELN är strängen du genererade i steg 3.
   Det ska komma upp en sida med rubriken "StonePNL — ad account access test"
   och en blå knapp "Continue with Facebook". Kommer det upp "Not Found" är nyckeln fel inklistrad.

TILL SIST, VIKTIGAST: skriv ut hela META_REVIEW_KEY-strängen till mig i chatten.
Jag behöver den till ansökan hos Meta. Ändra inga andra variabler.
```

Spara nyckeln Cowork skriver ut. Den behövs i prompt 11 och 12.

## 8b. META_APP_ID och META_APP_SECRET saknas på App Store-tjänsten

> **Upptäckt 2026-09-12** när prompt 8 kördes: `/meta/granska` svarade
> "Not configured". `metaLoginConfig()` returnerar null utan `META_APP_ID`,
> `META_APP_SECRET` **och** `TOKEN_ENCRYPTION_KEY`. Variabellistan på
> pnl-app-store visade META_REVIEW_KEY men inga META_APP_*.
>
> Det betyder att knappen "Logga in med Facebook" **aldrig har funnits** i
> App Store-versionen av appen — den döljs helt utan variablerna. De fem egna
> butikernas tjänster har dem sedan tidigare.
>
> ⚠ `TOKEN_ENCRYPTION_KEY` måste vara **exakt samma sträng på alla sex
> tjänster**. De delar en databas: en annan nyckel gör sparade Meta-nycklar
> oläsbara för de andra tjänsterna och ändrar kundhashen i LTV:n för alltid.

```
Du styr min webbläsare. Jag är inloggad på railway.app.
Uppgift: kopiera tre miljövariabler från en tjänst till en annan i samma projekt.

VIKTIGT: läs ALDRIG upp värdena i chatten och skriv dem aldrig i ett meddelande.
Använd kopiera/klistra in. Säg bara om det gick eller inte.

1. Öppna projektet och klicka på tjänsten beautiful-curiosity.
2. Klicka Variables.
3. Leta upp META_APP_ID. Klicka de tre prickarna på raden och välj Copy (eller visa värdet och markera det).
4. Öppna tjänsten PNL App store → Variables → New Variable.
   Namn: META_APP_ID. Klistra in värdet. Klicka Add.
5. Gå tillbaka till beautiful-curiosity och gör samma sak med META_APP_SECRET.
   Lägg in den på PNL App store som META_APP_SECRET.
6. Kontrollera om PNL App store redan har TOKEN_ENCRYPTION_KEY.
   - Finns den redan: rör den INTE.
   - Saknas den: kopiera den från beautiful-curiosity på samma sätt och lägg in den.
7. Finns META_LOGIN_CONFIG_ID på beautiful-curiosity: kopiera även den. Saknas den: hoppa över.
8. Klicka Deploy Changes. Läs upp för mig vilka variabelnamn som står i dialogen innan du bekräftar.
9. Vänta tills deployen är Active (ca 2 minuter).
10. Öppna https://pnl-app-store-production.up.railway.app/meta/granska?key=NYCKELN
    (jag ger dig NYCKELN) och berätta vad rubriken på sidan är.
    Det ska stå "StonePNL — ad account access test" med en blå knapp "Continue with Facebook".

Ändra inga andra variabler. Står det fortfarande "Not configured": säg det, gissa inte.
```

## 9. Meta-appen: alla fält som krävs före inlämning

```
Du styr min webbläsare. Jag är inloggad på developers.facebook.com.
Uppgift: fyll i fälten som krävs för att min app ska få skickas in på granskning.

1. Öppna https://developers.facebook.com/apps och klicka på appen StonePNL.
2. Vänstermenyn: Appinställningar → Grundläggande (App Settings → Basic).
3. Sekretesspolicyns URL (Privacy Policy URL), klistra in:
   https://pnl-app-store-production.up.railway.app/privacy
4. Användarvillkorens URL lämnas tom om den är tom.
5. Kategori (Category): välj Business.
6. Appikon: säg till mig "Ladda upp ikonen" och vänta — jag har filen.
7. Kontakt-e-post: klicka i fältet och säg till mig, jag skriver adressen själv.
8. Rulla ner till "Radering av användardata" (User Data Deletion).
   Välj alternativet Callback-webbadress för dataradering (Data Deletion Callback URL).
   Klistra in: https://pnl-app-store-production.up.railway.app/meta/deletion
9. Klicka Spara ändringar.
10. Vänstermenyn: Appinställningar → Avancerat (Advanced).
    Fältet Callback-URL för avauktorisering (Deauthorize Callback URL), klistra in:
    https://pnl-app-store-production.up.railway.app/meta/deauth
    Klicka Spara ändringar.
11. Vänstermenyn: Facebook-inloggning → Inställningar (Facebook Login → Settings).
    Under "Giltiga OAuth-omdirigerings-URI:er" ska denna rad finnas:
    https://pnl-app-store-production.up.railway.app/meta/callback
    Saknas den: lägg till den. Ta INTE bort rader som redan står där.
    Klicka Spara ändringar.
12. Kontrollera att "Kräv apphemlighet" (Require App Secret) är AV. Är den PÅ: stäng av den.
13. Ta en skärmbild av Grundläggande-sidan och en av Avancerat-sidan och visa mig.

Rör inga andra fält. Heter ett fält något annat än jag skrivit: fråga mig, gissa inte.
```

## 10. Företagsverifiering (måste vara klar före prompt 12)

```
Du styr min webbläsare. Jag är inloggad på business.facebook.com.
Uppgift: starta verifieringen av mitt företag. Jag har dokumenten och laddar upp dem själv.

1. Klicka kugghjulet Inställningar nere till vänster.
2. Klicka Företagsinfo (Business Info).
3. Leta upp Företagsverifiering (Business Verification) och klicka Starta verifiering.
4. Läs upp för mig vilka fält som ska fyllas i, ett i taget, och vänta på mitt svar
   innan du skriver något. Företagsnamn och adress måste bli EXAKT som på
   registreringsbeviset — gissa aldrig ett tecken.
5. När du kommer till dokumentuppladdning: säg "Ladda upp registreringsbeviset" och vänta.
   Sedan "Ladda upp kontoutdrag eller faktura" och vänta.
6. Läs upp hela sammanfattningen för mig INNAN du klickar Skicka in.
7. Klicka Skicka in när jag sagt ja.
8. Ta en skärmbild av kvittot och visa mig.

Om verifieringen redan är godkänd eller ligger i "Under granskning": ändra ingenting,
säg bara vilken status som står och ta en skärmbild.
```

## 11. Testkontot till granskaren

Facebook kräver telefonverifiering för ett nytt konto — det steget gör Axel
själv. Cowork gör resten.

```
Du styr min webbläsare.
Uppgift: ge mitt testkonto tillgång till ett annonskonto. Jag har redan skapat kontot.

1. Gå till business.facebook.com och klicka kugghjulet Inställningar.
2. Klicka Personer (People).
3. Klicka Lägg till (Add).
4. Säg till mig "Skriv testkontots e-post" och vänta. Jag skriver adressen.
5. Välj rollen Anställd (Employee).
6. Gå vidare till tillgångar, välj Annonskonton, och kryssa i ett annonskonto SOM HAR
   ANNONSDATA i sig. Fråga mig vilket om du är osäker.
7. Ge behörigheten "Visa prestanda" (View Performance) — inte full kontroll.
8. Klicka Bjud in / Lägg till.
9. Ta en skärmbild och visa mig.

Skapa aldrig ett nytt Facebook-konto själv. Ge aldrig full kontroll över ett annonskonto.
```

## 12. Skicka in App Review för ads_read

Kör den här SIST, när prompt 10 är godkänd och videon är inspelad.

```
Du styr min webbläsare. Jag är inloggad på developers.facebook.com.
Uppgift: skicka in min app StonePNL på granskning för behörigheten ads_read.

1. Öppna https://developers.facebook.com/apps och klicka på appen StonePNL.
2. Vänstermenyn: App Review → Permissions and Features (Behörigheter och funktioner).
3. Sök fram ads_read i listan.
4. Klicka Request Advanced Access (Begär avancerad åtkomst) på raden ads_read.
5. Säg till mig "Klistra in motiveringen" och vänta — jag har texten färdig.
6. När du kommer till uppladdning av skärminspelning: säg "Ladda upp videon" och vänta.
7. Under testinloggning / test credentials: säg "Skriv testkontots e-post och lösenord"
   och vänta. Jag skriver dem.
8. Läs upp HELA formuläret för mig innan du klickar Submit for Review.
9. Klicka Submit for Review när jag sagt ja.
10. Ta en skärmbild av bekräftelsen och visa mig.

Begär BARA ads_read. Kryssa aldrig i ads_management eller någon annan behörighet —
en blandad ansökan avslås i sin helhet. Fråga mig om något fält ser annorlunda ut.
```

## 13. Efter godkännandet: slå på Live

```
Du styr min webbläsare. Jag är inloggad på developers.facebook.com.
Uppgift: sätt appen StonePNL i Live-läge.

1. Öppna https://developers.facebook.com/apps och klicka på appen StonePNL.
2. Högst upp finns ett reglage som står på Utveckling (Development).
3. Dra det till Live.
4. Kommer det upp en ruta som säger att något saknas: läs upp exakt vad som står
   och STOPPA. Fyll inte i något själv.
5. Bekräfta i rutan om den bara ber om bekräftelse.
6. Ta en skärmbild som visar att reglaget står på Live och visa mig.
```

Efter det fungerar "Logga in med Facebook" för utomstående handlare.
Skriv in datumet i `CLAUDE.md`.
