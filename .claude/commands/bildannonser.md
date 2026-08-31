# /bildannonser — den dagliga bildannons-rutinen (20:00)

Kör varje kväll 20:00. Uppdraget i en mening: **gå igenom alla Bäverbutikens
Notion-hubbar, hitta bildannonser som inte är gjorda, generera dem med kie.ai,
och lämna dem i `To be Reviewed` åt granskningsrutinen.**

Argument: `$ARGUMENTS` — normalt tomt. `--dry` = visa vad som skulle genereras
utan att bränna credits. `<hubbnamn>` = kör bara den hubben.

## Järnregeln: ALDRIG videoannonser

Rutinen genererar **bara** rader med `Typ = "Image - Pending Approval"`.
Videorader (`Video - Pending Approval`) ligger i samma hubbar, i samma status
`Draft`, ofta med nästan samma namn — `Beltgrinder_PD_4_1` är bild,
`Beltgrinder_PD_4_H1` är video. De görs av redigerarna, aldrig här.

Spärren sitter på tre ställen och alla tre ska hålla:
1. SQL:en filtrerar på `Typ = 'Image - Pending Approval'` (**inkludering**, aldrig
   uteslutning — annars smyger nya Typ-värden in i körningen).
2. `bildannonser/run.mjs` vägrar varje jobb vars `typ` inte är exakt det värdet
   och kastar fel i stället för att hoppa över tyst.
3. Slutrapporten redovisar antal bildrader och antal videorader som lämnades
   orörda. Är videosiffran 0 i en hub som har videorader i Draft: något är fel
   med filtret — avbryt och skriv det i rapporten.

## Förutsättningar — kontrollera dem FÖRST, i den här ordningen

Rutinen är mergad till `main` sedan 2026-08-30 (PR #24). Två saker kan ändå
saknas i den startade sessionen, och de ska aldrig gissas — de kontrolleras:

**1. Repot.** Den schemalagda sessionen startar ibland utan repo alls —
arbetskatalogen är då bara `/home/user`, utan `.git`. Klona i så fall:

```bash
ls /home/user/yognftnfgn/.claude/commands/bildannonser.md 2>/dev/null \
  || git clone https://github.com/Axel3738/yognftnfgn.git /home/user/yognftnfgn
cd /home/user/yognftnfgn && git checkout main && git pull
```

⚠️ **Att den här filen saknas betyder INTE att grenen är omergad.** Det hände
2026-08-30: sessionen hade inget repo, drog slutsatsen "grenen är inte mergad",
och rapporterade fel orsak till Axel. Kontrollera alltid att repot finns innan
du uttalar dig om vad som ligger i `main`.

**2. Notion-connectorn.** Har du inga `mcp__Notion__*`-verktyg — eller visar
`ListConnectors` Notion med `enabledInChat: false` — är connectorn påslagen på
org-nivå men inte på den här rutinen. Den kopplas på i Routines-vyn på
claude.ai; det går inte att sätta via API:t i den här organisationen.

**3. `KIE_API_KEY`.** Saknas den: kör steg 1–3, redovisa hela kön, och skriv att
inget genererats för att nyckeln saknas.

Slår något av dem in: rapportera exakt vilket och vad du faktiskt såg, och gör
inget annat. Gå aldrig runt dem — en rutin som "löser" saknad åtkomst gör fel
saker tyst.

## Schemat

Rutinen är en Routine som startar en färsk session 20:00 svensk tid varje dag.
Cron körs i **UTC**, så den står på `0 18 * * *` — rätt under sommartid.

⚠️ **Vid vintertidsomställningen 25 oktober 2026 blir 18:00 UTC = 19:00 i Sverige.**
Ska den ligga kvar på 20:00: ändra till `0 19 * * *`. Ingen automatik gör det.

## Steg 0 — Läsning

`CLAUDE.md` → `docs/os/NOTION-FORMAT.md` → `docs/copy-regler.md` →
`docs/naming-convention.md`. Kräver env `KIE_API_KEY` samt Notion-connectorn.
Saknas `KIE_API_KEY`: kör hela steg 1–3, redovisa kön, och skriv i rapporten att
inget genererats för att nyckeln saknas. Låtsas aldrig att bilder är gjorda.

## Steg 1 — Hitta alla hubbar (aldrig en handskriven lista)

Hubbarna hittas dynamiskt, så nya produkter kommer med av sig själva:

- Sök i Notion med `teamspace_id = 3a9270ab-908c-81a8-a48c-004222d195e7`
  (**teamspacet Bäverbutiken**) efter databaser vars titel slutar på
  `creative hub`.
- Uteslut `Creative hub MALL` — den är mallen nya hubbar klonas från, inte en
  produkt.
- ⚠️ **Lägg ALLTID till hubbarna ur `products/products.json` ovanpå sökträffarna.**
  De fyra skalningsprodukternas hubbar (Boat cover, Trimmer belt, Mower seat,
  Beach crocs) är **arkiverade** i Notion och kommer inte med i en vanlig
  sökning. Sökningen finns för att nya produkter ska dyka upp av sig själva;
  `products.json` är golvet som gör att de gamla aldrig faller bort.
  *(Incident 2026-08-31: commission-rutinen såg 2 hubbar av 6 av precis den här
  anledningen och rapporterade 0 kr som månadens slutavräkning.)*
- Hittar körningen färre hubbar än `products.json` känner till: avbryt och skriv
  vilka som saknas. Kör aldrig vidare på en ofullständig hubblista.
- Hämta varje hubbs `collection://`-URL med `fetch` på databas-id:t.

**Teamspacet ÄR skyddet mot att blanda verksamheterna.** Grillkliniken,
Matstrumpor och Ploomi.se har egna teamspaces. Sök aldrig utan `teamspace_id`,
och lägg aldrig till en hubb för hand — en hubb utanför Bäverbutikens teamspace
rörs aldrig, oavsett vad den heter.

Saknar en hubb Typ-värdet `Image - Pending Approval` är den skapad före mallen
uppdaterades: hoppa över den och skriv en rad i rapporten om att den behöver få
valet tillagt. Lägg inte till det själv.

## Steg 2 — Hitta de ogjorda bildannonserna

Per hubb, en fråga:

```sql
SELECT url, "Namn", "Status", "Landing page", "Filer och media"
FROM "collection://<hubbens-id>"
WHERE "Typ" = 'Image - Pending Approval' AND "Status" = 'Draft'
```

`Draft` = ingen har börjat. Det är hela kön. Rör aldrig `In progress`,
`In progress 2`, `Creative strat review`, `To be Reviewed`, `In Review`,
`Approved`, `Archived` eller `Not used` — de är någon annans beslut.

Kör samtidigt en räkning av `Typ = 'Video - Pending Approval' AND "Status" = 'Draft'`
per hubb. Den siffran används bara i rapporten, som kvitto på att videoraderna
sågs och lämnades ifred.

**Verifierat läge 2026-08-30** (kör frågan, jämför — den ska se ut ungefär så här):

| Hubb | Bild i Draft | Video i Draft (rörs inte) |
|---|---|---|
| Belt grinder | `Beltgrinder_PD_4_1`, `PD_5_1`, `SO_4_1` | `PD_4_H1`, `PD_5_H1`, `SP_4_H1` |
| Kranskydd Frost | `Kranskydd_CI_1_1`, `PD_3_1`, `SP_3_1` | `CI_1_H1`, `SP_3_H1`, `UG_1_H1` |
| Boat cover, Beach crocs, Trimmer belt, Mower seat | 0 | 0 |

Sex bildrader, sex videorader, nästan identiska namn — `_1` mot `_H1`. Det är
precis det här fallet järnregeln finns för.

## Metoden: modellen ritar bilden, vi sätter texten

⚠️ **Låt ALDRIG bildmodellen rendera svensk text.** Verifierat 2026-08-30 i två
rundor: kie.ai gav "trå" istället för "trä", "fölyer" istället för "följer",
"veldlyt" istället för "väldigt" och en obegriplig kundrecension. Alla 10 bilder
underkändes. Skärpta promptar hjälpte inte — det är modellens gräns, inte
promptens.

⚠️ **Låt ALDRIG modellen rita produkten fritt.** Samma körning gav en påhittad
maskin i varje bild. Produktbilden från produktsidan ska med som referens i
VARJE anrop, då växlar klienten till `google/nano-banana-edit`.

Flödet är därför tre steg, och ordningen är inte förhandlingsbar:

1. **Verifiera texten** mot briefen innan något genereras:
   `python3 bildannonser/verifiera.py --spec <spec> --briefar <mapp>`
   Varje sträng måste finnas ordagrant i briefen. Ett fynd = inget renderas.
2. **Generera bilden utan text**, med produktfotot som referens. Prompten ska
   beskriva produkten ur referensbilden och avsluta med en negativlista:
   ingen text, inga bokstäver, inga siffror, ingen logga, ingen vattenstämpel.
   Be modellen lämna lugna ytor i topp och botten där texten ska ligga.
3. **Bränn på texten deterministiskt:**
   `python3 bildannonser/text.py --spec <spec>`
   Texten kommer ordagrant ur briefen och kan aldrig bli felstavad.

Hela metoden står i `docs/framework-bildannonser.md` — läs den före varje
körning. Den är destillerad ur produktionen för sju produkter.

## Steg 3 — Bygg prompten ur briefen (hitta ALDRIG på copy)

Läs varje rads sidinnehåll med `fetch`. Briefen innehåller allt som behövs:
produkt, format, scenbeskrivning, och en tabell `Swedish (use this) | English meaning`.

**De svenska raderna kopieras ordagrant ur tabellen.** Rutinen skriver ingen ny
copy — varken rubriker, stödrader eller CTA. Det är inte en effektivisering, det
är modellpolicyn i `CLAUDE.md` punkt 6: all ad copy skrivs av en subagent i
`/cs`-flödet, aldrig av en nattrutin. Saknar briefen svenska rader: **hoppa över
raden**, lämna den i `Draft` och skriv den under "Behöver brief" i rapporten.

Tre kontroller innan prompten byggs:

1. **Priset.** Står ett pris i briefen: hämta det verkliga priset från
   produktsidan (`Landing page`) och jämför. Skiljer de sig — hoppa över raden
   och rapportera. Ett inbränt gammalt pris gör creativen oanvändbar (se
   `CLAUDE.md`, "Saker som är lätta att göra fel").
2. **Referensbild.** Pekar briefen på en `Winning Creative` i samma hubb: hämta
   dess bild-URL och skicka med som `referens_bilder` — då växlar klienten
   automatiskt till `google/nano-banana-edit` och matchar vinnarformatet.
3. **Bildformat.** `4:5` (1080×1350) är standard för Metas feed. Säger briefen
   `1:1` — använd det. Säger den båda: generera ett jobb per format och döp dem
   `<namn>` och `<namn>_1x1`.

Skriv prompten på engelska (bildmodellen kräver det) men **de svenska raderna
ordagrant inom citattecken**, med en uttrycklig instruktion att texten ska
återges tecken för tecken. Skriv jobbfilen till scratchpad:

```json
{
  "datum": "2026-08-30",
  "jobb": [
    {
      "namn": "Beltgrinder_PD_4_1",
      "typ": "Image - Pending Approval",
      "hub": "Belt grinder creative hub",
      "notion_url": "https://app.notion.com/p/...",
      "prompt": "...",
      "bildformat": "4:5",
      "referens_bilder": []
    }
  ]
}
```

## Steg 4 — Generera

```bash
node bildannonser/run.mjs --jobb=<scratchpad>/jobb.json          # skarpt
node bildannonser/run.mjs --jobb=<scratchpad>/jobb.json --dry    # bara planen
```

Bilder + `_manifest.json` hamnar i `bildannonser/output/<datum>/`. Ett jobb som
misslyckas stoppar aldrig de andra — det hamnar som `status: "fel"` i manifestet.
Kör om en misslyckad rad **en** gång; misslyckas den igen lämnas den i `Draft`
och rapporteras.

## Steg 5 — QA innan något laddas upp

**Titta på varje genererad bild.** Bildmodeller är opålitliga på text, och
svenska å/ä/ö är det första som går sönder. Per bild:

- [ ] Varje svensk rad är exakt densamma som i briefens tabell — bokstav för
      bokstav, å/ä/ö intakta, inga påhittade ord.
- [ ] Ingen dubblerad, avhuggen eller spegelvänd text.
- [ ] Produkten ser ut som produkten på produktsidan.
- [ ] Priset (om något) är det verifierade priset från steg 3.
- [ ] Inga påhittade rabattsiffror, inga "40 %", ingen falsk lagerbrist.

Underkänd bild: generera om **en** gång med skärpt textinstruktion. Underkänd
igen — ladda inte upp, lämna raden i `Draft`, rapportera. **En dålig bild i
Notion är dyrare än en tom rad**, för granskningsrutinen litar på att det som
ligger där är QA:at.

## Steg 6 — Notion: bifoga bilden och flytta till To be Reviewed

Per godkänd bild, i den här ordningen:

1. `create-file-upload` med filnamnet → POST filen till `upload_url` med de
   returnerade headers (multipart, fältet `file`).
2. `update-page` med `command: "update_properties"` på raden:
   - `Filer och media` = uppladdningens referens
   - `Status` = `"To be Reviewed"`
3. **Läs tillbaka raden** och verifiera att både filen och statusen sitter.

Ordningen är inte förhandlingsbar: **statusen flyttas aldrig före bilden är
uppe.** Blir uppladdningen klar men statusbytet misslyckas hamnar raden i
"Behöver hjälp" i rapporten — då finns bilden men raden syns fortfarande i
morgondagens kö, vilket är rätt fel att ha.

Rutinen ändrar **bara** `Filer och media` och `Status`. Aldrig `Namn`, `Typ`,
`Ansvarig`, `Deadline`, `Feedback` eller sidinnehållet. Den raderar aldrig en
rad och flyttar aldrig en status bakåt.

## Steg 7 — Rapport (mobilformat — Axel läser den som notis)

**Första raden är hela rapporten för mobilen.** Max 12 ord, börjar med ✅ eller ⚠️:

- `✅ 6 bildannonser klara, ligger för granskning`
- `⚠️ 4 klara, 2 väntar på brief`

Sedan max 5 korta rader: hur många per produkt, vad som hoppades över och varför.
Videoraderna redovisas på en rad: `Videoannonser orörda: 3 (redigerarnas)`.
Tekniska detaljer (taskId, filnamn, hubb-id) allra sist under en rad `Detaljer:`.

Skicka samma text till Discord — kanalen **#ai-image-ads** (Axels beslut
2026-08-30). Den tomma `DISCORD_CHANNEL_ID=` är nödvändig: env-variabeln pekar
ut en annan kanal och vinner annars över namnet.

```bash
DISCORD_CHANNEL_ID= DISCORD_CHANNEL_NAME=ai-image-ads \
  node tools/notify-discord.mjs "<hela rapporten>"
```

Misslyckas skicket: nämn det på en rad och gå vidare — Discord-strul stoppar
aldrig körningen.

## DEFINITION OF DONE

- [ ] Alla hubbar ur products.json fanns med i körningen (de är arkiverade och
      syns inte i sökningen)
- [ ] Alla hubbar i teamspacet Bäverbutiken lästa — skriv antalet, och att
      `Creative hub MALL` uteslöts
- [ ] Ingen hubb utanför Bäverbutikens teamspace rörd
- [ ] Kön hämtad med `Typ = 'Image - Pending Approval' AND Status = 'Draft'`
      (inkluderingsfilter) — skriv antalet
- [ ] **Noll videorader genererade** — skriv hur många som fanns och lämnades
- [ ] Ingen ny copy skriven; alla svenska rader ordagrant ur briefen
- [ ] Priser verifierade mot produktsidan för varje brief som anger pris
- [ ] Varje genererad bild QA:ad mot checklistan i steg 5 — redovisa per bild
- [ ] Bild uppladdad FÖRE statusbytet, båda tillbakalästa
- [ ] Alla godkända rader står i `To be Reviewed`
- [ ] Överhoppade rader ligger kvar i `Draft` med skriven orsak
- [ ] Rapport levererad i mobilformat + skickad till Discord
