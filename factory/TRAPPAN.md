# Trappan — från testad produkt till egen butik med egen redigerare

**Axels modell, 2026-09-09.** Detta är den övergripande arbetsdelningen mellan
Bäverbutiken och OPS-butikerna. Den står över `PROCESS.md` (hur en butik byggs)
och `FAS2.md` (hur den får annonser) — de beskriver HUR, den här beskriver NÄR.

## Rollbytet

| | Förr (till 2026-09-09) | Nu |
|---|---|---|
| **Bäverbutiken** | huvudscenen: all creative strategy, skalning, briefs | **ren testbädd** |
| **OPS-butiken** | en sidogren för bevisade vinnare | **där all creative strategy sker** |

Bäverbutiken kör hädanefter bara: testbatchen, BOF-bilder efter testet, och
eventuellt lite UGC. Inga nya vinklar, ingen skalningsloop, inga stora batcher.
Allt kreativt arbete därefter hör hemma på produktens egen OPS-butik.

⚠️ **Fällan i det här:** testdata från Bäverbutiken är INTE direkt överförbar.
En generalbutik konverterar sämre per produkt än en fokuserad OPS-butik med
paket, bonus och eget brand. En produkt som gör 1,8 i ROAS på Bäverbutiken kan
göra mer på sin egen butik. Tröskeln för "vinnare" ska därför sättas LÄGRE på
Bäverbutiken än den känns rimlig — annars dödas produkter som hade funkat.

## Trappan

### Steg 1 — Test på Bäverbutiken
Testbatch enligt `/ny-produkt`. BOF-bilder efter testet. Eventuellt UGC.
Ingen creative strategy-loop, ingen skalning. Målet är EN fråga: bär produkten?

### Steg 2 — Tröskeln passerad → egen OPS-butik
Går produkten tillräckligt bra byggs en OPS-butik med `/ny-ops`, och annonserna
förs över med `/ny-annonser`. Bäverbutikens roll för produkten är därmed slut.

⚠️ **Tröskeln är inte spikad än** — se "Öppna beslut" nedan.

### Steg 3 — Låg skala: all-around-redigerarna
De befintliga redigerarna (Josh, Annabelle, Gilz, Carl, Jasper) gör annonser åt
OPS-butikerna vid sidan av sitt vanliga arbete. Ingen är dedikerad, ingen ny
anställs. En redigerare kan täcka flera butiker i det här läget.

### Steg 4 — Över 5000 kr/dag → egen redigerare
Passerar en OPS-butik **5000 kr/dag i budget** anställs en dedikerad redigerare
för just den butiken. Då — och först då — startar rekryteringen
(`factory/rekrytering/`), Discord-kanalerna får sin person, och butiken får sin
egen creative-loop.

Det är också därför standby-poolen inte hålls varm med pengar: behovet
uppstår vid en mätbar tröskel, inte i förväg.

⚠️ 5000 kr/dag är dessutom brytpunkten i `pipeline/quota.mjs` där testandelen
växlar från 20 % till 10 % — samma tal, av en anledning. En butik som passerar
den producerar tillräckligt mycket creative för att motivera en egen person.

## Vad det betyder för systemet

- **Skalningsrutinen** — kravspec i **`factory/SKALNINGSKUNGEN.md`**,
  byggordning i **`factory/SKALNINGSKUNGEN-PLAN.md`** (kärnan fryst). Två
  lägen i samma rutin: TEST (bevaka tröskeln på Bäverbutiken, inga briefs) och
  SKALA (full creative-loop på OPS-butiken). Den är inte längre en sidogrej — den
  blir HUVUDloopen, en instans per OPS-butik. `/cs` mot Bäverbutikens produkter
  fasas ut i takt med att produkterna får egna butiker.
- **Kvoten** (mål nr 1) flyttar med: den räknas per OPS-butik, inte per
  Bäverbutiks-produkt.
- **Produktminnet** (`products/<id>/dna.md`, `batch-log.md`, `backlog.md`)
  följer med produkten till dess OPS-butik — den bevisade historiken är det
  mest värdefulla en ny butik ärver.
- **Commission** måste se OPS-kontot (i dag filtreras `915422744950975` bort som
  utländskt) innan steg 4 kan ge någon betalt. Se `FAS2.md` uppdrag D.

## Flerproduktsbutik

Vissa produkter med samma målgrupp ska dela en butik (första fallet:
Fiskespöhållaren + Fiskekalendern). Underlaget står i
**`factory/FLERPRODUKT.md`** — butiksbygget är billigt, men den delade pixeln
gör kill-beslut systematiskt fel om varje produkt inte får en EGEN kampanj och
ett EGET `creative_prefix`.

## Öppna beslut

1. **Vad är "tillräckligt bra" i steg 2?** Förslag att bedöma: X köp till en CPA
   under break-even över Y dagars spend. Talen är inte satta. Kom ihåg fällan
   ovan — sätt lägre än det känns.
2. **Hur många OPS-butiker kan en all-around-redigerare bära i steg 3** innan
   kvaliteten faller? Mät på den första, gissa inte.
