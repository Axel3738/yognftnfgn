# Prompten som ger SOP:n "Following up the auto-reply — as Head of Customer Support"

Axels beställning 2026-09-23, efter att Mechile svarat Micke Stigberg 15:28 utan att
se att boten redan svarat honom 13:42: *"vi behöver skriva en prompt för att få en
SOP på hur vi ska svara på AI-bottens olika mailutfall … hon ska behandla ett
AI-bots-case som nån skänk från ovan: 'oj, jag fick precis det här till mig
vidarebefordrat', som Head of Customer Support, och sen hantera caset utifrån våra
andra SOP:er. Jag vill att du skriver den prompten."*

**Så används den:** klistra in allt under strecket i en Claude-session som står i
repot (eller i Cowork med repot öppet). Sessionen skriver
`kundtjanst/va-sop/following-up-the-auto-reply.md`, lägger raden i `notion.json`
och publicerar med `node kundtjanst/va-sop/skriv.mjs --bara following-up-the-auto-reply.md`.
Första körningen gjordes 2026-09-23 av samma session som skrev prompten; sidan
finns alltså redan. Kör prompten igen när botens utfall ändras
(`kundtjanst/autosvar/svar.mjs`, `autosvar/hinkar.mjs`) eller när en ny butik ska
få sin bas, så att SOP:n aldrig beskriver svar boten inte längre skickar.

---

You are writing one SOP page for the customer-support VA of a group of Shopify
stores. The page tells her exactly how to follow up every email the store's
auto-reply bot has already answered. Write it in English, for a reader whose
working language is English and who answers customers in Swedish (with DeepL
for other markets). Keep it short enough to be used mid-email, not read once.

## Read these first, in this order

1. `kundtjanst/va-sop/auto-reply-bot.md` — what the bot is, its three buckets
   (Simple, Upset, For you), and the rule "read before you write". Your page
   comes after that one; do not repeat it.
2. `kundtjanst/autosvar/svar.mjs` — the exact Swedish sentences the bot sends:
   the calming reply (`arg`, `eskalerat`, the X sentences, `merInfo`,
   `ordernummerArg`, `lageIntro`), the photo requests (`beklagar`/`foton`,
   `beklagarVara`/`fotonVara`, `beklagarPassform`/`fotonPassform`), the return
   block (`retur`), the delivered checklist (`levererad`, `levereradKolla`),
   the WISMO lines (`lageRader`), and the signature (`signatur`). Quote the
   promise the bot makes word for word so the VA recognises it in Sent:
   "Jag har eskalerat det här direkt till vårt ansvariga team som ett brådskande
   ärende. Du kan räkna med svar inom 48 timmar." The number of hours is
   `ESKALERING_TIMMAR` (48 today); the page must say the clock starts at the
   bot's reply, not at the customer's email.
3. `kundtjanst/autosvar/hinkar.mjs` — which emails become which bucket and
   which Simple type (`wismo`, `levererad`, `foton`, `retur`, `leveranstid`,
   `oppettider`, `adress`, `ordernummer`, `foretag`). One section per outcome
   the bot can produce; nothing for outcomes it cannot.
4. `kundtjanst/va-sop/start-here.md`, `00-STORE-FACTS.md` and one existing
   procedure page (for example `product-arrived-broken.md`) — the house style:
   "Use this when", an OVERVIEW table, numbered steps, reply templates as a
   two-column table `Swedish (use this) | English meaning`, a Store facts
   note, no store name, domain, carrier or address anywhere in the procedure
   (those live only on Store facts), placeholders in square brackets.
5. `kundtjanst/README.md` → "Axels feedback på utkasten 2026-09-22" — the
   owner's rules for tone: no dashes in an email, whole sentences, one promise
   per email and only one you can keep, the return address only when the
   customer wants to return, never a promise of a refund, replacement or
   delivery date without the owner's approval.
6. The dashboard card the VA works from: `stonebite/vy/drift.mjs` →
   `botSvarText` and `nastaStegText`. The page and the card must say the same
   thing about every outcome.

## The one idea the page exists for

The bot's reply is the first line of defence: fast, factual, signed
"Kundtjänst <store>". The VA's reply is the second line, and it comes from the
**Head of Customer Support who has just had the case escalated to her
personally**. The customer should feel: "the first answer came within a minute,
and now the person in charge has taken my case over herself." So every follow-up
opens as if the case was forwarded to her by name, then handles the actual
problem exactly as the ordinary SOP for that problem says (damaged item, wrong
item, return, package missing after delivered, order not arrived, disputes).
The persona changes the opening and the ownership, never the facts, never the
approvals.

## Hard rules the page must state and obey

- Read the bot's email in Sent before writing. Build on it. Never contradict a
  fact it gave; never repeat one either.
- Never mention a bot, an AI, an automatic reply or "our system". Both replies
  are from the store.
- Never ask again for something the customer already sent (photos, the order
  number, a description). If photos were asked for and have not come, say what
  happens the moment they arrive; one reminder after two days, never a third.
- Keep the bot's promise. An Upset customer was promised a reply within
  48 hours of the bot's email; the dashboard card counts down from that
  moment. Aim for the same day.
- Owner approval stays exactly where the other SOPs put it (refund, accepted
  return, replacement, "the parcel is lost"). The Head of Customer Support
  voice never turns into a promise the owner has not made. What she can promise
  on her own: what she has done today, and when she will write next.
- The customer's language. Swedish is the master text; DeepL for others.
- Sign with the VA's first name and the Swedish title "Kundtjänstansvarig" plus
  the store name from Store facts, so the two replies read as two people from
  the same store.
- Portable: no store name, domain, carrier, address or person's name in the
  procedure text. Values come from Store facts; the case's values are
  placeholders like `[FIRST NAME]`, `[ORDER NUMBER]`, `[DATE]`.
- When the bot's reply was wrong (facts, tone, language, a customer the VA had
  already answered): put it right with the customer first, in the same voice,
  then report `Auto-reply wrong: order [ORDER NUMBER] — [one sentence]` in the
  escalation channel.

## Structure of the page

1. `# Following up the auto-reply — as Head of Customer Support` (this exact
   title; the dashboard links to it by name).
2. **Use this when**: a card under "The AI bot has replied" on the Kundtjänst
   dashboard, a thread in VA-PRIO with a reply from "Kundtjänst <store>" nobody
   on the team wrote, or the replied arrow on an email the VA has not touched.
3. **The idea** in five lines, then **the rules** above as a numbered list.
4. **The opener** every follow-up starts with, as a template table, plus the
   sign-off block.
5. **One section per bot outcome**, each with: what the bot sent (quote the
   recognisable Swedish line), your job, the deadline, which SOP page handles
   the actual problem, and the templates. Outcomes: Upset customer (with the
   variants the bot can add: parcel status, "unshipped for N days", photo
   request, return block, asked for the order number); Simple: photos
   requested; Simple: return instructions sent; Simple: marked delivered but
   not received; Simple: fully answered (where is my order, delivery time,
   opening hours, company details, address change, asked for the order
   number); Flagged only (no bot reply exists, so this page does not apply);
   The bot was wrong.
6. **The dashboard**: how to read the card (badge, order number, "What the bot
   wrote", "Your next step", the promise clock), when to press "Mark as
   followed up" (after the customer has your reply, not before), and that
   "Undo" exists.
7. **Readability test** the VA runs on every email before sending (the owner's
   recurring complaint is text that does not sound natural): read it aloud
   once; every sentence flows into the next; no dash characters; no two
   sentences begin the same way; exactly one promise, with a date; the
   customer could not tell that two different people wrote the two replies
   badly, only that the second one is the person in charge.
8. **Definition of done** checklist.

## Templates

Write every template in the two-column form. Swedish first, natural and warm,
never stiff, never a list of facts. English meaning second. Placeholders in
square brackets. No dash characters inside a template. At least: the opener,
Upset + photos received, Upset + photos not yet received, Upset + parcel not
arrived (the bot already gave the tracking status), Upset + wants money back or
return, calm + photos received, the single photo reminder, return tracking
number received, delivered but still missing (carrier investigation started),
customer wrote again after a fully-answered reply, the bot was wrong. Every
template ends with the sign-off block.

## Deliverables

- `kundtjanst/va-sop/following-up-the-auto-reply.md` (the page).
- A row in `kundtjanst/va-sop/notion.json` with `kategori: "Other stuff"`.
- A routing row in `start-here.md` and a pointer in `auto-reply-bot.md`
  section 4 ("Your routine"), so the VA finds the page from where she already
  is.
- Publish: `node kundtjanst/va-sop/skriv.mjs --torr --bara following-up-the-auto-reply.md`,
  then without `--torr`. Read the page back in Notion once.
- Tell the owner in Swedish, in five lines, what the page says and what the VA
  now does differently. His own tasks, if any, numbered at the end.
