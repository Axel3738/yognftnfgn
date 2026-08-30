# /notionkorning — daglig Notion→Meta-runda för Bäverbutiken (00:01)

Rutinen som körs varje natt kl 00:01 svensk tid. Ett jobb: **allt redigerarna
lämnat in i Notion ska QA:as mot sin brief och ligga uppe i Meta samma natt.**

Blanda inte ihop den med `/nattkorning` — den är Temu-launcher från Drive.
Den här rundan rör bara de fyra skalningsprodukternas creative hubs i Notion.

Kör alla steg klart utan att invänta godkännande mellan dem. **Oavsett hur många
tasks som är klara kollas alla** — noll klara är ett giltigt utfall, inte ett fel.

## Axels beslut 2026-08-30 (styr hela rutinen — ändra inget av detta på egen hand)

1. **Klar = Notion-status `To be Reviewed`.** Inte `Approved`. Managern hinner
   inte före uppladdningen, så **rutinens brief-kontroll i steg 2 ÄR grinden.**
   Det innebär att kontrollen ska köras hårt: minsta avvikelse mot briefen
   stoppar den creativen. `Approved` laddas upp om den råkar ha missats.
   `In Review` / `Creative strat review` / `In progress 2` rörs aldrig.
2. **Uppladdning sker i produktens aktiva CBO** (`campaign_ids[0]` i
   `products.json`) — inte i ett test-ABO. Detta är ett **uttryckligt undantag
   från regel 11 i CLAUDE.md**, fattat av Axel 2026-08-30. Rätta inte tillbaka
   det, och föreslå inte test-ABO varje natt; ta upp det bara om datan blir
   oläsbar (nya annonser svälter bredvid en skalad vinnare) — då i en mening
   i rapporten, en gång.
3. **Grön QA aktiveras direkt.** Rutinen väntar inte på att Axel slår på.
   Röd QA = annonsen laddas inte upp alls.

## Steg 0 — Läs in läget

- `products/products.json` — de fyra med `scaling: true` (`motorholjet`,
  `axelbaltet`, `satesoverdragaren`, `strandtofflorna`). Varje produkt har
  `notion.database_id` och `campaign_ids`. **Citera aldrig budget eller
  break-even ur minnet — läs filen.**
- `docs/os/NOTION-FORMAT.md` (statustabellen), `docs/copy-regler.md`,
  `docs/naming-convention.md`, produktens `products/<id>/dna.md`.
- Notion-MCP måste vara ansluten. 404 från en hub betyder **"inte inbjuden"**,
  inte att databasen saknas — skriv det i rapporten och kör vidare på de hubbar
  som svarar. Låtsas aldrig att en hub var tom.

## Steg 1 — Hämta de klara taskarna

Per produkt, läs hubben och filtrera i denna ordning:

1. **Typ** — behåll bara rader vars Typ innehåller `Pending Approval`
   (`Video - Pending Approval`, `Image - Pending Approval`). Filtrera på
   **inkludering, aldrig uteslutning** — annars smyger SOP-, Guideline-,
   Feedback- och `Winning Creative`-sidor in i mätningen.
2. **Status** — behåll `To be Reviewed` (och `Approved`, se beslut 1).
3. **Levererad fil** — itemet måste peka på en färdig mp4/jpg/png (Drive-länk
   eller bifogad fil). Saknas filen är tasken inte klar: lista den under
   "väntar på redigeraren" och gå vidare.

Notion stryps till ~3 anrop/s. Fyra hubbar tar några minuter — det är normalt.

Ladda ner varje creative till scratchpad. Radera media mellan produkterna.

## Steg 2 — Brief-kontrollen (grinden — gratis, gör den alltid komplett)

Briefen ligger som sidinnehåll i samma Notion-item. Jämför **levererad creative
mot sin egen brief**, punkt för punkt. Dra frames ur videon och läs ALL inbränd
text (`imageio-ffmpeg` via pip om ffmpeg saknas).

Kontrollera:

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
| 11 | Rabattclaim mot jämförpriset | ❌ inte stoppfel — se nedan |

**Rabattclaim som inte stämmer ändras aldrig i annonsen** (Axels policy
2026-08-29) — jämförpriset höjs i stället så claimen stämmer:
`node tools/shopify-fix-compareat.mjs --product-id <id> --rabatt <procent>`.
Rapportera ändringen.

Leverera en QA-tabell: ✅/❌ per creative med **exakta fynd** (vad, var i filen,
vilken sekund). Ett ❌ på en stoppfelspunkt = creativen laddas **inte** upp.

**Röd QA:** skriv en kommentar i Notion-itemet med den konkreta feedbacken
(vad, var, vad som ska bli i stället) och ta med raden i redigerarnotisen i
steg 5. Ändra aldrig Notion-status åt något håll — det är managerns beslut.

## Steg 3 — Ad copy ur briefen

Primärtext, rubrik och beskrivning tas **rakt av ur briefen** i Notion-itemet.
Saknas de: skriv dem inte själv i huvudsessionen — modellpolicyn (regel 6 i
CLAUDE.md) gäller, en subagent med `model: "sonnet"` skriver dem utifrån DNA +
hypotes + hook + `docs/copy-regler.md`, och tre-frågorstestet redovisas.
Går det inte: ladda upp med briefens copy eller lämna creativen till nästa runda.

## Steg 4 — Uppladdning till Meta

Ett anrop per godkänd creative:

```bash
node tools/notion-till-meta.mjs \
  --produkt <id> --namn <annonsnamn> --fil <sökväg> \
  --primar "..." --rubrik "..." [--beskrivning "..."] --aktivera
```

Verktyget gör resten och bär spärrarna som inte får kringgås:

- Endast MagiBorsten `1867947880635861`. Sida och Instagram-konto **ärvs från
  kampanjens befintliga annonser** — kopieras aldrig in för hand. Fel sida/pixel
  bokför köpen på fel verksamhet, och det syns aldrig som ett felmeddelande.
- Adset väljs på konceptkoden i annonsnamnet. Saknas ett: nytt adset klonas ur
  ett befintligt i samma kampanj (targeting, pixel, optimering) — **aldrig egen
  budget**, budgeten bor på kampanjen i en CBO.
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

Skriv en kommentar i Notion-itemet med kampanj-, adset- och annons-id så
managern ser var creativen hamnade.

## Steg 5 — Kvot, redigerarnotis, rapport

1. **Kvoten** (mål nr 1): `node pipeline/quota.mjs log <produkt-id> <antal>` per
   produkt, sedan `node pipeline/quota.mjs` — visa plus/minus-läget. Committa och
   pusha `products/products.json` till `main` ("Notionrundan YYYY-MM-DD: N creatives").
2. **Redigerarnotis** — bara det som är redigerarnas (röd QA, saknad fil):
   ETT sakligt engelskt meddelande via env `SLACK_WEBHOOK_URL`. Slack-connectorn
   får användas först efter verifiering: sök "bäver" — noll träffar = fel
   workspace, avstå. Inga @-pingar. Infrastrukturproblem går aldrig till teamet.
3. **Slutrapport (mobilformat — Axel läser den som push-notis).**
   **FÖRSTA RADEN är hela rapporten för mobilen.** Max 12 ord, börjar med ✅
   eller ⚠️. Exempel:
   - `✅ 6 nya annonser uppe och rullar, inget väntar på dig`
   - `⚠️ 4 uppe, 2 stoppade på fel pris — redigerarna notifierade`
   - `✅ Inget nytt inlämnat i natt`

   Sedan max 5 korta rader på vanlig svenska: vad som laddades upp per produkt,
   vad som stoppades och varför, i en mening var. Inga tabeller, inga id:n.
   Tekniska detaljer allra sist under en enda rad `Detaljer:` — inklusive
   **varje statusändring med namn + gammal→ny status.**

   Inget inlämnat och inget att åtgärda = hela rapporten är en rad.

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
- [ ] Alla fyra hubbar lästa (eller 404 rapporterat per hub som inte svarade)
- [ ] Filtrerat på Typ `Pending Approval` genom **inkludering**, inte uteslutning
- [ ] Varje klar task QA:ad mot sin egen brief — tabell med exakta fynd levererad
- [ ] Ingen creative med stoppfel uppladdad
- [ ] Uppladdade i rätt produkts CBO, sida/pixel ärvd, inget med spend > 0 rört
- [ ] Feedback skriven i Notion-itemet på varje stoppad creative
- [ ] Kvoten loggad + nytt läge visat + pushad
- [ ] Slutrapport i mobilformat, skickad till Discord
