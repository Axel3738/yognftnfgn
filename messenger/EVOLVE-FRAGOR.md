# Frågorna till Evolve-boten om Messenger-svar

Axel klistrar in en fråga i taget i Evolve-botens chatt (Discord) och klistrar
tillbaka svaret till Claude. Svaren sparas i `EVOLVE-SVAR.md` här bredvid.
Samma arbetssätt som `factory/tacksida/EVOLVE-FRAGOR.md`.

⚠️ **Inget i frågorna avslöjar brandet** (Axels krav 2026-09-26): inga
butiksnamn, inga domäner, inga exakta ordertal. Klistra in frågorna som de står.

Bakgrunden (2026-09-29): flera Shopify-butiker i Norden med Meta-annonser som
enda trafikkälla, leverans 5–10 arbetsdagar, de flesta ärenden handlar om var
paketet är. Kunder skriver i Messenger och Instagram DM och klagar på att
mejlen inte besvaras. Antalet DM:s är OKÄNT — vår nyckel kan inte läsa
inkorgen (saknar `pages_messaging`). Messenger-boten är byggd på grenen
`claude/matstrumpor-ab-test-6trycn` (`messenger/`) men parkerad tills svaren
och en volymmätning finns. Frågan som ska avgöras: bot, Metas inbyggda
automatsvar, VA i inkorgen, eller inget.

---

**Fråga 1: är det värt det alls**

```
I run several Shopify stores in the Nordics, 100 % of traffic from Meta ads, mid-ticket products (40–100 EUR), delivery 5–10 business days. Customers message our Facebook pages and Instagram in DM, mostly "where is my order", and some complain that we don't answer email. We don't know the volume yet.

What does the community see as the actual payoff of answering Messenger/IG DMs fast? Does it measurably reduce chargebacks and bad reviews, does it drive extra sales (pre-purchase questions), or is it mainly damage control? Is there any data on DM volume as a share of orders for stores like this, so I can judge if it's worth building anything?
```

**Fråga 2: påverkar svarstiden annonserna**

```
Same stores. Does page responsiveness in Messenger (the "very responsive" badge, response rate/time) have any effect on ad delivery, CPM or ad account health on Meta? Or are unanswered DMs and ignored comments irrelevant to the ad auction? Looking for what members have actually measured, not theory.
```

**Fråga 3: bot, Metas egna automatsvar eller VA**

```
Same stores. Three options for DMs: (a) Meta Business Suite's built-in automations (instant reply, FAQ buttons, away message) pointing to our tracking page and support email, (b) a custom bot through the Messenger API that looks up the order in Shopify and answers with the tracking status, (c) a VA who works the Business Suite inbox once or twice a day.

What does the community run at this size, and what works best for "where is my order" messages specifically? Is a custom API bot worth the Meta app review hassle, or do the built-in automations plus a VA cover 90 % of the value?
```

**Fråga 4: vad svaret ska säga**

```
Same stores. For a "where is my order / you never answer my emails" message in DM, what first reply does the community use to calm the customer and stop them from opening a dispute with their bank? Should the reply move the conversation to email, or solve it in the chat? Any wording that members have seen work well?
```
