# Batch-logg — Bälteslipmaskinen

Breakthrough-frekvens: 1/34 (3 %)

## Batch #1 — originaladsen (launch 2026-08-21, före OS:et)
16 annonser i CBO (PD/SP/CS/G-serier). Utfall t.o.m. 2026-08-29: se dna.md.
Lärdom: PD_2_1 (statisk, b020-stil) bäst vinstbidrag; CBO svalt 11 av 16.

## Batch #2 — 2026-08-29 (/forsta-batch, körning nr 1)
6 briefer levererade till Notion + Drive. Kvot: 3/vecka (2 000 kr/dag) — detta
är en ikapp-batch (Axels ord: "vi behöver ta ikapp bälteslipmaskinen").

| Annons | Hypotes | Källa |
|---|---|---|
| Beltgrinder_SO_4_1 | Ärligt pris (909/spara 273) behåller CS_2_1:s CVR utan falsk rabatt | vinnare CS_2_1 + regelbrott |
| Beltgrinder_PD_4_1 | Vinnarformatet bär fler vinklar än knivar (mejslar) | vinnare PD_2_1 |
| Beltgrinder_PD_5_1 | Före/efter-egg är den enklaste konflikten på 10-sek-löftet | vinnare PD_2_1 + copy-reglerna (konflikt) |
| Beltgrinder_PD_4_H1 | Bildvinnarens rubrik som videohook lyfter hookrate >15,4 % | vinnare PD_2_1 × PD_2 |
| Beltgrinder_PD_5_H1 | 3-i-1-bredden som hook fångar de som inte triggar på knivar | produktfakta + PD-seriens hold |
| Beltgrinder_SP_4_H1 | UGC-POV ("kökslådetestet") når social proof-luckan | playbook-mönster UGC-demo; obevisat för produkten — GISSNING märkt |

Launch-regel: **separat test-ABO, lika budget per annons** — inte i CBO:n.
Utfall: läses av vid nästa /cs.

**Levererad 2026-08-29:** Notion-hub skapad ("Belt grinder creative hub",
db `7dc504681b9c43498ea8be26b120b721`) med 6 brief-items (Status: Inte
påbörjad = Draft), Winning Creative-referens (PD_2_1 med bild) och
DO NOT REUSE-guideline (CS_2_1, falsk rabatt). Drive Batch #2
(`1eYmok8-W2UFwWIdDSq8ozFenYHihKuRB`): en mapp + brief-doc per annons,
två README:er, referensbilderna ligger i Notion-items (länkpekare i Drive).
FORSTA_BATCH_KLAR loggad — nästa runda flaggas av 3-dagarsregeln.

## Batch #3 — 2026-09-02 (`/rond-auto`, brief_runda, 4 dagar sedan batch #2)

**Feedback loop:** batch #2:s 6 annonser (SO_4_1, PD_4_1, PD_5_1, PD_4_H1,
PD_5_H1, SP_4_H1) syns ännu INTE i Meta-kontot — bara batch #1:s 16
originalannonser finns (verifierat via `ads_get_ad_entities`, `level: ad`,
`date_preset: maximum`, kampanj `120249902177470291`). Redigerarna har alltså
inte hunnit bygga batch #2 än. Inget nytt utfall att logga — samma data som
i `dna.md` gäller fortfarande. Alla fem "Testa kontrollerat"-idéerna i
`dna.md` (mejslar/yxor, före/efter-egg, ärligt pris, UGC-demo,
3-i-1-bredden) är redan förbrukade av batch #2, så batch #3 bygger nya
koncept: retest-serier på det bevisade PD_2_1/PD_2-formatet (Trust/proof,
inte kosmetik) + playbook-mönstret "Trust/anti-scam" (bevisat tvärkategori,
SnarkLös, `docs/playbook.md`) + real-recensions-vinkeln (nu möjlig, 11
Judge.me-recensioner hämtade — tidigare "Obevisat" i dna.md).

9 briefer (2 video + 2 statisk i rundan, 3 BOF-bilder, 2 review-bilder):

| Annons | Format | Hypotes | Källa |
|---|---|---|---|
| Beltgrinder_PD_6_H1 | video | Durability/trust-bevis: 5 knivar slipas i rad utan att tappa skärpa | playbook "Trust/anti-scam"-mönster (tvärkategori bevisat) + vinnarformatet PD_2/PD_2_1 |
| Beltgrinder_PD_7_H1 | video | 3-i-1-bredden i verkligt tempo (kniv→sax→yxa, samma klipp) | ny kombination av redan bevisad 3-i-1-fakta, ej tidigare kombinerad i ett klipp |
| Beltgrinder_SO_5_1 | statisk | Värde-matematik: "3 verktyg, priset av ett" | ärligt pris-mönstret (SO_4_1) + produktfakta |
| Beltgrinder_SP_5_1 | statisk | Trust-närbild på mekanismen i stället för adjektiv | copy-reglerna ("peka, prata inte") |
| Beltgrinder_PD_8_1 | statisk (BOF) | Pris/erbjudande-retargeting | Axel 2026-09-02: obligatorisk BOF-serie |
| Beltgrinder_PD_9_1 | statisk (BOF) | Garanti/frakt, verifierad Shopify-text | Axel 2026-09-02: obligatorisk BOF-serie |
| Beltgrinder_PD_10_1 | statisk (BOF) | Invändning: nya knivar varje gång vs. slipning en gång | Axel 2026-09-02: obligatorisk BOF-serie |
| Beltgrinder_REV_1_1 | statisk (review) | Verklig recension "Mycket smidig" | Judge.me, verifierad, ordagrant |
| Beltgrinder_REV_2_1 | statisk (review) | Verklig recension "Fungerar fint" | Judge.me, verifierad, ordagrant |

Launch-regel: **separat test-ABO, lika budget per annons** (CLAUDE.md regel 11).

**Modellpolicy:** all svensk copy skriven av sonnet-subagent (Agent-verktyget),
tre-frågorstestet kört rad för rad i subagentens leverans, verifierat av
huvudsessionen innan Notion-uppladdning.

**Levererad 2026-09-02:** 9 Notion-items i befintlig hub "Belt grinder
creative hub" (Status Draft, Typ Video/Image - Pending Approval, hela briefen
i sidan — verifierat med notion-fetch på PD_6_H1). Drive Batch #3
(`1_6vEhF0gMgWJkPcsI4utfs2zm5qS1znA`): en översiktsdoc med alla 9 briefer
länkade till Notion (fullständig brief-text ligger i Notion, inte i Drive).
FORSTA_BATCH_KLAR-motsvarigheten för brief_runda är `CS_BATCH_KLAR` — loggad
i `agent/budgetlogg.jsonl`.

**Utfall, avläst 2026-09-05 (maximum):** PD_4_1, PD_5_1, PD_8_1, PD_9_1,
PD_10_1, SO_4_1, SO_5_1, SP_5_1, REV_1_1 alla under 100 kr spend — **för
tidigt, ingen dom.** SO_5_1 har 1 köp på 28 kr (ROAS 32×) — brus, inte en
vinnare. **PD_6_H1 och PD_7_H1 (briefade men) finns INTE i kontot** — inte
producerade av redigerarna än. **REV_2_1 är DISAPPROVED** i Meta (orsak
okänd i denna körning, flaggat för Axel). PD_8_1 har CTR 0,25 % (76 kr,
under signifikans men värt en snabb koll).

## Batch #4 — 2026-09-05 (`/cs`, brief_runda, huvudsession)

**Feedback loop (fullständig i `dna.md`, avsnitt "Uppdatering 2026-09-05"):**
1. **Top spendern PD_2 har negativ marginal-effektivitet:** 5 inkrementella
   köp sedan 2026-08-29 kostade 666 kr/st mot break-even 569 kr — sämre än
   break-even trots att livstids-ROAS (1,87) ser okej ut. Förklarar
   sannolikt varför kampanjen gick under break-even senaste 3 dagarna.
2. **PD_3 gick om PD_2_1 som störst vinstbidrag** (2 848 kr mot 1 763 kr) —
   fler köp har kommit in sedan förra avläsningen, CPA sjönk till 332 kr.
3. **Videornas öppningsruta saknar den vinnande statiska annonsens
   rubrik+aktion-kombo:** PD_2/PD_3/PD_1:s första bildruta visar produkten
   passivt (stillastående eller i händer), ingen text, ingen gnista. PD_1
   (svagast, 0 inkrementella köp på en vecka) är tydligast passiv.
4. Pris verifierat live mot baverbutiken.se: 909 kr / jämförpris 1 182 kr /
   spara 273 kr (23 %) — oförändrat sedan 2026-08-29.
5. Recensioner uppdaterade via Judge.me API: fortfarande 11 st, men en
   1-stjärnig recension tillkom 2026-08-31 ("För liten. Svag motor. Kraftig
   vibration.") — dna.md's "alla 4-5 stjärnor" är inte längre sant. Aldrig
   använd i copy; 8 femstjärniga citat kvar oanvända efter denna batch.

9 briefer (3 video + 1 statisk i rundan, 3 BOF-bilder, 2 review-bilder):

| Annons | Format | Hypotes | Källa |
|---|---|---|---|
| Beltgrinder_PD_11_H1 | video | Vinnarstaticens rubrik+gnist-moment porterat till video sekund 0-2 lyfter hook/CVR | teardown-mönster 1 (hypotes) |
| Beltgrinder_SP_6_H1 | video | Skeptiker-till-övertygad UGC-reaktion bygger mer förtroende än ren demo | dna.md Losing DNA "UGC-demo — obevisat", ny proof-mekanism |
| Beltgrinder_PD_12_H1 | video | Explicit före/efter-konflikt (kniv misslyckas → lyckas) isolerar konflikt som variabel | copy-regler.md "Konflikt driver allt" + teardown-mönster 2 |
| Beltgrinder_PD_13_1 | statisk | Split-bild (före/efter) testar ny visuell stil på den bevisade rubriken | ny visuell-stil-variabel, ej testad som statisk än |
| Beltgrinder_SO_6_1 | statisk (BOF) | Ärlig prisjämförelse (909/1182/spara 273) återupprepar CS_2_1:s bevisade mekanism utan lögnen | teardown-mönster 3 + dna.md rotorsak |
| Beltgrinder_PD_14_1 | statisk (BOF) | Proof-stack (2 citat + badge) testar multi-citat-format mot enkelcitat-vinnarna | ny variant av bevisat proof-format |
| Beltgrinder_PD_15_1 | statisk (BOF) | Bredd-invändning ("bara för knivar?") med verifierade produktfakta (trä/metall/smycken) | dna.md "Testa kontrollerat: 3-i-1-bredden" |
| Beltgrinder_REV_3_1 | statisk (review) | Verklig recension "Gör det lättare att få knivarna vassa" | Judge.me, verifierad 2026-09-05, ordagrant |
| Beltgrinder_REV_4_1 | statisk (review) | Verklig recension "Lätt att använda och tar inte mycket plats" | Judge.me, verifierad 2026-09-05, ordagrant |

Launch-regel: **separat test-ABO, lika budget per annons** (CLAUDE.md regel 11).

**Modellpolicy-avvikelse:** inget Agent/Task-verktyg med `model`-parameter
tillgängligt i denna körning för att spawna en separat copy-subagent (samma
avvikelse som loggats för Damasker Vandring, Kranskydd Frost 420D m.fl.).
Huvudsessionen skrev all svensk copy själv och körde tre-frågorstestet
explicit rad för rad i varje brief (se Notion-items).

**Levererad 2026-09-05:** 9 Notion-items i befintlig hub "Belt grinder
creative hub" (Status Draft, Typ Video/Image - Pending Approval, hela briefen
i sidan — verifierat med notion-fetch på PD_11_H1). ⚠️ Hubbens
`<ancestor-path>` är TOM — den ligger privat på workspace-nivå, inte i
teamspacet Bäverbutiken. Redigerarna ser den sannolikt inte. Drive Batch #4
(`1WtOvAfCxpG-xGrwbw5hneQLvSYn9XCjG`): en översiktsdoc med alla 9 briefer
länkade till Notion. `CS_BATCH_KLAR` loggas i `agent/budgetlogg.jsonl`.

**Utfall, avläst 2026-09-08 (maximum):** Ingen av batch #4:s 9 annonser syns
i Meta ännu (0 kr spend på samtliga) — se batch #5 nedan för status per
annons i Notion. Ingen dom möjlig. Hub-flaggan ovan ("privat, ser den
sannolikt inte") är **motbevisad** i dna.md 2026-09-08 — se rättelsen där.

## Batch #5 — 2026-09-08 (`/rond-auto` → CS-agent, brief_runda, 3 dagar sedan batch #4)

**Feedback loop (fullständig i `dna.md`, avsnitt "Uppdatering 2026-09-08"):**
1. **Rättelse:** PD_2 (top spendern)s marginal-CPA som såg försämrad ut
   2026-09-05 (666 kr) är nu 295 kr — klart under break-even. Enstaka
   avläsningar av marginal-CPA svänger; skriv inte in dem som permanent DNA
   efter bara en mätpunkt.
2. **Ny signal:** PD_3 och PD_2_1 (kampanjens två just nu bäst rankade
   annonser) fick **0 nya köp vardera** på 3 dygn trots fortsatt spend —
   möjlig utmattning på den bevisade mekaniken. Adresseras med en
   kontrollerad iteration (ny bladtyp, samma mekanik), inte en ny vinkel.
3. Batch #3:s PD_6_H1/PD_7_H1 (nu 6 dagar gamla) och HELA batch #4 (9
   annonser, 3 dagar gamla) saknas fortfarande i Meta. I Notion: 6 av batch
   #4:s statiska annonser står redan "Approved" men har 0 kr spend — väntar
   på att laddas upp. De 3 videorna står "In progress". Flaggat för Axel,
   ingen åtgärd tagen här (utanför CS-uppdraget).
4. Notion-hubbens tidigare varning ("privat, redigerarna ser den nog inte")
   är motbevisad denna körning — se dna.md.
5. Recensioner ombekräftade live via Judge.me API 2026-09-08: fortfarande
   11 st (1×1-stjärna, 10×5-stjärnor), oförändrat sedan 2026-08-31. 2 nya
   femstjärniga citat använda i denna batch, 4 kvar oanvända.
6. Shopify-connectorn var frånkopplad denna session — priset (909/1182/23 %)
   är inte ombekräftat idag, senast verifierat 2026-09-05.

9 briefer (3 video + 1 statisk i rundan, 3 BOF-bilder, 2 review-bilder):

| Annons | Format | Hypotes | Källa |
|---|---|---|---|
| Beltgrinder_PD_16_H1 | video | Auktoritets-/expertvinkel (bevisad tvärkategori i Grillklinikens playbook, ANGLE #1) lyfter hook rate — GISSNING för denna produkt, aldrig testad här | `docs/playbook.md` angle #1 "Auktoritet/story" |
| Beltgrinder_PD_17_H1 | video | Samma bevisade demo-mekanik (PD_2/PD_3) på en ny bladtyp (sax) ger ett färskt kreativt underlag mot utmattningssignalen | dagens observation (0 inkrementella köp på PD_3/PD_2_1) + vinnarmekanik |
| Beltgrinder_SP_7_H1 | video | Skeptiker-till-övertygad UGC i garage-miljö (ny miljö, undviker dubblett mot SP_4_H1/SP_6_H1:s kökslådetest) | dna.md Losing DNA "UGC-demo — obevisat", differentierad variant |
| Beltgrinder_PD_18_1 | statisk | Auktoritetsvinkeln porterad till den bevisade statiska layouten (PD_2_1) isolerar "angle" som enda variabel | vinnarformat PD_2_1 + PD_16_H1:s hypotes |
| Beltgrinder_PD_19_1 | statisk (BOF) | Livstidskostnad ("betala en gång") som nytt pris/erbjudande-koncept, skiljt från SO_6_1:s rabattversion | Axel 2026-09-02: obligatorisk BOF-serie, ny vinkel för att undvika dubblett |
| Beltgrinder_PD_20_1 | statisk (BOF) | Risk-reversal/garanti — kräver verifierad text från produktsidan innan produktion (Shopify otillgänglig denna session) | Axel 2026-09-02: obligatorisk BOF-serie |
| Beltgrinder_PD_21_1 | statisk (BOF) | Tid/bekvämlighet mot att skicka bort kniven — ny invändning, ingen påhittad konkurrentprissättning | Axel 2026-09-02: obligatorisk BOF-serie, ny vinkel mot PD_10_1 |
| Beltgrinder_REV_5_1 | statisk (review) | Verklig recension "Jag är väldigt nöjd med slipmaskinen." | Judge.me, verifierad 2026-09-08, ordagrant |
| Beltgrinder_REV_6_1 | statisk (review) | Verklig recension "En enkel maskin som fungerar som den ska." | Judge.me, verifierad 2026-09-08, ordagrant |

Launch-regel: **separat test-ABO, lika budget per annons** (CLAUDE.md regel 11).

**Modellpolicy-avvikelse:** inget Agent/Task-verktyg med `model`-parameter
tillgängligt i denna körning (samma avvikelse som batch #4). Huvudsessionen
skrev all svensk copy själv och körde tre-frågorstestet explicit rad för rad
i varje brief (se Notion-items).

**Levererad 2026-09-08:** 9 Notion-items i befintlig hub "Belt grinder
creative hub" (Status Draft, Typ Video/Image - Pending Approval, hela briefen
i sidan — verifierat med notion-fetch på PD_16_H1). Ingen Drive-mapp skapad
denna runda (utanför uppdragets scope denna gång — briefer levererade i
Notion only). `CS_BATCH_KLAR` loggas i `agent/budgetlogg.jsonl` av
huvudsessionen.

---

## Batch #5 — 2026-09-15 (`/rond-auto` steg 4b, `brief_runda`, `rundaAntal: 4` + 3 BOF)

**Kampanjstatus före batchen:** ACTIVE (läst med `ads_get_ad_entities` direkt
före). Budgeten skalades samma morgon 900 → 1 600 kr/dag av raketregeln
(ROAS 5,75 på 3 dagar mot break-even 1,73).

### Feedbackloop — livstid avläst 2026-09-15 (`date_preset: maximum`)

Kampanjen: 30 610,25 kr spend, 74 köp, ROAS 2,40. AOV 991 kr →
**break-even-CPA 573 kr**. Rangordnat på vinstbidrag `(573 − CPA) × köp`:

| Annons | Format | Spend | Köp | CPA | ROAS | **Vinstbidrag** |
|---|---|---|---|---|---|---|
| `Balteslipmaskin_PD_3` | video | 4 572 | 13 | 352 | 2,82 | **2 873 kr** |
| `Balteslipmaskin_PD_2` (top spender = benchmark) | video | 11 030 | 24 | 460 | 2,19 | 2 712 kr |
| `Beltgrinder_PD_19_1` | **statisk** | 1 049 | 6 | **175** | 5,38 | **2 388 kr** |
| `Balteslipmaskin_PD_2_1` | statisk | 2 485 | 7 | 355 | 2,93 | 1 526 kr |
| `Balteslipmaskin_CS_2_1` (PAUSED) | statisk | 4 571 | 10 | 457 | 2,11 | 1 160 kr |
| `Balteslipmaskin_PD_1` | video | 2 295 | 6 | 383 | 2,34 | 1 140 kr |

**Fyndet som styr batchen:** `Beltgrinder_PD_19_1` från batch #4 har **lägst CPA
i hela kampanjen — 175 kr mot benchmarkens 460 kr**, alltså 2,6× effektivare per
krona. Den är statisk. Det bekräftar mönster 1 i `dna.md` (statiskt prisformat
prekvalificerar bäst) en tredje gång, och batchen pressar just den upptäckten
i stället för att leta ny vinkel.

Under domgränsen, ingen dom: `G_1` (1 052 kr, 1 köp, ROAS 0,86 — blöder men
saknar köp för en dom), `CS_3` (850 kr, 2 köp), `CS_1` (705 kr, 1 köp).
`Beltgrinder_REV_2_1` står fortfarande **DISAPPROVED** i Meta.

### ⚠️ Recensionsfyndet — inga review-bilder i den här batchen

Judge.me lästes om 2026-09-15 med produktens egna id (2097110324; API:ts
`product_id`/`product_external_id`-filter mot Shopify-id ignoreras tyst och ger
hela butikens senaste 50 — den fällan kostade fyra anrop). Resultat: **11
recensioner, varav 10 med `source: "wizard"` och `verified: "not-yet"`** —
seedade, inte kundröster. Den **enda** organiska (`source: "web"`) är
**1 stjärna**: "För liten. Svag motor. Kraftig vibration." (Björn Henriksson).

Samma regel som redan gäller för Övervakningskameran (dna.md 2026-09-06)
tillämpas därför här: **review-bilder kan inte byggas** förrän en riktig kund
skrivit något. Batchen innehåller 0 review-bilder i stället för 2, och det är
ett avsteg med skäl, inte en miss. ⚠️ Konsekvens bakåt: `Beltgrinder_REV_1_1`
och `REV_2_1` från batch #3 bygger på wizard-citat — de rörs inte (de lever),
men Axel bör känna till det.

### Batchen — 7 briefer (3 video + 1 statisk i rundan, 3 BOF-bilder)

| Annons | Format | Hypotes | Isolerad variabel |
|---|---|---|---|
| `Beltgrinder_PD_22_H1` | video | PD_19_1:s vinnarkomposition överförd till rörlig bild | kompositionen, inte budskapet |
| `Beltgrinder_PD_23_H1` | video | 10-sekunderslöftet som nedräknande timer i bild i stället för påstående | bevisform: visa i stället för säg |
| `Beltgrinder_SP_8_H1` | video | SP-serien har aldrig fått budget — första riktiga UGC-testet (kökslådetestet) | talare/format |
| `Beltgrinder_PD_24_1` | statisk | PD_19_1:s exakta layout, nytt motiv (yxa/mejsel) | motivet, layouten låst |
| `Beltgrinder_BOF_1_1` | statisk, BOF | pris 909 kr / ord. 1 182 kr / spara 273 kr, ärligt | — |
| `Beltgrinder_BOF_2_1` | statisk, BOF | garanti och frakt | — |
| `Beltgrinder_BOF_3_1` | statisk, BOF | invändning "jag köper hellre nya knivar" som räknestycke | — |

**Modellpolicy följd:** all svensk copy skriven av en sonnet-subagent via
Agent-verktyget, med `docs/copy-regler.md` + DNA + hypotes i uppdraget.
Tre-frågorstestet redovisas rad för rad i varje brief.

> ⚠️ **Namnkrock 2026-09-15:** flera av batchens föreslagna AD-ID:n var redan
> upptagna av rader som låg i hubben (inte i Meta-kontot — där fanns de inte).
> Raderna ovan bär de omdöpta, lediga namnen. **Lärdom:** läs av upptagna AD-ID:n
> i BÅDE annonskontot och Notion-hubben innan du numrerar — hubben innehåller
> briefer som aldrig nått kontot, och de äger sitt nummer ändå.

---

## Feedbackloop + batch #5 — 2026-09-18 (`/rond-auto` steg 4b, brief-runda)

**Läget i kampanjen (livstid, avläst 2026-09-18 ur MagiBorsten 1867947880635861):**
36 197 kr spend · 93 köp · livstids-ROAS 2,54 mot break-even 1,73. Dagsbudget 1 900 kr (oförändrad — VANTA_KADENS).

**Datakvalitet:** `amount_spent × purchase_roas` summerat per annons stämmer mot
kampanjens egen intäkt inom avrundning; annonsurvalet täcker 95 % av kampanjens
spend. `omni_purchase_values` användes INTE (känd bugg, CLAUDE.md). Inga trasiga rader.

**Signifikansgrind (ANALYSMETOD steg 2c):** 8 annonser bedömbara. För tidigt, ingen dom: Balteslipmaskin_G_1 (1 063 kr/1 köp), CS_1 (717 kr/1 köp), SP_2 (470 kr/1 köp), CS_2 (312 kr/2 köp).

**Vinstbidrag — rangordnat på vinst, inte på ROAS eller CPA.**
Break-even-CPA räknas per annons på dess EGEN AOV (`intäkt/köp ÷ break-even-ROAS`),
aldrig på en blandad siffra:

| Annons | Status | Spend | Spend% | Köp | CPA | BE-CPA | ROAS | **Vinstbidrag** |
|---|---|---|---|---|---|---|---|---|
| Beltgrinder_PD_19_1 (statisk) | ACTIVE | 4 629 | 14 % | 16 | 289 | 554 | 3,31 | **+4 234 kr (27 %)** |
| Balteslipmaskin_PD_3 | ACTIVE | 4 714 | 14 % | 13 | 363 | 573 | 2,73 | +2 735 kr |
| Balteslipmaskin_PD_2 (top spender = benchmark) | ACTIVE | 11 315 | 33 % | 24 | 471 | 582 | 2,14 | +2 655 kr |
| Beltgrinder_PD_4_H1 (video) | ACTIVE | 722 | 2 % | 4 | 181 | 612 | 5,87 | +1 726 kr |
| Balteslipmaskin_PD_2_1 | ACTIVE | 2 529 | 7 % | 7 | 361 | 602 | 2,88 | +1 685 kr |
| Balteslipmaskin_CS_3 | ACTIVE | 878 | 3 % | 3 | 293 | 641 | 3,79 | +1 045 kr |
| Balteslipmaskin_CS_2_1 (falsk rabatt) | PAUSED | 4 571 | 13 % | 10 | 457 | 557 | 2,11 | +1 003 kr |
| Balteslipmaskin_PD_1 | ACTIVE | 2 339 | 7 % | 6 | 390 | 517 | 2,29 | +761 kr |

Summa vinstbidrag i urvalet: **+15 843 kr**.

**Mönster (data skild från hypotes):**
1. **BEVISAD — b020-statisken är produktens starkaste format.** PD_19_1 gör
   +4 234 kr på 14 % av spenden, PD_2_1 ytterligare +1 685 kr på samma layout.
   Instruktion: två nya statics i exakt den layouten (`PD_27_1`, `SO_7_1`), bara
   rubriken varierar.
2. **BEVISAD — PD_4_H1 är kontots mest effektiva annons och är utsvulten.**
   722 kr spend, ROAS 5,87, CPA 181 mot break-even-CPA 612. Instruktion: mata
   dess mekanik med två nya videor (`PD_25_H1`, `PD_26_H1`).
3. **BEVISAD — top spendern PD_2 är benchmark.** 33 % av spenden på ROAS 2,14.
   Den är lönsam och döms inte mot småannonserna; den är måttstocken.
4. **HYPOTES — 3-i-1-bredden är otestad som hook.** Varje bedömbar annons
   demonstrerar en kniv. `PD_26_H1` byter bara demoobjektet till en yxa;
   `SO_7_1` bär bredden i rubriken.

**Priset avläst live 2026-09-18** ur butikens produkt-JSON: 909 kr, jämförpris 1 182 kr → spara 273 kr = 23 %. "40 %" är fortsatt FÖRBJUDET — det var falskt.

### Batch #5 — 9 (4 video + 2 statiska i rundan, 3 BOF-bilder, 0 review-bilder) briefer, alla i Notion som Draft

| Annons | Format | Hypotes | Isolerad variabel |
|---|---|---|---|
| `Beltgrinder_PD_25_H1` | video | PD_4_H1:s mekanik med ny hook — 10-sekunderslöftet kvar | hooken |
| `Beltgrinder_PD_26_H1` | video | identisk film, demoobjektet är en yxa i stället för en kniv | demoobjektet |
| `Beltgrinder_SP_9_H1` | video | hela knivlådan slipad i EN obruten tagning med stoppur i bild | beviset |
| `Beltgrinder_CS_4_H1` | video | prisformatet ärligt: 909 / 1 182 kr, spara 273 kr (23 %) | erbjudandet |
| `Beltgrinder_PD_27_1` | statisk | b020-layouten, rubriken bär 10-sekunderslöftet | rubriken |
| `Beltgrinder_SO_7_1` | statisk | samma layout, rubriken bär 3-i-1-bredden | rubrikvinkeln |
| `Beltgrinder_BOF_4_1` | statisk, BOF | 909 kr mot 1 182 kr, spara 273 kr | — |
| `Beltgrinder_BOF_5_1` | statisk, BOF | 30 dagars pengarna-tillbaka, fri frakt, 5–10 arbetsdagar | — |
| `Beltgrinder_BOF_6_1` | statisk, BOF | "Mini"-invändningen besvarad ärligt — storlek och funktioner, ALDRIG styrka | — |

**Inga review-bilder.** 11 recensioner men bara en organisk, och den är 1 stjärna
("För liten. Svag motor"). `BOF_6_1` bär därför en uttrycklig regel: inga
påståenden om motorstyrka, kraft eller vibration.

**Modellpolicy följd (CLAUDE.md regel 6):** all svensk copy skriven av en
sonnet-subagent som fick DNA, hypotes, hook, formatkrav och `docs/copy-regler.md`.
Strategi, analys, namngivning och briefstruktur gjordes av huvudsessionen.
Tre-frågorstestet står i varje brief, rad för rad.

**Rättat av huvudsessionen efter subagenten:**
- Två briefer påstod "fri frakt över 300 kr". Produktsidan säger
  "Fri Frakt inom Sverige" — ändrat till den raden (se Fiskespöhållarens not om
  butikens toppbanner).
- Tre `Why`-rader bar tal subagenten räknat själv. Ersatta med körningens egna.

## Etiketter dag 7 (2026-09-21)

Etiketten är ingen dom (dom kräver 300 kr och 3 köp, kolumnen Bedömbar). Räknad på annonsens egna första vecka, backfillad 2026-09-21 ur Meta. Rådata: ETIKETT-raderna i agent/budgetlogg.jsonl.

| Annons | Batch | Typ | Etikett (7 d) | Andel | Spend | Köp | ROAS ad / kampanj | Bedömbar | Playbook |
|---|---|---|---|---|---|---|---|---|---|
| Beltgrinder_PD_19_1 | 5 | okänd | **BREAKTHROUGH** | 41 % | 2081 kr | 8 | 3,49 / 3,70 | ja | 80 % vidarebygg på denna: I1 tre hookar → I2 problemdel → I3 in media res |
| Beltgrinder_PD_20_1 | 5 | okänd | **LOSER** | 4 % | 204 kr | 0 | 0,00 / 3,70 | nej | släpp |
| Beltgrinder_PD_21_1 | 5 | okänd | **LOSER** | 1 % | 28 kr | 0 | 0,00 / 3,70 | nej | släpp |
| Beltgrinder_PD_18_1 | 5 | okänd | **LOSER** | 1 % | 33 kr | 0 | 0,00 / 3,70 | nej | släpp |
| Beltgrinder_REV_6_1 | 5 | okänd | **INGEN_LEVERANS** | — | 1 kr | 0 | 0,00 / 3,70 | nej | hooken föll — logga och släpp, aldrig ABO |
| Beltgrinder_REV_5_1 | 5 | okänd | **INGEN_LEVERANS** | — | 0 kr | 0 | 0,00 / 3,70 | nej | hooken föll — logga och släpp, aldrig ABO |
| Beltgrinder_SP_4_H1 | 2 | okänd | **LOSER** | 1 % | 60 kr | 0 | 0,00 / 1,81 | nej | släpp |
| Beltgrinder_PD_4_H1 | 2 | okänd | **LOSER** | 1 % | 28 kr | 0 | 0,00 / 2,20 | nej | släpp |
| Beltgrinder_PD_5_H1 | 2 | okänd | **LOSER** | 2 % | 93 kr | 0 | 0,00 / 2,20 | nej | släpp |
| Balteslipmaskin_CS_2_1 | 5 | okänd | **LOSER** | 19 % | 2254 kr | 5 | 2,26 / 2,62 | ja | släpp |
| Balteslipmaskin_G_2 | — | okänd | **INGEN_LEVERANS** | — | 0 kr | 0 | 0,00 / 2,62 | nej | hooken föll — logga och släpp, aldrig ABO |
| Balteslipmaskin_CS_2 | — | okänd | **KPI_WINNER** | 1 % | 130 kr | 1 | 11,60 / 2,62 | nej | 3 nya hookar, allt annat lika — den säljer men får inte spend |
| Balteslipmaskin_PD_2_1 | 5 | okänd | **KPI_WINNER** | 11 % | 1244 kr | 5 | 3,92 / 2,62 | ja | 3 nya hookar, allt annat lika — den säljer men får inte spend |
| Balteslipmaskin_SP_2 | — | okänd | **KPI_WINNER** | 2 % | 281 kr | 1 | 3,24 / 2,62 | nej | 3 nya hookar, allt annat lika — den säljer men får inte spend |
| Balteslipmaskin_SP_3 | — | okänd | **INGEN_LEVERANS** | — | 2 kr | 0 | 0,00 / 2,62 | nej | hooken föll — logga och släpp, aldrig ABO |
| Balteslipmaskin_PD_3 | 5 | okänd | **LOSER** | 25 % | 2882 kr | 7 | 2,58 / 2,62 | ja | släpp |
| Balteslipmaskin_CS_1 | — | okänd | **LOSER** | 0 % | 17 kr | 0 | 0,00 / 2,62 | nej | släpp |
| Balteslipmaskin_SP_1 | — | okänd | **INGEN_LEVERANS** | — | 4 kr | 0 | 0,00 / 2,62 | nej | hooken föll — logga och släpp, aldrig ABO |
| Balteslipmaskin_G_1 | 5 | okänd | **INGEN_LEVERANS** | — | 2 kr | 0 | 0,00 / 2,62 | nej | hooken föll — logga och släpp, aldrig ABO |
| Balteslipmaskin_G_3 | — | okänd | **LOSER** | 0 % | 34 kr | 0 | 0,00 / 2,62 | nej | släpp |
| Balteslipmaskin_PD_1 | 5 | okänd | **KPI_WINNER** | 11 % | 1318 kr | 4 | 2,69 / 2,62 | ja (prel.) | 3 nya hookar, allt annat lika — den säljer men får inte spend |
| Balteslipmaskin_G_2_1 | — | okänd | **INGEN_LEVERANS** | — | 0 kr | 0 | 0,00 / 2,62 | nej | hooken föll — logga och släpp, aldrig ABO |
| Balteslipmaskin_CS_3 | 5 | okänd | **LOSER** | 1 % | 119 kr | 0 | 0,00 / 2,62 | nej | släpp |
| Balteslipmaskin_SP_2_1 | — | okänd | **INGEN_LEVERANS** | — | 3 kr | 0 | 0,00 / 2,62 | nej | hooken föll — logga och släpp, aldrig ABO |
| Balteslipmaskin_PD_2 | 5 | okänd | **LOSER** ⚠ nära 30 % | 29 % | 3320 kr | 8 | 2,11 / 2,62 | ja | släpp |
| Beltgrinder_PD_9_1 | 3 | okänd | **INGEN_LEVERANS** | — | 4 kr | 0 | 0,00 / 1,43 | nej | hooken föll — logga och släpp, aldrig ABO |
| Beltgrinder_REV_1_1 | 3 | okänd | **INGEN_LEVERANS** | — | 1 kr | 0 | 0,00 / 1,43 | nej | hooken föll — logga och släpp, aldrig ABO |
| Beltgrinder_PD_10_1 | 3 | okänd | **LOSER** | 1 % | 88 kr | 0 | 0,00 / 1,68 | nej | släpp |
| Beltgrinder_SP_5_1 | 3 | okänd | **LOSER** | 1 % | 81 kr | 0 | 0,00 / 1,68 | nej | släpp |
| Beltgrinder_SO_5_1 | 3 | okänd | **KPI_WINNER** | 1 % | 31 kr | 1 | 28,98 / 1,68 | nej | 3 nya hookar, allt annat lika — den säljer men får inte spend |
| Beltgrinder_PD_8_1 | 3 | okänd | **LOSER** | 1 % | 90 kr | 0 | 0,00 / 1,68 | nej | släpp |
| Beltgrinder_PD_5_1 | 2 | okänd | **LOSER** | 2 % | 110 kr | 0 | 0,00 / 1,68 | nej | släpp |
| Beltgrinder_SO_4_1 | 2 | okänd | **LOSER** | 2 % | 99 kr | 0 | 0,00 / 1,68 | nej | släpp |
| Beltgrinder_PD_4_1 | 2 | okänd | **LOSER** | 2 % | 97 kr | 0 | 0,00 / 1,68 | nej | släpp |

## Feedbackloop + batch #6 — 2026-09-21 (`/rond-auto` steg 4b, brief-runda)

**Läget (livstid, avläst 2026-09-21):** 41 774 kr · 110 köp · ROAS 2,58 mot break-even
1,73 · AOV 981 kr ⇒ BE-CPA 567 kr. Dagsbudget oförändrad — SKALA uppskjuten
(`UPPSKJUTEN_GRANS`, nära zongränsen). Spendtjuven: INGEN_TJUV.

| Annons | Spend | Spend% | Köp | CPA | ROAS | **Vinstbidrag** |
|---|---|---|---|---|---|---|
| Beltgrinder_PD_19_1 (BREAKTHROUGH dag 7) | 7 798 | 21 % | 24 | 325 | 2,98 | **+5 806 kr** |
| Beltgrinder_PD_4_H1 | 1 992 | 5 % | 10 | 199 | 4,86 | +3 676 kr |
| Balteslipmaskin_PD_2 (top spender = benchmark) | 11 334 | 31 % | 25 | 453 | 2,21 | +2 838 kr |
| Balteslipmaskin_PD_3 | 4 725 | 13 % | 13 | 363 | 2,73 | +2 644 kr |
| Balteslipmaskin_PD_2_1 | 2 535 | 7 % | 7 | 362 | 2,88 | +1 433 kr |
| Balteslipmaskin_PD_1 | 2 350 | 6 % | 6 | 392 | 2,28 | +1 051 kr |
| Balteslipmaskin_CS_3 | 989 | 3 % | 3 | 330 | 3,36 | +712 kr |

**Mönster:** (1) BEVISAD — PD_19_1 (b020-layouten) är kampanjens motor och bär 3 198 kr
av de senaste tre dygnen på ROAS 2,48; (2) BEVISAD — PD_4_H1 är effektivast per krona
(CPA 199 mot 567); (3) BEVISAD — top spendern PD_2 är benchmark. Priset avläst live:
909 kr / 1 182 kr (spara 273 kr = 23 %; "40 %" är förbjudet).

### Batch #6 — 4 video + 2 bild i rundan, 0 BOF, 0 review — alla i Notion som Draft (Belt grinder creative hub)

| Annons | Format | Hypotes | Isolerad variabel | Källa |
|---|---|---|---|---|
| `Beltgrinder_PD_28_H1` | video | PD_4_H1:s mekanik med räknad hook: tre knivar, riktig tid `[TID]` | hooken | förälder PD_4_H1 |
| `Beltgrinder_PD_29_H1` | video | UGC "kökslådetestet", creator i egen synk | formatet (talare) | dna "Testa kontrollerat" + gissning |
| `Beltgrinder_PD_30_H1` | video | före/efter på EN kniv (tomaten), bara äkta material | bevistypen | dna "före/efter-egg" |
| `Beltgrinder_CS_5_H1` | video | öppnar på "909 kr. Inte 1 182 kr.", ärliga 23 % | erbjudandeöppning | förälder CS_2_1 |
| `Beltgrinder_PD_31_1` | bild | b020-layouten med före/efter-rubrik | rubriken | förälder PD_19_1 |
| `Beltgrinder_JF_1_1` | bild | brynsten mot maskin i två paneler (konflikt typ A) | vinkeln (jämförelse) | copy-regler + gissning |

**0 BOF** (BOF_3_1 5 dygn, BOF_4_1/5_1 2 dygn — ingen KPI_WINNER). **0 review-bilder**
(inga riktiga recensioner att citera). Feedback-raden Brief review 2026-09-18 läst;
dess tre regler i varje brief. Annonsidéer: inga rader. Copy av sonnet-subagent (regel 6).
⚠️ Regitabell + komponenttaggar (rond-auto 2.9/2.12, `f1bbba1`) saknas — se Fisk-loggen samma datum.

## Etiketter dag 7 (2026-09-22)

Annonser skapade 2026-09-15, egna första veckan 2026-09-15 – 2026-09-21 (7d_click). Etiketten är ingen dom: bedömbar = ≥ 300 kr OCH ≥ 3 köp.

| Annons | Batch | Typ | Etikett (7 d) | Andel | Spend | Köp | ROAS ad / kampanj | Bedömbar | Playbook |
|---|---|---|---|---|---|---|---|---|---|
| Beltgrinder_BOF_1_1 | 5 | okänd | **LOSER** | 0 % | 42 kr | 0 | 0,00 / 2,75 | nej | BOF — ingen spend-fix, räknas inte i frekvensen |
| Beltgrinder_BOF_2_1 | 5 | okänd | **LOSER** | 0 % | 19 kr | 0 | 0,00 / 2,75 | nej | BOF — ingen spend-fix, räknas inte i frekvensen |

## Batch #7 — 2026-09-22 (`/rond-auto` steg 4b, VIDAREBYGG på breakthrough Beltgrinder_PD_19_1)

Lärdom `L-120250148322650291`: PD_19_1 vinner på en kostnadsjämförelse läsaren gör i huvudet ("Betala en gång. Sluta betala för att slipa knivar."), utan mekanism. Lärdomens namn PD_20_1/PD_21_H1 var upptagna i hubben ⇒ PD_32_1/PD_33_H1 (lardomar.md rättad). Axels annonsidé (fars dag) byggd först som typ N. Priset läst live 2026-09-22: 909 kr / 1 182 kr (spara 273 kr, 23 %). Feedback-raden läst först. Copy av sonnet, regi av huvudsessionen. Spärrar: briefgranskning ✅ 4/4 (regi 6/6, 5/5), `lardom --brief` ✅ 4 BRIEF-rader. Hub `Belt grinder creative hub`, Status Draft.

| Annons | Format | Typ | Parent | Variabel | Hypotes | Förväntan | rev | brief → live |
|---|---|---|---|---|---|---|---|---|
| Beltgrinder_GT_1_H1 | video | N | — | köparen: presentköparen, fars dag 8 nov (Axels idé, Annonsidéer) | demon (PD_4_H1) håller även den som köper åt någon annan | första GT-datan på produkten; ≥ 300 kr spend innan dom | okänd | — |
| Beltgrinder_PD_32_1 | bild | I | PD_19_1 | underraden: kostnaden i knivar och sekunder i stället för "en gång" | jämförelsen landar utan gissning | CPA ≤ förälderns 361 kr (livstid) | okänd | — |
| Beltgrinder_PD_33_H1 | video | I | PD_19_1 | formatet: samma argument som video över PD_4_H1:s demo | argumentet bär i rörlig form | CPA mellan 256 (PD_4_H1) och 361 | okänd | — |
| Beltgrinder_CS_6_1 | bild | I | PD_19_1 | underraden: mekanism (7 hastigheter, 15°) i stället för ägande | en reason-to-believe adderar köp | CPA < 361 ⇒ varje kostnadsannons får en mekanismrad | okänd | — |

Efter dessa är PD_19_1:s tre iterationer förbrukade (deadline 2026-10-05). Inget kronbelopp för en sliptjänst finns i repot — därför skrivs inget.
