# Fakturorna på sajten — meddelandet och SOP:en (2026-10-01)

Axel: "be alla om att det finns ett nytt fakturasystem … alla anställda måste
ladda upp alla sina fakturor någonsin som de har haft för mina löner, ALL time,
då jag råkat slarva bort alla". Teamet är engelsktalande, så båda texterna är
på engelska. Den svenska sammanfattningen för Axel står sist.

---

## Meddelandet till gruppen (kopiera rakt av)

> Hi team!
>
> We now have an invoice system on the company site. From now on, every invoice you send the company goes there — no more emailing them.
>
> I also need a favour: I managed to lose the invoices you have sent me so far. Please upload **every invoice you have ever sent us for your salary — all time, every month, from your very first one**. It would be amazing if you could do it this week.
>
> How: log in at https://www.stonebite.org/app/mig → scroll to **Your invoices** → pick the month the invoice covers → choose the file (PDF or a photo) → **Upload the invoice**. You can pick several files at once if you have more than one invoice for a month.
>
> Full step-by-step guide is below. If you no longer have an invoice for a month, write it again (same amount, same month) and upload that.
>
> Thank you! This makes it possible for me to pay you on time, every time.
>
> Axel

---

## SOP: Uploading your invoices (for the team)

**Where:** https://www.stonebite.org/app/mig (log in with your usual account), section **Your invoices**.

**What to upload:** every invoice you have ever sent Stonebite Ecom AB for your salary, bonus or commission — all months, from the first one. One file per invoice. PDF is best; a clear photo (JPG/PNG) is fine. Max 15 MB.

**Steps**

1. Open https://www.stonebite.org and log in.
2. Click **My page** in the menu.
3. Scroll down to **Your invoices**.
4. Under **Upload an invoice**:
   - **Which month does the invoice cover?** — pick the month the invoice is *for* (September's salary = 2026-09), not the day you upload it.
   - **The invoice (PDF or image)** — choose the file.
   - **Note (optional)** — e.g. "September salary + bonus" or "second half of September". Helps the bookkeeper.
5. Click **Upload the invoice**.
6. The invoice appears in the **Uploaded** list below with a **Download** button. Check that the month and the file name are right.
7. Repeat from step 4 for every invoice. Old months too.

**Rules**

- Every invoice you have ever sent the company must be here. If a month is missing from your records, write the invoice again (same amount, same month) and upload it.
- One or two invoices for the same month is fine: pick both files at once, or upload twice. Invoices for two different months are two separate uploads. Do not merge months into one PDF.
- You only ever see your own invoices. The owner sees everyone's.
- Uploaded by mistake? Tell Axel — only the owner can remove an invoice.
- If the page shows an error ("Only PDF or image", "File too big"), fix the file and try again.

**Your invoice must contain** (so the bookkeeper accepts it): your full name and address, invoice date, invoice number, the month it covers, what it is for (video editing / customer support / product testing), the amount and currency, and how you want to be paid (the same details as always).

---

## För Axel: hur du hämtar dem

- Sidan **Fakturor** i menyn: en ruta per person, senaste överst, knappen
  "Ladda ner senaste" per person, månadsflikar, och **"Ladda ner alla för
  september 2026 (zip)"**.
- Säg till Claude "samla ihop septembers fakturor och skicka till byrån", så
  kör sessionen `node stonebite/fakturor-hamta.mjs --manad 2026-09` och bifogar
  filerna i ett Gmail-utkast till byrån. Det kräver API-nyckeln
  (`stonebite/cowork/10-fakturor-nyckel.txt`).
