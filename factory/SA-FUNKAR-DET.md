# How it works — the whole OPS flow, explained simply

Written 2026-09-10 from Axel's own description, corrected the same day from
his feedback point by point. This is the MAP. The details live in
`PROCESS.md` (how the factory builds) and `VA-CHECKLIST.md` (every click, in
the right order). If the map disagrees with those files, the map is wrong —
fix the map. Instruction books are in English (Axel's rule 2026-09-10).

Three workers:
- **The factory** = Claude. Builds the store, the ads, the pixel, the Discord channels.
- **The clicker** = Axel, or the next employee. Does what only a human may do
  (create accounts, pay, click "Authorize").
- **Skalningskungen** = the robot that manages budgets and raises the alarm.

⚙️ = the factory does it · 🖐 = a human clicks · ⚠️ = not built yet

---

## Step 1 — Skalningskungen raises the alarm

⚙️ Skalningskungen does only two things: **kills, scales and changes budgets**
on the ads (Bäverbutiken and the OPS stores), and **raises the alarm** when a
product should get its own store — a test that is going very well, or a
product without its own store that is doing well. The alarm is ONE message in
the Discord channel for start signals, pinging Axel: **"KLAR FÖR OPS:
<product>"** + the numbers + the command to paste. No briefs, no Notion
pages, no store. The prompt: `.claude/commands/skalningskungen.md`. The alarm:
`node factory/startskott.mjs --jobb <file> --discord`.

⚙️ The bot handles Discord itself: finds the Bäverbutiken server, creates the
channel `#ops-startskott` if it is missing, and pings the server owner.
Tested 2026-09-10.

## Step 2 — The clicker creates an empty store (3 clicks before the build)

🖐 Sections 1–3 of the checklist (the template exists, follow it):
1. Create the store on shopify.com (free trial, the work Gmail, the
   **company** address — the address decides currency, language and country).
2. Check currency, market, language. The factory **cannot** change them later.
3. Create the app on dev.shopify.com, put the four keys in the session's
   Environment, **save before the session starts**, install the app.

## Step 3 — The build starts

🖐 Open a new session. Rename it to the product's name. Write:
```
/ny-ops <link to the product on bäverbutiken.se>
The store must be <address>.myshopify.com
```
⚙️ The factory connects ("Connected ✓"), fetches the product, invents a
brand + domain and shows **three logos**.
🖐 The person running it picks a logo. ⚙️ The choice is logged in
`factory/LOGGA-FEEDBACK.md` (`node factory/logga-feedback.mjs <store> <a|b|c>`),
and the next store's three logos are built on what has been chosen so far —
the variant nobody picks gets replaced. That is how the logos get better with
every store.

## Step 4 — The factory builds the whole store

⚙️ About an hour. Theme, product page, bundles, bonus, home page, policies,
reviews, Norwegian translation. Everything is saved in the repo. When the
build is done the clicker gets **three things in the chat**:
- store name, domain, email address
- **the Judge.me file** as an attachment (Swedish + Norwegian reviews with the right dates)
- **the Discord link** to let the bot in

## Step 5 — The clicker does the manual steps (free, before the hand-over)

🖐 Sections 5–12 of the checklist, in that order. The reminders (install the
Judge.me app, WeTracked and so on) live in Axel's manual SOP.
- Publish the theme + change the store name (otherwise it is called "My Store 5")
- Buy the domain at Loopia, email forwarding, connect the domain in Shopify
- Judge.me: install, upload the file from the chat
- The withdrawal button: four switches in Shopify (law since 19 June)
- Create **the Meta page** and **the Discord server** — one visit, both at once
- Write **"Store ready: <name>"** → ⚙️ the factory creates the pixel + the Discord channels
- WeTracked: paste the pixel ID + the CAPI token
- Test the store on a phone behind the password

## Step 6 — The ads are copied (new session)

🖐 Open a **new** session and write `/ny-annonser <store-id> <link>`.
⚙️ The factory copies **the whole Bäverbutiken campaign — every single ad**,
Swedish and Norwegian, into two campaigns in MagiBorsten DK. It listens to
and reads every ad. If the ad says "Bäverbutiken", a wrong price or wrong
terms, **only that surface** is changed. If it says nothing wrong it is copied
untouched — no new voiceover, no new video. Only the link is repointed.
**Everything PAUSED.**

## Step 7 — The clicker tells Axel

🖐 "The store and the ads are ready."

## Step 8 — Axel's list

🖐 Sections 13–15 of the checklist:
1. Log in with the work Gmail → pick the plan → add the card.
2. Transfer the store to axelodhner.business@gmail.com. Change the Loopia password.
3. Shopify Payments + Klarna (must be the owner's).
4. Remove the store password → the store is live.
5. Test the checkout on a phone: SEK and Klarna show.

## Step 9 — Launch

🖐 Axel writes **"Launch: <name>"** in the ads session.
⚙️ The factory checks that the store is live (no password) and that the pixel
has fired, then sets the campaigns ACTIVE and reads the status back. Nobody
else sets anything ACTIVE. From here Skalningskungen manages the budgets
every third day.

---

## What is still manual, and why

| Click | Can it be automated? |
|---|---|
| Create the store, the app, the keys | No — needs a login and consent |
| Currency, language, market, store name | No — Shopify's API cannot (measured, 406) |
| Publish the theme | **Yes** — the API can (measured), the code just does not yet |
| Domain purchase, DNS, sender email | No — Loopia + verification email |
| The Judge.me upload | No — the API destroys the review dates |
| The withdrawal button's four switches | No — Shopify settings without an API |
| The Meta page, the Discord server | No — but the factory does everything INSIDE them |
| WeTracked + CAPI token | No — the token must never pass through the chat |
| Plan, card, ownership, Payments | No — money and identity, always the owner's |
| The start signal in Discord | Yes — built and tested 2026-09-10, the bot creates the channel itself |
| "Launch: <name>" | Yes — in `/ny-annonser` step 11b since 2026-09-10 |

## Three things that are easy to mix up

- **Two ad accounts with almost the same name.** The OPS stores ALWAYS run on
  MagiBorsten DK `915422744950975`. MagiBorsten `1867947880635861` is
  Bäverbutiken. The wrong account costs real money.
- **"Store ready" and "Launch" are two different words.** Store ready = pixel +
  Discord channels. Launch = the ads start spending.
- **Green in the factory is not a green store.** The cart and the mobile view
  can only be tested by a human on a phone. Before the ads are switched on.
