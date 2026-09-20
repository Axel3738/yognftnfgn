# SOP 13 — Reason: fraudulent / unrecognized charge

**Use this when:** the Shopify dispute reason reads `fraudulent` or `unrecognized` — the cardholder says they did not authorise the charge, or does not recognise the name on their statement.
**Do not use this when:** the reason reads anything else (`product_not_received`, `credit_not_processed`, `product_unacceptable`, `duplicate`, `general`). Go back to `kundtjanst/sop/00-MASTER.md` and pick that reason's SOP.

**Owner:** customer-support VA. **Time:** 10–20 min per dispute. **Index:** `kundtjanst/sop/00-MASTER.md`.
**Language:** this SOP is in English. **Write to the customer in the store's own selling language** (`brand.land` in the store's brand file: `SE` → Swedish, `NO` → Norwegian, `US`/`GB` → English). Translate templates A–C once per store and keep the translation next to the brand file — do not machine-translate a fresh one every time.

These two codes look identical in the admin and are handled almost identically, but they are *not* the same claim:

| Reason code | What the cardholder is saying | What it usually turns out to be |
|---|---|---|
| `unrecognized` | "I don't recognise this name on my statement." | Statement descriptor confusion, a household member ordered, or they bought from a sibling store. |
| `fraudulent` | "My card was used without my permission." | Sometimes real card fraud — and real card fraud is accepted, not fought. |

⚠️ **The right-hand column is reasoning and payment-provider guidance, not our measurement.** We have **zero** disputes on these two codes in our own data (see *Gaps*). Decide from the table below, then log what actually happened.

---

## 0. First 60 seconds — four stop checks before anything else

Run this first. It is read-only: it changes no dispute, sends no evidence, moves no money.

```bash
node kundtjanst/tvistfakta.mjs <order number> --brand <store id>      # add --registrera if tracking is unread
node kundtjanst/tvistfakta.mjs --alla --brand <store id>              # every open dispute in the store
```

⚠️ **Always pass `--brand <store id>`.** With no `--brand` the tool reads one default store and will answer *"No dispute found for order N"* even when the dispute exists in yours.
**No terminal, or the tool says "Shopify is not connected":** every step below has an admin path. Use those and skip the commands.

Read the top four lines of the output and stop if any of these is true:

| Stop check | Where you read it | If true |
|---|---|---|
| **A. Is it in this store?** | Line 1 names the order; or Shopify admin → **Orders → Search and filter → Add filter → Chargeback and inquiry status → Open** | Not here → **step 3**, do not write anything |
| **B. Is the reason one of ours?** | `Reason:` on line 2 | Not `fraudulent`/`unrecognized` → wrong SOP, go to `00-MASTER.md` |
| **C. Is the due date already gone?** | `Evidence due: … (N day(s) OVERDUE)` | Overdue → you cannot submit. Log the outcome, tell the owner today, **do not** start an evidence pack |
| **D. How many disputes on this order?** | The tool prints **one block per dispute** and ends with `N dispute(s) in <store>` | More than one → answer **each** on its own dispute page, with the same evidence pack |

Also write down now, before you forget: **inquiry or CHARGEBACK** (line 1 prints `INQUIRY` or `🔴 CHARGEBACK`) and the **evidence due date**. Everything below depends on those two.

- **CHARGEBACK** = the money is already taken; the bank decides on what it has, so no evidence means nothing to decide in our favour.
- **INQUIRY** = the bank is only asking. An unanswered inquiry is not lost on the spot — it **escalates into a chargeback**, which is where the losses are.
- **`Evidence due` is the only deadline that counts.** Bank review times are stated inconsistently in Shopify's own material — **never promise the customer or the owner a date.**
- **Due today or tomorrow?** Build the evidence first and email second. Never let an email wait push you past the date.

---

## 1. Decision table — read this, decide, write the row number in your note

The two columns that decide everything: **do billing and shipping match** and **is there a delivery scan**.

| # | What the facts show | Decision | Case strength |
|---|---|---|---|
| 1 | Addresses **match** + delivery scan on the cardholder's own address | **FIGHT** | strong |
| 2 | Row 1 **and** the same card paid for an earlier order that was never disputed | **FIGHT**, name the other order | strongest we get |
| 3 | Addresses **match**, parcel **not delivered** (stuck, no scan, still in transit) | INQUIRY → **full refund now**. CHARGEBACK → **Accept**. Nothing proves the cardholder received anything | lost |
| 4 | Addresses **DIFFER** and nobody can link the cardholder to the delivery address | **ACCEPT + flag the order** — this is what real card fraud looks like | lost |
| 5 | Addresses **DIFFER**, but the cardholder has told us **in writing** it is a gift / work / second address | **FIGHT** and attach that email | medium |
| 6 | Order was already **fully refunded** | **RESPOND with the refund proof** — silence here means we pay the same money twice | strong |
| 7 | Customer replies "that was my husband / my son / my colleague" | Template **C** (only they can withdraw it) **and** keep building evidence until the bank confirms | strong |
| 8 | Customer confirms the card was stolen, **or** Shopify flagged the order high-risk, **or** several orders on one card went to different addresses | **ACCEPT + flag + advise card reissue** | do not fight |
| 9 | **No tracking number on the order at all** (tool prints `Tracking NONE` and `DECISION: ESCALATE`) | **Escalate to the owner today.** Fulfilment is broken; there is nothing to prove | unknown |
| 10 | `Billing matches shipping:` prints **`null`** or **`undefined`** | Not a decision. Open the order, compare street + postal code by eye, then re-enter this table | — |

**Amount cut-off (check before you invest 20 minutes):** if `tvister.strid_lonar_sig_over` = **{{FIGHT_THRESHOLD}} {{CURRENCY}}** is set above 0 and the disputed amount is at or below it, stop and take the cheap ending — inquiry: full refund; chargeback: **Accept**. ⚠️ **The key ships as `0`, which means "always fight". If it is 0 or empty, this cut-off does not apply — do not invent a number. Ask the owner once and have it written into the brand file.**

### What the tool's own verdict means — and when the table overrides it

| Tool prints | What it is based on | What you do |
|---|---|---|
| `DECISION: FIGHT (strength: strong)` | Billing matches shipping | Rows 1–2 — but **check the delivery scan yourself** |
| `DECISION: FIGHT (strength: medium)` | Address match could not be read | Row 10 first: resolve the addresses by eye |
| `DECISION: REFUND` | Billing and shipping do **not** match | Row 4 |
| `DECISION: ESCALATE` | No tracking number on the order | Row 9 |

⚠️ **Known gap in the tool, on these two codes only:** for `fraudulent`/`unrecognized` it decides on the address match and **does not weigh the delivery scan**. So it can print `FIGHT — strong` on a parcel that was never delivered. **When there is no delivery scan, row 3 wins over the tool.** Note it in your log; the tool is being corrected.

**Genuine card fraud is accepted, not fought.** Our payment provider's own guidance is blunt about it: *"If you believe the payment was indeed fraud, the appropriate action is to either accept the dispute or decline to challenge it."* Fighting it burns 20 minutes, loses, and the dispute still counts against the store. **Accepting is not an admission of wrongdoing.**

> **Measured on our own data, 2026-09-20 (50 disputes, one store):** 29 of 29 decided **inquiries were won (100 %)**; **chargebacks stood at 1 won of 4**. Every loss we have ever had was a chargeback. Three orders (#4914, #5044, #4706) went in first as an inquiry and came back later as a chargeback — that is what ignoring an inquiry costs.
> ⚠️ Never write "an unanswered dispute is lost automatically" into this or any other SOP. Measured false for inquiries.

---

## 2. The address check — what `adressmatch` means, and why it decides the case

`node kundtjanst/tvistfakta.mjs` prints `Billing matches shipping: true / false / null`. Know exactly what that is:

- **What it is:** our own comparison of the two addresses *on the same order* — billing `address1` + `zip` against shipping `address1` + `zip` (`kundtjanst/tvistfakta.mjs`).
- **What it is NOT:** the bank's AVS result. AVS is the card issuer checking the address the buyer typed against the address the bank holds for that card. We do not compute that.
- **Why `true` still wins cases:** it shows the goods went to the cardholder's own billing address. Someone using a stolen card does not usually ship the parcel to the victim's front door. This is the single strongest answer to "I didn't authorise this".
- **`null`** = one of the two addresses is missing on the order. **`undefined`** = the order itself could not be read. Neither is a verdict — open the order (**Orders → open the order → Customer / Shipping address / Billing address**) and compare by eye.
- **Measured 2026-09-20:** all 12 disputed orders read in that store had billing == shipping. A mismatch is therefore *unusual for us* — treat it as a real signal, not noise.

**VERIFY IN SHOPIFY ADMIN (once per store, then write the answer into this SOP):** Shopify's own AVS / CVV / IP verdict for an order — **Orders → open the order → the fraud-analysis / risk section**. The labels there are not documented, so note what you actually see. If you find an explicit "billing address matches the card's registered address" line, that outranks our comparison as evidence — use it.

### When the addresses DIFFER

1. Do **not** submit evidence yet.
2. Email the cardholder (template A) and ask plainly who the delivery address belongs to. ⚠️ **Write the delivery city and postal code only — never the full street address.** It may belong to a third party, and the mailbox on the order may not be the cardholder's.
3. Written confirmation from the cardholder that it is their gift recipient / work / second address → row 5: fight, attach that email.
4. No reply, or "I have no idea what that address is" → row 4: **accept the dispute, flag the order, and check whether other orders share that address, email or card.**
   - Same email: **Orders → Search and filter → search the customer's email address.**
   - Same card: open each of those orders → the payment section shows the card brand and **last 4 digits**; compare by eye.
   - Two or more orders on one card going to different addresses → tell the owner **the same day** (step 9).

---

## 3. Which store is this? (30 seconds, saves an hour)

`unrecognized` is the one reason code where the customer may be right that they never heard of us and still owes us money — they bought from a **sibling store** with a different name.

1. Confirm the dispute exists in **this** store: **Orders → Search and filter → Add filter → Chargeback and inquiry status → Open**.
2. No dispute on that order number here? It is not this store's dispute. Search the order number in the other stores' admins before you answer anything.
3. *Worked example, one store, 2026-09-20:* order 4825 existed in the store and was delivered, but had **no dispute at all** in that store's Shopify Payments. The VA's note read "what store? No record of chargeback" — correct, and the right answer was to stop, not to write evidence.

---

## 4. Check the billing descriptor the customer actually saw

This is the whole case for most `unrecognized` claims: the statement says something the customer does not connect to their purchase.

1. Our stored value: `tvister.billing_descriptor` in `kundtjanst/brands/<id>.yaml` → **{{BILLING_DESCRIPTOR}}**.
2. Empty, or you want to be certain: **VERIFY IN SHOPIFY ADMIN: Settings → Payments → (Shopify Payments) Manage → the customer billing statement / statement descriptor field.** Copy it verbatim — capitals, city, phone suffix and all.
3. If it does **not** contain a recognisable form of {{STORE_NAME}} or {{STORE_DOMAIN}}, you have found the root cause: fill it into the brand file, tell the owner it should be changed, and say in your evidence that the descriptor differs from the shop name.
4. Quote the exact descriptor in the customer email. "Look for **{{BILLING_DESCRIPTOR}}** on your statement" closes cases that no evidence pack can.

---

## 5. Check tracking before you write anything

Possession is the proof. No delivery scan, no possession argument (row 3).

1. `node kundtjanst/tvistfakta.mjs <order> --brand <store id> --registrera`
2. ⚠️ Parcels older than the tracking routine's 14-day window are **not registered with 17TRACK** and come back as *"does not register, please register first"*. Registering is a real step and it **costs quota**; `--registrera` does it for one parcel and waits ~20 seconds. *Measured 2026-09-20: all twelve dispute orders needed registering.* If the quota is spent, use point 3.
3. **No tool, or registration fails:** Shopify admin → the order → **Fulfillment** → copy the tracking number → paste it on 17track.net in a browser. Works for every store.
4. ⛔ **Never** run `node sparning/kor.mjs --dagar 90` (or any wide window) to look up a dispute. A sharp run writes delivery events into Shopify and would send "delivered" emails to hundreds of customers months late.
5. **Read the milestone, not the label.** A scan with a **date** ("DELIVERED 2026-09-11") is evidence. `InfoReceived` is not — it means the carrier has the label and nothing else. *(Worked example: an order sat at `InfoReceived` from 2026-08-20 and never moved. Row 3 territory: refund, do not fight.)*

---

## 6. Talk to the customer — and understand what that can and cannot do

Documented by Shopify: *"If your customer agrees that the chargeback or inquiry isn't necessary, then they must contact their bank and ask them to cancel the chargeback or inquiry"* and *"only your customer can reverse it."*

So: **you cannot withdraw a dispute. Only the cardholder can.** Your email has one job — get them to call their bank. Keep working the evidence in parallel. **Never wait for a reply past two days before the due date** — at that point decide on the facts you have and say in the evidence that we wrote and got no answer.

Whether the customer tried to contact us before disputing is itself evidence: *"If they didn't reach out to you before the dispute, state that clearly."* **"No conversation" is never something to hide or apologise for. Say it plainly.**

⚠️ **On `fraudulent` with mismatched addresses, assume the mailbox on the order may belong to whoever used the card.** Never send card digits, never send the full delivery address, never send another customer's details. Keep it short and ask questions instead of stating facts.

### Template A — unrecognized / unauthorised, first contact

> **Subject:** About the charge from {{STORE_NAME}} — order {{ORDER_NUMBER}}
>
> Hi {{CUSTOMER_FIRST_NAME}},
>
> Your bank has told us that the payment of {{AMOUNT}} {{CURRENCY}} from {{DATE}} was reported as unrecognised or unauthorised. I would like to help you work out what it is, and I would much rather do that with you directly than through the bank.
>
> Here is exactly what we have on file:
>
> - Order {{ORDER_NUMBER}}, placed {{ORDER_DATE}}
> - Items: {{ITEMS}}
> - Total: {{AMOUNT}} {{CURRENCY}}
> - Ordered in the name of {{CUSTOMER_FIRST_NAME}}, using the email {{CUSTOMER_EMAIL}}
> - Sent to {{SHIPPING_CITY}}, {{SHIPPING_POSTCODE}}{{DELIVERY_SENTENCE}}
>
> On a bank statement this purchase appears as **{{BILLING_DESCRIPTOR}}**, which is not the same wording as our shop name — that alone is why many people do not recognise a charge they did make.
>
> Two things are worth checking before anything else: whether someone in your household placed this order, and whether the town above is one you know.
>
> If it turns out the order was yours or your family's, please call your bank and ask them to **withdraw the dispute**. We are not able to cancel it from our side — only you can, and it is a two-minute call.
>
> *[Pick ONE closing paragraph — check line 1 of the tool output.]*
> **If it is an INQUIRY:** If you are certain that nobody at your address ordered this, tell me and I will refund you in full today and block the order. You do not have to fight us for that.
> **If it is a CHARGEBACK:** If you are certain that nobody at your address ordered this, tell me and I will stop contesting the case, so your bank returns the money to you. I am not able to refund it myself once the bank has taken it over — but I can step aside, and I will.
>
> Best regards,
> {{AGENT_NAME}} — Customer Support, {{STORE_NAME}}
> {{SUPPORT_EMAIL}} · {{STORE_DOMAIN}}

### Template B — the customer confirms real card fraud (we accept)

> **Subject:** Your money is coming back — order {{ORDER_NUMBER}}
>
> Hi {{CUSTOMER_FIRST_NAME}},
>
> Thank you for confirming. If your card was used without your permission, you should not have to argue about it, so I am not contesting the case: the {{AMOUNT}} {{CURRENCY}} goes back to you through your bank, and we have blocked the order and the details behind it on our side.
>
> Two things I would recommend, for your sake rather than ours: ask your bank to reissue the card, and check your statement for any other charge from around {{ORDER_DATE}} that you do not recognise. Whoever used your card rarely uses it only once.
>
> If your bank needs anything from us to close the case, they can contact me directly at {{SUPPORT_EMAIL}} and I will answer the same day.
>
> I am sorry this happened to you.
>
> {{AGENT_NAME}} — Customer Support, {{STORE_NAME}}
> {{SUPPORT_EMAIL}} · {{STORE_DOMAIN}}

### Template C — "that was my husband / my daughter" (get them to the bank)

> **Subject:** Thanks — one short call to your bank closes this
>
> Hi {{CUSTOMER_FIRST_NAME}},
>
> Thank you for checking, that explains it. The order was placed {{ORDER_DATE}} and sent to {{SHIPPING_CITY}}, so everything matches what you just told me.
>
> There is one thing only you can do: call the number on the back of your card and say *"I have identified this charge, it was made by a member of my household. Please withdraw the dispute for {{AMOUNT}} {{CURRENCY}} from {{DATE}}."* We are not allowed to cancel a dispute from our side, even when we both agree it was a mistake.
>
> Quote order {{ORDER_NUMBER}} and the statement text **{{BILLING_DESCRIPTOR}}** if they ask for it.
>
> If the product turns out not to be what you wanted after all, that is a separate and much easier conversation — just reply to this email and I will send you the return address. Our return window is {{RETURN_WINDOW_DAYS}} days ({{POLICY_URL}}).
>
> {{AGENT_NAME}} — Customer Support, {{STORE_NAME}}
> {{SUPPORT_EMAIL}} · {{STORE_DOMAIN}}

---

## 7. Build the evidence pack (only if the table says FIGHT)

Shopify pre-fills the fields it can from the order — customer IP address and IP country, product details, carrier and tracking, fulfillment date and time, and both addresses. Your added value is the three things Shopify cannot know: **the possession link, the descriptor explanation, and the conversation.**

Shopify's recommended evidence for these two codes: *order fulfillment date and time, billing information, IP address and country of order, shipping and tracking information.*

| What to put in | The field it belongs to (dispute-evidence API names) |
|---|---|
| Tracking number, carrier, ship date, delivery date | `shipping_tracking_number`, `shipping_carrier`, `shipping_date` |
| Delivery address, and that it equals the billing address | `shipping_address` + `billing_address` |
| Cardholder name and email as ordered | `customer_first_name`, `customer_last_name`, `customer_email_address` |
| Your written argument (paragraph below) | `uncategorized_text` |
| The email thread, or a stated absence of one | customer-communication file slot / `uncategorized_file` |
| Delivery-scan screenshot, carrier label showing the full address | shipping-documentation file slot |

⚠️ **Admin form labels are not documented by Shopify and the form has been redesigned.** These are the API names behind it. Match them by meaning, and **the first time you use the form in a store, write down the labels you actually see and add them here.**

**Write this into the free-text field, adapted, never blank:**

> The cardholder {{CUSTOMER_FIRST_NAME}} placed order {{ORDER_NUMBER}} on {{ORDER_DATE}} from IP {{IP}} ({{IP_COUNTRY}}). The billing address on the order is identical to the shipping address, and {{CARRIER}} tracking {{TRACKING_NUMBER}} shows the parcel delivered to that address on {{DELIVERY_DATE}}. The purchase appears on the statement as "{{BILLING_DESCRIPTOR}}", which does not repeat the shop name {{STORE_NAME}} — we believe this is why the charge was not recognised. {{PRIOR_ORDERS_SENTENCE}} The customer did not contact us before opening this dispute; we emailed {{CUSTOMER_EMAIL}} on {{CONTACT_DATE}} and {{REPLY_SENTENCE}}. No refund has been issued on this order.

Add these sentences **only when they are true**:

- **Prior undisputed payment on the same card:** "The same card was used for order {{OTHER_ORDER}} on {{DATE}}, which was delivered and never disputed."
- **Household member:** "The cardholder has confirmed in writing that the order was placed by a member of their household (email attached)."
- **Refund already paid (row 6):** the amount and date, plus the refund screenshot.
- Leave everything else out. Documented: *"overwhelming the card issuer with unnecessary content can obscure your argument."*

**File limits:** PDF, JPEG or PNG only; roughly **2 MB per file and 4 MB combined**; PDFs under 50 pages; high contrast, legible, cropped — some banks still receive these by fax. One file per evidence type, so combine screenshots into a single file. No links to Drive or to our own site. **VERIFY on the upload form** — it states its own limits and rejects oversized files; write the real numbers in here the first time you hit them.

---

## 8. Submit, or accept

**To fight:** Orders → the disputed order → the chargeback/inquiry banner → **Add evidence** → fill the fields → **Save**. Shopify sends what is in the form on the due date, which lets you keep editing; **Submit now** sends it immediately and locks it forever. Prefer **Save**, so a delivery scan that is still coming can be added — but a saved form goes as-is, so never leave it half-filled over a weekend.
*(Alternative path if the banner is not on the order: **Settings → Payments → (Shopify Payments) → Disputes** → open the dispute.)*

**To accept:** the same page → **Accept chargeback**. Documented consequence: *"The disputed amount is returned to the customer, and you aren't refunded for the chargeback fee."*

**Refunds and disputes (documented by Shopify):**

- **Inquiry:** you can still refund, and *"If you issue a full refund, then the cardholder can't initiate a chargeback."* On rows 3, 4, 8 and the amount cut-off, a **full refund now** is the cheapest ending.
- **Chargeback:** *"You can't issue a refund after a cardholder initiates a chargeback."* Do not try, and **never promise a refund on a chargebacked order** — the bank moves that money, not you. Use **Accept** instead and say so in plain words (template A, chargeback version).

**Deadline:** the due date is on the dispute page (`evidence_due_by`, printed by the tool as `Evidence due`). After it passes, *"you can't submit any further evidence"* and *"There are no exceptions to this."*

---

## 9. Close the loop

1. **Flag the order.** On accepted fraud: tag the order `fraud-accepted` and note the customer email, card last 4 and delivery address in the order notes. Then search Orders for other orders sharing any of them.
2. **Tell the owner the same day** — post it in the store's support channel (`discord.kanal` in the brand file → **{{ESCALATION_CHANNEL}}**), in English, with the order number and no customer address — if any of these is true:
   - two or more orders share a card, email or delivery address;
   - the amount is above {{FIGHT_THRESHOLD}} {{CURRENCY}} (or the key is unset and the amount is large for this store);
   - the statement descriptor turns out to be wrong for the store;
   - the order has **no tracking number at all** (row 9);
   - the due date was already gone when you opened it.
3. **Fix the cause, not the case.** Documented prevention for `unrecognized`: a statement descriptor the customer recognises, plus a receipt at payment. One descriptor change prevents more disputes than any evidence pack wins.
4. **Log the outcome** where the next VA will find it, in both places:
   - on the Shopify order: a tag — `dispute-fight`, `dispute-accepted`, `dispute-won`, `dispute-lost` — plus an order note with the **row number** you used, the date, and the decision;
   - in the store's support channel, one line per closed dispute: order, reason code, inquiry/chargeback, decision, outcome, date.
   This is the only way these two codes ever get real numbers (see *Gaps*).
5. Never tell the cardholder to take it up with the manufacturer or the carrier. The business that sold the product is the point of contact for resolution.

---

## Store config — the only part that changes per store

Everything above is brand-neutral. These values live in **one** place, `kundtjanst/brands/<id>.yaml` (template: `kundtjanst/brand-mall.yaml`), and a store that has a `factory/butiker/<id>.yaml` inherits the top block automatically:

```yaml
brand:
  namn: "{{STORE_NAME}}"
  supportmail: "{{SUPPORT_EMAIL}}"      # the mailbox the VA answers from
  shop: "xxxxxx-xx.myshopify.com"       # admin; {{STORE_DOMAIN}} is the public domain
  land: SE                              # decides the language you write the customer in
  valuta: "{{CURRENCY}}"
discord:
  kanal: customer-service               # {{ESCALATION_CHANNEL}} — where the owner is told
tvister:
  returadress: "{{RETURN_ADDRESS}}"
  returfonster_dagar: {{RETURN_WINDOW_DAYS}}
  policy_url: "{{POLICY_URL}}"
  billing_descriptor: "{{BILLING_DESCRIPTOR}}"   # what the customer sees on the statement
  strid_lonar_sig_over: {{FIGHT_THRESHOLD}} # 0 = always fight; above 0 = the cut-off in step 1
```

A new store is ready for this SOP when those lines are filled in. **Never put a store name, domain, support address, product name, currency or country into the procedure text above** — the same file runs on every store.

*Worked examples in this file are from one store's real disputes read 2026-09-20 and are illustrations, never the rule. Store values come from the block above: for instance one Swedish store runs a 14-day return window in SEK, while its US market runs a 90-day guarantee — both are config, not policy written here.*

---

## Definition of done — tick every box per dispute

- [ ] `tvistfakta.mjs` run with `--brand` (or the facts read by hand in the admin), and the dispute confirmed to exist **in this store**
- [ ] Type noted: **inquiry or CHARGEBACK**; **evidence due date** written down; overdue handled as step 0 check C
- [ ] Number of disputes **on this order** counted (`N dispute(s) in <store>`), each one answered separately
- [ ] Reason code confirmed to be `fraudulent` or `unrecognized` (otherwise: other SOP)
- [ ] Billing vs shipping compared; `null`/`undefined` resolved by opening the order
- [ ] Tracking checked — registered with 17TRACK if it came back unread; delivery **date** noted, or its absence noted
- [ ] Exact billing descriptor read from the store's payment settings (and written into the brand file if it was empty)
- [ ] Decision taken from the table, **row number written in the order note**; any override of the tool's verdict written down with the reason
- [ ] Customer emailed with template A, B or C, in the store's language (unless accepted as fraud with no reply needed)
- [ ] FIGHT: evidence pack inside the form's limits, free-text paragraph written, prior contact stated either way, **Save** used (not **Submit now**) unless the case is complete
- [ ] ACCEPT: **Accept chargeback** clicked, or the inquiry **fully refunded**, and the order flagged
- [ ] Owner told (step 9 point 2) if any of the five triggers applies
- [ ] Outcome logged: order tag + note, and one line in the support channel

## ⚠️ Gaps — verify, do not invent

- [ ] **Admin evidence-form labels and file limits** for this store's Shopify version — VERIFY IN SHOPIFY ADMIN: Orders → disputed order → **Add evidence**; write the real labels and the limits the form states into step 7.
- [ ] **Shopify's own AVS / CVV verdict** per order — VERIFY IN SHOPIFY ADMIN: Orders → the order → fraud-analysis section. If it exists, it outranks our `adressmatch` comparison as evidence.
- [ ] **Chargeback fee amount** for this store — VERIFY IN SHOPIFY ADMIN: Settings → Payments → Shopify Payments → payouts/fees. Not documented publicly; needed before the amount cut-off can be set to a real number.
- [ ] **`tvister.strid_lonar_sig_over` is 0 by default in every store.** Until the owner sets it, the amount cut-off does not apply. Owner decision — ask once, per store.
- [ ] **Whether an unanswered inquiry escalates to a chargeback** is not stated in Shopify's help pages. Our own data shows three orders (#4914, #5044, #4706) going that way. Report it as our measurement, never as Shopify's rule.
- [ ] **Payment-provider guidance vs card-network rulebook.** The "accept genuine fraud", "state it if they never contacted you" and Visa Compelling Evidence / CE 3.0 material comes from our payment provider's documentation, and Shopify Payments' provider chain is only partially confirmed. Treat that layer as guidance. **No card-network deadline, fee or percentage is stated in this SOP as fact.**
- [ ] **Win rate for these two codes in our stores: unknown.** Zero `fraudulent`/`unrecognized` disputes among the 12 read on 2026-09-20. The outcome log in step 9 is what will fill this in.
- [ ] **`tvistfakta.mjs` ignores the delivery scan for these two codes** (see step 1). Until that is fixed in the tool, the table overrides it on row 3 — re-check this note after the next change to `kundtjanst/tvistfakta.mjs`.

<!--
REVIEW: fixed 18 defects.
1. Invented/unsupported numbers removed or downgraded to VERIFY: the "7 to 21 days" evidence window (replaced by "the due date on the dispute page is the only date that counts"), the list of bank review times (75/65-75/30-90/120 days), and the hard "2 MB / 4 MB" file limits (now "roughly ... VERIFY on the form").
2. "Often winnable" / "often not winnable" per reason code was presented as fact on codes where we have ZERO cases; now marked explicitly as reasoning/provider guidance, not measurement.
3. CONTRADICTION WITH OUR OWN TOOL: tvistfakta.mjs decides fraudulent/unrecognized on the address match ALONE and prints FIGHT-strong even with no delivery scan, which contradicted old row 3. Added a tool-verdict mapping table, an explicit override rule, and a Gaps entry.
4. Missing rows added: no tracking number at all (tool prints ESCALATE), and unreadable address match (null AND undefined - the tool prints undefined when the order itself cannot be read).
5. "REFUND / ACCEPT" in row 3 was impossible on a chargeback (Shopify: no refund after a chargeback). Split everywhere into inquiry -> refund, chargeback -> Accept.
6. Template A promised "I will refund you" on a dispute where refunding is blocked; now two closing paragraphs, one per dispute type.
7. Decision cut-off on amount: the config key ships as 0 ("always fight"), so the old row 10 silently never applied. Now stated, with "do not invent a threshold - ask the owner once".
8. Decision-first restructured: four stop checks (wrong store, wrong reason code, overdue, multiple disputes on one order) now come BEFORE the table; deadline and inquiry/chargeback are captured in the first 60 seconds.
9. Overdue and due-today handling added (the tool prints both; the SOP had no instruction for either).
10. --brand is now mandatory in the text: the tool defaults to ONE hardcoded store id, which would answer "No dispute found" in every other store - a portability trap.
11. Added the admin-only fallback path for VAs with no terminal, and for "Shopify is not connected".
12. Row 2 ("same card, other undisputed orders") and row 4 ("other orders sharing address/email/card") were not executable - added the actual admin navigation (search by email, card last 4 on the order's payment section).
13. "Tell the owner the same day" had no channel; now routed to the existing brand-file key discord.kanal as {{ESCALATION_CHANNEL}}, with the five triggers listed.
14. "Log the outcome in the store's dispute log" pointed at a log that does not exist; replaced with order tags + order note + one line in the support channel.
15. Language gap: templates were English-only for stores that sell in Swedish/Norwegian. Now tied to brand.land with a translate-once-per-store rule.
16. Privacy/fraud gap: template A restated the full shipping address to a mailbox that, on a fraudulent claim, may not be the cardholder's. Now city + postcode only, with an explicit warning.
17. Unverifiable specifics dropped: the "order 5053 had two disputes of 348 and 255" example could not be re-verified in the repo, so the warning is kept but re-grounded on something checkable in code (tvistfakta.mjs prints one block per dispute and a final "N dispute(s)" count). Order 4825's invented delivery date removed.
18. Measured data corrected against the repo: the inquiry-to-chargeback escalation is #4914, #5044 AND #4706 (tvistkoll.mjs), not just two orders; added the standing warning never to write "an unanswered dispute is lost automatically" (measured false for inquiries, 29 of 29 won).
Remaining gaps that need the OWNER, not a rewrite: (a) strid_lonar_sig_over is 0 in every store - the fight/accept amount cut-off is dead until he sets a number per store; (b) the chargeback fee is not readable outside his Shopify admin, and it is what makes that number defensible; (c) the admin evidence-form labels and real file limits must be written down by the first VA who opens the form in each store; (d) win rate for these two codes stays unknown until the outcome log has entries; (e) tvistfakta.mjs itself should weigh the delivery scan for fraudulent/unrecognized - until it does, this SOP overrides the tool on row 3.
-->
