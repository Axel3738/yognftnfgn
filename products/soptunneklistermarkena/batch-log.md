# Batch-logg — Soptunneklistermärkena

## Batch #1 — originalannonserna (launch 2026-08-21, före OS:et)
29 annonser i en enda kampanj/annonsgrupp: originalvideor (PD_1–3, SP_1–3,
CS_1–3, G_1–3 + `_Bild`-varianter av var och en) plus en senare våg av 13
numrerade bildannonser (`PD_Bild_01`–`PD_Bild_13`) från bild-pipelinen.
Livstidsutfall (avläst 2026-09-03, `maximum`): 8 942,70 kr spend, 72 köp,
blandad ROAS ≈2,17 — men **73,5 % av all spend och 62 av 72 köp ligger på en
enda annons** (`PD_Bild_03_sophamtningsdag`). Se `dna.md` för full analys.
Kampanjen frystes 2026-08-31 (`agent/produktkarta.json`: kortet var spärrat,
Axel hade själv pausat storspendarna) — omprövad efter det datumet på färska
dygn, och står nu i "Låt vara"-läge (lönsam, huvudsessionen rör inte budgeten
i denna körning).

## Batch #2 — 2026-09-03 (`/rond-auto` steg 4b, `brief_runda`, retroaktiv
upphämtning enligt `cs.md` 1b — produkten saknade minnesfiler men har redan
haft riktig spend, loggas därför `CS_BATCH_KLAR` inte `FORSTA_BATCH_KLAR`)

9 briefer: 3 video + 1 statisk (rundan, `rundaAntal: 4`, minst 2/3 video ✓
3/4 = 75 %) + 3 BOF-bilder + 2 review-bilder (riktiga Judge.me-citat,
ordagrant).

| Annons | Format | Hypotes | Källa |
|---|---|---|---|
| Soptunneklistermarken_PD_4_H1 | video | Samma "family shot"-idé (flera tunnor, olika uttryck, riktig trädgård, ingen text) i rörelse repeterar eller förstärker den statiska vinnarens resultat | vinnare PD_Bild_03 (formatöverföring bild→video) |
| Soptunneklistermarken_PD_5_H1 | video | Ett extremt närbildsdemo på appliceringen (inga bubblor, helt rakt) minskar en outtalad invändning ("är det krångligt/fult att sätta dit?") | PD_Bild_05_applicering-hand (näst mest spend i svansen, formatöverföring till video) |
| Soptunneklistermarken_WI_1_H1 | video | Ett riktigt filmat väder-/vattentest adresserar en outtalad hållbarhetsoro ("håller den i regn?") och sänker köptvekan | ny mekanism, obevisad — inget påstående som inte visas på film |
| Soptunneklistermarken_PD_6_1 | bild | Samma nolltext-familjeskott-recept i en annan, lika verklig miljö (radhus/gård i stället för villa+staket) isolerar SCEN-variabeln från den bevisade mekaniken | vinnare PD_Bild_03 (nära iteration — byt bara miljö, behåll allt annat) |
| Soptunneklistermarken_BOF_1_1 | bild (BOF) | Ärligt pris/erbjudande (199 kr, fri frakt över 300 kr) stänger på fakta, aldrig på ett fabricerat "50%" | dna.md: CS_Bild:s fabricerade rabatt är kontots sämsta bedömbara annons — motsatt instruktion |
| Soptunneklistermarken_BOF_2_1 | bild (BOF) | 30 dagars öppet köp som riskreducering ökar konverteringen hos den som redan sett produkten | Axels beslut 2026-09-02: +3 BOF-bilder per batch |
| Soptunneklistermarken_BOF_3_1 | bild (BOF) | Att visa att märkena funkar på fler ytor (tunna/kylskåp/dörr) + materialfakta (PVC, avtorkningsbar) hanterar den vanligaste tveksamheten | verifierad produktbeskrivning (Shopify-sidan) |
| Soptunneklistermarken_RW_1_1 | bild (review) | Ett riktigt, namngivet kundcitat ("superenkla att sätta på") är starkare bevis än en fabricerad testimonial | Judge.me REST-API, verifierat 2026-09-03 (Anna Karlsson, 5★) |
| Soptunneklistermarken_RW_2_1 | bild (review) | Ett konkret tidscitat ("tog bara någon minut") adresserar samma appliceringsoro som PD_5_H1, fast med tredjepartsbevis | Judge.me REST-API, verifierat 2026-09-03 (Lars Pettersson, 5★) |

**Ingen ny CS/rabatt-annons i denna batch** — dna.md:s teardown visar att
kontots enda fabricerade rabattannons (`CS_Bild`) är den sämsta bedömbara
annonsen och ett offer-integritetsbrott. Nästa gång Axel faktiskt sätter ett
jämförpris i Shopify kan en äkta rabattannons byggas — inte förrän dess.

**Datakälla för produktfakta:** `mcp__Shopify__*` i den här sessionen är
kopplad till fel butik (TwinPillow, verifierat med `get-shop-info`) — pris
och USP:er hämtade via `WebFetch` av den publika produktsidan i stället.
Recensionerna verifierade via Judge.me REST-API direkt (miljövariablerna
`JUDGEME_API_TOKEN`/`JUDGEME_SHOP_DOMAIN`), filtrerat klientsidan på
`product_handle` eftersom tjänstens eget filter ignorerades — 8 äkta
recensioner hittade, 2 använda ordagrant.

**Modellpolicy-avvikelse:** inget Agent/Task-verktyg för att spawna en
sonnet/haiku-subagent var tillgängligt i den här körningen (verifierat via
`ToolSearch` — samma avvikelse som redan dokumenterad för Kranskydd Frost
420D, Övervakningskameran och Damasker Vandring samma vecka). All copy i
denna batch är därför skriven av huvudsessionen själv. Tre-frågorstestet
(`docs/copy-regler.md`) är kört rad för rad i varje brief i Notion.

Launch-regel: **separat test-ABO, lika budget per annons** (CLAUDE.md regel
11) när/om Axel launchar dessa — den här körningen levererar bara briefer,
launchar inget.

**Levererat 2026-09-03:**
- Notion: ny hub **"Smiley face trash can stickers creative hub"** (produkten
  saknade helt en creative hub — bekräftat via `agent/notion-uppgifter.json`
  och en bred `notion-search`), duplicerad från "Creative hub MALL", 9 items,
  Typ "Video - Pending Approval" (3) / "Image - Pending Approval" (6), Status
  Draft. Se länk och verifiering i leveransrapporten.
- Drive: batchmapp i produktens befintliga mapp (länkad från
  "Fininsh Ad"-fältet på testcenter-sidan `3c1270ab-908c-800b-8db1-eb7a295c5aa9`),
  se leveransrapport för exakt id.
- `agent/produktkarta.json`: Soptunneklistermärkena-posten kompletterad med
  `notion_hub_id`, `drive_produktmapp_id`, `minne`.
- `agent/budgetlogg.jsonl`: rad `CS_BATCH_KLAR` loggad.
