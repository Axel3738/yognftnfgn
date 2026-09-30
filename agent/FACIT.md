# Facit — återkopplingen till Skalnings kungen

Axels beställning 2026-09-30: *"bygger en feedbackloop som kollar om det var bra
eller dåligt att vi skalade och stängde av … så att vi i framtiden lär oss vart
det är okej att skala mer och vart vi kan spara in mer pengar."*

Facit tittar bakåt på varje budgetbeslut motorn fattat, mäter vad de flyttade
kronorna faktiskt gav, och lägger resultatet bredvid dagens beslut. **Facit
ändrar aldrig ett beslut, en budget eller en regel.** Det ger underlag och
förslag; Axel bestämmer om en regel ska ändras (CLAUDE.md regel 12).

## Frågan facit svarar på

> Tjänade de kronor motorn lade till pengar? Förlorade de kronor den tog bort
> pengar?

Det är **marginal-ROAS** för de flyttade kronorna, jämförd med break-even:

| Beslut | Rätt när | Fel när |
|---|---|---|
| Höjning (SKALA) | de tillagda kronorna gav ≥ break-even | de tillagda kronorna gav < break-even |
| Sänkning (SANK, HALVERA) | de borttagna kronorna gav < break-even | de borttagna kronorna gav ≥ break-even |
| Avstängning (STANG_AV) | kampanjen hade fortsatt under break-even | den hade gått över break-even |
| Tjuvpaus (TJUV_PAUSAD, TRAPPA_FORLANGNING) | kampanjens vinst per dygn blev bättre | den blev sämre |

Samma linje som dödar i motorn (break-even) dömer facit. Target används bara
för att beskriva hållbeslut.

## Hur det mäts

**Datan.** En hämtning per konto (`agent/hamta-facit.mjs`): kampanjernas
dygnsserie i 7d_click, utan statusfilter (avstängda kampanjer är med), plus
Metas aktivitetslogg för budgetändringar. Intäkt = `action_values →
omni_purchase[7d_click]`, köp = `actions → omni_purchase[7d_click]`. En saknad
dygnsrad betyder noll spend, inte saknad data. Hämtningen tar ~10 s per konto
(mätt 2026-09-30).

**Fönstren.** Före = D−3..D−1, exakt det motorn såg. Dag D hoppas över: ändringen
landar ~07:55 och dygnet är delat. Efter = D+1..D+3 (kort) och D+1..D+7 (lång).
Ett fönster döms dagen efter att det stängt. Mätt 2026-09-30: tredagarssiffrorna
revideras inte i efterhand (587 av 587 loggade `kop_3d` = dagens omhämtning), så
det finns inget att vänta på.

**Episoder.** 68 av 96 höjningar följdes av en ny ändring inom tre dygn
(snabbspåret). Varje beslut kan därför inte ha sitt eget efter-fönster. Ändringar
åt samma håll på samma kampanj med högst tre dygns mellanrum blir en **episod**:
före-fönstret före första steget, efter-fönstret efter sista. Träffsäkerheten
räknas per episod, aldrig per steg.

**Regressionen mot medelvärdet.** En kampanj som höjs gör det för att den nyss
gick ovanligt bra, och sådana kampanjer faller tillbaka även om ingen rör dem
(mätt 2026-09-30: hållna kampanjer med hög ROAS föll till ~0,7× av före-fönstret).
Utan kontroll hade facit kallat nästan varje höjning fel. Därför räknas ett
**kontrafaktiskt** utfall: vad kampanjen hade gett på gammal budget om den följt
samma utveckling som kampanjer i samma ROAS/break-even-band som INTE ändrades
samma vecka (kontrollfaktorn `k`).

```
före per dygn:  spend sf, intäkt rf
efter per dygn: spend se, intäkt re
kontrafaktiskt: rcf = rf × k
marginal-ROAS   = (re − rcf) / (se − sf)
Δvinst per dygn = (re − rcf) / break-even − (se − sf)
```

**Störningar.** Metas aktivitetslogg visar varje budgetändring och vem som
gjorde den (`ads MCP server` = motorn, `Power Editor`/iOS = för hand). En
handändring inne i efter-fönstret kapar fönstret där (minst tre dygn kvar) eller
märker episoden STÖRD. Dagar med noll spend inne i fönstret (pausad för hand)
gör samma sak. Mätt 2026-09-30: 19 handändringar sedan 2026-08-20 som inte står i
budgetloggen.

**Grinden.** CLAUDE.md regel 3 gäller deltat, inte kampanjen: en episod är
bedömbar när de flyttade kronorna under fönstret är minst 3 × break-even-CPA
(nog för tre köp) och efter-fönstret har minst 3 köp. Under 5 × break-even-CPA
är domen preliminär (ANALYSMETOD 2c). Flyttade Meta under 300 kr av höjningen
heter utfallet UTAN_EFFEKT: budgeten var inte flaskhalsen.

**Avstängningar.** En avstängd kampanj har ingen efter-data. Facit räknar
kontrafaktiskt (före-ROAS × k för kampanjer i förlust som fick leva) och märker
domen `osaker: kontrafaktiskt`. Återstartas kampanjen syns det i dygnsserien
och märks ÅTERSTARTAD. De fyra ATERAKTIVERA-raderna i loggen är facit där Axel
själv sa att avstängningen var fel.

## Hinkarna — var det är okej att skala och var det går att spara

Varje episod bär sina hinkar: marknad, regelverk (före/efter 2026-09-23),
budgetzon (< 1 000, 1 000–2 000, 2 000–4 000, ≥ 4 000 kr), ROAS/break-even-band
vid beslutet, stegstorlek, kedjelängd och produkt. `agent/kalibrering.json`
räknar per hink: antal episoder, bedömbara, rätt/fel som bråk, flyttade kronor,
samlad marginal-ROAS (Σ Δintäkt / Σ Δspend) och samlad Δvinst i kronor.

Hinkarna mäter **marknadens svar** på en budgetändring i ett visst läge, inte
regeln som valde ändringen. Därför går episoder från olika regelverk att lägga
ihop; regelverket står ändå på varje rad och i rapporten.

Hållbeslut räknas rullande över hämtningens 45 dygn (sparas inte):
- **Höll sig över target** — kampanjen stod över target och motorn väntade. Stod
  den kvar över target i efter-fönstret var väntan en missad höjning.
- **Fortsatt förlust** — kampanjen stod under break-even och fick leva. Förlusten
  under efter-fönstret är priset för att vänta.

## Förslagen till Axel

`kalibrering.json → forslag` listar regeländringar som datan stöder, var och en
med hinken, bråket, kronorna och vilken konstant i `besked.mjs` den gäller. Ett
förslag kräver minst 8 bedömbara episoder i hinken. Inget förslag verkställs av
facit; Axel säger ja eller nej, och först då ändras `besked.mjs` (med test).

## Filerna

| Fil | Vad |
|---|---|
| `agent/facit.mjs` | Ren räkning + CLI. Episoder, kontroll, domar, hinkar, förslag, rapport, status, noten till ronden. |
| `agent/hamta-facit.mjs` | Läs-bar hämtning ur Meta (dygnsserie + aktivitetslogg), cache i `agent/utdata/cache/`. |
| `agent/facit.jsonl` | En rad per episod och horisont när fönstret stängt. Skrivs en gång, append-only. **Aldrig i budgetloggen** — en rad där med `ny_budget` fryser kampanjen tre dygn och varje annan kod nollställer uppskjutningsräknaren i `planera`. |
| `agent/kalibrering.json` | Hinkarna och förslagen, räknas om varje morgon ur `facit.jsonl` + hållbesluten. |
| `agent/utdata/facit-<datum>.md` | Dagens rapport på svenska. |

## I rutinen

`/rond-auto` steg 1d (efter hämtningen, före räkningen): hämta, räkna, skriv.
Läs-bart och fail-open — stryper Meta eller felar skriptet går ronden vidare
utan facit och rapporten säger det. `agent/rond.mjs` läser `kalibrering.json`
och lägger hinkens bråk bredvid varje beslut (`dom.facit`) och i rapportens
avsnitt 🎯 Facit. Koden, budgeten och planen är desamma med eller utan facit
(testat). Steg 6 klistrar in `node agent/facit.mjs --status`.
