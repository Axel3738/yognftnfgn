# Batch-log — Termoskyddet för Husbil

Breakthrough-frekvens: 2/16 (13 %) (uppdaterad 2026-09-21, backfill av hela bakkatalogen)

## Batch #1 — 2026-09-14 (`/forsta-batch`, på Axels begäran)

**Trigger:** Axel skapade sex nya `BÄVER …`-hubbar i Notion 2026-09-14 och bad
om creative strategy för fyra av produkterna i samma vända. Termoskyddet hade
launchats 2026-09-11 och aldrig fått en riktig brief-runda.

**Underlag:** livstidsdata ur Meta 2026-09-14 — 3 682 kr spend, 23 köp,
ROAS 3,60, intäkt 13 248 kr. AOV 576 kr → **break-even-CPA 358 kr**
(break-even-ROAS 1,61 ur kampanjnamnet). Grind 300 kr / 3 köp. Budgeten höjdes
1 400 → 1 650 kr/dag samma dag.

Bara **två** annonser är bedömbara: `CS_3` (statisk, rabatt) med CPA 184 kr och
81 % av all vinst, och `SP_2` (statisk) med CPA 187 kr. Ingen video har ett enda
köp — men ingen video har heller nått 80 kr spend, så det är svält, inte en dom.
Fullständig tabell och alla verifierade produktsidesfakta står i `dna.md`.

**Tre saker som styrde hela batchen** (alla tre bryts av live-annonserna i dag):

1. Produkten har **noll recensioner** — inga stjärnor, inga citat, ingen
   volymproof i någon brief.
2. **Säsongen är fel** i vinnaren `CS_3`, som säger "inför sommaren". Det är
   september på väg in i vintern: kondens, imma, mörker och kyla är vinkeln nu.
3. **Ingen påhittad brådska.** `CS_3`:s "IDAG ENDAST" är borta i alla varianter.

**Briefer i denna batch — 17 st (6 video, 11 statiska):**

| Annons | Format | Hypotes | Källa |
|---|---|---|---|
| Termoskydd_PD_4_H1 | Video | Kondens är produktens skarpaste och mest säsongsriktiga problem. Skyddet sitter utanpå glaset — mekanismen går att visa | Sidans egen mekanikrad |
| Termoskydd_CO_1_H1 | Video | Konkurrenten är innanförgardinen, inte ingenting. Utvändigt vinner på en mekanism man kan peka på | Sidans jämförelse |
| Termoskydd_RI_1_H1 | Video | Den återkommande kostnaden: torka imma varje morgon mot två minuter en gång | Sidans egen formulering |
| Termoskydd_PR_1_H1 | Video | Integritet på rastplatsen — outnyttjad vinkel som står ordagrant på sidan | Produktsidan |
| Termoskydd_UG_1_H1 | Video | "Spänns fast utan att öppna dörrarna" blir bevis om det filmas i realtid | Luckan: ingen talande person |
| Termoskydd_SP_4_H1 | Video | Utan recensioner måste proof byggas på mätbara egenskaper — kan spec-proof ersätta social proof? | Noll-recensionsläget |
| Termoskydd_CS_4_1 | Statisk | Vinnaren utan påhittad brådska och med säsongen rättad från sommar till höst/vinter | CS_3, 81 % av vinsten |
| Termoskydd_SP_5_1 | Statisk | Obelagt citat byts mot verifierad funktionsrad | SP_2_1 (CPA 51 kr, ännu ej bedömbar) |
| Termoskydd_PD_5_1 | Statisk | Måtten är den vanligaste invändningen — visa dem mot en riktig husbil | Produktsidans mått |
| Termoskydd_LI_1_1 | Statisk | Faktatät listicle utan adjektiv, fem verifierade rader | Produktsidan |
| Termoskydd_CO_2_1 | Statisk | Utvändigt mot innanför som statisk — formatjämförelse mot CO_1_H1 | CO_1_H1 |
| Termoskydd_PR_2_1 | Statisk | Mörkläggningen som egen annons — ingen konkurrent kan signera den | Produktsidan |
| Termoskydd_CS_5_1 | Statisk | Prisankaret som ren offer-grafik — hur långt bär siffran ensam? | CS_3 |
| Termoskydd_MT_1_1 | Statisk | Mängdrabatten (2 st −15 %, förvald) förklarar varför AOV ligger över styckpriset och har aldrig testats i en annons | Produktsidans erbjudande |
| Termoskydd_BOF_1_1 | Statisk | BOF: siffran ensam till den som redan sett produkten | — |
| Termoskydd_BOF_2_1 | Statisk | BOF: riskavlastning — fri frakt, 30 dagars öppet köp, Klarna | Produktsidan |
| Termoskydd_BOF_3_1 | Statisk | BOF-invändning: "passar den min husbil?" Måtten är svaret | Produktsidan |

**Levererat:** samtliga 17 som items i **`BÄVER Termoskyddet för Husbil`**
(data source `collection://7d0270ab-908c-831e-8021-8758336851c8`), Status
`Draft`, Typ `Video`/`Image - Pending Approval`, hela briefen i sidan.
Verifierat med SQL mot collectionen: 6 video + 11 bild = 17. Sidan
`Termoskydd_PD_4_H1` öppnad och genomläst — tre-frågorstabellen (19 rader) och
shot list (8 rader) låg som riktiga Notion-tabeller.

⚠️ **Hubbens moderdatabas heter fortfarande `Hiking Gaiters creative hub`** —
Axel har återanvänt en befintlig databas. Data sourcen heter rätt
(`BÄVER Termoskyddet för Husbil`) och är den Axel pekade ut. Sök på data
source-id, inte på databasens titel, nästa gång.

**Modellpolicy:** följd. En sonnet-subagent per brief skrev all svensk copy och
körde tre-frågorstestet rad för rad.

⚠️ **Shopify MCP var nere** (token utgången). Pris och jämförpris lästes ur
produktsidans egen rådata (`"price":55900`, `"compare_at_price":93200`) och
JSON-LD. Recensionsläget lästes ur Judge.me-widgetens egna attribut
(`data-number-of-reviews='0'`).

**Nästa lediga AD-ID:** CS 6, G 4, PD 6, SP 6, CO 3, LI 2, MT 2, PR 3, RI 2,
UG 2, BOF 4.

---

## Batch #2 — 2026-09-15 (extra runda på Axels begäran)

**Varför den kördes utanför kadensen.** Kadensspärren flaggade inte produkten:
`FORSTA_BATCH_KLAR` skrevs 2026-09-14, alltså `dagarSedanBatch = 1` mot
`BRIEF_INTERVALL_DAGAR = 3`. Axel bad om den ändå — produkten drar iväg och han
vill ha mer material. Batchen är alltså inte ett ronds-behov utan en
ägarbeställning, och 3-dagarsklockan startas om av den här raden precis ändå.

⚠️ Att veta: förstabatchens **17 briefer från 2026-09-14 ligger fortfarande
orörda som Draft** i hubben. Efter den här batchen står 26 briefer i kö. Om det
inte börjar röra sig är flaskhalsen redigerarna, inte briefarna.

**Kampanjstatus:** ACTIVE. Budgeten skalades samma morgon 1 650 → 1 950 kr/dag
(ROAS 3,26 på 3 dagar mot break-even 1,61).

### Feedbackloop — livstid avläst 2026-09-15 (`date_preset: maximum`)

Kampanjen: 5 279,16 kr spend, 32 köp, ROAS 3,46. AOV 571 kr →
**break-even-CPA 355 kr**. Vinstbidrag `(355 − CPA) × köp`:

| Annons | Format | Spend | Köp | CPA | ROAS | **Vinstbidrag** |
|---|---|---|---|---|---|---|
| `Termoskydd_CS_3` (top spender = benchmark) | statisk | 3 668 | 19 | 193 | 3,00 | **3 078 kr** |
| `Termoskydd_SP_2_1` | statisk | 371 | 4 | **93** | 6,03 | **1 048 kr** |
| `Termoskydd_SP_2` | statisk | 683 | 4 | 171 | 3,27 | 736 kr |

Under domgränsen, ingen dom: `CS_2_1` (384 kr, 2 köp), `CS_2` (224 kr, 4 köp,
ROAS 9,98 — men under 300 kr spend).

**Två fynd styr batchen.**

1. **Statiska annonser bär 100 % av allt bevisat resultat.** Varenda video i
   kampanjen ligger på 2–30 kr spend. PD-serien: 5,42 / 30,21 / 4,44 / 1,98 kr.
   G-serien: 6–85 kr. De är **svältna i CBO:n, inte dömda** — samma mönster som
   i motorhöljets DNA, nu fjärde produkten. Ingen video har fått en chans, så
   fyra av rundans sex annonser är video.
2. **SP slår CS på CPA** — 93 och 171 kr mot benchmarkens 193 kr. ⚠️ Men SP
   betyder social proof, och produktens recensioner är seedade (se nedan).
   Rundans SP-koncept bär därför ägarens EGEN situation i jag-form, som scen och
   inte som omdöme. Inget i dem får läsas som ett kundutlåtande.

### ⚠️ Recensionerna är seedade — och `source: web` är inte längre ett bevis

Judge.me läst 2026-09-15 med produktens egna id (2156895126): **30 recensioner —
men det är samma TIO texter återanvända tre gånger med olika namn påsatta.**
Tio av dem har `source: wizard`, tjugo har `source: "web"`.

Det är en **rättelse av gårdagens slutsats**: `source: web` behandlades då som
bevis på att en recension är organisk (det var argumentet för att bygga
review-bilder till Båtmotorskyddet). Här är `web`-raderna ordagranna dubbletter
av `wizard`-raderna. Etiketten säger alltså bara hur raden kom in, inte om en
kund skrev den. **Rätt test är om texterna är unika och produktspecifika, inte
vilken `source` de bär.**

Noll review-bilder i den här batchen. Ingen rad i någon brief får bära citat,
stjärnbetyg eller "X nöjda kunder".

### Batchen — 9 briefer (4 video + 2 statiska i rundan, 3 BOF-bilder)

| Annons | Format | Hypotes | Isolerad variabel |
|---|---|---|---|
| `Termoskydd_PD_6_H1` | video | CS_3:s bevisade budskap (kondensen stoppas utanpå glaset) får sitt första riktiga videotest | formatet, budskapet låst |
| `Termoskydd_SP_6_H1` | video | SP-vinkelns situation som filmad scen i jag-form: solen klockan fyra, och samma morgon med skyddet på | situationen buren i video |
| `Termoskydd_PD_7_H1` | video | Monteringen i realtid — flikarna kläms i dörrkarmen, dörrarna öppnas aldrig | enkelheten som visat bevis |
| `Termoskydd_OB_1_H1` | video | "Räcker inte en gardin?" besvarad genom att visa VAR fukten hamnar | ny vinkel på bevisat problem |
| `Termoskydd_CS_6_1` | statisk | CS_3:s exakta layout med mörkläggning/insyn som ledande fakta i stället för värmen | argumentet, layouten låst |
| `Termoskydd_SP_7_1` | statisk | SP_2_1:s komposition (CPA 93 kr) med ny situation | situationen, kompositionen låst |
| `Termoskydd_BOF_4_1` | statisk, BOF | 559 kr / ord. 932 kr / spara 373 kr (40 %) | — |
| `Termoskydd_BOF_5_1` | statisk, BOF | garanti och betalning, ordagrant enligt sidan | — |
| `Termoskydd_BOF_6_1` | statisk, BOF | "passar det min husbil?" löst med 211 / 171 / 90 cm | — |

**Priset verifierat live 2026-09-15:** 559 kr, jämförpris 932 kr, spara 373 kr
= 40 %. Rabatten är äkta och får skrivas ut.

**Garantin, ordagrant och det enda som får skrivas:** "30 dagars öppet köp –
gillar du det inte får du pengarna tillbaka." + "Smidig leverans och trygg
betalning med Klarna." Ingen fri frakt, ingen leveranstid, ingen ångerrätt.

⚠️ **Sidan säger själv att miljöbilderna är AI-genererade illustrationer.**
Det står inskrivet i varje brief: bevis ska filmas eller fotograferas på riktigt,
aldrig byggas på en miljöbild.

**Modellpolicy följd:** all svensk copy skriven av en sonnet-subagent.
Huvudsessionen rättade tre rader i `BOF_5_1` som subagenten hade märkt som
fallna på tre-frågorstestet men ändå velat skicka — garantitexten är ett
faktapåstående om erbjudandet, inte en persuasionsrad, och är därför undantagen
från konkurrent-kolumnen, inte underkänd i den.

---

## Feedbackloop + batch #2 — 2026-09-18 (`/rond-auto` steg 4b, brief-runda)

**Läget i kampanjen (livstid, avläst 2026-09-18 ur MagiBorsten 1867947880635861):**
11 511 kr spend · 64 köp · livstids-ROAS 3,18 mot break-even 1,61. Dagsbudget 2 300 kr (oförändrad denna körning — VANTA_KADENS, höjd så sent som i går).

**Datakvalitet:** `amount_spent × purchase_roas` summerat per annons stämmer mot
kampanjens egen intäkt inom avrundning; annonsurvalet täcker 96 % av kampanjens
spend. `omni_purchase_values` användes INTE (känd bugg, CLAUDE.md). Inga trasiga rader.

**Signifikansgrind (ANALYSMETOD steg 2c):** 4 annonser bedömbara. För tidigt, ingen dom: Termoskydd_CS_2_1 (578 kr/2 köp).

**Vinstbidrag — rangordnat på vinst, inte på ROAS eller CPA.**
Break-even-CPA räknas per annons på dess EGEN AOV (`intäkt/köp ÷ break-even-ROAS`),
aldrig på en blandad siffra:

| Annons | Status | Spend | Spend% | Köp | CPA | BE-CPA | ROAS | CTR | **Vinstbidrag** |
|---|---|---|---|---|---|---|---|---|---|
| Termoskydd_CS_3 (top spender = benchmark) | ACTIVE | 4 811 | 44 % | 26 | 185 | 366 | 3,18 | 4,67 % | **+4 702 kr (41 %)** |
| Termoskydd_CS_2 | ACTIVE | 4 050 | 37 % | 25 | 162 | 347 | 3,45 | 3,51 % | +4 630 kr (40 %) |
| Termoskydd_SP_2_1 | ACTIVE | 764 | 7 % | 6 | 127 | 347 | 4,39 | 6,34 % | +1 319 kr |
| Termoskydd_SP_2 | ACTIVE | 852 | 8 % | 5 | 170 | 347 | 3,28 | 3,62 % | +884 kr |

Summa vinstbidrag i urvalet: **+11 535 kr**. Alla fyra bedömbara annonser är
statiska, och alla fyra går med vinst.

**Mönster (data skild från hypotes):**
1. **BEVISAD — de två CS-statiska bär 81 % av vinsten.** CS_3 och CS_2 ligger
   nästan exakt lika (+4 702 / +4 630 kr). Instruktion: erbjudandet är motorn,
   och `CS_7_H1` bär det vidare i video.
2. **BEVISAD — SP_2_1 är den effektivaste kompositionen.** CPA 127 kr där
   benchmarken CS_3 betalar 185 kr, på kampanjens högsta CTR (6,34 %).
   Instruktion: lås layouten, byt innehållet — `CS_8_1` och `SP_9_1`.
3. **HYPOTES, inte dom — videon är utsvulten, inte svag.** Ingen video har ett
   enda köp, men ingen video har heller fått spend att tala om. Fyra av sex
   rundannonser är därför video denna batch, precis som batch #1 beslutade.
4. **BEVISAD — de tre spärrarna gäller fortfarande.** Noll recensioner
   (Judge.me-vidgeten avläst igen), september på väg in i vintern, och ingen
   påhittad brådska. CS_3 bryter mot alla tre men rörs inte — den är live och
   lönsam, och stoppregeln gäller före uppladdning, inte i efterhand.

**Priset avläst live 2026-09-18** ur butikens produkt-JSON: 559 kr, jämförpris 932 kr → spara 373 kr = 40 %. Mängdrabatt: 2 st −15 % (förvald), 3 st −20 %.

### Batch #2 — 9 (4 video + 2 statiska i rundan, 3 BOF-bilder, 0 review-bilder) briefer, alla i Notion som Draft

| Annons | Format | Hypotes | Isolerad variabel |
|---|---|---|---|
| `Termoskydd_CS_7_H1` | video | CS-erbjudandet i rörlig form, ärligt och utan brådska | formatet |
| `Termoskydd_PD_8_H1` | video | tvåminutersjobbet tidtaget i bild, utan att öppna en dörr | beviset |
| `Termoskydd_PD_9_H1` | video | kondensmekaniken visad i delad bild: imma utanpå, ruta klar | mekanismen |
| `Termoskydd_SP_8_H1` | video | vinterförvaringsvinkeln ur backloggen — husbilen står still okt–mars | vinkeln |
| `Termoskydd_CS_8_1` | statisk | SP_2_1:s komposition med mörkläggning/insyn som rubrik | rubriken |
| `Termoskydd_SP_9_1` | statisk | sidoflikarna ur backloggen som eget bevis, 90 cm i närbild | beviset |
| `Termoskydd_BOF_7_1` | statisk, BOF | 559 kr mot 932 kr + den riktiga mängdrabatten | — |
| `Termoskydd_BOF_8_1` | statisk, BOF | fri frakt inom Sverige + 30 dagars öppet köp | — |
| `Termoskydd_BOF_9_1` | statisk, BOF | passformsinvändningen: 211 × 171 cm och 90 cm flikar | — |

**Två backlog-idéer använda** och märkta `[använd i batch #2]` i `backlog.md`:
vinterförvaringsvinkeln (`SP_8_H1`) och sidoflikarna (`SP_9_1`).
**Inga review-bilder** — produkten har fortfarande noll recensioner.

**Modellpolicy följd (CLAUDE.md regel 6):** all svensk copy skriven av en
sonnet-subagent som fick DNA, hypotes, hook, formatkrav och `docs/copy-regler.md`.
Strategi, analys, namngivning och briefstruktur gjordes av huvudsessionen.
Tre-frågorstestet står i varje brief, rad för rad.

**Rättat av huvudsessionen efter subagenten:**
- `PD_8_H1` hade en påhittad mätning i copyn: "1 minut och 52 sekunder,
  uppmätt". Ingen har filmat monteringen, så siffran fanns inte. Ersatt med
  `[TID]` som redigeraren fyller i ur den verkliga tagningen, plus en regel om
  att hooken ska ändras om jobbet tar längre än två minuter.
- `CS_8_1`:s `Why` sa CPA 93 kr för SP_2_1; dagens avläsning är 127 kr. Rättat.

## Etiketter dag 7 (2026-09-21)

Etiketten är ingen dom (dom kräver 300 kr och 3 köp, kolumnen Bedömbar). Räknad på annonsens egna första vecka, backfillad 2026-09-21 ur Meta. Rådata: ETIKETT-raderna i agent/budgetlogg.jsonl.

| Annons | Batch | Typ | Etikett (7 d) | Andel | Spend | Köp | ROAS ad / kampanj | Bedömbar | Playbook |
|---|---|---|---|---|---|---|---|---|---|
| Termoskydd_SP_2 | 2 | okänd | **KPI_WINNER** | 8 % | 847 kr | 5 | 3,30 / 3,25 | ja | 3 nya hookar, allt annat lika — den säljer men får inte spend |
| Termoskydd_SP_1 | — | okänd | **LOSER** | 1 % | 58 kr | 0 | 0,00 / 3,25 | nej | släpp |
| Termoskydd_SP_2_1 | 2 | okänd | **KPI_WINNER** | 7 % | 753 kr | 6 | 4,45 / 3,25 | ja | 3 nya hookar, allt annat lika — den säljer men får inte spend |
| Termoskydd_SP_3 | — | okänd | **LOSER** | 1 % | 151 kr | 0 | 0,00 / 3,25 | nej | släpp |
| Termoskydd_PD_2_1 | — | okänd | **INGEN_LEVERANS** | — | 2 kr | 0 | 0,00 / 3,25 | nej | hooken föll — logga och släpp, aldrig ABO |
| Termoskydd_PD_3 | — | okänd | **INGEN_LEVERANS** | — | 5 kr | 0 | 0,00 / 3,25 | nej | hooken föll — logga och släpp, aldrig ABO |
| Termoskydd_PD_2 | — | okänd | **LOSER** | 0 % | 34 kr | 0 | 0,00 / 3,25 | nej | släpp |
| Termoskydd_PD_1 | — | okänd | **INGEN_LEVERANS** | — | 8 kr | 0 | 0,00 / 3,25 | nej | hooken föll — logga och släpp, aldrig ABO |
| Termoskydd_G_2_1 | — | okänd | **LOSER** | 0 % | 10 kr | 0 | 0,00 / 3,25 | nej | släpp |
| Termoskydd_G_3 | — | okänd | **INGEN_LEVERANS** | — | 8 kr | 0 | 0,00 / 3,25 | nej | hooken föll — logga och släpp, aldrig ABO |
| Termoskydd_G_2 | — | okänd | **LOSER** | 0 % | 10 kr | 0 | 0,00 / 3,25 | nej | släpp |
| Termoskydd_G_1 | — | okänd | **LOSER** | 1 % | 96 kr | 0 | 0,00 / 3,25 | nej | släpp |
| Termoskydd_CS_2_1 | 2 | okänd | **LOSER** | 5 % | 578 kr | 2 | 1,93 / 3,25 | nej | släpp |
| Termoskydd_CS_3 | 2 | okänd | **BREAKTHROUGH** | 43 % | 4799 kr | 26 | 3,19 / 3,25 | ja | 80 % vidarebygg på denna: I1 tre hookar → I2 problemdel → I3 in media res |
| Termoskydd_CS_2 | 2 | okänd | **BREAKTHROUGH** | 34 % | 3794 kr | 25 | 3,68 / 3,25 | ja | 80 % vidarebygg på denna: I1 tre hookar → I2 problemdel → I3 in media res |
| Termoskydd_CS_1 | — | okänd | **LOSER** | 1 % | 89 kr | 0 | 0,00 / 3,25 | nej | släpp |

## Feedbackloop + batch #3 — 2026-09-21 (`/rond-auto` steg 4b, brief-runda)

**Läget (livstid, avläst 2026-09-21):** 18 744 kr · 83 köp · ROAS 2,67 mot break-even
1,61 · AOV 603 kr ⇒ BE-CPA 375 kr. Dagsbudget oförändrad (VANTA_KADENS).
**Annonsnivå:** `Termoskydd_CS_2` är BREAKTHROUGH (dag 7) men går back tredje dygnet
(3 d: 5 091 kr / 11 köp / ROAS 1,28; 7 d: 8 783 kr, ROAS 2,27) ⇒ nåd,
`VANTA_BREAKTHROUGH` loggad, inte pausad.

| Annons | Spend | Spend% | Köp | CPA | ROAS | **Vinstbidrag** |
|---|---|---|---|---|---|---|
| Termoskydd_CS_3 (BREAKTHROUGH) | 5 445 | 29 % | 30 | 181 | 3,55 | **+5 792 kr** |
| Termoskydd_CS_2 (BREAKTHROUGH, top spender = benchmark, under nåd) | 8 978 | 48 % | 36 | 249 | 2,28 | +4 506 kr |
| Termoskydd_SP_2_1 | 1 157 | 6 % | 6 | 193 | 2,90 | +1 090 kr |
| Termoskydd_SP_2 | 905 | 5 % | 5 | 181 | 3,09 | +968 kr |

**Mönster:** (1) BEVISAD — de två CS-statiska bär 84 % av vinsten; CS_3 är nu ensam
vinnare medan CS_2 svalnar ⇒ `CS_9_1` är CS_3:s syskon med nattbild; (2) HYPOTES —
videon är fortfarande utsvulten, inte svag (ingen video över 300 kr med köp; SP_4_H1
har 3 köp på 64 kr efter ett dygn); (3) BEVISAD — spärrarna gäller: noll recensioner,
aldrig sommar/värme, ingen brådska. Priset avläst live: 559 kr / 932 kr (spara 373 kr, 40 %).

### Batch #3 — 4 video + 2 bild i rundan, 0 BOF, 0 review — alla i Notion som Draft (BÄVER Termoskyddet för Husbil)

| Annons | Format | Hypotes | Isolerad variabel | Källa |
|---|---|---|---|---|
| `Termoskydd_PD_10_H1` | video | mörkläggning över hela framvagnen (integritet) | vinkeln (privacy) | sidraden + gissning |
| `Termoskydd_PD_11_H1` | video | gardin innanför immar, skydd utanpå håller klart (konflikt typ A) | vinkeln (jämförelse) | sidraden + copy-regler |
| `Termoskydd_UG_2_H1` | video | UGC-morgon: skyddet av i en rörelse, klar ruta | formatet (creator, ingen VO) | gissning |
| `Termoskydd_OB_2_H1` | video | "Passar den din husbil?" — mät på två minuter (211/171/90 cm) | vinkeln (passform) | sidans mått + gissning |
| `Termoskydd_CS_9_1` | bild | CS_3:s layout med nattbild | bilden | förälder CS_3 |
| `Termoskydd_PD_12_1` | bild | innanför/utanpå som delad bild — vinkeln billigt före video | vinkeln | sidraden + gissning |

**Spegling till CaraShell:** inga policyrader (frakt/Klarna/retur) i bild, slutbild eller captions.
**0 BOF** (BOF_7_1/8_1 2 dygn, ingen etikett). **0 review** (noll recensioner).
Feedback-raden Brief review 2026-09-18 läst. Annonsidéer: inga rader. Copy av sonnet-subagent
(regel 6). Anmärkning: PD_11_H1:s scenrad "Två sätt att skydda framrutan" och UG_2_H1:s första
halva är generiska på egen hand — subagenten behöll dem som scensättning, argumentet bärs av
raderna efter. ⚠️ Regitabell + komponenttaggar (rond-auto 2.9/2.12, `f1bbba1`) saknas — se Fisk-loggen.

## Vidarebygg + batch #4 — 2026-09-23 (`/rond-auto` steg 4b, `annonsbehov: vidarebygg`)

**Läget (3 d, avläst 2026-09-23):** VANTA_KADENS (budget 2 300 kr, ändrad 2026-09-22). Två
levande breakthroughs: `Termoskydd_CS_3` (L-120250175770080291, 0 av 3 iterationer gjorda före
i dag) och `Termoskydd_CS_2` (L-120250175768000291). Brieftaket: 2 fria + 5 namngivna, varav
`CS_9_1` struken (fanns redan i hubben sedan batch #3). Feedback-raden Brief review 2026-09-18
läst (sidans villkor, ingen policy i bild, konceptkod = vinkel, riktig källväg). Annonsidéer:
0 rader Ny. Priset läst live: 559 kr / 932 kr (spara 373 kr, 40 %).

### Batch #4 — 2 video + 2 bild, alla i Notion som Draft (BÄVER Termoskyddet för Husbil)

| Annons | Format | Parent · iteration | Hypotes (en variabel) | Hookrad | Notion |
|---|---|---|---|---|---|
| `Termoskydd_CS_10_1` | bild | CS_3 · längre problemdel | imman innanför är problemet, skyddet utanpå är svaret — samma pris, ingen brådska | "Imman sitter på insidan. Skyddet sitter på utsidan." | `3e4270ab908c8174ad4ee4df2df54e0b` |
| `Termoskydd_CS_11_H1` | video 8 s | CS_3 · in media res | sekund 0 = fliken kläms i dörrkarmen, ingen inledning | "Två minuters jobb." | `3e4270ab908c819d8b25f988c19419fc` |
| `Termoskydd_CS_12_1` | bild | CS_2 · ny hook | CS_2:s bild oförändrad, bara texten byts | "Spänns fast utan att öppna dörrarna." | `3e4270ab908c81c092eed4829fbeb163` |
| `Termoskydd_CS_12_H1` | video 6 s | CS_2 · in media res | imman torkas bort inifrån i sekund 0 | "Torka bort imman. Varje morgon." | `3e4270ab908c81e3b933ef4d510a0341` |

Iteration 2 på CS_2 byggdes inte med flit (samma variabel som CS_10_1). Regitabell rad för
rad i varje videobrief, spärren `briefgranskning.mjs` exit 0, `lardom.mjs --brief` 4 BRIEF-rader.
Butiksneutralt (speglas till CaraShell): inget butiksnamn, inga policyrader, inga recensioner,
aldrig sommar, ingen brådska. Copy av sonnet-subagent (regel 6); `## Avatarer` tillagt i dna.md.
⚠️ `lardom.mjs` räknar iterationerna 1–4 på konceptet `cs-pris-utan-bradska` (loggen vinner);
briefarnas taggar säger parent-relativt 2/3/1/3 — samma sak sedd från två håll.
