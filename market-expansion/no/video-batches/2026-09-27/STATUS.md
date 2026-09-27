# NO-videobatch 2026-09-27 — rutinen `/translate-no`

## Fas 0 — Inventering (gratis, komplett)

Lokal `main` låg efter origin (force-pushad historik) — synkad med
`git reset --hard origin/main` innan något annat gjordes.

LAUNCHED (`1-vbYhYgTEv7zYptW5rGmgKAITmAz4l1X`) listad: **19 produktmappar**
(WINNERS, LOSERS, MAKE TO NORWAY exkluderade — en mapp färre än 2026-09-26,
men samtliga 9 "nya" mappar från i går finns kvar oförändrade). MAKE TO
NORWAY listad rekursivt inkl. undermappen WINNERS (45 NO-mappar totalt).
Kampanjlistan i `act_1050941584152547` läst (49 kampanjer, oavsett status)
— ingen av de nio nya produkterna från i går har fått kampanj sedan dess.

**De nio kandidaterna från 2026-09-26 kontrollerade mot beverbutikken.no
(234 produkter, en sida) — inte gjort i går:**
- ✅ Finns i norska butiken: Spikkesett 30 Deler (Täljset), Varmesete 45 × 90 cm
  (Värmesits), Vegghengt Verktøyhylle (Maskinhyllan), Radiostyrt Driftbil 1:24
  (Radiostyrd driftbil), Dør- og Vindusalarm 110 dB (Dörr- och Fönsterlarm),
  Motorlås (Motorlås utombordare), Solcellelader 10 W MPPT (Solcellsladdare).
  **7 av 9 är alltså giltiga kandidater**, redo att köras så fort krediterna
  räcker.
- ⚠️ **Finns INTE i norska butiken — nya problem, rapporterade i natt:**
  Golf Adventskalender (K Golfkalender) och Pussel Adventskalender. Två
  problemmeddelanden skickade till `#problems-no` med ping.

Kända, oförändrade blockerade (ingen ny rapport): **Snöskyffel utan
batteri** och **Biltvättborste Teleskop** (ingen produkt på beverbutikken.no,
Biltvättborste dessutom OVERSIZE i batch-sheet #8).

**Kön, i väntan på kreditpåfyllning (i bokstavsordning bland giltiga
kandidater):** Täljset 30 delar, Värmesits 45×90 cm, Maskinhyllan,
Radiostyrd driftbil 1:24, Dörr- och Fönsterlarm 110 dB, Motorlås
utombordare, Solcellsladdare — plus de äldre i kön: ATV-Kapell och Kapell
till snöslunga (SRT-lokalisering klar och committad sedan 2026-09-24,
proofreadId:n sparade — ingen ny proofread-kostnad när rendering blir
möjlig), Spabadskapell (aldrig påbörjad), Kajakhållare (NO-mapp + kampanj
finns, ACTIVE med 4 av 10 videor — 6 videor + Fas 3.2-bildannonser kvar).

## Kvot — STOPP FÖRE START (tredje dagen i rad, oförändrat läge)

`node pipeline/localize.mjs check`: **6 api-krediter kvar** — exakt samma
som i går (2026-09-26). Ingen förbrukning har skett (ingen proofread/render
här sedan 2026-09-24), och kvoten har inte heller sjunkit ytterligare i dag.

Fas 0 punkt 4: "Räcker inte kvoten: STANNA, be Axel fylla på, launcha inget."
6 krediter räcker inte till en enda proofread-session (historiskt ~1
kredit/påbörjad videominut, batch-sheet-produkterna har 12-videobatchar).
**Ingen proofread, ingen rendering körd.** Fas 1–3 utgår helt.

## Fas 1–3

Ingen körning — kvoten räcker inte till en enda video.

## Fas 4 — Logga, pusha och briefa

Körloggen uppdaterad i `docs/video-localization.md`. Commit + push.
Discord: tre problemmeddelanden (Golf Adventskalender, Pussel
Adventskalender, krediterna fortfarande otillräckliga) + den dagliga
briefen, alla med ping.
