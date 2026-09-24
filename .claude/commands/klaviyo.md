# /klaviyo – E-postmarknadsföringen i Klaviyo (Bäverbutiken först)

Argument: `$ARGUMENTS` — ett underkommando, valfritt `--brand <id>`
(standard `baverbutiken`). Exempel: `/klaviyo kolla` · `/klaviyo cs` ·
`/klaviyo ladda-upp --brand baverbutiken`

| Underkommando | Vad |
|---|---|
| `kolla` | Nyckel, konto, metriker, inventering → `klaviyo/konto/<brand>/lage.json` |
| `bygg` | Innehållsfilerna + Shopify-priser → byggda mejl + galleriet, publicerat |
| `ladda-upp` | Segment, mallar, kampanjer, flöden → Klaviyo, **alltid som utkast** |
| `rapport` | Kampanj- och flödesrapporter → utfall + lärdomar i kampanjloggen |
| `cs` | Veckoloopen: rapport → lärdomar → 2–3 nya koncept → briefer → copy → bygg → ladda upp |

**Läs först, varje gång:** `docs/os/EPOST-STRATEGI.md` (strategin, grinden,
etiketterna, copyreglerna för mejl, kalendern) och `klaviyo/ARKITEKTUR.md`
(motorns kontrakt och järnregler). VA:ns klick står i `klaviyo/sop/`.

## ⛔ Tre saker kommandot aldrig gör

1. **Skickar eller schemalägger.** Allt skapas som utkast (Draft, flödesmejl
   `draft`). Ett utskick är Axels beslut, eller VA:ns klick efter hans ok.
2. **Släpper in någon utan samtycke.** Varje kampanjsegment har
   `subscription: "subscribed"`; `any` och `never_subscribed` är förbjudna
   (MFL 19–20 §, EPOST-STRATEGI §3). Uppladdaren vägrar — kör aldrig runt den.
3. **Blandar butiker.** Nyckeln är `KLAVIYO_API_KEY_<BRAND>`, kontot ska svara
   med brandfilens `public_id` (Bäverbutiken `TMFt7M`). Ingen Grillkliniken-,
   Mastern- eller SnarkLös-rad i copyn, inga rader ur `docs/playbook.md`,
   `docs/winning-lines.md` eller `docs/swipes/` (de är Grillklinikens).

**Inga schemalagda rutiner.** Axel kör `/klaviyo` för hand tills han säger
till (Arvids princip: rutinen ska fungera med Claude först). Bygg ingen trigger,
föreslå ingen `/rutin`.

Ett kommando per Bash-anrop, kedja aldrig med skaloperatorer.

---

## `kolla`

1. `node klaviyo/kolla.mjs --brand <brand>`. Första gången nyckeln finns:
   `node klaviyo/kolla.mjs --brand <brand> --prov` — det mäter de sju
   obekräftade punkterna i ARKITEKTUR (editor_type, content-type, kassametrikens
   namn, flödesmallar, send_strategy, händelsevariablerna, sum-måttet).
2. Läs utskriften rad för rad. Rapportera i klartext:
   - nyckeln finns / saknas (variabelnamnet),
   - `public_api_key` = brandfilens `public_id` — **nej ⇒ stopp, inget skrivs**,
   - avsändaren i kontot (är den `@baverkoppling.se`: säg det — den domänen
     saknar MX, EPOST-STRATEGI §4),
   - metrikerna: Placed Order och kassametriken, id per namn; två träffar eller
     ingen ⇒ stopp med orsak,
   - attributionsfönstret för e-post om kontot visar det,
   - vad som redan finns (listor, segment, mallar, kampanjer, flöden med `MAIL_`/
     `FLOW_`/`TPL_`/`SEG_`-namn).
3. Resultatet av `--prov`: skriv in varje mätt punkt i `klaviyo/ARKITEKTUR.md`
   under "Obekräftat" med datum och vad som svarade. Gissa aldrig en punkt grön.

## `bygg`

1. `node klaviyo/bygg.mjs --brand <brand>`. Priser, bilder och länkar hämtas ur
   Shopify vid varje bygge — aldrig ur en brief.
2. Stoppar bygget (tre-test med `false`, tankstreck, "30 dagar", kr-belopp som
   inte är produktens pris, saknad taggrad, saknad avregistrering): **rätta
   innehållsfilen, aldrig spärren.** Är det copyn: skicka tillbaka raden till
   Sonnet-subagenten (se `cs` steg 6), skriv inte om den själv.
3. Titta på minst ett byggt mejl per kampanj (skärmdump via Chromium om den
   finns, annars öppna HTML-filen): mobilbredd, bilder, knappar, sidfot med
   avregistrering och adress.
4. Publicera galleriet (sökvägen som `bygg.mjs` skriver ut) som Artifact, **samma
   URL som förra gången**: leta med `action: "list"` efter galleriet och skicka
   `url`. Saknas länken: publicera, och skriv URL:en i `klaviyo/README.md` under
   "Galleriet". Artefakter är bundna till kontot — hittas länken inte i `list`
   sitter du på Axels andra konto: säg det.

## `ladda-upp`

1. **Torrt först, alltid:** `node klaviyo/ladda-upp.mjs --brand <brand>` (torrt är
   standard). Läs planen: vad som skapas, vad som hoppas (finns redan på namn),
   vilka segment, att varje kampanjsegment bär samtyckesvillkoret.
2. **Skarpt bara när `kolla` är grön i samma session** (nyckel, konto-id,
   metriker): `node klaviyo/ladda-upp.mjs --brand <brand> --skarpt`. Ändrade
   mallar/kampanjer i utkastläge: lägg till `--uppdatera`.
3. Dygnstaken (flöden och segment 100/dygn, 15/min): slår körningen i ett tak,
   stanna och säg det — kör inte om i en loop.
4. Läs tillbaka: `node klaviyo/kolla.mjs --brand <brand>` ska visa de nya
   objekten, alla kampanjer som **Draft**, alla flödesmejl som **draft**.
   Något annat ⇒ stopp, rapportera exakt vad.
5. `klaviyo/konto/<brand>/uppladdat.jsonl` är minnet mellan körningar — committa det.

## `rapport`

1. `node klaviyo/rapport.mjs --brand <brand>` (ett anrop per rapport, 2/min,
   225/dygn — kör den inte flera gånger i rad). `--dagar <n>` ändrar fönstret;
   `--break-even <x>` bara med ett värde ur `products/products.json` för en
   kampanj som säljer EN produkt — aldrig ett gissat tal. Skriptets etiketter
   (`LARM_LEVERANS`, `FOR_TIDIGT`, `BEDOMBAR`, `VINNARE`, `FORLORARE`) står i
   EPOST-STRATEGI §8d; `BREAKTHROUGH` och `INGEN_LEVERANS` sätter du i lärdomen.
2. Följ `docs/os/EPOST-STRATEGI.md` §8 i ordning och visa det i svaret:
   - **Datakontroll:** Klaviyos konverteringsvärde mot Shopify-ordrar med
     `utm_source=klaviyo`; studsgrad över 2 % ⇒ `INGEN_LEVERANS`.
   - **Grinden:** minst 3 konverteringar OCH minst 500 levererade, per utskick och
     per variant. Under grinden eller före dag 7 ⇒ `FOR_TIDIGT`, ingen dom.
   - **Vinstbidrag** = konverteringsvärde ÷ `break_even_roas` ur
     `products/products.json`, utan moms. Saknas break-even ⇒ "okänt, orsak:
     break-even saknas för <produkt>", aldrig en gissad marginal.
   - **Tabellen**, sorterad på vinstbidrag: utskick · levererade · konverteringar ·
     värde · intäkt/mottagare · vinstbidrag · per 1 000 levererade · avreg % ·
     spam % · etikett. Öppningsgrad står aldrig som dom.
   - **Larm:** spam > 0,3 % eller avreg > 1 % ⇒ högst upp i svaret, och steg 3
     i `klaviyo/sop/E06-LIST-HEALTH.md` gäller.
   - **Flödena** på 30 dagar; det flöde som drar mest vinstbidrag är riktmärket.
3. **Skriv lärdomen** för varje utskick som passerat dag 7 i
   `klaviyo/logg/<brand>/kampanjlogg.md`, i mallen i EPOST-STRATEGI §8e.
   Skriptet föreslår siffrorna; lärdomen (planerat mot utfört, hypotes märkt
   gissning, konkreta nästa utskick) skriver huvudsessionen.
4. Har produkten `products/<id>/dna.md`: en rad under `## E-post` (datum, namn,
   etikett, lärdomen i en mening, bevisad/hypotes). Vann en ämnesrad med ett begär
   annonserna inte testat: koncept i `products/<id>/backlog.md` med
   `kalla=egen-data (mejl <namn>)`.
5. Committa och pusha `klaviyo/logg/` och ändrade `products/`-filer.

## `cs` — veckoloopen (måndag)

Hela kedjan utan att invänta godkännande mellan stegen. Godkännandet kommer
sist, från Axel, innan något schemaläggs.

1. **Repot:** `git pull --rebase origin main`.
2. **Rapporten:** kör `rapport` ovan, hela, med lärdomar.
3. **Räkna taket:** nya koncept denna vecka ≤ antal lärdomar skrivna sedan förra
   `cs`, och ≤ 5. Första veckan: 3. Skriv talet i svaret ("3 lärdomar ⇒ högst 3
   koncept").
4. **Mixen ur etiketterna** (EPOST-STRATEGI §6): finns en levande mejl-`BREAKTHROUGH`
   ⇒ 80 % iterationer på den; annars 80 % nya koncept. Minst ett av fem nya är
   `N` eller `voc`. En `IM` itereras aldrig. Skriv mixen och varför.
5. **Välj 2–3 koncept, var och ett med källa.** Läs för varje produkt
   `products/<id>/dna.md`, `batch-log.md`, `invandningar.md`, `lardomar.md`,
   `feedback.md` om de finns, samt kampanjloggen. Källan skrivs som fil:rad
   (`kalla_ref`). Utan källa ⇒ `kalla=gissning`, `confidence=low`, och det står i
   memot. Annonsvinnaren med mest vinstbidrag blir hook (EPOST-STRATEGI §5c);
   invändningar blir innehåll (`OB`, `voc`). Kolla kalendern (§10): ligger en
   sista beställningsdag inom två veckor är `urgency=sasong` riktig — annars är
   den det inte. Läs upptagna nummer i Klaviyo, `klaviyo/innehall/` och
   kampanjloggen innan du namnger (EPOST-STRATEGI §7).
6. **Brieferna** i `klaviyo/innehall/<brand>/BRIEFER.md`, en per koncept, av
   huvudsessionen: namn, memo (hypotesen i en mening), hela taggraden (typ, kalla,
   kalla_ref, lardom, avatar, begar ur ANALYSMETOD:s lista, awareness, urgency,
   confidence, prefix, kod), segment och exkludering (uppvärmningstrappan i §4
   avgör vilket segment som är tillåtet denna vecka), planerad tid, produkter
   (handles), de **tre begären** ämnesraderna ska bära, blockordningen.
7. **Copyn skrivs av en subagent** (CLAUDE.md regel 6): Agent-verktyget med
   `model: "sonnet"`. Skicka: DNA-raden/källan, memot, briefen, formatkraven
   (tre ämnesrader, en per begär, förhandstext, blocken i ARKITEKTUR:s format), hela
   `docs/copy-regler.md` och EPOST-STRATEGI §9. Be om 3–5 versioner per rad och
   tre-frågorstestet per rad. Subagenten skriver bara text — inga priser, inga
   datum den inte fått, inga recensioner. Huvudsessionen väljer versionerna.
8. **Kampanjfilerna:** `klaviyo/innehall/<brand>/kampanjer/<id>.json` enligt
   ARKITEKTUR (mejlet + `planerad`, `segment`, `exkludera`, `status_plan`,
   `tretest`). Aldrig ett pris i klartext.
9. **Bygg** (`bygg` ovan, med galleriet) och **ladda upp** (`ladda-upp` ovan,
   torrt sedan skarpt, som utkast).
10. **Stegtabellen i `klaviyo/sop/README.md`:** räkna upp "Claude rätt veckor i
    rad" för varje steg som gick utan rättelse från Axel, nollställ de som fick en.
11. **Committa och pusha** `klaviyo/innehall/`, `klaviyo/logg/`,
    `klaviyo/konto/`, `klaviyo/sop/README.md` och `products/`.

## Leverans till Axel (kort, svenska)

- Larm först, om något.
- Rapporttabellen (sorterad på vinstbidrag) och en rad per lärdom.
- Veckans koncept: namn, memo, källa, de tre begären, segment, planerad tid.
- Galleriets länk.
- **Axels uppgifter sist, numrerade**, en mening per rad, med exakt var han
  klickar.

## Definition of done (markera ✅/❌ sist)

- [ ] `docs/os/EPOST-STRATEGI.md` och `klaviyo/ARKITEKTUR.md` lästa i sessionen
- [ ] `kolla` grön (nyckel, `public_id`, metriker) innan något skrevs skarpt
- [ ] Allt i Klaviyo är utkast — tillbakaläst, inget schemalagt, inget Live
- [ ] Varje kampanjsegment bär `subscribed`; inget segment med `any`
- [ ] Rapporten: datakontroll, grind, vinstbidrag (eller "okänt" med orsak), tabellen sorterad på vinstbidrag, ingen dom på öppningsgrad
- [ ] Larm (spam > 0,3 %, avreg > 1 %) överst i svaret, om några
- [ ] En lärdom per utskick som passerat dag 7, i mallen, i kampanjloggen
- [ ] `## E-post` i `dna.md` och backlog-rader uppdaterade där produkten har minne
- [ ] Nya koncept ≤ lärdomar (≤ 5), mixen redovisad, varje koncept med källa eller märkt gissning
- [ ] Ingen rad ur `docs/playbook.md`, `winning-lines.md` eller `swipes/`
- [ ] Copy skriven av Sonnet-subagent med `docs/copy-regler.md`; tre-frågorstestet i varje kampanjfil
- [ ] Bygget grönt: inga tankstreck, "14 dagars ångerrätt", "5-10 arbetsdagar", inga kr-belopp i copyn, ingen falsk brådska
- [ ] Galleriet publicerat på samma URL
- [ ] Stegtabellen i `klaviyo/sop/README.md` uppdaterad
- [ ] Committat och pushat
- [ ] Axels uppgifter står sist, numrerade

## Axels uppgifter (tills de är gjorda — stryk varje rad som är klar)

Inget utskick går förrän 1–4 är gjorda (EPOST-STRATEGI §13).

1. Svara vilka som får kampanjmejl: A bara de som sagt ja (rekommenderas), B även köpare i kategoriflöden, C alla köpare.
2. Kolla i Shopify admin → Inställningar → Kassa om rutan för reklammejl är förikryssad, och svara ja eller nej.
3. Lägg in DMARC och `send.baverbutiken.se` hos Loopia (DNS för baverbutiken.se) med posterna Klaviyo visar, och byt avsändaren i Klaviyo till `kundsupport@baverbutiken.se`.
4. Säg vilken Klaviyo-plan kontot har (Klaviyo → Settings → Billing).
5. Skapa API-nyckeln: Klaviyo → Settings → API keys → Create Private API Key → Full access, och lägg in den på claude.ai som `KLAVIYO_API_KEY_BAVERBUTIKEN`.
6. Säg vilken Discord-kanal e-postlarmen ska gå till.
7. Den dag flödet för övergiven kassa slås på: stäng av Shopifys egen notis i Shopify admin → Inställningar → Aviseringar → Övergiven kassa.
