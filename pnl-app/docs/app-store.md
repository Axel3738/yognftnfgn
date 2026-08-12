# App Store-lansering — checklista och material

Målet: den publika app-registreringen **PNL** (offentlig distribution) skickas till
granskning. Samma kod och server som custom-apparna — godkänd = obegränsade
installationer, och custom-skalen (PNL2/PNL3) kan avinstalleras.

## Beslutat

| | |
|---|---|
| Pris | **$9.99/månad** (~100 SEK), 7 dagars gratis provperiod |
| Debitering | Shopify Billing API — kod klar, aktiveras med `BILLING_ENABLED=1` |
| Egna butiker | Debiteras aldrig — domäner i `BILLING_EXEMPT_SHOPS` |

## Arkitektur vid lansering

En tredje Railway-tjänst för den publika appen (PNL:s ursprungliga Client ID +
secret), samma repo, gren och Postgres. Miljövariabler utöver de vanliga:

```
BILLING_ENABLED=1
BILLING_EXEMPT_SHOPS=4snrw0-mg.myshopify.com,<butik2>.myshopify.com
```

Custom-tjänsterna lämnar `BILLING_ENABLED` osatt — inget ändras för egna butiker.

## Checklista före inlämning

- [ ] **Namn** — "P&L" är sannolikt för generiskt/upptaget. Kandidater att söka på
      i App Store: *Vinstpanelen*, *TrueTB*, *Profit Beaver*, *Daglig Vinst*.
      Namnet sätts i listningen, inte i koden.
- [ ] **Ikon** 1200×1200 samt skärmbilder 1600×900 (minst 3 — förslag: panelen
      med siffror, Kostnader-fliken, Inställningar).
- [ ] **Supportmejl** — adress att publicera i listningen (t.ex.
      support@stonebite.se). Krävs av Shopify.
- [ ] **Integritetspolicy-URL** — finns: `https://<app-domän>/privacy`.
- [ ] **Protected Customer Data-ansökan** i Partner-dashboarden (utkast nedan).
- [ ] **Demobutik** — dev-butik med ~20 testordrar och ifyllda inköpspriser så
      granskarna ser panelen med data.
- [ ] **0 %-registrering** — Partners → Utbetalningar: registrera för Shopifys
      0 % revenue share (första $1M/år).
- [ ] Testa hela flödet på dev-butiken: installation → betalvägg → prova →
      panel → avinstallation.

## Protected Customer Data — utkast till svar

> **Vilken data används och varför:** Appen läser ordrars beloppsfält
> (totalsumma, rabatter, frakt, återbetalningar) och orderrader (produkt,
> variant, antal) för att beräkna butikens lönsamhet: intäkt minus varukostnad,
> tull, transaktionsavgift och annonskostnad. Detta är appens enda funktion.
>
> **Dataminimering:** Inga kundfält efterfrågas — inga namn, adresser,
> e-postadresser, telefonnummer eller kund-ID:n hämtas. GraphQL-frågorna
> begär enbart beloppsfält och produktreferenser.
>
> **Lagring och retention:** Ordrar aggregeras till dagssummor per butik;
> rådata cachas högst 10 minuter. Aggregat innehåller inga persondata.
>
> **Radering:** `shop/redact` raderar all lagrad data för butiken.
> `customers/data_request` och `customers/redact` besvaras med tomt resultat
> eftersom ingen kunddata lagras.
>
> **Skydd:** All trafik över TLS. Åtkomstnycklar lagras i databas som endast
> appservern når. Ingen data delas med tredje part.

## Listningstext — utkast

**Tagline (sv):** Se din riktiga vinst — varje dag, per produkt.
**Tagline (en):** See your true profit — every day, per product.

**Beskrivning (sv):**

> De flesta paneler visar omsättning. Den här visar vad du faktiskt tjänar.
>
> P&L räknar täckningsbidrag per dag och per produkt: försäljning minus
> inköpskostnad, tull, transaktionsavgift och annonskostnad. Inköpspriserna bor
> i Shopifys eget kostnadsfält — din data förblir din.
>
> • Vinst per dag: idag, igår, 7/30/90 dagar
> • Produkttabell med COGS, täckningsbidrag och multipel per variant
> • Break-even ROAS och max-CPA mot din målmarginal
> • Tull per order och kortavgift inräknade — byggd för dropshipping i EU
> • Meta-annonskostnad per dag (valfri koppling)
> • Kostnadshistorik: nya leverantörspriser från ett datum, äldre perioder
>   räknas på det som gällde då
> • Datan hämtas via Shopifys bulk-API och visar aldrig gissningar: saknas
>   något flaggas det, i klartext

**Beskrivning (en):** *(översätts när svenska texten är spikad)*

## Kända gap före publik lansering (blockerar inte inlämning)

- Meta-kopplingen kräver manuellt inklistrad token. För externa handlare bör
  detta bli en OAuth-knapp — kräver Meta App Review (`ads_read`), veckor.
  Appen fungerar utan Meta; annonskostnad visas då inte och TB flaggas.
- `read_all_orders` (ordrar äldre än 60 dagar) kan sökas i samma veva.
