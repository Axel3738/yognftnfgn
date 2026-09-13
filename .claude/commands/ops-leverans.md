# /ops-leverans – Leveransrundan för EN OPS-butik (13:40 varje dag)

Argument: `$ARGUMENTS` — butikens nyckel i OPS-registret (`hemvakten`,
`tankguard`, `drytrek`, `kalender/adventskalender-racingbilar`,
`tacklebay/fiskespohallare-4-pack`). `--torr` = visa allt, ladda inte upp.

```
/ops-leverans hemvakten
/ops-leverans tacklebay/fiskespohallare-4-pack --torr
```

CONNECTORS: inga. Allt går via `NOTION_TOKEN`, `META_ACCESS_TOKEN`,
`DISCORD_BOT_TOKEN` och REST. Använd ALDRIG `mcp__Notion__*`.

**Vad rutinen gör, i en mening:** tar redigerarens färdiga annonser
(status **To be Reviewed** i butikens creative hub — eller **Creative strat
review** med butikens prefix och fil), kollar priset, laddar
upp dem **LIVE** i butikens **SE-kampanj** i OPS-kontot MagiBorsten DK
`915422744950975` (ett adset per koncept, aldrig per batch), och flyttar
raden till **SE-ACTIVE to be translated** så `/ops-oversatt` tar den till
Norge. Detta är Bäverbutikens `/notionkorning`, pekad mot OPS (Axels
beslut 2026-09-11: en per butik, live direkt). Byggs av
`/notionscalercs setup <butik>` — kör inte `/rutin` för hand.

## Järnregler

1. **Rätt konto.** Bara `915422744950975`. `tools/ops-till-meta.mjs` kastar
   på allt annat. Bäverbutikens hubbar rörs aldrig här.
2. **En stoppregel: priset.** Avviker priset i annonsen mer än 20 % från
   butikens pris (läst live ur produktsidan) → kommentar i Notion, status
   `Draft`, ingen uppladdning. Inget pris i annonsen = grön. För video är
   priset det enda stoppet; stavfel laddas upp med anmärkning. För bild är
   varje fel ett stopp.
3. **Ett adset per koncept**, döpt `<kampanjbas> - <KONCEPT>`. Aldrig ett
   adset per batch, aldrig egen budget (CBO). Uppladdaren sköter det.
4. **PAUSED med spend är ett beslut.** En avvecklad kampanj får inget nytt.
   Aktivera aldrig något utom det körningen själv skapade.
5. **Discord på engelska** i butikens server, kanal `#annons-uppladdning`.
   Axel pingas bara under `🔴 ACTION NEEDED`.
6. Kör klart utan att fråga. Rapportera "Gjort av mig" / "Väntar på en
   människa". Axels uppgifter sist, numrerade.

## Gör i ordning

Färsk `main` först: `git fetch origin main && git checkout main && git reset --hard origin/main`.
`IDAG` = `node -e "import('./factory/register.mjs').then(m=>console.log(m.svenskDatum()))"`.

### 1. Kön
```
node tools/ops-leveranskon.mjs <nyckel> --marknad SE --json --ut factory/output/<butik>/leverans-$IDAG > factory/output/<butik>/leverans-$IDAG.json
```
Kön är hubbens `To be Reviewed` **plus** redigerarens rader i
`Creative strat review` som bär butikens eget prefix och har en fil (Axels
beslut 2026-09-13: den här rundan ÄR granskningen — ingen människa flyttar
status eller tittar först). Rader med annat prefix i den statusen är
parkerade källrader (TackleBay 2026-09-12: Jasper flyttade tio
`Rodholder_*` dit, Axels nej till brand-swap står) och ligger under
`cs_lamnade` i JSON:en — rör dem inte, nämn dem inte som fel.
Läs JSON:en: hubb, SE-kampanjen (exakt en ACTIVE — annars stopp med skälet
i rapporten), `lank_arvd`, `pris_butik`, och raderna. Tom kö = rapportera
"Nothing to deliver" och avsluta med DoD. Rader med `finns_i_meta: true`
är redan uppe: flytta dem till `SE-ACTIVE to be translated` med kommentar,
ladda inte upp igen. Rader med `leverans: saknas` (ingen fil): kommentar
"väntar på fil", status orörd, rapportera — aldrig tyst.

### 2. Kontrollen per rad
- Briefen: `node tools/notion-klara.mjs --brief <page-id>` — läs COPY CARD,
  pris, hook, hard rules.
- Video: `python3 tools/qa-frames.py <fil> --ut <mapp>` och titta på
  bilderna (hooken tätt). Bild: titta på filen.
- Priset: annonsens pris (inbränt eller i copyn) mot `pris_butik.pris` ur
  JSON:en. `pris_butik: null` (sidan gick inte att läsa) ⇒ ladda INTE upp
  rader med pris i annonsen; lägg dem under ACTION NEEDED med skälet.
- **Flyttade rader** (`prefix_avviker: true`, t.ex. `Overvakningskamera_BOF_9_1`
  i HeimGuards hub — hubbarna kom från Bäverbutiken 2026-09-10): kön har
  redan märkt om målnamnet till butikens prefix (`HeimGuard_BOF_9_1`), och
  det är det namnet som laddas upp. Titta extra: syns "Bäverbutiken",
  Bäverbutikens pris eller logga i creativen laddas den INTE upp — kommentar
  i Notion, status `Draft`, och raden under ACTION NEEDED så Axel avgör om
  redigeraren ska göra en butiksversion. Länken är alltid `lank` (ärvd ur
  kampanjen), aldrig radens `Landing page` som kan peka på bäverbutiken.se.
- Fel ⇒ `node tools/notion-aterkoppling.mjs <page-id> --kommentar "<vad, på engelska>" --status Draft`.

### 3. Copy
Primary text, headline och description ur briefens COPY CARD. Saknas
COPY CARD: skriv copyn med en subagent (Agent-verktyget `model: "sonnet"`,
eller `tools/copy-agent.mjs --modell sonnet`) med `docs/copy-regler.md`,
butikens pris ur `pris_butik` och DNA:t i `products/<butik>/dna.md`.
Aldrig ett pris som inte är butikens.

### 4. Uppladdning — live
Först `--torr` per rad, läs utskriften (kampanj, adset, sida, länk, DSA),
sedan skarpt:
```
node tools/ops-till-meta.mjs <nyckel> --marknad SE --namn <namn> --fil <fil> --primar "<text>" --rubrik "<headline>" [--beskrivning "<text>"] --json
```
Länken ärvs ur kampanjens befintliga annonser; ange `--lank` bara om
uppladdaren säger att ingen hittades. Läs tillbaka: annonsen ska stå
`ACTIVE/ACTIVE`. Fel från Meta står i rapporten med raden.

### 5. Notion
Per uppladdad rad:
```
node tools/notion-aterkoppling.mjs <page-id> --kommentar "Live in <kampanj> (adset <KONCEPT>), ad <id>" --status "SE-ACTIVE to be translated"
```

### 6. Rapport, logg, push
- Discord-jobb (läge `leverans`): `gjort` = en rad per uppladdad annons
  (namn, kampanj, adset), `varningar` = anmärkningar, `action_axel` = rader
  som stoppades på pris eller saknad fil. `node tools/discord-rapport.mjs --jobb <fil>`.
- `node factory/register.mjs log <nyckel> <antal> $IDAG` för uppladdade.
- Rad i `products/<butik>/batch-log.md`: datum, vilka annonser som gick
  live. Committa `factory/output/<butik>/leverans-$IDAG.json` (aldrig
  media), `register.json`, batch-log. Pusha till `main`.

## DEFINITION OF DONE

- [ ] Färsk `main`; konto verifierat på `ad_account_id`; hubben ur registret
- [ ] Kön läst ur butikens hub (`To be Reviewed` + `Creative strat review` med butikens prefix och fil), varje rad redovisad (uppladdad / stoppad / väntar på fil / redan uppe); `cs_lamnade` orörda
- [ ] Priset kollat mot butikens sida för varje rad med pris; avvikelse > 20 % ⇒ Draft + kommentar
- [ ] Varje uppladdning torrkörd först, sedan skarp, tillbakaläst ACTIVE/ACTIVE
- [ ] Ett adset per koncept; inget PAUSED aktiverat; ingen avvecklad kampanj rörd
- [ ] Uppladdade rader flyttade till `SE-ACTIVE to be translated` med kommentar
- [ ] Discord-rapport på engelska i `#annons-uppladdning`; ping bara under ACTION NEEDED
- [ ] Logg, batch-log, commit + push till `main`
- [ ] Slutrapport i två listor; Axels uppgifter sist, numrerade
