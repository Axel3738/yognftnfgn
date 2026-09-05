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

## Feedbackloop 2026-09-05 (`/cs`-runda, nattlig 3-dagarsrunda steg 4b)

Kampanjen kontrollerad ACTIVE före och efter (dagsbudget oförändrad 1 200 kr —
en föreslagen skalning till 1 400 kr sköts upp samma dag av huvudsessionen,
1,8 procentenheter från en zongräns; denna körning rör varken budget eller
status). Hela kampanjen hämtad på nytt, sorterad på spend, `date_preset:
maximum`, verifierade fältnamn (`amount_spent`, `actions:omni_purchase`,
`cost_per_omni_purchase`, `purchase_roas`).

**Batch #2:s 18 briefer (2026-09-02) har INTE launchats i Meta ännu** — noll av
dem syns i kontot 3 dagar senare. I Notion-hubben står alla 9 videobriefer i
`Creative strat review` och alla 9 bildbriefer fortfarande i `Draft`. Det finns
alltså ingen ny performance-data att utvärdera dem mot — feedbackloopen denna
runda bygger uteslutande på Batch #1 (originalannonserna), som fortsatt
samlar data.

**Datakvalitet:** `amount_spent × purchase_roas` använd genomgående (matchar
`omni_purchase_values` inom rimlig marginal på PD_1/SP_2/PD_2_1; inget nytt
100×-fel hittat denna gång).

**Signifikansgrind — vad som är nytt sen 2026-09-02:**

| Annons | Spend | Köp | ROAS | Status |
|---|---|---|---|---|
| Damasker_PD_1 (benchmark) | 5 478,87 kr | 34 | 3,32 | Bedömbar — fortsatt bevisad vinnare |
| **Damasker_SP_2** | **847,74 kr** | **4** | **1,84** | **Ny: passerar grinden för första gången** (var 1 köp/438 kr 2026-09-02) |
| Damasker_SP_3 | 395,84 kr | 1 | 0,98 | Fortfarande för tidigt (<3 köp) |
| Damasker_PD_2 | 369,25 kr | 0 | – | Fortfarande för tidigt (0 köp) — samma copy som PD_1, notera för framtida avläsning |
| Damasker_PD_2_1 | 175,11 kr | 1 | 2,22 | För tidigt |
| Övriga (CS/G-serien) | <200 kr styck | 0 | – | CBO-svält, oförändrat |

Vinstbidrag (ROAS-baserat, BE-ROAS 1,60): PD_1 ≈ (3,32/1,60 − 1) × 5 478,87 ≈
**+5 887 kr**, ensam >100 % av kampanjens totala vinstbidrag (kampanj totalt
7 570 kr spend, 40 köp, ROAS 2,71 → totalt vinstbidrag ≈ +5 245 kr — PD_1 bär
hela vinsten, resten av kontot är fortsatt en nettoförlust som PD_1 täcker).
SP_2 tillför ett litet men positivt bidrag: (1,84/1,60 − 1) × 847,74 ≈ **+127
kr** — litet men positivt, första gången SP-vinkeln visar en bedömbar vinst.

**Tre viktigaste lärdomarna:**
1. **PD (demo/problem) är inte längre en preliminär dom — den är bevisad över
   34 köp** och bär mer än hela kampanjens vinst (>100 %, resten netto-förlust).
2. **SP (social proof) passerade signifikansgrinden för första gången och är
   lönsam** (ROAS 1,84 > BE 1,60, 4 köp) — det uppdaterar dna.md:s tidigare
   hypotes om att SP:s vaga påstående ("Älskade av tusentals vandrare") gjorde
   vinkeln svag. Den är svagare än PD, men inte en förlorare. `Damasker_SP_4_H1`
   denna runda isolerar just SPECIFICITET inom SP-vinkeln (konkret scen i
   stället för det vaga påståendet) för att testa om det är det som drev
   förbättringen, eller om SP bara behövde mer data.
3. **Produktionsflödet är flaskhalsen, inte briefkvoten.** 18 briefer väntar
   fortfarande på redigering 3 dagar efter leverans — nästa `/cs`-körning kan
   inte göra en feedbackloop på Batch #2 förrän de faktiskt launchas. Flaggas
   till Axel/managern, ändras inte här.

**Modellpolicy-avvikelse (samma som Batch #2):** inget Agent/Task-verktyg för
att spawna en sonnet/haiku-subagent var tillgängligt i denna körning
(kontrollerat via ToolSearch). All copy i denna batch är skriven av
huvudsessionen själv. Tre-frågorstestet kört rad för rad i varje brief i
Notion (se hubben).

**Recension-koll omkörd 2026-09-05** (WebFetch av produktsidan): fortfarande
"No reviews". Ingen recensionsbild byggd denna runda heller — samma slutsats
som 2026-09-02.

## Batch #3 — 2026-09-05 (`/cs`, feedbackloop-baserad)
4 briefer i rundan (3 video + 1 bild) + 3 BOF-bilder. 0 review-bilder (ingen
recension finns, se ovan). `rundaAntal`/veckokvot given av ronden (produkten
saknar egen rad i `products/products.json`/`pipeline/quota.mjs`, styrs via
`agent/produktkarta.json`, samma mönster som Batch #2).

| Annons | Format | Hypotes | Källa |
|---|---|---|---|
| Damasker_PD_8_H1 | video | Att VISA den bevisade "10 sekunder"-fakta med en synlig klocka (i stället för bara text) ökar konverteringen ytterligare — isolerar PROOF-mekanismen, inte vinkeln | vinnare PD_1, nära iteration |
| Damasker_SP_4_H1 | video | SP_2:s nya lönsamhet (se feedbackloop ovan) beror på specificitet, inte på SP-vinkeln i sig — testar ett konkret, falsifierbart scenario i stället för det vaga påståendet | SP_2:s nya data, isolerar SPECIFICITET |
| Damasker_FO_1_H1 | video | En äkta säsongsvinkel (snön är på väg, verifierbart faktum) konverterar via verklig timing i stället för PD:s platta problem/lösning-ram | ny vinkel, obevisad för denna produkt, ingen påhittad brådska |
| Damasker_ID_1_1 | bild | En identitetsvinkel ("vandrare i alla väder") i lifestyle-format — otestat både som vinkel och som statiskt format för denna produkt | ny vinkel + nytt format, obevisat |
| Damasker_BOF_4_1 | bild (BOF) | Snabb faktaåterkoppling (PD:s fyra punkter + pris) stänger ljummen trafik som sett videon men inte köpt | formatöverföring av PD:s bevisade fakta till BOF |
| Damasker_BOF_5_1 | bild (BOF) | Färgsortimentet (18 färger) som osynliggjord invändning — ny objection, ej täckt av batch #2:s BOF-set (pris/garanti/passform) | ny objection, verifierad fakta (18 färger, Shopify 2026-09-02) |
| Damasker_BOF_6_1 | bild (BOF) | Frakt/betalningsfriktion (fri frakt, Klarna, öppet köp) som egen stängningsvinkel, skild från garanti-BOF:en i batch #2 | ny objection/friktionspunkt |

**Naming:** koder `PD`/`SP` fortsätter kontots löpnummer (PD_8, SP_4 —
kontrollerat mot både Meta och Notion-hubben, ingen kollision). `FO` (fomo/
säsong) och `ID` (identity) är nya koncept-koder, ej tidigare använda för
denna produkt. `BOF_4/5/6` fortsätter batch #2:s BOF-numrering.

**Levererat 2026-09-05:**
- Notion: 7 nya items i "Damasker vandring"-hubben (samma hub som Batch #2,
  ingen ny hub skapad), Typ "Video - Pending Approval" (3) / "Image - Pending
  Approval" (4), Status Draft, hela briefen i sidan (verifierat med
  `notion-fetch` på `Damasker_PD_8_H1`).
  ⚠️ Hubben (`Damasker vandring`, id `3cf270ab-908c-81a0-9b0d-c486f6467ce7`)
  har **tomt `<ancestor-path>` vid direkt fetch** — den ligger inte synligt
  under teamspacets sidträd. Flaggas till Axel: samma hub Batch #2 använde,
  men den bör kontrolleras/flyttas in i teamspacet så den syns i en vanlig
  sökning.
- Drive: `Batch #3` skapad i produktens befintliga mapp
  (https://drive.google.com/drive/folders/1ldHCYqIV5v-XjcAbnXz4gDi4jhgUUECF),
  7 undermappar (en per annons) + README med globala regler.

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
