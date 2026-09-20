## Order #4706 — 599 SEK — due 2026-10-08

**Decision: FIGHT**

**Why**
The package was scanned as delivered on 2026-08-18, the billing and shipping addresses match, and no refund has ever been issued on this order. The cardholder never contacted support — they posted a public product review instead of asking us for a return or a replacement, which proves possession and proves they had a working route to us and did not use it. Decisively: an identical claim on this same order, same amount, same reason was already decided in our favour on 2026-09-20, so the evidence packet is known to work.

**Evidence to attach**

1. **Delivery proof (17TRACK scan history).** Shopify admin → Orders → #4706 → the fulfilled line item → copy the tracking number. Open 17track.net in a browser, paste the number, screenshot the full scan list with the delivered scan of 2026-08-18 visible. If it answers *"does not register, please register first"*, register that one number on 17track.net and re-read it — registration costs quota, that is normal. ⚠️ Do **not** run `node sparning/kor.mjs` with a wide `--dagar` window to look this up: a sharp run writes fulfillment events into Shopify and fires "delivered" emails to old customers.
2. **Order and address record.** Shopify admin → order #4706 → screenshot showing order date, fulfillment date and time, shipping address and billing address side by side (they are identical). Also fill the dispute form's shipping/fulfillment fields — carrier, tracking number, ship date — which the admin pre-populates from the order; check they are correct, do not leave them blank.
3. **Product page exactly as it was sold.** {{PRODUCT_URL}} → screenshot of title, images, description, specifications and price. This is the core rebuttal for *product unacceptable*: it shows the product was represented accurately before purchase.
4. **Refund and return policy plus its disclosure.** Screenshot of {{POLICY_URL}} **and** of the checkout/footer link where the policy is visible before payment. Paste the policy text into the refund-policy and policy-disclosure fields of the form.
5. **Proof of no customer contact.** Search the support mailbox {{SUPPORT_EMAIL}} for the cardholder's email address and for "{{ORDER_NUMBER}}". Screenshot the empty result. This backs the sentence in the cover text — under the card-network guidance, "the customer never tried to resolve this with us" must be stated affirmatively, not left out.
6. **The public review.** Judge.me admin (or the product page) → screenshot with reviewer name, product and date visible. It is our possession proof and it dates their complaint to before the dispute.
7. **The prior won case on this same order.** Shopify admin → order #4706 → the resolved chargeback section → screenshot showing status **Won** and the decision date 2026-09-20. Note the case ID; it goes into the cover text.

Combine same-type items into one file. Limits: PDF/JPEG/PNG only, 2 MB per file, 4 MB combined, portrait, legible in black and white (issuers still read these on fax-grade output).

**Workflow note:** add the evidence today and press **Save** — do **not** press "Submit now", which locks edits permanently. Revisit on 2026-10-06; anything the customer writes back before then gets added, then submit (or let Shopify auto-send on the due date). Send one service email today offering the return address, no refund offer while the dispute is open — if the customer agrees the claim was a mistake, only the customer can withdraw it with their bank.

**Cover text to paste into the dispute**

> Order {{ORDER_NUMBER}} was placed at {{STORE_NAME}} on {{ORDER_DATE}} and paid with the cardholder's card; the billing address and the shipping address on the order are identical. The item, {{PRODUCT_NAME}}, was shipped with {{CARRIER}} under tracking number {{TRACKING_NUMBER}} and was scanned as delivered to that address on 2026-08-18. The cardholder has never contacted us: no email, no phone call, no return request and no request for a replacement has been received at {{SUPPORT_EMAIL}} at any time before or after this dispute was filed. On {{REVIEW_DATE}} the cardholder posted a public review of this purchase on our store, which confirms the goods were received and are in their possession and shows they were able to reach us about the product but chose not to. No refund or credit of any kind has been issued on this order and the product has not been returned to us; our published return policy at {{POLICY_URL}}, shown to every customer before payment, allows {{RETURN_WINDOW_DAYS}} days to return the item for a refund, and the cardholder never used it. The product was represented accurately before purchase — the attached product page shows the same images, description and specifications that were displayed when the order was placed. The identical claim on this same order, for this same amount of {{DISPUTE_AMOUNT}} and under this same reason, was already reviewed and decided in our favour on {{PRIOR_DISPUTE_DECISION_DATE}} (case {{PRIOR_DISPUTE_ID}}). We ask that this dispute be resolved in our favour on the same evidence.

**Risk**
*Product unacceptable* is decided on the condition of the goods, not on delivery — the public review is the cardholder's own written statement that the product disappointed them, we have no photo of the unit as shipped and no record that we ever offered a remedy, so an issuer could weigh their account above our delivery proof.

**If it fails**
Write off the 599 SEK (an inquiry pulls no funds and no chargeback fee unless it escalates), do not refund on top of a loss, and fix the cause: every review of 3 stars or lower gets a CS email with the return address within 24 hours — that email is what would have stopped this dispute before it reached the bank.
