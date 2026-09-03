# Batch-logg – Övervakningskameran

## Batch #1 — 2026-08-31 (`/forsta-batch`)

**Trigger:** `agent/rond.mjs` flaggade produkten som `forsta_batch`-behov — kampanjen
hade passerat 1 500 kr spend och låg över break-even utan att ha fått en riktig
creative-batch sedan launch 2026-08-21.

**Data vid analystillfället (livstid 2026-08-21–2026-08-31):**
3 748,21 kr spend, 10 köp, ROAS 3,45, CPA 374,82 kr, break-even-ROAS 1,57
(break-even-CPA ≈ 509 kr). En (1) bedömbar annons: `Overvakningskamera_SP_2`
(2 919,90 kr spend, 9 köp, CPA 324,43 kr, vinstbidrag 1 661 kr).

**Levererat:** 12 creatives — 6 video + 6 statiska. Se full analys i Drive-batchen
och Notion-huben.

| Ad-namn | Koncept | Format | Hypotes (kort) |
|---|---|---|---|
| `Overvakningskamera_SP_4_H1` | Social proof | Video | Nattscenario i stället för dag |
| `Overvakningskamera_SP_5_H1` | Social proof | Video | UGC-format i stället för producerad broll |
| `Overvakningskamera_SP_6_H1` | Social proof | Video | Kollektiv proof (grannar) i stället för individuell |
| `Overvakningskamera_RI_1_H1` | Risk/kostnad | Video | Ny mekanism: kostnad-av-att-inte-agera |
| `Overvakningskamera_CO_1_H1` | Jämförelse | Video | Ny mekanism: gammal vs. ny kamera, split-screen |
| `Overvakningskamera_AU_1_H1` | Auktoritet | Video | Ny mekanism: teknisk/installatörs-vinkel |
| `Overvakningskamera_PD_4_1` | Demo | Static | Dag/natt-split med AI-spårning |
| `Overvakningskamera_CO_2_1` | Jämförelse | Static | Gammal grynig kamera vs. skarp AI-kamera |
| `Overvakningskamera_SP_7_1` | Social proof | Static | Nytt citat, nattscen, undviker "tusentals"-felet |
| `Overvakningskamera_LI_1_1` | Listicle | Static | 5-punkts checklista |
| `Overvakningskamera_CS_4_1` | Offer | Static | 799/1 000 kr utan påhittad lager-urgency |
| `Overvakningskamera_RI_2_1` | Risk/kostnad | Static | Kostnadsjämförelse, samma mekanism som video |

**Viktigaste lärdomen från analysen:** hook rate är identisk (90–98 %) över alla
fyra befintliga koncept — det som skiljer vinnaren är inte första bilden utan
vad som händer efter. Nästa batch ska INTE optimera hooks, utan mitten/CTA/erbjudande.

**Faktafel flaggat, inte rättat i befintliga live-annonser:** `SP`-annonsernas
rad om "tusentals nöjda hushåll" kan inte styrkas (10 köp totalt). Ingen ny
brief i denna batch återanvänder den. Befintliga live-annonser rörs inte
(de har spenderat pengar och presterar — se CLAUDE.md-regeln om att aldrig
röra annat än det körningen själv skapat).

**Launchplan:** Batch #1 ska launchas i ett eget test-ABO med lika budget per
annons (regel 11) — INTE i kampanjens befintliga CBO, som redan är optimerad
mot `SP_2` och skulle svälta de nya idéerna innan de fick en chans.

**Leverans:**
- Drive-batchmapp: se rapport i chatten för länk/id (skapad i produktens
  befintliga mapp, ägd av Josh — INTE i BÄVER/Products-lanseringskön)
- Notion: ny hub duplicerad från "Creative hub MALL", 12 items skapade med
  Status "Draft", Typ "Video - Pending Approval" / "Image - Pending Approval"
- Loggrad `FORSTA_BATCH_KLAR` skriven i `agent/budgetlogg.jsonl`

**Öppna luckor (se `dna.md`):** Shopify-korsvalidering, Ad Library-konkurrentsök,
`target_cpa_sek` saknas i produktkartan.

---

## Batch #2 — 2026-09-03 (`/cs`, rond-flagga "mata vinnaren")

**Trigger:** `agent/rond.mjs` flaggade `brief_runda`, 3 dagar sedan batch #1,
`rundaAntal: 6`, orsak "Fokus: mata vinnaren — skalats 4 gånger på en vecka".
Huvudsessionen hade redan höjt kampanjens dagsbudget 1 950 → 2 300 kr samma dag
(rörs inte igen av den här körningen).

### Feedbackloop — utfall av batch #1:s hypoteser

Hämtat: hela kampanjen, annonsnivå, livstid (`date_preset: maximum`), fält
`amount_spent`, `actions:omni_purchase`, `cost_per_omni_purchase`,
`purchase_roas`, `ctr`, `cpm`, `frequency`, `impressions`. 22 annonser totalt,
8 868 kr kampanjspend livstid, 26 köp livstid.

| Batch #1-annons | Hypotes | Utfall (2026-09-03) |
|---|---|---|
| `SP_4_H1` (natt i stället för dag) | — | **Ej testad.** Status i Notion: "To be Reviewed", ingen fil bifogad, 3 dagar efter brief. Aldrig launchad i Meta. |
| `SP_5_H1` (UGC i stället för broll) | — | **Ej testad.** Samma som ovan. |
| `SP_6_H1` (kollektiv proof) | — | **Ej testad.** Samma som ovan. |
| `RI_1_H1` (kostnad-av-att-inte-agera) | — | **Ej testad.** Samma som ovan. |
| `CO_1_H1` (gammal vs. ny kamera, video) | — | **Ej testad.** Samma som ovan. |
| `AU_1_H1` (installatörsvinkel) | — | **Ej testad.** Samma som ovan. |
| `PD_4_1` (dag/natt-split, static) | — | **För tidigt.** 1,24 kr spend, 8 visningar. CBO gav den i praktiken ingen budget. |
| `CO_2_1` (gammal grynig vs. skarp AI, static) | — | **För tidigt.** 20,61 kr spend, 110 visningar. |
| `SP_7_1` (nytt citat, nattscen, static) | — | **För tidigt.** 1,57 kr spend, 5 visningar. |
| `LI_1_1` (5-punkts checklista, static) | — | **För tidigt.** 135,95 kr spend, 875 visningar — mest av de 6, men fortfarande under gränsen. |
| `CS_4_1` (799/1 000 kr utan urgency, static) | — | **För tidigt.** 48,60 kr spend, 304 visningar. |
| `RI_2_1` (kostnadsjämförelse, static) | — | **För tidigt.** 16,48 kr spend, 82 visningar. |

**Slutsats av feedbackloopen:** Ingen av batch #1:s 12 idéer gick att döma.
De 6 videoidéerna testades aldrig alls (produktionsstopp hos redigerarna, inte
ett datautfall). De 6 statiska idéerna launchades korrekt men fick i praktiken
ingen budget alls från den delade kampanj-CBO:n (1–136 kr spend var, mot
`SP_2`s 7 324 kr) — samma svält-mönster som CLAUDE.md:s regel 11 varnar för,
nu bekräftat på den här produkten också. Ingen kill, ingen vinnare bland de nya —
bara brus.

### Vinstbidragstabell (bedömbara annonser, ≥300 kr / ≥3 köp)

Break-even-CPA: 799 kr / 1,57 = 509 kr.

| Annons | Spend | Andel spend | Köp | CPA | ROAS | Vinstbidrag | Andel vinst |
|---|---|---|---|---|---|---|---|
| `Overvakningskamera_SP_2` | 7 324 kr | 82,6 % | 21 | 349 kr | 3,33 | **3 365 kr** | 73,9 % |
| `Overvakningskamera_CS_3` | 339 kr | 3,8 % | 3 | 113 kr | 13,57 | 1 188 kr (**preliminär, n=3, steg 2c**) | 26,1 % |

Alla övriga 20 annonser: under 300 kr spend och/eller under 3 köp → "för tidigt",
ingen dom, ingen plats i rankingen (ANALYSMETOD steg 2). Ingen datakvalitetskontroll
behövdes (`omni_purchase_values` hämtades inte, så inget att korskolla).

### Creative-teardown (ANALYSMETOD steg 6b)

`SP_2` (video, granskad via ad preview + creative-copy) och `CS_3` (video,
granskad likadant) är de enda bedömbara. `SP_2` visar en extrem närbild av
kameraenheten (ingen rörelse/kontext) följt av citat→bullets→garanti-strukturen.
`CS_3` visar i stället en skärminspelning av appens AI-detektering (röd ruta
låser på en person och en hund i en gårdsmiljö) och stänger med ett hårt
prisbudskap som tyvärr blandar in påhittad brist-urgency.

**3 mönster (min. 1 bevisad, min. 1 hypotes, krav enligt ANALYSMETOD):**

1. **BEVISAD (n=21):** Citat-hook + 4 verifierbara funktionsbullets + explicit
   garanti + mjuk CTA är den enda lönsamma strukturen i kontot. → *Instruktion:*
   varje "mata vinnaren"-iteration i batch #2 behåller denna mittendel oförändrad
   och varierar bara EN yttre variabel (hook-visual, CTA-rad, talare).
2. **PRELIMINÄR HYPOTES (n=3, måste överleva nästa avläsning):** Att öppna med
   appens AI-detektering i aktion (röda rutor på riktiga personer/djur) i stället
   för en stillbild av produkten kan vara en starkare hook-visual än produkt-
   närbilden — `CS_3`s CPA (113 kr) är bäst i kontot trots att resten av dess
   copy (påhittad urgency) borde dra ner konverteringen. → *Instruktion:* `SP_8_H1`
   testar exakt detta: `SP_2`s bevisade mittendel + `CS_3`s AI-detekterings-öppning,
   isolerat som enda variabel.
3. **BEVISAD (strukturellt, andra gången på denna produkt):** Nya creatives som
   laddas direkt in i en delad kampanj-CBO med en dominant vinnare får i praktiken
   ingen budget alls (batch #1:s 6 statiska: 1,24–135,95 kr spend, 5–875
   visningar på 3 dagar). → *Instruktion:* förvänta att batch #2:s 9 nya briefer
   får samma svält om de laddas upp på samma sätt av `/notionkorning` — läs inte
   låg spend som ett tecken på svag creative de första dagarna.
4. **UNDVIK (bekräftat igen):** `SP_2`s live-copy innehåller fortfarande
   "Tusentals nöjda hushåll..." (obekräftat) och `CS_3`s live-copy innehåller
   fortfarande påhittad brist-urgency. Ingen ny brief i batch #2 återanvänder
   någon av raderna (se `CS_5_1` för hur `CS_3`s bevis görs om utan den).

### Batch #2 — levererat: 9 briefer (4 video + 2 statisk i kärnrundan + 3 BOF)

Kärnrundan (6, "mata vinnaren"-fokus, isolerad variabel per iteration):

| Ad-namn | Koncept | Format | Variabel som isoleras | Hypotes |
|---|---|---|---|---|
| `Overvakningskamera_SP_8_H1` | Social proof (iteration) | Video | Hook-visual | AI-detekteringsskärm som öppning slår produktnärbild |
| `Overvakningskamera_SP_9_H1` | Social proof (iteration) | Video | CTA/offer-rad | Pris+garanti-CTA slår ogrundat volympåstående |
| `Overvakningskamera_SP_10_H1` | Social proof (iteration) | Video | Talare/format | On-camera-testimonial slår broll+textcitat |
| `Overvakningskamera_AU_2_H1` | Auktoritet (NYTT koncept, 1/vecka) | Video | — (nytt koncept) | Installatörens 3-punkts-checklista konverterar bättre än en ren produktdemo |
| `Overvakningskamera_CS_5_1` | Offer (iteration av CS_3) | Static | Offer-framing | Verifierbar rabatt utan påhittad urgency presterar minst lika bra som `CS_3` |
| `Overvakningskamera_CO_3_1` | Jämförelse (format av `CO_1_H1`) | Static | Format | Samma jämförelsemekanism som static kan få data medan videoversionen sitter fast hos redigerarna |

BOF-serie (utanför kärnrundan, obligatorisk enligt Axels regel 2026-09-02):

| Ad-namn | Vinkel |
|---|---|
| `Overvakningskamera_BOF_1_1` | Pris/erbjudande |
| `Overvakningskamera_BOF_2_1` | Garanti/fri frakt |
| `Overvakningskamera_BOF_3_1` | Invändning (risk-reversering: "vad händer om jag inte är nöjd?") |

**Review-bilder: 0 av 2, medvetet uteslutna.** Shopify MCP är kopplad till fel
butik (`twinpillow.se`) och kan inte nå bäverbutiken.se/Judge.me. De enda
recensionerna som finns lokalt (Drive-mappen) är redan flaggade i `dna.md` som
seedade av Josh vid produktuppsättningen, inte organisk kundröst — att bygga
review-bilder på dem hade brutit mot regeln om att aldrig hitta på recensioner.
Levererar 9 briefer i stället för 11; skillnaden är den uteslutna review-serien,
inte ett genvägsbeslut.

**Modellpolicy-avvikelse:** Agent/Task-verktyget för att spawna en `sonnet`-
subagent för copyn fanns inte tillgängligt i den här sessionen (verifierat med
ToolSearch). All copy i batch #2 är därför skriven direkt av huvudsessionen,
med `docs/copy-regler.md`s tre-frågorstest tillämpat rad för rad i varje brief
(se Notion-sidorna). Avvikelsen är öppet redovisad, inte dold.

**Namngivning:** upptagna AD-ID:n lästa av i kontot (livstid, `ads_get_ad_entities`)
innan numrering: `SP` upptaget 1–7 (+ `_1`/`_H1`-varianter), `CS` 1–4, `PD` 1–4,
`G` 1–3, `RI` 1–2, `CO` 1–2, `AU` 1, `LI` 1. Nya: `SP_8`–`SP_10`, `AU_2`, `CS_5`,
`CO_3`, `BOF_1`–`BOF_3`.

**Leverans:**
- Drive-batchmapp: `Batch #2` skapad inuti produktens befintliga mapp
  (`Övervakningskamera Trådlös`), https://drive.google.com/drive/folders/1_vWZH_TXLrvA325VxDMyRo1cnLD370BB
- Notion: 9 items skapade i den BEFINTLIGA huben ("Surveillance Camera creative
  hub", `collection://3b6270ab-908c-8366-a085-8705d1a9f4ef`), Status "Draft",
  Typ "Video - Pending Approval" / "Image - Pending Approval", hela briefen
  inklistrad i varje sida (verifierat genom att öppna `SP_8_H1` efter skapande).
- Loggrad `CS_BATCH_KLAR` skriven i `agent/budgetlogg.jsonl`.
- Inget tracking-sheet, inget zip (matchar dagens övriga tre batchers leveransform
  i denna körningstyp — automatiserad bakgrundskörning utan chatt-filleverans).

**Öppna luckor (se `dna.md`):** Shopify fortfarande fel butik kopplad,
Ad Library-konkurrentsök inte gjort, `target_cpa_sek` saknas, batch #1:s 6
videobriefer olevererade hos redigerarna.
