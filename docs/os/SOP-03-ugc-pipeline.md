# SOP-03: UGC-pipeline — från outreach till färdig annons

**Ägare:** UGC-outreach-ansvarig (outreach) + managern (planering via P6).

## Flödet

```
Kontaktad → Bekräftad → Produkt skickad → Filmar → Levererad → Godkänd → Redigering → Live
```

Allt trackas i en Notion-databas ("UGC Pipeline") med en rad per creator-deal:

| Kolumn | Vem fyller i |
|--------|--------------|
| Creator (handle + kontakt) | Outreach |
| Produkt | Outreach |
| Status (enligt flödet ovan) | Outreach t.o.m. "Levererad", sen managern |
| Deal (pris / gratis produkt / provision) | Outreach |
| Produkt skickad-datum | Outreach |
| Beräknad leverans råmaterial | Claude (P6) |
| Deadline råmaterial | Claude (P6) |
| Deadline färdig annons | Claude (P6) |
| Ansvarig redigerare | Managern |
| Länk till brief | Claude (P6) |

## Deadline-regler (default, kan overridas i P6)

- Beräknad leverans = produkt skickad + 3 dagar frakt + 7 dagar filmtid
- Deadline råmaterial = beräknad leverans + 2 dagars buffert
- Deadline färdig annons = deadline råmaterial + 3 dagar redigering

## Rutinen

1. **Outreach-ansvarig** uppdaterar Notion-raden så fort något händer (bekräftelse,
   skickad produkt, leverans) och skriver det i Slack.
2. **Managern** kör `prompts/P6-ugc-plan.md` vid varje förändring (~2 min). Claude
   räknar deadlines, skapar redigerings-tasken i förväg och visar hela pipelinen
   med förseningar rödmarkerade.
3. **Daglig check-in (P4)** larmar automatiskt om passerade deadlines, så inget
   ligger och ruttnar även om ingen kört P6.

## Mål för outreach (sätts per månad av ägaren)

- Antal bekräftade creators/vecka: [sätt mål, förslag 2–3 per aktiv produkt]
- Regeln: det ska ALLTID finnas minst 2 deals i status "Filmar" per aktiv produkt —
  UGC-råmaterial är råvaran för iterationsbatcherna, tar den slut svälter kvoten.

## Vanliga problem

- **Creator försenad:** P6 med ny info → nya deadlines. Vid 2:a förseningen: outreach
  skickar påminnelse med hård deadline; vid 3:e: skriv av dealen och ersätt.
- **Råmaterial håller inte måttet:** managern markerar "Levererad – underkänd",
  outreach begär omtagning med konkret lista (från briefens shot list) på vad som saknas.
