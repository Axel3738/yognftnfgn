# SOP-12: Reason `credit_not_processed` — "refund promised but not paid"

**Use this when:** the dispute page in Shopify admin shows reason **`credit_not_processed`** ("The customer informed you of a return or cancellation, but you haven't yet refunded or credited them").

**Do NOT use this SOP when:** the reason is `product_not_received`, `product_unacceptable`, `fraudulent`, `unrecognized`, `duplicate`, `subscription_canceled` or `general` — each has its own SOP in `kundtjanst/sop/`. Go by the **reason code shown in the admin**, never by the customer's story or by a list someone pasted to you.

**Owner:** customer-service VA · **Time:** 10–15 min per dispute · **Applies to:** every store — fill the config block once per store; the procedure below never changes.

**Language:** evidence is always written in **English**. The customer email goes in the language of the store's market — if a translated copy of the templates exists in the store's folder, use it; otherwise send the English version. Never machine-translate the evidence text.

> ⛔ **First portability check, 15 seconds.** This SOP describes the **Shopify Payments** dispute flow. If the store's payments run through Klarna, Stripe direct or another provider, the dispute does **not** appear in Shopify admin and none of the screens below exist — **ESCALATE to {{ESCALATION_CHANNEL}}** and stop. (Our own reader returns *"Butiken använder inte Shopify Payments — tvister syns bara hos betalleverantören"* on a 404, so this happens in real life.)

---

## 1. Decision table — read this first

**Four facts decide the case.** Get them before you read the table (section 3 has the exact clicks; the one-command version is 3.1):

1. **Inquiry or chargeback?** (dispute page says which — an inquiry asks for information, a chargeback means the money and the fee are already taken)
2. **Evidence due date** — how many days left
3. **Refunds on the order** — amount and date
4. **Did we promise a refund in writing?** — inbox **and** Sent folder search (step 3.2). *This is the fact the tool cannot see.*
5. (Only for rows 5–7) **Delivery scan** — delivered yes/no, and the date

**Read the rows top to bottom. The first row that matches wins.**

| # | What our own records show | Dispute is an **INQUIRY** | Dispute is a **CHARGEBACK** |
|---|---|---|---|
| 0 | **Evidence due date is today, passed, or the dispute has no response option at all** | Due today → finish and **Submit now** today. Passed / no response option → nothing can be submitted; log it and **ESCALATE**. | Same. |
| 1 | **The order number or the dispute cannot be found in this store** | **STOP.** The owner runs several stores — the order may belong to another one. Search the order number in each store you have access to, then **ESCALATE** with what you found. Do not guess and do not answer the customer yet. | Same. |
| 2 | **A refund was paid covering the full disputed amount** | **FIGHT — strong.** The refund receipt is the whole argument; the claim is factually wrong. | **FIGHT — strong.** Same evidence. |
| 3 | **A partial refund was paid**, customer disputes the rest | **FIGHT — check the numbers first.** Submit the receipt **and** one sentence on why no further refund is owed. Never leave the difference unexplained. | Same. |
| 4 | **We promised a refund in writing and never paid it** | **PAY WHAT WE PROMISED TODAY, then respond honestly** (section 5.4). Do not argue. If the promised amount is smaller than the disputed amount, pay it and explain the difference. | **ACCEPT — explicitly (section 6.2). Do NOT refund.** The money is already taken; refunding on top pays twice. |
| 4b | **A return or a refund was asked for in writing and we never answered it, or answered it weeks late** — no promise was made, so row 4 does not fire, but the customer did give us the chance we are about to say they never gave us | **Two things, in this order. (1) Answer the customer today** with the return address and who pays the return postage. **(2) Then decide:** the item was never returned and the amount is above `{{FIGHT_THRESHOLD}}` → **FIGHT — medium**, with the thread attached **complete and unedited** and one factual sentence admitting the delay; item returned, or amount below the threshold → **REFUND.** Never submit a thread with our silence trimmed out. | Same answer to the customer, but **lean to ACCEPT** — a chargeback loss is final and the delay is the first thing the issuer reads. |
| 5 | **No refund was ever requested or promised, no return received, and the carrier scan shows DELIVERED** | **FIGHT — strong.** Delivery scan + the "no refund was ever requested or promised" statement + the published policy. | **FIGHT — strong**, but expect a harder fight (section 5.2 and the win rates in section 8). |
| 6 | **No refund promised, and we cannot prove delivery** (no scan, or tracking stuck) | **REFUND IN FULL and stop.** We cannot win this and should not try. Send template E. | **ACCEPT — explicitly.** Do not refund, do not submit. |
| 7 | **Cancellation asked for inside {{RETURN_WINDOW_DAYS}} days but the parcel had already shipped** | **Grey — go to section 5.3.** Decide by amount. | Grey — same section, but lean to **ACCEPT**. |
| 8 | **No tracking number on the order at all** | **ESCALATE to {{ESCALATION_CHANNEL}}.** Fulfilment is broken; that is a bigger problem than this dispute. | ESCALATE. |
| 9 | Disputed amount is **below {{FIGHT_THRESHOLD}} {{CURRENCY}}** and no "strong" row above matched | **REFUND / ACCEPT.** Your time costs more than the order. | ACCEPT. |

> If `{{FIGHT_THRESHOLD}}` is **0**, row 9 never fires — the store fights everything by default. Only the owner changes that number.

**ACCEPT is a real, correct answer.** Shopify's help centre: *"If you agree that a chargeback is valid, then you can accept the chargeback without submitting evidence. The disputed amount is returned to the customer, and you aren't refunded for the chargeback fee."* Accepting is not an admission of wrongdoing.

> ⚠️ **Accepting is a click, not silence.** Shopify's help centre also says it *"automatically populate[s] available data that's used to send a response … for you on the due date"*. So if you do nothing, a response is sent anyway — that is **not** an acceptance, and that auto-response contains none of the three things that decide this reason code (refund receipt, policy text, "no contact" statement). **Accept explicitly (section 6.2) or submit real evidence. Never just let the date pass.**

---

## 2. Values to fill in

### 2.1 Store config — fill once per store, never inside the procedure text

Source of truth: `kundtjanst/brands/<store-id>.yaml` → block `tvister:` (template: `kundtjanst/brand-mall.yaml`). If the store has no file yet, create one from the template — **do not edit this SOP.**

| Placeholder | YAML key | Where to read it if the file is empty |
|---|---|---|
| `{{STORE_NAME}}` | `brand.namn` | Shopify admin → Settings → Store details |
| `{{STORE_DOMAIN}}` | public domain | Shopify admin → Settings → **Domains** → the **primary** domain (never the `.myshopify.com` one) |
| `{{SUPPORT_EMAIL}}` | `brand.supportmail` | Shopify admin → Settings → Store details → contact email |
| `{{RETURN_ADDRESS}}` | `tvister.returadress` | Ask the owner. One full postal block. |
| `{{RETURN_WINDOW_DAYS}}` | `tvister.returfonster_dagar` | Shopify admin → Settings → **Policies** → Refund policy |
| `{{POLICY_URL}}` | `tvister.policy_url` | The published policy page on `{{STORE_DOMAIN}}` |
| `{{CURRENCY}}` | `brand.valuta` | The currency on the order page |
| `{{FIGHT_THRESHOLD}}` | `tvister.strid_lonar_sig_over` | Owner's decision. `0` = fight everything |
| `{{ESCALATION_CHANNEL}}` | `discord.kanal` (default `customer-service`) | The store's support channel; tag the owner in it |
| `{{AGENT_NAME}}` | — | Your own first name |

*Example only, one Swedish store: `{{STORE_NAME}}` = Baverbutiken, `{{STORE_DOMAIN}}` = baverbutiken.se, `{{CURRENCY}}` = SEK, `{{RETURN_WINDOW_DAYS}}` = 14. These are illustrations, never the rule for your store.*

### 2.2 Per-case values — read fresh for every dispute

| Placeholder | Where to read it |
|---|---|
| `{{ORDER_NUMBER}}` | Order page → order name, without the `#` |
| `{{CUSTOMER_FIRST_NAME}}` | Order page → Customer block |
| `{{AMOUNT}}` | **Dispute page → disputed amount.** Not the order total — they can differ |
| `{{EVIDENCE_DUE}}` | Dispute page → evidence due |
| `{{TRACKING_NUMBER}}`, `{{CARRIER}}` | Order page → fulfilment → tracking |
| `{{SHIP_DATE}}` | Order page → **Timeline** → fulfilment created |
| `{{DELIVERY_DATE}}` | Carrier scan (17track / `tvistfakta` output). **Never estimate it** |
| `{{REFUND_AMOUNT}}`, `{{REFUND_DATE}}` | Order page → **Refunds** |
| `{{PROMISE_DATE}}` | The date on the email where we promised the refund |

---

## 3. Steps

### 3.1 Get the facts (2 minutes, one command)

```bash
node kundtjanst/tvistfakta.mjs <order number> --brand <store-id>
# tracking says "does not register, please register first"? Add --registrera (costs 17TRACK quota, waits ~20 s):
node kundtjanst/tvistfakta.mjs <order number> --brand <store-id> --registrera
```

It prints: dispute type, reason, amount, **evidence due date and days left**, refunds on the order, delivery scan, address match, and a suggested decision.

> ⚠️ **Always pass `--brand <store-id>`.** Without it the tool reads one default store and you will be looking at the wrong store's disputes with no error message.

> ⚠️ **The tool's `DECISION:` line is a suggestion, and it is blind in two ways.** (1) It cannot read the support inbox, so it does not know whether we promised a refund — **your inbox search in 3.2 overrules it.** (2) For this reason code it treats *any* refund amount above zero as "a refund was paid" — **compare the refunded amount with the disputed amount yourself** (row 2 vs row 3).

> ⛔ **Never** run `node sparning/kor.mjs --dagar 90` to check a dispute. That writes fulfilment events into Shopify for old orders and triggers delivery notifications to hundreds of customers months late.

**No terminal access?** Do it by hand, 4 minutes: Shopify admin → **Orders** → the order → read the **dispute banner** (type + due date), the **Refunds** section, and the **Timeline**; copy the tracking number into 17track.net in a browser.

### 3.2 Search the inbox for the order number — this step decides the case

Open the support mailbox for `{{SUPPORT_EMAIL}}` (webmail or mail client) and search **both** the INBOX **and** the **Sent** folder, for:

- the order number (with and without `#`),
- the customer's email address, and
- **the customer's surname.** Not optional. The address on the order belongs to whoever paid; the person who complains is often someone else in the same household. Measured on order 4446, 2026-09-22: the order carries `mia.lindqvist73@…`, the return request came from `fredrik.lindqvist74@…`, and the address search returned nothing while the surname search found it at once.

**Search the mailbox to its end.** The `mail_search` tool stops after 200 mails — on this mailbox that is 4 pages of 34, so "0 hits" from it means almost nothing. Run it properly and read the line that says how far it got:

```
node kundtjanst/mail.mjs sok "<surname>" --sidor 40
node kundtjanst/mail.mjs sok "<surname>" --mapp INBOX.Sent --sidor 40
```

⚠️ It searches sender and subject, not the body, so a message sent through the shop's **contact form** (the customer's words sit under `Text:`, the sender is Shopify) will not match a name search. Never write that a customer has not contacted us on the strength of a header search alone.

You are looking for two things:

> 1. Did anyone on our side write *"we will refund you"*, *"we will credit you"*, *"we have cancelled your order"*, or anything a customer would reasonably read as a promise?
> 2. Did the customer ask us for a return, a cancellation or a refund — and what did we answer, and how many days later?

- **Found a promise → we owe it.** Go to row 4. Do not argue.
- **Found nothing → write that down and say it in the evidence** (section 4). An empty inbox is a fact in our favour, but only if we state it — nobody reading the case can see our inbox.
- **Found a customer email we never answered, or answered weeks late** → **row 4b.** Answer it today, then decide. It is no longer a row 5 case, whatever the Shopify data looks like.

*(Worked EXAMPLE — measured 2026-09-20, one store, order 5122, a different reason code: support had missed the customer's return request entirely and the dispute was the first time anyone noticed. Always search before you write.)*

### 3.3 Check the refunds on the order

Shopify admin → the order → **Refunds**. Write down two facts: **amount refunded** and **date**. Compare the amount with the **disputed** amount from the dispute page.

*(Worked EXAMPLES — one store. Order 5763, reason `product_not_received`: 100 SEK refunded 2026-09-19 — when a refund exists, the receipt is the whole argument. Order 4446, 1262.20 SEK, the largest open amount: delivered 2026-08-13, **never any refund** — and it is the example of how this table gets read wrong. On 2026-09-20 it was written up as row 5, "no conversation with the customer at all". On 2026-09-22 a search on the customer's **surname** found his email of 2026-08-25 asking for a return, unanswered for 22 days: it is **row 4b**, not row 5, and the difference is a false statement to a bank. Row 5 requires that nothing was asked for. Prove that with the search in 3.2 before you believe it — and search the surname, not only the address on the order, because the person who complains is often not the person who paid.)*

> ⚠️ One order can carry **two separate disputes** (in the same sample, order 5053 had two, and order 5435 had one already won plus another still open). Winning one does not close the other. **Handle each dispute on its own dispute page.**

### 3.4 Check the clock

Read the evidence due date. If it is **today**, finish the case today and submit. If it has **passed**, or the dispute shows no response option, go to row 0.

### 3.5 Decide and record it

Take the decision from the table in section 1, then **write it into the order's Timeline** (Shopify admin → the order → Timeline → leave a comment). One line:

> `Dispute <reason> <amount> {{CURRENCY}}, due {{EVIDENCE_DUE}}. Inbox searched — [promise found / nothing found]. Decision: FIGHT / REFUND / ACCEPT / ESCALATE, because <one reason>. — {{AGENT_NAME}}, <date>`

The Timeline is visible to everyone with admin access and needs no repo access. Do this **before** you touch the evidence form, so the next person can see what you were thinking even if you are off sick tomorrow.

---

## 4. When the customer never contacted us at all

This is common. *(Measured 2026-09-20, one store: of the 12 disputes reviewed by hand, **at least 5 had no customer contact at all** before the bank was involved.)*

You do not apologise for the empty inbox — you **assert** it. Paste this into the free-text evidence:

> The customer never contacted {{SUPPORT_EMAIL}} about this order before filing the dispute. No refund, credit or cancellation was ever requested from us, and none was ever promised. Our support inbox and sent folder contain no message from this customer regarding order {{ORDER_NUMBER}}.

Then **email the customer anyway** (template A). A customer who withdraws the dispute is the cleanest possible win — and per Shopify's help centre, *"If your customer has agreed that the chargeback was a mistake, then only your customer can reverse it"*: **we cannot withdraw it for them.**

> Still submit the evidence on time even if the customer promises to withdraw. A promise is not a withdrawal, and after the due date nothing more can be sent.

---

## 5. The four shapes this reason code takes

### 5.1 We promised and paid → FIGHT

Evidence, in this order:

1. **The refund receipt:** amount, date, screenshot of the order's **Refunds** section.
2. **The email where we promised it** — it shows we honoured our own policy.
3. **One line of free text:** *"A refund of {{REFUND_AMOUNT}} {{CURRENCY}} was issued on {{REFUND_DATE}}, before this dispute was filed. See attached receipt."*

If the refund was **partial**, add one sentence saying what the remaining amount covers (shipping already performed, goods kept, and so on). Never leave the difference unexplained.

### 5.2 We never promised anything and the goods were delivered → FIGHT

Build the pack from these four items **and nothing else** — relevance beats volume, and irrelevant pages hide your argument:

1. **Delivery proof:** carrier, tracking number, ship date, delivery date **from the carrier scan**.
2. **The "no refund was ever requested or promised" statement** from section 4.
3. **The policy text as published** at `{{POLICY_URL}}`: the return window, how a return is started, and that a refund follows a returned item. Paste the text — do not rely on anyone opening a link.
4. **Where the customer saw that policy before paying** (checkout footer link / policy page) plus the order confirmation.

> ⚠️ Before you submit, be honest about the one thing that sinks this case: if support **did** promise a refund in an email you have not read, the argument collapses. That is why step 3.2 comes first.

### 5.3 Cancellation asked for inside the window, but the parcel had already shipped — the grey one

*(Worked EXAMPLE — measured 2026-09-20, one store, order 5435: the customer asked to cancel 13 days after ordering, inside a 14-day published window, but the parcel had already left and was delivered 2026-09-10.)*

Rules:

- **Do not claim the cancellation was invalid.** It was made inside the window. What changed is that the goods were already in transit, so the remedy is a **return**, not a cancellation.
- Send **template B today**, with `{{RETURN_ADDRESS}}`, and keep the return open even while the dispute runs.
- **Decide by amount:** below `{{FIGHT_THRESHOLD}} {{CURRENCY}}` → refund in full (inquiry) or accept (chargeback), and take the return when it arrives. Above it → fight with policy + the written return offer.
- If you fight, the argument is exactly this chain: policy disclosed before purchase → cancellation received **after** dispatch on {{SHIP_DATE}} → return path offered in writing on <date> → no goods returned to date.

> ⚠️ Do **not** state as fact that a shipped parcel removes the customer's right to cancel. Consumer law differs per country and we have not verified it for any market. Argue only what we can prove: the published policy text, the dispatch date, and the return offer we made.

### 5.4 We promised and did not pay → pay it, do not argue

**Inquiry:** Shopify admin → the order → **Refund** → enter what was promised → **Refund**. Do it **today**, before you touch the dispute. Then go back to the dispute page and check it:

- If the dispute closes by itself, you are done — note it in the Timeline.
- If it still asks for a response, respond with one honest paragraph: *"A refund of X {{CURRENCY}} was promised on {{PROMISE_DATE}} and was paid in full on <today's date>. We are not contesting this dispute."* Attach the refund receipt.
- **VERIFY IN SHOPIFY ADMIN:** that the refund actually shows under **Refunds** and that the dispute status changed. Shopify's help centre says a **full** refund can resolve an inquiry — do not assume it did, look.

Send **template D**.

**Chargeback:** **do not refund.** The money is already gone; a refund on top pays the customer twice out of the store's pocket. Accept explicitly (section 6.2) and send template D **without** the payment sentence.

> ⛔ **Never refund and fight the same amount at the same time.** Pick one, write it in the Timeline, and stick to it.

---

## 6. Where the evidence goes

### 6.1 Submitting evidence (FIGHT only)

Shopify admin → **Orders** → the disputed order → the chargeback/inquiry banner → **Add evidence** → fill → **Save** → **Submit now** only when you are finished.

> ⚠️ The admin form's visible field labels have changed over time and are not documented anywhere we control. **Match by meaning, not by wording.** If your store only shows a short form with one free-text box and file uploads, put everything below into that box in the same order.

| Put this | Looks for a field about… | Underlying field name (may not be visible) |
|---|---|---|
| The refund policy text as published | refund policy / policy disclosure | `refund_policy_disclosure` |
| Why no refund (or no further refund) is owed | refund refusal explanation | `refund_refusal_explanation` |
| The cancellation policy, when 5.3 applies | cancellation policy | `cancellation_policy_disclosure` |
| Why the cancellation did not end in a refund | cancellation rebuttal | `cancellation_rebuttal` |
| "The customer never contacted us…" + the refund receipt facts | additional details / free text | `uncategorized_text` |
| Carrier, tracking number, ship date, delivery date | shipping / fulfilment | `fulfillments` |
| Customer email, first name, last name | customer details | `customer_email_address`, `customer_first_name`, `customer_last_name` |
| Shipping and billing address (say whether they match) | addresses | `shipping_address`, `billing_address` |
| The full email thread as one PDF | customer communication file | customer-communication file slot |

**Files.** Shopify's help centre states: PDF, JPEG or PNG · 2 MB per file · 4 MB combined · fewer than 50 pages · cropped, high contrast, legible; one file per evidence type, so combine same-type documents into one PDF. **VERIFY at the upload step** — the dialog states the accepted types and sizes for your store. Keep the pack short: a handful of legible pages beats fifty. No links to Drive or to our own site — assume nobody clicks anything.

**Timing.** You can edit and **Save** until you submit; **Submit now** is final, and after the due date nothing further can be sent. So: save early, submit on the last useful day, and if a delivery scan is still pending, wait for it — but never past `{{EVIDENCE_DUE}}`.

### 6.2 Accepting (ACCEPT rows)

Open the same dispute page and use the admin's own **accept** action for the dispute, then write in the order Timeline: *"Accepted, reason: <row number and one line>."*

> **VERIFY IN SHOPIFY ADMIN: the dispute page for the accept option.** If you cannot find one, **do not just walk away** — Shopify will auto-send a response on the due date, which is not an acceptance. Ask in {{ESCALATION_CHANNEL}} the same day.

### 6.3 After you submit

Check the dispute status again after a few days and record the outcome in the order Timeline. Nobody appeals an outcome (there is no appeal action in the admin) — if a decision looks wrong, escalate to the owner and never promise the customer an appeal.

---

## 7. Email templates

**Email the customer in every case — FIGHT, REFUND and ACCEPT alike.** Submit evidence only when the decision is FIGHT. Send from `{{SUPPORT_EMAIL}}` so the thread lands in the Sent folder: today's email is the next person's evidence. Keep the order number in the subject line so replies thread correctly.

### Template A — no conversation, no refund ever promised

> **Subject:** About your card dispute — order {{ORDER_NUMBER}}
>
> Hi {{CUSTOMER_FIRST_NAME}},
>
> Your bank has contacted us about order {{ORDER_NUMBER}} ({{AMOUNT}} {{CURRENCY}}), saying that a refund was promised but not paid.
>
> We have checked the order and our support inbox, and we have no record of a refund request from you, and no refund or cancellation was agreed by us. The order was shipped and the carrier recorded it as delivered to your address on {{DELIVERY_DATE}} (tracking {{TRACKING_NUMBER}}, {{CARRIER}}).
>
> If something is wrong with the order, we still want to fix it — that is faster than going through your bank. Reply to this email and tell us what happened, and we will either arrange a return under our {{RETURN_WINDOW_DAYS}}-day policy ({{POLICY_URL}}) or sort it out another way.
>
> If the dispute was opened by mistake, please contact your bank and ask them to withdraw it. Only you can do that — we cannot cancel it from our side.
>
> Best regards,
> {{AGENT_NAME}}
> {{STORE_NAME}} · {{SUPPORT_EMAIL}}

> ⚠️ **Delete the delivery sentence if you do not have a carrier scan.** Never write "delivered" from a shipping label, an estimate or a guess — one invented delivery date destroys every case we argue afterwards.

### Template B — cancellation inside the window, parcel already shipped

> **Subject:** Your cancellation and return — order {{ORDER_NUMBER}}
>
> Hi {{CUSTOMER_FIRST_NAME}},
>
> You asked to cancel order {{ORDER_NUMBER}} within our {{RETURN_WINDOW_DAYS}}-day window, and you were right to do so. The problem on our side was timing: the parcel had already been handed to the carrier on {{SHIP_DATE}}, so it could not be stopped.
>
> That does not cost you the refund. Send the item back to us and we will refund it as soon as it arrives:
>
> {{RETURN_ADDRESS}}
>
> Please write order {{ORDER_NUMBER}} on or inside the parcel so we can match it to you, and send us the return tracking number when you have it.
>
> Our full policy is here: {{POLICY_URL}}
>
> If you have already opened a dispute with your bank, you can let it run — but the fastest way to your money is the return above. If you would rather withdraw the dispute, you need to contact your bank yourself, as we cannot withdraw it for you.
>
> Best regards,
> {{AGENT_NAME}}
> {{STORE_NAME}} · {{SUPPORT_EMAIL}}

### Template C — the refund was already paid

> **Subject:** Your refund for order {{ORDER_NUMBER}} was already paid
>
> Hi {{CUSTOMER_FIRST_NAME}},
>
> Your bank contacted us about order {{ORDER_NUMBER}}, saying a refund is outstanding.
>
> We refunded {{REFUND_AMOUNT}} {{CURRENCY}} on {{REFUND_DATE}}, back to the card you paid with. Refunds can take a few working days to appear on a card statement, and they sometimes show up under the original purchase line rather than as a separate entry — it is worth checking your statement around that date.
>
> We have included the refund receipt in our response to the dispute. If you still cannot find the money after checking, reply here with a screenshot of the statement and we will chase it with our payment provider.
>
> Best regards,
> {{AGENT_NAME}}
> {{STORE_NAME}} · {{SUPPORT_EMAIL}}

### Template D — we promised it and did not pay (we are in the wrong)

> **Subject:** Your refund for order {{ORDER_NUMBER}} — paid today
>
> Hi {{CUSTOMER_FIRST_NAME}},
>
> You are right, and I am sorry. We agreed to refund order {{ORDER_NUMBER}} on {{PROMISE_DATE}} and it was not paid out. I have issued the refund of {{AMOUNT}} {{CURRENCY}} today; it goes back to the card you paid with and usually appears within a few working days.
>
> We are not contesting the dispute with your bank — the refund is simply ours to pay, and it has been paid.
>
> Thank you for your patience.
>
> {{AGENT_NAME}}
> {{STORE_NAME}} · {{SUPPORT_EMAIL}}

> ⚠️ **Template D as written is for an INQUIRY.** On a real chargeback the money is already taken: accept the dispute, issue **no** refund, and send the same apology with the payment sentence replaced by: *"Your bank has already returned the amount to you, so there is nothing further for us to pay — we are not contesting it."*

### Template E — we are refunding because we cannot prove delivery (rows 6 and 9, inquiry)

> **Subject:** Refund for order {{ORDER_NUMBER}}
>
> Hi {{CUSTOMER_FIRST_NAME}},
>
> We have looked at order {{ORDER_NUMBER}} and we cannot confirm that the parcel reached you. We are not going to argue about that — we have refunded {{AMOUNT}} {{CURRENCY}} today, back to the card you paid with. It usually appears within a few working days.
>
> If the parcel does turn up later, just reply to this email and we will sort it out then. Sorry for the trouble.
>
> Best regards,
> {{AGENT_NAME}}
> {{STORE_NAME}} · {{SUPPORT_EMAIL}}

---

## 8. What we know, and what we must not claim

**Measured on one store, 2026-09-20 — 50 disputes. These are our own numbers, not card-network rules, and one store is a small sample:**

- **Inquiries: 43 in total, 29 decided, 29 won, 0 lost (100 %). Chargebacks: 7 in total, 4 decided, 1 won, 3 lost (25 %).** Every loss that store has ever had was a chargeback; total lost 1 435 SEK.
- **An unanswered inquiry was not lost on the spot — it escalated into a chargeback with a new deadline.** Three of our own disputes went that way (#4914, #5044, #4706). That is the measured cost of ignoring an inquiry; do not turn it into a rule about how the networks work.
- In the first live run of the dispute tool, **3 of 17 open disputes were never delivered and should be refunded rather than fought** (#5584, #6556, #6389 — 2 125 SEK). A delivery scan is the single signal that has decided outcomes in this data.
- **All twelve dispute orders checked were too old for the tracking routine's 14-day window** and had to be registered with 17TRACK before their scans could be read. That costs quota — it is a real step, not a bug.
- Of the 12 disputes reviewed by hand, at least 5 had **no customer contact at all** before the bank was involved.

**Documented by Shopify's own help centre, safe to rely on:** an inquiry means no money has been taken yet, a chargeback means the amount and the fee are already withdrawn; you can accept a chargeback without submitting evidence; you cannot issue a refund once a chargeback has started; evidence can be edited until you submit and submission is final; if you submit nothing, Shopify sends an auto-built response on the due date.

**Never state these as fact — they are not verified:**

- that an unanswered dispute is automatically lost (**false for inquiries in our own data**);
- that an unanswered inquiry *always* becomes a chargeback — it *can* escalate, and ours did; that is an observation, not a rule;
- **any deadline length** ("7 days", "21 days"): the due date is printed on the dispute page — **read it there**;
- **any page limit** beyond what the upload dialog itself states;
- **the chargeback fee amount** → **VERIFY IN SHOPIFY ADMIN: Finances → Payouts → the payout containing the chargeback; the fee is a line item there.**
- the effect of a **partial** refund on an inquiry (only a full refund is documented as an inquiry-killer);
- any win-rate percentage per reason code beyond the counts above;
- any single number for how long the bank takes to decide — Shopify's own pages give several different ranges. Tell the customer "weeks, not days", or say nothing.

**Look these up instead of guessing:**

- **VERIFY IN SHOPIFY ADMIN: Settings → Policies → Refund policy** — the exact wording this store published.
- **VERIFY IN SHOPIFY ADMIN: the order's dispute banner** — whether this dispute has a response option at all. Not every dispute does; some are resolved by the network's own programmes.
- **VERIFY IN SHOPIFY ADMIN: the Refund button on a disputed order.** If it is still clickable on an open **chargeback**, do not use it — ask in {{ESCALATION_CHANNEL}}.

---

## 9. Never do this

- Never let a due date pass instead of accepting — silence sends an auto-response, not an acceptance.
- Never refund on an open chargeback.
- Never refund and fight the same amount at the same time.
- Never write a delivery date you did not read from a carrier scan.
- Never argue consumer law. Argue the policy text, the dispatch date, and what we offered in writing.
- Never run `node sparning/kor.mjs` to investigate a dispute.
- Never answer a customer before you know which store the order belongs to.
- Never machine-translate evidence.

---

## 10. Definition of done

- [ ] Store is on Shopify Payments (otherwise escalated and stopped).
- [ ] `tvistfakta` run with `--brand`, or the facts read by hand: dispute type, evidence due date, refunds on the order, delivery scan.
- [ ] Support inbox **and** Sent folder searched for the order number **and** the customer's email address — result written down, including "nothing found".
- [ ] Decision taken from the table in section 1 and written into the order **Timeline**: FIGHT / REFUND / ACCEPT / ESCALATE, with one line of reason.
- [ ] If FIGHT: refund receipt or the "no refund was ever requested or promised" statement, the policy text, where it was disclosed, and the delivery details are all in the form; files legible and within the limits shown at upload.
- [ ] If we promised and did not pay: inquiry → promised amount refunded today and the refund verified under **Refunds**; chargeback → **accepted explicitly**, no refund issued.
- [ ] If ACCEPT: the accept action was actually clicked (not just left alone).
- [ ] Customer emailed with template A, B, C, D or E, with the withdrawal ask where it applies, from `{{SUPPORT_EMAIL}}`.
- [ ] Evidence **Saved**; **Submit now** pressed only when nothing more is coming, and always before `{{EVIDENCE_DUE}}`.
- [ ] Outcome noted in the order Timeline when the dispute closes (and in the weekly report folder `kundtjanst/korningar/<store>/` if you have repo access), so the next person sees what worked.

## ⚠️ Gaps in this SOP

- [ ] Consumer-law position when a cancellation lands after dispatch (5.3) — not verified for any market; argue facts, not law.
- [ ] Whether the Shopify admin exposes every evidence field in 6.1, or only a short free-text form — varies, so the SOP says match by meaning.
- [ ] Whether the admin's accept action exists on every plan and every dispute type (6.2) — the owner should confirm once per store and write the exact button name into the store's config folder.
- [ ] `{{FIGHT_THRESHOLD}}` is `0` (fight everything) until the owner sets a real number per store.
- [ ] The brand file has **one** window (`returfonster_dagar`). If a store publishes a separate cancellation window and return window, the owner must add the second value before 5.3 can be answered correctly.
- [ ] No language key exists in the brand file; until one does, the customer-email language is the VA's judgement per market.
- [ ] Non-Shopify-Payments stores (Klarna, Stripe direct) have no procedure here at all — they need their own SOP.

<!--
REVIEW: fixed 27 defects.

INVENTED / UNVERIFIED RULES REMOVED OR REFRAMED (8):
 1. "evidence due dates run 7-21 days from filing" — deleted; replaced with "read the due date on the dispute page".
 2. "Stripe's stricter page cap for Mastercard is 19 pages, so staying under 19 satisfies both" — deleted (unverifiable, and it contradicted the "<50 pages" line in the same section).
 3. "a bank decision is final and cannot be appealed" as fact — reframed as "there is no appeal action in the admin; escalate, never promise an appeal".
 4. "a full refund ends an inquiry" as fact — reframed: Shopify says it can; the VA must verify the dispute status changed.
 5. File limits stated bare — attributed to Shopify's help centre + "VERIFY at the upload step".
 6. "you can't issue a refund after a chargeback" — kept, plus a practical VERIFY (if the Refund button is still clickable, do not use it).
 7. "11 of 12 disputed parcels were confirmed delivered" — unsupported; replaced with the repo-measured numbers (43 inquiries / 7 chargebacks, 29-0 and 1-4, 1 435 SEK lost, 3 of 17 open never delivered, all 12 needed 17TRACK registration).
 8. "most of these customers wrote nothing" — replaced with the counted figure (at least 5 of the 12 reviewed).

CORRECTNESS / LOGIC (6):
 9. ACCEPT-by-inaction bug: the SOP said "ACCEPT. Nothing to submit." while also quoting Shopify's auto-response on the due date. Doing nothing is NOT accepting — added an explicit accept step (6.2) and a warning in section 1.
10. "Send the email AND submit evidence. They are not alternatives." contradicted every ACCEPT row — corrected to "email always, submit evidence only on FIGHT".
11. Row 4 said "pay in full today, then ACCEPT" on an inquiry — an inquiry may close on the refund and may offer nothing to accept; rewritten as pay -> re-check -> respond honestly (5.4), and "pay what was promised" when the promise was partial.
12. Template C claimed "we have sent the refund receipt to your bank" — corrected to the dispute response.
13. Template A asserted a delivery date unconditionally — guard added: delete the sentence without a carrier scan, never estimate.
14. Added "never refund and fight the same amount at once".

MISSING BRANCHES the data demanded (4):
15. Row 1: order/dispute not found in this store (the "4825 — what store? no record of chargeback" case in the owner's own list).
16. Shopify-Payments check at the top: our reader returns an explicit 404 branch for stores on Klarna/Stripe, where none of these screens exist.
17. Row 0: due date today / passed / no response option.
18. Added the measured escalation fact (#4914, #5044, #4706 went inquiry -> chargeback) as motivation, without dressing it up as a network rule.

PORTABILITY (4):
19. `tvistfakta.mjs` silently defaults to ONE hardcoded store when `--brand` is omitted — warning added.
20. `{{STORE_DOMAIN}}` sourcing was vague ("derived from brand.shop") — now an exact admin path, with "never the .myshopify.com domain".
21. Eleven placeholders used in the templates ({{ORDER_NUMBER}}, {{CUSTOMER_FIRST_NAME}}, {{AMOUNT}}, {{EVIDENCE_DUE}}, {{SHIP_DATE}}, {{DELIVERY_DATE}}, {{TRACKING_NUMBER}}, {{CARRIER}}, {{REFUND_AMOUNT}}, {{REFUND_DATE}}, {{PROMISE_DATE}}) were never defined — new per-case table 2.2.
22. Customer-email language was undefined for non-English markets — rule added, evidence stays English.

ACTIONABILITY (5):
23. ESCALATE had no destination — {{ESCALATION_CHANNEL}} added to the config block (maps to discord.kanal).
24. "Write it into your handover note" was vague — now an exact place (order Timeline) with a copy-pasteable one-line format, usable without repo access.
25. No navigation for how to actually refund or accept — added (Refund button path, accept action, VERIFY steps).
26. The evidence table led with API field names a VA cannot find in the UI — rewritten as what-to-write / what-the-field-is-about, API names demoted to a third column, plus instructions for the short one-box form.
27. Added the two blind spots of the tool's DECISION line (it cannot see the inbox; it counts any refund > 0 as "refund paid"), a "Never do this" list, and an "after you submit" step.

CANNOT BE RESOLVED WITHOUT THE OWNER:
 - {{FIGHT_THRESHOLD}} is still 0 (fight everything) for every store until the owner sets a per-store number; row 9 is dead until then.
 - Whether the admin's accept action and the full evidence field set exist on this plan — one person needs to open a real dispute once and write the exact button names into the store config.
 - Separate cancellation window vs return window: the brand file has only one value.
 - Consumer-law position after dispatch, per market.
 - Non-Shopify-Payments stores (Klarna/Stripe direct) need their own SOP; this one escalates them.
 - Worked examples (orders 4446, 5435, 5122, 5763, 5053) are from one store on 2026-09-20 and are marked as examples; they are not verifiable from this SOP alone, so a second store's numbers should be added before the win rates are treated as typical.
-->
