# TankGuard — Creative DNA

**Skapad 2026-09-08** av `/ny-annonser tankguard` (första körningen).
OPS-butik nr 2. Ingen egen annons har kört ännu — allt nedan är **ärvt** från
Bäverbutikens IBC-tanköverdrag, som är exakt samma produkt.

Underlag: Meta Graph 2026-09-08 (`date_preset: maximum`) på två konton,
34 svenska + 33 norska annonser. Rådata `factory/output/tankguard/kallannonser.json`,
utfall `products/tankguard/batch-log.md`.

---

## Produkten och kunden

**Produkten:** IBC-tanköverdrag för 1000-literstank. 210D Oxford-tyg, blixtlås,
öppning upptill så locket går att nå utan att ta av hela överdraget.
Mått 120 × 100 × 116 cm. Sitter på under två minuter.

**Kunden:** villa- och trädgårdsägare med regnvattentank på tomten. Inte en
prylköpare — någon som redan har ett problem och har levt med det en säsong
eller flera.

**Problemet, i den ordning kunden känner det:**
1. Vattnet blir grönt av alger. Syns direkt, luktar, går inte att vattna med.
2. Skrubbningen. Den är det verkliga arbetet, och den återkommer varje sommar.
3. Plasten blir spröd av UV. Långsam, osynlig, men det är den som kostar tanken.

**Mekaniken som säljer:** tyget tar UV-strålningen i stället för plasten, och
utan ljus kommer algerna aldrig igång. Det är en fysisk orsakskedja kunden kan
se framför sig — inte en produktegenskap.

---

## Vad som är bevisat

Signifikansgrinden är 300 kr spend eller 3 köp (`docs/os/ANALYSMETOD.md`).
Under den finns ingen dom, bara frånvaro av data.

### 1. Video slår bild — och det är inte nära

| Marknad | Annonser med köp | Varav video | Varav bild |
|---|--:|--:|--:|
| SE | 4 | 4 | 0 |
| NO | 4 | 3 | 1 |

Tjugo svenska bildannonser har tillsammans 0 köp, och den dyraste av dem
(`PD_2_1`, 362 kr) är den enda bildannonsen över grinden — den fick sin chans och
tog inga köp. Norges enda bildköp (`PD_5_1`) ligger på 12 kr spend, långt under
grinden, och betyder ingenting.

**Vad det styr:** TankGuards första riktiga batch ska vara video. Bildannonserna
är billiga att brand-swappa och kan följa med, men de ska inte bära budgeten.

### 2. PD-vinkeln (produktdemo) är arbetshästen

`PD_1_H1` ensam: **16 997 kr, 77 köp, ROAS 2,92** i Sverige — 87 % av
kampanjens spend och 90 % av köpen. `PD_1_H2` och `PD_1_H3` är samma manus med
annan hook.

Hooken som bär den: **"Trött på grönt, algfyllt regnvatten? 💧"** — problemet
ordagrant, i kundens egna ord, i första meningen. Sedan mekaniken, sedan tre
bockar, sedan CTA. Ingen rabatt, ingen brådska, ingen social proof.

⚠️ **PD_1_H1 är benchmark, inte en kandidat att döma småannonser mot**
(ANALYSMETOD). Att den tar 87 % av spenden är ett skalningsfaktum, inte ett bevis
för att de andra är dåliga.

### 3. Samma annons vinner inte på båda marknaderna

| Annons | SE | NO |
|---|---|---|
| `PD_1_H1` | 16 997 kr, 77 köp, **ROAS 2,92** | 807 kr, 1 köp, **ROAS 0,95** |
| `PD_1_H2` | 310 kr, 0 köp | 3 945 kr, 18 köp, **ROAS 2,44** |
| `CS_1_H3` | 589 kr, 3 köp, ROAS 3,65 | 4 614 kr, 20 köp, **ROAS 2,37** |

Sveriges vinnare är Norges förlorare, och tvärtom. Samma produkt, samma manus,
samma vinkel — motsatt utfall på topplaceringen.

**Vad det styr:** ta aldrig med den svenska rangordningen in i den norska
kampanjen. Låt varje marknad hitta sin egen vinnare. Det är också skälet till att
Norge fördelar sig friskare (två annonser delar volymen) än Sverige (en tar allt).

### 4. Rabattvinkeln håller högst ROAS på båda marknaderna

`CS_1_H3` är den ROAS-starkaste annonsen med volym i båda kontona (3,65 i SE,
2,37 i NO på 20 köp). Vinkeln är ren rabatt.

⚠️ **Och den går inte att ärva rakt av.** Källbutikens rabatt (23 % mot 636 kr)
finns inte hos TankGuard — se nedan.

---

## Vad som ÄNDRAS när annonserna blir TankGuards

Det här är skillnaden mellan att kopiera en annons och att ärva en.

**Erbjudandet är ett annat.** Bäverbutiken säljer 489 kr mot jämförpriset 636 kr,
alltså 23 % på ett enstyck. TankGuard säljer 489 kr **utan jämförpris** och lägger
rabatten i paketnivåerna i stället: 2 för 799 kr (18 %) och 3 för 1 099 kr (25 %),
båda med Kranskydd Frost 420D gratis på köpet.

Det gör tre saker med DNA:t:
1. **Rabattvinkeln byter mekanik.** Från "spara på ett" till "spara på flera". Den
   är fortfarande sann och fortfarande stark — men den är inte samma annons.
2. **En ny vinkel öppnar sig som källbutiken aldrig testat:** flerpacket. Kunder
   med två tankar finns (norska `CS_3_1` nämner redan 300 kr-gränsen), och
   gratisbonusen är säsongsrätt — kranskydd inför vintern, tanköverdrag inför
   samma vinter. Det är samma köpögonblick.
3. **Social proof kan inte ärvas.** Fyra RV-annonser citerar namngivna
   Bäverbutiks-kunder, och SP-blocket säger "hundratals trädgårdsägare".
   TankGuard har noll recensioner. De annonserna hålls tills butiken har egna.

---

## Kvarstående okänt

| Fråga | Varför den inte går att svara på |
|---|---|
| Break-even | Hänger på om TankGuards pris innehåller moms. Utan moms 1,46, med moms 2,07 — 42 % isär. Butiksfilen svarar, och den saknas. |
| Fraktvillkor, öppet köp, betalsätt | Står bara i butiksfilen. Elva svenska annonser lovar källbutikens villkor. |
| Verklig AOV | Paketnivåerna gör att 489 kr inte är AOV. Räkna ur Shopify när ordrar finns. |
| Norska priser | TankGuard har inga NOK-nivåer i repot. Hela den norska uppsättningen är därför **prisfri** — priset står bara på `/nb`-sidan. Sätts NOK-nivåer kan pris läggas till i copyn. |

---

## Vad ombygget lärde om materialet (2026-09-09)

**Fem ytor bär källbutikens påståenden, inte en.** Copy, tal, inbränd text,
recensionsattribution och pris. En ren annonstext är inte en ren annons: 24 av 34
svenska creatives bar källans påståenden i pixlarna eller i ljudet trots omskriven
text. Grinda alltid creativen, aldrig bara texten.

**Talet är den dyraste ytan.** Åtta av elva svenska videor och åtta av elva norska
bar hela det falska erbjudandet eller ett påhittat kundvittnesmål i voiceovern.
De behövde nytt manus, inte ordbyte. Tre per marknad (`PD_1_*`) bar bara
varumärkesordet i slutrepliken.

**Slutkortet kostar ingenting att byta.** Fem videor slutade med en skärmdump av
källans produktsida. `factory/slutkort.py` lägger en overlay över ordmärket,
recensionsraden och prisparet. Noll HeyGen-credits, cirka 30 sekunder per video.

**Manusets längd är en kvalitetsfråga, inte en stilfråga.** HeyGen pressar in
manuset på källans taltid. Ett manus 1,7 gånger längre än originalet ger en
stressad röst som ingen hör förrän någon lyssnar. `srt-fixa.mjs` mäter nu tecken
per sekund mot källan och stoppar allt över 1,15×.

**Röstkontrollen (järnregel 3) — och varför den underkändes.** Axels första
besked 2026-09-09 var *"alla okej — men inget super"*. Efter mer lyssnande blev
det *"de sämsta annonserna jag sett — den saktar ner och sen speedar upp hela
tiden."*

**Det som gick fel är den viktigaste lärdomen om omdubbning i hela repot:**
HeyGen läser varje cue på exakt den cuens tid. Ett manus som skrivs som fri text
och sedan fördelas över cues ger cues med fyra gånger för mycket text — de
läses fyra gånger för fort — och cues med för lite, som dras ut. Rösten jojjar.

Måttet som fångar det är **spridningen i tecken per sekund mellan cues**, inte
snittet över filen. Snittet låg på 0,72–0,97× på videor som svängde 4–10× per
cue. `factory/rostkoll.py`.

Reglerna som följer:
1. **En replik per cue.** `factory/cuebudget.mjs` skriver ut golv och tak i
   tecken per cue; manuset skrivs mot den listan. `fördela()` är avvecklad.
2. **Skriv manuset mot den session som ska renderas.** Byter man HeyGen-läge
   transkriberas videon om och delas in i andra cues — 8 blir 10, 6 blir 4.
3. **`mode: "quality"`, inte default.** Avatar-inferens renderar om
   munrörelserna i stället för att lägga nytt ljud över bilden. Axels besked:
   använd det dyra läget.

Efter omtagningen: 1,31–2,07× spridning på alla sjutton, mot 2,16–10,29×.
Rösten går fortfarande inte att VÄLJA — `/v2/video_translate` klonar källans
röst — men tempot går att styra, och det var tempot som var trasigt.

**Källkampanjen växer under bygget.** 34 annonser vid brand-detektorns körning,
40 samma kväll. Läs om källan före räkningen, varje gång — annars missas nya
leveranser tyst.

---

## Historik

| Datum | Körning | Vad som ändrades |
|---|---|---|
| 2026-09-08 | `/ny-annonser tankguard`, körning 1 | Filen skapad. Ärvt DNA från 67 källannonser i två konton. Erbjudandet inskrivet ur Axels skärmbild. Inga egna annonser launchade. |
| 2026-09-09 | `/ny-annonser tankguard`, körning 2 | Båda kampanjerna byggda och fyllda. Fem-ytors-lärdomen, manuslängden som kvalitetsgrind, slutkortet utan credits, röstbeskedet. Den norska halvan prisfri. |
