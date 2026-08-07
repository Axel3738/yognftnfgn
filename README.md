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
| `docs/playbook.md` | Spelboken — vinnande angles/format/hooks som vi bevisat över tid |

## Aktivt setup

- **Brand:** Grillkliniken (grillkliniken.se) · brand-kod `GRILL`
- **Produkt vi kör ads för:** **Mastern** — elektrisk grillborste, 999 kr (enda produkten just nu)
- **Ad accounts:**
  - SnarkLös (`1346450049878358`, SEK) — kontonamnet ≠ brandnamnet
  - MagiBorsten (`1867947880635861`) — aktiverat för API-push: `node pipeline/ads.mjs ... --account=magi`
- **Funnel-fokus:** BOF (bottom of funnel)

Övriga tillgängliga konton (ej i bruk): Matstrumpor.se `730973156224390` (⚠️ UNSETTLED).

Ads laddas upp och styrs direkt härifrån via Meta Marketing API — se
`pipeline/README.md` → "Koppla Meta" (token som secret) och "Styr Ads Manager".

## Status

🟢 Ramverk + BOF-research klar. 7 koncept loggade i trackern (idéstadie).
⏭️ Nästa: din "tro" på koncepten + Higgsfield-koppling → bygg första vågen (A + B).
📥 Parallellt: du skickar egna annonser → vi döper + bedömer dem i trackern.
