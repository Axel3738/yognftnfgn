# SOP 10 — Dispute reason: `product_not_received`

**Use this when:** the Shopify dispute `reason` is `product_not_received` (Shopify's label: "The customer believes that they did not receive the goods or services they purchased").

**Owner:** customer-support VA · **Trigger:** the daily deadline alert in Discord (`/tvistkoll`), or the weekly report (`/kundtjanst`) · **Time:** 10–20 min per dispute once the tracking has been read.

**File location:** `kundtjanst/sop/10-NOT-RECEIVED.md`. Store-specific values are in one config block at the very end — never type a brand name, domain, carrier or support address into the steps.

> ⚠️ **Read the reason in Shopify, do not trust the label in a hand-written list.** Internal notes often write the dispute *type* ("actual chargeback") where the *reason* belongs. Type and reason are two different fields. If the reason in Shopify is not `product_not_received`, close this file and open the SOP for the reason that is actually there.

---

## 1. The 60-second decision

Run one command, read one line, decide. Everything after §2 is detail you only need once you know the decision.

```
node kundtjanst/tvistfakta.mjs <ORDER NUMBER> --brand {{STORE_ID}}
```

⚠️ **Always pass `--brand {{STORE_ID}}`.** Without it the tool defaults to one specific store and will happily print facts about the wrong shop. Don't know the store ids? `node kundtjanst/run.mjs --kolla` lists them.

It prints `DECISION: FIGHT | REFUND | WAIT | ESCALATE`, the evidence deadline with days left, the tracking status, the refunds already on the order, and whether billing matches shipping. If the tool cannot run (no Shopify keys for this store, no network), do §2 by hand in the browser — same decision, more clicks.

### Decision table — the delivery scan decides the case

| What the facts say | Dispute is an **inquiry** (money still ours) | Dispute is a **chargeback** (money already taken) |
|---|---|---|
| Tracking shows **DELIVERED**, with a date and a location | **FIGHT.** Submit the delivery scan (§5). Email the customer too (§6A). | **FIGHT.** Same evidence pack. |
| **DELIVERED**, customer insists it never arrived | **FIGHT**, and email first (§6A + §7). Submit on time regardless. | Same. |
| **READY_FOR_PICKUP / OUT_FOR_DELIVERY** — the parcel is at a named place | Email the customer the pickup location (§6B). Save the evidence, submit on the due date. | Same. |
| **IN_TRANSIT**, still moving, deadline more than 1 day away | **⏳ WAIT — this is the normal case, not a problem.** Email the customer today (§6B), build the evidence and press **Save** (never *Submit now*), then re-run the tool the day before the deadline. The parcel takes about 10 days and the window is up to 21, so the scan usually lands in time — that is how these are won. | Same. |
| **IN_TRANSIT / CONFIRMED (InfoReceived)** and the deadline is here, still no delivery scan | **DO NOT FIGHT. Refund in full** (§4). A full refund ends an inquiry. | **DO NOT FIGHT. Accept** (§4). You cannot refund a chargeback. |
| Tracking shows **NotFound / Expired / Exception** and no delivery scan | Refund in full. | Accept. |
| **No tracking number on the order at all** | Refund in full, then escalate the order (§8) — fulfilment is broken. | Accept, then escalate (§8). |
| Order value is **below {{FIGHT_THRESHOLD}} {{CURRENCY}}** and we have no delivery scan | Refund. Don't spend an hour on it. | Accept. |
| The deadline is **today or overdue** | See §5 "Timing". Overdue: nothing can be submitted, log it and move on. | Same. |
| Order number not found in this store | §8, first row. Do **not** conclude "wrong store" before you've read that row. | Same. |

**Before that rule, one line that decides more cases than it does:** *no scan yet* is not *no scan*. While the parcel is still moving you **wait and save**, and you only give up on the day the window closes.

**The one-sentence rule:** no delivery scan, no fight. We cannot prove delivery that did not happen, and losing costs the fee on top of the goods.

### Inquiry vs chargeback — know which one you are holding

The tool prints `🔴 CHARGEBACK` or `INQUIRY` on the first line. The difference is the whole game:

- **Inquiry** — the bank is asking before taking anything. The money is still ours, and **a full refund ends it**: once the customer is refunded in full they cannot escalate it to a chargeback. This is the cheapest stage there is.
- **Chargeback** — the amount has already been debited, plus a dispute fee. **You cannot refund a chargeback.** Your only two options are *submit evidence* or *accept*. Handle chargebacks first: a loss there is final and already paid for.
- **Dispute statuses you will see** (straight from Shopify's dispute object): `needs_response` · `under_review` · `charge_refunded` · `accepted` · `won` · `lost`. `under_review` means the evidence is in and it is the bank's turn — do nothing. `won` / `lost` / `accepted` / `charge_refunded` are finished — never re-open them.
- **Silence is not "accepting".** Shopify auto-populates and sends whatever data it has on the due date for Shopify Payments disputes. Doing nothing therefore sends a weak response in your name — it does not cleanly concede, and it does not protect you either. Decide on purpose.
- **Never write to a customer, or to a bank, that an unanswered dispute is "automatically lost."** That is not documented and we do not need it to be true — the reason to answer on time is that the deadline is hard.

**Measured, one store, example only — not a rule:**
- 29 disputes in a 30-day window (`kundtjanst/korningar/{{STORE_ID}}/2026-W38.json`, run 2026-09-14): **27 inquiries, 2 chargebacks**; **20 of the 29 were `product not received`**; 17 resolved, **all 17 won**, 12 still needing a response.
- 50 disputes on the same store, 2026-09-20 (`kundtjanst/tvistfakta.mjs` header): **inquiries 29 of 29 resolved won; chargebacks 1 win out of 4.**
- Dispute rate that week: **0.11 % of orders** (1 756 orders) — well under the yellow line this repo uses (`trosklar.tvistgrans_gul_procent` 0.5 %).

**Worked examples, from that store's real dispute records — read them as examples, not as rules:**

| Order | Real record | Which row |
|---|---|---|
| `#5584` | **chargeback**, reason **`credit not processed`**, 348 SEK, filed 2026-09-10, due 2026-09-23 | Not this SOP at all. Its hand-written note said "actual chargeback" and "stuck in shipment information received" — but the reason field says `credit_not_processed`. **This is exactly why you read the reason in Shopify.** |
| `#5435` | inquiry, `product not received`, 348 SEK, **won**, due 2026-09-15 | Row 1. Delivery scan, fight, won. |
| `#5763` | inquiry, `product not received`, 100 SEK, **still `needs response`**, due 2026-10-02 | Open, not a win. Do not cite open cases as wins. |
| Shopify order id `17666239660381` | **two separate disputes** on one order — 348 SEK and 255 SEK, both `product not received`, both filed 2026-09-09, both due 2026-09-28 | See §3.1. Two forms, two deadlines. |

---

## 2. Read the tracking — the exact steps

> 🚫 **Never run a sharp tracking sync to investigate a dispute.** `node sparning/kor.mjs` without `--torr` writes fulfillment events into Shopify, and `OUT_FOR_DELIVERY` / `DELIVERED` events trigger customer notification emails. On an old date window that mails hundreds of customers "Delivered" months late. Read-only or browser only.

1. **Shopify admin → Orders → open the order → the Fulfilled section → copy the tracking number and the carrier name.** The carrier is whatever is written on that order — read it, never assume it. On stores with a tracking page (`{{TRACKING_PAGE}}`), the order's timeline already carries the carrier scans as fulfillment events, written by the hourly routine — read the latest one there first; `{{TRACKING_PAGE}}` shows the same chain with city and time when you paste the number. A parcel older than the routine's 14-day window is not on that page — go on to step 2.
2. **Paste the tracking number into `17track.net` in your browser.** Carrier-independent, works for every store. Write down: **status, delivery date, delivery city/location, carrier, and the last few events.**
3. **If 17TRACK answers "does not register, please register first":** the number is older than the tracking routine's 14-day window, so it was never registered. Click **Track** to register it, wait for the carrier data to load, then read it. This is normal, not a bug. *(Measured 2026-09-20: all twelve orders under dispute that day answered "does not register" — every one of them was older than the window.)* Registration spends shared 17TRACK quota — register only numbers you actually need for a dispute. `node kundtjanst/tvistfakta.mjs <order> --brand {{STORE_ID}} --registrera` does the same thing from the terminal.
4. **Repo route, read-only and optional:** `node sparning/kor.mjs --torr --dagar 90` prints one line per parcel and writes nothing. It only covers the store whose Shopify keys are configured for that routine, and it does **not** register new numbers, so old parcels will simply be missing — fall back to step 2/3. Never drop `--torr`.
5. **Statuses you will see** (`sparning/status.mjs`): `InfoReceived → CONFIRMED` · `InTransit → IN_TRANSIT` · `AvailableForPickup → READY_FOR_PICKUP` · `OutForDelivery → OUT_FOR_DELIVERY` · `DeliveryFailure → ATTEMPTED_DELIVERY` · `Delivered → DELIVERED` · `Exception → FAILURE` · `Expired` and `NotFound` → nothing at all. **`NotFound` usually means "not registered yet", not "no such parcel"** — go back to step 3 before you treat it as lost.
6. **Screenshot the 17TRACK page** showing tracking number, status, date and location. Crop it, keep it high-contrast and legible in black and white — evidence is often rendered small and colourless by the time a bank reads it.

⚠️ **Split shipments.** `tvistfakta.mjs` reads only the **first** tracking number on the **first** fulfillment. If Shopify shows more than one fulfillment, read each parcel by hand — one delivered parcel does not answer a dispute about the whole order.

---

## 3. Three checks that change the answer

1. **Is there more than one dispute on this order?** *(Real: Shopify order id `17666239660381` carries two — 348 {{CURRENCY}} and 255 {{CURRENCY}}, same day, same deadline.)* Each dispute has its own evidence form, its own amount and its own due date. Answer **both**, separately.
2. **Has a refund already been issued?** Shopify admin → the order → **Refunds** (the tool prints this line too). If yes, say so in the evidence — amount and date — and screenshot it. A dispute against an order we already refunded is factually wrong and worth answering.
3. **Did the customer ever contact us?** Search the {{SUPPORT_EMAIL}} mailbox for the order number and for the customer's address. If they never wrote to us, **say so in the evidence** — that is a fact in our favour, not an embarrassment. If they did write, attach the full thread, including anything we promised.

---

## 4. Giving up properly: refund (inquiry) or accept (chargeback)

Half the cases in this SOP end here, and that is correct. Do it cleanly so nobody re-litigates it later.

**Refund an inquiry (no delivery scan):**
1. Shopify admin → **Orders** → open the order → **Refund** → full amount → **Refund**.
2. Email the customer §6C the same day.
3. Check the dispute the next day: it should read `charge_refunded`. If it still says `needs_response` after a few days, escalate (§8).

**Accept a chargeback (no delivery scan):**
1. Open the dispute from the order's chargeback banner.
2. If an **accept / concede** action exists, use it. **VERIFY IN SHOPIFY ADMIN:** whether your store's dispute page offers an explicit accept action — the first VA who sees the answer writes it into the store config comment so nobody has to look again.
3. If there is no accept action: do **not** upload evidence, and do **not** assume silence is neutral (§1). Write the decision in the order notes immediately.
4. Either way: **one line in the order notes** — "Accepted: no delivery scan, parcel stuck at CONFIRMED since [DATE]. [YOUR NAME], [DATE]."

**Never do both.** Do not build an evidence pack and then refund, or refund and then submit. Pick one, write down why.

---

## 5. Submit the evidence — Shopify admin

**Navigation:** **Orders** → **Search and filter** → **Add filter** → **Chargeback and inquiry status** → **Open** → open the order → the chargeback banner → **Add evidence**.

Shopify's own recommended evidence for this reason: *order fulfillment date and time; billing information; shipping and tracking information; activity logs for digital products or services.*

| Field | What goes in it |
|---|---|
| Customer first / last name, email | Straight from the order. |
| Shipping address **and** billing address | Both. If they match, say so in the text — the cardholder's own address received the goods. |
| Fulfillments (carrier, tracking number, ship date) | Exactly as written on the order. |
| Shipping documentation file | The 17TRACK screenshot showing **DELIVERED + date + location**. |
| Customer communication file | The email thread — or nothing, and say so in the text. |
| Uncategorized / free text | The paragraph below. |

**Copy-paste, fill the bracketed values, delete the lines that do not apply:**

> Order [ORDER NUMBER] was placed on [ORDER DATE] and shipped on [SHIP DATE] with [CARRIER], tracking number [TRACKING NUMBER]. The carrier's tracking record confirms the parcel was **delivered on [DELIVERY DATE]** to [DELIVERY CITY/LOCATION]. The delivery address matches the billing address on the card used for the purchase. A screenshot of the carrier tracking record is attached.
>
> [IF NO CONTACT:] The customer did not contact us about a missing parcel at any point before this dispute was filed. Our support address, {{SUPPORT_EMAIL}}, is published on every order confirmation and on {{STORE_DOMAIN}}.
>
> [IF CONTACT:] We replied to the customer on [DATE] with the tracking information; the full email thread is attached.
>
> [IF A REFUND EXISTS:] A refund of [AMOUNT] {{CURRENCY}} was issued on [DATE] and appears on the order.
>
> [IF USEFUL:] The purchase terms the customer accepted at checkout are published at {{POLICY_URL}}. The charge appeared on the statement as "{{BILLING_DESCRIPTOR}}".
>
> On this evidence the product was received. We ask that the dispute be resolved in favour of the merchant.

**Timing rules:**
- **Read the real due date on the dispute. Never assume one.** Measured in one store's 29 dispute records: the gap between filing and the evidence deadline ran from **13 to 33 days**, most often 19. Any "it's always N days" rule you have heard is wrong somewhere.
- **"Save" is not "submitted."** Shopify sends the response on the due date. **"Submit now" locks it — no further edits.**
- Use **Submit now** only when tracking already says DELIVERED. If the parcel is still moving, **Save** and let it run to the due date so a delivery scan can still land.
- **After the due date you cannot submit anything.** There is no appeal and no exception. If you open a dispute that is already past due: do not build evidence, write one line in the order notes and tell {{ESCALATION_CHANNEL}} that a deadline was missed.
- **Never promise the customer an outcome date.** Bank review times vary widely and we have no reliable number. Say: "the bank decides, and it can take a few months."
- **File limits are shown on the upload form** (PDF / JPEG / PNG, a size cap per file and in total, a page cap). **The form is authoritative** — if it rejects your file, shrink it, don't argue with this document.

---

## 6. Email templates

**Language:** write in **{{CUSTOMER_LANGUAGE}}** — the language the customer wrote in, or the store's market language if they never wrote. Never answer a customer in a language they did not use. The templates below are the English master; translate, don't improvise.

The best possible outcome is the customer withdrawing the dispute. **Only the customer can do that** — they must call their own bank. We cannot withdraw anything from our side, and we must never tell them we can.

**Rules for every email:** reply within 24 hours · plain language · no blaming the carrier · no "unfortunately, our policy" · never send the customer off to the carrier or the manufacturer. We sold it, we handle it.

**`{{TRACKING_LINK}}` and `{{PARCEL_NUMBER}}`:** on a store with a tracking page, the link is `{{TRACKING_PAGE}}?nummer={{PARCEL_NUMBER}}` and the parcel number is the store's own (`{{PARCEL_PREFIX}}` + 8 characters — read it on `{{TRACKING_PAGE}}` after pasting the carrier number, or under the button in the customer's shipping email). **Never paste the raw carrier number (YT…, 4PX…) into a customer email** — the carrier number and the 17TRACK screenshot are for the bank. A store without a tracking page uses the 17TRACK link and says "tracking number" instead.

### 6A. Tracking says DELIVERED — ask for the withdrawal

> **Subject:** Your order [ORDER NUMBER] — the parcel was delivered on [DELIVERY DATE]
>
> Hi [FIRST NAME],
>
> Your bank has contacted us about order [ORDER NUMBER], and I want to get this sorted for you.
>
> The carrier record shows the parcel was delivered on [DELIVERY DATE] to [DELIVERY CITY/LOCATION]. You can see the full record here: {{TRACKING_LINK}} (your parcel number is {{PARCEL_NUMBER}}).
>
> If the parcel is with you after all, please call your bank and ask them to cancel the case. Only you can do that — we are not able to withdraw it from our side. It takes two minutes and it closes the matter.
>
> If you genuinely do not have the parcel, reply to this email and I will help you find it. Three things solve almost every case: check with anyone else at the address, check whether it was left with a neighbour or at a pickup point, and confirm the delivery address below is the right one.
>
> Delivery address on the order: [SHIPPING ADDRESS]
>
> One thing so there are no surprises: the bank has given us a deadline, so I will send them the delivery record before it runs out. That does not stop us sorting this out between us — write to me either way.
>
> Best regards,
> [YOUR NAME] · {{STORE_NAME}} Customer Support
> {{SUPPORT_EMAIL}}

### 6B. Still in transit, or waiting at a pickup point

> **Subject:** Your order [ORDER NUMBER] — where the parcel is right now
>
> Hi [FIRST NAME],
>
> I have just checked your parcel. The last scan was [LAST SCAN DESCRIPTION] in [LOCATION] on [DATE]. You can follow it here: {{TRACKING_LINK}} (your parcel number is {{PARCEL_NUMBER}}).
>
> [IF WAITING FOR PICKUP:] It is waiting for you at [PICKUP LOCATION]. Parcels are only held there for a limited time before they are sent back, so please collect it when you can.
>
> [IF MOVING:] Nothing is wrong with the shipment — it is moving. I will watch it and email you again as soon as it is out for delivery.
>
> If it has not reached you by [DATE + 7 DAYS], reply to this email and I will send a replacement or refund you in full. You do not need to chase me.
>
> Best regards,
> [YOUR NAME] · {{STORE_NAME}} Customer Support
> {{SUPPORT_EMAIL}}

### 6C. Stuck, lost, or no tracking — we are in the wrong, fix it today

> **Subject:** Your order [ORDER NUMBER] — this one is on us
>
> Hi [FIRST NAME],
>
> I have looked at your parcel and you are right. [IF STUCK:] The carrier registered it on [DATE] and it has not moved since. [IF NO TRACKING:] It was marked as shipped but never got a working tracking number. That is not acceptable and you should not have had to chase it.
>
> Tell me which you would prefer and I will do it today:
>
> 1. A full refund of [AMOUNT] {{CURRENCY}} back to the card you paid with.
> 2. A new parcel sent out, with a new tracking number.
>
> If I do not hear from you within two days I will simply refund you in full — I would rather you have your money back than keep waiting.
>
> Sorry for the trouble.
>
> [YOUR NAME] · {{STORE_NAME}} Customer Support
> {{SUPPORT_EMAIL}}

---

## 7. Tracking says delivered, the customer still says no

Work in order. Stop at the first step that resolves it.

1. **Compare the delivery address on the order with what the customer tells you.** A wrong street number is the most common real cause. If the address is wrong **and it is what the customer entered at checkout**, the parcel was still delivered as ordered — keep the evidence, and decide the goodwill question with rule 6 below.
2. **Ask about household, neighbours and pickup points.** If the status was `READY_FOR_PICKUP`, name the pickup location in the email — parcels sit there and then go back.
3. **Compare the delivery scan against the customer's story.** A scan in a different city than the delivery address is a genuine carrier error: treat it as §6C, refund or reship, and do not fight.
4. **If the customer says it was stolen or never arrived at a correct address**, ask for one line in writing — it is standard and costs them nothing:

   > To take this further with the carrier I need one line from you in writing: "I confirm that the parcel for order [ORDER NUMBER] was not received at [ADDRESS], and that no one else at the address accepted it." If your local police take reports for stolen deliveries, a report number helps the carrier claim — but send me the confirmation either way, I will not hold up the case waiting for it.

5. **Still deadlocked?** Submit the delivery evidence — it is factual — **and** decide the refund separately. Both can be true: we prove delivery to the bank, and we keep the customer.
6. **The goodwill line is a number, not a feeling.** Below **{{FIGHT_THRESHOLD}} {{CURRENCY}}**, refund or reship rather than spend an hour arguing. At or above it, fight with the scan.

**VERIFY IN SHOPIFY ADMIN:** whether this customer has other, undisputed orders on the same card (Customers → the customer → order history). Prior undisputed history with the same cardholder is worth one sentence in the evidence if it exists.

---

## 8. When to stop and escalate

| Situation | Action |
|---|---|
| **The order number is not in this store's dispute list** | Do **not** conclude "wrong store" yet. Most dispute rows carry no order name at all — in one store's 29 records, 25 showed only a raw numeric Shopify order id, because the order was older than the report's 30-day window. **Match by amount + filing date + customer email**, and open the dispute from the order page rather than searching the dispute list. Only when that fails: run `node kundtjanst/tvistfakta.mjs <order> --brand <other-store-id>` for the other stores (`node kundtjanst/run.mjs --kolla` lists them). If it is genuinely in another store, hand it to that store's VA — never submit one store's evidence on another store's dispute. |
| **No tracking number on a fulfilled order** | Refund or accept (§4), then escalate to {{ESCALATION_CHANNEL}} the same day. Fulfilment is broken and every future dispute on those orders is unwinnable. |
| **The store's dispute rate crosses the warning line** | The weekly report already measures disputes as a share of orders and flags yellow at `trosklar.tvistgrans_gul_procent` and red at `trosklar.tvistgrans_rod_procent`. Escalate when the report flags it — do not count disputes by hand, and do not treat a handful of `product_not_received` cases in a week as an alarm on its own (one store logged 20 in 30 days at a 0.11 % rate). |
| **Dispute is `under_review`** | Evidence is in. Do nothing. The bank's decision is final when it comes. |
| **Dispute is `won` / `lost` / `accepted` / `charge_refunded`** | Finished. Never re-open, never re-submit. |
| **Deadline today or already passed** | Today: submit whatever is true, now. Passed: nothing can be submitted — note it in the order and report it to {{ESCALATION_CHANNEL}} so the daily alert gets fixed. |
| **Customer threatens the bank but has not filed yet** | This is the cheapest moment there will ever be. Reply within 24 hours and refund or reship **before** the bank is involved — a dispute costs the fee on top of the order. |
| **Anything that hinges on a card-network rule** (a fee, a threshold, a deadline you were told about) | Escalate. Do not invent it and do not quote it to a customer. |

**Privacy:** real customer names, addresses and emails go in the Shopify evidence form only. When you report a case in Discord or in the weekly report, use the order number — the reports mask customer addresses on purpose.

---

## 9. Definition of done

- [ ] Reason field read **in Shopify** and it really is `product_not_received`.
- [ ] `node kundtjanst/tvistfakta.mjs <order> --brand {{STORE_ID}}` run (or §2 done by hand), tracking status + date + location written down.
- [ ] Checked whether the order has **more than one fulfillment** (the tool only reads the first).
- [ ] Checked whether the order carries **more than one dispute** — each answered separately.
- [ ] Checked whether a refund already exists on the order.
- [ ] Checked whether the customer ever contacted us, and stated it either way in the evidence.
- [ ] Decision taken from §1: **fight / hold / refund / accept**, and the reason noted.
- [ ] If fighting: evidence filled — names, email, both addresses, carrier + tracking + ship date, 17TRACK screenshot, explanation paragraph.
- [ ] **Saved** (not "Submit now") if the parcel is still moving; **Submit now** only with a delivery scan in hand.
- [ ] If refunding or accepting: done in Shopify per §4, and the status checked the next day.
- [ ] Customer emailed from {{SUPPORT_EMAIL}} in {{CUSTOMER_LANGUAGE}} using 6A, 6B or 6C — with the withdrawal ask if delivered.
- [ ] Evidence deadline written in the daily list so nothing passes unanswered.
- [ ] **One line in the order notes: what was decided and why**, so the next person does not re-litigate it.

---

## 10. Gaps — do not fill these with guesses

- [ ] **Card-network (Visa / Mastercard) deadlines, fees, thresholds and win rates are not verified anywhere in this system.** If a rule like that would decide a case, escalate instead of inventing it. Third-party statistics about what wins disputes are not evidence and are not quoted in this SOP.
- [ ] **Chargeback fee amount: unknown.** VERIFY IN SHOPIFY ADMIN: **Settings → Payments**, and the dispute itself, which shows what was debited.
- [ ] **Whether an explicit "accept dispute" action exists** in this store's admin. VERIFY IN SHOPIFY ADMIN on the dispute page; write the answer into the store config comment the first time you see it (§4).
- [ ] **Admin form field labels** may differ from the names in §5, which come from Shopify's API. Match by meaning; anything that has no field goes in the free-text box.
- [ ] **Whether an unanswered inquiry becomes a chargeback** is not documented by Shopify. We have seen orders travel that path on one store — treat it as our own observation, never as a rule, and never write it to a bank.
- [ ] **Partial vs full refund during an inquiry:** only a **full** refund is documented as ending an inquiry. Do not assume a partial one is enough.
- [ ] **Bank review time:** no reliable number. Never quote one to a customer.
- [ ] **The weekly report's action plan phrases an unanswered dispute as "lost automatically."** This SOP deliberately does not repeat that to customers or banks (§1). If the two ever need to agree, that is the owner's call.

---

## 11. Store config — fill once per store, never inline it above

All of it already exists in this repo. **Do not create a new file or a new key.**

- **OPS store built by the factory:** name, support email and Shopify domain come from `factory/butiker/<store-id>.yaml`. Add `kundtjanst/brands/<store-id>.yaml` with the **same id** only for the dispute values below.
- **Any other store:** copy `kundtjanst/brand-mall.yaml` to `kundtjanst/brands/<store-id>.yaml` and fill it.

```yaml
# kundtjanst/brands/<store-id>.yaml
brand:
  namn:        ""      # → {{STORE_NAME}}      the brand as the customer knows it
  supportmail: ""      # → {{SUPPORT_EMAIL}}   the mailbox we answer from
  shop:        ""      # xxxx-xx.myshopify.com — without it there are no orders and no disputes
  land:        SE      # → market; drives {{CUSTOMER_LANGUAGE}}
  valuta:      SEK     # → {{CURRENCY}}

tvister:
  returadress:        ""    # → {{RETURN_ADDRESS}}      (used by the return-driven SOPs, not this one)
  returfonster_dagar: 14    # → {{RETURN_WINDOW_DAYS}}  (same)
  policy_url:         ""    # → {{POLICY_URL}}          the page the customer accepted at checkout
  billing_descriptor: ""    # → {{BILLING_DESCRIPTOR}}  what the charge says on the statement.
                            #   Don't guess it: Shopify admin → Settings → Payments →
                            #   Customer billing statement.
  strid_lonar_sig_over: 0   # → {{FIGHT_THRESHOLD}} in this store's own currency.
                            #   Below it, refund instead of fighting. 0 = always fight.

trosklar:
  tvistgrans_gul_procent: 0.5   # disputes / orders — weekly report turns yellow here
  tvistgrans_rod_procent: 0.9   # and red here
```

Two values are **not** in the file and must be agreed once per store, then written into this block as a comment:

- **{{STORE_DOMAIN}}** — the public shop domain shown to customers (the `shop:` field is the internal myshopify address, not what a customer recognises).
- **{{ESCALATION_CHANNEL}}** — exactly where a VA escalates: the Discord channel name, or the owner's address. A VA must never have to ask "who do I tell?"

**Related:** `kundtjanst/sop/00-MASTER.md` (start here if the reason is not `product_not_received`) · the fact tool `kundtjanst/tvistfakta.mjs` · the daily deadline alert `/tvistkoll` · the weekly report `/kundtjanst`.

<!--
REVIEW: fixed 24 defects.

INVENTED RULES (6)
1. "Stripe's published analysis: +27 percentage points" — unverifiable third-party statistic stated as fact. Deleted; replaced with this repo's own measured dispute records.
2. "Stripe: evidence submitted while in transit is worth only +2 pp" — same. Deleted; the hold-vs-submit rule now stands on the deadline, not on a borrowed number.
3. "The due date varies from 7 to 21 days" — stated as fact AND contradicted by our own data (see #13).
4. "stuck for more than ~3 weeks" — invented threshold. Replaced with the rule the repo's own decision function uses: no delivery scan, no fight, regardless of elapsed time.
5. "up to 75 days, 65-75 days, 30-90 days, 120 days" bank review times — numbers presented as Shopify's. Removed; the rule ("never promise a date") kept.
6. File limits (2 MB / 4 MB / 50 pages) stated as fact — downgraded to "the upload form states the limits, the form wins".
7. "many banks receive chargeback evidence through fax machines" — unverifiable quote. Rewritten as a plain legibility instruction.

WRONG ON THE DATA (5) — checked against kundtjanst/korningar/<store>/2026-W38.json (run 2026-09-14, 30-day window, 29 disputes)
8. "orders 5435, 5763, 5289 ... all product_not_received, all delivered, all WON. Three wins in a row." FALSE: #5763 is 100 SEK and still `needs response` (due 2026-10-02); #5289 does not appear in the dispute records at all. Only #5435 is a real win (348 SEK, won). Rewritten as a table of real records.
9. "#5584 ... stuck at InfoReceived since 2026-08-20 ... row 6 of the table". FALSE on two counts: its reason is `credit_not_processed`, not `product_not_received`, so it does not belong in this SOP at all; and the date 2026-08-20 is invented (real: filed 2026-09-10, due 2026-09-23, 348 SEK, chargeback). Turned into the worked example for "read the reason field, not the hand-written label".
10. "order 5053 carries two disputes, 348 and 255". The two-dispute order is real but it is Shopify order id 17666239660381 (348 + 255 SEK, both product not received, both due 2026-09-28). Corrected.
11. "order 4825 — Confirmed: the order exists in that shop, delivered 2026-08-26, but no dispute in that shop's Shopify Payments." Both the confirmation and the delivery date are invented. Replaced with the measured explanation: 25 of 29 dispute rows carry no order name, only a raw Shopify order id, because the order is older than the 30-day order window (shopify.mjs normaliseraTvist returns ordernamn: null). "Wrong store" is now the last conclusion, not the first.
12. "More than 3 product_not_received disputes in one week on one store → escalate" would fire permanently: one store logged 20 in 30 days at a 0.11 % dispute rate, under its own 0.5 % yellow line. Replaced with the thresholds the weekly report actually uses.
13. Due-date range corrected to the measured 13-33 days (most often 19) across the 29 real records.

NOT PORTABLE (3)
14. "Carrier is usually YunExpress or 4PX on these stores" — hardcoded carriers in the procedure. Now: read the carrier off the order.
15. Config block pointed at a key `tvist:` that does not exist. The real key is `tvister:` in kundtjanst/brand-mall.yaml, and STORE_NAME / SUPPORT_EMAIL / CURRENCY live in the `brand:` block (or in factory/butiker/<id>.yaml for factory-built stores). Rewritten against the real file, and moved to the end so the decision is first.
16. `tvistfakta.mjs` defaults to one specific store when `--brand` is omitted — a silent wrong-store landmine. Now flagged at every command.

NOT ACTIONABLE (7)
17. The repo's own one-command fact tool (kundtjanst/tvistfakta.mjs) was missing entirely; it replaces ~10 minutes of clicking in three systems and prints the FIGHT/REFUND/ESCALATE decision. Now step 1.
18. ACCEPT had no navigation at all, and contradicted the SOP's own note that Shopify auto-submits on the due date (silence is not a clean concede). §4 now gives both paths, plus a VERIFY for the accept action.
19. Refund path had no navigation. Added (Orders → order → Refund), plus the status to check afterwards (`charge_refunded`).
20. "offer a goodwill replacement if the order value is small" — "small" is now the real config field `tvister.strid_lonar_sig_over` → {{FIGHT_THRESHOLD}}, which also answers the fight-vs-refund economics question directly.
21. "escalate to the owner" / "check the other stores" named no channel and no command. Added {{ESCALATION_CHANNEL}} and the actual commands.
22. No language rule — customers are not English speakers. Added {{CUSTOMER_LANGUAGE}} and the rule that the templates are a master to translate, not to send as-is.
23. Nothing said what to do when the deadline is today or already past. Added to the decision table and §8.
24. Missing from §2: `Expired` / `NotFound` statuses (NotFound normally means "not registered yet"), and the fact that the tool reads only the first tracking number on the first fulfillment, so split shipments must be read by hand.

Also fixed: dispute status vocabulary (needs_response / under_review / charge_refunded / accepted / won / lost) added so a VA knows when a case is finished; template 6A no longer tells the customer "I will keep this case open on my side" (we cannot, and we will submit before the deadline — now stated honestly); "never refund AND submit evidence on the same dispute"; a privacy line (real customer data in the evidence form only, order numbers in Discord); unused {{RETURN_ADDRESS}} / {{RETURN_WINDOW_DAYS}} marked as belonging to the return-driven SOPs; Related section pointed at the real paths, including kundtjanst/sop/00-MASTER.md, which tvistfakta.mjs already tells the VA to open.

REMAINING GAPS — need the owner, cannot be resolved from the data:
- Whether this store's Shopify admin offers an explicit "accept dispute" action. Nobody has looked; §4 step 2 says where to look and to write the answer into the config.
- The chargeback fee amount. Never read; only the dispute page shows it.
- {{FIGHT_THRESHOLD}} is 0 in the template (= always fight). The owner must set a real number per store, otherwise §1's economics row and §7 rule 6 do nothing.
- {{STORE_DOMAIN}} and {{ESCALATION_CHANNEL}} have no field in brand-mall.yaml. Either the owner adds them or every store writes them as comments; today they are the only two placeholders with no source of truth.
- The weekly report's action plan says an unanswered dispute is "lost automatically"; this SOP refuses to repeat that. One of the two should change — owner's call.
- Order #5289 and the other orders in the owner's hand-written list (5418, 5053, 4446, 5122, 5044, 4706, 6349, 4825) could not be matched to dispute records here, because the reports only carry 30 days of order names. Their reasons must be read in Shopify before any of them is worked with this SOP.
-->
