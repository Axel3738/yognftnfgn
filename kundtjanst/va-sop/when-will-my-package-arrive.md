# SOP: When will my package arrive?

**Use this when** a customer asks when their order will arrive, when they can expect delivery, or why the tracking has not moved. Works the same for every store in the Store facts table. Grillkliniken has no tracking page and keeps its old carrier-portal procedure.

## OVERVIEW

| | |
|---|---|
| Trigger | Customer asks when the order will arrive, or says the tracking looks stuck. |
| First step | Ask for the order number (or email address) if it is missing. Open the order in Shopify. |
| Owner approval | Not required for a normal timeframe reply. Required before promising a new delivery date, a refund, a replacement, or saying the parcel is lost. |
| Where to look | 1) The fulfillment timeline on the Shopify order. 2) The store's tracking page (Store facts table). 3) Carrier portals only as backup. |

> The delivery promise is in **Store facts**, counted from the shipping email. Quote it
> only when the order has not shipped yet. Once it has shipped, send the tracking link —
> the page shows the estimated delivery, so repeating it in the email is noise.

## Store facts

Every store-specific value — tracking page, parcel number prefix, support address,
delivery promise, return window — is on the page **Store facts**. Take it from there
and never type a store name, a domain or an address into this procedure.


## What the customer already has

- Three shipping emails (Shipping confirmation, Shipping update, Out for delivery), each with one button **"Spåra paketet" / "Track your parcel"** that opens the store's tracking page with the parcel number filled in. The parcel number is printed under the button.
- The parcel number is a store number, e.g. **BB-3F7A2C1D** or **CS-3F7A2C1D**. The customer never sees the carrier number (YT…, 4PX…). Never send it to them.
- A menu link "Spåra paket" / "Track your parcel" in the header and footer of every live store.
- The page shows five stages: Order received → The parcel is on its way → With the carrier → Out for delivery → Delivered, with city and time per scan. "Collect your parcel" appears only when the parcel is waiting at a pickup point.
- Lookup by order number is impossible on purpose — nobody can look up someone else's parcel. Never quote another customer's parcel.

## STEP-BY-STEP INSTRUCTIONS

### Step 1 – Get the order number

If the customer did not give an order number or email, ask for it. If they only want a general answer, you may reply with the standard promise without looking anything up (template A).

### Step 2 – Read the order in Shopify

1. Open the order in Shopify admin (search by order number or email).
2. Note the ship date (the date of the shipping email).
3. Read the **fulfillment timeline** — the latest carrier scan is written there every hour.
4. Copy the carrier tracking number from the fulfillment (for your own lookup only).

### Step 3 – Look the parcel up on the store's tracking page

Follow the SOP **"Tracking page — how to look up any parcel"** for the full procedure. For this case you need:

1. Open the store's tracking page and paste the carrier number or the parcel number the customer quoted.
2. Copy the store parcel number shown as "Ditt paketnummer" / "Your parcel number" into your reply — never the carrier number.
3. Use the page's own status wording and its "Estimated delivery" window in the reply.
4. Give the customer this link: `<tracking page>?nummer=<parcel number>`, e.g. https://baverbutiken.se/pages/spara?nummer=BB-3F7A2C1D

**If the page says "We can't find that number":**

- Fulfilled less than an hour ago → the page refreshes every hour. Wait for the next run.
- Shipped more than 60 days ago → use the carrier number on 17track.net or the carrier's own site.
- Otherwise → the number is mistyped. Check it against the fulfillment.

Carrier portals (17track.net, or the carrier named on the fulfillment) are the **backup only** — for parcels older than 60 days, when the page cannot find the number, or when you are investigating a stuck parcel (Escalation).

### Step 4 – Pick the situation

Count **calendar days since the ship date**.

- **Not shipped yet:** say the parcel will ship soon and that they will get a shipping email with a "Track your parcel" button. Do not promise a ship date.
- **Shipped 0–4 days ago, no scans:** normal. The parcel is on its way to the flight. Send the standard promise and the tracking link (template B).
- **Shipped, scans moving, within 14 days:** confirm the page status, give the estimated delivery window and the link (template B).
- **Out for delivery / ready for pickup / delivered on the page:** tell the customer exactly what the page says. If "Delivered" but not received: ask them to check the mailbox, the pickup point in the page, and neighbours before anything else.
- **No new scan for 7 days after the first scans, or past day 14 without delivery:** go to Escalation before replying (template C).

### Step 5 – Reply

1. Reply in the **customer's language** (the store's language, or the language they wrote in). Draft in Swedish or English and translate with DeepL.
2. Always include the store parcel number and the page link. Never a carrier link or carrier number.
3. Review the whole reply before sending.

## ESCALATION

> **Past day 14 without delivery, or 7 days without a new scan:** open the carrier's own tracking (backup portals) to see if it shows more than the page. Then escalate per the store's escalation rule (⚠️ OWNER: the contact). Tell the customer you are investigating and will come back — do not invent a date.

- Do not tell the customer the parcel is lost until the carrier has confirmed non-delivery.
- Refunds, replacements, new delivery dates and "lost" statements require **owner approval** — always.
- If the page has stopped updating for all recent parcels (many customers at once), tell the owner: the hourly routine may have run out of tracking quota.

## REPLY TEMPLATES

Swedish text first, English meaning after. Translate to nb/da/fi/en with DeepL when the customer's language differs.

**A – General promise, no order number**

Svenska: "Hej! När det skickas får du ett mejl med knappen Spåra paketet och ditt paketnummer, så kan du följa paketet hela vägen. Hör av dig om du vill att jag kollar din order — skicka ordernumret."

English: "Hi! When it ships you get an email with the Track your parcel button and your parcel number, so you can follow it all the way. Send me your order number if you want me to check."

**B – Shipped, within the window**

Svenska: "Hej! Ditt paket skickades den [DATUM] och är [STATUS FRÅN SIDAN]. Beräknad leverans är [FÖNSTER FRÅN SIDAN]. Ditt paketnummer är [BB-XXXXXXXX] och du kan följa det här: [LÄNK]. De första dagarna efter att paketet skickats kan spårningen vara tyst — det är normalt."

English: "Hi! Your parcel shipped on [DATE] and is [STATUS FROM PAGE]. Estimated delivery is [WINDOW FROM PAGE]. Your parcel number is [BB-XXXXXXXX] and you can follow it here: [LINK]. Tracking can be silent the first few days after shipping — that is normal."

**C – Past the window, investigating**

Svenska: "Hej! Jag beklagar att paketet dröjer. Jag har kontaktat fraktbolaget och återkommer så snart jag har ett besked. Ditt paketnummer är [BB-XXXXXXXX] och du ser senaste läget här: [LÄNK]."

English: "Hi! I am sorry the parcel is taking longer. I have contacted the carrier and will get back to you as soon as I have news. Your parcel number is [BB-XXXXXXXX] and the latest status is here: [LINK]."

Reusable wording: Ditt paketnummer / Your parcel number · Paketet är på väg / The parcel is on its way · Hos fraktbolaget / With the carrier · Ute för leverans / Out for delivery · Paketet finns att hämta / The parcel is ready for pickup · Levererat / Delivered · Beräknad leverans / Estimated delivery · Vi hittar inte det numret / We can't find that number.

## AI PROMPT TEMPLATE

"Draft a friendly email in [LANGUAGE] to a customer asking when order [ORDER ID] will arrive. It shipped on [SHIP DATE]; the store tracking page says [STATUS] and shows the estimated delivery. Do not repeat a delivery date or window in the email. Include the parcel number [BB-XXXXXXXX] and the link [TRACKING PAGE]?nummer=[BB-XXXXXXXX]. Do not include any carrier name or carrier number. Mention that tracking can be silent the first few days after shipping. Do not promise a refund, replacement or a new date. Reassuring tone, under 120 words."

For a delayed order add: "Apologise for the delay, say we have contacted the carrier and will get back with an update. Empathetic and professional tone."