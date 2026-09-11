# CatCabin — källkartläggning (steg 1–2 i `/ny-annonser`, gjord i förväg)

**Läst ur Meta 2026-09-11.** Bara läsning — inget konto har ändrats.

`/ny-annonser catcabin` stoppades på steg 1: OPS-butiken finns inte ännu
(`factory/butiker/catcabin.yaml` + `factory/produkter/catcabin.yaml` saknas,
liksom state-fil och Notion-hub). Butiken byggs med `/ny-ops` först.

Källmaterialet hann däremot kartläggas, så nästa körning slipper göra om det.
**Bekräfta alltid mot kontot igen innan `kalla:`-blocket skrivs** — den här
filen är en avläsning med ett datum, inte en evig sanning.

## Källprodukten

Bäverbutiken, handle `isolerad-utekattkoja-torr-och-vindtat-plats-utomhus`.
Break-even-ROAS 1,62 (COGS 28,85 EUR, batch-sheet #6 — samma tal i båda
kampanjnamnen).

## Källkampanjerna — båda ACTIVE, båda CBO

| Marknad | Konto | Kampanj-id | Prefix | Adsets | ACTIVE-annonser | Media |
|---|---|---|---|---|---|---|
| SE | MagiBorsten `1867947880635861` | `120250147309170291` | `Utekattkoja` | SP, PD, GT, CS | 16 av 16 | 12 video, 4 bild |
| NO | Magiborsten NO `1050941584152547` | `120252183459760233` | `Utekattehus` | SP, PD, G, CS | 11 av 11 | 11 video, 0 bild |

**27 källannonser totalt.** Ingen PAUSED — hela materialet följer med.

⚠️ Prefixen SKILJER SIG mellan marknaderna (`Utekattkoja` vs `Utekattehus`) och
adsetuppsättningen är inte identisk: SE har **GT**, NO har **G**. En dom slås
upp på exakt namn — en norsk annons ärver aldrig sin svenska systers dom.

### SE — `Utekattkoja` (kampanj `120250147309170291`)

Fyra adsets à fyra annonser, samma mönster i varje: tre video + en bild.

* SP: `Utekattkoja_SP_1_H1`, `_SP_2_H1`, `_SP_3_H1` (video), `_SP_2_1` (bild)
* PD: `Utekattkoja_PD_1_H1`, `_PD_2_H1`, `_PD_3_H1` (video), `_PD_2_1` (bild)
* GT: `Utekattkoja_GT_1_H1`, `_GT_2_H1`, `_GT_3_H1` (video), `_GT_2_1` (bild)
* CS: `Utekattkoja_CS_1_H1`, `_CS_2_H1`, `_CS_3_H1` (video), `_CS_2_1` (bild)

### NO — `Utekattehus` (kampanj `120252183459760233`)

Launchad 2026-09-11 av `/translate-no`. Vågkonfigen med all norsk copy ligger
kvar i `pipeline/waves/no-utekattkoja-video.config.mjs` — läs den i stället för
att hämta copyn ur kontot en gång till.

* SP: `Utekattehus_NO_SP_1`, `_SP_2`, `_SP_3`
* PD: `Utekattehus_NO_PD_1`, `_PD_2`, `_PD_3`
* G:  `Utekattehus_NO_G_1`, `_G_2`
* CS: `Utekattehus_NO_CS_1`, `_CS_2`, `_CS_3`

## Priset i källan (att jämföra OPS-butikens mot)

| Marknad | Källpris | Jämförpris | Rabattpåstående |
|---|---|---|---|
| NO | 809 NOK | 1 059 NOK | 24 % |
| SE | hämtas ur produktsidan vid körning | — | — |

Den norska copyn ropar **"24 % rabatt"** och **"Kun i dag"** i CS-adsetet.
Stämmer inte CatCabins egna paketnivåer med det är hela talet falskt, inte
bara ett tal — då krävs omdubb, inte en prisswap. Läs SRT:erna gratis ur
`market-expansion/no/video-batches/2026-09-11/srt-orig/` innan något renderas.

## Det som återstår när butiken finns

1. `/ny-ops <källänken>` — bygger butiken, produktfilen och butiksfilen.
2. `/ny-annonser catcabin <källänken>` — skriver `kalla:`-blocket ur tabellen
   ovan (bekräftat mot kontot på nytt), och bygger `CATCABIN_SE_…` +
   `CATCABIN_NO_…` i MagiBorsten DK `915422744950975`.
