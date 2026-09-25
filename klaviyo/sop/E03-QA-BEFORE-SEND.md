# E03 — QA before send

**Use this** on every campaign before it is scheduled, and on every flow email
before the owner switches it on. Run it on the **test email on your phone** and on
the desktop preview. One "no" = do not schedule, report it (E07).

Takes about 10 minutes per email. Do not skip lines because the last one was fine.

---

## The checklist

### Sender and audience
1. **From** shows the sender name in E00, and the address is the one in E00.
   Never `@baverkoppling.se`.
2. **Reply-to** is the same address.
3. The included segment has the consent condition (*subscribed*) — E02 step 2.
4. The exclusion segment from E00 is set.

### Prices and links
5. For every product in the email: open the product page on the live store
   (E00 website) in a private window. **The price and the compare-at price in the
   email match the page exactly.** One difference = stop.
6. **Click every link and button**, one by one. Each opens the right product,
   collection or page, not the homepage, not a 404, not another product.
7. Links carry `utm_source=klaviyo` (visible in the address bar after the click).

### Images and layout
8. Every image loads. No broken-image icon, no empty box.
9. On the phone: text readable without zooming, buttons full width and tappable,
   nothing cut off on the right.
10. The product in the image is the product in the text.

### Legal footer
11. There is an **unsubscribe** link at the bottom and it opens Klaviyo's
    unsubscribe page (open it, do **not** confirm).
12. The store's address is in the footer.

### Text (read every line, subject lines too)
13. **No long dashes** (— or –) anywhere. Ranges use a normal hyphen: `5-10`.
14. Returns are only ever written as **14 dagars ångerrätt**. Never "30 dagar",
    "30 days", "öppet köp", "nöjd-kund-garanti", or "garanti" on its own.
15. Delivery is only ever written **5-10 arbetsdagar**. Never "7-14 dagar".
16. **No reviews or quotes that are not real.** Quotes only appear in the review
    block (first name + initial). A quote written into the normal text = stop.
17. **No price in the text.** Prices only in the product blocks. A "kr" amount
    in a sentence = stop.
18. **No pressure that is not true.** "Bara idag", "sista chansen", "priset går
    upp", "få kvar": only if the gallery's memo gives a real reason (a real last
    order date, stock the owner confirmed). Otherwise stop.
19. **Dates are right.** Any date in the email (last order day, "före jul") matches
    E00. After a last order date has passed, no email may promise arrival for it.
20. The store name is in the sender and footer only, not as the message. Emails
    about the roof cover or the thermal cover name **no store** in the text.
21. No discount code other than the one in E00, and only if the gallery says so.
22. No other brand's name (Grillkliniken, Mastern, SnarkLös, CaraShell, Matstrumpor).

### The test itself
23. Three subject lines A/B/C and preview texts match the gallery word for word.
24. Planned date and time match the gallery.

## How to report

One post per campaign in the escalation channel:

```
QA <campaign name>: GREEN
```
or
```
QA <campaign name>: STOP
- #5 price: email 1 129 kr, page 1 099 kr (product: <handle>)
- #13 long dash in subject line B
```

Always the checklist number, what you saw, and where.

## Definition of done

- [ ] All 24 lines checked on the phone test email and the desktop preview
- [ ] Every product page opened live and compared
- [ ] Every link clicked
- [ ] Post "GREEN" or "STOP" with numbers, per campaign
- [ ] Nothing scheduled on a STOP
