# Installera panelen på ytterligare en butik

## Butikerna och deras värden

| Butik | myshopify-domän | Valuta | Annonskonto | Status |
| --- | --- | --- | --- | --- |
| Bäverbutiken.se | `4snrw0-mg.myshopify.com` | SEK | MagiBorsten `1867947880635861` | installerad (PNL2) |
| Beverbutikken.no | `1acuam-s5.myshopify.com` | **NOK** | — | ej installerad |
| Grillkliniken | — | — | SnarkLös `1346450049878358` | ej installerad |

Två saker gäller **bara** den norska butiken:

- **Annonskontot måste redovisa i NOK.** Meta rapporterar alltid i annonskontots
  valuta, inte butikens. Kopplar du ett SEK-konto till NOK-butiken drar panelen
  SEK-belopp från NOK-intäkter. Den räknar inte om — den säger ifrån med en röd
  banner, för en gissad växelkurs är samma fel fast osynligt.
- **Tullen är inte 27,50.** Standardvärdet kommer från EU-tullen på $2,90, och
  Norge är inte med i EU. Sätt det som faktiskt tas ut, i NOK.

Installationslänk när app-registreringen är klar:

```
https://admin.shopify.com/store/1acuam-s5/oauth/install?client_id=<Client ID>
```



Koden är redan butiksseparerad: varje fråga mot databasen filtreras på `shop`,
cachen är nycklad per butik, och katalogcachen i minnet likaså. Två butiker kan
därför dela både kodbas och databas utan att siffror kan blandas ihop.

Det som *inte* går att dela är app-registreringen. En app med **anpassad
distribution** får installeras på exakt en butik, och varje registrering har sin
egen Client ID/secret. Servern läser en nyckel per process — alltså behövs en
registrering till och en tjänst till.

Tidsåtgång: ~15 minuter. Kostnad: en extra Railway-tjänst, ca 5 USD/månad.

---

## Steg 1 — Ny app-registrering

`partners.shopify.com` → **Appar** → **Skapa app** → **Skapa app manuellt**.

- Namn: något som säger vilken butik det gäller — `PNL-NO`, `PNL-GRILL`.
  Namnet syns bara för dig.
- Kopiera **Client ID** och **Client secret** — de ska rakt in i Railways
  variabler i steg 2. Aldrig in i repot, aldrig in i en chatt.
- **Distribution** → **Anpassad distribution** → ange butikens
  `.myshopify.com`-domän ur tabellen ovan. (Publik distribution kräver granskning innan appen får
  installeras på en riktig butik — det var det som blockerade första försöket.)

Låt URL-fälten stå tomma så länge; domänen finns inte förrän steg 2 är klart.

## Steg 2 — Ny Railway-tjänst

Railway → samma projekt som `beautiful-curiosity` → **+ New** → **GitHub Repo** →
`yognftnfgn`.

**Settings → Source**
- Branch: `claude/bäverbutiken-settkopplingen-nba21z`
- Root Directory: `pnl-app`

**Settings → Networking** → **Generate Domain**, port `3000`. Notera domänen.

**Variables**

| Variabel | Värde |
| --- | --- |
| `SHOPIFY_API_KEY` | PNL3:s Client ID |
| `SHOPIFY_API_SECRET` | PNL3:s Client secret |
| `SCOPES` | `read_products,read_orders,read_inventory,read_reports,write_inventory` |
| `SHOPIFY_APP_URL` | `https://<nya domänen>` |
| `PORT` | `3000` |
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` |

`DATABASE_URL` sätts som **variabelreferens** till samma Postgres — skriv in
`${{Postgres.DATABASE_URL}}` så pekar den på den befintliga databasen. Det är
säkert: sessioner, inställningar, kostnadshistorik, annonskostnad, cache och
fasta kostnader är alla nycklade på butiksdomänen.

Deploya. Kontrollera `https://<domän>/healthz` → ska svara
`{"ok":true,"build":"…","db":"ok"}`.

## Steg 3 — Fyll i URL:erna i Partner-dashboarden

Tillbaka i PNL3 → **Konfiguration**:

- **App-URL**: `https://<domän>`
- **Tillåtna omdirigerings-URL:er** (alla tre):
  - `https://<domän>/auth/callback`
  - `https://<domän>/auth/shopify/callback`
  - `https://<domän>/api/auth/callback`

Spara, och **Skapa version** / släpp versionen. Utan release ligger den gamla
konfigurationen kvar och inloggningen svarar 410.

## Steg 4 — Installera

Partner-dashboarden → PNL3 → **Välj butik** → installera. Fungerar inte knappen,
gå direkt till:

```
https://admin.shopify.com/store/<grillkliniken-handle>/oauth/install?client_id=<PNL3 Client ID>
```

Dyker dialogen "Begär en app" upp — tryck **Avbryt**. Den handlar om att begära
åtkomst till någon annans app och har inget med installationen att göra.

## Steg 5 — Fyll i butikens siffror

Panelen visar nu en **Kom igång-checklista** på förstasidan med fyra steg. Den
räknar ner allt eftersom och försvinner när den är klar.

1. **Inköpspriser** — Kostnader-fliken. Skrivs till Shopifys egen `unitCost`, så
   de blir butikens egendom och syns även i Shopifys rapporter.
2. **Annonskontot** — Inställningar, kontot ur tabellen överst. Samma
   long-lived token som Bäverbutiken använder fungerar, förutsatt att ditt
   Meta-konto har åtkomst till kontot. Kontot måste redovisa i **samma valuta
   som butiken** — annars flaggar panelen det.
3. **Fasta kostnader** — formuläret ligger direkt i checklistan.
4. **Tull och transaktionsavgift** — standardvärdena (27,50 per order, 2,9 %)
   är Bäverbutikens svenska. Stämmer de inte för den nya butiken, ändra dem.

## Om du senare vill lägga till en tredje butik

Samma tre saker per butik: en app-registrering, en Railway-tjänst, ett
domännamn. Det slutar först när appen ligger publikt i App Store — då räcker
**en** registrering och **en** tjänst för alla butiker, eftersom publik
distribution tillåter installation på hur många butiker som helst. Fram tills
dess är en tjänst per butik den enda vägen som inte kräver Shopifys granskning.
