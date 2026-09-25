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
