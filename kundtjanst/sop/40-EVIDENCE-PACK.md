# SOP 40 — The evidence pack: what to attach and where to find it

**Use this when:** SOP 00 / `tvistfakta.mjs` said **FIGHT** and you now have to build and submit the actual evidence.

**Owner:** customer-support VA · **Frequency:** per dispute, before the evidence due date · **Time:** ~15 min per dispute once tracking is registered.

**Language:** this SOP is identical on every store. Anything store-specific is in the config block at the bottom. Never edit the procedure text for one brand.

---

## STOP — the 60-second gate (answer these before anything else)

| # | Question | Where you see it | If the answer is… |
|---|---|---|---|
| 1 | **Inquiry or chargeback?** | `tvistfakta.mjs` prints `INQUIRY` or `🔴 CHARGEBACK` on line 1 | Chargeback → handle it **first**, and remember: giving up on a chargeback = **Accept**, not refund. On an inquiry, giving up = **full refund**. |
| 2 | **What is the status?** | Tool line 2: `Status:` | `under_review` → evidence is **already submitted**. Stop. Do not rebuild. `needs_response` → continue. Anything else → SOP 00. |
| 3 | **How many days to the due date?** | Tool line 3: `Evidence due: … (N day(s) left)` | `OVERDUE` → stop, tell the owner; you cannot submit after the due date. `DUE TODAY` / 1 day → build the pack now, submit today. |
| 4 | **What did the tool decide?** | `DECISION: FIGHT / REFUND / ESCALATE` | `FIGHT` → this SOP. `REFUND` → Step 6. `ESCALATE` → Step 6b, message the owner, do not submit anything. |

If the tool could not run, use Step 1d and answer the same four questions by hand.

---

## Decide in 2 minutes

| What the claim says (`Reason:` in the tool) | The ONE attachment that decides it | We don't have it → |
|---|---|---|
| `product_not_received` | Carrier **delivery scan with a date**, to the customer's own address | **Do not build a pack.** Inquiry → full refund. Chargeback → **Accept**. |
| `product_not_received`, but the email thread shows they **did** receive it (wrong item, missing part, confusion about contents) | The email thread + the product page showing what is in the box | Fight even without a delivery scan — the customer's own words are the proof. |
| `credit_not_processed`, no refund ever requested or paid | Delivery scan **+** policy page **+** your written line that no refund was requested, agreed or paid | If the inbox shows we **promised** a refund and never paid it → inquiry: refund. Chargeback: accept. |
| `credit_not_processed`, refund already paid | Refund receipt (amount + date) from Shopify → Orders → the order → **Refunds** | Partial refund only → check the disputed amount matches the remainder before you fight. |
| `credit_not_processed`, customer asked to **cancel or return inside `{{RETURN_WINDOW_DAYS}}` days** and we did not refund | — | **Do not fight.** Our own policy is what the bank will read, and it gave them the right. Inquiry → refund. Chargeback → accept. |
| `product_unacceptable` | Product page as published at purchase + the email thread + proof we sent `{{RETURN_ADDRESS}}` and no return arrived | Fight only if delivered **and** we did not refuse or stall a return/replacement. Otherwise refund / accept. |
| `fraudulent` / `unrecognized` | Order page showing **billing address == shipping address** + delivery scan | Addresses **do not** match → inquiry: refund; chargeback: accept, and block the customer. Address fields **empty/unknown** → ESCALATE, do not claim a match. |
| `duplicate` | Both order confirmations side by side | **ESCALATE to the owner first.** Only the owner decides which charge stands. If there is genuinely one order and two charges → refund one immediately. |
| **No tracking number on the order at all** | — | **ESCALATE.** Fulfilment is broken; the owner must look. |
| Anything else (`general`, `subscription_canceled`, unreadable claim text) | Delivery scan + order confirmation + thread | ESCALATE if the claim text is not understandable. |
| Amount below `{{FIGHT_THRESHOLD}} {{CURRENCY}}` | — | Inquiry → refund. Chargeback → accept. Your time costs more than the order. *(If the config says `0`, this row is switched off for this store — ask the owner to set a number.)* |

**Attachments beat prose.** In our own measured record the cases we win are the cases where we can show a delivery scan; the cases we lose are the ones where we cannot. No amount of well-written narrative replaces one scan. Write the cover letter last, keep it short, and let the files carry the case.

> Third-party guidance (Stripe has published win-rate numbers for delivery confirmation, GPS maps and signatures) points the same way, but **we have not verified those figures and you should not quote numbers to anyone.** Treat "the scan decides it" as our own measured rule, not as a published statistic.

---

## Three hard rules

1. **Never write a sentence the attachments do not prove.** If the order page does not show a billing address, do not write "matches the billing address". A single unprovable sentence is what a reviewer uses to dismiss the rest.
2. **Never omit `--brand`.** Without it the tool reads **one default store** (measured in the code: it falls back to a fixed brand id), and you will confidently read the wrong store's disputes. Always pass `--brand {{STORE_ID}}`.
3. **Never run the hourly tracking routine to look up a parcel.** See the box in Step 1b.

---

## Step 1 — Get the facts with one command (never click three systems)

```bash
node kundtjanst/tvistfakta.mjs <order number> --brand {{STORE_ID}}
```

It reads Shopify (order, refunds, addresses, fulfilment) and 17TRACK (tracking), prints the FIGHT / REFUND / ESCALATE decision, and lists the evidence to attach. **It is read-only** — it changes no dispute, sends no evidence, moves no money.

`--alla` instead of an order number prints every **open** dispute in that store (`needs_response` + `under_review`).

If it prints `No dispute found for order <n> in <store>`: the dispute belongs to **another store** (check the others with `--brand`), or there is none. Do not invent one. *(The tool reads roughly the last 400 days of orders; an older order will not be found either — then use Step 1d.)*

### 1b. "does not register, please register first" — the real 17TRACK step

Old parcels are not known to 17TRACK. The hourly tracking routine only registers parcels from the last 14 days, so anything older comes back rejected with this message:

```
does not register, please register first
```

*(Measured 2026-09-20: all twelve disputed orders returned exactly this — every one was older than the 14-day window.)*

This is **not a bug and not a broken number.** Register it, then read it again:

```bash
node kundtjanst/tvistfakta.mjs <order number> --brand {{STORE_ID}} --registrera
```

The tool registers the number, waits ~20 seconds, and re-reads. Registration **costs 17TRACK quota**, so only use `--registrera` on orders that actually have a dispute. If it still comes back empty, the carrier has no data — treat the parcel as **not proven delivered** and go to Step 6.

### 🚫 Never do this to check a tracking number

```bash
node sparning/kor.mjs --dagar 90      # ⛔ NEVER for a dispute
```

A sharp run with a wide window **writes fulfillment events into Shopify**, and delivery events send customer notification emails. Running it to look up one old parcel would email hundreds of customers "Your parcel was delivered" months after the fact. That routine is also wired to one single store — it is not portable. `tvistfakta.mjs` is the dispute tool; `kor.mjs` is the hourly routine. Do not mix them.

### 1c. Get the screenshot the bank can read

The command gives you *text*. The bank wants an *image*. Open `https://www.17track.net/`, paste the tracking number, and screenshot the full event list. It must show, in one image or one PDF:

- the tracking number,
- the carrier name,
- the destination city and country,
- the delivery line **with its date**.

The carrier's own site works too and is often more convincing — use it when the carrier has a public tracking page. This page is not brand-specific; it works for any store.

**Not the store's own tracking page.** `{{TRACKING_PAGE}}` is what the customer sees and what you quote back to them, and it is the fastest way to *read* a recent parcel — but it is our own rendering of the carrier data, in the store's language, with the carrier number hidden. The bank wants the third party's record: the carrier number, the carrier name and the delivery line, on 17TRACK or the carrier's site. Read on the store page, screenshot on 17TRACK.

### 1d. If the command cannot run (no keys, no Node, tool errors)

Do the same job by hand — it takes about ten minutes:

1. Shopify admin → **Orders** → **Search and filter** → **Add filter** → **Chargeback and inquiry status** → **Open** → open the order.
2. The chargeback banner shows: inquiry vs chargeback, reason, amount, **evidence due date**, status.
3. **Fulfillments** block → carrier + tracking number → paste into `https://www.17track.net/`.
4. **Refunds** block → any refund, amount and date.
5. Compare the **shipping address** and **billing address** blocks yourself.
6. Search the support inbox for the order number **and** the customer's email address.

Then continue from Step 2. Tell the owner the tool failed and paste the error — do not let a broken key become a missed deadline.

---

## Step 2 — The evidence table

Shopify auto-populates part of this when you submit nothing: product details, shipping company and tracking number, fulfilment date/time, shipping and billing address, order date, customer IP and IP country. **Do not waste time retyping those.** Your job is the things Shopify cannot know: the scan image, the email thread, the policy page, and the narrative.

| # | Evidence | Where to find it (exact path) | Goes into (API field name) | Needed for |
|---|---|---|---|---|
| 1 | **Delivery scan** (screenshot of the tracking event list) | Step 1c | `shippingDocumentationFile` (file) | not received, unacceptable, fraudulent, unrecognized |
| 2 | Carrier name, tracking number, ship date | Shopify admin → **Orders** → the order → **Fulfillments** | `fulfillments` (auto-filled) | all shipped orders |
| 3 | **Order confirmation** (screenshot of the order page: customer, items, amount, date) | Shopify admin → **Orders** → the order | `uncategorizedFile` (file) | all |
| 4 | **Full email thread** with the customer — or a written line that there was none | The support inbox: search the **order number** AND the **customer email** | `customerCommunicationFile` (file) | all |
| 5 | **Policy page as the customer saw it** (screenshot of `{{POLICY_URL}}`, showing the URL bar) | `{{STORE_DOMAIN}}{{POLICY_URL}}` in a browser | `refundPolicyFile` / `cancellationPolicyFile` (file) | credit not processed, unacceptable |
| 6 | Proof the policy was shown **before** purchase | On `{{STORE_DOMAIN}}`: add the product to the cart → click **Checkout** → screenshot the checkout page with the policy links in the footer. **Do not pay.** Also screenshot the site footer. | `refund_policy_disclosure` / `cancellation_policy_disclosure` (text — describe what the screenshot shows) | credit not processed, unacceptable |
| 7 | **Why no refund is owed** — your own sentences | You write it (Step 4) | `refund_refusal_explanation` (text) | credit not processed |
| 8 | **Product page as it looked at purchase** (description, photos, specs) | `{{STORE_DOMAIN}}/products/<handle>` | `uncategorizedFile` (file) — `product_description` is read-only and auto-filled | unacceptable, "missing part / wrong item" |
| 9 | **Refund receipt**, if we already paid one (amount + date) | Shopify admin → **Orders** → the order → **Refunds** | `uncategorizedFile` + state it in the narrative | credit not processed, any partial refund |
| 10 | Billing address == shipping address | Shopify admin → **Orders** → the order (both blocks) | `shipping_address` / `billing_address` (auto-filled) | fraudulent, unrecognized |
| 11 | Customer name and email | Shopify admin → **Orders** → the order → Customer | `customer_first_name`, `customer_last_name`, `customer_email_address` | all |
| 12 | Billing descriptor the customer saw on the statement | `{{BILLING_DESCRIPTOR}}` from the config block | write it into the narrative | unrecognized |
| 13 | **Proof we sent the return address** (the email, with date) | The support inbox — the message containing `{{RETURN_ADDRESS}}` | `customerCommunicationFile` (same PDF as #4) | unacceptable, cancellation claims |
| 14 | **The customer's own public review or comment about the product**, if one exists | The store's product page / review app — search the customer name | `uncategorizedFile` (file) | not received (it proves receipt), unacceptable |
| 15 | **The cover letter** (Step 4) | You write it | `uncategorized_text` (text) | all |
| 16 | Login / usage logs | Not applicable to physical products — skip | `access_activity_log` | digital only |

> **VERIFY IN SHOPIFY ADMIN: the names above are API names, not the labels on screen.** The labels of the evidence form are not documented to us. Open **Orders → the disputed order → chargeback banner → Add evidence** and match by meaning: the box asking for shipping documents takes item 1, the box asking for customer communication takes items 4 + 13, the free-text box at the end takes item 15. **If a file has no obvious box, put it in the general/other file box and name it in the cover letter** — never leave it out. If a box exists that is not in this table, leave it empty; an empty optional field costs nothing. Write down the labels you actually saw and add them here, so the next VA does not have to guess.

**Relevance beats volume.** A perfect return policy proves nothing in a "never received it" dispute. Attach what answers *this* claim and nothing else.

---

## Step 3 — File limits and how to actually make the files

**Limits (these are printed next to the upload box — VERIFY IN SHOPIFY ADMIN: Orders → the disputed order → Add evidence → the upload field. If the box says something different, the box wins):**

- **PDF, JPEG or PNG** only.
- **2 MB per file**, **4 MB combined.**
- Keep PDFs short. A reviewer does not read page 20; three tight pages beat thirty.
- Images must be cropped, high contrast and legible.
- One file per evidence type — combine same-type screenshots into one PDF.
- Assume the reviewer sees a **black-and-white fax-quality copy**: no colour highlighting, no yellow marker, 12pt or larger. Use bold text or an arrow drawn in black.
- **No links.** Not to Drive, not to the store, not to the tracking site. Assume nobody clicks. Screenshot it.

**How to make each file (browser, no extra software):**

- **Screenshot → PDF:** open the page, `Ctrl+P` (`⌘+P` on Mac) → Destination: **Save as PDF** → Save. This keeps the URL bar footer and the date, which is exactly what you want on the policy page.
- **Email thread → PDF:** open the thread in the webmail, `Ctrl+P` → **Save as PDF**. Several messages → print each one, then combine (below). Make sure the **dates, the sender and the recipient** are visible; a thread with no dates proves nothing.
- **Combine several PDFs into one:** print them to a single PDF by opening them in one browser window, or paste the screenshots into one document and print that to PDF. One file per evidence type.
- **File over 2 MB:** screenshot only the part that matters (not the whole desktop), or re-save the PNG as **JPEG**, or print at a smaller scale. Never split one piece of evidence into two files to get under the limit if it can be cropped instead.

Name files so the reviewer knows what they are before opening:
`<order>-delivery-scan.pdf`, `<order>-email-thread.pdf`, `<order>-order-confirmation.png`, `<order>-refund-policy.pdf`.

---

## Step 4 — The cover letter (`uncategorized_text`)

Short, factual, no apologies, no emotion, no marketing. It exists to tell the reviewer what the attachments prove, in the order they should look at them.

### Copy-paste template

```
Order {{ORDER_NUMBER}} placed {{ORDER_DATE}} on {{STORE_DOMAIN}}, {{AMOUNT}} {{CURRENCY}}.
Shipped {{SHIP_DATE}} with {{CARRIER}}, tracking {{TRACKING_NUMBER}}.

{{DELIVERY_LINE}}

{{ADDRESS_LINE}}

{{CONTACT_LINE}}

{{CLAIM_LINE}}

Attached: (1) carrier tracking record, (2) order confirmation showing items, amount
and address, (3) the customer email correspondence, (4) our published
{{POLICY_NAME}} as shown on {{STORE_DOMAIN}} before purchase.

We are available at {{SUPPORT_EMAIL}} and will resolve any genuine issue directly
with the customer.
```

Delete any line you cannot prove. Renumber the "Attached" list to match what you actually uploaded.

**`{{DELIVERY_LINE}}` — pick one:**

- Delivered: `The carrier record shows the parcel DELIVERED on {{DELIVERY_DATE}} to the delivery address on the order (see attached tracking record).`
- Not delivered but the customer confirmed receipt in writing: `The customer confirmed receipt of the parcel in the attached correspondence on {{DATE}}.`

**`{{ADDRESS_LINE}}` — only if the order page shows both addresses:**

- They match: `The delivery address is the cardholder's own billing address on the order; both are shown on the attached order confirmation.`
- Unknown or different: **leave the line out entirely.** Do not claim a match you cannot show.

**`{{CONTACT_LINE}}` — pick one, never leave it out:**

- No contact ever: `The customer did not contact us at any point before filing this dispute. We had no opportunity to resolve the issue.`
- They contacted us: `The customer contacted us on {{DATE}} and we replied on {{DATE}}; the full correspondence is attached.`
- We contacted them: `We emailed the customer on {{DATE}} at the address on the order and received no reply.`

"No conversation" is **not** a weakness to hide — state it plainly. It is the strongest thing you can say in a dispute where the customer never gave us a chance to fix anything.

**`{{CLAIM_LINE}}` — the one sentence that answers the reason code:**

| Reason code | `{{CLAIM_LINE}}` |
|---|---|
| `product_not_received` | `The claim is that the goods were not received. The attached carrier record shows delivery on {{DELIVERY_DATE}}.` |
| `product_not_received`, customer's own words show receipt | `The claim is that the goods were not received. In the attached correspondence the customer describes the delivered item on {{DATE}}. The attached product page shows the full contents of the set as published at the time of purchase.` |
| `credit_not_processed`, no refund requested or paid | `No refund was requested, agreed or owed on this order. No return has been received. Our {{RETURN_WINDOW_DAYS}}-day return policy was published before purchase and is attached.` |
| `credit_not_processed`, refund already paid | `A refund of {{REFUND_AMOUNT}} {{CURRENCY}} was paid on {{REFUND_DATE}}; the receipt is attached. No further amount is owed.` |
| `product_unacceptable` | `The goods were delivered and match the product page as published at the time of purchase (attached). We sent the customer our return address on {{DATE}}; no return has been received.` |
| `unrecognized` | `The charge appears on the statement as {{BILLING_DESCRIPTOR}}. The order was placed and delivered to the address shown on the attached order confirmation.` |

---

## Step 5 — Submit

1. Shopify admin → **Orders** → **Search and filter** → **Add filter** → **Chargeback and inquiry status** → **Open**. *(The daily deadline alert in Discord points at Settings → Payments → Disputes; either route opens the same dispute.)*
2. Open the disputed order → the chargeback banner → **Add evidence**.
3. Fill the fields from Step 2. Paste the cover letter into the free-text box.
4. **Save** while you are still collecting files. You can edit your response any time before the due date.
5. **Submit now** only when the pack is complete. After **Submit now** you cannot edit anything.
6. If you do nothing, Shopify submits the auto-populated data on the due date by itself — without your scan, your thread or your narrative. Submitting a real pack is the whole job.
7. **Treat the due date as hard: after it there is no submission.** VERIFY IN SHOPIFY ADMIN: the due date and the wording next to it are shown on the dispute banner. Do not plan around exceptions.
8. If you saved without submitting, set a reminder **2 days before** the due date, with the order number in the title.

**Timing rule:** if the parcel is still in transit and the due date allows it, wait for the delivery scan and submit once it appears. A pack submitted with "still in transit" as its strongest fact is a pack with no proof of delivery. If the due date arrives first, submit what you have — a late pack is worth nothing.

---

## Step 6 — When NOT to build a pack

| Situation | Do this instead | Why |
|---|---|---|
| `product_not_received`, tracking stuck with no delivery scan (`InfoReceived`, `NotFound`, `Expired`, `Undelivered`, `Exception`) | Inquiry → **full refund**. Chargeback → **Accept**. | We cannot prove delivery, so we cannot win. Refunding now is cheaper than losing later. |
| Genuine defect and the customer was left without a working resolution | Inquiry → refund or replace. Chargeback → accept. | We deserve to lose this one. Read the thread before spending an hour. |
| Customer asked to cancel or return **inside `{{RETURN_WINDOW_DAYS}}` days** and got no refund | Inquiry → refund. Chargeback → accept. Send `{{RETURN_ADDRESS}}` and refund on receipt if the owner's rule is return-first. | The policy page we would attach is the same page that gave them the right. Attaching it proves their case, not ours. |
| `fraudulent` with billing ≠ shipping address | Inquiry → refund. Chargeback → accept. Block the customer. | Our record contains no win of this type. Fighting it costs time and still loses. |
| Amount below `{{FIGHT_THRESHOLD}} {{CURRENCY}}` | Inquiry → refund. Chargeback → accept. | Your time costs more than the order. |
| Status is already `under_review` | Nothing. Do not rebuild. | Evidence was already submitted. Wait for the decision. |
| No dispute found in this store | Close it and check the other stores with `--brand`. | It is another brand's dispute, or none at all. Do not invent one. |

**How to give up, in the admin:** on an **inquiry**, issue the refund on the order page (Orders → the order → **Refund**) — there is normally no accept button, the refund is the action. On a **chargeback**, the money is already withdrawn and the order page does not offer a refund; the action is **Accept** in the dispute banner, or simply letting the due date pass. VERIFY IN SHOPIFY ADMIN: Orders → the disputed order → the chargeback banner — note which button you actually see and add it here.

Accepting is not an admission of wrongdoing. Assume every dispute you **receive** counts against the store whether you win it or not — so preventing disputes (answering email fast, real tracking, honest product pages) beats winning them. VERIFY IN SHOPIFY ADMIN: Settings → Payments → Disputes for the store's own dispute rate; we have not read the card networks' own rules.

### 6b. ESCALATE — what to send the owner

`tvistfakta.mjs` says ESCALATE for: **no tracking number at all**, **`duplicate`**, and **claims it has no playbook for**. Do not guess and do not submit. Send the owner one message:

```
Dispute ESCALATE — store {{STORE_NAME}}, order {{ORDER_NUMBER}}
Type: inquiry / chargeback     Reason: {{REASON_CODE}}     Amount: {{AMOUNT}} {{CURRENCY}}
Evidence due: {{EVIDENCE_DUE}} ({{DAYS_LEFT}} days left)
Why I stopped: <no tracking number on the order / two charges, need to know which stands / claim text unclear>
What I have: <delivery scan yes/no, email thread yes/no, refunds yes/no>
I need a decision by {{DUE_DATE minus 2 days}} or the deadline passes.
```

### Inquiry vs chargeback — the difference that matters

- **Inquiry** — the bank is asking; the money has not been taken. A **full refund** is the documented way to close it before it can become a chargeback. *(Partial refunds: NOT CONFIRMED — only a full refund is documented to stop the escalation. Refund in full or fight.)*
- **Chargeback** — the money is already gone, plus a fee. **You cannot refund a chargeback.** Your only options are evidence or accept. *(VERIFY: if the order page still offers a Refund button, it is an inquiry, not a chargeback.)*
- **Our own measured record, 50 disputes, 2026-09-20:** **29 of 29 decided inquiries won (100 %)**; chargebacks **1 won of 4** — every loss we have ever had was a chargeback. **Handle chargebacks first.**

---

## Step 7 — Two disputes on one order

One order can carry **two separate disputes** for parts of the same order. Each has its own evidence form, its own due date and its own amount.

- Build and submit **two packs**. The same scan and the same thread go into both.
- In each cover letter, name the amount that dispute covers: `This dispute covers {{AMOUNT}} {{CURRENCY}} of order {{ORDER_NUMBER}}; a separate dispute covers the remainder.`
- Submitting one pack and assuming it covers both loses the second one silently.

---

## Step 8 — The customer contacts you after filing

- **Keep replying, politely and factually.** The thread is evidence either way.
- If they say they will withdraw the dispute: **still submit the pack before the due date.** You cannot verify a withdrawal landed, and the deadline does not wait.
- Never promise a date for the bank's decision. We do not control it and the published ranges disagree with each other.
- If they send new facts (a photo of a damaged item, a wrong item), re-run `tvistfakta.mjs` and re-read the decision table. New facts can turn a FIGHT into a refund — that is a good outcome, not a failure.

---

## Store config block — fill once per store, never inside the procedure

Everything brand-specific lives in `kundtjanst/brands/<id>.yaml` (or `factory/butiker/<id>.yaml` for factory-built stores). The SOP text above is identical on every store.

```yaml
brand:
  namn: ""                    # {{STORE_NAME}}
  supportmail: ""             # {{SUPPORT_EMAIL}}
  shop: ""                    # xxxxxx.myshopify.com — {{STORE_ID}} is the file name, e.g. --brand <id>
  doman: ""                   # {{STORE_DOMAIN}} — the PUBLIC domain customers buy on.
                              # Add this line if it is missing from the file.
  valuta: ""                  # {{CURRENCY}} — ISO code, e.g. SEK / EUR / USD

tvister:
  returadress: ""             # {{RETURN_ADDRESS}} — the full address the VA sends to customers
  returfonster_dagar: 14      # {{RETURN_WINDOW_DAYS}} — the window published on the site
  policy_url: ""              # {{POLICY_URL}} — the page the customer accepted at checkout
  billing_descriptor: ""      # {{BILLING_DESCRIPTOR}} — VERIFY IN SHOPIFY ADMIN:
                              # Settings → Payments → Customer billing statement
  strid_lonar_sig_over: 0     # {{FIGHT_THRESHOLD}} — 0 = always fight
```

**Multi-market stores:** a store can sell on several domains, currencies and languages (one per market). `{{STORE_DOMAIN}}`, `{{POLICY_URL}}` and `{{CURRENCY}}` must be **the market the customer actually bought in** — the order's country and currency tell you which. Screenshotting the Swedish policy page for an American order proves nothing. For factory-built stores the per-market domains are in the market block of `factory/butiker/<id>.yaml`.

A new store gets working dispute handling by filling in these lines — not by rewriting this SOP.

---

## Definition of done

- [ ] `tvistfakta.mjs` was run **with `--brand`** (and `--registrera` if tracking was unregistered) and said FIGHT — or Step 1d was done by hand.
- [ ] Status is `needs_response`, not `under_review`, and the due date has not passed.
- [ ] Delivery scan screenshot attached, showing tracking number, carrier, destination and delivery date.
- [ ] Order confirmation attached.
- [ ] Email thread attached with visible dates — or the cover letter states in writing that there was none.
- [ ] Policy page attached when the reason code is `credit_not_processed` or `product_unacceptable`, taken from **the market the customer bought in**.
- [ ] Cover letter pasted into the free-text field, with `{{DELIVERY_LINE}}`, `{{ADDRESS_LINE}}`, `{{CONTACT_LINE}}` and `{{CLAIM_LINE}}` filled in — and **no sentence that the attachments do not prove**.
- [ ] All files are PDF/JPEG/PNG, under 2 MB each and 4 MB combined, legible in black and white, no links.
- [ ] Amounts in the cover letter match the dispute amount exactly (two disputes on one order → two packs).
- [ ] ESCALATE cases: the owner was messaged with the Step 6b block, at least 2 days before the due date.
- [ ] **Submit now** clicked before the due date, or Saved with a reminder set 2 days before it.
- [ ] Any admin label you had to match by meaning was written into Step 2 for the next VA.

---

## Appendix — worked examples

> **EXAMPLES ONLY.** These come from one Swedish store on 2026-09-20. The currency, carrier, dates and order numbers are illustration — **the shape of the letter is the rule.** Every value marked `<…>` must be copied from your own `tvistfakta.mjs` output. Never reuse a date or a delivery claim from this appendix.

### A. `product_not_received`, no conversation, parcel delivered

```
Order #<order> placed <order date> on {{STORE_DOMAIN}}, <amount> {{CURRENCY}}.
Shipped <ship date> with <carrier>, tracking <tracking number>.

The carrier record shows the parcel DELIVERED on <delivery date> to the delivery
address on the order (see attached tracking record).

The delivery address is the cardholder's own billing address on the order; both are
shown on the attached order confirmation.

The customer did not contact us at any point before filing this dispute. We had no
opportunity to resolve the issue. We emailed the customer on <date> at the address
on the order.

The claim is that the goods were not received. The attached carrier record shows
delivery on <delivery date>.

Attached: (1) carrier tracking record, (2) order confirmation showing items, amount
and address, (3) our email to the customer, (4) our published shipping and returns
policy as shown on {{STORE_DOMAIN}} before purchase.

We are available at {{SUPPORT_EMAIL}} and will resolve any genuine issue directly
with the customer.
```

### B. `credit_not_processed`, no refund ever issued, no conversation

**Search the inbox for the order number and the customer's email first.** If support promised a refund in a message nobody logged, this whole argument collapses and you go to Step 6 instead.

```
Order #<order> placed <order date> on {{STORE_DOMAIN}}, <amount> {{CURRENCY}}.
Shipped <ship date> with <carrier>, tracking <tracking number>.

The carrier record shows the parcel DELIVERED on <delivery date> to the delivery
address on the order (see attached tracking record).

The customer did not contact us at any point before filing this dispute. We have no
record of any cancellation request, return request or refund request for this order.
We emailed the customer on <date> at the address on the order.

No refund was requested, agreed or owed on this order, and no return has been
received. Our {{RETURN_WINDOW_DAYS}}-day return policy was published before purchase
and is attached. No credit is outstanding.

Attached: (1) carrier tracking record, (2) order confirmation showing items, amount
and address, (3) our email to the customer, (4) our published returns and refunds
policy as shown on {{STORE_DOMAIN}} before purchase.

We are available at {{SUPPORT_EMAIL}} and will resolve any genuine issue directly
with the customer.
```

### C. The twelve disputes measured on 2026-09-20 — what each one teaches

*(Same store, same day. Read these as patterns, not as instructions for your order. Every tracking number in this batch came back "does not register, please register first" — the delivery facts were not yet read when this list was written, so no delivery dates appear here.)*

| Pattern | What happened | Which row of the decision table |
|---|---|---|
| Buyer's remorse dressed as `product_unacceptable` | Customer did not want the product because of its country of manufacture; we sent the return address | Fight **if** delivered and no return arrived — the return-address email is the evidence |
| Cancellation inside the window, `credit_not_processed` | Customer asked to cancel on day 13 of a 14-day window; it had already shipped and was not cancelled | **Do not fight.** Our policy gave them the right |
| `product_not_received`, no conversation at all | Support emailed the customer only after the dispute arrived | Fight if there is a delivery scan; say plainly that they never contacted us |
| `product_not_received` that is really confusion | Customer thought an item was missing; it was included in the set | Fight with the thread + the product page showing the contents |
| `credit_not_processed`, no conversation | No refund ever requested, agreed or paid | Fight — but search the inbox for an unlogged refund promise first |
| Chargeback, tracking stuck at "shipment information received" | No delivery scan exists | **Accept.** No scan, no case |
| `product_not_received`, delivered | Delivery scan exists | Fight — this is the strongest case we have |
| `product_unacceptable`, we missed the email | Support missed a return request; return address sent late | Weak. Read the thread before spending an hour; a real defect we mishandled is a loss |
| Chargeback, no conversation, customer left a **public review** describing the product | The review proves receipt | Screenshot the review (item 14) |
| No dispute found in this store | The order exists, the dispute does not | Check the other stores with `--brand`; do not invent one |
| `product_unacceptable`, genuine defect | Button broke on first use; a replacement was offered but the customer never confirmed, then the return address was sent | Real defect + unresolved = weak. Refund/accept unless the thread clearly shows we did everything |
| One order, two disputes | Two amounts disputed separately from one order | Two packs, two cover letters, two amounts (Step 7) |

---

## ⚠️ Gaps — do not fill these with guesses

- [ ] **Admin form labels are not documented.** Step 2 lists API names. Match by meaning, then write down what you saw.
- [ ] **Chargeback fee amount: NOT CONFIRMED.** VERIFY IN SHOPIFY ADMIN: Settings → Payments → the dispute → the fee line on the payout.
- [ ] **Whether accepting changes the fee: NOT CONFIRMED.** Do not tell the owner it is free.
- [ ] **Bank review time: NOT CONFIRMED.** Published ranges disagree ("up to 75 days", "30–90 days", "within 120 days"). Never promise a customer or the owner a date.
- [ ] **"You lose automatically if you don't respond": NOT CONFIRMED**, and probably false for inquiries — our own 29-for-29 record says otherwise. What *is* measured: an ignored inquiry can become a chargeback, and that is what it costs.
- [ ] **Partial refund vs full refund on an inquiry: NOT CONFIRMED.** Only a full refund is documented to stop the escalation.
- [ ] **Win-rate statistics for delivery confirmation, GPS maps and signatures: NOT VERIFIED.** Third-party figures. Never quote numbers; the rule "the scan decides it" stands on our own data.
- [ ] **Card network rules (Visa/Mastercard deadlines, thresholds, dispute-rate limits, reason codes): NOT READ.** If a bank letter quotes a rule, escalate to the owner rather than arguing it.
- [ ] **Consumer law (right of withdrawal, distance-selling rules) is country-specific and NOT READ.** We measure ourselves against our own published policy only. Legal questions go to the owner.

<!--
REVIEW: fixed 33 defects.

INVENTED RULES (9): (1) Stripe's "+27 pp / +15 pp / +2 pp / +2 pp" win-rate figures were stated as fact and were load-bearing for the timing rule — demoted to unverified third-party guidance, rule re-grounded on our own 50-dispute record. (2) "Mastercard — 19 pages" threshold removed. (3) File limits presented as "Shopify help center, verbatim" — now VERIFY against the upload box. (4) "Accepting does not change the dispute fee" contradicted the SOP's own "fee NOT CONFIRMED" gap — removed, gap added. (5) "The card networks count how many disputes you receive" — demoted to an assumption + VERIFY. (6) "If you issue a full refund the cardholder can't initiate a chargeback" quoted as documented fact — softened. (7) "After a decision there is no appeal" / "There are no exceptions to this" — replaced with "treat the due date as hard" + VERIFY. (8) "Real card fraud is not winnable" — restated from our record. (9) "You cannot refund a chargeback" kept but given a self-check (a Refund button means it is an inquiry).

NOT PORTABLE (4): (10) The 4446 worked example was not marked as an example and carried a hardcoded currency, carrier and 14-day window — both examples moved to a clearly marked appendix with fill-in values. (11) Order numbers and dates (5584, 5044, 5122, 4825, 5053) sat inside the procedure tables — rows are now generic, the cases live in the marked appendix. (12) {{STORE_DOMAIN}} assumed one domain per store; our multi-market stores have a domain, currency and language per market, so a policy screenshot from the wrong market proves nothing — rule + config note added. (13) `doman` was used as a placeholder but exists in no brand file — added to the config block with "add this line if missing".

WRONG ON THE DATA (4): (14) Both worked examples asserted delivery dates (2026-09-11, 2026-08-13) for orders whose tracking was measured as unregistered on 2026-09-20 — removed. (15) Order 5044 was described as "we refused or stalled a replacement"; the record says the customer never confirmed acceptance and support then sent the return address — corrected. (16) The "duplicate" row told the VA to refund immediately while tvistfakta.mjs returns ESCALATE — aligned to ESCALATE first. (17) The 5122 row asserted `under_review`, which is not in the record — the row is now driven by the tool's Status line.

NO DECISION / NOT ACTIONABLE (10): (18) Added the 60-second gate (inquiry vs chargeback, status, days left, tool verdict) ahead of the table. (19) Every give-up row now distinguishes refund (inquiry) from accept (chargeback) — the old table told VAs to "refund" chargebacks, which is impossible. (20) Added the missing "no tracking number at all" row (tool: ESCALATE). (21) Added a whole ESCALATE path with a copy-pasteable owner message — the tool can return ESCALATE and the SOP had no answer for it. (22) Added the `--brand` trap: the tool silently defaults to one fixed store. (23) Added Step 1d, a by-hand fallback for when the command cannot run. (24) Added exact file-making steps (Ctrl+P → Save as PDF, email thread export, what to do when a file exceeds 2 MB). (25) Added the navigation path for the checkout policy-disclosure screenshot. (26) Added a fallback for an evidence box that matches nothing (general file box + name it in the letter). (27) Added how to give up in the admin (Refund on an inquiry, Accept in the banner on a chargeback) with VERIFY.

MISSING CASES / RULES (6): (28) Cancellation requested inside the return window and not honoured — a do-not-fight row; our own policy proves the customer's case. (29) "Claims not received but the thread shows receipt / misunderstood contents" — now a fight row with its own claim line. (30) The customer's own public review as proof of receipt — evidence item 14. (31) Proof the return address was sent — evidence item 13, and {{RETURN_ADDRESS}} is finally used in the text. (32) Step 8: what to do when the customer makes contact after filing or promises to withdraw. (33) Hard rule "never write a sentence the attachments do not prove", plus a conditional {{ADDRESS_LINE}} — the old cover letter asserted billing == shipping unconditionally, including where the order shows no billing address.

Remaining gaps that need the owner (cannot be resolved here):
- The dispute fee amount, and whether accepting changes it — needs one look at a real payout line.
- The real labels on the Shopify evidence form and which button appears on an inquiry vs a chargeback — needs one screenshot from the admin; the SOP asks the first VA to write them in.
- {{FIGHT_THRESHOLD}} is 0 in the template, so the "too small to fight" row is switched off on every store until the owner sets an amount.
- Whether the owner wants refund-on-return or refund-immediately for cancellation-window cases.
- Card network rules and consumer law are still unread; both are flagged as escalate-to-owner rather than guessed.
- kundtjanst/sop/ is currently empty, so the "SOP 00 / 00-MASTER.md" this file and tvistfakta.mjs point at does not exist yet.
-->
