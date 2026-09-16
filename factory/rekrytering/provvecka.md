# Provveckan (Stage 3) — så avgörs en redigerare mot en annan

**Skriven 2026-09-16** när Axel hade två kandidater ur `lussekatt`-generationen
av video-editor-annonsen och frågade om han skulle testa dem mot varandra eller
ta båda. Det här är protokollet, återanvändbart för varje ny omgång.

---

## Först: behöver du välja alls?

Räkna platserna innan du bränner en bra kandidat. En OPS-butik **med** tilldelad
redigerare får 21 briefer per briefrond, **utan** bara 7 — det är kadensen i
`factory/register.mjs`. En kandidat du tackar nej till är borta; en butik utan
redigerare producerar en tredjedel.

Läget 2026-09-16 (`node -e` mot `factory/produkter/register.json`):

| Butik | Redigerare |
|---|---|
| hemvakten/overvakningskameran | Carl Vicente |
| kalender/adventskalender-racingbilar | Jazz (jazzer1522) |
| tacklebay/fiskespohallare-4-pack | Eric J |
| drytrek/damasker | Jasper Tomboc |
| **tankguard/tankguard** | **—** |
| **carashell/takskyddet** | **—** |
| **catcabin/utekattkojan** | **—** (briefrond pausad) |

Tre lediga platser, två kandidater. **Ta båda.** Testet nedan används då inte
för att välja en vinnare, utan för att sätta rätt person på rätt butik och för
att fånga den som inte klarar jobbet innan månad två.

Välj bara en om platserna faktiskt är färre än kandidaterna.

---

## Betalningen: bryt inte annonsens löfte

Annonsen de sökte på säger ordagrant:

> "This is a real monthly salary, not piece work. I am not going to pay you per
> clip and have you racing to grab the easy ones. Some ads take five minutes.
> Some take an hour. You get paid for clearing the day, not for counting files."

Byter du till styckbetalning i första samtalet river du det löftet innan de
börjat. Tre konkreta följder:

1. **De cherry-pickar.** Enkla iterationer på en vinnare betalar lika mycket som
   ett bygge från råmaterial. Svåra briefer blir liggande — och det är de
   svåra som vinner.
2. **Du kan inte sätta dagslistan längre.** Hela poängen med månadslön är att
   *du* sizar listan. Med styckpris förhandlar de om varje uppgift.
3. **Omdöme på OnlineJobs.ph.** Kandidater läser arbetsgivarens historik. En
   "bait and switch" följer med till nästa rekrytering.

Kör avtalet som det står i `anstallningsavtal.md`: $520/mån, trappan, plus
**0,4 % commission på adspend** för de ads redigeraren skapar (`/commission`).
Commissionen ÄR den rörliga delen — den belönar ads som säljer, inte ads som
finns. Det är exakt rätt incitament, och det finns redan.

Vill du lägga till något rörligt utöver det: gör det till en **bonus ovanpå**
lönen, aldrig en ersättning för den.

---

## Provveckan: kör de två parallellt

Samma vecka, samma material, samma briefer. Olika butiker går också bra så
länge briefmängden är lika.

**Betald.** Full månadslön pro rata för veckan. En obetald provvecka är inte
ett test, det är gratisarbete — och den bästa kandidaten är den som har flest
andra alternativ.

### De fyra sakerna som mäts

Inget av dem är smak. Alla fyra går att läsa ur Notion och Discord i efterhand.

| # | Mäts | Var det står | Vad som är bra |
|---|---|---|---|
| 1 | **Levererat i tid** | Notion-radens datum mot deadline | Varje dag, inga undantag |
| 2 | **Följde briefen** | `/granska`-checklistan | Rätt format, rätt hook, rätt pris, rena captions |
| 3 | **Antal revisioner** | Status `In progress 2` i hubben | Färre, och samma fel aldrig två gånger |
| 4 | **Frågade eller gissade** | Kommentarerna i Notion | Frågar FÖRE, inte efter underkännandet |

**Punkt 4 väger tyngst efter punkt 1.** Lägg medvetet en lucka i en brief under
veckan — ett saknat pris, en oklar längd. Den som frågar är den du kan lämna
ensam med en butik. Den som gissar kostar dig en revisionsrunda i veckan för
alltid. Det är samma test som Stage 2, men på riktigt arbete.

### Det som INTE mäts

- **Skönhet.** Annonsen sa att skicklighet är fyra i prioritetsordningen. Håll
  den ordningen i bedömningen också, annars ljög annonsen.
- **Hastighet första veckan.** Avtalet säger själv "we understand it might be
  slow the first week". En redigerare som är långsam och noggrann vecka 1 blir
  snabb vecka 4. Tvärtom händer aldrig.
- **Vem som är "bäst".** Två personer som båda klarar listan är två platser
  fyllda, inte en tävling.

### Efter veckan

- Båda klarade fyra av fyra → båda anställs, en butik var.
- En klarade, en missade punkt 1 eller 4 → anställ den som klarade. Säg rakt ut
  till den andra varför, samma dag.
- Ingen klarade → ingen anställs. Annonsen ligger kvar, nytt codeword.

Skriv in vald redigerare i registret så kadensen hoppar från 7 till 21 briefer:

```bash
node factory/register.mjs redigerare <butik> "<namn>" [discord-id]
```
