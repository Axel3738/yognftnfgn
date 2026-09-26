# NO-videobatch 2026-09-26 — rutinen `/translate-no`

## Fas 0 — Inventering

Lokal `main` låg efter origin (force-pushad historik sedan container-klonen) —
synkad med `git reset --hard origin/main` innan något annat gjordes.

LAUNCHED (`1-vbYhYgTEv7zYptW5rGmgKAITmAz4l1X`) listad: 20 produktmappar
(WINNERS, LOSERS, MAKE TO NORWAY exkluderade). MAKE TO NORWAY listad rekursivt
inkl. undermappen WINNERS (44 NO-mappar totalt). Kampanjlistan i
`act_1050941584152547` läst (49 kampanjer, oavsett status).

**Nio NYA produktmappar sedan 2026-09-24:** 10 Täljset 30 delar, 10 Värmesits
45 × 90 cm, 11 Maskinhyllan, 12 Radiostyrd driftbil 1:24, 8 Dörr- och
Fönsterlarm 110 dB, K Golfkalender, Motorlås utombordare, Pussel
Adventskalender, Solcellsladdare — ingen av dem har vare sig NO-mapp eller
kampanj, alla är alltså nya kandidater.

**Kön från 2026-09-24/25 kvarstår, i väntan på kreditpåfyllning:**
ATV-Kapell och Kapell till snöslunga (SRT-lokalisering klar och committad
2026-09-24, proofreadId:n sparade i batch.json.state.json — ingen ny
proofread-kostnad när rendering väl blir möjlig), Spabadskapell (aldrig
påbörjad), Kajakhållare (NO-mapp + kampanj finns redan, ACTIVE med 4 av 10
videor — 6 videor + Fas 3.2-bildannonser kvar, känd lucka sedan 2026-09-24).

Kända blockerade, omkontrollerade, oförändrat sedan tidigare — ingen ny
problemrapport: **Snöskyffel utan batteri** (ingen produkt på
beverbutikken.no) och **Biltvättborste Teleskop** (samma, batch-sheet #8
OVERSIZE).

## Kvot — STOPP FÖRE START (samma orsak som i går, förvärrad)

`node pipeline/localize.mjs check`: **6 api-krediter kvar** (`plan_credit`
2000 är en annan pott och gäller inte proofread/render — `quotaGuard` i
`translate-batch.mjs` styr uteslutande på `details.api`). I går stod det på
24; i dag 6 — kvoten har alltså sjunkit YTTERLIGARE utan att den här rutinen
renderat något, vilket talar för att något annat drar av samma
HeyGen-konto (subscriptions@stonebite.org).

Fas 0 punkt 4: "Räcker inte kvoten: STANNA, be Axel fylla på, launcha inget."
6 krediter räcker inte till en enda proofread-session (historiskt
~1 kredit/påbörjad videominut, och batch-sheet-produkterna har 12-videobatchar
= minst 12+ krediter bara för proofread). **Ingen proofread, ingen rendering
körd.** Fas 1–3 utgår helt, precis som 2026-09-25.

## Fas 1–3

Ingen körning — kvoten räcker inte till en enda video.

## Fas 4 — Logga, pusha och briefa

Körloggen uppdaterad i `docs/video-localization.md`. Commit + push.
Discord: problemmeddelande om krediterna (nu allvarligare läge än i går) +
den dagliga briefen, båda med ping.
