# Store Launch Checklist (manual steps)

Axel's master template, 2026-09-07 (justerad samma kväll efter
VA-granskningen: temapublicering och WeTracked är VA-klick, kortet ligger
redan i Business Manager, och Claude kopplas till butiken via en custom
app-token — steg 3). `factory/checklista.mjs` generates a filled-in copy
per store as `output/<id>/CHECKLISTA.md`. Everything not on this list is
done by Claude Code (routine: `/ny-ops`, process: `factory/PROCESS.md`).

⚠️ **VA:ns master är Google-dokumentet** (Axels regel 2026-09-08):
https://docs.google.com/document/d/1gOfJGdyip0u6MqMuQxMLkXq39H-M4EvY/edit
Varje ändring i den här filen eller `checklista.mjs` ska föras in i
dokumentet I SAMMA SESSION — annars jobbar VA:n efter gamla instruktioner.

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
* STORE EMAIL: hello@DOMAIN
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
* Stay on the free trial – never pick a plan, never enter any card
  Note: staff invites need a paid plan – the owner is added at hand over.

## 3. Shopify – basics
VIDEO:

* Settings → General → Store name → STORE NAME → Save
* Settings → Domains → Connect existing domain → DOMAIN → follow the DNS steps → Set as primary
* Settings → Languages → make Swedish default
* Settings → Notifications → Sender email → STORE EMAIL → Save → click the verification link in the inbox

## 4. Shopify – connect Claude Code
VIDEO:

* Go to dev.shopify.com → log in with the work Gmail → Apps → Fabriken (first time only: Create app → name it "Fabriken")
* Fabriken → Settings → copy the Client ID and the Client secret
* Give Claude Code 3 values: the store's .myshopify.com address + the Client ID + the Client secret (paste in Claude Code, never in email)
* When Claude gives you an install link: open it → Install app → approve
* Claude cannot build anything in the store until this is done
  Note: an "Admin API access token" from the CLI is the WRONG thing – Claude only needs the 3 values above. (Mätt 2026-09-08: fel tokentyp stoppade TankGuard-bygget.)

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
  builds Discord channels and imports reviews
* When Claude says the theme is ready: Online Store → Themes → the theme
  Claude names → Publish
* When Claude says the Norway market is ready: Settings → Markets → Norway → activate NOK → Save
* Install the WeTracked app from the Shopify App Store
* WeTracked → paste the pixel ID Claude gives you
* WeTracked → connect the Conversions API token (WeTracked shows the steps)
* The owner logs in with the work Gmail, picks the plan and adds his card
* Then: Settings → Users and permissions → ⋯ → Transfer ownership → the owner
* Owner changes the Loopia password afterwards

---

Claude Code does: brand design from product + audience, theme build,
product page, bundles + free-gift bonus, cart upsell, images, reviews
import, Meta pixel, Discord channels,
markets/translations, and tells you exactly when your clicks are needed.
