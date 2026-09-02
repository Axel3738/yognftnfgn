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

`amount_spent × purchase_roas` summerat per annons (14 692,09 kr) stämmer mot
kampanjnivåns `amount_spent × purchase_roas` (14 688,4 kr) inom 0,1 % —
ingen trasig rad. `omni_purchase` summerar exakt till kampanjens 23 köp.
`omni_purchase_values` användes INTE (känd bugg). Video kunde inte öppnas/
transkriberas — thumbnails nedladdade men för lågupplösta (1 772 byte) för
en meningsfull jämförelse. Flaggat som datalucka i FAS 6b, ingen gissning
gjord om vad som faktiskt skiljer H1 från H3 i bild.

## Siffrorna (bedömbara annonser, ≥300 kr + ≥3 köp; BE-ROAS 1,62, BE-CPA 357,41 kr)

| Annons | Format | Vinkel | Spend | Andel spend | Köp | CPA | ROAS | **Vinstbidrag** |
|---|---|---|---|---|---|---|---|---|
| **Batmotor_SP_1_H1** | video | social proof | 1 080,23 kr | 27,5 % | 13 | 83,09 kr | **8,32** | **+3 566,16 kr (81,2 %)** |
| Batmotor_CS_2_1 | statisk | offer (40 % rabatt) | 940,08 kr | 23,9 % | 6 | 156,68 kr | 3,70 | +1 204,38 kr (27,4 %) |
| Batmotor_SP_1_H3 | video | social proof (IDENTISK copy som H1) | 1 452,76 kr | **37,0 % (toppspendern)** | 3 | 484,25 kr | 1,14 | **−380,52 kr (−8,7 %)** |

*Vinstbidrag = (357,41 − CPA) × köp. Totalt bedömbart vinstbidrag: 4 390,02 kr.*

**Kritiskt fynd:** toppspendern i kontot (`SP_1_H3`, 37 % av spenden) är en
**förlorare**, inte en vinnare. Den bär exakt samma manus/CTA/titel som
`SP_1_H1` — bara en annan öppningsvideo — och ROAS skiljer 8,32 mot 1,14.
Detta är INTE ett undantag från "toppspendern är benchmark"-regeln
(ANALYSMETOD steg 5); den regeln gäller när toppspendern också vinner. Här
förlorar toppspendern pengar och ska behandlas som en förlorare.

**För tidigt (ingen dom):** `GT_1_H1/H2/H3`, `GT_2_1`, `PD_1_H1/H2/H3`,
`PD_2_1`, `PD_EXTRA`, `SP_1_H2`, `SP_2_1` — alla under 300 kr spend
(tillsammans 453,20 kr, 11,5 % av kampanjen). `GT_1_H1` har kontots högsta
CTR (4,17 %) men noll köp — värt att notera, inte att döma.

## Winning DNA

- **Hook-videot är den avgörande variabeln, inte manuset.** Bevisat genom en
  kontrollerad jämförelse (samma copy, samma titel, samma CTA, olika
  video_id) mellan två bedömbara annonser: `SP_1_H1` (ROAS 8,32) och
  `SP_1_H3` (ROAS 1,14). **Nästa steg: fler hook-varianter av samma manus,
  inte nya manus.**
- Social proof-vinkeln ("så många har redan bytt") fungerar trots att
  hook-raden i sig är abstrakt (klarar inte tre-frågorstestet strikt läst —
  "så många" går inte att visualisera). Hypotes: det är feature-bullets +
  produktbilden som gör jobbet, inte öppningsraden. Nya varianter (batch #1)
  byter öppningsraden mot konkreta, verifierbara fakta (8/8 recensioner,
  materialfakta) med samma struktur i övrigt.
- Offer-statisk med äkta rabatt (40 %, verifierad) fungerar som fristående
  format utan video (`CS_2_1`, ROAS 3,70).

## Losing DNA

- `SP_1_H3`s videoval (okänt exakt vad, se datalucka ovan) — samma copy som
  vinnaren men förlorar pengar. **Paus/nedprioritera videofilen bakom
  `SP_1_H3` (video_id 1602921938241449) tills en redigerare kan avgöra vad
  öppningen visar.**
- `CS_2_1`s falska brådska ("imorgon är det för sent") — rabatten är i
  praktiken ett stående compare-at-pris, inte en daglig deal. **Upprepa
  aldrig den raden.** Ersatt av `CS_4_1` i batch #1 (samma äkta rabatt, ingen
  påhittad deadline).
- Gift-vinkelns öppningsrad ("Vet du inte vad du ska ge honom") är abstrakt
  — hög CTR (4,17 %/2,73 %) men noll köp hittills. Kan vara ett
  konverteringsproblem (för abstrakt CTA) eller bara för lite spend —
  omprövas när `GT_3_H1` (konkretiserad) har data.

## Behåll alltid
- Produkt synligt i bild/video, ingen ren lifestyle utan produkt.
- Exakt pris 579 kr / jämförpris 965 kr — aldrig andra tal.
- Verbatim recensionscitat, aldrig omskrivna eller påhittade.

## Testa kontrollerat
- Fler hook-videovarianter av `SP_1_H1`s manus (isolerad variabel).
- UGC/talking-head-format mot det bevisade röst+broll-formatet.
- Stöldskydds-vinkeln (ny, hypotes, grundad i produktsidans egen "ingen ser
  vilken motor som står under"-rad).
- Investeringsskydds-vinkeln (strukturell överföring från Grillklinikens
  bevisade "skydda investeringen"-mönster, `docs/playbook.md` — hypotes tills
  testad på den här produkten).

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
(2026-08-29/31, 2026-09-01).
