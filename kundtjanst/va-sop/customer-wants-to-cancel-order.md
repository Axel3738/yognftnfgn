# Customer wants to cancel order

## Use this when

A customer writes and asks to cancel an order — before it has shipped, after it has shipped, or after it has been delivered. Also use it when a customer wants to cancel because the parcel "seems late".

## OVERVIEW

| Item | What applies |
|---|---|
| Trigger | Customer asks to cancel an order, before or after delivery. |
| First step | Open the order in Shopify admin and read the fulfillment timeline. |
| Owner approval | Required for EVERY cancellation and EVERY refund. The owner processes them in Shopify. You never cancel or refund yourself. |
| Where to look | 1) Shopify order page, fulfillment timeline. 2) The store's tracking page. 3) Carrier portal — backup only. |
| Time sensitivity | Act immediately. Cancellation is only possible while the order is still unfulfilled. |

> ⚠ Never cancel an order or process a refund yourself. Every cancellation and refund is
> handled by the owner in Shopify. Notify the owner the same day the request comes in.

## Store facts

Use the row for the store the customer bought from. Never write another store's address or link into a reply.

Every store-specific value — tracking page, parcel number prefix, support address,
delivery promise, return window, where the goods ship from — is on the page **Store facts**.
Take it from there and never type a store name, a domain or an address into this procedure.

Per-store policy values you need in this SOP: [fill from Store facts], [fill from Store facts], [fill from Store facts], [fill from Store facts] — read them from the store's own policy page; if unsure, write "— ask the owner once and write the answer into Store facts" and ask. Note: an EU right of withdrawal does not apply to CaraShell's US/GB/CA/AU/NZ markets.

## STEP-BY-STEP INSTRUCTIONS

### Step 1 – Check the order status in Shopify

1. Look up the order immediately (order number or customer email).
2. On the order page, read the **fulfillment timeline**. Carrier scans are written into it every hour by the tracking routine, so what you see there is the real parcel status.
3. Decide which case you have:
 - **Unfulfilled** = not shipped → Step 2.
 - **Fulfilled** (with or without scans yet) = shipped = cannot be cancelled → Step 3.
 - **Delivered** in the timeline → Step 4.
4. If the customer says the parcel "seems late", go to Step 3b before anything else.

### Step 2 – The order has NOT shipped

1. Do not cancel it yourself. Notify the owner the same day with the order ID and the customer's cancellation request (full order or which items, if partial).
2. The owner cancels the order in Shopify and processes the refund. A partial cancellation (one item of several) follows the same route — list the items for the owner.
3. Once the owner confirms, reply to the customer in the customer's language (DeepL): the order is cancelled and the refund goes back to the original payment method within [fill from Store facts] — ask the owner once and write the answer into Store facts. Use Reply template A.
4. If the customer paid with a pay-later option and the invoice needs adjusting, ask the owner — — ask the owner once and write the answer into Store facts how [fill from Store facts] handles it.

### Step 3 – The order HAS already shipped

1. Look up the parcel: follow "Tracking page — how to look up any parcel". In short: copy the carrier number from the fulfillment, paste it into the store's tracking page, and copy the **store parcel number** the page shows (BB-/CS- + 8 characters). Never send the carrier number (YT…, 4PX…) to the customer.
2. Reply with Reply template B: the order is on its way and cannot be cancelled; give the tracking link `<tracking page>?nummer=<parcel number>`, the parcel number, and the status in the page's own wording. Do not repeat the delivery window — the page shows it.
3. Tell the customer they can contact the store's support address once the parcel arrives to start a return, under the store's return policy ([fill from Store facts], [fill from Store facts] where it applies).
4. Carrier portals (17track.net, or the carrier named on the fulfillment) are the backup if the page cannot find the parcel — see the look-up page for when to use them.

### Step 3b – The customer wants to cancel because the parcel seems late

1. Check the tracking page first.
2. No scans for the first 2–4 days after the shipping email is normal — say so. The page shows the estimated delivery; do not repeat it.
3. No new scan for 7 days after the first scans, or past day 14 without delivery → this is NOT a cancellation case. Handle it per the delivery-delay SOP (investigation with the carrier, then escalation). Never tell the customer the parcel is lost before the carrier has confirmed non-delivery.

### Step 4 – The order has been delivered

1. Cancellation is no longer possible. Refer the customer to the return SOP and to the store's support address from Store facts.
2. Any refund or replacement still needs the owner's approval.

### Step 5 – The customer has already contacted [fill from Store facts] or their bank

1. Politely explain that cancellations and refunds are handled directly by the store, not via the payment provider or the bank.
2. Ask them not to open a dispute, and give a concrete date by which they will hear from you. An unanswered payment inquiry escalates to a chargeback, so this must not wait.
3. Notify the owner the same day, with the order ID and the fact that a dispute has been threatened.

### Step 6 – Follow up

1. Confirm with the owner that the refund has been processed before closing the case.
2. If a return is required, refer the customer to the return SOP once the parcel has arrived.

### Exception – stores without a tracking page

Matstrumpor.se and any store not listed in Store facts with a page: the old look-up procedure applies (carrier portal first). Everything else in this SOP is unchanged.

## ESCALATION

- **Owner, same day:** every cancellation, partial cancellation, refund, invoice adjustment, replacement, and any "the parcel is lost" statement.
- **Owner, immediately:** the customer has contacted the bank or payment provider, or threatens a dispute.
- **Delivery-delay SOP:** parcel silent more than 7 days after first scans, or past day 14.
- **Return SOP:** parcel delivered and the customer does not want it.

## REPLY TEMPLATES

Reply in the customer's language. Translate with DeepL from the Swedish text below; the English column is the meaning.

| Template | Swedish (use this) | English meaning |
|---|---|---|
| A – Cancelled | Hej [NAMN]! Din order [ORDERNUMMER] är nu avbruten. Pengarna återbetalas till samma betalsätt som du använde vid köpet inom [ÅTERBETALNINGSTID]. Hör gärna av dig om du undrar något. Vänliga hälsningar, [BUTIKENS NAMN] | Your order is now cancelled. The money goes back to the payment method you used, within [refund time]. Get in touch if you have questions. |
| B – Already shipped | Hej [NAMN]! Tack för ditt mejl. Din order [ORDERNUMMER] har redan skickats, så vi kan tyvärr inte avbryta den nu. Du kan följa paketet här: [SPÅRNINGSLÄNK]. Ditt paketnummer är [PAKETNUMMER]. Just nu visar sidan: [STATUS]. Vill du inte behålla varan kontaktar du oss på [SUPPORTADRESS] när paketet kommit fram, så hjälper vi dig med en retur. Vänliga hälsningar, [BUTIKENS NAMN] | Your order has already shipped, so we cannot cancel it now. Track it here: [link]. Your parcel number is [number]. Current status: [status]. If you do not want to keep it, contact us at [support address] when it arrives and we will help with a return. |
| C – Contacted bank | Hej [NAMN]! Tack för att du hörde av dig. Avbokningar och återbetalningar hanteras direkt av oss, inte via [BETALLEVERANTÖR] eller din bank. Du behöver inte öppna något ärende hos dem – vi löser det här. Du hör från oss senast [DATUM]. Vänliga hälsningar, [BUTIKENS NAMN] | Cancellations and refunds are handled by us, not via [payment provider] or your bank. You do not need to open a case with them — we solve it here. You will hear from us by [date]. |

## AI PROMPT TEMPLATE

**ORDER CANNOT BE CANCELLED (ALREADY SHIPPED)**

"Draft an email in CUSTOMER'S LANGUAGE to a customer who wants to cancel order [ORDER ID], but the order has already shipped. Explain that the order is on its way and cannot be cancelled now. Include the tracking link [TRACKING LINK] and the parcel number [PARCEL NUMBER], the current status [STATUS]. Do not state a delivery date or window — the tracking page shows it. Tell them they can contact us at [SUPPORT ADDRESS] to start a return once the parcel arrives, under our [RETURN WINDOW] return policy. Do not mention any carrier tracking number. Apologetic and professional tone. Under 130 words."

**ORDER CANCELLATION CONFIRMED**

"Draft a short confirmation email in CUSTOMER'S LANGUAGE telling the customer that their order [ORDER ID] has been cancelled. Inform them that a full refund will be issued to their original payment method within [REFUND TIME]. Friendly and reassuring tone. Under 80 words."