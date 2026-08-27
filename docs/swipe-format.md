# Så görs en swipe — normativt format

> Skrivet 2026-08-26 efter en miss: briefer 010/011 levererades som "swipes" av
> en slideshow-annons men var i själva verket egna koncept. De hade rätt *idé*
> (bildspel) och fel *mekanik* — 15 sekunder i stället för 7, hard cuts i stället
> för zoom, hela meningar i stället för 3-ordsrutor, livsscener i stället för
> produkt. **En swipe som inte kopierar mekaniken är inte en swipe.**

## Regeln

**Swipe = strukturkopia. Vi byter INNEHÅLL, aldrig MEKANIK.**

Det som ska överleva från originalet, exakt:

| Vad | Varför det är mekanik, inte smak |
|---|---|
| **Total längd** | 7 s och 15 s är olika annonsformat, inte olika smak |
| **Duration per shot** | Rytmen ÄR annonsen — den styr retention |
| **Kamerarörelse** | Zoom/pan är retention-verktyg, ofta uttalat i originalet |
| **Antal shots med text vs utan** | Text på 3 av 6 är ett val, inte slarv |
| **Ordantal per textruta** | 3 ord i en 1,5-sekundersruta. Meningar hinner inte läsas |
| **Var offret ligger** | Mitt i vs i slutet är två olika annonser |
| **Vad som är i bild** | Ren produkt vs livsscener med människor |
| **Payoff-momentet** | Var i tidslinjen belöningen kommer |

Det som byts: produkten, texternas innehåll, miljön — så länge tidsschemat och
rytmen sitter kvar.

## Formatet en swipe-nedbrytning ska ha

Kopiera Axels eget Animalsox-dokument — det är facit:

```
Original: <länk till annonsen>

Copy på annonsen:
  Primärtext: ...
  Rubrik: ...
  Beskrivning: ...

Shot 1:
  On screen text: ...
  Kamerarörelse: ... (t.ex. "zoomar in efter 1 sek för att öka retention")
  Duration: ~1,5 s
Shot 2:
  ...
```

**Copy-lagret (primärtext/rubrik/beskrivning) är inte valfritt.** En brief utan
det lämnar halva annonsen odefinierad.

## Checklista innan en swipe-brief levereras

- [ ] Total längd inom ±20 % av originalet
- [ ] Samma antal shots (eller motiverat varför inte)
- [ ] Duration angiven per shot
- [ ] Kamerarörelse angiven per shot (eller "ingen" — men uttalat)
- [ ] Samma andel shots med/utan text
- [ ] Ordantal per textruta ≤ originalets
- [ ] Offret på samma plats i tidslinjen
- [ ] Samma bildvärld (produkt vs scen vs talking head)
- [ ] Payoff-momentet ligger på samma plats
- [ ] Primärtext, rubrik och beskrivning finns med


## Bildlagret analyseras ALLTID — inte bara ljudet

> Skrivet 2026-08-27 efter Axels andra tillsägelse i samma ämne. Första gången
> (Levain-videon) läste jag inbrända undertexter och trodde det var voiceovern.
> Andra gången (SweSocks) levererade jag en nedbrytning helt utan bildlager.
> **Ljudet är halva annonsen. Att bara analysera det är att inte analysera den.**

Har vi videofilen finns det ingen ursäkt. Så här görs det:

```bash
# 1. Klipp ut en bildruta varannan sekund
ffmpeg -i annons.mp4 -vf fps=0.5 frames/%03d.png
# 2. Läs varje bildruta som bild (Read-verktyget visar dem)
# 3. Längd, upplösning, bildfrekvens:
ffprobe -v error -show_entries format=duration -show_entries stream=width,height,r_frame_rate annons.mp4
```

Sedan fylls den här tabellen i — **per shot**, inte per mening:

| Vad | Hur det tas fram |
|---|---|
| Antal shots | Räkna klippen mellan bildrutorna |
| Duration per shot | Tidsstämpeln där bilden byts |
| Kamerarörelse | Jämför två intilliggande rutor: zoomar, panorerar, står still? |
| On screen-text | Läs den ur bildrutan — **skriv aldrig av voiceovern och kalla det text** |
| Vad som är i bild | Produkt? Ansikte? Miljö? Händer? |
| Var offret ligger | Vilken sekund erbjudandet syns |
| Payoff-momentet | Vilken sekund belöningen kommer |

**Inbränd text och voiceover är två olika spår** och ska redovisas i två olika
kolumner. Levain-annonsens bästa trick var just att spåren sa olika saker —
texten sålde suget, rösten sålde bristen. Den insikten fanns inte att få ur
enbart det ena.

### När vi INTE har filen

Metas annonsbibliotek går **inte** att läsa maskinellt härifrån. Testat
2026-08-27, fyra vägar, alla 403:

| Väg | Utfall |
|---|---|
| WebFetch på `facebook.com/ads/library/?id=…` | 403 |
| curl med webbläsar-UA | 403 — Facebooks egen JS-botkoll, inte proxyn |
| curl som fullföljer `__rd_verify`-utmaningen | 403, ny token varje varv |
| Headless Chromium via proxyn | `ERR_CONNECTION_RESET` |

`ads_library_search` ger bara metadata (sida, rubrik, datum) — aldrig primärtext,
bild eller video.

**Alltså:** be om filen, en skärminspelning eller en inklistrad transkribering.
Och **säg rakt ut i leveransen att bildlagret saknas** — märk nedbrytningen som
*manus-swipe*, aldrig som en full swipe. Att tiga om luckan är värre än luckan.

## Varningstecknet

Om briefen går att läsa utan att man förstår vilken annons den är en kopia av —
då är den inget swipe. Då är den ett eget koncept som lånat ett ord.
