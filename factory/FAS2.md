# OPS Factory — FAS 2: från byggd butik till snurrande annonser

**Skriven 2026-09-08** efter en kartläggning av repot (5 parallella granskare).
Fas 1 = bygga butiken (`PROCESS.md`, klar och bevisad på HeimGuard + TankGuard).
Fas 2 = få annonser, team och skalning på plats. Detta dokument är facit —
varje molnsession i fas 2 läser sitt avsnitt här i stället för att gissa.

Varje uppdrag nedan är ett eget avsnitt: **vad**, **återanvänd detta**,
**fallgropar**, **klart när**. Bygg aldrig ett nytt system där ett finns.

---

## Blockerare just nu (2026-09-08)

| Blockerare | Blockerar | Löses av |
|---|---|---|
| Meta-sidan **TankGuard** (`61594435402676`) är skapad men inte i Business Manager och inte tilldelad annonskontot — Graph ser den inte alls | annonsnivån i kampanjbygget | Axel/VA:n i BM |
| Butiken **tankguard.se är lösenordsskyddad** ("Opening soon", mätt 2026-09-08) | all launch — annonser till en låst dörr bränner pengar | Axel: Online Store → Preferences |
| Pixeln `2196132151319625` finns men skickar inga events (WeTracked ej kopplad) | optimering och mätning | VA:n |
| ~~`META_ACCESS_TOKEN`~~ — finns i MOLNETS miljö (Axels besked 2026-09-08). `env.mjs` sätter aldrig över en variabel som redan finns i miljön, så all Meta-kod funkar i molnet. Saknas bara LOKALT. | inget i molnet | — |
| ~~HeyGen-plånboken tom~~ — **18 008 api-krediter**, mätt 2026-09-08 kväll. Den siffran (13) var fel. | inget | — |
| HeyGens modereringskö höll 8 av 8 renderingar 2026-09-08 kväll | de sista videofilerna | HeyGen (släpper enligt logg inom ~1 h) |
| `standby.md` har noll rader | ny redigerare per butik | ansökningar ur de två utskicken |

Uppdrag A, C, D och E går att köra UTAN dessa.

**Uppdrag B, uppdaterat 2026-09-08:** kampanj- och adsetnivån är byggd och
tillbakaläst för TankGuard (se avsnittet längst ner i uppdrag B). Pixeln fanns
redan. Kvar för annonsnivån: sidan i BM, det öppna butikslåset och de sista
videofilerna. Skripten som gör resten finns: `pipeline/ops-video-launch.mjs`,
`pipeline/brand-swap.mjs`, `pipeline/brand-caption.py`.

---

## Ordningen

1. **A — Brand-detektorn** (gratis, läser bara). Ger listan över vad som måste göras om.
2. **C — Bildannonserna** (gratis, ingen väntan). Snabbaste vägen till färdiga creatives.
3. **B — Kampanjbygget** (väntar på sida + token). Det som gör att pengar rör sig.
4. **A2 — Videodubbningen** (väntar på HeyGen-krediter).
5. **D — Notion + commission** (kod, ingen väntan). Måste vara klart INNAN redigeraren börjar.
6. **E — Skalningsrutinen** (kod). Kan byggas parallellt, används först när data finns.

---

## Uppdrag A — Brand-detektorn: vilka annonser måste göras om?

**Vad:** ett verktyg som för varje Bäverbutiks-annons till en OPS-produkt ger en dom
över **fyra ytor**, eftersom de kostar helt olika mycket att åtgärda:

| Yta | Hur den läses | Kostnad att fixa |
|---|---|---|
| 1. Ad copy (message/headline/description/link) | Meta creative | gratis (skriv om) |
| 2. Talet i videon | SRT-transkriptet | HeyGen-krediter |
| 3. Inbränd text + slutkort | frames | arbetstid |
| 4. Recensionsattribution i bild ("baverbutiken.se") | bilden | gratis (`oversatt-bild.py`) |

Klassa varje annons: `ren` / `bara-copy` / `kräver-omdubb` / `kräver-slutkortsbygge`.

**Återanvänd detta:**
- `market-expansion/no/video-batches/*/srt-orig/*.orig.srt` — **217 svenska transkript
  ligger redan i repot.** Gratis facit för yta 2. Mätt 2026-09-08: 34 av 217 (16 %)
  säger brandnamnet, och det är **allt-eller-inget per produkt** (ibc 11/11,
  magnetplattor 12/12, motocentric 11/11).
  ⚠️ HeyGen hör fel: sök på `Bäverbutiken` (26 träffar), `Bawebutiken` (8), `Spavebutiken` (2).
- `tools/oversattningskon.mjs` — läser copy + media-URL + prefix ur en creative. Yta 1.
- `tools/qa-frames.py` — drar frames ur video (tätt i hooken). Yta 3.
- `pipeline/oversatt-bild.py --analys` — listar textformer i en bild. Yta 4.

**Fallgropar:**
- Källänken till Bäverbutiks-produkten står bara som en **kommentar** högst upp i
  `factory/produkter/<id>.yaml` — inget maskinläsbart fält. Lägg till
  `kalla.annonsprefix` + `kalla.produkt_id` i produktfilen, annars kan ingen körning
  veta vilka annonser som hör till butiken.
- Fel konto kostar pengar: källa = MagiBorsten `1867947880635861`, mål = MagiBorsten DK
  `915422744950975`. Kontrollera alltid `ad_account_id`, aldrig kontonamnet.

**Klart när:** en rapport per OPS-produkt listar varje källannons med sin dom på alla
fyra ytor, och `factory/produkter/<id>.yaml` bär källkopplingen maskinläsbart.

---

## Uppdrag A2 — Brand-swap av video (BEVISAD 2026-09-08, se uppdrag B)

**Vad:** byt "Bäverbutiken" mot OPS-brandet i tal, inbränd text och slutkort.

**Återanvänd detta:**
- **`pipeline/brand-swap.mjs`** — hela kedjan, byggd 2026-09-08: proofread (gratis) →
  brandordet byts i SRT:en → render → nedladdning, med state till disk.
  Svenska→svenska är **testat och fungerar** (`Swedish (Sweden)`, transkripten kom
  tillbaka i stort sett identiska med originalen). Plan B behövdes aldrig.
- **`pipeline/brand-caption.py`** — byter brandordet i den INBRÄNDA captionen utan att
  röra resten av captionspåret: mäter pillret per frame, segmenterar cuen på textens
  bläcksignatur (karaokefärgning ändrar färg, inte glyfposition) och skriver en
  `no-precis.py`-konfig för just det segmentet.
- `pipeline/no-precis.py` — byter inbränd text **exakt i sin egen ruta**. Detta ÄR
  verktyget för yta 3; bygg ingen ny caption-motor.
- `market-expansion/no/notion-batches/2026-09-05-video-batmotor/lager.py` — bevisad
  ombyggnad av telefonslutkortet (ordmärke, titel, badge, pris). Handmätta koordinater
  per video — **generalisera till ett brand-drivet verktyg**, den delen skalar inte.

**Fallgropar:** järnreglerna i `.claude/skills/translate/SKILL.md` gäller oförändrat —
rendera aldrig före proofread (rendering drar krediter, proofread är gratis), skanna
alltid källvideon efter inbränd text före leverans, spara session-ID till disk direkt.

---

## Uppdrag B — Kampanjbygget i OPS-kontot

**Vad:** bygg OPS-butikens kampanj i MagiBorsten DK `915422744950975` med butikens
egen sida, egen pixel, egen produktlänk, ~1000 kr/dag.

⚠️ **"Bara exportera kampanjerna" finns inte som knapp.** Ingen kod i repot läser en
hel kampanjstruktur ur ett konto. Och `image_hash`/`video_id` är **per annonskonto** —
Bäverbutikens creatives går inte att referera från OPS-kontot. Kedjan är:
hämta ner filen → brand-swappa → ladda upp på nytt till `act_915422744950975`.

**Återanvänd detta:**
- `pipeline/no-video-launch.mjs` — den ENDA koden som bygger en hel kampanjstruktur i ett
  målkonto (CBO, adset per koncept med `promoted_object`, idempotent, statusar explicit).
- `pipeline/no-image-launch.mjs` / `no-image-ads.mjs` — bildannonshalvan.
- `pipeline/waves/no-ibc-video.config.mjs` — **detta ÄR TankGuards produkt.** Färdig
  mall och färdig copy-struktur; byt `act`/`page`/`pixel`/`link`/`campaignName`.
- `tools/meta-lib.mjs` — allt Graph-anrop går genom detta lager. Spärrarna är dyrköpta:
  allt föds PAUSED, adset klonas ur syskon, enhancements OPT_OUT, backoff på fel 17.
- `tools/notion-till-marknad.mjs` — referensen för "ladda upp i ett ANNAT kontos
  befintliga kampanj", med fem spärrar. Kopiera spärrordningen rakt av.

**Fallgropar:**
- ⚠️ **OPS-kontot är INTE tomt.** `pipeline/waves/dk-*.config.mjs` byggde Bäverbutikens
  danska kampanjer i exakt `915422744950975` — med Bäverbutikens DK-sida
  `1324465810740336` och Bäverbutikens pixel `1554276343018184`. Varje mekanism som
  "hittar en kampanj i kontot" kan därför träffa fel verksamhet. Filtrera på brandprefix.
- ⚠️ Kontots valuta är **SEK, inte DKK** (mätt i commission-rapporterna 2026-09-04 och
  -09-07). `market-expansion/marknader.json` säger DKK — det är fel. 1000 kr/dag = `daily_budget: 100000`.
- ⚠️ `market-expansion/marknader.json` DK-blocket pekar på OPS-kontot med `page: null`
  och `pixel: null`, och sidspärren i `notion-till-marknad.mjs` är villkorad. Sätts DK
  `aktiv: true` launchar `/oversatt` Bäverbutikens danska annonser i OPS-kontot. Lös
  krocken innan DK aktiveras.
- ⚠️ Sätt status **explicit på alla tre nivåer**. `batch.mjs`/`multi-batch.mjs` sätter
  adset PAUSED men annonsen ACTIVE; `uk-wave.mjs` sätter båda ACTIVE; `mastern-batch.mjs`
  har ingen default alls.
- ⚠️ PAUSED med spend > 0 är ett BESLUT, aldrig ett fel att rätta.
- ⚠️ Meta tvångspausar vid varje budget-/strukturändring. Sätt ACTIVE igen och verifiera
  med tillbakaläsning.
- ⚠️ Länken får ALDRIG gissas — avbryt hellre än att falla tillbaka på startsidan.
- ⚠️ Kampanjnamnet prefixas med brandet (`TANKGUARD_…`); alla OPS-butiker delar ett konto.
  Tre konkurrerande namnregler finns i repot — spika en och skriv in den i PROCESS.md.
- ⚠️ EU-konton kräver `dsa_beneficiary`/`dsa_payor`. Ta reda på om OPS-kontot gör det
  innan första annonsen, annars faller skapandet.

**Klart när:** kampanjen är tillbakaläst ur kontot och `page_id`, `pixel_id`,
`daily_budget`, länk och status på alla tre nivåer matchar butikens konfig exakt.

### Läget 2026-09-08 — TankGuard (första OPS-kampanjen)

Byggt och tillbakaläst ur kontot med
`node pipeline/ops-video-launch.mjs pipeline/waves/tankguard-video.config.mjs --verifiera`:
**24 av 24 kontrollpunkter gröna** på kampanj- och adsetnivå.

| | |
|---|---|
| Kampanj | `TANKGUARD_Tanköverdraget SE \| BE-ROAS 1,62 \| 2026-09-08` (`120248995235740172`) |
| Konto | Magiborsten DK `915422744950975`, **valuta SEK** (avläst — `marknader.json` säger fortfarande DKK och har fortfarande fel) |
| Budget | `daily_budget 100000` = 1000 kr/dag, CBO, LOWEST_COST_WITHOUT_CAP ✅ |
| Pixel | `2196132151319625` ("TankGuard", ägs av målkontot) på alla fyra adsets, `custom_event_type PURCHASE` ✅ |
| Adsets | PD / SP / CS / GT, geo SE, ingen egen budget ✅ |
| Status | PAUSED på alla tre nivåer, explicit satt ✅ |
| Länk | `https://tankguard.se/products/tankoverdraget` ✅ (i konfigen; sitter på creative-nivå, så den kan inte läsas tillbaka förrän annonserna finns) |

### Videorna — läget 2026-09-08 kväll

Hela kedjan är byggd och bevisad på en video; det som återstår är HeyGens
modereringskö.

- **Källvideorna hämtas hem ur SE-kontot.** ⚠️ `creative.video_id` är INTE
  annonskontots video — den ligger i `creative.object_story_spec.video_data.video_id`.
  Och `GET /<video_id>` är spärrat för tokenen (`(#10) Application does not have
  permission`); källan läses i stället ur EDGEN `act_<id>/advideos?fields=id,title,source`.
  Alla 11 svenska IBC-videor är 720×1280 @ 30 fps (textscan.json från NO-batchen
  mätte en 1080×1920-kopia — räkna aldrig band i fel upplösning).
- **`pipeline/brand-swap.mjs`** kör HeyGens proofread-flöde svenska→svenska.
  Språket finns (`Swedish (Sweden)`), transkripten kom tillbaka i stort sett
  identiska med originalen, och brandordet byttes i alla 11 (1–2 träffar per video).
- **Proofreaden hittade tre falska påståenden** som följt med från Bäverbutiken och
  som rättats av copy-subagent (sonnet), stavelse för stavelse:
  `IBC_CS_1_H2` "25 % rabatt" → **23 %** (489/636 är 23,1 %; samma video sa redan
  636/489), `IBC_CS_1_H3` "till halva priset" → **"för under 500 kronor"** (falskt
  claim), `IBC_SP_1_H2` "Tusentals svenskar" → **"Redan 4,81 av 5 stjärnor"**
  (Bäverbutikens social proof, inte en nystartad butiks).
  De rättade transkripten ligger i `factory/output/tankoverdraget/srt/`.
- **`pipeline/brand-caption.py`** löser den inbrända texten. Captionpillret säger
  "från bäberbutiken." även efter omdubben — HeyGen rör bara ljudet. Verktyget
  mäter pillret per frame, segmenterar cuen på TEXTENS bläcksignatur (karaoke-
  färgningen ändrar färg men inte glyfposition) och byter bara det segment som bär
  brandordet. `no-precis.py` gör själva bränningen. Verifierat i bild på
  IBC_PD_1_H1: "Ett IBC-tanköverdrag" orört, "från bäberbutiken." → "från TankGuard."
- ⚠️ **HeyGen: 8 av 8 renderingar fastnade i `video pending moderation by our team`.**
  Systematiskt, inte per video (tidigare batcher fick 1–2). Kvoten är inte problemet
  — 18 008 api-krediter. Det släpper enligt körloggen inom ~30–60 min; rendera
  ALDRIG om, det kostar krediter en gång till. Polla i stället.

**Annonsnivån är inte byggd — dessa saker saknas, alla utanför kod:**

1. **Butikens Meta-sida är inte åtkomlig för annonskontot.** Axel skapade sidan och
   gav id:t `61594435402676` 2026-09-08, men Graph svarar `does not exist, cannot be
   loaded due to missing permissions` på den, och den syns varken i `me/accounts`
   (39 sidor), i MagiBorsten-företagets `owned_pages` (HeimGuard, Bæverbutiken,
   BeaverShop, MagiBorsten) eller i kontots `promote_pages` (0). Sidan måste läggas
   till i Business Manager OCH tilldelas annonskontot innan en creative kan byggas.
   `page: null` i konfigen tills dess; skriptet vägrar bygga annonser utan den och
   gissar aldrig en sida.
2. **Butiken är lösenordsskyddad.** `https://tankguard.se/products/tankoverdraget`
   svarar 200 men levererar Shopifys lösenordssida (`page_type: "password"`,
   "Opening soon"), mätt 2026-09-08. Annonser dit bränner pengar på en låst dörr.
   Lösenordet stängs av i **Online Store → Preferences**.
3. **Pixeln skickar inga events.** `2196132151319625` finns i kontot men är inte
   kopplad i WeTracked (VA:ns besked, STATUS-filens punkt 3–4). Utan events
   optimerar kampanjen på ingenting.
4. **Videofilerna är under produktion.** Källan för SE är Bäverbutikens **svenska**
   IBC-annonser (kampanj `120250001079150291`: `IBC_PD_1_H1…H3`, `IBC_SP_1_H1…H3`,
   `IBC_CS_1_H2…H3`, `IBC_GT_1_H1…H3`) — inte den norska batchen, som är dubbad till
   norska. Allt utom HeyGens modereringskö är gjort, se avsnittet ovan.

När allt fyra är löst: sätt `page` i konfigen, lägg de elva mp4:orna i
`factory/output/tankoverdraget/video/` och kör skriptet utan `--bara-struktur`.
Kampanj och adsets återanvänds på namn — inget byggs om.

⚠️ TankGuards butikskonfig ligger **inte på `main`**: `factory/butiker/tankguard.yaml`,
`factory/produkter/tankoverdraget.yaml`, `factory/state/tankguard--tankoverdraget.json`
och `factory/output/tankoverdraget/STATUS.md` finns bara på grenen
`claude/ny-ops-ibc-tank-cover-jjwesr`. Siffrorna ovan är lästa därifrån och
inlagda i vågkonfigen, så kampanjbygget står på egna ben — men grenen behöver
mergas, annars ser nästa session TankGuard som obyggd (samma fälla som
axelbältets produktminne).

Copyn är redan skriven (copy-subagent, sonnet, 2026-09-08) ur den svenska
källcopyn som spenderar pengar i dag, med TankGuards egna siffror: betyget
4,81 av 5 (16 recensioner) i stället för Bäverbutikens 4,4, och CS-konceptets
"IDAG ENDAST" utbytt mot introduktionspris — en nylanserad butik kan inte hålla
ett dygnspåstående.

---

## Uppdrag C — Bildannonserna (gratis, ingen väntan)

**Vad:** brand-swappa Bäverbutikens bildannonser till OPS-brandet, svenska och norska.

**Återanvänd detta:**
- `pipeline/oversatt-bild.py` — byter text i en bildannons **utan krediter**: hittar de
  enfärgade formerna, suddar texten med formens egen färg, ritar ny text i samma ruta.
  `--analys` ger formlistan, QA-bild SE|NY sida vid sida, exit 3 om text ligger utanför.
- `pipeline/oversatt-batch.py` + `overrides.json` — batchdrivaren.
- `bildannonser/text.py` — skarp vektortext med STILAR och autokrympning.
- `bildannonser/kie.mjs` — reservväg när brandtexten sitter direkt på fotot utan platta
  (formdetektorn hittar den aldrig). Saldo mätt 2026-09-08: 16 009 krediter.

**Fallgropar:** kie.ai klarar INTE svensk text — metoden är alltid "kie rensar text →
`text.py` lägger vektortext". Aldrig tvärtom.

---

## Uppdrag D — Notion, konton och commission

**Vad:** göra rutinerna medvetna om att det finns fler än en verksamhet.

⚠️ **Det viktigaste att förstå:** teamspacet skyddar ingenting i koden.
`hittaHubbar()` i `tools/notion-kalla.mjs` gör en REST-sökning **utan sökterm** och tar
varje databas integrationen ser — REST-API:t kan inte fråga på teamspace (står i
kommentaren rad 25–27). En OPS-hub i ett nytt teamspace kommer alltså med automatiskt
i Bäverbutikens rutiner. Det enda riktiga skyddet i dag är prefixkartan ur MagiBorsten
(`leveranskon.mjs` rad 175) — **och det skyddet brister för OPS, eftersom OPS-butiken
säljer samma produkt som Bäverbutiken.**

**Bygg:**
1. Ett **hubbregister** som binder hub → butik → teamspace → annonskonto → sida/pixel →
   prefix → landningssida. I dag ligger kopplingarna utspridda i `products/products.json`
   (4 hubbar), `commission/hubbar.json` (18), `products/prefix-alias.json` och
   `market-expansion/*/produkter.json` — ingen bär annonskonto per hub.
   `commission/hubbar.json` har redan `{ id, namn, verksamhet, marknad }` — utöka den.
2. **Kontoparametrisering** av `tools/notion-till-meta.mjs` (rad 39 hårdkodar
   `BAVERBUTIKEN_ACT`, rad 157 och 297 dödar körningen) och `tools/leveranskon.mjs`
   (rad 90, 96–100, 115). Riv aldrig spärren — byt den mot "kontot som butikens
   hubbregister anger".
3. **Commission för OPS.** `915422744950975` står i `UTLANDSKA_KONTON`
   (`commission/berakning.mjs` rad 35) — all OPS-spend ger 0 kr i dag. Raden kan inte
   bara tas bort: Bäverbutikens danska annonser ligger i samma konto, och de ska
   fortsatt vara utan commission (Axels beslut 2026-08-31). Filtret måste bli
   per brandprefix, inte per konto.

**Fallgropar:**
- ⚠️ Notion-åtkomst ges per sida. Ärvd behörighet från Bäverbutikens teamspace-toppsida
  **följer inte med** när databasen flyttas. Resultat: 404 = "inte inbjuden".
- ⚠️ `commission/run.mjs` (rad 227–233) **avbryter hela körningen** om en känd hub inte
  gick att läsa. `IBC Tank Cover creative hub` står i `hubbar.json` som Bäverbutiken —
  flyttas den utan att registret uppdateras dör commission-rutinen.
- ⚠️ Notions API kan **inte** skapa teamspaces, och databasflytt mellan teamspaces går
  bara i UI:t. De stegen är manuella klick i `CHECKLISTA.md` — skriv aldrig kod som
  låtsas göra dem.
- ⚠️ Uppladdad rad flyttas till `SE-ACTIVE to be translated`. En OPS-hub i den kön
  plockas upp av `/oversatt`, som slår upp annonsnamnet i MagiBorsten SE och rapporterar
  "inte uppe i Sverige". Bestäm vilken kö OPS-rader ska hamna i.
- ⚠️ Arkiverade databaser syns inte i `search()`. Därför golvet av hårdkodade id:n.

---

## Uppdrag E — Skalningsrutinen per OPS-butik

**Vad:** en `/skalningskungen <butik>` som analyserar, skalar och briefar — en instans
per OPS-butik.

⚠️ **Den finns inte.** Verifierat med `git log --all --diff-filter=A -- .claude/commands/*`:
22 kommandofiler har någonsin skapats, ingen heter skalning/scaling. Ordet
"skalningsronden" förekommer 8 gånger men bara som **ägare av PAUSED-beslut** — en
mänsklig praxis, aldrig ett skript. Bygg från `/cs` som mall.

**Återanvänd detta:**
- `.claude/commands/cs.md` — kärnloopens fem steg. Byt fyra saker: annonskontot
  (rad 25 hårdkodar Bäverbutiken), kanalen, hubben, produktminnets sökväg.
- `docs/os/ANALYSMETOD.md` — **oförändrad och obligatorisk**, den är produktagnostisk.
  Enda Bäverbutiksspecifika delen är tabellen rad 100–109.
- `pipeline/quota.mjs` — ren matematik, fungerar för vilken produkt som helst med
  `daily_budget_sek` + `target_cpa_sek` + `cycle_start` + `launches[]`.
- `.claude/commands/forsta-batch.md` — formatet för butikens FÖRSTA runda.
- `products/<id>/dna.md` + `batch-log.md` + `backlog.md` — mappstrukturen kopieras per
  OPS-butik. **Bonus:** när en Bäverbutiks-annons brand-swappas följer dess bevisade
  DNA med — skriv in den ärvda historiken i `batch-log.md`, annars ser rutinens första
  körning 12 annonser utan hypoteser.

**Bygg:**
- **Ekonomiblocket** i `factory/produkter/<id>.yaml`: `aov_sek`, `break_even_roas`,
  `target_roas`, `break_even_cpa_sek`, `target_cpa_sek`. I dag finns bara `inkopskostnad`
  och `pris`. Utan dem kan rutinen varken rangordna eller döma.
  ⚠️ Räkna om från grunden — Bäverbutiken säljer UTAN moms, men
  `factory/butiker/*.yaml` säger `moms_i_pris: true`. Kopiera aldrig break-even-tal
  mellan verksamheterna.
- **Butiksfilter på det gemensamma kontot.** ANALYSMETOD steg 0 säger "hämta hela
  kampanjen sorterad på amount_spent" — men MagiBorsten DK bär ALLA OPS-butiker.
  Utan prefixfilter (`TANKGUARD_`) läser rutinen andra butikers annonser som om de
  vore samma produkt.
- **Beslut:** registreras OPS-produkter i `products/products.json` eller i ett eget
  register? `products.json` läses av elva skript — läggs OPS-produkter in där dras de
  tyst in i Bäverbutikens commission, kvot och dashboard.

**Fallgropar:** hela `ANALYSMETOD.md` gäller — enmetriks-domar förbjudna, rangordna på
vinstbidrag `(break-even-CPA − CPA) × köp`, signifikansgrind 300 kr/3 köp, regel 11
(nya tester i separat test-ABO), modellpolicyn (copy skrivs av subagent med `sonnet`).

---

## Uppdrag F — Redigeraren per butik

**Återanvänd:** `factory/discord.mjs` (bygger servern OCH plockar nästa `redo` ur
standby), `factory/rekrytering/jobbannons-video-editor.md` (hela ramverket, byt bara
codeword), `factory/redigerare/anstallningsavtal.md` (mallen, signerad 2026-09-04).

**Blockerare:** `factory/redigerare/standby.md` har noll rader. De två utskicken
(`annons-1-kanelbulle.txt`, `annons-2-surdeg.txt`) är publicerade — ansökningarna
därifrån är råmaterialet.

**Beslut som saknas från Axel:**
1. Får en OPS-redigerare commission på sin butiks **norska** annonser?
   `FRAMMANDE_MARKNAD`-regexen filtrerar bort varje annonsnamn med segmentet `NO`,
   men SE+NO är standard i varje OPS-butik och det är samma redigerare.
2. Beredskapsersättningen: 100 eller 200 kr/mån, och vad "redo" betyder i avtalet.
