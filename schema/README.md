# Arbetsschema med notiser 📅🔔

Ett schema som pingar din mobil för varje arbetsblock — så du får in **~7 h
effektivt arbete/dag** utan att behöva hålla koll på klockan själv. Plus
förberedelse-påminnelser inför **uppkörningen måndag 13 juli**.

## Så får du notiserna i mobilen (importera en gång)

Filen `arbetsschema.ics` är en vanlig kalenderfil. Importera den så dyker varje
block upp som en händelse med notis — automatiskt, varje dag, för alltid.

**Google Kalender (enklast, funkar på Android + iPhone)**
1. Öppna [calendar.google.com](https://calendar.google.com) på datorn.
2. Kugghjul → **Inställningar** → **Importera och exportera** → **Importera**.
3. Välj `arbetsschema.ics`, klicka **Importera**.
4. Se till att Google Kalender-appen på mobilen har **notiser på**
   (mobilens Inställningar → Appar → Kalender → Notiser).

**iPhone (Apple Kalender)**
1. Maila `arbetsschema.ics` till dig själv, öppna bilagan på telefonen.
2. Tryck **Lägg till alla** → välj en kalender.
3. Inställningar → Kalender → Standardaviseringar → sätt på.

Klart. Nu poppar det upp en notis när varje block börjar.

## Dagsschemat (mån–fre)

| Tid | Block | Längd |
|-----|-------|-------|
| 08:00 | ☀️ Morgonrutin + planera dagen | 30 min |
| 08:30 | 🎯 Djupfokus 1 (dagens viktigaste) | 90 min |
| 10:00 | 💧 Paus – rör på dig + vatten | 15 min |
| 10:15 | 🎯 Djupfokus 2 | 90 min |
| 11:45 | 🍽️ Lunch (borta från skärmen) | 45 min |
| 12:30 | 🎯 Djupfokus 3 | 90 min |
| 14:00 | 🚶 Paus – ut och gå | 20 min |
| 14:20 | 🎯 Djupfokus 4 | 90 min |
| 15:50 | ☕ Kort paus | 15 min |
| 16:05 | 🧹 Admin/analys/svara | 70 min |
| 17:15 | ✅ Dagsavslut – logga vad du gjorde | 15 min |

**Effektivt arbete: ~7,2 h/dag.** Pauserna är där för att du ska orka hålla det
här varje dag — inte tappa ångan efter tre dagar. Vill du ligga närmare 8 h,
förläng admin-blocket eller lägg till lördag (se nedan).

## Inför uppkörningen (mån 13 juli)

Engångs-påminnelser som redan ligger i filen:

- **Tors–lör:** MC-pass för att öva momenten (backning, lågfart, bromsprov, blick).
- **Sön 21:30:** lägg fram utrustningen, sov ut.
- **Mån 07:30:** UPPKÖRNING — **ändra tiden till din faktiska tid** (se nedan).

> ⚠️ Sätt din riktiga uppkörningstid: öppna `schema/generate.mjs`, hitta raden
> med `"2026-07-13"`, ändra `tid: "07:30"` till din tid, kör `node schema/generate.mjs`
> och importera om filen. Eller bara flytta händelsen direkt i kalendern efter import.

## Ändra schemat

Allt styrs från toppen av `schema/generate.mjs`:

- `ARBETSDAGAR` — lägg till `"SA"` för lördag, `"SU"` för söndag.
- `DAGSSCHEMA` — ändra tider, längd eller lägg till/ta bort block.
- `HANDELSER` — engångshändelser (uppkörning m.m.).

Kör sen om:

```bash
node schema/generate.mjs
```

…och importera `arbetsschema.ics` på nytt (Google Kalender skriver över det
gamla eftersom händelserna har samma ID).
