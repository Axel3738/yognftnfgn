# Creative DNA — Bordtennisnätet Infällbart

Skapad 2026-09-04 av `/rond-auto` steg 4b (`ersatt`-behov, "material pausat
senaste veckan — ersätt det som stängts av"). Produkten saknade helt
minnesfiler (`products/bordtennisnatet/` fanns inte, tom träff i
`git log --all -- 'products/bordtennis*'`) trots att kampanjen redan haft
riktig spend och 15 launchade annonser — enligt specialregeln i
`.claude/commands/rond-auto.md` 4b körs `forsta-batch.md`-flödet i stället
(bygger minnet från grunden), men loggas ändå som `CS_BATCH_KLAR` (inte
`FORSTA_BATCH_KLAR`) eftersom produkten inte är ny.

**Kampanjen stängdes AV av rondens huvudflöde tidigare samma dag** (trappan —
potentialkollen föll efter en redan förbrukad förlängning). Denna körning rör
INTE Meta-status — bara analys, briefer, Drive och Notion. Kampanjen förblir
PAUSED.

Datakälla: MagiBorsten `1867947880635861`, kampanj `120250011459910291`
("Bordtennisnätet Infällbart | BE ROAS 1.80 | Launch 2026-08-29"),
`date_preset: maximum` (livstid), fälten `amount_spent`,
`actions:omni_purchase`, `cost_per_omni_purchase`, `purchase_roas`,
`effective_status`, `impressions`, `ctr`, `cpm`, `frequency`,
`video_play_actions`, `video_p50_watched_actions` — aldrig
`omni_purchase_values`.

## Produktfakta (verifierade)

- **Bordtennisnät Infällbart – 2 Rack & 6 Bollar**
  (`bordtennisnat-infallbart-2-rack-6-bollar`), Bäverbutiken. Verifierat via
  `WebFetch` av den publika produktsidan 2026-09-04 (`mcp__Shopify__*` i den
  här sessionen pekar på fel butik — TwinPillow, verifierat med
  `get-shop-info` — samma kända avvikelse som i tidigare produktminnen).
- **Pris 309 kr, jämförpris 476 kr (35 % rabatt, äkta — syns på sidan).**
  Färgval svart/orange, samma pris.
- Utdragbart nät (upp till 1,7 m), gummiklädda klämmor för bordsskivor upp
  till 5 cm, halkfri gummibas, inga verktyg, infällbart. Två racketar + sex
  bollar ingår.
- Leverans 5–10 arbetsdagar, Klarna, **30 dagars öppet köp**, fri frakt inom
  Sverige (ingen tröskel — gäller hela ordern).
- Break-even-ROAS **1,80×** (ur kampanjnamnet). Break-even-CPA
  309/1,80 ≈ **172 kr**.
- **10 äkta recensioner** verifierade dubbelt: Judge.me REST-API
  (`JUDGEME_API_TOKEN`/`JUDGEME_SHOP_DOMAIN`, filtrerat på
  `product_handle = bordtennisnat-infallbart-2-rack-6-bollar`) OCH den
  publika produktsidan (`WebFetch`) — identiska citat, 8×5★ + 2×4★. Facit
  nedan är Judge.me:s exakta namn/citat.

## Datakvalitet

`amount_spent × purchase_roas` kontrollerad mot `cost_per_omni_purchase` för
alla annonser med köp och mot kampanjtotalen — stämmer exakt
(kampanjen: 3 568,72 kr × 0,320367 ≈ 1 143,65 kr intäkt / 3 köp ≈ 381 kr
snitt-AOV; `cost_per_omni_purchase` 1 189,57 kr = 3 568,72/3, konsekvent).
Ingen `omni_purchase_values` hämtad, så den kända buggen är inte relevant här.

**Ingen enda annons i kampanjen har nått signifikansgrinden (≥300 kr spend
OCH ≥3 köp).** Den som kommer närmast — `Bordtennisnat_PD_3` — har 1 557,08 kr
spend men bara **2** köp. Ingen dom får fällas om enskilda annonser här; det
som går att säga är kampanjnivån (facit, inte en enskild kreativ).

## Kampanjnivå (facit — det här är därför kampanjen stängdes av)

| Mått | Värde |
|---|---|
| Spend (livstid) | 3 568,72 kr |
| Köp (livstid) | 3 |
| CPA | 1 189,57 kr (break-even 172 kr — **6,9× för dyrt**) |
| ROAS | 0,32× (break-even 1,80×) |
| Daglig budget | 1 000 kr |

Kill-regeln (ANALYSMETOD steg 3: ROAS < break-even efter ≥500 kr spend) är
uppfylld med bred marginal på kampanjnivå. Trappans beslut att stänga av var
korrekt utifrån datan — det här är inte en produkt som blivit felaktigt
avstängd. Att bygga nya briefer stoppas inte av det (pausad kampanj kan få
nytt material att testa när redigerarna är klara), men det ska inte läsas som
att produkten redan bevisat sig.

## Siffrorna (livstid, `date_preset: maximum`, BE-ROAS 1,80, BE-CPA 172 kr)

Sorterat på spend, alla 15 annonser i kampanjen. **Ingen är bedömbar** —
tabellen visas ändå för transparens (ANALYSMETOD steg 4), med vinstbidrag
räknat där köp finns, markerat "för tidigt" överallt.

| Annons | Format | Spend | Köp | CPA | ROAS | Vinstbidrag* | Status |
|---|---|---|---|---|---|---|---|
| Bordtennisnat_PD_3 | video | 1 557,08 kr | 2 | 778,54 kr | 0,54 | **≈−1 214 kr** | PAUSED (för tidigt, 2 <3 köp) |
| Bordtennisnat_CS_1 | video | 1 265,58 kr | 0 | – | – | hela spenden osäljd | PAUSED (för tidigt) |
| Bordtennisnat_SP_3 | video | 298,70 kr | 0 | – | – | – | PAUSED (för tidigt, precis under spendgrinden) |
| Bordtennisnat_CS_2 | video | 129,70 kr | 0 | – | – | – | PAUSED (för tidigt) |
| Bordtennisnat_G_2 | video | 124,85 kr | 0 | – | – | – | PAUSED (för tidigt) |
| Bordtennisnat_CS_3 | video | 86,09 kr | 1 | 86,09 kr | 3,59 | ≈+86 kr | PAUSED (brus — 1 köp) |
| Bordtennisnat_CS_2_1 | bild | 52,67 kr | 0 | – | – | – | PAUSED |
| Bordtennisnat_SP_1 | video | 28,72 kr | 0 | – | – | – | PAUSED |
| Bordtennisnat_PD_2_1 | bild | 13,58 kr | 0 | – | – | – | PAUSED |
| Bordtennisnat_SP_2 | video | 2,44 kr | 0 | – | – | – | PAUSED |
| Bordtennisnat_GT_2_1 | bild | 2,09 kr | 0 | – | – | – | PAUSED |
| Bordtennisnat_PD_EXTRA | bild | 1,06 kr | 0 | – | – | – | PAUSED |
| Bordtennisnat_PD_1 | video | 0,93 kr | 0 | – | – | – | PAUSED |
| Bordtennisnat_PD_2 | video | 5,23 kr | 0 | – | – | – | PAUSED |
| Bordtennisnat_SP_2_1 | bild | 0 kr (ingen data) | 0 | – | – | – | PAUSED |

*Vinstbidrag = (172 kr − CPA) × köp. Endast visat där köp > 0.

**Slutsats av tabellen:** hela kampanjens 3 köp ligger på PD_3 (2) och CS_3
(1). Fem videor + fyra bilder fick i praktiken aldrig en chans (0,93–129,70 kr
vardera) — klassisk tidig CBO-svält, inget bevis på att formaten/vinklarna är
dåliga. De två annonser som fick riktig spend (PD_3, CS_1 — tillsammans
79 % av kampanjens spend) genererade antingen dålig avkastning (PD_3) eller
noll köp alls (CS_1).

## Creative-teardown (steg 6b)

Granskning gjord på riktigt via `ads_get_ad_preview` (Meta självt) på de fyra
annonser med mest spend/data: PD_3, CS_1, CS_3, SP_3.

1. **Kvalitetsfel hittat (BLOCKER-nivå, arbetsregel 8): `Bordtennisnat_CS_1`
   (1 265,58 kr spend, kampanjens näst största post, 0 köp) har en
   felstavning inbränd i videon: texten "Bortennisnätet" saknar ett "d".**
   Videon visar dessutom mest racketar/bollar i närbild — själva nätet (den
   faktiska produkten "Infällbart") syns knappt. En annons med felstavat
   produktnamn och otydlig produktidentifiering är ett rimligt skäl till
   0 köp på 1 266 kr spend, även om <3-köpsgrinden formellt hindrar en dom.
   **Instruktion: ingen ny brief återanvänder det manuset eller den
   framtoningen.**
2. **Kvalitetsfel hittat: `Bordtennisnat_CS_3`:s videocaption säger "Lagret
   krimper"** — ett stavfel. Källskriptet i Notion-testcentret
   (`3bf270ab-908c-80af-b91a-c6bbb28215ff`) säger korrekt "Lagret krymper
   snabbt". Samma video har dessutom vattenstämpeln **"video owner
   @karaandallan — do not re-upload"** inbränd — innehållet är återanvänt
   UGC utan synlig licens. **CS_3 (trots bäst ROAS på kampanjens minsta
   dataunderlag, 1 köp) återanvänds INTE i denna batch** — varken manuset
   eller materialet. Nästa batchs familjekoncept (`CS_4_H1`, `CS_5_1`) bygger
   samma idé (familj, riktigt hem, ingen text-overlay) med nytt, eget
   material.
3. **Erbjudande-integritetsrisk hittad i källmaterialet (arbetsregel 7):**
   Drive-mappens `Bordtennisnät Infällbart_CS_ADCOPY_1` ("CLEARANCE SALE")
   påstår "Kampanjen gäller bara några timmar till", "Lagret krymper snabbt"
   och "Priset går upp igen imorgon" — inget av detta går att verifiera på
   landningssidan (ingen nedräkning, inget lagerantal, priset är ett
   permanent 35 %-erbjudande, inte en tim-deal). Samma mönster som
   Soptunneklistermärkenas `CS_Bild` (kontots sämsta bedömbara annons där).
   **Ingen ny brief i denna batch använder fabricerad brådska.** Det äkta
   priset (309 kr, spara 167 kr/35 % mot 476 kr) och den äkta garantin
   (30 dagars öppet köp) är starka nog utan påhitt.
4. **Hypotes (diagnos, inte dom — under spendgrinden): `Bordtennisnat_SP_3`
   (298,70 kr, 0 köp) har kampanjens starkaste engagemangssiffror** — hook
   rate 94 % (1 806/1 922 videovisningar/impressions) och hold rate 30 %
   (534/1 806 p50). Videon är en extrem närbild på hur klämman monteras på
   bordskanten. Folk stannar och tittar länge på just monteringsmomentet —
   möjlig signal att "hur enkelt/skadefritt det är att sätta fast" är en
   stark hook, oavsett om det konverterar (ingen data ännu). Testas vidare i
   `SP_6_1` (statisk, samma närbild) och `PD_6_H1` (utökad videoversion).
5. **Observation, inte ett vinkelfel:** åtta av femton annonser fick
   0,93–129,70 kr vardera — för lite för att säga något om vinkel eller
   format. Endast PD_3 och CS_1 fick en riktig chans, och båda missade.

## Winning/Losing DNA — obevisat, riktningssignaler bara

**Ingen annons har nått signifikansgrinden. Inget nedan är bevisat — det är
hypoteser att testa i denna batch, inte fakta att skala på.**

- **Testa kontrollerat:** närbild på monteringsmomentet (klämman på
  bordskanten) som egen hook — SP_3:s hook/hold-mönster, aldrig konverterings-
  validerat. · "Vilket bord som helst"-antagandet visat på flera olika
  bordstyper i samma spot (kök, mat, uteplats) — även konkurrenten
  Shopcenteri använder exakt den vinkeln ("förvandla vilket bord som helst
  till en matcharena"), så den är kategori-beprövad även om den inte är
  bevisad i vårt konto. · Familj/socialt spel i ett riktigt hem, utan
  text-overlay — samma idé som CS_3 men med eget, licensierat material.
- **Undvik:** fabricerad brådska/lagerknapphet (källmaterialets
  "CLEARANCE SALE"-manus) · stavfel i inbränd text (kontrollera varje rad mot
  ordagrant-stavning innan export — "Bordtennisnätet"/"krymper" har redan
  gått fel en gång vardera) · återanvänt UGC-material utan egen licens
  (CS_3:s källfil).
- **Obevisat:** allt annat. Kampanjens enda "fakta" är att den, som helhet,
  gått långt under break-even (ROAS 0,32 mot 1,80) — vilket är varför den
  stängdes av, inte ett skäl att döma enskilda kreativ.

## Kund-/konkurrentresearch (FAS 6)

**Kundspråk (äkta citat, Judge.me):** "Barnen spelar nästan varje dag" (Erik
Johansson) · "Tar liten plats och är enkelt att förvara när vi inte spelar"
(Emma Persson) · "Vi tog fram det på en familjekväll och alla ville spela"
(Lars Svensson) — mönstret i alla tio recensioner är **vardagsanvändning i
hemmet och familjesamvaro**, ingen recension nämner sport/prestation.

**Direkta konkurrenter (Meta Ad Library, sökning `pingisnät bord`, Sverige,
2026-09-04, 72 träffar totalt):**
- **Shopcenteri shop** — "50% på nyhet! Hopfällbart pingisnät – portabelt,
  enkelt att montera, förvandla vilket bord som helst till en matcharena."
  Samma kärnlöfte som vår produkt (vilket bord som helst).
- **VaruZone.se** — "Byt soffläge mot aktiv familjetid." **Lånad mekanism:**
  skärmtid/soffläge-kontrast är en vinkel vi inte testat än — bygger vidare
  på samma "familjesamvaro"-signal som våra egna recensioner visar, men
  gör konflikten (soffa vs bord) explicit. Används i `SP_4_H1`.
- **Mekulo.com** — "Bordtennisnät för omedelbar användning" (samma
  "klart direkt"-löfte som vår produktbeskrivning).

**Tre lånade mekanismer till denna batch:** (1) "vilket bord som helst"
visat konkret på flera bordstyper i en och samma spot, inte bara påstått
(Shopcenteri-mönstret, format transfer). (2) Soffläge-kontrast som öppning
— screentid/passivitet vs aktiv lek (VaruZone). (3) "Klart direkt, inget
krångel" som objektionshantering mot att sätta upp det (Mekulo + vår egen
produktbeskrivning + SP_3:s hook-data).

## Namnkonvention — observerad diskrepans

Kontots faktiska prefix är **`Bordtennisnat`** (utan ä) med koncept-koderna
`PD`/`SP`/`CS`/`G`/`GT` — skiljer sig från `docs/naming-convention.md`:s
`ANGLE_FORMAT_HOOK`-schema, samma redan dokumenterade avvikelse som i alla
andra produktminnen i repot (Soptunneklistermärkena, Damasker Vandring,
Kranskydd Frost 420D m.fl.). Denna batch fortsätter kontots etablerade
prefix och koder för att hålla datan jämförbar. Upptagna AD-ID:n avlästa
innan namngivning: `PD_1`, `PD_2`, `PD_2_1`, `PD_3`, `PD_EXTRA`, `SP_1`,
`SP_2`, `SP_2_1`, `SP_3`, `CS_1`, `CS_2`, `CS_2_1`, `CS_3`, `G_2`, `GT_2_1`.
Nya koder i denna batch fortsätter samma serier (`PD_4`–`PD_8`, `SP_4`–`SP_6`,
`CS_4`–`CS_5`, `G_3`, `GT_3`) plus två helt nya koder: `BOF_N`
(bottom-of-funnel) och `RW_N` (review).

## Luckor (fyll före nästa körning)

- Marginal-CPA (senaste 3 dagar) kördes inte i denna batch — kampanjen är
  redan pausad, ingen budget att styra just nu. Gör vid nästa avläsning om
  kampanjen återaktiveras.
- SP_2_1 (statisk) hade ingen mätbar data alls (varken spend, impressions
  eller köp returnerades av Meta) — okänt om annonsen någonsin serverades.
  Flaggat, inte utrett vidare.
- Shopify-connectorn i sessionen pekar på fel butik (TwinPillow) — priskoll
  gjord via `WebFetch` av den publika sidan. Fungerar, men är en omväg.
