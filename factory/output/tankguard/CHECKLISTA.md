# Store Launch Checklist — TankGuard (manual steps)

Do the steps in order, top to bottom. Tick each one.
Everything not on this list is done by Claude Code.

* STORE NAME: **TankGuard**
* DOMAIN: **tankguard.se**
* STORE EMAIL: **hello@tankguard.se**
* FORWARD TO: **subscriptions@stonebite.org**
* OWNER (hand over to): **axelodhner.business@gmail.com**
* PRODUCT: **IBC-tanköverdrag 1000 L – Stoppar Alger & UV** (tankguard)

## 1. Shopify – create the store
**The address you type here decides the currency, the language and the home
market.** Shopify takes them from the store address, not from your account.
Type the COMPANY address below – never your own, wherever you are sitting.
Get this right and section 5 is three checks instead of seven clicks.
- [ ] Go to shopify.com → **Start free trial** → sign up with the work Gmail
- [ ] When it asks where the business is located, enter:
      **STONEBITE ECOM AB**, Sjöhed 160, 442 74 Harestad, Sweden
- [ ] Stay on the free trial – never pick a plan, never enter any card
  Note: staff invites need a paid plan – the owner is added at hand over.
- [ ] Settings → General → check it says **SEK** and **Sweden**.
      If it does not, the address went in wrong – fix it before you continue.
      Everything built on the wrong currency has to be built again.

## 2. Shopify – connect Claude Code
- [ ] Go to **dev.shopify.com** → log in with the work Gmail → Apps → **Create app** → name it: **Fabriken** + the store's address start (example: Fabriken y1sj1i)
- [ ] The app → **Settings** → copy the **Client ID** and the **Client secret**
- [ ] Open the Claude session's **Environment** → set these 4 (overwrite the old values):
  `SHOPIFY_SHOP` = the store's .myshopify.com address
  `SHOPIFY_CLIENT_ID` = the Client ID
  `SHOPIFY_CLIENT_SECRET` = the Client secret
  `SHOPIFY_STOREFRONT_PASSWORD` = Online Store → Preferences → **Password** (the store password – Claude needs it to check the pages like a customer sees them)
- [ ] Back in the app → **Distribution** → Custom distribution → enter the store's .myshopify.com address → **Generate link** → open it → **Install app**
  Note: keys go ONLY in the Environment – never in chat or email.
  If a Client secret ever ends up in a chat: the app → Settings → Client secret
  → generate a new one → put the new value in the Environment. The build keeps
  running on the token it already has, so this never blocks anything.

## 3. Start the build
- [ ] Write **/ny-ops** + the product link in Claude Code
- [ ] Claude checks the connection, names the store and builds everything
- [ ] Claude tells you the STORE NAME and DOMAIN for the next steps

## 4. Domain (Loopia)
- [ ] Log in to Loopia
- [ ] Buy **tankguard.se** – registrant must be the company, not you
- [ ] Domain → Email → Forwarding → create **hello@tankguard.se** → forward to **subscriptions@stonebite.org**
- [ ] Send a test email to **hello@tankguard.se** – confirm it arrives

## 5. Shopify – basics
The first three should ALREADY be right if you typed the company address in
section 1. Check them – do not skip them. Claude cannot change any of the
three, and the prices, the checkout and the discount codes are wrong until
they are correct.
- [ ] Settings → General → **Store currency** says **SEK**
      Wrong? Change it here, then write those exact words to Claude Code:
      **currency and language are set**
      The discount codes are stored in the store's currency and have to be
      written again, and that sentence is what starts it.
- [ ] Settings → Markets → **Sweden** is the primary market
- [ ] Settings → Languages → **Swedish** is the default
- [ ] Settings → General → Store name → **TankGuard** → Save
- [ ] Settings → Domains → Connect existing domain → **tankguard.se** → follow the DNS steps → Set as primary
- [ ] Settings → Notifications → Sender email → **hello@tankguard.se** → Save → click the verification link in the inbox

## 5b. Shopify – the EU withdrawal button (required by law)
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
- [ ] Open the store and check: **Ångra köp** is in the footer, and it opens
      the account page. If it opens nothing, the account setting above is off.

## 6. Shopify – payments
- [ ] Settings → Payments → Activate **Shopify Payments** → fill in the company + bank details Claude gives you
- [ ] Same page → **Klarna** → tick → Save
- [ ] Settings → Checkout → Customize → Logo → upload the logo Claude gives you → Save

## 7. Judge.me
- [ ] Apps → search "Judge.me" → Install (free plan)
- [ ] Judge.me → Settings → Language → **Swedish**
- [ ] Judge.me → Settings → Review Widget → star color: **00B77F**
- [ ] Judge.me → Settings → Import reviews → Import from apps → **Judge.me format** → upload the reviews file Claude gives you for **IBC-tanköverdrag 1000 L – Stoppar Alger & UV** → Import
- [ ] Open the product page → check the reviews show their original dates (never "just now")

## 8. Meta
- [ ] business.facebook.com → Settings → Pages → Add → Create a new Page: **TankGuard**
- [ ] Copy the **Page ID** → give to Claude Code
- [ ] The ad account is always **MagiBorsten DK** (915422744950975) – same for every OPS store, never pick another one, never add any card

## 9. Discord
- [ ] Discord → + → Create server: **TankGuard**
- [ ] Open the invite link Claude Code gives you → **Authorize** the bot

## 10. Hand over
- [ ] Tell Claude Code: **"Store ready: TankGuard"** – it creates the pixel, builds Discord channels and imports reviews
- [ ] When Claude says the theme is ready: Online Store → Themes → **TankGuard – CRO v1** → **Publish**
- [ ] When Claude says the Norway market is ready: Settings → Markets → **Norway** → activate **NOK** → Save
- [ ] Install the **WeTracked** app from the Shopify App Store
- [ ] WeTracked → paste the **pixel ID**: **2196132151319625**
- [ ] Events Manager → Data sources → **TankGuard** → Settings → Conversions API → **Generate access token** → copy it
- [ ] WeTracked → paste the **Conversions API token** (never send it in chat or email)
- [ ] The owner logs in with the work Gmail, picks the plan and adds his card
- [ ] Then: Settings → Users → click the store owner's name → **Transfer store ownership** → **axelodhner.business@gmail.com** → enter your password → confirm
- [ ] Owner changes the Loopia password afterwards

## 11. Ads (a NEW session)
- [ ] Open a NEW Claude session — not the one you built the store in
- [ ] Write: **/ny-annonser tankguard** + the Bäverbutiken product link
- [ ] The link is needed once per store — after that just **/ny-annonser tankguard**
- [ ] Claude rebuilds the proven ads for this brand and builds the campaigns in MagiBorsten DK — everything PAUSED
- [ ] Check what Claude asks you to check in Ads Manager
- [ ] When it all looks right: set the campaigns ACTIVE
