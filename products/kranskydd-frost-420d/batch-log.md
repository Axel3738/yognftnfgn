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

## Batch #3 — 2026-09-02 (`/rond-auto`, brief_runda, 4 dagar sedan batch #2)

**Feedback loop:** batch #2:s 6 annonser (SP_3_H1, SP_3_1, UG_1_H1, PD_3_1,
CI_1_H1, CI_1_1) syns ännu INTE i Meta-kontot — bara batch #1:s 18
originalannonser finns (verifierat via `ads_get_ad_entities`, `level: ad`,
`date_preset: maximum`, kampanj `120249975043720291`). SP_1_H3 (vinnaren)
har växt till 3 086 kr spend / 15 köp / ROAS 1,99 sedan `dna.md` skrevs
(1 730 kr / 7 köp) — mönstret håller och stärks, men ingen ny teardown gjord
denna körning (samma kvalitativa slutsats). Alla fyra "Testa
kontrollerat"-idéer utom en (PD-copy som statisk retest) är redan förbrukade
av batch #2. Recensionsluckan i backlog.md ("inga recensioner hämtade än")
är nu fylld: 10 Judge.me-recensioner hittade.

9 briefer (2 video + 2 statisk i rundan, 3 BOF-bilder, 2 review-bilder):

| Annons | Format | Hypotes | Källa |
|---|---|---|---|
| Kranskydd_PD_4_1 | statisk | PD-copy som statisk retest (isolerad formatvariabel) | explicit flaggad i dna.md "Testa kontrollerat" |
| Kranskydd_SP_4_H1 | video | Ny SP-persona: fastighetsskötare/hyresvärd, flera kranar | ny segmentiteration på bevisad SP-vinkel |
| Kranskydd_SP_4_1 | statisk | SP:s struktur + ärlig säsongsbrådska ersätter rabatt-brådska | dna.md: "ny copy utan rabatt ska ersätta CS" |
| Kranskydd_SP_5_H1 | video | Ny SP-persona: stugägare, obebodd fastighet på vintern | ny segmentiteration på bevisad SP-vinkel |
| Kranskydd_PD_6_1 | statisk (BOF) | Pris/erbjudande-retargeting | Axel 2026-09-02: obligatorisk BOF-serie |
| Kranskydd_PD_7_1 | statisk (BOF) | Garanti/frakt (30 dagar, Klarna, fri frakt) | Axel 2026-09-02: obligatorisk BOF-serie |
| Kranskydd_PD_8_1 | statisk (BOF) | Tidsförlust vid spräckt kran vs 10 sek skydd, ingen påhittad kr-siffra | Axel 2026-09-02: obligatorisk BOF-serie + dna.md:s regel mot påhittade summor |
| Kranskydd_REV_1_1 | statisk (review) | Verklig recension "Bra kvalitet" | Judge.me, verifierad, ordagrant — fyller backlog-luckan |
| Kranskydd_REV_2_1 | statisk (review) | Verklig recension "Fungerar bra" | Judge.me, verifierad, ordagrant — fyller backlog-luckan |

**GT (gåva) och CS (rea) fick INGA nya annonser igen** — GT fortsatt pausad
till november, CS fortsatt BLOCKER (ingen riktig rabatt i Shopify).

Launch-regel: **separat test-ABO, lika budget per annons** (CLAUDE.md regel 11).

**Modellpolicy:** all svensk copy skriven av sonnet-subagent denna gång
(Agent-verktyget fanns tillgängligt, till skillnad från batch #2) —
tre-frågorstestet kört rad för rad i subagentens leverans, verifierat av
huvudsessionen innan Notion-uppladdning.

**Levererad 2026-09-02:** 9 Notion-items i befintlig hub "Kranskydd Frost
420D creative hub" (Status Draft, Typ Video/Image - Pending Approval, hela
briefen i sidan). Drive Batch #3 (`1MJatX6MH1n8QXhclX5y9SV_1uBK6xBA0`): en
översiktsdoc med alla 9 briefer länkade till Notion. `CS_BATCH_KLAR` loggad
i `agent/budgetlogg.jsonl`.

## Batch #4 — 2026-09-05 (`/cs`, nattlig auto-runda steg 4b, 3 dagar sedan batch #3)

**Feedback loop mot batch #3:** SP_4_H1, SP_4_1, SP_5_H1, PD_4_1, PD_6/7/8_1,
REV_1_1/2_1 syns i kontot (skapade 2026-09-02) men har alla 0–3 kr spend —
fortsatt CBO-svält, ingen kan bedömas än. Undantag: **REV_1_1 har status
`DISAPPROVED`** i Meta (policyavslag) — flaggat till Axel, ingen ny åtgärd
här. Två stora förändringar sedan dna.md senast skrevs (2026-08-29):
1. **PD_2_1 (statisk) passerade signifikansgrinden** och är nu bevisad
   (8 köp, ROAS 1,91, vinstbidrag +492 kr) — se dna.md Winning DNA punkt 4.
2. **AOV har sjunkit till 418 kr** (från 485 kr) i takt med fler köp;
   break-even-CPA omräknad till 281 kr.
3. Kampanjen pausades och återaktiverades av `/rond-auto` 2026-09-03/04
   (operativt fel, ej creative-relaterat) — budgettak nu 500 kr/dag.

**Uppdraget för denna runda var att ersätta annonser pausade i
"åtgärdstrappan" (kod `TRAPPA_FORLANGNING`).** Sökt igenom hela
`agent/budgetlogg.jsonl` (275 rader): **noll träffar** för den koden på
denna kampanj. De två annonser som faktiskt är PAUSED i kontot just nu —
**Kranskydd_PD_1_H2** och **Kranskydd_PD_1_H3** — pausades genom en okänd
mekanism (ingen logg, ingen aktivitetslogg-träff). Den här batchen briefar
ändå ersättare för dessa två, eftersom de matchar uppdragets syfte
(spendtjuvande PD-videor under break-even) även om den beskrivna trappan
inte var den faktiska orsaken.

9 briefer (3 video + 1 statisk i rundan, 3 BOF-bilder, 2 review-bilder):

| Annons | Format | Hypotes | Källa |
|---|---|---|---|
| Kranskydd_PD_9_H1 | video | Samma skräckscenario som PD_1_H3, men med ett riktigt (verifierat Judge.me-) recensionsinslag runt sek 5–8 — isolerar om ett proof-inslag räddar hold/konvertering utan att byta vinkel | Ersätter PAUSAD PD_1_H3. dna.md Winning DNA #4 (hold kraschar utan proof) |
| Kranskydd_PD_10_H1 | video | Samma skräckscenario som PD_1_H2, men snabbare klipptakt + produkt i bild redan sek 0–2 + snabb garanti-payoff — isolerar KLIPPTAKT som annan variabel än proof | Ersätter PAUSAD PD_1_H2. dna.md Winning DNA #4 |
| Kranskydd_SP_6_H1 | video | Ny SP-persona: någon som fick en spräckt kran förra vintern för att den INTE skyddades, skyddar den nu | Ny segmentiteration på bevisad SP-vinkel (efter fastighetsskötare, stugägare i batch #3) |
| Kranskydd_SP_7_1 | statisk | Överför PD_2_1:s bevisade statiska exekvering (fet rubrik + installerad produkt i snö) till SP:s budskap i stället för PD:s rädsla — isolerar EXEKVERINGSSTIL vs. VINKEL | dna.md Winning DNA #4, format-transfer |
| Kranskydd_PD_11_1 | statisk (BOF) | Direkt jämförelsebild skyddad/oskyddad kran, ingen påhittad rabatt | Ny BOF, kompletterar batch #3:s pris/garanti/tidskostnad-BOF |
| Kranskydd_SP_8_1 | statisk (BOF) | Verklig recension + pris/CTA — parar kontots enda bevisade vinkel med BOF-läget | Ny BOF, ingen tidigare kombinerat SP med retargeting-pris |
| Kranskydd_PD_12_1 | statisk (BOF) | Måttangivelse (22×14 cm) synlig i bild — adresserar "passar den min kran?"-invändningen | Ny BOF, obehandlad invändning |
| Kranskydd_REV_3_1 | statisk (review) | Verklig recension "Bra köp" (Anna Berg, 5★, id 1310888604) | Judge.me, verifierad, ordagrant — 2 av 8 kvarvarande recensioner |
| Kranskydd_REV_4_1 | statisk (review) | Verklig recension "Precis vad jag behövde" (Peter Johansson, 5★, id 1310888409) | Judge.me, verifierad, ordagrant |

**GT (gåva) och CS (rea) fick INGA nya annonser igen** — GT fortsatt pausad
till november, CS fortsatt BLOCKER (ingen riktig rabatt i Shopify, oförändrat
sedan batch #1).

Launch-regel: **separat test-ABO, lika budget per annons** (CLAUDE.md regel 11).

**Modellpolicy-avvikelse (upprepad, se batch #2/#3 och systerprodukterna
IBC-Tanköverdraget/MC-Kapellet/Damasker Vandring/Båtmotorskyddet):** inget
Agent/Task-verktyg med `model`-parameter var tillgängligt i denna körning
(verifierat via `ToolSearch`, inga träffar). Huvudsessionen skrev all copy
själv och körde tre-frågorstestet explicit rad för rad i varje brief
(tabellerna står i varje Notion-item), i linje med samma dokumenterade
avvikelse för denna och systerprodukter.

**Levererad 2026-09-05:** 9 Notion-items i befintlig hub "Kranskydd Frost
420D creative hub" (`3cc270ab-908c-8179-bde9-d11a87ed06fb`, Status Draft,
Typ Video/Image - Pending Approval, hela briefen i sidan — verifierat med
`notion-fetch` på Kranskydd_PD_9_H1). ⚠️ Hubbens `<ancestor-path>` är tom/
titellös på databasnivå (samma mönster som de fyra skalningsprodukternas
arkiverade hubbar) — den syns troligen inte i en vanlig teamspace-navigering,
bara via sökning. Ingen Drive-mapp/zip skapad denna körning (utanför
uppdragets explicita scope denna gång — hela briefen ligger i Notion-itemet
som krävt). Ingen git-commit gjord av denna körning (huvudsessionen
committar/pushar åt alla produkter i samma runda).
