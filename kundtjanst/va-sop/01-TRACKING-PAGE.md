# Tracking page — how to look up any parcel

**Use this when** a customer asks where their parcel is, or says the tracking link
finds nothing. Every other delivery SOP sends you here for the look-up, then takes
over with what to do about it.

Same steps on every store. The only thing that changes per brand is the **Store
facts** page.

---

## 1. The 60-second look-up

1. **No order number and no parcel number in the mail?** Ask for either one first.
2. **Open the order in Shopify admin** (search by order number or the customer's
   email). Note whether it is fulfilled, and when.
3. **Read the fulfillment timeline on the order page.** An hourly routine writes the
   carrier's scans there, so the latest status is already on the order — you do not
   have to look it up anywhere else. Copy the carrier tracking number from the
   fulfillment while you are there.
4. **Open the store's tracking page** (Store facts) and paste the carrier number, or
   the parcel number the customer quoted. You now see exactly what the customer sees,
   plus their parcel number under "Your parcel number".
5. **Answer with the parcel number and the page link**, never the carrier number:
   `<tracking page>?nummer=<parcel number>`.
6. **Quote the page's own wording** for the status and for "Estimated delivery", then
   pick the reply template below and send it in the customer's language.

Carrier portals (17track.net, the carrier's own site) are the **backup**, not the
first step. They show the same scans, and the customer cannot see them.

---

## 2. What the customer already has

- Three shipping emails — Shipping confirmation, Shipping update, Out for delivery —
  each with a single button "Track your parcel" ("Spåra paketet" / "Spor pakken" /
  "Seuraa pakettia"). The button opens the store's own tracking page with the parcel
  number already filled in, and the number is printed underneath it.
- "Out for delivery" and "Delivered" emails go out automatically, driven by the
  carrier's scans.
- Every live store has "Track your parcel" in the header menu and in the footer.

So a customer writing "where is my package?" has usually not opened the email, or has
opened it within the first hour (see §4). Send the link; it answers the question
better than a sentence can.

---

## 3. What the page shows

The whole chain, from the warehouse abroad to the customer's mailbox, in the store's
language, with city and time for every scan — for example
"17 sep 23:28 · Paketet är levererat i din brevlåda · Umeå".

Five stages:

| Swedish | English |
|---|---|
| Ordern är mottagen | Order received |
| Paketet är på väg | The parcel is on its way |
| Hos fraktbolaget | With the carrier |
| Ute för leverans | Out for delivery |
| Levererat | Delivered |

Under each stage, a sub-step says where the parcel actually is.

- **Country names are never shown.** Do not add one in your reply either.
- **The last-mile carrier appears once the parcel is in the customer's country** —
  the page then shows the carrier's name, that carrier's own tracking number, and a
  link to its site. Before the parcel arrives in the country, no carrier is named,
  and that is normal: measured on 1 055 parcels 2026-09-20, 432 had no local carrier
  yet.
- **"Collect your parcel"** ("Hämta ditt paket"), with the pickup point's number and
  link, appears **only** when the parcel is waiting at a pickup point.
- **"Estimated delivery"** ("Beräknad leverans") shows the store's delivery promise
  counted from the ship date — 7–14 calendar days on Bäverbutiken (Store facts).
- The search box accepts the parcel number **and** the carrier number. Spaces and
  hyphens are ignored.
- The page carries **no names, no addresses and no order numbers**, and a parcel
  cannot be looked up by order number. That is deliberate: order numbers run in
  sequence, so anyone could have read a stranger's parcel.

Shopify's own order status page cannot show any of this — it draws three dashes with
dates, no cities, no history. That is why the store page exists. Send the store page.

---

## 4. "We can't find that number"

In order of likelihood — the first cause is by far the most common, and it is not a
typo:

1. **The shipping email arrived less than an hour ago.** The page picks up new
   parcels once an hour. Tell the customer to try again shortly; the page says so
   itself.
2. **The parcel shipped more than 60 days ago.** The page keeps 60 days. Look it up
   for them on the carrier number instead (17track.net).
3. **A mistyped number.** Check it against the order.

> **Many fresh parcels missing at once** is not a customer problem — tell the owner.
> The tracking quota may have run out, and new parcels then stop being registered.

**Do not confuse this with silent tracking.** A parcel that *is* on the page but shows
no new scans for the first 2–4 days after shipping is normal — it is on its way to the
flight, and the shipping email says so.

---

## 5. When a parcel is genuinely stuck

- No new scan for 7 days after the first scans, **or** past day 14 without delivery.
- Then: open the carrier's own tracking, continue with "Order not arrived within
  expected timeframe", and tell the owner.
- **Never tell a customer the parcel is lost** until the carrier has confirmed
  non-delivery. Refunds, replacements and "lost" statements need the owner's approval
  (Store facts).

---

## 6. Two numbers, two audiences — the privacy rule

| Who | Gets | Never gets |
|---|---|---|
| The customer | The store parcel number (`BB-…`, `CS-…`, `MS-…`) and the page link | The carrier number (`YT…`, `4PX…`) |
| A payment dispute / the bank | The carrier number and a screenshot from the carrier's own site | — |

Never look up or quote another customer's parcel, name or address.

---

## 7. Reply templates

Swedish first, English meaning after. Write in the language the customer wrote in
(use DeepL — see "How to use DEEPL"). `[NUMMER]` = the store parcel number,
`[LÄNK]` = the tracking page link with that number.

**1 — On its way**
> Hej [NAMN]! Ditt paket är på väg. Paketnummer: [NUMMER], följ det här: [LÄNK].
> Beräknad leverans är 7–14 dagar efter att paketet skickades, och spårningen kan
> vara tyst de första dagarna — det är helt normalt.

*Meaning: on its way; 7–14 days after shipping; silence in the first days is normal.*

**2 — Out for delivery**
> Hej [NAMN]! Ditt paket är ute för leverans i dag. Paketnummer: [NUMMER], följ det
> här: [LÄNK].

**3 — Waiting at a pickup point**
> Hej [NAMN]! Ditt paket finns att hämta. Öppna [LÄNK] — ombudets nummer och länk
> står under "Hämta ditt paket". Paket ligger bara kvar en begränsad tid innan de
> skickas tillbaka, så hämta det när du kan.

**4 — Shows delivered, customer has nothing**
> Hej [NAMN]! Spårningen visar att paketet är levererat: [LÄNK]. Titta i brevlådan,
> hos närmaste ombud och hos grannarna, och fråga andra i hushållet. Hittar du det
> inte, svara här så undersöker vi vidare.

*Then continue with "Package missing after tracking shows delivered".*

**5 — The page cannot find it yet**
> Hej [NAMN]! Fick du leveransmejlet nyss? Då är paketet på väg in på spårningssidan
> — den hämtar nya paket varje timme, så prova igen om en liten stund: [LÄNK].

---

## 8. Where to go next

| What you found | Open this SOP |
|---|---|
| Stuck by the rule in §5 | Order not arrived within expected timeframe |
| Delivered, customer has nothing | Package missing after tracking shows delivered |
| Delivered to the wrong address | Package delivered to wrong address |
| Heading back to the sender | Package returned to sender without delivery |
| Customer asks when it will arrive | When will my package arrive? |
| Customer never got the shipping email | Tracking email ended up in spam |

---

## Definition of done

- [ ] The order was opened in Shopify and the fulfillment timeline was read.
- [ ] The parcel was looked up on the store's own tracking page.
- [ ] The reply carries the **store parcel number** and the page link — no carrier
      number, no country name, no order number.
- [ ] The status and the delivery window are quoted in the page's own words.
- [ ] Anything stuck by §5 was passed to the owner, and nothing was called "lost".
