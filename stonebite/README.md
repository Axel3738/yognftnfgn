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
| **Chef — ser ALL ekonomi** | Allt utom vem som får logga in | Konton |
| **Produkttest** | Produkttest-trappan + sin egen sida | Spend, omsättning, andras pengar |
| **Videoredigerare** | Topplistan + sin egen sida | **Spend, ROAS, omsättning, break-even, satsen** |
| **Head of customer support — ingen ekonomi** | Kundtjänst, recensioner, leverans, hela teamets bonus, godkänner insatser | All ekonomi |
| **Kundtjänst (VA)** | Ärenden, tvister, paket, recensioner + sina egna uppdrag och pengar | All ekonomi, andras bonus |

⚠️ **Fel roll på ett konto är det enda som läcker ekonomi — och det hände
2026-09-23.** Mechiles konto stod som **Chef** (rollen låg direkt under Ägare i
listan och heter nästan som hennes titel), och hon såg Översikt med dygnets
omsättning, spend och ROAS för alla butiker. Spärren i `roller.mjs` var rätt;
kontot hade fel roll. Sedan samma dag: rollnamnen säger själva om de ser
ekonomi, ett konto med ekonomiroll märks rött ("ser all ekonomi") på Konton,
och **Ägare/Chef går bara att sätta med kryssrutan "ge all ekonomi" ibockad**
— både vid nytt konto och vid rollbyte, annars felruta och ingen ändring
(`serEkonomi`/`ekonomiVarning` i `roller.mjs`, testat i `server.test.mjs`).
Rollen läses ur kontofilen vid **varje** sidvisning, så ett byte på Konton
slår igenom på personens nästa sidladdning utan ny inloggning.

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
- `kallor/shopify.mjs` `hamtaAllaTvister` — **tvisterna direkt ur Shopify i
  varje hämtning** (sedan 2026-09-23; tidigare ur kundtjänstens veckorapport,
  som stod still sedan 2026-09-14). 180 dagar bakåt + allt som fortfarande är
  öppet, paginerat, ordernamnen i en fråga. Per butik: `ok` (lista kan vara
  tom — då HAR butiken inga tvister), `saknas` (kör inte Shopify Payments)
  eller `fel` med orsak. Läget står i `snapshot.tvister`, raderna i
  `oppnaTvister`. Veckorapportens rader används bara för en butik Shopify inte
  svarade för, märkta `kalla: 'veckorapport'` (`bonus/kallor.mjs`
  `slaIhopTvister`). `under review` (bevisen inne) pingas, kalenderförs och
  räknas som brådskande aldrig.
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
6. **Kundtjänstboten dygnet runt (`autosvar-vakt.mjs`, 2026-09-22):** Axels
   krav är svar till arga kunder inom 60 sekunder, och en rutin på claude.ai
   kör som tätast en gång i timmen. Därför startar servern minutservern
   (`node kundtjanst/autosvar.mjs --brand … --torr --loop 60`) som barnprocess
   när **`AUTOSVAR_BRANDS`** är satt (t.ex. `baverbutiken`), och startar om
   den när den dör (paus 30 s → 600 s). `AUTOSVAR_LAGE=skarpt` krävs
   uttryckligen för att skicka — annars utkast. `AUTOSVAR_LOOP` (min 30),
   `AUTOSVAR_DISCORD=1` för rapporten i `#customer-service`. Loggen — minnet
   "ett svar per tråd någonsin" — skrivs på volymen (`AUTOSVAR_LOGGMAPP`,
   standard `<STONEBITE_DATA>/autosvar/logg`), och sajten läser samma mapp
   **live** vid varje sidvisning (volymens butiker vinner över snapshotens).
   Saknas `KUNDTJANST_MAIL_PASS_<ID>` startar vakten inte och säger vilket.
   ⚠️ **Vakten startar BARA på Railway** (`RAILWAY_*` i miljön) eller med
   `AUTOSVAR_VAKT=1` uttryckligen — mätt 2026-09-22: med `AUTOSVAR_BRANDS` och
   lösenordet i claude.ai-miljön blev en provstart av servern i en session en
   riktig bot mot brevlådan i sex sekunder. `npm run sida` lokalt ska aldrig
   kunna bli en andra bot.
   Nycklarna boten behöver på tjänsten: `KUNDTJANST_MAIL_PASS_<ID>`,
   `SHOPIFY_SHOP/CLIENT_ID/CLIENT_SECRET_BAVERBUTIKEN_EMAILSCRAPER`,
   `TRACK17_API_KEY`. Prompten för Cowork: `cowork/5-autosvar.txt`.
   ⚠️ När vakten är på kör ingen session `autosvar.mjs` mot samma brevlåda
   för hand — två kopior är ett dubbelsvar.

`/halsa` svarar med JSON (läge + när datan hämtades + `autosvar`: vaktens
status eller `null` när den är av) och kräver ingen inloggning — använd den
som health check.

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

⚠️ **Deployen kan ligga timmar efter `main`** (mätt 2026-09-22 kväll): fyra
andra Railway-projekt bygger samma repo vid varje push, rutinerna pushar 7–8
gånger i timmen, och sajtens deployer står i "Waiting for build slot" i över
en timme. `/halsa` visar vilken snapshot som faktiskt kör — jämför med
senaste `Stonebite: färsk data`-commiten på `main` innan du tror att en
ändring är live. Prompten `cowork/4-byggko.txt` rensar bort dubblettprojekten
(rör aldrig `strong-solace` eller StonePNL).

## Den publika sidan (ombyggd 2026-09-21 kväll)

Två grenar visas: **e-handeln** och **YouTube-kanalen**
(`profil.youtube`, https://www.youtube.com/@Stonebite.channel — vloggar,
tutorials, lifestyle; en egen verksamhet bolaget lägger tid, utrustning och
resor på). Allt kommer ur `profil.json`; tom `youtube.url` ⇒ texten står kvar
men ingen knapp.

**Konsultsidan är borttagen (2026-09-22).** Axel: "jag vill inte sälja några
tjänster eller mentorskap eller någonting, jag vill bara ha information om
mitt företag". `/tjanster` svarar 301 till `/influencers`, och testet "publika
sidan säljer inga tjänster" stoppar orden konsult, mentorskap, rådgivning och
tjänster på varje publik sida.

**Det enda bolaget erbjuder andra: mikroinfluencers** på `/influencers`
(`vy/influencers.mjs`, `profil.influencers`). Butiker som redan kör e-handel
och vill ha influencers mejlar butik + produkt och får kontaktuppgifter till
mikroinfluencers (5 000–20 000 kr per samarbete) samma dag. Betalning: fast
pris i förskott (`pris.fast`) **eller** 10 % av det de totalt lägger på
influencers (`pris.andel`) — kunden väljer, köp = mejla `kontakt.epost`.
Beloppen står bara i profilen; ett tomt belopp ⇒ det alternativet ritas inte.
Startsidan har en mörk teaser (`influencerTeaser`) med samma punkter, menyn
och sidfoten säger "Influencers". ⚠️ Axel sa "20 tusen eller 30 tusen" om det
fasta priset — 20 000 står tills han bestämt.

Servern läser `profil.json` från disk vid varje visning; snapshotens kopia är
bara reserv. (Förut vann snapshoten, så en textändring syntes först när
timrutinen skrivit om den — upp till en timme efter deployen.)

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
`/influencers`.

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
| **Pingen till VA:n** | `larm.mjs`, `data/larm.json` | Körs av `/stonebite` efter hämtningen (Axels beslut 2026-09-22, alternativ A). Två regler: en människa skrev i en eskaleringskanal utan svar från någon annan på 2 h ⇒ ping i kanalen med länk; öppen tvist med deadline inom 3 dagar ⇒ ping i varumärkets eskaleringskanal. En gång per ärende (minnet committas, 30 dagar). Mottagare: `support_chef`/`va` med `discord.id` i `bonus/personer.json`. Engelska, `allowed_mentions` låst till mottagarna. `--torr` visar utan att posta. |
| **Autosvaret på sajten** | `hamta.mjs` → `snapshot.autosvar`, `vy/drift.mjs` → `autosvarBlock` | Kundtjänstbotens logg (`kundtjanst/autosvar/logg/<butik>.jsonl`, committad i repot) via `kundtjanst/dashboard.mjs samlaAutosvar` — talen är `oversikt.mjs`:s, aldrig omräknade. Visas på **Kundtjänst** (alla butiker, det VA:n ser), i varumärkets **Kundtjänst**-flik och som rader i **Kräver dig i dag** (arga kunder senaste dygnet). Per butik: läget i klartext — *skickar svar* / *bara utkast — inget skickas* / *inget svar skrivet* / **kunde inte skriva i brevlådan** (rött, vinner över allt annat när loggen har rader med `atgard: fel` — en bot som inte FÅR skriva i Roundcube såg annars exakt ut som en som inget hade att skriva; tillagt 2026-09-22 efter första Railway-varvet) — senaste körning, mejl lästa, skickade, utkast, till VA:n, skrivfel; sedan **korten "AI-boten har svarat"** (ombyggt 2026-09-23 efter Axels dom "väldigt blek text, inget att interagera med" — Mechile hade svarat en kund utan att se botens svar): ett kort per mejl boten svarat på, ENKEL och ARG, badge med ord, ordernumret stort, "Vad boten skrev", "Nästa steg för dig", på arga kunder klockan "Svar lovat senast" (48 h från botens svar, `ESKALERING_TIMMAR` ur `svar.mjs`), knappen **Markera som uppföljd** (`POST /app/autosvar/uppfoljd`, `uppfoljning.mjs` → `data/autosvar-uppfoljning.jsonl` på volymen, nyckel = sha256 av Message-ID ur `oversikt.mjs fallNyckel`; botens logg rörs aldrig), fyra högar: *Att följa upp* (arga överst, äldst först), *Boten svarade klart*, *Uppföljda (arkiv)* med Ångra, *Torrkörningens utkast* (kunden fick inget). Ett uppföljt kort lämnar "Kräver dig i dag". Ingen logg ⇒ "Autosvaret har inte kört", aldrig noll. Axels beställning 2026-09-22: "alla cases som AI-botten har svarat på, där det är arga kunder, ska komma upp som en lista på kundtjänst-taben". |
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

---

## Evolve-frågorna om baksidan (2026-09-26)

Axel vill veta vad de bästa e-handlarna trackar i sina dashboards och med sina anställda,
var team misslyckas och hur det ska synas, och hur dashboarden kan bygga teamet.
Frågorna till Evolve-boten, tre meddelanden under 2 000 tecken, står i `stonebite/evolve/FRAGOR.md` (engelska,
utan butiks- och personnamn). Luckorna bakom dem, med datakälla och byggplan per lucka, står i
`stonebite/evolve/LUCKOR.md`. Svaren sparas i `stonebite/evolve/SVAR.md` när de kommer.

## MER per verksamhet på Översikt (2026-09-26)

Evolve-kursens första tal för ägaren (`stonebite/evolve/SVAR.md`): **MER = all försäljning ÷ all
reklam**, 7 hela dygn till och med i går, per verksamhet ur `varumarken.json`. Räknas i
`data.mjs` → `verksamheter()` och `merTotalt()`, visas i `vy/oversikt.mjs` (tabellen
"Försäljning mot reklam, per verksamhet" och kortet "MER 7 dagar"), bara för ägare och chef.

- Försäljning i NOK, DKK och EUR räknas om till kronor med **ECB:s dagskurs**
  (`kallor/valuta.mjs`, `snapshot.valutakurser`). Kursen och datumet står under tabellen.
  Frankfurter svarade 520/522 från containern 2026-09-26, ECB svarade.
- MER räknas bara när **alla** butiker och konton i verksamheten gick att läsa. Annars "–"
  med orsak. Kortet räknar bara verksamheter som är kompletta och säger vilka som saknas.
- Tre fel rättade samma dag: (1) "Kvar efter reklam i dag" drog ALLA SEK-konton från de
  svenska butikerna, också Norges, Grillklinikens och CaraShells reklam; (2) delade konton
  matchade `prefix`/`utom` med startsWith, så CaraShells UK-kampanjer ("AU LISTICLE Taköverdrag
  CARASHELL") räknades som Bäverbutikens, ~107 000 kr på sju dagar (`kampanjTillhor`, också i
  varumärkesflikarna); (3) kontots vecka var "de sju sista raderna", men Metas serie hoppar
  över dagar utan spend (`kontoLage` väljer nu på datum).
- Matstrumpors konto "nya kungen" svarar på `act_<id>` men listas inte av `me/adaccounts`.
  `hamtaAllt({ extraIds })` hämtar kontona ur `varumarken.json` uttryckligen.
- 11 tester i `test/mer.test.mjs`.

## Riktig vinst per verksamhet (2026-09-26, steg 1b)

Tabellen "Riktig vinst per verksamhet, 7 dagar" och kortet "Vinstbidrag 7 dagar" på Översikt,
bara för ägare och chef. Evolve-kursens formel: **vinstbidrag = försäljning utan moms −
varukostnad − betalavgifter − reklam**.

- `kallor/vinst.mjs` hämtar per butik och dag (8 dygn, bara dagssummor i snapshoten):
  netto utan moms (Shopifys "current"-belopp, återbetalningar redan avdragna), varukostnad =
  **"Cost per item"** i Shopify × sålt antal, och Shopify Payments avgifter per transaktion.
- Två appar kan behövas per butik: Bäverbutikens kundtjänstapp får läsa ordrar men inte
  produkter, fabrikens tvärtom. Kostnaden kopplas då via SKU och i sista hand namn (`kostnadFor`).
- En verksamhet räknas inte om **mer än 1 %** av försäljningen saknar Cost per item
  (`TAK_UTAN_KOSTNAD`). Sidan skriver vilka produkter som ska fyllas i.
- Betalt utan avgiftsdata (PayPal m.fl.) syns som belopp under tabellen: där är vinsten något för hög.
- ⚠️ Frakten från leverantören ingår bara om den ligger i Cost per item. Fasta kostnader
  (löner, appar) är inte avdragna.
- Mätt 2026-09-26 (7 dygn): Bäverbutiken 228 365 kr (26,1 %), CaraShell 62 343 kr (13,7 %),
  Matstrumpor räknas inte (39 % av försäljningen saknar Cost per item: ätpinnar och strumporna).
- 11 tester i `test/vinst.test.mjs`.
