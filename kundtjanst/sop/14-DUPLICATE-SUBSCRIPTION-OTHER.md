# SOP 14 — Rare reason codes: `duplicate`, `subscription_canceled`, `general`

**Use this when:** the dispute reason Shopify prints on the order is `duplicate`, `subscription_canceled` or `general`. Any other code: open `00-MASTER.md` and take the SOP listed there.

**Owner:** customer-support VA · **Time:** 10–20 min per dispute · **Escalation:** `{{ESCALATION_CHANNEL}}`

**Language:** everything you submit to the bank is written in **English**. The email to the customer is written **in the language the customer wrote in** — if they have never written, use English unless `{{STORE_COUNTRY}}` has its own language, then use that. Keep the English original in the ticket.

**How often you will need this:** almost never. *Measured in this store's own dispute pull, 30 days to 2026-09-14, 29 disputes: 20 `product_not_received`, 4 `credit_not_processed`, 2 `general`, 2 `product_unacceptable`, 0 `duplicate`, 0 `subscription_canceled`.* If you open this SOP more than a few times a month, something changed — tell `{{ESCALATION_CHANNEL}}`.

---

## 0. Decide in 60 seconds

Read these three lines off the dispute in the admin **before** anything else: **type** (inquiry or chargeback), **amount**, **evidence due date**.

| Type | What already happened | What you can still do |
|---|---|---|
| **Inquiry** | The bank is asking. The money is still yours. | Submit evidence · or issue a **full refund** · or accept |
| **Chargeback** | *"The bank takes the disputed amount from you right away"* plus a fee. | Submit evidence · or **accept**. **You cannot refund** — Shopify: *"You can't issue a refund after a cardholder initiates a chargeback."* |

**The two rules that decide most cases:**

1. **Inquiries are winnable, chargebacks mostly are not.** *Our own measurement, 50 disputes, 2026-09-20: inquiries **29 of 29 decided cases won**; chargebacks **1 of 4**. In that pull, every decided loss was a chargeback.* So: work inquiries the same day. On a chargeback, be honest about whether you can prove anything — a hopeless fight buys nothing.
2. **Can we show a delivery scan to the customer's own address?** If yes, you almost always FIGHT. If no, you almost always REFUND (inquiry) or ACCEPT (chargeback).

| Your case | Decision |
|---|---|
| Delivery scan exists, and our order data explains the charge | **FIGHT** |
| No delivery scan, no refund ever paid, nothing else to show — **inquiry** | **REFUND in full** |
| No delivery scan, nothing to show — **chargeback** | **ACCEPT** (refund is not possible) |
| We really did charge twice / we really did fail them — **inquiry** | **REFUND in full** |
| We really did charge twice / we really did fail them — **chargeback** | **ACCEPT** |
| Amount below `{{FIGHT_THRESHOLD}}` and the facts are messy | **REFUND / ACCEPT** — VA time costs more than the order |
| You genuinely cannot tell what is being claimed | **ASK OWNER** — and read the deadline rule below |

> **ASK OWNER never means "wait and see".** Post in `{{ESCALATION_CHANNEL}}` with the order number, the amount and the deadline. **If there is no answer 2 days before the evidence due date, you decide:** inquiry → submit the best pack you have; chargeback with no proof → accept. A dispute lost to a passed deadline is the one outcome that is always our fault.

> **Translating the tool's wording:** `tvistfakta.mjs` (§2) prints only `FIGHT`, `REFUND` or `ESCALATE`. **On a chargeback, its `REFUND` means ACCEPT** — the tool does not check whether a refund is still possible, and Shopify blocks refunds once a chargeback is open. *(Verified in `kundtjanst/test/tvistfakta.test.mjs`: the stuck-parcel chargeback case returns `REFUND`.)* `ESCALATE` means "a human must look", not "skip it".

---

## 1. Which of the three is it, and is it even our dispute?

Read the reason code exactly as Shopify prints it on the order. Never guess it from the customer's wording.

| Reason code | What the cardholder is claiming | Go to | First question you must answer |
|---|---|---|---|
| `duplicate` | "You charged me twice for the same thing." | §4 | Are there **two charges**, or **two disputes on one charge**? Not the same thing. |
| `subscription_canceled` | "You kept charging me after I cancelled." | §5 | Does this store sell subscriptions at all? Usually **no** — but check, do not assume. |
| `general` | The bank filed it uncategorised. | §6 | Can we find out what they actually want? |

**Stop-first check, every time:** does this dispute exist in **the store you are logged into**? The owner runs several stores; order numbers overlap between them.

*Worked example (from our own ticket list, 2026-09-20): on order #4825 the VA wrote "what store? No record of chargeback". That was the correct outcome — she searched the store she had open and there was no dispute on that order there. She stopped and wrote down which store she checked.*

If you cannot find the dispute in this store's admin: **do not work it.** Write in the ticket which store you checked and which order number you searched, and post it in `{{ESCALATION_CHANNEL}}` so it can be checked in the sister store.

**VERIFY IN SHOPIFY ADMIN — all open disputes in this store:** **Orders → Search and filter → Add filter → Chargeback and inquiry status → Open.**

---

## 2. Before anything: run the one command

From the **repo root**:

```bash
node kundtjanst/tvistfakta.mjs <order number> --brand <store id>
node kundtjanst/tvistfakta.mjs --alla --brand <store id>          # every open dispute in the store
node kundtjanst/tvistfakta.mjs <order number> --brand <store id> --registrera   # only if tracking is unreadable
```

**Always pass `--brand`.** Left out, the tool silently falls back to one specific store — the first one it was written for — and you will read the wrong shop's data. *(Verified in `kundtjanst/tvistfakta.mjs`: the `--brand` flag has a hardcoded default.)*

It prints: type (inquiry/chargeback), reason, amount, evidence due date and days left, a **DECISION** line, the evidence to attach, the risk, then the order facts — date, total, payment and fulfilment status, destination, billing-matches-shipping, tracking status and delivery date, every refund ever issued, and the items. Paste the whole output into the ticket.

**It is read-only against Shopify.** It cannot submit evidence, accept a dispute or move money. `--registrera` writes only to 17TRACK (it registers the tracking number and costs quota).

**What the tool prints for these three codes — know this before you read the line:**

| Code | What the tool decides | Why |
|---|---|---|
| `duplicate` | **always `ESCALATE`** | Two charges must be compared by a human. That is your instruction to do §4, not permission to skip the dispute. |
| `subscription_canceled` | **no branch exists** — falls through to the default | It prints *"has no specific playbook"*. Use §5, not the tool's wording. |
| `general` | **`FIGHT`** if there is a delivery scan, **`ESCALATE`** if the parcel is not delivered | The tool cannot read the inbox or the issuer claim. You can. |
| any code, **no tracking number at all** | **`ESCALATE`** — *"Fulfilment is broken"* | Nothing was ever shipped, or the fulfilment was created without a number. Post it in `{{ESCALATION_CHANNEL}}` the same day. |

**Normal, not a bug:** tracking numbers older than ~14 days are not registered with 17TRACK yet and come back as *"does not register, please register first"*. *(Measured 2026-09-20: all twelve dispute orders answered that way — they were older than the tracking routine's 14-day window.)* Use `--registrera` for that one order.

**Never** run `node sparning/kor.mjs` sharp to check a dispute. A sharp run writes fulfilment events into Shopify and triggers delivery emails to hundreds of old customers. If you ever need that tool at all, it is `--torr` (reads, writes nothing).

**If the tool errors:**

| Message | What it means | What you do |
|---|---|---|
| `Shopify is not connected for <store> (missing …)` | The store's API keys are not in the environment | Post the missing variable names in `{{ESCALATION_CHANNEL}}`. Work the dispute by hand in the admin meanwhile. |
| `Disputes could not be read: … 403 … read_shopify_payments_disputes` | The app lacks the dispute scope | Same — owner fixes it. |
| `Disputes could not be read: … not Shopify Payments …` | **This store does not use Shopify Payments** | Then this SOP's admin paths do not apply. Disputes live with the payment provider (Klarna, Stripe, PayPal). Ask the owner where to respond. |

---

## 3. Store config — the only store-specific values

One block per store in `kundtjanst/brands/<store id>.yaml` under `tvister:`. **Nothing fills these in for you** — no script reads them; you copy the values out of the YAML into the email. Never type a brand name, domain or address into the procedure or the templates.

| Placeholder | YAML key | Example only — never the rule |
|---|---|---|
| `{{STORE_NAME}}` | `brand.namn` | Example Store AB |
| `{{STORE_DOMAIN}}` | derived from the store | example.se |
| `{{STORE_COUNTRY}}` | `brand.land` | SE |
| `{{SUPPORT_EMAIL}}` | `brand.supportmail` | support@example.se |
| `{{RETURN_ADDRESS}}` | `tvister.returadress` | full postal address, one line per row |
| `{{RETURN_WINDOW_DAYS}}` | `tvister.returfonster_dagar` | 14 in one market, 90 in another — read the store's own page, never assume |
| `{{CURRENCY}}` | `brand.valuta` | SEK |
| `{{POLICY_URL}}` | `tvister.policy_url` | the policy page shown at checkout |
| `{{BILLING_DESCRIPTOR}}` | `tvister.billing_descriptor` | the text on the customer's bank statement |
| `{{FIGHT_THRESHOLD}}` | `tvister.strid_lonar_sig_over` | below this amount refunding beats fighting; **`0` = always fight**, and `0` is the default |
| `{{ESCALATION_CHANNEL}}` | `discord.kanal` | the store's support channel |

**Measured 2026-09-20: the store file that exists today has no `tvister:` block at all.** The block is documented in `kundtjanst/brand-mall.yaml` but not filled in anywhere. Before you send any template below, check the YAML. If the values are missing, ask the owner once in `{{ESCALATION_CHANNEL}}` for return address, policy URL, return window, billing descriptor and `{{FIGHT_THRESHOLD}}`, add them to the file, and they are done for every future dispute in that store.

**VERIFY IN SHOPIFY ADMIN:** if `billing_descriptor` is empty, read it at **Settings → Payments → Customer billing statement**. Do not guess it — a wrong descriptor is itself a cause of disputes.

**Per-case placeholders** (these come from the order, not from the config — fill them by hand every time): `{{CUSTOMER_FIRST_NAME}}`, `{{ORDER_NUMBER}}`, `{{ORDER_A}}`, `{{ORDER_B}}`, `{{DATE}}`, `{{DATE_A}}`, `{{DATE_B}}`, `{{AMOUNT}}`, `{{AMOUNT_A}}`, `{{AMOUNT_B}}`, `{{ITEMS_A}}`, `{{ITEMS_B}}`, `{{CARRIER}}`, `{{TRACKING_NUMBER}}`, `{{TRACKING_A}}`, `{{TRACKING_B}}`, `{{FULFILMENT_DATE}}`, `{{DELIVERY_DATE}}`, `{{AGENT_NAME}}`.

> **Hard rule: no email and no evidence text leaves you containing `{{`.** Search the draft for `{{` before you send. A customer who receives `{{RETURN_ADDRESS}}` will not trust anything else in the mail.

---

## 4. `duplicate` — "you charged me twice"

### Decide

| What you find | Decision | Why |
|---|---|---|
| Two separate orders, different items, two fulfilments | **FIGHT** | Each charge bought something different, and our order data proves it. |
| Two orders, **identical** items, minutes apart, **both** shipped | **FIGHT (weak)** | Two parcels left. Show both tracking numbers. If only one parcel exists, go to the row below. |
| Two orders, identical items, **only one fulfilled** | Inquiry → **REFUND the unfulfilled one in full** · Chargeback → **ACCEPT** | We charged twice and shipped once. We deserve to lose this. |
| Only **one** order and one charge in the admin | **FIGHT** | The second charge is not ours. Say so plainly and check the descriptor (§3). |
| Two **disputes** on one order (not two charges) | **Not a duplicate at all** — see the box | Handle each dispute under its own reason code. |
| Amount below `{{FIGHT_THRESHOLD}}` and the facts are messy | **REFUND / ACCEPT** | Cheaper than the hours. |

> **Two disputes ≠ two charges.** *Measured in this store's dispute pull, 30 days to 2026-09-14: of 29 disputes, **two orders carried two disputes each**. One had two `product_not_received` inquiries filed the same day for **348 and 255 {{CURRENCY}}** — one order, disputed twice for different line amounts. The other had two `general` inquiries: 509 {{CURRENCY}} **won** on 2026-08-31, and a new one for 508.99 {{CURRENCY}} filed 2026-09-07.* Each dispute has its own deadline and its own evidence pack. Never submit the same pack twice with the wrong amount on it, and never assume a win closed the matter.

### Steps

1. **Find every order this customer has.** Admin → **Customers** → search the customer's **email address** → the customer page lists all their orders. (Searching the order number only ever finds one.) Write down date, amount, items and fulfilment status for each.
2. **VERIFY IN SHOPIFY ADMIN — is the second charge even a charge?** Open the order → the **Payment / Transactions** section. An authorisation that was voided or never captured can appear on a customer's statement as a pending line and disappear by itself. If that is what happened, say so in the email and in the evidence instead of claiming "it is not ours".
3. Screenshot both order pages so **both order numbers, both dates, both item lists and both amounts** are legible.
4. Screenshot both fulfilments with their **separate tracking numbers**. Two tracking numbers is the single strongest thing you can show for this code.
5. If both purchases shipped in **one** parcel, add the packing list showing both.
6. Combine the screenshots into **one file per evidence type** and check the size limits in §8.
7. Write the explanation into the evidence form (§8) in three sentences: what the disputed charge bought, what the other charge bought, and how they differ.
8. If there really is one delivery behind two charges: **inquiry → refund the extra charge in full now** and do not submit evidence; **chargeback → accept it** and note the double charge in the ticket so the owner sees it.

### Email — two real orders (send before submitting)

> Subject: Your two orders with {{STORE_NAME}} — order {{ORDER_A}} and {{ORDER_B}}
>
> Hi {{CUSTOMER_FIRST_NAME}},
>
> Thank you for getting in touch, and I am sorry for the worry — seeing two charges from the same shop is alarming, and I want to show you exactly what they are.
>
> You have two separate orders with us:
>
> - Order {{ORDER_A}}, placed {{DATE_A}}, {{AMOUNT_A}} {{CURRENCY}} — {{ITEMS_A}} — sent with tracking {{TRACKING_A}}.
> - Order {{ORDER_B}}, placed {{DATE_B}}, {{AMOUNT_B}} {{CURRENCY}} — {{ITEMS_B}} — sent with tracking {{TRACKING_B}}.
>
> They are two different purchases, shipped in two different parcels, so both charges are correct. On your bank statement both will appear as {{BILLING_DESCRIPTOR}}.
>
> If you only wanted one of them, that is no problem at all: you have {{RETURN_WINDOW_DAYS}} days to return one, and I will refund it as soon as it reaches us at {{RETURN_ADDRESS}}. Our full policy is here: {{POLICY_URL}}
>
> If you have already asked your bank about this, please tell them the matter is resolved — once a claim is open, only you can withdraw it.
>
> Just reply to this email and I will sort it out.
>
> Best regards,
> {{AGENT_NAME}} — Customer Support
> {{SUPPORT_EMAIL}} · {{STORE_DOMAIN}}

### Email — we really did charge twice

> Subject: You were charged twice — I have refunded it, order {{ORDER_B}}
>
> Hi {{CUSTOMER_FIRST_NAME}},
>
> You were right, and I am sorry. Order {{ORDER_B}} was a duplicate of order {{ORDER_A}}: the same items, ordered the same day, and only one parcel was ever sent.
>
> I have refunded {{AMOUNT_B}} {{CURRENCY}} today. Banks normally show it within a few business days, on the card you paid with.
>
> You keep the parcel from order {{ORDER_A}} — nothing needs to be returned and nothing else is owed.
>
> If you have opened a claim with your bank, please let them know it is settled, so it is not counted twice.
>
> Thank you for your patience.
>
> {{AGENT_NAME}} — Customer Support
> {{SUPPORT_EMAIL}} · {{STORE_DOMAIN}}

*(If the dispute is already a chargeback you cannot refund. Then accept it and send the same mail with the refund sentence replaced by: "Your bank has already reversed the charge, so the money is on its way back to you through them.")*

---

## 5. `subscription_canceled` — "you charged me after I cancelled"

### Decide

| What you find | Decision | Why |
|---|---|---|
| **This store sells no subscriptions** (the usual case — but you must check first) | **FIGHT** | One-off purchase, one charge. Show the single order and its delivery. |
| Store sells subscriptions and the customer cancelled **before** this charge | Inquiry → **REFUND** · Chargeback → **ACCEPT** | They are right. Fighting loses and burns the deadline. |
| Store sells subscriptions and the cancellation took effect **later** | **FIGHT** | The charge fell inside the paid period — give the exact dates. |
| The charge was one **instalment** of a single purchase, not a renewal | **FIGHT** | State plainly that the payment was an instalment of one order, and show the order. Do **not** claim the card network forbids this code for instalments — we have not read the rulebooks (§11). |
| Store sells subscriptions and nobody can reconstruct what was cancelled | **ASK OWNER** (deadline rule, §0) | Do not invent a cancellation history. |

**VERIFY IN SHOPIFY ADMIN — do this before you claim the store has no subscriptions. It decides everything:**

1. **Settings → Apps and sales channels** → read the installed app list. Is there a subscription / recurring-billing app?
2. **Orders → the disputed order** → read the order timeline and the payment section for any subscription or contract reference.
3. **Orders → Search and filter →** filter by the customer's email → do they have repeating charges of the same amount, month after month?

If 1–3 all come back empty, you can write "this store has no subscriptions" as a fact. If any of them is unclear, write down what you saw and ASK OWNER.

### Steps (no-subscription case — the usual one)

1. Confirm in the admin: one order, one charge, one fulfilment.
2. Check whether the customer has **other, undisputed** orders with us. A history of charges they never questioned is worth stating.
3. Write into the evidence form, in your own words but with this substance: *"{{STORE_NAME}} sells one-off physical products only. There is no subscription app installed and no recurring billing in this shop. Order {{ORDER_NUMBER}} was a single purchase placed {{DATE}} for {{AMOUNT}} {{CURRENCY}}, fulfilled {{FULFILMENT_DATE}} with {{CARRIER}} tracking {{TRACKING_NUMBER}}, delivered {{DELIVERY_DATE}}. There is no recurring agreement to cancel and there is no second charge from us."*
4. Attach: the order confirmation, the fulfilment/tracking page showing the delivery scan, and the policy page from `{{POLICY_URL}}`.
5. Send the email below. If the customer answers and names a charge that is not ours, put that sentence into the evidence too.

### Email

> Subject: About the recurring charge you mentioned — order {{ORDER_NUMBER}}
>
> Hi {{CUSTOMER_FIRST_NAME}},
>
> Thank you for writing, and I understand the concern — an unexpected recurring charge is not something anyone wants to see.
>
> I have checked your account carefully. {{STORE_NAME}} only sells one-off products: there are no subscriptions, no memberships and no recurring billing in our shop at all. We have exactly one charge from you — order {{ORDER_NUMBER}}, placed {{DATE}} for {{AMOUNT}} {{CURRENCY}}, delivered on {{DELIVERY_DATE}}.
>
> So if your card is being charged every month, it is coming from somewhere else, not from us. On your statement our charge reads {{BILLING_DESCRIPTOR}}. If the repeating line on your statement has a different name, send me a photo or screenshot of it and I will help you work out who it belongs to.
>
> And if it is our order you want to undo: you have {{RETURN_WINDOW_DAYS}} days to return it to {{RETURN_ADDRESS}} and I will refund you as soon as it arrives.
>
> I am here — just reply to this email.
>
> {{AGENT_NAME}} — Customer Support
> {{SUPPORT_EMAIL}} · {{STORE_DOMAIN}}

---

## 6. `general` — uncategorised claim

The bank filed this without a category. **Ask first, then answer under the real reason.** Stripe's published instruction for this code is not an evidence list but *"contact the customer for additional details to find out why they disputed the payment"* — guidance, not a rule we can enforce.

### Decide

| What you find | Decision | Why |
|---|---|---|
| The issuer claim names a real problem (not received / not as described / refund owed) | **Use that code's SOP** — `00-MASTER.md` | Relevance beats volume. Never submit a policy page against a delivery claim. |
| No claim text, but tracking shows **DELIVERED** with a date | **FIGHT** | A delivery scan to the cardholder's own address is our strongest evidence. The tool prints FIGHT here too. |
| No claim text and the parcel is **not delivered** — inquiry | **REFUND in full** | Nothing to prove. The tool prints ESCALATE here because it cannot read the inbox; if the inbox and the issuer claim add nothing, overrule it and write down that you did. |
| No claim text and the parcel is **not delivered** — chargeback | **ACCEPT** | Refunding is no longer possible. |
| Billing and shipping addresses **do not match** | **Flag, then decide** — see the box | A mismatch is a signal, not proof. |
| Claim unreadable and amount below `{{FIGHT_THRESHOLD}}` | **ACCEPT / REFUND** | Cheaper than the hours. |
| Large amount | **FIGHT, and read the inbox first** | At that size always work the case, even if it looks weak. *(For scale: our largest dispute in the 2026-09-20 pull was 1262.20 SEK — though that one is a `credit_not_processed` case, not a `general` one.)* |

> **About the address mismatch.** `tvistfakta.mjs` compares **street line 1 and postcode as exact text** — nothing more. *(Verified in the code.)* A "mismatch" is therefore just as often a typo, a work address, or a gift sent to someone else. Open the order and look at the two addresses yourself. Only if they are genuinely different people or different countries treat it as possible card fraud, and then ASK OWNER — fighting real fraud loses and still costs the fee.

> **A win does not close the file.** *Measured in the same 30-day pull: one order carried two `general` inquiries — 509 {{CURRENCY}} won on 2026-08-31, then a new one for 508.99 {{CURRENCY}} filed a week later.* If an order you already won shows a new dispute, it is a **new** dispute with a new deadline. Work it from scratch.

### Steps

1. Open **Orders → the disputed order → the chargeback/inquiry banner** and read the **issuer claim** if one is attached — Shopify describes it as *"a document from the card-issuing bank that explains why the buyer opened a chargeback or inquiry."* It usually renames the dispute for you.
2. **Search the support inbox for the order number AND the customer's email address.** Two things you must know before you draft anything: *did anyone promise them a refund*, and *did anyone miss their email?*
   *From our own tickets, 2026-09-20: on order #5122 support missed the customer's mail asking to return damaged straps, and on order #5044 a replacement was never sent because nobody chased the customer's confirmation. Both are `product_unacceptable` disputes, cited here only as the inbox lesson: a missed email turns a winnable case into one we can only partly defend.*
3. Run `tvistfakta.mjs` (§2) and paste the output into the ticket: delivery date, refund history, address match.
4. Send the email below and give the customer a real chance to withdraw. Shopify: *"If your customer has agreed that the chargeback was a mistake, then only your customer can reverse it."* Do not wait for an answer past **3 days before the deadline** — submit, and send the withdrawal request anyway.
5. Submit the standard pack (§8) with a short factual narrative. Shopify's own recommended evidence for this code: product details ordered, fulfilment date and time, billing information, IP address and country of the order, customer communications, shipping confirmations, and proof of any earlier refund or replacement.
6. If you still cannot tell what is being claimed: write what you found in the ticket and **ASK OWNER** — with the deadline rule in §0. Do not submit a guess, and do not let it time out either.

### Email

> Subject: Your bank has raised a claim on order {{ORDER_NUMBER}} — can you tell me what happened?
>
> Hi {{CUSTOMER_FIRST_NAME}},
>
> Your bank has opened a claim on your order {{ORDER_NUMBER}} from {{DATE}}, {{AMOUNT}} {{CURRENCY}}. The claim does not say what went wrong, and I would much rather fix the actual problem than argue with a bank about it.
>
> Here is what our records show: the order was sent with {{CARRIER}}, tracking {{TRACKING_NUMBER}}, and the carrier recorded it as delivered on {{DELIVERY_DATE}}.
>
> So that I can help, could you tell me which of these it is?
>
> 1. The parcel never reached you.
> 2. It arrived, but it is damaged, faulty or not what you expected.
> 3. You were promised a refund you have not received.
> 4. You do not recognise the charge — on a statement it reads {{BILLING_DESCRIPTOR}}.
> 5. Something else.
>
> Whichever it is, I can sort it out directly: a replacement, a return to {{RETURN_ADDRESS}} within {{RETURN_WINDOW_DAYS}} days, or a refund. Our policy is here: {{POLICY_URL}}
>
> One thing I cannot do for you: once a claim is open with your bank, only you can withdraw it. So if we settle this between us, please also tell your bank the matter is closed.
>
> Just reply to this email — I read every one.
>
> {{AGENT_NAME}} — Customer Support
> {{SUPPORT_EMAIL}} · {{STORE_DOMAIN}}

*(If the parcel is **not** delivered, delete the tracking paragraph and write instead: "Here is what our records show: the parcel was handed to {{CARRIER}} on {{FULFILMENT_DATE}}, tracking {{TRACKING_NUMBER}}, and the carrier has not recorded a delivery. That is our problem, not yours — tell me whether you want a refund or a replacement and I will do it today.")*

---

## 7. When the customer never contacted us at all

This is common and it is **not** a problem for our case — it is a point in our favour. It is also not a reason to stay silent.

**Do all four, in this order:**

1. **Email the customer now**, even though the dispute is already open. Use the §6 email. Our first contact being dated after the dispute is fine; having no contact at all is worse.
2. **Write one line into the evidence**, in the free-text field: *"The customer did not contact {{SUPPORT_EMAIL}} before filing this claim. Our first contact was our email of {{DATE}}, sent after the dispute was opened, offering a refund, a replacement or a return."* Stripe's guidance is explicit about saying it: *"If they didn't reach out to you before the dispute, state that clearly."*
3. **Prove we were reachable:** attach the store's contact page or the order confirmation showing `{{SUPPORT_EMAIL}}`.
4. **Search the inbox anyway** before you write "no contact" — under the order number *and* the email address, spam folder included. Writing "the customer never contacted us" when they did, and we missed it, is the one mistake that destroys a case in front of a bank.

---

## 8. What to actually type into Shopify

**Navigate:** **Orders** → the disputed order → the chargeback/inquiry banner → **Add evidence**.

**VERIFY IN SHOPIFY ADMIN:** the form's visible labels are not documented and the form has been redesigned. The field **names** below are the API names for the same data. Match them to whatever your form calls them today, and note what you saw the first time so the next VA does not have to guess. If a field does not exist in your form, put the text in the free-text / uncategorised box.

| Put this | In this field | Use it for |
|---|---|---|
| Your three-sentence explanation of the two charges, or of "we sell no subscriptions", or the general narrative | `uncategorized_text` (free text) | all three codes — **this is where the duplicate explanation goes.** There is no dedicated duplicate-charge field. |
| Carrier, tracking number, ship date | `fulfillments` | all three |
| Customer email, first name, last name | `customer_email_address`, `customer_first_name`, `customer_last_name` | all three |
| Shipping and billing address | `shipping_address`, `billing_address` | all three |
| The refund/return policy text and where it was shown before purchase | `refund_policy_disclosure` | `duplicate`, `general` |
| Why no refund is owed | `refund_refusal_explanation` | `general`, `duplicate` |
| Cancellation policy text and where it was shown | `cancellation_policy_disclosure` | `subscription_canceled` |
| Why the charge is still valid / what was actually cancelled | `cancellation_rebuttal` | `subscription_canceled` |
| Whether the customer contacted us before filing (§7) | `access_activity_log` / free text | **all three, always** |

**Files.** Shopify's help pages state: PDF, JPEG or PNG · **2 MB per file, 4 MB combined** · PDFs under 50 pages · cropped, high-contrast and legible, because many banks receive the evidence by fax and it must read in black and white. **VERIFY IN SHOPIFY ADMIN:** the upload box states the limits that actually apply today — if it says something else, the box wins. Combine same-type screenshots into a single file. **No links** to Drive or to our own site; assume nobody clicks them.

**Buttons.** **Add evidence** → **Save** (you can keep editing until the due date) → **Submit now** only when you are finished, because after Submit now *"you can't make any further edits"*. If you save and add nothing else, Shopify sends what is there on the due date. After the deadline nothing more can be submitted — *"There are no exceptions to this."*

**Accepting.** Shopify: *"If you agree that a chargeback is valid, then you can accept the chargeback without submitting evidence"* — the amount goes to the customer and the fee is not returned. **VERIFY IN SHOPIFY ADMIN:** find the accept wording in the dispute banner of your store and write it into this SOP the first time you use it. Accepting is a decision you record in the ticket — letting the deadline pass quietly is not the same thing and is never the plan.

---

## 9. Fight or give up — the honest version

- **Inquiry first, same day.** *Our measurement, 50 disputes, 2026-09-20: inquiries 29 of 29 decided cases won, chargebacks 1 of 4. Every decided loss in that pull was a chargeback.*
- **Accepting is allowed and is not a confession.** Stripe notes that the networks count how many disputes you **receive**, not how many you win — so a hopeless fight buys nothing except your hours.
- **A full refund on an inquiry protects you from the escalation.** Shopify: *"If you issue a full refund, then the cardholder can't initiate a chargeback."* That is what the quote says. It does **not** say an already-open inquiry disappears — after refunding, re-open the order and check the dispute's status, and answer it if it is still asking. **Partial** refunds have no documented effect at all; do not rely on one.
- **You cannot refund a chargeback.** *"You can't issue a refund after a cardholder initiates a chargeback."* Evidence or accept, nothing else.
- **Decisions are final.** No appeal, no extra evidence afterwards.
- **Below `{{FIGHT_THRESHOLD}}`, refund and move on.** Note that `{{FIGHT_THRESHOLD}}` is `0` by default, and `0` means *always fight* — if you think that is wrong for your store, that is an owner decision, not yours.

---

## 10. Definition of done — tick every box, per dispute

- [ ] Confirmed the dispute exists in **this** store's admin (not a sister brand), and wrote down which store you checked.
- [ ] Type read: **inquiry or chargeback** — and the decision matched (chargeback ⇒ evidence or accept, never refund).
- [ ] Reason code read from Shopify, not from the customer's wording.
- [ ] `node kundtjanst/tvistfakta.mjs <order> --brand <store id>` run from the repo root, `--brand` passed, output pasted into the ticket.
- [ ] Evidence due date written in the ticket; the dispute worked at least **3 days** before it (our tvistkoll alarms at 3 days).
- [ ] Support inbox searched for the order number **and** the email address; any promise or missed email written down.
- [ ] `duplicate`: both orders listed with dates, amounts, items and **both** tracking numbers — or the extra charge refunded (inquiry) / accepted (chargeback).
- [ ] `subscription_canceled`: apps list, order timeline and repeat charges all checked before claiming the store sells no subscriptions.
- [ ] `general`: issuer claim read, customer emailed with the five options, dispute answered under the **real** reason if one emerged.
- [ ] No prior conversation? Customer emailed now, and the "did not contact us before filing" line put in the evidence.
- [ ] Decision recorded as FIGHT / REFUND / ACCEPT / ASK OWNER with one sentence of why — and if ASK OWNER, a deadline date after which you decide alone.
- [ ] Evidence saved in Shopify, files inside the limits, no external links.
- [ ] Customer emailed from `{{SUPPORT_EMAIL}}`, told that only they can withdraw the claim — and the draft contained **no `{{`**.
- [ ] Nothing invented: no delivery date, refund, conversation or policy that is not in our systems.

---

## 11. Gaps — do not fill these with a guess

- [ ] **Card-network rules** (Visa/Mastercard rulebooks) have not been read by anyone here. Nothing in this SOP states a network rule, deadline, fee or threshold as fact, and nothing added later should.
- [ ] **Stripe-sourced lines** (the `general` instruction, the "say it if they did not contact you" line, the dispute-count point) are **guidance from a third party**, not Shopify's documentation of our own flow. Useful; not enforceable.
- [ ] **Whether the networks restrict `subscription_canceled` to genuinely recurring payments** — unverified. State that the charge was an instalment; do not claim the code is invalid.
- [ ] **Admin field labels** are undocumented; only API names are known. Map them by hand the first time and note what you saw.
- [ ] **Accept-button wording** unverified. Write it into §8 the first time you accept one.
- [ ] **Chargeback fee amount** is not documented anywhere we can read. Never quote a figure to a customer or to the owner.
- [ ] **"If we do not respond we lose automatically"** — not confirmed. What is confirmed: with Shopify Payments a response containing the available order data is sent on the due date even if you add nothing. Adding evidence is still the whole job.
- [ ] **Whether an unanswered inquiry becomes a chargeback** — not confirmed. Treat inquiries as urgent anyway: our own numbers say they are winnable and chargebacks are not.
- [ ] **Bank review time** — Shopify's own pages say 30–90 days, 65–75 days, up to 75 days and within 120 days in different places. Tell the customer "it can take a few months", never a number.
- [ ] **`subscription_canceled` has no branch in `tvistfakta.mjs`** — it falls through to the default output. Use §5, not the tool's wording. (Worth fixing in the tool; owner's call.)
- [ ] **`tvistfakta.mjs` prints `REFUND` on chargebacks it cannot win**, where the only possible action is ACCEPT. §0 translates it; the tool should learn the difference.
- [ ] **The `tvister:` config block is empty in the only store file that exists** (measured 2026-09-20). Until it is filled, every template in this SOP needs values pasted in by hand.
- [ ] **`00-MASTER.md` must exist** for the routing in §1 and for the line `tvistfakta.mjs` prints at the end of every run. If it is missing, the routing is broken — say so in `{{ESCALATION_CHANNEL}}`.
- [ ] **Stores not on Shopify Payments** (Klarna, Stripe, PayPal as the processor) are out of scope: the admin paths and the tool do not apply. No SOP exists for those yet.

<!-- REVIEW: fixed 24 defects.
FIXED — invented/overstated rules: (1) "Stripe documents that some networks allow this code only for genuinely recurring payments" removed as a rule, demoted to a gap; (2) "A full refund kills an inquiry" overstated its own Shopify quote — corrected to "prevents escalation to chargeback" + check the dispute afterwards; (3) file limits "2 MB / 4 MB / 50 pages" kept but bound to "VERIFY IN SHOPIFY ADMIN: the upload box wins"; Mastercard 19-page claim dropped; (4) "Every loss we have ever had was a chargeback" scoped to the 2026-09-20 pull of decided cases; (5) Stripe citations labelled third-party guidance, not documentation of our Shopify Payments flow; (6) accept-button mechanics marked VERIFY instead of assumed.
FIXED — wrong on the data: (7) #5584 was used as a `general` example — measured W38 data says chargeback · credit_not_processed · 348 SEK · due 2026-09-23, so it is both the wrong code and unrefundable; removed and replaced; (8) #4446 was presented as a `general` case — it is credit_not_processed, 1262.20 SEK; relabelled and used only for scale; (9) #5122/#5044 relabelled as product_unacceptable, cited only as the inbox lesson; (10) the "#5053 has two disputes 348/255" claim could not be verified — replaced with the verifiable measurement from the 2026-09-14 pull (two orders carried two disputes each: 348+255 product_not_received, and 509 won + 508.99 refiled `general`), which also added a new rule: a win does not stop a refiling; (11) "tvistfakta prints ESCALATE for duplicate and general" corrected — `general` prints FIGHT when a delivery scan exists, ESCALATE only when undelivered, and any code with no tracking number at all escalates; (12) #4825's unverifiable delivery date dropped, the store-check lesson kept.
FIXED — decision quality: (13) added §0, a 60-second inquiry-vs-chargeback decision block before any routing; (14) added the ACCEPT path everywhere refund is impossible, and the explicit translation "tool says REFUND on a chargeback = ACCEPT" (verified against the repo test); (15) ASK OWNER given a hard fallback: if no answer 2 days before the deadline, the VA decides alone — previously a dispute could time out while waiting.
FIXED — actionability: (16) exact navigation added for finding all of a customer's orders, checking transactions/authorisations, checking for subscription apps, and listing open disputes; (17) `--brand` made mandatory with the reason (the tool silently defaults to one specific store); (18) repo-root requirement, `--alla`, and a troubleshooting table for the three real error messages (missing keys, 403 missing scope, 404 not Shopify Payments) added; (19) `sparning/kor.mjs` warning corrected to name `--torr` as the only safe form; (20) added §7, the "no prior conversation" case the owner actually asked about, as four ordered actions.
FIXED — portability: (21) the real brand name in the example column replaced with a neutral one; (22) `{{STORE_COUNTRY}}` and `{{ESCALATION_CHANNEL}}` added, and the country-specific return-window example rewritten so no market is the rule; (23) the per-case placeholder list added (the templates used ~20 placeholders §3 never defined) plus the hard "no `{{` leaves the draft" rule; (24) stated the measured fact that no code reads the `tvister:` block and that the only existing store file lacks it — so the VA knows the templates are filled by hand.
REMAINING GAPS (owner decision, cannot be closed here): the `tvister:` block must actually be filled per store (return address, policy URL, return window, billing descriptor, FIGHT_ABOVE) or every template ships with holes; `00-MASTER.md` does not exist yet in kundtjanst/sop/ although this SOP and tvistfakta.mjs both route to it; tvistfakta.mjs should print ACCEPT rather than REFUND on chargebacks and should get a subscription_canceled branch; the Shopify admin's dispute-form labels and the accept wording still need one human pass; no SOP exists for stores whose processor is not Shopify Payments; card-network rules remain unread by anyone here. -->
