# CatCabin — batch-logg

Butik: catcabin.se (Shopify `ras1t2-2x`) · produkt `utekattkojan` ·
annonskonto **MagiBorsten DK `915422744950975`** (OPS Factorys gemensamma).
Break-even-ROAS 1,62 · pris 789 kr (jämförpris 1 039 kr).

---

## Batch #1 — ärvd från Bäverbutiken, 2026-09-11 (`/ny-annonser`)

Ingen ny creative producerad. Hela batchen är Bäverbutikens bevisade
källkampanj `Isolerade Utekattkojan | BE ROAS 1.62 | Launch 2026-09-09`
(MagiBorsten `1867947880635861`, kampanj `120250147309170291`), brand-swappad
till CatCabin. Annonserna bär alltså med sig sitt bevisade DNA.

**Kampanj:** `CATCABIN_SE_Utekattkojan | BE-ROAS 1,62 | 2026-09-11`
(`120249055514200172`) — CBO 1 000 kr/dag, PAUSED.

### Källans utfall (avläst 2026-09-11, två dygn efter launch)

| Annons | Spend | Köp | ROAS | Not |
|---|---|---|---|---|
| `Utekattkoja_PD_2_H1` | 1 799 kr | 5 | **2,50** | Top spender. Enda annonsen över 300 kr **och** 3 köp — den enda som får dömas (CLAUDE.md regel 3) |
| `Utekattkoja_SP_3_H1` | 578 kr | 2 | 2,73 | Över 300 kr men under 3 köp — lovande, inte dömbar |
| `Utekattkoja_PD_2_1` | 488 kr | 1 | 1,62 | Exakt break-even |
| `Utekattkoja_CS_2_1` | 234 kr | 0 | 0,00 | Under domgränsen |
| `Utekattkoja_GT_2_1` | 113 kr | 2 | 13,94 | Under domgränsen — ROAS:en är brus på 113 kr |
| Övriga 11 | 4–78 kr | 0–1 | — | Långt under domgränsen |

**Vinkeln som bär:** PD (problem/demo) — "katten sover under bilen igen".
Den står för 2 287 kr av 3 466 kr spend och 6 av 11 köp.

### Vad som ärvdes, yta för yta

Brand-detektorn läste alla sex ytor (`factory/output/utekattkojan/brand-detektor.md`)
plus en ögongranskning (`brand-syn.json`).

| Dom | Antal | Vad som gjordes |
|---|---|---|
| `ren` | 11 | Kopierade ORÖRDA. Bara `link` bytt till catcabin.se. Ingen ny copy, ingen ny voiceover, ingen ny video |
| `kräver-slutkortsbygge` | 1 | `SP_2_1`: källans "30 dagars öppet köp" → "14 dagars ångerrätt – enligt svensk lag". 0 krediter, QA före/efter |
| `bara-copy` | 1 | `CS_2_1` — se CS-kön nedan |
| `kräver-omdubb` | 3 | `CS_1/2/3_H1` — se CS-kön nedan |

**Priset behövde aldrig bytas i copyn.** CatCabin säljer 789/1 039 kr, samma tal
som källans produktsida, och produktfilen satte det så med flit just för att
brand-swappen skulle bli gratis.

### CS-kön — 4 annonser som INTE byggdes

Hela CS-konceptet är ett tidsbegränsat rabatterbjudande som CatCabin inte kör.
Det är inte ett tal att byta utan en kampanj som inte finns:

* `CS_1_H1`, `CS_2_H1`, `CS_3_H1` — talet läser upp "från 1059 kronor ner till
  809" (butiken: 789/1 039) och lovar "erbjudandet gäller bara idag",
  "lagret krymper". Samma text är dessutom inbränd.
* `CS_2_1` — röd banderoll i 45° med "24% RABATT – IDAG / Endast få kvar i
  lager". Rabattsatsen 24 % stämmer faktiskt mot butikens priser; det är
  "IDAG" och lagerlarmet som är falska.

**Kräver ett ägarbeslut**, inte ett fix: ska CatCabin köra en tidsbegränsad
kampanj? Säger Axel ja sätts `butik.erbjudande.tidsbegransat: true` och priset
rättas — då blir det omdubb (HeyGen har 10 148 krediter) + ny inbränd text.
Säger han nej stannar CS-konceptet på Bäverbutiken.

### Norge — inte byggt

Källan finns: `Isolert Utekattehus NO | BE-ROAS 1,62 | 2026-09-11`
(Magiborsten NO `1050941584152547`, kampanj `120252183459760233`), 11 ACTIVE
annonser, prefix `Utekattehus_NO_`. Bäst: `NO_PD_2`, 239 NOK / 1 köp / ROAS 3,54.

**Stoppad på valutan.** CatCabins NO-marknad står i **SEK**, inte NOK — mätt mot
den riktiga sidan 2026-09-11: både `/` och `/nb` svarar `"currency":"SEK"`.
De norska källannonserna läser upp 809 NOK / 1 059 NOK. En norsk kund skulle
höra ett NOK-pris och mötas av SEK i kassan.

Kör `/ny-annonser catcabin` igen när NOK är påslaget i Shopify (checklistans
avsnitt 5) och NOK-paketnivåerna är satta — då byggs `CATCABIN_NO_…`.

### Öppna frågor

1. **CS-konceptet** — tidsbegränsad kampanj eller inte? (se ovan)
2. **"Tusentals kattägare"** i SP-copyn och SP-talet. Påståendet gäller
   produkten, inte butiken, och följde därför med orört enligt regeln om att
   inte skriva om det som inte är fel. Men CatCabin har 10 recensioner i egen
   kassa. Axels beslut om det ska stå kvar.
3. **`inkopskostnad: 302`** är härledd ur källkampanjens namn, inte kvitterad
   mot Temu. Break-even 1,62 vilar på den. Bekräfta före första budgetronden.
