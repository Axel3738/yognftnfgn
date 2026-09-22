# Order placed with incorrect delivery address

**Category:** Order · **Internal use only** · One page for every store; store-specific values are in "Store facts" only.

## Use this when

A customer asks to correct or complete the delivery address after placing an order (wrong street, missing apartment number, wrong postal code, moved house).

## OVERVIEW

| | |
|---|---|
| Trigger | Customer asks to change the delivery address after ordering |
| First step | Open the order in Shopify admin and check whether it has shipped |
| Owner approval | Not needed if the order has NOT shipped. Required if it HAS shipped and the fix costs money (re-delivery, replacement, refund) |
| Where to look | Shopify order page (fulfillment timeline) → the store's tracking page → carrier portal only as backup |
| Time sensitivity | Act immediately. Before shipping the fix takes a minute; after shipping it may be impossible |

> Never promise a free re-delivery, replacement or refund on your own. Once the order
> has shipped, the owner decides every resolution that costs money.

## STEP-BY-STEP INSTRUCTIONS

### Step 1 — Find the order and check its status

1. Search Shopify admin by order number or the customer's email.
2. Unfulfilled (still processing) → Step 2. Fulfilled with a tracking number → Step 3.

### Step 2 — The order has NOT shipped

1. Check the new address is complete before saving: street and number, apartment or floor, postal code, city, phone number. An incomplete address causes a second failed delivery — ask for anything missing first.
2. Edit the shipping address on the order in Shopify admin and save.
3. Reopen the order and confirm the new address is showing.
4. Reply with template A, in the customer's language.

### Step 3 — The order HAS shipped

1. Read the fulfillment timeline on the Shopify order page — the latest carrier scan is there. Copy the carrier tracking number from the fulfillment.
2. Open the store's tracking page (Store facts) and paste the number. Note the status in the page's own wording (on its way / with the carrier / out for delivery / ready for pickup / delivered) and copy the store parcel number it shows (BB-/CS-…). Full look-up procedure, including "We can't find that number": page "Tracking page — how to look up any parcel".
3. Only if the store page cannot show the parcel: use the carrier's own portal or 17track.net as backup.
4. Decide what is still possible:
 - "Delivered" → SOP "Package delivered to wrong address".
 - "Ready for pickup" (the page shows "Hämta ditt paket") → a redirect is no longer possible. Tell the customer to collect it with the pickup number on the page; uncollected, it goes back to sender (Step 4).
 - Any other status → a redirect may still be possible, but only before final delivery. Continue.
5. Contact the carrier named in the fulfillment and request an address correction or redirect. Contact channel: — ask the owner once and write the answer into Store facts.
6. Notify the owner and supplier in one message: order number, original and correct address, status in the tracking page's wording, latest scan time.
7. Reply with template B. Send the store parcel number and the link [tracking page]?nummer=[parcel number] — never the raw carrier number (YT…, 4PX…).
8. Wait for the owner's and supplier's decision before promising anything. Expected reply time: — ask the owner once and write the answer into Store facts. If nothing has come back by then, chase them and tell the customer you are still waiting — no case goes silent.

### Step 4 — The package cannot be redirected

You know this when the carrier says so, or the tracking page shows "delivered", "ready for pickup" or a return scan.

- Delivered to the wrong address → SOP "Package delivered to wrong address".
- Returned to sender → SOP "Package returned to sender".

### Step 5 — Keep the customer updated

- Update the customer at each stage: address saved, carrier contacted, owner's decision.
- Write in the customer's language (the store's language, or the language they wrote in). Translate with DeepL, review before sending, reply from the store's support address (Store facts).

## ESCALATION

| Situation | Who | What to send |
|---|---|---|
| Order has shipped and the customer wants a change | Owner + supplier | Order number, old and new address, status in the page's wording, latest scan time |
| Re-delivery, replacement or refund requested | Owner — approval required | The same, plus what the customer asks for |
| No answer from carrier/supplier in time — ask the owner once and write the answer into Store facts | Owner | Your chase message, with date |

## REPLY TEMPLATES

Every reply goes out in the customer's language (DeepL). Swedish first, English meaning after. Replace [brackets].

**A — Address updated (order not shipped)**

Swedish: "Hej [NAMN]! Vi har uppdaterat leveransadressen för order [ORDERNR] till: [NY ADRESS]. Ordern behandlas som vanligt. När den skickas får du ett leveransmejl med knappen 'Spåra paketet' och ditt paketnummer. "

English meaning: We have updated the delivery address for order [ORDER NO] to [NEW ADDRESS]. The order is being processed as normal. When it ships you get a shipping email with a "Track your parcel" button and your parcel number. **B — Already shipped, address cannot be changed yet**

Swedish: "Hej [NAMN]! Tyvärr har order [ORDERNR] redan skickats, så vi kan inte ändra leveransadressen i det här läget. Vi undersöker möjligheterna med vår fraktpartner och återkommer så snart vi vet mer. Under tiden kan du följa paketet här: [SPÅRNINGSSIDA]?nummer=[PAKETNUMMER]. Vi beklagar besväret."

English meaning: Order [ORDER NO] has already shipped, so we cannot change the address at this stage. We are investigating options with our shipping partner and will update you as soon as we know more. Meanwhile you can follow the parcel at [TRACKING PAGE]?nummer=[PARCEL NUMBER]. Sorry for the trouble.

## AI PROMPT TEMPLATE

Claude drafts, DeepL translates, you review before sending.

**Address updated:** "Draft a short confirmation email in [CUSTOMER'S LANGUAGE]: we have updated the delivery address for order [ORDER ID] to [NEW ADDRESS]. They will get a shipping email with a 'Track your parcel' button when it ships. Do not state a delivery window — the page shows it. Friendly tone. Under 80 words."

**Address cannot be changed:** "Draft an email in [CUSTOMER'S LANGUAGE]: order [ORDER ID] has already shipped and we cannot change the delivery address at this stage. We are investigating options with our shipping partner and will update them as soon as we know more. They can follow the parcel at [TRACKING PAGE]?nummer=[PARCEL NUMBER]. Apologetic, professional. Under 100 words."

## Store facts

Every store-specific value — tracking page, parcel number prefix, support address,
delivery promise, return window — is on the page **Store facts**. Take it from there
and never type a store name, a domain or an address into this procedure.
