# Kampanjlogg: Bäverbutiken (hypotes → utfall → lärdom)

Det här är mejlens motsvarighet till `products/<id>/batch-log.md`. En rad per
utskick och ett block per lärdom. Utan en skriven lärdom får inget nytt koncept
skrivas (Evolve, `docs/os/CS-KLART.md` punkt 8). Talen kommer ur
`node klaviyo/rapport.mjs` (`utfall.jsonl`) och hittas aldrig på.

**Grind innan dom:** minst 3 köp och minst 500 levererade (startsiffror från
2026-09-24, mäts om efter de första fyra utskicken). Öppningsgraden avgör aldrig
ensam, eftersom Apples integritetsskydd blåser upp den.

## Utskick

| Datum | Kampanj | Segment | Levererade | Köp | Intäkt | Intäkt/mottagare | Avreg % | Spam % | Etikett | Lärdom |
|---|---|---|---:|---:|---:|---:|---:|---:|---|---|
| 2026-09-29 | K01 Taköverdrag vinterförvaring | uppvärmning 1 | – | – | – | – | – | – | inte skickad | – |
| 2026-10-01 | K02 Båten ska upp | uppvärmning 1 | – | – | – | – | – | – | inte skickad | – |
| 2026-10-06 | K03 Termoskydd kundernas ord | uppvärmning 1 | – | – | – | – | – | – | inte skickad | – |
| 2026-10-08 | K04 Sotarset före eldning | uppvärmning 1 | – | – | – | – | – | – | inte skickad | – |

## Uppladdning 2026-09-25

Alla 14 kampanjer laddades upp som Draft i kontot QZ4jLG. Inget planerat datum hade passerat
(första är K01 29 sep 18:00), så inga datum flyttades. Ingen kampanj är schemalagd.

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
- Skrivs tillbaka till: products/<id>/dna.md (om produktlärdom)
```

_Inga lärdomar än. Första domen tidigast när K01 har gått ut och attributionsfönstret har passerat._
