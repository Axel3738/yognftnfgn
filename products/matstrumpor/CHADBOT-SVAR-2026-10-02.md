# Chadbots svar 2026-10-01 kväll (på frågan i `CHADBOT-2026-10-02.md`)

Klistrat av Axel samma kväll. Ordagrant nedan, sedan vad vi gör med varje svar.
Källhänvisningarna [C1]–[C7], [D1]–[D2] är botens egna (kursens lektioner).

## Vad vi gör med svaren

| Fråga | Chadbots svar, kort | Vårt beslut / bygge |
|---|---|---|
| 1. Fler från Nathalie eller hennes manus till nya? | **Fler från Nathalie först** (Spencer: en kreatör vars video funkar blir betald månadsambassadör, "let her keep cooking"). Nya kreatörer med hennes manus går bra parallellt, men vänta inte på dem. Med en video går det inte att veta om det var manuset eller ansiktet. | Axel frågar Nathalie om en löpande runda (meddelande i `factory/ugc/utskick/2026-10-01-matstrumpor.md` → 0). De nio nya kreatörerna fortsätter parallellt. Priset/månadsupplägget är Axels. |
| 2. Hög hold, 1 % konvertering: funnel eller urgency? | Mät **ATC-graden** (Khalifa AF): under 8 % ⇒ annonsen och sidan säger olika saker, fixa landningssidan (kongruens: vinkel, önskan, löfte); 8–12 % med dålig CVR ⇒ friktion/betalning på sidan; ATC frisk ⇒ trust/urgency i annonsen (vad händer om de inte agerar nu). Spend winners faller nästan alltid på CVR, inte CTR; vanligaste fixarna trust och urgency. | ATC-graden mäts i rutinen per annons (`kor.mjs --hamta` läser `add_to_cart` och `landing_page_view`, domen skriver ut den för spend winners; byggs i nästa session). Mätningen 2026-10-01 kväll står under "ATC mätt" nedan. |
| 3. Hit rate: hur räkna, vad är normalt? | vinnare ÷ alla testade. Spencer: vinnare 5–10 %, super winners 2–4 %, sjunker vid skalning. Räkna per idékälla (iteration/imitation/ideation) och dubbla ner på den som ger flest vinnare för DITT brand; luta åt ideation + imitation innan du skalar, iterationer när du skalar. Ingen källa ger tal per spendnivå. | Arkivet räknar redan hit rate per typ (IDEA/ITER/IMIT) och totalt. Benchmarkraderna (2–4 / 5–10 %) skrivs in i `products/matstrumpor/arkiv.md`-huvudet via `arkiv.mjs` nästa rond. Vår 2 % = super winner-nivå på för liten volym; volymen är läckan, inte kvaliteten. |
| 4. Routing: testa i champions adset eller egna? | **Varken A eller B: DCT (3:2:2).** Nya annonser i EGNA adset i samma kampanj, som dynamic creative test: 3 annonser, 2 rubriker, 2 primärtexter per adset — "engagement does not decide spend", nya annonser får spend ändå. Flytta in i huvudadsetet först när annonsen tagit 20–30 % av testadsetets budget. Risken med champions adset: outprovade annonser stör optimeringen och drar spend från det som bevisat funkar. | ROUTING-alternativ **C** till Axel: uppladdaren bygger ett DCT-adset per batch (dynamic creative på, ≥ 3 videor, 2 rubriker, 2 texter) i `MATSTRUMP_SALES_20260826`, och kungen flaggar "flytta till huvudadsetet" vid 20–30 % budgetandel. Kräver ombyggnad av `/matstrumpor` (Adsmanager-MCP:n) — byggs när Axel sagt C. Vår egen data (Gilz 11 videor, 35 kr) var VANLIGA adset, inte DCT, så den motsäger inte botens svar. |

## ATC mätt 2026-10-01 kväll (Meta `last_14d`, kontot nya kungen, annonser ≥ 300 kr, läs-bart)

ATC % = `omni_add_to_cart` ÷ `landing_page_view`. CVR % = köp ÷ LPV. Tröskeln ur Chadbots svar: under 8 % = annonsen och sidan säger olika saker.

| Annons | Adset | Spend | LPV | ATC | ATC % | Köp | CVR % | ROAS |
|---|---|---|---|---|---|---|---|---|
| 09-17 Nathalie captions musik | 09-17 UGC | 69 522 | 15 134 | 827 | **5,5** | 351 | 2,3 | 2,14 |
| MATSTRUMP_sushi_gift_ugc_haikuh2_v1 | nya16 | 4 389 | 437 | 30 | 6,9 | 15 | 3,4 | 1,43 |
| MATSTRUMP_sushi_offer_static_d3_v1 | bilder | 3 820 | 381 | 49 | **12,9** | 17 | 4,5 | 2,08 |
| MATSTRUMP_sushi_gift_ugc_012v2_v1 | nya8 | 698 | 90 | 20 | 22,2 | 1 | 1,1 | 0,57 |
| Sofie H1 Sushi Captions Ingen musik | 09-17 UGC | 501 | 76 | 15 | 19,7 | 4 | 5,3 | 3,18 |
| MATSTRUMP_sushi_gift_ugc_haikuh3_v1 | nya16 | 461 | 40 | 1 | 2,5 | 1 | 2,5 | 0,87 |
| 09-24 Katarina sushiälskaren i ditt liv | 09-17 UGC | 355 | 38 | 2 | 5,3 | 2 | 5,3 | 2,39 |
| 09-24 Katarina Sushigalen unge | 09-17 UGC | 301 | 28 | 2 | 7,1 | 0 | 0,0 | 0,00 |
| **Alla åtta** | | 80 047 | 16 224 | 946 | **5,8** | 391 | 2,4 | |

**Vad det säger (Chadbots ram, inte min åsikt):** Nathalies vinnare ligger på 5,5 % ATC, under 8 %. Annonsen säger *present* ("ge bort dom", "favoriträtt") och landar på den vanliga produktsidan `matstrumpor.se/products/sushi-strumpor` (rubrik "Rolig i kväll. På fötterna i morgon.", text om tvättmedel och skämtpryl — inte present). Bildannonsen d3 "Köp 2 – få 2" ligger på 12,9 % med samma sida, så sidan i sig konverterar när erbjudandet och sidan säger samma sak. Fixen enligt kursen: en landningssida som matchar presentvinkeln, inte mer urgency i annonsen. Siffrorna under 100 LPV (012v2, Sofie, haikuh3, Katarina) är för små att döma på.

## Botens svar ordagrant

1. Order more from the same creator first — Spencer's playbook is to onboard a working creator as a paid monthly brand ambassador and let them keep cooking [C1][C6].
   1. Same creator vs new creators with her script

Spencer is explicit: "you should really only hire a creator if they make an ad for you that actually performs" [C6]. When a creator's own-idea video works, Spencer says onboard them, pay them monthly, and let her keep cooking [C1]. Shaun agrees: "Ya pay" [C1].

The key insight from Spencer: "it's one video each... imagine judging creative strategy after making two ads" [C6]. You don't have enough data to isolate whether it was the script or the face — and Spencer warns that every creator is different, some need scripts and some don't [C6]. Trying to replicate with new creators right now would tell you very little with just one data point from the original.

So: order more from her first. If you also want to test the script with 2-3 new creators, that's fine in parallel — but don't wait for that result before getting more content from the person who already delivered.
   2. High hold (~75%), low LP conversion (~1%) — fix funnel or urgency?

The diagnostic from Khalifa AF's framework is your ATC rate [C7]:
   * ATC below 8%: confirms funnel/offer mismatch — the ad grabs attention but the page doesn't convert that attention into intent. Fix the funnel first.
   * ATC 8-12% with bad CVR: friction or payment issues on the page itself.

The pattern you're describing — good secondary KPIs (hold rate) with bad primary KPIs (conversion) — maps to "ads and offer mismatch" in his framework [C7].
2. The course material backs this up: spend winners almost always fail on conversion rate, not CTR, and the most common fixes are trust and urgency, with funnel congruence as a third, less common issue [D1]. Since your hold rate is exceptional but LP conversion is 1%, start by checking congruence: does the landing page match the angle, desire, and promise of the ad? D1 gives the example of an ad targeting men that landed on a page showing a woman — that mismatch kills conversion even with a great ad [D1].

Practical order: check ATC first. If it's below 8%, fix funnel congruence (make the page match the ad's angle). If ATC is healthy, the issue is trust or urgency in the ad itself — escalate the problem in the script (what happens if they don't act now) [D1].
   3. Hit rate: how to count and what's normal

Shaun's formula: winning ads / total creatives tested [C4]. Spencer's benchmarks: winners are 5-10%, super winners (ads that actually rip) are 2-4%, and hit rate drops as you scale [C2]. Your 2% is at the low end of super-winner territory — which could mean your winners are strong but you're not producing enough total volume, or your hit rate is genuinely low.

On tracking per idea source: Spencer says track which source (iterations, imitations, ideations) produces the most winners for YOUR brand and double down [C3]. One of his brands has a high hit rate on imitations; another is all iterations [C3]. His general guidance: lean toward ideations and imitations when you're not yet scaling, and shift toward iterations once you are scaling [C3]. Shaun adds: focus on more ideations since that's what scales accounts [C5]. There's no golden ratio — base it on your own data [C5].
3. No source breaks down hit rate benchmarks by spend level (5-15k/month specifically), and no source gives per-source hit-rate numbers. The 2-4% / 5-10% benchmarks are general, not tied to a spend tier.
   4. Routing: test in champion's ad set or separate ad sets?

The course material's 3:2:2 DCT method is specifically designed to solve this problem. The key finding: "engagement does not decide spend" — new ads get spend regardless of how much engagement proven ads have, because Facebook evaluates each ad independently on quality, relevance, and conversion rate [D2]. In their first DCT test, brand new ads with zero engagement outspent proven ads on day one [D2].

In a standard CBO, the champion ad set dominating 85% of spend is expected behavior — the algorithm favors what's already performing. The DCT structure solves this by testing new ads in dedicated ad sets within the same campaign, where new ads get real spend [D2]. The 3:2:2 method uses 3 ads, 2 headlines, 2 primary texts per ad set — minimum 3 ads so the algorithm can leverage the test [D2].

The risk of putting new iterations into the champion's ad set: the champions ad set is optimized around proven winners. Adding unproven ads risks Meta distributing spend to ads that don't convert as well, diluting the ad set's overall performance. D2 also warns: don't move small-spend, high-ROAS ads into the main ad set until they've taken at least 20-30% of budget in a test ad set — at 5-15% spend share, they haven't been validated at scale [D2].
4. That said — you observed that ads placed in the champion's ad set got $300/week with purchases. This might work short-term, but the course structure separates testing from scaling for a reason: unvalidated ads in the champion ad set can disrupt Meta's optimization and pull spend away from proven winners before you know if the new ads hold at scale. The DCT method gives you the clean test environment without starving new ads — if you're not using DCTs yet, that's the structural fix, not testing in the champion's ad set.
