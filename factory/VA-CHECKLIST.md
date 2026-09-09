# Store Launch Checklist (manual steps)

Axel's master template, 2026-09-07. Omgjord 2026-09-08 i tre beslut:
(1) butiken + appen + kopplingen FÖRST, sen bygger `/ny-ops` allt;
(2) EN app per butik — custom distribution låses till en enda butik
utanför Shopify Plus (mätt 2026-09-08, shopify.dev);
(3) nycklarna läggs i molnsessionens miljö av VA:n, aldrig i chatten.
`factory/checklista.mjs` generates a filled-in copy per store as
`output/<id>/CHECKLISTA.md` — EN fil per butik även när butiken har flera
produkter (TackleBay 2026-09-09); produkterna listas i filen. Everything
not on this list is done by Claude Code (routine: `/ny-ops`, process:
`factory/PROCESS.md`). Valuta, land, språk och marknader i den ifyllda
kopian kommer ur `butiker/<id>.yaml` — mallen nedan visar SEK/Sweden/
Swedish/Norway som exempel, inte som regel.

⚠️ **VA:ns master är Google-dokumentet** (Axels regel 2026-09-08):
https://docs.google.com/document/d/1gOfJGdyip0u6MqMuQxMLkXq39H-M4EvY/edit
Varje ändring i den här filen eller `checklista.mjs` ska föras in i
dokumentet I SAMMA SESSION — annars jobbar VA:n efter gamla instruktioner.

## How this job works

* The owner sends product batches about 2 times per week
* A batch can be 0 products or several
* Each store = run this checklist once (a store usually has one product, sometimes several – it is still ONE store, ONE domain, ONE checklist)
* You have 3 days to launch every store in a batch
* Do steps 1–2 first, then start the build in step 3 — Claude builds the whole store and tells you when each later click is needed

Fill in first (Claude gives you STORE NAME and DOMAIN in step 3):

* STORE NAME: ____________
* DOMAIN: ____________ (e.g. brand.se)
* STORE EMAIL: hello@DOMAIN
* FORWARD TO: ____________ (the work inbox – the store's mail is forwarded here)
* OWNER: ____________ (the owner's own address – the store is handed over to this one, NOT the same as FORWARD TO)
* PRODUCT(S): ____________

Do the steps in order, top to bottom. Tick each one.

## 1. Shopify – create the store
VIDEO:

**The address you type here decides the currency, the language and the home
market.** Shopify takes them from the store address, not from your account.
Type the COMPANY address – never your own, wherever you are sitting.
Get this right and section 5 is three checks instead of seven clicks.

* Go to shopify.com → Start free trial → sign up with the work Gmail
* When it asks where the business is located, enter the company name, the company address and the company's country (the filled-in copy has the exact line)
* Stay on the free trial – never pick a plan, never enter any card
  Note: staff invites need a paid plan – the owner is added at hand over.
* Settings → General → check the currency and the country are the store's own. If not, the address went in wrong – fix it before you continue. Everything built on the wrong currency has to be built again.

## 2. Shopify – connect Claude Code
VIDEO:

* Go to dev.shopify.com → log in with the work Gmail → Apps → Create app → name it: Fabriken + the store's address start (example: Fabriken y1sj1i)
* The app → Settings → copy the Client ID and the Client secret
* Open the Claude session's Environment → set these 4 (overwrite the old values):
  SHOPIFY_SHOP = the store's .myshopify.com address
  SHOPIFY_CLIENT_ID = the Client ID
  SHOPIFY_CLIENT_SECRET = the Client secret
  SHOPIFY_STOREFRONT_PASSWORD = Online Store → Preferences → Password (the store password – Claude needs it to check the pages like a customer sees them; added 2026-09-08)
* Back in the app → Distribution → Custom distribution → enter the store's .myshopify.com address → Generate link → open it → Install app
  Note: keys go ONLY in the Environment – never in chat or email.
  If a Client secret ever ends up in a chat: the app → Settings → Client secret → generate a new one → put the new value in the Environment. The build keeps running on the token it already has, so this never blocks anything.

## 3. Start the build
VIDEO:

* Write /ny-ops + the product link in Claude Code
* Claude checks the connection, names the store and builds everything
* Claude tells you the STORE NAME and DOMAIN for the next steps

## 4. Domain (Loopia)
VIDEO:

* Log in to Loopia
* Buy DOMAIN – registrant must be the company, not you
* Domain → Email → Forwarding → create STORE EMAIL → forward to FORWARD TO
* Send a test email to STORE EMAIL – confirm it arrives

## 5. Shopify – basics
VIDEO:

The first three should ALREADY be right if you typed the company address in
section 1. Check them – do not skip them. Claude cannot change any of the
three, and the prices, the checkout and the discount codes are wrong until
they are correct.

* Settings → General → Store currency says the store's currency (e.g. SEK). Wrong? Change it here, then write those exact words to Claude Code: "currency and language are set" – the discount codes are stored in the store's currency and have to be written again, and that sentence is what starts it.
* Settings → Markets → the home country (e.g. Sweden) is the primary market
* Settings → Languages → the home language (e.g. Swedish) is the default
* Settings → General → Store name → STORE NAME → Save
* Settings → Domains → Connect existing domain → DOMAIN → follow the DNS steps → Set as primary
* Settings → Notifications → Sender email → STORE EMAIL → Save → click the verification link in the inbox

## 5b. Shopify – the EU withdrawal button (required by law)
VIDEO:

Since 19 June every EU store must have a clear "cancel my order" button the
customer can find, a two-step confirmation, and an automatic confirmation
email. Shopify's self-serve returns do all three – but only once you switch
them on. Claude writes the button into the return policy and the footer menu;
these four switches are yours.
Skipping this is not a cosmetic risk: the withdrawal period can stretch from
14 days to 12 months and 14 days, and fines reach 4% of annual turnover in
some member states.

* Settings → Customer accounts → turn customer accounts on
* Same page → turn on Self-serve returns (and cancellations)
* Settings → Policies → Return rules → return window = the store's withdrawal days (14 unless the filled-in copy says otherwise), from delivery, and say who pays the return shipping
* Same page → Cancellation window → until the order is fulfilled
* Open the store and check: "Ångra köp" is in the footer, and it opens the account page. If it opens nothing, the account setting above is off.

## 6. Shopify – payments
VIDEO:

* Settings → Payments → Activate Shopify Payments → fill in the company + bank details Claude gives you
* Same page → Klarna → tick → Save
* Settings → Checkout → Customize → Logo → upload the logo Claude gives you → Save

## 7. Judge.me
VIDEO:

* Apps → search "Judge.me" → Install (free plan)
* Judge.me → Settings → Language → the home language (e.g. Swedish)
* Judge.me → Settings → Review Widget → star color: 00B77F
* Judge.me → Settings → Import reviews → Import from apps → Judge.me format → upload the reviews file Claude gives you → Import (one file per product – repeat for each product in the store)
* Open the product page → check the reviews show their original dates (never "just now")

## 8. Meta
VIDEO:

* business.facebook.com → Settings → Pages → Add → Create a new Page: STORE NAME
* Copy the Page ID → give to Claude Code
* The ad account is always the same for every OPS store: MagiBorsten DK (915422744950975) – never pick another one, never add any card

## 9. Discord
VIDEO:

* Discord → + → Create server: STORE NAME
* Open the invite link Claude Code gives you → Authorize the bot

## 10. Hand over
VIDEO:

* Tell Claude Code: "Store ready: STORE NAME" – it creates the pixel,
  builds Discord channels and imports reviews
* When Claude says the theme is ready: Online Store → Themes → the theme
  Claude names → Publish
* When Claude says an extra market is ready (e.g. Norway): Settings → Markets → that market → activate its currency (e.g. NOK) → Save
* Install the WeTracked app from the Shopify App Store
* WeTracked → paste the pixel ID Claude gives you
* Events Manager → Data sources → STORE NAME → Settings → Conversions API → Generate access token → copy it
* WeTracked → paste the Conversions API token (never send it in chat or email)
* The owner logs in with the work Gmail, picks the plan and adds his card
* Then: Settings → Users → click the store owner's name → Transfer store ownership → OWNER → enter your password → confirm
* Owner changes the Loopia password afterwards

## 11. Ads (a NEW session)

* Open a NEW Claude session — not the one you built the store in
* Write: /ny-annonser STORE-ID + the Bäverbutiken product link
  (example: /ny-annonser tankguard https://bäverbutiken.se/products/...)
* The link is needed once per store — after that just /ny-annonser STORE-ID
* Claude rebuilds the proven ads for this brand and builds two campaigns
  (Swedish + Norwegian) in MagiBorsten DK — everything PAUSED
* Check what Claude asks you to check in Ads Manager
* When it all looks right: set the campaigns ACTIVE

---

Claude Code does: brand design from product + audience, theme build,
product page, bundles + free-gift bonus, cart upsell, images, reviews
import, Meta pixel, Discord channels, markets/translations, and tells
you exactly when your clicks are needed.
