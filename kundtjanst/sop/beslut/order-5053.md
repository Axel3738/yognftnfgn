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

**Timing for the VA:** add the evidence and click **Save** today, on both disputes. If the customer replies to the 2026-09-20 email, add the reply first. Then click **Submit now**.

> ⛔ **BOTH DISPUTES ESCALATED TO CHARGEBACK — measured 2026-10-01. This is open
> work again, and the evidence did NOT carry over.**
> Same two dispute ids (`17773822301`, 348 SEK and `17773723997`, 255 SEK), same
> order, but `type` is now **chargeback**, `status` is back to
> **`needs_response`**, `evidence_sent_on` is **null** again, and the deadline is
> new: **2026-10-12T01:00:00+02:00** — so the window shuts as Sunday 11 October
> ends, and **Friday 9 October is the last working day.**
>
> **What this means in practice:** winning the inquiry stage does not end a
> dispute, and an escalation wipes the evidence field. The pack above must be
> **submitted again** on the chargeback — same delivery scan of 2026-09-11, same
> cover text, same two disputes separately. Money is already taken now, so this
> is the stage where it is actually lost: chargebacks in this shop stand at 1 won
> of 4, while inquiries stand at 29 of 29.
> ⚠️ Re-run the surname search before submitting (point 5) — the customer may
> have written since 2026-09-20, and a reply changes the "no prior contact"
> sentence from an argument into a false statement.
>
> ✅ **The inquiry stage was answered — measured 2026-09-28.** Both disputes were
> `under_review`:
> `17773822301` had its evidence sent at **07:10:14** and `17773723997` at
> **07:41:42** that morning. The sheet then said "nothing more to do here; watch
> for an escalation the way #5122 and #4446 both did" — the escalation came three
> days later, and the block above is what to do about it. **Never write "nothing
> more to do" on an answered dispute again; write what to watch for and what it
> would cost.**
>
> ⛔ **But they went in six hours LATE, and the reason is written down here.**
> The real deadline was `2026-09-28T01:00:00+02:00` — **one o'clock at night**,
> not "some time on Monday". This sheet said "submit on Monday", the daily alarm
> said "due 2026-09-28 — 1 day left", and both were reading a date where Shopify
> had written a timestamp. Shopify accepted the late evidence anyway; that is
> the bank's goodwill, not a rule to lean on — **but lean on it rather than give
> up: #4914 went in 8.5 hours late on 2026-09-30 and was accepted too, so a
> passed deadline is always still worth a submission.** Fixed the same day: the alarm now
> prints "due 2026-09-28 at 01:00 — 19h left". **On any dispute, read the
> clock time in `evidence_due_by`, not just the day.**

> ⛔ **The planned submit date had already passed — measured 2026-09-27.** Both disputes
> (`17773822301`, 348 SEK, and `17773723997`, 255 SEK) are still `needs_response`.
> Nothing has been submitted. The instruction above used to say "submit on
> 2026-09-26", and that day is gone. **Submit both today, Sunday 2026-09-27.**
> The deadline 2026-09-28 has no exceptions and **Submit now** locks the evidence
> permanently, so there is no reason left to wait: the delivery scan of 2026-09-11
> already exists, which was the only thing waiting was ever buying us.
> ⚠️ If nothing is submitted, Shopify sends whatever it has on the due date by
> itself. That auto-submission is not our evidence pack — it has no delivery
> screenshot, no email thread and no cover text, and the SOP's "inquiries are
> always won" record was built on packs a human put together.
