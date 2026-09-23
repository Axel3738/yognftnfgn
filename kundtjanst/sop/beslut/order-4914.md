## Order #4914 - 348 SEK - CHARGEBACK - due 2026-09-30

**Decision: FIGHT** (case strength: strong). Measured with `node kundtjanst/tvistfakta.mjs 4914 --brand baverbutiken` on 2026-09-23; posted to the VA in Discord `#customer-service` the same day.

**Why**
This started as an inquiry (2026-08-28) and escalated to a chargeback because nobody answered it — the exact path the handbook warns about. The carrier scan shows **DELIVERED on 2026-08-27** to the shipping address ({{CARRIER}}: YunExpress), billing address = shipping address, payment paid, fulfilment fulfilled, no refund ever issued. A delivery scan against the customer's own address is the strongest evidence we have. Chargebacks are the only disputes this shop has ever lost (1 won of 4), so this one is worth the full package.

**Evidence to attach**
1. **Delivery scan** — Shopify admin → order #4914 → Fulfillment → copy the tracking number → paste it at 17track.net in the browser → screenshot the full event list with the DELIVERED scan of 2026-08-27 (date, time, place). Browser lookup only — never a wide `sparning/kor.mjs` run, it writes events into Shopify.
2. **Order confirmation** — the Shopify order page: customer, item (Marin Motorhölje 420D), amount, date (placed 2026-08-06).
3. **Email thread** — the support mailbox, search "4914" and the customer's address. If there is none, write one line in the cover text saying the customer never contacted us before filing.
4. **The policy page** the customer accepted at checkout ({{POLICY_URL}}).

Do **not** claim a signature, a GPS point or a delivery photo — we have none for this carrier. Keep the package under 4 MB, PDF/JPEG/PNG.

**Cover text to paste into the dispute**

> Order #4914 was placed on 2026-08-06 at {{STORE_DOMAIN}} and paid in full. The order was fulfilled and handed to the carrier {{CARRIER}} under tracking number {{TRACKING_NUMBER}}. Carrier tracking shows the parcel was delivered on 2026-08-27 to {{SHIPPING_CITY}}, Sweden, at the shipping address supplied by the cardholder, which is identical to the billing address on the card used for payment. No refund or credit has been issued on this order. [If applicable: The cardholder did not contact us at {{SUPPORT_EMAIL}} before this dispute was filed.] We therefore ask that this chargeback be resolved in our favour.

**Risk**
The customer may claim the scan is wrong or the parcel was stolen after delivery. Still worth fighting.

**Timing for the VA**
Add the evidence and click **Save** today. Click **Submit now** on **2026-09-29** at the latest — the deadline 2026-09-30 has no exceptions, and **Submit now** locks the evidence permanently. Email the customer the same day regardless.
