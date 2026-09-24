# /ugc-va – UGC outreach, run by the VA

Argument: `$ARGUMENTS` — a mode, then its input:

| Command | What it does |
|---|---|
| `/ugc-va find <product-id> [n]` | Find n (default 10) new Swedish creators for the product + write the first messages |
| `/ugc-va reply <#> <paste the creator's message>` | Translate the reply, suggest the next message (Swedish + English meaning) |
| `/ugc-va deal <#> <price> <videos>` | Creator said yes → final written agreement + brief + deadlines |
| `/ugc-va sent <#> <shopify order no.>` | Product sent → pipeline + delivery deadline |
| `/ugc-va delivered <#> <link to files>` | Quality check with the VA → payment request to Axel |
| `/ugc-va status` | The whole pipeline, nearest deadline first, 🔴 late |

Example: `/ugc-va reply 4 Hej! Mitt pris är 3500 kr per video.`

**Who runs this:** the VA, in her own Claude account, in this repo.
**Talk to her in English.** Messages to creators are in **Swedish** — always
show the English meaning under every Swedish message so she knows what she sends.
Short answers. Her actions last, numbered.

## Before anything (stop without these)

1. `git pull origin main` — the pipeline must be fresh, someone else may have updated it.
2. Read `factory/ugc/VA-SOP.md` (the rules), `factory/ugc/villkor.md` (the
   only source of prices and terms), `factory/ugc/pipeline.md` and
   `factory/ugc/kreatorer.md` (never contact the same creator twice).
3. For `find` and `deal`: the product must be in the table **"Produkter som får
   UGC just nu"** in `villkor.md`. Not there ⇒ STOP: "This product is not open
   for UGC. Ask Axel." Also stop if the product already has its max number of
   creators in `agreed` or later.
4. Read the product: `products/<id>/dna.md` if it exists, or
   `factory/produkter/<id>.yaml`. Read the **price live from the product page**
   (WebFetch) — never from memory.

## find

1. Read `factory/ugc/vetting-framework.md` §1. Search with WebSearch (Collabstr,
   Sprww, Vocast, Influee public profiles, TikTok/Instagram bios; words like
   "UGC kreatör Sverige" + the product's niche and target group from the DNA).
2. Keep only creators that pass the quick filter. Aim for half men, half women;
   report the split honestly.
3. Only **public** contact routes (bio email, platform chat, contact form).
   Never guess an email.
4. Write one first message per creator (Swedish, max ~120 words, sender = the
   store name from `villkor.md`, one real thing they made, terms EXACTLY from
   `villkor.md`, start offer 1 500 kr/video). English meaning under each.
5. Add rows to `pipeline.md` with status `new`. Put the messages in
   `factory/ugc/utskick/<date>-<product-id>.md`.
6. Show the VA a copy-paste list: channel link → message. She sends them
   herself (DMs cannot be sent from here). Max 20 per day.
7. Tell her: "When sent, run `/ugc-va status` or reply — I'll mark them contacted."
   If she confirms they are sent, set `contacted <date>`.

## reply

1. Translate the creator's message to English for the VA, one line summary on top
   ("She wants 3 500 kr/video" / "He asks what the product is").
2. Decide where it is on the negotiation ladder in `VA-SOP.md` and write
   **one** suggested answer (Swedish + English meaning). If there is a real
   choice, give max two options, A and B, and say which you recommend.
3. If the request is outside the VA's limits (table in `VA-SOP.md`): say so in
   one line, and write the message she sends Axel instead (Swedish, short:
   creator, link, what they ask, your recommendation).
4. Update the row: status + `Last action (date)` + a short note.

## deal

1. Check price × videos is within `villkor.md`. Outside ⇒ stop, as above.
2. Write the final agreement message (Swedish + English): price per video,
   number of videos, product included, rights (ads, all channels, no time
   limit), delivery within 14 days after the product arrives (or what was
   agreed, max 21), Swish within 7 days after approved delivery, one redo
   included, no exclusivity. Ends with "Svara ja så kör vi" — no yes = no deal.
3. Write the creator brief. Structure/strategy by you from `dna.md` (angle,
   hook, what to show first); **the Swedish lines the creator says are written
   by a subagent with `model: "sonnet"`** fed with DNA + hook + `docs/copy-regler.md`
   (CLAUDE.md rule 6). Store name never in the script. Save to
   `factory/ugc/briefer/<date>-<product-id>-<#>.md`.
4. Tell the VA to ask for the address in the chat and create the 0 kr order
   (steps in `VA-SOP.md` → Sending the product). Status `agreed`.

## sent

Status `product sent`, write the order number (never the address). Deadline for
videos = today + 10 business days shipping + agreed filming days. Show it.

## delivered

1. Go through the delivery checklist in `VA-SOP.md` with the VA, point by point.
   You cannot watch video — ask her each point as a yes/no question.
2. Any no ⇒ write the polite redo message (Swedish + English). Status stays
   `delivered`, note "redo asked".
3. All yes ⇒ status `approved`, and write the payment request for Axel in
   **Swedish**: creator, product, number of videos, amount (price × videos),
   Swish-number "ask the creator in the chat", link to the files, date.
   The VA sends it to Axel. When Axel confirms payment, set `paid`.
4. Tell the VA to put the files in the product's Notion creative hub so the
   editors can cut them.

## status

Table of every row not `paid`/`no`/`walked away`, nearest deadline first.
🔴 = past deadline, or `contacted` for more than 5 days with no answer
(suggest one friendly follow-up, then give up).

## After every mode: save

`git add factory/ugc/ && git commit -m "ugc-va <mode> <product>: <what changed>" && git pull --rebase origin main && git push origin main`
The pipeline IS the memory — if the push fails, say so as the first line of the answer.

## DEFINITION OF DONE
- [ ] Pulled `main` first, read VA-SOP + villkor + pipeline + kreatorer
- [ ] Product is open for UGC in `villkor.md` (find/deal)
- [ ] No creator contacted twice
- [ ] Every Swedish message has its English meaning
- [ ] No price, term or promise outside `villkor.md`; anything outside went to Axel
- [ ] No address/phone/Swish number written to the repo
- [ ] `pipeline.md` updated, committed and pushed to `main`
- [ ] The VA's next actions last, numbered
