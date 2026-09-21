# Tracking email ended up in spam

**Category:** Account and Website · Internal use only

## Use this when

A customer says they never received the shipping (tracking) email, or the order confirmation. Most common cause: the customer's email provider filtered it into spam or junk. Second cause: a typo in the email address on the order. Third cause: the order has not shipped yet, so no shipping email exists to find.

## OVERVIEW

| | |
|---|---|
| Trigger | Customer says they have no tracking or order confirmation email |
| First step | Open the order in Shopify. Check the email address and the fulfillment status BEFORE you reply |
| Owner approval | Not required for standard cases. Required to correct the email address on an order and resend the notification |
| Where to look | Shopify order page (fulfillment timeline) → the store's tracking page → carrier portal only as backup |

## Store facts

Every store-specific value — tracking page, parcel number prefix, support address,
delivery promise, return window — is on the page **Store facts**. Take it from there
and never type a store name, a domain or an address into this procedure.


> Grillkliniken has no tracking page. There the old procedure still applies: the order
> number plus the carrier's own tracking link in the reply.

## STEP-BY-STEP INSTRUCTIONS

### Step 1 – Check the order in Shopify first

1. Search for the order by order number or by the customer's email address.
2. Confirm the order exists. Compare the email address on the order with the address the customer is writing from. If they differ, the address is probably the problem — go to Step 3 as well.
3. Check the fulfillment status.
 - **Not fulfilled:** no shipping email has been sent yet, so there is nothing to find. Go to Step 5.
 - **Fulfilled:** continue with Step 2.

### Step 2 – Get the store parcel number

Full procedure: see the page "Tracking page — how to look up any parcel". The part you need here:

1. On the order page, copy the carrier tracking number from the fulfillment. The fulfillment timeline also shows the latest scan.
2. Open the store's tracking page (Store facts table) and paste the carrier number.
3. Copy "Your parcel number" (Ditt paketnummer), e.g. BB-3F7A2C1D or CS-3F7A2C1D. This is what goes in the reply. **Never send the carrier number (YT…, 4PX…) to the customer.**
4. Note the status wording and the "Estimated delivery" the page shows.

> "We can't find that number": if the order was fulfilled less than an hour ago, the
> page has not picked it up yet — it refreshes once per hour. Wait for the next hourly
> run, then reply. Shipped more than 60 days ago → use the carrier number on 17track.net
> or the carrier's site as backup. Otherwise the number is mistyped.

### Step 3 – If the email address on the order is wrong

1. Notify the owner: the address must be corrected in Shopify and the notification resent from the order page (Shopify "Resend email"). Timeframe for the fix: — ask the owner once and write the answer into Store facts.
2. Do not make the customer wait for that. Reply yourself with the parcel number and link (Step 4) and tell them the emails will be resent to the correct address.

### Step 4 – Reply once, with everything

One reply that contains all of this:

- Ask them to check spam/junk and search their inbox for the store's support address or the store's name (Store facts table).
- The store parcel number and the link `<tracking page>?nummer=<parcel number>`, for example https://baverbutiken.se/pages/spara?nummer=BB-3F7A2C1D.
- The status in the page's own wording (on its way / with the carrier / out for delivery / ready for pickup / delivered).
- That "Spåra paket" / "Spor pakken" / "Seuraa pakettia" / "Track your parcel" sits in the store's header and footer menu, so they never depend on the email.
- Advice to add the store's support address to their contacts.
- Tracking can be silent the first 2–4 days after shipping; that is normal. The delivery window is in Store facts and is only quoted when the order has not shipped yet.

Reply in the customer's language: Swedish, Norwegian, Danish, Finnish or English, following the store (DeepL). Use Claude to draft, review before sending.

### Step 5 – The order has not shipped yet

Explain that the shipping email with the tracking button comes when the parcel ships. Do not promise a Swedish-warehouse timeline unless the order shows it.

## ESCALATION

- **Wrong email address on the order** → owner corrects it and resends the notification (Step 3). You still send the tracking link yourself.
- **Correct address, not in spam, parcel visible on the page** → ask the owner to resend the shipping notification from the order page. (⚠️ OWNER: whether the VA may resend it herself.) The customer already has the link from your reply, so nothing is blocked.
- **Page shows no new scan for 7 days after the first scans, or the parcel is past day 14 without delivery** → this is no longer a spam case. Open the carrier's own tracking, then escalate per the store's escalation rule. Do not tell the customer the parcel is lost until the carrier has confirmed non-delivery.
- **Refund, replacement or "the package is lost"** → always owner approval.

## REPLY TEMPLATES

Swedish shown; translate to the customer's language with DeepL before sending. Fill in the brackets.

**Template A – order shipped, parcel found on the page**

Swedish: "Hej [namn]! Tack för ditt mejl. Leveransmejlet hamnar ibland i skräpposten – sök gärna efter [supportadress] i din inkorg och skräppost. Här är ditt paketnummer: [BB-XXXXXXXX]. Du kan följa paketet här: [spårningssida]?nummer=[paketnummer]. Just nu visar sidan: [status]. Du hittar också "Spåra paket" i menyn på vår sida, så du behöver inte mejlet. Lägg gärna till [supportadress] i dina kontakter så kommer mejlen fram nästa gång."

English meaning: Hi, thanks for your email. Shipping emails sometimes land in spam – search your inbox and spam for [support address]. Here is your parcel number [BB-XXXXXXXX] and the link [tracking page]?nummer=[parcel number]. Right now the page shows [status]. You also find "Track your parcel" in the store menu, so you do not need the email. Add [support address] to your contacts so future emails arrive.

**Template B – order not shipped yet**

Swedish: "Hej [namn]! Din order är mottagen men har inte skickats ännu, så leveransmejlet har inte gått ut. När paketet skickas får du ett mejl med knappen "Spåra paketet". Titta gärna i skräpposten och lägg till [supportadress] i dina kontakter."

English meaning: Your order is received but not shipped yet, so no shipping email has been sent. When it ships you get an email with the "Track your parcel" button. Check spam and add [support address] to your contacts.

**Template C – wrong email address on the order**

Swedish: "Hej [namn]! Mejladressen på din order var [fel adress], därför kom mejlen inte fram. Vi rättar adressen och skickar om leveransmejlet. Under tiden: ditt paketnummer är [BB-XXXXXXXX], följ paketet här: [spårningssida]?nummer=[paketnummer]."

English meaning: The email address on your order was [wrong address], so the emails did not arrive. We are correcting it and resending. Meanwhile, your parcel number is [BB-XXXXXXXX], track it here: [tracking page]?nummer=[parcel number].

## AI PROMPT TEMPLATE

"Draft a friendly reply in [store language] to a customer who has not received their shipping/tracking email. Ask them to check spam/junk and search for [support address]. Give them their parcel number [BB-XXXXXXXX] and the link [tracking page]?nummer=[parcel number]. Current status: [status from the page]. Mention that 'Track your parcel' is in the store's menu. Ask them to add [support address] to their contacts. Do not state a delivery date or window — the page shows it. Do not mention the carrier tracking number or any other store." Review before sending.