# Bäverbutiken – Creative OS

> **Ny session eller nytt konto? Börja i [`HANDOFF.md`](HANDOFF.md)** — vad som är
> byggt, vad som återstår, vilka regler som inte får brytas och vilka connectors
> som måste kopplas.
>
> Därefter: [`CLAUDE.md`](CLAUDE.md) → [`docs/os/ACTIONPLAN.md`](docs/os/ACTIONPLAN.md).
> SOP:erna ligger i `docs/os/`, managerns kommandon i `.claude/commands/`.
> Brief-kvoten (mål nr 1): `node pipeline/quota.mjs`.

# Image Ad Pipeline (LEGACY — annat brand)

> ⚠️ Allt nedanför denna rad är äldre Grillkliniken/Mastern-arbete och ingår INTE
> i Bäverbutiken-OS:et. Behålls som referens. Bäverbutikens system ligger i
> `docs/os/`, `.claude/commands/` och `products/`.

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
- **Ad account:** SnarkLös (`1346450049878358`, SEK) — kontonamnet ≠ brandnamnet
- **Funnel-fokus:** BOF (bottom of funnel)

**Bäverbutiken.se** (general store) kör i **MagiBorsten** `1867947880635861` —
produkttester enligt `docs/os/SOP-06-produkttest.md`, aktiva produkter i
`products/products.json`. Övrigt konto (ej i bruk): Matstrumpor.se
`730973156224390` (⚠️ UNSETTLED).

## Status

🟢 Ramverk + BOF-research klar. 7 koncept loggade i trackern (idéstadie).
⏭️ Nästa: din "tro" på koncepten + Higgsfield-koppling → bygg första vågen (A + B).
📥 Parallellt: du skickar egna annonser → vi döper + bedömer dem i trackern.
