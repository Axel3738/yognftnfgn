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
| `docs/playbook.md` | Spelboken — vinnande angles/format/hooks som vi bevisat över tid |

## Konton

| Brand | Ad account ID | Status | Valuta |
|-------|---------------|--------|--------|
| MagiBorsten | 1867947880635861 | ✅ redo (betalmetod) | SEK |
| SnarkLös | 1346450049878358 | ✅ redo (betalmetod) | SEK |
| Matstrumpor.se | 730973156224390 | ⚠️ UNSETTLED (går ej att köra) | SEK |

Shopify-butik kopplad i sessionen: **Grillkliniken** (grillkliniken.se)

## Status

🟡 Ramverk uppsatt. Väntar på: vilket brand vi kör först + primärt mål (sälj/trafik/etc).
