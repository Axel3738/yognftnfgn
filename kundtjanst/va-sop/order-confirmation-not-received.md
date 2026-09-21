# SOP: Order confirmation not received

## Use this when

A customer says they placed an order but never received an order confirmation email. This page works for every store in the group — take the store's own tracking page and support address from the page **Store facts**, never from memory.

## OVERVIEW

| Item | What |
|---|---|
| Trigger | Customer says no order confirmation arrived after placing an order |
| First step | Ask for the order number or the checkout email; ask them to check spam/junk |
| Owner approval | Not required for standard cases. Required if a payment issue is identified: no order found but money taken, or payment status unclear |
| Where to look | Shopify admin → Orders (search by order number or email). Parcel status: the order's fulfillment timeline + the store's tracking page |
| Common cause | Confirmation landed in spam/junk, or the email address on the order is misspelled |
| Reply time | Within 1 business day — ask the owner once and write the answer into Store facts |

## Store facts

Every store-specific value — tracking page, parcel number prefix, support address,
delivery promise, return window — is on the page **Store facts**. Take it from there
and never type a store name, a domain or an address into this procedure.


## STEP-BY-STEP INSTRUCTIONS

### Step 1 – Ask for the order number or checkout email

1. If the customer gave neither, ask for the order number or the email address used at checkout.
2. Ask them to check their spam or junk folder — confirmation emails frequently end up there.
3. Note the address the customer writes from; you will compare it with the order in step 2.

### Step 2 – Look up the order in Shopify

1. Shopify admin → Orders → search by order number or customer email. Nothing found? Search by the customer's name as well — the email on the order may be misspelled.
2. Note the payment status: paid / pending / failed.
3. Note whether the order is fulfilled (shipped) or not.
4. Compare the email address on the order with the one the customer writes from. A typo or a different address is a common root cause besides spam.

### Step 3 – Assess the situation

Pick one of three outcomes:

- **A – Order found, payment confirmed:** go to Step 4A.
- **B – Order found, payment status unclear (pending/failed):** notify the owner BEFORE replying. Send nothing to the customer until the owner has answered. Go to Step 4B.
- **C – No order found:** go to Step 4C.

> IMPORTANT: If no order is found but the customer says payment was taken, do not
> dismiss the issue. Notify the owner immediately so a payment investigation can be
> carried out.

### Step 4A – Order found and payment confirmed

1. Resend the confirmation from Shopify: open the order → More actions → Resend order confirmation (⚠️ OWNER: the exact menu name). If the email on the order is misspelled, correct it on the order first, then resend.
2. **If the order is fulfilled:** read the fulfillment timeline on the order page — the latest carrier scan is shown there, so you do not need any carrier portal. Copy the carrier tracking number from the fulfillment, paste it on the store's tracking page, and copy the **store parcel number** (BB-… / CS-…) the page shows. The link to send is `<tracking page>?nummer=<parcel number>`. Never send the raw carrier number (YT…, 4PX…). Full procedure: see the page "Tracking page — how to look up any parcel".
3. **If the order is NOT fulfilled yet:** do not promise a tracking link. Tell the customer the shipping confirmation with the "Track your parcel" button and parcel number will follow when the parcel ships.
4. Draft the reply in the customer's language (prompt template below), review it, send it.

### Step 4B – Order found, payment unclear

1. Notify the owner with order number, customer email and payment status.
2. Wait for the owner's direction, then reply per that direction.

### Step 4C – No order found

1. Reply asking: 1) Has money been taken from their account? 2) Which email address did they use at checkout?
2. Reassure them we are investigating and will get back within the reply time above.
3. If the customer says money was taken: notify the owner immediately (payment investigation). Do not wait for more details.

## ESCALATION

- **Owner approval / notification:** no order found + money taken; payment status unclear; any refund or replacement. Include order number (if any), customer email, what the customer says, and what you found in Shopify.
- **Parcel status questions** that come up in the same thread: use the store's tracking page first. Carrier portals (17track.net, or the carrier named on the fulfillment) are the backup only — for example when the page says "We can't find that number" and the parcel shipped more than 60 days ago. Follow "Tracking page — how to look up any parcel".
- Never tell a customer a parcel is lost; that statement requires the owner's approval and the carrier's confirmation.

## REPLY TEMPLATES

The reply must be in the customer's language — translate with DeepL. Swedish text below, English meaning under each.

**A1 – Order found, paid and shipped**

Hej [NAMN]! Tack för att du hörde av dig. Din order [ORDERNUMMER] är registrerad och betald, och paketet har skickats. Vi har skickat orderbekräftelsen igen – titta gärna i skräpposten om du inte ser den. Ditt paketnummer är [PAKETNUMMER]. Följ paketet här: [SPÅRNINGSLÄNK]. Hör av dig om du undrar något mer!

English meaning: Thanks for reaching out. Your order [ORDER ID] is registered and paid, and the parcel has shipped. We have resent the confirmation — please check spam if you do not see it. Your parcel number is [PARCEL NUMBER]. Track it here: [TRACKING PAGE LINK]. **A2 – Order found and paid, not shipped yet**

Hej [NAMN]! Tack för ditt mejl. Din order [ORDERNUMMER] är registrerad och betald. Vi har skickat orderbekräftelsen igen – kolla gärna skräpposten. När paketet skickas får du ett leveransmejl med knappen "Spåra paketet" och ditt paketnummer. English meaning: Your order [ORDER ID] is registered and paid. We have resent the confirmation — please check spam. When the parcel ships you will get a shipping email with the "Track your parcel" button and your parcel number. **C – No order found**

Hej [NAMN]! Tack för att du hörde av dig. Vi hittar tyvärr ingen order kopplad till dina uppgifter. För att hjälpa dig vidare: 1) Har pengar dragits från ditt konto? 2) Är det här e-postadressen du använde vid beställningen? Vi undersöker saken och återkommer så snart vi vet mer.

English meaning: We cannot find an order linked to your details. 1) Has money been taken from your account? 2) Is this the email you used when ordering? We are looking into it and will get back to you.

## AI PROMPT TEMPLATE

Review every AI draft before sending. Fill every placeholder — a draft with an empty [PARCEL NUMBER] or [TRACKING PAGE LINK] is not sent.

**Order found and confirmed (shipped)**

"Draft a friendly email in [CUSTOMER'S LANGUAGE] confirming that order [ORDER ID] is registered, paid and has shipped. Say we have resent the order confirmation and ask them to check their spam folder. Give the parcel number [PARCEL NUMBER] and the tracking link [TRACKING PAGE LINK]. Do not state a delivery date or window — the tracking page already shows the estimated delivery. Under 120 words."

**Order found and confirmed (not shipped yet)**

"Draft a friendly email in [CUSTOMER'S LANGUAGE] confirming that order [ORDER ID] is registered and paid. Say we have resent the order confirmation and ask them to check spam. Explain that a shipping email with a 'Track your parcel' button and their parcel number will follow when the parcel ships. Do not state a delivery date or window — the tracking page shows it. Do not include any tracking link. Under 120 words."

**Order not found**

"Draft an email in [CUSTOMER'S LANGUAGE] to a customer who says they did not receive an order confirmation. Tell them we cannot find an order linked to their details and ask: 1) Has money been taken from their account? 2) Is this the email address they used when ordering? Reassure them we are looking into it and will get back to them within [REPLY TIME]. Professional and calm tone. Under 100 words."