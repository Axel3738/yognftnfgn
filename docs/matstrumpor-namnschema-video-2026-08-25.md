# Namnschema: UGC-videotestet (script 001–007) — 2026-08-25

Axel laddar upp 17 videor i mediebiblioteket (13 + fyra 004:or som tillkom) (Matstrumpor creative hub-serien).
Detta dokument är facit för hur de döps och struktureras på Meta. Följer
`docs/naming-convention.md`; vokabulären där är uppdaterad med fälten nedan.

## Testmatrisen

Variabeln som testas är **scriptet** (6 koncept), sekundärt **hooken** (1–4
varianter per script). Allt annat hålls konstant — samma produkt (sushi), samma
format (UGC-voiceover), samma primärtext, samma rubrik.

**Primärtext för ALLA 17 annonser: Paket E1** (`docs/matstrumpor-copy-2026-08-24.md`).
Motivering: scripten säljer redan exakt E-dilemmat — 001 och 004 säger ordagrant
"den perfekta balansen mellan **praktiskt och oväntat**" — och med texten konstant
är videon den enda variabeln (naming-konventionens regel 2).
Rubrik: **"Rolig i kväll. På fötterna i morgon."** · Beskrivning: **"4 sorter. Köp 1, få 1. Fri frakt i Sverige."**

## Strukturen

```
KAMPANJ  MATSTRUMP_SALES_{YYYYMMDD}         ← datum = launchdagen. ABO, aldrig CBO (regel 11).
ADSET    broad_advplus_purchase_s{NNN}      ← ett adset per script, lika dagsbudget per adset
AD       MATSTRUMP_sushi_gift_ugc_s{NNN}h{N}_v1
```

- Sex adsets: `…_s001`, `…_s002`, `…_s003`, `…_s004`, `…_s006`, `…_s007`. Hookvarianterna
  ligger som annonser i sitt scripts adset. Lika budget per adset är närmaste
  praktiska tolkning av "lika budget per annons" när 001 bara har en hook —
  scriptet är primärvariabeln och ska ha lika villkor.
- `gift` = vinkeln (presentköp) för hela serien. `ugc` = formatet.
  Hook-fältet `s{NNN}h{N}` kodar script + hookvariant och gör datan skärbar
  per script OCH per hook i efterhand.
- Allt är `v1`. Före launch: läs av att inga MATSTRUMP-namn redan är upptagna i
  kontot som väljs (regel 8).

## Mappningen fil → annonsnamn

| Fil i mediebiblioteket | Annonsnamn |
|---|---|
| 001 HOOK 1 | `MATSTRUMP_sushi_gift_ugc_s001h1_v1` |
| 002 HOOK 1 | `MATSTRUMP_sushi_gift_ugc_s002h1_v1` |
| 002 HOOK 2 | `MATSTRUMP_sushi_gift_ugc_s002h2_v1` |
| 002 HOOK 3 | `MATSTRUMP_sushi_gift_ugc_s002h3_v1` |
| 003 HOOK 1 | `MATSTRUMP_sushi_gift_ugc_s003h1_v1` |
| 003 HOOK 2 | `MATSTRUMP_sushi_gift_ugc_s003h2_v1` |
| 003 HOOK 3 | `MATSTRUMP_sushi_gift_ugc_s003h3_v1` |
| 004 HOOK 1–4 | `MATSTRUMP_sushi_gift_ugc_s004h1_v1` → `…_s004h4_v1` |
| 006_H1 | `MATSTRUMP_sushi_gift_ugc_s006h1_v1` |
| 006_H2 | `MATSTRUMP_sushi_gift_ugc_s006h2_v1` |
| 006_H3 | `MATSTRUMP_sushi_gift_ugc_s006h3_v1` |
| 007_H1 | `MATSTRUMP_sushi_gift_ugc_s007h1_v1` |
| 007_H2 | `MATSTRUMP_sushi_gift_ugc_s007h2_v1` |
| 007_H3 | `MATSTRUMP_sushi_gift_ugc_s007h3_v1` |

## Vad scripten är (fylls på när brief-PDF:erna delas)

Källa: Notion-hubben "Matstrumpor creative hub" + Drive-brieferna
(`Sushistrumpor_{NNN}.pdf`). Bara 001 och 004 är läsbara för kopplingen i dag —
002, 003, 006, 007 ligger i mappar som inte delats med business-kontot.

| Script | Titel | Innehåll | Hookar |
|---|---|---|---|
| 001 | "Annons 001" | Grundarberättelse: panikletandet i sista sekund → strumpor är det alla går kort om → "praktiskt och oväntat" | 1 |
| 002 | ? | ej läsbar — döps ändå rätt via tabellen ovan | 3 |
| 003 | ? | ej läsbar | 3 |
| 004 | "Kuvertet vs paketet" | Anti-pengar-i-kort: "offrar titeln \"hon har verkligen tänkt till\"" → favoriträtten tar bort gissningen. Uppladdad i annonskontot 2026-08-25. | 4 |
| 006 | ? | ej läsbar | 3 |
| 007 | ? | ej läsbar | 3 |

**Antagande som Axel ska kunna dementera:** hela serien är sushi + presentvinkel
(verifierat i 001 och 004). Är något av 002/003/006/007 en annan produkt eller
vinkel → säg till FÖRE launch, så byts `sushi`/`gift`-fältet för de annonserna.
Namn ändras aldrig efter att en annons fått data — då är det `v2` som gäller.

## Kontofakta (verifierade via Meta API 2026-08-25)

| Vad | Värde |
|---|---|
| Ad account | **nya kungen** `730973156224390` — businessen **Matstrumpor.se** (`3354502211392342`), ACTIVE, SEK, betalmetod finns |
| Sida | **Matstrumpor.se** `820358954504320` (gamla annonsernas sida — businessen har även "Matstrumpor" `1285064981363590`) |
| Pixel | **MATSTRUMPIRUMPIDUMPI** `1785935302094082` — enda dataset i businessen. ⚠️ Ägs tekniskt av SnarkLös-BM:en (historiskt), men är matstrumpors egen och delad hit. |
| promoted_object för adseten | `{"pixel_id":"1785935302094082","custom_event_type":"PURCHASE"}` |
| Targeting | `{"geo_locations":{"countries":["SE"]}}` broad, Advantage+ audience på |
| Adset-budget | 200 kr/dag per adset som startförslag — Axel sätter siffran före launch |

## Byggstatus (2026-08-25, senare samma dag — ALLT PAUSED)

Script 004 ("Kuvertet vs paketet", 4 hookar) tillkom i uppladdningen → 6 adsets, 17 annonser totalt.

| Objekt | ID | Läge |
|---|---|---|
| Kampanj `MATSTRUMP_SALES_20260825` | `120251184321350023` | ✅ skapad, ABO |
| Adset s001 | `120251184322770023` | ✅ 200 kr/dag |
| Adset s002 | `120251184472730023` | ✅ 200 kr/dag |
| Adset s003 | `120251184325910023` | ✅ 200 kr/dag |
| Adset s004 | `120251184337530023` | ✅ 200 kr/dag |
| Adset s006 | `120251184493410023` | ✅ 200 kr/dag |
| Adset s007 | `120251184332090023` | ✅ 200 kr/dag |
| Annons `…_s004h1_v1` | `120251184398370023` | ✅ i s004 |
| Annons `…_s004h2_v1` | `120251184411590023` | ✅ i s004 |
| Annons `…_s004h3_v1` | `120251184533510023` | ✅ i s004 (efter pixelfixen) |
| Annons `…_s004h4_v1` | `120251184534120023` | ✅ i s004 |
| Annons `…_s001h1_v1` | `120251184825310023` | ✅ i s001 |
| Annons `…_s002h1_v1` | `120251184831320023` | ✅ i s002 |
| Annons `…_s002h2_v1` | `120251184836680023` | ✅ i s002 |
| Annons `…_s002h3_v1` | `120251184839900023` | ✅ i s002 |
| Annons `…_s003h1_v1` | `120251184844360023` | ✅ i s003 |
| Annons `…_s003h2_v1` | `120251184848190023` | ✅ i s003 |
| Annons `…_s003h3_v1` | `120251184849760023` | ✅ i s003 |
| Annons `…_s006h1_v1` | `120251184852030023` | ✅ i s006 |
| Annons `…_s006h2_v1` | `120251184857360023` | ✅ i s006 |
| Annons `…_s006h3_v1` | `120251184861480023` | ✅ i s006 |
| Annons `…_s007h1_v1` | `120251184863480023` | ✅ i s007 |
| Annons `…_s007h2_v1` | `120251184864610023` | ✅ i s007 |
| Annons `…_s007h3_v1` | `120251184865930023` | ✅ i s007 |

Alla adsets: broad SE, Advantage+ audience, OFFSITE_CONVERSIONS/PURCHASE mot pixeln,
attribution 7d klick + 1d visning, DSA-fälten "Matstrumpor.se". Annonserna: primärtext E1,
rubrik "Rolig i kväll. På fötterna i morgon.", SHOP_NOW → /products/sushi-strumpor.

## KOMPLETT 2026-08-25: alla 17 annonser skapade, allt PAUSED

Kampanjen är redo att aktiveras av Axel. Nya creatives (s001–s003, s006–s007)
skapades med `self_ai_disclosure: OPT_OUT` (Axel bekräftade: inget AI-material).
Totalbudget om allt aktiveras: 6 × 200 kr = 1 200 kr/dag.

## Blockers före launch (historik — alla lösta)

1. **LÖST 2026-08-25: pixeln tilldelad annonskontot av Axel** — annonsskapandet funkar igen. Ursprungsfelet:  Meta-fel vid annonsskapande:
   *"Account 730973156224390 does not have access to pixel 1785935302094082"* —
   pixeln är delad till Matstrumpor-businessen men inte kopplad till kontot
   "nya kungen". **Axels fix i Business Manager:** Företagsinställningar →
   Datakällor → Pixlar → MATSTRUMPIRUMPIDUMPI → Kopplade tillgångar → lägg till
   annonskontot "nya kungen". Utan detta kan kampanjen inte aktiveras alls.
2. **Shopify-kopplingen:** Axel säger sig ha återkopplat pixeln till butiken
   2026-08-25 — verifiera med ett `last_fired_time`-anrop när trafik kommit.
3. **LÖST: alla 17 videor i annonskontot** (Axel hade först laddat upp i fel konto — API-koll mot rätt konto avslöjade det). Gamla texten: 13 videor saknas i annonskontots bibliotek (001×1, 002×3, 003×3, 006×3,
   007×3). 004:orna laddades upp rätt väg (Ads Manager) — gör likadant med resten.
   Business Suite-uppladdningar hamnar på sidan, inte i annonskontot.
4. **AI-frågan BESVARAD: ingen AI i videorna** (Axel 2026-08-25) — nya creatives sätter `self_ai_disclosure: OPT_OUT`. Gamla regeln kvar för framtida material:  innehåller videorna AI-genererat material ska
   creatives skapas med AI-disclosure (`OPT_IN`) — det går INTE att sätta i
   efterhand, då görs creatives om. Axel måste svara innan aktivering.
5. Sessionens behörighetsklassificerare blockerade ungefär hälften av
   API-anropen slumpartat — omförsök gick igenom. Räkna med samma sak vid
   nästa byggrunda.

## AI-märkning

Innehåller videorna AI-genererat material (Higgsfield/HeyGen-klipp, AI-bilder):
kryssa i Metas AI-disclosure-toggle vid uppladdning. Gäller per video.

---

## Kampanj 2: post-ID-återanvändning i ett adset (2026-08-26)

Axels beställning: ta post-ID från de 17 befintliga annonserna och bygg om dem
som **befintliga inlägg** i en ny kampanj med ETT adset. Poängen är att
engagemanget (likes, kommentarer, delningar) följer med annonsen i stället för
att nollställas — nya creatives startar alltid på noll.

| Objekt | ID | Läge |
|---|---|---|
| Kampanj `MATSTRUMP_SALES_20260826` | `120251217860260023` | PAUSED |
| Adset `broad_advplus_purchase_alla17` | `120251217861060023` | PAUSED, **1 000 kr/dag** |
| 17 annonser `…_v2` | se tabell nedan | PAUSED / under Metas granskning |

Alla annonser skapade med `creative: {object_story_id: "<page>_<post>"}` →
Meta bekräftar `creative_summary: "Existing post"` på varje.

| Annons | Nytt ad-ID | Post-ID (inlägget som återanvänds) |
|---|---|---|
| `…_s001h1_v2` | 120251217863240023 | 820358954504320_122138145573154794 |
| `…_s002h1_v2` | 120251217866510023 | 820358954504320_122138145651154794 |
| `…_s002h2_v2` | 120251217867700023 | 820358954504320_122138145699154794 |
| `…_s002h3_v2` | 120251217868470023 | 820358954504320_122138145801154794 |
| `…_s003h1_v2` | 120251217869230023 | 820358954504320_122138145861154794 |
| `…_s003h2_v2` | 120251217871580023 | 820358954504320_122138145975154794 |
| `…_s003h3_v2` | 120251217872180023 | 820358954504320_122138146059154794 |
| `…_s004h1_v2` | 120251217872830023 | 820358954504320_122138143629154794 |
| `…_s004h2_v2` | 120251217873790023 | 820358954504320_122138143779154794 |
| `…_s004h3_v2` | 120251217874500023 | 820358954504320_122138143941154794 |
| `…_s004h4_v2` | 120251217875930023 | 820358954504320_122138144043154794 |
| `…_s006h1_v2` | 120251217876730023 | 820358954504320_122138146167154794 |
| `…_s006h2_v2` | 120251217877630023 | 820358954504320_122138146275154794 |
| `…_s006h3_v2` | 120251217878500023 | 820358954504320_122138146311154794 |
| `…_s007h1_v2` | 120251217879450023 | 820358954504320_122138146545154794 |
| `…_s007h2_v2` | 120251217880040023 | 820358954504320_122138146629154794 |
| `…_s007h3_v2` | 120251217880730023 | 820358954504320_122138146731154794 |

### ⚠️ Måste göras innan den nya kampanjen aktiveras

1. **Pausa den gamla kampanjen** `MATSTRUMP_SALES_20260825` (`120251184321350023`).
   Kör båda samtidigt budar samma 17 creatives mot samma broad SE-publik i samma
   auktion → dyrare CPM och splittrad data. Aldrig båda igång.
2. **Bestäm budget.** 1 000 kr/dag är satt som utgångspunkt (Axel sa "1 000 eller
   2 000") — ändras på adsetet före aktivering.

### Konsekvens för testläsbarheten (Axels beslut, dokumenterat)

Regel 11 säger lika budget per annons i ett test-ABO. **Ett adset med 17 annonser
ger inte det** — Meta fördelar budgeten själv och lägger den typiskt på 2–4
annonser. Det gör att svaga script aldrig får data, och att "script A slog script
B" inte längre går att säga med säkerhet. Bytet är medvetet: snabbare väg till en
vinnare + samlat engagemang, mot sämre jämförbarhet mellan scripten.
Namnen är bumpade till `v2` så gammal och ny struktur går att skilja i insights.

---

## Adset 2 i samma kampanj: de 16 nya videorna (2026-08-27)

Axels beställning: "Nu ska dessa laddas upp i den nya CBO och läggas i ett nytt
eget adset." Videorna låg redan i mediebiblioteket på `nya kungen`
(`730973156224390`).

| Objekt | ID | Läge |
|---|---|---|
| Kampanj `MATSTRUMP_SALES_20260826` | `120251217860260023` | PAUSED (samma som ovan) |
| Adset `broad_advplus_purchase_nya16` | `120251218118710023` | PAUSED, **1 000 kr/dag** |
| 16 annonser `…_v1` | se tabell nedan | PAUSED |

Adsetet är byggt likadant som `…_alla17`: broad Sverige, Advantage+ Audience,
optimering `OFFSITE_CONVERSIONS` mot pixel `1785935302094082`, ingen
intressetargeting.

**Skillnad mot adset 1:** de här 16 är *nya* creatives och har inget engagemang
att ärva, så de är skapade inline med `object_story_spec` + `video_data`
(video_id + thumbnail), inte som befintliga inlägg. Thumbnail är obligatorisk —
utan `image_url` faller anropet på fel 1443226.

| Annons | Ad-ID | Video-ID | Källa i mediebiblioteket |
|---|---|---|---|
| `MATSTRUMP_sushi_gift_ugc_s008h1_v1` | 120251218122850023 | 1448657477320973 | 008 Sushi_H1 |
| `MATSTRUMP_sushi_gift_ugc_s008h2_v1` | 120251218130540023 | 1453564173263279 | 008 Sushi_H2 |
| `MATSTRUMP_sushi_gift_ugc_s008h3_v1` | 120251218132800023 | 1364297669149428 | 008 Sushi_H3 |
| `MATSTRUMP_sushi_gift_ugc_s009h1_v1` | 120251218134500023 | 2991564441203253 | 009 HOOK 1 |
| `MATSTRUMP_sushi_gift_ugc_s009h2_v1` | 120251218158740023 | 1560184536138262 | 009 HOOK 2 |
| `MATSTRUMP_sushi_gift_ugc_s009h3_v1` | 120251218161020023 | 2692955411160930 | 009 HOOK 3 |
| `MATSTRUMP_sushi_fomo_ugc_november_v1` | 120251218163340023 | 1782871483130482 | 014 |
| `MATSTRUMP_sushi_gift_ugc_julstrumpa_v1` | 120251218165480023 | 1079866044593423 | 015_H1 |
| `MATSTRUMP_sushi_gift_ugc_trodde_v1` | 120251218167200023 | 1349450110603264 | 015_H2 |
| `MATSTRUMP_sushi_gift_ugc_haikuh1_v1` | 120251218168880023 | 28702519579344925 | haiku H1 |
| `MATSTRUMP_sushi_gift_ugc_haikuh2_v1` | 120251218171220023 | 2001355903882423 | haiku H2 |
| `MATSTRUMP_sushi_gift_ugc_haikuh3_v1` | 120251218173400023 | 1081888994347701 | haiku H3 |
| `MATSTRUMP_sushi_gift_ugc_opush1_v1` | 120251218175800023 | 29043331745252475 | opus 3 HOOK 1 |
| `MATSTRUMP_sushi_gift_ugc_somneth1_v1` | 120251218179080023 | 1618982373104869 | Somnet 5 HOOK 1 |
| `MATSTRUMP_sushi_gift_ugc_somneth2_v1` | 120251218181400023 | 1567253058467110 | Somnet 5 HOOK 2 |
| `MATSTRUMP_sushi_gift_ugc_somneth3_v1` | 120251218187860023 | 2322095285276379 | Somnet 5 HOOK 3 |

**004-videorna i biblioteket är uteslutna** — de är samma filer som redan ligger
som `…_s004h1–h4` i adset 1. Att lägga dem i båda adseten hade fått dem att bjuda
mot sig själva.

### Copy: identisk på alla 16

Creativen är enda variabeln, så texten är låst över hela adsetet:

- **Primärtext:** "Ingen jublar åt tvättmedel. Ingen sparar en skämtpryl. / Svaret
  på båda: en låda som ser ut som riktig takeaway, 5 par rullade som maki,
  ätpinnar i trä bredvid. / Den ligger inte kvar i lådan efteråt – den ligger på
  fötterna, vecka efter vecka."
- **Rubrik:** "Rolig i kväll. På fötterna i morgon."
- **Beskrivning:** "4 sorter. Köp 1, få 1. Fri frakt i Sverige."
- **CTA:** SHOP_NOW → https://matstrumpor.se/products/sushi-strumpor

### ⚠️ Öppet innan aktivering

1. **AI-märkningen är INTE satt på de här 16.** Axels "nej det gör dom inte"
   gällde de ursprungliga 17. Innehåller någon av de nya videorna AI-genererat
   material måste `self_ai_disclosure` sättas — det är annonsörens beslut, aldrig
   vårt.
2. **Total dagsbudget blir 2 000 kr** om båda adseten (`…_alla17` +
   `…_nya16`) aktiveras samtidigt. Kampanjen är CBO-lös: budgeten sitter per
   adset.
3. Den gamla kampanjen `MATSTRUMP_SALES_20260825` ska fortfarande pausas först.

---

## Adset 3: bildannonserna (2026-08-27)

| Objekt | ID | Läge |
|---|---|---|
| Adset `broad_advplus_purchase_bilder` | `120251218829760023` | PAUSED, **1 000 kr/dag** |
| 11 bildannonser | se tabell | PAUSED |

Samma uppsättning som de andra två adseten: broad Sverige, Advantage+ Audience,
`OFFSITE_CONVERSIONS` mot pixel `1785935302094082`, ingen intressetargeting.
Bilderna låg redan i kontots bildbibliotek — skapade som `link_data` med
`image_hash`.

**Varje annons har EGEN copy.** Ligger de i samma adset med samma text mäter vi
ingenting: då är bilden enda variabeln på pappret men budskapet blir det som
avgör. En vinkel per bild.

| Annons | Ad-ID | Bild | Vinkel |
|---|---|---|---|
| `…_gift_static_b001_v1` | 120251218947790023 | B001 | Mottagaren som sagt "köp inget åt mig" |
| `…_anvandning_static_b002_v1` | 120251218950670023 | b002 | Används efteråt, inte en engångspryl |
| `…_pris_static_b003_v1` | 120251218953150023 | b003 | Prisvärdet: 399 kr / 5 par |
| `…_vandning_static_b004_v1` | 120251218955330023 | b004 | Ätpinnarna redo, inget att äta |
| `…_vandning_static_b005_v1` | 120251218957170023 | b005 | Räkna bitarna — ingen är sushi |
| `…_skamt_static_c_v1` | 120251218959540023 | C | Bygger vidare på "sushin är slut" |
| `…_offer_static_d1_v1` | 120251218961180023 | D1 | En att ge bort, en att behålla |
| `…_offer_static_d2_v1` | 120251218962240023 | D2 | Lådan är skämtet, tio par är utfallet |
| `…_offer_static_d3_v1` | 120251218963520023 | D3 | Volym: fyra lådor |
| `…_offer_static_d4_v1` | 120251218965690023 | D4 | En syns, två landar |
| `…_position_static_f_v1` | 120251218967850023 | F | Kärnpositionen: skratt + används |

### ⚠️ D3 lovar ett annat erbjudande än resten

D3:s bild säger **"KÖP 2 – FÅ 2 GRATIS"**. Alla andra säger **"KÖP 1 – FÅ 1"**,
och `products.json`/DNA:t känner bara till Köp 1 Få 1. Copyn följer bilden, men
**stämmer inte erbjudandet på sajten är det ett falskt löfte i en publicerad
annons** — då ska bilden göras om, inte texten. Obesvarat av Axel 2026-08-27.

### Lagerannonsen saknas ännu

Annons 018 (lagerbilden + långtexten) ska in i samma adset. Fotot ligger inte i
mediebiblioteket — Axel laddar upp det som `lagerbild`, sedan kopplas annonsen.

### Priset verifierat mot sajten 2026-08-27

`Sushi-Strumpor` har **två varianter**: `5 - Par = 399 kr` och `3 - Par = 369 kr`.
Det avgör den öppna frågan i 018: **369 kr är ett 3-parspaket**, inte styckpris
vid tre lådor. 3-parsvarianten är dock sämre värde per par (123 kr/par mot 80) —
värt att titta på, men rör inte copyn.

### Total dagsbudget

Tre adsets à 1 000 kr = **3 000 kr/dag** om alla aktiveras samtidigt.
Budgeten sitter per adset, kampanjen är CBO-lös.
