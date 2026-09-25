# E07 — Escalate

Some decisions belong to the owner only. Asking costs a few minutes. Guessing can
cost the list, money, or a legal problem.

---

## Always ask the owner — never decide yourself

1. **Discounts and offers.** Any code, any "free", any sale, any new offer. The
   only allowed offer is in E00.
2. **Scheduling or sending** anything without his written OK for that campaign.
3. **Switching a flow on, off, or to Manual** (except the alarm in E06).
4. **Numbers that look wrong**: revenue far above normal, orders on an email that
   went to nobody, a price in Klaviyo that is not on the store, a segment much
   bigger or smaller than last week (for example suddenly 8 000 instead of 6 000).
5. **Any alarm** (E06): unsubscribe above 1 %, spam above 0.3 %, bounce above 2 %.
6. **Customer complaints about our emails**: "stop sending me this", "how did you
   get my address", "I never signed up". Tell support too. The person must stop
   getting emails: they can click unsubscribe, or the owner unsubscribes them.
7. **A segment without the consent condition**, or anyone asking you to add or
   import contacts.
8. **A date or promise you are not sure is true** (last order day, delivery time,
   stock).
9. **Anything the SOPs do not cover.**

## How

Discord, the escalation channel in E00, **in English**, tag the owner.

```
@Axel <what> · <campaign or flow name> · <what you saw, with the number> ·
<what you already did (e.g. "unscheduled", "nothing")> · <the question, with options>
```

Example:

```
@Axel Price mismatch · MAIL_20261006_Takoverdrag_GT_2_…_v1 · email says 1 129 kr,
product page says 1 099 kr · not scheduled · A: Claude rebuilds with today's price,
B: wait for you
```

- One question per post, with options (A / B).
- Numbers exactly as you read them, with where you read them.
- Never guess while you wait. The campaign stays in Draft.

## Definition of done

- [ ] Posted in the escalation channel in English, owner tagged
- [ ] What, where, the number, what you did, the question with options
- [ ] Nothing sent or switched while waiting
