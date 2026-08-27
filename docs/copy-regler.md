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

### Jämför med det kunden redan känner
Ny/oklar produkt förklaras genom kända referenser: "Tuffare än en F-150,
snabbare än en 911." Kortare är bättre; parallellism gör raden minnesvärd.

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

- **En Mississippi-testet:** budskapet ska landa direkt, inte efter en
  genomläsning. Kunden scrollar förbi — det är tempot som gäller.
- **Vem pratar vi med?** Nulägesattityd → önskad attityd. A och B först,
  sedan raden. Man kan inte starta ett lopp från mitten.
- **Granska i verkligheten:** bedöm en static i feed-kontext (bland andra
  annonser), inte som ensam fil. Skriv copyn i det format den ska leva i —
  det är därför overlay-texten sätts direkt på 4:5-canvasen i `pipeline/`.

### Alltid tre versioner av bodyn — aldrig en
*(Axels regel, 2026-08-27: "Alltid 2 extra varianter utöver original bodyn.")*

Varje brief som innehåller en body — manus, primärtext, långtext — levereras med
**originalet plus två alternativa versioner**. Varianterna ska skilja sig i
**angreppssätt**, inte i ordval: samma mekanik och samma längd, men olika väg dit
(t.ex. bevisbeatet flyttat, eller användningen före uppackningen). Två
omskrivningar av samma text räknas inte som varianter.

Samma sak gäller hookar: leverera flera som testar olika saker mot varandra, med
en etikett per hook som säger vad just den testar. Annars går det inte att läsa
av vad som vann.

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
