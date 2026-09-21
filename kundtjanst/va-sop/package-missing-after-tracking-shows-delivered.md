# Package missing after tracking shows delivered

**Category: Delivery** · Internal use only

## Use this when

A customer says the parcel has not arrived, but the store's tracking page (or the Shopify order timeline) shows **Levererat / Delivered**. A parcel still on its way is not this case — check it against the window in Store facts first.

## OVERVIEW

| | |
|---|---|
| Trigger | Customer says the parcel has not arrived; tracking shows Delivered. |
| First step | Confirm the delivery scan (time, place) in the Shopify timeline and on the store's tracking page. |
| Owner approval | Required before any replacement, refund, or saying the parcel is lost. |
| Where to look | 1) Shopify admin → order → fulfillment timeline. 2) The store's tracking page (Store facts). 3) Carrier portals / 17track.net as backup only. |

## Store facts

Per-store values; the steps never name a store.

Every store-specific value — tracking page, parcel number prefix, support address,
delivery promise, return window, where the goods ship from — is on the page **Store facts**.
Take it from there and never type a store name, a domain or an address into this procedure.

## STEP-BY-STEP INSTRUCTIONS

The full look-up procedure is on the page "Tracking page — how to look up any parcel"; only this case's specifics are here.

### Step 1 – Confirm the delivery scan

1. Open the order in Shopify admin. The fulfillment timeline shows the carrier's scans as events ("Ute för leverans", "Levererad"), written by an hourly routine. Copy the carrier tracking number from the fulfillment.
2. Paste it (or the parcel number the customer quotes, BB-/CS-…) into the store's tracking page. Note the delivery scan exactly as shown — e.g. "17 sep 23:28 · Paketet är levererat i din brevlåda · Umeå".
3. Copy "Ditt paketnummer / Your parcel number" from the page. Send the customer that number, never the raw carrier number (YT…, 4PX…).
4. Those two events also trigger the automatic Out for delivery and Delivered emails — if they are in the timeline, the customer was notified.
5. Compare the city in the scan with the shipping address on the order. The page shows no names or addresses; the address is only in Shopify.
6. "We can't find that number": fulfilled less than an hour ago → wait for the next hourly run. Shipped over 60 days ago → carrier number on 17track.net. Otherwise a typo.
7. Carrier portals (17track.net, or the carrier named on the fulfillment) are backup only.

### Step 2 – "Collect your parcel" branch

"Hämta ditt paket / Collect your parcel" means the parcel is waiting at a pickup point — not a missing parcel. Send the pickup point's number and link from the page, plus the parcel number, in the customer's language. Close the case.

### Step 3 – Ask the customer to check common locations

Reply with Template A. It must carry the store parcel number, the link `<tracking page>?nummer=<parcel number>` and the page's own status wording (Levererat / Delivered + place and time). Ask the customer to check:

- mailbox or letterbox
- any notice pointing to a pickup point
- the nearest pickup point of the carrier named on the page
- neighbours
- secure spots on the property (porch, shed)

Also ask whether the scan's place matches where they normally receive parcels, and for a photo if not — the best evidence in a later dispute. Do not suggest the parcel is lost. Follow up once if no reply after 3 days — ask the owner once and write the answer into Store facts.

### Step 4 – Customer still cannot find it: carrier investigation

1. Ask the last-mile carrier named on the tracking page (the one that made the delivery scan) for a formal investigation. If it cannot help, go to the carrier that handled the earlier legs, named on the fulfillment — never that one first. Contact channel and expected answer time: — ask the owner once and write the answer into Store facts.
2. Provide: order ID, carrier tracking number, customer address from the order, and the delivery scan (time, place, wording).
3. Notify the owner and send the customer Template B.
4. No carrier answer after 7 days → remind the carrier, update the owner (⚠️ OWNER: the limit).

### Step 5 – Owner decides, VA replies

- Carrier confirms non-delivery → the owner approves replacement or refund. Ask the supplier whether they can send a new parcel free of charge — they usually can.
- Carrier confirms correct delivery → present the evidence (scan time, place, any photo). Refund or replacement at the owner's discretion.
- Draft the reply (AI prompt + DeepL), review it, send from the store's support address.

## ESCALATION

> Never confirm the parcel is lost, and never offer a replacement or refund, until the
> carrier investigation is complete AND the owner has approved. The owner decides, the
> VA informs.

Escalate after Step 3, when the carrier answers, or when a dispute appears. Send: order ID, parcel number, delivery scan, the customer's answer and photo, the carrier's reply.

## REPLY TEMPLATES

Reply in the customer's language: translate the Swedish text with DeepL, check names, numbers and links.

**Template A – first reply, tracking shows delivered**

Swedish: "Hej [NAMN]! Enligt spårningen är paketet [STATUSTEXT FRÅN SIDAN, t.ex. levererat i din brevlåda] [DATUM OCH TID] i [ORT]. Ditt paketnummer är [PAKETNUMMER], hela kedjan finns här: [SPÅRNINGSSIDA]?nummer=[PAKETNUMMER]. Kan du kolla brevlådan, eventuell avi, närmaste utlämningsställe hos [FRAKTBOLAG], grannarna och tomten? Stämmer platsen med där du brukar få paket? Hör av dig om du inte hittar det, så undersöker vi vidare."

English meaning: Hi [NAME]! According to the tracking the parcel is [STATUS WORDING, e.g. delivered in your mailbox] [DATE AND TIME] in [CITY]. Your parcel number is [PARCEL NUMBER]; the whole chain is here: [TRACKING PAGE]?nummer=[PARCEL NUMBER]. Could you check your mailbox, any pickup notice, the nearest [CARRIER] pickup point, neighbours and your property? Does the place match where you usually receive parcels? Let us know if you cannot find it and we will investigate further.

**Template B – investigation opened**

Swedish: "Hej [NAMN]! Tack för att du kollade. Vi har öppnat en utredning hos fraktbolaget om ditt paket [PAKETNUMMER] och återkommer så snart vi fått svar. Vi ber om ursäkt för besväret."

English meaning: Hi [NAME]! Thanks for checking. We have opened an investigation with the carrier about your parcel [PARCEL NUMBER] and will get back to you as soon as we have their answer. We apologise for the inconvenience.

## AI PROMPT TEMPLATE

Use the team's AI tool (Claude or ChatGPT) for the draft, DeepL for the final language. Review before sending. Never quote another customer's parcel.

> Draft a friendly email in [CUSTOMER'S LANGUAGE] to a customer whose tracking shows
> delivered but who has not received the parcel for order [ORDER ID]. State the delivery
> scan exactly as the tracking page shows it: [STATUS WORDING], [DATE AND TIME], [CITY].
> Include the parcel number [PARCEL NUMBER] and the link [TRACKING PAGE]?nummer=[PARCEL
> NUMBER]. Ask them to check their mailbox, any pickup notice, the nearest [CARRIER]
> pickup point, neighbours and their property, and whether the delivery place matches
> where they usually receive parcels. Ask them to get back to us if they cannot find it.
> Do not say the parcel is lost. Calm. Under 120 words.

After the owner's decision: give the tool the decision and the carrier's answer; the reply states the outcome only.