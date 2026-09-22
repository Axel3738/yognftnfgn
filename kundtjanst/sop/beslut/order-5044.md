## Order #5044 — 589 SEK — due 2026-10-01

**Decision: FIGHT**

**Why**
The money and the dispute fee are already debited on a chargeback, so accepting returns nothing and refunds nothing — fighting costs 15 minutes of VA time and is the only path to getting the 589 SEK back. The package is confirmed delivered 2026-08-25 to an address that matches the billing address, no refund has ever been issued, the customer was offered a free replacement and later a return address, and he has neither replied nor returned the goods — so he currently holds both the product and the funds. This shop has already won one `product_unacceptable` chargeback on the same evidence pattern (order #4706, 599 SEK, delivered 2026-08-18).

**Evidence to attach**
1. **Delivery proof** — Shopify admin → order #5044 → Fulfillment → copy carrier ({{CARRIER}}) and tracking number. Paste the number into 17track.net in the browser and screenshot the scan list showing the delivery scan on 2026-08-25. Save as one PNG. (Do **not** run `node sparning/kor.mjs --dagar 90`; a live run writes fulfillment events and mails old customers.)
2. **Shipping/billing address match** — screenshot of the order's shipping and billing address block from the Shopify order page (they are identical on this order). Same file as item 1 if it fits.
3. **Product page as shown before purchase** — open the live product page for the item on #5044, screenshot the title, images, description and price. This is the `product_description` / accurate-representation evidence for `product_unacceptable`.
4. **Return and refund policy** — screenshot of {{POLICY_URL}} plus the store footer showing the policy link is on every page before checkout. One PDF or PNG.
5. **Customer communication** — from the support mailbox ({{SUPPORT_EMAIL}}), export the whole thread as one PDF: the customer's defect report, CS's reply offering a replacement and asking him to confirm, and the return-address email sent 2026-09-20. If the replacement-offer email cannot be found in the mailbox, attach only what exists and delete the replacement sentence from the cover text — do not describe an email you cannot show.
6. **Format check before upload** — PDF/JPEG/PNG only, max 2 MB per file, 4 MB total, one file per evidence type, high contrast, no links to Drive or the store.
7. **Where it goes** — Orders → #5044 → chargeback banner → **Add evidence**, paste the cover text into the free-text field, attach the files, click **Save**. Do **not** click **Submit now** today: check the mailbox again on 2026-09-30, add any reply or return tracking, then Submit. Shopify sends it on the due date anyway; after 2026-10-01 nothing can be added.

**Cover text to paste into the dispute**
The cardholder ordered {{PRODUCT_NAME}} from {{STORE_NAME}} on {{ORDER_DATE}} (order #5044, {{AMOUNT}} {{CURRENCY}}). The order was shipped with {{CARRIER}}, tracking {{TRACKING_NUMBER}}, and the carrier confirmed delivery on 2026-08-25 to the cardholder's address, which matches the billing address registered to the card. The cardholder then contacted us to report that a button on the product had stopped working; we replied offering a free replacement unit and asked him to confirm that he wanted it, and he did not respond to that offer. On {{RETURN_INSTRUCTIONS_DATE}} we wrote to him again with our return address and an offer of a full refund once the item is returned, in line with the return policy published at {{POLICY_URL}} and linked from every page of the store before checkout. As of {{DATE}} the product has not been returned to us, we have received no return shipment, and the cardholder has not replied to either message. No refund or credit has been issued on this order, because the goods are still in the cardholder's possession. The product was accurately described and pictured on the product page shown before purchase, it was delivered, and the cardholder was offered both a replacement and a full refund on return — he used neither remedy. We ask that the payment be upheld; if the cardholder returns the product to the address already provided, we will refund it in full immediately.

**Risk**
We are not claiming the product was fault-free — our own support notes say the button broke on first use — so a reviewer who treats a credible defect report as decisive will rule for the cardholder regardless of the delivery proof, and chargebacks are the category this shop loses (1 won of 4).

**If it fails**
Write off the 589 SEK plus the fee, do not block the customer (he is a dissatisfied buyer, not fraud), and fix the root cause: ship a replacement immediately on any first-use defect report under {{REPLACEMENT_LIMIT}} without waiting for the customer to confirm he accepts one.
