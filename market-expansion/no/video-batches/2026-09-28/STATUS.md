# NO-videobatch 2026-09-28 — rutinen `/translate-no`

## Fas 0 — Inventering (gratis, komplett)

Lokal `main` låg efter origin (samma mönster som i går, force-pushad
historik från andra rutiner) — synkad med `git reset --hard origin/main`
innan något annat gjordes.

LAUNCHED (`1-vbYhYgTEv7zYptW5rGmgKAITmAz4l1X`) listad: **19 produktmappar**
(WINNERS, LOSERS, MAKE TO NORWAY exkluderade). MAKE TO NORWAY listad
rekursivt inkl. undermappen WINNERS (44 NO-mappar). Kampanjlistan i
`act_1050941584152547` läst (49 kampanjer, oavsett status) — oförändrad
sedan i går, ingen ny kampanj.

**Tre mappar som såg nya ut vid en första titt var redan klara** (kontrollerat
mot MAKE TO NORWAY, inte bara mot namnet): 10 Fågelmatare med kamera → NO
Fågelmatare finns, 8 Solcellslampa 210 LED Sensor → NO Solcellslampa 210 LED
Sensor finns, 8 Sotarset Böjliga Stänger → NO Sotarset finns (kampanjen heter
"Feiesett NO"). Alla tre redan behandlade, inga nya kandidater.

**De sju giltiga kandidaterna från 2026-09-26/27, oförändrat läge** (i
norska butiken, utan NO-mapp, utan kampanj): Dörr- och Fönsterlarm 110 dB,
Maskinhyllan, Motorlås utombordare, Radiostyrd driftbil 1:24,
Solcellsladdare, Täljset 30 delar, Värmesits 45 × 90 cm.

**Kända blockerade, omkontrollerade mot beverbutikken.no (235 produkter) —
fortfarande inte i butiken, ingen ny problemrapport:** Golf Adventskalender,
Pussel Adventskalender, Snöskyffel utan batteri, Biltvättborste Teleskop
(dessutom OVERSIZE i batch-sheet #8).

**Äldre kö, oförändrat:** ATV-Kapell och Kapell till snöslunga (SRT-lokalisering
klar och committad sedan 2026-09-24, proofreadId:n sparade), Spabadskapell
(aldrig påbörjad), Kajakhållare (NO-mapp + kampanj "Kajakkholder NO" ACTIVE,
4 av 10 videor live, 6 videor + Fas 3.2-bildannonser kvar).

## Kvot — STOPP FÖRE START (fjärde dagen i rad, oförändrat läge)

`node pipeline/localize.mjs check`: **6 api-krediter kvar** — exakt samma
som 2026-09-26 och 2026-09-27. Ingen förbrukning och ingen påfyllning sedan
dess.

**Kontrollerat extra i dag:** även `render`-steget (inte bara `proofread`)
kräver api-krediter — `quotaGuard(jobs.length)` i `translate-batch.mjs`
läser `details.api`, inte `plan_credit` (som står på 2000). Det gäller
alltså även ATV-Kapell och Kapell till snöslunga, som redan har proofread
och rättad SRT klar sedan 2026-09-24: `render` för endera produkten kräver
minst 12 api-krediter (en per video i manifestet, `--bara` väljer hela
produkten, inte enskilda videor) — 6 räcker inte ens till dem, trots att
proofread-kostnaden redan är betald. Det finns alltså inget kredit-snålt
sätt att komma vidare i dag.

Fas 0 punkt 4: "Räcker inte kvoten: STANNA, be Axel fylla på, launcha inget."
**Ingen proofread, ingen rendering körd.** Fas 1–3 utgår helt, fjärde dagen
i rad.

## Fas 1–3

Ingen körning — kvoten räcker inte till en enda video, inte ens en
färdigproofreadad sådan.

## Fas 4 — Logga, pusha och briefa

Körloggen uppdaterad i `docs/video-localization.md`. Commit + push.
Discord: den dagliga briefen med ping, samma budskap som de tre senaste
dagarna — krediterna är fortfarande slut och har inte fyllts på.
