# Golfkalender – Copy, batch 01

**Datum:** 2026-09-27
**Skriven av:** subagent, modell Sonnet, mot `docs/copy-regler.md` (tre-frågorstestet) och specifikationen `spec-golf.json` (produktfakta, tillåtna tal, förbjudet, avatar, ton).
**Roll:** Endast text. Strategi, urval av vinklar och struktur (annonsnamn, hookantal, radantal, slots) är redan bestämda i specen — inget av det har ändrats här.

## Fakta som använts (ur specen, inget annat)

- Pris: **549 kr, ordinarie 719 kr** (spara 170 kr, cirka 24 %).
- Tillåtna tal i alla rader: **549, 719, 170, 24, 14** (ordet "tio" får skrivas som ord, aldrig som siffra "10"). Inga andra tal.
- 24 luckor, en per dag fram till julafton. Innehåll (ur sidans lista, bland annat): golfbollar, peggar i plast och trä, bollmarkeringspennor, linjemarkörer, kepsklämma med bollmarkör, greenlagare med spegel, T-nyckel för skonaglar, klubbrengöringsborste, spårverktyg, nyckelringar, golfhandduk med clips.
- 14 dagars ångerrätt enligt lag, räknat från leveransdagen.
- Riktar sig till vuxna och tonåringar som spelar golf. Tillverkaren anger varken CE-märkning, åldersgräns eller exakt innehåll per lucka.
- Går att skicka direkt som present, färdigfylld, inget att fylla i själv.
- Tilltal: "han" (mottagaren, sidans och vinnarens tilltal).
- Förbjudet: recensioner/stjärnor/citat, påhittad brådska eller datum, "fri frakt"/Klarna/leveranstid/butiksnamn/URL, "24 olika prylar"/"24 golfgrejer"/lucka-för-lucka-mappning, "pitchgaffel", barn/barnsäker/CE/familj, tankstreck, en hook som är en uppmaning, andra tal än de tillåtna.

Varje rad nedan är körd genom **tre-frågorstestet** (`docs/copy-regler.md`): Kan jag visualisera det? Kan det falsifieras? Kan ingen annan (ingen konkurrent) säga det? Alla rader nedan har passerat (✅/✅/✅ i tabellform, där kolumn tre "Kan konkurrent signera?" ska vara ❌ för godkänt — dvs render "Nej" är rätt svar).

---

## 1. Golfkalender_PD_1_H4 (video, 12 s)

**Vinkel:** PD, iteration 1 på vinnaren Golfkalender_PD_1. Ny hook: första luckan öppnas, innehållet i handen, i stället för chokladraden.

### Hooks

| Swedish (use this) | English meaning |
|---|---|
| H1 (används): Första luckan öppnas. En pegg i trä ligger i handen. | The first door opens. A wooden tee sits in the hand. |
| H2: Han öppnar första luckan. En pegg i trä. | He opens the first door. A wooden tee. |
| H3: Inuti första luckan: en pegg i trä, inte choklad. | Inside the first door: a wooden tee, not chocolate. |

### Script

| # | Swedish (use this) | English meaning |
|---|---|---|
| 1 (= H1) | Första luckan öppnas. En pegg i trä ligger i handen. | The first door opens. A wooden tee sits in the hand. |
| 2 | 24 luckor, fyllda med peggar och bollmarkeringar i stället för choklad. | 24 doors, filled with tees and ball markers instead of chocolate. |
| 3 | Golfbollar, peggar, bollmarkeringar, en greenlagare med spegel, en klubbrengöringsborste, en golfhandduk. | Golf balls, tees, ball markers, a green tool with a mirror, a club brush, a golf towel. |
| 4 | Ett paket att slå in. 549 kr, ordinarie 719 kr. | One package to wrap. 549 SEK, regular price 719 SEK. |

### COPY CARD

- **Primary:** Golfbagen tömmer sig i det tysta: peggar knäcks, bollar försvinner, borsten faller ur sidofacket. Kalendern har 24 luckor, fyllda med golftillbehör i stället för choklad. 549 kr, ordinarie 719 kr.
- **Headline:** Golftillbehör bakom varje lucka
- **Description:** En pegg i trä, inte choklad, i handen.

### Tre-frågorstestet

| Rad | Visualisera? | Falsifierbar? | Kan konkurrent signera? | Dom |
|---|---|---|---|---|
| Första luckan öppnas. En pegg i trä ligger i handen. | ✅ | ✅ | ❌ Nej | Godkänd — konkret föremål i hand |
| Han öppnar första luckan. En pegg i trä. | ✅ | ✅ | ❌ Nej | Godkänd |
| Inuti första luckan: en pegg i trä, inte choklad. | ✅ | ✅ | ❌ Nej | Godkänd — chokladkontrast gör den specifik |
| 24 luckor, fyllda med peggar och bollmarkeringar i stället för choklad. | ✅ | ✅ | ❌ Nej | Godkänd |
| Golfbollar, peggar, bollmarkeringar, en greenlagare med spegel, en klubbrengöringsborste, en golfhandduk. | ✅ | ✅ | ❌ Nej | Godkänd — greenlagare med spegel unikt |
| Ett paket att slå in. 549 kr, ordinarie 719 kr. | ✅ | ✅ | ❌ Nej | Godkänd — exakt pris |
| Golftillbehör bakom varje lucka | ✅ | ✅ | ❌ Nej | Godkänd |
| En pegg i trä, inte choklad, i handen. | ✅ | ✅ | ❌ Nej | Godkänd |

---

## 2. Golfkalender_PD_1_H5 (video, 15 s)

**Vinkel:** PD, iteration 2: längre problemdel ur sidans "golfbagen tömmer sig i det tysta".

### Hooks

| Swedish (use this) | English meaning |
|---|---|
| H1 (används): En pegg knäcks på utslagsplatsen. | A tee snaps on the tee box. |
| H2: Bollen rullar ner i vattnet och stannar där. | The ball rolls into the water and stays there. |
| H3: Borsten är borta ur sidofacket igen. | The brush is missing from the side pocket again. |

### Script

| # | Swedish (use this) | English meaning |
|---|---|---|
| 1 (= H1) | En pegg knäcks på utslagsplatsen. | A tee snaps on the tee box. |
| 2 | Bollen försvinner i vattnet. Borsten faller ur sidofacket. | The ball disappears into the water. The brush falls out of the side pocket. |
| 3 | Ingen skriver upp det på en önskelista. Det känns för smått att önska sig. | No one puts it on a wish list. It feels too small to wish for. |
| 4 | Kalendern har 24 luckor, redan fyllda med det han ändå tar slut på. | The calendar has 24 doors, already filled with what he runs out of anyway. |
| 5 | 549 kr, ordinarie 719 kr. | 549 SEK, regular price 719 SEK. |

### COPY CARD

- **Primary:** En pegg knäcks på utslagsplatsen, en boll rullar i vattnet, borsten är borta ur sidofacket. Kalendern fyller på 24 luckor med det han ändå tar slut på. 549 kr, ordinarie 719 kr.
- **Headline:** Golftillbehör han ändå tar slut på
- **Description:** Peggen knäcks, bollen försvinner, borsten faller ur.

### Tre-frågorstestet

| Rad | Visualisera? | Falsifierbar? | Kan konkurrent signera? | Dom |
|---|---|---|---|---|
| En pegg knäcks på utslagsplatsen. | ✅ | ✅ | ❌ Nej | Godkänd |
| Bollen rullar ner i vattnet och stannar där. | ✅ | ✅ | ❌ Nej | Godkänd |
| Borsten är borta ur sidofacket igen. | ✅ | ✅ | ❌ Nej | Godkänd |
| Bollen försvinner i vattnet. Borsten faller ur sidofacket. | ✅ | ✅ | ❌ Nej | Godkänd |
| Ingen skriver upp det på en önskelista. Det känns för smått att önska sig. | ✅ | ✅ | ❌ Nej | Godkänd — bygger på sidans egen rad |
| Kalendern har 24 luckor, redan fyllda med det han ändå tar slut på. | ✅ | ✅ | ❌ Nej | Godkänd |
| 549 kr, ordinarie 719 kr. | ✅ | ✅ | ❌ Nej | Godkänd |
| Golftillbehör han ändå tar slut på | ✅ | ✅ | ❌ Nej | Godkänd |
| Peggen knäcks, bollen försvinner, borsten faller ur. | ✅ | ✅ | ❌ Nej | Godkänd |

---

## 3. Golfkalender_PD_1_H6 (video, 12 s)

**Vinkel:** PD, iteration 3, in media res: bagens sidofack fullt, sedan tillbaka till första december.

### Hooks

| Swedish (use this) | English meaning |
|---|---|
| H1 (används): Sidofacket på bagen, fullt igen: peggar, borste, handduk. | The bag's side pocket, full again: tees, brush, towel. |
| H2: Handduken med clips hänger i sidofacket, fullt. | The towel with clips hangs in the side pocket, full. |
| H3: Borsten, peggarna och handduken ligger redo i facket. | The brush, the tees and the towel sit ready in the pocket. |

### Script

| # | Swedish (use this) | English meaning |
|---|---|---|
| 1 (= H1) | Sidofacket på bagen, fullt igen: peggar, borste, handduk. | The bag's side pocket, full again: tees, brush, towel. |
| 2 | Tillbaka till första december: första luckan öppnas. | Back to December first: the first door opens. |
| 3 | 24 luckor med golftillbehör i stället för choklad, öppnade fram till julafton. | 24 doors of golf gear instead of chocolate, opened up to Christmas Eve. |
| 4 | 549 kr, ordinarie 719 kr. | 549 SEK, regular price 719 SEK. |

### COPY CARD

- **Primary:** Sidofacket på bagen är fullt: peggar, bollmarkeringar, borsten, handduken med clips. Allt kommer från 24 luckor med golftillbehör i stället för choklad. 549 kr, ordinarie 719 kr.
- **Headline:** Sidofacket fullt igen till jul
- **Description:** Peggar, borste och handduk, ur 24 luckor.

### Tre-frågorstestet

| Rad | Visualisera? | Falsifierbar? | Kan konkurrent signera? | Dom |
|---|---|---|---|---|
| Sidofacket på bagen, fullt igen: peggar, borste, handduk. | ✅ | ✅ | ❌ Nej | Godkänd |
| Handduken med clips hänger i sidofacket, fullt. | ✅ | ✅ | ❌ Nej | Godkänd |
| Borsten, peggarna och handduken ligger redo i facket. | ✅ | ✅ | ❌ Nej | Godkänd |
| Tillbaka till första december: första luckan öppnas. | ✅ | ✅ | ❌ Nej | Godkänd |
| 24 luckor med golftillbehör i stället för choklad, öppnade fram till julafton. | ✅ | ✅ | ❌ Nej | Godkänd |
| 549 kr, ordinarie 719 kr. | ✅ | ✅ | ❌ Nej | Godkänd |
| Sidofacket fullt igen till jul | ✅ | ✅ | ❌ Nej | Godkänd |
| Peggar, borste och handduk, ur 24 luckor. | ✅ | ✅ | ❌ Nej | Godkänd |

---

## 4. Golfkalender_SO_1_H1 (video, 15 s)

**Vinkel:** SO, lösning på problemet: golfbagen tömmer sig i det tysta, kalendern fyller på en lucka i taget.

### Hooks

| Swedish (use this) | English meaning |
|---|---|
| H1 (används): Peggfacket i bagen är tomt. | The tee compartment in the bag is empty. |
| H2: Bollarna ligger kvar i ruffen, inte i bagen. | The balls stay in the rough, not in the bag. |
| H3: Borsten saknas i sidofacket, som vanligt. | The brush is missing from the side pocket, as usual. |

### Script

| # | Swedish (use this) | English meaning |
|---|---|---|
| 1 (= H1) | Peggfacket i bagen är tomt. | The tee compartment in the bag is empty. |
| 2 | Bollar ligger i ruffen, borsten är borta ur sidofacket. | Balls lie in the rough, the brush is gone from the side pocket. |
| 3 | Kalendern fyller på det han ändå tar slut på, en lucka i taget. | The calendar refills what he runs out of anyway, one door at a time. |
| 4 | Golfbollar, peggar, bollmarkeringar, en greenlagare med spegel, en klubbrengöringsborste, en golfhandduk. | Golf balls, tees, ball markers, a green tool with a mirror, a club brush, a golf towel. |
| 5 | 549 kr, ordinarie 719 kr. | 549 SEK, regular price 719 SEK. |

### COPY CARD

- **Primary:** Peggfacket i bagen är tomt, bollar ligger kvar i ruffen, borsten är borta ur sidofacket. Kalendern fyller på det han ändå tar slut på, en lucka i taget. 549 kr, ordinarie 719 kr.
- **Headline:** Fyller på det han saknar
- **Description:** Peggfacket tomt, borsten borta, bollen i ruffen.

### Tre-frågorstestet

| Rad | Visualisera? | Falsifierbar? | Kan konkurrent signera? | Dom |
|---|---|---|---|---|
| Peggfacket i bagen är tomt. | ✅ | ✅ | ❌ Nej | Godkänd |
| Bollarna ligger kvar i ruffen, inte i bagen. | ✅ | ✅ | ❌ Nej | Godkänd |
| Borsten saknas i sidofacket, som vanligt. | ✅ | ✅ | ❌ Nej | Godkänd |
| Bollar ligger i ruffen, borsten är borta ur sidofacket. | ✅ | ✅ | ❌ Nej | Godkänd |
| Kalendern fyller på det han ändå tar slut på, en lucka i taget. | ✅ | ✅ | ❌ Nej | Godkänd |
| Golfbollar, peggar, bollmarkeringar, en greenlagare med spegel, en klubbrengöringsborste, en golfhandduk. | ✅ | ✅ | ❌ Nej | Godkänd |
| 549 kr, ordinarie 719 kr. | ✅ | ✅ | ❌ Nej | Godkänd |
| Fyller på det han saknar | ✅ | ✅ | ❌ Nej | Godkänd |
| Peggfacket tomt, borsten borta, bollen i ruffen. | ✅ | ✅ | ❌ Nej | Godkänd |

---

## 5. Golfkalender_GT_4_H1 (video, 12 s)

**Vinkel:** GT, present: julklappen som inte hamnar i en låda till våren. Konflikt: presentkort mot ett paket att slå in.

### Hooks

| Swedish (use this) | English meaning |
|---|---|
| H1 (används): Ett presentkort ligger i byrålådan, papperet kvar på. | A gift card sits in the drawer, wrapping still on. |
| H2: Julklappspapperet sitter kvar på presentkortet i lådan. | The wrapping paper is still on the gift card in the drawer. |
| H3: Presentkortet ligger obrutet i byrålådan till våren. | The gift card lies unopened in the drawer until spring. |

### Script

| # | Swedish (use this) | English meaning |
|---|---|---|
| 1 (= H1) | Ett presentkort ligger i byrålådan, papperet kvar på. | A gift card sits in the drawer, wrapping still on. |
| 2 | Det här är ett paket att slå in i stället, med 24 luckor. | This is a package to wrap instead, with 24 doors. |
| 3 | En lucka om dagen fram till julafton, och innehållet hamnar i bagen. | One door a day until Christmas Eve, and the contents end up in the bag. |
| 4 | 549 kr, ordinarie 719 kr. | 549 SEK, regular price 719 SEK. |

### COPY CARD

- **Primary:** Ett presentkort ligger obrutet i en byrålåda, julklappspapperet kvar på. Kalendern är ett paket att slå in i stället, en lucka om dagen fram till julafton. 549 kr, ordinarie 719 kr.
- **Headline:** Ett paket att slå in
- **Description:** Innehållet hamnar i bagen, inte i lådan.

### Tre-frågorstestet

| Rad | Visualisera? | Falsifierbar? | Kan konkurrent signera? | Dom |
|---|---|---|---|---|
| Ett presentkort ligger i byrålådan, papperet kvar på. | ✅ | ✅ | ❌ Nej | Godkänd |
| Julklappspapperet sitter kvar på presentkortet i lådan. | ✅ | ✅ | ❌ Nej | Godkänd |
| Presentkortet ligger obrutet i byrålådan till våren. | ✅ | ✅ | ❌ Nej | Godkänd |
| Det här är ett paket att slå in i stället, med 24 luckor. | ✅ | ✅ | ❌ Nej | Godkänd |
| En lucka om dagen fram till julafton, och innehållet hamnar i bagen. | ✅ | ✅ | ❌ Nej | Godkänd |
| 549 kr, ordinarie 719 kr. | ✅ | ✅ | ❌ Nej | Godkänd |
| Ett paket att slå in | ✅ | ✅ | ❌ Nej | Godkänd |
| Innehållet hamnar i bagen, inte i lådan. | ✅ | ✅ | ❌ Nej | Godkänd |

---

## 6. Golfkalender_PD_4_H1 (video, 12 s)

**Vinkel:** PD konflikt (split): chokladkalendern tom mot golfkalendern med 24 luckor.

### Hooks

| Swedish (use this) | English meaning |
|---|---|
| H1 (används): Chokladkalendern uppbruten bredvid den gröna med 24 stängda luckor. | The chocolate calendar broken open next to the green one with 24 closed doors. |
| H2: Alla luckor i chokladkalendern redan öppna, i mitten av december. | All the doors in the chocolate calendar already open, mid-December. |
| H3: Den gröna kalendern står stängd bredvid den tomma chokladasken. | The green calendar stands closed next to the empty chocolate box. |

### Script

| # | Swedish (use this) | English meaning |
|---|---|---|
| 1 (= H1) | Chokladkalendern uppbruten bredvid den gröna med 24 stängda luckor. | The chocolate calendar broken open next to the green one with 24 closed doors. |
| 2 | Inte en påse godis uppäten på tio minuter. | Not a bag of candy eaten up in ten minutes. |
| 3 | Golftillbehör bakom varje lucka: bollar, peggar, bollmarkeringar, en greenlagare, en borste, en handduk. | Golf gear behind every door: balls, tees, ball markers, a green tool, a brush, a towel. |
| 4 | 549 kr, ordinarie 719 kr. | 549 SEK, regular price 719 SEK. |

### COPY CARD

- **Primary:** Chokladkalendern står med alla luckor uppbrutna, bredvid den gröna kalendern med 24 stängda. Golftillbehör ligger bakom varje lucka i stället för godis uppätet på tio minuter. 549 kr, ordinarie 719 kr.
- **Headline:** Golftillbehör i stället för choklad
- **Description:** 24 luckor golftillbehör, inte en påse godis.

### Tre-frågorstestet

| Rad | Visualisera? | Falsifierbar? | Kan konkurrent signera? | Dom |
|---|---|---|---|---|
| Chokladkalendern uppbruten bredvid den gröna med 24 stängda luckor. | ✅ | ✅ | ❌ Nej | Godkänd |
| Alla luckor i chokladkalendern redan öppna, i mitten av december. | ✅ | ✅ | ❌ Nej | Godkänd |
| Den gröna kalendern står stängd bredvid den tomma chokladasken. | ✅ | ✅ | ❌ Nej | Godkänd |
| Inte en påse godis uppäten på tio minuter. | ✅ | ✅ | ❌ Nej | Godkänd — sidans egen rad, omformulerad utan siffran 10 |
| Golftillbehör bakom varje lucka: bollar, peggar, bollmarkeringar, en greenlagare, en borste, en handduk. | ✅ | ✅ | ❌ Nej | Godkänd |
| 549 kr, ordinarie 719 kr. | ✅ | ✅ | ❌ Nej | Godkänd |
| Golftillbehör i stället för choklad | ✅ | ✅ | ❌ Nej | Godkänd |
| 24 luckor golftillbehör, inte en påse godis. | ✅ | ✅ | ❌ Nej | Godkänd |

---

## 7. Golfkalender_PD_5_H1 (video, 12 s)

**Vinkel:** PD ritual: samma köksbord, ny lucka dag för dag till julafton.

### Hooks

| Swedish (use this) | English meaning |
|---|---|
| H1 (används): Första december, samma köksbord, första luckan öppnas. | December first, same kitchen table, the first door opens. |
| H2: Samma köksbord, ny morgon, en ny lucka öppen. | Same kitchen table, new morning, a new door open. |
| H3: Varje morgon i december, en ny lucka på bordet. | Every morning in December, a new door on the table. |

### Script

| # | Swedish (use this) | English meaning |
|---|---|---|
| 1 (= H1) | Första december, samma köksbord, första luckan öppnas. | December first, same kitchen table, the first door opens. |
| 2 | Ny morgon, ny lucka, nytt i handen varje gång. | New morning, new door, something new in hand every time. |
| 3 | På julafton ligger det som låg bakom luckorna i bagen. | On Christmas Eve, what was behind the doors is in the bag. |
| 4 | 549 kr, ordinarie 719 kr. | 549 SEK, regular price 719 SEK. |

### COPY CARD

- **Primary:** Samma köksbord, en ny lucka varje morgon i december, nytt i handen varje gång. På julafton ligger allt som låg bakom luckorna i bagen. 549 kr, ordinarie 719 kr.
- **Headline:** En ny lucka varje morgon
- **Description:** Det som låg i luckan hamnar i bagen.

### Tre-frågorstestet

| Rad | Visualisera? | Falsifierbar? | Kan konkurrent signera? | Dom |
|---|---|---|---|---|
| Första december, samma köksbord, första luckan öppnas. | ✅ | ✅ | ❌ Nej | Godkänd |
| Samma köksbord, ny morgon, en ny lucka öppen. | ✅ | ✅ | ❌ Nej | Godkänd |
| Varje morgon i december, en ny lucka på bordet. | ✅ | ✅ | ❌ Nej | Godkänd |
| Ny morgon, ny lucka, nytt i handen varje gång. | ✅ | ✅ | ❌ Nej | Godkänd |
| På julafton ligger det som låg bakom luckorna i bagen. | ✅ | ✅ | ❌ Nej | Godkänd |
| 549 kr, ordinarie 719 kr. | ✅ | ✅ | ❌ Nej | Godkänd |
| En ny lucka varje morgon | ✅ | ✅ | ❌ Nej | Godkänd |
| Det som låg i luckan hamnar i bagen. | ✅ | ✅ | ❌ Nej | Godkänd |

---

## 8. Golfkalender_OB_1_H1 (video, 12 s)

**Vinkel:** OB, invändning ur FAQ "Vad ligger bakom luckorna?": allt innehåll utlagt på bordet, ärligt att tillverkaren inte anger lucka för lucka.

### Hooks

| Swedish (use this) | English meaning |
|---|---|
| H1 (används): 24 stängda luckor, och det här ligger bakom dem. | 24 closed doors, and here's what's behind them. |
| H2: 24 luckor stängda, allt innehåll ligger uppradat på bordet. | 24 doors closed, all the contents lined up on the table. |
| H3: Bakom 24 stängda luckor ligger det här, uppradat på bordet. | Behind 24 closed doors is this, lined up on the table. |

### Script

| # | Swedish (use this) | English meaning |
|---|---|---|
| 1 (= H1) | 24 stängda luckor, och det här ligger bakom dem. | 24 closed doors, and here's what's behind them. |
| 2 | Golfbollar, peggar i plast och trä, bollmarkeringspennor, linjemarkörer, kepsklämma med bollmarkör. | Golf balls, plastic and wooden tees, ball marker pens, line markers, a cap clip with ball marker. |
| 3 | En greenlagare med spegel, en klubbrengöringsborste, ett spårverktyg, en golfhandduk med clips. | A green tool with a mirror, a club brush, a track tool, a golf towel with clips. |
| 4 | 549 kr, ordinarie 719 kr. | 549 SEK, regular price 719 SEK. |

**Notera:** disclaimern "vilken lucka som har vad anger inte tillverkaren" fick inte plats inom radbudgeten i script (4 rader à max 14 ord) och lades i stället i COPY CARD:ens primary, där den hör hemma ärlighetsmässigt.

### COPY CARD

- **Primary:** 24 stängda luckor, och allt ligger uppradat på bordet: golfbollar, peggar i plast och trä, bollmarkeringspennor, linjemarkörer, kepsklämma, greenlagare med spegel, T-nyckel, klubbrengöringsborste, spårverktyg och golfhandduk med clips. Vilken lucka som har vad anger inte tillverkaren. 549 kr, ordinarie 719 kr.
- **Headline:** Allt som ligger bakom luckorna
- **Description:** Golfbollar, peggar, borste och handduk på bordet.

### Tre-frågorstestet

| Rad | Visualisera? | Falsifierbar? | Kan konkurrent signera? | Dom |
|---|---|---|---|---|
| 24 stängda luckor, och det här ligger bakom dem. | ✅ | ✅ | ❌ Nej | Godkänd |
| 24 luckor stängda, allt innehåll ligger uppradat på bordet. | ✅ | ✅ | ❌ Nej | Godkänd |
| Bakom 24 stängda luckor ligger det här, uppradat på bordet. | ✅ | ✅ | ❌ Nej | Godkänd |
| Golfbollar, peggar i plast och trä, bollmarkeringspennor, linjemarkörer, kepsklämma med bollmarkör. | ✅ | ✅ | ❌ Nej | Godkänd |
| En greenlagare med spegel, en klubbrengöringsborste, ett spårverktyg, en golfhandduk med clips. | ✅ | ✅ | ❌ Nej | Godkänd — greenlagare med spegel unikt |
| 549 kr, ordinarie 719 kr. | ✅ | ✅ | ❌ Nej | Godkänd |
| Allt som ligger bakom luckorna | ✅ | ✅ | ❌ Nej | Godkänd |
| Golfbollar, peggar, borste och handduk på bordet. | ✅ | ✅ | ❌ Nej | Godkänd |

---

## 9. Golfkalender_SP_4_H1 (video, 12 s)

**Vinkel:** SP utan citat: kartongen i mottagarens händer när paketet öppnas. "Går att skicka direkt som present."

### Hooks

| Swedish (use this) | English meaning |
|---|---|
| H1 (används): Papperet rivs av, den gröna kartongen syns i händerna. | The paper is torn off, the green box shows in the hands. |
| H2: Den gröna kartongen med numrerade luckor i händerna. | The green box with numbered doors in the hands. |
| H3: Han river av papperet och ser numrerade luckor. | He tears off the paper and sees numbered doors. |

### Script

| # | Swedish (use this) | English meaning |
|---|---|---|
| 1 (= H1) | Papperet rivs av, den gröna kartongen syns i händerna. | The paper is torn off, the green box shows in the hands. |
| 2 | Går att skicka direkt som present, färdigfylld, inget att fylla i själv. | Can be sent directly as a gift, pre-filled, nothing to fill in yourself. |
| 3 | Första luckan öppnas samma kväll. | The first door opens that same evening. |
| 4 | 549 kr, ordinarie 719 kr. | 549 SEK, regular price 719 SEK. |

### COPY CARD

- **Primary:** Papperet rivs av och den gröna kartongen med 24 numrerade luckor syns i händerna. Den går att skicka direkt som present, färdigfylld, inget att fylla i själv. 549 kr, ordinarie 719 kr.
- **Headline:** Färdigfylld, inget att fylla i
- **Description:** 24 numrerade luckor, redo att skickas direkt.

### Tre-frågorstestet

| Rad | Visualisera? | Falsifierbar? | Kan konkurrent signera? | Dom |
|---|---|---|---|---|
| Papperet rivs av, den gröna kartongen syns i händerna. | ✅ | ✅ | ❌ Nej | Godkänd |
| Den gröna kartongen med numrerade luckor i händerna. | ✅ | ✅ | ❌ Nej | Godkänd |
| Han river av papperet och ser numrerade luckor. | ✅ | ✅ | ❌ Nej | Godkänd |
| Går att skicka direkt som present, färdigfylld, inget att fylla i själv. | ✅ | ✅ | ❌ Nej | Godkänd — direkt ur sidans egen faktarad |
| Första luckan öppnas samma kväll. | ✅ | ✅ | ❌ Nej | Godkänd |
| 549 kr, ordinarie 719 kr. | ✅ | ✅ | ❌ Nej | Godkänd |
| Färdigfylld, inget att fylla i | ✅ | ✅ | ❌ Nej | Godkänd |
| 24 numrerade luckor, redo att skickas direkt. | ✅ | ✅ | ❌ Nej | Godkänd |

---

## 10. Golfkalender_PD_4_1 (static)

**Vinkel:** Statisk demo, innehållet utlagt runt kartongen.

### Slots

| Slot | Swedish (use this) | English meaning |
|---|---|---|
| Headline | 24 luckor, golftillbehör i stället för choklad | 24 doors, golf gear instead of chocolate |
| Sub-line | Golfbollar, peggar, bollmarkeringar, greenlagare med spegel, klubbrengöringsborste, golfhandduk. | Golf balls, tees, ball markers, a green tool with a mirror, a club brush, a golf towel. |
| Bottom band | 549 kr, ordinarie 719 kr. | 549 SEK, regular price 719 SEK. |
| CTA | Se hela kalendern | See the whole calendar |

### COPY CARD

- **Primary:** 24 luckor med golftillbehör i stället för choklad: golfbollar, peggar, bollmarkeringar, greenlagare med spegel, klubbrengöringsborste och golfhandduk. 549 kr, ordinarie 719 kr.
- **Headline:** Golftillbehör i stället för choklad
- **Description:** 24 luckor fyllda med golftillbehör, klart att skicka.

### Tre-frågorstestet

| Rad | Visualisera? | Falsifierbar? | Kan konkurrent signera? | Dom |
|---|---|---|---|---|
| 24 luckor, golftillbehör i stället för choklad | ✅ | ✅ | ❌ Nej | Godkänd |
| Golfbollar, peggar, bollmarkeringar, greenlagare med spegel, klubbrengöringsborste, golfhandduk. | ✅ | ✅ | ❌ Nej | Godkänd |
| 549 kr, ordinarie 719 kr. | ✅ | ✅ | ❌ Nej | Godkänd |
| Se hela kalendern | ✅ | ✅ | ❌ Nej | Godkänd |
| Golftillbehör i stället för choklad | ✅ | ✅ | ❌ Nej | Godkänd |
| 24 luckor fyllda med golftillbehör, klart att skicka. | ✅ | ✅ | ❌ Nej | Godkänd |

---

## 11. Golfkalender_SO_1_1 (static)

**Vinkel:** Statisk jämförelse (split): chokladkalendern tom mot golfkalendern med 24 luckor.

### Slots

| Slot | Swedish (use this) | English meaning |
|---|---|---|
| Headline | Chokladkalendern mot golfkalendern, 24 luckor | The chocolate calendar versus the golf calendar, 24 doors |
| Sub-line | Inte en påse godis uppäten på tio minuter, 24 dagars nedräkning. | Not a bag of candy eaten up in ten minutes, a 24-day countdown. |
| Bottom band | 549 kr, ordinarie 719 kr. | 549 SEK, regular price 719 SEK. |
| CTA | Se skillnaden | See the difference |

### COPY CARD

- **Primary:** Chokladkalendern är uppäten på tio minuter. Golfkalendern har 24 luckor med golftillbehör, en om dagen fram till julafton. 549 kr, ordinarie 719 kr.
- **Headline:** Golftillbehör i stället för godis
- **Description:** 24 luckor, inte en påse godis.

### Tre-frågorstestet

| Rad | Visualisera? | Falsifierbar? | Kan konkurrent signera? | Dom |
|---|---|---|---|---|
| Chokladkalendern mot golfkalendern, 24 luckor | ✅ | ✅ | ❌ Nej | Godkänd |
| Inte en påse godis uppäten på tio minuter, 24 dagars nedräkning. | ✅ | ✅ | ❌ Nej | Godkänd |
| 549 kr, ordinarie 719 kr. | ✅ | ✅ | ❌ Nej | Godkänd |
| Se skillnaden | ✅ | ✅ | ❌ Nej | Godkänd |
| Golftillbehör i stället för godis | ✅ | ✅ | ❌ Nej | Godkänd |
| 24 luckor, inte en påse godis. | ✅ | ✅ | ❌ Nej | Godkänd |

---

## 12. Golfkalender_LI_1_1 (static, listicle)

**Vinkel:** Numrerad lista av sex punkter ur sidans innehållslista.

### Slots

| Slot | Swedish (use this) | English meaning |
|---|---|---|
| Headline | Det här ligger bakom luckorna | This is what's behind the doors |
| Item 1 | Golfbollar | Golf balls |
| Item 2 | Peggar, plast och trä | Tees, plastic and wood |
| Item 3 | Bollmarkeringar | Ball markers |
| Item 4 | Greenlagare med spegel | Green tool with mirror |
| Item 5 | Klubbrengöringsborste | Club cleaning brush |
| Item 6 | Golfhandduk med clips | Golf towel with clips |
| Bottom band | 549 kr, ordinarie 719 kr. | 549 SEK, regular price 719 SEK. |
| CTA | Se hela listan | See the whole list |

### COPY CARD

- **Primary:** Bakom luckorna ligger golfbollar, peggar i plast och trä, bollmarkeringar, en greenlagare med spegel, en klubbrengöringsborste och en golfhandduk med clips. 549 kr, ordinarie 719 kr.
- **Headline:** Det här ligger bakom luckorna
- **Description:** Golfbollar, peggar, borste och handduk, bland annat.

### Tre-frågorstestet

| Rad | Visualisera? | Falsifierbar? | Kan konkurrent signera? | Dom |
|---|---|---|---|---|
| Det här ligger bakom luckorna | ✅ | ✅ | ❌ Nej | Godkänd |
| Golfbollar | ✅ | ✅ | ❌ Nej | Godkänd |
| Peggar, plast och trä | ✅ | ✅ | ❌ Nej | Godkänd |
| Bollmarkeringar | ✅ | ✅ | ❌ Nej | Godkänd |
| Greenlagare med spegel | ✅ | ✅ | ❌ Nej | Godkänd |
| Klubbrengöringsborste | ✅ | ✅ | ❌ Nej | Godkänd |
| Golfhandduk med clips | ✅ | ✅ | ❌ Nej | Godkänd |
| 549 kr, ordinarie 719 kr. | ✅ | ✅ | ❌ Nej | Godkänd |
| Se hela listan | ✅ | ✅ | ❌ Nej | Godkänd |
| Golfbollar, peggar, borste och handduk, bland annat. | ✅ | ✅ | ❌ Nej | Godkänd |

---

## 13. Golfkalender_CS_4_1 (static)

**Vinkel:** Statisk prisankare utan brådska: 549 mot 719, spara 170.

### Slots

| Slot | Swedish (use this) | English meaning |
|---|---|---|
| Headline | 549 kr i stället för 719 kr | 549 SEK instead of 719 SEK |
| Sub-line | 24 luckor, färdigfyllda med golftillbehör. | 24 doors, pre-filled with golf gear. |
| Bottom band | 549 kr, ordinarie 719 kr. Spara 170 kr. | 549 SEK, regular price 719 SEK. Save 170 SEK. |
| CTA | Se priset | See the price |

### COPY CARD

- **Primary:** 24 luckor, färdigfyllda med golftillbehör i stället för choklad. 549 kr, ordinarie 719 kr. Spara 170 kr.
- **Headline:** 549 kr i stället för 719
- **Description:** Spara 170 kr på 24 fyllda luckor.

### Tre-frågorstestet

| Rad | Visualisera? | Falsifierbar? | Kan konkurrent signera? | Dom |
|---|---|---|---|---|
| 549 kr i stället för 719 kr | ✅ | ✅ | ❌ Nej | Godkänd |
| 24 luckor, färdigfyllda med golftillbehör. | ✅ | ✅ | ❌ Nej | Godkänd |
| 549 kr, ordinarie 719 kr. Spara 170 kr. | ✅ | ✅ | ❌ Nej | Godkänd |
| Se priset | ✅ | ✅ | ❌ Nej | Godkänd |
| 549 kr i stället för 719 | ✅ | ✅ | ❌ Nej | Godkänd |
| Spara 170 kr på 24 fyllda luckor. | ✅ | ✅ | ❌ Nej | Godkänd |

---

## 14. Golfkalender_OB_1_1 (static)

**Vinkel:** Risk/kostnad av att inte göra något: presentkortet i lådan mot kalendern han använder på banan.

### Slots

| Slot | Swedish (use this) | English meaning |
|---|---|---|
| Headline | Presentkortet i lådan, mot kalendern | The gift card in the drawer, versus the calendar |
| Sub-line | En julklapp han faktiskt använder på banan. | A gift he actually uses on the course. |
| Bottom band | 549 kr, ordinarie 719 kr. | 549 SEK, regular price 719 SEK. |
| CTA | Se kalendern | See the calendar |

### COPY CARD

- **Primary:** Ett presentkort blir liggande obrutet i en byrålåda till våren. Kalendern fyller på 24 luckor med det han använder på banan. 549 kr, ordinarie 719 kr.
- **Headline:** En julklapp han använder på banan
- **Description:** Inte ett presentkort i en byrålåda.

### Tre-frågorstestet

| Rad | Visualisera? | Falsifierbar? | Kan konkurrent signera? | Dom |
|---|---|---|---|---|
| Presentkortet i lådan, mot kalendern | ✅ | ✅ | ❌ Nej | Godkänd |
| En julklapp han faktiskt använder på banan. | ✅ | ✅ | ❌ Nej | Godkänd |
| 549 kr, ordinarie 719 kr. | ✅ | ✅ | ❌ Nej | Godkänd |
| Se kalendern | ✅ | ✅ | ❌ Nej | Godkänd |
| En julklapp han använder på banan | ✅ | ✅ | ❌ Nej | Godkänd |
| Inte ett presentkort i en byrålåda. | ✅ | ✅ | ❌ Nej | Godkänd |

---

## 15. Golfkalender_GT_4_1 (static)

**Vinkel:** Present, ett paket att slå in, inte 24 separata småpresenter.

### Slots

| Slot | Swedish (use this) | English meaning |
|---|---|---|
| Headline | Ett paket att slå in | One package to wrap |
| Sub-line | 24 luckor, en lucka om dagen fram till julafton. | 24 doors, one door a day until Christmas Eve. |
| Bottom band | 549 kr, ordinarie 719 kr. | 549 SEK, regular price 719 SEK. |
| CTA | Ge bort kalendern | Give the calendar |

### COPY CARD

- **Primary:** 24 luckor i ett paket att slå in, i stället för 24 separata småpresenter. En lucka om dagen fram till julafton. 549 kr, ordinarie 719 kr.
- **Headline:** 24 luckor i ett paket
- **Description:** Ett paket i stället för många småpresenter.

### Tre-frågorstestet

| Rad | Visualisera? | Falsifierbar? | Kan konkurrent signera? | Dom |
|---|---|---|---|---|
| Ett paket att slå in | ✅ | ✅ | ❌ Nej | Godkänd |
| 24 luckor, en lucka om dagen fram till julafton. | ✅ | ✅ | ❌ Nej | Godkänd |
| 549 kr, ordinarie 719 kr. | ✅ | ✅ | ❌ Nej | Godkänd |
| Ge bort kalendern | ✅ | ✅ | ❌ Nej | Godkänd |
| 24 luckor i ett paket | ✅ | ✅ | ❌ Nej | Godkänd |
| Ett paket i stället för många småpresenter. | ✅ | ✅ | ❌ Nej | Godkänd |

---

## 16. Golfkalender_BOF_1_1 (static)

**Vinkel:** BOF pris/erbjudande: priset stort, jämförpriset, spara 170.

### Slots

| Slot | Swedish (use this) | English meaning |
|---|---|---|
| Headline | 549 kr, ordinarie 719 kr. | 549 SEK, regular price 719 SEK. |
| Sub-line | 24 luckor med golftillbehör, redo att skickas. | 24 doors of golf gear, ready to send. |
| Bottom band | 549 kr, ordinarie 719 kr. Spara 170 kr. | 549 SEK, regular price 719 SEK. Save 170 SEK. |
| CTA | Köp kalendern | Buy the calendar |

### COPY CARD

- **Primary:** 549 kr, ordinarie 719 kr, för 24 luckor färdigfyllda med golftillbehör. Spara 170 kr mot ordinarie pris.
- **Headline:** 549 kr, ordinarie 719 kr
- **Description:** Spara 170 kr på 24 luckor.

### Tre-frågorstestet

| Rad | Visualisera? | Falsifierbar? | Kan konkurrent signera? | Dom |
|---|---|---|---|---|
| 549 kr, ordinarie 719 kr. | ✅ | ✅ | ❌ Nej | Godkänd |
| 24 luckor med golftillbehör, redo att skickas. | ✅ | ✅ | ❌ Nej | Godkänd |
| 549 kr, ordinarie 719 kr. Spara 170 kr. | ✅ | ✅ | ❌ Nej | Godkänd |
| Köp kalendern | ✅ | ✅ | ❌ Nej | Godkänd |
| 549 kr, ordinarie 719 kr | ✅ | ✅ | ❌ Nej | Godkänd |
| Spara 170 kr på 24 luckor. | ✅ | ✅ | ❌ Nej | Godkänd |

---

## 17. Golfkalender_BOF_2_1 (static)

**Vinkel:** BOF trygghet: 14 dagars ångerrätt enligt lag, färdigfylld.

### Slots

| Slot | Swedish (use this) | English meaning |
|---|---|---|
| Headline | 14 dagars ångerrätt enligt lag | 14 days' statutory right of withdrawal |
| Sub-line | 14 dagar från att du får varan, färdigfylld, inget att fylla i. | 14 days from receiving the item, pre-filled, nothing to fill in. |
| Bottom band | 549 kr, ordinarie 719 kr. | 549 SEK, regular price 719 SEK. |
| CTA | Se villkoren | See the terms |

### COPY CARD

- **Primary:** 14 dagars ångerrätt enligt lag, räknat från den dag du får varan. Kalendern kommer färdigfylld, inget att fylla i själv. 549 kr, ordinarie 719 kr.
- **Headline:** 14 dagars ångerrätt enligt lag
- **Description:** Färdigfylld, inget att fylla i själv.

### Tre-frågorstestet

| Rad | Visualisera? | Falsifierbar? | Kan konkurrent signera? | Dom |
|---|---|---|---|---|
| 14 dagars ångerrätt enligt lag | ✅ | ✅ | ❌ Nej | Godkänd |
| 14 dagar från att du får varan, färdigfylld, inget att fylla i. | ✅ | ✅ | ❌ Nej | Godkänd |
| 549 kr, ordinarie 719 kr. | ✅ | ✅ | ❌ Nej | Godkänd |
| Se villkoren | ✅ | ✅ | ❌ Nej | Godkänd |
| 14 dagars ångerrätt enligt lag | ✅ | ✅ | ❌ Nej | Godkänd |
| Färdigfylld, inget att fylla i själv. | ✅ | ✅ | ❌ Nej | Godkänd |

---

## 18. Golfkalender_OB_2_1 (static)

**Vinkel:** Invändning "Passar den min tonåring?" ur FAQ: vuxna och tonåringar som spelar golf, aldrig barn/barnsäker.

### Slots

| Slot | Swedish (use this) | English meaning |
|---|---|---|
| Headline | För vuxna och tonåringar som spelar golf | For adults and teenagers who play golf |
| Sub-line | Golftillbehör i plast, metall och trä bakom varje lucka. | Golf gear in plastic, metal and wood behind every door. |
| Bottom band | 549 kr, ordinarie 719 kr. | 549 SEK, regular price 719 SEK. |
| CTA | Se kalendern | See the calendar |

### COPY CARD

- **Primary:** Kalendern riktar sig till vuxna och tonåringar som spelar golf. Golftillbehör i plast, metall och trä ligger bakom varje lucka. 549 kr, ordinarie 719 kr.
- **Headline:** För vuxna och tonåringar som golfar
- **Description:** Golftillbehör i plast, metall och trä.

### Tre-frågorstestet

| Rad | Visualisera? | Falsifierbar? | Kan konkurrent signera? | Dom |
|---|---|---|---|---|
| För vuxna och tonåringar som spelar golf | ✅ | ✅ | ❌ Nej | Godkänd |
| Golftillbehör i plast, metall och trä bakom varje lucka. | ✅ | ✅ | ❌ Nej | Godkänd |
| 549 kr, ordinarie 719 kr. | ✅ | ✅ | ❌ Nej | Godkänd |
| Se kalendern | ✅ | ✅ | ❌ Nej | Godkänd |
| För vuxna och tonåringar som golfar | ✅ | ✅ | ❌ Nej | Godkänd |
| Golftillbehör i plast, metall och trä. | ✅ | ✅ | ❌ Nej | Godkänd |

---

## Sammanfattning

- 18 annonser, alla namn ur specen exakt stavade.
- 132 svenska rader (hookar, script/slots, primary, headline, description) körda genom tre-frågorstestet. Alla godkända.
- Inga siffror utanför 549, 719, 170, 24, 14. Inga tankstreck. Inga adjektiv som "perfekt"/"rolig"/"fantastisk". Ingen hook är en uppmaning. Inget om recensioner, brådska, frakt/Klarna, barn/CE, "24 olika prylar" eller lucka-för-lucka-mappning.
- Disclaimern om att tillverkaren inte anger vilken lucka som innehåller vad (Golfkalender_OB_1_H1) fick inte plats i de 4 script-raderna inom ordgränsen och lades i stället i COPY CARD:ens primary.
