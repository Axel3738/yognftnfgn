# Store Launch Checklist (manual steps)

Axel's master template, 2026-09-07 (justerad samma kväll efter
VA-granskningen: temapublicering och WeTracked är VA-klick, kortet ligger
redan i Business Manager, och Claude kopplas till butiken via en custom
app-token — steg 3). `factory/checklista.mjs` generates a filled-in copy
per store as `output/<id>/CHECKLISTA.md`. Everything not on this list is
done by Claude Code (routine: `/ny-ops`, process: `factory/PROCESS.md`).

## How this job works

* The owner sends product batches about 2 times per week
* A batch can be 0 products or several
* Each product = one new store = run this checklist once
* You have 3 days to launch every store in a batch
* Start each store by writing /ny-ops + the product link in Claude Code
* Claude tells you exactly when each click below is needed

Fill in first:

* STORE NAME: ____________
* DOMAIN: ____________ (e.g. brand.se)
* STORE EMAIL: hej@DOMAIN
* FORWARD TO: ____________ (owner's inbox)

Do the steps in order, top to bottom. Tick each one.

## 1. Domain (Loopia)
VIDEO:

* Log in to Loopia
* Buy DOMAIN – registrant must be the company, not you
* Domain → Email → Forwarding → create STORE EMAIL → forward to FORWARD TO
* Send a test email to STORE EMAIL – confirm it arrives

## 2. Shopify – create the store
VIDEO:

* Go to shopify.com → Start free trial → sign up with the work Gmail
* Choose the Basic plan when asked
* Settings → Users and permissions → Invite staff → FORWARD TO (the owner) → all permissions

## 3. Shopify – basics
VIDEO:

* Settings → General → Store name → STORE NAME → Save
* Settings → Domains → Connect existing domain → DOMAIN → follow the DNS steps → Set as primary
* Settings → Languages → make Swedish default (add others if needed)
* Settings → Notifications → Sender email → STORE EMAIL → Save → click the verification link in the inbox

## 4. Shopify – connect Claude Code
VIDEO:

* Settings → Apps and sales channels → Develop apps → Allow custom app development
* Create app → name it "Fabriken" → Configure Admin API scopes → tick ALL scopes → Save
* Install app → reveal the **Admin API access token** → paste it into Claude Code when asked (never in chat or email)
* Claude cannot build anything in the store until this is done

## 5. Shopify – payments
VIDEO:

* Settings → Payments → Activate Shopify Payments → fill in the company + bank details Claude gives you
* Same page → Klarna → tick → Save
* Settings → Checkout → Customize → Logo → upload the logo Claude gives you → Save

## 6. Judge.me
VIDEO:

* Apps → search "Judge.me" → Install (free plan)
* Judge.me → Settings → Language → Swedish
* Judge.me → Settings → Review Widget → star color: 00B77F
* Judge.me → Settings → Integrations → copy API Token → paste it into Claude Code when asked (never in chat or email)

## 7. Meta
VIDEO:

* business.facebook.com → Settings → Pages → Add → Create a new Page: STORE NAME
* Copy the Page ID → give to Claude Code
* The ad account is always the same for every OPS store: MagiBorsten DK (915422744950975) – never pick another one, never add any card

## 8. Discord
VIDEO:

* Discord → + → Create server: STORE NAME
* Open the invite link Claude Code gives you → Authorize the bot

## 9. Hand over
VIDEO:

* Tell Claude Code: "Store ready: STORE NAME" – it creates the pixel,
  renames the ad account, builds Discord channels and imports reviews
* When Claude says the theme is ready: Online Store → Themes → the theme
  Claude names → Publish
* Install the WeTracked app → paste the pixel ID Claude gives you →
  connect the Conversions API token (follow WeTracked's guide)
* Settings → Users and permissions → ⋯ → Transfer ownership → the owner
* Owner changes the Loopia password afterwards

---

Claude Code does: brand design from product + audience, theme build,
product page, bundles + free-gift bonus, cart upsell, images, reviews
import, Meta pixel, ad account rename, Discord channels,
markets/translations, and tells you exactly when your clicks are needed.
