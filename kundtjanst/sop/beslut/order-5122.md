## Order #5122 — 348 SEK — due 2026-09-21

**Decision: ACCEPT/REFUND** — refund the full 348 SEK today, do not wait for the item to come back.

**Why**
The package was delivered 2026-08-26, but the cardholder wrote in to report that the straps arrived damaged and our CS never answered him — the return address went out only on 2026-09-20, about three and a half weeks late. For `product_unacceptable` the documented ways to win are "the product was not damaged", "the product was accurately represented", or "a refund/replacement was already given"; we can honestly claim none of them, and the return address we sent is itself a written admission that the goods were faulty. The evidence packet is already submitted (status `under_review`, window closes tomorrow) so nothing can be strengthened — a 348 SEK refund now costs the same as losing, minus the chargeback fee and the escalation risk if he stays unhappy.

**Evidence to attach**
The packet for this dispute was already submitted, so the evidence form is locked. Attach the items below only if the "Chargeback response" page still opens for editing, or if this comes back as a formal chargeback later. Everything listed exists for this order — do not fabricate anything beyond it.

1. **Refund receipt** — Shopify admin → Orders → #5122 → Timeline, after you issue the refund. Screenshot showing amount, date and "refunded to card". This is the single most useful document in a credit-issued response.
2. **The email thread with the customer** — {{SUPPORT_EMAIL}} mailbox (Loopia webmail), search his email address or "5122". Contains his damaged-straps message and our return-address reply of 2026-09-20. Include it: it shows we resolved, even though it also shows we were late.
3. **Fulfillment and tracking record** — Shopify admin → Orders → #5122 → Fulfillment section: carrier ({{CARRIER}}, YunExpress or 4PX) plus {{TRACKING_NUMBER}} and the ship date.
4. **Delivery scan** — paste {{TRACKING_NUMBER}} into 17track.net in the browser and screenshot the DELIVERED line of 2026-08-26. Note: tracking this old is usually not registered with 17TRACK yet; the site will ask you to register the number first before it shows any scans. Never run the hourly tracking job with a wide date window to look this up — it writes delivery events back into Shopify and mails old customers.
5. **Return/refund policy page as shown at checkout** — {{POLICY_URL}}, printed to PDF.

**Cover text to paste into the dispute**

{{STORE_NAME}} has refunded this transaction in full and does not contest the dispute. Order {{ORDER_NUMBER}} was placed on {{ORDER_DATE}} and shipped with {{CARRIER}} under tracking number {{TRACKING_NUMBER}}; the carrier recorded delivery to the cardholder's address on 26 August 2026, and the billing and shipping addresses on the order are identical. On {{CS_EMAIL_DATE}} the cardholder contacted us at {{SUPPORT_EMAIL}} to report that the straps on the delivered item arrived damaged. That message was not answered within our normal response time; we replied with return instructions on 20 September 2026, and the delay was ours, not the cardholder's. Because the goods were faulty on arrival and our reply was late, we have issued a full refund of {{REFUND_AMOUNT}} to the original card on {{REFUND_DATE}} and have not required the item to be returned. We ask that this dispute be closed as resolved in the cardholder's favour, with no further amount due. Copies of the refund confirmation and the email exchange are attached.

**Risk**
If the issuer rules on the already-submitted packet after the refund posts, the cardholder can end up credited twice — check the order's payment timeline the day after refunding, and if both a refund and a debit appear, open a Shopify support ticket the same day.

**If it fails**
Write off the 348 SEK, do not block this customer (he was in the right), and fix the actual cause: an unanswered support email sitting 25 days — that is what turned a 348 SEK return into a bank dispute.
