# Creative DNA — Golf Adventskalendern (24 golftillbehör)

Skapad 2026-09-26 av /rond-auto (körningen 05:54 UTC) när behovet
`forsta_batch` stod i planen: produkten klarade testet (2 160 kr, 32,9 % vinst)
på två dygn. **Första riktiga batchen är INTE skriven** — se batch-log.md för
varför. Det här är FAS 0–6 ur `/forsta-batch`, så att briefsteget kan börja
direkt när lärdomarna finns (dag 7 = 2026-10-01).

Kampanj `120250349257210291` (MagiBorsten SE), launch 2026-09-24 02:31,
1 000 → 1 200 kr/dag (SKALA 2026-09-26 05:54, ROAS 3,28 = 126 % av target,
+20 %). Break-even **1,58** ur prissheetet (kostnad 17,19 USD + 2,9 EUR, pris
549 kr; kampanjnamnet säger 1.70 — sheetet vinner). Target-ROAS 2,61 (25 %
vinst). Produkten kom via Product test center ("K Golfkalender", Ansvarig
Josh, Drive-mapp `1P8kp5K1MJZ_zwa6O5zdHRS9rQgD8L1-T`). Ingen Notion-hub ännu.

## FAS 0 — vad som faktiskt lästes (2026-09-26, 06:20 UTC)

| Källa | Nådd | Not |
|---|---|---|
| Meta, annonsnivå (Graph API v21.0, `date_preset=maximum`, 7d_click) | ✅ | 16 annonser: 15 ACTIVE, 1 PAUSED (`CS_2_1`, 0 kr — ingen rad i `agent/budgetlogg.jsonl`, ronden pausade den inte; gissning: pausad vid launch). Live copy (primärtext/rubrik) läst ur `creative.body/title` för alla 16 |
| Kampanjnivå per dygn | ✅ | `time_increment=1`, se FAS 1 |
| Hook rate | ❌ | `video_play_actions` är starter, inte 3-sekundersvisningar — samma lucka som ATV. Thruplay och p25–p100 gick att läsa och står i FAS 3 som hold-diagnos |
| Videornas manus / VO | ❌ | Ingen ffmpeg i containern, videorna inte transkriberade. VO = okänd. Drive bär `K Golfkalender_PD_1_H1/H2/H3`, `CS_1_H1–H3`, `G_1_H1–H3`, `SP_1_H1–H3` (mp4) |
| Thumbnail på top spendern | ✅ | `Golfkalender_PD_1` (video-id `3628961317255943`, 22,3 s): tät närbild på den gröna kalenderkartongen med numrerade luckor (17, 21, 10, 03, 11, 18, 08, 12, 04), järneksblad i tryck, caption-ruta "pitchgaffel," — videon räknar upp innehållet som captions över luckorna |
| Statiska bilder | ⚠️ | `PD_2_1` (jpg), `CS_2_1`, `G_2_1`, `SP_2_1` (png) i Drive — inte visuellt granskade i den här körningen |
| Landningssida (`/products/golf-adventskalender-24-golftillbehor.json`) | ✅ | 549 kr / jämförpris 719 kr, en variant, SKU `ADVENT-GOLF`, 2 bilder. Sidans rader står i "Sidans egna rader" nedan |
| Recensioner | ⚠️ | Sidan visar **8 recensioner, snitt 5,00** (Judge.me-badge i HTML). Drive-arket `Golfkalender_REVIEW` bär exakt 8 rader, alla 5 stjärnor, `review_date` 2026-09-08 → 09-15, tomma e-postfält. Judge.me-widgeten (en lyckad läsning 06:0x UTC, sedan 0 byte) visade samma titlar och texter ordagrant (Superkul/Karin Eriksson, Rekommenderas/Johan Svensson, Fin present/Maria Larsson, Rolig kalender/Erik Nilsson …) med `created_at` **2026-09-24T00:23 UTC** — 8 minuter före launch — `verified_buyer: false`, badge `review_collected_from_store_visitor`. **De är launchflödets importrader, inte verifierade kundomdömen — får aldrig citeras i en annons.** Inga review-bilder förrän riktiga recensioner finns |
| Kommentarer på annonserna | ✅ | 1 kommentar på `PD_1` (30 d): en vän-tagg ("<namn> 😀❤️"). Inget kluster ≥ 3 — ingen INVAND-variant (`tools/annonskommentarer.mjs` från `main`, körd 2026-09-26; verktyget saknas på den här grenen) |
| Annonsidéer (Axels databas `b950b849-…`) | ✅ | 6 rader, alla `Byggd`, 0 `Ny` 2026-09-26 — inget från Axel om produkten |
| Product test center-raden i Notion | ✅ | `3dd270ab-908c-812d-9e46-cd7f15662b13`: Typ Video – Pending Approval, Status Ads review, Ansvarig Josh, "Locked numbers" = sidans innehållsrad, "Price 549 kr (compare at 719 kr) · cost 162.79 kr · margin 386 kr", Axel 2026-09-16: *"den som jag tror kommer printa mest är den här golfkalendern."* Bildnot: produktfotona är tagna rakt av från adventlane.se (riktiga foton, ingen AI; Amazon-ikoner, 1688-vattenstämpel och kinesisk text bortklippta, tryckt text på kartongen kvar). Referenser: 2 YouTube-länkar + 5 TikTok-länkar (@golf.calendar ×4, @freshfindsandshine) — inte tittade |
| Shopify-försäljning | ❌ | inte korsvaliderad i den här körningen |

### Sidans egna rader (de enda påståenden som får användas)

- "Golfbagen tömmer sig i det tysta" — peggar knäcks, bollar försvinner i
  ruffen eller vattnet, borsten faller ur sidofacket, och ingen skriver upp
  det på en önskelista.
- Julklappen blir annars "en klubba han redan har, eller ett presentkort som
  hamnar i en låda till våren".
- "24 luckor, redan fyllda med det han ändå tar slut på" — golftillbehör
  bakom varje lucka **i stället för choklad**.
- Innehåll (plast, metall, trä): golfbollar, peggar i plast och trä,
  bollmarkeringar/bollmarkeringspennor, linjemarkörer, kepsklämma med
  bollmarkör, greenlagare med spegel, T-nyckel för skonaglar med spikes,
  klubbrengöringsborste, spårverktyg, nyckelringar, golfhandduk med clips.
  **Exakt vad som ligger bakom varje enskild lucka anger inte tillverkaren.**
- "24 dagars nedräkning till jul — inte en påse godis uppäten på tio minuter."
- "Ett paket att slå in, inte 24 separata småpresenter."
- Färdigfylld, inget att fylla i själv. Kartong 30 × 28 × 6 cm, ca 500 g,
  "går att skicka direkt som present".
- För vuxna och tonåringar som spelar golf. Små lösa delar; **tillverkaren
  anger varken CE-märkning eller åldersgräns — beskrivs aldrig som barnsäker.**
- "14 dagars ångerrätt enligt lag, räknat från den dag du får varan."

**Tillåtna tal: 549, 719, 170 (spara), 24 % (170/719 = 23,6 % → sidan skriver
inget procenttal; live-copyn säger −24 %), 24 (luckor), 30 × 28 × 6, 500 g,
14 (dagar ångerrätt).** Inga andra siffror.

**Får INTE förekomma:** recensioner (de 8 är importrader), "bara idag"/"innan
priset går upp" (påhittad brådska — CS-copyn live bär det), "30 dagars öppet
köp", "fri frakt" (står inte på sidan; "Fri frakt inom Sverige", Klarna och
ångerrätten är butikens villkor, inte produktens löfte), "24 olika prylar"
eller en lista lucka för lucka (sidan säger uttryckligen att tillverkaren inte
anger det), barn/"barnsäker", CE.

## FAS 1 — kampanjöversikt (2026-09-24 → 06:20 UTC 2026-09-26)

| | Värde |
|---|---|
| Spend sedan start | 2 182,39 kr |
| Köp (7d_click) | 10 |
| ROAS (Σ spend × purchase_roas ÷ spend) | 3,57 |
| CPA | 218 kr |
| AOV (spend × ROAS ÷ köp) | 779 kr — högre än priset 549 kr ⇒ en del ordrar bär mer än en kalender eller mer i korgen. Räknat ur `spend × purchase_roas`, aldrig ur `omni_purchase_values` |
| Break-even-CPA | 779 ÷ 1,58 = **493 kr** |
| Target-ROAS (25 % vinst) | 2,61 |
| Dygn | 24/9: 1 044,63 kr, 4 köp, ROAS 3,21, CPA 261 kr · 25/9: 1 046,29 kr, 5 köp, ROAS 3,36, CPA 209 kr · 26/9 (t.o.m. 06:20 UTC): 91,47 kr, 1 köp. CPA 261 → 209 = sjunkande, för tidigt att kalla trend |

Funneln på `PD_1` (enda annonsen med volym): 10 165 visningar → 325 länkklick
(3,2 %) → 265 LPV (82 % av klicken) → 14 ATC → 11 IC → 9 köp (**3,4 % av
LPV**, 64 % av ATC). Läckan sitter mellan LPV och ATC (5,3 %), inte i kassan
(9 av 11 IC köpte). Och den större läckan: 14 av 16 annonser får ingen spend.

## FAS 2 — klassificering (signifikansgrind ≥ 300 kr OCH ≥ 3 köp)

| Annons | Format | Spend | Andel | Köp | CPA | ROAS | Vinstbidrag (493 − CPA) × köp | Hög |
|---|---|---|---|---|---|---|---|---|
| `Golfkalender_PD_1` | video | 1 936 kr | 89 % | 9 | 215 kr | 3,54 | **2 502 kr (100 %)** | **bedömbar — top spender = benchmark** |
| `Golfkalender_SP_3` | video | 72 kr | 3 % | 1 | 72 kr | 13,03 | — | för tidigt (1 köp på 13 klick) |
| `Golfkalender_PD_2_1` | bild | 52 kr | 2 % | 0 | — | — | — | för tidigt (10 klick, 8 LPV) |
| `Golfkalender_CS_2` | video | 42 kr | 2 % | 0 | — | — | — | för tidigt (155 visningar, 0 klick) |
| `Golfkalender_SP_2_1` | bild | 23 kr | 1 % | 0 | — | — | — | för tidigt |
| `Golfkalender_SP_2` | video | 14 kr | 1 % | 0 | — | — | — | för tidigt |
| `Golfkalender_G_2` | video | 13 kr | 1 % | 0 | — | — | — | för tidigt (1 ATC) |
| `Golfkalender_PD_3` | video | 11 kr | 1 % | 0 | — | — | — | för tidigt |
| `Golfkalender_CS_1` | video | 9 kr | 0 % | 0 | — | — | — | för tidigt |
| `Golfkalender_SP_1` | video | 5 kr | 0 % | 0 | — | — | — | för tidigt |
| `G_1`, `G_3`, `CS_3`, `PD_2`, `G_2_1` | video/bild | 0–2 kr | 0 % | 0 | — | — | — | för tidigt |
| `Golfkalender_CS_2_1` | bild | 0 kr | — | 0 | — | — | — | PAUSED — ingen data |

**En enda bedömbar annons.** Allt annat är brus tills etiketten dag 7
(2026-10-01). Ingen får dömas som förlorare i dag — `INGEN_LEVERANS` sätts av
etikettjobbet, inte av mig.

## FAS 3 — teardown av `Golfkalender_PD_1` (copyn läst live ur kontot; videon inte läst)

Primärtext (identisk på `PD_1`, `PD_2`, `PD_3`, `PD_2_1` — alltså skiljer
videon/hooken, inte texten):
> Glöm chokladkalendern. Det här är för golfaren. ⛳ / 24 luckor med 24 golfgrejer. / Tees, bollmarkörer, pitchgaffel, klubbborste, handduk och mer. / En liten överraskning varje dag fram till jul. / Och allt kommer till användning på banan. / Beställ din Golf Adventskalender i dag 👇
> Rubrik: *24 dagar av golfglädje*

| Komponent | Exakt rad (live) | Valens | Awareness | Avatar |
|---|---|---|---|---|
| HOOK (text) | "Glöm chokladkalendern. Det här är för golfaren." | konflikt choklad ↔ golf, identitet | problem-medveten (julklappsstress) | den som köper till golfaren |
| BRIDGE | "24 luckor med 24 golfgrejer." | positiv | lösnings-medveten | samma |
| HOLD | "Tees, bollmarkörer, pitchgaffel, klubbborste, handduk och mer." — och i videon samma uppräkning som captions över luckorna (thumbnail: "pitchgaffel,") | konkret, invändningen "vad ligger i den?" | produkt-medveten | samma |
| CTA | "Och allt kommer till användning på banan. Beställ din Golf Adventskalender i dag" | positiv (inte-i-en-låda) | — | samma |

Hold-diagnos (Meta, maximum): 9 686 starter på 10 165 visningar, thruplay
(15 s) 1 215 = 12,0 % av visningarna, p25 2 335 (23 %), p50 1 656, p75 1 116,
p100 583 (5,7 %), snitt 5 s av 22,3 s. Hook rate (3 s) går inte att läsa här.

⚠️ **Offer-integritet (regel 7):** "24 golfgrejer" och "pitchgaffel" står inte
ordagrant på sidan (sidan: greenlagare, klubbrengöringsborste, golfhandduk,
och "exakt vad som ligger bakom varje enskild lucka anger inte tillverkaren").
Innebörden håller, orden är Joshs. Nästa batch använder sidans ord.
⚠️ `CS_1/2/3` + `CS_2_1` (live, 51 kr): "Tryck och beställ innan priset går
upp" = påhittad brådska. `SP_1/2/3` + `SP_2_1` (live, 114 kr): citatet
"Rolig adventskalender med små golftillbehör. Kul att öppna varje dag." är
**importraden Lars Andersson ur REVIEW-arket**, och "14 dagars öppet köp" är
inte sidans formulering (sidan: 14 dagars ångerrätt enligt lag). Live-annonser
rörs aldrig i efterhand (Axels beslut 2026-09-15) — flaggat här och till
redigeraren vid nästa version; inget nytt material får ärva de raderna.

**Bärande komponent = hypotes (9 köp på två dygn):** chokladkonflikten i
öppningen + innehållsuppräkningen som captions. Samma text med annan video
(`PD_2` 0,72 kr, `PD_3` 11 kr) fick ingen leverans alls, så det är videon —
inte primärtexten — Meta valde. Vad i `PD_1`:s första sekunder som skiljer går
inte att säga förrän videon lästs (qa-frames på `K Golfkalender_PD_1_H1.mp4`,
Drive-id `1acS3vTKUwUYJbNGw2sU4MUMaCwEJQCX9`). Det är första saken
etikettjobbet och lärdomen ska läsa av. Stöd utanför produkten:
Adventskalender Racingbilars enda bedömbara vinnare (`PD_2_1`, 7 köp) bar
samma choklad-vs-innehåll-konflikt — n=1 där också, så mönstret är fortfarande
en hypotes, inte playbook.

## FAS 4 — förlorarna

Inga bedömbara förlorare än. Observation (ingen dom): `CS_2` fick 155
visningar och 0 klick; `PD_2_1` (stillbild, samma text) fick 10 klick på 227
visningar (4,4 %) men 0 köp på 8 LPV. Om det håller till dag 7 är det
formatet (video) som bär, inte texten.

## FAS 5 — DNA (allt är hypotes till dag 7)

| | |
|---|---|
| **Behåll alltid** | PD-vinkeln med kalenderkartongen i bild före sekund 4, chokladkonflikten som öppning, innehållet visat/uppräknat som captions, priset 549 kr synligt, "han"-tilltalet (sidan och copyn talar till den som köper till golfaren) |
| **Testa kontrollerat** | tre iterationer på `PD_1` (ny hook, längre problemdel ur sidans "golfbagen tömmer sig i det tysta", in media res: en lucka öppnas) — CS-KLART:s manuslista; SO-vinkeln (sidans problemrad); GT (present) med sidans "inte ett presentkort i en låda till våren" |
| **Undvik** | recensionscitat (importrader), "innan priset går upp"/"bara idag", "24 olika prylar", lucka-för-lucka-listor, barn i bild (sidan: aldrig barnsäker), "fri frakt" |
| **Obevisat** | G (present, 17 kr), CS (prisankare, 51 kr), SP (social proof, 114 kr — bär dessutom importcitatet), statiska bilder (75 kr) — ingen leverans, ingen dom |

## Variabeltabell (vinstbidrag per variabelvärde)

| Variabel | Värde | Annonser | Spend | Vinstbidrag | Slutsats |
|---|---|---|---|---|---|
| Vinkel | PD | 4 | 2 000 kr | 2 502 kr | bevisad som vinkel (9 köp), men på EN annons |
| Vinkel | SP | 4 | 114 kr | — (1 köp) | obevisat |
| Vinkel | CS / G | 8 | 68 kr | 0 | obevisat — ingen leverans |
| Format | video | 12 | 2 107 kr | 2 502 kr | hypotes: video bär allt |
| Format | statisk | 4 | 75 kr | 0 | obevisat |
| Video | PD_1 mot PD_2/PD_3 (samma text) | 3 | 1 936 / 0,72 / 11 kr | 2 502 / 0 / 0 | **hypotes: videon/hooken är variabeln** |

## Avatarer

1. **Partnern som köper julklapp till golfaren** ("han" på sidan och i copyn,
   sidans problem: "en klubba han redan har, eller ett presentkort som hamnar
   i en låda") — källa: sidans egna rader + G-copyn. Vem som faktiskt köpte de
   9 vet vi inte (Shopify inte läst) — **gissning** att det är hon/partnern.
2. **Golfaren själv** som köper sin egen kalender ("Det här är för golfaren")
   — källa: PD-copyns tilltal; **gissning**, ingen data skiljer 1 från 2.
3. **Föräldern till tonåringen som spelar** — källa: sidan ("vuxna och
   tonåringar som spelar golf"); gissning, 0 data.
4. **Golfkompisen/spelpartnern** — ingen källa i data eller på sidan; ren
   gissning, lägst prioritet.

## Namnkonvention (läst ur kontot 2026-09-26)

Prefix `Golfkalender_`. Launchen använder `G` för present — namnkonventionens
kod är `GT` (Axels beslut 2026-09-21, 100 annonser i kontot); nya
presentbriefer döps `GT_` och `G_` räknas som samma vinkel i analysen.
Kontots videor heter `PD_1`, `PD_2`, `PD_3` utan H-suffix — Drive säger
`PD_1_H1/H2/H3`, alltså tre hookar på koncept 1, inte tre koncept. Statiska
heter `PD_2_1`, `CS_2_1`, `G_2_1`, `SP_2_1`.
**Upptagna AD-ID:n:** PD 1–3, CS 1–3, G 1–3, SP 1–3 (video), PD_2_1, CS_2_1,
G_2_1, SP_2_1 (bild). **Nästa lediga:** `PD_4`, `CS_4`, `GT_4`, `SP_4`,
`SO_1`, `OB_1`; iterationer på vinnaren `PD_1_H4/H5/H6` (H4 = första nya
hooken efter Drives H1–H3). Läs av kontot, hubben och den här filen innan de
används.

## Säsong

Adventskalender = död efter 24 dec. Leverans 5–10 arbetsdagar (butikens
fraktsida). **Sista rimliga annonsdag för adventsbruk (kalendern hemma till
1 dec): 2026-11-17** (10 arbetsdagar före tisdag 1 dec). **Som julklapp
(öppnas ändå): senast 2026-12-10** (10 arbetsdagar före torsdag 24 dec).
Efter 10 dec stängs kampanjen — inget "kommer efter jul"-läge. Ett datum i
copy ("sista beställningsdag") är ett verkligt villkor, inte påhittad brådska,
men det kräver Axels ok innan det skrivs.

## Öppna frågor till Axel

- SP- och CS-annonserna live bär importcitatet respektive "innan priset går
  upp" — ska de få ligga (regeln 2026-09-15 säger ja) eller vill du pausa
  dem själv?
- Ska sista beställningsdag (17 nov / 10 dec) få stå i copy i november?
