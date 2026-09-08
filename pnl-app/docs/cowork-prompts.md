# Cowork-prompter — klick Axel inte behöver göra själv

Axel klistrar in en ruta i taget i Cowork (Claude med webbläsarstyrning).
Varje prompt är fristående. Underlag: `foretag-admin.md`, `CLAUDE.md`
("Axel måste göra"). Skrivet 2026-09-08.

## 1. Pro-planen (Partner Dashboard)

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

## 3. Nya behörigheter (scopes) för kundvärdet

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

```
Du styr min webbläsare. Jag är inloggad på railway.app.
Uppgift: uppdatera miljövariabler på mina PNL-tjänster.

För VARJE tjänst i projektet (beautiful-curiosity, yognftnfgn-production, yognftnfgn-copy, pnl-uk, Danmark-tjänsten, pnl-app-store):
1. Öppna tjänsten → Variables.
2. Ändra SCOPES till exakt:
   read_products,read_orders,read_inventory,read_reports,write_inventory,read_customers,read_all_orders
3. Deploy om tjänsten om Railway inte gör det själv.

BARA på tjänsten pnl-app-store (App Store-versionen):
4. Lägg till PLAN_GATE = 1
5. Lägg till APP_HANDLE = <app-handle från listningens URL, t.ex. "stonepnl">

Ta en skärmbild av variabellistan per tjänst och visa mig. Ändra inga andra variabler.
```

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
