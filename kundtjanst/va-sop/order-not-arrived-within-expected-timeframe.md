# SOP: Order not arrived within expected timeframe

## Use this when

A customer writes that their order has not arrived, that it is taking too long, or that "the tracking has not moved". This page works for every store: read the store's values from the **Store facts** table and never type another store's domain or address into a reply.

> Do NOT use this page when tracking already says **Delivered** and the customer has not
> received the parcel. That case is the SOP "Package missing after tracking shows
> Delivered".

## OVERVIEW

| | |
|---|---|
| Trigger | Customer says the order has not arrived within the expected time |
| First step | Open the order in Shopify and read the fulfillment timeline (the latest scan is there) |
| Owner approval | Not needed for a status reply. Needed before any refund, replacement, or before telling the customer the parcel is lost |
| Where to look | 1) Shopify order timeline, 2) the store's tracking page the tracking page (Store facts), 3) carrier portal / 17track.net only as backup |
| Delivery promise | 5–10 business days after the shipping email (measured 2026-09-20: median 8, p90 9 business days) |
| Reply language | The customer's language ([the customer's language]) — translate with DeepL |

## Store facts

Every store-specific value — tracking page, parcel number prefix, support address,
delivery promise, return window — is on the page **Store facts**. Take it from there
and never type a store name, a domain or an address into this procedure.


> A store with no tracking page in this table keeps the old carrier-portal procedure
> until its page is built — ask the owner once and write the answer into Store facts.

## STEP-BY-STEP INSTRUCTIONS

### Step 1 – Open the order in Shopify

1. Search by order number or the customer's email address.
2. Note the order date, the fulfillment (shipping) date and the carrier tracking number on the fulfillment.
3. Read the fulfillment timeline. The hourly tracking routine writes the latest carrier scan there ("Out for delivery", "Delivered" …), so the current status is on the order page itself.

### Step 2 – Open the store's tracking page

Full look-up procedure: see the page **"Tracking page — how to look up any parcel"**. For this case you only need:

1. Open the tracking page (Store facts) and paste the carrier tracking number, or the parcel number the customer quotes ([fill from Store facts] + 8 characters, e.g. BB-3F7A2C1D). Spaces and hyphens are ignored.
2. Copy **"Your parcel number"** (Ditt paketnummer) from the page. This is the number you send to the customer — **never the carrier number (YT…, 4PX…)**.
3. Use the page's own five stages as your status words: **Order received / The parcel is on its way / With the carrier / Out for delivery / Delivered**, plus **Ready for pickup** when shown. Never use country names and never say "lost" unless the carrier has confirmed it.
4. Read the **Estimated delivery** window on the page — that is the promise you quote.

**If the page says "We can't find that number":**

- Shipped less than 1 hour ago → the page refreshes new parcels once per hour. This is the most common cause: the customer clicked the email the minute it arrived. Wait for the next run.
- Shipped more than 60 days ago → the page keeps 60 days; use the carrier number on 17track.net or the carrier's own site.
- Otherwise the number is mistyped — check it against the Shopify fulfillment.

### Step 3 – Assess the situation

- **Within 10 business days after the shipping email → normal.** Silence in tracking the first 2–4 days after shipping is also normal (the parcel is on its way to the flight). Reply with the status and the link (Step 5); the page shows Estimated delivery itself.
- **Ready for pickup** → the page shows "Collect your parcel" with the pickup point's number and link. Tell the customer to collect it there.
- **Not shipped yet** → this is a handling question, not a delivery question; tell the customer the shipping email is on its way (⚠️ OWNER: handling time).
- **No new scan for 7 days after the first scans, or past 10 business days without delivery → investigate (Step 4).**
- **Delivered but not received** → switch to the SOP "Package missing after tracking shows Delivered" (ask the customer to check the mailbox, neighbours and any pickup point first).

### Step 4 – Contact the carrier (only if the parcel is late or stuck)

1. As backup, open the carrier's own tracking (the carrier portal or 17track.net) with the carrier number to confirm the last scan.
2. Contact the carrier with the tracking number and order details and request an investigation. Carrier answers take as long as they take — never promise the customer a date for the answer.
3. Send the customer an interim reply the same day (template B) — do not wait for the carrier in silence.

> IMPORTANT: Do not tell the customer the outcome yet and do not promise a refund or
> replacement at this stage.

### Step 5 – Reply to the customer

1. Write in the customer's language ([the customer's language], DeepL).
2. Include: the status in the page's wording, the parcel number and the link `the tracking page (Store facts)?nummer=<parcel number>`.
3. Mention that tracking can look still for a few days while the parcel is moving.
4. Sign with the store's support address the support address (Store facts).
5. Read the whole reply before sending. Never paste a carrier number or a carrier website link.

## ESCALATION

- No resolution 5 business days after the carrier investigation started → notify the owner.
- Refund, replacement, or saying "the parcel is lost" → owner approval first, every time. "Lost" also needs the carrier's written confirmation of non-delivery.
- Customer has already opened a dispute/chargeback → follow the dispute SOP as well.

## REPLY TEMPLATES

Swedish text first, English meaning after. Translate to the customer's language with DeepL if the store is not Swedish.

**A – Within the delivery window**

> Hej! Ditt paket är på väg. Du följer paketet här: the tracking page (Store
> facts)?nummer=BB-XXXXXXXX (ditt paketnummer: BB-XXXXXXXX). Spårningen kan se stilla ut
> de första dagarna, men paketet rör sig. Hör av dig om det inte kommit inom 14 dagar
> från leveransmejlet.

Meaning: Hi! Your parcel is on its way. Track it here: (page link with parcel number). Tracking can look still the first days but the parcel is moving. Contact us if it has not arrived within 14 days of the shipping email.

**B – Late or stuck, investigation started**

> Hej! Tack för att du hörde av dig. Vi ser att paketet inte har uppdaterats som det ska
> och har bett fraktbolaget undersöka det. Vi återkommer så snart vi har svar, normalt
> inom några arbetsdagar. Ditt paketnummer: BB-XXXXXXXX.

Meaning: Hi! Thanks for contacting us. We see the parcel has not updated as it should and have asked the carrier to investigate. We will get back to you as soon as we have an answer, normally within a few business days. Your parcel number: BB-XXXXXXXX.

**C – Ready for pickup**

> Hej! Ditt paket finns att hämta hos ditt utlämningsställe. Du ser vilket ställe och
> hämtnumret här: the tracking page (Store facts)?nummer=BB-XXXXXXXX.

Meaning: Hi! Your parcel is ready for pickup at your pickup point. You can see which point and the pickup number here: (page link with parcel number).

## AI PROMPT TEMPLATE

Use any AI tool, then read the reply fully before sending.

> "A customer says their order [ORDER ID] from [STORE] shipped on [SHIPPING DATE] has
> not arrived. Our tracking page shows: [STATUS IN THE PAGE'S WORDING]. Tracking can be
> silent the first 2–4 days after shipping. Draft a polite reply in [LANGUAGE]
> explaining the current status and that we are following the parcel. Do not promise a
> refund or replacement and do not say the parcel is lost. Include the parcel number
> [PARCEL NUMBER] and the link [TRACKING PAGE]?nummer=[PARCEL NUMBER]. Do not mention
> any carrier name or carrier number, and do not state a delivery date or window — the
> page shows it. Keep it under 120 words."