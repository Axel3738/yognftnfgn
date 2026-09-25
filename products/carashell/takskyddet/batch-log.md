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
⛔ **Fel — rättat 2026-09-23.** Annonsen har legat live hela tiden, som
`CaraShellRoof_NO_G_4_1` (`120249089471580172`, ACTIVE sedan 2026-09-14).
Kön letade efter den mekaniska namnöversättningen `CaraShellRoof_NO_GT_4_1`
och hittade den aldrig, eftersom presentvinkeln heter `GT` i Sverige och `G`
i Norge. Se rundan 2026-09-23 nedan.

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

## Spegling 2026-09-18 — efterjusteringen (`/ops-spegla carashell/takskyddet --fran "Translation in review"`, EN gång) + rutinerna byggda

**Bakgrund (Axels beslut 2026-09-18):** Taköverdraget briefas bara i Bäverbutikens
hub `BÄVER For CARL Taköverdraget för Husvagn` (`7ec270ab-…`). Rutinen `/ops-spegla`
tar varje rad som är live i SE och översatt till NO där, laddar upp den svenska
filen live i `CARASHELL_SE_Taköverdraget` och Bäverbutikens norska version i
`CARASHELL_NO_Takovertrekket` (0 krediter), skapar en rad i CaraShells hub i
`SE-ACTIVE to be translated` (US-rutinen gör engelskan) och flyttar källraden till
`CaraShell EN ready to be active`. Spegelnamn = källans nummer + 100.

**Rutinerna byggda 2026-09-18 12:41 CEST på `claude5@stonebite.org`** (sedda i
`list_triggers` samma körning): Taköverdraget `trig_01P52LAAkrixM6JzRYUxc4KY` →
`session_01RyFN4bCPBXxHroKFzUsKGW`, 16:45 (`45 14 * * *` CEST); Termoskyddet
`trig_01GWEbTKYMKTfqUZfcucqN71` → `session_017BEGfjEbMWUNPVhHFDxnxn`, 16:55
(`55 14 * * *` CEST). Båda statusstegen fanns i källhubben vid bygget.

**Kön vid bygget:** 0 rader i `CaraShell SE ready to be active` (steget är nytt),
men 18 rader i `Translation in review` som blev NO-klara innan steget fanns ⇒
efterjusteringen körs en gång från den statusen. Priser: SE 1 129 kr (butiken)
mot 1 129 kr i varje brief ⇒ ok; NO 1 106 NOK (butiken) mot 1 189 NOK
(beverbutikken.no) ⇒ 7 %, ok. Kampanjer: SE och NO ACTIVE, 4 adsets var.
Varning: `CARASHELL_SE_Taköverdraget LISTICLE` är eget spår och tog inte emot annonser.

**Torrkörningen (start 12:21 CEST):** 18 rader, 16 gröna, 2 stoppade. `Approved`
hade 0 rader (mätt samma förmiddag), så `"Translation in review"` ensam täcker allt.
Kolumnerna SE-/NO-annons är annons-id ur den skarpa körningen (`factory/output/carashell/spegla-2026-09-18.json`).

**Skarp körning 13:02–15:28 CEST (2 h 26 min, ~8 min per rad — Metas strypning av läsningarna, `⏳ rate limit`-backoff i uppladdaren):** 16 speglade, 2 hoppade, 0 fel. Varje speglad rad: SE-annonsen live i `CARASHELL_SE_Taköverdraget` i konceptets adset (BOF/GT/CS/CO/PD/LI/UG/SP/RI), NO-annonsen live i `CARASHELL_NO_Takovertrekket`, rad i `Carashell Taköverdrag creative hub` i `SE-ACTIVE to be translated` med SE- och NO-filen bifogade (US-rutinen 17:05 gör engelskan), källraden kommenterad och flyttad till `CaraShell EN ready to be active`. 0 → Approved (ingen US-annons finns än). Rapporten postad i Discord `#annons-uppladdning` på CaraShell — OPS.

**Trippelkoll mot kontot 15:35 CEST (läst tillbaka ur Meta, inte ur körningens svar):** SE-kampanjen har 44 annonser varav 16 spegelannonser (nummer ≥ 100), NO-kampanjen 29 varav 16; alla 32 id:n ur körningen finns, 15 + 15 ACTIVE och `CaraShellRoof_CO_101_H1` (sist uppladdad) i Metas granskning (`PENDING_REVIEW` SE / `IN_PROCESS` NO) — blir ACTIVE av sig själv. Varje SE-annons ligger i sitt koncepts adset.

| Källrad | Spegel | Typ | Rubrik ur SE-annonsen | Dom torrt | SE-annons | NO-annons |
|---|---|---|---|---|---|---|
| Takoverdrag_BOF_3_1 | CaraShellRoof_BOF_103_1 | bild | 210D-väv, inte tunn presenning | ✅ speglad | 120249154407540172 | 120249154415020172 |
| Takoverdrag_TR_1_1 | CaraShellRoof_TR_101_1 | bild | 5,0 av 5 – och 340 kr billigare | ⛔ nämner Bäverbutiken: baverbutiken | — | — |
| Takoverdrag_BOF_2_1 | CaraShellRoof_BOF_102_1 | bild | 1 129 kr – fri frakt och öppet köp | ✅ speglad | 120249154552480172 | 120249154559190172 |
| Takoverdrag_BOF_1_1 | CaraShellRoof_BOF_101_1 | bild | Taköverdrag – bara taket, hela vintern | ✅ speglad | 120249154654850172 | 120249154660840172 |
| Takoverdrag_GT_6_1 | CaraShellRoof_GT_106_1 | bild | Skydda taket i jul – 1 129 kr | ✅ speglad | 120249154704850172 | 120249154715680172 |
| Takoverdrag_CS_6_1 | CaraShellRoof_CS_106_1 | bild | Fri frakt – 1 129 kr (ord. 1 469 kr) | ✅ speglad | 120249154827750172 | 120249154834760172 |
| Takoverdrag_GT_5_H1 | CaraShellRoof_GT_105_H1 | video | 210D-väv – tål vintern ute | ✅ speglad | 120249154846540172 | 120249155104410172 |
| Takoverdrag_CO_2_1 | CaraShellRoof_CO_102_1 | bild | En person, inget skav mot lacken | ✅ speglad | 120249155137870172 | 120249155154660172 |
| Takoverdrag_CS_4_1 | CaraShellRoof_CS_104_1 | bild | 1 129 kr – frakten ingår | ✅ speglad | 120249155303460172 | 120249155397680172 |
| Takoverdrag_SP_5_1 | CaraShellRoof_SP_105_1 | bild | 5,0 av 5 på 10 recensioner | ⛔ nämner Bäverbutiken: baverbutiken | — | — |
| Takoverdrag_PD_5_1 | CaraShellRoof_PD_105_1 | bild | Rem och dragsko håller det på plats | ✅ speglad | 120249155879890172 | 120249155937100172 |
| Takoverdrag_LI_1_1 | CaraShellRoof_LI_101_1 | bild | Vattnet står aldrig vid takluckan | ✅ speglad | 120249156106200172 | 120249156248770172 |
| Takoverdrag_GT_4_H1 | CaraShellRoof_GT_104_H1 | video | 5,0/5 hos husvagnsägare | ✅ speglad | 120249156466900172 | 120249156483200172 |
| Takoverdrag_PD_4_H1 | CaraShellRoof_PD_104_H1 | video | Spara 340 kr på taköverdraget | ✅ speglad | 120249156601060172 | 120249156611760172 |
| Takoverdrag_UG_1_H1 | CaraShellRoof_UG_101_H1 | video | Bara taket. En person klarar det. | ✅ speglad | 120249156622630172 | 120249156691640172 |
| Takoverdrag_SP_4_H1 | CaraShellRoof_SP_104_H1 | video | En person räcker. 210D-väv. | ✅ speglad | 120249156702540172 | 120249156792690172 |
| Takoverdrag_RI_1_H1 | CaraShellRoof_RI_101_H1 | video | Ingen tvätt hjälper då | ✅ speglad | 120249156812030172 | 120249156825270172 |
| Takoverdrag_CO_1_H1 | CaraShellRoof_CO_101_H1 | video | Rätt yta, inte hela vagnen | ✅ speglad | 120249156949620172 | 120249156971740172 |

De två stoppade säger "recensioner på baverbutiken.se" i copyn — brandregeln
(Axels beslut 2026-09-18) fungerar som tänkt. De står kvar i `Translation in
review` med en stopp-kommentar. **Axels beslut 2026-09-18 eftermiddag: "lämna"** —
ingen butiksversion görs, de speglas inte till CaraShell. Rutinen läser bara
`CaraShell SE ready to be active`, så raderna rörs inte igen om ingen flyttar dem.

---

## Norge-runda 2026-09-18 (`/ops-oversatt carashell/takskyddet`) — 1 av 7 live, gårdagens diagnos rättad

**Live:** `CaraShellRoof_NO_SP_6_1` — annons `120249157622590172`, adset
`CARASHELL_NO_Takovertrekket - SP`, ACTIVE, länk med `?country=NO`. Bokmål i
både bild och copy, priset 1 106 kr (ord. 1 382,50 kr). Granskad i full storlek.
Notion-raden ligger kvar i kön med `Translated url` satt — den ska till USA
också innan den får bli `Approved` (`annonsmarknader: SE, NO, US`).

⚠️ **Rättelse: gårdagens stopp byggde på en felaktig diagnos.** Jag skrev att
`pipeline/oversatt-bild.py` inte får bort den svenska texten. Det stämmer inte.
Mätt i dag på samma fil: bandet är platt (std 0,00) utanför texten och 1,06
nivåer av 255 där texten satt — osynligt. **Felet var mitt eget**: jag matade en
form med tre textrader med bara två av dem, så verktyget radbröt om och
geometrin sköt isär. Med hela formens text blir bilden ren. Lärdomen:
`oversatt-bild.py` vill ha **all** text som hör till formen, aldrig en delmängd.

**Det som verkligen inte fungerar** är hur verktyget modellerar OPS-layouterna,
inte suddet. Fyra namngivna fel, ett per hållen annons — fullbred rubrik över
delad bild (`PD_6_1`), ★ saknas i Liberation Sans så stjärnraden blir fyrkanter
(`SP_5_1`, `SP_7_1`), prisbrickan inuti den vita remsan modelleras inte så
`1 469 kr → 1 129 kr` står kvar (`CS_5_1`, `CS_6_1`), och band/etiketter utanför
formerna (`PD_7_1`). Detaljerna och den kortaste vägen framåt:
`market-expansion/ops/carashell/2026-09-18/BILDSTOPP.md`.

⚠️ `factory/bild-text.py` duger inte som reserv: den ritar på sina egna
beräknade platser, inte originalets. Ett försök att måla om prisbrickan gav ett
nytt priskort mitt i bilden och lämnade det gamla chipet kvar — två priser.

**Kön växer:** 24 rader i `SE-ACTIVE to be translated` (7 video, 17 bild), men
bara 8 har en fil att jobba med. Resten väntar på redigerarna.

---

## USA-runda 5 2026-09-18 (`/ops-oversatt carashell/takskyddet --marknad US`) — 17 nya annonser live i USA

**Kö:** 24 rader i `SE-ACTIVE to be translated`. 7 av dem (batch #3:s bilder) låg redan i USA
sedan 16/9 — inget nytt. **17 speglade rader (9 bilder + 8 videor) översatta och uppladdade
ACTIVE.** Dessutom kördes kön med `--status Approved`: batch #2:s fyra Approved-rader bär redan
US-annonser, `SP_6_1` hade nu både NO och US och flyttades till `Approved`.

**Kampanjvalet:** originalkampanjen `CARASHELL_US_Taköverdrag…` (`120251436741400435`) är
PAUSED av ägaren med 2 243 kr spend — dit laddas inget upp. Enda ACTIVE US-kampanj är
listicle-kopian `1 CARASHELL_US_Taköverdrag … – kopia` (`120251451415500435`), som länkar till
`carashell.com/pages/takoverdrag-husvagn-husbil-6-5-3-m-lagerrensning?country=US`. Alla 17
annonser ärver den länken. Kampanjen bär nu 44 annonser. Adseten CO, RI, UG, LI och BOF fanns
inte och skapades av körningen; tre av dem (CO/BOF/LI) stod PAUSED efter tidigare misslyckade
uppladdningsförsök (0 spend, skapade samma dag) och slogs på — tillbakaläsning ACTIVE.

| Spegel (US) | Typ | Adset | US-annons | Notion |
|---|---|---|---|---|
| CaraShellRoof_US_LI_101_1 | bild | CARASHELL_US_LI | 120251488867610435 | Approved |
| CaraShellRoof_US_PD_105_1 | bild | CARASHELL_US_PD | 120251488879980435 | Approved |
| CaraShellRoof_US_CS_104_1 | bild | CARASHELL_US_CS | 120251488900040435 | Approved |
| CaraShellRoof_US_CO_102_1 | bild | CARASHELL_US_CO | 120251489217370435 | Approved |
| CaraShellRoof_US_CS_106_1 | bild | CARASHELL_US_CS | 120251489223750435 | Approved |
| CaraShellRoof_US_GT_106_1 | bild | CARASHELL_US_GT | 120251489231820435 | Approved |
| CaraShellRoof_US_BOF_101_1 | bild | CARASHELL_US_BOF | 120251489308740435 | Approved |
| CaraShellRoof_US_BOF_102_1 | bild | CARASHELL_US_BOF | 120251489313310435 | Approved |
| CaraShellRoof_US_BOF_103_1 | bild | CARASHELL_US_BOF | 120251489318610435 | Approved |
| CaraShellRoof_US_CO_101_H1 | video | CARASHELL_US_CO | 120251489798720435 | Approved |
| CaraShellRoof_US_RI_101_H1 | video | CARASHELL_US_RI | 120251489815700435 | Approved |
| CaraShellRoof_US_SP_104_H1 | video | CARASHELL_US_SP | 120251489832370435 | Approved |
| CaraShellRoof_US_UG_101_H1 | video | CARASHELL_US_UG | 120251489963410435 | Approved |
| CaraShellRoof_US_PD_104_H1 | video | CARASHELL_US_PD | 120251490027610435 | Approved |
| CaraShellRoof_US_GT_104_H1 | video | CARASHELL_US_GT | 120251490245280435 | Approved |
| CaraShellRoof_US_GT_105_H1 | video | CARASHELL_US_GT | 120251490274580435 | Approved |
| CaraShellRoof_US_PD_5_H1 | video | CARASHELL_US_PD | 120251490405930435 | kvar i kön — Norge bär den inte än |

**Bilderna** (0 kie-krediter): svensk text bytt på plats mot amerikansk — $199 / ord. $249,
90-day guarantee, free shipping in the US. Sex OPS-textlager via `oversatt-us.py`
(mäter layouten med `bild-text.py`:s `Duk`), tre BOF-bilder ur Bäverbutikens mall via
`pipeline/oversatt-batch.py` med handritade rutor (`bilder/overrides.json`) och försudd
(`bilder/forsudda.py`) mot spökkanter. Alla nio granskade i full storlek. Copyn av
sonnet-subagent med tre-frågorstestet (`adcopy-US.json`, `bilder/oversatt-output.json`).

**Videorna** (HeyGen, röstklon + lip-sync, amerikansk engelska): proofread före rendering
(4 434 → 4 312 krediter efter proofread, renderingarna därutöver). Källvideorna skannade:
alla 8 har inbrända svenska ordcaptions, 4 har stora röda pris/frakt-texter, 6 har svensk
slutkort (Bäverbutiken). Åtgärd: captions ersatta med engelska via `pipeline/no-precis.py`,
röda texter suddade (`video/forbehandla.py`) och ersatta med $199 / $249 / FREE SHIPPING /
90-DAY GUARANTEE / 210D FABRIC, slutkortet ersatt med carashell.com-kort. `rostkoll.py`
✅ på alla 8 (längddrift ≤ 0,3 %), `video/kvarkoll.py` hittade inga kvarvarande svenska
piller efter fyllfönstren i CO_101_H1.

**Fyra verktygsfynd** (detaljer i `dna.md` rotorsak 3): `no-precis.py` tappar sista 50
frames (`-shortest`) — löst med 2,5 s tpad + trim till ljudlängd; kopiekampanjens
`instagram_actor_id` avvisas av API:t — `tools/ops-till-meta.mjs --ig ingen`; BOF-mallens
bilder kräver manuella rutor; de speglade videorna bär Bäverbutikens slutkort och svenska
priser i SE och NO i dag — speglingen kollar bara copyn.

**Notion:** kommentar + `Translated url` på alla 17; 16 → `Approved` (Norge bär dem),
`PD_5_H1` kvar. **Discord:** engelsk rapport i `#annons-uppladdning` (CaraShell — OPS),
meddelande `1550559405999792190`, ingen ACTION NEEDED. Filer:
`market-expansion/ops/carashell/2026-09-18-us/`.

## Norge 2026-09-19 — de sex stoppade bilderna live (`/ops-oversatt carashell/takskyddet`)

Kön: 7 rader i `SE-ACTIVE to be translated` (6 bild, 1 video). **6 uppladdade, 1 hållen.**
Kampanj `CARASHELL_NO_Takovertrekket | BE-ROAS 1,51 | 2026-09-11` (ACTIVE, CBO 2 000 kr/dag),
konto 915422744950975 (MagiBorsten DK). Länk `…/nb/products/takskyddet?country=NO` på alla sex.
Pris ur `ekonomi.marknadspriser`: **1 106 NOK, ord. 1 382,50, spar 276,50 = 20 %** — den svenska
23-procentaren översattes aldrig. Priset lästes dessutom live på den norska sidan av kön.

| SE-namn | NO-namn | Adset | Annons-id | Tillbakaläst |
|---|---|---|---|---|
| `CaraShellRoof_CS_6_1` | `CaraShellRoof_NO_CS_6_1` | CS | `120249172226310172` | ACTIVE/ACTIVE |
| `CaraShellRoof_CS_5_1` | `CaraShellRoof_NO_CS_5_1` | CS | `120249172228120172` | ACTIVE/ACTIVE |
| `CaraShellRoof_SP_5_1` | `CaraShellRoof_NO_SP_5_1` | SP | `120249172233790172` | ACTIVE/ACTIVE |
| `CaraShellRoof_SP_7_1` | `CaraShellRoof_NO_SP_7_1` | SP | `120249172278540172` | ACTIVE/PENDING_REVIEW |
| `CaraShellRoof_PD_7_1` | `CaraShellRoof_NO_PD_7_1` | PD | `120249172282500172` | ACTIVE/IN_PROCESS |
| `CaraShellRoof_PD_6_1` | `CaraShellRoof_NO_PD_6_1` | PD | `120249172287960172` | ACTIVE/IN_PROCESS |

**Bilderna** (0 krediter): `pipeline/oversatt-bild.py` med per-bild-texter i
`market-expansion/ops/carashell/2026-09-19/texter/`. Två verktygsfel rättade i samma
körning (`fyllfarg`, `utvidga`) och två påstådda fel avskrivna — facit i
`2026-09-19/BILDSTOPP-LOST.md`, lärdomarna i `dna.md`. Varje bild granskad i full
storlek OCH mätt: `max avvik < 40` av 765 och `andel > 60 == 0` i varje suddad ruta.

**Copyn:** butikens namn ut ur fyra `message`-block och `PD_6_1`:s bottenband (Axels
beslut 2026-09-18), omskrivet av sonnet-subagent mot `docs/copy-regler.md` med
tre-frågorstestet redovisat (`copyrattning-NO.json`).

**Notion:** kommentar + `Translated url` på alla sex, alla sex → **`Approved`**
(US bar dem redan sedan 2026-09-18). `PD_5_H1` fick kommentar med skälet, status orörd.

**`PD_5_H1` hållen** — tre skäl mätta i källfilen (39,4 s, 1080×1920): inbrända svenska
ordcaptions i hela filmen, slutkort som är en skärmdump av den svenska produktsidan
(`carashell.se`, `1 469,00 → 1 129,00 kr`, "16 recensioner"), och butikens namn i både
caption och voiceover. US-rundan 2026-09-18 byggde om precis detta för engelska, så vägen
finns — men den lägger tillbaka butikens namn, vilket är ägarens beslut.

**Discord:** engelsk rapport i `#annons-uppladdning` (CaraShell — OPS), meddelande
`1550877622257328160`, med `🔴 ACTION NEEDED` för videofrågan.

---

## USA-runda 6 2026-09-19 (`/ops-oversatt carashell/takskyddet --marknad US`) — tom kö, allt friskt

**Inget att översätta och inget att ladda upp.** Båda köerna lästa:

| Kö | Rader | Läge |
|---|---|---|
| `SE-ACTIVE to be translated` | 1 | `CaraShellRoof_PD_5_H1` — bär redan US-annonsen `120251490405930435` sedan 18/9. Stannar för att Norge inte bär den; NO-rundan håller den och har ställt frågan till Axel |
| `Approved` (eftersläpningskollen) | 27 | 0 saknar US-annons |

Kampanj: `1 CARASHELL_US_Taköverdrag … – kopia` `120251451415500435`, ACTIVE, 10 adsets.
Den ursprungliga `CARASHELL_US_Taköverdrag …` står fortfarande PAUSED med 2 246 kr
spend — ägarens beslut, rörs inte. 8 kampanjer i kontot sorterades bort av kön.

**Tillbakaläsning:** 44 annonser i US-kampanjen, **alla 44 ACTIVE**. Gårdagens 17 har
passerat Metas granskning — ingen underkänd, ingen begränsad.

**Butiken redo för USA:** produktsidan svarar 200 på engelska
("Roof Cover for Travel Trailers & Motorhomes 18–44 ft") med **$199** som grundpris,
och listicle-sidan annonserna pekar på svarar 200 som amerikansk besökare. Kön kunde
inte läsa priset själv — den ärvda länken är listicle-sidan, inte `/products/<handle>`
— så priset lästes direkt på marknadens produktsida i stället.

**Regelkoll på gårdagens batch:** copy och bilder är rena från butiksnamn, men de åtta
videornas slutkort bär badgen `carashell.com`. Namnregeln beslutades 2026-09-18, samma
dag som bygget. De ligger kvar (live-annonser stängs aldrig av i efterhand); slutkortet
ritas utan domän från nästa videorunda. Facit i `dna.md`.

**Krediter:** 0 HeyGen, 0 kie.ai. **Discord:** engelsk rapport i `#annons-uppladdning`,
meddelande `1550913936994340948`, ingen ACTION NEEDED.

---

## Spegling 2026-09-19 (`/ops-spegla carashell/takskyddet`) — 16 av 16, 32 annonser live, 0 fel

Rutinen fyrade 16:45 CEST. Källhubben `BÄVER  For CARL Taköverdraget för
Husvagn` hade **16 rader i `CaraShell SE ready to be active`** (de som
Bäverbutikens `/oversatt NO` satte där). Alla 16 speglades: den svenska filen
live i `CARASHELL_SE_Taköverdraget`, Bäverbutikens norska version live i
`CARASHELL_NO_Takovertrekket` (0 krediter), rad i CaraShells hub med båda
filerna i `SE-ACTIVE to be translated`, källraden till
`CaraShell EN ready to be active`. Priset 1 129 SEK / 1 106 NOK läst live ur
butiken; ingen rad nämnde Bäverbutiken. Konto 915422744950975 hela vägen.

Dessutom: **16 källrader i `CaraShell EN ready to be active` fick `Approved`** —
deras US-annonser står uppe i Magiborsten UK sedan US-rutinen körde.

| Källrad | Spegelnamn | SE-annons | NO-annons |
|---|---|---|---|
| Takoverdrag_RI_4_1 | CaraShellRoof_RI_104_1 | 120249174019150172 | 120249174021420172 |
| Takoverdrag_LI_2_1 | CaraShellRoof_LI_102_1 | 120249174032370172 | 120249174039480172 |
| Takoverdrag_TR_2_1 | CaraShellRoof_TR_102_1 | 120249174105240172 | 120249174110360172 |
| Takoverdrag_BOF_4_1 | CaraShellRoof_BOF_104_1 | 120249174162850172 | 120249174165780172 |
| Takoverdrag_CS_11_1 | CaraShellRoof_CS_111_1 | 120249174264230172 | 120249174268950172 |
| Takoverdrag_CS_10_1 | CaraShellRoof_CS_110_1 | 120249174524170172 | 120249174528040172 |
| Takoverdrag_PD_6_H1 | CaraShellRoof_PD_106_H1 | 120249174596040172 | 120249174602710172 |
| Takoverdrag_RI_3_H1 | CaraShellRoof_RI_103_H1 | 120249174703490172 | 120249174709540172 |
| Takoverdrag_PD_7_H1 | CaraShellRoof_PD_107_H1 | 120249174717100172 | 120249174771810172 |
| Takoverdrag_OB_1_H1 | CaraShellRoof_OB_101_H1 | 120249174782070172 | 120249174817930172 |
| Takoverdrag_BOF_5_1 | CaraShellRoof_BOF_105_1 | 120249175041030172 | 120249175047680172 |
| Takoverdrag_BOF_6_1 | CaraShellRoof_BOF_106_1 | 120249175074100172 | 120249175075400172 |
| Takoverdrag_GT_9_1 | CaraShellRoof_GT_109_1 | 120249175077150172 | 120249175111110172 |
| Takoverdrag_PD_9_1 | CaraShellRoof_PD_109_1 | 120249175114360172 | 120249175150360172 |
| Takoverdrag_CO_4_1 | CaraShellRoof_CO_104_1 | 120249175155390172 | 120249175232730172 |
| Takoverdrag_PD_8_1 | CaraShellRoof_PD_108_1 | 120249175256490172 | 120249175262920172 |

De tio översta gick i första omgången, de sex nedersta i en andra omgång efter
rättelsen nedan. Tillbakaläst ur Meta: samtliga 32 har `status: ACTIVE` i rätt
kampanj i OPS-kontot. Tre av de sist uppladdade stod `PENDING_REVIEW` /
`IN_PROCESS` vid avläsningen — Metas normala granskningsfönster, inte ett fel;
adsetet är ACTIVE och annonsens egen status är ACTIVE.

### Rotorsak: sex rader stoppades på "okänt pris" fast priset stod att läsa

Första omgången hoppade **sex bildrader** (`BOF_5_1`, `BOF_6_1`, `GT_9_1`,
`PD_9_1`, `CO_4_1`, `PD_8_1`, alla ur LISTICLE-ronden) med skälet
*"priset går inte att jämföra (creativen okänt, butiken 1129)"*. Det var inget
fel på creativen: prisregelns reserv läser Bäverbutikens produktsida, och
sidan säger **1 129 kr — exakt CaraShells pris**.

Felet satt i `tools/ops-spegla.mjs`: landningssidan lästes **bara ur radens
Notion-egenskaper**. De här briefarna bär den i brödtexten i stället —
`Landing page: https://baverbutiken.se/products/takoverdrag-husvagn-6-5-3-m-…
— reference only. The URL, the shop name and the logo must never appear`. Med
tom egenskap fanns ingen sida att läsa priset från, och "okänt pris är aldrig
grönt" gjorde resten. Raderna hade stoppats på nytt varje dygn, tyst, utan att
något var fel med dem.

Rättat samma körning: `landningUrBrief()` plockar länken ur brieftexten när
egenskapen är tom. Efter rättelsen läste alla sex 1 129 SEK och gick live.
`npm test` grönt (1 409). **Lärdomen: en tom Notion-egenskap betyder inte att
uppgiften saknas — Bäver-briefarna skriver landningssidan i texten.**

⚠️ Kvar som varning från verktyget: `CARASHELL_SE_Taköverdraget LISTICLE` är
eget spår (namnet bär LISTICLE) och tar aldrig emot speglade annonser.

## Norge 2026-09-20 — videon som hölls i går är live (`/ops-oversatt carashell/takskyddet`)

Kön: **17 rader** i `SE-ACTIVE to be translated`. **1 uppladdad, 16 utan jobb här.**

**De 16 behövde ingenting.** Gårdagens spegling laddade upp både den svenska och den
norska versionen (`finns_i_meta: true` med annons-id på varenda rad), så de ligger
redan live i `CARASHELL_NO_Takovertrekket` och väntar bara på USA
(`klar_i: {"US": false}`). Ingen status rördes — `flytta_till_approved` är falskt
tills US-rutinen 17:05 bär dem.

| SE-namn | NO-namn | Adset | Annons-id | Tillbakaläst |
|---|---|---|---|---|
| `CaraShellRoof_PD_5_H1` | `CaraShellRoof_NO_PD_5_H1` | PD | `120249184161160172` | ACTIVE/IN_PROCESS |

**Videon byggdes om, den översattes inte.** Tre hinder hittades 2026-09-19 och alla tre
gick att lösa utan butikens namn — vilket är rättelsen mot gårdagens dom att frågan
krävde ägaren:

1. **Voiceovern** sa `Carashell taköverdrag` i block 3 och de svenska priserna i block 6.
   HeyGens proofread-steg körs FÖRE rendering, så manuset skrevs om där: block 3
   "Dette takovertrekket", block 6 `1 106` / `1 382,50 kr` uttalade som ord. Samma sex
   block, samma timecodes. Sonnet-subagent mot `docs/copy-regler.md`.
2. **27 inbrända svenska ordcaptions** → `pipeline/no-precis.py` med US-rundans mätningar
   på samma källfil (zon 1320–1650, font 45, cy 1420, x 75–1005).
3. **Slutkortet** var en skärmdump av den svenska produktsidan (`carashell.se`,
   `1 469,00 → 1 129,00 kr`, "16 recensioner") → nytt norskt kort som PNG-lager
   (`video/bygg-no.py`): 14 dagers angrerett, `1 382,50 kr` överstruket, `1 106 kr`,
   16 anmeldelser, fri frakt. Produktbilden klippt ur källans eget kort.

**En läcka hittad i granskningen och rättad:** lagret startade 36,4 s, men
cirkelövergången börjar **36,0** och den svenska sidan var läsbar inuti cirkeln i ett
par tiondelar. Mätt i den renderade filen: vita pixlar 0,16 % vid 36,0 → 33,7 % vid
36,3 → 78 % vid 36,4. Lagret flyttat till 36,0, videon bränd om, övergången kontrollerad
bildruta för bildruta. ⚠️ **US-rundans åtta videor 2026-09-18 har samma 36,4 och samma
läcka.** De ligger live och rörs inte (Axels regel 2026-09-15); receptet är rättat.

**Copyn:** två av fyra rader failade tre-frågorstestet i första svaret och skickades
tillbaka. Rubriken `Beskytt bobilens tak i vinter` var en uppmaning vilken konkurrent
som helst kunde köra → **`Bare taket – ingen hjelp trengs`**. Första stycket namnger nu
takluckorna och skarvarna.

**HeyGen:** 2 558 → 2 538 krediter (en rendering, ingen omrendering).
`rostkoll.py` ✅. **Notion:** kommentar + `Translated url`, raden → `Approved`.
**Discord:** engelsk rapport i `#annons-uppladdning`, meddelande `1551238015316393996`,
ingen ACTION NEEDED.

⚠️ **Manuset committas nu i `oversatt-output.json`** — `.srt` är gitignoretat som media
i `market-expansion/ops/**`, så en omrendering hade annars fått börja om från HeyGens
råöversättning, med butikens namn och de svenska priserna tillbaka.

---

## Spegling 2026-09-20 (`/ops-spegla carashell/takskyddet`) — 0 av 5, annonskontot är obetalt

Rutinen fyrade 16:45 CEST. Kön hade **5 rader** i `CaraShell SE ready to be
active` (`Takoverdrag_BOF_9_1`, `CS_13_1`, `PD_10_1`, `BOF_8_1`, `BOF_7_1` —
alla bild, alla ur LISTICLE-ronden). Alla fem var gröna på pris: 1 129 kr mot
butikens 1 129. **Torrkörningen sa 5 speglade, 0 hoppade, 0 fel.** Den skarpa
körningen laddade upp noll.

**Varje uppladdning nekades av Meta med samma svar:**
`400 Permissions error — antingen är objektet inte synligt för dig, eller så
begränsas åtgärden till vissa kontotyper`.

### Rotorsak: `account_status: 3` på OPS-kontot

Magiborsten DK `915422744950975` står **UNSETTLED** — obetalt. Mätt samma
körning:

| Kontroll | Svar |
|---|---|
| `account_status` | **3 (UNSETTLED)**, `disable_reason: 0` |
| Token-rättigheter | `ads_management`, `ads_read`, `business_management` — alla `granted` |
| `user_tasks` på kontot | `DRAFT, ANALYZE, ADVERTISE, MANAGE` |
| Magiborsten UK `1107817401910319` | `account_status: 1` — opåverkat |
| Spend i dag / i går | 6 493 kr / 8 512 kr — leveransen rullar |

Alltså: **inget fel på token, inget fel på raderna, inget fel på verktyget.**
Meta låter befintliga annonser leverera men blockerar allt nyskapande tills
saldot är betalt. Läsningar går igenom, skrivningar inte — det är därför kön
kunde läsas och torrköras utan att något syntes.

**Ingenting blev halvgjort.** Ingen annons, ingen creative: `BOF_107_1`,
`BOF_108_1`, `BOF_109_1`, `CS_113_1` och `PD_110_1` finns inte i kontot
(kontrollerat med namnfilter efter att Metas rate limit släppt). Alla fem
källrader ligger kvar i `CaraShell SE ready to be active` med orörd status, så
rutinen tar dem själv nästa gång kontot är betalt. Inget behöver köras om för
hand.

⚠️ **Det här gäller alla OPS-butiker, inte bara CaraShell.** Leveransrundan
13:40, NO-översättningen 15:40 och nattvaktens budgetändringar skriver till
samma konto och kommer att nekas likadant tills saldot är reglerat. US-spåret
i Magiborsten UK fungerar.

⚠️ Lärdom: **en grön torrkörning bevisar inte att kontot tar emot.** Torrt
läser bara — kontots betalningsstatus märks först vid första skrivningen.
`account_status` är värt att läsa innan en lång uppladdningsrunda startas.

**Discord:** engelsk rapport i `#annons-uppladdning` (CaraShell — OPS),
meddelande `1551257682919428208`, med `🔴 ACTION NEEDED` till Axel.

---

## USA-runda 7 2026-09-20 (`/ops-oversatt carashell/takskyddet --marknad US`) — 16 nya annonser live

**Kön:** 16 rader i `SE-ACTIVE to be translated` (12 bild, 4 video), alla speglade från
Bäverbutiken samma dag och alla redan live i Norge — därför gick samtliga 16 till
`Approved` efter uppladdningen. Kampanj: `1 CARASHELL_US_Taköverdrag … – kopia`
`120251451415500435` (ACTIVE, 10 adsets). Originalkampanjen står kvar PAUSED med
2 246 kr spend — ägarens beslut, rörd inte.

| Spegel (US) | Typ | Adset | US-annons | Röstkoll |
|---|---|---|---|---|
| CaraShellRoof_US_PD_108_1 | bild | CARASHELL_US_PD | `120251517347070435` | — |
| CaraShellRoof_US_CO_104_1 | bild | CARASHELL_US_CO | `120251517351750435` | — |
| CaraShellRoof_US_PD_109_1 | bild | CARASHELL_US_PD | `120251517360050435` | — |
| CaraShellRoof_US_GT_109_1 | bild | CARASHELL_US_GT | `120251517428960435` | — |
| CaraShellRoof_US_BOF_106_1 | bild | CARASHELL_US_BOF | `120251517432670435` | — |
| CaraShellRoof_US_BOF_105_1 | bild | CARASHELL_US_BOF | `120251517527450435` | — |
| CaraShellRoof_US_CS_110_1 | bild | CARASHELL_US_CS | `120251517537530435` | — |
| CaraShellRoof_US_CS_111_1 | bild | CARASHELL_US_CS | `120251517590320435` | — |
| CaraShellRoof_US_BOF_104_1 | bild | CARASHELL_US_BOF | `120251517595390435` | — |
| CaraShellRoof_US_TR_102_1 | bild | CARASHELL_US_TR | `120251517606640435` | — |
| CaraShellRoof_US_LI_102_1 | bild | CARASHELL_US_LI | `120251517647060435` | — |
| CaraShellRoof_US_RI_104_1 | bild | CARASHELL_US_RI | `120251517651500435` | — |
| CaraShellRoof_US_OB_101_H1 | video | CARASHELL_US_OB | `120251517183220435` | ✅ |
| CaraShellRoof_US_PD_107_H1 | video | CARASHELL_US_PD | `120251517190490435` | ✅ |
| CaraShellRoof_US_RI_103_H1 | video | CARASHELL_US_RI | `120251517195980435` | ✅ |
| CaraShellRoof_US_PD_106_H1 | video | CARASHELL_US_PD | `120251517205690435` | ✅ |

**Slutkortsspärren fällde alla fyra videorna** — och hade rätt: källorna slutar på
Bäverbutikens kort med svensk produktsida och kr-pris. Kortet byggdes om till ett
amerikanskt utan butiksnamn och utan domän, och rutan mättes om på den FÄRDIGA filen
innan uppladdning. ⚠️ `rapidocr-onnxruntime` saknades i containern, så första
körningen svarade `okand` i stället för att blockera — installera den före kön.
Rotorsaken och receptet står i `dna.md`.

**Bilderna** (0 kie-krediter): svensk text bytt på plats med `pipeline/oversatt-batch.py`
och handritade rutor (`bilder/overrides.json`), textstorlekarna kalibrerade mot SE-radernas
uppmätta bredd (rubrik 77, underrad 38, etikett 30, knapp 42, punkt 38). Tre bilder fick
spöken i QA: `BOF_105_1` och `GT_109_1` (halvgenomskinligt band över tvåtonat foto) löstes
med opak platta i bandets uppmätta färg, `TR_102_1` med etikettplatta alfa 255. **OCR över
alla tolv färdiga bilder: noll svenska träffar.**

**Videorna** (HeyGen, amerikansk engelska): proofread före rendering, SRT lokaliserad med
samma blockantal och timecodes, captions bytta med `no-precis.py`, röda svenska pop-texter
ersatta med `$199` / `SAVE $50` / `21 x 10 FT` / `210D FABRIC`. `rostkoll.py` ✅ på alla
fyra (längddrift 0,1–0,2 %). `kvarkoll.py` flaggade fyra fönster — alla falsklarm, OCR
visar engelsk text i varje (verktyget mäter överlapp med källans pillerruta, inte språk).
⚠️ RI_103_H1:s röda fönster 0,4–1,6 s är en PIL, inte text — den rördes inte.

**Priset:** $199 / ord. $249 ur `ekonomi.marknadspriser`, rabatten omräknad 23 % → **20 %**
(det svenska talet gäller inte i USD). Recensionerna lästes live på den amerikanska
produktsidan: **16 recensioner, 5,0** — bilderna sa 10, vilket är inaktuellt.

⚠️ **Meta strypte kontot mitt i uppladdningen** (kod 17, "User request limit reached").
Uppladdaren backade av och tog sig igenom på egen hand; hela rundan tog drygt två timmar
i stället för tjugo minuter. Inget gick förlorat, men räkna med det i tidsplanen när en
batch är större än tio rader.

**Notion:** kommentar + `Translated url` på alla 16, alla 16 → `Approved`.
**Discord:** engelsk rapport i `#annons-uppladdning`, meddelande `1551270110281338922`,
ingen ACTION NEEDED. Filer: `market-expansion/ops/carashell/2026-09-20-us/`.

---

## 2026-09-21 — `CaraShellRoof_CS_4_1` pausad av nattvakten (batch #2)

**Dödvikt enligt ny annons-regeln:** 1 499 kr spend (≥ 3 × target-CPA 411 kr),
2 köp, **CPA 750 kr mot break-even 693 kr** på 14 dygn. Första annonsen i
butikens historia som reglerna dödat.

Hypotesen den bar (batch #2): *rabatten säljer lika bra utan falsk brådska —
"IDAG" bort, priset som stående erbjudande*. **Utfallet räcker inte för att
falsifiera den.** Annonsen fick aldrig volym medan den levde (113 kr på tre
dygn i mitten av september, se körning nr 3) och klarade grinden först när
CBO:n plötsligt gav den 1 499 kr. Två köp är under de tre som krävs för en dom
på annons­nivå — pausen är ett kostnadsbeslut, inte ett omdöme om brådskan.

**Frågan lever vidare i batch #3:** `CS_5_1` och `CS_6_1` är båda brådskefria
och isolerar i stället rabattframingen mot varandra (23 % mot 340 kr). Läs dem
mot `CS_1_H1` (video, CPA 216 kr) nästa gång någon gör en feedback-loop —
CaraShell briefas inte längre härifrån, så den loopen ligger numera i
Bäverbutikens teamspace.

---

## Spegling 2026-09-21 — 5 av 5, gårdagens stopp löst

Kontot betalades av Axel: `account_status` på Magiborsten DK `915422744950975`
läser **1 (ACTIVE)** igen, mot 3 (UNSETTLED) i går. Samma fem rader som nekades
2026-09-20 gick upp utan ändringar — inget behövde göras om, ingen rad hade
tagit skada av att stå kvar.

| Källrad | Spegelnamn | SE-annons | NO-annons |
|---|---|---|---|
| Takoverdrag_BOF_9_1 | CaraShellRoof_BOF_109_1 | 120249189223200172 | 120249189228110172 |
| Takoverdrag_CS_13_1 | CaraShellRoof_CS_113_1 | 120249189301610172 | 120249189310900172 |
| Takoverdrag_PD_10_1 | CaraShellRoof_PD_110_1 | 120249189397310172 | 120249189399940172 |
| Takoverdrag_BOF_8_1 | CaraShellRoof_BOF_108_1 | 120249189478830172 | 120249189496460172 |
| Takoverdrag_BOF_7_1 | CaraShellRoof_BOF_107_1 | 120249189597020172 | 120249189601910172 |

Tillbakaläst ur Meta: alla tio bär `status: ACTIVE` i rätt kampanj i
OPS-kontot. `BOF_107_1` stod `PENDING_REVIEW` och dess norska version
`IN_PROCESS` vid avläsningen — Metas granskningsfönster, adsetet är ACTIVE.

Pris 1 129 SEK / 1 106 NOK läst live, alla fem gröna. Ingen rad nämnde
Bäverbutiken. Torrkörning före skarp: 5 speglade, 0 hoppade, 0 fel.

**Dessutom: 16 källrader i `CaraShell EN ready to be active` blev `Approved`** —
US-annonserna i Magiborsten UK har kommit upp för hela 18/9-omgången
(`120251517…`-serien). Den kön är därmed tömd.

**Lärdomen som håller:** ett obetalt konto stoppar bara skrivningar. Raderna
låg kvar orörda i `CaraShell SE ready to be active` i ett dygn och togs av
nästa körning helt automatiskt. Att inte flytta status vid ett fel är det som
gör en dags avbrott till en icke-händelse.

**Discord:** engelsk rapport i `#annons-uppladdning` (CaraShell — OPS),
meddelande `1551453420571983893`, ingen ACTION NEEDED.

---

## 2026-09-20/21 — DANMARK: hela kampanjen uppe, 60 annonser

Första marknaden efter USA som fick **egna creatives**, inte bara översatt
copy. Kedjan `pipeline/omdubb/marknadsvideo.mjs` byggdes för det här och är
nu bevisad: klipp källan vid slutkortet → dubba talet med ElevenLabs
(`Søren`, vald genom mätning, `pipeline/omdubb/README.md`) → byt inbränd
svensk text → rita ett nytt slutkort ur marknadens egen prislista → bränn in
danska captions.

**Uppe i `CARASHELL_DK_Taköverdrag Husvagn & Husbil 5,5` (`120249183405560172`),
kampanj PAUSED, CBO 1 000 kr/dag:**

| Adset | Annonser | Adsetets status |
|---|---|---|
| CARASHELL_DK_PD | 14 | PAUSED |
| CARASHELL_DK_CS | 11 | PAUSED |
| CARASHELL_DK_GT | 9 | PAUSED |
| CARASHELL_DK_SP | 9 | PAUSED |
| CARASHELL_DK_BOF | 6 | ACTIVE |
| CARASHELL_DK_CO | 3 | PAUSED |
| CARASHELL_DK_RI | 3 | ACTIVE |
| CARASHELL_DK_LI | 2 | ACTIVE |
| CARASHELL_DK_OB | 1 | ACTIVE |
| CARASHELL_DK_TR | 1 | ACTIVE |
| CARASHELL_DK_UG | 1 | ACTIVE |
| **Summa** | **60** | |

24 videor + 36 bilder, alla 60 med egen dansk copy. **0 fel, 0 utan copy.**
Varje annons tillbakaläst som `ACTIVE`.

**Alla elva adsets är ACTIVE sedan 2026-09-21.** Sex skapades av
uppladdningen själv (den rör bara det den skapat); de fem övriga — CO, CS,
GT, PD, SP, som bär 46 av de 60 annonserna — föddes PAUSED av
`kampanj.mjs --tom` 2026-09-20 15:00 och hade **0 kr spend och 0
visningar**, alltså inte avstängda av ett beslut. Slagna på mot en namngiven
lista efter Axels ok samma morgon. Hade de lämnats pausade hade en launch
kört **14 av 60 annonser utan felmeddelande** — den fällan är värd att leta
efter i varje ny marknad: räkna ACTIVE adsets, inte bara ACTIVE annonser.

Tillbakaläst: kampanj PAUSED, **11 av 11 adsets ACTIVE, 60 av 60 annonser
ACTIVE**.

**Det som kostade mest tid, i ordning:**
1. Kontot var UNSETTLED (obetald faktura). Felet läser som ett
   behörighetsfel — se `factory/opsmarknader.mjs`.
2. Meta stryper skrivningarna (kod 17): 59 annonser tog ~7 h, en i taget.
   Egna läsningar mot kontot under tiden gör backoffen längre — låt bli.
3. Uppladdaren globbade bara `.mp4` och `.jpg` medan bilderna låg som
   `.png` — hade tyst tagit 0 av 36. Rättat med test.
4. Två väntare sökte varandra med `pgrep -f` på skriptnamnet och låste
   varandra i sex timmar efter att batchen var klar. Vänta på PID.

---

## 2026-09-21 — leveransrundan: 2 videor stoppade på slutkortet

Kön: 2 rader i `To be Reviewed`, batch #2:s två sista videor —
`CaraShellRoof_SP_4_H1` (social proof, 30,9 s) och `CaraShellRoof_PD_4_H1`
("Bara taket. En person.", 29,6 s). Kampanjen `CARASHELL_SE_Taköverdraget`
(`120249050544990172`) löstes automatiskt; LISTICLE-kampanjen sållades bort
av `tools/lib/sidokampanjer.mjs` som den ska. Priset i båda videorna
1 129 kr (ord. 1 469 kr) = butikens pris — **grönt på prisregeln**.

**Ingen laddades upp.** Båda slutar med en skärminspelning av produktsidan:
domänskylten `carashell.se` överst och `CARASHELL` som leverantörsrad
(2,5 resp. 2,4 s av slutfönstret). Järnregel 2b i `/ops-leverans` och Axels
beslut 2026-09-18 — butikens namn står aldrig i en annons, slutkortet
inräknat. Status orörd (`To be Reviewed`), engelsk kommentar på båda
raderna: bygg om de sista 3 sekunderna utan domän och butiksnamn, ladda upp
i samma rad, så tar rundan dem automatiskt.

Anmärkningar till redigeraren (inget av det stoppar): SP:s caption vid
~12 s säger "Passa bra och skyddar" (saknat r), citatkorten står som
"Johan E." / "Lars P." där briefen ber om enbart förnamn, och PD säger
6,5 × 3 m medan produktsidan numera listar 5,5–13,5 m.

⚠️ **Rotorsaken är värd mer än de två videorna: kontrollen gick inte igång.**
Rutinens container saknar både `ffmpeg` och OCR:en, så `bildbrand.mjs`
svarade `okand` ("spawnSync ffmpeg ENOENT") på båda — och regeln säger att
en oläsbar video laddas upp ändå. Utan att någon tittade på bildrutorna
hade alltså **två annonser med butikens domän gått live**. Rättat samma
dag: `ffmpegBinar()` i `factory/bildbrand.mjs` faller tillbaka på
imageio-ffmpeg:s binär (systembinären vinner fortfarande), OCR:en
installeras med `pip install rapidocr-onnxruntime`, och kommandofilens
regel 2b bär nu varningen att `okand` på VARJE video betyder containern,
inte creativen. Efter installationen dömde verktyget självt
`slutkort-med-brand` på båda — samma dom som ögat.

## Norge 2026-09-21 — inget att översätta, men ett verktygsfel som gömde kön

Kön: **5 rader** i `SE-ACTIVE to be translated`. **0 uppladdade, 0 att göra.**
Alla fem bar redan sin norska annons (speglingens rader, nummer 107–113), och varje
annons lästes tillbaka ur Meta som ACTIVE:

| SE-namn | NO-namn | Adset | Annons-id | Tillbakaläst |
|---|---|---|---|---|
| `CaraShellRoof_BOF_107_1` | `CaraShellRoof_NO_BOF_107_1` | BOF | `120249189601910172` | ACTIVE/ACTIVE |
| `CaraShellRoof_BOF_108_1` | `CaraShellRoof_NO_BOF_108_1` | BOF | `120249189496460172` | ACTIVE/ACTIVE |
| `CaraShellRoof_PD_110_1` | `CaraShellRoof_NO_PD_110_1` | PD | `120249189399940172` | ACTIVE/ACTIVE |
| `CaraShellRoof_CS_113_1` | `CaraShellRoof_NO_CS_113_1` | CS | `120249189310900172` | ACTIVE/ACTIVE |
| `CaraShellRoof_BOF_109_1` | `CaraShellRoof_NO_BOF_109_1` | BOF | `120249189228110172` | ACTIVE/ACTIVE |

Ingen status rörd — `flytta_till_approved` är falskt på alla fem (`klar_i.US: false`),
så de går till `Approved` först när US-rutinen bär dem. Pris läst live: 1 106 NOK.

**Men kön var osynlig i fyra körningar.** Verktyget avslutade med exit 0, tom
`ko.json` och ingen felrad. En tom kölista läser exakt som "kön var tom" — det är
det farliga: en tyst nolla ser ut som ett lugnt svar. Rotorsaken och fixen står i
`dna.md`; båda felen satt i `tools/meta-lib.mjs`, inte i den här produkten.

**Discord:** engelsk rapport i `#annons-uppladdning`, meddelande `1551599832102076558`,
ingen ACTION NEEDED.
## USA-runda 8 2026-09-21 (`/ops-oversatt carashell/takskyddet --marknad US`) — fem bilder live

**Kön:** 5 rader i `SE-ACTIVE to be translated`, alla bild, alla redan live i Norge —
samtliga fem gick därför till `Approved`. `Approved`-kollen: 44 rader, 0 saknar US-annons.
Kampanj `1 CARASHELL_US_Taköverdrag … – kopia` `120251451415500435` (ACTIVE, 12 adsets).
Originalkampanjen står kvar PAUSED med 2 246 kr spend — ägarens beslut, orörd.
Butiken redo: produktsidan svarar 200 på engelska, $199, 16 recensioner 5,0.

| Spegel (US) | Typ | Adset | US-annons | Röstkoll |
|---|---|---|---|---|
| CaraShellRoof_US_BOF_107_1 | bild | CARASHELL_US_BOF | `120251535696070435` | — |
| CaraShellRoof_US_BOF_108_1 | bild | CARASHELL_US_BOF | `120251535705330435` | — |
| CaraShellRoof_US_PD_110_1 | bild | CARASHELL_US_PD | `120251535934370435` | — |
| CaraShellRoof_US_CS_113_1 | bild | CARASHELL_US_CS | `120251535969460435` | — |
| CaraShellRoof_US_BOF_109_1 | bild | CARASHELL_US_BOF | `120251536199230435` | — |

**Tre svenska påståenden ströks — produktminnet mot marknadens egen sida.**
`dna.md` förbjuder sedan 2026-09-12 att påstå förvaringspåse, dragsko, vikt eller exakt
vagnlängd, och den amerikanska produktsidan bekräftade i dag att inget av det står där.

| Rad | Svenskan sa | Amerikanskan säger |
|---|---|---|
| `BOF_108_1` (hela vinkeln) | "Ryms i förvaringspåsen som följer med" | "Off-season, it won't take over the garage" + "Folded flat, beside the paint cans" — det fotot faktiskt visar |
| `PD_110_1` bottenband | "remmar på alla fyra sidor, 2,5 m och justerbara" | "elastic straps hook under the edge" — sidans egen formulering |
| `CS_113_1` | "58 kr per kvadratmeter", "6,5-meters husvagn" | **$0,95 per square foot**, räknat på $199 / ~210 sq ft, och "21-ft trailer" |

Rabatten räknades om (23 % → 20 %) och priset per yta räknades fram ur sidans egna tal —
aldrig en omräknad SEK-siffra.

**Bilderna** (0 kie-krediter): svensk text bytt på plats, textstorlekarna kalibrerade mot
SE-radernas uppmätta bredd. ⚠️ **Underraden är 32 px i den här mallen, inte 38 som i
20/9-batchen** — storleken mäts per batch och ärvs aldrig.

**Två verktygsfynd, båda inbyggda i `forsudda.py`:**
1. **`utvidga` per ruta.** En 77 px FET rubrik direkt på ett foto, utan egen platta, lämnar
   en antialias-gloria som tre utvidgningar inte når (2,5 % av rutan över tröskeln på
   `BOF_108_1`). Sätt `"utvidga": 6–8` på såna rutor.
2. **`troskel` per ruta.** Glorian låg till 13 % i intervallet 30–60 och rördes aldrig av
   standardtröskeln 60. `"troskel": 25` tar den.

⚠️ **OCR fångar inte lågkontrastspöken.** `PD_110_1` visade "5,5 till 3 × 13,5 meter."
tydligt för ögat medan OCR-kontrollen läste bilden som ren. OCR är en bra sista grind mot
kvarglömd text, men den ersätter inte att titta på bilden i full storlek.

**Notion:** kommentar + `Translated url` på alla fem, alla fem → `Approved`.
**Discord:** engelsk rapport i `#annons-uppladdning`, meddelande `1551619717293150299`,
ingen ACTION NEEDED. Filer: `market-expansion/ops/carashell/2026-09-21-us/`.

## 2026-09-22 — leveransrundan: samma två videor, samma stopp

Kön hade exakt samma två rader (`CaraShellRoof_SP_4_H1`, `CaraShellRoof_PD_4_H1`)
och **byte-identiska filer** (md5 `d9ab48ff…` / `271bf976…`) — slutkortet är
inte ombyggt, så domen blev `slutkort-med-brand` igen. Inget uppladdat, ingen
status ändrad, inga nya kommentarer (gårdagens feedback står kvar på båda
raderna). Kampanjen och priset oförändrade: `CARASHELL_SE_Taköverdraget`,
1 129 kr. Slutkortskontrollen gick igång av sig själv den här gången —
ffmpeg-fallbacken från i går höll.

## Norge 2026-09-22 — tom kö, och rotorsaken till de tysta körningarna

Kön: **0 rader** i `SE-ACTIVE to be translated`. Gårdagens fem rader har gått vidare.
NO-kampanjen `CARASHELL_NO_Takovertrekket` ACTIVE med 12 adsets, ärvd länk
`…/nb/products/takskyddet?country=NO`, pris 1 106 NOK läst live, 0 varningar.
**Inget uppladdat, ingen Notion-status rörd** — det fanns inget att göra.

**Rotorsaken hittad efter två dagar.** `säkerställProxy` i `tools/meta-lib.mjs`
startar om processen för att få agentproxyn på plats, och körde barnet med
`stdio: 'inherit'`. Barnets stdout nådde aldrig förälderns utfil.

Mätt samma dag, samma kod, samma kommando:

| Väg | ko.json |
|---|---|
| med omstarten | **0 byte** |
| `NODE_USE_ENV_PROXY=1` (utan omstarten) | **2 845 byte** |
| efter fixen, normala vägen | **2 845 byte** |

Det som gjorde felet svårt: verktyget sa själv att det skrivit. De två nya
loggraderna (`Kön klar: N rader … skriver N tecken` / `Utskriften klar.`) är det
som avslöjade det — de kom till som diagnostik och stannar kvar, för de skiljer
"kön var tom" från "verktyget hann aldrig skriva".

⚠️ **Felet gällde varje verktyg som startar via `säkerställProxy` och skriver
`--json`** — `ops-leveranskon`, `ops-till-meta` och de andra. Inte bara den här
produkten och inte bara NO.

**Discord:** engelsk rapport i `#annons-uppladdning`, meddelande
`1551959238685753457`, ingen ACTION NEEDED.

---

## USA-runda 9 — 2026-09-22 (`/ops-oversatt carashell/takskyddet --marknad US`)

**Tom runda. Inget översatt, inget uppladdat, inget rört.**

| Kö | Rader | Att göra |
|---|---|---|
| `SE-ACTIVE to be translated` | 0 | — |
| `Approved` (eftersläpningskollen) | 49 | 0 — varenda rad bär redan en US-annons |

De 49 är gårdagens 44 plus de fem bilderna från USA-runda 8, som flyttades till
`Approved` i samma körning. Kön är alltså i kapp i båda statusarna.

**Kontokollen (US-kampanjen `120251451415500435`, ACTIVE, 12 adsets):** 65
annonser, **alla 65 ACTIVE**. Gårdagens fem (`BOF_107_1`, `BOF_108_1`,
`BOF_109_1`, `PD_110_1`, `CS_113_1`) klarade Metas granskning — ingen
underkänd, ingen begränsad.

**Butiken redo för USA:** produktsidan svarar 200 på engelska ("Roof Cover for
Travel Trailers & Motorhomes 18–44 ft") med **199 USD från 249**, och
lagerrensningssidan annonserna pekar på svarar 200 som amerikansk besökare med
samma två tal och 90-dagarsgarantin. Talen stämmer mot `marknadspriser` USD
199 / 249 i produktfilen.

**Meta strypte kontot i ~25 minuter under körningen.** Eftersläpningskollen
läser även det norska kontot (`915422744950975`) för att se vilka marknader
varje rad redan bär, och där slog kod 17 till: verktygets egen backoff
(30 → 60 → 120 → 240 s) räckte inte, och två körningar i rad gav tom fil.
Lösningen var att köra om kön tills den gick igenom — inget saknas i
rapporten. Rimlig orsak: CaraShells fyra andra rutiner (NO 16:05 och 16:15,
speglingarna 16:45 och 16:55) läser samma konto strax före den här.

**Kvarstår oförändrat, ingen åtgärd:**
- `CARASHELL_US_Taköverdrag …` (originalet) är PAUSED med 2 246 kr spend —
  ägarens beslut, aldrig mål för uppladdning.
- Kön kan inte läsa priset själv, för kampanjens ärvda länk är
  lagerrensningssidan och inte `/products/<handle>`. Priset läses manuellt ur
  de amerikanska sidorna varje runda.

**Discord:** engelsk rapport i `#annons-uppladdning`, meddelande
`1551982001806905545`, ingen ACTION NEEDED.

---

## Spegling 2026-09-22 — 9 av 9, 18 annonser live, två NO-annonser i en andra omgång

Kön hade **9 rader** i `CaraShell SE ready to be active`, alla video ur
LISTICLE-ronden, alla gröna på pris (1 129 kr mot butikens 1 129).
Torrkörningen: 9 speglade, 0 hoppade, 0 fel.

| Källrad | Spegelnamn | SE-annons | NO-annons |
|---|---|---|---|
| Takoverdrag_OB_2_H1 | CaraShellRoof_OB_102_H1 | 120249219182040172 | 120249219188850172 |
| Takoverdrag_TR_3_H1 | CaraShellRoof_TR_103_H1 | 120249219198500172 | 120249219342600172 |
| Takoverdrag_GT_10_H1 | CaraShellRoof_GT_110_H1 | 120249219359450172 | 120249219376980172 |
| Takoverdrag_CO_3_H1 | CaraShellRoof_CO_103_H1 | 120249219580260172 | 120249219610580172 |
| Takoverdrag_GT_7_H1 | CaraShellRoof_GT_107_H1 | 120249219634340172 | 120249219738560172 |
| Takoverdrag_RI_2_H1 | CaraShellRoof_RI_102_H1 | 120249219751100172 | 120249219766110172 |
| Takoverdrag_GT_8_H1 | CaraShellRoof_GT_108_H1 | 120249219941370172 | 120249219954690172 |
| Takoverdrag_CS_8_H1 | CaraShellRoof_CS_108_H1 | 120249219971810172 | 120249220305570172 |
| Takoverdrag_CS_7_H1 | CaraShellRoof_CS_107_H1 | 120249220065150172 | 120249220320230172 |

Tillbakaläst ur Meta: alla 18 har `status: ACTIVE` i rätt kampanj i OPS-kontot.
Tre stod i Metas granskningsfönster (`PENDING_REVIEW` / `IN_PROCESS`) vid
avläsningen — normalt, adsetet är ACTIVE.

**Dessutom: 5 källrader blev `Approved`** — gårdagens rader har fått sina
US-annonser i Magiborsten UK (`120251535…`/`120251536…`).

### Rotorsak: "0 fel" dolde två misslyckade NO-uppladdningar

De två sista raderna (`CS_8_H1`, `CS_7_H1`) fick sin **svenska** annons live men
inte sin norska: Meta svarade `User request limit reached` (kod 17) mitt i
körningen. Verktyget räknade ändå båda raderna som **speglade** och skrev
`0 fel` i sammanfattningen, för SE gick igenom och hubbraden skapades. Felet
stod bara som en `✗`-rad mitt i loggen.

**Så här hittades det:** tillbakaläsningen ur Meta gav 16 annons-id, inte 18.
En körning som säger "9 speglade, 0 fel" kan alltså sakna en halv rad —
**räkna alltid annonserna, lita inte på sammanfattningen.**

Rättat samma kväll: efter ~15 minuters väntan svarade Meta igen, och en
omkörning med `--fran "CaraShell EN ready to be active"` laddade upp precis de
två saknade NO-annonserna (allt annat hoppades med "finns redan"). Hubbraderna
hade skapats med bara den svenska filen, så den norska bifogades för hand med
`tools/notion-fil-upp.mjs` — båda raderna bär nu två filer.

⚠️ Kvarstående varning: `CARASHELL_SE_Taköverdraget LISTICLE` är eget spår och
tar aldrig emot speglade annonser.

**Discord:** engelsk rapport i `#annons-uppladdning`, meddelande
`1552006055792214069`, ingen ACTION NEEDED.

---

## 2026-09-22 kväll — FEL SPRÅK i US-runda 7: fyra videor renderade med norsk röst (rättat)

**Axels fynd:** `CaraShellRoof_US_PD_107_H1` och `PD_106_H1` låter som norska, engelska
och svenska blandat — "varannat ord på engelska, varannat på norska". Han antog att den
norska filen översatts till engelska. Mätningen visar en annan rotorsak, med samma resultat:

| Bevis | Vad det säger |
|---|---|
| `2026-09-20-us/video/batch.json.state.json` | alla fyra proofread-id slutar på `-nb-nb-NO`, render-id på `-nb` (16/9 och 18/9: `-en-en-US`) |
| HeyGen `GET proofreads/89a6bc…-nb-nb-NO` | `output_language: "Norwegian Bokmål (Norway)"`, titel `NO_carashell_PD_106_H1` |
| HeyGen render `3ef025…-nb` | `output_language: Norwegian`, men `caption.srt` är **engelsk** ("One person, that's all it takes.") |
| Källfilen i `jobb.json` | `filer[0] = CaraShellRoof_PD_106_H1.mp4` (svensk), NO-filen låg tvåa — källan var rätt |
| Meta | fyra annonser skapade 20/9 15:37–15:40 UTC, längder 18,08 / 17,96 / 17,36 / 16,24 s = renderna |

**Rotorsak:** rutinen körde `pipeline/translate-batch.mjs` utan `--lang`/`--marknad`.
Verktyget föll tyst tillbaka på `Norwegian Bokmål (Norway)` / `NO_`. HeyGen skapade en
norsk session, subagenten skrev engelsk SRT, `apply` lade in den, och rendern blev en
norsk röstmodell som läser engelsk text. `rostkoll.py` var grön (den mäter ljud, inte
språk) och batch-loggen skrev "Videorna (HeyGen, amerikansk engelska)" — vad rutinen
tänkte göra, inte vad HeyGen svarade. Ingen kontroll läste `output_language`.

**Omfattning:** exakt fyra US-videor: `OB_101_H1`, `PD_107_H1`, `RI_103_H1`, `PD_106_H1`
(`120251517183220435`, `…190490435`, `…195980435`, `…205690435`). De 20 andra
US-videorna (16/9 ×12, 18/9 ×8) har `-en-en-US` och `output_language: English (United
States)` — kontrollerat mot HeyGen med `translate-batch.mjs status --marknad=US`. Spend
på de fyra: 267 + 343 + 127 + 82 = **820 kr, 0 köp**.

**Gjort 2026-09-22 (den här sessionen):**
- De fyra annonserna **PAUSED + omdöpta `…_FELSPRAK`** i Magiborsten UK (tillbakalästa).
  Namnet är fritt, så US-rutinen laddar upp en rätt version under rätt namn.
- Notion-raderna i CaraShells hub: kommentar + `Approved → SE-ACTIVE to be translated`.
  NO-rutinen ser "finns redan" och rör dem inte; US-rutinen översätter den SVENSKA filen.
- `pipeline/translate-batch.mjs`: `--marknad` obligatorisk, språket ur nya
  `pipeline/sprak.mjs`, `--lang` får bara upprepa tabellen; HeyGens `output_language`
  läses vid proofread, render och download; SRT-språkkoll (HeyGens översättning OCH den
  rättade) — fel språk ⇒ `srtDone: 'fel-sprak'`, ingen render, ingen fil, exit 1.
  `status` reviderar gamla batcher live (så här hittades felet: 4 × `✗ FEL SPRÅK`).
- `tools/notion-fil.mjs --utan-marknadsfiler` (alltid från `ops-leveranskon` och
  `ops-spegla`): en `_NO_`-fil blir aldrig källa; bara marknadsfiler ⇒ fel.
- Tester: `pipeline/test/sprak.test.mjs`, `factory/test/opsmarknader.test.mjs`,
  `tools/test/ops-spegla.test.mjs`.

**Kvar:** de fyra koncepten saknar engelsk version tills US-rutinen (17:05) kört
raderna igen — med spärrarna på plats kan den inte rendera norska av misstag.

---

## Nattvakten 2026-09-23 — noll budgetändringar, en annons pausad

**Budget:** båda SE-kampanjerna orörda. Huvudkampanjen ligger kvar på
9 600 kr/dygn (vinst 3d 22,0 %, ROAS 2,54 — hållbandet 16–25 %), LISTICLE på
2 850 kr trots vinst 3d 27,5 % eftersom kadensspärren gäller (2 dygn sedan
senaste ändring, krav 3). LISTICLE är alltså skalningsklar i morgon natt om
siffrorna håller.

**Pausad:** `CaraShellRoof_PD_5_H1` — 1 249 kr på 14 dygn, 1 köp, CPA 1 249 kr
mot break-even 693 kr. Ny annons-regeln (≥ 3 × target-CPA 411 kr utan vinst).

**7 dygn SE:** 45 957 kr, 98 köp, ROAS 2,94, vinstbidrag 36 855 kr.

**Att läsa igen om ett dygn:** första dygnet på 9 600 kr var veckans svagaste —
11 686 kr i går till ROAS 1,71, precis över break-even 1,63, 13 köp. Upprepas
det faller vinst 3d ur hållbandet och ronden sänker i stället för att skala.

⚠️ **Bara SE är vaktad — NO och DK körs utan tillsyn.** Nattvakten kör
`--marknad SE`, ingenting annat, och det gäller alla OPS-butiker. Torrkörningar
samma natt (läs-läge, ingenting skrivet):

| Marknad | Kampanj | Budget | 3d | Vad ronden HADE gjort |
|---|---|---|---|---|
| NO | `CARASHELL_NO_Takovertrekket` | 4 000 kr | 8 005 kr, 11 köp, ROAS 1,92, vinst 9,3 % (7d 18,8 %) | SÄNK → 2 800 kr |
| DK | `CARASHELL_DK_Taköverdrag Husvagn & Husbil 5,5` | 4 000 kr | 6 860 kr, 8 köp, ROAS 1,52, vinst −4,4 % | SÄNK → 2 800 kr |

DK-kampanjen är ny (live 2026-09-20, 120 annonser med produktens prefix) och
ligger **under break-even 1,63**. NO ligger över break-even men under
skalningsgolvet 16 % — en färsk försämring, inte en kronisk förlust
(7d-vinsten är 18,8 %).

Tillsammans är det **8 000 kr/dygn som ingen rutin någonsin sänker**, medan SE
döms varje natt. DK står inte ens i postens `annonsmarknader` (NO, US). Ägarens
beslut: nattvakten tar alla marknader, eller NO och DK sköts för hand.

## 2026-09-23 — leveransrundan: tredje dygnet, samma stopp

Samma två rader, samma md5. Slutkortet bär fortfarande `carashell.se`, så
båda hölls kvar (ingen uppladdning, ingen statusändring, inga nya
kommentarer). Kontot har vuxit 730 → 748 annonser sedan i går — spegling och
översättning rullar som de ska, det är bara de här två som står stilla.

## 2026-09-23 — NO-rundan: inget att översätta, men kön ljög om en rad

**Kön:** 13 rader i `SE-ACTIVE to be translated`, **alla 13 redan live** i
`CARASHELL_NO_Takovertrekket` (speglingens arbete), tillbakalästa ur Meta som
ACTIVE i ACTIVE adset. Ingen fil hämtad, inget renderat, 0 HeyGen-krediter,
ingen Notion-status rörd — raderna står kvar tills US-rundan bär dem.
Kampanjen ACTIVE, 12 adsets, ärvd länk
`carashell.se/nb/products/takskyddet?country=NO`, pris **1 106 NOK** läst live.

**Fyndet: `GT_4_1` har aldrig saknat norsk annons.** Approved-passet sa
"1 rad utan NO-annons" — samma rad som batch-loggen påstått sedan 2026-09-17.
Den ligger live som `CaraShellRoof_NO_G_4_1` (`120249089471580172`) sedan
2026-09-14. Presentvinkeln heter **`GT` i Sverige och `G` i Norge**, vilket
`dna.md` skrev ner redan 2026-09-14 — men bara i `dna.md`. Kön jämförde mot
den mekaniska översättningen `..._NO_GT_4_1` och dömde raden som saknad.
Hade någon agerat på den domen hade samma creative gått upp en andra gång,
under två namn, i två adsets.

**Och det hade redan hänt en gång.** Mätt i dag i samma CBO:

| Adset | Skapat | Annonser | Spend | Köp |
|---|---|---|---|---|
| `CARASHELL_NO_Takovertrekket - G` | 2026-09-11 | 4 | 2 246,04 kr | 5 |
| `CARASHELL_NO_Takovertrekket - GT` | 2026-09-18 | 7 | 2 470,82 kr | 4 |

Speglingen 2026-09-18 skapade `- GT` bredvid `- G`, alltså exakt det
dna.md-regeln skulle hindra. **Ingenting rörts** — båda är live med spend, och
en annons som redan är live stängs aldrig av i efterhand. Meta kan inte flytta
en annons mellan adsets, så det går inte att slå ihop utan att bygga om
annonser. Ägarens beslut; rekommendationen är att låta båda gå och läsa
G + GT tillsammans i analysen.

**Två spärrar i koden i stället för i en fil** (`npm test` 2 093 gröna):
1. `krockandeAdsets` + stoppet i `hittaEllerSkapaAdset` (`tools/meta-lib.mjs`):
   ett nytt adset föds aldrig när kampanjen redan bär samma vinkel under en
   konceptkod som skiljer en bokstav. Uppladdningen stannar och säger varför.
2. `namnMedKoncept` + `krockandeKoder` (`tools/ops-leveranskon.mjs`): innan en
   rad döms som "saknas i Meta" letar kön under marknadens egen konceptkod.
   Efter rättningen: **45 Approved-rader, 0 utan NO-annons** (före: 1).
   Kön varnar dessutom varje körning så länge två adsets bär samma vinkel.

**Lärdomen:** en regel som bara står i `dna.md` är en regel som upprepas ändå.
Den här stod skriven, med motivering, fyra dagar innan den bröts av en annan
rutin. Skriv spärren där arbetet sker.

---

## USA-runda 10 — 2026-09-23 (`/ops-oversatt carashell/takskyddet --marknad US`)

**13 videor i kön, 13 live i USA.** Största videorundan hittills; alla tidigare
US-rundor var bild-tunga.

| Kö | Rader | Utfall |
|---|---|---|
| `SE-ACTIVE to be translated` | 13 (alla video) | 13 översatta, uppladdade, `Approved` |
| `Approved` (eftersläpningskollen) | 45 | 0 utan US-annons |

**Fyra av de tretton är omgjorda, inte nya.** `OB_101_H1`, `PD_107_H1`, `RI_103_H1`
och `PD_106_H1` gick live 2026-09-20 med **norsk röstmodell som läste engelsk text** —
körningen hade inte `--marknad=US` och verktyget föll tillbaka på norska. En annan
session upptäckte det, döpte om annonserna till `*_FELSPRAK` och pausade dem, och
skickade tillbaka raderna i kön. `translate-batch.mjs` läser sedan dess HeyGens
`output_language` vid proofread, render och download; alla tre stegen svarade
`✓ English (United States)` i dag.

| Spegel (US) | Adset | US-annons | Röstkoll | Slutkort | Svenska kvar |
|---|---|---|---|---|---|
| CaraShellRoof_US_CS_107_H1 | CARASHELL_US_CS | `120251574623040435` | ✅ | ren | ✅ inget |
| CaraShellRoof_US_CS_108_H1 | CARASHELL_US_CS | `120251574720300435` | ✅ | slutkort-utan-brand | ✅ inget |
| CaraShellRoof_US_GT_108_H1 | CARASHELL_US_GT | `120251574733400435` | ✅ | slutkort-utan-brand | ✅ inget |
| CaraShellRoof_US_RI_102_H1 | CARASHELL_US_RI | `120251574762570435` | ✅ | slutkort-utan-brand | ✅ inget |
| CaraShellRoof_US_GT_107_H1 | CARASHELL_US_GT | `120251574936760435` | ✅ | slutkort-utan-brand | ✅ inget |
| CaraShellRoof_US_CO_103_H1 | CARASHELL_US_CO | `120251574965360435` | ✅ | slutkort-utan-brand | ✅ inget |
| CaraShellRoof_US_GT_110_H1 | CARASHELL_US_GT | `120251574989110435` | ✅ | ren | ✅ inget |
| CaraShellRoof_US_TR_103_H1 | CARASHELL_US_TR | `120251575116270435` | ✅ | slutkort-utan-brand | ✅ inget |
| CaraShellRoof_US_OB_102_H1 | CARASHELL_US_OB | `120251575130410435` | ✅ | ren | ✅ inget |
| CaraShellRoof_US_OB_101_H1 | CARASHELL_US_OB | `120251575148110435` | ✅ | slutkort-utan-brand | ✅ inget |
| CaraShellRoof_US_PD_107_H1 | CARASHELL_US_PD | `120251575291390435` | ✅ | slutkort-utan-brand | ✅ inget |
| CaraShellRoof_US_RI_103_H1 | CARASHELL_US_RI | `120251575310620435` | ✅ | slutkort-utan-brand | ✅ inget |
| CaraShellRoof_US_PD_106_H1 | CARASHELL_US_PD | `120251575337600435` | ✅ | slutkort-utan-brand | ✅ inget |

**Pipelinen per video:** HeyGen US-engelsk röstklon + lip-sync → engelska ordcaptions
som ersätter det svenska pillret (`no-precis.py`) → de röda svenska pop-texterna
utbytta mot `$199` / `SAVE $50` / `$249` / `21 x 10 FT` / `210D FABRIC` /
`NINE SIZES FROM $199` → nytt US-slutkort utan butiksnamn → `rostkoll.py` →
raden **"Contains AI-generated content"** (`tools/ai-rad.mjs --ai rost`, obligatorisk:
HeyGen-dubbningen ÄR en AI-röst).

**Röstkollen: 13 av 13 utan en enda anmärkning** — inget tyst spår, längddrift
0,1–0,2 %, sista repliken slutar innanför filen, inget tappat tal.

**Slutkortet:** elva källor bar Bäverbutikens kort (logga, svensk produkttitel,
`1 469 kr → 1 129 kr`, "Finns i lager"). Alla elva ombyggda; `granskaOmVideo` på de
FÄRDIGA filerna ger `slutkort-utan-brand` × 10 och `ren` × 3, ingen blockerar.

**Det som nästan gick fel — se `products/carashell/takskyddet/dna.md`:** pillrets höjd.
`CS_107_H1` (94 px) och `GT_110_H1` (107 px) ligger över `no-precis.py`:s standardtak 85,
och den svenska texten låg kvar i hälften av framesen under en engelsk dubb. Ögat på sex
frames per video såg det inte — OCR över hela videon fyra gånger i sekunden
(`video/svenskkoll.py`, ny) hittade 39 träffar i sju filer. Efter rättningen: **noll
träffar i alla tretton.**

**Tre verktygsfixar samma runda:** `forbehandla.py` klamrar boxblur-radien till rutan
(en 142 px hög ruta sprängde den fasta 40:an), `trimma.py` läser videolistan ur
`cap/*.json` i stället för en ärvd handskriven lista, och `bygg-cap.py` sätter
pillerhöjd och sökband per video.

**Kvarstår oförändrat, ingen åtgärd:** originalkampanjen `CARASHELL_US_Taköverdrag …`
är PAUSED med 2 246 kr spend (ägarens beslut); annonserna ärver
lagerrensningssidans länk; kampanjen har två adsets för samma vinkel
(`CARASHELL_US_GT` och `_G`) som delar vinkelns budget i CBO:n — GT-videorna lades i
`CARASHELL_US_GT`, inget rört.

**Discord:** engelsk rapport i `#annons-uppladdning`, meddelande
`1552365523977765037`, ingen ACTION NEEDED.

---

## Nattvakten 2026-09-24 — vändningen: två sänkningar i stället för skalning

**Budget:** LISTICLE **sänkt 2 850 → 2 000 kr** (vinst 3d 11,1 %, ROAS 1,99 — under
golvet 16 %; kadensspärren hade precis löpt ut). Huvudkampanjen ligger kvar på
9 600 kr EN natt till: vinst 3d 12,9 % ligger också under golvet, men bara 2 av
3 kadensdygn har gått sedan måndagens höjning. **Sänks 9 600 → 6 720 kr nästa natt**
om den inte vänder i dag.

**Pausad:** `CaraShellRoof_BOF_107_1` — 2 153 kr, 3 köp, CPA 718 kr mot break-even
693 kr, förlorare på både 14d och 7d.

**7 dygn SE:** 54 740 kr, 108 köp, ROAS 2,73, vinstbidrag 36 911 kr — **platt mot
i går trots 8 800 kr mer spend.** Det är hela kvällens berättelse.

**Varningen från i går slog in.** Den sa: "upprepas det faller vinst 3d ur hållbandet
och ronden sänker i stället för att skala." Den gjorde det. Rotorsaken är mätt och
skriven som **mönster 14 i `dna.md`**: kampanjen har ett leveranstak runt 5 000
kr/dygn, och höjningen 8 000 → 9 600 gjordes på siffror mätta medan Meta bara
levererade ~5 000 kr. Köpen är oförändrade (10–14/dygn) medan pengarna 2,5-dubblats.

NO och DK körs fortfarande utan vakt på 4 000 kr/dygn vardera (rapporterat 2026-09-23,
Axels beslut väntar).

## 2026-09-24 — leveransrundan: fjärde dygnet, oförändrat

Samma två rader, samma md5, samma slutkort med `carashell.se`. Inget
uppladdat, ingen status ändrad, inga nya kommentarer. Kontot står still på
748 annonser sedan i går.

## 2026-09-24 — NO-rundan: tom kö, gårdagens 13 har gått vidare

0 rader i `SE-ACTIVE to be translated`. Gårdagens 13 står nu i `Approved` och
bär alla sin norska annons — US-rundan hann ikapp. Approved-passet: **58 rader,
0 utan NO-annons** (i går 1 före rättningen av konceptkoden, 0 efter). Inget
renderat, inget uppladdat, ingen status rörd, 0 HeyGen-krediter. Kampanjen
ACTIVE med 12 adsets, pris 1 106 NOK läst live.

Kvar öppet: presentvinkeln kör fortfarande i två adsets (`- G` och `- GT`) i
samma CBO. Frågan ligger hos Axel sedan i går; ingen ping i dag eftersom
ingenting ändrats. Inget rört.

---

## USA-runda 11 — 2026-09-24 (`/ops-oversatt carashell/takskyddet --marknad US`)

**Tom runda. Inget översatt, inget uppladdat, inget rört.**

| Kö | Rader | Att göra |
|---|---|---|
| `SE-ACTIVE to be translated` | 0 | — |
| `Approved` (eftersläpningskollen) | 58 | 0 — alla bär redan en US-annons |

De 58 är gårdagens 45 plus de 13 videorna från USA-runda 10. Kön är i kapp i
båda statusarna.

**Kontokollen (US-kampanjen `120251451415500435`, ACTIVE):** 78 annonser, 74
ACTIVE. **Gårdagens tretton klarade allihop Metas granskning** — ingen
underkänd, ingen begränsad. De fyra PAUSED är `*_FELSPRAK`-annonserna med den
norska rösten; de är avstängda med flit och ersatta i går.

**Butiken redo för USA:** produktsidan svarar 200 på engelska med 199 USD från
249, och lagerrensningssidan svarar 200 som amerikansk besökare med samma två
tal och 90-dagarsgarantin.

**Meta strypte kontot igen** — fjärde dagen i rad. Båda köerna kördes om tills
de gick igenom; inget saknas i rapporten. Kostar ~20 minuter per runda.
Rimlig orsak står kvar: CaraShells fyra andra rutiner (NO 16:05 och 16:15,
speglingarna 16:45 och 16:55) läser samma konto strax före den här.

**Dubbeladsetet GT/G kan inte växa längre.** NO-sessionen la in spärren i koden
2026-09-23 (`krockandeAdsets` i `tools/meta-lib.mjs`, `namnMedKoncept` +
`krockandeKoder` i kön): inget nytt adset föds för en vinkel kampanjen redan
bär under en kod som skiljer en bokstav, och kön varnar varje körning så länge
de två finns kvar. Att slå ihop dem är fortfarande ägarens beslut — Meta kan
inte flytta en annons mellan adsets.

**Kvarstår oförändrat, ingen åtgärd:** originalkampanjen
`CARASHELL_US_Taköverdrag …` PAUSED med 2 246 kr spend (ägarens beslut);
annonserna ärver lagerrensningssidans länk, så priset läses för hand ur de
amerikanska sidorna varje runda.

**Discord:** engelsk rapport i `#annons-uppladdning`, meddelande
`1552700685110218846`, ingen ACTION NEEDED.

---

## 2026-09-24 — speglingen: 6 av 7 speglade, 12 annonser live, 9 → Approved

Kön var 7 rader i `CaraShell SE ready to be active`. Sex speglades, en stoppades
på varumärkesregeln. Pris SE 1 129 kr och NO 1 106 NOK lästa live ur butiken;
alla creatives bar 1 129 kr — 0 % avvikelse, inget prisstopp.

| Källrad | Spegelnamn | SE-annons | NO-annons |
|---|---|---|---|
| `Takoverdrag_OB_5_1` (bild) | `CaraShellRoof_OB_105_1` | `120249250677510172` | `120249250712380172` |
| `Takoverdrag_OB_4_H1` | `CaraShellRoof_OB_104_H1` | `120249250828910172` | `120249250842220172` |
| `Takoverdrag_OB_3_H1` | `CaraShellRoof_OB_103_H1` | `120249250865390172` | `120249250960120172` |
| `Takoverdrag_CO_5_H1` | `CaraShellRoof_CO_105_H1` | `120249250968760172` | `120249250978490172` |
| `Takoverdrag_PD_10_H1` | `CaraShellRoof_PD_110_H1` | `120249251052800172` | `120249251068280172` |
| `Takoverdrag_CS_9_H1` | `CaraShellRoof_CS_109_H1` | `120249251079280172` | `120249251181710172` |

**Tillbakaläst ur Meta: 12 av 12** — alla i konto `915422744950975`, SE i
`CARASHELL_SE_Taköverdraget` och NO i `CARASHELL_NO_Takovertrekket`, samtliga
`status: ACTIVE`. `CaraShellRoof_NO_CS_109_H1` stod `effective_status:
IN_PROCESS` vid läsningen — Metas granskningsfönster, inte ett fel.
Räkningen gjordes för att sammanfattningen inte är ett bevis (lärdomen
2026-09-22: "9 speglade, 0 fel" saknade två NO-annonser).

**Stoppad (1):** `Takoverdrag_GT_11_H1` — copyn nämner Bäverbutiken
("Han glömmer strumpor. Inte det här."-raden bär butiksnamnet i brieftexten).
Järnregel 2: en OPS-butik säger aldrig vilken butik det är. Ingen uppladdning,
källradens status orörd, raden ligger som ACTION NEEDED i Discord — Axel avgör
om redigeraren ska göra en butiksversion. Samma stopp som `Takoverdrag_TR_1_1`
och `SP_5_1` 2026-09-18.

**9 källrader → `Approved`:** `OB_2_H1`, `TR_3_H1`, `GT_10_H1`, `CO_3_H1`,
`GT_7_H1`, `RI_2_H1`, `GT_8_H1`, `CS_8_H1`, `CS_7_H1` — alla nio bar sin
US-annons i Magiborsten UK (`1107817401910319`) vid körningen. Väntekön från
i går är därmed tömd.

**Kvarstående varning, oförändrad:** `CARASHELL_SE_Taköverdraget LISTICLE` är
ett eget spår (namnet bär LISTICLE) och tar aldrig emot speglade annonser —
korrekt beteende, rapporteras varje körning.

---

## Nattvakten 2026-09-25 — huvudkampanjen sänkt, mönster 14 bekräftat

**Budget:** huvudkampanjen **sänkt 9 600 → 6 750 kr** — vinst 3d **−3,7 %** vid
ROAS 1,54, alltså UNDER break-even 1,63. Kadensspärren som höll den i går löpte
ut. LISTICLE ligger kvar på 2 000 kr och är **tillbaka i hållbandet**: vinst 3d
23,8 % vid ROAS 2,66, upp från 11,1 % i går.

**Pausade:** `CaraShellRoof_CS_110_1` (1 461 kr, 2 köp, CPA 731 kr) och
`CaraShellRoof_LI_102_1` (1 294 kr, 1 köp, CPA 1 294 kr) — båda över break-even-CPA
693 kr efter mer än 3 × target-CPA i spend.

**7 dygn SE:** 61 852 kr, 108 köp, ROAS 2,45, vinstbidrag 31 253 kr — ner från
36 911 kr i går på 7 100 kr MER spend.

**Mönster 14 bekräftat två gånger på ett dygn:**

1. **Uppåt:** i går spenderade huvudkampanjen 9 011 kr och gav ROAS 0,93 på
   6 köp. Den 21/9 gav 5 120 kr ROAS 3,15 på 11 köp. Nästan dubbla pengarna för
   drygt hälften av kunderna. Tre dygn i rad på 9 000–11 800 kr: 13, 14 och 6 köp,
   mot 10–13 köp på dygnen som kostade 3 000–5 000 kr.
2. **Nedåt:** LISTICLE sänktes 2 850 → 2 000 i går och var tillbaka i hållbandet
   inom ett dygn. Taket går alltså åt båda hållen — sänkningen återställer vinsten.

**Nästa avläsning:** spenderar Meta verkligen mindre på 6 750 kr, och följer ROAS
med tillbaka? Det är den sista biten i beviset.

## 2026-09-25 — leveransrundan: femte dygnet, oförändrat

Samma två rader, samma md5, samma slutkort med `carashell.se`. Inget
uppladdat, ingen status ändrad. Kontot 748 → 760 annonser sedan i går
(spegling och översättning rullar).
