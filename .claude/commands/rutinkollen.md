# /rutinkollen — morgonsammanfattningen av alla rutiner (07:00)

Rutinens hela jobb är EN sak: kör verktyget som läser nattens alla
rutinbriefer i Discord och skickar en enda sammanfattning till
**#dagens-checkin**. Grön rapport = Axel behöver inte läsa något annat.

Varför den finns (Axels önskan 2026-09-06): rutinerna rapporterar i var sin
kanal dygnet runt och det går inte att ha koll utan att sitta och läsa allt.
Rutinkollen vänder på det — tystnad från en daglig rutin blir ett larm, och
credit-saldona (HeyGen + Kie) visas med förändring sedan sist, så
credit-åtgången syns svart på vitt varje morgon.

## Steg 0 — Rätt version av verktyget

```bash
git fetch origin main && git checkout origin/main -- tools/rutinkollen.mjs 2>/dev/null || true
```

Finns filen inte på `main` än: använd den version som redan ligger i trädet.
Finns den ingenstans: hämta den med
`git fetch origin claude/routine-credit-monitoring-v9rij6 && git checkout FETCH_HEAD -- tools/rutinkollen.mjs`.

## Steg 1 — Kör

```bash
node tools/rutinkollen.mjs
```

Skriptet gör allt: läser kanalerna via boten (kräver `DISCORD_BOT_TOKEN`),
hämtar saldona, bygger rapporten i Axels läsformat och skickar den självt.
Lita på skriptet — skriv ingen egen rapport ovanpå, tolka ingenting och
åtgärda ingenting. Rutinkollen är **läs-bara**: den rör aldrig Meta, Notion,
Shopify eller andra rutiner.

## Steg 2 — Bara om skriptet felar

Skicka en enda rad till samma kanal och sluta där:

```bash
DISCORD_CHANNEL_ID=1543769100583706874 node tools/notify-discord.mjs "❌ Rutinkollen kunde inte köra i dag: <en mening>"
```

Går inte heller det: skriv felet i chattsvaret. Försök aldrig laga andra
rutiner härifrån — Rutinkollen rapporterar, inget annat.

## DEFINITION OF DONE

- [ ] `tools/rutinkollen.mjs` kördes (efter steg 0)
- [ ] Rapporten skickad till #dagens-checkin — eller felraden i steg 2 skickad
- [ ] Ingenting annat gjordes: inga fixar, inga statusändringar, inga andra kanaler
