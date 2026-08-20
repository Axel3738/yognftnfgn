# SOP-01: CS-loopen på en produkt som går bra

**Ägare:** Managern (och Axel för produkter han själv startat).

## Arbetsflödet

1. Produkten launchas med ~12 annonser — **Axels egen process**, ingen SOP här.
2. Går produkten bra: öppna en Claude Code-chatt och gör **första riktiga
   CS-rundan** där. Detta blir produktens chatt.
3. Därefter körs `/cs <produkt-id>` **i samma chatt**, var 3:e dag. Kommandot
   analyserar det som launchats och levererar nya briefer på faktisk data.

Briefarna från runda 1 ligger kvar i chatten, så `/cs` kan läsa exakt vad varje
annons var — det är underlaget för creative-teardownet. Kommandot skriver ändå
alltid tillbaka till `products/<id>/` så inget går förlorat om chatten tappas.

## Varje `/cs`-runda

```
/cs motorholjet
/cs motorholjet + ev. egna idéer direkt i kommandot
```

Claude: läser chattens briefer och kontodatan → rangordnar på vinstbidrag →
river isär creativen (bilder granskas visuellt, videomanus läses ur briefarna) →
kopplar variabler till vinst → bygger nästa batch enligt kvoten.
Detaljerna: `.claude/commands/cs.md` + `docs/os/ANALYSMETOD.md`.

## Runt loopen

| Vad du vill | Skriv |
|-------------|-------|
| Slänga in ett koncept eller en swipe | `/koncept <id> <idén>` (`AKUT` = brief direkt) |
| Ladda upp batchen till Notion | `/notion <produktsida>, <Drive-länk>` |
| Fylla tracking-sheetet | `/sheet <id>` |
| Stämma av vid launch (kvot + Notion + sheet) | `/logga <id> <antal>` |
| Daglig koll | `/checkin <id>` |

Kvoten räknas per produkt: **20 %** av dagsbudgeten under 5 000 kr/dag,
**10 %** vid 5 000 kr och över, delat på target-CPA, gånger 3 (SOP-02).

Strular Claude: `docs/os/SOP-05-nar-claude-inte-lyssnar.md`.
