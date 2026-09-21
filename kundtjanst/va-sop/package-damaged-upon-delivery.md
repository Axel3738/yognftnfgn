# SOP: Package damaged upon delivery

## Use this when

A customer writes to the store's support address saying the package or the product arrived damaged. This page works for every store — the only per-store values are in the "Store facts" table.

> Never promise a replacement or a refund before the photos are in AND the owner has decided. Your first reply only asks for photos.

## OVERVIEW

| | |
|---|---|
| Trigger | Customer reports a damaged package or product |
| First step | Reply in the customer's language and ask for three photos |
| Owner approval | Required before any replacement, refund or partial refund |
| Where to look | The order in Shopify admin (fulfillment timeline) and the store's tracking page |

## Store facts

Every store-specific value — tracking page, parcel number prefix, support address,
delivery promise, return window — is on the page **Store facts**. Take it from there
and never type a store name, a domain or an address into this procedure.


## STEP-BY-STEP INSTRUCTIONS

### Step 1 – Ask for photos

1. Reply in the customer's language (write in English, translate with DeepL, or use the AI prompt below). Use template A.
2. Ask for three photos: the damaged item, the outside of the packaging, and the shipping label on the package.
3. Do not offer any solution yet.
4. Photos are sufficient when all three are there and the damage is clearly visible (not blurred, not cropped). If one is missing or unclear, ask once more for exactly that photo.
5. If the customer cannot or will not send photos, tell them politely that we need the photos to open a case with the carrier, and pass the case to the owner as "no photos" — the owner decides.

### Step 2 – Check the order in Shopify

1. Open the order in Shopify admin (search by order number or the customer's email).
2. Confirm order ID, order date, product ordered and fulfillment date.
3. Read the **fulfillment timeline** on the order page. The carrier scans are written there automatically by the hourly tracking routine. Confirm that the parcel is actually marked **Delivered** and note the delivery date and time — this is the evidence that the parcel was in transit until that moment.
4. Read the shipping origin from the fulfillment. All current orders ship from the warehouse abroad; only mention another origin if the order itself shows it.
5. Need the whole scan chain? Open the store's tracking page and paste the carrier number from the fulfillment. Full look-up procedure: see the page "Tracking page — how to look up any parcel".
6. If you quote a number to the customer, use the **store parcel number** (BB-… / CS-…) shown on the tracking page and the link to the page — never the raw carrier number (YT…, 4PX…).
7. Carrier portals (17track.net, or the carrier named on the fulfillment) are the backup only, when the store page shows nothing.

### Step 3 – Assess the damage

Look at the photos and decide which of the two it is:

- **Packaging damage (transit):** the outer packaging is crushed, torn, wet or opened, and the damage on the product matches it.
- **Product defect:** the packaging is intact but the product is broken, faulty or incomplete.

Write your assessment in one line. You do not decide the resolution — the owner does.

### Step 4 – Notify the owner

Send the owner one message with:

- Order ID and order date
- Store and the delivery date from the fulfillment timeline
- The customer's description of the damage
- The photos received
- Your assessment: packaging damage vs product defect

Wait for the owner's decision before replying with any resolution. Maximum waiting time before you nudge the owner: — ask the owner once and write the answer into Store facts. Keep the photos on the order (Shopify order note or timeline comment) — they are the evidence if the customer later opens a chargeback.

### Step 5 – Carry out the owner's decision and reply

The owner chooses one of:

- **Replacement:** create a new order with the same product at 0 cost (duplicate the order in Shopify, mark it as replacement). It ships like any order: the customer gets a new shipping email with its own parcel number, and the delivery promise is **7–14 calendar days after it has shipped**. Say exactly that, and nothing more precise.
- **Full refund:** refund in Shopify (order → Refund) to the original payment method. Tell the customer that how quickly it appears depends on their bank — never give a number of days.
- **Partial refund:** only if the product is partially usable and the customer agrees; refund the agreed amount in Shopify.

Then reply with template B in the customer's language, review the text before sending, and note the outcome on the order.

## ESCALATION

- Owner approval is always required for replacement, refund, partial refund and for any statement that the carrier is at fault.
- Packaging damage that looks like transit damage: after the owner's decision, report the case to the carrier for an investigation using the carrier number (internal use only). Do this in parallel with the resolution — the customer never waits for the carrier.
- The customer disputes the resolution or threatens a chargeback: forward to the owner the same day with the photos and the delivery scan.
- Return window and statutory withdrawal terms for a damaged item: — ask the owner once and write the answer into Store facts — follow the store's published policy.

## REPLY TEMPLATES

Write the reply in the customer's language. The Swedish text is given with its English meaning; translate with DeepL for other markets.

**Template A – Ask for photos**

Swedish: "Hej! Tack för att du hörde av dig, och vad tråkigt att paketet kom fram skadat. För att vi ska kunna hjälpa dig så snabbt som möjligt: kan du skicka tre bilder – en på den skadade varan, en på emballagets utsida och en på fraktetiketten? Så snart vi har bilderna undersöker vi saken och återkommer med en lösning."

English meaning: "Hi! Thank you for getting in touch, and we are sorry the parcel arrived damaged. So we can help you as quickly as possible: could you send three photos – one of the damaged item, one of the outside of the packaging and one of the shipping label? As soon as we have the photos we will look into it and come back with a solution."

**Template B – Confirm the resolution (replacement)**

Swedish: "Hej igen! Tack för bilderna. Vi skickar en ny vara till dig utan kostnad. Du får ett nytt leveransmejl med ett eget paketnummer så snart den har skickats, och beräknad leverans är 7–14 dagar efter det. Du kan följa paketet på [store tracking page]."

English meaning: "Hi again! Thank you for the photos. We are sending you a new item at no cost. You will get a new shipping email with its own parcel number as soon as it has shipped, and estimated delivery is 7–14 days after that. You can follow the parcel on [store tracking page]."

For a refund, replace the middle sentences with: "Vi återbetalar hela beloppet till ditt ursprungliga betalsätt. Hur snabbt det syns beror på din bank." / "We are refunding the full amount to your original payment method. How quickly it appears depends on your bank."

## AI PROMPT TEMPLATE

Use Claude with this prompt. Replace the language before sending.

"Draft a short, friendly email in [CUSTOMER LANGUAGE] to a customer who says their order arrived damaged. Ask them to send us: 1) a photo of the damaged item, 2) a photo of the packaging, and 3) a photo of the shipping label. Tell them we will investigate and resolve this as quickly as possible. Do not offer a refund or replacement yet. Under 100 words."

For the resolution reply: "Draft a short, friendly email in [CUSTOMER LANGUAGE] confirming that we will [send a replacement at no cost / refund the full amount to the original payment method]. If replacement: say a new shipping email with a parcel number follows when it ships and delivery is 7–14 calendar days after that. Under 100 words."