# Evolve-botens svar om e-post (minnet, så nästa session slipper fråga igen)

Evolve är communityt Axel är med i (Discord). Servern har en AI-bot som kan hela
Evolve-kursen. Svaren nedan klistrade Axel in ordagrant i chatten. `[C1]`–`[C4]` är
botens egna källhänvisningar till Discord-inlägg. Vi har inte läst de inläggen själva.

## Svar 1, 2026-09-24: ska vi använda Klaviyo?

> Klaviyo is the clear answer — Shopify's native email and flow apps are too limited on
> customizability, and everyone in the community defaults to Klaviyo. [C1][C2]
>
> Billy's recommended tech stack [C3]:
> * Email: Klaviyo
> * SMS (US/CA): OneText — or Postscript as an all-in-one alternative for all countries
> * SMS (rest of world): Klaviyo
> * Popups: AliaLearn (superior) or Optimonk (simpler)
> * Anonymous emails: OpenSend (monitor deliverability)
> * 1st-party email data: Aimerce
>
> Walkthrough: https://www.loom.com/share/e96772698a394b76b1d52e8b2a8020e0 [C3]
>
> One thing to do once you're in Klaviyo: Change attribution settings from the default
> 5-day open / 5-day click to click-only (5-day or shorter), and exclude Apple Mail
> Privacy opens — otherwise your attribution gets inflated by Apple users who never
> actually opened the email [C4].
>
> If you're not at scale yet, don't overcomplicate with granular segmentation and A/B
> testing. The highest-leverage tests are subject line, sender name, preview text, topic,
> and the core idea of the email [C3].

Billys Loom heter "Building an In-House Email and SMS Strategy for Brands". Enligt
beskrivningen gäller den varumärken under 10 miljoner dollar om året. Rådet är att ha
en designer och en retention-strateg in-house, och att lära upp en person från grunden.
Transkriptet går inte att läsa härifrån, eftersom Loom kräver en Atlassian-koppling.
Allt vi vet står i beskrivningen, läst 2026-09-24.

### Vad vi gjort med svaret

| Råd | Hos oss |
|---|---|
| Klaviyo | Redan valt, kontot TMFt7M finns. |
| Attribution bara på klick, högst 5 dagar, Apple-öppningar exkluderade | Axels klick i Klaviyo (Settings → Attribution). Står i `sop/E00`, `sop/E06` och kommandot `kolla`. `rapport.mjs` dömer redan aldrig på öppningar. |
| Inte för många segment eller A/B-tester före skala | Vi kör med bara 3 kampanjsegment (uppvärmningstrappan). Enda A/B-testet är ämnesraden, och den finns redan i varje kampanj. |
| Testa ämnesrad, avsändarnamn, förhandstext, ämne och kärnidé | Ämnesrad A/B/C finns. Ämne och kärnidé är varje kampanjs `memo`. Avsändarnamnet testas senare, ett i taget. |
| Popup (AliaLearn/Optimonk) | Axels beslut, kostar pengar. Kontot saknar formulär helt (mätt 2026-09-24). |
| ⚠️ OpenSend ("anonymous emails") | **Använd inte i Sverige.** Verktyget hittar e-postadresser till besökare som aldrig lämnat dem. Att mejla dem reklam bryter mot marknadsföringslagen 19 §, som kräver samtycke, och GDPR. Rådet kommer från en amerikansk stack. |
| SMS | Inte nu. Klaviyo SMS utanför USA om det blir aktuellt. |

---

## Svar 2–8, 2026-09-24 (frågorna i `FRAGOR.md`, klistrade av Axel)

Sammanfattning. Botens egna ord står i citaten. `[Cn]`/`[Dn]` är botens källor.

**Viktigast: Evolve har INGET om flödesstruktur.** Boten: "No source provides flow
build order, email counts per flow, timing/delays, or what each email should
accomplish. The documents have zero email/Klaviyo content." Rådet är att modellera
brands som redan lyckas: prenumerera på deras välkomst- och kassaflöden
(Passlikenash [C1]), Trendtracks e-postdel (Alex G [C1]) och Milled.com för
konkurrenternas mejl (umzrs [C3]).

| Fråga | Vad Evolve säger | Källa |
|---|---|---|
| 1 Flöden | Ingen mall. Modellera brands som lyckas. Återköp på 3 % löses mer med nya produkter och designvarianter än med flöden (Shaun: Oodie 60 %), och med mun-till-mun (Spencer). | [C1][C2] |
| 2 Kassa/webb | Rabattlänk som lägger på koden själv: `/discount/KOD?redirect=/…` (Zack TTA). Mystery-rabatt kan testas (Nejc N). **Kassamejl 1 ska ha över 35 % öppning, annars är det ett leveransproblem** (Billy). 10 %+ CVR är baslinjen för hobbynischer (Billy). OpenSend för webbhistorik: ej tillåtet i Sverige, se ovan. | [C1][C2][C3] |
| 3 Köpare som köper en gång | Sälj det som **kompletterar**, inte mer av samma. Korsförsälj efter användning, inte kategori. Damons metod: topp 100 kunder efter LTV, tiden mellan köp 1 och 2 och vad köp 2 var → bygg erbjudandena i den ordningen. Korsförsäljning 0–3 dagar efter köp om erbjudandet är starkt (Ankit P). Gåvotröskeln får inte utesluta storsäljaren (Spencer). Gåvan ska höja chansen till resultat (Ky). Butikskredit används till cirka 30 % och är billig (Grayson). Minst 1 500 sessioner innan ett post-purchase-test döms. | [C1–C6][D1][D2] |
| 4 Uppvärmning | Inget i källorna. "ask the community directly". | – |
| 5 Bra mejl | Billy: testa ämnesrad, avsändarnamn, ämne, förhandstext och kärnidé. Lanseringskadens: nyfikenhet → teaser → avslöjande med datum → nedräkning → "missade du?". Längd och design vs ren text: inget i källorna, använd Milled som baslinje. | [C2][C3][C5] |
| 6 CS-loopen | Imitation = konkurrenternas mejl (Milled), iteration = vinnande annonsvinklar anpassade för mejl, idé = vinklar som inte körts på Meta. Ämnesrad = hook, förhandstext = vinkeln, brödtext = löftet och beviset. Inga siffror för testlängd eller riktmärken under klick-attribution. | [C2][C5][C6] |
| 7 Popup | Alia (alialearn.com) med managed plan. Testa först fördröjningen 7 s / 20 s / 55 s, sedan erbjudandet: mystery / % / kr. Procent minst 20 %, vid högt AOV kronor i stället. Inget om Sverige. | [C2][C5][C7][D1] |
| 8 Vem gör jobbet | Billy: lär upp folk in-house (Klaviyo Academy, hans SOP-checklista, hiring doc). Zarak Adam: en person räcker inte, det behövs teknik, design, copy och en retention-ansvarig. VA:n gör utförandet, strategin ligger hos ägaren eller en retention-lead. E-post är värt riktig insats över 100k $/mån (umzrs). Inget om AI först, VA sedan. | [C1–C4][D2] |

### Vad vi gör med svaren
- **Flödesstrukturen researchas utanför Evolve** (Klaviyos egna guider och benchmarks, riktiga mejl på Milled från jämförbara butiker). Evolve säger själv att den inte har det.
- **Damons metod körs på vår egen Shopify-data:** vad köparna som kommit tillbaka köpte i köp 2, och när. Det styr efter-köp-flödet.
- **Riktmärket för leverans:** kassamejl 1 under 35 % öppning = leveransproblem. In i `EPOST-STRATEGI.md` som externt riktmärke (Billy), inte som vår data.
- **Popup, välkomstrabatt, rabatt i kassaflödet och butikskredit** är Axels beslut (pengar). Förslagen står i hans frågelista.
- **Arbetsdelningen stämmer med planen:** Claude (och Axel) gör strategin, VA:n gör utförandet efter SOP:erna. Zaraks poäng är skälet till att VA:n aldrig äger strategin.

### Axels beslut 2026-09-24: ingen popup (än)
"Jag tycker typ vi kör utan popup nästan." Alia köps inte. Nya prenumeranter kommer
alltså bara från kryssrutan i kassan och de två Shopify-formulären i sidfoten och på
startsidan. Följden för flödena: välkomstflödet (F01) får få mottagare, och de flesta
som kommer in i listan har redan köpt. Pengarna i e-posten ligger därför i flödena för
kassa, efter köp och vinback. Beslutet prövas igen när flödena går.

---

## Svar 9–14, 2026-09-26 (omgång 2 i `FRAGOR.md`, ställd som EN fråga, klistrad av Axel)

Återkommande kunder i en general store. Botens egna ord i sammandrag, `[Cn]`/`[D1]` är botens källor.

| Del | Vad Evolve säger | Källa |
|---|---|---|
| Vad ger köp nummer två | Yuval A (hobbynisch, 20+ produkter, $200k/mån): 30 % av intäkten från e-post/SMS, **85 % av det från flöden**, 15 % från kampanjer. Ny kompletterande produkt till gamla köpare: "just email blast them" (Shaun). | [C5][C3] |
| Korsförsälja per ägartyp eller bästsäljare | Inget i källorna. Testa själv. | – |
| Trigger leverans eller order | Ankit P: korsförsälj **0–3 dagar efter ordern**, inte efter leverans, om erbjudandet är starkt. Ingen källa jämför triggrarna. | [C2] |
| Erbjudandet för köp två | Grayson: **butikskredit via presentkort** är billigast. Cirka 30 % används, så 100 $ kredit kostar ungefär 5–7 $ med 25 % COGS. Hur och i vilket mejl: inget i källorna. Befintliga köpare svarar på volym (BOGO), nya på procent (BFCM-anteckningar). | [C6][D1] |
| Vinback utan cykel | Inget i källorna. | – |
| Kampanjer per vecka, riktmärke | Billy: 3–5 kampanjer i veckan, rea blandat med värdemejl, men för prospektlistor. Inget riktmärke för 90 dagars återköp. | [C4] |

### Vad vi gör med svaret
- **Flödena är huvudspåret**, inte kampanjerna. Stämmer med planen.
- **Tipsmejlen går efter leverans** (Axels beslut 2026-09-26: leverans + 1 dag). De är instruktioner, inte försäljning. Evolves 0–3 dagar gäller korsförsäljning.
- **Ett korsförsäljningsmejl dag 1–3 efter ordern** är värt ett test i F04. Vår egen data pekar åt två håll: 14 av 16 snabba återköp skedde inom första timmen, men riktiga återköp har median 18 dagar (`ATERKOP-ANALYS.md`).
- **Butikskredit** är Axels beslut (pengar). Frågan är ställd.
- **Nya produkter mejlas som kampanj till köparna** (Shaun).

---

## Svar 9, 2026-09-27: klubbdragningen och kundbilderna (Matstrumpor)

Frågan står i `FRAGOR.md` (fråga 9). Axel klistrade in svaret ordagrant; `[Cn]`/`[Dn]`
är botens källor. Numreringen är botens egen (delvis dubblerad i inklistringen).

> 1. No source has direct data on in-list giveaways lifting engagement, but the community's framework is clear: treat the draw as a revenue mechanism (consolation offers to non-winners), track LTV as the success metric, and use VIP early access as your exclusivity lever rather than the draw itself [C2].
>    1. Giveaway draws on an email list — engagement lift or freebie-seekers?
>
> No source has open/click/repeat-purchase data from in-list draws. What the community does say:
>    * Spencer's test: "As long as you're tracking LTV, no" — LTV is the metric, not engagement signals [C2]. The question is whether the draw produces paying customers, not whether opens go up.
>    * Dan on giveaways: target creators (video entry), avoid general audience [D3]. Broad "win free stuff" pulls freebie-seekers. Your draw is scoped to existing buyers, which is better, but the principle stands.
>    * Spencer on sweepstake vs. per-person reward: a draw is fine for low-friction asks — "if you're doing a long ass survey, for sure, but otherwise just no need IMO" [C3]. A photo submission is a light ask, so capping cost with a draw is the right call rather than giving every responder a box.
>
> Your Tuesday draw won't lift open rates just by existing — it needs to be one tactic inside a content strategy, not the strategy itself.
>    2. Turning winners into usable UGC
>
> The sources are blunt about customer photo quality:
>    * D1: "Raw footage from customers: Often poor unless content creators." The course recommends automating a post-review email offering a discount for video, and building an Instagram for inbound UGC/reposts [D1].
>    * Shaun on directing people who get free product for UGC: "give examples of what's working but specify it's examples they don't have to follow" [C1]. Send winners a short guide with example photos and angles, without scripting them.
>
> * Dan's point about targeting creators with video entry [D3] suggests the best UGC comes from people who already create content. Your random draw will get variable quality — set expectations accordingly.
>
> No source covers consent forms, photo resolution requirements, or follow-up sequences for non-responders.
>
> 3. Measuring ROI
>
> Two frameworks, neither specific to in-list giveaways:
>
> * Spencer: track LTV of participants vs. non-participants [C2]. Long-term view.
> * The VIP lead gen calculator [D2] models list campaigns using: total spend, cost per lead/box, AOV, conversion rate, and offer margin → breakeven ROAS and profit. Their example: 2 weeks, $1,300 spend, 491 leads at $2.78 CPL, tracked lifetime attribution via Triple Whale [D2].
> * Ankit P's revenue mechanism: on draw day, blast non-winners with a time-limited consolation offer — "it's ok if you didn't win... here is a specific offer... goes down in 72 hours... makes a lot of money for our clients" [C5]. This is how the draw produces revenue beyond free boxes.
>
> For your $11/box draw: compare consolation-offer revenue against (cost of 10 boxes + any promo spend). No source specifies the window — the VIP example used 2 weeks of attribution [D2], but Spencer's LTV framing suggests tracking longer [C2].
>
> 4. Alternatives to make an auto-enrolled list feel exclusive
>
> Strongest coverage here:
>
> * The VIP list framework [D2] is exactly this — early access and exclusive discounts for members before the public. Example: "35% off to VIPs compared to 30% for the general public." D2 specifically mentions "providing early access to avoid stock issues" — directly relevant given the sushi box sold out in November.
> * Exclusivity comes from access, not luck. VIP early access is the proven mechanic; the random draw adds excitement but isn't what makes members feel chosen.
>
> * Prerequisite from D2: strong email/SMS program to communicate the offer. You already have the Tuesday campaign and welcome flow — you have the infrastructure.
>
> Consider running both: VIP early access as the core exclusivity play, with the draw as a supplementary engagement layer.
>
> 5. Reactivating last December's buyers
>
> No source covers Christmas buyer reactivation timing or tactics specifically. Available signals:
>
> * Shaun on seasonal timing: "for most of the brands launching sale earlier made sense... unless you have strong returning customer rate" [C4]. Your 2.5% repeat rate fails that condition — you can't rely on past buyers returning naturally. Start earlier and actively pull them back.
> * D3: existing customers stock up (BOGO works), new customers prefer % off single [D3]. Your repeat buyers buy the same box for someone else — a BOGO or multi-box offer aligns with that behavior.
> * D3: "Funnel buyers wait for bigger sales; make BFCM superior" [D3]. If you discounted last December, buyers may be conditioned — this year's offer needs to beat last year's to pull them back.
> * D2's VIP early access is directly applicable: email last year's buyers first with early access to the seasonal drop before it goes public. Scarcity is real (sushi box sold out) — lead with it.
>
> No source covers gift card strategies, new-variant announcement timing, or reactivation sequence structure for seasonal buyers. Worth asking the community directly — other Q4-heavy operators likely have playbooks

### Vad vi gör med svaret (beslutat med Axel 2026-09-27, se `klaviyo/spoks/README.md` → Klubbkänslan)

| Råd | Hos oss |
|---|---|
| Exklusivitet = tillgång, inte tur: VIP-förtur som kärna, dragningen som krydda | **A Förtur blir kärnan**, B Dragningen körs ovanpå. Förra säsongens köpare (segmentet `SEG_kopare_forra_sasongen`) får allt först. |
| Dragningen ska ge intäkt: tröstpris till icke-vinnare med 72 timmars gräns | Tröstpriset är en rabatt ⇒ Axels beslut (frågan ställd). Utan rabatt är trösten förturen. |
| LTV är måttet, inte öppningar | Mäts som återköp per medlem dec 2026 mot dec 2025 + tröstprisets intäkt i 14 dagar mot lådornas kostnad. |
| Kundbilder är ofta dåliga; ge exempel utan att skriva manus | Vinnarna får tre exempelbilder och två rader ("håll upp lådan, ansiktet med"), inget manus. Räkna med att bara en del blir annonsbilder. |
| Börja tidigare, dra aktivt tillbaka förra årets köpare; slå förra årets erbjudande | Förra decembers rabattkoder mätta i Shopify (nedan). Första köparmejlet flyttas fram i kalendern. |
| Befintliga kunder bunkrar (BOGO), nya vill ha % på en | Köp 1, få 1 är redan standard och matchar återköparen ("en låda till, till nästa person"). |

## Svar 15, 2026-09-28: recensioner via mejl (Matstrumpor) — boten hade INGET underlag

Axel klistrade in Fråga 15 (vårt eget recensionsmejl: svarsgrad, ordval, ämnesrader,
struktur, stjärnor mot knapp, timing för en present). Botens svar, ordagrant i sak: "I don't
have any source material to answer these questions. Both the Discord Q&A conversations and
course documents arrays are empty in my current context, so I can't ground a single claim
about review rates, wording, subject lines, timing, or star-link mechanics." Den listade
varje delfråga som "no data" och rådde: "Post the full six-question breakdown in the
community … Paste as-is."

### Vad vi gör med svaret

- **Evolve har inget om recensionsmejl** (samma läge som flödesstrukturen i Svar 1). K15 v2
  står som den är, byggd på det som finns: Judge.me:s, Trustpilots, Yotpos och Okendos egna
  riktlinjer + Karaman 2021 (`klaviyo/spoks/README.md` → Recensionerna → Bästa praxis).
- Frågan kan Axel posta i Evolve-communityn om han vill; ett svar därifrån klistras in här
  och vägs mot bästa-praxis-listan. Inget väntar på det.
- Facit blir våra egna siffror: K15:s klick per stjärna i Spoks och antalet nya recensioner
  i Judge.me två veckor efter utskicket.

---

## Svar 16, 2026-09-29: takten och mixen i dagliga serien till fars dag (Matstrumpor)

Fråga 16 i `FRAGOR.md` (omskriven på Axels ord samma dag: vad ska vi skicka varje dag, inte
bara fars dag). Axel klistrade in svaret ordagrant; Discords formatering (numreringen "2."
och tomma punkter) är botens, inte vår. `[C1]`–`[C5]` är botens källor.

> 1. Don't send 27 daily emails to the full list — segment by engagement and ramp intensity toward the deadline.
>
> The community consensus: volume is safe only when paired with segmentation and deliverability management [C1]. Daily to a list that's never received a campaign, on a new sending domain, is the highest-risk setup you can run.
>    1. The mix across 27 days
>
> Billy runs 3-5 emails/week mixing sales + free value [C1][C4] — roughly 50/50. No source gives a 27-day template, but combining Billy's mix with Damon's deadline-ramp pattern [C3] gives you a framework:
>    * Week 1 (Sep 29–Oct 5): ~3 sales, 4 non-sales. You're warming a cold list and a new domain — build the habit of opening first.
>    * Week 2 (Oct 6–12): ~5 sales, 2 non-sales. Start the deadline countdown logic.
>    * Week 3 (Oct 13–19): ~6 sales, 1 non-sales. Pressure builds.
>    * Week 4 (Oct 20–25): All sales, ramping to blitz (see below).
>
> Billy's point that "if someone receives 3 emails and doesn't purchase, they're Most Aware" [C1] supports ramping sales intensity over time — early emails build awareness, later ones convert it.
>
> What sources don't give: A tested day-by-day template. The ratios above are extrapolated from principles, not a proven sequence.
>    2. Non-sales days that still sell
>
> Billy and Spencer both say to mix in "free value" alongside sales [C1][C4]. Umar's principle applies here: engaged community members should get usage/engagement content, not conversion pitches [C5]. Your weekly draw videos, behind-the-scenes, and customer stories fit this. But no source gives concrete examples of non-sales emails that drove sales for a seasonal gift product. This is a genuine gap — worth asking the community for specifics.
>    3. Full list vs segments, and pause thresholds
>
> Don't send daily to the whole consent list. Three converging points:
> 2.
>
> * Billy: Segment by engagement (last 14/30 days), exclude past buyers from conversion sends [C1][C4].
> * Ankit P: Don't go daily to the full list cold — start with smaller engaged segments, prove it works, expand based on data [C2].
> * Damon: Send 1-2/day per segment, not per list — different segments get different emails [C3].
>
> Tension on past buyers: Billy excludes them [C1], but yours is a gift product — someone who bought last Christmas for their dad might buy again for their father-in-law. With only 2.5% repeat rate, Billy's assumption (past buyers already have the product) may not hold. Worth testing inclusion vs exclusion.
>
> Your pause rule (>1% unsubs, >0.3% spam): No source validates specific thresholds. Sources emphasize segmentation and deliverability as the guardrails [C1] but don't give numeric cutoffs. Your rule is reasonable but unvalidated — calibrate it with data from the first sends.
>
> New domain risk: Ankit P's staged-rollout principle [C2] applies directly — start with your most engaged segment, prove deliverability, then expand. A new domain sending daily to 3,000 people who've never heard from you is a spam-complaint magnet.
>
> 4. Final week cadence
>
> Damon's BFCM pattern [C3] maps directly to your Oct 24 deadline: 1-2/day per segment early in the week, then blitz the final day(s).
>
> * Oct 20–22: 1/day per segment
> * Oct 23: 2/day per segment (morning + afternoon)
> * Oct 24 (last order day): 2-3 across the day — morning urgency, midday last-call, evening final push. Damon also says hit SMS if you have it [C3].
>
> What sources don't cover:
>
> * A specific 27-day day-by-day template
> * Concrete non-sales email examples that drove sales
> * Validated unsubscribe/spam pause thresholds
> * Gift-product timing (delivery vs when the gift is opened)
> * Whether a second reminder to non-clickers helps or hurts
> * Subject-line or wording examples for this campaign type

### Vad vi gör med svaret (beslutat av sessionen 2026-09-29, Axel kan ändra)

- **Två publiker i stället för en.** *Engagerade* (`SEG_uppvarmning_steg1`: samtycke + öppnat,
  klickat, tittat på en produkt eller köpt senaste 30 d; **1 305 mätt 2026-09-29** med
  `get_segment`) får nästan ett mejl om dagen. *Alla*
  (`SEG_samtycke`, cirka 3 000) får 2–3 i veckan: tisdagens K-mejl plus veckans starkaste
  fars dag- eller Köp 1, få 1-mejl. En dag = ett mejl; på "alla"-dagarna får de engagerade
  samma mejl, så ingen får två. Köparna hålls KVAR i utskicken (Evolves egen invändning:
  presentprodukt, 2,5 % återköp), och FD12 går bara till köpare; uteslutning testas senare.
- **Mixen per vecka enligt Evolve:** v1 3 sälj / 4 värde, v2 5 / 2, v3 6 / 1, v4 bara sälj
  med blitz: 23/10 två mejl (09:00 + 20:00), 24/10 tre (09:00, 13:00, 20:00). Värdemejlen är
  nya: V01 *Du är med i klubben* (30/9, alla, listan har aldrig fått ett mejl), V02 *Svara med
  ett ord* (3/10, engagerade — svar på mejl är leverbarhetssignalen), V03 *Så ser lådan ut
  inuti* (5/10, engagerade, produktkunskap utan pitch); K03 *Kundernas ord* flyttas från 13/10
  till 1/10 (vecka 1:s fjärde värdemejl — K15, recensionen, gick redan ut 28/9 11:18 CEST,
  mätt med `search_campaigns`), FD08 (kundcitat) flyttas till 8/10 och räknas som värde.
  Två värdeplatser skrivs när underlaget finns, aldrig i förväg: **V04 *Ni svarade*** (lör
  10/10, engagerade, ur svaren på V01 och V02 — de landar i kundsupport@matstrumpor.se, läses
  med `loopia-mail`; färre än tio svar ⇒ FD03 från bänken tar platsen) och **V05 *Vad ni skrev
  om lådan*** (tis 13/10, hela listan, ur de nya Judge.me-recensionerna efter K15; färre än tre
  nya ⇒ FD02 tar platsen). Blitzmejlen är
  nya: FD21 (23/10 20:00), FD22 (24/10 13:00, pizzalådan i fokus), FD23 (24/10 20:00).
  Nedräkningsmejlen (FD09, FD13, FD15–FD19) ligger kvar på sina datum.
- **Fem mejl till bänken:** FD02, FD03, FD04, FD05 och FD07 schemaläggs inte (v1 hade sju
  säljmejl, Evolve säger tre). De återanvänds mot jul (sista beställning 8/12) med nya datum.
- **Stoppregeln står kvar** (`LARM_LEVERANS`: spam över 0,3 %, avreg över 1 % på ett utskick ⇒
  hoppa nästa dag, tillbaka till engagerade) och kalibreras mot de första utskicken, precis
  som boten säger. SMS finns inte.
- **Luckorna Evolve pekar ut** (konkreta värdemejl som sålt, tidpunkt för presentprodukter, en
  andra påminnelse till dem som inte klickat) fylls av våra egna siffror: klick och ordrar per
  utskick i Spoks, lästa dagen efter. Schemat: `klaviyo/innehall/matstrumpor/KALENDER-2026.md`
  → Dagliga serien (omgång 2).
