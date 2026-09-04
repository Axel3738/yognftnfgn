# Norska produktrecensioner → Judge.me

Kör `/no-recensioner` (`.claude/commands/no-recensioner.md`). Den här filen är
bara lägesrapporten.

## Läget 2026-09-04 — 0 nya, allt redan klart

Rutinkörning 05:35 svensk tid. MAKE TO NORWAY: samma 16 mappar som 2026-09-03,
inga nya produkter. Bygget gav samma 142 rader som igår, `--dry` på alla 17
produkter svarade "har redan synliga recensioner" — inget importerades.

- **Gravsteinspenn**: arket är oförändrat, fortfarande bara "TEST –"-rader.
- **Medisinboks i Lommeformat**: mappen har fått arket
  `Medicinask i Fickformat_REVIEW` (id `1IHyBXyhujgZi4Q3GX5DKVb5pj8jEhGcacFUNVv6BA44`)
  sedan igår. Alla 7 rader har recensentnamn `Exempel N – EJ KUNDRECENSION`
  och titel `Exempelrecension – ej kundrecension`. Det är exempeltext som
  uttryckligen säger att den inte är en kundrecension — **importeras aldrig**.
  Produkten läggs i `sources.json` först när arket har riktiga rader.

## Läget 2026-09-03 — 17 produkter i `sources.json`, 15 klara i Judge.me

Körningen 2026-09-03 (första från den fasta sessionen, alltså första som
pushar) läste 16 undermappar i MAKE TO NORWAY. 12 saknades i `sources.json`;
10 fick ark + verifierat handle och lades till. Importerat i dag: **34 nya**
recensioner på fyra produkter. Sex av de "nya" hade redan recensioner i
Judge.me från de tre tidigare körningarna som aldrig pushade — dubblettspärren
hoppade över dem, precis som den ska.

| Produkt | Synliga | Källa |
|---|---:|---|
| IBC-tanktrekk | 10 | 2026-08-30 |
| Kranbeskyttelse Frost 420D | 10 | 2026-08-30 |
| Sykkelshorts Herre | 8 | 2026-08-30 |
| Kjempefotball | 8 | 2026-08-30 |
| Overvåkingskamera | 10 | 2026-08-30 |
| Gamasjer Tur | 10 | 2026-08-30 |
| Beltesliper Mini | 10 | 2026-08-30 |
| Kamuflasjeteip | 8 | tidigare opushad körning |
| Kast & Fang-sett | 8 | tidigare opushad körning |
| Kryss og Bolle i Tre | 10 | tidigare opushad körning |
| MC-Trekk | 10 | tidigare opushad körning |
| Plysjtøfler Herre | 8 | tidigare opushad körning |
| **Badeshorts med Spøketrykk** | 8 | **2026-09-03** |
| **Klistremerker til Søppeldunken** | 8 | **2026-09-03** |
| **Magnethylle** | 8 | **2026-09-03** |
| **Sysett 104 Deler** | 10 | **2026-09-03** |
| Båtmotortrekk 420D | 1 | se nedan |

Judge.me svarar `201 … processed in background` — recensionerna syns några
minuter efter importen.

### Båtmotortrekk 420D — bara 1 synlig recension

Judge.me har redan **1** synlig recension på produkten, så spärren hoppade
över de 8 färdiga raderna i `output/batmotortrekk.no.csv`. Varifrån den enda
kommer är inte utrett (en riktig kund, eller en avbruten tidigare körning).
Ska de 8 läggas på: Axel säger till, och då körs importen med `--anda`.
Rutinen gör det aldrig själv.

### Överhoppade — kräver Axel

- **Gravsteinspenn** (`Gravstenspenna_Reviews`): arket innehåller bara
  testrader — namnen är "Anna Test", "Lars Test" …, titlarna börjar med
  "TEST –". Inget importeras förrän arket har riktiga rader. Produkten står
  inte i `sources.json`; lägg till den när arket är rättat (handle
  `gravsteinspenn-gjenoppretter-blek-tekst-pa-stein` finns i butiken).
- **Medisinboks i Lommeformat**: Drive-mappen `Medicinask i Fickformat` har
  inget REVIEWS-ark alls (bara adcopy + bilder). Handle
  `medisinboks-i-lommeformat-7-rom-med-tettsittende-lokk` finns i butiken.

### Att veta om arken

- `Motorcycle cover`-mappens ark heter bara **`Motorcycle cover`** — inget
  `_REVIEWS`-suffix, så "rev"-matchningen missar det. Det är ändå ett
  Judge.me-ark med 10 rader och används som källa för `mc-trekk`.
- Sömnadskit-arket har platshållaren `This is a reply by the admin` i
  `reply`. Den är mappad till tom sträng i `translations.no.json`; importen
  skickar inga svar ändå.
- Två svenska produktmappar ligger inte i huvudmappens rot: Badshorts i
  `LOSERS`, Smiley stickers i `WINNERS`. Kolla båda undermapparna innan en
  produkt rapporteras som "saknar mapp".
- Gamasjers källark saknar fortfarande betyg (bygget ratar alla 10 rader).
  Produkten behöver det inte — recensionerna finns redan namngivna i
  Judge.me sedan 2026-08-30. `output/gamasjer.no.csv` är den gamla filen.
- Beltesliper-arket heter `_REVEW` (felstavat); kommandot matchar på "rev".
- `output/beltesliper.no.csv` i repot är **kvittot på det som ligger i
  Judge.me** (namnen Steinar Bjerke, Randi Løvaas … från omkörningen
  2026-08-30). Bygget skriver om filen med standardnamnen (Anne Dahl, Lars
  Vik …) varje gång — den versionen är inte importerad. Committa aldrig den
  ombyggda filen; återställ den med `git checkout -- <fil>` efter bygget.

### Kontrollkörningen 2026-09-03 — två sessioner körde samtidigt

Två sessioner körde `/no-recensioner` parallellt förmiddagen 2026-09-03
(`session_01TzdZVgj95nEMGAjsrfWqcx` importerade de 34 ovan och pushade
`abb59f8`; `session_01V9jWZKyEyJ55W9RPcNPQR5` kom fram till exakt samma
`sources.json`, samma tio CSV:er och samma handles, men hann inte importera
något — spärren svarade "har redan synliga recensioner" på alla tio).
Dubblettspärren höll, inga dubbletter. Den andra sessionens commit kastades
och den här filen byggdes vidare på den första. Rutinen
"Norska recensioner till Judge.me" (`trig_0143SCAzTsLzLn33tk5uTSrW`, 03:30
UTC) är bunden till den första sessionen — den andra var en manuellt startad
kontrollkörning. Starta aldrig en kontrollkörning medan rutinen kan vara
igång: spärren skyddar bara om importerna inte landar i samma minut.

## Dubblettspärr

`judgeme-import.mjs` kollar om produkten redan har synliga recensioner och
hoppar över den i så fall. Judge.me har ingen egen spärr — utan den skulle en
andra körning ge produkten allt i dubbel upplaga. Spärren slår upp Judge.me:s
eget produkt-id via `/products/-1?external_id=<shopify-id>` och filtrerar
`/reviews` på det; Shopify-id:t direkt mot `/reviews` ignoreras tyst av API:et.

⚠️ **Judge.me:s v1-API kan inte radera, bara dölja.** Bortstädade rader
ligger kvar i adminen som avpublicerade + spam-markerade och syns inte för
kunder. Ska de bort helt görs det i Judge.me-adminen.

⚠️ **Kör bara en recensionsrutin i taget mot samma butik.** 2026-08-30
importerade en annan körning tio anonyma IBC-recensioner mitt i arbetet.
