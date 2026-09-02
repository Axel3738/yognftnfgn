# Creative DNA — IBC-Tanköverdraget

Skapad 2026-09-01 av `/forsta-batch` (körning nr 1, automatisk rutinkörning via
`agent/rond.mjs`-behovet `forsta_batch`). Datakälla: MagiBorsten `1867947880635861`,
kampanj `120250001079150291` ("IBC-Tanköverdraget | BE ROAS 1.51 | Launch
2026-08-28"), livstid 2026-08-28 → 2026-09-01 (hämtat `date_preset: maximum`).

> **RÄTTELSE 2026-09-01 (samma dag, efter Axels invändning).** Den första
> versionen av den här filen innehöll tre falska larm — fel produktsida, fel
> pris och "0 recensioner". Alla tre var fel. Orsak: Shopify-tokenen var
> utgången, så körningen sökte i butiken i stället och tog fel träff.
> Bäverbutiken har **tre** IBC-produkter, och körningen läste kranadaptern
> (419/524 kr) som om den vore kampanjens landningssida. Det var den inte.
> Rättat mot butiken direkt (`baverbutiken.se/search?q=IBC` + produktsidan)
> 2026-09-01. **Lärdom, gäller alla produkter: en produktsida får aldrig
> identifieras genom att söka i butiken och ta första träffen. Utan
> Shopify-åtkomst är produktidentiteten OVERIFIERAD — skriv det, larma inte.**

## Produktfakta (verifierade mot produktsidan 2026-09-01)

- **IBC-tanköverdrag 1000 L – Stoppar Alger & UV**
  (`ibc-tankoverdrag-1000-l-stoppar-alger-uv`), baverbutiken.se.
  Sidan matchar annonserna: överdrag som blockerar ljus och UV, 210D
  Oxford-tyg, blixtlås, öppning upptill för locket, mått 120 × 100 × 116 cm.
- **Pris: 489 kr rea, 636 kr ordinarie (23 % rabatt).** Detta är BEKRÄFTAT
  mot produktsidan — och det är exakt vad CS-annonserna redan säger. Det
  finns inget prisglapp.
- **10 recensioner ligger live**, alla positiva. Social proof är alltså
  tillåten — men "hundratals trädgårdsägare" (SP_1_H1/H2/H3, SP_2_1) är
  fortfarande en överdrift av 10 recensioner och bör skrivas om till något
  som faktiskt går att belägga. Det är en copy-fråga, inte ett larm.
- Break-even-ROAS **1,51×** (ur kampanjnamnet).
  Break-even-CPA = 489 / 1,51 = **323,84 kr**.
- ⚠️ Två andra IBC-produkter finns i butiken och ska INTE förväxlas med den
  här: `ibc-tank-kranadapter-kit-...` (419/524 kr) och
  `ibc-tank-4-vags-fordelaradapter-...` (379/474 kr). Det var den första av
  dem som orsakade rättelsen ovan.

## Datakvalitet

`amount_spent × purchase_roas` användes genomgående (aldrig `omni_purchase_values`,
per CLAUDE.md-varningen). Kampanjsumman (4 188,02 kr, 22 köp) är hämtad direkt på
kampanjnivå — inte summerad manuellt ur adsen (16 annonser, vissa <1 kr spend).
Shopify-admin (lager, order, varianter) kunde INTE nås — token utgången både i
batchkörningen och i rättelsen. Pris, recensioner och produktidentitet är
verifierade mot den publika produktsidan, vilket räcker för copy men inte för
lager- eller ordersiffror.

## Siffrorna (bedömbara annonser, ≥300 kr + ≥3 köp; BE-ROAS 1,51, BE-CPA 323,84 kr)

| Annons | Format | Vinkel | Spend | Andel spend | Köp | CPA | ROAS | **Vinstbidrag*** |
|---|---|---|---|---|---|---|---|---|
| **IBC_PD_1_H1** (benchmark/top spender) | video | produktdemo, inget pris | 3 455,17 kr | 76,3 % | **20** | 172,76 kr | **3,88** | **+3 021 kr** |

*Vinstbidrag = (break-even-CPA − CPA) × köp = (323,84 − 172,76) × 20 = 3 021,60 kr.
Detta är i praktiken hela kampanjens vinst — PD_1_H1 bär allt.
(Första versionen räknade med fel pris, 419 kr, och underskattade därför
vinstbidraget till 2 354 kr.)

**För tidigt (ingen dom, redovisas för mönstret):**

| Annons | Format | Vinkel | Spend | Köp | ROAS | Kommentar |
|---|---|---|---|---|---|---|
| IBC_PD_Extra | video | produktdemo | 57,44 kr | 1 | 8,99 | Bästa hold rate i hela settet (50/27/20 %) men brus på 1 köp |
| IBC_CS_1_H2 | video | rea, korrekt pris | 51,84 kr | 1 | 9,46 | För lite spend för en dom |
| IBC_CS_1_H3 | video | rea, korrekt pris | 275,99 kr | 0 | – | Nära 300 kr-gränsen, 0 köp, svagast hold (14/7/4 %) — lutar mot förlorare |
| IBC_PD_2_1 | statisk | produktdemo | 253,20 kr | 0 | – | Samma copy som vinnaren, aldrig fått nog spend |
| IBC_SP_1_H1/H2/H3, SP_2_1 | video+statisk | social proof | 140,54 kr totalt | 0 | – | Svält — aldrig faktiskt testat |
| IBC_GT_1_H1/H2/H3, GT_2_1 | video+statisk | gåva/present | 34,68 kr totalt | 0 | – | Ren svält, 0,8 % av spenden — aldrig faktiskt testat |

## Winning DNA

1. **Produktdemo utan pris, utan urgency, med EN konkret faktabaserad detalj**
   (210D Oxford-tyg) är den bevisade vinnaren. 20 köp, CPA 172,76 kr, tar 76 %
   av spenden, billigast CPM i hela settet (123,83 kr).
2. **Struktur:** smärtfråga → mekanism kopplad till en verifierbar spec →
   tre ✅-punkter → en enda CTA.
3. **Konkret > vagt.** "210D Oxford-tyg" och "blixtlås på 2 minuter" är fakta
   man kan peka på (copy-regler.md, tre-frågorstestet) — det är sannolikt
   därför CTR (4,05 %) ligger klart över resten av kontot trots låg
   fullvisningsgrad (bara 21,7 % ser 25 % av videon). Hypotes: hooken/texten
   säljer, inte fullvisningen — oprövat men grunden för denna batchs
   near-iteration (se batch-log).

## Losing/rotorsaker (hypotes, delvis konfunderat av budgetsvält)

- **CS (rea/urgency)** — priset i copyn är korrekt (489/636 kr, verifierat).
  CS fick näst mest spend av de svaga vinklarna (327,83 kr) och gav 1 köp.
  Lutar mot svagare än PD, men har inte fått nog spend för en ren dom.
- **SP (social proof)** — svält (140,54 kr). Konceptet är fullt användbart:
  10 riktiga recensioner finns live. Det som ska bytas är påståendets storlek
  ("hundratals" → något som matchar 10 recensioner), inte vinkeln.
- **GT (gåva)** — INTE en förlorare, bara aldrig testad (34,68 kr totalt).
  Denna batch ger den en riktig chans (se IBC_GT_3_H1).

## Behåll alltid / Testa kontrollerat / Undvik / Obevisat

- **Behåll:** PD-vinkelns struktur (fråga → mekanism → 3×✅ → CTA) · 210D
  Oxford-tyg som återkommande, konkret bevisfaktum.
- **Testa kontrollerat:** fact-first hook i stället för pain-first hook
  (IBC_PD_3_H1) · samma vinnande manus som statisk bild (IBC_PD_3_1) ·
  gåva-vinkeln med riktig budget för första gången (IBC_GT_3_H1) · en helt ny
  before/after-jämförelsevisual (IBC_CO_1_1) · SP med en belagd
  recensionsformulering i stället för "hundratals".
- **Undvik:** aggregerade kundsiffror som inte matchar de 10 recensioner som
  faktiskt finns · att döma CS/SP mot PD på nuvarande data (ojämn budget).
- **Obevisat:** allt utom PD_1_H1 — bara en (1) annons har passerat
  signifikansgränsen i denna körning.

## Luckor (fyll före nästa körning)

- Shopify-adminåtkomst (lager, order, varianter): token utgången. Pris och
  recensioner är verifierade mot den publika produktsidan; lager- och
  ordersiffror är det inte.
- Videoinnehåll: analysen bygger på Marketing API:ns copy/caption-fält, inte
  en bildruta-för-bildruta-granskning — video kunde inte öppnas i denna
  session.
- Konkurrenter: bara 1 träff i Meta Ad Library på "IBC tank cover" (Sverige),
  ingen läsbar brödtext — inget användbart swipe-material hittades.
- Recensionerna (10 st) är inte lästa rad för rad — nästa körning bör hämta
  dem och plocka en formulering som går att belägga.
