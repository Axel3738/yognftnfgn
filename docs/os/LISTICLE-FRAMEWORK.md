# Listicle-frameworket — hur en advertorial byggs

Dokumenterat 2026-08-12 ur bygget av
**`baverbutiken.se/pages/motorholje-lagerrensning`** ("Motorhölje – Lagerrensning (listicle)"),
som byggdes i denna session 2026-08-04.

Det här är inte en teori. Det är exakt vad som gjordes, i ordning, med de kontroller som faktiskt
kördes. Gäller nästa produkt utan omtolkning.

---

## Grundprincipen

**Vi skriver aldrig en listicle från ett tomt blad. Vi klonar en sida som redan konverterar och byter
ut allt innehåll, aldrig strukturen.**

Layout, sektionsordning, CSS, knappplaceringar, bildproportioner och spacing är den beprövade delen.
Den rör vi inte. Texten och bilderna är den produktspecifika delen. Den byter vi 1:1.

Källan för motorhöljet var en Grillkliniken-listicle (GemPages-export, sid-id
`624267177721070326`). Kartan över vilka källsidor som finns och vilka annonser som pekar vart står
i `docs/listicle-map.md`.

**Följdregeln, från `listicle-map.md`:** *annonsens löfte = sidans första mening.* En annons är
rubriken på den listicle den pekar till. Missmatch = betald trafik som studsar.

---

## Del 1 — Den redaktionella skelettet (11 slots)

Varje slot fylls med ny text. Ingen slot tas bort, ingen läggs till.

| # | Slot | Funktion | Motorhöljets version |
|---|------|----------|----------------------|
| 1 | **H1** | Hela erbjudandet eller hela problemet i en mening | "Vi beställde in för många motorhöljen och nu får du ditt för 299 kr istället för 367 kr så länge lagret räcker" |
| 2 | **Dek** | En mening som ger skälet | "Vår senaste beställning blev större än planerat och lagret är fullpackat. Din motor, och dess andrahandsvärde, tjänar på det." |
| 3 | **Offer-strip** | Pris i två rader, ingen nedräkning | "Lagerrensning / 299 kr istället för 367 kr" |
| 4 | **Byline + datum** | Namngiven avsändare + senast uppdaterad | "Av **Anders från Bäverbutiken.**" · "Senast uppdaterad 4 augusti 2026." |
| 5 | **Sammanfattning** | Två stycken: erbjudandet rakt ut, sedan vem sidan är för | "**Sammanfattning:** … 299 kr istället för ordinarie 367 kr … Om din kåpa redan börjat blekna …" |
| 6 | **Punkt 1–5** | Rubrik + ETT stycke vardera. Se ordningen nedan | — |
| 7 | **Lösningen** | "Så vad gör [målgruppen] som lyckas?" + 2 stycken: mekanism, sedan produkt | "Så vad gör båtägarna som lyckas?" |
| 8 | **Ärlighetssektionen** | Varför priset är lågt, på riktigt | "vi köpte in för mycket … Ingen påhittad jätterabatt och ingen klocka som räknar ner." |
| 9 | **Riskavlastning** | Garantin, i första person | "Därför kan du testa helt riskfritt." |
| 10 | **Footer** | Mejl, domän, **"OBS: Detta är reklam."** | kundsupport@baverbutiken.se · Bäverbutiken.se |
| 11 | **CTA-knappar** | Produktlänk + skräddarsydd knapptext per sektion | "Se motorhöljet → 299 kr istället för 367 kr" |

### Punkternas ordning är inte godtycklig

De fem punkterna är fem **invändningar som avväpnas i eskalerande ordning**. Byt innehåll, aldrig
ordning:

| # | Roll | Motorhöljet | Grillkliniken (källan) |
|---|------|-------------|------------------------|
| 1 | **Förnekelse** — problemet syns inte än | "Din kåpa ser fin ut. Det gör den inte länge till." | "Du litar på aluminiumfolien" |
| 2 | **Falsk lösning A** — det du redan gör räcker inte | "En vaxning om året stoppar inte solen" | "Du flyr in till stekpannan" |
| 3 | **Oåterkallelighet** — det går inte att fixa i efterhand | "Glans går att bevara. Inte att polera tillbaka." | "Du grillar grönsakerna som om de vore kött" |
| 4 | **Ackumulerad kostnad** — inte en dag, varje dag | "Värdet försvinner inte på en dag. Det försvinner varje dag." | "Du står och vänder varje bit för hand" |
| 5 | **Falsk lösning B** — det billiga alternativet är sämre än inget | "Ett billigt hölje är dyrare än inget" | "Du köper en billig korg och hoppas" |

Punkt 4 bär mest vikt och märks i rubriken: *"(det här missar nästan alla)"*.

### Styckets form

Varje punkt är **ett** stycke, cirka 90–130 ord, och följer samma inre rytm:

1. Igenkänning — den konkreta situationen läsaren står i
2. Vad som faktiskt händer, med **två till tre fetade nyckelord** mitt i meningen
3. Den falska självförklaringen: *"Sen tänker du att du nog bara är dålig på att polera."*
4. Vändningen: *"Men det är inte du. Det är att …"*

Punkt 3 och 4 är hela mekaniken. De flyttar skulden från läsaren till problemet, vilket är det som
gör att sidan inte känns anklagande.

---

## Del 2 — Copy-reglerna som gällde

- **Inga tankstreck.** Varken `—` eller `–` i löptext. Kontrolleras maskinellt i bygget.
- **Ärligt skäl till priset.** Överlagret är skälet. Ingen påhittad rabattsiffra, **ingen
  nedräkningsklocka**, inget "innan lagret tar slut". Enda tillåtna brådskefrasen:
  **"så länge lagret räcker"**.
- **Priset ärligt åt båda håll.** Sidan säger både vad det kostar nu och att det går tillbaka:
  *"367 kr är vad höljet kostar hos oss i vanliga fall. När partiet är slut går det tillbaka dit."*
- **Inga kundantal, inga betyg, inga påhittade omdömen.** Vi har noll verifierade recensioner.
- **Namngiven avsändare, aldrig påhittad kund.** "Anders från Bäverbutiken" är avsändaren, inte ett
  vittnesmål.
- **Produktclaims exakt:** 420D Oxfordtyg · vattenavvisande (aldrig vattentät) · universell passform
  (aldrig formsytt) · 6–250 hk · 30 dagars nöjd-kund-garanti.
- **"OBS: Detta är reklam."** ligger kvar i footern. Den tas aldrig bort.

---

## Del 3 — Byggpipelinen (teknisk)

Källfilen är en **GemPages-export**, `.gempages`, som är en zip med denna struktur:

```
Namn.gempages
├── <sid-id>.zip        →  <sid-id>.json     ← själva sidan
├── image_urls.txt
├── manifest.json
└── pages_info.zip      →  pages_info.json
```

Sidans JSON har `pageSections[]`, och **varje sektions `component` är i sin tur en JSON-sträng**.
Det är därför bytet måste göras i två lager: parsa sektionen, byt i trädet, serialisera tillbaka.

### Steg 1 — Bygg tre kartor

```python
IMG   = { gammal_bild_url: ny_bild_url, ... }      # 8 bilder för motorhöljet
M     = { exakt_gammal_textsträng: ny_textsträng, ... }   # ~20 block
LINKS = { gammal_produktlänk: ny_produktlänk, gammal_knapplabel: ny_knapplabel }
```

Nycklarna måste vara **exakta strängar ur källans JSON, inklusive HTML-taggar och `&nbsp;`**.
Det är därför bytet blir 1:1 och inget formaterande går sönder.

### Steg 2 — Applicera rekursivt

Gå igenom varje sektions träd. För varje strängvärde: slå upp i `M`, sedan `LINKS`, sedan
substräng-ersätt varje URL i `IMG`. Efteråt körs ett **säkerhetsnät med regex på bildernas basnamn**
utan `?v=`-query, eftersom samma bild kan förekomma med olika versionsparameter.

### Steg 3 — Sätt identitet

```python
data['name']   = 'Motorhölje – Lagerrensning (listicle)'
data['handle'] = 'motorholje-lagerrensning'
```

### Steg 4 — Verifiera innan paketering

Bygget skriver ut och **stoppar om något av detta är fel**:

| Kontroll | Krav |
|---|---|
| `texter ersatta` / `missade` | Varje nyckel i `M` måste ha träffat minst en gång. `MISSED:` = källsträngen stämmer inte |
| Em-dash `—` | 0 |
| Tankstreck i textvärden | INGA |
| Gamla CDN-sökvägen | 0 förekomster |
| Nya bilder | Varje ny bild måste räknas ≥1 |
| **Källproduktens ord** | `grill`, `korg`, `folie`, `kött`, `grönsak`, `Grillkliniken` = 0. En enda kvarleva avslöjar hela sidan |

### Steg 5 — Paketera tillbaka

Samma zip-struktur, `ZIP_STORED` ytterst och `ZIP_DEFLATED` för den inre. `manifest.json` uppdateras
med antalet bilder. Filen importeras sedan i GemPages.

---

## Del 4 — Polish-passet (efter importen)

Det första bygget ger rätt text i rätt struktur. Sedan kördes **sex separata justeringar** — de är
en del av frameworket, inte efterarbete:

1. **Typsnitt:** Anton på alla rubriker, Inter på all brödtext.
2. **Knappar:** rätt synlig label och rätt produktlänk på varje knapp.
3. **Hero:** ta bort dubblerad produktbild.
4. **Punktsektionerna:** bild **under** rubriken, CTA **efter** texten — i varje punkt.
5. **Ärlighetssektionen:** egen bild.
6. **Footer:** orange → vit.

Plus två finpass: profilbilden höjddriven i stället för breddstyrd, och luft under alla bilder i
artikeln.

**CTA-texten skräddarsyddes per sektion** i stället för att vara samma knapp överallt.

---

## Del 5 — Vad som ska mätas

Sidan är ett led i funneln, inte en annons. Läs den mot produktsidan:

- **Klick → köp** från annonser som pekar hit, mot samma annonser som pekar på produktsidan
- **Vilka annonser som ska peka hit:** de som bär överlager-/rea-med-skäl-vinkeln. För motorhöljet
  är det SO-blocket
- Ingen dom under samma grind som annonser: **300 kr spend och 3 köp** på den trafik som skickats hit

---

## Kända begränsningar

- **Ingen A/B mellan listicle och produktsida har körts.** Att sidan finns betyder inte att den
  slår produktsidan. Det är fortfarande otestat för motorhöljet.
- **`docs/listicle-map.md` beskriver Grillkliniken**, inte Bäverbutiken. Den är källkartan över
  mallar, inte en karta över våra sidor.
