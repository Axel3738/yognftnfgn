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

**~~Kritiska fynd~~ — ALLA TRE VAR FEL. Struket 2026-09-01 efter Axels
invändning och verifiering mot butiken:**
1. ~~Prisglapp~~ — annonsernas 489/636 kr är RÄTT. Produktsidan säger exakt
   samma sak.
2. ~~0 recensioner~~ — 10 recensioner ligger live. (Att "hundratals" är en
   överdrift av 10 kvarstår som en copy-fråga, inte som ett larm.)
3. ~~Fel produktsida~~ — sidan `ibc-tankoverdrag-1000-l-stoppar-alger-uv`
   finns och är rätt produkt.

**Rotorsak till felet:** Shopify-tokenen var utgången, så körningen sökte i
butiken i stället och tog fel av de tre IBC-produkterna (kranadaptern,
419/524 kr) som kampanjens landningssida. Larmen byggdes på den gissningen
och skickades till Axels telefon utan verifiering. Se rättelserutan i dna.md.
**Regeln som följer: utan Shopify-åtkomst är produktidentiteten overifierad —
skriv det, larma inte.**

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

---

## Batch #2 — 2026-09-04 (`/cs`, automatisk rond-4b, behov `brief_runda`)

**Trigger:** `rundaAntal: 6`, fokus "mata vinnaren — skalats 4 gånger på en
vecka" (rondens egen orsakstext).

**Feedbackloop på batch #1 (2026-09-01):** `IBC_PD_3_H1` och `IBC_GT_3_H1`
(video) är fortfarande inte uppladdade i kontot — redigerarna har inte hunnit
producera dem. `IBC_PD_3_1` och `IBC_CO_1_1` (statiska) är live men har bara
3,53 kr respektive 23,56 kr spend — för lite för att döma. Ingen av batch #1:s
hypoteser (fact-first hook, format-transfer, gåva-omtest, before/after) kan
alltså bekräftas eller motbevisas ännu. Flaggas till nästa körning.

**Analys (full ANALYSMETOD.md-körning, se dna.md "Uppdatering 2026-09-04"
för siffror):** Enda bedömbara annonsen är fortsatt **PD_1_H1** — nu 7 980 kr
spend (87 % av kampanjen), 39 köp (91 %), CPA 204,63 kr mot break-even
323,84 kr, vinstbidrag +4 649 kr. Den har skalats kraftigt sen förra
avläsningen (3 455→7 980 kr på tre dagar) — därav rondens fokus "mata
vinnaren". CS_1_H3 har passerat 300 kr spend (373,74 kr) med 2 köp, fortfarande
under 3-köpsgränsen. Allt annat är ren svält (<300 kr, 0 köp).

**Kvot:** `pipeline/quota.mjs` spårar inte IBC-Tanköverdraget (produkten står
inte i `products/products.json`, bara i `agent/produktkarta.json`) —
batchstorleken styrs i stället av rondens `rundaAntal: 6`, precis som
`/rond-auto` steg 4b föreskriver.

**Briefer i denna batch (6 i rundan, minst 4 video/max 2 statiska — 4 video,
2 statiska ✅ — + 3 BOF + 2 review, alla utanför rundaAntal):**

| Annons | Format | Koncept | Hypotes (isolerad variabel) | Källa |
|---|---|---|---|---|
| IBC_PD_4_H1 | Video | PD, near-iteration | Fact-first hook (materialfakta före smärtfrågan) i stället för pain-first — samma manus i övrigt. Tar upp PD_3_H1:s ohanterade hypotes med ny numrering | PD_1_H1 (vinnaren), PD_3_H1:s hypotes |
| IBC_PD_4_H2 | Video | PD, format-transfer | Creator-på-kamera i stället för röst-utan-ansikte, exakt samma manus/CTA. Ny visuell stil för att motverka fatigue vid skalning | PD_1_H1 (vinnaren) |
| IBC_PD_4_H3 | Video | PD, pacing-iteration | 12–15s Reels-cut av samma manus i stället för 20–25s — testar om snabbare klipp håller kvar fler tittare | PD_1_H1 (vinnaren) |
| IBC_SP_3_H1 | Video | SP, belagd formulering | Två verbatim-recensioner (Maria, Lena) ovanpå vinnarens struktur, ersätter övergivna "hundratals trädgårdsägare" | Backlog `[använd i batch #2]`, PD_1_H1:s struktur |
| IBC_CS_3_1 | Statisk | CS, rea + fakta | Bekräftat pris (489/636 kr, 23 %) ankrat mot vinnarens konkreta materialfakta i stället för lös brådska | Backlog `[använd i batch #2]` |
| IBC_PD_4_1 | Statisk | PD, format-transfer | Samma fact-first hook som PD_4_H1, som statisk bild — ger PD_2_1 (aldrig fått spend) en riktig A/B-syskon | PD_4_H1 |
| IBC_BOF_1_1 | Statisk (BOF) | Pris/erbjudande | Axels BOF-regel 2026-09-02 | — |
| IBC_BOF_2_1 | Statisk (BOF) | Garanti/frakt | 30 dagars öppet köp + Klarna, verifierat mot produktsidan 2026-09-04 | — |
| IBC_BOF_3_1 | Statisk (BOF) | Invändning (storlek) | 120×100×116 cm, standard 1000 L-tank, verifierat mot produktsidan | — |
| IBC_RV_1_1 | Statisk (review) | Recension, Maria | Verbatim citat, 5 stjärnor | Produktsidan, verifierad 2026-09-04 |
| IBC_RV_2_1 | Statisk (review) | Recension, Lena | Verbatim citat, 5 stjärnor, kopplad till "öppning upptill"-löftet | Produktsidan, verifierad 2026-09-04 |

**Naming:** upptagna ID:n avlästa i kontot före numrering — PD_1/PD_2/PD_3/
PD_Extra, CS_1/CS_2, SP_1/SP_2, GT_1/GT_2/GT_3, CO_1 var tagna. Nya: PD_4,
SP_3, CS_3, BOF_1–3 (ny kod för denna produkt), RV_1–2 (ny kod).

**Modellpolicy-avvikelse:** inget Agent/Task-verktyg med `model`-parameter var
tillgängligt i denna körning. Huvudsessionen skrev all copy själv och körde
tre-frågorstestet (docs/copy-regler.md) explicit per rad i varje brief — samma
dokumenterade avvikelse som batch #1 och Kranskydd Frost 420D/Surveillance
Camera/Fish rod holder NO 2026-08-29/31.

**Leverans:**
- Drive: produktmappen `1EL7qjxDtCeKTUJPuCY7Asp2FshiD0nDO` → `Batch #2`
  (`1jmASvWiJObghx2BIBDLcvm8TloQWxFr4`) → 11 undermappar (en per annons, tomma,
  för redigerarnas leverans) + ett samlat brief-dokument
  (`IBC Batch #2 — All briefs (2026-09-04)`,
  https://docs.google.com/document/d/108CSAMpuTjirCpkB1pppPGcqKakD0qCHegkrnkiD3jA/edit)
  med alla 11 fullständiga briefer.
- Notion: 11 items skapade i befintliga hubben "IBC Tank Cover creative hub"
  (`3ce270ab-908c-8161-bed2-e22f132a6aba`), Status Draft, Typ
  Video/Image - Pending Approval, hela briefen inklistrad i varje item +
  länk till Drive-dokumentet. Verifierat genom att hämta tillbaka
  `IBC_PD_4_H1` (`3d1270ab-908c-81b9-9ea3-dbdc70db3afd`) — shot list och
  design-tabellerna står i sidan.
- `agent/produktkarta.json`: `drive_senaste_batchmapp_id` uppdaterad till
  Batch #2:s mapp-id.
