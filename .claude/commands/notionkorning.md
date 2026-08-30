# /notionkorning — daglig leveransrunda för Bäverbutiken (00:01)

Rutinen som körs varje natt kl 00:01 svensk tid. Ett jobb: **allt redigerarna
levererat ska QA:as mot sin brief och ligga uppe i Meta samma natt.**

Blanda inte ihop den med `/nattkorning` — den är Temu-launcher från Drive.
Den här rundan rör bara de fyra skalningsprodukterna på MagiBorsten.

Kör alla steg klart utan att invänta godkännande mellan dem. **Oavsett hur många
leveranser som ligger klara kollas alla** — noll är ett giltigt utfall, inte ett fel.

## Torrläge — `/notionkorning --torr`

Skrivs `--torr` (eller "torrkör", "provkör", "utan att ladda upp") körs **steg 0
till 3 fullt ut och steg 4 stannar före varje skrivning.** Ingenting skapas,
ingenting aktiveras, ingenting kommenteras i Notion, kvoten loggas inte och
inget pushas.

Leverera i stället en tabell: per creative vilken produkt och kampanj den skulle
hamna i, vilket adset (befintligt eller nyskapat), QA-utfallet, och om den skulle
laddas upp eller stoppas. Sista raden: **exakt vilka statusändringar som skulle
gjorts**, med namn och gammal→ny status.

Verktygen har samma läge: `node tools/notion-till-meta.mjs … --torr`.
Torrläget är alltid säkert att köra — använd det vid minsta tvekan.

## Axels beslut 2026-08-30 (styr hela rutinen — ändra inget av detta på egen hand)

1. **Klar = levererad fil i Drive som saknar annons i Meta.** Två källor, två
   olika jobb — blanda dem aldrig:
   - **Vad som SKA laddas upp** avgörs av redigerarnas leveransmappar i Drive.
   - **Vad som REDAN ÄR gjort** avgörs av annonsnamnen i MagiBorsten.
   Notion-status styr ingenting. *(Verifierat 2026-08-30: ingen av de fyra
   hubbarna använder `To be Reviewed` — allt hoppar direkt till `Approved`, och
   `Filer och media` är tomt på samtliga rader. Notion bär briefen, inte filen.)*
2. **Notion används till briefen** som QA:n i steg 2 mäts mot. Rutinen ändrar
   aldrig Notion-status — det är managerns beslut.
3. **Uppladdning sker i produktens aktiva CBO** (`campaign_ids[0]` i
   `products.json`) — inte i ett test-ABO. Detta är ett **uttryckligt undantag
   från regel 11 i CLAUDE.md**, fattat av Axel 2026-08-30. Rätta inte tillbaka
   det och föreslå inte test-ABO varje natt; ta upp det bara om datan blir
   oläsbar (nya annonser svälter bredvid en skalad vinnare) — då i en mening
   i rapporten, en gång.
4. **Grön QA aktiveras direkt.** Rutinen väntar inte på att Axel slår på.
   Röd QA = annonsen laddas inte upp alls.

## Så hänger kedjan ihop

```
Drive: Edited Folder / Week N / <annonsnamn> / <annonsnamn>.mp4
                                      │
                    creative_prefix i products.json
                                      ↓
              produkt  →  campaign_ids[0]  (CBO i MagiBorsten)
                                      ↑
        Notion-hub: item med samma namn  →  briefen som QA:n mäts mot
```

| Prefix | Produkt | Notion-hub |
|--------|---------|------------|
| `Enginecover_` | `motorholjet` | Boat cover 420D creative hub |
| `Trimmerbelt_` | `axelbaltet` | Trimmer belt creative hub |
| `Seatcover_` | `satesoverdragaren` | Mower seat creative hub |
| `Beachslippers_` | `strandtofflorna` | Beach crocs creative hub |

Prefixen bor i `products/products.json` (`creative_prefix`) — läs dem därifrån.
Leveransmappar med andra prefix tillhör produkter utanför detta OS och **rörs aldrig.**
Notion-titlar bär ibland ett suffix (`Beachslippers_PD_2_8 – COPY ONLY: …`) —
matcha alltid på annonsdelen före tankstrecket.

## Steg 0 — Läs in läget

- `products/products.json` — de fyra med `creative_prefix`. **Citera aldrig
  budget eller break-even ur minnet, läs filen.**
- `docs/copy-regler.md`, `docs/naming-convention.md`, produktens `products/<id>/dna.md`.
- Rutinen ärver inga MCP-connectors. Drive läses via publika länkar och Meta via
  `META_ACCESS_TOKEN` — båda fungerar utan connector. **Notion kräver antingen
  Notion-MCP:n eller `NOTION_TOKEN`** (se steg 2).
- Frame-uttaget i steg 2 kräver `imageio-ffmpeg` och `pillow`. Saknas de:
  `pip install imageio-ffmpeg pillow` en gång i början av körningen.

## Steg 1 — Hämta kön

```bash
node tools/leveranskon.mjs            # allt som väntar, per produkt
node tools/leveranskon.mjs --alla     # även det som redan ligger uppe
node tools/leveranskon.mjs --json     # maskinläsbart
```

**Rutinen täcker HELA Bäverbutiken, inte en fast lista produkter.** Nya produkter
tillkommer ständigt (Axels påpekande 2026-08-30), så kopplingen leverans → kampanj
härleds ur kontot självt: annonserna i MagiBorsten lär verktyget vilket
annonsprefix som hör till vilken kampanj. `Rodholder_` → Fiskespöhållaren,
`Balteslipmaskin_` → Bälteslipmaskinen, och så vidare — **46 prefix i dag, utan
en rad konfiguration.** `creative_prefix` i `products.json` är bara en explicit
override för de fyra skalningsprodukterna.

En hårdkodad produktlista missar nya leveranser **tyst**, och en tyst missad
leverans är värre än en rapporterad. Bygg därför aldrig tillbaka den.

Tre utfall per leverans, och de behandlas olika:

| Utfall | Vad rutinen gör |
|---|---|
| Kampanj hittad, **PAUSED** | Ladda upp. Annonsen hamnar bakom en avstängd kampanj och spenderar noll. |
| Kampanj hittad, **ACTIVE** | Ladda upp — men den **börjar spendera direkt vid aktivering**. QA:n måste vara helt grön, utan undantag. |
| **Ingen kampanj** i kontot | Produkten är inte launchad. **Ladda inte upp, gissa aldrig en kampanj.** Rapportera raden. |

En leveransmapp utan mediafil är **inte klar** — lista den under "väntar på
redigeraren" och gå vidare.

**⚠️ Nödbroms.** Väntar fler än **10** leveranser, eller skulle körningen ladda
upp i fler än **3 olika kampanjer** på en natt: **stanna, ladda inte upp något**,
och lista i rapporten exakt vilka leveranser och kampanjer det gällde. En kö som
plötsligt svämmar över betyder oftast att en prefixkoppling gått fel, inte att
redigerarna haft en rekordnatt. *(Samma logik som nödbromsen i `/nattkorning`
steg 1 — den regeln finns för att ett svep en gång slog på ett dussin
avstängda kampanjer.)*

Ladda ner varje creative till scratchpad via export-URL:en verktyget skriver ut.
Radera media mellan produkterna.

## Steg 2 — Brief-kontrollen (den hårda grinden)

**Ingen creative lämnar det här steget utan att ha granskats bild för bild mot
sin egen brief. Video och bild, varenda en, varje natt.** Axels regel
2026-08-30: stämmer den inte med briefen lanseras den inte. Grinden är gratis —
det enda som kostar är att låta en felaktig annons börja spendera.

### 2a. Hämta briefen

Briefen ligger som sidinnehåll i Notion-itemet med samma namn:

```bash
node tools/notion-klara.mjs --produkt <id>          # hitta itemet + dess page-id
node tools/notion-klara.mjs --brief <page-id>       # dumpa briefen som text
```

Är Notion-MCP:n ansluten går det lika bra därigenom. **Finns varken MCP eller
`NOTION_TOKEN`:** säg det rakt ut i rapporten, kör bara de punkter nedan som inte
kräver briefen (5–8, 10–12), och ladda **bara** upp de creatives som klarar dem.
Låtsas aldrig att briefen kontrollerats.

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

| # | Punkt | Var | Stoppfel? |
|---|-------|-----|-----------|
| 1 | Hooken i briefen är hooken i bild | frames 0–3 s | ✅ ja |
| 2 | Formatet stämmer (UGC / before-after / comparison …) | hela | ✅ ja |
| 3 | Vinkeln stämmer (pain / benefit / social …) | hela | ✅ ja |
| 4 | Alla scener/beats i briefen finns med | hela | ⚠️ nej — notera |
| 5 | Priset stämmer mot **produktsidan i Shopify just nu** | all inbränd text | ✅ ja |
| 6 | Förbjudna priser: `509 kr`, `636 kr`, `"20 %"` | all inbränd text | ✅ ja |
| 7 | "Bäverbutiken" rättstavat ("väverbutiken" har hänt) | all inbränd text | ✅ ja |
| 8 | Rätt produktnamn | all inbränd text | ✅ ja |
| 9 | Svenska manusraderna = briefens rader (inte omskrivna) | all inbränd text | ⚠️ nej — notera |
| 10 | Annonsnamnet följer `docs/naming-convention.md` | filnamn | ✅ ja |
| 11 | **Filnamnet i mappen = mappnamnet** | Drive | ✅ ja |
| 12 | Å, Ä, Ö renderar korrekt i all text | hela | ✅ ja |
| 13 | Rabattclaim mot jämförpriset | text | ❌ inte stoppfel — se nedan |

Punkt 11 finns för att det redan hänt: mappen `Enginecover_SO_25_H1` innehåller
filen `Enginecover_SP_25_H1.mp4`. Då vet vi inte vilken brief creativen hör till
— fråga redigeraren, ladda inte upp på en gissning.

**Briefens egna hårda regler väger lika tungt som tabellen.** Varje brief har ett
`Hard rules`-block och ofta en `COPY GATE` med spärrade formuleringar — till
exempel att *"innan lagret tar slut"* är förbjudet medan *"så länge lagret
räcker"* är tillåtet, eller att en produkt aldrig får kallas vattentät. **Ett
brott mot briefens egna regler är ett stoppfel**, även om det inte står i
tabellen ovan. Briefen är normativ för sin egen annons.

**Rabattclaim som inte stämmer ändras aldrig i annonsen** (Axels policy
2026-08-29) — jämförpriset höjs i stället så claimen stämmer:
`node tools/shopify-fix-compareat.mjs --product-id <id> --rabatt <procent>`.
Rapportera ändringen.

### 2d. Redovisa

En QA-tabell per creative: ✅/❌ per punkt. **Varje ❌ ska peka ut var det sitter**
— frame-nummer och sekund för video, plats i bilden för statiska. Ett fynd utan
plats är inte ett fynd, det är en gissning, och det duger inte som grund för att
stoppa någons arbete.

Ett ❌ på en stoppfelspunkt = creativen laddas **inte** upp. Skriv då en kommentar
i Notion-itemet med konkret feedback (vad, var, vad som ska bli i stället) och ta
med raden i redigerarnotisen i steg 5.

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
  --primar "..." --rubrik "..." [--beskrivning "..."] --aktivera

# Alla andra produkter — kampanj-id:t kommer från leveranskon.mjs:
node tools/notion-till-meta.mjs \
  --kampanj <kampanj-id> --namn <annonsnamn> --fil <sökväg> \
  --primar "..." --rubrik "..." [--beskrivning "..."] --aktivera
```

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
  två gånger. Det är också det som gör rutinen säker att köra varje natt.

**De sex spärrarna, och exakt vad var och en skyddar mot:**

| # | Spärr | Skyddar mot |
|---|-------|-------------|
| 1 | Bara konto `1867947880635861`, annars avbryt | Att Grillklinikens pengar går åt Bäverbutikens annonser |
| 2 | Sida och pixel ärvs ur kampanjens egna annonser | Att köp bokförs på fel verksamhet — det syns aldrig som ett fel, bara som konstig data |
| 3 | Bara mappar med känt `creative_prefix` | Att produkter utanför detta OS launchas av misstag |
| 4 | Dubblettspärr på annonsnamn i hela kontot | Att samma creative laddas upp igen nästa natt |
| 5 | Allt skapas PAUSED, alltid | Att något börjar spendera halvbyggt |
| 6 | `--aktivera` rör bara det med 0 kr lifetime-spend | Att en medvetet avstängd kampanj slås på igen |

Spärr 6 är den som kostade förra gången. **Spend > 0 betyder att någon stängt av
den med flit** — Axel, skalningsronden eller åtgärdstrappan. Det syns inte i
någon metadata, så spenden är enda säkra testet.

Torrkör med `--torr` om något ser fel ut. Fungerar inte uppladdningen (Metas
uppladdning är ibland avstängd för kontot): notera creativen och ta den nästa
natt — hitta aldrig på att den ligger uppe.

⚠️ **Ligger produktens kampanj PAUSED med spend > 0** rör rutinen den inte.
Annonsen skapas då bakom en avstängd kampanj och spenderar ingenting. Det är
rätt beteende — men skriv en rad om det i rapporten så Axel vet.

Skriv en kommentar i Notion-itemet med kampanj-, adset- och annons-id så
managern ser var creativen hamnade.

## Steg 5 — Kvot, redigerarnotis, rapport

1. **Kvoten** (mål nr 1): `node pipeline/quota.mjs log <produkt-id> <antal>` per
   produkt, sedan `node pipeline/quota.mjs` — visa plus/minus-läget. Committa och
   pusha `products/products.json` till `main` ("Notionrundan YYYY-MM-DD: N creatives").
2. **Redigerarnotis** — bara det som är redigerarnas (röd QA, saknad fil,
   filnamn som inte matchar mappen): ETT sakligt engelskt meddelande via env
   `SLACK_WEBHOOK_URL`. Slack-connectorn får användas först efter verifiering:
   sök "bäver" — noll träffar = fel workspace, avstå. Inga @-pingar.
   Infrastrukturproblem går aldrig till teamet.
3. **Slutrapport (mobilformat — Axel läser den som push-notis).**
   **FÖRSTA RADEN är hela rapporten för mobilen.** Max 12 ord, börjar med ✅
   eller ⚠️. Exempel:
   - `✅ 3 nya annonser uppe och rullar, inget väntar på dig`
   - `⚠️ 2 uppe, 1 stoppad på fel filnamn — redigeraren notifierad`
   - `✅ Inget nytt levererat i natt`

   Sedan max 5 korta rader på vanlig svenska: vad som laddades upp per produkt,
   vad som stoppades och varför, i en mening var. Inga tabeller, inga id:n.
   Tekniska detaljer allra sist under en enda rad `Detaljer:` — inklusive
   **varje statusändring med namn + gammal→ny status.**

   Inget levererat och inget att åtgärda = hela rapporten är en rad.

   Skicka alltid samma text till Discord:
   ```bash
   node tools/notify-discord.mjs "<hela rapporten>"
   ```
   Misslyckas skicket: en rad i chattrapporten, aldrig under "Väntar på Axel".

**"Väntar på Axel" är en skyddad rubrik.** Där får bara stå riktiga ägarbeslut
(pris, budget, ny målnivå) och redigerarfel som inte kunnat skickas till teamet.
ALDRIG: Notion-behörigheter, Metas uppladdningsstrul, eller något rutinen löser
själv nästa natt.

## DEFINITION OF DONE
- [ ] Leveranskön hämtad — Drive mot kontot, inte mapplistan ensam
- [ ] Hela Bäverbutiken täckt, inte bara de fyra i products.json
- [ ] Nödbromsen respekterad (>10 leveranser eller >3 kampanjer = stanna)
- [ ] Leveranser utan kampanj i kontot rapporterade, inte uppladdade på en gissning
- [ ] `qa-frames.py` körd på VARJE creative, video som bild — inget stickprov
- [ ] Varje frame läst, och QA-tabellen ifylld per creative mot dess egen brief
      (eller uttryckligen: briefen gick inte att läsa, och varför)
- [ ] Varje ❌ utpekat med frame-nummer och sekund (eller plats i bilden)
- [ ] Briefens egna hard rules / COPY GATE kontrollerade, inte bara tabellen
- [ ] Ingen creative med stoppfel uppladdad
- [ ] Uppladdade i rätt produkts CBO, sida/pixel ärvd, inget med spend > 0 rört
- [ ] Feedback skriven i Notion-itemet på varje stoppad creative
- [ ] Kvoten loggad + nytt läge visat + pushad
- [ ] Slutrapport i mobilformat, skickad till Discord
