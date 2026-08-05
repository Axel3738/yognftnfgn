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
| `Seatcover_PD_1_3_H1` | bekvämlighet · påstående/demo · rå leverantörsvideo m. captions · ingen | **Bevisad vinnare.** 14 057 kr, 49 köp, CPA 287 kr, ROAS 2,50, vinstbidrag 9 169 kr (91,7 % av kontots totala vinst). Kontots kontrollannons. |
| `Seatcover_PD_2_1_H1` | problem/lösning · före-efter · rå leverantörsvideo · ingen | **Bevisad, lönsam men svag.** 1 259 kr, 3 köp, CPA 420 kr, ROAS 1,55, vinstbidrag 163 kr (1,6 %). Precis över signifikansgränsen. |
| `Seatcover_SO_1_1_H1` | rädsla för kostnad/pris-anker · siffra/pris · offer-grafik · ingen | **Bevisad, bäst CVR.** 1 227 kr, 4 köp, CPA 307 kr, ROAS 2,43, vinstbidrag 669 kr (6,7 %). LPV→köp 6,15 % — bäst i kontot. **BUG:** bilden hade felaktig "överstruket"-text i stället för genomstrykning (fixad i batch 2 som `SO_1_2`). |
| `Seatcover_PD_1_1_H1` | bekvämlighet · påstående/demo · samma video som PD_1_3, INGEN captions · ingen | **För tidigt (2 köp), men trend-flaggad.** 1 302 kr spend, bara 2 köp på 16 dagar — jämfört med PD_1_3:s 49 köp på identiskt klipp. Rekommenderas pausad manuellt trots att den formella signifikansgränsen inte nåtts. |
| `Seatcover_PD_1_2_H1` | bekvämlighet · overlay-rubrik ("Ingen mer blöt rumpa"), ingen löpande caption · rå video · ingen | För tidigt (1 köp). |
| `Seatcover_PD_3_1_H1` | okänd (svält av CBO) | För tidigt (193 kr, 0 köp). |
| `Seatcover_SP_1_1_H1` | proof/UGC · fråga · rå UGC-video · creator man | För tidigt (21 kr, 0 köp). |
| `Seatcover_SP_2_1_H1` | proof/UGC · lång recension · rå UGC-video 79–146 s · creator man | **För tidigt formellt (0 köp), men mönster bekräftat.** 430 kr spend, CTR 6,7 % (högst i kontot), 0 köp — klassiskt nyfikenhetsklick på för lång video. |
| `Seatcover_SP_3_1_H1` | proof · testimonial · AI-genererad statisk bild · fabricerad "kund" | **Policyflaggad, ej performance-dömd.** Fabricerad testimonial ("Verifierad kund, 54 år"). Rekommenderas pausad oavsett data. 8 kr spend. |

---

## Batch #2 — briefad 2026-07-30, launchad 2026-08-04 (12 annonser)

Hypoteserna nedan är de som faktiskt loggades i förväg (i chatten/brieferna
2026-07-30) — riktiga loggade hypoteser, inte rekonstruktion.

| Annons | Hypotes (loggad i förväg) | Vinkel · Hook-typ · Format · Talare | Utfall (2026-08-05, 1 dag) |
|---|---|---|---|
| `Seatcover_PD_4_H1` | Bevisad verbal hook ("Ingen mer blöt rumpa") + bevisade captions slår vinnarens rena demo-hook. Isolerad variabel: sekund 0–3. | bekvämlighet · negation/overlay+demo · rå video m. captions · ingen | **För tidigt.** 29 kr, 0 köp. |
| `Seatcover_PD_5_H1` | 15 s cutdown fångar samma budskap innanför uppmärksamhetsfönstret (halva publiken tappas 3–9,5 s i vinnaren). Isolerad variabel: längd/tempo. | bekvämlighet · fråga → demo · rå video, cutdown · ingen | **För tidigt.** 35 kr, 0 köp. |
| `Seatcover_PD_6_H1` | Pris-ankrets bevisade CVR (statik) flyttat till vinnarens videoformat kombinerar räckvidd med stängningsgrad. Isolerad variabel: persuasion-frame (pengar i st. f. komfort). | rädsla för kostnad · siffra/pris · rå video m. captions · ingen | **För tidigt.** 63 kr, 0 köp. |
| `Seatcover_SP_4_H1` | Kort (25–30 s) proof-led UGC med kvalificerande hook konverterar där lång UGC misslyckades. **BLOCKER: riktig kund/creator krävdes.** | proof · citat/demo · UGC-video · creator man | **För tidigt.** 57 kr, 0 köp. **QC:** launchad med befintlig overifierad kontocopy ("vanligaste kommentaren vi får"), inte ny brief-copy — oklart om filmpersonen är en riktig kund. |
| `Seatcover_PD_7_H1` | Mekanism/prevention-vinkel ("därför spricker sätet") expanderar publiken bortom redan skadade säten. | mekanism/prevention · påstående · rå video, materialdemo · ingen | **För tidigt.** 66 kr, 0 köp. |
| `Seatcover_SP_5_H1` | Narrativ struktur (3 akter) lyfter PD_2:s svaga före/efter-transformation. | proof/story · före-efter narrativ · UGC-video · creator man | **För tidigt.** 9 kr, 0 köp. |
| `Seatcover_SO_1_2` | Ta bort "överstruket"-buggen bibehåller eller förbättrar kontots bästa CVR. Ersätter `SO_1_1_H1`. | rädsla för kostnad · siffra/pris · offer-grafik (fixad) · ingen | **För tidigt.** 17 kr, 0 köp. **QC: visuellt verifierad korrekt** — riktig genomstrykning, ingen textbugg. |
| `Seatcover_PD_8_1` | Vinnarens "enkelhet"-bevis fungerar som stillbild för placeringar där video-retention är svagast. | bekvämlighet · 3-stegsdemo · statisk, steg-layout · ingen | **För tidigt.** 0,40 kr, 0 köp. |
| `Seatcover_PD_9_1` | Transformationen konverterar bättre som stillbild än som PD_2:s släpande video. | problem/lösning · före-efter · statisk, split · ingen | **För tidigt.** 7 kr, 0 köp. |
| `Seatcover_SP_6_1` | Äkta proof stänger den demo-uppvärmda publiken. **BLOCKER: riktig recensionstext krävdes (Judge.me-export väntad).** | proof · testimonial · statisk · fabricerad "kund" | **⚠️ POLICYBROTT.** 21 kr, 0 köp. **Launchad med fabricerad testimonial ("JAKOB, verifierat köp") trots explicit BLOCKER.** Ingen Judge.me-export har levererats. Rekommenderas pausad omgående — se dna.md. |
| `Seatcover_PD_10_1` | Checklist-persuasion bär som visuellt listicle-format. | bekvämlighet · listicle (4 känslomässiga punkter) · statisk · ingen | **För tidigt.** 72 kr, 0 köp. **QC: launchad med korrekt, känslomässigt omskriven text** enligt leverans 2026-08-05. |
| `Seatcover_SO_2_1` | Loss-frame ("vänta en säsong till?") matchar eller slår SO_1:s discount-frame. | rädsla för kostnad · risk/cost-of-inaction · statisk · ingen | **För tidigt.** 14 kr, 0 köp. |

**Sammanfattning batch #2:** Alla 12 annonser är < 24 h gamla — ingen är bedömbar
(signifikansgräns 300 kr/3 köp). Bedöms i nästa `/cs`. Två QC-avvikelser
identifierade vid granskning (se rad `SP_6_1` och `SP_4_H1` ovan).

---

## Batch #3 — byggs 2026-08-05 (denna runda)

Se slutrapporten för fullständiga briefer. Loggas här med hypotes + taggar när
brieferna är klara nedan.

| Annons | Hypotes | Vinkel · Hook-typ · Format · Talare | Utfall |
|---|---|---|---|
| `Seatcover_PD_11_1` | Se brief | material/kvalitet · jämförelse · statisk, split · ingen | Ej launchad än |
| `Seatcover_SO_3_1` | Se brief | identity/gift · påstående · statisk · ingen | Ej launchad än |
| `Seatcover_PD_12_H1` | Se brief | bekvämlighet · POV/fråga · rå video, nativ stil · ingen | Ej launchad än |
