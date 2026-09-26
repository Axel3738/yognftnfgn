# Frågorna till Evolve-boten: baksidan på stonebite.org

Här är frågorna om vår inloggade baksida och våra dashboards.
Klistra in EN fråga i taget i Evolve-botens chatt.
Klistra tillbaka svaret till Claude.
Claude sparar svaren i `stonebite/evolve/SVAR.md`.
Luckorna bakom frågorna står i `stonebite/evolve/LUCKOR.md`.

Frågorna är på engelska, eftersom kursen är det. Varje fråga beskriver oss från början,
för boten kanske inte minns förra meddelandet. Inga butiksnamn, domäner eller namn från
vårt team står i frågorna. Coachernas namn (Billy) får stå. Talen är avrundade och kommer
ur repot (källorna står i `LUCKOR.md`). Varje fråga är under 1 500 tecken, så den ryms i
ett Discord-meddelande.

Skrivet 2026-09-26. Fråga 1–3 och 15 är Axels egna frågor: vad vi saknar, var team
misslyckas och hur det ska synas, och teambuilding. Börja med dem.

---

**Fråga 1: vad de bästa trackar som vi saknar**

Varför: den breda bilden först. Vad saknas hos ägaren och per roll?

```
We are a Swedish e-commerce company: one large general store plus one active one-product store, selling in Sweden, Norway, Denmark, Finland and (one store) the US. All traffic is Meta ads, products ship from China (5-10 business days). Team: an operations manager in Sweden taking over day-to-day, and a remote team in the Philippines: 6 freelance video editors (2 also do product research), 1 Head of customer support who is also our only support VA, and a UGC outreach person.

We built our own internal staff dashboard. Today it shows: for the owner, sales and orders per store, Meta spend, ROAS and profit contribution per campaign, open disputes, parcel counts and a bonus overview. The support lead sees AI-bot replies to follow up, urgent disputes and reviews. Editors see a leaderboard of every editor's commission (never ad spend). Product researchers see the test funnel.

What do the best operators in the course/community track that we are missing, for the owner and for each role? Which numbers, how often, and who owns each number? Give real member examples with numbers. If the course has no material on this, say so directly.
```

**Fråga 2: var, när och hur mycket team misslyckas**

Varför: Axels egen fråga. Var teamen går sönder, när det händer och vad det kostar.

```
We run several Shopify stores with Meta ads and products shipped from China. Small remote team (one support VA who is also the support lead, freelance video editors, product researchers), an operations manager taking over day-to-day, and an owner who wants to only work on high-leverage tasks.

From the course and community: where do e-commerce teams like ours most often fail as they scale (support, shipping, disputes, creative output, product testing, cash, one key person leaving, freelancers churning, the owner himself)? When does it usually happen (which revenue level or team size, which season, Q4)? How much does it typically cost in money, with real member examples and numbers? Which of these failures hurt most? If there is no source for part of this, say so.
```

**Fråga 3: hur ett misslyckande syns på dashboarden**

Varför: Axels tillägg. Vi vill ha data på varje miss (vad, var, när, vad den kostade) och visa den på dashboarden innan den blir dyr.

```
Swedish e-commerce company, several Shopify stores, Meta ads, small remote team. We have our own internal dashboard and want it to show failures with data, not feelings: what went wrong, where, when, and how much it cost.

How do strong operators track and present team failures? Do they keep an incident or post-mortem log (what failed, when it was found, cost in money, root cause, fix, owner), and is it shown on the team dashboard? Which early warning signs do they put on the dashboard so a failure is seen weeks before it hurts (for example rising unanswered tickets, parcels without scans, dispute deadlines, fewer new creatives)? How do they show the cost of a failure so the team cares without blame? Give real member examples with numbers, or say if the course has no material.
```

**Fråga 4: riktig vinst per butik**

Varför: sajten visar omsättning och ROAS, men inte vinst efter varukostnad, frakt, avgifter och återbetalningar.

```
Swedish e-commerce company, several Shopify stores, all traffic from Meta ads, dropshipped from China. Sales are in SEK, NOK, DKK, EUR, plus USD and other currencies in one store's international market, while all our ad accounts bill in SEK. Our dashboard shows sales, Meta ROAS and profit contribution per campaign, but not real profit after product cost, shipping, payment fees and refunds.

What contribution-margin formula do top operators in the course use per store and per day: which costs go in, which stay out? How do they set break-even per store and per product, and how often do they recalculate it when prices or supplier costs change? How do they handle ad spend in one currency and sales in several? Give real member examples with numbers, or say if the course has none.
```

**Fråga 5: ägarens scorecard och veckomötet**

Varför: ingen MER, inga mål, ingen ägare per tal. En driftchef ska ta över vardagen.

```
Swedish e-commerce owner, several Shopify stores on Meta ads, remote team. An operations manager is taking over day-to-day so I can focus on high-leverage work. Our dashboard has sales, Meta ROAS and week-over-week trends, but no targets, no owner per number, and no blended MER or new-customer CAC.

What does the owner's daily and weekly scorecard look like for top operators in the course? Which 5-15 numbers, what targets, and who owns each? Blended MER vs Meta ROAS: which do they steer on? nCAC when almost every buyer is a first-time buyer? Who should run the weekly scorecard review, the owner or the manager, and what does the owner keep for himself? Give real member examples with numbers, or say if the course has no material.
```

**Fråga 6: larm som bara väcker rätt person**

Varför: VA:n får pingar om eskalering och tvister, Axel bara om ett produkttest. Ingen larmar när en butiks försäljning faller eller när en datakälla dör tyst.

```
Several Shopify stores, Meta ads only, small remote team. Nightly rules already kill or cut ads under break-even. The support VA gets Discord pings for unanswered escalations after 2 hours and dispute deadlines within 3 days. The owner only gets a ping when a product test should become its own store. Nothing alerts anyone when a store's sales drop, when the chargeback ratio rises, or when a data source silently goes stale (we found a weekly report 12 days old).

Which 5-10 exception alerts do experienced operators set up so they only get pinged when something is actually wrong? For each: the threshold, who gets it (owner, manager, support lead, VA, editor), how fast they must act, and what happens if nobody acts. When automation already acts, what should the owner still be alerted on, and how do they audit the automation? How do they avoid alert fatigue? Real member examples, or say if there is no source.
```

**Fråga 7: kundtjänst per person, inte per butik**

Varför: svarstid och obesvarade räknas per butik. Med VA nummer två går det inte att se vem som gör vad. Ingen kvalitetsgranskning.

```
Swedish e-commerce company, several Shopify stores, products shipped from China. Each store has its own inbox. One VA (also our support lead) answers all of them, helped by an AI auto-reply bot for simple and angry emails. Over 30 days before the bot went live, one store had about 17 tickets per 100 orders, two thirds never answered, and a median first response of about 17 hours on the ones answered. We measure per store, not per person, and we do no QA on replies.

What KPIs do strong teams put on a support VA's scorecard (first response, resolution time, tickets per day, backlog, SLA hit, QA score, CSAT)? What targets are realistic for us? How do they measure per agent when several VAs share an inbox? How do they QA replies (sample size, rubric, who scores) without it feeling like surveillance? What does the VA's daily work queue look like? Real member examples with numbers, or say if the course has no material.
```

**Fråga 8: leveransen som arbetslista, inte som antal**

Varför: ungefär 7 av 10 ärenden gäller "var är min order" eller "inte levererat". Sajten visar bara antal paket, inte vilka som fastnat.

```
Swedish store shipping from China with a 5-10 business day delivery promise. About 7 of 10 support tickets are "where is my order" or "not received", and "not received" is our most common dispute reason. We track every parcel hourly, but our dashboard only shows totals (on the way, delivered, no scan), not which parcels are stuck or lost.

Which shipping metrics do the best operators track daily (stuck parcels, lost parcels, % delivered on time, days from order to delivery)? After how many days without a scan do they contact the customer proactively, before the customer writes? What contact rate (tickets per 100 orders) is normal for 1-2 week shipping, and which contact reasons do strong teams drive down first? Real member examples with numbers, or say if there is no source.
```

**Fråga 9: tvister, återbetalningar och dåliga recensioner per produkt**

Varför: vinstbidraget räknas före återbetalningar. Tvistgraden syns inte på sajten. Recensionerna visas per butik, inte per produkt.

```
General store with dozens of unrelated products, Meta ads, shipped from China. We scale products on profit contribution, but it is calculated before refunds. From past disputes we know we win almost all inquiries but lose most chargebacks. Our dashboard does not show chargeback ratio, dispute win rate, refund rate or bad reviews per product.

How do scaling stores monitor chargeback ratio (at what level do they start worrying, before the Visa/Mastercard thresholds), dispute win rate and refund/return rate per product? At what refund rate do they stop scaling a product that still has good ROAS? What goes wrong most often when a VA owns dispute handling? Give real member examples with numbers, or say if there is no source.
```

**Fråga 10: redigerarnas scorecard och träffsäkerhet**

Varför: redigerarna får betalt för volym gånger budget. Ledtid och revisioner byggdes men datan dog i augusti. Träffsäkerhet har aldrig mätts. Redigerarna får aldrig se spend.

```
We have 6 freelance video editors in the Philippines making Meta video ads for several Shopify stores. They are paid a small % of the ad spend on their ads and see a commission leaderboard in USD. By our own rule they never see ad spend, ROAS or revenue. We built turnaround, on-time and revision-rate tracking per editor, but the data feed stopped in August. We have never measured hit rate.

How do top brands measure a video editor: what counts as a winner (spend or purchase threshold, time window), hit rate, turnaround, first-pass approval, new creatives per week vs target? What are healthy ranges? Should editor pay be tied to hit rate instead of % of spend? How can an editor see their own performance without seeing spend? Say if the course has nothing on this.
```

**Fråga 11: ägarens creative-dashboard**

Varför: hook rate och hold räknas i nattrutinen men når aldrig sajten. Ägaren ser bara kampanjnivå.

```
Swedish e-commerce company, several Shopify stores, all Meta ads, a team of freelance video editors producing new ads every week. Our owner dashboard shows Meta data only per account and campaign. Hook rate and hold rate are calculated in our nightly scripts but never reach the dashboard, and we do not show share of spend on new ads or how many new ads never get delivery.

Which creative metrics do top brands in the course put on the owner's creative dashboard (hook rate, hold rate, CTR, CPM, frequency, % of spend on ads younger than 7-14 days, ads that never spend, new creatives per week vs target)? What are healthy ranges? How often do they review it and who owns it? Where do creative teams most often fail: volume, iteration or testing? Real member examples with numbers, or say if there is no source.
```

**Fråga 12: produkttestets tratt och ekonomi**

Varför: trappan visar antal och steg, men inga kronor och ingen tid. "Vad är tillräckligt bra" är obesvarat.

```
Two of our video editors also find and test new products for our Swedish general store (Meta ads, shipped from China). About 70 products have entered our test pipeline, 8 got a real test and 4 are scaling. We pay the researcher a fixed amount per product that reaches ad review. We do not track spend per test, cost per winning product, or days from idea to verdict.

How do product researchers in the community measure their testing funnel: tests per month, spend per test, cost per winning product, how fast to kill a loser, what result is "good enough" to build a dedicated one-product store? Where do most teams waste money in product testing? Should the researcher's pay be tied to winners instead of volume? Real member examples with numbers, or say if there is no source.
```

**Fråga 13: mötesrytm, EOD och upplärning för ett distansteam**

Varför: EOD-rapporterna finns bara som mall, inte som data. Inga fasta 1:1, ingen kvittens på nya SOP:er, ingen tidrapport.

```
Small remote team in the Philippines (support VA, freelance video editors, product researchers) working for a Swedish e-commerce owner, with an operations manager taking over day-to-day. We have many SOPs that change often, but no proof anyone read the new version. Daily end-of-day reports exist only as a template, not as data. We track no hours and have no set 1:1 routine.

What meeting rhythm do Evolve members use with a remote team (daily, weekly, 1:1s) and how is it run from a scorecard? What EOD report format do they require from Filipino VAs and editors, do they track hours (which tool), and what do they do about missed reports? How do they onboard a new VA or editor in the first 30 days (SOP sign-off, test tickets)? Billy mentioned an SOP checklist and a hiring doc: what is in them? Say if there is no source.
```

**Fråga 14: bonus kopplad till talen på dashboarden**

Varför: VA:n drog noll recensioner på $5 styck. 2 av cirka 1 300 recensioner nämnde någon i teamet. Veckobonusen döms per butik, inte per person.

```
We pay our remote support VA bonuses: $5 per review that names her, plus weekly bonuses for an empty inbox and fast response time (judged per store, not per person). Result: our VA earned zero on the review bonus, and only 2 of about 1,300 reviews named anyone on the team.

What bonus structures do Evolve members use for support VAs, video editors and product researchers that actually change behaviour? Which dashboard numbers should the bonus be tied to (SLA hit, QA score, disputes answered before deadline, hit rate), how often do they pay out, and how do they show the person their progress in real time? Where do bonus systems usually go wrong? Give real member examples with numbers, or say if the course has no material.
```

**Fråga 15: dashboarden som bygger teamet**

Varför: Axels andra fråga. Redigerarna har en topplista över pengar, men ingen ser teamets arbete, gemensamma mål eller vinster. Uppgifter går inte att tilldela.

```
Our internal staff dashboard (several Shopify stores, remote team in the Philippines: support VA, video editors, product researchers) shows money, not teamwork. Editors see a monthly leaderboard of every editor's commission in USD, the support lead sees the support team's bonus, everyone else sees only their own money. There is no shared view of today's work, no shared goals, no shared wins, and the owner cannot assign a task through it.

How do strong e-commerce teams use a dashboard for team building, ownership and morale rather than surveillance? What should a shared team board show (today's queue, who owns what, team SLA, weekly wins like an editor's ad becoming a winner or a VA winning a dispute)? Does a public money leaderboard build or hurt a remote team, and what should replace or complement it? What should stay private per person? Real member examples, or say if there is no source.
```

**Fråga 16: kassaflöde och plan mot utfall inför Q4**

Varför: kassan och bankkorten har ingen datakälla alls. Inget på sajten jämför utfall med en plan.

```
Swedish e-commerce company, several Shopify stores, all Meta ads, products shipped from China (5-10 business days). Our dashboard shows what already happened (sales, spend, week over week), but no cash view (payouts, reserves, ad card limits) and no plan: nothing compares results against a monthly or Q4 target.

How do operators in the course forecast cash and track results against a monthly and Q4 plan (pacing, spend ramp, payout timing)? Which cash numbers does the owner check daily or weekly, and what should trigger action? How do they plan ad spend and staffing for Black Friday and Q4? Give real member examples with numbers, or say if there is no source.
```

**Fråga 17: bygga själv med AI eller köpa verktyg**

Varför: vi bygger allt själva med Claude. Frågan är vad medlemmar köper, och vad de som byggt egna dashboards byggde först.

```
We are a Swedish e-commerce company with several Shopify stores on Meta ads. We build our own internal dashboard, about 20 active scheduled jobs (hourly, daily and weekly) and an always-on support bot with an AI coding assistant (Claude), instead of buying tools.

Which dashboard and profit tools do Evolve members actually use (Triple Whale, TrueProfit, Polar, BeProfit, Lifetimely, Gorgias or Zendesk reports, others) and for what? When is buying better than building? For members who built their own internal dashboards with AI: what did they build first, what gave the most value, and what did they regret? Say if the course/community has no material on this.
```
