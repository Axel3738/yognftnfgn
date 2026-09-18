# /briefgranskning – Creative director-granskningen av Nattvaktens senaste briefrond (måndag + torsdag 07:00 + plats)

Argument: `$ARGUMENTS` — produktens nyckel i OPS-registret (`carashell/takskyddet`,
`drytrek`, `tacklebay/fiskespohallare-4-pack` …). `--rond YYYY-MM-DD` = en annan
rond än den senaste. `--igen` = skriv om en rond som redan har en sektion i
`feedback.md`. `--torr` i skrivsteget = visa allt, skriv inget till Notion.

```
/briefgranskning carashell/takskyddet
/briefgranskning drytrek --rond 2026-09-13
```

CONNECTORS: inga. Allt går via `NOTION_TOKEN` och `DISCORD_BOT_TOKEN` och REST.
Använd ALDRIG `mcp__Notion__*`. Ingen Meta-skrivning, ingen HeyGen, ingen kie.ai.

**Vad rutinen gör, i en mening (Axels beslut 2026-09-18):** dagen efter varje
briefrond (Nattvakten `/notionscalercs` lägger briefer natten till onsdag och
söndag ⇒ den här går torsdag och måndag) läser den ALLA briefer Nattvakten
skapade i produktens hub i den ronden, dömer dem som en creative director
skulle — mot `docs/copy-regler.md` (tre-frågorstestet, butikens namn aldrig i
annonsen), `docs/os/ANALYSMETOD.md` (hypotesen bygger på vinstbidrag och riktig
data, aldrig ROAS ensamt), `docs/naming-convention.md`, priset ur butiken och
`products/<nyckel>/dna.md` (upprepar den ett dött koncept? saknar den
variabeltaggar? testar den mer än en variabel?) — och skriver domen på tre
ställen: **`products/<nyckel>/feedback.md`** (Nattvakten läser den i steg 0
innan nästa rond), **en engelsk kommentar på varje Notion-rad som har ett
fel** (bara då), och **Discord** i butikens server. Byggs av
`/notionscalercs setup <nyckel>` — kör inte `/rutin` för hand.

Verktyget är `tools/briefgranskning.mjs`. Det mäter det mätbara; **du dömer
resten.** En brief som klarar alla mätningar kan fortfarande vara dålig
copy — och det är precis det du är här för.

## Järnregler

1. **Läs bara.** Ändra aldrig status på en rad, skapa aldrig en brief, rör
   aldrig kontot. Det enda som skrivs i Notion är kommentarer, och bara på
   rader med ett FEL (något redigeraren måste känna till innan hon
   producerar, eller till nästa version om annonsen redan är live).
   Anmärkningar och beröm går till `feedback.md` och Discord — aldrig som
   kommentar. En rad utan fel får ingen kommentar alls.
2. **Hitta aldrig på siffror.** Priset kommer ur butiken (verktyget läser det
   live), break-even ur produktfilen, prestandan ur `dna.md`/`batch-log.md`.
   Saknas ett tal: skriv "okänt" och döm det som går att döma.
3. **Engelska till redigerarna:** kommentarer, Discord och raderna i
   `dom.json`. Svenska annonsrader du citerar sätts i backticks (`` `…` ``) så
   Discords engelskspärr släpper raden. Rapporten till Axel i chatten är svensk.
4. **En annons som redan är live stängs aldrig av** (Axels beslut 2026-09-15).
   Ett fel på en levererad brief är en anmärkning till nästa version.
5. **Tre regler, inte tio.** Sektionen i `feedback.md` slutar med exakt tre
   konkreta regler för nästa rond — sådana som går att följa när man skriver
   en brief, inte "var bättre". Verktyget vägrar annat.
6. **Discord på engelska** i butikens server, kanal `#ads-to-do`. Redigeraren
   pingas bara om hon är tilldelad OCH någon brief har fel; Axel pingas då
   också. Ingen redigerare ⇒ varning, ingen ping.
7. Kör klart utan att fråga. Rapportera "Gjort av mig" / "Väntar på en
   människa". Axels uppgifter sist, numrerade.

## Gör i ordning

Färsk `main` först: `git fetch origin main && git checkout main && git reset --hard origin/main`.
`IDAG` = `node -e "import('./factory/register.mjs').then(m=>console.log(m.svenskDatum()))"`.

### 0. Läget
`node factory/register.mjs <nyckel> --idag $IDAG`. Svarar registret "Okänd
butik" eller står posten i läge `avslutad`: gör ingenting, skriv en rad i
chatten och avsluta. Läs `products/<nyckel>/dna.md` (senaste körningen: vad
är bevisat, vilka mönster, vilka instruktioner till nästa brief) och den
senaste sektionen i `products/<nyckel>/feedback.md` om den finns — du ska
kunna säga om förra rondens tre regler hölls.

### 1. Ronden
```
node tools/briefgranskning.mjs <nyckel>
```
Verktyget läser hubben ur registret, väljer ronden (registrets
`senaste_brief`, annars hubbens nyaste dag — utskriften säger vilket), hoppar
speglade rader (nummer ≥ 100, `/ops-spegla`), hittar batchnumret ur
`products/<nyckel>/batch-NN/manifest.json`, läser butikens pris live och
`dna.md`:s utdömda koncept, hämtar varje briefs text ur Notion och kör
mätningarna. Utdata: `factory/output/<butik>[/<produkt>]/briefgranskning-<rond>.json`
(kön) och `…/briefgranskning-<rond>/<namn>.md` (varje brief som text).

Läs utskriften. **"redan granskad"** ⇒ ronden har en sektion i `feedback.md`;
kör bara om med `--igen` om något faktiskt ska ändras — annars rapportera
"Round <datum> already reviewed" och avsluta med DoD. **Noll egna briefer**
(t.ex. pausad briefrond, bara speglade rader) ⇒ "Nothing to review", DoD, klart.
Varje ❌/⚠️ i utskriften är ett golv: det står i `dom.json` oavsett vad du
själv tycker (en ❌ får inte försvinna, men du får lägga till).

### 2. Domen — läs varje brief själv
Öppna `…/briefgranskning-<rond>/<namn>.md` för VARJE brief och döm som en
creative director, mot facit:

- **`docs/copy-regler.md`:** kör tre-frågorstestet själv på hooken, rubriken
  och den bärande raden — visualisera / falsifiera / ingen annan kan säga
  det. Briefens eget ✅ är inte facit; ditt är. Adjektiv utan något att peka
  på, "bättre", "smart", "enkel" = ❌. Butikens namn eller domän i copy, bild,
  voiceover eller captions = FEL.
- **`docs/os/ANALYSMETOD.md`:** bygger hypotesen på vinstbidrag/CPA mot
  break-even och riktig data (dna.md, batch-log) — eller på ROAS ensamt, en
  annons under grinden (< 300 kr / < 3 köp) som "vinnare", eller inget alls?
  Döms KPI:n mot break-even (rätt) eller target (fel)?
- **`docs/naming-convention.md` + OPS-konventionen:** `<prefix>_<KONCEPT>_<nr>[_<variant>]`,
  butikens prefix, nummer under 100, video = H-variant. Går datan att skära
  per variabel med de taggar som står?
- **`products/<nyckel>/dna.md`:** upprepar briefen ett koncept dna.md tagit
  bort eller dömt ut? Ignorerar den en instruktion ("SP får flest briefer",
  "bild är majoriteten", "aldrig påstå …")? Testar en variant EXAKT en
  variabel mot en namngiven förälder — eller flera på en gång? Är ett nytt
  koncept spårbart till playbook, winning line, swipe eller egen data — eller
  märkt gissning?
- **Formatet:** bild ⇒ IMAGE PROMPT + "Exact text"; video ⇒ manustabell,
  captions max 2 rader, hooken i första sekunden. COPY CARD komplett. Hard
  rules med rätt pris och "never name the store".

Skriv `dom.json` (t.ex. `factory/output/<butik>/briefgranskning-<rond>.dom.json`):
```json
{
  "nyckel": "<nyckel>", "rond": "<YYYY-MM-DD ur utskriften>",
  "bra": ["what the round got right — English, one line each"],
  "missat": ["what the round missed — English, name the brief"],
  "regler": ["rule 1 for the next round", "rule 2", "rule 3"],
  "rader": [
    { "namn": "<annonsnamn>", "fel": ["…"], "anmarkningar": ["…"], "bra": ["…"] }
  ]
}
```
`fel` = det redigeraren måste veta (blir kommentar på raden). `anmarkningar` =
förbättringar till nästa rond (blir feedback.md + Discord). Varje rad i kön
ska ha en post; verktyget vägrar annars. Verktygets egna ❌ kopieras in som
`fel`, ⚠️ som `anmarkningar` — lägg dina ovanpå. Skriv reglerna så att
Nattvakten kan följa dem bokstavligt ("cite the parent's CPA and purchases,
never ROAS", "no kronor amount but 1 129 / 1 469 / 340") — och skriv INTE om
förra rondens regel som hölls; skriv om den som bröts.

### 3. Skriv
```
node tools/briefgranskning.mjs <nyckel> --skriv <dom.json> --torr
node tools/briefgranskning.mjs <nyckel> --skriv <dom.json>
```
Torrt först: läs sektionen och kommentarerna. Sedan skarpt: verktyget skriver
sektionen `## Rond <datum>` i `products/<nyckel>/feedback.md` (byter ut en
befintlig med samma datum, lägger aldrig till en dubblett), en kommentar per
rad med fel (hoppar rader som redan har markören `Brief review <datum>`),
och Discord-jobbet `…/briefgranskning-<rond>.discord.json`. Statusar rörs inte.

### 4. Rapport, commit, push
```
node tools/discord-rapport.mjs --jobb factory/output/<butik>[/<produkt>]/briefgranskning-<rond>.discord.json
```
Committa `feedback.md`, `briefgranskning-<rond>.json`, `.dom.json` och
`.discord.json` (aldrig brief-dumparna — mappen är gitignorerad). Pusha till
`main`. En granskning som inte pushas läser Nattvakten aldrig.

## DEFINITION OF DONE

- [ ] Färsk `main`; registret läst; dna.md och förra sektionen i feedback.md lästa
- [ ] Ronden vald ur registret/hubben och visad (datum, batch, antal briefer, speglade hoppade)
- [ ] Varje brief läst av dig — inte bara verktygets utskrift — och dömd mot copy-reglerna, ANALYSMETOD, namnkonventionen, priset (läst live) och dna.md
- [ ] Verktygets ❌/⚠️ med i dom.json; egna fynd ovanpå; exakt tre regler för nästa rond
- [ ] `feedback.md` har rondens sektion (bra / missat / tre regler / tabell), ingen dubblettsektion
- [ ] Kommentar BARA på rader med fel, på engelska; ingen status ändrad; inget i Meta rört
- [ ] Discord-rapport på engelska i `#ads-to-do`; ping bara vid fel och bara den tilldelade redigeraren (+ Axel)
- [ ] Commit + push till `main`
- [ ] Slutrapport i två listor; Axels uppgifter sist, numrerade
