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
| 7 | `DryTrek_Damasker_FO_2_H1` | video | koncept | ⚠️ **gissning** — Axels vinkel nr 3 (före/efter), FO_1_H1 49 SEK/0 purchases | — | CTR ≥ 2,44 % (PD_1), CPA < 243 kr. Kräver ny film | sonnet |

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

---

## Leveransen 2026-09-13 — 23 annonser LIVE i DRYTREK_SE (`/ops-leverans drytrek`, första körningen)

Kördes för hand ur setup-sessionen samma förmiddag som rutinen byggdes, för
att färgbilderna inte skulle stå still ett dygn till. Kampanjen
`DRYTREK_SE_Damasker Vandring | BE-ROAS 1.60 | 2026-09-09` [ACTIVE], CBO
**700 kr/dag**, pris **389 kr** läst live ur drytrek.se vid körningen.

| Vad | Antal | Adset | Status vid tillbakaläsning |
|---|---|---|---|
| Färgbilder `PD_14_1 … _18` (utom `_3`, gul) | 17 | `DRYTREK_SE_PD` | ACTIVE |
| Jaspers videor `PD_12_H1`, `PD_12_H2`, `PD_13_H1` | 3 | `DRYTREK_SE_PD` | ACTIVE |
| Jaspers videor `SP_6_H1`, `SP_7_H1` | 2 | `DRYTREK_SE_SP` | ACTIVE |
| Jaspers video `FO_2_H1` | 1 | `DRYTREK_SE_FO` **(nytt adset)** | ACTIVE |

Tillbakaläst ur kontot: **23 av 23 hittade, 21 ACTIVE/ACTIVE, 2 kvar i Metas
granskning** (PENDING_REVIEW / IN_PROCESS — normalt direkt efter uppladdning).
Alla 23 Notion-rader flyttade till `SE-ACTIVE to be translated`; 15:50-rutinen
tar dem till Norge. Ad-id per rad: `factory/output/drytrek/leverans-2026-09-13-resultat.json`.

**Två saker gjorde att det här inte gick av sig självt, båda lagade i koden:**

1. **Videorna låg i `Creative strat review`** — en status ingen rutin plockade.
   Jasper levererade sex videor dit 2026-09-12/13 och de hade stått kvar för
   alltid. Axels beslut 2026-09-13: leveransrundan ÄR granskningen. Sedan dess
   tar `tools/ops-leveranskon.mjs` SE-kön ur `To be Reviewed` **plus**
   `Creative strat review` när raden bär butikens brand som prefix och har en
   fil (`CS_STATUS_SE`, `tasMedISE`, `harBrandPrefix`). Hubbens tio äldre
   `Damasker_*`-rader (Bäverbutikens, parkerade) rörs aldrig — de listas som
   `cs_lamnade` i kön.
2. **Namnparsern klarade inte tvådelade namn.** `DryTrek_Damasker_PD_14_1` tog
   "Damasker" som konceptkod, och adsetuppslaget sökte bara `<bas> - <KONCEPT>`
   medan kampanjens egna adsets heter `DRYTREK_SE_PD`. Varje leverans hade
   skapat ett ANDRA PD-adset bredvid det som redan spenderar. Lagat:
   produktsegment med ≥ 5 bokstäver hoppas över, och `valjAdsetForKoncept` /
   `nyttAdsetnamn` i `tools/meta-lib.mjs` matchar båda konventionerna.

**QA:n:** varje bild tittad på av sessionen (Axels beslut 2026-09-13 — han
granskar aldrig bilder), varje video granskad på 15–20 utdragna frames.
Noll stopp. Videoanmärkningarna (laddas upp ändå, bara priset stoppar video):
captions är auto-transkriberad karaoke med stavfel i stället för manusraderna,
leverantörsetiketten AYXSEE syns på damaskerna i samtliga sex, klippen är
13–20 s mot briefens 20–30 s, och fyra videor visar ett riktigt ansikte i
stockmaterial. `SP_7_H1` säger 380 kr (butiken 389 kr — inom 20 %-toleransen,
uppladdad); `PD_12_H1` har ingen prisrad alls.

Hypotesen från batch #3b står kvar: vinstbidrag per färg `(243 − CPA) × köp`
inom adsetet `PD`, grinden ≥ 300 kr OCH ≥ 3 köp per variant. Med 17 färger +
4 videor i samma adset tar det tid — döm inte en färg på 50 kr.

---

## 2026-09-13 — leveransrunda, andra körningen samma dag: tom kö, och kvittot på att den första höll

Rutinen kördes en gång till på eftermiddagen. **Kön var tom för att förmiddagens
körning ovan redan tagit allt** — inte för att något saknades. Det här är alltså
avstämningen av den körningen, inte en egen leverans.

**Tillbakaläsning ur kontot av alla 23 uppladdade annonser:** 23 av 23 står nu
**ACTIVE/ACTIVE**. De två som låg i Metas granskning på förmiddagen
(IN_PROCESS) har släppts igenom. Fördelningen stämmer med planen och inget
extra adset skapades: `DRYTREK_SE_PD` 20 annonser, `DRYTREK_SE_SP` 2,
`DRYTREK_SE_FO` 1 — alla i `DRYTREK_SE_Damasker Vandring | BE-ROAS 1.60 |
2026-09-09`. Namnparser-buggen som hade kunnat skapa ett andra PD-adset är
därmed bevisat lagad i skarp drift, inte bara i koden.

`To be Reviewed` i hubben "Damasker vandring": **0 rader**. Inget laddades upp,
inget rördes i kontot 915422744950975. Kampanjen
`DRYTREK_SE_Damasker Vandring | BE-ROAS 1.60 | 2026-09-09` är ACTIVE med fyra
av fem adsets igång (`DRYTREK_SE_G` är PAUSED — ett beslut, aktiveras aldrig
härifrån). Butikspriset läst live: **389 SEK** (jämförpris 649 SEK).

Hubbens 79 rader fördelade sig så här vid körningen:

| Status | Video | Bild | Övrigt |
|---|---|---|---|
| Draft | 17 | 23 | 1 Guideline |
| SE-ACTIVE to be translated | 11 | 17 | — |
| Creative strat review | 10 | — | — |

De 28 raderna i `SE-ACTIVE to be translated` tillhör översättningsrundan, inte
den här. De 40 Draft-raderna är inte färdiga.

**De tio `Damasker_*`-raderna i `Creative strat review` är kontrollerade, inte
bara överhoppade.** Skapade 2026-09-02 till 2026-09-08 med Jasper Tomboc som
ansvarig, alla `Video - Pending Approval`, alla med `Link for approval` till en
Drive-mapp — men briefernas `Landing page` pekar på
`baverbutiken.se/products/damasker-vandring-haller-sno-vata-grus-ute`. Det är
alltså Bäverbutikens källrader, inte DryTrek-leveranser, precis som
`harBrandPrefix` dömer dem. De rörs inte, och Axels nej till brand-swap
(TackleBay 2026-09-12) står kvar.

⚠️ **De kan aldrig levereras av någon rutin som den ligger nu.** Bäverbutikens
läsare undantar OPS-hubbarna per id (`tools/lib/ops-hubbar.mjs`), och den här
rundan hoppar dem på prefixet. Frågan är ställd till Axel i Discord
`#annons-uppladdning` 2026-09-13: ska Jasper bygga om dem som DryTrek-versioner
eller ska de arkiveras? **Frågan är ställd en gång — kommande körningar
rapporterar dem som varning, inte som ACTION NEEDED, tills Axel svarat.**

Köfilen från den här andra körningen ligger i
`factory/output/drytrek/leverans-2026-09-13-omkoll.json`. Förmiddagens
`leverans-2026-09-13.json` (23 rader) skrevs medvetet INTE över — den är
kvittot på vad som faktiskt levererades.

---

## 2026-09-13 — översättningsrunda NO (`/ops-oversatt drytrek`), första körningen

**21 av 28 rader är live i Norge.** Kampanj `DRYTREK_NO_Damasker Vandring |
BE-ROAS 1.60 | 2026-09-09` i OPS-kontot 915422744950975, tillbakaläst:
**21 av 21 ACTIVE/ACTIVE**, 20 i `DRYTREK_NO_PD` och 1 i `DRYTREK_NO_SP`.
Inget nytt adset skapades, kampanjen rördes inte. Alla 21 Notion-rader flyttade
till `Approved` med kommentar och `Translated url`.

| | Antal | Vad |
|---|---:|---|
| Bilder live | 17 | `DryTrek_NO_Damasker_PD_14_1…18` (färgkartan, PD_14_3 finns inte) |
| Videor live | 4 | `PD_12_H1`, `PD_12_H2`, `PD_13_H1`, `SP_7_H1` |
| Videor hoppade | 2 | `FO_2_H1`, `SP_6_H1` — röstkollen röd |
| Rader hoppade | 5 | Bäverbutikens parkerade `Damasker_*` |

### Det som gjorde jobbet mycket mindre än väntat: bilderna har ingen text

Alla 17 färgbilderna är **rena produktfoton mot vit bakgrund utan ett enda
inbränt ord** — kontrollerat genom att titta på var och en av dem, inte genom
att lita på detektorn. `pipeline/oversatt-bild.py --analys` rapporterade
"knapp"-former på 7 av dem, men varje sådan träff var det **svarta
kardborrefältet på damasken**, inte text. Bildmotorn (fas 3) behövdes alltså
inte alls: bilderna laddades upp som de är och bara copyn översattes.
⚠️ **`--analys` ensam är inte ett svar på frågan "finns det text i bilden".**
Den hittar bara text som ligger på en form, och den hittar former som inte är
text. Titta på bilden.

### Zonen är allt i `no-precis.py` — och standardzonen passar inte 4:5

Videorna är **1080×1350** (SE laddade upp 4:5-versionen; kollat i Metas
`format`-fält på källannonserna, alla fyra storlekarna slutar på 1080×1350).
`no-precis.py`:s standardzon räknas som `850–1040 × W/720` = **1275–1560 px**,
vilket ligger helt utanför en 1350 px hög bild. Zonen måste sättas per video.

Första försöket med en rundlig zon (`810–1030`) gav **515 av 592 frames** på
`PD_12_H1` — och de missade frameserna släppte igenom svensk text i den
färdiga filen (`Kruken fester`, `går på`, `på foten.` syntes i QA-svepet).
Rotorsaken: en för hög zon får pillret att **smälta ihop med ljus bakgrund**
(snö, himmel) i grupperingen, gruppen blir högre än `h_max` och kastas.
Med en tajt zon (pillret ±12 px) blev det **583 av 592**, och de 9 kvarvarande
frameserna innehöll ingen svensk text alls (kontrollerat bild för bild).

Uppmätta zoner, damaskvideorna 2026-09-13:

| Video | Piller y | Zon | Träff |
|---|---|---|---:|
| `FO_2_H1` | 879–992 | `[867, 1004]` | 414/414 |
| `PD_13_H1` | 857–968 | `[845, 980]` | 505/505 |
| `SP_7_H1` | 858–968 | `[846, 980]` | 416/419 |
| `SP_6_H1` | 830–961 | `[818, 973]` | 476/480 |
| `PD_12_H2` | 830–955 | `[818, 967]` | 582/587 |
| `PD_12_H1` | 829–972 | `[817, 984]` | 583/592 |

Mät zonen på ~40 frames innan du kör skarpt — det tar två minuter och är
skillnaden mellan svensk text i en live-annons och inte.

### HeyGen hittade på två sakfel som bara en människa kunde fånga

Proofread-transkriptet är facit för vad rösten säger, och det bar två fel som
hade gått rakt ut i en norsk annons:

1. **44 cm blev 14 cm.** `PD_12_H1` block 2: svenskan säger "Fyrtiofyra
   centimeter", HeyGens norska sa "Fjorten centimeter". Produkten är 44 cm.
2. **Brandet mosades.** "Dry3 Damasko" / "Drytre Damasko" / "Dry 3-gamasjer"
   i tre block. Brandet heter DryTrek, produkten heter gamasjer.

Dessutom var HeyGens norska genomgående **upp till 40 % kortare** än svenskan,
vilket ger tyst luft i slutet av varje block. Den rättade SRT:en ligger på
90–105 % av källans teckenantal per block.

### Röstkollen föll på två videor — och mätningen pekar på musiken, inte rösten

`FO_2_H1` och `SP_6_H1` fick ❌: *"talet slutar 0.10s före slutet, källan hade
0.20s"*. Båda renderades om med en **kortare slutrad** (FO_2 84 → 56 tecken,
SP_6 177 → 140). **Mätvärdet rörde sig inte en enda 50 ms-ruta.** Med ~30 %
mindre tal kan det uppmätta "talslutet" inte vara rösten — `rostkoll.py`:s
`talslut()` mäter energi i 300–3400 Hz, och det bandet fångar **musikbädden**
som HeyGen behåller och som spelar till sista rutan.

Energiprofilen sista 1,2 s stöder det: `FO_2_H1` går 60 → 16 → 3 → 0 % av
toppen, alltså en avtoning, inte ett hugg.

Reglen är ändå Axels och den följdes: **ingen video med ❌ laddades upp.**
De två ligger kvar i `SE-ACTIVE to be translated` med kommentar i Notion, och
de färdiga filerna står i `market-expansion/ops/drytrek/2026-09-13/no-underkanda/`.
**Förslag på fix i `rostkoll.py`:** jämför talslutet mot källans talslut i
samma fil (musiken är identisk i båda) i stället för mot en absolut marginal,
eller mät röstbandet efter att källans ljudbädd subtraherats.

### De fem `Damasker_*`-raderna är Bäverbutikens — nu bevisat, inte antaget

`Damasker_SP_4_H1`, `SP_5_H1`, `PD_8_H1`, `PD_9_H1` och `FO_1_H1` stod i
`SE-ACTIVE to be translated`. Alla fem är **ACTIVE i Bäverbutikens konto
1867947880635861**, kampanj `Damasker Vandring | BE ROAS 1.60 | Launch
2026-08-29` (avläst 2026-09-13), och finns **inte** i Magiborsten NO
`1050941584152547`. De är alltså Bäverbutikens svenska annonser som väntar på
Bäverbutikens egen Norge-runda — men den når dem aldrig, eftersom hubben sedan
2026-09-10 är undantagen ur Bäverbutikens läsare (`tools/lib/ops-hubbar.mjs`).
De laddades inte upp: namnen bär inget brandprefix, och Bäverbutikens creatives
hör inte hemma i DryTreks konto. Status orörd, kommentar skriven, frågan ställd
till Axel i Discord.

### Priset: norsk copy utan pris, men de gamla annonserna säger fel

`factory/produkter/damasker.yaml` saknar `no_pris_nok`, och `drytrek.se/nb`
visar **389,00 kr i valutan SEK** (`currencyCode: SEK`, avläst 2026-09-13 —
NOK är inte påslaget). Enligt `/ops-oversatt` regel 4 skrevs därför all ny
norsk copy **helt utan pris**. Beloppet 389 står kvar i tal och captions där
källan säger det, aldrig omräknat.

⚠️ De **16 norska annonser som redan körde** bär `factory/annonscopy/damasker-no.json`
(skriven 2026-09-09) med **381 kr i stedet for 635 kr — 40 % rabatt**. Den
prisuppgiften stämmer inte mot butiken i dag. Frågan är ställd till Axel.

### Copyn

Skriven av sonnet-subagenter i två rundor, den andra förankrad i husets egen
norska copy (`factory/annonscopy/damasker-no.json`) efter att fyra granskare
underkänt 24 rader i den första. Husets ordval är norm: *"blir på utsiden"*
(inte "utenfor", som är rumsligt på norska), *"Tetter mellom støvel og bukse"*
(inte "ute nedenfra"), *"blir værende"* (inte intransitivt "stopper"),
*"Se alle **de** 18 fargene"* (dubbel bestämdhet), *væte* (inte "fukt").

Två rättningar gjordes av huvudsessionen efteråt:
- `PD_12_H2` fick **samma headline som `PD_12_H1`** ("Snøen blir på utsiden").
  H1/H2 delar film och copy med flit — bara hooken får skilja, precis som i
  Sverige. En egen headline hade lagt till en andra variabel och gjort testet
  oläsbart.
- `SP_7_H1`:s headline blev "Testet på hundeturen i morges." Utkastet hade
  tappat hundpromenad-situationen, som är hela annonsens vinkel.

Kvar att mäta: ingen dom kan ställas på någon norsk annons än — kampanjen har
21 nya annonser från i dag och grinden är ≥ 300 kr OCH ≥ 3 köp per annons.

### Beslut 2026-09-13 (Axel, chatten): nya tester stannar i CBO:n, PD får golv

Frågan från nattens rapport (test-ABO enligt regel 11, eller golv på PD) —
**Axel valde B.** `DRYTREK_SE_PD` fick `daily_min_spend_target` 300 kr/dag
(satt 2026-09-13, tillbakaläst 30000 öre, loggrad i `factory/budgetlogg.jsonl`).
Skäl: PD (den ärvda vinnaren, ROAS 2,77 i källan) hade fått 317 kr på 7 dagar
medan CS + G tog 2 216 kr. De 23 nya annonserna från leveransen ligger kvar i
CBO:n, ett adset per koncept. Kampanjbudgeten är 700 kr/dag efter nattens
sänkning (−30 %, vinst 3d −115 %) — golvet tar alltså ~43 % av dagsbudgeten.
Om Axel höjer tillbaka till 1 000 kr ska golvet inte ändras.
---

## 2026-09-13 — översättningsrunda NO, andra körningen: de fem ärvda raderna

**Axels beslut samma kväll: "bara launcha dom också."** De fem `Damasker_*`-rader
som förmiddagens körning hoppade (Bäverbutikens egna annonser, parkerade i hubben
sedan 2026-09-10) är nu översatta och live för DryTrek. Axel sa samtidigt nej till
att skriva om de gamla norska annonsernas pris (381/635) — den frågan är stängd.

**Namnen:** de fick DryTreks konvention, `DryTrek_NO_Damasker_<KOD>_<nr>_H1`, inte
källans `Damasker_NO_…`. Numret ärvs (SP_4, SP_5, PD_8, PD_9, FO_1) så släktskapet
med källannonsen syns, men prefixet gör dem skiljbara från Bäverbutikens i kontot.

**Läget i NO-kampanjen efter båda körningarna: 25 annonser, 25 ACTIVE/ACTIVE.**
`FO_1_H1` skapade adsetet `DRYTREK_NO_FO` — det första FO-adsetet i kampanjen.

| Annons | Adset | Läge |
|---|---|---|
| `DryTrek_NO_Damasker_SP_4_H1` | `DRYTREK_NO_SP` | live |
| `DryTrek_NO_Damasker_SP_5_H1` | `DRYTREK_NO_SP` | live |
| `DryTrek_NO_Damasker_PD_9_H1` | `DRYTREK_NO_PD` | live |
| `DryTrek_NO_Damasker_FO_1_H1` | `DRYTREK_NO_FO` (nytt) | live |
| `DryTrek_NO_Damasker_PD_8_H1` | — | **fast i HeyGens moderering** |

### Det som INTE fick följa med: tre påståenden DryTrek har strukit

Filmerna är Bäverbutikens och bär löften som DryTreks copy-granskning tog bort
2026-09-09. De stod både i talet och i den inbrända texten. Alla tre är
omskrivna i den norska versionen:

| Källan säger | Varför det inte får stå | Norska versionen |
|---|---|---|
| "Stoppar regn" · "regnet studsade av" (SP_5, PD_8, PD_9, FO_1) | Produkten är inte testad vattentät | "væte blir på utsiden" |
| "Tio sekunder" · "tio sekunders montering" (PD_8, PD_9, FO_1) | Tidslöfte, förbjudet sedan 2026-09-09 | "Krok, stropp." / "Borrelås hele veien opp." |
| **"Trettio dagars öppet köp" (PD_8)** | **Sakfel — DryTrek ger 14 dagars ångerrätt** | "Fjorten dagers angrerett." |

⚠️ **PD_8 bär dessutom en STATISK engelsk ruta** som inte är en caption:
"Stops snow. / Stops rain. / Blocks gravel. / 10-second fit.", 4 rader,
y 783–1131, x 220–850, synlig 8,25–13,1 s. Den ligger utanför pillerdetektorn
och suddas med en `blur`-ruta i `cap2/PD_8_H1.json`. Ligger den kvar går både
regnlöftet och tidslöftet ut på engelska i en norsk annons.

`PD_9` bär en gul prisbricka "389 kr (ord. 649 kr)" på y 886–1035 — den stämmer
exakt mot butiken och står kvar orörd (regel 4: inbränt pris behålls i SEK).
`SP_4` har 380/640 kr inbränt, 2 % under butikens 389/649 — inom toleransen.

### Rotorsak lagad i koden: pillerdetektorns fönster var för smalt för 9:16

Första captionkörningen lämnade **svenska textstumpar i vänster- och högerkant**
av den norska rutan (`Sl…la` av "Sluta gå hem med kalla"). Rotorsaken satt i
`pipeline/no-precis.py`: `hitta_piller` sökte bara i x 120–600 × skala
(= 180–900 vid 1080 px) och kastade allt bredare än 560 × skala (= 840 px).
De här ärvda 9:16-videorna har piller **upp till 1079 px breda**, centrerade på
539 — alltså bredare än både fönstret och taket.

Lagat additivt: `x0`, `x1` och `bredd_max` går nu att sätta i konfigens
`captions`-block, i RIKTIGA pixlar, med dagens värden som default. Inget ändras
för någon annan butik. Med `x0: 0, x1: 1080, bredd_max: 1080` gick träffen från
410/503 till 358/358, 383/383, 410/503 och 399/409 — och kanterna blev rena.

**Kvarvarande specialfall i `PD_9_H1`:** i 13,4–15,5 s står pillret på ett nästan
vitt golv, smälter ihop med bakgrunden och gruppen blir för hög för `h_max`.
Löst med en manuell `fyll`-platta `[145,1366,940,1522]` — den vitmålar och tvingar
fram den norska cuen. Utan den låg "389 kronor ordinarie" kvar på svenska.

### Röstkollen

Alla fyra uppladdade gröna. Zonerna som mättes upp (pillret ±12 px):
`SP_4 [1365,1508]` · `SP_5 [1378,1558]` · `PD_8 [1371,1533]` · `PD_9 [1366,1521]`
· `FO_1 [1359,1520]`. Mät alltid per video — standardzonen i `no-precis.py`
räknas som `850–1040 × W/720` och hamnar utanför bilden på allt som inte är 9:16
med 1280 px höjd.

### PD_8 ligger kvar hos HeyGen

`getTranslateStatus` svarar `status: failed`, `failure_message: "video pending
moderation by our team"` — HeyGens MANUELLA granskning, inte ett renderingsfel.
Raden står kvar i `SE-ACTIVE to be translated` med kommentar, så nästa körning
tar den när modereringen släpper. Den norska texten är redan skriven och
verifierad; bara renderingen saknas.

---

## Nattvakten 2026-09-14 (körning nr 3, ingen briefdag)

Kampanjen 5 dagsrader: **3 623 kr, 7 köp, ROAS 0,83** (7d); 3d 2 751 kr / 5 köp / 0,81.
Dygn: 09-09 16 SEK/0 purchases · 09-10 856 SEK/2 purchases · 09-11 788 SEK/0 purchases · 09-12 1123 SEK/3 purchases · 09-13 840 SEK/2 purchases. **Förlustserie 5 dygn i rad → −30 %: 700 → 500 kr (golvet).**
Tillbakaläst, loggrad. Inga annonspauser: 39 annonser i kampanjen, de 23 nya
(13/9) alla under grinden. `PD_2_1` stod PAUSED vid avläsningen (444 kr, 0 köp)
— pausad dagtid av någon annan, ett beslut, orörd. PD-golvet 300 kr (Axel 13/9)
syns: PD_1 21 → 134 kr på ett dygn. Trenden vänder uppåt (0,56 → 0,83) men
ligger under break-even 1,60. Utfall per annons läses på onsdag 16/9.

---

## Leveransen 2026-09-14 — 3 videor LIVE, två nya adsets (`/ops-leverans drytrek`, rutinens första egna körning)

Första gången rutinen `trig_01QVN2LoiGK5UdSW3aivhRM1` triggade själv (11:50 UTC).
Kön hade **3 rader**, alla Jaspers batch #3-videor i `Creative strat review` med
DryTrek-prefix och Drive-länk. Kampanjen `DRYTREK_SE_Damasker Vandring |
BE-ROAS 1.60 | 2026-09-09` [ACTIVE], **CBO 500 kr/dag** (nattvakten sänkte
700 → 500), pris **389 kr** läst live ur drytrek.se vid körningen.

| Annons | Adset | Ad-id | Längd | Tillbakaläst |
|---|---|---|---|---|
| `DryTrek_Damasker_BOF_10_H1` | `DRYTREK_SE_BOF` **(nytt)** | 120249087548860172 | 13,1 s | ACTIVE/ACTIVE |
| `DryTrek_Damasker_CI_3_H1` | `DRYTREK_SE_CI` **(nytt)** | 120249087650360172 | 14,3 s | ACTIVE/PENDING_REVIEW |
| `DryTrek_Damasker_PD_16_H1` | `DRYTREK_SE_PD` | 120249087654710172 | 9,7 s | ACTIVE/IN_PROCESS |

Båda nya adsetsen är klonade ur ett syskon, föddes PAUSED och aktiverades av
körningen själv — inget befintligt PAUSED rördes. `DRYTREK_SE_G` står kvar
PAUSED (Axels beslut 2026-09-12). Ad-id per rad:
`factory/output/drytrek/leverans-2026-09-14-resultat.json`. Alla tre Notion-rader
flyttade till `SE-ACTIVE to be translated` med kommentar.

**Priset stoppade ingen:** alla tre endcards säger 389 kr per par, identiskt med
butiken. Det är det enda stoppet för video.

**QA:n gjordes på 12–15 utdragna frames per film.** Anmärkningar som följde med
upp (bara priset stoppar en video):

1. **Captionsen är auto-transkriberad karaoke i alla tre**, inte briefens rader
   ur avsnitt 4. Det ger stavfel som `Damaskor` (CI_3_H1) och `av sjängan`
   (PD_16_H1), och i BOF_10_H1 en caption med ett kängstorleksintervall som inte
   står i briefen alls. Tredje leveransen i rad med samma fel — påtalat för
   Jasper i Discord 2026-09-14.
2. ⚠️ **`PD_16_H1` svarar inte på sin egen hypotes.** Briefens avsnitt 3 och
   edit map krävde **EN obruten tagning** av påtagningen med kängan kvar på
   foten, 15–20 s, realtid, inga klipp i fästsekvensen. Det som kom är en
   **trepanels split screen med klipp, 9,7 s**. Hela poängen var att mäta
   obruten demo mot klippt demo (PD_12), så som den ligger nu mäter den inget.
   Den är live under tiden; omgörning begärd av Jasper.
3. Leverantörsetiketten **AYXSEE** syns på damaskerna i samtliga tre. Inget
   DryTrek-märke någonstans i materialet.
4. `CI_3_H1` är 14,3 s mot briefens 20–25 s; `PD_16_H1` 9,7 s mot 15–20 s.

⚠️ **Varje Drive-mapp innehåller filmen två gånger: `_1` är 4:5 (1080×1350) och
`_2` är 9:16 (1080×1920).** Kön plockar `_1`, och det är vad både den här och
gårdagens körning laddade upp — sex videor 2026-09-13 och tre 2026-09-14, alla
i 4:5. Konsekvent, men obeslutat: Reels/Stories får då en beskuren version
medan 9:16-filen ligger oanvänd i mappen. Ändra inte för en enskild film — det
bryter jämförbarheten mellan syskonen. Ska det ändras ska det ändras för hela
kampanjen på en gång.

De tio parkerade `Damasker_*`-raderna i `Creative strat review` ligger kvar,
orörda, och rapporterades som varning utan ping enligt regeln som skrevs
2026-09-13. Frågan till Axel är fortfarande obesvarad.

---

## Norge 2026-09-14 — 4 videor live i NO-kampanjen (`/ops-oversatt drytrek`, rutinens första egna körning)

Rutinen `trig_01Th8prN9yBckpUNgThJef9c` triggade själv 13:50 UTC. Kön hade **6
rader** i `SE-ACTIVE to be translated` i hubben *Damasker vandring*: dagens tre
SE-videor från leveransrundan, de två röstkollsstoppade från 13/9, och
`Damasker_PD_8_H1` som låg kvar sedan gårdagens andra runda.

Kampanjen `DRYTREK_NO_Damasker Vandring | BE-ROAS 1.60 | 2026-09-09` [ACTIVE],
ärvd länk `https://drytrek.se/nb/products/damasker?country=NO`, pris läst live
ur butiken: **389 SEK**.

| Annons | Adset | Ad-id | Tillbakaläst |
|---|---|---|---|
| `DryTrek_NO_Damasker_PD_8_H1` | `DRYTREK_NO_PD` | 120249089013610172 | ACTIVE/ACTIVE |
| `DryTrek_NO_Damasker_BOF_10_H1` | `DRYTREK_NO_BOF` **(nytt)** | 120249089601800172 | ACTIVE/ACTIVE |
| `DryTrek_NO_Damasker_CI_3_H1` | `DRYTREK_NO_CI` **(nytt)** | 120249089735240172 | ACTIVE/ACTIVE |
| `DryTrek_NO_Damasker_PD_16_H1` | `DRYTREK_NO_PD` | 120249089767180172 | ACTIVE/ACTIVE |

HeyGen-krediter: **8 315 → 8 135** (180 för tre renderingar).

**Hoppade, tredje dagen i rad:** `FO_2_H1` och `SP_6_H1`. Dubben är renderad och
captionsen klara, men `pipeline/rostkoll.py` är röd på båda: "talet slutar 0,10 s
före slutet, källan hade 0,20 s". Båda renderades om en gång med ~30 % kortare
slutrad — **det mätta värdet rörde sig inte ett enda 50 ms-fönster**. Det är
beviset på att `talslut()` mäter bakgrundsmusiken, inte rösten: energiprofilen
visar en ren uttoning (60 → 16 → 3 → 0) utan avhugget tal. Regeln säger att en
röd video inte laddas upp, så de ligger kvar. Frågan till Axel — om mätningen
ska lagas — är fortfarande obesvarad efter tre dygn.

**Priset:** norsk ad copy är helt utan pris (regel 4, produktfilen saknar
`no_pris_nok`). Voiceovern behåller källans SEK-tal, "tre hundre og åttini
kroner paret" — aldrig ett påhittat NOK-pris.

### Captionsdetektorn: tre nya lägen där pillret inte hittas

Alla tre filmerna kördes genom `pipeline/no-precis.py`. Detektorn hittade
pillret i 314/328, 345/357 och 242/242 frames. Luckorna, och vad som gjordes:

1. **BOF_10_H1 0,00–0,12 s** — ingen caption alls i källan där. Inget att göra.
2. **BOF_10_H1 10,72–11,08 s** — pillret ligger på nysnö, gruppen spränger
   `h_max` och förkastas. Manuell `fyll`-platta 10,65–11,20.
3. **BOF_10_H1 3,3–5,3 s** — **tvåradig** caption (y 798–1055). Detektorn klarar
   bara ett band; `fyll`-platta över hela blocket.
4. **CI_3_H1 8,00–8,16 s och 8,76–9,00 s** — samma snöproblem, och här slapp
   svensk text igenom första gången (`Damasken stängd`). Två `fyll`-plattor
   [200,813,880,977]. Efterkontroll på frames 7,9/8,1/8,3/8,6/8,9/9,1 s: bara
   norska kvar.

⚠️ **Mönstret är nu mätt tre gånger: pillret på nästan vit bakgrund förkastas av
`h_max`.** Det är inte ett fel i zonen — det är att gruppen växer ihop med
bakgrunden. Leta alltid efter luckorna i `<fil>.piller.json` innan leverans och
lägg `fyll` över dem; en lucka betyder att källans svenska caption ligger kvar.

**Zonerna (piller ±12) för dagens filmer**, alla 1080×1350:
`BOF_10_H1` [854,999] cy 926 · `CI_3_H1` [805,983] cy 907 · `PD_16_H1` [818,982]
cy 908.

NO-kampanjen kör efter körningen **45 annonser, samtliga ACTIVE**: PD 27, SP 7,
CS 4, G 4, CI 1, BOF 1, FO 1. Kön är därmed tom utom de två röstkollsstoppade
raderna.

---

## Nattvakten 2026-09-15 (körning nr 4, ingen briefdag)

Kampanjen 6 dagsrader: **4 167 kr, 7 köp, ROAS 0,72** (7d); 3d 2 508 kr / 5 köp / 0,88.
Dygn: 09-09 16 kr/0 köp · 09-10 856 kr/2 köp · 09-11 788 kr/0 köp · 09-12 1123 kr/3 köp · 09-13 848 kr/2 köp · 09-14 537 kr/0 köp. **Sex förlustdygn i rad — står redan på
golvet 500 kr: ingen sänkning, ingen paus** (Axels regel 2026-09-10). 0 annonspauser
(42 annonser, alla under kill-gränsen efter budgetsänkningen). Toppspend aktiva:
PD_14_12 257 kr/0 · SP_6_H1 196 kr/0 · CS_2 155 kr/0 · PD_1 146 kr/0 · CS_3 141 kr/0 · PD_14_15 122 kr/0. Utfall per annons läses på onsdag 16/9.

---

## 2026-09-15 — leveransrunda: tom kö, gårdagens tre bekräftade live

Rutinen körde 11:50 UTC. **Inget nytt i kön** — hubben har ingen rad i
`To be Reviewed` och ingen ny leverans från Jasper sedan gårdagens tre videor.
Inget laddades upp, inget rördes i kontot.

**Gårdagens tre står nu ACTIVE/ACTIVE**, alla har passerat Metas granskning:
`BOF_10_H1`, `CI_3_H1` och `PD_16_H1`. Kampanjen kör med sex av sju adsets;
`DRYTREK_SE_G` står kvar PAUSED sedan Axels beslut 2026-09-12. Pris 389 kr.

Hubbens 79 rader har flyttat sig ordentligt sedan igår — NO-rundan har gjort
sitt jobb:

| Status | Igår | Idag |
|---|---:|---:|
| Draft | 40 | 38 |
| SE-ACTIVE to be translated | 28 | 2 |
| Approved (översatt, klart) | 0 | 29 |
| Creative strat review | 10 | 10 |

De två kvar i översättningskön tas av 15:50-rutinen.

`PD_16_H1` är live men omgörningen som begärdes 2026-09-14 är inte levererad —
briefen kräver en obruten tagning, det som ligger uppe är en trepanels split
screen. De tio parkerade `Damasker_*`-raderna ligger orörda; frågan till Axel
om dem har stått obesvarad sedan 2026-09-13 och rapporteras som varning utan
ping, enligt regeln i den körningens loggpost.

---

## Norge 2026-09-15 — de två sista videorna live, och röstkollen lagad

Rutinen triggade 13:50 UTC. Kön hade **2 rader** — `FO_2_H1` och `SP_6_H1`, de
enda som blivit kvar. Ingen ny leverans att översätta. Fjärde dygnet de stod
still, alla tre gånger på samma röda röstkoll.

**Frågan till Axel var fel ställd och drog ut på tiden i onödan.** Att laga en
mätbugg är inget ägarbeslut (regel 12) — det skulle ha gjorts direkt.

### Rotorsaken: måttet straffade det det skulle belöna

`rostkoll.py` mätte avhugget slut som **var talbandets energi sist passerade
15 % av filens topp**, och jämförde marginalen till filmens slut med källans.
Det är bakvänt: en dubb som säger sista ordet **tydligt och sedan tystnar** får
en KORT marginal, medan en källa som tonar ut gradvis får en lång. Ju renare
slut, desto rödare film.

Den tidigare hypotesen — "kollen mäter musiken, inte rösten" — var **fel**, och
mätdatan säger det rakt ut. Dubbens tail är inte musik: vid 12,80 s ligger
FO_2:s källa på 138 och dubben på 1 471, tio gånger högre. Skillnaden ÄR rösten.
Felet satt i tröskeln, inte i frekvensbandet.

### Nya måttet: slutenergi

Frågan är nu rakt av **"låter det fortfarande när filen tar slut?"** — RMS i
sista 100 ms i talbandet, mot filens egen median, i dB. Ett avhugget slut är
ett ljud som inte hinner tona ut. Musikbädden är gemensam mellan källa och
dubb, så talet används som **skillnad** mot källans.

Validerat på **14 dubbar + 14 kopior kapade mitt i ett ljud** (kapningen läggs
30 ms in i det energistarkaste fönstret i slutet — en kapning som hamnar i en
paus hörs inte och duger inte som testfall):

| | hela dubbar | kapade mitt i ljud |
|---|---|---|
| Slutenergi mot källan | −141…0,0 dB | +0,8…+55 dB |
| Utfall med tröskel 3 dB | **0 falsklarm av 14** | **12 fångade av 14** |

De två den missar är filmer vars KÄLLA själv slutar på full volym (`PD_13_H1`
+6,3 dB, `SP_7_H1` +6,2 dB). Där har differensen inget att mäta mot, och de
rapporteras som **omätbara med orsak** — aldrig som gröna.

`pipeline/test/test_rostkoll.py` påstod tvärtom att en fil som slutar i **total
tystnad** (−179 dB) ska bli röd, bara för att sista cue:n gick till sista
bildrutan. Det testet kodifierade buggen och är omskrivet: en sådan fil ska bli
GRÖN, och en video kapad mitt i ett ljud ska bli RÖD. Alla 7 testfall gröna,
`npm test` 1 183/1 183, självtestet 9 gröna / 0 röda.

### De två annonserna

| Annons | Adset | Ad-id | Slutenergi mot källan | Tillbakaläst |
|---|---|---|---|---|
| `DryTrek_NO_Damasker_FO_2_H1` | `DRYTREK_NO_FO` | 120249106482250172 | **−12,8 dB** | ACTIVE/PENDING_REVIEW |
| `DryTrek_NO_Damasker_SP_6_H1` | `DRYTREK_NO_SP` | 120249106502590172 | **−49,1 dB** | ACTIVE/IN_PROCESS |

Inget renderades om: både dubbarna och källorna låg kvar på disken sedan 13/9,
så de kostade **0 HeyGen-krediter**. Captionsen var redan klara.

NO-kampanjen kör nu **47 annonser, samtliga ACTIVE**: PD 27, SP 8, CS 4, G 4,
FO 2, CI 1, BOF 1. **Kön är tom.**

⚠️ **Lärdomen, värd mer än de två annonserna:** en kontroll som aldrig testats
mot ett äkta positivt fall är inte en kontroll, den är en gissning. Den här
hade ett testfall som mätte fel sak, och det tog tre dygns produktion innan
någon räknade på siffrorna i stället för att tro på utfallet. Bygg alltid det
trasiga fallet på riktigt — och lägg det där det gör ont: mitt i ett ljud.

---

## Nattvakten 2026-09-16 (körning nr 5, briefdag) — KAMPANJEN PAUSAD, briefronden pausad

**`DRYTREK_SE` står PAUSED sedan 2026-09-15 20:52** (manuellt, ingen rutin har
loggat det — ett ägarbeslut, rörs aldrig). 7 dagsrader: **4 656 kr, 8 köp,
ROAS 0,73**; sista dygnet 485 kr / 1 köp. Budgetronden: 0 ändringar (inget
ACTIVE att döma). **Bedömbara annonser: 0 av 42** — sjunde avläsningen utan
en enda annons över grinden (≥ 300 kr OCH ≥ 3 köp).

**Briefronden pausad i registret** (`briefantal drytrek/damasker paus`,
2026-09-16) — samma prejudikat som AdventLane 2026-09-15: pausad kampanj ⇒
inga nya briefer, budgetronden går ändå. 18 av 21 batch #3-briefer ligger
kvar i Draft. Inga rader skapade i hubben i natt. Släpps med
`node factory/register.mjs briefantal drytrek/damasker auto`.

### Utfall batch #2 + #3 (live 13–15/9, 14d-fönster, ingen dom)

| Annons | Batch | Spend | Köp | Hook 3s | Hold | CTR | CPC | Mot hypotes |
|---|---|---:|---:|---:|---:|---:|---:|---|
| SP_6_H1 (tyst demo-öppning) | #2 | 377 kr | 0 | 41,3 % | 16,7 % | 2,3 % | 5,4 kr | hyp: CPC < 9,18 ✔ (5,4), CVR ≥ 3 % ✘ (0 köp på 70 klick) — under grinden |
| PD_16_H1 (en tagning — levererad som split) | #3 | 56 kr | 0 | 26,5 % | 36,7 % | 1,6 % | 9,3 kr | mäter inget: fel format |
| CI_3_H1 (regnade inte) | #3 | 50 kr | 0 | 31,9 % | 29,3 % | 3,5 % | 5,5 kr | för tidigt |
| PD_12_H1 (ärligt manus) | #2 | 47 kr | 0 | **47,5 %** | 17,3 % | 1,5 % | 5,8 kr | för tidigt — bästa hook rate i kampanjen |
| FO_2_H1 (ett ben med/utan) | #2 | 36 kr | 0 | 35,2 % | 26,3 % | 3,1 % | 7,2 kr | för tidigt |
| PD_13_H1 (vattentestet) | #2 | 21 kr | 0 | 38,8 % | 12,8 % | 0 % | — | för tidigt |
| BOF_10_H1 (passar mina kängor?) | #3 | 12 kr | 0 | 46,0 % | 30,4 % | 0 % | — | för tidigt |
| SP_7_H1 (hundpromenaden) | #2 | 10 kr | 0 | 29,7 % | 36,4 % | 1,4 % | 10,4 kr | för tidigt |
| PD_12_H2 (källans fråga) | #2 | 10 kr | 0 | 41,1 % | 4,3 % | 0 % | — | för tidigt |
| PD_14_12 Brun (bild) | #3b | 354 kr | 1 | — | — | 3,1 % | 2,8 kr | färgfamiljen: 752 kr / 2 köp på 17 bilder |
| PD_14_15 Kamouflage grön | #3b | 163 kr | 0 | — | — | 2,2 % | 3,1 kr | |
| PD_14_8 Ljusblå | #3b | 33 kr | 1 | — | — | 3,6 % | 3,3 kr | |
| övriga 14 färger | #3b | < 45 kr var | 0 | | | | | |

Spend per familj 14d: CS 1 317 kr/3 köp · G 1 005/0 · PD (video+bild) 798/0 ·
PD_14 färger 752/2 · SP 685/3 · CI 50 · FO 36 · BOF 12. Kampanjen totalt
4 656 kr / 8 köp / ROAS 0,73 mot break-even 1,60.

Copy-A/B: fable-taggade live-annonser 146 kr / 0 köp, sonnet-taggade 1 175 kr
/ 2 köp (inkl. färgbilderna). 0 bedömbara per modell.

---

## 2026-09-16 — leveransrunda: ingen SE-kampanj att leverera till

Rutinen körde 11:50 UTC. **Ingen uppladdning var möjlig:**
`DRYTREK_SE_Damasker Vandring | BE-ROAS 1.60 | 2026-09-09` står **PAUSED sedan
2026-09-15 20:52 CEST med 4 657 kr spend** — pausad av Axel för hand. PAUSED med
spend är ett beslut: kön behandlar kampanjen som avvecklad och vägrar ladda upp
dit. Nattvakten hade redan konstaterat samma sak natten till 16/9 (commit
`e515632`) och pausat briefronden i registret.

Kön var dessutom tom: 0 rader i `To be Reviewed`, inga nya leveranser från
Jasper. Pris läst live ur butiken: 389 kr. Inget rördes i kontot.

### ⚠️ Norge kör vidare och är LÖNSAMT — det saknades i nattens bild

Nattvaktens siffror räknade bara Sverige. Båda kampanjerna, 7 dagar,
lästa ur Meta 2026-09-16:

| Kampanj | Status | Spend 7d | Köp | ROAS | Mot break-even 1,60 |
|---|---|---:|---:|---:|---|
| `DRYTREK_NO_Damasker Vandring` | **ACTIVE, 1 000 kr/dag** | 6 306 kr | 22 | **1,78** | **över — lönsam** |
| `DRYTREK_SE_Damasker Vandring` | PAUSED 15/9 | 4 657 kr | 8 | 0,73 | under |

Norge har alltså både mer spend och fler köp än Sverige hade, och ligger över
break-even. Ingen har rört den kampanjen. Det är samma produkt, samma pris och i
stor utsträckning samma creatives — skillnaden ligger i marknaden, inte i
materialet. **Skriv aldrig "DryTrek går back" utan att säga vilken marknad som
avses.**

### ⚠️ Break-even-CPA 243 kr är för lågt satt i alla briefer

Briefarnas `243 kr` kommer ur `389 / 1,60`, alltså antagandet att varje kund
köper ett par. Verkligt ordervärde, räknat som `spend × ROAS ÷ köp` (metoden
CLAUDE.md föreskriver, eftersom `omni_purchase_values` är buggig):

| Marknad | Intäkt 7d | Köp | AOV ≈ | Break-even-CPA ≈ (AOV / 1,60) |
|---|---:|---:|---:|---:|
| NO | 11 225 kr | 22 | **510 kr** | **319 kr** |
| SE | 3 400 kr | 8 | **425 kr** | **266 kr** |

Paketnivåerna säljer alltså. Med rätt tal är Norges CPA 287 kr **under** sin
break-even — samma dom som ROAS 1,78 ger, nu räknad två vägar.

**Ingen tidigare dom ändras av det här:** annonserna ronden pausade låg på
463 kr och 550 kr per köp, över även den korrigerade nivån. Men 243 kr är en
för hård grind för kommande annonser, och talet står i varje brief och i
nattvaktens annonsregel. ⚠️ **Ska in i `dna.md` vid nästa `/cs`** — ROAS är
avrundad till två decimaler, så AOV-talen är ungefärliga och bör räknas om på
ett längre fönster innan de skrivs som fasta.

Hubben: 38 Draft, 31 Approved, 0 i översättningskön, 10 parkerade
`Damasker_*`-rader kvar orörda.

---

## Norge 2026-09-16 — tom kö, men prisavläsningen visade sig ljuga

Rutinen triggade 13:50 UTC. **0 rader** i `SE-ACTIVE to be translated` — inget
att översätta. Kön har varit tom sedan de två sista gick live i går.

Men en siffra i körloggen hade bytt betydelse över natten. Där det i går stod
`Pris ur butiken: 389 SEK` stod det i dag `389 NOK` — samma tal, ny valuta.

**Talet 389 NOK finns inte.** Mätt samma dag:

| Källa | Svar |
|---|---|
| `/nb/products/damasker.json` | 389 — **basvalutan**, och svaret säger inte vilken |
| `/nb/products/damasker?country=NO` | **379,00 kr**, `"priceCurrency":"NOK"` i JSON-LD, 18 av 18 |
| `/nb/products/damasker` utan `?country=NO` | SEK |
| `/products/damasker` (SE) | SEK |

Shopifys `.json`-endpoint svarar **alltid** i butikens basvaluta och nämner den
aldrig. Den nya marknadskoden i `tools/ops-leveranskon.mjs` läste det talet och
**stämplade på marknadens valuta**. Norges riktiga pris är 379 NOK (jämförpris
633), inte 389.

Samma fel på alla NO-butiker, ~2,5 % i storlek eftersom det är SEK→NOK-kursen:

| Butik | `.json` (bas) | marknadens sida | gammal utskrift |
|---|---|---|---|
| DryTrek | 389 SEK | **379 NOK** | 389 NOK |
| HeimGuard | 799 SEK | **779 NOK** | 799 NOK |
| TackleBay | 289 SEK | **282 NOK** | 289 NOK |
| CaraShell US | 199 USD | 199 USD | 199 USD ✅ (carashell.com har USD som basvaluta) |

**Ingen annons stoppades eller släpptes fel av det här.** Stoppregeln går på
20 % avvikelse och felet är 2,5 %. Skadan är en annan: rule 4 säger att ett
NOK-pris aldrig får hittas på, och loggraden såg ut som en mätning. En session
som läst "389 NOK" hade kunnat skriva in det i norsk copy i god tro.

**Lagat:** `hamtaPris` läser marknadens egen sida med `?country=<land>` och
plockar pris + `priceCurrency` ur JSON-LD:n när marknadens valuta skiljer sig
från butikens (`prisUrJsonLd`, 2 nya tester). Går det inte rapporteras
basvalutans tal **med basvalutans namn och skälet** — aldrig marknadens valuta
på ett omräknat tal. Verifierat mot fyra butiker och två marknader.
`npm test` 1 288/1 288.

⚠️ **De norska annonser som kör nu säger 389 kr** (de äldre 381/635) medan
butiken visar **379 kr / 633 kr** för norska kunder. Inbränt i bild och
inläst i voiceovern — går inte att rätta utan omrendering. Axel har redan
sagt nej till att skriva om dem för 381/635-avvikelsen (2026-09-13), och
den här är mindre. Ingen åtgärd, men skrivet så nästa session inte tror
att 389 är norskt facit.

⚠️ **Lärdomen, samma familj som gårdagens:** ett tal som bär fel etikett ser
exakt ut som ett mätt tal. `.json`-endpointen svarar villigt med en siffra på
varje språkprefix — den siffran är bara aldrig marknadens. Läs valutan ur
samma svar som priset, eller rapportera att du inte kunde.

---

## Nattvakten 2026-09-17 (körning nr 6, ingen briefdag) — SE pausad, NO torrkörd

SE: `DRYTREK_SE` PAUSED (ägaren 15/9), 0 ändringar. 7d 4 641 kr / 8 köp / 0,73.
Briefronden pausad (18 batch #3-briefer i Draft).

**NO torrkörd för första gången** (`--marknad NO --torr`, inget skrivet):
`DRYTREK_NO` ACTIVE 1 000 kr/dag, 7d **7 109 kr / 26 köp / ROAS 1,84** (över
break-even 1,60), 3d 2 870 kr / 10 köp / 1,58. Reglerna hade gjort 3 ändringar:
sänkt 1 000 → 700 kr (vinst 3d −0,8 %), pausat `Gamasjer_NO_PD_2_1` (2 386 kr,
8 köp, CPA 298 mot BE-CPA 243) och `NO_PD_14_15` (469 kr, 1 köp). Benchmark
`Gamasjer_NO_PD_1`: 2 241 kr, 11 köp, CPA 204 — 100 % av vinstbidraget.
⚠️ **BE-CPA 243 är fel för NO**: verklig AOV ≈ 510 kr (leveransrundan 16/9,
26 order) ⇒ BE-CPA ≈ 319 kr. Med 319 hade ronden pausat **ingenting**.
Rutinen dömer bara SE tills Axel säger annat — frågan ställd i Discord.
Underlag: `factory/output/drytrek/budgetrond-2026-09-17-NO.json`.

---

## 2026-09-17 — leveransrunda: oförändrat läge, men Norge fortsätter uppåt

Andra dagen utan SE-kampanj att leverera till. `DRYTREK_SE_Damasker Vandring`
står kvar PAUSED sedan 15/9 20:52, orörd. Kön var tom. Inget laddades upp,
inget rördes i kontot. Pris läst live: 389 kr.

**Norge stärks, andra avläsningen i rad över break-even:**

| Mätdag | Spend 7d | Köp | ROAS | Mot break-even 1,60 |
|---|---:|---:|---:|---|
| 2026-09-16 | 6 306 kr | 22 | 1,78 | över |
| 2026-09-17 | 7 113 kr | 26 | **1,84** | **över, och stigande** |

Sverige samma fönster 2026-09-17: 4 641 kr, 8 köp, ROAS 0,73. Det talet ändrar
sig inte längre — kampanjen är avstängd, siffran rullar bara ut ur fönstret.

Två avläsningar är inte ett bevis, men riktningen är entydig och den håller
även när spenden ökar. Det här är det enda stället i DryTreks historik där en
marknad ligger över break-even. **Skrivs in i `dna.md` vid nästa `/cs`**, med
den tidigare noteringen om att break-even-CPA 243 kr är för lågt satt.

Ägarfrågan om omstart av Sverige står obesvarad i Discord `#ads-to-do` sedan
15/9. Ingenting här väntar på den — rutinen rapporterar tyst tills den besvaras.

---

## Norge 2026-09-17 — tom kö, andra dagen

**0 rader** i `SE-ACTIVE to be translated`. NO-kampanjen orörd: 47 annonser,
samtliga ACTIVE (PD 27, SP 8, CS 4, G 4, FO 2, CI 1, BOF 1). Ingenting når den
här kön förrän leveransrundan har något att skicka vidare.

Gårdagens prisfix bevisade sig direkt: butiken läses i dag till **382 NOK** mot
379 i går. Kursen rörde sig, och siffran följde med — för att den hämtas ur den
norska sidan vid varje körning i stället för att räknas om eller antas. Med det
gamla verktyget hade det stått 389 båda dagarna.

---

## 2026-09-18 — nattvakten, körning nr 7 (ingen briefdag att köra: ronden pausad)

SE: `DRYTREK_SE_Damasker Vandring` PAUSED sedan 15/9 20:52, **0 ändringar**,
inget aktiverat. 7d-fönstret bär bara spend före pausen: 3 785 kr, 6 köp,
ROAS 0,69 — rullar ut dag för dag. Registret sa "briefdag JA — ikappkörning"
(senaste brief 13/9), men `Briefrond:` står på PAUS ⇒ noll briefer, ingen
`brief-kord`. Hubben oförändrad: 19 batch #3-rader i Draft (skapade 12/9),
10 videor i Creative strat review, 31 Approved.

**Norge, torrkörning (inget skrivet) — första dippen:**

| Mätdag | Spend 7d | Köp | ROAS 7d | ROAS 3d |
|---|---:|---:|---:|---:|
| 2026-09-16 | 6 306 kr | 22 | 1,78 | — |
| 2026-09-17 | 7 109 kr | 26 | 1,84 | 1,58 |
| 2026-09-18 | 6 957 kr | 24 | **1,65** | **1,37** |

Reglerna hade i natt sänkt 1 000 → 700 kr (vinst 3d −10,6 %) och pausat
`Gamasjer_NO_PD_2_1` (2 485 kr, 8 köp, CPA 311), `NO_Damasker_PD_14_14`
(702 kr, 1 köp) och `PD_14_15` (558 kr, 1 köp). Benchmark `Gamasjer_NO_PD_1`:
2 590 kr, 12 köp, CPA 216, 100 % av vinstbidraget. Med BE-CPA ≈ 319 kr
(verklig NO-AOV ≈ 510) hade bara de två PD_14-bilderna pausats — PD_2_1 är
lönsam på det talet. Rutinen dömer fortfarande bara SE; frågan (YES/NO) och
A/B/C-frågan om SE står obesvarade i Discord `#ads` sedan 15/9 resp. 17/9.
Underlag: `factory/output/drytrek/budgetrond-2026-09-18{,-NO}.json`.

---

## 2026-09-18 — leveransrunda: BÅDA marknaderna pausade, produkten står helt still

`DRYTREK_NO_Damasker Vandring` **pausades för hand 2026-09-18 kl 11:28 CEST**.
Sverige har stått pausad sedan 15/9. Båda kampanjerna är därmed avstängda med
spend — beslut, aldrig något att "rätta". Ingen rutin gjorde det: nattvakten
körde NO **torrt** samma natt (commit `451ff5b`) och ändrade noll.

Leveransrundan har alltså inte bara en tom kö, den har **ingen marknad att
leverera till alls**. Inget laddades upp, inget rördes i kontot.

### ⚠️ Rättelse: Norge vände nedåt, tvärtemot vad jag skrev igår

Loggposten 2026-09-17 sa "Norge stärks, andra avläsningen i rad över
break-even" och kallade riktningen entydig. **Det höll inte.**

| Mätdag | Spend 7d | Köp | ROAS 7d |
|---|---:|---:|---:|
| 2026-09-16 | 6 306 kr | 22 | 1,78 |
| 2026-09-17 | 7 113 kr | 26 | 1,84 |
| **2026-09-18** | **6 966 kr** | **24** | **1,65** |

Nattvakten mätte dessutom **3d-fönstret till ROAS 1,37** samma natt, alltså
under break-even 1,60. Sverige samma fönster: 3 785 kr, 6 köp, ROAS 0,69.

**Lärdomen, och den är min:** två avläsningar i ett rullande 7-dagarsfönster är
inte en trend. Fönstret tappar en dag i ena änden och lägger till en i andra, så
två punkter kan peka uppåt utan att något blivit bättre. Jag skrev ändå
"riktningen är entydig". Rätt sätt är att läsa det kortare fönstret bredvid det
långa — 3d mot 7d — eller vänta på tre avläsningar. Det korta fönstret hade
visat vändningen ett dygn tidigare.

Frågan om omstart av Sverige står fortfarande obesvarad i Discord `#ads-to-do`
sedan 15/9. Ny fråga ställd i `#annons-uppladdning` idag: ska den här
leveransrutinen pausas nu när ingen marknad är igång? (HeimGuards NO-rutin
stängdes av på samma sätt 2026-09-13 när Axel pausade den marknaden.)

---

## Norge 2026-09-18 — NO-kampanjen PAUSAD av ägaren, kön tom

Rutinen triggade 13:50 UTC. **0 rader** i `SE-ACTIVE to be translated`, och
`DRYTREK_NO_Damasker Vandring | BE-ROAS 1.60 | 2026-09-09` står **PAUSED med
8 450 kr spend** sedan i dag **11:28 CEST** — alltså knappt två och en halv
timme före körningen.

Läget är `/ops-oversatt`s andra rad i tabellen: *kampanjen finns men är PAUSED
med spend*. Ingenting laddades upp, ingen rad rördes, ingen status ändrades.
Kön är dessutom tom, så pausen håller ingenting kvar.

**Siffrorna stödjer beslutet** — det här var ingen vinnare som stängdes av:

| Fönster | Spend | Köp | ROAS | mot break-even 1,60 |
|---|---|---|---|---|
| 3 dygn | 2 829 kr | 9 | **1,36** | UNDER |
| 7 dygn | 6 966 kr | 24 | 1,65 | precis över |
| 14 dygn | 8 054 kr | 29 | 1,78 | över |
| Livstid | 8 450 kr | 31 | 1,82 | över |

CPA rör sig åt fel håll i takt med det: 273 kr livstid → 278 (14d) → 290 (7d)
→ **314 kr (3d)**, mot en break-even-CPA som priset 389 kr sätter. Trenden pekar
nedåt genom varje fönster. Att döma på livstidens 1,82 hade varit precis det
ANALYSMETOD.md varnar för.

⚠️ **Kampanjen får inte slås på igen av någon session eller rutin.** PAUSED med
spend är ett beslut. `/ny-annonser` ska ALDRIG föreslås här — den hade byggt en
andra NO-kampanj bredvid den pausade och dubblat spenden.

Priset lästes till **380 NOK** (382 den 17:e, 379 den 16:e). Den levande
avläsningen fortsätter följa kursen, som den ska.

---

## 2026-09-19 — nattvakten, körning nr 8: båda marknaderna avstängda, 0 ändringar

SE: `DRYTREK_SE_Damasker Vandring` PAUSED sedan 15/9, **0 ändringar**, inget
aktiverat. 7d: 2 998 kr, 6 köp, ROAS 0,87 — bara spend före pausen; 3d 0 kr.
NO: `DRYTREK_NO_Damasker Vandring` pausades av Axel 18/9 11:28 (8 450 kr
livstid, 31 köp, ROAS 1,82 livstid men 1,36 på 3 dygn). Ingen torrkörning i
natt — PAUSED med spend är ett beslut och rutinen rör det aldrig. Frågan om
NO-styrning (ställd 17/9 och 18/9) är därmed stängd av pausen.

Produkten står helt still: noll spend, noll aktiva annonser. Briefronden
pausad (registret säger "briefdag JA — ikappkörning", `Briefrond:` PAUS ⇒ noll
briefer, ingen `brief-kord`). Hubben oförändrad tredje natten: 19 batch
#3-rader i Draft, 10 videor i Creative strat review, 31 Approved.
`products/drytrek/feedback.md` saknas — produkten har aldrig briefgranskats
(nytt steg 0 i kommandot sedan 18/9).

Discord `#ads`: A/B/C-frågan om SE står kvar sedan 15/9; ny fråga om rutinen
ska stängas av i Routines så länge ingen marknad är igång (HeimGuard NO-
prejudikatet 13/9). Rutinen slår aldrig på något själv.
Underlag: `factory/output/drytrek/budgetrond-2026-09-19.json`.

---

## 2026-09-19 — leveransrunda: oförändrat, andra dygnet med båda marknaderna av

Ingen förändring sedan igår. Båda kampanjerna PAUSED, kön tom, inget rört i
kontot. Pris 389 kr.

⚠️ **Norges 7d-ROAS läser 1,71 idag mot 1,65 igår — det är INTE en förbättring.**
Kampanjen har varit av sedan 18/9 11:28, så ingen ny spend kommer in; fönstret
töms bara på sina sämre dagar. Exakt det fel gårdagens rättelse handlade om,
fast åt andra hållet: **ett rullande fönster över en pausad kampanj bär ingen
signal alls.** Sverige samma dag: 2 998 kr, 6 köp, ROAS 0,87 — samma sak där.

Båda ägarfrågorna obesvarade: omstart av Sverige (`#ads-to-do`, sedan 15/9) och
om den här rutinen ska pausas (`#annons-uppladdning`, sedan 18/9). Ingen av dem
pingas om — rapporten går tyst tills något ändras.

**2026-09-19:** Oförändrat. NO-kampanjen fortfarande PAUSED (8 476 kr — de 26
kronorna sedan i går är efterattribuering, inte spend), kön fortfarande 0 rader,
priset 380 NOK. Ingenting rört. Loggas som en rad med flit: en dag utan
förändring förtjänar ingen egen rubrik.
