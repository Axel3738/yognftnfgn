# SOP: Where is my package?

**Use this when** a customer asks where their package is, what the current delivery status is, or says tracking looks stuck. Works for every store in the "Store facts" table. For the full look-up procedure, see the page **"Tracking page — how to look up any parcel"** — this SOP only covers what is specific to this question.

## OVERVIEW

| Trigger | First step | Owner approval | Where to look |
|---|---|---|---|
| Customer asks where their package is or what the delivery status is | Open the order in Shopify and read the fulfillment timeline, then open the store's tracking page | Not required for standard tracking replies. Required before any refund, replacement or "the package is lost" statement | Shopify order (fulfillment timeline) → the store's tracking page → carrier portals / 17track.net only as backup |

> Normal behaviour: tracking can be silent for the first 2–4 days after shipping — the
> parcel is on its way to the flight. Do not tell the customer the package is lost
> because tracking has not updated.

## Store facts

Every store-specific value — tracking page, parcel number prefix, support address,
delivery promise, return window — is on the page **Store facts**. Take it from there
and never type a store name, a domain or an address into this procedure.


## STEP-BY-STEP INSTRUCTIONS

### Step 1 – Check what the customer already has

1. Every shipping email carries a button "Spåra paketet" / "Spor pakken" / "Seuraa pakettia" / "Track your parcel" and prints the parcel number (BB-XXXXXXXX or CS-XXXXXXXX) under it.
2. If the customer quotes a parcel number, go to Step 3. If they quote an order number, go to Step 2.
3. If they gave neither: reply with template A (point to the button first, ask for the order number only as fallback).

### Step 2 – Look up the order in Shopify

1. Search by order number or customer email.
2. Read the fulfillment timeline on the order page — the hourly routine writes the latest carrier scan there ("Ute för leverans", "Levererad" …).
3. Copy the carrier tracking number from the fulfillment. Do not assume a Swedish warehouse — read the actual fulfillment on the order.

### Step 3 – Open the store's tracking page

1. Open the tracking page (Store facts) and paste the carrier tracking number or the customer's parcel number (spaces and hyphens are ignored).
2. Copy "Ditt paketnummer" / "Your parcel number" from the page. **Send the store parcel number, never the carrier number (YT…, 4PX…) and never a carrier link.**
3. Read the status in the page's own words:
 - Order received (Ordern är mottagen)
 - The parcel is on its way (Paketet är på väg)
 - With the carrier (Hos fraktbolaget)
 - Out for delivery (Ute för leverans)
 - Ready for pickup (Paketet finns att hämta) — "Hämta ditt paket" with the pickup point's number appears only here
 - Delivered (Levererat)
4. Read the "Beräknad leverans" / "Estimated delivery" the page shows. The customer sees it there, so do not repeat it in your reply.
5. If the page says "Vi hittar inte det numret" / "We can't find that number": fulfilled less than 1 hour ago → wait for the next hourly run (the most common cause). Shipped more than 60 days ago → use the carrier number on 17track.net or the carrier's site. Otherwise the number is mistyped.
6. Backup only: carrier portals and 17track.net show the same scans as the page.

### Step 4 – Reply to the customer

1. Reply in the customer's language — the customer's language. Translate the template with DeepL; use the AI prompt below to draft.
2. Always include the link the tracking page (Store facts)?nummer=the parcel number and the parcel number.
3. On its way / with the carrier: confirm it is moving and that silence in tracking is normal; give the estimated delivery window from the page. Never promise "1–2 days" or any per-stage day count.
4. Out for delivery / Delivered: Shopify sends these notifications automatically — do not re-send them by hand.
5. Delivered but not received: ask the customer to check mailbox, pickup-point notice and neighbours before escalating. If still missing, follow the SOP "Package marked delivered but not received".
6. Never look up or quote another customer's parcel. The page carries no names, addresses or order numbers on purpose.
7. Review the reply fully before sending. Sign with your name and the store name (Store facts).

## ESCALATION

- Investigate when: no new scan for 7 days after the first scans, or day 14 has passed without delivery.
- First open the carrier's own tracking (backup portals). Then contact the supplier agent for an investigation and notify the owner.
- While an investigation is pending, tell the customer it is being investigated and that you will come back with an answer. Maximum reply time: — ask the owner once and write the answer into Store facts.
- **Refund, replacement and "the package is lost" always need owner approval.** Do not say "lost" until the carrier has confirmed non-delivery.

## REPLY TEMPLATES

Swedish text first, English meaning after. Translate to the customer's language with DeepL.

**A – No order or parcel number given**

Hej (KUNDNAMN)! Tack för att du hör av dig, vi hjälper dig gärna att spåra ditt paket! I leveransmejlet finns knappen "Spåra paketet" och ditt paketnummer — klicka där så ser du hela vägen. Hittar du inte mejlet? Skicka ditt ordernummer så letar vi upp paketet. Ha en fin dag, [DITT NAMN], the store name (Store facts)

English meaning: Thanks for reaching out — the shipping email has a "Track your parcel" button and your parcel number; click it to see the whole chain. Can't find the email? Send your order number and we will look it up.

**B – On its way / with the carrier**

Hej (KUNDNAMN)! Ditt paket är på väg. Ditt paketnummer är the parcel number och du kan följa det här: the tracking page (Store facts)?nummer=the parcel number. Det är helt normalt att spårningen står stilla några dagar — paketet rör sig ändå. Ha en fin dag, [DITT NAMN], the store name (Store facts)

English meaning: Your parcel is on its way. Your parcel number is X, follow it here. It is normal for tracking to look stuck for a few days.

**C – Delivered but not received**

Hej (KUNDNAMN)! Spårningen visar att paketet är levererat. Kolla gärna 1) brevlådan, 2) en avi från ett utlämningsställe, 3) med grannarna. Hittar du det inte hör av dig igen så undersöker vi vidare. Ha en fin dag, [DITT NAMN], the store name (Store facts)

English meaning: Tracking shows delivered. Please check mailbox, pickup-point notice, neighbours; contact us again if still missing and we will investigate.

## AI PROMPT TEMPLATE

"Draft a friendly email in the customer's language for a customer asking where their package is. Order [ORDER ID] has shipped. The store tracking page shows: [STATUS IN THE PAGE'S OWN WORDS] and estimated delivery [WINDOW FROM THE PAGE]. Say the parcel number is the parcel number and include the link the tracking page (Store facts)?nummer=the parcel number. Explain that tracking can look stuck for a few days and that this is normal. Do not mention the carrier name or carrier number, do not promise a delivery day, do not say the package is lost. Sign off with [YOUR NAME], the store name (Store facts). Under 120 words."