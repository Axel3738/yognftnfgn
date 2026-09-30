# Manny Barbas: "13 years of ecomm sauce" — genomgång och vad vi tar in

**Källa:** https://www.youtube.com/watch?v=kBnDwNy7LCI — Manny Barbas, 15:45 min,
publicerad 2026-09-28. Läst 2026-09-30 ur YouTubes engelska textspår (yt-dlp, `en-orig`).
Axels beställning: "transkribera och säg vad vi kan implementera i vår business just nu,
fråga gärna Evolve-botten också". Frågan till Chadbot står i `FRAGOR.md`; svaret sparas i
`SVAR.md` när Axel klistrat tillbaka det.

Talet i videon är hans egna påståenden. Han visar inga siffror från något konto.

---

## Videon avsnitt för avsnitt (sammanfattning, inte ordagrant)

| Tid | Vad han säger |
|---|---|
| 00:00 | Det finns två spakar: **sänk CAC** (kostnad per ny kund) och **höj LTV** (vad en kund är värd över tid). |
| 01:00 | **Organiskt på TikTok:** bakom kulisserna, sälj ingenting, "som en realityserie". Tjejerna i videorna bär inte ens deras kläder. Förut under 10 000 visningar per video, efter bytet över 200 000 på tre–fyra dagar, och han säger att den samlade ROAS:en steg. |
| 02:00 | Största misstaget han ser: **allt hänger på Meta.** När Meta krånglar (Andromeda 2025) krånglar hela bolaget. Meta är ändå den bästa kanalen för snabb tillväxt. |
| 03:00 | Behandla TikTok/Instagram som en kreatörs konto: underhållande och lärorikt, bygg gemenskap. |
| 03:30 | **LTV börjar med produktvalet.** Ingen köper tio madrasser. Hudvård, mat, kläder i droppar köps igen. |
| 04:30 | **Kvalitet före marginal:** sänk marginalen från 90 % till 80 % om produkten blir bättre. Dålig produkt ger bra första halvår och sedan stigande CAC och ingen som kommer tillbaka. |
| 05:30 | **Belöningsprogram:** 10 % tillbaka som butikskredit (50 dollar köp ⇒ 5 dollar kredit), priser, gåva vid köp. |
| 06:00 | **Kommunikation och frakttider** avgör LTV i en Amazon-värld. |
| 06:30 | **Produktpipeline:** nya produkter till befintliga kunder, lika bra som hjälteprodukten. Andra och tredje produkten är ofta "meh". |
| 07:30 | **Budgivning: cost cap och bid cap.** Cost cap = du anger din mål-CAC per adset och Meta snittar mot den över **7 dagar**. Bid cap = ett tak för budet i varje auktion, strängare. Han säger att cost cap är mer flexibel efter Andromeda och att Meta rekommenderar cost cap med uppblåst budget. |
| 09:30 | Varför han gillar det: med tak och hög budget får **bara bättre annonser** mer spend, så allt fokus hamnar på creative. "50 annonser i veckan i stället för 5." |
| 10:30 | Sluta ändra budget varje dag och döma på 24 timmar. Exempel: 1 000 dollar/dag ⇒ sätt 3 000 dollar/dag med snäv cost cap och jobba bara med creative. |
| 11:00 | **Förstå kunden:** man säljer en känsla, inte en produkt. Bred målgrupp + bred copy + bred sajt ⇒ hög CAC, för Meta hittar inte kunden. |
| 13:00 | Enklaste vägen: **fråga kunderna** i en enkät. Vad gör du, hur gammal är du, vad fick dig att köpa, vad ska vi bli bättre på, vad är viktigt för dig. |
| 13:30 | **Kanaler:** börja med en betald kanal. När bolaget växer: sprid ut (TikTok organiskt, Reels, Snapchat, Pinterest). Köpare av bolag ser ett Meta-beroende som en risk. Välj kanal efter var kunden faktiskt är. |
| 15:15 | Säljpitch för hans byrå. |

---

## Mot vår verksamhet (mätt 2026-09-30)

| Idé i videon | Gör vi det? | Belägg |
|---|---|---|
| Många annonser, creative först | ✅ Ja | Briefkvoten är mål nr 1 (CLAUDE.md regel 5), alla nya annonser i produktens CBO (regel 11) |
| Döm inte på 24 timmar | ✅ Ja | `docs/os/ANALYSMETOD.md`: ingen dom under 300 kr / 3 köp, etikett dag 7 |
| Frakt och kommunikation | ✅ Ja | Spårningssidan i sex butiker, autosvaret skarpt, 5–10 arbetsdagar |
| Produktpipeline | ✅ Delvis | OPS-fabriken, tacksidans tilläggsprodukter i CaraShell |
| Butikskredit efter köp | ✅ Nystartad | KREDIT100 sedan 2026-09-26 i Bäverbutikens efter-köp-mejl (Spoks F04 v2 + v3) och på spårningssidan |
| LTV genom produktval | ⚠️ Passar oss dåligt | Bäverbutiken har ett enda produktpar med återköp (motorhölje → båtmotorskydd), Matstrumpor 1,2 % återköp, CaraShell 0 återköp (`klaviyo/evolve/ATERKOP-ANALYS*.md`, CLAUDE.md). **CAC är vår spak, inte LTV.** |
| **Cost cap / bid cap** | ❌ Nej, och Evolve säger nej | Läst i Meta 2026-09-30: **alla 45 aktiva kampanjer i alla sju konton** token:en når (MagiBorsten 22, Magiborsten NO 12, OPS-kontot 5, Magiborsten UK 3, Magiborsten FI 1, nya kungen 1, SnarkLös 1) kör `LOWEST_COST_WITHOUT_CAP`. Enda försöket någonsin: SnarkLös "Cost caps SE" juni 2026, 160 kr, 0 köp (för lite för en dom). |
| **Kundenkät** | ⏳ Byggs | Axel bygger en enkät efter köpet i en annan session (2026-09-30). |
| **Organiskt / fler kanaler** | ❌ Nej | Allt betalt går via Meta. |

---

## Efter Chadbots svar (2026-09-30): vad som gäller

Chadbots svar står i `SVAR.md`. En kontroll i fyra delar körde samma kväll: tidigare beslut i
repot, KREDIT100 i Shopify och Spoks, svensk lag om utlottning, och en skeptisk granskare.
Förslagen i sessionens första svar är ändrade efter den.

1. **Cost cap med uppblåst budget: inför det inte.** Evolve kör en CBO på lägsta kostnad som
   standard och skalar vinnare genom att höja budgeten ("I wouldn't test with CC", Shaun). Vi kör
   redan så i alla 45 kampanjer. Förslaget "cost cap-test i en kampanj" från första svaret är
   struket. Ett äldre förslag på StonePNL-grenen (`docs/annonsdoktrin/granskning-meta-mekanik.md`,
   2026-08-27: cost cap = 0,85 × break-even-CPA från S1) togs aldrig in och ska inte tas upp igen
   som nytt. Ändras budstrategin någon gång är det Axels beslut.
2. **Zombiekampanj (cost cap för annonser utan spend): Axel vill ha den (2026-09-30 kväll).**
   Sessionens första "inte nu" var sessionens egen bedömning från 2026-09-21, inte Axels beslut och
   inte Evolves. Chadbot säger tvärtom att det är den enda användning av cost cap som Evolve står
   bakom, som räddningsverktyg för annonser som inte fick spend i CBO:n på sju dygn. Evolves egna ord
   om den är att den ger "lite mer spend men ingen skalning", så den ska inte väntas bli en ny
   vinnarmaskin. Den är till för annonserna som **aldrig fick spend** i de bästa produkternas
   kampanjer, inte för vinnarna själva.
   **Mätt i MagiBorsten 2026-09-30 21:00 UTC** (aktiva annonser, minst sju dygn gamla, under 10 kr
   i spend under hela livstiden), med de sju bästa produkterna efter vinstbidrag på 30 dagar
   (`spend × (ROAS ÷ break-even − 1)`, ROAS ur Meta):

   | Produkt | Vinstbidrag 30 d | Aktiva annonser ≥ 7 dygn | Varav utan spend |
   |---|---|---|---|
   | Taköverdraget | 165 328 kr | 69 | 6 |
   | Båtmotorskyddet | 38 559 kr | 71 | 14 |
   | IBC-Tanköverdraget | 24 459 kr | 73 | 29 |
   | Sotarsetet | 18 217 kr | 22 | 14 |
   | Bälteslipmaskinen | 18 152 kr | 49 | 8 |
   | Termoskyddet | 17 154 kr | 33 | 9 |
   | Fiskespöhållaren | 14 171 kr | 85 | 35 |

   Det är 115 annonser utan spend i de sju, och 128 i hela kontot. **Hur den byggs:** en kampanj
   `ZOMBIE_…` i MagiBorsten, ett adset per produkt med cost cap = produktens break-even-CPA,
   annonserna kopieras dit (originalen i CBO:n rörs aldrig), allt byggs PAUSED. Leveransrundan
   väljer kampanj efter annonsprefixet, så zombiekampanjen måste in i samma uteslutning som
   listicle-kampanjerna (`tools/lib/kampanjval.mjs`, `LISTICLE_MONSTER`), annars kan nya annonser
   hamna i den. Budgetronden och annonsvakten ska också känna igen namnet. Taket, budgeten och
   produkterna är Axels beslut (regel 12). Regel 11 ändras bara om Axel säger det.
3. **Organiskt: inte nu.** Chadbot har en datapunkt och inget besked för vår sorts produkter. Görs
   det någon gång: mät försäljning per miljon visningar (cirka 10 000 dollar är bra, cirka 1 000
   dollar fungerar inte som annons), och räkna med att Meta inte alltid spenderar på det som gick
   bra organiskt. Det här gäller inte Axels beslut 2026-09-27 att betalda Facebook Reels är av i
   CaraShell US; det handlar om placeringar.
4. **Butikskredit: mät vår egen, fråga inte igen.** Evolve har en datapunkt i
   `klaviyo/evolve/SVAR.md` (Grayson): butikskredit för köp två används till cirka 30 % och kostar
   lite. Om cashbackprogram vid cirka 1 % återköp finns inget. **KREDIT100 är ny:** Axel skapade
   den 2026-09-26 08:03 UTC (läst i Shopify 2026-09-30), och de första kreditmejlen kan ha gått ut
   tidigast 29/9. Att den inte använts än säger alltså ingenting. Sessionens första formulering
   ("har använts 0 gånger fast 103 köpare passerat mejlet") lät som ett underbetyg och var fel sätt
   att säga det (Axel samma kväll). Mät först när koden varit ute några veckor, och räkna med att
   30 %-rean fram till 22/10 går till samma köpare. Ordrarna med koden går inte att läsa i den här
   miljön (SE-appen saknar orderrättighet). `mejl/matning.mjs` läser fortfarande TACKIGEN och ska
   pekas om till KREDIT100 innan mätningen görs. Föreslå aldrig hjulet eller TACKIGEN igen: det gav
   0 köp.

### Till sessionen som bygger enkäten efter köpet (rättad 2026-09-30)

⚠️ Den första versionen av det här avsnittet sa att frågor om produkten skulle gå ut **efter
leveransen**. Chadbots svar säger att en enkät efter leveransen gav noll svar. Det är en enda
anekdot, men den pekar åt samma håll som Evolves övriga råd: frågorna ska ställas på tacksidan
eller direkt efter köpet.

**Ur videon (11:00–13:30):** målet är att förstå kunden, så att annonsen säljer en känsla. Hans
frågor: vad gör du, hur gammal är du, vad fick dig att köpa, vad ska vi bli bättre på, vad är
viktigt för dig. Han visar inga siffror på att enkäten fungerar.

**Ur Chadbots svar:** fritext före flerval ("people actually have to type shit"), tacksidan
fungerar, efter leveransen gav noll svar, en utlottning hellre än en belöning per svar. Syftet är
att hitta köpare man inte visste om (exemplet: köparna var överviktiga män, inte gravida kvinnor).

**Sessionens tillägg:**
- På tacksidan: en till tre fritextfrågor. **Vad hände som gjorde att du letade efter det här?**
  **Var såg du produkten?** **Köpte du till dig själv eller till någon annan?** Frågor om själva
  produkten kan kunden inte svara på förrän paketet har kommit fram, så de får vänta eller strykas.
- Spara svaren ordagrant, märkta `voc`, stryk butikens namn, och koppla aldrig ett svar till en
  enskild annons. Att svaren matar `/cs` är vår egen koppling; Evolve beskriver att de matar
  mejlsegmenteringen.
- Bara CaraShell har en tacksidesextension (`factory/tacksida/`, appen "CaraShell Tacksida").
  Bäverbutiken och Matstrumpor behöver en egen app, och i alla tre butikerna läggs blocket in med
  Axels klick i kassaredigeraren. Svaren måste också sparas någonstans; tacksidans app har ingen
  databas i dag.
- **Belöning:** helst ingen för en kort enkät. Blir det ett pris är det säkraste EN tidsbegränsad
  utlottning av ett presentkort med fast dragningsdatum och oförändrade priser, som visas först
  efter köpet och aldrig som ett skäl att köpa. Den är då licensfri enligt spellagen 3 kap. 4 §
  (Spelinspektionens ställningstagande om insats 2025-04-15) och skattefri för vinnaren
  (IL 8 kap. 3 §). En utlottning varje månad som aldrig tar slut är en gråzon.
- **Villkoren ska stå fullt ut** (MFL 9–10 §, svarta listan punkt 19): arrangör, vem som får
  delta, att inget ytterligare köp krävs, priset och dess värde, sista dag, hur och när vinnaren
  lottas och hur vinnaren meddelas, kontaktadress.
- **Mejl:** en enkät som går ut som mejl med en utlottning är reklam. Den får bara gå till köpare
  som inte har tackat nej (`kundundantag`), med en avregistreringslänk i varje mejl (MFL 19–20 §).
- **GDPR:** fritext kopplad till en order är personuppgifter. En rad under enkäten med länk till
  integritetspolicyn, och policyn måste nämna enkäten. Be kunden att inte skriva om hälsa. Gallra
  svaren efter en bestämd tid, radera deltagaruppgifterna efter dragningen och skriv vinnaren
  som förnamn plus initial.
- Det här är sessionens läsning av lagtexten och myndigheternas sidor, inte juridisk rådgivning.
  Det finns ingen svensk dom om enkäter med utlottning. Källorna:
  https://www.spelinspektionen.se/lagar-regler/rattsliga-stallningstaganden/insats-enligt-3-kap.-4--1-spellagen,
  https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/spellag-20181138_sfs-2018-1138/,
  https://data.riksdagen.se/dokument/sfs-2008-486.text,
  https://www.imy.se/verksamhet/dataskydd/det-har-galler-enligt-gdpr/rattslig-grund/intresseavvagning/.

**Inte nu:** Snapchat/Pinterest (inget team för det) och produktval för LTV (fel sorts
produkter för det, och det byter vi inte på en video).
