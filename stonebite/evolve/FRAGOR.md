# Frågorna till Evolve-boten: baksidan på stonebite.org

Tre meddelanden (Axel 2026-09-26: "max 3 långa meddelanden").
Klistra in meddelande 1, vänta på svaret, sedan 2, sedan 3.
Klistra tillbaka alla tre svaren till Claude.
Claude sparar svaren i `stonebite/evolve/SVAR.md`.
Luckorna bakom frågorna står i `stonebite/evolve/LUCKOR.md`.

Frågorna är på engelska, eftersom kursen är det. Varje meddelande börjar med vem vi är,
för boten kanske inte minns förra meddelandet. Inga butiksnamn, domäner eller namn från
vårt team står i frågorna. Talen är avrundade och kommer ur repot (källorna står i
`LUCKOR.md`). Varje meddelande är under 2 000 tecken, Discords gräns.

1. **Ägaren och missarna:** vad de bästa trackar som vi saknar, var och när team misslyckas och vad det kostar, hur en miss syns på dashboarden, vinst, scorecard, larm, kassa och Q4.
2. **Rollerna:** kundtjänst, leverans, tvister och återbetalningar, redigerare, creatives och produkttest.
3. **Teamet:** mötesrytm och EOD, bonus, dashboarden som bygger teamet, och bygga själv med AI eller köpa.

---

**Meddelande 1: ägaren och missarna**

```
Context: Swedish e-commerce company, one big general store plus one one-product store, selling in the Nordics and the US. All Meta ads, products ship from China (5-10 business days), sales in several currencies but ad accounts bill in SEK. Team: an operations manager in Sweden and a remote team in the Philippines (6 freelance video editors, 1 support VA who is also support lead, a UGC outreach person). We built our own staff dashboard: the owner sees sales, ROAS and profit contribution per campaign, disputes and parcels; the support lead sees AI-bot replies, disputes and reviews; editors see a commission leaderboard, never ad spend. Nightly rules already kill ads under break-even.

Please answer each point from the course/community, with real member examples and numbers. Say "no source" where there is none.

1. What do the best operators track in their dashboards that most teams miss? For the owner and per role, which numbers, how often, and who owns each?
2. Where do teams like ours most often fail as they scale (support, shipping, disputes, creative output, product testing, cash, a key person leaving, the owner himself)? When does it happen (revenue level, team size, Q4) and how much does it cost?
3. How do strong operators track failures with data on the dashboard: an incident log (what, when, cost, cause, owner), early warning signs weeks before it hurts, and showing cost without blame?
4. What contribution-margin formula do they use per store and day (product cost, shipping, fees, refunds), and how do they set break-even per product?
5. What is on the owner's daily and weekly scorecard (5-15 numbers, targets, MER vs ROAS, new-customer CAC)? Who runs the weekly review, owner or manager?
6. Which 5-10 exception alerts do they set up (threshold, who gets it, how fast), and how do they avoid alert fatigue?
7. Which cash numbers do they check, and how do they track results against a monthly and Q4 plan?
```

**Meddelande 2: rollerna**

```
Context: Swedish e-commerce company, a general store with dozens of products plus one one-product store, all Meta ads, shipped from China (5-10 business days). One remote support VA answers all store inboxes with help from an AI auto-reply bot. 6 freelance video editors make the ads; 2 of them also test new products. We track every parcel hourly.

What we see today: before the bot, one store had about 17 tickets per 100 orders, two thirds unanswered, median first response about 17 hours. About 7 of 10 tickets are "where is my order" or "not received". We win almost all dispute inquiries but lose most chargebacks. Profit per product is calculated before refunds. Editors get a small % of the ad spend on their ads, never see spend, and we have never measured hit rate. About 70 products entered our test pipeline, 8 got a real test, 4 are scaling.

Please answer each point from the course/community, with real member examples and numbers. Say "no source" where there is none.

1. Support VA: which KPIs and targets (first response, resolution, backlog, SLA, QA, CSAT)? How do you QA replies and measure per person without it feeling like surveillance?
2. Shipping: which metrics daily (stuck, lost, % on time)? After how many days without a scan do you contact the customer first? What contact rate is normal for 1-2 week shipping?
3. Disputes and refunds: at what chargeback ratio do you start worrying? At what refund rate per product do you stop scaling a product with good ROAS?
4. Video editors: what counts as a winner, and what are healthy ranges for hit rate, turnaround and revisions? Should pay follow hit rate instead of % of spend? How can an editor see results without seeing spend?
5. Owner's creative dashboard: which metrics (hook rate, hold rate, CTR, % of spend on new ads, ads that never spend) and how many new ads per week at our size?
6. Product testing: spend per test, cost per winner, how fast to kill a loser, and when is a product good enough for its own store?
```

**Meddelande 3: teamet**

```
Context: Swedish e-commerce company, several Shopify stores on Meta ads. Remote team in the Philippines (support VA, 6 freelance video editors, 2 of them also product researchers), and an operations manager in Sweden taking over day-to-day so the owner can do high-leverage work. We build our own staff dashboard, about 20 scheduled jobs and a support bot with an AI coding assistant (Claude) instead of buying tools.

What we see today: end-of-day reports exist only as a template, not as data. No hours tracked, no 1:1 routine, no proof anyone read a changed SOP. We pay the VA $5 per review that names her plus weekly bonuses. She earned zero on reviews, and only 2 of about 1,300 reviews named anyone on the team. The dashboard shows money, not teamwork: editors see a leaderboard of every editor's commission, but nobody sees today's work, shared goals or shared wins, and tasks cannot be assigned through it.

Please answer each point from the course/community, with real member examples and numbers. Say "no source" where there is none.

1. What meeting rhythm (daily, weekly, 1:1) do members run with a remote team, and how is it run from a scorecard? What EOD format, do they track hours, and how do they onboard a new VA or editor in 30 days?
2. Which bonus structures actually change behaviour for VAs, editors and product researchers? Which dashboard numbers should the bonus follow, how often to pay, and where do bonus systems go wrong?
3. How do strong teams use a dashboard for team building and morale instead of surveillance? What should a shared team board show (queue, owners, team SLA, weekly wins)? Does a public money leaderboard help or hurt? What stays private?
4. Which dashboard and profit tools do members use (Triple Whale, TrueProfit, Polar, others)? When is buying better than building with AI, and what did members who built their own build first?
```
