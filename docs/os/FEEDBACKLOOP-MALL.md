# Feedbackloop för en rutin — mallen

Axels beställning 2026-09-30, efter Facit och Mönsterminnet för Skalnings
kungen: *"skriv ner konceptet som feedbackloop + implementering så att vi kan
bygga liknande system för helt andra rutiner."*

Förlagan (läs den innan du bygger): `agent/facit.mjs`, `agent/monster.mjs`,
`agent/FACIT.md` och `agent/test/monster.test.mjs` på grenen
`claude/daily-agent-discussion-uos5df`. Läs dem utan att byta gren:

```bash
git fetch origin claude/daily-agent-discussion-uos5df
git show origin/claude/daily-agent-discussion-uos5df:agent/FACIT.md
git show origin/claude/daily-agent-discussion-uos5df:agent/monster.mjs
```

Prompten nedan är det Axel klistrar in i en ny session.

---

## Prompten

```text
Bygg en feedbackloop för rutinen <NAMN> (kommandot .claude/commands/<FIL>.md).
Den ska lära sig av sina misstag: hitta mönster där rutinen gissat fel flera
gånger, och där den brukar ha rätt, och spara dem. Men inga förbud: en sak som
brukar fungera kan ha missat två eller tre gånger av slump.

Förlagan finns redan för budgetmotorn Skalnings kungen, på grenen
claude/daily-agent-discussion-uos5df. Läs den utan att byta gren:
  git fetch origin claude/daily-agent-discussion-uos5df
  git show origin/claude/daily-agent-discussion-uos5df:docs/os/FEEDBACKLOOP-MALL.md
  git show origin/claude/daily-agent-discussion-uos5df:agent/FACIT.md
  git show origin/claude/daily-agent-discussion-uos5df:agent/monster.mjs
  git show origin/claude/daily-agent-discussion-uos5df:agent/test/monster.test.mjs
Kopiera tänket, inte koden rakt av.

Gör så här, i ordning:

1. Kartlägg rutinen. Vilka beslut fattar den? Vad såg den när den bestämde
   sig? Var loggas besluten? Vilken data visar senare vad som hände? Saknas en
   logg över vad rutinen såg: lägg till loggningen först. Facit kan bara börja
   där loggen börjar.

2. Gör varje beslut till en gissning. Skriv för varje beslutstyp en mening om
   vad rutinen trodde skulle hända, och en regel för när det blev rätt, fel
   eller oklart. Rätta gissningen mot ett fast fönster efter beslutet, och
   vänta tills datan hunnit mogna. Använd bara det som faktiskt hände.

3. Spara varje rättad gissning i en egen fil som bara växer och aldrig
   glöms (en rad per gissning, nyckel = beslut|objekt|datum, versionsfält).

4. Leta mönster. Villkoren får bara vara sådant som var känt vid beslutet.
   Gruppera på ett villkor och på par av villkor. Krymp varje grupp mot
   beslutets vanliga träffsäkerhet (betafördelning, fyra fall i förhand). Låt
   äldre gissningar väga mindre (halveringstid 30 dygn). Lista en grupp först
   vid minst 6 fall på 4 olika objekt, 15 procentenheter från det vanliga, och
   säker på 80 %-nivån. Tre listor: återkommande missar, styrkor, och "brukar
   fungera men gick fel de senaste gångerna".

5. Mät slumpen. Blanda om utfallen 100 gånger och räkna hur många mönster ren
   slump ger. Skriv den siffran bredvid dagens antal.

6. Visa, ändra inget. Lägg en varningsrad bredvid dagens beslut som liknar ett
   mönster, och en lista i rapporten. Feedbackloopen ändrar aldrig ett beslut,
   en regel eller rutinens egen logg. Vill den föreslå en regeländring: ett
   förslag med stabilt id (F + fyra siffror), konstant från A till B, och
   Axel svarar JA eller NEJ. Förslaget måste ha stått sju morgnar i rad.

7. Koppla in det säkert. Kör feedbackloopen SIST i rutinen, efter det riktiga
   arbetet. Den får aldrig stoppa eller försena rutinen: allt fel blir en
   varning, och rutinen går vidare utan. Egna filer, egen commit.

8. Pröva det innan du säger klart. Skriv tester (inga nät), bland annat att
   två–tre missar aldrig blir en varning och att rutinens beslut är identiska
   med och utan feedbackloopen. Kör på riktig historik. Bygg gärna en
   simulering där sanningen är känd och mät felet. Låt sedan oberoende
   granskare leta fel i koden och i varje siffra du påstår, och rätta allt de
   hittar.

Fällorna vi redan gått i (undvik dem):
- Kasta aldrig beslut vars fönster kapades av ett senare beslut. Då försvinner
  just de fall där gissningen stämde, och resten ser värre ut än det är.
- Fönstret rutinen beslutade på är utvalt (den agerar på toppar och dippar).
  Jämför därför med objektets egen nivå innan, inte med beslutsfönstret.
- Ett beslut som knappt ändrade något får ingen dom.
- En siffra är en mätning med datum och räckvidd, aldrig en evig lag.

Leverera: koden, testerna, en metodfil (varför, hur, siffror från första
körningen, vad den inte klarar), steget i rutinens kommandofil med
Definition of done, första körningen skriven, och ett kort svar till Axel
enligt CLAUDE.md.
```

---

## Konceptet på en sida

| Del | Vad den gör | I Skalnings kungen |
|---|---|---|
| Gissning | Varje beslut säger något om framtiden | "Höjningen går med vinst" |
| Rättning | Mot det som hände, fast fönster, efter mognad | ROAS dygn 1–3 mot break-even |
| Minne | Varje rättad gissning sparas för alltid | `agent/gissningar.jsonl` |
| Mönster | Lägen där rutinen ofta har fel eller rätt | `agent/monster.json` |
| Skydd | Krympning, glömska, slumpnivå, minsta antal | 4 missar mot 0,7 av slump |
| Utdata | Varning bredvid beslutet, aldrig ett förbud | Raden "Mönster: …" i ronden |
| Förändring | Bara via Axels JA på ett förslag | `JA F1234` |

Facit (värdet i kronor mot att låta bli) är ett steg till, och bara värt det
när en kontrafaktisk jämförelse går att pröva mot känd sanning. Mönsterminnet
räcker långt för de flesta rutiner.
