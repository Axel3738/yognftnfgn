# /konkurrentdodaren — Konkurrentdödaren: hittar kopior av våra produktsidor och annonser, skriver varningsbrevet + fakturan, skickar ALDRIG utan Axel

Argument: `$ARGUMENTS` — normalt tomt (rutinen, varje morgon). Axels egna verb:

```
/konkurrentdodaren                          rutinen: sök → jämför → ärenden → rapport → granskningssidan
/konkurrentdodaren --torr                   provkör: allt utom minne, Discord, artifact och push
/konkurrentdodaren kolla <url> [handle]     Axel klistrar in en misstänkt sida — jämförs mot allt vårt
/konkurrentdodaren annons <sid-id/länk>     Läser konkurrentens ANNONSER ur annonsbiblioteket härifrån (räckvidd per annons)
                                            — ärende ur annonserna, även när deras sajt är ren; Axels kriterier avgör om sidan jagas
/konkurrentdodaren skicka KD-2026-001 [--till adress] [--sprak sv|en] [--kopare "Bolag AB, adress"] [--utan-faktura] [--direkt]
                                            Axels godkännande: brev + faktura som UTKAST i Stonebite-Gmail (--direkt = skicka därifrån)
/konkurrentdodaren skickad KD-2026-001      kvittot när Axel själv tryckt Skicka i Gmail
/konkurrentdodaren faktura KD-2026-001      bara fakturan (titta på den, eller efter ändrad taxa)
/konkurrentdodaren anmal KD-2026-001        Meta-anmälningarna: EN per kopierad annons, allt ifyllt + bevisbild → Axel verifierar EN gång
/konkurrentdodaren anmald KD-2026-001 --nr 1 --referens <Metas nr>   kvittot per inskickad anmälan (skrivs av sessionen)
/konkurrentdodaren avfarda KD-2026-001 "ingen kopia"
/konkurrentdodaren paminn KD-2026-001       påminnelsen (brev 2) när fristen gått ut och kopian ligger kvar
/konkurrentdodaren eskalera KD-2026-001 ["anmält till Meta"]
/konkurrentdodaren lista
```

Uppdraget i en mening: **hitta butiker och annonser som kopierat våra
produkttexter, bilder eller annonstexter, lägg fram bevisen så att Axel kan
döma på en minut, och skicka ett varningsbrev med en färdig faktura som
biter — men bara efter att han sagt ja.** (Axels beställning 2026-09-27:
"Konkurrentdödar-rutinen. Den skickar ut ett mail automatiskt … Detta måste
jag granska först för att se om dom rippat." Och 2026-09-29: brevet går från
Stonebite-mejlen, inte kundtjänsten — "mycket mer seriöst" — "vi skickar med
en färdig faktura".)

⛔ **Rutinen skickar aldrig ett brev själv.** Ett ärende föds som `ny` och
lämnar det läget bara när Axel skriver `skicka`, `skickad` eller `avfarda`.
Koden vägrar `ny → skickad` från rutinen (`konkurrenter/arenden.mjs
overgang`, testat). Förslå aldrig att "skicka ändå", och skicka aldrig något
från Gmail utan att Axel skrivit `skicka <id> --direkt` i den här chatten.

⛔ **Avsändaren är bolaget, inte butiken** (Axels beslut 2026-09-29):
brevet och fakturan går från **Stonebite-mejlen** (`konkurrenter/konfig.json`
→ `brev.avsandare.mail`, `contact@stonebite.org`) via **Gmail-connectorn i
sessionen**. Skriptet skickar inget — det bygger sändpaketet, sessionen
lägger det i Gmail. Kundtjänstbrevlådorna (`KUNDTJANST_MAIL_PASS_<ID>`) behövs
INTE längre; `--via loopia --ja` finns kvar som reserv om Gmail inte går.

⚠️ **Bevis, aldrig känsla.** Varje ärende bär mätta tal: ord i följd,
täckning, bildavstånd i bitar, skärmdump med tidsstämpel. Brevet räknar upp
bara det som mättes (`konkurrenter/brev.mjs bevisrader`), och fakturan har en
rad per mätt sak (`konkurrenter/faktura.mjs`, taxan i `konfig.json` →
`faktura.taxa`). Skriv aldrig till en konkurrent om något rutinen inte har
bevis för, och lägg aldrig till egna anklagelser eller belopp.

⚠️ **Marknadsplatser och sociala nätverk (Amazon, Temu, AliExpress, Facebook …)
är inte konkurrenter här** — leverantörens egna bilder ligger lagligt där och
ett brev dit går ingenstans (`konfig.json` → `ignorera_domaner`).

CONNECTORS: **Gmail** (bara för `skicka`, i Axels egen session — rutinen
behöver den inte och ska inte ha den). Meta läses med `META_ACCESS_TOKEN`
(egna annonser, vår CPM), Ad Library med `META_ACCESS_TOKEN_ADLIBRARY` (den
verifierade personens användartoken; utan den provas `META_ACCESS_TOKEN`,
som svarar "saknar behörighet"), Discord med `DISCORD_BOT_TOKEN`. Webbsökningen görs av **sessionens WebSearch-verktyg**
(steg 2) — Bing svarar en container med slumpsidor (mätt 2026-09-27:
"baverbutiken" gav Texas Longhorns), DuckDuckGo och Google spärrar.

Ett kommando per Bash-anrop — kedja aldrig med `&&`, `;` eller `|` utom där
steget skriver det.

## Rutinen (tomt argument eller `--torr`)

### 0. Senaste koden

`git pull --rebase origin main`. Konflikt: `git rebase --abort`, skriv det som
första rad till Axel och kör vidare på den kod som finns.

### 1. Fraserna

`node konkurrenter/kor.mjs --fraser`

Skriptet läser butikernas produkter (publika `/products.json`), de annonser
som visas just nu (Meta), väljer dagens produkter (annonserade först, sedan
rotation: aldrig kollad, äldst kollad) och skriver två fingeravtryck per
produkt — meningar på 7–16 ord utan siffror och utan butiksnamn — till
`konkurrenter/output/<datum>.fraser.json`. Läs utskriften: produkter "för
lite text" (OPS-butikernas texter ligger i temat, inte i `body_html`) hoppas
med orsak.

### 2. Sök — det här är sessionens jobb

För varje fras i filen (max 40 per körning, i filens ordning): kör
**WebSearch** med frasen inom citattecken, exakt som den står. Ta de
träffar som INTE är våra egna domäner (`konfig.json` → `egna_domaner` +
`sparning/butiker.json`) och inte marknadsplatser/sociala nätverk
(`ignorera_domaner`), högst 8 per fras. Skriv
`konkurrenter/output/<datum>.kandidater.json`:

```json
{ "datum": "<datum>", "kandidater": [ { "fras": "<frasen exakt som i fraser.json>", "url": "https://…", "titel": "<träffens titel>" } ] }
```

Frasen måste vara ordagrant densamma som i `fraser.json` — det är så
skriptet vet vilken produkt kandidaten ska jämföras med. En träff som
uppenbart är något annat (en dikt, en kommunsida) får ändå stå kvar:
likhetstalen sorterar bort den gratis, ett hopp du gör i huvudet kan missa
en kopia. Saknas WebSearch-verktyget i sessionen: skriv filen med tom lista
och raden `"orsak": "WebSearch saknas i sessionen"`, och skriv det som första
rad till Axel — Ad Library och Axels egna länkar körs ändå.

### 3. Hämta och jämför

`node konkurrenter/kor.mjs --hamta`

Skriptet hämtar varje kandidatsida (Shopify-produkter via `.json`), letar
e-post och org.nr på kontaktsidorna, jämför texten mot vår produkttext och
våra annonstexter (ordagranna sviter ≥ 8 ord, täckning av 5-ordssekvenser),
hashar bilderna i Chromium (dHash, ≤ 6 bitar = samma bild), tar skärmdump på
träffarna och frågar Ad Library (svarar "saknar behörighet" tills Axel
verifierat sig hos Meta). Skriver `konkurrenter/output/<datum>.json`. Rör
inte minnet. Mätt vid bygget 2026-09-27: en kandidat tar 3–8 s.

### 4. Rapport, ärenden, sida

1. `node konkurrenter/kor.mjs --rapport --torr` — läs den svenska rapporten.
2. Är `$ARGUMENTS` `--torr`: sluta här. Annars:
   `node konkurrenter/kor.mjs --rapport --discord`

Skriptet föder ärenden (`KD-<år>-<nnn>`) ur fynden — samma domän + samma
produkt är ett ärende, ett avfärdat föds inte om — skriver
`konkurrenter/arenden.jsonl`, `konkurrenter/arenden/<id>.md`,
`arenden/<id>/skarmdump.jpg` + `miniatyrer.json`, `konkurrenter/lage.json`,
bygger granskningssidan `konkurrenter/output/sida.html` och postar en
engelsk rad per verksamhet i Discord `#copycats` (bara när något är nytt;
Axel pingas). Exit 3 = svensk text stoppad, exit 4 = Discord svarade inte —
minnet är skrivet, säg det som första rad till Axel.

### 5. Uppföljning av skickade brev

`node konkurrenter/kor.mjs --foljupp`

Varje ärende med brev ute läses om: är kopian borta (sidan 404 eller under
tröskeln) blir ärendet `atgardad` av sig självt. Ligger den kvar efter
fristen står det i rapporten med kommandot `paminn`. Rutinen skickar aldrig
påminnelsen själv. Ett annonsärende (typ `annons`) har ingen sida att läsa
om — det står kvar tills Axel ser att annonserna är borta och skriver
`avfarda <id> "annonserna borta"` eller `eskalera`.

### 6. Publicera granskningssidan

Publicera `konkurrenter/output/sida.html` med Artifact-verktyget. Finns
`konkurrenter/sida.json` med en `url`: publicera om på den (samma länk varje
dag). Finns den inte: publicera nytt (`icon: "shield"`, `title`
"Konkurrentdödaren"), och skriv `{"url": "<länken>"}` till
`konkurrenter/sida.json`. Bilderna ligger som data-URI:er i filen — inga
externa bilder (artifact-visaren blockerar dem).

### 7. Spara

```
git pull --rebase origin main
git add konkurrenter/arenden.jsonl konkurrenter/arenden konkurrenter/lage.json konkurrenter/sida.json
git commit -m "konkurrentdodaren: <datum> — <N> nya, <Ö> öppna, <S> brev ute"
git push origin main
```

Aldrig `git add .`, aldrig `konkurrenter/output/` (gitignorerad: rådata,
bildcache, skärmdumpar, sidan). Nekad push: vänta 2, 4, 8, 16 s och försök
igen; går det ändå inte, skriv det som första rad till Axel.

### 8. Svar till Axel (svenska, kort)

Klistra in rapportens topp (vad som söktes, källorna) och de nya ärendena
(id, produkt, motpart, styrka, skälet, ett citat). Sist, numrerat: hans
uppgifter ur rapportens "Dina uppgifter" — skicka/avfärda per ärende med
kommandot, påminnelser, och Ad Library-verifieringen om den saknas. Finns
inget: "Inget för dig i dag."

## Axels verb

- **`kolla <url> [handle]`** → `node konkurrenter/kor.mjs --hamta --url <url> [--produkt <handle>]`,
  sedan steg 4 (`--rapport --torr`, `--rapport --discord`), 6 och 7. Utan
  handle jämförs sidan mot ALLA våra produkter; den som matchar bäst blir
  ärendet. Ingen träff över tröskeln: säg det, med talen (längsta svit, bilder).

- **`annons <sid-id eller Ad Library-länk med view_all_page_id>`** —
  Axels fall 2026-09-29: "han har snott asmycket ads … men han har ingenting
  på hemsidan" (första sidan: `view_all_page_id=1299101096626433` = **ORVO**,
  rippat Bäverbutiken/CaraShell). **Sessionen läser annonsbiblioteket själv,
  härifrån** (Axels order samma dag: "du ska göra klart mina uppgifter"):

  `node konkurrenter/kor.mjs --hamta --annonser-sida <sid-id> [--land SE]`
  (kör i bakgrunden med utskriften till en fil — jämförelsen tar ~5 min
  första gången, 967 egna annonsbilder hashas; cachen gör nästa körning snabb)

  `konkurrenter/adlibrary.mjs` öppnar sidans lista i Chromium (403 tre–fyra
  gånger, sedan 200 med annonserna inbäddade som JSON i HTML:en — `active`
  och `inactive` var för sig, `media_type` vid taket 30 per laddning), läser
  **räckvidden per annons** ur EU-transparensen (detaljfrågan
  AdLibraryV3AdDetailsQuery fångas en gång och spelas upp per annons) och
  sidans info (namn, kategori, Instagram, "om"-text, domänen ur
  landningslänkarna), skriver `output/<datum>.annonser-<sid-id>.json` och
  kör direkt samma jämförelse som `--annonser <fil>`: ALLA våra aktiva
  annonser (Meta) och produkttexter (ordagranna sviter ≥ 6 ord), deras bilder
  (videoaffischer, annonsbilder) hashade mot våra annonsbilder, deras sajt
  läst för kontaktuppgifter. Mätt 2026-09-29 på ORVO: 37 annonser (23 aktiva,
  14 inaktiva), räckvidd för alla 37, 42 s.
  Utskriften slutar med **Axels kriterier** (`konfig.json → trosklar.annons`,
  hans ord 2026-09-29): sidan är *värd att jaga* när minst EN kopierande
  annons har **över 10 000 i räckvidd** ELLER **minst 10 av dem är live** —
  annars *under Axels tröskel*, och `--rapport` skapar då INGET ärende (det
  står i rapporten under "Under din tröskel"; hans överstyrning är
  `--rapport --tvinga`). Räknas på annonserna som återger VÅRT material,
  inte på sidans alla annonser ("en general store med massa ads men en
  annons på min produkt med hundra reach är inte värd att ta ner").
  Sedan steg 4, 6 och 7. Ingen träff: säg det med talen — och att en annons
  som bara "liknar" vår inte är ett ärende.
  **Reserv när Facebook stänger containern ute** (403 hela vägen, "No ads"
  fast sidan har annonser): Axel klistrar in annonserna själv (Ad Library-
  länkar, primärtext + rubrik, räckvidden ur EU-rutan, bilder/skärmdumpar →
  `konkurrenter/output/annonser/<datum>/`) eller kör Cowork-prompten
  `konkurrenter/cowork/1-annonser.txt` i sin egen webbläsare och klistrar in
  JSON-svaret; skriv då `konkurrenter/output/<datum>.annonser.json`
  (formatet överst i `annonsfall.mjs`, `aktiv` och `exponeringar` per annons
  — hitta aldrig på ett tal) och kör
  `node konkurrenter/kor.mjs --hamta --annonser <fil>`.

- **`skicka <id> [--till adress] [--sprak sv|en] [--kopare "Bolag AB, adress"] [--land GB] [--cpm 98] [--utan-faktura] [--direkt]`**
  Axels ord `skicka` i chatten ÄR godkännandet — fråga inte en gång till.
  1. `node konkurrenter/kor.mjs --skicka <id> [--till …] [--sprak …] [--kopare …] [--land …] [--cpm …] [--utan-faktura]`
     — bygger brevet och fakturan (PDF i Chromium) till
     `konkurrenter/arenden/<id>/brev.txt`, `brev.json` (sändpaketet:
     till/från/ämne/text/bilagor) och `faktura-<nr>.pdf`. Fakturan räknar
     varje annons med exponeringar som exponeringar × vår CPM (mäts ur
     Meta i samma körning, `--cpm` vinner), resten på schablon; 25 % moms
     till svensk köpare, omvänd utomlands (`--land` när domänen inte säger
     landet). Stoppar skriptet (IBAN saknas/fel i konfig, köparen saknar
     namn, exponeringar utan CPM, ingen mottagare, egen domän, ärendet inte
     `ny`): skriv exakt orsaken och vad Axel gör (t.ex. `--till` med
     adressen, `--kopare "Bolag AB, adress"`). Utan konto går bara
     `--utan-faktura`. Läs utskriftens rad "Faktura …: <belopp> (<grund>)"
     och skriv grunden till Axel — han ska se att beloppet är deras
     exponeringar gånger vår CPM, inte en gissning.
  2. Läs `brev.json`. Gmail-verktygen: `ToolSearch("select:mcp__Gmail__create_draft,mcp__Gmail__send_message")`
     (finns i sessionen sedan 2026-09-29; `create_draft` tar `attachments`
     med `filename`, `mimeType: "application/pdf"` och `content` = PDF:en
     base64 — läs filen med `base64 -w0 <fil>` i Bash). **Utan `--direkt`:
     skapa ett UTKAST i Gmail** med `to`, `subject`, `body` (brevets text,
     ren text — ingen markdown) och PDF:en bifogad. Svara Axel med utkastets
     `viewUrl`. Ärendet står kvar som `ny` med `brev.paket` tills Axel tryckt
     Skicka och skrivit `skickad <id>`. **Med `--direkt`: `send_message`
     från Gmail** med samma fält, och kör sedan
     `node konkurrenter/kor.mjs --skickad <id> [--till …]` (kvittot: status
     `skickad`, fristen 48 h börjar). Gmail-verktyget svarar med `id`: skriv
     det i kvittot (`--meddelande <id>`).
  3. Saknas Gmail-connectorn i sessionen: säg det som första rad, ge Axel
     brevet (`brev.txt`) och PDF:en med SendUserFile, och hans uppgifter:
     koppla Gmail (claude.ai → Settings → Connectors → Gmail) eller klistra
     in själv, och sedan `skickad <id>`. Reserv om han hellre vill det:
     `--via loopia --ja` skickar från butikens kundtjänstbrevlåda direkt
     (kräver `KUNDTJANST_MAIL_PASS_<ID>` i miljön).
  4. Efteråt: steg 6 och 7 (commit-rubrik `konkurrentdodaren: brev <id>`
     resp. `konkurrentdodaren: brev skickat <id>`).
- **`skickad <id> [--till adress]`** → `node konkurrenter/kor.mjs --skickad <id> [--till …]`,
  sedan steg 6 och 7. Bara när brevet faktiskt gått ut (Axel tryckte Skicka).
- **`faktura <id> [--kopare …] [--sprak …] [--cpm …] [--land …]`** → `node konkurrenter/kor.mjs --faktura <id> …`,
  PDF:en till Axel med SendUserFile och grunden i klartext (exponeringar × CPM,
  schablonrader, moms). Bygger inte om en faktura som redan gått ut.
- **`anmal <id>`** — Meta-anmälan av de kopierade annonserna (Axels order
  2026-09-29: "den går in och reportar annonsen också, och fyller i allting med
  rätt uppgifter … tio rippade annonser = tio olika reports … det enda jag
  vill göra är att bara verifiera reporten … sen skickar du in allting").
  1. `node konkurrenter/kor.mjs --anmal <id>` — bygger **en anmälan per
     annons** med länk och träff: bevisbilden (vårt original ↔ deras annons,
     kopierad text markerad; PNG i Chromium, publik länk på butikens CDN via
     `anmalan.cdn_butik`), fältpaketet `arenden/<id>/anmalan/<nr>.json` +
     `<nr>.txt` (engelska: kontakt, rättighetshavare, annonsens URL, vad som
     kopierats, originalets länkar, försäkringarna, underskriften — allt ur
     mätningarna och konfig, inget påhittat) och verifieringssidan
     `arenden/<id>/anmalan/verifiering.html`. Stoppar den (ingen undertecknare,
     ingen länk, ingen bevisbild): skriv orsaken.
  2. Publicera verifieringssidan som en NY privat artifact (`icon: "shield"`,
     titel `Anmälningar <id>`) och ge Axel länken + en rad per anmälan
     (annons, exponeringar, bevisbild ja/nej). **Vänta på hans
     "kör anmälningarna <id>".** Det är hans enda verifiering — fråga inte
     igen per anmälan.
  3. **Torrkör formuläret härifrån först** (inget skickas, ingen kod begärs):
     `node konkurrenter/kor.mjs --anmal-skicka <id>` — `anmal-skicka.mjs`
     öppnar Metas upphovsrättsformulär i Chromium (svarar 200 utan inloggning
     från containern; kartlagt 2026-09-29: Copyright → Facebook → land Sweden
     + "No, but I'm authorised to represent the rights owner" +
     rättighetshavarens namn → annonsens URL, originalets länk, beskrivning
     ≤ 500 tecken, namn, e-post ×2, engångskod, underskrift → Submit), fyller
     i allt ur `<nr>.json` och tar skärmdumpen `arenden/<id>/anmalan/<nr>-torr.png`.
     Rätt utfall: "kvar är bara engångskoden". Ett fält som inte hittas
     stoppar med klartext — Meta har då bytt formuläret; fyll aldrig i på en
     gissning, säg det till Axel. Claude in Chrome behövs inte längre.
  4. **På "kör anmälningarna <id>": `node konkurrenter/kor.mjs --anmal-skicka <id> --ja`
     i bakgrunden** (utskriften till en fil). En anmälan i taget: skriptet
     klickar "Request code", skriver `arenden/<id>/anmalan/kod.txt.begard.json`
     och väntar upp till 8 min på `kod.txt`. **Sessionen hämtar koden ur
     Gmail** (connectorn är Axels `axel.odhner@stonebite.org`; koden går till
     `anmalan.undertecknare.epost`, som därför måste vara en adress den
     brevlådan tar emot): `mcp__Gmail__search_threads` med
     `newer_than:1h (meta OR facebook) code`, läs tråden (`get_thread`,
     PLAIN_TEXT), skriv BARA siffrorna i `kod.txt`. Skriptet fyller i,
     klickar Submit, läser referensnumret ur kvittot, sparar `<nr>-kvitto.png`
     och skriver kvittot i ärendet (`status: inskickad`, referens) —
     `--anmald <id> --nr <n> --referens <r>` finns kvar för hand. Nästa
     anmälan begär en ny kod: upprepa tills alla är inskickade (⇒ ärendet
     "anmält vidare"). Rapportera till Axel: en rad per anmälan med
     referensnummer, och det som inte gick. Stoppar skriptet ("obligatoriskt
     fält kvar", fält som inte hittas): inget är skickat — säg exakt vad.

- **`anmald <id> --nr <n> --referens <r>`** → `node konkurrenter/kor.mjs --anmald …`
  (bara när anmälan faktiskt gick in; alla inskickade ⇒ ärendet "anmält
  vidare" när brevet redan gått, annars står anmälan som klar på ärendet).
- **`paminn <id>`** → `--skicka <id> --paminnelse` (paketet), Gmail-utkast/sändning
  som ovan, `--skickad <id> --paminnelse` när den gått ut. Sedan steg 6 och 7.
- **`avfarda <id> "skäl"`** → `node konkurrenter/kor.mjs --avfarda <id> "<skäl>"`, steg 6 och 7.
- **`eskalera <id> ["not"]`** → `node konkurrenter/kor.mjs --eskalera <id> "<not>"`, steg 6 och 7.
- **`lista`** → `node konkurrenter/kor.mjs --lista`.

Ett brev till fel person är värre än inget brev: står mottagaren som "ingen
adress hittad" på sidan och Axel inte gett `--till`, skicka inte — be om
adressen. Och en faktura till fel bolag är värre än så: står köparen som
sidnamn eller domän i stället för ett bolag, be Axel om `--kopare`.

## Definition of done

- [ ] `git pull --rebase origin main` kördes (eller konflikten står först i svaret)
- [ ] `kor.mjs --fraser` gav exit 0 och varje butik/konto är läst eller står med orsak
- [ ] WebSearch kördes på fraserna (eller `kandidater.json` bär orsaken till att den inte kunde köras)
- [ ] `kor.mjs --hamta` gav exit 0; Ad Library och bilder står som lästa eller med orsak
- [ ] `kor.mjs --rapport --discord` gav exit 0 (eller 3/4 står först i svaret), `--foljupp` kördes
- [ ] Granskningssidan publicerad på samma länk som `konkurrenter/sida.json` (eller länken sparad första gången)
- [ ] Inget brev skickades av rutinen; Gmail rördes bara på Axels `skicka <id>` (utkast) eller `skicka <id> --direkt` (sänt)
- [ ] Ingen Meta-anmälan skickades utan Axels "kör anmälningarna <id>" (`--anmal-skicka <id> --ja` bara då; torrt utan `--ja`); varje inskickad anmälan kvitterad (automatiskt eller `--anmald`) med referens
- [ ] Ett annonsfynd under Axels tröskel (ingen annons över 10 000 i räckvidd och färre än 10 live) blev INGET ärende — det står i rapporten under "Under din tröskel"
- [ ] Commit + push till main (arenden.jsonl, arenden/, lage.json, sida.json) — aldrig `output/`
- [ ] Svaret till Axel är på svenska, kort, och hans uppgifter står sist, numrerade
