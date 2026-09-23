# Special case: the customer never contacted us

**Use this when:** a dispute is open and, as far as you can tell, the customer never emailed, messaged or called us before going to their bank.

**Owner:** customer-service VA · **Time:** 15–25 minutes per dispute (10 only when the inbox is truly empty and the parcel is delivered) · **Read first:** `00-MASTER.md` in this folder, then the SOP for the reason code.

---

## 30-second triage — do this before you read anything else

```
node kundtjanst/tvistfakta.mjs <order number> --brand <store id>
```

Read three things off the top of that output and write them on your notepad:

1. **CHARGEBACK or INQUIRY?** Chargeback = the money is already taken. Handle every chargeback before any inquiry.
2. **Evidence due date.** If it says `DUE TODAY` or `OVERDUE`, stop reading this SOP: submit the evidence you can already prove (delivery scan + order confirmation + policy page) **now**, then come back and do the rest. A perfect packet after the deadline is worth nothing.
3. **DECISION: FIGHT / REFUND / ESCALATE.**

⚠️ **The tool's DECISION only knows tracking, refunds and the order.** It has never read the inbox and it does not know `{{FIGHT_THRESHOLD}}`. The inbox can overturn it — the tool says so itself ("If support DID promise a refund in an email we have not read, this collapses"). Steps 1 and 5 below are what turn its verdict into your decision.

---

## Store values this SOP uses

One block per store, in `kundtjanst/brands/<id>.yaml` → `tvister:`. Never type these values into the procedure — fill them in the brand file once and the same SOP runs on every store.

| Placeholder | Where it comes from |
|---|---|
| `{{STORE_NAME}}` | `brand.namn` |
| `{{SUPPORT_EMAIL}}` | `brand.supportmail` — the mailbox you search **and** send from |
| `{{CURRENCY}}` | `brand.valuta` |
| `{{RETURN_ADDRESS}}` | `tvister.returadress` |
| `{{RETURN_WINDOW_DAYS}}` | `tvister.returfonster_dagar` |
| `{{POLICY_URL}}` | `tvister.policy_url` — the page the customer accepted at checkout |
| `{{FIGHT_THRESHOLD}}` | `tvister.strid_lonar_sig_over` — below this amount, refund instead of fighting |

Values written `<like this>` are per case (order number, dates, carrier, your own name) — you fill them from the order, never from the brand file.

**If the store has no `kundtjanst/brands/<id>.yaml`:** copy `kundtjanst/brand-mall.yaml` to that path, fill the `tvister:` block (about ten lines) and commit it. Do not improvise a return address or a policy link into an email — a wrong return address loses the parcel and the case.

**If `{{FIGHT_THRESHOLD}}` is `0` or empty:** there is no threshold yet. Fight everything the decision tables say to fight, and tell the owner to set one.

---

## Decision table — start here

Search the inbox first (Step 1). Then read the row that matches what you found.

| What the inbox actually shows | What it means | Do this |
|---|---|---|
| **Nothing at all** — no email, in any folder, from order date to today | True no-contact. This is **good for us**: the customer never gave us a chance to fix it | Email them today (Step 2) → state the no-contact fact in the evidence (Step 3) → decide with Step 5 → continue with the reason-code SOP |
| **An email we answered, and we did what we said** | Not a no-contact case | Do **not** write "no contact". Attach the full thread. Use the reason-code SOP as normal |
| **An email we never answered** | Dangerous. We dropped the ball | Do **not** write "no contact". Answer it now, offer the fix, and read Step 4 before you submit anything |
| **An email we answered too late, or we never did what they asked** (e.g. they asked to cancel and the parcel shipped anyway) | We are in the wrong, even though contact exists | **Refund (inquiry) / accept (chargeback).** Do not spend evidence time. Apologise in writing — it lowers the odds of a second dispute |
| **We promised a refund or a replacement and never delivered it** | We are in the wrong | Stop. Refund (inquiry) or accept (chargeback) |
| **Only a public review or a social comment, no email to us** | Not contact with us — but it **is** proof they have the product | You may still write "no contact"; add the review as possession evidence |
| **No dispute exists on this order in this store** | Wrong store, or it was already closed | Nothing to do here. Check the owner's other stores before spending time. Write one line saying which store you checked |
| **You cannot search the mailbox, or you are not sure** | Unknown ≠ zero | Write nothing about contact. Submit the delivery evidence only, and tell the owner you could not verify the inbox |

**No-contact is a supporting argument, never the case itself.** What wins in our own data is a delivery scan.

**Measured on one store, 2026-09-20, 50 disputes:** of the inquiries that had been decided, **29 of 29 were won**. Of 4 chargebacks, **1 won and 3 lost** — every loss this store has ever had was a chargeback.

**And this is why a no-contact case must never be left to ride:** an unanswered inquiry is not lost on the spot — it **escalates into a chargeback**, and that is where we lose. Three orders on that same store went exactly that route (#4914, #5044, #4706). Answer the inquiry while it is still cheap.

---

## Step 1 — Prove it: the inbox check (do this before you write one word)

1. Open `{{SUPPORT_EMAIL}}` and search **four** times, not once:
   - the order number, both ways: `<order number>` and `#<order number>`
   - the customer's email address
   - the customer's last name
   - the tracking number
2. Search **every folder**, not just the inbox: Sent, Spam/Junk, Trash, Archive. A missed email usually sits in Spam.
   *Example, measured 2026-09-12 on one Loopia mailbox: the only folders that existed were INBOX, Drafts, Sent, Spam, Trash. Other providers have more — list yours with `node kundtjanst/setup.mjs --mappar <store id>`.*
3. Set the window from **the order date to today**, not the last 30 days. Disputes are usually filed weeks after the order, so a 30-day search can show nothing while an email from the order week sits right there.
4. Check every other channel this store actually uses: website chat, Instagram/Facebook DMs, WhatsApp, and **Shopify admin → Orders → the order → Timeline** (customer notes and order-page messages live there, not in the mailbox). If the store has no such channel, write that down — it is part of the claim.
5. Get the facts on the order in one command (read-only, changes nothing):
   ```
   node kundtjanst/tvistfakta.mjs <order number> --brand <store id>
   ```
   It prints the reason code, the evidence deadline, the delivery scan, refunds on the order, and a FIGHT / REFUND / ESCALATE decision. For an old parcel add `--registrera` — tracking older than the tracking routine's 14-day window is not registered with 17TRACK and returns *"does not register, please register first"*. Registration costs quota, so do it once per order.
   ⚠️ Never run `node sparning/kor.mjs --dagar 90` to check an old order. That writes delivery events into Shopify, which can fire delivery notifications to hundreds of old customers.
6. Read the **issuer claim** if one is attached to the dispute in Shopify — the document from the card-issuing bank explaining why the buyer opened the case. It may quote an email we never saw. **VERIFY IN SHOPIFY ADMIN:** not every dispute carries one; look on the dispute panel of the order before you assume there is nothing.

**Write your finding down where the next person will find it:** Shopify admin → Orders → the disputed order → **Timeline** → add a comment (internal note, the customer never sees it). One line, with the date you searched:

> *Inbox searched 2026-09-20 for #<order number> (order no., email, surname, tracking) across INBOX/Sent/Spam/Trash, from order date <date> to today: no customer message found. Shopify timeline: no customer note.*

---

## Step 2 — Email them today, even though they never wrote

Two reasons, both real:

1. **It can end the dispute.** We cannot withdraw a dispute from our side — only the cardholder can ask their bank to drop it. So the only way a case disappears early is if the customer is satisfied and calls their bank themselves. Never promise a customer that we will close it for them.
2. **The email itself is evidence.** It shows the issuer we tried to resolve it directly, on our own initiative, and it often produces a reply that settles the facts.

Send from `{{SUPPORT_EMAIL}}` so the reply lands in the mailbox we search. Never from a personal account. Save the sent email as a PDF for the evidence pack.

⚠️ **If the dispute is a CHARGEBACK, never offer a refund in the email.** The money has already been pulled from us; refunding on top of that pays the customer twice and we cannot get it back. On a chargeback the choices are *fight* or *accept* — accepting is what returns the money to the customer. Offer a replacement if you want to offer something. **VERIFY IN SHOPIFY ADMIN:** check whether the Refund button is even active on a disputed order — if it is, still do not use it.

### Template — first contact after a dispute was filed

Copy it, replace `<…>`, keep the one reason paragraph that matches.

> **Subject:** About your order `<order number>` — let's get this sorted
>
> Hi `<first name>`,
>
> I'm writing from `{{STORE_NAME}}` about your order `<order number>` from `<order date>`.
>
> Your bank has let us know that you've opened a case about this payment. We hadn't heard from you before that, so I'd like to make sure you actually get this fixed instead of waiting weeks for a bank to decide it.
>
> `<< reason paragraph — pick ONE below >>`
>
> Just reply to this email and it comes straight to me. If you'd rather close the case with your bank, you'll need to contact them yourself — that isn't something we're able to do from our side.
>
> Kind regards,
> `<your name>`
> Customer Service, `{{STORE_NAME}}`
> `{{SUPPORT_EMAIL}}`

**Reason paragraph — product not received, and tracking shows it was delivered:**
> Our carrier's tracking shows the parcel was delivered on `<delivery date>` (`<carrier>`, tracking `<number>`). Parcels are often left with a neighbour, in a parcel box, or at a pickup point, so that's worth a look first. If you still can't find it, tell me and I'll send a replacement or refund you — I just need to know which you'd prefer.

**Reason paragraph — product not received, and the parcel is genuinely stuck or lost:**
> I've checked the tracking and your parcel hasn't moved since `<date>` (`<carrier>`, tracking `<number>`). That's on us, not on you. I'm refunding your order today — `<refunds usually appear on your statement within a few banking days>` — and you don't need to do anything else. I'm sorry you had to chase this.

**Reason paragraph — credit not processed:**
> Looking at your order, it was delivered on `<delivery date>` and no refund has gone out yet, because we hadn't received a return or a refund request from you. If you'd like to return it, the address is `{{RETURN_ADDRESS}}` — send it back and I'll refund you as soon as it arrives. If you believe a refund was already agreed with us, reply with the date and I'll check it the same day.

**Reason paragraph — product unacceptable:**
> I'm sorry the product wasn't what you expected. Could you send me a photo of the problem? With that I can send you a replacement straight away, or you can return it to `{{RETURN_ADDRESS}}` and I'll refund you once it arrives. Our return window is `{{RETURN_WINDOW_DAYS}}` days from delivery — if you're past it, reply anyway and I'll see what we can do.

**Never** tell the customer to contact the manufacturer or the supplier. We sold it, we handle it. Sending a customer to a supplier is the fastest way to turn an inquiry into a chargeback.

---

## Step 3 — Say it in the evidence, without sounding defensive

Facts and dates only. No adjectives, no accusations, no complaints about the bank. Paste one of these into the evidence text and fill in the dates.

**Product not received:**
> Order `<number>` was placed on `<date>` and delivered on `<date>` by `<carrier>` (tracking `<number>`) to the cardholder's own billing address. Between delivery and the date this dispute was filed we received no email, message or call from the customer at `{{SUPPORT_EMAIL}}`; we searched that mailbox on `<date>` for the order number, the customer's email address and surname. We contacted the customer ourselves on `<date>` and offered a replacement or a refund (attached). Had we been asked, we would have resolved this directly.

**Credit not processed:**
> No refund or credit was requested from us before this dispute was filed. We searched `{{SUPPORT_EMAIL}}` on `<date>` for the order number, the customer's email address and surname and found no return request, cancellation or refund promise. No return has been received at `{{RETURN_ADDRESS}}`. Our return and refund policy was shown at `{{POLICY_URL}}` and accepted at checkout. The goods were delivered on `<date>` (`<carrier>`, tracking `<number>`). We contacted the customer on `<date>` with the return address (attached).

**Product unacceptable:**
> The customer did not report any fault to us before filing this dispute. We searched `{{SUPPORT_EMAIL}}` on `<date>` and found no message. The product was delivered on `<date>` (`<carrier>`, tracking `<number>`) and has not been returned to `{{RETURN_ADDRESS}}`. The product description and photos shown at purchase are attached. We contacted the customer on `<date>` offering a replacement or a return refund (attached).

**Never write:** "the customer is lying", "this is friendly fraud", "we always reply within 24 hours" (the inbox can contradict you — one store's week-38 report showed **192 emails unanswered beyond 48 hours**), or anything about the bank's competence.

**Where to put it:** Shopify admin → **Orders** → the disputed order → **Add evidence**.
**VERIFY IN SHOPIFY ADMIN:** the visible field labels are not documented anywhere we can check — put the paragraph in the free-text / additional-information field, and attach the emails in the customer-communication file slot if the form offers one.
**VERIFY IN SHOPIFY ADMIN:** the accepted file types and the size limit are printed on the upload form itself — read them there, do not assume. As a habit: PDF/JPEG/PNG, small files, and legible when printed in black and white.

---

## Step 4 — The trap that costs us the case

**Do not claim "no contact" until you have finished Step 1.** It has happened on a real order: support had missed an email in which the customer asked to return a product with damaged straps. Had we told the issuer nobody ever contacted us, the customer's own copy of that email would have shown up in their claim — and every other true thing in our submission stops being believed.

Rules:
0. **One email address is not a search.** The address on the order is whoever paid; the person who complains is often someone else in the same household. Measured on order 4446, 2026-09-22: the order carries `mia.lindqvist73@…`, the return request came from `fredrik.lindqvist74@…`, and a search on the order's address returned nothing while a search on the **surname** found the mail at once. Search the surname, and search the mailbox to its end — the MCP tool `mail_search` stops after 200 mails (4 pages of 34), so run `node kundtjanst/mail.mjs sok "<surname>" --sidor 40` and also `--mapp INBOX.Sent`, and read the line that says how many pages it actually read.
1. Claim only what you searched, and say which mailbox and which dates you searched.
2. Assume the issuer already has the customer's side, including screenshots of emails.
3. If you are not certain, **leave contact out entirely** and submit the delivery evidence. Silence costs nothing; a false claim costs the case.
4. Re-check the inbox on the day you submit. Customers often write *after* filing.
5. A public review or a social post is not contact with us — describe it as evidence of possession, not as communication.
6. "No contact" means no contact **from the customer**. An email *we* sent after the dispute was filed does not break the claim — say plainly that it was ours and that it was on our own initiative.

---

## Step 5 — No contact does not make a weak case winnable

| Situation | Decision |
|---|---|
| Delivered (carrier scan) + no contact | **FIGHT.** Strongest case we have |
| Not delivered — tracking stuck, no scan — + no contact | **REFUND / ACCEPT.** We cannot prove delivery, and no-contact does not replace a scan |
| No tracking number on the order at all | **ESCALATE to the owner.** Nothing to prove with; fulfilment is broken |
| Real fault we refused to fix, or a cancellation we ignored + no contact | **REFUND / ACCEPT.** We deserve to lose it |
| Amount below `{{FIGHT_THRESHOLD}}` `{{CURRENCY}}` and the evidence is thin | **REFUND.** Your time costs more than the order |
| Product unacceptable, delivered, no contact | **FIGHT, medium at best.** "Not as described" is the customer's opinion until they return the item — but if the fault is real and we ignored it, accept |
| It is a **CHARGEBACK** | Handle it before any inquiry. Our data: 1 of 4 won. Fight only when the delivery scan is clean and the amount is worth it |

Accepting is not an admission of guilt, and it is not a failure — it is a decision about where your day goes.
**VERIFY IN SHOPIFY ADMIN:** whether accepting changes anything about the dispute fee on this store's plan. Never tell anyone that accepting is free.

---

## Worked examples

*Real orders from one store — Sweden, `{{CURRENCY}}` = SEK — measured 2026-09-20. They are examples of the reasoning, not rules. Every number below must be re-read with `tvistfakta` before you act.*

| Order | What the data actually says | Correct handling |
|---|---|---|
| **4446** — inquiry, credit not processed, **1262.20 SEK**, needs response, **evidence due 2026-09-23**, no refund ever issued | ⚠️ **This row said "no contact found in the inbox" until 2026-09-22, and that was wrong.** The first search was run on the order's own email address, which is the wife's; the complaint came from the husband's address. A search on the **surname** found it in seconds: 2026-08-25, subject "Ang order #4446", asking for a return slip — **unanswered for 22 days** | **Not a no-contact case. FIGHT — medium, with the thread attached and the delay admitted.** See `beslut/order-4446.md`. This row is the reason Step 1 says to search four ways: one address is not a search |
| **5053** — **two separate inquiries on one order** (348 SEK and 255 SEK), both product not received, both **due 2026-09-28** | No conversation | **FIGHT both, separately.** Each dispute gets its own evidence and its own amount. Answering one does not cover the other |
| **5418** — inquiry, product not received, evidence due 2026-10-03 | No conversation; CS emailed after the dispute was opened | **FIGHT if the scan shows delivered.** Delivery scan + the email we sent. Say plainly that the email was ours, on our initiative |
| **4706** — **CHARGEBACK** (not an inquiry), product unacceptable, 599 SEK, **evidence due 2026-09-20** | No email to us, but he left a public review showing disappointment. This one started as an inquiry and escalated | **Decide by amount, today.** The review proves possession but not that the product was fine. If it is above `{{FIGHT_THRESHOLD}}`: delivery scan + product page as sold + the review + "the fault was never reported to us". Otherwise accept. A chargeback loss is final |
| **5584** — **CHARGEBACK, credit not processed**, 348 SEK, due 2026-09-23. The customer emailed on 2026-08-20 asking to cancel before shipping; we replied **582 hours (24 days) later** and the parcel had already gone | **Not a no-contact case — do not use this SOP on it.** Contact exists and we failed to act on it. Accept, apologise in writing, and note the cancellation window in the store's own process |
| **5122** — inquiry, product unacceptable, 348 SEK, due 2026-09-21, still needs response at the last run | CS had **missed** his email asking to return damaged straps | **Not a no-contact case.** Never claim it was. Answer, send `{{RETURN_ADDRESS}}`, and decide with Step 5 |
| **4825** | No dispute found in this store | Nothing to do here. Check the owner's other stores before spending time, and write down which one you checked |

---

## Definition of done

- [ ] `tvistfakta` run for this order: type (chargeback/inquiry), deadline, delivery scan, refunds all known
- [ ] Deadline checked **first**; if due today or overdue, evidence submitted before anything else
- [ ] Mailbox searched four ways, all folders, from order date to today — result written in the Shopify order timeline with the date
- [ ] Other channels (chat, DMs, Shopify timeline) checked or confirmed not in use
- [ ] Email sent to the customer from `{{SUPPORT_EMAIL}}`, saved as PDF
- [ ] FIGHT / REFUND / ACCEPT decided using Step 5 and `{{FIGHT_THRESHOLD}}`, not by feel — and the tool's verdict overridden if the inbox contradicts it
- [ ] If fighting: no-contact sentence pasted into the evidence with real dates, plus delivery proof
- [ ] If the inbox shows an email we missed, answered too late, or a promise we broke: no-contact claim **removed**, thread attached, decision re-read against Step 5
- [ ] Inbox re-checked on submission day
- [ ] Submitted before the evidence deadline

## ⚠️ Gaps — verify, never guess

- [ ] **VERIFY IN SHOPIFY ADMIN:** the exact evidence field labels (Orders → disputed order → Add evidence), and the accepted file types and size limit printed on the upload form.
- [ ] **VERIFY IN SHOPIFY ADMIN:** whether this store's disputes carry an issuer claim document.
- [ ] **VERIFY IN SHOPIFY ADMIN:** whether the Refund button is blocked on an order with an open chargeback, and what happens to an open **inquiry** after you refund the order — does it close by itself, or does it still need a submission?
- [ ] **VERIFY IN SHOPIFY ADMIN → Settings → Payments:** whether accepting a dispute changes the fee on this plan.
- [ ] Not documented anywhere we can check: whether an unanswered inquiry *always* becomes a chargeback (we have three orders that did, which is not a rule), the chargeback fee amount, and how long the bank takes to decide (Shopify's own pages give 30–90, 65–75, 75 and 120 days). **Never quote a number to a customer.**
- [ ] We have no verified copy of the Visa or Mastercard rulebooks. Nothing in this SOP is a card-network rule — it is our own measured experience plus what Shopify's admin shows.

<!--
REVIEW: fixed 22 defects.

WRONG ON THE DATA (measured against kundtjanst/korningar/baverbutiken/2026-W38.json and kundtjanst/tvistkoll.mjs, both in-repo, 2026-09-20):
 1. Order 5584 was presented as "product not received + no contact" and used as the headline example of a stuck parcel. It is a CHARGEBACK with reason CREDIT NOT PROCESSED (348 SEK, due 2026-09-23) and the customer DID email us on 2026-08-20 asking to cancel before shipping; we answered 582.4 h later. Using it here would have made the VA commit the exact false no-contact claim Step 4 warns about. Moved to the worked examples as the counter-example and given its own decision-table row.
 2. Order 4706 was called an "inquiry". It is a CHARGEBACK (product unacceptable, 599 SEK) with evidence due 2026-09-20 — the same day this SOP was written. Its "delivered 2026-08-18" was the dispute's start date, not a delivery scan. Advice changed from "FIGHT, medium strength" to an amount-based decision made today.
 3. Delivery dates for 4446, 5418 and 5053 were stated as fact but are not in any measured source (the 2026-08-13 figure comes from a unit-test fixture). Replaced with the verified fields: amounts, reason codes and evidence deadlines, plus "read the scan from tvistfakta".
 4. Deadlines were missing entirely from the worked examples, although the whole list is deadline-driven (4446 due 2026-09-23, 5053 due 2026-09-28, 4706 due today).
 5. 5122 was described as "evidence already submitted"; its status was still needs_response at the last run.

INVENTED RULES (removed or converted to VERIFY):
 6. "Stripe's published analysis of one million disputes puts delivery confirmation at +27 percentage points" — unverifiable, deleted. Replaced by our own measured win rates.
 7. Two quotes attributed to Stripe and one to Shopify — kept the operational substance, dropped the fabricated attribution and the quoting.
 8. "PDF, JPEG or PNG, max 2 MB each and 4 MB combined" — now VERIFY on the upload form.
 9. "Accepting does not change the dispute fee" — now VERIFY.
10. "A loss here is final and cannot be appealed" — replaced by what our data shows (1 of 4 chargebacks won) plus a VERIFY.
11. "Shopify blocks a refund on that order" — turned into the instruction (never refund an order with an open chargeback) plus a VERIFY.
12. "After the deadline there are no exceptions" — replaced by "submit before the deadline" without the invented rule.

NOT PORTABLE (fixed):
13. Case numbers inside the procedure ("this is order 5122", "this is order 4706", "Order 4446 was placed long before…") moved to the clearly marked examples; search strings are now <order number>.
14. {{STORE_DOMAIN}} was listed as a store value but never used, and no such field exists in kundtjanst/brand-mall.yaml. Removed. Added what to do when a store has no brand file at all, and what {{FIGHT_THRESHOLD}} = 0 means (it is the shipped default, so this would have stalled every new store).
15. Amounts in the examples had no currency; the example block is now marked as one store, SEK.

NOT ACTIONABLE (fixed):
16. "Write your finding as one line in the case notes" — "case notes" existed nowhere. Now: Shopify admin → Orders → the order → Timeline → comment.
17. Added the Shopify order timeline as a place contact can hide; the mailbox is not the only channel.
18. Added the mailbox-folder listing command (setup.mjs --mappar).
19. tvistfakta.mjs does not read the tvister: block and never sees the inbox (verified in the source). The SOP treated its DECISION as final. Now stated as an explicit override rule.
20. Time estimate 10 min raised to 15–25; four searches across all folders plus an email plus an evidence pack is not a ten-minute job.

NO DECISION / MISSING ACCEPT CASE (fixed):
21. The deadline was buried in Step 1.5 although one case on the owner's own list was due the same day. Added a 30-second triage block above the decision table.
22. Added three missing rows (answered-but-ignored, no dispute in this store, no tracking number at all), an email paragraph for the refund case (the old template could only tell the customer the parcel was delivered), and the measured escalation path: an unanswered inquiry is not lost on the spot, it turns into a chargeback — three orders on this store did.

REMAINING GAPS — owner decision needed:
 - kundtjanst/sop/ is empty: 00-MASTER.md and the reason-code SOPs this file points at do not exist yet. The references are correct only once the rest of the set is written.
 - RESOLVED 2026-09-20: the tvister: config block now exists in brand-mall.yaml and is read by brands.mjs. For the first store it is filled from the shop's own published refund policy (return window and policy URL, read from the live page). Two values still need a human per store: the return address (support sends it by hand, it is not in the policy) and the billing descriptor (Shopify admin -> Settings -> Payments). Until those two are filled, the return and refund templates cannot be sent as-is.
 - Whether an order-number-to-order-id mapping is safe: several disputes carry raw Shopify order ids instead of #numbers, so 5053, 5418, 5289 were matched by amount + deadline, not read directly. Confirm with tvistfakta before acting on those rows.
 - Nobody has verified the card-network side of any of this. Every VERIFY item above needs one pass through a real Shopify admin by someone with access.
-->
