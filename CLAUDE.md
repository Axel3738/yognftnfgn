# Stående arbetsordning — annonsproduktion (Notion → Higgsfield → zip → Notion)

Det här är standardrutinen. Följ den utan att fråga om lov varje gång.

## Loopen (alltid i den här ordningen)

1. **Läs briefen i Notion.** Hela sidan, inte bara titeln. `Typ`-fältet är
   opålitligt (i Mower seat-hubben står "Video - Pending Approval" på i stort
   sett allt, även på bildannonser) — avgör alltid från briefens innehåll.
   Namnmönstret håller: `_H1` = videohook, `_1` = statisk bild,
   "carousel" i namnet = karusell.
2. **Generera** i Higgsfield (`nano_banana_pro`, 2k, 1:1 + 4:5 om briefen
   inte säger annat).
3. **QA mot briefen** — läs igenom varje bild mot compliance-reglerna nedan
   innan leverans. Kör om det som inte håller.
4. **Namnge** enligt hubbens egen namnkonvention.
5. **Paketera** i en zip (JPEG q92, sRGB, `subsampling=0`, stega ner tills
   varje fil är < 2 MB) och skicka den i chatten.
6. **Flytta i Notion → `In Review`.** ← Detta är standard. Fråga inte först,
   gör det direkt efter att zippen är skickad, och rapportera vilka items som
   flyttades. Gäller alla items som ingick i leveransen, även sådana som
   genererades i en tidigare batch men följde med i zippen.

Undantag: om något item medvetet **inte** blev genererat (blockerat, saknad
brief, kräver manuellt arbete) — lämna det kvar i sin nuvarande status och
säg uttryckligen varför.

## Notion-hubbar

| Hub | Data source |
|-----|-------------|
| Boat cover 420D (Enginecover) | `collection://785270ab-908c-82e5-ac71-07d7b7ef3770` |
| Trimmer belt (Trimmerbelt)    | `collection://2f1270ab-908c-820a-9a08-07b73d53710b` |
| Mower seat (Seatcover)        | `collection://6c9270ab-908c-8362-aa2a-87c073045ebf` |
| Beach crocs (Beachslippers)   | `collection://50c270ab-908c-8266-aa1f-872b99fe61e0` |
| Tofflor Ergonomiska (Ergoslippers) | `collection://dda270ab-908c-825c-8aa9-070103389634` |

Titelkolumnen heter **`Namn`**, inte `Name`. Statusflödet som används:
`Draft` → `In Review` → `Approved`. (`To be Reviewed` finns också i schemat
men används inte — kör alltid `In Review`.)

## Compliance — kolla varje bild mot detta

- Exakt svensk copy med å/ä/ö. Stavfel = kör om.
- **Aldrig rabattprocent** i bilden.
- Prisintegritet: motorhölje 299/367 kr, axelbälte 599/678 kr (+79 kr),
  sätesöverdrag 649/811 kr. Överstrykning ska vara ett **ritat streck**,
  aldrig ordet "överstruket".
- Inga påhittade omdömen, betyg eller kundantal.
- Motorhölje: inga höst-/vinterreferenser, endast "så länge lagret räcker",
  **vattenavvisande** (aldrig vattentät), universalpassform (aldrig
  måttsydd), svart hölje (enda undantaget är SO_27_2:s femfärgsuppställning),
  exakta hk-intervall, inga tillverkarlogotyper (YAMAHA etc.).
- Strandtofflor: 349/420 kr. Ergoslippers: **309 kr, jämförpris 400 kr, spara
  91 kr** — inget annat. Ergoslippers har **inga verifierade recensioner**:
  aldrig stjärnor, citat eller "verifierad kund"; ärligt bevis är lagerfaktumet
  (28 beställningar första veckan) eller garantin. Inga medicinska påståenden.
  Skons rem bär förvanskad engelsk text ("OK ouranni…") — vinkla bort eller
  retuschera, aldrig läsbar i bild. Storlek 36–49, unisex. Export 1:1 + 4:5.
- Ergoslippers-briefer ligger i det här repot:
  `docs/briefs/tofflor-ergonomiska-batch2/` (grenen
  `claude/tofflor-ergonomiska-6ig49t`). Produktfoton hämtas från Shopify-CDN
  (länkar i `reference-assets/REFERENCE-ASSETS.md`); retuscherad hero utan
  tryck finns uppladdad i Higgsfield som media_id
  `532b633b-4b38-4008-9738-201fe3bbe996`.

## Higgsfield-tips som sparar tid och krediter

- Ett färdigt jobbs `job_id` kan skickas som `medias`-värde → fungerar som
  referensbild utan ny uppladdning. Använd det vid översättningar och varianter.
- Widget-uppladdningar har producerat tomma skal (CDN → `AccessDenied`).
  Använd `media_import_url` mot en publik Drive-länk
  (`uc?export=download&id=FILE_ID`) istället.
- Kontot har **ingen unlimited-allowance** (`models_explore` → `unlim.available:
  false`). `use_unlim: true` avvisas för nano_banana_pro.
- Max 12 jobb per `generate_image_batch` / `jobs_wait`.
- När modellen inte håller en layout stabil (rutnät, caption-rader, exakt
  samma foto över flera varianter): komponera deterministiskt i PIL istället.
  Font: `/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf`.

## Vid tveksamhet

Om det är oklart **vilket material** som avses (t.ex. "kör dessa till norska")
— fråga innan generering. Att gissa fel kostar krediter.
