# Customer emails — complete, copy-paste

**Use this when:** you need to write to a customer about a dispute, a missing parcel, a fault, a return or a refund — read the decision block, pick a template, fill the placeholders, send.

**Owner:** customer-service VA · **Language:** English masters (see Rule 2) · **Time:** 3–5 min per email · **Works on:** any store, see the config block in §3.

---

## 0. Before you write anything (60 seconds)

Run this first. It reads Shopify + tracking and prints the verdict and most of the values you are about to paste:

```bash
node kundtjanst/tvistfakta.mjs <order number> --brand <store id>
node kundtjanst/tvistfakta.mjs <order number> --brand <store id> --registrera   # old parcel, not yet known to 17TRACK
node kundtjanst/tvistfakta.mjs --alla --brand <store id>                        # every open dispute, short
```

**Always pass `--brand <store id>`.** Left out, the tool falls back to one single store and you will read the wrong shop's orders. The store id is the file name in `kundtjanst/brands/<id>.yaml` (or `factory/butiker/<id>.yaml`).

Three things that are normal, not bugs:

- Parcels older than ~14 days are not registered with 17TRACK and answer *"does not register, please register first"*. `--registrera` registers them and waits ~20 seconds. It costs 17TRACK quota. That is the price of knowing.
- `Shopify is not connected for <store> (missing …)` means the store's API keys are not in the environment. **Stop.** Tell the owner which variable is missing. Never write an email with guessed facts instead.
- `No dispute found for order <n> in <store>` means this store has no dispute on that order. Run it for the other stores before you conclude anything. *(Worked example #4825: the owner's note is "what store? No record of chargeback" — nobody knew which shop the order belonged to. That is a lookup job, not an email job.)*

⚠️ **Never** run `node sparning/kor.mjs` with a wide `--dagar` window to check one dispute. It writes delivery events into Shopify and fires "Delivered" emails to hundreds of old orders.

---

## 1. Fight or accept — decide before you write (the money decision)

Read the `DECISION:` line that `tvistfakta.mjs` printed.

| Tool printed | What it means | Do this |
|---|---|---|
| ⚔️ **FIGHT** | We can prove our side | Submit the evidence in Shopify **before** the due date, and send the matching email below |
| 💸 **REFUND** on an **inquiry** | We cannot win this | Refund in Shopify now → **T5** → **T6**. Do not submit evidence |
| 💸 **REFUND** on a **chargeback** | We cannot win, and the money is already gone | **ACCEPT the dispute** — see the box below. There is nothing left to refund |
| 🙋 **ESCALATE** | A human has to look (no tracking number at all, duplicate charge, unclear reason) | Tell the owner the same day. Send nothing that promises money or a date |

**The single fact that decides most cases: is there a delivery scan?**
Customer says "not received" **and** the carrier scanned it as delivered → fight, that is our strongest evidence. Customer says "not received" **and** the parcel is stuck or has no scan → **do not fight**. Refund (inquiry) or accept (chargeback). Submitting evidence we do not have wastes your hours and loses anyway.

**Small amounts: do not fight at all.** If the disputed amount is at or below `{{FIGHT_THRESHOLD}}`, refund/accept even when we could probably win — your time costs more than the order. `{{FIGHT_THRESHOLD}} = 0` means the store wants every case fought; then follow the table.

> **REFUND on a chargeback = ACCEPT, not refund.**
> On a chargeback the bank has already pulled the money. "Refunding" on top of it pays the customer twice.
> **VERIFY IN SHOPIFY ADMIN: Orders → the order → the dispute banner.** Shopify offers *Submit response* or *Accept dispute* there. If the order page still offers a Refund button on a disputed order, **stop and ask the owner** — do not click it.

**Outcome data we actually have** *(measured 2026-09-20 on 50 disputes in one store — one store only, but it is the only outcome history we own)*: **29 of 29 decided inquiries were won. Chargebacks: 1 won of 4.** Every loss we have ever had was a chargeback. So: chargebacks first, always. And an unanswered **inquiry is not lost on the spot — it escalates into a chargeback** (orders #4914, #5044 and #4706 all went that way). That escalation is the real cost of ignoring an inquiry.

**Hard deadline rule:** the conversation never overrides `Evidence due`. Submit what you have **at the latest the day before the due date**, even if the customer has not answered. The daily `/tvistkoll` alarm lists anything due within 3 days.

---

## 2. Pick the template (under 2 minutes)

| What is true right now | Template | Safe on | Worked example (EXAMPLE store, SEK) |
|---|---|---|---|
| A dispute is open and we have **no email thread** with this customer | **T1 — What happened?** | inquiry + chargeback | #5418, #5053, #4446, #4706 — owner's note: no conversation |
| Customer says "never received", and the carrier scan says **delivered** | **T2 — Where it was left** | inquiry + chargeback | #5289 — delivered Sep 10 |
| Product arrived **broken / faulty / not as described** | **T3 — Replacement or refund** | inquiry + chargeback | #5044 — button broke on first use |
| Customer wants to **send the item back** (fault OR changed mind) | **T4 — Return address** | inquiry + chargeback | #6349 — did not want it (made in China); #5122 — damaged straps |
| We have **paid a refund** and want the customer to see it | **T5 — Refund sent** | inquiry only ¹ | after any refund you issued yourself |
| Problem is **fixed** and a dispute is still open at the bank | **T6 — Please withdraw it** | inquiry + chargeback | use after T3/T4/T5 |
| Tracking has **not moved for days/weeks**, nothing to prove | **T7 — Parcel stuck** | inquiry only ¹ | #5584 — no delivery scan, became a chargeback |
| Customer says **"I don't recognise this charge"** (reason `unrecognized`) | **T8 — What this charge is** | inquiry + chargeback | reason code from the tool |
| Reason is `fraudulent` **and** billing ≠ shipping address | **Send nothing.** Accept, refund, block the customer, tell the owner | — | real card fraud is not an email problem |
| Reason is `duplicate` | **Send nothing yet.** 🙋 ESCALATE — the owner compares the two charges | — | if they really are two charges for one order, refund one at once |
| No dispute found for this order in this store | **Send nothing.** Check the other stores, then tell the owner | — | #4825 |

¹ **T5 and T7 promise money.** Never send either on an open **chargeback** — you cannot pay it back any more and the promise would be false. Use them on inquiries and on orders with no dispute yet.

**Never send two templates for the same problem.** If a thread already exists, reply **inside it** with the template that matches the real problem — not T1.

---

## 3. Config block — fill once per store, never inside the letters

Store values live in **one** place: `kundtjanst/brands/<id>.yaml` → the `tvister:` block. If the file has no `tvister:` block, copy it from `kundtjanst/brand-mall.yaml` and fill it once.

| Placeholder | Where the value comes from |
|---|---|
| `{{STORE_NAME}}` | `brand.namn` |
| `{{SUPPORT_EMAIL}}` | `brand.supportmail` — always send from this mailbox |
| `{{CURRENCY}}` | `brand.valuta` |
| `{{STORE_COUNTRY}}` | `brand.land` — decides the default language when the customer has never written |
| `{{WEBMAIL_URL}}` | `mail.webmail` — where you open the thread to export it as PDF |
| `{{RETURN_ADDRESS}}` | `tvister.returadress` |
| `{{RETURN_WINDOW_DAYS}}` | `tvister.returfonster_dagar` |
| `{{POLICY_URL}}` | `tvister.policy_url` — the page the customer accepted at checkout |
| `{{FIGHT_THRESHOLD}}` | `tvister.strid_lonar_sig_over` — below this, refund instead of fighting |
| `{{BILLING_DESCRIPTOR}}` | `tvister.billing_descriptor`. Empty? **VERIFY IN SHOPIFY ADMIN: Settings → Payments → Customer billing statement.** Write it into the brand file, don't guess |
| `{{STORE_DOMAIN}}` | the store's public domain — **not** the `.myshopify.com` address in `brand.shop`. Only used if the store wants it in the signature |

**An empty config value is a stop, not a guess.** No `{{RETURN_ADDRESS}}` → you cannot send T4. No `{{POLICY_URL}}` → you cannot quote terms. Ask the owner once, have it written into the brand file, and every store after this one is already solved.

**Who pays return shipping:** `tvister.returfrakt_betalas_av` ({{RETURN_POSTAGE_PAID_BY}}) — `kund` = the customer, `butik` = we do. **Empty means the owner has not decided**, and then you read `{{POLICY_URL}}` and say only what the policy says. Never promise "free return" on your own.

> **THE RETURN ADDRESS IS GIVEN OUT, NEVER PUBLISHED.**
> When `tvister.returadress_pa_forfragan` is `true`, {{RETURN_ADDRESS}} is not on
> the website anywhere. The customer must ask us, and we send it. That is a
> deliberate choice by the owner — it keeps returns down — and it turns your
> reply speed into money: **answer a return request within
> {{FIRST_REPLY_TARGET_HOURS}} hours.** A customer who asks how to return
> something and gets no answer opens a dispute instead, and a dispute costs more
> than the return ever would. *(Example, 2026-09-20: #5122, a missed email about
> damaged straps became a dispute.)*
> Send the address in plain text in the reply, never as a link, and write the
> date you sent it in the decision sheet — it is evidence item 13.

### Per-order placeholders — where each one really comes from

**Printed by `tvistfakta.mjs`** (copy straight out of the output):

| Placeholder | Line in the output |
|---|---|
| `{{ORDER_NUMBER}}` | header, `order #….` |
| `{{ORDER_DATE}}` | ORDER FACTS → `Placed` |
| `{{ORDER_TOTAL}}` | ORDER FACTS → `Total` — **this is what a refund would be** |
| `{{DISPUTE_AMOUNT}}` | header → `Amount:` — **what the bank is claiming**, which can be smaller than the order |
| `{{PRODUCT_NAME}}` | ORDER FACTS → `Items` |
| `{{CARRIER}}` `{{TRACKING_NUMBER}}` `{{TRACKING_STATUS}}` `{{DELIVERY_DATE}}` | ORDER FACTS → `Tracking …` |
| `{{LAST_SCAN_DATE}}` | WHY → `tracking stuck at "…" since …` |
| `{{REFUND_AMOUNT}}` `{{REFUND_DATE}}` | ORDER FACTS → `Refunds:` |
| `{{EVIDENCE_DUE}}` | header → `Evidence due:` |

**NOT printed by the tool — get these yourself:**

| Placeholder | Where |
|---|---|
| `{{CUSTOMER_FIRST_NAME}}` | **Shopify admin → Orders → the order → Customer.** No name? Write "Hi," and nothing else |
| `{{SHIP_DATE}}` | **Shopify admin → the order → Timeline / the fulfillment**. Unknown? Delete the words "shipped on {{SHIP_DATE}}" |
| `{{DELIVERY_PLACE}}` | the carrier's own tracking page (e.g. "in the mailbox", "to a neighbour"). **If the carrier does not say where, delete the phrase** — do not write "to your address" as if the carrier had said it |
| `{{PARCEL_NUMBER}}` `{{TRACKING_LINK}}` | **stores with a tracking page:** paste the carrier number on `{{TRACKING_PAGE}}` → it shows the store parcel number (`{{PARCEL_PREFIX}}` + 8 characters); the link is `{{TRACKING_PAGE}}?nummer={{PARCEL_NUMBER}}`. **In a customer email, write the store parcel number and this link instead of `{{CARRIER}}` + `{{TRACKING_NUMBER}}`** — the customer never sees the carrier number (it is in their shipping email as the store number too). The carrier number stays in the evidence pack for the bank. No tracking page on this store: keep carrier + number as written in the templates |
| `{{CARD_LAST4}}` | **VERIFY IN SHOPIFY ADMIN: Orders → the order → payment details.** Not shown? Delete "ending {{CARD_LAST4}}" |
| `{{WHAT_WE_DID}}` | you write it, one clause, past tense — see T6 |
| `{{AGENT_NAME}}` | your own first name |

**{{ORDER_TOTAL}} vs {{DISPUTE_AMOUNT}} is not a detail.** *(Worked example, EXAMPLE store: order #5763's dispute is 100 SEK while the order itself is larger. Promising "we refund 100 SEK in full" would be wrong, and so would refunding the full order because the bank asked for 100.)* Refund emails always use the amount you actually refunded.

---

## 4. Rules for every email

1. **Send from `{{SUPPORT_EMAIL}}`, reply in the same thread.** Shopify's dispute response form has a slot for customer communication, so the thread has to exist somewhere we can find and export it. If the customer never contacted us before opening the dispute, that fact itself goes into the evidence.
2. **Write in the language the customer wrote in.** These masters are English and contain no legal claims, so translating them is safe. Keep order number, amounts, dates and `{{RETURN_ADDRESS}}` exactly as written. Never written to us before? Use the language of `{{STORE_COUNTRY}}`'s site version. *(EXAMPLE only: a Swedish store writes Swedish to a Swedish customer, Norwegian to a Norwegian one; a US customer gets this English text unchanged.)*
3. **Never blame the customer, the carrier or "the system".** State what we can see, then what we will do.
4. **Never send the customer to the manufacturer or the supplier.** We sold it, we fix it. Pointing a disputing cardholder at someone else is how a winnable case turns into a lost one.
5. **Never promise a date you do not control** — no "the bank will refund you in 3 days", no "it will arrive Friday", no shipping date you have not checked.
6. **Never offer a replacement you cannot actually ship.** Check stock in Shopify admin → Products before you offer option A. Out of stock → offer the refund only.
7. **One email, one decision.** Ask for at most one thing, and say what happens next.
8. **Never promise money on an open chargeback.** Check the dispute type in the tool output first (`🔴 CHARGEBACK` vs `INQUIRY`).
9. **Save the sent thread as ONE PDF** for the evidence pack: open the thread in `{{WEBMAIL_URL}}` → open the message → Print → *Save as PDF*. Include our reply and the customer's messages. **VERIFY IN SHOPIFY ADMIN: the dispute response page lists the accepted file types and the size limit next to the upload field — read it there before you export.** Keep it legible in black and white; if an upload is refused, split the PDF and upload the parts.

---

## 5. The templates

### T1 — Dispute opened, no prior contact

**Subject:** About your order {{ORDER_NUMBER}} — can you tell us what happened?

```
Hi {{CUSTOMER_FIRST_NAME}},

Your bank contacted us about your order {{ORDER_NUMBER}} from {{ORDER_DATE}}.
This is the first time we hear that something is wrong, so I would like to hear it from you before we reply to them.

Here is everything we can see on our side: the order was shipped on {{SHIP_DATE}} with {{CARRIER}}, tracking {{TRACKING_NUMBER}}, and the last scan says {{TRACKING_STATUS}}.

Can you tell me what went wrong — the parcel never reached you, something was wrong with the item, or something else?

If we got it wrong, we will fix it. Just reply to this email and I will take care of it personally.

{{AGENT_NAME}}
{{STORE_NAME}} · {{SUPPORT_EMAIL}}
```

> **No tracking number on the order?** Delete the whole "Here is everything we can see" paragraph and write instead: *"I am checking what happened to your parcel on our side right now."* Then escalate to the owner — an order with no tracking number is a fulfilment problem, not an email problem.
> **Do NOT use** when an email thread with this customer already exists — reply in that thread with the template that matches the real problem.
> **Do NOT wait for the answer.** Send T1 and prepare the evidence in parallel; the due date does not move.
> *Worked example #4706: no conversation, but he left a review saying he was disappointed. Mention what you know — "I saw your review, and I would like to make it right" — instead of pretending the complaint is a mystery.*

---

### T2 — Tracking says delivered, customer says not received

**Subject:** Your order {{ORDER_NUMBER}} — here is where the carrier left it

```
Hi {{CUSTOMER_FIRST_NAME}},

Thank you for telling us. I checked the parcel for order {{ORDER_NUMBER}} straight away.

{{CARRIER}} tracking {{TRACKING_NUMBER}} is scanned as delivered on {{DELIVERY_DATE}}{{DELIVERY_PLACE}} to the address on your order.

Parcels that are scanned but not in your hands are almost always in one of these places: with a neighbour, in the mailbox, in a parcel room or on the porch, with someone else in the household, or at a pickup point where the notice never arrived.

Could you check those places and ask anyone else at the address?

If you have checked and it is still not there, reply and tell me — I will pull the full scan history from {{CARRIER}} and come back to you with what we can do.

{{AGENT_NAME}}
{{STORE_NAME}} · {{SUPPORT_EMAIL}}
```

> **Do NOT use** when there is no delivery scan. Without a scan we have nothing to show and this email reads as an accusation — use T7, or refund/accept.
> This email does **not** close the case. Submit the delivery scan as evidence anyway, before `{{EVIDENCE_DUE}}`.

---

### T3 — Faulty product: replacement or refund

**Subject:** Sorry about your {{PRODUCT_NAME}} — replacement or refund?

```
Hi {{CUSTOMER_FIRST_NAME}},

I am sorry — that is not how it is supposed to work, and I want to sort it out for you.

Could you send one photo (or a short video) showing the fault? It helps us stop the same thing happening to the next customer.

You choose what happens next:
A) We send you a new one, free of charge.
B) You send this one back and we refund {{ORDER_TOTAL}} {{CURRENCY}} in full.

Just reply with A or B and I will start it the same day. If I have not heard from you by {{ANSWER_BY_DATE}}, I will send the replacement automatically so you are not left waiting.

{{AGENT_NAME}}
{{STORE_NAME}} · {{SUPPORT_EMAIL}}
```

> **Fill `{{ANSWER_BY_DATE}}` yourself:** 3 working days from today — **and never later than the day before `{{EVIDENCE_DUE}}`**. Then put a reminder in your own list and actually do it.
> **Check stock before you offer A** (Shopify admin → Products). Out of stock → delete option A and offer the refund.
> **On an open chargeback:** delete option B and the amount. You cannot pay a refund on a chargeback. Offer the replacement, or handle it as ACCEPT per §1.
> **Do NOT use** when the customer only dislikes the product (changed their mind, wrong expectations) — that is a return, not a fault: use T4.
> *Worked example #5044: the button broke on first use, support asked "do you want a replacement?", the customer never confirmed, nothing was sent — and the inquiry escalated into a chargeback (measured 2026-09-20). Always offer A or B **and** say what you will do if they stay silent.*

---

### T4 — Return requested: address and conditions

**Subject:** Return address for order {{ORDER_NUMBER}}

```
Hi {{CUSTOMER_FIRST_NAME}},

No problem — here is everything you need to send it back.

Send the parcel to:
{{RETURN_ADDRESS}}

Please write {{ORDER_NUMBER}} on the outside of the parcel or on a note inside. Without it we cannot match your return to your order.

Send it back within {{RETURN_WINDOW_DAYS}} days, with the item complete and in a condition we can resell. Keep your shipping receipt with the return tracking number — that is your proof that it is on the way.

When the parcel reaches us we refund {{ORDER_TOTAL}} {{CURRENCY}} to the card you paid with, and I will email you the moment it is done.

Full terms: {{POLICY_URL}}

{{AGENT_NAME}}
{{STORE_NAME}} · {{SUPPORT_EMAIL}}
```

> **Read `{{POLICY_URL}}` before you send.** Who pays the return postage, and whether anything is deducted from the refund, is written there — not here. If the policy deducts something, say so in this email. Never write "in full" if the store does not pay it in full.
> **On an open chargeback:** replace the refund sentence with *"When the parcel reaches us I will confirm it in writing and handle the case with your bank."* You cannot refund a chargeback.
> **Do NOT use** as a first answer to a faulty product — ask for the photo first (T3). A customer paying to return a broken item is how "product unacceptable" disputes get lost.
> **No `{{RETURN_ADDRESS}}` in the brand file?** Do not improvise one. Ask the owner, add it to the file, then send.
> *Worked examples #6349 (did not want it because it is made in China — change of mind, same address, same conditions, no argument about the country) and #5122 (damaged straps; support had missed his first email — apologise for the delay in the first line and use T3's option A/B).*

---

### T5 — Refund paid, with what to show the bank

**Subject:** Refund sent for order {{ORDER_NUMBER}}

```
Hi {{CUSTOMER_FIRST_NAME}},

Your refund is done. {{REFUND_AMOUNT}} {{CURRENCY}} was sent back on {{REFUND_DATE}} to the card ending {{CARD_LAST4}} — the same card you paid with. We cannot send it anywhere else.

If your bank asks for proof, this is what they need:
- Order {{ORDER_NUMBER}}, placed {{ORDER_DATE}}
- Refund {{REFUND_AMOUNT}} {{CURRENCY}} on {{REFUND_DATE}}
- The charge appears on your statement as {{BILLING_DESCRIPTOR}}

Your bank decides which day it shows up on your statement — we cannot speed that up. If you cannot see it and your bank says they have nothing, reply to this email and I will send the details again.

Thank you for your patience.

{{AGENT_NAME}}
{{STORE_NAME}} · {{SUPPORT_EMAIL}}
```

> **Do NOT use** before the refund is actually issued in Shopify, and **never on an order with an open chargeback**.
> **VERIFY IN SHOPIFY ADMIN: Orders → the order → Timeline / Refunds** for the exact amount and date, or read them off the `Refunds:` line in `tvistfakta.mjs`. If no bank reference number is shown, do not invent one — order number + amount + date is what we have.
> A **partial** refund is a partial refund: write the amount you actually paid, never the order total.

---

### T6 — Asking the customer to withdraw a dispute we have resolved

**Subject:** Order {{ORDER_NUMBER}} is sorted — one last step only you can do

```
Hi {{CUSTOMER_FIRST_NAME}},

Good news: {{WHAT_WE_DID}} — so your order {{ORDER_NUMBER}} is settled from our side.

One thing is still open, and honestly we cannot close it for you. The case you opened with your bank can only be withdrawn by you.

Please call the number on the back of your card, or send your bank a message, and say:
"I opened a dispute on a charge of {{DISPUTE_AMOUNT}} {{CURRENCY}} from {{BILLING_DESCRIPTOR}} on {{ORDER_DATE}}. The merchant has resolved it. Please cancel the dispute."

That is all. If the bank asks for anything in writing, forward them this email.

Thank you for giving us the chance to fix it.

{{AGENT_NAME}}
{{STORE_NAME}} · {{SUPPORT_EMAIL}}
```

> **Fill `{{WHAT_WE_DID}}`** with one clause in the past tense: *"your refund of 348 SEK went back to your card on 19 September"* / *"your replacement is on its way with tracking 1234567890"* / *"we received your return and the refund is done"*.
> **Do NOT use** before the customer has the refund, the replacement or the item in hand. Asking someone to drop their protection while they are still waiting destroys the thread you will need as evidence.
> **Keep answering the dispute in Shopify until the bank itself closes it.** A promise from the customer is not a closed case.
> **VERIFY IN SHOPIFY ADMIN: Orders → the order → the dispute banner** for whether Shopify shows the dispute as withdrawn.
> **Do not send this to fix numbers.** In our own reporting a chargeback is counted for the store whatever the outcome (`kundtjanst/chargeback.mjs` counts chargebacks in the window, not who won). Whether the card networks count a withdrawn one the same way is **not something we have verified — ask the owner, and never tell a customer either way.**

---

### T7 — Parcel stuck in transit: reship or refund, before they ask

**Subject:** Your parcel has not moved — we are not going to let you wait

```
Hi {{CUSTOMER_FIRST_NAME}},

I checked your order {{ORDER_NUMBER}} today. The tracking has not moved since {{LAST_SCAN_DATE}}, and at this point I do not believe it is simply slow.

That is on us, not on you. You pick:
A) We send a new one today, with a new tracking number.
B) We refund {{ORDER_TOTAL}} {{CURRENCY}} in full, back to your card.

Reply with A or B. If I have not heard from you by {{ANSWER_BY_DATE}} I will refund you automatically — I would rather give your money back than leave you waiting.

Sorry for the trouble.

{{AGENT_NAME}}
{{STORE_NAME}} · {{SUPPORT_EMAIL}}
```

> **Fill `{{ANSWER_BY_DATE}}`:** 3 working days from today, **and never later than the day before `{{EVIDENCE_DUE}}`**. If the due date is closer than that, refund now and send T5 instead — an automatic refund promised for after the deadline loses the dispute and the money.
> **Check stock before you offer A.** Out of stock → offer the refund only.
> **Do NOT use** when a chargeback is already open — you cannot refund it any more, and promising to would be a lie. Go back to §1 and accept or fight.
> *Worked example #5584 (EXAMPLE store, SEK): no delivery scan, the parcel never moved past the first status, and it became a real chargeback — reason "credit not processed", 348 SEK, evidence due 2026-09-23 (measured in our own run data). Sent while it was still an inquiry, T7 costs one order. Sent too late, it costs the order and the chargeback on top.*

---

### T8 — "I don't recognise this charge"

**Subject:** Order {{ORDER_NUMBER}} — what this charge on your card is

```
Hi {{CUSTOMER_FIRST_NAME}},

Thank you for asking instead of assuming the worst — let me show you exactly what this is.

On {{ORDER_DATE}} an order was placed with us for {{PRODUCT_NAME}}, order {{ORDER_NUMBER}}, {{ORDER_TOTAL}} {{CURRENCY}}. On your statement it appears as {{BILLING_DESCRIPTOR}}, which is why it may not look familiar.

The parcel was sent with {{CARRIER}}, tracking {{TRACKING_NUMBER}}, to the address given on the order.

If that was you or someone in your household, everything is in order and you do not need to do anything. If it was not, reply to this email and tell me — we will sort it out with you directly.

{{AGENT_NAME}}
{{STORE_NAME}} · {{SUPPORT_EMAIL}}
```

> **Do NOT use** when the reason is `fraudulent` **and** the tool says billing and shipping addresses do not match. That pattern looks like real card fraud: accept, refund, block the customer, and tell the owner. Arguing with a fraud victim loses the case and the customer.
> Never put the full delivery address, the phone number or the email of the order in this email — it may be going to someone who is not the buyer. Tracking number and city are enough.

---

## 6. After you send

- Note in the **Shopify order timeline** which template you sent and when. The next VA opening the order must not send T1 to someone who already got T3.
- **Silence is an answer too.** Waiting for a reply is never a reason to miss `{{EVIDENCE_DUE}}`. Submit what you have the day before at the latest.
- If the reply changes the facts (they admit they received it; they describe a fault we did not know about), add it to the evidence pack — a later conversation that clears up the facts belongs in the submission, whichever way it points.
- If the customer never answered and never wrote to us before the dispute, **say so in the evidence**. That is a fact in our favour, not a weakness to hide.
- If the tool said 🙋 ESCALATE, the email is not the job: tell the owner the same day, in writing, with the order number and the due date.

---

## Definition of done

- [ ] Facts read with `node kundtjanst/tvistfakta.mjs <order> --brand <store id>` — `--brand` passed, nothing guessed.
- [ ] Fight / accept decided from §1 before writing, and the amount checked against `{{FIGHT_THRESHOLD}}`.
- [ ] Template picked from the table in §2, and its "Do NOT use" lines checked.
- [ ] Every `{{PLACEHOLDER}}` replaced or its sentence deleted; no `{{` left in the sent mail.
- [ ] Nothing promised that we do not control: bank dates, carrier dates, out-of-stock replacements, refunds on a chargeback.
- [ ] Any `{{ANSWER_BY_DATE}}` falls before `{{EVIDENCE_DUE}}`, and is in your own reminder list.
- [ ] Sent from `{{SUPPORT_EMAIL}}`, in the customer's language, in the existing thread.
- [ ] Template name + date noted on the Shopify order timeline.
- [ ] Thread exported as one PDF if this order has an open dispute, within the limits shown on Shopify's own upload field.
- [ ] Evidence submitted, or the dispute accepted — the email alone never closes a case.

<!--
REVIEW: fixed 20 defects.

INVENTED RULES (removed or converted to VERIFY):
 1. "Shopify: 'You can't issue a refund after a cardholder initiates a chargeback.'" — unverifiable verbatim quote presented as fact. Replaced with the VERIFY IN SHOPIFY ADMIN box in §1 plus the operational rule (REFUND on a chargeback = ACCEPT).
 2. "Stripe counts the thread as evidence (customer_communication)" and the two other Stripe quotes — we run Shopify Payments and have no verified access to Stripe's docs. Rewritten as Shopify's own dispute form / plain rules.
 3. "Shopify limits: PDF/JPEG/PNG, 2 MB per file, 4 MB combined, under 50 pages" — four unverified numbers. Replaced with "read the limits printed next to the upload field".
 4. "A withdrawn dispute still counts as a dispute in the store's dispute rate" — a card-network claim. Replaced with what our own code actually counts (chargeback.mjs counts chargebacks in the window, outcome-independent) + an explicit unverified flag. Also corrected the implication that inquiries count in that rate: they do not.
 5. "the chargeback fee" as a stated cost — no fee amount or existence verified; softened to "the chargeback on top".

NOT PORTABLE:
 6. `node kundtjanst/tvistfakta.mjs <order number>  # this store` — the tool defaults to one hardcoded store id, so on any other store it silently reads the wrong shop. Every command now carries --brand <store id>, with the reason stated.
 7. Worked examples now labelled "(EXAMPLE store, SEK)" instead of mixing {{CURRENCY}} into example amounts.

NOT ACTIONABLE:
 8. {{TRACKING_STATUS}} (T1) and {{WHAT_WE_DID}} (T6) were used but never defined. Both defined, WHAT_WE_DID with three ready fills.
 9. "Per-order placeholders come straight from tvistfakta.mjs" was false for CUSTOMER_FIRST_NAME, SHIP_DATE, DELIVERY_PLACE, CARD_LAST4 and AGENT_NAME — the tool prints none of them. Split into two tables: what the output prints, and where to get the rest, with a delete-the-sentence rule for each one that can be missing.
10. Single ambiguous {{AMOUNT}} used for both the refund and the bank's claim. Split into {{ORDER_TOTAL}} and {{DISPUTE_AMOUNT}}; partial disputes exist in our own data.
11. T2 said "check those three places" after listing six. Fixed.
12. T7's "within a few days" — no date, no owner. Now {{ANSWER_BY_DATE}}, with the hard rule that it must fall before the evidence due date (a promise dated after the deadline loses the dispute).
13. T3/T7 offered a free replacement with no stock check. Added the check and the out-of-stock fallback.
14. T4 promised "{{AMOUNT}} in full" without reading what the policy deducts, and with no guard for an open chargeback. Both added.
15. "Export it as ONE PDF" with no method. Now: open the thread in {{WEBMAIL_URL}} → Print → Save as PDF.
16. No rule for an empty config value (e.g. no return address). Added: an empty value is a stop, not a guess.

NO DECISION / MISSING THE ACCEPT CASE:
17. The file had no fight/accept decision at all — it deferred entirely to 00-MASTER.md, so a VA opening it could write a polite email on a case we should simply accept. §1 now gives the decision in four rows, the delivery-scan rule, the {{FIGHT_THRESHOLD}} small-amount rule (a real field in brand-mall.yaml: tvister.strid_lonar_sig_over), the chargeback-ACCEPT box and the hard deadline rule.
18. No coverage for the reason codes our own tool produces: unrecognized, fraudulent, duplicate, and "no tracking number at all". Added T8 plus three send-nothing rows.

WRONG ON THE DATA (checked against kundtjanst/korningar/baverbutiken/2026-W38.json and the code comments measured 2026-09-20):
19. "#5763 (100 {{CURRENCY}} refunded 2026-09-19)" — our data shows an OPEN inquiry, product not received, 100 SEK, evidence due 2026-10-02, and no refund record. Removed; the order is now used only to illustrate dispute amount vs order total.
20. "#5044 ... became a real chargeback of 589 {{CURRENCY}}" — 589 SEK is recorded in our data as an INQUIRY (product unacceptable). The escalation of #5044 is documented (tvistkoll.mjs, measured 2026-09-20); the amount pairing is not. Kept the escalation, dropped the amount.
    "#5584 stuck 'InfoReceived' since 2026-08-20" — that date is nowhere in our data; replaced with the measured record (chargeback, credit not processed, 348 SEK, due 2026-09-23).
    "#4825 — exists in the shop, but no dispute in this shop's Shopify Payments" — the owner's note is "what store? No record of chargeback", i.e. the store was never identified. Rewritten as a lookup instruction.

REMAINING GAPS — owner decisions, cannot be closed from here:
 - Who pays return shipping, and whether anything is deducted from a refund. Not in any brand file; the SOP sends the VA to {{POLICY_URL}} and, if the policy is silent, to the owner. This will block T4 on every new store until it is written down once.
 - The real card-network dispute-rate thresholds and any chargeback fee. The repo uses 0.9 % / 1 % (brand file `trosklar`, kundtjanst/chargeback.mjs) but that is our own setting, not a verified rulebook figure. Nothing in the SOP quotes a threshold to a customer.
 - Whether a customer-withdrawn dispute still counts against the store at the network. Flagged as unverified in T6.
 - Shopify's actual evidence upload limits and whether the Refund button is blocked on a disputed order: both written as VERIFY IN SHOPIFY ADMIN because nobody has recorded a screenshot of that screen.
 - kundtjanst/brands/baverbutiken.yaml (the only brand file that exists) has NO `tvister:` block at all: no return address, no policy URL, no billing descriptor, no strid_lonar_sig_over. T4, T5, T6 and T8 cannot be sent as written until the owner fills those five lines — and every further store needs the same block copied from kundtjanst/brand-mall.yaml.
 - Which store order #4825 belongs to is still unknown.
 - kundtjanst/sop/00-MASTER.md is referenced by tvistfakta.mjs and tvistkoll.mjs but does not exist in the repo yet; this file now carries enough of the fight/accept decision to stand alone until it does.
-->
