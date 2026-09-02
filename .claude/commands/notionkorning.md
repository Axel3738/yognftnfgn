# /notionkorning — daglig leveransrunda för Bäverbutiken (00:01)

Rutinen som körs varje natt kl 00:01 svensk tid. Ett jobb: **allt som står i
`To be Reviewed` i Notion ska QA:as mot sin brief och ligga uppe i Meta samma natt.**

Blanda inte ihop den med `/nattkorning` — den är Temu-launcher från Drive.
Den här rundan täcker HELA Bäverbutiken på MagiBorsten, alla produkter som har
en kampanj i kontot — inte bara de fyra skalningsprodukterna.

Kör alla steg klart utan att invänta godkännande mellan dem. **Oavsett hur många
leveranser som ligger klara kollas alla** — noll är ett giltigt utfall, inte ett fel.
Det finns ingen övre gräns: ju fler creatives som kommer ut, desto bättre.

## Torrläge — `/notionkorning --torr`

Skrivs `--torr` (eller "torrkör", "provkör", "utan att ladda upp") körs **steg 0
till 3 fullt ut och steg 4 stannar före varje skrivning.** Ingenting skapas,
ingenting aktiveras, ingenting kommenteras eller flyttas i Notion, kvoten loggas
inte och inget pushas.

Leverera i stället en tabell: per creative vilken produkt och kampanj den skulle
hamna i, vilket adset (befintligt eller nyskapat), QA-utfallet, och om den skulle
laddas upp eller stoppas. Sista raden: **exakt vilka statusändringar som skulle
gjorts** — i Meta och i Notion — med namn och gammal→ny status.

Verktygen har samma läge: `node tools/notion-till-meta.mjs … --torr` och
`node tools/notion-aterkoppling.mjs … --torr`.
Torrläget är alltid säkert att köra — använd det vid minsta tvekan.

## Axels beslut (styr hela rutinen — ändra inget av detta på egen hand)

Beslut 2026-08-30, uppdaterade 2026-09-02:

1. **Källan är Notion. Bara Notion.** Klar = en rad i någon creative hub med
   Typ `… Pending Approval`, status **`To be Reviewed`** och en fil i
   `Filer och media`. Det gäller **både video och bild.** Redigerarna lägger sina
   videor där; `/bildannonser` lägger bilderna där 20:00 varje kväll.
   Drive `Edited Folder/Week N/` är **inte längre en källa** (Axel 2026-09-02).

   ⚠️ **Notion-bilagan är enda kopian i världen.** `bildannonser/output/` är
   gitignorerat och dör med containern. Läses inte Notion är arbetet borta, och
   ingen får veta — raden fastnar i `To be Reviewed` för alltid, för 20:00-rutinen
   plockar bara `Draft`. *(Detta hände: fem färdiga bildannonser för Kranskydd
   och Beltgrinder låg osynliga tills Axel upptäckte dem 2026-08-31.)*

   ⚠️ **Går Notion inte att läsa finns ingen kö alls — säg det högst upp i
   rapporten.** `leveranskon.mjs` larmar redan; för aldrig vidare ett tyst noll.
2. **Allt i `To be Reviewed` har aldrig legat uppe.** Rutinen behöver därför inte
   jämföra mot kontot för att veta vad som är gjort. Dubblettspärren på
   annonsnamn i `notion-till-meta.mjs` finns kvar som säkerhetsbälte, inget mer.
3. **Uppladdning sker i produktens kampanj i MagiBorsten** — den kampanj som
   redan bär annonser med samma prefix — inte i ett test-ABO. Detta är ett
   **uttryckligt undantag från regel 11 i CLAUDE.md**, fattat av Axel 2026-08-30.
   Rätta inte tillbaka det och föreslå inte test-ABO varje natt.
4. **Grön QA aktiveras direkt.** Rutinen väntar inte på att Axel slår på.
5. **Stoppregeln är en enda: priset.** Skiljer priset i annonsen mer än **20 %**
   (upp eller ner) från produktsidans pris i Shopify just nu, stoppas annonsen.
   Allt annat i checklistan är anmärkningar som rapporteras, inte stopp.
   Felstavningar i **videoannonser** är okej.
6. **Bildannonser med problem** — vilket problem som helst, även en felstavning —
   får en kommentar i Notion med vad som är fel och flyttas tillbaka till
   **`Draft`** så 20:00-rutinen gör om dem. De laddas inte upp.
   **Videoannonser** som stoppas får bara en kommentar; statusen rörs inte.
   Det är den enda gången rutinen ändrar en Notion-status.
7. **Ingen nödbroms på antal.** Tio, tjugo eller femtio leveranser en natt är
   bara bra — alla kollas och alla godkända laddas upp.

## Så hänger kedjan ihop

```
Notion-hub: rad "<annonsnamn>", status To be Reviewed, fil i "Filer och media"
                                      │
                    prefixet i annonsnamnet (t.ex. Enginecover_)
                                      ↓
        kampanjen i MagiBorsten som redan har annonser med samma prefix
                                      ↑
        samma Notion-rad  →  briefen som QA:n mäts mot  →  Landing page-URL:en
```

| Prefix | Produkt | Notion-hub |
|--------|---------|------------|
| `Enginecover_` | `motorholjet` | Boat cover 420D creative hub |
| `Trimmerbelt_` | `axelbaltet` | Trimmer belt creative hub |
| `Seatcover_` | `satesoverdragaren` | Mower seat creative hub |
| `Beachslippers_` | `strandtofflorna` | Beach crocs creative hub |

`creative_prefix` i `products/products.json` är bara en explicit **override** för de
fyra skalningsprodukterna. Alla andra prefix slås upp mot kontot (se steg 1) och
behandlas precis likadant. Ett prefix utan kampanj i MagiBorsten rapporteras och
laddas inte upp — det är enda skälet att lämna en leverans orörd.
Notion-titlar bär ibland ett suffix (`Beachslippers_PD_2_8 – COPY ONLY: …`) —
matcha alltid på annonsdelen före tankstrecket.

## Steg 0 — Läs in läget

- `products/products.json` — de fyra med `creative_prefix`. **Citera aldrig
  budget eller break-even ur minnet, läs filen.**
- `docs/copy-regler.md`, `docs/naming-convention.md`, produktens `products/<id>/dna.md`.
- Rutinen ärver inga MCP-connectors. Meta läses via `META_ACCESS_TOKEN`.
  **Notion kräver antingen Notion-MCP:n eller `NOTION_TOKEN`** (se steg 1).
  Utan Notion finns ingen kö — rapportera det och sluta.
- Frame-uttaget i steg 2 kräver `imageio-ffmpeg` och `pillow`. Saknas de:
  `pip install imageio-ffmpeg pillow` en gång i början av körningen.

## Steg 1 — Hämta kön

```bash
node tools/leveranskon.mjs            # allt i To be Reviewed, per produkt
node tools/leveranskon.mjs --json     # maskinläsbart
node tools/leveranskon.mjs --alla     # även rader vars namn redan finns i kontot
```

Verktyget läser **alla creative hubs i Notion** via `notion-kalla.mjs` (kräver
`NOTION_TOKEN` på rutinen — rutiner ärver inte sessionens connectors) och slår
upp kampanjen per prefix i MagiBorsten. Är Notion-MCP:n kopplad går det lika bra
att läsa hubbarna den vägen: teamspacet Bäverbutiken
(`3a9270ab-908c-81a8-a48c-004222d195e7`), databaser vars titel slutar på
`creative hub`, rader med Typ `… Pending Approval` + status `To be Reviewed` +
fil. Skriv i rapporten vilken väg du gick.

**Hämta hem bilagan** innan QA och uppladdning:
```bash
node tools/notion-fil.mjs <page-id> --ut <mapp>
```
Notions fil-URL är signerad och kortlivad — hämta i samma körning, cacha den aldrig
och skicka den aldrig vidare som en flagga.

**Rutinen täcker HELA Bäverbutiken, inte en fast lista produkter.** Nya produkter
tillkommer ständigt (Axels påpekande 2026-08-30), så kopplingen leverans → kampanj
härleds ur kontot självt: annonserna i MagiBorsten lär verktyget vilket
annonsprefix som hör till vilken kampanj. `Rodholder_` → Fiskespöhållaren,
`Balteslipmaskin_` → Bälteslipmaskinen, och så vidare — **46 prefix i dag, utan
en rad konfiguration.** `creative_prefix` i `products.json` är bara en explicit
override för de fyra skalningsprodukterna.

En hårdkodad produktlista missar nya leveranser **tyst**, och en tyst missad
leverans är värre än en rapporterad. Bygg därför aldrig tillbaka den.

**När prefixet inte går att härleda** — Notion-hubben och kontot använder ibland
olika språk för samma produkt (hubben `Belt grinder creative hub` → annonser
`Beltgrinder_`, men kampanjen heter `Bälteslipmaskinen` och dess annonser
`Balteslipmaskin_`). Då finns ingen gemensam sträng att matcha på.
**Rutinen gissar aldrig.** Kopplingen skrivs upp en gång i
`products/prefix-alias.json` med kampanj-id ur MagiBorsten; saknas den rapporteras
raden som "ingen kampanj" och laddas inte upp.

Fyra utfall per leverans, och de behandlas olika:

| Utfall | Vad rutinen gör |
|---|---|
| Kampanj **ACTIVE** | Ladda upp — den **börjar spendera direkt vid aktivering**. Prisgrinden måste vara grön. |
| Kampanj **PAUSED, 0 kr spend** | Ladda upp. Kampanjen har aldrig kommit igång och kan aktiveras. |
| Kampanj **PAUSED med spend > 0** | **AVVECKLAD. Ladda inte upp.** Rapportera bara. |
| **Ingen kampanj** i kontot | Produkten är inte launchad. **Ladda inte upp, gissa aldrig en kampanj.** Rapportera raden. |

⚠️ **En avstängd kampanj som har spenderat är avvecklad, inte tom.** Axels regel
2026-08-30. Nya creatives ska inte in där: de begravs bakom en pausad kampanj,
försvinner ur kön (dubblettspärren ser dem som gjorda) och kan aktiveras av
misstag den dag någon slår på kampanjen igen.

`notion-till-meta.mjs` vägrar själv en sådan uppladdning (spärr 0). `--anda`
finns för att kringgå den — **använd den aldrig i rutinen**, bara när Axel
uttryckligen ber om det i en chatt.

En rad utan fil i `Filer och media` är **inte klar** — `leveranskon.mjs` hoppar
över den. Den syns inte i kön och rapporteras inte.

Ladda ner varje creative till scratchpad. Radera media mellan produkterna.

## Steg 2 — Brief-kontrollen

**Varje creative granskas bild för bild mot sin egen brief. Video och bild,
varenda en, varje natt.** Grinden är gratis — det enda som kostar är att låta en
annons med grovt fel pris börja spendera.

### 2a. Hämta briefen och priset

Briefen ligger som sidinnehåll i Notion-raden med samma namn:

```bash
node tools/notion-klara.mjs --produkt <id>          # hitta raden + dess page-id
node tools/notion-klara.mjs --brief <page-id>       # dumpa briefen som text
```

Är Notion-MCP:n ansluten går det lika bra därigenom (`notion-fetch` på raden).

**Priset hämtas från produktsidan i Shopify vid varje körning** — URL:en står i
radens `Landing page`. Aldrig ur briefen, aldrig ur en äldre creative.

### 2b. Gör creativen granskningsbar

```bash
python3 tools/qa-frames.py <fil.mp4|bild.jpg> --ut <mapp>
```

Verktyget drar frames tätt genom hookens första 3 sekunder (0,0 / 0,5 / 1,0 …),
sedan var 1,5:e sekund, plus sista bilden där pris och CTA brukar ligga. Bilder
skalas till läsbar storlek. Kräver `imageio-ffmpeg` (`pip install imageio-ffmpeg
pillow` om det saknas).

**Läs sedan VARJE frame i mappen.** Inte bara den första, inte bara ett stickprov
— hela sekvensen, i ordning. Bildannonser granskas likadant: hela ytan, all text.
Att materialet är uttaget är inte samma sak som att det är granskat.

### 2c. Checklistan, per creative

| # | Punkt | Var | Video | Bild |
|---|-------|-----|-------|------|
| 1 | **Priset i annonsen mot Shopify-priset: avvikelse ≤ 20 %** | all inbränd text | 🛑 stopp | 🛑 stopp |
| 2 | Hooken i briefen är hooken i bild | frames 0–3 s | anmärkning | 🔁 Draft |
| 3 | Formatet stämmer (UGC / before-after / comparison …) | hela | anmärkning | 🔁 Draft |
| 4 | Vinkeln stämmer (pain / benefit / social …) | hela | anmärkning | 🔁 Draft |
| 5 | Alla scener/beats i briefen finns med | hela | anmärkning | 🔁 Draft |
| 6 | "Bäverbutiken" rättstavat, rätt produktnamn | all inbränd text | anmärkning | 🔁 Draft |
| 7 | Svenska manusraderna = briefens rader | all inbränd text | anmärkning | 🔁 Draft |
| 8 | Annonsnamnet bär prefix + konceptkod | Notion-titeln | anmärkning | 🔁 Draft |
| 9 | Å, Ä, Ö renderar korrekt | hela | anmärkning | 🔁 Draft |
| 10 | Briefens egna `Hard rules` / `COPY GATE` | text | anmärkning | 🔁 Draft |
| 11 | Rabattclaim mot jämförpriset | text | anmärkning — se nedan | anmärkning — se nedan |

Läs tabellen så här:

- **🛑 stopp** — annonsen laddas inte upp. Gäller video och bild, och bara
  punkt 1. Räkna: `|annonspris − shopifypris| / shopifypris`. Över 0,20 = stopp.
  Ingen pris i annonsen alls = grön på punkt 1.
- **anmärkning** (video) — annonsen laddas upp ändå. Anmärkningen står i
  rapporten så Axel och managern ser den. Felstavningar i video är okej.
- **🔁 Draft** (bild) — annonsen laddas inte upp. Kommentar i Notion med vad som
  är fel, sedan status → `Draft`. Bilder är gratis att göra om; 20:00-rutinen
  tar den igen nästa kväll.

**Rabattclaim som inte stämmer ändras aldrig i annonsen** (Axels policy
2026-08-29) — jämförpriset höjs i stället så claimen stämmer:
`node tools/shopify-fix-compareat.mjs --product-id <id> --rabatt <procent>`.
Rapportera ändringen.

**Finns varken MCP eller `NOTION_TOKEN` för briefen:** säg det i rapporten och
kör bara punkt 1, 6 och 9. Låtsas aldrig att briefen kontrollerats.

### 2d. Redovisa och återkoppla

En QA-rad per creative: ✅ / anmärkning / 🛑 / 🔁 per punkt. **Varje fynd ska
peka ut var det sitter** — frame-nummer och sekund för video, plats i bilden för
statiska. Ett fynd utan plats är inte ett fynd, det är en gissning.

Stoppad eller Draft-flyttad creative → återkoppling i Notion, i samma körning:

```bash
# Video som stoppats på pris — bara kommentar:
node tools/notion-aterkoppling.mjs <page-id> --kommentar "Priset i bild är 799 kr, produktsidan säger 599 kr (33 % fel). Rätta till 599 kr."

# Bild med problem — kommentar + tillbaka till Draft:
node tools/notion-aterkoppling.mjs <page-id> --kommentar "Bäverbutiken stavat 'Väverbutiken' i nedre högra hörnet." --status Draft
```

Kommentaren är konkret: **vad**, **var**, **vad det ska bli i stället**. Med
Notion-MCP:n: `notion-create-comment` på raden och `notion-update-page` för
statusen — samma ordning, kommentaren först.

Radera framesen och nedladdad media ur scratchpad när produkten är klar.

## Steg 3 — Ad copy ur briefen

Primärtext, rubrik och beskrivning tas **rakt av ur briefens COPY CARD**.
Saknas de: skriv dem inte själv i huvudsessionen — modellpolicyn (regel 6 i
CLAUDE.md) gäller, en subagent med `model: "sonnet"` skriver dem utifrån DNA +
hypotes + hook + `docs/copy-regler.md`, och tre-frågorstestet redovisas.
Går det inte: lämna creativen till nästa runda.

## Steg 4 — Uppladdning till Meta

Ett anrop per godkänd creative:

```bash
# En av de fyra skalningsprodukterna (står i products.json):
node tools/notion-till-meta.mjs \
  --produkt <id> --namn <annonsnamn> --fil <sökväg> \
  --primar "..." --rubrik "..." --lank <produktsidans url> --aktivera

# Alla andra produkter — kampanj-id:t kommer från leveranskon.mjs:
node tools/notion-till-meta.mjs \
  --kampanj <kampanj-id> --namn <annonsnamn> --fil <sökväg> \
  --primar "..." --rubrik "..." --lank <produktsidans url> --aktivera
```

`--lank` är **obligatorisk** — verktyget avbryter utan den. Notion-raden bär
produktsidans URL i fältet `Landing page`, och `leveranskon.mjs` skriver ut den.
Utan den skulle annonsen peka på butikens startsida, vilket aldrig syns som ett
fel — bara som usel konvertering.

`--kampanj` kontrollerar att kampanjen ligger i MagiBorsten innan något skrivs —
kontospärren gäller lika hårt där.

Verktyget bär spärrarna som inte får kringgås:

- Endast MagiBorsten `1867947880635861`. Sida och Instagram-konto **ärvs från
  kampanjens befintliga annonser** — kopieras aldrig in för hand. Fel sida/pixel
  bokför köpen på fel verksamhet, och det syns aldrig som ett felmeddelande.
- Adset väljs på konceptkoden i annonsnamnet, aktiva och nyaste först. Saknas
  ett: nytt adset klonas ur ett befintligt i samma kampanj (targeting, pixel,
  optimering) — **aldrig egen budget**, budgeten bor på kampanjen i en CBO.
- Allt skapas PAUSED. `--aktivera` slår på annonsen, och adset/kampanj **bara
  om lifetime-spend är exakt 0 kr**. **PAUSED med spend > 0 är ett beslut**
  (Axels, skalningsrondens eller åtgärdstrappans) och rörs aldrig — oavsett hur
  namnet ser ut. *(Incident 2026-08-29/30: ett namnsvep slog på ett dussin
  manuellt avstängda kampanjer, flera olönsamma.)*
- Dubblettspärr på annonsnamn i hela kontot — samma creative laddas aldrig upp
  två gånger.

**De sex spärrarna, och exakt vad var och en skyddar mot:**

| # | Spärr | Skyddar mot |
|---|-------|-------------|
| 0 | Vägrar kampanj som är PAUSED med spend > 0 | Att creatives begravs i en avvecklad kampanj |
| 1 | Bara konto `1867947880635861`, annars avbryt | Att Grillklinikens pengar går åt Bäverbutikens annonser |
| 2 | Sida och pixel ärvs ur kampanjens egna annonser | Att köp bokförs på fel verksamhet — det syns aldrig som ett fel, bara som konstig data |
| 3 | `--kampanj` kontrollerar att kampanjen ligger på MagiBorsten | Att en creative hamnar i en annan verksamhets konto |
| 4 | Dubblettspärr på annonsnamn i hela kontot | Att samma creative laddas upp igen nästa natt |
| 5 | Allt skapas PAUSED, alltid | Att något börjar spendera halvbyggt |
| 6 | `--aktivera` rör bara det körningen SJÄLV skapat | Att en byggd men aldrig launchad kampanj börjar spendera |

Spärr 6 är den som kostade förra gången. **Spend > 0 betyder att någon stängt av
den med flit** — Axel, skalningsronden eller åtgärdstrappan. Det syns inte i
någon metadata, så spenden är enda säkra testet.

Torrkör med `--torr` om något ser fel ut. Fungerar inte uppladdningen (Metas
uppladdning är ibland avstängd för kontot): notera creativen och ta den nästa
natt — hitta aldrig på att den ligger uppe. Raden står kvar i `To be Reviewed`
och kommer med i nästa körning av sig själv.

Skriv en kommentar i Notion-raden med kampanj-, adset- och annons-id så
managern ser var creativen hamnade. Statusen rörs inte — uppladdade rader
lämnas i `To be Reviewed` åt managern.

## Steg 5 — Kvot och rapporter

1. **Kvoten** (mål nr 1): `node pipeline/quota.mjs log <produkt-id> <antal>` per
   produkt, sedan `node pipeline/quota.mjs` — visa plus/minus-läget. Committa och
   pusha `products/products.json` till `main` ("Notionrundan YYYY-MM-DD: N creatives").

2. **Räkna de döda raderna.** Rader som stått i `To be Reviewed` i mer än 24 timmar
   utan att ha laddats upp är arbete som håller på att försvinna. Ta med antalet som
   en egen rad i rapporten, varje natt, även när det är noll.

3. **Discord — två kanaler, två olika saker** (Axels beslut 2026-09-02):

   **`#problem-and-revisions-ads`** — ETT meddelande per annons med problem.
   Enkelt språk: vilken annons, vad som var fel, vad som hände (stoppad /
   tillbaka till Draft). Sedan ett meddelande per **övrigt problem** rutinen
   stötte på: Notion gick inte att läsa, Meta vägrade en uppladdning, en produkt
   saknar kampanj, ett prefix saknar alias. Inget problem får bara stå i chatten.
   ```bash
   DISCORD_CHANNEL_NAME=problem-and-revisions-ads node tools/notify-discord.mjs "⚠️ Enginecover_PD_31_H1 — priset i bild 799 kr, sidan säger 599 kr. Stoppad, kommentar i Notion."
   ```
   Inga problem = inget meddelande i den kanalen.

   **`#ads-launching`** — briefen över hela körningen: hur många rader som
   lästes och ur vilka hubbar, varje creative som laddades upp (namn, produkt,
   kampanj), varje anmärkning på video som ändå gick upp, de döda raderna, och
   kvotläget. Skickas **varje natt**, även när inget levererats.
   ```bash
   DISCORD_CHANNEL_NAME=ads-launching node tools/notify-discord.mjs "<hela briefen>"
   ```

   Misslyckas ett skick: en rad i chattrapporten, aldrig under "Väntar på Axel".

4. **Slutrapport i chatten (mobilformat — Axel läser den som push-notis).**
   **FÖRSTA RADEN är hela rapporten för mobilen.** Max 12 ord, börjar med ✅
   eller ⚠️. Exempel:
   - `✅ 3 nya annonser uppe och rullar, inget väntar på dig`
   - `⚠️ 2 uppe, 1 bild tillbaka till Draft — redigeraren ser det i Notion`
   - `✅ Inget nytt levererat i natt`

   Sedan max 5 korta rader på vanlig svenska: vad som laddades upp per produkt,
   vad som stoppades och varför, i en mening var. Inga tabeller, inga id:n.
   Tekniska detaljer allra sist under en enda rad `Detaljer:` — inklusive
   **varje statusändring med namn + gammal→ny status**, i Meta och i Notion.

   Inget levererat och inget att åtgärda = hela rapporten är en rad.

**"Väntar på Axel" är en skyddad rubrik.** Där får bara stå riktiga ägarbeslut
(pris, budget, ny målnivå). ALDRIG: Notion-behörigheter, Metas uppladdningsstrul,
redigerarfel (de går till `#problem-and-revisions-ads`) eller något rutinen
löser själv nästa natt.

## DEFINITION OF DONE
- [ ] Kön hämtad ur Notion: alla creative hubs, status `To be Reviewed`, video och bild
- [ ] Notion faktiskt läst (annars: larmet högst upp i rapporten, och i `#problem-and-revisions-ads`)
- [ ] Rader döda i `To be Reviewed` >24h räknade och rapporterade
- [ ] Hela Bäverbutiken täckt, inte bara de fyra i products.json
- [ ] Leveranser utan kampanj i kontot rapporterade, inte uppladdade på en gissning
- [ ] Priset läst från Shopify-produktsidan för varje creative med pris i bild
- [ ] `qa-frames.py` körd på VARJE creative, video som bild — inget stickprov
- [ ] Varje frame läst, och QA-raden ifylld per creative mot dess egen brief
      (eller uttryckligen: briefen gick inte att läsa, och varför)
- [ ] Varje fynd utpekat med frame-nummer och sekund (eller plats i bilden)
- [ ] Ingen creative med prisavvikelse > 20 % uppladdad
- [ ] Varje bild med problem: kommentar i Notion + status → `Draft`, inte uppladdad
- [ ] Varje stoppad video: kommentar i Notion, status orörd
- [ ] Uppladdade i rätt produkts kampanj, sida/pixel ärvd, inget med spend > 0 rört
- [ ] Inga creatives lagda i en avvecklad kampanj (PAUSED med spend) — bara rapporterade
- [ ] Kvoten loggad + nytt läge visat + pushad
- [ ] Ett meddelande per problem i `#problem-and-revisions-ads`
- [ ] Körningens brief skickad till `#ads-launching`
- [ ] Slutrapport i mobilformat i chatten
