# konkurrenter/ — Konkurrentdödaren

Motorn bakom `/konkurrentdodaren` (Axels beställning 2026-09-27:
"Konkurrentdödar-rutinen. Den skickar ut ett mail automatiskt … Detta måste
jag granska först för att se om dom rippat"; 2026-09-29: "skicka från
Stonebite-mailen … vi skickar med en färdig faktura", och ett ärende ur
konkurrentens annonser även när hans sajt är ren). Noll npm-beroenden.

**Hittar kopior av våra produktsidor och annonser, lägger fram bevisen så att
Axel kan döma på en minut, och skickar ett varningsbrev med faktura — bara
efter hans ja, från bolagets egen mejl.**

```bash
node konkurrenter/kor.mjs --kolla                       # nycklar, butiker, avsändare, faktura, Ad Library, Chromium
node konkurrenter/kor.mjs --fraser                      # dagens produkter + fraserna att söka → output/<datum>.fraser.json
node konkurrenter/kor.mjs --hamta [--kandidater <fil>]  # hämta kandidaterna, jämför text + bilder → output/<datum>.json
node konkurrenter/kor.mjs --hamta --url <adress> [--produkt <handle>]   # Axels egen misstanke (en sida)
node konkurrenter/kor.mjs --hamta --annonser <fil.json>                 # Axels lista på konkurrentens annonser (annonsfall.mjs)
node konkurrenter/kor.mjs --rapport --torr              # visa rapporten, skriv inget
node konkurrenter/kor.mjs --rapport --discord           # ärenden, filer, läge, sida, Discord
node konkurrenter/kor.mjs --skicka KD-2026-001 [--till adress] [--sprak sv|en] [--kopare "Bolag AB, adress"] [--utan-faktura] [--paminnelse]
                                                        # SÄNDPAKETET: brev.txt + brev.json + faktura-<nr>.pdf i arenden/<id>/ — skickar inget
node konkurrenter/kor.mjs --skickad KD-2026-001 [--till adress] [--paminnelse]   # kvittot när brevet gått ut via Gmail
node konkurrenter/kor.mjs --faktura KD-2026-001 [--kopare …] [--cpm 98] [--land GB] [--ny-faktura]   # bara fakturan (CPM mäts ur Meta om --cpm saknas)
node konkurrenter/kor.mjs --klipp KD-2026-001 [--antal 3] [--lanat 3:B] [--alla]   # bevisrutorna ur våra egna klipp (deras film ↔ alla våra filmer) — före --anmal för videoannonser
node konkurrenter/kor.mjs --original KD-2026-001 [--alla] [--tvinga]   # våra originalannonser i annonsbiblioteket (exempelfältet i Metas formulär) — efter --klipp, före --anmal
node konkurrenter/kor.mjs --anmal KD-2026-001 [--bara-aktiva] [--utan-cdn] [--utan-bevisbild] [--namn …] [--epost …] [--telefon …]   # Meta-anmälningarna: en per annons + bevisbild + verifieringssida
node konkurrenter/kor.mjs --anmald KD-2026-001 --nr 1 --referens <Metas nr>   # kvittot per inskickad anmälan
node konkurrenter/kor.mjs --skicka KD-2026-001 --via loopia --ja        # RESERV: skicka direkt från butikens kundtjänstbrevlåda
node konkurrenter/kor.mjs --avfarda KD-2026-001 "ingen kopia"
node konkurrenter/kor.mjs --foljupp                     # är kopian borta efter brevet?
node konkurrenter/kor.mjs --lista
```

## Flödet

1. **Korpus** (`korpus.mjs`): varje verksamhets butiker läses via den publika
   `/products.json` (ingen nyckel), de annonser som visas just nu via Meta
   (`META_ACCESS_TOKEN`). I delade konton hör en annons till verksamheten när
   kampanjnamnet bär prefixet som ett ord ELLER länken går till en av dess
   butiker (se "Alla varumärken" nedan). Dagens
   produkter: annonserade + `bevaka` först, sedan rotation (aldrig kollad,
   äldst kollad; tak i `konfig.json` → `sok`). Två **fingeravtryck** per
   produkt: meningar på 7–16 ord utan siffror och utan butiksnamn.
2. **Sök** (`sok.mjs` + sessionen): fraserna söks inom citattecken av
   **sessionens WebSearch** (steg 2 i kommandot) och skrivs till
   `output/<datum>.kandidater.json`. Bing finns kvar som `--bing` men svarar
   en container med slumpsidor (mätt 2026-09-27: "baverbutiken" → Texas
   Longhorns, kartsajter); DuckDuckGo (bot-utmaning), Google (tom sida),
   Brave (429), Ecosia/Mojeek (403) spärrar. **Ad Library-API:t** frågas
   varje körning och svarar "saknar behörighet" tills token:ens ägare
   bekräftat sin identitet hos Meta (se nedan).
3. **Hämta** (`hamta.mjs`): sidan (Shopify-produkter via `.json`, kort
   `body_html` ⇒ sidans huvudtext), bilderna, e-post och org.nr på
   kontaktsidorna, plattform. Mottagaren väljs egen domän före gratismejl,
   kontakt/info/support före resten.
4. **Jämför** (`likhet.mjs`, `bild.mjs`): ordagranna sviter ≥ 8 ord (utan
   generiska fraser som "fri frakt"), täckning av våra 5-ordssekvenser, och
   dHash på bilderna i Chromium (stegvis nedskalning — original mot samma
   bild i 400 px ger avstånd 0–2, en annan bild 35). `sammanvag` ger
   styrkan: **stark** (kopierat stycke, ≥ 2 identiska bilder, eller 1 + text)
   eller **trolig**. Under tröskeln = inget ärende, men står i output-filen.
5. **Annonsfallet** (`annonsfall.mjs` + `adlibrary.mjs`,
   `--hamta --annonser-sida <sid-id>`): när kopian sitter i konkurrentens
   ANNONSER och inte på hans sajt. **Annonsbiblioteket läses härifrån sedan
   2026-09-29:** Chromium öppnar sidans lista (403 tre–fyra gånger, sedan 200
   med annonserna inbäddade som JSON — active/inactive var för sig, media_type
   vid taket 30), räckvidden per annons hämtas ur EU-transparensen genom att
   detaljfrågan AdLibraryV3AdDetailsQuery spelas upp per annons, och sidans
   info (namn, kategori, Instagram, domän) följer med. Mätt på ORVO: 37
   annonser med räckvidd på 42 s. **Över taket 30** (general stores:
   Bustatio-busto hade 58 aktiva och ~4 700 inaktiva annonser 2026-09-30)
   läses de AKTIVA med datumfönster: "visningar t.o.m. D" är för en aktiv
   annons samma sak som "startade t.o.m. D", så en stigande rad datum
   (`tackDatum`: var 30:e dag ett år bakåt, var tredje de sista 60) läser dem
   i omgångar om högst 30. Det gav 58 av 58 på 13 vanliga laddningar. Sedan
   provas sidans egen pagineringsfråga (AdLibrarySearchPaginationQuery,
   fångad genom skrollning och uppspelad med markören), men den **stryps**
   efter ett femtiotal frågor ("Rate limit exceeded", kod 1675004, och
   strypningen satt kvar i över en halvtimme). Då väntar läsaren 60 s en gång
   och faller sedan tillbaka på media_type. `--max-annonser N` (standard 400,
   de aktiva först) och `--rackvidd aktiva` (räckvidden bara för de aktiva,
   eftersom detaljfrågan stryps på samma sätt) gör en stor sida hanterbar.
   Reserv (`--hamta --annonser <fil>`): Axel
   eller Cowork (`cowork/1-annonser.txt`) skriver ner annonserna — länk,
   text, rubrik, `aktiv`, `exponeringar`, bilder — i en JSON-fil (formatet
   står överst i `annonsfall.mjs`). **Axels kriterier** (`trosklar.annons`,
   `vardAttJaga`): sidan jagas bara om EN kopierande annons har över 10 000
   i räckvidd ELLER minst 10 av dem är live; annars står den i rapporten
   under "Under din tröskel" och `--rapport` skapar inget ärende
   (`--tvinga` överstyr).
   Varje annons jämförs mot ALLA våra aktiva annonstexter (≥ 6 ord i följd)
   och produkttexter; deras bilder hashas mot våra annonsbilder (träffade
   produkters bilder först, sedan alla annonsbilder, aldrig hela katalogen).
   En rad per annons som matchar (`bevis.annonser`), två träffar = stark.
   Mätt 2026-09-29 på ett syntetiskt fall: 978 egna annonser + 257 produkter
   lästa, 2 av 3 annonser träffade (31 och 23 ord i följd), deras bild
   identisk med vår annonsbild. ⚠️ Bilderna tar tid första gången: 967 egna
   annonsbilder hashade på 274 s; `output/bildcache.json` gör nästa körning i
   samma container snabb. `--utan-bilder` hoppar bilderna.
6. **Ärenden** (`arenden.mjs`): `arenden.jsonl`, en rad per ändring, senaste
   raden per id vinner. `ny → skickad` går BARA med `av: 'axel'` — rutinen
   kan inte skicka. Samma domän + samma produkt = samma ärende; ett avfärdat
   föds inte om; ett åtgärdat som dyker upp igen blir ett nytt ärende med
   hänvisning.
7. **Brevet** (`brev.mjs`): svenska till svenska sidor (.se eller `lang=sv`),
   engelska till alla andra. Bara mätta bevis i bevislistan (per annons i
   annonsfallet; Axels lokala skärmdumpar står aldrig i brevet). Lagrummen:
   URL 1, 2, 49 a och 54 §§; MFL 5, 8 och 14 §§; Patent- och
   marknadsdomstolen. Frist 48 h, påminnelse 24 h. Aldrig VD:ns namn.
   Avsändaren är **bolaget** (`konfig.json` → `brev.avsandare`):
   Stonebite Ecom AB, `contact@stonebite.org`.
8. **Fakturan** (`faktura.mjs`): skälig ersättning enligt 54 § URL, **en rad
   per mätt sak**. **Beloppet per annons = deras exponeringar × vår CPM ÷ 1000**
   (Axels beslut 2026-09-29: "räkna ut det utifrån antalet exponeringar och
   sen bara fakturera det som de har spenderat på annonserna") — alltså vad
   annonsutrymmet de fått med vårt material kostar i samma kanal och land.
   Exponeringarna läser Axel av i annonsbibliotekets EU-ruta ("Total reach")
   och skriver i annonsfilen (`exponeringar`/`reach`, tal eller "12,3 tn");
   **CPM:en gissas inte utan mäts** ur våra egna konton (`cpm.mjs`: Meta
   insights, `last_30d`, per verksamhet, delade konton på kampanjprefix,
   `cpm: false` på CaraShells US-konto). Mätt 2026-09-29: Bäverbutiken
   97,9 kr, CaraShell 141,5 kr, Matstrumpor 130,8 kr — reserven i konfig
   används bara när Meta inte svarar, `--cpm <kr>` vinner alltid. Annons utan
   tal, produkttext och lösa bilder går på schablontaxan (`faktura.taxa`,
   märkt "schablon"); `minst_per_annons` är 0 (Axels "bara"). **Moms:** 25 %
   till svenska köpare (Axels svar: B2B), 0 % med omvänd betalningsskyldighet
   till utländska näringsidkare (landet ur `--land`, annars domänen, annars
   brevets språk); momsreg.nr härleds ur org.nr. Nummer `F-<ärende>-<löpnr>`,
   10 dagar netto, dröjsmålsränta enligt räntelagen. **PDF:en görs av
   `textpdf.mjs`** med PDF:ens standardtypsnitt Helvetica (inget inbäddat,
   zlib-komprimerat): ORVO-fakturan på 24 rader blev 5 kB. Chromiums
   `page.pdf` bäddar in typsnittet en gång per sida och gav 72 kB, och bilagan
   går som base64 i Gmail-connectorns verktygsanrop, där 97 000 tecken inte
   ryms säkert (mätt 2026-09-29). Chromium är reserven om den lilla inte går.
   HTML-versionen finns kvar för appens fakturabild. **Utan bankgiro/IBAN i konfig vägrar den** — och ett
   IBAN som inte klarar kontrollsiffran (mod 97) stoppar också; Axels IBAN
   inlagt 2026-09-29 och kontrollerat. Köparen läses ur deras sida
   (bolagsnamn/org.nr) eller ges med `--kopare "Bolag AB, adress"`. Belopp
   skrivs med vanligt mellanslag (Intl:s U+202F blir en ruta i äldre
   mejlklienter). Fakturan följer bara med FÖRSTA brevet, aldrig påminnelsen.
9. **Sändningen** (`skicka.mjs`): två vägar.
   - **Gmail (standard, Axels beslut 2026-09-29):** `--skicka` bygger
     sändpaketet `arenden/<id>/brev.json` (till, från, ämne, text, bilagor)
     + `brev.txt` + `faktura-<nr>.pdf` och skriver `brev.paket` på ärendet —
     statusen rörs inte. Sessionen lägger paketet som UTKAST i
     Stonebite-Gmail via Gmail-connectorn (eller skickar därifrån på Axels
     `--direkt`), och `--skickad <id>` är kvittot: `registreraSkickat` flyttar
     ärendet till `skickad`/`pamind` och sätter fristen. Kvittot kräver en
     giltig adress och går aldrig två gånger (`skickad → skickad` är ingen
     tillåten övergång).
     ⛔ **Brevet går som PDF, mejlet bär en följetext utan länkar**
     (`brevpdf.mjs`, 2026-09-29). Gmail-connectorn skriver om VARJE länk och
     domän i mejlets text till Googles omdirigering
     (`https://www.google.com/url?q=…&sa=E`), både i text- och HTML-delen och
     även när HTML skickas själv. Mätt på två utkast: "orvo.se", "org.nr"
     (.nr-domänen) och alla annonslänkar blev omdirigeringar. En länk som
     säger facebook.com men går till google.com ser ut som nätfiske. Därför
     lägger `--skicka` (Gmail-vägen) brevet ordagrant i `brev.pdf` med
     klickbara länkar och skriver `omslag` i paketet: följetexten (vad som är
     bifogat, fristen, avsändaren). Den har ingen domän, och
     `harLankbartOrd` stoppar paketet om en smyger in. Sessionen lägger
     utkastet (följetexten + `brev.pdf` + fakturan), **läser tillbaka det i
     RAW, jämför båda bilagornas sha256 med filerna och ser att texten saknar
     google.com/url** och skickar först sedan utkastet. ORVO-brevet gick så
     (sms:et och brevet nämner inte Meta, `--utan-meta`).
   - **`--utan-meta`** (Axels beslut 2026-09-29 för ORVO: "vi borde lugnt inte
     säga att vi har skickat DMCA … han kommer att försöka få ner våra
     annonser"): brevet, påminnelsen och sms:et nämner inte Meta-anmälningarna
     alls, varken "anmäls samtidigt", "redan anmälda" eller som hot. Minnet är
     `brev.utanMeta` på ärendet. ⚠️ Metas formulär lämnar själv ut
     rättighetshavarens namn, anmälarens e-post och vad anmälan gäller till
     den anmälde, så ORVO får veta det från Meta.
   - **Loopia (reserv):** `--via loopia --ja` skickar från verksamhetens
     supportbrevlåda direkt (`kundtjanst/brevlada.mjs skickaNytt`). Spärrar:
     `--ja`, `KONKURRENTER_INGEN_SANDNING=1`, status, mottagare, egna
     domäner, brevlådan i miljön.
10. **Meta-anmälan** (`anmalan.mjs`, `bevisbild.mjs`, `--anmal`; Axels order
    2026-09-29: "den går in och reportar annonsen också … tio rippade annonser
    = tio olika reports … det enda jag vill göra är att bara verifiera"):
    **en anmälan per kopierad annons**, aldrig alla i samma. Varje anmälan
    bär Metas upphovsrättsformulärs fält på engelska (kontakt ur
    `konfig.json → anmalan.undertecknare` — VD:ns namn står här, formuläret
    kräver en riktig person; rättighetshavaren Stonebite Ecom AB med org.nr;
    annonsens Ad Library-länk; vad som kopierats med den längsta ordagranna
    sviten citerad, räckvidd och startdatum; originalets länkar = produktsidan
    + vår sida i annonsbiblioteket (`anmalan.vara_sidor`); de tre
    försäkringarna; underskriften) och **bevisbilden**: vårt original ↔ deras
    annons med den kopierade texten markerad, PNG i Chromium (Axels tips:
    skärmdump i anmälan ger högre träffsäkerhet). Bevisbilden läggs publikt på
    Matstrumpors Shopify Files (`anmalan.cdn_butik`, samma väg som
    `matstrumpor/thumbnails.mjs`) eftersom Metas formulär inte alltid tar
    bilagor och sessionen inte kan ladda upp en containerfil från Axels
    dator — länken står i "Övrig information". Verifieringssidan
    `arenden/<id>/anmalan/verifiering.html` (alla fält, alla bilder) är Axels
    ENDA klick: på hans "kör anmälningarna <id>" kör sessionen
    `--anmal-skicka <id> --ja` — **formuläret fylls i HÄRIFRÅN** i Chromium
    (`anmal-skicka.mjs`; help.meta.com svarar 200 utan inloggning, kartlagt
    2026-09-29: rättighet → plattform → land + "authorised to represent" +
    rättighetshavarens namn → URL, originalets länk, beskrivning ≤ 500 tecken,
    namn, e-post ×2, **engångskod till e-postadressen**, underskrift →
    Submit), en anmälan i taget; koden läser sessionen ur Gmail-connectorn
    och skriver i `arenden/<id>/anmalan/kod.txt` (skriptet väntar på filen),
    kvittot skrivs av sig självt ur Metas svar (`--anmald` finns kvar för
    hand; en anmälan kvitteras aldrig två gånger; alla inskickade ⇒ ärendet
    "anmält vidare"). Utan `--ja` torrkörs formuläret: allt ifyllt, skärmdump
    `<nr>-torr.png`, ingen kod, inget skickat.
    **Andra länder** (ORVO Norge 2026-09-29): `--hamta --annonser-sida <id>
    --land NO` skriver `…annonser-<id>-NO.json`, och fyndet får nyckeln
    `annonser-NO`. Samma sida i Norge blir alltså ett EGET ärende (KD-2026-002),
    aldrig en uppdatering av det svenska. Ärendet bär `land`, och uppföljningen
    läser samma land. Filmer som varken matchar på text eller förhandsbild tas med
    som kandidater med `--lagg-till <id> --annonser <id,…>`. `--klipp` avgör, och
    utan rutor ur våra klipp kommer de aldrig med i en anmälan (`bevisStatus`).
    ⛔ **Uppföljningen av ett annonsfall läser annonsbiblioteket, inte sajten**
    (`annonsfall.mjs annonsUppfoljning`). Den gamla `--foljupp` jämförde deras
    hemsida med vår produktsida. ORVO har inget på hemsidan, så rutinen hade
    stängt KD-2026-001 som "åtgärdat" morgonen efter brevet. Nu gäller: finns
    någon anmäld annons kvar som aktiv ⇒ KVAR. Går biblioteket inte att läsa ⇒
    OKÄNT, aldrig borta.
    ⛔ **Meta kräver en säkerhetskontroll (captcha) vid Submit** (mätt
    2026-09-29, ORVO anmälan 1). Koden gick igenom, men efter Submit kom rutan
    "Security check: A security check is required to proceed" och formuläret
    stod kvar under den. Det gamla skriptet läste formuläret som kvitto och
    skrev "inskickad". Kvittot togs tillbaka med `--anmald <id> --nr 1 --angra
    "<skäl>"`. Nu räknas en anmälan som inskickad BARA när Meta bekräftar
    (`kvittoUtfall`: tacksida och formuläret borta). En säkerhetskontroll
    stoppar med `kod: SAKERHETSKONTROLL`: den görs av en människa och
    **löses aldrig härifrån**. Vägen blir då **`--anmal-cowork <id>`**, som
    skriver `arenden/<id>/anmalan/COWORK-PROMPT.txt`. Där står exakt
    formularVarden() för varje anmälan som inte är inskickad. Cowork fyller i
    i Axels Chrome och tar koden ur hans Gmail, och Axel gör
    säkerhetskontrollen och klickar Submit. Kvittona skrivs med `--anmald <id>
    --nr <n> --referens <r>` ur Metas bekräftelsemejl eller Coworks lista.
    Flera ärenden går i EN prompt (2026-10-01): `--anmal-cowork
    KD-2026-003,KD-2026-004 --bara "KD-2026-003:2"` skriver
    `cowork/anmalningar-<datum>.txt`, med reglerna en gång och varje block
    märkt med sitt ärende. `--med-shopify <id,…>` lägger Shopify-anmälan
    (se "MatSokker" nedan) sist i samma prompt, som DEL 2.
    Lokala skärmdumpar
    Axel gett står aldrig i anmälan. Mätt 2026-09-29 (syntetiskt ärende): två
    anmälningar, två bevisbilder (2400 px, ~0,9 MB), verifieringssidan tittad
    på. ⚠️ Formulärets fält läses av LIVE i Chrome och paras på etikett —
    Meta byter dem utan förvarning; ett fält paketet inte täcker stoppar, det
    fylls aldrig med en gissning. PNG:erna och verifieringssidan är
    gitignorerade (`<nr>.json` bär CDN-länken).
10b. **Klippen — bevisrutorna ur våra EGNA klipp** (`klipp.mjs`, `--klipp <id>`;
    Axel 2026-09-29, andra vändan: "många av de videosarna som vi säger är
    snodda har vi också snott … typ nittio procent av alla klippen i
    videosarna är våra, förutom just de som du tog screenshots på"). De
    första bevisbilderna visade miniatyrträffen — annonsens förhandsbild mot
    vår — och just de klippen är lånad b-roll; resten av filmerna är våra
    AI-klipp. Därför: deras video laddas ner ur annonsbiblioteket
    (`videoUrl` i annonsfilen), ALLA våra filmer med samma namnprefix som de
    träffade annonserna hämtas ur våra konton (Metas `filtering` på namnet;
    `object_story_spec.video_data.video_id` bär `source`, `creative.video_id`
    — reelen — gör det inte; utan source tas Metas `thumbnails` som rutor),
    en ruta var halva sekund hashas (dHash 9 × 8 räknat i ffmpeg — Playwrights
    egen ffmpeg saknar H.264, mätt 2026-09-29; `pip3 install --user
    imageio-ffmpeg` ger en som har det, `hittaFfmpeg` provar FFMPEG, PATH och
    den), varje ruta hos dem paras med den närmaste hos oss över alla filmer
    (≤ 6/64 = samma ruta), deras film delas i scener, allt inom 2 s från en
    utesluten ruta (miniatyrerna på båda sidor för alla annonser + det Axel
    pekat ut med `--lanat <anmälan>:<bokstav>`) kastas, och 3 par väljs ur
    olika scener hos dem och olika scener/filmer hos oss, tätast först, i
    tidsordning på kortet. Andelen matchande rutor räknas UTAN de lånade.
    Facit `arenden/<id>/anmalan/klipp.json` (committas: par, hashar, lånade
    hashar, biblioteket), cache `output/klipp/<id>/` (filmer, `rutor-<video>.json`,
    rutorna som JPEG). Sammanfattningen (`klipp` per annons: antal, andel,
    filmer, par) läggs på ärendet, så brevet, anmälan, bevisbilden och
    rapporten säger samma sak; `--anmal` stoppar om rutfilerna saknas i
    stället för att falla tillbaka på miniatyren. **Mätt 2026-09-29 på ORVO:**
    mot EN film matchade 3–56 % av rutorna, mot alla 131 takskyddsfilmer
    68–84 % — deras tio filmer är hopklippta ur många av våra (mest
    Takoverdrag_SP_4_H1, RI_1_H1, OB_1_H1); paren 0–1/64; 5 min första
    gången (131 filmer nedladdade), sekunder därefter. Verifieringssidan
    visar per anmälan paren (A/B/C med film och tid) och det lånade klippet
    som utesluts, så Axel ser att rätt scen kastats.
    **Tre skydd sedan samma kväll** (efter att bevis-8 visat ett par ur ett
    nästan svart övertoningsparti): (1) **platta rutor räknas aldrig** —
    standardavvikelsen i 9 × 8-miniatyren ska vara ≥ 8 (`KONTRAST_MIN`),
    annars matchar varje svart ruta varje annan svart ruta; (2) **bara filmer
    publicerade FÖRE deras annons** får bära ett par (`fore` = annonsens
    startdatum ur annonsbiblioteket mot vår annons `created_time`; biblioteket
    bär `skapad`, version 2 — en äldre cache läses om av sig själv); (3)
    **`bevisStatus` avgör vad varje annons bevisar** (`klipp.mjs`): *text*
    (ordagrann annonstext), *film* (par ur våra klipp), *bild* (en
    BILDannons bild — en films miniatyr räknas aldrig, den kan vara lånad),
    *miniatyr* (en film där `--klipp` aldrig körts: `overifierad`, och då
    stoppar `--anmal`, `--faktura` och `--skicka` tills klippen körts), eller
    *ej bevisad* (bara det lånade matchade, eller jämförelsen föll) — den
    annonsen står med orsak på sidan och i ärendet men tas aldrig med i
    brev, faktura eller anmälan. Fakturaraden säger vad som är bevisat
    ("Annonsfilm klippt ur våra annonsfilmer (…)" / "Annonstext kopierad …"),
    anmälan nämner filmerna och deras datum ("published by us between … before
    this ad started running on …") och aldrig miniatyrens annons.
    **Tre lärdomar till samma kväll, alla inbyggda** (efter att två bevisbilder
    visat fel): (4) **bilden tas ut på rutnummer, inte på tid** (`skrivRutaNr`:
    samma fps-kedja som hashen) — `-ss 4` gav rutan FÖRE ett klippbyte i vår
    film medan den jämförda rutan redan var nästa scen, och kortet visade två
    olika bilder med "avstånd 0/64"; varje par **kontrolleras nu i de uttagna
    bilderna** (`KONTROLL_AVSTAND` 10) och byts mot nästa kandidat om det inte
    håller, och par mitt i ett gemensamt klipp (grannrutorna matchar också,
    `stod`) går före par vid ett klippbyte; lika nära ⇒ vår ÄLDSTA film. (5)
    **Förhandsbilden är deras allra första bildruta** (1–7 bitar mot rutan vid
    0,00 s i alla tio, läst med 30 rutor/s) men 16–23 bitar från närmaste ruta
    i 2-per-sekund-serien — så uteslutningen runt hashen missade de lånade
    inledningarna. Nu: deras **tagningar** ur ffmpegs klippbyten
    (`klippbyten`, scenpoäng ≥ 0,3; ORVO klipper hårt) och `lanadeKlipp`:
    tagningen med förhandsbilden är lånad, liksom varje tagning i en annan av
    deras annonser där minst två rutor ligger inom 5 bitar från en lånad ruta
    (samma lånade klipp återanvänt, högst två varv; kantrutan vid ett
    klippbyte sprider aldrig — den kan visa grannklippet). På VÅR sida
    utesluts bara rutorna som liknar det lånade (± 1 s), och vår sida sprider
    aldrig tillbaka. (6) **Mätt fel väg två gånger innan det satt:** att
    sprida via våra filmer märkte 184 av 240 filmer (våra AI-filmer har mjuka
    övergångar, så ffmpeg slår ihop flera av våra klipp till en tagning — och
    kantrutan i annons 18 var redan ett av VÅRA klipp som finns i nästan
    alla deras annonser); nu utesluts 5–17 rutor per annons, 48–72 % av deras
    film matchar fortfarande våra klipp. Ett lånat klipp som inte hänger ihop
    med någon förhandsbild (ORVO:s Sterling-klipp mitt i annons 7) fångas
    inte automatiskt — sessionen tittar på alla par (översiktsark) och Axel
    pekar ut med `--lanat <anmälan>:<bokstav>`, som nu utesluter hela
    TAGNINGEN hos dem och rutan ± 1 s i vår film.
    (7) **Aldrig samma bild två gånger** (Axels granskning 2026-09-29: efter
    `--lanat 5:A,5:B` visade anmälan 5 samma drönarbild som B och C — samma
    AI-klipp ligger i två av våra filmer och två gånger i deras, så "olika
    scener hos dem, olika filmer hos oss" släppte igenom det; dHash skilde
    24/64 eftersom himmel och betong nästan saknar kontrast). Varje valt par
    jämförs nu i gråskala 32 × 18, bara de övre 14 raderna (textrutorna sitter
    längst ner): medelskillnad under `SAMMA_TAGNING` 20 ⇒ samma bild, nästa
    kandidat tas. Mätt på ORVO:s 20 annonser: vår ruta mot deras 1,1–15,6,
    olika par 29,1–115, det dubbla paret 11,7.
10c. **Originalen i annonsbiblioteket** (`original.mjs`, `--original <id>`; Axel
    2026-09-29: "exemplet på vårt original leder bara till produktsidan … du
    måste hitta annonserna inne i vårt ad library … vi äger ju rättigheterna
    till alla annonserna"). Metas formulär tar EN länk som "example of your
    copyrighted work", och den ska vara vår egen annons, inte butikens sida.
    För varje film paren pekar på: annonsens text ur Meta → upp till tre fraser
    (kroken först, sedan de längsta; 5–10 ord, inga siffror) → annonsbibliotekets
    sökning på exakt fras (resultaten kommer i GraphQL-svaren, inte i HTML:en;
    noll träffar prövas en gång till — samma fras gav 0 och sedan 8) → träffarna
    på VÅRA sidor (`anmalan.vara_sidor`) → varje kandidats film laddas ner och
    jämförs ruta för ruta med vår (lika åt BÅDA håll ≥ 60 %; samma film ger
    100/100, en annan film med ett delat klipp ≤ 37). En träff som bara delar
    texten räknas aldrig. Filmens egen sida först, sedan tidigast start.
    Facit `arenden/<id>/anmalan/original.json` (committas), cache
    `output/klipp/<id>/bibliotek-original/`. `--anmal` lägger **ledfilmens**
    annons (flest matchade rutor) först i `originalWorkUrls` — det blir
    exempelfältet — resten efter, sedan vår sidas lista i annonsbiblioteket och
    produktsidan SIST; 500-teckensbeskrivningen bär två länkar till våra
    annonser (+ tiderna i deras film), bevisbilden länken per par, och kortet i
    appen en svensk rad om vilken annons det är. Utan hittat original blir
    exemplet vår sidas lista (aldrig produktsidan) och `--anmal` varnar.
    ⛔ **En annons av våra som startade samma dag som deras eller senare länkas
    aldrig** (`originalFor(…, { fore: deras start })`, ORVO Norge 2026-09-29):
    samma film går ofta i flera av våra konton, och vår US-kopia av en film
    startade 27/9 medan deras annons startade 24/9. Metas granskare ser bara
    annonsbibliotekets datum, och där hade vi sett ut att komma efter. Filmen
    står kvar i beskrivningen (den skapades hos oss före deras annons), bara
    länken faller bort. Okänt startdatum hos oss står kvar.
    **Mätt 2026-09-29 på ORVO:** 15 av 15 filmer hittade (två efter att den
    andra frasen provats), alla 100/100; ledfilmerna Takoverdrag_SP_4_H1
    (id 2000363993957496) och OB_1_H1 (id 1619798969500412), Bäverbutiken.se.
11. **Rapport och sida** (`rapport.mjs`, `sida.mjs`): svensk rapport med
    Axels uppgifter sist, engelsk Discord-post i `#copycats` bara när något
    är nytt, och granskningssidan (`output/sida.html`, publiceras som
    artifact på länken i `sida.json`) med bevisen sida vid sida (per annons i
    annonsfallet), skärmdumpen, fakturabeloppet, Gmail-flödet i klartext och
    kommandona att kopiera (`skicka`, `skickad` när paketet är byggt,
    `avfarda`, `paminn`, `eskalera`).

## Granskningsappen: Axels Ja/Nej per kort (2026-09-29)

Axels order samma kväll: "jag kan swipa mellan anmälningarna, läsa igenom all
text och bilderna … och så kan jag bara klicka ja eller nej … mejlet … fakturan
kan jag granska här också … och sen så skickas det."

- `--granska <id> --forsta` bygger `output/granska/<id>/`: ett kort per
  Meta-anmälan (bevisbilden, en svensk sammanfattning och exakt de fält
  `anmal-skicka.mjs formularVarden` skriver in), ett kort för mejlet (från, till,
  ämne, hela brevet, fakturan som bild) och ett för sms:et. Korten bär en
  `version` ur innehållet; byggs ett kort om gäller ett gammalt svar inte längre.
- Appen publiceras på ärendets verifieringslänk med `capabilities: {artifact: {}}`.
  Axels Ja/Nej sparas av sidan själv i `data/beslut.json` (files-formen, `ifMatch`
  = sha256 av råa byten, mätt mot serverns sha 2026-09-29). Varje sparning är en
  ny version av artifacten och väcker sessionen som bevakar den. Sidan skriver
  aldrig `data/status.json`, sessionen skriver aldrig `data/beslut.json`, så två
  skrivare krockar inte.
- `--granska <id> --utan-mejl` = en runda med BARA anmälningar (ORVO Norge
  KD-2026-002: brevet och fakturan gick redan i KD-2026-001 mot samma
  Facebook-sida, och ett andra brev samma kväll hade bara rört till det). Inget
  mejlkort, inget sms-kort, ingen mejlstatus. Överst står vilket ärende som bär
  brevet (`granskning.mjs mejlRedanNot`). Flaggan skickas vid varje ombyggnad av
  den rundan, annars kommer mejlkortet tillbaka.
- `--granska-svar <id> --beslut <fil>` läser svaret (`granskning.mjs attGora`):
  ja på aktuell version ⇒ skicka in, mejlet först när varje anmälan har ett svar
  och med antalet ja i brevet (`brev.mjs metaRad`: "7 av de 10 aktiva
  annonserna …", 0 ⇒ ingen mening), aldrig något som redan är inskickat, skickat
  eller pågår.
- Mejlet går från det kopplade Gmail-kontot (`brev.avsandare.gmail_konto`,
  axel.odhner@stonebite.org mätt i Skickat 2026-09-29), och appen visar det.
- Sms-texten är ärendets `arenden/<id>/sms-mall.txt` med fakturan som faktiskt
  gick ut (`{{FAKTURA_NR}}`, `{{BELOPP}}`, `{{EXPONERINGAR}}`, `{{FORFALLER}}`,
  `{{META}}`); den visas i appen när mejlet gått.
- Flödet steg för steg står i kommandofilen under `granska <id>`.

## Alla varumärken (2026-09-29)

Axel: "jag vill kunna göra denna konkurrentdödare applicable för alla brands
och även Matstrumpor". Matstrumpor var redan med sedan bygget, men bara den
svenska texten. Tre luckor täpptes samma kväll:

| Verksamhet | Butiker (texterna som söks och jämförs) | Konton (annonserna) |
|---|---|---|
| Bäverbutiken | baverbutiken.se, beverbutikken.no, baeverbutiken.dk, majavakauppa.fi | MagiBorsten, Magiborsten NO, Magiborsten FI |
| CaraShell | carashell.se, /nb, /da, carashell.com | OPS-kontot, Magiborsten UK (delade) |
| Matstrumpor | matstrumpor.se + /en /nb /da /fi /de /fr /nl /es /it /pl /pt | nya kungen |

- **Varje butik och språk har sin egen text.** Shopify svarar med den
  översatta texten på `/<språk>/products.json`, mätt på alla tolv. En kopia i
  Norge kopierar den norska texten, så den söks och jämförs på norska.
- **Länken avgör vems annonsen är i ett delat konto** (`korpus.mjs
  hamtaEgnaAnnonser`, `butikFor`, `kampanjTillhor`). Prefixet räknas som ett
  ord var som helst i kampanjnamnet. Förut användes `startsWith`, och mätt
  2026-09-29 tappade det CaraShells alla 130 aktiva annonser i UK-kontot
  (kampanjen heter "1 CARASHELL_US_… – kopia") och 12 i OPS-kontot ("NYA …").
  Aktiva annonser i korpusen blev: Bäverbutiken 688 → 858 (+ NO 136, FI 34),
  CaraShell ~240 → 382.
- **Prioriteten följer annonsens butik.** En annons till matstrumpor.se/nb
  prioriterar den norska texten, inte alla tolv språk med samma handle
  (`valjProdukter` tar `butik|handle`). I rotationen turas butikerna om (SE,
  NO, DK, FI, SE …), annars hade den svenska katalogen tagit veckor innan en
  enda norsk text söktes.
- **Taket gäller alla verksamheter tillsammans:** `sok.max_produkter_totalt`
  = 30, en i taget ur varje verksamhet (`fordelaProdukter`). Det blir 60
  sökningar per morgon i stället för upp till 120. Torrkört 2026-09-29: 10
  produkter per verksamhet, ur SE, NO och FI, CaraShells fyra språk och tio av
  Matstrumpors.
- **Discord:** Matstrumpor har ingen server, så dess fynd står bara i
  rapporten och på granskningssidan (`discord.hoppa`).
- **Inte med:** Grillkliniken, eftersom `META_ACCESS_TOKEN` inte når
  SnarkLös (kommentarer/konfig.json → `konton_utanfor`). Inte heller de
  nedlagda OPS-butikerna eller beavershop.co.uk, som är avstängd med flit.
  Lägg till en verksamhet med en rad i `konfig.json → verksamheter` (butiker,
  konton, avsändare) och dess sida i `anmalan.vara_sidor`. En lista med flera
  sidor går bra, och den första är huvudsidan.

## Bara det vi kan bevisa: ORVO-lärdomen (2026-09-29)

Eoka AB (ORVO) bestred KD-2026-001 med en enda TikTok-länk. Sekvensen i vårt
"original" Takoverdrag_SP_4_H1 fanns på Specialised Covers konto sedan 22 maj
2025. Mätt samma kväll: videon ligger i **58 av våra 240 takskyddsfilmer**,
100 annonser, 54 aktiva, 82 127 kr på 7 dygn
(`arenden/KD-2026-001/svar-2026-09-29.md` + `specialised-covers.json`).
Axel släppte ärendet. **Återkallelsen gick ut 2026-09-30 07:30**, med en
ursäkt på hans ord ("skicka återkallelsen och be om ursäkt"). Gmail-svaret
`1a0f0cb29f5946ca` återkallar fakturan och kraven och säger att brevet
"innehöll påståenden som vi inte hade kontrollerat tillräckligt". Det nämner
inte vilka klipp det gäller eller var de kommer ifrån (Axel: det är "dumt att
beskriva om det riskerar att vårat ad account ryker"). Det gamla utkastet är
raderat. **De 54 aktiva annonserna med Specialised Covers klipp ligger kvar**
(Axels val B 2026-09-30, ingen ny brief). Tre fel i brevet, alla nu stängda i koden:

1. **"Filmerna är framställda av oss".** Brevet räknar nu upp varje kopierad
   sekvens: *er 0:06 = vår annons &lt;länk&gt; (visas sedan …) vid 0:02*.
   Det är tidskoden hos dem, vår annons i annonsbiblioteket och tidskoden hos
   oss (`brev.mjs sekvensRad`). Kravet gäller bara det uppräknade, och
   Meta-anmälan säger "Only these frames are claimed".
2. **Procenten** ("59 % av er film matchar våra filmer") räknade lånade
   rutor som våra. Den står aldrig i brevet, i anmälan eller på bevisbilden,
   bara internt i rapporten och på granskningssidan.
3. **Produktsidor och marknadsföringslagen** (vilseledande efterbildning,
   renommésnyltning) utan belägg. Borta. Produktsidan nämns bara när en
   ordagrann text från den är uppmätt.

**Anspråket `redigering` (Bustatio-busto, 2026-09-30).** En general store
(bustatio.com) körde 11 av VÅRA färdiga annonser. De var nedladdade med vår
svenska text i bilden vid exakt samma tider (deras 0:05 = vår 0:05) och bara
en vattenstämpel "bustatio" tillagd. Filmklippen under texten är en blandning.
En del är AI-klipp vi har gjort, en del leverantörens produktfilm och en del
riktiga inspelningar vi knappast gjort själva. Vår klippning och vår text är
däremot våra. `--anmal <id> --ansprak redigering` gör anspråk på just det, i
anmälan ("a re-upload of our own ad film … We make no claim to the underlying
product footage"), på bevisbilden, i formulärets 500 tecken, på
granskningskortet och i brevet. Anspråket sparas på ärendet.

**Registret över klipp vi vet inte är våra: `externa/<id>.json`**
(`externa.mjs`). Varje källa har sina rutor (dHash 9 × 8), sin ägare och sin
orsak. I dag finns tre källor: Specialised Covers TikTok-video, den brittiska
husvagnen "Searcher" med svart takskydd och personen som spänner ett svart
kapell. De två senare var redan märkta med `--lanat` men matchar inte
TikTok-videon, så de är egna källor.

- `--klipp` gör registrets rutor till lånade, i våra filmer och i deras
  annons. De bär aldrig ett par och räknas aldrig i andelen. `klipp.json →
  externa` visar vilka filmer som bär dem och var.
- `--original` länkar aldrig en annons vars film bär ett externt klipp. Filmen
  söks inte ens (`original.json → externa`, `originalFor`).
- Granskningskortets Ja är ett intygande: "varje ruta till vänster är
  inspelad eller gjord av oss, inte hämtad från någon annan".
- Registret växer åt ett håll. Får vi veta att ett klipp inte är vårt läggs
  det till. Det tas aldrig bort för att ett fall ska bli starkare.

## MatSokker: delbilder, Shopify-anmälan och Metas gräns (2026-10-01)

KD-2026-004 (`arenden/KD-2026-004/anteckning-2026-10-01.md`): en ny Shopify-butik
i Norge körde 9 av Matstrumpors annonser med norsk text, och vår Nathalie-film låg
som GIF på deras produktsida. Axel: "Anmäla allt." Fem verktyg kom till.

- **Delbild** (`delbild.mjs`, `--lagg-till-bild <id> --annons <deras annons-id>
  --var-bild <länk|fil> --var-annons "<vårt namn>" [--ruta x0,y0,x1,y1]`). En
  bildannons där texten är omsatt matchar inte som hel bild. Därför söks vår
  bilds mittparti (`MITTPARTI` 0,12–0,88 × 0,26–0,86, utan textraderna) i deras
  bild över skala 0,3–1,6 och alla lägen, med en summerad-yta-tabell. Grov dHash
  9 × 8 (≤ 6/64) hittar kandidaten, och fin 17 × 16 (≤ 64/256) avgör. MatSokkers
  d4 gav 2/64 + 20/256 vid skala 0,96, och kontrollerna mot andra bilder 10–15/64
  och 100–131/256. Raden bär `del: 'mittparti'`. Anmälan säger "our own advertising
  image with its text re-set in another language: the picture under the text is
  identical", och aldrig att hela bilden är det. Utan träff läggs inget till.
- **Graden följer mätningen hela vägen.** En hel bild som bara är "near-identical"
  (MatSokkers 036 och d3, 7–8/64, norsk text) heter "nearly identical" i de 500
  tecknen och "nästan identisk" på kortet. Förut stod det "identical" där. En
  bildannons kallas aldrig "a still frame from our ad video".
- **Shopify-anmälan** (`shopify-anmalan.mjs`, `--shopify <id> --bild <fil-url>
  --sida <sid-url> [--alla-filmer]`). Den gäller vårt material på en annan butiks
  egen sida. Deras GIF eller film hashas med 4 rutor/s. Den jämförs mot våra
  filmer (paren i `klipp.json`, eller alla med `--alla-filmer`) som en kvadrat ur
  topp, mitt och botten av den stående filmen, och bästa film × beskärning vinner.
  Den kräver minst 3 identiska rutor (≤ 6/64, aldrig platta) ur 2 olika sekunder
  och 30 % av deras rutor (`arBevisad`). Bevisbilden visar 3 par ur olika
  sekunder, uttagna med samma fps-kedja som hashen (aldrig `-ss`), och läggs på
  Matstrumpors CDN. En oförändrad bild återanvänder sin länk (`bevisSha`). Fälten
  på engelska ligger i `arenden/<id>/shopify/anmalan.json` + `.txt`, med
  originalet = vår annons i annonsbiblioteket. Shopifys formulär
  (https://www.shopify.com/legal/tools/report-an-issue/dmca) kräver inloggning.
  Därför får appen ett Shopify-kort (`kortShopify`), Axels Ja tar med det i
  Cowork-prompten (`--med-shopify`), och Cowork fyller i det i hans Chrome. Det
  skapar aldrig ett konto och stannar vid en säkerhetskontroll. Kvittot skrivs
  med `--shopify <id> --skickad --referens <r>`, aldrig två gånger. Mätt på
  MatSokker: GIF 2 är 20 av 26 rutor ur vår Nathalie-annons. GIF 1 fanns inte i
  någon av våra 243 filmer. ⚠️ Första mätningen jämförde bara filmerna med vårt
  namnprefix och missade Nathalie, vars svenska annons inte heter `MATSTRUMP_…`.
  Jämför mot ALLA filmer innan något kallas "inte vårt". Produktbilder som kom
  från leverantören anmäls aldrig.
- **`--klipp … --utan-film <regex>`** tar bort filmer ur jämförelsen.
  Matstrumpors utlandsversioner `MATSTRUMP_<LAND>_*` har aldrig visats och finns
  inte i annonsbiblioteket, så ett par mot dem går inte att kontrollera för
  Metas granskare. Kör `--utan-film '^MATSTRUMP_[A-Z]{2}_'`, så kommer paren ur de
  svenska annonser som gått. `--original … --max-prova 15` (standard 10) prövar
  fler kandidater när flera av våra annonser delar text. På MatSokker hittade
  det 8 av 9 filmer.
- **`--klipp … --bara-cache`** jämför bara mot filmer som redan ligger i cachen
  och skriver vilka som hoppades. Metas gräns för appen (`(#4) Application request
  limit reached`) delas av ALLA rutiner. Mätt 2026-10-01 stod `x-app-usage` på
  104 % mitt i en körning, och de saknade filmerna gick att hämta först när den
  sjunkit till 54 %. Mät före en stor körning:
  `curl -s "https://graph.facebook.com/v23.0/me?fields=id&access_token=$META_ACCESS_TOKEN" -D - -o /dev/null | grep -i x-app-usage`.

## Filer

| Fil | Committas | Vad |
|---|---|---|
| `konfig.json` | ✅ | Verksamheter (alla butiker och språk, alla konton), avsändare (Gmail), faktura (beräkning, CPM-reserv, moms, IBAN, schablontaxa), egna domäner, trösklar, Discord — facit |
| `externa.mjs`, `externa/<id>.json` | ✅ | Registret över klipp vi vet inte är våra (källa, ägare, orsak, rutor) — utesluts ur par, andel och original |
| `arenden/KD-2026-001/svar-2026-09-29.md`, `specialised-covers.json` | ✅ | Eoka AB:s bestridande och mätningen: 58 filmer, 100 annonser, 54 aktiva, spend per annons |
| `arenden.jsonl` | ✅ | Ärendeloggen (kvittot på varje brev och faktura) |
| `arenden/<id>.md`, `arenden/<id>/skarmdump.jpg`, `arenden/<id>/miniatyrer.json` | ✅ | Bevisen per ärende |
| `arenden/<id>/brev.txt`, `brev.json`, `faktura-<nr>.pdf` + `.html` | ✅ | Sändpaketet: exakt det som lades i Gmail |
| `arenden/<id>/anmalan/<nr>.json` + `.txt` | ✅ | Meta-anmälan per annons: fälten, bevisbildens CDN-länk, status + Metas referens |
| `arenden/<id>/anmalan/bevis-<nr>.png`, `verifiering.html` | ❌ | Bevisbilderna (~1 MB styck) och Axels verifieringssida — byggs om med `--anmal` |
| `arenden/<id>/sms-mall.txt`, `sms.txt` | ✅ | Sms:et till konkurrenten: mallen med platshållare och texten som gällde när mejlet gick |
| `granskning.mjs`, `granskning-sida.html` | ✅ | Granskningsappen: kortens data, status, sms, `attGora`, och sidan med svep och Ja/Nej |
| `output/granska/<id>/` | ❌ | Appen som publiceras: `index.html`, `data/granskning.json`, `data/status.json`, `bilder/` — byggs om med `--granska` |
| `arenden/<id>/anmalan/klipp.json` | ✅ | Klippvalet: paren (film, tid, avstånd, hash) per annons, de lånade hasharna, biblioteket — `--klipp` |
| `delbild.mjs` | ✅ | Vår bilds mittparti i deras bild (skala + läge, grov + fin dHash) — `--lagg-till-bild` |
| `shopify-anmalan.mjs` | ✅ | Shopify-anmälan: måttet (kvadrat ur vår stående film), paren, fälten, bevisbilden, Cowork-avsnittet |
| `arenden/<id>/shopify/anmalan.json` + `.txt` | ✅ | Shopify-anmälans fält, mått, bevisbildens CDN-länk, status + referens — `--shopify` |
| `arenden/<id>/shopify/bevis.png`, `bevis.jpg` | ❌ | Shopify-anmälans bevisbild (~5 MB) — byggs om med `--shopify` |
| `original.mjs` | ✅ | Våra originalannonser i annonsbiblioteket: fraserna, sökningen, jämförelsen ruta för ruta, ledfilmen |
| `arenden/<id>/anmalan/original.json` | ✅ | Per film: vår annons i annonsbiblioteket (länk, arkiv-id, sida, start, lika %) eller orsaken — `--original` |
| `output/klipp/<id>/` | ❌ | Cache: deras och våra filmer (mp4), `rutor-<video>.json`, `bibliotek.json`, rutorna som JPEG — bygg om med `--klipp` |
| `arenden/<id>/anmalan/<nr>-torr.png`, `<nr>-formular.png`, `<nr>-kvitto.png`, `kod.txt*` | ❌ | Formulärets skärmdumpar (torrkörning, ifyllt före Submit, kvittot) och engångskodens fil — referensen står i `<nr>.json` |
| `output/<datum>.annonser-<sid-id>.json` | ❌ | Annonsfilen läsaren skrev ur annonsbiblioteket (alla annonser, räckvidd, sidinfo) — byggs om med `--annonser-sida` |
| `cowork/1-annonser.txt` | ✅ | Reservprompten till Cowork när containern inte kan läsa annonsbiblioteket |
| `lage.json` | ✅ | När varje produkt kollades senast (rotationen), senaste körning |
| `sida.json` | ✅ | Granskningssidans artifact-länk: https://claude.ai/artifact/6JenXfVagtgw2THL8Q4y4v (publiceras om på samma länk varje körning) |
| `output/` | ❌ | Rådata, kandidater, annonsfiler, bildcache, skärmdumpar, sidan — dör med containern |

`KONKURRENTER_DATA=<mapp>` flyttar arenden.jsonl, arenden/, lage.json och
output/ dit (tester och provkörningar — repot rörs inte).

## Läget vid bygget (mätt 2026-09-27, kompletterat 2026-09-29)

- Butikerna: Bäverbutiken 248 produkter, CaraShell 4, Matstrumpor 5 — alla
  läsbara publikt. Sedan 2026-09-29 20 butiker (se "Alla varumärken"):
  beverbutikken.no 235, baeverbutiken.dk 175, majavakauppa.fi 175,
  CaraShells fyra språk 4 styck, Matstrumpors tolv språk 5 styck. OPS-butikernas `body_html` är 25 ord (texten ligger i
  temat) ⇒ "för lite text att söka på"; källan är ändå Bäverbutikens sida,
  som speglas.
- Avsändaren är Gmail — inga brevlådelösenord behövs. Reserven `--via
  loopia` fungerar bara för Bäverbutiken i den här miljön
  (`KUNDTJANST_MAIL_PASS_BAVERBUTIKEN`); CaraShells och Matstrumpors ligger
  på Railway för autosvaret.
- Fakturan: IBAN ifyllt 2026-09-29 (`--kolla` säger "kontrollsiffran
  stämmer"); bankgiro och BIC tomma. Moms 25 % SE / omvänd utomlands — om
  redovisningskonsulten säger skadestånd utan moms: `moms_procent: 0`.
- **Ad Library:** **webbversionen läses härifrån sedan 2026-09-29** —
  `adlibrary.mjs`: 403 "Client challenge" tre–fyra gånger, sedan 200 och
  annonserna som JSON i HTML:en; räckvidden per annons via detaljfrågan;
  ORVO:s 37 annonser på 42 s. API:t svarar fortfarande `(#10) 2332002
  Application does not have permission` med `META_ACCESS_TOKEN`. Det är ett EGET program hos Meta (Ad Library API), skilt från
  appen och systemanvändaren som läser annonskontona: det kräver att en
  fysisk person bekräftat sin identitet **och en användartoken från den
  personen** — enligt Metas dokumentation räcker inte systemanvändarens
  token ("API LONG TERM"). Axels klick: https://www.facebook.com/ID
  (identitet), https://www.facebook.com/ads/library/api ("Kom igång"), sedan
  en token ur https://developers.facebook.com/tools/explorer som
  `META_ACCESS_TOKEN_ADLIBRARY` i Environments (`sok.mjs adLibraryToken`
  provar den först). Koden slår på källan själv när svaret blir 200. Tills
  dess: annonsfallet ovan.
- Meta: OPS-kontot svarar "(#1) Please reduce the amount of data" på
  200 annonser med breda fält — därför 50 per sida, smala fält och
  halvering vid felet (`korpus.mjs hamtaAnnonssidor`). ⚠️ En nättimeout
  (90 s) på EN sida tömde 2026-09-29 hela MagiBorsten (0 av 629 annonser)
  och ORVO:s 14 IBC-kopior försvann ur fyndet: sidan läses nu om upp till
  tre gånger, och annonsfallet STANNAR om något konto inte gick att läsa
  (`--tillat-trasigt-konto` överstyr) — hellre inget fynd än ett falskt.
- Chromium: finns (Playwright i `/opt/node22/lib/node_modules/playwright`),
  3 bilder hashade på 440 ms, skärmdump 1280 × 2200 JPEG ≈ 200 kB, faktura-PDF
  på 2,2 s.

## Regler som sitter i koden

- Rutinen skickar aldrig ett brev; `overgang(ny → skickad)` kräver `av: 'axel'`.
- Ett brev per ärende; påminnelsen bara efter ett skickat brev; eskalering bara människan.
- Mottagaren får aldrig vara en av våra domäner; utan mottagare skickas inget.
- Bevislistan i brevet och fakturaraderna skrivs ur mätningarna, aldrig fritt.
- Ingen faktura utan bankgiro/IBAN (och IBAN:et måste klara mod 97), utan köparnamn, utan rader, på 0 kr, eller med exponeringar utan CPM.
- CPM:en är mätt (Meta, egna konton, samma land), aldrig gissad; reserven i konfig bär sitt mätdatum.
- Egna domäner (konfig + `sparning/butiker.json` + `kommentarer/konfig.json` +
  fabrikens filer) blir aldrig kandidater; marknadsplatser och sociala nätverk
  ignoreras.
- En Meta-anmälan per annons; ingen skickas utan Axels "kör anmälningarna <id>"; varje inskickad kvitteras med referens och aldrig två gånger.
- Brevet och anmälan påstår bara det uppräknade (sekvenser med tidskoder, ordagranna passager, identiska bilder) — aldrig "filmerna är våra", aldrig en andel, aldrig marknadsföringslagen, aldrig produktsidor utan uppmätt text.
- Klipp i `externa/` bär aldrig ett par, räknas aldrig i andelen och deras filmer länkas aldrig som original.
- En Shopify-anmälan bara på det som mätts som vårt (≥ 3 identiska rutor ur ≥ 2 sekunder, ≥ 30 %), bara efter Axels Ja på kortets version, kvitterad en gång.
- Bildbevis säger "identical" bara när mätningen gör det; en delbild påstår bara att bilden under texten är vår.
- 95 tester utan nät: `node --test konkurrenter/test/*.test.mjs` (ingår i `npm test`).
