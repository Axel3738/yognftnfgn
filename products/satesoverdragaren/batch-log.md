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
| `Seatcover_PD_1_3_H1` | bekvämlighet · påstående/demo · rå leverantörsvideo m. captions · ingen | **Bevisad vinnare.** 14 984 kr, 52 köp, CPA 288 kr, ROAS 2,50, vinstbidrag 9 664 kr (92,4 % av kontots totala vinst). Kontots kontrollannons. *(uppdaterad 2026-08-06)* |
| `Seatcover_PD_2_1_H1` | problem/lösning · före-efter · rå leverantörsvideo · ingen | **Bevisad, lönsam men svag.** 1 263 kr, 3 köp, CPA 421 kr, ROAS 1,54, vinstbidrag 159 kr (1,5 %). Fortfarande precis på signifikansgränsen (inget nytt köp sedan förra rundan). *(uppdaterad 2026-08-06)* |
| `Seatcover_SO_1_1_H1` | rädsla för kostnad/pris-anker · siffra/pris · offer-grafik · ingen | **Bevisad, bäst CVR.** 1 261 kr, 4 köp, CPA 315 kr, ROAS 2,37, vinstbidrag 635 kr (6,1 %). LPV→köp fortsatt bäst i kontot. **BUG:** bilden hade felaktig "överstruket"-text i stället för genomstrykning (fixad i batch 2 som `SO_1_2`). *(uppdaterad 2026-08-06)* |
| `Seatcover_PD_1_1_H1` | bekvämlighet · påstående/demo · samma video som PD_1_3, INGEN captions · ingen | **För tidigt (2 köp), trend förvärrad.** 1 313 kr spend, **fortfarande exakt 2 köp två dagar i rad** — 0 nya köp senaste dygnet medan PD_1_3 gick +3. Rekommenderas pausad manuellt. Eskalerad till öppen fråga i dna.md. |
| `Seatcover_PD_1_2_H1` | bekvämlighet · overlay-rubrik ("Ingen mer blöt rumpa"), ingen löpande caption · rå video · ingen | För tidigt (578 kr, 1 köp, oförändrat). |
| `Seatcover_PD_3_1_H1` | okänd (svält av CBO) | För tidigt (198 kr, 0 köp). |
| `Seatcover_SP_1_1_H1` | proof/UGC · fråga · rå UGC-video · creator man | För tidigt (22 kr, 0 köp). |
| `Seatcover_SP_2_1_H1` | proof/UGC · lång recension · rå UGC-video 79–146 s · creator man | **För tidigt formellt (0 köp), mönster förstärkt.** 442 kr spend (närmar sig 500 kr), CTR 6,7 % (högst i kontot), fortfarande 0 köp — klassiskt nyfikenhetsklick på för lång video. Ny öppen fråga: pausa manuellt? |
| `Seatcover_SP_3_1_H1` | proof · testimonial · AI-genererad statisk bild · fabricerad "kund" | **Policyflaggad, ej performance-dömd. Fortsatt LIVE trots pausrekommendation från 2026-08-05.** Fabricerad testimonial ("Verifierad kund, 54 år"). 8 kr spend, oförändrat. |

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

**Sammanfattning batch #2 (uppdaterad 2026-08-06, ~1,5 dygn gammal):** Alla 12
annonser fortfarande under signifikansgränsen, ingen bedömbar än. Ingen ny data
som ändrar bedömningen sedan runda 2. Två QC-avvikelser kvarstår olösta
(`SP_6_1`, `SP_4_H1`).

---

## Batch #3 — launchad 2026-08-06 (3 annonser)

| Annons | Hypotes (loggad i förväg 2026-08-05) | Vinkel · Hook-typ · Format · Talare | Utfall (2026-08-06, samma dag) |
|---|---|---|---|
| `Seatcover_PD_11_1` | Kvalitet/hållbarhet är en helt otestad vinkel (allt hittills argumenterar komfort/pris). Isolerad variabel: persuasion-mekanism. | material/kvalitet · jämförelse · statisk, split · ingen | **För tidigt.** 31 kr, 0 köp (2026-08-09). Svälts av CBO. |
| `Seatcover_SO_3_1` | Omramning som present till annan person kan expandera köparbasen bortom självköpare. Medvetet ingen påhittad högtid/brådska. | identity/gift · påstående · statisk · ingen | **För tidigt.** 52 kr, 0 köp (2026-08-09). CTR bara 0,39 % — svagaste i kontot, tidig varningssignal men långt under dombar nivå. |
| `Seatcover_PD_12_H1` | POV-textkortformat (aldrig testat) kan höja hook-rate genom att kännas mindre som en annons. Isolerad variabel: hook-KONVENTION, inte hook-innehåll. Kroppen är vinnarens bevisade material. | bekvämlighet · POV/fråga · rå video, nativ stil · ingen | **För tidigt men bäst av de nya:** 315 kr spend, **1 köp**, CPA 315 kr, ROAS 2,06 (2026-08-09). Passerade spendgränsen men bara 1 köp → ingen dom. Enda annonsen ur batch 2–3 som gett ett köp. Värd att låta rulla. |

**Sammanfattning batch #3 (uppdaterad 2026-08-09):** `PD_12_H1` är den enda av 15
annonser i batch 2+3 som producerat ett köp. De statiska svälts hårt av CBO
(8–52 kr spend vardera). Se den strukturella observationen i dna.md — problemet
är budgetfördelning, inte creativen.

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
| `Seatcover_PD_13_H1` | Alla hooks hittills namnger *problemet* (blött säte). Ingen namnger **workaroundet ägaren redan använder** (handduken på sätet). Att peka ut ett befintligt beteende är en starkare igenkänningstrigger än att beskriva ett tillstånd. Isolerad variabel: hook-innehåll (beteende-callout vs tillståndspåstående). | problem/misstag-callout · fråga/observation · rå video m. captions · ingen | Ej launchad än |
| `Seatcover_PD_15_H1` | "Under 60 sekunder" ligger på sekund 16–18 i vinnaren — efter att halva publiken redan fallit av (tapp 3→9,5s). Kontots starkaste konkreta siffra flyttad till hooken som tidskontrast (år av att stå ut vs under en minut att fixa) stoppar scrollen på specificitet i stället för empati. Isolerad variabel: hook-typ (siffra/tidskontrast). | bekvämlighet/tid · siffra/tidskontrast · rå video m. captions · ingen | Ej launchad än |
| `Seatcover_PD_14_1` | Kontots statiker säljer känsla, jämförelse eller pris. Ingen svarar på den enklaste förköpsfrågan för en 649 kr-produkt online: *vad kommer fysiskt i paketet?* Att göra konstruktionen läsbar i ett ögonkast minskar osäkerheten som stoppar ett varmt klick från att konvertera. Isolerad variabel: konkret värde-inramning. | konkret värde/innehåll · påstående+pris · statisk m. callouts · ingen | Ej launchad än |
| `Seatcover_SO_4_1` | SO-spåret konverterar bäst per besök men har hittills varit tidlöst inramat ("nytt säte kostar tusenlappar"). Ett **säsongsskäl att agera nu** — månader av höstregn framför sig, skydda dynan i stället för att byta säte till våren — ger samma ankare en naturlig deadline utan påhittad rea. Isolerad variabel: temporal inramning. | kostnad av att vänta/säsong · påstående (säsong) · offer-grafik · ingen | Ej launchad än |

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
