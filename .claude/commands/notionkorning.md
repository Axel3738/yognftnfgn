# /notionkorning — daglig leveransrunda för Bäverbutiken (00:01)

Rutinen som körs varje natt kl 00:01 svensk tid. Ett jobb: **allt redigerarna
levererat ska QA:as mot sin brief och ligga uppe i Meta samma natt.**

Blanda inte ihop den med `/nattkorning` — den är Temu-launcher från Drive.
Den här rundan rör bara de fyra skalningsprodukterna på MagiBorsten.

Kör alla steg klart utan att invänta godkännande mellan dem. **Oavsett hur många
leveranser som ligger klara kollas alla** — noll är ett giltigt utfall, inte ett fel.

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

## Steg 1 — Hämta kön

```bash
node tools/leveranskon.mjs            # allt som väntar, per produkt
node tools/leveranskon.mjs --json     # samma sak maskinläsbart
```

Verktyget läser Drive publikt, hämtar alla annonsnamn i kontot och visar
skillnaden. En leveransmapp utan mediafil är **inte klar** — lista den under
"väntar på redigeraren" och gå vidare.

Ladda ner varje creative till scratchpad via export-URL:en verktyget skriver ut.
Radera media mellan produkterna.

## Steg 2 — Brief-kontrollen (grinden — gratis, gör den alltid komplett)

Briefen ligger som sidinnehåll i Notion-itemet med samma namn:

```bash
node tools/notion-klara.mjs --produkt <id>          # hitta itemet + dess page-id
node tools/notion-klara.mjs --brief <page-id>       # dumpa briefen som text
```

Är Notion-MCP:n ansluten går det lika bra att hämta itemet därigenom.
**Finns varken MCP eller `NOTION_TOKEN`:** säg det rakt ut i rapporten, kör bara
de punkter i tabellen nedan som inte kräver briefen (5–8, 10, 11), och ladda
bara upp de creatives som klarar dem. Låtsas aldrig att briefen kontrollerats.

Dra frames ur videon och läs ALL inbränd text (`imageio-ffmpeg` via pip om
ffmpeg saknas). Jämför levererad creative mot sin egen brief:

| # | Punkt | Stoppfel? |
|---|-------|-----------|
| 1 | Hooken i briefen är hooken i de första 3 sekunderna | ✅ ja |
| 2 | Formatet stämmer (UGC / before-after / comparison …) | ✅ ja |
| 3 | Vinkeln stämmer (pain / benefit / social …) | ✅ ja |
| 4 | Alla scener/beats i briefen finns med | ⚠️ nej — notera |
| 5 | Priset stämmer mot **produktsidan i Shopify just nu** | ✅ ja |
| 6 | Förbjudna priser: `509 kr`, `636 kr`, `"20 %"` | ✅ ja |
| 7 | "Bäverbutiken" rättstavat i all inbränd text ("väverbutiken" har hänt) | ✅ ja |
| 8 | Rätt produktnamn | ✅ ja |
| 9 | Svenska manusraderna = briefens rader (inte omskrivna) | ⚠️ nej — notera |
| 10 | Annonsnamnet följer `docs/naming-convention.md` | ✅ ja |
| 11 | **Filnamnet i mappen = mappnamnet** | ✅ ja |
| 12 | Rabattclaim mot jämförpriset | ❌ inte stoppfel — se nedan |

Punkt 11 finns för att det redan hänt: mappen `Enginecover_SO_25_H1` innehåller
filen `Enginecover_SP_25_H1.mp4`. Då vet vi inte vilken brief creativen hör till
— fråga redigeraren, ladda inte upp på en gissning.

Briefen bär dessutom egna hårda regler (`Hard rules`, `COPY GATE`, spärrade
formuleringar som *"innan lagret tar slut"*). **De räknas som stoppfel** även om
de inte står i tabellen — briefen är normativ för sin egen annons.

**Rabattclaim som inte stämmer ändras aldrig i annonsen** (Axels policy
2026-08-29) — jämförpriset höjs i stället så claimen stämmer:
`node tools/shopify-fix-compareat.mjs --product-id <id> --rabatt <procent>`.
Rapportera ändringen.

Leverera en QA-tabell: ✅/❌ per creative med **exakta fynd** (vad, var i filen,
vilken sekund). Ett ❌ på en stoppfelspunkt = creativen laddas **inte** upp.

**Röd QA:** skriv en kommentar i Notion-itemet med den konkreta feedbacken
(vad, var, vad som ska bli i stället) och ta med raden i redigerarnotisen i steg 5.

## Steg 3 — Ad copy ur briefen

Primärtext, rubrik och beskrivning tas **rakt av ur briefens COPY CARD**.
Saknas de: skriv dem inte själv i huvudsessionen — modellpolicyn (regel 6 i
CLAUDE.md) gäller, en subagent med `model: "sonnet"` skriver dem utifrån DNA +
hypotes + hook + `docs/copy-regler.md`, och tre-frågorstestet redovisas.
Går det inte: lämna creativen till nästa runda.

## Steg 4 — Uppladdning till Meta

Ett anrop per godkänd creative:

```bash
node tools/notion-till-meta.mjs \
  --produkt <id> --namn <annonsnamn> --fil <sökväg> \
  --primar "..." --rubrik "..." [--beskrivning "..."] --aktivera
```

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
- [ ] Varje leverans QA:ad mot sin egen brief — tabell med exakta fynd levererad
      (eller uttryckligen: briefen gick inte att läsa, och varför)
- [ ] Ingen creative med stoppfel uppladdad
- [ ] Uppladdade i rätt produkts CBO, sida/pixel ärvd, inget med spend > 0 rört
- [ ] Feedback skriven i Notion-itemet på varje stoppad creative
- [ ] Kvoten loggad + nytt läge visat + pushad
- [ ] Slutrapport i mobilformat, skickad till Discord
