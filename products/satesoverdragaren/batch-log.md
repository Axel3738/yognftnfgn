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
| `Seatcover_PD_1_3_H1` | bekvämlighet · påstående/demo · rå leverantörsvideo m. captions · ingen | **Bevisad vinnare, men nu med CPA-drift.** 30 784 kr, 102 köp, CPA 302 kr, ROAS 2,35, vinstbidrag 17 563 kr (66,0 % av kontots vinst). **CPA har gått 274 → 302 kr när spenden gick 21,9k → 30,8k**, alltså första gången skalningen kostar. Fortfarande långt under break-even 474 kr, men precis över target 300 kr. Vinstandelen har fallit från 89,7 % till 66,0 % eftersom nya annonser börjat leverera. Kontots kontrollannons. *(uppdaterad 2026-08-14)* |
| `Seatcover_PD_2_1_H1` | problem/lösning · före-efter · rå leverantörsvideo · ingen | **Bevisad, lönsam, svagast av videorna.** 1 797 kr, 5 köp, CPA 359 kr, ROAS 1,71, vinstbidrag 573 kr (2,2 %). CPA förbättrad från 430 → 359 kr. Under break-even → ingen kill, över target → ingen skalning. *(uppdaterad 2026-08-14)* |
| `Seatcover_SO_1_1_H1` | rädsla för kostnad/pris-anker · siffra/pris · offer-grafik · ingen | **Bevisad och nu under target.** 1 936 kr, 7 köp, CPA 277 kr, ROAS 2,65, vinstbidrag 1 382 kr (5,2 %). Vinst per spendkrona 0,71 kr mot vinnarens 0,57 kr — **prisankaret är nu effektivare per krona än vinnaren.** Kvarvarande svaghet är CTR 1,30 %, lägst av alla bedömbara. **BUG:** bilden hade felaktig "överstruket"-text (fixad i batch 2 som `SO_1_2`). *(uppdaterad 2026-08-14)* |
| `Seatcover_PD_1_1_H1` | bekvämlighet · påstående/demo · samma video som PD_1_3, INGEN captions · ingen | **NU BEDÖMBAR OCH FÖRLUSTBRINGANDE. Kontots första formella kill-beslut.** 1 594 kr, 3 köp, CPA 531 kr, ROAS 1,22. Signifikansgrinden är passerad (≥300 kr, ≥3 köp) och **CPA ligger 12 % över break-even 474 kr → vinstbidrag −172 kr.** Identisk video som vinnaren, enda skillnaden är att captions saknas. Vinnaren står på CPA 302 kr. **Captions-frågan är därmed avgjord med formell signifikans, inte längre anekdot.** *(uppdaterad 2026-08-14)* |
| `Seatcover_PD_1_2_H1` | bekvämlighet · overlay-rubrik ("Ingen mer blöt rumpa"), ingen löpande caption · rå video · ingen | **För tidigt (850 kr, 2 köp), CPA 425 kr.** Ett köp från att bli bedömbar. Ligger mellan vinnaren (löpande captions) och `PD_1_1_H1` (inga captions) både i upplägg och i CPA, vilket stödjer captions-slutsatsen. |
| `Seatcover_PD_3_1_H1` | okänd (svält av CBO) | För tidigt (225 kr, 0 köp). |
| `Seatcover_SP_1_1_H1` | proof/UGC · fråga · rå UGC-video · creator man | För tidigt (22 kr, 0 köp), oförändrat. |
| `Seatcover_SP_2_1_H1` | proof/UGC · lång recension · rå UGC-video 79–146 s · creator man | **Fortfarande för tidigt, men SP-spåret har fått sitt första köp någonsin.** 681 kr, **1 köp**, CPA 681 kr, CTR 5,73 %. Ett köp på 681 kr är långt över break-even, men det bryter ändå påståendet "noll köp i hela SP-spårets historia" som stått i dna.md sedan runda 2. Formuleringen är rättad där. |
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

**Status 2026-08-14:** `SO_5_1` och `SO_6_1` är launchade, `PD_16_H1` och
`PD_17_1` (karusellen) är det inte. Utfall så här långt:

| Annons | Utfall (2026-08-14) |
|---|---|
| `Seatcover_SO_5_1` | **För tidigt.** 783 kr, 2 köp, CPA 391 kr, ROAS 1,66, CTR 1,43 %. Hypotesen var att jättetypografi skulle lyfta CTR över 1,43 %. **CTR landade på exakt 1,43 %, alltså oförändrat.** Ingen dom formellt, men typografi ser inte ut att vara SO-spårets flaskhals. |
| `Seatcover_SO_6_1` | **För tidigt.** 184 kr, 0 köp, CTR 2,39 %. För lite spend för slutsats, men CTR är klart över SO-spårets 1,30 till 1,43 % — äkta miljöfoto ser lovande ut där typografi inte gjorde det. |
| `Seatcover_PD_16_H1` | Ej launchad. |
| `Seatcover_PD_17_1` | Ej launchad. Karusell fortfarande otestat i kontot. |

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


---

## Batch #6 — utfall (launchad 2026-08-12, avläst 2026-08-14)

Två av fyra launchades. **Den ena blev kontots bästa statiska annons.**

| Annons | Hypotes (loggad i förväg) | Utfall |
|---|---|---|
| `Seatcover_PD_20_1` | Handduks-hooken är kontots starkaste stoppmekanism i video. Som stillbild borde den lyfta statik-CTR **utan** videons CVR-straff, eftersom en statik inte ger tid för en bred nyfiken publik att byggas upp. Isolerad variabel: format (video → statik). | **HYPOTESEN HÖLL, och bättre än väntat.** 953 kr, 5 köp, CPA 191 kr, ROAS 5,39, vinstbidrag 1 417 kr. CTR 2,66 % mot SO-spårets 1,30 till 1,43 %, alltså nästan dubbelt. **LPV→köp 9,62 %, näst bäst i hela kontot.** Vinst per spendkrona 1,49 kr mot prisankarets 0,71 kr. Beteende-callouten bär alltså både stoppkraften OCH konverteringen i statiskt format. |
| `Seatcover_SO_7_1` | Prisankaret konverterar bäst men stoppar sämst, handdukshooken tvärtom. Igenkänningsfrågan i rubrikpositionen med prisankaret som stängning borde kombinera dem. Isolerad variabel: rubrikens register. | **För tidigt (175 kr, 2 köp), men starkast tidiga signal i kontot.** CPA 88 kr, ROAS 5,57, CTR 2,21 % mot `SO_1_1_H1`:s 1,30 %. Går den till 3 köp är den kontots effektivaste annons. Behöver budget, inte fler tester. |
| `Seatcover_PD_18_H1` | Pris in i videon vid 7 till 9s kvalificerar tidigare. | Ej launchad. |
| `Seatcover_PD_19_H1` | Beteende-callout på ett annat beteende (jacka/filt). | Ej launchad. |

**Slutsats batch #6:** formatöverföringen av en bevisad hook var rundans billigaste
och största vinst. Batch #7 bygger vidare på exakt det.

---

## Swipe-annonsen (utanför batchnumreringen)

`Seatcover bryn swipe 1` launchades av Axel 2026-08-13 ur briefen
`briefs/Seatcover_SP_7_H1/brief.md` (offer-first spokesperson, swipe på en
vinnande grillkorgsannons, reason-why-öppning på att vi beställde för många).

**Utfall 2026-08-14: 917 kr, 6 köp, CPA 153 kr, ROAS 4,25, vinstbidrag 1 927 kr.**
**Vinst per spendkrona 2,10 kr — bäst i hela kontot, nästan fyra gånger vinnarens
0,57 kr.** LPV→köp 10,53 %, högst av alla bedömbara annonser.

Notering om namngivning: annonsen heter `Seatcover bryn swipe 1` i kontot, inte
enligt namnkonventionen. Behandlas i analysen som `SP_7`. Batch #7:s hooktest
använder `SP_8` och `SP_9` för att undvika krock.

---

## Batch #7 — byggd 2026-08-19 (6 annonser)

Kvoten är 6 per 3-dagarscykel sedan budgeten fördubblades till 3 000 kr/dag, och
läget var **−13 creatives efter plan**. Batchen är därför sex briefer.

Hela batchen bygger på rundans två bevisade fynd: **offer-first är kontots mest
lönsamma budskap** (swipen, 2,10 kr vinst per spendkrona) och **beteende-callout
bär både stoppkraft och konvertering i statiskt format** (`PD_20_1`, 1,49 kr).
Inget nytt påhittat spår, bara exploatering av det som mätts.

| Annons | Hypotes | Vinkel · Hook-typ · Format · Talare | Utfall |
|---|---|---|---|
| `Seatcover_SP_8_H1` | Vi vet att swipen vinner men inte OM det är hooken eller kroppen. Samma kropp, byt öppningen mot handduks-callouten (kontots högsta video-CTR, 3,69 %). Isolerad variabel: sekund 0 till 8. | beteende-callout → offer-kropp · beteende-callout · VO över demo m. captions · röst utan ansikte | Ej launchad |
| `Seatcover_SP_9_H1` | Tredje armen i samma test. Samma kropp, öppning på prisjämförelsen, kontots bäst konverterande budskap men aldrig testat som videoöppning. Isolerad variabel: sekund 0 till 8. | pris-anker → offer-kropp · priskontrast · VO över demo m. captions · röst utan ansikte | Ej launchad |
| `Seatcover_PD_22_H1` | `PD_1_3_H1 – kopia` kör samma creative som vinnaren men på CPA 197 kr mot 302 kr. Om det är verkligt är vinnarens CPA-drift delvis en annonsnivå-effekt, inte creative-trötthet, och fixen är gratis. Kopian var en olycka med litet underlag, detta är samma drag gjort kontrollerat. Isolerad variabel: annonsobjektet. | bekvämlighet/demo · påstående/demo (oförändrad) · rå video m. captions · ingen | Ej launchad |
| `Seatcover_SO_8_1` | Offer-first vinner i video och en videohook kan flyttas till statik (`PD_20_1` bevisade det). Ingen har kombinerat dem. Reason-why i rubrikpositionen i den bevisade SO-layouten. Isolerad variabel: rubrikens register. | lagerutförsäljning/reason-why · påstående · offer-grafik · ingen | Ej launchad |
| `Seatcover_PD_21_1` | `PD_20_1` är kontots bästa statik men är EN datapunkt på ETT beteende. Samma layout, annat beteende (jackan). Replikerar kategorin eller bara handduken? Isolerad variabel: vilket beteende som pekas ut. | beteende-callout · fråga (bevisad typ, nytt innehåll) · statisk 50/50-split · ingen | Ej launchad |
| `Seatcover_SO_9_1` | `PD_20_1` stoppar och konverterar men bär bara ett naket pris i bottenraden. Prisjämförelsen är kontots bästa stängningsargument. Lägg till den utan att röra det som vinner. Isolerad variabel: prisraden. | beteende-callout → pris-anker · fråga (bevisad) · statisk 50/50 + prisrad · ingen | Ej launchad |

**Produktionsanmärkningar inbyggda i brieferna:** `SP_8` och `SP_9` bär den hårda
regeln att swipens kropp klipps EN gång och delas byte-identiskt mellan alla tre
hookvarianter. `PD_22_H1` bär regeln att originalet INTE får pausas, annars finns
ingen jämförelse. `PD_21_1` och `SO_9_1` bär regeln att `PD_20_1`:s layout kopieras
exakt, eftersom de är innehållstest och inte designtest. **Ingen statik i batchen
nämner färg** — grön och ljusgrå är slutsålda.

**Backlog:** swipe-itemet är markerat `[använd i batch #7]`. De två extra hookar
Axel skulle skicka behövdes inte längre — datan pekade ut vilka två som var värda
att testa, så de är skrivna ur kontots egna vinnare i stället.
