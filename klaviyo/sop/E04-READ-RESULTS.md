# E04 — Read results

**Use this** on day 7 after a campaign was sent, on the Monday report, and in the
weekly flow check. Day 7, not day 1: an order still counts for an email for days
after someone opened or clicked it (the attribution window).

Claude's report (`/klaviyo rapport`) pulls the same numbers. Your job is to read
them the same way, and to flag alarms the same day you see them.

---

## 1. Where the numbers are

**A campaign:**
1. Klaviyo → **Campaigns** → click the sent campaign's name.
2. The overview shows recipients, opens, clicks, **Placed Order** (orders and
   revenue), unsubscribes, spam complaints, bounces.
3. For the A/B test: the **Variations** (A/B test results) tab shows the same per
   subject line.

**A flow:**
1. Klaviyo → **Flows** → the flow → turn on **Show analytics**, period **Last 30 days**.
2. Each email in the flow shows its own numbers.

## 2. Which numbers count

| Number | How to use it |
|---|---|
| **Delivered** | Recipients minus bounces. Needs to be **500 or more** for a verdict |
| **Placed orders** | Needs to be **3 or more** for a verdict |
| **Revenue per recipient** | The fairest single number to compare emails. Never alone |
| **Placed order rate** | Orders ÷ delivered. Compare between subject lines A/B/C |
| **Click rate** | Tells you if people wanted to see more. Not a verdict on its own |
| **Unsubscribe rate** | **Alarm above 1 %** |
| **Spam rate** | **Alarm above 0.3 %** |
| **Bounce rate** | Above 2 %: it is a delivery problem, not a copy result |
| Open rate | **Ignore for verdicts.** Apple opens emails automatically. Only used in warm-up (E06) |

## 3. The gate: too early?

**Fewer than 3 placed orders OR fewer than 500 delivered = "Too early".** No
verdict, no ranking, no "B won". Write *too early* and move on. The same gate
applies to each subject line on its own: with 2 orders on A and 1 on B, nobody
won.

## 4. The labels

Claude's report sets the first five; Claude sets the last two in the lesson. You
can suggest a label, never set one.

| Label | Means |
|---|---|
| `LARM_LEVERANS` | Spam above 0.3 % or unsubscribe above 1 %. Alarm, whatever the orders (E06) |
| `FOR_TIDIGT` | Too early (gate not passed, or before day 7) |
| `BEDOMBAR` | Passed the gate, but nothing of the same kind has yet, so there is nothing to compare with |
| `VINNARE` | Passed the gate, revenue per recipient at or above typical |
| `FORLORARE` | Passed the gate, below typical |
| `BREAKTHROUGH` | A winner at 2× typical or more |
| `INGEN_LEVERANS` | Bounce rate above 2 %, or it did not go out as planned |

"Typical" is the middle value of the same kind (campaigns against campaigns, flow
emails against flow emails) that passed the gate. Until four have, every label is
*preliminary*.

## 5. Alarms — same day

Unsubscribe above 1 % or spam above 0.3 % on any email: go to **E06, section 3**
now. Do not wait for Monday.

## 6. How the lesson is written

Claude writes the lesson in the campaign log. It always has these parts. If you
write a draft, use the same shape.

```
### L-<campaign name> — written <date>, read day <N>
Label: <LABEL> (preliminary if 3–4 orders)
Numbers: delivered · bounce % · click % · placed order rate · orders ·
  revenue · revenue per recipient · unsub % · spam %  — per variant A/B/C
Earning: <kr> after product cost, or "unknown, reason: …"
Planned vs done: did the email go to the planned segment, at the planned
  time, with the planned subject lines? If not, the execution failed, not the idea.
Which reason to buy won: <variant> — only if that variant passed the gate itself
Guess why (marked as a guess): <one or two sentences>
Next emails: 1–3 concrete ones (what changes — one thing at a time)
```

**Example — the numbers are invented, to show the format only:**

```
### L-MAIL_20261006_Takoverdrag_GT_2_engagerade60d_product_present_v1 — written 2026-10-13, read day 7
Label: VINNARE (preliminary: 4 orders)
Numbers: 1 850 delivered · 0.4 % bounce · 2.1 % click · 0.22 % placed order rate ·
  4 orders · 4 516 kr · 2.44 kr/recipient · 0.3 % unsub · 0.0 % spam
  A (gift for him): 3 orders · B (save money): 1 · C (protect the caravan): 0
Earning: unknown, reason: no break-even for this product in products.json
Planned vs done: segment, time and subject lines as planned
Which reason to buy won: none — only A passed 3 orders, and only just
Guess why: the gift angle already carries the best ad; the email reached people
  who had seen that ad
Next emails: repeat the gift angle to the 90-day segment before 19 Oct with the
  last order date as the reason; test a new C aimed at the Father's Day date
```

## Definition of done

- [ ] Read on day 7 or later, never earlier
- [ ] Gate checked for the email and for each variant
- [ ] Unsubscribe and spam rate checked on every email, alarms escalated the same day
- [ ] Open rate not used for any verdict
- [ ] Lesson written in the fixed shape (by Claude, or your draft for Claude)
