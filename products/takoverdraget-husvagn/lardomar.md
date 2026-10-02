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

### Lärdom L-120250330247960291 — Takoverdrag_PD_10_1 (KPI_WINNER, etikett 2026-09-29)

| Fält | Värde |
|---|---|
| Batch | 3 |
| Utfall | KPI_WINNER |
| Fönster | 2026-09-22 – 2026-09-28 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 8 043 kr / 94 712 kr (8 %) |
| Köp | 17 |
| ROAS / CPA | 2,82 / 473 kr — kampanjens ROAS 2,06 |
| Konverteringsgrad | 4,8 % (17 köp / 357 LPV) |
| Hook rate / hold rate | okänd / okänd |
| Bedömbar | ja |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Bilden (statisk): produktfoto, rubrik överst i bilden — inte avläst i den här ronden (thumbnail via Graph, ffmpeg/bildläsning saknas); primärtext (live 2026-09-29): "Nio storlekar – från 3 × 5,5 till 3 × 13,5 meter. Från 1 129 kr. Sitter kvar när det blåser – remmar på alla fyra sidor, 2,5 meter och justerbara efter din vagn." · rubrik: "Nio storlekar. Från 1 129 kr."
- Samma creative som LISTICLE-kampanjens Takoverdrag_PD_10_1 (BREAKTHROUGH 2026-09-27, komponentkarta i dna.md) — här i SE-huvudkampanjen med 8 043 kr / 17 köp

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | husvagnsagare-som-tvekar-pa-storleken ("finns den för min?") — Axels annonsidé 2026-09-18, dna.md avatar 4 | ja |
| Vinkel | — (brief saknas i repot) | PD som statisk: storlekarna som påstående ("Nio storlekar – från 3 × 5,5 till 3 × 13,5 meter"), rent formattest på PD_10_H1 (batch #3) | ja |
| Medvetandenivå | — (brief saknas i repot) | lösningsmedveten (tvivlet på passform tas bort före klicket) | ja |
| Mekanism | — (brief saknas i repot) | remmar på alla fyra sidor, 2,5 m, justerbara — "Sitter kvar när det blåser" | ja |
| Tro | — (brief saknas i repot) | måtten och storleksspannet i klartext; inga recensioner i copyn | ja |
| Positionering | — (brief saknas i repot) | "Från 1 129 kr" — pris från, nio storlekar | ja |
| Brådska | — (brief saknas i repot) | ingen | ja |
**Utförandet föll:** nej — batch #3:s rad "Samma nya variabel som PD_10_H1 som bild — rent formattest" (batch-log 2026-09-22) stämmer med den live copyn · utford_som_briefad: okänd

**Diagnos:** KPI winner: läs hook rate, sedan hold rate, sedan förbi hooken. Den säljer men får inte spend — får den ingen spend på sju dagar är den en förlorare.

**Hypotes (gissning):** Gissning: storleksinvändningen som statisk bild konverterar i huvudkampanjen precis som i listiclen (CPA 473 kr mot break-even-CPA ~880 kr = AOV 1 334 ÷ 1,52; ROAS 2,82 mot kampanjens 2,06) — bilden svarar på "finns den för min?" innan klicket, så de som klickar har redan sållat sig rätt; att den bara får 8 % av spenden är auktionen som föredrar video, inte bildens fel (n = 17 köp, en annons, samma dygn som SP_4_H1-breakthrough tog 40 %).

**Nästa annonser:**
- `Takoverdrag_PD_10_2` — typ I, parent Takoverdrag_PD_10_1, iteration 1: samma bild och prisband, BARA rubriken byts — mekanismen först ("Sitter kvar när det blåser. Nio storlekar."), storlekarna som underrad; enda variabeln är rubriken (KPI winner-playbook: tre nya hookar, allt annat lika)
- `Takoverdrag_PD_10_3` — typ I, parent Takoverdrag_PD_10_1, iteration 2: samma bild, rubriken som måttet på den egna vagnen ("3 × 5,5 till 3 × 13,5 meter — en passar din"), priset i bandet
Not: Numren PD_10_2/PD_10_3 ska läsas lediga i hubben BÄVER Taköverdraget OCH kontot innan de används (statisk ny version = nästa siffra på samma AD-ID); rundan tas när Taköverdragets nästa brief-runda förfaller (batch #7 skrevs 2026-09-28)

### Lärdom L-120250330347560291 — Takoverdrag_CS_8_H1 (LOSER, etikett 2026-09-29)

| Fält | Värde |
|---|---|
| Batch | 2 |
| Utfall | LOSER |
| Fönster | 2026-09-22 – 2026-09-28 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 3 569 kr / 94 712 kr (4 %) |
| Köp | 4 |
| ROAS / CPA | 1,58 / 892 kr — kampanjens ROAS 2,06 |
| Konverteringsgrad | 1,7 % (4 köp / 242 LPV) |
| Hook rate / hold rate | 39 % / 12 % |
| Bedömbar | ja |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext rad 1 (live 2026-09-29): "Taket — den delen du aldrig ser efter." · rad 2: "Rem och dragsko håller den på plats, 210D-väv hela vintersäsongen." · rad 3: "1 129 kr mot 1 469 kr. 5,0 av 5 på 10 recensioner." · rubrik: "Taket du aldrig ser efter. 210D-väv."
- VO/första frame: inte transkriberad (ffmpeg saknas). Samma tak-idé som RI_3_H1 men prisankaret (1 129 mot 1 469) och recensionsraden (⚠️ importrader) i stället för reparationskostnaden

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | husvagnsagare-infor-vintern — samma som RI_3_H1 | ja |
| Vinkel | — (brief saknas i repot) | CS (prisankare): 1 129 kr mot 1 469 kr, taket som du aldrig ser efter | nej |
| Medvetandenivå | — (brief saknas i repot) | lösningsmedveten (priset först) | okänd |
| Mekanism | — (brief saknas i repot) | rem och dragsko håller den på plats, 210D-väv hela vintersäsongen | ja |
| Tro | — (brief saknas i repot) | "5,0 av 5 på 10 recensioner" (⚠️ importrader) | nej |
| Positionering | — (brief saknas i repot) | prisankare mot jämförpriset — batch #2 ville ankra mot reparationskostnaden, det gör RI_3_H1, inte den här | nej |
| Brådska | — (brief saknas i repot) | ingen | ja |
**Utförandet föll:** ja — batch #2:s rad "Priset ankrat mot reparationskostnaden i stället för mot jämförpriset" är INTE vad som kör: den live copyn ankrar mot jämförpriset 1 469 kr; idén (reparationskostnaden) hamnade i RI_3_H1, som vann · utford_som_briefad: okänd

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** Gissning: samma tak-öppning som RI_3_H1 men med prisankare + importrecensioner i stället för reparationskostnaden gav 4 köp på 3 569 kr (ROAS 1,58, CPA 892 kr över break-even-CPA ~865 kr) mot RI_3_H1:s 4 köp på 1 855 kr — Meta gav prisvarianten dubbelt så mycket spend men den sålde hälften så bra per krona; gissningen är att "taket du aldrig ser" behöver kostnaden av skadan som bridge, inte rabatten, och att recensionsraden inte tillför något (n = 4, preliminär).

**Nästa annonser:**
- `SLÄPP` — LOSER bedömbar (ROAS 1,58 under kampanjens 2,06 och break-even-CPA): idén lever vidare i RI_3_H1:s vidarebyggen (RI_3_H2/H3), inte i en till prisvariant; ingen iteration på CS_8

### Lärdom L-120250330348390291 — Takoverdrag_RI_2_H1 (KPI_WINNER, etikett 2026-09-29)

| Fält | Värde |
|---|---|
| Batch | 2 |
| Utfall | KPI_WINNER |
| Fönster | 2026-09-22 – 2026-09-28 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 2 927 kr / 94 712 kr (3 %) |
| Köp | 5 |
| ROAS / CPA | 2,25 / 585 kr — kampanjens ROAS 2,06 |
| Konverteringsgrad | 3,3 % (5 köp / 154 LPV) |
| Hook rate / hold rate | 46 % / 10 % |
| Bedömbar | ja |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext rad 1 (live 2026-09-29): "Frosten kommer i gryningen — en tunn presenning stelnar och spricker." · rad 2: "Vår 210D-väv böjs ändå, i samma kyla." · rad 3: "1 129 kr. 5,0 av 5 på 10 recensioner." · rubrik: "Första frosten. 210D-väv håller formen."
- VO/första frame: inte transkriberad (ffmpeg saknas) — hook rate/hold rate ur etikettraden. ⚠️ "5,0 av 5 på 10 recensioner" är de tio launchimporterade recensionerna (dna.md, komponentkartan SP_4_H1) — raden ärvs inte i en iteration

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | husvagnsagare-infor-vintern (frosten i gryningen, presenningen som spricker) — dna.md avatar 1 | ja |
| Vinkel | — (brief saknas i repot) | RI (risken/kostnaden av fel skydd): presenningen spricker i frost, 210D-väven böjs | ja |
| Medvetandenivå | — (brief saknas i repot) | problemmedveten → lösningsmedveten (presenning mot väv) | ja |
| Mekanism | — (brief saknas i repot) | 210D-väv som böjs i kyla i stället för att stelna | ja |
| Tro | — (brief saknas i repot) | "5,0 av 5 på 10 recensioner" (⚠️ importrader) + materialraden ur sidan | nej |
| Positionering | — (brief saknas i repot) | 1 129 kr, mot en tunn presenning (inte mot jämförpriset) | ja |
| Brådska | — (brief saknas i repot) | säsongens — första frosten som äkta deadline (batch #2:s hypotes), ingen påhittad lagerbrist | ja |
**Utförandet föll:** ja (tro) — recensionsraden "5,0 av 5 på 10" är importrader: utförandets fel, inte idéns; idén (frosten som deadline) stämmer · utford_som_briefad: okänd

**Diagnos:** KPI winner: läs hook rate, sedan hold rate, sedan förbi hooken. Den säljer men får inte spend — får den ingen spend på sju dagar är den en förlorare.

**Hypotes (gissning):** Gissning: frosten som äkta deadline säljer (CPA 585 kr mot break-even-CPA ~865 kr = AOV 1 316 ÷ 1,52, ROAS 2,25 mot kampanjens 2,06) men får bara 3 % av spenden — en säsongshook som Meta ger lite volym tills första frosten faktiskt kommer; de fem köpen på 2 927 kr är nära grinden och kan revideras, så domen är preliminär (n = 5).

**Nästa annonser:**
- `Takoverdrag_RI_2_H2` — typ I, parent Takoverdrag_RI_2_H1, iteration 1: ny hook (0–3 s) — presenningen som spricker visad, inte berättad (bild av stel presenning i frost), resten som H1; recensionsraden "5,0 av 5 på 10" tas bort ur copyn (importrader, Brief review-regel 2: förälderns obelagda rad rättas i iterationen)
Not: Fler RI_2-hookar först när H2 fått etikett — KPI winner-playbooken säger tre nya hookar, men frosten är en säsongshook och H2 avgör om det är hooken eller kalendern som håller spenden nere

### Lärdom L-120250330352260291 — Takoverdrag_RI_3_H1 (KPI_WINNER, etikett 2026-09-29)

| Fält | Värde |
|---|---|
| Batch | 2 |
| Utfall | KPI_WINNER |
| Fönster | 2026-09-22 – 2026-09-28 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 1 855 kr / 94 712 kr (2 %) |
| Köp | 4 |
| ROAS / CPA | 2,86 / 464 kr — kampanjens ROAS 2,06 |
| Konverteringsgrad | 3,0 % (4 köp / 133 LPV) |
| Hook rate / hold rate | 34 % / 8 % |
| Bedömbar | ja |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext rad 1 (live 2026-09-29): "Taket är det du aldrig ser. Det är också den ytan som kostar mest att laga om den går sönder." · rad 2: "Ett överdrag i 210D-väv täcker hela taket, 6,5 × 3 meter, så vatten aldrig blir stående kring takluckorna." · rad 3: "1 129 kr, ord. 1 469 kr (spara 340 kr)." · rubrik: "Taket du aldrig ser"
- VO/första frame: inte transkriberad (ffmpeg saknas) — hook rate/hold rate ur etikettraden

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | husvagnsagare-infor-vintern — ägaren som aldrig går upp och tittar på sitt eget tak (sidans egen rad) | ja |
| Vinkel | — (brief saknas i repot) | RI (den blinda ytan kostar mest att laga): risken av att inte skydda | ja |
| Medvetandenivå | — (brief saknas i repot) | problemmedveten (taket är ytan du aldrig ser) | ja |
| Mekanism | — (brief saknas i repot) | 210D-väv över hela taket 6,5 × 3 m så vatten inte står vid takluckorna | ja |
| Tro | — (brief saknas i repot) | sidans egna rader (måttet, takluckorna); inga recensioner i copyn | ja |
| Positionering | — (brief saknas i repot) | 1 129 kr mot ord. 1 469 kr (spara 340 kr) | ja |
| Brådska | — (brief saknas i repot) | ingen | ja |
**Utförandet föll:** nej — batch #2:s rad "Den blinda ytan: taket är det enda ägaren aldrig ser på sin egen vagn" stämmer med den live copyn · utford_som_briefad: okänd

**Diagnos:** KPI winner: läs hook rate, sedan hold rate, sedan förbi hooken. Den säljer men får inte spend — får den ingen spend på sju dagar är den en förlorare.

**Hypotes (gissning):** Gissning: "taket du aldrig ser" + reparationskostnaden konverterar bäst av dagens tre bedömbara videor (ROAS 2,86, CPA 464 kr mot break-even-CPA ~865 kr) men får bara 2 % av spenden — samma mönster som RI_2_H1: en RI-hook som säljer till dem den når men inte vinner auktionen; syskonet CS_8_H1 med samma tak-idé men prisankaret först fick 4 köp på 3 569 kr, så det är risk-framingen, inte prisankaret, som bär (n = 4, preliminär).

**Nästa annonser:**
- `Takoverdrag_RI_3_H2` — typ I, parent Takoverdrag_RI_3_H1, iteration 1: ny hook (0–3 s) — taket filmat rakt uppifrån med stående vatten vid takluckan (sidans egen scen), sedan H1:s rader; enda variabeln är hooken
- `Takoverdrag_RI_3_H3` — typ I, parent Takoverdrag_RI_3_H1, iteration 2: längre problemdel (4–6 s) — vad en takreparation innebär för ägaren (utan påhittad kronsiffra, backlog-regeln), sedan H1:s lösning

### Lärdom L-120250330248770291 — Takoverdrag_PD_8_1 (LOSER, etikett 2026-09-29)

| Fält | Värde |
|---|---|
| Batch | 2 |
| Utfall | LOSER |
| Fönster | 2026-09-22 – 2026-09-28 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 756 kr / 94 712 kr (1 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 2,06 |
| Konverteringsgrad | 0,0 % (0 köp / 31 LPV) |
| Hook rate / hold rate | okänd / okänd |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext rad 1 (live 2026-09-29): "6,5 × 3 meter – hela taket, inget mer. 210D-väv som tål en hel vintersäsong ute. 19,5 m², hanteras av en person." · rubrik: "6,5 × 3 meter – hela taket"
- Första frame / VO: inte avläst i den här ronden (bilden ej avläst) — under grinden, observation utan dom

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | läst ur copyn: svensk ägare av produkten som grupp — ingen person eller scen i texten | okänd |
| Vinkel | — (brief saknas i repot) | PD (problem → demo) enligt namnkoden; copyn: "6,5 × 3 meter – hela taket, inget mer. 210D-väv som tål en hel vintersäsong ute. 19,5 m², …" | okänd |
| Medvetandenivå | — (brief saknas i repot) | okänd — inte avläst utöver copyn | okänd |
| Mekanism | — (brief saknas i repot) | ur copyn: "6,5 × 3 meter – hela taket, inget mer. 210D-väv som tål en hel vintersäsong ute. 19,5 m², hanteras av en person." | okänd |
| Tro | — (brief saknas i repot) | ingen trosbarriär bemöts i copyn | okänd |
| Positionering | — (brief saknas i repot) | okänd — inte avläst utöver copyn | okänd |
| Brådska | — (brief saknas i repot) | ingen i copyn | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** Gissning: 756 kr och 0 köp första veckan är under grinden (300 kr / 3 köp) — annonsen förlorade auktionen mot syskonen, och siffrorna kan inte skilja en svag idé från en svag öppning; ingen dom.

**Nästa annonser:**
- `SLÄPP` — LOSER under grinden: en observation, ingen dom och ingen iteration (loser-regeln: iterera bara ur research, och det finns ingen bedömbar signal att iterera på).

### Lärdom L-120250330347950291 — Takoverdrag_CS_7_H1 (LOSER, etikett 2026-09-29)

| Fält | Värde |
|---|---|
| Batch | 2 |
| Utfall | LOSER |
| Fönster | 2026-09-22 – 2026-09-28 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 712 kr / 94 712 kr (1 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 2,06 |
| Konverteringsgrad | 0,0 % (0 köp / 35 LPV) |
| Hook rate / hold rate | 29 % / 12 % |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext rad 1 (live 2026-09-29): "1 129 kr. Inte 1 469 kr — 340 kr mindre." · rubrik: "1 129 kr, inte 1 469 kr."
- Första frame / VO: inte avläst i den här ronden (videon inte transkriberad) — under grinden, observation utan dom

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | läst ur copyn: svensk ägare av produkten som grupp — ingen person eller scen i texten | okänd |
| Vinkel | — (brief saknas i repot) | CS (pris/kostnadsankare) enligt namnkoden; copyn: "1 129 kr. Inte 1 469 kr — 340 kr mindre. En person fäster den, hand mot 210D-väven. Täckt …" | okänd |
| Medvetandenivå | — (brief saknas i repot) | okänd — inte avläst utöver copyn | okänd |
| Mekanism | — (brief saknas i repot) | ur copyn: "1 129 kr. Inte 1 469 kr — 340 kr mindre. En person fäster den, hand mot 210D-väven. Täckt av snö. 5,0 av 5 på 10 recensi…" | okänd |
| Tro | — (brief saknas i repot) | recensioner/stjärnor i copyn | okänd |
| Positionering | — (brief saknas i repot) | pris 1 129 kr i copyn | okänd |
| Brådska | — (brief saknas i repot) | ingen i copyn | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** Gissning: 712 kr och 0 köp första veckan är under grinden (300 kr / 3 köp) — annonsen förlorade auktionen mot syskonen, och siffrorna kan inte skilja en svag idé från en svag öppning; ingen dom.

**Nästa annonser:**
- `SLÄPP` för SE — LOSER under grinden (712 kr, 0 köp). ⚠️ Samma creative kör som `CaraShellRoof_NO_CS_107_H1` i CaraShells NO-kampanj med 10 köp på 5 060 kr (KPI_WINNER, bedömbar, etikett 2026-09-29): prisankaret vinner i Norge men fick inget köp i SE-huvudkampanjen — läs om dag 14 innan något byggs; ingen SE-iteration nu

### Lärdom L-120250330253570291 — Takoverdrag_BOF_4_1 (LOSER, etikett 2026-09-29)

| Fält | Värde |
|---|---|
| Batch | 2 |
| Utfall | LOSER · BOF |
| Fönster | 2026-09-22 – 2026-09-28 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 498 kr / 94 712 kr (1 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 2,06 |
| Konverteringsgrad | 0,0 % (0 köp / 10 LPV) |
| Hook rate / hold rate | okänd / okänd |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext rad 1 (live 2026-09-29): "1 129 kr. 340 kr billigare än ordinarie pris 1 469 kr, en rabatt på 23 %. Täcker hela taket, 19,5 m²." · rubrik: "1 129 kr för taköverdraget"
- Första frame / VO: inte avläst i den här ronden (bilden ej avläst) — under grinden, observation utan dom

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | läst ur copyn: svensk ägare av produkten som grupp — ingen person eller scen i texten | okänd |
| Vinkel | — (brief saknas i repot) | BOF (retargeting, invändning) enligt namnkoden; copyn: "1 129 kr. 340 kr billigare än ordinarie pris 1 469 kr, en rabatt på 23 %. Täcker hela take…" | okänd |
| Medvetandenivå | — (brief saknas i repot) | produktmedveten (copyn förutsätter att läsaren vet vad produkten är) | okänd |
| Mekanism | — (brief saknas i repot) | ur copyn: "1 129 kr. 340 kr billigare än ordinarie pris 1 469 kr, en rabatt på 23 %. Täcker hela taket, 19,5 m²." | okänd |
| Tro | — (brief saknas i repot) | ingen trosbarriär bemöts i copyn | okänd |
| Positionering | — (brief saknas i repot) | pris 1 129 kr i copyn | okänd |
| Brådska | — (brief saknas i repot) | ingen i copyn | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** BOF — räknas inte i frekvensen; lärdomen handlar om invändningen den svarar på.

**Hypotes (gissning):** Gissning: 498 kr och 0 köp första veckan är under grinden (300 kr / 3 köp) — annonsen förlorade auktionen mot syskonen, och siffrorna kan inte skilja en svag idé från en svag öppning; ingen dom.

**Nästa annonser:**
- `SLÄPP` — LOSER under grinden: en observation, ingen dom och ingen iteration (loser-regeln: iterera bara ur research, och det finns ingen bedömbar signal att iterera på).

### Lärdom L-120250330250170291 — Takoverdrag_PD_9_1 (LOSER, etikett 2026-09-29)

| Fält | Värde |
|---|---|
| Batch | 2 |
| Utfall | LOSER |
| Fönster | 2026-09-22 – 2026-09-28 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 433 kr / 94 712 kr (0 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 2,06 |
| Konverteringsgrad | 0,0 % (0 köp / 12 LPV) |
| Hook rate / hold rate | okänd / okänd |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext rad 1 (live 2026-09-29): "Vattnet blir stående kring takluckorna. Taket är det du aldrig ser – och det som kostar mest att laga om det går sönder. Täcker hela takytan, 6,5 × 3 m." · rubrik: "Vattnet blir stående på taket"
- Första frame / VO: inte avläst i den här ronden (bilden ej avläst) — under grinden, observation utan dom

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | läst ur copyn: svensk ägare av produkten som grupp — tilltalad som du/din, ingen namngiven person eller scen | okänd |
| Vinkel | — (brief saknas i repot) | PD (problem → demo) enligt namnkoden; copyn: "Vattnet blir stående kring takluckorna. Taket är det du aldrig ser – och det som kostar me…" | okänd |
| Medvetandenivå | — (brief saknas i repot) | okänd — inte avläst utöver copyn | okänd |
| Mekanism | — (brief saknas i repot) | ur copyn: "Vattnet blir stående kring takluckorna. Taket är det du aldrig ser – och det som kostar mest att laga om det går sönder.…" | okänd |
| Tro | — (brief saknas i repot) | ingen trosbarriär bemöts i copyn | okänd |
| Positionering | — (brief saknas i repot) | okänd — inte avläst utöver copyn | okänd |
| Brådska | — (brief saknas i repot) | ingen i copyn | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** Gissning: 433 kr och 0 köp första veckan är under grinden (300 kr / 3 köp) — annonsen förlorade auktionen mot syskonen, och siffrorna kan inte skilja en svag idé från en svag öppning; ingen dom.

**Nästa annonser:**
- `SLÄPP` — LOSER under grinden: en observation, ingen dom och ingen iteration (loser-regeln: iterera bara ur research, och det finns ingen bedömbar signal att iterera på).

### Lärdom L-120250330352620291 — Takoverdrag_PD_6_H1 (LOSER, etikett 2026-09-29)

| Fält | Värde |
|---|---|
| Batch | 2 |
| Utfall | LOSER |
| Fönster | 2026-09-22 – 2026-09-28 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 293 kr / 94 712 kr (0 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 2,06 |
| Konverteringsgrad | 0,0 % (0 köp / 19 LPV) |
| Hook rate / hold rate | 32 % / 9 % |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext rad 1 (live 2026-09-29): "En person. Det är allt det tar. Ingen extra hjälp behövs för att få överdraget på plats — bara rem och dragsko som spänns fast i kanten. Passar i medföljande vä…" · rubrik: "En person räcker för taket"
- Första frame / VO: inte avläst i den här ronden (videon inte transkriberad) — under grinden, observation utan dom

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | läst ur copyn: svensk ägare av produkten som grupp — ingen person eller scen i texten | okänd |
| Vinkel | — (brief saknas i repot) | PD (problem → demo) enligt namnkoden; copyn: "En person. Det är allt det tar. Ingen extra hjälp behövs för att få överdraget på plats — …" | okänd |
| Medvetandenivå | — (brief saknas i repot) | okänd — inte avläst utöver copyn | okänd |
| Mekanism | — (brief saknas i repot) | ur copyn: "En person. Det är allt det tar. Ingen extra hjälp behövs för att få överdraget på plats — bara rem och dragsko som spänn…" | okänd |
| Tro | — (brief saknas i repot) | ingen trosbarriär bemöts i copyn | okänd |
| Positionering | — (brief saknas i repot) | pris 1 129 kr i copyn | okänd |
| Brådska | — (brief saknas i repot) | ingen i copyn | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** Gissning: 293 kr och 0 köp första veckan är under grinden (300 kr / 3 köp) — annonsen förlorade auktionen mot syskonen, och siffrorna kan inte skilja en svag idé från en svag öppning; ingen dom.

**Nästa annonser:**
- `SLÄPP` — LOSER under grinden: en observation, ingen dom och ingen iteration (loser-regeln: iterera bara ur research, och det finns ingen bedömbar signal att iterera på).

### Lärdom L-120250330248500291 — Takoverdrag_BOF_9_1 (LOSER, etikett 2026-09-29)

| Fält | Värde |
|---|---|
| Batch | 3 |
| Utfall | LOSER · BOF |
| Fönster | 2026-09-22 – 2026-09-28 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 273 kr / 94 712 kr (0 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 2,06 |
| Konverteringsgrad | 0,0 % (0 köp / 7 LPV) |
| Hook rate / hold rate | okänd / okänd |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext rad 1 (live 2026-09-29): "1 129 kr nu. Ett tak du inte vet priset på sen. Taket är det du aldrig ser – och det som kostar mest att laga. 1 129 kr är hela notan, ingen gissning." · rubrik: "Skydda taket – 1 129 kr."
- Första frame / VO: inte avläst i den här ronden (bilden ej avläst) — under grinden, observation utan dom

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | läst ur copyn: svensk ägare av produkten som grupp — tilltalad som du/din, ingen namngiven person eller scen | okänd |
| Vinkel | — (brief saknas i repot) | BOF (retargeting, invändning) enligt namnkoden; copyn: "1 129 kr nu. Ett tak du inte vet priset på sen. Taket är det du aldrig ser – och det som k…" | okänd |
| Medvetandenivå | — (brief saknas i repot) | produktmedveten (copyn förutsätter att läsaren vet vad produkten är) | okänd |
| Mekanism | — (brief saknas i repot) | ur copyn: "1 129 kr nu. Ett tak du inte vet priset på sen. Taket är det du aldrig ser – och det som kostar mest att laga. 1 129 kr …" | okänd |
| Tro | — (brief saknas i repot) | ingen trosbarriär bemöts i copyn | okänd |
| Positionering | — (brief saknas i repot) | pris 1 129 kr i copyn | okänd |
| Brådska | — (brief saknas i repot) | ingen i copyn | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** BOF — räknas inte i frekvensen; lärdomen handlar om invändningen den svarar på.

**Hypotes (gissning):** Gissning: 273 kr och 0 köp första veckan är under grinden (300 kr / 3 köp) — annonsen förlorade auktionen mot syskonen, och siffrorna kan inte skilja en svag idé från en svag öppning; ingen dom.

**Nästa annonser:**
- `SLÄPP` — LOSER under grinden: en observation, ingen dom och ingen iteration (loser-regeln: iterera bara ur research, och det finns ingen bedömbar signal att iterera på).

### Lärdom L-120250330348980291 — Takoverdrag_GT_8_H1 (LOSER, etikett 2026-09-29)

| Fält | Värde |
|---|---|
| Batch | 2 |
| Utfall | LOSER |
| Fönster | 2026-09-22 – 2026-09-28 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 271 kr / 94 712 kr (0 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 2,06 |
| Konverteringsgrad | 0,0 % (0 köp / 12 LPV) |
| Hook rate / hold rate | 40 % / 7 % |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext rad 1 (live 2026-09-29): "Mitt i natten går han ut och känner efter — remmen sitter still." · rubrik: "En person. Rem och dragsko på plats."
- Första frame / VO: inte avläst i den här ronden (videon inte transkriberad) — under grinden, observation utan dom

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | läst ur copyn: svensk ägare av produkten som grupp — ingen person eller scen i texten | okänd |
| Vinkel | — (brief saknas i repot) | GT (present) enligt namnkoden; copyn: "Mitt i natten går han ut och känner efter — remmen sitter still. En gåva som en person fäs…" | okänd |
| Medvetandenivå | — (brief saknas i repot) | okänd — inte avläst utöver copyn | okänd |
| Mekanism | — (brief saknas i repot) | ur copyn: "Mitt i natten går han ut och känner efter — remmen sitter still. En gåva som en person fäster själv, rem och dragsko på …" | okänd |
| Tro | — (brief saknas i repot) | recensioner/stjärnor i copyn | okänd |
| Positionering | — (brief saknas i repot) | pris 1 129 kr i copyn | okänd |
| Brådska | — (brief saknas i repot) | ingen i copyn | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** Gissning: 271 kr och 0 köp första veckan är under grinden (300 kr / 3 köp) — annonsen förlorade auktionen mot syskonen, och siffrorna kan inte skilja en svag idé från en svag öppning; ingen dom.

**Nästa annonser:**
- `SLÄPP` — LOSER under grinden: en observation, ingen dom och ingen iteration (loser-regeln: iterera bara ur research, och det finns ingen bedömbar signal att iterera på).

### Lärdom L-120250330462810291 — Takoverdrag_OB_2_H1 (LOSER, etikett 2026-09-29)

| Fält | Värde |
|---|---|
| Batch | 3 |
| Utfall | LOSER |
| Fönster | 2026-09-22 – 2026-09-28 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 228 kr / 94 712 kr (0 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 2,06 |
| Konverteringsgrad | 0,0 % (0 köp / 6 LPV) |
| Hook rate / hold rate | 33 % / 9 % |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext rad 1 (live 2026-09-29): "Han viker ihop den och stoppar den i sin egen förvaringspåse." · rubrik: "1 129 kr. Ryms i en påse."
- Första frame / VO: inte avläst i den här ronden (videon inte transkriberad) — under grinden, observation utan dom

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | läst ur copyn: svensk ägare av produkten som grupp — ingen person eller scen i texten | okänd |
| Vinkel | — (brief saknas i repot) | OB (invändning) enligt namnkoden; copyn: "Han viker ihop den och stoppar den i sin egen förvaringspåse. Påsen får plats i bagageutry…" | okänd |
| Medvetandenivå | — (brief saknas i repot) | okänd — inte avläst utöver copyn | okänd |
| Mekanism | — (brief saknas i repot) | ur copyn: "Han viker ihop den och stoppar den i sin egen förvaringspåse. Påsen får plats i bagageutrymmet, bredvid dunken. 1 129 kr…" | okänd |
| Tro | — (brief saknas i repot) | ingen trosbarriär bemöts i copyn | okänd |
| Positionering | — (brief saknas i repot) | pris 1 129 kr i copyn | okänd |
| Brådska | — (brief saknas i repot) | ingen i copyn | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** Gissning: 228 kr och 0 köp första veckan är under grinden (300 kr / 3 köp) — annonsen förlorade auktionen mot syskonen, och siffrorna kan inte skilja en svag idé från en svag öppning; ingen dom.

**Nästa annonser:**
- `SLÄPP` — LOSER under grinden: en observation, ingen dom och ingen iteration (loser-regeln: iterera bara ur research, och det finns ingen bedömbar signal att iterera på).

### Lärdom L-120250330252190291 — Takoverdrag_CS_11_1 (LOSER, etikett 2026-09-29)

| Fält | Värde |
|---|---|
| Batch | 2 |
| Utfall | LOSER |
| Fönster | 2026-09-22 – 2026-09-28 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 192 kr / 94 712 kr (0 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 2,06 |
| Konverteringsgrad | 0,0 % (0 köp / 3 LPV) |
| Hook rate / hold rate | okänd / okänd |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext rad 1 (live 2026-09-29): "Spara 23 % på taköverdraget. 1 469 kr blir 1 129 kr. Betyg 5,0 av 5 på 10 recensioner." · rubrik: "Spara 23 % på taköverdraget"
- Första frame / VO: inte avläst i den här ronden (bilden ej avläst) — under grinden, observation utan dom

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | läst ur copyn: svensk ägare av produkten som grupp — ingen person eller scen i texten | okänd |
| Vinkel | — (brief saknas i repot) | CS (pris/kostnadsankare) enligt namnkoden; copyn: "Spara 23 % på taköverdraget. 1 469 kr blir 1 129 kr. Betyg 5,0 av 5 på 10 recensioner." | okänd |
| Medvetandenivå | — (brief saknas i repot) | okänd — inte avläst utöver copyn | okänd |
| Mekanism | — (brief saknas i repot) | ur copyn: "Spara 23 % på taköverdraget. 1 469 kr blir 1 129 kr. Betyg 5,0 av 5 på 10 recensioner." | okänd |
| Tro | — (brief saknas i repot) | recensioner/stjärnor i copyn | okänd |
| Positionering | — (brief saknas i repot) | pris 1 469 kr i copyn | okänd |
| Brådska | — (brief saknas i repot) | ingen i copyn | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** Gissning: 192 kr och 0 köp första veckan är under grinden (300 kr / 3 köp) — annonsen förlorade auktionen mot syskonen, och siffrorna kan inte skilja en svag idé från en svag öppning; ingen dom.

**Nästa annonser:**
- `SLÄPP` — LOSER under grinden: en observation, ingen dom och ingen iteration (loser-regeln: iterera bara ur research, och det finns ingen bedömbar signal att iterera på).

### Lärdom L-120250330350170291 — Takoverdrag_GT_7_H1 (LOSER, etikett 2026-09-29)

| Fält | Värde |
|---|---|
| Batch | 2 |
| Utfall | LOSER |
| Fönster | 2026-09-22 – 2026-09-28 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 128 kr / 94 712 kr (0 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 2,06 |
| Konverteringsgrad | 0,0 % (0 köp / 3 LPV) |
| Hook rate / hold rate | 51 % / 7 % |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext rad 1 (live 2026-09-29): "Han går ut i pyjamas i skymningen för att känna att den sitter kvar." · rubrik: "Känner att den sitter kvar, i mörkret."
- Första frame / VO: inte avläst i den här ronden (videon inte transkriberad) — under grinden, observation utan dom

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | läst ur copyn: svensk ägare av produkten som grupp — ingen person eller scen i texten | okänd |
| Vinkel | — (brief saknas i repot) | GT (present) enligt namnkoden; copyn: "Han går ut i pyjamas i skymningen för att känna att den sitter kvar. Han drar i remmen. De…" | okänd |
| Medvetandenivå | — (brief saknas i repot) | okänd — inte avläst utöver copyn | okänd |
| Mekanism | — (brief saknas i repot) | ur copyn: "Han går ut i pyjamas i skymningen för att känna att den sitter kvar. Han drar i remmen. Den rör sig inte. Gåvan är samma…" | okänd |
| Tro | — (brief saknas i repot) | recensioner/stjärnor i copyn | okänd |
| Positionering | — (brief saknas i repot) | pris 1 129 kr i copyn | okänd |
| Brådska | — (brief saknas i repot) | ingen i copyn | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** Gissning: 128 kr och 0 köp första veckan är under grinden (300 kr / 3 köp) — annonsen förlorade auktionen mot syskonen, och siffrorna kan inte skilja en svag idé från en svag öppning; ingen dom.

**Nästa annonser:**
- `SLÄPP` — LOSER under grinden: en observation, ingen dom och ingen iteration (loser-regeln: iterera bara ur research, och det finns ingen bedömbar signal att iterera på).

### Lärdom L-120250330351320291 — Takoverdrag_PD_7_H1 (LOSER, etikett 2026-09-29)

| Fält | Värde |
|---|---|
| Batch | 2 |
| Utfall | LOSER |
| Fönster | 2026-09-22 – 2026-09-28 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 115 kr / 94 712 kr (0 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 2,06 |
| Konverteringsgrad | 0,0 % (0 köp / 8 LPV) |
| Hook rate / hold rate | 30 % / 10 % |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext rad 1 (live 2026-09-29): "6,5 gånger 3 meter. Läggs rakt över taket. Rem och dragsko spänner fast kanten, så vatten aldrig blir stående kring takluckorna. En hink vatten hälls rakt över …" · rubrik: "6,5 × 3 m rakt över taket"
- Första frame / VO: inte avläst i den här ronden (videon inte transkriberad) — under grinden, observation utan dom

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | läst ur copyn: svensk ägare av produkten som grupp — ingen person eller scen i texten | okänd |
| Vinkel | — (brief saknas i repot) | PD (problem → demo) enligt namnkoden; copyn: "6,5 gånger 3 meter. Läggs rakt över taket. Rem och dragsko spänner fast kanten, så vatten …" | okänd |
| Medvetandenivå | — (brief saknas i repot) | okänd — inte avläst utöver copyn | okänd |
| Mekanism | — (brief saknas i repot) | ur copyn: "6,5 gånger 3 meter. Läggs rakt över taket. Rem och dragsko spänner fast kanten, så vatten aldrig blir stående kring takl…" | okänd |
| Tro | — (brief saknas i repot) | ingen trosbarriär bemöts i copyn | okänd |
| Positionering | — (brief saknas i repot) | pris 1 129 kr i copyn | okänd |
| Brådska | — (brief saknas i repot) | ingen i copyn | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** Gissning: 115 kr och 0 köp första veckan är under grinden (300 kr / 3 köp) — annonsen förlorade auktionen mot syskonen, och siffrorna kan inte skilja en svag idé från en svag öppning; ingen dom.

**Nästa annonser:**
- `SLÄPP` — LOSER under grinden: en observation, ingen dom och ingen iteration (loser-regeln: iterera bara ur research, och det finns ingen bedömbar signal att iterera på).

### Lärdom L-120250330255540291 — Takoverdrag_RI_4_1 (LOSER, etikett 2026-09-29)

| Fält | Värde |
|---|---|
| Batch | 2 |
| Utfall | LOSER |
| Fönster | 2026-09-22 – 2026-09-28 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 110 kr / 94 712 kr (0 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 2,06 |
| Konverteringsgrad | 0,0 % (0 köp / 4 LPV) |
| Hook rate / hold rate | okänd / okänd |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext rad 1 (live 2026-09-29): "Vattnet blir aldrig stående kring takluckorna. Taket är det du aldrig ser – och det som kostar mest att laga om det går sönder. Det är 210D-väv, inte en tunn pr…" · rubrik: "Vattnet blir aldrig stående"
- Första frame / VO: inte avläst i den här ronden (bilden ej avläst) — under grinden, observation utan dom

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | läst ur copyn: svensk ägare av produkten som grupp — tilltalad som du/din, ingen namngiven person eller scen | okänd |
| Vinkel | — (brief saknas i repot) | RI (risk/kostnaden av att inte skydda) enligt namnkoden; copyn: "Vattnet blir aldrig stående kring takluckorna. Taket är det du aldrig ser – och det som ko…" | okänd |
| Medvetandenivå | — (brief saknas i repot) | okänd — inte avläst utöver copyn | okänd |
| Mekanism | — (brief saknas i repot) | ur copyn: "Vattnet blir aldrig stående kring takluckorna. Taket är det du aldrig ser – och det som kostar mest att laga om det går …" | okänd |
| Tro | — (brief saknas i repot) | ingen trosbarriär bemöts i copyn | okänd |
| Positionering | — (brief saknas i repot) | pris 1 129 kr i copyn | okänd |
| Brådska | — (brief saknas i repot) | ingen i copyn | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** Gissning: 110 kr och 0 köp första veckan är under grinden (300 kr / 3 köp) — annonsen förlorade auktionen mot syskonen, och siffrorna kan inte skilja en svag idé från en svag öppning; ingen dom.

**Nästa annonser:**
- `SLÄPP` — LOSER under grinden: en observation, ingen dom och ingen iteration (loser-regeln: iterera bara ur research, och det finns ingen bedömbar signal att iterera på).

### Lärdom L-120250330350540291 — Takoverdrag_GT_10_H1 (LOSER, etikett 2026-09-29)

| Fält | Värde |
|---|---|
| Batch | 3 |
| Utfall | LOSER |
| Fönster | 2026-09-22 – 2026-09-28 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 84 kr / 94 712 kr (0 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 2,06 |
| Konverteringsgrad | 0,0 % (0 köp / 3 LPV) |
| Hook rate / hold rate | 34 % / 8 % |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext rad 1 (live 2026-09-29): "Han har markis, klossar och gasvärmare till husvagnen." · rubrik: "Nio storlekar. Från 1 129 kr."
- Första frame / VO: inte avläst i den här ronden (videon inte transkriberad) — under grinden, observation utan dom

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | läst ur copyn: svensk ägare av produkten som grupp — ingen person eller scen i texten | okänd |
| Vinkel | — (brief saknas i repot) | GT (present) enligt namnkoden; copyn: "Han har markis, klossar och gasvärmare till husvagnen. Men taket har stått obeskyddat hela…" | okänd |
| Medvetandenivå | — (brief saknas i repot) | okänd — inte avläst utöver copyn | okänd |
| Mekanism | — (brief saknas i repot) | ur copyn: "Han har markis, klossar och gasvärmare till husvagnen. Men taket har stått obeskyddat hela sommaren. Nio storlekar, från…" | okänd |
| Tro | — (brief saknas i repot) | ingen trosbarriär bemöts i copyn | okänd |
| Positionering | — (brief saknas i repot) | pris 1 129 kr i copyn | okänd |
| Brådska | — (brief saknas i repot) | ingen i copyn | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** Gissning: 84 kr och 0 köp första veckan är under grinden (300 kr / 3 köp) — annonsen förlorade auktionen mot syskonen, och siffrorna kan inte skilja en svag idé från en svag öppning; ingen dom.

**Nästa annonser:**
- `SLÄPP` — LOSER under grinden: en observation, ingen dom och ingen iteration (loser-regeln: iterera bara ur research, och det finns ingen bedömbar signal att iterera på).

### Lärdom L-120250330250730291 — Takoverdrag_CS_10_1 (LOSER, etikett 2026-09-29)

| Fält | Värde |
|---|---|
| Batch | 2 |
| Utfall | LOSER |
| Fönster | 2026-09-22 – 2026-09-28 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 71 kr / 94 712 kr (0 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 2,06 |
| Konverteringsgrad | 0,0 % (0 köp / 2 LPV) |
| Hook rate / hold rate | okänd / okänd |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext rad 1 (live 2026-09-29): "Spara 340 kr på taköverdraget. 1 469 kr blir 1 129 kr. Betyg 5,0 av 5 på 10 recensioner." · rubrik: "Spara 340 kr på taköverdraget"
- Första frame / VO: inte avläst i den här ronden (bilden ej avläst) — under grinden, observation utan dom

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | läst ur copyn: svensk ägare av produkten som grupp — ingen person eller scen i texten | okänd |
| Vinkel | — (brief saknas i repot) | CS (pris/kostnadsankare) enligt namnkoden; copyn: "Spara 340 kr på taköverdraget. 1 469 kr blir 1 129 kr. Betyg 5,0 av 5 på 10 recensioner." | okänd |
| Medvetandenivå | — (brief saknas i repot) | okänd — inte avläst utöver copyn | okänd |
| Mekanism | — (brief saknas i repot) | ur copyn: "Spara 340 kr på taköverdraget. 1 469 kr blir 1 129 kr. Betyg 5,0 av 5 på 10 recensioner." | okänd |
| Tro | — (brief saknas i repot) | recensioner/stjärnor i copyn | okänd |
| Positionering | — (brief saknas i repot) | pris 340 kr i copyn | okänd |
| Brådska | — (brief saknas i repot) | ingen i copyn | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** Gissning: 71 kr och 0 köp första veckan är under grinden (300 kr / 3 köp) — annonsen förlorade auktionen mot syskonen, och siffrorna kan inte skilja en svag idé från en svag öppning; ingen dom.

**Nästa annonser:**
- `SLÄPP` — LOSER under grinden: en observation, ingen dom och ingen iteration (loser-regeln: iterera bara ur research, och det finns ingen bedömbar signal att iterera på).

### Lärdom L-120250330351050291 — Takoverdrag_CO_3_H1 (LOSER, etikett 2026-09-29)

| Fält | Värde |
|---|---|
| Batch | 2 |
| Utfall | LOSER |
| Fönster | 2026-09-22 – 2026-09-28 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 70 kr / 94 712 kr (0 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 2,06 |
| Konverteringsgrad | 0,0 % (0 köp / 1 LPV) |
| Hook rate / hold rate | 23 % / 6 % |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext rad 1 (live 2026-09-29): "Ett helt husvagnsöverdrag du bänder på själv, kant mot kant mot lacken hela vintern." · rubrik: "En hand. Ingen kontakt med lacken."
- Första frame / VO: inte avläst i den här ronden (videon inte transkriberad) — under grinden, observation utan dom

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | läst ur copyn: svensk ägare av produkten som grupp — tilltalad som du/din, ingen namngiven person eller scen | okänd |
| Vinkel | — (brief saknas i repot) | CO (jämförelse) enligt namnkoden; copyn: "Ett helt husvagnsöverdrag du bänder på själv, kant mot kant mot lacken hela vintern. Ett t…" | okänd |
| Medvetandenivå | — (brief saknas i repot) | okänd — inte avläst utöver copyn | okänd |
| Mekanism | — (brief saknas i repot) | ur copyn: "Ett helt husvagnsöverdrag du bänder på själv, kant mot kant mot lacken hela vintern. Ett taköverdrag lyfter du på med en…" | okänd |
| Tro | — (brief saknas i repot) | ingen trosbarriär bemöts i copyn | okänd |
| Positionering | — (brief saknas i repot) | pris 1 129 kr i copyn | okänd |
| Brådska | — (brief saknas i repot) | ingen i copyn | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** Gissning: 70 kr och 0 köp första veckan är under grinden (300 kr / 3 köp) — annonsen förlorade auktionen mot syskonen, och siffrorna kan inte skilja en svag idé från en svag öppning; ingen dom.

**Nästa annonser:**
- `SLÄPP` — LOSER under grinden: en observation, ingen dom och ingen iteration (loser-regeln: iterera bara ur research, och det finns ingen bedömbar signal att iterera på).

### Lärdom L-120250330254390291 — Takoverdrag_BOF_5_1 (LOSER, etikett 2026-09-29)

| Fält | Värde |
|---|---|
| Batch | 2 |
| Utfall | LOSER · BOF |
| Fönster | 2026-09-22 – 2026-09-28 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 57 kr / 94 712 kr (0 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 2,06 |
| Konverteringsgrad | 0,0 % (0 köp / 1 LPV) |
| Hook rate / hold rate | okänd / okänd |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext rad 1 (live 2026-09-29): "Räcker inte en presenning? En tunn presenning spricker i kylan. Taköverdraget är 210D-väv och tål vintern ute – utan att spricka." · rubrik: "Räcker inte en presenning?"
- Första frame / VO: inte avläst i den här ronden (bilden ej avläst) — under grinden, observation utan dom

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | läst ur copyn: svensk ägare av produkten som grupp — ingen person eller scen i texten | okänd |
| Vinkel | — (brief saknas i repot) | BOF (retargeting, invändning) enligt namnkoden; copyn: "Räcker inte en presenning? En tunn presenning spricker i kylan. Taköverdraget är 210D-väv …" | okänd |
| Medvetandenivå | — (brief saknas i repot) | produktmedveten (copyn förutsätter att läsaren vet vad produkten är) | okänd |
| Mekanism | — (brief saknas i repot) | ur copyn: "Räcker inte en presenning? En tunn presenning spricker i kylan. Taköverdraget är 210D-väv och tål vintern ute – utan att…" | okänd |
| Tro | — (brief saknas i repot) | ingen trosbarriär bemöts i copyn | okänd |
| Positionering | — (brief saknas i repot) | okänd — inte avläst utöver copyn | okänd |
| Brådska | — (brief saknas i repot) | ingen i copyn | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** BOF — räknas inte i frekvensen; lärdomen handlar om invändningen den svarar på.

**Hypotes (gissning):** Gissning: 57 kr och 0 köp första veckan är under grinden (300 kr / 3 köp) — annonsen förlorade auktionen mot syskonen, och siffrorna kan inte skilja en svag idé från en svag öppning; ingen dom.

**Nästa annonser:**
- `SLÄPP` — LOSER under grinden: en observation, ingen dom och ingen iteration (loser-regeln: iterera bara ur research, och det finns ingen bedömbar signal att iterera på).

### Lärdom L-120250330248220291 — Takoverdrag_CS_13_1 (LOSER, etikett 2026-09-29)

| Fält | Värde |
|---|---|
| Batch | 3 |
| Utfall | LOSER |
| Fönster | 2026-09-22 – 2026-09-28 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 51 kr / 94 712 kr (0 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 2,06 |
| Konverteringsgrad | 0,0 % (0 köp / 3 LPV) |
| Hook rate / hold rate | okänd / okänd |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext rad 1 (live 2026-09-29): "58 kr per kvadratmeter skyddat tak. 1 129 kr för 19,5 m² – hela takytan på en 6,5-meters husvagn. Taket är det du aldrig ser, och det som kostar mest att laga." · rubrik: "58 kr per kvadratmeter tak"
- Första frame / VO: inte avläst i den här ronden (bilden ej avläst) — under grinden, observation utan dom

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | läst ur copyn: svensk ägare av produkten som grupp — tilltalad som du/din, ingen namngiven person eller scen | okänd |
| Vinkel | — (brief saknas i repot) | CS (pris/kostnadsankare) enligt namnkoden; copyn: "58 kr per kvadratmeter skyddat tak. 1 129 kr för 19,5 m² – hela takytan på en 6,5-meters h…" | okänd |
| Medvetandenivå | — (brief saknas i repot) | okänd — inte avläst utöver copyn | okänd |
| Mekanism | — (brief saknas i repot) | ur copyn: "58 kr per kvadratmeter skyddat tak. 1 129 kr för 19,5 m² – hela takytan på en 6,5-meters husvagn. Taket är det du aldrig…" | okänd |
| Tro | — (brief saknas i repot) | ingen trosbarriär bemöts i copyn | okänd |
| Positionering | — (brief saknas i repot) | pris 58 kr i copyn | okänd |
| Brådska | — (brief saknas i repot) | ingen i copyn | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** Gissning: 51 kr och 0 köp första veckan är under grinden (300 kr / 3 köp) — annonsen förlorade auktionen mot syskonen, och siffrorna kan inte skilja en svag idé från en svag öppning; ingen dom.

**Nästa annonser:**
- `SLÄPP` — LOSER under grinden: en observation, ingen dom och ingen iteration (loser-regeln: iterera bara ur research, och det finns ingen bedömbar signal att iterera på).

### Lärdom L-120250330247620291 — Takoverdrag_BOF_8_1 (LOSER, etikett 2026-09-29)

| Fält | Värde |
|---|---|
| Batch | 3 |
| Utfall | LOSER · BOF |
| Fönster | 2026-09-22 – 2026-09-28 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 41 kr / 94 712 kr (0 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 2,06 |
| Konverteringsgrad | 0,0 % (0 köp / 1 LPV) |
| Hook rate / hold rate | okänd / okänd |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext rad 1 (live 2026-09-29): "På sommaren bor den i en påse, inte i vägen. Ryms i förvaringspåsen som följer med. Ingen skrymmande vinterförvaring – bara påsen som kom med paketet." · rubrik: "1 129 kr. Ryms i en påse."
- Första frame / VO: inte avläst i den här ronden (bilden ej avläst) — under grinden, observation utan dom

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | läst ur copyn: svensk ägare av produkten som grupp — ingen person eller scen i texten | okänd |
| Vinkel | — (brief saknas i repot) | BOF (retargeting, invändning) enligt namnkoden; copyn: "På sommaren bor den i en påse, inte i vägen. Ryms i förvaringspåsen som följer med. Ingen …" | okänd |
| Medvetandenivå | — (brief saknas i repot) | produktmedveten (copyn förutsätter att läsaren vet vad produkten är) | okänd |
| Mekanism | — (brief saknas i repot) | ur copyn: "På sommaren bor den i en påse, inte i vägen. Ryms i förvaringspåsen som följer med. Ingen skrymmande vinterförvaring – b…" | okänd |
| Tro | — (brief saknas i repot) | ingen trosbarriär bemöts i copyn | okänd |
| Positionering | — (brief saknas i repot) | pris 1 129 kr i copyn | okänd |
| Brådska | — (brief saknas i repot) | ingen i copyn | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** BOF — räknas inte i frekvensen; lärdomen handlar om invändningen den svarar på.

**Hypotes (gissning):** Gissning: 41 kr och 0 köp första veckan är under grinden (300 kr / 3 köp) — annonsen förlorade auktionen mot syskonen, och siffrorna kan inte skilja en svag idé från en svag öppning; ingen dom.

**Nästa annonser:**
- `SLÄPP` — LOSER under grinden: en observation, ingen dom och ingen iteration (loser-regeln: iterera bara ur research, och det finns ingen bedömbar signal att iterera på).

### Lärdom L-120250330255120291 — Takoverdrag_LI_2_1 (LOSER, etikett 2026-09-29)

| Fält | Värde |
|---|---|
| Batch | 2 |
| Utfall | LOSER |
| Fönster | 2026-09-22 – 2026-09-28 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 23 kr / 94 712 kr (0 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 2,06 |
| Konverteringsgrad | okänd — backfillad före 2026-09-21 (inga klick i fönstret hämtade) |
| Hook rate / hold rate | okänd / okänd |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext rad 1 (live 2026-09-29): "6,5 × 3 meter tak. Inget mer. Rem och dragsko i kanten, sätts på av en person. 210D-väv som ryms i medföljande påse. 1 129 kr, 23 % rabatt mot 1 469 kr." · rubrik: "6,5 × 3 meter tak. Inget mer."
- Första frame / VO: inte avläst i den här ronden (bilden ej avläst) — under grinden, observation utan dom

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | läst ur copyn: svensk ägare av produkten som grupp — ingen person eller scen i texten | okänd |
| Vinkel | — (brief saknas i repot) | LI (listicle) enligt namnkoden; copyn: "6,5 × 3 meter tak. Inget mer. Rem och dragsko i kanten, sätts på av en person. 210D-väv so…" | okänd |
| Medvetandenivå | — (brief saknas i repot) | okänd — inte avläst utöver copyn | okänd |
| Mekanism | — (brief saknas i repot) | ur copyn: "6,5 × 3 meter tak. Inget mer. Rem och dragsko i kanten, sätts på av en person. 210D-väv som ryms i medföljande påse. 1 1…" | okänd |
| Tro | — (brief saknas i repot) | ingen trosbarriär bemöts i copyn | okänd |
| Positionering | — (brief saknas i repot) | pris 1 129 kr i copyn | okänd |
| Brådska | — (brief saknas i repot) | ingen i copyn | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** Gissning: 23 kr och 0 köp första veckan är under grinden (300 kr / 3 köp) — annonsen förlorade auktionen mot syskonen, och siffrorna kan inte skilja en svag idé från en svag öppning; ingen dom.

**Nästa annonser:**
- `SLÄPP` — LOSER under grinden: en observation, ingen dom och ingen iteration (loser-regeln: iterera bara ur research, och det finns ingen bedömbar signal att iterera på).

### Lärdom L-120250330254110291 — Takoverdrag_TR_2_1 (LOSER, etikett 2026-09-29)

| Fält | Värde |
|---|---|
| Batch | 2 |
| Utfall | LOSER |
| Fönster | 2026-09-22 – 2026-09-28 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 16 kr / 94 712 kr (0 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 2,06 |
| Konverteringsgrad | okänd — backfillad före 2026-09-21 (inga klick i fönstret hämtade) |
| Hook rate / hold rate | okänd / okänd |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext rad 1 (live 2026-09-29): "Bara 10 recensioner. Alla 5 av 5. 5,0 av 5 på 10 recensioner. 1 129 kr för taköverdraget." · rubrik: "Bara 10 recensioner. Alla 5 av 5."
- Första frame / VO: inte avläst i den här ronden (bilden ej avläst) — under grinden, observation utan dom

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | läst ur copyn: svensk ägare av produkten som grupp — ingen person eller scen i texten | okänd |
| Vinkel | — (brief saknas i repot) | TR (transparens/ärlighet) enligt namnkoden; copyn: "Bara 10 recensioner. Alla 5 av 5. 5,0 av 5 på 10 recensioner. 1 129 kr för taköverdraget." | okänd |
| Medvetandenivå | — (brief saknas i repot) | okänd — inte avläst utöver copyn | okänd |
| Mekanism | — (brief saknas i repot) | ur copyn: "Bara 10 recensioner. Alla 5 av 5. 5,0 av 5 på 10 recensioner. 1 129 kr för taköverdraget." | okänd |
| Tro | — (brief saknas i repot) | recensioner/stjärnor i copyn | okänd |
| Positionering | — (brief saknas i repot) | pris 1 129 kr i copyn | okänd |
| Brådska | — (brief saknas i repot) | ingen i copyn | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** Gissning: 16 kr och 0 köp första veckan är under grinden (300 kr / 3 köp) — annonsen förlorade auktionen mot syskonen, och siffrorna kan inte skilja en svag idé från en svag öppning; ingen dom.

**Nästa annonser:**
- `SLÄPP` — LOSER under grinden: en observation, ingen dom och ingen iteration (loser-regeln: iterera bara ur research, och det finns ingen bedömbar signal att iterera på).

### Lärdom L-120250330463600291 — Takoverdrag_OB_1_H1 (LOSER, etikett 2026-09-29)

| Fält | Värde |
|---|---|
| Batch | 2 |
| Utfall | LOSER |
| Fönster | 2026-09-22 – 2026-09-28 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 11 kr / 94 712 kr (0 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 2,06 |
| Konverteringsgrad | 0,0 % (0 köp / 1 klick) |
| Hook rate / hold rate | 13 % / 6 % |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext rad 1 (live 2026-09-29): "”Blåser det inte av?”, tänker du. Rem och dragsko spänner kanten hårt, ingen flaxning även i hård vind. 210D-väv, gjort för en hel vintersäsong utomhus. 1 129 k…" · rubrik: "Sitter kvar när det blåser"
- Första frame / VO: inte avläst i den här ronden (videon inte transkriberad) — under grinden, observation utan dom

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | läst ur copyn: svensk ägare av produkten som grupp — tilltalad som du/din, ingen namngiven person eller scen | okänd |
| Vinkel | — (brief saknas i repot) | OB (invändning) enligt namnkoden; copyn: "”Blåser det inte av?”, tänker du. Rem och dragsko spänner kanten hårt, ingen flaxning även…" | okänd |
| Medvetandenivå | — (brief saknas i repot) | okänd — inte avläst utöver copyn | okänd |
| Mekanism | — (brief saknas i repot) | ur copyn: "”Blåser det inte av?”, tänker du. Rem och dragsko spänner kanten hårt, ingen flaxning även i hård vind. 210D-väv, gjort …" | okänd |
| Tro | — (brief saknas i repot) | ingen trosbarriär bemöts i copyn | okänd |
| Positionering | — (brief saknas i repot) | pris 1 129 kr i copyn | okänd |
| Brådska | — (brief saknas i repot) | ingen i copyn | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** Gissning: 11 kr och 0 köp första veckan är under grinden (300 kr / 3 köp) — annonsen förlorade auktionen mot syskonen, och siffrorna kan inte skilja en svag idé från en svag öppning; ingen dom.

**Nästa annonser:**
- `SLÄPP` — LOSER under grinden: en observation, ingen dom och ingen iteration (loser-regeln: iterera bara ur research, och det finns ingen bedömbar signal att iterera på).

### Lärdom L-120250330247030291 — Takoverdrag_BOF_7_1 (INGEN_LEVERANS, etikett 2026-09-29)

| Fält | Värde |
|---|---|
| Batch | 3 |
| Utfall | INGEN_LEVERANS · BOF |
| Fönster | 2026-09-22 – 2026-09-28 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 7 kr / 94 712 kr |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 2,06 |
| Konverteringsgrad | okänd — backfillad före 2026-09-21 (inga klick i fönstret hämtade) |
| Hook rate / hold rate | okänd / okänd |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext rad 1 (live 2026-09-29): "Din husvagns längd är en av nio. Nio storlekar, 3 × 5,5 till 3 × 13,5 meter. Från 1 129 kr." · rubrik: "Se alla nio storlekar"
- Första frame / VO: inte avläst i den här ronden (bilden ej avläst) — under grinden, observation utan dom

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | läst ur copyn: svensk ägare av produkten som grupp — tilltalad som du/din, ingen namngiven person eller scen | okänd |
| Vinkel | — (brief saknas i repot) | BOF (retargeting, invändning) enligt namnkoden; copyn: "Din husvagns längd är en av nio. Nio storlekar, 3 × 5,5 till 3 × 13,5 meter. Från 1 129 kr…" | okänd |
| Medvetandenivå | — (brief saknas i repot) | produktmedveten (copyn förutsätter att läsaren vet vad produkten är) | okänd |
| Mekanism | — (brief saknas i repot) | ur copyn: "Din husvagns längd är en av nio. Nio storlekar, 3 × 5,5 till 3 × 13,5 meter. Från 1 129 kr." | okänd |
| Tro | — (brief saknas i repot) | ingen trosbarriär bemöts i copyn | okänd |
| Positionering | — (brief saknas i repot) | pris 1 129 kr i copyn | okänd |
| Brådska | — (brief saknas i repot) | ingen i copyn | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** BOF — räknas inte i frekvensen; lärdomen handlar om invändningen den svarar på.

**Hypotes (gissning):** Gissning: Meta gav den 7 kr första veckan — öppningen vann aldrig auktionen mot syskonen i samma adset; utfallet säger inget om idén, bara att den inte fick leverans.

**Nästa annonser:**
- `SLÄPP` — INGEN_LEVERANS (under 300 kr, 0 köp): logga och släpp, aldrig ABO (Axels beslut 2026-09-20); idén får bara komma igen som en ny öppning på en levande vinnare, inte som samma annons.

### Lärdom L-120250330350820291 — Takoverdrag_TR_3_H1 (INGEN_LEVERANS, etikett 2026-09-29)

| Fält | Värde |
|---|---|
| Batch | 3 |
| Utfall | INGEN_LEVERANS |
| Fönster | 2026-09-22 – 2026-09-28 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 6 kr / 94 712 kr |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 2,06 |
| Konverteringsgrad | okänd — backfillad före 2026-09-21 (inga klick i fönstret hämtade) |
| Hook rate / hold rate | 26 % / 11 % |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext rad 1 (live 2026-09-29): "Den täcker bara taket." · rubrik: "Bara taket. En hand räcker."
- Första frame / VO: inte avläst i den här ronden (videon inte transkriberad) — under grinden, observation utan dom

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | läst ur copyn: svensk ägare av produkten som grupp — ingen person eller scen i texten | okänd |
| Vinkel | — (brief saknas i repot) | TR (transparens/ärlighet) enligt namnkoden; copyn: "Den täcker bara taket. Inte hela husvagnen — därför räcker en person, och ingenting nöter …" | okänd |
| Medvetandenivå | — (brief saknas i repot) | okänd — inte avläst utöver copyn | okänd |
| Mekanism | — (brief saknas i repot) | ur copyn: "Den täcker bara taket. Inte hela husvagnen — därför räcker en person, och ingenting nöter mot lacken på sidorna. 1 129 k…" | okänd |
| Tro | — (brief saknas i repot) | ingen trosbarriär bemöts i copyn | okänd |
| Positionering | — (brief saknas i repot) | pris 1 129 kr i copyn | okänd |
| Brådska | — (brief saknas i repot) | ingen i copyn | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Ingen leverans: hooken föll för Meta — logga och släpp, aldrig ABO.

**Hypotes (gissning):** Gissning: Meta gav den 6 kr första veckan — öppningen vann aldrig auktionen mot syskonen i samma adset; utfallet säger inget om idén, bara att den inte fick leverans.

**Nästa annonser:**
- `SLÄPP` — INGEN_LEVERANS (under 300 kr, 0 köp): logga och släpp, aldrig ABO (Axels beslut 2026-09-20); idén får bara komma igen som en ny öppning på en levande vinnare, inte som samma annons.

### Lärdom L-120250330252730291 — Takoverdrag_BOF_6_1 (INGEN_LEVERANS, etikett 2026-09-29)

| Fält | Värde |
|---|---|
| Batch | 2 |
| Utfall | INGEN_LEVERANS · BOF |
| Fönster | 2026-09-22 – 2026-09-28 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 6 kr / 94 712 kr |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 2,06 |
| Konverteringsgrad | okänd — backfillad före 2026-09-21 (inga klick i fönstret hämtade) |
| Hook rate / hold rate | okänd / okänd |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext rad 1 (live 2026-09-29): "Klarar jag det själv? Ja. Bara taket, inte hela vagnen – en person sätter fast rem och dragsko i kanten utan hjälp." · rubrik: "Klarar jag det själv?"
- Första frame / VO: inte avläst i den här ronden (bilden ej avläst) — under grinden, observation utan dom

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | läst ur copyn: svensk ägare av produkten som grupp — ingen person eller scen i texten | okänd |
| Vinkel | — (brief saknas i repot) | BOF (retargeting, invändning) enligt namnkoden; copyn: "Klarar jag det själv? Ja. Bara taket, inte hela vagnen – en person sätter fast rem och dra…" | okänd |
| Medvetandenivå | — (brief saknas i repot) | produktmedveten (copyn förutsätter att läsaren vet vad produkten är) | okänd |
| Mekanism | — (brief saknas i repot) | ur copyn: "Klarar jag det själv? Ja. Bara taket, inte hela vagnen – en person sätter fast rem och dragsko i kanten utan hjälp." | okänd |
| Tro | — (brief saknas i repot) | ingen trosbarriär bemöts i copyn | okänd |
| Positionering | — (brief saknas i repot) | okänd — inte avläst utöver copyn | okänd |
| Brådska | — (brief saknas i repot) | ingen i copyn | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** BOF — räknas inte i frekvensen; lärdomen handlar om invändningen den svarar på.

**Hypotes (gissning):** Gissning: Meta gav den 6 kr första veckan — öppningen vann aldrig auktionen mot syskonen i samma adset; utfallet säger inget om idén, bara att den inte fick leverans.

**Nästa annonser:**
- `SLÄPP` — INGEN_LEVERANS (under 300 kr, 0 köp): logga och släpp, aldrig ABO (Axels beslut 2026-09-20); idén får bara komma igen som en ny öppning på en levande vinnare, inte som samma annons.

### Lärdom L-120250330249920291 — Takoverdrag_CO_4_1 (INGEN_LEVERANS, etikett 2026-09-29)

| Fält | Värde |
|---|---|
| Batch | 2 |
| Utfall | INGEN_LEVERANS |
| Fönster | 2026-09-22 – 2026-09-28 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 6 kr / 94 712 kr |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 2,06 |
| Konverteringsgrad | okänd — backfillad före 2026-09-21 (inga klick i fönstret hämtade) |
| Hook rate / hold rate | okänd / okänd |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext rad 1 (live 2026-09-29): "Bara taket. Inte hela vagnen. Ett helöverdrag är tungt att få på plats själv och skaver mot lacken hela vintern. Taköverdraget hanteras av en person." · rubrik: "Bara taket. Inte hela vagnen."
- Första frame / VO: inte avläst i den här ronden (bilden ej avläst) — under grinden, observation utan dom

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | läst ur copyn: svensk ägare av produkten som grupp — ingen person eller scen i texten | okänd |
| Vinkel | — (brief saknas i repot) | CO (jämförelse) enligt namnkoden; copyn: "Bara taket. Inte hela vagnen. Ett helöverdrag är tungt att få på plats själv och skaver mo…" | okänd |
| Medvetandenivå | — (brief saknas i repot) | okänd — inte avläst utöver copyn | okänd |
| Mekanism | — (brief saknas i repot) | ur copyn: "Bara taket. Inte hela vagnen. Ett helöverdrag är tungt att få på plats själv och skaver mot lacken hela vintern. Taköver…" | okänd |
| Tro | — (brief saknas i repot) | ingen trosbarriär bemöts i copyn | okänd |
| Positionering | — (brief saknas i repot) | okänd — inte avläst utöver copyn | okänd |
| Brådska | — (brief saknas i repot) | ingen i copyn | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Ingen leverans: hooken föll för Meta — logga och släpp, aldrig ABO.

**Hypotes (gissning):** Gissning: Meta gav den 6 kr första veckan — öppningen vann aldrig auktionen mot syskonen i samma adset; utfallet säger inget om idén, bara att den inte fick leverans.

**Nästa annonser:**
- `SLÄPP` — INGEN_LEVERANS (under 300 kr, 0 köp): logga och släpp, aldrig ABO (Axels beslut 2026-09-20); idén får bara komma igen som en ny öppning på en levande vinnare, inte som samma annons.

### Lärdom L-120250330251630291 — Takoverdrag_GT_9_1 (INGEN_LEVERANS, etikett 2026-09-29)

| Fält | Värde |
|---|---|
| Batch | 2 |
| Utfall | INGEN_LEVERANS |
| Fönster | 2026-09-22 – 2026-09-28 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 5 kr / 94 712 kr |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 2,06 |
| Konverteringsgrad | 0,0 % (0 köp / 1 LPV) |
| Hook rate / hold rate | okänd / okänd |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext rad 1 (live 2026-09-29): "Han går ut i pyjamas för att kolla att överdraget sitter. Rem och dragsko i kanten håller det på plats när det blåser. Betyg 5,0 av 5 på 10 recensioner." · rubrik: "Han går ut i pyjamas och kollar taket"
- Första frame / VO: inte avläst i den här ronden (bilden ej avläst) — under grinden, observation utan dom

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | läst ur copyn: svensk ägare av produkten som grupp — ingen person eller scen i texten | okänd |
| Vinkel | — (brief saknas i repot) | GT (present) enligt namnkoden; copyn: "Han går ut i pyjamas för att kolla att överdraget sitter. Rem och dragsko i kanten håller …" | okänd |
| Medvetandenivå | — (brief saknas i repot) | okänd — inte avläst utöver copyn | okänd |
| Mekanism | — (brief saknas i repot) | ur copyn: "Han går ut i pyjamas för att kolla att överdraget sitter. Rem och dragsko i kanten håller det på plats när det blåser. B…" | okänd |
| Tro | — (brief saknas i repot) | recensioner/stjärnor i copyn | okänd |
| Positionering | — (brief saknas i repot) | okänd — inte avläst utöver copyn | okänd |
| Brådska | — (brief saknas i repot) | ingen i copyn | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Ingen leverans: hooken föll för Meta — logga och släpp, aldrig ABO.

**Hypotes (gissning):** Gissning: Meta gav den 5 kr första veckan — öppningen vann aldrig auktionen mot syskonen i samma adset; utfallet säger inget om idén, bara att den inte fick leverans.

**Nästa annonser:**
- `SLÄPP` — INGEN_LEVERANS (under 300 kr, 0 köp): logga och släpp, aldrig ABO (Axels beslut 2026-09-20); idén får bara komma igen som en ny öppning på en levande vinnare, inte som samma annons.

### Lärdom L-120250341572220291 — Takoverdrag_PD_10_H1 (LOSER, etikett 2026-09-30)

| Fält | Värde |
|---|---|
| Batch | 3 |
| Utfall | LOSER |
| Fönster | 2026-09-23 – 2026-09-29 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 8 234 kr / 86 699 kr (10 %) |
| Köp | 11 |
| ROAS / CPA | 1,80 / 749 kr — kampanjens ROAS 2,18 |
| Konverteringsgrad | 2,0 % (11 köp / 549 LPV) |
| Hook rate / hold rate | 45 % / 8 % |
| Bedömbar | ja |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext rad 1 (live 2026-09-30): "Din husvagn är kanske inte 6,5 meter." · rubrik: "Nio storlekar, från 1 129 kr."
- Briefens hook (agent/utdata/takoverdrag-batch3/Takoverdrag_PD_10_H1.md): VO/caption 0–2 s "Din husvagn är kanske inte 6,5 meter. Den finns i nio storlekar, från 3 × 5,5 till 3 × 13,5 meter – från 1 129 kr." Videons tagning är inte granskad här.

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (briefen anger ingen) | husvagnsägare vars vagn inte är 6,5 m (ur copyns första rad) | okänd |
| Vinkel | PD — variabelbyte på PD_2_H1: enda ändringen är storleksraden | PD (pris/produktfakta): storlekar + "från 1 129 kr" i primärtext och rubrik | ja |
| Medvetandenivå | — (briefen anger ingen) | produktmedveten — copyn presenterar produkten och dess storlekar direkt | okänd |
| Mekanism | nio storlekar 3 × 5,5–3 × 13,5 m, en person spänner fast med rem (demo som PD_2_H1) | "En person får på plats – bara remmarna spänns fast i kanten" — briefens "rem och dragsko" är i live-copyn bara rem, vilket följer produktsidan | ja |
| Tro | "den passar nog inte min husvagn" (passar-invändningen, stängs i hooken) | "Din husvagn är kanske inte 6,5 meter" — passar-invändningen möts i första raden | ja |
| Positionering | — (briefen anger ingen) | "Från 1 129 kr" utan jämförpris i copyn | okänd |
| Brådska | ingen | ingen i copyn | ja |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** Gissning: storleksraden i hooken (nio storlekar, från 1 129 kr) släpper in fler husvagnsägare men fyller inte kassan på 8 234 kr — 11 köp, CPA 749 kr (mot start-CPA 466 kr i fatigue-testet, över den), hook rate 45 % men hold rate 8 % och 2,0 % konvertering, alltså tittas hooken men "från"-priset ger inget skäl att köpa nu; ROAS 1,80 ligger över break-even 1,63 men under kampanjens 2,18.

**Nästa annonser:**
- SLÄPP — LOSER (bedömbar): ROAS 1,80 mot break-even 1,63 ger vinstbidrag cirka +860 kr (8 234 × (1,80/1,63 − 1)), men 9,5 % av spenden på 2,18-kampanjen och CPA 749 kr mot 466 kr; ingen video-iteration nu — samma variabel (storleksraden) bärs redan av `Takoverdrag_PD_10_1` (KPI_WINNER, 17 köp) vars `Takoverdrag_PD_10_2` och `PD_10_3` är namngivna men obyggda, och källan är axel (inte research) så en ny video på samma rad vore ingen lärdom; storleksinvändningen (Storlek / passform, 4 % i invandningar.md) har ingen egen matrisrad men är besvarad av PD_10_H1, PD_10_1, BOF_7_1 och FD_3/FD_4.

### Lärdom L-120250341520820291 — Takoverdrag_OB_3_H1 (LOSER, etikett 2026-09-30)

| Fält | Värde |
|---|---|
| Batch | 4 |
| Utfall | LOSER |
| Fönster | 2026-09-23 – 2026-09-29 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 2 034 kr / 86 699 kr (2 %) |
| Köp | 2 |
| ROAS / CPA | 1,19 / 1 017 kr — kampanjens ROAS 2,18 |
| Konverteringsgrad | 1,1 % (2 köp / 180 LPV) |
| Hook rate / hold rate | 35 % / 10 % |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept:** invandning-vattentat · **Typ:** N · **Parent:** — · **Iteration:** 1 · **Källa:** voc
**Brief:** `products/takoverdraget-husvagn/batch-04/video-ads-briefs/Takoverdrag_OB_3_H1/brief.md`

**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext rad 1 (live 2026-09-30): "En fråga vi fick: "Är det vattentätt?"" · rubrik: "Vattnet rinner av taket, inte kvar."
- Briefens hook (batch-04/…/Takoverdrag_OB_3_H1/brief.md): bild/text 0–3 s "Är det vattentätt?" som Facebook-kommentarbubbla, ingen VO (freeze 3 s); VO 3–6 s "Inte "vattentät" – men vattnet rinner av." Videons tagning (hällningen) är inte granskad här.

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | agare-som-tvekar-pa-tyget | ägare som tvekar på tyget — copyn återger kundens egen fråga | ja |
| Vinkel | OB | OB (invändning): "En fråga vi fick" + ärligt nej | ja |
| Medvetandenivå | solution | solution — svaret på en fråga om en känd produkt | ja |
| Mekanism | silverbelagd-vav-vattnet-rinner-av | "vattnet rinner av den silverbelagda väven i stället för att samlas" | ja |
| Tro | det-maste-vara-vattentatt | "Är det vattentätt?" bemöts med "Ärligt svar: nej" | ja |
| Positionering | — (taggen saknas i briefen) | ärligt medgivande först, sedan pris 1 129 kr / jämförpris 1 469 kr (spara 340 kr / 23 %) | okänd |
| Brådska | ingen | ingen i copyn | ja |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** Gissning: det ärliga "nej" på vattentätt-frågan stoppar tummen dåligt — hook rate 35 % och hold rate 10 %, 2 köp på 2 034 kr, 7-dygns-CPA 1 017 kr mot start-CPA 466 kr (dubbelt så dyrt; ett av tre fatigue-testsvar som pekar mot mättnad, men två köp är för litet underlag för en dom).

**Nästa annonser:**
- SLÄPP — under grinden (2 034 kr, 2 köp, CPA 1 017 kr mot 466 kr): en observation, ingen dom; matrisraden Vattentätt × video är besvarad live men avgör inget, och raden har redan `Takoverdrag_OB_10_1` (statisk, live) samt `OB_11_H1` och `OB_14_H1` (briefade) — ingen ny OB_3-variant förrän de fått etikett; fatigue-testet läses när CS_2_H2 och CS_2_H3 också fått dag-7-etikett.

### Lärdom L-120250341502740291 — Takoverdrag_GT_11_H1 (LOSER, etikett 2026-09-30)

| Fält | Värde |
|---|---|
| Batch | 4 |
| Utfall | LOSER |
| Fönster | 2026-09-23 – 2026-09-29 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 875 kr / 86 699 kr (1 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 2,18 |
| Konverteringsgrad | 0,0 % (0 köp / 37 LPV) |
| Hook rate / hold rate | 49 % / 11 % |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept:** gava-mottagaren · **Typ:** I · **Parent:** Takoverdrag_GT_2_H1 · **Iteration:** 1 · **Källa:** axel
**Brief:** `products/takoverdraget-husvagn/batch-04/video-ads-briefs/Takoverdrag_GT_11_H1/brief.md`

**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext rad 1 (live 2026-09-30): "Han pratar om husvagnen som om den vore ett husdjur." · rubrik: "Han glömmer strumpor. Inte det här."
- Briefens hook (batch-04/…/Takoverdrag_GT_11_H1/brief.md): VO 0–4 s "Han pratar om husvagnen som om den vore ett husdjur." (första bildruta: ägaren klappar vagnen). Videons tagning är inte granskad här.

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | partner-eller-barn-som-koper-present | den som köper present till en husvagnsägare — mottagaren beskrivs ("Han pratar om husvagnen …") | ja |
| Vinkel | GT | GT (present): "Klar till fars dag, 8 november" | ja |
| Medvetandenivå | solution | solution — produkten nämns med storlekar och pris | ja |
| Mekanism | bara-taket-en-person | "Taket ser han aldrig – ändå är det ytan som kostar mest när något går fel"; "en person" står bara i videons manus, inte i copyn | okänd |
| Tro | han-glommer-vanliga-presenter | "Strumpor och en grillspade glöms bort i lådan på en vecka" — vanliga presenter glöms | ja |
| Positionering | — (taggen saknas i briefen) | "Nio storlekar, från 1 129 kr" utan jämförpris | okänd |
| Brådska | sasong | säsong: "Klar till fars dag, 8 november" | ja |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** Gissning: fars dag-presenten är en för tidig och smal öppning — 875 kr och 0 köp, 7-dygns-CPA över 875 kr (ingen CPA; redan 875 kr spenderade utan köp är mer än start-CPA 466 kr), hook rate 49 % men bara 37 sidvisningar, så tittarna stannar men klickar inte; enda avvikelsen mot föräldern GT_2_H1 är fars dag-raden (parent-CPA 240 kr enligt briefen).

**Nästa annonser:**
- SLÄPP — LOSER under grinden: en observation, ingen dom (875 kr, 0 köp, 37 LPV); fars dag-tillfället bärs i stället av omgång 4 (`Takoverdrag_FD_3_H1`–`FD_4_4`, live 2026-09-30, förälder GT_2_H1) — läs dem innan något GT-iteras, och läs fatigue-testet först när CS_2_H2 och CS_2_H3 också har etikett.

### Lärdom L-120250341545560291 — Takoverdrag_CO_5_H1 (KPI_WINNER, etikett 2026-09-30)

| Fält | Värde |
|---|---|
| Batch | 3 |
| Utfall | KPI_WINNER |
| Fönster | 2026-09-23 – 2026-09-29 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 482 kr / 86 699 kr (1 %) |
| Köp | 2 |
| ROAS / CPA | 5,30 / 241 kr — kampanjens ROAS 2,18 |
| Konverteringsgrad | 13,3 % (2 köp / 15 LPV) |
| Hook rate / hold rate | 33 % / 8 % |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext rad 1 (live 2026-09-30): "Det har ju gått bra hittills." · rubrik: "1 129 kr nu. Inget att gissa på sen."
- Briefens hook (agent/utdata/takoverdrag-batch3/Takoverdrag_CO_5_H1.md): VO/caption 0–4 s "Det har ju gått bra hittills." (ägaren vid det bara taket, den ihopvikta duken i händerna). Videons tagning är inte granskad här.

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | husvagnsägare som aldrig täckt taket (självprat: "det har gått bra hittills") | ägaren som skjuter upp det — "Det har ju gått bra hittills." öppnar | ja |
| Vinkel | CO — fienden är passivitet, inte ett annat märke | CO (jämförelse mot att göra ingenting): "1 129 kr nu, eller ett tak du upptäcker är trasigt i vår" | ja |
| Medvetandenivå | — (briefen anger ingen) | okänd — inte avläst utöver copyn | okänd |
| Mekanism | "taket är det du aldrig ser – och det som kostar mest att laga"; överdraget läggs på | "Taket är ytan du aldrig ser efter – förrän något är fel." | ja |
| Tro | "det har gått bra hittills" | "Det har ju gått bra hittills" är hookens egen tro | ja |
| Positionering | — (briefen anger ingen) | pris 1 129 kr, ord. 1 469 kr, spara 340 kr / 23 % | okänd |
| Brådska | ingen (ingen påhittad brådska) | ingen i copyn | ja |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** KPI winner: läs hook rate, sedan hold rate, sedan förbi hooken. Den säljer men får inte spend — får den ingen spend på sju dagar är den en förlorare.

**Hypotes (gissning):** Gissning: passivitets-hooken ("Det har ju gått bra hittills.") ger en rad köp på få besökare — 2 köp, CPA 241 kr, 13,3 % konvertering på bara 15 sidvisningar och 482 kr (1 % av kampanjen) — men så litet underlag är brus, inte ett bevis för att vinkeln bär.

**Nästa annonser:**
- SLÄPP tills vidare — under grinden (482 kr, 2 köp): läs om dag 14 (--uppgradering); ingen iteration namnges på 15 sidvisningar, och CO-vinkeln har inget namngivet steg pending.

### Lärdom L-120250341609420291 — Takoverdrag_CS_9_H1 (LOSER, etikett 2026-09-30)

| Fält | Värde |
|---|---|
| Batch | 2 |
| Utfall | LOSER |
| Fönster | 2026-09-23 – 2026-09-29 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 452 kr / 86 699 kr (1 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 2,18 |
| Konverteringsgrad | 0,0 % (0 köp / 27 LPV) |
| Hook rate / hold rate | 25 % / 9 % |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext rad 1 (live 2026-09-30): "340 kr rabatt på 19,5 kvadratmeter skydd – hela takytan, 6,5 × 3 meter." · rubrik: "19,5 m² skydd för 1 129 kr."
- VO/captions: ej läst (ingen brief i repot, ingen ram dragen).

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | husvagnsägare med 6,5 × 3 m-vagn — copyn nämner måttet | okänd |
| Vinkel | CS — prisankaret omräknat till kronor och yta (340 kr, 19,5 m²) (batch-log batch #2, briefraden) | CS (prisankare): rabatten i kronor mot ytan, 340 kr på 19,5 m² | ja |
| Medvetandenivå | — (brief saknas i repot) | produktmedveten — pris och yta direkt | okänd |
| Mekanism | — (brief saknas i repot) | "210D-väv … En person spänner fast den med rem i kanten och den ligger stilla i blåst" | okänd |
| Tro | — (brief saknas i repot) | recensionsrad: "Betyg 5,0 av 5 på 10 recensioner" | okänd |
| Positionering | — (brief saknas i repot) | "1 129 kr för 19,5 m² skydd" — kronor per yta som ram | okänd |
| Brådska | — (brief saknas i repot) | ingen i copyn | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** Gissning: kronor-per-yta-ramen är en svagare öppning än prisankaret mot jämförpriset — hook rate 25 % (kampanjens lägsta bland dagens annonser) och 452 kr utan köp; det är ett spenderat-utan-köp-utfall under grinden och säger inget säkert om idén.

**Nästa annonser:**
- SLÄPP — LOSER under grinden: en observation, ingen dom (452 kr, 0 köp); prisankarfamiljen bärs redan av `Takoverdrag_PD_10_1` (KPI_WINNER, 17 köp, PD_10_2/PD_10_3 namngivna) och statiska `CS_13_1` (samma ram, 51 kr) gav ingen signal — ingen ny CS-yta-annons.

### Lärdom L-120250341482970291 — Takoverdrag_OB_4_H1 (LOSER, etikett 2026-09-30)

| Fält | Värde |
|---|---|
| Batch | 4 |
| Utfall | LOSER |
| Fönster | 2026-09-23 – 2026-09-29 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 446 kr / 86 699 kr (1 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 2,18 |
| Konverteringsgrad | 0,0 % (0 köp / 31 LPV) |
| Hook rate / hold rate | 30 % / 10 % |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept:** invandning-tathet · **Typ:** N · **Parent:** — · **Iteration:** 1 · **Källa:** voc
**Brief:** `products/takoverdraget-husvagn/batch-04/video-ads-briefs/Takoverdrag_OB_4_H1/brief.md`

**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext rad 1 (live 2026-09-30): "Du har rätt – ett helöverdrag blir tätt runt hela vagnen." · rubrik: "Ja, det blir tätt. Fast bara taket."
- Briefens hook (batch-04/…/Takoverdrag_OB_4_H1/brief.md): VO 0–4 s "Nu blir det väl tätt, tänker du." (delad bild: tejpad vagn mot taket med öppna sidor, ingen musik). Videons tagning är inte granskad här.

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | agare-som-tvekar-pa-tyget | ägare som tvekar för att ett överdrag kapslar in fukt — copyn ger honom rätt först | ja |
| Vinkel | OB | OB (invändning), hook-typ medhåll: "Du har rätt – ett helöverdrag blir tätt" | ja |
| Medvetandenivå | solution | solution — svaret på en känd invändning om produkten | ja |
| Mekanism | bara-taket-sidorna-oppna | "Det här täcker bara taket, 6,5 × 3 m. Sidorna är öppna, precis som innan." | ja |
| Tro | helovertrag-kapslar-in-fukt | "helöverdrag kapslar in fukt" — medges och vänds i första raden | ja |
| Positionering | — (taggen saknas i briefen) | medhåll först, sedan pris 1 129 kr (ord. 1 469 kr, spara 340 kr / 23 %) | okänd |
| Brådska | sasong | ingen säsongsrad i copyn och ingen i briefens manus, fast taggen säger säsong | nej |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** Gissning: medhåll-öppningen på fukt-invändningen (matrisens största, 32 %) fick bara 446 kr av kampanjens 86 699 kr — hook rate 30 %, 0 köp, alltså ingen 7-dygns-CPA mot start-CPA 466 kr (446 kr spenderade utan köp ligger under 466 kr, så testet kan varken fällas eller lyftas på den); Meta gav den för lite för en dom.

**Nästa annonser:**
- SLÄPP — LOSER under grinden: en observation, ingen dom (446 kr, 0 köp); fukt-raden i invandningar.md (32 % av invändningarna) har redan `Takoverdrag_OB_5_1` (statisk, live) och `OB_6_H1`/`OB_7_H1` (briefade) — ingen ny OB_4-variant förrän de fått etikett, och fatigue-testet läses först när CS_2_H2 och CS_2_H3 också har dag-7-etikett.

### Lärdom L-120250356982310291 — Takoverdrag_OB_5_1 (KPI_WINNER, etikett 2026-10-01)

| Fält | Värde |
|---|---|
| Batch | 4 |
| Utfall | KPI_WINNER |
| Fönster | 2026-09-24 – 2026-09-30 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 2 936 kr / 77 477 kr (4 %) |
| Köp | 7 |
| ROAS / CPA | 2,96 / 419 kr — kampanjens ROAS 2,37 |
| Konverteringsgrad | 6,9 % (7 köp / 102 LPV) |
| Hook rate / hold rate | okänd / okänd |
| Bedömbar | ja |

**Koncept:** invandning-fukt-statisk · **Typ:** S · **Parent:** Takoverdrag_OB_4_H1 · **Iteration:** 1 · **Källa:** voc
**Brief:** `products/takoverdraget-husvagn/batch-05/image-ads-briefs/Takoverdrag_OB_5_1/brief.md`

**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Rubrik (live 2026-10-01): "Ja, det blir tätt. Fast bara taket." (= briefens H1 ordagrant) · primärtext rad 1: "Du har rätt: ett helöverdrag runt hela vagnen blir tätt runt om." · beskrivning/underrad enligt briefen: "Det här täcker bara taket. Sidorna är öppna."
- Bildens text: ej avläst (bilden inte öppnad i den här ronden; briefen: tak-van.jpg från sidan, rubrik överst, underrad, prisband 1 129 kr (ord. 1 469 kr)) · ingen VO (bild) · hook rate okänd (statisk)

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | agare-som-tvekar-pa-tyget | ägaren som tvekar för att ett överdrag kapslar in fukt — copyn ger honom rätt i första raden | ja |
| Vinkel | OB | OB (invändning), hook-typ medhåll: "Du har rätt: ett helöverdrag … blir tätt runt om" | ja |
| Medvetandenivå | solution | solution — svaret på en känd invändning mot produkten | ja |
| Mekanism | bara-taket-sidorna-oppna | "Det här täcker bara taket, 6,5 × 3 m – sidorna är öppna, precis som innan." | ja |
| Tro | helovertrag-kapslar-in-fukt | "helöverdrag kapslar in fukt" medges och vänds i rad 1 | ja |
| Positionering | — (taggen saknas i briefen) | medhåll först, sedan "regnet rinner av den silverbelagda 210D-oxfordväven i stället för att bli stående" + pris 1 129 kr (ord. 1 469 kr, spara 340 kr / 23 %) | okänd |
| Brådska | sasong | ingen säsongsrad i copyn (inte heller i briefens COPY CARD) fast taggen säger sasong | nej |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** KPI winner: läs hook rate, sedan hold rate, sedan förbi hooken. Den säljer men får inte spend — får den ingen spend på sju dagar är den en förlorare.

**Hypotes (gissning):** Gissning: medhållet på fukt-invändningen (kontots största, 37 % av kommentarerna) konverterar den som klickar — 6,9 % (7 köp / 102 LPV) är fönstrets högsta konverteringsgrad, CPA 419 kr mot break-even-CPA 715 kr ger vinstbidrag (715 − 419) × 7 = 2 072 kr och ROAS 2,96 mot kampanjens 2,37 — men en stillbild av överdraget från sidan utan konflikt i bilden vinner inte auktionen bredvid videorna (4 % av spenden), så det som saknas är öppningen, inte argumentet; KPI winner ⇒ tre nya hookar, allt annat lika.

**Nästa annonser:**
- `Takoverdrag_OB_5_2` — typ I, parent Takoverdrag_OB_5_1, iteration 1 (KPI winner ⇒ ny hook, allt annat lika): samma bild (tak-van.jpg), samma underrad och prisband, rubriken byts till briefens H2 "Nu blir det väl tätt, tänker du." Isolerar: hookraden. Butiksneutral, break-even-CPA 715 kr i domen, "vattnet rinner av" aldrig "vattentät".
- `Takoverdrag_OB_5_3` — typ I, parent Takoverdrag_OB_5_1, iteration 2: rubriken byts till briefens H3 "Tätt? Ja – om det var helöverdrag." Resten oförändrat. Isolerar: hookraden.
- `Takoverdrag_OB_5_4` — typ I, parent Takoverdrag_OB_5_1, iteration 3 (kalla=voc, invandning=fukt): rubriken är kundens egen invändning ur kommentarsklustret 2026-09-28 (7 kommentarer, "Och under ligger det kondens hela vintern?" i andemening — copyn skrivs av sonnet mot copy-reglerna), underraden medhållet. Isolerar: hookraden. Aldrig ett löfte om torrt tak (leads.md: ingen sådan annons förrän distansprodukten finns).

### Lärdom L-120250357009170291 — Takoverdrag_UG_2_H1 (LOSER, etikett 2026-10-01)

| Fält | Värde |
|---|---|
| Batch | 2 |
| Utfall | LOSER |
| Fönster | 2026-09-24 – 2026-09-30 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 128 kr / 77 477 kr (0 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 2,37 |
| Konverteringsgrad | okänd — backfillad före 2026-09-21 (inga klick i fönstret hämtade) |
| Hook rate / hold rate | 20 % / 6 % |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext rad 1 (live 2026-10-01): "Bara taket. Inte hela vagnen." · rubrik: "Bara taket. Inte hela vagnen." · rad 2: "6,5 × 3 m, rakt över taket – helt själv, ingen hjälp." · rad 3: "Rem och dragsko i kanten, ryms i påsen efteråt." (⚠ "dragsko" och påsen står inte på sidan — dna.md 2026-09-22)
- VO: okänd (videon inte transkriberad; batch-log batch #2: "Ägaren i jag-form, en tagning", omkörning av UG_1_H1 som fick 19 kr)

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | ägaren som lägger på överdraget själv ("helt själv, ingen hjälp") | okänd |
| Vinkel | — (brief saknas i repot) | UG (UGC/ägare i jag-form): bara taket → ensam → rem och påse → pris 1 129 kr (ord. 1 469 kr) | okänd |
| Medvetandenivå | — (brief saknas i repot) | solution — "bara taket, inte hela vagnen" som svar på helöverdragets tyngd | okänd |
| Mekanism | — (brief saknas i repot) | "rakt över taket" + "rem och dragsko i kanten" — dragskon finns inte på sidan | okänd |
| Tro | — (brief saknas i repot) | "tungt att få på plats ensam" (sidans rad om helöverdraget) vänds med "helt själv" | okänd |
| Positionering | — (brief saknas i repot) | bara taket mot hela vagnen, sedan pris | okänd |
| Brådska | — (brief saknas i repot) | ingen | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** Gissning: 128 kr, hook 20 % / hold 6 % (fönstrets lägsta) och 0 köp — andra omkörningen av UGC-tagningen (UG_1_H1 fick 19 kr) svalt igen, så det är öppningen i jag-form som inte stoppar scrollen i den här kampanjen, inte "bara taket"-argumentet som lever i OB_5_1; copyn bär dessutom "dragsko" som sidan inte har.

**Nästa annonser:**
- `SLÄPP` — LOSER under grinden (128 kr, 0 köp): en observation, ingen dom. Två UG-försök på samma tagning (UG_1_H1 19 kr, UG_2_H1 128 kr) har båda svultit; ingen tredje omkörning, och ny copy får inte ärva "dragsko" eller påsen (dna.md: står inte på sidan). "Bara taket"-argumentet bärs av OB_5_1 och dess iterationer.

### Lärdom L-120250371676420291 — Takoverdrag_SP_4_H3 (LOSER, etikett 2026-10-02)

| Fält | Värde |
|---|---|
| Batch | 4 |
| Utfall | LOSER |
| Fönster | 2026-09-25 – 2026-10-01 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 573 kr / 68 950 kr (1 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 2,31 |
| Konverteringsgrad | 0,0 % (0 köp / 30 LPV) |
| Hook rate / hold rate | 43 % / 9 % |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept:** sp-en-person-racker · **Typ:** I · **Parent:** Takoverdrag_SP_4_H1 · **Iteration:** 2 · **Källa:** egen-data
**Brief:** `products/takoverdraget-husvagn/batch-05/video-ads-briefs/Takoverdrag_SP_4_H3/brief.md`

**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext rad 1 (live 2026-10-02, Graph v21.0): "Vid en taklucka utan skydd blir vattnet lätt stående, och tätmassan tar stryk. Ett helöverdrag är tungt att få på plats ensam — det här täcker bara taket, och en person klarar det själv. Vattnet står aldrig vid takluckorna, och 210D-väven håller hela vintersäsongen ute. Remmarna sitter på alla fyra sidor och hakas fast i en krok i nederkant. 1 129 kr i stället för 1 469 kr." · rubrik: "En person räcker. 210D-väv."
- VO/första frame: okänd — videon är inte transkriberad och thumbnailen är inte läst i den här körningen (hook rate 43 %, hold rate 9 % ur etikettraden)

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | husvagnsagare-infor-vintern | den som litar på andras omdöme (citatet är en importrad — får inte ärvas) | okänd |
| Vinkel | SP | SP (socialt bevis, importcitat) enligt namnkoden och copyn | okänd |
| Medvetandenivå | solution | lösnings-medveten (andras omdöme före produkten) | okänd |
| Mekanism | bara-taket-en-person | ur copyn: ingen mekanism utskriven | okänd |
| Tro | helovertrag-kraver-tva | andras omdöme (femstjärnigt importcitat) | okänd |
| Positionering | — (taggen saknas i briefen) | andras ord före produkten | okänd |
| Brådska | sasong | ingen i copyn | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** Gissning: 573 kr och 0 köp under grinden är CBO-fördelning bredvid vinnaren Takoverdrag_SP_4_H1 (breakthrough — H2–H4 är dess tre vidarebyggen, alla svalt i CBO:n) (hook rate okänd), inte en dom; hook rate 43 % / hold 9 % säger inget avgörande på den här volymen.

**Nästa annonser:**
- `SLÄPP` — LOSER under grinden (573 kr, 0 köp): en observation, ingen dom; nästa försök i vinkeln byggs på Takoverdrag_SP_4_H1 (breakthrough — H2–H4 är dess tre vidarebyggen, alla svalt i CBO:n), inte här.

### Lärdom L-120250371639930291 — Takoverdrag_SP_4_H2 (LOSER, etikett 2026-10-02)

| Fält | Värde |
|---|---|
| Batch | 4 |
| Utfall | LOSER |
| Fönster | 2026-09-25 – 2026-10-01 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 424 kr / 68 950 kr (1 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 2,31 |
| Konverteringsgrad | 0,0 % (0 köp / 23 LPV) |
| Hook rate / hold rate | 26 % / 8 % |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept:** sp-en-person-racker · **Typ:** I · **Parent:** Takoverdrag_SP_4_H1 · **Iteration:** 1 · **Källa:** egen-data
**Brief:** `products/takoverdraget-husvagn/batch-05/video-ads-briefs/Takoverdrag_SP_4_H2/brief.md`

**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext rad 1 (live 2026-10-02, Graph v21.0): "En hand hakar fast remmen i kroken vid takkanten – en person räcker för att få det här på plats. Det här täcker bara taket, inte hela vagnen. Vattnet står aldrig vid takluckorna, och 210D-väven håller hela vintersäsongen ute. Remmarna sitter på alla fyra sidor och hakas fast i en krok i nederkant. 1 129 kr i stället för 1 469 kr." · rubrik: "En person räcker. 210D-väv."
- VO/första frame: okänd — videon är inte transkriberad och thumbnailen är inte läst i den här körningen (hook rate 26 %, hold rate 8 % ur etikettraden)

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | husvagnsagare-infor-vintern | den som litar på andras omdöme (citatet är en importrad — får inte ärvas) | okänd |
| Vinkel | SP | SP (socialt bevis, importcitat) enligt namnkoden och copyn | okänd |
| Medvetandenivå | solution | lösnings-medveten (andras omdöme före produkten) | okänd |
| Mekanism | bara-taket-en-person | ur copyn: ingen mekanism utskriven | okänd |
| Tro | helovertrag-kraver-tva | andras omdöme (femstjärnigt importcitat) | okänd |
| Positionering | — (taggen saknas i briefen) | andras ord före produkten | okänd |
| Brådska | sasong | ingen i copyn | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** Gissning: 424 kr och 0 köp under grinden är CBO-fördelning bredvid vinnaren Takoverdrag_SP_4_H1 (breakthrough — H2–H4 är dess tre vidarebyggen, alla svalt i CBO:n) (hook rate okänd), inte en dom; hook rate 26 % / hold 8 % säger inget avgörande på den här volymen.

**Nästa annonser:**
- `SLÄPP` — LOSER under grinden (424 kr, 0 köp): en observation, ingen dom; nästa försök i vinkeln byggs på Takoverdrag_SP_4_H1 (breakthrough — H2–H4 är dess tre vidarebyggen, alla svalt i CBO:n), inte här.

### Lärdom L-120250371696280291 — Takoverdrag_SP_4_H4 (LOSER, etikett 2026-10-02)

| Fält | Värde |
|---|---|
| Batch | 4 |
| Utfall | LOSER |
| Fönster | 2026-09-25 – 2026-10-01 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 183 kr / 68 950 kr (0 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 2,31 |
| Konverteringsgrad | 0,0 % (0 köp / 17 LPV) |
| Hook rate / hold rate | 22 % / 7 % |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept:** sp-en-person-racker · **Typ:** I · **Parent:** Takoverdrag_SP_4_H1 · **Iteration:** 3 · **Källa:** egen-data
**Brief:** `products/takoverdraget-husvagn/batch-05/video-ads-briefs/Takoverdrag_SP_4_H4/brief.md`

**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext rad 1 (live 2026-10-02, Graph v21.0): "Det här täcker bara taket, inte hela vagnen — en person klarar det på egen hand. Vattnet står aldrig vid takluckorna, och 210D-väven håller hela vintersäsongen ute. Remmarna sitter på alla fyra sidor och hakas fast i en krok i nederkant. 1 129 kr i stället för 1 469 kr." · rubrik: "En person räcker. 210D-väv."
- VO/första frame: okänd — videon är inte transkriberad och thumbnailen är inte läst i den här körningen (hook rate 22 %, hold rate 7 % ur etikettraden)

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | husvagnsagare-infor-vintern | den som litar på andras omdöme (citatet är en importrad — får inte ärvas) | okänd |
| Vinkel | SP | SP (socialt bevis, importcitat) enligt namnkoden och copyn | okänd |
| Medvetandenivå | solution | lösnings-medveten (andras omdöme före produkten) | okänd |
| Mekanism | bara-taket-en-person | ur copyn: ingen mekanism utskriven | okänd |
| Tro | helovertrag-kraver-tva | andras omdöme (femstjärnigt importcitat) | okänd |
| Positionering | — (taggen saknas i briefen) | andras ord före produkten | okänd |
| Brådska | sasong | ingen i copyn | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** Gissning: 183 kr och 0 köp under grinden är CBO-fördelning bredvid vinnaren Takoverdrag_SP_4_H1 (breakthrough — H2–H4 är dess tre vidarebyggen, alla svalt i CBO:n) (hook rate okänd), inte en dom; hook rate 22 % / hold 7 % säger inget avgörande på den här volymen.

**Nästa annonser:**
- `SLÄPP` — LOSER under grinden (183 kr, 0 köp): en observation, ingen dom; nästa försök i vinkeln byggs på Takoverdrag_SP_4_H1 (breakthrough — H2–H4 är dess tre vidarebyggen, alla svalt i CBO:n), inte här.

### Lärdom L-120250371708270291 — Takoverdrag_CS_12_H1 (LOSER, etikett 2026-10-02)

| Fält | Värde |
|---|---|
| Batch | 3 |
| Utfall | LOSER |
| Fönster | 2026-09-25 – 2026-10-01 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 151 kr / 68 950 kr (0 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 2,31 |
| Konverteringsgrad | 0,0 % (0 köp / 4 LPV) |
| Hook rate / hold rate | 32 % / 8 % |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext rad 1 (live 2026-10-02, Graph v21.0): "Jag betalade 1 129 kronor för det här. Taket är den dyraste ytan på hela vagnen. Tål en hel vintersäsong ute – 210D-väv, inte tunn presenning som spricker i frost. Sitter kvar när det blåser – remmarna sitter på alla fyra sidor och hakas fast i en krok i nederkant. Jämförpriset är 1 469 kronor. Jag betalade 1 129. Skydda taket – 1 129 kr." · rubrik: "Skydda taket – 1 129 kr."
- VO/första frame: okänd — videon är inte transkriberad och thumbnailen är inte läst i den här körningen (hook rate 32 %, hold rate 8 % ur etikettraden)

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | prisjägaren (rea-brådskan är påhittad och får inte ärvas) | okänd |
| Vinkel | — (brief saknas i repot) | CS (pris/rea) enligt namnkoden och copyn | okänd |
| Medvetandenivå | — (brief saknas i repot) | produkt-medveten (priset först) | okänd |
| Mekanism | — (brief saknas i repot) | ur copyn: ingen mekanism utskriven | okänd |
| Tro | — (brief saknas i repot) | att rabatten är tillfällig ("bara idag" — påhittad) | okänd |
| Positionering | — (brief saknas i repot) | pris (rabatt mot "ordinarie") | okänd |
| Brådska | — (brief saknas i repot) | påhittad brådska i copyn ("bara idag", "när den är slut är den slut") — regelbrott, ärvs aldrig | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** Gissning: 151 kr och 0 köp under grinden är CBO-fördelning bredvid vinnaren Takoverdrag_SP_4_H1 (breakthrough — H2–H4 är dess tre vidarebyggen, alla svalt i CBO:n) (hook rate okänd), inte en dom; hook rate 32 % / hold 8 % säger inget avgörande på den här volymen; copyn bär dessutom påhittad brådska som aldrig får ärvas.

**Nästa annonser:**
- `SLÄPP` — LOSER under grinden (151 kr, 0 köp): en observation, ingen dom; nästa försök i vinkeln byggs på Takoverdrag_SP_4_H1 (breakthrough — H2–H4 är dess tre vidarebyggen, alla svalt i CBO:n), inte här.

