# Batch-log — IBC-Tanköverdraget

## Batch #1 — 2026-09-01 (`/forsta-batch`, automatisk rutinkörning)

**Trigger:** `agent/rond.mjs` behov `forsta_batch` — kampanjen hade passerat
1 500 kr (4 171 kr) och låg på 35,9 % vinst av omsättning (klart över 20 %-gränsen)
utan att någonsin ha fått en riktig brief-runda.

**Kvot:** `agent/rond.mjs::annonskvot` för budgetnivå 1 400–1 650 kr/dag →
2 annonser, 1 nytt koncept. Levererat: **4 briefer** (2 video, 2 statiska),
inklusive 1 nytt koncept (CO — comparison).

**Briefer i denna batch:**

| Annons | Format | Koncept | Hypotes | Källa |
|---|---|---|---|---|
| IBC_PD_3_H1 | Video | PD (near-iteration av vinnaren) | Fact-first hook (210D Oxford-tyg) i stället för pain-first hook, isolerad variabel | PD_1_H1, kontots enda bevisade vinnare |
| IBC_PD_3_1 | Statisk | PD (format-transfer) | Samma nya manus som statisk bild — testar format vs. budskap | IBC_PD_3_H1 |
| IBC_GT_3_H1 | Video | GT (rättvis omtest) | Gåva-vinkeln fick aldrig riktig budget (34,68 kr totalt) — riktig chans denna gång, en generisk rad utbytt mot en konkret | Befintlig GT_1-manus, en rad omskriven |
| IBC_CO_1_1 | Statisk | CO (helt nytt koncept) | Before/after-jämförelsevisual av det redan bevisade UV/alg-faktumet, aldrig testat i denna produkt | PD_1_H1:s bevisade sakfaktum, visualiserat i stället för uttalat |

**Kritiska fynd, ej byggda på i briefer men flaggade till Axel:**
1. Prisglapp: tre LIVE-annonser (CS_1_H2, CS_1_H3, CS_2_1) säger 489/636 kr,
   den nåbara produktsidan visar 419/524 kr.
2. Ogrundad social proof: SP-annonserna säger "hundratals trädgårdsägare",
   sidan har 0 recensioner (ett 10-rads fröfil i Drive är fel produkt-handle,
   aldrig synkat).
3. **Störst:** den nåbara Shopify-produktsidan beskriver en kranadapter, inte
   det UV-blockerande överdrag som alla 16 launch-annonser visar och säljer.
   Kräver Axels bekräftelse — se dna.md.

**Naming:** lästes av innan numrering — upptagna ID:n PD_1/PD_2/PD_Extra,
CS_1/CS_2, SP_1/SP_2, GT_1/GT_2. Nya: PD_3, GT_3, CO_1 (ny kod, redan använd
för "Rodholder_NO_CO_1_1" i ett annat produktflöde samma dag).

**Leverans:**
- Drive: Josh's befintliga produktmapp `IBC-tanköverdrag ` → `Batch #1` →
  4 undermappar (en per annons) + analysdokument, alla uppladdade som Google
  Docs.
- Notion: ny hub "IBC Tank Cover creative hub" (duplicerad från Creative hub
  MALL, id `3ce270ab-908c-8161-bed2-e22f132a6aba`), 4 items skapade med
  Status Draft, Typ Video/Image - Pending Approval, brief inklistrad +
  länk till Drive-dokumentet.
- Modellpolicy-avvikelse: inget Agent/Task-verktyg med `model`-parameter var
  tillgängligt i denna körning. Huvudsessionen skrev all copy själv och körde
  tre-frågorstestet (docs/copy-regler.md) explicit per rad i varje brief —
  samma dokumenterade avvikelse som Kranskydd Frost 420D, Surveillance
  Camera och Fish rod holder NO-batcherna 2026-08-29/31.
- Shopify-korskoll gick inte att göra (token utgånget) — landningssidan
  användes i stället, se dna.md.
