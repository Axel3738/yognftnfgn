# /ny-annonser – Ta en OPS-butik från byggd till annonser som snurrar

Argument: `$ARGUMENTS` — butiks-id (ex: `tankguard`), plus källänken till
Bäverbutikens produkt FÖRSTA gången butiken körs. `--dry` visar planen utan
att skapa något i Meta.

```
/ny-annonser tankguard https://bäverbutiken.se/products/ibc-tankoverdrag-1000-l-stoppar-alger-uv
/ny-annonser tankguard          # när kopplingen redan är sparad
```

Källänken behövs **en gång per butik** — varje ny OPS-butik har sin egen
källprodukt på Bäverbutiken. Kommandot skriver ett `kalla:`-block i
`factory/produkter/<id>.yaml` (annonsprefix + produkt-handle) och läser det
därefter själv vid varje ny körning på SAMMA butik. Saknas både länk och
block: stoppa och be om länken — leta aldrig upp en källprodukt på gissning.

**Kör i en EGEN session, inte i butiksbyggets.** Annonsfasen rör inte Shopify
och behöver varken `SHOPIFY_SHOP` eller butikens nycklar — bara
`META_ACCESS_TOKEN`, som redan ligger i miljön. En ren session slipper släpa
på hela butiksbygget, och butiksbyggets session kan stängas eller användas
till nästa butik. Kommandot är självbärande: allt det behöver står i
produktfilen och i `factory/FAS2.md`.

Fas 2 i OPS Factory. `/ny-ops` bygger butiken; det här kommandot ger den
annonser. Processen och alla fallgropar står i **`factory/FAS2.md`** — det
dokumentet är facit, det här kommandot är körordningen.

**Vad kommandot gör, i en mening:** kopierar HELA Bäverbutikens aktiva
kampanj för källprodukten — varenda annons, både den svenska och den norska —
till TVÅ nya kampanjer i OPS-kontot, och rör bara de annonser där något är
FEL för den nya butiken.

**Axels regel 2026-09-10 — kopiera allt, rör bara det som är fel:**
- **Alla annonser i kampanjen följer med.** Inte de bästa, inte ett urval:
  hela kampanjen. En annons som saknas i räkningen är ett fel, inte ett val.
- **Lyssna och läs varje annons** (tal, inbränd text, copy, bild). Bara om
  något inte stämmer för OPS-butiken — brandnamnet "Bäverbutiken", fel pris,
  fel villkor (fraktgräns, öppet köp, recensionsantal) — ändras annonsen,
  och då **bara den ytan som är fel**.
- **Nämner annonsen varken Bäverbutiken eller ett felaktigt pris kopieras
  den som den är.** Ingen ny voiceover, ingen ny video, ingen ny copy.
  Länken byts alltid (den pekar på källbutiken) — det är inte "att ändra
  annonsen", det är att peka om den.
- En video med EN felaktig replik får EN replik omdubbad — inte ett nytt
  manus. Ett nytt manus skrivs bara när hela talet är falskt för butiken
  (uppläst rabatt som inte finns, kundvittnesmål utan kunder).

Den som kör är oftast **VA:n (engelsktalande)** — svara henne på engelska,
korta rader. Axel svaras på svenska. Språket följer LÄSAREN — hennes språk
vinner över allt annat i CLAUDE.md. Hon gör allt i den här
fasen: kör kommandot, granskar, och sätter kampanjen ACTIVE när den är grön.

**Kräver:** `META_ACCESS_TOKEN` i miljön, butikens Meta-sida och pixel ifyllda
i `factory/produkter/<id>.yaml`, och en `kalla:`-koppling till källprodukten
på Bäverbutiken.

⚠️ **RÖR INTE SHOPIFY. Alls.** Den här fasen läser bara Meta och repot.
Shopify-MCP:n (`get-shop-info`, `switch-shop`, alla `mcp__*`-Shopify-verktyg)
är FÖRBJUDEN här — den pekar på en godtycklig butik och kan riktas mot
Bäverbutiken. Leta ALDRIG efter butiken: i grenar, i miljön eller via API.
Butiken ÄR argumentet, och allt kommandot behöver står i
`factory/produkter/<id>.yaml` och `factory/butiker/<id>.yaml`.
Saknas filen: stoppa och säg vilket butiks-id som saknas — sök inte.

---

## Kontokartan (lär dig den innan något körs)

| Roll | Konto | Id | Valuta |
|---|---|---|---|
| **Källa SE** | MagiBorsten | `1867947880635861` | SEK |
| **Källa NO** | Magiborsten NO | `1050941584152547` | NOK |
| **MÅL — båda kampanjerna** | MagiBorsten DK | `915422744950975` | SEK |

⚠️ **Fyra konton heter nästan samma sak.** Kontrollera alltid `ad_account_id`,
aldrig kontonamnet. Fel konto kostar riktiga pengar.

⚠️ **Målet är ALLTID MagiBorsten DK, oavsett marknad.** Både den svenska och
den norska OPS-kampanjen byggs där — trots namnet "DK". Det är ETT gemensamt
konto för alla OPS-butiker, och därför måste kampanjnamnen bära både brand
och marknad.

⚠️ **Målkontot är INTE tomt.** Bäverbutikens danska kampanjer ligger i samma
konto, med Bäverbutikens DK-sida `1324465810740336` och pixel
`1554276343018184`. Varje uppslag som "hittar en kampanj i kontot" måste
filtrera på butikens brandprefix — annars träffar du fel verksamhet.

⚠️ **Kontots valuta är SEK.** 1000 kr/dag = `daily_budget: 100000`.

---

Gör i ordning, utan att invänta godkännande mellan stegen:

1. **Rätt konto och rätt butik.** Läs `factory/produkter/<id>.yaml` och
   verifiera att `meta.ad_account_id` är `915422744950975` och att
   `meta.page_id` + `meta.pixel_id` är ifyllda. Saknas något: stoppa och säg
   exakt vad.

   **Källkopplingen.** Finns `kalla:`-blocket: använd det. Annars, med en
   källänk som argument: hämta produktens handle ur länken, slå upp
   annonsprefixet genom att läsa kampanjerna i MagiBorsten och hitta det
   prefix vars annonser pekar på den handlen, och SKRIV blocket i
   produktfilen (`kalla.annonsprefix`, `kalla.handle`, `kalla.produkt_id`).
   Hittas inget prefix: visa de kandidater du såg och fråga — gissa aldrig.
   ⚠️ Produktfilens rad 2 kan bära källänken som en ren kommentar (så gjorde
   `/ny-ops` fram till 2026-09-08). Den får läsas som förslag, men bekräfta
   alltid mot kontot innan blocket skrivs.

   Rapportera direkt: `Source: <prefix> in MagiBorsten · Target: <BRAND> in
   MagiBorsten DK ✓`.

2. **Läs källannonserna — BÅDA källkontona.** Den svenska kampanjen ligger i
   MagiBorsten `1867947880635861`, den norska i Magiborsten NO
   `1050941584152547` (se kontokartan ovan).
   Hämta alla annonser vars namn börjar med `kalla.annonsprefix` ur BÅDA,
   med copy (`message`/`headline`/`description`/`link`), `image_hash`/
   `video_id` och media-URL. Använd mönstret i `tools/oversattningskon.mjs`.
   Rangordna på `amount_spent` — de bevisade först.
   Håll de två uppsättningarna åtskilda hela vägen: SE-annonser blir den
   svenska kampanjen, NO-annonser den norska. Blanda dem aldrig.
   ⚠️ Ta bara ACTIVE-annonser ur aktiva adsets. En PAUSED annons är ett
   beslut — den har dömts ut och ska inte återupplivas i en ny butik.
   **Enda undantaget är ägarens, skrivet i produktfilen:**
   `kalla.no_pausad_kalla_ok: "<vem, datum, varför>"` gör ACTIVE-annonserna
   i en PAUSED norsk källkampanj till källor ändå (TackleBay 2026-09-10,
   Axel: "Fixa norge också"). `kallannonser.mjs` märker då varje rad med
   `undantag`, brand-detektorn skriver ut det överst, räkningen räknar dem
   som förväntade. Utan raden stoppar `brand-detektor.mjs --marknad NO`.
   Källkampanjen själv rörs ALDRIG — den förblir PAUSED i källkontot.
   Verktygen för den norska halvan: `node factory/brand-detektor.mjs
   --produkt <id> --marknad NO --hamta` (egna filer `brand-detektor-no.*`,
   `brand-ocr-no.json`, media i `.scratch/brand-detektor/<prefix>-NO/`),
   transkript under `kalla.no_srt_slug` (eget slug — NO_PD_1_H3 och
   Fiskespöhållare_PD_1_H3 har samma rest och får aldrig dela slug).
   ⚠️ **DEN NORSKA HALVAN ÄR INTE VALFRI** (Axels bakläxa 2026-09-09:
   varken HeimGuard eller TankGuard fick någon norsk kampanj — det norska
   kontot lästes aldrig). Kommandot är inte klart förrän BÅDA kontona är
   lästa och båda kampanjerna byggda. Har du bara läst det svenska kontot:
   du är halvvägs, inte färdig.
   Finns det bevisligen ingen norsk kampanj för produkten i Magiborsten NO:
   skriv det som ett eget konstaterande med antalet lästa kampanjer, bygg
   den svenska och säg "delvis klart". Uppfinn aldrig norska annonser ur de
   svenska här — det är `/oversatt`:s jobb, inte det här kommandots.

   ⚠️ **Leta i FLER än en kampanj per konto.** Sök varje kampanj vars
   annonser bär produktens prefix — inte bara den som `kalla.kampanj_id`
   pekar på. En produkt kan ha både en test-ABO och en skalnings-CBO.

3. **Brand-detektorn** (FAS2 uppdrag A):
   `node factory/brand-detektor.mjs --produkt <id> --hamta`
   Klassar varje annons över SEX ytor: copy, tal, inbränd text/slutkort,
   recensionsattribution, priset — och källbutikens ERBJUDANDEVILLKOR.
   Dom per annons: `ren` / `bara-copy` / `kräver-omdubb` / `kräver-slutkortsbygge`.

   Sjätte ytan är kod sedan 2026-09-09: `villkorsskanning.skannaVillkor`
   jämför källannonsens löften mot butikens EGNA villkor ur
   `factory/butiker/<id>.yaml` (`frakt`, `retur`, `leveranstid`), och en
   annons med villkorsfel kan aldrig få domen `ren`. Ytan där felet står
   avgör priset: tal → omdubb, inbränd → slutkort, copy → gratis.
   Regel: säger detektorn "ingen butikskonfig hittad" körs jämförelsen INTE
   — stoppa och peka den på butiken i stället för att lita på domarna.
   *(Utan den här spärren friades 38 av 40 svenska HeimGuard-annonser; fem bar
   "fri frakt över 300 kr", två av dem bevisade vinnare.)*

   **Priset är lika viktigt som brandnamnet.** Jämför källannonsens pris mot
   OPS-butikens `ekonomi.pris` i produktfilen. Skiljer de sig måste priset
   bytas överallt det förekommer: i copyn, i inbränd text, på slutkortet och
   i rabattpåståenden ("spara X kr", "X %"). Ett fel pris i en annons är
   både ett trasigt löfte mot kunden och ett brott mot husregeln att priset
   alltid hämtas från produktsidan vid varje körning.
   ⚠️ Norska annonser: källan (Magiborsten NO) har redan NOK-priser — jämför
   mot OPS-butikens NOK-paketnivåer, inte mot SEK-priset. Ett SEK-tal i en
   norsk annons räknar fel. Har butiken inga NOK-nivåer satta än: läs
   `butiker/<id>.yaml` `marknader[NO].valuta`. Står det SEK (standard i
   varje OPS tills Axel slår på NOK i admin, beslut 2026-09-08) betalar
   norrmännen i SEK och `/nb` visar SEK-priset — då är det talet som gäller
   i norsk copy, exakt som kunden ser det (TackleBay 2026-09-10: källan sa
   269 kr NOK, /nb visar 289,00 kr, copyn säger 289 kr). Bygg kampanjen
   PAUSED och säg rakt ut i rapporten att butiken tar SEK av norrmän.
   Saknas både NOK-nivåer OCH en SEK-marknad: stoppa den norska halvan.
   Talet läses GRATIS ur `market-expansion/no/video-batches/*/srt-orig/*.orig.srt`
   om produkten varit genom NO-flödet. ⚠️ HeyGen hör fel — sök även
   `Bawebutiken` och `Spavebutiken`.
   Visa tabellen i chatten innan något ändras.

4. **Fixa bilderna** (FAS2 uppdrag C, gratis).
   ⚠️ **Utesluten är inte klar.** En annons som bär källans pris eller villkor
   ska FIXAS, inte slängas — det är bevisade vinnare. Bild = gratis med
   verktygen nedan. Video = arbete, men den ska stå i en namngiven kö med
   vad som krävs, aldrig försvinna ur räkningen. (HeimGuard 2026-09-09:
   20 av 40 norska källor uteslöts i första bygget — hälften av materialet.) `pipeline/oversatt-bild.py`
   byter text i sin egen ruta utan krediter; `bildannonser/kie.mjs` är
   reservvägen när texten sitter direkt på fotot. Text läggs ALLTID med
   `bildannonser/text.py` — kie.ai klarar inte svensk text.
   Producera QA-bild före/efter för varje ändrad bild.

5. **Fixa videorna** (FAS2 uppdrag A2). Bara de som klassats `kräver-omdubb`.
   Kör `node pipeline/localize.mjs check` FÖRST — är plånboken tom: hoppa över
   steget, rapportera vilka videor som väntar, och fortsätt med resten.
   Inbränd text byts med `pipeline/no-precis.py`, aldrig med en ny caption-motor.
   ⚠️ Rendera aldrig före proofread (rendering drar krediter, proofread är gratis).

6. **Skriv om copyn — per marknad.** Varje `link` pekas om till OPS-butikens
   produktsida: svenska annonser till `/products/<handle>`, norska till
   `/nb/products/<handle>`. **Gissa aldrig länken** — ta den ur produktfilen
   och avbryt hellre. Brandnamn OCH pris byts i texten. Copyn skrivs av en
   subagent med `model: "sonnet"` som får `docs/copy-regler.md` —
   huvudsessionen skriver aldrig slutgiltig copy. Norsk copy skrivs på
   bokmål, aldrig översatt rakt av från svenskan.

7. **Ladda upp media i målkontot.** `image_hash` och `video_id` är PER KONTO —
   Bäverbutikens creatives går inte att referera. Ladda ner filen, brand-swappa,
   och ladda upp på nytt till `act_915422744950975` (`advideos`/`adimages`).

8. **Bygg TVÅ kampanjer — en svensk och en norsk.**
   `pipeline/no-video-launch.mjs` + `no-image-launch.mjs` med en vågkonfig per
   marknad. Allt Graph-anrop går genom `tools/meta-lib.mjs` — skriv aldrig egna
   anrop, spärrarna där är dyrköpta.

   ⛔ **STRUKTUREN ÄR LÅST. Hitta ALDRIG på en egen** (Axels beslut
   2026-09-10, den enda regeln som gäller över allt annat i det här steget).
   Varje OPS-kampanj ser EXAKT likadan ut, och det är den struktur
   `no-video-launch.mjs` bygger:
   - **EN kampanj per marknad**, `OUTCOME_SALES`, **CBO** (budgeten på
     kampanjen, `LOWEST_COST_WITHOUT_CAP`), ~1 000 kr/dag.
   - **Ett NYTT adset per koncept** — samma koncept som källkampanjens adsets
     (PD / SP / GT / CS …), **ingen egen budget på adsetet**,
     `OFFSITE_CONVERSIONS` → `PURCHASE` mot butikens pixel, geo = marknaden.
   - **Annonserna inne i sitt koncepts adset**, namn enligt
     `docs/naming-convention.md`.
   Det som är FÖRBJUDET: ABO, en budget per adset, ett adset per annons,
   ett enda adset för allt, egna koncept som inte finns i källan, en
   "testkampanj" bredvid, att lägga annonser i en kampanj som redan finns
   i kontot, eller någon annan idé om struktur — hur bra den än låter.
   Finns kampanjen redan (samma namn) fylls DEN, exakt så här, aldrig en ny
   bredvid. Hela strukturen skrivs i vågkonfigen FÖRE körning och visas i
   chatten som en tabell: kampanj → adsets → antal annonser per adset.
   - Kampanjnamnen prefixas ALLTID med brandet OCH marknaden:
     `TANKGUARD_SE_…` och `TANKGUARD_NO_…`. Alla OPS-butiker delar ett konto,
     och utan marknaden i namnet går datan inte att skära per land.
   - Båda kampanjerna ligger i samma konto (`915422744950975`, SEK) men har
     olika geo, olika språk i copyn och olika landningssida (`/` respektive `/nb`).
   - Sätt status EXPLICIT på alla tre nivåer. **Allt föds PAUSED.**
   - `promoted_object.pixel_id` = butikens egen pixel, samma för båda.
     Sida = butikens egen, samma för båda.
   - Klona aldrig ett adset utan targeting och lägg aldrig in en fallback-geo.
     En SE-fallback i den norska kampanjen visar annonserna i fel land.
   - EU-konton kan kräva `dsa_beneficiary`/`dsa_payor` — kolla innan.

9. **RÄKNINGEN — kommandots viktigaste spärr.** Den är kod sedan 2026-09-09
   och avgörs av en exitkod, inte av en bedömning:

   ```
   node factory/rakning.mjs <butik-id>          # exit 0 = KLART, exit 1 = DELVIS KLART
   node factory/rakning.mjs <butik-id> --torr   # utan att läsa kontot
   ```

   Den läser källdomarna ur `brand-detektor.json` + `kallannonser.json`,
   läser de faktiskt uppladdade annonserna ur `act_<id>/ads`, och skriver
   `factory/output/<id>/rakningen.md` med en tabell PER MARKNAD.
   Visa tabellen i chatten. **Ordet "klart" får bara skrivas när exitkoden
   är 0.** *(Axels bakläxa: TankGuard fick 10 annonser av 33 och
   rapporterades som klart.)*

   Vad spärren räknar som fel, och som ingen bedömning får runda:
   - En marknad vars källor inte lästs står som **MARKNADEN INTE LÄST** —
     aldrig som en nolla. Den norska halvan kan alltså inte glömmas bort.
   - En annons utan dom är **odömd**, varken ren eller okänd, och räknas som
     saknad. Domar slås upp på exakt namn — en norsk annons ärver aldrig sin
     svenska systers dom.
   - `okänd` och `odömd` laddas aldrig upp och räknas aldrig som förväntade,
     men redovisas. En ACTIVE annons uppe med sådan dom blockerar "klart".
   - Media i kontot är INTE en annons — räkningen läser `ads`, aldrig
     `advideos`/`adimages`.

   Varje saknad rad kommer namngiven med orsak. Saknas orsaken skriver
   rapporten "orsak saknas — måste namnges"; fyll i den, ta inte bort raden.

10. **Trippelkolla mot kontot.** Läs TILLBAKA hela strukturen ur Meta och
   jämför mot butikens konfig: `page_id`, `pixel_id`, `daily_budget`, länk och
   status på alla tre nivåer. Stämmer något inte: rätta och läs tillbaka igen.
   Delvis klart heter delvis klart.

11. **Lämna över till den som klickar.** Skriv i chatten (svenska till Axel,
    engelska till en engelsktalande anställd):
    - vad som byggdes (kampanj, antal adsets, antal annonser — och att
      räkningen säger KLART, annars "delvis klart" med de saknade namngivna)
    - vad som kopierades orört och vad som ändrades, yta för yta
    - vad som INTE gjordes och varför (t.ex. videor som väntar på krediter)
    - granskningslistan: öppna Ads Manager, kolla att länken går till
      butikens produktsida, att pixeln är butikens egen, att budgeten stämmer
    - **Kampanjerna står PAUSED tills Axel skriver "Launch: <namn>".**
      Ingen annan sätter dem ACTIVE.

11b. **"Launch: <namn>"** (Axels beslut 2026-09-10 — sista steget i hela
    OPS-flödet, `factory/SA-FUNKAR-DET.md` steg 9). När Axel skriver det i
    den här sessionen:
    - Kontrollera FÖRST att butiken är live: hämta `https://<domän>/` med
      `curl` — svarar den med `/password` är butiken inte öppnad än (plan +
      lösenordet bort, checklistans avsnitt 13–15). Då: säg det, launcha inte.
    - Kontrollera att pixeln avfyrat minst en gång (`last_fired_time` på
      pixeln) — annars säg "WeTracked är inte kopplat" och launcha inte.
    - Sätt kampanj, adsets och annonser ACTIVE via `tools/meta-lib.mjs` —
      **enbart de kampanjer den här körningen byggde** (`<BRAND>_SE_…` och
      `<BRAND>_NO_…`), namngivna i rapporten, aldrig ett svep över kontot.
    - Läs tillbaka statusen på alla tre nivåer och visa den.
    - Saknar den norska kampanjen NOK-paketnivåer i butiken: launcha bara
      den svenska och säg det.
    - Skriv startdatum + budget i `factory/produkter/<id>.yaml` (`meta.launch`)
      och i `products/<butik>/batch-log.md`. Committa och pusha.

12. **Dokumentera.** `factory/state/<butik>--<produkt>.json`, ärvd historik in i
    `products/<butik>/batch-log.md` (de brand-swappade annonserna bär med sig
    sitt bevisade DNA), och varje NYTT bevisat steg in i `factory/FAS2.md` i
    samma session. Committa och pusha.

---

## DEFINITION OF DONE

- [ ] Rätt konto verifierat före första skrivningen (mål ≠ källa)
- [ ] `kalla:`-blocket finns i produktfilen — bekräftat mot kontot, inte gissat
- [ ] Båda källkampanjerna lästa (SE + NO), bara ACTIVE-annonser med
- [ ] Brand-detektorns tabell visad: varje källannons klassad över fem ytor
      (copy, tal, inbränd text, recensioner, PRIS)
- [ ] Priset bytt överallt det förekommer — SEK i den svenska, NOK i den norska
- [ ] Källbutikens VILLKOR borta: fraktgräns, öppet köp, leveranstid, garanti
      — i copy, i bild och i talet. Butikens egna står i butiksfilen.
- [ ] Uteslutna annonser namngivna med vad som krävs — aldrig bara borttagna
- [ ] **HELA kampanjen kopierad** — varje källannons finns i målkontot eller
      står namngiven i räkningen med orsak
- [ ] Rena annonser kopierade ORÖRDA (bara länken bytt) — ingen ny
      voiceover/video/copy utan ett namngivet fel
- [ ] Vid "Launch: <namn>": butiken live (ingen `/password`), pixeln har
      avfyrat, statusen ACTIVE tillbakaläst på tre nivåer — annars orört
- [ ] Bilderna brand-swappade med QA före/efter
- [ ] Videorna omdubbade — eller listade som väntande med orsak
- [ ] All copy pekar på butikens EGEN produktsida, ingen gissad länk
- [ ] Media uppladdat i målkontot (inte refererat från källkontot)
- [ ] BÅDA källkontona lästa: MagiBorsten (SE) OCH Magiborsten NO
- [ ] Alla kampanjer per konto genomsökta, inte bara `kalla.kampanj_id`
- [ ] TVÅ kampanjer byggda: `<BRAND>_SE_…` och `<BRAND>_NO_…`
- [ ] **Strukturen är den låsta: CBO-kampanj → ett nytt adset per
      källkoncept utan egen budget → annonserna i sitt adset.** Ingen egen
      struktur, ingen ABO, inget adset per annons
- [ ] Svensk copy på svenska mot `/`, norsk copy på bokmål mot `/nb`
- [ ] Allt skapat PAUSED, status explicit på alla tre nivåer
- [ ] **`node factory/rakning.mjs <butik-id>` körd och tabellen visad — exit 0,
      annars står det "delvis klart"**
- [ ] Varje saknad annons NAMNGIVEN med orsak (rapporten skriver ut vilka)
- [ ] Ingen marknad står som "MARKNADEN INTE LÄST"
- [ ] Tillbakaläst ur Meta: sida, pixel, budget, länk och status stämmer
- [ ] VA:n har sin granskningslista och vet att hon sätter ACTIVE
- [ ] state + FAS2.md uppdaterade, pushat
