## Order #4914 - 348 SEK - CHARGEBACK - due 2026-09-30

> ⭐ **WON — measured 2026-10-02.** Shopify decided this chargeback in our favour on
> **2026-10-01 17:11**, and the 348 SEK stays with us. Nothing more to do on this one;
> the lesson below is the part worth keeping.
>
> ⛔ **The evidence went in 8.5 hours LATE and still won.** The deadline was
> `2026-09-30T01:00:00+02:00`; `evidence_sent_on` reads **2026-09-30T09:32:09+02:00**.
> At 07:40 that morning the daily alarm had already measured `evidence_sent_on: null`
> and printed *"the window has closed — not a task, it cannot be reopened"*. That text
> was wrong, and had the VA followed it this money would be gone. **A passed deadline
> is always still worth a submission** — measured twice for acceptance (this one and
> #5053, six hours late on 2026-09-28) and now once for the outcome. The alarm was
> rewritten the same day to say SUBMIT ANYWAY, and three tests forbid the old wording.
>
> Also measured in the same pull: chargebacks now stand at **5 won of 9 decided**, not
> the "1 of 4" quoted below — and of those 9, three were won with **no evidence at
> all**. The old number is kept in the text as it was written; the current one lives in
> `00-MASTER.md`.

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
