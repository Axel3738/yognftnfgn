# Video-lokalisering — mp4-annonser → HeyGen → Veed

Processen för att ta en färdig mp4-annons (t.ex. en vinnande Mastern-video på svenska),
översätta den till ett valt språk i **HeyGen**, lokalisera innehållet i proofread-steget,
och sedan bränna in captions i **Veed** innan leverans.

> Kärnprincipen: **översättning ≠ lokalisering.** En rakt översatt annons som säger
> "används mycket i Sverige" till en norsk tittare är en sämre annons. Proofread-steget
> är där vi gör om innehållet så att det stämmer för målmarknaden — *innan* videon renderas.

## Flödet

```
1. VÄLJ         → vilka mp4:or + målspråk/marknad (loggas i tabellen nedan)
2. HEYGEN       → ladda upp mp4:n i HeyGen Video Translate, välj målspråk,
                  slå PÅ "Proofread" så översättningen stannar för granskning
3. PROOFREAD    → gå igenom hela transkriptet mot checklistan nedan och
                  uppdatera allt som är Sverige-specifikt till målmarknaden
4. RENDERA      → godkänn proofread → HeyGen dubbar (röstklon + lip-sync) → ladda ner mp4
5. VEED         → ladda upp den översatta mp4:n i Veed → auto-subtitles på målspråket
                  → granska texten → styla → bränn in → exportera
6. LEVERERA     → döp filen enligt namnkonventionen (med marknadsfält) →
                  skicka till Axel → logga i tabellen nedan + ad-trackern
```

## Steg 3 — lokaliserings-checklistan (proofread)

Det här är det viktigaste steget. Gå igenom **varje mening** i transkriptet och fråga:
*"stämmer det här för någon i målmarknaden?"* Ändra direkt i HeyGens proofread-läge.

| Kolla | Exempel på ändring |
|-------|--------------------|
| **Geo-referenser** | "den här grillborsten används mycket i Sverige" → "används mycket i till exempel Norge" |
| **Valuta & pris** | "999 kr" → rätt valuta OCH rätt prispunkt för marknaden (inte bara kursomräknat) |
| **Butik / domän** | grillkliniken.se → målmarknadens domän om den finns, annars ta bort/generalisera |
| **Social proof** | "10 000 svenska grillägare" → generalisera ("10 000 nöjda kunder") eller byt land om siffran håller |
| **Frakt & leverans** | "fri frakt i hela Sverige", "levereras på 2 dagar" → marknadens faktiska villkor |
| **Säsong & högtider** | midsommar, kräftskiva → målmarknadens motsvarigheter (eller neutralt "grillsäsongen") |
| **Juridik & garantier** | garanti-/ånger-claims måste stämma med målmarknadens regler |
| **Produktnamn & uttal** | kolla att "Mastern"/"Grillkliniken" inte betyder något konstigt på målspråket och uttalas rimligt i dubben |

Regel: **ändra hellre till något generellt än att gissa marknadsfakta.** Vet vi inte
norska fraktvillkor → skriv inget om frakt.

## Steg 5 — captions i Veed

1. Ladda upp den färdigöversatta mp4:n från HeyGen.
2. `Subtitles → Auto Subtitles` → välj **målspråket** (inte svenska).
3. Granska texten rad för rad — auto-transkribering stavar ofta fel på egennamn
   (`Mastern`, `Grillkliniken`) och på siffror/valuta. Rätta mot proofread-transkriptet.
4. Styla: vit text, mörk bakgrundsplatta/scrim, placering i nedre tredjedelen men **ovanför**
   Reels/Stories-UI:t (safe zone), max 2 rader per caption.
5. Exportera med **inbrända** captions (burned-in) — vi litar inte på plattformarnas cc.

## Namngivning

Lokaliserade varianter får marknadsfältet enligt `naming-convention.md`:

```
GRILL_mastern_pain_comparison_ruinsgrill_no_v1
                                         └─ marknad (ISO-landskod, utelämnas för SE-original)
```

Filen döps likadant: `GRILL_mastern_pain_comparison_ruinsgrill_no_v1.mp4`.

## Verktyg & automation

- **HeyGen:** UI:t är huvudvägen eftersom proofread-steget (obligatoriskt i den här
  processen) görs där. För att lista språk, kolla jobb-status och ladda ner färdiga
  videor i bulk finns `pipeline/localize.mjs` (HeyGens API — kräver `HEYGEN_API_KEY`).
  OBS: API:t kan skicka och hämta översättningar men proofread-redigeringen görs i UI:t.
- **Veed:** UI. Auto-subtitles + styling + export enligt steg 5.

**Krav i Claude Code-environmentet** (för att skriptet ska funka i webbsessioner):

1. Miljövariabel `HEYGEN_API_KEY` = nyckeln från app.heygen.com → Settings → API
   (EN variabel: namnet i namn-fältet, nyckeln i värde-fältet).
2. Nätverkspolicyn (network egress) måste tillåta `api.heygen.com` och
   `upload.heygen.com`. Nedladdningslänkarna för färdiga videor ligger på HeyGens
   resurs-domäner (`*.heygen.ai`) — blockeras en nedladdning, lägg till hosten
   som felmeddelandet visar.

```bash
cd pipeline
node localize.mjs check                                  # verifiera nyckeln + kvot
node localize.mjs langs                                  # vilka målspråk HeyGen stödjer
node localize.mjs submit --file=../input/annons.mp4 --lang=Norwegian
node localize.mjs status --id=<video_translate_id>
node localize.mjs download --id=<video_translate_id> --out=output/localized/
```

## Körningar (logg)

| Källannons | Marknad/språk | HeyGen | Proofread | Veed captions | Levererad | Anteckning |
|------------|---------------|--------|-----------|---------------|-----------|------------|
| _–_ | _–_ | _–_ | _–_ | _–_ | _–_ | _första körningen loggas här_ |

Status per kolumn: ⏳ pågår · ✅ klar · ❌ fail. När en lokaliserad annons går live
loggas den dessutom som vanligt i `ad-tracker.md` (den är ett eget test).
