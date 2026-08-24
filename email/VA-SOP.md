# SOP: Install email templates in all five Shopify stores

**For:** VA
**Time:** ~20 min per store, ~100 min total
**You need:** Shopify admin access (staff account) to all five stores

## Tool

All templates with copy buttons:
https://claude.ai/code/artifact/5f05aa05-ff5f-4b92-8238-5552b10b7299

Open it in one browser tab. Shopify in another. Switch between them.

## Stores

| Store | Domain |
|---|---|
| SE | baverbutiken.se |
| DK | bæverbutiken.dk |
| NO | beverbutikken.no |
| FI | majavakauppa.fi |
| UK | beavershop.co.uk |

Each store has its own templates in its own language. **Pick the matching
tab in the tool.** Never paste Swedish templates into the Danish store.

---

## PART 1 — Five notification templates per store

Repeat for each of the five templates listed below.

1. Shopify admin → **Settings** → **Notifications** → **Customer notifications**
2. Click the notification (see table below)
3. Click **Edit code**
4. Click inside the large code box
5. Press **Ctrl+A** (Windows) / **Cmd+A** (Mac) — everything highlights
6. Press **Delete** — box is now empty
7. In the tool: select the store tab → find the matching card → click **Copy code**
8. Back in Shopify: click in the empty box → press **Ctrl+V** / **Cmd+V**
9. Scroll up to the **Subject** field → delete what is there → paste the
   subject line from the tool card (it has its own copy button)
10. Click **Send test notification** → check the inbox → does it look right?
11. Click **Save**

### The five templates

| # | Notification in Shopify | Card in the tool |
|---|---|---|
| 1 | Order confirmation | Orderbekräftelse |
| 2 | Shipping confirmation | Fraktbekräftelse |
| 3 | Out for delivery | Ute för leverans |
| 4 | Delivered | Levererad |
| 5 | Order cancelled | Order annullerad |

### ⚠️ Extra step for #3 and #4

"Out for delivery" and "Delivered" are **switched off by default**.
On the same page there is a toggle — **switch it on**. Without this they
are never sent.

---

## PART 2 — Two automations per store

These live in a **different place** — not under Notifications.

### Drip email ("On its way")

1. **Marketing** → **Automations**
2. Click **Create automation** → choose **Create your own**
3. Trigger: **Order fulfilled**
4. Add step: **Wait** → set **4 days**
5. Add step: **Send email**
6. In the email editor: add a **Custom HTML** block
7. Copy from the tool card `Drip "Snart framme"` → paste into the block
8. Set the subject line from the card
9. Send a test → click **Activate**

### Review email

Same steps, but:
- **Wait: 14 days** (not 4)
- Copy from the card **Recensionsmejl**

---

## Order of work

1. Do the **Swedish store completely first** (Part 1 + Part 2).
2. Message Axel: "SE done."
3. Wait for his OK before doing the other four.

This way, if a template needs fixing, it is fixed once — not five times.

---

## Report back per store

Copy this and fill it in:

```
Store: [SE/DK/NO/FI/UK]
Order confirmation:    done / problem: ___
Shipping confirmation: done / problem: ___
Out for delivery:      done + toggle ON / problem: ___
Delivered:             done + toggle ON / problem: ___
Order cancelled:       done / problem: ___
Drip automation:       done / problem: ___
Review automation:     done / problem: ___
Test emails looked:    fine / wrong: ___
```

---

## Do NOT do these

- Do **not** edit the template text. Paste exactly what the tool gives you.
- Do **not** paste one store's template into another store.
- Do **not** activate an automation before sending yourself a test email.
- If anything looks broken or you are unsure — **stop and ask Axel.**
  A wrong template goes out to real customers.
