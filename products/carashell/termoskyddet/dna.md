# Creative DNA — CaraShell (termoskyddet)

Skapad 2026-09-16 av `/ops-produkt carashell` (körning nr 0 — bygget, ingen briefrond).
**Senast uppdaterad 2026-09-17 av nattvakten, körning nr 1 (första briefronden — KALLSTART).**
Egen data: 636 kr / 2 köp / ROAS 1,76 på 3 dygn, **0 bedömbara annonser** — inga
mönster ur egen data än; allt nedan är fortfarande ÄRVT. Batch #2 (7 briefer) i
`batch-log.md`. Nästa avläsning 2026-09-20.

⚠️ **Utmappen är `factory/output/carashell/termoskyddet/`** (sedan 2026-09-17,
`utmapp()` i `factory/register.mjs`) — inte `factory/output/carashell/`, som är
takskyddets. Innan delningen läste `ops-bild --namn` takskyddets analysfil som
termoskyddets kontonamn, och båda nattvakterna skrev samma `budgetrond-<datum>.json`.

⚠️ **Shopify-nyckel för CaraShell saknas i rutinens miljö** (mätt 2026-09-17:
inget `SHOPIFY_*_CARASHELL`). Pixelvarningen nedan går därför inte att lösa i
rutinen förrän nyckeln finns — ingen dom fälls här innan dess.

**A/B fable/sonnet (ställning):** batch #2 = 4 fable / 3 sonnet, 0 bedömbara.
Avgörs automatiskt när båda har ≥ 5 bedömbara annonser (regel i `/notionscalercs` steg 6).
Butiks-id `carashell`, nyckel `carashell/termoskyddet`, brand **CaraShell**, carashell.se/products/termoskyddet.
Annonskonto: **MagiBorsten DK `915422744950975`** (det delade OPS-kontot). Prefix **`CaraShellFront`**.
Systerprodukt: `carashell/takskyddet` (`CaraShellRoof`) — se `products/carashell/README.md`.

⚠️ **All prestandadata nedan är ÄRVD från Bäverbutiken.** CaraShells egna kampanjer
`CARASHELL_SE_Termoskydd Husbil 211 × 171 cm` och `CARASHELL_NO_…` byggdes 2026-09-16
och står **PAUSED** tills Axel skriver "Launch". **0 kr spend, 0 köp, 0 bedömbara.**
Butiken är en **KALLSTART** för den här produkten.

⚠️ **Pixeln är delad med takskyddet.** Metas Purchase-event bär ingen produkt, så ett
köp av takskyddet (1 129 kr) kan bokföras på termoskyddets kampanj och tvärtom.
Prisavståndet är 2×. **Döm aldrig en annons här på pixelns CPA ensam** — läs köp per
produkt ur Shopify (`factory/FLERPRODUKT.md`) och skriv i rapporten att du gjort det.

---

## Produkten och kunden

Utvändigt termoskydd för husbilens vindruta och båda sidorutorna, 211 cm bred,
171 cm över mitten, 90 cm sidflikar. Flikarna kläms fast i dörrkarmen, dörrarna
behöver inte öppnas, håller i blåst. Mörklägger hela framvagnen.

**Kunden:** husbilsägare 45–70 som sover i bilen på rastplatser, ställplatser och
campingar. Säger "kupén", "framrutan", "ställplats", "imma". Har provat invändiga
gardiner och vet att imman ändå sitter kvar på morgonen.

**Grundkonflikten (typ A):** invändig gardin mot utvändigt skydd. Imman sitter på
insidan därför att glaset blir kallt; ett skydd innanför glaset kan inte ändra det,
ett skydd utanpå gör det. Tre scener: imma att torka bort varje morgon, trettio grader
i kupén före frukost, insyn på rastplatsen.

⚠️ **Aldrig påstå:** material, vikt, isolervärde, förvaringspåse, "tusentals
husbilsägare", "verifierad kund", 30 dagars öppet köp (butiken: 14 dagars ångerrätt),
tidsbegränsad rabatt ("idag", "lagret minskar"). Bilderna 2 och 3 i källan är
AI-illustrationer och märks så i alt-texten.

---

## Vad som är bevisat (ÄRVT — källa: Bäverbutiken, avläst 2026-09-16)

Konto `1867947880635861` (**LÄSES bara**), prefix `Termoskydd`, hela livstiden.
Källkampanj: `Termoskyddet för Husbil 211 × 171 cm | BE ROAS 1.61 | Launch 2026-09-11`.
**16 annonser · 7 013 kr spend · 40 köp · samlad ROAS 3,25.**
4 bedömbara (≥ 300 kr OCH ≥ 3 köp), 12 under grinden. Dömda mot termoskyddets
linje (BE-CPA 347 kr, `inkopskostnad` härledd ur källans "BE ROAS 1.61").

### Per vinkel (ÄRVD, hela livstiden)

| Vinkel | Kod | Spend | Köp | CPA | Andel spend | Dom |
|---|---|---:|---:|---:|---:|---|
| Erbjudandet — "rabatterat pris bara idag" | CS | 5 513 kr | 31 | **178 kr** | 79 % | **Bevisad i källan** — men manuset är falsk brådska som CaraShell inte kör |
| Social proof — vittnesmål i vi-form | SP | 1 338 kr | 9 | **149 kr** | 19 % | **Bevisad i källan** — bästa CPA; vittnesmålet är uppläst av en icke-kund |
| Presenten | G | 115 kr | 0 | — | 2 % | Under grinden |
| Problemet — imma/hetta/insyn | PD | 46 kr | 0 | — | 1 % | Under grinden — fick aldrig chansen |

### Toppannonserna (ÄRVD, rangordnade på vinstbidrag mot termoskyddets linje)

| Ärvd annons | Typ | Spend | Köp | CPA | ROAS | Vinstbidrag | CTR | CPC |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| `Termoskydd_CS_3` | video | 4 430 kr | 21 | 211 kr | 2,74 | **2 856 kr** | 4,64 % | 3,21 kr |
| `Termoskydd_CS_2` | video | 550 kr | 8 | 69 kr | 8,13 | **2 224 kr** | 4,17 % | 4,70 kr |
| `Termoskydd_SP_2` | video | 755 kr | 5 | 151 kr | 3,70 | **980 kr** | 3,56 % | 4,27 kr |
| `Termoskydd_SP_2_1` | **bild** | 520 kr | 4 | 130 kr | 4,30 | **868 kr** | **7,04 %** | **2,19 kr** |

Under grinden (ingen dom): `CS_2_1` 471 kr/2 köp · `G_1` 91/0 · `CS_1` 78/0 ·
`SP_1` 36/0 · `PD_2` 33/0 · `SP_3` 28/0 · `G_2` 9/0 · `G_3` 7/0 · `G_2_1` 7/0 ·
`PD_1` 6/0 · `PD_3` 5/0 · `PD_2_1` 2/0.

Norge (ÄRVD, Magiborsten NO `1050941584152547`, `Frontrutetrekk til Bobil NO |
BE-ROAS 1,62 | 2026-09-12`): 16 annonser, 3 222 NOK, 9 köp. `NO_CS_1` 1 880 NOK/5 köp,
`NO_SP_2_1` (bild) 797 NOK/3 köp, `NO_SP_1` 47 NOK/1 köp, övriga under 300 NOK.

---

## Mönstren

**Mönster 1 — källans köp sitter i ett manus CaraShell inte får använda (BEVISAD, ärvd).**
CS bär 31 av 40 köp, och alla CS-videor läser upp "rabatterat pris bara idag, lagret
minskar snabbt, beställ innan det är slut". Det är samma falska brådska som togs bort
hos HeimGuard och takskyddet. Rabattsatsen i sig är sann (559 mot jämförpris 932 =
40 %), brådskan är det inte. → **Instruktion:** CS-vinkeln ska testas hos CaraShell
med sanna villkor (pris, jämförpris, fri frakt, 14 dagars ångerrätt) och utan "idag".
Om den då tappar är det brådskan som sålde, inte erbjudandet — det är ett svar värt
att ha.

**Mönster 2 — CBO-svälten, fjärde gången (BEVISAD, ärvd).** CS fick 79 % av spenden,
PD 1 %. Källans PD-videor har ren produktmekanik och är de enda som kunde kopieras —
och de har aldrig spenderat mer än 33 kr. CaraShells kampanj är **CBO** (den låsta
OPS-strukturen), så svälten kan upprepas — PD ligger i ett eget adset men får budget
efter Metas tycke. Läs spend per adset vid varje avläsning; är PD under 300 kr efter
en vecka är den fortfarande odömd, inte dålig. Ärvd data säger ingenting om PD.

**Mönster 3 — bilden slog videon i SP (HYPOTES, ärvd, 1 annons).** `SP_2_1` (bild) har
bäst CPC (2,19 kr) och högst CTR (7,04 %) i hela källkontot och CPA 130 kr mot
videons 151 kr. Samma riktning som takskyddets mönster 3/6 (bild replikerar på en
visuell, statisk produkt). → Bild ska ha en rejäl andel av varje batch.

**Mönster 4 — hook-raden "Svalt på sommaren, varmt på vintern, mörkt när du sover"
återkommer i alla CS/G-videor (HYPOTES).** Tre ord, tre scener, ingen brådska — den
delen av manuset är sann och bevisad tillsammans med brådskan. Ett nytt CS-manus
bör bygga på den raden, inte på "prisfall".

---

## Vad CaraShell ändrade mot källan — och varför datan inte är rakt jämförbar

1. **Videorna som kopierades (PD_1–3, SE + NO) fick sista repliken bortklippt**
   ("Termoskydd husbil från Bäverbutiken", ~2,5 s, uppläst OCH inbränd) —
   ffmpeg, noll krediter, rösten orörd. Videon slutar nu på "Kolla måtten innan du
   beställer." / "Sjekk målene før du bestiller." Ingen brandreplik alls. Axel kan
   välja HeyGen-omdubb med "från CaraShell" i stället (~20 krediter/video).
2. **Bilderna PD_2_1 och G_2_1 kopierades orörda** (inget brand, pris eller villkor).
3. **CS_2_1 och SP_2_1 (båda marknader) byggdes om samma kväll:** kie.ai tog bort
   källans text (falsk brådska, påhittad attribution, "30 dagars öppet köp") och
   `factory/bild-text.py` lade butikens rubrik, priskort 559/932 (NO 548/685) och
   citatkort med riktigt namn. QA före/efter i `bildfix/*.qa.png`.
4. **De nio CS/SP/G-videorna per marknad omdubbades samma kväll** (HeyGen, nytt manus
   per vinkel av sonnet-subagent med copy-reglerna, proofread → apply-srt → render,
   `rostkoll.py` grönt på alla, ny captionbana med `no-captions.py`). Manusen ligger i
   `factory/output/termoskyddet/omdubb/{se,no}/`.
   **Samma kväll bytt till ElevenLabs** (Axel lyssnade på HeyGen-klonen och dömde ut
   den): samma manus (`omdubb/heygen-cues/*-ny.srt`), rösten `Martin - Warm, Confident
   and Relatable` (SE) resp. `Martin - Clear and Comforting` (NO, norsk), ingen musik,
   och **videon omtajmad per klipp** med `pipeline/omdubb/elevenlabs-omdubb.mjs` så
   repliken styr klipplängden. Videorna är 0–7 s längre än källan (SP 20–23 s, CS/G
   16–19 s). Alla 18 är annonserna som ligger i kampanjerna nu (de 18 HeyGen-annonserna
   raderades, PAUSED/0 kr). Uttalet är maskinkollat (Scribe mot manus), inte lyssnat.
5. **Copyn (PD, G) kopierades ordagrant** — bara länken byttes.
6. **Priset rördes inte.** 559 / 932 kr. Norge: 548 / 685 NOK (fast pris i prislistan).

---

## Ekonomin

Pris **559 kr** · jämförpris 932 kr · inköp **212 kr** (HÄRLEDD ur "BE ROAS 1.61",
inte kvitterad — Axel sköter COGS) ⇒ TB 347 kr · **BE-ROAS 1,61 · BE-CPA 347 kr ·
target-ROAS 2,70 · target-CPA 207 kr**, räknat **UTAN moms**
(`moms_antagen: false` i `factory/produkter/termoskyddet.yaml`).

---

## Nuläget i CaraShells eget konto (2026-09-17, nattvakten körning nr 1)

Båda kampanjerna **ACTIVE sedan 2026-09-16** (Axels "Launch" 12:20 SE / 12:50 NO).
SE last_14d: 636 kr, 2 köp, ROAS 1,76 — grinden ej passerad av någon annons.
Spend per adset i CBO:n: G-bilden `G_2_1` tog 232 kr (37 %) utan köp, `CS_2_1`
96 kr med båda köpen; PD_1–3 sammanlagt 45 kr — mönster 2 (CBO-svälten) är
redan synligt efter tre dygn, så PD är fortfarande odömd. Budgetronden gjorde
0 ändringar. Batch #2: 5 bilder till `To be Reviewed` (live 14:15), 2 videor i
`Draft` utan redigerare.

## Nuläget vid bygget (2026-09-16)

`CARASHELL_SE_Termoskydd Husbil 211 × 171 cm | BE-ROAS 1.61 | 2026-09-16`
(`120249115376140172`) — **PAUSED**, **CBO 1 000 kr/dag** (den låsta strukturen,
regel i `/ny-annonser` steg 8 — inte regel 11:s test-ABO), fyra adsets utan egen
budget: `CARASHELL_SE_PD` (4), `_G` (4), `_CS` (4), `_SP` (4) = **16 annonser**,
hela källkampanjen. 9 videor omdubbade med nytt manus (HeyGen, 2026-09-16 kväll),
3 PD-videor med brandrepliken bortklippt, 2 bilder orörda, 2 bilder ombyggda.
`CARASHELL_NO_Termoskydd Husbil 211 × 171 cm | BE-ROAS 1.61 | 2026-09-16`
(`120249115382210172`) — **PAUSED**, samma struktur, `CaraShellFront_NO_*`, länk
`/nb/products/termoskyddet?country=NO` (NOK 548 verifierat i kundvyn).
Räkningen per marknad: `factory/output/termoskyddet/rakningen.md`.

**Mönster 1 är redan testbart utan brief:** CS-videorna ligger uppe med sanna
villkor (pris, jämförpris, fri frakt, 14 dagars ångerrätt) och utan "idag". Första
avläsningen svarar på om brådskan eller erbjudandet sålde i källan. Mönster 2
(CBO-svälten) gäller igen — kampanjen är CBO, så läs spendfördelningen per adset
innan någon vinkel döms. Den viktigaste briefen är fortfarande ett **eget CS-manus**
byggt på hook-raden i mönster 4, inte på "prisfall".

## Marknader

| Datum | Marknad | Locale | Valuta i kundvyn (mätt) | Pris i produktfilen | Leveranstid | Läge |
|---|---|---|---|---|---|---|
| 2026-09-16 | NO | nb | NOK (fast pris, satt av ops-produkt-sessionen) | 548 NOK / jämförpris 685 | 5–10 virkedager | NO-kampanj PAUSED tills Axel skriver "Launch" |
| 2026-09-16 | **US** | en | **USD, fast pris** — mätt som amerikansk kund 07:20: **$99.00**, jämförpris $124.00, paket $168.30 / $237.60. (Före raden, 07:05: Shopifys egen omräkning $59.00 / $98.00.) | **99 USD / jämförpris 124** — Axels beslut 2026-09-16 ("OK TERMOSKYDDET SKA KOSTA 99 DOLLAR"), svar på `/ny-marknad`-rapportens fråga (alternativen: 59 = kursen, 99 = samma påslag som takskyddet 1,72×). Jämförpriset 25 % över, som NOK och takskyddet | 5–10 business days | `/en/products/termoskyddet` svarar 200 som amerikansk kund, 0 svenska markörer, `prislista` ✅ (samma prislista `PriceList/33459372364` som takskyddet). Sales tax AV, Shopify Payments USD och frakten till USA bekräftade av Axel 2026-09-16 (samma som takskyddet); recensionerna översätts av Judge.me (Awesome, påslaget 2026-09-16, upp till 48 h — PROCESS.md punkt 12). ✅ Verifierat 2026-09-17 ~09:30 UTC på `carashell.com/products/termoskyddet` i headless Chrome från amerikansk IP: "Customer Reviews · 20 reviews · Write a review", texterna på engelska ("Practical protection from the sun and heat.") med "Show original (Swedish)" och en rad "Show original (Norwegian)". US-kampanj `120251442339640435` (`CARASHELL_US_Termoskydd Husbil 211 × 171 cm`) byggd 2026-09-16 eftermiddag av `/ops-oversatt … --marknad US`-körningen — PAUSED, CBO 1 000 kr/dag, adsets CS/G/PD/SP, 0 annonser; `annonsmarknader` NO,US. Ingen US-rutin (byggs på claude5 med `/notionscalercs setup carashell/termoskyddet`). USA-sidan sedan samma eftermiddag på **carashell.com** ($99.00, 90-dagars garanti, hello@carashell.com) |
| 2026-09-17 | **GB, CA, AU, NZ** (i USA-marknaden) | en | **Lokala valutor, omräknade från de fasta USD-priserna** — mätt som kund per land 13:30 UTC: **£76 / C$142 / A$143 / NZ$177** | Inget eget pris: Shopifys omräkning av 99 USD (se takskyddets rad) | 5–10 business days (delad en-rad) | Samma block som takskyddet (PROCESS.md punkt 22). 🖐 UK: £76 ligger under £135-gränsen ⇒ brittisk moms ska tas i kassan och kräver UK-momsregistrering (gov.uk 2026-09-17) — ägarens beslut innan termoskyddet säljs till UK. Frakt, engelska och garanti som takskyddet |
| 2026-09-20 | **DK** | da | **DKK, fast pris** — mätt som dansk kund (POST /localization DK/da + `?country=DK`): `html lang="da"`, `"currency":"DKK"`, **409,00 kr / 679,00 kr**, paketnivåerna 347,65 / 695,30 osv. | **409 DKK / jämförpris 679** — Axels beslut 2026-09-20 ("ett snäpp högre, kanske 10 %"): 559 × 0,66204 × 1,10 → x9. Jämförpriset följer HÄR den svenska sidans rabatt (40 %), inte 25 %-regeln som NOK/USD/EUR bär — den svenska sidan är källan | 5–10 hverdage | Samma marknadsblock som takskyddet: Danmark ACTIVE, basvaluta DKK via API, locale `da`, prislistan "CaraShell DKK" (delad med takskyddet, 10 fasta priser totalt). 0 svenska markörer av 16 på /da. 🖐 Judge.me → Settings → Language → Refresh list (konfigen säger fortfarande `locale: "en"`). Ingen DK-kampanj byggd |
