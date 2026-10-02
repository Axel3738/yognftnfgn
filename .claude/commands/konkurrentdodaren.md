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
/konkurrentdodaren klipp KD-2026-001        Bevisrutorna ur VÅRA EGNA klipp (deras film ↔ alla våra filmer) — före `anmal` när träffen är en film
/konkurrentdodaren anmal KD-2026-001        Meta-anmälningarna: EN per kopierad annons, allt ifyllt + bevisbild → Axel verifierar EN gång
/konkurrentdodaren anmald KD-2026-001 --nr 1 --referens <Metas nr>   kvittot per inskickad anmälan (skrivs av sessionen)
/konkurrentdodaren avfarda KD-2026-001 "ingen kopia"
/konkurrentdodaren paminn KD-2026-001       påminnelsen (brev 2) när fristen gått ut och kopian ligger kvar
/konkurrentdodaren eskalera KD-2026-001 ["anmält till Meta"]
/konkurrentdodaren extern <länk> <id> "ägare" "orsak"   ett klipp vi vet INTE är vårt → registret (konkurrenter/externa/)
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

⛔ **Bara det vi kan bevisa — ORVO-lärdomen** (Eoka AB bestred KD-2026-001
2026-09-29 med EN TikTok-länk: sekvensen i vårt "original"
Takoverdrag_SP_4_H1 var Specialised Covers, och samma klipp låg i 58 av våra
240 takskyddsfilmer; Axel släppte ärendet). Brevet och anmälan påstår sedan
dess bara det uppräknade: varje kopierad sekvens med tidskod hos dem, vår
annons (länk + startdatum) och tidskod hos oss — aldrig "filmerna är våra",
aldrig en andel, aldrig marknadsföringslagen, aldrig "produktsidor" utan en
uppmätt text (`konkurrenter/brev.mjs`, README → "Bara det vi kan bevisa").
Tre regler för sessionen:
1. **Titta på varje par innan `skicka` eller `anmal`.** Är en ruta på VÅR
   sida inte inspelad eller gjord av oss (leverantörens video, ett
   TikTok-konto, en annan butik, en utländsk husvagn vi aldrig filmat): lägg
   källan i registret med `extern` (eller `--lanat <anm>:<bokstav>` för en
   enstaka tagning) och kör `--klipp` igen. Osäker: fråga Axel varifrån
   klippet kommer — gissa aldrig att det är vårt.
2. **`--original` före `--skicka`** på ett filmärende — då pekar
   sekvensraderna på våra annonser i annonsbiblioteket, inte på interna
   filmnamn. En annons vars film bär ett externt klipp länkas aldrig.
3. **Visar en motpart att ett klipp är någon annans: `extern <länk>` direkt**
   och säg Axel hur många av våra filmer (och aktiva annonser) som bär det —
   det är en risk för våra egna annonskonton, inte bara för ärendet.

⚠️ **Alla varumärken sedan 2026-09-29** (Axel: "applicable för alla brands
och även Matstrumpor"): Bäverbutiken SE/NO/DK/FI, CaraShell sv/nb/da/en och
Matstrumpor på tolv språk, med sina konton (`konfig.json → verksamheter`). I
delade konton avgör annonsens länk vems den är. Taket är 30 produkter per
morgon över alla verksamheter, en i taget ur varje.

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

Skriptet läser alla verksamheters butiker och språk (publika
`/products.json`, 20 butiker 2026-09-29), de annonser som visas just nu
(Meta, alla konton i `konfig.json`), väljer dagens produkter (annonserade
först — i den butik/det språk annonsen länkar till — sedan rotation där
butikerna turas om; taket `sok.max_produkter_totalt` = 30 över alla
verksamheter) och skriver två fingeravtryck per
produkt — meningar på 7–16 ord utan siffror och utan butiksnamn — till
`konkurrenter/output/<datum>.fraser.json`. Läs utskriften: produkter "för
lite text" (OPS-butikernas texter ligger i temat, inte i `body_html`) hoppas
med orsak.

### 2. Sök — det här är sessionens jobb

För varje fras i filen (max 60 per körning, i filens ordning): kör
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
  landningslänkarna). **En general store över taket 30** (Bustatio-busto: 58 aktiva,
  ~4 700 inaktiva): de aktiva läses med datumfönster (58 av 58), bläddringsfrågan
  stryps efter ett femtiotal frågor — kör med `--max-annonser 150 --rackvidd aktiva`
  och skrolla aldrig för hand i biblioteket (det är skrollningen som utlöser strypningen).
  Läsaren skriver `output/<datum>.annonser-<sid-id>.json` och
  kör direkt samma jämförelse som `--annonser <fil>`: ALLA våra aktiva
  annonser (Meta) och produkttexter (ordagranna sviter ≥ 6 ord), deras bilder
  (videoaffischer, annonsbilder) hashade mot våra annonsbilder, deras sajt
  läst för kontaktuppgifter. Mätt 2026-09-29 på ORVO: 37 annonser (23 aktiva,
  14 inaktiva), räckvidd för alla 37, 42 s.
  **Andra länder: `--land NO`** (ORVO körde 13 annonser i Norge, no.orvo.se;
  Axel: "så vi ska ta ner honom"). Filen heter då `…annonser-<id>-NO.json` och
  fyndet blir ett EGET ärende (nyckeln `annonser-NO`, KD-2026-002), aldrig en
  uppdatering av det svenska som redan kan vara skickat. Utanför EU visar
  biblioteket ingen räckvidd, så Axels tröskel kan inte mätas: Axels ord är
  `--rapport --tvinga`. **Filmer som inte matchade på text eller förhandsbild**
  (3 av 10 norska hade en annan förhandsbild) tas med som kandidater med
  `--lagg-till <id> --annonser <id,…>`. `--klipp <id> --alla` avgör, och en
  kandidat utan rutor ur våra klipp kommer aldrig med (`bevisStatus`). **En
  bildannons där de satt om texten i vår bild** (MatSokker 2026-10-01: vår d4
  med norsk rubrik gav dHash 17/64 på hela bilden) läggs till med
  `--lagg-till-bild <id> --annons <annons-id> --var-bild <länk eller fil> --var-annons "<vårt namn>"`
  (`delbild.mjs`): mittpartiet av vår bild, utan rubrik och knapp, söks i deras
  bild, och raden kommer bara med om både den grova (≤ 6/64) och den fina
  jämförelsen (≤ 64/256) håller. Mätt: d4 2/64 + 20/256, kontroller med fel
  bild 10–15/64 + 100–131/256. Annars läggs ingenting till, med talen.
  Andra bildannonser som inte matchar läggs inte till: säg dem till Axel.
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

- **`shopify <id> <bild- eller GIF-länk> <sidan den ligger på>` — vårt material
  på deras EGEN Shopify-sajt** (Axel 2026-10-01 om MatSokker: "Vi måste också
  göra en DMCA via Shopify eftersom de har snott våra UGC videos … och lagt på
  sin hemsida"). Läs sajten först i Chromium (alla `video`, `gif`, bilder) och
  välj BARA det som mätts som vårt. `node konkurrenter/kor.mjs --shopify <id>
  --bild <länk> --sida <länk> [--alla-filmer]` (`shopify-anmalan.mjs`) jämför
  bilden ruta för ruta mot filmerna i ärendets par (`--alla-filmer`: hela
  klippcachen) som kvadrat ur topp, mitt och botten av vår stående film, och
  bygger bara på en mätt träff: ≥ 3 identiska rutor ur ≥ 2 sekunder och ≥ 30 %
  av deras rutor. Skriver `arenden/<id>/shopify/` (anmalan.json, anmalan.txt,
  bevis.png på butikens CDN) och kortet kommer med i `--granska`. Shopifys
  formulär kräver inloggning, så Cowork fyller i det efter Axels Ja
  (`--anmal-cowork <ärenden> --med-shopify <id>`), och kvittot är `--shopify
  <id> --skickad --referens <r>`. Mätt på MatSokker: GIF 2 = 20 av 26 rutor ur
  vår Nathalie-annons; GIF 1 fanns inte i någon av våra 243 filmer och anmäls
  inte. ⚠️ Jämför mot ALLA våra filmer, inte bara de svenska med vårt
  namnprefix: första mätningen missade Nathalie, vars svenska annons inte
  heter `MATSTRUMP_…`. Produktbilder som kom från leverantören anmäls aldrig.

- **`extern <länk eller mp4> <id> "ägare" "orsak"`** — ett klipp vi vet INTE
  är vårt (Eoka AB 2026-09-29: Specialised Covers TikTok låg i vårt
  "original"). `node konkurrenter/kor.mjs --extern <länk> --id <id> --agare
  "<ägare>" --orsak "<vem som visade det och var>" [--publicerad ÅÅÅÅ-MM-DD]`
  laddar ner videon (TikTok via Chromium), skriver
  `konkurrenter/externa/<id>.json` och listar vilka av våra filmer i
  klippcachen som bär klippet, med tider. Committa filen. Från nästa
  `--klipp` bär klippet aldrig ett par och räknas aldrig i andelen, och
  `--original` länkar aldrig en film som bär det. Säg Axel antalet filmer och
  vilka aktiva annonser som bär klippet (Meta: annonsernas video-id mot
  filmerna) — det är en risk för VÅRA annonskonton om ägaren anmäler dem.
  Ta aldrig bort en källa ur registret för att ett fall ska bli starkare.

- **`skicka <id> [--till adress] [--sprak sv|en] [--kopare "Bolag AB, adress"] [--land GB] [--cpm 98] [--utan-faktura] [--direkt]`**
  Axels ord `skicka` i chatten ÄR godkännandet — fråga inte en gång till.
  **Har Axel i samma veva sagt `kör anmälningarna <id>`: lägg till `--med-anmalan`** — brevet säger då
  "De N aktiva annonserna anmäls samtidigt till Meta …" och hotar inte med Meta-anmälan som villkor
  (utan flaggan står Meta kvar bland det som händer om de inte tar bort materialet). Kör sedan
  anmälningarna direkt efter brevet (steg under `anmal`).
  **Har Axel sagt att brevet och sms:et inte ska nämna Meta-anmälningarna: `--utan-meta`** (ORVO
  2026-09-29: "vi borde lugnt inte säga att vi har skickat DMCA"). Flaggan sparas på ärendet och gäller
  även påminnelsen och sms:et. Säg samtidigt att Metas formulär själv lämnar ut rättighetshavarens namn,
  anmälarens e-post och vad anmälan gäller till den anmälde.
  1. `node konkurrenter/kor.mjs --skicka <id> [--med-anmalan | --utan-meta] [--till …] [--sprak …] [--kopare …] [--land …] [--cpm …] [--utan-faktura]`
     — bygger brevet och fakturan (liten PDF, `textpdf.mjs`) till
     `konkurrenter/arenden/<id>/brev.txt`, `brev.json` (sändpaketet:
     till/från/ämne/text/bilagor + `omslag`), **`brev.pdf`** (brevet
     ordagrant, klickbara länkar) och `faktura-<nr>.pdf`. Fakturan räknar
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
  2. Läs `brev.json`. Gmail-verktygen: `ToolSearch("select:mcp__Gmail__create_draft,mcp__Gmail__get_draft,mcp__Gmail__send_message,mcp__Gmail__delete_draft")`.
     ⛔ **Mejlets text är `omslag` (följetexten), ALDRIG brevtexten.** Gmail-connectorn skriver om varje
     länk och domän i mejlets text till en Google-omdirigering (mätt 2026-09-29, `brevpdf.mjs`).
     Brevet går som bilagan `brev.pdf`. Skapa ett UTKAST: `to`, `subject` = `amne`, `body` =
     `omslag` (ren text), `attachments` = `brev.pdf` + fakturan (`filename`, `mimeType:
     "application/pdf"`, `content` = `base64 -w0 <fil>`). Båda är några kB, och Chromiums 72 kB
     rymdes inte säkert i anropet.
     **Läs sedan tillbaka utkastet innan något skickas:** `get_draft` med `messageFormat: "RAW"`, skriv
     `raw` till en fil i scratchpad och avkoda i Python (`email.message_from_bytes(base64.urlsafe_b64decode(…))`).
     Varje bilagas sha256 ska vara LIKA med filen, och text/plain ska sakna `google.com/url`. Stämmer
     något inte: radera utkastet och gör om. Gå aldrig vidare på "ser rätt ut".
     **Utan `--direkt`:** svara Axel med utkastets `viewUrl`. Ärendet står kvar som `ny` med
     `brev.paket` tills Axel tryckt Skicka och skrivit `skickad <id>`. **Med `--direkt` eller hans Ja
     på mejlkortet: `send_message` med `draftId`** (samma utkast som lästes tillbaka), sedan
     `node konkurrenter/kor.mjs --skickad <id> --meddelande <id>` (kvittot: status `skickad`, fristen
     48 h börjar). Radera varje annat utkast du lagt i samma ärende (`delete_draft`), så att inget
     gammalt kan gå av misstag.
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
  0. **Är träffen en FILM (`video: true` i annonsfallet): kör FÖRST
     `node konkurrenter/kor.mjs --klipp <id>`** (Axel 2026-09-29, andra
     vändan: "många av de videosarna som vi säger är snodda har vi också
     snott … typ nittio procent av alla klippen är våra, förutom just de som
     du tog screenshots på" — miniatyrträffen, annonsens förhandsbild, är det
     LÅNADE klippet). `klipp.mjs` laddar ner deras film (annonsbiblioteket)
     och ALLA våra filmer med samma namnprefix i våra konton (Meta `source`;
     ORVO/takskyddet: 131 filmer), tar en ruta var halva sekund, matchar
     (dHash i ffmpeg — Playwrights ffmpeg saknar H.264, `pip3 install --user
     imageio-ffmpeg` har det; skriptet säger vilken som saknas), kastar
     scenerna med det lånade klippet ± 2 s på båda sidor och väljer 3 par ur
     olika scener per annons (tätast först). Skriver `klipp.json` (facit,
     committas), rutorna i `output/klipp/<id>/` (cache) och sammanfattningen
     på ärendets annonser. Mätt 2026-09-29: 68–84 % av ORVO:s rutor matchar
     våra filmer, paren 0–1/64. Säger Axel att en ruta ändå är lånad
     ("anmälan 3 ruta B är lånad"): `--klipp <id> --lanat 3:B` (utesluts
     överallt, minnet i `klipp.json`) och sedan steg 1 igen. Bildannonser
     hoppar steget (bildträffen gäller). **Tre skydd:** platta rutor (svart,
     vitt, tonat — `KONTRAST_MIN`) bär aldrig ett par; bara våra filmer
     publicerade FÖRE deras annons räknas (annonsens startdatum mot vår
     `created_time`); och `bevisStatus` avgör per annons vad som är bevisat
     (text / film / bild / ej bevisad). En annons som INTE är bevisad med
     vårt eget material tas aldrig med i anmälan, brevet eller fakturan — den
     står med orsak i ärendet och på sidan. Har en filmannons bara
     miniatyrträffen (klippen aldrig körda) stoppar `--anmal`, `--faktura`
     och `--skicka` tills `--klipp <id> --alla` körts. Två par som visar
     samma bild väljs aldrig båda (`SAMMA_TAGNING`, samma AI-klipp ligger
     ofta i flera av våra filmer) — titta ändå på översiktsarket.
     **Två flaggor från MatSokker 2026-10-01:** `--bara-cache` gör inga
     Meta-anrop för våra filmer (appens tak delas med alla rutiner — ~200
     filmanrop gav kod 4 på 104 %, och varje film väntade 12,5 min i backoff;
     mät `x-app-usage` med en `me`-fråga innan en stor körning). `--utan-film
     <regex>` tar bort filmer som aldrig visats publikt: Matstrumpors
     marknadsversioner `^MATSTRUMP_[A-Z]{2}_` är PAUSED och finns inte i
     annonsbiblioteket, så ett par ur dem pekar på en film ingen granskare
     kan se. Samma bild finns i den svenska annonsen som gått.
  0b. **Originalen: `node konkurrenter/kor.mjs --original <id>`** (Axel
     2026-09-29: "exemplet på vårt original leder bara till produktsidan … du
     måste hitta annonserna inne i vårt ad library"). Letar upp varje film
     paren pekar på som VÅR annons i annonsbiblioteket (fras ur vår annonstext
     → sökning → våra sidor → filmen jämförd ruta för ruta, ≥ 60 % åt båda
     håll) och skriver `arenden/<id>/anmalan/original.json`. `--anmal` lägger
     sedan ledfilmens annons i formulärets exempelfält och länkarna i
     beskrivningen. Hittas inget för en annons blir exemplet vår sidas lista i
     annonsbiblioteket — aldrig produktsidan — och `--anmal` varnar: säg det
     till Axel. ~3 min för 15 filmer första gången, sekunder sedan (cache).
     **Delar många av våra annonser samma text** (Matstrumpor: 30 träffar per
     fras) räcker inte tio försök: `--max-prova 15` hittade 8 av 9 filmer.
  0c. **Är deras filmer VÅRA FÄRDIGA ANNONSER uppladdade igen** (samma klippning,
     vår svenska text i bilden vid samma tider, deras vattenstämpel ovanpå —
     Bustatio-busto 2026-09-30, `--klipp` gav deras 0:05 = vår 0:05 i alla 11):
     titta på paren, och bär filmklippen UNDER texten material som inte är vårt
     (leverantörens produktfilm, en kreatörs inspelning): kör `--anmal <id>
     --ansprak redigering`. Anmälan, bevisbilden, formulärets 500 tecken,
     granskningskortet ("Ja = annonsen är vår: vi har klippt den och skrivit
     texten") och ett eventuellt brev gör då anspråk på **vår klippning och vår
     text i bilden, aldrig på filmklippen**. Anspråket sparas på ärendet.
  1. `node konkurrenter/kor.mjs --anmal <id>` — bygger **en anmälan per
     annons** med länk och träff: bevisbilden (för en film: 3 par ur våra
     egna klipp, vår filmruta till vänster och samma ruta i deras annons till
     höger, med film, tid och avstånd per par — aldrig miniatyrträffen, den
     stoppar hellre än att falla tillbaka; annars vårt original ↔ deras annons
     med kopierad text markerad; PNG i Chromium, publik länk på butikens CDN via
     `anmalan.cdn_butik`), fältpaketet `arenden/<id>/anmalan/<nr>.json` +
     `<nr>.txt` (engelska: kontakt, rättighetshavare, annonsens URL, vad som
     kopierats, originalets länkar, försäkringarna, underskriften — allt ur
     mätningarna och konfig, inget påhittat) och verifieringssidan
     `arenden/<id>/anmalan/verifiering.html`. Stoppar den (ingen undertecknare,
     ingen länk, ingen bevisbild): skriv orsaken.
  2. Bygg och publicera **granskningsappen** (nästa punkt, `granska <id>`) på
     ärendets verifieringslänk — inte längre `verifiering.html`. Axel svarar
     Ja/Nej per kort där; ett "kör anmälningarna <id>" i chatten gäller
     fortfarande som ja på alla anmälningar.
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
     `newer_than:1h (meta OR facebook) code`, och läs mejlet med `get_message`
     **FULL_CONTENT**. Koden står bara i HTML-delen; PLAIN_TEXT saknar den (mätt
     2026-09-29). Skriv BARA siffrorna i `kod.txt`. Skriptet fyller i,
     klickar Submit och skriver kvittot i ärendet **bara när Meta bekräftar**
     (`kvittoUtfall`). Då sparas `<nr>-kvitto.png` och referensen, och
     `--anmald <id> --nr <n> --referens <r>` finns kvar för hand. Nästa
     anmälan begär en ny kod: upprepa tills alla är inskickade (⇒ ärendet
     "anmält vidare"). Rapportera till Axel: en rad per anmälan med
     referensnummer, och det som inte gick. Stoppar skriptet ("obligatoriskt
     fält kvar", fält som inte hittas): inget är skickat, säg exakt vad.
     ⛔ **Säkerhetskontrollen:** mätt 2026-09-29 (ORVO anmälan 1) visar Meta en
     captcha ("Security check") vid Submit från containern. Skriptet stoppar då
     med `❌ Meta kräver en säkerhetskontroll` och `<nr>-sakerhetskontroll.png`.
     **Lös den aldrig härifrån, och försök inte ta dig runt den** (ingen annan
     webbläsare, inga knep): den är en människas. Kör
     `node konkurrenter/kor.mjs --anmal-cowork <id>` → `arenden/<id>/anmalan/COWORK-PROMPT.txt`,
     skicka filen till Axel med SendUserFile och ge honom stegen: öppna Cowork i Chrome, klistra in,
     gör säkerhetskontrollen när Cowork säger till. ⚠️ Mätt 2026-09-30 (KD-2026-003): Cowork
     stannade före första steget med "Claude in Chrome är inte anslutet". Claude in Chrome är AV
     som standard i varje ny chatt (support.claude.com 12012173), så prompten börjar med FÖRST,
     som säger åt Axel att slå på Claude in Chrome i chattens menyn Connectors. Saknas den i
     menyn: initialerna nere till vänster → Settings → Connectors → Claude in Chrome → Configure →
     slå på. Mätt samma eftermiddag: Metas tacksida visar inget nummer, men inom en minut
     kommer mejlet "Anmälan om immateriella rättigheter # <nr>" från
     `case++…@support.facebook.com` till undertecknarens adress, med alla fält ekade (annonsen,
     originalet, beskrivningen). Numret där är kvittot. Meta skickar också SAMMA kod igen så
     länge den gäller (en timme), så en kod kan räcka till flera anmälningar. Kvittona skriver sessionen sedan med
     `--anmald <id> --nr <n> --referens <r>`, ur Metas bekräftelsemejl i Gmail eller ur Coworks lista.
     Står ett kvitto fel (en anmälan som inte gick in): `--anmald <id> --nr <n> --angra "<skäl>"`.
     **Tappar Axel Cowork-chatten mitt i** (2026-09-30 kväll): en ny chatt minns inget, så bygg
     om prompten med `--anmal-cowork <id> --bara <de som inte är skickade>`. Prompten säger då
     att de lägre numren redan är skickade, och de står inte med. Ta alltid med för få hellre än
     för många: en anmälan som saknas skickas i nästa omgång, men en dubblett går inte att ta
     tillbaka. **Vad Meta gjorde syns i annonsbiblioteket:** `gated_type` i annonsens data är
     `TAKEN_DOWN` när Meta tagit ner den (anmälan 1, mätt 2026-09-30) och `ELIGIBLE` när den
     ligger kvar. Ett mejl "We removed the content" bevisar inte vilken annons ärendet gällde.
     Kvittot med de ekade fälten gör det. ⚠️ Gmail-connectorn kan neka att läsa ett kvitto
     ("The caller does not have permission", mätt på ärende 921610674086655). Då skrivs kvittot
     inte in förrän Axel har läst `Ref <id> <nr>/<antal>` i mejlet. Kan han inte, och annonsen
     ligger kvar ett dygn medan de andra togs ner inom minuter, gick anmälan troligen aldrig
     in: skicka den igen i nästa omgång. Så gjordes det med KD-2026-003 anmälan 2 den 1/10.
     **Flera ärenden i EN prompt** (Axels order 2026-09-29: alla manuella klick i en enda
     Cowork-prompt): `--anmal-cowork KD-2026-003,KD-2026-004 --bara "KD-2026-003:2"` skriver
     `konkurrenter/cowork/anmalningar-<datum>.txt`. Ett ärende som inte nämns i `--bara` tar
     alla sina oskickade. Reglerna och stegen står en gång, och varje block är märkt med sitt
     ärende. Coworks svar blir "<ärende> anmälan <nr>: …". Bygg den bara av kort Axel sagt Ja
     till (`--granska-svar <id>`), eftersom prompten tar alla oskickade.
     ⛔ **Cowork kan vägra skicka in, och då gäller vägran resten** (mätt 2026-10-01 kväll):
     Coworks säkerhetsspärr stoppade KD-2026-004 anmälan 1–9 och Shopify-anmälan, trots att Axel
     skrivit ett uttryckligt godkännande med numren i chatten. Bara KD-2026-003 anmälan 2 gick in,
     och där skrev Axel koden, gjorde säkerhetskontrollen och klickade Skicka själv. Cowork skriver
     aldrig in verifieringskoden, inte ens när Axel klistrar in den i chatten. Dagen före gick
     Bustatios 3–6 igenom, så spärren är en bedömning och ingen fast regel. **Skriv aldrig en ny
     prompt som försöker ta sig runt spärren** (ny chatt, nytt godkännande, "fyll bara i"): Cowork
     sa själv att spärren gäller allt som återstår. Vägen är **själv-läget i appen**:
     `--granska <id> [--utan-mejl] --sjalv alla` sparar listan på ärendet, och sedan publiceras
     index.html + data/granskning.json + data/status.json på samma länk. Varje kort visar då stegen
     i formulärets ordning, med en kopieringsknapp per fält och knappen "Jag har skickat in den"
     (ärendenumret frivilligt). Markeringen sparas i `data/beslut.json` under `skickat` och väcker
     sessionen. Läs filen, kör `--granska-svar <id> --beslut <fil> --kvittera` (hans tid och
     nummer, aldrig två gånger), bygg om statusen med `--bara-status` och publicera
     data/status.json. Markeringen är Axels ord. Kvittot att jämföra mot är Metas mejl "Anmälan
     om immateriella rättigheter # <nr>".

- **`granska <id>` — granskningsappen, Axels Ja/Nej per kort** (Axels order
  2026-09-29: "jag kan swipa mellan anmälningarna, läsa igenom all text och
  bilderna … och så kan jag bara klicka ja eller nej … mejlet … fakturan kan jag
  granska här också … och sen så skickas det").
  1. `node konkurrenter/kor.mjs --granska <id> --forsta` bygger
     `output/granska/<id>/`: `index.html` (ett kort per anmälan med bevisbilden och
     exakt det `anmal-skicka.mjs` skriver in i Metas formulär, ett kort för mejlet
     med fakturan som bild, ett för sms:et), `data/granskning.json` (korten och
     deras `version`), `data/status.json`, en tom `data/beslut.json` och `bilder/`.
  2. Publicera på ärendets verifieringslänk (ORVO:
     https://claude.ai/artifact/MouCtSpLNiTjWbnsizkFms; ett nytt ärende får en ny
     privat artifact, `icon: "shield"`): `file_path` = index.html, `files` = det
     `--granska` skriver ut och **`capabilities: {"artifact": {}}`**.
     `data/beslut.json` följer med BARA första gången — sedan äger sidan filen.
     **En runda med bara anmälningar** (samma Facebook-sida har redan fått brevet
     i ett annat ärende, t.ex. ORVO Norge KD-2026-002 efter KD-2026-001): lägg till
     `--utan-mejl` i VARJE `--granska` för det ärendet. Då finns inget mejl- eller
     sms-kort, och överst står vilket ärende som bär brevet.
  3. Axel trycker Ja eller Nej. Sidan sparar svaret i `data/beslut.json`
     (artifact-kapabilitetens files-form, `ifMatch` = sha256 av filen; mätt
     2026-09-29: serverns sha är sha256 av råa byten). Det blir en ny version av
     artifacten, och den **väcker den här sessionen** (bevakningen). **Ett Ja på
     ett kort ÄR Axels ok för just det kortet** — inget "skicka" i chatten behövs.
     Svaret gäller bara kortets aktuella `version`; byggs ett kort om väntar det på
     nytt svar.
  4. Vid väckning: `Artifact read` med `url` och `paths: ["data/beslut.json"]`
     (plus `data/granskning.json` om `output/granska/<id>/` saknas i containern),
     sedan `node konkurrenter/kor.mjs --granska-svar <id> --beslut <sparad fil>
     [--granskning <sparad fil>]`. Den säger vad som ska göras: anmälningar med ja,
     mejlet först när varje anmälan har ett svar (med antalet ja), aldrig något som
     redan är inskickat eller skickat.
  5. **Mejlet:** `--granska <id> --bara-status --pagar mejl` → publicera status (7) →
     `--skicka <id> --med-anmalan --anmalan-antal <n>` → `mcp__Gmail__send_message`
     med `brev.json` (till, ämne, text, fakturans PDF som base64) →
     `--skickad <id> --meddelande <gmail-id>`. Det går från det kopplade kontot
     `brev.avsandare.gmail_konto` (axel.odhner@stonebite.org), och appen visar det.
  6. **Varje anmälan:** `--granska <id> --bara-status --pagar anmalan-<n>` →
     publicera → `--anmal-skicka <id> --nr <n> --ja` med koden ur Gmail (punkt 4
     under `anmal <id>` ovan) → kvittot skrivs.
  7. Efter varje steg: `--granska <id> --bara-status` och publicera BARA
     `data/status.json` (`file_path` index.html oförändrad + `files:
     {"data/status.json": …}`). Sidan visar "Inskickad · Metas referens …" eller
     "Mejlet är skickat". När mejlet gått bär status sms-texten
     (`arenden/<id>/sms-mall.txt` med fakturan som faktiskt gick ut), och Axel
     kopierar den i appen. Refuseras publiceringen för att sidan sparat ett nytt
     svar under tiden: läs `data/beslut.json` igen och kör om från punkt 4.
  8. **Nej** = skickas inte. En kommentar är Axels ord: rätta det som går utan att
     röra redan inskickade anmälningar (en lånad ruta: `--klipp <id> --lanat <n>:<X>`
     + `--anmal` innan något är inskickat), bygg om appen (kortet får ny version)
     och publicera, eller svara honom i chatten.
  Händer inget efter hans Ja (sessionen väcktes inte): han skriver "kolla appen" i
  chatten, och du gör punkt 4–7.

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
- [ ] Inget brev skickades av rutinen; Gmail rördes bara på Axels `skicka <id>` (utkast), `skicka <id> --direkt` (sänt) eller hans Ja på mejlkortet i granskningsappen (aktuell version, alla anmälningar besvarade)
- [ ] Ingen Meta-anmälan skickades utan Axels "kör anmälningarna <id>" eller hans Ja på just det kortet i granskningsappen (`--granska-svar` säger vilka; `--anmal-skicka <id> --nr <n> --ja` bara då); varje inskickad anmälan kvitterad med referens och `data/status.json` publicerad efteråt
- [ ] Bevisbilderna för videoannonser är byggda ur våra egna klipp (`--klipp` före `--anmal`), aldrig ur miniatyrträffen — och en ruta Axel pekat ut som lånad är utesluten med `--lanat` och kortet ombyggt
- [ ] Varje anmälans exempel på vårt original är VÅR annons i annonsbiblioteket (`--original` före `--anmal`, verifierad ruta för ruta) — aldrig produktsidan; saknas ett original står det i svaret till Axel
- [ ] Varje annons i brev, faktura och anmälan är BEVISAD med vårt eget material (`bevisStatus`: text, film ur våra klipp eller en bildannons bild) — obevisade står med orsak i ärendet, och inget par bygger på en platt ruta eller en film publicerad efter deras annons
- [ ] Sessionen har TITTAT på varje par (översiktsark av `output/klipp/<id>/<nr>-<bokstav>-egen/deras.jpg`) — inga av de lånade klippen från förhandsbilderna, och kortets två bilder är samma bild; ett lånat par är utpekat med `--klipp <id> --lanat <anmälan>:<bokstav>` och korten ombyggda
- [ ] Varje ruta på VÅR sida i paren är inspelad eller gjord av oss — en lånad källa ligger i `konkurrenter/externa/` (`extern`) eller är utpekad med `--lanat`, och brevet räknar bara upp sekvenser med tidskoder (inga andelar, ingen marknadsföringslag, inga "produktsidor" utan uppmätt text)
- [ ] Paren pekar på filmer som faktiskt visats publikt (`--utan-film` för aldrig visade marknadsversioner), och en Shopify-anmälan bygger bara på det som mätts som vårt på deras sajt (`--shopify`, jämfört mot alla våra filmer) — leverantörens produktbilder anmäls aldrig
- [ ] Ett annonsfynd under Axels tröskel (ingen annons över 10 000 i räckvidd och färre än 10 live) blev INGET ärende — det står i rapporten under "Under din tröskel"
- [ ] Commit + push till main (arenden.jsonl, arenden/, lage.json, sida.json) — aldrig `output/`
- [ ] Svaret till Axel är på svenska, kort, och hans uppgifter står sist, numrerade
