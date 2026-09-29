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
   (`META_ACCESS_TOKEN`, delade konton filtreras på kampanjprefix). Dagens
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
   annonser med räckvidd på 42 s. Reserv (`--hamta --annonser <fil>`): Axel
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

## Filer

| Fil | Committas | Vad |
|---|---|---|
| `konfig.json` | ✅ | Verksamheter, avsändare (Gmail), faktura (beräkning, CPM-reserv, moms, IBAN, schablontaxa), egna domäner, trösklar, Discord — facit |
| `arenden.jsonl` | ✅ | Ärendeloggen (kvittot på varje brev och faktura) |
| `arenden/<id>.md`, `arenden/<id>/skarmdump.jpg`, `arenden/<id>/miniatyrer.json` | ✅ | Bevisen per ärende |
| `arenden/<id>/brev.txt`, `brev.json`, `faktura-<nr>.pdf` + `.html` | ✅ | Sändpaketet: exakt det som lades i Gmail |
| `arenden/<id>/anmalan/<nr>.json` + `.txt` | ✅ | Meta-anmälan per annons: fälten, bevisbildens CDN-länk, status + Metas referens |
| `arenden/<id>/anmalan/bevis-<nr>.png`, `verifiering.html` | ❌ | Bevisbilderna (~1 MB styck) och Axels verifieringssida — byggs om med `--anmal` |
| `arenden/<id>/sms-mall.txt`, `sms.txt` | ✅ | Sms:et till konkurrenten: mallen med platshållare och texten som gällde när mejlet gick |
| `granskning.mjs`, `granskning-sida.html` | ✅ | Granskningsappen: kortens data, status, sms, `attGora`, och sidan med svep och Ja/Nej |
| `output/granska/<id>/` | ❌ | Appen som publiceras: `index.html`, `data/granskning.json`, `data/status.json`, `bilder/` — byggs om med `--granska` |
| `arenden/<id>/anmalan/klipp.json` | ✅ | Klippvalet: paren (film, tid, avstånd, hash) per annons, de lånade hasharna, biblioteket — `--klipp` |
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
  läsbara publikt. OPS-butikernas `body_html` är 25 ord (texten ligger i
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
- 31 tester utan nät: `node --test konkurrenter/test/*.test.mjs` (ingår i `npm test`).
