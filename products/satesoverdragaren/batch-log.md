# Sätesöverdragaren — Batch-logg

Format per annons: hypotes, variabeltaggar (vinkel · hook-typ · format · proof ·
offer · visuell stil · textmängd · talare), och utfall (fylls i av nästa `/cs`).

---

## Batch #1 — launchad 2026-07-20 (9 annonser)

**Hypotes: ej loggad (retroaktiv rekonstruktion).** Denna batch byggdes innan
detta OS och `docs/os/ANALYSMETOD.md` fanns — rekonstruerad 2026-08-05 ur
kontodata och tidigare chattanalys. Utfallen nedan är riktig data (16 dagars
körning), inte gissningar.

| Annons | Vinkel · Hook-typ · Format · Talare | Utfall (2026-08-05, 16 dagar) |
|---|---|---|
| `Seatcover_PD_1_3_H1` | bekvämlighet · påstående/demo · rå leverantörsvideo m. captions · ingen | **Bevisad vinnare, skalar utan CPA-drift.** 21 901 kr, 80 köp, CPA 274 kr, ROAS 2,59, vinstbidrag 16 018 kr (89,7 % av kontots vinst). CPA har *förbättrats* från 288 kr trots +46 % spend. Kontots kontrollannons. *(uppdaterad 2026-08-12)* |
| `Seatcover_PD_2_1_H1` | problem/lösning · före-efter · rå leverantörsvideo · ingen | **Bevisad, lönsam men svagast av de bedömbara.** 1 289 kr, 3 köp, CPA 430 kr, ROAS 1,51, vinstbidrag 133 kr (0,7 %). Fortfarande exakt 3 köp — inget nytt köp på sex dagar trots fortsatt spend. Under break-even (474 kr) → ingen kill, men ingen skalning. *(uppdaterad 2026-08-12)* |
| `Seatcover_SO_1_1_H1` | rädsla för kostnad/pris-anker · siffra/pris · offer-grafik · ingen | **Bevisad, bäst CVR i kontot.** 1 541 kr, 5 köp, CPA 308 kr, ROAS 2,48, vinstbidrag 829 kr (4,6 %). Vinst per spendkrona 0,54 kr mot vinnarens 0,73 kr. Enda svagheten är CTR 1,42 % (vinnaren 2,69 %) → CBO svälter den. **BUG:** bilden hade felaktig "överstruket"-text i stället för genomstrykning (fixad i batch 2 som `SO_1_2`). *(uppdaterad 2026-08-12)* |
| `Seatcover_PD_1_1_H1` | bekvämlighet · påstående/demo · samma video som PD_1_3, INGEN captions · ingen | **Fortfarande 2 köp — nu bedömbar och förlustbringande.** 1 340 kr spend, 2 köp, CPA 670 kr, ROAS 0,97. **CPA ligger 41 % ÖVER break-even 474 kr → detta är kontots enda faktiska kill-kandidat på performance.** Identisk video som vinnaren utan captions. Captions-hypotesen är nu bevisad bortom rimligt tvivel. *(uppdaterad 2026-08-12)* |
| `Seatcover_PD_1_2_H1` | bekvämlighet · overlay-rubrik ("Ingen mer blöt rumpa"), ingen löpande caption · rå video · ingen | För tidigt (596 kr, 1 köp). Passerat spendgränsen men bara 1 köp → ingen dom. |
| `Seatcover_PD_3_1_H1` | okänd (svält av CBO) | För tidigt (209 kr, 0 köp). |
| `Seatcover_SP_1_1_H1` | proof/UGC · fråga · rå UGC-video · creator man | För tidigt (22 kr, 0 köp). |
| `Seatcover_SP_2_1_H1` | proof/UGC · lång recension · rå UGC-video 79–146 s · creator man | **För tidigt formellt (0 köp), mönstret nu mycket starkt.** 503 kr spend — mer än `SO_1_1_H1` fick när den gav sitt tredje köp — CTR 6,31 % (näst högst i kontot), **fortfarande 0 köp**. Klassiskt nyfikenhetsklick på för lång video. Öppen fråga till Axel: pausa manuellt? |
| `Seatcover_SP_3_1_H1` | proof · testimonial · AI-genererad statisk bild · fabricerad "kund" | **Policyflaggad, ej performance-dömd. Fortsatt LIVE (nu `WITH_ISSUES` i Meta) trots pausrekommendation i tre raka rundor sedan 2026-08-05.** Fabricerad testimonial ("Verifierad kund, 54 år"). 8 kr spend. |

---

## Batch #2 — briefad 2026-07-30, launchad 2026-08-04 (12 annonser)

Hypoteserna nedan är de som faktiskt loggades i förväg (i chatten/brieferna
2026-07-30) — riktiga loggade hypoteser, inte rekonstruktion.

| Annons | Hypotes (loggad i förväg) | Vinkel · Hook-typ · Format · Talare | Utfall (2026-08-05, 1 dag) |
|---|---|---|---|
| `Seatcover_PD_4_H1` | Bevisad verbal hook ("Ingen mer blöt rumpa") + bevisade captions slår vinnarens rena demo-hook. Isolerad variabel: sekund 0–3. | bekvämlighet · negation/overlay+demo · rå video m. captions · ingen | **För tidigt.** 29 kr, 0 köp. |
| `Seatcover_PD_5_H1` | 15 s cutdown fångar samma budskap innanför uppmärksamhetsfönstret (halva publiken tappas 3–9,5 s i vinnaren). Isolerad variabel: längd/tempo. | bekvämlighet · fråga → demo · rå video, cutdown · ingen | **För tidigt.** 35 kr, 0 köp. |
| `Seatcover_PD_6_H1` | Pris-ankrets bevisade CVR (statik) flyttat till vinnarens videoformat kombinerar räckvidd med stängningsgrad. Isolerad variabel: persuasion-frame (pengar i st. f. komfort). | rädsla för kostnad · siffra/pris · rå video m. captions · ingen | **För tidigt.** 63 kr, 0 köp. |
| `Seatcover_SP_4_H1` | Kort (25–30 s) proof-led UGC med kvalificerande hook konverterar där lång UGC misslyckades. **BLOCKER: riktig kund/creator krävdes.** | proof · citat/demo · UGC-video · creator man | **För tidigt.** 70 kr, 0 köp. **QC:** launchad med befintlig overifierad kontocopy ("vanligaste kommentaren vi får"), inte ny brief-copy — oklart om filmpersonen är en riktig kund. |
| `Seatcover_PD_7_H1` | Mekanism/prevention-vinkel ("därför spricker sätet") expanderar publiken bortom redan skadade säten. | mekanism/prevention · påstående · rå video, materialdemo · ingen | **För tidigt.** 70 kr, 0 köp. |
| `Seatcover_SP_5_H1` | Narrativ struktur (3 akter) lyfter PD_2:s svaga före/efter-transformation. | proof/story · före-efter narrativ · UGC-video · creator man | **För tidigt.** 9 kr, 0 köp. |
| `Seatcover_SO_1_2` | Ta bort "överstruket"-buggen bibehåller eller förbättrar kontots bästa CVR. Ersätter `SO_1_1_H1`. | rädsla för kostnad · siffra/pris · offer-grafik (fixad) · ingen | **För tidigt.** 23 kr, 0 köp. **QC: visuellt verifierad korrekt** — riktig genomstrykning, ingen textbugg. |
| `Seatcover_PD_8_1` | Vinnarens "enkelhet"-bevis fungerar som stillbild för placeringar där video-retention är svagast. | bekvämlighet · 3-stegsdemo · statisk, steg-layout · ingen | **För tidigt.** 58 kr, 0 köp. |
| `Seatcover_PD_9_1` | Transformationen konverterar bättre som stillbild än som PD_2:s släpande video. | problem/lösning · före-efter · statisk, split · ingen | **För tidigt.** 11 kr, 0 köp. |
| `Seatcover_SP_6_1` | Äkta proof stänger den demo-uppvärmda publiken. **BLOCKER: riktig recensionstext krävdes (Judge.me-export väntad).** | proof · testimonial · statisk · fabricerad "kund" | **⚠️ POLICYBROTT, olöst.** 31 kr, 0 köp. **Launchad med fabricerad testimonial ("JAKOB, verifierat köp") trots explicit BLOCKER.** Fortsatt LIVE ett dygn efter pausrekommendation. |
| `Seatcover_PD_10_1` | Checklist-persuasion bär som visuellt listicle-format. | bekvämlighet · listicle (4 känslomässiga punkter) · statisk · ingen | **För tidigt.** 117 kr, 0 köp. **QC: launchad med korrekt, känslomässigt omskriven text.** |
| `Seatcover_SO_2_1` | Loss-frame ("vänta en säsong till?") matchar eller slår SO_1:s discount-frame. | rädsla för kostnad · risk/cost-of-inaction · statisk · ingen | **För tidigt.** 16 kr, 0 köp. |

**Sammanfattning batch #2 (uppdaterad 2026-08-12, 8 dagar efter launch):** Alla 12
annonser fortfarande under signifikansgränsen, ingen bedömbar. Spend per annons
efter åtta dagar: 9–217 kr. Den högsta (`PD_10_1`, 217 kr) har ännu inte nått
300 kr-gränsen. **Detta är inte ett creative-resultat, det är ett budgetresultat**
— se den strukturella observationen i dna.md. Två QC-avvikelser kvarstår olösta
(`SP_6_1` fabricerad testimonial, `SP_4_H1` overifierad filmperson).

---

## Batch #3 — launchad 2026-08-06 (3 annonser)

| Annons | Hypotes (loggad i förväg 2026-08-05) | Vinkel · Hook-typ · Format · Talare | Utfall (2026-08-06, samma dag) |
|---|---|---|---|
| `Seatcover_PD_11_1` | Kvalitet/hållbarhet är en helt otestad vinkel (allt hittills argumenterar komfort/pris). Isolerad variabel: persuasion-mekanism. | material/kvalitet · jämförelse · statisk, split · ingen | **För tidigt.** 31 kr, 0 köp (2026-08-12) — oförändrat på sex dagar. Svälts helt av CBO. |
| `Seatcover_SO_3_1` | Omramning som present till annan person kan expandera köparbasen bortom självköpare. Medvetet ingen påhittad högtid/brådska. | identity/gift · påstående · statisk · ingen | **För tidigt.** 61 kr, 0 köp (2026-08-12). CTR 0,37 % — svagaste i hela kontot. Långt under dombar nivå, men gift-vinkeln har hittills ingen stoppkraft alls. |
| `Seatcover_PD_12_H1` | POV-textkortformat (aldrig testat) kan höja hook-rate genom att kännas mindre som en annons. Isolerad variabel: hook-KONVENTION, inte hook-innehåll. Kroppen är vinnarens bevisade material. | bekvämlighet · POV/fråga · rå video, nativ stil · ingen | **För tidigt, stagnerat:** 361 kr spend, **fortfarande 1 köp**, CPA 361 kr, ROAS 1,80, CTR 2,06 % (2026-08-12). Har passerat spendgränsen men fastnat på ett köp i sex dagar. CTR under vinnarens 2,69 % → POV-konventionen stoppar inte bättre än rak demo. Låt rulla, men den ser inte ut att bli en vinnare. |

**Sammanfattning batch #3 (uppdaterad 2026-08-12):** `PD_12_H1` står kvar på sitt
enda köp. De två statiska svälts fortsatt hårt av CBO (31 och 61 kr på sex dagar).
Se den strukturella observationen i dna.md — problemet är budgetfördelning, inte
creativen.

---

## Batch #4 — byggd 2026-08-06 (4 annonser)

Byggd på Axels begäran: han vill ha buffert med briefer till nästa analys, inte
en motivering till varför färre räcker. Notering till framtida sessioner:
**kvotläget är ett golv, inte ett tak** — när managern ber om mer material
levereras det, och kvoten används bara för att garantera minimum.

Två av fyra (`PD_13_H1` + `PD_15_H1`) är ett **parat hooktest på samma
videokropp**: samma vinnarmaterial från sekund 4, olika 0–4s-öppningar
(beteende-callout vs siffer-kontrast). Klipp kroppen EN gång, producera två
öppningar — annars är jämförelsen värdelös.

| Annons | Hypotes | Vinkel · Hook-typ · Format · Talare | Utfall |
|---|---|---|---|
| `Seatcover_PD_13_H1` | Alla hooks hittills namnger *problemet* (blött säte). Ingen namnger **workaroundet ägaren redan använder** (handduken på sätet). Att peka ut ett befintligt beteende är en starkare igenkänningstrigger än att beskriva ett tillstånd. Isolerad variabel: hook-innehåll (beteende-callout vs tillståndspåstående). | problem/misstag-callout · fråga/observation · rå video m. captions · ingen | **HYPOTESEN HÖLL — och blev den första briefade annonsen i kontot som nådde signifikans.** 1 974 kr, 6 köp, CPA 329 kr, ROAS 1,97, vinstbidrag 870 kr (4,9 %). Lönsam (break-even 474 kr) men under target 300 kr. **CTR 3,87 % — högst av alla PD-annonser, vinnaren gör 2,69 %.** Hold 13,6 % mot vinnarens 11,7 %. **MEN:** LPV→köp bara 1,81 % mot vinnarens 2,67 %. Beteende-callouten stoppar bäst i kontot och konverterar sämst — den drar in en bredare, mindre köpmogen publik. Batch #6 svarar på exakt detta. |
| `Seatcover_PD_15_H1` | "Under 60 sekunder" ligger på sekund 16–18 i vinnaren — efter att halva publiken redan fallit av (tapp 3→9,5s). Kontots starkaste konkreta siffra flyttad till hooken som tidskontrast (år av att stå ut vs under en minut att fixa) stoppar scrollen på specificitet i stället för empati. Isolerad variabel: hook-typ (siffra/tidskontrast). | bekvämlighet/tid · siffra/tidskontrast · rå video m. captions · ingen | **För tidigt.** 125 kr, 0 köp, CTR 2,97 % (2026-08-12). Notera: CTR redan över vinnarens 2,69 % men klart under PD_13:s 3,87 % — tidig indikation, inte en dom. Partestet mot PD_13 är ännu inte avgjort eftersom PD_15 fått 6 % av PD_13:s budget. |
| `Seatcover_PD_14_1` | Kontots statiker säljer känsla, jämförelse eller pris. Ingen svarar på den enklaste förköpsfrågan för en 649 kr-produkt online: *vad kommer fysiskt i paketet?* Att göra konstruktionen läsbar i ett ögonkast minskar osäkerheten som stoppar ett varmt klick från att konvertera. Isolerad variabel: konkret värde-inramning. | konkret värde/innehåll · påstående+pris · statisk m. callouts · ingen | **För tidigt.** 189 kr, 0 köp, CTR 1,97 % (2026-08-12). CTR högst av alla statiker i kontot (`SO_1_1_H1` gör 1,42 %) — svag men reell indikation att konkret värde-inramning stoppar bättre än prisgrafik. |
| `Seatcover_SO_4_1` | SO-spåret konverterar bäst per besök men har hittills varit tidlöst inramat ("nytt säte kostar tusenlappar"). Ett **säsongsskäl att agera nu** — månader av höstregn framför sig, skydda dynan i stället för att byta säte till våren — ger samma ankare en naturlig deadline utan påhittad rea. Isolerad variabel: temporal inramning. | kostnad av att vänta/säsong · påstående (säsong) · offer-grafik · ingen | **För tidigt.** 6 kr, 0 köp (2026-08-12). Praktiskt taget ingen leverans alls — CBO har inte gett den en chans. |

**Sammanfattning batch #4 (uppdaterad 2026-08-12):** Alla fyra launchade.
`PD_13_H1` är rundans viktigaste resultat i hela kontot: **första briefade
annonsen som nått signifikans**, och den bevisar att beteende-callout är kontots
starkaste stoppmekanism samtidigt som den avslöjar dess svaghet (sämre CVR).
Batch #6 är byggd rakt på det fyndet.

**Produktionsanmärkningar inbyggda i brieferna:** `SO_4_1` och `PD_14_1` bär
båda den explicita QA-regeln mot "överstruket"-buggen (riktig genomstrykningslinje
krävs). `SO_4_1` har uttrycklig spärr mot påhittad rea/nedräkning/slutdatum —
649/811 är hela erbjudandet. Ingen annons i batchen innehåller testimonials.

**Status 2026-08-09:** ingen av batch 4:s fyra annonser är launchad än.

---

## Batch #5 — byggd 2026-08-09 (4 annonser)

Byggd ur rundans skarpaste fynd: prisankaret (`SO_1_1_H1`) är nu bevisat och
**lika lönsamt per spendkrona som vinnaren** (0,63 kr vs 0,63 kr) men får bara
5,6 % av budgeten eftersom dess CTR är hälften så hög. Två av fyra briefer
attackerar exakt den svagheten från motsatta håll.

| Annons | Hypotes | Vinkel · Hook-typ · Format · Talare | Utfall |
|---|---|---|---|
| `Seatcover_SO_5_1` | Prisankarets enda svaghet är stoppkraft, inte budskap. Samma erbjudande i färre/större/mer kontrastrika ord ska höja CTR från 1,43 % utan att tappa 6,6 % CVR. Isolerad variabel: typografisk stoppkraft. **Avgörande diagnos: CTR.** | pris-anker · siffra/prischock · offer-grafik, jättetypografi · ingen | Ej launchad |
| `Seatcover_SO_6_1` | Samma CTR-problem, motsatt lösning: SO-spåret har bara körts som studiografik, vilket läser som butiksskylt. Kontots bevisade DNA är dokumentär realism. Äkta utomhusfoto i stället för render. Isolerad variabel: studiografik vs verkligt miljöfoto. **Partest mot SO_5_1** — SO_5 testar att skrika högre, SO_6 att låta äkta. | pris-anker · påstående (ägarobservation) · äkta miljöfoto · ingen | Ej launchad |
| `Seatcover_PD_16_H1` | Riskhantering, inte kreativitet: vinnaren bär 92 % av vinsten och kontot har ingen andra skalbar tillgång. Samma bevisade manusstruktur på **nytt råmaterial** ger en testad backup innan den behövs. Isolerad variabel: råmaterialet (manus, captions, USP-ordning och CTA hålls konstanta). | bekvämlighet/problem-lösning · fråga · rå video m. captions, NYTT material · ingen | Ej launchad |
| `Seatcover_PD_17_1` | Karusell är aldrig testat i kontot. Videon stoppar många men konverterar 2,5 %; statiken konverterar 6,6 % men stoppar få. Karusellen är enda formatet som kan göra båda jobben i en enhet — och ger en diagnos inget annat format ger: **var folk slutar swipa**. Isolerad variabel: format. | problem→lösning→proof→offer · påstående · KARUSELL 5 kort · ingen | Ej launchad |

**Status 2026-08-12:** ingen av batch #5:s fyra annonser finns i kontot än — tre
dagar efter briefning. Batch #4 tog två dagar från brief till launch, så detta är
inte onormalt, men det betyder att batch #5 och #6 sannolikt launchas tillsammans.
`SO_5_1`, `SO_6_1` och batch #6:s `SO_7_1` bör i så fall köras samtidigt: de tre
attackerar SO-spårets CTR-problem via typografi, foto respektive budskap, och blir
en trevägs-diagnos bara om de får samma startpunkt.

---

## Batch #6 — byggd 2026-08-12 (4 annonser)

Byggd helt på rundans skarpaste fynd: **`PD_13_H1` är den första briefade annonsen
i kontot som nått signifikans** (6 köp, CPA 329 kr, lönsam), och den mätte två
saker som pekar åt olika håll:

- **Stoppar bäst i kontot:** CTR 3,87 % (vinnaren 2,69 %), hold 13,6 % (11,7 %).
- **Konverterar sämst av de bedömbara:** LPV→köp 1,81 % (vinnaren 2,67 %).

Igenkänningshooken stoppar alltså fler men drar in en bredare, mindre köpmogen
publik. Batchen testar de tre möjliga svaren — kvalificera tidigare, replikera
hooktypen, och flytta hooken till formatet som redan konverterar bäst.

| Annons | Hypotes | Vinkel · Hook-typ · Format · Talare | Utfall |
|---|---|---|---|
| `Seatcover_PD_18_H1` | Problemet med PD_13 är inte hooken utan **när kvalificeringen sker**. Priset ligger i annonstexten, så obeslutsamma klickar och faller av på LP:n. Flyttas priset och kostnadsjämförelsen in i videon vid sekund 7–9 faller de av *före* klicket i stället för efter. Isolerad variabel: pris i video (hook, material, USP-ordning och CTA hålls identiska mot PD_13). **Avgörande diagnos: LPV→köp, måste slå 1,81 %.** | beteende-callout → priskvalificering · fråga/observation (bevisad) · rå video m. captions · ingen | Ej launchad |
| `Seatcover_PD_19_H1` | PD_13 är EN datapunkt på ETT beteende. Vi vet inte om **hooktypen** (namnge workaroundet ägaren redan använder) replikerar, eller om handduken råkade vara ett ovanligt vanligt beteende. Samma formel på jacka/filt över sätet avgör det. Isolerad variabel: vilket beteende som pekas ut. **Avgörande diagnos: CTR mot 3,87 %.** | beteende-callout · fråga/observation (bevisad typ, nytt innehåll) · rå video m. captions · ingen | Ej launchad |
| `Seatcover_PD_20_1` | Handdukshooken är kontots starkaste stoppmekanism i video; statikerna har motsatt profil (konverterar 6,3 %, klickar 1,42 %). En stillbild ger ingen tid för en bred nyfiken publik att byggas upp — man känner igen beteendet och klickar, eller scrollar förbi. Hooken borde alltså lyfta statik-CTR **utan** videons CVR-straff. Isolerad variabel: format (video → statik) på en i övrigt bevisad hook. | beteende-callout · fråga (bevisad) · statisk 50/50-split · ingen | Ej launchad |
| `Seatcover_SO_7_1` | Kontots två bevisade tillgångar har motsatta svagheter: prisankaret konverterar bäst (6,33 %) men stoppar sämst (1,42 %), handdukshooken tvärtom. Inget av dem är ett tak för det andra. Igenkänningsfrågan i rubrikpositionen, prisankaret som stängning under. Isolerad variabel: rubrikens register inom det bevisade SO-formatet. **Avgörande diagnos: CTR upp utan CVR-tapp.** | beteende-igenkänning → pris-anker · fråga (igenkänning) · offer-grafik · ingen | Ej launchad |

**Produktionsanmärkningar inbyggda i brieferna:** `PD_18_H1` bär den hårda regeln
att PD_13:s master ska återanvändas oförändrad — enda skillnaden mellan annonserna
är captionrad 4, annars är jämförelsen värdelös. Båda statikerna bär den explicita
QA-spärren mot "överstruket"-buggen (riktig genomstrykningslinje krävs) och kravet
på äkta fotografi, ingen AI-genererad produkt eller person. Ingen annons i batchen
innehåller testimonials.

**Vad batchen INTE testar (medvetet):** ingen ny vinkel, inget nytt format utöver
formatöverföringen. Rundan gav för första gången ett riktigt mätresultat på en
briefad annons — då är rätt drag att exploatera det fyndet, inte att sprida
budgeten på nya gissningar.
