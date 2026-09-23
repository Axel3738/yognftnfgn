## Order #4446 — 1 262,20 SEK — inquiry — due 2026-09-23

**Decision: FIGHT — medium. The evidence must state, not hide, that the customer
asked for a return on 2026-08-25 and got no answer for 22 days.**

> ⚠️ **This sheet was wrong until 2026-09-22 and the version before it must not be
> used.** It said "no return request, no cancellation request and no contact of any
> kind on record before the dispute", and its cover text said the cardholder "never
> contacted us". That was false. It was written from the Shopify data alone, without
> the mailbox search that `20-NO-CONTACT.md` Step 1 requires — the exact trap Step 4
> describes. Pasting it would have put a false statement in front of the issuer.
> Measured 2026-09-22 with `node kundtjanst/mail.mjs sok "lindqvist" --sidor 40`
> over all 34 pages / 1 687 mails of INBOX and all 13 pages / 626 mails of
> INBOX.Sent.

**What the mailbox actually shows**

| When (UTC) | Who | What |
|---|---|---|
| 2026-08-13 | carrier | Parcel **delivered** (YT2620900704763637) |
| 2026-08-25 13:00 | Fredrik Lindqvist `fredrik.lindqvist74@gmail.com` → {{SUPPORT_EMAIL}}, subject **"Ang order #4446"** | The products are "inte alls av den kvalitet" the pictures showed; he asks us to send a return slip and return instructions, "svara snarast". He writes **"som jag tidigare skrivit"** — he had written before. |
| 2026-08-25 → 2026-09-16 | us | **Nothing. 22 days of silence.** No reply in INBOX.Sent to either address. |
| 2026-09-04 | issuer | Dispute filed, reason `credit_not_processed` |
| 2026-09-16 22:08 | Mechile → `mia.lindqvist73@gmail.com`, subject "order 4446" | Asks him to withdraw the dispute. **Does not answer the return request at all** — no return address, no instructions. No reply since. |

The order email is `mia.lindqvist73@gmail.com`; the complaint came from
`fredrik.lindqvist74@gmail.com`. Same household, different address — which is why
a search on the order's own email address alone finds nothing. **Search the surname
too.** The earlier message he refers to was not found; a header search cannot see
the Shopify contact-form mails (the customer's words sit in the body under `Text:`),
so treat "there was one earlier email" as probable and unverified, and never claim
in writing that there wasn't.

**Why we can still fight this, honestly**

`credit_not_processed` asks one question: was a credit owed and withheld? Our
published policy requires the customer to notify us and **return the goods at their
own cost before a refund is issued** (`returfrakt_betalas_av: kund`). Nothing has
been returned and no refund was ever promised in writing, so no credit has fallen
due. His notice on 2026-08-25 was 12 days after delivery, inside the return window —
so the return itself is still open to him, and the evidence should say we are
honouring it.

What we cannot argue: that he never contacted us, or that we handled it well.

**Do these two things in this order**

1. **Send the return information to `fredrik.lindqvist74@gmail.com` today**, cc
   `mia.lindqvist73@gmail.com`. A draft is waiting in **Drafts** (written
   2026-09-22). It apologises for the silence, gives the return address, says the
   customer pays the return postage, says the parcel must go to the address and not
   to a parcel shop, and does **not** ask him to drop the case. Send it, then save
   it as PDF for the evidence pack.
2. **Then build the evidence** (Shopify admin → Orders → #4446 → dispute panel →
   **Add evidence** → **Save**, never *Submit now* before 2026-09-22 — see
   `START-HERE.md` RULE 3).

**Evidence to attach**

1. **The full email thread as one PDF** — his 2026-08-25 mail, our 2026-09-16 mail,
   and today's reply with the return address. This is required, not optional. Assume
   the issuer already has his copy of the 2026-08-25 email.
2. **Delivery proof** — the DELIVERED scan of 2026-08-13 with location
   (`node kundtjanst/tvistfakta.mjs 4446 --brand baverbutiken`, or 17track.net).
   ⚠️ Never run `node sparning/kor.mjs --dagar 90` to check an old order.
3. **Refund and return policy** — the full page at {{POLICY_URL}}, legible at 12pt.
4. **Policy disclosure** — the policy link as it appears at checkout, before payment.
5. **Refund history** — the order page showing Paid, zero refunds, and no return
   received.
6. **Address match** — shipping address identical to billing address.

**Cover text to paste into the dispute**

Order {{ORDER_NUMBER}} was placed on {{ORDER_DATE}} at {{STORE_DOMAIN}} and paid in full by the cardholder. The goods were shipped with {{CARRIER}} under tracking number {{TRACKING_NUMBER}} and delivered on 2026-08-13 to the address on the order, which is identical to the billing address registered to the card. On 2026-08-25 the customer emailed {{SUPPORT_EMAIL}} to say the products were not of the quality shown in our photographs and to ask for return instructions. We did not answer that email until 2026-09-16, and that reply did not contain the return information he had asked for. We regret the delay and we are not disputing it. Our published return policy, available at {{POLICY_URL}} and linked at checkout before payment is completed, requires the customer to return the goods to {{RETURN_ADDRESS}} at their own cost before a refund is issued. No goods have been returned to us, no refund was at any point promised in writing, and no credit has therefore fallen due. On {{DATE}} we emailed the customer the full return instructions and the return address, and we will refund the order in full as soon as the goods reach us. The charge covers goods that were delivered and are still in the cardholder's possession.

**Risk**

He says he wrote before 2026-08-25 and we have not found that message. If the issuer
attaches it and it shows an even earlier unanswered return request, the delay looks
worse — but the argument above does not depend on the delay, only on the goods never
having been returned, so it still stands. The real risk is the reverse: any sentence
claiming no contact would collapse the whole submission.

**If it fails**

Write off the 1 262,20 SEK, do not refund on top of the loss, and honour the return
if the goods still arrive. Root cause is not this dispute: it is a support mailbox
where a return request can sit unanswered for 22 days. That is what
`50-PREVENTION.md` and the daily `INBOX.VA-PRIO` routine exist for.
