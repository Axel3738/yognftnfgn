# Package returned to sender without delivery

> Internal use only. This page works for every store: never write one store's domain or support address into a step. The per-store values live in the "Store facts" table below.

## Use this when

Tracking shows the parcel has gone back to the supplier's warehouse abroad without being delivered to the customer. Common causes: incorrect address, customer not home or parcel not collected from the pickup point, customs issues.

## OVERVIEW

| Item | What applies |
|---|---|
| Trigger | The fulfillment timeline in Shopify, or the store's tracking page, shows return scans heading back to the sender (address not found, uncollected, refused) |
| First step | Open the order in Shopify admin and read the fulfillment timeline, then check the store's tracking page |
| Owner approval | Always required before you offer a replacement, offer a refund, or tell the customer the parcel is lost. No amount threshold — ask the owner once and write the answer into Store facts |
| Where to look | Shopify order page → the store's tracking page → carrier's own site or 17track.net (backup only) |

## Store facts

Every store-specific value — tracking page, parcel number prefix, support address,
delivery promise, return window — is on the page **Store facts**. Take it from there
and never type a store name, a domain or an address into this procedure.


## STEP-BY-STEP INSTRUCTIONS

### Step 1 – Confirm the return

1. Open the customer's order in Shopify admin (search by order number or email).
2. Read the fulfillment timeline. The hourly tracking routine writes the latest carrier scan there. Copy the carrier tracking number from the fulfillment.
3. Open the store's tracking page (Store facts) and paste the carrier number, or the parcel number the customer quotes (BB-/CS-…). Confirm the chain turned back towards the sender and note the reason if the scans state one (address not found, uncollected, refused).
4. Backup only: if the page says "We can't find that number" and the order was fulfilled more than 60 days ago, look the carrier number up on the carrier's own site or 17track.net. The full look-up procedure is on the page "Tracking page — how to look up any parcel"; do not repeat it here.
5. Remember: a return to the supplier's warehouse abroad can take weeks to process at the supplier's end.

### Step 2 – Check the order in Shopify

1. Compare the delivery address on the order with the address used in the fulfillment. A mismatch is the most likely explanation.
2. If the reason is "uncollected": the tracking page's earlier "ready for pickup" step confirms the parcel reached a pickup point and waited there.
3. Check if the customer has previously contacted support about this order or an address issue.
4. Check whether the order already has a refund or an open dispute (chargeback). If it does, do not arrange a resend — escalate to the owner first.

### Step 3 – Notify the supplier and the owner

1. Send the supplier via the supplier contact the owner gave you and the owner: order ID, tracking status, reason for return (if known), and the delivery address used. Ask the supplier what happened.
2. Wait for the owner's decision before offering the customer anything.
3. If the owner has not decided within 1 working day — ask the owner once and write the answer into Store facts, send the customer the holding reply (Template 1). The customer must never be left without a reply.
4. If the supplier does not answer within 2 working days — ask the owner once and write the answer into Store facts, tell the owner and keep the customer updated with Template 1.

> IMPORTANT: Do not offer a free replacement or a refund before the owner has approved.

### Step 4 – Contact the customer

1. Inform the customer that their parcel has unfortunately been returned to our supplier. Apologise for the inconvenience.
2. Offer the option the owner approved. Option A: we resend the order to a confirmed address for free. The customer gets a new shipping email with a "Track your parcel" button and a new parcel number; estimated delivery is 7–14 calendar days after that email.
3. Do not offer a refund yourself. If the customer declines the free resend and asks for a refund instead, that is OK — notify the owner, who processes the refund in Shopify.
4. Ask the customer to confirm which option they prefer and to verify the full delivery address if resending.
5. If resending: correct the address in Shopify and arrange the replacement shipment with the supplier.
6. After the replacement ships: check in Shopify that the new fulfillment carries the new tracking number. The hourly routine registers only tracking numbers that are on the fulfillment; without it the customer's page and the automatic delivery notifications stay silent. If the supplier ships outside Shopify, add the tracking number to the fulfillment manually.
7. Never send the raw carrier number (YT…, 4PX…) to the customer. Send the store parcel number and the page link: the store's tracking page followed by ?nummer= and the parcel number.

### Step 5 – Follow up

1. Silence in tracking is normal for the first 2–4 days after shipping.
2. Check the new parcel on the store's tracking page after 7 days of no new scan, and at the latest on day 14 if it is not delivered. Then open the carrier's own tracking and escalate to the owner. Do not tell the customer the parcel is lost until the carrier has confirmed non-delivery.
3. Customs-refused parcels are handled differently from an address error — do not resend to the same address; ask the owner for the procedure — ask the owner once and write the answer into Store facts.

## ESCALATION

- Owner approval is required for: replacement, refund, and any "the parcel is lost" statement.
- Escalate to the owner immediately when: the order already has a refund or a dispute, the supplier is silent past the waiting time, the return reason is customs, or the customer refuses both options.
- Amount thresholds: none in this SOP. If the owner wants one, it must be set per store in the store's own currency — ask the owner once and write the answer into Store facts.

## REPLY TEMPLATES

Reply in the customer's language (translate with DeepL). Swedish text first, English meaning after. Use the store's support address from Store facts as the sender.

**Template 1 – Holding reply (waiting for owner/supplier)**

Swedish: "Hej [NAMN], tack för att du hör av dig. Vi ser att ditt paket för order [ORDERNUMMER] tyvärr har skickats tillbaka till vår leverantör. Vi undersöker just nu vad som hänt och återkommer till dig så snart vi vet mer, senast inom [X] arbetsdagar. Vi ber om ursäkt för besväret."

English meaning: "Hi [NAME], thank you for contacting us. We can see that the parcel for order [ORDER NUMBER] has unfortunately been sent back to our supplier. We are looking into what happened and will get back to you as soon as we know more, within [X] working days at the latest. We apologise for the inconvenience."

**Template 2 – Offer a resend (after owner approval)**

Swedish: "Hej [NAMN], tyvärr har ditt paket för order [ORDERNUMMER] kommit tillbaka till vår leverantör utan att nå fram till dig. Vi ber om ursäkt för besväret. Vi skickar gärna om beställningen kostnadsfritt. Bekräfta din fullständiga leveransadress så skickar vi ett nytt paket. Du får ett nytt leveransmejl med knappen Spåra paketet och ett nytt paketnummer. Beräknad leverans är 7–14 dagar efter det mejlet."

English meaning: "Hi [NAME], unfortunately the parcel for order [ORDER NUMBER] has come back to our supplier without reaching you. We apologise for the inconvenience. We are happy to resend the order free of charge. Please confirm your full delivery address and we will ship a new parcel. You will receive a new shipping email with the Track your parcel button and a new parcel number. Estimated delivery is 7–14 days after that email."

**Template 3 – Resend confirmed**

Swedish: "Hej [NAMN], ditt nya paket är nu skickat. Ditt paketnummer är [PAKETNUMMER] och du kan följa det här: [SPÅRNINGSSIDA]?nummer=[PAKETNUMMER]. Beräknad leverans är 7–14 dagar. De första dagarna kan spårningen vara tyst — det är normalt."

English meaning: "Hi [NAME], your new parcel has now shipped. Your parcel number is [PARCEL NUMBER] and you can follow it here: [TRACKING PAGE]?nummer=[PARCEL NUMBER]. Estimated delivery is 7–14 days. Tracking can be silent for the first days — that is normal."

## AI PROMPT TEMPLATE

"Draft an email in [LANGUAGE: Swedish / Norwegian / Danish / Finnish / English, per the store] to a customer informing them that their order [ORDER ID] has unfortunately been returned to our supplier. Apologise for the inconvenience. Offer that we resend the order free of charge to a confirmed address, and ask them to confirm their full delivery address. Explain that they will receive a new shipping email with a Track your parcel button and a new parcel number, and that estimated delivery is 7–14 calendar days after that email. Do not mention a refund, a warehouse location, or any carrier tracking number. Keep the tone empathetic and professional. Under 150 words."