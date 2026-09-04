# Creative DNA — Medicinasken i Fickformat

Skapad 2026-09-04 av `/rond-auto` steg 4b (`ersatt`-behov, "material pausat
senaste veckan — ersätt det som stängts av"). Produkten saknade helt
minnesfiler (`products/medicinasken-fickformat/` fanns inte, tom träff i
`git log --all -- 'products/medicinask*'`) — enligt specialregeln i
`.claude/commands/rond-auto.md` 4b körs `forsta-batch.md`-flödet i stället
(bygger minnet från grunden), men loggas ändå som `CS_BATCH_KLAR` (inte
`FORSTA_BATCH_KLAR`) eftersom produkten redan haft spend och riktiga annonser.

**Kampanjen stängdes AV av rondens huvudflöde tidigare samma dag** (trappan —
enda köpet som fanns vid den koll­ningen låg under break-even, ingen annan
annons kvalificerade). Denna körning rör INTE Meta-status — bara analys,
briefer, Drive och Notion. Kampanjen förblir PAUSED.

**Siffrorna har rört sig sedan trappans beslut:** vid den här körningens
avläsning (`date_preset: maximum`) visar Meta **2 köp**, inte 1 — ett köp till
kom in mellan trappans koll och den här analysen. Ändrar inte slutsatsen
(fortfarande djupt under break-even), men noteras så att ingen tror på en
tyst felräkning.

Datakälla: MagiBorsten `1867947880635861`, kampanj `120250053730340291`
("Medicinasken i Fickformat | BE ROAS 1.60 | Launch 2026-09-02"),
`date_preset: maximum` (livstid), fälten `amount_spent`,
`actions:omni_purchase`, `cost_per_omni_purchase`, `purchase_roas`,
`effective_status`, `impressions`, `ctr`, `cpm`, `frequency` — aldrig
`omni_purchase_values`.

## Produktfakta (verifierade)

- **Medicinask i Fickformat – 7 Fack med Tätslutande Lock**
  (`medicinask-i-fickformat-7-fack-med-tatslutande-lock`), Bäverbutiken.
  Verifierat via `WebFetch` av den publika produktsidan 2026-09-04 (Shopify-
  connectorn i den här sessionen var inte kopplad/tillgänglig — samma kända
  omväg som i andra produktminnen denna vecka).
- **Pris 289 kr, jämförpris 381 kr — spara 92 kr, 24 % rabatt (äkta, syns på
  sidan).** Färgval Vit/Grön, samma pris.
- Mått 9 × 7 × 3,5 cm ("mindre än en kortlek"). USP:er från produktsidan:
  7 fack håller isär veckans dagar, tätslutande lock (torrt i väskan/fickan),
  öppnas med en hand (spärren släpper med tummen).
- Leverans 5–10 arbetsdagar. **Fri frakt inom Sverige — men bara på ordrar
  över 300 kr**, verifierat på just denna produktsida. Produkten kostar 289 kr
  ensam, dvs **under den egna fri frakt-gränsen** — skiljer sig från andra
  produktminnen i repot där fri frakt gäller hela ordern utan tröskel. Skriv
  aldrig "fri frakt" okvalificerat i denna batchs briefer.
- **30 dagars öppet köp — pengarna tillbaka.**
- Break-even-ROAS **1,60×** (ur kampanjnamnet). Break-even-CPA
  289/1,60 ≈ **181 kr**.
- **Inga recensioner.** Produktsidan visar "Inga recensioner" (WebFetch
  2026-09-04). Drive-mappens fil `Medicinask i Fickformat_REVIEW` är en
  **exempel-mall**, inte kunddata — varje rad är uttryckligen märkt
  "Exempel N – EJ KUNDRECENSION" med `product_handle:
  not-a-real-product-handle-so-this-review-wont-import`, dvs byggd för att
  INTE importeras. **0 review-bilder i denna batch, som instruerat** — ingen
  äkta recension finns att citera.

## Datakvalitet

**Ingen annons i kampanjen når signifikansgrinden (≥300 kr spend OCH ≥3 köp).**
Kampanjen är bara två dygn gammal (launch 2026-09-02) och har totalt
2 025,32 kr spend / 2 köp — under grinden på annonsnivå för alla fyra annonser.
Kampanjnivån (facit nedan) har dock passerat 500 kr-tröskeln för ett
kill-beslut, vilket är varför trappan stängde av den. `amount_spent ×
purchase_roas` kontrollerad mot `cost_per_omni_purchase`: 2 025,32 × 0,485158
≈ 982,55 kr intäkt / 2 köp ≈ 491 kr snitt-AOV — rimligt (289 kr-produkt,
enstaka köp med flera enheter eller fraktavgift inräknad). Ingen
`omni_purchase_values` hämtad.

## Kampanjnivå (facit)

| Mått | Värde |
|---|---|
| Spend (livstid) | 2 025,32 kr |
| Köp (livstid) | 2 |
| CPA | 1 012,66 kr (break-even 181 kr — **5,6× för dyrt**) |
| ROAS | 0,49× (break-even 1,60×) |
| Daglig budget | 1 000 kr |

Kill-regeln (ANALYSMETOD steg 3: ROAS < break-even efter ≥500 kr spend) är
uppfylld på kampanjnivå. Trappans beslut var korrekt utifrån datan. Det stoppar
inte nya briefer (pausad kampanj kan få nytt material att testa), men ingen
enskild annons i kontot är bevisad — bara kampanjen som helhet har facit.

## Annonserna (4 st, alla statiska bilder — de enda som launchades)

| Annons | Spend | Köp | CPA | ROAS | CTR | CPM | Status |
|---|---|---|---|---|---|---|---|
| Medicinask_PD_2_1 | 1 668,91 kr | 2 | 834,46 kr | 0,59 | 6,86 % | 253,21 kr | PAUSED (för lite data, 2 <3 köp — men kampanjens enda signal) |
| Medicinask_SP_2_1 | 265,43 kr | 0 | – | – | 4,49 % | 305,79 kr | PAUSED (under 300 kr, ej bedömbar) |
| Medicinask_CS_2_1 | 72,08 kr | 0 | – | – | 3,11 % | 280,47 kr | PAUSED (under 300 kr, ej bedömbar) |
| Medicinask_G_2_1 | 18,90 kr | 0 | – | – | 14,29 % (35 visn.) | 540,00 kr | PAUSED (brus — för lite volym för att betyda något) |

PD_2_1 bär 82 % av kampanjens spend och båda köpen — närmast en signal av de
fyra, men fortfarande under 3-köpsgrinden. Ingen dom fälls på enskild annons.

## Creative-teardown (steg 6b) — granskat på riktigt via `ads_get_ad_preview`

Alla fyra annonser granskade visuellt (Meta självt renderade bilderna).

1. **PD_2_1** (kampanjens starkaste signal): ren benefit-text på produktbild
   — "Sluta blanda ihop dina mediciner – få ordning på hela veckan." Boxarna
   visas STÄNGDA (de sju facken syns inte). Inget pris, ingen CTA-knapp synlig
   i bilden.
2. **BLOCKER — CS_2_1 har ett verifierat prisfel:** bilden säger "289 kr
   [streck] 376 kr" men produktsidans äkta jämförpris är **381 kr**, inte
   376 kr. Skillnaden (5 kr / 1,3 %) ligger under `/notionkorning`s 20 %-
   stoppregel, men är ett faktafel som ska rättas i all ny copy — använd
   381 kr, aldrig 376 kr.
3. **BLOCKER — CS_2_1 har fabricerad brådska:** "Nästan slutsåld – beställ
   innan den är borta!" går inte att verifiera mot något lagerantal på
   sidan — permanent 24 %-rabatt, inget slut-i-lager-läge. Källan är
   Drive-dokumentet `ADCOPY_CS` ("Priset sjunker – och lagret gör det
   också... Nästan slutsåld redan nu") — samma mönster som Bordtennisnätets
   "CLEARANCE SALE"-fynd samma vecka, dvs ett återkommande problem i kontots
   källmaterial, inte en engångsmiss.
4. **BLOCKER (allvarligast) — SP_2_1 innehåller en PÅHITTAD kundrecension:**
   citatet "Bästa köpet jag gjort i år – äntligen ordning på mina mediciner!"
   attribueras till "Verifierad kund, 62 år" — en person som inte existerar,
   ingen recension finns på produkten (se ovan). Källan är Drive-dokumentet
   `ADCOPY_SP` som även innehåller "Tusentals nöjda kunder" och "Verifierade
   recensioner" — båda påståenden är osanna (0 recensioner, ny produkt,
   2 köp totalt). **Detta bryter arbetsregel 4 ("Hitta inte på ... kundinsikter
   ... aldrig påhittat") och är kontots allvarligaste fynd hittills.**
   Ingen ny brief i denna batch återanvänder ADCOPY_SP-dokumentet, citatet,
   "verifierad kund"-formatet eller "tusentals kunder"/"verifierade
   recensioner"-påståendena. SP-koden återanvänds i denna batch för ett
   produktbevis (storleksjämförelse) i stället för ett påstått kundcitat.
5. **G_2_1:** presentförpackning, två askar (vit + grön) i en presentask med
   rosett. 14,29 % CTR ser starkt ut men bygger på 35 visningar/5 klick —
   ren brus, ingen signal.

## Viktigt fynd utanför Meta — 12 oanvända videor i Drive

Produktmappen (`Medicinask i Fickformat`, Josh, `LAUNCHED`-undermappen i
`BÄVER/Products`) innehåller **12 färdiga videofiler** som ALDRIG laddades
upp som annonser: `PD_1/2/3.mp4`, `CS_1/2/3.mp4`, `SP_1/2/3.mp4`,
`G_1/2/3.mp4` (samtliga från 2026-09-03). Bara de fyra STATISKA bilderna
(PD_2_1, CS_2_1, SP_2_1, G_2_1) gick live. Innehållet i videorna är inte
granskat — `/forsta-batch` FAS 0-regeln säger uttryckligen att video inte kan
öppnas/bedömas utan transkript, och ingen gissning görs här. **Rekommendation
till nästa körning/Axel:** granska de 12 videorna innan mer nytt material
byggs — om de matchar den ärliga PD/G-linjen (inte ADCOPY_SP/CS:s fabricerade
claims) kan de vara snabbare att aktivera än helt nya briefer. Ligger kvar i
`backlog.md`.

## Winning/Losing DNA — obevisat, riktningssignaler + två hårda förbud

**Ingen annons har nått signifikansgrinden. Nedan är hypoteser för denna
batch, inte bevisade fakta.**

- **Testa kontrollerat:** PD_2_1:s raka benefit-budskap ("sluta blanda ihop
  dina mediciner") format-transfererat till video och till öppna boxar (de
  sju facken faktiskt synliga — PD_2_1 visar bara stängda boxar). ·
  Produktsidans äkta USP:er (öppnas med en hand, tätslutande lock) — aldrig
  testade i någon annons hittills. · Den äkta rabatten (289 kr, spara 92 kr/
  24 % mot 381 kr) utan påhittad brådska.
- **UNDVIK — hårt förbud, inte bara "var försiktig":** (1) någon form av
  påstådd kundrecension, "verifierad kund", stjärnbetyg eller "tusentals
  kunder"-påstående så länge produkten har 0 riktiga recensioner. (2)
  Fabricerad lagerknapphet/brådska ("nästan slutsåld", "priset sjunker").
  (3) Jämförpriset 376 kr — det äkta talet är 381 kr.
- **Obevisat:** allt annat. Kampanjens enda "fakta" är att den som helhet
  gått långt under break-even (ROAS 0,49 mot 1,60).

## Kund-/konkurrentresearch (FAS 6)

**Kundspråk:** inget tillgängligt — 0 recensioner, ingen extern källa att
citera. Detta är en genuin lucka, inte en utebliven sökning.

**Konkurrenter (Meta Ad Library, `pill organizer` + `medicinask`, Sverige,
2026-09-04):**
- **Plocker Butiken** (SEK, svensk sida) — annonstext "Fri frakt och 30
  dagars öppet köp." Samma riskreducerings-mekanism som vår egen 30-dagars
  garanti — **lånad mekanism:** en egen BOF-bild renodlad kring just den
  garantin (`BOF_2_1`).
- Övriga sökträffar på "medicinask" i Sverige (Eva Nilsson "Dosettlåda",
  Gerbuy, merci) gav bara länk-titlar utan läsbar body-copy — Facebooks
  annonsbibliotek blockerade djupare hämtning (403). Ingen text därifrån
  användbar utöver namnen.
- Internationell sökning på "pill organizer" gav 196 träffar, i praktiken
  alla suppleringskosttillskott/hälsopåståenden (irrelevant kategori för en
  fysisk dosett) — inget lånat härifrån.

**Två lånade/bekräftade mekanismer i denna batch:** (1) 30 dagars öppet
köp som egen riskreducerings-BOF (Plocker Butiken-mönstret). (2) Produktens
egna, redan skrivna men aldrig testade USP:er (öppnas med en hand,
tätslutande lock) — källa: produktbeskrivningen, inte en gissning.

## Namnkonvention

Kontots prefix: **`Medicinask`**, koncept-koder `PD`/`CS`/`SP`/`G` — matchar
Bordtennisnätets kodschema i samma konto (PD=Product Demo, CS=Clearance
Sale/erbjudande, SP=Social Proof, G=Gift), avviker från
`docs/naming-convention.md`:s `ANGLE_FORMAT_HOOK`-schema, känd avvikelse i
hela kontot. **Upptagna AD-ID:n avlästa innan namngivning — både i Meta OCH i
Drive-filnamnen:** `PD_1`, `PD_2` (+`_1`), `PD_3`, `CS_1`, `CS_2` (+`_1`),
`CS_3`, `SP_1`, `SP_2` (+`_1`), `SP_3`, `G_1`, `G_2` (+`_1`), `G_3` — alla
1–3-serier är upptagna av de 12 oanvända Drive-videorna, inte bara av de fyra
launchade statiska annonserna. Denna batch fortsätter därför på **4** för
PD/CS/SP/G, plus en ny kod `BOF_N` för bottom-of-funnel.

## Luckor (fyll före nästa körning)

- 12 producerade videor i Drive är obedömda (se ovan) — nästa körning bör
  öppna och granska dem innan mer nytt material briefas.
- Ingen recension finns att bygga review-bilder på. Om Judge.me/produktsidan
  får en riktig recension: bygg dem då, aldrig innan.
- Marginal-CPA (senaste 3 dagar) kördes inte — kampanjen är redan pausad,
  ingen budget att styra just nu.
