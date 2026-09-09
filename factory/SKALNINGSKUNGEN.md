# Skalningskungen — kravspec

**Vad det är:** den dagliga rutinen som läser annonsdatan, ändrar budgetarna,
och beställer nya brief-rundor.

⚠️ **Den finns redan och kör varje morgon.** Den här filen beskrev tidigare en
rutin som skulle byggas från noll. Det var fel. Omskriven 2026-09-09 efter en
avläsning av den körande rutinen. Ombyggnadsplanen står i
**`SKALNINGSKUNGEN-PLAN.md`**.

| | |
|---|---|
| Rutin | "Skalnings kungen" `trig_016ocyXom7XxCJKHHyfkaQWC` |
| Schema | `30 5 * * *` UTC = **07:30 svensk tid**, varje dag |
| Kommando | `.claude/commands/rond-auto.md` |
| Gren | `claude/daily-agent-discussion-uos5df` — **inte `main`** |
| Motor | `agent/rond.mjs`, `agent/besked.mjs`, `agent/logg.mjs` |
| Minne | `agent/budgetlogg.jsonl`. Pushen ÄR minnet. |
| Konton | SE `1867947880635861` · NO `1050941584152547` |

---

## De två jobben

### Jobb A — pengarna (SE och NO)
Läser Meta, kör `agent/rond.mjs`, utför planen: höj, sänk, stäng av,
åtgärdstrappan. All matematik ligger i kod — modellen hämtar siffror och utför,
den räknar aldrig själv.

Spärrarna: golv 500 kr, tak 4 000 kr, max 20 % åt gången (utom raketspåret vid
ROAS ≥ 5), högst en ändring var tredje dag per kampanj, ingen dom under 300 kr
spend eller 3 köp, kontospärr, öre-verifiering med tillbakaläsning, och
livstidsspärren som skyddar en kampanj som tjänat pengar totalt.

**Jobb A ändras inte av den här ombyggnaden.**

### Jobb B — annonserna (bara SE)
`annonsbehov` i `agent/rond.mjs` flaggar vad som behöver material:

| Behov | Utlöses av | Kör i dag |
|---|---|---|
| `forsta_batch` | **1 500 kr total spend OCH ≥ 20 % vinst**, ingen batch ännu | `/forsta-batch` |
| `brief_runda` | har batch, senaste `*_KLAR` ≥ 3 dagar gammal | `/cs` |
| `ersatt` | annonser pausade i trappan senaste veckan | `/cs` |
| `mata_vinnare` | ≥ 2 höjningar på en vecka | `/cs` |

Norge får aldrig briefer — norska annonser är svenska annonser översatta via
`/translate-no` (Axels besked 2026-09-01).

**Jobb B är det som byggs om.**

---

## Ombyggnaden: samma rutin, två lägen

Rutinen kör mot **en butik** och läser butikens läge ur konfigen.

### Läge BILD — Bäverbutiken
Bäverbutiken är testbädd (`TRAPPAN.md`). Jobb A fortsätter oförändrat. Jobb B
beställer **bara bildannonser**.

Bilder kostar nästan ingenting och tar ingen redigerartid, så testandet kan
fortsätta i efterhand utan att kosta något. Video och full creative strategy hör
hemma på OPS-butiken.

Rutinen skriver alltså fortfarande briefs på Bäverbutiken — den slutar bara
beställa video.

⚠️ Det står i konflikt med dagens `rond-auto.md` 4b, som kräver *"minst två
tredjedelar av varje batch är video"*. Den meningen ska skrivas om, inte tolkas
bort.

⚠️ De två extra bildserierna Axel beslutade 2026-09-02 står kvar oförändrade:
**+3 BOF-bilder** och **+2 review-bilder** per batch. Review-bilderna byggs på
riktiga recensioner ur produktsidan eller Judge.me, citatet ordagrant. Finns
inga recensioner: inga review-bilder, och skriv det i leveransen.

### Läge SKALA — OPS-butiken
Produkten har egen butik. Full creative-loop, alla format, butikens egen
Notion-hub i butikens eget teamspace och butikens egen Discord-kanal.

---

## Startskottet

Tröskeln finns redan: `FORSTA_BATCH_SPEND_SEK = 1500` och
`FORSTA_BATCH_VINST_PROCENT = 20` i `agent/rond.mjs`. `vinstProcent` räknas i
`agent/besked.mjs` som vinst i procent av omsättningen — inte som ROAS-marginal.

I dag betyder passerad tröskel "bygg en full batch på Bäverbutiken". Efter
ombyggnaden betyder den:

1. **Meddelande till Axel eller VA:n:** bygg OPS-butiken och lansera den.
   Med siffrorna som motiverar det: spend, köp, CPA, break-even och vinstprocent.
2. **`/ny-ops <källänk>`** färdigt att klistra in.
3. **En rad i budgetloggen** med egen kod (`OPS_STARTSKOTT`), idempotent — en
   andra körning skickar inte om meddelandet.
4. **En bildbatch** på Bäverbutiken, inte en videobatch.

Startskottet är en **rapport, inte en handling**. Rutinen bygger aldrig en butik
själv — VA:n gör det, och hon behöver bara veta att det är dags.

🖐 **Axels beslut som saknas:** ska OPS-tröskeln ligga på samma nivå som
`forsta_batch` (1 500 kr + 20 %) eller lägre? `TRAPPAN.md` varnar för att sätta
den för högt — en generalbutik konverterar sämre per produkt än en fokuserad
OPS-butik med paket, bonus och eget brand. Tills beslutet finns används samma
tal, och rapporten säger att nivån är oförändrad.

---

## Överlämningen

När OPS-butiken är byggd och annonserna körts över med `/ny-annonser`:

1. Butiken får sitt läge (`skala`) i konfigen.
2. **Produktminnet DUPLICERAS.** `dna.md`, `batch-log.md` och `backlog.md`
   kopieras till butikens mapp och **ligger kvar på Bäverbutiken också**.
   Ingenting flyttas bort, ingenting raderas. Bäverbutiken fortsätter köra sin
   egen loop med sitt eget minne.
   ⚠️ Från kopieringsdagen är det två minnen som driver isär. Skriv överst i
   kopian varifrån den kom och vilket datum.
3. De brand-swappade annonserna skrivs in i kopians `batch-log.md` med sina
   bevisade utfall, märkta `ärvd från Bäverbutiken` — annars ser butikens första
   körning tolv annonser utan hypoteser.
   ⚠️ Bäverbutikens tal är HISTORIK, inte facit. Butiken konverterar annorlunda.
4. Butiken får sin egen Notion-hub i sitt **eget teamspace** (Axels beslut
   2026-09-09), klonad ur `Creative hub MALL`
   `3cc270ab-908c-8005-a50e-db6b1b179794` — aldrig byggd från noll.

---

## Egen instans per butik

Varje OPS-butik har sin egen schemalagda körning var tredje dag.

**Måste vara en FAST molnsession** med repot som källa. En rutin som startar ny
session varje gång kan inte pusha — allt den lär sig dör med containern (mätt
tre gånger, står i CLAUDE.md). Kör `list_triggers` före bygget; en dubblett
skapades av misstag 2026-09-08.

Vad som skiljer instanserna åt är bara konfigen:

| Fält | Vad det styr |
|---|---|
| butik | vilken butik körningen gäller |
| läge | `bild` eller `skala` |
| annonskonto | Bäverbutiken `1867947880635861` · OPS `915422744950975` |
| creative_prefix | vilka annonser i kontot som är produktens — **per produkt, aldrig per brand** |
| notion_hub | vart briefsen skrivs |
| kanal | var rapporten landar |
| ekonomi | pris, inköp, break-even-CPA, break-even-ROAS, target-CPA |

⚠️ **Prefixfiltret är obligatoriskt på OPS-kontot.** `915422744950975` bär alla
OPS-butiker **och** Bäverbutikens danska kampanjer, med Bäverbutikens DK-sida
`1324465810740336` och pixel `1554276343018184`. Utan filter läser rutinen fel
verksamhets annonser som om de vore samma produkt.

⚠️ Kontots valuta är **SEK**, inte DKK, trots namnet "Magiborsten DK"
(bekräftat mot Meta 2026-09-09). 1 000 kr/dag = `daily_budget: 100000`.

---

## Vad som måste finnas innan bygget

1. **Systemet synligt från `main`.** Utan det bygger nästa session en
   konkurrerande rutin mot samma annonskonto. Gjort 2026-09-09 i CLAUDE.md och
   `FAS2.md`; se `SKALNINGSKUNGEN-PLAN.md` steg 0.
2. **Ekonomiblocket per OPS-produkt** — räknat **utan moms** (DDP, Axels beslut
   2026-09-09). Marginal rakt på priset, precis som Bäverbutiken.
   Kopiera aldrig ett break-even-tal mellan verksamheterna.
3. **`creative_prefix` per produkt**, inte per brand (`FLERPRODUKT.md`, fällan 1).
4. **Butiksfilter på det gemensamma annonskontot.**
5. **Tröskelbeslutet** — samma nivå som `forsta_batch`, eller lägre.

---

## Det som inte ändras

`docs/os/ANALYSMETOD.md` gäller oförändrad — den är produktagnostisk.
Rangordna på vinstbidrag `(break-even-CPA − CPA) × köp`, aldrig på ROAS eller
CPA ensamt. Signifikansgrind 300 kr spend eller 3 köp. Kill mot break-even,
skalning mot target. Nya tester i separat test-ABO (regel 11).

Beslutsmotorn (`agent/besked.mjs`, `agent/rond.mjs`, `agent/logg.mjs`) rörs
inte. All matematik ligger i kod av ett skäl: tre regler i CLAUDE.md finns för
att en tidigare chatt räknade fel. Ligger räkningen i kod blir svaret detsamma
varje gång och går att testa.

Copyn skrivs av en subagent med `model: "sonnet"` som får `docs/copy-regler.md`.
Huvudsessionen gör strategi och klassificering, aldrig slutgiltig text.

Statusspärren i `rond-auto.md` 4b gäller oförändrad: **ingen brief till en
pausad kampanj, någonsin** — inte ens en som rutinen själv pausade samma morgon.
