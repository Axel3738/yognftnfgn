# Skalningskungen — kravspec och byggstatus

⚠️ **Uppdraget smalnade 2026-09-10 (Axels beslut).** Skalningskungen gör
två saker: **(1) döda / skala / ändra budget** på Bäverbutikens och
OPS-butikernas annonser, **(2) larma i Discord** (ping till Axel) när en
produkt ska bli OPS — ett test som går väldigt bra, eller en produkt utan
egen butik som går bra. **Inga briefer, ingen creative strategy, inga
Notion-items.** Allt nedan om kadens, teardown och briefer (läge SKALA:s
creative-loop, `kadens.mjs`) ligger kvar som byggd kod men körs INTE av
ronden — nya annonser beställs av Axel själv. Prompten är
`.claude/commands/skalningskungen.md`; larmet är `factory/startskott.mjs
--discord`.

**Vad det var (till 2026-09-10):** ronden som var tredje dag läste
annonsdatan för EN butik, bestämde vad som skulle göras härnäst, och skrev
nya briefer i butikens egen Notion-hub.

Kommandot heter **`/skalningskungen <butik-id>`**
(`.claude/commands/skalningskungen.md`). Läs `factory/TRAPPAN.md` för NÄR
ronden hör hemma på vilken butik.

**Status 2026-09-09: motorn är byggd och testad.** Vad som finns i kod, vad som
görs av rutinen i chatten, och vad som fortfarande väntar på Axel står nedan.

---

## ⚠️ Läs detta först: det finns en ANNAN rutin med nästan samma namn

Grenen `claude/amazing-mccarthy-jlmcm5` rapporterade 2026-09-09 att en rutin
som heter **"Skalnings kungen"** (`trig_016ocyXom7XxCJKHHyfkaQWC`) redan kör
`30 5 * * *` UTC = 07:30 svensk tid, varje dag, via `.claude/commands/rond-auto.md`
och motorn `agent/` på grenen `claude/daily-agent-discussion-uos5df`.

⚠️ **Det påståendet är inte verifierat härifrån.** `list_triggers` från den här
sessionen returnerade en tom lista 2026-09-09 — vilket betyder att sessionen
inte ser kontots Routines, inte att rutinen saknas. Behandla uppgiften som en
avläsning från en annan gren, med datum, tills någon läst Routines-vyn själv.

**Vad de två gör är i vilket fall olika saker:**

| | "Skalnings kungen" (agent-grenen) | `/skalningskungen` (den här) |
|---|---|---|
| Konton | Bäverbutiken SE `1867947880635861` + NO `1050941584152547` | OPS `915422744950975`, en butik i taget |
| Vad den ändrar | **budgetar på riktigt** — höjer, sänker, stänger av | **ingenting** — noll skrivande Graph-anrop |
| Vad den beställer | brief-rundor via `/cs` och `/forsta-batch` | brieferna själv, i butikens egen hub |
| Takt | varje dag | var tredje dag, per butik |

De krockar alltså inte om ingen bygger om dem till att göra samma sak. **Bygg
aldrig en andra rutin som ändrar budget i Bäverbutikens konto** — två rutiner
som skriver i samma konto räknar kadens ur en logg bara den ena skriver i.

---

## Kärnidén: samma rond, två lägen

Ronden kör mot **en butik** och läser läget ur registret. Läget avgör vad den gör.

### Läge TEST (Bäverbutiken)
Produkten testas. Ronden gör **bara en sak**: kollar om tröskeln är passerad.

- Läser produktens siffror ur Meta (spend, köp, CPA, ROAS).
- Är tröskeln INTE passerad: rapportera läget, gör inget mer. **Inga briefer.**
- Är tröskeln passerad: **skjut startskottet.**

Den skriver alltså aldrig nya briefer för en produkt som fortfarande testas.
Det är hela poängen med att Bäverbutiken blir testbädd.

### Läge SKALA (OPS-butik)
Produkten har egen butik. Full creative-loop: analys → klassificering →
teardown → hypoteser → nya briefer i butikens egen Notion-hub.

---

## Vad som är byggt (kod, med tester)

| Fil | Vad den gör | Tester |
|---|---|---|
| `factory/register.mjs` | Registret: upptäcker butikerna, läge, konto, prefix, kördag, redigerare | 35 |
| `factory/ekonomi.mjs` | Break-even och target ur butikens eget pris — **båda momslinjerna** | 16 |
| `factory/skalning.mjs` | Ronden: hämtning, butiksfilter, ANALYSMETOD steg 0–7, klassificering, tröskelkoll | 27 |
| `factory/kadens.mjs` | Produktionstakten: 7/dag × 3 dagar, halvorna, varianternas föräldrar | 22 |
| `factory/startskott.mjs` | Meddelandet "KLAR FÖR OPS", idempotent, formaterar bara — räknar aldrig | (i skalning-testerna) |
| `factory/produkter/register.json` | Driftläget: läge, redigerare, hub, kördagsoffset, launches. **Ingen ekonomi.** | — |

Alla fyra testfilerna ligger i `factory/test/`. Hela sviten:
`node --test factory/test/*.test.mjs`.

### Registret är ingen lista
Identiteten UPPTÄCKS varje körning ur `factory/butiker/*.yaml`,
`factory/produkter/*.yaml`, `factory/state/` och `products/products.json`.
En ny OPS-butik dyker upp i registret i samma sekund som `ops.mjs` skrivit sin
första state-fil. `register.json` bär bara driftläget. En handskriven lista
hade missat nya butiker **tyst** — samma fälla som CLAUDE.md beskriver för
rutiner som hårdkodar produkter.

### Kördagarna sprids
Varje butik får ett `kordag_offset` (0, 1 eller 2) och kör när
`(dagnummer sedan 1970-01-01) % 3 === offset`. Offseten tilldelas som den
**minst använda**, så butik 1/2/3 hamnar på var sin dag och butik 4 börjar om.
En butik som fått sin dag behåller den när nya tillkommer. Två undantag gör att
ingen butik kan svälta: aldrig körd = kör direkt, och tre dygn utan rond = kör
ändå (ikappkörning).

### Butiksfiltret är spärren
MagiBorsten DK bär alla OPS-butiker **och** Bäverbutikens danska kampanjer
(avläst 2026-09-08: sex kampanjer, samtliga Bäverbutikens, noll OPS). Varje
läsning filtreras på produktens prefix, med ordgräns — utan den matchar "Heim"
varje HeimGuard-annons. I en **flerproduktsbutik** används brandnamnet aldrig
som filter; bara produktens eget `creative_prefix` (`FLERPRODUKT.md` fällan 1).
Ronden skriver alltid ut vad den slängde, så ett felstavat prefix syns som en
tom lista i stället för att tyst ge fel svar.

### Momsen avgör inte tyst
`factory/BESLUT-VANTAR.md` punkt 1 är öppen. Ekonomin räknar därför **båda**
linjerna, alltid, och lämnar inte ut ett ensamt break-even-tal förrän
produktfilens `ekonomi.moms_antagen` säger vilket antagande som gäller.
`butik.moms_i_pris` styr butikens prisvisning och används **aldrig** här — det
fältet är `true` i varje OPS-butiksfil på `main`, och att låta det styra vore
precis det tysta valet regeln finns för.

En annons vars CPA hamnar **mellan** linjerna får domen `beror_pa_moms`: ingen
kill, inget skalningsbeslut, förrän Axel svarat. HeimGuard som exempel:
break-even-CPA 378 kr med moms, 538 kr utan. En annons på CPA 450 kr är
lönsam på den ena linjen och en förlust på den andra.

---

## Kadensen (Axels tal 2026-09-09)

> "vi kan typ pumpa 7 videos per dag per butik ops då alltså. Hälften new
> concept hälften variations iterations osv då vi ska ha en redigerare för
> varje."

- **7 videor per dag per butik = 21 per rond** (ronden går var tredje dag).
- **Hälften nya koncept, hälften varianter** av det som redan vunnit.
- **Udda antal går till varianthalvan** — varianter itererar på pengar som
  redan bevisat sig (ANALYSMETOD steg 5: top spendern stod för 47 % av allt
  vinstbidrag), och nya koncept kräver var sin källa, som tar slut först.
- **Finns ingen bevisad vinnare blir hela ronden nya koncept.** En "variant"
  utan förälder vore en gissning med finare namn.
- **Varje variant pekar på VILKEN vinnare den itererar och VILKEN variabel som
  ändras** (hook, angle eller format). Variabeln roteras så att två varianter
  av samma förälder aldrig testar samma sak i samma rond — det är det som gör
  datan läsbar per variabel.
- **Varje nytt koncept pekar på en källa:** playbook-vinnare, winning line
  eller swipe. Kan det inte det märks det `GISSNING` — och göms aldrig.
- **En redigerare per butik**, läst ur registret. Står ingen där skriver ronden
  "ingen redigerare tilldelad". `factory/redigerare/standby.md` har noll rader
  (avläst 2026-09-09), så det finns ingen att peka ut.

---

## Startskottet

När en produkt i läge TEST passerar tröskeln:

1. **Säg det tydligt:** `KLAR FÖR OPS: <produkt>` med siffrorna som motiverar det.
2. **Skriv det i repot** — en rad i produktens `batch-log.md`, så nästa session
   ser det utan att räkna om.
3. **Ge kommandot färdigt att klistra in:** `/ny-ops <källänken>`.
4. **Sluta bevaka produkten** i läge TEST tills butiken finns (`lage: avslutad`
   i `register.json`).

Startskottet är en **rapport, inte en handling**. Ronden bygger aldrig en butik
själv — VA:n gör det, och hon behöver bara veta att det är dags. Meddelandet är
idempotent: det går en gång per kampanj, inte varje rond.

Saknas källänken i registret skrivs en tydlig platshållare i stället för att
meddelandet tystnar. Ett tal hittas aldrig på; saknas ett tal vägrar
startskottet helt.

### Tröskeln
`1 500 kr total spend OCH minst 20 % vinst av omsättningen.`

Talen är **avlästa**, inte satta här: de heter `FORSTA_BATCH_SPEND_SEK` och
`FORSTA_BATCH_VINST_PROCENT` i `agent/rond.mjs` på grenen
`claude/daily-agent-discussion-uos5df` (avläst 2026-09-09), och vinstprocenten
räknas med samma formel som `vinstProcent` i `agent/besked.mjs`:
`(1/break-even-ROAS − 1/ROAS) × 100`.

⚠️ **Nivån är ett öppet ägarbeslut.** `TRAPPAN.md` varnar för att sätta den för
högt: en generalbutik konverterar sämre per produkt än en fokuserad OPS-butik
med paket, bonus och eget brand. En produkt som gör 1,8 i ROAS på Bäverbutiken
kan göra mer på sin egen butik. Tills Axel svarat körs samma nivå som i dag,
och rapporten säger att nivån är oförändrad. En butik kan överstyra tröskeln
med ett eget `troskel`-objekt i `register.json` utan att koden ändras.

---

## Överlämningen

När OPS-butiken är byggd och annonserna körts över med `/ny-annonser`:

1. Produkten byter läge från `test` till `avslutad` i `register.json`, och
   OPS-butiken dyker upp av sig själv i läge `skala`.
2. **Produktminnet duplicerar — det flyttar inte** (Axels beslut 2026-09-09).
   `dna.md`, `batch-log.md` och `backlog.md` kopieras till
   `factory/minne/<butik>/` och ligger kvar på Bäverbutiken också.
   ⚠️ Från kopieringsdagen är det två minnen som driver isär. Skriv överst i
   kopian varifrån den kom och vilket datum, annars kan ingen senare avgöra
   vilket tal som gäller vilken butik.
3. Butiken får sin egen Notion-hub i sitt eget teamspace, klonad ur
   `Creative hub MALL` — aldrig byggd från noll.
4. Från och med nästa rond skrivs briefer mot den hubben.

---

## Egen instans per butik

Varje OPS-butik har sin egen schemalagda körning var tredje dag. Hur den sätts
upp — fast session, daglig cron, kalenderspärren i `arKordag()` — står i
`.claude/commands/skalningskungen.md` under "Så får en ny butik sin egen rutin".

**Måste vara en FAST molnsession** med repot som källa och `main` som utgren.
En rutin som startar ny session varje gång kan inte pusha — allt den lär sig
dör med containern. (Mätt fyra gånger i repot; står i CLAUDE.md.)

Vad som skiljer instanserna åt är bara registret: butik, läge, annonskonto,
prefix, Notion-hub, redigerare, budget, kördagsoffset och tröskel.

---

## Det som inte ändras

`docs/os/ANALYSMETOD.md` gäller oförändrad — den är produktagnostisk.
Rangordna på vinstbidrag `(break-even-CPA − CPA) × köp`, aldrig på ROAS eller
CPA ensamt. Signifikansgrind 300 kr spend eller 3 köp. Kill mot break-even
efter ≥500 kr spend, skalning mot target. Nya tester i separat test-ABO
(CLAUDE.md regel 11).

Copyn skrivs av en subagent med `model: "sonnet"` som får
`docs/copy-regler.md`. Huvudsessionen gör strategi och klassificering, aldrig
slutgiltig text.

**PAUSED i kontot är ett beslut.** Ronden gör noll skrivande Graph-anrop och
får aldrig börja göra det.

---

## Kvar till Axel

1. **Momsen i break-even** — `BESLUT-VANTAR.md` punkt 1. Tills den är besvarad
   får varje annons mellan linjerna domen "beror på momsbeslutet", och det är
   inget litet band: HeimGuard 378 mot 538 kr, TankGuard 236 mot 334 kr.
2. **Tröskelnivån för OPS** — samma som i dag (1 500 kr + 20 %), eller lägre?
3. **Redigerare per butik** — `BESLUT-VANTAR.md` punkt 7. Standby-listan har
   noll rader, så varje rond rapporterar "ingen redigerare tilldelad".
4. **Notion-hub per butik** — hub-id saknas i registret för alla OPS-butiker.
   Utan det kan ronden inte lägga brieferna någonstans.
5. **Källänken per testprodukt** — utan den skriver startskottet en
   platshållare i `/ny-ops`-raden i stället för produktsidans URL.
