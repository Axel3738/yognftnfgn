# Video-lokalisering — mp4-annonser → HeyGen → Veed

Processen för att ta en färdig mp4-annons (t.ex. en vinnande Mastern-video på svenska),
översätta den till ett valt språk i **HeyGen**, lokalisera innehållet i proofread-steget,
och sedan bränna in captions i **Veed** innan leverans.

> Kärnprincipen: **översättning ≠ lokalisering.** En rakt översatt annons som säger
> "används mycket i Sverige" till en norsk tittare är en sämre annons. Proofread-steget
> är där vi gör om innehållet så att det stämmer för målmarknaden — *innan* videon renderas.

## Så beställer du (dump-flödet)

Starta en session på repot, bifoga mp4-filerna (eller klistra Drive-länkar med
"alla med länken kan visa") och skriv målspråket — t.ex. *"översätt dessa till norska"*.
Claude kör då hela kedjan per video och levererar tillbaka färdiga filer med captions,
plus en proofread-logg per annons.

OBS för API-körningar: HeyGen renderar direkt utan proofread-paus. Claude granskar
därför transkripten i efterhand, rättar captions-texten automatiskt och flaggar de
annonser där även **ljudet** behöver en omrendering i HeyGens UI (t.ex. felöversatta
varumärkesnamn). Beslut om omrendering tas per annons — varje render drar HeyGen-krediter.

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

## Steg 5 — captions (burn-in)

**Standardväg — lokalt med ffmpeg (gratis, inget konto):** HeyGen levererar en SRT
med exakta tidkoder. Uppdatera den med proofread-ändringarna och bränn in:

```bash
node localize.mjs burn --video=output/localized/ad.mp4 --srt=output/localized/ad.srt
```

Stylingen (vit fet text, mörk platta, safe zone ovanför Reels/Stories-UI:t) ligger i
`burn`-kommandot i `localize.mjs` — justera `force_style` där.

**Alternativ när man vill handstyla — Veeds UI:**

1. Ladda upp mp4:n → `Subtitles → Upload subtitle file` (använd SRT:n — auto-subtitles
   stavar fel på egennamn som `Mastern`) eller `Auto Subtitles` på målspråket.
2. Granska rad för rad, styla, exportera med **inbrända** captions (kräver betalplan
   för export utan vattenstämpel).

**Alternativ för bulk — Veeds Subtitle API** (`captions`-kommandot, via fal.ai,
betala-per-användning ~$0.10/min, kräver `FAL_KEY`).

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
2. Miljövariabel `FAL_KEY` = nyckeln från fal.ai → Dashboard → Keys (för Veeds
   Subtitle API, som körs via fal.ai; kostar ca $0.10/min video).
3. Nätverkspolicyn (network egress) måste tillåta `api.heygen.com`,
   `upload.heygen.com`, `queue.fal.run` och `fal.media`. Nedladdningslänkar för
   färdiga videor ligger på `*.heygen.ai` resp. `*.fal.media` — blockeras en
   nedladdning, lägg till hosten som felmeddelandet visar.

```bash
cd pipeline
node localize.mjs check                                  # verifiera nyckeln + kvot
node localize.mjs langs                                  # vilka målspråk HeyGen stödjer
node localize.mjs submit --file=../input/annons.mp4 --lang=Norwegian
node localize.mjs status --id=<video_translate_id>
node localize.mjs download --id=<video_translate_id> --out=output/localized/
node localize.mjs captions --id=<video_translate_id> --srt=redigerad.srt   # Veed burn-in
```

**Captions-steget via API:** `captions` tar HeyGen-jobbets färdiga video + SRT
(HeyGens egen, eller en lokalt redigerad med proofread-ändringarna via `--srt=`)
och skickar dem till Veeds Subtitle API — SRT:n gör att Veed hoppar över egen
transkribering, så texten matchar dubben exakt. Veeds UI (steg 5 ovan) är kvar
som manuellt alternativ när man vill handstyla.

## Körningar (logg)

| Källannons | Marknad/språk | HeyGen | Proofread | Veed captions | Levererad | Anteckning |
|------------|---------------|--------|-----------|---------------|-----------|------------|
| `GRILL_mastern_video_ad01` (sv) | no / Norwegian Bokmål | ✅ 2026-08-07 | ⏳ 3 ändringar föreslagna (rad 1, 3, 7) | ⏳ | ⏳ v1-dubben skickad för lyssning | job `3fb4a887…-nb_nb-NO` · inga geo/pris-referenser i källan |

Status per kolumn: ⏳ pågår · ✅ klar · ❌ fail. När en lokaliserad annons går live
loggas den dessutom som vanligt i `ad-tracker.md` (den är ett eget test).
