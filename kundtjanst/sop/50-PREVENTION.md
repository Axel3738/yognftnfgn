# 50 — Preventing the next dispute

**Use this when:** once a week when the customer-service report lands, and again after every single dispute — to find the leak that produced it.

**Who runs it:** whoever owns the numbers for a store — owner, ops manager, or lead VA. Every step below is a command or a click. The only things that need the owner are marked 🔑 OWNER (money, ad spend, credentials, config).

**Time:** 10 minutes to read and decide. Fixing what it finds takes longer — that is the point of doing it weekly.

**This file is not how you handle one dispute.** For a dispute in front of you right now: `kundtjanst/sop/00-MASTER.md`, and run

```bash
node kundtjanst/tvistfakta.mjs <order number> --brand {{STORE_ID}}
```

which prints the facts and the FIGHT / REFUND / ESCALATE verdict for that one case.

---

## 0. If you only have two minutes

| If this is true right now | Do this, today | Then |
|---|---|---|
| Any dispute with evidence due in ≤ 3 days (`node kundtjanst/tvistkoll.mjs --brand {{STORE_ID}}`) | Stop reading. Run `tvistfakta.mjs` on it, decide FIGHT or REFUND with the table below, submit or accept in Shopify | Come back to the weekly review afterwards |
| Risk level is 🔴 (score ≥ 50) | The VA does nothing but the inbox this week. No new projects | Section 3, step 3 |
| Unanswered > {{UNANSWERED_HOURS}}h is above zero | Sort those by category and answer "never delivered / unknown charge / threatens bank" first | Leak 2, section 4 |
| Any parcel with no new scan for {{STALL_ALERT_DAYS}} days | Send template A **before the customer writes** | Leak 1, section 4 |
| None of the above | Run the 10-minute routine in section 3 | — |

**The fight/accept call, in one table.** This mirrors `dom()` in `kundtjanst/tvistfakta.mjs` exactly — if the tool and this table ever disagree, the tool is right and this table is stale.

| Dispute reason (as Shopify labels it) | What our own data shows | Decision |
|---|---|---|
| `product_not_received` + carrier scan says DELIVERED | Strongest evidence we have | **FIGHT** |
| `product_not_received`, no scan / stuck / no tracking number | Nothing to submit | **REFUND — do not fight** |
| `credit_not_processed` + a refund was already paid on the order | The claim is factually wrong | **FIGHT** (attach the refund receipt) |
| `credit_not_processed`, no refund paid, goods delivered | Winnable — but search the inbox for a refund someone promised in writing first | **FIGHT** |
| `credit_not_processed`, no refund paid, not delivered | Two failures at once | **REFUND** |
| `product_unacceptable` + order already fully refunded | Nothing left to claim | **FIGHT** |
| `product_unacceptable`, delivered, return address was sent, nothing came back | Weakest category we fight. If the fault is real and we refused a return or replacement, we deserve to lose — read the email thread before submitting | **FIGHT (medium)** |
| `product_unacceptable`, not delivered | The complaint cannot even be about the product yet | **REFUND** |
| `fraudulent` / `unrecognized`, billing and shipping addresses **do not** match | Looks like real card fraud | **REFUND + block the customer** |
| `fraudulent` / `unrecognized`, addresses match | Usually a family member, or our billing descriptor is unrecognisable | **FIGHT** |
| `duplicate` | Needs a human to compare the two charges | **ESCALATE** 🔑 OWNER |
| No tracking number on the order at all | Fulfilment is broken, not support | **ESCALATE** 🔑 OWNER |
| Order value below {{FIGHT_THRESHOLD}} {{CURRENCY}} | VA time costs more than the order | **REFUND**, whatever the reason code says |

⚠️ **The reason code is the bank's, not the customer's.** Decide from the reason code in Shopify, then read the email thread. *Example, one Swedish store, 2026-09-20:* order #5584 was a parcel that never moved, and the bank filed it as `credit_not_processed`. The reason code decides what evidence is asked for; the email thread tells you whether we deserve to win.

---

## 1. The weekly decision table

Seven numbers. All of them are already computed by `bedomRisk()` in `kundtjanst/chargeback.mjs` and printed in `kundtjanst/korningar/{{STORE_ID}}/<week>.md` (Swedish, for the owner) and `<week>.en.md` (English, for the VA). Do not invent new metrics.

| # | Number (signal id) | Where it is | Green | Act when | What you do |
|---|---|---|---|---|---|
| 1 | Risk score + level (`risk.poang`, `NIVAER`) | first table in the report | 🟢 below 25 | 🟡 25–49 | 🔴 50+ = the VA stops all non-inbox work this week and clears the queue. Compare with last week: **rising matters more than the absolute number** |
| 2 | Unanswered tickets > {{UNANSWERED_HOURS}}h (`obesvarade`, cap 25 p) | report + published page | 0 | ≥ 1 that is chargeback-prone (never delivered, unknown charge, threat) | Fix inbox time this week. **This is the #1 leading indicator we have** |
| 3 | Median first response (`svarstid`) | report | ≤ {{FIRST_REPLY_TARGET_HOURS}}h | > {{FIRST_REPLY_TARGET_HOURS}}h (10 p) / > {{UNANSWERED_HOURS}}h (20 p) | Give the VA one fixed inbox hour per day. **Read the warning below before you trust this number** |
| 4 | Bank inquiries, last {{WINDOW_DAYS}} days (`forfragningar`, 5 p each, cap 15 p) | report | 0 | ≥ 1 open | Every open inquiry gets answered before its deadline — see #7 |
| 5 | Chargebacks + dispute rate (`tvister`, `tvistgrad`) | report | below {{DISPUTE_RATE_YELLOW}} % | ≥ {{DISPUTE_RATE_YELLOW}} % → review; ≥ {{DISPUTE_RATE_RED}} % → stop-the-line | 🔑 OWNER: stop scaling ad spend on the product driving them until the leak is closed |
| 6 | Paid orders unfulfilled > {{UNFULFILLED_DAYS}} days (`ofullbordade`, 4 p each) + fulfilled without tracking (`utan_sparning`, 2 p each) | report | 0 / 0 | ≥ 1 | Supplier / fulfilment problem, not a support problem. 🔑 OWNER fixes it at the source |
| 7 | Open disputes with a deadline | `node kundtjanst/tvistkoll.mjs --brand {{STORE_ID}}` (runs daily by itself) | none due ≤ 3 days | any | The VA answers today. See the escalation note below |

**⚠️ Three traps in this table.**

1. **Median first response is not evidence that the inbox is healthy.** It only measures tickets that eventually got an answer. *Measured, one Swedish store, week 2026-W38 (run 2026-09-14, period 2026-08-15 → 2026-09-14):* median first reply **17.3 h — green** in the same week the store read **🔴 100/100** on **192 tickets unanswered for more than 48 h**. Number 2 overrules number 3, always.
2. **The rate is the lagging number, the mailbox is the leading one.** Same store, same week: dispute rate **0.11 %** — below our own red threshold — while the mailbox held **122 WISMO** and **86 "never delivered"** tickets, 66 of them unanswered. Every dispute in section 4 was already sitting in that mailbox weeks earlier.
3. **A skipped store is not a green store.** *Measured in `korningar/_ranking/2026-W38.md`:* **7 of 8 stores** were skipped with "mejlen kan inte läsas — saknar `KUNDTJANST_MAIL_PASS_<ID>`". They produced no numbers at all, and an empty row reads like a calm one. Run `node kundtjanst/run.mjs --kolla` to list exactly which key each store is missing. 🔑 OWNER adds them in Environments.

**Inquiry vs chargeback — do not collapse the two.**

- **Chargeback:** the money is already withdrawn. If we do not respond before the evidence deadline we do not get to present a case at all. *Measured 2026-09-20, one store, 50 disputes:* chargebacks **1 won of 4** — and **every loss that store has ever had was a chargeback**.
- **Inquiry:** the bank is only asking. *Same measurement:* **29 of 29 decided inquiries won, 0 lost.** An ignored inquiry is not lost on the spot — it **escalates into a chargeback** (documented in `kundtjanst/tvistkoll.mjs`: orders #4914, #5044 and #4706 went exactly that way). That is the real cost of ignoring it.

Never write "an unanswered dispute is lost automatically" anywhere in this system. It is false for inquiries and the repo says so in code.

---

## 2. Config block — one per store, nothing else store-specific

Everything brand-specific lives in `kundtjanst/brands/{{STORE_ID}}.yaml` (or is inherited from `factory/butiker/{{STORE_ID}}.yaml`). **The procedure text never names a brand.**

### Keys that already exist

| Placeholder | YAML key | Default | Example value — *Swedish example store, not the rule* |
|---|---|---|---|
| `{{STORE_ID}}` | the file name `brands/<id>.yaml` | — | `baverbutiken` (`node kundtjanst/run.mjs --kolla` lists all ids) |
| `{{STORE_NAME}}` | `brand.namn` | — | Bäverbutiken |
| `{{STORE_DOMAIN}}` | derived from the store | — | baverbutiken.se |
| `{{SUPPORT_EMAIL}}` | `brand.supportmail` | — | kundsupport@baverbutiken.se |
| `{{CURRENCY}}` | `brand.valuta` | — | SEK |
| `{{RETURN_ADDRESS}}` | `tvister.returadress` | — | (full postal address, one block) |
| `{{RETURN_WINDOW_DAYS}}` | `tvister.returfonster_dagar` | 14 | 14 |
| `{{POLICY_URL}}` | `tvister.policy_url` | — | {{STORE_DOMAIN}}/policies/refund-policy |
| `{{BILLING_DESCRIPTOR}}` | `tvister.billing_descriptor` | — | the text on the customer's card statement. If blank, do not guess: Shopify admin → Settings → Payments → *Customer billing statement* |
| `{{FIGHT_THRESHOLD}}` | `tvister.strid_lonar_sig_over` | 0 (= always fight) | below this order value, refund instead of fighting 🔑 OWNER |
| `{{UNANSWERED_HOURS}}` | `trosklar.obesvarad_timmar` | 48 | 48 |
| `{{UNFULFILLED_DAYS}}` | `trosklar.ofullbordad_dagar` | 5 | 5 |
| `{{WINDOW_DAYS}}` | `trosklar.ordrar_dagar` (mail: `arenden_dagar`) | 30 | 30 — ⚠️ never lower it to 7; everything unanswered for over a week falls out of the report |
| `{{DISPUTE_RATE_YELLOW}}` | `trosklar.tvistgrans_gul_procent` | 0.5 | our own number, see section 8 |
| `{{DISPUTE_RATE_RED}}` | `trosklar.tvistgrans_rod_procent` | 0.9 | our own number, see section 8 |

### Keys this SOP needs and `kundtjanst/brand-mall.yaml` does not have yet

Paste this under `tvister:` in the store's brand file. Until it is there, use the defaults in the table.

```yaml
tvister:
  leveranslofte_dagar: "7-14"   # {{DELIVERY_PROMISE_DAYS}} — the delivery promise in the shipping emails and on the tracking page: CALENDAR days after the shipping email (measured on one store 2026-09-20: median 11.1, p90 13.0 days). Not "5–10 business days" — that promise is retired
  stillastaende_dagar: 10       # {{STALL_ALERT_DAYS}} — no new tracking scan for this many days = we write first
  forsenad_dagar: 17            # {{LATE_ALERT_DAYS}} — total transit days before we write first (our own choice: promise + 7)
  aterbetalning_dagar: 14       # {{REFUND_DEADLINE_DAYS}} — money must leave within this many days of agreeing a refund
  forsta_svar_mal_timmar: 24    # {{FIRST_REPLY_TARGET_HOURS}} — our first-response target
```

`{{LATE_ALERT_DAYS}}`, `{{STALL_ALERT_DAYS}}` and `{{FIRST_REPLY_TARGET_HOURS}}` are **our operational choices, not law and not a card-network rule.** `{{REFUND_DEADLINE_DAYS}}` has a legal floor in some markets — see section 8.

### Per-case fields the templates use — where each one comes from

| Field | Where you read it |
|---|---|
| `{{ORDER_NUMBER}}` | Shopify admin → Orders → the order, e.g. `#5584` |
| `{{CUSTOMER_FIRST_NAME}}` | the order's shipping name, first word |
| `{{AGENT_NAME}}` | the VA's own first name. Always a real name, never "Customer Service" |
| `{{TRACKING_LINK}}` | on a store with a tracking page: `{{TRACKING_PAGE}}?nummer={{PARCEL_NUMBER}}` — the store parcel number (`{{PARCEL_PREFIX}}` + 8 characters) is shown on `{{TRACKING_PAGE}}` when you paste the carrier number, and under the button in the customer's shipping email. Never the raw carrier number in a customer email. No tracking page: `https://t.17track.net/en#nums=<tracking number>` |
| `{{LAST_SCAN_DATE}}` | last event date from 17TRACK, or the `Tracking` line in `tvistfakta.mjs` output |
| `{{AMOUNT}}` | the refunded amount, exactly as Shopify shows it |
| `{{DATE}}` | today, written out: `20 September 2026` |
| `{{DATE_PLUS_3}}` / `{{DATE_PLUS_5}}` / `{{DATE_PLUS_10}}` | today + 3 / 5 / 10 calendar days, written out the same way |

---

## 3. The weekly routine (10 minutes)

1. **Open the report:** `kundtjanst/korningar/{{STORE_ID}}/<week>.md`, or the published page (`kundtjanst/rapportsida.json` holds its URL). Read the seven numbers in section 1, in that order.
2. **Open the ranking:** `kundtjanst/korningar/_ranking/<week>.md` — which store is worst this week. **Read the skipped rows first** (trap 3 above): a store without a mailbox password produced no data. Fix the worst store with data first; the others inherit the fix.
3. **Send the VA the list the run already produced.** Do not write your own.
   - In the English report `<week>.en.md`, under the heading **`🔴 ACTION NEEDED`** — that is `risk.atgarder`, already sorted by how much each signal is costing.
   - The three buckets **Do today / Do this week / Fix the root cause** (`byggAtgardsplan()`) are on the **published page only**, not in the `.md` file. Open the page when you want the buckets.
4. **Check recurring problems:** the "Återkommande?" / recurring column marks any category that has been top-3 in 3 of the last 4 weeks (`aterkommande()`). It stays empty until three weeks of history exist — that is correct behaviour, not a bug. A recurring category is a **product or logistics** problem. Support cannot fix it; stop asking support to. 🔑 OWNER
5. **Pick one root-cause item** and give it a date. One per week, finished, beats five started.
6. **Confirm the daily dispute alarm actually ran:** the routine `node kundtjanst/tvistkoll.mjs --alla --discord` posts every dispute with a deadline inside 3 days. If it has been silent for a week and a chargeback still ran past its deadline, the routine is broken — check it, do not blame the VA.

---

## 4. The four leaks, and the rule that closes each

Every dispute in the example data traces back to one of these four. The quoted lines are the exact strings the code already prints (`klassificering.mjs` → `atgard_en`) — keep the report and this SOP saying the same words.

### Leak 1 — the parcel stalls and nobody tells the customer

> "Send tracking or reship. 'Item not received' is the most common chargeback reason."

**Rule:** when a parcel has had **no new scan for {{STALL_ALERT_DAYS}} days**, or has been in transit longer than **{{LATE_ALERT_DAYS}} days**, the VA emails the customer **first** (template A) and offers reship or refund. The customer must never be the one who discovers it.

*Worked example — one Swedish store, disputes reviewed 2026-09-20:* order **#5584** sat at "shipment information received" from 2026-08-20 and never moved. Nobody wrote. It is now a **real chargeback** — money already taken, evidence due 2026-09-23, and with no delivery scan there is nothing to submit. Contrast: of the 12 disputed orders reviewed by hand that day, **11 were confirmed delivered**, and every decided inquiry on them was won. One silent parcel = one unwinnable case.

### Leak 2 — a customer email is missed

> "Reply to every unanswered ticket today, chargeback-prone ones first (never delivered, unknown charge, threats)."

**Rule:** first response under {{FIRST_REPLY_TARGET_HOURS}}h, every day, no exception. Signals 2 and 3 are how you verify it — with trap 1 in mind.

*Worked example:* order **#5122** — the customer wrote asking to return damaged straps; support missed the email. He went to the bank instead. The return would have cost one parcel; the dispute cost the order plus the VA's time.

### Leak 3 — a return or refund is agreed and never finished

> "Process within 14 days by law. Slow refunds turn into 'credit not processed' disputes."
> *(That is the report's own wording. The 14 days is the EU/EEA distance-selling figure this repo's stores run on — for a store outside the EEA, see section 8 before repeating it to a customer.)*

**Rule:** a refund or cancellation is confirmed **in writing the same day** (template C) and the money leaves within **{{REFUND_DEADLINE_DAYS}} days**. Never let a case wait on the customer's confirmation: if there is no reply in 3 days, act anyway — refund or ship the replacement.

*Worked examples:* order **#5044** — the button broke on first use, support offered a replacement, the customer never confirmed, support waited. The customer's bank did not wait. Order **#4446** — **1 262.20 SEK** *(example store's currency)*, the largest of the set, no refund ever issued and **no conversation at all**. That one is leak 2 and leak 3 in the same order.

### Leak 4 — an unhappy customer with nowhere to go

> "Offer return + refund or partial refund fast. 'Not as described' disputes are almost always lost."

**Rule:** read the store's reviews once a week — your review app → Reviews → filter 1–2 stars *(example: Judge.me → Reviews → Rating filter)*. A 1–2 star review with no support ticket behind it is a customer who has already given up on writing to us. Reply publicly, and open the ticket yourself with template D.

*Worked example:* order **#4706** — no conversation with support ever; the customer left a review showing disappointment, the bank inquiry that followed went unanswered, and it escalated into a real chargeback (the same path as #4914 and #5044).

---

## 5. When to stop preventing and just refund

Prevention has a price, and so does fighting. Give the VA a standing rule so they never have to ask:

- **Order value below {{FIGHT_THRESHOLD}} {{CURRENCY}}** and the customer is clearly unhappy → refund or reship immediately. VA time costs more than the order.
- **Parcel not delivered, or stalled past {{STALL_ALERT_DAYS}} days** → reship or refund on the spot. There is no delivery scan, so there is no case to protect.
- **Product genuinely defective, or we refused a return that we should have accepted** → refund, do not argue. We deserve to lose that one, and a refunded customer does not call the bank.
- **Real card fraud** (billing and shipping addresses do not match) → refund and block. Fighting it loses and costs the fee on top.
- **While it is still an inquiry, a refund is the cheap exit.** VERIFY IN SHOPIFY ADMIN, once, on a live dispute: while the case is an inquiry the dispute page offers refunding the order as a resolution; once it has become a chargeback the money is already withdrawn and the order's refund button is not available. Write what your admin actually shows into this line and delete this sentence. Everything in this SOP is cheap while it is still an email and impossible once the bank has moved.

---

## 6. Proactive emails (copy-paste)

English base. **Reply in the language the customer wrote in** — translate, do not answer Swedish with English. Fill every `{{…}}` before sending; an unfilled placeholder in a live email is worse than no email.

**Template A — parcel stalled, sent by us first (day {{STALL_ALERT_DAYS}}):**

> Subject: Your order {{ORDER_NUMBER}} — an update from us
>
> Hi {{CUSTOMER_FIRST_NAME}},
>
> I checked your parcel today and I don't like what I see: it hasn't moved since {{LAST_SCAN_DATE}}. I'm sorry — you shouldn't have to wait this long, and you shouldn't have to be the one asking.
>
> Here is the tracking so you can see exactly what I see: {{TRACKING_LINK}}
>
> Tell me which you prefer and I'll do it today:
> 1. I send you a new one, free, today.
> 2. I refund you in full, today.
> 3. You give it a few more days — parcels do sometimes start moving again — and I check again on {{DATE_PLUS_5}} and write to you either way.
>
> If I don't hear from you by {{DATE_PLUS_3}}, I'll assume option 1 and send a replacement.
>
> {{AGENT_NAME}}
> {{STORE_NAME}} · {{SUPPORT_EMAIL}}

**Template B — return request, answered in one reply (no round trips):**

> Subject: Return for order {{ORDER_NUMBER}} — address and steps
>
> Hi {{CUSTOMER_FIRST_NAME}},
>
> Sorry this one didn't work out. Your return is approved — you don't need to wait for anything else from me.
>
> Send it to:
> {{RETURN_ADDRESS}}
>
> Please write your order number {{ORDER_NUMBER}} on or inside the parcel, and send me the tracking number once you have it. Your return window is {{RETURN_WINDOW_DAYS}} days from delivery, and the full policy is here: {{POLICY_URL}}
>
> As soon as the parcel is scanned as on its way back, I start your refund — you won't have to chase me for it.
>
> {{AGENT_NAME}}
> {{STORE_NAME}} · {{SUPPORT_EMAIL}}

**Template C — refund confirmed in writing, the same day:**

> Subject: Your refund for order {{ORDER_NUMBER}} is on its way
>
> Hi {{CUSTOMER_FIRST_NAME}},
>
> Your refund of {{AMOUNT}} {{CURRENCY}} for order {{ORDER_NUMBER}} was issued today, {{DATE}}, back to the card you paid with.
>
> Banks take a few working days to show it, and I can't control how long. It will appear on your statement as {{BILLING_DESCRIPTOR}} — that's us, so don't be surprised by the name.
>
> If you still can't see it by {{DATE_PLUS_10}}, reply to this email and I'll chase it together with you.
>
> {{AGENT_NAME}}
> {{STORE_NAME}} · {{SUPPORT_EMAIL}}

**Template D — we found a 1–2 star review and there is no ticket behind it:**

> Subject: I saw your review of order {{ORDER_NUMBER}} — let me fix it
>
> Hi {{CUSTOMER_FIRST_NAME}},
>
> I read your review today. You shouldn't have had to write it to be heard, and I'm sorry you did.
>
> I'd rather fix this than leave it. Two options, both free for you, and I'll start whichever you pick today:
> 1. A replacement, shipped with tracking.
> 2. A full refund of {{AMOUNT}} {{CURRENCY}}, back to the card you paid with.
>
> If you'd rather send the item back first, that's fine too — the address is {{RETURN_ADDRESS}} and the policy is here: {{POLICY_URL}}
>
> Just reply with 1 or 2. If I haven't heard from you by {{DATE_PLUS_3}}, I'll refund you anyway.
>
> {{AGENT_NAME}}
> {{STORE_NAME}} · {{SUPPORT_EMAIL}}

---

## 7. Checking tracking without breaking something

**Fastest, and the one to use on a dispute** — reads Shopify and 17TRACK and prints order facts, refunds, delivery scan and the FIGHT/REFUND/ESCALATE verdict:

```bash
node kundtjanst/tvistfakta.mjs <order number> --brand {{STORE_ID}}
node kundtjanst/tvistfakta.mjs --alla --brand {{STORE_ID}}     # every open dispute, short
node kundtjanst/tvistfakta.mjs <order number> --brand {{STORE_ID}} --registrera
```

It is read-only against Shopify: it changes no dispute, submits no evidence, moves no money.

⚠️ **Old parcels are not registered with 17TRACK and cannot be read until they are.** *Measured 2026-09-20: all twelve disputed orders answered "does not register, please register first"* — they were older than the tracking routine's 14-day window. `--registrera` registers them, and that costs 17TRACK quota (bought per parcel in the 17TRACK panel, roughly 87/day on the example plan). Budget for it before a dispute push; it is a real operational step, not a bug.

**Manual check, any store, no quota:** Shopify admin → Orders → the order → Fulfillment → copy the tracking number → paste it at `https://t.17track.net/en#nums=<number>` in a browser. Brand-independent, safe, no side effects.

**Stores with a tracking page (`{{TRACKING_PAGE}}`):** the hourly routine already writes every scan into the order's fulfillment timeline in Shopify admin, and `{{TRACKING_PAGE}}` shows the whole chain when you paste the carrier number or the store parcel number. That is the zero-click read for anything shipped in the last 60 days — and it is what the customer is looking at, so quote its wording. Older parcels: 17TRACK as above.

**Do not investigate with `sparning/`.** That runner is wired to **one store only** and it *writes* to Shopify: it creates fulfillment events, and those trigger "out for delivery" and "delivered" emails to customers about orders from months ago. If you must run it, run `node sparning/kor.mjs --torr` (reads, writes nothing) — never a wide `--dagar` window sharp.

**Where the dispute itself lives:** Shopify admin → **Orders** → search the order number → open it; the dispute banner and the respond/accept action are on the order page. ⚠️ Our own tools print three different navigation paths for the dispute *list* ("Orders → Disputes", "Orders → filter Disputed", "Settings → Payments → Disputes"). VERIFY which one your admin version shows, then write the right one here once and delete this warning.

---

## 8. What this SOP does not claim — VERIFY IN SHOPIFY ADMIN

- **Chargeback fee amount:** we have not documented it. VERIFY IN SHOPIFY ADMIN: Settings → Payments → Shopify Payments → *View payouts*, or the dispute's own transaction line, to see what one chargeback actually costs this store. Until someone reads it, do not put a number in any SOP or email.
- **Network dispute-rate limits (Visa / Mastercard):** {{DISPUTE_RATE_YELLOW}} % and {{DISPUTE_RATE_RED}} % are **our own thresholds** in `trosklar`, set deliberately below the figures commonly cited for the networks. **We have not read the rulebooks.** VERIFY IN SHOPIFY ADMIN: any dispute-monitoring notice Shopify sends the store, before treating any percentage as a hard limit.
- **Evidence deadline:** 7–21 days is a commonly cited range, not something we have verified on a Shopify page. The exact date is on the dispute itself (`evidence_due_by`, shown as "Evidence due by"). **Read the date, never the rule of thumb.**
- **Refunding during an inquiry vs after a chargeback:** see section 5. VERIFY on a live dispute in this store's admin and write down what it actually offers.
- **Whether an unanswered inquiry *always* becomes a chargeback:** not confirmed in any documentation we have read. What is measured on our own data (one store, 2026-09-20, 50 disputes): **29 of 29 decided inquiries won; chargebacks 1 won of 4; every loss that store ever had was a chargeback**, and three inquiries that went unanswered (#4914, #5044, #4706) came back as chargebacks. Treat every inquiry as the last cheap moment, whatever the mechanism.
- **Bank review time:** several different ranges are in circulation. Never promise a customer, or yourself, a date.
- **{{REFUND_DEADLINE_DAYS}} as law:** 14 days is the EU/EEA distance-selling figure the example stores run on. For a store selling into another market, 🔑 OWNER checks that market's consumer law before the number is quoted to a customer. Our operational rule — same day in writing, money out within {{REFUND_DEADLINE_DAYS}} days — stands regardless of the law.

---

## Definition of done — a green week

- [ ] Weekly report read; all seven numbers in section 1 noted.
- [ ] `risk.poang` level recorded **and compared with last week** — rising matters more than the absolute number.
- [ ] Ranking checked, including the **skipped** stores; every missing `KUNDTJANST_MAIL_PASS_<ID>` named (`node kundtjanst/run.mjs --kolla`). 🔑 OWNER
- [ ] Zero open disputes without a named VA and a deadline in the calendar.
- [ ] Every open **chargeback** decided FIGHT or REFUND with `tvistfakta.mjs`, and submitted or accepted before its `evidence_due_by`.
- [ ] Every open **inquiry** answered — it is the cheap moment, and unanswered it escalates.
- [ ] Unanswered > {{UNANSWERED_HOURS}}h is zero, or has a named plan with a date. (Median response time does **not** substitute for this.)
- [ ] Every parcel stalled past {{STALL_ALERT_DAYS}} days has had template A sent — by us, first.
- [ ] Every refund promised last week is actually issued — checked on the order, not in the email.
- [ ] Reviews scanned for 1–2 stars with no ticket behind them; template D sent to each.
- [ ] One root-cause item picked, with a deadline. 🔑 OWNER
- [ ] Any recurring category (top-3 in 3 of 4 weeks) escalated to product/logistics, not to support. 🔑 OWNER

<!--
REVIEW: fixed 25 defects.

INVENTED / UNSUPPORTED RULES (8)
1. "A missed deadline is a guaranteed loss" (decision table #7) and "a dispute is still lost on a deadline" (§3) — false for inquiries. kundtjanst/tvistkoll.mjs carries an explicit note never to write this again: measured 2026-09-20, 29 of 29 decided inquiries won; an unanswered inquiry ESCALATES into a chargeback (#4914, #5044, #4706), it is not lost on the spot. Rewritten as an explicit inquiry-vs-chargeback split.
2. "comfortably green by any network threshold" — stated a card-network threshold as fact. Now: below our own configured red threshold.
3. Hardcoded 0.5 % / 0.9 % in the procedure — replaced by {{DISPUTE_RATE_YELLOW}}/{{DISPUTE_RATE_RED}} with the defaults shown as ours, not the rulebook's.
4. "Process within 14 days by law" presented as a universal rule — kept as a quotation of the report's own string, with the EU/EEA scope named and a VERIFY for other markets; the operational rule now runs on {{REFUND_DEADLINE_DAYS}}.
5. "{{DELIVERY_PROMISE_DAYS}} + 7 days" magic arithmetic — now the named key {{LATE_ALERT_DAYS}}, marked as our own choice.
6. "A 1–2 star review with no ticket is a dispute in about a week" — invented timing, deleted; replaced with the one measured case (#4706).
7. "Shopify states that if you issue a full refund, the cardholder cannot initiate a chargeback" / "refunding is no longer possible" — overstated as documentation. Now a VERIFY IN SHOPIFY ADMIN item on a live dispute, with the operational guidance kept.
8. "Shopify documents 7 to 21 days" — softened to commonly cited, with the instruction to read evidence_due_by.

NOT PORTABLE (4)
9. 48h / 24h / 30 days / 5 days hardcoded in the procedure — now {{UNANSWERED_HOURS}}, {{FIRST_REPLY_TARGET_HOURS}}, {{WINDOW_DAYS}}, {{UNFULFILLED_DAYS}}, each tied to its trosklar key.
10. {{STORE_ID}} used throughout but never defined — added, with the command that lists the ids.
11. {{BILLING_DESCRIPTOR}} used in template C but absent from the config block, although tvister.billing_descriptor exists — added.
12. "1262.20 {{CURRENCY}}" mixed a real SEK figure with a placeholder — now marked as the example store's currency.

NOT ACTIONABLE (6)
13. Template fields ({{CUSTOMER_FIRST_NAME}}, {{TRACKING_LINK}}, {{LAST_SCAN_DATE}}, {{AMOUNT}}, {{DATE}}, {{DATE_PLUS_N}}, {{AGENT_NAME}}) were undefined — a per-case field table now says where each is read.
14. The two new YAML keys were named but not written — exact paste-ready YAML block added (and it is four keys, not two, once the magic numbers were removed).
15. §3 step 3 sent the reader to byggAtgardsplan()'s three buckets as if they were in the .md report — verified: the buckets render only on the published page (dashboard.mjs → rapportsida.mjs). The .md/.en.md carry risk.atgarder under "Det här ska VA:n göra, i ordning" / "🔴 ACTION NEEDED". Navigation corrected.
16. "Read your product reviews weekly" had no path — review-app path added, plus template D.
17. §7 lacked the one command that answers "check the tracking first" — kundtjanst/tvistfakta.mjs added with exact usage, plus the 17TRACK registration requirement measured 2026-09-20.
18. The repo prints three different navigation paths to the dispute list — single reliable path (the order page) plus a VERIFY note instead of silently picking one.

NO DECISION / MISSING ACCEPT CASE (3)
19. The file never let anyone reach a fight/accept decision — §0 two-minute triage added, plus a FIGHT/REFUND/ESCALATE table mirroring dom() in tvistfakta.mjs case by case.
20. Decision-table row 1 was malformed (green/escalate/action columns did not line up) — rebuilt.
21. "Audience: you, not the VA" conflicted with the SOP set's requirement that staff act without the owner — roles clarified; owner-only decisions marked 🔑 OWNER.

WRONG ON THE DATA (4)
22. The mailbox numbers were dated 2026-09-20; they are the 2026-W38 run of 2026-09-14 (period 2026-08-15 → 2026-09-14). Dates corrected; the dispute outcomes keep their real date, 2026-09-20.
23. "#5584 came back as a chargeback on 09-10" — not supported. Replaced with what the W38 report shows: open chargeback, evidence due 2026-09-23, filed as credit_not_processed although the real problem was a stalled parcel (a useful VA lesson, now in §0).
24. "#4706 disputed. Twice." — unverifiable. Replaced with the documented escalation path recorded in tvistkoll.mjs.
25. Median first response was presented as a leading indicator with no caveat, while the measured week shows 17.3 h green against 🔴 100/100 and 192 unanswered — the trap is now spelled out, as is the "skipped store is not a green store" trap (7 of 8 stores skipped in ranking 2026-W38).

REMAINING GAPS — need the owner or a live admin session:
- Chargeback fee for these accounts: unknown. Nobody has read a payout line.
- Which dispute-list navigation the current Shopify admin actually shows (three conflicting paths in our own code).
- Whether a refund is still possible once a chargeback is open on this account.
- {{FIGHT_THRESHOLD}} is 0 (= always fight) in every brand file today. Until the owner sets a real amount per store, the "refund small orders" rule never fires.
- The five new tvister: keys are not in kundtjanst/brand-mall.yaml yet; until they are, every store runs on the defaults printed here.
- 7 of 8 stores still have no KUNDTJANST_MAIL_PASS_<ID>, so the cross-store ranking in §3 step 2 cannot do its job yet.
- Refund deadlines outside the EU/EEA are unchecked; the US market in particular is not covered by the 14-day figure.
-->
