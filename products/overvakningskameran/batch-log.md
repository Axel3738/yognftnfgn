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
