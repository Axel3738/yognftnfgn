# Hårdkodad svenska i ms-*-filerna → engelska

Ändras i själva liquid-filerna när temat laddas upp i Sushi Socks-butiken.
Alla är standardvärden (`| default:`) eller fast text i markup.

| Fil | Svenska | Engelska |
|---|---|---|
| `ms-guarantee.liquid` | `'30 dagars öppet köp'` | `'30-day returns'` |
| `ms-sticky-atc.liquid` | `'Köp nu'` | `'Buy now'` |
| `ms-size-guide.liquid` | `'Storleksguide'` (×2) | `'Size guide'` |
| `ms-size-guide.liquid` | `'Storlek;Fotlängd;Motsvarar'` | `'Size;Foot length;Equivalent'` |
| `ms-size-guide.liquid` | `aria-label="Stäng"` | `aria-label="Close"` |
| `ms-delivery-estimate.liquid` | `'Beräknad leverans'` | `'Estimated delivery'` |
| `ms-delivery-estimate.liquid` | `{{ mn }}–{{ mx }} arbetsdagar` | `{{ mn }}–{{ mx }} business days` |
| `ms-stock-urgency.liquid` | `Endast <strong>{{ qty }}</strong> kvar i lager` | `Only <strong>{{ qty }}</strong> left in stock` |
| `ms-stock-urgency.liquid` | `aria-label="{{ qty }} av {{ limit }} kvar i lager"` | `aria-label="{{ qty }} of {{ limit }} left in stock"` |
| `ms-trust-row.liquid` | fallback `truck:Fri frakt i Sverige\|refresh:30 dagars öppet köp\|lock:Trygg betalning` | `truck:Free shipping\|refresh:30-day returns\|lock:Secure checkout` |
| `ms-paket.liquid` | `aria-label="Välj paket"` | `aria-label="Choose your bundle"` |
| `ms-paket.liquid` | `Gratis på köpet` | `Free with your order` |
| `ms-paket.liquid` | `värde {{ gvarde \| money }}` | `worth {{ gvarde \| money }}` |
| `ms-paket.liquid` | tomt-läget: "Inga paketnivåer för den här produkten ännu…" | `No bundle tiers for this product yet. Add them under Content → Metaobjects → Bundle tier.` |

Kvarstår att gå igenom när filerna hämtas: `ms-skrapkort`, `ms-cookies`,
`ms-compare`, `ms-reviews`, `ms-review-slider`, `ms-usp-bar`, `ms-marquee`,
`ms-video`, `ms-faq-section`, `ms-guarantee-section`, `ms-bundle-*`, `ms-app-slot`
— samt deras `{% schema %}`-etiketter (syns i temaredigeraren, inte för kunden).

## Metaobjektet som måste återskapas

`ms_paketniva` → engelska namnet **`bundle_tier`**. Fält (av `ms-paket.liquid`):

| Fält | Typ | Vad |
|---|---|---|
| `produkt` | produktreferens | vilken produkt nivån gäller |
| `antal` | heltal | antal i paketet |
| `rubrik` | text | t.ex. "2 pairs" |
| `underrubrik` | text | valfri underrad |
| `bricka` | text | etikett ovanför kortet, t.ex. "Most popular" |
| `fastpris` | decimal | paketets totalpris |
| `rabattkod` | text | **måste finnas** annars visas fullpris (ärlighetsspärren) |
| `bogo_gratis` | heltal | antal gratis vid köp-X-få-Y |
| `gratis_produkt` | produktreferens | gåva |
| `gratis_antal` | heltal | antal gåvor |
| `gratis_text` | text | gåvans beskrivning |
| `forvald` | boolean | förvald nivå |
| `ab_variant` | text | 'a'/'b' för A/B-test, tomt = alla |

⚠️ Rabattkoderna måste också skapas som **riktiga rabattkoder i kassan**, annars
visar widgeten ett pris kassan inte ger. Det är precis det ärlighetsspärren finns för.
