# Evolves iterationsplaybook (modulen "How To Do Iterations", Evolve Copywriting)

Läst 2026-10-01 direkt ur Skool med `tools/skool/` (Axels konto). Tio lektioner,
kurs-id `9917539c`, modul-id `072c688dfaf145cfa51a4f9dfd79af59`. Texten nedan är
kursens egna listor, komprimerade och översatta där det behövs. Exemplen i kursen är
Canva-länkar och videor (inte lästa). Kursen säger själv: *"the most common mistake with
iterations is skipping the learnings step"* — lärdomen först, iterationen sedan.

Hur det här ska in i `/matstrumporkungen` står i `EVOLVE-GAP-ANALYS.md` här bredvid.

---

## 1. De fyra utfallen (vecka 1, mätt i CBO, klickbaserad attribution)

Ur "Winning Ads Definitions" (Billy, uppdaterad 2026-05-13):

| Utfall | Spend-andel av kampanjen vecka 1 | KPI | Budgeten |
|---|---|---|---|
| 🏆 Breakthrough | ≥ 10–30 % (högre spend ⇒ lägre %) | — | kampanjens dagsbudget HAR ökat vecka för vecka på grund av annonsen (10 % → 100 %+) |
| 💸 Spend Winner | ≥ 10–30 % | under kampanjens initiala ROAS eller skalar inte kontot | ingen ökning |
| 🎯 KPI Winner | < 10–30 % | lika med eller över kampanjens initiala ROAS | — |
| ❌ Loser | < 10–30 % | under kampanjens initiala ROAS | — |

- Etiketten sätts efter **7 dagar**, men **kan ändras vecka 2–3**: en KPI Winner kan bli
  Spend Winner eller Breakthrough när algoritmen tar den. En annons som var Loser vecka 1
  har tagit 55 % av spenden vecka 2 (deras data, 500k+-nivån).
- Bara **klickbaserad** data (7-dagars eller 1-dagars klick). Visningsattribution räknas
  inte som inkrementell.
- **Nya kunder** räknas, inte återköp.
- Testas i **CBO** utan min-budget: "spend only on these ads if you think they're good
  enough to scale". ABO och min-budget tvingar fram köp som inte är inkrementella.
- Datasetet bakom ("Winning Ads Analysis Sheet"): på nivån $0–100k/mån tog deras
  breakthroughs **≥ 67,9 % av kampanjens spend** (6 annonser). Flikarna för $100k–500k
  är märkta ofullständiga.

Vårt system: `matstrumpor/etikett.mjs` sätter samma fem etiketter (plus INGEN_LEVERANS).
Skillnaderna i trösklar och fönster står i gap-analysen.

## 2. Tiostegsprocessen ("Ad Learning & Iteration Process", EAM, juli 2026)

1. **Hitta batchen.** Leta upp annonsen i Meta innan något annat.
2. **Utfallet.** Breakthrough / Spend Winner / KPI Winner / Loser. Anteckna annonsens
   spend OCH kampanjens spend samma period.
3. **Annonstyp.** 💡 Ideation (idén kom ur research) · 🎭 Imitation (ur en annan brands
   annons) · 🔁 Iteration (ur en egen annons).
4. **Hookarna ordagrant.** Varje hook exakt som den står, aldrig sammanfattad. Vid
   betydande spend (rek. ≥ 1 000 USD efter 7 dagar): hook rate och hold rate.
5. **Komponenterna mot Growth Guiden.** Kontrollera det som planerades mot det som
   faktiskt hamnade i annonsen, en rad per komponent (de nio nedan). Skriv ut skillnader.
6. **Hypotes + iterationsidéer.** Varför gick den som den gick? Vad specifikt? Jämför med
   kontots andra vinnare så lärdomen inte blir falsk. Var konkret.
7. **Länka originalfilerna** (Frame.io/Drive).
8. **Bekräfta att annonsen ligger i den visuella playbooken** (deras FigJam-tavla:
   sektionerna ❌ LOSERS, 💸 SPEND WINNERS, 🎯 KPI WINNERS, 🏆 BREAKTHROUGHS, med en
   COMPARE-kolumn bredvid varje).
9. **Följ playbooken** för utfallet (avsnitt 4–6 nedan) och välj exakt vilka iterationer
   som körs härnäst.
10. **Döp iterationen och spåra den.** Före launch: `ITER#[N]_BATCH#[ORIG#]` direkt efter
    konceptnamnet, på fil, annons och adset. N = vilken iteration i ordningen,
    ORIG = batchen som itereras.

Evolves Claude Code-skill `/ad-iteration` gör steg 5–10 som en intervju (nio frågor,
hypoteston, skriver tillbaka till Growth Guiden): `ad-iteration-skill/SKILL.md` här bredvid.

## 3. De nio komponenterna (det som varje annons analyseras på)

1. **Market awareness** — hookens nivå: Unaware / Problem / Solution / Product / Most aware.
   Hook-nivå, inte hela annonsen.
2. **Valence + intensity** — känslans riktning (positiv/negativ) och styrka ("Zone X").
3. **Desire** — vilket utfall lovar annonsen, och levererar den det?
4. **Avatar** — vem talar den till, och når copyn dit?
5. **Angle** — skälet någon köper. Är det tydligt?
6. **Mechanism** — visas en ny/specifik väg till resultatet, eller saknas den?
7. **Belief** — vad bygger tilliten: auktoritet, merit, strategisk copy, inget?
8. **Positioning** — vad är annorlunda mot det tittaren redan sett? (avancerat, hoppa om oklart)
9. **Urgency** — vad blir värre för avataren om hen inte agerar? Sägs det?

## 4. Playbook ❌ Loser och 🎯 KPI Winner (samma lista)

**Problemet:** annonsen får varken breakthrough-spend eller KPI. Oftast: hooken stoppade
ingen. Vanliga orsaker: hook rate under ~30 %, vinkeln för smal eller för bred, en
unaware-"wildcard" som missade, problem/solution-aware med en hook som inte var
relaterbar eller ett problem som inte gjorde ont nog, product/most-aware med ett
erbjudande som inte är konkurrenskraftigt.

Iterera på: 💡 Ideation 2–3 gånger till (bara med belägg för den nya versionen),
🔁 Iteration (hitta vad som gick fel i utförandet). **Aldrig på en 🎭 Imitation som förlorat.**

KPI Winner: är spend-andelen mycket låg med några köp är den "en loser som hade tur".
Är den erbjudandefokuserad (BOF/retargeting) är det väntat att den inte skalar.

| # | Fel | Iterationen |
|---|---|---|
| 1 | **Hook issue 1** — hooken griper inte | Mer engagerande hook; bilden ska samverka med eller kontrastera mot texten så nyfikenheten ökar. Vanligaste felet. |
| 2 | **TAM issue** — för smal | Bredare vinkel/etiketter. En smal vinkel som ändå kan skala testas i egen kampanj/ABO så den inte konkurrerar med de breda. "Under 3 000 USD/dag är det troligen cope." |
| 2.5 | **Broad issue** — för bred med för svag copy | Gå bara så brett om copyn klarar att hålla massans uppmärksamhet. Exempel på för svagt: "For men who struggle with hair loss you need this!" |
| 3 | **Valence & intensity** — säger rätt sak men känns fel | Positiv ⇒ prova rädsla/skuld. Negativ ⇒ prova aspiration. För intensiv ⇒ dra ner. Tråkig (vanligast) ⇒ skruva upp. |
| 4 | **Hook issue 2** — bild och text säger inte Meta vilken publik | Visuella signaler som pekar ut målgruppen (deras exempel: nål + muskler ⇒ testosteron, inte "man i spegel"). |
| 5 | **Empty claims** i en sofistikerad marknad | Påståenden utan bevis/fakta tros inte. Lägg in belägg, möt invändningar, bygg tro. |
| 6 | **Bridge issue** — bron hook → hold hackar | Bron på förloraren var åsikter ("supersött"), på vinnaren fakta ("det här är en kakaofrukt…"). Bygg bron på fakta. |
| 7 | **Belief issue** — saknar tillit | Mer auktoritet och/eller manus som förebygger invändningar. |
| 8 | **Offer issue** — pris mot värde stämmer inte | Studera prisinvändningar; se erbjudandeträningen. |

## 5. Playbook 💸 Spend Winner

**Problemet:** breakthrough-spend men inte KPI, och kontot skalar inte. Något är rätt
(algoritmen vill skala), men CPM, CPC, CVR eller AOV brister. Titta nu också på hook
rate, hold rate, hook-to-hold (andel hookade som tittade ≥ 15 s), average play time,
frequency, andel nya besökare, och breakdown på ålder/kön/placering/plattform.

Oftast saknas **tro** (⇒ auktoritet), **brådska** (⇒ eskalera problemet) eller **funnel**
(⇒ landningssidan). Fällan: "hooken funkar, nu testar jag format och holds" — hooken kan
vara rotorsaken: den stoppar folk men sätter upp dem så att de inte går att övertyga.

Vanliga orsaker: vilseledande hook (förväntan ≠ sidan), gillar påståendena men tror inte
på dem, bredare/kallare publik utan konverteringskraft, ingen brådska/CTA, ser inte värdet
i erbjudandet, öppna loopar som aldrig stängs.

Iterera på: 💡 Ideation **3–5 gånger till** (med en riktning för bättre utförande),
🔁 Iteration, 🎭 Imitation 2–3 gånger till.

| # | Fel | Iterationen |
|---|---|---|
| 2.5 | **Broad** — copyn fångade massan men konverterar den inte | Lägg till tro, brådska, kongruens. |
| 7 | **Belief** — griper men tros inte | Mer auktoritet; fakta i stället för åsikter; visa sårbarhet. |
| 9 | **Urgency** 🆕 — ingen anledning att köpa NU | Inte "rean slutar i kväll" utan: vad händer om de inte agerar? Minst ett skäl i annonsen. |
| 10 | **Stakes** 🆕 — för lite står på spel | Höj insatsen; det höjer brådskan på köpet. |
| 11 | **Funnel/kongruens** 🆕 — ny vinkel, gammal sida | Sidan ska bära samma vinkel, avatar och erbjudande som annonsen. Spend winners saknar oftast CVR, inte CTR. |
| 12 | **Misleading** 🆕 — engagemang av fel skäl | Vanligt i native/kontroversiella annonser. Meta optimerar till slut på köp; sådana dör. |

## 6. Playbook 🏆 Breakthrough

**Problemet:** annonsen är en breakthrough men dör för fort, eller ingen vet hur den ska
dissekeras. Första regeln: **stäng aldrig av en breakthrough** för att ROAS sjunker när
den skalas — "catastrophic to the account". Iterera på alla tre typerna, alltid.

Det som förkortar en breakthroughs liv: lätt att kopiera (AI-UGC, native), kopierad från
en konkurrent, för smal sub-avatar/vinkel, ren erbjudandeannons (tömmer tratten), säsong
(deras luftfuktare dog i juli) och utdaterade bilder/budskap (vinter-UGC på sommaren).

| # | Fel | Iterationen |
|---|---|---|
| 2 | **TAM** — vinkeln är inte den största | Behåll, men bygg breakthroughs på bredare vinklar också. |
| 13 | **Easily replicable** 🆕 | Format som är svåra att kopiera (grundare/auktoritet, podcast, gatuintervju). |
| 14 | **Product differentiation** 🆕 | Positionering; annars kopierar någon annons + produkt på en vecka. |

## 7. Manusiterationer (för Spend Winners och Breakthroughs)

1. **Components rewrite** — bryt ner vinnaren på de nio komponenterna, behåll det som bär,
   gör om hook, bridge och hold var för sig.
2. **Emotional hook testing** — samma budskap, annan valens/intensitet. Breakthroughs tål
   oftast MER intensitet (ger brådska och insats på köpet). "Be ethical."
3. **Bridge remake** — mer tro och brådska i bron: auktoritet, höjd insats, visuell copy
   ("yeast feeding on your scalp like a buffet" slog "it's fungus, pretty common").
4. **In media res** — klipp bort uppsättningen, börja mitt i handlingen (Sarah Levinger;
   deras annons med den klippningen har gått över 2 M USD).
5. **Extended problem section** — "en av de första iterationerna vi gör på varje vinnare":
   längre problem/agitation, fler specifika smärtor innan lösningen.
6. **Awareness levels** — samma vinnare en nivå upp och en ner. Exempel från kursen:
   Product "The most addicting cat toy" · Solution "I tried everything to keep my cat busy" ·
   Problem "I didn't realize my cat being bored could take years off its life" ·
   Unaware "Who has a better life… cats or dogs?"
7. **Overcoming objections** — läs invändningarna i kommentarsfältet, gör versioner som
   svarar på dem; "comment reply"-hook när samma invändning återkommer.
8. **Negative framing** — argumentera sarkastiskt MOT produkten och motbevisa varje punkt.
9. **Different sub-avatar** — samma struktur och berättelse, omskriven för en annan
   sub-avatar (inte bara ett ordbyte; kräver att komponenterna är förstådda).

## 8. Formatiterationer (för Spend Winners och Breakthroughs)

1. **Voiceover ↔ text på skärm** — byt till det andra.
2. **Riktiga UGC-kreatörer** — ge vinnarens komponenter till **2–3 kreatörer**. Lukas Pakter
   (Haus): varje ny kreatör gör tre videor: (a) kopiera vinnarmanuset ordagrant, (b) iterera
   på vinnaren ur komponenterna, (c) imitera dagens virala annonser.
3. **Animerade ingredienser/mekanismer** — mekanismen som hjälte.
4. **AI-animerade lösningar** — de andra lösningarna som skurkar, vår som hjälte.
5. **AI-animerade kroppsdelar** — orden kommer från kroppsdelen, ny information.
6. **AI-sång** — Claude skriver om manuset till rim, Suno gör låten.
7. **AI-animerad berättelse utan människa** — skelett, figurer, pixar/lera.
8. **AI-animerad berättelse med människa** — samma, med en mänsklig berättare.
9. **AI-UGC-narration** — en AI-person berättar OVANPÅ videon ("visuell voiceover"; de låtsas
   aldrig att den är en riktig person).
10. **VSL-expansion** — längre, mer utbildning, mekanism och bevis; svårt, kräver copy utan fluff.
11. **Native/kamouflage** — statisk annons med primärtext som speglar vinnarmanuset.
12. **Grundare/auktoritet** — "annonser som inte går att kopiera"; grundaren eller en expert
    läser vinnarmanuset eller ett nytt ur komponenterna.
13. **Gatuintervju** — kräver ofta en byrå.
14. **Podcast** — två personer diskuterar ämnet; mer auktoritet visuellt.
15. **Stack winners mega-ad** — 2–4 vinnande klipp/hookar i en längre kompilation (wild card).

## 9. Namn och spårning (ur "2025 Naming Templates")

- **Typ** på varje annons: `IDEA` / `ITER` / `IMIT`.
- Fil: `Client - Batch# - Concept - Format - Type - Editor - V#`.
- Annons: `Batch#_Concept_URL_Format_Type_Editor_V#_C_#_H_#` (C = primärtext-nr, H = rubrik-nr).
- Adset: `Batch#//Concept//Attribution//Audience//Country//Age//Gender//Exclusions`;
  champions-adsetet: `Champions//Post-IDs//…`.
- Iteration: `ITER#[N]_BATCH#[ORIG#]` efter konceptnamnet på alla tre nivåerna.

## 10. Det som hör ihop med playbooken (lästa, i samma kurs)

- **Hookregeln** (Copywriting Strategies): hooken ska vara STICKY. Mål: 90 % kvar efter 6 s.
  Måste ha: känsla, nyfikenhetsgap, hög insats. Börja i handlingen, noll backstory, noll kaos
  ("curious, not confused"), begriplig utan ljud.
- **Copy-checklistan** (Toolkit): vem skriver jag till (sub-avatar + tro), varför, brett eller
  smalt, har hooken gap + känsla + insats, mekanism, auktoritet, är copyn visuell, är den
  falsifierbar, kan ingen annan skriva den (googla rubriken med citattecken), vad kommunicerar
  den egentligen, sjätteklassnivå, går den att korta, skulle du säga den dörr till dörr.
  (Tre-frågorstestet i `docs/copy-regler.md` är de tre mittersta.)
- **3:2:2(:2)** (Testing): 1 CBO, 1 champions-adset + test-adsets, 3 creatives per adset (samma
  koncept) × 2 rubriker × 2 primärtexter (× 2 landningssidor). Max antal koncept per vecka =
  budget ÷ target-CPA. Testa minst 3, normalt 7, aldrig över 14 dagar. Stäng på adset-nivå,
  inte annonsnivå. "Did my overall campaign performance improve?" avgör vinnare.
  Stäng aldrig av annonser som fungerar.
- **KPI:erna** (Targets): bara tre — BROAS, ROAS, CPA/NCPA + LTV — var och en med break-even
  och skalningsnivå.
- **Kolumnerna** de tittar på: spend, köp, CPA, ROAS, AOV, CVR, visningar, räckvidd, frekvens,
  CPM, klick, CPC, CTR, **video hook, video hold, average play time**, varukorg, kassa.
- **Winning Ad Report**: Evolves egen Claude Code-rutin `/analyze-breakthrough` (GitHub
  `zjamesblake/analyze-breakthrough`, CSV in → rapport ut) som medlemmarna skickar in via
  ClickUp så definitionerna kan förfinas på gemensam data.
