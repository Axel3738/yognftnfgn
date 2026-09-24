# Lärdomar — Matstrumpor

**Ingen annons är klar förrän lärdomen är skriven** (Axels definition av
klart, `docs/os/CS-KLART.md` punkt 1–5). Antalet briefer i nästa rond är
aldrig större än antalet lärdomar som skrivits sedan förra ronden — därför
är den här filen inte dokumentation, den är grinden.

Skelettet hämtas med `node matstrumpor/kor.mjs --status`, och varje skriven
lärdom loggas som en `LARDOM`-rad i `matstrumpor/logg.jsonl`.

---

## Mallen

```
## L-<annonsnamn>            (batch #N · <utfall> · <bedömbar ja/nej>)

Spend annons / kampanj (samma fönster): … kr / … kr — … %
ROAS … · CPA … kr · konverteringsgrad … (okänd om den inte lästs — aldrig 0)

Hookar, ordagrant:
| # | Rad | Hook rate | Hold rate |
|---|-----|-----------|-----------|

Planerat mot utfört:
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| avatar · vinkel · medvetandenivå · mekanism · tro · positionering · brådska |

Hypotes: … **(gissning)**

Nästa annonser:
- <namn> — <vad som ändras och varför>
- SLÄPP <namn> — <skäl>
```

Stämde inte utförandet med briefen är det **utförandet** som föll, inte idén.
En lärdom som inte slutar med konkreta nästa annonser är en dagbok.

---

## Hur talen är lästa (rond 2026-09-24)

Alla tal nedan är ur `matstrumpor/output/dom-2026-09-24.json` (Meta, token,
7d_click). "Första veckan" = annonsens egna `[D0, D0+6]`; "14 d" = last_14d
till 2026-09-23. Break-even-ROAS 1,498 / break-even-CPA 308,48 kr (utan moms,
Axels besked). Hook rate = videostarter ÷ visningar, hold rate = thruplay ÷
videostarter, köp/LPV = köp ÷ landningssidevisningar — allt ur Meta, aldrig
räknat om. ⚠️ På annonser med under ~50 visningar är hook rate och hold rate
brus (100 % på 3 visningar är ingen mätning) — de står med i tabellen längst
ner men bedöms inte.

**Hookarna är lästa ur videorna själva** (kontots `advideos`-kant ger
källfilen; `tools/qa-frames.py` var 1,5 s; captions avlästa ur frames). De
gamla Notion-raderna bär bara Drive-länkar, inget manus — så "planerat" är
`brief saknas` för allt som byggdes före systemet, utom `012 v2` som har en
brief i Google Docs.

**Kommentarerna kunde INTE läsas:** `tools/annonskommentarer.mjs` svarar
`(#10) requires pages_read_engagement` på sidan `820358954504320` (Matstrumpors
Facebooksida) — `META_ACCESS_TOKEN` saknar rättigheten för den sidan. Tills
Axel gett den kan inga INVAND-briefer skrivas ur kommentarer för Matstrumpor.

---

## Batchnumreringen (ärvd historik, satt 2026-09-24)

Ingen batch byggdes av systemet före 2026-09-21. Numren nedan är satta ur
`created_time` i kontot så att lärdomarna går att gruppera:

| Batch | D0 | Adset | Annonser |
|---|---|---|---|
| #0a | 2026-08-27 | `alla17` + `nya16` + `bilder` | 17 UGC (`s001`–`s009`, `haiku`, `somnet`, `opus`, `trodde`, `julstrumpa`, `fomo november`) + 11 statics (`d1`–`d4`, `b001`–`b005`, `c`, `f`) |
| #0b | 2026-08-30 | `nya8` | `h1`–`h3`, `016`, `meet`, `013`, `012`, `012v2` |
| #0c | 2026-09-02 | `nya20` | `017v1/v2`, `019`, `020`, `021`, `s005`, `010v2`, `011v2` |
| #0d | 2026-09-17 | `batch03_bilder` + `09-17 UGC` | bildannonser `029`–`038` (systemets första bildbatch) + Axels tre UGC (`Nathalie`, `Sofie H1/H2`) |
| #1 | 2026-09-21 | `jul_video` + `nya16` | Gilz 022–025 ⇒ `044`–`047` (11 videor) — första veckan inte slut, ingen etikett än |

---

## L-09-17_Nathalie_captions_musik   (batch #0d · BREAKTHROUGH · bedömbar ja)

*(Annonsens namn i kontot är `09-17 Nathalie captions musik` — Axels egen
uppladdning utanför namnmönstret. Lärdoms-id:t byter mellanslag mot `_`.)*

Spend annons / kampanj (första veckan 17–23/9): **5 001 kr / 10 291 kr — 49 %**.
Kampanjen gjorde 44 köp i fönstret, Nathalie **29 av dem (66 %)**.
ROAS **2,42** · CPA **172 kr** (break-even 308) · köp/LPV **3,4 %** (29 köp på
845 LPV, 1 124 klick på 63 047 visningar = 1,8 % klickfrekvens).
Budgeten höjdes 1 000 → 2 000 → **10 000 kr/dag den 23/9** (Axel) — det är
det som gör etiketten BREAKTHROUGH i stället för SPEND_WINNER.
14 d: samma tal (annonsen är sju dagar gammal). Vinstbidrag **+3 078 kr** =
benchmarken, dödas aldrig.

⚠️ **Hook rate 0,2 % (139 videostarter på 63 047 visningar) är inte trovärdig**
för en annons med 1 124 klick och 29 köp — Sofie H1/H2 i samma adset visar
86–98 %. Troligen räknar Meta `video_play_actions` annorlunda för den här
uppladdningen (DCO/auto-cropped varianter finns i `advideos`), inte att
publiken stänger av. Hold rate 21,6 % (30 thruplay/139 starter) lider av
samma nämnare. **Läs inte hook/hold på den här annonsen förrän talet
förklarats** — bedöm den på klick, LPV och köp, som är hela.

Hookar, ordagrant (captions ur videon, 27,7 s, verklig kreatör, musik):
| # | Tid | Rad | Hook rate | Hold rate |
|---|---|---|---|---|
| 1 | 0:00–0:01 | *(ingen text — en enda lax-maki hålls upp mot kameran, hon nyper i den)* | 0,2 % (se ⚠️) | 21,6 % (se ⚠️) |
| 2 | 0:01–0:02 | det här är ditt tecken | | |
| 3 | 0:02–0:04 | dom sålde slut i november | | |
| 4 | 0:04–0:06 | ge bort dom | | |
| 5 | 0:06–0:09 | ta med till kalaset eller spara till julstrumpan | | |
| 6 | 0:09–0:12 | när du ger bort dom här så är det som att du vet allt om personen — du visste ju deras favoriträtt | | |
| 7 | 0:12–0:13 | tio sushibitar med ätpinnar i trä | | |
| 8 | 0:13–0:15 | pizza, burgare och donut i egna (lådor) | | |
| 9 | 0:15–0:18 | fyra looks som verkligen lurar blicken totalt *(vännen öppnar paketet)* | | |
| 10 | 0:18–0:21 | ja hon blev verkligen överraskad | | |
| 11 | 0:21–0:22 | rolig att öppna och används år efter år | | |
| 12 | 0:22–0:27 | dom som tog slut i november förra året, så säkra dina på matstrumpor punkt se innan det händer igen *(soffan, strumporna på fötterna)* | | |

⚠️ Raden 12 säger butikens namn i captionen — regeln "butikens namn står
aldrig i en annons" (2026-09-18) gäller nya versioner; den här är live och
rörs inte (Axels regel 2026-09-15).

Planerat mot utfört:
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| avatar | brief saknas (Axels egen uppladdning) | presentköparen: kvinna ~45 som köper till en väninna/familj, verklig kreatör | okänd |
| vinkel | brief saknas | gift + säsong (julstrumpan) + knapphet (sålde slut i november) | okänd |
| medvetandenivå | brief saknas | problem-aware ("ditt tecken" → du letar redan present) | okänd |
| mekanism | brief saknas | lådan ser ut som takeaway, avslöjas som strumpor; "du visste ju deras favoriträtt" | okänd |
| tro | brief saknas | verklig kvinna + verklig mottagare som öppnar och skrattar | okänd |
| positionering | brief saknas | presenten som används år efter år (mot skämtprylen) | okänd |
| brådska | brief saknas | "tog slut i november förra året — säkra dina innan det händer igen" | okänd |

Hypotes: den skiljer sig från allt annat i kontot på tre punkter samtidigt —
**en riktig människa i sitt eget kök** (inte klippkompilation), **en riktig
mottagare som öppnar** (tro), och **en konkret knapphet** ("sålde slut i
november") i stället för listicle-argument. Att den konverterar 3,4 % mot
haikuh3:s 1,1 % på samma landningssida tyder på att det är trovärdigheten
och brådskan som saknas i de andra, inte hooken **(gissning)**. Att den
höjdes 10× på en dag är Axels beslut — etiketten säger inte att den tål det.

Nästa annonser (vidarebyggen inom 14 dagar, CS-KLART punkt 9 — aldrig en ren kopia):
- `MATSTRUMP_sushi_gift_ugc_048_v1` — I1, **ny hook**: knappheten först ("sålde slut i november förra året"), resten av videon orörd.
- `MATSTRUMP_sushi_gift_ugc_049_v1` — I2, **längre problemdel**: den misslyckade presenten (byrålådan, presentkortet) i 8 s före "det här är ditt tecken".
- `MATSTRUMP_sushi_gift_ugc_050_v1` — I3, **in media res**: börja vid 0:18 när vännen öppnar och skrattar, backa sedan till start.
- `MATSTRUMP_sushi_jul_ugc_051_v1` — I4, **jul-versionen** till jul-adsetet: "spara till julstrumpan" som hook — jul-adsetet har fått 24 kr på tre dygn och behöver en annons som redan bevisat sig.
- `MATSTRUMP_sushi_jul_static_052_v1` — bild: knappheten + lådan i d3:s layout, till det tomma `jul_bilder`-adsetet.
- ⚠️ OWNER: **be Nathalie om råfilen utan captions** — iterationerna klipper annars i inbrända texter.

## L-MATSTRUMP_sushi_gift_ugc_haikuh3_v1   (batch #0a · SPEND_WINNER · bedömbar ja)

Spend annons / kampanj (första veckan 27/8–2/9): **3 681 kr / 8 567 kr — 43 %**
(kampanjens ROAS i fönstret 0,879 — hela batchen gick back).
ROAS **0,98** · CPA **460 kr** · köp/LPV **1,1 %** · hook rate 3,1 % · hold 77,5 %.
14 d: 4 517 kr, 5 köp, ROAS ~0,5, vinstbidrag **−3 184 kr** — kontots största förlust.
(Etiketten loggades 2026-09-21 på 9 köp/ROAS 1,08; attributionen har flyttat
sig sedan dess. Loggen gäller, etiketten ändras inte.)

Hookar, ordagrant (52 s, klippkompilation av flera kvinnor, listicle):
| # | Tid | Rad | Hook rate | Hold rate |
|---|---|---|---|---|
| 1 | 0:00–0:12 | Jag gav min mamma den ultimata oväntade presenten men sen fattade jag… *(händer rullar upp en laxstrumpa till nigiri — hooktexten står kvar i TOLV sekunder)* | 3,1 % | 77,5 % |
| 2 | 0:12–0:27 | ETT: DE ÄR HELT ENKELT UNIKA — Glöm alla de där tråkiga presenterna som hamnar… / Det här är en hel upplevelse / Folk tror alltid att det är riktig sushi när de öppnar lådan … Vänta… det är strumpor! | | |
| 3 | 0:27–0:39 | TVÅ: DET ÄR VÄRT DET — Det är inte bara fem par strumpor / det är högkvalité / mjukt material / och de håller länge / Ingen present som bara samlar damm | | |
| 4 | 0:39–0:50 | TRE: DU GÖR DEM GLADA — Mamma sa att det var hennes favoritgåva / Hon vill redan ha fler / Det är liksom garanterat skratt / present där givaren är den smarta / Du blir personen som ger de bästa presenterna / Alla frågar: Var köpte du det här? | | |
| 5 | 0:50–0:52 | Klicka bara på länken nu och kolla in allt — Matstrumpor.se *(endcard BESTÄLL NU)* | | |

Planerat mot utfört:
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| avatar | brief saknas (Notion-raden "Sushi Haiku" bär bara Drive-länkar) | presentköparen till mamma | okänd |
| vinkel | brief saknas | gift, listicle "tre skäl" | okänd |
| medvetandenivå | brief saknas | product-aware ("ultimata presenten") | okänd |
| mekanism | brief saknas | "ser ut som sushi, är strumpor" | okänd |
| tro | brief saknas | påståenden ("högkvalité", "håller länge") utan bevis; flera olika kvinnor, ingen är avsändare | okänd |
| positionering | brief saknas | mot "presenter som samlar damm" | okänd |
| brådska | brief saknas | ingen | okänd |

Hypotes: hooken fungerar (den tog 43 % av spenden, folk tittar 77 % av
klippet) men **säljdelen lovar med adjektiv** ("högkvalité", "mjukt",
"garanterat skratt") i stället för att peka — och det finns ingen brådska
och ingen riktig avsändare. Därför klick utan köp: 1,1 % köp/LPV mot
Nathalies 3,4 %. Meta fortsätter mata den för att hooken är stark, och den
blöder. **(gissning)** Kommentarerna gick inte att läsa (se ovan) — första
diagnosen enligt CS-KLART 10 kunde inte ställas.

Nästa annonser:
- SLÄPP `MATSTRUMP_sushi_gift_ugc_haikuh3_v1` — förslag till Axel att pausa: −3 184 kr på 14 dagar, benchmarken (Nathalie) bär nu vinsten så den är inte skyddad. Hooken tas med som H-variant i `049` (problemdelen) i stället.
- Hooken "Jag gav min mamma … men sen fattade jag" återanvänds inte rakt av; om Axel vill behålla konceptet: bygg om från 0:12 med Nathalies bevis (verklig mottagare + "sålde slut i november") — det ryms i `049`.

## L-MATSTRUMP_sushi_offer_static_d3_v1   (batch #0a · KPI_WINNER · bedömbar ja)

Spend annons / kampanj (första veckan): **824 kr / 8 567 kr — 10 %**.
ROAS **1,94** · CPA 206 kr · köp/LPV **6,7 %** (bästa i kontot) · hook/hold: bild.
14 d: 2 124 kr, 8 köp, vinstbidrag **+1 204 kr** — enda lönsamma annonsen utöver Nathalie.

Hookar, ordagrant (bildtext):
| # | Rad | Hook rate | Hold rate |
|---|---|---|---|
| 1 | SUSHISTRUMPOR · Ser ut som takeaway. Är 20 par strumpor. · KÖP 2 – FÅ 2 GRATIS *(sex lådor i pyramid, blå bakgrund)* | bild | bild |
| 2 | Ads Manager: "Köp 2, få 2 gratis – fyra lådor" / "Fyra lådor på bordet. Köp 2 – få 2 gratis, tjugo par strumpor totalt…" | | |

Planerat mot utfört:
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| avatar | brief saknas | den som köper flera (fyra lådor) | okänd |
| vinkel | brief saknas | offer | okänd |
| medvetandenivå | brief saknas | promo | okänd |
| mekanism | brief saknas | "ser ut som takeaway, är 20 par" | okänd |
| tro | brief saknas | produktfoto, inget bevis | okänd |
| positionering | brief saknas | mängd för pengarna | okänd |
| brådska | brief saknas | ingen | okänd |

Hypotes: erbjudandet + en bild som visar exakt vad man får konverterar
dubbelt så bra som UGC-videorna (6,7 % mot 1–3 %) — publiken som klickar
på en offer-bild är redan köpsugen, videon behöver övertyga. Att 90 av 110
ordrar bär två lådor säger att "köp 2" är hur kunden ändå handlar
**(gissning)**. Systerannonserna d1/d2/d4 (Köp 1 få 1, andra bilder) fick
ingen leverans — Meta valde en av fyra nästan likadana, det säger inget om
budskapet.

Nästa annonser:
- `MATSTRUMP_sushi_jul_static_052_v1` — samma layout + julstrumpan + "sålde slut i november förra året", till `jul_bilder` (adsetet är tomt och PAUSED sedan 21/9 — slås på av uppladdaren).
- Fler statics i samma form är den billigaste produktionen i kontot; nästa rond bygger en offer-static per vinnande videohook.

## L-MATSTRUMP_sushi_gift_ugc_s001h1_v2   (batch #0a · KPI_WINNER · bedömbar ja)

Spend annons / kampanj (första veckan): **834 kr / 8 567 kr — 10 %**.
ROAS **1,40** (under 1,498) · CPA 278 kr · köp/LPV **3,2 %** · hook rate **9,8 %** · hold **78,8 %**.
14 d: 539 kr, 1 köp, vinstbidrag −6 kr — Meta har slutat mata den.

Hookar, ordagrant (41 s, AI-genererad kvinna i vardagsrum + produktklipp):
| # | Tid | Rad | Hook rate | Hold rate |
|---|---|---|---|---|
| 1 | 0:00–0:03 | Om du ska ge (bort en present) … *(AI-kvinnan håller lådan mot kameran)* | 9,8 % | 78,8 % |
| 2 | 0:03–0:41 | …är sushiformade … sekund med att … perfekta balansen … som passar … Sushistrumpor *(bara fragment läsbara ur frames — captions visar ett ord i taget)* | | |

Planerat mot utfört:
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| avatar | brief saknas (Notion-raden "001" bär bara Drive-länkar) | presentköparen | okänd |
| vinkel | brief saknas | gift | okänd |
| medvetandenivå | brief saknas | problem | okänd |
| mekanism | brief saknas | sushiformade strumpor | okänd |
| tro | brief saknas | AI-person — ingen | okänd |
| positionering | brief saknas | "perfekta balansen" (rolig/praktisk) | okänd |
| brådska | brief saknas | ingen | okänd |

Hypotes: kontots högsta hook rate (9,8 %) och hold (79 %) men ROAS strax
under break-even — publiken tittar och klickar (3,2 % köp/LPV är okej) men
ordervärdet räcker inte. Det AI-genererade ansiktet ger ingen tro; talet i
ett ord per caption gör manuset oläsbart i tyst feed **(gissning)**.

Nästa annonser:
- SLÄPP `MATSTRUMP_sushi_gift_ugc_s001h1_v2` — ingen spend på sju dygn (539 kr på 14 d, 1 köp); AI-person går emot hook-visual-regeln. Hookmekaniken (produkten mot kameran första sekunden) lever vidare i Nathalie-iterationerna.

## L-MATSTRUMP_sushi_gift_ugc_haikuh2_v1   (batch #0a · LOSER · bedömbar ja)

Spend annons / kampanj (första veckan): **2 262 kr / 8 567 kr — 26 %**.
ROAS **0,53** · CPA 754 kr · köp/LPV 3,2 % · hook rate 0,9 % · hold 72,3 %.
14 d: 3 413 kr, 11 köp, vinstbidrag **−282 kr** (den har hämtat sig något; fortfarande under break-even).

Hookar, ordagrant (48 s, samma kompilation som haikuh3 från 0:08):
| # | Tid | Rad | Hook rate | Hold rate |
|---|---|---|---|---|
| 1 | 0:00–0:08 | Stopp! Köp inte sushistrumpor förrän du har sett det här *(händer viker upp en gul tamago-strumpa på gräs)* | 0,9 % | 72,3 % |
| 2 | 0:08– | ETT / TVÅ / TRE — samma listicle som haikuh3 | | |

Planerat mot utfört: samma som haikuh3 (brief saknas, samma kropp).

Hypotes: samma säljdel som haikuh3 med en svagare hook ("Stopp!" är en
kurshook vem som helst kan skriva) ⇒ sämre allt. Att den ändå gör 3,2 %
köp/LPV (haikuh3: 1,1 %) tyder på att haikuh3:s mamma-hook drar in fel
publik (nyfikna, inte köpare) **(gissning)**.

Nästa annonser:
- SLÄPP `MATSTRUMP_sushi_gift_ugc_haikuh2_v1` — förslag till Axel att pausa (−282 kr/14 d, 0,53 första veckan). Generisk hook, iterera inte.

## L-MATSTRUMP_sushi_gift_ugc_012v2_v1   (batch #0b · LOSER · bedömbar 14 d)

Spend annons / kampanj (första veckan 30/8–5/9): **17 kr — 0 %**, 0 köp ⇒ LOSER dag 7.
14 d: **1 744 kr, 2 köp, CPA 872 kr, vinstbidrag −1 244 kr** — Meta började
mata den EFTER första veckan och den går back. Hook rate 3,6 %, köp/LPV 1,1 %.

Hookar, ordagrant (14 s bildspel, AI-bilder, Google-Docs-briefen "012 v2"):
| # | Rad | Hook rate | Hold rate |
|---|---|---|---|
| 1 | En av kartongerna är bluffpizza. *(stapel pizzakartonger "PIZZA SOCKS" på en fest)* | 3,6 % | okänd (bildspel) |
| 2 | Bluffen är strumpor. | | |
| 3 | En dubbeltitt. Ett skratt. | | |
| 4 | Ingen får låna din. | | |
| 5 | Bor bland de vanliga. | | |
| 6 | Var sin sort. | | |
| 7 | Fyra sorter. Välj en var. / matstrumpor.se | | |

Planerat mot utfört (briefen finns — enda ärvda annonsen med "planerat"):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| avatar | familjen, en låda per person | festbilder + byrålåda + fyra par fötter | ja |
| vinkel | identity ("var sin sort") | samma | ja |
| medvetandenivå | unaware (tvisten först) | samma | ja |
| mekanism | bluffpizzan avslöjas | slide 1–2 | ja |
| tro | "hyperrealistiska AI-bilder som läser som mobilfoto" | AI-bilder, tydligt genererade (partyt) | **nej — utförandet** |
| positionering | familjens sort var | samma | ja |
| brådska | ingen (briefen förbjuder pris/offer på endcard) | ingen | ja |

Hypotes: idén håller (dubbeltitten är kontots bärande mekanism) men utan en
människa och utan pris/erbjudande blir det ett vackert bildspel som inte
säljer — 1,1 % köp/LPV är kontots lägsta tillsammans med haikuh3. Det är
utförandet (AI-bilder, ingen tro, ingen brådska) som föll **(gissning)**.

Nästa annonser:
- SLÄPP `MATSTRUMP_sushi_gift_ugc_012v2_v1` — förslag till Axel att pausa (−1 244 kr/14 d). "Bluffen" som mekanism lever i den nya vinkeln `053` (skämtet på fikat) — med riktiga händer och ett erbjudande.

## L-MATSTRUMP_sushi_curiosity_product_038_v1   (batch #0d · KPI_WINNER · bedömbar nej)

Spend annons / kampanj (första veckan 17–23/9): 70 kr / 10 291 kr — 1 %. 1 köp, ROAS 5,66 (ett köp — ingen dom). Bildannons.

Hookar, ordagrant (bildtext, kie.ai-bild):
| # | Rad | Hook rate | Hold rate |
|---|---|---|---|
| 1 | OBS: INTE SUSHI *(rött band över lådan)* · Fem par strumpor, förklädda till sushi i en låda. · KÖP 1 – FÅ 1 GRATIS | bild | bild |

Planerat mot utfört: briefen ligger i hubben (`MATSTRUMP_sushi_curiosity_product_038_v1`, Draft → To be translated); vinkel curiosity, format product — utfört som planerat, bildbatchen laddades upp 17/9.

Hypotes: samma recept som d3 (bild + erbjudande) fast med vändningen som
rubrik. Ett köp på 70 kr säger bara att den kan konvertera; Meta ger
bildadsetet 276 kr på 14 dagar totalt eftersom CBO:n matar Nathalie
**(gissning)**.

Nästa annonser:
- Behåll live; ingen iteration förrän ≥ 3 köp. Bildbatchens övriga nio (`029`–`037`) fick 1–89 kr var — se batchlärdomen #0d.

---

## Batchlärdomar — förlorare och annonser utan leverans

En lärdom per batch. Varje annons står med namn så `LARDOM`-raden kan peka
hit; talen står i tabellen längst ner. Hook rate/hold rate på dem är brus
(under 50 visningar) och citeras inte.

### L-batch-0a-ugc   (batch #0a · 27/8 · adset `alla17` + `nya16` · 15 LOSER/INGEN_LEVERANS)

Annonser: `s002h1_v2`, `s002h2_v2`, `s002h3_v2`, `s003h1_v2`, `s003h2_v2`,
`s003h3_v2`, `s004h1_v2`, `s004h2_v2`, `s004h3_v2`, `s004h4_v2`, `s006h1_v2`,
`s006h2_v2`, `s006h3_v2`, `s007h1_v2`, `s007h2_v2`, `s007h3_v2`, `s008h1_v1`,
`s008h2_v1`, `s008h3_v1`, `s009h1_v1`, `s009h2_v1`, `s009h3_v1`, `haikuh1_v1`,
`somneth1_v1`, `somneth2_v1`, `somneth3_v1`, `opush1_v1`, `trodde_v1`,
`julstrumpa_v1`, `fomo_ugc_november_v1`.
Spend annons / kampanj (första veckan): 0–130 kr var / 8 567 kr. Adsetet
`alla17` (17 annonser) fick **587 kr och 1 köp på 14 dagar** — 30 annonser
i samma CBO som haikuh3, som tog 43 %.

Hookar ordagrant: **inte lästa** — 30 videor med under 50 visningar var; att
dra frames på dem ändrar inget i domen. Ads Manager-texten är densamma på
alla: "Ingen jublar åt tvättmedel. Ingen sparar en skämtpryl…" /
"Rolig i kväll. På fötterna i morgon."

Planerat mot utfört: brief saknas för alla (Notion-raderna 001–009, Sushi
Haiku/Fable/opus/somnet bär bara Drive-länkar).

Hypotes: **det här är Metas dom, inte annonsernas** — 30 annonser släpptes
samtidigt i en CBO på 1 000 kr/dag, Meta valde tre (haikuh3, haikuh2, s001h1)
inom två dygn och resten fick aldrig chansen. Att `julstrumpa_v1` och
`fomo_november` (samma säsongsvinkel som Nathalie sedan vann på) dog med
15 resp. 22 kr säger inget om vinkeln **(gissning)**. Regel 11 i CLAUDE.md:
svält är ett utfall att logga, inte ett processfel att bygga runt.

Nästa annonser:
- SLÄPP alla 30 — ingen spend på sju dygn (CS-KLART 11); Axel kan låta dem ligga, de kostar inget.
- Säsongsvinkeln (`julstrumpa`, `november`) testas om **via Nathalie** (`051`), inte via omstart av de här.

### L-batch-0a-statics   (batch #0a · 27/8 · adset `bilder` · 10 LOSER/INGEN_LEVERANS)

Annonser: `offer_static_d1_v1`, `offer_static_d2_v1`, `offer_static_d4_v1`,
`skamt_static_c_v1`, `position_static_f_v1`, `gift_static_b001_v1`,
`anvandning_static_b002_v1`, `pris_static_b003_v1`, `vandning_static_b004_v1`,
`vandning_static_b005_v1`. Spend 1–157 kr var första veckan; adsetet
`bilder` gjorde 2 275 kr / 8 köp på 14 d varav d3 2 124 kr.

Hookar ordagrant (bildrubriker ur Ads Manager-titeln, bilderna följer den):
"Köp 1, få 1 gratis – en till dig" (d1) · "Köp 1, få 1 gratis – tio par
totalt" (d2) · "Köp 1, få 1 gratis. Tio par landar hem." (d4) · "Handla när
restaurangen har stängt" (c) · "Skrattar när den öppnas, bärs var dag" (f) ·
"Strumpor förklädda till sushi" (b001) · "Sushistrumpor du bär i morgon igen"
(b002) · "Fem par för 399 kr – ätpinnar med" (b003) · "Ätpinnar redo. Inget
att äta." (b004) · "Räkna bitarna. Ingen är sushi." (b005).

Planerat mot utfört: brief saknas (byggda före systemet).

Hypotes: elva statics i ett adset — Meta valde d3 (Köp 2 få 2) och gav de
tre "Köp 1 få 1"-varianterna 15–157 kr. Skillnaden d3 ↔ d1/d2/d4 är
erbjudandets storlek och bilden (sex lådor i pyramid mot en låda). Att
"köp 2" vann kan bero på att kunden ändå köper två (90/110 ordrar)
**(gissning)** — det är värt ett riktigt test med två annonser, inte elva.

Nästa annonser:
- SLÄPP alla tio — ingen leverans på sju dygn.
- `052` bär d3:s form; nästa rond testar "Köp 1 – få 1" mot "Köp 2 – få 2" som EN isolerad variabel i två bilder.

### L-batch-0b-nya8   (batch #0b · 30/8 · adset `nya8` · 7 LOSER/INGEN_LEVERANS)

Annonser: `gift_ugc_h1_v1`, `h2_v1`, `h3_v1`, `016_v1`, `meet_v1`, `013_v1`,
`012_v1` (+ `012v2_v1`, egen lärdom ovan). Första veckan 0–56 kr var;
adsetet 1 772 kr / 2 köp på 14 d, nästan allt på 012v2.

Hookar ordagrant: inte lästa (under 50 visningar var). `012_v1` är v1 av
bluffpizzan (Google-Docs-briefen säger "Do not produce v1 — this brief
supersedes it", ändå live båda två).

Planerat mot utfört: brief saknas utom 012 (se 012v2).

Hypotes: samma svält som #0a — åtta annonser i en CBO där haikuh3 redan
tagit spenden **(gissning)**.

Nästa annonser:
- SLÄPP alla sju — ingen spend på sju dygn.

### L-batch-0c-nya20   (batch #0c · 2/9 · adset `nya20` · 20 LOSER/INGEN_LEVERANS)

Annonser: `017v1h1_v1`, `017v1h2_v1`, `017v1h3_v1`, `017v2h1_v1`, `017v2h2_v1`,
`017v2h3_v1`, `019h1_v1`, `019h2_v1`, `019h3_v1`, `020h1_v1`, `020h2_v1`,
`020h3_v1`, `021h1_v1`, `021h2_v1`, `021h3_v1`, `s005h1_v1`, `s005h2_v1`,
`s005h3_v1`, `010v2_v1`, `011v2_v1`. Första veckan 0–15 kr var; adsetet
**2 kr på 14 dagar**. Tjugo videor från Gilz och Carl som aldrig visats.

Hookar ordagrant: inte lästa (0–20 visningar var).
Planerat mot utfört: brief saknas (Notion 017 v1/v2, 019, 020, 021 bär bara Drive-länkar).

Hypotes: hela batchen är oläst av Meta — adsetet skapades i en CBO som
redan hade en vinnare och fick noll. Det är inte tjugo förlorare, det är
noll mätningar **(gissning)**. Lärdomen är produktionens: 20 videor för
2 kr spend är det dyraste som hänt i kontot.

Nästa annonser:
- SLÄPP alla tjugo som annonser. **Men:** de bästa hookarna i 017/019/020/021 är oprövade — nästa rond får plocka EN av dem som H-variant i en Nathalie-iteration i stället för att ladda upp om.
- Aldrig mer än 3–4 nya annonser per adset i samma CBO-vecka som en levande vinnare (tips till Axel, inte regel — han laddar upp).

### L-batch-0d-bilder   (batch #0d · 17/9 · adset `batch03_bilder` · 9 LOSER/INGEN_LEVERANS)

Annonser: `curiosity_product_029_v1`, `curiosity_beforeafter_030_v1`,
`pain_lifestyle_031_v1`, `conflict_comparison_032_v1`,
`social_textheavy_033_v1`, `identity_product_034_v1`, `offer_product_035_v1`,
`gift_product_036_v1`, `curiosity_product_037_v1` (+ `038`, egen lärdom).
Första veckan 1–89 kr var; adsetet 276 kr / 1 köp på 14 d.

Hookar ordagrant (bildrubrik = Ads Manager-titel): "Ser ut som sushi. Är
strumpor." (029, 037) · "Vik ut sushin. Hitta en strumpa." (030) · "Rolig i
kväll. På fötterna i morgon." (031) · "Presentkort ger aldrig en dubbeltitt."
(032) · "2 576 sushilådor sålda förra julen." (033) · "Till den som alltid
beställer extra lax." (034) · "Fyra lådor. Alla klappar lösta." (035) · "Den
bästa lilla gåvan till julstrumpan." (036).

Planerat mot utfört: briefer finns i hubben (rad 029–038, systemets
bildbatch) — utförda som planerat (kie.ai + textlager).

Hypotes: tio bilder i ett nytt adset samma dag som Nathalie gick live i
CBO:n — svält igen. Det enda talet som säger något är att `036`
(julstrumpan) fick mest, 89 kr, utan köp **(gissning)**. ⚠️ `033` påstår
"2 576 sushilådor sålda förra julen" — den siffran finns inte i repot; om
den inte kommer ur Shopify ska den inte köras igen.

Nästa annonser:
- SLÄPP 029–037 — ingen spend på sju dygn. `038` behålls (1 köp).
- Bildvinklarna testas via `052` i jul-bildadsetet, en åt gången.

### L-Sofie_H1_H2   (batch #0d · 17/9 · adset `09-17 UGC` · 2 LOSER)

Annonser: `Sofie H1 Sushi Captions Ingen musik` (18 kr), `Sofie H2 julstrumpa
Sushi Captions Ingen musik` (12 kr). Samma adset som Nathalie, som tog
5 001 kr.

Hookar, ordagrant (25 s, verklig kreatör, captions, ingen musik):
| # | Annons | Rad |
|---|---|---|
| 1 | Sofie H1 | jag trodde helt seriöst att det här var riktig sushi *(lådan mot kameran, sedan hon i bild)* |
| 2 | Sofie H2 | det här måste ju vara den enda sushin som faktiskt hör hemma i en julstrumpa *(en grå stickad julstrumpa i handen)* |

Planerat mot utfört: brief saknas (Axels egen uppladdning).

Hypotes: samma format som Nathalie (riktig kvinna, captions) men Meta valde
Nathalie på dag ett och Sofie fick 30 kr tillsammans — ett A/B-utfall i en
CBO, inte en dom över Sofie. Skillnaderna som syns: Nathalie har musik,
en mottagare som öppnar, och knapphetsraden; Sofie står ensam och pratar
**(gissning)**.

Nästa annonser:
- SLÄPP båda som annonser (ingen spend på sju dygn). Sofies H2-hook
  ("den enda sushin som hör hemma i en julstrumpa") är den bästa julraden i
  kontot och tas med som H2-alternativ i `051`.

---

## Etiketttabellen, rond 2026-09-24 (85 annonser, ur dom-2026-09-24.json)

Sorterad på spend första veckan. `okänd` = Meta gav inget tal, aldrig 0.
| Annons | D0 | Etikett | Spend v1 | Köp | ROAS | Hook rate | Hold rate | Köp/LPV | 14d spend | 14d köp | 14d vinstbidrag |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 09-17 Nathalie captions musik | 2026-09-17 | BREAKTHROUGH | 5001 kr | 29 | 2.42 | 0.2 % | 21.6 % | 3.4 % | 5001 kr | 29 | 3078 kr |
| MATSTRUMP_sushi_gift_ugc_haikuh3_v1 | 2026-08-27 | SPEND_WINNER | 3681 kr | 8 | 0.98 | 3.1 % | 77.5 % | 1.1 % | 4517 kr | 5 | -3184 kr |
| MATSTRUMP_sushi_gift_ugc_haikuh2_v1 | 2026-08-27 | LOSER | 2262 kr | 3 | 0.53 | 0.9 % | 72.3 % | 3.2 % | 3413 kr | 11 | -282 kr |
| MATSTRUMP_sushi_gift_ugc_s001h1_v2 | 2026-08-27 | KPI_WINNER | 834 kr | 3 | 1.40 | 9.8 % | 78.8 % | 3.2 % | 539 kr | 1 | -6 kr |
| MATSTRUMP_sushi_offer_static_d3_v1 | 2026-08-27 | KPI_WINNER | 824 kr | 4 | 1.94 | okänd | okänd | 6.7 % | 2124 kr | 8 | 1204 kr |
| MATSTRUMP_sushi_offer_static_d4_v1 | 2026-08-27 | LOSER | 157 kr | 0 | okänd | okänd | okänd | 0.0 % | 36 kr | 0 | under grinden |
| MATSTRUMP_sushi_gift_ugc_s007h3_v2 | 2026-08-27 | LOSER | 130 kr | 0 | okänd | 0.8 % | 100.0 % | okänd | 3 kr | 0 | under grinden |
| MATSTRUMP_sushi_gift_ugc_s008h2_v1 | 2026-08-27 | LOSER | 98 kr | 0 | okänd | 0.5 % | 100.0 % | 9.1 % | 98 kr | 1 | under grinden |
| MATSTRUMP_sushi_gift_product_036_v1 | 2026-09-17 | LOSER | 89 kr | 0 | okänd | okänd | okänd | 0.0 % | 89 kr | 0 | under grinden |
| MATSTRUMP_sushi_curiosity_product_038_v1 | 2026-09-17 | KPI_WINNER | 70 kr | 1 | 5.66 | okänd | okänd | 100.0 % | 70 kr | 1 | under grinden |
| MATSTRUMP_sushi_gift_ugc_s004h1_v2 | 2026-08-27 | LOSER | 59 kr | 0 | okänd | 94.2 % | 7.7 % | okänd | 3 kr | 0 | under grinden |
| MATSTRUMP_sushi_gift_ugc_opush1_v1 | 2026-08-27 | LOSER | 56 kr | 0 | okänd | 0.4 % | 1700.0 % | 0.0 % | 138 kr | 0 | under grinden |
| MATSTRUMP_sushi_gift_ugc_meet_v1 | 2026-08-30 | LOSER | 46 kr | 0 | okänd | 94.2 % | 5.6 % | okänd | 5 kr | 0 | under grinden |
| MATSTRUMP_sushi_gift_ugc_haikuh1_v1 | 2026-08-27 | LOSER | 44 kr | 0 | okänd | 2.0 % | 100.0 % | okänd | 12 kr | 0 | under grinden |
| MATSTRUMP_sushi_gift_ugc_017v2h1_v1 | 2026-09-02 | LOSER | 42 kr | 0 | okänd | 87.5 % | 4.8 % | okänd | 0 kr | 0 | under grinden |
| MATSTRUMP_sushi_vandning_static_b004_v1 | 2026-08-27 | LOSER | 36 kr | 0 | okänd | okänd | okänd | 0.0 % | 19 kr | 0 | under grinden |
| MATSTRUMP_sushi_social_textheavy_033_v1 | 2026-09-17 | LOSER | 32 kr | 0 | okänd | okänd | okänd | 0.0 % | 32 kr | 0 | under grinden |
| MATSTRUMP_sushi_curiosity_product_037_v1 | 2026-09-17 | LOSER | 31 kr | 0 | okänd | okänd | okänd | okänd | 31 kr | 0 | under grinden |
| MATSTRUMP_sushi_offer_product_035_v1 | 2026-09-17 | LOSER | 28 kr | 0 | okänd | okänd | okänd | okänd | 28 kr | 0 | under grinden |
| MATSTRUMP_sushi_gift_ugc_s004h4_v2 | 2026-08-27 | LOSER | 25 kr | 0 | okänd | 4.4 % | 25.0 % | okänd | 10 kr | 0 | under grinden |
| MATSTRUMP_sushi_offer_static_d1_v1 | 2026-08-27 | LOSER | 23 kr | 0 | okänd | okänd | okänd | okänd | 36 kr | 0 | under grinden |
| MATSTRUMP_sushi_fomo_ugc_november_v1 | 2026-08-27 | LOSER | 22 kr | 0 | okänd | 91.9 % | 7.0 % | okänd | 6 kr | 0 | under grinden |
| MATSTRUMP_sushi_gift_ugc_somneth3_v1 | 2026-08-27 | LOSER | 21 kr | 0 | okänd | 93.9 % | 1.1 % | okänd | 8 kr | 0 | under grinden |
| MATSTRUMP_sushi_gift_ugc_s002h1_v2 | 2026-08-27 | LOSER | 18 kr | 0 | okänd | 96.7 % | 22.4 % | okänd | 3 kr | 0 | under grinden |
| MATSTRUMP_sushi_gift_ugc_011v2_v1 | 2026-09-02 | LOSER | 18 kr | 0 | okänd | 90.0 % | 10.0 % | okänd | 1 kr | 0 | under grinden |
| Sofie H1 Sushi Captions Ingen musik | 2026-09-17 | LOSER | 18 kr | 0 | okänd | 86.1 % | 6.9 % | 0.0 % | 18 kr | 0 | under grinden |
| MATSTRUMP_sushi_gift_ugc_010v2_v1 | 2026-09-02 | LOSER | 17 kr | 0 | okänd | 93.0 % | 5.0 % | okänd | okänd kr | 0 | under grinden |
| MATSTRUMP_sushi_gift_ugc_012v2_v1 | 2026-08-30 | LOSER | 17 kr | 0 | okänd | 3.6 % | 450.0 % | 1.1 % | 1744 kr | 2 | -1244 kr |
| MATSTRUMP_sushi_gift_ugc_020h3_v1 | 2026-09-02 | LOSER | 16 kr | 0 | okänd | 2.9 % | 400.0 % | okänd | okänd kr | 0 | under grinden |
| MATSTRUMP_sushi_gift_ugc_julstrumpa_v1 | 2026-08-27 | LOSER | 15 kr | 0 | okänd | 90.8 % | 3.4 % | 0.0 % | 13 kr | 0 | under grinden |
| MATSTRUMP_sushi_offer_static_d2_v1 | 2026-08-27 | LOSER | 15 kr | 0 | okänd | okänd | okänd | 0.0 % | 36 kr | 0 | under grinden |
| MATSTRUMP_sushi_gift_ugc_s005h2_v1 | 2026-09-02 | LOSER | 15 kr | 0 | okänd | 89.7 % | 3.8 % | okänd | okänd kr | 0 | under grinden |
| MATSTRUMP_sushi_gift_ugc_h2_v1 | 2026-08-30 | LOSER | 13 kr | 0 | okänd | 100.0 % | 7.1 % | okänd | 0 kr | 0 | under grinden |
| MATSTRUMP_sushi_gift_ugc_s006h3_v2 | 2026-08-27 | LOSER | 13 kr | 0 | okänd | 100.0 % | 10.0 % | okänd | 11 kr | 0 | under grinden |
| MATSTRUMP_sushi_anvandning_static_b002_v1 | 2026-08-27 | LOSER | 13 kr | 0 | okänd | okänd | okänd | okänd | 6 kr | 0 | under grinden |
| MATSTRUMP_sushi_gift_ugc_s003h3_v2 | 2026-08-27 | LOSER | 13 kr | 0 | okänd | 92.6 % | 8.0 % | okänd | 7 kr | 0 | under grinden |
| MATSTRUMP_sushi_gift_ugc_s008h1_v1 | 2026-08-27 | LOSER | 13 kr | 0 | okänd | 100.0 % | 16.7 % | 0.0 % | 12 kr | 0 | under grinden |
| Sofie H2 julstrumpa Sushi Captions Ingen musik | 2026-09-17 | LOSER | 12 kr | 0 | okänd | 98.3 % | 3.4 % | 0.0 % | 12 kr | 0 | under grinden |
| MATSTRUMP_sushi_identity_product_034_v1 | 2026-09-17 | LOSER | 12 kr | 0 | okänd | okänd | okänd | 0.0 % | 12 kr | 0 | under grinden |
| MATSTRUMP_sushi_gift_ugc_h1_v1 | 2026-08-30 | LOSER | 12 kr | 0 | okänd | 2.9 % | 100.0 % | okänd | 1 kr | 0 | under grinden |
| MATSTRUMP_sushi_gift_ugc_s006h2_v2 | 2026-08-27 | LOSER | 12 kr | 0 | okänd | 100.0 % | 11.5 % | okänd | 8 kr | 0 | under grinden |
| MATSTRUMP_sushi_gift_ugc_016_v1 | 2026-08-30 | LOSER | 11 kr | 0 | okänd | 96.2 % | 2.0 % | okänd | 1 kr | 0 | under grinden |
| MATSTRUMP_sushi_gift_ugc_h3_v1 | 2026-08-30 | LOSER | 10 kr | 0 | okänd | 98.0 % | 14.6 % | okänd | 3 kr | 0 | under grinden |
| MATSTRUMP_sushi_gift_ugc_021h3_v1 | 2026-09-02 | LOSER | 10 kr | 0 | okänd | 92.1 % | 2.9 % | okänd | 1 kr | 0 | under grinden |
| MATSTRUMP_sushi_gift_ugc_trodde_v1 | 2026-08-27 | INGEN_LEVERANS | 10 kr | 0 | okänd | 94.1 % | 4.2 % | okänd | 1 kr | 0 | under grinden |
| MATSTRUMP_sushi_gift_ugc_s002h2_v2 | 2026-08-27 | INGEN_LEVERANS | 9 kr | 0 | okänd | 84.6 % | 9.1 % | okänd | 0 kr | 0 | under grinden |
| MATSTRUMP_sushi_curiosity_beforeafter_030_v1 | 2026-09-17 | INGEN_LEVERANS | 8 kr | 0 | okänd | okänd | okänd | 0.0 % | 8 kr | 0 | under grinden |
| MATSTRUMP_sushi_skamt_static_c_v1 | 2026-08-27 | INGEN_LEVERANS | 7 kr | 0 | okänd | okänd | okänd | okänd | 2 kr | 0 | under grinden |
| MATSTRUMP_sushi_gift_ugc_s009h1_v1 | 2026-08-27 | INGEN_LEVERANS | 7 kr | 0 | okänd | 100.0 % | 4.5 % | okänd | 4 kr | 0 | under grinden |
| MATSTRUMP_sushi_gift_ugc_017v1h3_v1 | 2026-09-02 | INGEN_LEVERANS | 5 kr | 0 | okänd | 85.7 % | okänd | okänd | okänd kr | 0 | under grinden |
| MATSTRUMP_sushi_gift_ugc_013_v1 | 2026-08-30 | INGEN_LEVERANS | 5 kr | 0 | okänd | 83.3 % | 20.0 % | 0.0 % | 18 kr | 0 | under grinden |
| MATSTRUMP_sushi_gift_ugc_019h1_v1 | 2026-09-02 | INGEN_LEVERANS | 5 kr | 0 | okänd | 92.9 % | okänd | okänd | okänd kr | 0 | under grinden |
| MATSTRUMP_sushi_gift_static_b001_v1 | 2026-08-27 | INGEN_LEVERANS | 5 kr | 0 | okänd | okänd | okänd | okänd | 7 kr | 0 | under grinden |
| MATSTRUMP_sushi_gift_ugc_020h1_v1 | 2026-09-02 | INGEN_LEVERANS | 4 kr | 1 | 90.48 | 94.7 % | 5.6 % | okänd | 0 kr | 0 | under grinden |
| MATSTRUMP_sushi_gift_ugc_017v2h2_v1 | 2026-09-02 | INGEN_LEVERANS | 4 kr | 0 | okänd | 100.0 % | okänd | okänd | okänd kr | 0 | under grinden |
| MATSTRUMP_sushi_gift_ugc_somneth2_v1 | 2026-08-27 | INGEN_LEVERANS | 4 kr | 0 | okänd | 100.0 % | 16.7 % | okänd | 2 kr | 0 | under grinden |
| MATSTRUMP_sushi_curiosity_product_029_v1 | 2026-09-17 | INGEN_LEVERANS | 4 kr | 0 | okänd | okänd | okänd | okänd | 4 kr | 0 | under grinden |
| MATSTRUMP_sushi_gift_ugc_020h2_v1 | 2026-09-02 | INGEN_LEVERANS | 3 kr | 0 | okänd | 100.0 % | okänd | okänd | okänd kr | 0 | under grinden |
| MATSTRUMP_sushi_gift_ugc_somneth1_v1 | 2026-08-27 | INGEN_LEVERANS | 3 kr | 0 | okänd | 100.0 % | 33.3 % | okänd | 2 kr | 0 | under grinden |
| MATSTRUMP_sushi_gift_ugc_019h3_v1 | 2026-09-02 | INGEN_LEVERANS | 3 kr | 0 | okänd | 100.0 % | okänd | okänd | okänd kr | 0 | under grinden |
| MATSTRUMP_sushi_gift_ugc_s009h2_v1 | 2026-08-27 | INGEN_LEVERANS | 2 kr | 0 | okänd | 12.5 % | 100.0 % | 0.0 % | 2 kr | 0 | under grinden |
| MATSTRUMP_sushi_gift_ugc_s007h1_v2 | 2026-08-27 | INGEN_LEVERANS | 2 kr | 0 | okänd | 57.1 % | 100.0 % | okänd | 0 kr | 0 | under grinden |
| MATSTRUMP_sushi_vandning_static_b005_v1 | 2026-08-27 | INGEN_LEVERANS | 2 kr | 0 | okänd | okänd | okänd | okänd | 3 kr | 0 | under grinden |
| MATSTRUMP_sushi_gift_ugc_012_v1 | 2026-08-30 | INGEN_LEVERANS | 2 kr | 0 | okänd | 100.0 % | 20.0 % | okänd | 1 kr | 0 | under grinden |
| MATSTRUMP_sushi_gift_ugc_s008h3_v1 | 2026-08-27 | INGEN_LEVERANS | 2 kr | 0 | okänd | 100.0 % | 40.0 % | okänd | 3 kr | 0 | under grinden |
| MATSTRUMP_sushi_gift_ugc_s002h3_v2 | 2026-08-27 | INGEN_LEVERANS | 2 kr | 0 | okänd | 80.0 % | 25.0 % | okänd | 1 kr | 0 | under grinden |
| MATSTRUMP_sushi_position_static_f_v1 | 2026-08-27 | INGEN_LEVERANS | 2 kr | 0 | okänd | okänd | okänd | okänd | 0 kr | 0 | under grinden |
| MATSTRUMP_sushi_gift_ugc_s005h3_v1 | 2026-09-02 | INGEN_LEVERANS | 2 kr | 0 | okänd | 100.0 % | okänd | okänd | okänd kr | 0 | under grinden |
| MATSTRUMP_sushi_gift_ugc_017v2h3_v1 | 2026-09-02 | INGEN_LEVERANS | 1 kr | 0 | okänd | 100.0 % | okänd | okänd | okänd kr | 0 | under grinden |
| MATSTRUMP_sushi_gift_ugc_s005h1_v1 | 2026-09-02 | INGEN_LEVERANS | 1 kr | 0 | okänd | 75.0 % | okänd | okänd | 0 kr | 0 | under grinden |
| MATSTRUMP_sushi_gift_ugc_s006h1_v2 | 2026-08-27 | INGEN_LEVERANS | 1 kr | 0 | okänd | 100.0 % | 11.1 % | okänd | 2 kr | 0 | under grinden |
| MATSTRUMP_sushi_pris_static_b003_v1 | 2026-08-27 | INGEN_LEVERANS | 1 kr | 0 | okänd | okänd | okänd | okänd | 4 kr | 0 | under grinden |
| MATSTRUMP_sushi_gift_ugc_s004h3_v2 | 2026-08-27 | INGEN_LEVERANS | 1 kr | 0 | okänd | 100.0 % | 33.3 % | okänd | okänd kr | 0 | under grinden |
| MATSTRUMP_sushi_gift_ugc_017v1h2_v1 | 2026-09-02 | INGEN_LEVERANS | 1 kr | 0 | okänd | 83.3 % | okänd | okänd | okänd kr | 0 | under grinden |
| MATSTRUMP_sushi_gift_ugc_s009h3_v1 | 2026-08-27 | INGEN_LEVERANS | 1 kr | 0 | okänd | 100.0 % | okänd | okänd | 2 kr | 0 | under grinden |
| MATSTRUMP_sushi_conflict_comparison_032_v1 | 2026-09-17 | INGEN_LEVERANS | 1 kr | 0 | okänd | okänd | okänd | okänd | 1 kr | 0 | under grinden |
| MATSTRUMP_sushi_pain_lifestyle_031_v1 | 2026-09-17 | INGEN_LEVERANS | 1 kr | 0 | okänd | okänd | okänd | okänd | 1 kr | 0 | under grinden |
| MATSTRUMP_sushi_gift_ugc_s007h2_v2 | 2026-08-27 | INGEN_LEVERANS | 1 kr | 0 | okänd | 100.0 % | okänd | okänd | 0 kr | 0 | under grinden |
| MATSTRUMP_sushi_gift_ugc_017v1h1_v1 | 2026-09-02 | INGEN_LEVERANS | 0 kr | 0 | okänd | 100.0 % | okänd | okänd | okänd kr | 0 | under grinden |
| MATSTRUMP_sushi_gift_ugc_021h1_v1 | 2026-09-02 | INGEN_LEVERANS | 0 kr | 0 | okänd | 100.0 % | okänd | okänd | okänd kr | 0 | under grinden |
| MATSTRUMP_sushi_gift_ugc_021h2_v1 | 2026-09-02 | INGEN_LEVERANS | 0 kr | 0 | okänd | 100.0 % | 25.0 % | okänd | okänd kr | 0 | under grinden |
| MATSTRUMP_sushi_gift_ugc_019h2_v1 | 2026-09-02 | INGEN_LEVERANS | 0 kr | 0 | okänd | 100.0 % | okänd | okänd | okänd kr | 0 | under grinden |
| MATSTRUMP_sushi_gift_ugc_s003h2_v2 | 2026-08-27 | INGEN_LEVERANS | 0 kr | 0 | okänd | okänd | okänd | okänd | okänd kr | 0 | under grinden |
| MATSTRUMP_sushi_gift_ugc_s004h2_v2 | 2026-08-27 | INGEN_LEVERANS | 0 kr | 0 | okänd | 33.3 % | 100.0 % | okänd | 0 kr | 0 | under grinden |
| MATSTRUMP_sushi_gift_ugc_s003h1_v2 | 2026-08-27 | INGEN_LEVERANS | 0 kr | 0 | okänd | 100.0 % | okänd | okänd | 0 kr | 0 | under grinden |
