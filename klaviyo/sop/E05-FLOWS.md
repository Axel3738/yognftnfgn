# E05 — The six flows

Flows send themselves. That is why they earn the most, and why a broken one does
damage every hour until someone notices. Claude builds them; **only the owner
switches them on.** You check them every week.

---

## 1. The six

Names start with `FLOW_`. All of them only send to people who are *subscribed*.

| Flow | Starts when | What it does | Stops when |
|---|---|---|---|
| **Welcome** | Someone joins the newsletter list | Introduces the store with the products people actually buy | They order |
| **Abandoned checkout** | Someone starts the checkout and does not finish | Brings them back to their own cart, then answers the most common objection for that product | They order |
| **Browse abandonment** | Someone views a product and leaves | Shows that product again with the facts that sell it | They start a checkout or order |
| **Post-purchase** | An order is placed | Starts only after the parcel should have arrived (about 20 days), then suggests the next product in the same hobby (boat, caravan, garden) | They order again |
| **Win-back** | A customer has not ordered for a long time | One or two reminders with a real reason | They order |
| **Sunset** | A subscriber has had 5+ emails and not opened or clicked in 180 days | Asks if they still want our emails (at most 3) | They click, or they are marked unengaged and get nothing more |

The store's own shipping emails already carry the `TACKIGEN` offer, which is why
post-purchase waits until after delivery.

## 2. How a flow goes live (the owner's click, not yours)

Each email in a flow has a status: **Draft** (off) → **Manual** (waits for someone
to press send, per email) → **Live** (sends by itself).

1. Claude uploads the flow with every email in **Draft**.
2. You run **E03** on every email in it (Flows → the flow → click the email →
   **Preview and test** → send test to yourself).
3. The owner reads it and says OK in writing.
4. The owner sets the emails to **Manual** for the first days to see what it would
   send, then to **Live**.
5. ⚠️ **Abandoned checkout:** the day that flow goes Live, Shopify's own
   abandoned checkout email must be switched **off**, or customers get two emails.
   That is the owner's click in Shopify admin: **Settings → Notifications →
   Abandoned checkout** (if it has moved: **Marketing → Automations**). Check with
   the owner that it was done, and write it in your weekly post.

You **never** change a status to Manual or Live, and never turn one off, unless
the owner tells you to in writing (exception: an alarm, see E06).

## 3. Weekly check (Monday, 10 minutes)

For each flow: **Flows** → the flow → **Show analytics** → **Last 30 days**, then
the same for **Last 7 days**.

1. **Status**: every email has the status the owner set. Something Live that
   should not be, or Draft that should be Live: escalate.
2. **It is sending**: recipients in the last 7 days is not zero on a Live flow.
   Abandoned checkout with zero for a week while the store has orders = broken.
3. **Unsubscribe above 1 % or spam above 0.3 %** on any flow email: alarm (E06).
4. **Placed orders and revenue per recipient** per email: write them in the post.
   Under 3 orders in 30 days = too early, say so.
5. **Links**: once a month, send each flow email to yourself and click every link
   (E03 lines 5–8). Products get renamed and prices change.

Post in the escalation channel:

```
Flows <date>: welcome <recipients 7d> / <orders 30d> · checkout … · browse … ·
post-purchase … · win-back … · sunset …  | Alarms: none / <which>
```

## Definition of done

- [ ] No flow email switched to Manual or Live by you
- [ ] Every flow email passed E03 before the owner switched it on
- [ ] Shopify's abandoned checkout email confirmed off the day that flow went Live
- [ ] Weekly check done: status, sending, alarms, orders per email
- [ ] Weekly post in the escalation channel
