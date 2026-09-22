# stonebite/ — bolagets egen sajt

Två saker i samma program:

1. **Den publika sidan** (`stonebite.org`) — vad Stonebite Ecom AB gör och vilka
   butiker vi driver. Inga siffror om försäljning, inga kunduppgifter.
2. **Det inloggade** (`/app`) — tolv sidor: Översikt, Butiker, Annonser,
   Produkttest, Redigerare, Kundtjänst, Recensioner, Leverans, Bonus, System,
   Min sida och Konton. **Rollen bestämmer hur mycket man ser.**

Noll npm-beroenden. Node ≥ 20. Ingen byggkedja, ingen databas, inga externa
anrop från sidan (inga typsnitt, ingen analytics) — allt renderas på servern.

---

## Kom igång på 30 sekunder

```bash
node stonebite/hamta.mjs      # hämtar färsk data (Shopify + Meta + repot)
npm run sida                  # startar sajten på http://localhost:4000
```

Första gången finns inget konto. Öppna `/kom-igang` och skapa ägarkontot — den
sidan stänger sig själv i samma sekund som kontot finns. Alla andra konton
lägger ägaren till inne på sidan **Konton**.

```bash
npm run sida:hamta -- --utan-nat   # bygg om snapshoten utan Shopify/Meta
npm run sida:hamta -- --dagar 14   # kortare fönster
npm test                            # 111 tester för sajten och bonusen
```

---

## Rollerna

| Roll | Ser | Ser INTE |
|---|---|---|
| **Ägare** | Allt: pengar, annonser, folk, bonus, konton | — |
| **Chef** | Allt utom vem som får logga in | Konton |
| **Produkttest** | Produkttest-trappan + sin egen sida | Spend, omsättning, andras pengar |
| **Videoredigerare** | Topplistan + sin egen sida | **Spend, ROAS, omsättning, break-even, satsen** |
| **Head of customer support** | Kundtjänst, recensioner, leverans, hela teamets bonus, godkänner insatser | All ekonomi |
| **Kundtjänst (VA)** | Ärenden, tvister, paket, recensioner + sina egna uppdrag och pengar | All ekonomi, andras bonus |

Behörigheten sitter i `roller.mjs` och kontrolleras av servern vid **varje**
sidvisning — menyn är bara en spegling. En redigerare som gissar `/app/annonser`
skickas till sin egen startsida, och ett test bevisar det
(`test/server.test.mjs`).

⚠️ Att redigerare aldrig ser spend är Axels beslut 2026-09-02, samma regel som
topplistan. Satsen (0,4 %) räknas som spend: med belopp **och** sats går spenden
att räkna ut baklänges. Den visas därför bara för ägare och chef.

### Två språk

Ägare och chef får svenska, alla andra engelska — samma regel som gäller i
chatten (CLAUDE.md). Var och en byter själv på Min sida. Ordboken
(`sprak.mjs`) är hela meningar svenska → engelska; saknas en rad visas
svenskan och sidan går aldrig sönder. Komponenterna översätter sina egna
etiketter men **aldrig datan** — butiksnamn, kampanjnamn och kundtext ser
likadana ut på båda språken.

---

## Bonusen

Varje roll utom ägare och chef har ett bonusprogram, och Min sida är byggd för
att få folk att jaga det: siffran de tjänat överst, uppdragen med belopp under,
en färdig text att kopiera, och en veckoräknare. Motorn ligger i `bonus/` —
se `bonus/README.md`. Sajten räknar den vid varje hämtning.

Ingen godkänner sina egna pengar: en VA rapporterar in en insats, ägaren,
chefen eller Head of support godkänner den på sidan Bonus.

---

## Så hänger datan ihop

```
Shopify ─┐
Meta ────┼─→  hamta.mjs  ─→  data/snapshot.json  ─→  server.mjs  ─→  sidan
repot ───┘     (minuter)         (en fil)            (millisekunder)
```

Hämtning och visning är **med flit** två olika saker. Shopify och Meta är
långsamma och strypta; en sida som hämtade vid varje besök hade tagit minuter
och slagit i Metas kod 17. Sidan visar alltid när datan hämtades, och varje
källa rapporterar sitt eget läge på sidan **Drift**.

- `kallor/shopify.mjs` — försäljning per butik och dag. Butikerna **upptäcks**
  (sparning/butiker.json + factory/butiker/*.yaml + varje `SHOPIFY_SHOP_*` i
  miljön som har nycklar bredvid sig). Ingen handskriven lista.
- `kallor/meta.mjs` — spend, köp och ROAS per konto och kampanj. Läs-bart.
- `kallor/repo.mjs` — det rutinerna redan skrivit: topplistan, kundtjänstens
  veckorapport, spårningen, nattvaktens beslut.
- `bonus/kor.mjs` — recensioner (Judge.me), produkttest (Notion), tvister och
  veckomått → vad varje person tjänat den här månaden.
- `data.mjs` — härleder perioder och summor. `berakna.mjs` — alla tal.

### Regler som sitter i koden

- **Valutor summeras aldrig ihop.** SEK, NOK, DKK och EUR står var för sig.
- **Ingen procent på ett halvt dygn.** Dagens tal jämförs aldrig i procent mot
  gårdagens hela dygn — bara hela veckor mot hela veckor.
- **Försäljning minus reklam räknas bara när alla butiker gick att läsa.**
  Annars jämförs hela reklamkostnaden med en del av försäljningen, och siffran
  blir fel åt minus-hållet. Då står det varför i stället.
- **ROAS kommer ur Meta**, inte ur vår egen division.
- **Rangordning på vinstbidrag**, aldrig på ROAS eller CPA ensamt
  (`docs/os/ANALYSMETOD.md`). Under 300 kr spend eller 3 köp ställs ingen dom.
- **Saknad data skrivs ut med orsak.** Aldrig en nolla som ser ut som ett svar.

---

## Säkerhet

- Lösenord: **scrypt** med eget salt. Filen `data/anvandare.json` går inte att
  logga in med och är gitignorerad.
- Session: signerad kaka (HMAC-SHA256), `HttpOnly`, `SameSite=Lax`, `Secure`
  bakom HTTPS. Lösenordsbyte och avstängning dödar gamla kakor direkt.
- CSRF-nyckel i varje formulär.
- Fem inloggningsförsök per adress och IP, sedan fem minuters vila.
- `Content-Security-Policy` utan `unsafe-inline` för skript (nonce per svar),
  `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy`.
- Felmeddelandet vid inloggning säger aldrig om det var adressen eller
  lösenordet som var fel.

**Hemligheten** som signerar kakorna: `STONEBITE_HEMLIGHET` (minst 16 tecken).
Saknas den skapas `data/hemlighet.txt` lokalt (gitignorerad). Byts hemligheten
loggas alla ut — det är meningen.

---

## Filerna

| Fil | Vad |
|---|---|
| `server.mjs` | HTTP, routing, sessioner, rollspärrar |
| `auth.mjs` | Lösenord, kakor, CSRF, strypning |
| `anvandare.mjs` | Kontoregistret (`data/anvandare.json`) |
| `roller.mjs` | **Vem ser vad** — fyra roller, en tabell |
| `hamta.mjs` | Bygger `data/snapshot.json` |
| `data.mjs` | Snapshot → färdiga tal |
| `berakna.mjs` | Alla siffror och all formatering |
| `forklaring.mjs` | Teknisk text → svenska (API-fel, kategorier) |
| `profil.json` | Företagsfakta + texten på publika sidan |
| `system.json` | Kartan över allt som är byggt — sidan /app/system |
| `sprak.mjs` | Svenska ↔ engelska. Rollen väljer, användaren kan byta |
| `vy/` | Sidorna. `delar.mjs` är byggklossarna, `layout.mjs` skalet |
| `webb/` | `stil.css`, `app.js`, märket. Inga externa anrop |

---

## Lägga upp den på stonebite.org

Sajten är en vanlig Node-process som lyssnar på `PORT`. Den kan köras var som
helst som kör Node (Railway, Fly, en VPS).

1. **Start:** `npm start` (= `node stonebite/server.mjs`). Railway, Fly och
   Render kör `npm start` av sig själva — inget startkommando behöver skrivas in.
2. **Miljövariabler:** `STONEBITE_HEMLIGHET` (obligatorisk i drift),
   `PORT` (sätts oftast av plattformen), `STONEBITE_ANVANDARE` (sökväg till
   kontofilen).
3. ⚠️ **Föränderliga filer måste ligga på en disk som överlever en ny version.**
   Containern byts vid varje deploy. Sätt `STONEBITE_DATA=/data` och
   `STONEBITE_ANVANDARE=/data/anvandare.json` mot en monterad volym — annars
   försvinner konton, inrapporterade bonusinsatser och personer som lagts till
   på sajten vid nästa deploy.
   Färdig instruktion för Cowork: `stonebite/COWORK-PROMPT.md`.
4. **Domänen:** peka `stonebite.org` på tjänsten och låt plattformen sköta
   TLS. Servern sätter HSTS när den ser `X-Forwarded-Proto: https`.
5. **Färsk data:** `data/snapshot.json` committas till `main`. Rutinen är
   kommandot `/stonebite` (`.claude/commands/stonebite.md`): den hämtar,
   räknar bonusen, committar och pushar — samma mönster som spårningen och
   kundtjänsten. Deployen tar med den nya filen.

`/halsa` svarar med JSON (läge + när datan hämtades) och kräver ingen inloggning
— använd den som health check.

---

## I drift (2026-09-21)

| | |
|---|---|
| Adress | **https://www.stonebite.org** — `stonebite.org` skickas vidare dit (302) tills ALIAS-posten är inlagd (`cowork/3-rot.txt`) |
| Direktadress | `https://yognftnfgn-production-cfb8.up.railway.app` — felsök alltid här först |
| Railway | projekt `strong-solace`, tjänst `yognftnfgn`, branch `main`, volym `/data` |
| DNS | Squarespace (namnservrar `ns-cloud-e*.googledomains.com`) |
| Mejl | Google Workspace, `MX 1 smtp.google.com` — **rör aldrig MX, SPF, DKIM** |

⚠️ Roten kan inte vara en CNAME: Squarespace tillåter inte CNAME på `@` och
Railway ger ingen A-post. Vägen är Squarespaces posttyp **ALIAS** på `@` mot
Railways rotvärde — prompten `cowork/3-rot.txt` gör det (tar bort
vidarebefordran + Squarespaces fyra A-poster, rör aldrig MX/SPF/DKIM).

## Den publika sidan (ombyggd 2026-09-21 kväll)

Tre grenar visas: **e-handeln**, **YouTube-kanalen**
(`profil.youtube`, https://www.youtube.com/@Stonebite.channel — vloggar,
tutorials, lifestyle; en egen verksamhet bolaget lägger tid, utrustning och
resor på) och **konsulttjänsterna** på `/tjanster` (`profil.tjanster`: tolv
områden med AI först — agenter som gör riktigt arbete, AI-producerat innehåll,
automatisering — sedan e-handeln, rådgivning och en öppen "Något annat?";
"Så jobbar vi"; kontaktruta → `kontakt.epost`). Allt kommer ur `profil.json`;
tom `youtube.url` ⇒ texten står kvar men ingen knapp. Startsidans teaser visar
de tre första områdena, så ordningen i listan är ett val.

**Bilderna** (`webb/bilder/*.jpg`, 50–190 kB) genereras av
`node stonebite/bilder.mjs` ur `bilder.json` via kie.ai — abstrakta,
futuristiska, utan text, människor, logotyper eller produkter som går att
känna igen. En bild som finns hoppas över; `--igen <id>` gör om en.
Sajten har inga externa anrop, så bilderna ligger i repot.

**Rörelsen** (`stil.css` → "publik sida: rörelse", `app.js`): heron stiger
upp vid laddning, block scrollas fram (`.avslojas` + IntersectionObserver,
gömda bara när `html.js` finns), glödande orber driver bakom heron, ett band
med orden rullar, bilder lutar sig mot pekaren (bara mus). Allt stängs av
med `prefers-reduced-motion`. Ingen rörelse bär information.

⚠️ Inte ett butiksnamn, inte en domän, inte ett antal på någon publik sida —
testet "publika sidan nämner inte en enda butik" går över både `/` och
`/tjanster`.

⚠️ Certifikatet går inte att kontrollera från en claude.ai-container — proxyn
MITM:ar HTTPS och visar alltid Anthropics eget cert. Kolla i en webbläsare
eller i Railway → Settings → Domains.

## Baksidan: varumärken, rutinvakt, kalender, kontakter (2026-09-22)

Axels beställning: "en MAIN flik för varje varumärke … alla rutiner, riktigt
bra strukturerat, som uppdaterar varje dag och visar så att inget är CP …
koppla eskaleringskanalen … en flik i varje brand med influencers och
UGC-kreatörer … en liten kalender i varje brand … och en personlig kalender,
som Google Calendar fast bättre, simpel". Målet: han ska slippa klicka runt
och bara ha high-leverage-uppgifter.

| Del | Fil | Vad |
|---|---|---|
| **Varumärkena** | `varumarken.json`, `vy/varumarke.mjs` | Fem kort (Bäverbutiken, Grillkliniken, Matstrumpor, CaraShell, övriga OPS). Registret knyter butiks-id:n, annonskonton (hela eller per kampanjprefix i delade konton), kundtjänstens brand, spårningens butik, Discord-servern och rutinerna. `/app/varumarke/<id>?flik=` med flikarna Översikt · Butiker · Annonser · Kundtjänst · Leverans · Rutiner · Kontakter · Kalender. Översikten säger **Kräver dig / Kommer hända / Hände senast**. Det som inte går att läsa står med orsak (`*_saknas`-fälten). |
| **Rutinvakten** | `rutiner.json`, `kallor/rutiner.mjs` | Varje rutin: schema i svensk tid + vilket spår den lämnar på main (commit-rubrik, sökväg, eller "ingen" när den inte pushar). `hamta.mjs` läser 14 dagars git-logg och dömer: ok (≤ 1,5 intervall) · sen (≤ 3) · saknas · avstängd (flaggad, men ett färskt spår vinner över flaggan) · omätbar. Ingen hämtning kan göra en rutin grön — bara ett spår. ⚠️ Rutinens session är en grund klon (~7 h historik): `fordjupaHistorik()` fördjupar den till fönstret först (`git fetch --shallow-since`), och räcker historiken ändå inte blir "inget spår" *går inte att mäta*, aldrig *saknas* — läget står som `delvis` med orsaken över tabellen. |
| **Eskaleringskanalen** | `kallor/discord.mjs` | Boten läser de senaste 12 meddelandena i varje varumärkes kanaler (customer-service/support, ads, konton …). Kundadresser maskeras innan de sparas. Människor de senaste 48 h räknas som "något att titta på". |
| **Kalendern** | `kalender.mjs`, `vy/kalender.mjs` | `data/kalender.jsonl` på volymen. En rad: skriv "Ring leverantören imorgon kl 14" — datumordet vinner över datumfältet (imorgon, fredag, 15/10, den 3 januari, om 3 dagar, kl 14). Härledda rader (tvistdeadlines, rutiner som ska köra, kontakters nästa steg, commissions kördagar) ligger i samma lista och kan inte bockas av. Alla roller har en egen kalender; varumärkesrader kräver ägare/chef. |
| **Kontakterna** | `kontakter.mjs` | `data/kontakter.jsonl`. Typ (influencer, UGC, leverantör, partner), plattform, länk (bara http/https), läge (att kontakta → levererat/nej), nästa steg + datum → hamnar i kalendern. |
| **Kräver dig i dag** | `vy/oversikt.mjs` | Överst på Översikt: brådskande tvister, saknade/sena rutiner, människor i eskaleringskanalerna det senaste dygnet, dagens och försenade kalenderrader — över alla varumärken. |

⚠️ Sådant som inte går att koppla i dag står i registret med orsak:
Grillklinikens Shopify (inga nycklar) och SnarkLös-kontot (token når det inte),
Matstrumpors konto "nya kungen" (token nekas), kundtjänstens brevlådor för
Grillkliniken/CaraShell/Matstrumpor (ingen brandfil). Bank, kort och
överföringar har ingen datakälla — de läggs in som **Larm** i kalendern för hand.

## Vad som INTE är byggt än

- Ingen glömt-lösenord-funktion (ägaren sätter ett nytt på sidan Konton).
- Ingen tvåfaktor.
- ~~Rutinen som kör `/stonebite` varje timme~~ — **byggd 2026-09-22** på
  Barkås-kontot: trigger `trig_01QwKgfZP3JdhZX6tbGo1LJb`, fast session
  `session_01PBEszeiGu5Qe2Lu5Je1p9T`, cron `4 * * * *`. Snapshoten går till
  `main` varje timme och Railway bygger om.
- Trustpilot läses inte automatiskt: deras publika sida svarar 403 på maskiner.
  Med `TRUSTPILOT_API_KEY` + `TRUSTPILOT_BUSINESS_UNITS` går det; tills dess
  rapporterar VA:n in recensionen med länk och chefen godkänner.
- Bäverbutikens försäljning saknas i sajten tills Shopify-appen fått
  godkännande för kunddata (`read_orders`). Sidan säger det rakt ut i stället
  för att visa noll.
