# 60 — ESCALATION: when to ask the owner, and how

You do not escalate to get permission. You escalate when a dispute needs a
decision that is **not yours to make** — money above your limit, a legal
question, or a case that is broken outside customer service.

Everything else in this folder you decide and do, today, alone.

---

## 1. The decision table — read this, then stop reading

| Situation | Who decides |
|---|---|
| Any FIGHT: building evidence and submitting it in Shopify | **You.** Never ask first |
| Refunding an **inquiry** at or below {{REFUND_APPROVAL_LIMIT}} {{CURRENCY}} | **You** |
| Accepting a **chargeback** at or below {{REFUND_APPROVAL_LIMIT}} {{CURRENCY}} | **You** |
| Sending a replacement worth up to {{REPLACEMENT_LIMIT}} {{CURRENCY}} | **You** |
| Emailing the customer, sending {{RETURN_ADDRESS}}, answering questions | **You** |
| Refund or accept **above** {{REFUND_APPROVAL_LIMIT}} {{CURRENCY}} | **ESCALATE** to {{OWNER_CONTACT}} |
| The order is in **no store's** admin — we cannot tell which brand it is | **ESCALATE** |
| The order has **no tracking number at all** | **ESCALATE** — fulfilment is broken, not a dispute problem |
| Reason code `subscription_canceled` on a one-off physical order | **ESCALATE** |
| `duplicate` and you cannot tell within 10 minutes whether it is one charge or two | **ESCALATE** |
| A legal question: when the return window starts, statutory withdrawal, consumer law | **ESCALATE** — never answer it from memory |
| The customer threatens legal action, a public campaign, or names a regulator | **ESCALATE** the same hour |
| The tool says one thing and the reason file says another | **ESCALATE**, writing down both |
| The same customer disputes a second time, or several disputes arrive the same day | **ESCALATE** — that is a pattern, not a case |

**If {{REFUND_APPROVAL_LIMIT}} is 0, there is no money limit: you decide the
whole queue yourself.** A 0 in the config is not "ask about everything" — it is
the opposite. Read the config, do not assume.

---

## 2. The rule that beats every row above

> **A DEADLINE NEVER WAITS FOR AN ANSWER.**
> If evidence is due within 48 hours and you have not heard back, **submit the
> standard evidence pack first** (40-EVIDENCE-PACK.md), then escalate. A
> submitted pack can be argued about afterwards. A missed deadline cannot be
> undone, and the money is simply gone.

The same in the other direction: **never accept a chargeback or issue a refund
above your limit just because nobody answered.** Submitting evidence is
reversible in practice; giving money away is not. When in doubt and out of time:
submit, then escalate.

---

## 3. How to escalate — one message, this shape

Post it in Discord **{{ESCALATION_CHANNEL}}** and tag {{OWNER_CONTACT}}. Not
email, not DM: the channel, so the next VA can read what was decided.

```
ESCALATION — #{{ORDER_NUMBER}} — {{AMOUNT}} {{CURRENCY}}
Type: chargeback | inquiry      Reason: {{REASON_CODE}}
Due: {{EVIDENCE_DUE}} ({{DAYS_LEFT}} days left)
Facts: delivered {{DELIVERY_DATE}} ({{CARRIER}} {{TRACKING_NUMBER}}) | no scan | no tracking number
Refunds on the order: none | {{REFUND_AMOUNT}} on {{REFUND_DATE}}
Contact history: none | customer wrote {{CONTACT_DATE}}, we replied {{CS_EMAIL_DATE}}
What I would do: FIGHT / REFUND / ACCEPT — and why, in one sentence
What I need from you: the one question, answerable with yes or no
If I hear nothing by <date/time>: I will <what you will do anyway>
```

Rules for that message:

1. **Mask the customer.** `ka***@gmail.com`, first name only, no full address, no
   card number beyond {{CARD_LAST4}}. Same as every other post.
2. **One question, closed.** "Refund 1 262 or fight?" — not "what do you think?"
   An open question costs a day.
3. **Always state your own recommendation.** You have the facts; the owner has
   not read the order. An escalation without a recommendation is half a job.
4. **Always state what you will do if nobody answers.** That line is what keeps
   the deadline safe, and it is what makes it safe for you to act.
5. **Never paste the whole email thread into the channel.** Attach or summarise.

---

## 4. After you escalate

- **Keep working the rest of the queue.** An escalation blocks one dispute, not
  your day.
- **Write the decision sheet anyway** (`beslut/order-<number>.md`): the facts,
  your recommendation, "escalated <date>". When the answer comes, add it. That
  sheet is how the same question stops being a question next time.
- **When the answer arrives, do it the same day** and post the outcome line in
  {{ESCALATION_CHANNEL}}.
- **If the answer is a new rule** ("always refund under X", "the window runs from
  delivery"), say so in the channel and ask for it to be written into the store's
  config block or into this folder. A rule that lives only in a Discord reply is
  lost within a month.

---

## 5. What is never an escalation

Escalating these wastes a day and teaches the owner to stop reading the channel:

| Do not escalate | Do this instead |
|---|---|
| "A dispute came in" | Handle it. The alarm already told everyone |
| "Should I answer this inquiry?" | Yes. Always. Inquiries are the cheap ones to win |
| "The tracking says delivered, should I fight?" | Fight. That is the strongest evidence we have |
| "The parcel has no scan, should I refund?" | Refund. Rule 3 in START-HERE.md |
| "I do not know the Shopify field labels" | Open the dispute and read them, then write them into 40-EVIDENCE-PACK.md |
| "The parcel is not registered with the tracking provider" | Register it (`--registrera`, or paste the number on 17track.net) |
| "The customer is angry" | Answer them. Anger is not a decision |
| "The deadline passed" | Record it, tell the owner in the **weekly** roll-up, not as an escalation |

---

## 6. The weekly roll-up (not an escalation — a report)

Once a week, one post in {{ESCALATION_CHANNEL}}:

- open disputes, and how many are chargebacks
- decided since last week: won / lost / accepted / refunded
- anything that went past its due date, and why
- every case where you had to guess because the config was empty
- the one thing that would have prevented the most disputes this week
  (50-PREVENTION.md)

That last line is the whole point. A dispute handled well costs an hour; a
dispute prevented costs nothing.

---

## 7. Store config

```yaml
tvister:
  agare_kontakt: ""           # {{OWNER_CONTACT}} — name + where to reach them
  godkannande_over: 0         # {{REFUND_APPROVAL_LIMIT}} — 0 = the VA decides everything
  ersattning_over: 0          # {{REPLACEMENT_LIMIT}}
  forsta_svar_timmar: 24      # {{FIRST_REPLY_TARGET_HOURS}}
```

{{ESCALATION_CHANNEL}} comes from `discord.kanal` (default `customer-service`).
A store where `agare_kontakt` is empty has no escalation path at all — fill it
before the VA's first day, or she will guess instead of asking.

---

## Definition of done — per escalation

- [ ] The row in section 1 that applies is the reason you escalated — not a
      feeling
- [ ] One post in {{ESCALATION_CHANNEL}}, in the section 3 shape, customer masked
- [ ] Your own recommendation stated in one sentence
- [ ] "If I hear nothing by …" stated, and honoured
- [ ] Evidence submitted first if the deadline was inside 48 hours
- [ ] Decision sheet written in `beslut/`, updated when the answer came
- [ ] Outcome posted, and any new rule sent back into the config or this folder
