# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Det här är Axels arbetsrepo. Du läser den här filen först, varje session.
`main` är default-branch och den enda som gäller — den här filen bor där.

Den som kör sessionen är oftast **Axel själv, och han är inte utvecklare.**
Förklara enkelt, kör klart uppgiften, och lämna aldrig över halvfärdigt arbete
med en instruktion om vad han "bara behöver göra själv". Svara på svenska.

Vidare läsning i ordning: `HANDOFF.md` (vad som är byggt, vad som återstår,
vilka connectors som måste kopplas) → `docs/os/ACTIONPLAN.md`.

---

## Så här ska du svara Axel

Axel har grov dyslexi. Skriv kort och konkret — inga bibelsvar.

**Det enda formatkravet: gör HANS uppgifter omöjliga att missa.**
Ska han göra något, sätt det sist under en egen rubrik, numrerat, en mening
per rad, med exakt var han ska klicka och vad knappen heter. Ska han inte
göra något, skriv det rakt ut.

I övrigt: skriv som situationen kräver. Fattar du ett beslut åt honom, säg
vilket. Är något osäkert, säg det i stället för att gissa. En fråga i taget,
med svarsalternativ.

⚠️ **Språket följer läsaren, inte den här filen** (Axels beslut 2026-09-09):
Axel svaras på svenska, **VA:n och redigerarna på engelska**. Ett kommando
som säger "svara henne på engelska" gäller — den här filen ska aldrig
överskugga det. Filer, briefer och Notion-innehåll behåller sitt eget format.

---

## Två verksamheter. Blanda dem aldrig.

Det här är det farligaste misstaget i repot — fel annonskonto kostar riktiga pengar.

| | **Bäverbutiken** | **Grillkliniken** |
|---|---|---|
| Sajt | bäverbutiken.se (Shopify general store) | grillkliniken.se |
| Ad account | MagiBorsten `1867947880635861` (SEK) | SnarkLös `1346450049878358` (SEK) |
| Produkter | 6 st, se `products/products.json` | Mastern (elgrillborste, 999 kr) |
| Styrs av | slash-kommandona nedan | `pipeline/waves/` + `docs/` (legacy) |
| Sida / pixel | `678639638662543` / `1554276343018184` | står inte i `main` — läs den ur en SnarkLös-vågkonfig |

Kontonamnet är aldrig samma som brandnamnet. Kolla `ad_account_id` innan du rör
något i Meta.

**Matstrumpor är en tredje verksamhet i drift** (rättat 2026-09-21 — stod
tidigare här som "finns men används inte"). Kontot `730973156224390` HETER
**"nya kungen"**, ligger i portföljen Matstrumpor.se och körde 17 031 kr på
14 dagar vid mätningen. Egen butik (matstrumpor.se), egen hub, egna kommandon:
**`/matstrumpor`** (uppladdaren) och **`/matstrumporkungen`** (ronden), facit i
`matstrumpor/konfig.json`. ✅ **`META_ACCESS_TOKEN` har åtkomst till kontot
sedan 2026-09-22** (Axel gav Meta-användaren "API LONG TERM" rättigheten;
mätt: `GET act_730973156224390?fields=name` → `nya kungen`. Till och med
2026-09-21 svarade kontot `(#200) Ad account owner has NOT granted
ads_management`). Ronden `/matstrumporkungen` **läser** därför Meta via token
(`matstrumpor/meta.mjs`) och går som rutin 07:00 (rutintabellen). Uppladdningen
`/matstrumpor` är inte ombyggd — den skriver fortfarande via Adsmanager-MCP:n i
en session Axel startar. Portföljen bär också `Norge` `1418612340124566` och
`Finland DK` `1356652809967926`, båda utan betalmetod.

**Kopiera aldrig `page`/`pixel` mellan verksamheterna.** Fel pixel betyder att köpen
bokförs på fel verksamhet och att all analys blir fel — och det syns inte som ett
felmeddelande, bara som konstig data.

**Creative Strategy OS:et är bara Bäverbutiken.** Grillkliniken/Mastern-materialet
i `docs/` och `pipeline/` (utom `pipeline/quota.mjs`) är legacy referens och ska
inte röras utan att Axel ber om det.

---

## Regler för varje session

1. **Följ kommandot bokstavligt.** Kommandona i `.claude/commands/` är versionerade
   och testade. Hoppa aldrig över steg, korta aldrig ner leveransformatet, och
   invänta inte godkännande mellan faser om kommandot säger åt dig att köra klart.
2. **Avsluta alltid med kommandots "Definition of done"-checklista** — punkt för
   punkt, ✅/❌. Är något ❌: fixa det, eller skriv exakt varför det inte gick.
3. **Hitta aldrig på data.** Ingen dom över en annons under 300 kr spend eller
   3 köp. Saknas data: säg det rakt ut och leverera resten. Alla siffror kommer ur
   Notion, Meta, Shopify eller `products/products.json` — aldrig ur huvudet.
4. **Analysmetoden är obligatorisk.** Ska annonser bedömas: följ
   `docs/os/ANALYSMETOD.md` till punkt och pricka och bocka av dess checklista i
   svaret. **Enmetriks-domar är förbjudna** — rangordna alltid på vinstbidrag
   `(break-even-CPA − CPA) × köp`, aldrig på ROAS eller CPA ensamt. Top spendern är
   benchmark, inte en kandidat att döma mot småannonser. Kill-beslut mäts mot
   `break_even_roas` (eller `break_even_cpa_sek`), aldrig mot target-nivån.
   *(Regeln finns för att en tidigare chatt dömde ut top spendern för låg ROAS —
   den stod för ~50 % av all vinst.)*
5. **Brief-kvoten är mål nr 1.** Varje session som launchar/loggar creatives kör
   `node pipeline/quota.mjs` och visar plus/minus-läget. Loggning:
   `node pipeline/quota.mjs log <produkt-id> <antal> [YYYY-MM-DD]`.
6. **Modellpolicy:** all slutgiltig ad copy, svenska manusrader och voiceovers
   skrivs av en subagent via Agent-verktyget med `model: "sonnet"` (eller `"haiku"`
   för bulkvarianter) — subagenten får DNA + hypotes + hook + formatkrav **+
   `docs/copy-regler.md`** och skriver bara text. Varje levererad rad ska klara
   tre-frågorstestet i copy-reglerna (visualisera / falsifiera / ingen annan kan
   säga det) och testet redovisas i leveransen. Strategi, analys, klassificering
   och briefstruktur görs alltid av huvudsessionen. Aldrig tvärtom.
   ⚠️ **Undantag, Axels beslut 2026-09-16: landningssidornas copy
   (`/lagerrensning`, `/vi-testade`, `/anledningar`, `/listiclar`) skrivs av
   huvudsessionen själv** ("jag tror vi ska använda oss av dig eller Fable
   att skriva copyn"), med läsbarhetstestet i kommandot utöver
   tre-frågorstestet — Axels återkommande klagomål är att texten inte låter
   naturlig och att övergångarna mellan meningarna hackar.
7. **Produktminnet ligger i repot, inte i chatten:** `products/<id>/dna.md`
   (Creative DNA), `products/<id>/batch-log.md` (batcher + hypoteser + utfall),
   `products/<id>/backlog.md` (koncept som väntar). Läs dem innan du agerar,
   uppdatera dem efter, committa och pusha.
8. **Namngivning:** `docs/naming-convention.md` är normativ. Annonsnamnen kodar
   angle/format/hook så datan går att skära per variabel — bryter du mot den går
   analysen inte att göra. Läs av upptagna AD-ID:n i kontot innan du numrerar.
9. **Briefer på engelska** (redigerarna är engelsktalande), svenska manusrader i
   tabell `Swedish (use this) | English meaning`. SOP:er och svar till Axel på
   svenska.
10. **En task är aldrig klar för att någon säger det.** Levererat och godkänt är
    två olika saker. Godkännande kräver grön checklista (eller override med
    skriven motivering), och bara godkända creatives räknas mot kvoten.
11. **Alla nya annonser går i produktens CBO, i adsetet som bär konceptets
    vinkel. En annons som inte fått spend på sju dygn är en förlorare:
    etikettera (`INGEN_LEVERANS`) och släpp — aldrig ett test-ABO.** *(Axels
    beslut 2026-09-20, ur Evolve-materialet. Regeln hette till dess "nya tester
    i ett separat test-ABO med lika budget per annons" — Axels beslut
    2026-08-12 — och lärdomen bakom den är sann: batch #2 fick 16 av 17
    annonser under 30 kr bredvid `PD_1_H3` som tog 42 % av spenden, och batch
    #5:s trevägstest gav 5,70 / 5,52 / 159,76 kr
    (`products/motorholjet/batch-log.md:64–66`; CLAUDE.md:s gamla hänvisning
    till "mönster 5 i motorhöljets DNA" var fel — mönster 5 är Karusell). Men
    Evolves data på 42 CBO-svultna annonser säger att svält är Metas dom: 36
    dog i ABO inom sju dygn, en skalade, och tvingad spend ger köp som inte är
    inkrementella. I drift följdes ABO-regeln aldrig — allt låg redan i CBO
    (mätt 2026-09-19). Att en ny annons svälter är ett utfall att logga, inte
    ett processfel att bygga runt.)*
    Nattrutinen `/notionkorning` laddar upp redigerarnas färdiga creatives i den
    kampanj som redan bär produktens annonser (Axels beslut 2026-08-30, tidigare
    ett undantag — nu huvudregeln).

    Kampanjen slås upp ur **kontot** (annonsprefixet i namnet), inte ur
    `campaign_ids[0]`. Mätt 2026-08-31: alla fyra skalningsprodukters
    `campaign_ids[0]` är PAUSED med spend (72 234 / 47 090 / 60 205 / 38 785 kr),
    alltså avvecklade — dit vägrar rutinen ladda upp. Skriv aldrig "produktens
    aktiva CBO" som om det vore en garanti; kontrollera statusen först.
12. **Fråga bara när ett beslut kräver ägaren** (prisändring, rabatt i Shopify, ny
    target-CPA). Allt annat: kör.
13. **Om Axel skriver ett `/kommando` som klienten inte känner igen** (eller skriver
    "kör /cs motorholjet" som vanlig text): läs motsvarande fil i
    `.claude/commands/` och följ den exakt, med texten efter kommandonamnet som
    argument. Kommandona är filer — de fungerar även när klienten inte
    registrerat dem.
14. **Korta svar.** Inga bibelsvar. Axel har sagt det två gånger.
    Ett kommando som ber om ett längre leveransformat i chatten gäller — men
    Axels egna uppgifter står alltid sist, numrerade och omöjliga att missa.

---

## OPS Factory: en-produktsbutiker på löpande band (AKTIV, under uppbyggnad)

Axels tredje verksamhet: `factory/` bygger kompletta one-product-stores
(OPS) från Bäverbutikens vinnarprodukter, med eget brand per butik. Första
riktiga bygget är **HeimGuard** (övervakningskamera, hemvakten.se →
heimguard.se, Shopify pzjagy-mz). Detta ska bli en rutin — den byggs
brick by brick och **varje lyckat steg dokumenteras direkt**:

- **Rutinen startas med `/ny-ops <källänk>`** (`.claude/commands/ny-ops.md`).
  Den som kör är oftast VA:n (engelsktalande) — hennes egna klick står i
  `factory/VA-CHECKLIST.md` (Axels mall), ifylld per butik i
  `output/<id>/CHECKLISTA.md`. Frasen **"Store ready: \<namn\>"** från
  VA:n utlöser slutsteget (recensioner, pixel, Discord-kanaler).
- **`factory/SA-FUNKAR-DET.md`** är kartan: hela flödet på en sida, enkelt,
  vem som gör vad. Läs den innan `PROCESS.md`.
- **`factory/PROCESS.md`** är rutinen: hela steg-för-steg-flödet, med ⚙️
  (fabriken gör) och 🖐 (Axels klick). Lyckas ett nytt steg: uppdatera den
  filen i samma session. Det är inte valfritt — det är hela poängen.
- **`factory/TRAPPAN.md`** är arbetsdelningen (Axels modell 2026-09-09):
  Bäverbutiken är ren TESTBÄDD, all creative strategy sker på OPS-butiken.
  Trappan: test → egen butik → all-around-redigerare → egen redigerare vid
  5000 kr/dag. Läs den innan du planerar creative-arbete på någon produkt.
- **`factory/FAS2.md`** är annonsfasen (uppdrag A–F) och `/ny-annonser`.
- **`factory/PLAN.md`** är planen framåt (namnregeln, annonsöversättaren,
  rekryteringsmotorn, Discord per butik, **Q4-ramverket punkt 6**).
- Konfig: `factory/butiker/<id>.yaml` + `factory/produkter/<id>.yaml`,
  mallar i `butik-mall.yaml`/`produkt-mall.yaml`. Motor: `factory/ops.mjs`.
- **Q4-ramverket är standard för varje ny OPS:** gratis bonusprodukt i
  paketnivåerna + betald upsell i varukorgen (`offer.bonus_produkt` i
  produktfilen, `byggKorgUpsell` i `factory/tema.mjs`).
- **Annonskontot för ALLA OPS-butiker (SE och NO) är "MagiBorsten DK"
  `915422744950975`** (Axels beslut 2026-09-07). Ett gemensamt konto —
  kampanjnamn prefixas alltid med brandet så datan går att skära per
  butik. ⚠️ Förväxla ALDRIG med MagiBorsten `1867947880635861`
  (Bäverbutiken) — namnen är nästan identiska, kontona är olika
  verksamheter.
- Två järnregler härifrån: namnregeln (funkar på svenska OCH engelska,
  aldrig å/ä/ö) och trippelkollen (säg aldrig "klart" utan tre kontroller
  mot kundens riktiga vy — regeln föddes här 2026-09-07).
- Efter varje bygge skrivs `output/<id>/CHECKLISTA.md` — Axels enda
  manuella klick, i ordning. Allt annat gör fabriken via API.
- **Creatives granskas av sessionen, aldrig av Axel** (Axels beslut
  2026-09-13: "jag ska aldrig behöva gå in och verifiera bilderna — AI:n
  granskar och laddar upp, det behöver inte vara så noggrant"). `/ops-bild`
  tittar lätt (produkt, inga människor/text/pris) och `--godkann`:ar själv;
  en bild blir aldrig ACTION NEEDED. Redigerarens rader i `Creative strat
  review` med butikens eget prefix och fil tas av `/ops-leverans` direkt
  (`tools/ops-leveranskon.mjs` → `CS_STATUS_SE`); Bäverbutikens parkerade
  källrader i samma status (`Rodholder_*`, TackleBay 2026-09-12) rörs aldrig.

## Videolokalisering: `/translate` (AKTIV — inte legacy)

Undantag från legacy-regeln ovan: **videolokaliserings-pipelinen är i aktiv drift.**
Axel översätter/dubbar mp4-annonser till nya marknader via HeyGen (röstklon + lip-sync).

När Axel skriver `/translate`, klistrar in en Drive-länk med annonser, eller ber om
översättning/dubbning till ett land: kör skillen **translate**
(`.claude/skills/translate/SKILL.md`). Den innehåller hela flödet och alla kända
HeyGen-fallgropar. Processdokumentation + körlogg: `docs/video-localization.md`.

Järnreglerna (kostar pengar eller förtroende att bryta):
1. **Rendera ALDRIG före proofread** — rendering drar HeyGen-credits, proofread är gratis.
2. **Skanna ALLTID källvideon efter inbränd svensk text före leverans** — HeyGen
   översätter bara ljudet.
3. **Kör ALLTID `python3 pipeline/rostkoll.py` på varje renderad video före leverans**
   (Axels beslut 2026-09-08: ingen video går ut med keff röst). Gratis, bara ffmpeg.
   Fångar tyst spår, längddrift, avhugget slut och tappat tal. En video med ❌
   levereras inte — rendera om den eller stryk den. Grönt betyder "inga mätbara fel",
   inte "godkänd": lyssna själv på den video som ska bära mest spend.
   Är källan nästan bara musik ska den inte översättas alls — HeyGen har ingen röst
   att klona och hittar på en.
4. Captions är opt-in; max 2 rader. Komprimera aldrig hårdare än 30 MiB-gränsen kräver.

Kräver env-variabeln `HEYGEN_API_KEY` i environmentet.

---

## `stonebite/` — bolagets egen sajt med inloggning (NY 2026-09-21)

Stonebite Ecom AB:s webbplats: en **publik sida** (vad bolaget gör, vilka
butiker vi driver) och ett **inloggat läge** med dashboards för butiker,
annonser, redigerare, kundtjänst och leverans. Noll npm-beroenden, ingen
databas, inga externa anrop från sidan. Full dokumentation: `stonebite/README.md`.

```bash
node stonebite/hamta.mjs     # hämtar data (Shopify + Meta + repot) → data/snapshot.json
npm run sida                 # startar sajten på http://localhost:4000
```

**Sex roller, och rollen avgör vad servern ens svarar på** (`stonebite/roller.mjs`,
kontrolleras vid varje sidvisning — menyn är bara en spegling). Axels fem
inloggningar 2026-09-21 plus chefsrollen som redan fanns:

| Roll | Ser | Ser inte |
|---|---|---|
| `agare` | allt + konton | — |
| `chef` | allt utom konton | vem som får logga in |
| `produkttest` | produkttest-trappan + sin egen sida | spend, omsättning, andras pengar |
| `redigerare` | topplistan + sin egen sida | **spend, ROAS, omsättning, break-even, satsen** |
| `support_chef` | kundtjänst, recensioner, leverans, **hela teamets bonus**, godkänner insatser | all ekonomi |
| `va` | kundtjänst, recensioner, leverans + sina egna uppdrag och pengar | all ekonomi, andras bonus |

**Tolv sidor:** Översikt, Butiker, Annonser, Produkttest, Redigerare,
Kundtjänst, Recensioner, Leverans, Bonus, System, Min sida, Konton.
`/app/system` är kartan över allt du byggt (`stonebite/system.json`, i
kategorier + dygnets rutiner).

⚠️ **Sajten är tvåspråkig** (`stonebite/sprak.mjs`). Ägare och chef får
svenska, alla andra engelska — samma regel som i chatten. Var och en byter
själv på Min sida. Ordboken är hela meningar svenska → engelska; saknas en
rad visas svenskan, sidan går aldrig sönder. Komponenterna översätter sina
egna etiketter men **aldrig datan** (butiksnamn, kampanjnamn, kundtext).

Att redigerare aldrig ser spend är samma järnregel som topplistan (Axels beslut
2026-09-02). Satsen räknas som spend — med belopp OCH sats går spenden att
räkna ut baklänges. Ett test i `stonebite/test/server.test.mjs` bevisar spärren
genom att logga in som redigerare och gissa adresserna.

⚠️ **Spärren håller — men fel roll på kontot läcker allt (2026-09-23).**
Mechiles konto stod som **`chef`** och hon såg Översikt: 176 936 kr i går,
977 830 kr på 7 dagar, 86 945 kr spend, ROAS 2,31. Rollen "Chef" låg direkt
under "Ägare" i rullistan och heter nästan som hennes titel (Head of customer
support). Rättat samma dag: rollnamnen säger själva om de ser ekonomi
("Chef — ser ALL ekonomi" / "Head of customer support — ingen ekonomi"),
konton med ekonomiroll märks rött på Konton, och **Ägare/Chef kan bara sättas
med kryssrutan "ge all ekonomi" ibockad** — annars felruta och ingen ändring
(`serEkonomi`, `ekonomiVarning` i `roller.mjs`; testat). Rollen läses ur
kontofilen vid varje sidvisning, så Axels byte på Konton slår igenom på
hennes nästa sidladdning. Det hon redan sett går inte att ta tillbaka.

⚠️ **Hämtning och visning är två olika saker med flit.** `hamta.mjs` skriver
`stonebite/data/snapshot.json`; servern läser bara filen. En sida som hämtade
vid varje besök hade tagit minuter och slagit i Metas kod 17. Sidan visar alltid
när datan hämtades, och varje källa rapporterar sitt eget läge på sidan Drift.

Regler som sitter i koden (och som INTE ska "förenklas" bort):
- **Valutor summeras aldrig ihop.** SEK, NOK, DKK, EUR står var för sig.
- **Ingen procent på ett halvt dygn** — dagens tal jämförs aldrig i procent mot
  gårdagens hela dygn, bara hela veckor mot hela veckor.
- **"Kvar efter reklam" räknas bara när ALLA butiker gick att läsa.** Reklamen
  syns alltid (Meta), försäljningen per butik. Saknas en butik blir siffran fel
  åt minus-hållet — då står det varför i stället.
- **ROAS kommer ur Meta**, aldrig ur vår egen division omsättning ÷ spend.
- **Rangordning på vinstbidrag** (`spend × (ROAS ÷ break-even − 1)`, samma formel
  som ANALYSMETOD omskriven). Break-even läses ur kampanjnamnet — kontot skriver
  både `BE ROAS 1.63` och `BE-ROAS 1,51`, båda formerna hanteras.
- **Saknad data skrivs ut med orsak**, aldrig som en nolla.

Butikerna **upptäcks** (sparning/butiker.json + factory/butiker/*.yaml + varje
`SHOPIFY_SHOP_*` i miljön som har nycklar bredvid sig) — ingen handskriven lista.
⚠️ Mätt 2026-09-21: 7 av 13 butiker gick att läsa. **Bäverbutiken och UK svarar
403 "requires merchant approval for read_orders"** — fabrikens app saknar
godkännande för kunddata, precis som kundtjänsten en gång behövde en egen app.
Sidan säger det rakt ut i stället för att visa noll.

Säkerhet: scrypt-hashade lösenord, HMAC-signerad kaka (HttpOnly/SameSite/Secure),
CSRF-nyckel i varje formulär, fem inloggningsförsök per adress och IP, CSP med
nonce. `STONEBITE_HEMLIGHET` signerar kakorna; `data/anvandare.json` och
`data/hemlighet.txt` är gitignorerade. **Vid drift måste kontofilen ligga på en
volym som överlever en deploy** (`STONEBITE_ANVANDARE`) — annars är alla konton
borta vid nästa version.

Första gången: öppna `/kom-igang` och skapa ägarkontot. Sidan stänger sig själv
när kontot finns; alla andra konton läggs till inne på sidan Konton — och då
skapas personen i bonusregistret samtidigt, annars finns ingen att betala till.

**Lägg upp sajten:** `stonebite/COWORK-PROMPT.md` är kartan; själva prompterna
är två, en per flik och i ordning — `stonebite/cowork/1-railway.txt` (tjänst,
miljövariabler, volym, lämnar tillbaka DNS-värdena) och
`stonebite/cowork/2-dns.txt` (letar upp DNS-leverantören via Google Workspace
admin, lägger in posterna). Mejlen på stonebite.org ligger i Google Workspace,
så DNS-prompten förbjuder uttryckligen ändringar av MX, SPF, DKIM och
verifieringsposter. Samma fil bär listan på det jag behöver veta om
verksamheten.

### Den publika sidan: tre grenar, rörelse och bilder (2026-09-21 kväll)

Axels beställning samma kväll, i ordning: roten utan `www`, inte ett ord om
butikerna, **YouTube som egen verksamhet**, **en konsultsida**, "assnygga
animationer på hela hemsidan" och "goa, coola, futuristiska bilder … så det
märks som att vi är seriösa". Motivet är uttalat: sidan ska kunna visa
Skatteverket att YouTube-kanalen är en gren bolaget satsar på (utrustning,
resor för att filma), inte en hobby. Därför står kanalen som en egen sektion
med egen text om att bolaget lägger tid, utrustning och resor på den.

- **YouTube:** `profil.youtube` → sektion `#youtube` på startsidan, kanalen
  **https://www.youtube.com/@Stonebite.channel** (Axels länk 2026-09-21),
  tre format (Vloggar, Tutorials, Lifestyle). Tom `url` ⇒ texten står kvar,
  ingen knapp, ingen youtube.com-länk — testet "YouTube-sektionen länkar bara
  när adressen är ifylld" bevisar det. Inga påhittade tittarsiffror.
- ⛔ **Konsultsidan är BORTTAGEN 2026-09-22.** Axel: "jag vill inte sälja
  några jävla tjänster eller mentorskap eller någonting. Jag vill bara ha
  information om mitt företag." Den tolv områden långa `/tjanster` (byggd
  2026-09-21/22 på hans dåvarande order "konsulttjänsterna kan vara för AI och
  liksom allt möjligt") är borta; adressen svarar **301 till `/influencers`**,
  och testet "publika sidan säljer inga tjänster" stoppar orden konsult,
  mentorskap, rådgivning och tjänster på varje publik sida. **Bygg aldrig
  tillbaka den.** Den publika sidan är information om bolaget: e-handeln,
  YouTube, bolagsfakta — plus det enda erbjudandet nedan.
- **Mikroinfluencers — det enda bolaget erbjuder andra:** `/influencers`
  (`stonebite/vy/influencers.mjs`, `profil.influencers`). Med Axels ord
  (2026-09-22): butiker som redan kör e-handel och vill ha influencers mejlar
  vilken butik de har och vilken produkt de säljer, och får **samma dag**
  kontaktuppgifter till mikroinfluencers (5 000–20 000 kr per samarbete,
  "jävligt high performing"). Betalning: **fast pris i förskott ELLER 10 % av
  det de totalt lägger på influencers** — kunden väljer; köp = mejla
  `contact@stonebite.org`. ⚠️ Axel sa "20 tusen eller 30 tusen" om det fasta
  priset — **20 000 kr står i `profil.influencers.pris.fast` tills han
  bestämt**; ett tomt belopp ⇒ alternativet ritas inte (testat). Beloppen
  står BARA i profilen: startsidans mörka teaser (`influencerTeaser`) och
  sidans tredje ruta byggs ur samma fält (`prisPunkt`), så priset kan inte
  säga två saker. Menyn och sidfoten säger "Influencers". Inga påhittade
  resultat, inga kundnamn, inga butiker. Servern läser `profil.json` från
  disk vid varje visning (snapshotens kopia är bara reserv — förut vann den,
  så en textändring syntes först när timrutinen skrivit om snapshoten).
- **Bilder:** `node stonebite/bilder.mjs` genererar `stonebite/webb/bilder/*.jpg`
  ur `stonebite/bilder.json` via kie.ai (`google/nano-banana`, JPEG, 50–190 kB;
  ingen bildbehandling finns i containern så filen används som den kommer).
  Abstrakta, futuristiska, cyan/violett — **ingen text, inga människor, inga
  logotyper, inga produkter som går att känna igen, inga butiker.** Sessionen
  tittade på alla fem innan de committades. Sajten har inga externa anrop, så
  bilderna ligger i repot; servern cachar `image/*` ett dygn, css/js fem minuter.
- **Rörelse:** `stil.css` → "publik sida: rörelse" + `app.js`. Heron stiger
  upp vid laddning, block scrollas fram (`.avslojas`, gömda bara när
  `html.js` finns — utan skript syns allt), orber driver bakom heron, band
  med orden rullar, bilder lutar sig mot pekaren (bara mus). **Allt stängs av
  med `prefers-reduced-motion`; rörelse bär aldrig information.**
- **Roten:** `stonebite/cowork/3-rot.txt` — Squarespace **ALIAS** på `@` mot
  Railways rotvärde (läses i Railway → Settings → Domains), vidarebefordran
  och Squarespaces fyra A-poster bort, TXT `_railway-verify` kvar, MX/SPF/DKIM
  orörda. Tills den körts är `www` adressen och roten en 302.

⚠️ **BUTIKERNA NÄMNS ALDRIG PÅ DEN PUBLIKA SIDAN** (Axels order 2026-09-21:
"du leakar ju fan alla mina butiker det får du inte göra"). Sidan gick live med
en sektion "Butikerna vi driver" som listade **alla elva** med namn, land och
domän, plus siffrorna "Varumärken 11" och "Länder vi säljer i 6" — alltså en
färdig kopieringslista åt vem som helst som öppnar stonebite.org. Listan,
siffrorna, hero-knappen "Se våra butiker" och menylänken "Varumärken" är
borttagna; `profil.varumarken` ligger kvar i filen och visas **bara inloggad**,
på sidan Butiker. Ett test hämtar `/` **och `/influencers`** och letar efter varje
butiksnamn och varje domän ur `profil.json` (`stonebite/test/server.test.mjs` →
"publika sidan nämner inte en enda butik"). **Bygg aldrig tillbaka det** — inte
som lista, inte som antal, inte som logotyper. Den publika sidan säger vad
bolaget gör, aldrig vilka butiker det är. Axel sa det en gång till samma kväll
("jag vill verkligen inte att det ska stå någonting om någon av våra … eller
vad några av våra butiker heter") — varje ny publik sida ska in i det testet.

### Baksidan: varumärken, rutinvakt, eskalering, kalender, kontakter (2026-09-22)

Axels beställning på morgonen: "koppla eskaleringskanalen, vanliga CS-tickets,
alla rutiner riktigt bra strukturerat som uppdaterar varje dag och visar så att
inget är CP … en MAIN flik för varje varumärke (Matstrumpor, Grillkliniken,
Bäverbutiken, Carashell) … en flik i varje brand med influencers och
UGC-kreatörer … en liten kalender i varje brand som säger vad som kommer hända
och visar allt åstadkommet … och en personlig kalender, som Google Calendar
fast bättre, simpel — annars använder jag den inte". Målet är uttalat: "att jag
slipper fixa alla småpill … så att jag bara kan sitta och ha high leverage
tasks". Full beskrivning: `stonebite/README.md` → "Baksidan".

- **`stonebite/varumarken.json`** är registret: fem poster (de fyra + "Övriga
  OPS-butiker" så inget försvinner). Butiks-id:n är snapshotens
  (`sparning/butiker.json`, `factory/butiker`, `SHOPIFY_SHOP_*`). Delade
  annonskonton delas på **kampanjprefix** (`prefix: ["CARASHELL_"]` resp.
  `utom`) — OPS-kontot `915422744950975` och Magiborsten UK `1107817401910319`
  bär flera varumärken. **Det som inte går att läsa står som `*_saknas` med
  orsak**, och sidan visar orsaken — inte noll. Mätt 2026-09-22: Grillklinikens
  Shopify har inga nycklar, SnarkLös och "nya kungen" nås inte av
  `META_ACCESS_TOKEN`, bara Bäverbutiken har kundtjänst-brandfil.
- **Rutinvakten** (`stonebite/rutiner.json` + `kallor/rutiner.mjs`): 38
  rutiner med schema i **svensk tid** och spår (commit-rubrik på main via
  `git log`, sökväg, eller `ingen` — tvistkollen, `/notionkorning` och
  `/bildannonser` pushar inget och står som "går inte att mäta" i stället för
  att gissas gröna). Dom: ok ≤ 1,5 intervall, sen ≤ 3, annars saknas.
  ⚠️ **Mönstret måste läsas ur RIKTIGA commit-rubriker, aldrig gissas ur
  kommandonamnet.** Första mätningen 2026-09-22 gav två falska larm:
  "Speglingen Taköverdraget saknas 14 dagar" och "Leveransrundan CaraShell
  sen 3 dygn" — båda hade kört (rubrikerna var `Spegling carashell/takskyddet
  2026-09-21: 5 av 5 live` och `leverans carashell/takskyddet 2026-09-22: …`,
  medan mönstren sökte `ops-spegla` och `CaraShell leveransrunda`). Rättat
  samma dag; Axel fick larmet innan det var kontrollerat. **Innan ett "saknas"
  rapporteras till Axel: `git log --since=14.days origin/main | grep -i
  <rutinens ord>` — säg aldrig att en rutin står still utan att ha läst
  loggen.** Ny rutin i registret ⇒ vänta in första riktiga commiten och
  skriv mönstret ur den.
  ⚠️ **Rutinernas fasta sessioner är GRUNDA kloner (`--depth 50`) — och sex
  spårningsrutiner committar varje timme, så 50 commits är ~7 timmar
  historik.** Mätt 2026-09-22 16:07 i `/stonebite`-rutinens egen snapshot:
  13 rutiner "saknas" (alla CaraShell-rutinerna, DryTreks nattvakt,
  commission, translate-no, no-recensioner) — alla hade kört; sessionen här
  med full historik gav 26 ok / 0 saknas på samma register. Rättat samma
  dag: `fordjupaHistorik()` i `kallor/rutiner.mjs` kör
  `git fetch --shallow-since=15.days origin main` innan loggen läses (2,4 s
  mot GitHub), `historikFran()` mäter hur långt historiken faktiskt räcker,
  och räcker den inte tre intervall bakåt blir en rutin utan spår **"går
  inte att mäta"**, aldrig "saknas"; hela läget blir `delvis` med orsak, och
  orsaken står över tabellen. **Ett "saknas" som kommer ur en grund klon är
  mätarens fel, inte rutinens — skriv aldrig det ena som det andra.**
  Samma regel som `git log --all` för produktminnen: kolla hur mycket
  historik du ser innan du säger att något inte finns. En rutin
  med `avstangd: true` visas som avstängd — **men ett färskt spår vinner över
  flaggan** och sidan säger att registret är gammalt. Rutinerna som var
  `enabled: false` 2026-09-18 (HeimGuard ×3, TankGuard, AdventLane ×3,
  TackleBay ×3, CatCabin, Kundtjänst veckorapport) är flaggade.
- **Eskaleringskanalen** (`kallor/discord.mjs`): boten läser 12 meddelanden
  per kanal i varje varumärkes server (mätt 2026-09-22: boten ser alla elva
  servrarna — Bäverbutiken, Grillkliniken, HeimGuard, TankGuard, DryTrek,
  AdventLane, TackleBay, CaraShell, CatCabin, FjordCover, EdgeBench).
  Kundadresser maskeras innan de sparas i snapshoten. Matstrumpor har ingen
  server.
- **Kalendern** (`stonebite/kalender.mjs`): `data/kalender.jsonl` på volymen,
  jsonl med senaste-raden-vinner som insatserna. **Snabbinmatningen förstår
  svenska datumord** (`tolkaNar`: imorgon, fredag, nästa fredag, 15/10,
  2026-11-02, den 3 januari, om 3 dagar, om två veckor, nästa vecka, kl 14,
  14:30) — utan datumord gäller datumfältet, aldrig en gissning. Härledda
  rader (tvistdeadlines, dagsrutiner enligt schema, kontakters nästa steg,
  commissions kördagar) lagras aldrig och kan inte bockas av. Alla roller har
  en egen kalender (bara egna rader); varumärkesrader får bara ägare/chef
  skapa och röra — testat.
- **Kontakterna** (`stonebite/kontakter.mjs`): `data/kontakter.jsonl`. Nästa
  steg med datum syns i varumärkets kalender av sig självt. Bara http(s)-länkar.
- **Kräver dig i dag** överst på Översikt: tvister ≤ 3 dagar, rutiner
  saknas/sena, människor i eskaleringskanalerna senaste dygnet, dagens och
  försenade kalenderrader — över alla varumärken.
- **Pingen till VA:n** (`stonebite/larm.mjs`, Axels beslut 2026-09-22 —
  **alternativ A** av tre: Discord-ping, inte mejl, inte bara sajten). Körs
  av `/stonebite` direkt efter hämtningen, läser bara snapshoten. Två regler:
  en människa skrev i en eskaleringskanal och ingen ANNAN människa svarade på
  2 h ⇒ ping i samma kanal med länk till raden; en öppen tvist har deadline
  inom 3 dagar (eller passerad) ⇒ ping i varumärkets eskaleringskanal
  (Matstrumpor har ingen server ⇒ Bäverbutikens `#customer-service`).
  **En gång per ärende** — minnet är `stonebite/data/larm.json` (committas,
  30 dagar); botar, VA:ns egna rader och rader äldre än 72 h pingas aldrig.
  Mottagare ur `bonus/personer.json`: `support_chef`/`va` med `discord.id`
  för brandet eller `*` — **Mechile = `1543617780396593206`**
  (`mechilecs_18681`, slaget upp via members/search 2026-09-22).
  `allowed_mentions` låser pingen till just de id:na, så ett citerat
  kundmeddelande aldrig kan pinga en server. Engelska; citatet står som det
  skrevs. Sidan visar skickade pingar per varumärke (Kundtjänst-fliken).
  ⚠️ Tvistkollen 07:30 postar samma tvister som lista utan @ — pingen
  kompletterar den, ersätter den inte.
- **Autosvaret på sajten** (Axels beställning 2026-09-22 kväll: "alla cases
  som AI-botten har svarat på, där det är arga kunder, ska komma upp som en
  lista på kundtjänst-taben"): `hamta.mjs` lägger `snapshot.autosvar` ur
  kundtjänstbotens logg (`kundtjanst/autosvar/logg/<butik>.jsonl`, committad,
  via `kundtjanst/dashboard.mjs samlaAutosvar` — talen är `oversikt.mjs`:s,
  aldrig omräknade). `vy/drift.mjs autosvarBlock` visar det på **Kundtjänst**
  (det VA:n ser), i varumärkets Kundtjänst-flik och som rader i **Kräver dig
  i dag** (arga kunder senaste dygnet): per butik läget i klartext — *skickar
  svar* / *bara utkast — inget skickas* / *inget svar skrivet* / **kunde inte
  skriva i brevlådan** (rött; loggrader med `atgard: fel` — en bot som inte
  FÅR skriva i Roundcube såg annars ut som en som inget hade att skriva),
  senaste körning, mejl lästa, skickade, utkast, till VA:n, skrivfel — och **listan över arga
  kunder** (när, butik, order, vad kunden var arg över, botens svar som
  utkast/skickat, flaggad, mappen). Ingen logg ⇒ "har inte kört", aldrig
  noll. **Mätt 2026-09-22 18:40 UTC: boten är INTE igång** — bara
  Bäverbutiken har logg, 5 körningar, senaste 08:15 UTC, 102 mejl, **0
  skickade, 3 utkast, 2 arga**, ingen rutin på något konto jag ser, och
  miljön här saknar `KUNDTJANST_MAIL_PASS_*` så en rutin här hade inte
  kunnat köra den. ✅ **Igång på Railway sedan 2026-09-22 23:30 CEST** (PR
  #124 mergad, Axel lade in de åtta variablerna på tjänsten): `/halsa` svarar
  `autosvar.kor: true`, `lage: torr`, `host: Railway`, 0 omstarter (mätt fyra
  gånger 23:31–23:34), och sajtens Kundtjänst-flik visade första varvet 15
  min senare: **50 mejl lästa, 0 skickade, 0 utkast, 47 till VA:n, 0 arga** —
  flaggningen skrevs alltså i Roundcube från Railway, skrivvägen fungerar
  därifrån. 0 utkast är rätt: kalibreringsnattens utkast ligger redan i
  Drafts, så trådarna räknas som besvarade. ⚠️ Volymloggen börjar tom —
  minnet "ett svar per tråd någonsin" bärs där av Skickat + Drafts, inte av
  repots `kundtjanst/autosvar/logg/`. ⛔ **SKARPT sedan 2026-09-23 ~13:10
  CEST — Axels beslut A** ("Nej va??? … Den ska ju skicka meddelandena på
  arga kunderna"), efter att ha fått hela flödet, spärrarna och risken
  beskrivna: `AUTOSVAR_LAGE=skarpt` + Deploy på Railway, hans klick. ✅ **Live
  13:18:45 CEST, mätt 13:19 på `/halsa`** (`lage: skarpt`, `kor: true`, 0
  omstarter). ⚠️ Deployen efter variabelbytet ÅTERANVÄNDE bygget (`snapshot`
  i `/halsa` stod kvar på 07:05 UTC) — kod som mergats efter ~09:10 CEST,
  däribland WISMO-fraserna i PR #132, är inte live förrän nästa
  snapshot-triggade bygge. Axel skickade Lars utkast själv 13:17 och,
  utan att veta det, även det gamla Niklas Hurtig-utkastet från 19/8
  (VA:ns, order 5032, "fortfarande under transport") 13:18:33 — tolv
  sekunder före bottens start, alltså inte bottens. Drafts var tom 13:20.
  **Första skarpa svaret 13:42 CEST:** Micke, "Motortäckning", ARG på ordet
  *besviken*, X `fel_vara`, flaggat + VA-PRIO, två minuter från mejl till
  svar — rätt i form, men "besviken" utan hot/versaler som ARG och
  bildförfrågan om förpackning/fraktetikett för "passar inte min motor" är
  två kalibreringsfrågor (`kundtjanst/README.md` → SKARPT).
  20-regeln skrotad vid räkningen 1 (Lars #6898, första utkastet under
  Railway, rätt). Skarpt = samma kod, `utkast: torr` blir Skicka; allt annat
  (72 h-fönster, ett svar per tråd, VA:ns kund i 14 dagar, löftesspärren,
  20 per varv) oförändrat. Botten kostar noll Claude-credits: ren regelkod
  utan modell (`--kolla` skriver "ANTHROPIC_NYCKEL används inte av
  autosvaret"), bara Railways CPU. **Var boten ska köra (Axels krav samma kväll: "svara arga
  kunder på 60 sekunder … måste ligga och skanna hela tiden"):** en rutin på
  claude.ai kör som tätast en gång i timmen, så minutservern körs på
  **Railway**, där sajten redan snurrar dygnet runt —
  `stonebite/autosvar-vakt.mjs` startar `autosvar.mjs --loop 60` som
  barnprocess av servern när `AUTOSVAR_BRANDS` är satt, torrt tills
  `AUTOSVAR_LAGE=skarpt`, omstart med växande paus, loggen på volymen
  (`AUTOSVAR_LOGGMAPP`, standard `<STONEBITE_DATA>/autosvar/logg`) och sajten
  läser den live — en arg kund syns på Kundtjänst inom minuten. `/halsa`
  visar `autosvar.kor`. Slås på med `stonebite/cowork/5-autosvar.txt`
  (Axel klistrar in nycklarna själv). **Läget per butik sedan 2026-09-23**
  (Axels order: Bäverbutiken skarpt, CaraShell börjar torrt):
  `AUTOSVAR_LAGE_<ID>` vinner över `AUTOSVAR_LAGE`, vakten kör då
  `--skarpt --torr-for <de torra>` (flaggan kan bara göra en butik torrare),
  och `/halsa` visar `autosvar.lagen`. CaraShell läggs till med
  `stonebite/cowork/6-autosvar-carashell.txt` — steg 0 stoppar om `lagen`
  saknas på `/halsa`, för den gamla koden hade kört CaraShell SKARPT.
  Torrkörd från en session samma dag mot hello@carashell.com: 45 mejl, 0
  ENKEL (allt var produktfrågor/avbeställningar ⇒ VA:n), men den gav fyra
  rättningar innan: CaraShells kontaktformulär heter `Kommentar:`/`Comment:`
  (14 formulär hoppades som systemmejl), säljmejl till butiken ⇒ SKIP
  (`arSaljmejl`, en dropshipping-leverantör blev ARG på "within 24 hours"),
  brådskeord ensamma ("immediately", "senast") gör inte ett mejl ARGT
  (`eskaleringStark`), och signatur + spårningssida följer kundens språk
  (`svar.sparningssidor`). Två felaktiga utkast från körningen ligger kvar i
  CaraShells Drafts (Oncedrop, Jonathan Mount #1089) — sessionen raderar aldrig. ⛔ När vakten är på kör ingen session
  `autosvar.mjs` mot samma brevlåda för hand — dubbelsvar. 6 tester i
  `stonebite/test/autosvar-vakt.test.mjs`. ⚠️ **Vakten startar BARA på
  Railway** (`RAILWAY_*` i miljön) eller med `AUTOSVAR_VAKT=1` — mätt
  2026-09-22 22:41 CEST: Axel lade in alla åtta variablerna (inte bara de
  tre Shopify-raderna) i claude.ai-miljön på det här kontot, och en
  provstart `node stonebite/server.mjs` i sessionen drog igång boten mot den
  RIKTIGA brevlådan i sex sekunder (Roundcube inloggad, token mintad; dödad
  av timeout, ingen logg skrevs, inga processer kvar). `farKoraHar()` stoppar
  det nu, med orsak i loggen och `/halsa`. Två lärdomar samma minut: (1)
  miljövariabler som läggs in på claude.ai SYNS i en redan körande session
  (mätt: `env | grep KUNDTJANST` gav 0 kl 20:38 UTC och 8 träffar kl 20:44
  UTC i samma container) — CLAUDE.md:s äldre "syns först i en ny container"
  gäller inte längre för Bash; (2) `AUTOSVAR_*` hör hemma på Railway, inte i
  claude.ai-miljön — där gör de ingen nytta och är ofarliga sedan spärren,
  men Axel kan ta bort dem. De tre `SHOPIFY_*_BAVERBUTIKEN_EMAILSCRAPER`
  ska däremot ligga kvar där: sajten läste Bäverbutikens ordrar med dem
  samma minut (110 ordrar senaste dygnet, via `kandidatNycklar`).
- **CaraShell på sajtens Kundtjänst-flik + i autosvaret (2026-09-23, Axels
  beslut A: skarpt direkt).** Brandfilen `kundtjanst/brands/carashell.yaml`
  och `KUNDTJANST_MAIL_PASS_CARASHELL` fanns sedan 2026-09-21, men
  `stonebite/varumarken.json` stod kvar på `kundtjanst: []` + "Ingen
  brandfil" — alla fyra rutorna var tomma. Rättat: registret pekar på
  `carashell`, första veckorapporten W39 körd (läs-bar, utan Discord): 28
  ärenden, risk 37/100, 290 ordrar, **0 tvister** i Shopify. Brandfilens fasta
  signatur "Kundtjänst CaraShell" borttagen — kunderna skriver sv/nb/en, så
  `svar.mjs` väljer nu signatur efter kundens språk. Boten på Railway kräver
  `stonebite/cowork/6-autosvar-carashell.txt`: tre nycklar
  (`KUNDTJANST_MAIL_PASS_CARASHELL`, `SHOPIFY_CLIENT_ID/SECRET_CARASHELL` =
  värdena från `_yitrbk_m3`) **före** `AUTOSVAR_BRANDS=baverbutiken,carashell`
  — saknas ett lösenord startar vakten inte alls, och då stannar även
  Bäverbutiken. ⚠️ **Sammanslaget samma kväll:** två sessioner skrev var sin
  `6-autosvar-carashell.txt` parallellt — den skarpa låg på `main` UTAN den
  andra sessionens rättningar (säljmejl, brådskeord, kontaktformulärets
  `Kommentar:`, spårningssida per språk) som fanns bara på grenen
  `claude/kind-planck-hskg8m`. Utan dem hade Jonathan (#1089, lugn
  avbeställning) fått ett ARGT svar skarpt. Grenen är mergad; prompten är nu
  EN: steg 0 kräver `lagen` på `/halsa`, CaraShell startar med
  `AUTOSVAR_LAGE_CARASHELL=torr`, nycklarna heter `_CARASHELL`. Skarpt för
  CaraShell = ta bort `AUTOSVAR_LAGE_CARASHELL` på Railway (Axels klick).
  ✅ **Live TORRT 2026-09-23 18:41 CEST** (Cowork körde prompten, mätt av
  sessionen på `/halsa`: `lagen` {baverbutiken: skarpt, carashell: torr},
  `kor: true`, 0 omstarter, `saknar: []`). Första varvet: 13 mejl, 5 SVÅR
  (bara flaggade — SVÅR ger aldrig utkast), 8 hoppade, 0 utkast.
  Mechile är med i "CaraShell — OPS" sedan 2026-09-13 och ser
  `#customer-support` (mätt 2026-09-23).
- **Matstrumpor samma väg 2026-09-23 kväll (Axels order, fem steg, en merge
  per steg — PR #149–#153).** Registret pekar på `matstrumpor`; brandfilens
  tvistblock ifyllt (adress + telefon ur Shopify, descriptor **`SP
  Matstrumpor.se`** avläst av Axel, **returfönster 30 dagar** — Matstrumpors
  publicerade policy, inte Bäverbutikens 14; kunden betalar returfrakten, Axels
  beslut, fast policyn lovar en "returfraktsedel"). Veckorapport W39: **10
  ärenden, 10 obesvarade, risk 25/100, 137 ordrar, 0 tvister — och Skickat har
  inget nyare än 2026-06-09: ingen svarar från brevlådan.** Två fynd rättade:
  veckorapporten räknade Shopifys kontaktformulär som systemmejl i ALLA
  butiker (Matstrumpor 2 ärenden → 10; `run.mjs` tolkar dem nu med autosvarets
  `kundUrKontaktformular`), och `'kvalitet'` i `fel_vara` gjorde "Vilken
  kvalitet har sockorna?" till ENKEL `foton` (`arKvalitetsfraga`). Torrkörd
  för hand: 11 mejl, 1 utkast (retur, Anders), 9 SVÅR, 0 ARG. Railway:
  `stonebite/cowork/7-autosvar-matstrumpor.txt` (TORRT, Shopify-nycklarna
  heter på Railway exakt `SHOPIFY_CLIENT_ID/SECRET_1r46tp_qx`, ingen
  `SHOPIFY_SHOP_` — brandfilen bär domänen). ✅ **Live TORRT 2026-09-23
  21:25 CEST** (Cowork + Axels klick; Cowork får inte skriva in lösenord och
  nycklar, så Axel lade in de tre själv). Sessionen mätte /halsa 21:52:
  `lagen` {baverbutiken: skarpt, carashell: torr, matstrumpor: torr},
  `kor: true`, 0 omstarter, `saknar: []`. Loggen visade Shopify-token för
  1r46tp-qx med små bokstäver i nyckelnamnen. Skarpt för Matstrumpor = ta
  bort `AUTOSVAR_LAGE_MATSTRUMPOR` på Railway (Axels klick).
- **AI-botens svar som kort med bock (2026-09-23 eftermiddag).** Mechile
  svarade Micke Stigberg 15:28 utan att se att boten redan svarat honom 13:42,
  och Axels dom på blocket ovan var "väldigt otydligt, väldigt blek text …
  inget att interagera med eller markera som hanterade". Nu (`vy/drift.mjs`
  → `autosvarBlock`, `botfallFor`, `lovatSvar`, `botSvarText`,
  `nastaStegText`): **ett kort per mejl boten svarat på, ENKEL och ARG**, badge
  med ord ("ARG KUND · AI-boten svarade"), ordernumret stort, "Vad boten
  skrev" och "Nästa steg för dig" i klartext, och på arga kunder klockan
  **"Svar lovat senast" som räknar ner från botens svarstid** (48 h,
  `ESKALERING_TIMMAR` importerad från `svar.mjs`). Knappen **"Markera som
  uppföljd"** (`POST /app/autosvar/uppfoljd`, alla som ser Kundtjänst) skriver
  `data/autosvar-uppfoljning.jsonl` på volymen (`stonebite/uppfoljning.mjs`,
  senaste raden per nyckel vinner, "Ångra" är en rad med `uppfoljd: false`) —
  **botens logg rörs aldrig.** Nyckeln är `nyckel` i loggöversikten
  (`kundtjanst/autosvar/oversikt.mjs fallNyckel`: sha256 av Message-ID, 16
  hex, överlever att mejlet flyttas). Fyra högar: *Att följa upp* (ARG +
  allt boten flaggade/flyttade, arga överst, äldst först), *Boten svarade
  klart*, *Uppföljda (arkiv)* och *Torrkörningens utkast* (hopfällda). Ett
  uppföljt kort lämnar också "Kräver dig i dag". VA:ns SOP för den andra
  repliken: **"Following up the auto-reply — as Head of Customer Support"**
  (`kundtjanst/va-sop/following-up-the-auto-reply.md`, skriven ur prompten
  `PROMPT-following-up-the-auto-reply.md` — Axels beställning: "hon ska
  behandla ett AI-bots-case som nån skänk från ovan … som Head of Customer
  Support, fast på svenska", därav öppningen *"Det här ärendet skickades precis
  vidare till mig personligen. Jag är kundtjänstansvarig här"*, en mall per
  botutfall, aldrig ordet bot/AI, aldrig upprepa eller motsäga botens fakta,
  aldrig be om det kunden redan skickat, 48 h-löftet hålls från botens mejl,
  ägarens godkännanden orörda). Kör prompten igen när botens utfall ändras.
- ⚠️ **Sex butiker saknas på sajten, av tre olika skäl (mätt 2026-09-22
  18:06 UTC i timrutinens snapshot):** Bäverbutiken och UK `1wucum-x0` —
  403 "merchant approval for read_orders" (appen bakom `SHOPIFY_*_SE`
  resp. `_UK` får inte läsa kunddata); CatCabin `ras1t2-2x`, TackleBay
  `iahe0c-b1` och `j0p8qz-kp` — appen inte installerad (400
  `app_not_installed`); `aphkky-ke` — 402 "Unavailable Shop" (stängd eller
  obetald). **Bäverbutikens 403 är fel nyckelval, inte fel butik:**
  spårningens app (`SHOPIFY_*_SE_BAVER_SE`, registrerad i
  `sparning/butiker.json`) läser 900 ordrar i timmen, men den finns bara i
  claude5-kontots miljö — inte i `env_011kzcu4tXHXM9LdECNkDe9E` där
  `/stonebite`-rutinen och den här sessionen kör (mätt: enda suffixet för
  domänen här är `SE`, och det svarar 403). `kallor/shopify.mjs` provar
  sedan samma dag ALLA appar som pekar på butiken (registrerat suffix
  först, sedan domänens, sedan alla andra, sedan fabrikens) innan 403
  rapporteras, och felet namnger då både appen och de tre variabler som
  hade löst det (`forklaraNyckelfel`, 8 tester i `test/shopify.test.mjs`).
  ✅ **Löst 2026-09-22 22:44 CEST:** Axel lade in
  `SHOPIFY_SHOP/CLIENT_ID/CLIENT_SECRET_BAVERBUTIKEN_EMAILSCRAPER`
  (kundtjänst-appen, som får läsa ordrar) i det här kontots miljö —
  `kandidatNycklar` provar `SE` (403) och sedan `EMAILSCRAPER` (ok, 110
  ordrar senaste dygnet), så Bäverbutiken står på sajten från nästa
  timkörning. Samma tre variabler ska in på Railway för boten. **UK är
  AVSTÄNGD med flit** (Axel samma kväll: "Jag
  säljer inget på beavershop"): registret **`stonebite/butiker-av.json`**
  märker butiken `av` med orsak — den hämtas inte, räknas varken som läst
  eller saknad, och står under "Avstängda med flit" på sidan Butiker. Lägg
  aldrig en butik där utan Axels ord; ta bort raden när butiken ska säljas i
  igen. OPS-butikerna är nedlagda utom CaraShell — de står med orsak på
  sidan Butiker, det är Axels beslut om de ska installeras om, tas bort ur
  miljön eller läggas i av-registret.
- ⛔ **Tvisterna på sajten var nio dagar gamla — läses direkt ur Shopify
  sedan 2026-09-23.** `oppnaTvister` kom ur kundtjänstens veckorapport, och
  den enda som fanns var Bäverbutikens från 2026-09-14 (rutinen "Kundtjänst
  veckorapport" `enabled: false` sedan 2026-09-15). CaraShell visade "Inga
  öppna tvister" utan att Shopify tillfrågats — det råkade vara sant (mätt
  samma dag: 290 ordrar, 0 tvister, REST och GraphQL överens). Nu läser
  `/stonebite` varje timme `shopify_payments/disputes.json` per butik
  (`kallor/shopify.mjs` `hamtaAllaTvister`, samma appordning som
  försäljningen), och veckorapporten är bara reserv för en butik Shopify inte
  svarar för. Mätt vid bygget: Bäverbutiken 58 tvister / 19 öppna / 17 väntar
  på svar, CaraShell 0, Matstrumpor 3 (alla avgjorda), HeimGuard och
  AdventLane 0; NO, DK och FI svarade 403 (apparna saknade
  `read_shopify_payments_disputes`) — ✅ **rättat samma dag 17:29–17:37 CEST**
  av Cowork (ny appversion "tvister-2026-09-23" per app, bara den rättigheten
  tillagd, godkänd i varje butiks admin). Mätt efteråt: NO 4 tvister / 1 öppen
  (#1190, under review), DK 0, FI 0.
  Apparna (mätt 2026-09-23): NO "Bever No produkter claude", DK "DK
  claudeprodukter", FI "FI claudeprodukter" — alla tre med samma 13
  rättigheter (ordrar, fulfillments, produkter, innehåll, lager, rabatter,
  publiceringar). Rättigheten läggs till med `stonebite/cowork/7-tvister-no-dk-fi.txt`.
  Samma dag: Shopify ger 50 tvister per sida — `kundtjanst/shopify.mjs`
  läste bara 50 av Bäverbutikens 68, nu paginerat. `under review` (bevisen
  redan inne) pingas, kalenderförs och räknas som brådskande aldrig.
- ⚠️ **Bank, spärrade kort och överföringar har ingen datakälla.** De läggs in
  för hand som Larm i kalendern. Sidan påstår aldrig något om banken.

### ✅ I DRIFT sedan 2026-09-21 kväll (Cowork byggde, mätt av sessionen)

**Railway:** projekt `strong-solace`, tjänst `yognftnfgn`, deployar `main`,
Node 20.20.2, volym på `/data`, Watch Paths `stonebite/**` + `bonus/**` +
`package.json`. Direktadress
`https://yognftnfgn-production-cfb8.up.railway.app` (port 8080) — den fungerar
även om domänen krånglar, så felsök alltid där först. Ägarkontot är skapat
(`/halsa` sa `konton:1` kl 20:5x), alltså är `/kom-igang` stängd.

**Domänen:** DNS ligger hos **Squarespace** (gamla Google Domains —
namnservrarna heter `ns-cloud-e1…e4.googledomains.com`, vilket LÄSER som Google
men redigeras hos Squarespace). Uppmätt zon:

| Post | Värde | Not |
|---|---|---|
| `CNAME www` | `daz9hn85.up.railway.app` | huvudadressen |
| `TXT _railway-verify.www` + `TXT _railway-verify` | Railways verifiering | båda på plats |
| `A @` ×4 | Squarespace-IP:n | deras vidarebefordran, inte vår sajt |
| `MX` | `1 smtp.google.com` | ⚠️ mejlen, rör aldrig |

⚠️ **Roten kan inte peka på Railway.** Squarespace vägrar CNAME på `@`
(Spara-knappen går inte att klicka), och Railway erbjuder ingen A-post. Därför
är **`www.stonebite.org` den riktiga adressen** och `stonebite.org` en 302-
vidarebefordran dit, satt i Squarespace. Sökvägen följer med, så
`stonebite.org/halsa` fungerar. Squarespace har posttypen ALIAS om det någon
gång ska göras om till en direktpekning.

⚠️ **Hela gruppen "Squarespace Defaults" togs bort** (4 A-poster, `CNAME www →
ext-sq.squarespace.com`, en HTTPS-post) — den gick inte att ändra post för post.
Axel godkände det. Ingen CAA-post finns i zonen, så inget blockerar Let's
Encrypt.

⚠️ **Certifikatet går inte att mäta från en claude.ai-container.** Proxyn
MITM:ar all HTTPS, så `openssl s_client` mot www.stonebite.org svarar med
`issuer = O = Anthropic, CN = Egress Gateway SDS Issuing CA` oavsett vad
webbläsaren ser. Mätt 2026-09-21: sajten svarade `{"ok":true,…}` med `-k`, men
om Railway hunnit utfärda sitt cert går bara att se i en riktig webbläsare
eller i Railway → Settings → Domains. **Skriv aldrig "certifikatet är klart"
från en curl härifrån.** Den gamla www-posten hade 4 timmars TTL, så Railways
kontroll kan dröja ett par timmar efter att DNS ändrats.

⚠️ **Fyra andra Railway-projekt bygger samma repo från `main` vid varje push**
(`tranquil-insight`, `considerate-delight`, `pretty-quietude`,
`compassionate-sparkle`, mätt 2026-09-21). De konkurrerar om byggslottarna —
mergen fick vänta ~10 minuter — och äter planens domängräns.
⛔ **Mätt 2026-09-22 kväll: det kostar timmar, inte minuter.** Sedan rutinerna
pushar 7–8 gånger i timmen (sex spårningsrutiner + `/stonebite`) bygger de
fyra projekten oavbrutet, och sajtens egna deployer står i **"Waiting for
build slot"** i över en timme: PR #113 (17:10 CEST) gick live först 18:49,
och PR #119 (mergad 18:17) var inte live 20:18 — `/halsa` visade snapshoten
från 17:07 hela kvällen. Railway hoppar dessutom över äldre köade deployer
när nyare kommer (18:06-snapshoten och #119 syntes inte i kön, bara 19:06 och
20:06), så det är alltid den nyaste commiten på `main` som till slut byggs.
**Sajten ligger alltså ~2 h efter `main` så länge projekten finns.** Railway
går inte att nå från en session (ingen token, ingen CLI — mätt samma kväll),
och Axels besked var "du får ju göra det där": därför Cowork-prompten
**`stonebite/cowork/4-byggko.txt`** — inventerar alla projekt, tar bort dem
som enbart bygger yognftnfgn `main` utan domän och volym, kopplar annars bara
bort GitHub-källan, rör aldrig `strong-solace` eller StonePNL-projektet
(branchen `claude/bäverbutiken-settkopplingen-nba21z`), och verifierar sedan
att kön i strong-solace börjar bygga och att `/influencers` svarar.
**Utfall samma kväll (Coworks rapport 21:4x CEST):** kontot hade ÅTTA
projekt, inte fem. `strong-solace` (sajten) och `robust-expression`
(StonePNL: PNL FI/DK/UK, PNL App store, beautiful-curiosity, yognftnfgn på
branchen `claude/bäverbutiken-settkopplingen-nba21z`, plus en Postgres med
volym) rördes inte. Rena dubbletter av `main` utan domän och volym:
`hearty-youth` (**ny sedan dagen innan** — något skapar nya Railway-projekt
ur repot; vad är inte utrett), `considerate-delight`, `pretty-quietude`,
`compassionate-sparkle` — Cowork kan inte radera projekt ens med Axels ok
(spärrat i Cowork), så källan kopplades bort och 6 + 25 + 25 + 24 köade eller
byggande deployer avbröts. `tranquil-insight` bygger också `main` men bär en
volym (`yognftnfgn-volume`): källan bortkopplad, 3 deployer avbrutna,
projektet kvar. `just-possibility` bygger en ANNAN branch
(`claude/daily-agent-discussion-uos5df`, en annan sessions experiment) och
rördes inte — den tar byggplats vid pushar till sin egen branch. Köerna var
avbrutna 21:17; sajtens deploy gick till Building 21:25 och `Merge pull
request #123` blev Active 21:33 (snapshot-deployen 21:06 REMOVED som
överkörd). Sessionen mätte 21:40: `/influencers` 200 med nya texten på både
direktadressen och www, startsidan utan konsult/tjänster/mentorskap/
rådgivning, `/tjanster` 301. De tomma projekten står kvar tills Axel raderar
dem (Settings → Danger → Delete Project). Dyker en ny dubblett upp: koppla
bort källan och avbryt kön på samma sätt, aldrig vänta ut den.

✅ **Rutinen `/stonebite` är byggd 2026-09-22 kl 14:39 CEST — på Axels
Barkås-konto (`barkas.kundservice@gmail.com`), inte på `claude5@stonebite.org`**
(Axels order "gör det nu"; `list_triggers` var tom på det här kontot, så ingen
dubblett). Trigger **`trig_01QwKgfZP3JdhZX6tbGo1LJb`** ("Stonebite: färsk data
till sajten (varje timme)"), fast session **`session_01PBEszeiGu5Qe2Lu5Je1p9T`**
(repot som källa, `main` som utgren, tagg `routine:stonebite`), cron
**`4 * * * *`** (varje timme :04 — minuten vald så den inte krockar med
spårningsrutinernas :16/:24/:32/:40/:48/:56; samma i CEST och CET), prompt
`/stonebite`, inga connectors (allt går via `META_ACCESS_TOKEN`, `NOTION_TOKEN`,
`JUDGEME_API_TOKEN`, `DISCORD_BOT_TOKEN`, `SHOPIFY_*` i sessionens miljö).
**Sedd i `list_triggers` samma körning**, första körning 15:04 CEST.
⚠️ Avstängd av Axel 2026-09-23 07:42 UTC, **påslagen igen samma dag 14:57 UTC
(Axels beslut A)** så att tvisterna läses ur Shopify varje timme (PR #142);
nästa körning 17:04 CEST. Rutinen
committar `stonebite/data/snapshot.json` (~600 kB) till `main` varje timme —
kommandot drar `main` först, annars krockar pushen med spårningsrutinerna.
⚠️ Den fasta sessionen klonade `main` 2026-09-22 12:38 UTC, FÖRE PR #112
(varumärken/rutinvakt/eskalering) mergats: tills dess kör den gamla `hamta.mjs`
och snapshoten saknar `rutiner`/`eskalering`/`varumarken` — baksidan visar då
"inga rutiner registrerade" tills nästa körning efter mergen. Vill Axel ha
rutinen på `claude5` i stället: radera triggern här och kör `/rutin /stonebite`
där — aldrig båda.

---

## `klaviyo/` — e-postmarknadsföring i Klaviyo, Bäverbutiken först (NY 2026-09-24)

Axels beställning: riktig e-postmarknadsföring med Claude och Klaviyo, kopplat till
creative strategy och Evolve-metoden. Kontot är `QZ4jLG` (syns i sajtens HTML sedan 2026-09-25; till och med 2026-09-24 laddade sajten det äldre kontot `TMFt7M`, som aldrig ska röras). Börja i
`klaviyo/README.md`. Kontraktet står i `klaviyo/ARKITEKTUR.md`, strategin i
`docs/os/EPOST-STRATEGI.md`, VA-SOP:erna i `klaviyo/sop/`, kommandot heter `/klaviyo`, och
det som återstår står i `klaviyo/SISTA-STEGEN.md`.

- **Allt laddas upp som utkast.** Klienten vägrar send-jobs, kampanjer som skickas direkt
  och flöden med annan status än `draft` (testat). Att skicka eller slå på något är Axels beslut.
- **Bara `subscription: "subscribed"`** får kampanjer (MFL 19–20 §). Undantag, Axels beslut B 2026-09-25: köparflödena F04/F05/F07 (trigger Placed Order) går till alla köpare som inte tackat nej (filternyckeln `kundundantag`, MFL 19 § andra stycket) — nya versioner TyH2jg/VgvDum/QXZzvn, de gamla får aldrig slås på. Kampanjer: fortfarande bara subscribed. Mätt 2026-09-24:
  6 186 av 8 367 kunder har samtycke.
- **Inga schemalagda rutiner** för Klaviyo förrän Axel säger till. Han kör det för hand
  först, enligt Arvids princip: flytta ett steg till VA:n när det gått rätt i tre veckor.
- **Evolve har inget om flödesstruktur** (botens egna ord, `klaviyo/evolve/SVAR.md`).
  Flödena bygger på Klaviyos guider (`klaviyo/evolve/FLODESRESEARCH.md`) och på vår egen
  återköpsdata (`klaviyo/evolve/ATERKOP-ANALYS.md`). Enda produktparet med stöd:
  Marin Motorhölje → Båtmotorskydd, median cirka 28 dagar (flöde F07).
- **Attributionen ställs om till bara klick, 5 dagar, utan Apples öppningar** (Evolve/Billy).
  Öppningsgraden fäller aldrig en dom ensam.
- ⚠️ Klaviyos avsändare stod 2026-09-24 på `kundsupport@baverkoppling.se`, en domän utan MX,
  och `baverbutiken.se` saknade DMARC. Cowork-prompten i SISTA-STEGEN rättar båda.
- ✅ **Uppladdat 2026-09-25 som utkast** (mätt med tillbakaläsning): 14 kampanjer Draft utan
  schema, 6 flöden draft (14 flödesmejl draft), 30 mallar, 14 segment. **F03 Webbhistorik** (XMi5Wa, draft) laddades upp
  samma dag på `V6gSUn`: `Viewed Product` finns två gånger i kontot, och bara butikens spårningskod
  (`V6gSUn`) fick händelser. Shopifys `WXk2Lf` hade 0. Valet står i brandets `metrik_val`. `SEG_samtycke` 1 552 profiler och `SEG_uppvarmning_steg1`
  216 vid mätningen, kontot skapat samma morgon — mät om före K01. Tre gissningar rättade mot
  kontot: Placed Order-fältet heter `Items` (inte `ItemNames`, F07 hade aldrig triggat), Ordered
  Product-fältet `Name`, och Klaviyo tar max 5 segment i bearbetning åt gången. Flödesmallar
  **kopieras** in i flödet, så en ändrad mall slår inte igenom i ett befintligt flöde. Kontot saknar
  postadress (Settings → **Account** → Contact information; mätt med ett renderat mejl, inte bara API:t) — inget får skickas förrän den finns.
- ⛔ **13 FLÖDEN LIVE sedan 2026-09-25 ~10:40 CEST** (Axels ord: "Nu sätter vi igång alla fucking flows"), påslagna med `klaviyo/sla-pa.mjs --ja`. Kampanjerna: 22 st (K01–K22, schemat i `klaviyo/innehall/baverbutiken/KALENDER-2026.md`); **K01 SCHEMALAGD** tis 29/9 18:00 med `klaviyo/schemalagg.mjs K01 --ja` (Axels ord "Schemalägg k01"), resten utkast. Black Week-trappan 10/20/30 % ligger i Shopify som tre schemalagda automatiska rabatter 23/11–1/12 (Axels beslut). Id:n i `klaviyo/README.md`. Leveranstiden står aldrig i ett mejl (Axel igen samma dag).
- ✅ **Omgång 2 efter Axels granskning 2026-09-25:** 13 flöden. F04 och sex tipsflöden (bälteslip, taköverdrag, termoskydd, båtmotorskydd, IBC, sätesöverdrag) triggas av **Fulfilled Order**, eftersom bara den händelsen bär spårningsnumret. F04:s knapp går till kundens eget paket (`sparning:` → `?k=` base64, sidan byter till bävernumret, för Klaviyo saknar sha256). Ändrad text kräver `version` i mejlet, annars återanvänds den gamla mallen (`TPL_<id>_v<version>`). Förhandsvisning: https://claude.ai/artifact/CMT1xEfoqLqm23AS6WxqAT. Id:n och lärdomar i `klaviyo/README.md`.
- ⛔ **OpenSend (anonyma mejl) får inte användas i Sverige**: att mejla reklam utan samtycke
  bryter mot MFL 19 §. Axels beslut 2026-09-24: ingen popup än.
- ✅ **Matstrumpor har samma system sedan 2026-09-25, i ett EGET konto `UV6Rqg`** (sajten laddar
  `klaviyo.js?company_id=UV6Rqg`, nyckeln `KLAVIYO_API_KEY_MATSTRUMPOR`, brandfilen
  `klaviyo/brands/matstrumpor.json`). Motorn är brand-parametriserad: alla skript, även
  `sla-pa.mjs` och `schemalagg.mjs`, tar `--brand matstrumpor` (standard `baverbutiken`,
  oförändrat). Produkterna läses via `klaviyo/shopify-butik.mjs` (`sparning/butiker.json`, appen
  Fabriken med `read_all_orders`), recensionerna via Judge.me:s publika widget (ingen API-nyckel
  för butiken), kategorisegmenten ur brandfilen (sushi/pizza/hamburgare/donut), prenumerantlistan
  är Shopify-synkens "Email List". **Uppladdat som utkast 2026-09-25:** 14 kampanjer K01–K14
  (tisdagar 18:00 29/9–29/12 + Black Week mån 23/11 och fre 27/11, `innehall/matstrumpor/KALENDER-2026.md`),
  7 flöden (F01 `SVdssi`, F02 `S8VT8T`, F03 `YAZ8cN`, F04 `VtTT7F`, F05 `U9exx3`, F06 `R29irU`,
  F07 `V4KBnH`), 29 mallar, 14 segment (`SEG_samtycke` 2 890 av 4 357 profiler). **Gallerierna**
  (Axels ord samma dag: "massa gallerier … jävligt nice", `klaviyo/gallerier.mjs`): kampanjerna
  https://claude.ai/artifact/VdYq8VLTHqPW4kQm4gMKw1, flödena https://claude.ai/artifact/WLQKsyRR8soHCDusP8jtYx,
  mallarna https://claude.ai/artifact/1KEuzFEai52gahdbpvGShN, schemat https://claude.ai/artifact/Ljyv3Ye89ipdPNCZbNKKLh,
  galleriet ur `bygg.mjs` https://claude.ai/artifact/MYCFYWgVAcwugj1tPFrmgR — publiceras om på samma länkar.
  ⚠️ **Bilderna i gallerierna måste bäddas in** (`klaviyo/bilder.mjs`, samma eftermiddag efter Axels
  "WHATAHELL … fixa alla direkt"): artifact-visaren blockerar bilder från Shopifys CDN och butikens
  domän, och telefonramarna (`srcdoc`) ärver spärren — första versionen visade trasiga bilder i varje
  mejl. Nu hämtas varje bild en gång (cache `output/<brand>/bilder/`) och ligger EN gång per sida som
  data-URI; sidorna väger cirka 1 MB. Regeln gäller varje sida som publiceras som artifact.
  ⛔ **Inget påslaget, inget schemalagt:** Axels villkor (postadress, plan, kundundantag,
  subscribed, renderat testmejl) — postadressen SAKNAS i kontot och planen syns inte via API:t;
  Cowork-prompten och villkoren står i `klaviyo/SISTA-STEGEN.md` → Matstrumpor. **Datan**
  (`klaviyo/evolve/ATERKOP-ANALYS-matstrumpor.md`, hela orderhistorien 3 911 ordrar): julprodukt
  (dec 2025 1 613 ordrar, april–juli nästan noll, sushilådan tog slut i november 2025), 1,2 %
  återköp och då samma sushilåda igen (38 av 44), inget produktpar med stöd ⇒ inga tipsflöden,
  F07 är "en låda till" dag 21. Leverans p90 **15 dygn** (Shopifys `deliveredAt`, INTE
  `lage.json`:s `senast` som är rutinens kontrolltid) ⇒ sista beställning fars dag lör 24/10,
  jul tis 8/12. Black Week-trappan 10/20/30 % ligger i Matstrumpors Shopify som tre schemalagda
  automatiska rabatter 23–30/11 (samma som Bäverbutikens; ⚠️ "Köp 1, få 1"-koderna kombineras
  inte med dem — Axels beslut). ⛔ **DNS för matstrumpor.se rörs aldrig i en Klaviyo-körning och
  namnservrarna byts ALDRIG** (Loopia-incidenten på baverbutiken.se 2026-09-25); Klaviyos poster
  bara på `send.matstrumpor.se`, DMARC saknas (mätt 2026-09-25), mät med dns.google efter varje ändring.
  ⚠️ Mätt i båda kontona: Viewed Product-priset är text ("299 kr"), så `floatformat` i det dynamiska
  blocket gav tomt — rättat; Bäverbutikens live F03 bär den gamla mallen.

## `bonus/` — alla i bolaget ska kunna tjäna pengar (NY 2026-09-21)

Axels uppdrag: "vi behöver verkligen något system för VA:erna". De hade fem
dollar per Trustpilot-recension med sitt namn — **och drog noll recensioner.**
Full dokumentation: `bonus/README.md`.

```bash
node bonus/kor.mjs --torr    # räkna månadens bonus, skriv inget
npm run bonus                # skarpt: skriver bonus/utfall/<månad>.json
```

**Fyra program, alla mätta ur data vi redan har:**

| Vem | Tjänar på |
|---|---|
| VA | $5 recension med namn · $10 tre på en vecka · $1 tvist besvarad i tid · $5 vunnen tvist · $15 tom inkorg · $10 svarstid under 12 h — veckobonusarna EN gång per vecka när ALLA personens butiker klarar det |
| Head of support | 10 % av teamets bonus (utan egna rader) · $25 per butik med risk under 25 · $20 full SOP-täckning hela månaden |
| Produkttest | **$15 per färdig produkt** (`Ads review` eller längre) — Axels beslut 2026-09-21, ersatte trappan 2/5/25/100. Trappan visas fortfarande på sidan Produkttest |
| Redigerare | 0,4 % av spenden (commission, oförändrat) — Josh och Annabelle tjänar dessutom i produkttest (`extraRoller`) |

**Axels svar 2026-09-21 (inskrivna):** kontaktmejl `contact@stonebite.org`;
**Mechile Delos Santos** är både VA och Head of customer support för alla
butiker (`bonus/personer.json`, `brands: ["*"]` = alla, även framtida);
tvistbeloppen halverade ("alldeles för mycket"); Trustpilot-konto finns inte och
behövs inte — Judge.me läses redan. Servern stoppar självgodkännande även för
den som har rätten `godkanna` (403 när insatsens personId är den inloggades).

⚠️ **Varför de inte drog recensioner — och vad som ändrats.** Tre saker
saknades: de såg aldrig pengarna, ingen visste exakt hur man ber om en
recension, och det fanns inget veckomål. Nu: Min sida visar "Du har tjänat
$X", varje uppdrag har ett *Så gör du*, recensionsuppdraget har en **färdig
text att kopiera** (sv + en) och en veckoräknare "1 av 3".
**Mätt 2026-09-21: 2 av 1 210 recensioner nämnde någon i teamet.** Den siffran
står nu överst på sidan Recensioner.

**Halvmånaderna på Min sida (2026-09-24, Joshs önskan — lönen går 1–15 och
16–månadens slut):** motorn lägger `halvor: { forsta, andra, manad }` på varje
person (`halvaFor` i `bonus/motor.mjs`, bevisdatumet avgör, den 15:e hör till
första halvan). Commission (andel av spenden) och teamandelen räknas på hela
månaden och står som `manad` — de delas aldrig på en påhittad nyckel. Mätt
samma dag: Josh 1–15 $240, 16–30 $60, spend $50,94 = hans summa $350,94.

**Fyra regler som sitter i koden:**
1. **Hellre okopplad än fel person** — två namn i samma recension betalar ingen.
2. **Ingen utbetalning utan underlag** — varje krona pekar på ett bevis.
3. **Anspråk verifieras mot datan** — "jag svarade på tvist #5763" betalas
   först när tvistdatan säger att den är besvarad.
4. **Ingen godkänner sina egna pengar** — VA rapporterar in, chefen godkänner.
   Ett test loggar in som VA och försöker godkänna sin egen insats: 403.

⚠️ `bonus/personer.json` är folkregistret (roll, förnamn för
recensionsmatchning, butiker). **En person kan bära flera roller**:
`extraRoller: ["produkttest"]` gör att en redigerare även tjänar i
produkttestprogrammet. Mätt 2026-09-21: Josh (13) och Annabelle (12) står som
Ansvarig på produkttester men får bara betalt som redigerare — **det är Axels
beslut om pengar, systemet ändrar det inte självt.**

⚠️ Trustpilots publika sida svarar 403 på maskiner (mätt 2026-09-21). Automatisk
läsning kräver `TRUSTPILOT_API_KEY` + `TRUSTPILOT_BUSINESS_UNITS`. Judge.me
läses redan automatiskt (1 210 recensioner på 60 dagar). Utan Trustpilot-nyckeln
rapporterar VA:n in recensionen med länk och chefen godkänner.

---

## Kommandona (Axels gränssnitt)

40 filer i `.claude/commands/` (räknade 2026-09-16). Detta är produkten — resten är stödsystem.

| Kommando | Vad |
|----------|-----|
| `/ny-produkt <namn> <budget>` | Första testbatchen för ny produkt (ingen data än) — SOP-06 |
| `/forsta-batch <namn>` | Full CS-analys från noll i en NY chatt |
| `/cs <id> [egna idéer]` | **Kärnloopen:** CS på senaste annonserna, feedbackloop, nästa batch |
| `/koncept <id> <idé> [AKUT]` | Släng in koncept i backloggen (AKUT = bygg briefen nu) |
| `/checkin <id>` | Daglig check-in: kvot, Slack-kontroll, grönmarkering, larm |
| `/logga <id> <antal>` | Launch-avstämning: kvot + Notion-sync + tracking-sheet |
| `/notion <db>, <mapplänk>` | Ladda upp batchens briefer till Notion |
| `/sheet <id>` | Fyll i tracking-sheetet (xlsx) |
| `/ugc <id> <ny info>` | Uppdatera UGC-plan och deadlines |
| `/plan [datum]` | **Redigerarna:** lägg dagens plan, skapa tasks, morgonmeddelanden |
| `/dashboard [datum]` | Bygg och läs redigerardashboarden |
| `/rapport <namn>: <text>` | Tolka en slutrapport från Slack (bekräftas innan den sparas) |
| `/granska [id]` | Beta av review-kön: checklista → godkänn eller skicka tillbaka |
| `/launch <produktnamn>` | **Temu-flödet:** Drive → QA → Judge.me → Meta som PAUSED (`docs/temu-launch-flow.md`) |
| `/bildannonser [--dry]` | **Rutin 20:00 varje dag:** alla Notion-hubbar → ogjorda bildannonser → kie.ai → `To be Reviewed`. **Aldrig video.** |
| `/nattkorning` | Rutinen "Ad upload and structure": Drive-kön → QA → Meta |
| `/notionkorning` | **Rutin 13:20 varje dag:** Notion `To be Reviewed` (video + bild) → brief-QA → upp i produktens kampanj → Discord `#ads-launching` / `#problem-and-revisions-ads` |
| `/commission` | **Var tredje dag + månadens sista dag:** godkända Notion-rader → spend i alla annonskonton → 0,4 % till redigeraren |
| `/skalningskungen <butik>` | **Bäverbutikens larm + budgetrond:** dömer siffror, skickar OPS-larmet. Inga briefer |
| `/matstrumpor [--torr]` | **Matstrumpors annonsuppladdare** (byggd 2026-09-21): hubbens `To be Reviewed` → rätt adset i den CBO Axel redan kör (`MATSTRUMP_SALES_20260826` i kontot **"nya kungen"** `730973156224390`) → `Approved`. **Adsetet väljs ur ANNONSNAMNET** — `MATSTRUMP_sushi_<vinkel>_<format>_<nnn>_v<n>`, där vinkeln `jul` skickar materialet till `broad_advplus_purchase_jul_video` **`120251657101850023`** respektive `_jul_bilder` **`120251657107430023`** (båda skapade 2026-09-21 som kopior av `batch03_bilder`; jul_video ACTIVE med 8 annonser, jul_bilder PAUSED och tom tills första julbilden), allt annat till `nya16` (video) och `bilder` (bild). **Första skarpa körningen 2026-09-21: 11 videor live** ur Gilz rader 022–025. ⚠️ Två fällor mätta då: Meta KRÄVER en thumbnail på varje videoannons och tar bara publika URL:er — `matstrumpor/thumbnails.mjs` drar en frame med ffmpeg och lägger den på butikens Shopify-CDN; och Drive-delningslänken funkar inte, men `drive.usercontent.google.com/download?id=…&confirm=t` gör det. Odöpta rader (redigerarna döper sina `022`, `023` …) namnges av uppladdaren efter att creativen setts — `kor.mjs --namn` ger nästa lediga nummer, `--dop` skriver det i Notion. Stoppar bara på pris > 20 % från butiken och fel landningssida. ⚠️ Uppladdningen kräver fortfarande Adsmanager-MCP:n (token-vägen för skrivning är inte byggd); `META_ACCESS_TOKEN` LÄSER kontot sedan 2026-09-22 |
| `/matstrumporkungen` | **Skalningskungen i liten skala, bara Matstrumpor** (byggd 2026-09-21): etikett dag 7 → lärdom → **6 briefer per rond, var tredje dag** (Axels beslut) → **tips**. Samma ordning och samma trösklar som `/rond-auto`, men brieftaket är antalet skrivna lärdomar och mixen kommer ur etiketterna. ⛔ **Den SKALAR ALDRIG** (Axels beslut 2026-09-21: "jag vill inte att claude ska skala på matstrumpor utan det är jag som gör det, claude får gärna ge mig tips") — noll budgetändringar, noll pausningar, noll aktiveringar. Förslagen står i en tabell med kronor bakom varje rad och loggas som `FORSLAG`; Axel trycker på knappen. Break-even **1,498** / break-even-CPA **308,48 kr** (AOV 462,10 kr uppmätt på 110 ordrar, kostnad 120,92 kr + 2,9 EUR tull, **utan moms** — Axels besked 2026-09-21). Kampanjen låg på ROAS 1,392 (17 031 kr / 14 d) vid bygget, alltså under break-even. ✅ **Rutin sedan 2026-09-22** (rutintabellen, 07:00 varje dag — `node matstrumpor/kor.mjs --kordag` avgör om det är rond, var tredje dag från förra rondens `ROND_KLAR`; `nu` som argument tvingar): Meta läses via token med `kor.mjs --hamta` (14 dagar + annonsens egna första vecka + budgethistoriken ur aktivitetsloggen), domen med `--dom … --json`, briefraderna via `tools/notion-brief.mjs` (`NOTION_TOKEN`), `CONNECTORS: inga`. Mätt vid bygget 2026-09-23: 96 annonser, 6 bedömbara, 72 etiketter (0 breakthrough), last_14d 16 972 kr / 34 köp / ROAS 0,943 — under break-even |
| `/notionscalercs setup <butik>` / `/notionscalercs <butik>` | **Nattvakten, EN rutin per OPS-butik** (Axels beslut 2026-09-10): varje natt 00:01 döda/skala/sänk budget i OPS-kontot; ons + sön dessutom `/cs`-loopen med nya briefer i butikens creative hub via `NOTION_TOKEN` — noll godkännandeklick. `setup` körs en gång per butik och bygger rutinen |
| `/ops-leverans <nyckel>` | **13:40 per OPS-butik:** hubbens `To be Reviewed` → priskoll → **live** i butikens SE-kampanj i OPS-kontot (ett adset per koncept) → `SE-ACTIVE to be translated`. Byggs av `/notionscalercs setup` |
| `/ops-oversatt <nyckel> [--marknad NO\|US]` | ⛔ **Fel språk 2026-09-20, rättat 2026-09-22:** US-rundan körde `translate-batch.mjs` utan `--marknad`, verktyget föll tillbaka på norska, och fyra videor gick live i USA med norsk röstmodell som läste engelsk text (`OB_101_H1`, `PD_107_H1`, `RI_103_H1`, `PD_106_H1`, 820 kr / 0 köp) medan batch-loggen sa "amerikansk engelska". Nu: `--marknad` obligatorisk, språket ur `pipeline/sprak.mjs`, HeyGens `output_language` läses vid proofread/render/download, SRT-språkkoll, exit 1 vid fel; källfilen är alltid den svenska (`--utan-marknadsfiler`). De fyra är pausade + `_FELSPRAK`, raderna tillbaka i kön. **15:40 (NO) / 16:40 (US) per OPS-butik:** `SE-ACTIVE to be translated` → marknadens språk (bild 0 krediter, video HeyGen) → **live** i butikens kampanj på MARKNADENS konto → `Approved` när alla butikens `annonsmarknader` bär annonsen. **Kontot är per marknad** (`factory/opsmarknader.mjs`): NO i OPS-kontot, **US i Magiborsten UK `1107817401910319`** (Axels beslut 2026-09-16, SEK). Byggs av `/notionscalercs setup`; US-rutinen bara för butiker med `annonsmarknader: NO,US` i register.json |
| `/ops-spegla <nyckel>` | **16:20 + plats per speglad produkt (Axels beslut 2026-09-18):** Bäverbutikens hub → CaraShell. Taköverdraget och Termoskyddet briefas BARA i Bäverbutikens teamspace (CaraShells briefronder pausade). Bäverbutikens `/oversatt NO` sätter NO-klara rader i steget **`CaraShell SE ready to be active`**; rutinen laddar upp den svenska filen **live** i CaraShells SE-kampanj, Bäverbutikens norska version i NO-kampanjen (0 krediter), kopierar raden till CaraShells hub (`SE-ACTIVE to be translated` → US-rutinen gör engelskan) och sätter källraden till **`CaraShell EN ready to be active`**; finns US-annonsen → `Approved`. Spegelnamn = källans nummer + 100 (`Takoverdrag_BOF_3_1` → `CaraShellRoof_BOF_103_1`). Stopp: pris > 20 % från butikens, eller "Bäverbutiken" i copyn. Konfig: `node factory/register.mjs spegling <nyckel> <bäver-hub-id>`; källorna: `node tools/ops-spegla.mjs --kallor`. ⚠️ Statusstegen måste Axel skapa för hand i de två Bäver-hubbarna (API:t kan inte) |
| `/briefgranskning` | **Måndag + torsdag 07:00, EN rutin för hela Bäverbutiken (Axels beslut 2026-09-18, ombyggd samma kväll från OPS-registret — OPS-projektet är nedlagt utom CaraShell, och CaraShells briefer skrivs i Bäverbutikens hubbar):** hubbarna hittas dynamiskt som i `/notionkorning` (alla databaser integrationen ser − OPS-hubbarna per id − andra verksamheters hubbar och mallen − databaser utan brief-livscykel Draft → To be Reviewed, så "Product test center" faller bort av sig själv). Per hub väljs den senaste briefronden (Typ "… Pending Approval" skapade samma dag); ronder som redan har en Feedback-rad med datumet, eller är äldre än 10 dagar, hoppas. En creative director dömer ronden — **en hub i taget, aldrig blandat mellan produkter** — mot `docs/copy-regler.md`, `docs/os/ANALYSMETOD.md`, `docs/naming-convention.md`, priset läst live ur radens Landing page och `products/<id>/dna.md` när hubben kopplas till en mapp (products.json på hub-id eller `creative_prefix`, register.json `spegling.kalla_hub` för CaraShell — aldrig gissat; break-even bara ur products.json). Skriver **EN rad Typ `Feedback` i hubben, titel `Brief review <rond>`** (engelska: bra / missat / **tre regler för nästa rond** — det varje briefskrivare läser innan nästa rond), **en engelsk kommentar på varje granskad rad med ett FEL** (aldrig annars), `products/<id>/feedback.md` när mappen finns, och **EN engelsk Discord-rapport per körning i `#problem-and-revisions-ads`** (samma kanal som `/notionkorning`; Axel pingas bara vid noll läsbara hubbar). Ingen status ändras, ingen brief skapas, inga påhittade siffror. Verktyget `tools/briefgranskning.mjs` mäter; sessionen dömer och skriver `<hub>.dom.json`; utdata `tools/output/briefgranskning/<datum>/`. Speglade hubbar stoppar även OPS-butikens namn (CaraShell, carashell.se) i copyn. **Fel mot anmärkning:** FEL = det redigeraren måste veta (namn/typ, butikens namn i annonsen, pris mot butiken, ❌-rad i tre-frågorstestet, video utan manus, bild utan textrader) och blir kommentar på raden; taggar, hypotes, källa, KPI och COPY CARD är skrivarens sak och blir bara Feedback-raden. **Torrkörd 2026-09-18 mot riktig Notion (läs-läget, inget skrivet):** 18 hubbar hittade — 4 (products.json:s arkiverade) svarar 404, 5 hoppas strukturellt (Matstrumpor, Creative Hub master, två Product test center, Customer support), en tom Termoskydd-dubblett, Kranskydd (senaste rond 13 dagar) — 7 hubbar med rond att döma, 78 briefer: Taköverdraget 16/9 ×24, IBC 17/9 ×9, Adventskalendern 17/9 ×9, Termoskyddet 18/9 ×9, MC-Kapell 18/9 ×7, Beltgrinder 18/9 ×9, Båtmotor 18/9 ×11; priset lästes live för alla sju ur Landing page i brödtexten. Med OPS-mallens krav som fel fick alla 78 fyra–sex fel — efter kalibreringen 9 fel (alla: `baverbutiken.se` i CTA-raden, Adventskalendern ×3 + Båtmotor ×6) och 69 med anmärkningar. Bäver-briefernas format: `Make:/Why:`-huvud, Hook- och Script-tabeller, tre-frågorstest med kolumnen `Competitor-signable?` där ❌ är rätt svar, `Rules` i stället för `Hard rules`, ingen KPI, ingen COPY CARD |
| `/ops-produkt <butik> <källänk>` | **Lägg till EN produkt i en BEFINTLIG OPS-butik** — Axel skickar länken till en Bäverbutiks-produkt som passar butikens nisch, och den hamnar där utan att en ny butik byggs. `factory/ops-produkt.mjs` skriver produktfilen ur källans `/products/<handle>.json` och skriver ut körraden. ⚠️ Körraden bär ALLA produktfiler med flit: startsidan, menyn och produktmallen byggs om ur produkterna i körningen, så med bara den nya filen försvinner butikens gamla produkt utan felmeddelande. Eget `creative_prefix`, eget `kalla:`-block, egen kampanj, egen hub och egen minut i rutinschemat per produkt. **Pixeln är fortfarande delad** — se `factory/FLERPRODUKT.md`. **Första körningen 2026-09-16: CaraShell → termoskyddet** (`carashell/termoskyddet`, prefix `CaraShellFront`, rutinplats 7 = 00:57 / 14:15 / 16:15, kampanjer `CARASHELL_SE_Termoskydd Husbil 211 × 171 cm` + `_NO_` PAUSED, minnet `products/carashell/termoskyddet/`, takskyddets flyttat till `products/carashell/takskyddet/`). **Ett bart `carashell` betyder takskyddet** (`butik.huvudprodukt: takskyddet` i butiksfilen, Axels beslut 2026-09-16 kväll: de befintliga rutinerna är takskyddets, termoskyddet får egna på `carashell/termoskyddet`). CaraShells fyra rutiner på `claude5@stonebite.org` byggdes dessutom om samma dag med `carashell/takskyddet` i prompten (se rutintabellen) — huvudprodukten är säkerhetsnätet så att ett bart `carashell` ändå fungerar, i en prompt eller för hand. ✅ **Termoskyddets hub + tre rutiner byggda 2026-09-16 förmiddag** av `/notionscalercs setup carashell/termoskyddet` på `claude5@stonebite.org`: Axel skapade hubben **"Termoskyddet" `3dd270ab-908c-8018-a927-c2e551f7de8a`** i workspace-roten 05:49 UTC (0 rader, inte i papperskorgen — verifierat med `databases/<id>/query` → 200), inskriven med `register.mjs notion`; rutinerna står i rutintabellen nedan (plats 7). ⚠️ Kampanjerna `CARASHELL_SE_` och `_NO_Termoskydd Husbil 211 × 171 cm` står PAUSED utan annonser — leveransrundan vägrar ladda upp tills en människa slår på SE-kampanjen (`ops-leveranskon` säger "VA:n slår på kampanjen först"), och nattvakten har inget att döma förrän annonser med prefixet `CaraShellFront_` finns. Hubben `BÄVER Termoskyddet för Husbil` `513270ab-…` är Bäverbutikens källhub, inte OPS-hubben. Lärdomarna: `factory/FAS2.md` + `FLERPRODUKT.md` 2026-09-16 |
| `/ny-marknad <butik> <LAND>` | **Lägg till en MARKNAD (land + språk + valuta) i en BEFINTLIG OPS-butik** — USA först (Axels fråga 2026-09-16, husbilsprodukterna). En rad i `butik.marknader` + en USD-rad i `ekonomi.marknadspriser` + en körning `--igen marknad,tema,oversatt,prislista,recensioner`. Landstabellen är `factory/lander.mjs` (EN tabell, inte sex kopior); temat är N-språkigt (`tema.localeBranch`, `TEMAORD`); `prislista.mjs` sätter fasta priser i marknadens valuta. Priset i ny valuta är ÄGARENS beslut — frågas om det inte ges. Ett land utanför Norden får `i_fraktraden: false` så den svenska texten (och den norska filen) inte ändras. Annonserna är ett eget spår: `/ny-annonser` steg 8b bygger en TOM US-kampanj i Magiborsten UK (`kampanj.mjs --tom`) och `/ops-oversatt <butik> --marknad US` fyller den varje dag. `factory/PROCESS.md` → "Marknad utanför Norden". **Första körningen 2026-09-16: CaraShell US** — marknad USA ACTIVE, `/en` live som amerikansk kund, takskyddet **$199.00 fast** (Axels pris; USD slogs på i admin under körningen, prislistan satte priset); termoskyddet **$99.00 fast** (Axels beslut samma förmiddag, svar på rapportens fråga; innan dess visade Shopify sin omräkning $59). Shopify skapade själv sidan "Dina integritetsval" (läckte på /nb också) — nu i `factory/shopify-sidor.mjs`; den och de andra lärdomarna står i PROCESS.md punkt 10–18. **Samma eftermiddag:** USA fick egen domän **carashell.com** (marknadsraden `doman:`, `opsmarknader.marknadslank` — länkar utan /en/), hello@carashell.com, **90-dagars garanti på engelska sidan** (Axels undantag från "alltid svensk lag", bara USA), "🇺🇸 Free shipping to the US" utan "Ships from Sweden", titeln "up to 21 ft". Vem som betalar returfrakten till Sverige är inte bestämt. **2026-09-17: GB, CA, AU, NZ i SAMMA marknad** (Axels order "samma annonser, lanserar i dag"): en egen domän hör till EN marknad i Shopify (mätt: `RESOURCE_NOT_FOUND`), så länderna ligger i USA-marknaden via `lander:` + `lokala_valutor: true` på US-raden — `currencySettings.localCurrencies` via API slog själv på AUD/CAD/GBP/NZD i Shopify Payments, priserna är Shopifys omräkning av de fasta USD-priserna (£152 / C$285 / A$286 / NZ$354 för takskyddet). Engelskan omskriven för fem länder — fraktraden bär tokens `[[flagga]] Free shipping to [[land]]` som `snippets/ms-landtext.liquid` byter mot kundens eget land (Axels beslut samma eftermiddag: en flagga, inte fem; trust-raden, marquee-sektionen och Dawns annonsrad är fabriksägda kopior sedan dess). Skatt/tull per land är ägarens (UK-moms ≤ £135, tull vid dörren i CA) — PROCESS.md punkt 22. ⚠️ `--igen marknad` respekterar sedan samma dag radens `doman:` (kopplade dessförinnan .se till USA). ⚠️ Annonslänkar per land med landets egen kod (`?country=GB`), aldrig `?country=US`. Axels beslut samma dag: UK-momsen löser han själv (sälj ändå), leveranstiden 5–10 gäller alla fem, kampanjerna kopieras från US per land |
| `/ops-bild <nyckel> [idé]` | **Bildannonser för en OPS-butik, på kommando:** idén → rader i butikens hub (Draft + IMAGE PROMPT) → kie.ai (`factory/ops-bild.mjs`) → bilden i `Filer och media` via REST (`tools/notion-fil-upp.mjs`) → tittad → `To be Reviewed` → live 13:40. Utan idé: genererar hubbens Draft-bildrader. `/bildannonser` rör aldrig OPS-hubbarna |
| `/rutin <kommando> <tid>` | Sätt upp en schemalagd rutin som faktiskt kör (fast session, rätt cron, inga dubbletter) |
| `/kundtjanst [--alla\|--brand <id>] [--discord]` | **Måndag 07:00, alla brands:** supportmejlen (Loopia/IMAP) + Shopify → återkommande toppärenden, chargeback-varningar, ranking 0–100 per brand, VA:ns lista på engelska. Läs-bara. `kundtjanst/README.md` |
| `/tvistkoll [--alla] [--discord]` | **Varje dag 07:00, alla brands:** bara Shopify-tvisterna → larm i Discord om någon har evidence-deadline inom 3 dagar. Sekunder, inga mejl, inga filer. Täpper luckan mellan veckorapporterna |
| `/kommentarer [--torr] [--timmar N]` | **Kommentarsgranskningen, varje dag 05:40, alla konton** (Axels beställning 2026-09-24: "granska kommentarsfält endast … invändningshantering … rapport om allvarliga grejer och nya leads på vinklar och hooks och invändningar"). `kommentarer/kor.mjs --hamta` läser ALLA nya kommentarer på alla annonser som visas (ACTIVE + spend 3 d) i MagiBorsten/NO/DK-OPS/UK/FI — Facebook via sidtoken + Graph **batch-API** (`?ids=` är avvecklat i v26), Instagram via `effective_instagram_media_id` — maskerar namn (`message_tags` → `@…`, e-post, telefon, adress, signatur), klassar med regler (🔴 ej levererat/bluff/hot/fara/spam/missnöjd köpare · 🟡 invändning per produkt · 🔵 köpfråga utan svar i tråden) och kopplar till verksamhet via **landningslänkens domän** → sida → konto (länk och sida som säger olika = ⛔ fel sida/pixel). Sessionen dömer (`output/<datum>.dom.json`: åtgärd per 🔴 med `falsklarm`, leads med **belägg** = kommentars-id, svarsförslag på varje kommentar utom tomma/taggar/spam (tak 30, Axels beslut 2026-09-25) skrivna av sonnet mot `svarsregler.md` + `produktfakta.md`, lagda på granskningssidan för träning), `--rapport --discord` skriver `kommentarer/rapporter/<datum>.md`, `kommentarer/leads.md` (`kalla=voc`, läses av `/cs` steg 1 och 3), `logg/<månad>.jsonl` + `lage.json` och postar en engelsk rapport per verksamhet i `#ad-comments` (VA:n pingas bara vid kundärenden, `allowed_mentions` låst). ⛔ **Läs-bart: svarar, döljer, raderar ALDRIG en kommentar, föreslår aldrig paus.** Mätt vid bygget: 188 unika kommentarer på 72 h (Bäverbutiken 91, CaraShell 97, varav IG 7), 2,5 min. **Oläst:** Majavakauppa-sidan `1317870104733246` (FI, token:en saknar sidrollen) och Matstrumpor (`META_ACCESS_TOKEN_MATSTRUMPOR` saknas) — står med orsak i varje rapport. Fönstret flyttas bara när allt lästes. `kommentarer/README.md`, VA:ns SOP "Ad comments — the morning report, and what you do" (`kundtjanst/va-sop/ad-comments.md`, i Notion) |
| `/autosvar --brand <id> [--torr\|--skarpt] [--discord] [--loop 60]` | **Kundtjänstverktyget som svarar själv (Axels uppdrag 2026-09-21), alla butiker:** brevlådans nya kundmejl → tre hinkar med rena regler — **ENKEL** (var är min order, leveranstid, adressbyte före leverans, öppettider) besvaras med fakta ur Shopify + 17TRACK, **ARG** (frustration, hot om bank/ARN/recension, "aldrig fått", trasig vara, tredje mejlet utan svar) får Axels lugnande rad inom en minut och flyttas till mappen `VA-PRIO`, **SVÅR** (retur, återbetalning, reklamation, tvist, fel vara, allt obelagt) flaggas bara. Skriver via Loopias webbmejl (`kundtjanst/webmail.mjs` steg 7–11: Roundcubes compose/send/mark/move/save-folder, avlästa ur källkoden 2026-09-21 och **mätta live samma kväll** i första torrkörningen: compose svarar 302 till sidan med `_id` (följs), och mapparna ligger under `INBOX.` så `VA-PRIO` heter `INBOX.VA-PRIO` — båda rättade; utkast, flagga och flytta stämde). **Första torrkörningen 2026-09-21 ~23:20 CEST på Bäverbutiken:** 48 mejl i 72-timmarsfönstret → 31 hoppade (Shopify-notiser, Judge.me), **3 ENKEL** (alla wismo, fakta ur Shopify — 17TRACK kände inte igen något av de tre spårningsnumren, så svaren bär skickdatum + spårningslänk), **1 ARG** (trasig vara → Axels rad, flaggad, flyttad till `INBOX.VA-PRIO`), **13 SVÅR** flaggade (9 "övrigt", varav 6 är svar på Shopifys kontaktformulär `Nytt kundmeddelande …`, 1 retur, 1 återbetalning, 1 bilaga). Fyra utkast i Drafts, noll skickat — **men bara två av dem rätt** (#5953 och det arga): de andra två gick till kunder VA:n redan svarat den 14 och 16 september, för trådbyggaren sökte bara första sidan av Skickat och svaren låg på sida 4 och 5 av 12 (576 mejl). Rättat samma kväll: `mappIndex` läser inkorg, Skickat och Drafts 30 dagar bakåt en gång per körning (~30 s), och `tolkaListdatum` läser Roundcubes visningsdatum så läsningen stannar vid fönstret. De två felaktiga utkasten (Drafts uid 8 och 10) står kvar — sessionen raderar aldrig — och originalmejlen är flaggade till VA:n. Räkningen "20 utkast i rad rätt" börjar alltså om från 2. ⚠️ Samtidigt (21:28:27 UTC) dök ett femte utkast i vår mall upp i Drafts, till ett Shopify-kontaktformulär som den här koden hoppar över — **en annan session körde autosvaret mot samma brevlåda i samma minut.** Två autosvar på en brevlåda är ett dubbelsvar som väntar på att hända: kör EN i taget. Järnregler som tester: ett automatiskt svar per tråd någonsin (Sent + Drafts + loggen `kundtjanst/autosvar/logg/<butik>.jsonl`, maskerad), ett per kund och dygn, aldrig på tvistord/bilagor/autosvar/listmejl/system/egna adresser, aldrig löften (`harForbjudet`), aldrig en annan kunds order, kundens språk (sv/nb/da/fi/en), signatur = butikens supportnamn. `--torr` = utkast i Drafts (standard; skarpt kräver `--skarpt`). Axels ordning var: `--torr` på Bäverbutiken tills 20 utkast i rad är rätt → skarpt en dag → alla butiker — **skrotad 2026-09-23 ~13:10 CEST, Axels beslut A: skarpt på Railway direkt** (räkningen stod på 1). Minut-servern (`--loop 60`) är samma kod; timrutinen på claude.ai byggs först när grenen är på `main`. Brandfiler för NO/DK/FI upplagda 2026-09-21 (`kundtjanst/brands/`): Bæverbutiken och Majavakauppa på Loopia, **Beverbutikken på Domeneshop** (MX mätt) — webbmejlen där är oprövad. MCP-verktygen `mail_reply/mail_draft/mail_flag/mail_move` finns i `loopia-mail`. **Rättat samma kväll av den andra sessionen (Fable, `claude/sharp-curie-f8m7wr` 84e5a85), efter läsning av alla sex utkasten:** Shopifys kontaktformulär (kunden i Reply-To, kundens ord under `Text:`) läses som kundens eget mejl (`autosvar/kontaktformular.mjs`, `forvantadTill`-spärren i `brevlada.svara`); trådar VA:n redan besvarat (References från egen domän eller vår adress i citatet, `redanBesvaradAvOss` — hängslen till `mappIndex`) får inget svar; passerat leveransfönster, inga skanningar 5 dagar efter skick, oskickad order äldre än packtid + 3 och tvist på ordern spärrar ENKEL (`staltFakta`, tvisterna läses en gång per körning); retur/återbetalning/fel vara/defekt ⇒ aldrig ENKEL; "skit"/"skräp"/"bluff" ⇒ ARG; X för defekt ("den trasiga varan" om en för liten vara) och återbetalning neutrala; "order" räknas inte som engelska; citatklippet klarar Outlook/BlueMail; trådnyckeln i loggen hashas (bar adressen i klartext — `autosvar/logg-maskera.mjs` rättade båda loggarna vid sammanslagningen). Ett av de fyra utkasten från 23:28 hade "Beräknad leverans: 2 sep–9 sep" den 21 september och "Hi Eric!" på ett svenskt mejl. **SOP-avstämd samma natt** (Axels order "läs igenom våra SOP:er": VA:ns Notion-databas "Bäverkoppling.se", först 34 PDF:er via kopian `3aa270ab-…`, sedan de elva sista ur originalet `333270ab-…` när Axel bjudit in "Bäverbutiken RUTINER" samma natt — alla 42 lästa): WISMO säger var paketet ÄR (ombud med kollinummer, ute för leverans, framme i landet + 1–2 arbetsdagar, stilla spårning är normal), levererat-men-inte-mottaget får SOP 06-checklistan i stället för ARG, skadad/fel vara får bildförfrågan i ARG-svaret, saknad bekräftelse ⇒ skräppost-raden, företagsuppgifter (SOP 38) ur `svar.foretag`, "be om ordernumret" (SOP 36 steg 1) bakom `svar.fraga_ordernummer` (av); de elva sista gav: stilla spårning som kunden själv nämner ⇒ lugnande raden även vid färsk skanning (SOP 02), fel antal och "ser inte ut som på bilden" ⇒ `fel_vara` (SOP 07/15/34, bildförfrågan i ARG-svaret), byte ⇒ SVÅR (SOP 21), produktspecifika SOP:er (13/16/17/35) gäller Bäverkopplings kontakter, inte Bäverbutiken. Tabellen i `kundtjanst/README.md`. **Kalibreringen 2026-09-22 (Axels dom: "jag tyckte inte riktigt att han verkade så himla sur, Jan-Olof"):** ARG är riktig ilska (ordval, eskaleringsord, bankhot, versaler, utropstecken, tredje mejlet) — kategorierna `ej_levererad`/`skadad_defekt` räknas inte längre; lugn trasig/fel/för få varor ⇒ ENKEL `foton` (beklagan + tre bilder + ordernumret om det saknas, flaggad + VA-PRIO), lugnt "aldrig fått" ⇒ WISMO, byte/storlek ⇒ SVÅR (SOP 21); det arga svaret bär läget ur spårningen ("Det här ser jag just nu om din order …") när faktan är färsk; **kunden är VA:ns i 14 dagar** efter VA:ns senaste mejl till adressen, oavsett tråd (Ulf svarade på en Judge.me-förfrågan medan VA:n hade mejlat honom fyra gånger). `--igen` = kalibreringsläge (bara torrt). ⚠️ Samma natt hittad och rättad: Roundcube svarar med en TOM lista för en mapp som inte finns, så trådbyggaren tog aliaset `Sent` (0 rader) och läste aldrig `INBOX.Sent`/`INBOX.Drafts` — Skickat- och Drafts-vakterna var blinda live, bara loggen höll; `brevlada.losMapp` slår nu upp namnet och kastar `MAPP_SAKNAS`. Tre `--igen`-körningar ~01:10–01:25 CEST: 50 mejl, 5 utkast kvar i Drafts (Hans WISMO; Tobias, Morgan, Tony, Peter ARG), Ulf och Jan-Olof till VA:n; gårdagens fyra felaktiga utkast (Eric tvist, Kamera-tråden besvarad, AnnChristin retur, Jan-Olof) är alla rätt nu. **Axels feedback på de fem utkasten samma natt, allt inlagt (`kundtjanst/README.md` → "Axels feedback på utkasten 2026-09-22"):** ARG börjar aldrig med "jag eskalerar detta" utan med hälsning + "Jag förstår helt din frustration" + problemet i klartext, minst lika argt som kunden ("En produkt som inte alls ser ut som på bilden är helt oacceptabelt, och det är inget vi står för"), sen "eskalerat … som ett brådskande ärende — svar inom de kommande dagarna", "har du mer information … svara" + bilderna; X är hela meningar per ärende (`som_pa_bilden`, `kvalitet`, `opostad(n)` = "legat opostad i 13 dagar"); **returinformationen direkt** när kunden vill returnera (Peter) — VA:ns egna returmejl som förlaga, adressen ur `tvister.returadress` (nu hela), fraktkostnaden bara när `returfrakt_betalas_av` är ifyllt (Bäverbutiken: `kund` sedan 2026-09-21 ur retur-SOP:en, commit `9cfa779a` — så returmejlet säger "Returfrakten står du själv för"; testet krävde tomt och blev rött på `main` efter mergen av PR #113 + #116, rättat 2026-09-22 kväll); **WISMO utan avsändningsdatum, fraktbolag för första sträckan, "framme i Sverige" eller ort** — bara "ligger hos DHL för sista biten, 1–2 arbetsdagar", bävernumret i klartext och länken (Hans). Löftesspärren ignorerar länkar (policylänken heter refund-policy). Femte körningen 01:58: 3 utkast (Tobias, Morgan, Juan #6504 retur). ⚠️ Tony, Peter och Hans hade VA:n redan svarat på MÅNDAGEN (Skickat 13:09/11:03/12:33 CEST, före första kalibreringskörningen) — tre av de fem utkast Axel läste gick till redan besvarade kunder, för Skickat-vakten var blind (mappbuggen) tills fjärde körningen; nu "tråden har redan ett svar från oss" ⇒ inget utkast. **Andra feedbackrundan samma natt (Tobias, Juan, Morgan — "du är fan kung"):** inga tankstreck i mejl (testet felar på ett enda "—"/"–"; intervall skrivs "1-2 arbetsdagar", "24 sep till 1 okt"), "svar inom 48 timmar" (`svar.eskalering_timmar`), ordernumret efterfrågas när det saknas (ARG hämtar alltid faktan), returen säger "posta direkt till adressen, inte till ett ombud — vi hämtar inte ut paket från ombud". Returfönstret: SOP 18 och policyn sade 30 dagar från mottagandet (EU:s 14 dagars ångerrätt parallellt) — **Axels beslut 2026-09-22 (B): 14 dagar**, `tvister.returfonster_dagar: 14` i brandfilen; policysidan i Shopify och SOP 18 i Notion sade 30 vid beslutet — **båda 14 sedan 2026-09-23** (Axel ändrade sidan själv, mätt samma dag: noll "30 dagar" på `/policies/refund-policy`; SOP 18 pekar på Store facts). Ingen sida i butiken säger 30 längre. Utkastet "Niklas Hurtig" i Drafts är från 2026-08-19 och inte autosvarets. **Bilderna följer felet, inte kategorin** (rutinens första utkast 2026-09-22 kväll: Hans bränslepump "läcker och pumpar dåligt" fick "leveransen inte blev som den skulle" + fraktetiketten): `svar.fotonTypFor` ⇒ `vara` (funktionsfel-ord, inget om paketet: "varan inte fungerar som den ska" + bild eller kort video på felet) eller `leverans` (fel vara, "kom fram trasig", förpackningen nämnd, oklart: varan + förpackningen + fraktetiketten som förut); loggraden bär `fotonTyp`. ⚠️ **Två bottar på Bäverbutikens brevlåda 2026-09-22 kväll:** Railway-vakten (PR #126, `/halsa` → `autosvar.kor: true` sedan 21:30 UTC, varje minut) OCH timrutinen :10 på Barkås-kontot (PR #127, `trig_01KiQ9zHevZDMpkSbB3Ue6sM`) — byggda av två sessioner samma kväll utan att se varandra. Båda torra, Drafts-vakten stoppar dubbletter i normalfallet, men regeln är EN bot per brevlåda: när vakten är på ska timrutinen av (Axels klick i Routines-vyn på Barkås). 263 tester. **För en dashboard (Axels fråga 2026-09-22, en annan session bygger den):** datakontraktet står i `kundtjanst/autosvar/DASHBOARD.md`, siffrorna ur `node kundtjanst/autosvar/oversikt.mjs --alla --json` (läser bara loggen, senaste raden per Message-ID vinner). Dashboard-sessionen kör ALDRIG `autosvar.mjs` (en session per brevlåda), skriver aldrig i loggen, raderar aldrig mejl |
| `/klaviyo <kolla\|bygg\|ladda-upp\|rapport\|cs>` | **E-postmarknadsföringen i Klaviyo** (Bäverbutiken, konto `QZ4jLG`, byggd 2026-09-24): innehåll → byggda mejl med live-priser → segment, mallar, kampanjer och flöden i Klaviyo, ALLTID som utkast. `cs` = veckoloopen (rapport → lärdom → nya koncept). `klaviyo/README.md` |
| `/mejl` | **Bäverbutikens kundmejl** (orderbekräftelse, leverans, återbetalning …) med erbjudandet "köp igen → välj en gratisprodukt" — bygger mallarna ur Shopify, publicerar sidan Axel klistrar från. `mejl/README.md`. **Andra butiker:** `node mejl/bygg-butik.mjs <id>` (eller `npm run mejl:butiker`) bygger de tre fraktmejlen för CaraShell/NO/DK/FI utan gratisprodukt-block, med butikens logga, färger, språk (`mejl/sprak/<kod>.json`) och paketprefix — Cowork-prompten i `mejl/output/butiker/<id>/COWORK-PROMPT.md`. Byggt 2026-09-20 sen kväll efter Axels dom på Coworks lappade CaraShell-mall ("tvääär fula"): hela mallen byts, aldrig rader i Shopifys standardmall |
| `/sparning` | **Varje timme (:16), två saker i en körning:** (1) Bäverbutikens skickade ordrar (14 dagar) → spårningsnumren registreras hos 17TRACK → senaste skanningen skrivs in i Shopify som **fulfillment-event** med svenskt meddelande, vilket får notiserna Ute för leverans/Levererad att gå ut (de triggas av just de eventen; mätt 2026-09-18: 0 av 500 ordrar hade något leveransevent från fraktbolagen). (2) Bygger om **kundens spårningssida https://baverbutiken.se/pages/spara** — hela kedjan på svenska med ort och tid ("17 sep 23:28 · Paketet är levererat i din brevlåda · Umeå"), ända tillbaka till avsändaren i Kina. ⚠️ **Shopifys orderstatussida kan inte visa det** (Axel 2026-09-19: "den visar inga detaljer") — den ritar tre streck med datum, utan orter och utan historik, hur mycket rutinen än skriver in. Därför den egna sidan; Axels beslut samma dag, valt ur två alternativ. Uppslaget går på **spårningsnummer, aldrig ordernummer** — ordernummer är sekventiella och lätta att gissa, och då hade vem som helst kunnat se var någon annans paket är. Datan bär inga namn och inga adresser. Mejlets knapp bär numret, så kunden slipper skriva. Motor: `sparning/kor.mjs` (`--torr`, `--kolla`, `--dagar 14`, `--max 150`, `--ingen-sida`), `sprak.mjs`+`fraser.json` (78 nycklar, avlästa ur 204 riktiga paket — fraktbolagen skriver engelska och VERSALER), `paketdata.mjs`, `sida.mjs`, `publicera.mjs` (trippelkoll mot kundens publika vy). ⛔ **Orderfönstret var 14 dagar och åt upp de paket kunderna faktiskt slår upp
— rättat till 30 dagar 2026-09-22** (Axel: "legit inga paket går ju att spåra").
Frågan mot Shopify filtrerar på **`created_at`** — när ordern LADES — men ett
paket är på väg 5–10 arbetsdagar. Ordern föll alltså ur fönstret medan paketet
fortfarande rullade, och eftersom minnet bara innehåller det som EN GÅNG kommit
in genom den dörren kom paketet **aldrig** in. Det drabbade precis de kunder som
hör av sig: de som väntat längst. Mätt samma natt: order **#6243** (lagd och
skickad 31/8, 22 dagar gammal) fanns inte i minnet alls, och på 60 dagar var
**1 747 av 2 880 paket oregistrerade**. Med 30 dagar: 2 066 ordrar, 1 917 paket,
784 oregistrerade — alla registrerade samma natt utan att 17TRACK avvisade en
enda. ⚠️ **Då small nästa tak: Shopify tar max 512 kB per sida, och datan ligger
I sidan.** Med 2 044 paket vägde den 873 kB och Shopify svarade "Content is too
big" — rundan publicerade ingenting alls. Bygget **krymper sig därför självt**
i stället för att falla: levererade paket offras, ÄLDST FÖRST, tills datan får
plats (`DATATAK_B` i `publicera.mjs`). Paket som fortfarande rullar rörs aldrig,
hur trångt det än blir — det är dem kunden slår upp. Första körningen: 644
levererade bort, 1 400 paket kvar, 485 kB, grön trippelkoll. **Nästa steg när
det blir trångt igen: flytta spårningsdatan ut ur sidan till en temafil.**

⛔ **Beräknad leverans var för tidig för var tredje paket — rättat 2026-09-22**
(Axels iakttagelse). Fönstret är ankaret + 7–14 kalenderdagar, och **ankaret är
första skanningen i "Paketet är på väg"**. Mätt på 879 levererade paket är det
ankaret rätt: median 10,1 dygn till leverans (p25 9,2 · p90 12,2), och 7–14
träffar **96 %**. ⚠️ Men hade paketet ännu inte nått "på väg" användes
**bokningen** som ankare, och koden påstod att fönstret då blev "försiktigt
brett, inte snävt". Det var bakvänt — ett TIDIGARE ankare ger ett TIDIGARE
datum. Dröjsmålet bokning → första rörelse är i median **4,1 dygn** (p25 2,6 ·
p90 7,3), så de paketen fick ett löfte fyra dygn för optimistiskt, och det
gällde **383 av 1 165** paket på väg — var tredje. Fallbacken lägger nu på det
mätta dröjsmålet (`DROJSMAL_DYGN` i `sida.mjs`); ett test jämför två paket med
samma tidsstämpel, det ena som rörelse och det andra som bokning.
⚠️ **Mät om dröjsmålet när fraktvägen ändras** — det är ett mätvärde, inte en
konstant någon valt. ⚠️ Och mät mot KODENS ankare: min första mätning räknade
från paketets första skanning och sa att 58 % kom fram för sent. Den var fel;
med rätt ankare är det 2 %. En mätning som inte speglar koden mäter ingenting.
⚠️ **Höj inte fönstret utan att tänka på kvoten:** varje nytt paket i fönstret
kostar en 17TRACK-registrering, och `--max` (150/körning) är det enda som
bromsar. ⚠️ Registreringen tar **nyast först**, så de äldsta paketen — de som
väntat längst och som kunden slår upp — kommer SIST i kön.

⛔ **`npm test` publicerade över kundernas spårningssida — rättat 2026-09-21.**
Klockan 21:44 UTC låg https://baverbutiken.se/pages/spara live med **ett enda
paket**, `YT0000000000000`, som är testets eget låtsasnummer. Varje kund som
slog upp sitt paketnummer fick "Vi hittar inte det numret" — Axel upptäckte det
själv. Orsak: `sparning/test/publicera.test.mjs` kör `publicera.mjs` **skarpt**
i en temp-kopia som bär den RIKTIGA `konfig.json` (samma butik, samma handle
`spara`), och ett test släpper med flit förbi spärren mot en tom sida. Testets
egen kommentar antog att "utan nycklar faller körningen senare (Shopify)" — och
det antagandet är falskt i varje container som HAR nycklarna, alltså
rutinernas och sessionernas. Sidan byggdes om samma kväll (1 292 paket,
13 656 händelser, trippelkollen grön). **Spärren sitter nu i skriptet, inte i
testet:** `SPARNING_INGEN_PUBLICERING=1` i miljön låter körningen gå precis som
en skarp — samma klient, samma spärrar, samma utskrifter — men stannar exakt
före `pageCreate`/`pageUpdate`, och ett eget test bevisar det. ⚠️ Två vägar som
INTE fungerar (båda provade): ta bort `SHOPIFY_*` ur miljön (butik.mjs kastar
innan spärrarna kört) och ge dem falska värden (token-anropet ligger före
spärrarna). **Lärdomen är repots egen regel igen: skriv aldrig en mätning som
en evig lag.** "Utan nycklar" var sant i den container testet skrevs i, och
falskt i alla andra. Ett test som kör produktionsskriptet skarpt mot riktig
konfig måste göra skrivningen omöjlig, aldrig osannolik.

⚠️ **Skanningarna sparas ALDRIG i `lage.json`** — 0,7 MB per commit, 6,3 GB git-historik på ett år (räknat 2026-09-19). De skickas via den gitignorerade `sparning/output/paket.json`. Bygg aldrig in dem i minnet. ⚠️ Sidan bär fler paket än rundan skriver event för: resten läses ur minnet (60 dagar) utan registrering — ett paket som varit på väg i tre veckor är precis det en kund vill slå upp, och att läsa är gratis hos 17TRACK. Kräver `TRACK17_API_KEY` + Shopify-appen "bäver email" med `write_fulfillments` och `write_content`. Kvoten köps per paket i 17TRACK-panelen (~87 paket/dag). **Kundens vy sedan 2026-09-20 kväll (fem beslut av Axel samma dag, mergat till `main`):** fem punkter *Ordern är mottagen → Paketet är på väg → Hos fraktbolaget → Ute för leverans → Levererat* med delsteg som säger var paketet faktiskt är (`delsteg.mjs`), **aldrig ett land i vyn** (ingen "till Sverige", ingen "Framme i Sverige", och **ingen "Mer information"-historik** — beslut B, den räknade upp Kina rad för rad); **bävernummer `BB-XXXXXXXX`** i stället för YT-numret (`sparning/bavernummer.mjs`: SHA-256 av spårningsnumret, räknas — genereras och lagras inte — så Shopifys mejlmall räknar samma nummer med Liquid `sha256`, kundtjänst med `node sparning/baver.mjs <order|YT…|BB-…>`); "Hämta ditt paket" med ombudets nummer och länk BARA vid `READY_FOR_PICKUP` (`sistabiten.mjs`); beräknad leverans 7–14 dagar ur `mejl/konfig.json`; **upsell under paketet** (Axels beslut samma kväll): svart block "Vinn en gratisprodukt" med stor röd knapp **Få en gratisprodukt** → lyckohjulet `/pages/din-gratisprodukt`, "Spåra ett annat nummer" liten under — belopp/adress ur `mejl/konfig.json` `erbjudande`+`hjul`, aldrig en rabattkod i länken. Mejlmallarna v11 (bävernumret under knappen) och menylänken "Spåra paket" i header + sidfot är klick i admin utan API — `mejl/COWORK-PROMPT.md`, körs av Cowork. **Alla butiker sedan 2026-09-20 kväll (Axels order "lägg in spårningssystemet i alla"):** `/sparning <butik>` med registret `sparning/butiker.json` (Bäverbutiken standard i `sparning/`, de andra i `sparning/butiker/<id>/`), egen Shopify-klient per butik (`sparning/butik.mjs`), språklager `sparning/oversatt.mjs` + `sparning/sprak/{nb,da,fi}.json` (hela kedjan byggs och kontrolleras på svenska, varje mening byts i sista ledet; testet kräver täckning), bävernumrets prefix per butik (CaraShell `CS-`). **CaraShell live samma kväll** (https://carashell.se/pages/spara, 141 registrerade, 140 paket) med egen timrutin; **mejlmallar + meny klara samma kväll via Cowork** (tre fraktmallar → `/pages/spara?nummer=CS-…`, Main + Footer menu, testmejl; hello@carashell.se verifierades under körningen; Shopifys knapp "Spåra order med Shop" står kvar — Axels beslut, `sparning/cowork/carashell.md` → Utfall). **NO och FI live samma kväll (21:48–21:50 CEST)** efter att Cowork gett apparna rättigheterna i Dev Dashboard: https://beverbutikken.no/pages/spor (438 paket, 150 registrerade första rundan, 145 event) och https://majavakauppa.fi/pages/seuranta (7 paket, 5 event), timrutiner på :32 resp. :40 (rutintabellen). **DK live 22:31 CEST** efter Axels installationsklick: https://baeverbutiken.dk/pages/spor (1 order, 0 skanningar — publicerad tom som första sida; `publicera.mjs` släpper igenom en tom sida BARA när `konfig.lage.sida_publicerad` saknas, aldrig som ersättning), timrutin på :48. Mejl + meny per butik: `mejl/output/butiker/<id>/COWORK-PROMPT.md`. **NO:s tre mallar + meny + testmejl klara 2026-09-20 sen kväll** (Cowork, mallarna verifierade identiska mot servern; avsändaren var Beverbutikken@gmail.com — Gmail godtas inte som avsändare, Axel bytte till **support@beverbutikken.no** och verifierade; sidfoten i mallarna ombyggd med den adressen, Cowork kör om). Avsändarna i NO, DK, FI och CaraShell verifierade av Axel samma kväll. **2026-09-21 ~01:30: NO, DK och FI klara** (Cowork, alla mallar verifierade mot servern, testmejl OK, DK-menyn inlagd). FI-adressen är `asiakaspalvelu@majavakauppa.fi` (Axels beslut B 2026-09-21; mallarna ombyggda och inne på servern 07:34, testmejl OK — **Finland klart**). **CaraShells fyrspråkiga mall inne 2026-09-21 ~08:00** — Coworks klassificerare stoppade skript i auto-läge två gånger, så Axel klistrade in filerna själv och Cowork verifierade mot servern (`cowork/carashell.md` Utfall 3–6; lärdom: mallens id i adressfältet är markören, `shipment_out_for_delivery` ≠ `local_out_for_delivery`). **Alla fem butiker klara: sida + timrutin + mejl + meny.** **Matstrumpor tillkom 2026-09-21** (Axels beställning, uppdraget i `sparning/PROMPT-matstrumpor.md`): https://matstrumpor.se/pages/spara live 09:36 UTC (59 ordrar/14 d, 59 registrerade, 48 paket, 640 händelser, 48 event, 0 fel, 0 okända fraser, trippelkollen grön), prefix `MS-`, timrutin på :56, brandet avläst ur butikens tema (orange `#dd821d`, sushi-loggan). **Inget steg 0 behövdes** — nycklarna `SHOPIFY_CLIENT_ID/SECRET_1r46tp_qx` fanns redan och hör till fabrikens app "Fabriken" (154 rättigheter). ⚠️ `SHOPIFY_SHOP_1r46tp_qx` bär domänen med understreck — registret är facit. ✅ **Mejl + meny klara — verifierade 2026-09-22** (`sparning/cowork/matstrumpor.md` → Utfall): de tre mallarna låg redan identiska på servern sedan 2026-09-21 17:57–18:01 UTC, raden `Spåra paket → /pages/spara` fanns i båda menyerna, testmejlet gick fram med knappen **Spåra paketet** → `?nummer=MS-…`. **Alla sex butiker klara: sida + timrutin + mejl + meny.** ⚠️ Lärdomen: `meny_klar` stod `false` och Utfall-avsnittet tomt i ett dygn medan Shopify hade allt — någon gjorde jobbet utan att skriva tillbaka. Kolla servern innan du ber Axel om ett klick; en flagga i repot bevisar ingenting åt något håll. Prompten per butik utan huvud: `mejl/output/butiker/<id>/PROMPT.txt` (råfilen på GitHub → Ctrl+A, Ctrl+C → Cowork). **Sidans brand följer butiken** (`mejl/butiker/<id>.json`, samma fil som mejlen) sedan 2026-09-20 sen kväll — före det gick CaraShells sida live med Bäverbutikens röda Impact-versaler. **CaraShell är flerspråkig sedan samma kväll** (Axels fråga "hur gör du med språket?"): sidan bär sv/nb/en/fi i samma Shopify-sida och byter på dokumentets `lang` (`/nb` → norska, carashell.com → engelska, `/fi` → finska; registret `sprak_extra`, `sparning/sprak/en.json`, tidszon `auto` för engelskan), och fraktmejlen är EN mall som väljer språk på leveranslandet (`{% case shipping_address.country_code %}`, registret `mejl_marknader`, 41 kB). Shopify har EN avsändare per butik — Axels beslut: **hello@carashell.com** för alla marknader (`byt_avsandare` i brandfilen ⇒ steg 0 i Cowork-prompten; kundens svar till .se måste vidarebefordras till .com — Axels klick hos mejlleverantören). Leveranslöftet 7–14 dagar mätt samma kväll: Bäverbutiken median 11,1 / p90 13,0 dagar på 133 paket (två dygns urval) — mät om efter två veckor innan det ändras. `sparning/README.md` → Fler butiker |
| `/lagerrensning <produktlänk …>` | **Kopiera lagerrensnings-sidan (listicle) till en ny produkt — direkt in i butiken.** Flera länkar = en sida per länk, en produkt i taget hela vägen, commit efter varje (Axel klistrar in fem åt gången).  motorhöljets GemPages-export (`listicle/mall/`) → ny copy **skriven av huvudsessionen (Fable), med läsbarhetstest** (Axels beslut 2026-09-16 — undantag från regel 6), produktens riktiga pris/jämförpris ur produktsidan, produktbilder eller kie.ai-bilder (läggs på Shopifys CDN) → **sidan `/pages/<slug>-lagerrensning` i butiken, utan header/footer/meny** (Axels beslut 2026-09-16 kväll: "skippa GemPages-delen, det är jättedyrt när jag ska installera GemPages på varje enda butik"). `listicle/butik.mjs` skriver tre temafiler en gång per butik (`layout/listicle.liquid` — ren layout med `content_for_header` kvar så pixlarna följer med, `templates/page.listicle.liquid`, `assets/listicle.css`), skapar/uppdaterar sidan via API och läser den tillbaka som kund (ingen header, ingen footer, ingen meny). `--butik baverbutiken` (standard för baverbutiken.se-länkar; appen "Bäver uppladdare" fick `write_themes` + `write_content` av Axel 2026-09-16) eller ett OPS-id. `--gempages` ger dessutom `.gempages`-filen (tillval). Skärmdumpar desktop + mobil tas offline och tittas på av sessionen. Prisspärr: inga andra siffror än produktsidans, inga procent. **Obrandad som standard** (sidan ska funka om en annan butik publicerar den för samma produkt) — "Anders på lagret", ingen logga, bara "OBS: Detta är reklam." i sidfoten, inget butiksnamn i copyn (motorn stoppar det), knapparna relativa `/products/<handle>`; `--brand baverbutiken` bara på Axels begäran. Länken får vara OPS-butikens egen produktsida (`carashell.se/products/takskyddet` + `--butik carashell`) — då är knapparna redan rätt handle; en Bäverbutiks-länk in i en OPS-butik slår upp handlen ur `factory/produkter/`. Copyn får inte nämna källbutikens namn heller (`butiksOrd`, porterat från takskydds-sessionen). Live 2026-09-16: https://baverbutiken.se/pages/axelbalte-for-trimmer-lagerrensning, https://carashell.se/pages/takoverdrag-husvagn-husbil-6-5-3-m-lagerrensning (tema "CaraShell – CRO v1") och samma sidor i Bäverbutiken för CaraShells två produkter: https://baverbutiken.se/pages/takoverdrag-husvagn-6-5-3-m-lagerrensning och https://baverbutiken.se/pages/termoskydd-husbil-211-171-cm-lagerrensning (samma copy och bilder som CaraShell-sidorna — kie-bilderna ligger på Bäverbutikens CDN så cachen träffar utan nya credits — men lyckas- och riskfritt-blocken anpassade till Bäverbutikens produktsida: 30 dagars öppet köp, fri frakt inom Sverige. En produkt i två butiker får två sidor med varsin produktlänk; annonserna pekar aldrig korsvis, då hamnar köpen på fel pixel. Receptet: kopiera `copy.json` + `bildplan.json` + `bilder.json` från källbutikens utdatamapp till den nya handlens mapp, anpassa mot den nya produktsidan, `--torr`, skarpt). **Marknadsversion `--marknad US` (Axels fråga samma kväll: "en version som passar för carashell.com — samma Shopify-butik, bara markets och olika språk"):** samma sida får en ÖVERSÄTTNING via Shopifys Translations API (ingen dubblettsida), copyn i `copy.en.json` skriven mot marknadens egen produktsida (carashell.com: $199/$249 resp. $99/$124 i USD, 90-day guarantee, free shipping to the US, mått i tum), språklagret `listicle/sprak.mjs` byter de fasta texterna och prisspärrens valuta, knapparna får marknadslänken med `?country=US`, och sidan läses tillbaka på marknadens domän med krav på rätt språk. Live 2026-09-16: https://carashell.com/pages/takoverdrag-husvagn-husbil-6-5-3-m-lagerrensning?country=US och https://carashell.com/pages/termoskydd-husbil-211-171-cm-lagerrensning?country=US. ⚠️ Containern går ut på nätet från USA, så carashell.se skickar dig vidare till .com (302) — läs svenska sidor med `?country=SE`; motorns svenska kontroll gör det själv. **Länder inom marknaden `--marknad US --land GB|CA|AU|NZ` (Axels fråga 2026-09-17):** i Shopify är UK/Kanada/Australien/Nya Zeeland länder i marknaden USA med lokal valuta och automatisk kursomräkning (en marknad, mätt samma dag) — så landet får en EGEN sida (`<handle>-gb` … läst med `?country=GB`), och priset skrivs som **prisplatser `[[PRIS]]`/`[[JAMFORPRIS]]` som butiken byter vid varje visning** i besökarens valuta (`templates/page.listicle.liquid` + `layout/listicle.liquid` slår upp `all_products[data-lp-produkt]`) — kursen rör sig dagligen (Axels skärmdump NZ$354, sidan NZ$355 samma dag), så en inbränd siffra hade ljugit. Copyn per land (`copy.en-GB.json` …): GB/AU/NZ säger caravan, AU/NZ utan månadsnamn (södra halvklotet). Live 2026-09-17: `…-lagerrensning-gb?country=GB`, `-ca?country=CA`, `-au?country=AU`, `-nz?country=NZ` på carashell.com. **Handlen läses ur `plan.json`** när sidan redan finns — produkttiteln ändrades samma dag (nio storlekar 5,5–13,5 m) och hade annars gett en ny adress; SE- och US-copyn rättade för nio storlekar. ⚠️ PR #88 mergades 09:11 med GemPages-versionen; butiksvägen ligger i PR #89 — en session som klonade `main` däremellan byggde en `.gempages`-fil för takskyddet (gren `claude/upbeat-hawking-8eacfe`, copyn återanvänd här). Utdata `listicle/output/lagerrensning/<handle>/`. `listicle/README.md` |
| `/vi-testade <produktlänk>` | **"Vi testade PRODUKTEN i N dagar" — samma mall och motor som `/lagerrensning`, koncept `vi-testade`** (`listicle/koncept/vi-testade.json`), sidan `/pages/<slug>-vi-testade`. Perioden väljs efter produkten (Axels regel 2026-09-16: skydd/överdrag = en hel vinter/säsong med jämförelsen "vad hade hänt utan den", redskap = en hel sommar, förbrukning = 14–30 dagar, teknik = 30 dagar) — tabellen står i kommandofilen; motorn varnar om rubriken saknar perioden. Inga påhittade mätvärden: enda siffran är priset. Fem punkter i tidsordning (dag 1 → första gången det spelade roll → utan den → det som förvånade → domen). Författarrad "Anders, som testade den själv". Kommandofilen bär bara det som skiljer — järnregler, läsbarhetstest och stegen är `/lagerrensning`s |
| `/anledningar <produktlänk> [7]` | **"N anledningar till att …" — samma mall och motor, koncept `anledningar`**, 5 punkter som standard, 7 när Axel skriver `7` (motorn klonar mallens punkt 4/5-sektioner till punkt 6/7 med nya id:n och ikonerna 6/7). Sidan `/pages/<slug>-5-anledningar` eller `-7-anledningar` — båda kan ligga uppe samtidigt. Axels fråga 2026-09-16 (5 eller 7? ingen data avgör): rekommendationen är att bygga båda och låta två annonsgrupper avgöra. Anledningarna = produktens bevisade vinklar i fallande ordning; vid 7 måste punkt 6–7 bära eget problembyggande, annars fem. Motorn varnar om rubriken saknar antalet |
| `/listiclar <produktlänk> [5 7] [--butik id]` | **Alla tre listiclarna för en produkt i ett svep** (Axels fråga 2026-09-16: "går det bra att skicka alla tre kommandon samtidigt?" — ja): kör `/lagerrensning`, `/vi-testade` och `/anledningar` efter varandra, tre olika copyn (ingen delad mening, tre olika hero-löften), delade bilder (kopiera `bildplan.json` + `bilder.json` mellan koncepten så kie körs en gång), tre sidor i butiken, en commit. Stoppar en sida byggs de andra klart och stoppet rapporteras |

### Nattrutinerna

Kör automatiskt som Routines på claude.ai. **De klonar `main`** — ligger
kommandofilen kvar på en gren hittar rutinen den inte och ger upp direkt.
Merga alltid till `main`, annars är rutinen bara schemalagd, inte igång.

| Tid (svensk) | Cron (UTC) | Rutin | Kommando |
|---|---|---|---|
| 04:15 | `15 2 * * *` | Daglig NO-videobatch | `/translate-no` |
| 05:30 | `30 3 * * *` | Norska recensioner | `/no-recensioner` |
| 20:00 | `0 18 * * *` | Bildannonser | `/bildannonser` |
| 13:20 | `20 11 * * *` | Leveransrundan | `/notionkorning` |
| 15:00 | `0 13 * * *` | Översättning till Norge (bild + video ur Notion-kön `SE-ACTIVE to be translated`) | `/oversatt NO` |
| 06:00 | `0 4 * * *` | Commission | `/commission` |
| 07:30 | `30 5 * * *` (CEST) / `30 6 * * *` (CET) | **Tvistkoll varje dag, alla brands** — bara Shopify-tvisterna, larm i Discord `#customer-service` om någon har evidence-deadline inom 3 dagar. Byggd 2026-09-13 (Axels beslut, valt ur tre alternativ: "måndag + en snabb tvistkoll varje dag"): trigger `trig_01U2B4NNLZeUrALU2cjsfene`, fast session `session_01QbqN9S3Ysq53fPemrAc24L` (repot som källa, `main` som utgren), tagg `routine:tvistkoll`, inga connectors. Första körningen 2026-09-14 ~07:38. **Varför den finns:** veckorapporten går bara måndag 07:00, så en tvist som kommer in på tisdag med deadline på torsdag hinner gå ut. ⚠️ **Rättat 2026-09-20:** larmet sa "an unanswered dispute is lost automatically" — det är FALSKT för inquiries. Mätt på 50 tvister: inquiries 29 av 29 avgjorda vunna (100 %), chargebacks 1 av 4; alla tre förluster någonsin var chargebacks. En obesvarad inquiry förloras inte på plats, den **eskalerar till chargeback** med ny deadline (#4914, #5044, #4706 gick den vägen och rapporterades felaktigt som förlorade 2026-09-18/19). Larmet sorterar därför chargebacks överst och pekar på trackingen först vid "not received". Skriver ingenting i repot och pushar aldrig; tiger när inget brådskar. Mätt vid bygget på Bäverbutiken: 47 tvister, 14 öppna, 1 brådskande | `/tvistkoll --alla --discord` |
| Måndag 07:00 | `0 5 * * 1` (CEST) / `0 6 * * 1` (CET) | Kundtjänst veckorapport — alla brands, ranking, Discord `#customer-service` per brand. **Byggd 2026-09-12 kl 22:23 CEST:** trigger `trig_01RJ8wghS6cRniZF79q2XcXd`, fast session `session_01QJFX7V6zRaFPr8GXoBa9H8` (repot som källa, `main` som utgren), tagg `routine:kundtjanst`, inga connectors (`CONNECTORS: inga`). Första körningen måndag 2026-09-14 07:02. Byggd efter att PR #71–#73 mergats till `main` och torrkörningen 2026-09-12 läst Bäverbutikens brevlåda på riktigt (264 mejl in, 9 ut, 46 ärenden, risk 🔴 100/100 utan Shopify). ⚠️ **IMAP går inte från claude.ai** (mätt 2026-09-12: proxyn bryter port 993 mot Loopia, Gmail och Office 365 — bara HTTPS släpps, även på nätverksnivån Full). Rutinen läser därför brevlådan genom **Loopias webbmejl över HTTPS** (`kundtjanst/webmail.mjs`, Roundcube 1.7, `mail.via: auto` byter själv) — ingen vidarebefordran, ingen Gmail (Axels besked 2026-09-12: mejlen tas emot på Loopia). Krav: `KUNDTJANST_MAIL_PASS_<ID>` i Environments (Bäverbutikens finns). OPS-brandsen hoppas över med orsak tills de får lösenord. Axels besked 2026-09-12 kväll: **VA:n svarar från Loopias webbmejl**, och brevlådan har bara mapparna INBOX, Drafts, Sent, Spam, Trash (mätt med `node kundtjanst/setup.mjs --mappar baverbutiken`) — de 9 mejlen i `INBOX.Sent` är alltså alla svar som finns, och "obesvarat" mäter rätt: 44 av 45 ärenden vecka 37 var obesvarade. VA:ns SOP-databas `36f270ab-908c-803b-8949-ff2326f4f76c` står i brandfilen sedan 2026-09-12, men integrationen "Bäverbutiken RUTINER" var inte inbjuden dit vid kollen (404) — SOP-täckningen är tom tills Axel bjuder in den. Inbjuden 2026-09-13 — men den länken var redigerarnas **"Creative Hub master"**; `hamtaSopTitlar` räknar sedan dess bara Typ SOP/Guideline i en hubb. **Rätt databas sedan 2026-09-13 förmiddag: "Customer support bäverbutiken"** `3aa270ab-908c-8057-a8a0-cc691d9e956b` (47 rader, kolumn `Kategori`, avdelningsrader i versaler hoppas över) — SOP-orden i `notion.mjs` är avlästa mot dess titlar. ✅ **Shopify för Bäverbutiken kopplat 2026-09-13** (omkoll 4 i ny container): `SHOPIFY_CLIENT_ID/SECRET_BAVERBUTIKEN_EMAILSCRAPER` — Axels egen app på dev.shopify.com bara för kundtjänsten, namnet styrs av brandfilens `shopify.env_suffix` — mintade token med 2 scopes och läste 1 739 ordrar/30 d, 11 tvister och 4 ofulfillade. Vägen dit tog fyra omkollar: `SHOPIFY_ADMIN_TOKEN_BAVERBUTIKEN` bär en `atkn_`-token (Shopify CLI, ger alltid 401 — ignoreras av `korkonfig` sedan PR #80); nycklar ska in i **Default ENV** `env_01PBy3BU66p5AEJYSfm8EbjP` (det rutinerna kör i), inte "Default" `env_01FhBQMkVFeo4ZZ2hB4T9a9k`; fabrikens app fick 403 "requires merchant approval for read_orders" ⇒ en app behöver "Protected customer data access". Första riktiga datan avslöjade ett räknefel, rättat i PR #83: tvistgraden räknas på samma 30 dagar som ordrarna och bara på chargebacks (inquiries är egen signal + egen VA-åtgärd). **Hemsidan** med alla veckor: https://claude.ai/code/artifact/b318db7b-7623-47df-af8c-55e528771207 — rutinen publicerar om `kundtjanst/rapport-publicerad.html` mot den länken varje körning (steg 4 i kommandot) | `/kundtjanst --alla --discord` |
| 00:01 | `1 22 * * *` (CEST) / `1 23 * * *` (CET) — ligger dagen före i UTC, det är rätt | Nattvakten, **en rutin per OPS-butik** — byggs av `/notionscalercs setup <butik>`. Byggda: **HeimGuard** (`hemvakten`, trigger `trig_01WbWzzvL1bvEzdSYDVDjyPt`, fast session `session_01Q98FdP2QSw7gkoASbqAAbx`, taggar `routine:notionscalercs` + `butik:hemvakten`, byggd 2026-09-10. Första natten 2026-09-11 körd: budgetrond + batch #2 (7 briefer), men rutinens container saknade då `ANTHROPIC_NYCKEL`. Setup-omkoll 2026-09-11: nyckeln finns i en ny container, men API:t avvisar den utan `ANTHROPIC_WORKSPACE_ID` — se DryTrek-raden nedan. `factory/rutin.mjs` räknar sedan 2026-09-11 `ANTHROPIC_NYCKEL` som funnen nyckel, så spärren inte varnar falskt om `ANTHROPIC_API_KEY`. Redigerare **Carl Vicente** (Discord `1411720622484095089`, `carlvicente.working`) tilldelad 2026-09-12 ⇒ 21 briefer per briefrond från söndag 13/9). **TankGuard** (`tankguard`, trigger `trig_012GbPeBU7bSmgb3LCk4p18r`, fast session `session_01S1Gqiqi2oJsXJNKj14rW9w`, taggar `routine:notionscalercs` + `butik:tankguard`, byggd 2026-09-10 sent på kvällen; hub "IBC Tank Cover creative hub", Discord-server "TankGuard", ingen redigerare tilldelad ⇒ 7 briefer per briefrond. ⚠️ Mätt 2026-09-12 21:00 UTC: triggern står `enabled: false` (ändrad 13:57 UTC samma dag) — avstängd, inte trasig; slå inte på den utan Axels ok). **DryTrek** (`drytrek`, nyckel `drytrek/damasker`, trigger `trig_01DdJ5AhJGwRUFVKGRtxk83N`, fast session `session_019zEoFg9d5udsuVimZXXSZ1`, taggar `routine:notionscalercs` + `butik:drytrek`, byggd 2026-09-11 strax efter midnatt, **cron flyttad 2026-09-13 till plats 2 = 00:17 (`17 22 * * *` CEST / `17 23 * * *` CET)** via update_trigger; hub "Damasker vandring" `3cf270ab-908c-81a0-9b0d-c486f6467ce7` — bär Bäverbutikens 33 äldre rader, se `products/drytrek/dna.md`; Discord-server "DryTrek — OPS" med `#ads` + `#ads-to-do`; ingen redigerare tilldelad ⇒ 7 briefer per briefrond. `ANTHROPIC_NYCKEL` saknades i skalet vid bygget 23:00 UTC men fanns vid omkoll 2026-09-11 efter containeromstart — miljövariabler som läggs in på claude.ai syns först i en NY container, inte i en session som redan kör. ⚠️ Testanrop 2026-09-11: nyckeln är giltig men är en ORGANISATIONSNYCKEL — API:t svarar "not scoped to a workspace" och kräver headern `anthropic-workspace-id`. Skripten skickar den när `ANTHROPIC_WORKSPACE_ID` finns i Environments (`tools/lib/anthropic-nyckel.mjs`); alternativet är en ny nyckel skapad inne i en workspace, då behövs inget id. **Löst 2026-09-12:** Axel bytte till en workspace-nyckel, testanrop mot Messages API svarade OK utan workspace-id). **AdventLane** (`kalender`, nyckel `kalender/adventskalender-racingbilar` — nischbutik, fler kalendrar blir fler nycklar och fler rutiner; trigger `trig_01FGjqv82YkeU6kQ4TocBL6q`, fast session `session_01DV383fYQE49kfpfy8rnjTz`, taggar `routine:notionscalercs` + `butik:kalender`, byggd 2026-09-11 strax efter midnatt, **cron flyttad 2026-09-12 till plats 3 = 00:25 (`25 22 * * *` CEST / `25 23 * * *` CET)** via update_trigger; redigerare **Jazz** (jazzer1522) ⇒ 21 briefer per briefrond; hub "Racing Car Advent Calendar creative hub" `3d7270ab-908c-81b2-ad69-cf7404a62c4e`; Discord-server "AdventLane" (`1547541533476257803`, `#ads` + `#ads-to-do` skapas av rapporten vid behov); ingen redigerare tilldelad ⇒ 7 briefer per briefrond; säsongsprodukt, död efter 24 dec. ⚠️ `ANTHROPIC_NYCKEL` saknades i skalet även vid det här bygget. ⚠️ `factory/kallannonser.mjs` faller tillbaka på DryTreks NO-mönster `gamasj\|damask` när produktfilen saknar `kalla.no_kampanjmonster` — sätt fältet före nästa `/ny-annonser` för en kalender, se `products/kalender/dna.md` rotorsak 2). **TackleBay** (`tacklebay`, **flerproduktsbutik — rutinen går per produktnyckel:** `tacklebay/fiskespohallare-4-pack`, trigger `trig_01XzwuDVuaZ12Wx1gujr1RQE`, fast session `session_01Xfnc1ZZ3CThYh1FcrsMsTh`, taggar `routine:notionscalercs` + `butik:tacklebay`, byggd 2026-09-11 morgon, **cron flyttad 2026-09-12 till plats 4 = 00:33 (`33 22 * * *` CEST / `33 23 * * *` CET)** via update_trigger; hub "Fish rod holder" `3c3270ab-908c-80f8-824d-eed3c4aa94e1` — delad historia, Bäverbutikens redigerare levererar fortfarande dit; Discord-server "TackleBay — OPS"; **redigerare Eric J** (Discord `1534158659691483356`, ericj1996, tilldelad 2026-09-12 ⇒ kadensens 21 briefer per briefrond); minnet ligger i `products/tacklebay/fiskespohallare-4-pack/`. Kampanjen heter `TACKLEBAY_SE_…` men annonserna `TackleBayRod_…` — `budgetrond.mjs` hittar kampanjen via annonserna sedan 2026-09-11 (`valjKampanjer`). **Kalendern `tacklebay/adventskalender-fiskedrag` har INGEN rutin:** inga annonser, ingen hub, Axels beslut 2026-09-10 att skippa den — se `products/tacklebay/adventskalender-fiskedrag/dna.md`. ⚠️ `ANTHROPIC_NYCKEL` saknades i skalet även vid det här bygget). **CaraShell** (`carashell`, nyckel `carashell/takskyddet`, trigger **`trig_0137g2W6RSwfrrzWueDYJuva`**, fast session **`session_01HfJGQzJSLTaGrz6uV6NB3P`**, taggar `routine:notionscalercs` + `butik:carashell`, **ombyggd 2026-09-14 på `claude5@stonebite.org`**, **plats 5 = 00:41 (`41 22 * * *` CEST / `41 23 * * *` CET)**. ⚠️ De id:n som stod här tidigare (`trig_01D3uBsiTsE6FLdVtGQTYbKD` / `session_01FaKETE4SCzL5AQY4KbYCX4`, uppges byggda 2026-09-12 på `subscriptions@stonebite.org`) **fanns inte**: Axel kollade Routines-vyn 2026-09-14 och såg inga carashell-rutiner alls, `get_session` på den gamla sessionen svarar "not found", och butiken hade noll budgetloggrader, ingen `kord`-stämpel och ingen commit på tre dygn medan alla andra butiker committade dagligen. Tre samstämmiga mätningar — rutinerna byggdes därför om här, där de går att se och verifiera. **Lärdomen: en rutin räknas som byggd först när `list_triggers` visar den på det konto du faktiskt sitter på.** Skriv aldrig in ett trigger-id i den här filen utan att ha sett det i en `list_triggers`-utskrift; hub **"Carashell creative hub" `3da270ab-908c-80c4-80d1-fbdb3fefd3b4`** (rättat 2026-09-14 av `/notionscalercs setup carashell`). ⚠️ Den hub bygget skapade 2026-09-12, `3d9270ab-908c-819d-be0f-c6cb71320871`, **ligger i papperskorgen** (`archived: true, in_trash: true`, mätt 2026-09-14) — en `GET /databases/<id>` svarar fortfarande OK med metadata, men varje `query` ger 404 med texten "Make sure the relevant pages and databases are shared with your integration", vilket LÄSER som ett behörighetsfel och inte är det. Läs `in_trash` innan du tror på den texten. Axel raderade de två teamspace-sidorna och nya hubbar skapades 2026-09-13 07:25 direkt i workspace-roten; `tools/lib/ops-hubbar.mjs` larmade om namnkrocken (samma namn, annat id ⇒ hubben lästes av Bäverbutikens rutiner och hade laddats upp i fel annonskonto). ⚠️ **CaraShell har aldrig lämnat ett spår i repot** (mätt 2026-09-14): noll rader i `factory/budgetlogg.jsonl`, ingen `kord`-stämpel — registret säger fortfarande "butiken har aldrig körts" — och ingen commit sedan setup-commiten `312284f` 2026-09-12, medan hemvakten/drytrek/kalender/tacklebay alla har commits från både 13 och 14 september. Rutinerna går inte att se, ändra eller verifiera från `claude5@stonebite.org`; Axel måste kolla dem i Routines-vyn på `subscriptions@stonebite.org`. Discord-server "CaraShell — OPS" `1547740959335522304`; ingen redigerare tilldelad ⇒ 7 briefer per briefrond; minnet `products/carashell/` skrivet ur ärvd historik samma dag. ⚠️ `ANTHROPIC_NYCKEL` saknades i skalet även vid det här bygget). **CaraShell produkt 2 — Termoskyddet** (`carashell/termoskyddet`, trigger **`trig_01PwsePC1utXScpH6KrjZf1L`**, fast session **`session_01CvgfUeCT8fVqNScYeC2PTG`**, taggar `routine:notionscalercs` + `butik:carashell` + `produkt:termoskyddet`, **byggd 2026-09-16 förmiddag på `claude5@stonebite.org`**, sedd i `list_triggers` samma körning, **plats 7 = 00:57 (`57 22 * * *` CEST / `57 23 * * *` CET)**; hub **"Termoskyddet" `3dd270ab-908c-8018-a927-c2e551f7de8a`** (Axels klick 2026-09-16 05:49 UTC, 0 rader); Discord-server "CaraShell — OPS" (delad med takskyddet); ingen redigerare tilldelad ⇒ 7 briefer per briefrond; minnet `products/carashell/termoskyddet/`. Alla env-nycklar fanns i skalet vid bygget (`NOTION_TOKEN`, `META_ACCESS_TOKEN`, `DISCORD_BOT_TOKEN`, `ANTHROPIC_NYCKEL`, `KIE_API_KEY`). ⚠️ Kampanjen `CARASHELL_SE_Termoskydd Husbil 211 × 171 cm` är PAUSED med 0 annonser: budgetronden hittar ingen kampanj med prefixet `carashellfront_` (mätt i torrkörningen) och första natten blir KALLSTART ur ärvd historik (Bäverbutikens `Termoskydd_*`: 16 annonser, 7 213 kr, 41 köp, ROAS 3,23 — `Termoskydd_CS_3` bär 2 817 kr vinstbidrag). ⚠️ **Alla CaraShell-rutiner (båda produkterna) ligger sedan ombyggnaden 2026-09-14 på `claude5@stonebite.org`** — samma konto som HeimGuard/TankGuard/DryTrek/AdventLane/TackleBay och CatCabin; de id:n som en gång uppgavs byggda på `subscriptions@stonebite.org` fanns inte (se ovan). **CatCabin** (`catcabin`, nyckel `catcabin/utekattkojan`, trigger **`trig_016vxEJxg6yDZcFsdAqb6rkK`**, fast session **`session_01RZ4j2cLKZ2xxwKbYCFzdZZ`**, taggar `routine:notionscalercs` + `butik:catcabin`, **ombyggd 2026-09-14 på `claude5@stonebite.org`**, **plats 6 = 00:49 (`49 22 * * *` CEST / `49 23 * * *` CET)**. ⚠️ **De id:n som stod här förut — `trig_01Bp1cAAkgodMR6gXbPy3fQo` / `session_017cPzQaH4QVWssHcnQHzhqt`, påstått byggda 2026-09-12 — FINNS INTE.** Axels besked 2026-09-14, efter att han tittat i Routines-vyn: "det är för den inte finns". Det stämmer med mätningen samma dag: noll rader i `factory/budgetlogg.jsonl`, ingen `kord`-stämpel, ingen state-post — tre nätter utan ett enda spår, medan drytrek/kalender/tacklebay loggade varje natt. **Lärdomen: skriv aldrig in ett trigger-id i den här filen utan att ha sett det i `list_triggers` i samma körning.** En rutin som bara finns i dokumentationen ser precis ut som en som fungerar, ända tills någon läser loggarna. ⚠️ **Briefronden är PAUSAD sedan 2026-09-14** (`briefantal catcabin/utekattkojan paus`): kampanjen har 1 köp på 13 annonser och ROAS 0,30 mot break-even 1,62, alltså ingen bedömbar annons och ingen feedback-loop att brieffa ur. Axel: "vi kan nästan låta denna runna lite eftersom vi inte ens vet om den går bra är det inte värt att spamma nya ads". Budgetronden går ändå varje natt — det är hela poängen med pausen. Släpps med `node factory/register.mjs briefantal catcabin/utekattkojan auto` när produkten har ≥ 3 köp. **Leveransrundan och NO-översättningen är INTE byggda** (Axels beslut samma dag): de har inget att göra medan hubben är tom och inga briefer produceras, och byggs av `/notionscalercs setup catcabin` när pausen släpps; hub **"catcabin creative hub" `3da270ab-908c-80f6-9663-caff35a3c895`** (rättat 2026-09-14 av `/notionscalercs setup carashell`, samma papperskorgsfynd som CaraShell ovan — den gamla `3d9270ab-908c-8145-8538-d55aaaf4a7e2` är `in_trash`, och den nya hubben har `Status` som riktig `status`-kolumn, inte `select`. Oberoende bekräftat av `/notionscalercs setup catcabin` samma dag, som körde `databases/<id>/query` mot båda id:na: gammal → 404, ny → 200 med **0 rader** — båda de nya hubbarna var alltså tomma, så ingen brief gick förlorad i bytet); Discord-server "CatCabin — OPS" `1547844745412350012` med `#ads` + `#ads-to-do`; ingen redigerare tilldelad ⇒ 7 briefer per briefrond — **utom första briefronden (natten 12→13/9): Axels beslut 2026-09-12 kväll "redigerare obestämt men leverera 21 briefer ändå", inskrivet som engångsöverstyrning `node factory/register.mjs briefantal catcabin/utekattkojan 21 "…"` (raden `Briefrond:` i registret är facit, förbrukas av `brief-kord`, sedan 7 igen tills `redigerare` satts)**; minnet i `products/catcabin/` skrivet ur ärvd historik samma dag. Kampanjen `CATCABIN_SE_Utekattkojan` ACTIVE, 4 adsets, 13 annonser — 833 kr / 0 köp vid bygget, **1 172 kr / 1 köp vid omkollen 21:00 UTC**, allt daterat 2026-09-12: budgetrondens 3d/7d-fönster visade 0 kr eftersom Metas date presets utesluter innevarande dag — inte ett prefixfel. Ingen bedömbar annons: första nattvaktsronden blir KALLSTART. ⚠️ `ANTHROPIC_NYCKEL` saknades i skalet vid bygget men FANNS vid setup-omkollen 2026-09-12 21:00 UTC från kontot `claude5@stonebite.org` — det kontot är "Axels andra konto": dess `list_triggers` ser HeimGuard/TankGuard/DryTrek/AdventLane/TackleBay + Kundtjänst, inte CaraShell/CatCabin) | `/notionscalercs hemvakten`, `/notionscalercs tankguard`, `/notionscalercs drytrek`, `/notionscalercs kalender/adventskalender-racingbilar`, `/notionscalercs tacklebay/fiskespohallare-4-pack`, `/notionscalercs carashell`, `/notionscalercs catcabin` |
| 13:40 | `40 11 * * *` (CEST) / `40 12 * * *` (CET) | Leveransrundan OPS, **en per OPS-butik** — hubbens `To be Reviewed` → live i butikens SE-kampanj i OPS-kontot → `SE-ACTIVE to be translated`. Byggs av `/notionscalercs setup <butik>` (setup är idempotent: kör den igen på en butik som redan har nattvakt, så byggs bara det som saknas). Byggda: **AdventLane** (`kalender/adventskalender-racingbilar`, trigger `trig_01DH2DMkNwb4rcD1bvogsbrt`, fast session `session_01SDv8NdkrfHiYfM5ziGXRvC`, taggar `routine:ops-leverans` + `butik:kalender`, byggd 2026-09-11 förmiddag, **cron flyttad 2026-09-12 till plats 3 = 13:55 (`55 11 * * *` CEST / `55 12 * * *` CET)**; kön hade 4 videor i `To be Reviewed` med Bäverbutikens prefix `Adventskalender_` — rutinen märker om dem till `AdventLaneRacing_`). **HeimGuard** (`hemvakten/overvakningskameran`, trigger `trig_01MTMMgsTxZKVxWin6C1AXNQ`, fast session `session_019B13NJBCepT1wo5sFG59F4`, taggar `routine:ops-leverans` + `butik:hemvakten`, byggd 2026-09-12, plats 0 = 13:40; kön hade 4 bildrader med Bäverbutikens prefix `Overvakningskamera_` — rutinen märker om dem till `HeimGuard_`). **TackleBay** (`tacklebay/fiskespohallare-4-pack`, trigger `trig_01M96L614a16MKXudynm8XWK`, fast session `session_01Fsn8p6U5NopbUYqpdM2vWk`, taggar `routine:ops-leverans` + `butik:tacklebay`, byggd 2026-09-12, plats 4 = **14:00** (`0 12 * * *` CEST / `0 13 * * *` CET); SE-kampanjen `TACKLEBAY_SE_Spöhållaren` ACTIVE, 4 adsets, kön var tom). **CaraShell** (`carashell`, trigger **`trig_01Wq8JbiYkVm1YrtokaCaR2D`**, fast session **`session_01T2PJ2nt1n1tPU2LmUgQST9`**, taggar `routine:ops-leverans` + `butik:carashell`, **ombyggd 2026-09-14** av samma skäl som nattvakten ovan — de gamla id:na `trig_01JuYpyjcS8aWPDggV9qzJFh` / `session_01KJrqMGbKUipuVeLG5gx8t4` fanns inte; plats 5 = **14:05** (`5 12 * * *` CEST / `5 13 * * *` CET); SE-kampanjen `CARASHELL_SE_Taköverdraget` ACTIVE, 4 adsets, pris 1 129 SEK avläst ur butiken; kön hade 4 bildrader ur batch #2 vid bygget). **CaraShell produkt 2 — Termoskyddet** (`carashell/termoskyddet`, trigger **`trig_01RGpFVAcLjcLgnPCBb7kbZV`**, fast session **`session_01A5D9HNiKYPviDM4UrZkY1D`**, taggar `routine:ops-leverans` + `butik:carashell` + `produkt:termoskyddet`, byggd 2026-09-16 förmiddag på `claude5@stonebite.org`, plats 7 = **14:15** (`15 12 * * *` CEST / `15 13 * * *` CET); hub "Termoskyddet"; SE-kampanjen `CARASHELL_SE_Termoskydd Husbil 211 × 171 cm` **PAUSED utan spend** — rutinen rapporterar "VA:n slår på kampanjen först" och laddar inte upp förrän den är ACTIVE; pris 559 SEK / jämförpris 932 avläst ur butiken; kön var tom vid bygget). **CatCabin** (`catcabin`, trigger `trig_01Ur7ECpWUKCqGpnkWXPK9jt`, fast session `session_01P42hrmPUoHYJDrz9pWa54H`, taggar `routine:ops-leverans` + `butik:catcabin`, byggd 2026-09-12, plats 6 = **14:10** (`10 12 * * *` CEST / `10 13 * * *` CET); SE-kampanjen `CATCABIN_SE_Utekattkojan` ACTIVE, 4 adsets, priset 789 SEK avläst ur butiken, kön var tom — hubben var nyss skapad. ⚠️ **De här id:na är OVERIFIERADE sedan 2026-09-14.** CatCabins nattvakt påstods byggd samma dag på samma konto och fanns inte alls (se nattvaktsraden ovan), så anta inte att den här rutinen finns förrän någon sett id:t i `list_triggers`. Kön är ändå tom och briefronden pausad, så den har inget att göra just nu; `/notionscalercs setup catcabin` bygger den om den saknas). **DryTrek** (`drytrek`, trigger `trig_01QVN2LoiGK5UdSW3aivhRM1`, fast session `session_011RknM8DLCHhob8QvaUoYvv`, taggar `routine:ops-leverans` + `butik:drytrek`, byggd 2026-09-13 förmiddag, plats 2 = **13:50** (`50 11 * * *` CEST / `50 12 * * *` CET); SE-kampanjen `DRYTREK_SE_Damasker Vandring` ACTIVE, 4 adsets, pris 389 SEK; kön hade 17 bildrader `DryTrek_Damasker_PD_14_*` + 6 videor från Jasper som kördes live samma förmiddag av setup-sessionen — se `products/drytrek/batch-log.md`) | `/ops-leverans <nyckel>` |
| 16:20 | `20 14 * * *` (CEST) / `20 15 * * *` (CET) + 5 min × plats | **Speglingen, en per speglad produkt** — byggs av `/notionscalercs setup <nyckel>` (idempotent) för poster med `spegling` i register.json. Inskrivna 2026-09-18: **CaraShell Taköverdraget** (`carashell/takskyddet`, plats 5 ⇒ **16:45**, `45 14 * * *` CEST / `45 15 * * *` CET, källhub `7ec270ab-908c-82f6-a2a8-0153159b20fa` "BÄVER For CARL Taköverdraget för Husvagn") och **CaraShell Termoskyddet** (`carashell/termoskyddet`, plats 7 ⇒ **16:55**, `55 14 * * *` CEST / `55 15 * * *` CET, källhub `c5a270ab-908c-83e3-b721-81fde8643080` "BÄVER Termoskyddet för Husbil"). ✅ **Byggda 2026-09-18 kl 12:41 CEST på `claude5@stonebite.org`** (samma konto som CaraShells övriga rutiner), båda sedda i `list_triggers` samma körning: **Taköverdraget** trigger **`trig_01P52LAAkrixM6JzRYUxc4KY`**, fast session **`session_01RyFN4bCPBXxHroKFzUsKGW`**; **Termoskyddet** trigger **`trig_01GWEbTKYMKTfqUZfcucqN71`**, fast session **`session_017BEGfjEbMWUNPVhHFDxnxn`** (repot som källa, `main` som utgren, taggar `routine:ops-spegla` + `butik:<nyckel>`, inga connectors — allt går via `NOTION_TOKEN`/`META_ACCESS_TOKEN`/`DISCORD_BOT_TOKEN`; `create_trigger` avvisar parametern `connectors` i den här organisationen, utelämna den). Statusstegen `CaraShell SE ready to be active` + `CaraShell EN ready to be active` fanns i båda Bäver-hubbarna vid bygget (verktyget varnade inte). ⚠️ Termoskyddets SE-kampanj `CARASHELL_SE_Termoskydd Husbil 211 × 171 cm` var PAUSED **med 2 018 kr spend** 2026-09-18 (avvecklad, ett beslut) — speglingen laddar inte upp SE för termoskyddet förrän en ACTIVE SE-kampanj finns; NO-kampanjen är ACTIVE. Efterjusteringen (`--fran "Translation in review"`, EN gång, torrt sedan skarpt) för Taköverdraget: torrkörningen vid bygget gav 18 rader, 16 gröna, 2 stoppade för att copyn nämner baverbutiken (`Takoverdrag_TR_1_1`, `Takoverdrag_SP_5_1`); `Approved` hade 0 rader, så `"Translation in review"` ensam täcker allt. Skarp körning 13:02–15:28 CEST samma dag: **16 speglade, 2 stoppade, 0 fel** — 32 annonser live (SE + NO), 16 rader i CaraShells hub i `SE-ACTIVE to be translated`, 16 källrader i `CaraShell EN ready to be active`; annons-id per rad i `products/carashell/takskyddet/batch-log.md` (avsnittet "Spegling 2026-09-18") och `factory/output/carashell/spegla-2026-09-18.json`. ⚠️ Takten var ~8 min per rad: Meta stryper läsningarna (kod 17) och `ops-till-meta.mjs` backar av upp till 27 min per anrop — en efterjustering med 16 rader tar 2,5 h, inte "en timme". Termoskyddet hade 0 rader i `Translation in review` | `/ops-spegla carashell/takskyddet`, `/ops-spegla carashell/termoskyddet` |
| Måndag + torsdag 07:00 | `0 5 * * 1,4` (CEST) / `0 6 * * 1,4` (CET) | **Briefgranskningen — EN rutin för hela Bäverbutiken** (ombyggd 2026-09-18 kväll från "en per OPS-produkt"; `factory/rutin.mjs` har den inte längre i `BUTIKSRUTINER`, `/notionscalercs setup` bygger den inte). Alla Bäver-hubbar i ett svep → Feedback-rad `Brief review <rond>` per hub + kommentar på rader med fel + `products/<id>/feedback.md` (CaraShell via speglingen) + EN Discord-rapport i `#problem-and-revisions-ads`. **Byggd 2026-09-18 kl 15:08 CEST på `claude5@stonebite.org`** (Axels beslut: "rutinerna ligger på det här kontot, bygg den här"): trigger **`trig_01JjdMKoWYiXaW6d7QA1CrjR`** ("Briefgranskningen: Bäverbutiken (måndag + torsdag)"), fast session **`session_01KjrG5BozSDD2cZk8Sa9WC9`** (repot som källa, `main` som utgren), taggar `routine:briefgranskning` + `butik:baverbutiken`, inga connectors (`CONNECTORS: inga` — Notion via `NOTION_TOKEN`, Discord via `DISCORD_BOT_TOKEN`), prompt `/briefgranskning`. **Sedd i `list_triggers` samma körning:** `enabled: true`, `persistent_session_id` rätt, första körning måndag 2026-09-21 07:03 CEST. Byggd EFTER att PR #95 mergats till `main`. ⚠️ Mätt i samma `list_triggers`: `/notionkorning`, `/oversatt`, `/bildannonser`, `/commission`, `/translate-no` och `/no-recensioner` finns INTE på det här kontot — där ligger OPS-rutinerna (CaraShell, DryTrek …), Tvistkoll och Kundtjänst. Bäverbutikens övriga rutiner ligger alltså på Axels andra konto. Veckodagarna i cronen följer med vid omställningen (`skiftaVeckodagar`) | `/briefgranskning` |
| 15:40 | `40 13 * * *` (CEST) / `40 14 * * *` (CET) | Översättning NO OPS, **en per OPS-butik** — `SE-ACTIVE to be translated` → norska → live i butikens NO-kampanj i samma konto → `Approved`. Byggs av `/notionscalercs setup <butik>`. Byggda: **AdventLane** (`kalender/adventskalender-racingbilar`, trigger `trig_01NWtZiEYASKVebzrFSPkdB1`, fast session `session_015Xx2KWyvov4TRaJ1rbh4hF`, taggar `routine:ops-oversatt` + `butik:kalender`, byggd 2026-09-11 förmiddag, **cron flyttad 2026-09-12 till plats 3 = 15:55 (`55 13 * * *` CEST / `55 14 * * *` CET)**; NO-kampanjen finns; kön hade 7 rader i `SE-ACTIVE to be translated` vid omkollen 2026-09-12 14:00 — nästa körning tar dem). **HeimGuard** (`hemvakten/overvakningskameran`, trigger `trig_01MU7mRV7qFULBF2tTvpRc8K`, fast session `session_017uxufZwCmfnaRP1N2tv2vn`, taggar `routine:ops-oversatt` + `butik:hemvakten`, byggd 2026-09-12, plats 0 = 15:40. ⛔ **PAUSAD 2026-09-13, `enabled: false` — Axels beslut A: "Norge av tills vidare".** Slå INTE på den igen utan att Axel säger till. Bakgrund: han pausade `HEIMGUARD_NO_Overvåkingskamera` för hand 11:06 (4 141 kr spend, 4 köp, ROAS 1,28 mot break-even 1,49) och lät den ligga. Rutinen hade annars rapporterat en tom kö varje dag. **Fyra rader står kvar i `SE-ACTIVE to be translated`** (`HeimGuard_SP_17_H1`, `SP_17_H2`, `BOF_7_1`, `BOF_9_1`) — de HÅLLS där tills Norge slås på igen, enligt `factory/PROCESS.md` → "Marknaden är pausad av ägaren". ⚠️ Innan NO startas om: annonserna länkar till `/nb` UTAN `?country=NO` och visar därför SEK för norska kunder, se `products/hemvakten/dna.md`). **TackleBay** (`tacklebay/fiskespohallare-4-pack`, trigger `trig_01HtsPQWRnGxfxJeewbJZEZc`, fast session `session_01PMeet4fa9EG9TSeGFncudC`, taggar `routine:ops-oversatt` + `butik:tacklebay`, byggd 2026-09-12, plats 4 = **16:00** (`0 14 * * *` CEST / `0 15 * * *` CET); NO-kampanjen `TACKLEBAY_NO_Spöhållaren` ACTIVE, 5 adsets, kön var tom). **CaraShell** (`carashell`, trigger **`trig_01EvykJqqaE1zRbmsLBohxwz`**, fast session **`session_01VETsstr7V6rtbDwp97nTUB`**, taggar `routine:ops-oversatt` + `butik:carashell`, **ombyggd 2026-09-14** av samma skäl som nattvakten ovan — de gamla id:na `trig_011uXMgbYDPGFcfzA8MwxiWy` / `session_016acMFAoBbxXJywquk5eXjg` fanns inte; plats 5 = **16:05** (`5 14 * * *` CEST / `5 15 * * *` CET); NO-kampanjen `CARASHELL_NO_Takovertrekket` ACTIVE, 3 adsets, ärvd länk `https://carashell.se/nb/products/takskyddet`; kön var tom). **CaraShell produkt 2 — Termoskyddet** (`carashell/termoskyddet`, trigger **`trig_01CU6yhsGFT879efRiZigCrm`**, fast session **`session_01JZhCnJi54HnksYFw3UH63H`**, taggar `routine:ops-oversatt` + `butik:carashell` + `produkt:termoskyddet`, byggd 2026-09-16 förmiddag på `claude5@stonebite.org`, plats 7 = **16:15** (`15 14 * * *` CEST / `15 15 * * *` CET); NO-kampanjen `CARASHELL_NO_Termoskydd Husbil 211 × 171 cm` **PAUSED utan spend** — rutinen håller kön tills den är ACTIVE; standardlänk `https://carashell.se/nb/products/termoskyddet?country=NO`; kön var tom. Ingen US-rutin: `annonsmarknader` är `SE,NO` för termoskyddet). **CatCabin** (`catcabin`, trigger `trig_014GdLJ55pbo1CdneSddzFge`, fast session `session_01T44ZUMYx3hSZbrQv2TncMy`, taggar `routine:ops-oversatt` + `butik:catcabin`, byggd 2026-09-12, plats 6 = **16:10** (`10 14 * * *` CEST / `10 15 * * *` CET); ⚠️ **ingen NO-kampanj finns** — rutinen rapporterar "no NO campaign" varje dag tills `/ny-annonser` byggt den. Källans norska kampanj heter `Isolert Utekattehus` med prefix `Utekattehus_`, och det står redan i produktfilens `kalla.no_kampanjmonster`. ⚠️ **Även de här id:na är OVERIFIERADE sedan 2026-09-14** — samma skäl som leveransrundan ovan: CatCabins nattvakt med samma byggdatum och samma konto existerade inte). **DryTrek** (`drytrek`, trigger `trig_01Th8prN9yBckpUNgThJef9c`, fast session `session_01RGykFqoSnUZc1K5dCPtvKc`, taggar `routine:ops-oversatt` + `butik:drytrek`, byggd 2026-09-13 förmiddag, plats 2 = **15:50** (`50 13 * * *` CEST / `50 14 * * *` CET); NO-kampanjen `DRYTREK_NO_Damasker Vandring` ACTIVE, 4 adsets, ärvd länk `https://drytrek.se/nb/products/damasker?country=NO`; kön hade 5 rader i `SE-ACTIVE to be translated` vid bygget). Kvar på bastiderna utan egen plats: **TankGuard** (plats 1 ⇒ 00:09 / 13:45 / 15:45) — nattvakten står på `1 22` (avstängd) och har ingen leverans/översättning; rättas med `/notionscalercs setup tankguard` när Axel vill ha den igång | `/ops-oversatt <nyckel>` |
| 16:40 | `40 14 * * *` (CEST) / `40 15 * * *` (CET) | Översättning **US** OPS, bara butiker med `annonsmarknader: NO,US` i `register.json` — samma kö som NO, live i butikens `_US_`-kampanj i **Magiborsten UK `1107817401910319`** (Axels beslut 2026-09-16), `Approved` först när både NO och US bär annonsen. Byggd: **CaraShell** (`carashell/takskyddet`, trigger **`trig_01MDyMH294x2i7Cek6pncTCA`**, fast session **`session_01V7x9YoFdr4ph1PnTs8dno3`**, taggar `routine:ops-oversatt` + `butik:carashell` + `marknad:US`, byggd 2026-09-16 på `claude5@stonebite.org`, sedd i `list_triggers` samma körning, plats 5 = **17:05**. ⚠️ **Alla fyra CaraShell-rutinerna byggdes om samma förmiddag med prompten `carashell/takskyddet`** (nya trigger-id:n här och i raderna ovan; samma fasta sessioner): en annan session hade lagt in termoskyddet som produkt 2 (`544cd4b`), och ett bart `carashell` kastar då i registret. `update_trigger` kan inte byta prompt på en rutin bunden till en annan sessions container — därför nya triggers + de gamla raderade, verifierat med `list_triggers` (`5 15 * * *` CEST / `5 16 * * *` CET); US-kampanjen `120251436741400435` PAUSED med 5 adsets och 0 annonser tills Axel slår på den — efter `/ny-marknad carashell US`. Rutinen håller kön tills `/en` svarar). **Termoskyddet** (`carashell/termoskyddet`): US-kampanjen `120251442339640435` (`CARASHELL_US_Termoskydd Husbil 211 × 171 cm`, PAUSED, 4 adsets CS/G/PD/SP, 0 annonser) byggd 2026-09-16 eftermiddag av `/ops-oversatt … --marknad US`-körningen, `annonsmarknader` NO,US. ✅ **US-rutinen byggd 2026-09-16 kl 12:42 CEST på `claude5@stonebite.org`** av `/notionscalercs setup carashell/termoskyddet` (setup är idempotent: nattvakt, leverans och NO fanns redan, bara US saknades): trigger **`trig_01C9Dfcm5k9wuxPDaQaRNF1r`**, fast session **`session_01Ngpv9kMqf3BM8onpTbMdCt`** (repot som källa, `main` som utgren), taggar `routine:ops-oversatt` + `butik:carashell` + `produkt:termoskyddet` + `marknad:US`, **plats 7 = 17:15 (`15 15 * * *` CEST / `15 16 * * *` CET)**, sedd i `list_triggers` samma körning. Torrkörning vid bygget: hubben "Termoskyddet" hittad, 0 rader i `SE-ACTIVE to be translated`, US-kampanjen `120251442339640435` PAUSED med 4 adsets och 0 annonser, standardlänk `https://carashell.com/products/termoskyddet?country=US`, pris 99 USD / jämförpris 124 ur butiken. Rutinen laddar upp när kön får rader men rör inte kampanjens status — inget spenderar i USA förrän Axel slår på den. Alla sex env-nycklar fanns i skalet (`NOTION_TOKEN`, `META_ACCESS_TOKEN`, `DISCORD_BOT_TOKEN`, `ANTHROPIC_NYCKEL`, `KIE_API_KEY`, `HEYGEN_API_KEY`). En tidigare session på ett tredje konto kunde inte bygga den (`list_triggers` såg inga CaraShell-rutiner där). ⚠️ Två verktygsfel rättade samma körning: kön såg inte en TOM kampanj (`kandidaterViaKampanjnamn`), och `kampanj.mjs --tom` matchade på butiksprefixet så produkt 2 hade fått produkt 1:s kampanj. Marknad tillagd i efterhand ⇒ Approved-rader utan annons i marknaden är eftersläpande (kommandofilen steg 1) | `/ops-oversatt <nyckel> --marknad US` |
| Varje timme :24 | `24 * * * *` (samma i CEST och CET) | **Spårningen, CaraShell** — samma rutin som Bäverbutikens men för carashell.se (`sparning/butiker/carashell/lage.json` committas till `main`; egen minut så de två pusharna inte krockar, och kommandot kör `git pull --rebase` före). **Byggd 2026-09-20 kl 18:47 CEST på `claude5@stonebite.org`:** trigger **`trig_01UAU1N6P4MpPmeLgKffprHo`** ("Spårningen: CaraShell (varje timme)"), fast session **`session_01EZDDNdhgXgYFZ7p8DWf4BU`** (repot som källa, `main` som utgren), taggar `routine:sparning` + `butik:carashell`, inga connectors (fabrikens Shopify-nycklar + `TRACK17_API_KEY`). **Sedd i `list_triggers` samma körning**, första körning 19:24 CEST. Byggd EFTER att koden pushats till `main` (`7588b6e`). Första skarpa rundan för hand 18:39 CEST: 141 ordrar/paket, 141 registrerade, 109 + 29 event, sidan https://carashell.se/pages/spara skapad (`gid://shopify/Page/735790727500`), 140 paket, trippelkollen grön (⚠️ containern får .se → .com-omdirigering, kontrollen läste .com-versionen av samma sida). NO/DK/FI får varsin rutin på samma sätt (`/sparning <butik>`, cron på egen minut) när Axel gett apparna rättigheterna | `/sparning carashell` |
| Varje timme :32 / :40 | `32 * * * *` / `40 * * * *` | **Spårningen, Beverbutikken (NO) och Majavakauppa (FI)** — samma rutin som Bäverbutikens, kundens kedja på norska resp. finska (`sparning/sprak/nb.json`, `fi.json`), lagefilen i `sparning/butiker/<id>/lage.json` committas till `main`. **Byggda 2026-09-20 kl 21:56 CEST på `claude5@stonebite.org`**, båda sedda i `list_triggers` samma körning: **NO** trigger **`trig_01JqE4TDfLVwpJEHhECGyQFL`** ("Spårningen: Beverbutikken (varje timme)"), fast session **`session_01YGSL1w5uQszYjieUqqc9iN`**; **FI** trigger **`trig_016yuCdWwbFPgA2ntJcLGUED`** ("Spårningen: Majavakauppa (varje timme)"), fast session **`session_019k52ns9p5muXHmQD532Hvd`** (repot som källa, `main` som utgren, taggar `routine:sparning` + `butik:<id>`, inga connectors — `SHOPIFY_CLIENT_ID/SECRET_NO` resp. `_FI` + `TRACK17_API_KEY`). Byggda EFTER att sidorna publicerats för hand och lagefilerna pushats (`6c73676`). Första rundan NO: 430 ordrar/14 d, 438 paket, 150 registrerade (taket), 145 event; 288 tas av rutinen på två timmar. FI: 7 paket, 5 event. ⚠️ NO är stor: ~430 paket per 14 dagar på en 17TRACK-kvot som delas av alla butiker. **DK** (`baeverbutiken`): trigger **`trig_01Xjx5pUdre9Uw3LJiBy9Nzs`** ("Spårningen: Bæverbutiken (varje timme)"), fast session **`session_01SLDa7FRSAf2964pHQ1mjVg`**, cron `48 * * * *`, byggd 2026-09-20 kl 22:29 CEST på samma konto, sedd i `list_triggers` samma körning; 1 order, 0 skanningar vid bygget | `/sparning beverbutikken`, `/sparning majavakauppa`, `/sparning baeverbutiken` |
| Varje timme :56 | `56 * * * *` (samma i CEST och CET) | **Spårningen, Matstrumpor** — sjätte butiken, svensk kedja, prefix `MS-`, lagefilen i `sparning/butiker/matstrumpor/lage.json` committas till `main`. **Byggd 2026-09-21 kl 11:41 CEST på `claude5@stonebite.org`:** trigger **`trig_01LSdjZgepsWf761ocrFWAAo`** ("Spårningen: Matstrumpor (varje timme)"), fast session **`session_017E57dcmd1Lf7PpJTBsoAUE`** (repot som källa, `main` som utgren), taggar `routine:sparning` + `butik:matstrumpor`, inga connectors (`SHOPIFY_CLIENT_ID/SECRET_1r46tp_qx` + `TRACK17_API_KEY`). **Sedd i `list_triggers` samma körning**, första körning 11:56 CEST. Byggd EFTER att koden låg på `main` (`04088e8`). ⚠️ **Inget steg 0 behövdes** — nycklarna fanns redan och hör till fabrikens app "Fabriken" (154 rättigheter, alla fyra krävda). ⚠️ `SHOPIFY_SHOP_1r46tp_qx` i Environments bär domänen med **understreck** (`1r46tp_qx.myshopify.com`) — fel; `sparning/butiker.json` är facit. Första skarpa rundan 09:36 UTC: 59 ordrar/14 d, 59 registrerade, 48 paket med skanningar, 640 händelser, 48 event, 0 fel, 0 okända fraser, sidan https://matstrumpor.se/pages/spara publicerad (`gid://shopify/Page/183508730195`, 73 kB), trippelkollen grön | `/sparning matstrumpor` |
| Varje timme :04 | `4 * * * *` (samma i CEST och CET) | **Stonebite — färsk data till sajten** (`stonebite/data/snapshot.json` → `main` → Railway bygger om). Shopify, Meta, Discord-eskaleringen, rutinvakten (git-loggen), bonusen. **Byggd 2026-09-22 kl 14:39 CEST på Barkås-kontot** (inte claude5): trigger **`trig_01QwKgfZP3JdhZX6tbGo1LJb`**, fast session **`session_01PBEszeiGu5Qe2Lu5Je1p9T`**, tagg `routine:stonebite`, inga connectors. Sedd i `list_triggers` samma körning. Se stonebite-avsnittet ovan | `/stonebite` |
| Varje timme :10 | `10 * * * *` (samma i CEST och CET) | ⛔ **PAUSAD 2026-09-23 00:00 CEST, före första körningen** (`enabled: false`, namnet i Routines-vyn säger varför): **Railway-vakten** (`stonebite/autosvar-vakt.mjs`, PR #124) hade då kört samma bot mot samma brevlåda var 60:e sekund sedan 23:30 — den här rutinen byggdes 13 minuter senare av en annan session, och dess körning för hand 23:31 gick parallellt med Railways första varv (Railway: 50 mejl, 0 utkast; handkörningen: 34 mejl, 1 utkast — samma brevlåda, samma minut). Två körare på en brevlåda är dubbelsvaret, och Railway är den som klarar Axels krav "60 sekunder". Slå på rutinen BARA om Axel väljer den i stället för Railway — ta då bort `AUTOSVAR_BRANDS` på Railway först. Raden nedan beskriver rutinen som den byggdes. **Autosvaret, Bäverbutiken — TORRT** (utkast i `INBOX.Drafts`, inget skickas): nya kundmejl → ENKEL besvaras som utkast, ARG får lugnande utkast + flagga + `INBOX.VA-PRIO`, SVÅR flaggas; engelsk rapport i Bäverbutikens `#customer-service` bara när något hänt; loggen `kundtjanst/autosvar/logg/baverbutiken.jsonl` committas till `main` (`git pull --rebase` först). **Byggd 2026-09-22 kl 23:43 CEST på Barkås-kontot** (Axels order "sätt igång AI-kundsupport-botten"): trigger **`trig_01KiQ9zHevZDMpkSbB3Ue6sM`**, fast session **`session_01JCQtxLmN7ei2anB49KZQbM`** (repot som källa, `main` som utgren, miljön `env_011kzcu4tXHXM9LdECNkDe9E` som bär `KUNDTJANST_MAIL_PASS_BAVERBUTIKEN`), taggar `routine:autosvar` + `butik:baverbutiken`, inga connectors. **Sedd i `list_triggers` samma körning**, första körning 00:10 CEST. ⛔ **Skarpt kräver Axels ok** (hans regel: 20 rätta utkast i rad): då `update_trigger` med prompten `/autosvar --brand baverbutiken --skarpt --discord` — bygg aldrig en andra rutin, och kör aldrig `/autosvar` för hand mot Bäverbutiken medan rutinen är på (en brevlåda, en session). VA:ns SOP: Notion-sidan **"Auto-reply bot — what it does, and what you do"** i "Customer support bäverbutiken" (`kundtjanst/va-sop/auto-reply-bot.md`; Store facts bär läge, signatur och VA-PRIO). Första körningen under rutinens regler, för hand 23:31 CEST: 34 mejl, 1 utkast (ENKEL `foton`), 0 ARG, 31 SVÅR, 2 hoppade — **6 av de 31 var var-är-min-order/leveranstid/saknad bekräftelse som `klassificering.mjs` inte kände igen** (fraserna i `kundtjanst/README.md` → "I drift TORRT"); botten är försiktig, inte farlig. ✅ **Fraserna inlagda 2026-09-23 (Axels beslut A):** `klassificering.mjs` (WISMO: "vart har min order tagit vägen", "hur länge får man vänta", "när min beställning kommer", "stått still", "kan inte spåra", "bekräftelsemejl" + nb/da/en/fi; "inte fått vår order" ⇒ `ej_levererad`), `hinkar.LEVERANSTID` ("hur länge får man vänta" utan order ⇒ svaret före köp) och `svar.namnerStillaSparning` ("transporten stått stilla" ⇒ SOP 02-raden). Smalt med flit: "undrar när ni får in storlek L" är fortfarande produktfråga, retur som nämner spårning går aldrig till ENKEL. Matstrumpor väntar tills Bäverbutiken är skarp (Axels ordning samma kväll) | `/autosvar --brand baverbutiken --torr --discord` |
| Varje timme :16 | `16 * * * *` (samma i CEST och CET — ingen timme att flytta) | **Spårningen, Bäverbutiken** — skickade ordrar → 17TRACK → fulfillment-event i Shopify, `sparning/lage.json` committas och pushas till `main` varje körning. **Byggd 2026-09-18 kl 16:16 CEST på `claude5@stonebite.org`** (efter att PR #97 mergats till `main`): trigger **`trig_014rEkz1EjfRfUW6dZxnvm6Q`** ("Spårningen: skanningar in i Shopify (varje timme)"), fast session **`session_01To75UpfXYXGX5jcb9QYrdv`** (repot som källa, `main` som utgren), taggar `routine:sparning` + `butik:baverbutiken`, inga connectors (allt via `TRACK17_API_KEY` + `SHOPIFY_CLIENT_ID/SECRET_SE_BAVER_SE`). **Sedd i `list_triggers` samma körning:** `enabled: true`, `persistent_session_id` rätt, första körning 2026-09-18 17:16 CEST. Ingen dubblett fanns (kollat före bygget). Första skarpa rundan för hand 2026-09-18 15:29 UTC: 932 ordrar, 940 paket, 40 registrerade, 30 event, 0 fel. ✅ **Spårningssidan tillagd i rutinen 2026-09-19** — samma körning bygger om https://baverbutiken.se/pages/spara. Första skarpa publiceringen: 1 055 paket, 11 206 skanningar, 202 kB sida, trippelkollen grön (API, publik vy, känt nummer i kundens data), sedd i Chromium på 390 och 1280 px. Rutinens prompt är oförändrad (`/sparning`), men kommandofilen har fler steg: ordboken ska växa när rapporten säger att fraser saknas, och `sparning/output/` får ALDRIG committas (~1,2 MB per körning). ⚠️ Taket 150 registreringar per körning ⇒ eftersläpningen på ~900 paket tas i kapp på ett halvt dygn, sedan ~4 nya per timme. Tar kvoten slut hos 17TRACK stannar registreringen tyst och bara redan registrerade paket följs — `kor.mjs` skriver "17TRACK avvisade N" i rapporten, läs den | `/sparning` |

| 05:40 | `40 3 * * *` (CEST) / `40 4 * * *` (CET) | **Kommentarsgranskningen — alla konton, varje dag** (Axels beställning 2026-09-24): nya annonskommentarer (FB + IG) → 🔴 kräver en människa, köpfrågor utan svar, invändningar per produkt, leads (`kommentarer/leads.md`) → svensk rapport `kommentarer/rapporter/<datum>.md` + engelsk post per verksamhet i `#ad-comments` (Bäverbutiken, CaraShell — OPS; Matstrumpor postas aldrig). Läs-bart: svarar, döljer och raderar aldrig; svarsförslag på allt utom tomma/taggar/spam, tak 30 (Axels beslut 2026-09-25, ersatte PR #156:s spärr). Publicering bara på Axels ord via `kommentarer/publicera.mjs`: svaret postas från sidan som äger annonsen och hör till verksamheten (CaraShell från CaraShells sida, Bäverbutiken från Bäverbutikens — `kommentarer/sida.mjs`), och första svarsrundan någonsin på en sida kräver torrkörning + Axels granskning (`--granskad`). 05:40 med flit: klar före Skalnings kungen 07:50 och Commission 06:00. **Byggd 2026-09-24 kl 23:12 CEST på kontot som bär Översättning NO / Mammas jobb / Skalnings kungen** (miljö `env_017T5nLJowPH52bir1CsVYEk` — har `META_ACCESS_TOKEN`, `DISCORD_BOT_TOKEN`, `NOTION_TOKEN`; saknar `ANTHROPIC_NYCKEL` och `META_ACCESS_TOKEN_MATSTRUMPOR`): trigger **`trig_01H87sfgKPg291ihXfukc8WH`**, fast session **`session_01MDoM1Exs6Ad9Zc8kr6nQPL`** (repot som källa, `main` som utgren, tagg `routine:kommentarer`), inga connectors, prompt `/kommentarer`. Första körning som engång `trig_01M25xLqkcZrjUfh58Q5z31A` 2026-09-24 23:28 CEST. **Båda sedda i `list_triggers` samma körning.** ⚠️ Skalnings kungen (`trig_016ocyXom7XxCJKHHyfkaQWC`, skapad via http_api) läser inte `leads.md` — en agent får inte ändra dess prompt, bara Axel i Routines-vyn | `/kommentarer` |
| 07:00 | `0 5 * * *` (CEST) / `0 6 * * *` (CET) | **Matstrumporkungen — var tredje dag, skriptet avgör** (`node matstrumpor/kor.mjs --kordag`: exit 2 ⇒ ingen rond, en rad och slut; kadensen `kadens.rond_var_n_dag = 3` räknas från förra rondens `ROND_KLAR` i `matstrumpor/logg.jsonl`, reserv: senaste ETIKETT/LARDOM/BRIEF/FORSLAG-raden — förra ronden 2026-09-21 ⇒ första rond 2026-09-24). Etikett → lärdom → 6 briefer → tips; **skalar ALDRIG** (Axels beslut 2026-09-21). **Byggd 2026-09-23 kl 08:57 CEST på det här kontot** (`list_triggers` visade sex rutiner före bygget — Produktjakten, Leveransrundan, Commission, Norska recensioner, NO-videobatch, Bildannonser — ingen dubblett): trigger **`trig_01Y7mU1gvcXQ55gUMeDaXzbx`** ("Matstrumporkungen: matstrumpor (07:00, var tredje dag — skriptet avgör)"), fast session **`session_017iu4tKu2gkzAVH7LQVAUp5`** (repot som källa, `main` som utgren), taggar `routine:matstrumporkungen` + `butik:matstrumpor`, inga connectors (`CONNECTORS: inga` — Meta via `META_ACCESS_TOKEN`, Notion via `NOTION_TOKEN`), prompt `/matstrumporkungen`. **Sedd i `list_triggers` samma körning**, första fyrning 2026-09-24 07:06 CEST. Byggd EFTER att koden låg på `main` (`15cfb51`). Förutsättningen: Axel gav token:en åtkomst till kontot 2026-09-22 — steg 1 i bygget var att testa den, och den nekades fortfarande 2026-09-21 kväll. ⚠️ Rapporten landar bara i rutinens session: Matstrumpor har ingen Discord-server, så tipsen till Axel postas ingenstans förrän han pekat ut en kanal | `/matstrumporkungen` |

`/commission` har daglig cron med flit: **skriptet självt avgör** om dagen är
kördag (den 1, 4, 7 … 28, plus alltid månadens sista dag). Siffrorna räknas ändå
varje dag — kalendern styr bara om rapporten sparas, aldrig om körningen blir av.
Cron kan inte uttrycka "var tredje dag plus sista dagen" över månadsskiften.
Kalenderspärren sitter på flaggan `--rutin` — kör Axel `/commission` för hand
räknas månaden hittills oavsett datum.

⚠️ **Cron står i UTC och följer inte sommartid.** Tiderna ovan gäller CEST
(UTC+2, mars–oktober). Vid vinteromställningen blir Sverige UTC+1, och en cron
som står kvar går en timme TIDIGARE svensk tid. Cron-uttrycken ska då **ökas**
med en timme: `20 11 * * *` (13:20 CEST) blir `20 12 * * *` (13:20 CET).
Räkna alltid om från önskad svensk tid till UTC i stället för att minnas riktningen.

**Mätt 2026-09-18 12:20 CEST på `claude5@stonebite.org`** (Axels fråga "ligger
cronen en timme fel?"): alla 24 befintliga rutiner i `list_triggers` står på
exakt de CEST-värden tabellen ovan anger, och senaste körningarna landar på rätt
svensk timme (Tvistkoll `30 5` fyrade 05:36 UTC = 07:36 CEST; nattvakten
carashell `41 22` fyrade 22:41 UTC = 00:41 CEST). **Ingen ligger en timme fel i
dag.** Enda avvikelsen mot `node factory/rutin.mjs --lista` är TankGuards
nattvakt (`1 22`, plats 1 hade gett `9 22`) — den är avstängd, redan känd. Det
som däremot INTE står i tabellen: **12 av de 24 rutinerna var `enabled: false`**
vid mätningen — HeimGuard (alla tre), TankGuard, AdventLane (alla tre), TackleBay
(alla tre), CatCabins nattvakt och Kundtjänst veckorapport; nio av dem avstängda
2026-09-15 (04:35–04:36 resp. 18:47 UTC), de tre övriga är TankGuard och
HeimGuard NO (kända sedan tidigare). Avstängda, inte trasiga — slå inte på
någon utan Axels ok. Igång efter bygget: 14 av 26 — CaraShell (4 + 4 + de två
speglingarna), DryTrek (3) och Tvistkoll. CatCabins leverans- och NO-rutiner
finns inte på det här kontot (bekräftar "OVERIFIERADE" ovan). Nästa gång cronen
faktiskt hamnar fel är vinteromställningen
2026-10-25: då går alla en timme för tidigt tills varje rutin flyttats +1.

⚠️ **OPS-rutinerna ligger på TVÅ olika Claude-konton.** Mätt 2026-09-12:
`list_triggers` på kontot som byggde CaraShell och CatCabin ser bara de sex
rutinerna (tre per butik) — HeimGuard, TankGuard, DryTrek, AdventLane och
TackleBay finns inte i listan, för de byggdes på Axels andra konto. Det är
**inte** en saknad rutin och ska inte byggas om: en dubblett hade kört samma
jobb två gånger. Kolla vilket konto du sitter på innan du drar slutsatsen att
något saknas. Tidsplatserna (`register.json` → `rutinplatser`) delas ändå av
alla butiker oavsett konto, så kollisionsskyddet håller över kontogränsen —
men bara om varje setup skriver in sin plats innan rutinen byggs.

⚠️ **En rutin som startar en ny session varje gång kan inte pusha.** Sådana
sessioner har inget repo som källa, så proxyn ger dem aldrig något credential:
`git push` svarar `not in this session's authorized repository set`, och
allt rutinen lärde sig (`sources.json`, översättningar, STATUS-filer,
commission-rapporter) dör med containern. *(Mätt 2026-09-03 på Norska
recensioner: tre körningar i rad, noll pushar.)* Lösningen är att binda
rutinen till en **fast session** som skapats med repot som källa och `main`
som utgren (`create_session` med `source_url` + `outcome_branch`, sedan
`create_trigger` med `persistent_session_id`) — så gör Bildannonser och
Norska recensioner. Bygg aldrig en ny rutin med "ny session varje gång" om
den ska spara något i repot.
*(Mätt igen 2026-09-04 på `/oversatt`: `create_trigger` med "ny session varje
gång" startade i en TOM container — `sources: []`, inget repo, inget CLAUDE.md.
Rutinen raderades och byggdes om som fast session enligt ovan.)*
*(Och igen 2026-09-05 på Leveransrundan: sju nekade pushar över två
körningar, en bugfix fast i containern. Ombyggd 2026-09-07 till fast session
`session_012EUCCZUPS5hCn5zMp9Fq7R`, tagg `routine:leveransrundan`. Kolla
`list_triggers` innan du bygger om en rutin — 2026-09-08 skapades en dubblett
av misstag och fick raderas.)*

⚠️ **`fire_trigger` väcker INTE en rutins fasta session — den mintar en ny, tom.**
Mätt 2026-09-13 på Leveransrundan hemvakten: `fire_trigger` på
`trig_01MTMMgsTxZKVxWin6C1AXNQ` (fast session `session_019B13NJBCepT1wo5sFG59F4`)
startade i stället `session_01SmbW5A9GrYGaEnGSJRww1W` — `origin: force_run_trigger`,
taggar `routine:agent-minted` + `routine-lineage-none`, **`sources` tomt**, alltså
samma repolösa container som varningen ovan handlar om. Den gav upp efter 68
sekunder, laddade upp noll och lämnade den fasta sessionen orörd (`updated_at`
oförändrad). `SendMessage` fungerar inte heller: `ListAgents` ser bara den egna
maskinen, så en annan molnsession är oåtkomlig den vägen.
**Vill du köra en rutin utanför schemat: `create_trigger` med
`persistent_session_id` + `run_once_at`** — samma mekanism som cron-triggern,
och den landar i rätt session med repo och CLAUDE.md. Lägg fyrningstiden minst
tio minuter fram; en session kan ligga stilla länge mellan två verktygsanrop och
`run_once_at` i det förflutna avvisas.

⚠️ **Rutiner ärver inte sessionens MCP-connectors.** En rutin som behöver Notion,
Drive eller Shopify måste få connectorn kopplad på själva rutinen i Routines-vyn
på claude.ai — annars står den helt utan `mcp__*`-verktyg. Bygg därför rutinerna
på vägar som fungerar ändå där det går: Drive läses publikt med
`tools/drive-ls.py`, Meta via `META_ACCESS_TOKEN`, Notion via `NOTION_TOKEN`
(`tools/notion-klara.mjs`).

⚠️ **Rutinens konfiguration och rutinens körning är två olika saker.** Mätt
2026-09-01 på rutinen "Ad upload and structure": den listar sju connectors
(ADsmanagaer, Google-Drive, Notion, Slack, Shopify …) men har `allowed_tools`
= Bash, Read, Write, Edit, Glob, Grep, WebFetch, WebSearch — inga `mcp__*`.
Vad det betyder i praktiken är **inte fastställt**: ingen har läst en
rutinkörnings transkript och sett om connector-verktygen fanns eller inte.
Därför ber `/nattkorning` steg 4 rutinen själv rapportera om
`mcp__Google_Drive`-verktygen fanns. Läs den raden i morgonrapporten innan
du drar någon slutsats åt något håll — och bygg aldrig en parallell
infrastruktur (Apps Script, token-vägar) för något connectorn kanske redan
klarar. Axels besked 2026-09-02: ingen ny Google-app för Drive-flytten.

---

## Kommandon i terminalen

Roten är ett eget npm-projekt (Node ≥20, **noll externa beroenden** — inget att
installera för OS:et). Kör dessa **från repo-roten**:

```bash
npm run quota      # node pipeline/quota.mjs      — brief-kvoten (mål nr 1)
npm run dash       # node dashboard/build.mjs     — bygger dashboard/index.html
npm run status     # node dashboard/cli.mjs status
npm run review     # node dashboard/cli.mjs review-queue
npm run seed       # node dashboard/seed.mjs --force  (⚠️ skriver över testdata)
npm test           # node --test dashboard/test/*.test.mjs — 17 tester, ska vara gröna
```

Enskilt test: `node --test --test-name-pattern "<del av testnamnet>" dashboard/test/rules.test.mjs`

Notion-import (kräver `NOTION_TOKEN`): `node dashboard/notion-import.mjs`

Det finns ingen linter och ingen byggkedja i OS:et — `npm test` är hela grinden.

---

## Var saker finns

| Vad | Var |
|-----|-----|
| **Creative strategy: insikt → manus (hjärnan i video-pipelinen)** | **`docs/creative-strategy.md`** |
| **Copy-reglerna (obligatoriska för varje rad som skrivs)** | **`docs/copy-regler.md`** |
| **Analysmetoden (obligatorisk vid all bedömning)** | **`docs/os/ANALYSMETOD.md`** |
| **Regi rad för rad i varje videobrief + spärren före Notion** (Axels beslut 2026-09-21: `node tools/briefgranskning.mjs --rad <brief.md>` / `--manifest <manifest.json>`, exit 1 = ingen Notion-rad) | **`docs/os/BRIEF-REGI.md`** |
| **Definition av klart för creative strategy — Axels 19 punkter** (2026-09-21): lärdomen per etiketterad annons, briefer som pekar på en lärdom, mixen ur etiketterna, brieftaket, vidarebyggen, taggarna, rapporten, kommentarerna, taket. Avstämningen efter varje bygge står längst ner i filen. Motorn: `agent/lardom.mjs` på rutinens gren | **`docs/os/CS-KLART.md`** |
| Playbook — vinklar/hooks/format som bevisats över tid | `docs/playbook.md` |
| Hook-regeln (visuellt) | `docs/hook-visual-rule-2026-08-04.md` |
| Avatar-research + VoC (Reddit) | `docs/avatar-research-*.md`, `docs/voc-reddit-*.md` |
| Swipes från konkurrenter | `docs/swipes/` |
| TOF-idébank | `docs/tof-idea-bank.md` |
| Actionplan + bottlenecks | `docs/os/ACTIONPLAN.md` |
| SOP 01–07 (batch-loop, kvot, UGC, check-in, "när Claude inte lyssnar", produkttest, dashboard) | `docs/os/SOP-0*.md` |
| Editor SOP (engelska, till redigerarna) | `docs/os/EDITOR-SOP.md` |
| Notion-formatet för briefer (exakt spec + statustabell) | `docs/os/NOTION-FORMAT.md` |
| Produkt-konfig + launch-logg | `products/products.json` |
| Produktminne per produkt | `products/<id>/` |
| Kvot-skriptet | `pipeline/quota.mjs` |
| **Kommentarsgranskningen: annonskommentarer → allvarligt, köpfrågor, invändningar, leads** (konton, domäner, sidor = facit för verksamheten) | `kommentarer/` — `README.md`, `konfig.json`, `leads.md`, `rapporter/`; kommandot `/kommentarer` |
| **Matstrumpor: uppladdaren + den lilla kungen** (konto "nya kungen", break-even, namnmotor, jul-routing, lärdomarna) | `matstrumpor/` — `README.md`, `konfig.json`; produktminnet i `products/matstrumpor/` |
| Namnkonventionen | `docs/naming-convention.md` |
| Punchline-bank + vinnande lines | `docs/winning-lines.md` |
| Ad-tracker (hypotes → utfall → lärdom) | `docs/ad-tracker.md` |
| Färdiga briefer + rådata från kontot | `docs/briefs/`, `docs/source/` |
| Grillklinikens COGS, marginaler och moms (legacy) | `docs/grillkliniken-ekonomi.md` |
| **Bolagets sajt: publik sida + inloggade dashboards** (stonebite.org) | `stonebite/` — `README.md`, `roller.mjs` (vem ser vad), `hamta.mjs` (datan), `profil.json` (texten på publika sidan) |
| **Kundmejlen + gratisprodukt-erbjudandet** (Shopify-notiser, kod `TACKIGEN`, kollektion `din-gratisprodukt`) | `mejl/` — `README.md`, `konfig.json`, `copy.json`. ⚠️ Shopify har inget API för notismallar: Axel klistrar in från sidan `/mejl` bygger. Rabattkoden kräver `write_discounts` som appen "Bäver uppladdare" saknar (mätt 2026-09-12) |

### Produkterna (`products/products.json`)

Sex produkter, alla på MagiBorsten. `scaling: true` = ingår i redigerardashboarden
och har en egen Notion creative hub. `scaling: false` = testprodukt, utanför
redigerarnas arbetsflöde.

| id | Skalar | Dagsbudget | Break-even-ROAS |
|---|---|---|---|
| `motorholjet` | ✅ | 2 000 kr | 1,63 |
| `axelbaltet` | ✅ | 2 000 kr | 1,72 |
| `satesoverdragaren` | ✅ | 1 500 kr | 1,47 |
| `strandtofflorna` | ✅ | 1 000 kr | 1,70 |
| `ai-glasogon` | ❌ | 1 000 kr | 1,34 |
| `vaggfastet` | ❌ | 500 kr | 2,00 |

Break-even-talen kommer ur Axels COGS-beräkning 2026-08-05 och är verkliga.
Dagsbudgetarna ändras ofta — **läs alltid `products.json`, citera aldrig tabellen
ovan ur minnet.** Motorhöljet sänktes 6 000 → 2 000 kr/dag 2026-08-12.
Under 5 000 kr/dag växlar kvotens testandel från 10 % till 20 %, så kvoten hoppar
när en budget passerar den gränsen.

⚠️ **Tre tal går inte att lita på ännu:**
- `satesoverdragaren.target_cpa_sek: 300` är en **gissning** från en tidigare chatt.
- `axelbaltet`: `products.json` säger break-even-CPA **299 kr**, `products/axelbaltet/dna.md`
  säger **326 kr**. Kill-beslut mäts mot break-even — fråga Axel vilken som gäller.
  Båda är dessutom räknade på gamla priset 509 kr och är för lågt satta vid 599 kr.
- **Bäverbutiken säljer UTAN moms** (Axels besked 2026-08-29) — precis som
  Grillkliniken. Marginalen räknas rakt på priset. Drar du reflexmässigt av 25 %
  ser lönsamma annonser ut att gå med förlust.

Alla `launches[]` i `products.json` är tomma. Kvotskriptet visar därför ett
minusläge som speglar utebliven loggning, inte utebliven produktion — logga med
`node pipeline/quota.mjs log <id> <antal>` så blir siffran sann.

### Människorna och kanalerna

Slack-workspace: **stonebite**. Team: filippinska videoredigerare + VA (engelska),
en UGC-outreach-ansvarig. Full tabell med Slack-ID:n finns i `HANDOFF.md`.

| Kanal | ID | Vad |
|---|---|---|
| `#bäver-scaling-products` | `C0BNJC83DMF` | De 4 skalningsprodukterna + dagsrapporter före 21:30 |
| `#video-editors` | `C0BGQBGDZBQ` | Hela redigerarteamet, även produkter utanför detta OS |

⚠️ **Annabelle Gonzales heter "Anna" i Slack. Hon är INTE Anna Odhner** (managern
som ska ta över systemet). Två olika personer — och den ena ska godkänna den
andras arbete.

⚠️ Fel Slack-workspace ger **tyst noll träffar**, inte ett felmeddelande.
Verifiera med en sökning på "bäver" — får du inget svar sitter du på fel workspace.

⚠️ **Redigerarna sitter i Asia/Manila (UTC+8), inte i Stockholm.**
`dashboard/data/team.json` säger `Europe/Stockholm` på Josh, Annabelle, Gilz och
Carl — det är fel och ska inte litas på. Räkna deadlines, morgonmeddelanden och
arbetstidsledtider i Manila-tid. 02–06 UTC i Notion-kommentarerna är förmiddag hos
dem, inte natt.

---

## Så lär sig systemet (läs det här innan du briefar något)

Minnet ligger i **filer**, aldrig i chatten. En ny session vet ingenting utom det
som står skrivet. Därför är det inte valfritt att uppdatera dem.

**Tre nivåer, från långsammast till snabbast:**

| Nivå | Fil | Ändras när |
|---|---|---|
| Vad som funkar generellt | `docs/playbook.md`, `docs/creative-strategy.md` | En vinkel bevisats i ≥2 tester |
| Vad som funkar för *den här produkten* | `products/<id>/dna.md` | Varje `/cs`-körning |
| Vad som hände i varje batch | `products/<id>/batch-log.md` | Varje launch och varje avläsning |
| Idéer som väntar | `products/<id>/backlog.md` | När ett koncept dyker upp eller plockas |
| Vad senaste briefronden missade — tre regler för nästa rond | `products/<id>/feedback.md` (bara produkter med mapp; för alla andra hubbar är Feedback-raden `Brief review <datum>` i själva hubben minnet) | Varje `/briefgranskning` (måndag + torsdag, hela Bäverbutiken); läses av Nattvakten i steg 0 och av varje briefskrivare (Skalnings kungen, `/cs`) innan nästa rond |

Fyra produkter har eget minne i dag: `motorholjet`, `satesoverdragaren`,
`strandtofflorna` och `axelbaltet`. Saknar en produkt `dna.md` **och** träff i
`git log --all` är den inte briefad ännu — skapa den med `/ny-produkt` i stället för
att gissa. Kolla alltid historiken först: axelbältets minne (7 batcher, 5
`/cs`-körningar, 37 459 kr spend, 127 köp) låg kvar på en gren i veckor medan
CLAUDE.md sa att produkten var obriefad.

**Regeln som gör att det faktiskt lär sig:** ett koncept får aldrig födas ur tomma
intet. Det ska kunna peka på en av tre källor — en playbook-vinnare, en winning line
som redan spenderat pengar bra, eller en konkurrent-signal ur `docs/swipes/`. Kan det
inte det är det en gissning, och då ska det märkas som en gissning.

`dna.md` är den viktigaste filen i hela repot. Den bär inte bara siffror utan
**rotorsaker** — t.ex. varför kontots copy inte matchar briefarna. Läs den först,
uppdatera den sist, och skriv ut datum + vilken körning i ordningen det var.

---

## Verktygsmapparna

`pipeline/`, `video/`, `voiceover/` och `pnl-app/` har **egen `package.json`** — kör
alltid deras kommandon inifrån mappen. `dashboard/` och `schema/` har det inte; de
körs från roten via npm-scripten ovan. Allt är ESM (`.mjs`) om inget annat sägs.

### `dashboard/` — redigerarpanelen
Spårningslagret. Notion är sanningen för *vad* som finns; dashboarden lägger på
*vem, när, hur mycket*.

```bash
node dashboard/notion-import.mjs   # Notion-rader → tasks (kräver NOTION_TOKEN)
node dashboard/build.mjs           # bygger dashboard/index.html
node dashboard/cli.mjs status      # läget i terminalen
```
`index.html` är självbärande — inga CDN:er, funkar offline, går att mejla.
`cli.mjs` har ~18 underkommandon (status, today, review-queue, new, deliver,
approve, kpi, export-csv …) — hela listan står som kommentar högst upp i filen.
**`cli.mjs` har ingen `build`** — HTML:en byggs av `build.mjs`.
Logiken bor i `lib/kpi.mjs`, `lib/model.mjs`, `lib/store.mjs`; datan i `data/*.json`.

### `bildannonser/` — Bäverbutikens bildannonser (kie.ai)
Motorn bakom `/bildannonser`-rutinen. Fristående, **inga npm-beroenden**
(inbyggda `fetch`). Kräver env `KIE_API_KEY`.

```bash
node bildannonser/run.mjs --jobb=<fil.json> --dry   # planen, inga credits
node bildannonser/run.mjs --jobb=<fil.json>         # skarpt
```
`kie.mjs` pratar med kie.ais jobb-API (`createTask` → polla `recordInfo`);
`run.mjs` läser jobbfilen, granskar den, genererar och skriver
`bildannonser/output/<datum>/_manifest.json`. Jobbfilen skrivs av rutinen ur
Notion — aldrig för hand. Utan referensbilder körs `google/nano-banana`, med
referensbilder `google/nano-banana-edit` (matchar en Winning Creative).

⚠️ `run.mjs` **vägrar** varje jobb vars `typ` inte är exakt
`Image - Pending Approval`. Videoraderna ligger i samma hubbar med nästan samma
namn (`..._4_1` är bild, `..._4_H1` är video) och görs av redigerarna.

⚠️ **Importera aldrig från `pipeline/` här** — det är Grillklinikens brand kit.

### `commission/` — redigerarnas commission
Motorn bakom `/commission`. Fristående, **inga npm-beroenden**.
**Läs-bara mot både Notion och Meta** — den ändrar ingen status och rör inte kontot.

```bash
node commission/run.mjs --torr                    # räkna och visa, skriv ingen fil
node commission/run.mjs --jobb <fil.json>         # Notion-raderna från MCP-sessionen
node commission/run.mjs --manad 2026-07           # räkna om en gången månad
```
`berakning.mjs` är ren räknelogik (16 tester), `meta.mjs` läser spend ur **alla**
annonskonton token:en når, `notion.mjs` läser hubbarna, `run.mjs` skriver
rapporten till `commission/korningar/<YYYY-MM>/<datum>.md`.

**Leaderboarden** (`leaderboard.mjs` + `valuta.mjs`, 18 tester) är samma siffror
som topplista för redigerarna:
https://claude.ai/code/artifact/8f3afdbc-f285-46bf-b55d-a75b9e7feebb
Den räknar aldrig om något — den läser rapportens tal, så sidan och utbetalningen
kan inte säga olika saker. `run.mjs` skriver `commission/leaderboard.json` vid
**varje** körning (även icke-kördagar); `leaderboard.mjs` bakar in datan i
`commission/leaderboard-publicerad.html` och rutinen publicerar om den filen mot
**samma URL** (`url`-parametern — utan den blir det en ny länk).
Sidmallen är `commission/leaderboard-sida.html`.

⚠️ **Sidan får aldrig deklarera runtime-capabilities.** Redigerarna har inga
Claude-konton, och en sida med `db` blir organisationsintern och släcks för dem.
Datan ligger därför inbakad i HTML:en och sidan delas med en öppen länk.

⚠️ **Sidans text är på engelska** — den läses av redigerarna, precis som
briefarna. Koden och kommentarerna i filen är svenska som resten av repot.

⚠️ **Två regler för topplistan, Axels beslut 2026-09-02:**
- **Spend visas aldrig** — varken totalt eller per person. `leaderboard.json`
  innehåller ingen spend alls. Bygg inte tillbaka den.
- **Beloppen står i USD.** Kursen hämtas en gång per dygn från ECB
  (`commission/valuta.mjs` → `valutakurs.json`) och visas med sitt datum på
  sidan. Rapporten i `korningar/` räknar fortfarande i SEK — den är kvittot.
- Perioden är kalendermånaden och nollställs av sig själv den 1:a.

Satsen är 0,4 % och står som `SATS` i `berakning.mjs`. Bara `role: "editor"` i
`dashboard/data/team.json` får utbetalning — spend på Axels rader, på rader utan
Ansvarig och på okända Notion-användare redovisas separat som obetald.

⚠️ **Endast svenska annonser ger commission** (Axels beslut 2026-08-31).
Marknadskontona (NO, DK, FI, UK, Snark mexico, SNarklös FI, Norge, Finland DK,
NYC Grill) filtreras bort, liksom annonser med marknadskod i namnet. Listan står
som `UTLANDSKA_KONTON` i `commission/berakning.mjs`.

⚠️ **Valutor summeras aldrig.** NYC Grill-kontot är i USD, resten i SEK.

⚠️ **Kopplingen annons → person görs i två steg** (`commission/koppling.mjs`):
hubbraden per annons först — både `Enginecover_PD_22_H1`-systemet och
Grillklinikens löpnummer (`235 H1` → raden `235`) — och produkten per kampanj
som reserv via `commission/produkter.json`. **Filtrera aldrig hubbraderna på Typ
eller Status**; en rad med Ansvarig är gjord av någon. *(Incident 2026-08-31:
Typ-filtret dolde hela Masterns produktion och gav 33,74 kr i stället för
2 260 kr.)* Hubbarna står i `commission/hubbar.json` — 12 svenska över tre
verksamheter, inte bara Bäverbutikens.

⚠️ **Redigerare utan Notion-konto räknas via KOMMENTAR** (`commission/kommentarer.mjs`,
Axels besked 2026-09-15). **Jerzee** har aldrig fått ett Notion-konto och kan därför
aldrig stå i kolumnen Ansvarig — hans rader märks i stället med en kommentar
("jerzee is working on this", "By Jerzee"), skriven från gästkontot
`05b30396-13bd-41c1-b205-94169150bde3`. Han ligger i `team.json` med det syntetiska
id:t `kommentar:jerzee` + fältet `notionKommentarMonster`. Två järnregler: **Ansvarig
vinner alltid** (kommentaren används bara på rader där Ansvarig är tom), och **två
personers mönster på samma rad ger ingen** — hellre okopplat än fel person.
Mätt 2026-09-15: 50 rader i 8 hubbar. Bara rader utan Ansvarig kostar ett API-anrop.
`--utan-kommentarer` stänger av steget.

⚠️ **OPS-butikernas hubbar RÄKNAS i commission sedan 2026-09-15** — till skillnad
från alla andra Bäverbutiks-rutiner. Commission är läs-bart och kan inte ladda upp i
fel konto, medan spenden i OPS-kontot räknas med ändå: utan hubbarna föll de
annonserna tillbaka på produktens ägare i `koppling.mjs`, så **Josh fick betalt för
Jerzees, Gilz och Jaspers arbete**. Mätt samma dag, två körningar med minuters
mellanrum: utan hubbarna Josh 442,36 kr / Jerzee 0,43 kr; med dem Josh 421,55 kr,
Jerzee 6,12 kr, Gilz +4,60, Jasper +3,22, Carl +1,09 — alltså ~21 kr på fel person.
`--utan-ops-hubbar` återgår till det gamla beteendet. **Rör inte spärren i de andra
rutinerna** (`tools/lib/ops-hubbar.mjs`): där handlar den om vilket annonskonto som
laddas upp till, och det problemet finns fortfarande.

⚠️ **De fyra skalningsprodukternas creative hubs är ARKIVERADE i Notion** och
syns inte i en teamspace-sökning. Hubbarna måste därför alltid unionsläggas med
`products.json`. `run.mjs` avbryter om en känd hubb saknas eller om noll godkända
rader lästes. *(Incident 2026-08-31: rutinen hittade 2 hubbar av 6 och
rapporterade 0 kr som augustis slutavräkning.)*

### `kundtjanst/` — veckorapporten för kundtjänst och chargeback-risk (alla brands)
Motorn bakom `/kundtjanst`. Fristående, **inga npm-beroenden** (egen IMAP-klient
över `node:tls`, egen MIME-tolkning, inbyggd `fetch`). **Läs-bara** mot mejlen
(EXAMINE + BODY.PEEK — inget markeras som läst) och Shopify (bara GET).

⚠️ **IMAP går inte från claude.ai-containern** (mätt 2026-09-12, detaljer i
`kundtjanst/README.md` → "Nätet"): proxyn tar emot `CONNECT` till 993 men bryter
tunneln under TLS — mot Loopia, Gmail och Office 365 lika, medan 443 går.
Klienten säger det själv (`PROXY_SPARRAR_PORTEN`), och `run.mjs` byter då
(`mail.via: auto`) till **Loopias webbmejl över HTTPS** (`kundtjanst/webmail.mjs`:
Roundcube 1.7 på `https://webmail.loopia.se/`, avläst 2026-09-12 — logga in,
lista nyast först, `viewsource` per mejl, logga ut; läs-bara). Samma lösenord som
brevlådan, ingen vidarebefordran. Byter Loopia Roundcube-version säger felet
vilket steg (1–6) som inte stämde. IMAP direkt fungerar där nätet är öppet
(lokalt, cron, Railway); `--jobb <fil.json>` finns kvar för brevlådor som inte
är på Loopia. Bygg aldrig om IMAP-klienten "för att den inte svarar" — det är
nätet.

```bash
node kundtjanst/run.mjs --kolla                    # vilka brands, vilka nycklar saknas
node kundtjanst/run.mjs --brand tacklebay --torr   # provkör ett brand, skriv inget
node kundtjanst/run.mjs --alla --discord           # rutinen
node kundtjanst/setup.mjs                          # nycklarna per brand + rutinens cron (måndag)
node kundtjanst/setup.mjs --nytt-konto             # receptet för ett annat Claude-konto
node kundtjanst/run.mjs --fixtur kundtjanst/test/fixturer/demo --torr --datum 2026-09-14   # demo utan nät
```

**Brands upptäcks, listas aldrig:** varje `factory/butiker/<id>.yaml` är ett
brand (namn, supportmail, myshopify-domän därifrån); butiker fabriken inte byggt
får `kundtjanst/brands/<id>.yaml` (mall `brand-mall.yaml`; Bäverbutikens fil bär
`kundsupport@baverbutiken.se` — ⚠️ sajtens sidfot visar `kundsupport@baverkoppling.se`,
men den domänen saknar MX-post helt (mätt 2026-09-12 via DNS) och webbmejlen nekar
inloggning med den. Första lyckade läsningen 2026-09-12 med baverbutiken.se-adressen:
INBOX 264 mejl, INBOX.Sent 9). Hemligheterna
heter `KUNDTJANST_MAIL_PASS_<ID>` (Loopia, krävs), `SHOPIFY_ADMIN_TOKEN_<ID>` eller
fabrikens `SHOPIFY_CLIENT_ID_<ID>` + `SHOPIFY_CLIENT_SECRET_<ID>` (ordrar + tvister,
valfritt), samt delade `NOTION_TOKEN`, `DISCORD_BOT_TOKEN`, `ANTHROPIC_NYCKEL`
(valfria). **Samma repo körs på vilket Claude-konto som helst** — bara nycklarna
och brandfilerna skiljer; `setup.mjs --nytt-konto` skriver ut receptet.

⚠️ **Perioden är 30 dagar (`arenden_dagar`), inte 7** — rättat 2026-09-13 efter
Axels invändning "jag tror inte det där var alla mejl". Med 7 dagar föll varje
obesvarat ärende äldre än en vecka ur rapporten, alltså precis de farligaste.
Mätt samma dag på Bäverbutiken: **7 dagar gav 45 ärenden / 37 obesvarade,
120 dagar gav 321 / 205**. Sänk aldrig tillbaka fönstret för att rapporten ska
se lugnare ut. `--dagar <n>` finns kvar för en djupdykning.

Flödet: `imap.mjs`/`mime.mjs` → `arenden.mjs` (trådar, obesvarat, svarstid) →
`klassificering.mjs` (regler, 14 kategorier, sv/no/da/en/fi) → `chargeback.mjs`
(signaler med tak → 0–100, 🟢 < 25, 🟡 25–50, 🔴 > 50; tvistgrad mot Visa 0,9 % /
Mastercard 1 %; "återkommande" = topp 3 i 3 av 4 veckor, kräver tre veckors
historik) → `rapport.mjs` (svenska till Axel, engelska till VA:n/Discord).
`llm.mjs` (valfri) klassar bara "övrigt"-högen och skriver en mening per
toppärende — **reglerna dömer, modellen hjälper**, annars går trenden inte att
läsa vecka mot vecka. `notion.mjs` mäter vilka toppärenden som saknar SOP i VA:ns
Notion-databas (`notion.sop_database_id` i brandfilen).

Skriver `kundtjanst/korningar/<brand>/<vecka>.md` (+ `.en.md`),
`korningar/_ranking/<vecka>.md` och `historik/<brand>.jsonl` — historiken är det
som gör "återkommande" mätbart, så den committas.

**Hemsidan** (Axels beslut 2026-09-12: "en hemsida som lagrar all data"):
https://claude.ai/code/artifact/b318db7b-7623-47df-af8c-55e528771207 —
`kundtjanst/rapportsida.mjs` bakar `korningar/<brand>/<vecka>.json`
(`dashboard.mjs`) och historiken till `kundtjanst/rapport-publicerad.html`
(mall `rapport-sida.html`), och rutinen publicerar om filen mot **samma URL**
varje körning (länken står i `kundtjanst/rapportsida.json`; utan `url` blir det
en ny sida). Samma regler som topplistan: ingen runtime-capability, datan
inbakad, sidan räknar aldrig om något. **Autosvaret på sidan sedan 2026-09-22**
(sektionen *Auto-reply*; kontraktet är `kundtjanst/autosvar/DASHBOARD.md`):
loggens 30 dagar per butik via `autosvar/oversikt.mjs` — aldrig omräknat —
plus `INBOX.VA-PRIO` läst live när mejlnyckeln finns (`rapportsida.mjs` →
`hamtaVaKo`, läs-bara, `--utan-brevlada` hoppar). Utkast (`torr: true`) visas
som utkast, aldrig som skickat. Sidan kör aldrig `autosvar.mjs` och skriver
aldrig i `autosvar/logg/`. **Tvisterna över alla butiker på sidan sedan
samma dag** (sektionen *Disputes now — all stores*; kontraktet
`kundtjanst/DASHBOARD-TVISTER.md`): öppna tvister ur
`stonebite/data/snapshot.json`, brådskan ur `tvistkoll.mjs --alla --torr
--json` som `rapportsida.mjs` kör själv (argumenten frysta — aldrig
`--discord`; `--utan-tvistkoll` hoppar). Chargebacks överst per butik, pengar
i risk per valuta utan summering, *overdue* och *due today* som två stämplar,
"submit by" = deadline − 1 (bevis sist, kundmejlet i dag), handbokslänk per
rad (`kundtjanst/handbok.json`). Okänd butik = orsaken ordagrant, aldrig noll;
**ingen dom** (tvistfakta har inget `--json`). ⚠️ Vilka butiker som går att
läsa beror på containerns nycklar: dashboard-sessionen saknade
`SHOPIFY_CLIENT_ID_BAVERBUTIKEN_EMAILSCRAPER` och fick 403 där timrutinen
läste 10 tvister — sidan visar då snapshotens rader med orsaken bredvid.

⚠️ **Ombyggd 2026-09-13 efter Axels dom "den suger fan legit".** Tre fel var
verkliga och alla tre är rättade: sidan var på svenska fast **VA:n läser
engelska** (nu engelsk, med EN/SV-knapp för etiketterna), den visade
rapporttext men **ingen arbetslista** (nu: åtgärdsplan i tre hinkar ur
`atgardsplan.mjs`, arbetskö per ärende med ordernummer och väntetid, tvister
med `evidence due`, kategorier med SOP-status), och den byggde på en
**7-dagarsperiod som dolde backloggen** (se perioden ovan). Sidan svarar också
på "har du läst alla mejl?": mejl in → ärenden, och vad som filtrerades bort.

Kundadresser maskeras (`ka***@gmail.com`) i allt som skrivs eller postas;
ordernumret är nyckeln. Tvister som inte går att läsa rapporteras som okända,
aldrig som noll. Ett brand utan lösenord hoppas över med variabelnamnet i
rapporten; en körning där inget brand lästes ger exit 1. 111 tester utan nät
mot fixturen `kundtjanst/test/fixturer/demo/`.

**`tvistkoll.mjs` är ett eget, dagligt spår** (Axels beslut 2026-09-13, valt ur
tre alternativ): veckorapporten går måndag 07:00, så en tvist som kommer in på
tisdag med deadline på torsdag hinner gå ut innan nästa körning. Tvistkollen läser därför **bara** Shopifys
tvister (180 dagar bakåt; deadline avgör brådskan, inte startdatum), plockar de
öppna som ska besvaras inom 3 dagar, hämtar ordernumret för just dem och postar
en engelsk lista i brandets Discord. Inga mejl, ingen modell, **inga filer och
ingen push** — tystnad när inget brådskar. Mätt vid bygget 2026-09-13 på
Bäverbutiken: 47 tvister, 14 öppna, 1 brådskande (#4914, 348 kr, deadline
2026-09-16). Bygg aldrig in ärenden, kategorier eller ranking i den; blir den
långsam slutar den köras, och då är luckan tillbaka.

**`kundtjanst/mail.mjs` + `mail-mcp.mjs` — inkorgen som CLI och som egen
MCP-connector `loopia-mail`** (Axels fråga 2026-09-21: "bygg din egna mcp
connector så att du kan läsa av min mail inkorg"). Läs-bara över webbmejlen,
samma nyckel som veckorapporten. `node kundtjanst/mail.mjs lista | las <uid> |
sok "<ord>" [--kropp]`, och `.mcp.json` i roten ger varje Claude Code-session
i repot verktygen `mail_brands`, `mail_folders`, `mail_list`, `mail_read`,
`mail_search` — inga `mcp__Gmail`, ingen vidarebefordran. Servern loggar in
igen själv när Roundcube-sessionen gått ut och kör anropen ett i taget (två
parallella inloggningar gav 403, mätt vid bygget). Kundadresser står i
klartext i utdata — maskera före Discord/Notion. `kundtjanst/README.md` →
"Brevlådan som CLI och som egen MCP-connector". **Skrivning sedan 2026-09-21**
(för autosvaret): `mail.mjs svara|utkast|flagga|flytta|mapp` och verktygen
`mail_reply` (skickar — går inte att ångra, `destructiveHint`), `mail_draft`,
`mail_flag`, `mail_move`. Aldrig radera, aldrig markera som läst.

**`kundtjanst/autosvar.mjs` — svarar på enkla mejl själv, lugnar arga, flaggar
svåra** (Axels uppdrag 2026-09-21, alla butiker). Rena regler i
`autosvar/hinkar.mjs`, mallar på fem språk i `autosvar/svar.mjs` (Axels
ARG-mall ordagrant på svenska), fakta i `autosvar/fakta.mjs` (Shopify-order
på nummer eller e-post — orderns e-post MÅSTE vara avsändarens; 17TRACK läses
gratis, registreras aldrig; länken till butikens spårningssida bär
bävernumret), loggen i `autosvar/logg/<butik>.jsonl` (maskerad + kundhash).
Ingen modell. `--torr` skriver utkast i Drafts; skarpt kräver `--skarpt`.
Inställningarna per butik står i brandfilens `svar:`-block
(`kundtjanst/brand-mall.yaml`): signatur, leveranslöfte, packtid,
spårningssida, VA-mapp, svarstid. Kommandofil `.claude/commands/autosvar.md`.
Byggt mot en falsk Roundcube (183 + 21 tester) och **kört mot Bäverbutikens
riktiga brevlåda 2026-09-21 kväll (`--torr`)**: fyra utkast i Drafts, lästa
tillbaka — formen rätt (språk, signatur, order ur Shopify, spårningslänk med
bävernummer, kundens mejl citerat under), men två av fyra gick till kunder
VA:n redan svarat. Fyra saker brast och är rättade samma kväll: webbmejlens
skrivväg (302 i steg 7, `INBOX.`-prefixet i steg 11), Discords 2000-teckenstak,
och trådbyggaren som bara läste första sidan av Skickat (nu `mappIndex`: hela
listan 30 dagar bakåt, en gång per körning; `tolkaListdatum` läser Roundcubes
"Today 23:28"/"Wed 05:40"/"2026-08-19 17:12"). Den falska servern i testerna
härmar det riktiga svaret. En rad med `atgard: 'fel'` i loggen räknas inte
som hanterad, så ett mejl vars svar inte gick att spara prövas igen nästa
körning. Axels ordning var 20 utkast i rad rätt → `--skarpt`; **skarpt på
Railway sedan 2026-09-23** (hans beslut A, se stonebite-avsnittet).

**`kundtjanst/sop/` — VA:ns tvisthandbok, portabel över ALLA butiker**
(Axels uppdrag 2026-09-20: "sop:er som går att föra över till andra varumärken;
backend hanteras likadant på alla butiker"). 13 dokument på engelska + ett
beslutsblad per öppen tvist i `sop/beslut/`. `sop/README.md` är den enda filen
på svenska — den är skriven till Axel, resten till VA:n.

⚠️ **Det som avgör allt, mätt på 50 tvister 2026-09-20:** inquiries 29 av 29
avgjorda **vunna (100 %)**, chargebacks **1 av 4**. Alla tre förluster någonsin
(1 435 kr) var chargebacks. En obesvarad inquiry förloras alltså inte — den
**eskalerar till chargeback**, och det är hela kostnaden av att strunta i den.
Och det som avgör den enskilda tvisten är EN sak: **finns en leveransskanning?**
Elva av tolv granskade paket hade en; det tolfte (#5584) gick inte att vinna.

**Två verktyg gör handboken körbar i stället för läsbar:**
- `node kundtjanst/tvistfakta.mjs <ordernr> [--brand <id>] [--registrera]` —
  hämtar order, tvist, återbetalningar och leveransskanning och skriver ut
  **FIGHT / REFUND / ESCALATE** med bevislista och risk, på engelska. `--alla`
  tar hela kön. Domen är en ren funktion (`dom()`), så den går att ändra och
  testa utan nät. ⚠️ Paket äldre än spårningsrutinens fönster är inte
  registrerade hos 17TRACK och svarar *"does not register, please register
  first"* — `--registrera` fixar det och kostar kvot.
- `npm run sop` (`kundtjanst/sop-koll.mjs`) vaktar portabiliteten: felar om en
  platshållare glidit isär eller ett butiksnamn smugit in i procedurtext.
  `--fixa` normaliserar, `--lista` visar alla `{{PLATSHÅLLARE}}`. Den körs i
  `npm test`. Utan den spricker portabiliteten tyst — när SOP:erna skrevs hade
  samma värde redan tre namn (FIGHT_THRESHOLD / FIGHT_WORTH_IT_ABOVE /
  FIGHT_ABOVE), och 110 namn fick normaliseras.

**En ny butik får tvisthantering genom att fylla `tvister:`-blocket i sin
brandfil** (`kundtjanst/brand-mall.yaml`, läst av `brands.mjs`): returadress,
returfönster, ångerrätt, policy-URL, billing descriptor, beloppsgräns. Inget
annat. ⚠️ **Returfönstret räknas från MOTTAGANDET, inte från ordern** — med
3–4 veckors leveranstid är det en helt annan dag, och VA:n dömde #5435 fel på
just det. Bäverbutikens värden är avlästa ur den publicerade policyn
(30 dagars retur + 14 dagars lagstadgad ångerrätt), inte gissade.

⚠️ **Rotorsak som inte är en SOP-fråga:** butikens returpolicy ber kunderna
mejla `kundsupport@baverkoppling.se` — domänen saknar MX-post helt (mätt
2026-09-12), så mejlen landar ingenstans. Policysidan är det kunden läser när
något gått fel. Flera tvister är märkta "no conversation"; en del av dem kan
vara kunder som faktiskt hörde av sig.

**`kundtjanst/va-sop/` — VA:ns vardags-SOP:ar, filerna är källan och Notion är
visningen** (byggd 2026-09-21 när spårningssidan låg live i sex butiker men
SOP:erna fortfarande skickade VA:n till fraktbolaget först). **Alla 36 sidor**
i Notion-databasen **"Customer support bäverbutiken"** `3aa270ab-908c-8057-a8a0-cc691d9e956b`,
skrivna av `node kundtjanst/va-sop/skriv.mjs` (`--torr` först, `--bara <fil>`
för en sida) enligt `notion.json`.

⚠️ **Mätt vid bygget: varje SOP-rad hade Notions tomma svenska standardmall i
kroppen** (Bakgrund / Analys / Rekommendationer / Implementering) **och hela
SOP:en som Word-PDF i egenskapen `Filer och media`.** Ingen kunde söka i dem och
ingen laddar ner en PDF mitt i ett kundmejl. Texten står nu i sidan; bilagan
ligger kvar orörd (den är en egenskap, inte block). Skrivaren känner igen exakt
den mallen och **vägrar skriva över en kropp med annat innehåll** — den hoppar
och säger varför; `--ersatt-allt` krävs för att ändå köra.

Två sidor bär hela portabiliteten: **`00-STORE-FACTS.md` är den ENDA sidan som
ändras per brand** (butikstabell, avsändarland, ägarens värden), och
**`01-TRACKING-PAGE.md`** är uppslagsrutinen som alla leverans-SOP:ar pekar på:
Shopify-orderns fulfillment-tidslinje (rutinen skriver skanningarna dit varje
timme) → butikens egna spårningssida → fraktbolagets portal som RESERV. Ingen
procedurtext nämner ett butiksnamn, en domän, ett fraktbolag eller en adress.
Hittar du ett värde som måste ändras för ett brand hör det hemma i Store facts.
Ny butik inför Q4 = duplicera databasen, ändra Store facts, klart.

⚠️ **Kunden får butikens paketnummer (`BB-`/`CS-`/`MS-`) och sidlänken, aldrig
fraktbolagets nummer** (`YT…`, `4PX…`) — det är bankens, i en tvist. Sidan visar
däremot sista-bitens fraktbolag med namn, eget nummer och länk när paketet nått
kundens land (`sparning/sistabiten.mjs`; 432 av 1 055 paket hade inget ännu
2026-09-20), så bolagets NAMN är inte hemligt — numret är.
⚠️ **Leveransfönstret skrivs ALDRIG i ett kundmejl som bär spårningslänken**
(Axels order 2026-09-21: "ta bort det, det står ju redan estimerad leverans på
tracking-sidan"). Sidan visar Beräknad leverans själv, så en mening om det i
mejlet är brus kunden redan läst. Talet står EN gång i Store facts och är VA:ns
eget mått på om ett paket är sent — och citeras bara när ordern ännu inte
skickats och det inte finns någon länk att ge. Första versionen hade det i 71
rader, inklusive varje kundmall; nu i 8, alla interna.

⚠️ **Löftet skrivs i ARBETSDAGAR: 5–10, aldrig "7–14 dagar"** (Axels order
2026-09-21: "ta bort din jävla 7–14 dagars frakt överallt och säg 5–10
arbetsdagar som vi brukar ha"). Han hade rätt och det var värre än så: alla
butikers egna fraktsidor (`factory/butiker/*.yaml` → `frakt.leveranstid`) har
**alltid** sagt 5–10 arbetsdagar. Det var mejlen som sa 7–14 kalenderdagar och
SOP:erna kopierade mejlen. **Samma fönster, fel enhet** — 5 arbetsdagar = 7
kalenderdagar, 10 = 14 — så datumen i mejlen och på spårningssidan räknas
fortfarande på kalenderdagarna (`mejl/konfig.json` `leverans_dagar_min/max`
7/14) och kunden ser samma datum som förut. Ändra aldrig det ena utan det
andra. De interna trösklarna räknas också i arbetsdagar ("past 10 business
days", inte "day 14"). ⚠️ Mejlmallarna på Shopify-servern bär ännu 7–14 — de
kräver en ny inklistring per butik (`mejl/output/butiker/<id>/COWORK-PROMPT.md`).
⚠️ Sexton **⚠️ OWNER**-
markörer står kvar i texten — sök på ordet i Notion, det är Axels frågelista
(CaraShells "Skickas från Sverige", tull i US/GB/CA/AU/NZ, Klarna-tvisternas
portal och deadline). Returfrakten är avgjord 2026-09-21: **kunden betalar och
ordnar den, ingen returetikett skickas** — som butikens befintliga retur-SOP
alltid sagt (`brands/baverbutiken.yaml` → `returfrakt_betalas_av: kund`).

⚠️ **Skrivaren känner igen sin EGEN text:** börjar Notion-sidans kropp med exakt
filens H1 är det en uppdatering och den kör på; allt annat innehåll stoppar den
fortfarande. Utan det gick sidorna inte att uppdatera en andra gång utan
`--ersatt-allt`. Varje SOP-fil måste därför ha en `# rubrik` — den som saknade
en (`order-confirmation-not-received.md`) hoppades tyst över.

**Hela basen är genomgången, inte bara leveransdelen** (Axels fråga 2026-09-21:
"har du kollat igenom ALLA pdf-SOP:er?"). Alla 34 PDF-bilagor lästes och
inventerades; 18 sidor skrevs om i första omgången (spårningen) och de
återstående 18 samma dag. Tre fynd var allvarligare än formuleringar:
**`LOG IN TO EMAIL ACCOUNT` bar ett lösenord i klartext tre gånger** (och bara
Grillklinikens brevlådor, i Bäverbutikens bas) — den nya sidan säger var
lösenord hör hemma och ber Axel byta det; **`Technical issues during purchase`**
hade meningen "the customer is actually really stupid" i sin AI-prompt;
**`Refund 3 step proccess`** sa åt VA:n att skriva "vi diskuterade det internt"
till varje kund (osant, och det syns direkt när någon får samma mening två
gånger) och körde ångerrätten rakt in i ett delåterbetalningserbjudande. Alla
tre är borta. `READ ME` — som sa åt VA:n att SOP:erna gällde ett annat brand och
skulle tas "med en nypa salt" — är nu **Start here**, basens routningstabell
från kundfråga till sida. Fyra dubbletter pekar på varandra i stället för att
säga emot varandra (betalning utan order ×2, checkout-problem ×2).

Skild från **`kundtjanst/sop/`**: den är tvisthandboken (chargebacks/inquiries,
`{{PLATSHÅLLARE}}` ur brandfilen, vakten `npm run sop`). Den här basen är
vardagen och skickar VA:n vidare dit första timmen.

⚠️ **Tvisthandbokens tolv sidor publiceras i SAMMA Notion-bas sedan 2026-09-21**
(Axels fråga: "vart kan man se chargeback-procedurerna? Jag vill att Mechile ska
lära sig det"). Den låg bara i repot, där VA:n inte kan läsa den — och den är
det enda som avgör om en chargeback vinns. Raderna i `notion.json` bär `kalla:
"../sop/<fil>.md"` i stället för `fil:`, och `kundtjanst/sop/fyll.mjs` fyller
butikens platshållare ur brandfilen vid publicering: **ett värde som saknas blir
en synlig `⚠️ OWNER`-rad, aldrig ett tomrum** (Bäverbutiken saknar inget sedan
Axel läste av descriptorn 2026-09-21: `SP Baverbutiken.se`, supportnummer
+46 79 340 44 07, i Shopify admin → Settings → Payments → Uppgifter för kundens
kontoutdrag); ärendets fält blir tomrum VA:n fyller i (`[ORDER
NUMBER]`); filnamnen byts mot Notion-sidornas titlar; mejlmallarna blir riktiga
kodblock (utan det klappar varje mall ihop till ett stycke och går inte att
kopiera); varje sida får en rad överst om att repot skriver den.
⚠️ **Källfilerna fylls ALDRIG i** — behåller de inte sina platshållare är
handboken inte portabel till nästa brand. `kundtjanst/test/va-sop.test.mjs`
bevisar båda halvorna. Facit på vad som avgör en tvist står i handboken och är
mätt, inte gissat: inquiries 29 av 29 vunna, chargebacks 1 av 4, och det som
avgör den enskilda tvisten är om det finns en leveransskanning.

### `pipeline/` — bildannonser (Grillkliniken/Mastern, legacy)
⚠️ **Trots mappnamnet är det här inte Bäverbutiken.** `brand.mjs` sätter
`LOGO_WORDMARK = 'GRILLKLINIKEN'` och grillfärger, och `package.json` säger
"bildannonser för Mastern". Bäverbutikens bildannonser bor i `bildannonser/`.

Två steg, för att bildmodeller är dåliga på text: Higgsfield Soul genererar en
fotorealistisk bas med medvetet mörk tomyta → `compose.mjs` lägger rubrik/badge/
footer som skarp vektortext ovanpå med `sharp`.

```bash
cd pipeline && npm install
export HF_API_KEY="..." HF_SECRET="..."
npm run dry                      # förhandsgranska layout utan Higgsfield
node run.mjs --wave=01 --limit=2 # skarpt
```
Ny annons = ett objekt i `waves/wave-XX.mjs`. Färger/typsnitt/canvas ändras på ett
ställe: `brand.mjs`.

**Vid sidan av vågsystemet ligger fyra fristående engångsskript** som *inte* läser
`brand.mjs` och hårdkodar egen layout: `b020-format.mjs` (kontots bäst presterande
format, ROAS 2,53 — värt att utgå från), `swipe.mjs`, `swipe2.mjs`, `grab.mjs`.
Ändrar du brandkittet slår det alltså inte igenom där.
⚠️ `swipe.mjs` och `swipe2.mjs` importerar `axios` utan att det står i
`package.json` — det funkar bara på en lyckträff. Deklarera det om du rör dem.

### `video/` — videoannonser (9:16 för Reels/Stories)
Speglar bild-pipelinen: modellen renderar **rörelsen**, vi bränner **skarpa
captions** ovanpå med ffmpeg. Manus-tänket bor i `docs/creative-strategy.md` — läs
det först, koden är bara verktyget.

```bash
cd video && npm install
export HF_API_KEY="..." HF_SECRET="..."   # samma nycklar som pipeline/
node run.mjs --dry                        # storyboard utan att generera
```
Kräver `ffmpeg` + `ffprobe` i PATH för skarp körning (`compose.mjs` kollar det och
felar tydligt). Ett koncept = ett objekt i `video/waves/wave-XX.mjs`, och det ska
peka på sin källa i en kommentar.

### `voiceover/` — ElevenLabs
Fristående, **inga npm-beroenden** (använder inbyggda `fetch`).
```bash
cd voiceover
export ELEVENLABS_API_KEY="..."
npm run vo:dry                   # se alla manus + teckenantal utan att bränna API
npm run vo                       # generera mp3
npm run voices                   # lista tillgängliga röster
```
Default: rösten `Svensk Martin` + modellen `eleven_v3` (förstår taggar som
`[paus]`, `[viskar]` mitt i texten). Manus ligger i `voiceover/scripts/<annons>/`.

### `market-expansion/` — nya marknader (DK, NO, UK)
Rena arbetsdokument, ingen kod. Börja i `market-expansion/README.md` och
`BESLUT.md`. Batcherna ligger i `<land>/batches/`.

### `pnl-app/` — StonePNL, P&L som Shopify-app

⚠️ **Den riktiga appen ligger INTE på `main`.** StonePNL (publicerad i App
Store 2026-09-05, sex Railway-tjänster) byggs från grenen
**`claude/bäverbutiken-settkopplingen-nba21z`** — push dit deployar till alla
sex tjänster. Kopian av `pnl-app/` på `main` är en gammal snapshot och ska
inte utvecklas vidare. Börja alltid i den grenens `pnl-app/CLAUDE.md`
(572 rader: arkitektur, misstagslogg, backlog). *(Mätt 2026-09-08: en session
byggde Meta-knapp och växelkurs på main-kopian — båda fanns redan på den
riktiga grenen sedan 2026-09-07.)*

Riktig applikation, inte ett skript: Remix + Prisma + Docker, kopplad till både
Shopify och Meta. Visar täckningsbidrag per produkt. TypeScript, inte `.mjs`.
```bash
cd pnl-app && npm install
npm run setup       # prisma generate && prisma migrate deploy
npm run dev         # Shopify CLI app dev
npm run typecheck   # tsc --noEmit
npm run build
```
Setup och tokens: `pnl-app/README.md` + `pnl-app/docs/meta-token.md`.

### Övrigt
| Mapp/fil | Vad |
|---|---|
| `pipeline/ads.mjs`, `meta.mjs` | Laddar upp creatives till Meta som **PAUSED** |
| `tools/leveranskon.mjs` | Kön för `/notionkorning`: Notion-rader i `To be Reviewed` med fil, kopplade till kampanj i kontot (`--drive` läser även gamla Drive-mappar) |
| `tools/notion-aterkoppling.mjs` | Kommentar på en Notion-rad, och `--status Draft` för en stoppad bildannons (REST, `NOTION_TOKEN`) |
| `tools/qa-frames.py` | Drar frames ur en levererad video (tätt i hooken) så briefkontrollen går att göra på riktigt |
| `tools/notion-klara.mjs` | Läser creative-hubbarna via Notions REST API (`NOTION_TOKEN`) — reservväg när MCP:n saknas |
| `tools/notion-kalla.mjs` | Notion som leveranskälla: hittar alla creative hubs dynamiskt, plockar rader med färdig fil |
| `tools/notion-fil.mjs` | Hämtar hem en Notion-bilaga (signerad URL, kortlivad — hämta vid körning, cacha aldrig) |
| `tools/notion-brief-upp.mjs` | Lyfter EN brief.md till en creative hub som Notion-rad via REST (`NOTION_TOKEN`), i NOTION-FORMAT.md:s form, hela briefen i sidan. Vägrar dubbletter (namnet finns redan i hubben), läser tillbaka kroppen och skriver FEL om blocken inte stämmer. Byggd 2026-09-22 när en brief bara låg i repot — "briefer som bara ligger i repot finns inte för redigerarna" (Axel) |
| `tools/notion-fil-upp.mjs` | Laddar upp en LOKAL fil till en rads `Filer och media` via REST (File Upload API, max 20 MiB) — befintliga filer behålls, tillbakaläsning före statusbyte. Ingen Notion-MCP behövs |
| `factory/ops-bild.mjs` | OPS-butikens bildmotor: Draft-bildrader med IMAGE PROMPT → kie.ai → **textlagret** → Notion (Draft kvar), `--godkann`/`--underkann` efter granskning, `--namn` för lediga AD-ID:n |
| `factory/bild-text.py` | Textlagret (Pillow): briefens exakta rader — rubrik, underrad, pris/jämförpris/rabatt, badge, etiketter, citat, botten — som vektortext ovanpå fotot, brandets färger. Bildmodellen ritar aldrig text. *(Byggt 2026-09-15: CaraShells fyra bildannonser gick live utan rubrik och pris)* |
| `tools/ops-byt-bild.mjs` | Byter bilden i en annons som redan är live (ny creative, samma spec, annonsen pekas om) — utan paus, namnbyte eller nytt adset |
| `products/prefix-alias.json` | Annonsprefix som inte går att härleda ur kontot (Notion engelska, kontot svenska) |
| `tools/notion-till-meta.mjs` | Laddar upp EN godkänd creative i produktens CBO, med spärrar mot fel konto och mot att röra avstängt |
| `tools/annonskommentarer.mjs` | Kommentarerna på top spendern → `products/<id>/kommentarer.md`, kluster ≥ 3 ⇒ INVAND-variant (`kalla=voc`). Läs-bara. Kräver sidtoken (hämtas ur `/<page>?fields=access_token`) — och att `META_ACCESS_TOKEN` bär `pages_read_engagement`, annars svarar Meta `(#200) Missing Permissions` |
| `pipeline/batch.mjs`, `multi-batch.mjs`, `uk-wave.mjs`, `mastern-batch.mjs` | ⚠️ Laddar **inte** upp som PAUSED — se regeln under "Saker som är lätta att göra fel" |
| `pipeline/waves/*.config.mjs` | Vågkonfig per marknad — `se-`, `dk-`, `no-`, `uk-` |
| `pipeline/localize.mjs`, `heygen.mjs`, `veed.mjs`, `cover-srt.py` | Översätter färdiga videoannonser till nya språk (`docs/video-localization.md`) |
| `schema/generate.mjs` | Genererar arbetsschema som `.ics` |
| `whop-downloader/` | Python-verktyg, laddar ner kursmaterial |

---

## Saker som är lätta att göra fel

- **Allt som postas i Discord är på engelska** (Axels order 2026-09-05) — teamet
  i servern är engelsktalande. Rapporten till Axel i chatten är svensk; Discord-
  versionen av samma rapport är engelsk, med produkt-, kanal- och kampanjnamn i
  sin vanliga stavning. Postarna (`tools/notify-discord.mjs`,
  `pipeline/discord-brief.mjs`) stoppar svensk text med exit 3, eller översätter
  den automatiskt när `ANTHROPIC_NYCKEL` finns i environmentet. Stoppas ett
  skick: skriv om på engelska och skicka igen — hoppa aldrig över rapporten.
  ⚠️ **Nyckeln heter `ANTHROPIC_NYCKEL` på claude.ai, inte `ANTHROPIC_API_KEY`.**
  Claude Code gömmer exakt namnet `ANTHROPIC_API_KEY` för allt som körs via
  Bash (mätt 2026-09-10: variabeln stod i Claude-processen men saknades i
  skalet, medan `NOTION_TOKEN`, `META_ACCESS_TOKEN` m.fl. släpptes igenom).
  Skripten läser båda namnen via `tools/lib/anthropic-nyckel.mjs`. Säger ett
  skript att nyckeln saknas fast Axel lagt in den: kolla att den heter
  `ANTHROPIC_NYCKEL` i Environments.
  ⚠️ **Nyckeln måste vara bunden till en workspace** (mätt 2026-09-11: nyckeln
  Axel lade in är äkta, 108 tecken, men API:t svarar 400 "not scoped to a
  workspace"). Två vägar, båda fungerar: skapa nyckeln inne i en workspace på
  console.anthropic.com, eller sätt `ANTHROPIC_WORKSPACE_ID` (`wrkspc_…`) i
  Environments — då skickar `anthropicHeaders()` headern på varje anrop.
  Felet står i klartext i skripten (`WORKSPACE_SAKNAS`), inte som en rå 400.
- **PAUSED i annonskontot är ett beslut, aldrig ett fel att "rätta".** En
  kampanj/adset/annons som är pausad och har spenderat > 0 kr har stängts av
  med flit (av Axel, skalningsronden eller åtgärdstrappan) — den får ALDRIG
  aktiveras av någon session eller rutin, oavsett hur namnet ser ut.
  Aktivering gäller enbart det körningen själv skapat, eller Metas
  tvångspauser på exakt de kampanjer körningen själv just uppdaterat
  (verifierat med tillbakaläsning). Statusändringar görs alltid mot en
  namngiven lista, aldrig som svep över ett mönster — och ska fler än ett par
  kampanjer utanför körningens egna ändras: lista namnen och invänta Axels ok.
  *(Incident 2026-08-29/30: ett namnmönster-svep i nattrutinen slog på ett
  dussin manuellt avstängda kampanjer, flera olönsamma. Regeln i
  `.claude/commands/nattkorning.md` steg 1 + nödbromsen där är facit.)*
- **"PAUSED" gäller bara `ads.mjs` och `meta.mjs`.** Verifierat i koden 2026-08-12:
  `batch.mjs:158` och `multi-batch.mjs:215` sätter adsetet PAUSED men **annonsen
  `ACTIVE`**. `uk-wave.mjs:171,222` sätter **båda ACTIVE** (bara kampanjen är PAUSED).
  `mastern-batch.mjs:130,159` har **ingen default alls** — saknas fältet i konfigen
  blir statusen `undefined`. Fem vågkonfigar sätter varken `adStatus` eller
  `adsetStatus`: `se-axelbalte-batch4`, `se-batch-20260809`, `uk-axelbalte`,
  `uk-beachslippers`, `uk-motorholje`. **Sätt båda fälten explicit i konfigen innan
  du kör** — annars börjar annonserna spendera i samma sekund som något släpps loss.
- **Priset hämtas från produktsidan vid varje körning**, aldrig ur en äldre brief
  eller creative. Axelbältet höjdes 2026-08-05 från 509 → 599 kr (jämförpris 678 kr
  = spara 79 kr, 11,65 %). **509 kr, 636 kr och "20 %" är förbjudna** i all ny copy.
  Två creatives har gammalt pris inbränt och får inte launchas: `2178753102691194`
  och `1324700059732480`.
- **Meta-fältnamnen är exakta:** `amount_spent`, `actions:omni_purchase`,
  `cost_per_omni_purchase`, `purchase_roas`. INTE `spend`/`purchases`.
  ⚠️ `omni_purchase_values` är buggig — den returnerade intäkt **100× för lågt på
  5 av 8 rader**. Korskolla alltid mot `amount_spent × purchase_roas`.
- **Notion-status `In progress 2` betyder REVISION** — annonsen underkändes och
  görs om. Det betyder INTE "längre kommen". Full tabell i `docs/os/NOTION-FORMAT.md`.
- **En färdig creative ligger i Notion. Bara där.** (Axels beslut 2026-09-02.)
  Klar = rad i vilken databas som helst under teamspacet Bäverbutiken med status
  `To be Reviewed`. Inget krav på Typ eller hubbnamn för `/notionkorning`.
  **Filen ligger på två olika ställen beroende på typ:** bild = bilaga i
  `Filer och media`; **video = Drive-mapp länkad sist i sidans kropp**
  (`Link for approval: …`) — redigerarna bifogar aldrig i `Filer och media`.
  *(Incident 2026-09-05: kravet "fil i Filer och media" hoppade tyst över 16
  färdiga videor medan rutinen rapporterade "allt klart".)* En rad utan
  någotdera rapporteras som "väntar på fil", aldrig tyst.
  Drive `Edited Folder/Week N/` är inte längre en källa för `/notionkorning`
  (`leveranskon.mjs --drive` finns kvar för gamla mappar). Allt i `To be Reviewed`
  har aldrig legat uppe i Meta, så ingen avstämning mot kontot behövs för att
  veta vad som är gjort.

  ⚠️ **Notion-bilagan är enda kopian i världen** — `bildannonser/output/` är
  gitignorerat och dör med containern. Läser en rutin inte Notion är arbetet borta,
  och raden fastnar i `To be Reviewed` för alltid eftersom 20:00-rutinen bara plockar
  `Draft`. *(Detta hände: fem färdiga bildannonser låg osynliga tills Axel upptäckte
  dem 2026-08-31. `/notionkorning` larmar högst upp i rapporten om Notion inte gick
  att läsa.)*

  **Stoppregeln i `/notionkorning` är en enda: pris som avviker mer än 20 % från
  Shopify-sidan** (inget pris i annonsen = grön). En creative med problem, video
  som bild, får kommentar i Notion och flyttas till `Draft`. För bild är varje fel
  ett problem; för video bara priset — felstavningar i video laddas upp ändå med
  en anmärkning. Ingen nödbroms på antal leveranser. **Uppladdad rad flyttas till
  `SE-ACTIVE to be translated`** (översättningskön), aldrig till `Approved`.

  ⚠️ **Stoppregeln gäller före uppladdning. En annons som redan är live stängs
  aldrig av i efterhand** (Axels beslut 2026-09-15: "om annonsen redan är live så
  ska vi inte stänga av den faktiskt alls"). Hittar en senare körning ett fel som
  stoppregeln släppte igenom — fel siffra i en caption, ett trasigt captionspår,
  en ful produktbild — så går det till redigeraren som en anmärkning för nästa
  version. Det blir aldrig ett skäl att pausa något som spenderar. *(Bakgrund:
  `IBC_CS_5_H1` säger 400 kr i bild mot 489 kr på sidan — 18,2 %, alltså innanför
  20 %-gränsen. Den frågan ställdes till Axel och svaret blev den här regeln.)*

- **Skriv aldrig en mätning som en evig lag.** Regeln ovan stod en gång som
  "`Filer och media` är tomt på samtliga rader … bygg därför aldrig". Den var falsk
  fyra minuter senare — `/bildannonser` mergades och började fylla exakt det fältet
  varje kväll. En observation ska bära **vad som mättes, var och när**, aldrig orden
  "alla", "aldrig" eller "samtliga" utan datum och räckvidd.
- **Notion-hubbarna rymmer mer än annonser.** Bara rader med Typ `… Pending Approval`
  är annonser. SOP, Guideline, Feedback och `Winning Creative` (arkiv) är
  dokumentation och räknas aldrig. Filtrera på Typ vid **varje** hubbläsning, inte
  bara i `/dashboard`, och filtrera på **inkludering** — aldrig uteslutning, då
  smyger nya stödsidor in i mätningen.
- **Kommentarer läses inte rakt av.** Ansvarigs kommentar = leverans. Någon annans
  räknas som ändringsbegäran bara om ≥15 tecken text återstår när `https?://`-länkar
  strippats **och** en leverans redan skett — annars gör Axels inklistrade
  annonslänkar att revisionsgraden ser ut att vara 83–100 %. Alla kommenterar inte:
  visa täckningsgrad per person bredvid siffrorna.
- **Notion-åtkomst ges per sida, inte per konto.** Varje hub måste bjudas in
  (`•••` → Connections; bjuder du in teamspacets toppsida ärver allt under den).
  **404 från en hub betyder "inte inbjuden", inte "databasen saknas".** Utan
  behörigheten "Read comments" finns inga äkta tider alls.
- **Notion har ingen statushistorik.** Det är den enda anledningen till att
  ledtider är svåra. `Godkänd datum` är ifyllt på 2 av 199 rader. **Hitta aldrig
  på en tidsstämpel för att fylla ett tomt fält** — hellre tomt än påhittat. De
  enda äkta tiderna är sidans `createdTime` och kommentarernas `datetime`.
- **Alla ledtider räknas i arbetstid, inte kalendertid.** En task som lämnas ut
  fredag 16:45 och levereras måndag 09:15 tog 1h 30m — inte 64 timmar.
- **Trösklarna är absoluta, inte relativa.** Den sämsta i gruppen ska inte bli röd
  bara för att den är sämst — då är alltid någon röd och panelen blir ett
  mobbningsverktyg i stället för ett styrverktyg.
- **Färgordningen i diagrammen är en färgblindhetsmekanism, inte dekoration.**
  Rotera den inte. Status bärs alltid av ikon **och** text, aldrig färg ensam.
- **Rutinerna täcker HELA Bäverbutiken, inte en fast produktlista.** Nya produkter
  tillkommer ständigt i teamspacet och i annonskontot (63 kampanjer, 46
  annonsprefix per 2026-08-30 — mot 6 produkter i `products.json`). En rutin som
  hårdkodar produkter missar nya leveranser **tyst**. `/notionkorning` härleder
  därför kopplingen leverans → kampanj ur kontot självt: annonsprefixet i namnet
  slås upp mot kampanjen som redan har annonser med samma prefix
  (`Rodholder_` → Fiskespöhållaren). `creative_prefix` i `products.json` är bara
  en override för de fyra skalningsprodukterna. Bygg aldrig tillbaka en fast lista.
- **OPS-butikernas hubbar ses av samma integration men är inte Bäverbutikens**
  (2026-09-10). HeimGuard, TankGuard, DryTrek, AdventLane, TackleBay har egna
  teamspaces, men integrationen "Bäverbutiken RUTINER" är inbjuden dit också, så
  "alla databaser integrationen ser" fångar dem. Alla Bäverbutiks-läsare
  (`tools/notion-kalla.mjs` → leveranskön, översättningskön, `notion-klara`;
  `commission/notion.mjs` + `run.mjs`) undantar dem **per id** ur
  `factory/produkter/register.json` via `tools/lib/ops-hubbar.mjs` och loggar
  "OPS-hubbar undantagna: N" varje körning. Aldrig på titel. **En ny OPS-hub
  måste skrivas in i registret** (`node factory/register.mjs notion <nyckel>
  <id>`), annars sugs den in i Leveransrundan och laddas upp i fel konto.
  Lista: `node tools/lib/ops-hubbar.mjs`.
- **Matstrumpors hub undantas nu också per id** (2026-09-21). `Matstrumpor
  creative hub` `3a7270ab-…` sågs av samma integration som Bäverbutikens och
  låg därmed i `/notionkorning`s kö. Den räddades bara av att inget
  annonsprefix matchade i MagiBorsten — alltså av en slump, inte av en regel.
  Sedan Matstrumpor fick egen uppladdare (`/matstrumpor`, kontot
  `730973156224390`) dras hubben bort i `tools/notion-kalla.mjs` via
  `tools/lib/andra-verksamheter.json`, med loggrad varje körning.
  ⚠️ **Commission är undantaget från undantaget:** den är läs-bar och SKA
  räkna hubben (`commission/hubbar.json`) — annars hamnar spenden på fel person.
- **Butikens namn står aldrig i en annons** (Axels beslut 2026-09-18). Inte
  "Bäverbutiken", inte "CaraShell", inte domänen — i copy, bild, voiceover
  eller captions. Annonser speglas mellan butiker (`/ops-spegla`:
  Bäverbutikens Taköverdrag/Termoskydd → CaraShell), och `tools/ops-spegla.mjs`
  stoppar varje rad vars copy eller brieftext nämner Bäverbutiken. Regeln står
  i `docs/copy-regler.md` och som hard rule i `/cs`, `/forsta-batch` och
  `/notionscalercs`. Länkar i briefen räknas inte — `Landing page:
  https://baverbutiken.se/…` är metadata.
- **Den svenska versionen är den enda som någonsin översätts** (Axels beslut
  2026-09-22). SE → NO och SE → EN, aldrig NO → EN. En spegelrad bär både den
  svenska och den norska filen; `tools/notion-fil.mjs --utan-marknadsfiler`
  (som `ops-leveranskon`/`ops-spegla` alltid skickar) hoppar varje fil med
  marknadskod på plats två (`CaraShellRoof_NO_PD_106_H1.mp4`) och stannar med
  fel om bara sådana finns. Och **`pipeline/translate-batch.mjs` har inget
  standardspråk längre**: `--marknad` krävs, språket kommer ur
  `pipeline/sprak.mjs`, HeyGens eget `output_language` kontrolleras vid
  proofread/render/download och SRT-texten språkkollas — fel språk stoppar
  posten med exit 1. *(Mätt 2026-09-20/22: fyra US-videor renderades med norsk
  röst som läste engelsk SRT, "varannat ord engelska, varannat norska", och
  rutinens egen batch-logg påstod "amerikanska engelska". En rutin som
  rapporterar vad den TÄNKTE göra i stället för vad verktyget svarade lär
  sig aldrig — läs `translate-batch.mjs status --marknad=<M>` innan
  ordet "engelska" skrivs i en logg.)*
- **Speglade hubbar går inte till `Approved` efter Norge.** Bäverbutikens
  `/oversatt NO` sätter `CaraShell SE ready to be active` på Taköverdragets
  och Termoskyddets hubbar (`node tools/ops-spegla.mjs --kallor` är facit);
  `Approved` sätts av speglingen först när US-annonsen finns. Källkön för
  speglingen är ALDRIG `SE-ACTIVE to be translated` — den är NO-kön.
- **Notion-anropen stryps till ~3/s.** Ett par hundra sidor tar några minuter.
  Det är normalt, inte en hängning.
- **Språk:** allt i repot skrivs på svenska — kod, kommentarer, commit-meddelanden.
  Undantag: `basePrompt` i pipeline-vågorna är engelska (bildmodellen kräver det),
  och briefer till redigerarna är engelska.

---

## Connectors som måste vara kopplade

Följer **inte** med repot. Utan dem går det att bygga och testa koden, men inte att
hämta data: **Notion** (creative hub-databaserna), **Slack** (workspace
Stonebite), **Meta Ads** (MagiBorsten `1867947880635861`), **Shopify**
(bäverbutiken.se, för verklig AOV).

Notion-hubbarna hittas **dynamiskt**. ⚠️ **Titelregeln "slutar på `creative hub`"
är DÖD — lita aldrig på den, och skriv aldrig hubblistan ur minnet.**
Mätt 2026-09-08: "Damasker vandring" och "Fish rod holder" saknade orden.
Mätt 2026-09-15: Axel döper om och skapar hubbar löpande — samma dag fanns
`BÄVER IBC-Tanköverdraget`, `BÄVER Taköverdraget för Husvagn`,
`BÄVER Termoskyddet för Husbil`, `BÄVER Adventskalendern Racingbilar`,
`arkiverad Övervakningskamera` och `Arkiverad Isolerade Utekattkojan`, och en
`/oversatt`-körning som läste sex hubbar ur minnet missade alla sex. Den
rapporterade "30 rader, alla blockerade"; verkligheten var **57 rader, varav 20
skulle ha gått live samma dag**. Axel fick upptäcka det själv.

**Rätt sätt (MCP-vägen, utan `NOTION_TOKEN`):** `notion-search` med
`sort: "last_edited"` först — den listar allt som faktiskt rörts, och varje
distinkt `path` är en kandidathubb. Komplettera med sökningar på `"BÄVER"`,
`"creative hub"` och `"arkiverad"`. Hämta `collection://`-id genom att
`notion-fetch`:a en **sida** i hubben (`parent-data-source` står i svaret) —
en databashämtning är flera gånger dyrare. SQL tar **max 10 data sources**
per fråga. Räkna hubbarna i rapporten; färre än förra körningen = något
hittades inte.

Dra bort OPS-hubbarna **per id** (`node tools/lib/ops-hubbar.mjs`) och andra
verksamheters hubbar (`Matstrumpor creative hub`, `kundsupport Grillkliniken`,
`Bäverkoppling.se`, `Creative Hub master`) samt mallen `MALL Creative hub MALL`.
`products.json` känner bara fyra av hubbarna — den är inte facit här.
**En hubb som inte hittas ger aldrig ett felmeddelande, bara en kortare kö.**

**Env-nycklar rutinerna behöver:** `KIE_API_KEY` (bildannonser),
`HEYGEN_API_KEY` (`/translate`), `META_ACCESS_TOKEN`, `DISCORD_WEBHOOK_URL`
(nattrapporterna), `JUDGEME_API_TOKEN`, `SHOPIFY_TOKEN_*`, `NOTION_TOKEN`,
`KUNDTJANST_MAIL_PASS_<ID>` (Loopia-lösenordet per brand, `/kundtjanst`).

`NOTION_TOKEN` är det som gör `/commission` helt klickfri: med den läser
`commission/run.mjs` hubbarna via REST och rör inga `mcp__*`-verktyg, så inget
godkännande kan utlösas. Utan den måste rutinen gå via Notion-MCP:n.

---

## Om repots grenar

Repot har ~28 grenar från tidigare sessioner. **`main` är default-branch och den
enda som gäller.** Om du behöver något som inte finns i trädet ligger det troligen
kvar på en gammal gren — leta med `git log --all --oneline -- <fil>` i stället för
att bygga om det från början.

**Fyra olika program delar mappnamnet `dashboard/`:**

| Gren | Vad |
|---|---|
| `main` | Redigerarpanelen — `build.mjs` + `cli.mjs` + `lib/` |
| `claude/initial-setup-87a4dh` | Grillklinikens händelsestyrda panel, 27 tester, GitHub Actions (dubblett på `…-fa9ngu`) |
| `claude/editor-performance-dashboard-kla86o` | `edash.mjs` — HTTP-server på port 4173, REST-API, `web/`, egen `config.json` |
| `claude/kostnader-produkter-jbxijn` | Kostnad/marginal-panel, data inbäddad som `DATA`-konstant, ingen build |

De går **inte** att slå ihop rakt av. Ska något återupplivas: hämta det till en
**egen mapp** — annars försvinner redigerarpanelen och nästa `/dashboard` skriver
över det du hämtade.

### Självtestet — ett kommando som mäter i stället för att bedöma

```bash
npm run sjalvtest          # allt som går att mäta utan nycklar och utan webbläsare
npm run sjalvtest -- --snabb   # utan dry-run mot butikerna
```

Kör tester, syntax, importer, en dry-run per butik och de tre spärrarna
(räkningen, villkorsdomen, kadensen). **En kontroll som inte kan köras
rapporteras som HOPPAD med orsak — aldrig som grön.** Exit 1 vid rött.

⚠️ Grönt självtest är inte en grön butik. Det bevisar att koden håller ihop,
inte hur sidan ser ut för kunden. Kundvyn kräver `factory/kundvy-kor.mjs` mot
riktig HTML, och varukorgen kräver en människa i en webbläsare.
