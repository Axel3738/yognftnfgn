# Store Launch Checklist — TankGuard (manual steps)

Do the steps in order, top to bottom. Tick each one.
Everything not on this list is done by Claude Code.

* STORE NAME: **TankGuard**
* DOMAIN: **tankguard.se**
* STORE EMAIL: **hello@tankguard.se**
* FORWARD TO: **subscriptions@stonebite.org**

## 1. Domain (Loopia)
- [ ] Log in to Loopia
- [ ] Buy **tankguard.se** – registrant must be the company, not you
- [ ] Domain → Email → Forwarding → create **hello@tankguard.se** → forward to **subscriptions@stonebite.org**
- [ ] Send a test email to **hello@tankguard.se** – confirm it arrives

## 2. Shopify – create the store
- [ ] Go to shopify.com → **Start free trial** → sign up with the work Gmail
- [ ] Stay on the free trial – never pick a plan, never enter any card
  Note: staff invites need a paid plan – the owner is added at hand over.

## 3. Shopify – basics
- [ ] Settings → General → Store name → **TankGuard** → Save
- [ ] Settings → Domains → Connect existing domain → **tankguard.se** → follow the DNS steps → Set as primary
- [ ] Settings → Languages → make **Swedish** default
- [ ] Settings → Notifications → Sender email → **hello@tankguard.se** → Save → click the verification link in the inbox

## 4. Shopify – connect Claude Code
- [ ] Settings → Apps and sales channels → Develop apps → **Allow custom app development**
- [ ] Create app → name it **Fabriken** → Configure Admin API scopes → tick **ALL** scopes → Save
- [ ] Install app → reveal the **Admin API access token** → paste it into Claude Code when asked (never in chat or email)

## 5. Shopify – payments
- [ ] Settings → Payments → Activate **Shopify Payments** → fill in the company + bank details Claude gives you
- [ ] Same page → **Klarna** → tick → Save
- [ ] Settings → Checkout → Customize → Logo → upload the logo Claude gives you → Save

## 6. Judge.me
- [ ] Apps → search "Judge.me" → Install (free plan)
- [ ] Judge.me → Settings → Language → **Swedish**
- [ ] Judge.me → Settings → Review Widget → star color: **00B77F**
- [ ] Judge.me → Settings → Integrations → copy **API Token** → paste it into Claude Code when asked (never in chat or email)

## 7. Meta
- [ ] business.facebook.com → Settings → Pages → Add → Create a new Page: **TankGuard**
- [ ] Copy the **Page ID** → give to Claude Code
- [ ] The ad account is always **MagiBorsten DK** (915422744950975) – same for every OPS store, never pick another one, never add any card

## 8. Discord
- [ ] Discord → + → Create server: **TankGuard**
- [ ] Open the invite link Claude Code gives you → **Authorize** the bot

## 9. Hand over
- [ ] Tell Claude Code: **"Store ready: TankGuard"** – it creates the pixel, builds Discord channels and imports reviews
- [ ] When Claude says the theme is ready: Online Store → Themes → the theme Claude names → **Publish**
- [ ] When Claude says the Norway market is ready: Settings → Markets → **Norway** → activate **NOK** → Save
- [ ] Install the **WeTracked** app from the Shopify App Store
- [ ] WeTracked → paste the **pixel ID** Claude gives you
- [ ] WeTracked → connect the **Conversions API token** (WeTracked shows the steps)
- [ ] The owner logs in with the work Gmail, picks the plan and adds his card
- [ ] Then: Settings → Users and permissions → ⋯ → **Transfer ownership** → **subscriptions@stonebite.org**
- [ ] Owner changes the Loopia password afterwards
