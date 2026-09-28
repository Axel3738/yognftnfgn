# Utkast: frågan till leverantören om kostnader per land

Axels beställning 2026-09-27 ("skriv ett meddelande till leverantören, ett utkast jag kan
skicka"). Bakgrund: `matstrumpor/cogs.json` har landad kostnad för USA/UK/AU/CA/NZ (Axels
ark: vara + frakt i USD, rader för 1 och 2 lådor) men **ingen** för Norge, Danmark, Finland
— och donut/pizza/hamburgare saknar Cost per item i Shopify. Svaren skrivs in i `cogs.json`
(`norden.kostnad` per produkt och land, samma form som `big5.rader`) och i Shopify
(Products → varianten → Cost per item).

Kopiera texten nedan rakt av. Byt `[Name]` mot kontaktpersonen. Engelska, eftersom
leverantören är det.

---

**Subject:** Landed cost per order for Norway, Denmark and Finland (+ unit costs)

Hi [Name],

We are opening Matstrumpor for **Norway, Denmark and Finland** and need your landed cost
per order for those three countries — the same way we have it for the US, UK, Australia,
Canada and New Zealand today (product cost + shipping, in USD, per order).

**1. Shipping + product cost per order, for each of these six products:**

| Product | Variant | Order of 1 | Order of 2 |
|---|---|---|---|
| Sushi socks | 5 pairs | cost + shipping | cost + shipping |
| Sushi socks | 3 pairs | | |
| Donut socks | one size | | |
| Pizza socks | one size | | |
| Hamburger socks | one size | | |
| Wooden chopsticks (gift, ships with the socks) | 1 pair | | |

Please fill in one line per product for **Norway**, **Denmark** and **Finland**, for an
order of 1 box and an order of 2 boxes, in USD. If two boxes in one parcel change the
shipping, please show both rows.

**2. Sweden:** we are missing the unit cost for the **Donut, Pizza and Hamburger socks**
to Sweden (we have the sushi socks). Please send those three as well, same format.

**3. Delivery:** for each of the three new countries, the typical door-to-door time in
business days, the carrier for the last mile, and whether tracking is visible on 17TRACK.

**4. Duties and VAT:** please confirm whether your price is DDU (the customer pays any
import charges) or DDP (all included) for Norway, Denmark and Finland — Norway is outside
the EU, so this matters for what we tell customers.

We launch ads in Norway first, so Norway is the most urgent. Thank you!

Best regards,
Axel
Matstrumpor.se / STONEBITE ECOM AB

---

## När svaret kommer

1. Skriv raderna i `matstrumpor/cogs.json` → `norden` (byt `kostnad: null` mot samma form
   som `big5.rader`: `{"sushi-5": {"NO": [{"antal": 1, "cost": …, "frakt": …}], …}}`, valuta
   `USD`) och sätt `saknas_orsak` till `null`.
2. `node matstrumpor/kor.mjs --ekonomi --marknad NO` räknar break-even per produkt med
   ECB-kurs. Skriv talet i `products/matstrumpor/dna.md` → Marknader.
3. Cost per item för donut/pizza/hamburgare skrivs i Shopify (Products → produkten →
   varianten → Cost per item), i SEK landat — `cogs.json` → `sverige` läser därifrån.
