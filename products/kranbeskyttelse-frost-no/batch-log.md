# Batch-logg — Kranbeskyttelse Frost NO (norska marknaden)

## Batch #1 (launch) — 2026-08-29, före OS:et
16 annonser i kampanjen (samma PD/SP/CS/GT-struktur som SE-systerprodukten,
norsköversatt). Utfall t.o.m. 2026-09-01 (livstid, `date_preset: maximum`):
2 861,42 kr spend, 39 köp, ROAS 3,65 mot break-even 1,63 — kampanjen har
klarat testet med god marginal (32,6 % vinst av omsättningen). Bara EN
annons (`Kranbeskyttelse_NO_PD_1_H1`) har passerat signifikansgrinden
(≥300 kr + ≥3 köp): 2 656,18 kr spend, 39 köp, ROAS 3,93 — bär 106 % av
kampanjens vinstbidrag. Se `dna.md` för full analys.

## Batch #2 — 2026-09-01 (`/forsta-batch`, körning nr 1, NORSK marknad)

**Varför:** `agent/rond.mjs` flaggade `forsta_batch`-behov 2026-09-01 —
kampanjen har passerat 1 500 kr spend OCH ligger på 32,6 % vinst (över
20 %-kravet) men har aldrig fått en riktig creative-batch.

**Analys:** se `dna.md`. Nyckelfynd: NO-kontots vinnande vinkel är
**spegelvänd mot SE** — i NO bär PD (pain/demo) 106 % av vinsten medan SP
(social proof) aldrig fått en riktig chans (47,96 kr total spend); i SE är
det tvärtom (SP bär 129 %, PD går back). Ingen av de två möjliga
förklaringarna (marknadsskillnad vs. Metas leveranskoncentration till EN
annons) kan skiljas åt med nuvarande data — denna batch testar båda.

**Kritiskt fynd — pris:** `mcp__Shopify__*` gav "requires re-authorization
(token expired)" för beverbutikken.no, samma blockering som drabbade
Fiskespöhållaren NO 2026-08-31. Priset kunde inte verifieras. Alla nya
briefer i denna batch är medvetet prisfria — matchar för övrigt kontots
egen bevisade vinnarannons, som aldrig nämner pris.

**Levererat:** 6 nya briefer (3 video + 3 static), alla produktionsklara.

| Annons | Typ | Hypotes | Källa |
|---|---|---|---|
| Kranbeskyttelse_NO_PD_3_H1 | video | Konkret "dagen efter"-hook i stället för abstrakt varning håller ROAS uppe på den bevisade PD-vinkeln, minskar frequency-risk på PD_1_H1 (93 % av all spend) | vinnare PD_1_H1 (nära iteration, isolerar hook-konkretion) |
| Kranbeskyttelse_NO_PD_3_1 | static | Samma bevisade PD-copy (ordagrant återanvänd) fungerar lika bra/bättre statiskt — billigare produktion | vinnare PD_1_H1 (formatöverföring) + playbook-mönster (Bälteslipmaskinen, SE Kranskydd) |
| Kranbeskyttelse_NO_UG_1_H1 | video | Äkta UGC-talking-head ger SP-vinkeln (SE:s bevisade vinnare) en genuin chans i NO — isolerar format vs. marknad som förklaring till SP:s underspend | SE:s Kranskydd_UG_1_H1-koncept, speglat på motsatt vinkel eftersom NO:s mönster är omvänt mot SE |
| Kranbeskyttelse_NO_CI_1_H1 | video | Ärlig säsongs-/konsekvensurgency ersätter den blockerade rabatt-vinkeln utan att hitta på en kr-siffra | direkt speglad från SE:s Kranskydd_CI_1_H1 — samma BLOCKER, samma lösning |
| Kranbeskyttelse_NO_CI_1_1 | static | Samma nya vinkel som statisk, kontots beprövade text-tunga layout utan den falska rabatten | direkt speglad från SE:s Kranskydd_CI_1_1 |
| Kranbeskyttelse_NO_PD_4_1 | static | Bokstavlig före/efter-split visualiserar PD-vinkelns konflikt i stället för att bara beskriva den | copy-regler.md ("konflikt driver allt") — delad, obevisad hypotes med SE:s dna.md |

**GT (gåva) och CS (rea) får INGA nya annonser i denna batch** — GT pausas
till november (samma säsongsfel som SE), CS är samma BLOCKER som SE
(23 % rabatt utan bekräftad rabattkod/jämförpris — Shopify oåtkomlig denna
körning, men SE-systerprodukten har redan bevisat mönstret för denna
produktfamilj).

Launch-regel: **separat test-ABO, lika budget per annons** (CLAUDE.md regel
11) — aldrig i samma annonsgrupp som originalannonserna.

**Modellpolicy-avvikelse:** inget Agent/Task-verktyg för att spawna en
sonnet/haiku-subagent fanns tillgängligt i den här körningen (verifierat via
verktygssökning — samma avvikelse som drabbade både SE Kranskydds Batch #2
och Fiskespöhållaren NO:s Batch #1). All copy i denna batch är därför
skriven av huvudsessionen själv, inte av en subagent — avvikelse från
CLAUDE.md regel 6, dokumenterad explicit här och i leveransrapporten.
Tre-frågorstestet (copy-regler.md) är kört rad för rad i varje briefs
Google Doc.

**Notion:** ny hub "Kranbeskyttelse Frost NO creative hub" duplicerad från
"Creative hub MALL" (ingen hub existerade för denna NO-produkt), id
`3ce270ab-908c-81a9-a0c9-cb8fbdcdeae9` (data source
`de8270ab-908c-83fe-9943-87319bf904b6`). Alla 6 items skapade som `Draft` /
`Video - Pending Approval` respektive `Image - Pending Approval`.

**Drive:** produktmappen "NO Kranskydd Frost 420D" hittades i
`MAKE TO NORWAY` (id `1UlcNZRVuLeR1bCLV6XPINKBDrZ5jpthz`, ägs av Axel) —
innehöll launch-batchens assets flatt, ingen tidigare Batch #-mapp. Skapade
`Batch #1` (id `1mnL3D1M3wwpQ8ox9VzSG7EHfMiaIHIH_`) inuti den, med sex
Google Docs-briefer (en per annons).

**Kvot:** `node pipeline/quota.mjs` visar bara de 6 SE-skalningsprodukterna i
`products/products.json` — Kranbeskyttelse Frost NO ingår inte i det
systemet (testprodukt, inte en av de fyra skalningsprodukterna). Rondens
`annonskvot(1200)` ger 2 annonser/nyaKoncept 1 som golv för en 3-dagarsrunda;
för `forsta_batch` gäller i stället forsta-batch.md:s egen struktur — denna
batch (6) matchar SE-systerns Batch #2-storlek, medvetet över golvet, samma
mönster som tidigare `/forsta-batch`-körningar i detta konto.
