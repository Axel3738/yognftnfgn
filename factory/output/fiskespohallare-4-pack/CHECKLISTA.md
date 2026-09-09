# Store Launch Checklist — TackleBay (manual steps)

Do the steps in order, top to bottom. Tick each one.
Everything not on this list is done by Claude Code.

* STORE NAME: **TackleBay**
* DOMAIN: **tacklebay.se**
* STORE EMAIL: **hello@tacklebay.se**
* FORWARD TO: **subscriptions@stonebite.org**

## 1. Shopify – create the store
- [ ] Go to shopify.com → **Start free trial** → sign up with the work Gmail
- [ ] Stay on the free trial – never pick a plan, never enter any card
  Note: staff invites need a paid plan – the owner is added at hand over.

## 2. Shopify – connect Claude Code
- [ ] Go to **dev.shopify.com** → log in with the work Gmail → Apps → **Create app** → name it: **Fabriken** + the store's address start (example: Fabriken y1sj1i)
- [ ] The app → **Settings** → copy the **Client ID** and the **Client secret**
- [ ] Open the Claude session's **Environment** → set these 3 (overwrite the old values):
  `SHOPIFY_SHOP` = the store's .myshopify.com address
  `SHOPIFY_CLIENT_ID` = the Client ID
  `SHOPIFY_CLIENT_SECRET` = the Client secret
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
- [ ] Buy **tacklebay.se** – registrant must be the company, not you
- [ ] Domain → Email → Forwarding → create **hello@tacklebay.se** → forward to **subscriptions@stonebite.org**
- [ ] Send a test email to **hello@tacklebay.se** – confirm it arrives

## 5. Shopify – basics
Do these FIRST, before anything else in this section.
A new trial store keeps the country, currency and language of the account
that created it. Claude cannot change any of the three – they are your clicks,
and the prices, the checkout and the discount codes are wrong until they are done.
- [ ] Settings → General → **Store currency** → **SEK** → Save
- [ ] Settings → Markets → make **Sweden** the primary market
- [ ] Settings → Languages → make **Swedish** default
- [ ] Tell Claude Code: **currency and language are set** – the discount codes
      are stored in the store's currency and have to be written again
- [ ] Settings → General → Store name → **TackleBay** → Save
- [ ] Settings → Domains → Connect existing domain → **tacklebay.se** → follow the DNS steps → Set as primary
- [ ] Settings → Notifications → Sender email → **hello@tacklebay.se** → Save → click the verification link in the inbox

## 6. Shopify – payments
- [ ] Settings → Payments → Activate **Shopify Payments** → fill in the company + bank details Claude gives you
- [ ] Same page → **Klarna** → tick → Save
- [ ] Settings → Checkout → Customize → Logo → upload the logo Claude gives you → Save

## 7. Judge.me
- [ ] Apps → search "Judge.me" → Install (free plan)
- [ ] Judge.me → Settings → Language → **Swedish**
- [ ] Judge.me → Settings → Review Widget → star color: **00B77F**
- [ ] Judge.me → Settings → Integrations → copy **API Token** → paste it into Claude Code when asked (never in chat or email)

## 8. Meta
- [ ] business.facebook.com → Settings → Pages → Add → Create a new Page: **TackleBay**
- [ ] Copy the **Page ID** → give to Claude Code
- [ ] The ad account is always **MagiBorsten DK** (915422744950975) – same for every OPS store, never pick another one, never add any card

## 9. Discord
- [ ] Discord → + → Create server: **TackleBay**
- [ ] Open the invite link Claude Code gives you → **Authorize** the bot

## 10. Hand over
- [ ] Tell Claude Code: **"Store ready: TackleBay"** – it creates the pixel, builds Discord channels and imports reviews
- [ ] When Claude says the theme is ready: Online Store → Themes → the theme Claude names → **Publish**
- [ ] When Claude says the Norway market is ready: Settings → Markets → **Norway** → activate **NOK** → Save
- [ ] Install the **WeTracked** app from the Shopify App Store
- [ ] WeTracked → paste the **pixel ID** Claude gives you
- [ ] WeTracked → connect the **Conversions API token** (WeTracked shows the steps)
- [ ] The owner logs in with the work Gmail, picks the plan and adds his card
- [ ] Then: Settings → Users and permissions → ⋯ → **Transfer ownership** → **subscriptions@stonebite.org**
- [ ] Owner changes the Loopia password afterwards
