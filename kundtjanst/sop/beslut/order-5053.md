## Order #5053 - 348 SEK + 255 SEK (603 SEK total, TWO separate inquiries on one order) - due 2026-09-28

**Decision: FIGHT** - respond to both inquiries separately, with the same evidence package.

**Why**
17TRACK confirms the parcel was DELIVERED on 2026-09-11 to the customer's address, and billing address == shipping address on the order. No refund has ever been issued, so "product not received" is contradicted by a carrier delivery scan. These are inquiries, not chargebacks - no money has been taken yet, and every decided inquiry this shop has answered has been won (29 of 29, measured 2026-09-20), while the only losses ever recorded were chargebacks.

**Evidence to attach**
1. **Delivery proof from 17TRACK** - Shopify admin → order #5053 → Fulfillment → copy the tracking number → open 17track.net in the browser, paste it, screenshot the full event list showing the DELIVERED scan of 2026-09-11 with date, time and location. Do **not** run `node sparning/kor.mjs` with a wide `--dagar` window to get this: a live run writes fulfillment events into Shopify and would fire "delivered" emails to hundreds of old customers. Browser lookup only.
2. **Tracking number, carrier ({{CARRIER}} - YunExpress or 4PX) and ship date** - same Fulfillment block in the Shopify order. Shopify auto-populates these into the `fulfillments` evidence field; verify they are there before submitting.
3. **Shipping address and billing address** - Shopify order page. They are identical on this order; that is an AVS-style match and it belongs in the response.
4. **Order confirmation and shipping confirmation emails** - Shopify admin → order #5053 → Timeline → the notification entries. Screenshot or PDF, one combined file.
5. **Statement of no prior contact + the VA's email of 2026-09-20** - export the sent email from the support mailbox. State explicitly that the customer never contacted us before filing; "no conversation" is a documented argument in our favour, not a gap.
   ✅ **Verified 2026-09-25, and safe to write.** Three searches over the whole mailbox (38 pages / 1 856 mails of INBOX), because a sheet that claims "no contact" without them is how #4446 nearly went to a bank with a false statement: the **order number** gave only Shopify's own two dispute notifications of 2026-09-09; the **surname** gave three mails, all from a different customer (Mikael Östman, `cheeseman.ostman@…`, about order #4718 - not this case); the **first name** gave three unrelated Håkans. The order's own address is `hakanostman75@hotmail.com` and it has never written to us.
   ⚠️ Re-run the surname search on the day you submit. Customers often write *after* filing, and a header search cannot see a contact-form mail whose sender is Shopify.
6. **Item split for the two disputes** - Shopify order page, line items. Establish which items the 348 SEK claim covers and which the 255 SEK claim covers, and whether both shipped in the same parcel. If one parcel carried both, say so in the response and attach the packing list / itemised order; if there were two tracking numbers, attach the matching scan to each dispute.

Do **not** claim a signature, a GPS delivery map or a photo of delivery - we do not have them for this carrier. Keep the whole package under 4 MB, PDF/JPEG/PNG, high contrast.

**Cover text to paste into the dispute**
Paste this into the evidence text field of **both** disputes, changing only {{AMOUNT}}.

> Order #5053 was placed on {{ORDER_DATE}} at {{STORE_DOMAIN}} and paid in full. The order was fulfilled and handed to the carrier {{CARRIER}} on {{SHIP_DATE}} under tracking number {{TRACKING_NUMBER}}. Carrier tracking shows the parcel was delivered on 2026-09-11 to {{SHIPPING_CITY}}, Sweden, at the shipping address supplied by the cardholder. The shipping address on the order is identical to the billing address on the card used for payment. The cardholder did not contact us at {{SUPPORT_EMAIL}} at any point before this dispute was filed; our first contact with the cardholder was our own email of 2026-09-20, sent after we were notified of this dispute, and we have received no reply reporting a missing delivery. No refund or credit has been issued on this order, so no part of the amount has been returned by any other route. This dispute covers {{AMOUNT}} of order #5053; a second dispute was filed against the remaining amount of the same order, and the delivery evidence above covers the entire shipment. We therefore ask that this dispute be resolved in our favour.

**Risk**
The delivery scan has no signature and no GPS point, so the issuer can still side with a cardholder who insists the parcel never reached their hand - and if the 255 SEK claim is really about one item missing *inside* a delivered parcel, a delivery scan does not prove contents.

**If it fails**
Write off the 603 SEK, tag the customer in Shopify so future orders are reviewed manually, and fix the root cause: both disputes were filed before any human had spoken to this customer, which is the same WISMO backlog that produced 192 unanswered emails over 48 hours this week.

**Timing for the VA:** add the evidence and click **Save** today, on both disputes. If the customer replies to the 2026-09-20 email before 2026-09-26, add the reply and then click **Submit now**. Otherwise submit on 2026-09-26 - never later, the deadline 2026-09-28 has no exceptions, and **Submit now** locks the evidence permanently.
