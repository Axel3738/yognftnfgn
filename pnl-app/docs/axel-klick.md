# Axels klick efter bygget 2026-09-08

Koden för Meta-knappen, växelkursen, Juicy-flytten och LTV-planen ligger i
repot. Fyra saker kräver Axels konton och kan inte göras via API.
I ordning — de två första gör att allt nytt börjar fungera för egna butiker,
de två sista gör det tillgängligt för externa handlare.

## 1. Meta-app (för knappen "Koppla Meta")

developers.facebook.com → **Mina appar** → **Skapa app** → typ **Företag**.

1. Namn: `PNL` (syns för handlaren i inloggningsrutan).
2. Lägg till produkten **Facebook-inloggning för företag** (Facebook Login for Business).
3. Inställningar för inloggningen → **Giltiga OAuth-omdirigerings-URI:er**:
   `https://<app-domän>/meta/callback` — en rad per Railway-tjänst (PNL, PNL2, PNL3).
4. **Appinställningar → Grundläggande**: kopiera **App-ID** och **Apphemlighet**.
5. Railway → varje tjänst → **Variables**:
   `META_APP_ID` = App-ID, `META_APP_SECRET` = Apphemlighet. Deploya om.

Knappen syns i appen så fort variablerna är satta. I **utvecklingsläge**
fungerar den bara för Facebook-konton som har en roll i Meta-appen (Axel
själv + de som läggs till under **Approller**). Det räcker för egna butiker.

## 2. Nya Shopify-behörigheter (för kundvärdet)

Två scopes till: `read_customers` och `read_all_orders`.

1. Railway → varje tjänst → **Variables** → `SCOPES` =
   `read_products,read_orders,read_inventory,read_reports,write_inventory,read_customers,read_all_orders`
2. Partner-dashboarden → appen → **Konfiguration** → samma scopes → **Spara** → **Släpp version**.
3. Öppna appen i varje butik en gång — Shopify frågar om de nya behörigheterna, tryck **Godkänn**.
4. Partner-dashboarden → appen → **API-åtkomst** → **Protected customer data access** →
   begär **nivå 1** (bara kund-ID, inga namn/adresser). Motivering finns i
   `app-store.md` under "Protected Customer Data" — lägg till raden:
   *"Kund-ID används för att gruppera ordrar per kund i kundvärdesanalysen (LTV).
   Inga andra kundfält efterfrågas."*
   Godkännandet är oftast automatiskt för nivå 1.

Utan steg 4 visar LTV-sidan ett rött fel med texten "Shopify nekade frågan" —
det är det som betyder att godkännandet inte gått igenom ännu.

## 3. Meta App Review (för externa handlare)

Först när knappen ska fungera för andra än dig själv. Tar 2–6 veckor.

1. Meta-appen → **Appgranskning** → **Behörigheter och funktioner** → `ads_read` →
   **Begär avancerad åtkomst**.
2. Kräver **Företagsverifiering** (Business Verification) av Stonebite —
   registreringsbevis + faktura/utdrag med adress.
3. Ladda upp **skärminspelningen** som visar: öppna appen → Inställningar →
   Koppla Meta → välj annonskonto → annonskostnad syns i panelen.
   (Videon du spelar in för token-vägen funkar som stomme — lägg till knappen.)
4. Integritetspolicy-URL: `https://<app-domän>/privacy`. Finns redan.

## 4. Planen "Standard + LTV" i App Store-listningen

Koden har planen (14,99 USD/mån = 9,99 + 5). Shopify läser planerna ur koden
när handlaren trycker på knappen, så inget behöver skapas i Partners. Men
listningen ska nämna den:

1. Partner-dashboarden → appen → **Distribution** → **App Store-listning** → **Prissättning**.
2. Lägg till plan 2: *Standard + LTV*, 14,99 USD/mån, 7 dagars prov, punkt:
   "Kundvärde (LTV) per kohort med 12-månadersprognos".
3. Skicka listningen på nytt (listningsändringar granskas snabbt, inte hela appen).
