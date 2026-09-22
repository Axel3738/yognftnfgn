# kundtjanst/ — veckorapporten för kundtjänst och chargeback-risk

En rutin, alla brands, noll beroenden. Varje måndag läser den förra veckans
supportmejl (Loopia) och Shopify för varje brand och svarar på tre frågor:

1. **Vilka ärenden återkommer?** Toppkategorierna, vecka mot vecka, och vilka
   som legat topp 3 i tre av fyra veckor — det är inte kundtjänst längre, det
   är produkten eller leveransen.
2. **Vilka varningssignaler leder till chargebacks?** Kunder som hotar med
   banken, "aldrig fått varan", dubbla debiteringar, obesvarade ärenden,
   betalda ordrar som inte skickats, riktiga tvister ur Shopify Payments och
   tvistgraden mot Visa/Mastercards gränser.
3. **Vilket brand ligger sämst till?** En ranking 0–100 med nivå 🟢🟡🔴.

Och sist i varje rapport: en numrerad lista till VA:n (engelska) och en till
Axel (svenska) — SOP:er som saknas i Notion, rotorsaker att ta tag i, nycklar
som fattas.

Vid sidan av veckorapporten går **tvistkollen** varje dag: `tvistkoll.mjs` läser
bara Shopify-tvisterna och larmar om någon har evidence-deadline inom tre dagar.
Den finns för att veckorapporten går måndag 07:00 — en tvist som kommer in på
tisdag med deadline på torsdag hinner annars gå ut (Axels beslut 2026-09-13).
Den läser inga mejl, tar sekunder och skriver ingenting i repot. Håll den så:
bygger man in ärenden och ranking i den blir den långsam och slutar köras.

⚠️ **Inquiry och chargeback är inte samma sak, och skillnaden är hela spelet.**
Mätt på Bäverbutikens 50 tvister 2026-09-20:

| | Antal | Avgjorda | Vunna | Förlorade |
|---|---|---|---|---|
| inquiry | 43 | 29 | **29** | **0** |
| chargeback | 7 | 4 | 1 | **3** |

Alla tre förluster någonsin var chargebacks (1 435 kr). En obesvarad **inquiry**
förloras alltså INTE automatiskt — den **eskalerar till chargeback** med ny
deadline, och det är där pengarna försvinner. #4914, #5044 och #4706 gick den
vägen och rapporterades felaktigt som förlorade 2026-09-18/19. Larmet sorterar
därför chargebacks överst, och texten "an unanswered dispute is lost
automatically" är borttagen ur både koden och rapportsidan — skriv aldrig
tillbaka den.

**Tvisterna på kundtjänstsidan sedan 2026-09-22** (sektionen *Disputes now —
all stores* i `rapport-sida.html`, kontraktet i `DASHBOARD-TVISTER.md`):
öppna tvister ur `stonebite/data/snapshot.json` (timrutinens läsning) och
brådskan ur `node kundtjanst/tvistkoll.mjs --alla --torr --json`, som
`rapportsida.mjs` kör själv vid bygget (`korTvistkoll`; argumenten är frysta,
`--discord` kan inte smyga in; `--utan-tvistkoll` hoppar). Per butik:
chargebacks överst, sedan kortast tid kvar, sedan belopp; pengar i risk per
valuta — aldrig summerat; *overdue* (kvar < 0) och *due today* (kvar = 0) är
två stämplar; "submit by" = deadline − 1 dag, för bevis skickas in sist medan
kundmejlet går i dag; handbokslänk per rad ur `handbok.json`. En butik
tvistkollen inte kunde läsa står som **okänd med orsaken ordagrant** (lång
Shopify-felsida: första raden + "show the full reason"), aldrig som noll — och
har snapshoten rader för den står raderna kvar med dagar kvar räknade av sidan
(`kvarFran: 'sidan'`), märkt att brådskan inte lästes live. **Ingen dom**
(FIGHT/REFUND/ESCALATE) visas: `tvistfakta.mjs` har inget `--json`, och en dom
gissad ur reason-koden är påhittad. Sidan skriver aldrig i Shopify och rör
aldrig `korningar/` eller `historik/`. ⚠️ Vilken butik som går att läsa beror
på containerns nycklar: sessionen som byggde 2026-09-22 saknade
`SHOPIFY_CLIENT_ID_BAVERBUTIKEN_EMAILSCRAPER` och fick 403 på Bäverbutiken,
medan timrutinens snapshot samma timme bar 10 öppna tvister för den — sidan
visade då raderna ur snapshoten med 403-orsaken bredvid, precis som tänkt.

Handboken VA:n följer när larmet kommer ligger i **`kundtjanst/sop/`** (engelska,
portabel över alla butiker). `kundtjanst/tvistfakta.mjs` ger domen på ett
kommando; `kundtjanst/sop-koll.mjs` vaktar att SOP:erna förblir portabla.

```bash
node kundtjanst/run.mjs --kolla                       # vad går att läsa här?
node kundtjanst/run.mjs --brand tacklebay --torr      # provkör ett brand, skriv inget
node kundtjanst/run.mjs --alla --discord              # rutinen
node kundtjanst/tvistkoll.mjs --torr                  # dagliga tvistkollen, posta inget
node kundtjanst/tvistkoll.mjs --alla --discord        # dagliga rutinen
node kundtjanst/setup.mjs                             # nycklar som saknas + rutinens cron
node kundtjanst/setup.mjs --nytt-konto                # receptet för ett annat Claude-konto
node kundtjanst/setup.mjs --mappar tacklebay          # brevlådans mappnamn (Skickat?)
node kundtjanst/run.mjs --fixtur kundtjanst/test/fixturer/demo --torr --datum 2026-09-14   # demo utan nät
```

## Brevlådan som CLI och som egen MCP-connector (`mail.mjs`, `mail-mcp.mjs`)

Veckorapporten läser allt på en gång. Ibland vill man bara *titta i inkorgen*:
vad kom in i dag, vad skrev kunden i #5122, finns ordet "chargeback" någonstans.
Det gör `kundtjanst/mail.mjs` — läs-bara, över samma webbmejl (Roundcube på
port 443), med samma nyckel `KUNDTJANST_MAIL_PASS_<ID>`:

```bash
node kundtjanst/mail.mjs kolla                        # logga in och ut — funkar nyckeln?
node kundtjanst/mail.mjs mappar                       # INBOX, INBOX.Sent, INBOX.Drafts …
node kundtjanst/mail.mjs lista --antal 20             # nyast först: uid, oläst (•), datum, från, ämne
node kundtjanst/mail.mjs las 1650                     # ett mejl (--ra ger råkällan, --max 4000 klipper)
node kundtjanst/mail.mjs sok "order 5122" --sidor 4   # ämne + avsändare, ~50 mejl per sida
node kundtjanst/mail.mjs sok chargeback --kropp       # även i texten (hämtar varje mejl — långsamt)
```

`--json` ger maskinläsbart, `--brand <id>` väljer brevlåda när flera är
konfigurerade (med en enda väljs den själv), `--tyst` tystar loggen.
Listningen använder Roundcubes egna listkolumner och hämtar inte råmejlen —
en sida med 50 mejl tar en sekund. Läsning markerar inte mejlet som läst.

**Skrivning (2026-09-21, byggd för autosvaret):** samma CLI kan svara i
tråden, spara utkast, flagga, flytta och skapa en mapp — aldrig radera,
aldrig markera som läst:

```bash
node kundtjanst/mail.mjs svara 1650 --visa                     # vad svaret blir: till, ämne, citat — skickar inget
node kundtjanst/mail.mjs utkast 1650 --text "Hej! …"           # sparar i Drafts (torrkörningen)
node kundtjanst/mail.mjs svara 1650 --text "Hej! …"            # SKICKAR i tråden — går inte att ångra
node kundtjanst/mail.mjs flagga 1650 [--av]                    # stjärnan på/av
node kundtjanst/mail.mjs flytta 1650 --till VA-PRIO --skapa    # till en mapp (skapas bara med --skapa)
node kundtjanst/mail.mjs mapp VA-PRIO                          # skapa en mapp
```

Svaret öppnas med Roundcubes eget svarsformulär (`_reply_uid`), så servern
sätter `In-Reply-To`/`References` själv och tråden hänger ihop i kundens
klient; kundens mejl citeras under vår text. Skrivvägen är avläst ur
Roundcubes källkod (master 2026-09-21: `program/actions/mail/{compose,send,
mark,move}.php`, `settings/folder_save.php`, `app.js submit_messageform`)
och **mätt live mot Loopia 2026-09-21** i autosvarets första torrkörning.
Två saker skilde sig från läsningen och är rättade: (1) `compose` utan `_id`
svarar **302** till samma sida med ett nymintat `_id` — klienten följer den
enda omdirigeringen; (2) Loopias brevlåda har namnrymden **`INBOX.`** —
`save-folder VA-PRIO` skapar `INBOX.VA-PRIO`, och `hittaMapp()` slår upp det
riktiga IMAP-namnet så att människan får säga `VA-PRIO`. Utkast (steg 8),
flagga (9) och flytta (10) svarade som källkoden sa. Säger felet `steg 7`–`11`
är det Loopias Roundcube som ändrat sig igen.

⚠️ **Tråden byggs ur HELA Skickat, inte första sidan** (rättat samma kväll).
Bäverbutikens Skickat hade 576 mejl på 12 sidor, och VA:ns svar från en vecka
tillbaka låg på sida 4 och 5 — så två av fyra utkast i första torrkörningen
gick till kunder som redan hade ett svar från oss. `autosvar.mjs mappIndex`
läser nu inkorg, Skickat och Drafts sida för sida 30 dagar bakåt, en gång per
körning (~30 s hos Bäverbutiken: 25 sidor inkorg + 9 sidor Skickat), och
stannar när en hel sida är äldre än fönstret (`brevlada.tolkaListdatum` läser
Roundcubes visningsdatum). Taket är 40 sidor per mapp; nås det står det som
varning i rapporten i stället för att äldre svar tyst försvinner.

**Samma saker som MCP-verktyg:** `kundtjanst/mail-mcp.mjs` är en
stdio-MCP-server (JSON-RPC 2.0, en rad per meddelande, noll beroenden) som
`.mcp.json` i repo-roten registrerar under namnet **`loopia-mail`**. En
Claude Code-session i repot får då `mail_brands`, `mail_folders`,
`mail_list`, `mail_read`, `mail_search` (läsning) och `mail_reply`,
`mail_draft`, `mail_flag`, `mail_move` (skrivning) som riktiga verktyg — utan
att komma ihåg en Bash-rad, och utan någon connector på claude.ai (Loopia har
ingen). `mail_reply` är markerat `destructiveHint` (går inte att ångra);
`mail_draft` är torrkörningen. Servern håller Roundcube-sessionen levande
mellan anropen, loggar in igen själv om den gått ut (30 min), kör anropen ett
i taget per brevlåda (två parallella inloggningar gav 403, mätt 2026-09-21)
och loggar ut när Claude Code stänger den.

Kräver bara `KUNDTJANST_MAIL_PASS_<ID>` i miljön — `.mcp.json` skickar alla
kända brands nycklar vidare uttryckligen (Bäverbutiken, OPS-butikerna,
Beverbutikken, Bæverbutiken, Majavakauppa); en ny butiks nyckel läggs till
där. `.claude/settings.json` har `enableAllProjectMcpServers` så servern
startar utan godkännandeklick i rutinerna.

Prova för hand: `printf '%s\n' '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | node kundtjanst/mail-mcp.mjs`.
Skarpt mätt 2026-09-21 mot Bäverbutiken: INBOX 1 574 mejl på 32 sidor,
listning + sökning på en sida ≈ 2 s, `--kropp` ≈ 0,3 s per mejl.

⚠️ Utdata bär kundadresser i klartext — det är ett verktyg för den som redan
har lösenordet. Maskera (`ka***@gmail.com`) innan något postas i Discord
eller Notion; rapporterna gör det själva, CLI:n gör det inte.

## Autosvaret: enkla mejl besvaras, arga lugnas, svåra flaggas (`autosvar.mjs`)

**På kundtjänstsidan sedan 2026-09-22** (sektionen *Auto-reply* i
`rapport-sida.html`, kontraktet i `autosvar/DASHBOARD.md`): loggens 30 dagar per
butik via `autosvar/oversikt.mjs` — aldrig omräknat på sidan — plus mappen
`INBOX.VA-PRIO` läst live när `KUNDTJANST_MAIL_PASS_<ID>` finns
(`rapportsida.mjs` → `hamtaVaKo`, läs-bara). Utkast (`torr: true`) visas som
utkast, aldrig som skickat.

**Var boten kör — Railway, inte en rutin (Axels krav 2026-09-22: "svara arga
kunder på 60 sekunder … måste ligga och skanna hela tiden").** En rutin på
claude.ai kör som tätast en gång i timmen. Minutservern (`--loop 60`) körs
därför som barnprocess av sajtens server på Railway
(`stonebite/autosvar-vakt.mjs`): på när `AUTOSVAR_BRANDS` är satt på
tjänsten, torrt tills `AUTOSVAR_LAGE=skarpt`, omstart med växande paus när
den dör, startar inte alls om `KUNDTJANST_MAIL_PASS_<ID>` saknas (och säger
vilket). Loggen — minnet "ett svar per tråd någonsin" — skrivs på volymen via
**`AUTOSVAR_LOGGMAPP`** (`autosvar/logg.mjs` läser variabeln; standard
`<STONEBITE_DATA>/autosvar/logg`), så den överlever varje deploy, och
stonebite.org läser samma mapp live: de arga kunderna står på Kundtjänst
inom minuten. `/halsa` på sajten visar `autosvar.kor`. Slås på med Cowork:
`stonebite/cowork/5-autosvar.txt`. ⛔ När vakten är på kör ingen session
`autosvar.mjs` mot samma brevlåda för hand — två kopior är ett dubbelsvar.
Repots logg (`kundtjanst/autosvar/logg/`) är sessionskörningarnas historik;
Railways logg committas inte.

Axels uppdrag 2026-09-21: ett kundtjänstverktyg som svarar på enkla mejl
själv och håller arga kunder lugna tills VA:n hinner — alla butiker.

```bash
node kundtjanst/autosvar.mjs --kolla                                # vad går att läsa/skriva per butik
node kundtjanst/autosvar.mjs --brand baverbutiken --torr            # svaren som UTKAST i Drafts, inget skickat
node kundtjanst/autosvar.mjs --brand baverbutiken --skarpt --discord  # skarpt (bara efter 20 rätta utkast i rad)
node kundtjanst/autosvar.mjs --alla --skarpt --loop 60              # minut-servern: samma kod, om och om igen
```

Tre hinkar, rena regler (`autosvar/hinkar.mjs`), ingen modell:

| Hink | Vad | Vad motorn gör |
|---|---|---|
| **ENKEL** | var är min order, leveranstid, adressbyte före leverans, öppettider | svarar själv med fakta ur Shopify + 17TRACK (`autosvar/fakta.mjs`); saknas fakta ⇒ SVÅR |
| **ARG** | frustration, hot om bank/ARN/recension, "aldrig fått", trasig vara, tredje mejlet utan svar | Axels lugnande rad (`autosvar/svar.mjs`, X = kundens faktiska problem), flaggar och flyttar till `VA-PRIO` |
| **SVÅR** | retur, återbetalning, reklamation, tvist, fel vara, allt som inte går att belägga | inget svar, bara flagga |
| SKIP | autosvar, listmejl, Shopify/Klarna-notiser, butikens egna adresser | rörs inte |

Järnreglerna står i `.claude/commands/autosvar.md` och som tester i
`test/autosvar.test.mjs`: ett automatiskt svar per tråd någonsin (Sent, Drafts
OCH loggen `autosvar/logg/<butik>.jsonl` räknas — ett dygns spärr per kund
dessutom), aldrig på tvistord eller bilagor, aldrig ett löfte
(`harForbjudet`), aldrig en annan kunds order (orderns e-post måste vara
avsändarens), kundens språk (sv/nb/da/fi/en), signatur = butikens supportnamn.
Allt i svaret kommer ur brandfilens `svar:`-block (leveranslöfte, packtid,
spårningssida, signatur, VA-mapp), ur Shopify (order, sändning, skickdag) eller
ur 17TRACK (senaste skanningen, gratis läsning — registreras aldrig här).
Svenska skanningsfraser översätts med `sparning/oversatt.mjs`; engelska
kunder får fraktbolagets egen rad.

Bäverbutikens Shopify-app för kundtjänsten kräver `SHOPIFY_CLIENT_ID/SECRET_
BAVERBUTIKEN_EMAILSCRAPER`; saknas de faller `korkonfig` tillbaka på den
uppsättning `SHOPIFY_SHOP_<X>` som bär butikens domän (`_SE`, `_NO`, `_DK`,
`_FI` — mätt 2026-09-21: NO/DK/FI-apparna läser ordrar, SE-appen saknar
`read_orders`).

**Första riktiga torrkörningen 2026-09-21 kväll** (Bäverbutiken, 31 + 48 mejl
i två sessioner samtidigt — kör aldrig så, se `.claude/commands/autosvar.md`):
skrivvägen fungerar (utkast i `INBOX.Drafts`, flagga, `INBOX.VA-PRIO`), men
utkasten avslöjade fyra regelfel som är rättade samma kväll: Shopifys
kontaktformulär (`autosvar/kontaktformular.mjs` — kunden i Reply-To är
avsändaren), trådar VA:n redan besvarat (`redanBesvaradAvOss`), gammal fakta
(`fakta.staltFakta`: försenat, inga skanningar, oskickad, tvist) och "den
trasiga varan" om en vara som bara var för liten. Loggens trådnyckel hashas
sedan dess; `autosvar/logg-maskera.mjs` rättar en äldre logg.

### SOP-avstämningen 2026-09-21 — VA:ns SOP:er styr svaren

Axels order 2026-09-21 kväll: "läs igenom våra SOP:er för kundsupporten".
VA:ns SOP-databas är Notion **"Bäverkoppling.se"** (`333270ab-908c-8053-b629-f49e7f93ce71`,
~45 rader, PDF-bilagor SOP 01–40). Integrationen "Bäverbutiken RUTINER" är
INTE inbjuden dit — men kopian **"Customer support bäverbutiken"**
(`3aa270ab-908c-8057-a8a0-cc691d9e956b`, brandfilens `notion.sop_database_id`)
är det, och bär 34 av PDF:erna. De lästes den kvällen (hämtade via REST,
text ur `pdf-parse`). Axel bjöd in integrationen till originalet samma natt,
och de elva sista lästes då: **alla 42 PDF:er är lästa.** Originalens SOP 36/37
är samma text som kopians.

SOP:ernas README säger själv att de är skrivna för ett annat brand
(Bäverkoppling/Grill) och ska tas "with a pinch of salt" — bara det
brandneutrala eller det som står i brandfilen har automatiserats:

| SOP | Regel i motorn |
|---|---|
| 36/37 Where is my package / When will it arrive | WISMO-svaret säger var paketet ÄR: **hos ombudet** (bolag + kollinummer ur 17TRACK `misc_info`), **ute för leverans i dag**, **framme i landet — sista biten 1–2 arbetsdagar** (inhemskt bolag i `misc_info` = i landet), annars senaste skanningen. Senaste skanning äldre än 3 dagar ⇒ SOP:ens rad *"helt normalt att spårningen står still — paketet är på väg ändå"*. Passerat fönster / inga skanningar ⇒ aldrig ett gissat datum, VA:n (`staltFakta`) |
| 06 Package missing after delivered | Levererat enligt fraktbolaget + lugn kund ⇒ ENKEL `levererad`: leveransskanningen (datum, ort) + checklistan brevlåda/avi/ombud/grannar/skyddad plats, aldrig ordet "borttappat"; flaggas + VA-mappen så VA:n följer upp. Arg kund ⇒ ARG som förut |
| 11/30 Order confirmation / tracking mail not received | Nämner kunden en saknad bekräftelse ⇒ WISMO-svaret får skräppost-raden (sök på butikens namn); leveranstid-svaret nämner skräpposten |
| 05/08 Damaged / wrong product | Lugn kund ⇒ ENKEL `foton`: beklagan utan löfte + bildförfrågan (vara, förpackning, fraktetikett) + ordernumret om det saknas i mejlet; flaggad + VA-mappen så VA:n tar ärendet när bilderna kommer. Arg kund ⇒ ARG-svaret (Axels rad) med samma bildförfrågan. *(Kalibreringen 2026-09-22 — före det var "trasig vara" ARG i sig)* |
| 38 Company information | ENKEL `foretag` ur brandfilens `svar.foretag` (namn, orgnr, adress, moms) — aldrig ett personnamn; saknas blocket ⇒ VA:n |
| 36 steg 1 Ask for order number | Bakom `svar.fraga_ordernummer` (standard av): WISMO utan order ⇒ be om ordernumret + flagga. Axels beslut per butik |
| 02 Tracking not updating / stuck | Säger kunden själv att spårningen står still får WISMO-svaret lugnande raden även när skanningen är färsk (`namnerStillaSparning`); aldrig "borta"/"förlorat". Utanför fönstret ⇒ VA:n (agenten kontaktas, aldrig ett gissat datum) |
| 07 Wrong quantity | "fel antal", "saknas en", "för få" ⇒ kategorin `fel_vara` ⇒ ENKEL `foton` (bild på det som kom är SOP:ens första steg), flaggad + VA-mappen. Leverantören först, sedan ägaren — VA:n tar resten |
| 15/34 Not as pictured / website complaints | "ser inte (alls) ut som på bilden", "not at all like" ⇒ `fel_vara`; arg kund ⇒ ARG med neutralt X ("varan som inte stämde") + bildförfrågan; lugn kund ⇒ ENKEL `foton` + flagga, så ägaren ser webbplatsfeedbacken via VA-mappen |
| 13/16/17/35 Product fit / specs / compatibility / pre-purchase | Produktspecifika fakta för Bäverkopplings kontakter — gäller inte Bäverbutikens produkter. Produktfrågor är aldrig ENKEL; "never confirm values you are not certain about" ⇒ VA:n |
| 21 Exchange | Inga direkta byten, retur + ny order, ägarens godkännande ⇒ SVÅR (`retur_angerratt`, och `hinkar.arByte`: "för litet", "en storlek större", "passar inte", "too small" ⇒ "byte eller storlek (SOP 21) — VA:n beslutar", varken argt eller enkelt) |
| 09 Address change | Oskickad ⇒ svar + flagga + VA-mappen (VA:n ändrar i Shopify); skickad ⇒ VA:n. Oförändrat |
| 10, 18, 20, 25, 22/12, 23, 26, 32, 33, 39 (avbeställning, retur, återbetalning, tvist, betalning, tull, återförsäljare, rabatt, faktura) | Kräver ägarens beslut enligt SOP:en (3-stegs-returen: 30 % → 50 % → retur) ⇒ alltid SVÅR/VA:n. Aldrig automatiserat |

### Kalibreringen 2026-09-22 — vad "arg" betyder, och vem kunden tillhör

Axels dom på första torrkörningen: *"jag tyckte inte riktigt att han verkade
så himla sur, Jan-Olof"* — ett artigt "överdraget är för litet, jag behöver en
storlek större" hade fått eskaleringsmallen, för kategorin `skadad_defekt` var
ett ARG-tecken i sig. Tre regler ändrades, alla som tester:

- **ARG är riktig ilska** (`hinkar.arArg`): argt ordval, eskaleringsord, hot om
  bank/anmälan, versaler, utropstecken, tredje mejlet utan svar. Kategorierna
  `ej_levererad` och `skadad_defekt` räknas inte längre — lugnt är de WISMO med
  fakta resp. ENKEL `foton`. Byte/storlek är SVÅR (SOP 21).
- **Det arga svaret bär läget** (`svar.lageRader`, samma rader som WISMO-svaret):
  "Det här ser jag just nu om din order #…" — bara med färsk fakta (ingen
  `sparr`) och kundens egen order. Faktan hämtas för ARG när mejlet handlar om
  paketet.
- **Kunden är VA:ns i 14 dagar** (`hinkar.VA_KUND_DAGAR`, `byggTrad.vaDagar`):
  har VA:n skrivit till adressen i Skickat de senaste 14 dagarna, i vilken tråd
  som helst, får kunden inget automatiskt svar — bara flagga. Upptäckt i samma
  kalibrering: Ulf svarade "Skräp! Tills ni skickar 3 nya …" på en
  **Judge.me-recensionsförfrågan**, och trådregeln såg inte VA:ns fyra svar i
  kontaktformulärstråden samma vecka. Utkastet "Jag eskalerar detta …" hade
  pratat i munnen på VA:n.

**Och en bugg som hade gjort båda vakterna blinda live:** `Brevlada.lista`
skickade mappnamnet rakt till Roundcube, och Roundcube 1.7 på Loopia svarar
med en **tom lista, inget fel**, för en mapp som inte finns. Trådbyggaren
provade aliasen `Sent` → `INBOX.Sent` → … och tog det första som "fanns" —
alltså den tomma `Sent`. Skickat lästes aldrig, Drafts inte heller (samma
alias-loop): VA:ns fyra svar till Ulf syntes inte, och ett utkast i
`INBOX.Drafts` hindrade inte ett andra utkast till Hans i nästa körning. Bara
loggen (`minne`) höll dubbelsvaren borta — men loggen delas inte mellan
containrar. Rättat i `brevlada.mjs` (`losMapp`: namnet slås upp mot
brevlådans kända mappar, okänt ⇒ `MAPP_SAKNAS`), testat mot den falska
Roundcuben, och **verifierat live i en tredje `--igen`-körning:** Ulf ⇒ SVÅR
"VA:n skrev till kunden för 3 dagar sedan (annan tråd)", Hans ⇒ "tråden har
redan ett svar från oss" (utkastet i Drafts), noll nya utkast.

### Axels feedback på utkasten 2026-09-22 — mallarna omskrivna

Axel läste de fem utkasten och gav feedback per mejl. Allt är inlagt:

- **ARG börjar aldrig med "jag eskalerar detta".** Ordningen är: hälsning
  med namn → *"Jag förstår helt din frustration."* → problemet i klartext,
  minst lika argt som kunden (*"En produkt som inte alls ser ut som på bilden
  är helt oacceptabelt, och det är inget vi står för"*) → *"Jag har eskalerat
  det här direkt till vårt ansvariga team som ett brådskande ärende — du kan
  räkna med svar inom de kommande dagarna"* → *"Har du mer information …
  svara på det här mejlet"* + bilderna. X (`svar.mjs` → `t.x`) är HELA
  meningar, personliga per ärende: `som_pa_bilden` (Tobias), `kvalitet`
  (Morgan: "rent skräp, tunt som en ICA-kasse"; Tony: "sop-påse"),
  `skadad_defekt`, `ej_levererad`, `vantat` … och `opostad(n)` — Axels eget
  exempel "din order har legat opostad i 13 dagar" — när ordern är oskickad
  längre än packtiden. Bilderna begärs på alla produktklagomål.
- **Returinformationen direkt** (Peter: "hur gör vi enklast för en smidig
  retur?" — Axel: "då kan vi ju skicka han returinformationen direkt"):
  `hinkar.arReturfraga` känner igen avsikten (vill returnera / hur gör jag /
  returadress …), lugn ⇒ ENKEL `retur`, arg ⇒ ARG-svaret + returblocket.
  Texten följer VA:ns egna returmejl i Skickat: originalförpackning, namn +
  ordernummer på paketet, kopia av bekräftelsen, adressen rad för rad
  (brandfilens `tvister.returadress`, nu hela adressen), spårbar frakt +
  spårningsnumret till oss, returfönstret ur brandfilen (14 dagar från
  mottagandet sedan Axels beslut B 2026-09-22), policylänken. Vem som
  betalar returfrakten sägs BARA när `tvister.returfrakt_betalas_av` är
  ifyllt — och det är `kund` sedan 2026-09-21 (retur-SOP:en, commit
  `9cfa779a`, samma sak som VA:n skriver: "kundens ansvar"), så raden
  "Returfrakten står du själv för." står med. ⚠️ Den raden kom in på `main`
  från SOP-grenen medan autosvarets test på den här grenen krävde tomt —
  efter mergen av PR #113 + #116 var testet "flödet (--torr)" rött på `main`
  (dashboard-sessionen såg det 2026-09-22 kväll); testet följer brandfilen
  sedan dess. Aldrig ordet återbetalning. Flaggad + VA-PRIO: VA:n tar emot
  returen.
- **WISMO utan avsändningsdatum, utan första sträckans fraktbolag, utan
  "framme i Sverige"** (Hans-utkastet: "Paketet skickades 15 september med
  YunExpress" ska inte skrivas): bara *"Paketet ligger hos DHL för sista
  biten — det brukar levereras inom 1–2 arbetsdagar"*, eller *"Paketet är
  skickat och på väg"* + datumet för senaste uppdateringen (ingen ort, inget
  land), plus **bävernumret i klartext** bredvid länken (`fakta.bavernummer`).
  Skräppost-raden ("sök på Bäverbutiken") behölls — Axel: "jättebra tips".
- Löftesspärren (`harForbjudet`) ignorerar länkar sedan samma natt —
  policylänken heter `…/refund-policy` och stoppade hela returinformationen.

**Andra feedbackrundan (Tobias, Juan, Morgan, samma natt) — allt inlagt:**

- **Inga tankstreck i mejl.** Axel: "det märker man direkt att det är AI och
  det känns bara opersonligt". Inga "—" mellan satser, inga "–" i intervall:
  "1-2 arbetsdagar", "2-4 dagar", "24 sep till 1 okt". Testet kör varje mall
  på alla fem språk och felar på ett enda streck.
- **"Svar inom 48 timmar"** i stället för "inom de kommande dagarna"
  (`svar.eskalering_timmar`, standard 48 — Axel: sätt förväntningen där, VA:n
  svarar snabbare ändå).
- **Ordernumret efterfrågas när det saknas.** Tobias skrev inget nummer, och
  ingen order fanns på hans adress. Då byts "har du mer information … svara"
  mot "för att vi ska kunna hitta din order behöver vi ditt ordernummer".
  ARG hämtar därför alltid faktan (ordern hittas på e-posten även utan nummer
  i mejlet); läget ur spårningen visas bara när mejlet handlar om paketet.
- **Returen: "posta direkt till adressen, inte till ett ombud — vi hämtar
  inte ut paket från ombud"** som egen rad efter adressen, på alla språk.
- **Returfönstret:** Axel frågade om SOP:erna säger 14 eller 30. **SOP 18
  (Customer Wants to Return) säger 30 dagar från mottagandet**, och nämner
  EU:s 14 dagars ångerrätt vid sidan om ("Refer to the 30-day return policy
  and the EU 14-day right of withdrawal"); den publicerade policyn
  (`/policies/refund-policy`) säger också 30. **Axels beslut 2026-09-22,
  alternativ B: 14 dagar.** `tvister.returfonster_dagar` är 14 i
  Bäverbutikens brandfil sedan dess, så returmejlet och tvist-SOP:ernas
  platshållare säger 14. ⚠️ Policysidan i Shopify och SOP 18 i Notion sade
  fortfarande 30 vid beslutet — de är Axels respektive VA:ns att ändra, och
  tills sidan är ändrad kan en kund peka på dess 30 dagar.
- Utkastet "Niklas Hurtig, Re:" i Drafts är daterat 2026-08-19 och kommer
  inte från autosvaret (som byggdes 2026-09-21). Axels invändning gäller
  ändå som regel: nämn fraktbolaget för sista biten vid namn (det gör
  `framme(bolag)` ur 17TRACK), aldrig "den lokala transportören", och
  spårningslänken följer alltid med när ett spårningsnummer finns.

**Femte `--igen`-körningen 2026-09-22 ~01:58 CEST med de nya mallarna:**
50 mejl, **3 utkast** — Tobias (ARG `som_pa_bilden` + bilder), Morgan (ARG
`kvalitet`), Juan #6504 (kontaktformulär, "önskar returnera den ni skickade"
⇒ ENKEL `retur` med hela returblocket). **Tony, Peter och Hans hade VA:n
redan svarat på måndagen** (Skickat 21/9 kl 13:09, 11:03 resp. 12:33 CEST —
alltså FÖRE den första kalibreringskörningen 01:10). Tre av de fem utkast
Axel läste gick alltså till kunder VA:n redan svarat samma dag: Skickat-vakten
var blind (mappbuggen ovan) tills den fjärde körningen. Med Skickat läst
säger motorn "tråden har redan ett svar från oss" resp. "VA:n skrev till
kunden för 1 dag sedan" och skriver inget utkast — precis vad regeln ska
göra. Axels feedback på texten gäller ändå; mallarna är omskrivna efter den.

`--igen` är kalibreringsläget (kräver `--torr`): flaggor och loggen ignoreras
så fönstrets mejl bedöms på nytt. **Körningen 2026-09-22 ~01:10 CEST på
Bäverbutiken:** 50 mejl lästa, 6 hoppade, **1 ENKEL** (Hans, kontaktformulär
"var är mitt husvagnsöverdrag, ingen orderbekräftelse" → order på e-post,
skickad 15/9, framme i Sverige hos DHL, spårningslänk + skräppost-raden),
**5 ARG** (Tobias "Vad är det här för skit?" + bilder; Morgan "rent skräp …
full återbetalning"; Tony "sop-påse med spännband!!! … Klarna" + bilder; Peter
"är detta ett skämt … sociala medier … smidig retur?" + bilder; och Ulf — fel,
se ovan, rättat och utkastet borttaget), **38 SVÅR** flaggade (Jan-Olof nu
"byte eller storlek (SOP 21)", Eric #5953 "tvist hos Shopify", "Kamera
leverans?" "tråden har redan ett svar från oss", AnnChristin retur — gårdagens
fyra felaktiga utkast är alltså alla rätt nu). Ett mönster att veta om: Hans
skickade formuläret tre gånger (07:59 ×2, 08:33); det nyaste hotar med Klarna
och "avbeställa" ⇒ SVÅR till VA:n, medan det äldsta fick WISMO-utkastet —
kunden får fakta om paketet, VA:n har hotet.

### Autosvaret som siffror, för en dashboard (`autosvar/oversikt.mjs`)

Axels fråga 2026-09-22: en annan session bygger en kundtjänst-dashboard och
ska kunna visa arga kunder, ärenden och vad autosvaret gjort. Kontraktet står
i **`kundtjanst/autosvar/DASHBOARD.md`** — läs den först. Kort:

```bash
node kundtjanst/autosvar/oversikt.mjs --brand baverbutiken           # svensk tabell
node kundtjanst/autosvar/oversikt.mjs --alla --dagar 30 --json       # { [butik]: översikt }
```

Läser bara loggen (`autosvar/logg/<butik>.jsonl`), senaste raden per
Message-ID vinner, och ger per butik antal per hink, per typ/kategori/språk,
per dag, de arga raderna (med `x`, `lage`, `retur`), de svarade, de som
ligger hos VA:n utan svar, och felen. Kundadresserna är redan maskerade i
loggen och maskeras aldrig upp. Ren funktion (`oversikt(rader, {nu, dagar})`),
testad. Mätt mot den riktiga loggen 2026-09-22: 5 körningar, 102 mejl,
67 ärenden, 1 ENKEL, 2 ARG, 64 SVÅR, 3 utkast, 0 skickade.

Tre saker dashboard-sessionen aldrig gör (står i DASHBOARD.md → "Rör inte"):
kör `autosvar.mjs` mot en brevlåda (en session per brevlåda), skriver i
loggen (motorns minne för "ett svar per tråd"), raderar mejl.

## Så hänger det ihop

```
factory/butiker/*.yaml ─┐                      ┌─ imap.mjs + mime.mjs   (Loopia, läs-bara)
kundtjanst/brands/*.yaml ┴─ brands.mjs ─ run.mjs ┼─ shopify.mjs          (ordrar + tvister, läs-bara)
                                                 ├─ arenden.mjs          (mejl → trådar: obesvarat, svarstid)
                                                 ├─ klassificering.mjs   (regler, 14 kategorier, 5 språk)
                                                 ├─ llm.mjs              (valfri: "övrigt" + en mening per toppärende)
                                                 ├─ chargeback.mjs       (signaler med tak → 0–100, ranking, återkommande)
                                                 ├─ notion.mjs           (SOP-täckning, rapportsida — valfritt)
                                                 ├─ atgardsplan.mjs      (tal → VAD VA:N SKA GÖRA, engelska)
                                                 ├─ dashboard.mjs        (körningen som maskinläsbar data, maskerad)
                                                 └─ rapport.mjs          (svenska till Axel, engelska till VA:n/Discord)
                                                        │
                        kundtjanst/korningar/<brand>/<vecka>.md  + .en.md
                        kundtjanst/korningar/<brand>/<vecka>.json  ← hemsidan bygger på den
                        kundtjanst/korningar/_ranking/<vecka>.md
                        kundtjanst/historik/<brand>.jsonl   ← det som gör "återkommande" mätbart
                                                        │
                        rapportsida.mjs → rapport-publicerad.html → Artifact (samma url)

shopify.mjs ─ tvistkoll.mjs   (DAGLIGEN, eget spår: bara tvister → Discord, inga filer)
```

**Hemsidan** (Axels beslut 2026-09-12: "en hemsida som lagrar all data";
byggd om 2026-09-13 till ett arbetsverktyg): `rapportsida.mjs` bakar
`korningar/<brand>/<vecka>.json` och `historik/` till
`rapport-publicerad.html` — en självbärande sida (mall: `rapport-sida.html`)
som VA:n jobbar ur uppifrån och ner:

1. **Läget** — risk 0–100, ärenden, obesvarade över gränsen, median svarstid,
   chargebacks + tvistgrad, pengar i öppna tvister. Allt med skillnaden mot
   förra veckan.
2. **Vad som ska göras** — åtgärdsplanen i tre hinkar, varje åtgärd med steg,
   ansvarig och de mätta talen den bygger på.
3. **Arbetskön** — varje obesvarat ärende: kategori, maskerad kund, ordernummer,
   hur länge det väntat, ämne. Filter: alla / obesvarade / chargeback-nära.
4. **Tvisterna** — typ, orsak, belopp och `evidence due`-datum, öppna först.
5. **Kategorierna** — volym, andel, SOP-status ur VA:ns Notion, återkommande.
6. **Kurvan** och **vad som lästes** (mejl in → ärenden, och vad som filtrerades
   bort) — svaret på "har du verkligen läst alla mejl?".

⚠️ **Texten är engelsk — VA:n är den som arbetar i den.** Etiketterna går att
växla till svenska med EN/SV-knappen (Axel). Rutinen publicerar om sidan varje
måndag mot **samma länk** (står i `rapportsida.json`; utan `url` blir det en ny
sida). Sidan räknar aldrig om något och har ingen runtime-capability, så länken
funkar utan Claude-konto. Bygg: `node kundtjanst/rapportsida.mjs`.

**Brands upptäcks, listas inte.** Varje `factory/butiker/<id>.yaml` är ett brand
(namn, supportmail, myshopify-domän kommer därifrån). Butiker som fabriken inte
byggt — Bäverbutiken — får en egen fil i `kundtjanst/brands/`. Samma id i båda
= den egna filen lägger på (Notion-databas, Discord-kanal, trösklar) eller
stänger av (`aktiv: false`). Mall: `brand-mall.yaml`.

**Hemligheterna ligger i Environments på claude.ai, aldrig i repot.** Namnen
härleds ur brand-id:t (`tacklebay` → `TACKLEBAY`, `my-shop` → `MY_SHOP`):

| Variabel | Vad | Krävs? |
|---|---|---|
| `KUNDTJANST_MAIL_PASS_<ID>` | Loopia-lösenordet för supportbrevlådan | ja |
| `KUNDTJANST_MAIL_USER_<ID>` | bara om användarnamnet inte är supportmailen | nej |
| `KUNDTJANST_MAIL_HOST_<ID>` | bara om det inte är Loopia (`mailcluster.loopia.se`) | nej |
| `KUNDTJANST_WEBMAIL_URL_<ID>` | bara om webbmejlen inte är `https://webmail.loopia.se/` (annan Roundcube) | nej |
| `SHOPIFY_SHOP_<ID>` + `SHOPIFY_ADMIN_TOKEN_<ID>` | ordrar + tvister (custom app: `read_orders`, `read_shopify_payments_disputes`). Värdet är **"Admin API access token"** (`shpat_…`, visas en gång efter *Install app*) — inte API key, inte API secret key. Skriptet säger vilket av dem som klistrats in om butiken svarar 401. `SHOPIFY_SHOP_<ID>` behövs bara om brandfilen saknar `shop` | nej — utan dem är tvister "okända" |
| `SHOPIFY_CLIENT_ID_<ID>` + `SHOPIFY_CLIENT_SECRET_<ID>` | **den vanliga vägen** (samma som fabriken): Client ID + Client secret från appen på dev.shopify.com, token mintas per körning (24 h). Appen behöver scopes `read_orders,read_shopify_payments_disputes` **och** "Protected customer data access" begärd under API access — annars svarar Shopify 403 "requires merchant approval for read_orders" (mätt 2026-09-12 med fabrikens app). ⚠️ En `atkn_…`-token (Shopify CLI) fungerar aldrig mot Admin API och ignoreras | nej |
| `NOTION_TOKEN` | SOP-täckning + rapportsida | nej |
| `DISCORD_BOT_TOKEN` (eller `DISCORD_WEBHOOK_URL[_<ID>]`) | posta rapporten | nej |
| `ANTHROPIC_NYCKEL` | modellen för "övrigt" och sammanfattningarna | nej |

`node kundtjanst/setup.mjs` skriver ut exakt vilka som saknas, per brand.

Heter Shopify-nycklarna något annat än `<ID>` — Bäverbutiken har en egen app bara
för kundtjänsten, `SHOPIFY_CLIENT_ID_BAVERBUTIKEN_EMAILSCRAPER` (Axels namn
2026-09-13) — sätt `shopify.env_suffix` i brandfilen. Bara Shopify-namnen byter
svans; mejlens `KUNDTJANST_MAIL_PASS_<ID>` heter alltid som brandet.

## Köra på ett annat Claude-konto (samma repo, andra brands)

Det här är hela poängen med upplägget: koden är densamma, bara nycklarna och
brandfilerna skiljer.

1. Koppla repot `Axel3738/yognftnfgn` (main) till kontot.
2. `node kundtjanst/brands.mjs` — listar brandsen. Saknas ett: kopiera
   `brand-mall.yaml` till `brands/<id>.yaml`. Ska kontot inte köra ett brand:
   `aktiv: false`, eller kör med `--brand a,b`.
3. Lägg in variablerna i kontots Environment (tabellen ovan). Nya variabler
   syns först i en NY container.
4. `node kundtjanst/setup.mjs` → ✅ på varje brand som ska köras.
   `node kundtjanst/run.mjs --brand <id> --torr` → provkörning utan skrivning.
5. `/rutin /kundtjanst --alla --discord 07:00` i chatten (eller stegen setup
   skriver ut). Fast session, `main` som utgren, cron för måndag. Kommandofilen
   är märkt `CONNECTORS: inga` — koppla inga connectors.

`node kundtjanst/setup.mjs --nytt-konto` skriver ut samma recept med kontots
faktiska brands och variabelnamn ifyllda.

## Vad som mäts, exakt

**Kategorier** (`klassificering.mjs`, regler på svenska/norska/danska/engelska/finska):
hot om bank/tvist · okänd/dubbel debitering · aldrig levererad · fel vara/inte som
beskrivet · var är min order (WISMO) · skadad/defekt · återbetalning · avbeställning
· retur/ångerrätt · faktura/Klarna · produktfråga · rabattkod · spam · övrigt.
Vikten 0–3 per kategori följer kortnätverkens fyra stora tvistorsaker (item not
received, not as described, unauthorized/duplicate, credit not processed).
Eskaleringsord ("tredje gången", "ingen svarar", "inom 48 timmar") höjer poängen.

**Ärenden** (`arenden.mjs`): ett ärende = en kund + ett ämne (trådas på
References/In-Reply-To, annars avsändare + normaliserat ämne). Svar = allt från
brandets egen domän eller Skickat-mappen. Obesvarat = sista inkommande utan
senare svar; larm över `obesvarad_timmar` (48). Autosvar, nyhetsbrev och
systemmejl (Shopify, Klarna, PostNord …) räknas aldrig.

⚠️ **Perioden är `arenden_dagar` = 30 dagar, inte 7.** Fram till 2026-09-13 lästes
bara 7 dagar, och då föll varje obesvarat ärende äldre än en vecka ur rapporten —
precis de som hunnit bli farligast. Mätt samma dag på Bäverbutiken: 7 dagar gav
45 ärenden / 37 obesvarade, 120 dagar gav **321 / 205**. 30 dagar matchar
ordrarnas fönster så tvistgraden räknas på samma period. Sänk aldrig tillbaka
fönstret för att rapporten ska se lugnare ut.

**Risk** (`chargeback.mjs`), signaler med tak så ingen ensam färgar brandet:

| Signal | Poäng | Tak |
|---|---|---|
| Chargebacks (Shopify Payments, samma fönster som ordrarna: 30 dagar) | 15/st + 15 vid gul tvistgrad, +30 vid röd | 40 (+30) |
| Bankförfrågningar (inquiries, 30 dagar) — förvarningen, obesvarade blir chargebacks | 5/st | 15 |
| Kunder som hotar med bank/tvist | 12/st | 36 |
| Okänd/dubbel debitering | 10/st | 30 |
| Aldrig levererad | 8/st | 24 |
| Fel vara / inte som beskrivet | 6/st | 18 |
| Obesvarade > gräns | 5/st (8 om chargeback-nära) | 25 |
| Betalda ordrar utan fulfillment > 5 dagar | 4/st | 20 |
| Skickade utan spårning | 2/st | 10 |
| Obesvarade återbetalnings-/avbeställningskrav | 3/st | 12 |
| Median första svarstid | +10 över 24 h, +20 över 48 h | 20 |

Summan kapas vid 100. 🟢 < 25, 🟡 25–50, 🔴 > 50. Tvistgrad = chargebacks / ordrar
över SAMMA 30 dagar — inquiries räknas inte (mätt 2026-09-13: tvister hämtade för
7 dagar delat med 30 dagars ordrar gav falska 0,63 %; rätt räknat är
Bäverbutikens tal 0,11 %). Gult 0,5 %, rött 0,9 % (Visa varnar vid 0,9 %,
Mastercard vid 1 %). Trösklarna ändras per brand i brandfilen.

**Åtgärdsplanen** (`atgardsplan.mjs`): rapporten ska inte bara säga vad som är
fel utan vad man GÖR. Varje regel tittar på ett mätt tal och skriver, när talet
passerar sin gräns, en åtgärd med konkreta steg — i tre hinkar: `nu` (deadline,
hot, dubbeldrag), `veckan` (backloggen och vanorna) och `process` (det som
minskar ANTALET ärenden). Texten är engelsk, VA:n läser den. Varje åtgärd bär
`matt` — talen den grundas på — så den går att ifrågasätta.

**Återkommande** = topp 3 i minst 3 av de senaste 4 veckorna. Kräver tre veckors
historik — innan dess säger rapporten det i stället för att gissa.

## Regler som inte får brytas

- **Läs-bara.** EXAMINE + BODY.PEEK mot IMAP, bara GET mot Shopify. Inget
  markeras som läst, inget svaras, ingen order rörs.
- **Aldrig noll för det som inte lästes.** Saknas Shopify står tvisterna som
  "okända". Hoppar ett brand står variabelnamnet som saknas.
- **Kundadresser maskeras** (`ka***@gmail.com`) i allt som skrivs eller postas.
  Rapporterna committas till repot — de ska inte bära personuppgifter i klartext.
- **Reglerna dömer, modellen hjälper.** Samma mejl ska ge samma kategori nästa
  vecka; annars går trenden inte att läsa. Modellen får bara "övrigt".
- **Ingen handskriven brandlista.** Nya fabriksbutiker dyker upp av sig själva.
- **Allt i Discord är på engelska.** Den engelska rapporten genereras direkt;
  `tools/lib/engelska.mjs` stoppar ändå svensk text.

## Nätet: var rutinen kan läsa mejlen

⚠️ **Mätt 2026-09-12 i en claude.ai-container:** direkt TCP mot port 993 får
inget svar; `CONNECT` genom sessionens proxy svarar 200 men tunneln bryts under
TLS-handskakningen — mot `mailcluster.loopia.se`, `imap.gmail.com` **och**
`outlook.office365.com`, medan 443 går fint (riktigt DigiCert-cert, ingen
MITM). Docs bekräftar: "Cloud sessions in Anthropic-hosted environments run
behind an HTTP/HTTPS network proxy … All outbound internet traffic … passes
through this proxy" — även nivån **Full** ("Any domain") är HTTP/HTTPS. IMAP
går alltså inte från claude.ai-rutiner, oavsett nätverksnivå. Klienten upptäcker
det (kod `PROXY_SPARRAR_PORTEN`) och hoppar brandet med en tydlig text i
stället för att hänga.

| Väg | Var | Mejlen kommer från | Krav |
|---|---|---|---|
| **A. Webbmejlen (HTTPS)** — `mail.via: auto` väljer den när IMAP spärras | rutinen på claude.ai | Loopias webbmejl `https://webmail.loopia.se/` (Roundcube 1.7, avläst 2026-09-12), samma inloggning som brevlådan | bara `KUNDTJANST_MAIL_PASS_<ID>`. Ingen vidarebefordran, ingen Gmail |
| **B. IMAP direkt** | Claude Code lokalt, en cron på en dator, Railway, self-hosted environment | Loopia | `KUNDTJANST_MAIL_PASS_<ID>` och öppen port 993 |
| **C. `--jobb <fil.json>`** | valfritt konto med en mejl-connector (Gmail) | JSON som sessionen skriver ur connectorn | bara om brevlådan inte är på Loopia/Roundcube |
| **D. `--fixtur <mapp>`** | var som helst | `.eml`-filer | bara tester och demo |

Shopify, Notion, Discord och modellen går över HTTPS och fungerar överallt.
Väg A är standard på claude.ai: `kundtjanst/webmail.mjs` loggar in i webbmejlen
precis som VA:n gör i webbläsaren, listar mejlen nyast först, hämtar råkällan
(`viewsource`) och loggar ut. Läs-bara. ⚠️ Webbmejlen är ett gränssnitt för
människor, inte ett API: byter Loopia Roundcube-version kan ett steg sluta
stämma. Varje steg kastar då ett fel som säger vilket steg (1–6) som inte
kände igen svaret, så det går att rätta utan att gissa. Testerna i
`test/webmail.test.mjs` spelar upp de svar som avlästes 2026-09-12.

## Loopia

IMAP `mailcluster.loopia.se`, port 993 (SSL), användarnamn = hela mejladressen,
lösenord = brevlådans lösenord (Loopia Kundzon → E-post → brevlådan → Ändra
lösenord). Skickat-mappen heter normalt `Sent`; rutinen provar `Sent`,
`INBOX.Sent`, `Skickat` och `Sent Items`. Hittar den ingen står det i rapporten
och svarstiderna mäts då bara på svar som råkar ligga i inkorgen —
`node kundtjanst/setup.mjs --mappar <id>` visar det riktiga namnet, som sätts som
`mail.skickat` i brandfilen.

## Tester

```bash
node --test kundtjanst/test/*.test.mjs     # 111 tester, inget nät
npm test                                   # hela repot
```

Fixturen `test/fixturer/demo/demobutiken/` är ett komplett brand: 13 mejl i
inkorgen (8bit, quoted-printable, base64-HTML, multipart, norska, engelska,
autosvar, nyhetsbrev, Shopify-avisering, en tråd med kundens andra mejl), 4
svar i Skickat, `ordrar.json`, `tvister.json` och `sop.json`. Hela flödet körs
mot den i `test/brands-run.test.mjs` och med `--fixtur` från terminalen.

---

## For the customer-service VA (English)

Every Monday a report lands in your brand's Discord channel `#customer-service`
(and the full one in Notion if that is set up). Read it top to bottom:

- **Numbers** — how many tickets, how many still unanswered, your median first
  reply time. Under 24h is the goal.
- **Top tickets** — what customers wrote about most. 🔁 means it has been in the
  top 3 for weeks: tell Axel, it is a product or shipping problem, not a support one.
- **Chargeback warning signs** — each line names a customer (masked) and the
  order number. These are the tickets that turn into disputes if they wait.
- **SOP missing in Notion** — categories we get every week without a written
  SOP. Write one (title must name the problem, e.g. "SOP – Never delivered").
- **🔴 ACTION NEEDED** — your list for the week, in order. Do 1 first.

Nothing in the report changes the inbox: it only reads. Reply to customers the
way you always do.
