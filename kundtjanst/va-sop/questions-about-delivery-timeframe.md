# Questions about delivery timeframe (SOP 28)

> Internal use only. This page works for every store in the "Store facts" table. Never
> hard-code one store's domain or support address in a reply — take the values from the
> table.

## Use this when

A customer asks how long delivery takes, when the order will arrive, or whether the order is late. If the customer says the parcel is lost or damaged, this SOP only covers the first check — the lost/damaged SOP and the owner take over from there.

## OVERVIEW

| | |
|---|---|
| Trigger | Customer asks about delivery time or expected arrival, with or without an order number |
| First step | Open the order in Shopify admin and read the fulfillment timeline (shipped or not, latest scan) |
| Owner approval | Not needed for a standard timeframe answer. Always needed before saying "lost", or offering a refund or a replacement |
| Where to look | Shopify order page → the store's tracking page (Store facts) → carrier portal only as backup |

## The delivery promise

- Estimated delivery is **5–10 business days after the shipping email**. That is the number the store's own shipping page uses, and it is the only one you write. (Measured 2026-09-20: median 8 business days, p90 10 — the promise matches reality.)
- Handling before shipping is **not** part of the promise — always say "after it has shipped".
- Give the 5–10 business day window by default. Mention a faster timeline only if the Shopify order explicitly shows domestic fulfillment (measured 2026-09-17: all recent orders shipped from the warehouse abroad).
- Tracking can be quiet for the **first 2–4 days after shipping** — that is normal and the shipping email says so. Silence beyond that is not "normal", see ESCALATION.
- **Never write a calendar-day window** ("7–14 days") and never invent your own number. Business days only, and only the one above.
- **Do not repeat the window in a reply that carries the tracking link** — the page shows "Estimated delivery" itself. Quote it only when the order has not shipped yet.

## Store facts

Every store-specific value — tracking page, parcel number prefix, support address,
delivery promise, return window — is on the page **Store facts**. Take it from there
and never type a store name, a domain or an address into this procedure.


> Every store in Store facts has a tracking page except Grillkliniken, which keeps the
> old carrier-portal procedure. For any store not in the table, the old procedure
> applies — ask the owner if unsure.

## STEP-BY-STEP INSTRUCTIONS

1. **Find the order** in Shopify admin (search by order number or email). If the customer gives no order number and cannot be identified, skip to step 5 and give the standard window only.
2. **Read the fulfillment timeline** on the order page. Not fulfilled → the order has not shipped yet; the 5–10 business days start when the shipping email goes out. Fulfilled → copy the carrier tracking number from the fulfillment and note the ship date.
3. **Open the store's tracking page** (Store facts) and paste the carrier number. Read the status in the page's own wording (on its way / with the carrier / out for delivery / ready for pickup / delivered) and copy the **store parcel number** shown as "Your parcel number" (BB-/CS-XXXXXXXX). Full look-up procedure and troubleshooting: see the page "Tracking page — how to look up any parcel".
4. **Check the parcel against the promise:** ship date + 5–10 business days. Note if the last scan is older than 7 days, or if the parcel is past 10 business days without delivery — that is an ESCALATION case, not a timeframe answer.
5. **Write the reply in the customer's language** (the store's language; translate with DeepL and read it through). Include: the current status in the page's words, the parcel number, and the link `the tracking page (Store facts)?nummer=the parcel number`. Remind the customer that the shipping email has one button "Track your parcel" with the parcel number printed under it, and to check spam. **Never paste the carrier number (YT…, 4PX…).**
6. **If the page says "We can't find that number":** the page refreshes new parcels once per hour, so a customer who clicked the email the minute it arrived will not find the parcel yet — this is the most common cause. Ask them to try again in a little while. Second cause: shipped more than 60 days ago (use the carrier number on the carrier's portal). Third cause: a typo.
7. Keep it short and friendly. Review before sending.

## ESCALATION

- **No new scan for 7 days after the first scans, or past 10 business days without delivery:** investigate. Open the carrier's own portal or 17track.net (backup — same scans, the store page is faster). Ask the customer to check the mailbox, neighbours and any pickup-point notice. Then escalate to the owner per the store's escalation rule.
- **Never tell the customer the parcel is lost** until the carrier has confirmed non-delivery.
- **Refund, replacement and "the package is lost"** always require the owner's approval (unchanged rule).
- Page shows "Collect your parcel": the parcel is waiting at a pickup point — tell the customer, with the pickup point's number and link from the page.
- Registration quota at the tracking provider can run out; if many new parcels show "can't find that number" for more than a few hours, tell the owner (⚠️ OWNER: the check).

## REPLY TEMPLATES

The reply must be in the customer's language (DeepL). Swedish text first, English meaning after. Replace the placeholders.

**Template A — order not shipped yet**

Swedish: "Hej! Din order är mottagen och packas just nu. När paketet har skickats får du ett mejl med knappen Spåra paketet och ditt paketnummer. Kolla gärna skräpposten om mejlet inte syns."

English meaning: "Hi! Your order has been received and is being packed. Once the parcel has shipped you get an email with the button Track your parcel and your parcel number. Please check your spam folder if the email does not show up."

**Template B — shipped, on its way**

Swedish: "Hej! Ditt paket skickades den [SHIP DATE] och är på väg. Ditt paketnummer är the parcel number — följ paketet här: the tracking page (Store facts)?nummer=the parcel number. Spårningen kan vara tyst de första 2–4 dagarna, det är normalt."

English meaning: "Hi! Your parcel shipped on [SHIP DATE] and is on its way. Your parcel number is the parcel number — follow it here: (link). Tracking can be quiet for the first 2–4 days, that is normal."

**Template C — number not found yet**

Swedish: "Fick du leveransmejlet nyss? Då är paketet på väg in här — sidan hämtar nya paket varje timme, så prova igen om en liten stund."

English meaning: "Did you just get the shipping email? Then the parcel is on its way in — the page fetches new parcels every hour, so try again in a little while."

Sign every reply with the store's name and support address: the store name (Store facts) | the support address (Store facts).

## AI PROMPT TEMPLATE

"Draft a friendly email in [the customer's language] answering a customer who asks about delivery time for their order from the store name (Store facts). The shipping email has one button 'Track your parcel' with their parcel number the parcel number printed under it — remind them to check spam. Current status: [fill from Store facts]. Include this link: the tracking page (Store facts)?nummer=the parcel number. Say that tracking can be quiet for the first 2–4 days after shipping. Do not mention any carrier name or carrier number, do not promise a delivery date, do not mention refunds. Under 120 words."