# /skool – Transkribera en hel Skool-kurs till ett läsbart dokument

**Användning:** `/skool <klassrums-länk>` — t.ex.
`/skool https://www.skool.com/lodestar/classroom/4ddcb1f2?md=4d30536d300f40139b0b42e021cd5ff4`

Axel har köpt kursen och vill **läsa** den i stället för att titta. Leveransen är ett
stort, välstrukturerat dokument som följer kursens egen struktur: varje modul i
ordning, textsidorna som de står, videorna ordagrant transkriberade med
mellanrubriker och tidsstämplar, bilagorna återgivna. Privat bruk — sprid aldrig
innehållet, och lägg aldrig upp det publikt.

Kräver `SKOOL_EMAIL` + `SKOOL_PASSWORD` i Environments (finns sedan 2026-09-17).

---

## Steg 1 — Hämta kursen (verktyget, inga gissningar)

```bash
node skool/hamta.mjs "<klassrums-länk>"
```

Loggar in i Playwrights Chromium, läser kursträdet ur `__NEXT_DATA__`, går igenom
varje modul, hämtar modultexten, videons **Mux-undertext** ("English CC" — finns på
Skools egna videor), bilagorna via `api2.skool.com/files/<id>/download-url` (POST)
och skriver allt till `skool/output/<grupp>/<kurs>/` (`kurs.json`,
`moduler/`, `undertexter/`, `bilagor/`, `RA-TRANSKRIPTION.md`). Läs
sammanfattningsraden: **antal moduler, videor, med undertext, bilagor.**

- Video **utan undertext** ⇒ kör om med `--ljud` (yt-dlp laddar ner ljudspåret) och
  transkribera med `faster-whisper` (`pip install faster-whisper`, modell `medium.en`,
  `compute_type=int8`; ~2,7× realtid på 4 CPU:er — 25 min ljud tar ~9 min).
  Säg i rapporten vilka videor som gick den vägen.
- **Extern video** (YouTube/Loom/Vimeo i `videoLink`) hämtas inte av verktyget —
  yt-dlp + Whisper för hand, och säg det.
- Bilaga som är PDF: text ur `pypdf` (`pip install pypdf cffi` — systemets
  `cryptography` saknar `_cffi_backend` utan `cffi`). Skärmdumpar/bilder: beskriv
  kort vad de visar, hitta aldrig på text.

## Steg 2 — Städa varje video (subagenter, en per video)

Undertexten är fragment på ~10 ord. Låt en subagent per video (`model: "sonnet"`,
parallellt) göra den läsbar, med **exakt** dessa regler i prompten:

1. Behåll varje mening, i ordning, med talarens egna ord. Ingen omskrivning, ingen
   sammanfattning, ingen översättning, inga egna meningar.
2. Tillåtet: slå ihop fragment till meningar, styckebryt vid ämnesbyte (3–8 meningar
   per stycke), ta bort rena stamningar ("the, the"), rätta versaler/skiljetecken.
3. Rätta ett ord BARA när tal-till-text-felet är entydigt ("Pl ops" → HappyFlops,
   "MODASH" → Modash). Osäkert = låt stå. Hitta aldrig på siffror eller namn.
4. Mellanrubriker (`####`) var 3–6 minut vid nytt ämne, avslutade med tidsstämpeln
   från första cue:n `[mm:ss]` (`[h:mm:ss]` efter en timme). Rubriken beskriver vad
   som faktiskt sägs där.
5. Bara rubriker och stycken. Ingen titel, ingen inledning, inga punktlistor, ingen
   fetstil.
6. Ordantalet ska ligga inom 5 % av källan — agenten rapporterar båda talen.

Kontrollera sedan själv, per video, innan något går in i dokumentet:
ordantal (95–105 %), att inga siffror finns i städat som saknas i källan, antal
rubriker. Faller något utanför: skicka tillbaka till agenten, aldrig vidare.

## Steg 3 — Bygg dokumentet (Claude Doc), i kursens ordning

Skapa dokumentet FÖRST som skelett (titel, byline, en pending-block per modul),
öppna det, fyll sedan **ett avsnitt per anrop** (gräns 32 kB per anrop — en video
på 70+ min delas i två: `replace` av pending-blocket, sedan `insert` med
`side: "end"` på avsnittets H2-id).

Struktur per modul:

- Textsida: `## <modulens titel>` + kursiv rad "*Textsida, modul N av M.*" + texten.
- Video: `## N. <titel>` + kursiv rad "*Video N av 4 · X min · [öppna i Skool](länk med ?md=)*"
  + `### Kurssidans text` (modulens egen beskrivning) + `### Transkription` +
  kursiv förklaring av tidsstämplarna + den städade texten (`####`-rubrikerna).
- Bilaga: `### Bilaga: <titel> (PDF)` sist i modulens avsnitt, i sin helhet.
- Först i dokumentet: "Om det här dokumentet" — vad, källa, hur det är ordnat, en
  tabell över modulerna (typ + längd), var råfilerna ligger i repot.

Första dokumentet till en person: lämna EN kommentar förankrad i en passage du
skrivit, med en fråga (bekräfta ett antagande eller välj mellan två alternativ).

## Steg 4 — Spara i repot och pusha

`skool/output/<grupp>/<kurs>/` committas (undertexter med tidkoder, modultexter,
bilagor, `kurs.json`) **plus** de städade transkriptionerna som
`transkription/NN-<slug>.md` och det ihopsatta `TRANSKRIPTION.md`. Ljudfiler
(`ljud/`) committas aldrig (gitignore). Commit + push till sessionens gren.

---

## Definition of done

- [ ] `hamta.mjs` körd; sammanfattningsraden citerad (moduler / videor / med undertext / bilagor)
- [ ] Varje video har städad text som klarat kontrollen (ordantal 95–105 %, inga nya siffror)
- [ ] Varje modul finns i dokumentet, i kursens ordning, med rätt typ (text/video/bilaga)
- [ ] Videor utan undertext: transkriberade med Whisper och markerade som det — eller listade som saknade
- [ ] Bilagor återgivna (PDF-text) eller listade med orsak
- [ ] Dokumentet öppnat för Axel, länken given en gång, en kommentar lämnad
- [ ] Råfiler + städade transkriptioner committade och pushade
- [ ] Rapport till Axel på svenska, kort: vad som finns, vad som saknas, och hans egna klick sist (om några)
