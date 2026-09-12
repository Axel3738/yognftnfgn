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

---

## LAUNCHAD 2026-09-12

Axels kommando: `Launch: CATCABIN_SE_Utekattkojan`.

`CATCABIN_SE_Utekattkojan | BE-ROAS 1,62 | 2026-09-11` (`120249055514200172`)
— **ACTIVE**, CBO 1 000 kr/dag, tillbakaläst på alla tre nivåer:
kampanj ACTIVE · 4/4 adsets ACTIVE · 13/13 annonser ACTIVE.
Fem annonser stod `IN_PROCESS` direkt efter launch, vilket är Metas normala
bearbetning och inte ett fel.

| Adset | Annonser |
|---|---|
| PD | `PD_1_H1`, `PD_2_H1`, `PD_3_H1`, `PD_2_1` |
| GT | `GT_1_H1`, `GT_2_H1`, `GT_3_H1`, `GT_2_1` |
| SP | `SP_1_H1`, `SP_2_H1`, `SP_3_H1`, `SP_2_1` |
| CS | `CS_2_1` |

### Kontroller före launch

* Butiken live: `catcabin.se` och produktsidan svarar 200, inget `/password`.
  Produktsidan visar 789,00 kr — samma tal som annonserna bygger på.
* ⚠️ **Pixeln `1101742182294878`: `last_fired_time` TOMT.** Butiken hade noll
  besökare (öppnad samma dag), så mätningen kan inte skilja "okopplad" från
  "obesökt" — en pixel utan trafik kan aldrig ha avfyrat, hur rätt kopplad den
  än är. Försök att framkalla en avfyrning med Chromium misslyckades: agentproxyn
  klarar inte webbläsarens tunnel (`ws_closed_mid_exchange`). Axel uppgav att
  WeTracked var fixat, och launchade på det.
  **Kolla pixeln igen när trafik börjat komma.** Utan den spenderas budget utan
  attribution.

### CS-videorna — Axels beslut: gör inget

De tre (`CS_1_H1`, `CS_2_H1`, `CS_3_H1`) läser upp fel pris — "från
ettusenfemtionio kronor ner till åttahundranio", alltså 1059 → 809, medan
butiken säljer för 789 (jämförpris 1039). Axel: *"sätt priset till 809 kr i
Norge endast eller gör inget alls och låt felet bestå"*. De tre är svenska och
berörs inte av ett norskt pris, så utfallet blev **gör inget**.

De är därmed inte uppladdade. "Låt felet bestå" gäller källmaterialet — ingen
annons med fel prislöfte har publicerats. Vill man ha dem senare krävs omdubb av
prisrepliken plus ny inbränd text; orsaken står i
`factory/output/utekattkojan/uteslutna.json`.

**Räkningen: 13 av 16 — DELVIS KLART**, och det är rätt utfall givet beslutet.
