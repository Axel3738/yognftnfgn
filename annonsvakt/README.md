# Annonsvakten — `/annonsvakt`

Varje timme: alla annonskonton token:en når → det som stoppar eller bränner
pengar just nu → Discord `#ad-alerts` i Bäverbutikens server, och det röda på
svenska i Slack `#urgent` (kanalen Axel läser). **Läs-bara.** Den pausar,
aktiverar och ändrar aldrig något. Axels beställning 2026-09-27:

> "en rutin som scannar alla annonskonton och liknande efter problem med
> nedstängda annonser och sådana grejer … meddela mig som urgent … rädda mig
> ifall något annonskonto eller liknande blir nedtaget, eller om annonsen blir
> nedtagen … om det är någon som går helt crazy, någon annons som drar åt
> helvete, som tar all spend"

```bash
node annonsvakt/kor.mjs                  # torrt: läs, döm, visa — skriv inget, posta inget
node annonsvakt/kor.mjs --discord        # rutinen: posta + skriv minnet
node annonsvakt/kor.mjs --kolla          # nycklar, rättigheter, vilka konton som svarar
node annonsvakt/kor.mjs --json <fil>     # hela resultatet som JSON
node annonsvakt/kor.mjs --postat <id …>  # kvittera Slack-meddelanden sessionen postat via connectorn
npm test                                 # 25 tester utan nät (annonsvakt/test/)
```

## Vad den larmar om

| Fynd | Nivå | Nyckel (minnet) | Regel |
|---|---|---|---|
| Token:en fungerar inte (kod 190/102) | 🔴 | `token:ogiltig` | Enda som sägs den timmen — allt annat är okänt |
| Konto inte ACTIVE (DISABLED, UNSETTLED, IN_GRACE_PERIOD …) | 🔴 | `konto:<id>:status:<kod>` | `account_status ≠ 1`, `disable_reason` i texten |
| Konto i facit som token:en inte längre når | 🔴 | `konto:<id>:oatkomlig` | Saknas i `me/adaccounts` OCH svarar fel på `act_<id>` |
| Kontots annonser gick inte att läsa (rate limit, rättighet) | 🟡 | `konto:<id>:lasfel` | Kontot svarar men `ads`/`insights` inte |
| Annons DISAPPROVED i aktiv kampanj | 🔴 | `annons:<id>:DISAPPROVED` | Metas skäl ur `ad_review_feedback` |
| Annons PENDING_BILLING_INFO | 🔴 | `annons:<id>:PENDING_BILLING_INFO` | Betalmetod saknas |
| Annons/adset/kampanj WITH_ISSUES | 🔴 | `…:WITH_ISSUES:<kod>` / `…:issues:<kod>` | `issues_info` utom ignorerade koder |
| Annons i PENDING_REVIEW > 24 h | 🟡 | `granskning:<id>` | `updated_time` äldre än `granskning_timmar` |
| Annons drar iväg: ≥ 1 500 kr i dag, 0 köp | 🔴 | `spend:<id>:<datum>:<nivå>` | Nivå = ⌊log₂(spend / 1 500)⌋ ⇒ nytt larm vid 3 000, 6 000, 12 000 … |
| Annons drar iväg: ≥ 3 000 kr i dag, ROAS < halva break-even | 🔴 | samma | Break-even ur kampanjnamnet → products.json → matstrumpor/konfig.json → 1,6 |
| Kampanj/adset ≥ 2 × dagsbudget i dag | 🟡 | `overspend:kampanj\|adset:<id>:<datum>` | En gång per dag |

**"Ska köra" är villkoret för objekten:** annonsens egen `status` ACTIVE och
kampanj + adset med `effective_status` ACTIVE/WITH_ISSUES. En avvisad annons i
en pausad kampanj tiger vakten om (mätt 2026-09-27: tre sådana i Magiborsten
UK från augusti). Metas `effective_status` DISAPPROVED slår igenom även när
kampanjen är pausad — därför kollas kampanjen och adsetet uttryckligen.

**Ignorerade felkoder** (`konfig.ignorera_felkoder`): `4469003` "Ad not
delivering" är Metas leveransdiagnos på annonser utan visningar, inte ett fel.
Mätt 2026-09-27: 21 i MagiBorsten, 107 i SnarkLös, 8 i NO — alla gamla. En
annons utan spend är nattvaktens sak (CLAUDE.md regel 11).

## Hur larmet sägs

- **Tillstånd** (konto, annons, adset, kampanj, granskning) larmas EN gång,
  påminns efter `paminn_timmar` (konto/token 24 h, objekt 7 dygn) så länge de
  står kvar, och får en ✅-rad när Meta inte längre flaggar dem.
- **Händelser** (spend, overspend) sägs en gång per nyckel; nyckeln bär
  datumet och nivån, så samma annons kan larmas igen när spenden fördubblats
  — aldrig bara för att en timme gått.
- **Hjärtslag**: första körningen varje dag från kl 07 svensk tid postar
  `💓 Daily check …: N ad accounts read, M open problems` även när inget är
  fel. Tystnad resten av dygnet betyder "inget nytt".
- **Axel pingas bara på 🔴** (`axel_discord` i konfig: hans två konton,
  id:n verifierade 2026-09-02). `allowed_mentions` låser pingen till just de
  id:na, så ett citerat namn kan aldrig pinga en server.
- **Engelska** (allt i Discord är på engelska, Axels order 2026-09-05).
  Namn på konton, kampanjer och annonser står i `kodspann` — svenskdetektorn i
  `tools/lib/engelska.mjs` räknar inte kodspann, och Metas feltexter hämtas
  med `locale=en_US`.
- **Varje fynd bär en länk** till Ads Manager med objektet markerat
  (`lank`, och `forhandsvisning` = Metas `preview_shareable_link` på en
  annons) — Axels fråga 2026-09-29: "Kan du skicka en länk till annonsen?".
  I Discord som maskerad länk i `<>` (ingen förhandsvisning), i Slack som
  "Öppna i Ads Manager" · "Se annonsen".

## Slack `#urgent`: bara det röda, på svenska

Axels ord 2026-09-27 ("Discorden vägrar jag kolla") och 2026-09-29 ("du kan
ju koppla Slack själv, eftersom att den redan är connectad här"). Kanalen är
`#urgent` `C0C4MTQNMT7` i workspace Stonebite — privat, Axel är enda
medlemmen, samma kanal som `akut/`. Larmen bär spend och ROAS, och
redigerarna får aldrig se spend, så posta aldrig i en annan kanal.

- **Vad:** `formuleraSlack` i `regler.mjs` — nya 🔴, 🔴 som påminns och ✅
  när ett 🔴 tillstånd är borta. 🟡 (granskning, över budget, läsfel) och
  💓 stannar i Discord. Svenska, inga tankstreck, länk på varje rad.
- **Hur:** tre vägar, i ordning. `SLACK_BOT_TOKEN` i miljön ⇒
  `chat.postMessage` till `kanal.slack.kanalId`. `SLACK_WEBHOOK_URL` i
  miljön ⇒ POST till webhooken (låst till kanalen när den skapades). Ingen
  nyckel ⇒ texten läggs i **`annonsvakt/output/att-posta.json`** (gitignorerad,
  rader äldre än ett dygn faller bort), sessionen postar den med
  `mcp__Slack__slack_send_message` och kvitterar med `--postat <id>` — samma
  mönster som `akut/`. Ett Slack-fel stoppar aldrig Discord: texten hamnar i kön.
- ⚠️ **Mätt 2026-09-29: rutinens fasta session har inga Slack-verktyg.**
  `create_trigger` svarar "the connectors parameter is not available for
  this organization", båda vakternas triggrar har `mcp_connections: []`, och
  `get_session` på akut-rutinens session listar Bash/Read/Write … utan ett
  enda `mcp__Slack__*`. I rutinen är det alltså **nyckeln i miljön** som
  gäller (`env_018aG5VVb69sSagge8CfgghK`, samma miljö som `/akut`) — kön är
  för sessioner som har connectorn (den här, när Axel kör `/annonsvakt` för
  hand). Webhooken bygger Axel eller Cowork: `annonsvakt/cowork/1-slack-webhook.txt`.
- **Överlappet med `akut/`:** när miljön bär en Slack-nyckel stänger `/akut`
  av sina `konto`- och `pengar`-larm (`kontroller_av_med_slacknyckel`), för
  då säger annonsvakten samma sak per annons med lägre trösklar och länk.
  Utan nyckel står allt på i båda — ingen av dem når Slack från rutinen då.

Ett konto som inte lästes den här timmen får sina öppna problem varken lösta
eller påminda — annars hade Metas rate limit gjort att en avvisad annons
"löstes" och larmades om nästa timme. Dör token:en löses ingenting alls.

## Minnet: `annonsvakt/minne.json` (committas)

```json
{ "konton": { "<id>": { "namn", "valuta", "forstSedd" } },
  "oppna": { "<nyckel>": { "typ", "niva", "rubrik", "rubrikSv", "konto", "forst", "larmat" } },
  "handelser": [ { "nyckel", "tid", "rubrik" } ],
  "hjartslag": "YYYY-MM-DD" }
```

`konton` är facit över vad token:en någon gång nått — försvinner ett ur
räckvidden larmas det. Tar Axel avsiktligt bort ett konto: stryk raden här.
Filen skrivs BARA när innehållet ändrats, och misslyckas Discord-posten skrivs
den inte alls (då kommer larmet igen nästa timme i stället för att försvinna).
Rutinen committar filen när den ändrats (kommandofilen steg 2) — de flesta
timmar ändras inget, så det blir ungefär en commit per dag (hjärtslaget).

## Trösklarna är beslut, inte mätvärden

Alla står i `konfig.json` med sin motivering och datum. `spend_min` 1 500 kr
är CLAUDE.md:s "ingen dom under 300 kr" i timformat med marginal för att
köpen släpar efter spenden på förmiddagen; `roas_andel_av_breakeven` 0,5 med
kravet på dubbel spend finns för att ROAS med ett–två köp är brus;
`overspend_faktor` 2 ligger över Metas egen tolerans (+75 % en enskild dag).
Larmar vakten för ofta eller för sällan: ändra talet där, skriv datum och
varför, och rör aldrig koden.

## Mätt vid bygget 2026-09-27 ~16:00 CEST

- Token:en når **7 konton**: MagiBorsten, SnarkLös, nya kungen, Magiborsten
  DK/UK/FI/NO — alla `account_status 1`, `disable_reason 0`. Sju av
  `commission/kanda-konton.json`:s 14 (NYC Grill, SNarklös FI, Finland DK,
  Norge, Sushi kanske?, Axel Odhner, Snark mexico) svarar `(#200) Ad account
  owner has NOT grant ads_management or ads_read permission` för DEN HÄR
  token:en — commission-rutinen kör med en annan miljö. Facit för vakten är
  `stonebite/varumarken.json` (samma sju) + minnet, inte commission-listan.
- Fyra anrop per konto, ~56 s för alla sju utan mellanrum.
- Torrkörningen gav fyra fynd: `Beltgrinder_REV_2_1` DISAPPROVED
  ("Unacceptable Business Practices") i en ACTIVE kampanj i MagiBorsten;
  `CaraShellRoof_US_CO_103_H1` 17 329 kr / 0 köp (78 % av Magiborsten UK:s
  dag) och `CaraShellRoof_US_CS_3_H1` 3 156 kr / 0 köp; kampanjen
  `1 CARASHELL_US_…` 18 512 kr mot 8 000 kr budget (2,3× — budgeten sänktes
  mitt på dagen, se CLAUDE.md → USA-kampanjen).
- `me/adaccounts` listar alla sju (till skillnad från 2026-09-25/26 då
  "nya kungen" saknades) — facitkontrollen finns kvar för nästa gång.

## Filerna

| Fil | Vad |
|---|---|
| `kor.mjs` | Körningen och CLI:t. `kor()` tar falsk klient/sändare i tester |
| `regler.mjs` | Alla regler, rena funktioner: konton, objekt, spend, minnet (`sammanfoga`), texterna (`formulera` engelska till Discord, `formuleraSlack` svenska till #urgent), länkarna |
| `meta.mjs` | Läsningen ur Meta, läs-bara. Klienten är `kommentarer/meta.mjs`:s (backoff, timeout) |
| `minne.mjs` | `minne.json`: läs, skriv bara vid ändring |
| `posta.mjs` | Discord (server → kanal, skapas vid behov → post med låsta pingar), Slack (bot-token, webhook) och kön till Slack-connectorn (`att-posta.json`, `--postat`) |
| `konfig.json` | Kanaler (Discord + Slack), Axels id:n, trösklar, ignorerade felkoder, hjärtslag |
| `cowork/` | `1-slack-webhook.txt`: bygger webhooken i Slack åt rutinen (Axel klistrar in nyckeln själv) |
| `test/` | 25 tester utan nät |
