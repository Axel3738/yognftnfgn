## Order #5584 - 348 SEK - due 2026-09-23

**Decision: ACCEPT**

**Why**
The parcel has sat at "InfoReceived" since 2026-08-20 — one month with no carrier scan, which means no delivery proof exists and the customer is right that they have nothing. The reason code is `credit_not_processed`, and the only documented ways to overturn it are "refund already issued", "customer isn't entitled to a refund", or "customer withdrew" — none of which is true here, and a chargeback can no longer be refunded away. Fighting means submitting a shipping label with no delivery scan against a customer who is factually correct; measured on this shop, chargebacks stand at 1 win in 4 while every inquiry answered in time was won, so this is where we lose and accepting early costs the same money without burning the VA's week.

**Evidence to attach**
Nothing is submitted to the bank. Clicking **Accept chargeback** closes the case with no evidence form. The list below is the internal record to capture before accepting, so the money is recoverable from the carrier and the root cause is fixed:

1. **17TRACK scan history for the tracking number** — Shopify admin → order #5584 → Fulfillment → copy the tracking number → paste it at 17track.net. Screenshot the full event list showing the last scan dated 2026-08-20 and no movement since. This is the lost-parcel claim, not dispute evidence.
2. **The fulfillment record** — Shopify admin → order #5584 → Timeline: ship date, carrier ({{CARRIER}}), tracking number. Needed for the claim to {{CARRIER}}/the supplier.
3. **The VA's email to the customer** (already sent) — export from the support mailbox and attach it to the order as a note, so the file shows we responded before accepting.
4. **The order timeline note** in section below — paste it into Shopify admin → order #5584 → Timeline → leave a comment, before clicking Accept.

**Cover text to paste into the dispute**

*No text field exists on the Accept path, so this text has two uses: the order timeline note (paste as-is), and the customer email that could still make the customer withdraw the chargeback with their bank before 2026-09-23.*

Timeline note — paste into Shopify admin → order #5584 → Timeline:

```
Chargeback 348 SEK, reason credit_not_processed, filed 2026-09-10, due 2026-09-23. ACCEPTED, not contested. Order was fulfilled and handed to {{CARRIER}} with tracking {{TRACKING_NUMBER}}, but the parcel has shown no carrier scan since 2026-08-20 and was never delivered. No refund had been issued before the chargeback was filed, and a refund is no longer possible once a chargeback has started. The customer's claim is factually correct, so there is no delivery proof to submit and no basis to contest. Lost-parcel claim to be filed with {{CARRIER}}. Accepted by {{AGENT_NAME}} on {{DATE}}.
```

Customer email — send from {{SUPPORT_EMAIL}}:

```
Subject: Your order {{ORDER_NUMBER}} - the parcel never left the carrier

Hi {{CUSTOMER_FIRST_NAME}},

You are right, and I am sorry. We handed your parcel to {{CARRIER}} with tracking {{TRACKING_NUMBER}}, but it has had no scan since 2026-08-20 and it never reached you.

Because your bank has already opened a chargeback, we are not allowed to refund the order ourselves. We have therefore accepted the chargeback, so your bank returns the {{AMOUNT}} to you directly. You do not need to do anything.

If you would still like the product, reply to this email and we will send a new one at no cost.

{{AGENT_NAME}}
{{STORE_NAME}} - {{SUPPORT_EMAIL}}
```

**Risk**
If the parcel is actually delivered after we accept, we lose both the goods and the 348 SEK with no way to reopen the case — a bank decision is final.

**If it fails**
Write off 348 SEK plus the chargeback fee, file a lost-parcel claim with {{CARRIER}}, and fix the cause today: check every order shipped around 2026-08-20 for the same dead tracking (the batch may be lost together), and make "no carrier scan for 7 days" trigger a reship or refund from us before the customer's bank does it for us.
