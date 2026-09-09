# Skalningskungen — ombyggnadsplanen

**Skriven 2026-09-09** efter en avläsning av den KÖRANDE rutinen, inte av
repots dokument. Läs `TRAPPAN.md` för när, den här filen för vad och hur.

---

## ⚠️ Rättelse först: Skalningskungen finns redan och kör varje dag

`factory/FAS2.md` uppdrag E sa *"Den finns inte. Verifierat med `git log --all
--diff-filter=A -- .claude/commands/*`"*. **Det är fel.** Avläst 2026-09-09
mot Routines-API:t och grenen:

| | |
|---|---|
| Rutin | **"Skalnings kungen"** `trig_016ocyXom7XxCJKHHyfkaQWC` |
| Schema | `30 5 * * *` UTC = **07:30 svensk tid**, varje dag |
| Kommando | `.claude/commands/rond-auto.md` |
| Gren | **`claude/daily-agent-discussion-uos5df`** — inte `main` |
| Motor | `agent/rond.mjs` (667 rader) + `agent/besked.mjs` (454) + `agent/logg.mjs` |
| Minne | `agent/budgetlogg.jsonl` — 374 rader. Pushen ÄR minnet. |
| Karta | `agent/produktkarta.json` |
| Konton | SE `1867947880635861` **och** NO `1050941584152547` |

**Varför ingen hittade den:** `agent/` och `rond-auto.md` finns bara på grenen.
`main` nämner rutinen på en enda rad i CLAUDE.md, och då bara som *ägare av
PAUSED-beslut*. En session som läser `main` drar slutsatsen att rutinen inte
finns — och bygger en ny, konkurrerande rutin mot samma annonskonto.

**Det är den farligaste bristen i repot just nu.** Två rutiner som båda ändrar
budget i `1867947880635861` skulle skriva över varandra, och kadensspärren
(högst en ändring var tredje dag) räknas ur en budgetlogg som bara den ena
skriver i.

⚠️ Bygg därför **aldrig** en ny `/skalningskungen`-rutin. Den här planen bygger
om den som finns.

---

## Vad den gör i dag — två jobb i samma körning

**Jobb A — pengarna (SE + NO).** Läser Meta, kör `agent/rond.mjs`, och utför
planen: höj, sänk, stäng av, åtgärdstrappan. All matematik ligger i kod, aldrig
i modellen. Spärrar: golv 500 kr, tak 4 000 kr, max 20 % åt gången (utom
raketspåret ROAS ≥ 5), högst en ändring var tredje dag, ingen dom under 300 kr
spend eller 3 köp, kontospärr, öre-verifiering med tillbakaläsning.

**Jobb B — annonserna (bara SE).** `annonsbehov` i `agent/rond.mjs` flaggar
vilka produkter som ska ha nytt material, och rutinens steg 4b kör dem:

| Behov | Utlöses av | Kör |
|---|---|---|
| `forsta_batch` | **1 500 kr total spend OCH ≥ 20 % vinst**, ingen batch ännu | `/forsta-batch` |
| `brief_runda` | har batch, senaste `*_KLAR` ≥ 3 dagar gammal | `/cs` |
| `ersatt` | annonser pausade i trappan senaste veckan | `/cs` |
| `mata_vinnare` | ≥ 2 höjningar på en vecka | `/cs` |

Norge får aldrig briefer — norska annonser är svenska annonser översatta via
`/translate-no` (Axels besked 2026-09-01).

**Tröskeln är alltså redan byggd och testad.** Den heter
`FORSTA_BATCH_SPEND_SEK = 1500` och `FORSTA_BATCH_VINST_PROCENT = 20` i
`agent/rond.mjs`, och `vinstProcent` räknas i `agent/besked.mjs`. Ingen ny
tröskel behöver uppfinnas — den ska bara peka på ett nytt utfall.

---

## Regel nummer ett: kärnan rörs inte

Axels ord 2026-09-09: *"Jag vill inte tappa skillet den har för creative
strategy, för den gör nått sjukt — och du gillar att ändra och pilla på
grejer."*

| Fryst | Var | Vad |
|---|---|---|
| Beslutsmotorn | `agent/besked.mjs`, `agent/rond.mjs`, `agent/logg.mjs` | All matematik. Zoner, kadens, trappa, spärrar. |
| Analysmetoden | `docs/os/ANALYSMETOD.md` | Steg 0–7 + snabbchecklistan |
| Kärnloopen | `.claude/commands/cs.md` steg 2–5 | Feedbackloop → batch → modellpolicy → logg |
| Leveransformatet | `.claude/commands/forsta-batch.md` | Briefmallen, manustabellerna |
| Copy-reglerna | `docs/copy-regler.md` | Tre-frågorstestet på varje rad |
| Budgetloggen | `agent/budgetlogg.jsonl` | Minnet. Aldrig redigerad i efterhand. |
| Notion-regeln | `rond-auto.md` 4b | Hubben klonas ur `Creative hub MALL`, aldrig byggd från noll |
| Statusspärren | `rond-auto.md` 4b | Ingen brief till en pausad kampanj. Någonsin. |

Ombyggnaden ändrar **vilken typ av annons som beställs** och **vad som händer
vid tröskeln**. Den rör inte en rad i matematiken.

---

## Axels fyra beslut 2026-09-09

### 1. DDP — allt räknas utan moms
Verksamheten säljer DDP. Marginal och break-even räknas rakt på priset, precis
som Bäverbutiken redan gör (`factory/validera.mjs` skriver "utan moms —
marginal rakt på priset"). `moms_i_pris: true` i `factory/butiker/*.yaml` styr
butikens prisvisning och får **aldrig** användas för att dra av moms i en
break-even-beräkning. Ett momsavdrag gör lönsamma annonser till förluster på
papperet, och felet syns inte som ett felmeddelande.

### 2. Bäverbutiken producerar bara bildannonser
Skalningskungen tas **inte** bort från Bäverbutiken. Jobb A (pengarna) fortsätter
oförändrat på båda marknaderna. Jobb B ändras: brief-rundorna på Bäverbutiken
beställer bara **bildannonser**. Bilder kostar nästan ingenting och tar ingen
redigerartid, så testandet kan fortsätta i efterhand. Video och full creative
strategy hör hemma på OPS-butiken.

⚠️ Det står i direkt konflikt med dagens `rond-auto.md` 4b, som kräver *"minst
två tredjedelar av varje batch är video"*. Den meningen ska skrivas om, inte
tolkas bort.

### 3. Produktminnet duplicerar — det flyttar inte
`dna.md`, `batch-log.md` och `backlog.md` kopieras till OPS-butiken och ligger
kvar på Bäverbutiken också. Ingenting raderas. Bäverbutiken fortsätter köra sin
egen loop med sitt eget minne.

⚠️ Från kopieringsdagen är det två minnen som driver isär. Skriv överst i
kopian varifrån den kom och vilket datum, annars kan ingen senare avgöra vilket
tal som gäller vilken butik.

### 4. Startskottet är ett meddelande
När tröskeln passeras skickar rutinen ett meddelande till Axel eller VA:n: bygg
OPS-butiken och lansera den. Rutinen bygger aldrig butiken själv.

---

## Ombyggnaden — sju steg

Varje steg är klart när dess "Klart när" stämmer. Nästa steg börjar inte förrän
förra är pushat.

### Steg 0 — Gör systemet synligt från `main` ✅ GJORT 2026-09-09
Utan det här bygger nästa session en konkurrerande rutin igen.

- ✅ `CLAUDE.md`: rutinen står i nattrutinstabellen och har ett eget
  varningsblock — den finns, den kör 07:30, den bor på grenen
  `claude/daily-agent-discussion-uos5df`, och den ändrar budgetar på riktigt.
- ✅ `factory/FAS2.md` uppdrag E: det falska "Den finns inte" struket och rättat.
- 🖐 **Kvar till Axel:** ska `agent/` merge:as till `main`? Rutinens
  trigger-prompt checkar ut grenen explicit, så en merge utan att prompten
  ändras gör ingen skada — men två kopior av `budgetlogg.jsonl` som båda tar
  emot rader vore ett tyst dataras. Slå ihop bara om prompten ändras i samma
  vända.

**Klart när:** en session som bara läser `main` får veta att rutinen finns,
innan den föreslår att bygga en. ✅

### Steg 1 — Bäverbutikens batcher blir bild
Skriv om `rond-auto.md` 4b: på Bäverbutiken beställs bara bildannonser.
`rundaAntal` ur `agent/rond.mjs` gäller fortfarande som antal — bara formatet
byts. BOF-serien och review-bilderna (Axels två extra serier) är redan bild och
står kvar oförändrade.

⚠️ Review-bilderna byggs på **riktiga** recensioner ur produktsidan eller
Judge.me, citatet ordagrant. Finns inga recensioner: inga review-bilder, och
skriv det i leveransen.

**Klart när:** en körning har levererat en runda utan en enda videobrief, och
`agent/`-testerna är gröna.

### Steg 2 — Tröskeln pekar på startskottet
`forsta_batch`-behovet är i dag "bygg en full batch på Bäverbutiken". Det ska
bli "**skjut startskottet**" — och en bildbatch, inte en videobatch.

Ändringen är liten och ligger i `annonsbehov`: samma villkor
(`FORSTA_BATCH_SPEND_SEK` 1 500 kr, `FORSTA_BATCH_VINST_PROCENT` 20 %), nytt
behovsutfall. Rör inte talen; de är Axels och de är testade.

🖐 **Axels beslut som saknas:** ska tröskeln för OPS ligga på samma nivå som
`forsta_batch`, eller lägre? `TRAPPAN.md` varnar för att sätta den för högt —
en generalbutik konverterar sämre per produkt än en fokuserad OPS-butik. Tills
beslutet finns: använd samma tal och skriv i rapporten att nivån är oförändrad.

**Klart när:** en produkt som passerar tröskeln får ett startskott i loggen och
ingen videobatch.

### Steg 3 — Startskottet
`factory/startskott.mjs` formaterar meddelandet och skickar det via befintliga
`agent/discord-post.mjs` (kanal `larm` eller egen kanal) eller
`tools/notify-discord.mjs`. **Ingen ny notisinfrastruktur.** Meddelandet skrivs
enligt Axels svarsformat: kort, en mening per rad, numrerade saker att göra, och
`/ny-ops <källänk>` färdigt att klistra in. Det bär produktnamn, källänk, spend,
köp, CPA, break-even och vinstprocent.

Skriptet sätter samtidigt en rad i budgetloggen med en egen kod
(`OPS_STARTSKOTT`), idempotent — en andra körning skickar inte om meddelandet.

✅ **Byggt 2026-09-09 som `factory/startskott.mjs` + 19 tester.** Den formaterar
meddelandet och loggraden, men skickar ingenting och skriver ingenting — därför
går den att koppla in från vilken gren som helst. Inkopplingslistan står som
kommentar sist i filen.

⚠️ **Loggraden får aldrig bära `ny_budget`.** Kontrollerat mot `agent/logg.mjs`:
`dagarSedanAndring` räknar bara rader med `genomford: true` och ett ändligt
`ny_budget`. Läggs fältet till blir startskottet en budgetändring i
kadensspärrens ögon, och kampanjen fryses i tre dygn utan att någon rört
budgeten. `arAvstangd`, `annonsbehov`s KLAR-lista och `senasteRadMedKod` läser
alla uttryckliga kodlistor och är säkra som koden ser ut i dag.

⚠️ Discord-poster läses av det engelsktalande teamet. Startskottet går till
**Axel eller VA:n**, så det får vara svenska om det landar i en kanal bara de
läser — annars engelska. Bestäm kanalen innan koden skrivs.

**Klart när:** `--torr` visar meddelandet, testerna är gröna, en skarp körning
har landat i rätt kanal, och koden syns i budgetloggen.

### Steg 4 — Ekonomiblocket per OPS-produkt, utan moms
`factory/produkter/<id>.yaml` får `break_even_cpa_sek`, `break_even_roas`,
`target_cpa_sek`, `target_roas`, `aov_sek`. Räknas från grunden på butikens
eget pris, marginal rakt på priset. Varje tal får källa och datum i kommentar.

⚠️ AOV är inte priset när butiken säljer paket, och butikerna har ingen
försäljning än. Skriv enhetspriset som **antagande**, tydligt märkt, och byt
till verklig AOV ur Shopify så snart det finns order.

🖐 HeimGuards pris är satt (799 kr, inköp 261 kr). **TankGuard har inget eget
pris i repot** — break-even kan inte räknas förrän det finns.

**Klart när:** HeimGuards block är ifyllt med visad uträkning och TankGuards
saknade tal står som en tydlig TODO.

### Steg 5 — Egen instans per OPS-butik
En kopia av rutinen per butik, var tredje dag, med butikens konfig. Skillnaden
mot Bäverbutikens instans: annonskontot är `915422744950975`, alla format är
tillåtna, och hubben ligger i butikens eget teamspace.

⚠️ **Prefixfiltret är obligatoriskt.** `915422744950975` bär alla OPS-butiker
**och** Bäverbutikens danska kampanjer, med Bäverbutikens DK-sida
`1324465810740336` och pixel `1554276343018184`. Utan filter på produktens
`creative_prefix` läser rutinen fel verksamhets annonser som om de vore samma
produkt. `creative_prefix` ska dessutom stå per **produkt**, aldrig per brand
(`FLERPRODUKT.md`, fällan 1).

⚠️ **Fast molnsession.** `create_session` med repot som källa och rätt utgren,
sedan `create_trigger` med `persistent_session_id`. Aldrig "ny session varje
gång". Kör `list_triggers` före bygget — en dubblett skapades av misstag
2026-09-08.

**Klart när:** första schemalagda körningen har pushat sitt produktminne själv.

### Steg 6 — Notion-teamspace per butik
Eget teamspace per OPS-butik (Axels beslut 2026-09-09). Hubben klonas ur
`Creative hub MALL` `3cc270ab-908c-8005-a50e-db6b1b179794` — aldrig byggd från
noll, då blir statusarna svenska och hubben hamnar utanför teamspacet.

⚠️ Teamspacet skyddar ingenting i koden. `hittaHubbar()` i
`tools/notion-kalla.mjs` söker utan sökterm och tar varje databas
integrationen ser. Skyddet måste ligga i ett register, inte i teamspacet.

⚠️ Åtkomsten ärvs från mallen och går inte att sätta via API:t. Ligger mallen
privat blir varje ny hub privat. Och `<ancestor-path>` duger inte som diagnos —
det gav ett falskt larm 2026-09-05. Misstänker du att en hub ligger privat:
fråga Axel, påstå inget.

**Klart när:** hub-id står i butiksfilen och en testbrief syns i hubben.

---

## Ett fel att titta på, utan att röra det

Morgonens körning 2026-09-09 står som **FAILED** (07:37–07:43 svensk tid).
Budgetjobbet hann klart: 14 loggrader för SE och 8 för NO, och pushar gick
igenom fram till 07:48. Men **ingen `CS_BATCH_KLAR` skrevs den 9:e** — jobb B,
brief-rundorna, blev inte av. Föregående dag skrevs fyra.

Det betyder att creative-halvan av Skalningskungen tappade en dag. Orsaken är
inte utredd här. Kön är byggd så att ett behov utan `*_KLAR`-rad flaggas igen
nästa morgon, så inget är förlorat — men händer det ofta står redigerarna utan
material utan att någon ser det.

🖐 **Axel:** värt en egen titt. Det är en observation från en körning, inte en
diagnos.

---

## Vad som INTE ingår

- Ingen ny analysmetod, inga nya metrik, ingen ny brieffmall.
- Ingen ändring i beslutsmotorns matematik.
- Ingen ny rutin vid sidan av den som finns.
- Ingen ändring i kvällens `/bildannonser`-rutin.
- Inget raderas ur Bäverbutikens produktminne.

## Öppna beslut — det Axel ska ta ställning till

1. Ska OPS-tröskeln ligga på `forsta_batch`-nivån (1 500 kr + 20 %) eller lägre?
2. Vilken kanal ska startskottet till — Axel, VA:n, eller båda?
3. Ska `agent/` merge:as till `main`, eller stanna på grenen?
4. TankGuards eget pris — utan det går break-even inte att räkna.
