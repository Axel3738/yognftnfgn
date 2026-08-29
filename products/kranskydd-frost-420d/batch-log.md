# Batch-logg — Kranskydd Frost 420D

## Batch #1 — originaladsen (launch 2026-08-21, före OS:et)
18 annonser i kampanjen (PD/SP/CS/GT-serier + extra-varianter), en enda
annonsgrupp. Utfall t.o.m. 2026-08-29 (livstid): 3 091 kr spend, 11 köp,
ROAS 1,72 mot break-even 1,49 — kampanjen har klarat testet. Bara EN annons
(SP_1_H3) har passerat signifikansgrinden (≥300 kr + ≥3 köp); den bär hela
kampanjens vinstbidrag (+629 kr av totalt +487 kr). Se `dna.md` för full analys.

## Batch #2 — 2026-08-29 (`/forsta-batch`, körning nr 1, automatisk körning)
6 briefer (3 video, 3 bild). Ingen kvotrad i `pipeline/quota.mjs` (produkten
saknas i `products/products.json` — den styrs via `agent/produktkarta.json`/
ronden). Ronden gav 1 000 kr/dag → veckokvot 2 st (`annonskvot(1000)`); denna
batch (6) är medvetet över kvotgolvet, samma mönster som Bälteslipmaskinens
batch #2.

| Annons | Format | Hypotes | Källa |
|---|---|---|---|
| Kranskydd_SP_3_H1 | video | Ett andra, mer konkret vinter-scenario i testimonial-formatet håller SP-vinkelns CPA under 322 kr | vinnare SP_1_H3 (nära iteration) |
| Kranskydd_SP_3_1 | bild | Proof-stapling (tre korta citat) slår SP_2_1:s enkla citat på samma vinkel | vinnare SP_1_H3/SP_2_1 (formatöverföring) |
| Kranskydd_UG_1_H1 | video | Ett verkligt ansikte som pratar till kameran löser PD-vinkelns svaga konvertering bättre än opersonlig voiceover+broll | PD_1_H2/H3 (isolerar FORMAT, inte vinkel) + playbook-mönster UGC |
| Kranskydd_PD_3_1 | bild | Före/efter-split (fryst/oskyddad kran vs. skyddad kran) ger en tydligare konflikt än PD_2_1:s enkla produktbild | copy-reglerna (konflikt) + PD-vinkelns svaga video-CVR |
| Kranskydd_CI_1_H1 | video | En ny "kostnad av att strunta i det"-vinkel (utan påhittad kr-siffra) fyller tomrummet efter den trasiga CS-rabatten | ersätter CS (BLOCKER) — ny vinkel, GISSNING märkt |
| Kranskydd_CI_1_1 | bild | Samma nya vinkel som statisk, ärlig säsongs-brådska i stället för falsk rabatt-brådska | ersätter CS (BLOCKER) — ny vinkel, GISSNING märkt |

**GT (gåva) och CS (rea) får INGA nya annonser i denna batch** — GT pausas
till november (säsongsfel, se dna.md), CS är en BLOCKER tills en riktig
rabatt finns i Shopify (ägarbeslut, ej gjort här).

Launch-regel: **separat test-ABO, lika budget per annons** (CLAUDE.md regel
11) — aldrig i samma annonsgrupp som originalannonserna.

**Modellpolicy-avvikelse:** inget Agent/Task-verktyg för att spawna en
sonnet/haiku-subagent fanns tillgängligt i den här körningen (verifierat via
verktygssökning). All copy i denna batch är därför skriven av huvudsessionen
själv, inte av en subagent — avvikelse från CLAUDE.md regel 6, dokumenterad
explicit här och i leveransrapporten. Tre-frågorstestet (copy-regler.md) är
ändå kört rad för rad i rapporten.

**Levererat 2026-08-29:** se leveransrapporten
(`docs/briefs/kranskydd-frost-420d-batch1/RAPPORT.md`) för Drive-/Notion-status
och fullständig Definition of Done.
