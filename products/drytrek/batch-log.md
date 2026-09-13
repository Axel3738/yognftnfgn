# Batch-logg — DryTrek (damasker)

OPS-butik nr 3. Butiks-id `drytrek`, produktnyckel `drytrek/damasker`, brand
**DryTrek**, domän drytrek.se. Produkten är samma fysiska damask som
Bäverbutiken säljer (`damasker-vandring-haller-sno-vata-grus-ute`).

Annonskonto: **MagiBorsten DK `915422744950975`** (OPS Factorys gemensamma
konto, SEK). Pixel `945311424682796`. Sidan läses ur kontot.
⚠️ Förväxla aldrig med MagiBorsten `1867947880635861` = Bäverbutiken.

Notion-hub: **Damasker vandring** `3cf270ab-908c-81a0-9b0d-c486f6467ce7`
(bär Bäverbutikens 33 äldre rader — se dna.md).

---

## Batch #1 — 2026-09-09 · ÄRVD från Bäverbutiken (`/ny-annonser`)

**Inte en ny batch i vanlig mening.** De 16 creativesen är Bäverbutikens
ACTIVE-annonser för samma produkt, brand-swappade, med omskriven copy och
ommärkta `DryTrek_Damasker_*`. Kampanj `DRYTREK_SE_Damasker Vandring |
BE-ROAS 1.60 | 2026-09-09`, CBO 1 000 kr/dag, 4 adsets (PD, SP, CS, G).
En NO-kampanj (`DRYTREK_NO_*`, 16 annonser, `Gamasjer`) byggdes samtidigt.

**Källa:** `Damasker Vandring | BE ROAS 1.60 | Launch 2026-08-29`
(MagiBorsten SE), 18 ACTIVE-annonser. 16 laddades upp; `FO_1_H1` och
`SP_4_H1` uteslöts (talet oläst — brand-detektorn 2026-09-09).
**Källans utfall vid avläsning 2026-09-11 (hela livstiden):** 14 511 kr,
65 köp, ROAS 2,30, verklig AOV 513 kr.

### Ärvd historik — vad källan faktiskt bevisade (ÄRVD, läst 2026-09-11)

Signifikansgrinden (≥ 300 kr OCH ≥ 3 köp) passeras av **två** annonser.

| Källannons | Spend | Köp | CPA | ROAS | Vinstbidrag (BE-CPA 243) | Vad det säger |
|---|---:|---:|---:|---:|---:|---|
| `Damasker_PD_1` | 10 671 kr | 56 | 191 kr | 2,77 | +2 937 kr | **Top spender och bevisad vinnare.** 74 % av spenden, 86 % av köpen. Demon av påtagningen. |
| `Damasker_SP_2` | 1 304 kr | 5 | 261 kr | 1,70 | −89 kr | UGC-vittnesmål. Över break-even-CPA — förlorare på data, men bara 5 köp. |
| `Damasker_PD_2` | 1 065 kr | 0 | — | 0 | — | Samma copy som PD_1, 0 köp. Under grinden på köp — men 4,4 × BE-CPA utan köp. |
| `Damasker_PD_3` | 440 kr | 1 | 440 kr | 0,88 | — | Under grinden. |
| `Damasker_SP_3` | 428 kr | 1 | 428 kr | 0,91 | — | Under grinden. Bästa hook (42,9 %) och hold (34,0 %) i källan. |
| 16 annonser under 210 kr | 603 kr | 2 | — | — | — | PD_2_1 201/1, CS_1 114/1, SP_1 107/0, FO_1_H1 49/0, resten < 30 kr. |

**Vinkelrangordning på spend i källan:** PD 12 401 kr · SP 1 885 kr ·
CS 132 kr · FO 49 kr · G 45 kr. CS, FO och G är i praktiken otestade.

### Vad som ändrades i överföringen

| Yta | Läge i källan | Åtgärd |
|---|---|---|
| Copy | 6 copyblock, 3 bröt mot järnreglerna | omskrivna 2026-09-09 (`factory/annonscopy/damasker-se.json`) — social proof bort, brådska bort, "30 dagars öppet köp" → 14 dagars ångerrätt, PD-hooken bytt |
| Talet i videon | 0 av 16 nämner brandet | inte omdubbat — ⚠️ PD_1:s VO säger "vattentäta, vindtäta, alla väder" (se dna.md) |
| Inbränd text | 0 fynd (OCR) | inget |
| Pris | 389 / 649 kr | **identiskt hos DryTrek** |
| Länk | baverbutiken.se | drytrek.se |
| Fraktvillkor | "fri frakt" | DryTrek: fri frakt SE + NO |

### Hypoteser att pröva i första `/cs`

1. Håller PD-vinkeln (ROAS 2,77 hos källan) när hooken är "Blötsnön börjar
   ovanför kängans kant." i stället för "Trött på snö, väta och grus i
   skorna?" Det är den enda substantiella ändringen i den bevisade vinnaren.
2. Kan SP/UGC-filmen bära utan social proof i texten (CVR 3,5 % i källan,
   men CPC 9 kr)?
3. CS (40 %-erbjudandet utan brådska), G (present) och FO (före/efter) har
   < 1 % av källans spend bakom sig. Inga slutsatser förrän 300 kr / 3 köp.

### Utfall vid avläsning 2026-09-11 (setup, körning nr 0)

Kampanjen körde 2026-09-09 → 2026-09-10, 2 dagsrader: **867 kr, 2 köp,
ROAS 0,90**. Budgetronden torrkörd: 0 ändringar (under grinden).
**Ingen av de 16 annonserna passerade grinden** — alla tre hypoteserna är
**obesvarade**. Per annons (data, ingen dom):

| Annons | Typ | Spend | Köp | CPA | Hook 3s | Hold | CTR | Status | Utfall mot hypotes |
|---|---|---:|---:|---:|---:|---:|---:|---|---|
| DryTrek_Damasker_G_2 | video | 218 kr | 0 | — | 35,2 % | 12,6 % | 1,51 % | ACTIVE | hyp 3: mest spend, 0 köp — för tidigt |
| DryTrek_Damasker_CS_2_1 | bild | 212 kr | 1 | 212 kr | — | — | 1,47 % | ACTIVE | hyp 3: 1 köp, CVR 5 % — brus |
| DryTrek_Damasker_PD_2_1 | bild | 111 kr | 0 | — | — | — | 1,02 % | ACTIVE | för tidigt |
| DryTrek_Damasker_SP_1 | video | 80 kr | 1 | 80 kr | 17,5 % | 18,8 % | 1,25 % | ACTIVE | hyp 2: 1 köp på 80 kr — brus |
| DryTrek_Damasker_CS_2 | video | 41 kr | 0 | — | 29,0 % | 13,8 % | 1,50 % | ACTIVE | för tidigt |
| DryTrek_Damasker_G_3 | video | 34 kr | 0 | — | 32,1 % | 13,3 % | 0,36 % | ACTIVE | för tidigt |
| DryTrek_Damasker_SP_2 | video | 34 kr | 0 | — | 31,7 % | 7,7 % | 0,61 % | ACTIVE | hyp 2 obesvarad — källans UGC-film har fått 34 kr |
| DryTrek_Damasker_SP_2_1 | bild | 34 kr | 0 | — | — | — | 0,35 % | ACTIVE | för tidigt |
| DryTrek_Damasker_CS_1 | video | 20 kr | 0 | — | 37,7 % | 13,1 % | 1,85 % | ACTIVE | för tidigt |
| DryTrek_Damasker_G_2_1 | bild | 16 kr | 0 | — | — | — | 6,59 % | ACTIVE | för tidigt |
| DryTrek_Damasker_PD_2 | video | 14 kr | 0 | — | 31,2 % | 4,2 % | 0 % | ACTIVE | för tidigt |
| DryTrek_Damasker_PD_1 | video | 13 kr | 0 | — | 32,4 % | 20,8 % | 0 % | ACTIVE | **hyp 1 obesvarad — källans vinnare har fått 13 kr** |
| DryTrek_Damasker_G_1 | video | 12 kr | 0 | — | 37,5 % | 13,3 % | 2,50 % | ACTIVE | för tidigt |
| DryTrek_Damasker_CS_3 | video | 12 kr | 0 | — | 14,0 % | 12,5 % | 0 % | ACTIVE | för tidigt |
| DryTrek_Damasker_PD_3 | video | 7 kr | 0 | — | 37,1 % | 7,7 % | 0 % | ACTIVE | för tidigt |
| DryTrek_Damasker_SP_3 | video | 7 kr | 0 | — | 55,0 % | 18,2 % | 2,50 % | ACTIVE | för tidigt |

Spend per vinkel: CS 286 · G 281 · SP 155 · PD 145 kr. CBO:n har gett den
bevisade vinkeln minst pengar — det är inte en dom över PD, det är
fördelningens brus efter två dygn.

---


### Utfall vid avläsning 2026-09-12 (körning nr 1, första skarpa Nattvakten, 14d)

Kampanjen 2026-09-09 → 2026-09-11, 3 dagsrader: **1 654 kr, 2 köp, ROAS 0,47**
mot break-even 1,60. Tredje dygnet: 787 kr, 0 nya köp. Under grinden — ingen
dom över kampanjen, budgeten orörd (1 000 kr). **Bedömbara annonser: 0 av 16.**
Alla tre hypoteserna är fortfarande **obesvarade**.

**Genomfört av ronden:** `DryTrek_Damasker_G_2_1` (bild, present-vinkeln)
**PAUSAD** — ny annons-regeln: 480 kr (≥ 3 × target-CPA 146 kr) och 0 köp.
Tillbakaläst ACTIVE → PAUSED, loggrad i `factory/budgetlogg.jsonl`. Första
försöket stoppades av en bugg i `tools/meta-lib.mjs pausa()` (begärde
`daily_budget` på ett ad-id) — rättad samma natt, andra körningen gick.

| Annons | Typ | Spend 14d | Köp | Hook 3s | Hold | CTR | CPC | Status | Mot hypotes |
|---|---|---:|---:|---:|---:|---:|---:|---|---|
| G_2_1 | bild | 480 kr | 0 | — | — | 5,5 % | 3,5 kr | **PAUSAD 2026-09-12** | hyp 3: billigaste klicken i kampanjen, noll köp — klick utan köpavsikt |
| CS_2_1 | bild | 297 kr | 1 | — | — | 1,3 % | 12,4 kr | ACTIVE | hyp 3: 1 köp, 3 kr från grindens spendkrav |
| G_2 | video | 291 kr | 0 | 35,9 % | 12,9 % | 1,4 % | 12,1 kr | ACTIVE | hyp 3: hooken håller, hold lägst av videorna, 0 köp |
| PD_2_1 | bild | 121 kr | 0 | — | — | 1,1 % | 10,1 kr | ACTIVE | för tidigt |
| CS_1 | video | 98 kr | 0 | 31,0 % | 19,5 % | 1,0 % | 13,9 kr | ACTIVE | för tidigt |
| SP_1 | video | 87 kr | 1 | 17,5 % | 18,5 % | 1,1 % | 10,9 kr | ACTIVE | hyp 2: 1 köp, sämsta hooken — brus |
| CS_3 | video | 52 kr | 0 | 21,6 % | 26,3 % | 1,1 % | 17,4 kr | ACTIVE | för tidigt |
| CS_2 | video | 51 kr | 0 | 27,9 % | 19,4 % | 1,2 % | 17,0 kr | ACTIVE | för tidigt |
| SP_2 | video | 40 kr | 0 | 30,0 % | 12,3 % | 1,1 % | 19,8 kr | ACTIVE | hyp 2 obesvarad — källans UGC-film har fått 40 kr |
| G_3 | video | 37 kr | 0 | 31,4 % | 14,0 % | 0,3 % | 36,8 kr | ACTIVE | för tidigt |
| SP_2_1 | bild | 35 kr | 0 | — | — | 0,7 % | 17,4 kr | ACTIVE | för tidigt |
| PD_2 | video | 18 kr | 0 | 28,2 % | 13,8 % | 0 % | — | ACTIVE | för tidigt |
| PD_1 | video | 15 kr | 0 | 31,3 % | 19,2 % | 0 % | — | ACTIVE | **hyp 1 obesvarad — källans vinnare har fått 15 kr på 3 dygn** |
| G_1 | video | 15 kr | 0 | 41,2 % | 14,3 % | 2,0 % | 15,0 kr | ACTIVE | för tidigt |
| SP_3 | video | 9 kr | 0 | 49,1 % | 19,2 % | 1,9 % | 8,7 kr | ACTIVE | för tidigt |
| PD_3 | video | 8 kr | 0 | 39,5 % | 13,3 % | 0 % | — | ACTIVE | för tidigt |

**Spend per vinkel, 14d:** G 823 kr (50 %, 0 köp) · CS 498 kr (1 köp) ·
SP 170 kr (1 köp) · PD 163 kr (0 köp). Metas CBO ger present-vinkeln hälften
av pengarna och den bevisade demon en tiondel. G-adsetet ligger på 3,4 ×
break-even-CPA utan ett enda köp — men det är fyra annonser under grinden,
inte en dom. Adset-fördelning rör ronden inte (dna.md hypotes 4, OPS).

**Axels beslut 2026-09-12 (dagtid):** adsetet `DRYTREK_SE_G` pausat manuellt
(ACTIVE → PAUSED, tillbakaläst 13:51). G_1, G_2, G_3 och G_2_1 ligger nu utanför
CBO:n — budgeten går till PD, SP och CS. Loggrad i `factory/budgetlogg.jsonl`.
⚠️ PAUSED med spend = beslut: ronden får aldrig slå på dem igen.

---

## Batch #2 — 2026-09-12 · första briefronden (`/notionscalercs drytrek`, körning nr 1)

**Kallstart.** 0 bedömbara DryTrek-annonser → ingen feedback-loop; batchen
byggs på ärvda vinnare (varianter) + Axels prioriterade vinklar (koncept).
Ingen redigerare tilldelad → **7 briefer** (en dags produktion), inte kadensens 21.
Copy: A/B Fable mot Sonnet (`copy_modell: ab`), via Agent-verktyget.
Hubb: Damasker vandring `3cf270ab-908c-81a0-9b0d-c486f6467ce7`, status `Draft`.
Lediga AD-ID:n lästa ur OPS-kontot (DryTrek_Damasker_*) OCH hubbens 33 rader
(Damasker_* t.o.m. PD_11, SP_5, CS_5, G_3, FO_1, BOF_9).
Pris hämtat från drytrek.se 2026-09-12: 389 kr (jämför 649 kr).

| # | Namn | Typ | Variant/koncept | Förälder / källa | Isolerad variabel | Hypotes | Copy |
|---|---|---|---|---|---|---|---|
| 1 | `DryTrek_Damasker_PD_12_H1` | video | variant | PD_1 (ärvd, 11 366 kr, 58 köp, ROAS 2,70) | manus: VO utan "vattentät/vindtät/alla väder/några sekunder", fästena i bildens ordning | CPA ≤ live PD_1 på ≥ 3 köp vardera; hold ≥ 22,8 % | fable |
| 2 | `DryTrek_Damasker_PD_12_H2` | video | variant | PD_12_H1 | hook: källans originalfråga "Trött på snö, väta och grus i skorna?" mot "Blötsnön börjar ovanför kängans kant." | hook rate H2 vs H1 — svarar på copyfilens egen varning | fable (manus delat med H1; hooken given) |
| 3 | `DryTrek_Damasker_SP_6_H1` | video | variant | SP_2 (ärvd, 1 360 kr, 5 köp, CVR 3,5 %, CPC 9 kr) | hook: pratad öppning → tyst demo-närbild (kroken i snörningen) + caption | CPC < 9,18 kr med CVR ≥ 3 % | sonnet |
| 4 | `DryTrek_Damasker_PD_12_1` | bild | variant | PD_1 | format: video → statisk trestegsbild (krok/rem/kardborre) | CTR ≥ 1,5 %, CPA < 243 kr; ärvt mönster 4 (bilderna fick aldrig chansen) | fable |
| 5 | `DryTrek_Damasker_SP_7_H1` | video | koncept | ärvd SP_2-rad "Jag testade de här på hundpromenaden i morse" (1 360 kr, −145 kr vinstbidrag) — **svag källa, hypotes** | — | hook rate ≥ 31,2 % (SP_2), CPA < 243 kr | sonnet |
| 6 | `DryTrek_Damasker_PD_13_H1` | video | koncept | ⚠️ **gissning** — Axels vinkel nr 2 ("testet"), 0 kr data | — | hold ≥ 22,8 %, CPA < 243 kr. Kräver ny film — filmas på riktigt eller görs inte | fable |
| 7 | `DryTrek_Damasker_FO_2_H1` | video | koncept | ⚠️ **gissning** — Axels vinkel nr 3 (före/efter), FO_1_H1 49 kr/0 köp | — | CTR ≥ 2,44 % (PD_1), CPA < 243 kr. Kräver ny film | sonnet |

Copy-A/B: 4 fable (1, 2, 4, 6) / 3 sonnet (3, 5, 7). Avvikelse från
"varannan": PD_12_H1/H2 delar manus med flit — bara hooken får skilja, och
båda hookarna är givna, inte skrivna. Tre-frågorstestet står i varje brief
(avsnitt 8). ❌ som gick ut ändå, med skäl: prisrader ("389 kr per par, fri
frakt …" — fråga 3, går aldrig att göra unika), SP_2:s inspelade kreatörsljud
(låst), och kontrollhooken i PD_12_H2 (det är poängen). Sonnet fick ett
omtag på två rader (SP_7 PROOF, FO_2 PROBLEM) — båda 3 × ✅ efteråt.

Backlog: 6 av 8 koncept plockade (`[använd i batch #2]`), 2 väntar (grus,
signalfärg — batchen var full).
VARIABELTAGGAR står överst i varje brief (`products/drytrek/batch-02/…/brief.md`).
Notion-resultat: `products/drytrek/batch-02/notion-resultat.json` (7 skapade, 0 fel).

### Utfall vid avläsning 2026-09-13 (körning nr 2, 14d) — batch #1

Kampanjen 4 dagsrader: **2 778 kr, 4 köp, ROAS 0,56** mot break-even 1,60.
Dygn: 09-09 16 kr/0 · 09-10 856 kr/2 · 09-11 787 kr/0 · 09-12 1 118 kr/2.
Kampanjen har passerat grinden (≥ 300 kr, ≥ 3 köp) → **budget sänkt 1 000 →
700 kr** (vinst 3d −115 %, regeln "sänk under 16 %"). **Bedömbara annonser:
0 av 16** — ingen enskild annons har 3 köp. Hypoteserna obesvarade.

**Genomfört av ronden 2026-09-13:** `CS_2_1` (bild, 550 kr, 1 köp, CPA 550)
och `CS_1` (video, 463 kr, 1 köp, CPA 463) **PAUSADE** — ny annons-regeln
(≥ 3 × target-CPA 146 kr utan vinst). Tillbakalästa, loggade.
G-adsetet står PAUSED sedan Axels beslut 2026-09-12 (G_1/G_2/G_3 ADSET_PAUSED).

| Annons | Typ | Spend 14d | Köp | CPA | Hook 3s | Hold | CTR | CPC | Status 09-13 |
|---|---|---|---:|---:|---:|---:|---:|---:|---|
| CS_2_1 | bild | 550 kr | 1 | 550 | — | — | 1,2 % | 12,0 kr | **PAUSAD (ronden)** |
| G_2_1 | bild | 485 kr | 0 | — | — | — | 5,5 % | 3,5 kr | PAUSAD (09-12) |
| CS_1 | video | 463 kr | 1 | 463 | 32,2 % | 19,7 % | 1,3 % | 10,1 kr | **PAUSAD (ronden)** |
| G_2 | video | 449 kr | 0 | — | 36,6 % | 13,0 % | 1,5 % | 11,8 kr | ADSET_PAUSED (Axel) |
| PD_2_1 | bild | 253 kr | 0 | — | — | — | 1,2 % | 8,7 kr | ACTIVE |
| CS_3 | video | 110 kr | 0 | — | 26,0 % | 32,6 % | 1,0 % | 21,9 kr | ACTIVE |
| SP_2_1 | bild | 92 kr | 1 | 92 | — | — | 1,3 % | 10,2 kr | ACTIVE |
| SP_1 | video | 90 kr | 1 | 90 | 18,3 % | 19,3 % | 1,1 % | 11,2 kr | ACTIVE |
| CS_2 | video | 86 kr | 0 | — | 27,0 % | 23,6 % | 1,0 % | 21,4 kr | ACTIVE |
| SP_2 | video | 55 kr | 0 | — | 29,1 % | 13,3 % | 1,1 % | 18,4 kr | ACTIVE |
| G_3 | video | 45 kr | 0 | — | 32,4 % | 12,7 % | 0,3 % | 45,0 kr | ADSET_PAUSED |
| PD_2 | video | 29 kr | 0 | — | 25,4 % | 12,8 % | 0 % | — | ACTIVE |
| G_1 | video | 26 kr | 0 | — | 44,9 % | 19,4 % | 1,4 % | 25,6 kr | ADSET_PAUSED |
| PD_1 | video | 21 kr | 0 | — | 31,3 % | 17,1 % | 0,9 % | 10,5 kr | ACTIVE — **källans vinnare: 21 kr på 4 dygn** |
| PD_3 | video | 14 kr | 0 | — | 42,9 % | 19,0 % | 0 % | — | ACTIVE |
| SP_3 | video | 13 kr | 0 | — | 44,4 % | 17,9 % | 1,6 % | 12,7 kr | ACTIVE |

Spend per vinkel 14d: CS 1 208 kr (2 köp) · G 1 005 kr (0) · PD 317 kr (0) ·
SP 249 kr (2). CBO:n gav erbjudandet och presenten 80 % av pengarna; demon
(källans bevis) 11 %. Kvar aktiva efter natten: PD_1/2/3, PD_2_1, SP_1/2/3,
SP_2_1, CS_2, CS_3 — 10 annonser.

### Batch #2 — status 2026-09-13 (en dag gammal)

Jasper Tomboc (tilldelad 2026-09-12) **levererade 6 av 7 samma dag**:
PD_12_H1, PD_12_H2, SP_6_H1, SP_7_H1, PD_13_H1, FO_2_H1 ligger i hubben med
Drive-länk (`Link for approval:`) och status `Creative strat review`
(redigerad 08:41–08:48 UTC). `PD_12_1` (bild) står kvar i `Draft`.
**Inget av det är live** — ingen data, inget utfall. ⚠️ Tre av de sex
(PD_13_H1, FO_2_H1, SP_7_H1) briefades som "kräver ny film" — vad Jasper
byggde dem av är inte kontrollerat; det är leveransrundans brief-QA.
⚠️ `/ops-leverans` plockar bara `To be Reviewed` — raderna i
`Creative strat review` går inte upp av sig själva. DryTrek har dessutom
ingen leveransrunda/översättning byggd än (CLAUDE.md-tabellen 2026-09-13).

**Utanför batcherna:** 18 bildrader `DryTrek_Damasker_PD_14_1 … PD_14_18`
skapade 2026-09-12 av integrationen "Bäverbutiken RUTINER" (`/ops-bild`,
en rutin som inte finns i `.claude/commands/` på main) — 17 i
`To be Reviewed`, PD_14_3 i `Draft` (gul renderades som neongrön). En
färg per bild, "which colours sell". AD-ID PD_14 är därmed upptaget.

---

## Batch #3 — 2026-09-13 · andra briefronden (`/notionscalercs drytrek`, körning nr 2)

**Fortfarande kallstart** (0 bedömbara), men nu med redigerare: **Jasper
Tomboc** ⇒ kadensens **21** (11 varianter / 10 koncept, 4 bilder). Batch #2
är levererad men inte live, så varianterna bygger på batch #2:s hypoteser
(hook-tester på samma film = billigaste lärdomen) och på ärvda PD_1/SP_2.
Copy: A/B Fable (10) mot Sonnet (11), Agent-verktyget. Hubb: Damasker
vandring, status `Draft`. Pris hämtat från drytrek.se 2026-09-13: 389 kr
(jämför 649 kr). Lediga AD-ID:n ur kontot + hubbens 58 rader: PD_15+,
SP_8+, FO_3, CO_3, CI_3, ID_2, BOF_10.

| # | Namn | Typ | Variant/koncept | Förälder / källa | Isolerad variabel | Hypotes (KPI) | Copy |
|---|---|---|---|---|---|---|---|
| 1 | `DryTrek_Damasker_PD_12_H3` | video | variant | Variant of PD_12_H1 (batch #2, delivered by Jasper 2026-09-12, not live yet). Isolated variable: the hook (00:00–00:03). Third sibling after H1 (claim | The hook: claim → number. | Hook rate vs PD_12_H1 and H2 (3-second plays / impressions), then CPA on ≥ 3 purchases each. | fable |
| 2 | `DryTrek_Damasker_PD_12_H4` | video | variant | Variant of PD_12_H1. Isolated variable: the hook. Source of the hook idea: Axel's angle nr 4 (grus) in `factory/produkter/damasker.yaml` — ⚠️ 0 kr of  | The hook: claim → negation on the grit ritual. | Hook rate vs PD_12_H1/H2/H3, then CPA on ≥ 3 purchases. | fable |
| 3 | `DryTrek_Damasker_PD_12_2` | bild | variant | Format sibling of PD_12_1 (batch #2, still Draft). Isolated variable: layout and text amount (three panels + 7 words → one close-up + ≤5 words). | Layout: three panels → one close-up; text 7 → ≤5 words. | CTR vs PD_12_1 and CPA under 243 kr on ≥ 3 purchases. | fable |
| 4 | `DryTrek_Damasker_PD_12_3` | bild | variant | Format sibling of PD_12_1. Isolated variable: text amount (7 words → none). | Text amount: 7 words → none. | CTR and CPA vs PD_12_1 on ≥ 3 purchases each. | fable |
| 5 | `DryTrek_Damasker_SP_6_H2` | video | variant | Sibling of SP_6_H1 (batch #2, delivered). Isolated variable: which fastener opens the film (hook in lacing → strap under sole). | The opening close-up: hook in lacing → strap under sole. | CPC vs SP_6_H1 with CVR held (≥ 3 % on ≥ 3 purchases). | sonnet |
| 6 | `DryTrek_Damasker_SP_8_H1` | video | variant | Variant of SP_2 (inherited: 1 360 kr, 5 purchases, hold 23,1 %). Isolated variable: length (27 s → 15 s). | Length: 27 s → 15 s (PROBLEM and PROOF beats cut). | Thruplay rate vs SP_2 (≥ 23,1 %) and CPA on ≥ 3 purchases. | sonnet |
| 7 | `DryTrek_Damasker_SP_7_H2` | video | variant | Variant of SP_7_H1 (batch #2, delivered). Isolated variable: the hook. | The hook: product first → the dog first. | Hook rate vs SP_7_H1, then CPA on ≥ 3 purchases. | sonnet |
| 8 | `DryTrek_Damasker_SP_7_1` | bild | variant | Format variant of SP_7_H1. Isolated variable: format (video → image). | Format: video → static. | CTR ≥ 1,5 % and CPA under 243 kr on ≥ 3 purchases, compared to SP_7_H1. | sonnet |
| 9 | `DryTrek_Damasker_PD_13_H2` | video | variant | Variant of PD_13_H1 (batch #2, delivered — ⚠️ briefed as needing real new footage; check the delivered file shows a real pour and a real dry sock befo | The hook: water first → dry sock first. | Hook rate vs PD_13_H1, hold ≥ 22,8 %, CPA on ≥ 3 purchases. | fable |
| 10 | `DryTrek_Damasker_FO_2_1` | bild | variant | Format variant of FO_2_H1 (batch #2, delivered — ⚠️ briefed as needing new footage; use the real socks from that film). Isolated variable: format. | Format: video → static split. | CTR ≥ 2 % and CPA under 243 kr on ≥ 3 purchases, vs FO_2_H1. | sonnet |
| 11 | `DryTrek_Damasker_FO_2_H2` | video | variant | Variant of FO_2_H1 (batch #2, delivered). Isolated variable: the hook / proof order. Same logic as PD_13_H2. | The hook: legs on the trail → the two socks. | Hook rate vs FO_2_H1, CTR ≥ 2,44 %, CPA on ≥ 3 purchases. | sonnet |
| 12 | `DryTrek_Damasker_PD_15_H1` | video | koncept | New concept. Source: Axel's priority angle nr 4 in `factory/produkter/damasker.yaml` ("skaka ur kängan vid varje paus, mot noll stopp"). ⚠️ 0 kr of da | New concept — no parent. | Hook rate ≥ 31 % (PD_1 live) and CPA under 243 kr on ≥ 3 purchases. | fable |
| 13 | `DryTrek_Damasker_ID_2_H1` | video | koncept | New concept. Source: product benefit nr 5 in `factory/produkter/damasker.yaml` ("Syns i terrängen …") and the Q4 bonus (reflexband) that builds on the | New concept — no parent. | CTR ≥ 2,44 % (identity ads trade hook rate for click intent) and CPA under 243 kr on ≥ 3 purchases. | sonnet |
| 14 | `DryTrek_Damasker_CO_3_H1` | video | koncept | New concept. Sources: product problem nr 4 (product page) + inherited SP_2 proof line "De satt kvar hela vägen" (1 360 kr, 5 purchases). HYPOTES (a li | New concept — no parent. | Hold (thruplay) ≥ 22,8 % and CPA under 243 kr on ≥ 3 purchases. | fable |
| 15 | `DryTrek_Damasker_FO_3_H1` | video | koncept | New concept. Source: product problem nr 3 and benefit nr 3 (`factory/produkter/damasker.yaml`). ⚠️ 0 kr of data — GISSNING. | New concept — no parent. | CTR ≥ 2,44 % and CPA under 243 kr on ≥ 3 purchases; compared with FO_2_H1 (socks). | sonnet |
| 16 | `DryTrek_Damasker_PD_16_H1` | video | koncept | New concept. Sources: FAQ nr 2 on the product page + the live PD copy line "Kardborre hela vägen upp - på och av med kängan kvar på" (part of the copy | New concept — no parent. | Hold (thruplay) ≥ 22,8 % (people watch a real-time demo to the end or not) and CPA under 243 kr on ≥ 3 purchases. | fable |
| 17 | `DryTrek_Damasker_CI_3_H1` | video | koncept | New concept. Source: the live PD copy line "Håller snön ute nerifrån - där den annars kryper in" — part of the copy behind the inherited winner (10 67 | New concept — no parent. | Hold (thruplay) ≥ 22,8 % and CPA under 243 kr on ≥ 3 purchases. | sonnet |
| 18 | `DryTrek_Damasker_PD_17_H1` | video | koncept | New concept. Source: season (it is 2026-09-13) + product benefit nr 3 ("Byxbenet håller sig torrt genom blöt sly och högt gräs"). ⚠️ GISSNING — no dat | New concept — no parent. Season swap: snow → autumn wet. | Hook rate vs PD_12_H1 (snow-led) and CPA under 243 kr on ≥ 3 purchases. | fable |
| 19 | `DryTrek_Damasker_SP_9_H1` | video | koncept | New concept. Source: target group "skogsfolk" in the product file + the situation pattern from SP_7_H1 (hypotes, not yet measured). ⚠️ GISSNING — 0 kr | New concept — no parent. | Hook rate ≥ 31,2 % (SP_2) and CPA under 243 kr on ≥ 3 purchases; read together with SP_7_H1. | sonnet |
| 20 | `DryTrek_Damasker_BOF_10_H1` | video | koncept | New concept. Source: FAQ nr 1 on the product page ("Passar de min kängstorlek?") — an objection real enough that the page answers it. HYPOTES. | New concept — no parent. | CVR ≥ 3 % (objection ads are judged on conversion, not hook) and CPA under 243 kr on ≥ 3 purchases. | fable |
| 21 | `DryTrek_Damasker_BOF_11_H1` | video | koncept | New concept. Sources: FAQ nr 4 on the product page + inherited SP_2 line "De satt kvar hela vägen. Inget krångel, inget som gled ner." (1 360 kr). HYP | New concept — no parent. | CVR ≥ 3 % and CPA under 243 kr on ≥ 3 purchases; read with BOF_10_H1. | sonnet |

Copy-A/B: hook-only-varianter skrivs av samma modell som föräldern (fable
för PD_12/PD_13-familjen, sonnet för SP_6/SP_7/FO_2) så manuset inte blandar
modeller. Tre-frågorstestet står i varje brief (avsnitt 8).
Backlog: grus och signalfärg plockade (`[använd i batch #3]`) — backloggen
är tom på koncept.
Notion-resultat: `products/drytrek/batch-03/notion-resultat.json`.

*(Utfall skrivs vid nästa briefdag. Grinden: ≥ 300 kr OCH ≥ 3 köp per annons.)*

## Batch #3b (färgvarianterna) — 2026-09-12 · Axels idé: en bildannons per färgvariant (`/ops-bild drytrek`, samma dag som batch #2)

**Ingen redigerare, ingen väntan.** Idén kom från Axel i chatten 2026-09-12
("bara vit bakgrund och sen produkten, en av varje färgvariant"). Byggd och
genererad samma dag av den nya motorn `factory/ops-bild.mjs` (kie.ai
`google/nano-banana-edit` med produktfotot `damask-se-NG-ren.jpg` som
formreferens, bilden lagd i Notion via REST med `tools/notion-fil-upp.mjs`).
Copy: sonnet (`products/drytrek/batch-03-farger/copy-sonnet.json`, tre-frågorstestet
3 × ✅ på varje rad). Pris 389 kr per par ur `factory/produkter/damasker.yaml`.
Hubb: Damasker vandring, rader `DryTrek_Damasker_PD_14_1 … _18` — **ETT
koncept, 18 varianter, ett adset** (leveransrundan döper adsetet på
konceptbokstäverna `PD`). Isolerad variabel: **färgen**. Ingen text på bilden.

| # | Namn | Färg | Utfall i QA | Status |
|---|---|---|---|---|
| 1 | `PD_14_1` | Neongrön | ✅ | To be Reviewed |
| 2 | `PD_14_2` | Orange | ✅ efter en omgenerering (kängans tryck "CANSPORT" satt kvar första gången) | To be Reviewed |
| 3 | `PD_14_3` | Gul | ❌ **två försök blev neonlime** = samma som neongrön. Referensfotot styr färgen. Underkänd, ligger kvar i Draft med kommentar | Draft |
| 4–13 | `PD_14_4 … _13` | Svart, Grå, Marinblå, Blå, Ljusblå, Röd, Lila, Rosa, Brun, Vit | ✅ (grå saknar ett snörlås — godtagbart) | To be Reviewed |
| 14 | `PD_14_14` | Olivgrön | ✅ efter en omgenerering (leverantörsetiketten "AYXSEE" följde med ur OL-fotot — togs bort som referens) | To be Reviewed |
| 15–16 | `PD_14_15 … _16` | Kamouflage grön, kamouflage svart | ✅ | To be Reviewed |
| 17–18 | `PD_14_17 … _18` | Blå/neongrön, cerise/neongrön | ✅ — ⚠️ **gissning på utseendet**: butiken saknar foto, prompten satte neongrön på frontremsan | To be Reviewed |

**17 av 18 klara → live 13:40 2026-09-13 via `/ops-leverans drytrek`
(SE), Norge 15:40.** Kostnad: 21 kie.ai-genereringar, noll redigerartid.

Lärdomar (inskrivna i dna.md-rotorsakerna vid nästa `/cs`):
- Källfotona bär leverantörsetiketten **AYXSEE** och kängmärket **CANSPORT** —
  prompten måste uttryckligen radera båda, och en variant-egen referensbild
  med etikett (OL) drar in etiketten igen. Använd det rena NG-fotot som enda
  formreferens.
- Bildmodellen kan inte flytta färgen långt från referensen: gul blev
  neonlime två gånger. Nästa försök för Gul: riktigt foto av gula varianten,
  eller textgenerering utan referens (då ser produkten inte ut som produkten).

Hypotes att läsa av vid nästa briefdag: vinstbidrag per färg `(243 − CPA) × köp`
inom adsetet `PD`; topspendern är benchmark. Grinden ≥ 300 kr OCH ≥ 3 köp per
variant — med 17 varianter i ett adset tar det tid; döm inte färger på 50 kr.
