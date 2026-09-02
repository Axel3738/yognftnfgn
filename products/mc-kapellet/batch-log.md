# Batch-logg — MC-Kapellet

## Batch #0 — originaladsen (launch 2026-08-27, före OS:et)
16 annonser i kampanjen (`PD`, `SP`, `CS`, `G`-serier), en gemensam CBO-kampanj
(1 000 kr/dag). Utfall t.o.m. 2026-09-02 (livstid, `maximum`): 5 020,09 kr
spend, 24 köp, ROAS 2,01 mot break-even 1,49 — kampanjen har klarat testet
och stod 2026-09-02 på 26,8 % vinst av omsättningen de senaste 3 dygnen
(ROAS 2,48, `agent/budgetlogg.jsonl` UPPSKJUTEN_GRANS-rad samma dag).

Tre annonser har passerat signifikansgrinden (≥300 kr + ≥3 köp):
`MC-Kapell_PD_1` (2 434,39 kr, 12 köp, CPA 202,87 kr, vinstbidrag ≈950 kr),
`MC-Kapell_PD_3` (872,12 kr, 6 köp, CPA 145,35 kr, vinstbidrag ≈820 kr),
`MC-Kapell_CS_2_1` (403,55 kr, 4 köp, CPA 100,89 kr, vinstbidrag ≈725 kr).
Se `dna.md` för full FAS 0–10-analys.

## Batch #1 — 2026-09-02 (`/forsta-batch`, automatisk körning via `/rond-auto`)

**Trigger:** `agent/rond.mjs` flaggade produkten som `forsta_batch`-behov —
kampanjen hade passerat 1 500 kr spend och låg på minst 20 % vinst
(26,8 % vid mätning 2026-09-02) utan att ha fått en riktig creative-batch
sedan launch.

**Levererat:** 17 creatives — 6 video + 6 statiska + 3 BOF-statiska +
2 review-statiska (Axels utökade batchkrav 2026-09-02).

| Ad-namn | Koncept | Format | Hypotes (kort) | Källa |
|---|---|---|---|---|
| `MC-Kapell_PD_4_H1` | Demo | Video | Rain-proof payoff tillagd på vinnande PD_1-format, produkten kvar i bild | vinnare PD_1 (nära iteration) |
| `MC-Kapell_PD_5_H1` | Demo | Video | Ny POV-vinkel på PD_3:s sätta-på-mekanism | vinnare PD_3 (hook-iteration) |
| `MC-Kapell_CO_1_H1` | Jämförelse | Video | Ny mekanism: skyddad vs. oskyddad efter en säsong | LP:s egen text ("matt lack, rost på kromet") |
| `MC-Kapell_RI_1_H1` | Risk/kostnad | Video | Ny mekanism: kostnad-av-att-strunta-i-det, inga påhittade siffror | LP:s egen text |
| `MC-Kapell_DE_1_H1` | Funktionsdemo | Video | Samma regn-bevis som förloraren PD_2, men med motorcykeln kvar i bild — isolerar kontext-variabeln | dna.md-hypotes (PD_2-teardown) |
| `MC-Kapell_ID_1_H1` | Identitet | Video | Ny mekanism: pendlare utan garageplats | ny vinkel, gissning märkt |
| `MC-Kapell_LI_1_1` | Listicle | Static | 5-punkts checklista rakt ur LP:s funktionslista | LP:s funktionslista |
| `MC-Kapell_CO_2_1` | Jämförelse | Static | Format-transfer av CO_1_H1 | samma källa som CO_1_H1 |
| `MC-Kapell_SP_4_1` | Social proof | Static | Nytt citat (Linda Berg), skiljer sig från review-serien | Judge.me, verifierad 2026-09-02 |
| `MC-Kapell_PD_6_1` | Mått/demo | Static | Storleksdiagram 218×118,5 cm, adresserar "passar den?"-tvekan | LP:s måttbild |
| `MC-Kapell_DE_2_1` | Funktionsdemo | Static | Kollage av tre verifierade funktioner | LP:s funktionslista |
| `MC-Kapell_RI_2_1` | Risk/kostnad | Static | Format-transfer av RI_1_H1, fact-first | LP:s egen text |
| `MC-Kapell_OF_1_1` | BOF pris/erbjudande | Static | Äkta 40 %-rabatt, ersätter CS_2_1:s overifierbara brådska | Shopify-pris, verifierad 2026-09-02 |
| `MC-Kapell_GA_1_1` | BOF garanti/frakt | Static | 30 dagars öppet köp + fri frakt | LP:s garantitext |
| `MC-Kapell_OB_1_1` | BOF invändning | Static | "Passar den min MC?" löst med mått + garanti | LP:s mått + garanti |
| `MC-Kapell_RE_1_1` | Review | Static | Riktigt citat (Johan Nilsson) | Judge.me, verifierad 2026-09-02 |
| `MC-Kapell_RE_2_1` | Review | Static | Riktigt citat (Andreas Holm) | Judge.me, verifierad 2026-09-02 |

**Ingen ny brief återanvänder CS_2_1:s overifierbara "snart slutsåld/idag
endast"-rad** eller Drive-mappens opublicerade "Tusentals motorcykelägare"-rad
(se dna.md, punkt 5 och "Undvik"). BOF-priset (`OF_1_1`) bär i stället den
verifierbara 349/582 kr-rabatten.

**Launchplan:** Batch #1 launchas i ett eget test-ABO med lika budget per
annons (regel 11 i CLAUDE.md) — INTE i kampanjens befintliga CBO, som redan
koncentrerat 48 % av spenden till `PD_1` och skulle svälta de nya idéerna.

**Modellpolicy-avvikelse:** inget Agent/Task-verktyg med `model`-parameter var
tillgängligt i denna körning (verifierat via verktygssökning) för att spawna
en separat sonnet/haiku-subagent. All copy i denna batch är därför skriven av
huvudsessionen själv, i linje med samma dokumenterade avvikelse för
Kranskydd Frost 420D, Surveillance Camera, Fish rod holder NO och
IBC-Tanköverdraget. Tre-frågorstestet (`docs/copy-regler.md`) är kört rad för
rad i varje brief, direkt i Notion-itemet.

**Leverans:**
- Drive-batchmapp: `Motorcycle cover/Batch #1/` i Joshs befintliga
  produktmapp (id `1hwYK5Qa-Dh4iltlfr4FLyndvlCEHmqI7`), ny undermapp
  `Batch #1` (id `1eLTdYa_SQV6yXVXy_MWb8pcgE3vhXdo1`)
- Notion: ny hub "Motorcycle Cover creative hub" duplicerad från
  "Creative hub MALL", 17 items skapade med Status "Draft", Typ
  "Video - Pending Approval" / "Image - Pending Approval". Hela briefen
  (hook, tre-frågorstest, shot list, regler) ligger i varje item, inte bara
  en länk.
- Loggrad `FORSTA_BATCH_KLAR` skriven i `agent/budgetlogg.jsonl`

**Öppna luckor (se `dna.md`):** ingen extern konkurrentsignal hittad i Meta
Ad Library (bara egna ads), video-primärtext för de fyra äldsta creativen
gick inte att hämta (utanför `ads_get_creatives`-listningen), ingen
`target_cpa_sek` satt.
