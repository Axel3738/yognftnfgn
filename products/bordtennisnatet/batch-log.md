# Batch-logg — Bordtennisnätet Infällbart

## Batch #0 — originalannonserna (launch 2026-08-29, före OS:et)
15 annonser (video + statisk) i en kampanj/ett adset, byggda från ett
Notion-testcenterskript (`3bf270ab-908c-80af-b91a-c6bbb28215ff`) och en
Google Drive-produktmapp Josh satte upp. Livstidsutfall (avläst 2026-09-04,
`maximum`): 3 568,72 kr spend, 3 köp, ROAS 0,32 mot break-even 1,80 — långt
under gränsen. Kampanjen stängdes AV av `/rond-auto`s huvudflöde tidigare
samma dag (trappan, potentialkollen föll efter en förbrukad förlängning).
Se `dna.md` för full analys, inkl. två stavfel hittade i befintligt material
("Bortennisnätet" i CS_1, "Lagret krimper" i CS_3) och ett
erbjudande-integritetsfynd (källmaterialets "CLEARANCE SALE"-manus med
fabricerad brådska, aldrig verifierbar mot landningssidan).

## Batch #1 — 2026-09-04 (`/rond-auto` steg 4b, `ersatt`-behov, specialregel:
produkten saknade minnesfiler → `forsta-batch.md`-flödet körs, men loggas
`CS_BATCH_KLAR` inte `FORSTA_BATCH_KLAR` eftersom kampanjen redan haft spend
och 15 annonser innan minnessystemet fanns)

**Kampanjen var redan PAUSAD av trappan när denna batch byggdes.** Den här
körningen har inte rört Meta-status — bara analys, briefer, Drive och
Notion. En pausad kampanj kan få nytt material att testa när redigerarna är
klara; ingen enskild annons i batchen är dömd som bevisad, eftersom
kampanjnivån (inte enskilda annonser) är det enda som nått signifikans.

17 briefer: 6 video + 6 statisk + 3 BOF + 2 review (matchar exakt
forsta-batch.md:s FAS 8/9-minimum: 6 video/6 statisk/3 BOF/2 review).
`node pipeline/quota.mjs` känner inte produkten (den ingår inte i
`products/products.json`, bara i `agent/produktkarta.json` som rond-produkt)
— kvotskriptet gav därför ingen produktspecifik siffra för Bordtennisnätet;
FAS 8/9-minimum används som facit i stället.

| Annons | Format | Hypotes | Källa |
|---|---|---|---|
| Bordtennisnat_PD_4_H1 | video | Byt "soffläge" mot aktiv familjetid — mobiler bort, nät fram | konkurrenten VaruZone.se ("Byt soffläge mot aktiv familjetid") + egna Judge.me-recensioner (alla handlar om kvälls-/familjeanvändning) |
| Bordtennisnat_PD_5_H1 | video | "Vilket bord som helst" visat konkret på fyra bordstyper i samma spot, inte bara påstått | format transfer av kontots kärnlöfte + konkurrenten Shopcenteri shop ("förvandla vilket bord som helst") |
| Bordtennisnat_PD_6_H1 | video | Gummiklädda klämmor lämnar inga märken — hanterar en outtalad invändning med ett verifierat produktfaktum | produktbeskrivningen (WebFetch, 2026-09-04) |
| Bordtennisnat_SP_4_H1 | video | Regnig dag/uttråkade barn som trigger, med SP_3:s starka install-närbild återanvänd i nytt sammanhang | SP_3 (94 % hook / 30 % hold, för lite spend för dom) |
| Bordtennisnat_SP_5_H1 | video | Vad som ingår (nät + 2 racketar + 6 bollar) som eget bevis-baserat beat, "peka inte prata" | copy-regler.md + produktbeskrivningen |
| Bordtennisnat_CS_4_H1 | video | Nytt, eget familjekvälls-material (licensierat) återskapar CS_3:s idé utan att återanvända dess fil | CS_3 (bäst ROAS på minsta dataunderlag, 1 köp — men källfilen har vattenstämpel "do not re-upload") |
| Bordtennisnat_PD_7_1 | bild | Nära iteration av PD_3 med rättstavat produktnamn och nätet tydligt i bild | PD_3 (kampanjens störste spendare, ROAS 0,54) + CS_1:s stavfel-fynd |
| Bordtennisnat_SP_6_1 | bild | Format transfer av SP_3:s klämnärbild till en 3-stegsbild | SP_3 (bäst hook/hold i kampanjen) |
| Bordtennisnat_CS_5_1 | bild | Familjefoto, fyra personer runt köksbordet, eget/nytt material | CS_3 (samma idé, ny licens) |
| Bordtennisnat_G_3_1 | bild | "Du behöver inte äga ett pingisbord" — ursprungshooken från testcenterskriptet, aldrig byggd som jämförelsebild | Notion-testcenterskriptet 2026-08-27 (aldrig använt i en annons) |
| Bordtennisnat_GT_3_1 | bild | Collage: nätet monterat på fyra olika bordstyper, bevisar "vilket bord som helst" visuellt | konkurrenten Shopcenteri shop, format transfer från PD_5_H1 |
| Bordtennisnat_PD_8_1 | bild | "Vad som ingår"-listicle, samma logik som SP_5_H1 i statiskt format | produktbeskrivningen |
| Bordtennisnat_BOF_1_1 | bild (BOF) | Äkta pris/erbjudande (309 kr, spara 167 kr/35 % mot 476 kr) — aldrig fabricerad brådska | dna.md: källmaterialets "CLEARANCE SALE"-manus är ett offer-integritetsfynd, motsatt instruktion |
| Bordtennisnat_BOF_2_1 | bild (BOF) | 30 dagars öppet köp + fri frakt som riskreducering | Axels beslut 2026-09-02: +3 BOF-bilder per batch; verifierad produktsida |
| Bordtennisnat_BOF_3_1 | bild (BOF) | Gummiklädda klämmor / inga märken som invändningshantering | verifierad produktbeskrivning |
| Bordtennisnat_RW_1_1 | bild (review) | Erik Johansson 5★: "Barnen spelar nästan varje dag. Ett kul köp." — rutinanvändning som bevis | Judge.me REST-API, verifierat 2026-09-04 (dubbelkollat mot produktsidan) |
| Bordtennisnat_RW_2_1 | bild (review) | Emma Persson 5★: "Tar liten plats och är enkelt att förvara när vi inte spelar." — förvaringsinvändning | Judge.me REST-API, verifierat 2026-09-04 (dubbelkollat mot produktsidan) |

**Ingen ny "CLEARANCE SALE"/fabricerad-brådska-annons i denna batch** —
samma princip som Soptunneklistermärkena: det äkta priset och den äkta
garantin är starka nog utan påhitt.

**Datakälla för produktfakta:** `mcp__Shopify__*` i den här sessionen är
kopplad till fel butik (TwinPillow, verifierat med `get-shop-info`) — pris,
USP:er och recensioner hämtade via `WebFetch` av den publika produktsidan.
Recensionerna dubbelverifierade mot Judge.me REST-API (`JUDGEME_API_TOKEN`/
`JUDGEME_SHOP_DOMAIN`, `product_handle` = `bordtennisnat-infallbart-2-rack-6-bollar`)
— identiskt innehåll i båda källorna, 10 recensioner, 2 använda ordagrant.

**Modellpolicy-avvikelse:** inget Agent/Task-verktyg för att spawna en
sonnet/haiku-subagent var tillgängligt i den här körningen (verifierat via
`ToolSearch` — samma avvikelse som redan dokumenterad för
Soptunneklistermärkena, Kranskydd Frost 420D, Övervakningskameran och
Damasker Vandring samma vecka). All copy i denna batch är därför skriven av
huvudsessionen själv. Tre-frågorstestet (`docs/copy-regler.md`) är kört
rad för rad i varje brief, inline i Notion-itemet — ingen rad med ❌
levererades.

Launch-regel: **separat test-ABO, lika budget per annons** (CLAUDE.md regel
11) gäller när/om dessa launchas — den här körningen levererar bara briefer
och rör inte Meta.

**Levererat 2026-09-04:**
- Notion: ny hub **"Table tennis net creative hub"** (produkten saknade
  helt en creative hub — bred sökning på "Bordtennis", "Table tennis",
  "Ping pong" och "creative hub" gav noll träffar), duplicerad från
  "Creative hub MALL", 17 items, Typ "Video - Pending Approval" (6) /
  "Image - Pending Approval" (11), Status Draft. Ett item öppnat och
  verifierat med `notion-fetch` innan `CS_BATCH_KLAR` loggades.
- Drive: `Batch #1`-mapp skapad i produktens befintliga mapp (Joshs,
  `LAUNCHED`-undermappen i `BÄVER/Products`), med en undermapp per annons
  (17 st).
- `agent/produktkarta.json`: Bordtennisnätet-posten kompletterad med
  `notion_hub_id`, `notion_hub_datakalla`, `notion_hub_namn`,
  `drive_produktmapp_id`, `minne`.
- `agent/budgetlogg.jsonl`: rad `CS_BATCH_KLAR` loggad.
