# Store Launch Checklist (manual steps)

Axel's master template, 2026-09-07. Omgjord 2026-09-08 i tre beslut:
(1) butiken + appen + kopplingen FÖRST, sen bygger `/ny-ops` allt;
(2) EN app per butik — custom distribution låses till en enda butik
utanför Shopify Plus (mätt 2026-09-08, shopify.dev);
(3) nycklarna läggs i molnsessionens miljö av den som klickar, aldrig i
chatten.
**Omordnad 2026-09-10 (Axel):** stegen låg i den ordning de skrevs, inte i
den ordning de måste göras. Skälet till varje position står nu i filen.
`factory/checklista.mjs` generates a filled-in copy per store as
`output/<id>/CHECKLISTA.md` — EN fil per butik även när butiken har flera
produkter (TackleBay 2026-09-09); produkterna listas i filen. Everything
not on this list is done by Claude Code (routine: `/ny-ops`, process:
`factory/PROCESS.md`). Valuta, land, språk och marknader i den ifyllda
kopian kommer ur `butiker/<id>.yaml` — mallen nedan visar SEK/Sweden/
Swedish/Norway som exempel, inte som regel.

⚠️ **Masterkopian för den som klickar är Google-dokumentet** (Axels regel
2026-09-08):
https://docs.google.com/document/d/1gOfJGdyip0u6MqMuQxMLkXq39H-M4EvY/edit
Varje ändring i den här filen eller `checklista.mjs` ska föras in i
dokumentet I SAMMA SESSION — annars jobbar den som klickar efter gamla
instruktioner.

⚠️ **Rollen, inte personen.** Filen hette VA-checklistan när en VA gjorde
klicken. Hon är borta sedan 2026-09-10; listan är densamma och görs av Axel
eller nästa anställd. Filnamnet ligger kvar för att ett tjugotal rader i
`PROCESS.md`, `KEDJAN.md` och `CLAUDE.md` pekar hit.

## Varför ordningen ser ut som den gör

| Position | Skäl |
|---|---|
| 1–3 före bygget | Inget av det går att ändra efteråt. Valuta, språk och primärmarknad sätts av butiksadressen vid skapandet, och bygget skriver priser, paket och rabattkoder i butikens valuta. Fel här = bygg om allt. |
| 5 temat först efter bygget | Allt du kontrollerar i 6–13 kontrolleras mot kundens riktiga vy. Opublicerat tema = du kontrollerar en butik ingen ser. Publicering fungerar på free trial (mätt: DryTrek 2026-09-09) — butiken står bakom sitt lösenord ändå. |
| 6 Loopia före Shopify | Går inte att koppla en domän som inte är köpt, och verifieringslänken för avsändarmejlen går bara att läsa när vidarebefordran fungerar. |
| 6–12 före ägarbytet | Allt det här görs på free trial och kostar ingenting. |
| 13 testet före ägarbytet | Kvittot på 5–12, bakom butikslösenordet. Kassan kan inte testas här — se 15. |
| 14 ägarbytet | Plan, kort och överlåtelse. Härifrån är butiken ägarens. |
| 15–16 efter ägarbytet | **Axels regel 2026-09-10.** Shopify Payments är ägarens bank och identitet, och butikslösenordet går inte att ta bort förrän en plan är vald. Alltså kan kassan inte testas förrän här — det är därför testet är delat i två. |

## How this job works

* The owner sends product batches about 2 times per week
* A batch can be 0 products or several
* Each store = run this checklist once (a store usually has one product, sometimes several – it is still ONE store, ONE domain, ONE checklist)
* You have 3 days to launch every store in a batch
* Do sections 1–3 first, then start the build in section 4 — Claude builds the whole store and tells you when each later click is needed

Fill in first (Claude gives you STORE NAME and DOMAIN in section 4):

* STORE NAME: ____________
* DOMAIN: ____________ (e.g. brand.se)
* STORE EMAIL: hello@DOMAIN
* FORWARD TO: ____________ (the work inbox – the store's mail is forwarded here)
* OWNER: ____________ (the owner's own address – the store is handed over to this one, NOT the same as FORWARD TO)
* PRODUCT(S): ____________

Do the steps in order, top to bottom. Tick each one.
**The order is not a suggestion** – every section sits where it sits because
the ones above it have to be true first.

## 1. Shopify – create the store
VIDEO:

**The address you type here decides the currency, the language and the home
market.** Shopify takes them from the store address, not from your account.
Type the COMPANY address – never your own, wherever you are sitting.

* Go to shopify.com → Start free trial → sign up with the work Gmail
* When it asks where the business is located, enter the company name, the company address and the company's country (the filled-in copy has the exact line). The country is the field that decides the currency.
* If Shopify asks for a store name and the owner already told you the brand, type it here – that removes a click in section 5. If Shopify names the store itself ("My Store 4"), leave it.
* Stay on the free trial – never pick a plan, never enter any card
  Note: staff invites need a paid plan – the owner is added at hand over.

## 2. Shopify – currency, market, language (do this BEFORE the build)
VIDEO:

These three are the only things on this list **Claude cannot change** —
`shopUpdate` does not exist and REST answers 406 (measured). They also decide
what the build writes: prices, packages, discount codes and the checkout are
all stored in the store's currency. Get them wrong and the build has to be
thrown away and run again — that is why they are checked before the build and
not after it.

* Settings → General → Store currency is the store's own (e.g. SEK)
* Settings → Markets → the home country (e.g. Sweden) is the primary market
* Settings → Languages → the home language (e.g. Swedish) is the default.
  A brand new trial store often says English here. Swedish text still lands
  correctly and the customer view is right – do not publish an empty language,
  just check the default.
* Any of the three wrong? The address went in wrong in section 1. Fix it here,
  then write these exact words to Claude Code: **currency and language are set**
  The discount codes are stored in the store's currency and have to be written
  again, and that sentence is what starts it.

## 3. Shopify – connect Claude Code
VIDEO:

* Go to dev.shopify.com → log in with the work Gmail → Apps → Create app → name it: Fabriken + the store's address start (example: Fabriken y1sj1i)
* The app → Settings → copy the Client ID and the Client secret
* Look at the store's address. It ends in `.myshopify.com`. The part BEFORE that is your TAG – the same thing you typed when you named the app. Write it in CAPITALS and turn `-` into `_`.
  Address `ikf0tu-5e.myshopify.com` → TAG `IKF0TU_5E`
* Open the Claude session's Environment → ADD these 4. Do NOT touch the ones without a tag at the end – those belong to other stores. Name, then `=`, then the value:
  SHOPIFY_SHOP_IKF0TU_5E = ikf0tu-5e.myshopify.com
  SHOPIFY_CLIENT_ID_IKF0TU_5E = the Client ID
  SHOPIFY_CLIENT_SECRET_IKF0TU_5E = the Client secret
  SHOPIFY_STOREFRONT_PASSWORD_IKF0TU_5E = Online Store → Preferences → Password (the store password – Claude needs it to check the pages like a customer sees them)
  (Replace IKF0TU_5E with your own tag.)
  Why the tag: every session on the account shares one Environment. Without it, two builds fight over the same four rows and one of them writes to the wrong store. (Measured 2026-09-10: four days lost to exactly this.)
  You do not have to remember the tag. You write the store ADDRESS in the command, and Claude finds these four rows from it.
* Save the Environment BEFORE you start the session. A session reads the Environment when it starts – saving into a session that is already running changes nothing there.
* Back in the app → Distribution → Custom distribution → enter the store's .myshopify.com address → Generate link → open it → Install app
  Note: keys go ONLY in the Environment – never in chat or email.
  If a Client secret ever ends up in a chat: the app → Settings → Client secret → generate a new one → put the new value in the Environment. The build keeps running on the token it already has, so this never blocks anything.

## 4. Start the build
VIDEO:

* Write /ny-ops + the product link in Claude Code, and add the store address under it
  Example:
  /ny-ops https://baverbutiken.se/products/...
  The store must be ikf0tu-5e.myshopify.com. If the "Connected" line does not match that address: stop and tell me, build nothing.
  That address is how Claude finds the right keys. Leave it out and it may build in another store.
* Claude checks the connection, names the store and builds everything
* Claude tells you the STORE NAME and DOMAIN for the next steps

## 5. Right after the build – the theme and the name
VIDEO:

The theme comes FIRST. Everything you check in sections 6–13 is checked
against what the customer actually sees, and until the theme is published the
customer sees the old one. Publishing works on the free trial – the store
stays behind its password either way (measured: DryTrek 2026-09-09).

* Online Store → Themes → the theme Claude names → Publish
* Settings → General → Store name → STORE NAME → Save
  This is what the order emails, the checkout, the review requests and the Meta page are all named after – so it happens before any of them.
* When Claude says an extra market is ready (e.g. Norway): Settings → Markets → that market → activate its currency (e.g. NOK) → Save

## 6. Domain
VIDEO:

Loopia first – Shopify cannot connect a domain that is not bought, and the
sender-email verification link is only readable once the forwarding works.

* Log in to Loopia
* Buy DOMAIN – registrant must be the company, not you
* Domain → Email → Forwarding → create STORE EMAIL → forward to FORWARD TO
* Send a test email to STORE EMAIL – confirm it arrives
* Shopify → Settings → Domains → Connect existing domain → DOMAIN → follow the DNS steps → Set as primary
* Shopify → Settings → Notifications → Sender email → STORE EMAIL → Save → click the verification link in the inbox
* If Shopify refuses the domain on the free trial: do this section after section 14 instead, and tell Claude – the order in this file gets corrected.

## 7. Judge.me
VIDEO:

* Apps → search "Judge.me" → Install (free plan)
* Judge.me → Settings → Language → the home language (e.g. Swedish)
* Judge.me → Settings → Review Widget → star color: 00B77F
* Judge.me → Settings → Import reviews → Import from apps → Judge.me format → upload the reviews file Claude gives you → Import (one file per product – repeat for each product in the store)
  The upload is yours and stays yours: Judge.me's API overwrites every review date with the moment of import (measured 2026-09-08), the app's own file keeps the original dates.

## 8. The EU withdrawal button (required by law)
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

## 9. Meta
VIDEO:

* business.facebook.com → Settings → Pages → Add → Create a new Page: STORE NAME
* Copy the Page ID → give to Claude Code
* The ad account is always the same for every OPS store: MagiBorsten DK (915422744950975) – never pick another one, never add any card

## 10. Discord
VIDEO:

* Discord → + → Create server: STORE NAME
* Open the invite link Claude Code gives you → Authorize the bot

## 11. Tell Claude the store is ready
VIDEO:

* Write to Claude Code: "Store ready: STORE NAME" – it creates the pixel and builds the Discord channels

## 12. Tracking – WeTracked + the CAPI token
VIDEO:

Before the store is live, not after: a live store without tracking spends ad
money it cannot measure.

* Install the WeTracked app from the Shopify App Store
* WeTracked → paste the pixel ID Claude gives you
* Events Manager → Data sources → STORE NAME → Settings → Conversions API → Generate access token → copy it
* WeTracked → paste the Conversions API token (never send it in chat or email)

## 13. Test the store behind the password (the receipt for 5–12)
VIDEO:

Do it on a phone, as a customer – not in the admin preview. Use the store
password to get in; the store is not public yet, and the checkout cannot be
tested until section 15. Nothing above counts as done until this passes.

* The product page opens and the reviews show their original dates (never "just now")
* Add to cart → the cart upsell shows → the cart adds up
* The prices show in the store's currency
* "Ångra köp" is in the footer and it opens the account page (opens nothing = customer accounts in section 8 is still off)
* The whole page works on a phone – no sideways scrolling, nothing cut off
* Tell Claude what you saw – a screenshot of anything that looks wrong

## 14. Hand over – plan, card, ownership
VIDEO:

Everything above is done on the free trial and costs nothing. From here the
store belongs to the owner, and the last two sections are only possible once
it does (Axel's rule 2026-09-10: Shopify Payments and going live happen on
the owner's own account, never on the work account).

* The owner logs in with the work Gmail, picks the plan and adds his card
* Then: Settings → Users → click the store owner's name → Transfer store ownership → OWNER → enter your password → confirm
* Owner changes the Loopia password afterwards

## 15. Shopify Payments + Klarna (after the hand-over)
VIDEO:

The bank details and the identity check are the owner's, so this cannot be
done before section 14 – and until it is done, no checkout can be tested.

* Settings → Payments → Activate Shopify Payments → fill in the company + bank details Claude gives you
* Same page → Klarna → tick → Save
* Settings → Checkout → Customize → Logo → upload the logo Claude gives you → Save

## 16. Go live and test the checkout
VIDEO:

The storefront password cannot be removed until a plan is picked, so this is
the last thing that happens – and the checkout test can only happen here.

* Online Store → Preferences → remove the storefront password
* Open the real domain on a phone as a customer: add to cart → checkout
* The checkout shows the store's currency and Klarna
* Tell Claude what you saw

## 17. Ads (a NEW session)

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
