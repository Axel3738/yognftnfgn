# Skalningskungen — att göra när du är tillbaka

**Läget 2026-09-09.** Research klar, rättelserna gjorda och pushade, startskottet
byggt som utkast med gröna tester. Det som återstår är fyra beslut från dig och
tre inkopplingar som ingen kan göra utan dem.

Fullständigt underlag: `SKALNINGSKUNGEN.md` (vad) och
`SKALNINGSKUNGEN-PLAN.md` (hur, sju steg).

---

## Det viktigaste jag hittade

**Skalningskungen fanns redan.** Den kör 07:30 varje morgon, ändrar budgetar på
riktigt i båda kontona, och beställer redan brief-rundor via `/cs` och
`/forsta-batch`. Den ligger på grenen `claude/daily-agent-discussion-uos5df`,
inte i `main`.

Repots egna dokument påstod att den inte fanns. Planen jag först skrev hade
därför byggt en **andra** rutin mot samma annonskonto — två rutiner som ändrar
samma budgetar och räknar kadens ur en logg bara den ena skriver i.

Det är rättat i `CLAUDE.md` och `FAS2.md`. Nästa session får veta att den finns
innan den föreslår att bygga en.

**Tröskeln du efterfrågade finns också redan:** `1 500 kr total spend OCH minst
20 % vinst`, i `agent/rond.mjs`. Den behöver inte uppfinnas — bara peka på ett
nytt utfall.

---

## Fyra beslut som bara du kan ta

### 1. Ska OPS-tröskeln vara samma som i dag?
I dag betyder `1 500 kr + 20 %` "bygg en full batch på Bäverbutiken".
Efter ombyggnaden ska den betyda "bygg en OPS-butik".

`TRAPPAN.md` varnar för att sätta den för högt — en generalbutik konverterar
sämre per produkt än en fokuserad OPS-butik.

- **A.** Samma nivå: 1 500 kr + 20 %.
- **B.** Lägre, t.ex. 1 500 kr + 10 %.
- **C.** Lägre spend, t.ex. 1 000 kr + 20 %.

### 2. Vilken kanal ska startskottet till?
Meddelandet är till dig eller VA:n. Men `rond-auto.md` kräver **engelska** i
alla tre Discord-kanalerna, för redigerarna läser samma kanaler.

- **A.** Egen ny kanal, svenska, bara du och VA:n.
- **B.** Befintliga `larm`-kanalen, då på engelska.

### 3. Ska `agent/` flyttas in i `main`?
I dag lever hela motorn på en gren. Det är därför ingen hittade den.

- **A.** Låt den ligga kvar. Jag har dokumenterat var den finns.
- **B.** Merga till `main` — men då måste rutinens prompt ändras i samma vända,
  annars finns två kopior av budgetloggen som båda tar emot rader.

### 4. TankGuards eget pris
Utan det går break-even inte att räkna, och utan break-even kan rutinen varken
rangordna eller döma butikens annonser. HeimGuard är klar (799 kr).

---

## Tre inkopplingar, i ordning

Ingen av dem får göras innan besluten ovan finns.

### A. Bäverbutikens batcher blir bild
Skriv om `rond-auto.md` steg 4b. Dagens text kräver *"minst två tredjedelar av
varje batch är video"* — den meningen ska bort. `rundaAntal` ur
`agent/rond.mjs` gäller fortfarande som antal, bara formatet byts.

De två extra bildserierna du bestämde 2026-09-02 står kvar: +3 BOF-bilder och
+2 review-bilder på riktiga recensioner.

### B. Tröskeln pekar på startskottet
Liten ändring i `annonsbehov` i `agent/rond.mjs`: samma villkor, nytt utfall.
`forsta_batch` ska bära med sig källänken till produkten på Bäverbutiken.
**Rör inte talen** — de är dina och de är testade.

### C. Startskottet kopplas in
`factory/startskott.mjs` är byggd och testad (19 tester). Den formaterar
meddelandet och loggraden. Den skickar ingenting och skriver ingenting — det
är med flit, så den kan kopplas in från vilken gren som helst.

Kvar: låt `rond-auto.md` anropa den, posta med `agent/discord-post.mjs`, och
skriva loggraden. Hela listan står som kommentar sist i `startskott.mjs`.

Så här ser meddelandet ut i dag (exempeltal):

```
**KLAR FÖR OPS: <produkt>**

Produkten har klarat testet på Bäverbutiken.
Nu ska den få en egen butik.

Siffrorna bakom:
- Spend: 4 232 kr
- Köp: 27
- CPA: 157 kr (break-even 210 kr)
- ROAS: 2,41
- Vinst: 24,3 % av omsättningen

Du ska göra 1 sak.

**Starta bygget**
Öppna en ny chatt.
Klistra in raden nedan.

/ny-ops https://baverbutiken.se/products/...

Sen är du klar. Jag har gjort resten.
```

---

## En sak att titta på

Morgonens körning 2026-09-09 står som **FAILED**. Budgetjobbet hann klart — 14
loggrader för Sverige, 8 för Norge, pushar gick igenom till 07:48. Men **ingen
`CS_BATCH_KLAR` skrevs den dagen**, så brief-rundorna blev inte av. Dagen innan
skrevs fyra.

Kön är byggd så att ett behov utan `*_KLAR`-rad flaggas igen nästa morgon, så
inget är förlorat. Men händer det ofta står redigerarna utan material utan att
någon ser det.

Det är en observation från en körning, inte en diagnos. Jag har inte rört den.

---

## Vad som är gjort och pushat

- `CLAUDE.md` — rutinen dokumenterad, med spärr mot att bygga en konkurrent
- `FAS2.md` — det falska "Den finns inte" struket och rättat
- `SKALNINGSKUNGEN.md` — omskriven mot den körande rutinen
- `SKALNINGSKUNGEN-PLAN.md` — ombyggnad i sju steg
- `factory/startskott.mjs` + 19 tester — utkast, gröna
- `overvakningskameran.yaml` — ekonomiblock utan moms (DDP):
  break-even-ROAS 1,49 · break-even-CPA 538 kr · target 2,36 · 338 kr.
  Formeln kontrollerad mot Motorhöljet och AI-glasögonen i `products.json`.
- `tankguard.yaml` — momsfrågan avgjord, saknat pris som TODO
- `hemvakten.yaml` — `moms_i_pris` märkt som prisvisning, aldrig break-even

Tester: 261 + 175, alla gröna.

**Ingenting är ändrat i beslutsmotorn, i annonskontona eller i den körande
rutinen.** Allt ovan är dokument, konfig och ett fristående utkast.
