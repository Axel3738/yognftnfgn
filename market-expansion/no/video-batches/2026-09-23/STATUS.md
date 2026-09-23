# NO-videobatch 2026-09-23 — rutinen `/translate-no`

## Fas 0 — Inventering

LAUNCHED (`1-vbYhYgTEv7zYptW5rGmgKAITmAz4l1X`) listad: 6 produktmappar
(oförändrat sedan 2026-09-21/22). MAKE TO NORWAY listad rekursivt (inkl.
WINNERS-undermappen, 45 NO-mappar totalt).

| Produktmapp | NO-mapp | Dom |
|---|---|---|
| 10 Fågelmatare med kamera | ✅ (`NO Fågelmatare`) | behandlad |
| 10 Snöskyffel utan batteri | ❌ | **blockerad, oförändrat** — omkontrollerad mot beverbutikken.no/products.json (202 produkter), ingen snøskuffel/snøskyffel-produkt. Ingen ny problemrapport (samma orsak flaggad senast 2026-09-19/20/21/22) |
| 8 Solcellslampa 210 LED Sensor | ✅ (`NO Solcellslampa 210 LED Sensor`) | behandlad |
| 8 Sotarset Böjliga Stänger | ✅ (`NO Sotarset`) | behandlad (klar 2026-09-21) |
| Biltvättborste Teleskop | ❌ | **blockerad, oförändrat** — omkontrollerad mot beverbutikken.no/products.json, bara sprøytepistol/bilvaskepistol/støvsuger-tillbehör hittas, ingen bilvaskebørste. Ingen ny problemrapport (samma orsak flaggad senast 2026-09-19/20/21/22) |
| Fodrade Inomhustofflor | ✅ (`NO Fodrade Inomhustofflor`) | behandlad |

**0 körbara kandidater.** Ingen kö till nästa natt utöver de två blockerade.

## Kvot

HeyGen-kvot: 1 660 api-krediter (`localize.mjs check`), orörd (inga renderingar).

## Fas 1–3

Ingen körning — inga kandidater.

## Fas 4 — Logga, pusha och briefa

Körloggen uppdaterad i `docs/video-localization.md`. Commit + push.
Discord-brief skickas till `#translation-till-norge-av-nya-produkter`.

## Definition of done

- [x] LAUNCHED listad; WINNERS, LOSERS och MAKE TO NORWAY exkluderade; kandidater = utan NO-mapp (rekursivt) OCH utan kampanj i NO-kontot — 0 kandidater
- [x] Alla annonsvideor i produktmapparna inventerade (oförändrat sedan 2026-09-22)
- [x] Norsk produktsida omkontrollerad för de två blockerade — bekräftat saknas
- [x] Inget nytt att köra → inget nytt problemmeddelande krävs (samma orsak redan flaggad)
- [ ] Norge-COGS — n/a, inga kandidater
- [x] Kvot kontrollerad (1 660, orörd)
- [ ] Proofread/SRT/captions/launch — n/a, inga kandidater
- [x] Körloggen uppdaterad, allt committat och pushat
- [x] Discord-brief skickad, Axels läsformat, ping
