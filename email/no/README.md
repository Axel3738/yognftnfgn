# Kundemail for beverbutikken.no (norsk bokmål)

*Skapad 2026-08-23. Norska versioner av mallarna i `email/mallar/` — samma
design (Impulse-temat är samma export: rött `#dd1d1d`, svart, Anton), men
innehållet är grundat i **beverbutikken.no:s egna policysidor**, inte de
svenska. Klistras in i beverbutikken.no:s Shopify-admin på samma sätt som i
`email/README.md` (Inställningar → Aviseringar → Kundaviseringar, resp.
Marknadsföring → Automatiseringar för de två HTML-filerna).*

## Ämnesrader (norska)

| Fil | Mejl | Ämnesrad |
|---|---|---|
| `orderbekraftelse.liquid` | Ordrebekreftelse | `{{ customer.first_name }}, {{ name }} er mottatt – vi pakker den` |
| `frakt-bekraftelse.liquid` | Fraktbekreftelse | `{{ customer.first_name }}, ordren din er pakket` |
| `ute-for-leverans.liquid` | Ute for levering (av som standard — slå på!) | `{{ customer.first_name }}, {{ name }} kommer til deg i dag` |
| `levererad.liquid` | Levert (av som standard — slå på!) | `{{ customer.first_name }}, {{ name }} er levert` |
| `order-annullerad.liquid` | Ordre kansellert | `Ordre {{ name }} er kansellert` |
| `drip-pa-vag.html` | Drip "På vei" (automation, +4 d) | `Pakken din er på vei` |
| `recensionsmail.html` | Anmeldelses-e-post (automation, +14 d) | `1, 2 eller 5 stjerner — hvilken blir det?` |

## Fakta hämtade från beverbutikken.no (lästa 2026-08-23)

Källor: startsidans footer → `/pages/fraktinformasjon`, `/pages/retur-og-angrerett`,
`/pages/kontakt`, `/pages/kjopsvilkar`.

| Fakta | Norska butiken | Svenska butiken (jämförelse) |
|---|---|---|
| Behandlingstid | **0–2 virkedager** | 0–2 arbetsdagar (samma) |
| Leveringstid | **5–10 virkedager, sporbar frakt** — sajten skiljer **inte** på inrikes/utländskt lager eller nämner något transportbolag | 1–2 arbetsdagar (svenskt lager) / 5–10 arbetsdagar (utländskt lager), PostNord namngivet |
| Ångerrätt | **14 dagers ubetinget angrerett** (angrerettloven), ingen grund krävs | 14 dagars ångerrätt |
| Öppet köp | **totalt 30 dagers åpent kjøp** från mottagande | 30 dagars returpolicy |
| Reklamation | **forbrukerkjøpsloven**, 2 års reklamationsrätt (5 år för varor avsedda att hålla väsentligt längre) | ej jämfört |
| Återbetalning | **automatisk til opprinnelig betalingsmetode, innen 10 virkedager**; kontakta efter >15 virkedager | samma modell (10/15 arbetsdagar) |
| Moms/tull | **NOK inkl. mva., ingen toll eller ekstra avgifter ved levering** | Bäverbutikens momsläge är **oklart** (se `CLAUDE.md`) — norska sidan är tydlig, så ingen osäkerhet här |
| Bolag | Beverbutikken.no drivs av **STONEBITE ECOM AB** | samma koncern |
| Kontakt-e-post (policysidorna) | Beverbutikken@gmail.com, svarar inom **1 virkedag (man–fre)** | ej jämfört — `{{ shop.email }}` styr själva mejlen oavsett |
| Betalsätt | Kort (VISA, Mastercard), Klarna, PayPal, Apple Pay, Google Pay | ej jämfört |

Eftersom sajten faktiskt anger dagssiffror (till skillnad från den finska
`majavakauppa.fi`, se `email/majavakauppa/README.md`) innehåller de norska
mejlen konkreta tal — **0–2 virkedager** behandling och **5–10 virkedager**
leverans. Ingen uppdelning inrikes/utland och ingen transportörsnamn
förekommer eftersom fraktsidan inte anger det — hitta inte på det.

**Viktigt om fraktbekräftelsen:** leverantören markerar ordrar som skickade
inom ~24 timmar, ofta innan paketet fysiskt rört sig. Mejlet säger därför
**"pakket og overlevert til fraktselskapet"** — ALDRIG "på vei" — och
förklarar att sporingen kan visa tomt tills transportøren skanner pakken.
Samma ärliga vinkel som i den svenska och finska versionen.

## Länkmål — verifierade vs overifierade

- **Nyhetsbrev:** `{{ shop.url }}/#newsletter-footer` — formuläret finns i
  sidfoten på beverbutikken.no (`action="/contact#newsletter-footer"`
  bekräftad i footer-koden på startsidan) ✅ **verifierad**
- **Recensionsmejlets 1–3 stjärnor:** `https://beverbutikken.no/pages/kontakt`
  — kontaktsidan finns och länkas från footern ✅ **verifierad**
- **Recensionsmejlets 4–5 stjärnor:** `https://no.trustpilot.com/evaluate/beverbutikken.no`
  — enligt uppdragets instruktion. **⚠️ overifierad**: en `curl`-kontroll
  2026-08-23 gav **HTTP 404** på den URL:en, troligen för att butikens
  Trustpilot-profil ännu inte är skapad/publicerad. Samma gating-risk som i
  `email/README.md` gäller: att bara bjuda in nöjda kunder till Trustpilot
  strider mot Trustpilots riktlinjer. **Innan aktivering:** skapa/bekräfta
  Trustpilot-profilen för beverbutikken.no och testa länken manuellt — annars
  leder 4–5-stjärniga kunder till en döende sida.
- **Ordrebekräftelsens FAQ-länk till ångerrätt:** `{{ shop.url }}/pages/retur-og-angrerett`
  ✅ **verifierad** (samma sökväg som lästes för fakta ovan)

## Vad Axel bör reda ut innan launch

1. **Trustpilot NO** — se ovan. Skapa profilen eller peka om länken innan
   recensionsmejlet aktiveras i en automation.
2. **`{{ shop.email }}`** — kontrollera att Shopify-inställningen för
   beverbutikken.no faktiskt är satt till `Beverbutikken@gmail.com` (eller
   vad som ska stå där), så att mejlens dynamiska adress matchar
   policysidornas. Samma typ av mismatch som hittades i den finska butiken
   (`email/majavakauppa/README.md`) är inte kontrollerad här — jag har bara
   läst policysidorna, inte Shopify-adminet.
3. **Rabattkod för nyhetsbrevsblocket** — mallarna lovar "10 % rabatt på
   neste kjøp" vid registrering. Ingen norsk rabattkod eller
   välkomstautomation har skapats i den här sessionen (jämför med
   `TERVETULOA10` för Finland) — sätt upp den innan mejlen skickas skarpt,
   annars lovar mejlet en kod som aldrig kommer.

Setup-stegen för de två automationerna (drip + recension) är identiska med
`email/README.md` — bara i beverbutikken.no:s admin i stället för svenska
butikens.
