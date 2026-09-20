## Order #5435 - 348.00 SEK - due 2026-10-03

**Decision: FIGHT**

**Why**
The carrier confirmed delivery on 2026-09-10 to an address identical to the card's billing address, and the goods have never come back to us — so no refund is owed yet, it is simply not due until the return arrives. The cardholder's cancellation request was handled as a return, not refused, and nothing on this order has ever been refunded, so there is no "missing credit" to explain away. The same order already produced a `product_not_received` inquiry that was decided in our favour on this same delivery evidence, which both proves possession and shows this is the second claim on one 348 SEK order.

**Evidence to attach**

1. **Carrier delivery proof (DELIVERED 2026-09-10).** Shopify admin → Orders → #5435 → Fulfillment → copy the tracking number → open 17track.net in the browser, paste it, screenshot the full event list including the delivery scan. PNG, high contrast, full width. Attach as the shipping documentation file. ⚠️ Do **not** run `node sparning/kor.mjs --dagar 90` to look this up — a live run writes fulfillment events into Shopify and would email hundreds of old customers "Delivered".
2. **Fulfillment record: ship date, carrier, tracking number.** Same order page, Fulfillment card. Type carrier + tracking + ship date into the shipping fields; Shopify auto-populates these, but enter them manually so they are certain to be there.
3. **Address match.** Order page → Customer card: shipping address and billing address. Paste both into the shipping-address and billing-address fields. They are identical on this order — say so in the cover text (already written below).
4. **Refund/return policy as published.** Open {{POLICY_URL}}, print to PDF (portrait, 12pt or larger, no colour highlighting). This is the refund-policy file. In the policy-disclosure field, state exactly where it is shown: {{POLICY_DISCLOSURE_LOCATION}} (footer link + checkout page).
5. **The return-address email to this customer.** Loopia webmail → search the customer's address → open the thread where CS answered the cancellation request → export/print the thread to PDF, headers and dates visible. **If CS never sent a return address on this order, send it today from {{SUPPORT_EMAIL}} before submitting, and attach that email.** Without this document the defence is much weaker — see Risk.
6. **The prior won dispute on the same order.** Orders → #5435 → dispute history: the `product_not_received` inquiry marked won. Screenshot it and attach with the short note that the same order was already disputed on a contradictory ground.
7. **Refund ledger: none.** Order page → Payment section showing the order as paid with no refunds recorded. Screenshot. It supports the sentence "no part of the order has been refunded or credited".

Combine same-type items into one file. PDF/JPEG/PNG only, 2 MB per file, 4 MB combined, under 50 pages (19 for Mastercard). Save as you go; do **not** press **Submit now** until item 5 exists.

**Cover text to paste into the dispute**

> The cardholder placed order {{ORDER_NUMBER}} with {{STORE_NAME}} ({{STORE_DOMAIN}}) on {{ORDER_DATE}}. The parcel was shipped with {{CARRIER}}, tracking {{TRACKING_NUMBER}}, and the carrier recorded delivery on 10 September 2026 to the address given on the order, which is identical to the billing address registered to the card. On {{CANCELLATION_REQUEST_DATE}} the cardholder contacted us asking to cancel; the parcel had already left the warehouse, so we did not refuse the cancellation — we handled it as a return under our published return policy at {{POLICY_URL}}, which is shown to every customer before purchase at {{POLICY_DISCLOSURE_LOCATION}} and states that the purchase price is refunded once the goods are received back at {{RETURN_ADDRESS}}. We sent the cardholder the return address and return instructions from {{SUPPORT_EMAIL}} on {{RETURN_INSTRUCTIONS_DATE}}, and that return right remains open. As of today the goods have not been returned to us, no return tracking has been supplied, and no amount on this order has been refunded or credited. We are therefore not withholding a refund that is due; the refund is not yet due, because the merchandise is confirmed delivered and remains in the cardholder's possession. The same order was separately disputed as "product not received" and that dispute was decided in our favour on this same delivery evidence. We ask that this inquiry be closed, and we confirm that the full 348.00 SEK will be refunded to the original card as soon as the goods arrive at our return address.

**Risk**
The cardholder did invoke a cancellation inside the stated 14-day window, so if we cannot show a dated written return instruction (evidence item 5), the issuer can read this as us blocking a valid cancellation and decide for the cardholder — and if the parcel is returned to us before 2026-10-03 the defence collapses and we must refund in full anyway.

**If it fails**
Write off the 348 SEK, do not chase the goods or refund a second time, flag the customer's email in Shopify as "no cancellation honoured after shipping", and fix the root cause: every cancellation request received after a parcel has shipped must get a return address in writing the same day, because that one email is the document this reason code is won with.
