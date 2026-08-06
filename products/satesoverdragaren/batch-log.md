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
| `Seatcover_PD_11_1` | Kvalitet/hållbarhet är en helt otestad vinkel (allt hittills argumenterar komfort/pris). Isolerad variabel: persuasion-mekanism. | material/kvalitet · jämförelse · statisk, split · ingen | **För tidigt.** 8 kr, 0 köp. **QC: visuellt verifierad korrekt** — inga konkurrentloggor, rätt pris. |
| `Seatcover_SO_3_1` | Omramning som present till annan person kan expandera köparbasen bortom självköpare. Medvetet ingen påhittad högtid/brådska. | identity/gift · påstående · statisk · ingen | **För tidigt.** 23 kr, 0 köp. **QC: visuellt verifierad korrekt** — ingen påhittad gåvohögtid, rätt pris. |
| `Seatcover_PD_12_H1` | POV-textkortformat (aldrig testat) kan höja hook-rate genom att kännas mindre som en annons. Isolerad variabel: hook-KONVENTION, inte hook-innehåll. Kroppen är vinnarens bevisade material. | bekvämlighet · POV/fråga · rå video, nativ stil · ingen | **För tidigt.** 104 kr, 0 köp. **QC:** öppningsbilden matchar briefen (blöt/daggig säte-closeup); kunde inte verifiera det bokstavliga "POV:"-textkortet från en enda stillbild. |

**Sammanfattning batch #3:** Launchad samma dag som denna runda — noll timmars
data, ingen dom möjlig. Bedöms i nästa `/cs`.

---

## Batch #4 — INTE byggd denna runda (2026-08-06), medvetet beslut

Kvoten var redan **+9 före plan** innan denna runda (+12 efter att batch 3
loggades). 15 av kontots 24 annonser (batch 2 + 3) är fortfarande under
signifikansgränsen — ingen av dem har hunnit bevisa eller motbevisa sin
hypotes än. Att bygga ytterligare 3 nya koncept idag skulle fragmentera CBO:n
ännu mer utan att tillföra ny inlärning just nu — samma logik som
ANALYSMETOD.md använder mot att döma annonser för tidigt gäller även mot att
*starta* för många samtidigt. Flaggat som öppen fråga #5 till Axel i dna.md:
fortsätta bygga varje runda oavsett kvotläge, eller pausa nya koncept tills
batch 2/3 hunnit mogna (uppskattningsvis 3–5 dagar till vid nuvarande takt,
baserat på hur snabbt PD_1_3_H1 och SO_1_1_H1 nådde signifikans i juli).
