# Image Ad Pipeline

Ett system för att bygga bildannonser (Meta/Facebook/Instagram), namnge dem smart så
att datan går att skära, och sedan iterera på det som faktiskt funkar.

## Idén i en mening

> Varje annons är ett **test**. Namnet kodar vad vi testar. När datan kommer in
> läser vi av per variabel (angle / format / hook), drar en slutsats och bygger
> nästa våg på vinnarna.

## Loopen

```
  1. HYPOTES      → varför tror vi på den här annonsen? (loggas i tracker)
  2. BYGG         → skapa creative + annons med smart namn
  3. TESTA        → publicera, låt den samla data
  4. ANALYSERA    → skär datan per variabel, jämför mot benchmark
  5. LÄR          → verdict: skala / iterera / döda
  6. ITERERA      → nästa våg bygger på vinnarna → tillbaka till 1
```

## Struktur

| Fil | Vad |
|-----|-----|
| `docs/naming-convention.md` | Namnsystemet — hur varje annons döps så datan går att analysera |
| `docs/ad-tracker.md` | **Live-dokumentet** — varje annons, hypotes, vem som tror på den, resultat, lärdom |
| `docs/winning-lines.md` | **Punchline-banken** — analys av dina top spenders + vinnande lines för statics |
| `docs/bof-concepts.md` | BOF-research (konkurrentanalys) + de första annonskoncepten för Mastern |
| `docs/sushi-strumpor-concepts.md` | Sushi strumpor — research + första koncepten för Matstrumpor.se |
| `docs/playbook.md` | Spelboken — vinnande angles/format/hooks som vi bevisat över tid |

## Aktivt setup

**Spår 1 — Grillkliniken**
- **Brand:** Grillkliniken (grillkliniken.se) · brand-kod `GRILL`
- **Produkt:** **Mastern** — elektrisk grillborste, 999 kr
- **Ad account:** SnarkLös (`1346450049878358`, SEK) — kontonamnet ≠ brandnamnet
- **Funnel-fokus:** BOF (bottom of funnel)

**Spår 2 — Sushi strumpor (nytt 2026-07-24)**
- **Brand:** Matstrumpor.se · brand-kod `MATSTRUMP` · produkt-kod `sushi`
- **Ad account:** förslag **"Sushi kanske?"** (`1550615276530638`, SEK) — ⚠️ saknar betalmetod.
  Gamla kontot "nya kungen" (`730973156224390`) är UNSETTLED.
- **Funnel-fokus:** TOF — impuls-/presentprodukt

Övriga tillgängliga konton (ej i bruk): MagiBorsten `1867947880635861`,
NYC Grill `1023341917138110` (USD).

## Status

🟢 Ramverk + BOF-research klar. 7 GRILL-koncept + 6 MATSTRUMP-koncept loggade i trackern.
⏭️ Nästa GRILL: din "tro" på koncepten → bygg första vågen (A + B).
⏭️ Nästa MATSTRUMP: betalmetod på "Sushi kanske?" + svar på öppna frågor i `sushi-strumpor-concepts.md`.
📥 Parallellt: du skickar egna annonser → vi döper + bedömer dem i trackern.
