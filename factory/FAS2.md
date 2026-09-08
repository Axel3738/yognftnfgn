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
| FB-kontot väntar på verifiering | brandets Meta-SIDA → hela kampanjbygget | Meta (väntan) |
| ~~`META_ACCESS_TOKEN`~~ — finns i MOLNETS miljö (Axels besked 2026-09-08). `env.mjs` sätter aldrig över en variabel som redan finns i miljön, så all Meta-kod funkar i molnet. Saknas bara LOKALT. | inget i molnet | — |
| HeyGen-plånboken tom (13 krediter, mätt 2026-09-08) | omdubbning av video | Axel fyller på |
| `standby.md` har noll rader | ny redigerare per butik | ansökningar ur de två utskicken |

Uppdrag A, C, D och E går att köra UTAN dessa. Uppdrag B väntar bara på Meta-SIDAN
(pixeln kan skapas så snart sidan finns — `META_ACCESS_TOKEN` finns redan i molnet).

---

## Ordningen

1. **A — Brand-detektorn** (gratis, läser bara). Ger listan över vad som måste göras om.
2. **C — Bildannonserna** (gratis, ingen väntan). Snabbaste vägen till färdiga creatives.
3. **B — Kampanjbygget** (väntar på sida + token). Det som gör att pengar rör sig.
4. **A2 — Videodubbningen** (väntar på HeyGen-krediter).
5. **D — Notion + commission** (kod, ingen väntan). Måste vara klart INNAN redigeraren börjar.
6. ~~**E — Skalningsrutinen**~~ ✅ **byggd 2026-09-08** — `/skalningskungen <butik>`.
   Används först när butiken har egna annonser i kontot.

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

## Uppdrag A2 — Brand-swap av video (väntar på HeyGen-krediter)

**Vad:** byt "Bäverbutiken" mot OPS-brandet i tal, inbränd text och slutkort.

**Återanvänd detta:**
- `pipeline/translate-batch.mjs` + `pipeline/heygen.mjs` — hela HeyGen-kedjan med state
  till disk. Kör med `--lang="Swedish (Sweden)"` (samma språk in och ut).
  ⚠️ **Otestat:** ingen av de 217 körningarna har varit svenska→svenska.
  Kör `node pipeline/localize.mjs langs` FÖRST (gratis) och verifiera att språket finns.
  Håller det inte: plan B är att klippa bort/skriva över meningen, inte dubba om allt.
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

## Uppdrag E — Skalningsrutinen per OPS-butik ✅ BYGGD 2026-09-08

**Vad:** en `/skalningskungen <butik>` som analyserar, skalar och briefar — en instans
per OPS-butik.

**Levererat:**

| Fil | Vad |
|---|---|
| `.claude/commands/skalningskungen.md` | kommandot, byggt från `/cs` |
| `factory/ekonomi.mjs` | momsmedveten break-even/target + CLI som skriver ekonomiblocket |
| `factory/register.mjs` + `factory/produkter/register.json` | OPS-produktregistret (beslutet nedan) |
| `factory/skalning.mjs` | ANALYSMETOD steg 0–6 ur det delade kontot, **prefixfiltrerat** |
| `factory/minne/<butik>/` | produktminnet per OPS-butik (dna, batch-log, backlog) |
| `factory/test/ekonomi.test.mjs`, `skalning.test.mjs` | 26 tester på ekonomin och filtret |

**Mätt vid bygget 2026-09-08** (läs-bara Graph-anrop mot `act_915422744950975`):
- Kontot **faktureras i SEK** och har tidszonen **Europe/Copenhagen**.
  (`market-expansion/marknader.json` säger DKK för DK — det är marknadens pris-
  och annonsvaluta, inte kontots faktureringsvaluta. Båda är rätta; samma
  mönster i NO, där kontot är SEK trots `valuta: NOK`.)
- Kontot innehöll **6 kampanjer och 69 annonser, samtliga Bäverbutikens danska**
  (Motorhöljet DK, Axelbältet DK, Sätesöverdraget DK, Strandtofflorna DK,
  Tofflorna DK, Fiskespöhållaren DK). **Noll OPS-kampanjer.** Prefixfiltret
  slängde alla 69 och rapporterade det — utan filter hade rundan rangordnat
  Bäverbutikens danska annonser mot HeimGuards break-even.
- HeimGuard har alltså ingen egen annonsdata än; rutinen svarar "ingen dom kan
  avges" i stället för att hitta på en.

⚠️ Historik: kommandot fanns inte. Verifierat med
`git log --all --diff-filter=A -- .claude/commands/*`: 22 kommandofiler hade
någonsin skapats, ingen hette skalning/scaling. Ordet "skalningsronden"
förekommer 8 gånger men bara som **ägare av PAUSED-beslut** — en mänsklig
praxis, aldrig ett skript.

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

**Byggt:**

- **Ekonomiblocket** i `factory/produkter/<id>.yaml`: `aov_sek`, `break_even_roas`,
  `break_even_cpa_sek`, `target_roas`, `target_cpa_sek` — räknade från grunden av
  `factory/ekonomi.mjs`, aldrig kopierade.
  Momsen läses ur butikskonfigen (`moms_i_pris` + `moms_procent`) och vävs in av
  `butik.mjs`. **Skillnaden är stor:** övervakningskameran (799 kr, inköp 261 kr)
  får break-even-ROAS **2,11 med moms** mot **1,49 utan**. Hade Bäverbutikens
  räkning kopierats hade kill-linjen legat 42 % för generöst och förlustannonser
  överlevt. Talen redovisar också vad de INTE innehåller (betalväxel, returer,
  tull, bonusproduktens COGS) — varje sådan post gör break-even strängare.
  ⚠️ HeimGuards `aov_sek` är styckpriset, för butiken har ingen försäljningsdata.
  2-packet är förvalt, så verklig AOV blir högre och break-even strängare
  (2,22 på A-paketet, 2,45 på B). `skalning.mjs` läser verklig AOV ur kontot
  (minst 10 köp) och larmar vid >10 % avvikelse; kommandots steg 1a kräver
  omräkning före varje dom.
  ⚠️ Omräkningen kräver **två** tal: `aov_sek` OCH `varukostnad_per_order`.
  Antalet varor går inte att härleda ur ordervärdet — paketen är rabatterade
  (−16 till −37 %) och bär en gratis bonus, så en proportionell gissning
  underskattar COGS och gör kill-linjen för generös. `ekonomi.mjs` vägrar
  därför räkna när `aov_sek` avviker från priset utan att kostnaden är satt.
  ⚠️ **Två antaganden är obekräftade och bär hela kill-linjen:** att butiken
  redovisar moms (enda stödet är `moms_i_pris: true`, ett prisvisningsfält —
  Axel har inte sagt det) och att Metas purchase value är bruttot. Båda stängs
  med en mätning vid första ordern (kommandots steg 1a-2). Håller det första
  inte är break-even 1,49 i stället för 2,11.
- **Butiksfilter på det gemensamma kontot:** `factory/skalning.mjs` filtrerar varje
  läsning på butikens brandprefix (kampanjnamn ELLER annonsnamn, skiftlägesokänsligt,
  bara i början av namnet) och **skriver alltid ut vad den slängde**, så ett felstavat
  prefix ger en tom lista i stället för ett tyst felaktigt svar. Filtret stoppar både
  Bäverbutikens DK-kampanjer och grannbutikernas OPS-annonser. Testat i
  `factory/test/skalning.test.mjs` mot kontots sex riktiga kampanjnamn.
- **Beslutet om registret:** OPS-produkter registreras i
  **`factory/produkter/register.json`**, aldrig i `products/products.json`.
  Motivering: products.json bär i sin egen kommentar "Endast Baverbutiken.se —
  MagiBorsten 1867947880635861" och läses av ett tjugotal ställen
  (`commission/notion.mjs`, `commission/run.mjs`, `dashboard/lib/store.mjs`,
  `tools/leveranskon.mjs`, `tools/notion-kalla.mjs`, `tools/notion-klara.mjs`,
  `tools/notion-till-meta.mjs`, `tools/oversattningskon.mjs`,
  `tools/judgeme-import.mjs`, `pipeline/quota.mjs` m.fl.) som alla antar ETT konto
  och EN verksamhet. En OPS-rad där hade tyst dragit butiken in i Bäverbutikens
  commission, kvot och redigerardashboard.
  Arbetsdelningen: registret bär **kopplingen och driftläget** (butik, brand,
  prefix, konto, kampanj, hub, budget, cykel, launches), produktfilens YAML bär
  **ekonomin**. Ett tal har exakt ett hem — ett testfall vaktar att inga
  ekonomifält smyger in i registret.
  Kvotmatematiken delas i stället för att kopieras: `pipeline/quota.mjs` exporterar
  `kvotlage()` (CLI:t oförändrat, verifierat med identisk utskrift före/efter) och
  `factory/register.mjs` räknar OPS-kvoten på samma formel.

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
