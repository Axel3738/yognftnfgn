# SOP 11 — Reason: product unacceptable / not as described

**Use this when:** the dispute reason reads `product_unacceptable` (that is how the Shopify API and `tvistfakta.mjs` spell it) or **"product unacceptable"** (how our weekly report spells it). The customer received the parcel but says it is faulty, damaged, or not what was advertised.

**Placeholder convention, used everywhere below:**
`{{LIKE_THIS}}` = a value from your store's config block (section 2). `<like this>` = a fact you read off this order (name, date, amount). Never send an email containing either kind of bracket.

---

## 0. Get the facts first — 60 seconds

```bash
node kundtjanst/tvistfakta.mjs <order number> --brand <brand id>
# add --registrera if the tracking line says "does not register, please register first"
node kundtjanst/tvistfakta.mjs --alla --brand <brand id>   # every open dispute in this store
```

⚠️ **Always type `--brand <brand id>`.** Without it the tool silently reads **one specific default store** (`tvistfakta.mjs`, `flagga('brand', 'baverbutiken')`) — you would be looking at another store's disputes and never get an error. The brand id is the filename in `kundtjanst/brands/` or `factory/butiker/` (lowercase, no å/ä/ö).

**If the command fails** with "Shopify is not connected for …": this store's API keys are not in the environment. Do not stop — get the same facts by hand and continue:

| Fact | Where, by hand |
|---|---|
| Dispute reason, amount, status, **evidence due date** | Shopify admin → **Orders** → open the order → the chargeback/inquiry banner at the top |
| Tracking number + carrier | Same order page → the fulfillment line |
| Delivery scan + date | Paste the tracking number into **17track.net** in your browser, or the carrier's own site |
| Refunds already paid | Same order page → **Refunds** section and the timeline |
| Our conversation with the customer | Search the support inbox `{{SUPPORT_EMAIL}}` for the order number **and** for the customer's email address |

**Searching the inbox is not optional.** The tool cannot read email. Half of the rows below are decided by what is or is not in that thread, and this is the single most common way a VA picks the wrong row.

> **When the tool and this SOP disagree, this SOP wins.** `tvistfakta.mjs` prints `DECISION: FIGHT / REFUND / ESCALATE` from Shopify data only — it has never seen the email thread. Use its decision as the starting point, then correct it with what the thread shows.

---

## 1. Decide — first matching row wins, read top to bottom

### 1.1 Two hard stops, check these before the table

**H1 — Dispute status is `under_review`.**
Do **not** touch the evidence. Shopify's help text for the response you already sent: *"you can't make any further edits"*.
**VERIFY IN SHOPIFY ADMIN:** open the order and read the dispute banner + timeline. If it shows **no** submission from us and the due date has not passed, evidence may still be addable — in that case treat the status as `needs_response` and use the table.
Even when it is locked: if we have **never emailed this customer**, send **Template E** today anyway. Only the customer can call the bank off — Shopify: *"If your customer has agreed that the chargeback was a mistake, then only your customer can reverse it."*

**H2 — Tracking could not be read.**
If the tracking line says *"does not register, please register first"*, is empty, or shows `NotFound`, that is **not** proof the parcel never arrived. It usually means the parcel is older than our tracking routine's 14-day window.
Do this, in order: re-run with `--registrera` (wait ~20 s, it costs 17TRACK quota) → if still nothing, paste the number into **17track.net** → if still nothing, open the carrier's own site.
Only continue with a **real carrier result**. If the result is still unreadable **one day before the evidence due date**, treat it as "no delivery proof" → row 1, and write in the order timeline that the tracking could not be verified.
If the order has **no tracking number at all**: that is a fulfilment failure, not a dispute question — give up (row 1) and tell the owner the same day.

### 1.2 Decision table

| # | What the facts show | Decision | Go to |
|---|---|---|---|
| 1 | Carrier result readable and shows **no delivery scan** | **GIVE UP** | 1.4 — the complaint cannot even be about the product yet |
| 2 | The item is **back with us** at {{RETURN_ADDRESS}} | **GIVE UP today** | 1.4 — holding both the goods and the money is indefensible |
| 3 | Customer **emailed us** a concrete fault (it broke, it tore, a part is missing) and we never offered a replacement, a refund or a return address | **GIVE UP** | 1.4 + send Template B |
| 4 | Customer asked to **return or cancel inside {{RETURN_WINDOW_DAYS}} days** and we never gave them a way to do it | **GIVE UP** | 1.4 + send Template C or D |
| 5 | They emailed us and **we answered late or not at all**, then they disputed | **GIVE UP** | §3c (one narrow exception there) |
| 6 | The order is **already fully refunded** | **FIGHT — strong** | §3e — attach the refund receipt, 3 sentences, done |
| 7 | Concrete fault, but we **did** offer replacement / refund / return address in writing, and no return has arrived | **FIGHT — medium** | §3a |
| 8 | Delivered, and the reason is **taste, regret or country of origin** ("made in China", "changed my mind", "looks cheap") — **and** they either never asked to return inside {{RETURN_WINDOW_DAYS}} days, or they did and we sent {{RETURN_ADDRESS}} and nothing came back | **FIGHT — strong** | §3b |
| 9 | **No contact with us at all** before the dispute — the fault is described only in the claim text, or there is only a bad review | **FIGHT — medium** | §3d |
| 10 | None of the above fits, or the claim text is not understandable | **ASK THE OWNER** | 1.5 |

**Rows 3 vs 9 — the mistake everyone makes.** A dispute claim that describes a fault does **not** mean the customer told *us*. Row 3 requires a message from them in `{{SUPPORT_EMAIL}}` dated **before** the dispute. No such message = row 9, and you fight.

### 1.3 Cost check — do this before you spend 20 minutes

If the amount is **below {{FIGHT_THRESHOLD}} {{CURRENCY}}** and your row is 7, 8, 9 or 10 → **give up instead**. Your hour costs more than the order.
Row 6 is the exception: it takes three minutes, always do it.
If `strid_lonar_sig_over` is **0** in the config, this check never fires — that store fights every amount.

### 1.4 Give up = two different buttons. Do not mix them up.

| The dispute is an… | Do exactly this | Why |
|---|---|---|
| **Inquiry** (Shopify says *inquiry*; the money has **not** been taken yet) | Shopify admin → **Orders** → open the order → **Refund** → full amount → **Refund**. Then re-open the dispute banner: if it still asks for a response, attach the refund receipt and submit that as your evidence. | Shopify: *"If you issue a full refund, then the cardholder can't initiate a chargeback."* |
| **Chargeback** (the money is already gone) | Shopify admin → **Orders** → open the order → the chargeback banner → **Accept chargeback**. **Do not try to refund.** | Shopify: *"You can't issue a refund after a cardholder initiates a chargeback."* Accepting returns the money to the customer. Per Shopify you are **not** refunded the chargeback fee. |

A **partial** refund is **NOT CONFIRMED** to stop an inquiry. Only a full refund is documented as an inquiry-killer — do not rely on a partial one.

### 1.5 Row 10 — asking the owner without getting stuck

Send the owner **one line**: order number, reason code, amount, due date, and the one thing you cannot decide. Then keep working.
**If there is no answer by two days before the due date, act on the default: give up** (1.4) and write in the order timeline that the owner was asked on `<date>` and did not answer. A dispute you never answer is lost automatically — that is the one outcome that is always worse than either choice.

### 1.6 Why this reason code is the hard one

It is an opinion, not a fact. Everything in this SOP is about turning that opinion into something a bank can check: a delivery scan, a product page, an email we sent, a return that never arrived.

**Our own measurement — one store, 2026-09-20, not a published rule:** of the decided disputes, **inquiries 29 won of 29**; **chargebacks 1 won of 4**. Every loss we have ever had was a chargeback.
**What is committed in the repo and can be re-checked:** `kundtjanst/korningar/baverbutiken/2026-W38.json` (run 2026-09-14) — 29 disputes in 30 days, 2 of them chargebacks, 12 open, ~5 400 {{CURRENCY}} at stake.
Our own data also shows unanswered inquiries turning into chargebacks (orders 4706, 5044, 4914). So: **chargebacks first, inquiries the same week, none ignored.**

**Counterweight, from our own ticket rules** (`kundtjanst/klassificering.mjs`, category `fel_vara`): *"Offer return + refund or partial refund fast. 'Not as described' disputes are almost always lost."* That line is our own heuristic, not a measurement — but it is why rows 1–5 come before rows 6–9 in the table. **If we genuinely shipped the wrong item, that is row 3: give up.**

---

## 2. Store configuration — the only part that changes per store

Everything else in this SOP is written once and runs on every store. These values live in **one block** in `kundtjanst/brands/<brand id>.yaml` (template: `kundtjanst/brand-mall.yaml`). For a store the factory built, `brand:` is read from `factory/butiker/<id>.yaml`. **Never type a brand name, domain, product name or address into the procedure or a template — fill it in here.**

```yaml
brand:
  namn: ""            # {{STORE_NAME}}     the name the customer sees in the email
  supportmail: ""     # {{SUPPORT_EMAIL}}  the mailbox you reply from
  shop: ""            # {{STORE_DOMAIN}}   xxxx-xx.myshopify.com
  valuta: SEK         # {{CURRENCY}}       the store's own currency
tvister:
  returadress: ""             # {{RETURN_ADDRESS}}           full postal address, one block, no abbreviations
  returfonster_dagar: 14      # {{RETURN_WINDOW_DAYS}}       the return window published on the site
  policy_url: ""              # {{POLICY_URL}}               the policy page the customer accepted at checkout
  retur_betalas_av: ""        # {{RETURN_POSTAGE_PAID_BY}}   "the customer" or "us"
  strid_lonar_sig_over: 0     # {{FIGHT_THRESHOLD}}          below this amount, give up instead of fighting. 0 = always fight
```

- **`returadress` empty → stop and ask the owner.** Do not invent an address, and never tell a customer to ship the item to the supplier or the manufacturer.
- **`retur_betalas_av` empty or missing** (it is **not yet in `kundtjanst/brand-mall.yaml`** — checked 2026-09-20): read `{{POLICY_URL}}`, the published page says who pays return postage. Use what the page says, then write it into the config block so nobody has to look again. Only if the page is silent, ask the owner once.
- **`strid_lonar_sig_over`** is set in the store's own currency by the owner.

> **Documented rule (Stripe, dispute prevention):** *"Never refer cardholders to the manufacturer in lieu of attempting to resolve the issue directly — the business selling the product or service is liable and must be the point of contact for resolution."*

---

## 3. The situations, in full

### 3a. A genuinely faulty product (rows 3 and 7)

**Signals:** a specific failure, a specific part, a specific moment. "The button broke the first time I used it." "The strap was torn when I opened the box."

**Do not fight a real defect.** Fight only the *handling* of it, and only when we handled it correctly.

1. Reply the **same day** with **Template A** (no dispute open yet) or **Template B** (a dispute is already open). Offer a choice: replacement or refund. Ask for one photo, but never make it a condition.
2. They choose a replacement → ship it. The evidence line then becomes "replacement already provided, shipped `<date>`, tracking `<number>`".
3. **They do not answer: decide for them after 5 days — or at `due date − 2 days`, whichever comes first.** The evidence deadline always wins over any waiting period in this SOP. Inquiry → full refund. Chargeback → **Accept chargeback**. Waiting for a confirmation that never comes is exactly how order 5044 turned into a chargeback.
4. They choose a return → **Template C**, then run the return watch in section 4.

Our own action text for this ticket type (`kundtjanst/klassificering.mjs`, category `skadad_defekt`): *"Ask for a photo, then replace or refund. Track the SKU — recurring = supplier problem."* **If the same part breaks on three orders, tell the owner.** That is a supplier problem, not a support problem.

**Fight (row 7) only if all three are true:** we offered a replacement or refund **in writing**, they refused or went silent, **and** the item was never returned.

### 3b. Buyer's remorse dressed as a defect (row 8)

**Signals:** the complaint names no fault. Country of manufacture, "not what I imagined", "I found it cheaper", "I don't want it any more". The product works.

This is the one row where we are usually right, and it is worth 20 minutes.

**Check first, in the inbox:** did they ask to return it **inside {{RETURN_WINDOW_DAYS}} days**? If yes and we never sent them {{RETURN_ADDRESS}}, this is row 4 — **give up**. Fighting a customer who tried to use our own published return window is a loss, and it reads badly to the bank.

**Evidence pack** (where each piece goes: section 5):
1. The delivery scan with the date and the carrier.
2. The **product page as it was at purchase** — description, photos, specifications, size/material text. Screenshot the live page full-width so the item shown matches the item shipped.
3. The email thread, including the message where we sent {{RETURN_ADDRESS}} and the terms.
4. A one-paragraph statement: what was ordered, what was delivered, that it matches the page, and that no fault has been described.
5. If a return address was sent and nothing came back: say so, with both dates.

**Do not** argue about whether the customer is allowed to dislike the product. Argue only that it was delivered, that it was accurately described, and that the route to a refund was offered and not used.

### 3c. They asked, we did not answer (row 5)

**Signals:** an email from the customer sits in the inbox, older than our reply — or with no reply at all — and the dispute came after it.

This is our failure and the bank sees it the moment they read the thread. Treat the money as gone.

1. **Give up** (1.4).
2. Send **Template D1 or D2** anyway, the same day, with one concrete fix in it.
3. **The one exception:** the amount is above {{FIGHT_THRESHOLD}} {{CURRENCY}} **and** the thread shows we did answer, just late, **and** the item was never returned. Then you may ask the owner (1.5) — with the same two-days-before-the-deadline default.
4. If you do fight one: submit the thread **complete and unedited**, with a factual line about the delay. Never submit a thread with our silence trimmed out. A bank that spots the gap stops reading the rest.
5. Write the miss into the weekly report so it is a process problem, not a person problem. An inbox where a return request can sit unanswered for a week produces this dispute again next month.

### 3d. Silent dissatisfaction (row 9)

**Signals:** no email, no ticket — sometimes only a low review. The first we hear of it is the dispute.

Fightable, and the documented way to fight it is to say so out loud.

> **Documented (Stripe, evidence field `customer_communication`):** *"Whether or not the customer attempted to resolve the issue with you prior to filing a dispute. If they didn't reach out to you before the dispute, state that clearly."* And: *"if later conversations shed light on the facts of the case, submit this with your evidence."*

1. Email them now with **Template E**. Whatever they reply becomes evidence, whichever way it points.
2. In the evidence, write one sentence in this shape: *"The customer never contacted {{SUPPORT_EMAIL}} before opening this dispute. Our first message to them was sent on `<date>`, after the dispute was opened."*
3. A public review is **not** proof of a defect and **not** a support request. If one exists, quote it flatly (*"the customer published a review on `<date>` but sent us no message"*). Do not attack it.
4. Only the customer can withdraw the dispute. Ask politely, once — it is in Template E.

### 3e. Already fully refunded (row 6)

Three minutes, every time, whatever the amount:
1. Screenshot the **Refunds** section of the order showing amount and date.
2. Write three sentences: what was ordered, that the full amount of `<amount>` was refunded on `<date>`, and that nothing is outstanding.
3. Submit. Then stop.
⚠️ If the refund was **partial**, this is not row 6 — the customer may be disputing the remainder. Re-read the table from the top with the unrefunded amount in mind.

---

## 4. Return address sent, nothing came back

The most common shape in real data. Handle it as a process, not as a memory.

1. **Log the date** you sent {{RETURN_ADDRESS}} in the order timeline (Shopify order → **Add a note / timeline comment**). If it is not written down, it did not happen.
2. State the terms in the **same** email: where to send it, that the return tracking number must be emailed to {{SUPPORT_EMAIL}}, that return postage is paid by {{RETURN_POSTAGE_PAID_BY}}, and that the refund is issued when the parcel arrives. Say it once, completely — every extra round-trip is a chance to lose the customer to the bank.
3. **Seven days after sending — or at `due date − 2 days`, whichever comes first** — if nothing has arrived and no tracking has been sent to us, send **Template F**. The deadline always wins over the seven days.
4. **At the evidence deadline**, if the item is still not back, this is your strongest line in this category. Write it flat: *"A return address was provided on `<date>`. As of `<date>` no return shipment has been received and the customer has provided no return tracking. The customer holds the goods."*
5. **If it arrives, hand the money back the same day** — but with the right button:
   - **Inquiry** → full refund on the order.
   - **Chargeback** → **Accept chargeback**. You cannot refund a chargeback.
   - **Evidence already submitted / `under_review`** → you still cannot refund a chargeback. **VERIFY IN SHOPIFY ADMIN:** open the dispute banner and see whether **Accept chargeback** is still offered. If the dispute has already been decided **in our favour**, then issue the refund on the order manually, since the money came back to us.
   Holding both the item and the money loses every time and is the one outcome the owner never wants to read about.

---

## 5. Where the evidence goes in Shopify

**Navigate:** Orders → **Search and filter** → **Add filter** → **Chargeback and inquiry status** → **Open** → open the order → the dispute banner → **Add evidence**. Buttons on that page: **Save**, **Submit now**, **Accept chargeback**. The **evidence due date** is printed in that same banner.

**VERIFY IN SHOPIFY ADMIN: the visible field labels.** The evidence form was redesigned 2025-12-17 and Shopify publishes no list of its labels. The names below are the API fields the form writes to — **match them by meaning, not by spelling**, and correct this table the first time you read the real labels.

| Put this | In the field that means | Notes |
|---|---|---|
| Your written statement (the paragraph from 3b / 3d / 3e) | `uncategorized_text` | The most important thing you write. Six to ten sentences, no more. |
| The email thread, as one PDF | `customer_communication` file slot | Include our reply times. If there was no contact, still write the sentence — the absence is the evidence. |
| Delivery scan, carrier, tracking number, ship date | `fulfillments`, `shipping_documentation` | Shopify fills carrier/tracking from the order; your screenshot adds the delivery date. |
| The return/refund policy as published | `refund_policy`, `refund_policy_disclosure` | Stripe's caveat, quoted: *"the issuer might or might not take this into consideration, but it can't hurt your case and is generally worth including."* |
| Why no refund is owed (item not returned, replacement offered) | `refund_refusal_explanation` | One paragraph, concrete dates. |
| Product page screenshot, photos the customer sent | `uncategorized_file` | One file per slot — combine same-type pages into one PDF. |
| What was ordered / that it matches what was shown | `product_description` | **NOT CONFIRMED** whether this field is editable — it may be filled from the order. If you cannot type in it, put your wording in the free-text field instead. |

**Shopify's own recommended list for this reason:** order fulfilment date and time, billing information, shipping and tracking information, and product descriptions/pictures proving accurate representation.

**File limits** (Shopify help): PDF, JPEG or PNG; 2 MB per file, 4 MB combined; PDFs "fewer than 50 pages"; images "cropped appropriately, high contrast, legible". **VERIFY IN SHOPIFY ADMIN:** the upload box states the current limit when you attach a file — if the box and this line disagree, the box is right.
Shopify notes many banks receive evidence by fax, so: black on white, no colour highlighting, 12pt or larger, no links to Drive or to {{STORE_DOMAIN}} (the reviewer will not click them).

**Relevance beats volume.** Ten pages of policy on a defect claim reads as noise. Documented: *"overwhelming the card issuer with unnecessary content can obscure your argument."*

**Timing:** **Save** as you go; press **Submit now** only when you are finished, because it locks (*"you can't make any further edits"*). After the due date *"you can't submit any further evidence"* and *"there are no exceptions to this"*. Submit at least a day early — do not test what time zone the deadline is in.
Whether Shopify Payments auto-submits the data it already holds if you add nothing is **NOT CONFIRMED**. Never rely on it; it is not a defence.

---

## 6. Email templates — copy, fill in, send

Replace only the `{{...}}` config values and the `<...>` facts. No emojis, no "unfortunately", never blame the carrier or the supplier, never mention a card-network rule.

### Template A — first reply to a fault, no dispute open yet

> **Subject:** About your order `<order number>` — let's fix this
>
> Hi `<first name>`,
>
> Thank you for telling us, and I'm sorry the `<item>` failed on you. That is not how it should arrive.
>
> Two ways I can fix it, and you choose:
>
> 1. **A replacement**, sent to you at no cost.
> 2. **A full refund of `<amount>` {{CURRENCY}}**, back to the card you paid with.
>
> If you can, reply with one photo of the fault. It takes ten seconds and it helps us stop the same thing happening to the next customer — but it is not a condition for either option above.
>
> Just reply with "replacement" or "refund" and I will start it today.
>
> `<VA first name>`
> Customer Care, {{STORE_NAME}}
> {{SUPPORT_EMAIL}}

### Template B — a fault, and a dispute is already open

> **Subject:** Order `<order number>` — I can solve this today
>
> Hi `<first name>`,
>
> I have your order in front of me and I can see the problem you described with the `<item>`. I am sorry we did not get this sorted before you had to contact your bank.
>
> I am not going to ask you to wait. Tell me which you want and I will do it today:
>
> 1. **A replacement**, shipped at our cost.
> 2. **A full refund of `<amount>` {{CURRENCY}}**.
>
> One thing I have to be honest about: while the bank case is open, the payment is held by them and not by us, so the fastest route is for you to call the number on the back of your card and tell them the shop has resolved it. Only you can withdraw the case — we cannot do it from our side. Once it is withdrawn, the refund or the replacement goes out the same day.
>
> If you would rather leave the case with the bank, that is completely fine too. Reply either way and I will follow your lead.
>
> `<VA first name>`
> Customer Care, {{STORE_NAME}}
> {{SUPPORT_EMAIL}}

### Template C — the customer wants to return it

> **Subject:** Return address for order `<order number>`
>
> Hi `<first name>`,
>
> No problem — here is everything you need to send the `<item>` back.
>
> **Send it to:**
> {{RETURN_ADDRESS}}
>
> **Three things so the refund goes through without delay:**
>
> 1. Put a note in the parcel with your order number `<order number>`.
> 2. Reply to this email with the return tracking number once you have shipped it.
> 3. Ship it within {{RETURN_WINDOW_DAYS}} days of receiving this email.
>
> The refund of `<amount>` {{CURRENCY}} goes back to your card as soon as the parcel is scanned as received at that address. Return postage is paid by {{RETURN_POSTAGE_PAID_BY}}.
>
> The full terms are here: {{POLICY_URL}}
>
> If anything about the return is unclear, reply and I will answer the same day.
>
> `<VA first name>`
> Customer Care, {{STORE_NAME}}
> {{SUPPORT_EMAIL}}

### Template D1 — we missed their email, and the refund is already done

> **Subject:** Order `<order number>` — my apology, and your refund
>
> Hi `<first name>`,
>
> You wrote to us on `<date>` and we did not reply. That is our mistake, not yours, and I am sorry — you should not have had to go to your bank to get an answer.
>
> I have refunded `<amount>` {{CURRENCY}} to your card today. It goes back to the same card you paid with and usually takes a few banking days to appear on the statement.
>
> If your bank case is still open, you may see the amount twice for a short while. If that happens, tell your bank the shop has refunded you directly so they can close their side.
>
> Again, sorry for the silence.
>
> `<VA first name>`
> Customer Care, {{STORE_NAME}}
> {{SUPPORT_EMAIL}}

### Template D2 — we missed their email, and we need one confirmation first

> **Subject:** Order `<order number>` — my apology, and a fix
>
> Hi `<first name>`,
>
> You wrote to us on `<date>` and we did not reply. That is our mistake, not yours, and I am sorry — you should not have had to go to your bank to get an answer.
>
> I am ready to refund `<amount>` {{CURRENCY}} to your card today. I only need one line back from you: reply "refund" and I will do it, or reply "replacement" if you would rather have a new one sent.
>
> If I do not hear from you by `<date, five days from today or two days before the bank's deadline, whichever is sooner>`, I will go ahead and refund you, so you do not have to chase this twice.
>
> Again, sorry for the silence.
>
> `<VA first name>`
> Customer Care, {{STORE_NAME}}
> {{SUPPORT_EMAIL}}

### Template E — they never contacted us

> **Subject:** Order `<order number>` — what went wrong with it?
>
> Hi `<first name>`,
>
> I am from customer care at {{STORE_NAME}}. Your bank has raised a case about order `<order number>`, delivered on `<delivery date>`, and this is the first we have heard that something was wrong — so I would rather ask you than guess.
>
> What is the issue with the `<item>`? If it is damaged or faulty, reply with a photo and I will send a replacement or refund you in full. If it is simply not right for you, I will send you the return address and refund you when it arrives.
>
> I can act on your reply today. The bank case usually takes far longer to resolve, and if you would rather have it sorted directly, calling the number on the back of your card and asking them to close the case is the fastest route — that part only you can do.
>
> Either way, tell me what happened and I will make it right.
>
> `<VA first name>`
> Customer Care, {{STORE_NAME}}
> {{SUPPORT_EMAIL}}

### Template F — return address sent, nothing has arrived

> **Subject:** Order `<order number>` — has the return been sent?
>
> Hi `<first name>`,
>
> On `<date>` I sent you the return address for the `<item>`. Nothing has reached us yet, so I wanted to check before this goes any further.
>
> **Return address:**
> {{RETURN_ADDRESS}}
>
> If it is already on its way, just reply with the tracking number and I will watch for it and refund `<amount>` {{CURRENCY}} the day it lands.
>
> If you have decided to keep it, that is fine too — tell me and I will close the return.
>
> If I do not hear from you, I will let your bank know that the return address was provided on `<date>` and that the item has not been returned. I would much rather refund you than do that, so please reply.
>
> `<VA first name>`
> Customer Care, {{STORE_NAME}}
> {{SUPPORT_EMAIL}}

---

## 7. Never do these

1. **Never point the customer to the manufacturer or supplier.** We sold it, we own it.
2. **Never fight a defect we ignored** (rows 3, 4, 5). That fight costs a day and loses anyway.
3. **Never quote a card-network rule, deadline, fee or win rate to a customer.** We do not have the rulebooks. Talk about our own policy and our own actions only.
4. **Never promise a refund "within X days from the bank".** Bank review time is documented inconsistently by Shopify itself (75 days / 65–75 / 30–90 / 120 in four different places). Say "as soon as it is resolved".
5. **Never try to refund a chargeback.** Shopify blocks it. The button is **Accept chargeback**.
6. **Never treat unreadable tracking as "not delivered"** (hard stop H2).
7. **Never edit an email thread before attaching it.**
8. **Never run `node sparning/kor.mjs --dagar 90` to look up an old dispute.** A live run writes fulfillment events into Shopify and old orders would get "delivered" emails months late. Use `kundtjanst/tvistfakta.mjs`, or 17track.net in your browser.
9. **Never pause or cancel anything that is already live because of a dispute.** Disputes are handled on the order, nowhere else.
10. **Never run `tvistfakta.mjs` without `--brand <brand id>`.**

---

## 8. Definition of done — tick every box before you close the ticket

- [ ] Ran `node kundtjanst/tvistfakta.mjs <order> --brand <id>` (or read the facts by hand) and noted: delivery scan, refunds, amount, **evidence due date**.
- [ ] Searched the support inbox for the order number **and** the customer's address, so I know whether this is 3a, 3b, 3c or 3d.
- [ ] Checked the two hard stops (locked / tracking unreadable).
- [ ] Found the **first** matching row, ran the cost check, and wrote the decision (FIGHT / REFUND / ACCEPT) plus one sentence of reason in the order timeline.
- [ ] Sent the customer an email today (A–F) — even when the decision is to fight.
- [ ] Giving up: **inquiry → full refund issued**; **chargeback → Accept chargeback pressed** (and I did not try to refund it).
- [ ] Fighting: statement written, product page screenshot taken, thread exported as one PDF, delivery scan attached, everything under the limit the upload box states.
- [ ] Return address sent? The date is in the order timeline, and the day-7 check is scheduled — capped at `due date − 2 days`.
- [ ] Evidence **Saved** before the due date; **Submit now** pressed only when finished, knowing it locks.
- [ ] Nothing invented: every date, amount and status in the evidence came from Shopify, the inbox or the carrier/17TRACK.

---

## 9. Worked examples — examples only, never the rule

Real orders from **one** store, so amounts are in that store's currency (SEK) and the names are that store's. Your store's values come from section 2.

| Order | What the data shows | Row | Aim for |
|---|---|---|---|
| **5044** | Button broke on first use. Support could not send a replacement because the customer never confirmed he would accept one; a return address was emailed 2026-09-20. Committed data (`2026-W38.json`, run 2026-09-14): **inquiry**, `product unacceptable`, 589 SEK, `needs response`, due 2026-09-17. The later run reads it as a **chargeback** due 2026-10-01 — i.e. it escalated. **VERIFY IN SHOPIFY ADMIN** which it is today before pressing anything. | 7 — or **3** if the thread shows we waited weeks on a confirmation | A real defect with a real offer on record: fight only with the offer email plus "no return received". If we stalled, accept. **The 5-day rule in 3a exists because of this order.** |
| **6349** | Inquiry, 389 SEK. "Manufactured in China", so he did not want it. Return address sent. Delivered 2026-09-15, due 2026-10-04. | 8 | Fight, strong. Country of origin is not a defect. Product page + delivery scan + the return offer that was not used. First check the inbox: he must not have asked to return inside {{RETURN_WINDOW_DAYS}} without an answer from us. |
| **5122** | Inquiry, 348 SEK. Damaged straps; support missed his email; return address sent afterwards. Due 2026-09-21. Committed data has it as `needs response` on 2026-09-14; the later note says `under_review`. | **H1 if `under_review`; otherwise row 5** | If locked: do not touch the evidence, but email him today — only he can withdraw it. If it is still `needs_response`, this is our miss: give up (1.4). |
| **4706** | 599 SEK, `product unacceptable`, **chargeback**, `needs response`, opened 2026-08-18, **evidence due 2026-09-20** — that is the committed data (`2026-W38.json`). No contact ever; he left a disappointed review. Delivered 2026-08-18. A later note claims this chargeback was already won and a **new inquiry** was opened 2026-09-19 for the same amount. | 9 | **VERIFY IN SHOPIFY ADMIN FIRST:** open the order and read the banner — is there an open chargeback due today, a decided one, a new inquiry, or both? Then fight the open one with the same pack plus the sentence that he never contacted us. Do not assume it is won because a note says so. |

---

## ⚠️ Gaps — known, not guessed

- [ ] Whether an unanswered `product_unacceptable` **inquiry** escalates into a chargeback is **NOT CONFIRMED** in Shopify's documentation. Our own data shows three orders that took that path (4706, 5044, 4914). Our measurement, not a published rule.
- [ ] Win rates per reason code are published by nobody. Never quote a percentage beyond our own measured 29/29 inquiries and 1/4 chargebacks, and always say which store and which date.
- [ ] The **chargeback fee** amount is **NOT CONFIRMED**. **VERIFY IN SHOPIFY ADMIN:** Settings → Payments → the payout/transaction showing the dispute debit.
- [ ] Whether a **partial** refund ends an inquiry is **NOT CONFIRMED**. Only a full refund is documented as an inquiry-killer.
- [ ] Whether `product_description` is editable in the evidence form is **NOT CONFIRMED**.
- [ ] The evidence form's visible labels after the 2025-12-17 redesign are undocumented. Section 5 maps by meaning; fix the table the first time you read the real labels.
- [ ] `retur_betalas_av` / {{RETURN_POSTAGE_PAID_BY}} is **not in `kundtjanst/brand-mall.yaml`** as of 2026-09-20. Until the owner adds it, read {{POLICY_URL}}.
- [ ] `tvistfakta.mjs` defaults to one specific store when `--brand` is omitted. Until that default is removed, the flag is mandatory.

<!--
REVIEW: fixed 18 defects.

INVENTED / OVERSTATED AS FACT (fixed):
1. "No delivery scan → give up" treated an unreadable 17TRACK result as proof of non-delivery. Our own tool documents that parcels older than 14 days answer "does not register, please register first". Now hard stop H2, with a 3-step escalation and a dated fallback.
2. "under_review = evidence already submitted" stated as fact → now VERIFY IN SHOPIFY ADMIN, with the case where nobody submitted anything.
3. Shopify file limits (2 MB / 4 MB / 50 pages) stated verbatim → kept, but the upload box now overrides the line.
4. "product_description is read-only in the API" → NOT CONFIRMED + a workaround either way.
5. "Shopify Payments still auto-sends the data it holds" → NOT CONFIRMED, explicitly not a defence.
6. Measured numbers (29/29, 1/4, "50 disputes") had no re-checkable anchor → anchored to the committed run kundtjanst/korningar/baverbutiken/2026-W38.json (2026-09-14: 29 disputes/30 days, 2 chargebacks, 12 open) and labelled one store, one date.

INTERNAL CONTRADICTIONS (fixed):
7. Row 8 and §4.5 said "refund today" when a returned item arrives, while §1 quotes Shopify that a chargeback cannot be refunded. Split per dispute type: inquiry = refund, chargeback = Accept, decided-in-our-favour = manual refund.
8. Waiting periods could blow the deadline: the 5-day rule (3a) and the day-7 return check (§4) now cap at due date - 2 days, stated as the rule that always wins.

NOT ACTIONABLE (fixed):
9. Row 6 "give up unless the order is large" → measurable ({{FIGHT_THRESHOLD}}) plus a hard default so the VA is never blocked waiting for the owner; same pattern added for the new row 10.
10. No row precedence: overlapping rows (esp. "fault we ignored" vs "no contact at all") could both look right. Now first-match-wins, give-ups ordered first, and an explicit rule that a fault described only in the claim text is row 9, not row 3.
11. "Inquiry → issue a full refund" had no click path → Orders → order → Refund, plus the follow-up check on the banner.
12. Template D forced the VA to send an either/or sentence ("I have refunded / I am ready to refund") → split into D1 and D2, both complete.
13. No fallback when tvistfakta.mjs cannot run (a store without Shopify keys) → manual fact table, which is what makes this SOP usable on a store that is not yet wired up.
14. Row 6/9 (already refunded) had no procedure → new §3e, three steps, with the partial-refund trap called out.

PORTABILITY (fixed):
15. Template C referenced a config field `retur_betalas_av` that does not exist in kundtjanst/brand-mall.yaml (checked 2026-09-20) → {{RETURN_POSTAGE_PAID_BY}} added to the config block, with a fallback the VA can resolve alone ({{POLICY_URL}}) and a gap entry.
16. tvistfakta.mjs silently defaults to one named store when --brand is omitted → now mandatory, in §0, in "Never do these" and in the DoD. This was the only real hardcoded-brand leak left, and it was in the tooling, not the prose.
17. Section 9 relabelled "examples only, never the rule" with the currency called out as that store's.

WRONG ON THE DATA (fixed):
18. Worked example 4706 claimed the chargeback was "already won" and a new inquiry had opened. The committed weekly run shows a chargeback, product_unacceptable, 599 SEK, needs_response, evidence due 2026-09-20 - i.e. due TODAY. The example now leads with the committed facts and marks the "already won" claim as VERIFY. Same treatment for 5044 (committed run: inquiry, 589, due 2026-09-17; the chargeback due 2026-10-01 is the escalation) and 5122 (needs_response on 2026-09-14, under_review later).
Also added the counterweight from our own klassificering.mjs (fel_vara: "'Not as described' disputes are almost always lost"), which the original quoted around; row 8 now requires that the customer did not ask to return inside the published window.

CANNOT BE RESOLVED WITHOUT THE OWNER:
- {{FIGHT_THRESHOLD}} (strid_lonar_sig_over) is 0 in every brand file today, so the cost check never fires and VAs will fight 100-unit disputes. The owner must set a real number per store.
- retur_betalas_av must be added to kundtjanst/brand-mall.yaml and filled per store.
- 4706 needs a human to look at the order today: per committed data its evidence is due 2026-09-20.
- Whether the owner wants VAs to email a customer whose dispute is locked (H1) - this SOP says yes, because only the customer can withdraw.
-->
