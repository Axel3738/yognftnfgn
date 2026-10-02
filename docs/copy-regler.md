# Copy-reglerna (Harry Dry)

Destillat av "CS copywriting in 76 minutes" (Harry Dry-intervju), 2026-08-12.
**Obligatorisk för all ad copy, alla hooks, alla manusrader.** Subagenten som
skriver copy (regel 6 i CLAUDE.md) ska få den här filen i sin prompt.

---

## Tre-frågorstestet — körs på VARJE rad

Varje headline, hook och punchline testas mot tre frågor:

1. **Kan jag visualisera det?** Konkret slår abstrakt. "Muskulös irländare"
   minns man, "ett bättre sätt" försvinner. Kan raden inte tappas på tån är
   den för abstrakt.
2. **Kan det falsifieras?** Raden ska vara sann eller falsk, inte en åsikt.
   "Han är rolig" är prat. "Han läser på tunnelbanan" är en observation.
3. **Kan ingen annan säga det?** *Never write an ad a competitor can sign.*
   Kan konkurrenten sätta sin logga under raden är den inte klar.

3 nej = skräp, skriv om. 3 ja = något att bygga på.

**I brief-leveranser:** visa testet explicit — tabell med rad × tre frågor,
✅/❌ per cell. En rad med ❌ går inte ut.

---

## Reglerna bakom testet

### Zooma in tills det blir konkret
Skriv det abstrakta ordet överst, fråga "vad menar jag egentligen?" och skriv
om tills det är ett konkret objekt. "Regain fitness" → "från soffan till 5 km"
→ **Couch to 5K**. Samma metod på svenska: "rent på riktigt" → *vad* är rent,
*hur* ser man det?

### Prata inte. Peka.
Sälj inte guld med adjektiv — peka på grafen. För Mastern: peka på gallret,
på fettet, på studien (−34 % smak, Journal of Food Science), på 60 sekunder.
Adjektiv ("fantastisk", "enkel", "smart") är luft; byt varje adjektiv mot
något som går att peka på.

### Fakta först
Bakom varje bra annons ligger ett faktum. Börja med faktumet, bygg raden ur
det. Har vi inget faktum: hämta ett (recension, studie, siffra ur kontot,
material, tid). Hitta aldrig på ett — det är regel 3 i CLAUDE.md.

### Jämför med det kunden redan känner — men aldrig med ett märke
Ny/oklar produkt förklaras genom kända referenser: "ser ut som riktig
takeaway", "rullade som maki". Kortare är bättre; parallellism gör raden
minnesvärd. ⛔ **Referensen är aldrig ett annat märke eller en konkurrents
produkt** (Axels beslut 2026-10-02, val A mellan Evolves hookregel och den
här). "Som [märke], fast …" och "bättre än [märke]" skrivs aldrig; skriv i
stället vad bara vi är: "den enda strumpan som …", "den första …". Skälet
är regel 3 i tre-frågorstestet: en rad som bär konkurrentens namn är en rad
konkurrenten kan skriva under — och den ger tittaren ett annat namn att
googla. Vardagssaker (takeaway-låda, julstrumpa, fika) är fortfarande
tillåtna referenser; de är inga märken. ⚠️ Kursens egen motivering gick
inte att läsa 2026-10-02 (lektionstexten är video, prompten en gissad
Google-flik) — skälet ovan är vårt, inte ett citat.

### Konflikt driver allt
Dra ett streck på mitten, skriv motsatspar. Tre fiendetyper:
**A** — andra angreppssätt (stålborsten vs Mastern), **B** — trosuppfattningar
("du skyller på köttet"), **C** — konkurrenter. Före/efter är den enklaste
konflikten och räcker ofta.

### Små, trovärdiga påståenden slår stora
"Öka konverteringen från 1 % till 2 %" är trovärdigt och fördubblar ändå allt.
"Bli miljonär" är brus. Uppriktighet är en effekt, inte en stil.

### Gör siffran stor genom att byta tidsram
"4 timmar om dagen" är inget; "22 000 timmar under karriären" är en annons.
Räkna om till den ram där siffran blir slående — men den ska förbli sann.

---

## Processregler (för den som bygger briefer/statics)

- **Butikens namn står aldrig i annonsen** (Axels beslut 2026-09-18). Inte
  "Bäverbutiken", inte "CaraShell", inte domänen — varken i copy, i bild, i
  voiceover eller i captions. Annonser speglas mellan butiker
  (`/ops-spegla`), och en rad som säger vilken butik den är kan inte
  återanvändas. Produkten, priset och länken pekar ut butiken; namnet
  tillför inget för kunden. Skriv det som hard rule i varje brief.
- **Returrätten heter "14 dagars ångerrätt enligt lag"** (Axels beslut
  2026-09-20). Aldrig "30 dagars öppet köp", aldrig "nöjd-kund-garanti",
  aldrig ordet garanti ensamt. Löftesgranskningen 2026-09-19 hittade 30 dagar
  på 220 produktsidor, 12 listiclar och i 7 annonspåståenden medan lagen
  och mejlen sa 14 — butiken lovar nu samma sak överallt. Annonser som
  redan är live stängs inte av; nästa version skrivs om.
- **En Mississippi-testet:** budskapet ska landa direkt, inte efter en
  genomläsning. Kunden scrollar förbi — det är tempot som gäller.
- **Vem pratar vi med?** Nulägesattityd → önskad attityd. A och B först,
  sedan raden. Man kan inte starta ett lopp från mitten.
- **Granska i verkligheten:** bedöm en static i feed-kontext (bland andra
  annonser), inte som ensam fil. Skriv copyn i det format den ska leva i —
  det är därför overlay-texten sätts direkt på 4:5-canvasen i `pipeline/`.
- **Skriv om, skriv om:** bra copy är omskriven copy, 20–25 varv är normalt.
  Producera 3–5 versioner av samma rad — feedback på versioner är alltid
  bättre än feedback på en ensam rad. (Detta är subagentens jobb: be alltid
  om flera varianter.)
- **Kaplans lag:** varje ord som inte jobbar för dig jobbar mot dig. Gäller
  ord, meningar och idéer. "Och" på en landningssida är en varningsflagga —
  gör en sak.
- **Korta stycken:** max två rader. Apbarer — lätta att svinga sig mellan.
- **Struktur = skiljelinjer + parallellism.** Dela upp i 2–3 namngivna delar
  med samma form ("throw money and pray" / "learn copywriting").

---

## Ur Evolves prompter (inskrivna 2026-10-02 efter Axels val A)

Sex regler för videomanus som Harry Dry-reglerna ovan inte täcker, ur
Evolve-kursens egna Claude-prompter (`docs/os/evolve/EVOLVE-GAP-ANALYS.md`
avsnitt 7). Gäller varje videobrief; tidsstrukturen står också i
`docs/os/BRIEF-REGI.md`.

1. **Modulärt hooktest:** tre hookar med var sin matchad bridge, men EN
   gemensam hold och EN CTA. Redigeraren klipper tre videor ur en kropp.
2. **Kall trafik i fyra block:** hook 0–3 s, bridge 3–8 s, hold 8–35 s,
   CTA senast 45 s. Holden går invändning → påstående → bevis → nytta.
3. **Hooken är ~5 ord**, max två rader på mobil, begriplig med ljudet av.
4. **Slippery slope:** varje mening slutar i en öppen loop. Läs högt och
   leta stoppunkter — en mening som går att sluta lyssna efter skrivs om.
5. **Måttet pekar på avsnittet före nytt manus:** låg hook ⇒ ny hook/bild,
   låg hold ⇒ enklare mekanism och kortare b-roll, låg konvertering ⇒
   erbjudande eller tro (aldrig "skriv om allt").
6. **Läsnivå årskurs 5–7 för voiceover.** Testet: skulle du säga det vid
   dörren?

Den sjunde regeln (aldrig ett märke som referens) står i avsnittet "Jämför
med det kunden redan känner" ovan. ⛔ Evolves exekveringsmodell "bara b-roll +
AI-röst" tas inte in: Matstrumpors enda breakthrough är en riktig kreatör i
bild.

---

## Så hänger den ihop med resten av repot

| Fil | Roll |
|---|---|
| `docs/copy-regler.md` (denna) | **Hur** en rad skrivs och testas |
| `docs/creative-strategy.md` | Hur en insikt blir ett manus (5 beats) |
| `docs/playbook.md` | Vilka vinklar/hooks som bevisats funka |
| `docs/winning-lines.md` | Rader som redan spenderat pengar bra |
| `products/<id>/dna.md` | Vad som funkar för just den produkten |

Tre-frågorstestet ersätter inte analysmetoden (`docs/os/ANALYSMETOD.md`) —
den dömer annonser på data. Det här dokumentet dömer rader innan de får
kosta pengar.

## Talet läses högt innan det går ut (Axels dom 2026-10-02)

Ett kreatörsmanus är ETT sammanhängande tal, inte en rad påståenden efter
varandra. Axel läste det första manuset till "sushin utan bäst före-datum"
högt — sju vinnarrader hopfogade — och dömde: "Det kanske är ett optimalt
skript enligt research men inte genom att lyssna på." Regeln:

- Skriv talet som ett stycke först, där varje mening leder till nästa
  (bindeord som så, sen, och, men, ju är tillåtna och testas inte).
- Dela upp det per bild EFTERÅT. Aldrig tvärtom: sätt aldrig ihop godkända
  rader till ett manus.
- Läs det högt innan det lämnar sessionen. Hackar en övergång, skriv om.
- Tre-frågorstestet gäller fortfarande varje mening som bär ett påstående.
