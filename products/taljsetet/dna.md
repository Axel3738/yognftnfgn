# Creative DNA — Täljsetet 30 Delar (6 knivar och 6 järn)

Skapad 2026-09-26 av /rond-auto (körningen 05:54 UTC) när behovet
`forsta_batch` stod i planen: produkten klarade testet (1 872 kr, 50,1 % vinst)
på två dygn. **Första riktiga batchen är INTE skriven** — se batch-log.md för
varför. Det här är FAS 0–6 ur `/forsta-batch`, så att briefsteget kan börja
direkt när lärdomarna finns (dag 7 = 2026-10-01).

Kampanj `120250349169940291` (MagiBorsten SE), launch 2026-09-24 02:15,
1 000 → 2 000 kr/dag (SKALA ×2 2026-09-26 05:54, ROAS 6,37 = 260 % av
target). Break-even **1,52** ur prissheetet (kostnad 26,94 USD + 2,9 EUR, pris
869 kr; kampanjnamnet säger 1.63 — sheetet vinner). Target-ROAS 2,45 (25 %
vinst). Produkten kom via Product test center ("10 Täljset 30 delar",
Ansvarig Annabelle Gonzales, Drive-mapp `1IBXKtwHEdjFsTTAtNuIMoJ_ESTO8CmSP`
ägd av Josh). Ingen Notion-hub ännu.

## FAS 0 — vad som faktiskt lästes (2026-09-26, 06:20 UTC)

| Källa | Nådd | Not |
|---|---|---|
| Meta, annonsnivå (Graph API v21.0, `date_preset=maximum`, 7d_click) | ✅ | 16 annonser, alla ACTIVE; 14 med spend, `G_3` och `G_2_1` 0 kr. Live copy läst ur `creative.body/title` för alla 16 |
| Kampanjnivå per dygn | ✅ | `time_increment=1`, se FAS 1 |
| Hook rate | ❌ | `video_play_actions` är starter, inte 3-sekundersvisningar — samma lucka som ATV. Thruplay och p25–p100 står i FAS 3 som hold-diagnos |
| Videornas manus / VO | ❌ | Ingen ffmpeg i containern, videorna inte transkriberade. VO = okänd. Drive bär `Täljset 30 delar_PD_1_H1/H2/H3`, `CS_1_H1–H3`, `SP_1_H1–H3`, `G_1_H1–H3` (mp4; G_1_H2/H3 med inledande understreck i filnamnet) |
| Thumbnails på de två bedömbara | ✅ | `Taljset_PD_1` (video-id `1563635721671135`, 25,1 s): två händer öppnar en kraftpappskartong, den svarta väskan med orange kantsöm skymtar under, verkstadsbord med träverktyg i bakgrunden — unboxing. `Taljset_PD_3` (`1584038393213339`, 24,5 s): en hand håller upp ett litet järn med trähandtag över en grön skärmatta, en större kniv med kopparholk ligger under — verktyget i handen, inget paket |
| Statiska bilder | ⚠️ | `PD_2_1`, `CS_2_1`, `G_2_1`, `SP_2_1` (png i Drive) — inte visuellt granskade i den här körningen. Notion-raden: bara leverantörens riktiga foton (hero på vitt, detalj, faktagrafik på svenska/norska), ingen AI, ingen gif |
| Landningssida (`/products/taljset-30-delar-6-knivar-och-6-jarn.json`) | ✅ | 869 kr / jämförpris 1 139 kr, en variant, SKU `TEMU-B10-TALJSET`, 5 bilder (hero, miljö, detalj, fakta, miljö-gif). "Livsstilsbilderna är AI-genererade illustrationer" står på sidan. Sidans rader nedan |
| Recensioner | ⚠️ | Sidan visar **8 recensioner, snitt 5,00** (Judge.me-badge i HTML). Drive-arket `Täljset 30 delar_REVIEW` bär exakt 8 rader, alla 5 stjärnor, `review_date` 2026-09-01 → 09-08 kl 00:00 UTC, tomma e-postfält. Judge.me-widgeten gick inte att läsa för den här produkten (0 byte, tre försök) — antalet stämmer med arket och det är samma launchflöde som Golf/Sotarsetet/ATV. **Räknas som launchflödets importrader — får aldrig citeras i en annons.** Inga review-bilder förrän riktiga recensioner finns |
| Kommentarer på annonserna | ✅ | 0 kommentarer på `PD_1` (30 d). Ingen INVAND-variant (`tools/annonskommentarer.mjs` från `main`, körd 2026-09-26; verktyget saknas på den här grenen) |
| Annonsidéer (Axels databas `b950b849-…`) | ✅ | 6 rader, alla `Byggd`, 0 `Ny` 2026-09-26 — inget från Axel om produkten |
| Product test center-raden i Notion | ✅ | `3d9270ab-908c-8100-8655-e5e1f21d2a58`: Typ Video – Pending Approval, Status Ads review, Ansvarig Annabelle. "Locked numbers: 30-piece whittling set: 6 knives + 6 small gouges (counted), blade guards, leather strop, sandpaper, polishing compound, practice wood block, cut-resistant gloves, zip case. **Sharp tools – show the gloves.**" Pris SE 869 kr / NO 1 039 kr. Länk till "Batch 10 – Quotes" (kostnadsark) |
| Shopify-försäljning | ❌ | inte korsvaliderad i den här körningen |

### Sidans egna rader (de enda påståenden som får användas)

- "Du letar efter rätt kniv i lådan igen" — en slö kniv från köksskåpet, ett
  vasst blad utan skydd och inget som skyddar handen om den slinter;
  "täljandet blir mer krångel än avkoppling innan du ens kommit igång".
- "30 delar samlade i en väska": 6 knivar och 6 små järn för olika snitt,
  bladskydd till varje blad, läderstrop och polermedel, slippapper, en
  träbit att öva på, skärskyddade handskar — allt i en väska med dragkedja.
- Funktioner: handskarna skyddar när kniven slinter; rätt verktyg för varje
  snitt; bladen håller sig skarpa (strop + polermedel); öva innan du börjar på
  det riktiga (träbiten); allt samlat på ett ställe.
- "Vassa verktyg. Använd handskarna."
- "Livsstilsbilderna är AI-genererade illustrationer."
- "14 dagars ångerrätt enligt lag, räknat från den dag du får varan."

**Tillåtna tal: 869, 1 139, 270 (spara), 24 % (270/1 139 = 23,7 % → sidan
skriver inget procenttal; live-copyn säger "cirka 24 %"), 30, 6 + 6, 14
(dagar ångerrätt).** Inga andra siffror.

**Får INTE förekomma:** recensioner (de 8 är importrader), "innan priset går
upp igen"/"bara idag" (påhittad brådska — CS-copyn live bär det), "30 dagars
öppet köp", "fri frakt", stålsort/härdning/"handsmitt"/ursprung (står inte på
sidan), "skedar, figurer och dekorationer" som löfte (PD-copyn säger det,
sidan säger "olika snitt" och "en träbit att öva på"), barn.

## FAS 1 — kampanjöversikt (2026-09-24 → 06:20 UTC 2026-09-26)

| | Värde |
|---|---|
| Spend sedan start | 1 879,94 kr |
| Köp (7d_click) | 12 |
| ROAS (Σ spend × purchase_roas ÷ spend) | 6,13 |
| CPA | 157 kr |
| AOV (spend × ROAS ÷ köp) | 961 kr — högre än priset 869 kr ⇒ en del ordrar bär mer i korgen. Räknat ur `spend × purchase_roas`, aldrig ur `omni_purchase_values` |
| Break-even-CPA | 961 ÷ 1,52 = **633 kr** |
| Target-ROAS (25 % vinst) | 2,45 |
| Dygn | 24/9: 1 079,34 kr, 7 köp, ROAS 6,65, CPA 154 kr · 25/9: 729,51 kr, 5 köp, ROAS 5,96, CPA 146 kr · 26/9 (t.o.m. 06:20 UTC): 71,09 kr, 0 köp. Spenden föll 25/9 utan budgetändring (1 000 kr/dag hela tiden) — Meta levererade inte fullt |

Funneln på de två annonserna med volym: `PD_1` 5 859 visningar → 354 klick
(6,0 %) → 302 LPV → 12 ATC → 6 IC → 4 köp (**1,3 % av LPV**). `PD_3` 3 722
visningar → 232 klick (6,2 %) → 198 LPV → 9 ATC → 8 IC → 6 köp (**3,0 % av
LPV**). Samma sida, samma primärtext, samma CTR — men PD_3 konverterar
dubbelt så många av sina besökare. Läckan sitter mellan LPV och ATC (4 % resp.
4,5 %), inte i kassan.

## FAS 2 — klassificering (signifikansgrind ≥ 300 kr OCH ≥ 3 köp)

| Annons | Format | Spend | Andel | Köp | CPA | ROAS | Vinstbidrag (633 − CPA) × köp | Hög |
|---|---|---|---|---|---|---|---|---|
| `Taljset_PD_3` | video | 709 kr | 38 % | 6 | 118 kr | 7,36 | **3 090 kr (67 %)** | **bedömbar — högst vinstbidrag** |
| `Taljset_PD_1` | video | 1 038 kr | 55 % | 4 | 259 kr | 4,41 | **1 496 kr (33 %)** | **bedömbar — top spender = benchmark** |
| `Taljset_PD_2` | video | 72 kr | 4 % | 0 | — | — | — | för tidigt (16 klick, 15 LPV, 1 ATC) |
| `Taljset_SP_1` | video | 24 kr | 1 % | 1 | 24 kr | 35,92 | — | för tidigt (1 köp på 5 klick) |
| `Taljset_PD_2_1` | bild | 8 kr | 0 % | 1 | 8 kr | 108,35 | — | för tidigt (1 köp på 3 klick) |
| `Taljset_CS_2` | video | 9 kr | 0 % | 0 | — | — | — | för tidigt |
| `Taljset_SP_3` | video | 7 kr | 0 % | 0 | — | — | — | för tidigt |
| `Taljset_CS_3` | video | 6 kr | 0 % | 0 | — | — | — | för tidigt |
| `CS_2_1`, `G_2`, `CS_1`, `SP_2`, `G_1`, `SP_2_1` | video/bild | 0,1–2,6 kr | 0 % | 0 | — | — | — | för tidigt |
| `G_3`, `G_2_1` | video/bild | 0 kr | — | 0 | — | — | — | ACTIVE utan leverans |

**Två bedömbara annonser, båda PD, båda samma primärtext.** Top spendern
`PD_1` är benchmark; `PD_3` slår den på vinstbidrag (3 090 mot 1 496 kr) med
lägre CPA på färre kronor. Allt annat är brus tills etiketten dag 7
(2026-10-01). Ingen får dömas som förlorare i dag.

## FAS 3 — teardown av `Taljset_PD_1` och `Taljset_PD_3` (copyn läst live; videorna inte lästa)

Primärtext (identisk på `PD_1`, `PD_2`, `PD_3`, `PD_2_1`):
> Alltid velat prova tälja, men inte vetat vilka verktyg du behöver? 🪵 / Med Täljset 30 Delar får du allt i ett: / ✔️ 6 knivar för att forma och skära / ✔️ 6 järn för att gröpa ur och ta fram detaljer / ✔️ Totalt 30 delar, så du kan börja direkt / Perfekt för skedar, figurer och dekorationer. / 👉 Beställ ditt set här.
> Rubrik: *Börja tälja redan i helgen*

| Komponent | Exakt rad (live) | Valens | Awareness | Avatar |
|---|---|---|---|---|
| HOOK (text) | "Alltid velat prova tälja, men inte vetat vilka verktyg du behöver?" | längtan + osäkerhet | problem-medveten (vill börja, vet inte hur) | nybörjaren |
| BRIDGE | "Med Täljset 30 Delar får du allt i ett" | positiv | lösnings-medveten | samma |
| HOLD | "6 knivar för att forma och skära / 6 järn för att gröpa ur / 30 delar, så du kan börja direkt" | konkret | produkt-medveten | samma |
| CTA | "Perfekt för skedar, figurer och dekorationer. Beställ ditt set här." | positiv | — | samma |

Hold-diagnos (Meta, maximum): `PD_1` thruplay 1 040 = 17,8 % av visningarna,
p25 29 %, p100 11,2 %, snitt 8 s av 25,1 s. `PD_3` thruplay 688 = 18,5 %,
p25 34 %, p100 12,0 %, snitt 8 s av 24,5 s. Nästan lika hold — skillnaden
sitter efter klicket (CVR 1,3 mot 3,0 %), inte i videon som retention.

⚠️ **Offer-integritet (regel 7):** "skedar, figurer och dekorationer" står
inte på sidan (sidan lovar "olika snitt", "träbit att öva på"). "Börja tälja
redan i helgen" är Annabelles/Joshs rad, inte sidans. Nästa batch håller sig
till sidans ord. ⚠️ `CS_1/2/3` + `CS_2_1` (live, 19 kr): "Handla nu innan
priset går upp igen" = påhittad brådska. `SP_1/2/3` + `SP_2_1` (live, 33 kr):
citatet "Bra set med många verktyg. Knivarna känns bra i handen." är
**importraden Anders Nilsson ur REVIEW-arket.** Live-annonser rörs aldrig i
efterhand (Axels beslut 2026-09-15) — flaggat här; inget nytt material får
ärva de raderna.

**Bärande komponent = hypotes (10 köp på två PD-videor, två dygn):** samma
text, olika video — `PD_3` (verktyget i handen över skärmattan, thumbnail)
konverterar 3,0 % av LPV, `PD_1` (unboxing av kartongen) 1,3 %. Hypotesen är
att **verktyget i arbete säljer, paketet lockar klick** — men det är
thumbnails, inte lästa videor. Första saken etikettjobbet och lärdomen ska
läsa av: qa-frames på `Täljset 30 delar_PD_1_H1.mp4`
(`1RMLm9PZWo6GDOfwHfLQ8x8pcwTKN1MI6`) och `PD_1_H3.mp4`
(`18fiRSwVSof9c0aG7mW7B0ZRiSmFF8hzr`). ⚠️ Kopplingen kontots `PD_3` = Drives
`PD_1_H3` är en gissning ur ordningen — verifiera mot videons id innan
lärdomen skrivs.

## FAS 4 — förlorarna

Inga bedömbara förlorare än. Observation (ingen dom): `PD_2` (samma text,
tredje videon) fick 16 klick och 15 LPV på 72 kr utan köp — om det håller
till dag 7 är det hooken som väljer publik. CS, SP och G tillsammans 52 kr
på 12 annonser — Meta gav dem ingen chans; det är ett utfall att logga, inte
ett processfel (regel 11).

## FAS 5 — DNA (allt är hypotes till dag 7)

| | |
|---|---|
| **Behåll alltid** | PD-vinkeln (verktyget i handen, snitt i trä före sekund 4), "allt i ett"-löftet med sidans lista, handskarna synliga ("Sharp tools – show the gloves", sidans "Vassa verktyg. Använd handskarna."), priset 869 kr synligt |
| **Testa kontrollerat** | tre iterationer på `PD_3` (ny hook, längre problemdel ur sidans "letar efter rätt kniv i lådan", in media res: första snittet på övningsbiten) — CS-KLART:s manuslista; SO-vinkeln (sidans problemrad); OB-vinkeln säkerhet/handskar; GT inför jul ("presenten som blir en hobby", G-copyns egen rad) |
| **Undvik** | recensionscitat (importrader), "innan priset går upp igen", "skedar/figurer/dekorationer" som löfte, materialpåståenden utanför sidan, AI-livsstilsbilder som "riktiga" (sidan deklarerar dem som illustrationer) |
| **Obevisat** | G (present, 2 kr), CS (prisankare, 19 kr), SP (social proof, 33 kr — bär importcitatet), statiska bilder (11 kr, men `PD_2_1` tog 1 köp på 8 kr) — ingen dom |

## Variabeltabell (vinstbidrag per variabelvärde)

| Variabel | Värde | Annonser | Spend | Vinstbidrag | Slutsats |
|---|---|---|---|---|---|
| Vinkel | PD | 4 | 1 826 kr | 4 586 kr | bevisad som vinkel (11 köp) på två annonser med samma text |
| Vinkel | SP | 4 | 33 kr | — (1 köp) | obevisat |
| Vinkel | CS / G | 8 | 21 kr | 0 | obevisat — ingen leverans |
| Format | video | 12 | 1 869 kr | 4 586 kr | hypotes: video bär allt |
| Format | statisk | 4 | 11 kr | — (1 köp) | obevisat |
| Video | PD_3 mot PD_1 mot PD_2 (samma text) | 3 | 709 / 1 038 / 72 kr | 3 090 / 1 496 / 0 | **hypotes: verktyget i arbete (PD_3) konverterar bättre än unboxing (PD_1)** |

## Avatarer

1. **Nybörjaren som "alltid velat prova tälja"** — källa: PD-copyns hook,
   10 köp på PD-videorna. Vem som köpte vet vi inte (Shopify inte läst), men
   copyn talar bara till den här.
2. **Den som redan täljer men saknar rätt verktyg** ("letar efter rätt kniv i
   lådan igen", slö kökskniv, blad utan skydd) — källa: sidans egen
   problemrad; **gissning**, ingen annons testar den än.
3. **Presentköparen till pappa/sambon/farfar** ("presenten som blir en hobby,
   inte en grej som hamnar i en låda") — källa: G-copyn, 2 kr spend;
   **gissning**, men jul närmar sig och G-vinkeln har 100 annonser i kontot.
4. **Stug-/altanmänniskan som vill ha en lugn syssla** ("hemma, stugan eller
   altanen", "avkopplande hobbyprojekt") — källa: SP-copyn, 33 kr spend;
   gissning, lägst prioritet.

## Namnkonvention (läst ur kontot 2026-09-26)

Prefix `Taljset_` (kontot) — Drive-filerna heter `Täljset 30 delar_…`.
Launchen använder `G` för present — namnkonventionens kod är `GT` (Axels
beslut 2026-09-21); nya presentbriefer döps `GT_` och `G_` räknas som samma
vinkel i analysen. Kontots videor heter `PD_1`, `PD_2`, `PD_3` utan H-suffix
— Drive säger `PD_1_H1/H2/H3`, alltså tre hookar på koncept 1. Statiska
heter `PD_2_1`, `CS_2_1`, `G_2_1`, `SP_2_1`.
**Upptagna AD-ID:n:** PD 1–3, CS 1–3, G 1–3, SP 1–3 (video), PD_2_1, CS_2_1,
G_2_1, SP_2_1 (bild). **Nästa lediga:** `PD_4`, `CS_4`, `GT_4`, `SP_4`,
`SO_1`, `OB_1`; iterationer på vinnaren `PD_1_H4/H5/H6` (H4 = första nya
hooken efter Drives H1–H3 — föräldern anges i briefen som PD_3 eller PD_1
beroende på lärdomen). Läs av kontot, hubben och den här filen innan de
används.

## Säsong

Ingen dödsdag — hobbyprodukt året runt. Men presentvinkeln (GT) toppar mot
jul: leverans 5–10 arbetsdagar ⇒ **sista rimliga annonsdag för julklapp
2026-12-10** (10 arbetsdagar före torsdag 24 dec). Fars dag (8 nov 2026) är
en möjlig GT-ram — samma mönster som Axels Annonsidéer för bältesslipmaskinen
(2026-09-21), gissning tills han säger det om täljsetet.

## Öppna frågor till Axel

- SP- och CS-annonserna live bär importcitatet respektive "innan priset går
  upp igen" — ska de få ligga (regeln 2026-09-15 säger ja) eller vill du
  pausa dem själv?
- "Skedar, figurer och dekorationer" står i PD-copyn men inte på sidan — ska
  sidan få en rad om vad man kan tälja, eller ska copyn hålla sig till sidan?

## Uppdatering 2026-09-27 — förstabatchen skriven på Axels beslut ("NU")

Batch #1 (18 briefer) skrevs 2026-09-27 utan dag 7-etikett, på ägarens override. Data dag 4: PD_1 och PD_3 har 8 köp var (1 850 / 1 781 kr), CVR jämnade ut sig till 1,8 % på båda — hypotesen "verktyget i arbete säljer, paketet lockar klick" är svagare än 2026-09-26 men fortfarande den som prövas (PD_1_H4). Förälder för iterationerna: PD_3. Preliminära lärdomar i `lardomar.md` (ersätts 2026-10-01). Kundspråk: `docs/voc-forum-taljsetet-2026-09-27.md` — nybörjarens första fråga är "vilken kniv?", och svaret från de som täljer är att kniven i lådan "inte är tänkt att tälja med" (→ SO_1_H1, kalla=voc). Ingen i trådarna nämner handskar — säkerhetsinvändningen är sidans, inte kundens. Notion-hub: Whittling set creative hub `3e8270ab-908c-8156-bd42-e5fcbe833705`.

## Komponentkarta Taljset_PD_1 (BREAKTHROUGH, etikett 2026-10-01 — ANALYSMETOD steg 6b)

Raderna är **lästa ur den live annonsen (Meta, 2026-10-01), inte ur brief** — lanseringsbriefen ligger i Product test center i Notion, inte i repot. Videon är inte transkriberad (VO okänd); första bildrutan är thumbnailen läst 2026-09-26.

**Datan, första veckan 24–30/9 (7d_click):** 10 251 kr (58 % av kampanjens 17 562 kr) · 31 köp · ROAS 2,82 mot kampanjens 2,98 · CPA 331 kr mot break-even-CPA **613 kr** (AOV 932 kr ÷ 1,52) · vinstbidrag (613 − 331) × 31 = **8 742 kr** · konverteringsgrad 1,7 % (31 köp / 1 859 LPV) · hook rate 40,9 % · hold rate 15,9 % · budget dag 0 → dag 7: 1 000 → 4 000 kr/dag (ronden ×2 26/9, ×2 27/9). Bredvid: **Taljset_PD_3 KPI_WINNER, bedömbar** — 4 597 kr (26 %), 18 köp, ROAS 3,40, CPA 255 kr, vinstbidrag 6 444 kr, konverteringsgrad 1,9 % (18 / 925 LPV), hook 43,7 % / hold 15,7 %. Samma primärtext på PD_1, PD_2 (277 kr, 0 köp), PD_3 och PD_2_1 (bild, 200 kr, 2 köp) — videon är variabeln.

| Komponent | Exakt rad (läst ur annonsen, inte ur brief) | Valens | Awareness | Avatar |
|---|---|---|---|---|
| HOOK (text) | "Alltid velat prova tälja, men inte vetat vilka verktyg du behöver? 🪵" | längtan + osäkerhet | problem-medveten (vill börja, vet inte hur) | nybörjaren |
| HOOK (bild, första bildrutan) | två händer öppnar en kraftpappskartong, den svarta väskan med orange kantsöm skymtar under, verkstadsbord med träverktyg i bakgrunden — unboxing (PD_3: ett järn med trähandtag i handen över grön skärmatta) | produkten i bild sekund 0 | — | samma |
| BRIDGE | "Med Täljset 30 Delar får du allt i ett:" | positiv | lösnings-medveten | samma |
| HOLD | "✔️ 6 knivar för att forma och skära / ✔️ 6 järn för att gröpa ur och ta fram detaljer / ✔️ Totalt 30 delar, så du kan börja direkt" | konkret inventarium | produkt-medveten | samma |
| CTA | "Perfekt för skedar, figurer och dekorationer. 👉 Beställ ditt set här." · rubrik "Börja tälja redan i helgen" | positiv | — | samma |

**Variabeltaggar (ANALYSMETOD 6b):** vinkel PD · hook-typ fråga (längtan) · format video unboxing → inventarium (VO okänd) · proof demo av innehållet · offer inget pris i copyn · talare okänd · brådska ingen ("redan i helgen" är en tidsram) · tro ingen trosbarriär bemöts. ⚠️ "skedar, figurer och dekorationer" står inte på sidan (dna.md regel 7) — iterationerna håller sig till sidans ord.

**Bärande komponent = hypotes (gissning):** unboxing-öppningen vinner auktionen — PD_1 tog 58 % med hook 40,9 %, och PD_3 (verktyget i handen) konverterar lika per klick (1,9 mot 1,7 %); konverteringsskillnaden från dag 2 (3,0 mot 1,3 %) var brus. Det som bär är alltså frågan + produkten i bild sekund 0, och HOLD-inventariet stänger; vilken första bild som är bäst skiljer inte datan åt på dag 7, så PD_1 (budgethöjningen) är föräldern i etiketten medan PD_3 lever som bedömbar KPI-vinnare i samma familj. Kundernas kommentarer (`agent/leads.mjs --prefix Taljset`, hjälpmedel, inte beslut): 2026-09-30 fyra misstroende-kommentarer på ett dygn ("samma som på Temu", "stulna videor", "drop-shipping", "bjuder 350 kr") och 2026-09-29 tre som frågar vad "30 delar" är när bara 6 knivar och 6 järn syns — tro-komponenten saknar svar i annonsen; `Taljset_PD_4_1` (30 delar utlagda, batch #1) är exakt den bilden, och en egen demo i stället för lånat material är leadens förslag för nästa videoiteration.

**Vidarebyggena (CS-KLART punkt 9, tre iterationer inom 14 dagar — deadline 2026-10-15):** `Taljset_PD_1_H4` (ny hook: första snittet i övningsbiten, handsken på), `PD_1_H5` (längre problemdel: kökslådan), `PD_1_H6` (in media res: den snittade biten först) — briefade 2026-09-27 i batch #1 med PD_3 som parent (samma manus som PD_1), ligger i hubben Whittling set creative hub. Dag 7 flyttar inte föräldern: PD_1 och PD_3 delar primärtext och HOLD, iterationerna varierar öppningen, och det är öppningen som skiljer dem — brieferna skrivs inte om. Dagens 14 småannonslärdomar pekar alla dit eller på batch #1:s namngivna platser; ingen ny iteration namngavs ur brus.
