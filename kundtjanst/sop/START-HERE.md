# Chargeback SOPs — START HERE

This folder is the complete playbook for handling a payment dispute on any of our
stores. It works the same way on every brand: same Shopify backend, same dispute
flow, same tracking setup. Only the values in one config block change per store
(see Part 2).

**Two minutes is the target.** Find your reason code below, open that file, follow
the table at the top of it. Do not read this whole folder.

---

# PART 1 — For the support VA

## 1. Route the dispute (start here, every time)

Shopify shows the reason on the dispute itself:
**Shopify admin → Settings → Payments → Disputes → open the dispute → "Reason".**

| The dispute reason says | Open this file |
|---|---|
| `Product not received` / "item never arrived" | **10-NOT-RECEIVED.md** |
| `Product unacceptable` / "not as described", damaged, wrong item, poor quality | **11-UNACCEPTABLE.md** |
| `Credit not processed` / "they promised a refund and never paid it" | **12-CREDIT-NOT-PROCESSED.md** |
| `Fraudulent` or `Unrecognized` / "I did not make this purchase" | **13-FRAUD-UNRECOGNIZED.md** |
| `Duplicate`, `Subscription canceled`, `General`, or anything not listed above | **14-DUPLICATE-SUBSCRIPTION-OTHER.md** |
| Any reason, **and we have no email history with this customer at all** | read the reason file first, then **20-NO-CONTACT.md** |

Supporting files, used from inside the reason files — do not start here:

| File | Use it for |
|---|---|
| **00-MASTER.md** | The first hour: what to do the moment a dispute lands, before you know anything |
| **30-EMAIL-TEMPLATES.md** | The actual emails to send the customer. Copy-paste, fill the placeholders |
| **40-EVIDENCE-PACK.md** | What to attach in Shopify and exactly where each item is found |
| **50-PREVENTION.md** | After the dispute: what to change so the next one does not happen |
| **60-ESCALATION.md** | What you decide yourself, what you hand to the owner, and how you write it |
| `orders/` | One decision sheet per order we have handled — read the ones like yours |

## 2. The four rules that matter most

> **RULE 1 — A CHARGEBACK COMES BEFORE AN INQUIRY, ALWAYS.**
> An **inquiry** is the bank asking a question; the money is still ours and we can
> answer. A **chargeback** means the money has already been pulled out of the
> account and losing is final. Handle every chargeback in the alarm before you
> touch a single inquiry. *(Measured on one store's 50 disputes, 2026-09-20: 29 of
> 29 decided inquiries were won, 100%. Chargebacks: 1 won out of 4. Every loss we
> have ever had was a chargeback.)*
> An unanswered inquiry is not lost on the spot — it **escalates into a
> chargeback**, and that is the real cost of ignoring one.

> **RULE 2 — CHECK THE TRACKING BEFORE YOU DECIDE ANYTHING.**
> For "product not received" the tracking decides the case on its own, and for
> every other reason it decides whether the complaint is even possible yet. Never
> open an email template before you have looked at the scan. One command gives you
> tracking, refunds, address match and order facts for a dispute:
> ```
> node kundtjanst/tvistfakta.mjs <order number> --brand <brand id>
> node kundtjanst/tvistfakta.mjs <order number> --brand <brand id> --registrera
> ```
> Use `--registrera` when it says the parcel is not registered with the tracking
> provider. Old parcels are not tracked automatically — measured 2026-09-20, all
> twelve dispute orders on one store were older than the tracking routine's
> 14-day window and had to be registered before any scan could be read.
> On stores with their own tracking page (`{{TRACKING_PAGE}}`), a *recent* parcel
> needs no command at all: the hourly routine writes the scans into the order's
> timeline in Shopify admin, and the page shows the whole chain. That page is
> also what the customer gets — with the store parcel number, never the carrier
> number (00-MASTER.md §6).

> **RULE 3 — SUBMIT LAST. SAVE TODAY, LET SHOPIFY SEND ON THE DUE DATE.**
> Never click **Submit now** — that locks the response. Press **Save** and keep
> editing until the due date. For *"product not received"* the evidence gets
> better while you wait: a parcel takes about 10 days, the evidence window is up
> to 21, so a dispute with **no delivery scan today usually has one by the due
> date**. Submit on day 1 and you submit our own weakness.
> Two limits: **the customer email never waits** (send it today — a customer who
> gets an answer often withdraws the dispute), and **a stuck parcel never gets
> better** (`InfoReceived`, `NotFound`, `Expired` → refund or accept now, before
> an inquiry escalates into a chargeback).
> *(The owner's own practice, written in 2026-09-22.)*

> **RULE 4 — FIGHTING A DISPUTE WE DESERVE TO LOSE IS WORSE THAN REFUNDING IT.**
> If we cannot show a delivery scan, or we really did promise a refund, or the
> fault in the product is real — **refund and close it**. It is faster, it costs
> less than losing, and it keeps the store's dispute rate down. Every reason file
> tells you plainly where that line is. Submitting weak evidence "just in case" is
> not free.

When the four rules do not give you an answer: choose **ESCALATE**, write what you
found in the decision sheet, and hand it to the owner. Guessing on a dispute costs
real money; asking costs one message. **60-ESCALATION.md** says exactly which
cases those are, and what the message looks like — including the one rule that
beats all of them: *a deadline never waits for an answer.*

> **THE RETURN ADDRESS IS NOT PUBLIC.** On stores where
> `returadress_pa_forfragan` is `true`, {{RETURN_ADDRESS}} is nowhere on the site
> — the customer has to ask us for it, and that is deliberate: it keeps returns
> down. It only works if you answer **within {{FIRST_REPLY_TARGET_HOURS}}
> hours**. A customer who asks for a return address and hears nothing does not
> give up; they dispute, and a dispute costs far more than the return would have.
> Treat "how do I return this?" as the most urgent mail in the inbox, not the
> least. *(Example, 2026-09-20: order #5122 — a customer wrote about damaged
> straps, the mail was missed, and it became a dispute.)*

## 3. Your daily routine

The Discord alarm in the store's `#customer-service` channel (every day, 07:00,
from `/tvistkoll`) tells you **what is due**. This folder is **what you do about
it**. The alarm lists chargebacks first, then the nearest deadline.

1. **Open the alarm.** Every bullet is one dispute: order number, chargeback or
   inquiry, reason, amount, due date, days left.
2. **Take the chargebacks first**, then anything "due TODAY" or "OVERDUE", then
   the rest. Never work top-to-bottom by order number.
3. **Get the facts** for that order: `node kundtjanst/tvistfakta.mjs <order> --brand <id>`.
   It prints the tracking status, refunds already paid, whether the billing
   address matches the shipping address, and a suggested decision.
4. **Open the reason file** from the routing table above and follow its decision
   table. The file, not the tool, is what you follow — the tool only supplies facts.
5. **Act:** FIGHT (build the pack in 40-EVIDENCE-PACK.md, then **Save** in Shopify
   — never *Submit now*), ⏳ WAIT (build and Save it anyway, and re-check the
   tracking the day before the due date), REFUND (refund in Shopify and close),
   or ESCALATE (hand to the owner, today, not tomorrow).
6. **Email the customer** when the reason file says to, using 30-EMAIL-TEMPLATES.md.
   A customer who gets an answer often withdraws the dispute themselves.
7. **Write the decision sheet** in `orders/` — one short file per order: what the
   facts were, what you decided, why. That is how the next VA learns, and how we
   know what actually works.
8. **Never let a due date pass.** Save the response the same day you get the
   dispute, so Shopify sends it even if you are ill — then improve it until the
   date. A deadline that passes is the one way to lose a case we could have won.

Nothing in this folder requires the owner's approval. Escalate a judgment call, not
the routine work.

---

# PART 2 — Adding a new store (owner / onboarder)

Nothing in the procedure text names a brand, a domain, a product or an email
address. Every store-specific value lives in **one config block**, and the VA fills
the `{{PLACEHOLDERS}}` from that block. Making this SOP set live for a new brand is
filling in ten lines and verifying five things.

## 1. Where the config block goes

| Store type | File |
|---|---|
| Built by the factory (has `factory/butiker/<id>.yaml`) | Add the `tvister:` block to `kundtjanst/brands/<id>.yaml` (same `<id>`). Name, support email and shop are already read from the factory file |
| Any other store | Copy `kundtjanst/brand-mall.yaml` to `kundtjanst/brands/<id>.yaml` and fill it |

`<id>` is short, lowercase, no accented characters. It is also what the VA types
after `--brand`.

Secrets never go in the yaml. They live in Environments as
`KUNDTJANST_MAIL_PASS_<ID>`, `SHOPIFY_ADMIN_TOKEN_<ID>` (or
`SHOPIFY_CLIENT_ID_<ID>` + `SHOPIFY_CLIENT_SECRET_<ID>`), `DISCORD_BOT_TOKEN`.

## 2. The placeholders

| Placeholder | What it means | Comes from |
|---|---|---|
| `{{STORE_NAME}}` | The brand name the customer recognises, used in every email signature | `brand.namn` |
| `{{STORE_DOMAIN}}` | Public storefront domain the customer bought from, e.g. in evidence and email footers | `brand.doman` (add the line); factory stores: `factory/butiker/<id>.yaml` → `doman` |
| `{{SUPPORT_EMAIL}}` | The mailbox the VA answers from and that customers reply to | `brand.supportmail` |
| `{{CURRENCY}}` | The store's currency, so amounts in emails and evidence are never ambiguous | `brand.valuta` |
| `{{RETURN_ADDRESS}}` | The full postal address a customer is told to return goods to | `tvister.returadress` |
| `{{RETURN_WINDOW_DAYS}}` | The return/cancellation window published on the store's own policy page | `tvister.returfonster_dagar` |
| `{{POLICY_URL}}` | The policy page the customer accepted at checkout — attached as evidence | `tvister.policy_url` |
| `{{BILLING_DESCRIPTOR}}` | The text that appears on the customer's bank statement. A descriptor that does not look like the store is a common cause of "unrecognized" disputes | `tvister.billing_descriptor` |
| `{{FIGHT_THRESHOLD}}` | Below this amount it is cheaper to refund than to spend VA time fighting. `0` = always fight | `tvister.strid_lonar_sig_over` |
| `{{STORE_ID}}` | The `<id>` the VA types in commands (`--brand <id>`) | the filename |
| `{{TRACKING_PAGE}}` | The store's own tracking page (`/pages/spara`, `/pages/spor`, `/pages/seuranta` …) — what customers get in every shipping email, and the VA's zero-click read. Empty = the store has no page yet; the 17TRACK route applies | `tvister.sparningssida` (same value as `sparning/butiker.json` → url + handle) |
| `{{PARCEL_PREFIX}}` | The store parcel number prefix (`BB-`, `CS-` …). The parcel number quoted to customers is prefix + 8 characters, computed from the carrier number; the carrier number itself is never sent to a customer | `tvister.paketprefix` (same as `sparning/butiker.json` → prefix) |

EXAMPLE ONLY — a filled block for a fictional Swedish store. Do not copy the values,
only the shape:

```yaml
brand:
  namn: "Example Store"            # {{STORE_NAME}}
  doman: "example.se"              # {{STORE_DOMAIN}}
  supportmail: "support@example.se" # {{SUPPORT_EMAIL}}
  shop: "xxxxxx-yy.myshopify.com"
  land: SE
  valuta: SEK                      # {{CURRENCY}}
  aktiv: true

tvister:
  returadress: "Example Store Returns, Gatan 1, 111 22 Stockholm, Sweden"  # {{RETURN_ADDRESS}}
  returfonster_dagar: 14           # {{RETURN_WINDOW_DAYS}}
  policy_url: "https://example.se/policies/refund-policy"                  # {{POLICY_URL}}
  billing_descriptor: "EXAMPLE STORE"                                      # {{BILLING_DESCRIPTOR}}
  strid_lonar_sig_over: 0          # {{FIGHT_THRESHOLD}}
```

A US or Norwegian store fills the same ten lines with its own values — the window,
the address format and the currency change, the procedure does not.

## 3. Verify per store before the VA starts

These are the five things that silently break the SOPs if they are wrong. Check
each one in the store's own admin, do not assume it from another brand.

1. **Disputes are readable.** Run `node kundtjanst/tvistkoll.mjs --brand <id> --torr`.
   A `403` means the Shopify app is missing the `read_shopify_payments_disputes`
   scope; "not connected" means the key is missing in Environments. A store whose
   disputes cannot be read reports as UNKNOWN, never as zero.
2. **Order facts are readable.** Run `node kundtjanst/tvistfakta.mjs --alla --brand <id>`.
   It must print tracking numbers, refunds and the address match. If tracking comes
   back empty for every order, fulfilment is not writing tracking numbers — fix that
   before anything else, because without it we cannot win a "not received" case.
3. **VERIFY IN SHOPIFY ADMIN: the billing descriptor.**
   Settings → Payments → Customer billing statement. Copy it into
   `billing_descriptor` exactly as written there.
4. **VERIFY ON THE STORE ITSELF: the return window and the policy page.**
   The window in `returfonster_dagar` must match what the store's own policy page
   says, and `policy_url` must open that page. The customer agreed to that page,
   not to our internal rule.
5. **VERIFY IN SHOPIFY ADMIN: the evidence deadline and what the form asks for.**
   Settings → Payments → Disputes → open one dispute. The due date shown there is
   the only deadline we act on, and the upload fields there are the definition of a
   complete evidence pack. **We do not state card-network rules, fees or thresholds
   from memory anywhere in these SOPs** — if a rule matters, look at this screen.

Also set up: the Discord channel the alarm posts in (`discord.kanal`, default
`customer-service`), and make sure `/tvistkoll` runs daily for the new brand.

## 4. Onboarding checklist

- [ ] `<id>` chosen; `kundtjanst/brands/<id>.yaml` exists (copied from `brand-mall.yaml` if not a factory store)
- [ ] `brand:` filled — name, domain, support email, country, currency
- [ ] `tvister:` filled — return address, return window, policy URL, billing descriptor, fight threshold
- [ ] Shopify keys in Environments, app has `read_orders` + `read_shopify_payments_disputes`
- [ ] `node kundtjanst/run.mjs --kolla` shows the brand with no missing keys
- [ ] `node kundtjanst/tvistkoll.mjs --brand <id> --torr` reads disputes without an error
- [ ] `node kundtjanst/tvistfakta.mjs --alla --brand <id>` prints tracking and refunds
- [ ] Billing descriptor verified in Shopify admin and written into the config
- [ ] Return window and policy URL verified on the store's own policy page
- [ ] Discord channel exists and the daily alarm posts there
- [ ] `orders/` folder created for this brand's decision sheets
- [ ] The VA has read Part 1 of this file and the two most common reason files (10 and 11)

When all boxes are ticked, the VA can work this store without asking the owner
anything that is not a genuine judgment call.
