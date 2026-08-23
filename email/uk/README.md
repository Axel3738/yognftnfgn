# Kundmejl för beavershop.co.uk (engelska, brittisk)

*Skapad 2026-08-23. Engelska (brittisk stavning) versioner av mallarna i
`email/mallar/` — samma design (Impulse-temat är samma export: rött `#dd1d1d`,
svart, Anton), men innehållet är grundat i **beavershop.co.uk:s egna
policysidor**, inte de svenska. Klistras in i beavershop.co.uk:s admin på
samma sätt som i `email/README.md`.*

## Vad som ligger här

Samma sju filer som i `email/mallar/` och `email/majavakauppa/`, samma
filnamn (Shopify-adminet bryr sig inte om filnamn, det är copy-paste):

| Fil | Mejl |
|---|---|
| `orderbekraftelse.liquid` | Order confirmation |
| `frakt-bekraftelse.liquid` | Shipping confirmation ("Your order's been packed") |
| `ute-for-leverans.liquid` | Out for delivery |
| `levererad.liquid` | Delivered |
| `order-annullerad.liquid` | Order cancelled |
| `drip-pa-vag.html` | Drip "On its way" (automation, +4 dagar) |
| `recensionsmail.html` | Review request (automation, +14 dagar) |

`<html lang="en">` är satt. Alla Liquid-variabler ({{ name }},
{{ customer.first_name }}, {{ shop.email }}, {{ shop.url }},
{{ order_status_url }}, loopar) och all HTML/styling är oförändrade — bara
texten är översatt. `{{ shop.name }}` och `{{ shop.url }}` löses automatiskt
mot beavershop.co.uk:s egna Shopify-inställningar (visar "BeaverShop" /
beavershop.co.uk) så länge mallarna klistras in i **den** butikens admin.

## Fraktbekräftelsens ärliga vinkel — oförändrad

Samma järnregel som i den svenska mallen: leverantören markerar ordrar
fulfilled inom ~24 h, ofta innan paketet fysiskt rör sig. Mejlet säger därför
**"packed and handed to the courier"** — aldrig "on its way" — och förklarar
att spårningen kan visa tomt tills transportören skannar paketet. `<title>`
i den svenska källfilen sa "Din order är på väg" trots att H1:an och
preheadern följde regeln; den engelska versionen har rättat till det —
`<title>` är nu "Your order's been packed" för att inte motsäga resten av
mejlet.

## Faktaskillnader mot svenska butiken (viktiga!)

Hämtade från beavershop.co.uk:s footerlänkade sidor 2026-08-23
(`/pages/shipping`, `/pages/returns`, `/pages/faq`, `/pages/contact`).

| | baverbutiken.se | beavershop.co.uk |
|---|---|---|
| Behandlingstid | 0–2 arbetsdagar | **0–2 working days** (samma) |
| Leveranstid | 1–2 dagar (SE-lager) / 5–10 dagar (utländskt lager) — två spann | **Ett enda spann: 5–10 working days**, tracked. UK-sajten skiljer inte på lager i sin egen text, så mejlen gör det inte heller. |
| Moms/tull | oklart läge (fråga Axel) | **Ingår i priset** — "All prices are shown in pounds sterling (GBP) and include UK VAT. You won't pay customs duties or additional fees on delivery." |
| Retur | 30 dagars returpolicy + 14 dagars ångerrätt | **14-day cancellation right** (Consumer Contracts Regulations 2013) **+ totalt 30 dagars öppet köp** — samma struktur, brittisk lagtext |
| Fel/skadad vara | — | **Consumer Rights Act 2015** — repair/replacement/refund; godkänd claim: returporto täcks av butiken |
| Återbetalning | inom 10 arbetsdagar, eskalering efter 15 | **Samma:** inom 10 working days, kontakta support om >15 working days gått |
| Betalsätt (FAQ) | — | Card (VISA/Mastercard), Klarna, PayPal, Apple Pay, Google Pay |

Inga dagssiffror är gissade — samtliga är citerade direkt ur
`/pages/shipping` och `/pages/returns`. Fraktkostnad står **inte** i dagar
eller kronor på policysidan ("Shipping costs are shown at checkout") — den
går inte att lova i mejlen och nämns därför inte, precis som instruktionen
kräver när sidan inte anger en siffra.

## Ämnesrader (bytts i samma vy som koden)

| Mejl | Ämnesrad |
|---|---|
| Order confirmation | `{{ customer.first_name }}, {{ name }} is in – we're packing it` |
| Shipping confirmation | `{{ customer.first_name }}, your order's been packed` |
| Drip "On its way" (i automationen) | `Your parcel's on its way` |
| Review request (i automationen) | `1, 2 or 5 stars — which will it be?` |
| Out for delivery | `{{ customer.first_name }}, {{ name }} is coming to you today` |
| Delivered | `{{ customer.first_name }}, {{ name }} has arrived` |
| Order cancelled | `Order {{ name }} has been cancelled` |

Samma logik som i den svenska mallen: personaliserad hook på de positiva
mejlen, trygg klassisk på annulleringen — ett negativt besked ska förstås i
inkorgen, inte kräva ett klick.

## Länkmål

- **Verifierade** (fetchade och lästa 2026-08-23):
  - `{{ shop.url }}/#newsletter-footer` — nyhetsbrevsformuläret ligger i
    footern, samma `action="/contact#newsletter-footer"` som på svenska
    sajten. ✅
  - Recensionsmejlets 1–3 stjärnor: `https://beavershop.co.uk/pages/contact`
    ✅ (kontaktformulär, footerlänkad).
  - Orderbekräftelsens retur-FAQ-länk: `{{ shop.url }}/pages/returns` ✅.
  - Sakuppgifterna i tabellen ovan: hämtade direkt ur `/pages/shipping`,
    `/pages/returns`, `/pages/faq` — inte gissade.
- **Overifierat:**
  - 4–5 stjärnor i recensionsmejlet: `https://uk.trustpilot.com/evaluate/beavershop.co.uk`
    — URL:en är given i uppgiften, inte självständigt kontrollerad (kunde
    inte bekräfta att en Trustpilot-profil för beavershop.co.uk faktiskt
    finns på den adressen). Samma gating-varning som i `email/README.md`
    gäller: att bara bjuda in 4–5-stjärniga kunder strider mot Trustpilots
    riktlinjer, det är Axels beslut och risken är dokumenterad där.
  - `/pages/terms` och `/policies/privacy-policy` hittades i footern men
    lästes inte in i mallarna — inget av mejlens innehåll behövde dem.

## Setup

Identiskt med `email/README.md` — klistra in i beavershop.co.uk:s eget
Shopify-admin (Inställningar → Aviseringar → Kundaviseringar) och sätt upp
drip/review-automationerna där, inte i den svenska butiken.
