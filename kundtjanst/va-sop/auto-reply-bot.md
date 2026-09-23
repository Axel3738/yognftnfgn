# Auto-reply bot — what it does, and what you do

**Use this when** you find a draft in Drafts you did not write, a flagged email you
have not touched, a customer thread that already has a reply from us that nobody on
the team remembers writing, or a folder called VA-PRIO with emails in it.

The bot runs on every store's support mailbox, the same way everywhere. Which
mode it is in on your store, and the name it signs with, is on **Store facts**.

---

## 1. What it is

A small program, not a person and not a chat AI. It reads the new customer emails
every minute, around the clock, and sorts each one into one of three buckets with fixed rules. It writes
its replies from templates a human wrote, and the only things it fills in are facts
it looked up itself: the order number, whether the order has shipped, the latest
carrier scan, the store's tracking link and parcel number.

It never invents a date, a promise or a number. If it cannot find the fact, it does
not answer.

| Bucket | The customer wrote | What the bot does |
|---|---|---|
| **Simple** | Where is my order? When will it arrive? Change my address (before shipping). Opening hours. Company details. Calm "it arrived damaged" or "wrong item". Calm "how do I return it?" | Answers with facts from the order and the tracking. Damaged, wrong or return threads are also flagged and moved to VA-PRIO for you to follow up. |
| **Upset** | Real anger: threats about the bank, Klarna or a review, capital letters, exclamation marks, "scam", "junk", a third email with no answer | Sends one calming reply in the owner's words: understands the frustration, names the problem, says it is escalated as urgent, promises an answer **within 48 hours**. Then flags the thread and moves it to VA-PRIO. |
| **For you** | Returns, refunds, exchanges and sizes, cancellations, disputes, wrong quantity, invoices, resellers, anything with an attachment, anything it cannot verify | Nothing is sent. The email is flagged and left in the inbox for you. |

Everything the bot does not touch is a system email: order notifications, review
requests, newsletters, our own addresses.

---

## 2. Two modes

| Mode | What happens | Where you see it |
|---|---|---|
| **Dry run** (the store starts here) | The bot writes its reply as a **draft** in the Drafts folder. Nothing is sent to the customer. Flags and VA-PRIO work as in live mode. | Drafts, the flags, VA-PRIO, the run report in the escalation channel |
| **Live** | The same reply is **sent** from the support address, signed with the store's support name (Store facts). | Sent, the flags, VA-PRIO, the run report |

Only the owner switches a store from dry run to live. The rule he uses: **20 correct
drafts in a row, then live for one day, then every store.** Your reports of wrong
drafts (section 5) are what keeps that count honest.

---

## 3. What you will find in the mailbox

- **A draft in Drafts you did not write.** That is the bot in dry run. It is a reply
 to one customer thread, with the customer's email quoted underneath.
- **A flag (star) on an email.** The bot looked at it and did **not** answer it, or
 answered it and wants you to follow up. A flagged email is yours. Do not remove the
 flag until you have replied.
- **The VA-PRIO folder.** Upset customers, plus threads where the bot asked for photos,
 gave return instructions or told a customer their parcel shows as delivered. These
 customers were told someone will come back to them. **Open this folder first, every
 time you sit down.**
- **The replied arrow on an email, and a reply from us in a thread that nobody wrote.** In live mode that is the bot. Read
 it before you write anything, so your answer builds on it instead of contradicting it.
- **The run report** in the escalation channel after every hour in which something
 happened: how many simple questions were answered, which upset customers got the
 calming reply (order number and one line), and the list flagged for you. A silent hour
 means nothing came in.

---

## 4. Your routine

0. **Start with the Morning list.** Every morning before your shift a post lands in the
 escalation channel (Store facts) with you tagged: the VA-PRIO folder, the flagged emails
 that still have no reply, and any dispute with a deadline within 3 days. It is posted
 even when it is empty — a morning without it means the routine is broken, tell the owner.
 Work it in the order it lists.
1. **VA-PRIO first.** Reply to every upset customer within the first-reply target
 (Store facts), and never later than the 48 hours they were promised. Use the SOP for
 the actual problem (Start here has the table). When you have replied, move the email
 back to the inbox or your usual done folder.
2. **Then the flagged emails in the inbox**, oldest first. Same as any other email.
3. **Then the drafts in Drafts (dry run only).** For each draft: open the customer's
 email and the order, and read the draft against them.
 - Correct and complete: send it. It is now your reply, in your name.
 - Anything wrong: **delete the draft**, reply yourself, and report it (section 5).
 - Never send a draft without reading the customer's email and checking the order.
4. **Never write a second reply to something the bot just answered** unless the customer
 has written again. One question, one answer.

---

## 5. When the bot is wrong

It will be, sometimes. That is why it starts in dry run, and why every mistake you
report fixes the rule for every store.

Post one line in the escalation channel (Store facts):

```
Auto-reply wrong: order [ORDER NUMBER] — [what was wrong in one sentence]
```

Examples of "wrong": the facts do not match the order, the customer had already been
answered by you, the tone does not fit, the language is wrong, the customer is angrier
than the reply admits, or the bot answered something it should have left to you.

**In live mode, if a wrong reply has already gone out:** reply to the customer yourself
right away and put it right, then report it. Do not wait for the owner first.

---

## 6. What the bot never does

- Never sends a second automatic reply in the same thread. The customer's next email
 always comes to you.
- Never writes to a customer **you** have written to in the last 14 days, in any thread.
 It flags instead.
- Never answers an email that mentions a dispute, a chargeback, Klarna or the bank.
- Never opens an attachment, so an email with one is always yours.
- Never promises a refund, a replacement, a discount or a delivery date it did not read
 from the order or the carrier.
- Never quotes another customer's order. The order has to belong to the sender's own
 email address.
- Never signs as a bot or an AI. It signs with the store's support name, like you do.

---

## 7. Three rules for you

1. **A flag means "a human has to look".** Do not clear a flag, move an email out of
 VA-PRIO or delete a draft to tidy up. Do it when the customer has been answered.
2. **Read before you write.** The bot's reply, the customer's email and the order.
 Every time.
3. **Report every wrong draft, even a small one.** A wrong draft you quietly fix once
 will be wrong again next week, on another store.

---

## Definition of done

- [ ] VA-PRIO was opened first and every upset customer got a personal reply within the
 promised time.
- [ ] Every flagged email in the inbox was answered, oldest first.
- [ ] Every bot draft was read against the customer's email and the order before it was
 sent, or deleted and replaced by your own reply.
- [ ] Every wrong draft or wrong reply was reported in the escalation channel with the
 order number.
