# Batch-logg — Damasker Vandring

## Batch #1 — originaladsen (launch 2026-08-29, före OS:et)
16 annonser i kampanjen (PD/SP/CS/G-serier, en enda annonsgrupp). Utfall
t.o.m. 2026-09-02 (livstid): 3 440 kr spend, 16 köp, ROAS 2,71 mot break-even
1,60 — kampanjen har klarat testet väl (21,7 % vinst av omsättningen).
Bara EN annons (PD_1) har passerat signifikansgrinden (≥300 kr + ≥3 köp);
den bär hela kampanjens vinstbidrag (≈+3 187 kr av totalt ≈+2 396 kr). Se
`dna.md` för full analys.

## Batch #2 — 2026-09-02 (`/forsta-batch`, körning nr 1)
18 briefer: 9 video (3 variationer på vinnaren PD_1 + 6 nya koncept) + 9 bild
(6 nya koncept + 3 BOF). 0 review-bilder (ingen verifierad recension finns,
se dna.md — två Drive-källor hittades men underkändes som opålitliga).
Flaggad av `agent/rond.mjs` (`forsta_batch`-behov) 2026-09-02. Produkten
styrs via `agent/produktkarta.json`/ronden, inte `products/products.json` —
`node pipeline/quota.mjs` känner inte till den (samma mönster som Kranskydd/
IBC/Övervakningskameran); denna batch (18) är medvetet över ett tänkt
kvotgolv, enligt Axels uttryckliga beslut 2026-09-02 om större batcher
("bilder är billiga, gör extra", "fler videor — redigerarna är många").

| Annons | Format | Hypotes | Källa |
|---|---|---|---|
| Damasker_PD_4_H1 | video | Ett mer visceralt, specifikt hook (grus/km 3) håller PD-vinkelns CPA under 243 kr | vinnare PD_1 (nära iteration — endast hook byts) |
| Damasker_PD_5_H1 | video | Att VISA vattenavstötningen (demo) i stället för att lista fakta som text ökar konverteringen ytterligare | vinnare PD_1 (formatöverföring — samma fakta, visuellt bevis i stället för text) |
| Damasker_PD_6_H1 | video | Ett bokstavligt före/efter (blöta vs torra strumpor) slår PD_1:s platta faktalista | vinnare PD_1 (ny persuasion-vinkel — konflikt, copy-regler) |
| Damasker_UG_1_H1 | video | Ett UGC-format (talking-head) konverterar annorlunda än voiceover+bullets på samma fakta | isolerar FORMAT (aldrig testat för denna produkt) |
| Damasker_AU_1_H1 | video | Auktoritetsvinkeln (bevisad starkast i playbook.md för Grillkliniken) överförs till Damasker | lånad mekanism, obevisad för denna produkt |
| Damasker_CI_1_H1 | video | Cost-of-inaction (avbruten tur) konverterar via förlustaversion i stället för faktalista | ny mekanism, ingen påhittad kr-siffra |
| Damasker_CO_1_H1 | video | Jämförelse mot dyra vandringskängor (känd referens) positionerar priset som billigt | copy-regler ("jämför med det kunden redan känner") |
| Damasker_CS_4_H1 | video | Att VISA prismatematiken (649→389) i stället för att bara påstå "40%" ökar trovärdigheten | CS_1 är äkta (verifierad mot Shopify) men för lite spend — visuell iteration |
| Damasker_MB_1_H1 | video | Myth-busting-hook (varför du blir blöt trots dyra kängor) driver nyfikenhet in i PD:s bevisade fakta | ny mekanism, obevisad |
| Damasker_PD_7_1 | bild | Demo-flatlay av fästmekanismen (aldrig testat som statisk) | vinnare PD_1, formatöverföring till bild |
| Damasker_CO_2_1 | bild | Split-bild (utan/med) av samma konflikt som PD_6_H1, statiskt format | formatöverföring av CO_1_H1 |
| Damasker_HL_1_1 | bild | Ett tydligt märkt produktlöfte ersätter en testimonial ingen riktig recension finns till | dna.md:s datakvalitet (ingen verifierad recension) |
| Damasker_LI_1_1 | bild | 5-punkts checklista paketerar PD:s fakta + färgutbudet i ett skannbart format | obevisat format för denna produkt |
| Damasker_CS_5_1 | bild | Statisk prisdrop-kort (649→389) testar offer-formatet utan video | formatöverföring av CS_4_H1 |
| Damasker_CI_2_1 | bild | Ikonrad (snö/regn/grus) paketerar cost-of-inaction statiskt | formatöverföring av CI_1_H1 |
| Damasker_BOF_1_1 | bild (BOF) | Prisfokuserat retargeting-kort stänger på pris+frakt+garanti | Axels beslut 2026-09-02: +3 BOF-bilder |
| Damasker_BOF_2_1 | bild (BOF) | Garantifokuserat retargeting-kort stänger på riskreducering | Axels beslut 2026-09-02: +3 BOF-bilder |
| Damasker_BOF_3_1 | bild (BOF) | Invändningshantering ("passar den mina kängor?") stänger den vanligaste tveksamheten | Axels beslut 2026-09-02: +3 BOF-bilder |

**G (gåva) och rena upprepningar av SP:s obestyrkta "tusentals vandrare"-
påstående får INGA nya annonser i denna batch** — G är för obevisat (för
lite spend, inte ett angle-fel) för att prioriteras före PD-iterationer och
nya mekanismer; SP:s svaghet hanteras genom att ersätta det obestyrkta
löftet med verifierbara fakta/produktlöfte (`Damasker_HL_1_1`) i stället för
att skriva om SP rakt av.

Launch-regel: **separat test-ABO, lika budget per annons** (CLAUDE.md regel
11) — aldrig i samma annonsgrupp som originalannonserna.

**Modellpolicy-avvikelse:** inget Agent/Task-verktyg för att spawna en
sonnet/haiku-subagent fanns tillgängligt i den här körningen (verifierat via
ToolSearch — samma avvikelse som dokumenterats för Kranskydd Frost 420D och
Övervakningskameran). All copy i denna batch är därför skriven av
huvudsessionen själv, inte av en subagent — avvikelse från CLAUDE.md regel 6,
dokumenterad explicit här. Tre-frågorstestet är kört rad för rad i varje
brief i Notion (se hubben) enligt `docs/copy-regler.md`.

**Levererat 2026-09-02:**
- Notion: 18 items i "Hiking Gaiters creative hub"
  (https://app.notion.com/p/3cf270ab908c81a09b0dc486f6467ce7), Typ
  "Video - Pending Approval" (9) / "Image - Pending Approval" (9), Status
  Draft, hela briefen i sidan (verifierat med `notion-fetch` på ett item).
- Drive: `Batch #2` i produktens befintliga mapp
  (https://drive.google.com/drive/folders/1N8qyU2lN0OPQYbj2Uj6LPL3Z6ziqVTS1),
  18 undermappar (en per annons) + README med globala regler.
- `agent/produktkarta.json`: Damasker Vandring-posten kompletterad med
  `notion_hub_id`, `drive_produktmapp_id`, `drive_senaste_batchmapp_id`,
  `minne`.
- `agent/budgetlogg.jsonl`: rad `FORSTA_BATCH_KLAR` loggad.
