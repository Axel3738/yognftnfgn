# StonePNL — företagsadmin: vänrabatt, SNI-kod, byrån och månadsrutinen

Skriven 2026-09-08. Underlag: research + faktagranskning samma dag.

**Så läser du märkningarna**

| Märke | Betyder |
|---|---|
| **[verifierat]** | Läst i källtext (repo, officiellt Shopify-kodrepo eller spegel av officiell text). |
| **[snippet]** | Bygger på sökträff eller andrahandskälla. Källan kunde inte läsas i fulltext — proxyn blockerar shopify.dev, help.shopify.com, skatteverket.se, bolagsverket.se, verksamt.se, scb.se m.fl. |
| **[okänt]** | Ingen källa alls. Måste läsas av i skarp vy eller frågas. |

Regel för hela dokumentet: inga siffror är påhittade. Står det ett belopp finns källan i del C.

---

## A. Vänrabatt 50 % för alltid

### Vad som gäller

- StonePNL använder **Shopify App Pricing** (hette "managed pricing" fram till maj 2026). Planer, priser och prov ligger i Partner Dashboard. Appen får inte anropa Billing API. **[verifierat]** — Shopifys eget kodrepo shopify-app-js.
- Det finns **inga rabattkoder** för app-prenumerationer. Rabatt görs manuellt per butik, och bara efter att butiken redan prenumererar. **[snippet]** — community.shopify.dev, feature request öppen.
- Rabattformuläret i Partner Dashboard rapporterades **trasigt i maj 2026** (knappen **Create** går inte att klicka). Ingen fix hittad. **[snippet]** — två forumtrådar 2026-05-12 och 2026-05-14. Läge i september: **[okänt]**.
- En **privat plan** har eget pris, syns inte i App Store, och gäller bara för de butiker du skriver in (max 20 butiker per plan, max 15 privata planer). **[verifierat]** — changelog 2026-07-09 via feed-spegel + oberoende utvecklarloggar 2026.
- Priset kan sättas till vad som helst, även $0. **[snippet]** — utvecklarlogg 2026-07-22 ("Shopify auto-provisions a $0 private test plan").

### Rekommenderad väg: en privat plan "Friends" för $4.99

Varför denna väg:
- Rabatten är evig av konstruktion. Det är ett eget pris, ingen rabattlogik som kan löpa ut.
- Den beror inte på rabattfunktionen som rapporterats trasig.
- Vännen byter själv plan på Shopifys plan-sida. Du gör klicken en gång.
- Plats för 20 vänner per plan.

Nackdelar:
- Vännen måste själv välja planen och godkänna. Han får en text av dig (se nedan).
- När Pro-planen ($14.99) finns behövs en till privat plan, "Friends Pro" för $7.49.
- Exakta knappnamn i planredigeraren är inte lästa i skarp vy. **[snippet]**

### Axels klick — skapa planen

Ett klick per rad. Fetstil = det du letar efter.

1. Gå till **partners.shopify.com** och logga in.
2. Hamnar du på **dev.shopify.com** i stället: fortsätt där. Skärmarna för Distribution och Pricing är desamma. **[snippet]** — utvecklarlogg 2026-07-22.
3. Klicka **Apps** i vänstermenyn. Heter den **App distribution**: klicka den och sen **All apps**. **[snippet]**
4. Klicka **StonePNL**.
5. Klicka **Distribution**.
6. Bredvid **Shopify App Store listing**, klicka **Manage listing**.
7. Leta efter **Pricing**. Syns den inte: klicka **Published languages**, sen **Edit** vid engelska, sen **Pricing content**, sen **Manage**. **[snippet]** — två oberoende utvecklarloggar 2026 visar den längre vägen.
8. Rulla ner till **Private plans**.
9. Klicka **Add**. **[snippet]** — knappen heter troligen **Add**, inte "Add plan".
10. Under **Billing** välj **Monthly**.
11. Under **Monthly charge** skriv **4.99**.
12. Under **Free trial duration** skriv **0**. **[snippet]** — fältet finns enligt utvecklarlogg; värdet är ditt val.
13. Vid butikslistan (heter troligen **Stores with plan access** eller liknande): skriv vännens adress, till exempel **butiksnamn.myshopify.com**. **[okänt]** — fältets exakta namn är inte bekräftat.
14. Klicka **Save**.
15. Tillbaka på Pricing-sidan: skriv **Friends 50%** under **Display name** för den nya planen. **[snippet]** — Display name sätts efter första Save.
16. Klicka **Save** igen.

### Axels klick — texten till vännen

Skicka vännen exakt detta:

> Öppna **StonePNL** i din Shopify-admin.
> Klicka på knappen för att välja plan.
> Välj **Friends 50%**.
> Klicka **Approve**.

Knappnamnen på plan-sidan är inte lästa i skarp vy. **[okänt]**

Plan-sidan har adressen `https://admin.shopify.com/store/<butiksnamn>/charges/<app-handle>/pricing_plans`. **[verifierat]** — Shopifys kodrepo shopify-app-js. StonePNL:s app-handle står inte i repot (`shopify.app.toml` saknar `handle`-rad) **[verifierat]** — den måste läsas i Partner/Dev Dashboard. **[okänt]**

### Axels klick — kontrollera efter första fakturan

1. Gå till **partners.shopify.com**.
2. Sök vännens butiksnamn i sökrutan.
3. Klicka namnet under **Store**.
4. Läs att prenumerationen står på **Friends 50%**.

### När Pro-planen finns

Gör om steg 8–16 ovan.
Namn: **Friends Pro 50%**. Pris: **7.49**.

### Alternativ, om den privata planen inte går att skapa

| Väg | Fungerar? | Kommentar |
|---|---|---|
| **B. 50 % rabatt på befintlig prenumeration** (butik → **Discount** → **Create**) | Rapporterat trasig maj 2026 **[snippet]** | Gäller från nästa debitering. Skatt och avgifter räknas på rabatterat pris **[verifierat, äldre doc-spegel]**. Om rabatten följer med vid planbyte Standard → Pro: **[okänt]**. Om formuläret tillåter "för alltid": **[okänt]** — bara API-texten säger "limitless". |
| **C. Privat plan $0 för egna butiker** (Bäverbutiken, HeimGuard) | Samma klick som väg A | Inget förbud hittat i Partner Program Agreement (version 2024-12-30) **[verifierat, spegel]**. Nyare avtal: **[okänt]**. |
| **D. Trial extension** (butik → **Trial extension** → **Create**) | Fungerade maj 2026 **[snippet]** | Tillfällig. Måste upprepas. Shopify räknar förbrukade provdagar över 180 dagar **[snippet]**. |
| **E. App credits** (butik → **App credits** → **Send**) | Fungerar **[verifierat, äldre doc-spegel]** | Engångsbelopp. Får inte överstiga dina väntande utbetalningar — har du inga utbetalningar på väg går det inte. Dras från din intäkt. Vännen ser beloppet under Billing i sin admin. |
| **F. Kryssrutan "Free for partners and developers"** | Löser inte uppgiften | Gäller bara development stores, inte riktiga butiker. **[snippet]** |

### Vad en vänrabatt kostar dig

- Revenue share: 0 % på de första 1 000 000 USD livstidsintäkt från 2025-01-01, 15 % därefter. **[snippet, två oberoende 2026-källor]**
- Processing fee 2,9 % på all fakturering plus tillämplig moms. **[snippet, blogg som uppger kontroll mot shopify.dev 2026-08-06]**
- Engångsavgift 19 USD för Partner-kontot. **[snippet]**
- Alltså: vännen på $4.99 ger dig cirka $4.85 per 30 dagar före moms. Halva Standard-priset i utebliven intäkt.

---

## B. SNI-kod — planen, steg för steg

### Så enkelt som möjligt

Skatteverket har en lista där alla företag står med en kod för vad de gör. Koden heter **SNI-kod**.

Stonebite har i dag en kod för e-handel. Nu säljer bolaget också en app. Då ska en kod till läggas till.

- **Vilken kod:** **58.290 — Utgivning av annan programvara**. **[verifierat, SCB-härledd kodlista för SNI 2025]**
- **Varför den:** Den koden är för företag som gör sin egen programvara och säljer den till många kunder som prenumeration. SCB:s eget exempel för koden lyder "utgivning av generella programvaror, mjukvaror, appar". **[snippet, SCB-citat via kodlista]**
- **Varför inte 62.100 Dataprogrammering:** Den är för att bygga program på beställning åt en kund. SCB:s text utesluter uttryckligen egen programvara för utgivning. **[snippet]**
- **Varför inte 63.100 Hosting:** Den är för att drifta andras program. **[snippet]**
- **Huvudkod eller bikod:** E-handeln är störst, så den förblir huvudkod. 58.290 blir bikod. Huvudkoden styrs av vilken verksamhet som har störst omsättning. **[snippet, ingen oberoende källa]**
- **Kodsystemet bytte version 2025-12-08** (SNI 2025). 58.290 behåller sitt nummer. **[verifierat, SCB-härledd lista]**

### Var man klickar

- SNI-koden ändras hos **Skatteverket**, via **verksamt.se**. Inte hos Bolagsverket. **[snippet]**
- Det kostar **0 kr**. **[snippet]**
- Det går på **sekunder** att skicka in. **[snippet]** Hur lång tid Skatteverket tar på sig att registrera: **[okänt]**.
- Knappnamnen nedan är inte lästa i skarp vy. **[okänt]**

Axels klick:

1. Gå till **verksamt.se**.
2. Klicka **Logga in**.
3. Logga in med **BankID**.
4. Klicka **Mina sidor**.
5. Välj **Stonebite**.
6. Klicka **Ändra företagsuppgifter**.
7. Klicka **Lägg till SNI-kod**.
8. Skriv **58290**.
9. Välj **Utgivning av annan programvara**.
10. Låt e-handelskoden stå kvar som huvudkod.
11. Klicka **Skicka in**.

### Bolagsordningen — en sak till att kolla

Bolaget har ett papper som heter **bolagsordning**. Där står vad bolaget får göra.

- Täcker texten inte "programvara" måste den ändras. Det kräver ett stämmobeslut och en anmälan till **Bolagsverket**. Ändringen gäller först när Bolagsverket registrerat den. **[snippet, stämmer med ABL 3 kap]**
- Kostnad: **cirka 1 000–1 300 kr** i e-tjänsten. Två källor säger olika (1 000 respektive 1 100 kr). Beloppet visas i e-tjänsten innan du betalar. **[snippet, motstridigt]**
- Handläggningstid hos Bolagsverket: **[okänt]**.
- Det här gör byrån åt dig. Du godkänner med BankID.

Axels klick:

1. Öppna bolagsordningen.
2. Hitta punkten **Verksamhet**.
3. Kopiera texten in i mejlet nedan.
4. Skicka mejlet till byrån.
5. Godkänn med **BankID** när byrån ber dig.

### Så skickas det till redovisningsbyrån — mall-mejl

Kopiera allt mellan strecken. Fyll i det som står i klamrar.

---

**Ämne:** Stonebite — ny verksamhet (Shopify-app), SNI-kod, moms och månadsrutin

Hej [namn],

**1. Ny verksamhet**

Stonebite har sedan 2026-09-05 en app i Shopify App Store som heter StonePNL. Den säljs som prenumeration till andra Shopify-butiker: 9,99 USD per 30 dagar. En dyrare nivå på 14,99 USD är på väg.

Jag vill lägga till SNI-kod **58.290 Utgivning av annan programvara** som bikod. E-handeln förblir huvudkod. Jag gör anmälan själv på verksamt.se om ni inte säger annat.

Vår bolagsordning säger under Verksamhet:

> [klistra in texten här]

**Fråga 1:** Täcker den "utveckling och försäljning av programvara"? Om inte: kan ni skriva stämmoprotokoll och ny lydelse och anmäla ändringen till Bolagsverket? Jag godkänner med BankID.

**2. Så fungerar betalningarna från Shopify**

- Shopify fakturerar butiken som prenumererar. Shopify betalar sedan ut till oss. Vi skickar ingen faktura till slutkunden.
- Shopify drar 2,9 % i processing fee. Revenue share är 0 % upp till 1 000 000 USD i livstidsintäkt.
- Utbetalning två gånger per månad via Hyperwallet, minst 25 USD per utbetalning. Valuta USD.
- Vem som står som avsändare på utbetalningsunderlaget vet jag inte ännu. Det kan vara Shopify International Limited (Irland, VAT IE 3347697KH) eller Shopify Inc. (Kanada). Jag skickar första underlaget så snart det finns.
- Från Shopify kan jag ladda ner en CSV per utbetalning. Den har kolumnerna Shop, Charge ID, Charge Creation Time, Charge Type, Category, Partner Share, Partner Sale, Partner Sale In Payout Currency, Payout Currency. "Partner Sale" är brutto, "Partner Share" är netto efter Shopifys avgift.

**Fråga 2:** Hur ska intäkten redovisas momsmässigt? Är det en tjänst till Shopify som företag i annat EU-land (ruta 39, omvänd skattskyldighet, periodisk sammanställning), eller en tjänst till företag utanför EU (ruta 40)? Eller något annat? Jag vill att ni avgör det när ni sett utbetalningsunderlaget.

**Fråga 3:** Ska intäkten bokföras brutto (Partner Sale) med Shopifys avgift som kostnad, eller netto (Partner Share)?

**Fråga 4:** Vilken växelkurs vill ni att jag använder för USD → SEK? Kursen på utbetalningsdagen, eller den faktiska kursen om jag låter Hyperwallet växla till SEK?

**Fråga 5:** Behöver Stonebite lämna någon amerikansk skatteblankett (W-8BEN-E) till Shopify för att slippa källskatt? Vet ni var det görs?

**3. Månadsrutin — det jag skickar den 1:a varje månad**

- Shopify: CSV-export av månadens utbetalningar plus PDF per utbetalning.
- Railway (hosting av appen): månadens faktura.
- Meta (annonser): kvitto per debitering.
- Allt i ett mejl till er.

Säg till om ni vill ha något mer eller i annat format.

Vänliga hälsningar
Axel

---

### Månadsrutinen — Axels klick den 1:a varje månad

**A. Shopify — utbetalningarna**

Var utbetalningarna ligger efter övergången till Dev Dashboard (2026-01-01) är inte läst i skarp vy. **[snippet/okänt]** Första gången: ta en skärmdump av vänstermenyn och fråga i chatten.

1. Gå till **partners.shopify.com** och logga in.
2. Skickas du vidare till **dev.shopify.com**: leta efter **Payouts** eller **Earnings** i vänstermenyn.
3. Klicka **Payouts**.
4. Klicka **Export CSV**. Spara filen.
5. Klicka på månadens första utbetalning.
6. Klicka **Export**. Filen kommer som e-post. **[snippet]**
7. Gör samma sak med månadens andra utbetalning.

**B. Railway — hostingfakturan**

Verifierat i Railways officiella docs-repo 2026-09-08. **[verifierat]**

1. Gå till **railway.com** och logga in.
2. Klicka på ditt **workspace**.
3. Klicka **Settings**.
4. Klicka **Billing**.
5. Rulla till **Billing History**.
6. Ladda ner månadens faktura.
7. Ska företagsuppgifterna rättas: klicka kugghjulet vid fakturan, sen **Re-issue**. Uppdatera företagsuppgifterna först.

**C. Meta — annonskvitton**

Knappnamnen bygger på tredjepartsguider. **[snippet]**

1. Öppna **Ads Manager**.
2. Klicka **Billing & payments**.
3. Klicka fliken **Transactions**.
4. Välj annonskonto och månaden.
5. Klicka **Download receipt** på varje rad.

**D. Skicka**

1. Lägg alla filer i ett mejl till byrån.
2. Skriv "Underlag [månad]" i ämnesraden.
3. Skicka.

---

## C. Öppna frågor och källor

### Öppna frågor — vänrabatten

1. Exakta knappnamn i planredigeraren 2026: **Add**? **Stores with plan access**? Läs av i skarp vy.
2. Är rabattformulärets bugg från maj 2026 fixad i september?
3. Tillåter rabattformuläret i Partner Dashboard "för alltid", eller bara ett antal cykler?
4. Följer en rabatt med när vännen byter plan Standard → Pro under App Pricing?
5. Får en privat $0-plan användas för egna produktionsbutiker enligt dagens Partner Program Agreement? Avtalsversion 2024-12-30 säger ingenting om det; nyare version ej läst.
6. Vad är StonePNL:s app-handle? Saknas i `shopify.app.toml`. Gissning: sista delen av App Store-länken `apps.shopify.com/<handle>` — inte kontrollerad.
7. Måste vännen ha installerat appen innan hans domän läggs i planens butikslista? Enda ledtråden: utan butikslistan syns inte planen i väljaren.
8. Knapptexterna på plan-valssidan ("Approve"?).

### Öppna frågor — SNI, bolag, moms

1. Vem står på Stonebites payout-underlag: Shopify International Ltd (Irland) eller Shopify Inc. (Kanada)? Avgör ruta 39 vs 40 och periodisk sammanställning. Partner Program Agreement lyder enligt en tredjepartsmatris under Ontario-lag.
2. Vad står i Stonebites bolagsordning under Verksamhet i dag?
3. Bolagsverkets exakta avgift 2026 för bolagsordningsändring (1 000 eller 1 100 kr i e-tjänsten).
4. Menynamnen på verksamt.se ("Mina sidor", "Ändra företagsuppgifter", "Lägg till SNI-kod") — inte lästa.
5. Att huvudkod styrs av störst omsättning — ingen oberoende källa.
6. Har Stonebite lämnat W-8BEN-E i Partner Dashboard? Håller Shopify annars inne 30 %?
7. Var payouts och CSV-export ligger i Dev Dashboard i dag.
8. Utbetalningsschemat "5 bankdagar efter den 15:e / månadsskiftet", Hyperwallets 0,50 % växlingsavgift vid SEK och "30 dagars hold på första handlarbetalningen" — alla tre bara snippet, ej bekräftade.
9. Tar Shopify ut 25 % moms av svenska handlare utan VAT-nr på StonePNL-prenumerationen? Sidan "Taxes on Partner sales" kunde inte läsas.
10. Meta-klicken och behörighetskraven — bara tredjepartsguider.
11. Brutto eller netto i bokföringen — byråns val.

### Öppna frågor — kostnadsförslagen (`kostnadsforslag.json`)

Alla externa listpriser (Shopify-planer, Claude, ChatGPT, Google Workspace, Microsoft 365, Canva, Notion, Slack, Figma, Adobe, Klaviyo, Judge.me, Loox, Vitals, Railway, Vercel, domäner, Fortnox, Bokio, bank, försäkring, arbetsgivaravgift 2026) kunde **inte** verifieras: sökbudgeten var slut och alla prissajter blockerade. De är därför **inte** med i JSON-filen. Kör om spåret i en ny session med sökbudget kvar innan de läggs in. Bara poster med källa i repot eller i läst källtext finns i filen.

### Källförteckning

Alla lästa 2026-09-08 om inget annat anges. **Verifierat** = läst i källtext. **Snippet** = sökträff eller andrahand.

**Repo (verifierat)**
- `claude/bäverbutiken-settkopplingen-nba21z:pnl-app/CLAUDE.md` rad 109–110, 276–278, 282, 337, 361–366 — Standard $9.99, 1 dags prov, godkänd 2026-09-05, växelkurs klar.
- `claude/bäverbutiken-settkopplingen-nba21z:pnl-app/shopify.app.toml` — name, client_id, ingen handle.
- `claude/bäverbutiken-settkopplingen-nba21z:pnl-app/docs/ltv-tillagg.md` rad 4–9, 28–47 — Pro-plan, namnbytet till Shopify App Pricing.
- `claude/bäverbutiken-settkopplingen-nba21z:pnl-app/docs/juicy-import.md` rad 26–28 — Juicy Free/$29/$49 (snippet i repot).
- `main:pnl-app/docs/roadmap.md` rad 70–73, `main:pnl-app/docs/axel-klick.md` rad 55–62 — Pro-plan 14,99 USD, 7 dagars prov.
- `main:pnl-app/README.md` rad 26–37 — Fly.io ~5 USD/mån.
- `factory/rekrytering/jobbannons-video-editor.md` rad 32–48, 60, 106–122 — redigerarlön, standby.
- `factory/PLAN.md` rad 69 — standby 100–200 kr.
- `CLAUDE.md` + `docs/grillkliniken-ekonomi.md` rad 13 — säljer utan moms; commission 0,4 %.

**Shopify, officiella repon och speglar (verifierat i källtext)**
- https://raw.githubusercontent.com/Shopify/shopify-app-js/main/packages/apps/shopify-app-express/docs/reference/guides/managed-pricing.md — plan-vals-URL, ingen billing-konfig.
- https://github.com/Shopify/shopify-app-js (billing/types.ts, CHANGELOG) — namnet Shopify App Pricing.
- https://raw.githubusercontent.com/api-evangelist/shopify-admin/main/blogs/2026-07-09-app-pricing-more-plans-no-charge-plan-testing-and-negative.md — 8 publika / 15 privata planer, gratis i dev stores.
- https://raw.githubusercontent.com/Mayil-AI/shopify_documentation/a3389cf47108c85a2121a39a859bc8be7b293ff6/docs/apps/billing/purchase-adjustments/subscription-discounts/content.txt — rabatt på nästa debitering, avgifter på rabatterat pris (äldre version, ~2024).
- https://raw.githubusercontent.com/Mayil-AI/shopify_documentation/a3389cf47108c85a2121a39a859bc8be7b293ff6/docs/apps/billing/purchase-adjustments/award-app-credits/content.txt — app credits (äldre version).
- https://raw.githubusercontent.com/d-beck/shopify-partner-agreement/main/shopify-partner-agreement.md — Partner Program Agreement, version 2024-12-30.
- https://github.com/railwayapp/docs (content/docs/pricing/refunds.md, faqs.md) — Billing History, Re-issue.

**Shopify, andrahand (snippet)**
- https://raw.githubusercontent.com/Water9977/metalrate-sync/master/TODO.md och architecture.md — klickvägen i Partner Dashboard 2026-07-22, Dev Dashboard-övergång, Hyperwallet.
- https://raw.githubusercontent.com/serebano/bmai-shopify-app/main/docs/review/app-store-review-resolution.md — "Update to App Pricing" 2026-09-02.
- https://raw.githubusercontent.com/aaltintop/printDock/main/docs/DEV_STORE_BILLING_TESTING.md — $0 privata planer, butikslistan styr synlighet, 180-dagarsregeln.
- https://raw.githubusercontent.com/ramyysameh/AR-sunglasses/main/docs/superpowers/specs/2026-07-26-phase5-billing-handoff.md — Dev Dashboard saknade pris-UI för olistad app.
- https://github.com/ZeeshanWaheed11/imisofts.com/blob/main/blog/shopify-app-development-cost-2026/index.html — revenue share, 2,9 %, $19.
- https://github.com/milechy/commerce-faq-tasks/blob/main/docs/SHOPIFY_APP_REQUIREMENTS.md — livstidsgräns 1 000 000 USD.
- https://github.com/subhubapps/lasso-shopify-tools (reducer/README.md + testdata) — kolumnerna i app-earnings-CSV 2026.
- https://github.com/Flintmere/flintmere (memory/compliance-risk/regulatory-matrix.md) — Partner-avtal under Ontario-lag.
- https://github.com/shachafha/Terms-and-Services-RAG, https://github.com/weitzman/difficode — Shopify International Limited, reg.nr 560279, VAT IE 3347697KH (handlarvillkor).
- https://community.shopify.dev/t/managed-pricing-discount-issue/34289 (2026-05-14), https://community.shopify.dev/t/bug-shopify-app-discounts/34211 (2026-05-12) — rabattformuläret trasigt. Ej lästa, blockerade.
- https://community.shopify.dev/t/feature-request-add-ability-to-create-app-subscription-discounts-from-api-in-managed-pricing/22245 — inga rabattkoder. Ej läst.
- https://shopify.dev/docs/apps/launch/billing/shopify-app-pricing/plans, .../offer-subscription-discounts, .../offer-free-trials, .../award-app-credits, .../redirect-plan-selection-page, .../distribution/revenue-share — officiella sidor, alla blockerade; bara sökträffar.
- https://help.shopify.com/en/partners/partner-program/getting-paid, .../manage-payouts-invoices/payouts, .../getting-started/sales-taxes — blockerade; bara sökträffar.

**Sverige: SNI, Bolagsverket, moms**
- https://github.com/klasolsson81/jobbliggaren (Reference/sni-2025.v1.json, sni-aliases-2025.v1.json) — SNI 2025-koder ur SCB:s SNI-sök, SCB-exempeltext för 58290. Verifierat i källtext, SCB-härledd.
- https://github.com/riksbanken/payment-statistics (codelists/codelist_sni.py) — SNI 2007 58.290. Verifierat.
- https://github.com/adamaltmejd/registry-research-toolkit (reg_meta_build/CLASSIFICATIONS.md) — SNI 2025 gäller från 2025-12-08. Snippet.
- https://github.com/rijo01/driva-foretag-se (src/content/juridik/bolagsordning.mdx) — bolagsordningsändring, avgift 1 100/1 300 kr 2026 (internt inkonsekvent sajt). Snippet.
- https://github.com/erp-mafia/accounted (skills swedish-vat, konsult-it, software-saas-ai) — ruta 39/40, konto 3308/3305, art. 9a förordning 282/2011, SKV dnr 202 460649-17/111. Snippet.
- https://snisok.scb.se/58290, /62010, /62100, /63100 — blockerade; bara sökträffar.
- https://www.skatteverket.se/... (SKV 4639, tjänster till EU/utanför EU) — blockerade; bara sökträffar.
- https://bolagsverket.se/foretag/aktiebolag/drivaaktiebolag/andrabolagsordningiaktiebolag.575.html — blockerad; sökträff sa 1 000/1 200 kr.
- https://www.momsens.se/bokfora-forsaljning-av-app-via-google-play — Google Play-analogin. Blockerad; sökträff.

**Meta**
- https://tailride.so/blog/download-meta-ads-invoices, https://kb.orbee.com/download-meta-invoice — klicken. Blockerade; sökträffar.

**Blockerat i sessionen (WebFetch/curl)**
shopify.dev, help.shopify.com, www.shopify.com, apps.shopify.com, community.shopify.dev, community.shopify.com, skatteverket.se, verksamt.se, bolagsverket.se, scb.se, snisok.scb.se, web.archive.org, r.jina.ai, medium.com, reddit.com, wikipedia, alla prissajter (Shopify, Anthropic, OpenAI, Google, Microsoft, Canva, Notion, Slack, Figma, Adobe, Klaviyo, Judge.me, Railway, Vercel, Fly.io, Fortnox, Bokio, bankerna, försäkringsbolagen). WebSearch-budgeten (200/session) var förbrukad innan kostnadsspåret och faktagranskningen startade.
