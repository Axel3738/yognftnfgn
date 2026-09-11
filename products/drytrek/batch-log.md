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

*(Utfall skrivs vid nästa briefdag. Grinden: ≥ 300 kr OCH ≥ 3 köp per annons.)*
