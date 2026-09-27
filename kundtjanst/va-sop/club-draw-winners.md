# Club draw winners — videos, consent, missing addresses

**Use this when** a customer replies to a Matstrumpor club email about the weekly
draw (the subject lines are "Du är en av tre i dag", "Vi drog ditt namn i morse",
"Lådan har redan ditt namn", "Vi väntar på din video", "Har lådan kommit fram?",
"Din video kan synas i nästa mejl", "Sista påminnelsen om videon", "Vi vill gärna ha
med dig", "Hann du filma?"), or when you see an order tagged `klubb-dragning` in
Shopify. Matstrumpor only, for now.

Every Tuesday morning a script draws **three members of Matstrumpor-klubben at random**.
Each winner gets the sushi box (5 pairs) as a **0 kr order** and three club emails
from Spoks: day 0 "you were drawn", day 12 "send your video", day 18 last reminder.
The condition: the winner sends a **short video of themselves with the socks, saying
one sentence about them** (a proper UGC video is welcome but not required, ten seconds
is enough), and by sending it gives Matstrumpor the right to use it in club emails and
ads. Nothing is promised beyond the box. The winners' replies land in the Matstrumpor
support inbox (the club emails reply to it). The auto-reply bot flags these to you and
never answers them itself.

---

## 1. Where everything is

| What | Where |
|---|---|
| This week's winners | Shopify → **Customers** → filter on the tag `klubb-vinnare-<date>` (for example `klubb-vinnare-2026-10-06`). Every winner ever: tag `klubb-vinnare`. |
| Their orders | Shopify → **Orders** → filter on the tag `klubb-dragning-<date>`. Total 0 kr, discount "Klubbdragningen <date>". |
| Winners without a shipping address | Shopify → Orders → **Drafts**, same tag. The note says **ADRESS SAKNAS**. The email asked them to reply with their address. |
| The videos and the consent | On the **order's timeline** in Shopify: a comment with the video attached and the customer's own sentence pasted in. If Shopify refuses the file (too large), upload it to the team's Google Drive and paste that link in the comment instead. If the customer sent a link instead of a file, download the video first, then store it the same way. Nowhere else. |
| Tags you set | Customer tag `klubb-video-klar` = video received (stops the reminders). `klubb-video-namn-ok` = they said yes to first name + city. `klubb-tackade-nej` = they declined. |

---

## 2. The five kinds of reply, and what you do

| The reply | What you do |
|---|---|
| **A video with the person in it, socks visible, and they say something about the socks** | Watch it: an adult, the socks visible, they say at least one sentence, nothing you would not put in an email. Open the order → timeline → **add a comment with the video attached** (or the Drive link) and paste the customer's sentence from the email. Add the customer tag `klubb-video-klar`. If they wrote that first name + city may be used, also add `klubb-video-namn-ok`. Reply with template A. |
| **A video of only the socks or the box (nobody in it), or a photo instead of a video, or a video where nothing is said** | Reply with template B (thank them, say what is missing: them in the picture, or one spoken sentence). Do not tag yet. If a second reply never comes, that is fine; the reminders stop by themselves after day 18. |
| **Their address** (the winner had none, or moved) | Draft order: open it → Customer → add the shipping address → **Mark as paid** (the total is 0 kr, nothing is charged). Real order: Orders → the order → Edit shipping address. Reply with template C. |
| **"Nej tack"** (does not want the box, or does not want to be on video) | Cancel the order (or delete the draft). Add the customer tag `klubb-tackade-nej`. Reply with template D. Never argue, never ask why. |
| **A video with a child in it, or a person who looks under 18** | Do **not** save it and do not attach it anywhere. Reply with template E: they keep the box, we just cannot use videos with children. Add `klubb-video-klar` so the reminders stop. |

Anything else (a complaint, a question about the socks, a return): the usual pages
for that problem. The free box follows the same rules as any order.

---

## 3. Templates (Swedish, the winners are Swedish)

Paste as is, fill in the name. Sign as always.

**A. Video received**

```
Hej [NAMN]!

Tack för videon, den blev jättebra. Vi sparar den tillsammans med din order och
använder den bara i klubbmejlen och i våra annonser, precis som vi skrev. Ditt
efternamn skrivs aldrig ut.

Hoppas strumporna gör dig glad länge.
```

**B. Video without the person, without a sentence, or a photo**

```
Hej [NAMN]!

Tack! Vi skulle gärna vilja ha en kort video där du själv är med, med strumporna
på fötterna eller lådan i handen, och där du säger en mening om dem. Tio sekunder
räcker, en vanlig mobilvideo är perfekt.

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

**E. Video with a child**

```
Hej [NAMN]!

Tack för videon! Vi använder inga videor med barn i, så den här sparar vi inte.
Lådan är din i alla fall, det ändrar ingenting.
```

---

## 4. Never

- Never promise anything extra: no discount, no second box, no delivery date.
- Never post or forward a video anywhere yourself. The owner picks which videos go
  into emails and ads, from the order timelines.
- Never write a last name anywhere a customer can see it. First name + city only
  when the tag `klubb-video-namn-ok` is on the customer.
- Never pick a winner, add one, or swap one. The script draws; if a winner writes
  "my friend wants one too", template D's tone: friendly, and no.
- Never remove `klubb-vinnare` from a customer. It is what keeps the same person
  from winning twice.

---

## 5. If something looks wrong

- An order tagged `klubb-dragning` with a total above 0 kr: do not fulfil it, write
  in **#customer-service** with the order number the same day.
- A winner says they never got any email but has the order: reply with template C's
  first line and the condition in one sentence (a short video of them with the socks
  saying one sentence about them, and by sending it they let us use it in club emails
  and ads).
- More than three orders tagged with the same date: write in **#customer-service**.
