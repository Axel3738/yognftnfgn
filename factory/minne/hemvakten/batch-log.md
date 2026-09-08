# Batch-logg — HeimGuard (övervakningskameran)

En rad per annons: datum, annonsnamn, hypotes, variabeltaggar. Utfallet fylls i
av NÄSTA `/skalningskungen`-körning, aldrig av den som launchade.

**Status 2026-09-08: inga batcher launchade.** Butiken har noll annonser i
MagiBorsten DK.

---

## Mall för varje batch

```
## Batch #N — YYYY-MM-DD

**Kvotläge vid launch:** X creatives / 3-dagarscykel, läge ±Y
**Linjer:** break-even-ROAS Z / CPA Z kr · target-ROAS Z / CPA Z kr
**AOV räkningen bygger på:** X kr (källa + datum)

| Annons | Hypotes | Vinkel | Hook-typ | Format | Proof | Offer | Visuell stil | Talare | Utfall |
|---|---|---|---|---|---|---|---|---|---|
| HEIMGUARD_… | … | TR | fråga | UGC-tal | recension | pris syns | — | creator kvinna | *(fylls av nästa körning)* |
```

Ärvda annonser från Bäverbutiken märks `ÄRVD FRÅN <produkt>` med källdatum, och
deras utfall gällde Bäverbutikens publik, pris och sida — de är hypoteser här.
