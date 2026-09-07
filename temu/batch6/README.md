# ✅ Slutläge 2026-09-07 sent: riktiga Temu-bilder på kattkoja, staketbygel, racingkalender

Axel körde skörden på sin dator (Cowork + `temu-bilder.mjs`, produktsidorna valda av
honom i Chrome) och skickade en zip. Skörden ligger i `temu/bildskord/<produkt>/` med
`manifest.json` (källa = riktig `-g-<goods_id>`-produktsida):
- **kattkoja** `g-606032248014988` — 12 bilder + video. Galleri: 03 (katt i öppningen i
  regn), 04 (katt sover), 09 (produktbild), faktakort på 09. GIF ur videon 3,5–9,5 s,
  beskuren upptill (en liten etikett i bakgrunden). Inga AI-bilder kvar.
- **staketbygel** `g-601101579265035` — 01 (två spikar + skruvar = 2-pack, textfri),
  08/09 (monterad vid staket). Infografiken bygger på 01. GIF = bildspel 01→09→08.
  Bilderna 02–07, 10, 11 har engelsk text → inte använda.
- **racingkalender** — 03 (öppnad kalender med bilar i luckorna), 01 (julbild),
  arkets image10 kvar som hero. GIF ur videon 12–18 s, beskuren nedtill (katt-emoji-
  vattenstämpel). 08/09/12 har engelsk text → inte använda.
- **taköverdrag** `g-601099548544832` (skörd nr 2, 18:42) — CWD:s bild4 som hero,
  03 (van med överdrag, storlekstexten bortbeskuren 20 %), 04 (hopvikt + spännen),
  06 (spännband, textbandet bortbeskuret 21 %). GIF = bildspel bild4→03→04. AI-bilden
  och faktakortet borttagna. 01/07–12 har engelsk eller maskinsvensk text → inte använda.
**Vedklyv och solpanel: DROPPADE av Axel 2026-09-07 kväll ("skiter i de produkterna").**
Notion-korten är omdöpta `UTGÅR – …`, Landing page tömd, stoppruta överst (REST-tokenen
"Bäverbutiken RUTINER" är inte inbjuden till Product test center, så arkivering gick inte
via API — Axel raderar korten själv). Produkterna ligger kvar i SE/NO med AI-bilder;
inga creatives ska göras. Fiskekalendern är klar (ingen Temu-länk finns).

⚠️ **Cowork-lärdom:** Cowork i molnet når inte datorn; Cowork på datorn kunde inte
köra kommandon ("Workspace unavailable") men Axel körde skörden själv och zippade.
Zip → packas upp i scratchpad → `temu/bildskord/` → `bygg-om.mjs` som vanligt.

---

# ✅ Sidorna ombyggda till referensstandard (2026-09-07 kväll)

Alla sju produktsidor i **SE och NO** har nu samma struktur som referensen
(övervakningskameran): galleri 3 bilder, beskrivning problem → GIF → lösning →
bild → funktioner → bild → garanti, alt-text på allt. Slutgranskat skarpt: 14 sidor
200, alla media 200, GIF:arna serveras som `image/gif`, ordningen verifierad ur
`/products/<handle>.js`. Notion-korten har fått en rad om ombyggnaden plus SE- och NO-länk (`Translated url` = NO).

**⚠️ Axels besked 2026-09-07 kväll: "fel produktbilder på alla produkter" — videon
på Temu visar inte den produkt CWD levererar.** Utekattkojan var en ljusblå innekoja,
taköverdraget en silvrig helkåpa, solpanelen andra paneler. Allt ur Temu-videorna
(GIF:ar + galleriramar) togs bort i SE och NO med `ta-bort-videobilder.mjs` (alt-text,
aldrig svep). **Regel framåt: Temu-videon används aldrig som produktbild.** Temu ger
produktidé; bara CWD:s/leverantörens bilder visar det som skickas.

**⚠️ Rotorsaken (hittad 2026-09-07 kväll): arkets Temu-länkar är SÖKSIDOR, inte
produktsidor.** `…-5030003647894-s.html` (`-s` = SEO-söksida, og:title "outdoor cat
house - Ireland") visar ett skiftande sökresultat — därför blev "huvudbilden" ur
`hamta-bilder.mjs` fel produkt (kattkojan: grå koja på ben; taköverdraget: annan
kåpa; solpanelen bytte bild mellan två hämtningar). **Facit för hur produkten ser ut
är arkets inbäddade bilder** — CWD:s i kolumn D/E, Axels skärmdump i kolumn A —
aldrig något som hämtats från en `-s.html`-länk. SKU:erna `TEMU-<nummer>` bär
alltså ett sök-id, inte ett goods-id.

Rättat per produkt mot arket:
- **Kattkoja:** rätt produkt är en boxig Oxford-koja med sadeltak PÅ MARKEN (arkets
  bild3: camo/svart/grå/grön, CWD: ingen camo). Riktig listningsbild hittad via
  `bildjakt.mjs` (Pinterest-kopia av Temu-bilden, textband bortbeskuret). Copyn
  omskriven av sonnet-subagent utan "ben", "dyna", "botten" — `texter6.mjs` +
  `texter6-no.mjs`. Faktakortet likaså.
- **Staketbygel:** CWD:s spec (bild5) = samma typ som hjältebilden, men hjältebilden
  visade fyra spikar för ett 2-pack → beskuren till två. Infografiken bygger på den.
- **Taköverdrag:** enda bekräftade bilden är CWD:s bild4. De två Temu-hämtade
  (kåpa med påse, "CARAVAN COVER") borttagna. AI-bild med bild4 som referens + faktakort.
- **Vedklyv, racing, fiske:** var redan byggda på CWD:s bilder — oförändrade.
- **Solpanel: LÖST enligt Axels besked "kolla Temu-länkarna".** Länken heter
  "solar panel for trail camera" — produkten är en solpanel, ingen kamera. CWD:s
  variantbesked "there is a green version" = den gröna levereras. Formen kommer ur
  den vita referensbilden (samma modelltyp), färgen ur offerten → hero, livsstilsbild
  och faktakort i grönt, alla AI-märkta (`AI-illustration: … färgen som levereras`).
  Faktakortet har raden "Grön – färgen som levereras". Riktigt foto av den gröna
  panelen saknas fortfarande — be CWD om ett vid nästa kontakt.

**Så gjordes det — utan Axels dator (slutversion):**
- Källor som får användas: huvudbilden i `bilder/` (Temu-listningens hero, godkänd
  sedan tidigare), offertens inbäddade leverantörsbilder (`xlsx → xl/media`, kopplade
  via `drawing1.xml`: `image4` = taköverdrag på husbil, `image10`/`image11` =
  racingkalender; `image9` är fiskehornans Colitt-bild → **inte använd**), samt
  fiskekalenderns rensade klipp.
- `infografik.mjs` (måttkort: staketbygel, vedklyv) och `faktakort.mjs` (kattkoja,
  solpanel) bygger sharp+SVG-bilder på svenska och norska ur de låsta räkneorden och
  den låsta copyn — inga siffror som inte redan står i texten.
- AI-livsstilsbilder via KIE `nano-banana-edit` med Shopify-hjältebilden som enda
  referens och prompten "keep the product EXACTLY as in the reference" — kattkoja,
  staketbygel, vedklyv, solpanel, racing, fiske. Alt-texten börjar med
  "AI-illustration", beskrivningen får raden "Livsstilsbilden är en AI-genererad
  illustration". KIE kräver `output_format: png` (jpg avvisas). Taköverdraget har tre
  riktiga bilder och ingen AI.
- GIF:arna är korsfadeade bildspel (`temu/gif.mjs`, 500 px, 0,8–1,2 MB) av
  hjältebild + AI-bild (+ leverantörsbild) — språkfria, så samma fil i SE och NO.
- ⚠️ **Butikstokenen saknar `write_files`** — `stagedUploadsCreate` med
  `resource: FILE` nekas. GIF:arna laddades upp i SE via Shopify-connectorn
  (staged FILE → POST → `fileCreate`) och **Norge hotlänkar samma cdn.shopify.com-URL**,
  som referenssidan. URL:erna står i `gif-urler.json`. Galleribilder går med tokenen
  (`resource: IMAGE` + `productCreateMedia`).
- `bygg-om.mjs <se|no> <mediamapp> [--skarp] [nyckel]` gör ombyggnaden (idempotent:
  bilder med samma alt laddas inte upp igen — byt alt eller ta bort först om en bild
  ska ersättas). Mediamappen är sessionens scratchpad; AI-bilderna ligger bara på
  Shopify-CDN.
- Temu-vägen som fungerar i molnet finns kvar dokumenterad i `hamta-bilder.mjs`
  (mobil-UA ger huvudbild + `goods-vod.kwcdn.com`-video) — men videon är inte
  produktbild, se ovan.

Kvar: inget för batch 6. Vill Axel ha stödhjulet: ny offertförfrågan på rätt produkt.

---

# Batch 6 — offert "Claude_products_filled 1" (2026-09-07)

Offert: https://docs.google.com/spreadsheets/d/1zGcVdwHVdvTD3t894FdFw--9fL8B5v5oMH5kK2XWM-I

**12 produkter i arket, 8 med quote.** Axel: *"strunta i alla produkter som inte
fått quote där i än."* Läs uppdelningen med `node temu/offert.mjs <länk>`.

## Utan quote — skapas inte
Vinterhuv hönsgård · Regn-/vinteröverdrag hundgård · Jaktparaply (MOQ 300) ·
Hängrännesats lövblås. De tre första har CWD-noteringen *"could not be found"*.

## Med quote

| Produkt | SE | NO | DK | FI | UK | Läge |
|---|---|---|---|---|---|---|
| Isolerad utekattkoja | 789 | 809 | 609 | 89,90 | 52,99 | ✅ |
| Staketstolpslagare 2-pack | 1029 | 1179 | 779 | 129,90 | 68,99 | ✅ |
| Tändvedsklyv gjutjärn | 529 | 509 | 409 | 59,90 | 31,99 | ✅ |
| Taköverdrag husvagn | 1129 | 1189 | 819 | 126,90 | 76,99 | ✅ |
| Solpanel åtelkamera | 1749 | 1719 | 1259 | 167,90 | 118,99 | ✅ |
| Stödhjul till grind | 259 | 179 | 199 | 27,90 | 11,99 | ⛔ SKAPAS INTE |
| Fiskekalender | 469 | 399 | 349 | 48,90 | 26,99 | ✅ |
| Racingkalender | 499 | 439 | 369 | 52,90 | 29,99 | ✅ |

Jämförpris = pris × 1,3. COGS = offertens landspris (qty 1) × låst FX, utan
2,9 €-avgiften. Marginal 3,0–5,1×. Räknas om med `node temu/batch6/priser.mjs`.

## Beslut om de två tveksamma (2026-09-07)

- **Stödhjul till grind — SKAPAS INTE.** CWD hittade inte produkten: offerten
  beskriver *"1-inch white PP guide wheel, material PP"* (19 g, notering "similar")
  medan Temu-sidan visar ett stort metallstödhjul med gummidäck. Att sälja ett
  8-kronors plaststyrhjul som stödhjul till grind för 259 kr ger bara returer.
  Behandlas som "utan quote". Vill Axel ha den: ny offertförfrågan på rätt produkt.
- **Fiskekalender — SKAPAD i SE + NO.** Offertens länk gick till fiskehornan.se (en
  konkurrent) — deras bilder rördes inte. Leverantörens egen bild (arkets `image10`,
  L'ADVENT-asken) hade en kinesisk vattenstämpel tvärs över mittraden.
  **KIE vägrade** (Googles policy filtrerar bort vattenstämpel-borttagning — ett
  hårt stopp, inte något att formulera runt). Lösning utan AI:
  `fiskekalender-klipp.mjs` klipper bort bandet y 900–1040 och gör två rena bilder:
  asken + första raden drag (huvudbild) och skeddragsraden (galleri). Mittraden offras.
  ⚠️ Radprofilen som skulle hitta bandet automatiskt träffade skeddragen (mycket
  silvergrått) i stället — gränserna sattes för hand efter en linjal-remsa.
  SKU `TEMU-B6-FISKEKALENDER` (ingen Temu-goods-id finns).

## Status 2026-09-07 kväll

**7 produkter live i SE och NO**, alla köpbara (kollat från kundens sida via
`/products/<handle>.js`). 7 Notion-kort med Landing page och låsta räkneord.
Stödhjulet skapas inte. Utlandsbutikerna DK/FI/UK får inget (Axels beslut).
Kvar: hela bildgalleriet + GIF:ar kräver skörd på Axels dator (`SETUP-LOKALT.md`).

## Bilderna — molnet kom åt Temu ändå

Den dokumenterade blockeringen gäller **desktop-UA**. Med **mobil-UA** svarar
Temu med huvudbilden i sidan (`img.kwcdn.com/product/open/…-goods.jpeg`):
`node temu/batch6/hamta-bilder.mjs` hämtade 5 av 8 den vägen. Racingkalenderns
bild låg i offertlänkens `top_gallery_url`-parameter. Galleriet i övrigt kräver
fortfarande riktig skörd på Axels dator — det här räcker till huvudbild.

Offertarket bär dessutom **inbäddade leverantörsbilder** (xlsx-export →
`xl/media/`), kopplade till rad via `xl/drawings/drawing1.xml`. Därifrån kom
tändvedsklyvens bild, som rensades från kinesisk text med
`node temu/batch6/vedklyv-rensa.mjs` (beskärning + övermålning, ingen AI).

## Låsta räkneord (mot offert och leverantörsbild)
- Staketstolpslagare: **2-pack**, 80 cm per bygel (40 cm spett + 40 cm bygel),
  8 skruvar, 6 bultar, 6 muttrar, 1 skiftnyckel, 1 insexnyckel
- Tändvedsklyv: höjd 27 cm, ytterring 13,7 cm, innerring 12,5 cm, fot 14,5 cm, 0,72 kg
- Taköverdrag: 210D, **6,5 × 3 m** (offerten prissatt på den storleken), svart/silver
- Racingkalender: **24 luckor, 24 bilar**
- Utekattkoja: färgerna grå / gräsgrön / svart — **ingen kamouflage** (CWD-notering)
- Solpanel: CWD säger att bildens modell inte finns, men en grön version gör det.
  Inga watt-/spänningssiffror finns belagda → **inga specsiffror i copyn**.
