# E00 — Start here: email marketing in Klaviyo

**Read this first, keep it open.** This is the only page with store values in it.
Every other page (E01–E07) says "take the value from E00", so the same pages work
for the next brand (Matstrumpor) by changing this page only.

---

## 1. What this is

We send marketing emails to customers who said yes to email, from Klaviyo.
There are three parts:

| Part | What it is | Your job |
|---|---|---|
| **Flows** | Automatic series that send themselves when something happens (someone leaves the checkout, someone buys) | Check them once a week (E05). Never switch one to Live yourself |
| **Campaigns** | One email to a segment on a planned day, 3–5 a week at most | Check it (E03), set it up and schedule it after the owner's OK (E02), read the result (E04) |
| **The list** | The people who can receive our emails | Watch its health (E06). Never add anyone to it |

Every campaign is built as a **test**: it has one idea it is testing (the "memo")
and three subject lines, each aimed at a different reason to buy. A week later we
read which one sold, write down what we learned, and the next emails are built on
that. That loop is the whole point (E01).

Right now Claude does most steps and the owner clicks the rest. You take over one
step at a time, starting with QA (E03). The order is in the README the owner has.

---

## 2. Store values (the only part that changes per brand)

| Value | Bäverbutiken |
|---|---|
| Klaviyo account | `TMFt7M` (shown in Settings → Account) |
| Sender name | Bäverbutiken |
| Sender and reply-to address | `kundsupport@baverbutiken.se` — **never** `@baverkoppling.se` (that domain cannot receive mail) |
| Sending domain | `send.baverbutiken.se` ⚠️ OWNER: not set up yet (2026-09-24). No campaign is sent before it is |
| Store website | https://baverbutiken.se |
| Tracking page | https://baverbutiken.se/pages/spara |
| Language of the emails | Swedish |
| Time zone for scheduling | Europe/Stockholm |
| Delivery promise (as written in emails) | `5-10 arbetsdagar` (with a normal hyphen) |
| Right of withdrawal (as written) | `14 dagars ångerrätt` |
| The one allowed offer | Code `TACKIGEN`: one free product on orders from 299 kr, once per customer. No other codes |
| Last order dates Q4 2026 | Father's Day: **19 Oct** · advent calendar: **11 Nov** · Christmas: **3 Dec** (owner can change them) |
| Segment for campaigns in the first two weeks | `SEG_uppvarmning_steg1` |
| Segment always excluded | `SEG_oengagerade_180d` |
| Escalation | Discord, Bäverbutiken server. ⚠️ OWNER: email channel not decided. Until then: `#customer-service`, tag the owner |
| Owner | Axel |

---

## 3. What you do, and what you never do

**You do:** check, set up, schedule after approval, read results, report.

**You never:**
1. **Send or schedule anything the owner has not approved.** No exceptions, not a
   "small fix", not a resend.
2. **Change a segment's consent condition**, or build a segment without it. Every
   campaign segment contains "can receive email marketing / subscribed". If you
   see one that does not, stop and escalate (E07).
3. **Add, import or upload contacts.** Not a list from a customer, not a CSV, not
   "they asked to be added". People join through the store only.
4. **Create a discount code or promise an offer.** The only offer is in E00.
5. **Switch a flow or a flow email to Live.** Only the owner does that.
6. **Rewrite the text of an email.** If a line is wrong, report it (E07). Claude
   rewrites it so the tests run again.
7. **Delete** a campaign, flow, template or segment. Anything with data stays.
8. **Rename** anything that has been sent. The names carry the data.

---

## 4. Words you will see

| Word | Meaning |
|---|---|
| **Flow** | An automatic series. It starts on an event (checkout started, order placed, joined the list) and sends its emails with waiting times between them |
| **Campaign** | One email sent once to a segment at a set time |
| **Segment** | A group of profiles defined by rules (for example "subscribed AND bought in the last 30 days"). It updates itself |
| **List** | A fixed group people join. We have one: `LISTA_nyhetsbrev` |
| **Consent / subscribed** | The person said yes to marketing email. Only these get campaigns |
| **Subject line A/B** | We send three versions of the subject line (A, B, C). Each aims at a different reason to buy. The results show which reason works |
| **Preview text** | The grey line shown after the subject line in the inbox |
| **Delivered** | Recipients minus bounces (emails that could not be delivered) |
| **Open rate** | Share who opened. **Unreliable**: Apple opens emails automatically. Never judge an email on it |
| **Click rate** | Share of delivered who clicked a link |
| **Placed order rate** | Share of delivered who ordered within Klaviyo's attribution window after opening or clicking |
| **Revenue per recipient (RPR)** | Order value credited to the email ÷ recipients. The fairest single number, but never used alone |
| **Unsubscribe rate** | Share who clicked unsubscribe. Alarm above **1 %** |
| **Spam rate** | Share who marked it as spam. Alarm above **0.3 %** |
| **Attribution window** | How long after an open or click an order still counts for the email. That is why results are read on **day 7**, not the next morning |
| **Too early** | Fewer than 3 orders or fewer than 500 delivered. No verdict |
| **Memo** | The one sentence saying what the email tests and why |
| **Draft / Manual / Live** | Flow email status. Draft = off. Manual = waits for someone to press send per email. Live = sends by itself |

---

## 5. The pages

| Page | When |
|---|---|
| E01 Weekly loop | The week's rhythm, who does which step |
| E02 Build a campaign | Claude has uploaded a draft: A/B, segment, test email, schedule |
| E03 QA before send | Before every schedule. Every time |
| E04 Read results | Day 7 after a send, and the Monday report |
| E05 Flows | The six flows, weekly check |
| E06 List health | Warm-up, alarms, sunset |
| E07 Escalate | When you always ask the owner, and how |

Klaviyo moves menus now and then. If a click path on these pages does not match
what you see, search the menu for the word in **bold**, and tell Claude the right
path so the page gets fixed.

## Definition of done (first day)

- [ ] You can open Klaviyo and see account `TMFt7M`
- [ ] You have read E00–E07 once
- [ ] You can say, without looking, the four things you never do (send without OK, touch consent, add contacts, make codes)
- [ ] You know where to escalate (section 2)
