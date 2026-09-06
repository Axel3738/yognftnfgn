# NO-videobatch 2026-09-06 — status

Rutin: `/translate-no` (`.claude/commands/translate-no.md`). Källa: Drive-mappen
LAUNCHED (`1-vbYhYgTEv7zYptW5rGmgKAITmAz4l1X`).

## Inventering (Fas 0)

20 produktmappar i LAUNCHED (exkl. WINNERS/LOSERS/MAKE TO NORWAY). Rekursiv
listning av MAKE TO NORWAY (inkl. undermappen WINNERS) + Meta-kontot
(`act_1050941584152547`, 29 kampanjer) visade att 16 av 20 redan var täckta.

**4 kandidater**, bokstavsordning: 3D-sandbild, Arbetslampa för Makita-batteri,
Bordtennisnät Infällbart, Glasspints med Lock 2-pack. Bordtennisnät Infällbart
saknar fortfarande Norge-kostnad i batch-sheet #1–#5.1 (samma fynd som
2026-09-03/04/05, fjärde natten i rad) — hoppades över, problemmeddelande
skickat. Fortsatte med nästa kandidat (Glasspints) för att nå 3 launchade,
enligt samma mönster som 2026-09-04.

## Resultat

| Produkt | Läge | Orsak |
|---|---|---|
| 3D-sandbild | ✅ Launchad ACTIVE | Se nedan. |
| Arbetslampa för Makita-batteri | ✅ Launchad ACTIVE | Se nedan. |
| Bordtennisnät Infällbart | ⚠️ Överhoppad | Fortsatt ingen Norge-kostnad i batch-sheet #1–#5.1. Problemmeddelande skickat till #problems-no. |
| Glasspints med Lock 2-pack | ✅ Launchad ACTIVE | Se nedan. |

Ingen kö till i morgon utöver Bordtennisnät (samma COGS-blockering).

## 3D-sandbild → Sandbilde NO

- **Pris:** 399 kr. CS-annonsens claim "50% RABATT" höjde jämförpriset i Shopify
  NO 519→798 kr (`tools/shopify-fix-compareat.mjs --market NO --product-id
  15547994997111 --rabatt 50`) så claimen stämmer exakt.
- **COGS:** batch-sheet #5.1, "3D moving sandscape 20 cm", NORWAY-blockets Total
  ex. tax Qty 1 = 14,20 EUR × 10,806953 NOK/EUR (ECB-dagskurs) = 153,46 kr.
  BE-ROAS = 399/(399−153,46) = **1,62**.
- **Videor:** 12/12 proofread → SRT-lokalisering (sonnet-subagent) → HeyGen-
  render → captions. Enda rättningen: "tredimensjonal-sandbildet" (HeyGen
  skrev ut siffran som ord) → "3D-sandbildet". Övriga 11 filer redan korrekta.
  Ingen SEK, ingen Sverige-referens i källmanuset att börja med.
- **QA:** alla 48 bilder (36 QA + 12 slutkort) granskade av dedikerad
  QA-subagent — 12/12 GODKÄND, inget svenskt syns.
- **Adcopy:** norsk Meta-copy (CS/GT/PD/SP) skriven av copy-subagent,
  tre-frågorstestet redovisat — PD-konceptet ("Snu den. Se hva som skjer.")
  klarade alla tre frågor helt.
- **Levererat:** 12 mp4 i chatten (6 zip ≤30 MiB). Drive: MAKE TO NORWAY →
  "NO 3D-sandbild" (ny mapp): 12 mp4 + 4 adcopy-txt uppladdade.
- **Launchad ACTIVE:** kampanj-ID 120252102020040233, "Sandbilde NO |
  BE-ROAS 1,62 | 2026-09-06", CBO 1000 kr/dag, 4 adsets (CS/GT/PD/SP), 3
  videoannonser vardera (12 totalt).
- Bildannonser (Fas 3.2) INTE körda denna natt — se anteckning i slutet.

## Arbetslampa för Makita-batteri → Arbeidslampe NO

- **Pris:** 339 kr. CS-annonsens claim "50% RABATT" höjde jämförpriset i
  Shopify NO 441→678 kr (`--product-id 15547994571127 --rabatt 50`) så
  claimen stämmer exakt.
- **COGS:** batch-sheet #5.1, "Work light for Makita battery", NORWAY-
  blockets Total ex. tax Qty 1 = 12,08 EUR × 10,806953 = 130,55 kr.
  BE-ROAS = 339/(339−130,55) = **1,63**.
- **Videor:** 12/12 proofread → SRT-lokalisering → HeyGen-render → captions.
  Enda rättningen: OCR-fel "2omt" → "tomt" i CS_1_H2 (två gånger). Övriga 11
  filer redan korrekta, "Makita" korrekt stavat genomgående.
- **QA:** alla 48 bilder granskade — 12/12 GODKÄND.
- **Adcopy:** norsk Meta-copy skriven av copy-subagent, headlines för
  GT/PD/SP omskrivna till Makita-/betygskopplade rader för att klara
  tre-frågorstestet fullt ut.
- **Levererat:** 12 mp4 i chatten (10 zip ≤30 MiB). Drive: MAKE TO NORWAY →
  "NO Arbetslampa för Makita-batteri" (12 mp4 + 4 adcopy-txt).
- **Launchad ACTIVE:** kampanj-ID 120252102071560233, "Arbeidslampe NO |
  BE-ROAS 1,63 | 2026-09-06", CBO 1000 kr/dag, 4 adsets (CS/GT/PD/SP), 3
  videoannonser vardera (12 totalt). Kontot hårt rate-limitat (Meta-fel 17)
  på alla fyra adsets — gick igenom med skriptets inbyggda backoff.
- Bildannonser (Fas 3.2) INTE körda denna natt.

## Glasspints med Lock 2-pack → Iskrembokser NO

- **Pris:** 449 kr. CS-annonsens claim "40% RABATT" höjde jämförpriset i
  Shopify NO 584→749 kr (`--product-id 15547994734967 --rabatt 40`) så
  claimen stämmer (40,1 %).
- **COGS:** batch-sheet #5.1, "Ice cream pints with lids, 2-pack", NORWAY-
  blockets Total ex. tax Qty 1 = 16,16 EUR × 10,806953 = 174,64 kr.
  BE-ROAS = 449/(449−174,64) = **1,64**.
- **Videor:** 12/12 proofread → SRT-lokalisering → HeyGen-render → captions.
  Rättning: produktnamnet var inkonsekvent/felöversatt ("ispinner",
  "iskrembegre", "isbokser", "isformer" — flera fel produkttyper) → enhetligt
  "iskrembokser" i alla 12 filer. "30 dagars nöjd-kund-garanti" i SP-copyn
  skrevs om till "Trygt å prøve" (ingen ospecificerad norsk garantitext).
- **QA:** alla 48 bilder granskade — 12/12 GODKÄND. Engelsk/fransk text på
  produktförpackningen i bild (inbränt i originalmastern, inte en caption)
  lämnad orörd — ingen svensk domän eller svenskt pris.
- **Levererat:** 12 mp4 i chatten (6 zip ≤30 MiB). Drive: MAKE TO NORWAY →
  "NO Glasspints med Lock 2-pack" (12 mp4 + 4 adcopy-txt).
- **Launchad ACTIVE:** kampanj-ID 120252102162200233, "Iskrembokser NO |
  BE-ROAS 1,64 | 2026-09-06", CBO 1000 kr/dag, 4 adsets (CS/GT/PD/SP), 3
  videoannonser vardera (12 totalt). Kontot hårt rate-limitat (Meta-fel 17)
  genomgående — första körningen kraschade efter 8 försök på första adsetet,
  omkörningen (idempotent, inga dubbletter) gick igenom på alla fyra.
- Bildannonser (Fas 3.2) INTE körda denna natt.

## Bildannonser (Fas 3.2) — inte körda, känd lucka

Videobatchen (36 videor, tre launchar) tog hela tidsbudgeten. Alla tre
produkter har `*_2_1`-bildfiler i Drive som väntar. Bör tas igen i en
kommande körning eller manuellt.

## Definition of done

- [x] LAUNCHED listad; WINNERS, LOSERS och MAKE TO NORWAY exkluderade
      (rekursivt); kandidater = utan NO-mapp OCH utan kampanj i NO-kontot;
      3 launchade (max), 1 blockerad (Bordtennisnät), ingen kö kvar utöver den
- [x] Alla annonsvideor i produktmapparna inventerade; icke-annonser exkluderade
- [x] Norsk produktsida + NOK-pris verifierade för alla tre launchade produkterna
- [x] Bordtennisnät (kunde inte köras): problemmeddelande i #problems-no med ping
- [x] Norge-COGS läst ur NORWAY-blocket i batch-sheet #5.1, ingen tull
- [x] Kvot räckte, rapporterad före/efter
- [x] Proofread FÖRE rendering på alla 36 videor; SRT-rättelser redovisade
- [x] Copy/SRT-rader skrivna av sonnet-subagent, tre-frågorstestet redovisat
- [x] Inbränd svensk text skannad; alla 108 QA-bilder + 36 slutkort granskade
      (dedikerade QA-subagenter), inget svenskt syns
- [x] Slutkortssvep gjort (36/36 slutbilder granskade)
- [❌] Levererat i chatten som zip ≤30 MiB — 22 zip byggda lokalt
      (`final/zips/`), men INTE skickade: rutinen kördes utan mottagare i
      chatten (schemalagd nattkörning). Huvudleveransen (Drive + Meta) är
      gjord och är den permanenta kopian.
- [x] Kampanj per produkt i act_1050941584152547: CBO 1000 kr/dag, adset per
      koncept, enhancements OPT_OUT, status ACTIVE, BE-ROAS + datum i namnet,
      dubblettspärren körd
- [x] Drive-leverans: tre nya "NO <produkt>"-mappar i MAKE TO NORWAY, 36 mp4
      + 12 adcopy-txt uppladdade
- [x] Körloggen uppdaterad, allt committat och pushat
- [x] Discord-brief skickad i `#translation-till-norge-av-nya-produkter`, ping på

## API-verifiering efteråt

Alla tre kampanjer verifierade ACTIVE/ACTIVE med rätt daglig budget (100 000
öre = 1000 kr) direkt mot Graph API. Skriptets egna radvisa bekräftelser vid
skapandet ("✓ annons (ACTIVE): …") visar att samtliga 36 annonser (12 per
kampanj, 4 adsets × 3) skapades och sattes ACTIVE utan fel.

## Kvot

HeyGen: 19 937 → 18 679 (1 258 credits, 36 videor proofreadade + renderade,
inga misslyckade sessioner).
