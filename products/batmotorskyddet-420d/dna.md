# Creative DNA — Båtmotorskyddet 420D

Skapad 2026-09-02 av `/forsta-batch` (körning nr 1, automatisk rutinkörning via
`agent/rond.mjs`-behovet `forsta_batch`). Datakälla: MagiBorsten `1867947880635861`,
kampanj `120250009325850291` ("Båtmotorskyddet 420D | BE ROAS 1.62 | Launch
2026-08-29"), livstid 2026-08-29 → 2026-09-02 (hämtat `date_preset: maximum`).

## Produktfakta (verifierade mot produktsidan + Shopify GraphQL 2026-09-02)

- **Båtmotorskydd 420D – Heltäckande för Utombordare**
  (`batmotorskydd-420d-heltackande-for-utombordare`), baverbutiken.se.
- **Pris 579 kr, jämförpris 965 kr → 386 kr / 40 % rabatt** (verifierat via
  Shopify `compareAtPrice`, exakt samma tal som annonsen `CS_2_1` redan
  påstår — inget prisglapp).
- Material: **420D Oxford-tyg**. Täcker **kåpan ner över riggen** (hela
  motorn, inte bara toppen). 9 storlekar, 0–5 hk till 250–350 hk. Inga
  verktyg — dras över, spänns med en rem.
- Garanti: **30 dagars öppet köp**, Klarna-betalning (från produktsidan).
- **8 recensioner, snitt 5,0 stjärnor** (Judge.me-metafält, verifierat
  2026-09-02). Verbatim-citat sparade nedan — använd ordagrant, aldrig
  omskrivna.
- Break-even-ROAS **1,62×** (ur kampanjnamnet). Break-even-CPA = 579 / 1,62
  = **357,41 kr**.
- Meta Ad Library, svensk sökterm "båtmotorskydd": 13 träffar, samtliga
  Bäverbutikens egna annonser. **Ingen konkurrent hittad** — inget
  konkurrent-swipe att luta sig mot för den här produkten ännu.

## Riktiga recensioner (Judge.me, verifierade 2026-09-02 — använd ordagrant)

| Recension | Reviewer |
|---|---|
| "Skyddet känns hållbart och är lätt att sätta på." | Fredrik Larsson |
| "Bra skydd mot regn och smuts. Jag är nöjd." | Johan Karlsson |
| "Känns starkt och sitter bra på motorn." | Mikael Svensson |
| "Enkelt att sätta på och bra material." | Lars Johansson |
| "Skyddet passar bra och håller motorn ren." | Anders Nilsson |
| "Gör jobbet bra och motorn hålls ren." | Daniel Lindberg |
| "Lätt att använda och täcker motorn bra." | Peter Andersson |
| "Bra skydd när båten står ute. Väldigt nöjd." | Thomas Eriksson |

De två första användes i batch #1 (`Batmotor_RV_2_1`, `Batmotor_RV_3_1`,
`Batmotor_RV_1_H1`). Övriga sex är obrukade och ligger i backloggen.

## Datakvalitet

*(2026-09-02, batch #1)* `amount_spent × purchase_roas` summerat per annons
(14 692,09 kr) stämmer mot kampanjnivåns `amount_spent × purchase_roas`
(14 688,4 kr) inom 0,1 % — ingen trasig rad. `omni_purchase` summerar exakt
till kampanjens 23 köp. `omni_purchase_values` användes INTE (känd bugg).
Video kunde inte öppnas/transkriberas — thumbnails nedladdade men för
lågupplösta (1 772 byte) för en meningsfull jämförelse. Flaggat som
datalucka i FAS 6b, ingen gissning gjord om vad som faktiskt skiljer H1 från
H3 i bild.

⚠️ **Olöst avvikelse, upptäckt 2026-09-05:** livstidsspenden (`date_preset:
maximum`) var 8 935,71 kr (44 köp) den 2026-09-05 — LÄGRE än de
14 692,09 kr (23 köp) som stod här från 2026-09-02, trots att kampanjen körts
oavbrutet däremellan och ROAS/spend bara kan öka över tid för en aktiv
kampanj. Kontrollerat på nytt 2026-09-05: ad-nivåns summa (8 935,71 kr)
stämmer mot kampanjnivåns eget `amount_spent` (8 935,71 kr) inom 0,1 %, och
`last_3d`-utfallet (4 898,13 kr, 22 köp, ROAS 3,03) matchar de tal
huvudsessionen redan verifierat samma dag inför budgethöjningen — så
2026-09-05-siffrorna är internt konsistenta. Roten till varför 2026-09-02-talet
var högre är **okänd** och inte utredd här (ingen gissning gjord). Använd
2026-09-05-siffrorna nedan som sanning för den här körningen; flagga vidare
om nästa `/cs` ser samma mönster.

## Siffrorna 2026-09-05 (bedömbara annonser, ≥300 kr + ≥3 köp; BE-ROAS 1,62, BE-CPA 357,41 kr)

Kampanjens livstid (`maximum`, 2026-09-05): 8 935,71 kr spend, 44 köp,
ROAS 3,24. Dagsbudget höjd samma dag av huvudsessionen 1 950 → 2 300 kr
(snabbspår, ROAS ≥ 3). Senaste 3 dagar: 4 898,13 kr, 22 köp, ROAS 3,03.

| Annons | Format | Vinkel | Spend | Andel spend | Köp | CPA | ROAS | **Vinstbidrag** |
|---|---|---|---|---|---|---|---|---|
| **Batmotor_SP_1_H1** | video | social proof | 2 053,51 kr | 23,0 % | 14 | 146,68 kr | 4,66 | **+2 950,22 kr (48,2 %)** |
| Batmotor_CS_2_1 | statisk | offer (40 % rabatt, falsk brådska) | 1 656,52 kr | 18,5 % | 12 | 138,04 kr | 4,44 | +2 632,44 kr (43,0 %) |
| Batmotor_SP_1_H3 | video | social proof (IDENTISK copy som H1) | 2 674,81 kr | **29,9 % (toppspendern)** | 9 | 297,20 kr | 2,72 | +541,89 kr (8,8 %) |

*Vinstbidrag = (357,41 − CPA) × köp. Totalt bedömbart vinstbidrag: 6 124,55 kr.
Spend-andelarna räknas mot kampanjens totala 8 935,71 kr, inte bara de tre
bedömbara raderna.*

**Uppdaterat fynd (var 2026-09-02: `SP_1_H3` löste ut som förlorare, ROAS 1,14):**
`SP_1_H3` har återhämtat sig till ROAS 2,72 (klart över break-even 1,62) men är
fortfarande klart svagast av de tre bedömbara — den tar 30 % av spenden men
bara 9 % av vinsten, medan `SP_1_H1` och `CS_2_1` tar tillsammans 41 % av
spenden och 91 % av vinsten. Slutsatsen från 2026-09-02 (hook-videot är den
avgörande variabeln) står fast riktningsmässigt, men "förlorare"-domen på
`SP_1_H3` var preliminär (ANALYSMETOD 2c) och håller inte längre — den är en
**svagare vinnare**, inte en förlorare. Döm aldrig en 3–4-köpsdom som evig.

**För tidigt (ingen dom):** `PD_1_H3` (599,56 kr, 2 köp — under 3-köpsgränsen
trots passerad spendgräns), `BF_3_1` (513,80 kr, 2 köp, ROAS 1,80 — nära
break-even), `PD_5_1` (319,54 kr, 0 köp), samt alla batch #1-statiska under
300 kr (`CS_4_1`, `BF_1_1`, `BF_2_1`, `CO_1_1`, `TR_1_1`, `LI_1_1`, `RI_1_1`,
`RV_2_1`, `RV_3_1`) och äldre för-tidigt-poster (`GT_1_H1/H2/H3`, `GT_2_1`,
`PD_1_H1/H2`, `PD_2_1`, `PD_EXTRA`, `SP_1_H2`, `SP_2_1`).

## Winning DNA

- **Hook-videot är den avgörande variabeln, inte manuset.** Bevisat genom en
  kontrollerad jämförelse (samma copy, samma titel, samma CTA, olika
  video_id) mellan två bedömbara annonser. Riktningen står fast 2026-09-05
  (`SP_1_H1` ROAS 4,66 mot `SP_1_H3` ROAS 2,72), även om gapet krympt sedan
  2026-09-02. **Nästa steg: fler hook-varianter av samma manus, inte nya
  manus — batch #2 (2026-09-05) briefar två till: `SP_1_H5` (mekanism-demo)
  och `SP_1_H6` (problem-hook), utöver `SP_1_H4` från batch #1 som ännu
  inte producerats.**
- Social proof-vinkeln ("så många har redan bytt") fungerar trots att
  hook-raden i sig är abstrakt (klarar inte tre-frågorstestet strikt läst —
  "så många" går inte att visualisera). Hypotes: det är feature-bullets +
  produktbilden som gör jobbet, inte öppningsraden. Nya varianter (batch #1)
  byter öppningsraden mot konkreta, verifierbara fakta (8/8 recensioner,
  materialfakta) med samma struktur i övrigt.
- Offer-statisk med äkta rabatt (40 %, verifierad) fungerar som fristående
  format utan video (`CS_2_1`, 2026-09-05: ROAS 4,44, 43 % av vinsten).
- **NY 2026-09-05: riktig lifestyle-bild (produkten på en verklig båt vid
  brygga/marina) slår ren studiobakgrund.** `CS_2_1` (verklig båt/marina,
  bedömbar vinnare) och `PD_5_1` (verklig båt/trailer vid brygga, för tidigt
  men CTR 1,70 %) delar visuell stil; `BF_3_1` (grå studiobakgrund,
  storleksinvändning) ligger precis på break-even (ROAS 1,80) trots högre CTR
  (2,92 %). Hypotes (2 exempel, ej ännu bevisad): behåll grå/studio bara för
  ren invändningshantering, kör riktig båtmiljö för allt annat. Batch #2
  testar två fler exempel i samma stil (`CS_6_1`, `PD_6_1`).
- **NY 2026-09-05, flaggad spänning snarare än recept:** `CS_2_1` bär både
  den vinnande båtbilden OCH den förbjudna falska brådskan ("imorgon är det
  för sent") — och är ändå kontots näst bästa vinstbidrag. Det är INTE tillstånd
  att återanvända raden (CLAUDE.md förbjuder påhittad brådska, och `CS_4_1`
  ersatte den redan 2026-09-02). Batch #2:s `CS_5_H1` (video) och `CS_6_1`
  (statisk) isolerar variabeln: samma båtbild, ärligt 40%-budskap i stället
  för brådska — för att se om bilden bär resultatet utan brådskan.

## Losing DNA

- `SP_1_H3`s videoval (okänt exakt vad, se datalucka ovan) — samma copy som
  vinnaren men klart svagare vinstbidrag. Har återhämtat sig från förlust
  (ROAS 1,14 → 2,72) sedan 2026-09-02, men bidrar fortfarande oproportionerligt
  lite (30 % spend / 9 % vinst). **Fortsätt nedprioritera videofilen bakom
  `SP_1_H3` (video_id 1602921938241449)** tills en redigerare avgör vad
  öppningen visar.
- `CS_2_1`s falska brådska ("imorgon är det för sent") — rabatten är i
  praktiken ett stående compare-at-pris, inte en daglig deal. **Upprepa
  aldrig den raden**, trots att annonsen bär den bra idag (se Winning DNA
  ovan om varför den ändå inte får kopieras). Ersatt av `CS_4_1` i batch #1
  (samma äkta rabatt, ingen påhittad deadline) — `CS_4_1` har ännu bara 1 köp
  (för tidigt).
- Gift-vinkelns öppningsrad ("Vet du inte vad du ska ge honom") är abstrakt
  — hög CTR (4,17 %/2,73 %) men noll köp hittills. Kan vara ett
  konverteringsproblem (för abstrakt CTA) eller bara för lite spend —
  omprövas när `GT_3_H1` (konkretiserad, batch #1, ej ännu producerad) har
  data.

## Batch #1-status (avläst 2026-09-05, inför batch #2)

Alla 11 statiska annonser från batch #1 är live i kontot (gick genom
`/notionkorning`/översättningsflödet — status "Translation in review" i
Notion). Alla 9 videokoncept (`SP_1_H4`, `UG_1_H1`, `AU_1_H1`, `PD_3_H1`,
`GT_3_H1`, `TH_1_H1`, `CS_3_H1`, `RV_1_H1`, `FM_1_H1`) ligger fortfarande i
Notion som "To be Reviewed"/"In progress" — **noll av dem har någonsin
spenderat en krona.** Ingen av batch #1:s nya statiska har ännu nått
signifikansgränsen (≥300 kr + ≥3 köp): Meta lägger fortfarande 86 % av spenden
på de tre gamla bedömbara annonserna. Det här är förväntat läge för en
5 dagar gammal batch, inte ett tecken på att materialet är svagt — men
`/cs`-körning nr 2 bör läsa av produktionsstatus på videokoncepten innan den
briefar en tredje omgång av samma vinklar.

## Behåll alltid
- Produkt synligt i bild/video, ingen ren lifestyle utan produkt.
- Exakt pris 579 kr / jämförpris 965 kr — aldrig andra tal.
- Verbatim recensionscitat, aldrig omskrivna eller påhittade.

## Testa kontrollerat
- Fler hook-videovarianter av `SP_1_H1`s manus (isolerad variabel) — pågår:
  `SP_1_H4` (batch #1, ej producerad), `SP_1_H5`/`SP_1_H6` (batch #2,
  2026-09-05).
- UGC/talking-head-format mot det bevisade röst+broll-formatet — pågår:
  `UG_1_H1` (batch #1, ej producerad), `UG_2_H1` (batch #2).
- Stöldskydds-vinkeln (batch #1: `TH_1_H1`, ej producerad, hypotes).
- Investeringsskydds-vinkeln (batch #1: `CS_3_H1`, ej producerad, hypotes).
- **NY 2026-09-05:** riktig båtmiljö-bild vs. äkta erbjudande utan brådska,
  isolerat i `CS_5_H1`/`CS_6_1`/`PD_6_1` (batch #2) — se Winning DNA.

## Obevisat / hypotes
- Säsongs-/haul-out-vinkeln (`FM_1_H1`) — grundad i produktsidans egen
  öppningsrad ("Snart står båten på land igen"), aldrig testad som ad hook.
- Riktig recensionsvideo (`RV_1_H1`) — ny formatidé för kontot, obeprövad.

## Modellpolicy-avvikelse (dokumenterad, samma som tidigare batcher)

Inget Agent/Task-verktyg med `model`-parameter var tillgängligt i den här
körningen. Huvudsessionen skrev all svensk copy själv och körde
tre-frågorstestet (`docs/copy-regler.md`) explicit per rad i varje brief —
samma avvikelse som redan dokumenterats för Kranskydd Frost 420D,
Surveillance Camera, IBC-Tanköverdraget och Fish rod holder NO
(2026-08-29/31, 2026-09-01), och som upprepades i batch #2 (2026-09-05,
`/cs`-körning nr 1, nattlig rond steg 4b).
