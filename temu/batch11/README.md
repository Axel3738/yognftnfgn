# Batch 11–13 (2026-09-23) — MASTER-arket, flik "www"

Axel: *"Dessa ska upp på bäverbutiken. Både svenska och norska. Bara att börja kötta!"*
Offert: https://docs.google.com/spreadsheets/d/1zxPXYeyx228RVQ16-vrN19m-K2jKdq4x5snQ2KXAaj8
(44 rader, 41 med quote). Alla länkar utom fyra är **AliExpress** — molnet kan varken läsa
sidorna eller hämta bilder. Underlaget är därför arkets radnamn + leverantörsref, CWD:s
QC-fabriksbilder 2026-09-18 (`temu/qc/2026-09-18-cwd-qc.md`) och CWD:s svar 2026-09-19.

## Läget
**18 produkter live i SE + NO** (de som hade en riktig fabriksbild), **16 på VÄNTA** (Notion-kort
märkta `– VÄNTA: <orsak>`), **6 byggs inte**. Skördeprompten `temu/kaching-cli/BILDSKORD-BATCH11.md`
(33 produkter, nytt skript `ali-bilder.mjs` för AliExpress) levererades FÖRST enligt regeln.
Hero-bilderna är CWD:s QC-foton (500–1200 px, tillfälliga) — byts när skörden kommit.

| id | Batch | SE | NO | Bild nu | Läge |
|---|---|---|---|---|---|
| varmesulor | 11 | 869 | 799 | QC-kit | ✅ |
| krukvaxthuv (3-pack) | 11 | 589 | 569 | QC-förpackning | ✅ badge |
| bikupsjacka | 11 | 519 | 469 | QC | ✅ |
| ljusslingevindor (10-pack) | 11 | 409 | 359 | QC | ✅ badge |
| makitahallare (5-pack) | 11 | 359 | 319 | QC | ✅ badge |
| rcdrift | 12 | 689 | 679 | QC-kit | ✅ grå enligt bilden |
| rcoffroad | 12 | 999 | 1 099 | SE:s 5 gamla | ✅ **fanns i SE sedan 2026-07-22** — sidan omskriven (bort med "14 dagars ångerrätt"), cogs 239,59 → 300,00, alt-texter satta, klonad till NO. **2026-09-24: tre färgvarianter** Blå/Svart/Orange i SE + NO (`rc-farger.mjs`), blå behåller grund-SKU:n, svart/orange `-SVART`/`-ORANGE`, variantbild per färg ur de fem befintliga |
| vedklyvshuv | 13 | 459 | 399 | QC (beskuren) | ✅ |
| poolpumphuv | 13 | 539 | 469 | QC-render 101×86×78 | ✅ |
| regnkedja (12 koppar) | 13 | 719 | 719 | QC | ✅ 12 koppar räknade |
| rullknivslip | 13 | 579 | 519 | QC | ✅ |
| highlandcow (24 fig) | 13 | 469 | 389 | QC (övre halvan — vattenstämpel nedtill) | ✅ asken tryckt 2026 |
| takachuv | 13 | 449 | 369 | QC-render | ✅ |
| buskjacka (2-pack) | 13 | 429 | 379 | QC + på kruka | ✅ 120×180 (CWD 09-19) |
| lovsilar (6-pack) | 13 | 379 | 309 | QC + i stuprör | ✅ badge |
| elcykeljacka (2-pack) | 13 | 349 | 299 | QC | ✅ badge |
| bordsfotboll (6 bollar) | 13 | 439 | 389 | QC fram + bak | ✅ 6 bollar (CWD 09-19) |
| magnetblock (200 st) | 13 | 799 | 809 | QC ask + kuber | ✅ **bara 200-pack** — 300-pack (29,12 USD) läggs till som variant när en 300-bild finns |
| adelstenskalender (24 luckor) | 13 | 469 | 399 | QC-ask (beskuren, skärmkanter bort) | ✅ 2026-09-24 — Axel: den röda asken är produkten. Stentyp/verktyg/ålder påstås inte |
| cykelhallarskydd (2 cyklar) | 13 | 669 | 639 | QC (bild 25) | ✅ 2026-09-24 — jag dömde bilden fel som ATV-kapell; arkets ref-kolumn är tom, inga mått/material påstås |
| husbilskalender (24 luckor) | 13 | 379 | 339 | QC fack + ask, detalj fack | ✅ 2026-09-24 — Axel: "Ja gör husbilskalendern". Biltillverkarens namn står på asken men skrivs ALDRIG i copy/alt/taggar/video |

**VÄNTA (4, efter skörden 2026-09-24):** varmemuff (**slut hos CWD, tillbaka tidigast om en månad —
pre-order när datum finns**; arkets rad 62 är dess qty-2-rad), kajakhuv (skörd finns, men måtten är
obekräftade — fråga CWD), tradansikte (listningen har flera ansikten — vilket är offererat?),
snosmaltmatta (spänning/EU-kontakt obekräftad + vattenstämpel på alla skördebilder).
**Byggda på skörden 2026-09-24 (10):** bathuv, kamadohuv, maskinhylla, fonstertermomatta, laktarponcho,
scooterkapell, krukbarrem, sorkkorgar, slangboxhuv, regntunnehuv — se avsnittet nedan.
*(Gammal VÄNTA-lista:* bathuv, kamadohuv, kajakhuv, maskinhylla, fonstertermomatta, varmemuff, laktarponcho,
scooterkapell, tradansikte, snosmaltmatta, krukbarrem, sorkkorgar, slangboxhuv,
regntunnehuv. Byggs med `skapa.mjs` när skörden ligger i `temu/bildskord/<id>/` — sätt
`status: 'bygg'` + `qc:`/bildväg i `fakta.mjs`, skriv copy (subagent) och kör.

**Byggs inte (4):** dammvärmaren (bara US-version, CWD 09-19), minikedjesågen (ingen quote),
hönsluckan (ingen quote), fågelholken (MOQ 500).

## Filerna
- `fakta.mjs` — låsta fakta, SKU `TEMU-B11/B12/B13-*`, kategori-GID (slagna i taxonomin), status bygg/vanta + orsak, QC-bildvägar
- `priser.mjs` — SE = nio((landat + 2,9 €) × 3 × 9,4698), NO = nio(landat × 3 × 9,2989), jämför × 1,3
- `bilder.mjs` — QC-foto → 1000×1000 hero/detalj, beskärning per produkt, antalsbadge (sharp, SE/NO)
- `copy-1..5.json` → `granska-copy.mjs` → `copy.json` — fem Sonnet-skribenter (sv+no), skript-granskning
  (förbjudna ord, räkneord, flerpack i titel + första bullet, seo-längder) + huvudsessionens korrläsning
- `skapa.mjs <se|no> [--skarp] [id …]` — skapar/uppdaterar, rcoffroad = uppdatera SE + klona till NO
- `rc-farger.mjs <se|no> [--skarp]` — RC 1:16: option Färg/Farge, varianter Svart/Orange, variantbilder, femte bulleten (`copy-rc-farg.json`). Idempotent
- `slutgranska.mjs` — läser allt live i SE + NO: mall, kategori, moms av, cogs, jämför > pris, media 200, alt, rester, garanti, storefront 200
- `notion-kort.mjs` — Notion-kort som JSON till notion-create-pages (hoppar över bygg-produkter som inte finns i SE ännu)
- `galleri.mjs` — GALLERIBESLUT per produkt efter skörden: bild, beskärning, KIE, alt, QC först/sist, GIF
- `galleri-fix.mjs <crop|kie|ark> [id …]` — förbereder bilderna (sharp-beskärning, KIE-översättning, ffmpeg-GIF) + kontaktark
- `beskrivning.mjs` — 7-blocksbeskrivningen (problem → GIF/bild → lösning → bild → funktioner → bild → garanti), delad
- `galleri-bygg.mjs <se|no> [--skarp] [id …]` — laddar upp galleriet med alt-text, ordnar (QC först/sist), bygger om beskrivningen; skapar produkten om den saknas. Idempotent på alt-text som JSON till notion-create-pages

## Rättningar i copyn (huvudsessionens korrläsning)
"aldrig/alltid" i regnkedjan och bordsfotbollen · "bygglen" → "byggen" · bikupsjackans "tål att sitta
ute genom vintern" (påstående utan underlag) · vedklyvshuvens "formsydd" (inte belagt) ·
norska "posten" → "jaktposten" (posten = postkontoret) · onödiga varningar borttagna.

## 2026-09-24 — Axels rättelser av min första läsning
Fyra saker jag hade fel eller obesvarade, rättade samma dag:
- **Cykelhållarskyddet** var inget ATV-kapell. Bild 25 är produkten; arkets ref-kolumn är tom, så
  "256 × 110 × 120" var min egen koppling. Byggt SE + NO på QC-bilden, CWD-frågan struken, produkten
  tillagd i skördeprompten (34 kommandon). Copy: alt-texten skriver "fabriksfoto" — bilden är tagen
  inomhus, inte på en husbil — och bullet 4 byttes från en upprepning till "Ser diskret ut bak på bilen".
- **Pre-order-raden (62)** är Värmemuffens qty-2-rad (19,69 = 2 × 9,85 USD). Värmemuffen är slut hos
  CWD, tillbaka tidigast om en månad; pre-order när datum finns. Notion-kortet omdöpt.
- **RC 1:16** finns i blå, svart och orange (Axel) — varianter i båda butikerna, se tabellen.
- **Ädelstenskalendern**: den röda asken är rätt ("4. ja") — byggd SE + NO.
- **Husbilskalendern**: Axel valde att sälja ("Ja gör husbilskalendern", 2026-09-24) med risken
  förklarad — asken bär ett registrerat varumärke utan licens, så risken är nedtagning/krav och
  Meta-avslag. Skyddet vi har: namnet skrivs aldrig i copy, alt-texter, taggar eller video —
  "retrobuss"/"campingbuss". Byggd SE + NO på QC-bilderna 30–31.

## Skörden 2026-09-24 (Axels dator, lokal session) — att veta när gallerierna byggs
32 av 34 mappar skördade och rensade lokalt (committade som `8db81aa0`, push väntar på Axels
GitHub-inloggning). Kvar: **rcdrift** och **bordsfotboll** (Temu visade inloggningsruta — körs om
med Axel vid datorn). Anteckningar från rensningen:
- `slangboxhuv`: bara 1 bild — sidan laddar inte fler, kört två gånger.
- `poolpumphuv`: 3 bilder, `fonstertermomatta`: 4 bilder — tunna gallerier, komplettera med AI-livsstil (märkt).
- `rullknivslip`: bild 10 visar ett annat varumärke ("LUXE SPHERE") — använd inte.
- `adelstenskalender`: bild 10 och 13 visar en annan askdesign, troligen en variant — kolla mot vår röda ask innan de används.
- `magnetblock`: bilderna 01, 02, 03, 06, 08, 09 är produkten.
- Lokala sessionens lärdom: `git add temu/bildskord` hade tagit med testmapparna `prov*` — nu i `.gitignore`
  tillsammans med `temu/kaching-cli/profile-ali/`.

## Gallerierna efter skörden (2026-09-24)
Axels skörd (`temu/bildskord/`, 32 mappar) granskades bild för bild i kontaktark (`galleri-fix.mjs ark`)
och besluten står i `galleri.mjs`. Resultat: **31 produkter live i SE + NO** (21 + 10 nya), 130 bilder
i galleri-registret, 40 beskärningar, 1 GIF (highlandcow — lagervideo, 2,7 MB), 4 VÄNTA.

**Vad som styrde valen**
- Bilder med mått eller räkneord som inte finns i offerten användes inte (båthuvens 290 cm-tabell,
  värmesulornas gradtal, magnetblockens delelistor, maskinhyllans tum-mått, lövsilarnas "8 mm").
- Engelsk text beskars bort med sharp. **KIE-översättning prövades på 14 bilder: bara de två med
  1–2 ord blev rätt** ("3-PACK", "L · Storlek 41–46", "Med huv/Utan huv" = 3). Resten blev rappakalja
  ("Dippekedaja", "Så här sättet du påur", "Hroventäclker poolpump") och byttes till beskärning eller ströks.
  Regeln står nu i CLAUDE.md.
- "Waterproof"-löften i bilderna beskars bort eller bilden ströks.
- **elcykeljacka:** skörden visar en svart neoprenjacka, QC-fotot en stickad olivgrön — skörden används
  inte, fråga till CWD. **husbilskalender:** leverantörens renderade ask säger "CAMPERVAN", den riktiga
  (QC) bär biltillverkarens namn — QC-fotot förblir hero, bara bussarna/ornamenten togs från skörden.
- **adelstenskalender:** bild 10/13/16–21 är andra askdesigner (varianter) — bara 20 + beskuren 11 används.
- **rullknivslip:** bild 10 (annat varumärke) ströks; 05/06/08 (1000#-skiva, 15°) motsäger arket ("2 diamantskivor").
- **regnkedja:** helkedjebilderna ströks — kopparna går att räkna och stämmer inte säkert med 12.
- Videor: 6 hittades, 3 gick att hämta om från CDN, bara highlandcows blev GIF (elcykeljackans visar fel
  produkt, läktarponchons har kinesiska undertexter). krukbarrem/makitahallare/regntunnehuv: CDN 403.
- Alt-texter är svenska även i NO (CLAUDE.md: bilderna återanvänds från SE).

**Tunna gallerier** (mer material välkommet): slangboxhuv (2 beskurna ur 1 bild), regntunnehuv (2),
bathuv (2), poolpumphuv (2 + QC), adelstenskalender (2 + QC).

**Kvar:** rcdrift + bordsfotboll (Temu-skörden kräver Axel inloggad), de fem CWD-frågorna i
`temu/qc/2026-09-18-cwd-qc.md`, magnetblockens 300-pack-variant.

## Axels granskning 2026-09-24 — "Fixa allt det här nu"
Axel gick igenom alla 31 sidor. Kärnan: GIF på varje sida, bättre första bilder, alltid en bild
mellan funktioner och garanti, och elcykeljackan visade fel produkt. Åtgärdat i två omgångar
(`galleri-bygg.mjs` är idempotent — andra passet lade bara på det som tillkommit):

- **AI-material via KIE** (`ai.mjs` = jobben, `ai-kor.mjs` = körningen): 20 bilder (nano-banana-edit,
  ~34 credits/st) och 29 videor (veo3_fast, ~40 credits/st) med en riktig produktbild i SE som
  referens. Varje bild och varje GIF granskades i kontaktark innan uppladdning. **Underkänt:**
  ädelstenens första hero (AI skrev "ADVENT CALENDAR" på asken — omgjord med skärpt prompt, nu rätt),
  kamadohuvens första GIF (formlös presenning), ädelstenens första GIF (påhittad text på asken),
  krukväxthuvens GIF (tecknad snöflinga), cykelhållarskyddets GIF (bara svart tyg). KIE svarade
  "Internal Error" på 17 av 28 videor i första vändan — omkörningar löste de flesta; kredit återförs vid fel.
- **GIF-regler:** 1:1, 6 s, 8 fps, ≤ 4 MB; först i beskrivningen (efter problemet), **sist** i galleriet.
  Highland Cow-GIF:en gjordes om till 1:1 och flyttades sist. Riktiga videor användes där de fanns
  utan textöverlägg: läktarponchon (första 5 s, undertexterna bortklippta), Highland Cow (lagret).
  Elcykeljackans leverantörsvideo har engelska textöverlägg i varje sekund — AI-video i stället.
- **AI-hero där Axel bad om det:** båthuv, kamadohuv (med en äggformad kamado bredvid så formen syns),
  slangboxhuv, regntunnehuv (blå 200 L-tunna), ädelsten, husbilskalender, rullknivslip, driftbil.
  Före/efter som en AI-bild: scooterkapell, ljusslingevindor, makitahållare. Läktarponchon fick en
  bild med USB-kabeln till en powerbank så det syns att den är elektrisk. Alla märkta "(AI-illustration)"
  + raden "Livsstilsbilderna är AI-genererade illustrationer" (skrivs av `beskrivning.mjs`).
- **Elcykeljackan:** QC-fotot (stickad olivgrön) var fel produkt; leverantörslänken visar en svart
  jacka med orange insida. QC borttaget, skördebilderna in, ny copy (`copy-9.json`), nytt handle
  `elcykelbatteriets-vinterskydd-2-pack-svart-med-orange-insida` (galleri.mjs `omskriven: true`).
- **Rullknivslipen:** beskärningarna lades på vit kvadrat (`pad: true`) och laddades om (`ersatt: true`).
- **Poolvärmepumpshuven:** bilden med huven i drift först, QC-rendern sist.
- **Tredje bilden:** `galleri-bygg.mjs` faller tillbaka på bild B/A så det alltid ligger en bild mellan
  funktioner och garanti (båthuv och regntunnehuv saknade den).
- **Nej till två saker:** (1) "någon typ av recension i produktbilderna" — påhittade omdömen görs
  aldrig (CLAUDE.md). (2) Driftbilens varianter — arket har bara qty-rader (7,08/14,15/21,23 USD),
  inga färger; Temu-titeln säger "Färgglad" men CWD har inte offererat färger. Fråga till CWD.
- **Kvar utan GIF efter fyra försök:** se `ai-video-8.log`-raden nedan (uppdateras).
