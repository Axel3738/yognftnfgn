# /ops-bild – Bildannonser för EN OPS-butik: idé → Notion-rader → genererade bilder → To be Reviewed

Argument: `$ARGUMENTS` — butikens nyckel i OPS-registret, sedan idén i klartext.
`--torr` = visa allt, generera inget.

```
/ops-bild drytrek en bildannons per färgvariant, vit bakgrund, bara produkten
/ops-bild hemvakten kameran på en fönsterbräda i mörker, nattläge på
/ops-bild drytrek                      ← ingen idé: generera bara de bildrader som redan ligger i Draft
/ops-bild tacklebay/fiskespohallare-4-pack --torr
```

CONNECTORS: inga. Allt går via `NOTION_TOKEN`, `KIE_API_KEY`, `DISCORD_BOT_TOKEN`
och REST. Använd ALDRIG `mcp__Notion__*`.

**Vad kommandot gör, i en mening:** gör Axels bildidé till färdiga rader i
butikens creative hub (Draft, Typ `Image - Pending Approval`, brief + IMAGE
PROMPT i raden), genererar bilderna med kie.ai (`factory/ops-bild.mjs`), lägger
varje bild i radens `Filer och media`, TITTAR på den, och flyttar godkända
rader till **To be Reviewed** — där tar `/ops-leverans` (13:40) dem **live** i
butikens SE-kampanj och `/ops-oversatt` (15:40) dem till Norge. Ingen
redigerare, inga klick i Notion. Bäverbutikens `/bildannonser` rör aldrig
OPS-hubbarna — det här är OPS-vägen (byggd 2026-09-12 på Axels
DryTrek-idé "en bildannons för varje färgvariant").

Kör i vilken session som helst som har repot (butikens nattvakt-session går
bra, en ny chatt går bra). Discord är ingen ingång — Axel skriver kommandot
i chatten.

## Järnregler

1. **Rätt konto och rätt hub.** Butiken slås upp i `factory/produkter/register.json`;
   `factory/ops-bild.mjs` vägrar allt som inte är OPS-kontot `915422744950975`.
2. **Bara bild.** Typ `Image - Pending Approval`, alltid. Videorader rörs aldrig.
3. **Statusen flyttas aldrig före bilden sitter i Notion OCH är granskad.**
   Motorn lämnar raden i Draft; `--godkann` körs först efter att du tittat.
   En dålig bild i `To be Reviewed` går live 13:40 — det är dyrare än en tom rad.
4. **Priset ur butiken, aldrig ur minnet** — `factory/produkter/<id>.yaml`
   `pris`, kontrollerat mot produktsidan. Inget pris PÅ bilden om idén inte
   uttryckligen säger det (bildmodeller stavar fel).
5. **Ingen text på bilden om idén inte säger det.** Behövs text: max en rad,
   svenska, exakt ur briefen, och den granskas bokstav för bokstav (å/ä/ö).
6. **Inga genererade människor/ansikten** (hook-visual-regeln 2026-08-04).
7. **Copy skrivs av en subagent** (regel 6 i CLAUDE.md): Agent-verktyget med
   `model` enligt butikens `copy_modell` i registret (`ab` = växla
   fable/sonnet per batch, tagga `copy_model=`), `docs/copy-regler.md` +
   tre-frågorstestet redovisat. Strategi, namn och prompt gör huvudsessionen.
8. **Discord på engelska**, butikens server, kanal `#ads-to-do` (läge `bild`).
   Axel pingas bara under `🔴 ACTION NEEDED`.
9. Kör klart utan att fråga. Axels uppgifter sist, numrerade.

## Gör i ordning

Färsk `main` först om sessionen är en rutin: `git fetch origin main && git checkout main && git reset --hard origin/main`.
`IDAG` = `node -e "import('./factory/register.mjs').then(m=>console.log(m.svenskDatum()))"`.

### 1. Läs minnet
`node factory/register.mjs <nyckel>` (hub, pris, copy-modell, redigerare),
`products/<butik>/dna.md`, `backlog.md`, `batch-log.md`,
`factory/produkter/<id>.yaml` (`varianter`, `media.bilder`, `benefits`).
Logga idén i `backlog.md` (datum, typ `koncept`, källa = Axel) — även när
den byggs direkt.

### 2. Namn och batch
```
node factory/ops-bild.mjs <nyckel> --namn
```
Nästa lediga nummer per koncept läses ur listan (hubben + kontot).
Namn enligt `docs/naming-convention.md` med butikens prefix:
`<Prefix>_<KONCEPT>_<nr>_<variant>` — bildvarianter är `_1`, `_2`, …
(`DryTrek_Damasker_PD_14_1 … _18` = ett koncept, 18 färgvarianter, ett adset).
Ny batchmapp: `products/<butik>/batch-NN/image-ads-briefs/<namn>/brief.md`
+ `products/<butik>/batch-NN/manifest.json` (`[{namn, typ:"bild", brief}]`).

### 3. Briefer (engelska) — en per rad, med IMAGE PROMPT-blocket sist
Varianter av samma koncept får en kort brief (VARIABELTAGGAR, varför, format,
COPY CARD, hard rules, KPI); ett nytt koncept får full brief enligt
`.claude/commands/forsta-batch.md`. Alltid **sist i filen**, på engelska:

```
## IMAGE PROMPT
<prompten till bildmodellen: motiv, färg, bakgrund, ljus, kamera, "no text, no people, no logo changes">

REFERENCE IMAGES:
- https://…   (produktfoto ur factory/produkter/<id>.yaml media.bilder — helst den variant som ligger närmast; 0–10 st)

ASPECT: 4:5

END IMAGE PROMPT
```
Tomma rader mellan delarna — Notion slår ihop rader utan tom rad emellan till
ett stycke (mätt 2026-09-12; parsern klarar det ändå, men filen blir läsbar).
**Repots brief vinner:** motorn läser prompten ur
`products/<butik>/batch-*/image-ads-briefs/<namn>/brief.md` när den finns,
annars ur Notion-kroppen. Skärp prompten i filen, committa, kör
`--igen --bara <namn>` — sidkroppen i Notion behöver inte skrivas om.
Med referens körs `google/nano-banana-edit` (produkten ser ut som produkten),
utan referens `google/nano-banana`. Saknas REFERENCE IMAGES tar motorn
produktfilens första bild och säger det i planen.

### 4. Notion-rader
```
node tools/notion-brief.mjs --hub <database_id> --manifest products/<butik>/batch-NN/manifest.json --json
```
Skriptet hoppar över namn som redan finns. Visa namn + url per rad.

### 5. Generera
```
node factory/ops-bild.mjs <nyckel> --torr            # planen: vilka rader, referenser, promptlängd
node factory/ops-bild.mjs <nyckel> [--bara a,b]      # skarpt: kie.ai → bilden i "Filer och media", Draft kvar
```
Kön är ALLA Draft-bildrader i hubben som har ett IMAGE PROMPT-block — gamla
rader utan block hoppas över och listas med skäl (rör dem inte utan att Axel
ber om det). Plan + utfall: `factory/output/<butik>/bild-$IDAG.json`
(committas); bilderna i `factory/output/<butik>/bild-$IDAG/` (gitignorerat —
bilagan i Notion är enda kopian).

### 6. Titta — varje bild, med Read-verktyget
- [ ] Produkten ser ut som produkten på produktsidan (form, fästen, färg = radens variant)
- [ ] Bakgrund/motiv som idén säger; inga människor, inga ansikten, inga påhittade loggor
- [ ] Ingen text om briefen inte kräver det; kräver den: exakt rad, å/ä/ö, inget dubblerat
- [ ] Inget pris, ingen rabatt, ingen falsk lagerbrist
Underkänd: skärp prompten i repots brief.md och generera om **en** gång
(`--igen --bara <namn>` — den gamla filen byts ut i raden). Underkänd igen:
`--underkann <namn> --skal "…"`, raden stannar i Draft med kommentaren och
står under ACTION NEEDED.

### 7. Godkänn
```
node factory/ops-bild.mjs <nyckel> --godkann <namn,namn,…>
node factory/ops-bild.mjs <nyckel> --underkann <namn> --skal "<why, in English>"
```
Godkända rader står i `To be Reviewed` med kommentar → live 13:40 nästa
`/ops-leverans`, Norge 15:40. Vill Axel ha dem live nu: kör
`/ops-leverans <nyckel>` direkt efteråt.

### 8. Logga, rapportera, pusha
- `batch-log.md`: batch #NN, datum, konceptet, antal bilder, vilka som
  godkändes/underkändes. `backlog.md`-posten märks `[byggd i batch #NN]`.
- Discord-jobb (läge `bild`): `gjort` = en rad per godkänd bild, `briefer` =
  raderna med url, `varningar` = underkända, `action_axel` bara om något
  kräver honom. `node tools/discord-rapport.mjs --jobb factory/output/<butik>/discord-bild-$IDAG.json`.
- Commit + push: `products/<butik>/batch-NN/`, `products/<butik>/*.md`,
  `factory/output/<butik>/bild-$IDAG.json`. Aldrig media.

## Utan idé (`/ops-bild <nyckel>`)
Hoppa till steg 5–8. Det är så nattvakten (`/notionscalercs`) får sina
bildbriefer genererade samma natt som de skapas: varje briefrond innehåller
minst två bildannonser med IMAGE PROMPT-block (Axels beslut 2026-09-12 —
bild är billigt och snabbt), och steg 7 där kör `node factory/ops-bild.mjs`.

## DEFINITION OF DONE

- [ ] Butik ur registret, konto `915422744950975` verifierat, hub ur registret
- [ ] Idén loggad i `backlog.md`; namn lästa ur `--namn`, inga krockar
- [ ] En brief per rad med IMAGE PROMPT-block sist; copy via subagent med tre-frågorstestet redovisat; pris ur produktfilen
- [ ] Rader skapade i hubben (Draft, `Image - Pending Approval`) — resultat med url visat
- [ ] `--torr` läst före skarp körning; varje bild uppladdad i `Filer och media`
- [ ] Varje bild TITTAD på mot checklistan i steg 6; underkända redovisade med skäl
- [ ] Bara godkända rader flyttade till `To be Reviewed` via `--godkann`
- [ ] Discord-rapport på engelska i `#ads-to-do`; ping bara under ACTION NEEDED
- [ ] batch-log + backlog uppdaterade, `bild-$IDAG.json` committad, pushat
- [ ] Slutrapport: gjort av mig / väntar på en människa; Axels uppgifter sist, numrerade
