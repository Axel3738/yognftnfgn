# E02 — Set up and schedule a campaign

**Use this when** Claude has uploaded a campaign as a draft and the owner has
approved it **by name** in writing. Not before.

Claude builds the content, the template and the three subject lines. You set up
the test, check the audience, send yourself a test and schedule it.

---

## 1. Open the draft

1. Klaviyo → **Campaigns**.
2. Filter or search for the campaign name. It starts with `MAIL_` and a date, for
   example `MAIL_20260929_Takoverdrag_PD_1_uppvarmning_problem_…_v1`.
3. Check the status says **Draft**. If it says Scheduled or Sent: stop, escalate (E07).
4. Open the campaign's page in the repo gallery (link from Claude) next to it. The
   gallery shows the planned time, the segment, the memo and the three subject lines.

## 2. Check the audience

1. In the campaign, open the **Recipients** (audience) step.
2. **Included:** exactly the segment(s) in the gallery. In the first two weeks
   that is the warm-up segment in E00.
3. **Excluded:** the always-excluded segment in E00 (`SEG_oengagerade_180d`).
4. Open each included segment (Audience → **Lists & segments** → the name) and
   check the first condition reads *can receive email marketing / subscribed*.
   If it is missing: stop, do not schedule, escalate (E07).
5. **Smart Sending**: on. It stops someone getting two emails from us within hours.
6. Write down the recipient count Klaviyo shows. It goes in your post.

## 3. Set up the A/B test with the three subject lines

Claude may already have created the variations. Check them, do not re-create.

1. Open the **Content** step → the email → **Create A/B test** (or open the existing test).
2. There must be **three variations: A, B, C**. Each has the subject line and
   preview text from the gallery, **word for word**. The email body is the same
   in all three.
3. **Test size / distribution: split all recipients evenly, no winner phase.**
   Set the slider to **100 %** so each variation goes to a third of the segment.
   Reason: we want the order numbers per subject line after 7 days. That is the
   lesson. A winner picked after a few hours only measures clicks.
4. If Klaviyo will not allow 100 %: use **test size 60 %** (20 % per variation),
   **winning metric: Click rate**, **test duration: 6 hours**, and check the
   winner would go out before 21:00 Swedish time. Tell Claude you had to.
5. **Placed order rate** as winning metric only when each test group is expected
   to reach at least 3 orders within the test duration. At our list size (about
   6 000) that does not happen. The owner or Claude will say when it does.

## 4. Send yourself a test

1. **Preview & test** → **Send test** → your own address.
2. Open it on your phone. Run E03 on the test email, not only on the preview.

## 5. Schedule

1. **Schedule** → pick **the date and time in the gallery** (Swedish time, E00).
   Not "send now", not smart send time, unless the gallery says so.
2. Check the confirmation screen: date, time, time zone, recipient count.
3. Confirm. The status changes to **Scheduled**.
4. Post in the escalation channel:
   `Scheduled: <campaign name> · <day> <time> CET/CEST · <recipients> recipients · A/B/C even split`

## If something is wrong

Wrong text, wrong price, wrong link, wrong segment, missing variation: **do not
fix it in Klaviyo.** Post it (E07). Claude fixes the file, rebuilds and uploads
again, and you start this page over.

## Definition of done

- [ ] Owner's written OK for this campaign by name, before scheduling
- [ ] Included segment = gallery; exclusion segment set; consent condition seen in the segment
- [ ] Three variations A/B/C, subject lines and preview texts word for word
- [ ] Even split 100 % (or the fallback, reported)
- [ ] Test email received and E03 passed on it, on a phone
- [ ] Scheduled on the gallery's date and time, status Scheduled
- [ ] Post in the escalation channel with name, time, recipients
