# /matstrumpor – Annonsuppladdaren för Matstrumpor (och BARA Matstrumpor)

Argument: `$ARGUMENTS` — inget (kör hela kön) eller `--torr` (planera, ladda
inte upp). Exempel: `/matstrumpor` · `/matstrumpor --torr`

Laddar upp färdiga creatives ur **Matstrumpors egen Notion-hub** till
**samma CBO Axel redan kör**, byggt som **Evolves 3:2:2** (Axels beslut
ROUTING C 2026-10-02). Rör aldrig någon annan verksamhet, aldrig något annat
konto, aldrig en annan kampanj.

| | |
|---|---|
| Konto | **"nya kungen" `730973156224390`** (portfölj Matstrumpor.se, SEK) |
| Kampanj | `MATSTRUMP_SALES_20260826` — `120251217860260023`, CBO |
| Champions | `09-17 UGC` `120251591832340023` — tar ALDRIG emot en ny annons |
| Hub | `Matstrumpor creative hub` `3a7270ab-908c-80d2-9f35-e73e51e457ff` |
| Kö | Status **`To be Reviewed`** / **`Creative strat review`** → uppladdad → **`Approved`** |
| Facit | `matstrumpor/konfig.json` (`meta.struktur`) — ändra tal DÄR, aldrig i den här filen |

⚠️ **Kontot HETER "nya kungen", inte Matstrumpor.** Kolla alltid
`ad_account_id`. Fem konton i Axels portföljer heter nästan samma sak och
fel konto kostar riktiga pengar.

⚠️ **Läsa och skriva går två vägar.** `META_ACCESS_TOKEN` LÄSER kontot sedan
2026-09-22 — strukturen (`--struktur`), kön (`--ko`) och tillbakaläsningen
(`--kontroll`) går via token, utan klick. Allt som SKRIVER i Meta går genom
**Adsmanager-MCP:n** (`mcp__Adsmanager__*`) i en session Axel startar, som förut.
Finns inte de verktygen: **avbryt**, säg det rakt ut, ladda inte upp något.
⚠️ Enligt MCP:ns egen verktygsbeskrivning 2026-10-02 står `ads_create_ad` i
**utkastläge**: annonsen läggs som utkast i Ads Manager och går live först när den
publiceras med `ads_activate_entity`. Det är INTE mätt i det här kontot än. Mätt
samma dag: **utkastläsningen** (`ads_get_ad_entities` med `object_state: "draft"`)
svarar "This tool is new and is being gradually rolled out" för nya kungen. Steg 5c
säger vad som gäller i båda fallen.

---

## 3:2:2 — reglerna (kursen "How To Set Up a 3:2:2 Campaign", läst 2026-10-02)

- ⛔ **En uppladdning = ett nytt adset** (Axels beslut 2026-10-02 kväll, ersatte
  "ett koncept = ett adset med tre hookar" samma dag): varianterna blir inte klara
  samtidigt, så allt som är klart vid körningen går upp i ETT nytt adset per
  mediatyp — `MATSTRUMP_U<ÅÅMMDD>[b …]_<vinkel|mix>_<video|bild>`, högst sex
  annonser (fler ⇒ ett adset till, b). En ensam annons får ett eget adset.
  Koncept kan blandas i en uppladdning. Varje annons bär
  **2 rubriker + 2 primärtexter** ur briefens COPY CARD (Ads Managers "flera
  textalternativ" — en vanlig annons, **aldrig ett dynamic creative-adset**;
  ordet DCT finns inte i kursen).
- **Bild och video aldrig i samma adset.** En uppladdning med båda blir två adsets.
- **Högst 5 levererande adsets inklusive Champions** (Champions + högst 4 test),
  och aldrig fler än budgeten bär med 3 × break-even-CPA per adset och dag
  (~925 kr). **Uppladdaren vägrar ett sjätte** — konceptet väntar i hubben tills
  kungen föreslagit ett testadset att stänga och Axel stängt det.
- **Champions och de gamla hinkarna** (`nya16`, `bilder`, `jul_video`,
  `jul_bild` m.fl.) tar aldrig emot en ny annons. En brief som säger "upload goes
  to adset 09-17 UGC" är skriven före 3:2:2 — planen gäller.
- Testet döms av `/matstrumporkungen` på ADSET-nivå efter 7 dagar (max 14),
  aldrig per annons. Uppladdaren dömer ingenting.

---

Gör i ordning, utan att invänta godkännande mellan stegen. Ett kommando per
Bash-anrop.

1. **Läge och konto.**
   ```bash
   node matstrumpor/kor.mjs --kolla
   ```
   Verifiera kampanjen live med `mcp__Adsmanager__ads_get_ad_entities`
   (`level: "campaign"`, `object_ids: ["120251217860260023"]`, fältet
   `effective_status`). **Är kampanjen något annat än ACTIVE: ladda inte upp.**
   **PAUSED med spend är ett beslut** — aktivera aldrig något som är pausat.

2. **Strukturen.**
   ```bash
   node matstrumpor/kor.mjs --struktur
   ```
   Champions, kampanjens budget, vad budgeten bär, vilka adsets som levererar
   och hur många **lediga platser** det finns. Skriv ut raden "Levererar: N av
   taket M" ordagrant i rapporten. **Noll lediga = inget nytt adset i dag**: kön
   läses ändå (steg 3) så att Axel ser vad som väntar, och rapporten säger vilka
   adsets kungen senast föreslog att stänga (senaste `FORSLAG` med
   `atgard: "STANG_ADSET"` i `matstrumpor/logg.jsonl`).

3. **Kön som koncept.**
   ```bash
   node matstrumpor/kor.mjs --ko
   ```
   Läser hubben, briefernas COPY CARD (repots `brief.md` först, annars
   Notion-sidan) och strukturen, och skriver planen i
   `matstrumpor/output/ko-<datum>.json`. Varje koncept får en status — skriv ut
   ALLA i svaret, en rad som försvinner tyst är värre än en rad som stoppas:
   - `✅ BYGG` — en uppladdning (ett adset): annonserna med 2 + 2 copy, en ledig plats. Byggs i steg 5.
   - `⏳ PLATS` — klart, men strukturen är full. Väntar i hubben (status orörd).
   - `⏳ COPY` — COPY CARD har inte 2 rubriker + 2 primärtexter (alla briefer
     före 2026-10-02 har en av varje). Väntar — se steg 4.
   - `⛔ STOPP` — dubblett, okänt format, eller
     **redan byggt** (testadsetet finns i kampanjen, eller en annons är redan
     uppladdad — ett koncept byggs aldrig två gånger). Finns adsetet i kampanjen
     men inga `UPPLADDAD`-rader för dess annonser (Axel publicerade det, 5c): kör
     `--kontroll <adset-id>`; exit 0 ⇒ logga de tre med `--uppladdad` (5e) och
     sätt `Approved`; exit 1 ⇒ kommentar på raderna, inget Approved. Har alla
     annonserna `UPPLADDAD`: raderna ska ut ur kön — `Approved`, eller kommentar
     + `Draft` om något saknas.
     **Förra bygget publicerades inte** (`ADSET_SKAPAD` i loggen men adsetet syns
     inte i kampanjen och inget är uppladdat): väntar det på Axels publicering
     enligt förra rapporten, låt det vänta. Avbröts det (5b): Axel kasserar
     utkastet, sedan `node matstrumpor/kor.mjs --adset-kasserat <adset-id>`.
     Raderna sätts ALDRIG till `Approved` i det läget.
   - `⛔ STRUKTUR` — strukturen gick inte att läsa ur Meta; inget laddas upp.
   - `🏷️` — odöpt rad (steg 4). `⛔` per rad — fil, pris, landningssida, utland.

4. **Döp de odöpta och laga det som väntar.**
   - **Odöpt rad** (redigerarna döper sina rader `022`, `023` …): hämta creativen
     (Drive-länken sist på raden; `python3 tools/drive-ls.py` listar mappen,
     `tools/qa-frames.py` drar frames ur videon) och **titta på den**. Välj vinkel
     och format ur vad du SER. Julpynt, julmusik, "julklapp" ⇒ vinkeln `jul`.
     Nästa lediga nummer, räknat ur kontot + hubben, aldrig i huvudet:
     ```bash
     node matstrumpor/kor.mjs --namn <vinkel> <format> 1
     node matstrumpor/kor.mjs --dop <notion-sid-id> <nytt namn>
     ```
     ⚠️ **Bara sushi** (Axels beslut 2026-10-01): en rad som visar pizza-,
     burgar- eller donutlådan laddas inte upp — kommentar i Notion, status `Draft`.
   - **En rad med TRE hookfiler** (H1/H2/H3 i filnamnen, Gilz mönster 2026-09-21)
     är ett helt koncept: döp raden UTAN hook (`…_082_v1`) och kör kön med
     `--hookrad <notion-sid-id>` — planen gör tre annonser `_h1 _h2 _h3` av den,
     och fil H<k> går till annons `_h<k>`.
   - **Tre ensamma löpnummer som är tre öppningar på samma kropp** (063, 066, 067
     är skrivna så, se 066:s brief): `--ko --grupp 063,066,067` slår ihop dem till
     ett koncept. Bara när du SETT att det är samma kropp — aldrig på gissning.
   - **`⏳ COPY`**: rubrik 2 och primärtext 2 skrivs av en **subagent med
     `model: "sonnet"`** mot `docs/copy-regler.md` och briefens COPY CARD
     (CLAUDE.md regel 6 — du skriver aldrig copy själv), läggs in i repots
     `brief.md` som `**Primary text 2:**` / `**Headline 2:**`, committas, och
     `--ko` körs om. Tre-frågorstestet på varje ny rad.
   - Kör `--ko` igen efter varje ändring.

5. **Bygg varje `✅ BYGG`-uppladdning (ett adset) — en i taget, och läs tillbaka varje.**
   Allt du skickar till Meta står färdigt i `matstrumpor/output/ko-<datum>.json`
   (`koncept[].adset_spec`, `koncept[].annonser[].copy`) — skriv aldrig om det
   för hand.
   a. **Testadsetet.** `mcp__Adsmanager__ads_create_ad_set` med exakt
      argumenten i `adset_spec` (mallen är Champions-adsetet, läst live: samma
      målgrupp, optimering, pixel och attribution). **Ingen budget, ingen
      budstrategi** — kampanjen är CBO. Aldrig `is_dynamic_creative: true`.
      Logga adsetet direkt, FÖRE annonserna:
      ```bash
      node matstrumpor/kor.mjs --adset-skapad <adset-id> <adset-namn>
      ```
   b. **Uppladdningens annonser**, en i taget:
      - Hämta filen (bilaga med `tools/notion-fil.mjs`, eller Drive-mappen med
        `tools/drive-ls.py`; Drive-filen laddas via
        `https://drive.usercontent.google.com/download?id=<id>&confirm=t`).
        Signerade Notion-URL:er är kortlivade — hämta vid körning, cacha aldrig.
      - Video: miniatyren först (Meta kräver en, publik URL):
        `node matstrumpor/thumbnails.mjs <fil>` → `cdn.shopify.com`-länken.
      - `mcp__Adsmanager__ads_creative_upload_media` (`upload_source: "URL"`),
        vänta tills videon är `ready` (`ads_get_ad_videos`).
      - Creativen, med båda rubrikerna och båda texterna:
        ```bash
        node matstrumpor/kor.mjs --creative <annonsnamn> --video <video-id> --thumb <cdn-url>
        node matstrumpor/kor.mjs --creative <annonsnamn> --bild <image-hash>
        ```
        Utskriften är JSON-strängen till `ads_create_ad` → `creative`
        (`object_story_spec` med sidan `820358954504320` och Instagram
        `17841479011543544`, plus `asset_feed_spec` med 2 `bodies` + 2 `titles`
        och `optimization_type: "DEGREES_OF_FREEDOM"`). Skriv aldrig om den.
      - `mcp__Adsmanager__ads_create_ad` med `ad_set_id` = testadsetet,
        `ad_name` = annonsnamnet exakt, `creative` = utskriften.
      - Länken är radens `Landing page`, annars
        `https://matstrumpor.se/products/sushi-strumpor`. Annan butik ⇒ stopp
        (fel pixel bokför köpen på fel verksamhet, och det syns aldrig som fel).
      - **Svarar `ads_create_ad` med fel (`active_errors`), eller blir en video
        aldrig `ready`:** försök en gång till med just den annonsen. Går det inte
        då heller: publicera INGENTING av konceptet, raderna stannar i kön, och
        rapporten listar adset-id:t och de annons-id som skapades under "Väntar
        på en människa" (Axel kastar utkasten i Ads Manager, sedan kvitteras det
        med `node matstrumpor/kor.mjs --adset-kasserat <adset-id>` — utan kvittot
        byggs konceptet aldrig igen). Bygg inga fler koncept.
   c. **Publicera — bara det körningen skapat, bara en hel uppladdning.**
      - Kontrollera först: exakt planens annonser skapade, med exakt planens namn
        (ur `ko-<datum>.json`), utan `active_errors`. Annars:
        publicera inte (se 5b).
      - Försök läsa utkastet: `ads_get_ad_entities`, `object_state: "draft"`,
        `object_ids: [<adset-id>]`. **Går det:** varje annons ska bära två
        `bodies` och två `titles` — gör en det inte, publicera INTE, rapportera,
        stanna.
      - **Går det inte** ("gradually rolled out", mätt för nya kungen
        2026-10-02), eller svarade `ads_create_ad` med en riktig annons i
        `PAUSED`, beror det på om vägen är bevisad. Bevisad = loggen har en
        `UPPLADDAD`-rad med `struktur: "3:2:2"`, alltså ett koncept som klarat
        `--kontroll` med 2 + 2 texter genom MCP:n.
        - **Inte bevisad (första 3:2:2-konceptet):** publicera INTE. Bygg bara
          det konceptet, och skriv adset-id:t och annons-id:na under
          "Väntar på en människa": Axel öppnar utkastet i Ads Manager, ser att
          varje annons har två rubriker och två texter, och publicerar själv.
          Nästa körning läser tillbaka det (steg 3, "redan byggt").
        - **Bevisad:** publicera. JSON:en är byggd och testad av koden och vägen
          är mätt; `--kontroll` i 5d är kontrollen. Fortfarande ett koncept i taget.
      - Svarade `ads_create_ad` med `status: DRAFT`: publicera med
        `ads_activate_entity`, `entity_type: "ad_set"`, `entity_id: <adset-id>`,
        `object_ids` = adsetet + dess annonser och INGET annat,
        `publish_as_active: true`. `PUBLISHING` betyder överlämnat, inte live —
        vänta två minuter. Svarade den med en riktig annons i `PAUSED`: slå på
        just adsetet och dess annonser med `ads_activate_entity`, en i taget.
      - ⛔ `ads_activate_entity` anropas ALDRIG med `entity_type: "campaign"`,
        aldrig utan `object_ids` vid en utkastpublicering, aldrig med kampanjens,
        Champions eller ett gammalt adsets id. **Axels egna utkast och allt PAUSED
        med spend rörs aldrig.**
   d. **Tillbakaläsningen** ur Meta via token:
      ```bash
      node matstrumpor/kor.mjs --kontroll <adset-id>
      ```
      Exit 0 = adsetet och annonserna är på, exakt planens annonser,
      2 + 2 texter på varje (briefens), rätt sida och pixel, länk till
      matstrumpor.se, en mediatyp, ingen egen budget, inget dynamic creative.
      Står något PAUSED som körningen skapade: slå på just det (5c) och kör om.
      **Exit 1 av något annat skäl:** gör ändå 5e och 5f för det som gått live
      (det ska ut ur kön, annars byggs det igen — koden vägrar visserligen, men
      raderna ska inte ligga kvar), skriv felraderna som kommentar på raderna i
      Notion och i rapporten, och **bygg inga fler koncept**. Det som är live
      pausas inte (Axels beslut 2026-09-15: en annons som är live stängs aldrig av
      i efterhand) — felet går till nästa version.
   e. **Logga varje annons** — av koden, aldrig med `node -e`:
      ```bash
      node matstrumpor/kor.mjs --uppladdad <namn> <annons-id> <adset-id> --notion <sid-id> --kalla "<Drive-fil eller Notion>" --kreator <namn om en människa syns>
      ```
      Raden får typen (IDEA/ITER/IMIT), föräldern ur namnet, adset-id:t och
      konceptet. Den vägrar Champions, en gammal hink, en annons som inte hör till uppladdningen
      och bild i ett videoadset. `--kreator` gör att arkivet kan räkna
      vinstbidrag per kreatör.
   f. Sätt radens status till **`Approved`** i Notion.

6. **Stoppreglerna.**
   - **Pris som avviker mer än 20 %** från produktsidan ⇒ kommentar i Notion,
     status `Draft`. (Sushi-Strumpor 399 kr för 5-pack, 369 kr för 3-pack,
     avläst 2026-09-21 — läs om live.)
   - **Fel landningssida** (annan butik) ⇒ samma sak.
   - **Butikens namn i en rubrik eller text** ⇒ konceptet väntar
     (`granskaCopy`, Axels beslut 2026-09-18).
   - **Inget sjätte adset, aldrig bild och video i samma adset, aldrig i
     Champions eller en gammal hink, aldrig ett dynamic creative-adset** — koden
     vägrar, och du kringgår den aldrig.
   För bild är varje fel ett problem; för video bara priset — felstavningar i
   en video laddas upp ändå, med anmärkning till redigeraren.
   ⚠️ **En annons som redan är live stängs aldrig av i efterhand** (Axels beslut
   2026-09-15). Ett fel efteråt är en anmärkning för nästa version.

7. **Committa och pusha** `matstrumpor/logg.jsonl` (och en ändrad `brief.md`).
   Committa aldrig `matstrumpor/output/`. En rutin som inte pushar har inte lärt
   sig något.

8. **Rapportera i två listor.** "Gjort av mig" (varje testadset: namn, id,
   koncept, de tre annonserna med id, `--kontroll` grön) / "Väntar på en
   människa" (koncept som väntar på plats, hookar eller copy, stoppade rader,
   strukturen full). Axels uppgifter sist, numrerade, en mening per rad — och
   är strukturen full: **vilka adsets kungen föreslår att stänga** så att det
   blir plats.

---

## DEFINITION OF DONE

- [ ] `ad_account_id` verifierat = `730973156224390` (aldrig på kontonamnet)
- [ ] Kampanjens `effective_status` läst live INNAN något laddades upp
- [ ] `--struktur` körd: "Levererar: N av taket M" och lediga platser i rapporten
- [ ] `--ko` körd: varje uppladdning och väntande koncept redovisat med status (bygg / plats / copy / stopp) + odöpta + stoppade rader
- [ ] Varje odöpt rad döpt efter att creativen FAKTISKT setts — aldrig gissat; bara sushi
- [ ] Ingen copy skriven av huvudsessionen — rubrik 2 / text 2 av sonnet-subagent, tre-frågorstestet redovisat
- [ ] Ett nytt adset per uppladdning och mediatyp, ur `adset_spec`: ingen budget, inte dynamic creative, loggat med `--adset-skapad` före annonserna
- [ ] Uppladdningens annonser (högst sex), var och en med 2 rubriker + 2 primärtexter (`--creative`); utkastet läst före publicering, ELLER vägen bevisad av ett tidigare 3:2:2-koncept och `--kontroll` exit 0 efteråt, ELLER publiceringen lämnad till Axel
- [ ] Bara körningens egna objekt publicerade; inget annat utkast, inget PAUSED, ingen annan kampanj rörd
- [ ] Exakt planens annonser skapade utan fel före publiceringen; första uppladdningen någonsin byggd ensam och kontrollerad innan nästa
- [ ] `--kontroll <adset-id>` exit 0 för varje byggt adset (eller felet stoppade nästa koncept, raderna lämnade kön och felet står i rapporten)
- [ ] Inget sjätte levererande adset; inget i Champions eller en gammal hink; bild och video aldrig blandat
- [ ] Prisspärren körd; stoppade rader kommenterade i Notion och satta till `Draft`
- [ ] Uppladdade rader satta till `Approved`; varje annons loggad med `--uppladdad … <adset-id>`
- [ ] `logg.jsonl` committad och pushad
- [ ] Slutrapport i två listor; Axels uppgifter sist, numrerade
