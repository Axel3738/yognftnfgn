## Order #5418 - 348 SEK - due 2026-10-03
**Decision: FIGHT**

**Why**
17TRACK confirms the parcel was DELIVERED on 2026-09-11, three days *before* the cardholder opened this inquiry on 2026-09-14, and the shipping address matches the billing address on file. No refund has ever been issued on this order, so there is nothing the customer is owed. This is an inquiry, not a chargeback — no money has been taken yet, and every decided `product_not_received` inquiry this brand has answered with a delivery scan has been won (3 of 3: #5435, #5763, #5289).

**Evidence to attach**
1. **Fulfillment and tracking details** — Shopify admin → Orders → #5418 → Fulfillment section. Copy carrier name ({{CARRIER}}, YunExpress or 4PX) and the tracking number into the evidence form's shipping fields, plus the ship date.
2. **17TRACK delivery scan, as a screenshot** — open 17track.net in the browser, paste the tracking number from step 1. If it answers "does not register, please register first", register that single number there and wait for the scan history to load. Screenshot the full event list so the 2026-09-11 delivery line and the destination city are both visible. Save as PNG, high contrast, under 2 MB. Attach as the shipping documentation file. Do **not** run `node sparning/kor.mjs` with a wide `--dagar` window to look this up — a sharp run writes fulfillment events into Shopify and mails "Delivered" notices to hundreds of old customers.
3. **Shipping address and billing address** — Shopify admin → Orders → #5418. Fill both address fields in the evidence form; they match, and that match is part of the argument.
4. **Customer name and email** — same order page, into the customer email / first name / last name fields.
5. **Our outreach email of 2026-09-20** — from the support mailbox ({{SUPPORT_EMAIL}}), exported as PDF, attached as the customer communication file. It shows we contacted the customer after the inquiry and got no reply. There is no earlier correspondence, because the customer never contacted us before disputing — say that in the cover text rather than hiding it.
6. **Order date, order confirmation and customer IP / IP country** — Shopify Payments populates these automatically. Leave them in; do not delete anything the form pre-fills.

**Cover text to paste into the dispute**
> Order {{ORDER_NUMBER}} was placed on {{ORDER_DATE}} for {{ORDER_TOTAL}} and shipped on {{SHIP_DATE}} with {{CARRIER}}, tracking number {{TRACKING_NUMBER}}. The carrier's tracking record shows the parcel was delivered on {{DELIVERY_DATE}} to {{SHIPPING_CITY}}, {{STORE_COUNTRY}}. The delivery address is identical to the billing address registered to the cardholder, and the order was placed from an IP address in the same country. The cardholder did not contact us at any point before filing this dispute — no email, no message and no support ticket exists prior to {{DISPUTE_DATE}}. After the dispute was filed we wrote to the cardholder at their order email address on 2026-09-20 from {{SUPPORT_EMAIL}} to ask what was missing; a copy of that message is attached and no reply has been received. No refund, credit or replacement has been issued on this order, so the full amount remains payable. We therefore ask that this dispute be resolved in favour of {{STORE_NAME}}, as the goods were delivered to the cardholder's verified address before the dispute was opened.

**Risk**
The only proof of delivery is a carrier scan — there is no signature and no GPS delivery map — so an issuer that simply takes the cardholder's word, or a genuine porch theft at the door, can still beat us.

**If it fails**
Write off the 348 SEK, do not reship, flag the customer's email as prepaid-only for future orders, and fix the root cause: this customer never got an answer before going to their bank, so clear the WISMO backlog (192 tickets unanswered over 48 h) before it produces the next inquiry.
