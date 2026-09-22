# Store facts — the only page that changes per brand

**Read this once, keep it open.** Every other SOP in this base says "take the value
from Store facts". Nothing else in the procedures names a store, a domain, a carrier
or an email address, so the same SOPs work on every brand we run.

Last verified 2026-09-21 against the tracking register and each store's live page.

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
| Return window | 14 days **from the day the customer received the item** (owner's decision 2026-09-22). ⚠️ The published policy page still says 30 days until the owner changes it, so a customer who quotes 30 days is quoting our own page: tell the owner, do not argue | Owner |
| Statutory right of withdrawal | 14 days from receipt (EU) | Distance selling law, runs in parallel with the return window |
| Auto-reply bot | **Dry run**: it writes drafts in Drafts and sends nothing. Signs as "Kundtjänst Bäverbutiken". Priority folder: VA-PRIO. Run report in the escalation channel after every hour in which something happened | Owner switches it live (see the page **Auto-reply bot**) |
| Return address | Given out by support on request — it is published nowhere | Owner's decision: fewer returns, but only if we answer within 24 hours |
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
