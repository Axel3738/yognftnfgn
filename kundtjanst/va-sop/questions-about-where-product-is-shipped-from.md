# SOP: Questions about where the product is shipped from

Shipping & Customs SOP for every store. Domain, support address and prefix come from the **Store facts** table at the bottom, never from memory.

## Use this when

- Shipping origin, delivery time or carrier mentioned: this SOP.
- Only a number or a status question: the Tracking page SOP (until it exists: Step 2).
- Both: this SOP; the tracking link covers status.

## REFERENCE POINTS

| Item | Rule |
|---|---|
| Delivery promise | 7–14 calendar days after the shipping email. Handling before shipping is not part of it — always say "after it has shipped". If a store's own site still shows a different figure, tell the owner instead of repeating it to the customer |
| Parcel number | Under the button in the shipping email; prefix per store in Store facts. Never the carrier's raw number (YT…, 4PX…) |

## STEP-BY-STEP INSTRUCTIONS

### Step 1 – Look up the order in Shopify

1. Shopify admin, then Orders, then open the order (search by number or email).
2. Fulfilled card: copy the tracking number (link under the carrier line). Timeline below: events like "Paketet är på väg" with dates — newest = latest scan. Unfulfilled = not shipped.
3. Not shipped: say it has not left the warehouse and the shipping email is coming. Packing takes 1–2 business days; promise nothing beyond "7–14 calendar days after it ships".
4. Unfulfilled more than 3 business days after the order: escalate first; do not promise a ship date.

### Step 2 – Find the parcel on the store's tracking page

1. Pick the page for the shipping address country (Store facts). CaraShell: NO /nb, FI /fi, US/GB/CA/AU/NZ carashell.com, else carashell.se.
2. Paste the tracking number from Shopify, or the parcel number the customer quotes.
3. Copy the store parcel number the page shows ("Your parcel number") — send that one.
4. Note the stage (Order received / On its way / With the carrier / Out for delivery / Delivered) and "Estimated delivery". A "Collect your parcel" box = pickup point: send the customer its name and number.
5. Carrier portal, backup only (page cannot show the parcel, or no page): paste Shopify's raw number (YT…/4PX…) into 17track.net — fine to USE, never send. Give the stage in your own words; never the portal link.

### Step 3 – Answer the question directly

1. Origin: "Ships from" in Store facts (Shopify fulfillment wins). Which country: ⚠️ OWNER — until answered, until then say "our partner warehouse abroad" and move on.
2. Promise: 7–14 calendar days after the shipping email.
3. Send the link: tracking page + ?nummer= + parcel number. The page shows the parcel's stage and where it is, updated hourly.
4. Two cases: (a) Silent tracking — parcel found, no scans yet, shipped under 4 days ago: normal, on its way to the flight. (b) "We can't find that number" — NOT the flight: the page adds parcels hourly; fulfilled under an hour ago, wait for the next run; over 60 days, carrier portal; else a typo.
5. Carrier question: the page shows the STAGE "With the carrier" ("Hos fraktbolaget" in Swedish; label follows page language), never the carrier's name. Name one only if asked, read from the Shopify fulfillment — never the raw number.

### Step 4 – Address customs concerns if raised

Quote the store's own shipping page, never your own rule ("Customs/VAT" in Store facts). Empty cell: reply "I'll check the rules for your country and get back to you within 24 h" and ask the owner in #customer-service.

### Step 5 – Draft the reply

Reply template or AI prompt, in the customer's language (DeepL free web version: paste the Swedish text, pick the language, proofread).

- **Never send the carrier's raw tracking number, and never look up or quote another customer's parcel.**

## ESCALATION

Post in Discord #customer-service: order number, parcel number, ship date, last scan with date, the customer's question. Information replies need no approval; refunds, replacements and any "lost" statement need the owner.

- No new scan for 7 days after the first scans, or past day 14 (from the Shopify ship date, not the order date): check the carrier portal, escalate, and send: "Your parcel is delayed beyond our estimate. I've asked the carrier for an update and will get back to you within 2 business days."
- "Delivered" but nothing received: check mailbox, pickup point and neighbours. Still missing after 2 business days: SOP 10 Not received. Never say lost or promise a refund/replacement — owner decides, only after the carrier confirms non-delivery.
- "Collect your parcel" shown: send its name and number; no escalation.

## REPLY TEMPLATES

[parcel number] takes the store's prefix (BB-, CS-, MS-) and [store name] from Store facts.

**Swedish (use this):**

Hej [namn]! Din order skickas från [enligt Store facts]. Beräknad leverans är 7–14 dagar efter leveransmejlet. Du följer paketet här: [spårningslänk]. Ditt paketnummer är [paketnummer]. De första dagarna kan spårningen vara tom — det är helt normalt, paketet är på väg till flyget. Hör av dig om du undrar något mer! [Butiksnamn] support

**English (send as is to EN customers):**

Hi [name]! Your order ships from [per Store facts]. Estimated delivery is 7–14 days after the shipping email. Follow the parcel here: [tracking link]. Your parcel number is [parcel number]. The first few days the tracking may be empty — that is completely normal, the parcel is on its way to the flight. Any other questions? Just reply! [Store name] support

## AI PROMPT TEMPLATE

"Draft a friendly email in [CUSTOMER'S LANGUAGE] answering where the order ships from. It ships from [SHIPS-FROM CLAIM]; delivery takes 7–14 calendar days after the shipping email. Include the link [tracking page]?nummer=[parcel number] and the parcel number; the page shows where the parcel is, updated hourly. Tracking can be empty the first 2–4 days; that is normal. Do not name a carrier unless the customer asks; the page does not show it. No customs. Sign with [STORE NAME] support. Under 120 words."

## Store facts

⚠️ Use the support address from **Store facts**, never an address you read in a site footer. One store's footer still shows an address whose domain has no mail server at all, so anything sent there is lost.

Every store-specific value — tracking page, parcel number prefix, support address,
delivery promise, return window, where the goods ship from — is on the page **Store facts**.
Take it from there and never type a store name, a domain or an address into this procedure.

Internal Use Only — store details: Store facts above.