# Club draw winners — photos, consent, missing addresses

**Use this when** a customer replies to a Matstrumpor club email about the weekly
draw (the subject lines are "Du är en av tio i dag", "Vi drog ditt namn i morse",
"Vi väntar på din bild", "Har lådan kommit fram?", "Sista påminnelsen om bilden",
"Vi vill gärna ha med dig"), or when you see an order tagged `klubb-dragning` in
Shopify. Matstrumpor only, for now.

Every Tuesday morning a script draws **ten members of Matstrumpor-klubben at random**.
Each winner gets the sushi box (5 pairs) as a **0 kr order** and three club emails
from Spoks: day 0 "you were drawn", day 12 "send your photo", day 18 last reminder.
The condition: the winner sends a **photo of themselves with the socks**, and by
sending it gives Matstrumpor the right to use it in club emails and ads. Nothing is
promised beyond the box. The winners' replies land in the Matstrumpor support inbox
(the club emails reply to it). The auto-reply bot flags these to you and never
answers them itself.

---

## 1. Where everything is

| What | Where |
|---|---|
| This week's winners | Shopify → **Customers** → filter on the tag `klubb-vinnare-<date>` (for example `klubb-vinnare-2026-10-06`). Every winner ever: tag `klubb-vinnare`. |
| Their orders | Shopify → **Orders** → filter on the tag `klubb-dragning-<date>`. Total 0 kr, discount "Klubbdragningen <date>". |
| Winners without a shipping address | Shopify → Orders → **Drafts**, same tag. The note says **ADRESS SAKNAS**. The email asked them to reply with their address. |
| The photos and the consent | On the **order's timeline** in Shopify: a comment with the photo attached and the customer's own sentence pasted in. Nowhere else. |
| Tags you set | Customer tag `klubb-bild-klar` = photo received (stops the reminders). `klubb-bild-namn-ok` = they said yes to first name + city. `klubb-tackade-nej` = they declined. |

---

## 2. The five kinds of reply, and what you do

| The reply | What you do |
|---|---|
| **A photo with the person in it, socks visible** | Look at it: an adult, the socks visible, nothing you would not put in an email. Open the order → timeline → **add a comment with the photo attached** and paste the customer's sentence from the email. Add the customer tag `klubb-bild-klar`. If they wrote that first name + city may be used, also add `klubb-bild-namn-ok`. Reply with template A. |
| **A photo of only the socks or the box (nobody in it)** | Reply with template B (thank them, ask for one with them in it). Do not tag yet. If a second reply never comes, that is fine; the reminders stop by themselves after day 18. |
| **Their address** (the winner had none, or moved) | Draft order: open it → Customer → add the shipping address → **Mark as paid** (the total is 0 kr, nothing is charged). Real order: Orders → the order → Edit shipping address. Reply with template C. |
| **"Nej tack"** (does not want the box, or does not want to be in a picture) | Cancel the order (or delete the draft). Add the customer tag `klubb-tackade-nej`. Reply with template D. Never argue, never ask why. |
| **A photo with a child in it, or a person who looks under 18** | Do **not** save it and do not attach it anywhere. Reply with template E: they keep the box, we just cannot use pictures with children. Add `klubb-bild-klar` so the reminders stop. |

Anything else (a complaint, a question about the socks, a return): the usual pages
for that problem. The free box follows the same rules as any order.

---

## 3. Templates (Swedish, the winners are Swedish)

Paste as is, fill in the name. Sign as always.

**A. Photo received**

```
Hej [NAMN]!

Tack för bilden, den blev jättefin. Vi sparar den tillsammans med din order och
använder den bara i klubbmejlen och i våra annonser, precis som vi skrev. Ditt
efternamn skrivs aldrig ut.

Hoppas strumporna gör dig glad länge.
```

**B. Photo without the person**

```
Hej [NAMN]!

Tack för bilden! Vi skulle gärna vilja ha en där du själv är med, med strumporna
på fötterna eller lådan i handen. Det räcker med en snabb mobilbild.

Svara på det här mejlet med den, så är allt klart.
```

**C. Address received**

```
Hej [NAMN]!

Tack, nu har vi din adress och lådan är på väg till dig. Du får ett mejl med
paketnumret när den skickats.
```

**D. Nej tack**

```
Hej [NAMN]!

Tack för att du hörde av dig. Vi har tagit bort ordern, och du är förstås kvar
i klubben precis som vanligt.
```

**E. Photo with a child**

```
Hej [NAMN]!

Tack för bilden! Vi använder inga bilder med barn på, så den här sparar vi inte.
Lådan är din i alla fall, det ändrar ingenting.
```

---

## 4. Never

- Never promise anything extra: no discount, no second box, no delivery date.
- Never post or forward a photo anywhere yourself. The owner picks which photos go
  into emails and ads, from the order timelines.
- Never write a last name anywhere a customer can see it. First name + city only
  when the tag `klubb-bild-namn-ok` is on the customer.
- Never pick a winner, add one, or swap one. The script draws; if a winner writes
  "my friend wants one too", template D's tone: friendly, and no.
- Never remove `klubb-vinnare` from a customer. It is what keeps the same person
  from winning twice.

---

## 5. If something looks wrong

- An order tagged `klubb-dragning` with a total above 0 kr: do not fulfil it, write
  in **#customer-service** with the order number the same day.
- A winner says they never got any email but has the order: reply with template C's
  first line and the condition in one sentence (a photo of them with the socks, and
  by sending it they let us use it in club emails and ads).
- More than ten orders tagged with the same date: write in **#customer-service**.
