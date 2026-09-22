# SOP: Technical problems in checkout

**Use this when** a customer cannot complete a purchase: the checkout will not load,
the pay button does nothing, the quantity will not change, or the payment failed
part-way. Covers both "technical error during purchase" and "unable to change
quantity" — it is the same page.

**Owner approval:** required for a manual order and for any refund. Troubleshooting
and asking questions need no approval.

---

## 1. Ask four questions, in one reply

> Hej [NAMN]! Tack för att du säger till — det ska såklart gå att handla utan
> strul, och jag hjälper dig att få ordning på det. Fyra korta frågor så hittar jag
> felet snabbare: Vad hände precis innan det stannade? Vilken enhet och webbläsare
> använde du? Fick du något felmeddelande — vad stod det? Och har det dragits några
> pengar?

*Meaning: sorry about the trouble; what happened just before it stopped, which
device and browser, what did the error say, and was any money taken?*

Write in the customer's language (DeepL). **Never write anything about the customer's
ability.** They are telling us our checkout broke.

---

## 2. Give the two fixes that actually work

Send these together with the questions — most cases end here.

1. **Reload in a different browser, or a private/incognito window.** An old cached
   version of the cart is the most common cause.
2. **Quantity:** it changes in the cart, not on the product page. Point them to the
   cart and the plus/minus next to the item.

If they are on a work phone or a corporate network, ask them to try mobile data. Ad
blockers and company firewalls block payment scripts.

---

## 3. Check the admin before you escalate

| Where | Why |
|---|---|
| **Orders** | The order may exist despite the error — then nothing is broken, send the confirmation |
| **Orders → Abandoned checkouts** | Confirms where in the flow it stopped |
| The order's **Payments / Transactions** | Whether anything was captured or only authorised |
| **Orders**, same email, same day | Look for **duplicates** — a retried checkout can create two orders |

A duplicate order or a double charge is never fixed by the VA. Straight to the owner.

---

## 4. Escalate

Send this in the escalation channel (Store facts) the same day:

```
Checkout problem — [STORE]
Customer: [EMAIL]           Amount: [AMOUNT] [CURRENCY]
Device / browser: [...]     Error text: [...]
Admin: no order / abandoned checkout [ID] / duplicate orders [IDs]
Payment: captured / authorised / nothing
```

Tell the customer you have reported it and will come back. Do not give a fix time.

⚠️ **Several customers with the same error on the same day is not a support case —
it is a broken checkout.** Say so in the message; the owner needs to know it is
bleeding orders, not that one person had a bad afternoon.

---

## 5. Definition of done

- [ ] Questions and the two fixes sent in one reply, in the customer's language.
- [ ] Orders, abandoned checkouts, payment record and duplicates checked.
- [ ] Owner messaged if money moved, if there is a duplicate, or if it is still
      broken after the fixes.
- [ ] Customer told what happens next.
- [ ] More than one report of the same error: flagged as a site problem.

**Related:** Money charged but no order visible · Customer disputes charged amount ·
Store facts
