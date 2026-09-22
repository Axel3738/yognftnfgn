# /stonebite — håll sajtens siffror färska

Hämtar allt sajten visar, räknar månadens bonus, committar och pushar.
Körs som rutin varje timme. Tar ungefär en minut.

**Sajten läser en fil, inte API:erna.** Servern visar `stonebite/data/snapshot.json`
och inget annat. Kör inte den här rutinen står samma siffror kvar på sidan —
den ljuger aldrig om det (den skriver ut när datan hämtades), men den blir
gammal. Därför finns rutinen.

---

## Steg 1 — hämta

```bash
cd /home/user/yognftnfgn
git pull --rebase origin main      # spårningsrutinerna pushar till main varje timme — hämta först, annars nekas pushen i steg 3
node stonebite/hamta.mjs --dagar 30
```

Det här sker i körningen, i ordning:

1. **Repot** — topplistan, kundtjänstrapporterna, spårningen, nattvaktens logg.
2. **Shopify** — försäljning per butik och dag. Butikerna upptäcks ur
   `sparning/butiker.json`, `factory/butiker/*.yaml` och miljöns nycklar.
3. **Meta** — spend, köp och ROAS per konto och kampanj, plus dagens siffror.
4. **Bonus** — Judge.me-recensionerna, produkttest-trappan ur Notion,
   tvisterna och veckomåtten → vad varje person tjänat den här månaden.

## Steg 2 — läs källistan

Körningen skriver en rad per källa. **Läs den innan du går vidare.**

- `✅` — allt gick bra.
- `⚠️` — källan saknas (rutinen har inte kört än). Normalt i början.
- `❌` — något gick fel. Skriv ut orsaken i rapporten; gissa aldrig bort den.

Är Shopify-raden `6 av 13 butiker gick inte att läsa` är det väntat i dag:
Bäverbutiken och UK kräver att Axel godkänner kunddata i Shopify-appen, och
tre butiker har appen oinstallerad. Det står i klartext på sidan Drift.

## Steg 3 — committa och pusha

```bash
git add stonebite/data/snapshot.json bonus/utfall/
git commit -m "Stonebite: färsk data <datum>"
git push -u origin main
```

⚠️ **Committa ALDRIG** `stonebite/data/insatser.jsonl`,
`stonebite/data/personer-extra.json`, `anvandare.json` eller `hemlighet.txt`.
De hör hemma i driftens volym, inte i git. `.gitignore` stoppar dem redan —
lägg inte till dem med `git add -f`.

## Steg 4 — rapportera till Axel

Kort, på svenska:

1. När datan hämtades och hur lång tid det tog.
2. Källor som inte gick att läsa, med orsak i klartext och vem som fixar det.
3. Bonusläget: hur många som tjänat något den här månaden, och summan.
4. **Recensioner med namn** — om siffran är noll: säg det rakt ut. Det betyder
   att ingen VA får betalt, och det är hela poängen med programmet.
5. Väntande insatser som ingen godkänt (de betalas inte förrän någon klickar).

---

## Definition of done

- [ ] `node stonebite/hamta.mjs` kördes utan att kasta.
- [ ] Varje källa i listan är ✅, eller har en orsak skriven i rapporten.
- [ ] `stonebite/data/snapshot.json` är uppdaterad och committad.
- [ ] Inga hemligheter eller föränderliga driftfiler följde med i commiten.
- [ ] Pushen gick igenom (annars: fyra försök med 2s, 4s, 8s, 16s paus).
- [ ] Rapporten till Axel innehåller punkterna 1–5 ovan.
