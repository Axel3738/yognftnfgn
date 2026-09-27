# Customer wants to return a product

**The PDF attached to this row is an older version with an old address.** Where it differs from this page, follow this page and take the return address from Store facts.

Internal use only. Works for every store — the per-store values are in the "Store facts" table, everything else is the same procedure.

## Use this when

A customer writes that they want to send a product back and get their money back, and the product is NOT damaged, faulty or wrong. Damaged / wrong item → use the damaged-or-wrong-item SOP instead; the return-window rule below does not apply to those cases.

## OVERVIEW

| | |
|---|---|
| Trigger | Customer asks to return a product they bought |
| First step | Find the DELIVERY date (not the order date) and check whether the request is within the return window (Store facts) of it |
| Owner approval | Required before you approve any return, and before any refund. Never accept a parcel that was sent back without prior approval |
| Where to look | Shopify order page → fulfillment timeline ("Levererat / Delivered" event); the store's tracking page; the page "Tracking page — how to look up any parcel" |

## Store facts

Every store-specific value — tracking page, parcel number prefix, support address,
delivery promise, return window — is on the page **Store facts**. Take it from there
and never type a store name, a domain or an address into this procedure.


Return address and company name: the return address in **Store facts** — copy it from there, never type it from memory.

## RETURN POLICY SUMMARY

- Return window: the number of days in **Store facts**, counted from the day the customer RECEIVED the item. Shipping takes 5–10 business days, so the delivery date is a materially different date from the order date — always count from delivery.
- Condition: unused, all tags attached, in original packaging.
- Proof: the order in Shopify is the proof. Do not ask the customer for a receipt.
- Exceptions: gift cards, perishables and custom/personalised products. **There is no "sale item" exception** (owner's decision 2026-09-22): every product sells at a compare-at price, so that exception would void the return right for the whole range. ⚠️ The statutory right of withdrawal runs **in addition** to the store's own return window (Store facts) and cannot be signed away. A customer who invokes it is entitled to a full refund and must not be pushed through a partial-refund offer.
- Return shipping: the CUSTOMER pays and arranges the return shipping. We do not send a return label.
- Refund: to the original payment method, once the returned item has arrived and the owner has approved it. Do not promise the customer a number of days — how quickly it appears depends on their bank.
- Partial returns (one item of several) and refund of the original shipping cost: — ask the owner once and write the answer into Store facts — ask the owner in the summary in Step 2.

## STEP-BY-STEP INSTRUCTIONS

### Step 1 – Check eligibility

1. Open the order in Shopify admin (search by order number or the customer's email).
2. Read the fulfillment timeline on the order page. The delivery date is the "Levererat / Delivered" event — the hourly tracking routine writes it there. If the timeline is empty, open the store's tracking page and paste the carrier tracking number from the fulfillment; the page shows the same delivery scan. Full procedure: "Tracking page — how to look up any parcel". Carrier portals (17track.net, or the carrier named on the fulfillment) are the backup only.
3. If the parcel is NOT delivered yet according to the timeline / tracking page, this is not a return case. Route it to the delivery / tracking SOP and reply from there.
4. Count the return window (Store facts) from the delivery date. Is today inside the window?
5. Ask the customer (in their language): reason for return, condition of the item, is it in original packaging, and which items if the order contains several.

### Step 2 – Notify the owner

1. Send the owner a summary: order ID, product(s), delivery date, days since delivery, reason for return, item condition, in/out of the return window, and whether it is a partial return.
2. Wait for the owner's decision: approve / decline / request more information.

> Do not approve the return and do not tell the customer where to send the parcel before
> the owner has approved. Never accept a returned item that was sent without prior
> approval.

### Step 3 – If the return is approved

1. Draft the approval email with the AI prompt template below, in the customer's language (DeepL if needed).
2. The email must contain: the return is approved; pack the item unused in its original packaging; write the order number inside the parcel; the customer pays and arranges the shipping; the return address the return address (Store facts); the refund is made once the parcel has arrived and been inspected — no date is promised.
3. Ask the customer to reply with their return tracking number once sent, and note it in the order's timeline in Shopify (comment on the order: "Return approved [date], return tracking: …").

### Step 4 – If the return is declined

1. Draft the decline email with the AI prompt template below, in the customer's language, quoting the reason the owner gave (outside the return window / item used).
2. Offer to help with any other question. Note "Return declined [date], reason" on the order in Shopify.

### Step 5 – After the item is received back

1. You learn the item has arrived when the owner tells you, or when the customer's return tracking shows delivered — check it if the customer sent it.
2. The owner inspects the item and confirms whether the refund is approved.
3. The owner processes the refund in Shopify. If it has not happened within the deadline in Store facts, remind the owner — do not tell the customer a date.
4. Notify the customer once the refund is processed, and note "Refunded [date]" on the order.

## ESCALATION

- Owner approval is always required for: approving a return, declining a return, any refund, partial refund, refunding shipping costs, and any exception to the policy.
- Customer says the parcel never arrived → not a return; use the delivery / tracking SOP (mailbox, neighbours, pickup point, carrier investigation).
- Customer threatens a chargeback or opens a dispute → tell the owner the same day.
- Anything not covered here → ask the owner before replying.

## REPLY TEMPLATES

Reply in the customer's language (translate with DeepL). Swedish text first, English meaning after.

Asking for details (Step 1):

Swedish: "Hej! Tack för ditt mejl. För att kunna hjälpa dig med returen behöver jag veta: varför du vill returnera, om produkten är oanvänd och om originalförpackningen finns kvar. Jag återkommer så snart jag har fått svar."
English meaning: Thanks for your email. To help with the return I need to know: why you want to return, whether the product is unused, and whether you still have the original packaging. I will get back to you as soon as I have your answer.

Return approved (Step 3):

Swedish: "Hej! Din retur för order [ORDER ID] är godkänd. Packa produkten oanvänd i originalförpackningen, lägg med ordernumret och skicka den till: the return address (Store facts). Du står själv för returfrakten. När vi har tagit emot och kontrollerat paketet återbetalar vi till ditt ursprungliga betalsätt. Hur snabbt det syns beror på din bank."
English meaning: Your return for order [ORDER ID] is approved. Pack the product unused in its original packaging, include the order number and send it to the return address (Store facts). You pay for the return shipping. Once received and checked we refund to your original payment method; how quickly it appears depends on your bank.

Return declined (Step 4):

Swedish: "Hej! Tack för att du hörde av dig. Tyvärr kan vi inte godkänna returen för order [ORDER ID] eftersom [ANLEDNING]. Enligt vår returpolicy gäller [RETURFÖNSTER ENLIGT STORE FACTS] dagar från leveransdatum för oanvända produkter i originalförpackning. Hör gärna av dig om du har andra frågor."
English meaning: Unfortunately we cannot approve the return for order [ORDER ID] because [REASON]. Our return policy allows [RETURN WINDOW FROM STORE FACTS] days from the delivery date for unused products in original packaging. Please contact us with any other questions.

Sign every email with the store's support address from the "Store facts" table.

## AI PROMPT TEMPLATE

Return approved:

"Draft a return approval email in the customer's language ([LANGUAGE]) for order [ORDER ID]. Tell the customer the return is approved. The item must be returned unused, in its original packaging, with the order number inside. The customer pays and arranges the return shipping and sends it to: the return address (Store facts). Once received and inspected, a refund is issued to the original payment method — do not promise a number of days. Friendly, professional, clear. Under 130 words. Sign with the support address (Store facts)."

Return declined:

"Draft a polite email in the customer's language ([LANGUAGE]) declining the return request for order [ORDER ID]. Reason: [REASON — e.g. outside the return window counted from delivery / item appears used]. Reference our return policy ([RETURN WINDOW FROM STORE FACTS] days from delivery, unused, original packaging). Offer to help with any other questions. Under 110 words. Sign with the support address (Store facts)."