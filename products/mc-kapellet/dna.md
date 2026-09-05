# Creative DNA – MC-Kapellet (Bäverbutiken)

**Produkt:** MC-Kapell 218×118 cm – Regn, Damm & UV · 349 kr (ordinarie 582 kr, spara 40 %)
**LP:** https://baverbutiken.se/products/mc-kapell-220-120-regn-damm-uv
**Konto:** MagiBorsten `1867947880635861` (SEK) · Kampanj `MC-Kapellet | BE ROAS 1.49 | Launch 2026-08-27` (`120249990507280291`) · Sida `678639638662543`
**Break-even-ROAS (kill):** 1,49 → **break-even-CPA ≈ 292 kr** (omräknad 2026-09-05 ur de tre bedömbara annonsernas egen viktade AOV 434,83 kr / 1,49 — höjd från 282 kr i Batch #1, se "Läs detta först" punkt 2)
**Senast uppdaterad:** 2026-09-05, `/cs`-körning (Batch #2 briefad, steg 4b i nattronden)

---

## ⚠️ Läs detta först

1. **Fortfarande bara tre annonser har passerat signifikansgränsen** (300 kr
   spend OCH 3 köp), men de har vuxit kraftigt sedan Batch #1 (mätt
   2026-09-05, `maximum`-livstid): `MC-Kapell_PD_1` (4 074,64 kr, 19 köp, CPA
   214,45 kr), `MC-Kapell_PD_3` (1 691,90 kr, 7 köp, CPA 241,70 kr),
   `MC-Kapell_CS_2_1` (1 060,06 kr, 11 köp, CPA 96,37 kr). Kampanjens
   livstidsspend är nu 8 609,32 kr. Övriga ~25 annonser ligger under grinden.
2. **Break-even-CPA (292 kr) är omräknad 2026-09-05** ur de tre bedömbara
   annonsernas egna, viktade AOV (16 088,90 kr / 37 köp = 434,83 kr;
   434,83/1,49 ≈ 291,8 kr) — inte längre 282 kr. Ordervärdet varierar
   fortfarande per annons (349–477 kr), troligen pga tillval/fraktvärde i
   pixeln. Räkna om igen vid nästa `/cs` om spridningen håller i sig.
3. **VIKTIGT — falsk premiss upptäckt och rättad 2026-09-05:** en tidigare
   instruktion antog att en/flera annonser i den här kampanjen hade PAUSATS
   som "spendtjuv" i åtgärdstrappan senaste veckan. Det stämmer inte.
   `agent/budgetlogg.jsonl` innehåller INGEN `TRAPPA_FORLANGNING`-rad för
   kampanj `120249990507280291` — enda trappsteget som togs var
   `TRAPPA_STEG_1` (2026-08-30), som uttryckligen loggar "ingen enskild
   aktiv annons ... stannar där för idag". Verifierat direkt mot kontot
   2026-09-05: samtliga ~28 annonser i kampanjen har `effective_status`
   ACTIVE, ingen är PAUSED. Batch #2 (nedan) är alltså en vanlig
   feedback-loop-batch, inte en "ersätt det pausade"-batch — hitta aldrig på
   en pausad annons för att en instruktion antar det.
4. **Notion-hubben ligger privat.** `notion-fetch` på databasen
   `3cf270ab-908c-81c1-bfd2-d78f9a45b3d8` gav tomt `<ancestor-path>` — hubben
   är inte synlig i teamspacet Bäverbutiken (samma mönster som andra
   arkiverade skalningshubbar). Nya items går att skapa i den (bekräftat
   2026-09-05), men den bör flyttas in i teamspacet av Axel om redigerarna
   ska hitta den utan direktlänk.
5. **`MC-Kapell_PD_2` är fortfarande ett tidigt varningstecken, inte en dömd
   förlorare.** 576,86 kr spend men bara **1** köp (ROAS 0,60) — spenden
   passerar 300 kr men köpen inte 3, så den ligger formellt kvar i
   "för tidigt"-högen (ANALYSMETOD steg 2c), oförändrad sedan Batch #1. Ta
   INTE bort den, men bygg ingen ny brief som kopierar dess creative-mönster
   (macro-shot på blöt duk utan att motorcykeln syns i bild).
6. **Datakvalitet OK, omkontrollerad 2026-09-05:** `amount_spent ×
   purchase_roas` matchar `omni_purchase_values` på alla sex
   bedömbara/nästan-bedömbara annonser (PD_1, PD_3, PD_2, CS_2_1, SP_1,
   OF_1_1) inom öret — inget tecken på den kända
   `omni_purchase_values`-buggen i det här urvalet.
7. **Live-annonsen med faktafelet lever kvar och har vuxit till kampanjens
   bästa CPA.** `MC-Kapell_CS_2_1` säljer fortfarande på "40 % RABATT –
   IDAG ENDAST / Snart slutsåld" och har nu 11 köp, CPA 96,37 kr (bäst i
   kampanjen), ROAS 4,08. 40 %-rabatten är sann, "snart slutsåld"/"idag
   endast" är fortfarande overifierbara. Annonsen rörs inte. Batch #2 testar
   nu explicit OM det är den djärva/stora rubrikstilen (inte den falska
   brådskan) som driver resultatet: `MC-Kapell_CS_4_1` upprepar layouten med
   enbart sanna påståenden — ett isolerat variabeltest.
8. **CBO, inte ABO.** Fyra adset-serier (`PD`, `SP`, `CS`, `G`) delar en
   gemensam kampanjbudget, nu 1 200 kr/dag (skalad 2026-09-03, se
   `agent/budgetlogg.jsonl` kod `SKALA`).
9. **Batch #1:s 11 statiska/BOF/review-annonser är redan live i kampanjen**
   (verifierat i kontot 2026-09-05: `PD_6_1`, `LI_1_1`, `CO_2_1`, `SP_4_1`,
   `DE_2_1`, `RI_2_1`, `OF_1_1`, `GA_1_1`, `OB_1_1`, `RE_1_1`, `RE_2_1` finns
   alla med spend). Mekanismen som satte dem live är INTE verifierad i
   `agent/budgetlogg.jsonl` (ingen matchande rad) — troligen `/notionkorning`
   men det är en gissning, inte styrkt. **Batch #1:s SEX videobriefer
   (`PD_4_H1`, `PD_5_H1`, `CO_1_H1`, `RI_1_H1`, `DE_1_H1`, `ID_1_H1`) finns
   INTE i kontot** — de har antingen inte producerats än av redigerarna eller
   väntar fortfarande i Notion. Kolla hubbens statuskolumn innan du antar
   att de är döda; bygg inte om samma koncept i onödan om de bara väntar.

## Winning DNA (bevisad, nu n=19+7+11 köp — `PD_1`, `PD_3`, `CS_2_1`)

- **Format:** rå, oredigerad UGC-video (PD_1/PD_3) eller djärv fact-forward
  studio-static (CS_2_1) — riktig innergård/carport, riktig
  motorcykel/scooter, ingen studio-glans i videoformatet. Textöverlägg i
  video är en enkel vit "chip"-bubbla med kort mening — ingen grafisk
  brand-design.
- **Struktur:** motorcykeln syns FÖRE kapellet i bild (PD_3 visar hela
  scootern i 3 sekunder innan kapellet dras på); PD_1 visar två redan
  övertäckta MC i en trädgård, en mer "resultat"-öppning.
- **Proof-mekanism:** ingen text-baserad proof alls i videoklippen — proofet
  ÄR videons realism (handhållen kamera, vardagsmiljö). CS_2_1 (static) har
  istället en djärv rubrik + verkligt prisbevis (349 vs 582 kr) — ingen
  produktdemo alls, ren offer-mekanism.
- **CPA (2026-09-05, livstid):** PD_1 214,45 kr, PD_3 241,70 kr, CS_2_1
  96,37 kr — alla klart under break-even ≈292 kr.
- **Vinstbidrag (break-even 292 kr):** PD_1 ≈1 473 kr (störst i kronor, 47 %
  av kampanjens spend — top spendern ÄR benchmark), CS_2_1 ≈2 152 kr (bäst
  per spenderad krona: 12,3 % av spenden men störst enskilt vinstbidrag),
  PD_3 ≈352 kr.
- **Hook rate:** 94–96 % på PD_1/PD_3 — högt, men se nästa punkt.
- **Ny signal (för tidigt, n=1):** `MC-Kapell_OF_1_1` (batch #1, sant
  40 %-erbjudande utan overifierbar brådska) har 167,46 kr spend, 1 köp,
  ROAS 2,08 — för tidigt för en dom, men stödjer riktningen att ett sant
  erbjudande kan prestera minst lika bra som CS_2_1:s overifierbara variant.

## Viktig nyans: hooken/hold är förmodligen inte det som avgör (stärkt 2026-09-05)

PD_1 (vinnare), PD_3 (vinnare) och PD_2 (förlorare) har alla hook rate
94–97 % (video_play/impressions) — i praktiken identiskt. Nytt 2026-09-05:
även **hold** (video_p50_watched/video_play) är i samma härad hos alla tre:
PD_1 8,1 %, PD_3 5,7 %, PD_2 6,6 % — förloraren håller INTE sämre kvar
tittaren än vinnarna. Det stärker hypotesen ytterligare: varken hook eller
hold skiljer ut PD_2 som förlorare. Det AVGÖRANDE tycks i stället vara:
**syns motorcykeln + kapellet tillsammans i bild, i en igenkännbar miljö,
innan klippet slutar?** PD_1/PD_3 gör det, PD_2 visar en extrem närbild på
våt textil och en hand — inget sammanhang. Fortfarande en hypotes (n=1
förlorare, ej bekräftad i en andra körning), men den styr Batch #2:s
videobriefer likaväl som Batch #1:s.

## Losing DNA (hypotes, ej bevisad — n=1 köp, oförändrat sedan Batch #1)

`MC-Kapell_PD_2`: 576,86 kr spend, 1 köp, ROAS 0,60. Extrem närbild på regn
som rinner av tyget, ingen motorcykel synlig, ingen kontext. Hypotes:
"proof utan produkt-igenkänning" konverterar sämre än "produkt i sitt eget
sammanhang" — samma mönster som playbookens allmänna regel
(`docs/hook-visual-rule-2026-08-04.md`: produkt i bild tidigt).

## Behåll alltid

- Rå UGC-video, verklig miljö, ingen studio-look
- Motorcykel + kapell synliga tillsammans, tidigt i klippet
- Verkligt pris: 349 kr / ordinarie 582 kr / spara 40 % — verifierat mot
  Shopify 2026-09-02. Ändras priset: alla pågående annonser med gammalt pris
  flaggas.
- Garantin (30 dagars öppet köp) och fri frakt över 300 kr — äkta villkor,
  användbara i BOF utan att hitta på något.

## Testa kontrollerat (Batch #2, se `batch-log.md`)

- Problem-först-öppning på PD_1/PD_3:s bevisade mekanism (`PD_7_H1`)
- Priset uttalat högt i UGC-video, CS_2_1:s offer-mekanism överförd till
  video utan overifierbar brådska (`CS_5_H1`)
- Identitet konkretiserad till en verklig scen: gatuparkering utan carport
  (`ID_2_H1`)
- Isolerat variabeltest: CS_2_1:s djärva rubrikstil med enbart sanna
  påståenden i stället för falsk brådska (`CS_4_1`)
- BOF: ny visuell variant av det sanna erbjudandet (`OF_2_1`), ny
  ikon-layout för garanti/frakt (`GA_2_1`), ny invändning om blåst/storm
  grundad i resårkanten (`OB_2_1`)
- Två nya review-statics på oanvända riktiga Judge.me-citat: Anna Larsson,
  Mikael Andersson (`RE_3_1`, `RE_4_1`)

## Undvik

- "Snart slutsåld" / "idag endast" utan verklig lagerbrist eller tidsgräns
  (CS_2_1:s overifierbara rad — inte fel att den lever, men skriv den inte
  in i fler briefer). `CS_4_1` testar explicit om den falska brådskan går
  att ta bort utan att tappa CS_2_1:s CPA.
- Extrem närbild utan att motorcykeln syns i bild (PD_2-mönstret)
- Ogrundade volympåståenden. Draft-copyn i Drive (`ADCOPY_SP`, ej liveannons)
  innehåller redan raden "Tusentals motorcykelägare har redan valt..." —
  inte styrkt (kampanjen har ~38+ köp totalt, se ovan). Använd den inte.
- Att hitta på en pausad annons för att en instruktion antar det (se "Läs
  detta först" punkt 3) — kontrollera alltid `effective_status` i kontot.

## Obevisat

`SP`, `G` och de flesta `CS`/`CO`/`RI`/`DE`/`OF`/`GA`/`OB`/`RE`/`LI`-varianterna
har fortfarande för lite spend (<600 kr, de flesta <200 kr) för att säga
något om dem alls. `MC-Kapell_CS_2_1` har lämnat "obevisat" och är nu
bevisad Winning DNA (11 köp).

## Öppna luckor att täcka i nästa körning

- Meta Ad Library söktes av (`mc kapell motorcykel`, SE) — bara Bäverbutikens
  egna fyra ads kom upp, ingen extern konkurrent hittades att låna mekanismer
  från. Fortfarande inte gjort: sök bredare engelska/nordiska termer
  ("motorcycle cover", "MC presenning") om en riktig konkurrentsignal behövs.
- Video-kroppstext (`body`/primary text) för PD_1/PD_3/PD_2/CS_2_1 gick inte
  att hämta (creativen är äldre än de 100 senaste i kontot och låg utanför
  `ads_get_creatives`-listningen). Analysen bygger på visuell granskning av
  previews, inte på den fulla primärtexten. Be om creative-ID:n direkt om en
  framtida körning behöver exakt copy-text.
- Ingen `target_cpa_sek` satt — produkten ligger utanför
  `products/products.json` (rond-produkt, styrs av `agent/produktkarta.json`).
- Batch #1:s sex videobriefer (`PD_4_H1`, `PD_5_H1`, `CO_1_H1`, `RI_1_H1`,
  `DE_1_H1`, `ID_1_H1`) syns inte i kontot 2026-09-05 — kolla Notion-hubbens
  statuskolumn nästa körning för att se om de väntar på produktion eller
  fastnat.
- Notion-hubben ligger privat (tomt `<ancestor-path>`) — flagga för Axel,
  fixa inte på egen hand utan hans ok.
