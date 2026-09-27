# Store facts — the only page that changes per brand

**Read this once, keep it open.** Every other SOP in this base says "take the value
from Store facts". Nothing else in the procedures names a store, a domain, a carrier
or an email address, so the same SOPs work on every brand we run.

Last verified 2026-09-21 against the tracking register and each store's live page.
Return address and company address changed 2026-09-26.

## The stores

| Store | Tracking page | Parcel number | Page language | Support address |
|---|---|---|---|---|
| Bäverbutiken (SE) | https://baverbutiken.se/pages/spara | BB- | Swedish | kundsupport@baverbutiken.se |
| CaraShell (SE, NO, FI, US/GB/CA/AU/NZ) | https://carashell.se/pages/spara · /nb/pages/spara · /fi/pages/spara · https://carashell.com/pages/spara — one page, the language follows the customer's market | CS- | sv / nb / en / fi | hello@carashell.com — one sender for every market; replies sent to hello@carashell.se are forwarded |
| Beverbutikken (NO) | https://beverbutikken.no/pages/spor | BB- | Norwegian | support@beverbutikken.no |
| Bæverbutiken (DK) | https://baeverbutiken.dk/pages/spor | BB- | Danish | kundesupport@baeverbutiken.dk |
| Majavakauppa (FI) | https://majavakauppa.fi/pages/seuranta | BB- | Finnish | asiakaspalvelu@majavakauppa.fi |
| Matstrumpor (SE) | https://matstrumpor.se/pages/spara | MS- | Swedish | kundsupport@matstrumpor.se |
| Grillkliniken | **No tracking page.** The carrier-portal procedure applies there | — | — | ask the owner |

## Where the goods ship from

| Store | Ships from | Customs / VAT to tell the customer |
|---|---|---|
| Bäverbutiken, Beverbutikken, Bæverbutiken, Majavakauppa, Matstrumpor | A partner warehouse abroad | Nordic customers pay no customs at the door |
| CaraShell SE / NO / FI | ⚠️ OWNER: the site says the goods ship from Sweden — confirm before repeating it | As above |
| CaraShell US / GB / CA / AU / NZ | As CaraShell SE | ⚠️ OWNER: duties may be charged at the door in some of these countries — confirm per country |

**Never promise a Swedish-warehouse delivery time.** Measured 2026-09-17: every recent
delivery shipped from the warehouse abroad. Read the actual fulfillment on the order,
and if it does not say, write "our partner warehouse" and move on.

**The parcel number is not the carrier's number.** It is prefix + 8 characters, for
example `BB-3F7A2C1D`. It is what the customer sees in their shipping email and on
the page. The carrier number (`YT…`, `4PX…`) stays internal — see the privacy rule in
the look-up SOP.

## Values the owner sets per store

Ask the owner once per brand and write the answer here. Never guess one in a customer
email.

| Value | Bäverbutiken | Where it comes from |
|---|---|---|
| Delivery promise | 5–10 business days after the shipping email | The promise printed in the shipping emails and on the tracking page |
| Who pays return postage | The customer pays and arranges the return shipping. We send no return label | The store's existing return SOP |
| Return window | 14 days **from the day the customer received the item** (owner's decision 2026-09-22). Every page in the store says 14 now: product pages, the listicles, the order confirmation, /pages/retur-och-aterbetalningspolicy (since 2026-09-20) and Shopify's own /policies/refund-policy (owner edited it 2026-09-23; checked the same day, it no longer says 30 days and the "no returns on sale items" line is gone). If a customer quotes "30 days" they are quoting an old copy: answer with 14 days from receipt and, if they push back, tell the owner rather than argue. There is no sale-item exception: everything sells at a compare-at price | Owner |
| Statutory right of withdrawal | 14 days from receipt (EU) | Distance selling law, runs in parallel with the return window |
| Auto-reply bot | **Live since 2026-09-23** (owner's decision): it reads the mailbox every minute, around the clock, and **sends** its replies itself, signed "Kundtjänst Bäverbutiken". You will see them in Sent with the replied arrow on the customer's email, and as cards on the Kundtjänst dashboard. Your follow-up on an upset customer, a photo request, a return or a "delivered but not received" is written as the Head of Customer Support the case was escalated to (the page **Following up the auto-reply**); a simple question the bot answered fully gets nothing more unless the customer writes again. Priority folder: VA-PRIO. A wrong reply that went out: put it right with the customer yourself, then report it (see the page **Auto-reply bot**) | Owner (switched live 2026-09-23) |
| Head of Customer Support sign-off | Mechile signs the follow-ups with her first name and *Kundtjänstansvarig, Bäverbutiken* (the bot signs "Kundtjänst Bäverbutiken": two people, one store) | Owner's decision 2026-09-23 |
| Return address | **STONEBITE ECOM AB, Stenkolsgatan 1B, 417 07 Göteborg, Sweden.** The same for every store, since 26 Sep 2026 (the office). Given out by support on request, published nowhere. Until 25 Sep it was Sjöhed 160, 442 74 Harestad: a customer who has **already posted** a return there is fine — do not ask them to send it again, tell the owner the order number so the parcel is collected there. A customer who has the old address but has **not posted yet** gets the new one | Owner's decision 2026-09-26 (the office). Published nowhere: fewer returns, but only if we answer within 24 hours |
| Company address (company information requests) | Stenkolsgatan 1B, 417 07 Göteborg, Sweden — same entity for every store | Owner's decision 2026-09-26 |
| First reply target | 24 hours | Owner |
| Refunds / replacements / "the parcel is lost" | Owner approves before you promise it | Owner |
| Escalation channel | Discord `#customer-service` | Owner |

## The delivery window belongs on the page, not in the email

**Never repeat the delivery window in a reply that carries the tracking link.** The
page shows "Estimated delivery" itself, so a sentence about it in the email is noise
the customer has already read. Quote the window only when the order has **not shipped
yet** and there is no link to send.

The number above is for your own judgment: is this parcel late, when should it have
arrived, is the complaint even due yet.

## Adding a new brand to this base

1. Duplicate this whole SOP base into the new brand's teamspace.
2. Change **this page only**: one row in the store table, one column in the owner
 values.
3. Check the two things that silently break: the tracking page opens and finds a real
 parcel, and the support address receives mail.

Nothing else is edited. If you find yourself changing a procedure page for one brand,
the value belongs here instead.
