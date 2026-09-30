# Rules: pages, policies, menus and theme texts → English (Beaver Store)

Read `REGLER-EN.md` first — every rule there applies. This file adds what is special
for the store's own pages.

## The brand

- On the English site the store is called **Beaver Store**. Where the Swedish says
  "Bäverbutiken" (the store), write "Beaver Store". The first time the About story names
  the store, write: `Beaver Store (Bäverbutiken in Swedish)`.
- The company stays exactly as written: `STONEBITE ECOM AB`, `Org.nr 559576-2401`
  (write `Reg. no. 559576-2401`), `Stenkolsgatan 1B, 417 07 Göteborg` (keep the Swedish
  address; add `, Sweden`). The e-mail `kundsupport@baverbutiken.se` stays as it is.
- Product names with "Bäver" become "Beaver": Bäverkopplingen → the Beaver Connector,
  Bäverlampan → the Beaver Lamp, Bävertratten → the Beaver Funnel (same names the
  product pages already use).
- "efter Sveriges flitigaste byggare" (the beaver) → "after Sweden's hardest-working builder".
- The Swedish angle is a strength: keep every "Swedish company", "Gothenburg" fact.
  Do not add "made in Sweden" or "ships from Sweden" — neither is true.

## The market's truth on these pages

| Swedish | English |
|---|---|
| Klarna / "få först, betala sen" / "Gäller alla beställningar inom Sverige" | drop Klarna. "få först, betala sen" → `pay securely at checkout` |
| "fri frakt över 300 kr" / "På ordrar över 300kr" / "Fri frakt" as a promise | `free shipping` (no threshold, no amount) |
| "kundtjänst på svenska" | `customer service by email` |
| Fraktpolicy: "om den inte finns i vårt svenska varuhus som annars levereras med 1-2 dagars spårbar frakt med Postnord" | remove this clause (it only applies inside Sweden) |
| Fraktpolicy: add ONE sentence after the delivery-time sentence | `Shipping is free to every country we deliver to outside Sweden.` |
| "5 - 10 Arbetsdagar Fri Frakt inom Sverige" | `Free shipping · 5–10 business days` |
| "14 dagars ångerrätt" | `14 days to change your mind` |
| "Ångerfrist på 14 dagar i EU" (heading in the refund policy) | `14-day cancellation period in the EU` (it is EU law — keep it) |
| Swedish law, Swedish courts, ARN (Allmänna reklamationsnämnden) in terms | keep them, translated: `Swedish law`, `the Swedish National Board for Consumer Disputes (ARN)` |
| customs / import fees "kundens ansvar" | keep: `customs duties and import fees, if any, are the customer's responsibility` |

## Reviews (theme texts)

Customer reviews are quotes. Translate them plainly and keep the casual voice and the
meaning, no polishing, no added praise. Never change a name.

## Menus

`Startsida` → `Home`, `Alla produkter` → `All products`, `Om Bäverbutiken` → `About
Beaver Store`, `Kontakta Oss` → `Contact us`, `Spåra paket` → `Track your parcel`. Menu
items that are product names use the product's English title core (`Bäverkoppling -
Slipp jobbiga kabelskor` → `Beaver Connector - No More Fiddly Cable Lugs`).

## HTML

Same as `REGLER-EN.md`: identical tags in identical order, translate text and `alt` only.
Keep `<br/>` exactly where it is.

## Output

Write the English as JSON files in `worldwide/oversattning/en/` — never one big file in
one call if it is longer than ~12 000 characters; then write it in several files with a
number suffix (`_policyer-1.json`, `_policyer-2.json`) that each hold some of the keys.

| File | Shape |
|---|---|
| `_sidor*.json` | `{ "<page handle>": { "title": "…", "body": "<html>" } }` |
| `_kollektioner.json` | `{ "<handle>": { "title": "…", "descriptionHtml": "…", "seo_title": null or "…", "seo_description": null or "…" } }` |
| `_policyer*.json` | `{ "<policy type>": { "title": "…", "body": "<html>" } }` |
| `_menyer.json` | `{ "<Swedish menu text>": "<English>" }` |
| `_tema.json` | `{ "<Swedish theme text, exactly as given>": "<English>" }` — every key from the input's `tema` list |
| `_shop.json` | `{ "title": "…" }` |
