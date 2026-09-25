# Kampanjlogg: Matstrumpor (hypotes → utfall → lärdom)

Mejlens motsvarighet till `products/matstrumpor/batch-log.md`. En rad per utskick
och ett block per lärdom. Utan en skriven lärdom får inget nytt koncept skrivas
(Evolve, `docs/os/CS-KLART.md` punkt 8). Talen kommer ur
`node klaviyo/rapport.mjs --brand matstrumpor` (`utfall.jsonl`) och hittas aldrig på.

**Grind innan dom:** minst 3 köp och minst 500 levererade (startsiffror, mäts om efter
de första fyra utskicken). Öppningsgraden avgör aldrig ensam. Break-even-ROAS för
vinstbidraget: 1,498 (brandfilen, ur `matstrumpor/konfig.json`, utan moms).

## Utskick

| Datum | Kampanj | Segment | Levererade | Köp | Intäkt | Intäkt/mottagare | Avreg % | Spam % | Etikett | Lärdom |
|---|---|---|---|---:|---:|---:|---:|---:|---|---|
| 2026-09-29 | K01 De tror att det är riktig sushi | uppvärmning 1 | – | – | – | – | – | – | inte skickad | – |
| 2026-10-06 | K02 Ingen jublar åt tvättmedel | uppvärmning 1 | – | – | – | – | – | – | inte skickad | – |
| 2026-10-13 | K03 Kundernas ord | engagerade 60 d | – | – | – | – | – | – | inte skickad | – |
| 2026-10-20 | K04 Fars dag, senast 24/10 | engagerade 60 d | – | – | – | – | – | – | inte skickad | – |

## Uppladdning 2026-09-25

Se `klaviyo/README.md` → Matstrumpor för vad som laddades upp och vad som är utkast.

## Lärdomar

Mall (en per utskick, skrivs av huvudsessionen efter `rapport.mjs`):

```
### L-MAIL_<datum>_<prefix>_<KOD>_<nr> (<datum för domen>)
- Hypotes: <memo ur kampanjfilen>
- Utfall: <levererade, köp, intäkt, intäkt/mottagare, avreg, spam> (källa: utfall.jsonl rad N)
- Etikett: VINNARE | FORLORARE | FOR_TIDIGT | LARM_LEVERANS | INGEN_LEVERANS
- Vinnande ämnesrad (A/B/C) och vilket begär den bar:
- Varför (vår tolkning, märkt som tolkning):
- Nästa utskick bygger på det här så här:
- Skrivs tillbaka till: products/matstrumpor/dna.md (om produktlärdom)
```

_Inga lärdomar än. Första domen tidigast när K01 har gått ut och attributionsfönstret har passerat._
