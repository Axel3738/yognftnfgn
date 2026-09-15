# CatCabin — batch-logg

Butik: catcabin.se (Shopify `ras1t2-2x`) · produkt `utekattkojan` ·
annonskonto **MagiBorsten DK `915422744950975`** (OPS Factorys gemensamma).
Break-even-ROAS 1,62 · pris 789 kr (jämförpris 1 039 kr).
Notion-hub: `catcabin creative hub` (`3da270ab-908c-80f6-9663-caff35a3c895`).

⚠️ **Hub-id:t byttes 2026-09-14.** Bygget 2026-09-12 skapade
`3d9270ab-908c-8145-8538-d55aaaf4a7e2`; den svarar 404 på `databases/<id>/query`
— integrationen "Bäverbutiken RUTINER" når dess metadata men inte innehållet, så
ingen rutin kunde läsa hubben. Axel skapade 2026-09-13 en ny för hand med samma
namn (äkta `status`-kolumn, 14 statusvärden). Mätt 2026-09-14: gammal → 404,
ny → 200 med 0 rader, alltså gick ingen data förlorad.

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

## Nattvakten 2026-09-15 — budgetrond, första körningen

Butiken hade aldrig körts före i dag (registret: "aldrig körd"). Briefronden är
pausad sedan 2026-09-14 (Axels beslut) — bara budgetdelen gick.

**Kampanjen `CATCABIN_SE_Utekattkojan`** (ACTIVE, budget 1 000 kr/dag):
3 191 kr / 2 köp på både 3 och 7 dygn, ROAS 0,49 mot break-even 1,62.
**Ingen budgetdom** — grinden går vid 300 kr OCH 3 köp, och köpen räcker inte.
Budgeten står kvar orörd.

**Pausad annons:** `CatCabin_PD_1_H1` — 1 220 kr spend (≥ 3 × target-CPA 290 kr),
1 köp till CPA 1 220 kr mot break-even 487 kr. Ny annons-regeln (Axel 2026-09-10).
Tillbakaläst ACTIVE → PAUSED.

Övriga 11 aktiva annonser ligger under 350 kr spend var — alla klassade
`for_tidigt`, ingen kill-kandidat. `CatCabin_PD_2_1` var redan PAUSED och rördes
inte. Vinstbidrag 14 d totalt: 0 kr (ingen annons över break-even).

**Ingen feedback-loop än.** Bästa signalen hittills: `CatCabin_CS_2_1`,
333 kr / 1 köp / CPA 333 kr — under break-even 487 kr, men 1 köp är inte en dom.
Briefpausen släpps med `node factory/register.mjs briefantal catcabin auto`
när 3 köp finns på en annons.
