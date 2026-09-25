## Order #1190 (Beverbutikken, NO) — 338 NOK — CHARGEBACK — due 2026-10-06

**Decision: FIGHT — strong on the delivery evidence, but write nothing about contact.**

This is the **first dispute Beverbutikken has ever shown us.** It was invisible until
2026-09-23, when the NO app finally got `read_shopify_payments_disputes`; it stood
`under_review` that day and needs our response now. Treat it as a real chargeback:
the money is already taken and a loss is final.

**What the data says** (`node kundtjanst/tvistfakta.mjs 1190 --brand beverbutikken`,
read 2026-09-25)

| | |
|---|---|
| Reason | `credit_not_processed` — "you told us you would refund and did not" |
| Placed | 2026-08-27, 338,30 NOK, paid, fulfilled |
| Shipped to | Alta, NO — **billing address identical to shipping** |
| Tracking | `UL459406877YP` (yanwen) → **DELIVERED 2026-09-15** |
| Refunds | **none, ever** |
| Item | Fiskestangholder 4-pakning |

**Evidence to attach**

1. **Delivery scan** — the DELIVERED event of 2026-09-15 with date, time and place.
   Look the number up on 17track.net in a browser. ⚠️ Never run
   `node sparning/kor.mjs --dagar 90` to fetch it: a live run writes fulfillment
   events into Shopify and fires delivery mails to hundreds of old customers.
2. **Order confirmation** — the Shopify order page: customer, items, amount, date.
3. **Address match** — shipping and billing are the same; say so.
4. **Refund history** — the order page showing paid, zero refunds, no return received.
5. **The published return and refund policy** on the store, and the policy link as it
   appears at checkout before payment.

**Cover text to paste** — fill the brackets from the order page.

Order #1190 was placed on 2026-08-27 at [STORE DOMAIN] and paid in full by the cardholder. The goods were shipped with yanwen under tracking number UL459406877YP and delivered on 2026-09-15 to the address on the order, which is identical to the billing address registered to the card. No refund or credit has been issued on this order and none appears in our payment records. Our published return policy, linked at checkout before payment is completed, requires the goods to be returned to us before a refund is issued; nothing has been returned. The goods were delivered and remain with the cardholder.

⛔ **Do NOT add a sentence about contact — in either direction.**
`credit_not_processed` turns on whether a refund was promised and withheld, and the
only place that promise could live is the support mailbox `support@beverbutikken.no`
— **which we cannot read.** Measured 2026-09-25: `KUNDTJANST_MAIL_PASS_BEVERBUTIKKEN`
is not in the environment, and Beverbutikken is on Domeneshop, whose webmail this
code has never been tested against. So:

- Never write "the customer never contacted us". Unknown is not zero.
- Before submitting, **someone who can open that mailbox must search it** for `1190`,
  for the customer's address and for the surname, in the inbox *and* in Sent. If a
  colleague promised a refund there, this case is lost the moment the issuer sees it,
  and the honest move is to accept instead.
- Write one line in the Shopify order timeline saying who checked the mailbox and when.

**Risk**

The whole case rests on one scan with no signature and no photo. That is normally
enough — but if support did promise a refund in an unread email, the delivery proof
is beside the point. That is exactly how order #4446 nearly went out with a false
"no contact" claim on 2026-09-22.

**If it fails**

Write off the 338 NOK, do not refund on top of the loss, and fix the cause: get
`KUNDTJANST_MAIL_PASS_BEVERBUTIKKEN` into the environment so the Norwegian mailbox
can be read before the next Norwegian dispute — there will be one.
