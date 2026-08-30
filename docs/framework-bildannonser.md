# Framework — bildannonser för en ny produkt

Destillerat ur produktionen för Beachslippers, Ergoslippers, Trimmerbelt,
Enginecover, Seatcover, Rodholder och Matstrumpor. Varje regel här finns för
att motsatsen har kostat pengar minst en gång.

---

## Steg 0 — Inventera källorna innan något genereras

1. **Läs hela hubben i Notion** (SQL mot data source, titelkolumnen heter `Namn`).
2. **Lita aldrig på `Typ`-fältet** — det står "Video - Pending Approval" på
   nästan allt. Avgör vad som är bildannons via:
   - repots mappstruktur (`image-ads-briefs/` vs `video-ads-briefs/`) — facit
     när den finns,
   - annars namnmönstret: `_1` = statisk bild, `_H1`/`_H2` = videohook,
     "carousel" i namnet = karusell.
3. **Läs varje brief helt**, inte bara tabellen. Och läs den **senaste
   batchens README/GLOBAL RULES även för gamla annonser** — en senare batch
   kan korrigera produktsanningen retroaktivt. (Rodholder batch 4 förbjöd
   väggmontering; en redan godkänd annons visade just väggmontering.)
4. Bygg en inventeringstabell: annons → batch → status → producerad/blockerad.
   Items som är märkta BLOCKED produceras inte — de rapporteras med skäl.

## Steg 1 — Etablera produktsanningen

1. Hämta **äkta produktbilder**: produktsidans CDN, `reference-assets/`,
   leverantörsbilder. Ladda ner, titta på dem i full storlek.
2. Skriv ner innan produktion:
   - **Exakt pris** (och bara det — jämförpris endast om det finns på sidan).
   - **Vad produkten faktiskt gör**, med ägarens ord. Gissa aldrig funktionen
     ur bilderna — en klämma som "ser ut" att kunna väggmonteras kanske aldrig
     får visas monterad.
   - **Förbudslistan**: procentsatser utan täckning, påhittade omdömen/stjärnor/
     "verifierad kund", nedräkningar, gamla priser, konkurrentnamn,
     tillverkarlogotyper, AI-människor där briefen förbjuder det.
   - **Produktdefekter att dölja**: förvanskat tryck ("OK ouranni…") vinklas
     bort eller retuscheras — aldrig läsbart i bild.
3. Är det oklart vilket material eller vilken funktion som avses: **fråga**.
   En felgissning kostar krediter och trovärdighet.

## Steg 2 — Produktbild-hierarkin (viktigaste regeln)

Välj alltid den högsta nivå som räcker:

| Nivå | Metod | När |
|---|---|---|
| 1 | **Använd det riktiga fotot rakt av** | Fotot visar redan det briefen ber om |
| 2 | **Klipp ut produkten ur riktiga fotot och komponera i PIL** | Ren produktannons: platta/gradient + urklipp + text. Produkten blir exakt rätt varje gång |
| 3 | **Generera miljön med riktiga fotot bifogat som referens** | Bara när en scen krävs som inte finns (däck, båt, bagagelucka) |
| — | ~~Låta modellen rita produkten fritt~~ | **Aldrig.** Formen vandrar: C-krokar, U-konsoler, fel material |

Urklippsteknik för nivå 2: **flood fill från bildkanten** — bara den
sammanhängande bakgrunden blir genomskinlig. En ren ljuströskel äter upp ljusa
produktdetaljer (silverhylsor) och lämnar vit halo mellan mörka partier.
Kontrollera utklippet mot **medelgrå** bakgrund — där syns halo direkt.
Erodera masken 1–2 px, mjuk kant 0.6–0.8 px.

## Steg 3 — Text sätts alltid deterministiskt, aldrig genererad

1. All copy komponeras i PIL ovanpå bilden. Modellen får **aldrig** rendera
   svenska/engelska ord, priser eller rutnät — den stavar fel och driver layout.
2. Texten tas **ordagrant** ur briefens "use this"-kolumn. Skriv aldrig om,
   "förbättra" aldrig.
3. **Verifiera med skript**: varje renderad sträng ska hittas exakt
   (`s in brief_text`) i brief-filen, plus en förbuds-grep (`149`, `%`,
   `RABATT`, `vägg`, `skruv` …) och en mojibake-koll (endast å/ä/ö + tankstreck
   utanför ASCII).
4. Typografi:
   - Hierarki med **verkliga steg**: rubrik > etikett/underrad > footer.
     Mät i px — granskare mäter.
   - Vit text på färgplatta: kontrast **≥ 4,5:1** (mörka ner plattan, inte
     texten; #F85828 → #D64014 räckte).
   - Bryt rubriker vid meningsgräns, aldrig ordflottar ("välja." ensamt).
   - Etiketter i cellens **topp**, aldrig över produkten; samma inset överallt.
   - Font: Liberation Sans Bold (`/usr/share/fonts/truetype/liberation/`),
     fallback DejaVu Sans Bold.

## Steg 4 — Genereringsregler (när nivå 3 krävs)

1. Bifoga produktreferensen (rent urklipp, utan inbränd text) i **varje enskilt
   anrop** — inte bara det första.
2. Promptmönster som fungerar:
   - Produktbeskrivningen **upprepas ordagrant i varje prompt** (form, färg,
     detaljer: "parting line, arched loop, foam pad").
   - En **NEVER-lista** för produkten ("never an open hook, never a bracket,
     never a plate with screw holes").
   - En **negativlista** i slutet: no text, no letters, no numbers, no logos,
     no watermark, no people/hands/faces, no mounting/screws/rails.
   - Räkneord skrivs hårt: "EXACTLY FOUR — not three, not five".
3. **Jämförelser/splits**: generera den andra panelen **från** den första
   (bilden som referens + "keep the exact same planks/light/camera") så att
   enda skillnaden är den briefen testar. Två fristående foton läser som två
   olika scener.
4. Kvantitet i bild måste matcha erbjudandet — sälj inte 4-pack med fem
   produkter i bild.
5. Max 12 jobb per batch. Spara job-id:n; ett färdigt jobb funkar som referens
   för varianter/översättningar.

## Steg 5 — QA i tre lager (leverera aldrig före lager 3)

1. **Deterministisk textdiff** (steg 3.3) — fångar stavning och förbjudet
   innehåll gratis.
2. **Egen visuell granskning** av varje fil, plus **inzoomningar** på
   riskzonerna: händer (räkna fingrar), där produkt möter spö/yta
   (AI-artefakter), bakgrundsobjekt (skruvar, konsoler, pseudotext på props).
3. **Adversariell agentgranskning**: en oberoende granskare per fil med
   uppdraget "hitta fel, inte lugna", som ska
   - transkribera all text i bilden tecken för tecken,
   - räkna produkterna och jämföra mot erbjudandet,
   - göra domän-checken (t.ex. "är något monterat?"),
   - tumnagel-testa (läsbart vid 3 cm?),
   plus en kritiker som korsjämför 1:1 mot 4:5 och letar oprövade regler.
4. **Skicka inte innan QA är klar.** Två gånger skickades en zip på delresultat
   och fick ersättas. Ofullständig QA = ingen QA.
5. När något underkänns: hitta **grundorsaken i metoden**, inte i prompten —
   och skriv in den i det här dokumentet.

## Steg 6 — Leverans

1. Export: JPEG **q92, sRGB, subsampling=0**, stega ner tills < 2 MB.
   Format 1:1 + 4:5 (eller vad briefen kräver). Exakta ad-namn ur briefen.
2. Zip med tre delar:
   - `bilder/` — filerna,
   - `ANNONSTEXTER.md` — rubrik/primärtext/CTA per annons, ordagrant,
   - `LÄS_MIG.md` — **avvikelser från briefen med motivering**, vad som är
     foto vs renderat, vad som medvetet INTE producerades och varför, och vad
     som bör bytas mot riktigt material innan skalning.
3. Notion efter leverans: flytta levererade items till `In Review` och
   rapportera vilka. Blockerade items står kvar med uttalat skäl.
4. Ljug aldrig i status: "klart" betyder QA-godkänt och skickat.

## Steg 7 — Erbjudanden och priser (går före allt annat)

- Endast priser som **finns på produktsidan just nu**.
- Procentsats kräver ett verifierbart jämförpris. Saknas det: använd ärlig
  knapphet — "Vi säljer ut lagret", "så långt lagret räcker" — sant och
  omöjligt att få fel.
- Överstrykning är ett **ritat streck**, aldrig ordet.
- BOGO ("Köp 1 få 1 gratis") är ett prisfritt erbjudande som funkar på alla
  marknader utan valutafrågor.
- "Fri frakt" bara med de villkor som faktiskt gäller.

## Snabbchecklista per annons

- [ ] Brief läst i sin helhet + senaste batchens GLOBAL RULES
- [ ] Produktsanning + förbudslista nedskriven
- [ ] Produkten = riktigt foto (nivå 1/2) eller referensstyrd (nivå 3)
- [ ] All text deterministisk, ordagrann, skriptverifierad
- [ ] Kontrast ≥ 4,5:1, hierarki mätbar, inget över produkten
- [ ] Antal i bild = erbjudandet
- [ ] Inzoomning på händer/produktmöten/props gjord
- [ ] Agentgranskning klar, blockers åtgärdade
- [ ] Export q92 <2MB, båda formaten, rätt ad-namn
- [ ] LÄS_MIG med avvikelser + zip skickad
- [ ] Notion-status flyttad och rapporterad
