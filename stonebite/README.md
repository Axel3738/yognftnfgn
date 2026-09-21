# stonebite/ — bolagets egen sajt

Två saker i samma program:

1. **Den publika sidan** (`stonebite.org`) — vad Stonebite Ecom AB gör och vilka
   butiker vi driver. Inga siffror om försäljning, inga kunduppgifter.
2. **Det inloggade** (`/app`) — dashboards för butikerna, annonserna,
   redigerarna, kundtjänsten och leveranserna. **Rollen bestämmer hur mycket
   man ser.**

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
npm test                            # 67 tester, ska vara gröna
```

---

## Rollerna

| Roll | Ser | Ser INTE |
|---|---|---|
| **Ägare** | Allt: pengar, annonser, folk, konton | — |
| **Chef** | Allt utom vem som får logga in | Konton |
| **Redigerare** | Topplistan + sin egen sida | **Spend, ROAS, omsättning, break-even, satsen** |
| **Kundtjänst** | Ärenden, tvister, paket | All ekonomi |

Behörigheten sitter i `roller.mjs` och kontrolleras av servern vid **varje**
sidvisning — menyn är bara en spegling. En redigerare som gissar `/app/annonser`
skickas till sin egen startsida, och ett test bevisar det
(`test/server.test.mjs`).

⚠️ Att redigerare aldrig ser spend är Axels beslut 2026-09-02, samma regel som
topplistan. Satsen (0,4 %) räknas som spend: med belopp **och** sats går spenden
att räkna ut baklänges. Den visas därför bara för ägare och chef.

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
| `vy/` | Sidorna. `delar.mjs` är byggklossarna, `layout.mjs` skalet |
| `webb/` | `stil.css`, `app.js`, märket. Inga externa anrop |

---

## Lägga upp den på stonebite.org

Sajten är en vanlig Node-process som lyssnar på `PORT`. Den kan köras var som
helst som kör Node (Railway, Fly, en VPS).

1. **Start:** `node stonebite/server.mjs` (eller `npm run sida`).
2. **Miljövariabler:** `STONEBITE_HEMLIGHET` (obligatorisk i drift),
   `PORT` (sätts oftast av plattformen), `STONEBITE_ANVANDARE` (sökväg till
   kontofilen).
3. ⚠️ **Kontofilen måste ligga på en disk som överlever en ny version.**
   Containern byts vid varje deploy. Peka `STONEBITE_ANVANDARE` på en monterad
   volym, t.ex. `/data/anvandare.json` — annars är alla konton borta efter
   nästa deploy och ägarkontot måste skapas om.
4. **Domänen:** peka `stonebite.org` på tjänsten och låt plattformen sköta
   TLS. Servern sätter HSTS när den ser `X-Forwarded-Proto: https`.
5. **Färsk data:** `data/snapshot.json` committas till `main`. En rutin på
   claude.ai kör `node stonebite/hamta.mjs`, committar och pushar — samma
   mönster som spårningen och kundtjänsten. Deployen tar med den nya filen.

`/halsa` svarar med JSON (läge + när datan hämtades) och kräver ingen inloggning
— använd den som health check.

---

## Vad som INTE är byggt än

- Ingen glömt-lösenord-funktion (ägaren sätter ett nytt på sidan Konton).
- Ingen tvåfaktor.
- Snapshoten uppdateras av en rutin som ska sättas upp med `/rutin`.
- Bäverbutikens försäljning saknas i sajten tills Shopify-appen fått
  godkännande för kunddata (`read_orders`). Sidan säger det rakt ut i stället
  för att visa noll.
