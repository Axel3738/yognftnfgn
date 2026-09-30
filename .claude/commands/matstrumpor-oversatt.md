# /matstrumpor-oversatt – Översättningsrutinen för Matstrumpor: nya vinnare till de marknader som SKALAR

Argument: `$ARGUMENTS` — inget (hela rundan) eller `--torr` (granska och planera, skriv
ingenting). Exempel: `/matstrumpor-oversatt` · `/matstrumpor-oversatt --torr`

Axels beställning 2026-09-30: *"jag kommer testa jättemånga olika marknader nu i tre dagar …
då är det onödigt att bara börja spamma upp nya annonser och översätta till alla språk … de
marknaderna som vi faktiskt går bra i, dem ska vi fortsätta ladda upp nya vinnare och
översätta … Det ska bara vara till de aktivt skalande marknaderna."*

| | |
|---|---|
| Konto | **"nya kungen" `730973156224390`** (SEK) — kolla id:t, aldrig namnet |
| Hub | `Matstrumpor creative hub` `3a7270ab-908c-80d2-9f35-e73e51e457ff` |
| Flödet i hubben | `Approved + Launched in SE` → **`To be translated to ACTIVE MARKETS`** → `FINISHED` |
| Marknaderna | `matstrumpor/marknader/annonser/marknader.json` (en kampanj per marknad) |
| Facit | `matstrumpor/marknader/oversatt/konfig.json` — ändra tal DÄR, aldrig här |

**Granskaren avgör allt** (`oversatt/granskare.mjs`). En marknad får nya översättningar BARA
när den skalar: kampanjen ACTIVE, minst tre HELA dygn med spend (Axels testperiod), minst
300 kr OCH 3 köp på de senaste sju dygnen, och ROAS (Metas egen) ≥ marknadens break-even.
Allt annat — `av`, `testas`, `for_lite`, `under` — får inget. Axels egna ord i
`konfig.json → manuellt` vinner över mätningen. NO och NOB (A/B-testet) får alltid samma
annonser när någon av dem skalar och den andra går.

⛔ **Rutinen skalar aldrig och slår aldrig på en marknad.** Den rör inte budget, inte en
kampanjs eller ett adsets status. PAUSED är Axels beslut, att skala Matstrumpor är hans
(`matstrumpor/konfig.json → skalning`). Det enda den slår på är annonsen den själv just
skapat, i en kampanj som redan går (`bygg.mjs --ny-aktiv`, spärren `farNyAktiv`).

---

Gör i ordning, utan att invänta godkännande mellan stegen:

1. **Granskaren.**
   ```bash
   node matstrumpor/marknader/oversatt/kor.mjs --marknader
   ```
   Skriver `oversatt/lage.json`. Skriv ut tabellen i svaret. **Skalar ingen marknad: gå till
   steg 7** — det är det normala under testdygnen, inte ett fel.

2. **Nya SE-vinnare in i kön.**
   ```bash
   node matstrumpor/marknader/oversatt/kor.mjs --vinnare
   node matstrumpor/marknader/oversatt/kor.mjs --vinnare --flytta --skarpt   # inte vid --torr
   ```
   Vinnare = raden i `Approved + Launched in SE` vars annonser (alla hookvarianter ihop) har
   ≥ 300 kr och ≥ 3 köp på 14 dygn och ROAS ≥ Sveriges break-even. Raden flyttas till
   `To be translated to ACTIVE MARKETS` med en kommentar om talen. Axel kan också flytta en
   rad dit för hand — den räknas då precis likadant.

3. **Planen.**
   ```bash
   node matstrumpor/marknader/oversatt/kor.mjs --plan
   ```
   Tre högar ut: `att göra` (rad × skalande marknad som saknar annonsen), `klara` och
   `stoppade` ⛔ (odöpt rad, ingen fil, **Katarina** — hon får aldrig lämna Sverige). Skriv ut
   ALLA tre. Högst `tak_per_korning` (6) översättningar per körning; resten tas nästa dag.

4. **Översätt, en rad × marknad i taget.** Källan är ALLTID den svenska filen, aldrig en annan
   marknads version. Namnet står i planen (`MATSTRUMP_<KOD>_sushi_…` med SE-numret kvar).
   - **Hämta filen** (Drive-länken sist på raden: `python3 tools/drive-ls.py`; bilaga:
     `tools/notion-fil.mjs`). Har raden flera hookar: ta den som vann i SE (`--vinnare` visar
     hookarna i kontot) och ge annonsen hookens id (`…_049h1_v1`).
   - **Video — verktyget avgörs av om någon pratar i bild** (CLAUDE.md regel 7):
     `python3 pipeline/pratar-i-bild.py <fil>`. Pratar ⇒ HeyGen i läget `precision`
     (`matstrumpor/marknader/heygen/README.md`, `pipeline/translate-batch.mjs --marknad`).
     Voiceover över produktbild ⇒ ElevenLabs (`pipeline/scribe.mjs` →
     `pipeline/omdubb/elevenlabs-omdubb.mjs`). Osäkert ⇒ HeyGen. Ingen röst alls ⇒ bara
     texterna ritas om (`matstrumpor/marknader/egna/README.md`, 012v2-vägen).
     Japanska och kinesiska lyssnas replik för replik (`pipeline/seglyssna.py`).
   - **Bild** — texten ritas på nytt ovanpå den textfria basen (d3-vägen i
     `egna/d3/`), aldrig av bildmodellen.
   - **Inbränd svensk text och loggan** "MATSTRUMPOR.SE" målas bort (`pipeline/logga.py`,
     `textbyte.py`). Butikens namn står aldrig i en annons.
   - **`python3 pipeline/rostkoll.py`** på varje renderad video. ❌ ⇒ levereras inte.
   - **Copyn** (rubrik, brödtext, länkbeskrivning) skrivs av en subagent med
     `model: "sonnet"` mot `docs/copy-regler.md` + `matstrumpor/marknader/oversattning/REGLER*.md`
     och döms av en skeptisk infödd granskare (`oversattning/GRANSKARE.md`). Sista raden i
     brödtexten är marknadens varumärkesrad (se befintliga annonser i `annonser/<KOD>.json`) —
     utom i NOB, som aldrig bär den. Inget pris, ingen leveranstid, aldrig 四 i JP.
   - Lägg posten sist i `annonser/<KOD>.json` (`namn`, `kalla` = SE-raden, `video` eller
     `bild` under `klar/`, `title`, `message`, `link_description`). NOB: `nob.mjs` bygger
     B-posten ur NO:s.

5. **Ladda upp — live, bara i skalande marknad.**
   ```bash
   node matstrumpor/marknader/annonser/bygg.mjs --marknad <KOD>            # torrt först
   node matstrumpor/marknader/annonser/bygg.mjs --marknad <KOD> --skarpt --ny-aktiv
   ```
   Raden säger `✅ annons … ACTIVE/…` eller `⛔ … stannar PAUSED: <skäl>`. Stannade den
   pausad: rapportera skälet, slå aldrig på för hand. Varje annons tillbakaläses av skriptet.

6. **Stäng raden** när ALLA skalande marknader bär den:
   ```bash
   node matstrumpor/marknader/oversatt/kor.mjs --klar <sid-id> --skarpt
   ```
   Kommentar på raden + `FINISHED`. Vägrar om en marknad saknas. En rad som bara hunnits
   delvis ligger kvar i kön och tas nästa körning.

7. **Committa och pusha** `oversatt/lage.json`, ändrade `annonser/<KOD>.json`,
   `annonser/videor.json`, `annonser/lage.json` (`git pull --rebase` först — andra rutiner
   pushar varje timme). `klar/` är gitignorerat.

8. **Rapportera i två listor.** "Gjort av mig" (granskarens tabell, flyttade vinnare, varje
   uppladdad annons med id, marknad och status) / "Väntar på en människa" (stoppade rader,
   pausade för att kampanjen inte gick, över taket). Axels uppgifter sist, numrerade.

---

## DEFINITION OF DONE

- [ ] `ad_account_id` = `730973156224390` (kontrolleras av skripten mot namnet "nya kungen")
- [ ] Granskarens tabell visad, `lage.json` skriven i dag
- [ ] Ingen översättning till en marknad som inte skalar (testas/av/för lite/under)
- [ ] Vinnarna flyttade bara när minst en marknad skalar
- [ ] Alla tre högarna redovisade: att göra / klara / stoppade
- [ ] Källan var den svenska filen; Katarina aldrig utomlands
- [ ] Rätt verktyg per video (pratar i bild ⇒ HeyGen precision), röstkollen grön
- [ ] Copy av sonnet, dömd av infödd granskare, varumärkesraden sist, inget butiksnamn
- [ ] Varje uppladdning tillbakaläst: id, namn, marknad, status
- [ ] Ingen budget, kampanj eller adset rörd; inget PAUSED aktiverat
- [ ] Klara rader satta till `FINISHED` med kommentar
- [ ] Filerna committade och pushade
- [ ] Slutrapport i två listor; Axels uppgifter sist, numrerade
