# SOP-02: Brief-kvoten — mål nr 1

**Regeln:** För varje aktiv produkt måste vi launcha tillräckligt många nya creatives
var 3:e dag. Detta är verksamhetens viktigaste mål. Allt annat (dashboard, snyggare
briefer, mer research) är sekundärt.

## Formeln

```
kvot per 3-dagarscykel = (daglig budget × testandel) ÷ target-CPA × 3

testandel = 20 %  vid daglig budget under 5 000 kr
testandel = 10 %  vid daglig budget 5 000 kr och över
```

På hög skala räcker en mindre andel: 10 % av 20 000 kr är fortfarande mer
testbudget i kronor än 20 % av 4 000 kr, och antalet nya creatives som behövs
växer inte linjärt med budgeten.

Exempel Motorhöljet idag: 6 000 kr/dag (≥5 000 → 10 %) → 600 kr ÷ 135 kr × 3 =
**14 creatives per 3-dagarscykel** (~4,5 per dag). Skalar budgeten upp, skalar
kravet upp — och vinnare med låg CPA får högst krav, vilket är rätt: de förtjänar
mest kreativt bränsle.

## Hur den följs

- Konfig + logg ligger i `products/products.json`. Skriptet `pipeline/quota.mjs`
  räknar ut läget:
  - `node pipeline/quota.mjs` → 🟢/🔴 och exakt hur många creatives före/efter plan vi ligger.
  - `node pipeline/quota.mjs log motorholjet 4` → logga 4 launchade creatives.
- **Varje daglig check-in (`/checkin`) börjar med kvoten** och hämtar färsk budget från
  Ads Manager, så siffran aldrig bygger på gammal budget.
- **Batcharna dimensioneras av kvoten:** testplanen i varje `/forsta-batch`- och
  `/cs`-batch måste innehålla minst kvotens antal annonser (står i kommandonas checklistor).
- En creative räknas när den är **live eller schemalagd i Ads Manager** — inte när
  briefen är skriven, inte när redigeraren levererat filen.

## Regler

1. `target_cpa_sek` sätts av ägaren (Axel). Claude eller managern ändrar den aldrig
   på egen hand.
2. `daily_budget_sek` uppdateras från Ads Manager i varje daglig check-in.
3. Ny produkt aktiveras genom att lägga till ett objekt i `products/products.json`
   med `cycle_start` = launchdagen. Pausad produkt: sätt `status` till `"pausad"`.
4. Ligger en produkt 🔴 två cykler i rad → eskalera till ägaren. Det betyder att
   produktionskedjan (briefs → redigering → launch) har ett strukturproblem,
   inte att teamet ska "jobba hårdare" en dag.

## Kapacitetscheck (så kvoten är realistisk)

7 creatives/dag för en produkt ≈ 2 heltidsredigerare om en video tar ~2 h och en
statisk ~30 min (statics bör vara ~60 % av mixen). När kvoten höjs (budgethöjning):
räkna om kapaciteten FÖRST. Kvot utan kapacitet = permanent 🔴 och demoraliserat team.
