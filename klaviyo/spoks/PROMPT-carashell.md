# Prompt: CaraShells hela mejlsystem i Spoks (klistra in i en NY session)

Skriven 2026-09-26, efter att Bäverbutiken flyttats från Klaviyo till Spoks.
Allt under strecket är prompten.

---

Bygg hela e-postsystemet för **CaraShell** i **Spoks**: flöden, kampanjer och
segment, i alla CaraShells marknader och språk. Kör klart hela vägen. Allt ska
ligga som utkast och avstängt. Aktivera, schemalägg och skicka ingenting utan
mitt ord. Spoks MCP tillåter det ändå inte, så de klicken gör jag i appen.

Målet: CaraShell ska ha det bästa mejlsystemet vi har. Flödena är där pengarna
finns. Bygg dem djupt, inte brett, och låt varje mejl ha ett skäl att finnas.

## Läs först, i den här ordningen
1. `CLAUDE.md`, särskilt avsnittet `klaviyo/` och raden om Spoks längst ner i det.
2. `klaviyo/spoks/README.md`. Där står hur Bäverbutiken byggdes i Spoks, vilka triggers som fungerar och vad Spoks inte kan.
3. `klaviyo/spoks/konvertera.mjs` och `klaviyo/spoks/baverbutiken/` (plan, payloads, produkt-id:n). Det är mallen för formen.
4. `klaviyo/innehall/baverbutiken/`, `klaviyo/ARKITEKTUR.md`, `docs/os/EPOST-STRATEGI.md` och `docs/copy-regler.md`.
5. CaraShell: `factory/butiker/carashell.yaml` (marknader, domäner, språk, retur), `factory/produkter/` (CaraShells produkter), `products/carashell/` (DNA, batch-logg, kommentarer), `sparning/butiker.json` → `carashell` (spårningssida per språk, prefix `CS-`), `mejl/butiker/carashell.json` (brand) och `kundtjanst/brands/carashell.yaml`.

## Verksamheten
CaraShell är en egen verksamhet. Blanda aldrig in Bäverbutikens konto, kunder,
produkter eller texter. Butikens namn får stå i avsändare och sidfot, eftersom
det är mejl från butiken och inte annonser.

## Steg

0. **Workspace.** Kör `whoami` i Spoks. Finns ingen CaraShell-workspace, stoppa och skriv exakt hur jag installerar Spoks på CaraShells Shopify: vilken knapp, i vilken ordning. Hitta aldrig på ett storeId. Finns den: skriv ut plan, tidszon, antal kontakter och månadsgräns. Kör sedan `get_flows` och `search_campaigns`. Spoks kan ha importerat saker på egen hand, och det som redan finns ska rättas, inte dupliceras.

1. **Mät innan du bygger.** Allt nedan ska läsas ur datan, inte antas:
   - **Marknaderna.** Vilka länder och språk som finns, och var kunderna faktiskt kommer ifrån. Räkna ordrar per land 90 dagar bakåt ur Shopify. En marknad utan ordrar får inga egna flöden. Det skrivs ut med siffran.
   - **Språket i Spoks.** Ta reda på hur Spoks vet en kontakts språk eller land (kontaktfält, `contact.country`, filter på land och så vidare). Testa med `preview_segment` på ett land. Bygg språkstyrningen på det som faktiskt fungerar och skriv ner hur du mätte det.
   - **Produkterna och priserna.** Hämta dem med `products_search`, och kontrollera priset per marknad mot butikens sida (SEK på carashell.se, USD på carashell.com). Skriv aldrig ett pris i ett mejl som inte kommer direkt från butiken.
   - **Återköp och produktpar.** Räkna på samma sätt som `klaviyo/evolve/ATERKOP-ANALYS.md`: köper någon taköverdraget och sedan termoskyddet? Hur många dagar senare? Tipsflöden och korsförsäljning byggs bara där datan bär. Saknas underlag, skriv det och bygg inte flödet.
   - **Samtycke.** Hur många kontakter som är `subscribed` per marknad.

2. **Flödesplanen.** Skriv `klaviyo/spoks/carashell/plan.json` och en kort `PLAN.md` innan något laddas upp. Minst dessa, med villkoren anpassade efter mätningen:
   - Välkomst till ny prenumerant.
   - Övergiven kassa. Här finns mest pengar, så bygg den bäst: tre mejl och ett riktigt svar på köparens tvekan (passar det min vagn, hur fäster det, klarar det vinden).
   - Webbhistorik.
   - Efter köp: hur man monterar överdraget, spårningssidan på kundens språk och ett supportmejl innan kunden hinner bli orolig.
   - Recension (Trustpilot, samma stjärnlänk för alla betyg och aldrig review gating).
   - Vinna tillbaka.
   - Korsförsäljning, men bara där steg 1 visade ett produktpar.
   - Säsong, eftersom husvagn och husbil ställs undan och tas fram. Bygg det som kampanjer, inte som flöden, om datan inte säger annat.

   Varje flöde ska ha trigger, filter, väntetider och ett skäl per mejl. Välj flödeskonstruktion per språk efter vad steg 1 visade: ett flöde per språk eller ett flöde med filter per steg. Motivera valet.

3. **Kampanjkalender** till och med 31 december: en kampanj i veckan per aktiv marknad, plus säsongens tillfällen. Black Week och rabatter är mitt beslut, så fråga mig med alternativ A/B/C innan något med rabatt byggs.

4. **Copy.** All slutgiltig copy skrivs av en subagent med `model: "sonnet"`. Den får `docs/copy-regler.md`, CaraShells DNA och kommentarer ur `products/carashell/` och formatkraven. Varje rad ska klara tre-frågorstestet.
   - Svenska, norska och engelska skrivs var för sig, på det egna språket. Översätt aldrig ordagrant.
   - Den engelska texten ska passa alla engelskspråkiga länder i marknaden (US, GB, CA, AU, NZ). Säg "caravan" där det passar, och inga månader eller årstider som är fel på södra halvklotet.
   - Inga tankstreck (— eller –).
   - **Leveranstiden står aldrig i ett mejl.**
   - Inga påhittade fakta, siffror, recensioner eller förmåner.
   - Retur och garanti exakt som butiken säger per marknad. Läs det ur `factory/butiker/carashell.yaml` och butikens policysidor och gissa aldrig.

5. **Ladda upp i Spoks.**
   - Skriv `klaviyo/spoks/carashell/produkter.json` och kör `konvertera.mjs --brand carashell`. Gör skriptet brand-parametriserat om det inte redan är det, utan att Bäverbutikens utfall ändras.
   - Skapa flödena (`create_flow`, `add_flow_step`) och fyll varje mejl (`update_draft_campaign`).
   - Lägg kampanjerna som utkast med `draft_campaign`, med avregistreringslänk på.
   - Sätt samtyckesfilter på varje flöde som inte är ett köparflöde, och kontrollera det med `get_flow` efteråt. På Bäverbutiken missade importen det på två flöden.
   - Knappar som leder till spårningssidan ska gå till rätt sida för rätt språk (`sparning/butiker.json`).
   - Läs tillbaka allt med `get_flows` och `search_campaigns` och räkna att antalen stämmer.

6. **Avsändare och domän.** Kontrollera avsändaren med `get_settings`. Säger Spoks att DNS behövs för carashell.se eller carashell.com, skriv exakt vilka poster som ska in och var. ⛔ **Byt ALDRIG namnservrar.** Lägg bara till CNAME- och TXT-poster på underdomäner, och ändra en befintlig SPF-rad genom att lägga till, aldrig ersätta. Mät med `dns.google` och Cloudflare DoH efter varje ändring.

7. **Dokumentera och spara.** Skriv i `klaviyo/spoks/README.md` (ny rubrik CaraShell) och på raden om Spoks i `CLAUDE.md`: id:n, triggers, språkstyrningen och hur den mättes, och vad som inte gick. Committa, pusha, öppna PR och merga till `main`.

## Järnregler
- Kampanjer går bara till `subscribed`. Köparflöden får gå till köpare som inte tackat nej, med EU-reglerna som golv för alla marknader.
- Inget aktiveras, schemaläggs eller skickas av sessionen.
- Hitta aldrig på data. Saknas något: skriv vad och varför, och bygg resten.
- Kolla alltid själv först om något redan finns eller redan är gjort, innan du ber mig om ett klick.

Avsluta med en checklista punkt för punkt (✅/❌) och sist mina klick, numrerade,
en mening per rad, med exakt knapp och länk.
