# Lärdomar — Taköverdraget för Husvagn 6,5 × 3 m

En per etiketterad annons (docs/os/CS-KLART.md punkt 1–5). Skrivs av `node agent/lardom.mjs --skriv`; varje brief pekar på ett id här (`lardom=L-…`).

### Lärdom L-120250147392200291 — Takoverdrag_SP_2_1 (KPI_WINNER, etikett 2026-09-21)

| Fält | Värde |
|---|---|
| Batch | okänd |
| Utfall | KPI_WINNER |
| Fönster | 2026-09-09 – 2026-09-15 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 5 907 kr / 28 527 kr (21 %) |
| Köp | 26 |
| ROAS / CPA | 5,07 / 227 kr — kampanjens ROAS 4,94 |
| Konverteringsgrad | 1,9 % (26 köp / 1399 LPV) |
| Hook rate / hold rate | okänd / okänd |
| Bedömbar | ja |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Rubrik, ordagrant: "Husvagnsägare älskar det här skyddet"
- Primärtextens första rad, ordagrant: "\"Ångrar att jag inte köpte det här förra vintern.\" 🙌"
- Ingen VO — annonsen är en bild.

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | Husvagnsägare inför vintern, tilltalad som grupp | okänd |
| Vinkel | — (brief saknas i repot) | Social proof — "fler och fler husvagnsägare" | okänd |
| Medvetandenivå | — (brief saknas i repot) | Lösningsmedveten: problemet förklaras aldrig | okänd |
| Mekanism | — (brief saknas i repot) | Ingen mekanism alls — bara att det skyddar | okänd |
| Tro | — (brief saknas i repot) | Ingen trosbarriär bemöts | okänd |
| Positionering | — (brief saknas i repot) | Mot att inte ha något skydd alls | okänd |
| Brådska | — (brief saknas i repot) | Säsong: "inför varje vinter" | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd — ingen brief i repot, så planerat går inte att läsa. ⚠️ Annonsen bryter mot två regler som beslutats SENARE: den citerar en kund som inte finns ("Ångrar att jag inte köpte det här förra vintern") och nämner 30 dagars öppet köp, som är butikspolicy och inte får stå i speglat material. Den är live och rörs inte — regeln gäller nästa version.

**Diagnos:** KPI winner: läs hook rate, sedan hold rate, sedan förbi hooken. Den säljer men får inte spend — får den ingen spend på sju dagar är den en förlorare.

**Hypotes (gissning):** Gissning: annonsen drar 21 % av spenden på ROAS 5,07 trots att den saknar både mekanism och problembyggande, vilket pekar på att produkten säljer sig själv för den som redan vet att taket är problemet — och att SP-vinkelns svaghet per krona (1,09 mot CS:s 3,17 i DNA:t) alltså inte gäller den statiska formen.

**Nästa annonser:**
- `Takoverdrag_OB_2_H1` *(utförd som `Takoverdrag_OB_4_H1` — se rättelsen nedan)* — typ N, ingen parent: första annonsen som bemöter en dokumenterad invändning ("nu blir det väl tätt") i stället för att sälja taket. Enda variabeln är öppningsdraget.
- `Takoverdrag_SP_6_1` — typ IM, parent Takoverdrag_SP_2_1: samma social proof men UTAN det påhittade kundcitatet och utan öppet köp, så raden går att spegla. Enda variabeln är att de två förbjudna elementen tas bort.

> ⚠️ **RÄTTELSE 2026-09-22.** Raden ovan namngav `Takoverdrag_OB_2_H1`. Det
> namnet var redan taget: en Notion-rad med det namnet finns sedan 2026-09-19
> och bär ett HELT annat koncept (förvaring — hur draget viks ner i påsen),
> status `In progress`. Jag läste lediga nummer ur annonskontot men inte ur
> Notion, och kontot hade bara `OB_1`. Briefen som skrevs på invändningen
> "nu blir det väl tätt" heter därför **`Takoverdrag_OB_4_H1`**.
> Loggraden skrivs inte om — budgetloggen är append-only. I stället bär
> OB_4_H1:s BRIEF-rad `plats: Takoverdrag_OB_2_H1`, så `brieftak` räknar
> platsen som utförd. Regel (b) stryker en upptagen plats bara när anroparen
> skickar hubbens namn med `--befintliga` — det gjordes INTE i ronden
> 2026-09-22 (rondfilen visar OB_2_H1 som ledig plats); sedan samma
> eftermiddag vägrar `lardom.mjs --brief` att skriva utan `--befintliga` när
> namngivna platser finns. **Lärdomen härav: läs lediga AD-ID:n ur kontot,
> Notion-hubben OCH produktens batch-log** — namnet stod redan i
> `batch-log.md` (batch #3: OB_2_H1 = förvaringspåsen).

- `Takoverdrag_CS_14_1` — typ IM, parent Takoverdrag_CS_2_1: prisankaret är produktens starkaste vinkel enligt DNA:t (3,17 kr vinst per spendkrona) och har färre annonser live än SP. Enda variabeln är prisformuleringen.

### Lärdom L-120250242482300291 — Takoverdrag_SP_4_H1 (BREAKTHROUGH, etikett 2026-09-23)

| Fält | Värde |
|---|---|
| Batch | 1 |
| Utfall | BREAKTHROUGH |
| Fönster | 2026-09-16 – 2026-09-22 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 34 750 kr / 87 349 kr (40 %) |
| Köp | 75 |
| ROAS / CPA | 2,75 / 463 kr — kampanjens ROAS 3,08 |
| Konverteringsgrad | 1,7 % (75 köp / 4544 LPV) |
| Hook rate / hold rate | okänd / 18 % |
| Bedömbar | ja |

**Koncept:** SP social proof, demo bär videon · **Typ:** N · **Parent:** — · **Iteration:** 0 · **Källa:** batch #1 (batch-log.md 2026-09-14: "SP-copyn kräver läsning, inte tittande. Demo bär videon, aggregatet bara i endcard", källa SP_2_H1 mot SP_2_1); briefen ligger i Notion-hubben, inte i repot


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext, rad 1 (live 2026-09-23): "Ett helöverdrag är tungt att få på plats ensam — det här klarar en person."
- Primärtext, rad 2–3: "210D-väv håller hela vintersäsongen ute, och vattnet står aldrig vid takluckorna." · "5,0 av 5 på 10 recensioner. 1 129 kr i stället för 1 469 kr."
- Rubrik (live): "En person räcker. 210D-väv." · CTA: Handla nu
- Första frame (thumbnail, läst 2026-09-23): svartvit drönarbild rakt uppifrån på ett husbilstak, en ensam person står på en stege vid takkanten och drar i remmen — taket och personen syns, produkten ligger inte på än; ingen text inbränd i första bilden
- VO/inbränd text i videon: okänd — manuset finns inte i repot och videon är inte transkriberad

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | husvagns-/husbilsägaren som ställer av själv — en ensam person på stegen i första bilden, ingen grupp, ingen familj | okänd |
| Vinkel | — (brief saknas i repot) | "en person klarar det" (mot helöverdraget som är tungt att få på ensam) — copyn öppnar med det, social proof (5,0 av 5 på 10) ligger sist | okänd |
| Medvetandenivå | — (brief saknas i repot) | lösningsmedveten: tittaren antas redan veta att taket ska täckas och jämföra mot helöverdrag | okänd |
| Mekanism | — (brief saknas i repot) | bara taket täcks (en person räcker), 210D-väv, vattnet står aldrig vid takluckorna — sidans egna rader | okänd |
| Tro | — (brief saknas i repot) | "helöverdrag är tungt att få på plats ensam" — tron att täckning kräver två personer bemöts i första raden | okänd |
| Positionering | — (brief saknas i repot) | mot helöverdraget (konflikt typ A, annat angreppssätt), inte mot att göra ingenting | okänd |
| Brådska | — (brief saknas i repot) | ingen påhittad brådska — bara priset 1 129 mot 1 469 kr | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd — briefen finns inte i repot, så planerat går inte att läsa. ⚠️ Copyn bär "5,0 av 5 på 10 recensioner" — produkten har bara seedade recensioner (batch-04-briefernas regel: inga recensioner, inga kundcitat); annonsen är live och rörs inte, iterationerna bär inte raden.

**Diagnos:** Breakthrough: tre iterationer inom 14 dagar, börja i manuslistan (nya hookar → längre problemdel → in media res). Aldrig en ren kopia av top spendern.

**Hypotes (gissning):** Gissning: annonsen blev breakthrough för att första bilden visar det copyn påstår — en ensam person på stegen med taket under sig — så "en person räcker" bevisas innan någon läst ett ord, och att den fick 40 % av 87 349 kr på en vecka utan påhittad brådska talar för att demon bär, inte social proof-raden; att CPA (463 kr) ligger över kampanjsnittet (ROAS 2,75 mot 3,08) och konverteringsgraden är 1,7 % mot CS_2_1:s högre talar för att hooken drar bred trafik som inte alla är köpare — det är därför I1 (nya hookar på samma kropp) ska testas först.

**Nästa annonser:**
- `Takoverdrag_SP_4_H2` — typ I, parent Takoverdrag_SP_4_H1, iteration 1 av 3 (vidarebygg, deadline 2026-10-07): ny hook — samma kropp och samma första bild (en person på stegen), men öppningsraden byts från "tungt att få på plats ensam" till det som syns: remmen hakas i kroken i nederkant av en hand. Enda variabeln är hookraden. Ingen recensionsrad.
- `Takoverdrag_SP_4_H3` — typ I, parent Takoverdrag_SP_4_H1, iteration 2 av 3: längre problemdel — 5 s på takluckans tätmassa och vattnet som står vid luckan (sidans egna rader) innan personen på stegen visas, resten som SP_4_H1.
- `Takoverdrag_SP_4_H4` — typ I, parent Takoverdrag_SP_4_H1, iteration 3 av 3: in media res — sekund 0 är remmen som dras åt över taket, ingen inledning, sedan samma kropp och samma endcard med priset.

### Lärdom L-120250242493840291 — Takoverdrag_RI_1_H1 (LOSER, etikett 2026-09-23)

| Fält | Värde |
|---|---|
| Batch | 1 |
| Utfall | LOSER |
| Fönster | 2026-09-16 – 2026-09-22 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 1 715 kr / 87 349 kr (2 %) |
| Köp | 2 |
| ROAS / CPA | 1,32 / 857 kr — kampanjens ROAS 3,08 |
| Konverteringsgrad | 1,8 % (2 köp / 111 LPV) |
| Hook rate / hold rate | okänd / 15 % |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept:** RI kostnaden av att inte agera · **Typ:** N · **Parent:** — · **Iteration:** 0 · **Källa:** batch #1 (batch-log.md: "tätmassan mjuknar, fukten tar sig in, då krävs reparation", sidans egen formulering); briefen i Notion, inte i repot


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext, rad 1 (live 2026-09-23): "Vid takluckan möter tätmassan fukt dag efter dag."
- Primärtext, rad 2–3: "Till slut mjuknar den, och vatten går rakt in genom taket." · "Då räcker ingen tvätt — bara ett taköverdrag för 1 129 kr."
- Rubrik (live): "Ingen tvätt hjälper då" · CTA: Handla nu
- Första frame (thumbnail, läst 2026-09-23): närbild underifrån på en taklucka inne i vagnen, vattendroppar längs luckans kant — ingen produkt, ingen person, ingen text
- VO/inbränd text i videon: okänd — inte transkriberad

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | ägaren som redan sett droppar vid takluckan — ingen person i bild, bara luckan | okänd |
| Vinkel | — (brief saknas i repot) | RI: kostnaden av att vänta (tätmassan mjuknar, vatten in, reparation) | okänd |
| Medvetandenivå | — (brief saknas i repot) | problemmedveten: hela öppningen är skadan, produkten kommer sist | okänd |
| Mekanism | — (brief saknas i repot) | ingen — copyn säger inte vad överdraget gör, bara att det behövs | okänd |
| Tro | — (brief saknas i repot) | "ingen tvätt hjälper" — tron att skadan går att tvätta bort bemöts | okänd |
| Positionering | — (brief saknas i repot) | mot att göra ingenting | okänd |
| Brådska | — (brief saknas i repot) | ingen påhittad brådska | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd — briefen finns inte i repot.

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** Gissning: första bilden är ett skadat innertak utan produkt och utan person, så den som scrollar ser ett problem men inget att köpa — de 111 som klickade fick sedan ingen mekanism i copyn (den säger aldrig vad överdraget gör) och två av dem köpte; hold rate 15 % är näst högst i dagens fyra, så det är inte hooken som föll utan bryggan från skada till produkt.

**Nästa annonser:**
- `SLÄPP` — 1 715 kr på ROAS 1,32 mot break-even 1,52 med samma bild i sju dygn; idén (kostnaden av att vänta) är sidans egen och inte research, och SP_4_H1 bär redan "vattnet står aldrig vid takluckorna" som en rad i en annons som säljer. Ingen ny RI-annons förrän en lärdom ur SP_4-iterationerna säger annat.

### Lärdom L-120250242464260291 — Takoverdrag_UG_1_H1 (LOSER, etikett 2026-09-23)

| Fält | Värde |
|---|---|
| Batch | 1 |
| Utfall | LOSER |
| Fönster | 2026-09-16 – 2026-09-22 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 755 kr / 87 349 kr (1 %) |
| Köp | 2 |
| ROAS / CPA | 2,99 / 377 kr — kampanjens ROAS 3,08 |
| Konverteringsgrad | 3,1 % (2 köp / 64 LPV) |
| Hook rate / hold rate | okänd / 11 % |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept:** UG talande ägare, "hanteras av en person" filmat i realtid · **Typ:** N · **Parent:** — · **Iteration:** 0 · **Källa:** batch #1 (batch-log.md: luckan "ingen talande person i kontot"); briefen i Notion, inte i repot


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext, rad 1 (live 2026-09-23): "Tror du att du måste täcka hela husvagnstaket?"
- Primärtext, rad 2–3: "En person klarar det själv — ett helöverdrag är tungt att få på plats ensam." · "Spänns fast med rem och dragsko i kanten. 1 129 kr, fri frakt."
- Rubrik (live): "Bara taket. En person klarar det." · CTA: Handla nu
- Första frame (thumbnail, läst 2026-09-23): en vit husvagn i profil på en grusplan under blå himmel, tom, utan produkt och utan person — ingen text
- VO/inbränd text i videon: okänd — inte transkriberad

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | ägaren som tror att hela vagnen måste täckas — ingen person i första bilden trots att konceptet är en talande ägare (första bilden saknar personen konceptet bygger på) | nej |
| Vinkel | — (brief saknas i repot) | "bara taket, en person klarar det" — samma vinkel som SP_4_H1:s öppning | okänd |
| Medvetandenivå | — (brief saknas i repot) | lösningsmedveten | okänd |
| Mekanism | — (brief saknas i repot) | "rem och dragsko i kanten" — dragsko finns inte på produkten (sidan säger remmar på alla fyra sidor, krok i nederkant); fel mekanism i copyn | nej |
| Tro | — (brief saknas i repot) | "måste täcka hela taket" bemöts | okänd |
| Positionering | — (brief saknas i repot) | mot helöverdraget | okänd |
| Brådska | — (brief saknas i repot) | ingen | okänd |
**Utförandet föll:** ja · utford_som_briefad: okänd — briefen finns inte i repot, men två saker syns i den live annonsen: första bilden är en tom vagn (konceptet "en ensam ägare filmad i realtid" syns inte förrän efter play) och copyn påstår "dragsko" som produkten saknar, plus "fri frakt" som inte får stå i en annons som speglas till CaraShell.

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** Gissning: samma påstående som SP_4_H1 ("en person klarar det") men utan beviset i första bilden — SP_4 visar personen på stegen i sekund 0, UG_1 visar en tom vagn — och CBO:n gav den 755 kr mot SP_4:s 34 750 kr; konverteringsgraden 3,1 % på de 64 som kom in säger att de som såg hela videon köpte, så det är öppningsbilden som föll, inte idén.

**Nästa annonser:**
- `SLÄPP` — idén (talande ensam ägare) lever vidare i SP_4-iterationerna där personen syns i första bilden; ingen egen UG-annons förrän SP_4_H2–H4 är lästa. UG_2_H1 ligger redan i hubben (In progress) och får löpa.

### Lärdom L-120250242502750291 — Takoverdrag_CO_1_H1 (LOSER, etikett 2026-09-23)

| Fält | Värde |
|---|---|
| Batch | 1 |
| Utfall | LOSER |
| Fönster | 2026-09-16 – 2026-09-22 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 131 kr / 87 349 kr (0 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 3,08 |
| Konverteringsgrad | 0,0 % (0 köp / 8 LPV) |
| Hook rate / hold rate | okänd / 9 % |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept:** CO jämförelse helöverdrag mot bara taket · **Typ:** N · **Parent:** — · **Iteration:** 0 · **Källa:** batch #1 (batch-log.md: "Konkurrenten är helöverdraget, inte att göra ingenting", sidans jämförelse); briefen i Notion, inte i repot


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext, rad 1 (live 2026-09-23): "Ett helöverdrag täcker allt du redan har — det här täcker bara taket."
- Primärtext, rad 2–3: "Rem och dragsko i kanten håller det på plats, vattnet står aldrig vid takluckorna." · "1 129 kr mot 1 469 kr, fri frakt och 30 dagars öppet köp."
- Rubrik (live): "Rätt yta, inte hela vagnen" · CTA: Handla nu
- Första frame (thumbnail, läst 2026-09-23): delad bild — överst en svartvit husvagn under helöverdrag med en person som drar det på plats i mörkt väder, underst ett grått, skrynkligt överdrag halvt utlagt på ett husbilstak med en person på stegen — ingen text
- VO/inbränd text i videon: okänd — inte transkriberad

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | ägaren som väljer mellan helöverdrag och taköverdrag — två personer i bild, ingen scen som är hans | okänd |
| Vinkel | — (brief saknas i repot) | CO: helöverdraget mot bara taket, delad bild | okänd |
| Medvetandenivå | — (brief saknas i repot) | produktmedveten: jämför två lösningar | okänd |
| Mekanism | — (brief saknas i repot) | "rem och dragsko" — fel, produkten har remmar och krok; "vattnet står aldrig vid takluckorna" är sidans rad | nej |
| Tro | — (brief saknas i repot) | "täcker allt du redan har" — tron att mer täckning är bättre bemöts | okänd |
| Positionering | — (brief saknas i repot) | mot helöverdraget (konflikt typ A) | okänd |
| Brådska | — (brief saknas i repot) | ingen | okänd |
**Utförandet föll:** ja · utford_som_briefad: okänd — briefen finns inte i repot. I den live annonsen: den undre halvan av första bilden visar produkten grå och skrynklig, halvt utlagd — det ser ut som det helöverdrag copyn argumenterar mot; copyn bär "dragsko" (finns inte), "fri frakt" och "30 dagars öppet köp" (butikssidan säger 14 dagars ångerrätt) — tre rader som inte får stå i en annons som speglas.

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** Gissning: CBO:n gav den 131 kr på sju dygn för att första bilden inte skiljer de två alternativen åt — båda halvorna visar ett grått/svart överdrag och en person som kämpar med det, så jämförelsen syns inte förrän copyn lästs; hold rate 9 % är dagens lägsta, vilket talar för att öppningen föll, inte att jämförelsevinkeln är fel (CO_2_1 som statisk bär samma konflikt och ska läsas separat).

**Nästa annonser:**
- `SLÄPP` — 131 kr och 0 köp; jämförelsen lever vidare i OB_4_H1 (delad bild helöverdrag mot bara taket, sidorna synligt öppna, redan i hubben) som gör exakt det den här bilden missade. Ingen ny CO-video.


## Bälteslipmaskinen (120249902177470291)

