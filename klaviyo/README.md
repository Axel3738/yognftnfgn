# klaviyo/: Bäverbutikens e-postmarknadsföring (byggt 2026-09-24)

Axels beställning 2026-09-24: "Börja fixa email MARKETING på riktigt … köra claude
med klaviyo och börja köra massa kampanjer", kopplat till creative strategy och
Evolve-metoden. Bygget sker först med Claude, och utförandet flyttas till en VA
när rutinen fungerar (Arvids princip). Inga schemalagda rutiner byggs förrän Axel
säger till.

## Läget (2026-09-25 morgon, uppladdat till Klaviyo)

**Allt ligger i kontot `QZ4jLG` som utkast. Inget är schemalagt, inget är live, inget har skickats.**
Mätt med tillbakaläsning 2026-09-25: 14 kampanjer `Draft` utan `scheduled_at`, 6 flöden `draft`
med alla 14 flödesmejl `draft`, 30 mallar, 14 segment, listan `LISTA_nyhetsbrev`.
Id:n står i `konto/baverbutiken/uppladdat.jsonl`.

| Del | Status |
|---|---|
| Kampanjer K01–K14 (29 sep–1 dec) | ✅ Draft i Klaviyo. Ämnesrad B och C ska läggas in som A/B-test för hand. |
| Flöden | ✅ F01 Välkomst, F02 Övergiven kassa, F04 efter köp, F05 vinback, F06 sunset, F07 motorhölje → båtmotorskydd: draft. ❌ **F03 Webbhistorik inte uppladdat**: `Viewed Product` finns två gånger i kontot (Klaviyos onsite + Shopify), båda med 0 händelser; motorn väljer inte själv. |
| Segment | ✅ 14 st. `SEG_samtycke` 1 552 profiler, `SEG_uppvarmning_steg1` 216 (mätt 2026-09-25, synken pågår troligen, se EPOST-STRATEGI §4). |
| Motorn | ✅ Körd mot riktiga kontot. Tre gissningar rättade: `Items` (inte `ItemNames`) på Placed Order, `Name` (inte `ProductName`) på Ordered Product, väntan när Klaviyo bearbetar 5 segment. 96 tester gröna. Se ARKITEKTUR → "mätt 2026-09-25". |
| Kontot | ⚠️ Saknar postadress (sidfoten blir utan adress, MFL 20 §) och standardavsändare. Settings → Brand. |
| Innehåll | 14 kampanjer och 7 flöden. Copyn skrevs av Sonnet enligt `docs/copy-regler.md`. |
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
