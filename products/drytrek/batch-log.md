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

*(Batch #2 skrivs av första briefdagen i `/notionscalercs drytrek` —
nästa briefdag enligt registret. Kallstart: 0 bedömbara annonser.)*
