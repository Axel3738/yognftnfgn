# SOP: Money charged but no order visible

**Use this when** a customer says money left their account but they have no order
confirmation, and no order shows in the admin. Same page for "payment completed but
no order registered" — it is the same case.

**Owner approval:** required before any refund or manually created order. The VA
gathers facts and sends a holding reply; the owner decides.

---

## 1. Send the holding reply first

Do this before you investigate. A customer who sees money gone and hears nothing
opens a dispute, and a dispute costs far more than the order.

> Hej [NAMN]! Tack för att du hör av dig — jag förstår att det känns oroligt när
> pengarna dragits utan orderbekräftelse. Jag kollar upp det åt dig nu. För att
> hitta betalningen behöver jag: mejladressen du använde i kassan, ungefär vilken
> dag och tid du betalade, och beloppet. Har du en skärmbild av dragningen från
> banken hjälper det mig också. Jag återkommer så snart jag vet mer.

*Meaning: sorry, I am checking now; send the email used at checkout, the date and
time, the amount, and a screenshot of the charge if you have one.*

Write in the customer's language (DeepL). **Never** promise a refund, a date, or say
the order exists before you have looked.

---

## 2. What to look for in the admin

Search on the email address, the customer's name **and** the amount — one at a time.
An order the customer never got a confirmation for still exists in the admin.

| Where | What it means if you find it |
|---|---|
| **Orders** | The order went through. The confirmation email is the problem, not the payment — continue with "Order confirmation not received" |
| **Orders → Abandoned checkouts** | Checkout started, never completed. A card **authorisation** may still show on the customer's statement |
| **Orders → Drafts** | Someone started an order by hand. Tell the owner |
| The order's **Payments / Transactions** | Whether the money was captured, authorised only, or voided |

**An authorisation is not a charge.** Banks often show a pending reservation that
disappears by itself. If the customer's screenshot says "reserved", "pending" or
"väntande", say that it usually falls off on its own and that you are still checking.
Do not call it a charge until it is one.

⚠️ **The same VA handles several stores.** Check whether the customer bought from
another store in the group before you conclude that the money vanished. The name on
their bank statement is the billing descriptor, which is not always the store name
they remember.

---

## 3. What to send the owner

Send this the same day, in the escalation channel (Store facts):

```
Money charged, no order — [STORE]
Customer email: [EMAIL]     Amount: [AMOUNT] [CURRENCY]
Paid: [DATE + TIME]         Card last 4 (if given): [####]
Found in admin: no order / abandoned checkout [ID] / draft [ID]
Payment record: captured / authorised only / nothing
Screenshot from the customer: yes / no
```

Then wait. The owner checks the payment provider and decides: create the order,
refund, or fix the checkout.

**If the owner has not answered within 24 hours**, chase once in the same channel
and tell the customer you are still on it. Never let it go silent.

---

## 4. When the owner has decided

| Decision | What you write |
|---|---|
| Order created | Confirm the order number, say the shipping email with the "Track your parcel" button follows when it ships |
| Refund | Confirm the amount refunded and that it goes back to the card used. Do not give a number of days — that depends on their bank |
| Nothing was charged | Explain it was a reservation, not a charge, and that it releases by itself. Offer to place the order again |

---

## 5. Definition of done

- [ ] Holding reply sent the same day, in the customer's language.
- [ ] Orders, abandoned checkouts, drafts and the payment record all checked.
- [ ] Owner messaged with the block in §3, and chased if quiet for 24 hours.
- [ ] Customer told the outcome, with no promised dates.
- [ ] One line in the order notes (or the customer's profile) so the next person sees
      what happened.

**Related:** Order confirmation not received · Technical problems in checkout ·
Customer disputes charged amount · Store facts
