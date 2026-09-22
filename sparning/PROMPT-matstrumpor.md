# Uppdrag: spårningssystemet i Matstrumpor.se (sida + timrutin + fraktmejl + meny)

Skriven 2026-09-21 av sessionen som rullade ut spårningen i fem butiker, på
Axels begäran ("skriv en prompt till en ny session för att implementera
tracking page i matstrumpor.se … och bygga mailmallarna osv"). Axel klistrar
in EN rad i en ny Claude Code-session: **"Läs `sparning/PROMPT-matstrumpor.md`
och gör det."** Resten står här.

Svara Axel på svenska, kort, hans klick numrerade sist. Han är inte
utvecklare. Lämna aldrig något halvfärdigt "som han bara behöver göra själv".

## Vad som ska finnas när du är klar

Samma sak som Bäverbutiken, CaraShell, Beverbutikken, Bæverbutiken och
Majavakauppa har sedan 2026-09-20/21 (`sparning/README.md` → "Fler butiker",
`CLAUDE.md` → raden `/sparning`):

1. **Kundens spårningssida** `https://matstrumpor.se/pages/spara` — hela
   kedjan på svenska, bävernummer med butikens eget prefix, ingen upsell
   (lyckohjulet är bara Bäverbutikens).
2. **Timrutinen** `/sparning matstrumpor` på `claude5@stonebite.org` — fast
   session + cron på en ledig minut, sedd i `list_triggers`.
3. **De tre fraktmejlen** (Leveransbekräftelse, Leveransuppdatering, Ute för
   leverans) som hela mallar i butikens brand, byggda av
   `node mejl/bygg-butik.mjs matstrumpor`, inlagda i Shopify.
4. **Menylänken** "Spåra paket" i huvudmeny + sidfot.
5. Allt bokfört: `sparning/README.md`, `CLAUDE.md` (rutintabellen +
   `/sparning`-raden), `sparning/cowork/matstrumpor.md`. Commit + push till
   `main` — rutinen klonar `main`, en gren räcker inte.

Läs först, i ordning: `CLAUDE.md`, `sparning/README.md` (hela avsnittet
"Fler butiker"), `mejl/README.md`, `sparning/cowork/carashell.md` och
`sparning/cowork/baeverbutiken.md` (utfallen — där står varje fallgrop som
kostade en omkörning), `.claude/commands/sparning.md`.

## Steg 0 — nycklarna (kan bli Axels första klick)

Matstrumpor.se finns inte i `sparning/butiker.json`, har ingen
`factory/butiker/*.yaml` och inga kända Shopify-nycklar i Environments.
Kolla med `env | grep -i SHOPIFY` om något heter `SHOPIFY_CLIENT_ID_MATSTRUMPOR`
/ `SHOPIFY_CLIENT_SECRET_MATSTRUMPOR` (eller annat suffix som pekar på
butiken). Finns inget: STANNA efter att ha skrivit registerposten (steg 1)
och ge Axel exakt dessa klick, numrerade:

1. Shopify-admin för matstrumpor.se → **Inställningar → Appar och
   försäljningskanaler → Utveckla appar → Skapa en app**, namn
   `Matstrumpor claude spårning`.
2. **Konfigurera Admin API-omfattningar**: `read_orders`,
   `read_fulfillments`, `write_fulfillments`, `write_content`. Spara.
   (Skapas appen i den nya Dev Dashboard: samma fyra scopes; det finns
   ingen "Protected customer data"-ruta för custom apps längre — godkänn
   "Uppdatera dataåtkomst" i admin när den dyker upp. Mätt 2026-09-20.)
3. **Installera appen** i butiken.
4. Kopiera **Client ID** och **Client secret** (inte Admin API-token —
   `atkn_`-tokens ger 401 i vår klient) till claude.ai → Environments →
   **Default ENV** (`env_01PBy3BU66p5AEJYSfm8EbjP`, det rutinerna kör i)
   som `SHOPIFY_CLIENT_ID_MATSTRUMPOR` och `SHOPIFY_CLIENT_SECRET_MATSTRUMPOR`.
5. Säg till. ⚠️ Nya miljövariabler syns först i en NY container — be Axel
   starta en ny session efteråt om `--kolla` fortfarande inte ser dem.

`TRACK17_API_KEY` är gemensam för alla butiker och finns redan.

## Steg 1 — registerposten

Lägg till `matstrumpor` i `sparning/butiker.json` efter mönstret
`baeverbutiken` (kopiera posten och byt fälten):

- `namn: "Matstrumpor"`, `url: "https://matstrumpor.se"`, `myshopify` läses
  ur butiken (`--kolla` skriver ut den; gissa aldrig).
- `env_suffix: "MATSTRUMPOR"`, `sprak: "sv"`, `land: "Sverige"`,
  `landskod: "SE"`. Svenska är identitet i språklagret — ingen
  `sprak/sv.json` behövs, inget test att fylla.
- `support`: läs ur Shopifys `shop.contactEmail` (`--kolla` visar den) och
  skriv in den; skriv i `support_comment` var den lästes. Aldrig en annan
  butiks adress.
- `prefix: "MS-"` — INTE `BB-` (det är Bäverbutikens) och inte `CS-`.
  Bävernumret är SHA-256 av spårningsnumret; prefixet är det enda som
  skiljer butikerna, och sidan slår upp med sitt eget prefix.
- `handle: "spara"`, `titel: "Spåra ditt paket"`, `erbjudande: false`,
  `leverans_dagar: [7, 14]`, `sparning_vaknar: "2–4 dagar"`.

Lägg också in butiken i `sparning/test/butiker.test.mjs` om testet räknar
registret, och kör `node --test sparning/test/*.test.mjs` grönt.

## Steg 2 — sidan live

```bash
node sparning/kor.mjs --butik matstrumpor --kolla      # nycklar + de fyra rättigheterna
node sparning/kor.mjs --butik matstrumpor --torr       # ingen registrering, ingen sida
node sparning/kor.mjs --butik matstrumpor              # skarpt: 17TRACK + event + sidan
```

Regler som gäller (alla står i README, upprepade här för att de kostat):
- `sparning/butiker/matstrumpor/output/` committas ALDRIG. `lage.json` +
  `konfig.json` committas.
- Första publiceringen får vara tom om butiken saknar skanningar
  (`publicera.mjs` släpper igenom en tom sida bara när
  `konfig.lage.sida_publicerad` saknas) — då finns sidan när mejl och meny
  ska peka på den.
- Trippelkollen: API, publik vy som kund, ett känt nummer i kundens data.
  Titta på sidan i Chromium (390 och 1280 px) innan du säger "live".
- Sidans brand läses ur `mejl/butiker/matstrumpor.json` (steg 4) — bygg
  den filen INNAN den skarpa publiceringen, annars går sidan live med
  Bäverbutikens röda Impact-versaler (hände CaraShell 2026-09-20).

## Steg 3 — timrutinen

Fast session med repot som källa och `main` som utgren, sedan
`create_trigger` med `persistent_session_id`, prompt `/sparning matstrumpor`,
taggar `routine:sparning` + `butik:matstrumpor`, inga connectors. Upptagna
minuter: :16 Bäver, :24 CaraShell, :32 NO, :40 FI, :48 DK — ta **:56**
(`56 * * * *`, samma i CEST och CET). Kolla `list_triggers` FÖRE bygget
(ingen dubblett) och EFTER (se id:t innan du skriver in det i CLAUDE.md).
`fire_trigger` väcker inte den fasta sessionen — vill du provköra utanför
schemat: `create_trigger` med `run_once_at` minst tio minuter fram.
Bygg rutinen EFTER att koden pushats till `main`.

## Steg 4 — fraktmejlen och menyn

1. `mejl/butiker/matstrumpor.json`: brandet — loggans URL ur butikens
   startsida (temats fil på butikens CDN), färger avlästa ur temat,
   `font_rubrik`, `sidhuvud_farg`, `meny_klar: false`. Se
   `mejl/butiker/baeverbutiken.json` och `carashell.json` för formatet.
2. `node mejl/bygg-butik.mjs matstrumpor` → `mejl/output/butiker/matstrumpor/`
   (tre `.liquid`, tre `.amne.txt`, `COWORK-PROMPT.md`, `PROMPT.txt`,
   förhandsvisningar). Titta på förhandsvisningarna i Chromium.
   Inget gratisprodukt-block — bara Bäverbutiken har erbjudandet.
3. Commit + push till `main` FÖRE du ger Axel prompten — Cowork hämtar
   råfilerna från `main` (eller ge länkar med commit-sha:t,
   `raw.githubusercontent.com/Axel3738/yognftnfgn/<sha>/...`, de fungerar
   direkt medan `main`-länken kan vara negativt cachad i några minuter).
4. Ge Axel: öppna `PROMPT.txt`-länken, Ctrl+A, Ctrl+C, ny Cowork-chatt,
   Ctrl+V. ⚠️ Coworks säkerhetsspärr stoppade i CaraShell all
   skript-inskrivning i auto-läge, två gånger, utan att fråga Axel — gick
   igenom i NO/DK/FI. Stoppas den: låt Axel klistra in de tre `.liquid` +
   `.amne.txt` själv i Shopify (Inställningar → Notiser → Kundaviseringar →
   mallen → Redigera kod, Ctrl+A/Ctrl+V i brödtexten, ämnesraden, Spara) och
   låt Cowork bara verifiera mot servern + skicka testmejlet. Mallens id i
   adressfältet är markören: `shipment_out_for_delivery` är rätt,
   `local_out_for_delivery` ("Order ute för lokal leverans") fel — båda
   heter "Out for delivery" internt.
5. Avsändaren: Shopify kräver en verifierad avsändaradress på butikens
   egen domän (Gmail godtas inte — Norge fick byta). Cowork rapporterar om
   verifiering behövs; Axel klickar länken i den inkorgen.
6. När Coworks rapport kommer: bokför i `sparning/cowork/matstrumpor.md`
   (utfall, teckenantal, testmejl, avvikelser), sätt `meny_klar: true`,
   bygg om prompten, pusha.

## Steg 5 — bokföring och Definition of done

- [ ] `sparning/butiker.json` har `matstrumpor`, tester gröna
- [ ] `https://matstrumpor.se/pages/spara` svarar med "Spåra ditt paket" och
      ett riktigt MS-nummer ur datan hittas i kundens vy
- [ ] `sparning/butiker/matstrumpor/lage.json` + `konfig.json` committade,
      `output/` inte
- [ ] Timrutinen syns i `list_triggers` med rätt cron, fast session, taggar;
      id:n inskrivna i CLAUDE.md:s rutintabell (nya raden efter DK)
- [ ] `mejl/butiker/matstrumpor.json` + `mejl/output/butiker/matstrumpor/`
      byggda, förhandsvisningar tittade på
- [ ] Cowork-prompten given till Axel; efter hans rapport: tre mallar
      verifierade mot servern, meny i header + sidfot, testmejl med EN knapp
      → `matstrumpor.se/pages/spara?nummer=MS-…`
- [ ] `sparning/README.md` (tabellen "Läget per butik"), `CLAUDE.md`
      (`/sparning`-raden + rutintabellen), `sparning/cowork/matstrumpor.md`
- [ ] Allt pushat till `main`; Axels kvarvarande klick numrerade sist i
      svaret, eller "Inga just nu."
