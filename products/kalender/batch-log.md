# Batch-logg — AdventLane (Adventskalender Racingbilar)

OPS-butik nr 5 (nischbutik för adventskalendrar). Butiks-id `kalender`
(tekniskt, byts inte), produkt-id `adventskalender-racingbilar`, brand
**AdventLane**, adventlane.se. Produkten är samma fysiska kalender som
Bäverbutiken säljer.

Annonskonto: **MagiBorsten DK `915422744950975`** (OPS Factorys gemensamma konto,
SEK). Kampanjprefix `ADVENTLANERACING_`, annonsprefix `AdventLaneRacing_`.
Sida och pixel: står inte i produktfilen (`meta.page_id`/`pixel_id` tomma) —
läs dem ur kampanjen i kontot, kopiera aldrig från en annan butik.
⚠️ Förväxla aldrig med MagiBorsten `1867947880635861` = Bäverbutiken.

---

## Batch #1 — 2026-09-10 · ÄRVD från Bäverbutiken

**Inte en ny batch i vanlig mening.** Kampanjerna
`ADVENTLANERACING_SE_Racingkalendern | BE-ROAS 1,62 | 2026-09-10` (15 annonser,
4 adsets: PD, GT, CS, SP) och `ADVENTLANERACING_NO_Racingkalendern | BE-ROAS 1,62 |
2026-09-10` (13 annonser) skapades 2026-09-10 ur Bäverbutikens annonser för
samma produkt.

⚠️ **Bygget är inte loggat i repot.** Det finns ingen `byggda-annonser.json`,
`brand-detektor.md` eller `se-copy.md` för kalender (kontrollerat 2026-09-11
i `factory/output/kalender/` och `git log --all`). Det som står här är läst
ur kontot och ur källan i efterhand. **Hypotes: ej loggad.** Vad som ändrades
i copyn (brådska, citat, 30-dagarslöftet, länk) är okänt tills copyn läses ur
kontot.

**Källa:** `Adventskalendern Racingbilar | BE ROAS 1.62 | Launch 2026-09-08`
(MagiBorsten SE, `120250134672020291`), 16 ACTIVE-annonser.
**Källans utfall vid avläsning 2026-09-11 (≈ 3 dygn):** 3 147 kr, 16 köp,
ROAS 3,21, AOV 632 kr. Rådata `factory/output/adventskalender-racingbilar/kallannonser.json`.

### Ärvd historik — vad källan faktiskt bevisade

Grinden (≥ 300 kr OCH ≥ 3 köp) passeras av **två** annonser. Vinstbidrag mot
AdventLanes BE-CPA 308 kr.

| Källannons | Typ | Spend | Köp | CPA | ROAS | Vinstbidrag | Vad det säger |
|---|---|---:|---:|---:|---:|---:|---|
| `Adventskalender_PD_2_1` | bild | 1 376 kr | 8 | 172 kr | 3,85 | 1 088 kr | **Top spender och bevisad vinnare.** 44 % av spenden, 50 % av köpen. Chokladkonflikten som stillbild. |
| `Adventskalender_PD_2_H1` | video | 898 kr | 6 | 150 kr | 3,85 | 950 kr | **Bevisad.** Samma copy som PD_2_1, video. Lägst CPA, högst CVR (4,92 %). |
| `Adventskalender_GT_1_H1` | video | 594 kr | 2 | 297 kr | 2,27 | — | Presentvinkeln. Under 3 köp — ingen dom. CPA 11 kr under break-even. |
| `Adventskalender_GT_2_1` | bild | 59 kr | 0 | — | — | — | för tidigt |
| `Adventskalender_CS_2_1` | bild | 54 kr | 0 | — | — | — | för tidigt |
| `Adventskalender_GT_2_H1` | video | 39 kr | 0 | — | — | — | för tidigt |
| `Adventskalender_SP_2_1` | bild | 36 kr | 0 | — | — | — | för tidigt — **finns inte i OPS SE-kampanjen**, skäl ej loggat |
| `Adventskalender_PD_1_H1` | video | 28 kr | 0 | — | — | — | för tidigt (hook 28,8 %, hold 34,2 % — brus på 28 kr) |
| 8 annonser under 21 kr | — | 62 kr | 0 | — | — | — | ingen data (PD_3_H1, GT_3_H1, CS_3_H1, SP_1_H1, CS_1_H1, CS_2_H1, SP_2_H1, SP_3_H1) |

**Vinkelrangordning på spend i källan:** PD 2 322 kr (14 köp) · GT 709 kr (2) ·
CS 70 kr (0) · SP 45 kr (0). CS och SP är i praktiken otestade.

⚠️ **Källans ROAS går att döma AdventLane på i det här fallet** — BE-ROAS är
1,62 i båda butikerna, samma pris, samma härledda inköp. Men copyn måste
ändras (brådska, citat, villkor — se `dna.md`), så SP- och CS-utfallen hos
AdventLane är **nya hypoteser**, inte fortsättningar.

### Vad som (borde ha) ändrats i överföringen

| Yta | Läge i källan | Krav hos AdventLane | Verifierat i kontot? |
|---|---|---|---|
| Länk | baverbutiken.se | adventlane.se | ❌ ej läst |
| Pris | 499 / 649 kr | identiskt | — |
| Brådska (CS) | "bara idag", "slut innan jul" | bort — stående pris, ingen hype | ❌ ej läst |
| Social proof (SP) | citat ingen kund sagt, "Verifierad kund, 34 år" | en av de tio riktiga recensionerna, ordagrant | ❌ ej läst |
| Villkor (SP) | "30 dagars öppet köp – nöjd eller pengarna tillbaka" | 14 dagars ångerrätt, inget eget löfte | ❌ ej läst |
| Fraktvillkor | ej nämnt i copyn | fri frakt SE + NO | — |
| Norska kampanjen | — | egna norska annonser för kalendern | ✅ copyn är kalenderns, på norska, länk adventlane.se/nb (läst 2026-09-11) |
| Norskt pris (CS) | — | sidan tar SEK 499 tills NOK finns (butikskonfig) | ❌ **`_NO_CS_*` säger "579 kr → 439 kr i dag" + "begrenset lager"** — troligen fel pris, säkert falsk brådska (dna.md rotorsak 3; kundvyn ej läst, lösenordsskyddad) |

### Ekonomi

Pris 499 kr, inköp 191 kr (härledd), utan moms. **TB 308 kr · BE-ROAS 1,62 ·
BE-CPA 308 kr · target-CPA 183 kr.** Facit `factory/produkter/adventskalender-racingbilar.yaml`.

### Hypoteser att pröva i första `/cs`

1. Håller PD-vinkeln (chokladkonflikten, 74 % av källans spend, 14 köp) hos
   AdventLane med samma copy? Källans två vinnare har 0 resp. 2 kr på OPS —
   CBO:n har inte gett dem chansen än.
2. Bild eller video? Källan säger "lika ROAS, bilden skalar, videon
   konverterar". Första riktiga testet: samma PD-koncept som bild OCH video i
   samma batch, allt annat lika.
3. GT-vinkeln (hook 32 %, CPA 297 kr på 2 köp) — konverterar den när den får
   ett skäl att köpa nu (leveranstid 5–10 dagar → "beställ före …"), utan att
   bli falsk brådska?
4. CS och SP med rättad copy (stående pris, riktig recension, 14 dagar) — helt
   nya hypoteser, 0 kr bakom sig.

### Utfall vid avläsning 2026-09-11 (setup, ≈ 1 dygn)

SE: **372 kr, 0 köp.** Ingen annons över grinden. Per annons (data, ingen dom):

| Annons | Spend | Köp | Hook 3 s | Hold | CTR | Länkklick | Status |
|---|---:|---:|---:|---:|---:|---:|---|
| AdventLaneRacing_PD_1_H1 | 226 kr | 0 | 23,3 % | 23,4 % | 3,79 % | 31 | ACTIVE — 61 % av spenden |
| AdventLaneRacing_GT_3_H1 | 53 kr | 0 | 23,8 % | 17,5 % | 2,45 % | 6 | ACTIVE |
| AdventLaneRacing_CS_1_H1 | 25 kr | 0 | 43,8 % | 15,4 % | 2,25 % | 0 | ACTIVE |
| AdventLaneRacing_GT_2_H1 | 24 kr | 0 | 32,1 % | 8,9 % | 2,14 % | 2 | ACTIVE |
| AdventLaneRacing_CS_3_H1 | 13 kr | 0 | 25,9 % | 0 % | 3,45 % | 1 | ACTIVE |
| AdventLaneRacing_SP_1_H1 | 9 kr | 0 | 29,5 % | 16,7 % | 1,64 % | 1 | ACTIVE |
| AdventLaneRacing_SP_3_H1 | 8 kr | 0 | 17,0 % | 11,1 % | 0 % | 0 | ACTIVE |
| AdventLaneRacing_GT_1_H1 | 8 kr | 0 | 34,9 % | 13,3 % | 2,33 % | 1 | ACTIVE |
| 7 annonser ≤ 2 kr | 6 kr | 0 | — | — | — | — | ACTIVE (PD_3_H1, **PD_2_H1 2 kr**, CS_2_1, SP_2_H1, **PD_2_1 0 kr**, GT_2_1, CS_2_H1) |

NO: 16 annonser (13 med spend), ≈ 445 kr, 0 köp (`AdventLaneRacing_NO_PD_2_1`
373 kr, CTR 3,25 %). Copyn verifierad som kalenderns. ⚠️ CS-annonserna bär
439 kr mot sidans SEK 499 — `dna.md` rotorsak 3.

Nästa avläsning: första briefdagen (söndag 2026-09-13 enligt registret).
