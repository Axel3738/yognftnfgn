# SOP: Package delivered to wrong address

## Use this when

A customer says their parcel was delivered to the wrong address, or that the address on the order is wrong. This page works for every store: read the store-specific values from the "Store facts" table, never from memory.

## OVERVIEW

| Field | Value |
|---|---|
| Trigger | Customer reports delivery to the wrong address, or an incorrect address on the order |
| First step | Open the order in Shopify and compare the fulfilment address with the address the customer says is correct |
| Owner approval | Required before promising a replacement, a refund or a free re-delivery |
| Where to look | Shopify order page (fulfilment timeline) → the store's tracking page → carrier portal / 17track.net only as backup |
| Key question | Was the wrong address entered by the customer at checkout, or was it our error? |
| Contact email | Write from the store's support address (Store facts table) |

## Store facts

Every store-specific value — tracking page, parcel number prefix, support address,
delivery promise, return window — is on the page **Store facts**. Take it from there
and never type a store name, a domain or an address into this procedure.


> A store that is not in this table, or has no tracking page yet, still uses the old
> route: the carrier's own portal or 17track.net with the carrier number. Everything
> else in this SOP applies unchanged.

## STEP-BY-STEP INSTRUCTIONS

1. **Check the order in Shopify.** Search by order number or email. Copy the delivery address used for fulfilment and take a screenshot of the checkout address — this is evidence later.
2. **Compare the addresses.** Put the fulfilment address next to the address the customer says is correct. Decide who entered the wrong one: the customer at checkout, or an error on our side.
3. **Check the tracking status.** Read the fulfilment timeline on the Shopify order page — the latest carrier scan is written there every hour. Then open the store's tracking page (Store facts) and paste the carrier number from the fulfilment, or the parcel number the customer quotes (BB-/CS- format). Full look-up procedure: see the page "Tracking page — how to look up any parcel". Keep only this in mind here:
 - "Delivered" on the page means a carrier delivery scan exists. Copy the scan text with city and time (for example "17 sep 23:28 · Paketet är levererat i din brevlåda · Umeå") into the owner summary — that scan is the evidence in a dispute.
 - "We can't find that number": fulfilled less than an hour ago → wait for the next hourly run; shipped more than 60 days ago → use the carrier number on 17track.net; otherwise the number is mistyped.
 - Carrier portals and 17track.net are the backup, not the first step.
4. **If the parcel is not yet delivered:** check with the carrier shown on the tracking page whether an address correction is still possible (⚠️ OWNER: the route per carrier). Ask the customer to check the mailbox, neighbours and any pickup point once it shows "Delivered".
5. **If already delivered to the wrong address:** note the delivery scan (city, time) and go to step 6. If the carrier cannot redirect, tell the owner at once.
6. **Notify the owner.** Send the owner a summary: order ID, correct address, incorrect address, delivery scan text, who appears responsible, and the checkout screenshot.
7. **Send the holding reply** (Reply templates, A) so the customer knows the case is being investigated. Promise nothing.
8. **Wait for the owner's decision.** Possible resolutions, decided by the owner only:
 - Our error → replacement to the correct address at no cost to the customer.
 - Customer error → discuss re-delivery options; a new shipping fee may apply (owner sets the fee).
 - Parcel already returned to sender → follow the SOP "Package Returned to Sender" (Delivery category).
9. **Send the resolution reply** (Reply templates, B or C) after the decision. Do not mention internal discussions, staff mistakes or the supplier.

> ⚠ Never promise a free replacement or a refund before the owner has decided. If the
> customer entered the wrong address, they may be responsible for re-delivery costs.

> ⚠ Never send the raw carrier number (YT…/4PX…) to a customer. Send the store parcel
> number and the link `<tracking page>?nummer=<parcel number>`. Never look up or quote
> another customer's parcel.

**When should it have arrived?** Count the window in Store facts from the shipping email. Tracking can be silent for the first 2–4 days after shipping — that is normal. This is for your own judgment; the customer sees the estimate on the page.

## ESCALATION

- Owner decides every replacement, refund and re-delivery fee.
- Parcel not deliverable and the carrier cannot redirect it → owner immediately.
- No new scan for 7 days, or past 10 business days without delivery → open the carrier's own tracking, then escalate to the owner. Do not say "lost" until the carrier has confirmed non-delivery.
- Customer threatens a chargeback → keep the delivery scan (city + time) and the checkout screenshot in the case; they are the evidence.

## REPLY TEMPLATES

Always reply in the customer's language (translate with DeepL). Swedish text first, English meaning below.

**A. Holding reply (before the owner's decision)**

Hej [NAME], tack för att du hörde av dig. Jag förstår att det är frustrerande. Vi undersöker just nu leveransinformationen och adressuppgifterna och återkommer så snart vi vet mer. Du kan följa paketet här: [TRACKING PAGE]?nummer=[PARCEL NUMBER]. Ditt paketnummer: [PARCEL NUMBER].
English meaning: Thank you for contacting us, I understand the frustration. We are checking the delivery and address details and will get back to you as soon as we know more. You can follow the parcel at the store's tracking page. Your parcel number is …

**B. Our error — replacement approved by owner**

Hej [NAME], vi har gått igenom ärendet och skickar en ny försändelse till [CORRECT ADDRESS] utan kostnad för dig. Du får ett nytt leveransmejl med spårningsknapp när paketet skickats.
English meaning: We have reviewed the case and are sending a new parcel to the correct address at no cost. You will get a new shipping email with a tracking button.

**C. Customer error — re-delivery on owner's terms**

Hej [NAME], adressen som angavs vid beställningen var [INCORRECT ADDRESS]. Paketet visar status "[STATUS]" den [DATE] i [CITY]. Vi kan hjälpa till med [OWNER'S OPTION]. Hör av dig så ordnar vi det.
English meaning: The address given at checkout was …; the parcel shows status … on … in …. We can help with the option the owner approved. Reply and we will arrange it.

## AI PROMPT TEMPLATE

Fill the placeholders from the Store facts table, then paste:

"You are a professional customer-support agent for the online store [STORE NAME]. Write a friendly, professional email in [LANGUAGE: sv/nb/da/fi/en] to a customer who says the parcel was delivered to the wrong address. Use: Order number: [ORDER ID]. Order date: [DATE]. Tracking status (page wording): [STATUS — on its way / with the carrier / out for delivery / delivered]. Tracking link: [TRACKING PAGE]?nummer=[PARCEL NUMBER]. Parcel number: [PARCEL NUMBER]. Sign off from [SUPPORT ADDRESS]. Instructions: acknowledge the customer's frustration; explain that we are reviewing the delivery and address details; say the case has been escalated internally and we will return with more information; note that tracking can update late. Do NOT promise a refund, replacement or new shipment. Do NOT mention internal processes, staff mistakes or a supplier. Never include a carrier tracking number. Calm, empathetic tone, under 120 words, professional closing."

Review the draft before sending. Remove anything that promises an outcome the owner has not approved.