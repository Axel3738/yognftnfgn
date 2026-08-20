---
name: translate-images
description: Översätt färdiga bildannonser till nya marknader. Användaren skickar en Drive-länk med annonser, listar marknader och priser. Bilderna översätts i Higgsfield med originalet som referens, QA:as, och levereras som en zip per marknad.
---

# /translate-images — översätt bildannonser till nya marknader

Användaren anropar kommandot med en Google Drive-länk till annonserna.

## Steg 1 — samla in tre saker innan något genereras

1. **Drive-länken** — mappen eller filerna med originalannonserna.
2. **Marknaderna** — vilka språk/länder (t.ex. norska, danska, finska, UK).
3. **Priserna** — exakt pris + jämförpris per produkt och marknad, i rätt valuta.

Saknas något av detta: **fråga**. Gissa aldrig priser eller marknader —
felgissningar kostar krediter. Om användaren inte har priser än, fråga hur
prisnämningar ska hanteras (skrivas om, tas bort, eller ersättas) och
acceptera bara ett uttryckligt besked.

## Steg 2 — hämta originalen

- Publika Drive-filer: `https://drive.google.com/uc?export=download&id=FILE_ID`.
- Annars: Google Drive-verktygen (`search_files` med `parentId = '<mapp-id>'`,
  sedan `download_file_content`, base64-avkoda).
- Titta på varje bild och inventera: vilken text finns, vilka priser, vilken
  layout. Detta är facit för QA.

## Steg 3 — importera till Higgsfield

- `media_import_url` mot den publika Drive-länken, **eller** `media_upload`
  (curl PUT mot presigned URL, sedan `media_confirm`).
- Använd ALDRIG widget-uppladdning — den har producerat tomma skal
  (CDN → AccessDenied).
- Ett redan genererat jobbs `job_id` funkar som `medias`-värde → översätt
  vidare från en färdig språkversion utan ny uppladdning.

## Steg 4 — översätt

- Modell `nano_banana_pro`, `resolution: "2k"`, samma bildformat som
  originalet. Max 12 jobb per `generate_image_batch`/`jobs_wait`.
- Prompt per bild: originalet som referens + "translate all visible text to
  <språk>; keep photo, layout, colors and composition pixel-identical;
  replace prices with <exakt pris>".
- Skriv ut måltexten **ordagrant i prompten** med rätt diakritika (å/ä/ö,
  ø/æ, ää/öö). Modellen får inte hitta på copy själv.
- Överstruket jämförpris = **ritat streck**, aldrig ordet "överstruket".
  Aldrig rabattprocent om inte användaren uttryckligen begärt det.

## Steg 5 — QA mot originalet, bild för bild

- Stavning exakt, alla tecken rätt.
- Siffror intakta (vanligt fel: decimaler/tusentalsavgränsare tappas —
  "64,95" blir "6495"). Går siffror sönder: kör om med en språkversion som
  har identiska siffror som referens.
- Layouten oförändrad — samma foto, samma beskärning, ingen ny färgvariant.
- Håller modellen inte layouten stabil (rutnät, caption-rader, exakt samma
  foto över varianter): komponera texten deterministiskt i PIL i stället.
  Font: `/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf`
  (fallback `/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf`).
- Kör om allt som inte håller. Leverera aldrig en bild med fel.

## Steg 6 — leverera

- En zip **per marknad**: `Annonser_<MARKNAD>_<beskrivning>.zip`.
- JPEG q92, sRGB, `subsampling=0`, stega ner kvaliteten tills varje fil < 2 MB.
- Samma filnamn som originalet + marknadssuffix vid behov.
- Skicka zipparna i chatten och rapportera per marknad: antal bilder, vad som
  kördes om, och vad som medvetet inte gjordes (med skäl).
- Flytta inget i Notion utan att fråga — översättningar har eget statusflöde
  (`To be translated` → `Translation in review`).
