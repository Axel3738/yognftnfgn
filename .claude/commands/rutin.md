# /rutin – Sätt upp en schemalagd rutin som faktiskt kör

Argument: `$ARGUMENTS` — kommandot som ska köras och tiden i **svensk tid**.
Butiks-id om kommandot tar ett. `--lista` visar husets rutiner utan att röra något.

```
/rutin /notionkorning 13:20
/rutin /skalningskungen tankguard 07:00
/rutin --lista
```

Bygger EN rutin per körning. Ska flera sättas upp: kör kommandot flera gånger,
en åt gången, och läs kontrollen mellan varje.

Facit för räknandet och spärrarna är `factory/rutin.mjs` — kommandot är
körordningen. Räkna aldrig om cron i huvudet.

---

## Tre fel som gjort rutiner värdelösa, och som spärrarna finns för

**En rutin som startar ny session varje gång kan inte pusha.** Den saknar repo
som källa, så proxyn ger den aldrig något credential: `git push` svarar
`not in this session's authorized repository set`, och allt rutinen lärde sig
dör med containern. Mätt tre gånger (2026-09-03, 09-04, 09-05). Därför binds
varje rutin till en **fast session** med repot som källa och `main` som utgren.

**Cron står i UTC och följer inte sommartid.** En cron satt i juli går en timme
fel i november. Räkna alltid om från önskad svensk tid — minns aldrig
riktningen.

**Rutinen klonar `main`.** Ligger kommandofilen kvar på en gren hittar rutinen
ingenting och ger upp direkt.

---

Gör i ordning:

1. **Räkna och granska först.**
   ```
   node factory/rutin.mjs --tid <HH:MM> --kommando "<kommando>" [--butik <id>]
   ```
   Den ger cron för både sommar och vinter, säger vilken som gäller nu, och
   listar hinder och varningar. **Exit 1 = bygg inte.** Visa utskriften i
   chatten innan något skapas.

2. **Kolla att rutinen inte redan finns.** Kör `list_triggers` och läs listan.
   En dubblett upptäcks annars först när något gjorts två gånger (hände
   2026-09-08). Finns den redan: använd `update_trigger`, aldrig en ny.

3. **Skapa den fasta sessionen.** `create_session` med exakt de argument
   steg 1 skrev ut: `source_url` till repot, `outcome_branch: "main"`, titel
   `Rutin: <namn>` och taggarna. Spara sessions-id:t.

4. **Koppla triggern till sessionen.** `create_trigger` med
   `persistent_session_id` = id:t från steg 3, cron från steg 1, och
   `prompt` = kommandot. Utan `persistent_session_id` startar rutinen i en tom
   container — det är hela felet ovan.

5. **Läs tillbaka.** `list_triggers` igen: rutinen ska stå där med rätt cron
   och rätt `persistent_session_id`. Står den inte där blev den inte skapad,
   oavsett vad anropet svarade.

6. **Säg vad som återstår för en människa.** Connectors ärvs INTE av rutinen.
   Behöver den Notion, Drive, Slack eller Shopify måste de kopplas på själva
   rutinen i Routines-vyn på claude.ai — annars står den helt utan
   `mcp__*`-verktyg och kan starta, se glad ut och ändå inte läsa någonting.
   Steg 1 skriver ut vilka som behövs. Samma sak med env-nycklarna: rutinens
   container har sin egen miljö.

7. **Skriv upp den.** Ny rad i CLAUDE.md:s rutintabell (svensk tid, cron,
   kommando) och i `factory/rutin.mjs`:s lista om det är en husrutin.
   Committa och pusha till `main`.

---

## Vid sommar- och vinteromställning

Varje cron ändras. Kör `node factory/rutin.mjs --lista` för att se alla nya
värden och `update_trigger` per rutin. Skapa aldrig om dem — en ny rutin
tappar körhistoriken och kan bli en dubblett.

---

## DEFINITION OF DONE

- [ ] `node factory/rutin.mjs` körd och utskriften visad — exit 0
- [ ] `list_triggers` läst FÖRE bygget: ingen dubblett
- [ ] Fast session skapad med repot som källa och `main` som utgren
- [ ] Trigger kopplad med `persistent_session_id` — aldrig ny session per körning
- [ ] `list_triggers` läst EFTER bygget: rutinen står där med rätt cron
- [ ] Connectors och env-nycklar som saknas är namngivna för Axel
- [ ] Cronens andra halvår antecknat, så omställningen inte glöms
- [ ] CLAUDE.md-tabellen uppdaterad, committad och pushad till `main`
