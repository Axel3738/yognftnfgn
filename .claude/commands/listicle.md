# /listicle – Bygg en advertorial-listicle för en produkt

Argument: `<produkt-id>` (från `products/products.json`), och valfritt en vinkel efter id:t.
Exempel: `/listicle motorholjet` eller `/listicle trimmerbaltet vinkeln är ryggen, inte tiden`.

**Läs `docs/os/LISTICLE-FRAMEWORK.md` först och följ den till punkt och pricka.** Den är dokumenterad
ur den enda listicle vi byggt som ligger live (`baverbutiken.se/pages/motorholje-lagerrensning`).
Frameworket är inte ett förslag — strukturen är den beprövade delen och ska inte röras.

---

## Grundregeln

**Skriv aldrig sidan från ett tomt blad.** Klona en listicle som redan konverterar och byt ut allt
innehåll, aldrig strukturen. Layout, sektionsordning, CSS, knappplacering och spacing är det som är
testat. Text och bilder är det produktspecifika.

Saknas källmall: fråga efter en `.gempages`-export och stanna där. Bygg inte en egen struktur.

---

## Kör hela kedjan utan att invänta godkännande

### 1. Samla underlaget

- Produktens rad i `products/products.json` — pris, jämförpris, LP, target- och break-even-CPA
- `products/<id>/dna.md` — **förbjudna claims, bevisade claims, Winning/Losing DNA**. Sidan får
  aldrig påstå något som DNA:t säger att vi inte kan belägga
- Butiksdata: exakta varianter, storlekar och färger som faktiskt finns
- `docs/listicle-map.md` — vilka källmallar som finns och vad de bevisat bär
- Vilken annonsvinkel sidan ska ta emot trafik från. **Annonsens löfte = sidans första mening.**
  Matchar de inte studsar trafiken

### 2. Bestäm de fem punkterna FÖRE du skriver en rad

De fem punkterna är fem invändningar som avväpnas i **fast eskalerande ordning**. Fyll rollerna:

| # | Roll | Fråga att besvara för produkten |
|---|------|--------------------------------|
| 1 | **Förnekelse** | Varför känns problemet inte akut i dag? |
| 2 | **Falsk lösning A** | Vad gör kunden redan, som inte räcker? |
| 3 | **Oåterkallelighet** | Varför går det inte att fixa i efterhand? |
| 4 | **Ackumulerad kostnad** | Varför är det varje dag, inte en dag? *(bär mest vikt — markera i rubriken)* |
| 5 | **Falsk lösning B** | Varför är det billiga alternativet sämre än inget? |

Kan du inte fylla en roll ärligt för produkten: **säg det och lämna den tom i utkastet.** Hitta inte
på ett problem för att fylla en slot.

### 3. Skriv texten

Elva slots enligt frameworket: H1 · dek · offer-strip · byline+datum · sammanfattning · punkt 1–5 ·
lösning · ärlighetssektion · riskavlastning · footer · CTA-knappar.

**Varje punkt = ett stycke, 90–130 ord**, med den inre rytmen: igenkänning → vad som faktiskt händer
(två till tre fetade nyckelord) → den falska självförklaringen → vändningen *"Men det är inte du.
Det är att …"*.

**Modellpolicy (obligatorisk):** all slutgiltig svensk text skrivs av en subagent via Agent-verktyget
med `model: "sonnet"`. Subagenten får produktens DNA, de fem punktrollerna, förbjudna claims och
formatkraven — och skriver bara text. Struktur, vinkelval och verifiering görs av huvudsessionen.

**Copy-regler som gäller varje gång:**
- **Inga tankstreck** i löptext, varken `—` eller `–`
- **Ärligt skäl till priset.** Ingen påhittad rabattsiffra, **ingen nedräkningsklocka**
- **Priset ärligt åt båda håll** — vad det kostar nu och att det går tillbaka
- **Inga kundantal, betyg eller påhittade omdömen** om inte `dna.md` säger att de är verifierade
- **Namngiven avsändare, aldrig påhittat kundvittnesmål**
- Produktclaims exakt som `dna.md` tillåter dem
- **"OBS: Detta är reklam." ligger kvar i footern.** Tas aldrig bort

### 4. Bygg sidan

Följ pipelinen i frameworket, del 3:

1. Bygg `IMG`, `M` och `LINKS` — nycklarna är **exakta strängar ur källans JSON, inklusive
   HTML-taggar och `&nbsp;`**
2. Applicera rekursivt per `pageSections[].component` (kom ihåg: `component` är en JSON-sträng i
   JSON), plus regex-säkerhetsnätet på bildernas basnamn utan `?v=`
3. Sätt `data['name']` och `data['handle']`
4. **Kör verifieringen och stanna om något är rött:** alla `M`-nycklar träffade · noll em-dash · inga
   tankstreck i textvärden · noll förekomster av källans CDN-sökväg · varje ny bild räknad ≥1 ·
   **noll förekomster av källproduktens ord**
5. Paketera tillbaka i samma zip-struktur

### 5. Polish-passet

Sex justeringar, alla obligatoriska: typsnitt (rubrik/brödtext) · knapplabel och produktlänk på varje
knapp · ta bort dubblerad hero-bild · bild under rubriken och CTA efter texten i varje punktsektion ·
egen bild i ärlighetssektionen · footer-färg. Plus profilbildens storlek och luft under alla bilder.

**Skräddarsy CTA-texten per sektion.** Samma knapp överallt är ett tecken på att passet inte kördes.

### 6. Leverera och logga

- Skicka `.gempages`-filen till managern med `SendUserFile`
- Skriv sidans handle, syfte och vilken annonsvinkel den tar emot i `products/<id>/dna.md`
- Lägg till en rad i `docs/listicle-map.md`: handle, hook, struktur, **vilka annonser som ska peka hit**
- Committa och pusha

---

## DEFINITION OF DONE (markera ✅/❌ sist)

- [ ] Källmall identifierad och klonad — ingen egenbyggd struktur
- [ ] Alla fem punktroller fyllda, eller uttryckligen redovisade som tomma
- [ ] Elva slots ifyllda, ingen borttagen, ingen tillagd
- [ ] Texten skriven av sonnet-subagent, struktur och verifiering av huvudmodellen
- [ ] Copy-reglerna kontrollerade mot `dna.md`:s förbjudna claims
- [ ] Verifieringen körd och redovisad rad för rad — inklusive **noll kvarlevor av källprodukten**
- [ ] Polish-passets sex punkter körda
- [ ] `.gempages` levererad till managern
- [ ] `dna.md` och `docs/listicle-map.md` uppdaterade, committat och pushat

---

## Fristående prompt (om du kör detta utanför repot)

> Du ska bygga en advertorial-listicle för **[PRODUKT]** genom att klona en befintlig listicle som
> redan konverterar och byta ut allt innehåll — aldrig strukturen.
>
> **Produkten:** [namn, pris, jämförpris, landningssida, exakta produktclaims, exakta varianter].
> **Köparen:** [vem, i vilken situation].
> **Förbjudet att påstå:** [lista — allt vi inte kan belägga].
> **Källmall:** [.gempages-export av sidan som ska klonas].
>
> Skriv elva slots: H1 som rymmer hela erbjudandet i en mening · en dek som ger skälet · en
> offer-strip med pris i två rader · byline med namngiven avsändare och datum · en sammanfattning ·
> **fem punkter** · en lösningssektion · en ärlighetssektion som förklarar varför priset är lågt ·
> en riskavlastning · footer med "OBS: Detta är reklam." · CTA-knappar.
>
> **De fem punkterna ska i denna ordning avväpna:** (1) förnekelse — problemet syns inte än,
> (2) den falska lösningen kunden redan använder, (3) att skadan inte går att reparera i efterhand,
> (4) att kostnaden ackumuleras varje dag — denna bär mest vikt, (5) att det billiga alternativet är
> sämre än inget.
>
> Varje punkt är **ett stycke på 90–130 ord** med rytmen: igenkänning → vad som faktiskt händer, med
> två till tre fetade nyckelord → den falska självförklaringen läsaren gör → vändningen "Men det är
> inte du. Det är att …".
>
> **Regler:** inga tankstreck i löptext. Ärligt skäl till priset, ingen påhittad rabatt, ingen
> nedräkningsklocka. Ange både nuvarande pris och att det går tillbaka. Inga kundantal, betyg eller
> påhittade omdömen. Namngiven avsändare, aldrig ett påhittat kundvittnesmål. Behåll
> "OBS: Detta är reklam." i footern.
>
> **Leverera:** de elva slotsen som exakta textblock, redo att mappas 1:1 mot källans strängar.
> Verifiera sist att inte ett enda ord från källproduktens ämnesområde finns kvar.
