# Fråga till Chadbot: förbeställningen i paketväljaren (2026-10-03)

Axels idé samma dag: bygga in förbeställningen i paketväljaren med maximal (ärlig) urgency.
Lagret är slutsålt, nästa leverans är inne 11/10, och de bästa annonserna säger redan
"sålde slut i november förra året". Frågan avslöjar inte brandet (CLAUDE.md regel 15):
inga namn, inga domäner, avrundade tal. Svaret sparas i `EVOLVE-SVAR.md` bredvid.

Det Evolve redan sagt (Q4-masterclassen, `docs/os/evolve/Q4-2026.md` → Backend): en
förbeställningswidget av typen "current batch sold out, next batch almost sold out",
ärligt besked om leveransen ger lika hög eller högre konvertering eftersom bristen är
äkta, och konverteringen sjunker först när väntan är över ungefär tre månader.

```
Context: Swedish one-product store, novelty gift socks packed like a food box (Q4 gift buy). Bundle picker on the PDP: Buy 1 Get 1 (2 boxes, preselected, ~85% of orders) and Buy 2 Get 2 (4 boxes). A free gift item comes with every box. AOV ~$45, ~50 orders/day in SE, now also 20+ countries.

We are SOLD OUT right now. Next stock lands in ~8 days and will likely sell out fast. Our best ads already say "it sold out last November". We keep selling as pre-order with an honest ship date (box on PDP + line in cart).

We want to build the pre-order INTO the bundle picker and make it the strongest honest urgency possible. Questions:

1. Structure: should the bundle tiers change during pre-order (e.g. push the 4-box tier harder, "secure 4 before it's gone"), or keep the exact same tiers and only change framing?
2. What elements convert best in a pre-order picker? E.g. "Batch 2: X of Y reserved" progress bar (real numbers only), ship date on each tier, "Pre-order" button text vs "Add to cart", a live countdown to the ship date?
3. Should we add a pre-order bonus (small gift/store credit) or no sweetener at all? We want to save our best offer for BFCM, and BOGO is already our everyday offer.
4. Copy: how do you phrase "sold out last November, sold out again now, next batch is shipping in X days" without sounding fake?
5. What happens when the new batch lands and sells out again: roll straight into "batch 3 pre-order" with a new date, or stop selling?
6. Any risks you've seen (chargebacks, CS load, Meta ad rejections for "sold out" claims) and how to avoid them?

Examples from Evolve brands of pre-order pickers that crushed would be gold.
```
