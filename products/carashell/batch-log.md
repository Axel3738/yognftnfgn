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
