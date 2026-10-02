# Frågorna till Evolve-boten om creative strategy

Axel klistrar in frågan i Evolve-botens chatt (Chadbot, Discord) och klistrar
tillbaka svaret till Claude. Svaret sparas i `SVAR.md` här bredvid. Samma
arbetssätt som `messenger/EVOLVE-FRAGOR.md` och `klaviyo/evolve/FRAGOR.md`.

⚠️ **Inget i frågan avslöjar brandet** (Axels krav 2026-09-26): inga
butiksnamn, inga domäner, inga produkttitlar, inga exakta tal. Klistra in
frågan som den står. Boten har timeout, så allt står i ETT meddelande.

---

## Efterköpsenkäten: research, feedback-loopen och hit rate (2026-09-30)

**Axels fråga:** hur gör vi research och efterköpsenkäter, hur använder vi dem
för att förbättra feedback-loopen och creative-tratten så att fler annonser blir
vinnare, och vilka är de vanligaste metoderna.

**Vad vi redan vet, så att frågan inte upprepar det:**
- Boten har aldrig fått en fråga om enkäter (kollat i `klaviyo/evolve/`,
  `stonebite/evolve/`, `messenger/` och `factory/tacksida/`).
- Kursen har sju fynd om köparenkäter (`docs/ecomtalent/fynd.json`):
  Spencer 5 december [17:54]–[18:40] (43–46 % av köparna nämnde samma begär,
  och en invändningsannons byggd på svaren blev top spender), Shaun & Spencer
  Q&A [44:31] och [46:06] (enkäten säger varför folk köper, och udda svar kan
  visa en ny avatar), 6 mars [34:02] (anlita någon som intervjuar tidiga
  kunder) och 13 mars [1:05:38]–[1:07:12] (mejla alla köpare en Typeform med
  utlottning av en gratisprodukt).
- `docs/os/EPOST-STRATEGI.md` har redan raden "en enkät till köpare ger
  `voc` till både mejl och annonser — kräver Axels ok".

**Talen i frågan är avrundade:** cirka 70 etiketterade annonser utan en enda
Breakthrough i en butik (mätt vid bygget av `/matstrumporkungen` 2026-09-23:
72 etiketter, 0 breakthrough), återköp cirka 3 % (`klaviyo/evolve/FRAGOR.md`).

Frågan är skriven i tre utkast. Två granskare har jämfört dem, och den som vann
har sedan kontrollerats mot reglerna. Den är 1 970 tecken lång, räknat med
node, alltså under Discords gräns på 2 000.

```
I run several Shopify stores (Nordics + some EU/English markets, ~12 languages): a general store + one-product stores, hobby niches (boats, caravans, garden, fishing) plus one novelty gift. ~100 % Meta traffic, 40-100 EUR, 5-10 business days shipping from China, repeat rate ~3 %, a few thousand orders/month.

Loop: each ad gets a day-7 course label and a written learning; labels set the iteration vs new-idea mix; briefs cite a learning, proven angle, winning line or competitor swipe. Customer voice: ad comments, reviews, Reddit, support emails (mostly "where is my order"); no survey or interviews. Hit rate: one store has ~70 labelled ads, zero Breakthroughs. After delivery we send a tips email, and a review request ~10 days later; one store has its own thank-you-page extension (not Plus).

We know Spencer's Dec 5 call (missed desire; survey-built objection ad became top spender), the Shaun & Spencer Q&A (outliers reveal avatars) and the Mar 6/13 Q&As (interviews, giveaway Typeform). Answer each briefly with what members actually ran or measured; say plainly when no source covers it:

1. Methods: which do members run most (thank-you page, post-delivery email, giveaway survey to past buyers, interviews, review mining)? Rank by winners, one example each.
2. Questions: the exact 3-5 behind winning angles? Open or multiple choice? Thank-you page (fresh "why I bought") vs after delivery, or both?
3. Setup: response rates per channel? Incentive bias? Every language or English only? Gifts (buyer is not user)? Week one: one survey for all stores or per product?
4. Into the creative funnel: how do you tag answers (desires, objections, avatars) and which feed cold hooks vs objection ads? Answers needed to trust a pattern? Testing outliers without chasing noise? New angle vs iteration? Do you tie answers to the ad that drove the order?
5. Proof: has anyone measured hit rate of survey-sourced concepts vs comments, swipes and iterations? How tracked?
```

---

## Fråga 2 (2026-10-01): följdfrågan efter svaret

Svaret på fråga 1 står i `SVAR.md`. Boten läser Discord-trådar och kursdokument,
inte de inspelade samtalen, så den här frågan ber bara om det som kan finnas
där. Planen den stöder står i `ENKAT.md`. Ett meddelande, 1 013 tecken, utan
brand.

```
@Chad Follow-up on buyer surveys (your answer earlier). Three short things only; say plainly per item if no source covers it, and don't repeat what you already said.

Context: several Shopify stores (Nordics + EU/English, 10+ languages), hobby niches + one gift product, ~100% Meta, a few thousand orders/month, not Plus. We plan 1-3 open-text questions right after purchase, no incentive: what happened that made you buy this now, where did you see it, is it for you or someone else. One store gets a card on its thank-you page; the others get a link in the order confirmation email.

1. Spencer's customer feedback survey framework from the CRO program: is it in your course documents? If yes, quote the exact questions. If not, just say no.
2. Has any member put a survey link in the order confirmation email instead of on the thank-you page? Rough reply rate per 100 orders, or say none.
3. For a thank-you page survey without Plus: which app or setup did Sem or other members actually use? Name + tool only.
```

---

## Veckorapporten till redigerarna (frågan 2026-10-02)

**Axels beställning 2026-10-02:** en rutin som varje vecka säger redigerarna
vilka av DERAS annonser som fick mest spend och hur de gick (spend winner,
KPI winner, breakthrough, loser), skickar ett Discord-meddelande till var och
en, förklarar varför utfallet kan ha blivit som det blev utifrån briefen och
klippningen, och ger ett litet action item per vecka (testa en sak, läs ett
researchdokument, titta på konkurrenters annonser) med förberedda action
items per utfallstyp. Först frågar vi Chadbot. Sedan utvecklar Axel och
sessionen systemet ihop.

**Underlaget** (fem läsare + en kritiker över repot, 2026-10-02): det mesta
finns redan byggt eller besvarat, så frågan rör bara det som saknas.

Byggstenar som finns: etiketterna i `matstrumpor/etikett.mjs` (Evolves fyra
utfall + INGEN_LEVERANS, uppgradering vecka 2–3, `hitRate()` med två nämnare)
och Bäverbutikens kopia `agent/etikett.mjs` på grenen
`claude/daily-agent-discussion-uos5df` (3 827 ETIKETT-rader med
`utford_som_briefad`); annons → redigerare i `commission/koppling.mjs`
(hubbradens Ansvarig, Jerzee via kommentar); Meta per annons med hook/hold
i `matstrumpor/meta.mjs`; playbooken per utfall i `matstrumpor/lardom.mjs`
(`PLAYBOOK_PER_UTFALL`); regitabellen i briefen sedan 2026-09-21
(`tools/briefgranskning.mjs regiUr`); Discord-postarna med engelskspärr
(`tools/discord-rapport.mjs`, `stonebite/kallor/discord.mjs`).

**Redan besvarat — fråga inte igen:** vinnardefinitionerna
(`ITERATIONS-PLAYBOOK.md` avsnitt 1), Karlos fem redigerar-KPI:er, "visa
datan, fråga hur du kan hjälpa", ersättningen (% av spend, aldrig fart,
hit rate går att fuska med), tvålagerstavlan, Spencers "alla vinnare + 1
förlorare per batch" och Lewis måndagsgranskning
(`stonebite/evolve/SVAR.md` svar 2 och 3), hit rate 5–10 % / 2–4 %
(`products/matstrumpor/CHADBOT-SVAR-2026-10-02.md`), felkatalogen och de
24 iterationerna per utfall (`ITERATIONS-PLAYBOOK.md` avsnitt 4–8). Boten
har redan sagt "no source" om hur en redigerare ser sitt resultat utan att se
spend, och om hook/hold/CTR som dashboardmått — därför frågar vi 4 som "vad
GÖR ni", inte "vad säger kursen".

**Olästa lektioner som kan svara före boten** (kräver `SKOOL_EMAIL` +
`SKOOL_PASSWORD`, saknas i den här miljön 2026-10-02; `tools/skool/`):
"How To Get A-Players Editors & Content" `542a4102971a4d328b9853609004422a`
(📝13 141 tecken), "How To See Ads Performance + Our Columns"
`1b74584216754b60a3415aca2f1a76b0`, "How To Do Learnings - Questions"
`7d9d6bbb3f6f419b94cab6c24f3f7a0a`, "How To Train Editors On AI"
`c68f2c9d87d04a38a4c01789c8acc531`, "How To Get Viral UGC Inspo For Creators
& Ads" `a4db7083d9654e6590cfcf06b14e3393`. Läs dem i en session som bär
nycklarna innan systemet byggs.

**Fyra saker att reda ut med Axel, inte med boten, innan bygget:**
1. Ordern "mest spend per redigerare" mot järnregeln 2026-09-02 "spend visas
   aldrig för redigerare" — andel av kampanjen i procent, rang och etikett
   läcker inga kronor (Laget-sidan visar redan andel), men det är hans beslut.
2. `bedombar` räknas ELLER i `matstrumpor/etikett.mjs` (300 kr eller 3 köp)
   men OCH i ANALYSMETOD och agent-grenen. En etikett som visas en människa
   måste ha EN grind.
3. `tools/discord-rapport.mjs` postar redan "Spend: N SEK" + ROAS i
   OPS-servrarnas `#ads`, där redigeraren sitter — regeln bryts där i dag.
4. Josh, Annabelle, Gilz och Jerzee saknar Discord-id i repot (bara Carl och
   Jasper/jazzer1522 har), Matstrumpor har ingen Discord-server och Gilz har
   bara Slack-id. Ingen kod skickar Discord-DM; allt är kanalpost med `<@id>`.
   Och INGEN_LEVERANS är inte alltid redigerarens: Gilz batch #1 svalt av
   adsetet (`products/matstrumpor/lardomar.md`).

**Frågan**, 1 991 tecken räknat med node, utan brand, domän, produkttitel
eller exakta tal. Svaret klistras in ordagrant i `SVAR.md` under rubriken
"Veckorapporten till redigerarna (frågan 2026-10-02)".

```
Context: several Shopify stores (Nordics/EU), ~100 % Meta, remote video editors paid a % of spend on their ads, never shown money. Every ad gets a day-7 label (Breakthrough / Spend Winner / KPI Winner / Loser / no delivery) and a written learning; briefs have a per-line direction table (time, line, text, picture, editor latitude). We're building a weekly Discord message per editor: her ads, label, why, one small action item. We already have the winner definitions, Karlo's editor KPIs, % of spend comp, the two-layer board, "winners + 1 loser per batch", Lewis's Monday review, the hit-rate benchmarks and the iteration playbook per outcome; don't repeat those. Say plainly where no source covers it.

1. Brief vs edit: when an ad loses or stalls as a KPI winner, what tells you the EDIT failed (hook rate below expectation, hold dropping at one cut, text off the direction, pacing, music, captions) rather than the script? When she cut exactly as briefed and it still lost, how do you word it as a learning, not criticism?

2. Action items per outcome: the one thing you give an editor after a loser/no-delivery, a KPI winner, a spend winner (good hold, weak conversion) and a breakthrough: a craft exercise (re-cut the first 3 s, study the top hook), a research doc, or competitor ads? How much per week before it's noise?

3. Editor hit rate in a CBO: about half our labelled ads got almost no delivery in week 1 (the CBO fed the champion ad set). Her losers, excluded, or a separate label? And exclude iterations of an existing winner?

4. Your editors' own learnings call: which ads and numbers (label, share of campaign spend in %, hook/hold, retention curve), which they don't see, what they bring to the main call? Per ad or per week, channel or 1:1, and how do you stop a loser label from feeling like a ranking?

5. Weekly report vs the 7-day label: ads launched mid-week, labels upgraded in week 2-3, and the minimum spend or purchases before a label is fair to show a person?
```
