# E06 — List health and deliverability

If inboxes (Gmail, Outlook, Apple) decide we send spam, every email goes to the
spam folder, including the ones customers want. It takes months to fix. This page
keeps us out of that.

---

## 1. The warm-up (first weeks on the new sending domain)

A new sending domain has no reputation. We start with the people most likely to
want our emails and widen step by step. Count from **the first campaign sent from
the new domain**.

| Period | Campaigns may go to | Move on only if |
|---|---|---|
| Week 1–2 | `SEG_uppvarmning_steg1` (active in the last 30 days) | Open rate above 30 % |
| Week 3–4 | `SEG_engagerade_60d` | Open rate stays at 20 % or more |
| From week 5 | `SEG_engagerade_90d`, then wider two weeks at a time | Same |
| Any time | Open rate falls below 20 % | **Back to the 30-day segment** |

This is the **only** place open rate is used. It is inflated by Apple, but the
inboxes' own thresholds are written in it.

How often each group may get a campaign: 30-day active daily, 60-day up to 3 a
week, 90-day up to 2 a week, 120-day weekly, 180-day monthly. We send 3–5 a week
at most anyway.

## 2. Daily check (5 minutes)

1. Klaviyo → **Campaigns** → sent in the last 7 days. For each: unsubscribe rate,
   spam rate, bounce rate.
2. Klaviyo → **Analytics** → **Deliverability** (if your account shows it): spam
   and bounce trend.
3. The always-excluded segment (E00) is on every scheduled campaign.

## 3. Alarm

**Any one email with unsubscribe above 1 %, spam above 0.3 %, or bounce above 2 %.**

1. **Stop the next campaigns**: Campaigns → each **Scheduled** campaign →
   **Unschedule** (it goes back to Draft; nothing is lost).
2. If the alarm is on a **flow** email: set that one email to **Draft**. This is
   the one time you may change a flow status without asking first.
3. Post in the escalation channel with the owner tagged (E07):
   `ALARM <name>: spam 0.4 % (limit 0.3 %) · 2 000 delivered · next campaigns unscheduled`
4. When the owner restarts: campaigns go to the **30-day segment** only, for two
   weeks, then the warm-up ladder again from there.

## 4. Sunset (keeping the list clean)

People who have had 5 or more emails and not opened or clicked in 180 days are in
`SEG_oengagerade_180d`. They get the sunset flow (E05) and are excluded from every
campaign. Sending to people who never react is what tells inboxes we are spam.

## 5. Things you never do

- Never add, import or re-subscribe anyone. Not even "they asked me to".
- Never remove the consent condition or the exclusion to "reach more people".
- Never resend a campaign to people who did not open it.

## Definition of done

- [ ] Campaigns only to the segment the warm-up allows this week
- [ ] Daily check done: unsub, spam, bounce on last 7 days' sends
- [ ] Every alarm: next campaigns unscheduled, flow email to Draft, owner tagged, same day
- [ ] Exclusion segment on every scheduled campaign
