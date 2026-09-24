# SOP — UGC creator outreach (for the VA)

You run the whole job: find creators, talk to them, get the videos, get them
paid. Claude writes every Swedish message for you and tells you what it means.
**You decide and you send.** This file tells you what to do and when.

Read with: `TERMS.md` (prices), `VETTING.md` (who is good), `SHEET.md` (where
to save), `TEMPLATES.md` (the messages).

---

## The flow

```
1 Find → 2 Vet → 3 Save in sheet → 4 First message → 5 Negotiate → 6 Deal in writing
→ 7 Send product → 8 Brief → 9 Wait for delivery → 10 Check → 11 Approve → 12 Invoice → 13 Paid
```

## Your daily rhythm (about 1 hour)

1. Open the sheet. Filter **Next action + date** = today or earlier. Do those first.
2. Answer every creator reply from yesterday (use `/ugc reply`).
3. Goal per product: **3 different creators with a deal.** If fewer than 3 are
   in `negotiating` or `deal`: find and contact new ones (`/ugc <product link>`). Max 15 new
   messages per day — more looks like spam.
4. Update the sheet for everything you did. **If it is not in the sheet, it did not happen.**

---

## Step by step

### 1. Find — where to look, in this order

1. **Swedish Facebook groups** — the best channel (Evolve 2026-09-24). Join
   Swedish UGC creator groups, plus groups where the product's buyers hang out
   (boat owners, caravans, gardening, parents). Post the job or search for
   people who film. Claude can't see inside Facebook groups — you do this part,
   and Claude writes your post (`/ugc post <product link>`).
2. **TikTok and Instagram search** — Swedish words for the product and the
   situation (e.g. "båt vinterförvaring", "husvagn tips"). People who already
   film themselves with things.
3. **Marketplaces (Collabstr etc.) last.** They often demand payment up front,
   and we only pay by invoice after approval. Influee: low quality in the
   Nordics. Never move a marketplace deal to DM — that breaks their rules and
   can close the account.

Then run `/ugc <product link>`: Claude reads the product, tells you the target customer (the "avatar"),
searches for creators and suggests 10 with a score.
**Check the sheet first** — Claude cannot see it. Anyone already in the sheet:
skip, or continue the old conversation.

⚠️ **Open every link Claude gives you.** Claude can be wrong and sometimes
suggests profiles that don't exist or belong to someone else. Link doesn't open,
no face, no Swedish → delete it. Never message someone you haven't seen yourself.

**Only products Axel gave you.** Never pick a product yourself.

### 2. Vet
Open each profile. **The creator must be 18 or older** — if they look
younger or say they go to school (grundskola/gymnasiet), skip them. Do the quick filter yourself (`VETTING.md` §1), watch 3
videos, confirm or correct Claude's score. Claude cannot watch videos — **you
are the eyes**. Aim for half men, half women.

### 3. Save
Every creator that passed → a row in **Creators** (`SHEET.md`). Tier A = fits
this product. Tier B = good but for another avatar — save photo, contact route,
avatar tags, do not contact now.

### 4. First message
Claude writes it. **Copy ONLY the box marked 📋 SEND THIS** — never the English
meaning under it. Send it in the channel on their profile. Sheet: status `contacted`, last contact = today, next action =
"follow-up" in 4 days.

### 5. Negotiate — see "Negotiation" below. Paste every reply into `/ugc reply`.

### 6. Deal in writing
When you agree, send the **agreement message** (`TEMPLATES.md` → Agreement)
together with the full agreement text (`AGREEMENT.md`, Claude fills in the
blanks with `/ugc deal`). The creator must answer in writing **with their full
name**: "Jag godkänner avtalet, Anna Svensson". A plain "ja" is not enough.
Save a screenshot of the acceptance in the deal's Drive folder.
Sheet: status `deal`, new row in **Deals**.

### 7. Send the product
1. Ask for name, address and phone in the chat (Template: Address).
2. Shopify admin → Orders → Create order → add the product → discount 100 %
   → shipping to their address → note: `UGC <creator ID>`.
3. Write only the **order number** in Deals. Never the address.
4. Tell them delivery takes **5–10 business days**.
5. **3 business days later:** open the order in Shopify. It must say
   *Fulfilled* with a tracking number. If not → tell Axel the order number.

### 8. Brief
Run `/ugc brief <product link> <creator ID>`. Claude writes a short brief in
Swedish. **It is a framework, not a script** — ideas and do's/don'ts, never
lines to read out. Scripted videos look like ads and die; our best ad was
unscripted.
Send it the same day as the product.

### 9. Wait
Videos due = product arrived + agreed days. Next action = the due date.
Two days before: a friendly reminder (Template: Reminder).

### 10. Check the delivery — all must be YES

**First, save the files.** Creators often send WeTransfer or other links that
**expire after a few days**. Download everything and put it in the Drive folder
the same day — before you check anything.

**You can't hear if the Swedish is right — so Claude checks the words.** The
creator also sends the text they said in each video (it's in the agreement).
Paste that text into `/ugc check <creator>`. Claude checks it for the store
name, prices, promises and anything wrong. You check the pictures.

- [ ] 1 video (or what was agreed)
- [ ] The shot list in the raw footage: 3–5 hook takes, product from several angles, problem/demo, hands close-ups, B-roll
- [ ] **Raw footage included** (all unedited clips)
- [ ] **The spoken text (transcript) for every video** — checked by Claude, OK
- [ ] Vertical 9:16, phone-filmed
- [ ] Product in the first 3 seconds
- [ ] Someone is talking (not only music), no burned-in subtitles
- [ ] No copyrighted music, no other brand's logo in focus
- [ ] The store name is **not** said in the video
- [ ] Nothing that looks like AI or a fake review

Any NO → ask for the redo (Template: Redo). One redo is included.

### 11. Approve
All YES → **you approve.** Put the videos AND the raw footage in the shared
Drive folder "UGC deliveries" (one subfolder per deal: `D001 – creator – product`).
Deals: Approved = date + your name. Unsure about a video → ask Axel before you approve.

### 12. Invoice
Send Template: Approved + invoice request. The invoice goes to Stonebite Ecom
AB (details in `TERMS.md`). When it arrives: forward it to Axel the same day,
with the Drive link to the delivery in the same email.
Deals: Invoice received + Sent to Axel.

**Day 25 after you sent the invoice to Axel:** remind him ("Invoice D00X is due
in 5 days"). Never tell a creator a payment date other than "30 days".

### 13. Paid
Axel tells you when it's paid. Deals: Paid = date. Creators: status `paid`,
Result = fill in when Axel tells you how the ad did.

**After a video: don't decide the next step yourself.** Tell Axel "D00X
delivered, raw footage in Drive". The ads are tested first. If a video wins,
**Axel decides** what to order next (new hooks, new angles, next product or
ongoing monthly work) and you send it. A creator with 2–3 videos and no winning
ad → Result `bad — do not use` for now (keep them in the bank).

---

## Negotiation — our tactic

**Our strongest card is not money. It's repeat work** (Evolve 2026-09-24: "sell the vision"). Bäverbutiken tests new
products all the time, so we need new UGC every month. A creator who delivers
well now gets product after product. Say that early and mean it:

> "We test many new products every month, so we're looking for creators we can
> work with long-term. If the first videos are good, we'd love to come back
> with the next product — and the one after."

Then:

1. **Always start at 1 500 kr per video.** Even with great creators.
2. **Trade future work for price.** "We can't do 3 500 on a first test — but if
   this goes well you'll get several products from us." Most creators prefer
   steady work over one high-priced job.
3. **Give things that cost us little:** they keep the product (say its real
   price), a longer delivery time (up to 21 days), a 4th video at the same price
   per video.
4. **Move once.** 1 500 → 2 000. Stop. Only creators with 14–16 points who said
   yes to long-term work can go to 3 000.
5. **Raw footage and rights are never extra.** Both are included in the price.
   If they want a separate rights fee or a time limit, explain it's how we work
   with every creator; if they insist → walk away (or ask Axel if score 15–16).
6. **Walk away politely.** There are always more creators. Save them in the
   sheet as `too expensive` — their price may drop later, or we get more budget.

---

## Every case — what to do

| What happens | What you do | Sheet status |
|---|---|---|
| No reply after 4 days | One follow-up (Template: Follow-up). Next action +5 days. | `follow-up sent` |
| No reply after the follow-up | Stop. Never a third message. | `no reply` |
| "No thanks" | Thank them (Template: Polite no). Keep them in the bank. | `declined` |
| "What is the product?" / questions | `/ugc reply` — answer, then give the offer. | `negotiating` |
| Asks for more than 1 500 | Negotiation steps 2–4. | `negotiating` |
| Asks for more than 3 000, or top price but score under 14 | Walk-away message. Score 15–16 → ask Axel first. | `too expensive` |
| Wants a separate "usage rights" or "whitelisting" fee | Explain rights are included, that's our standard. Insists → walk away. | `too expensive` |
| Wants a time limit on the rights (e.g. 3 months) | Same as above. | `too expensive` |
| Doesn't want to give raw footage | Explain it's included for every creator. Insists → walk away. | `declined` |
| Wants payment before delivery (full or part) | No. We pay by invoice after approval. Insists → walk away. | `declined` |
| Has no company / can't invoice | Suggest an invoicing service (`TERMS.md`). | unchanged |
| Wants to sign their own contract | Ask Axel. Don't sign anything. | `negotiating` |
| Wants a commission / % of sales | Ask Axel. | `negotiating` |
| Asks "what happens after this?" / wants a retainer | "If your video works in our ads, we come back with more work." Never a number — tell Axel. | unchanged |
| Accepts with only "ja" | Ask them to write "Jag godkänner avtalet" + full name. | `negotiating` |
| Wants to post the video on their own account too | Fine, no exclusivity — but the post must be marked as advertising ("Reklam" or "i samarbete med …"), Swedish law requires it. | unchanged |
| Says yes | Agreement message → wait for written "ja". | `deal` |
| Product lost / not arrived after 10 business days | Check the Shopify order tracking, tell the creator, ask Axel before sending a new one. | `working` |
| Product arrived broken | Ask for a photo, create a new 0 kr order, new due date. | `working` |
| Videos not delivered on the due date | Reminder same day. +3 days: second reminder. +7 days: ask Axel. | `working` |
| Delivery misses the checklist | Redo template, specific about what to fix. | `delivered` |
| Second delivery still bad | Ask Axel. Don't promise payment. | `delivered` |
| Delivery OK | You approve → files to Drive → invoice request. | `approved` |
| Creator rude, pushy or strange | Stop answering. Tell Axel. | `do not use` |
| Creator says they are under 18 | Thank them, stop. We only work with adults. | `do not use` |
| Creator asks to be deleted from our list | Delete their row the same day. | row deleted |
| Creator sent no transcript | Ask for it (Template: Transcript). No transcript = not complete. | `delivered` |
| Order not *Fulfilled* 3 business days after you created it | Tell Axel the order number. Tell the creator it's a bit delayed. | `working` |
| Creator says the product is bad / not as described | Don't argue. Thank them, ask Axel. Don't let them film something negative for us. | `working` |
| Anything not in this table | Ask Axel before you answer the creator. | unchanged |

## Never

- Never pay anyone or promise a payment date other than "invoice, 30 days".
- Never offer anything outside `TERMS.md`.
- Never invent numbers (sales, views, "our last video got 1 million").
- Never write the store name into a script.
- Never contact the same creator twice from zero — check the sheet.
- Never put addresses, phone numbers or ID numbers in the sheet or in Claude files.
- Never send the English meaning to a creator — only the 📋 SEND THIS box.
- Never work with anyone under 18.
