# Store Launch Checklist — AdventLane (manual steps)

Do the steps in order, top to bottom. Tick each one.
**The order is not a suggestion** – every section sits where it sits because
the ones above it have to be true first. Sections 1–3 cannot be undone later,
and section 13 is the check that the rest actually worked.
Everything not on this list is done by Claude Code.

* STORE NAME: **AdventLane**
* DOMAIN: **adventlane.se**
* STORE EMAIL: **hello@adventlane.se**
* FORWARD TO: **subscriptions@stonebite.org**
* OWNER (hand over to): **axelodhner.business@gmail.com**
* PRODUCT: **Adventskalender Racingbilar – 24 Bilar Bakom 24 Luckor** (adventskalender-racingbilar)

## 1. Shopify – create the store
**The address you type here decides the currency, the language and the home
market.** Shopify takes them from the store address, not from your account.
Type the COMPANY address below – never your own, wherever you are sitting.
- [ ] Go to shopify.com → **Start free trial** → sign up with the work Gmail
- [ ] When it asks where the business is located, enter:
      **STONEBITE ECOM AB**, Sjöhed 160, 442 74 Harestad, **Sweden**
      The country is the field that decides the currency – never your own.
- [ ] If Shopify asks for a store name, type **AdventLane** – that removes a
      click in section 5. If it names the store itself ("My Store 4"), leave it.
- [ ] Stay on the free trial – never pick a plan, never enter any card
  Note: staff invites need a paid plan – the owner is added at hand over.

## 2. Shopify – currency, market, language (do this BEFORE the build)
These three are the only things on this list that **Claude cannot change** —
`shopUpdate` does not exist and REST answers 406 (measured). They also decide
what the build writes: prices, packages, discount codes and the checkout are
all stored in the store's currency. Get them wrong and the build has to be
thrown away and run again, so they come before the build, not after it.
- [ ] Settings → General → **Store currency** says **SEK**
- [ ] Settings → Markets → **Sweden** is the primary market
- [ ] Settings → Languages → **Swedish** is the default
      A brand new trial store often has **English** here. Swedish text still
      lands correctly and the customer view is right – do not publish an empty
      language, just check the default.
- [ ] Any of the three wrong? The address went in wrong in section 1. Fix it
      here, then write these exact words to Claude Code:
      **currency and language are set**
      The discount codes are stored in the store's currency and have to be
      written again, and that sentence is what starts it.

## 3. Shopify – connect Claude Code
- [ ] Go to **dev.shopify.com** → log in with the work Gmail → Apps → **Create app** → name it: **Fabriken** + the store's address start (example: Fabriken y1sj1i)
- [ ] The app → **Settings** → copy the **Client ID** and the **Client secret**
- [ ] Look at the store's address. It ends in `.myshopify.com`. The part
  BEFORE that is the tag you use below — it is the same thing you typed when
  you named the app. Example: address `ikf0tu-5e.myshopify.com` → tag
  `IKF0TU_5E` (capitals, and `-` becomes `_`).
- [ ] Open the Claude session's **Environment** → ADD these 4. Do NOT touch the
  ones without a tag at the end — those belong to other stores:
  `SHOPIFY_SHOP_<TAG>` = the store's .myshopify.com address
  `SHOPIFY_CLIENT_ID_<TAG>` = the Client ID
  `SHOPIFY_CLIENT_SECRET_<TAG>` = the Client secret
  `SHOPIFY_STOREFRONT_PASSWORD_<TAG>` = Online Store → Preferences → **Password** (the store password – Claude needs it to check the pages like a customer sees them)
  Every session on the account shares ONE Environment. Without the tag, two
  builds fight over the same four rows and one writes to the wrong store.
  You do not have to remember the tag: you write the store ADDRESS in the
  command, and Claude finds the four rows from it.
- [ ] **Save the Environment BEFORE you start the session.** A session reads the
  Environment when it starts — saving into a running session changes nothing there.
- [ ] Back in the app → **Distribution** → Custom distribution → enter the store's .myshopify.com address → **Generate link** → open it → **Install app**
  Note: keys go ONLY in the Environment – never in chat or email.
  If a Client secret ever ends up in a chat: the app → Settings → Client secret
  → generate a new one → put the new value in the Environment. The build keeps
  running on the token it already has, so this never blocks anything.

## 4. Start the build
- [ ] Write **/ny-ops** + the product link in Claude Code, with the store address under it:
  ```
  /ny-ops <the product link>
  The store must be <the .myshopify.com address>. If the "Connected" line does
  not match that address: stop and tell me, build nothing.
  ```
  That address is how Claude finds the right keys. Leave it out and it reads
  the variables without a tag, and those may belong to another store.
- [ ] Claude checks the connection, names the store and builds everything
- [ ] Claude tells you the STORE NAME and DOMAIN for the next steps

## 5. Right after the build – the theme and the name
The theme comes FIRST. Everything you check in sections 6–13 is checked
against what the customer actually sees, and until the theme is published the
customer sees the old one.
- [ ] Online Store → Themes → **AdventLane – CRO v1** → **Publish**
- [ ] Settings → General → Store name → **AdventLane** → Save
      This is what the order emails, the checkout, the review requests and the
      Meta page are all named after – so it happens before any of them.
- [ ] When Claude says the Norway market is ready: Settings → Markets → **Norway** → activate **NOK** → Save

## 6. Shopify Payments + Klarna
Early on purpose: the verification can take days, and nothing in the cart can
be tested until a payment provider is live.
- [ ] Settings → Payments → Activate **Shopify Payments** → fill in the company + bank details Claude gives you
- [ ] Same page → **Klarna** → tick → Save
- [ ] Settings → Checkout → Customize → Logo → upload the logo Claude gives you → Save

## 7. Domain
Loopia first – Shopify cannot connect a domain that is not bought, and the
sender-email verification link is only readable once the forwarding works.
- [ ] Log in to Loopia
- [ ] Buy **adventlane.se** – registrant must be the company, not you
- [ ] Domain → Email → Forwarding → create **hello@adventlane.se** → forward to **subscriptions@stonebite.org**
- [ ] Send a test email to **hello@adventlane.se** – confirm it arrives
- [ ] Shopify → Settings → Domains → Connect existing domain → **adventlane.se** → follow the DNS steps → **Set as primary**
- [ ] Shopify → Settings → Notifications → Sender email → **hello@adventlane.se** → Save → click the verification link in the inbox

## 8. The EU withdrawal button (required by law)
Since 19 June every EU store must have a clear "cancel my order" button the
customer can find, a two-step confirmation, and an automatic confirmation
email. Shopify's self-serve returns do all three — but only once you switch
them on. Claude writes the button into the return policy and the footer menu;
these four switches are yours.
Skipping this is not a cosmetic risk: the withdrawal period can stretch from
14 days to 12 months and 14 days, and fines reach 4% of annual turnover in
some member states.
- [ ] Settings → **Customer accounts** → turn customer accounts on
- [ ] Same page → turn on **Self-serve returns** (and cancellations)
- [ ] Settings → Policies → **Return rules** → return window **14 days**
      from delivery, and say who pays the return shipping
- [ ] Same page → **Cancellation window** → until the order is fulfilled

## 9. Judge.me
- [ ] Apps → search "Judge.me" → Install (free plan)
- [ ] Judge.me → Settings → Language → **Swedish**
- [ ] Judge.me → Settings → Review Widget → star color: **00B77F**
- [ ] Judge.me → Settings → Import reviews → Import from apps → **Judge.me format** → upload the reviews file Claude gives you for **Adventskalender Racingbilar – 24 Bilar Bakom 24 Luckor** → Import
  The upload is yours and stays yours: Judge.me's API overwrites every review
  date with the moment of import (measured 2026-09-08), the app's own file
  keeps the original dates.

## 10. Meta
- [ ] business.facebook.com → Settings → Pages → Add → Create a new Page: **AdventLane**
- [ ] Copy the **Page ID** → give to Claude Code
- [ ] The ad account is always **MagiBorsten DK** (915422744950975) – same for every OPS store, never pick another one, never add any card

## 11. Discord
- [ ] Discord → + → Create server: **AdventLane**
- [ ] Open the invite link Claude Code gives you → **Authorize** the bot

## 12. Tell Claude the store is ready
- [ ] Write to Claude Code: **"Store ready: AdventLane"** – it creates the pixel and builds the Discord channels

## 13. Test the store in a real browser (this is the receipt for 5–12)
Do it on a phone, on **adventlane.se**, as a customer – not in the admin preview.
Nothing above counts as done until this passes.
- [ ] The product page opens and the reviews show their original dates (never "just now")
- [ ] Add to cart → the cart upsell shows → go to checkout
- [ ] The checkout shows **SEK** and **Klarna**
- [ ] **Ångra köp** is in the footer and it opens the account page
      (opens nothing = customer accounts in section 8 is still off)
- [ ] Tell Claude what you saw – a screenshot of anything that looks wrong

## 14. Hand over
- [ ] Install the **WeTracked** app from the Shopify App Store
- [ ] WeTracked → paste the **pixel ID** Claude gives you
- [ ] Events Manager → Data sources → **AdventLane** → Settings → Conversions API → **Generate access token** → copy it
- [ ] WeTracked → paste the **Conversions API token** (never send it in chat or email)
- [ ] The owner logs in with the work Gmail, picks the plan and adds his card
- [ ] Then: Settings → Users → click the store owner's name → **Transfer store ownership** → **axelodhner.business@gmail.com** → enter your password → confirm
- [ ] Owner changes the Loopia password afterwards

## 15. Ads (a NEW session)
- [ ] Open a NEW Claude session — not the one you built the store in
- [ ] Write: **/ny-annonser kalender** + the Bäverbutiken product link
- [ ] The link is needed once per store — after that just **/ny-annonser kalender**
- [ ] Claude rebuilds the proven ads for this brand and builds the campaigns in MagiBorsten DK — everything PAUSED
- [ ] Check what Claude asks you to check in Ads Manager
- [ ] When it all looks right: set the campaigns ACTIVE
