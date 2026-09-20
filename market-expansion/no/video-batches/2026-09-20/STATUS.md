# NO-videobatch 2026-09-20 — rutinen `/translate-no`

## Fas 0 — Inventering

LAUNCHED (`1-vbYhYgTEv7zYptW5rGmgKAITmAz4l1X`) listad: 15 produktmappar
(WINNERS, LOSERS, MAKE TO NORWAY exkluderade som mappar, inte kandidater).
MAKE TO NORWAY listad rekursivt inkl. undermappen WINNERS (40 NO-mappar +
WINNERS-mappen). Kampanjlistan i `act_1050941584152547` läst (46 kampanjer,
oavsett status).

10 av 15 produktmappar redan täckta (NO-mapp finns): Fågelmatare med kamera,
Lövblåsare, Infartslarm Trådlöst, Solcellslarm 2-pack, Stegstöd 2-pack,
Termoskydd Husbil, Solcellslampa 210 LED Sensor, Vedklyvborr, Fodrade
Inomhustofflor, K Dinosauriekalender.

**Staketstolpslagare — rättelse, INTE en ny kandidat.** Mappen saknar
`NO`-motsvarighet under exakt det namnet, men produkten är samma som
`Staketstolpsbygel 2-pack` (baverbutiken.se-handeln är fortfarande
`staketstolpslagare-2-pack-raddar-stolpen-utan-att-grava` — produkten döptes
om, handlen är kvar från det gamla namnet). Norska motsvarigheten
(`NO Staketstolpsbygel`, kampanj **"Gjerdestolpebøyle NO \| BE-ROAS 1,63 \|
2026-09-13"**) är redan launchad. Ingen ny mapp skapad, ingen dubblett.

Kvar: fyra riktiga kandidater, alla blockerade — **0 körbara i natt.**

| Produktmapp | NO-mapp | Kampanj | Dom |
|---|---|---|---|
| 10 Snöskyffel utan batteri | ❌ | ❌ | **blockerad, oförändrat** — finns inte på beverbutikken.no (202 produkter genomsökta). Ingen ny problemrapport (samma orsak flaggad 2026-09-19). |
| 7 Sittkäpp Hopfällbar | ❌ | ❌ | **blockerad, oförändrat sedan 2026-09-16** — batch-sheet #7, NORWAY-blocket säger fortfarande "Too large to deliver at all". Produkten HAR fått en norsk butikssida ("Sammenleggbar Sittestokk – Stokk og Stol i Ett") men det löser inte fraktproblemet. Ingen ny rapport. |
| Biltvättborste Teleskop | ❌ | ❌ | **blockerad, oförändrat** — batch-sheet #8, NORWAY-blocket säger fortfarande "OVERSIZE". Ingen ny problemrapport (samma orsak flaggad 2026-09-19). |
| K Gör din egen-kalender | ❌ | ❌ | **blockerad, NY dom i natt** (stod i kö oprövad två nätter i rad) — finns inte på beverbutikken.no. Norge-COGS finns faktiskt (Kalenderkungen-sheet, NORWAY Qty 1: 19,13 EUR total ex tax) men produktsidan saknas, så steg 3 stoppar innan COGS ens spelar roll. **Problemrapport skickad till `#problems-no`.** |

Inga produkter i kö till nästa natt utöver de fyra ovan (alla redan
utvärderade i natt, ingen väntar bara på sin tur).

## Kvot

HeyGen-kvot vid start: 2 558 api-krediter (oförändrat sedan 2026-09-19 —
`node pipeline/localize.mjs check` bekräftar). **Ingen proofread, ingen
rendering** — inget att köra. Kvot vid slut: 2 558 (oförändrat).

## Fas 1–3.5

Ingen produkt körbar i natt — faserna 1 (proofread/lokalisering),
2 (rendering/captions), 3 (Meta-launch), 3.2 (bildannonser) och 3.5
(Drive-leverans) utfördes inte.

## Fas 4 — Brief

Problemrapport skickad (K Gör din egen-kalender). Ingen brief-video/bild att
leverera i chatten. Körloggen (`docs/video-localization.md`) uppdaterad.
Discord-brief skickad till `#translation-till-norge-av-nya-produkter`.

## Definition of done

- [x] LAUNCHED listad; WINNERS, LOSERS och MAKE TO NORWAY exkluderade;
      kandidater = utan NO-mapp (rekursivt) OCH utan kampanj i NO-kontot;
      max 3 körda (0 av 0 körbara), ingen kö
- [x] Alla produktmappar inventerade (15 st); icke-annonser exkluderade
- [x] Norsk produktsida verifierad för varje kandidat (3 av 4 saknar sida)
- [x] Varje produkt som inte gick att köra: bedömd; ny problemrapport bara
      för den produkt vars dom var ny i natt (K Gör din egen-kalender) —
      de tre övriga är samma orsak som redan flaggats, ingen ny ping
- [x] Norge-COGS läst ur rätt batch-sheet där relevant, utan tull
- [x] Kvot räckte — men inget kördes, så kvot orörd (2 558 → 2 558)
- [ ] Proofread FÖRE rendering — n/a, inget kördes
- [ ] Copy/SRT-rader skrivna av sonnet-subagent — n/a, inget kördes
- [ ] Inbränd svensk text skannad — n/a, inget kördes
- [ ] Slutkortssvep gjort — n/a, inget kördes
- [ ] Levererat i chatten som zip — n/a, inget kördes
- [ ] Kampanj per produkt launchad — n/a, inget kördes
- [x] Körloggen uppdaterad, allt committat och pushat
- [x] Discord-brief skickad i `#translation-till-norge-av-nya-produkter`, i
      Axels läsformat, med ping
