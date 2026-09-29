`Läs klaviyo/spoks/beverbutikken/PROMPT.md och kör den.`

↑ Den raden skriver Axel i en ny Claude Code-session i repot. Allt nedan är till sessionen.

# Uppdrag: Beverbutikkens hela e-postmarknadsföring i Spoks (beverbutikken.no)

Skrivet 2026-09-29 av en session som bara läste. Ingenting är byggt i Spoks, Shopify,
Klaviyo eller DNS. Axels order samma dag: *"Skriv gärna en prompt för att sätta all email
marketing, alla flows allting på beverbutikken.no DVS norska bäverbutiken."*

Beverbutikken är Bäverbutikens norska butik: egen Shopify (`1acuam-s5`), eget sortiment på
bokmål, NOK, egen brevlåda hos Domeneshop. I Spoks är den en **egen butik**: inget delas
med Bäverbutikens workspace, kunder, segment eller texter.

## Uppdraget

Bygg allt för Beverbutikken i Spoks: inställningar och sidfot, avsändardomän, segment,
flöden och kampanjutkast, på norsk bokmål. Kör klart hela vägen. I Spoks bygger du allt
**avstängt och som utkast**. Du aktiverar, schemalägger och skickar ingenting. Spoks-MCP:n
kan inte heller slå på flöden eller sändsteg, välja publik, schemalägga eller ändra ett
aktivt flöde (`klaviyo/spoks/README.md`, mätt 2026-09-26/27). De klicken är Axels.

**Spoks, aldrig Klaviyo.** Klaviyo är avstängt sedan 2026-09-26 på Axels order. Använd inte
`klaviyo/ladda-upp.mjs`, `sla-pa.mjs` eller `schemalagg.mjs` för Beverbutikken.

**Klart** betyder att allt ligger i Spoks och är tillbakaläst, att allt står i repot och är
mergat till `main`, att varje fråga som kräver Axel är ställd och att hans klick står sist
i rapporten.

## Så svarar du Axel

CLAUDE.md gäller. Svenska, kort. Axel har dyslexi.
- Hans uppgifter står sist under en egen rubrik, numrerade, en mening per rad, med exakt var
  han klickar och vad knappen heter. Högst fem klick per meddelande. Läs tillbaka varje
  klick han gjort (`get_flow`, `search_campaigns`, `get_settings`, dns.google) innan nästa
  lista.
- Appen visar ämnesraden, aldrig våra koder. Skriv ämnesraden eller länken
  (`https://app.spoks.com/<slug>/flows/<id>`, `https://app.spoks.com/<slug>/post/<id>/edit`),
  aldrig "F01", "K01" eller "mejl 2". `<slug>` läser du ur `get_links`. Gissa den aldrig.
- En fråga i taget, med alternativ A/B/C och ditt råd. Frågorna och ordningen står i
  avsnitt 13.
- Gissa aldrig en knapp. Står den varken i repot eller på en sida du läst i sessionen:
  skriv det.
- Chadbot (regel 15) bara för metod, aldrig för juridik eller våra siffror. Frågan skrivs på
  engelska, utan butiksnamn, domän eller exakta tal. Läs `klaviyo/evolve/SVAR.md` först.

## 1. Läs först, i den här ordningen

1. `CLAUDE.md`: avsnittet `klaviyo/` (Spoks-raderna för Bäverbutiken, CaraShell och
   Matstrumpor), "Bolagets adress", reglerna 3, 6, 12, 14 och 15, och "Saker som är lätta
   att göra fel".
2. `klaviyo/spoks/README.md`, hela. Bäverbutiken: det som skickar nu, de rättade kopiorna och
   reglerna för Axels klick. CaraShell: språkgruppen nb, domänen och samtycket per land.
   Matstrumpor: DNS i sju poster, avsändaren först efter Verify, Shopifys egna automatiseringar.
3. `klaviyo/spoks/PROMPT-carashell.md` (steg 0b, Spoks Kom igång-lista) och
   `klaviyo/spoks/PROMPT-carashell-upp.md` (uppladdningsreceptet, steg 2–7).
4. `klaviyo/spoks/konvertera.mjs` (hela) och `klaviyo/test/konvertera.test.mjs`. Formen:
   `klaviyo/spoks/carashell/PLAN.md`, `plan.json`, `spoks-id.json`,
   `klaviyo/brands/carashell.json` (`per_sprak.nb`), `klaviyo/innehall/carashell/skelett.mjs`
   och `fakta/nb.json`.
5. `docs/copy-regler.md`. `docs/os/EPOST-STRATEGI.md` (§3 samtycket, §4 leveransbarheten, §8
   larmen). `klaviyo/ARKITEKTUR.md` (järnreglerna). `klaviyo/evolve/FLODESRESEARCH.md` och
   `ATERKOP-ANALYS.md`: metoden, inte siffrorna, som är Sveriges.
6. Den norska butiken: `sparning/butiker.json` → `beverbutikken`,
   `kundtjanst/brands/beverbutikken.yaml`, `mejl/butiker/beverbutikken.json`,
   `mejl/sprak/nb.json`, `sparning/cowork/beverbutikken.md`, `.claude/commands/no-recensioner.md`
   och `market-expansion/BESLUT.md`.
7. `matstrumpor/marknader/oversattning/GRANSKARE.md`: så briefas en skeptisk granskare.

En annan session ändrade filer under `klaviyo/` (README, kampanjfiler, `konvertera.mjs`)
2026-09-29. Kör `git pull origin main` innan du läser dem, och igen innan du skriver i
`klaviyo/spoks/README.md` eller `CLAUDE.md`.

## 2. Facit: mätt 2026-09-29 (läs-bart)

Använd siffrorna och mät bara om det som rör sig (steg 4). Mätt med Shopifys Admin API via
appen bakom `SHOPIFY_CLIENT_ID/SECRET_NO` ("Bever No produkter claude"), butikens publika
`meta.json` och `/products.json`, och butikens egna sidor. Inga kundadresser har sparats:
e-post hashades i minnet.

| Vad | Värde |
|---|---|
| Shopify | `1acuam-s5.myshopify.com`, namnet Beverbutikken, NOK, tidszon Europe/Stockholm, prisformat `{{amount_with_space_separator}} kr` |
| Ordrar | 1 194 från 2026-08-09 till 2026-09-29, 0 annullerade, alla till Norge, alla med `customerLocale` nb-NO. Vecka 36–39: 178–293 i veckan |
| Kunder (unika e-postadresser) | 1 153. 28 har två ordrar eller fler (2,4 %), varav 7 lade andra ordern inom en timme. 21 riktiga återköp, median 10,3 dagar till köp 2 |
| Produktpar köp 1 → köp 2 | Inget par mer än två gånger: marint motortrekk → båtmotortrekk 2, IBC-tanktrekk → feiesett 2, IBC-tanktrekk → takovertrekk 2, båtmotortrekk → IBC-tanktrekk 2 |
| Mest köpt (antal ordrar) | takovertrekk campingvogn 172, kranbeskyttelse 164, IBC-tanktrekk 133, marint motortrekk 115, fiskestangholder 90, båtmotortrekk 83, arbeidslampe för Makita 78, feiesett 72, stigestøtte 44, overvåkingskamera 31 |
| Ordervärde | median 439 kr, snitt 635 kr. Står aldrig i ett mejl |
| Frakt | order → skickad median 0,6 dygn (p90 1,1). Order → levererad (`deliveredAt`, n = 579) median 13,0 dygn, p90 18,8 |
| Fulfillments | DELIVERED 579, IN_TRANSIT 322, FULFILLED 155, CONFIRMED 129 |
| Övergivna kassor | 199 sedan 2026-08-09, alla utan `completedAt` |
| **Kundens ja till e-postreklam i kassan** (`customerAcceptsMarketing`) | **1 020 av 1 194 ordrar (85 %)**, 997 av 1 153 kunder. Vecka 33: 59 %, vecka 36–39: 88–90 %. CaraShells norska kunder: 4 av 99 (README → CaraShell, mätt 2026-09-27) |
| Rabatter i Shopify | tre automatiska "Kaching Bundles" (aktiva sedan 6/8, 18/8 och 22/8) och koden **VELKOMMEN10** ("Velkomstrabatt skrapekort", 10 %, en gång per kund, kombineras inte, **0 användningar**, aktiv sedan 2026-08-23) |
| Katalogen | 234 publicerade produkter, 503 varianter, 35–3 349 kr. **411 av 503 varianter har ett jämförpris över priset.** Titlarna bär tankstreck, till exempel "Takovertrekk til Campingvogn – Beskytter Den Dyreste Flaten" |
| Appens rättigheter | 14 st: `read/write_discounts`, `read/write_fulfillments`, `read/write_inventory`, `read_orders`, `read/write_products`, `read/write_publications`, `read_shopify_payments_disputes`, `read/write_content`. **Saknar** `read_customers` (kundens samtycke och kund-id), `read_markets`, `read_themes`/`write_themes`/`write_translations` (kassans text). `SHOPIFY_SHOP_NO` pekar rätt, på `1acuam-s5.myshopify.com` |
| Kontaktmejl | `support@beverbutikken.no` (`shop.contactEmail`, avsändaren i Shopify sedan 2026-09-20). Butikens sidor Kontakt, Retur, Frakt, FAQ, Kjøpsvilkår och Personvern skriver fortfarande `Beverbutikken@gmail.com` |
| Sajten | Judge.me, Kaching och wetracked laddas. Klaviyo, Spoks och Trustpilot finns inte i koden. Två anmälningsrutor: startsidan "Bli med i kundeklubben vår" och sidfoten "Bli med i kundeklubben vår for eksklusive rabatter og tilbud!". Popup-sektionen är dold |
| Spårningssidan | `https://beverbutikken.no/pages/spor` svarar 200 med "Spor pakken din". Paketnumren börjar på `BB-`. Shopifys tre fraktmejl bär redan numret och länken (`sparning/cowork/beverbutikken.md`) |
| Loggan | `https://beverbutikken.no/cdn/shop/files/beverbutikken-logo.png?v=1786075292&width=480` (200). Färgerna står i `mejl/butiker/beverbutikken.json` |
| Trustpilot | `no.trustpilot.com/evaluate/beverbutikken.no` och `…/www.beverbutikken.no` svarar 404: ingen profil. `se.trustpilot.com/evaluate/www.baverbutiken.se` svarade 200 i samma körning |
| Recensionerna på sajten | Importerade av `/no-recensioner`: svenska recensioner översatta, nya namn, adresser på example.com (`market-expansion/no/reviews/build/make-no-reviews.py`). **Inga verifierade köp** |

**Villkoren, som butiken själv skriver dem.** `/policies/refund-policy` svarar 404, och
`shipping-policy`/`terms-of-service` svarade 429 och är olästa. Butikens egna sidor:
- `/pages/retur-og-angrerett`: "Som forbruker har du 14 dagers ubetinget angrerett fra den
  dagen du mottar varen, i henhold til angrerettloven." · "I tillegg til angreretten gir vi deg
  totalt 30 dagers åpent kjøp fra du mottok varen." · "Du står selv for returfrakten, med
  mindre varen er feil eller skadet." · Reklamasjon två år, fem år för varor som ska hålla
  betydligt längre. Återbetalning inom 10 virkedager.
- `/pages/fraktinformasjon`: behandlingstid 0–2 virkedager, leveringstid 5–10 virkedager (står
  aldrig i ett mejl), "Alle priser vises i norske kroner (NOK) og inkluderer mva. Du betaler
  ikke toll eller ekstra avgifter ved levering".
- FAQ: "Fraktkostnaden vises i kassen før du fullfører kjøpet." Startsidans rad: "FRI FRAKT
  På ordre over 300 kr".
- Kjøpsvilkår: "Beverbutikken.no drives av STONEBITE ECOM AB". Sajtens sidfot: "Org nr: 5595762401".

**DNS för beverbutikken.no (dns.google, facit att jämföra mot före och efter varje ändring):**

| Post | Värde |
|---|---|
| NS | `ns1.hyp.net`, `ns2.hyp.net`, `ns3.hyp.net` (Domeneshop, SOA `hostmaster.domeneshop.no`) |
| A @ | `23.227.38.65` (Shopify) |
| CNAME www | `shops.myshopify.com` |
| MX | `10 mx.domeneshop.no` |
| TXT @ | EN rad: `v=spf1 include:_spf.domeneshop.no ~all` |
| TXT `_dmarc` | `v=DMARC1; p=quarantine; rua=mailto:dmarc@domeneshop.no`: finns redan, och den är strikt |
| `link`, `feed`, `kps._domainkey`, `kps2._domainkey`, `send` | finns inte (NXDOMAIN), så Spoks vanliga poster krockar inte med något |

**Spoks** (mätt av den som beställde prompten, 2026-09-29): `whoami` för MCP-användaren
`kundsupport@baverbutiken.se` visar exakt tre workspaces: Bäverbutiken.se
`f716ae36-68ae-4f1c-a45e-96c35d5637a0`, Matstrumpor.se `71c2d4c8-b9ec-488a-b15c-5dfe8dbd2226`
och Carashell `38f3d430-690c-4c0b-8419-8ec2e5272148`. **Ingen för Beverbutikken.** Skriv
aldrig i de tre. Att läsa Bäverbutikens `get_settings` för layouten är okej.

**Norsk lag.** Citerat via WebFetch 2026-09-29 (lovdata svarar 405 på curl härifrån).
Sessionen tolkar inte lagen åt Axel: den visar citaten, ger sitt råd (den säkra vägen) och
låter honom välja.
- **Markedsføringsloven § 15 första ledd** (LOV-2009-01-09-2, `lovdata.no/lov/2009-01-09-2/§15`):
  "I næringsvirksomhet er det forbudt, uten mottakerens forutgående samtykke, å rette
  markedsføringshenvendelser til fysiske personer ved elektroniske kommunikasjonsmetoder som
  tillater individuell kommunikasjon, som for eksempel elektronisk post, telefaks eller
  automatisert oppringningssystem (talemaskin)."
- **§ 15 tredje ledd:** "Krav om forhåndssamtykke etter første ledd gjelder heller ikke
  markedsføring ved elektronisk post i eksisterende kundeforhold der den næringsdrivende
  avtaleparten har mottatt kundens elektroniske adresse i forbindelse med salg.
  Markedsføringen kan bare gjelde den næringsdrivendes egne varer, tjenester eller andre
  ytelser tilsvarende dem som kundeforholdet bygger på. Når den elektroniske adressen samles
  inn, og eventuelt ved hver enkelt senere markedsføringshenvendelse, skal kunden enkelt og
  gebyrfritt gis anledning til å reservere seg mot slike henvendelser."
- **Forbrukertilsynets veiledning om markedsføring via e-post, SMS o.l.**
  (https://www.forbrukertilsynet.no/lov-og-rett/veiledninger-og-retningslinjer/forbrukertilsynets-veiledning-markedsforing-via-e-post-sms-o-l,
  oppdatert 8. mai 2026; citaten 2.6.1, 2.5.2 och 3.3.1 kontrollerade mot sidan 2026-09-29):
  - 2.6.1: "Samtykket må avgis ved at det foretas en aktiv handling. … et forhåndsavkrysset
    felt eller et vilkår i en kontrakt ikke er tilstrekkelig til at det skal kunne sies å
    foreligge et gyldig samtykke." Och: "Det er den næringsdrivende som skal bevise at
    mottakeren har gitt samtykke". Samtycket ska vara informerat, bland annat om "hvor ofte
    vedkommende vil motta markedsføring og om hvilke typer produkter", och "hvem samtykket
    gis til".
  - 2.5.2: "Utsendelse av forespørsel om man ønsker å gi samtykke, skal regnes som en
    markedsføringshenvendelse." Ett mejl som ber om ett nytt ja är alltså självt förbjudet
    utan samtycke.
  - 3.3.1: "Et engangskjøp vil som hovedregel ikke være nok til at det kan sies å foreligge
    et kundeforhold." Och: "Ett eller flere enkeltkjøp av billige forbruksartikler vil aldri
    være tilstrekkelig til at det kan sies å foreligge et kundeforhold." 1 125 av
    Beverbutikkens 1 153 kunder har köpt en gång.
  - 3.3.4: "Annen kundekommunikasjon enn markedsføring kan likevel sendes uten hinder av mfl.
    § 15", till exempel "henvendelser som ledd i oppfyllelsen av et kontraktsforhold" och
    "praktiske servicemeldinger". Men 2.5.1: "Henvendelser som inneholder en kombinasjon av
    nyheter/brukerinformasjon og markedsføring omfattes også av ordlyden i § 15."
- **E-handelsloven § 9** (LOV-2003-05-23-35): "Ved elektronisk markedsføring skal det fremgå
  klart hvem markedsføringen skjer på vegne av." Anges priser ska avgifter och
  leveranskostnader framgå (andra ledd), och rabatter ska vara lätta att känna igen, med
  tydliga villkor (tredje ledd).
- **Prisopplysningsforskriften § 9a** (Forbrukertilsynet, "Salg og bruk av førpriser",
  oppdatert 28. august 2025): "Førprisen er den laveste prisen som den næringsdrivende har
  anvendt i minimum 30 dager før markedsføringen startet." Ett överstruket jämförpris i ett
  reklammejl är en prisnedsättning och måste vara en sådan förpris.

## 3. Steg 0: förutsättningar och stopp

**0a. Workspacen.** Kör `whoami` och välj workspacen vars Shopify är `1acuam-s5.myshopify.com`.
- **Finns den:** skriv id, slug (ur `get_links`), plan, tidszon, antal kontakter och
  månadsgräns i README och brandfilen. Kör `get_flows`, `search_campaigns` och `get_segments`.
  Det Spoks skapat på egen hand rättas, aldrig dubbleras.
- **Finns den inte:** skriv Axels klick nedan direkt i chatten och rör inte Spoks. Fortsätt med
  det som inte kräver workspacen: Shopify-delen av steg 4 och steg 5–9. Kör `whoami` igen när
  han skrivit "klart". Spoks-delen av steg 4 och uppladdningen (steg 10) väntar tills
  workspacen syns.

Axels klick för workspacen. De är hämtade ur `klaviyo/spoks/README.md` → CaraShell, som
bygger på Spoks hjälpartiklar *Introduction: how to get started*, *How do I run several Shopify
stores from one Spoks login* och *Managing team members* (lästa 2026-09-26). Cowork gör inte
de här klicken: de installerar en app och skapar ett konto.
1. Öppna Beverbutikkens Shopify-admin på en dator: https://admin.shopify.com/store/1acuam-s5
   (Spoks: "Your first login must be done on a desktop computer, by opening Spoks from your
   Shopify admin").
2. Installera appen Spoks från https://apps.shopify.com/spoks. Knapparna på den sidan står inte
   i repot. Läs sidan med WebFetch och skriv knapparna som de står där.
3. När Spoks föreslår en mejladress: byt den till `kundsupport@baverbutiken.se`. Det är samma
   inloggning som de tre andra, och då ser MCP:n workspacen direkt.
4. Frågar Spoks om flytt från Klaviyo: hoppa över. Beverbutikken har ingen Klaviyo-kod på
   sajten (mätt 2026-09-29).
5. Skriv "klart" till sessionen.

Om det går snett:
- "No Shop found" betyder att han är inloggad med en annan adress än den han skrev in vid
  installationen.
- Hamnade workspacen under ett annat Spoks-konto (så gick det för CaraShell 2026-09-26): logga
  in på det kontot → Beverbutikkens workspace → **Settings → Team → "Invite team member"** →
  `kundsupport@baverbutiken.se` → rollen **Admin** → skicka.
- Sista utvägen är Spoks support, med butikens adress och `kundsupport@baverbutiken.se`.

**0b. Shopify.** `SHOPIFY_CLIENT_ID_NO` och `SHOPIFY_CLIENT_SECRET_NO` fanns 2026-09-29.
Kontrollera med `sparning/butik.mjs` (`skapaKlient(lasButik('beverbutikken'))` och sedan
`.kolla()`) att rättigheterna i facit står kvar. Allt du gör i Shopify är läsning, utom
rabattkoder, och de skapas bara på Axels ord (regel 12).

**0c. Samtycket.** Kör ingen kampanj och föreslå ingen publik förrän du vet hur kassans ja
samlades in: 85 % mot CaraShells 4 % tyder starkt på en förikryssad ruta, men det är inte
bevisat. Ge Axel Cowork-prompten `klaviyo/spoks/beverbutikken/cowork/1-kolla-butiken.txt`,
som läser kassans inställning, Shopifys egna automatiseringar, applistan och Judge.me:s
förfrågningar utan att ändra något. Ge honom råfilens länk på `main`,
`https://raw.githubusercontent.com/Axel3738/yognftnfgn/main/klaviyo/spoks/beverbutikken/cowork/1-kolla-butiken.txt`
(eller samma adress med commit-sha i stället för `main` om länken är cachad), och klicken
Ctrl+A, Ctrl+C, ny Cowork-chatt, Ctrl+V. Alternativet är en skärmdump av Inställningar → Kassa.
Därefter ställer du **Fråga 1**.

**0d. Avsändardomänen** (efter 0a). Spoks skickar via SendGrid från en verifierad egen domän.
Avsändaren går inte att sätta förrän domänen är verifierad: för Matstrumpor svarade
`update_settings` `custom_domain_not_valid` tills Axel tryckt Verify (2026-09-26). Läs
posterna med `get_settings`. Saknas de, be Axel generera dem i appen. README använder två
rubriker: "Settings → Domain Settings → 'Generate DNS records'" (CaraShell) och "Settings →
Custom domain → Verify" (Matstrumpor). Se efter vad Beverbutikkens app visar innan du skriver
klicket.

Posterna läggs in av **Axel själv hos Domeneshop**. Det kräver hans lösenord, och Cowork rör
aldrig DNS. Så står det i Domeneshops egna artiklar "Hvordan administrerer jeg DNS-pekere?"
(`domene.shop/faq?id=15`) och "Hvordan oppretter jeg TXT-records i DNS?" (`?id=406`), lästa
2026-09-29: logga in på https://domeneshop.no/login → **Mine domener** → **beverbutikken.no**
→ fliken **DNS-pekere** → **Vis avanserte innstillinger** → på nedersta raden: **Vertsnavn**,
**Type** (CNAME eller TXT) och data → det **gröna plus-ikonet** längst till höger. En rad i
taget. Enligt artikeln ska fältet **Vertsnavn** vara tomt om inget annat anges. För Spoks
poster anges underdomänen, till exempel `link`.

Reglerna:
- Lägg bara in Spoks nya CNAME- och TXT-poster på underdomäner. NS, A, MX och CNAME www rörs
  aldrig. Loopia-incidenten 2026-09-25: fel namnservrar tog ner baverbutiken.se, mejlen och
  kundtjänstboten.
- `_dmarc` finns redan (`p=quarantine`). Ber Spoks om en `_dmarc`-post: lägg INTE in den (två
  DMARC-poster gör DMARC ogiltig), och ändra inte den som finns. Säg det till Axel.
- Rot-SPF:en ändras bara om Spoks kräver det för Verify. Spoks godkände CaraShells domän innan
  rot-SPF:en hade ändrats (2026-09-26). Krävs det, ändras den befintliga raden till
  `v=spf1 include:_spf.domeneshop.no include:sendgrid.net ~all`. Lägg aldrig in en andra
  `v=spf1`-rad, och låt `~all` stå kvar. Domeneshops artiklar beskriver inte hur en befintlig
  rad ändras: titta på sidan tillsammans med Axel innan du skriver det klicket.
- Mät före (facit ovan) och efter, både med dns.google och med Cloudflare
  (`https://cloudflare-dns.com/dns-query?name=…&type=…`, headern `accept: application/dns-json`).
  Google visade gamla svar i upp till en timme för Matstrumpor (2026-09-26). NS ska svara
  ns1–3.hyp.net, MX mx.domeneshop.no och A 23.227.38.65, och det ska finnas exakt en SPF-rad.
- Därefter Verify i Spoks (Axels klick), sedan `update_settings` med avsändaren, och sist
  `get_settings` för att läsa tillbaka.
- Med `p=quarantine` hamnar ett mejl som inte klarar DKIM eller SPF i skräpposten. Inget går
  ut förrän domänen är verifierad.

**0e. Sidfoten och adressen.** Spoks har en sidfot per workspace. Den bär butiken, bolaget och
kontorets adress, i CaraShells form: `Beverbutikken · STONEBITE ECOM AB · Stenkolsgatan 1B, 417 07
Göteborg, Sverige · support@beverbutikken.no`, gärna med org.nr och butikens egen rad om mva och
frakt (e-handelsloven § 9). Avregistreringslänken på norska. ⛔ Shopifys butiksadress
(`shop.billingAddress`, `meta.json`) och integritetspolicyn på beverbutikken.no bär fortfarande
den gamla adressen (mätt 2026-09-29). Den står i CLAUDE.md → "Bolagets adress" och skrivs
aldrig i något nytt. Hämtar Spoks en adress ur Shopify: skriv över den och läs tillbaka med
`get_settings`. Att rätta Shopify och policyn är `kundtjanst/cowork/1-adressbyte.txt`, inte den
här sessionens jobb.

**0f. Planen.** Läs plan och månadsgräns i `whoami`. CaraShell och Matstrumpor fick Free, 5 000
mejl i månaden. Räkna flödena (cirka 700 ordrar i månaden: 1 194 på 51 dagar) och kampanjerna
mot gränsen innan kalendern läggs. Pengar är Axels beslut (Fråga 5, bara om det behövs).

## 4. Mät butiken (bara det som rör sig, och det som Spoks vet)

- Ordrar, samtycke och kassor mäts om med samma app och samma fält som i facit. Kundernas
  e-post hashas i minnet som i `ATERKOP-ANALYS.md`. Ingen adress hamnar i repot eller i chatten.
- I Spoks, när workspacen finns, **ett anrop i taget**. Spoks egen instruktion:
  kontaktläsande verktyg går mot en databas som alla butiker delar, så vid rate limit stannar
  du och säger det, och du försöker inte runt.
  - `preview_segment` med `{country in ["Norway"]}` och med `{country nis}`: antalen, och hur
    landet skrivs (CaraShells sampel skrev "Norway").
  - `preview_segment` med `emailMarketingConsent in [subscribed]`: hur många prenumeranter
    Spoks tror att vi har.
  - `totalOrders ≥ 2`: återköpen enligt Spoks.
  - `get_contact` på EN prenumerant: visar Spoks när och varifrån samtycket kom? Går det att
    filtrera fram de som själva skrivit in sin adress? En prenumerant utan ordrar har till
    exempel anmält sig i kundeklubben, eftersom kassans ja bara kommer med en order. Skriv
    svaret, för Fråga 1 hänger på det. Skriv aldrig ut kundens adress.
  - `products_search` för de produkter mejlen ska visa →
    `klaviyo/spoks/beverbutikken/produkter.json` i formen `{ handle: { id, externalId, bild? } }`.
    Hitta aldrig på ett id.
- Skriv mätningarna med datum i README och i `spoks-id.json` (`matt_<datum>`).

## 5. Brandfil och faktablad (nb)

**`klaviyo/brands/beverbutikken.json`** i CaraShells form: `system: "spoks"` och
`flersprakig: true` med EN språkgrupp, `nb` = `["Norway"]` + `utan_land: true` (den som anmält
sig utan att köpa saknar land). Då kör konverteraren copykontrollen av sig själv och skriver
segment, inställningar och produktkarta i `plan.json`. Varje fält säger var det lästes. Minst:
- `shopify: { "modul": "klaviyo/shopify-butik.mjs", "butik": "beverbutikken" }`, `butik_url`,
  `sparningssida` `https://beverbutikken.no/pages/spor`, avsändaren `support@beverbutikken.no`,
  tidszonen.
- **`"erbjudande_fran": null`.** Saknas nyckeln läser `konvertera.mjs` Bäverbutikens lyckohjul
  ur `mejl/konfig.json`.
- `per_sprak.nb` med ALLA texter som annars faller tillbaka på de svenska standardtexterna
  (`STD` i `konvertera.mjs`): `fornamn_reserv` ("der"), `grundare`, `verifierad`,
  `knapp_produkt`, **`knapp_till`** (saknas i CaraShells nb, så svenskans "Till produkten" hade
  läckt), `knapp_kassa`, `knapp_titta`, `fakta_anger_rubrik`, `fakta_sparning_rubrik`,
  `fakta_sparning_text`, `angerratt_text` ("14 dagers angrerett"), `lank_suffix` (""),
  `citat: false` och `produktkort`. `trustpilot` läggs till först när Fråga 3 är besvarad.
  CaraShells norska ord är en bra start: de är språk, inte brand.
- Villkorslänkar går till `/pages/retur-og-angrerett`, aldrig `/policies/refund-policy` (404).
- `spoks.installningar`: färgerna och loggan ur `mejl/butiker/beverbutikken.json` (rött
  `#dd1d1d`, svart, vitt sidhuvud, loggan i facit), layout och typsnitt efter Bäverbutikens
  workspace (läs dess `get_settings`, skriv aldrig där). Rubriktypsnittet måste finnas i Spoks
  lista (läs den i `update_settings`-schemat). Mejlfilens stack är Impact med `Anton` som
  Google-reserv. Sidfoten enligt 0e.
- `kalender`: farsdag 2026-11-08 (andra söndagen i november gäller Norge,
  `klaviyo/brands/carashell.json`). Black Week först efter Fråga 4. Inga sista beställningsdagar
  (se Mejlreglerna i steg 8).

**`klaviyo/innehall/beverbutikken/fakta/nb.json`**: butikens EGNA norska texter, ordagrant, för
varje produkt ett mejl visar (titeln, `body_html`, produktsidans punkter och FAQ om de finns),
plus villkoren i facit. Källa: `/products/<handle>.json` eller Admin API. Copyn får bara påstå
det som står här.

Produktsidorna är inte facit ensamma. De byggdes ur Bäverbutikens sidor (`market-expansion/no/`,
augusti 2026) och kan bära samma fel: takovertrekkets sida lovar en oppbevaringspose som
produktminnet förbjuder, och "Vår garanti 30 dager" (läst 2026-09-29). Kontrollera varje påstående mot produktminnet för samma produkt och
stryk det som minnet säger att vi aldrig påstår: `products/carashell/takskyddet/` och
`termoskyddet/` (takovertrekket, frontrutetrekket), `products/tankguard/` (IBC-tanktrekket),
`products/motorholjet/` (marint motortrekk), `products/hemvakten/` (overvåkingskameraet),
`products/kalender/` (adventskalendern), `products/catcabin/` (utekattehuset),
`products/tacklebay/fiskespohallare-4-pack/` (fiskestangholderen) och `products/axelbaltet/`
(skulderbeltet).

## 6. Konverteraren: gör den redo för en tredje Spoks-butik

`node klaviyo/spoks/konvertera.mjs --brand beverbutikken` ska fungera utan att Bäverbutikens
eller CaraShells utfall ändras (`klaviyo/test/konvertera.test.mjs` jämför Bäverbutikens
committade payloads). Läs filen som den ser ut när du kommer dit. Så här såg det ut 2026-09-29:

1. **Butiksnamnen i `kontrollera`** är CaraShells (`carashell` i `FORBJUDET.alla`). Lägg in en
   lista per brand över namn som aldrig får stå i butikens mejl. För Beverbutikken minst
   Bäverbutiken/baverbutiken(.se), Bæverbutiken, CaraShell, Matstrumpor och
   `Beverbutikken@gmail.com`. Beverbutikkens eget namn får stå, eftersom mejlet kommer från
   butiken.
2. **CaraShells produktförbud** (bland annat `oppbevaringspose`, `strikk` och `puster` på
   norska) skrevs för taköverdraget (`products/carashell/takskyddet/dna.md`: "Aldrig påstå:
   förvaringspåse, dragsko …", leverantörens bilder visar dem inte), men de stoppar alla brands
   och alla produkter. Gör dem per produkt. De ska gälla takovertrekket även här: det är samma
   produkt, och dess norska sida säger "Får plass i oppbevaringsposen som følger med" (läst
   2026-09-29). De ska inte stoppa kamadotrekket, vars titel lyder "med oppbevaringspose", eller
   IBC-tanktrekket, vars sida skriver "strikk".
3. **Jämförpriset.** Produktblocken sätter `isOriginalPriceVisible: true`, och 411 av 503
   varianter har ett jämförpris som inte är en förpris enligt § 9a. Lägg in ett val per brand
   (till exempel `per_sprak.nb.visa_jamforpris: false`) som döljer jämförpriset men visar
   priset. De andra brandens standard lämnas som den är.
4. **Norska mönster för beställnings- och fraktdatum** (se Mejlreglerna), till exempel
   "siste bestillingsdag", "bestill innen", "rekker frem" och "frakttid".

Skriv tester för allt: nb-payloaden bär inga svenska standardtexter (`Till produkten`,
`Se produkten`, `Tillbaka till kassan`, `Titta igen`, `Ångerrätt`, `Spåra paketet`,
`Verifierad kund`, `default: 'där'`), inga andra butiksnamn och inget synligt jämförpris, och
Bäverbutiken och CaraShell är oförändrade.

⚠️ Kör aldrig `konvertera.mjs` utan `--brand`. Standard är `baverbutiken`, och då skrivs
Bäverbutikens payloads om: citatmejlen tappar citaten utan recensionscachen. Hände det, kör
`git checkout` på dem.

**Kodrutan.** Sedan 2026-09-29 sätter `konvertera.mjs` rabattkoden som en stor rubrik mellan
två linjer, direkt före stycket "Koden <KOD> …", i varje mejl med `rabatt: { typ: "kod", … }`.
Den är standard för mejl med rabattkod. "Koden" är samma ord på bokmål, så kodstycket skrivs
"Koden <KOD> gir …". Saknas stycket varnar konverteraren.

## 7. Flödesplan och kampanjkalender

Skriv `klaviyo/spoks/beverbutikken/PLAN.md` (kort, för Axel) och innehållet i
`klaviyo/innehall/beverbutikken/{floden,kampanjer}/nb/` innan något laddas upp. En `skelett.mjs`
som CaraShells hjälper. Huvudsessionen äger strukturen: trigger, filter, väntan, block, skäl och
taggar. Startpunkten nedan speglar Bäverbutikens levande flöden (README → "Det som skickar nu")
och den norska datan. Ändra där din mätning eller Axels svar säger annat.

| Flöde | Trigger i Spoks | Filter | Väntan | Mejl | Skäl ur datan |
|---|---|---|---|---|---|
| F01 Velkomst | `contact_created` | samtycke + nb | 0 · 2 d · 3 d; mejl 2 och 3 bara om inget köp sedan start | 3 | den som själv skrivit in sin adress i kundeklubben ska få veta vem som skriver. Sidfotens löfte "eksklusive rabatter og tilbud" får inte brytas (Fråga 4) |
| F02 Forlatt kasse | `checkout_created` | samtycke + nb + inget köp sedan start; återinträde tidigast efter 7 d | 3 h · 1 d · 2 d | 3 | 199 övergivna kassor på 51 dagar. Kassablocket (`abandonedCart`) visar varorna |
| F03 Nettleserhistorikk | `product_viewed` | samtycke + nb + ingen kassa och inget köp sedan start | 4 h · 1 d | 2 | fungerar bara om Spoks får visningarna från sajten. Mät det efter installationen innan flödet byggs |
| F04 Levert: kom alt frem? | `order_delivered` | ej avregistrerad + nb (servicemejl, Fråga 2) | 1 d, kl 10:00 | 1 | 579 fulfillments bär `deliveredAt`. `/sparning beverbutikken` (:32) skriver leveranserna i Shopify, och Spoks läste dem som `order_delivered` i Bäverbutiken (41 inrullade 2026-09-28) |
| F05 Vinn tilbake | `order_created` | samtycke + nb + inget köp sedan start | 120 d · 14 d | 2 | butiken är 51 dagar gammal, så första mejlet går tidigast i januari |
| F06 Montering, en per produkt | `order_delivered` + `triggerFilter externalId` | ej avregistrerad + nb (servicemejl, Fråga 2) | 1 d | 1 | bara produkter där produktsidan har en montering att förklara och som många köper: takovertrekk (172), kranbeskyttelse (164), IBC-tanktrekk (133), marint motortrekk (115), båtmotortrekk (83) |
| F14 Anmeldelse | `order_delivered` | enligt Fråga 3 | 10 d, kl 18:00 | 1 | alla fem stjärnor till samma sida, aldrig review gating |

Inte byggt:
- F04 "etter kjøp" med spårningssidan: Shopifys tre fraktmejl bär redan `BB-`-numret och
  `/pages/spor`. Undantag om Fråga 4 ger en butikskredit som Bäverbutikens.
- Korsförsäljning: 21 riktiga återköp, och inget par förekommer mer än två gånger. Mät om vid
  60 återköp.
- Sunset: Spoks saknar segmenttrigger.
- Rabattflöden: Fråga 4.

**Mejlklassningen styr filtren** (Fråga 1 och 2):
- **Marknadsföring** (F01, F02, F03, F05 och alla kampanjer): bara samtycke som håller i Norge.
  Filtret heter `samtycke` i `konvertera.mjs`. Efter Fråga 1 kan det behöva bli smalare.
- **Servicemejl** (F04 Levert och monteringsmejlen): bara om Axel väljer det i Fråga 2. Filtret
  är då `ej_avregistrerad`, och mejlen har inga produktkort, rabattkoder, "se också"-rader,
  kollektionslänkar eller säljknappar, bara spårningssidan, villkoren och supportadressen. Ett
  enda säljande block gör hela mejlet till marknadsföring (Forbrukertilsynet 2.5.1).

**Kampanjkalendern till och med 29/12:**
- En i veckan, tisdag 18:00, som CaraShell och Matstrumpor. Första kampanjen går tidigast när
  domänen är verifierad, avsändaren satt och Fråga 1 besvarad. Dagliga utskick bara på Axels
  ord (det gällde Bäverbutiken, 2026-09-28).
- Ämnen ur datan: vinterförvaringen (kranbeskyttelse, båtmotortrekk, marint motortrekk,
  takovertrekk, IBC-tanktrekk), feiesettet inför eldningssäsongen, fiskestangholderen,
  arbeidslampen, stigestøtten, adventskalendern med racerbilar (lucka 1 är 1/12), farsdag 8/11
  och jul. Varje ämne ska kunna peka på en källa (EPOST-STRATEGI §5b): en säljare i
  Beverbutikken, en annonsvinnare i Magiborsten NO `1050941584152547`
  (`market-expansion/no/STATUS.md`), eller så märks det som gissning.
- Inga rabatter förrän Fråga 4 är besvarad. Med rabatt: koden läggs i Shopify först
  (`node klaviyo/rea-kod.mjs --brand beverbutikken --suffix NO`, torrt, sedan `--ja` på Axels
  ord; appen har `write_discounts`, mätt 2026-09-29). Mejlet får kodrutan och villkoren i
  kodstycket (e-handelsloven § 9 tredje ledd), och procenten räknas på ett pris som gällt i minst
  30 dagar (§ 9a).
- Titeln i Spoks bär dag, tänkt publik och ämnesrad ("K01 · tir 13/10 18:00 · til: <segment> ·
  <emne>"), eftersom Axel väljer publik och tid i appen.
- Uppvärmningen: domänen är ny och DMARC är `p=quarantine`. De första utskicken går till de mest
  engagerade och till få. Spoks knapp "Generera uppvärmningssegment" (Axels klick,
  `PROMPT-carashell.md` 0b) bygger segmenten ur `subscribed`. Efter Fråga 1 kan de behöva
  snävas in med ditt samtyckesfilter.

## 8. Copy

- **Regel 6.** All slutgiltig mejltext skrivs av subagenter (Agent-verktyget,
  `model: "sonnet"`) på norsk bokmål, direkt ur `fakta/nb.json`, mot `docs/copy-regler.md` och
  briefen (hypotes, block, skäl). Skriv aldrig om Bäverbutikens svenska mejl ord för ord.
  Vinklarna får lånas, meningarna får det inte. Varje fil har tre ämnesrader, en förhandstext och
  tre-frågorstestet (`tretest`). Be om 3–5 versioner av rubriker och ämnesrader.
- **Granskningen.** Sedan en skeptisk granskare per del (`model: "sonnet"`, briefad som
  `matstrumpor/marknader/oversattning/GRANSKARE.md`) som ska HITTA fel: svorsk, påståenden som
  inte står i faktabladet, löften som inte finns, fel ton. Varje fynd som håller rättas i filen.
  Till sist läser huvudsessionen alla mejl som text.
- Huvudsessionen gör strategi, struktur och kontroll, aldrig slutcopyn.

**Mejlreglerna** (varje regel har kostat förut):
- Leveranstiden står aldrig i ett mejl (Axel 2026-09-21 och 2026-09-25). Inte heller ett
  beställnings- eller fraktdatum inför en högtid. Brådskan kommer ur högtidens eget datum. Axel
  om fars dag 2026-09-29: "då tänker folk bara 'what the fuck, vilken lång frakttid'".
- Inga tankstreck (— eller –) i vår text. Katalogens titlar bär tankstreck, så välj bildkort med
  egen titel om de inte får synas.
- Inga belopp och ingen procent i copyn. Priset kommer bara via Spoks produktblock (live ur
  Shopify), utan överstruket jämförpris (§ 9a). Procent bara i ett mejl med rabattkod, och bara
  den kodens.
- Inga citat. Recensionerna på beverbutikken.no är importerade översättningar, inte köp. Att
  signera dem "verifisert kunde" är exakt felet i Bäverbutikens F01 och K01 2026-09-26
  (`klaviyo/spoks/baverbutiken/KVAR.md`). `citat: false`.
- Ingen review gating: alla stjärnor går till samma sida (Bäverbutikens F14, 2026-09-26/27).
- Villkoren: "14 dagers angrerett". Det stämmer och är lagen. Sidorna lovar också "30 dagers åpent
  kjøp", men mejlen nämner det inte: konverteraren stoppar "30 dager" och "åpent kjøp", samma
  regel som i Sverige. Om sidorna ska ändras är Axels fråga, inte mejlens. Aldrig "garanti".
- "Du har handlat X hos oss" står bara i mejl som går till köparna av X (Bäverbutikens K23 och
  K38, 2026-09-29).
- Varje påstående kontrolleras mot produktsidan före uppladdningen.
- Kundeklubben: sajten lovar "eksklusive rabatter og tilbud". Lova inga förmåner som inte finns
  (samma regel som för Matstrumpor-klubben). Om löftet ska hållas avgörs i Fråga 4.
- Köparsegment byggs på kontaktfältet `purchasedProducts` (max 25 id per nod), aldrig på
  händelsen `orderedProducts`, som bara har historik från kopplingen (README, 2026-09-28).
- Mejl som visar priser behöver butikens egen rad om mva och frakt, till exempel "Alle priser
  vises i norske kroner (NOK) og inkluderer mva." och "Fraktkostnaden vises i kassen før du
  fullfører kjøpet." (e-handelsloven § 9 andra ledd). Raden kan stå i sidfoten. Aldrig "300 kr".

## 9. Konvertera och kontrollera

- `node klaviyo/spoks/konvertera.mjs --brand beverbutikken` → `klaviyo/spoks/beverbutikken/payload/nb/`
  och `plan.json` (segment, inställningar, produkter). 0 copyfel. Läs varningarna: "produkt-id
  saknas" får bara finnas före `products_search`.
- `node --test klaviyo/test/*.test.mjs` ska vara grönt, och `npm test` likaså, utom testet
  "nödbromsen: SPARNING_INGEN_PUBLICERING=1". Det är rött i containrar utan
  `SHOPIFY_CLIENT_SECRET_SE_BAVER_SE` (mätt 2026-09-29,
  `matstrumpor/marknader/egna/PROMPT-elevenlabs.md`). Skriv det om det är det enda röda.
- Läs varje payload som text: inga svenska ord, inga andra butiker, inga platshållare
  (`{{spoks:…}}`), och länkarna går till beverbutikken.no och `/pages/spor`.
- Anropa varje länk i payloaderna med `curl`. Den ska svara 200, eller 301/302 till rätt sida.

## 10. Ladda upp i Spoks och läs tillbaka

Receptet är `klaviyo/spoks/PROMPT-carashell-upp.md` steg 2–7, för ett språk. Gå också
igenom Spoks Kom igång-lista (`PROMPT-carashell.md` steg 0b): varje punkt ska vara klar eller
förberedd, och det som är Axels klick står i rapporten. Ett anrop i taget, och varje objekt
läses tillbaka innan nästa skapas:
1. **Inställningarna:** `get_settings` → `update_settings` (först utan `acknowledgeWarnings`,
   läs varningarna) → `get_settings`. Avsändaren sätts först efter Verify (0d).
2. **Segmenten:** `preview_segment` (skriv antalet) → `create_segment`. Finns namnet redan:
   `update_segment`. Kampanjsegmenten bär alltid samtycket (Fråga 1).
3. **Flödena:** `get_flow_blueprints` först (Spoks egen instruktion), sedan `create_flow`
   (inaktivt) → `add_flow_step` i ordning → `update_draft_campaign` per mejl (`flowId`, `postId`,
   `currentHash`, `postData`). Efteråt `get_flow`: event, filter, `triggerFilter`, väntetider,
   `tilHour`, `isActive: false` och `isEnabled: false` på varje sändsteg. `get_flow`
   rate-limitas: läs ett flöde i taget, och vid "Try again in N seconds" väntar du och läser
   igen en gång.
4. **Kampanjerna:** `draft_campaign` med `isOptOutEnabled: true` och titeln med dag, publik och
   ämnesrad. Ingen publik, inget datum. `get_settings` före första kampanjen (Spoks egen
   instruktion).
5. **Räkna:** `get_flows`, `search_campaigns` (status draft) och `get_segments` mot `plan.json`.
   Stämmer det inte: hitta felet, rätta, räkna igen. Avbryts du mitt i: läs namnen först och
   bygg klart det halvfärdiga, aldrig dubbelt (CaraShell, 2026-09-26).

Skriv varje id i `klaviyo/spoks/beverbutikken/spoks-id.json` (formen som
`carashell/spoks-id.json`) medan du bygger.

## 11. Dokumentera, committa, merga

- `klaviyo/spoks/README.md`: ett nytt avsnitt "Beverbutikken". Där står workspacen, mätningen,
  DNS före och efter, samtyckesbeslutet med citaten, flöden och kampanjer med id och länk, det
  som inte gick och Axels klick.
- I repot: `klaviyo/spoks/beverbutikken/` (`spoks-id.json`, `PLAN.md`, `produkter.json`,
  `plan.json`, `payload/nb/`), brandfilen och innehållet.
- En rad i `CLAUDE.md` → avsnittet `klaviyo/`, i samma form som CaraShells och Matstrumpors
  Spoks-rader.
- `git pull origin main` först. Sedan commit på svenska med attributionsraderna ur
  systemprompten, push, PR mot `main` och merge när testerna är gröna.

## 12. Rapporten till Axel

- Svenska, kort: vad som finns i Spoks (antal, avstängt eller utkast), vad som väntar och på vad.
- Frågan som väntar på honom, bara en.
- Sist rubriken **Dina uppgifter**: numrerade, högst fem, en mening per rad, med knapp och länk.
  Det brukar vara DNS-raderna hos Domeneshop, Verify i Spoks, Shopifys egna automatiseringar för
  övergiven kassa (av innan F02 slås på; de ligger under Marknadsföring → Automatiseringar,
  Matstrumpor 2026-09-26), sändstegen och flödena i appen (sändstegen först, sedan flödet; Spoks
  vägrar annars med rutan "Detta flöde har inga aktiva åtgärder"), och publik och tid per
  kampanj. Har han inga uppgifter: skriv "Inga just nu."

## 13. Frågorna till Axel (en i taget, i den här ordningen)

Ställ nästa fråga först när den förra är besvarad. Bygg under tiden det som inte hänger på
svaret. Anpassa orden efter vad kontrollerna visade, och sätt ditt råd och skälet vid ett
alternativ.

**Fråga 1, samtycket.** Ställs om kontrollen i 0c visar att rutan är förikryssad, eller om
ursprunget inte går att visa. Till exempel:
"85 % av ordrarna har kundens ja till e-postreklam, mot 4 % hos CaraShells norska kunder, och
rutan i kassan är förikryssad. I Norge räknas en förikryssad ruta inte som samtycke, och vi får
inte heller mejla kunderna för att be om ett nytt ja (Forbrukertilsynet). Vad väljer du?
A) Ta bort förikryssningen nu. Kampanjer och säljande mejl går bara till dem som själva skrivit
in sin adress, och till nya ja efter bytet.
B) Ta bort förikryssningen nu, men räkna alla som har ja i dag. Risken är en
överträdelseavgift från Forbrukertilsynet.
C) Låt en jurist titta först. Inga kampanjer tills dess, men servicemejlen byggs ändå."
Förikryssningen tas bort av Axel i Inställningar → Kassa (Shopifys hjälpsida: "select no regions
to make the consent checkbox never be preselected in any region"). Vid A förbereder du också en ny
text vid rutan som säger vem, vad och hur ofta (2.6.1). Samma regler som i `samtyckesruta.mjs`:
en mening, högst 100 tecken, orden e-post och tilbud, inga siffror och inga tankstreck. Texten
läggs in av Axel (Inställningar → Kassa, "edit the default text") eller av skriptet, om appen
först får `write_themes` och `write_translations` (den saknar dem, mätt 2026-09-29).

**Fråga 2, köparmejlen till köpare utan samtycke.** Till exempel:
"Nästan alla kunder har köpt en gång (1 125 av 1 153). I Norge räcker ett engångsköp som
huvudregel inte för att skicka reklam utan samtycke, men rena servicemejl får gå. Vad väljer du?
A) Bara servicemejl: 'kom allt fram?' och monteringshjälp för det de köpt, utan produkter, koder
eller säljknappar. Allt säljande går bara till samtycke.
B) Som i Sverige: köparflödena, även de säljande, till alla köpare som inte tackat nej (§ 15
tredje ledd). Risken: Forbrukertilsynet säger att ett engångsköp inte räcker.
C) Inga mejl alls till köpare utan samtycke."

**Fråga 3, recensionerna.** Till exempel:
"Det finns ingen Trustpilot-profil för beverbutikken.no (sidan svarar 404), och recensionerna på
sajten är importerade. Judge.me:s egna förfrågningar är [PÅ/AV enligt kontrollen]. Vad väljer du?
A) Du registrerar Beverbutikken på Trustpilot (dina egna klick, som för CaraShell), och sedan
bygger jag recensionsmejlet: alla stjärnor till samma sida, bara till kunder med samtycke.
B) Judge.me:s egna förfrågningar räcker. Inget recensionsmejl i Spoks.
C) Inget recensionsmejl nu."
Trustpilot-kontot registreras med en adress på butikens egen domän (`support@beverbutikken.no`),
annars kräver Trustpilot domänverifiering med DNS eller HTML (README, 2026-09-27). Cowork skapar
aldrig kontot.

**Fråga 4, rabatterna.** Till exempel:
"Sidfoten lovar kundeklubben 'eksklusive rabatter og tilbud', och koden VELKOMMEN10 (10 %) finns
men har aldrig använts. Vad väljer du?
A) VELKOMMEN10 i välkomstmejlet, och Bäverbutikens Black Week-trappa (10/20/30 % vid 1/2/3 varor)
i Black Week-mejlen.
B) Bara Black Week-trappan.
C) Inga rabatter i mejlen, och sidfotens löfte om rabatter tas bort (ditt klick i temat)."
Trappan läggs in med `node klaviyo/black-week-trappa.mjs --butik beverbutikken`, torrt först. Tre
Kaching-rabatter är redan automatiska, och Shopify ger kunden den bästa när rabatter inte går att
kombinera. Kontrollera det innan `--ja`.

**Fråga 5, planen.** Ställs bara om flöden plus kampanjer går över månadsgränsen.

## 14. Definition of done (✅/❌ punkt för punkt i sista svaret)

- [ ] `whoami` visar Beverbutikkens workspace (Shopify `1acuam-s5`). Id och slug står i
      brandfilen och i `spoks-id.json`.
- [ ] Kassans ruta är kontrollerad (Cowork eller skärmdump). Fråga 1–4 är ställda, en i taget,
      och svaren står i README. Annars ❌ med "väntar på Axel".
- [ ] Mätningen (steg 4) står med datum i README. Inga kundadresser i repot.
- [ ] Brandfil, `fakta/nb.json`, innehåll och `PLAN.md` är committade.
- [ ] `konvertera.mjs --brand beverbutikken` ger 0 copyfel. Bäverbutikens och CaraShells payloads
      är oförändrade, de nya testerna finns och `klaviyo/test` är grönt.
- [ ] Copyn är skriven av sonnet och granskad av en skeptisk sonnet-granskare. Varje fil har
      tre-frågorstestet, och huvudsessionen har läst allt.
- [ ] Spoks: inställningarna är tillbakalästa (avsändaren efter Verify, sidfoten med kontorets
      adress, ingen gammal adress). Segment, flöden (alla `isActive: false`, alla sändsteg
      `isEnabled: false`) och kampanjer (`draft`, ingen publik, inget datum) är räknade mot
      `plan.json`.
- [ ] DNS: Spoks poster är inlagda av Axel och mätta före och efter (dns.google och Cloudflare).
      NS, A, MX, www och `_dmarc` är oförändrade, och det finns exakt en SPF-rad.
- [ ] Shopifys egna automatiseringar för övergiven kassa: statusen är känd, och de är av innan
      F02 slås på.
- [ ] README-avsnittet, `spoks-id.json` och raden i CLAUDE.md finns. Commit, PR och merge till
      `main` är gjorda.
- [ ] Rapporten är på svenska och kort, med en fråga och Axels klick sist.

## 15. Kända fällor (datum, och var det mättes)

1. `baverbutiken` (Sverige) och `beverbutikken` (Norge) skiljer på två bokstäver.
   `klaviyo/spoks/baverbutiken/` är Bäverbutikens. Kontrollera sökvägen vid varje skrivning.
2. Via MCP skapas sändsteg alltid avstängda, och ett aktivt flöde går inte att ändra ("Cannot
   edit a step in an active flow"). Fel i ett live-flöde rättas med en kopia som byggs inaktiv
   (README, 2026-09-26).
3. Den stora flödesknappen i appen stänger bara triggern. Ett mejl som inte får gå ut stängs av
   på sitt eget sändsteg (README, 2026-09-27).
4. `get_flow` rate-limitas vid många anrop i följd ("Try again in 11 seconds", CaraShell
   2026-09-27). De kontaktläsande verktygen körs ett i taget, och vid rate limit stannar du
   (Spoks egen instruktion).
5. Steg som MCP:n byggt saknar `parameters.name`, så Axel ser dem på ämnesraden (README,
   2026-09-26/27).
6. Spoks lägger om ordningen på korten i ett produktblock med flera produkter (2026-09-29). Skriv
   aldrig "den till vänster".
7. Importerade kontakter saknar händelsehistorik i Spoks, så engagemangssegmenten är tomma först.
   Spoks vägrar också en konjunktion med bara en nod (Matstrumpor, 2026-09-26).
8. `senderEmail` går inte att sätta före Verify (`custom_domain_not_valid`), och Google-resolvern
   visade gamla DNS-svar i upp till en timme (Matstrumpor, 2026-09-26).
9. Shopifys egna mejl om övergiven kassa ligger under Marknadsföring → Automatiseringar, inte
   under Aviseringar (Matstrumpor, 2026-09-26).
10. `konvertera.mjs` utan `--brand` skriver om Bäverbutikens payloads. Saknas `erbjudande_fran`
    laddas Bäverbutikens lyckohjul, och `knapp_till` saknas i CaraShells nb (läst 2026-09-29).
11. `black-week-trappa.mjs` tolkar `flersprakig: true` som flera marknader och flyttar slutet
    till 2026-12-01T08:00Z för Kalifornien. Kontrollera slutet och titeln före `--ja` (läst
    2026-09-29).
12. Spoks egen kupongruta ser bara Shopify-rabatter som redan är aktiva. Schemalagda koder syns
    inte, därför kodrutan (README, 2026-09-29).
13. Frågar Spoks-verktygen om lov vid varje anrop: Axel satte dem på "Tillåt alltid" på
    https://claude.ai/customize/connectors 2026-09-26. Säg det till honom om det händer igen.
14. Butikens sidor skickar kunderna till `Beverbutikken@gmail.com`, medan kontaktmejlet är
    `support@beverbutikken.no`, och `/policies/refund-policy` svarar 404 fast
    `kundtjanst/brands/beverbutikken.yaml` pekar dit (2026-09-29). Mejlen svarar till support@ och
    länkar till `/pages/retur-og-angrerett`. Sidorna är inte den här sessionens.
