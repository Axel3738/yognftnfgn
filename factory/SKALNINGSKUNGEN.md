# Skalningskungen — kravspec

**Vad det är:** rutinen som var tredje dag läser annonsdatan, bestämmer vad som
ska göras härnäst, och skriver nya briefs som kapitel i Notion.

I dag heter den `/cs` och kör mot Bäverbutikens produkter. Enligt
`factory/TRAPPAN.md` ska den flytta till OPS-butikerna. Den här filen beskriver
vad den ska bli.

---

## Kärnidén: samma rutin, två lägen

Rutinen kör mot **en butik** och läser butikens läge ur konfigen. Läget avgör
vad den gör.

### Läge TEST (Bäverbutiken)
Produkten testas. Rutinen gör **bara en sak**: kollar om tröskeln är passerad.

- Läser produktens siffror ur Meta (spend, köp, CPA, ROAS).
- Är tröskeln INTE passerad: rapportera läget, gör inget mer. **Inga briefs.**
- Är tröskeln passerad: **skjut startskottet** (se nedan).

Den skriver alltså aldrig nya briefs för en produkt som fortfarande testas.
Det är hela poängen med att Bäverbutiken blir testbädd.

### Läge SKALA (OPS-butik)
Produkten har egen butik. Rutinen kör full creative-loop, precis som `/cs` gör
i dag: analys → klassificering → hypoteser → nya briefs i butikens egen
Notion-hub.

---

## Startskottet

När en produkt i läge TEST passerar tröskeln ska rutinen:

1. **Säga det tydligt** i sin rapport: `KLAR FÖR OPS: <produkt>` med siffrorna
   som motiverar det.
2. **Skriva det i repot** — en rad i produktens `batch-log.md` och en
   markering i produktkonfigen, så nästa session ser det utan att räkna om.
3. **Ge VA:n kommandot att köra**, färdigt att klistra in:
   `/ny-ops <källänken till produkten>`
4. **Sluta bevaka produkten** i läge TEST tills butiken finns.

Startskottet är en **rapport, inte en handling**. Rutinen bygger aldrig en
butik själv — VA:n gör det, och hon behöver bara veta att det är dags.

## Överlämningen

När OPS-butiken är byggd och annonserna körts över med `/ny-annonser`:

1. Produkten byter läge från TEST till SKALA i konfigen.
2. **Produktminnet följer med.** `dna.md`, `batch-log.md` och `backlog.md`
   kopieras till butikens mapp — den bevisade historiken är det mest
   värdefulla en ny butik ärver. Utan den ser rutinens första körning
   tolv annonser utan hypoteser.
3. Butiken får sin egen Notion-hub i sitt eget teamspace.
4. Från och med nästa körning skriver rutinen briefs mot den hubben.

## Egen instans per butik

Varje OPS-butik har sin egen schemalagda körning var tredje dag.

**Måste vara en FAST molnsession** med repot som källa och `main` som utgren.
En rutin som startar ny session varje gång kan inte pusha — allt den lär sig
dör med containern. (Mätt tre gånger i repot; står i CLAUDE.md.)

Vad som skiljer instanserna åt är bara konfigen:

| Fält | Vad det styr |
|---|---|
| butik | vilken butik körningen gäller |
| läge | `test` eller `skala` |
| annonskonto | Bäverbutiken respektive MagiBorsten DK |
| creative_prefix | vilka annonser i kontot som är produktens — **per produkt, aldrig per brand** |
| notion_hub | vart briefsen skrivs |
| kanal | var rapporten landar (Discord per butik) |
| ekonomi | pris, inköp, break-even-CPA, break-even-ROAS, target-CPA |

---

## Vad som måste finnas innan den kan byggas

1. **Ekonomiblocket per produkt.** `factory/produkter/*.yaml` har i dag bara
   `pris` och `inkopskostnad`. Rutinen kan varken rangordna eller döma utan
   break-even och target. ⚠️ Räkna om från grunden per butik — Bäverbutiken
   säljer utan moms, OPS-butikerna har `moms_i_pris: true`. Kopiera aldrig tal
   mellan verksamheterna.
2. **`creative_prefix` per produkt**, inte per brand. Prefixet är det enda
   fyra system använder för att skilja produkter åt.
3. **Butiksfilter på det gemensamma annonskontot.** MagiBorsten DK bär alla
   OPS-butiker. Utan filter läser rutinen andra butikers annonser som om de
   vore samma produkt.
4. **Tröskeln.** Vad "tillräckligt bra" betyder är inte satt. Se nedan.

## Det som inte ändras

`docs/os/ANALYSMETOD.md` gäller oförändrad — den är produktagnostisk.
Rangordna på vinstbidrag `(break-even-CPA − CPA) × köp`, aldrig på ROAS eller
CPA ensamt. Signifikansgrind 300 kr spend eller 3 köp. Kill mot break-even,
skalning mot target. Nya tester i separat test-ABO (regel 11).

Copyn skrivs av en subagent med `model: "sonnet"` som får
`docs/copy-regler.md`. Huvudsessionen gör strategi och klassificering, aldrig
slutgiltig text.

---

## Öppet: tröskeln

Vad ska krävas för att skjuta startskottet? Förslag att bedöma:

> **N köp till en CPA under break-even, över minst M dagars spend.**

⚠️ Sätt den **lägre än den känns rimlig**. Bäverbutiken är en generalbutik och
konverterar sämre per produkt än en fokuserad OPS-butik med paket, bonus och
eget brand. En produkt som gör 1,8 i ROAS där kan göra mer på sin egen butik.
Sätts tröskeln för högt dödas produkter som hade funkat.
