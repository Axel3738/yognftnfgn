# Chargeback or dispute via bank or Klarna

## Use this when

Shopify shows a new dispute (inquiry or chargeback), the daily dispute alert in Discord lists an order, or a customer says they have asked their bank or Klarna to reverse a payment.

> The one fact that decides almost every dispute is: **is there a delivery scan?** Since the hourly tracking routine, that scan is written into the order's fulfilment timeline in Shopify. Read it there first — never guess the status.

## OVERVIEW

| Trigger | First step | Owner approval | Where to look |
|---|---|---|---|
| Shopify dispute notification, the daily dispute alert in Discord, or a customer mentioning bank/Klarna | Note reason, amount, order number and the evidence-due date shown in Shopify. Alert the owner the same day. | Required before any response is submitted (fast lane in Step 5). Refunds and "the parcel is lost" statements always need the owner. | Shopify → Orders → the order → fulfilment timeline; the store's tracking page; the support inbox; Klarna merchant portal for Klarna cases |

## Store facts

Every store-specific value — tracking page, parcel number prefix, support address,
delivery promise, return window — is on the page **Store facts**. Take it from there
and never type a store name, a domain or an address into this procedure.


## STEP-BY-STEP INSTRUCTIONS

### Step 1 – Note the dispute details immediately

1. In Shopify, open the dispute and write down: type (inquiry or chargeback), reason, amount, order number, and the **evidence-due date** shown by Shopify. That date is the deadline.
2. Common reasons: item not received / item not as described / unauthorised transaction / credit not processed.
3. Alert the owner the same day. Missing a deadline without telling the owner is a serious error.
4. **Klarna disputes are not in Shopify's dispute view.** They arrive and are answered in Klarna's merchant portal with its own deadline (⚠️ OWNER: login and deadline rules). Never assume a Klarna case will show up in Shopify.

### Step 2 – Inquiry or chargeback?

- **Inquiry**: the money has not been taken yet. Answered inquiries are won almost every time. An unanswered inquiry is not lost on the spot — it **escalates to a chargeback** with a new deadline.
- **Chargeback**: the money is already taken. These are the ones that get lost. Always handle chargebacks first.
- Never refund an order that already has an open chargeback — the money would leave twice.

### Step 3 – Check delivery (mandatory)

1. Open the order in Shopify. Read the fulfilment timeline: latest scan, and whether a delivery scan exists (date and city). Copy the carrier tracking number from the fulfilment.
2. Paste the carrier number on the store's tracking page (table above) to see the full chain with city and time per scan. Full procedure: see the page "Tracking page — how to look up any parcel".
3. Backup only: parcels shipped more than 60 days ago, Matstrumpor and Grillkliniken → 17track.net or the carrier's own portal.
4. If the repo tool is available, run `node kundtjanst/tvistfakta.mjs <order number> --brand <store>` — it prints FIGHT / REFUND / ESCALATE with the evidence list.
5. Decision rule:
  - Delivery scan exists → **FIGHT**.
  - No delivery scan and more than 14 calendar days since shipping → ask the carrier for an investigation, then **REFUND or ESCALATE** to the owner. Do not draft a rebuttal for a case with no delivery proof.
  - No scan and under 14 days → normal transit (the promise is 7–14 calendar days after shipping). Ask the customer to check mailbox, pickup point and neighbours, and to withdraw the dispute.

### Step 4 – Gather evidence

1. From Shopify: order confirmation, fulfilment details, carrier tracking number, the scan lines from the timeline/tracking page (date, event, city), refund history, and all customer communication.
2. Search the store's support inbox for the customer's email **before** writing "the customer never contacted us". Only assert it if the correct inbox is empty.
3. Reason-specific checks: "not as described" or "credit not processed" → the return window counts from the day the parcel was **received**, not the order date (delivery takes 2–4 weeks). Check whether the customer asked for a return inside that window.
4. The store parcel number (BB-/CS-) and page link are for internal notes and customer replies only. **The bank needs the carrier tracking number and raw scan history.**

### Step 5 – Draft and get approval

1. Draft the rebuttal with the AI prompt below (English).
2. Send the owner the draft, the evidence summary and the deadline. Wait for written approval (message or screenshot).
3. **Fast lane (⚠️ OWNER: the amount):** delivery scan present and amount under — ask the owner once and write the answer into Store facts → the VA submits and informs the owner afterwards.

### Step 6 – Submit

1. Submit in Shopify (or the Klarna portal) before the deadline. Confirm to the owner.
2. Accepting is a click, not silence — Shopify sends an auto-response on the due date. Never just let the date pass.

### Step 7 – If the customer contacts support about the dispute

1. Explain politely that disputes and refunds are handled directly by us, not through the bank or Klarna.
2. Ask them to withdraw the dispute and promise a direct, fair resolution.
3. Notify the owner immediately.

## ESCALATION

- Chargeback with no delivery scan, amount above the store's threshold, or any refund or replacement → owner, same day.
- Carrier investigation opened with no answer for 7 days → owner.
- Deadline within 3 days and no approval yet → ping the owner again in the escalation channel; the daily Discord alert lists these cases.

## REPLY TEMPLATES

Reply in the customer's language (DeepL). Never send the raw carrier number to the customer.

**Customer opened a dispute**

Swedish: "Hej! Vi ser att du öppnat ett ärende hos din bank/Klarna för order [ORDER]. Återbetalningar och leveransfrågor hanterar vi direkt med dig — hör av dig till oss så löser vi det snabbt. Om möjligt, dra tillbaka ärendet så kan vi hjälpa dig direkt."

English meaning: "Hi! We see you opened a case with your bank/Klarna for order [ORDER]. We handle refunds and delivery questions directly with you — contact us and we solve it quickly. If possible, withdraw the case so we can help you directly."

**Parcel shows delivered**

Swedish: "Enligt spårningen levererades paketet [DATUM] i [ORT]. Kolla brevlådan, ditt utlämningsställe och eventuella grannar. Du kan följa hela kedjan här: [SPÅRNINGSLÄNK] med ditt paketnummer [PAKETNUMMER]."

English meaning: "According to tracking, the parcel was delivered on [DATE] in [CITY]. Check your mailbox, pickup point and neighbours. You can follow the whole chain here: [TRACKING LINK] with your parcel number [PARCEL NUMBER]."

## AI PROMPT TEMPLATE

"Draft a chargeback rebuttal letter in English for a Shopify dispute. Dispute type: [INQUIRY / CHARGEBACK]. Reason: [REASON]. Order ID: [ORDER ID]. Order date: [DATE]. Shipped: [SHIP DATE]. Carrier tracking number: [CARRIER NUMBER]. Scan history, copied from the Shopify fulfilment timeline / store tracking page: [DATE – EVENT – CITY, one line per scan]. Delivery scan: [YES with date and city / NO]. Refunds issued: [NONE / AMOUNT AND DATE]. The customer [DID / DID NOT] contact our support inbox before filing. Structure: 1) Summary, 2) Timeline of events, 3) Evidence we have, 4) Rebuttal argument. Professional and factual tone. No emotional language."

"Draft a short email in the customer's language to a customer who has opened a dispute via their bank or Klarna regarding order [ORDER ID]. Politely explain that disputes and refunds are handled directly by us. Ask them to withdraw the dispute if possible. Assure them we will resolve this promptly and fairly. Calm tone. Under 110 words."