# /notionscalercs – Nattvakten: budget + creative strategy per OPS-butik

Argument: `$ARGUMENTS` — antingen `setup <butik>` (EN gång per butik, körs
interaktivt av Axel) eller `<butik>` (rutinens prompt, körs varje natt).
Butiken är nyckeln i OPS-registret: `hemvakten`, `tankguard`, `drytrek`,
`tacklebay/fiskespohallare-4-pack` … (`node factory/register.mjs` listar).

```
/notionscalercs setup hemvakten      # bygger hubbkopplingen, minnet och rutinen
/notionscalercs hemvakten            # det rutinen kör varje natt 00:01 svensk tid
```

CONNECTORS: inga. Rutinen går via env-nycklar (`META_ACCESS_TOKEN`,
`NOTION_TOKEN`, `DISCORD_BOT_TOKEN`, `ANTHROPIC_NYCKEL` — inte `ANTHROPIC_API_KEY`, det namnet göms av Claude Code för skripten) och REST — aldrig
via Notion-MCP:n. Det är hela poängen: **noll godkännandeklick** (Axels krav
2026-09-10: "jag måste gå in och godkänna 24/7 varje grej den vill göra i
notion" — det ska bort). Använd ALDRIG `mcp__Notion__*` i det här kommandot,
inte ens om verktygen råkar finnas.

**Vad kommandot är, i tre meningar (Axels beslut 2026-09-10):** en rutin per
OPS-butik, för varje butik har eget teamspace i Notion och nya butiker
tillkommer hela tiden. Varje natt dömer den butikens annonser i OPS-kontot
och dödar / skalar / sänker budget själv inom spärrarna. Onsdag och söndag
gör den dessutom creative strategy (feedback-loop per annons, gemensamma
variabler) och lägger nya briefer i butikens creative hub.

Detta är `/skalningskungen` (steg 1, 2, 4) + `/cs` (steg 2–5) + `/rutin`,
parametriserat för OPS. Nattvakten gör INTE leveransen: redigerarens
färdiga annonser tas av `/ops-leverans` (13:40, To be Reviewed → live i
SE-kampanjen) och `/ops-oversatt` (15:40, → live i NO-kampanjen). Setup
bygger alla tre. Facit som gäller oförändrat: `docs/os/ANALYSMETOD.md`
(obligatorisk, kortas aldrig), `docs/copy-regler.md`, `docs/naming-convention.md`,
`factory/TRAPPAN.md`. Rör inte `/skalningskungen` — det kommandot är
Bäverbutikens larm och har sin egen rutin.

---

## Järnregler (gäller båda lägena)

1. **Rätt konto.** OPS-butiker skriver ENBART i MagiBorsten DK `915422744950975`.
   Bäverbutiken `1867947880635861` läses bara (ärvd historik) och får aldrig en
   skrivning — `factory/register.mjs sakerstallKonto` kastar annars. Kolla
   `ad_account_id`, aldrig kontonamnet.
2. **PAUSED med spend är ett beslut.** Aktivera aldrig något. Enda undantaget:
   Metas tvångspaus på exakt den enhet ronden själv nyss ändrade, verifierad
   med tillbakaläsning (`factory/budgetrond.mjs` gör det själv).
3. **Ingen dom under 300 kr spend eller 3 köp.** Ranking på vinstbidrag
   `(break-even-CPA − CPA) × köp`, aldrig ROAS eller CPA ensamt. Kill mot
   break-even, aldrig mot target. Top spendern är benchmark.
4. **Hitta aldrig på data.** Saknas något: skriv det, leverera resten.
5. **Discord är på engelska**, i butikens egen server (den heter brandet,
   eller `<Brand> — OPS`). Nattens budgetrapport går till `#ads`, briefdagens
   rapport till `#ads-to-do` där redigeraren tittar. Axel pingas BARA under
   `🔴 ACTION NEEDED`. Redigeraren pingas när hon har nya briefer — då pingas
   Axel också. Inget att göra = ingen ping.
6. **Kör klart utan att invänta godkännande mellan stegen.** Fråga bara när
   ett beslut kräver ägaren (pris, ny target). Rapportera i två listor:
   "Gjort av mig" / "Väntar på en människa", Axels uppgifter sist, numrerade.

---

## Läge SETUP — `/notionscalercs setup <butik>` (en gång per butik)

Gör i ordning. Varje steg skriver ut vad det fann; stoppa aldrig tyst.

1. **Butiken i registret.** `node factory/register.mjs skriv-in` och sedan
   `node factory/register.mjs <butik> --idag $(node -e "import('./factory/register.mjs').then(m=>console.log(m.svenskDatum()))")`.
   Kontot ska vara `915422744950975`, prefixet ska finnas. Flerproduktsbutik
   (tacklebay): kör setup per produktnyckel `butik/produkt`.
2. **Hubben i Notion.** Axel har redan flyttat hubbarna till egna teamspaces
   (2026-09-10). Kör `node tools/notion-brief.mjs --hubbar` och välj den hub
   som är produktens (titeln är produktnamnet på engelska, t.ex.
   "Surveillance Camera creative hub" = HeimGuard). Kriterier: har `Namn`,
   `Status`, `Typ` med `Video - Pending Approval`. Skriv in den:
   `node factory/register.mjs notion <nyckel> <database_id> <hubbens namn>`.
   Syns hubben inte (404 eller saknas i listan) betyder det **"inte inbjuden"**:
   det är Axels klick — `•••` uppe till höger på hubben → **Add connections**
   → **Bäverbutiken RUTINER**. Skapa ALDRIG en ny hub när det finns en; finns
   det verkligen ingen: `node tools/notion-hub.mjs --foralder <sida-i-teamspacet> --butik <butik>`.
3. **Minnet.** `products/<butik>/dna.md`, `batch-log.md`, `backlog.md` ska
   finnas (HeimGuard och TankGuard har dem från `/ny-annonser`). I en
   flerproduktsbutik ligger minnet per produktnyckel:
   `products/<butik>/<produkt>/` (TackleBay: `products/tacklebay/fiskespohallare-4-pack/`,
   se `products/tacklebay/README.md`) — `<butik>` i resten av kommandot
   betyder då den mappen. Saknas de:
   kör `node factory/skalning.mjs <nyckel> --dagar 90 --arv --marknad SE --json`
   och skriv dem ur den ärvda historiken med samma form som
   `products/hemvakten/dna.md` — varje siffra märkt **ÄRVD** + källa + datum.
   Hypoteser som aldrig loggades skrivs `hypotes: ej loggad`. Gissa aldrig.
4. **Redigeraren.** Är en redigerare tilldelad butiken:
   `node factory/register.mjs redigerare <nyckel> "<namn>" <discord-id>`.
   Annars lämna tomt — rapporten säger då "ingen redigerare tilldelad" och
   briefronden begränsas till 7 per rond (en dags produktion) i stället för
   kadensens 21, så hubben inte fylls med briefer ingen gör.
   **Säger Axel uttryckligen att ronden ändå ska få fler** (CatCabin
   2026-09-12: "redigerare obestämt men leverera 21 briefer ändå den första
   ronden, jag fixar redigerare asap"), skriv in det som en överstyrning —
   aldrig som ett tal i huvudet:
   `node factory/register.mjs briefantal <nyckel> 21 "Axels beslut <datum>: …"`.
   Engång som standard: `brief-kord` i rutinens steg 8 förbrukar den, och
   nästa rond går på 7 igen tills `redigerare` är satt. `--tillsvidare`
   låter den stå; `briefantal <nyckel> auto` tar bort den. Raden
   `Briefrond:` i `node factory/register.mjs <nyckel>` är facit för rutinen.
5. **Torrkörning av allt.** I ordning, visa utskrifterna:
   ```
   node factory/budgetrond.mjs <nyckel> --idag <datum> --torr
   node factory/skalning.mjs <nyckel> --dagar 14 --arv --marknad SE
   node tools/notion-brief.mjs --hub <database_id> --namn TEST_SETUP --typ video --brief docs/os/NOTION-FORMAT.md --torr
   node tools/discord-rapport.mjs --jobb factory/output/<butik>/exempel-rapport.json --torr
   ```
   (Skriv en liten exempel-jobbfil själv för Discord-torrkörningen.) Något
   rött här = rutinen ska inte byggas än; fixa först.
6. **TRE rutiner per butik** (Axels beslut 2026-09-11), var och en bunden
   till en egen fast session. Setup är **idempotent**: kör `list_triggers`
   först och bygg BARA de som saknas för den här butiken — en butik som
   redan har sin nattvakt får bara leveransrundan och översättningen. Det
   är så befintliga butiker kompletteras: samma kommando igen.

   | Rutin | Bastid | Kommando |
   |---|---|---|
   | Nattvakten | 00:01 + 8 min × butikens plats | `/notionscalercs <nyckel>` |
   | Leveransrundan | 13:40 + 5 min × plats | `/ops-leverans <nyckel>` |
   | Översättning NO | 15:40 + 5 min × plats | `/ops-oversatt <nyckel>` |

   **Tiderna räknas av skriptet, aldrig i huvudet:**
   ```
   node factory/rutin.mjs --tider <butik> --skriv-in
   ```
   Varje butik får en egen plats (sparas i `register.json` `rutinplatser`,
   delas ut en gång och flyttas aldrig), för fem nattvakter som startade
   00:01 samtidigt slog i Metas rate limit på det delade kontot (mätt
   2026-09-12). **Har butiken redan en rutin med en annan cron än
   utskriften: `update_trigger` till den nya cronen** — bygg aldrig om.
   Committa `register.json` när en plats skrivits in.
   För var och en, i ordning, exakt enligt `.claude/commands/rutin.md`:
   ```
   node factory/rutin.mjs --tid <tid ur --tider> --kommando "<kommando>" --butik <butik>
   ```
   Exit 1 = bygg inte (vanligast: du står inte på `main` — merga först).
   Sedan `create_session` (title ur utskriften, `source_url` repot,
   `outcome_branch: "main"`, taggar ur utskriften) → `create_trigger`
   (daglig cron ur utskriften, `persistent_session_id` = sessionen,
   `prompt` = kommandot, `initiation: human_request`) → `list_triggers`
   igen och visa raden. Nattvaktens cron ligger dagen före i UTC
   (00:01 CEST = `1 22 * * *`) — det är rätt. Anteckna vintervärdena.
   Innan leveransrundan byggs: `node tools/ops-leveranskon.mjs <nyckel> --marknad SE`
   ska hitta hubben och exakt en SE-kampanj. Innan översättningen byggs:
   samma med `--marknad NO --status "SE-ACTIVE to be translated"` — saknas
   NO-kampanjen byggs rutinen ändå (den rapporterar "no NO campaign" tills
   `/ny-annonser` byggt den), men säg det i rapporten.
   ⚠️ Rutiner listade under Axels andra Claude-konto syns inte här — det är
   inte en dubblett, det är ett annat konto. Alla tre rutinerna för en butik
   ska ligga på SAMMA konto.
7. **Skriv upp dem.** Rader i CLAUDE.md:s rutintabell (tid, båda
   cron-värdena, kommando, trigger-id, session-id), commit, push.
8. **Rapport.** Gjort / väntar på människa. Axels uppgifter sist, numrerade:
   env-nycklar som saknas i rutinens miljö (steg 5 avslöjar dem), hubbar som
   inte är delade, redigerare som inte är satt.

---

## Läge RUTIN — `/notionscalercs <butik>` (varje natt)

Börja med färsk `main`: `git fetch origin main && git checkout main && git reset --hard origin/main`
(allt tidigare arbete är pushat). Läs CLAUDE.md på nytt. Sätt
`IDAG` = svensk dag (`node -e "import('./factory/register.mjs').then(m=>console.log(m.svenskDatum()))"`)
— containern går i UTC och klockan 00:01 svensk tid är fortfarande gårdagen där.

### Steg 0 — Läget
`node factory/register.mjs <nyckel> --idag $IDAG`. Läs av: konto, prefix,
hubb (saknas hubben: stoppa briefdelen, gör budgetdelen, larma i rapporten),
**Briefdag JA/NEJ**, redigerare.
**Svarar registret "Okänd butik" eller står posten i läge `avslutad`**
(t.ex. TankGuard, avslutad 2026-09-12): butiken körs inte längre. Gör
INGENTING i kontot, ingen Discord-post, ingen commit. Skriv en rad i
chatten: "<butik> är avslutad i registret — pausa rutinen i Routines-vyn"
och avsluta. Samma regel gäller `/ops-leverans` och `/ops-oversatt`.

### Steg 1 — Budgetronden (varje natt)
```
node factory/budgetrond.mjs <nyckel> --idag $IDAG
```
Skriptet visar tabellen FÖRE skrivning, genomför max 3 ändringar inom
spärrarna, läser tillbaka gammalt → nytt och loggar varje rad i
`factory/budgetlogg.jsonl`. Reglerna står i `factory/budgetbeslut.mjs` och
är facit — ändra aldrig en siffra i huvudet. Kortversion, så rapporten kan
förklara dem:
- **Raket** ROAS ≥ 5 tre OCH sju dagar → budgeten dubblas (Axel 2026-09-10),
  varje natt om det håller, tak 4 000 kr/dag.
- **Snabb** vinst ≥ 25 % och ROAS ≥ 3 → +20 % varje natt.
- **Skala** vinst ≥ 25 % båda fönstren → +20 %, minst 3 dygn mellan ändringar.
- **Sänk** vinst < 16 % → −30 %, golv 500 kr, minst 3 dygn mellan ändringar.
- **Förlustserie** 5 förlustdygn i rad → −30 % direkt, utan kadens. En
  kampanj pausas ALDRIG för det (Axel 2026-09-10). **Noll köp** efter
  3 × break-even-CPA i spend → −30 % varje gång; enda kampanjpausen är när
  den redan står på golvet 500 kr och ändå har 0 köp på en vecka.
- **Döda annons** — två vägar: förlorare (CPA över break-even efter ≥ 500 kr
  och ≥ 3 köp, trenden håller i 7 dagar), eller **ny annons-regeln** (Axel
  2026-09-10): spenderat ≥ 3 × target-CPA och går inte med vinst (0 köp,
  eller CPA över break-even) → pausas. Aldrig annonsen som bär > 30 % av
  vinstbidraget.
- Ändring nr 4 och uppåt görs inte — de står under `🔴 ACTION NEEDED`.
Fel från Meta (token, rate limit) står i rapporten, aldrig tyst.

### Steg 2 — Inte briefdag? Avsluta här.
Bygg Discord-jobbet (läge `budget`) ur `factory/output/<butik>/budgetrond-$IDAG.json`,
posta med `node tools/discord-rapport.mjs --jobb <fil>`. Stämpla
`node factory/register.mjs kord <nyckel> $IDAG`. Committa `factory/budgetlogg.jsonl`
+ `factory/produkter/register.json`, pusha till `main`. DoD sist. Klart.

### Steg 3 — Briefdag: avläsningen (ANALYSMETOD steg 0–7)
```
node factory/skalning.mjs <nyckel> --dagar 14 --arv --marknad SE --spara --json > factory/output/<butik>/analys-$IDAG.json
node factory/skalning.mjs <nyckel> --dagar 14 --arv --marknad SE
```
Visa: prefixfiltret med antal bortfiltrerade, båda linjerna, vinstbidragstabellen,
"för tidigt"-högen utanför rankingen, metrik-diagnosen (hook 3 s, hold, CTR, CPC,
CVR, CPM). **Helheten dömer**: vinstbidrag och spendandel först, ROAS/CPA som
kontext, CTR/CPC/hook/hold som diagnos av VAR en annons tappar — aldrig som
skäl att döda. **Ärvd historik** (Bäverbutikens annonser för samma produkt)
visas separat, märkt ÄRVD, och används för mönster och konceptkällor — aldrig
för budget. Har OPS-kampanjen 0 bedömbara annonser är det KALLSTART: hela
ronden blir nya koncept ur ärvd DNA, och rapporten säger "ingen feedback-loop —
ingen bedömbar annons än".

### Steg 4 — Feedback-loop per annons och gemensamma variabler (ANALYSMETOD 6b)
För VARJE annons i förra batchen (`products/<butik>/batch-log.md`):
- Hämta briefen ur hubben (`node tools/notion-klara.mjs --brief <page-id>`,
  eller ur `products/<butik>/batch-NN/…/brief.md`) och läs `VARIABELTAGGAR:`.
- Skriv utfallet mot hypotesen i batch-log.md: höll den eller inte, med data.
- Bildannonser: ladda ner och titta (`tools/notion-fil.mjs` för bilagan).
- Gruppera vinstbidraget per variabelvärde (vinkel, hook-typ, format, proof,
  offer, visuell stil, textmängd, talare, copy_model). Peka ut ≥ 3 mönster,
  märk **bevisad** (≥ 2 annonser, ≥ 3 köp vardera) eller **hypotes**, och
  översätt vart och ett till en instruktion i nästa brief.
- Uppdatera `products/<butik>/dna.md`: datum, körning nr, Winning/Losing DNA,
  rotorsaker. Data skild från hypotes.

### Steg 5 — Nästa batch
**Först: finns det någon som gör dem?** Ligger förra batchens rader
fortfarande i `Draft` i hubben OCH ingen redigerare är tilldelad ⇒ inga
nya briefer den här ronden. Rapportera "waiting for editor — N briefs
still in Draft" under ACTION NEEDED och gå till steg 8. (Mätt 2026-09-12:
fyra butiker fick 7 briefer var på lördagen och skulle fått 7 till på
söndagen utan att någon gjort en enda.)
Storlek: **raden `Briefrond:` i `node factory/register.mjs <nyckel>` är
facit** — `factory/kadens.mjs` (7/dag × 3 = 21, hälften varianter av vinnare,
hälften nya koncept) när en redigerare är tilldelad; annars **7**; eller
Axels överstyrning (`briefantal`, t.ex. CatCabin 2026-09-12: 21 första
ronden trots ingen redigerare). En engångsöverstyrning gäller före stoppet
ovan den ronden — Axel har tagit beslutet själv — och förbrukas av
`brief-kord` i steg 8; skriptet säger då vad nästa rond går på. Varje
variant pekar på sin förälder och isolerar EN variabel. Varje nytt koncept
pekar på playbook, winning line eller swipe — annars märks det `gissning`.
**Minst två av raderna är bildannonser** (Axels beslut 2026-09-12: bild är
billigt och snabbt) — de räknas inom antalet, inte ovanpå, och varje
bildbrief slutar med ett IMAGE PROMPT-block enligt `.claude/commands/ops-bild.md`
steg 3, så att steg 7 kan generera dem samma natt.
Ta med alla väntande items i `backlog.md` (märk `[använd i batch #N]`).
Namn enligt `docs/naming-convention.md` med butikens prefix; lediga AD-ID:n
läses ur OPS-kontot (analys-JSON:en) OCH ur hubbens befintliga radnamn.

### Steg 6 — Copy: A/B Fable mot Sonnet (Axels beslut 2026-09-10)
Copyn skrivs av en subagent, aldrig av huvudsessionen. Läs `copy_modell` i
registret (`node factory/register.mjs <nyckel>`): `ab` = varannan brief får
`copy_model: fable`, varannan `copy_model: sonnet` — taggen står i
`VARIABELTAGGAR:` så feedback-loopen kan gruppera vinstbidrag per copy-modell.
**Testet avgörs automatiskt:** i steg 4, när BÅDA modellerna har ≥ 5
bedömbara annonser (≥ 300 kr och ≥ 3 köp vardera), jämförs vinstbidrag per
spenderad krona per modell. Vinner en modell med ≥ 20 % marginal skrivs den
in: `node factory/register.mjs copy-modell <nyckel> fable|sonnet "<siffrorna>"`,
testet är slut och alla briefer får vinnaren. Rapporten säger det under
"Done automatically" och i dna.md. Är skillnaden under 20 % fortsätter A/B:t
och rapporten visar ställningen (annonser, vinstbidrag/kr per modell) varje
briefdag, så Axel ser hur det går utan att fråga. Väntat avgörande: ~2 veckor.
Vägen: Agent-verktyget med `model: "fable"` resp. `"sonnet"`
när det finns; saknas Agent-verktyget i rutinen: `node tools/copy-agent.mjs
--modell fable|sonnet --uppdrag <fil> --ut <fil>` (samma prompt, samma
regler). Subagenten får DNA-utdrag + hypotes + hook + format + copy-reglerna
och lämnar hook, manus `Swedish (use this) | English meaning`, COPY CARD och
tre-frågorstestet per rad. Redovisa testet i leveransen. Rapportera vilken
väg som användes (Agent fanns / API).

### Steg 7 — Briefer och Notion
En mapp per annons: `products/<butik>/batch-NN/<video|image>-ads-briefs/<namn>/brief.md`
på engelska enligt `.claude/commands/forsta-batch.md` (VARIABELTAGGAR-rad
överst, hypotes, kept/changed, script-tabell, shot list, COPY CARD, hard
rules med rätt pris ur `factory/produkter/<id>.yaml`, KPI). Ingen zip, ingen
Drive-länk — briefen läsbar INNE i Notion-raden räcker (NOTION-FORMAT.md).
Ladda upp:
```
node tools/notion-brief.mjs --hub <database_id> --manifest products/<butik>/batch-NN/manifest.json --json
```
Status `Draft`, Typ `Video - Pending Approval` / `Image - Pending Approval`.
Skriptet hoppar över namn som redan finns i hubben. Visa resultatet (namn +
url per rad). Misslyckas uppladdningen: lista raderna som skulle skapats,
låtsas aldrig.
**Bildraderna genereras direkt** (`/ops-bild` steg 5–7): `node factory/ops-bild.mjs
<nyckel> --torr`, sedan skarpt, titta på varje bild med Read-verktyget mot
checklistan i `/ops-bild` steg 6, och `--godkann` de som håller — de går
live 13:40 via `/ops-leverans`. Underkända stannar i Draft med `--underkann
--skal` och står i rapporten. Saknas `KIE_API_KEY`: skriv det under
varningar, raderna ligger kvar i Draft och `/ops-bild <nyckel>` tar dem senare.

### Steg 8 — Logga, rapportera, pusha
- `node factory/register.mjs log <nyckel> <antal> $IDAG`,
  `node factory/register.mjs brief-kord <nyckel> $IDAG`,
  `node factory/register.mjs kord <nyckel> $IDAG`.
- `batch-log.md`: batch #N med datum, hypotes och variabeltaggar per annons.
- Discord (läge `brief`): siffror, gjort av mig, nya briefer med länkar,
  varningar, `🔴 ACTION NEEDED` bara om något kräver en människa (pingar
  redigeraren + Axel när briefer väntar på henne; Axel ensam bara när han
  själv måste klicka).
- Commit + push till `main`: `products/<butik>/`, `factory/budgetlogg.jsonl`,
  `factory/produkter/register.json`. En rutin som inte pushar har inte lärt
  sig något.

---

## DEFINITION OF DONE (✅/❌ sist i varje körning)

- [ ] Färsk `main`, IDAG räknad i svensk tid, rätt konto verifierat på `ad_account_id`
- [ ] Budgetronden körd: tabell visad FÖRE skrivning, varje ändring tillbakaläst gammalt → nytt, loggrad skriven
- [ ] Inget PAUSED aktiverat; Bäverbutiken bara läst
- [ ] Briefdag avläst ur registret (JA/NEJ med skäl)
- [ ] *(briefdag)* ANALYSMETOD:s snabbchecklista avbockad; vinstbidragstabellen visad; "för tidigt" utanför rankingen; ärvd historik märkt ÄRVD
- [ ] *(briefdag)* Feedback-loop: varje annons i förra batchen har sitt utfall i batch-log.md; ≥ 3 mönster med bevisad/hypotes; dna.md uppdaterad — eller "kallstart" utskrivet
- [ ] *(briefdag)* Batch enligt registrets `Briefrond:`-rad (21 med redigerare / 7 utan / Axels `briefantal`-överstyrning), varianter med förälder, koncept med källa eller märkta gissning, backlog tömd
- [ ] *(briefdag)* Copy av subagent, varannan fable/sonnet, taggen i VARIABELTAGGAR, tre-frågorstestet redovisat, vägen (Agent/API) rapporterad
- [ ] *(briefdag)* Rader skapade i hubben via `tools/notion-brief.mjs` — resultat med url visat
- [ ] Discord-rapport postad på engelska i butikens server; ping bara under ACTION NEEDED
- [ ] `kord` (+ `brief-kord`, `log`) stämplade; commit + push till `main`
- [ ] Slutrapport i två listor; Axels uppgifter sist, numrerade
