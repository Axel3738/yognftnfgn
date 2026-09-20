## Order #4446 — 1 262,20 SEK — due 2026-09-23

**Decision: FIGHT**

**Why**
The carrier confirms the package was delivered on 2026-08-13, three weeks before the dispute was filed on 2026-09-04, to an address that matches the card's billing address. The reason code is `credit_not_processed` — "the customer informed you of a return or cancellation, but you haven't refunded them" — yet there is no return request, no cancellation request and no contact of any kind on record before the dispute, and nothing has been returned to us. This is still an inquiry, so no money has been taken and no fee has been charged; on this shop every inquiry that was answered with evidence has been won (29 of 29 decided), so the only way to lose 1 262,20 SEK here is to let the deadline pass.

**Evidence to attach**
Path: Shopify admin → **Orders** → order #4446 → chargeback banner → **Add evidence**. Attach one file per evidence type, PDF/JPEG/PNG, max 2 MB per file and 4 MB combined, portrait, high contrast (issuers often receive these by fax).

1. **Delivery proof.** Copy the tracking number from the order's Fulfilled section, paste it on 17track.net, screenshot the timeline showing the **DELIVERED scan on 2026-08-13** with location. The number is older than the tracking routine's 14-day window, so 17TRACK will register it first — that is an expected step, not an error. ⚠️ Do **not** run `node sparning/kor.mjs --dagar 90` to check this: a sharp run writes fulfillment events into Shopify and would fire "delivered" emails to hundreds of old orders.
2. **Fulfillment record** (carrier, tracking number, ship date/time) — from the order timeline in Shopify admin. Shopify auto-populates this field; verify it is filled and correct rather than retyping it.
3. **Refund and return policy** — screenshot or PDF of the full policy page at {{POLICY_URL}}, text legible at 12pt or larger.
4. **Policy disclosure** — screenshot showing the policy link as it appears at checkout, i.e. visible to the customer *before* payment.
5. **Refund history** — screenshot of the order page showing status Paid, **zero refunds**, and a timeline with no return or cancellation entry. This is what proves no credit was ever owed or withheld.
6. **Address match** — the order page showing shipping address identical to billing address.
7. **Customer communication — only if the customer replies.** We emailed them on 2026-09-20; if a reply arrives before you submit, export the full thread as one PDF and attach it. If no reply comes, attach nothing here and let the cover text state the absence of contact — that is the documented handling, not a gap.

After pasting the cover text, click **Save**. Do **not** click *Submit now* before **2026-09-22** — early submission locks the evidence and we would lose the chance to add a reply to our 2026-09-20 email. If nothing has changed by 2026-09-22, click **Submit now** rather than trusting the automatic send on the due date.

**Cover text to paste into the dispute**

Order {{ORDER_NUMBER}} was placed on {{ORDER_DATE}} at {{STORE_DOMAIN}} and paid in full by the cardholder. The goods were shipped with {{CARRIER}} under tracking number {{TRACKING_NUMBER}} and delivered on 2026-08-13 to the address on the order, which is identical to the billing address registered to the card. The cardholder never contacted {{STORE_NAME}} about this order before the dispute was filed on 2026-09-04: there is no return request, no cancellation request and no complaint at {{SUPPORT_EMAIL}}, our only customer service channel. No merchandise has been returned to us, and no refund or credit was ever requested, so none was owed and none was withheld. Our published return policy, available at {{POLICY_URL}} and linked on the checkout page before payment is completed, requires the customer to notify us within {{RETURN_WINDOW_DAYS}} days and to return the item to {{RETURN_ADDRESS}} before a refund is issued; neither step was taken at any point. On 2026-09-20 we contacted the cardholder at {{CUSTOMER_EMAIL}} to offer a return under that policy, and we will honour it if the goods are returned to us. The product was delivered, kept, and never returned, so the charge is valid and no credit is due.

**Risk**
If the cardholder can show an email to us that we never answered — we currently have a backlog of unanswered support mail — the "no prior contact" argument collapses and this becomes exactly the case `credit_not_processed` is written for; the issuer decides, and delivery proof is weaker evidence on this reason code than it is on "product not received".

**If it fails**
Write off the 1 262,20 SEK plus the chargeback fee, do not refund or reship on top of the loss, flag the customer for no further orders, and fix the root cause by searching the support inbox for this customer's address *before* the next dispute is answered so the "no contact" claim is always verified rather than assumed.
