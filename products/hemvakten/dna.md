# Creative DNA — HeimGuard (övervakningskameran)

Skapad 2026-09-08 av `/ny-annonser`. Första körningen i ordningen.
Butiks-id `hemvakten`, brand **HeimGuard**, heimguard.se.

⚠️ **All prestandadata i den här filen är ÄRVD från Bäverbutiken**, inte mätt på
HeimGuard. HeimGuards egen kampanj är byggd men har spenderat 0 kr. Första
riktiga avläsningen kan göras när kampanjen körts och passerat signifikansgrinden.

---

## Produkten och kunden

Övervakningskamera, dubbellins PTZ, 355° panorering, AI-persondetektering som
skiljer människor från djur och grenar, direktnotis i mobilen, utomhus året om.

**Kunden:** villa- och radhusägare 35–65 som hör ljud på tomten om natten och
hellre kollar mobilen än går ut. Trötta på kameror som larmar på katter och grenar.

**Grundkonflikten:** att inte veta är värre än att veta. Produkten byter ovisshet
mot bild.

---

## Vad som är bevisat (ärvt från källan, 23 798 kr spend, 60 köp)

| Vinkel | Kod | Spend i källan | Dom |
|---|---|---:|---|
| Social proof — kundernas omdöme | SP | 14 005 kr | **Bevisad.** Bär 59 % av spenden. `SP_2` ensam: 13 338 kr, ROAS 2,89, 34 köp. |
| Erbjudandet — 799 mot 1 000 kr | CS | 8 735 kr | **Bevisad.** `CS_3`: ROAS 3,44 på 5 010 kr — högst av alla. |
| Problem/lösning — ljudet på tomten | PD | 368 kr | Otestad. Under grinden. |
| Listan — fem funktioner samtidigt | LI | 291 kr | Otestad. |
| Jämförelse — fast kamera mot PTZ | CO | 164 kr | Otestad. |
| Garanti/trygghet | BOF | 86 kr | Otestad. |
| Auktoritet — teknikern visar | AU | 72 kr | Otestad. |
| Present | G | 52 kr | Otestad. |
| Notisen | RI | 27 kr | Otestad. |

**Mönster 1 — två vinklar bär allt.** SP och CS står för 96 % av källans spend.
De sju andra har aldrig fått chansen. Det är inte samma sak som att de är dåliga,
och en `/cs` som dömer ut dem på nuvarande data bryter mot analysmetoden.

**Mönster 2 — samma copy, olika creative, olika utfall.** `CS_2` och `CS_3` har
IDENTISK copy. ROAS 2,34 mot 3,44. Skillnaden ligger i videon, inte i texten.
Slutsatser om copy får inte dras ur den skillnaden.

**Mönster 3 — bildversionerna av vinnarna har inte replikerat.** `SP_2_1`
(bild, samma copy som SP_2) fick 295 kr och 1 köp; `CS_2_1` fick 388 kr och 0 köp.
För tunt för en dom, men det är den första frågan att ställa när data finns.

---

## Vad HeimGuard ändrade, och varför det gör datan icke-jämförbar

1. **Social proofen byttes.** Källan skrev "Tusentals nöjda hushåll i Sverige har
   redan bytt ut sina gamla system" och ett kundcitat ingen kund sagt. HeimGuard
   är en ny butik med tio recensioner och kan inte påstå något av det. Copyn
   bygger nu på de tio riktiga femstjärniga omdömena.
   ⚠️ Detta ändrar den bevisade toppannonsens bärande rad. Behandla `SP`-utfallet
   hos HeimGuard som en **ny hypotes**, inte som en fortsättning på källans.
2. **Brådskan togs bort.** "🚨 Bara idag", "snart slut", "missa inte rean" krockar
   med brandets uttalade tonläge (saklig, lugn, inga utropstecken) — och var
   dessutom falskt: 799 kr är butikens stående pris.
3. **Fraktlöftet rättades.** Källan lovar fri frakt över 300 kr. HeimGuard har fri
   frakt utan gräns.
4. **Priset rördes inte.** 799 / 1 000 kr är identiskt i båda butikerna.

---

## Ekonomin — AVGJORD 2026-09-09 (Axels besked)

Pris 799 kr · inköp 261 kr · **TB 538 kr · BE-ROAS 1,49 · BE-CPA 538 kr ·
target-ROAS 2,36 · target-CPA 338 kr**, räknat UTAN moms — samma regel som
Bäverbutiken och Grillkliniken. Facit: `factory/produkter/overvakningskameran.yaml`
(`moms_antagen: false`), och det är den linjen `factory/budgetrond.mjs` dömer mot.

⚠️ Kampanjnamnet i kontot säger fortfarande `BE-ROAS 2,11` (räknat MED moms,
före beslutet). Namnet är en etikett, inte facit — döm aldrig mot det.
Bäverbutikens 1,57 på samma produkt är en annan verksamhet och får aldrig
kopieras hit.

*(Uppdaterat 2026-09-10 av `/notionscalercs setup` — tidigare stod här
"TB 378 · BE-ROAS 2,11" som en öppen fråga till Axel.)*

---

## Rotorsaker och fallgropar för nästa körning

- **Kontot bär flera verksamheter.** `915422744950975` innehåller både HeimGuards,
  TankGuards och Bäverbutikens danska kampanjer. Varje uppslag måste filtrera på
  `HEIMGUARD_` — annars läses en annan butiks annonser som om de vore samma produkt.
- **Ingen commission utgår på den här butiken i dag.** Kontot står i
  `UTLANDSKA_KONTON` i `commission/berakning.mjs`. Det är känt och ligger som
  Uppdrag D i `factory/FAS2.md`, inte som ett fel att rätta här.
- **Norska halvan är inte byggd.** Butiken tar betalt i SEK på /nb medan
  Bäverbutikens norska annonser är prissatta i NOK. Se batch-loggen.
