# /briefgranskning – Creative director-granskningen av Bäverbutikens senaste briefrond, alla hubbar (måndag + torsdag 07:00)

Argument: `$ARGUMENTS` — normalt inget. `--rond YYYY-MM-DD` = granska den ronden
i stället för hubbens senaste. `--hub <id eller del av titel>` = bara den hubben.
`--igen` = granska en rond som redan har en Feedback-rad. `--maxdagar N` = åldersgräns
(standard 10). `--torr` i skrivsteget och rapportsteget = visa allt, skriv inget.

```
/briefgranskning
/briefgranskning --hub IBC --rond 2026-09-17
```

CONNECTORS: inga. Allt går via `NOTION_TOKEN` och `DISCORD_BOT_TOKEN` och REST.
Använd ALDRIG `mcp__Notion__*`. Ingen Meta-skrivning, ingen HeyGen, ingen kie.ai.

**Vad rutinen gör, i en mening (Axels beslut 2026-09-18, ombyggd samma kväll för
Bäverbutiken):** dagen efter briefronderna läser den ALLA Bäverbutikens hubbar,
hittar den senaste briefronden i varje hub (raderna med Typ "… Pending Approval"
som skapades samma dag), dömer ronden som en creative director — en hub i taget,
aldrig blandat mellan produkter — mot `docs/copy-regler.md` (tre-frågorstestet,
butikens namn aldrig i annonsen), `docs/os/ANALYSMETOD.md` (vinstbidrag och riktig
data, aldrig ROAS ensamt), `docs/naming-convention.md`, priset läst live ur radens
Landing page och `products/<id>/dna.md` när produkten har en mapp — och skriver
domen på tre ställen: **EN ny rad med Typ "Feedback" i hubben** (titel
`Brief review <ronddatum>`, engelska: bra / missat / tre regler för nästa rond),
**en engelsk kommentar på varje granskad rad som har ett FEL** (bara då), och
**`products/<id>/feedback.md`** när mappen finns (CaraShell via speglingen). Sedan
**EN engelsk Discord-rapport** för hela körningen i Bäverbutikens server,
`#problem-and-revisions-ads`. OPS-projektet är nedlagt utom CaraShell, och CaraShells
briefer skrivs i Bäverbutikens hubbar — därför finns ingen OPS-variant längre.

Verktyget är `tools/briefgranskning.mjs`. Det mäter det mätbara; **du dömer
resten.** En brief som klarar alla mätningar kan fortfarande vara dålig copy —
och det är precis det du är här för.

## Järnregler

1. **Läs bara.** Ändra aldrig status på en rad, skapa aldrig en brief, rör aldrig
   kontot. Det som skrivs i Notion är Feedback-raden och kommentarer på rader med
   ett FEL (något redigeraren måste känna till innan hon producerar, eller till
   nästa version om annonsen redan är live). Anmärkningar och beröm går till
   Feedback-raden, feedback.md och Discord — aldrig som kommentar.
2. **Hubbarna kommer ur Notion, aldrig ur minnet.** Verktyget tar alla databaser
   integrationen ser, drar bort OPS-hubbarna per id (`tools/lib/ops-hubbar.mjs`),
   andra verksamheters hubbar och mallen, och databaser utan brief-livscykel.
   Räkna hubbarna i rapporten — färre än förra körningen betyder att något inte
   hittades, inte att det inte finns.
3. **Hitta aldrig på siffror.** Priset kommer ur radens Landing page (läst live),
   break-even bara ur `products.json`, prestandan ur `dna.md`/`batch-log.md`.
   Saknas ett tal: skriv "unknown" och döm det som går att döma.
4. **Engelska till redigerarna:** Feedback-raden, kommentarerna, Discord och
   raderna i `dom.json`. Svenska annonsrader du citerar sätts i backticks (`` `…` ``)
   så Discords engelskspärr släpper raden. Rapporten till Axel i chatten är svensk.
5. **En annons som redan är live stängs aldrig av** (Axels beslut 2026-09-15).
   Ett fel på en levererad brief är en anmärkning till nästa version.
6. **Tre regler per hub, inte tio.** Feedback-raden slutar med exakt tre konkreta
   regler för nästa rond — sådana som går att följa när man skriver en brief, inte
   "var bättre". Verktyget vägrar annat. Blanda aldrig två produkters domar.
7. **Discord på engelska**, ett meddelande per körning, i `#problem-and-revisions-ads`.
   Axel pingas bara när något kräver honom (verktyget avgör: noll läsbara hubbar).
8. Kör klart utan att fråga. Rapportera "Gjort av mig" / "Väntar på en människa".
   Axels uppgifter sist, numrerade.

## Gör i ordning

Färsk `main` först: `git fetch origin main && git checkout main && git reset --hard origin/main`.

### 1. Kön — alla hubbar
```
node tools/briefgranskning.mjs
```
Verktyget hittar hubbarna, väljer ronden per hub (hubbens nyaste dag), hoppar
ronder som redan har en Feedback-rad med datumet och ronder äldre än 10 dagar
(ingen ny brief att ge feedback på), kopplar hubben till en produktmapp via
`products/products.json` (hub-id eller `creative_prefix`) eller
`factory/produkter/register.json` (`spegling.kalla_hub` — CaraShell), läser priset
live per rad, hämtar varje briefs text ur Notion och kör mätningarna. Utdata:
`tools/output/briefgranskning/<idag>/ko.json` (alla hubbar) och
`…/<idag>/<hub>/<namn>.md` (varje brief som text, gitignorerat).

Läs utskriften. Varje hub står som **att döma**, **hoppad** (med skäl) eller
**olåsbar** (404 = arkiverad eller inte delad med integrationen — de fyra i
`products.json` är arkiverade, det är känt). **Noll att döma** ⇒ kör ändå
steg 4 (rapporten säger "reviewed: 0" och varför), DoD, klart.
Varje ❌/⚠️ i utskriften är ett golv: det står i `dom.json` oavsett vad du själv
tycker (en ❌ får inte försvinna, men du får lägga till).

### 2. Domen — en hub i taget, läs varje brief själv
För VARJE hub som står "att döma": öppna `…/<hub>/<namn>.md` för VARJE brief och
döm som en creative director, mot facit:

- **`docs/copy-regler.md`:** kör tre-frågorstestet själv på hooken, rubriken och
  den bärande raden — visualisera / falsifiera / ingen annan kan säga det.
  Briefens eget ✅ är inte facit; ditt är. Adjektiv utan något att peka på,
  "bättre", "smart", "enkel" = ❌. Butikens namn eller domän i copy, bild,
  voiceover eller captions = FEL (Bäverbutiken, och för speglade hubbar även
  CaraShell — verktyget listar vilka namn som stoppar).
- **`docs/os/ANALYSMETOD.md`:** bygger hypotesen på vinstbidrag/CPA mot break-even
  och riktig data — eller på ROAS ensamt, en annons under grinden (< 300 kr /
  < 3 köp) som "vinnare", eller inget alls? Döms KPI:n mot break-even (rätt)
  eller target (fel)?
- **`docs/naming-convention.md`:** `<prefix>_<KONCEPT>_<nr>[_<variant>]`, hubbens
  prefix, video = H-variant. Går datan att skära per variabel med de taggar som
  står?
- **`products/<id>/dna.md`** (när verktyget hittat en mapp): upprepar briefen ett
  koncept dna.md tagit bort eller dömt ut? Ignorerar den en instruktion? Testar
  en variant EXAKT en variabel mot en namngiven förälder? Är ett nytt koncept
  spårbart till playbook, winning line, swipe eller egen data — eller märkt
  gissning? Utan mapp: döm mot copy-reglerna och ANALYSMETOD, och skriv i
  rapporten att produkten saknar minne i repot.
- **Formatet:** bild ⇒ textraderna i tabellen "Swedish (use this)" (IMAGE PROMPT
  är OPS-mallens block — `/bildannonser` bygger prompten ur briefen själv); video
  ⇒ manustabell med Caption-kolumn, captions max 2 rader, hooken i första
  sekunden. "Rules" med rätt pris och "never name the store".
- **Fel mot anmärkning:** ett FEL är något redigeraren måste veta (fel namn/typ,
  butikens namn i annonsen, fel pris mot butiken, en rad som föll i
  tre-frågorstestet, video utan manus, bild utan textrader). Taggar, hypotes,
  källa, en variabel, KPI och COPY CARD är briefskrivarens sak — anmärkningar
  som blir Feedback-raden och de tre reglerna, aldrig en kommentar till
  redigeraren. *(Kalibrerat 2026-09-18 mot 78 riktiga Bäver-briefer: med
  OPS-mallens krav som fel hade alla 78 fått fyra–sex kommentarer.)*

Skriv `dom.json` per hub — sökvägen står i utskriften (`dom:` …/<hub>.dom.json):
```json
{
  "hub_id": "<hubbens id ur utskriften>", "rond": "<YYYY-MM-DD ur utskriften>",
  "bra": ["what the round got right — English, one line each"],
  "missat": ["what the round missed — English, name the brief"],
  "regler": ["rule 1 for the next round", "rule 2", "rule 3"],
  "rader": [
    { "namn": "<annonsnamn>", "fel": ["…"], "anmarkningar": ["…"], "bra": ["…"] }
  ]
}
```
`fel` = det redigeraren måste veta (blir kommentar på raden). `anmarkningar` =
förbättringar till nästa rond (blir Feedback-raden + Discord). Varje rad i hubbens
kö ska ha en post; verktyget vägrar annars. Verktygets egna ❌ kopieras in som
`fel`, ⚠️ som `anmarkningar` — lägg dina ovanpå. Skriv reglerna så att nästa
briefskrivare (Skalnings kungen, Nattvakten, en `/cs`-session) kan följa dem
bokstavligt ("cite the parent's CPA and purchases, never ROAS", "no kronor amount
but 1 129 / 1 469 / 340"). Finns en tidigare Feedback-rad i hubben: skriv INTE om
regeln som hölls; skriv om den som bröts.

### 3. Skriv — per hub
```
node tools/briefgranskning.mjs --skriv tools/output/briefgranskning/<idag>/<hub>.dom.json --torr
node tools/briefgranskning.mjs --skriv tools/output/briefgranskning/<idag>/<hub>.dom.json
```
Torrt först: läs Feedback-raden och kommentarerna. Sedan skarpt: verktyget skapar
raden `Brief review <rond>` (Typ Feedback, Status Draft, Skapad i dag) i hubben —
finns den redan skapas ingen ny — skriver en kommentar per rad med fel (hoppar
rader som redan har markören `Brief review <rond>`), och sektionen `## Rond <rond>`
i `products/<id>/feedback.md` när mappen finns. Statusar rörs inte. Resultatet
hamnar i `…/<idag>/<hub>.resultat.json`.

### 4. Rapport, commit, push
```
node tools/briefgranskning.mjs --rapport --torr
node tools/briefgranskning.mjs --rapport
```
Ett meddelande för hela körningen: hubbar hittade, granskade, hoppade (med skäl),
olåsbara, ronder som lästes men inte dömdes (får inte finnas när du är klar).
Committa `ko.json`, `*.dom.json`, `*.resultat.json`, `rapport.txt` och varje
`feedback.md` som ändrats (aldrig brief-dumparna — mapparna är gitignorerade).
Pusha till `main`.

## DEFINITION OF DONE

- [ ] Färsk `main`; kön byggd över ALLA hubbar integrationen ser — antalet hubbar står i rapporten
- [ ] Varje hub: rond vald och visad (datum, antal briefer, produktmapp eller "ingen"), eller hoppad/olåsbar med skäl
- [ ] Varje brief i varje rond läst av dig — inte bara verktygets utskrift — och dömd mot copy-reglerna, ANALYSMETOD, namnkonventionen, priset (läst live) och dna.md där den finns
- [ ] Verktygets ❌/⚠️ med i varje `dom.json`; egna fynd ovanpå; exakt tre regler per hub; inga två hubbar blandade
- [ ] En Feedback-rad `Brief review <rond>` per granskad hub, ingen dubblett; `feedback.md` uppdaterad där mappen finns
- [ ] Kommentar BARA på rader med fel, på engelska; ingen status ändrad; inget i Meta rört
- [ ] EN Discord-rapport på engelska i `#problem-and-revisions-ads`; ping bara när verktyget säger stopp
- [ ] Inga ronder kvar som "lästa men inte dömda"
- [ ] Commit + push till `main`
- [ ] Slutrapport i två listor; Axels uppgifter sist, numrerade
