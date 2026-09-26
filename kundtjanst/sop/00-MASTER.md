# SOP-00 — MASTER: a dispute lands, what happens in the first hour

**Use this when:** any chargeback or inquiry appears for your store — from the daily Discord alarm, a Shopify email, or the admin — and you need to know what to do *right now*.

**Owner:** the customer-support VA for the store. **Frequency:** every working day. **Time:** 5–15 min per dispute.

**Portability:** this file is identical on every store. Everything store-specific is a `{{PLACEHOLDER}}` filled from one config block (section 13). If you find a brand name, a domain or an email address in the procedure text, it is a bug — report it.

---

## THE ONE RULE THAT COMES BEFORE EVERYTHING

> **Is the reason "product not received"? READ THE TRACKING BEFORE YOU WRITE ANYTHING.**
> Delivery scan with a date → **FIGHT**. Stuck, no scan, or no tracking number → **do not fight. Refund (inquiry) or accept (chargeback).**

A delivery scan is the strongest evidence we have — it is what makes the hour worth spending. It is **not** a guarantee of winning: of the chargebacks decided so far on one store we won 1 of 4 (measured 2026-09-20, 50 disputes). Never tell the owner or the customer that a fight is won.

*Measured 2026-09-20, one store, twelve disputed orders: eleven parcels had a delivery scan; one (#5584) was stuck at `InfoReceived` and never delivered — that is the one we cannot win. All twelve tracking numbers had to be registered with 17TRACK before they could be read (see section 6).*

---

## 1. The decision table — 2 minutes, then act

Read the reason code in Shopify, check column 2, take the decision in column 3. The reason codes are exactly these eight (source: `kundtjanst/shopify.mjs`, field `reason`).

| Reason code | Check this FIRST (2 min) | Decision |
|---|---|---|
| `product_not_received` | **Tracking.** Is there a delivery scan with a date? | Scan → **FIGHT (strong)**. Stuck / no scan / no tracking → **REFUND or ACCEPT** |
| `product_unacceptable` | Delivered? Any refund already paid? Did we answer the customer and offer a return or replacement? | Already refunded in full → **FIGHT (strong)**. Delivered + return address sent + nothing returned → **FIGHT (weak — weakest category we have)**. Delivered but the item was faulty and we never fixed it, or we never answered → **REFUND or ACCEPT**. Not delivered → **REFUND or ACCEPT** |
| `credit_not_processed` | **Has a refund actually been paid on this order?** (Order page → Refunds.) Is there a delivery scan? | Refund already paid → **FIGHT (strong)** — but check the amount matches; a *partial* refund may mean they dispute the rest. No refund owed under {{POLICY_URL}} + delivered → **FIGHT (strong)**. No refund paid and no delivery scan → **REFUND or ACCEPT** |
| `product_unacceptable` / `credit_not_processed` where the customer asked to cancel | Did they ask before or after we shipped? When does our {{RETURN_WINDOW_DAYS}}-day window start? | Asked before shipping and we shipped anyway → **REFUND**. Asked after shipping → **send {{RETURN_ADDRESS}}, Template C**, and refund on return. See worked example 3 |
| `fraudulent` | Does the **billing** address match the **shipping** address on the order page? | Addresses differ → **REFUND / ACCEPT and block the customer**. Addresses match → **FIGHT**: the cardholder's own address received the goods |
| `unrecognized` | Same address check, plus: what does the card statement say? ({{BILLING_DESCRIPTOR}}) | **Email the customer first (Template A)** — only they can withdraw it. Addresses match → **FIGHT** while you wait. Addresses differ → **REFUND / ACCEPT** |
| `duplicate` | Find **both** charges. Two order numbers, or one order charged twice? | Genuinely charged twice for one order → **refund the duplicate today, do not fight**. Two real orders → **FIGHT** with both order confirmations. Cannot tell within 10 min → **ESCALATE** |
| `subscription_canceled` | Should not exist on a one-off physical order. | **ESCALATE** to {{OWNER_CONTACT}}. If the deadline is inside 48 h, submit the standard pack (section 8) first, then ask |
| `general` or a reason not in this table | Read the claim text. Is there a delivery scan? | Scan → **FIGHT (medium)** with the standard pack. No scan → **ESCALATE** |
| **No tracking number on the order at all** (any reason code) | — | **Do not fight. ESCALATE** — there is nothing to prove and fulfilment is broken; the owner must see it |

**The same verdict in one command:** `node kundtjanst/tvistfakta.mjs <ORDER NUMBER> --brand {{STORE_ID}}` prints the decision (FIGHT / REFUND / ESCALATE), the case strength, why, the evidence list and the order facts — in English, read-only, nothing is changed. Use it if you have terminal access; use this table if you do not. If the tool and this table disagree, **write down both** and ask {{OWNER_CONTACT}} — do not silently pick one.

---

## 2. Three checks that stop the clock — 60 seconds

| What you see | What it means | What you do |
|---|---|---|
| Dispute status is **`under_review`** | Evidence has already been submitted. | **Nothing.** Do not resubmit, do not promise anything new. Wait for the bank. Say so in the team thread so it stops coming back on the list |
| Status is **`won`**, **`lost`**, **`accepted`** or **`charge_refunded`** | The case is closed. A decision is final; there is no appeal. | **Nothing.** Note the outcome in the thread |
| Status is **`needs_response`** | It is live and the clock is running. | Continue with section 1 |
| **The order is not in this store's admin** | It is another brand's dispute. | Run `node kundtjanst/tvistfakta.mjs <ORDER> --brand <other store id>` for each store you support (`node kundtjanst/run.mjs --kolla` lists the store ids), or open each admin and search the order number. Found it → handle it there. Not found anywhere → **escalate to {{OWNER_CONTACT}} with the order number and the dispute amount.** Never guess *(example: order #4825 — "what store? no record of chargeback")* |
| **Due date is today** | Still winnable. | Do it **now**, first in the queue. *"Due today" is not "too late" — measured 2026-09-16: #4914 was treated as passed on its due date and skipped* |
| **Due date has passed** | Evidence can no longer be submitted. | Do not build evidence. In the thread: order number, amount, "past due date, not submitted". Then check whether the customer is still owed something and answer them anyway (Template A) so it does not repeat. Tell {{OWNER_CONTACT}} once per week how many went past due |

---

## 3. Inquiry vs chargeback — this changes what you can still do

| | **Inquiry** | **Chargeback** |
|---|---|---|
| Money | Not taken yet | **Already taken from us, plus a fee** |
| Can we refund to end it? | **Yes.** Shopify Help Center: *"If you issue a full refund, then the cardholder can't initiate a chargeback."* | **No.** Shopify Help Center: *"You can't issue a refund after a cardholder initiates a chargeback."* |
| If we ignore it | It is not lost on the spot — but it can escalate into a chargeback. Measured: three unanswered inquiries escalated (#4914, #5044, #4706) | The loss becomes final |
| Measured outcome (one store, **66 disputes, 2026-09-26**) | **39 of 39 decided inquiries won** | **3 won of 7 decided** (was 1 of 4 on 2026-09-20) |

⚠️ **"Inquiries are never lost" is partly true by construction — do not lean on it.**
When an inquiry escalates, Shopify does not add a second row: **the same dispute
changes type in place**, keeping its id and its filing date. It therefore leaves the
inquiry column entirely, and the losses land under *chargeback*. So the perfect
inquiry record cannot show an escalation even when one happens.
**Measured on this store in one week: two answered inquiries escalated anyway** —
**#5122** (2026-09-23, evidence was already in and the window was locked;
`product_unacceptable`, new deadline 2026-10-05) and **#4446** (2026-09-26;
`credit_not_processed`, 1 262,20 SEK, new deadline 2026-10-07). Answering an inquiry
is still the right move and still cheap — but it is not a guarantee, and the number
above is a record of what stayed an inquiry, never a forecast.

**So:** an inquiry is cheap to win and cheap to end. A chargeback is where the money actually goes. That is why the daily alarm sorts chargebacks to the top even when an inquiry expires sooner (`bradskande` in `kundtjanst/tvistkoll.mjs`).

> ⛔ **Never refund an order that already has an open chargeback.** The money is gone twice: once to the bank, once to the customer. If a refund was issued *before* the chargeback arrived, that is not a mistake — it is your best evidence. Say it plainly and attach the refund receipt.

---

## 4. The deadline rule

Every dispute has an **evidence due date** (`evidence_due_by` in Shopify, shown on the dispute in the admin and printed by `tvistfakta.mjs`).

- **Read the date. Never count days yourself.** Shopify states the window is *"7 to 21 days after the chargeback or inquiry is filed"* — that is a range, not a rule you can apply to a specific case.
- Shopify: *"After the submission deadline has passed, you can't submit any further evidence"* — *"There are no exceptions to this."*
- Shopify: *"After a chargeback decision is made by the bank, that decision is final. You can't appeal a chargeback decision or submit additional evidence after a decision has been made."*
- With Shopify Payments a basic auto-response (product details, carrier, tracking, fulfillment date, addresses, order date, IP) is sent on the due date even if you add nothing. **That is not a defence.** It contains nothing you know: no delivery scan read out in words, no email thread, no policy, no explanation.
- **VERIFY IN SHOPIFY ADMIN:** the cut-off *time* on the due date is not documented — only the date is shown. Treat the due date as "finished the working day before".

**A missed deadline is the only failure in this process that cannot be repaired afterwards.** That is why these SOPs exist.

- **Do not** wait for the customer's reply before submitting. Email *and* build the evidence in parallel.

> ## ⏳ SUBMIT LAST. SAVE TODAY, SEND ON THE DUE DATE.
>
> **Never click "Submit now".** Shopify: *"After you click Submit now to submit
> your response early, you can't make any further edits."* Use **Save** instead
> — Shopify sends your response automatically on the due date, and you can keep
> editing until then.
>
> **Why this wins cases:** for *"product not received"* the evidence gets better
> while you wait. A parcel takes about 10 days to arrive; the evidence window is
> up to 21 days. A dispute that has **no delivery scan today usually has one by
> the due date.** Submit on day 1 and you submit your own weakness. Save on day
> 1, let it send on day 20, and you submit the scan.
> *(The owner's own practice, written into this SOP 2026-09-22. It matches our
> outcome data: 29 of 29 decided inquiries won.)*
>
> **So, for every dispute: build the evidence TODAY, press Save, and set a
> reminder to re-check the tracking one day before the due date.** If the scan
> arrived, add it. If the parcel is still stuck, switch to refund/accept before
> the date passes.
>
> **Three things this rule does NOT excuse:**
> 1. **The customer email never waits.** Send it today. A customer who gets an
>    answer often withdraws the dispute, and then no evidence is needed at all.
> 2. **A stuck parcel does not get better with time.** `InfoReceived`,
>    `NotFound`, `Expired`, `Undelivered` → refund (inquiry) or accept
>    (chargeback) now. Waiting only lets an inquiry escalate into a chargeback.
> 3. **Evidence that is already complete does not wait.** A refund receipt, an
>    address match or a delivered scan is as strong today as in two weeks —
>    save it, and stop thinking about it.
>
> `tvistfakta.mjs` says this by itself: it returns **⏳ WAIT** with a
> *"Submit no later than"* date when the parcel is still moving and there is
> time left, instead of telling you to refund a parcel that simply has not
> arrived yet.

### If the deadline is within 48 hours — in this order

1. **Read the facts.** `node kundtjanst/tvistfakta.mjs <ORDER> --brand {{STORE_ID}}`, or the browser route in section 6. (5 min)
2. **Decide FIGHT / REFUND / ESCALATE** from section 1. Ten minutes maximum. A perfect decision the day after the deadline is worth nothing.
3. **If REFUND or ACCEPT:** inquiry → issue the full refund; chargeback → accept it. Email the customer (Template B). Stop here.
4. **If FIGHT:** write the evidence statement (section 8) and attach the proof today, then **Save**. Not tomorrow morning.
5. **Email the customer the same day** (Template A). Only the customer can make the bank withdraw the case.
6. **Post one line in {{ESCALATION_CHANNEL}}** so nobody redoes it: `#[ORDER] — chargeback, not received, delivered [DATE], evidence saved, due [DATE].`

---

## 5. Fight or accept — say the decision out loud before you type anything

Accepting is not an admission and it is not a failure. Shopify: *"If you agree that a chargeback is valid, then you can accept the chargeback without submitting evidence."* The disputed amount goes back to the customer and we do not get the fee back — but we also do not spend an hour losing.

**REFUND (inquiry) or ACCEPT (chargeback) when:**
- The parcel has no delivery scan — stuck, `NotFound`, or no tracking number.
- The item genuinely arrived broken, faulty or wrong and we never replaced or refunded it.
- The customer wrote to us and we never answered.
- The customer is owed a refund under {{POLICY_URL}} and has not received it.
- The amount is at or below **{{FIGHT_THRESHOLD}} {{CURRENCY}}** (`tvister.strid_lonar_sig_over`; `0` means "always fight") and the evidence is thin. Your hour is worth more than a thin case — but never skip a case that is *strong*, whatever the amount.
- Billing and shipping addresses do not match on a `fraudulent` claim. Accept, refund, block the customer.

**FIGHT when:**
- There is a delivery scan with a date, **or**
- A refund we already paid is being claimed again, **or**
- No refund is owed under the policy the customer accepted at checkout and the goods were delivered, **or**
- The product was accurately described, we sent {{RETURN_ADDRESS}}, and nothing came back.

### Worked examples (real cases, dates as they were read on 2026-09-20 — examples, never the rule)

1. **#6349 — `product_unacceptable`, FIGHT (weak).** Delivered, then the customer decided they did not want it because the product is made in China; support sent the return address. The product page never claimed otherwise and a return was offered. Evidence: the product page as it looked at purchase, the delivery scan, the email where we sent {{RETURN_ADDRESS}}, and one line that no return has arrived.
2. **#4446 — `credit_not_processed`, FIGHT (strong).** Delivered, **no refund has ever been issued**, and the customer never wrote to us before filing. There is nothing to "process": no return requested, no cancellation made. Evidence: the refund history showing zero refunds, the policy at {{POLICY_URL}} and how it was shown before purchase, the delivery scan, and the "no conversation" sentence from section 8. *(This is the answer for #5053 and #5418 too — no conversation is not a weakness.)*
3. **#5435 — cancellation asked for after shipping, `credit_not_processed`.** The customer asked to cancel 13 days after the order confirmation; support could not cancel because it had already shipped. **VERIFY WITH {{OWNER_CONTACT}}: whether our {{RETURN_WINDOW_DAYS}}-day window starts at the order date or at delivery** — it decides who is right here, and it is a legal question, not a VA decision. Meanwhile: send Template C with {{RETURN_ADDRESS}}, and if this is an *inquiry* under {{REFUND_APPROVAL_LIMIT}} {{CURRENCY}}, refunding is faster and cheaper than arguing.
4. **#5763 — `product_not_received` but the parcel was delivered and the missing part was inside the set.** Do not refund reflexively and do not leave the email "on hold". Answer it (Template D) with the product page line that lists what is included, and attach that page plus the delivery scan to the evidence.
5. **#5044 — `product_unacceptable`, REFUND/ACCEPT.** The button broke on first use; we could not send a replacement because the customer never confirmed, and the case sat still. The item was faulty and we did not fix it. Refund it (inquiry) or accept it (chargeback), and send {{RETURN_ADDRESS}} only if the owner wants the item back.
6. **#4706 — no conversation, but the customer left a public product review complaining about the item.** A review proves they received it and had it in their hands. Screenshot it (name masked) and attach it — this is the best evidence there is against "never received".
7. **#5122 — we missed the customer's email about damaged straps.** He asked to return; we did not answer in time. If nothing has been submitted yet this is a **REFUND/ACCEPT**, not a fight — being ignored is exactly what banks decide against us. If the dispute already shows `under_review`, section 2 applies: leave it alone.
8. **#5584 — real chargeback, parcel stuck at `InfoReceived`, never delivered.** The carrier got the label and never got the parcel. There is no delivery proof to submit and the money is already gone. Fighting costs an hour and wins nothing: accept it, and report the parcel to {{OWNER_CONTACT}} as a carrier loss.

---

## 6. How to read the tracking

**Fast route (read-only, one command):**
```
node kundtjanst/tvistfakta.mjs <ORDER NUMBER> --brand {{STORE_ID}}
node kundtjanst/tvistfakta.mjs <ORDER NUMBER> --brand {{STORE_ID}} --registrera   # only if it says the number is not registered
node kundtjanst/tvistfakta.mjs --alla --brand {{STORE_ID}}                        # every open dispute, short
```
⚠️ **Always pass `--brand {{STORE_ID}}`.** Without it the tool defaults to one specific store and you will read the wrong shop's orders. `--registrera` spends 17TRACK quota, so use it only on a number that failed to read.

**Store tracking page route (no terminal, no quota — stores that have `{{TRACKING_PAGE}}`):**
1. Shopify admin → **Orders** → open the order → the **Fulfillment** card. On these stores the hourly tracking routine writes every carrier scan into the order's timeline ("Out for delivery", "Delivered" …), so the latest status is already on the order page. Copy the tracking number.
2. Open `{{TRACKING_PAGE}}` and paste the tracking number (the page takes the carrier number as well as the store parcel number `{{PARCEL_PREFIX}}…`). It shows the whole chain with city and time — the same view the customer sees — and the store parcel number to quote back.
3. Write down exactly three things: **status**, **date**, **location**. Those three words are your evidence sentence.
4. "We can't find that number": the page refreshes once an hour, keeps 60 days, and is not registered for parcels older than the routine's 14-day window. For a parcel older than that, use the 17TRACK route below — that is the normal case for a dispute.

**Browser route (any store, works with no terminal access):**
1. Shopify admin → **Orders** → open the order → the **Fulfillment** card → copy the tracking number.
2. Open `17track.net`, paste the number, read the latest status.
3. Write down exactly three things: **status**, **date**, **location**. Those three words are your evidence sentence.

> **Two numbers, two audiences.** The bank gets the **carrier** tracking number and a 17TRACK / carrier screenshot. The **customer** gets the store parcel number (`{{PARCEL_PREFIX}}` + 8 characters, printed under the button in every shipping email and on `{{TRACKING_PAGE}}`) and the link `{{TRACKING_PAGE}}?nummer={{PARCEL_NUMBER}}` — never the raw carrier number. Stores without a tracking page keep sending the 17TRACK link.

| What you see | What it means | What we do |
|---|---|---|
| `Delivered` + date | We can prove delivery | **FIGHT** |
| `OutForDelivery` / `InTransit` with recent scans | Still moving | Save the evidence now, add the delivery scan before the due date |
| `InfoReceived` only, and old | The carrier got the label but never the parcel. **We cannot prove delivery.** | **Do not fight.** Refund (inquiry) or accept (chargeback) |
| `Exception` / `DeliveryFailure` / `Undelivered` | Delivery failed | **Do not fight** unless a later scan shows delivered |
| `NotFound` / `Expired` / no tracking number | Nothing to prove | **Do not fight. ESCALATE** — fulfilment is broken |

*(Status names are 17TRACK's own, as mapped in `sparning/status.mjs`.)*

**Old numbers must be registered first.** A number our tracking routine has not seen for ~14 days answers *"does not register, please register first"*. That is normal, not a bug — measured 2026-09-20: **all twelve** disputed orders on one store needed registering. Fix it with `--registrera`, or by pasting the number on 17track.net, which registers it for you. If registration needs panel access you do not have, ask {{OWNER_CONTACT}}.

> ⛔ **Never run `node sparning/kor.mjs` to check a dispute.** A live run writes fulfillment events into Shopify, and `OUT_FOR_DELIVERY` / `DELIVERED` events send customer emails — checking one old order that way would email hundreds of customers "your parcel was delivered" months late. `tvistfakta.mjs` is read-only against Shopify and safe. *(VAs do not run repo commands at all unless the owner set that up.)*

---

## 7. The six steps, from "dispute appears" to "closed"

1. **See it.** The `/tvistkoll` alarm posts every morning in Discord {{ESCALATION_CHANNEL}} and lists every open dispute with evidence due within 3 days, chargebacks first. Also findable any time: **Orders** → **Search and filter** → **Add filter** → **Chargeback and inquiry status** → **Open**. *(VERIFY IN SHOPIFY ADMIN: Shopify also lists disputes under Settings → Payments → Disputes; label wording changes between versions — use whichever you see.)*
2. **Gather the four facts** (10 min max, or one `tvistfakta.mjs` run): tracking status + date · refunds already issued on this order · the full email thread with this customer (search the inbox for the order number *and* the customer's email address) · the amount and the due date.
3. **Decide** using section 1, and say it in one sentence: *"Delivered [DATE] with a scan, customer never contacted us — fight."*
4. **Email the customer** (Template A–D). Every reason code benefits from this; on `unrecognized` and `general` it is the *main* move. Shopify: *"If your customer has agreed that the chargeback was a mistake, then only your customer can reverse it."*
5. **Submit evidence** (if fighting): Orders → the order → the chargeback/inquiry banner → **Add evidence** → fill the fields → **Save** (or **Submit now** only when finished).
6. **Close the loop.** One line in {{ESCALATION_CHANNEL}}; when the bank decides, note won/lost there too. A decision is final; there is no appeal.

**Never contact the bank yourself, and never promise the customer a date.** Shopify's own pages state the bank's review time as 30–90 days, 65–75 days, up to 75 days and up to 120 days in different places. Say "your bank decides, and it can take weeks".

---

## 8. The evidence pack — and the text to paste

**What goes in, every reason code:**
- **The delivery facts in plain sentences:** carrier, tracking number, ship date, delivery date, location.
- **The conversation — or its absence.** Stripe's documented guidance: *"Whether or not the customer attempted to resolve the issue with you prior to filing a dispute. If they didn't reach out to you before the dispute, state that clearly."*
- **The order confirmation** (customer, items, amount, date) and **the policy page the customer accepted at checkout** ({{POLICY_URL}}).
- **Refund receipts**, if any refund was paid on this order.
- **A public review or any message from the customer about the item** — it proves possession. Mask the customer's name and email; the order number is the key.
- **Only what is relevant.** Stripe: *"providing evidence about your clearly stated return policy isn't relevant for a dispute claiming that the customer never received the product."* Too much material hides the argument.
- **File format limits (Shopify, verbatim):** "PDF, JPEG, or PNG"; 2 MB per file; 4 MB combined; PDFs "fewer than 50 pages"; images must be "cropped appropriately, are high contrast, and are legible". Shopify notes many banks receive evidence by fax — make screenshots readable in black and white.
- **VERIFY IN SHOPIFY ADMIN:** the exact field labels on the evidence form (Orders → the disputed order → **Add evidence**). Shopify redesigned this form and does not publish the labels. The underlying fields are `shipping_documentation`, `customer_communication`, `refund_policy_disclosure`, `product_description`, `uncategorized_text`. Match them to what you see; if a field is missing, put the text in the free-text / uncategorised box. **Write the real labels into this file the first time you see them.**

### Evidence statement — copy, paste, fill the brackets

> Order [ORDER NUMBER] was placed on [ORDER DATE] by the cardholder and paid in full ([AMOUNT] {{CURRENCY}}).
>
> The order was shipped on [SHIP DATE] with [CARRIER], tracking number [TRACKING NUMBER], to the address given on the order: [CITY], [COUNTRY]. The carrier's own tracking shows the status "[STATUS]" on [DATE][ in LOCATION]. The delivery address matches the billing address on the card. *(Delete the last sentence if it does not.)*
>
> [CHOOSE ONE:]
> — The customer never contacted us before filing this dispute. Our support address {{SUPPORT_EMAIL}} is published at {{STORE_DOMAIN}} and is answered every working day.
> — The customer contacted us on [DATE]. We replied on [DATE] and offered [a replacement / a return to {{RETURN_ADDRESS}} / a full refund]. The full email exchange is attached. As of today, [no return has been received / the customer has not replied].
>
> [IF A REFUND WAS PAID:] A refund of [AMOUNT] {{CURRENCY}} was issued on [DATE] and the receipt is attached. The amount claimed in this dispute has already been returned to the cardholder.
>
> [IF THE ITEM WAS DESCRIBED ACCURATELY:] The product page the customer bought from is attached. It states [the exact claim in question] and the item delivered matches that description.
>
> Our return and refund policy, which the customer accepted at checkout, is published at {{POLICY_URL}} and is attached. The order was delivered as agreed and no refund is owed under that policy.
>
> Attachments: [1] carrier tracking printout, [2] order confirmation, [3] email thread or statement that there was none, [4] policy page, [5] refund receipt if any.

---

## 9. Two disputes on one order

One order can carry more than one dispute, each with its own amount and its own due date. *(Example: order #5053 carried two separate `product_not_received` disputes, with different amounts, both due 2026-09-28.)*

Handle them as two cases: same facts, two submissions, two due dates. If the amounts together exceed what the customer actually paid for the missing items, say so in the evidence — Stripe lists "the dispute amount exceeds the value of the undelivered portion" as a documented counter-argument.

---

## 10. Escalation — what you decide, what the owner decides

| You decide, no approval needed | Ask the owner ({{OWNER_CONTACT}}) |
|---|---|
| Submitting evidence on any dispute | Any refund or accepted dispute above {{REFUND_APPROVAL_LIMIT}} {{CURRENCY}} |
| Accepting a chargeback at or below {{REFUND_APPROVAL_LIMIT}} {{CURRENCY}} | A dispute whose order is in no store's admin (wrong brand / unknown) |
| Refunding an inquiry at or below {{REFUND_APPROVAL_LIMIT}} {{CURRENCY}} | An order with no tracking number at all (fulfilment is broken) |
| Sending {{RETURN_ADDRESS}} and handling a return | Three or more parcels from the same carrier stuck without scans in one week |
| Emailing the customer and asking them to withdraw | Any change to the policy text or the {{RETURN_WINDOW_DAYS}}-day window, and **when that window starts** |
| Registering a tracking number to read it | `subscription_canceled`, `duplicate` you cannot resolve, or a reason not in the table |
| Blocking a customer after a confirmed-fraud accept | Any dispute where the decision table and `tvistfakta.mjs` disagree |

Never escalate by staying silent. If you are waiting for the owner and the due date is inside 48 hours, **submit what you have first**, then ask. You can keep editing until the due date; you can never edit after it.

---

## 11. Email templates

`{{...}}` = store config (section 13). `[...]` = fill in per case. Send from {{SUPPORT_EMAIL}}. Never send a customer to the manufacturer or supplier — Stripe's documented rule: *"Never refer cardholders to the manufacturer in lieu of attempting to resolve the issue directly — the business selling the product or service is liable and must be the point of contact for resolution."*

### Template A — a dispute is open and we have never spoken to this customer

> **Subject:** About your order [ORDER NUMBER] — we want to sort this out directly
>
> Hi [FIRST NAME],
>
> Your bank has contacted us about the payment for order [ORDER NUMBER], placed on [ORDER DATE]. I am sorry that something went wrong — I would much rather fix it for you myself than have you wait for a bank process.
>
> Here is what I can see on our side: the order was shipped on [SHIP DATE] with [CARRIER], tracking number [TRACKING NUMBER], and the carrier's last update is "[STATUS]" on [DATE][, in LOCATION].
>
> Could you tell me what happened from your side? If the parcel never arrived, or it arrived damaged, or it is simply not what you expected, reply to this email and I will make it right — a replacement, a return, or a refund, whichever you prefer.
>
> If you have already sorted this out with your bank, or the case was opened by mistake, please contact them and ask them to withdraw it. Only you can do that, and it saves us both a lot of waiting.
>
> I read every reply personally.
>
> [YOUR NAME]
> Customer Support, {{STORE_NAME}}
> {{SUPPORT_EMAIL}}

### Template B — we have refunded (or are refunding) and want the case withdrawn

> **Subject:** Refund for order [ORDER NUMBER] — please ask your bank to close the case
>
> Hi [FIRST NAME],
>
> I have issued a full refund of [AMOUNT] {{CURRENCY}} for order [ORDER NUMBER] today, [DATE]. It goes back to the card you paid with, and your bank normally shows it within a few working days.
>
> Because you also opened a case with your bank about this payment, could you contact them and let them know it is resolved, and ask them to withdraw it? Only you can do that — we cannot close it from our side, and if it stays open the payment can end up being taken twice.
>
> Thank you for telling us. If there is anything else about this order, just reply here.
>
> [YOUR NAME]
> Customer Support, {{STORE_NAME}}
> {{SUPPORT_EMAIL}}

*(Chargeback, not inquiry? Replace the first paragraph with: "Your bank has already taken the payment for order [ORDER NUMBER] back from us, so I am not able to refund it a second time from our side — your bank will return the money to you directly as part of the case." Never promise a refund on top of a chargeback.)*

### Template C — the customer wants to return the item

> **Subject:** Return for order [ORDER NUMBER] — here is the address
>
> Hi [FIRST NAME],
>
> Of course — you can send order [ORDER NUMBER] back to us. Please return it to:
>
> {{RETURN_ADDRESS}}
>
> Two things that make this quick: write [ORDER NUMBER] on or inside the parcel, and send me the shipping receipt or tracking number once it is on its way. As soon as the parcel is registered as returned, I issue your refund of [AMOUNT] {{CURRENCY}} to the card you paid with. Our return window is {{RETURN_WINDOW_DAYS}} days and the full terms are here: {{POLICY_URL}}
>
> You have also opened a case with your bank about this payment. Could you let them know we are handling the return, so the two processes do not collide? If the bank case stays open, your refund can be delayed rather than faster.
>
> [YOUR NAME]
> Customer Support, {{STORE_NAME}}
> {{SUPPORT_EMAIL}}

### Template D — delivered, and the customer believes something is missing

> **Subject:** Order [ORDER NUMBER] — what is in the box
>
> Hi [FIRST NAME],
>
> Thank you for writing, and sorry for the confusion. I have checked order [ORDER NUMBER]: it was delivered on [DELIVERY DATE][ in LOCATION], carrier [CARRIER], tracking [TRACKING NUMBER].
>
> Your order includes [EXACT CONTENTS, as listed on the product page]. [THE ITEM THEY ARE MISSING] is packed [where it sits — inside the case / under the foam insert / in the same sealed bag], so it is easy to miss on the first look.
>
> Could you check that and tell me what you find? If anything really is missing from the box, I will send it out to you at once — just reply with a photo of what you received and I will take it from there.
>
> [YOUR NAME]
> Customer Support, {{STORE_NAME}}
> {{SUPPORT_EMAIL}}

---

## 12. Daily routine — what to do when the alarm fires

The `/tvistkoll` alarm posts in Discord {{ESCALATION_CHANNEL}} every morning and lists every open dispute with evidence due within **3 days** (`LARMGRANS_DAGAR`), sorted **chargebacks first, then deadline, then amount**. That post is the queue; this SOP is what you do with it.

1. Open the alarm. Count the 🔴 CHARGEBACK lines — those are done first, in order.
2. Then anything marked **due TODAY** or **OVERDUE**. "Due today" is still winnable; "overdue" follows section 2.
3. For each line: order number → `tvistfakta.mjs` or the admin → section 1 → tracking check if the claim is "not received".
4. Decide, email, submit. One dispute should take 5–15 minutes.
5. Reply in the same thread, one line per dispute: `#[ORDER] — [fight/refund/accept/escalate] — [reason in five words] — saved/submitted [date]`. No customer emails or names in the thread — the order number is the key.
6. Anything you could not finish: say so in the thread **with the due date**. A dispute nobody mentions is a dispute nobody does.

**"No deadline read" in the alarm is not "no deadline".** It means we could not read the date. Open it today and read the due date in the admin.

---

## 13. Store config — the only place with store-specific values

One block per store, in `kundtjanst/brands/<store-id>.yaml` (template: `kundtjanst/brand-mall.yaml`). Nothing store-specific belongs anywhere else in these SOPs.

```yaml
tvister:
  returadress: ""             # {{RETURN_ADDRESS}} — the full address the VA sends to the customer
  returfonster_dagar: 14      # {{RETURN_WINDOW_DAYS}} — the return window stated on the site
  policy_url: ""              # {{POLICY_URL}} — the page the customer accepted at checkout
  billing_descriptor: ""      # {{BILLING_DESCRIPTOR}} — the text on the customer's card statement
  strid_lonar_sig_over: 0     # {{FIGHT_THRESHOLD}} in the store's own currency. 0 = always fight
```

The escalation keys are in the template too (added 2026-09-20) — **60-ESCALATION.md** is what they govern:

```yaml
  agare_kontakt: ""           # {{OWNER_CONTACT}} — who the VA escalates to
  godkannande_over: 0         # {{REFUND_APPROVAL_LIMIT}} — refund/accept above this needs the owner. 0 = the VA decides everything
  ersattning_over: 0          # {{REPLACEMENT_LIMIT}}
  forsta_svar_timmar: 24      # {{FIRST_REPLY_TARGET_HOURS}} — the reply-time target
  returadress_pa_forfragan: true  # the return address is given out on request, never published
  returfrakt_betalas_av: ""   # {{RETURN_POSTAGE_PAID_BY}} — "kund" / "butik". Empty = undecided, do not guess
```

{{STORE_ID}}, {{STORE_NAME}}, {{STORE_DOMAIN}}, {{SUPPORT_EMAIL}}, {{CURRENCY}} and the country come from the brand block (`brand.namn`, `brand.shop`, `brand.supportmail`, `brand.valuta`, `brand.land`) or from `factory/butiker/<id>.yaml`. {{ESCALATION_CHANNEL}} is `discord.kanal` (default `customer-service`). Secrets never go in YAML.

**{{BILLING_DESCRIPTOR}} is blank?** Read it in Shopify admin → **Settings** → **Payments** → **Customer billing statement**, and write it into the config. A descriptor that does not look like the store is a common cause of `unrecognized` disputes.

*Example values, one store only, never the rule:* a Swedish general store runs {{CURRENCY}} = SEK and {{RETURN_WINDOW_DAYS}} = 14; a US market on the same backend runs a 90-day guarantee. **Read the config, never the example.**

---

## Definition of done — per dispute

- [ ] Reason code **and** dispute status read; the order confirmed to belong to **this** store
- [ ] Due date read and compared against today: days left / due today / overdue
- [ ] For any "not received" claim: tracking read, status + date + location written down
- [ ] Refunds already on the order checked
- [ ] FIGHT / REFUND / ACCEPT / ESCALATE decided and stated in one sentence
- [ ] Customer emailed (Template A–D) from {{SUPPORT_EMAIL}}
- [ ] If fighting: evidence statement written, proof attached, **Saved** in Shopify before the due date, relevant only, files inside the format limits
- [ ] If accepting: chargeback accepted, or the full refund issued (inquiry only — never refund an open chargeback)
- [ ] Outcome line posted in {{ESCALATION_CHANNEL}}, customer details masked
- [ ] Nothing left inside 48 hours of its due date

---

## ⚠️ Known gaps — do not paper over these

- [x] ~~The reason-code SOPs do not exist yet.~~ **Written 2026-09-20, same day:** `10-NOT-RECEIVED.md`, `11-UNACCEPTABLE.md`, `12-CREDIT-NOT-PROCESSED.md`, `13-FRAUD-UNRECOGNIZED.md`, `14-DUPLICATE-SUBSCRIPTION-OTHER.md`, plus `20-NO-CONTACT.md`, `30-EMAIL-TEMPLATES.md`, `40-EVIDENCE-PACK.md`, `50-PREVENTION.md` and `60-ESCALATION.md`. Route from `START-HERE.md`, not from this file.
- [ ] **Field labels on the Shopify evidence form are not documented.** VERIFY IN SHOPIFY ADMIN: Orders → disputed order → **Add evidence**. Write the real labels in here the first time you see them.
- [ ] **The "Accept chargeback" button's exact label and location are not documented.** VERIFY IN SHOPIFY ADMIN on the next real chargeback, and write it in.
- [ ] **Chargeback fee amount is not documented.** VERIFY IN SHOPIFY ADMIN: Settings → Payments → the payout/transaction record for a chargeback. Do not quote a figure to the owner until it is read there.
- [ ] **Card-network rules, deadlines, percentages and win rates are not in this file** — we have no verified access to the Visa/Mastercard rulebooks. Everything numeric above is either Shopify's own wording (quoted) or our own measurement (dated). Keep it that way.
- [ ] **Bank review time:** Shopify's pages state 30–90 days, 65–75 days, up to 75 days and up to 120 days in different places. Never promise a customer a date.
- [ ] **When the {{RETURN_WINDOW_DAYS}} window starts** (order date or delivery date) is a per-store legal question the owner must answer. It decides cases like #5435.
- [x] ~~The `tvister:` config block is not read by the code yet.~~ **Wired 2026-09-20:** `kundtjanst/brands.mjs` has `STANDARD_TVISTER` and merges `tvister` through `brandUrEgenfil`, `upptackBrands` and `korkonfig`, so a value written in the YAML reaches the code. `agare_kontakt`, `godkannande_over`, `ersattning_over`, `forsta_svar_timmar`, `returadress_pa_forfragan` and `returfrakt_betalas_av` are in `kundtjanst/brand-mall.yaml`.
- [ ] **`tvistfakta.mjs` defaults to one specific store id.** Always pass `--brand {{STORE_ID}}`. A VA who forgets reads another store's orders and will not be told.
- [ ] **`sparning/` reaches one store only.** Tracking for the other stores is read through `tvistfakta.mjs` / 17track.net in the browser, not through the hourly routine.
- [ ] **Whether a *fought* inquiry ever escalates anyway is unmeasured.** What we measured 2026-09-20: decided inquiries 29 won / 0 lost; chargebacks 1 won / 3 lost; three ignored inquiries (#4914, #5044, #4706) turned into chargebacks. Answer inquiries — they are cheap to win.

## Sources (source of truth)

| What | Where |
|---|---|
| Per-dispute facts and the FIGHT/REFUND/ESCALATE verdict | `kundtjanst/tvistfakta.mjs` (`dom`, `rendera`, `dagarKvar`) |
| The daily queue, its sort order and the 3-day limit | `kundtjanst/tvistkoll.mjs` (`bradskande`, `renderaLarm`, `narText`, `LARMGRANS_DAGAR`) |
| The eight reason codes, the six statuses and the due date | `kundtjanst/shopify.mjs` (`normaliseraTvist`, `evidence_due_by`) |
| Risk score, thresholds, dispute rate | `kundtjanst/chargeback.mjs` (`bedomRisk`, `NIVAER`) |
| Tracking status names and mapping | `sparning/status.mjs` (`STATUS`, `BOLAG`) |
| Store list, ids and which keys are missing | `node kundtjanst/run.mjs --kolla`, `kundtjanst/brands.mjs` |
| Store config template | `kundtjanst/brand-mall.yaml` (`tvister:`, `discord.kanal`) |
| Weekly report and the VA work list | `kundtjanst/README.md`, `kundtjanst/atgardsplan.mjs` (`HINKAR`) |
| Per-reason procedures | `kundtjanst/sop/` — route from `START-HERE.md` |
| What the VA decides alone vs hands to the owner | `kundtjanst/sop/60-ESCALATION.md` |

<!--
REVIEW: fixed 24 defects.

INVENTED RULES removed/corrected:
1. "Delivered with a real scan → we fight and we usually win" — contradicted our own measurement (chargebacks 1 won of 4). Rewritten as "strongest evidence we have, not a guarantee", with the number.
2. "The VA's hour is worth more than {{CURRENCY}} 100" — invented cross-currency threshold. Replaced with the real config key `tvister.strid_lonar_sig_over` ({{FIGHT_THRESHOLD}}, 0 = always fight).
3. Inquiry win rate presented as a forward-looking "100 %" — reframed as historical ("29 of 29 decided").
4. "fraudulent: any earlier undisputed orders from this card?" — a VA cannot see card history. Replaced with the billing/shipping address check that `tvistfakta.mjs` actually computes, plus the statement descriptor.
5. Due-date cut-off time was implied as end of due date — now an explicit VERIFY, with "finish the working day before".
6. `duplicate` row said FIGHT/refund with certainty; the tool escalates. Aligned: refund a genuine double charge, fight two real orders, escalate if undecidable in 10 min.

WRONG ON THE DATA:
7. #5584 was labelled `credit_not_processed`; the owner's own note says it is a real chargeback whose parcel is stuck at "shipment information received". Corrected.
8. #5122 was used as an `under_review` "already finished" example; the owner's note says CS missed his email about damaged straps. Rewritten as the "we ignored the customer → refund/accept" case, with the under_review rule kept generic.
9. Known gap "there is no single-order tracking command" is out of date — `kundtjanst/tvistfakta.mjs <order> [--brand] [--registrera] [--alla]` exists (committed 2026-09-20). Now the fast path in sections 1, 4 and 6.
10. Config block was invented: the real one in `kundtjanst/brand-mall.yaml` is `tvister:` with `returadress`, `returfonster_dagar`, `policy_url`, `billing_descriptor`, `strid_lonar_sig_over` — not `tvist:` with `retur_betalas_av`, `garanti_dagar`, `bevis_sprak`, `sop_mapp`, `refund_godkannande`, `agare_kontakt`. Corrected; the two governance keys are now marked as missing from the template.
11. Only `under_review` was handled; Shopify has six statuses (`needs_response`, `under_review`, `charge_refunded`, `accepted`, `won`, `lost`). All six now in the stop-the-clock table.
12. "Whether an unanswered inquiry escalates is not documented" — we measured three that did (#4914, #5044, #4706). Moved from gap to fact.
13. The linked reason-code SOPs do not exist (`kundtjanst/sop/` is empty). Links removed, gap stated, and this file declared sufficient on its own.

NOT PORTABLE:
14. Hardcoded Discord `#customer-service` → {{ESCALATION_CHANNEL}} (`discord.kanal`).
15. `tvistfakta.mjs` silently defaults to one store's id → {{STORE_ID}} required on every command, warned twice.
16. Added the missing placeholders the procedure needs: {{STORE_ID}}, {{POLICY_URL}}, {{BILLING_DESCRIPTOR}}, {{FIGHT_THRESHOLD}}, {{ESCALATION_CHANNEL}}; worked examples relabelled as examples with their date.

NOT ACTIONABLE → fixed:
17. "Cannot find the order → open the other store's admin" — now a concrete search across store ids (`run.mjs --kolla`, `tvistfakta --brand <id>`) and an escalation with what to send.
18. No paste-ready evidence text existed. Added a complete fill-in-the-brackets evidence statement, and the exact underlying Shopify field names.
19. Missing navigation for accepting/refunding and for the dispute list; both paths now given, with VERIFY where Shopify's labels are undocumented.

MISSING CASES ADDED (all from the owner's own 12 orders):
20. Deadline already passed (3 of 12 were) and "due today is still winnable" (#4914 lesson) — new rows.
21. Cancellation requested after shipping (#5435) — with the window-start question routed to the owner, not guessed.
22. Delivered but customer thinks part is missing (#5763) — new row + Template D.
23. A customer's public review as possession evidence (#4706) — added to the evidence pack.
24. Return-address email (3 of 12 cases) — new Template C; plus the hard rule "never refund an order with an open chargeback" and a chargeback variant of Template B.

CANNOT BE RESOLVED WITHOUT THE OWNER:
- Shopify evidence-form field labels, the "Accept chargeback" button label, and the chargeback fee amount: someone must read them on a real dispute and write them in.
- {{OWNER_CONTACT}} and {{REFUND_APPROVAL_LIMIT}}: RESOLVED 2026-09-20 — `agare_kontakt` and `godkannande_over` are in `kundtjanst/brand-mall.yaml` and read by `brands.mjs`; the procedure they govern is `60-ESCALATION.md`.
- Whether {{RETURN_WINDOW_DAYS}} runs from order date or delivery date (decides #5435) — legal, per store.
- The `tvister:` block is still not read by `kundtjanst/brands.mjs`; until it is, the values work for humans only.
- Delivery dates and amounts inside the worked examples come from the earlier session's Shopify/17TRACK read; I could not re-verify them here, so they are written as examples with their measurement date, never as rules.
-->
