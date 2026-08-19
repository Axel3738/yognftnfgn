# Sätesöverdragaren — Creative DNA

Produkt: Sätesöverdrag för Åkgräsklippare – Slittåligt 600D Oxford (baverbutiken.se)
Kampanj: "Sätesöverdragaren" `120249122415680291` · Konto: MagiBorsten `1867947880635861`
Pris: 649 kr (ord. 811 kr) · Break-even-CPA: **474 kr** · Target-CPA: **300 kr** · AOV (härledd): 697 kr
Senast uppdaterad: 2026-08-14 (efter `/cs`-runda 6, 25 dagars kontodata)
Daglig budget: **3 000 kr** (fördubblad från 1 500 kr, avläst i kontot 2026-08-14)

> Denna fil är produktens ackumulerade minne. Data och hypotes hålls isär enligt
> `docs/os/ANALYSMETOD.md`. Uppdateras vid varje `/cs`.

---

## Winning DNA (data — bevisad, ≥2 annonser ≥3 köp vardera med samma slutsats)

- **NYTT OCH STÖRST (runda 6): offer-first slår problem-first.** `bryn swipe 1`
  (swipen, öppnar på att vi beställde för många och att priset därför är nedsatt)
  gör **2,10 kr vinst per spendkrona — bäst i hela kontot, nästan fyra gånger
  vinnarens 0,57 kr.** CPA 153 kr mot vinnarens 302 kr. LPV→köp 10,53 %, högst av
  alla bedömbara annonser. Kontot har aldrig tidigare öppnat en annons med
  erbjudandet. → Instruktion: reason-why-öppningen är default-hook för ny video,
  och ska testas som statik.
- **NYTT (runda 6): beteende-callout bär BÅDE stoppkraft och konvertering i
  statiskt format.** `PD_20_1` (handduks-hooken som 50/50-statik, byggd i batch #6)
  gör CTR 2,66 % mot SO-spårets 1,30 till 1,43 %, **och** LPV→köp 9,62 %, näst
  bäst i kontot. Vinst per spendkrona 1,49 kr mot prisankarets 0,71 kr. I video
  gav samma hook hög CTR men LÅG CVR (1,97 %). **Formatet avgör alltså om
  igenkänningshooken drar in rätt publik.** → Instruktion: varje ny statik öppnar
  på ett beteende, inte på ett tillstånd eller ett pris.
- **Captions är avgjort, nu med formell signifikans.** `PD_1_1_H1` (identisk video
  som vinnaren, utan captions) passerade grinden med 3 köp och landade på
  **CPA 531 kr mot break-even 474 kr, vinstbidrag −172 kr.** Vinnaren med captions
  står på CPA 302 kr. Detta är kontots första formella kill-beslut på performance.
  Behandla captions som ett produktionskrav, aldrig en variabel.
- **Format = rå leverantörsvideo med inbrända svenska captions** står sig som bas:
  `PD_1_3_H1` (102 köp, CPA 302 kr), `PD_13_H1` (18 köp, CPA 332 kr),
  `PD_2_1_H1` (5 köp, CPA 359 kr).
- **Prisankaret är nu effektivare per krona än vinnaren.** `SO_1_1_H1`: 7 köp,
  CPA 277 kr, 0,71 kr vinst per spendkrona mot vinnarens 0,57. Enda kvarvarande
  svaghet är CTR 1,30 %, lägst av alla bedömbara.
- **Produkten synlig direkt, ingen talare i bild.** Gäller alla bevisade vinnare,
  inklusive swipen, som är voiceover utan ansikte.

## Vinnaren skalar inte längre gratis

CPA gick **274 → 302 kr när spenden gick 21,9k → 30,8k** (+41 % spend). Tidigare
rundor visade sjunkande CPA vid ökad spend; det gäller inte längre. Fortfarande
långt under break-even 474 kr, men nu precis över target 300 kr.
→ Instruktion: fortsätt köra den, men tillväxten ska nu komma från de nya
vinnarna, inte från att pressa mer budget genom vinnaren.

## Winning DNA (hypotes — starkt signal, men underliggande annonser < 3 köp)

- **`SO_7_1` kan bli kontots effektivaste annons.** 175 kr, 2 köp, CPA 88 kr,
  ROAS 5,57, CTR 2,21 % mot `SO_1_1_H1`:s 1,30 %. Det är korsningen av
  igenkänningsrubrik och prisanker från batch #6. Ett köp från signifikans.
  → Instruktion: den behöver budget, inte fler varianter.
- **Att ladda upp vinnaren på nytt verkar nollställa dess effektivitet.**
  `PD_1_3_H1 – kopia` kör samma creative som originalet men på **CPA 197 kr mot
  originalets 302 kr** (5 köp). Kan vara en återställning av annonsnivåns
  inlärning, kan vara småtalsvariation. **Obevisat, testas kontrollerat i batch #7
  (`PD_22_H1`).**
- **SO-spårets CTR-problem är ett BILDproblem, inte ett typografiproblem.**
  Nu styrkt med visuell granskning (2026-08-19), inte bara siffror:

  | Annons | Produktbild | CTR |
  |---|---|---|
  | `SO_1_1_H1` | studiokomposit mot svart | 1,30 % |
  | `SO_5_1` | studiokomposit mot svart, jättetypografi | 1,43 % |
  | `SO_7_1` | studiokomposit mot svart | 2,21 % |
  | **`SO_6_1`** | **äkta foto, riktig maskin på en gräsmatta** | **2,39 %** |

  Tre av fyra SO-annonser använder samma flytande produktrender mot platt
  bakgrund. Den enda som visar en riktig maskin i en riktig trädgård har spårets
  högsta CTR. Alla utom `SO_1_1_H1` är under signifikans, så det är fortfarande
  hypotes, men riktningen är entydig och samstämmig med kontots bevisade DNA
  (rå dokumentär stil slår polerad reklamstil).
  → Instruktion: fotokravet är skärpt i `SO_8_1` och `SO_9_1`. "Äkta fotografi"
  räckte inte som formulering, produktionen läste det som render. Nu står det
  uttryckligen att flytande produktrender mot platt bakgrund är förbjudet.

## Losing DNA (hypotes — konsekvent riktning, ingen enskild annons signifikant)

- **UGC/talare-drivet innehåll ("SP"-spåret med creator i bild) presterar
  fortfarande sämst.** Åtta annonser, ca 1 600 kr spend, **1 köp totalt**
  (`SP_2_1_H1`, CPA 681 kr, långt över break-even 474 kr).
  **RÄTTELSE:** tidigare rundor skrev "noll köp i hela SP-spårets historia". Det
  stämmer inte längre, `SP_2_1_H1` har fått ett köp. Riktningen står sig ändå.
  **Viktigt att inte blanda ihop:** swipen (`bryn swipe 1`) är också talarledd men
  har **ingen person i bild** — bara voiceover över demo-material — och är kontots
  mest lönsamma annons. Det är ansiktet och testimonial-formatet som förlorar,
  inte den mänskliga rösten.
- **Lång video utan cutdown konverterar inte** (`SP_2_1_H1`: CTR 5,73 %, 1 köp på
  681 kr). Hög CTR utan CVR är nyfikenhetsklick.
- **Jättetypografi löser inte låg CTR** (`SO_5_1`: CTR 1,43 %, exakt samma som
  originalgrafiken).

## Behåll alltid
- Captions i alla videor, ord för ord från brief, vit text/svart kant.
- Produkt synlig < 1 sekund i video, dominant i bild.
- Pris exakt 649 kr / ord. 811 kr — äkta genomstrykning, aldrig ordet "överstruket"
  utskrivet (se Kvalitetskontroll-loggen nedan).
- Rå/dokumentär videostil framför polerad reklamstil.

## Testa kontrollerat (en variabel i taget)
- Persuasion-mekanism: demo (bevisad) vs pris-anker (starkt hypotes) vs
  mekanism/prevention (obevisat, `PD_7_H1` för tidigt) vs identity/gift (helt
  otestat — batch 3).
- Format: video vs statisk vs karusell (karusell aldrig testad).
- Längd: 38 s (bevisad bas) vs 15 s cutdown (`PD_5_H1`, för tidigt).

## Undvik
- Video utan captions.
- Lång UGC (>45 s) utan cutdown.
- **Fabricerade testimonials.** Se Kvalitetskontroll-loggen — inträffat två gånger
  i kontot (`SP_3_1_H1` och `SP_6_1`).

## Strukturell observation (uppdaterad runda 6) — budgeten är fördubblad

**Dagsbudgeten har gått 1 500 → 3 000 kr.** Det är den strukturåtgärd som
efterfrågats i tre rundor, och effekten syns direkt: batch #5 och #6 fick spend
inom två dygn, och två av dem (`PD_20_1`, `SO_7_1`) hann leverera köp innan denna
runda. Jämför med batch #2, där tolv annonser låg under 300 kr i åtta dagar.

Vinnarens spendandel har fallit från 71 % till 62,8 %, och vinstandelen från
89,7 % till 66,0 %. Kontot står inte längre på en enda annons.

**Kvarstående obalans:** kvoten är nu 6 creatives per 3-dagarscykel och läget är
**−13 creatives efter plan**, eftersom kvoten skalar med budgeten. Batch #7 är
därför sex briefer, inte tre.

## Ännu obevisat
- Om riktig (verifierad) kundröst konverterar bättre än opersonlig demo —
  kräver Judge.me-export innan det går att testa på riktigt.
- Om mekanism/prevention-vinkeln (`PD_7_H1`) expanderar publiken utöver de med
  redan spruckna säten.
- Karusellformat.
- Identity/gift-vinkel (batch 3, `SO_3_1`).

---

## Kvalitetskontroll-loggen (löpande, viktigt att inte tappa bort)

| Datum | Fynd | Åtgärd |
|---|---|---|
| 2026-07-30 | `SO_1_1_H1` hade AI-textbugg: ordet "överstruket" skrivet ut i bilden i stället för en riktig genomstrykningslinje. | Ersatt med `SO_1_2` (verifierad korrekt vid launch — riktig linje över 811 kr). |
| 2026-07-30 | `SP_3_1_H1` var en fabricerad AI-testimonial ("Verifierad kund, 54 år", påhittat citat, AI-ansikte). | Flaggad, rekommenderad pausad. Fortfarande live (8 kr spend). |
| **2026-08-05** | **`SP_6_1` (launchad 2026-08-04) är ÄNNU en fabricerad testimonial** — "Bättre än väntat, den är vadderad och har flera fickor." – JAKOB, verifierat köp, "En av 20 recensioner". Briefen för denna annons var uttryckligen märkt **BLOCKER: väntar på riktig Judge.me-export** — ingen sådan export har levererats i denna chatt. Namnet "Jakob" och citatet är påhittade. | **Rekommenderas pausad omgående.** Se rapportens åtgärdslista. Samma policyproblem som `SP_3_1_H1`, andra gången i kontot. |
| 2026-08-05 | `SP_4_H1`/`SP_5_H1` (batch 2, UGC-koncept) launchades med den **befintliga** kontocopyn ("Trodde jag skulle behöva byta hela sätet... Det är den vanligaste kommentaren vi får") snarare än ny brief-copy. Denna rad är en overifierad "vanligaste kommentar"-formulering, inte ett nytt påhitt, men har aldrig belagts mot en riktig recension. | Flaggad som stående overifierad claim. Inte lika akut som SP_6 (ingen namngiven falsk person), men bör bytas ut när recensionsdata finns. |
| 2026-08-05 | `PD_10_1` (listicle) launchades med exakt den känslomässiga 4-punktstexten ("Slipp den kalla, blöta känslan...") som levererades i chatten 2026-08-05 — bekräftar att produktionsteamet använder brieferna korrekt. | Ingen åtgärd, positiv kontrollpunkt. |
| 2026-08-05 | `SO_1_2` visuellt verifierad korrekt: riktig genomstrykningslinje över "811 kr", inget textfel. | Buggfixen fungerade. Pausa `SO_1_1_H1` till förmån för `SO_1_2` när den senare når signifikans. |
| **2026-08-06** | **`SP_6_1` och `SP_3_1_H1` (fabricerade testimonials) fortsatt LIVE och spenderande** ett dygn efter att paus rekommenderades i föregående `/cs`-runda. Ingen åtgärd har vidtagits. | **Andra gången detta flaggas utan åtgärd.** Eskalerat i rapporten till Axel — kräver ett svar/beslut, inte bara en flaggning i chatten. |
| **2026-08-09** | **`SP_3_1_H1` (fabricerad AI-testimonial) har nu status `WITH_ISSUES` i Meta** — dvs. Meta självt har flaggat annonsen, utöver vår egen policyflagg från 2026-07-30. `SP_6_1` (samma problem) är fortsatt ACTIVE. Båda har nu varit pausrekommenderade i 4 respektive 5 dagar utan åtgärd. | **Tredje gången detta eskaleras.** Meta har nu gjort en del av jobbet åt oss på SP_3. SP_6 ligger kvar och spenderar. |
| 2026-08-09 | **Datakvalitetskontrollen är REN denna runda.** Alla 6 rader med köp: `spend × ROAS` matchar `omni_purchase_values` på 0,00 % avvikelse. AOV-kontroll rimlig (649–765 kr). De 100×-fel jag rapporterade i runda 2 återfinns inte — antingen efterfyllt av Meta eller ett mätfel från min sida då. Ingen slutsats dras om orsaken. | Fältet användbart idag. Kontrollen körs ändå varje runda. |
| **2026-08-12** | **Fjärde eskaleringen: `SP_6_1` (fabricerad testimonial "JAKOB, verifierat köp") är fortfarande ACTIVE**, sju dagar efter första pausrekommendationen. `SP_3_1_H1` fortsatt `WITH_ISSUES`. Ingen åtgärd i fyra raka `/cs`-rundor. | Frågan ställs igen i rapporten. Jag pausar inte annonser utan uttryckligt ok från Axel — men detta är nu den enskilt längst öppna posten i produktens historia. |
| 2026-08-12 | **Datakvalitetskontrollen ren andra rundan i rad.** Alla rader med köp: `spend × ROAS` matchar `omni_purchase_values` på 0,00 % avvikelse. | Fältet användbart. Kontrollen körs ändå varje runda. |
| 2026-08-12 | `PD_13_H1` launchad enligt brief och nådde signifikans — första gången ett briefat koncept i denna produkt fått nog med budget för att ge ett svar. Ingen QC-avvikelse hittad. | Positiv kontrollpunkt. Bekräftar att brief → produktion → launch-kedjan fungerar när budget finns. |
| **2026-08-19** | **Visuell granskning genomförd på fem statiker** (`PD_20_1`, `SO_7_1`, `SO_5_1`, `SO_6_1`, `PD_14_1`). Metod som fungerar och ska återanvändas: `ads_get_ad_preview` per annons-id (skicka INTE `ad_account_id`, det argumentet finns inte), hämta `preview_url`, ladda ner sidan och plocka ut bild-URL:en som matchar `t45.1600-4`, ladda ner jpg:n och läs den. `ads_get_ad_images` är värdelös här eftersom alla bilder heter "untitled". | Metoden dokumenterad så nästa runda slipper leta. |
| **2026-08-19** | **`SO_7_1` bröt mot briefens fotokrav.** Briefen krävde äkta fotografi av det monterade överdraget. Levererat är ett studiokomponerat produktskott mot svart bakgrund, samma typ som `SO_5_1`. Genomstrykningen är korrekt och rubriken dominerar som specificerat, så budskapsdelen är rätt byggd. | Fotokravet är skärpt och omformulerat i `SO_8_1` och `SO_9_1`: "floating product render on a flat background" är nu uttryckligen förbjudet, eftersom "äkta fotografi" uppenbarligen lästes som render. |
| **2026-08-19** | **`SO_6_1` visar ett GRÖNT överdrag.** Grön är `availableForSale: false` i Shopify. Annonsen visar alltså en färg kunden inte kan köpa. | Flaggat till Axel. Regel tillagd i `PD_21_1`:s brief: överdraget i bild ska vara grått eller svart. |
| **2026-08-19** | **`SO_6_1`:s rubrik är skriven som ett kundomdöme i jag-form** ("Bytte aldrig sätet. Lade bara på detta."). Batch #5-briefen specificerade ägarobservation, inte kundcitat. Ingen namngiven person och ingen "verifierad kund"-badge, så det är INTE samma klass av brott som `SP_3_1_H1`/`SP_6_1`, men det är ett overifierat förstapersonspåstående. | Flaggat. Bör skrivas om till observation i tredje person om annonsen ska rulla vidare. |
| 2026-08-19 | `PD_20_1` visuellt verifierad **korrekt byggd**: äkta utomhusfoto, samma maskin i båda panelerna, chips och stödtexter ord för ord enligt brief, enda siffran är 649, ingen "överstruket"-bugg. `PD_14_1` likaså korrekt. | Positiv kontrollpunkt. Kontots bästa statik vann på konceptet, inte på en designavvikelse. |
| **2026-08-14** | **Femte eskaleringen: `SP_6_1` (fabricerad testimonial) fortfarande ACTIVE**, nio dagar efter första pausrekommendationen. `SP_3_1_H1` fortsatt `WITH_ISSUES`. | Frågan ställs igen. Detta är den längst öppna posten i produktens historia. |
| 2026-08-14 | Datakvalitetskontrollen ren tredje rundan i rad: alla 15 rader med köp matchar på 0,00 % avvikelse. | Fältet stabilt användbart. Kontrollen körs ändå varje runda. |
| 2026-08-06 | Batch 3 (`PD_11_1`, `SO_3_1`, `PD_12_H1`) visuellt verifierad korrekt vid launch: rätt pris (649 kr) på alla tre, ingen konkurrentlogga i PD_11:s "tunt tyg"-panel, ingen påhittad gåvohögtid i SO_3, PD_12:s hook-bild matchar briefens "blöt/daggig säte-closeup". Kunde inte verifiera den bokstavliga "POV:"-textkortet i PD_12 från en enskild stillbild (video ej avspelad i sin helhet) — flaggat som osäkert, inte som fel. | Positiv kontrollpunkt, inga fel hittade. |

---

## Öppna frågor till Axel
1. **[Olöst sedan runda 2 — fjärde eskaleringen]** Pausa `SP_6_1` och `SP_3_1_H1` (fabricerade testimonials)? Frågades första gången 2026-08-05. Inget svar och ingen åtgärd i fyra rundor. Jag pausar inte annonser själv utan uttryckligt ok.
1b. **[NYTT, runda 6 — beslut som ger pengar]** `SO_7_1` gör CPA 88 kr på 175 kr spend och `PD_20_1` CPA 191 kr, mot vinnarens 302 kr. Båda svälts fortfarande. Vill du att jag flyttar budget dit, eller ska CBO få fortsätta fördela själv?
2. **[Runda 3, nu skarpare]** `PD_1_1_H1` är inte längre en gråzon: 1 340 kr spend, 2 köp, **CPA 670 kr mot break-even 474 kr** — den förlorar pengar per köp. Formellt under signifikansgränsen (2 < 3 köp), men den har inte rört sig på en vecka. Pausa? `SP_2_1_H1` (0 köp, 503 kr) samma fråga.
2c. **[Runda 6]** `PD_1_1_H1` är nu formellt kill-bar: 3 köp, CPA 531 kr mot break-even 474 kr, vinstbidrag −172 kr. Detta är det första beslut där data ensamt räcker. Pausar du den?
2b. **[Nytt runda 5]** `PD_13_H1` ligger på CPA 332 kr — lönsam, men över target 300 kr. Ska den få mer budget medan `PD_18_H1`-testet väntar, eller ligga kvar på nuvarande nivå? Detta är ett skalningsbeslut, alltså ditt.
3. Judge.me-export (riktiga recensioner) — efterfrågades 2026-07-30, saknas fortfarande. Blockerar `SP_6_1` (redan launchad felaktigt) och framtida testimonial-briefer.
4. Bekräfta att `SP_4_H1`/`SP_5_H1`:s filmade person är en riktig kund/creator, inte återanvänt leverantörsmaterial — påverkar om "vanligaste kommentaren"-raden får fortsätta användas.
5. ~~**[Runda 3]** Fortsätta bygga varje runda oavsett kvotläge?~~ **BESVARAD 2026-08-06: JA.** Axel vill ha buffert med briefer till nästa analys. Kvoten är ett **golv, inte ett tak** — bygg alltid minst kvoten, mer när managern ber om det. Motivera aldrig bort en batch med hänvisning till att kvoten redan är uppfylld. Batch #4 (4 briefer) byggd efter detta besked.
