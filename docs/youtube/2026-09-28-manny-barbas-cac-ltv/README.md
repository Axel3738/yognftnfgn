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
| Butikskredit efter köp | ✅ Delvis | KREDIT100 i Bäverbutikens efter-köp-mejl (Spoks F04 v3) |
| LTV genom produktval | ⚠️ Passar oss dåligt | Bäverbutiken har ett enda produktpar med återköp (motorhölje → båtmotorskydd), Matstrumpor 1,2 % återköp, CaraShell 0 återköp (`klaviyo/evolve/ATERKOP-ANALYS*.md`, CLAUDE.md). **CAC är vår spak, inte LTV.** |
| **Cost cap / bid cap** | ❌ Aldrig testat | Läst i Meta 2026-09-30: alla **31 aktiva kampanjer** i MagiBorsten (22), OPS-kontot (5), Magiborsten UK (3) och nya kungen (1) kör `LOWEST_COST_WITHOUT_CAP`. Fabriken bygger bara det (`factory/kampanj.mjs`). |
| **Kundenkät** | ❌ Nej | Står i `docs/os/EPOST-STRATEGI.md` som "kräver Axels ok" sedan 2026-09-24. Evolve sa samma sak (Mar 13 [1:07:12]). |
| **Organiskt / fler kanaler** | ❌ Nej | Allt betalt går via Meta. |

---

## Vad vi kan göra just nu (sessionens rangordning)

1. **Kundenkät efter leverans, alla tre butiker.** Ett mejl i Spoks efter leveransen med
   fyra–fem frågor. Svaren blir `voc` i briefer och mejl. Billigast, ingen risk för
   annonskontona, och datan saknas helt i dag. Kan byggas som inaktivt flöde; att slå på
   är Axels klick.
2. **Cost cap-test i EN kampanj.** En kopia av en CBO som redan går, taket satt på
   break-even-CPA ur `products/products.json` eller lägre, högre budget, läst först efter
   7 dagar. Budget och produkt är Axels beslut. Vänta på Chadbots svar först.
3. **Organiskt för Matstrumpor inför jul.** Rolig bakom-kulisserna-video, ingen försäljning.
   Kräver någon som filmar. Vänta på Chadbots svar.

**Inte nu:** Snapchat/Pinterest (inget team för det) och produktval för LTV (fel sorts
produkter för det, och det byter vi inte på en video).
