# Koppla Meta till annonskostnaden

Panelen läser annonskostnad per dag från Metas Marketing API. Det finns två
vägar in. Den första är den som handlare ska använda; den andra finns kvar som
reserv.

## Väg 1 — Logga in med Facebook (standard sedan 2026-09-07)

Appen → **Inställningar** → **Logga in med Facebook**.

1. Ett fönster öppnas med Metas inloggning. Godkänn läsåtkomst till annonser
   (`ads_read`).
2. Fönstret säger **Kopplat** och stänger sig självt.
3. Tillbaka i Inställningar finns nu rullistan **Annonskonto** med alla konton
   inloggningen kan se. Välj rätt konto och tryck **Spara**.

Finns exakt ett annonskonto väljs det direkt — då säger fönstret **Klart** och
steg 3 behövs inte. Rullistan sparar valet i samma sekund det görs.

Token från inloggningen lever ~60 dagar och appen förnyar den i bakgrunden
(tokenvakten, `token-keeper.server.ts`). Meta kräver ändå en **ny inloggning
senast ~90 dagar efter den förra** (dataåtkomsten flyttas bara av
inloggningsdialogen). Panelen varnar 14 dagar innan och visar rött efteråt —
åtgärden är alltid ett klick på **Logga in igen**.

Bockar man ur "Annonser" i Facebooks dialog sparas ingenting; fönstret säger
det och nästa inloggning frågar igen.

### Vad servern behöver (Railway → Variables, på VARJE tjänst)

| Variabel | Värde |
| --- | --- |
| `META_APP_ID` | App-ID från Meta for Developers → appen → Appinställningar → Grundläggande |
| `META_APP_SECRET` | Apphemligheten från samma sida |
| `META_LOGIN_CONFIG_ID` | *Valfri.* Bara när Meta-appen använder "Facebook Login for Business" (config-ID under Facebook Login for Business → Konfigurationer). Välj konfigurationstypen **User access token** och lägg `ads_read` i konfigurationen. Vanliga appar med produkten Facebook Login behöver den inte |

Utan `META_APP_ID`/`META_APP_SECRET` visas inte knappen, och allt fungerar som
förut (väg 2). Sätts bara den ena vägrar appen starta med ett tydligt fel.

### Vad Meta-appen behöver

Meta for Developers → appen → **Facebook Login** (eller Facebook Login for
Business) → **Inställningar** → **Giltiga OAuth-omdirigerings-URI:er**. En rad
per tjänst, exakt `https://<tjänstens domän>/meta/callback`:

```
https://beautiful-curiosity-production-134f.up.railway.app/meta/callback
https://yognftnfgn-production-17a1.up.railway.app/meta/callback
https://yognftnfgn-copy-production.up.railway.app/meta/callback
https://pnl-uk-production.up.railway.app/meta/callback
https://pnl-app-store-production.up.railway.app/meta/callback
```

(Danmarks tjänst saknas i listan tills dess Railway-domän är känd. Sätt
`META_APP_ID`/`META_APP_SECRET` på en tjänst först när dess adress står i
listan — annars svarar Facebook "URL blocked" i fönstret.)

I Meta-appens Facebook Login-inställningar: **Use Strict Mode for Redirect
URIs** på, och **Client OAuth Login** (implicit flow) av om det går — appen
använder bara kod-flödet. Tas en Railway-tjänst bort: ta bort dess rad ur
listan samma dag; `*.up.railway.app`-namn kan tas över av andra.

Servern kräver också `TOKEN_ENCRYPTION_KEY` — utan den visas inte knappen,
eftersom inloggningen annars hade sparat token i klartext.

För Axels egna annonskonton räcker det att Meta-appen är i utvecklingsläge —
alla med en roll i appen (admin, utvecklare, testare) kan logga in. För
**andra handlare** (StonePNL i App Store) krävs att appen är i live-läge med:

1. **Privacy Policy-URL** — `https://pnl-app-store-production.up.railway.app/privacy`
2. **Data Deletion-URL** (instruktioner eller callback) — kan peka på samma
   sida tills en egen finns
3. **Business Verification** av företaget som äger Meta-appen
4. **App Review** med **Advanced Access** på `ads_read`

Tills dess ser externa handlare "appen är inte tillgänglig" i fönstret
(Facebook skickar aldrig tillbaka; Settings säger "Inget svar kom från
Facebook") och får använda väg 2.

I Meta-appen: **Appinställningar → Avancerat → "Require App Secret" ska vara
AV** — anropen skickar ingen `appsecret_proof`, och de inklistrade tokensen
kommer från en annan Meta-app.

### Så hänger det ihop (för den som felsöker)

- Knappen skapar en engångsrad (`MetaLoginState`, 10 min) via en inloggad
  action, öppnar ett fönster mot `/meta/start?state=…`.
- `/meta/start` sätter en cookie (`meta_login`, bara `/meta`) och skickar
  vidare till Metas dialog med `redirect_uri = <SHOPIFY_APP_URL>/meta/callback`.
- `/meta/callback` kräver att både state-raden och cookien stämmer, förbrukar
  raden, byter koden mot en kortlivad token och den mot en long-lived, läser
  namnet på den inloggade och sparar allt krypterat på butiken
  (`metaAccessToken`, `metaTokenExpiresAt`, `metaTokenSource = "login"`,
  `metaUserName`). Annonskontot rörs inte — det väljs i Inställningar.
- Båda rutterna är resursrutter utan Shopify-auth (fönstret har ingen
  session). Utan giltig state-rad svarar de bara med en felsida.

## Väg 2 — Klistra in en token för hand (reserv)

Fungerar som förut och behövs för systemanvändare eller när inloggningen ovan
inte är tillgänglig. I Inställningar ligger fälten under **Klistra in en token
för hand i stället**.

1. **Graph API Explorer** → `developers.facebook.com/tools/explorer`
2. **Meta App**: `Claude API ADs uploader` (app-ID `101664773466718`)
3. **Behörigheter**: lägg till `ads_read`
4. **Generate Access Token** → godkänn i dialogen
5. Kopiera token
6. **Access Token Debugger** → `developers.facebook.com/tools/debug/accesstoken`
7. Klistra in token → **Felsök** → längst ner: **Förläng åtkomsttoken**
8. Kopiera den *förlängda* token (60 dagar) — det är den som ska in i appen

Annonskonto-ID i fältet ovanför (rullistan visas även för en inklistrad
token, så länge den kan lista konton):

| Butik | Annonskonto | ID |
| --- | --- | --- |
| Bäverbutiken | MagiBorsten | `1867947880635861` |
| Grillkliniken / Mastern | SnarkLös | `1346450049878358` |

Samma token fungerar för båda kontona så länge ditt Meta-konto har åtkomst till
dem — det är kontot, inte annonskontot, som token tillhör. Token sparas per
butik, så den måste klistras in i varje installation.

Ett tomt token-fält betyder "behåll den befintliga" — fältet raderar aldrig en
sparad token av misstag. Cachad annonskostnad rensas bara när **annonskontot
byts** — inte vid en ny token för samma konto eller en språkändring.

Systemanvändare via Business Manager kräver att appen ligger i portföljen, och
`Claude API ADs uploader` gör inte det — försöket att göra anspråk på appen gav
fel. Använd Explorer-vägen ovan.

## När token gått ut

Annonskostnaden slutar uppdateras. Panelen räknar då **inte** de dagarna som
noll — de flaggas istället som saknad data, täckningsbidraget markeras som
ofullständigt och en röd banner listar dagarna. Det är designat så med flit:
en tyst nolla ser ut som en fantastisk vinstmarginal.

Åtgärd: **Logga in igen** (väg 1) eller gör om stegen i väg 2.

## Koppla bort

**Koppla bort Meta** i Inställningar tar bort token, annonskonto och cachad
annonskostnad för butiken. `shop/redact` gör samma sak vid avinstallation.
