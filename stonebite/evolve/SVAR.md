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

## Svar 2 och 3

Väntar. Axel klistrar in dem när boten svarat.
