# Evolve-botens svar om baksidan (minnet, så nästa session slipper fråga igen)

Frågorna står i `FRAGOR.md`. Axel klistrade in svaren ordagrant i chatten.
`[C1]`, `[D1]` och liknande är botens egna källhänvisningar. Vi har inte läst källorna själva.

---

## Svar 1, 2026-09-26: ägaren och missarna (meddelande 1)

### Kort, på svenska

**Det här säger kursen:**

| Punkt | Svar | Källa |
|---|---|---|
| KPI-trappan | Under $50k/mån: blended ROAS (all Shopify-omsättning / all spend) + Metas ROAS. Över $50k/mån: lägg till CPA, **NCPA (CPA för nya kunder)** och LTV. Med flera kanaler: daglig spend, daglig MER och blended nCAC. | D1, C1 |
| Det flest missar | NCPA i stället för total CPA. Vinstbidrag (CM), inte bara ROAS. LTV per kohort, inte som ett snitt. | C4, C2, D3 |
| Ägarens dagliga tal | Blended ROAS/MER, Metas ROAS, daglig spend, NCPA, CM. | D1, C1, C4, C2 |
| Veckomötet | Lewis tittar själv varje måndag på förra veckan per produkt: topp 5 annonser, förlorarna, mönster (vinkel, format, längd, hook, USP, landningssida), nya idéer. | C5 |
| Creative-tavlan | Spencers byrå följer brief → redigering → launch → vinnare/förlorare i ClickUp, 3–4 annonser + 1–2 landningssidor per vecka och brand, granskar alla vinnare + en förlorare. | D4 |
| Ersättning | Lorenzo: köparens bonus som % av CM, inte % av spend. Fast lön, sedan % när CM ökat 20 % mot förra månaden, med tak. | C2 |
| Vinstformeln | CM per dag och butik = nettoomsättning − varukostnad − frakt − betalavgifter − annonsspend. COGS = produkt + frakt + betalning + fulfillment. | D3, D1 |
| Break-even | Break-even-ROAS ur pris + frakt mot kostnad + frakt. Skalnings-ROAS = break-even + 1. Max CAC dag 1 = AOV − COGS, med 10 % buffert. | D1, D3 |
| Var team faller | Produkten och positioneringen (generisk dropshipping). Kassaflödet ("wall of death"). Betalningsfel av aggressiva rabatter. Att inte lära sig av förlorarna. | C6, D2, D3, D4 |
| Kassan | Mål: lönsam inom 90 dagar efter köpet. Metas kreditlinje, kortkrediter. 5 % fel i kohortprognosen vänder plus till minus. | D2, D3 |

**Det här har kursen INTE:** dashboards per roll, missloggen, larm (trösklar, mottagare, larmtrötthet),
återbetalningar och chargebacks i vinstformeln, moms och tull per marknad, valutor med
SEK-fakturerade annonskonton, plan mot utfall, Q4-tempo, nyckelpersonrisk och när kundtjänsten
brister. Boten: våra nattliga regler som dödar annonser under break-even är "ahead of what the
sources document". För redovisningsfrågorna pekar den på Abir Syed (UpCounting), för kassan på
Grayson.

### Vad det betyder för oss

| Råd | Hos oss i dag | Vad vi gör |
|---|---|---|
| Blended MER per verksamhet | Bara Metas ROAS. Spend dras dessutom mot fel butik (se `LUCKOR.md`). | Bekräftar att MER är prioritet 1. Bygga direkt. |
| NCPA | Saknas helt. | Kräver `orders_count` per kund. Ny rad i `LUCKOR.md`, prioritet 1. |
| CM-formeln | "Kvar efter reklam", utan varukostnad. | Kursens formel är vår grund. Återbetalningar, tvister och valutor bestämmer vi själva, för kursen saknar dem. |
| Skalnings-ROAS = break-even + 1 | Vi skalar på vinstbidrag mot break-even (`docs/os/ANALYSMETOD.md`). | Ingen ändring. "+1" är en tumregel, inte en metod, och krockar med ANALYSMETOD. Axels beslut om den ska in. |
| Veckomöte per produkt (Lewis) | `/cs` gör samma sak, men inte som en fast vy. | Veckovyn på sajten kan följa Lewis mall. |
| Creative-tavla (Spencer) | Notion-hubbarna har brief → leverans → live, men sajten visar det inte. | Stöder luckan "Creative-dashboard". |
| Bonus på CM, inte spend (Lorenzo) | Redigerarna får 0,4 % av spenden. | Axels beslut. Tas upp igen när svar 2 (redigerare) kommer. |
| Missar, larm, roller | Kursen har inget. | Vi bygger efter egna data (`LUCKOR.md`). |

⚠️ När svaret klistrades in blev minustecknen i CM-formeln punkter. Formeln ovan är
återställd ur sammanhanget (bruttoomsättning − rabatter = nettoomsättning; − COGS = bruttovinst;
− rörliga kostnader = CM).

### Botens svar, ordagrant

> The sources cover KPI hierarchy, contribution-margin thinking, and cash flow mechanics well — but role-by-role dashboards, incident logs, exception alerts, and monthly/Q4 plan tracking are largely not covered. Here's what's grounded and what isn't.
>
> **1. What top operators track that most teams miss**
>
> The KPI framework has three tiers [D1]:
> * Under $50k/month: Blended ROAS (total Shopify revenue / total ad spend) + in-platform ROAS. That's it [D1].
> * Over $50k/month: Add CPA, NCPA (new customer CPA), and LTV [D1].
> * Multi-channel at scale: Daily spend across Meta, Google, Amazon, native + daily MER + blended NCAC. Matt asked about exactly this, and Spencer confirmed his brands run a dashboard template in Apex that does it [C1].
>
> What most teams miss:
> * New Customer CPA vs. blended CPA. Shaun says if your spend is majority on Facebook, "just looking at new customer CPA" is the highest-value thing you can do [C4]. Most teams look at total CPA and miss that they're not generating new customers.
> * Contribution margin, not just ROAS. Lorenzo recommends tying media buyer comp to % of CM rather than % of spend, tracked in TW, a Google Sheet, or a custom dashboard [C2]. His structure: fixed salary, then % kicks in after CM increases 20% vs. previous month, with a cap or decreasing % after a threshold [C2].
> * LTV by cohort, not aggregate. Grayson's presentation shows how aggregated LTV hides cohort differences — apparel example: black leggings 95% LTV vs white 20%, aggregated at 70% [D3]. Sub cohorts can run 317% multipliers vs 140% for non-sub [D3].
>
> Per-role ownership — the sources don't break this down explicitly. What's available:
> * Owner: Blended ROAS daily, NCPA and CM weekly, LTV cohorts monthly [D1][D3]. Lewis does his own Monday review of prior week's ad performance [C5].
> * Media buyer / ops manager: CM tracking if comp is tied to it [C2], ad-level performance by product.
> * Creative team: Spencer's agency uses a ClickUp board tracking briefs → edits → launch times → winners/losers [D4]. Your instinct to keep editors on a commission leaderboard, not spend, aligns with this.
> * Support lead / UGC outreach: No source covers what these roles should see on a dashboard. No source.
>
> **2. Where teams like yours fail as they scale**
>
> The sources are thin here. What's covered:
> * Product/positioning failure: Shaun says when clients don't scale, sometimes "product just was not good — generic DS stuff with generic positioning." They compare the product to market options. The ones that did scale after parting ways "were because the founder was already very marketing focused from the start" [C6]. For a general store shipping from China, this is the #1 failure mode the sources identify.
> * Cash flow / "wall of death": At a $50 CAC, the business loses money through month three — $2.7M upfront needed [D2]. A 5% error in month-zero or month-one cohort projections drops the math from +$158k to -$257k [D2]. For your setup (China shipping, multi-currency, SEK-billed ad accounts), this is the silent killer.
> * Payment failures from aggressive discounts: Grayson's example: $59→$5 discount produced 60% payment failure rate [D3].
> * Creative output stagnation: Spencer's agency runs 3-4 ads + 1-2 LPs per week for 5-6 brands — low volume, high quality, reviewing all winners + 1 loser per batch [D4]. The failure mode is not the volume; it's not learning from losers.
>
> What the sources DON'T cover: support breakdown timing, shipping delay escalation patterns, dispute rate thresholds, key-person risk, owner burnout, Q4-specific failure modes, and how to track any of these with incident logs. No source.
>
> **3. Contribution-margin formula and break-even per product**
>
> What the sources give you:
> * COGS definition (Grayson): Product + shipping + processing + fulfillment fees [D3]. Most complete definition in the sources.
> * Break-even ROAS: Enter actual product price + shipping charged as revenue; enter product cost + shipping cost as expense. Calculator outputs break-even ROAS. Scaling ROAS = break-even + 1 [D1].
> * Per-unit breakdown (Dara M): $5 COGS per bottle, $1.50 pick and pack, $7-9 shipping depending on quantity [C3]. Most granular per-unit example in the sources — product cost + pick/pack + shipping as the variable cost stack.
> * CM formula: Gross profit − variable costs (ads, shipping, transaction fees) [D3]. Gross profit = net revenue − COGS. Net revenue = gross sales − discounts [D3].
> * Day-1 max CAC: $100 AOV − $30 COGS = $70 day-1 margin = max CAC [D3]. 90-day LTV multiplier applied gives true max CAC. Buffer 10% for cost fluctuations [D3].
>
> What the sources DON'T cover:
> * Refunds and partial refunds: No accounting treatment. Only related data point is Cosimo's tactic of issuing 10% partial refunds to avoid chargebacks — no formula.
> * Chargebacks and dispute fees: C7 shows this is an open question in the community. Andrew says they include transaction/payment fees but not dispute/platform fees, and asks how to calculate it — no answer was given [C7].
> * Duty and VAT per market: No source.
> * FX on multi-currency stores with SEK-billed ad accounts: No source. Directly relevant to your setup and completely uncovered.
> * Fixed cost allocation: Mentioned (rent, payroll, agency, software) [D3] but no allocation formula.
>
> For your two stores, the formula the sources support is: **CM per day per store = (net revenue − COGS − shipping cost − payment processing fees − ad spend).** Break-even per product = (product price + shipping charged) / (product cost + shipping cost + processing fees). Scaling target = break-even ROAS + 1 [D1]. Everything beyond that (refunds, chargebacks, duty, FX) is not in the sources — and C7 confirms even community members are actively struggling with the same gaps [C7].
>
> **4. Owner's daily and weekly scorecard**
>
> Daily:
> 1. Blended ROAS / MER (total Shopify revenue / total ad spend, all platforms) [D1]
> 2. In-platform ROAS (Meta-reported) [D1]
> 3. Daily spend across platforms [C1]
> 4. New customer CPA (if over $50k/month) [D1][C4]
> 5. Contribution margin (if tying team comp to it) [C2]
>
> Weekly: Lewis runs a Monday review of the prior week's ad performance, structured per product [C5]:
> * Top 5 ads, losing ads, patterns, new ideas to test
> * Patterns across: angle, format, video length, music, messaging, hook styles, USPs, landing pages [C5]
>
> Spencer's agency review process [D4]:
> * Review all winners + 1 loser per creative batch
> * ClickUp tracks: briefs → edits → launch times → winners/losers via automations/dashboards
> * 3-4 ads + 1-2 LPs per week per brand
>
> Monthly:
> * LTV cohorts: cumulative revenue and margin per cohort by month [D3]
> * Gross margin trends, fixed cost ratios (<10% target), profit margin by channel/product [D3]
>
> Who runs the weekly review: Lewis does it himself — no source shows a manager running it. Your ops manager in Sweden could own the creative review board (Spencer's ClickUp model [D4]), but the owner should own the profit/ROAS scorecard since that's the money decision.
>
> **5. Exception alerts**
>
> No source covers exception alert configuration, thresholds, recipients, or response times. No source covers alert fatigue. Your nightly rules that kill ads under break-even are ahead of what the sources document — no one in the available conversations discusses automated kill rules or alert design. No source.
>
> **6. Cash numbers and monthly/Q4 plan tracking**
>
> What the sources cover:
> * Cash conversion cycle: Target ≤90 days to profitability post-acquisition [D3]. Framework uses Meta credit line (net 30, effectively net 45), Melio + AMEX Plum for net 60 on manufacturer payments, Bill.com for terms [D2][D3].
> * Credit stacking: Grayson spends ~$1M/day via Amex, gets 5% ad rebates, 3% non-taxable on Amex Gold/Platinum [D3]. Relevant if you're billing in SEK but could benefit from US card programs.
> * Accuracy matters more than sophistication: 5% error in cohort projections swings from +$158k to -$257k [D2]. "Shoot for month two breakeven for 30-day wiggle room" [D2].
> * Q4 decision framework: Grayson's Q4 KPI presentation frames the core decision as "scale for delayed profit vs. harvest now, based on historical data" [D3]. Target: highest LTV + shortest cycle.
>
> What the sources DON'T cover: tracking actual results against a monthly plan, Q4-specific cash pacing, or a plan-vs-actual dashboard. No source covers budget vs. actual tracking, runway calculations, or how to set monthly spend targets against a seasonal plan. No source.
>
> **Bottom line:** The sources give you the KPI hierarchy (blended ROAS → NCPA → LTV → CM), the break-even + 1 scaling rule, per-unit COGS stacking, and the cash conversion cycle framework. They don't give you role-specific dashboards, incident logs, exception alerts, refund/chargeback/FX accounting, or monthly/Q4 plan tracking. For the gaps — especially FX on multi-currency stores and dispute fee treatment (which C7 shows is an open question even for community members) — ask the community directly. Abir Syed (runs UpCounting, an ecom accounting firm) would be the right person for accounting treatments, and Grayson for cash/credit structuring [D3].

---

## Svar 2, 2026-09-26: rollerna (meddelande 2)

### Kort, på svenska

**Det här säger kursen:**

| Punkt | Svar | Källa |
|---|---|---|
| Kundtjänst-KPI:er | Svarstid, lösningstid, kundnöjdhet (NPS), löst vid första kontakten, antal ärenden. Ingen målnivå, ingen QA-metod. | C6, C5 |
| Tvister | Hugo S (Skandinavien, Klarna, ~$40 AOV): chargebacks strax under 1 %, de flesta öppnade innan paketet kom fram, vann de flesta när spårningen uppdaterats. Grayson: att få Shopifys varning är ovanligt, de flesta butiker stängs bara av. Hans råd: låt kunden få återbetalning automatiskt. | C7 |
| Vinnare | Spend Winner (10–30 %+ av kampanjens spend efter 7 dagar), Breakthrough (samma + budgeten kan höjas vecka mot vecka), KPI Winner (ROAS ≥ kampanjens snitt utan spendandelen), Loser. | D2 |
| Redigerarnas KPI:er (Karlo) | Batcher per vecka, snittid brief → godkänd, revisionsgrad per batch, **träffsäkerhet (andel vinnare)**, **andel av kontots spend på deras annonser**. | C4 |
| Svag redigerare | Visa datan, fråga hur du kan hjälpa, ge tid. Låt personen gå igenom sin process om ledtiden är lång. 5–7 dagars ledtid är ett tecken på slöhet (Meelod). | C4, C5 |
| Nyanställd redigerare | 30 dagars prövotid och ett provjobb före anställning (Spencer). Provjobbet betalas inte (Shaun). | C2, C8 |
| Creative-mix | "No golden ratio". Mer nya idéer, eftersom det är det som skalar. Kvalitet före volym. | C1, C3 |

**Det här har kursen INTE:** mål för kundtjänsten, QA, att mäta per person utan övervakning,
leveransmått, när man kontaktar kunden själv, normal kontaktgrad, chargeback-gräns att oroa sig
vid, återbetalningsgrad som stoppar en produkt, hook rate/hold/CTR på dashboarden, antal nya
annonser per vecka, produkttestets budget, dödstid och när en produkt får egen butik, och hur en
redigerare ser sitt resultat utan att se spend. Boten igen: vår timvisa spårning ligger före kursen.

### Vad det betyder för oss

| Råd | Hos oss i dag | Vad vi gör |
|---|---|---|
| Vinnaretiketterna (D2) | Används redan: `matstrumpor/etikett.mjs`, `docs/os/CS-KLART.md`, `/cs`. | Bekräftar. Träffsäkerheten per redigerare kan räknas ur etiketterna vi redan sätter. |
| Karlos fem redigerartal | Ledtid och revisioner finns i `dashboard/lib/kpi.mjs`, men datan dog i augusti. Träffsäkerhet och spendandel mäts inte. | Bygga: fem kort per redigerare på Min sida. Spendandel i PROCENT avslöjar inga kronor, men om redigerarna får se den är Axels beslut (regeln 2026-09-02 gäller spend). |
| Visa datan, inte känslan (Karlo) | Topplistan visar bara pengar. | Stöder teamtavlan och scorecard per roll. |
| Kundtjänstens fem tal | Svarstid och obesvarade per butik. Lösningstid, första-kontakt-lösning och NPS saknas. | Målen sätter vi själva, kursen har inga. |
| Automatisk återbetalning mot tvister (Grayson) | Vi vinner 29 av 29 inquiries men förlorar chargebacks. | Ägarens beslut om pengar. Inte ändrat. |
| Leverans, produkttest, creative-mått | Kursen har inget. | Vi bygger efter egen data (`LUCKOR.md`). |

### Botens svar, ordagrant

> The sources cover editor KPIs, winning ad definitions, and dispute/chargeback context well — but shipping metrics, product testing budgets, and most support VA targets are not covered. Here's what's grounded and what isn't.
>
> **1. Support VA KPIs and targets**
>
> Shaun lists the KPIs: Response time, Resolution speed, Customer satisfaction (NPS surveys), First-contact resolution, and Total # of tickets handled [C6]. Another member echoes monitoring "ticket first response and completion time in your CRM" [C5]. That's the full list from the sources — no specific targets (e.g., "under 4 hours"), no SLA thresholds, no backlog limits, no CSAT implementation method, and no QA framework for reviewing reply quality. The "how to measure per person without surveillance" angle is not addressed. No source.
>
> **2. Shipping metrics (stuck, lost, % on time, days without scan, normal contact rate)**
>
> No source covers any of this — no tracking scan gaps, no proactive customer contact timing, no benchmark WISMO contact rate for 1-2 week shipping windows. Given that 7 of 10 tickets are WISMO and you're already tracking parcels hourly, you're ahead of what the sources document. No source.
>
> **3. Disputes and refunds**
>
> The closest data point: Hugo S, also selling in Scandinavia with Klarna at ~$40 AOV, had a chargeback rate just under 1% — but most disputes were customers opening them before the order arrived. He still won the majority once tracking updated and the package delivered [C7]. Grayson noted that receiving a Shopify warning about dispute rate is "really uncommon" — most stores just get dropped, so getting the warning means Shopify is still working with you [C7]. His recommendation: "allow them to refund automatically" to reduce dispute volume [C7].
>
> No source gives a specific chargeback ratio threshold to start worrying, and no source gives a refund rate per product that should trigger stopping a scaling product. No source.
>
> **4. Video editors — winner definition, hit rate, turnaround, revisions, pay model**
>
> Winner definition: The course defines four categories [D2]:
> * Spend Winner: Ad captures 10-30%+ of its initial campaign's total spend without triggering a week-over-week budget increase after 7 days
> * Breakthrough: Meets spend threshold AND enables a week-over-week budget increase
> * KPI Winner: Doesn't pull required spend % but achieves ROAS ≥ campaign baseline
> * Loser: Below campaign ROAS and doesn't meet spend threshold
>
> For your scale ($0-$100K/month), target 60-70% of campaign spend; breakthroughs should double account spend (e.g., $1K/day → $2K/day) [D2].
>
> Francisco points to Spencer's definition: "You don't want volume, you want ads that are high intent and psychology research based. Ads that allow you to increase ad budget" [C3].
>
> Per-editor KPIs (from Karlo) [C4]:
> * Batches per week/month per editor
> * Average time to edit (brief assigned → approved to launch)
> * Average revision rate per batch
> * Winning ad hit rate %
> * % of ad account spend allocated to their creatives
>
> Karlo's approach to underperformance: don't say "I feel like you're slacking" — show the data, then ask how you can support them to improve, give them time to apply it [C4]. If turnaround is slow, have them walk you through their process to find bottlenecks [C4].
>
> Probation: Spencer uses 30 days, with an assessment edit before hiring. He tracks % of ad spend as a key editor KPI [C2]. Shaun adds: don't pay for assessment briefs — if editors refuse a free 30-second test, "may mean they not hungry enough," especially if they've already passed a culture interview [C8].
>
> Hit rate vs % of spend for comp: Spencer tracks % of spend [C2]. Karlo tracks both hit rate and % of spend [C4]. No source explicitly recommends switching from % of spend to hit-rate-based comp. Your current model (% of ad spend, editors never see spend) isn't directly addressed — no source covers how to show editors their results without exposing total spend.
>
> Turnaround and revision targets: Karlo flags tracking them [C4], and Meelod mentions 5-7 day turnaround as a sign of an editor getting "lazy" [C5], but no healthy range is given. No source for specific revision count benchmarks.
>
> **5. Owner's creative dashboard — metrics and weekly volume**
>
> Shaun on creative output mix: "no golden ratio" — "based on your learnings do whatever you think has the highest likelihood of doing well. We focus on more ideations since that's what scales usually" [C1]. The principle from Francisco/Spencer is quality over volume [C3].
>
> The winning ad framework [D2] gives you the spend-based metrics to track per ad: Week 1 % of spend, week-over-week growth, ROAS delta vs campaign baseline, and cumulative growth through Week 3. At $0-$100K/month, a spend winner pulls 10-30%+ of campaign spend; a breakthrough enables scaling.
>
> Not covered in sources: Hook rate, hold rate, CTR as dashboard metrics, % of spend on new ads, ads that never spend, and a specific weekly ad count target for your store size. No source.
>
> **6. Product testing — spend per test, kill speed, when to spin up a store**
>
> No source covers test budget per product, cost per winner, kill timeline for losers, or criteria for graduating a product to its own store. No source.
>
> **Bottom line:** The strongest coverage is on editor KPIs (Karlo's tracking framework [C4], Spencer's 30-day probation + % of spend [C2], winning ad definitions [D2]) and dispute context (Hugo's Scandinavia/Klarna experience [C7]). Support VA targets, shipping metrics, product testing budgets, and creative dashboard specifics (hook rate, hold rate) are gaps — worth asking the community directly, especially other operators shipping from China with long delivery times.

---

## Svar 3

Väntar. Axel klistrar in det när boten svarat.
