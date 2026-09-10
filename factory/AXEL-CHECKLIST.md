# The owner's checklist — one-time setup, then one job per store

One-time things. Done once = never again.
After that the only job per store is: pick the product — and take ownership
at the hand-over. Instruction books are in English (Axel's rule 2026-09-10).

## 1. Invite the employee
- [ ] Give them the login to the Claude account (Axel's decision 2026-09-07 —
      a shared account instead of a seat of their own; the objection that the
      account reaches Meta and everything else was raised and overruled)
- [ ] Loopia → save the company card → give them the login

## 1b. The cloud session's keys (once)
- [x] **KIE_API_KEY**, **DISCORD_BOT_TOKEN** and **META_ACCESS_TOKEN** are in
      the cloud session's environment variables (Axel's word 2026-09-08)
      (the Shopify keys are the clicker's — added per store, checklist
      section 3)

## 2. Meta ready
- [ ] Business Manager → **Payments** → add the company card
- [ ] Invite the employee with **Full access** (everything ON) — Axel's
      decision 2026-09-07: they may see payments; then they create pages in
      BM themselves and Axel's approval click per store disappears
- [x] The ad account is chosen: **MagiBorsten DK** 915422744950975 — every
      OPS store, Swedish and Norwegian, runs on it (your decision 2026-09-07)
- [ ] META_ACCESS_TOKEN is fetched by the EMPLOYEE, not Axel (Axel's word
      2026-09-07: "I don't want to press buttons") — with Full access in BM:
      System user → Generate token → ads_management + business_management →
      paste into Claude. Claude guides them.

## 3. Per new store (your only recurring job)
- [ ] Say which product: paste the product link into Claude with **/ny-ops**
      (the clicker creates the store on a free trial from the work Gmail —
      staff invites do not work on a trial and are not needed)
- [ ] Give the company and bank details for Shopify Payments
- [ ] At the hand-over: log in with the work Gmail, pick the plan, add the
      card and take ownership (checklist section 13)
- [ ] After the hand-over: Shopify Payments + Klarna, remove the store
      password, test the checkout on a phone (sections 14–15)
- [ ] When the store is live and the ads are built: write **"Launch: <store
      name>"** in the ads session. That is what switches the ads on.

The clicker and the factory do everything else.
Their list: `factory/VA-CHECKLIST.md`. The map: `factory/SA-FUNKAR-DET.md`.
