# Creative DNA — IBC-Tanköverdraget

Skapad 2026-09-01 av `/forsta-batch` (körning nr 1, automatisk rutinkörning via
`agent/rond.mjs`-behovet `forsta_batch`). Datakälla: MagiBorsten `1867947880635861`,
kampanj `120250001079150291` ("IBC-Tanköverdraget | BE ROAS 1.51 | Launch
2026-08-28"), livstid 2026-08-28 → 2026-09-01 (hämtat `date_preset: maximum`).

## Produktfakta (verifierade mot landningssidan 2026-09-01)

- **IBC-tank Kranadapter Kit – Anslutning för Vattentank & Trädgård**
  (`ibc-tank-kranadapter-kit-anslutning-for-vattentank-tradgard`),
  bäverbutiken.se, Garden & Outdoors.
- ⚠️ **Produktnamnet på sajten ("kranadapter", en kran-/slanganslutning) matchar
  INTE annonsernas påstående ("överdrag som blockerar UV/alger").** Antingen
  har produkten bytt funktion sedan launch (419 kr/524 kr-priset och
  beskrivningen på sidan handlar om en slangadapter, inte ett skyddande
  tygöverdrag), eller så pekar Shopify-produkten på fel produktsida för det
  som faktiskt annonseras. **Det här är kritiskare än prisglappet nedan och
  måste kollas av Axel innan mer spend läggs på kampanjen** — om kunder
  klickar på "skydda tanken mot alger" och landar på en kranadapter-sida är
  hela kassaflödet (LPV→ATC tappar 94 % redan i dag, se FAS 1 i analysen)
  sannolikt förklarat av just detta. Denna batch briefer antar att sidan är
  fel/föråldrad och att den verkliga produkten är tygöverdraget (så som alla
  16 launch-annonserna visar och som 22 köp redan bekräftat fungerar) — men
  priset nedan är ändå hämtat från den enda sida som faktiskt går att nå.
- **Pris (från den nåbara produktsidan): 419 kr rea, 524 kr ordinarie (~20 %
  rabatt).** Inga recensioner live ("Be the first to write a review").
  30 dagars öppet köp, fri frakt, leverans 5–10 arbetsdagar.
- Break-even-ROAS **1,51×** (ur kampanjnamnet). Break-even-CPA = 419/1,51 =
  **277,48 kr**.
- ⚠️ **Prisglapp i tre redan LIVE-annonser:** IBC_CS_1_H2, IBC_CS_1_H3 och
  IBC_CS_2_1 säger "489 kr istället för 636 kr — 23 % RABATT". Varken 489 kr
  eller 636 kr matchar den nåbara sidans 419/524 kr. Antingen har priset
  ändrats sedan launch (2026-08-25/28) eller så var annonsen fel redan då.
  Rör inte av denna körning (bygger bara briefer) — flaggat till Axel.
- ⚠️ **Falsk/ogrundad social proof, LIVE just nu:** IBC_SP_1_H1/H2/H3 och
  SP_2_1 säger "Hundratals trädgårdsägare har redan bytt ut...". Sidan har
  noll recensioner. Ett recensions-fröfil finns i Drive-produktmappen
  (`IBC-tanköverdrag_Reviews`, 10 rader) men pekar på ett ANNAT produkt-handle
  (`ibc-tankoverdrag-1000-l-stoppar-alger-uv`) än det som faktiskt är live —
  aldrig synkat, eller synkat fel. Även om det synkats hade "hundratals" ändå
  varit en överdrift av 10 recensioner. Återanvänds inte i denna batch.

## Datakvalitet

`amount_spent × purchase_roas` användes genomgående (aldrig `omni_purchase_values`,
per CLAUDE.md-varningen). Kampanjsumman (4 188,02 kr, 22 köp) är hämtad direkt på
kampanjnivå — inte summerad manuellt ur adsen (16 annonser, vissa <1 kr spend).
Shopify-korskoll gick INTE att göra (`Shopify MCP kräver ny auktorisering`) — den
levande produktsidan användes som bästa tillgängliga substitut för pris, men det
är inte samma sak som en Shopify-verifiering. Flaggat, inte gissat.

## Siffrorna (bedömbara annonser, ≥300 kr + ≥3 köp; BE-ROAS 1,51)

| Annons | Format | Vinkel | Spend | Andel spend | Köp | CPA | ROAS | **Vinstbidrag*** |
|---|---|---|---|---|---|---|---|---|
| **IBC_PD_1_H1** (benchmark/top spender) | video | produktdemo, inget pris | 3 195,32 kr | 76,3 % | **20** | 159,77 kr | **3,88** | **+2 354 kr** |

*Vinstbidrag = (break-even-CPA − CPA) × köp = (277,48 − 159,77) × 20 = 2 354,20 kr.
Detta är i praktiken hela kampanjens vinst — PD_1_H1 bär allt.

**För tidigt (ingen dom, redovisas för mönstret):**

| Annons | Format | Vinkel | Spend | Köp | ROAS | Kommentar |
|---|---|---|---|---|---|---|
| IBC_PD_Extra | video | produktdemo | 54,40 kr | 1 | 8,99 | Bästa hold rate i hela settet (50/27/20 %) men brus på 1 köp |
| IBC_CS_1_H2 | video | rea + FEL pris | 51,71 kr | 1 | 9,46 | Kan inte dömas, se prisglapp ovan |
| IBC_CS_1_H3 | video | rea + FEL pris | 270,56 kr | 0 | – | Nära 300 kr-gränsen, 0 köp, svagast hold (14/7/4 %) — lutar mot förlorare men konfunderat av prisfelet |
| IBC_PD_2_1 | statisk | produktdemo | 247,11 kr | 0 | – | Samma copy som vinnaren, aldrig fått nog spend |
| IBC_SP_1_H1/H2/H3, SP_2_1 | video+statisk | social proof + OGRUNDAT påstående | 139,41 kr totalt | 0 | – | Svält, OCH ett påstående som måste fixas innan omtest |
| IBC_GT_1_H1/H2/H3, GT_2_1 | video+statisk | gåva/present | 34,68 kr totalt | 0 | – | Ren svält, 0,8 % av spenden — aldrig faktiskt testat |

## Winning DNA

1. **Produktdemo utan pris, utan urgency, med EN konkret faktabaserad detalj**
   (210D Oxford-tyg) är den bevisade vinnaren. 20 köp, CPA 159,77 kr, tar 76 %
   av spenden, billigast CPM i hela settet (123,83 kr).
2. **Struktur:** smärtfråga → mekanism kopplad till en verifierbar spec →
   tre ✅-punkter → en enda CTA. Ingen rabatt, ingen "hundratals kunder"-siffra.
3. **Konkret > vagt.** "210D Oxford-tyg" och "blixtlås på 2 minuter" är fakta
   man kan peka på (copy-regler.md, tre-frågorstestet) — det är sannolikt
   därför CTR (4,05 %) ligger klart över resten av kontot trots låg
   fullvisningsgrad (bara 21,7 % ser 25 % av videon). Hypotes: hooken/texten
   säljer, inte fullvisningen — oprövat men grunden för denna batchs
   near-iteration (se batch-log).

## Losing/rotorsaker (hypotes, delvis konfunderat av budgetsvält)

- **CS (rea/urgency)** — kan INTE dömas rent: den bär både ett fel pris OCH
  fick näst mest spend av de svaga vinklarna (409,50 kr totalt) utan att
  konvertera. Går inte att säga om vinkeln eller prisfelet är boven.
  **Ny CS-copy byggs inte i denna batch** förrän priset är verifierat.
- **SP (social proof)** — samma mönster som Kranskydd Frost 420D och flera
  andra produkter i detta konto: ett ogrundat "hundratals kunder"-påstående.
  Konceptet i sig (kundröst) kan fortfarande fungera — men bara med en riktig
  recension bakom sig. Riktig recensionsdata saknas helt just nu.
- **GT (gåva)** — INTE en förlorare, bara aldrig testad (34,68 kr totalt).
  Denna batch ger den en riktig chans (se IBC_GT_3_H1).

## Behåll alltid / Testa kontrollerat / Undvik / Obevisat

- **Behåll:** PD-vinkelns struktur (fråga → mekanism → 3×✅ → CTA) · 210D
  Oxford-tyg som återkommande, konkret bevisfaktum · inget pris i copy tills
  produktsidans pris är bekräftat stabilt.
- **Testa kontrollerat:** fact-first hook i stället för pain-first hook
  (IBC_PD_3_H1) · samma vinnande manus som statisk bild (IBC_PD_3_1) ·
  gåva-vinkeln med riktig budget för första gången (IBC_GT_3_H1) · en helt ny
  before/after-jämförelsevisual (IBC_CO_1_1).
- **Undvik:** "489 kr istället för 636 kr" eller något annat pris innan
  Shopify/produktsidan är bekräftad · "hundratals trädgårdsägare" eller någon
  aggregerad kundsiffra utan riktiga recensioner bakom · att döma CS/SP mot
  varandra på nuvarande data (ojämn budget, se testplan).
- **Obevisat:** allt utom PD_1_H1 — bara en (1) annons har passerat
  signifikansgränsen i denna körning.

## Luckor (fyll före nästa körning)

- **Störst: produktsidans identitet.** Den nåbara Shopify-sidan
  (`ibc-tank-kranadapter-kit-anslutning-for-vattentank-tradgard`) beskriver en
  slangadapter, inte ett UV-blockerande överdrag. Antingen är det fel
  produktsida kopplad till kampanjen, eller så säljs faktiskt fel produkt på
  fel sida. **Måste klargöras av Axel innan CS/SP-vinklarna någonsin körs
  igen** — annars riskerar hela kampanjen att sälja en produkt som inte
  matchar det som visas på checkout-sidan.
- Videoinnehåll: analysen bygger på Marketing API:ns copy/caption-fält, inte
  en bildruta-för-bildruta-granskning — video kunde inte öppnas i denna
  session.
- Konkurrenter: bara 1 träff i Meta Ad Library på "IBC tank cover" (Sverige),
  ingen läsbar brödtext — inget användbart swipe-material hittades.
- Recensioner: 0 live, ett 10-rads fröfilearkiv i Drive men fel produkt-handle
  — aldrig synkat korrekt till Judge.me.
- Shopify-adminåtkomst (pris/lager/order-korskoll): token utgången i denna
  session — landningssidan användes som substitut, inte en fullständig
  verifiering.
