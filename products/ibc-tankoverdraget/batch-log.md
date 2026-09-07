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

---

## Batch #3 — 2026-09-07 (`/cs`, automatisk rond-auto, behov `brief_runda`)

**Trigger:** `rundaAntal: 6`, fokus "mata vinnaren — skalats 4 gånger på en
vecka" (rondens egen orsakstext).

**Feedbackloop på batch #1 (2026-09-01) och batch #2 (2026-09-04) — tredje
gången samma observandum:** `IBC_PD_4_H1`, `IBC_PD_4_H2`, `IBC_PD_4_H3` och
`IBC_SP_3_H1` (batch #2:s fyra videobriefer) **finns inte alls i kontot** tre
dagar senare — redigerarna har inte producerat dem. `IBC_PD_3_H1` och
`IBC_GT_3_H1` (batch #1:s video) finns som creatives i kontot men med bara
6,01 respektive 4,10 kr spend — i praktiken aldrig lanserade på riktig budget.
De statiska brieferna (PD_3_1, CO_1_1, PD_4_1, CS_3_1) har alla fått lite spend
men ingen av dem passerar 300 kr. **Ingen av batch #1:s eller batch #2:s
hypoteser (fact-first hook, creator-on-camera, pacing-cut, belagd SP,
format-transfer, gåva-omtest, before/after) kan bekräftas eller motbevisas
ännu — tre batcher i rad.** Detta är ett produktionsflaskhalse-fynd: kontot
skalar i praktiken fortfarande bara de två annonserna från själva launchen
(PD_1_H1, CS_1_H3). Noteras som observandum, ändrar INTE briefprocessen —
per uppdragets instruktion körs nästa batch som vanligt.

**Analys (full ANALYSMETOD.md-körning, se dna.md "Uppdatering 2026-09-07"
för fullständig teardown och variabeltabell):**

- Signifikansgrind: 2 av 26 annonser bedömbara (≥300 kr + ≥3 köp) — PD_1_H1 och,
  nytt denna körning, CS_1_H3.
- Datakvalitet: `amount_spent × purchase_roas` verifierad mot
  `omni_purchase_values` för alla rader med köp — matchar exakt (t.ex. PD_1_H1:
  13 753,23 × 3,110968 = 42 785,86 kr = fältets värde). Ingen trasig rad.
- **PD_1_H1** (benchmark): 13 753,23 kr (88,4 % av spend), 66 köp (95,7 % av de
  bedömbara köpen), CPA 208,38 kr mot break-even 323,84 kr, ROAS 3,11,
  **vinstbidrag +7 620,43 kr**. Nästan fördubblad spend tredje körningen i rad
  (3 455 → 7 980 → 13 753 kr) med stabil CPA under break-even — regression
  enligt ANALYSMETOD.md steg 5, väntat, inget larm.
- **CS_1_H3**: passerade nu 300 kr-gränsen (522,99 kr) och 3-köpsgränsen (3 köp).
  CPA 174,33 kr, ROAS 4,11, **vinstbidrag +448,53 kr**. Batch #1/#2:s hypotes
  "CS lutar mot svagare än PD" höll INTE.
- **Creative-teardown (steg 6b):** hämtade full copy för PD_1_H1 och CS_1_H3 via
  `ads_get_creatives`. PD_1_H1:s manus är oförändrat sedan batch #2:s extraktion.
  **Nytt fynd:** CS_1_H3:s live-copy innehåller påhittad brådska — "IDAG ENDAST",
  "Lagret krymper snabbt — många har redan beställt inför sommaren", "beställ
  innan det är slut". Ingen av dessa påståenden går att verifiera mot någon
  källa (Shopify visar inget lagersaldo-larm, inget faktiskt tidsbegränsat
  erbjudande finns). Detta bryter mot CLAUDE.md regel 3 och `docs/copy-regler.md`.
  Ingen ändring gjordes i den live-annonsen (utanför denna körnings Meta-mandat:
  läsning tillåten, skrivning inte) — flaggat till Axel, och ny copy i denna
  batch bygger inte vidare på de påhittade raderna.
- 4 mönster identifierade och märkta bevisad/hypotes, var och en kopplad till en
  konkret briefinstruktion — se dna.md "Uppdatering 2026-09-07".

**Kvot:** `pipeline/quota.mjs` spårar inte IBC-Tanköverdraget (produkten står
inte i `products/products.json`) — batchstorleken styrs av rondens
`rundaAntal: 6`, precis som `/rond-auto` steg 4b föreskriver.

**Briefer i denna batch (6 i rundan, minst 4 video/max 2 statiska — 4 video,
2 statiska ✅ — + 3 BOF + 2 review, alla utanför rundaAntal):**

| Annons | Format | Koncept | Variabeltaggar | Hypotes (isolerad variabel) | Källa |
|---|---|---|---|---|---|
| IBC_PD_5_H1 | Video | PD, near-iteration | Angle: pain \| Hook: visuellt/spec-först \| Format: VO+broll \| Proof: 210D Oxford, 2 min, öppning upptill \| Offer: inget pris \| Talare: röst | Isolerar hook-modalitet: spec-anchored visuell öppning i st f textfråga, resten av manuset identiskt med PD_1_H1 | PD_1_H1 (benchmark) |
| IBC_PD_5_H2 | Video | PD, proof-count | Angle: pain \| Hook: pain-fråga (återanvänd) \| Format: VO+broll \| Proof: 210D Oxford + NY: 30 dagar/Klarna \| Offer: inget pris \| Talare: röst | Isolerar proof-antal: lägger till en 4:e ✅-punkt (garanti) på PD_1_H1:s exakta manus/hook | PD_1_H1 (benchmark) |
| IBC_CS_4_H1 | Video | CS, struktur-transfer | Angle: rea (verifierad) \| Hook: siffra/pris \| Format: VO+broll, PD:s struktur \| Proof: prismatematik + 210D Oxford \| Offer: pris syns \| Talare: röst | Behåller CS_1_H3:s riktiga rabatt, tar bort all påhittad brådska, bygger på PD:s bevisade struktur i stället | CS_1_H3 (nu bedömbar), PD_1_H1:s struktur |
| IBC_GT_4_H1 | Video | GT, nytt koncept | Angle: identity/gåva (specifik mottagare) \| Hook: identity+spec \| Format: VO+broll, gåva-inramning \| Proof: 210D Oxford, 2 min \| Offer: inget pris \| Talare: röst | GT obevisad, inte motbevisad, efter 3 batcher — ny konkret inramning (gåva till nyinflyttad tankägare) i st f generisk "gåva" | Losing/Obevisat-DNA: GT_1–3 |
| IBC_CS_4_1 | Statisk | CS, format-transfer | Angle: rea \| Format: offer-grafik+produkt \| Proof: 210D Oxford \| Offer: pris syns | Ger CS-vinkeln en andra, billig tillgång på samma riktiga rabatt/struktur | IBC_CS_4_H1 |
| IBC_PD_5_1 | Statisk | PD, format-transfer | Angle: pain \| Format: split/före-efter \| Proof: 210D Oxford \| Offer: inget pris | Samma hook-modalitetstest som PD_5_H1, som statisk — ger PD_2_1 (aldrig fått spend) en riktig A/B-syster | IBC_PD_5_H1 |
| IBC_BOF_4_1 | Statisk (BOF) | Installationsinvändning | Format: offer-grafik \| Proof: 2 min, blixtlås | Ny BOF-vinkel (batch #2 täckte pris/garanti/storlek) — "är det krångligt att sätta på?" | Produktsidans egen text: dragkedja i st f presenning/gummiband |
| IBC_BOF_5_1 | Statisk (BOF) | Cost-of-inaction | Format: comparison \| Proof: citat från egen produktsida | Vad händer om man INTE köper — presenning som blåser av, citerat ordagrant ur produktsidan | Produktsidans egen text |
| IBC_BOF_6_1 | Statisk (BOF) | Frakt/leverans | Format: offer-grafik \| Proof: sidans egen fraktrad | "När kommer den / är frakten gratis?" — matchar produktsidans exakta fraktformulering | Produktsidans sales-point-rad |
| IBC_RV_3_1 | Statisk (review) | Recension, Sofia | Proof: verbatim recension | Verbatim citat, 5 stjärnor, sol/UV-koppling | Produktsidan (Judge.me JSON-LD), verifierad 2026-09-07 |
| IBC_RV_4_1 | Statisk (review) | Recension, Johan | Proof: verbatim recension | Verbatim citat, 5 stjärnor, storleks-koppling (1000L) | Produktsidan (Judge.me JSON-LD), verifierad 2026-09-07 |

**Naming:** upptagna ID:n avlästa direkt i kontot (`ads_get_ad_entities`) före
numrering — PD_1/PD_2/PD_3/PD_4/PD_Extra, CS_1/CS_2/CS_3, SP_1/SP_2, GT_1/GT_2/
GT_3, CO_1, BOF_1/2/3, RV_1/2 var tagna (SP_3 briefad i batch #2 men aldrig
producerad — lämnad orörd, inte återanvänd). Nya: PD_5, CS_4, GT_4, BOF_4–6,
RV_3–4.

**Backlog:** `products/ibc-tankoverdraget/backlog.md` var tom (dubbelkollad) —
inga väntande idéer att markera som använda denna körning.

**Modellpolicy-avvikelse:** inget Agent/Task-verktyg med `model`-parameter var
tillgängligt i denna körning. Huvudsessionen skrev all copy själv och körde
tre-frågorstestet (docs/copy-regler.md) explicit per rad i varje brief — samma
dokumenterade avvikelse som batch #1, batch #2 och tidigare Bäverbutiken-batcher
2026-08-29/31.

**Leverans:**
- Drive: produktmappen `1EL7qjxDtCeKTUJPuCY7Asp2FshiD0nDO` → `Batch #3`
  (`1sFUIzFF0yWQlTJE3Vv26ubBDNanf5e6S`) → 11 undermappar (en per annons, tomma,
  för redigerarnas leverans) + ett samlat brief-dokument
  (`IBC Batch #3 — All briefs (2026-09-07)`,
  https://docs.google.com/document/d/1pECK_n0g9Po3QIs-LBf3919y1Arwb-t7fH69U0kXA8k/edit)
  med alla 11 fullständiga briefer.
- Notion: 11 items skapade i befintliga hubben "IBC Tank Cover creative hub"
  (`3ce270ab-908c-8161-bed2-e22f132a6aba`), Status Draft, Typ Video/Image -
  Pending Approval, hela briefen inklistrad i varje item + länk till
  Drive-dokumentet + länk till annonsens egen Drive-undermapp. Verifierat genom
  att hämta tillbaka `IBC_CS_4_H1` (`3d4270ab-908c-8122-a27c-f1e55753e47b`) —
  shot list och tre-frågorstabellen står i sidan.
- `agent/produktkarta.json`: `drive_senaste_batchmapp_id` uppdaterad till
  Batch #3:s mapp-id (`1sFUIzFF0yWQlTJE3Vv26ubBDNanf5e6S`).
