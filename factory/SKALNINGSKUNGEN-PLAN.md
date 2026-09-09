# Skalningskungen — byggplanen

**Skriven 2026-09-09** (Axels beslut samma dag). Kravspecen står i
`SKALNINGSKUNGEN.md`; det här är ordningen den byggs i. Läs `TRAPPAN.md`
först — den säger NÄR, specen säger VAD, den här filen säger HUR och I VILKEN
ORDNING.

---

## Regel nummer ett: kärnan rörs inte

Axels ord 2026-09-09: *"Jag vill inte tappa skillet den har för creative
strategy, för den gör nått sjukt — och du gillar att ändra och pilla på
grejer."*

Skalningskungen är **`/cs` i ett nytt skal**. Skalet byts. Kärnan flyttas
ordagrant. Det som står i tabellen nedan får inte skrivas om, kortas,
"förbättras" eller moderniseras av någon session som bygger rutinen. Ett
bygge som ändrar en rad i kärnan är ett misslyckat bygge, oavsett hur bra
raden blev.

| Fryst | Fil | Vad det är |
|---|---|---|
| Analysmetoden | `docs/os/ANALYSMETOD.md` | Steg 0–7 + snabbchecklistan. Vinstbidrag, signifikansgrind, teardown. |
| Kärnloopen | `.claude/commands/cs.md` steg 2–5 | Feedbackloop → nästa batch → modellpolicy → leverera och logga |
| Leveransformatet | `.claude/commands/forsta-batch.md` | Briefformatet, manustabellerna, zip-paketeringen |
| Copy-reglerna | `docs/copy-regler.md` | Tre-frågorstestet. Varje rad. |
| Strategin | `docs/creative-strategy.md` | Insikt → manus |
| Playbooken | `docs/playbook.md` | Bevisade vinklar, hooks, format |
| Namnkonventionen | `docs/naming-convention.md` | Annonsnamn kodar vinkel/format/hook |
| Produktminnet | `products/<id>/dna.md`, `batch-log.md`, `backlog.md` | Strukturen och sättet de uppdateras på |
| Kvoten | `pipeline/quota.mjs` | Ren matematik, produktagnostisk |
| Modellpolicyn | CLAUDE.md regel 6 | Copy av sonnet-subagent, strategi av huvudsessionen |
| Testregeln | CLAUDE.md regel 11 | Nya tester i separat test-ABO, lika budget |

**Så här byggs det utan att röra kärnan:** den nya kommandofilen *pekar* på
`cs.md` steg 2–5 och `ANALYSMETOD.md` — den kopierar dem inte, och den
skriver inte om dem med egna ord. Kopierad text driver isär med tiden;
en pekare gör det inte.

---

## Vad som faktiskt byts: skalet

`/cs` steg 1 ("Läs läget") hårdkodar Bäverbutiken. Det är HELA skillnaden.
Steg 1 ersätts av en **butikskonfig**, resten är identiskt.

| I `/cs` i dag | I Skalningskungen |
|---|---|
| Ad account = MagiBorsten `1867947880635861` | `butik.annonskonto` ur konfigen |
| Produktens rad i `products/products.json` | `factory/produkter/<id>.yaml` (ekonomiblocket) |
| Hela kampanjen ur kontot | Bara annonser med produktens `creative_prefix` — kontot är delat |
| Notion-hub ur `products.json` | `butik.notion_hub` ur konfigen |
| Rapport i chatten | Rapport i butikens Discord-kanal + chatten |
| `products/<id>/` | `products/<butik>/` — samma tre filer, flyttade med produkten |
| Körs för hand, i en chatt | Fast molnsession, var tredje dag, en per butik |

Två lägen ur `SKALNINGSKUNGEN.md` oförändrade: **TEST** (Bäverbutiken —
bara tröskelbevakning, inga egna briefs; kvällens bildrutin fortsätter
som i dag oberoende av den här rutinen) och **SKALA** (OPS-butiken — hela
kärnan).

---

## Ordningen

Varje steg är klart när dess "Klart när" stämmer. Hoppa inte. Nästa steg
börjar inte förrän förra är pushat till `main`.

### Steg 1 — Ekonomiblocket per OPS-produkt
`factory/produkter/<id>.yaml` får `ekonomi.break_even_cpa_sek`,
`break_even_roas`, `target_cpa_sek`, `target_roas`, `aov_sek`, `moms_i_pris`.
Räknas **från grunden per butik** på butikens EGET pris, med moms
(`moms_i_pris: true` i butiksfilen). Aldrig kopierat från Bäverbutiken.
Validatorn (`factory/validera.mjs`) kräver fälten i läge SKALA.
🖐 **Axel:** HeimGuards pris är satt (799 kr). TankGuards pris är INTE satt
i repot — break-even kan inte räknas förrän det finns.
**Klart när:** båda produktfilerna bär blocket, med källa och datum i
kommentar, och validatorn vägrar en OPS-produkt utan det.

### Steg 2 — `creative_prefix` per produkt + butiksfilter
Prefixet flyttas från brand till produkt (`FLERPRODUKT.md`, fällan 1).
En läsfunktion `annonserForProdukt(konto, prefix)` som är det ENDA sättet
rutinen hämtar annonser ur det delade kontot `915422744950975`. Den
returnerar aldrig en annons utan prefixet — inte ens om kampanjen heter rätt.
**Klart när:** funktionen körd mot kontot visar bara TankGuards
respektive HeimGuards annonser, och Bäverbutikens danska kampanjer i
samma konto syns inte.

### Steg 3 — Produktminnet flyttar med
`products/<butik>/` skapas ur `products/<källprodukt>/` (dna, batch-log,
backlog) för varje OPS-butik. Överst i `dna.md` skrivs varifrån den kom och
när. De brand-swappade annonserna ur `/ny-annonser` skrivs in i
`batch-log.md` med sina bevisade utfall från Bäverbutiken, märkta
`ärvd från Bäverbutiken` — utan det ser första körningen tolv annonser utan
hypoteser.
⚠️ Bäverbutikens tal (CPA, ROAS) skrivs in som HISTORIK, inte som facit —
butiken konverterar annorlunda (`TRAPPAN.md`, fällan).
**Klart när:** `products/heimguard/` och `products/tankguard/` finns med
ärvd batch-log och pushade.

### Steg 4 — Kommandofilen `/skalningskungen <butik>`
`.claude/commands/skalningskungen.md`. Innehåll:
1. Läs `factory/butiker/<butik>.yaml` + `factory/produkter/<id>.yaml`.
   Verifiera `ad_account_id` = `915422744950975`. Läs läget (`test`/`skala`).
2. Läge TEST: tröskelkoll enligt specen, rapport, startskott vid passerad
   tröskel. Stopp.
3. Läge SKALA: hämta annonserna via steg 2:s funktion, sedan **"följ
   `cs.md` steg 2–5 ordagrant"** — en pekare, ingen omskrivning.
4. Rapporten till butikens Discord-kanal (`DISCORD_WEBHOOK_URL` per butik
   i butiksfilen) och Notion-hubben ur konfigen.
5. Definition of done = `cs.md`:s lista + tre rader: rätt konto verifierat,
   bara produktens prefix läst, rapport landad i rätt kanal.
**Klart när:** en torrkörning för hand mot HeimGuard går igenom hela
kedjan och produktminnet uppdateras i `products/heimguard/`.

### Steg 5 — Notion-hub och kanal per butik
Hubben skapas ur `Creative hub MALL` i butikens eget teamspace (manuellt
klick — Notions API kan inte skapa teamspaces, se `FAS2.md` uppdrag D).
Hubbregistret (`commission/hubbar.json`) får raden med butik, konto,
prefix och teamspace, så commission och leveransrundan ser den rätt.
**Klart när:** hub-id står i butiksfilen och en testbrief syns i hubben.

### Steg 6 — Fast session + trigger, en per butik
`create_session` med repot som källa och `main` som utgren, tagg
`routine:skalningskungen:<butik>`, sedan `create_trigger` med
`persistent_session_id` var tredje dag. Aldrig "ny session varje gång" —
den kan inte pusha (mätt tre gånger, CLAUDE.md). Kolla `list_triggers`
före bygget så det inte blir dubbletter.
**Klart när:** första schemalagda körningen har pushat sitt produktminne
till `main` av sig själv.

### Steg 7 — Tröskeln
🖐 **Axels beslut.** Förslag ur specen: N köp under break-even över minst
M dagar, satt LÄGRE än det känns. Tills talet finns rapporterar läge TEST
bara siffrorna och säger "tröskel ej satt".

---

## Vad som INTE ingår

- Ingen ny analysmetod, inga nya metrik, ingen ny brieffmall.
- Ingen automatisk budgetändring, ingen automatisk paus av annonser.
  Skalningskungen skriver briefs och rapporterar. Pengarna rör Axel.
- Ingen ändring i `/cs` för Bäverbutikens produkter — den fasas ut i takt
  med att produkterna får butiker, den byggs inte om.
- Ingen ändring i kvällens bildrutin.

## Första riktiga körningen

HeimGuard, när `/ny-annonser` har byggt kampanjen och den har spenderat i
minst tre dagar. Innan dess finns inget att analysera, och en körning på
tom data ger bara gissningar.
