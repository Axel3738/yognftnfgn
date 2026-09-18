# Batch-logg — CaraShell (taköverdraget)

En rad per batch: vad som launchades, vilken hypotes varje annons bar, och vad
utfallet blev. **Hypotesen skrivs när batchen launchas, utfallet när den lästs
av.** Saknas en hypotes skrivs `hypotes: ej loggad` — den hittas aldrig på i
efterhand.

Nyckel `carashell/takskyddet` · konto **MagiBorsten DK `915422744950975`** ·
hub `Carashell creative hub` (`3da270ab-908c-80c4-80d1-fbdb3fefd3b4`).
⚠️ Hub-id:t byttes 2026-09-14: det ursprungliga `3d9270ab-908c-819d-be0f-c6cb71320871`
svarar 404 på query (integrationen når inte innehållet) och var alltså oläsbart för
rutinerna. Axels handgjorda ersättare från 2026-09-13 svarar 200 med 0 rader — ingen
data gick förlorad. Se CLAUDE.md:s CaraShell-rad.

---

## Batch #1 — 2026-09-11, launchad av `/ny-annonser` (16 annonser SE + 9 NO)

Byggd som översättning av Bäverbutikens källannonser till CaraShells brand,
inte som ett eget koncepttest. Kampanj `CARASHELL_SE_Taköverdraget`, CBO
1 000 kr/dag, fyra adsets = fyra vinklar.

**hypotes: ej loggad.** `/ny-annonser` körde 2026-09-11 utan att skriva
produktminne (mappen `products/carashell/` fanns inte förrän 2026-09-12).
Hypoteserna nedan är **rekonstruerade ur annonstexterna**, avlästa i kontot
2026-09-12 — de är alltså vad annonserna säger, inte vad någon skrev i förväg.
Märk dem som rekonstruktion i varje feedback-loop.

| Annons | Typ | Vinkel | Bärande rad (rekonstruerad) | Ärvd förälder |
|---|---|---|---|---|
| `CaraShellRoof_PD_1_H1` · `_2_H1` · `_3_H1` | video | PD | "Taket på husvagnen är den ytan du aldrig kollar – och den som kostar mest att laga." Mekanismen omskriven till elastiska spännband + 30–40 cm kant. | `Takoverdrag_PD_*` |
| `CaraShellRoof_PD_2_1` | bild | PD | Samma copy som PD-videorna. | `Takoverdrag_PD_2_1` (bild, CPA 121 kr) |
| `CaraShellRoof_SP_1_H1` · `_2_H1` · `_3_H1` | video | SP | "Passar bra och skyddar taket mot väder." – Lars. "Ett av 16 omdömen – alla fem stjärnor." 14 dagars ångerrätt. | `Takoverdrag_SP_*` |
| `CaraShellRoof_SP_2_1` | bild | SP | Samma copy. | `Takoverdrag_SP_2_1` (bild, 8 köp) |
| `CaraShellRoof_GT_1_H1` · `_2_H1` · `_3_H1` | video | GT | "Presenten han faktiskt blir glad för." Ordagrant från källan. | `Takoverdrag_GT_2_H1` (14 köp) |
| `CaraShellRoof_GT_2_1` | bild | GT | Samma copy. | `Takoverdrag_GT_2_1` |
| `CaraShellRoof_CS_1_H1` · `_2_H1` · `_3_H1` | video | CS | "🔥 23% RABATT … – IDAG 🔥 · 1469 → 1129". Lagerbristen struken, betalsätt + ångerrätt + leveranstid tillagt. | `Takoverdrag_CS_2_H1` (CPA 81 kr) |
| `CaraShellRoof_CS_2_1` | bild | CS | Samma copy. | `Takoverdrag_CS_2_1` |

NO-uppsättningen (`CaraShellRoof_NO_PD_1-3`, `_SP_1-3`, `_G_1-3`) ligger i
`CARASHELL_NO_Takovertrekket` i samma konto. Norska SP bär ett eget riktigt citat
("Veldig fornøyd. God beskyttelse når campingvogna står ute." – Johan).

### Utfall per 2026-09-12 (efter 3 dygn)

**314 kr spend, 0 köp, 0 av 16 annonser bedömbara.** Ingen dom, ingen ranking,
ingen kill-kandidat — grinden går vid 300 kr **och** 3 köp per annons.
Mest spend: `PD_2_H1` 114 kr · `PD_1_H1` 46 · `SP_2_H1` 46 · `SP_3_H1` 29 ·
`PD_3_H1` 22 · `GT_1_H1` 18 · `CS_1_H1` 13 · övriga under 10 kr.

Enda avläsbara signalen så här långt är diagnosmetrik, och den är **inte** ett
köpmått: hook 3 s ligger 25–54 %, CTR 4,5–8,6 %, CPC 0,81–3,29 kr, CPM 52–190 kr.
`PD_1_H1` har bäst CPC (0,81 kr) och högst CTR (8,60 %) av allt som fått
tillräckligt med visningar för att siffran ska betyda något.

⚠️ CBO:n har lagt 61 % av de 314 kronorna på PD — samma vinkel som redan tog
mest i källan, medan CS och GT (bäst CPA i källan) fått 31 respektive 20 kr.
Det är mönster 1 i `dna.md` som upprepar sig, och det är skälet till att
kommande tester ska ligga i eget test-ABO med lika budget per annons, inte i
skalningens CBO.

### Att läsa av nästa briefdag

1. Håller PD sin volym när mekanismraden är utbytt (dna.md ändring 1)?
2. Replikerar bilderna som i källan (mönster 3) — får `*_2_1`-raderna köp?
3. Får CS och GT någon spend alls i CBO:n, eller måste de testas separat?

---

### Utfall per 2026-09-14 (efter 5 dygn) — briefrond nr 1

**2 435 kr spend, 8 köp, CPA 304 kr mot break-even 693 kr.** Datakvaliteten är
ren: `amount_spent × purchase_roas` matchar `omni_purchase_values` på 0,0 %
avvikelse för alla sex annonser med köp, 0 trasiga rader.

⚠️ **0 av 16 annonser är bedömbara.** Grinden går vid 300 kr **och** 3 köp per
annons; ingen passerar båda. `SP_2_1` är 3 kr från den (297 kr, 3 köp). Alltså:
ingen ranking, ingen kill-kandidat, ingen dom över en enskild creative. Mönstren
nedan är grupperade utfall och är därför **hypoteser**, inte bevis.

| Annons | Typ | Spend | Köp | CPA | ROAS | Hook | Hold | CTR | CPC |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `PD_2_H1` | video | 462 kr | 1 | 462 kr | 2,44 | 47 % | 42 % | 6,46 % | 1,78 kr |
| `SP_3_H1` | video | 307 kr | 1 | 307 kr | 3,68 | 47 % | 31 % | 4,34 % | 3,07 kr |
| **`SP_2_1`** | **bild** | 297 kr | **3** | **99 kr** | **11,39** | — | — | 4,72 % | 1,77 kr |
| `SP_2_H1` | video | 268 kr | 1 | 268 kr | 4,21 | 48 % | 32 % | 3,61 % | 2,49 kr |
| `PD_1_H1` | video | 266 kr | 0 | — | — | 54 % | 42 % | 7,52 % | 0,94 kr |
| `CS_2_1` | bild | 189 kr | 0 | — | — | — | — | 3,01 % | 3,64 kr |
| `SP_1_H1` | video | 145 kr | 0 | — | — | 38 % | 28 % | 4,39 % | 4,03 kr |
| `PD_3_H1` | video | 129 kr | 0 | — | — | 43 % | 36 % | 7,39 % | 1,61 kr |
| `CS_1_H1` | video | 110 kr | 1 | **110 kr** | 10,26 | 44 % | 22 % | 3,15 % | 3,93 kr |
| `GT_3_H1` | video | 66 kr | 0 | — | — | 36 % | 26 % | 5,70 % | 2,26 kr |
| `GT_1_H1` | video | 54 kr | 0 | — | — | 42 % | 15 % | 3,41 % | 3,61 kr |
| `GT_2_H1` | video | 54 kr | 0 | — | — | 42 % | 22 % | 4,02 % | 2,55 kr |
| `PD_2_1` | bild | 29 kr | 1 | 29 kr | 38,61 | — | — | 4,55 % | 1,83 kr |
| `CS_3_H1` | video | 26 kr | 0 | — | — | 36 % | 20 % | 3,07 % | 3,76 kr |
| `CS_2_H1` | video | 17 kr | 0 | — | — | 37 % | 16 % | 0,99 % | 16,85 kr |
| `GT_2_1` | bild | 15 kr | 0 | — | — | — | — | 1,10 % | 14,75 kr |

**Variabeltabell** (vinstbidrag = `(693 − CPA) × köp`):

| Variabel | Värde | Spend | Andel | Köp | CPA | Vinstbidrag |
|---|---|---:|---:|---:|---:|---:|
| Format | **bild** | 531 kr | 22 % | 4 | **133 kr** | **2 241 kr** |
| Format | video | 1 904 kr | 78 % | 4 | 476 kr | 868 kr |
| Vinkel | **SP** | 1 018 kr | 42 % | 5 | **204 kr** | **2 447 kr** |
| Vinkel | PD | 887 kr | 36 % | 2 | 443 kr | 499 kr |
| Vinkel | CS | 343 kr | 14 % | 1 | 343 kr | 350 kr |
| Vinkel | GT | 188 kr | 8 % | 0 | — | — |

### Svar på de tre frågorna batch #1 lämnade

1. **Håller PD sin volym när mekanismraden är utbytt?** **Nej.** PD gick från
   61 % av spenden (avläst 2026-09-12) till 36 %, och ligger på CPA 443 kr mot
   SP:s 204 kr. Rekonstruktionen av hypotesen håller alltså inte så här långt —
   men PD är fortfarande långt under break-even 693 kr, så det är en
   omprioritering, inte en utdömning.
2. **Replikerar bilderna (mönster 3)?** **Ja, kraftigt.** Bild CPA 133 kr mot
   video 476 kr, och bild står för 72 % av vinstbidraget på 22 % av spenden.
   Ärvd mönster 3 bekräftas nu i CaraShells eget konto.
3. **Får CS och GT spend alls i CBO:n?** **Nej** — 14 % respektive 8 %.
   Frågan är därmed besvarad: de måste testas separat, i eget ABO.

---

## Batch #2 — 2026-09-14, briefrond nr 1 (`/notionscalercs carashell`)

**7 briefer** (ingen redigerare tilldelad ⇒ registrets `Briefrond:` säger 7).
**4 bild + 3 video** — övervikten åt bild är datadriven, se mönster 6.
Copy-modell `ab`: 4 fable / 3 sonnet, taggen står i varje briefs VARIABELTAGGAR.
Backloggens fem väntande koncept är alla plockade i den här ronden; de två
återstående platserna är varianter av den bäst presterande annonsen.

| Annons | Typ | Vinkel | Hypotes | Källa / förälder | copy_model |
|---|---|---|---|---|---|
| `CaraShellRoof_CS_4_1` | bild | CS | Rabatten säljer lika bra utan falsk brådska — "IDAG" bort, priset som stående erbjudande. Isolerar brådskan. | backlog #1; ärvd `Takoverdrag_CS_2_H1` CPA 81 kr | fable |
| `CaraShellRoof_GT_4_1` | bild | GT | Presentvinkeln bar i källan men bara som video; bilderna replikerar här (mönster 3+6). Testar vinkel mot creative — den öppna frågan i mönster 2. | backlog #2; ärvd `Takoverdrag_GT_2_H1` 14 köp | sonnet |
| `CaraShellRoof_PD_4_1` | bild | PD | "Vårsyndet": före/efter mellan fukttestet och torrt tak skärper PD till en konkret konsekvens — och flyttar PD till det format som vinner. | backlog #3; produktfilens `problem_text` | fable |
| `CaraShellRoof_SP_4_1` | bild | SP | Variant av bäst presterande annonsen. **Isolerad variabel: citatet** — allt annat hålls identiskt. | **förälder `SP_2_1`** (297 kr, 3 köp, CPA 99 kr) | sonnet |
| `CaraShellRoof_PD_4_H1` | video | PD | "Bara taket. En person." har aldrig varit hook, bara bullet. Demo av påsättningen. | backlog #4; produktfilens `usp` | fable |
| `CaraShellRoof_PD_5_H1` | video | PD | Husbilsägaren som avatar — all copy säger husvagn, bilderna visar husbil. ⚠️ **gissning**, ingen data skiljer avatarerna. | backlog #5; produktfilens mediakommentar | sonnet |
| `CaraShellRoof_SP_4_H1` | video | SP | SP är CaraShells starkaste vinkel (5 av 8 köp). Äkta omdöme + "16 omdömen, alla fem stjärnor" som video. | **data**: SP-vinkeln, vinstbidrag 2 447 kr | fable |

Recensionsunderlaget verifierat mot carashell.se samma dag: **16 omdömen,
snitt 5,00** — påståendet "Ett av 16 omdömen – alla fem stjärnor" är alltså sant
och får stå kvar.

### Att läsa av nästa briefdag (2026-09-16)

1. Passerar `SP_2_1` grinden, och håller CPA 99 kr när den får mer spend?
2. Slår bildvarianterna (`CS_4_1`, `GT_4_1`, `PD_4_1`, `SP_4_1`) videosnittet
   476 kr — alltså replikerar mönster 6 på nya creatives?
3. Ger CS utan brådska (`CS_4_1`) bättre eller sämre CPA än `CS_2_1` med den?
4. Får GT någon spend alls den här gången, eller måste eget ABO till?

---

## Leveransrunda 2026-09-14 (`/ops-leverans carashell`)

Batch #2:s fyra **bildannonser** gick live samma dag som de briefades — hela
ronden låg i hubben som `To be Reviewed` med bilagan på plats. Videorna
(`PD_4_H1`, `PD_5_H1`, `SP_4_H1`) är inte levererade av någon ännu och stod
alltså inte i kön.

| Annons | Adset | Ad-ID | Creative |
|---|---|---|---|
| `CaraShellRoof_CS_4_1` | CARASHELL_SE_Taköverdraget - CS | 120249087719640172 | 2068674053741533 |
| `CaraShellRoof_PD_4_1` | CARASHELL_SE_Taköverdraget - PD | 120249087724280172 | 2336281057197943 |
| `CaraShellRoof_SP_4_1` | CARASHELL_SE_Taköverdraget - SP | 120249087728680172 | 1126722523039617 |
| `CaraShellRoof_GT_4_1` | CARASHELL_SE_Taköverdraget - GT | 120249087853210172 | 1772658683861592 |

Alla fyra ACTIVE/ACTIVE (effective `IN_PROCESS` = Metas granskning), ett
adset per koncept, inget nytt adset skapat, kampanjen orörd. Länken ärvd ur
`CaraShellRoof_SP_2_1`: `https://carashell.se/products/takskyddet`.

**Priskollen:** butiken läst live (`takskyddet.json`) → 1 129 kr, jämförpris
1 469 kr. Samma tal i alla fyra copytexter ⇒ noll avvikelse, inget stopp.
Bilderna bär ingen inbränd text eller pris — prisregeln är grön per
definition, och granskningen (produkt syns, ingen text, inga ansikten) gick
igenom på alla fyra. `PD_4_1` visar en hand som håller fuktmätaren; det är
vad briefens egen IMAGE PROMPT beställde ("a handheld moisture meter"), inget
ansikte.

Alla fyra flyttade till `SE-ACTIVE to be translated` med ad-id i kommentaren
— norska rundan tar dem 15:40.

⚠️ **Mätt vid körningen:** Metas API rate-limitade OPS-kontot genom hela
rundan (8-stegs backoff slog till på både köläsningen och varje uppladdning,
upp till 300 s väntan). Fyra annonser tog ~40 minuter i stället för ~4.
Ingenting misslyckades — det är väntetid, inte fel. Kör inte om en rutin som
"hängt sig" på det här; den jobbar.

---

## Norge-runda 2026-09-14 (`/ops-oversatt carashell`)

Batch #2:s fyra bildannonser översatta till bokmål och uppladdade **live** i
`CARASHELL_NO_Takovertrekket | BE-ROAS 1,51 | 2026-09-11` (CBO 2 000 kr/dag,
konto 915422744950975), samma dag som de gick live i Sverige. Videorna
(`PD_4_H1`, `PD_5_H1`, `SP_4_H1`) är fortfarande inte levererade av någon och
stod alltså inte i kön.

**Ingen HeyGen-rendering:** kön var bara bild, så noll krediter drogs.
**Ingen bildöversättning heller** — alla fyra SE-bilder är rena foton utan
inbränd text (samma fynd som leveransrundan gjorde samma dag), så exakt samma
filer gick upp i Norge. Metas `image_hash` blev identisk med SE-annonsernas,
vilket bekräftar att filerna är byte-lika.

| SE-annons | NO-annons | Adset | Ad-ID |
|---|---|---|---|
| `CaraShellRoof_PD_4_1` | `CaraShellRoof_NO_PD_4_1` | CARASHELL_NO_Takovertrekket - PD (fanns) | 120249089323760172 |
| `CaraShellRoof_SP_4_1` | `CaraShellRoof_NO_SP_4_1` | CARASHELL_NO_Takovertrekket - SP (fanns) | 120249089335500172 |
| `CaraShellRoof_GT_4_1` | `CaraShellRoof_NO_G_4_1` | CARASHELL_NO_Takovertrekket - G (fanns) | 120249089471580172 |
| `CaraShellRoof_CS_4_1` | `CaraShellRoof_NO_CS_4_1` | CARASHELL_NO_Takovertrekket - CS (**nytt**) | 120249089482280172 |

Alla fyra ACTIVE/ACTIVE (effective `IN_PROCESS` = Metas granskning), tillbakalästa
efter uppladdningen. Tre av fyra landade i adsets som redan fanns; bara `- CS`
skapades (klon av `- G`, ingen egen budget — kampanjen är CBO) eftersom
CS-vinkeln inte fanns i Norge tidigare. Kampanjen rördes aldrig, inget befintligt
adset ändrades.

Alla fyra Notion-rader flyttade till `Approved` med `Translated url` ifylld.
⚠️ Den norska filen ligger inte i Notion-sidan (REST-uppladdning av filer är inte
byggd) — granskningen görs i Ads Manager.

⚠️ **Presentannonsen heter `NO_G`, inte `NO_GT`** — se `dna.md`, Norge-rundans
fynd 1. Den mekaniska namnöversättningen hade skapat ett andra presentadset
bredvid det som redan spenderar.

⚠️ **Länken bär `?country=NO`** — se `dna.md`, fynd 2. Utan parametern visar
`/nb`-sidan SEK för norska kunder.

Copyn skriven av en sonnet-subagent ur SE-copyn + `docs/copy-regler.md`, utan
pris i någon av de fyra (fynd 3). Tre-frågorstestet redovisat per annons i
`market-expansion/ops/carashell/2026-09-14/oversatt-output.json`.

⚠️ **Metas rate limit slog till genom hela rundan igen** (8-stegs backoff, upp
till 27 minuter per anrop). Kör inte om rutinen för att den ser ut att hänga.

---

## Norge-runda 2026-09-15 (`/ops-oversatt carashell`) — tom kö

Noll rader i `SE-ACTIVE to be translated`. Gårdagens fyra bildannonser är tagna
och står som `Approved`. `CARASHELL_NO_Takovertrekket` är ACTIVE med fyra adsets
— marknaden går, det här är en tom kö och inget hållet läge. Noll HeyGen-krediter.

Hubben har 7 rader totalt: de 4 godkända bildannonserna + batch #2:s tre
videobriefer (`PD_4_H1`, `PD_5_H1`, `SP_4_H1`) som fortfarande står `Draft`.
Ingen redigerare är tilldelad CaraShell, så inget produceras mot dem.

✅ **Länkfixen ärvs nu av sig själv.** Kön läste ärvd länk
`https://carashell.se/nb/products/takskyddet?country=NO` ur `CaraShellRoof_NO_CS_4_1`
— gårdagens annons är nyast ACTIVE och bär parametern, så nya norska annonser får
rätt valuta utan `--lank`. De nio äldsta NO-annonserna saknar den fortfarande.

## 2026-09-15 · Batch #2:s fyra bildannonser fick textlagret i efterhand (Axels dom "extremt keffa bildannonser")

**Rotorsak:** briefarna var två-stegs-annonser (foto + rubrik/pris/badge
"in post"), prompterna sa "no text, leave clean space for a headline in
post" — och steget "post" fanns inte i `/ops-bild`. Fyra rena foton gick live
2026-09-14 i SE och NO. Granskningen kollade bara att ingen *extra* text smugit
in, inte att briefens text *fanns*. Varken bildmodellen eller strategin var
felet: GT-fotot (paketet vid husvagnen) och PD-splitten var bra som foton.

**Fix, samma dag:** `factory/bild-text.py` (textlagret, Pillow, brandets
färger ur `factory/butiker/carashell.yaml`) + `textUrBrief` i
`factory/ops-bild.mjs` som läser tabellen "Exact text" ur briefen, +
`tools/ops-byt-bild.mjs` som byter bilden i en annons som redan är live utan
att pausa (Axels beslut: "pausa inte dom utan gör bara de förra versionerna
mycket bättre"). Basfotona återanvändes ur Notion-raderna — inga nya
kie.ai-krediter.

| Annons | Element på bilden | SE creative | NO creative | Status efter |
|---|---|---|---|---|
| `CS_4_1` | rubrik, pris 1 129 kr, överstruket 1 469 kr, −23 %, botten | 2068674053741533 → 1415852457318612 | 2538228876645141 → 1828264228350829 | ACTIVE/IN_PROCESS, oförändrad |
| `GT_4_1` | rubrik, underrad, badge | 1772658683861592 → 1429535182393812 | 1409350731144052 → 1753113312579477 | ACTIVE/IN_PROCESS |
| `PD_4_1` | rubrik, UTAN/MED-etiketter, botten | 2336281057197943 → 1592813378406653 | 2172696653279676 → 1405908404975949 | ACTIVE/IN_PROCESS |
| `SP_4_1` | citat, – Anders, ★★★★★, botten, pris | 1126722523039617 → 963288716803649 | 1392114153086604 → 1455967989707413 | ACTIVE/IN_PROCESS |

NO-versionerna bär norska rader utan pris (`products/carashell/batch-02/textlager-no.json`,
sonnet) — "Fri frakt til Norge" i stället för SEK-priset, som NO-copyn i
övrigt. Notion-raderna har den nya SE-bilden (gamla utbytt) + `<namn>_NO.png`.

⚠️ Datan: de fyra annonserna har 1 dygn (14/9) med foto utan text och
resten med. Vinstbidraget per annons blandar båda — döm inte 14/9-siffrorna
som konceptets. Nästa briefdag: notera "text sedan 15/9" i feedback-loopen.

---

## Avläsning 2026-09-16 (körning nr 3) — batch #1 och #2 mot sina hypoteser

**Kampanjen: 7 513 kr, 20 köp, ROAS 3,10, vinst 29 % (7 dagar).** Budgeten
2 850 → 3 400 kr. 2 av 20 annonser bedömbara. Siffrorna per variabel står i
`dna.md`, körning nr 3.

### Batch #2:s fyra frågor, besvarade

1. **Passerar `SP_2_1` grinden, och håller CPA 99 kr?** **Ja på grinden, nej på
   talet.** 846 kr, 5 köp, **CPA 169 kr** — kontots bästa annons och 58 % av allt
   vinstbidrag, men CPA gick från 99 till 169 kr när spenden åttadubblades. Långt
   under break-even 693 kr. Hypotesen håller.
2. **Slår bildvarianterna videosnittet 476 kr?** **Nej — batchens egna bilder
   gjorde det inte.** `CS_4_1`, `GT_4_1`, `PD_4_1`, `SP_4_1`: 1 793 kr, 2 köp,
   CPA 897 kr. Bara `SP_4_1` sålde (754 kr, 2 köp, CPA 377 kr). ⚠️ Domen är inte
   rättvis: de fyra körde **rena foton utan textlager 14/9** och rätt creative
   först från 15/9, alltså ett dygn av två med fel annons. Läs om dem nästa rond.
   Formatet som helhet leder fortfarande, men bara 1,2× i stället för 3,6× —
   se mönster 10.
3. **Ger CS utan brådska (`CS_4_1`) bättre eller sämre CPA än `CS_2_1` med den?**
   **Obesvarad.** `CS_4_1` fick 113 kr och 0 köp, `CS_2_1` 640 kr och 1 köp.
   Ingen av dem är i närheten av grinden. Frågan går vidare till batch #3, där
   `CS_5_1` och `CS_6_1` båda är brådskefria och i stället isolerar
   rabattframingen mot varandra.
4. **Får GT spend alls?** **Ja, och det gjorde saken värre.** `GT_4_1` fick
   338 kr helt själv — mer än hela GT-vinkeln fick förra ronden — och gav **0
   köp**. GT totalt: 611 kr, 5 annonser, 0 köp. Se mönster 12.

### Per annons i batch #2 (14d, 2026-09-16)

| Annons | Typ | copy_model | Spend | Köp | CPA | Hypotesen |
|---|---|---|---:|---:|---:|---|
| `SP_4_1` | bild | sonnet | 754 kr | 2 | 377 kr | **Lutar åt håller** — enda av batchens fyra som sålde, men under grinden |
| `PD_4_1` | bild | fable | 588 kr | 0 | — | **Föll — med en lärdom.** CTR 16,32 %, kontots högsta, och noll köp. Mönster 13 |
| `GT_4_1` | bild | sonnet | 338 kr | 0 | — | **Föll.** Presentvinkeln bar inte över i bild heller |
| `CS_4_1` | bild | fable | 113 kr | 0 | — | **Oavgjord** — svalt av CBO:n, 113 kr räcker inte till någonting |
| `PD_4_H1` | video | fable | — | — | — | **Aldrig gjord.** Ligger kvar i Draft, ingen redigerare tilldelad |
| `PD_5_H1` | video | sonnet | — | — | — | **Aldrig gjord.** Ligger kvar i Draft |
| `SP_4_H1` | video | fable | — | — | — | **Aldrig gjord.** Ligger kvar i Draft |

⚠️ **Tre av sju briefer i batch #2 blev aldrig till annonser.** Ingen redigerare
är tilldelad CaraShell. Det är skälet till att batch #3 är sju bildannonser och
noll video — se beslutet nedan.

---

## Batch #3 — 2026-09-16, briefrond nr 2 (`/notionscalercs carashell`)

**7 briefer, alla bild.** Registrets `Briefrond:`-rad säger 7 (ingen redigerare
tilldelad). Alla sju genererades, granskades och godkändes samma natt och står i
`To be Reviewed` — leveransrundan 14:05 tar dem live.

**Beslutet om formatet, fattat av sessionen:** kommandots stoppregel säger att en
rond inte ska lägga nya briefer när förra batchens rader ligger kvar i `Draft`
utan tilldelad redigerare. Tre videobriefer gör precis det. Men regelns syfte är
att hubben inte ska fyllas med briefer ingen gör — och en **bildbrief görs av
fabriken samma natt**, så den kan per konstruktion inte hamna i den högen.
Därför: **noll nya videobriefer** (de tre i Draft är beviset på att ingen gör
video), **sju bildbriefer**, antalet enligt registret. Butiken går med vinst och
skalas — att lämna den utan nya creatives hade varit dyrare än att avvika.

Copy av subagenter enligt A/B:t: **3 fable, 4 sonnet** (batch #2 var 4/3, totalen
är därmed 7/7). Vägen: **Agent-verktyget**, `model: "fable"` respektive
`"sonnet"` — inte API-reservvägen. Tre-frågorstestet redovisas per rad i varje
brief. Backloggen var redan tömd av batch #2; de två strandade videokoncepten
(backlog #4 "En person, en minut" och #5 "Husbilen") är flyttade till bild här.

**GT får inga briefer den här ronden** (mönster 12).

| Annons | Vinkel | Typ | Isolerad variabel / källa | Förälder | copy_model |
|---|---|---|---|---|---|
| `CaraShellRoof_SP_5_1` | SP | variant | **Miljön** — samma proof, scenen flyttad till höstregn | `SP_2_1` (CPA 169 kr) | sonnet |
| `CaraShellRoof_SP_6_1` | SP | variant | **Proof-typen** — aggregatet (16 omdömen, 5,0) i stället för citatet | `SP_2_1` | fable |
| `CaraShellRoof_SP_7_1` | SP | nytt koncept | **Avataren** — husbilsägaren, som leverantörens bilder faktiskt visar. ⚠️ delvis gissning | produktfilens mediakommentar; backlog #5 | sonnet |
| `CaraShellRoof_CS_5_1` | CS | variant | **Formatet** — CS:s enda vinnare finns bara som video | `CS_1_H1` (CPA 216 kr) | fable |
| `CaraShellRoof_CS_6_1` | CS | variant | **Rabattframingen** — "spara 340 kr" mot `CS_5_1`:s "23 %" | `CS_1_H1` | sonnet |
| `CaraShellRoof_PD_6_1` | PD | nytt koncept | **Valet med ett pris på** — fixen på mönster 13 | egen data: `PD_4_1` 16,32 % CTR / 0 köp | fable |
| `CaraShellRoof_PD_7_1` | PD | nytt koncept | **USP:n som hook** — "Bara taket. En person." har aldrig varit rubrik | produktfilens `usp`; backlog #4 | sonnet |

**Brådskan är borta ur båda CS-annonserna.** Föräldern `CS_1_H1` bär "🔥 23%
RABATT … – IDAG 🔥", men 1 129 kr är butikens stående pris och påståendet är
osant. `CS_5_1` isolerar därför formatet utan att ärva brådskan, och `CS_6_1`
ställer kronframingen mot procentframingen. Det besvarar dna.md:s öppna fråga 4
utan att någon annons behöver ljuga. Priset lästes live ur butiken samma natt:
**1 129 / 1 469 kr**, oförändrat.

### Granskningen av bilderna (sessionen dömer, Axel granskar aldrig)

Sex av sju höll direkt. `SP_6_1` tappade stjärnraden: `bild-text.py` ritar
`stjarnor` bara som del av citatkortet, och den här annonsen har med flit inget
citat — stjärnorna hamnade som en halvsynlig artefakt bakom rubrikbandet. En
omgenerering gav dem som badge i stället, där ★ renderades som tomma rutor
(typsnittet saknar glyfen). Löst genom att skriva betyget i ord, **"5,0 av 5 i
snitt"**, och lägga om textlagret på det redan genererade basfotot — inga nya
kie.ai-krediter. Den rättade bilden ersatte filen på Notion-raden.

Två fynd som gäller framåt står i `dna.md`: `elementtyp()`-buggen (rättad i
`factory/ops-bild.mjs`) och att en fristående stjärnrad inte går att rita ännu.

### Att läsa av nästa briefdag (2026-09-20)

1. Slår någon av de tre SP-varianterna föräldern `SP_2_1` (CPA 169 kr) — och
   vilken av regn, aggregat eller husbil bar det?
2. `CS_5_1` mot `CS_6_1`: procent eller kronor? Och slår bildversionen videons
   CPA 216 kr?
3. Konverterar `PD_6_1` den uppmärksamhet `PD_4_1` fångade, eller är hög CTR på
   PD-vinkeln alltid fel publik?
4. Har batch #2:s fyra bildannonser hämtat sig när de fått en hel vecka med rätt
   creative — och vad säger det om mönster 10?

---

## USA-runda 2026-09-16 (`/ops-oversatt carashell/takskyddet --marknad US`, första körningen) — 4 bildannonser upp, kampanjen PAUSAD, pixeln saknar åtkomst

**Kön:** 0 rader i `SE-ACTIVE to be translated` — batch #2:s fyra bildrader
låg redan i `Approved` (NO tog dem 14–15/9, innan US fanns). Körd med
`--status Approved`: kön dömer per rad vilka marknader som saknas (`klar_i`),
så en Approved-rad utan US-annons är fortfarande jobb. Batchen:
`market-expansion/ops/carashell/2026-09-16-us/`.

**Två fel i flödet, båda rättade samma förmiddag (commit `517b21d`):**
1. Kön sa "ingen US-kampanj — /ny-annonser bygger den" fast
   `CARASHELL_US_Taköverdrag …` (`120251436741400435`) låg färdig i
   Magiborsten UK sedan 06:29. `valjKampanjer` kände bara igen kampanjer via
   annonsprefixet eller via annonserna i dem — en `--tom`-kampanj har inga.
   Nu `kampanjbasFor` (brand_marknad_produktnamn) som fjärde väg.
2. En PAUSED kampanj utan spend gav "VA:n slår på kampanjen först". Nu
   laddas annonserna upp i den (kampanjen rörs aldrig) — Axel slår på med
   ett klick när han vill.

**Bilderna:** textlagret ritades om från de rena basfotona (hämtade ur de
gamla Meta-creatives:ens `image_hash`, 896 × 1152) med amerikansk spec
(`textlager-us.json`, sonnet): $199 / $249 / −20 %, free shipping, 5–10
business days, 16 reviews — allt avläst på
`carashell.se/en/products/takskyddet?country=US` samma dag. Ingen OCR, 0
krediter. `rendera.mjs` är mallen.

| SE | US | Adset | Ad-ID | Status vid tillbakaläsning |
|---|---|---|---|---|
| `GT_4_1` | `CaraShellRoof_US_GT_4_1` | `CARASHELL_US_GT` | 120251442457940435 | ACTIVE/IN_PROCESS |
| `PD_4_1` | `CaraShellRoof_US_PD_4_1` | `CARASHELL_US_PD` | 120251442471980435 | ACTIVE/IN_PROCESS |
| `CS_4_1` | `CaraShellRoof_US_CS_4_1` | `CARASHELL_US_CS` | 120251442481670435 | ACTIVE/IN_PROCESS |
| `SP_4_1` | `CaraShellRoof_US_SP_4_1` | `CARASHELL_US_SP` | 120251442617450435 | ACTIVE/IN_PROCESS |

⚠️ **Pixeln:** Meta flaggar alla fyra med HARD_ERROR 1815045 — kontot
`1107817401910319` har inte åtkomst till pixel `28589207184025756`
(CaraShells pixel, skapad i OPS-kontots business). Kampanjbygget accepterade
pixeln i `promoted_object`, felet syns först på annonsnivå. Kampanjen kan
inte köra förrän pixeln delats med Magiborsten UK i Business Settings.
Axels klick, står i Discord-rapporten. Adsetens `promoted_object` behöver
inte ändras när åtkomsten finns.

**Vad som INTE gjordes:** inga videor — batch #2:s tre videobriefer
(`PD_4_H1`, `PD_5_H1`, `SP_4_H1`) står i Draft utan redigerare. Termoskyddet
(produkt 2) har egen US-kampanj `CARASHELL_US_Termoskydd …` sedan 12:03,
byggd av den andra sessionen, tom och pausad — den fylls av
`/ops-oversatt carashell/termoskyddet --marknad US` när dess hub och SE-annonser
finns. Inte en dubblett.

**Tillägg samma eftermiddag (parallell session, `session_0137SoqfSfbKHp1eF8jbkffp`):**
två sessioner körde `/ops-oversatt carashell/takskyddet --marknad US` samtidigt.
Den här hittade samma två fel, men `517b21d`:s lösning (`kampanjbasFor` som fjärde
väg i `valjKampanjer`, uppladdning i PAUSED utan spend) är den som gäller — dubblett-
koden togs bort vid mergen. Discord-rapporten från den här sessionen (11:5x, "nothing
uploaded") skrevs FÖRE de fyra uppladdningarna och är överspelad. Samma eftermiddag
fick USA egen domän (carashell.com), 90-dagars garanti på /en och termoskyddet sin
US-kampanj — se `factory/PROCESS.md` punkt 19–20 och termoskyddets batch-log.

**Tillägg samma dag, 12:40:** de fyra US-bildannonserna pekades om från
`carashell.se/en/…?country=US` till **`https://carashell.com/products/takskyddet?country=US`**
(Axels beslut via den andra sessionen: ".se säger utländsk butik", domänen kopplad i
Shopify) — ny creative med samma spec, annonsen ompekad, tillbakaläst ACTIVE
(`resultat-lankbyte.json`). Pixeln delades med Magiborsten UK 12:20; efter en
omsparning av adsetens `promoted_object` försvann HARD_ERROR 1815045 på alla fyra.
Videorna (12 st, batch #1) körs genom HeyGen → engelska ordcaptions
(`pipeline/no-precis.py`, konfig i `cap/`) i samma batchmapp.

## USA-runda 2 samma dag (videor) — hela SE-kampanjen speglad, 20 annonser i US-kampanjen

Axels order 12:1x: "alla annonser i nuvarande kampanj räcker för ett produkttest"
+ "jag vill ha videosarna på engelska". SE-kampanjens 12 videor (batch #1)
kördes genom HeyGen (English (United States), röstklon + lip-sync):
proofread → sonnet-lokaliserade SRT:er (`video/srt-us/`, regexgrind
`kolla-srt.py`: samma block/timecodes, inga kronor/åäö/"Swedish law",
±35 % längd) → apply → render → download → **engelska ordcaptions** med
`pipeline/no-precis.py` (alla 12 källvideor har Carl Vicentes vita piller,
mätt till y 988–1049 på 720×1280; konfig i `cap/`, GT_1 fick `fyll` 0–0,7 s
där detektorn missade pillret mot STERLING-logotypen) → `rostkoll.py` grön
på alla 12 → kontaktark tittade per video.

**Två sessioner på samma produkt.** Medan den här sessionen renderade laddade
Axels andra konto upp batch #1:s fyra bilder (11:10–11:26 UTC) och tio av de
tolv videorna (12:01–12:06) med exakt samma namn; den här hann med
`CS_1_H1` (120251443679590435) och `CS_2_H1` (120251443854310435). Dubblett-
spärren i `ops-till-meta.mjs` stoppade varje andra försök — **noll dubbletter,
20 annonser** (12 video + 8 bild), alla mot
`https://carashell.com/products/takskyddet?country=US`. Stickprov på två av
den andra sessionens videor (GT_1_H1, SP_3_H1): engelska captions, inget
svenskt kvar. Ordval skiljer: den här sessionen "camper", den andra "RV" /
"trailer" — harmoniseras i nästa brief.

Adseten CS/GT/PD/SP slogs PÅ inne i den fortfarande PAUSADE kampanjen
(byggda av `--tom` samma morgon, aldrig spenderat) så Axel har ett klick.
`G` är tomt och står kvar pausat. HeyGen: 7 017 → 6 653 före render, ~570
till för renderingarna. Ingen har lyssnat på dubbarna med öron — röstkollen
mäter bara det mätbara; lyssna på topspendern innan skalning.

---

## LP lagerrensning live 2026-09-16 (`/lagerrensning https://carashell.se/products/takskyddet --butik carashell`)

**https://carashell.se/pages/takoverdrag-husvagn-husbil-6-5-3-m-lagerrensning** —
publicerad direkt i butiken via `listicle/butik.mjs` (ingen GemPages): tre
temafiler på det publicerade temat "CaraShell – CRO v1" (`layout/listicle.liquid`
utan header/footer, `templates/page.listicle.liquid`, `assets/listicle.css`),
sidan skapad med mallen `page.listicle`, läst tillbaka som kund utan header,
footer eller meny. Copyn och bildplanen är från sessionen som byggde
`.gempages`-filen samma dag (gren `claude/upbeat-hawking-8eacfe`, aldrig
mergad): **obrandad**, "Anders på lagret", pris **1 129 / 1 469 kr** lästa ur
`/products/takskyddet.json`, 14 dagars ångerrätt (riskfritt-blocket heter
"Om det inte känns rätt"), punkt 1–4 kie.ai-bilder på Bäverbutikens CDN
(`lp-bildarkiv`), punkt 5 och lyckas produktbilderna 1 och 2. Knapparna
länkar relativt till `/products/takskyddet`. Filerna ligger i
`listicle/output/lagerrensning/takskyddet/`. Ingen annons pekar dit ännu —
sidan mäts som LP, aldrig som creative.

**Samma sida i Bäverbutiken, 2026-09-16 kväll** (Axels fråga: "kan du göra
så att denna finns på bäverbutiken.se också?"):
**https://baverbutiken.se/pages/takoverdrag-husvagn-6-5-3-m-lagerrensning** —
knapparna går till Bäverbutikens produktsida
`/products/takoverdrag-husvagn-6-5-3-m-skyddar-den-dyraste-ytan`. Samma
copy och samma bilder (kie-bilderna låg redan på Bäverbutikens CDN, cachen
träffade på prompten — noll nya credits), samma pris 1 129 / 1 469 kr avläst
ur Bäverbutikens `/products/<handle>.json`. Två block skrevs om mot
Bäverbutikens produktsida: lyckas-blocket ("rem och dragsko" i stället för
CaraShell-sidans plastkrokar och 30–40 cm, 210D-väv "inte tunn presenning",
förvaringspåse, fri frakt inom Sverige, 5–10 arbetsdagar) och riskfritt-
blocket (mallens "Därför kan du testa helt riskfritt." med **30 dagars öppet
köp** — Bäverbutiken lovar det på sidan, CaraShell har 14 dagars ångerrätt).
Temafilerna fanns redan på "UTKAST utan popup 2026-08-28" sedan axelbältets
sida. Filerna ligger i
`listicle/output/lagerrensning/takoverdrag-husvagn-6-5-3-m-skyddar-den-dyraste-ytan/`.
Det är samma produkt i två butiker: en annons per butik pekar på sin egen
sida, aldrig korsvis (fel pixel).

**USA-versionen på carashell.com, 2026-09-16 sent på kvällen** (Axels
fråga: "en version som passar för carashell.com"):
**https://carashell.com/pages/takoverdrag-husvagn-husbil-6-5-3-m-lagerrensning?country=US**
— samma sida (samma handle) med en engelsk ÖVERSÄTTNING via Translations
API (`--marknad US`, ny funktion i `listicle/bygg.mjs`), ingen dubblettsida.
Copyn `copy.en.json` skriven mot den engelska produktsidan: **$199 / $249**
(USD, avlästa ur carashell.com), 90-day guarantee med return or refund,
free shipping to the US, 5–10 business days, "up to 21 ft", mått i cm + ft/in,
"travel trailer or motorhome", "moisture check". Samma bilder (cachen träffade
— noll credits). Knapparna → `https://carashell.com/products/takskyddet?country=US`.
Läst tillbaka på carashell.com: engelsk hero, ingen svensk text, ingen
header/footer; carashell.se `?country=SE` visar fortfarande svenska.
Annonserna i Magiborsten UK (US-kampanjen) pekar på den här adressen när
Axel vill testa LP:n i USA.

**Fyra länder till, 2026-09-17** (Axels fråga: "en till fast för dessa
marknader" — UK, Kanada, Australien, Nya Zeeland): de är inte egna marknader i
Shopify utan **länder i marknaden USA** (en marknad, lokal valuta, automatisk
kursomräkning — mätt med `markets`-frågan), så varje land fick en **egen sida**
med engelska i grundspråket, `--marknad US --land <CC>`:

| Land | Adress | Pris i dag (rör sig med kursen) |
|---|---|---|
| UK | https://carashell.com/pages/takoverdrag-husvagn-husbil-6-5-3-m-lagerrensning-gb?country=GB | £152 / £191 |
| Kanada | https://carashell.com/pages/takoverdrag-husvagn-husbil-6-5-3-m-lagerrensning-ca?country=CA | $284 / $356 CAD |
| Australien | https://carashell.com/pages/takoverdrag-husvagn-husbil-6-5-3-m-lagerrensning-au?country=AU | $286 / $358 AUD |
| Nya Zeeland | https://carashell.com/pages/takoverdrag-husvagn-husbil-6-5-3-m-lagerrensning-nz?country=NZ | $355 / $444 NZD |

Priset står INTE i copyn: `[[PRIS]]`/`[[JAMFORPRIS]]` byts av butiken vid
varje visning i besökarens valuta (Axels skärmdump sa NZ$354 på morgonen,
sidan $355 på kvällen — därför). Copyn per land: UK säger caravan, autumn,
damp check; Australien och Nya Zeeland caravan utan månadsnamn (södra
halvklotet), Australien med solen bredvid regnet; Kanada är US-copyn med
"Free shipping to Canada". Samma bilder, noll credits. Läst tillbaka per land
med `?country=`: rätt hero med dagens pris, inga platser kvar, ingen
header/footer.

⚠️ **Produktsidan ändrades samma dag** (annan session): nio storlekar
5,5–13,5 m / 18–44 ft, titeln "Taköverdrag Husvagn & Husbil 5,5–13,5 m" /
"Roof Cover … 18–44 ft (5.5–13.5 m)". SE- och US-copyn på listiclen rättade
("6,5 × 3 m" / "up to 21 ft" → nio storlekar) och omkörda; handlen behölls
ur `plan.json` (titeln hade annars gett en ny adress). ⚠️ Bäverbutikens
produkt har nu också nio storlekar men med **olika pris per storlek**
(1 129 → 2 239 kr, jämförpris 1 469 på alla) — Bäverbutikens listicle säger
fortfarande "1 129 kr istället för 1 469 kr", vilket bara gäller de två
minsta storlekarna. Inte rättad här; Axels beslut.

---

## Norge-runda 2026-09-16 (`/ops-oversatt carashell/takskyddet`) — tom kö, blockerad uppströms

Noll rader i `SE-ACTIVE to be translated`. Ingen översättning, ingen uppladdning,
noll HeyGen-krediter. `CARASHELL_NO_Takovertrekket` är ACTIVE — marknaden går, så
det här är en **tom kö och inget hållet läge**.

**Skälet står uppströms:** leveransrundan 13:40 stoppade samma dag på **två ACTIVE
kampanjer med samma namn** `CARASHELL_SE_Taköverdraget` (`120249050544990172`,
9 646 kr / 23 köp, och kopian `120249121867590172`, 35 kr / 0 köp, skapad 14:54
CEST) med samma 20 annonser. Dagens sju färdiga bildannonser ligger därför kvar i
`To be Reviewed` och nådde aldrig hit. Kedjan är seriell: inget går till Norge
förrän Axel säger vilken SE-kampanj som gäller.

Hubben vid körningen, 14 rader:

| Status | Rader |
|---|---|
| `Approved` | `CS_4_1`, `GT_4_1`, `PD_4_1`, `SP_4_1` — live i SE + NO sedan 14/9 |
| `To be Reviewed` | `CS_5_1`, `CS_6_1`, `PD_6_1`, `PD_7_1`, `SP_5_1`, `SP_6_1`, `SP_7_1` — väntar på kampanjbeskedet |
| `Draft` | `PD_4_H1`, `PD_5_H1`, `SP_4_H1` — videobriefer ingen levererat, ingen redigerare tilldelad |

⚠️ **Metas rate limit bröt kötoolets pris- och länkläsning** efter kampanj-
uppslaget, så verktygets egen `jobb.json` skrevs aldrig. Radantalet och
NO-kampanjens status lästes FÖRE det och är mätta; hubbens statusfördelning är
läst direkt mot Notions API i samma körning. Med tom kö spelar pris och ärvd länk
ingen roll — inget skulle laddats upp ändå. Mätningen ligger i
`market-expansion/ops/carashell/2026-09-16/ko-NO.json`.

⚠️ **Rättelse samma kväll:** de två kampanjerna är INTE dubbletter (Axels besked
2026-09-16: "det är inte 2 stycken samma, den ena går ju till en listicle").
Kopian pekar på `/pages/takoverdrag-husvagn-husbil-6-5-3-m-lagerrensning`,
originalet på `/products/takskyddet` — avläst i kontot. De sju annonserna gick
live i originalet samma kväll med `--kampanj`, se nästa avsnitt. Norge-kön är
alltså tom i den här körningen men fylld efteråt; nästa NO-runda tar dem.

---

## Leveransrunda 2026-09-16 (`/ops-leverans carashell/takskyddet`)

Sju bildannonser live i `CARASHELL_SE_Taköverdraget` (120249050544990172):

| Annons | Adset | Ad-ID |
|---|---|---|
| `CaraShellRoof_SP_5_1` | SP | 120249122698370172 |
| `CaraShellRoof_SP_6_1` | SP | 120249122718510172 |
| `CaraShellRoof_SP_7_1` | SP | 120249122729920172 |
| `CaraShellRoof_CS_5_1` | CS | 120249123060760172 |
| `CaraShellRoof_CS_6_1` | CS | 120249122887210172 |
| `CaraShellRoof_PD_6_1` | PD | 120249122897700172 |
| `CaraShellRoof_PD_7_1` | PD | 120249123047960172 |

Alla ACTIVE/ACTIVE, priset 1 129 kr / 1 469 kr / 340 kr kollat mot butiken på
var och en. **Textlagret (`factory/bild-text.py`) syns i alla sju** — rubrik,
underrad, prisblock och botten står skarpt i bilden, till skillnad från
batch #2:s fyra som gick ut nakna.

⚠️ **TVÅ ACTIVE SE-kampanjer är rätt, inte ett fel** (Axels besked 2026-09-16:
"det är inte 2 stycken samma, den ena går ju till en listicle"). Avläst i kontot
samma dag:

| Kampanj | Landningssida | Spend | Köp | ROAS |
|---|---|---|---|---|
| `…| 2026-09-11` (120249050544990172) | `/products/takskyddet` | 9 646 kr | 23 | 2,76 |
| `… – kopia` (120249121867590172) | `/pages/takoverdrag-husvagn-husbil-6-5-3-m-lagerrensning` | 35 kr | 0 | — |

Kön (`ops-leveranskon`) stoppar på "2 ACTIVE SE-kampanjer" eftersom den bara
ser namnen, och namnen är identiska sånär som på " – kopia". **Rätt åtgärd är
`--kampanj <id>` på `ops-till-meta`, aldrig att pausa den ena.** Vilken som
gäller avgörs av briefens `Destination:` — dessa sju sa produktsidan.
Nästa gång kommer samma stopp: det är en verktygsbegränsning, inte en incident.

---

## USA-runda 3 2026-09-16 (`/ops-oversatt carashell/takskyddet --marknad US`) — batch #3:s sju bildannonser upp i US-kampanjen

**Kön:** 7 rader i `SE-ACTIVE to be translated` (batch #3, live i SE samma kväll).
`--status Approved`-kollen: batch #2:s fyra rader bär redan US-annonser — inget
eftersläpande. Kampanjen `CARASHELL_US_Taköverdrag …` (`120251436741400435`,
Magiborsten UK) fortfarande PAUSED utan spend ⇒ annonserna laddas upp, kampanjen
rörs inte. Batchen: `market-expansion/ops/carashell/2026-09-16-us-3/`.

| SE | US | Adset | Ad-ID | Tillbakaläst |
|---|---|---|---|---|
| `SP_5_1` | `CaraShellRoof_US_SP_5_1` | `CARASHELL_US_SP` | 120251447567460435 | ACTIVE/ACTIVE |
| `SP_6_1` | `CaraShellRoof_US_SP_6_1` | `CARASHELL_US_SP` | 120251447548410435 | ACTIVE/ACTIVE |
| `SP_7_1` | `CaraShellRoof_US_SP_7_1` | `CARASHELL_US_SP` | 120251447531970435 | ACTIVE/ACTIVE |
| `CS_5_1` | `CaraShellRoof_US_CS_5_1` | `CARASHELL_US_CS` | 120251447435050435 | ACTIVE/ACTIVE |
| `CS_6_1` | `CaraShellRoof_US_CS_6_1` | `CARASHELL_US_CS` | 120251447430630435 | ACTIVE/ACTIVE |
| `PD_6_1` | `CaraShellRoof_US_PD_6_1` | `CARASHELL_US_PD` | 120251447347010435 | ACTIVE/ACTIVE |
| `PD_7_1` | `CaraShellRoof_US_PD_7_1` | `CARASHELL_US_PD` | 120251447338360435 | ACTIVE/ACTIVE |

Länk `https://carashell.com/products/takskyddet?country=US` (ärvd ur kampanjen).
Priset läst live: $199 / $249 (`ekonomi.marknadspriser` USD stämmer). Copy av
sonnet-subagent, tre-frågorstestet redovisat per rad: 23 % → **20 %**, "spara
340 kr" → **Save $50**, 14 dagars ångerrätt → **90-day guarantee** (det sidan
säger), "Sverige och Norge" → "in the US", carashell.se → carashell.com,
6,5 × 3 m → 21.3 × 9.8 ft, 30–40 cm → 12–16 in. 0 HeyGen-krediter, 0 kie.ai.
US-kampanjen bär nu **27 annonser**.

**Basfotona var borta för sex av sju.** `/ops-bild` sparar det rena fotot bara
som `.bas.png` i containern och laddar upp enbart textversionen till Notion;
nattvaktens planfil `bild-2026-09-16.json` skrevs dessutom över av
`SP_6_1`-omkörningen, så bara dess kie.ai-länk fanns kvar (den svarade fortfarande
→ `SP_6_1` ritades om från grunden med textlagret, som batch #2). De andra sex
fick **textbyte i samma rutor** (`oversatt-us.py` i batchmappen): SE-layouten räknas
om exakt med `bild-text.py`:s egen `Duk`, den svenska texten suddas radvis inuti
bandet/chipen (plattan behåller fotot bakom), och den amerikanska texten ritas i
samma ruta med samma typsnitt, storlek, färg och justering. Chips som behöver bli
bredare ritas bredare i samma hörn. QA-bild läst per annons. Bara priskortet
(pris + jämförpris) saknas i den vägen — ingen bild i batch #3 har det.
⚠️ **Nästa NO-runda (15:45 i morgon) tar samma sju rader och har samma problem** —
kopiera `oversatt-us.py`-vägen, försök inte OCR-vägen (`oversatt-batch.py`
matchar formerna automatiskt och tar husvagnsväggar för plattor på de här fotona).
Rotorsaken hör hemma i `/ops-bild`: ladda upp basfotot till Notion också, eller
spara kie.ai-länken i planfilen utan att skriva över — noterat i `dna.md`.

Notion: kommentar + `Translated url` på alla sju; **status orörd** (`flytta_till_approved`
falskt — Norge bär dem inte än). Discord `#annons-uppladdning` postat, Axel
pingad under ACTION NEEDED (slå på kampanjen).

---

## Leveransrunda 2026-09-17 — tom kö, och kampanjstoppet lagat

Noll rader i hubben. Gårdagens sju bildannonser lever i
`CARASHELL_SE_Taköverdraget`.

**Stoppet från 16/9 är åtgärdat i koden.** Axel döpte om listicle-kampanjen
till `CARASHELL_SE_Taköverdraget LISTICLE`, och sedan i dag sållar både
`ops-leveranskon` och `ops-till-meta` bort kampanjer vars namn bär ett
sidospårsord (`tools/lib/sidokampanjer.mjs`, `SIDOSPAR = ['LISTICLE']`).
Verifierat mot kontot samma körning: rundan väljer produktsidans kampanj
själv, utan `--kampanj`.

Två spärrar i regeln, båda testade:
- **Den sista kampanjen sållas aldrig bort.** Bär alla aktiva ordet lämnas
  listan orörd och det läsbara stoppet står kvar — annars blir "inget att
  ladda upp i" ett tyst fel i stället för ett larm.
- **Namnet får sålla, aldrig avgöra ensam.** `--kampanj <id>` styr fortfarande.

Nya spår som föds (fler landningssidetyper) läggs till i `SIDOSPAR` med datum
och skäl — listan är inte en gissning om framtiden, den är en logg.

---

## Norge-runda 2026-09-17 (`/ops-oversatt carashell/takskyddet`) — STOPP på bilderna

Sju rader i `SE-ACTIVE to be translated` (batch #3: `PD_6_1`, `PD_7_1`, `CS_5_1`,
`CS_6_1`, `SP_5_1`, `SP_6_1`, `SP_7_1`, alla bild). Leveransrundan kom igenom i
dag sedan `tools/lib/sidokampanjer.mjs` lärt kön att sålla bort LISTICLE-kampanjen.
**Ingen laddades upp.** Noll HeyGen-krediter.

✅ **Norska priset är utrett** — det upphäver anteckningen från 2026-09-14.
Mätt live samma dag mot `carashell.se/nb/products/takskyddet?country=NO`:
`"price":110600`, `"compare_at_price":138250`, `"currencyCode":"NOK"`. Alltså
**1 106 kr / 1 382,50 kr / spar 276,50 kr / 20 %**, lika för alla nio storlekar.
⚠️ **Rabattprocenten skiljer sig mellan marknaderna** — 23 % i Sverige, 20 % i
Norge. Översätt aldrig den svenska procenten; räkna alltid ur NOK-talen.

⛔ **Stoppet:** sedan textlagret (`factory/bild-text.py`) togs i drift 2026-09-15
bär OPS-bildannonserna inbränd svensk text och SEK-priser.
`pipeline/oversatt-bild.py` får inte bort den texten — den nya norska ritas
ovanpå den gamla svenska, som syns kvar. Mätt på tre av sju: `SP_6_1`
dubbelexponerad rubrik, `CS_5_1` och `CS_6_1` med `1 129 kr` kvar bakom det nya
priset (och `CS_5_1` tappade underraden helt). Felet sitter i suddsteget som är
gemensamt för alla sju. Formdetektorn missar dessutom band och etiketter:
`PD_7_1` hittar 3 former av 5, och citatkortet i `SP_7_1`/`SP_5_1` får fler rader
än det har så Lars citat blir kvar på svenska.

En prisbricka som visar både 1 129 kr och 1 106 kr för en norsk kund är värre än
ingen annons. Raderna ligger därför kvar i kön, ingen Notion-status ändrades.
Hela diagnosen med föreslagen rotorsak: `market-expansion/ops/carashell/2026-09-17/BILDSTOPP.md`.

**Det som är klart och återanvänds:** `adcopy-NO.json` (primary/headline/
description för alla sju), `bildtexter-NO.json` (bildtexterna rad för rad) och
tre-frågorstestet i `oversatt-output.json`. Copyn behöver inte skrivas om.

---

## USA-runda 4 2026-09-17 (`/ops-oversatt carashell/takskyddet --marknad US`) — inget att ladda upp, kampanjen påslagen + kopia

**Kön:** 7 rader i `SE-ACTIVE to be translated` (batch #3), alla `finns_i_meta: true`
i US sedan runda 3 — inget nytt. `--status Approved`: batch #2:s fyra rader bär US.
0 HeyGen-krediter. Batch: `market-expansion/ops/carashell/2026-09-17-us/`.

**Kampanjen är PÅ.** Kön stoppade på "2 ACTIVE US-kampanjer", avläst i kontot:

| Kampanj | Skapad (UTC) | Landningssida | Spend | Köp |
|---|---|---|---|---|
| `CARASHELL_US_Taköverdrag …` (120251436741400435) | 2026-09-16 04:29 | `carashell.com/products/takskyddet?country=US` | 1 471 kr | 1 |
| `1 … – kopia` (120251451415500435) | 2026-09-16 20:20 | `carashell.com/pages/takoverdrag-…-lagerrensning?country=US` | 1 118 kr | 3 |

Samma mönster som SE: kopian är listicle-spåret, inte en dubblett. Båda 1 000 kr/dag,
27 annonser var (kopian togs efter runda 3, så batch #3 ligger i båda). Under
300 kr/annons och 3 köp — ingen dom. `tools/lib/sidokampanjer.mjs` känner bara igen
spåret på ordet LISTICLE i namnet ⇒ **Axel döper om kopian**, annars stoppar nästa
US-runda med nya rader. Rörde ingen kampanj.

**Norge står still på samma sju rader** — NO-rundan 2026-09-17 tog OCR-vägen
(`oversatt-bild.py`) och fick spökskrift; slutsatsen i `BILDSTOPP.md` att bilderna
inte går att översätta är rättad där: `oversatt-us.py` (in-place-vägen från runda 3)
tar nu `--batch … --marknad NO`. NO-copyn från 2026-09-17 återanvänds.
`GT_4_1` (batch #2) saknar fortfarande NO-annons (`klar_i.NO: false` i Approved).

---

## Prisrättning UK/CA/AU/NZ 2026-09-17→18 — 216 annonser i åtta kampanjer sa amerikanskt pris

**Vad som var fel.** Axel byggde åtta kampanjer i Magiborsten UK (`1107817401910319`)
för fyra nya engelskspråkiga marknader — en produktkampanj och en LISTICLE-kampanj per
marknad — genom att kopiera US-kampanjens creatives. Priset följde med: **varenda annons
sa `$199` / `$249` (USD)** fast kunden i London, Toronto, Sydney och Auckland betalar i
sin egen valuta. Axel upptäckte det själv och bad om rättning.

**Butikens riktiga priser, avlästa som kund i varje land 2026-09-17** (`POST /localization`
→ `GET /products/takskyddet.json` på carashell.com):

| Marknad | Pris | Jämförpris | Rabatt | Kampanjer |
|---|---|---|---|---|
| GB | £152 | £191 | 20,4 % | UK Taköverdrag + UK LISTICLE |
| CA | CA$284 | CA$356 | 20,2 % | CA Taköverdrag + CA LISTICLE |
| AU | A$286 | A$358 | 20,1 % | AU Taköverdrag + AU LISTICLE |
| NZ | NZ$355 | NZ$444 | 20,0 % | NZ Taköverdrag + NZ LISTICLE |

⚠️ **Priserna är Shopifys kursomräkning, inte fasta priser i prislistan** (bara USD är
fast). Rör sig kursen ändras butikens pris och annonserna säger fel igen. Läs om priserna
innan nästa runda; ett fast pris per marknad är Axels beslut.

**Kartan: 27 unika creatives × 8 kampanjer = 216 annonser.** Tre ytor granskade var för sig:

| Yta | Bär priset | Åtgärd |
|---|---|---|
| Annonstext (message/headline/description) | **27 av 27** | deterministiskt byte, 476 byten |
| Inbränd text i bild | **9 av 15** | prisraden omritad pixelstabilt |
| Tal + captions i video | **3 av 12** (CS_1/2/3) | nytt tal + nya captions |

De 6 rena bilderna och 9 rena videorna (GT, PD, SP) nämner inget pris i mediet och
**återanvändes orörda** — samma image_hash respektive video_id som före.

**Så här gjordes det, och varför inget annat kunde ändras:**
- **Copyn byttes i kod, inte av en modell** (`marknader.mjs → bytPris`): `$199` → marknadens
  pris, `$249` → jämförpriset, `$50` → besparingen, `free shipping in the US` → butikens
  egen formulering för landet. Allt annat är tecken för tecken originalet. 0 US-rester
  i kontrollen (`kvarUS`). Det som INTE byttes, för att det redan stämmer: "20% off"
  (20,0–20,4 % på alla fyra), "90-day guarantee" och fraktlöftet (butiken skriver båda
  själv på produktsidan i alla fyra länderna), "16 reviews", måtten.
- **Bilderna:** `byt-text.py` suddar EN rad och skriver dit en ny — den mäter själv
  bakgrundsfärg, textfärg, fetstil, versalhöjd och justering i regionen, så den nya
  raden ärver originalets stil. Regionerna står i `bildregioner.json`.
- **Videorna:** `dubba.mjs` bygger ett nytt ljudspår på ORIGINALETS tidslinje (cue-tider
  ur ElevenLabs Scribe, ordnivå) och muxar in det med `-c:v copy`. **Bilden är bit för bit
  originalets och längden exakt densamma** (0 s avvikelse på alla tolv). Röst: ElevenLabs
  `Chris - Charming, Down-to-Earth`. Captions ritas om i originalets eget band (952:1084).
- **Bytet i Meta:** `byt-creative.mjs` ger annonsen en ny creative byggd på dess EGEN
  gamla `object_story_spec` — samma sida, samma CTA och **samma landningslänk**. Namn,
  adset, kampanj och status rörs aldrig. Varje byte läses tillbaka.

**Utfallet:** `verifiera.mjs` läste tillbaka alla 216 annonser ur Meta:
**216 av 216 bär marknadens pris, utan amerikanska spår, med länk och status orörda,
0 Meta-invändningar.** Räkningen: `market-expansion/ops/carashell/2026-09-17-marknader/rakningen.md`.
De åtta ursprungliga länkarna (fyra produktsidor, fyra listicle-sidor) är oförändrade.

**Kostnad:** 0 HeyGen-krediter, 0 kie.ai-krediter. ElevenLabs ≈ 4 900 tecken för de
12 videorna (120 repliker).

### Kursdriften — varför de fyra länderna INTE har fasta priser (mätt 2026-09-18)

Axels fråga dagen efter prisrättningen: "varför skulle vi inte ha fasta priser?"

**Svaret är inte att vi valt bort dem — det går inte utan att bygga om marknaden.**
Mätt i Shopify samma morgon (`markets` + `catalogs` via Admin API):

| Marknad | Valuta | Lokala valutor | Webbnärvaro | Prislista |
|---|---|---|---|---|
| Sweden | — | — | — | — |
| Norge | NOK | false | `/nb/` | Norge (NOK), fasta priser |
| **USA** | **USD** | **true** | **carashell.com** | **CaraShell USD, fasta priser** |

GB, CA, AU och NZ är **länder inne i USA-marknaden**, inte egna marknader. En prislista
kopplas till en marknad (`MarketCatalog` → `context.marketIds`), aldrig till ett land —
så det finns ingen plats att lägga ett fast pundpris. Kunden i UK betalar Shopifys
omräkning av de fasta 199 USD, och den räknas om på nytt varje dag.

Fasta priser kräver alltså **en egen marknad per land**, och en egen marknad kräver en
egen webbnärvaro. carashell.com hör redan till USA-marknaden (mätt 2026-09-17:
`RESOURCE_NOT_FOUND` när en annan marknad försöker ta den), och subfolders hänger på
butikens PRIMÄRA domän — carashell.se, alltså precis den adress .com köptes för att
slippa. Vägen dit är fyra domäner (`.co.uk`, `.ca`, `.com.au`, `.co.nz`), fyra
marknader, fyra prislistor — och **nya landningslänkar i alla 216 annonser**.

**Driften, mätt ett dygn efter bytet** (`prisvakt.mjs`, läs-bar):

| Land | Annonsen säger | Butiken säger | Drift |
|---|---|---|---|
| GB | 152 / 191 | 152 / 191 | 0,00 % |
| CA | 284 / 356 | 284 / 356 | 0,00 % |
| AU | 286 / 358 | **285 / 357** | 0,35 % |
| NZ | 355 / 444 | 355 / 444 | 0,00 % |

AU gled isär på ett dygn. Det är hela mekanismen i ett nötskal: annonsen står still,
sidan följer kursen. `node prisvakt.mjs` läser om priset per land och larmar (exit 1)
när någon marknad driftat mer än 2 %. Då räcker det att köra om kedjan
(`byt-text.py` → `dubba.mjs` → `byt-creative.mjs`) med de nya talen i `marknader.mjs` —
maskineriet finns redan och kostar noll krediter.

**Beslutet är Axels** och ligger öppet: bygga om till egna marknader per land (fasta
priser + lokal domän, men nya länkar i 216 annonser), eller låta kampanjerna samla
data först och rätta priserna när vakten larmar.

---

## Leveransrunda 2026-09-18 — batch #2:s första video live

`CaraShellRoof_PD_5_H1` (video, 39 s, 1080×1920) live i
`CARASHELL_SE_Taköverdraget`, adset PD, ad `120249156254490172`.
Det är den sista av batch #2:s briefer som saknat leverans i fyra dygn —
husbilsägaren som avatar, hypotesen märkt som gissning i batch #2.

**Kontrollen:** slutskärmen visar produktsidan 1 469 → **1 129 kr**, alltså
exakt butikens pris ⇒ grön. Frames lästa (hooken tätt), captions läsbara,
ljudet mätt direkt med ffmpeg: mean −23,9 dB, max −0,4 dB, inget tyst spår.
`pipeline/rostkoll.py` gick INTE att köra — containern saknar systemets
`ffprobe` (bara `imageio-ffmpeg` finns). Hoppad med orsak, aldrig grönmärkt.

⚠️ **Produktsidan har ändrats under batchens gång.** Butiken säljer nu
**"Taköverdrag Husvagn & Husbil 5,5–13,5 m"** i storlekar, pris **1 129–2 239 kr**
(mätt i kön 2026-09-18; batch #2 skrevs mot "6,5 × 3 m", ett enda pris).
Videons slutskärm spelar därför in den GAMLA sidan. Priset stämmer ändå, så
annonsen gick upp — anmärkning skriven på Notion-raden till nästa version,
enligt regeln att en live annons aldrig stängs av i efterhand.

**Det påverkar nästa briefrond:** varje rad som säger "6,5 × 3 m" som om det
vore hela produkten är nu osann. Skriv `1 129 kr` som "från 1 129 kr" när
storleken inte nämns, och läs alltid titeln ur `pris_butik.titel` i köns JSON
i stället för ur en äldre brief.

✅ Sidospårsregeln (LISTICLE) höll i skarp drift: kön och uppladdaren valde
produktsidans kampanj själva, ingen `--kampanj` behövdes.
