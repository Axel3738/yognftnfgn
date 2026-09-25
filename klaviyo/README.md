# klaviyo/: Bäverbutikens e-postmarknadsföring (byggt 2026-09-24)

Axels beställning 2026-09-24: "Börja fixa email MARKETING på riktigt … köra claude
med klaviyo och börja köra massa kampanjer", kopplat till creative strategy och
Evolve-metoden. Bygget sker först med Claude, och utförandet flyttas till en VA
när rutinen fungerar (Arvids princip). Inga schemalagda rutiner byggs förrän Axel
säger till.

## Läget (2026-09-24 natt)

| Del | Status |
|---|---|
| Motorn (`klient`, `metriker`, `segment`, `kolla`, `ladda-upp`, `rapport`) | Klar och testad mot en falsk Klaviyo. **Aldrig körd mot kontot:** ingen nyckel fanns. |
| Mallbyggaren (`mallar`, `validera`, `produkter`, `recensioner`, `bygg`) | Klar. Bygger med live-priser ur Shopify och riktiga Judge.me-recensioner. |
| Innehåll | 14 kampanjer (K01–K14, 29 sep–1 dec) och 7 flöden (F01–F07). Copyn skrevs av Sonnet enligt `docs/copy-regler.md`. |
| Strategi | `docs/os/EPOST-STRATEGI.md` |
| VA-SOP:er | `klaviyo/sop/` (engelska, E00–E07) |
| Kommandot | `/klaviyo kolla|bygg|ladda-upp|rapport|cs` (`.claude/commands/klaviyo.md`) |
| Evolve | `klaviyo/evolve/`: botens svar, flödesresearchen, återköpsanalysen |
| Sista stegen | `klaviyo/SISTA-STEGEN.md`: Cowork-prompten och sessionsprompten |

## Så körs det

```bash
node klaviyo/kolla.mjs              # nyckel, konto, metriker → konto/baverbutiken/lage.json
node klaviyo/kolla.mjs --prov       # första gången: mäter det obekräftade i ARKITEKTUR
node klaviyo/bygg.mjs               # innehåll + Shopify → output/baverbutiken/ (+ galleri index.html)
node klaviyo/ladda-upp.mjs          # torrt: planen och exakta request-kroppar
node klaviyo/ladda-upp.mjs --skarpt # skapar segment, mallar, kampanjer och flöden, ALLT som utkast
node klaviyo/rapport.mjs            # resultat → logg/baverbutiken/utfall.jsonl
node --test klaviyo/test/*.test.mjs
```

## Det motorn aldrig gör

- **Skickar.** Klienten vägrar varje anrop till `/api/campaign-send-jobs` och varje flödesstatus utom `draft`. Ett test bevisar det.
- **Mejlar utan samtycke.** Varje kampanjsegment måste ha `subscription: "subscribed"`, annars stoppas det.
- **Tar en annan butiks konto.** `public_api_key` måste vara `QZ4jLG` innan något skrivs.

## Filerna

Se `ARKITEKTUR.md` (kontraktet), `innehall/baverbutiken/BRIEFER.md` (strategin per
mejl) och `logg/baverbutiken/kampanjlogg.md` (hypotes → utfall → lärdom).
